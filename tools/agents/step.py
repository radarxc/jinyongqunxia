#!/usr/bin/env python3
"""
天书录 · 单任务执行助手（给"监督代理"用）

run.py 是全自动调度器；本脚本把同一套机制拆成可单独调用的步骤，由监督代理（本机 Claude Code
子代理）逐步调用，并自行判断日志、决定续作或换模型。与 run.py 共用任务图（tasks.json）、
提示词渲染、校验与提交逻辑；不做依赖调度，也不阻塞等待代理结束。

    python tools/agents/step.py start  <ID> [--model M] [--effort E] [--search] [--note FILE|TEXT]
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
import re
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

DEFAULT_MODEL = "GPT-6-Astra"  # 作者 2026-10-01：「调用 traex-cli（GPT 6 astra max，如果没有就 5.6-sol max）」——默认 Astra，启动探测不应答自动回退 FALLBACK_MODELS
DEFAULT_EFFORT = "max"  # 执行默认 ultra；审核默认 xhigh（作者 2026-09-30："gpt 6 astra ultra 和 extra high"）
CODEX_BIN = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"


def now_s() -> str:
    return _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


class LockedState(R.State):
    """多个监督代理并行运行时共用 state.json：每次 get/update 都在文件锁内重新读盘再写回，
    避免 run.py 的 State（进程内缓存 + 整文件改写）在跨进程场景下丢失更新。"""

    def _lock_path(self) -> Path:
        return self.path.with_suffix(".lock")

    def _reload(self) -> None:
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except ValueError:
                self.data = {}

    def get(self, tid: str) -> dict:
        self._lock_path().parent.mkdir(parents=True, exist_ok=True)
        with open(self._lock_path(), "w") as lf:
            fcntl.flock(lf, fcntl.LOCK_SH)
            self._reload()
            return dict(self.data.get(tid, {}))

    def update(self, tid: str, **kw) -> None:
        self._lock_path().parent.mkdir(parents=True, exist_ok=True)
        with open(self._lock_path(), "w") as lf:
            fcntl.flock(lf, fcntl.LOCK_EX)
            self._reload()
            self.data.setdefault(tid, {}).update(kw)
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=1), encoding="utf-8")
            os.replace(tmp, self.path)


def load(tid: str):
    root = R.repo_root()
    g = R.Graph()
    if tid not in g.tasks:
        raise R.Fatal(f"没有任务 {tid}")
    t = g[tid]
    if t.is_gate:
        raise R.Fatal(f"{tid} 是作者闸门，不发给代理；请用 `python tools/agents/run.py approve {tid}`")
    st = LockedState(root / ".agents" / "state.json")
    return root, g, t, st


def recover_state(root: Path, t, st) -> dict:
    """state.json 条目丢失但工作区仍在：从工作区与 current.json 恢复基点，绝不删除有产出的工作区。"""
    wt = R.wt_path(root, t.id)
    s = st.get(t.id)
    if s.get("base") or not R.wt_exists(wt):
        return s
    cur = current(root, t.id) or {}
    base = cur.get("base") or R.git(["rev-parse", "HEAD"], wt).stdout.strip()
    attempts = int(cur.get("attempt", 1))
    st.update(t.id, base=base, attempts=attempts, last_failure=s.get("last_failure"))
    print(f"⚠ {t.id} 的 state.json 条目曾丢失，已从工作区恢复（基点 {base[:12]}，运行次数 {attempts}）")
    return st.get(t.id)


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


# ---------------------------------------------------------------- 并发上限（按池）
# 文档类任务与素材类任务（ID 以 ART 开头）各自一池；上限可在 tasks.json defaults.max_parallel
# 或环境变量 TIANSHU_MAX_PARALLEL_<POOL> 中调整。start 在文件锁内计数，满了就排队等空位。
POOL_CAPS_DEFAULT = {"docs": 8, "assets": 8, "code": 3}


ASSET_PREFIXES = ("ART", "TOWN", "VFX", "SKILL", "KIT", "CITY")  # 素材线（作者 2026-09-30：优先把 assets 任务跑完）单独一池，不和文档任务抢位


CODE_PREFIXES = ("ENG", "TOOL")  # 游戏工程（作者 2026-09-30 AR-19）：写代码、装依赖，单独一池


def pool_of(tid: str) -> str:
    if tid.upper().startswith("ART-P-"):  # 人物立绘提示词（只写文本，不出图）：单独一池，不挤占出图任务
        return "prompts"
    if tid.upper().startswith(CODE_PREFIXES):
        return "code"
    return "assets" if tid.upper().startswith(ASSET_PREFIXES) else "docs"


# 2026-10-01：任务工作区曾是全量检出（素材图约 2 GB / 个），同时开 20 个就把磁盘写满。文档 / 代码 / 提示词池的任务
# 不需要图片目录，改为稀疏检出（只排除下面这些图片目录）；素材池任务仍全量。任务可用 "full_checkout": true 强制全量。
SPARSE_EXCLUDE_DIRS = ("assets/default/baseline", "assets/default/building-map", "assets/default/tile", "assets/default/vfx")


def sparse_checkout_for(t) -> list | None:
    if getattr(t, "full_checkout", False) or pool_of(t.id) == "assets":
        return None
    if any(w.startswith(d) for w in t.writes for d in SPARSE_EXCLUDE_DIRS):
        return None
    return ["/*"] + [f"!/{d}/" for d in SPARSE_EXCLUDE_DIRS]


def apply_sparse(wt: Path, patterns: list, ref: str) -> None:
    p = R.git(["sparse-checkout", "set", "--no-cone", *patterns], wt, check=False)
    if p.returncode != 0:  # 旧版 git 没有 --no-cone：init（默认非 cone）后 set
        R.git(["sparse-checkout", "init"], wt)
        R.git(["sparse-checkout", "set", *patterns], wt)
    R.git(["checkout", "--detach", ref], wt)


def pool_cap(g, pool: str) -> int:
    env = os.environ.get(f"TIANSHU_MAX_PARALLEL_{pool.upper()}")
    if env:
        return int(env)
    caps = g.defaults.get("max_parallel") or {}
    return int(caps.get(pool, POOL_CAPS_DEFAULT.get(pool, 8)))


def running_in_pool(root: Path, pool: str, exclude: str | None = None) -> list:
    base = root / ".agents" / "logs"
    if not base.is_dir():
        return []
    return sorted(d.name for d in base.iterdir()
                  if d.is_dir() and d.name != exclude and pool_of(d.name) == pool and is_running(root, d.name))


def find_bin(explicit: str | None, defaults: dict) -> str:
    """执行器：作者 2026-09-30 「gpt额度没有了，用traex cli调用 gpt6 max吧」——默认 traex / traecli；Codex 只作最后备选。"""
    cands = [explicit] if explicit else []
    cands += [os.environ.get("TRAEX_BIN") or "", os.environ.get("CODEX_BIN") or ""]
    cands += list(defaults.get("bin", ["traex", "traecli"])) + ["traex", "traecli", CODEX_BIN]
    for c in cands:
        if not c:
            continue
        found = R.shutil.which(c)
        if found:
            return found
    raise R.Fatal("找不到 traex / traecli（或 Codex），请确认 TraeX CLI 已安装并在 PATH 中（或用 --bin / 环境变量 TRAEX_BIN 指定）")


def build_argv(binary: str, model: str, effort: str, wt: Path, last: Path, search: bool, extra: list | None = None) -> list:
    argv = [binary, "exec", "-m", model, "-s", "workspace-write", "--skip-git-repo-check",
            "-C", str(wt), "-o", str(last)]
    if effort:
        argv += ["-c", f'model_reasoning_effort="{effort}"']
    # 注：`--search` 只是交互式 CLI 的参数，`exec` 不接受；exec 下模型自带 web_search 工具，无需开关。
    # web 任务同时放开沙箱网络：作者 2026-09-30「建筑套件和城市在生成时搜一下历史图片作为参考」——要能把搜到的图下载到工作区看。
    if search:
        argv += ["-c", "sandbox_workspace_write.network_access=true"]
    argv += list(extra or [])
    return argv + ["-"]  # 提示词经标准输入传入


WRAPPER = '"$@" < "$TS_PROMPT" >> "$TS_LOG" 2>&1; rc=$?; echo "$rc" > "$TS_EXIT"; exit $rc'
FALLBACK_MODELS: list = ["GPT-5.6-Sol", "GPT-5.5"]  # 主模型不应答时回退


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
    if n <= 0:
        return ""  # --tail 0：不打印日志（lines[-0:] 会取全部）
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
    s = recover_state(root, t, st)
    note = None
    if a.note:  # 既接受说明文件路径，也接受直接写的说明文字
        note = (Path(a.note).read_text(encoding="utf-8") if Path(a.note).is_file() else a.note).strip()
    if R.wt_exists(wt) and s.get("base"):
        if R.head_has_trailer(wt, t.id):
            print(f"{t.id} 的工作区已提交（{R.git(['rev-parse', 'HEAD'], wt).stdout.strip()[:12]}），直接 merge 即可")
            return 0
        base = s["base"]
        failure = note or s.get("last_failure") or "上一次运行被中断（未产生退出码）。"
        print(f"… 在保留的工作区中续作（基点 {base[:12]}）")
    else:
        if wt.exists():
            dirty = R.wt_exists(wt) and R.git(["status", "--porcelain"], wt, check=False).stdout.strip()
            if dirty and not a.force:
                raise R.Fatal(f"{t.id} 的工作区 {wt} 有未提交的产出但无状态记录；请先 `status`/`finish` 确认，或加 --force 丢弃重建")
            R.wt_remove(root, wt)
        if not R.main_is_clean(root):
            print("⚠ 主检出有未提交的改动；工作区仍从 HEAD 创建，但 merge 前需要清理")
        # --base：从另一个任务已 finish（带尾注）的工作区提交上叠着开工（那个任务还没合入主分支时用），
        # 或直接给一个提交号。基点记进 state，finish 只提交相对该基点的改动，等前一个任务合入后再 cherry-pick 就不冲突。
        start_ref = "HEAD"
        if getattr(a, "base", None):
            other = R.wt_path(root, a.base)
            if R.wt_exists(other):
                if not R.head_has_trailer(other, a.base):
                    raise R.Fatal(f"--base {a.base}：那个工作区还没有带尾注的提交，请先对它 finish")
                start_ref = R.git(["rev-parse", "HEAD"], other).stdout.strip()
            else:
                start_ref = R.git(["rev-parse", "--verify", a.base + "^{commit}"], root).stdout.strip()
            print(f"  基点取自 --base {a.base}：{start_ref[:12]}")
        wt.parent.mkdir(parents=True, exist_ok=True)
        # 批量调度时 merge（cherry-pick）与新建工作区可能撞上 index.lock：失败就等几秒重试
        sparse = sparse_checkout_for(t)
        for delay in (0, 3, 6, 12):
            time.sleep(delay)
            p = R.git(["worktree", "add", "--detach", *(["--no-checkout"] if sparse else []), str(wt), start_ref], root, check=False)
            if p.returncode == 0:
                if sparse:
                    apply_sparse(wt, sparse, start_ref)
                break
            if wt.exists():
                R.git(["worktree", "remove", "--force", str(wt)], root, check=False)
            R.git(["worktree", "prune"], root, check=False)
        else:
            raise R.Fatal(f"git worktree add 连续失败：{(p.stderr or p.stdout).strip()[:300]}")
        base = R.git(["rev-parse", "HEAD"], wt).stdout.strip()
        st.update(t.id, base=base, attempts=0, last_failure=None)
        failure = note
    attempt = int(st.get(t.id).get("attempts", 0)) + 1
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
    pool, cap = pool_of(t.id), pool_cap(g, pool_of(t.id))
    lockf = root / ".agents" / "slots.lock"
    deadline = time.time() + a.slot_wait_min * 60
    announced = False
    while True:
        with open(lockf, "w") as lf:
            fcntl.flock(lf, fcntl.LOCK_EX)
            busy = running_in_pool(root, pool, exclude=t.id)
            if len(busy) < cap:
                st.update(t.id, attempts=attempt)  # 探针通过、确定启动后才计入运行次数
                argv = build_argv(binary, model, effort, wt, lastf, t.web or a.search, t.agent_args)
                logf.write_text(f"# {t.id} · {t.title}\n# 开始：{now_s()}\n# 命令：{shlex.join(argv)} < {pf}\n"
                                f"# 工作区：{wt}\n# 基点：{base}\n\n", encoding="utf-8")
                pid = launch(argv, pf, logf, exitf, wt, {"TIANSHU_TASK_ID": t.id})
                (ld / "current.json").write_text(json.dumps({
                    "attempt": attempt, "pid": pid, "model": model, "effort": effort, "started": now_s(),
                    "prompt": str(pf), "log": str(logf), "exit": str(exitf), "last": str(lastf), "wt": str(wt), "base": base,
                }, ensure_ascii=False, indent=1), encoding="utf-8")
                break
        if time.time() >= deadline:
            raise R.Fatal(f"并行已满（{pool} 池 {len(busy)}/{cap}：{'、'.join(busy)}）。这不是任务失败："
                          f"请后台运行 `python3 tools/agents/step.py slot {t.id} --max-min 25` 等到空位后再 start")
        if not announced:
            print(f"… {pool} 池并行已满（{len(busy)}/{cap}），排队等空位（最多 {a.slot_wait_min:g} 分钟）", flush=True)
            announced = True
        time.sleep(20)
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
    s = recover_state(root, t, st)
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

# 多个任务都往同一份"追加型"markdown 文末加小节（各套件往 prompts/*.md 加自己的一节、FOLLOWUPS 追加条目），
# cherry-pick 时两边都是新增行会报冲突；这类文件按"两边都保留"自动解决，其他文件冲突仍中止。
UNION_MERGE_GLOBS = ("assets/default/prompts/*.md", "tools/agents/FOLLOWUPS.md", "assets/default/STYLE.md", "packages/*/CLAUDE.md", "apps/*/CLAUDE.md", "CLAUDE.md")
_CONFLICT = re.compile(r"<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n", re.S)


def union_resolve(root: Path) -> bool:
    files = [f for f in R.git(["diff", "--name-only", "--diff-filter=U"], root, check=False).stdout.split("\n") if f]
    if not files or not all(R.matches_any(f, list(UNION_MERGE_GLOBS)) for f in files):
        return False
    for f in files:
        fp = root / f
        text = fp.read_text(encoding="utf-8")
        merged = _CONFLICT.sub(lambda m: m.group(1) + ("" if m.group(1).endswith("\n") or not m.group(1) else "\n") + m.group(2), text)
        if "<<<<<<<" in merged or ">>>>>>>" in merged:
            return False
        fp.write_text(merged, encoding="utf-8")
        R.git(["add", "--", f], root)
    print("  冲突按“两边都保留”自动解决：" + "、".join(files))
    return True


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
        if p is not None and p.returncode != 0 and union_resolve(root):
            p = R.git(["-c", "core.editor=true", "cherry-pick", "--continue"], root, check=False)
        if p is None or p.returncode != 0:
            R.git(["cherry-pick", "--abort"], root, check=False)
            raise R.Fatal(f"cherry-pick 失败：{(p.stderr or p.stdout).strip()[:400] if p else '未知'}")
        head = R.git(["rev-parse", "HEAD"], root).stdout.strip()
    print(f"✔ {t.id} 已合入 {R.current_branch(root) or 'HEAD'}：{head[:12]}（来自工作区 {sha[:12]}）")
    if not a.keep:
        R.wt_remove(root, wt)
        print("  工作区已清理")
    return 0


# ---------------------------------------------------------------- slot
def cmd_slot(a) -> int:
    """等到本任务所在池有空位（不占位；随后仍需 start）。"""
    root = R.repo_root()
    g = R.Graph()
    pool = pool_of(a.id)
    cap = pool_cap(g, pool)
    deadline = time.time() + a.max_min * 60
    while True:
        busy = running_in_pool(root, pool, exclude=a.id)
        if len(busy) < cap:
            print(f"SLOT-FREE {pool} {len(busy)}/{cap}")
            return 0
        if time.time() >= deadline:
            print(f"SLOT-BUSY {pool} {len(busy)}/{cap}：{'、'.join(busy)}")
            return 3
        time.sleep(30)


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
    p.add_argument("--note", help="续作说明：文件路径或直接写文字（附在提示词末尾；默认用上次校验失败原因）")
    p.add_argument("--force", action="store_true", help="任务已在分支历史中完成时仍启动")
    p.add_argument("--base", help="从另一个任务已 finish 的工作区提交（给任务 ID）或指定提交号上叠着开工；那个任务须先合入")
    p.add_argument("--no-probe", action="store_true", help="启动前不探测模型是否应答（默认探测，无响应时自动换备用模型）")
    p.add_argument("--probe-sec", type=float, default=150, help="探测超时秒数（默认 150）")
    p.add_argument("--slot-wait-min", type=float, default=8, help="并行已满时排队等空位的分钟数（默认 8；超时报错，可改用 slot 子命令后台等待）")
    p.set_defaults(func=cmd_start)

    p = sub.add_parser("slot", help="等到本任务所在并发池有空位（后台运行，SLOT-FREE 后再 start）")
    p.add_argument("id")
    p.add_argument("--max-min", type=float, default=25, help="最多等待分钟数（默认 25；到时打印 SLOT-BUSY，退出码 3）")
    p.set_defaults(func=cmd_slot)

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
