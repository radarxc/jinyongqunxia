#!/usr/bin/env python3
"""
天书录 · 单任务执行助手（给"监督代理"用）

run.py 是全自动调度器；本脚本把同一套机制拆成可单独调用的步骤，由监督代理（本机 Claude Code
子代理）逐步调用，并自行判断日志、决定续作或换模型。与 run.py 共用任务图（tasks.json）、
提示词渲染、校验与提交逻辑；不做依赖调度，也不阻塞等待代理结束。

    python tools/agents/step.py start  <ID> [--model M] [--effort E] [--search] [--note FILE]
        建工作区（.agents/wt/<ID>，不存在时从当前分支 HEAD 建）、渲染提示词、探测模型应答（无响应自动换备用模型）、后台启动
        `traex exec`，立即返回。工作区已存在（续作）时自动附上上次失败原因。
    python tools/agents/step.py wait   <ID> [--max-min 25]
        等待本次运行结束：结束打印 FINISHED 与退出码、日志末尾、最后消息；超过 --max-min 打印
        RUNNING（退出码 3），可反复调用；日志超过 --stall-min（默认 20）分钟无增长打印 STALLED（退出码 4）。
    python tools/agents/step.py finish <ID> [--no-commit]
        校验产出（与 run.py 相同规则）。通过：只提交声明范围内的文件（带 Agent-Task 尾注），打印
        SHA；不通过：打印问题并写入 .agents/logs/<ID>/last_failure.md，退出码 1。
    python tools/agents/step.py merge  <ID> [--keep]
        把工作区提交 cherry-pick 到主检出的当前分支（文件锁串行化），成功后删除工作区。
    python tools/agents/step.py kill   <ID>        终止本次运行（整个进程组）。
    python tools/agents/step.py status <ID>        打印工作区、运行次数、日志与失败原因。
    python tools/agents/step.py smoke  [--model M] [--effort E]   用极小提示词验证启动链路。
"""
from __future__ import annotations

import argparse
import datetime as _dt
import fcntl
import json
import os
import shlex
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import run as R  # noqa: E402  复用 run.py

DEFAULT_MODEL = "GPT-6-Astra"
DEFAULT_EFFORT = "max"


def now_s() -> str:
    return _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def load(tid: str):
    root = R.repo_root()
    g = R.Graph()
    if tid not in g.tasks:
        raise R.Fatal(f"没有任务 {tid}")
    t = g[tid]
    if t.is_gate:
        raise R.Fatal(f"{tid} 是作者闸门，不发给代理；请用 `python tools/agents/run.py approve {tid}`")
    st = R.State(root / ".agents" / "state.json")
    return root, g, t, st


def logdir(root: Path, tid: str) -> Path:
    return root / ".agents" / "logs" / tid


def current(root: Path, tid: str) -> dict | None:
    f = logdir(root, tid) / "current.json"
    if not f.exists():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except ValueError:
        return None


def pid_alive(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        return True


def is_running(root: Path, tid: str) -> bool:
    cur = current(root, tid)
    return bool(cur) and not Path(cur["exit"]).exists() and pid_alive(int(cur["pid"]))


def find_bin(explicit: str | None, defaults: dict) -> str:
    cands = [explicit] if explicit else []
    cands += [os.environ.get("TRAEX_BIN") or ""]
    cands += list(defaults.get("bin", ["traex", "traecli"]))
    for c in cands:
        if not c:
            continue
        found = R.shutil.which(c)
        if found:
            return found
    raise R.Fatal("找不到 traex / traecli，请确认已安装并在 PATH 中（或设置 TRAEX_BIN）")


def build_argv(binary: str, model: str, effort: str, wt: Path, last: Path, search: bool, extra: list | None = None) -> list:
    argv = [binary, "exec", "-m", model, "-s", "workspace-write", "--skip-git-repo-check",
            "-C", str(wt), "-o", str(last)]
    if effort:
        argv += ["-c", f'model_reasoning_effort="{effort}"']
    if search:
        argv += ["--search"]
    argv += list(extra or [])
    return argv + ["-"]  # 提示词经标准输入传入


WRAPPER = '"$@" < "$TS_PROMPT" >> "$TS_LOG" 2>&1; rc=$?; echo "$rc" > "$TS_EXIT"; exit $rc'
FALLBACK_MODELS = ["GPT-5.6-Sol"]


def probe_model(binary: str, model: str, effort: str, timeout_s: int = 90) -> bool:
    """用极小提示词探测模型是否在 timeout_s 内应答（GPT-6-Astra 曾出现整段时间无响应）。"""
    with tempfile.TemporaryDirectory(prefix="tianshu-probe-") as d:
        argv = build_argv(binary, model, effort, Path(d), Path(d) / "last.md", False)
        try:
            p = subprocess.run(argv, input=R.PREFLIGHT_PROMPT, cwd=d, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=timeout_s, start_new_session=True)
        except subprocess.TimeoutExpired:
            return False
        except OSError:
            return False
        return p.returncode == 0 and R.PREFLIGHT_ANSWER in (p.stdout or "") + (p.stderr or "")


def launch(argv: list, prompt_file: Path, log: Path, exit_file: Path, cwd: Path, extra_env: dict) -> int:
    """后台启动：独立进程组，标准输出/错误追加到 log，结束后把退出码写到 exit_file。"""
    env = {**os.environ, **extra_env, "TS_PROMPT": str(prompt_file), "TS_LOG": str(log), "TS_EXIT": str(exit_file)}
    proc = subprocess.Popen(["/bin/sh", "-c", WRAPPER, "traex-wrapper", *argv], cwd=str(cwd), env=env,
                            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                            start_new_session=True)
    return proc.pid


def tail(path: Path, n: int = 40, drop_hooks: bool = True) -> str:
    if not path.exists():
        return "（无）"
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    if drop_hooks:
        lines = [ln for ln in lines if not ln.startswith("hook: ")]
    return "\n".join(lines[-n:])


# ---------------------------------------------------------------- start

def cmd_start(a) -> int:
    root, g, t, st = load(a.id)
    if is_running(root, t.id):
        raise R.Fatal(f"{t.id} 已有运行中的进程（见 status）；先 wait 或 kill")
    if t.id in R.done_tasks(root):
        print(f"⚠ {t.id} 在当前分支历史中已带 Agent-Task 尾注（已完成）。如要重跑请先确认。")
        if not a.force:
            return 0
    wt = R.wt_path(root, t.id)
    s = st.get(t.id)
    note = Path(a.note).read_text(encoding="utf-8").strip() if a.note else None
    if R.wt_exists(wt) and s.get("base"):
        if R.head_has_trailer(wt, t.id):
            print(f"{t.id} 的工作区已提交（{R.git(['rev-parse', 'HEAD'], wt).stdout.strip()[:12]}），直接 merge 即可")
            return 0
        base = s["base"]
        failure = note or s.get("last_failure") or "上一次运行被中断（未产生退出码）。"
        print(f"… 在保留的工作区中续作（基点 {base[:12]}）")
    else:
        if wt.exists():
            R.wt_remove(root, wt)
        if not R.main_is_clean(root):
            print("⚠ 主检出有未提交的改动；工作区仍从 HEAD 创建，但 merge 前需要清理")
        wt.parent.mkdir(parents=True, exist_ok=True)
        R.git(["worktree", "add", "--detach", str(wt), "HEAD"], root)
        base = R.git(["rev-parse", "HEAD"], wt).stdout.strip()
        st.update(t.id, base=base, attempts=0, last_failure=None)
        failure = note
    attempt = int(st.get(t.id).get("attempts", 0)) + 1
    st.update(t.id, attempts=attempt)
    prompt = R.render_prompt(t, attempt, failure)

    ld = logdir(root, t.id)
    ld.mkdir(parents=True, exist_ok=True)
    pf, logf, exitf, lastf = (ld / f"{attempt}.prompt.md", ld / f"{attempt}.log",
                              ld / f"{attempt}.exit", ld / f"{attempt}.last.md")
    pf.write_text(prompt, encoding="utf-8")
    for f in (exitf, lastf):
        if f.exists():
            f.unlink()
    model = a.model or os.environ.get("TRAEX_MODEL") or g.defaults.get("model") or DEFAULT_MODEL
    effort = a.effort if a.effort is not None else (os.environ.get("TRAEX_EFFORT") or g.defaults.get("effort") or DEFAULT_EFFORT)
    binary = find_bin(a.bin, g.defaults)
    if not a.no_probe:
        for cand in [model] + [m for m in FALLBACK_MODELS if m != model]:
            print(f"… 探测模型 {cand}（≤ {a.probe_sec:g} 秒）", flush=True)
            if probe_model(binary, cand, effort, int(a.probe_sec)):
                if cand != model:
                    print(f"⚠ {model} 无响应，改用 {cand}")
                model = cand
                break
        else:
            raise R.Fatal("所有候选模型都无响应（探测超时），请稍后再试或用 --no-probe 强制启动")
    argv = build_argv(binary, model, effort, wt, lastf, t.web or a.search, t.agent_args)
    logf.write_text(f"# {t.id} · {t.title}\n# 开始：{now_s()}\n# 命令：{shlex.join(argv)} < {pf}\n"
                    f"# 工作区：{wt}\n# 基点：{base}\n\n", encoding="utf-8")
    pid = launch(argv, pf, logf, exitf, wt, {"TIANSHU_TASK_ID": t.id})
    (ld / "current.json").write_text(json.dumps({
        "attempt": attempt, "pid": pid, "model": model, "effort": effort, "started": now_s(),
        "prompt": str(pf), "log": str(logf), "exit": str(exitf), "last": str(lastf), "wt": str(wt), "base": base,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"▶ {t.id} 第 {attempt} 次运行已启动（pid {pid}，模型 {model}，推理强度 {effort or '默认'}，"
          f"联网搜索 {'开' if (t.web or a.search) else '关'}）\n  工作区：{wt}\n  提示词：{pf}\n  日志：{logf}\n"
          f"  下一步：python tools/agents/step.py wait {t.id}")
    return 0


# ---------------------------------------------------------------- wait

def cmd_wait(a) -> int:
    root, g, t, st = load(a.id)
    cur = current(root, t.id)
    if not cur:
        raise R.Fatal(f"{t.id} 没有启动记录，请先 start")
    logf, exitf, lastf = Path(cur["log"]), Path(cur["exit"]), Path(cur["last"])
    started = time.time()
    deadline = started + a.max_min * 60
    last_beat = started
    t0 = _dt.datetime.strptime(cur["started"], "%Y-%m-%d %H:%M:%S")
    # 停滞检测：日志（含代理的推理摘要与工具调用）超过 --stall-min 分钟不增长，视为流式响应挂死
    stall_size = logf.stat().st_size if logf.exists() else 0
    stall_since = logf.stat().st_mtime if logf.exists() else started
    while True:
        if logf.exists():
            sz = logf.stat().st_size
            if sz != stall_size:
                stall_size, stall_since = sz, time.time()
            elif a.stall_min > 0 and time.time() - stall_since >= a.stall_min * 60 and not exitf.exists():
                idle = (time.time() - stall_since) / 60
                mins = (_dt.datetime.now() - t0).total_seconds() / 60
                print(f"STALLED {t.id}：日志已 {idle:.0f} 分钟无增长（{sz / 1024:.0f} KB，已运行 {mins:.0f} 分钟）。"
                      f"建议：python tools/agents/step.py kill {t.id} 后重新 start（可换模型 / 推理强度）")
                return 4
        if exitf.exists():
            rc = exitf.read_text().strip()
            mins = (_dt.datetime.now() - t0).total_seconds() / 60
            print(f"FINISHED {t.id} 第 {cur['attempt']} 次运行：退出码 {rc}，耗时 {mins:.0f} 分钟，日志 {logf}")
            print("---- 日志末尾 ----")
            print(tail(logf, a.tail))
            print("---- 代理最后消息 ----")
            print(tail(lastf, 60, drop_hooks=False) if lastf.exists() else "（无 -o 输出）")
            print(f"下一步：python tools/agents/step.py finish {t.id}")
            return 0 if rc == "0" else 1
        if not pid_alive(int(cur["pid"])):
            print(f"EXITED-NO-CODE {t.id}：进程已不在但没有退出码（可能被 kill）。日志 {logf}")
            print(tail(logf, a.tail))
            return 2
        if time.time() >= deadline:
            mins = (_dt.datetime.now() - t0).total_seconds() / 60
            size = logf.stat().st_size if logf.exists() else 0
            print(f"RUNNING {t.id}：已运行 {mins:.0f} 分钟，日志 {size / 1024:.0f} KB。最后一行：{tail(logf, 1)[:200]}")
            print(f"再次等待：python tools/agents/step.py wait {t.id}")
            return 3
        if time.time() - last_beat >= 300:
            last_beat = time.time()
            size = logf.stat().st_size if logf.exists() else 0
            mins = (_dt.datetime.now() - t0).total_seconds() / 60
            print(f"… {t.id} 运行中 {mins:.0f} 分钟，日志 {size / 1024:.0f} KB：{tail(logf, 1)[:160]}", flush=True)
        time.sleep(20)


# ---------------------------------------------------------------- finish

def cmd_finish(a) -> int:
    root, g, t, st = load(a.id)
    if is_running(root, t.id):
        raise R.Fatal(f"{t.id} 仍在运行，请先 wait")
    wt = R.wt_path(root, t.id)
    s = st.get(t.id)
    if not (R.wt_exists(wt) and s.get("base")):
        raise R.Fatal(f"{t.id} 没有工作区，请先 start")
    if R.head_has_trailer(wt, t.id):
        print(f"{t.id} 已提交：{R.git(['rev-parse', 'HEAD'], wt).stdout.strip()}，可直接 merge")
        return 0
    base = s["base"]
    cfg = R.Config(argparse.Namespace(), g.defaults)
    problems = []
    cur = current(root, t.id)
    if cur and Path(cur["exit"]).exists():
        rc = Path(cur["exit"]).read_text().strip()
        if rc != "0":
            problems.append(f"代理进程退出码 {rc}（见 {cur['log']}）")
    problems += R.validate(t, wt, R.baseline_lines(wt, t, base), cfg)
    files = R.changed_files(wt, base)
    allowed = [f for f in files if R.matches_any(f, t.all_writes)]
    discarded = [f for f in files if f not in allowed]
    if not problems and not allowed:
        problems.append("没有任何声明范围内的产出")
    if problems:
        failure = "\n".join(f"- {p}" for p in problems)
        st.update(t.id, last_failure=failure)
        ld = logdir(root, t.id)
        ld.mkdir(parents=True, exist_ok=True)
        (ld / "last_failure.md").write_text(failure + "\n", encoding="utf-8")
        print(f"✘ {t.id} 校验未通过（已记录到 {ld / 'last_failure.md'}，下次 start 会自动附上）：\n{failure}")
        if discarded:
            print("（范围外改动，提交时会丢弃）：" + "、".join(discarded))
        return 1
    print(f"✔ {t.id} 校验通过。范围内文件 {len(allowed)} 个：" + "、".join(allowed))
    if discarded:
        print("⚠ 范围外改动将被丢弃：" + "、".join(discarded))
    if a.no_commit:
        return 0
    R.git(["reset", "-q", "--mixed", base], wt)
    R.git(["add", "-A", "--", *allowed], wt)
    body = f"变更文件：{len(allowed)}；运行次数：{s.get('attempts', 1)}"
    if discarded:
        body += "\n已丢弃未声明的改动：" + "、".join(discarded)
    R.git(["commit", "-q", "--no-verify", "-m", f"agents({t.id}): {t.title}", "-m", body,
           "-m", f"{R.TRAILER}: {t.id}"], wt)
    sha = R.git(["rev-parse", "HEAD"], wt).stdout.strip()
    st.update(t.id, last_failure=None, sha=sha)
    print(f"✔ 已在工作区提交 {sha[:12]}。下一步：python tools/agents/step.py merge {t.id}")
    return 0


# ---------------------------------------------------------------- merge

def cmd_merge(a) -> int:
    root, g, t, st = load(a.id)
    wt = R.wt_path(root, t.id)
    if t.id in R.done_tasks(root):
        print(f"{t.id} 已在当前分支中（Agent-Task 尾注存在）")
        if R.wt_exists(wt) and not a.keep:
            R.wt_remove(root, wt)
        return 0
    if not R.wt_exists(wt) or not R.head_has_trailer(wt, t.id):
        raise R.Fatal(f"{t.id} 的工作区还没有带尾注的提交，请先 finish")
    sha = R.git(["rev-parse", "HEAD"], wt).stdout.strip()
    lock = root / ".agents" / "merge.lock"
    lock.parent.mkdir(parents=True, exist_ok=True)
    with open(lock, "w") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        if not R.main_is_clean(root):
            raise R.Fatal("主检出有未提交的改动，无法 cherry-pick；请先提交或暂存（工作区已保留，稍后重试 merge 即可）")
        p = None
        for delay in (0, 3, 6, 12, 24):
            time.sleep(delay)
            p = R.git(["cherry-pick", sha], root, check=False)
            if p.returncode == 0:
                break
            if "index.lock" not in (p.stderr + p.stdout):
                break
        if p is None or p.returncode != 0:
            R.git(["cherry-pick", "--abort"], root, check=False)
            raise R.Fatal(f"cherry-pick 失败：{(p.stderr or p.stdout).strip()[:400] if p else '未知'}")
        head = R.git(["rev-parse", "HEAD"], root).stdout.strip()
    print(f"✔ {t.id} 已合入 {R.current_branch(root) or 'HEAD'}：{head[:12]}（来自工作区 {sha[:12]}）")
    if not a.keep:
        R.wt_remove(root, wt)
        print("  工作区已清理")
    return 0


# ---------------------------------------------------------------- kill / status / smoke

def cmd_kill(a) -> int:
    root, g, t, st = load(a.id)
    cur = current(root, t.id)
    if not cur or not pid_alive(int(cur["pid"])):
        print(f"{t.id} 没有运行中的进程")
        return 0
    pid = int(cur["pid"])
    try:
        os.killpg(pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    for _ in range(20):
        if not pid_alive(pid):
            break
        time.sleep(0.5)
    else:
        try:
            os.killpg(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    st.update(t.id, last_failure=f"第 {cur['attempt']} 次运行被监督代理终止（超时或无进展）。")
    print(f"已终止 {t.id} 第 {cur['attempt']} 次运行（pid {pid}）")
    return 0


def cmd_status(a) -> int:
    root, g, t, st = load(a.id)
    wt = R.wt_path(root, t.id)
    s = st.get(t.id)
    cur = current(root, t.id)
    print(f"{t.id} · {t.title}\n  kind={t.kind} wave={t.wave} web={t.web} deps={t.deps}\n  writes={t.all_writes}")
    print(f"  完成（分支历史）：{t.id in R.done_tasks(root)}")
    print(f"  工作区：{wt}（{'存在' if R.wt_exists(wt) else '无'}）；基点：{s.get('base', '—')}；运行次数：{s.get('attempts', 0)}")
    if cur:
        state = "运行中" if is_running(root, t.id) else ("已结束，退出码 " + Path(cur["exit"]).read_text().strip()
                                                         if Path(cur["exit"]).exists() else "已消失（无退出码）")
        print(f"  当前运行：第 {cur['attempt']} 次，{state}，模型 {cur['model']}，开始 {cur['started']}\n  日志：{cur['log']}")
    if s.get("last_failure"):
        print("  上次失败原因：\n" + s["last_failure"])
    if R.wt_exists(wt):
        print(f"  工作区已提交尾注：{R.head_has_trailer(wt, t.id)}")
    return 0


def cmd_smoke(a) -> int:
    g = R.Graph()
    binary = find_bin(a.bin, g.defaults)
    model = a.model or DEFAULT_MODEL
    effort = a.effort if a.effort is not None else DEFAULT_EFFORT
    with tempfile.TemporaryDirectory(prefix="tianshu-smoke-") as d:
        d = Path(d)
        pf, logf, exitf, lastf = d / "p.md", d / "run.log", d / "run.exit", d / "last.md"
        pf.write_text(R.PREFLIGHT_PROMPT, encoding="utf-8")
        logf.write_text("")
        argv = build_argv(binary, model, effort, d, lastf, False)
        print("命令：" + shlex.join(argv) + f" < {pf}")
        launch(argv, pf, logf, exitf, d, {})
        for _ in range(60):
            if exitf.exists():
                break
            time.sleep(5)
        else:
            print("✘ 300 秒内未结束")
            return 1
        out = logf.read_text(encoding="utf-8", errors="replace")
        ok = exitf.read_text().strip() == "0" and R.PREFLIGHT_ANSWER in out
        print(("✔ 通过" if ok else "✘ 失败") + f"（退出码 {exitf.read_text().strip()}）\n" + tail(logf, 12))
        return 0 if ok else 1


def build_parser():
    ap = argparse.ArgumentParser(description="天书录单任务执行助手")
    sub = ap.add_subparsers(dest="cmd", required=True)

    def model_opts(p):
        p.add_argument("--model", help=f"模型名（默认 tasks.json 或 {DEFAULT_MODEL}；环境变量 TRAEX_MODEL）")
        p.add_argument("--effort", help=f"推理强度 none/minimal/low/medium/high/xhigh/max/ultra（默认 {DEFAULT_EFFORT}）")
        p.add_argument("--bin", help="traex 可执行文件路径")

    p = sub.add_parser("start", help="建工作区、渲染提示词并后台启动 traex")
    p.add_argument("id")
    model_opts(p)
    p.add_argument("--search", action="store_true", help="开启联网搜索（web 任务自动开启）")
    p.add_argument("--note", help="续作说明文件（附在提示词末尾；默认用上次校验失败原因）")
    p.add_argument("--force", action="store_true", help="任务已在分支历史中完成时仍启动")
    p.add_argument("--no-probe", action="store_true", help="启动前不探测模型是否应答（默认探测，无响应时自动换备用模型）")
    p.add_argument("--probe-sec", type=float, default=90, help="探测超时秒数（默认 90）")
    p.set_defaults(func=cmd_start)

    p = sub.add_parser("wait", help="等待本次运行结束")
    p.add_argument("id")
    p.add_argument("--max-min", type=float, default=25, help="最多等待分钟数（默认 25；到时打印 RUNNING，退出码 3）")
    p.add_argument("--tail", type=int, default=40, help="结束时打印日志末尾行数")
    p.add_argument("--stall-min", type=float, default=20, help="日志无增长超过该分钟数即返回 STALLED（退出码 4）；0 关闭")
    p.set_defaults(func=cmd_wait)

    p = sub.add_parser("finish", help="校验并在工作区提交")
    p.add_argument("id")
    p.add_argument("--no-commit", action="store_true")
    p.set_defaults(func=cmd_finish)

    p = sub.add_parser("merge", help="cherry-pick 到当前分支并清理工作区")
    p.add_argument("id")
    p.add_argument("--keep", action="store_true", help="保留工作区")
    p.set_defaults(func=cmd_merge)

    p = sub.add_parser("kill", help="终止运行中的代理")
    p.add_argument("id")
    p.set_defaults(func=cmd_kill)

    p = sub.add_parser("status", help="查看任务状态")
    p.add_argument("id")
    p.set_defaults(func=cmd_status)

    p = sub.add_parser("smoke", help="用极小提示词验证启动链路")
    model_opts(p)
    p.set_defaults(func=cmd_smoke)
    return ap


def main(argv=None) -> int:
    for s in (sys.stdout, sys.stderr):
        try:
            s.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except R.Fatal as e:
        print(f"错误：{e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
