#!/usr/bin/env python3
"""协调者准出：对已 READY（校验通过 + GPT 审核 PASS）的任务执行 finish + merge。

    python3 tools/agents/accept.py ID [ID ...] [--force]

逐个任务：确认 supervise 状态为 READY 且最新审核首行是 VERDICT: PASS（--force 跳过这两项核对，
用于协调者裁定放行的任务），然后 `step.py finish`（重新校验并在工作区提交）+ `step.py merge`。
素材任务（ID 以 ART 开头，或 tasks.json 里 phase 为 ART）默认拒绝：要作者看过图才合入，确认后加 --author-approved。
"""
import argparse
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import supervise as V  # noqa: E402
import run as R  # noqa: E402

ROOT = V.ROOT


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="+")
    ap.add_argument("--force", action="store_true", help="协调者裁定放行：不核对 READY / PASS")
    ap.add_argument("--author-approved", action="store_true", help="素材任务：作者已看图同意")
    a = ap.parse_args()
    g = R.Graph()
    rc_all = 0
    for tid in a.ids:
        t = g[tid]
        if (tid.upper().startswith("ART") or t.phase == "ART") and not a.author_approved:
            print(f"✘ {tid}：素材任务，要作者看过图才合入（确认后加 --author-approved）")
            rc_all = 1
            continue
        if not a.force:
            st = V.get_status(tid)
            rf = V.latest_review(tid)
            verdict = rf.read_text(encoding="utf-8").strip().splitlines()[0].strip() if rf else ""
            if st.get("state") != "READY" or verdict != "VERDICT: PASS":
                print(f"✘ {tid}：状态 {st.get('state')}，最新审核 {verdict or '无'}；不满足准出条件")
                rc_all = 1
                continue
        rc, out = V.step("finish", tid, timeout=3600)
        tail = (out.strip().splitlines() or [""])[-1][:300]
        if rc != 0:
            print(f"✘ {tid} finish 失败：{out.strip()[-800:]}")
            rc_all = 1
            continue
        for i in range(8):
            rc, out = V.step("merge", tid)
            if rc == 0:
                break
            time.sleep(30)
        line = (out.strip().splitlines() or [""])[0][:300]
        print(("✔ " if rc == 0 else "✘ ") + f"{tid}：{line}")
        if rc == 0:
            V.set_status(tid, "MERGED", detail="协调者准出并合入")
        else:
            rc_all = 1
    return rc_all


if __name__ == "__main__":
    sys.exit(main())
