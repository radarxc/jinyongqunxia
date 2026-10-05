#!/usr/bin/env python3
"""素材线第三波：codex 图像任务补位器（同时 ≤ 3 个在跑；磁盘 ≥ 5 GiB；最近 60 分钟本线 runner 无限流才起新任务）。
按队列依次：先起 runner（沙箱外，codex_wNN），隔 5 秒起驱动；两次起跑至少隔 2 分钟。任务 MERGED 后给它的 runner 放 EXIT_WHEN_EMPTY。
    scheduler.py            # 常驻，队列起完且全部终态后退出
事件写 _handoff/artw3/launch.log；协调者要求的停新起条件命中时只记日志、不起。
"""
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
G = ROOT / ".agents/coord/_handoff/gem"
A = ROOT / ".agents/coord/_handoff/artw3"
CODEX = "/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex"
ACTIVE = {"ART-ui-icons": 18, "ART-rig-std-refs": 19, "ART-rig-sheet-f": 20}
QUEUE = [  # (任务, worker, runner 槽位, 审核清单)
    ("ART-ruins-tiles", 21, 2, "review_checks_tile_ruins.md"),
    ("ART-cast-fill-c", 22, 3, "review_checks_portrait.md"),
    ("ART-cast-fill-d", 23, 3, "review_checks_portrait.md"),
]
MAX_ACTIVE, MIN_FREE_GIB, GAP_S = 3, 5.0, 120
TERMINAL = ("READY", "MERGED", "HOLD-REVIEWS", "HOLD-RUNS", "HOLD-VALIDATE", "ERROR")


def note(msg: str) -> None:
    with open(A / "launch.log", "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S ") + "sched " + msg + "\n")


def state(t: str) -> str:
    try:
        return json.loads((ROOT / ".agents/coord" / t / "supervise.status.json").read_text()).get("state", "")
    except (OSError, ValueError):
        return ""


def recent_rate(minutes: int = 60) -> list:
    hits = []
    for n in range(18, 24):
        rf = G / f"codex_w{n}" / "rate.log"
        if rf.exists() and time.time() - rf.stat().st_mtime < minutes * 60:
            hits.append(f"w{n}")
    return hits


def detach(log: Path, argv: list, cwd: Path, env_extra: dict | None = None) -> int:
    import os
    env = dict(os.environ, **(env_extra or {}))
    out = open(log, "a", encoding="utf-8")
    p = subprocess.Popen(argv, cwd=str(cwd), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                         start_new_session=True, env=env)
    return p.pid


def runner_alive(n: int) -> bool:
    hb = G / f"codex_w{n}" / "heartbeat"
    return hb.exists() and time.time() - hb.stat().st_mtime < 120


def main() -> int:
    last_launch = 0.0
    queue = list(QUEUE)
    retired = set()
    while True:
        everyone = dict(ACTIVE, **{t: n for t, n, _, _ in QUEUE})
        for t, n in everyone.items():  # 合入后让 runner 收尾退出
            if t not in retired and state(t) == "MERGED":
                (G / f"codex_w{n}" / "EXIT_WHEN_EMPTY").write_text("merged\n")
                retired.add(t)
                note(f"{t} 已合入，w{n} runner 设 EXIT_WHEN_EMPTY")
        running = [t for t in everyone if state(t) and state(t) not in TERMINAL]
        free = shutil.disk_usage(str(ROOT)).free / 2**30
        if queue:
            t, n, slots, checks = queue[0]
            rate = recent_rate()
            if state(t):
                note(f"{t} 已有驱动状态 {state(t)}，跳过")
                queue.pop(0)
                continue
            if len(running) < MAX_ACTIVE and free >= MIN_FREE_GIB and not rate and time.time() - last_launch >= GAP_S:
                w = G / f"codex_w{n}"
                for f in ("STOP", "EXIT_WHEN_EMPTY"):
                    (w / f).unlink(missing_ok=True)
                if not runner_alive(n):
                    pid = detach(w / "runner.out", ["python3", "runner.py"], w, {"RUNNER_SLOTS": str(slots)})
                    note(f"{t} runner w{n} 起（pid {pid}，{slots} 槽）")
                    time.sleep(5)
                d = ROOT / ".agents/coord" / t
                d.mkdir(parents=True, exist_ok=True)
                pid = detach(d / "supervise.out", ["python3", "tools/agents/supervise.py", t, "--bin", CODEX, "--model", "gpt-6-astra",
                                                   "--effort", "xhigh", "--review-model", "gpt-6-astra", "--max-reviews", "2",
                                                   "--max-runs", "4", "--auto-merge", "--worker", "--run-timeout-min", "600",
                                                   "--stall-min", "40", "--checks", f".agents/coord/PROD/{checks}"], ROOT)
                note(f"{t} 驱动起（pid {pid}；在跑 {running}；磁盘 {free:.1f} GiB）")
                last_launch = time.time()
                queue.pop(0)
            elif rate:
                note(f"停新起：最近 60 分钟限流 {rate}（等协调者）")
                time.sleep(540)
        elif not running:
            note("队列已空且本线 codex 图像任务全部终态，补位器退出")
            return 0
        time.sleep(60)


if __name__ == "__main__":
    sys.exit(main())
