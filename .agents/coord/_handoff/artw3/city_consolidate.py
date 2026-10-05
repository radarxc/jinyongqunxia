#!/usr/bin/env python3
"""素材线第三波：把已合入城图批的进度（docs/design/town/progress/<任务>.csv / .done.txt）汇总进共享的
docs/design/town/progress.csv 与 done.txt，持 merge.lock 按路径提交。无变化不提交。
    city_consolidate.py [--dry]
"""
import csv
import fcntl
import io
import subprocess
import time
import sys
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
PROG = ROOT / "docs/design/town/progress.csv"
DONE = ROOT / "docs/design/town/done.txt"
PDIR = ROOT / "docs/design/town/progress"


def merged_tasks() -> list:
    p = subprocess.run(["git", "log", "--format=%B", "-n", "800"], cwd=ROOT, capture_output=True, text=True)
    return sorted({ln.split(":", 1)[1].strip() for ln in p.stdout.splitlines()
                   if ln.startswith("Agent-Task: CITY-layouts-ch")})


def main() -> int:
    dry = "--dry" in sys.argv
    with open(ROOT / ".agents/merge.lock", "w") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        text = PROG.read_text(encoding="utf-8")
        rows = list(csv.DictReader(io.StringIO(text)))
        fields = list(rows[0].keys())
        idx = {(r["city_id"], r["chapter_id"]): r for r in rows}
        done_lines = DONE.read_text(encoding="utf-8").splitlines()
        have = set(done_lines)
        tasks, changed, added = merged_tasks(), 0, []
        for t in tasks:
            pf = PDIR / f"{t}.csv"
            if pf.is_file():
                for r in csv.DictReader(open(pf, encoding="utf-8")):
                    key = (r.get("city_id"), r.get("chapter_id"))
                    if key in idx:
                        before = dict(idx[key])
                        for k in ("status", "history_path", "spec_path", "asset_dir", "reason"):
                            if r.get(k) is not None:
                                idx[key][k] = r[k]
                        changed += idx[key] != before
            df = PDIR / f"{t}.done.txt"
            if df.is_file():
                for ln in df.read_text(encoding="utf-8").splitlines():
                    if ln.strip() and ln not in have:
                        added.append(ln)
                        have.add(ln)
        if not changed and not added:
            print(f"无变化（已合入 {len(tasks)} 批）")
            return 0
        out = io.StringIO()
        w = csv.DictWriter(out, fieldnames=fields, lineterminator="\n")
        w.writeheader()
        w.writerows(rows)
        complete = sum(1 for r in rows if r["status"] in ("complete_candidate", "partial_candidate", "baseline_existing"))
        msg = (f"agents: 城图进度汇总——已合入 {len(tasks)} 批，progress.csv 更新 {changed} 行、done.txt 追加 {len(added)} 行；"
               f"完成 {complete} / {len(rows)} 个城 × 章节\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n")
        if dry:
            print(msg)
            return 0
        PROG.write_text(out.getvalue(), encoding="utf-8")
        if added:
            DONE.write_text("\n".join(done_lines + added) + "\n", encoding="utf-8")
        rel = ["docs/design/town/progress.csv", "docs/design/town/done.txt"]
        # 10-04 02:47 加重试：撞 index.lock 时提交失败会把两份进度文件留成未提交改动，挡住集成分支的 cherry-pick 合入
        for _ in range(8):
            a = subprocess.run(["git", "add", "--", *rel], cwd=ROOT, capture_output=True, text=True)
            p = subprocess.run(["git", "commit", "-m", msg, "--", *rel], cwd=ROOT, capture_output=True, text=True) if a.returncode == 0 else a
            if p.returncode == 0 or "index.lock" not in (p.stderr or ""):
                break
            time.sleep(4)
        sha = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        print(f"提交 {sha}：完成 {complete} / {len(rows)}；更新 {changed} 行" if p.returncode == 0 else "提交失败：" + p.stderr[-300:])
        return p.returncode


if __name__ == "__main__":
    sys.exit(main())
