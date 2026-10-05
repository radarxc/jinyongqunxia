#!/usr/bin/env python3
"""素材线第三波：在跑 / 已合入城图批的进度（单元完成数、平均每单元分钟）。"""
import csv, json, time
from pathlib import Path
ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
for d in sorted((ROOT / ".agents/coord").glob("CITY-layouts-ch*")):
    t = d.name
    st = {}
    try: st = json.loads((d / "supervise.status.json").read_text())
    except Exception: pass
    exp = ROOT / f"docs/design/town/progress/{t}.expect.csv"
    units = list(csv.DictReader(open(exp, encoding="utf-8"))) if exp.exists() else []
    wt = ROOT / ".agents/wt" / t
    prog = (wt if wt.exists() else ROOT) / f"docs/design/town/progress/{t}.csv"
    rows = list(csv.DictReader(open(prog, encoding="utf-8"))) if prog.exists() else []
    done_units = {(r["city_id"], r["effective_band"]) for r in rows if r.get("status") in ("complete_candidate", "partial_candidate", "skipped")}
    started = None
    try:
        cur = json.loads((ROOT / ".agents/logs" / t / "1.prompt.md").stat().st_mtime and "{}")
    except Exception: pass
    p1 = ROOT / ".agents/logs" / t / "1.prompt.md"
    mins = (time.time() - p1.stat().st_mtime) / 60 if p1.exists() else 0
    rate = f"{mins / len(done_units):.1f} 分/单元" if done_units else "—"
    print(f"{t}: {st.get('state')} {str(st.get('detail',''))[:20]} | 单元 {len(done_units)}/{len(units)} | 已跑 {mins:.0f} 分 | {rate}")
