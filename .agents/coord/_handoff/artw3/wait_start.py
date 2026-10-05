#!/usr/bin/env python3
"""素材线第三波：等条件满足后脱离启动一个驱动，然后退出。
    wait_start.py <任务ID> [--running ID ...] [--merged ID ...] [--min-free-gib 5] [--max-hours 24] -- <命令 ...>
- --running：这些任务的 supervise.status.json 都是 RUNNING（或已 MERGED / READY）才起；
- --merged：这些任务在集成分支历史里都有 Agent-Task 尾注才起；
- 磁盘可用 ≥ --min-free-gib；
启动写 .agents/coord/<任务ID>/supervise.out，事件写 _handoff/artw3/launch.log。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
LOG = ROOT / ".agents/coord/_handoff/artw3/launch.log"


def note(msg: str) -> None:
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(time.strftime("%H:%M:%S ") + msg + "\n")


def live(tid: str) -> bool:
    """执行器已拿到池位在跑（或已到校验 / 审核 / 合入阶段）：RUNNING 且 detail 不是 phase=start（还在等池位），或 READY / MERGED。"""
    try:
        d = json.loads((ROOT / ".agents/coord" / tid / "supervise.status.json").read_text())
    except (OSError, ValueError):
        return False
    st, detail = d.get("state", ""), str(d.get("detail", ""))
    if st in ("READY", "MERGED") or (st == "RUNNING" and not detail.startswith("phase=start")):
        return True
    try:  # 驱动停了（HOLD-*）但执行器还在跑，也算占着池位在跑
        cur = json.loads((ROOT / ".agents/logs" / tid / "current.json").read_text())
        os.kill(int(cur["pid"]), 0)
        return not (ROOT / ".agents/logs" / tid / f"{cur['attempt']}.exit").exists()
    except (OSError, ValueError, KeyError, TypeError):
        return False


def merged(tid: str) -> bool:
    p = subprocess.run(["git", "log", "--format=%B", "-n", "400"], cwd=ROOT, capture_output=True, text=True)
    return f"Agent-Task: {tid}" in p.stdout


def main() -> int:
    argv = sys.argv[1:]
    cmd = argv[argv.index("--") + 1:]
    ap = argparse.ArgumentParser()
    ap.add_argument("tid")
    ap.add_argument("--running", nargs="*", default=[])
    ap.add_argument("--merged", nargs="*", default=[])
    ap.add_argument("--min-free-gib", type=float, default=5.0)
    ap.add_argument("--max-hours", type=float, default=24)
    a = ap.parse_args(argv[:argv.index("--")])
    t0 = time.time()
    note(f"wait_start {a.tid}: 等 running={a.running} merged={a.merged} 磁盘≥{a.min_free_gib} GiB")
    last = ""
    while time.time() - t0 < a.max_hours * 3600:
        free = shutil.disk_usage(str(ROOT)).free / 2**30
        r_ok = all(live(t) for t in a.running)
        m_ok = all(merged(t) for t in a.merged)
        cur = f"running_ok={r_ok} merged_ok={m_ok} free={free:.1f}"
        if cur != last:
            note(f"wait_start {a.tid}: {cur}")
            last = cur
        if r_ok and m_ok and free >= a.min_free_gib:
            d = ROOT / ".agents/coord" / a.tid
            d.mkdir(parents=True, exist_ok=True)
            out = open(d / "supervise.out", "a", encoding="utf-8")
            p = subprocess.Popen(cmd, cwd=str(ROOT), stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                                 start_new_session=True)
            note(f"wait_start {a.tid}: 已起驱动 pid={p.pid}")
            print(p.pid)
            return 0
        time.sleep(60)
    note(f"wait_start {a.tid}: 超时未起")
    return 1


if __name__ == "__main__":
    sys.exit(main())
