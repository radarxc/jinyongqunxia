#!/usr/bin/env python3
"""调度器校验辅助：检查人物立绘提示词文件（assets/default/prompts/characters/<分组>/<id>.md）。

    python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/ch01-tianlong \
        --book ch01 --catalog docs/design/catalog/npcs-ch01-tianlong.md
    python3 tools/agents/check_portrait_prompts.py --dir assets/default/prompts/characters/protagonist --min 4

检查项（机械可判的部分；内容质量由 GPT 审核判断）：
- 给了 --catalog 时：名录人物表里的每个 `npc_*` 在目录里恰好有一个 `<npc_id>.md`，目录里没有名录之外的 `npc_*.md`；
- 每个文件文首有 YAML frontmatter，键齐全：asset_id、subject_id、name、book、gender、age_variant、tier、output、manifest、references、status；
- asset_id 以 `por_<subject_id>__` 开头、全仓唯一（本目录内）、只含小写字母 / 数字 / 下划线；给了 --book 时含 `__<book>`；
- gender ∈ male / female / other；output = `assets/default/character/<gender>/<book 前四位>/<asset_id>.png`，manifest 为同目录的 manifest.yaml；
- tier ∈ S / A / B；status ∈ draft / ready；references 是列表，列出的仓库路径存在；
- 正文有"## 人物要点""## 提示词""## 排除项""## 质检要点"四节；"## 提示词"下有一个 ```text 代码块且不少于 300 字；代码围栏成对；
- 提示词代码块里没有未替换的占位符（`{…}`、`<…>`、TODO、待补充）。
退出码 0 通过，1 有问题。
"""
import argparse
import re
import sys
from pathlib import Path

import yaml

KEYS = ("asset_id", "subject_id", "name", "book", "gender", "age_variant", "tier", "output", "manifest",
        "references", "status")
SECTIONS = ("## 人物要点", "## 提示词", "## 排除项", "## 质检要点")
ID_RE = re.compile(r"^[a-z0-9_]+$")
ROW_RE = re.compile(r"^\|\s*`(npc_[a-z0-9_]+)`\s*\|")
FENCE = re.compile(r"^\s*(```|~~~)")
PLACEHOLDER = re.compile(r"\{[^{}\n]{1,40}\}|<[^<>\n]{1,40}>|TODO|待补充|此处省略")


def split_frontmatter(text: str):
    if not text.startswith("---\n"):
        return None, text
    end = text.find("\n---\n", 4)
    if end < 0:
        return None, text
    try:
        fm = yaml.safe_load(text[4:end])
    except yaml.YAMLError:
        return None, text
    return (fm if isinstance(fm, dict) else None), text[end + 5:]


def prompt_block(body: str) -> str:
    i = body.find("## 提示词")
    if i < 0:
        return ""
    rest = body[i:]
    j = rest.find("\n## ", 5)
    seg = rest if j < 0 else rest[:j]
    m = re.search(r"```text\n(.*?)\n```", seg, re.S)
    return m.group(1) if m else ""


def check_file(f: Path, book: str | None) -> tuple:
    problems = []
    text = f.read_text(encoding="utf-8")
    fm, body = split_frontmatter(text)
    if fm is None:
        return [f"{f.name}：缺少或无法解析 YAML frontmatter"], None
    for k in KEYS:
        if k not in fm or fm[k] in (None, ""):
            problems.append(f"{f.name}：frontmatter 缺 `{k}`")
    aid, sid = str(fm.get("asset_id", "")), str(fm.get("subject_id", ""))
    if sid and not (f.stem == sid or f.stem.startswith(sid + "__")):
        problems.append(f"{f.name}：文件名应为 `{sid}.md`（同一主体多个变体时用 `{sid}__<变体>.md`）")
    if aid and (not ID_RE.match(aid) or not aid.startswith(f"por_{sid}__")):
        problems.append(f"{f.name}：asset_id `{aid}` 须为 `por_{sid}__…`，只含小写字母、数字、下划线")
    bk = str(fm.get("book", ""))
    if book and not bk.startswith(book):
        problems.append(f"{f.name}：book `{bk}` 应以 `{book}` 开头")
    if aid and bk and f"__{bk[:4]}" not in aid:
        problems.append(f"{f.name}：asset_id `{aid}` 应含书界变体键 `__{bk[:4]}`")
    gender = str(fm.get("gender", ""))
    if gender not in ("male", "female", "other"):
        problems.append(f"{f.name}：gender 须为 male / female / other")
    want_out = f"assets/default/character/{gender}/{bk[:4]}/{aid}.png"
    if str(fm.get("output", "")) != want_out:
        problems.append(f"{f.name}：output 应为 `{want_out}`")
    if str(fm.get("manifest", "")) != f"assets/default/character/{gender}/{bk[:4]}/manifest.yaml":
        problems.append(f"{f.name}：manifest 应为 `assets/default/character/{gender}/{bk[:4]}/manifest.yaml`")
    if str(fm.get("tier", "")) not in ("S", "A", "B"):
        problems.append(f"{f.name}：tier 须为 S / A / B")
    if str(fm.get("status", "")) not in ("draft", "ready"):
        problems.append(f"{f.name}：status 须为 draft / ready")
    refs = fm.get("references")
    if not isinstance(refs, list):
        problems.append(f"{f.name}：references 须为列表（没有就写 []）")
    else:
        for r in refs:
            p = str(r.get("path") if isinstance(r, dict) else r)
            if p.startswith(("assets/", "docs/")) and not Path(p).exists():
                problems.append(f"{f.name}：references 里的路径不存在 {p}")
    for s in SECTIONS:
        if s not in body:
            problems.append(f"{f.name}：缺少小节 `{s}`")
    if sum(1 for ln in text.splitlines() if FENCE.match(ln)) % 2:
        problems.append(f"{f.name}：代码围栏数为奇数")
    blk = prompt_block(body)
    if len(blk) < 300:
        problems.append(f"{f.name}：`## 提示词` 下缺少 ```text 代码块或不足 300 字（现 {len(blk)}）")
    m = PLACEHOLDER.search(blk)
    if m:
        problems.append(f"{f.name}：提示词里有未替换的占位符 `{m.group(0)}`")
    return problems, aid


def main() -> int:
    ap = argparse.ArgumentParser(description="检查人物立绘提示词文件")
    ap.add_argument("--dir", required=True)
    ap.add_argument("--book", help="书界前缀，如 ch01")
    ap.add_argument("--catalog", help="人物名录，核对每个 npc_* 都有提示词文件")
    ap.add_argument("--min", type=int, default=1, help="至少多少个提示词文件")
    a = ap.parse_args()
    d = Path(a.dir)
    files = sorted(p for p in d.glob("*.md") if not p.name.startswith(("_", "README", "INDEX", "GUIDE")))
    problems, seen = [], {}
    for f in files:
        ps, aid = check_file(f, a.book)
        problems += ps
        if aid:
            if aid in seen:
                problems.append(f"{f.name}：asset_id `{aid}` 与 {seen[aid]} 重复")
            seen[aid] = f.name
    if len(files) < a.min:
        problems.append(f"{d}：只有 {len(files)} 个提示词文件，要求至少 {a.min} 个")
    if a.catalog:
        ids = []
        for line in Path(a.catalog).read_text(encoding="utf-8").splitlines():
            m = ROW_RE.match(line)
            if m and m.group(1) not in ids:
                ids.append(m.group(1))
        have = {f.stem.split("__")[0] for f in files}
        for i in ids:
            if i not in have:
                problems.append(f"名录人物 `{i}` 没有提示词文件")
        for h in sorted(have - set(ids)):
            if h.startswith("npc_"):
                problems.append(f"`{h}.md` 不在名录 {a.catalog} 的人物表里")
    if problems:
        print(f"✘ {d}：{len(problems)} 个问题（共 {len(files)} 个文件）")
        for p in problems[:80]:
            print("  - " + p)
        return 1
    print(f"✔ {d}：{len(files)} 个提示词文件通过结构检查")
    return 0


if __name__ == "__main__":
    sys.exit(main())
