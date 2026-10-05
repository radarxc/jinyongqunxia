#!/usr/bin/env python3
"""调度器校验辅助：城图批量任务（CITY-layouts-*，AR-47 全量）的产出是否齐全、合规（磁盘规则 v2）。

    python3 tools/agents/check_city_batch.py docs/design/town/progress/<task>.expect.csv docs/design/town/progress/<task>.csv [--no-town-check]

expect.csv（追踪者登记时写好，任务不可改）：city_id, band, importance, primary_chapter, chapters(;分隔), era_kit, fullsize, mode
progress.csv（任务写）：与 docs/design/town/progress.csv 同列：
    city_id, chapter_id, effective_band, primary_chapter, importance, status, history_path, spec_path, asset_dir, reason
检查（每个 城 × 章节 一行）：
- status ∈ complete_candidate / partial_candidate / skipped；skipped 必须写 reason，且不超过本批单元数的 10%（至少容 1 个）；
- 规格 docs/design/town/<city>__<ch>.yaml 与布局 assets/default/town/<city>__<ch>/layout.yaml 存在，check_town --strict-assets 通过；
- 主章节（mode 不是 copy_only）：history/<city>__<band>.md 存在；目录 manifest 一条、图为 preview.jpg（check_assets 短边 ≥ 512）；
  fullsize=yes 另有 town.png（可带 overlay.svg）；其余主章节不得有 town.png / overlay.svg；目录（不含这两者）≤ 3 MB；
- 同带副本章节：只许 layout.yaml 与规格，不得有图片与 manifest。
"""
import argparse
import csv
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OK = {"complete_candidate", "partial_candidate", "skipped"}
IMG = {".png", ".jpg", ".jpeg", ".webp"}


def run(argv: list) -> tuple[int, str]:
    p = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
    return p.returncode, (p.stdout + p.stderr).strip()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("expect")
    ap.add_argument("progress")
    ap.add_argument("--no-town-check", action="store_true", help="跳过 check_town（调试用；调度器校验不加）")
    a = ap.parse_args()
    expect = list(csv.DictReader(open(ROOT / a.expect, encoding="utf-8")))
    prog_path = ROOT / a.progress
    if not prog_path.is_file():
        print(f"缺少进度文件 {a.progress}")
        return 1
    prog = {(r["city_id"], r["chapter_id"]): r for r in csv.DictReader(open(prog_path, encoding="utf-8"))}
    problems, skipped, done = [], 0, 0
    for u in expect:
        city, band, chs = u["city_id"], u["band"], u["chapters"].split(";")
        primary = u["primary_chapter"]
        copy_only = u["mode"] == "copy_only"
        unit_skip = False
        for ch in chs:
            tag = f"{city}__{ch}"
            r = prog.get((city, ch))
            if r is None:
                problems.append(f"{tag}：进度文件没有这一行")
                continue
            st = r.get("status", "")
            if st not in OK:
                problems.append(f"{tag}：status={st!r} 不在 {sorted(OK)}")
                continue
            if st == "skipped":
                unit_skip = True
                if not r.get("reason", "").strip():
                    problems.append(f"{tag}：skipped 没写 reason")
                continue
            spec = ROOT / f"docs/design/town/{tag}.yaml"
            d = ROOT / f"assets/default/town/{tag}"
            layout = d / "layout.yaml"
            for f in (spec, layout):
                if not f.is_file():
                    problems.append(f"{tag}：缺 {f.relative_to(ROOT)}")
            if spec.is_file() and layout.is_file() and not a.no_town_check:
                rc, out = run([sys.executable, "tools/town/check_town.py", str(spec.relative_to(ROOT)),
                               str(layout.relative_to(ROOT)), "--strict-assets"])
                if rc != 0:
                    problems.append(f"{tag}：check_town --strict-assets 不通过：{out.splitlines()[-1][:200] if out else ''}")
            is_primary = ch == primary and not copy_only
            files = [p for p in d.iterdir() if p.is_file()] if d.is_dir() else []
            if is_primary:
                hist = ROOT / f"docs/design/town/history/{city}__{band}.md"
                if not hist.is_file():
                    problems.append(f"{tag}：缺复原依据 {hist.relative_to(ROOT)}")
                rc, out = run([sys.executable, "tools/agents/check_assets.py", str(d.relative_to(ROOT)),
                               "--min", "1", "--max", "1", "--min-side", "512"])
                if rc != 0:
                    problems.append(f"{tag}：check_assets 不通过：{out.splitlines()[-1][:200] if out else ''}")
                if not (d / "preview.jpg").is_file():
                    problems.append(f"{tag}：manifest 图应为 preview.jpg（0.25 预览 JPEG，磁盘规则 v2）")
                full = u["fullsize"] == "yes"
                if full and not (d / "town.png").is_file():
                    problems.append(f"{tag}：首城要全尺寸 town.png")
                if not full:
                    extra = [p.name for p in files if p.name in ("town.png", "overlay.svg")]
                    if extra:
                        problems.append(f"{tag}：非首城不出 {extra}（磁盘规则 v2）")
                size = sum(p.stat().st_size for p in files if p.name not in ("town.png", "overlay.svg"))
                if size > 3_000_000:
                    problems.append(f"{tag}：目录（不含 town.png / overlay.svg）{size / 1e6:.1f} MB > 3 MB")
            else:
                bad = [p.name for p in files if p.suffix.lower() in IMG or p.name == "manifest.yaml"]
                if bad:
                    problems.append(f"{tag}：同带副本只放 layout.yaml，不得有 {bad}")
        skipped += unit_skip
        done += not unit_skip
    limit = max(1, len(expect) // 10)
    if skipped > limit:
        problems.append(f"跳过 {skipped} 个单元，超过本批上限 {limit}")
    for p in problems[:80]:
        print("✘", p)
    print(f"城图批：单元 {len(expect)}，完成 {done}，跳过 {skipped}；问题 {len(problems)} 个")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
