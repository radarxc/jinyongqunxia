#!/usr/bin/env python3
"""Apply the author's baseline review decisions to asset manifests.

Input is a directory of review documents exported from the review page's
database (one JSON file per asset id: {decision, comment, sha, updatedAt}).
A decision only applies when its `sha` (first 16 hex chars) still matches the
manifest entry's sha256, i.e. the author reviewed the image that is in the repo.

  approve -> status: approved
  reject  -> status: rejected
  revise  -> left as candidate (a rework task replaces the image)

Dry run by default; --write edits manifests in place (only the status line).
Prints a Markdown table for the approval log in assets/<style>/STYLE.md.
"""
import argparse
import json
import re
import sys
from pathlib import Path

STATUS = {"approve": "approved", "reject": "rejected"}
LABEL = {"approve": "通过", "revise": "需修改", "reject": "不通过"}


def load_reviews(src):
    out = {}
    for f in sorted(Path(src).rglob("*.json")):
        d = json.loads(f.read_text(encoding="utf-8"))
        out[f.stem] = d
    return out


def split_entries(text):
    """Yield (start, end, id) line ranges of top-level `- id:` entries."""
    lines = text.splitlines(keepends=True)
    starts = [i for i, l in enumerate(lines) if re.match(r"^- id:\s*", l)]
    for k, s in enumerate(starts):
        e = starts[k + 1] if k + 1 < len(starts) else len(lines)
        yield s, e, re.sub(r"^- id:\s*", "", lines[s]).strip().strip('"\'')


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("reviews_dir")
    ap.add_argument("--style", default="assets/default")
    ap.add_argument("--write", action="store_true")
    a = ap.parse_args()

    reviews = load_reviews(a.reviews_dir)
    seen, rows, problems = set(), [], []
    for mf in sorted(Path(a.style, "baseline").rglob("manifest.yaml")):
        text = mf.read_text(encoding="utf-8")
        lines = text.splitlines(keepends=True)
        changed = False
        for s, e, aid in split_entries(text):
            r = reviews.get(aid)
            if not r:
                continue
            seen.add(aid)
            block = "".join(lines[s:e])
            m = re.search(r'^\s*sha256:\s*"?([0-9a-f]{64})', block, re.M)
            if not m or not m.group(1).startswith(r.get("sha", "")):
                problems.append(f"{aid}: 审批时的图（{r.get('sha')}）不是仓库里的这一张，跳过")
                continue
            dec = r.get("decision")
            rows.append((r.get("updatedAt", "")[:10], aid, LABEL.get(dec, dec or "—"),
                         (r.get("comment") or "").replace("|", "／").replace("\n", " ")))
            new = STATUS.get(dec)
            if not new:
                continue
            for i in range(s, e):
                mm = re.match(r"^(\s*)status:\s*(\S+)\s*$", lines[i])
                if mm:
                    if mm.group(2) != new:
                        lines[i] = f"{mm.group(1)}status: {new}\n"
                        changed = True
                    break
            else:
                problems.append(f"{aid}: 条目里没有 status 行")
        if changed and a.write:
            mf.write_text("".join(lines), encoding="utf-8")
        if changed:
            print(f"{'已改' if a.write else '将改'}：{mf}")
    for aid in sorted(set(reviews) - seen):
        problems.append(f"{aid}: 仓库里没有这个素材 ID")

    print("\n| 日期 | 素材 ID | 决定 | 作者意见（原文） |\n|---|---|---|---|")
    for d, aid, lab, c in sorted(rows, key=lambda x: x[1]):
        print(f"| {d} | `{aid}` | {lab} | {c or '—'} |")
    for p in problems:
        print("注意：" + p, file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
