#!/usr/bin/env python3
"""
天书录 · 单任务全流程驱动（协调者用，代替"一个任务一个 Claude 监督子代理"）

把 SUPERVISOR.md 的机械流程写成脚本：

    start → wait（停滞 / 超时自动续作）→ finish --no-commit（校验）→ gpt_review（只读审核）
          → FAIL：把审核意见整理成续作说明，在原工作区返修，再审（最多 --max-reviews 轮）
          → PASS：停在"待准出"（READY），由协调者读结论后执行 finish + merge

分工（作者 2026-09-30）：协调者负责规划、拆解和准出；任务执行、图像生成、多模态校验都调用本机
GPT CLI（Codex，gpt-6-astra，推理强度 ultra / xhigh）。本脚本不做质量判断，也默认不提交、不合入。

用法：
    python3 tools/agents/supervise.py <ID> [--note FILE|TEXT] [--checks FILE] [--from start|validate|review]
                                           [--effort ultra] [--review-effort xhigh] [--max-reviews 3]
                                           [--no-review] [--auto-merge] [--detach]
    python3 tools/agents/supervise.py <ID> --attach     # 只等待已在后台运行的驱动进程结束并打印结果
    python3 tools/agents/supervise.py <ID> --status     # 打印状态文件

状态写在 .agents/coord/<ID>/supervise.status.json，过程记在同目录 supervise.log（只含状态行，不含模型日志）。
终态：READY（校验与审核都通过，待协调者准出）、MERGED（--auto-merge 且已合入）、
      HOLD-REVIEWS（审核轮数用尽仍 FAIL）、HOLD-RUNS（执行次数用尽）、
      HOLD-VALIDATE（同一条调度器校验失败连续出现两次：多半是校验命令或写集之外的文件有问题，
      执行器修不了，等协调者看 .agents/logs/<ID>/last_failure.md）、ERROR（流程性错误）。
退出码：0 = READY / MERGED，1 = HOLD-*，2 = ERROR。
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))
import step as S  # noqa: E402  复用 step.py / run.py 的状态查询

CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
TRAEX = S.R.shutil.which("traex") or S.R.shutil.which("traecli") or CODEX  # 作者 2026-09-30：改用 traex
PY = sys.executable
TERMINAL = ("READY", "MERGED", "HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR")
STATUS_LINE = re.compile(r"^(FINISHED|RUNNING|STALLED|EXITED-NO-CODE)\b.*$", re.M)

RESUME_NOTE = """## 续作说明（上一次运行被中断：{why}）

这是同一工作区的续作。工作区里已有上次运行留下的产物：
1. 先用 `git status --short` 与 `git diff --stat` 核对已有改动，有误删 / 误改就恢复；逐条对照任务说明，判断每一项已做到哪一步。
2. 只做剩余部分，不要重写已完成的内容；每次补丁 ≤ 50 行、分多次写；不要重新通读全文、不要重打大 diff。
3. 结束前重新运行任务说明"检查"一节的全部命令，并把报告补完、写如实。
{extra}"""

VALIDATE_NOTE = """## 续作说明（第 {attempt} 次运行 · 调度器校验未通过）

这是同一工作区的续作，在原文件上修改，不要重写。调度器校验（`step.py finish --no-commit`）报告了下面的问题，逐条修好：

{failure}

操作约束：每次补丁 ≤ 50 行、分多次写；只改与上述问题有关的内容；改完重新运行任务说明"检查"一节的全部命令，全部通过后更新报告再结束。
"""

REWORK_NOTE = """## 续作说明（第 {attempt} 次运行 · 按合入前审核第 {round} 轮返修）

这是同一工作区的续作。工作区里已有上次运行的全部产物，**在原文件上修改，不要重写、不要重新生成整份文件**（图片任务：只重出审核点名的那几张，其余文件逐字节不动）。

操作约束：
- 每次补丁 ≤ 50 行、分多次写；用 `grep -n` 定位到要改的小节再读，不要重新通读全文，不要重打大 diff。
- 只改审核意见点到的内容；审核已判"通过"的条目不要动。
- 改完重新运行任务说明"检查"一节的全部命令，全部通过后再更新报告（报告里如实写本轮改了什么，数字 / 行号 / 哈希以实测为准）。

合入前审核（GPT 只读审核）结论为 FAIL。审核意见全文如下，"返修说明"逐条完成，缺一不可：

<<<审核意见
{review}
审核意见>>>
{extra}"""


def now() -> str:
    return _dt.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def proc_alive(pid: int) -> bool:
    """进程是否真的还在跑（僵尸进程不算：驱动进程被 kill 后若父进程没回收，kill -0 仍然成功）。"""
    if not S.pid_alive(pid):
        return False
    try:
        out = subprocess.run(["ps", "-o", "stat=", "-p", str(pid)], capture_output=True, text=True).stdout.strip()
    except OSError:
        return True
    return bool(out) and not out.startswith("Z")


def cdir(tid: str) -> Path:
    d = ROOT / ".agents" / "coord" / tid
    d.mkdir(parents=True, exist_ok=True)
    return d


def log(tid: str, msg: str) -> None:
    line = f"[{now()}] {msg}"
    with open(cdir(tid) / "supervise.log", "a", encoding="utf-8") as f:
        f.write(line + "\n")
    print(line, flush=True)


def set_status(tid: str, state: str, **kw) -> None:
    f = cdir(tid) / "supervise.status.json"
    data = {}
    if f.exists():
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            data = {}
    data.update(kw)
    data.update(state=state, updated=now())
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    os.replace(tmp, f)
    log(tid, f"STATE {state} " + " ".join(f"{k}={v}" for k, v in kw.items() if k in ("detail", "runs", "reviews")))


def get_status(tid: str) -> dict:
    f = cdir(tid) / "supervise.status.json"
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def sh(argv: list, timeout: float | None = None) -> tuple:
    try:
        p = subprocess.run(argv, cwd=str(ROOT), capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=timeout)
    except subprocess.TimeoutExpired:
        return 124, "（命令超时）"
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def step(*args, timeout: float | None = None) -> tuple:
    return sh([PY, "tools/agents/step.py", *args], timeout)


def latest_review(tid: str) -> Path | None:
    files = sorted((ROOT / ".agents" / "reviews").glob(f"{tid}.r*.md"),
                   key=lambda p: int(re.search(r"\.r(\d+)\.md$", p.name).group(1)))
    return files[-1] if files else None


def elapsed_min(tid: str) -> float:
    cur = S.current(ROOT, tid) or {}
    try:
        t0 = _dt.datetime.strptime(cur["started"], "%Y-%m-%d %H:%M:%S")
    except (KeyError, ValueError):
        return 0.0
    return (_dt.datetime.now() - t0).total_seconds() / 60


def wait_run(tid: str, a) -> str:
    """等本次执行结束。返回 finished / stalled / gone / timeout / error。"""
    while True:
        rc, out = step("wait", tid, "--max-min", "20", "--tail", "0", "--stall-min", str(a.stall_min))
        m = STATUS_LINE.search(out)
        line = m.group(0)[:300] if m else f"（wait 无状态行，退出码 {rc}）"
        log(tid, "wait: " + line)
        if not m:
            return "error"
        kind = m.group(1)
        if kind == "FINISHED":
            return "finished"
        if kind == "STALLED":
            return "stalled"
        if kind == "EXITED-NO-CODE":
            return "gone"
        if elapsed_min(tid) > a.run_timeout_min:
            return "timeout"


def start_run(tid: str, a, note: str | None) -> bool:
    argv = ["start", tid, "--bin", a.bin, "--model", a.model, "--effort", a.effort, "--probe-sec", "75",
            "--slot-wait-min", "720"]
    if a.base:
        argv += ["--base", a.base]
    if note:
        n = int((S.LockedState(ROOT / ".agents" / "state.json").get(tid) or {}).get("attempts", 0)) + 1
        nf = cdir(tid) / f"note_run{n}.md"
        nf.write_text(note, encoding="utf-8")
        argv += ["--note", str(nf)]
    rc, out = step(*argv)
    last = [ln for ln in out.strip().splitlines() if ln.strip()]
    log(tid, f"start rc={rc}: " + (last[0][:300] if last else ""))
    if rc != 0 or "已启动" not in out:
        if "已提交" in out or "已完成" in out:
            log(tid, "start: 任务已提交 / 已完成，无需再启动")
        return False
    return True


def compose_rework(tid: str, review_file: Path, round_no: int, a) -> str:
    n = int((S.LockedState(ROOT / ".agents" / "state.json").get(tid) or {}).get("attempts", 0)) + 1
    extra = ""
    if a.rework_extra:
        x = Path(a.rework_extra).read_text(encoding="utf-8") if Path(a.rework_extra).is_file() else a.rework_extra
        extra = "\n协调者补充：\n" + x.strip() + "\n"
    return REWORK_NOTE.format(attempt=n, round=round_no, review=review_file.read_text(encoding="utf-8").strip(),
                              extra=extra)


def summary(tid: str) -> str:
    st = get_status(tid)
    rf = latest_review(tid)
    verdict = rf.read_text(encoding="utf-8").strip().splitlines()[0] if rf and rf.stat().st_size else "—"
    wt = ROOT / ".agents" / "wt" / tid
    stat = ""
    base = (S.LockedState(ROOT / ".agents" / "state.json").get(tid) or {}).get("base")
    if wt.is_dir() and base:
        rc, out = sh(["git", "-C", str(wt), "diff", "--shortstat", base])
        rc2, out2 = sh(["git", "-C", str(wt), "ls-files", "--others", "--exclude-standard"])
        stat = f"{out.strip() or '无已跟踪改动'}；未跟踪 {len(out2.split())} 个"
    return (f"SUPERVISE {tid} → {st.get('state', '?')} | runs={st.get('runs', 0)} reviews={st.get('reviews', 0)} | "
            f"审核={rf.relative_to(ROOT) if rf else '—'}（{verdict}）| {stat} | {st.get('detail', '')}")


def worker(a) -> int:
    tid = a.id
    runs, reviews = 0, 0
    note = None
    if a.note:
        note = Path(a.note).read_text(encoding="utf-8") if Path(a.note).is_file() else a.note
    phase = a.start_from
    if S.is_running(ROOT, tid):
        phase = "wait"
        log(tid, "已有执行进程在跑，直接接入等待")
    set_status(tid, "RUNNING", runs=runs, reviews=reviews, detail=f"phase={phase}", pid=os.getpid(),
               effort=a.effort, review_effort=a.review_effort)
    review_errors = 0
    last_failure = None
    while True:
        if phase == "start":
            if runs >= a.max_runs:
                set_status(tid, "HOLD-RUNS", runs=runs, reviews=reviews, detail=f"执行次数已达 {a.max_runs}")
                return 1
            if not start_run(tid, a, note):
                set_status(tid, "ERROR", runs=runs, reviews=reviews, detail="start 失败（见 supervise.log）")
                return 2
            runs += 1
            note = None
            set_status(tid, "RUNNING", runs=runs, reviews=reviews, detail="executor running")
            phase = "wait"
        if phase == "wait":
            res = wait_run(tid, a)
            if res == "finished":
                phase = "validate"
            elif res in ("stalled", "gone", "timeout"):
                step("kill", tid)
                why = {"stalled": "日志长时间无增长", "gone": "进程消失且无退出码", "timeout": "单次运行超时"}[res]
                note = RESUME_NOTE.format(why=why, extra="")
                phase = "start"
                continue
            else:
                set_status(tid, "ERROR", runs=runs, reviews=reviews, detail="wait 出错（见 supervise.log）")
                return 2
        if phase == "validate":
            set_status(tid, "RUNNING", runs=runs, reviews=reviews, detail="validating")
            rc, out = step("finish", tid, "--no-commit", timeout=3600)
            head = (out.strip().splitlines() or [""])[0][:300]
            log(tid, f"finish --no-commit rc={rc}: {head}")
            if rc == 0:
                phase = "review"
            elif rc == 1:
                lf = ROOT / ".agents" / "logs" / tid / "last_failure.md"
                failure = lf.read_text(encoding="utf-8").strip() if lf.exists() else out.strip()[-3000:]
                # 同一条校验失败连续两次：执行器已经试过一次没修掉，再跑只是空耗次数
                #（2026-09-30 VFX-plates：校验命令本身写错，白跑 8 次）。停下等协调者。
                if failure == last_failure and not a.no_same_failure_stop:
                    set_status(tid, "HOLD-VALIDATE", runs=runs, reviews=reviews,
                               detail="同一条校验失败连续两次，等协调者看 last_failure.md")
                    return 1
                last_failure = failure
                n = int((S.LockedState(ROOT / ".agents" / "state.json").get(tid) or {}).get("attempts", 0)) + 1
                note = VALIDATE_NOTE.format(attempt=n, failure=failure)
                phase = "start"
                continue
            else:
                set_status(tid, "ERROR", runs=runs, reviews=reviews, detail=f"finish 出错：{head}")
                return 2
        if phase == "review":
            if a.no_review:
                break
            if reviews >= a.max_reviews:
                set_status(tid, "HOLD-REVIEWS", runs=runs, reviews=reviews,
                           detail=f"审核 {reviews} 轮仍 FAIL，等协调者裁定")
                return 1
            set_status(tid, "RUNNING", runs=runs, reviews=reviews, detail="reviewing")
            argv = [PY, "tools/agents/gpt_review.py", tid, "--model", a.review_model, "--effort", a.review_effort,
                    "--bin", a.bin, "--timeout-min", str(a.review_timeout_min), "--max-images", str(a.max_images)]
            if a.checks:
                argv += ["--checks", a.checks]
            rc, out = sh(argv, timeout=(a.review_timeout_min + 5) * 60)
            last = (out.strip().splitlines() or [""])[-1][:300]
            log(tid, f"gpt_review rc={rc}: {last}")
            if rc == 2 or rc == 124:
                review_errors += 1
                if review_errors >= 3:
                    set_status(tid, "ERROR", runs=runs, reviews=reviews, detail="审核连续 3 次没跑成：" + last)
                    return 2
                time.sleep(60)
                continue
            review_errors = 0
            reviews += 1
            if rc == 0:
                break
            rf = latest_review(tid)
            note = compose_rework(tid, rf, reviews, a)
            # 2026-10-03 协调者：审核 FAIL 后立刻改状态，免得一直挂着 reviewing，被出图线的 busy.sh 误当成在审
            set_status(tid, "RUNNING", runs=runs, reviews=reviews, detail="审核 FAIL，返修排队中")
            phase = "start"
            continue
    # 校验通过 + 审核 PASS（或 --no-review）
    if a.auto_merge:
        rc, out = step("finish", tid, timeout=3600)
        log(tid, f"finish rc={rc}: " + (out.strip().splitlines() or [""])[-1][:300])
        if rc == 0:
            for _ in range(10):
                rc, out = step("merge", tid)
                log(tid, f"merge rc={rc}: " + (out.strip().splitlines() or [""])[0][:300])
                if rc == 0:
                    set_status(tid, "MERGED", runs=runs, reviews=reviews, detail="已合入")
                    return 0
                # 2026-10-03 协调者：cherry-pick 冲突是真冲突，重试无用，直接交协调者挪基点。
                if "cherry-pick 失败" in out:
                    break
                # 2026-10-03 协调者：出图线频繁入库，集成分支常有几秒的未提交窗口；不再干等 120 秒，
                # 改为每 2 秒看一次工作树，干净了立即重试（最多等 120 秒）。
                t_wait = time.time()
                while time.time() - t_wait < 120:
                    dirty = subprocess.run(["git", "status", "--porcelain", "--untracked-files=no"], cwd=ROOT,
                                           capture_output=True, text=True).stdout.strip()
                    if not dirty:
                        break
                    time.sleep(2)
        set_status(tid, "READY", runs=runs, reviews=reviews, detail="auto-merge 未成功，待协调者手动 finish + merge")
        return 0
    set_status(tid, "READY", runs=runs, reviews=reviews, detail="校验与审核通过，待协调者准出（finish + merge）")
    return 0


def attach(tid: str) -> int:
    """轮询状态文件直到终态或驱动进程消失。"""
    while True:
        st = get_status(tid)
        state = st.get("state")
        if state in TERMINAL:
            print(summary(tid))
            return 0 if state in ("READY", "MERGED") else (1 if state.startswith("HOLD") else 2)
        pid = st.get("pid")
        if pid and not proc_alive(int(pid)):
            time.sleep(3)
            st = get_status(tid)
            if st.get("state") in TERMINAL:
                continue
            print(f"SUPERVISE {tid} → 驱动进程已消失（最后状态 {state}：{st.get('detail', '')}）。"
                  f"可重新运行 supervise.py {tid}（执行器在跑会自动接入；已跑完用 --from validate）")
            return 2
        time.sleep(15)


def main() -> int:
    ap = argparse.ArgumentParser(description="单任务全流程驱动：start → wait → 校验 → GPT 审核 → 返修循环 → 待准出")
    ap.add_argument("id")
    ap.add_argument("--note", help="首次启动附带的续作说明（文件或文本）")
    ap.add_argument("--base", help="透传给 step.py start --base：叠在另一个任务已 finish 的工作区提交上开工")
    ap.add_argument("--checks", help="审核补充要点文件（传给 gpt_review.py --checks）")
    ap.add_argument("--rework-extra", help="每次返修说明末尾追加的协调者补充（文件或文本）")
    ap.add_argument("--from", dest="start_from", choices=["start", "validate", "review"], default="start")
    ap.add_argument("--bin", default=os.environ.get("TRAEX_BIN") or os.environ.get("CODEX_BIN") or TRAEX)
    ap.add_argument("--model", default="GPT-6-Astra", help="执行模型；启动时探测，不应答回退 step.py 的 FALLBACK_MODELS（GPT-5.6-Sol）")
    ap.add_argument("--effort", default="max", help="执行推理强度（traex：max / ultra / xhigh …）")
    ap.add_argument("--review-model", default="GPT-5.6-Sol")
    ap.add_argument("--review-effort", default="xhigh", help="审核推理强度（xhigh / max）")
    ap.add_argument("--review-timeout-min", type=float, default=60)
    ap.add_argument("--max-images", type=int, default=8)
    ap.add_argument("--max-reviews", type=int, default=3, help="本次驱动最多审核轮数（FAIL 后自动返修再审）")
    ap.add_argument("--max-runs", type=int, default=8, help="本次驱动最多启动执行器次数")
    ap.add_argument("--no-same-failure-stop", action="store_true",
                    help="同一条校验失败连续两次也继续续作（默认停在 HOLD-VALIDATE）")
    ap.add_argument("--stall-min", type=float, default=25)
    ap.add_argument("--run-timeout-min", type=float, default=200)
    ap.add_argument("--no-review", action="store_true", help="校验通过即 READY，不跑 GPT 审核")
    ap.add_argument("--auto-merge", action="store_true", help="PASS 后自动 finish + merge（素材任务不要用）")
    ap.add_argument("--detach", action="store_true", help="驱动进程脱离终端在后台跑，本进程只等待结果")
    ap.add_argument("--attach", action="store_true", help="只等待已在后台运行的驱动进程")
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--worker", action="store_true", help=argparse.SUPPRESS)
    a = ap.parse_args()

    if a.status:
        print(summary(a.id))
        return 0
    if a.attach:
        return attach(a.id)
    st = get_status(a.id)
    if not a.worker and st.get("state") == "RUNNING" and st.get("pid") and proc_alive(int(st["pid"])):
        print(f"{a.id} 已有驱动进程在跑（pid {st['pid']}），改为接入等待")
        return attach(a.id)
    if a.detach and not a.worker:
        argv = [PY, str(Path(__file__).resolve())] + [x for x in sys.argv[1:] if x != "--detach"] + ["--worker"]
        out = open(cdir(a.id) / "supervise.out", "a", encoding="utf-8")
        p = subprocess.Popen(argv, cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                             start_new_session=True)
        set_status(a.id, "RUNNING", pid=p.pid, detail="detached worker started")
        time.sleep(2)
        return attach(a.id)
    try:
        return worker(a)
    except Exception as e:  # noqa: BLE001  任何未预期错误都落到状态文件，便于协调者接手
        set_status(a.id, "ERROR", detail=f"驱动脚本异常：{type(e).__name__}: {e}")
        raise


if __name__ == "__main__":
    sys.exit(main())
