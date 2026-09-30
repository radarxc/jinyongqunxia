#!/usr/bin/env python3
"""打印未合入任务的状态快照（交接 / 巡检用）：

    python3 tools/agents/status_snapshot.py            # 只列未合入且已建工作区或有依赖已满足的任务
    python3 tools/agents/status_snapshot.py --all      # 列全部未合入任务

列：任务 / 标题 / 工作区 / 最近运行 / 最新 GPT 审核结论 / 未满足依赖。
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
g = json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))
state = json.loads((ROOT / ".agents/state.json").read_text()) if (ROOT / ".agents/state.json").exists() else {}
log = subprocess.run(["git", "log", "--format=%s", "-500"], cwd=ROOT, capture_output=True, text=True).stdout
merged = set(re.findall(r"^agents\(([\w.-]+)\):", log, re.M))
show_all = "--all" in sys.argv
rows = []
for t in g["tasks"]:
    tid = t["id"]
    if tid in merged or t["id"].startswith("【"):
        continue
    wt = ROOT / ".agents/wt" / tid
    st = state.get(tid, {})
    cur = st.get("current") or {}
    deps_open = [d for d in t.get("deps", []) if d not in merged]
    if not show_all and not wt.exists() and deps_open:
        continue
    reviews = sorted((ROOT / ".agents/reviews").glob(f"{tid}.r*.md"), key=lambda p: int(re.search(r"\.r(\d+)\.md$", p.name).group(1))) if (ROOT / ".agents/reviews").exists() else []
    verdict = f"{reviews[-1].name}:{reviews[-1].read_text(encoding='utf-8').splitlines()[0].replace('VERDICT: ', '')}" if reviews else "—"
    run = f"第{st.get('attempts', 0)}次" + (f"·{cur.get('status', '?')}" if cur else "")
    rows.append((tid, t["title"][:34], "有" if wt.exists() else "无", run, verdict, ",".join(deps_open)[:40] or "—"))
w = [max(len(r[i]) for r in rows + [("任务", "标题", "工作区", "最近运行", "最新审核", "未满足依赖")]) for i in range(6)]
print(" | ".join(h.ljust(w[i]) for i, h in enumerate(("任务", "标题", "工作区", "最近运行", "最新审核", "未满足依赖"))))
for r in rows:
    print(" | ".join(c.ljust(w[i]) for i, c in enumerate(r)))
print(f"\n已合入任务 {len(merged)} 个；未合入 {len(rows)} 个{'（含依赖未满足的）' if show_all else '（依赖未满足且未开工的已省略，--all 查看）'}。")
