#!/usr/bin/env python3
"""素材线第三波追踪：一行一个任务的简况（驱动状态、执行器、runner 队列 ok/noimg/待出、限流），末行磁盘。
    status.py            # 全部
    status.py --events   # 事件模式（给 Monitor 用）：每 60 秒比较一次，只输出变化（终态、审核结论、限流、磁盘线）
"""
import json
import os
import re
import shutil
import sys
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
G = ROOT / ".agents/coord/_handoff/gem"
TASKS = {"ART-ui-icons": 18, "ART-rig-std-refs": 19, "ART-rig-sheet-f": 20, "ART-ruins-tiles": 21, "ART-cast-fill-c": 22,
         "ART-cast-fill-d": 23, "TOOL-rig-parts-f": None, "TOOL-city-generic": None, "TOOL-rig-std-parts": None}


def city_tasks():
    d = ROOT / ".agents/coord"
    return sorted(p.name for p in list(d.glob("CITY-layouts-ch*")) + list(d.glob("VFX-sk_*")) if p.is_dir())


def alive(pid) -> bool:
    try:
        os.kill(int(pid), 0)
        return True
    except Exception:  # noqa: BLE001
        return False


def runner(n):
    if n is None:
        return ""
    d = G / f"codex_w{n}"
    if not d.is_dir():
        return ""
    jobs = [l.split("\t") for l in (d / "jobs.tsv").read_text().splitlines()] if (d / "jobs.tsv").exists() else []
    ok = sum(1 for j in jobs if len(j) > 1 and j[1] == "ok")
    no = sum(1 for j in jobs if len(j) > 1 and j[1] == "noimg")
    q = [l for l in (d / "queue.txt").read_text().splitlines() if l.strip() and not l.startswith("#")] if (d / "queue.txt").exists() else []
    pend = len(q) - len({j[0] for j in jobs})
    hb = (d / "heartbeat").read_text().strip()[11:16] if (d / "heartbeat").exists() else "--"
    rate = len((d / "rate.log").read_text().splitlines()) if (d / "rate.log").exists() else 0
    stop = " STOP" if (d / "STOP").exists() else ""
    return f" | w{n} ok{ok} no{no} 待{max(pend, 0)} 心跳{hb} 限流{rate}{stop}"


def line(t: str):
    sf = ROOT / ".agents/coord" / t / "supervise.status.json"
    if not sf.exists():
        return t, None, f"{t}: 未起"
    s = json.loads(sf.read_text())
    cur = {}
    try:
        cur = json.loads((ROOT / ".agents/logs" / t / "current.json").read_text())
    except Exception:  # noqa: BLE001
        pass
    ex = f"run{cur.get('attempt')} {'跑' if cur.get('pid') and alive(cur['pid']) else '停'} {cur.get('started', '')[11:16]}"
    st = s.get("state")
    return t, (st, s.get("runs"), s.get("reviews"), str(s.get("detail", ""))[:30]), \
        f"{t}: {st} r{s.get('runs')}/v{s.get('reviews')} {str(s.get('detail', ''))[:40]} | 执行器 {ex}{runner(TASKS.get(t))}"


def disk() -> float:
    return shutil.disk_usage(str(ROOT)).free / 2**30


def snapshot():
    out = {}
    for t in list(TASKS) + city_tasks():
        out[t] = line(t)
    return out


def main() -> int:
    if "--events" not in sys.argv:
        for t, (_, _, txt) in snapshot().items():
            print(txt)
        print(f"磁盘可用 {disk():.2f} GiB")
        return 0
    prev, prev_rate, prev_disk = {}, {}, None
    while True:
        snap = snapshot()
        for t, (_, key, txt) in snap.items():
            if key is None:
                continue
            old = prev.get(t)
            if old is None or old[0] != key[0] or old[2] != key[2] or (key[0] == "RUNNING" and old[3] != key[3] and
                                                                      re.match(r"(validating|reviewing)", key[3] or "")):
                if old is not None or key[0] != "RUNNING":
                    print(f"[{time.strftime('%H:%M')}] {txt}", flush=True)
            prev[t] = key
        for t, n in TASKS.items():
            if n is None:
                continue
            rf = G / f"codex_w{n}" / "rate.log"
            k = len(rf.read_text().splitlines()) if rf.exists() else 0
            if k > prev_rate.get(t, 0):
                print(f"[{time.strftime('%H:%M')}] 限流 {t} w{n}: {rf.read_text().splitlines()[-1][:160]}", flush=True)
            prev_rate[t] = k
        f = disk()
        band = 0 if f < 3 else 1 if f < 5 else 2
        if prev_disk is not None and band != prev_disk:
            print(f"[{time.strftime('%H:%M')}] 磁盘 {f:.2f} GiB（{'<3 停 runner' if band == 0 else '<5 不开新区' if band == 1 else '≥5'}）", flush=True)
        prev_disk = band
        time.sleep(60)


if __name__ == "__main__":
    sys.exit(main())
