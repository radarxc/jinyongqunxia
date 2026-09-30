#!/usr/bin/env python3
"""协调者用：等一组任务里任意一个的 supervise 状态进入终态（或驱动进程消失）就返回。

    python3 tools/agents/wait_any.py ID [ID ...] [--seen ID,ID]

--seen 里的任务即使已是终态也不再报告（协调者已处理过）。打印本次新进入终态的任务摘要，以及其余任务的一行状态。
"""
import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import supervise as V  # noqa: E402
import step as S  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--seen", default="")
    a = ap.parse_args()
    seen = {x for x in a.seen.split(",") if x}
    ids = [i for i in a.ids if i not in seen]
    while True:
        done, dead = [], []
        for tid in ids:
            st = V.get_status(tid)
            state = st.get("state")
            if state in V.TERMINAL:
                done.append(tid)
            elif st.get("pid") and not V.proc_alive(int(st["pid"])):
                dead.append(tid)
        if done or dead:
            for tid in done:
                print(V.summary(tid))
            for tid in dead:
                st = V.get_status(tid)
                print(f"SUPERVISE {tid} → 驱动进程已消失（最后状态 {st.get('state')}：{st.get('detail', '')}）")
            rest = [t for t in ids if t not in done and t not in dead]
            if rest:
                print("其余：" + "；".join(f"{t}={V.get_status(t).get('detail', '?')}" for t in rest))
            return 0
        time.sleep(20)


if __name__ == "__main__":
    sys.exit(main())
