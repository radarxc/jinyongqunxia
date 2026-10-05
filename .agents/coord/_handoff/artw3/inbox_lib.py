"""素材线第三波：补位器往协调者收件箱 .agents/coord/_inbox/artw3.md 追加进度 / 告警（main 20:40，AR-65 交接后由脚本自动做）。
已报过的事件记在 _handoff/artw3/inbox_state.json，补位器重启也不重复报。"""
import csv
import json
import re
import time
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
A = ROOT / ".agents/coord/_handoff/artw3"
INBOX = ROOT / ".agents/coord/_inbox/artw3.md"
STATEF = A / "inbox_state.json"
DONE = ("complete_candidate", "partial_candidate", "baseline_existing")


def _load() -> dict:
    try:
        return json.loads(STATEF.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def once(key: str, line: str) -> None:
    """同一 key 只报一次。"""
    st = _load()
    if key in st:
        return
    INBOX.parent.mkdir(parents=True, exist_ok=True)
    with open(INBOX, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {line}\n")
    st[key] = time.strftime("%Y-%m-%d %H:%M:%S")
    STATEF.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")


def seed(keys: list) -> None:
    st = _load()
    for k in keys:
        st.setdefault(k, "seeded")
    STATEF.write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf-8")


def batch_minutes(tid: str):
    """起跑（第一条 STATE 行）到合入（STATE MERGED）的分钟数。"""
    try:
        lines = (ROOT / ".agents/coord" / tid / "supervise.log").read_text(encoding="utf-8").splitlines()
    except OSError:
        return None
    ts = [(re.match(r"\[(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)\]", l), l) for l in lines]
    ts = [(m.group(1), l) for m, l in ts if m]
    if not ts:
        return None
    start = time.mktime(time.strptime(ts[0][0], "%Y-%m-%d %H:%M:%S"))
    merged = [t for t, l in ts if "STATE MERGED" in l]
    if not merged:
        return None
    return (time.mktime(time.strptime(merged[-1], "%Y-%m-%d %H:%M:%S")) - start) / 60


def city_units() -> tuple:
    rows = list(csv.DictReader(open(ROOT / "docs/design/town/progress.csv", encoding="utf-8")))
    prim = [r for r in rows if r["chapter_id"] == r["primary_chapter"]]
    return (sum(r["status"] in DONE for r in prim), len(prim), sum(r["status"] in DONE for r in rows), len(rows))
