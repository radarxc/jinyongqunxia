#!/usr/bin/env python3
"""协调者准出前的摘要：逐任务打印 supervise 状态、最新审核结论（✅ / ❌ 计数、不通过条目、需作者确认）与工作区改动范围。

    python3 tools/agents/gate.py ID [ID ...] [--full]     # --full 连同逐项结论全文一起打印

只读，不改任何状态；准出动作用 accept.py。
"""
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import supervise as V  # noqa: E402
import run as R  # noqa: E402

ROOT = V.ROOT


def main() -> int:
    full = "--full" in sys.argv
    ids = [a for a in sys.argv[1:] if not a.startswith("--")]
    g = R.Graph()
    for tid in ids:
        st = V.get_status(tid)
        rf = V.latest_review(tid)
        text = rf.read_text(encoding="utf-8") if rf else ""
        verdict = text.strip().splitlines()[0] if text.strip() else "（无审核）"
        ok, bad = text.count("✅"), text.count("❌")
        print(f"=== {tid} | {st.get('state', '?')} runs={st.get('runs', 0)} reviews={st.get('reviews', 0)} | "
              f"{rf.name if rf else '—'}: {verdict} | ✅ {ok} ❌ {bad}")
        wt = ROOT / ".agents" / "wt" / tid
        if wt.is_dir():
            files = subprocess.run(["git", "-C", str(wt), "status", "--short"], capture_output=True, text=True).stdout.split("\n")
            files = [f.strip() for f in files if f.strip()]
            t = g[tid]
            out = [f for f in files if not R.matches_any(f.split(maxsplit=1)[-1].strip('"'), t.all_writes)]
            print(f"  改动 {len(files)} 个文件" + (f"；写集外：{'、'.join(out)[:300]}" if out else "；全部在写集内"))
        for line in text.splitlines():
            if "❌" in line:
                print("  " + line[:400])
        if full:
            m = re.search(r"## 逐项结论\n(.*?)(?=\n## |\Z)", text, re.S)
            if m:
                for line in m.group(1).strip().splitlines():
                    print("  " + line[:520])
        m = re.search(r"## 需作者确认\n(.*?)(?=\n## |\Z)", text, re.S)
        if m and m.group(1).strip() and m.group(1).strip() not in ("无", "无。"):
            print("  需作者确认：" + " ".join(x.strip() for x in m.group(1).strip().splitlines())[:600])
    return 0


if __name__ == "__main__":
    sys.exit(main())
