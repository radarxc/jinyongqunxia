#!/usr/bin/env python3
"""素材线第三波追踪的等待器：只盯不动，有关键节点就打印 KEY 行退出，否则到时打印 TIMEOUT。
    keywait.py <秒>
关键节点（相对上次调用的快照 _handoff/artw3/keywait.state.json）：
- 本线任务（ART-ui-icons 等、TOOL-rig-*、TOOL-city-generic、CITY-layouts-*）supervise.log 新增 start rc= / finish --no-commit rc= /
  gpt_review rc= / merge rc= / STATE READY|MERGED|HOLD|ERROR / wait: STALLED|EXITED-NO-CODE；
- w18–w23 rate.log 新行、STOP 出现、runner 心跳停 > 6 分钟而任务仍 RUNNING；
- launch.log 新行（补位器 / 守候脚本起了东西或停新起）；
- 磁盘跨过 5 GiB / 3 GiB。
"""
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
A = ROOT / ".agents/coord/_handoff/artw3"
G = ROOT / ".agents/coord/_handoff/gem"
SNAP = A / "keywait.state.json"
FIXED = {"ART-ui-icons": 18, "ART-rig-std-refs": 19, "ART-rig-sheet-f": 20, "ART-ruins-tiles": 21, "ART-cast-fill-c": 22,
         "ART-cast-fill-d": 23, "TOOL-rig-parts-f": None, "TOOL-city-generic": None, "TOOL-rig-std-parts": None}
KEYLINE = re.compile(r"start rc=|finish --no-commit rc=|gpt_review rc=|merge rc=|STATE (READY|MERGED|HOLD|ERROR)|wait: (STALLED|EXITED)")
# --quiet：只在需要处理或要上报的节点返回（审核 FAIL、终态、合入失败、停滞、校验失败）
QUIET = re.compile(r"gpt_review rc=[12]|STATE (READY|MERGED|HOLD|ERROR)|merge rc=[1-9]|wait: (STALLED|EXITED)|finish --no-commit rc=1")


def tasks():
    t = dict(FIXED)
    for p in list((ROOT / ".agents/coord").glob("CITY-layouts-ch*")) + list((ROOT / ".agents/coord").glob("VFX-sk_*")):
        t[p.name] = None
    return t


def size(p: Path) -> int:
    try:
        return p.stat().st_size
    except OSError:
        return 0


def state(t):
    try:
        return json.loads((ROOT / ".agents/coord" / t / "supervise.status.json").read_text()).get("state", "")
    except (OSError, ValueError):
        return ""


def main() -> int:
    secs = float(sys.argv[1]) if len(sys.argv) > 1 else 540
    quiet = "--quiet" in sys.argv
    pat = QUIET if quiet else KEYLINE
    try:
        snap = json.loads(SNAP.read_text())
    except (OSError, ValueError):
        snap = {}
    t0 = time.time()
    keys = []
    first = not snap
    while True:
        cur = {}
        for t, n in tasks().items():
            lf = ROOT / ".agents/coord" / t / "supervise.log"
            k = f"log:{t}"
            cur[k] = size(lf)
            old = snap.get(k, 0)
            if cur[k] > old:
                with open(lf, "rb") as f:
                    f.seek(old)
                    new = f.read().decode("utf-8", "ignore")
                keys += [f"KEY {t}: {ln[:260]}" for ln in new.splitlines() if pat.search(ln)]
            if n is not None:
                w = G / f"codex_w{n}"
                rk = f"rate:{t}"
                cur[rk] = size(w / "rate.log")
                if cur[rk] > snap.get(rk, 0):
                    keys.append(f"KEY 限流 {t} w{n}: {(w / 'rate.log').read_text().splitlines()[-1][:200]}")
                sk = f"stop:{t}"
                cur[sk] = (w / "STOP").exists()
                if cur[sk] and not snap.get(sk):
                    keys.append(f"KEY runner w{n} STOP：{(w / 'STOP').read_text().strip()[:120]}")
                hb = w / "heartbeat"
                stale = hb.exists() and time.time() - hb.stat().st_mtime > 360 and state(t) == "RUNNING" and not cur[sk]
                hk = f"stale:{t}"
                cur[hk] = bool(stale)
                if stale and not snap.get(hk):
                    keys.append(f"KEY runner w{n} 心跳停 {int((time.time() - hb.stat().st_mtime) / 60)} 分钟（{t} 仍 RUNNING）")
        ll = A / "launch.log"
        cur["launch"] = size(ll)
        if cur["launch"] > snap.get("launch", cur["launch"]):
            with open(ll, "rb") as f:
                f.seek(snap.get("launch", 0))
                new = f.read().decode("utf-8", "ignore")
            keys += [f"KEY launch: {ln[:200]}" for ln in new.splitlines() if ln.strip() and "running_ok=" not in ln
                     and not (quiet and ("驱动起" in ln or "已清 codex-home" in ln or "runner w" in ln))]
        free = shutil.disk_usage(str(ROOT)).free / 2**30
        band = 0 if free < 3 else 1 if free < 5 else 2
        cur["disk"] = band
        if "disk" in snap and band != snap["disk"]:
            keys.append(f"KEY 磁盘 {free:.2f} GiB（{'<3' if band == 0 else '<5' if band == 1 else '≥5'}）")
        if first:
            SNAP.write_text(json.dumps(cur))
            print(f"INIT 快照已建（{len(cur)} 项），磁盘 {free:.2f} GiB")
            return 0
        if keys or time.time() - t0 > secs:
            SNAP.write_text(json.dumps(cur))
            for k in keys:
                print(k)
            if not keys:
                print(f"TIMEOUT {int(time.time() - t0)}s 磁盘 {free:.2f} GiB")
            return 0
        time.sleep(15)


if __name__ == "__main__":
    sys.exit(main())
