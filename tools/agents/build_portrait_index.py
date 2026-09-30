#!/usr/bin/env python3
"""生成人物立绘提示词总索引 assets/default/prompts/characters/INDEX.md。

    python3 tools/agents/build_portrait_index.py            # 生成 / 更新 INDEX.md
    python3 tools/agents/build_portrait_index.py --check    # 只检查：INDEX.md 是否最新、asset_id 与 output 是否全库唯一

索引内容全部来自各提示词文件的 frontmatter（由 ART-P-* 任务撰写）与同目录的 GUIDE.md（生成与存放规程，
由 ART-P-guide 任务撰写，原样嵌入）。本脚本不写任何人物内容，只做汇总。
"""
import argparse
import sys
from collections import Counter
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / "assets/default/prompts/characters"
BOOK_NAMES = {
    "ch00": "序章 · 越女剑", "ch01": "天龙八部", "ch02": "射雕英雄传", "ch03": "神雕侠侣", "ch04": "倚天屠龙记",
    "ch05": "笑傲江湖", "ch06": "侠客行", "ch07": "碧血剑", "ch08": "鹿鼎记", "ch09": "连城诀", "ch10": "白马啸西风",
    "ch11": "鸳鸯刀", "ch12": "书剑恩仇录", "ch13": "飞狐外传", "ch14": "雪山飞狐",
}
GENDER = {"male": "男", "female": "女", "other": "其他"}
AGE = {"child": "童年", "youth": "少年 / 青年", "prime": "壮年", "elder": "老年"}


def frontmatter(f: Path):
    text = f.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None
    end = text.find("\n---\n", 4)
    if end < 0:
        return None
    try:
        fm = yaml.safe_load(text[4:end])
    except yaml.YAMLError:
        return None
    return fm if isinstance(fm, dict) else None


def collect():
    groups, problems = {}, []
    for d in sorted(p for p in BASE.iterdir() if p.is_dir()):
        rows = []
        for f in sorted(d.glob("*.md")):
            if f.name.startswith(("_", "README", "INDEX", "GUIDE")):
                continue
            fm = frontmatter(f)
            if not fm or "asset_id" not in fm:
                problems.append(f"{f.relative_to(ROOT)}：frontmatter 无法解析或缺 asset_id")
                continue
            rows.append((fm, f))
        if rows:
            groups[d.name] = rows
    return groups, problems


def render(groups: dict) -> str:
    total = sum(len(v) for v in groups.values())
    by_gender = Counter(str(fm.get("gender")) for rows in groups.values() for fm, _ in rows)
    by_tier = Counter(str(fm.get("tier")) for rows in groups.values() for fm, _ in rows)
    out = ["# 人物立绘提示词 · 总索引", "",
           "> 本文件由 `tools/agents/build_portrait_index.py` 生成，不要手改；改提示词就改各人物文件，改规程就改 `GUIDE.md`，然后重新生成。",
           "> 每个人物一份提示词文件（`<分组>/<id>.md`）：文首 frontmatter 写明立绘素材 ID、输出文件与登记清单的位置，正文是人物要点、完整提示词、排除项与质检要点。",
           "",
           (f"已合入 **{total}** 份：" + "、".join(f"{GENDER.get(k, k)} {v}" for k, v in sorted(by_gender.items()))
            + "；品质档 " + "、".join(f"{k} {v}" for k, v in sorted(by_tier.items())) + "。") if total
           else "提示词正在撰写，目前还没有已合入的文件；进度见下表。",
           "", "## 目录", "", "- [生成与存放规程](#生成与存放规程)"]
    for g, rows in groups.items():
        out.append(f"- [{title_of(g)}](#{anchor_of(g)})（{len(rows)} 份）")
    prog = progress(groups)
    if any("已合入" not in r for r in prog):
        out += ["", "## 撰写进度", "",
                "提示词由 GPT CLI 按书界并行撰写，逐个书界过审后合入；本表在每次合入后重新生成。全部合入后本节自动消失。", "",
                "| 分组 | 目录 | 状态 |", "|---|---|---|"] + prog
    out += ["", "## 生成与存放规程", ""]
    guide = BASE / "GUIDE.md"
    if guide.exists():
        body = guide.read_text(encoding="utf-8").strip().splitlines()
        if body and body[0].startswith("# "):
            body = body[1:]
        # 规程里的标题降两级，避免和索引的章节混在一起
        out += [("##" + ln if ln.startswith("#") else ln) for ln in body]
    else:
        out.append("（规程文件 `GUIDE.md` 尚未写好。）")
    out += ["", "## 人物索引", "",
            "表中\"输出文件\"就是出图后要保存到的位置（`assets/default/character/<性别>/<书界>/`）；\"登记\"是该目录的 `manifest.yaml`。"]
    for g, rows in groups.items():
        out += ["", f"### {title_of(g)}", "",
                "| # | 人物 | 主体 ID | 性别 | 年龄段 | 档 | 提示词 | 立绘素材 ID | 输出文件 | 状态 |",
                "|---:|---|---|---|---|---|---|---|---|---|"]
        for i, (fm, f) in enumerate(rows, 1):
            rel = f.relative_to(BASE).as_posix()
            out.append(f"| {i} | {fm.get('name', '')} | `{fm.get('subject_id', '')}` | {GENDER.get(str(fm.get('gender')), fm.get('gender'))} | "
                       f"{AGE.get(str(fm.get('age_variant')), fm.get('age_variant'))} | {fm.get('tier', '')} | [{f.name}]({rel}) | "
                       f"`{fm.get('asset_id', '')}` | `{fm.get('output', '')}` | {fm.get('status', '')} |")
    return "\n".join(out) + "\n"


def progress(groups: dict) -> list:
    """各分组的撰写进度：已合入主分支的份数；没合入的看任务工作区里已经写了多少份草稿。"""
    import json
    tasks = json.loads((ROOT / "tools/agents/tasks.json").read_text(encoding="utf-8"))["tasks"]
    rows = []
    for t in tasks:
        if not t["id"].startswith("ART-P-") or t["id"] == "ART-P-guide":
            continue
        group = t["writes"][0].split("/")[-2]
        merged = len(groups.get(group, []))
        wt = ROOT / ".agents" / "wt" / t["id"] / "assets/default/prompts/characters" / group
        draft = len([f for f in wt.glob("*.md")]) if wt.is_dir() else 0
        if merged:
            state = f"已合入 {merged} 份"
        elif draft:
            state = f"撰写 / 审核中，草稿已写 {draft} 份（未合入，草稿在 `.agents/wt/{t['id']}/assets/default/prompts/characters/{group}/`）"
        else:
            state = "撰写中，尚无草稿" if wt.parent.parent.parent.parent.parent.exists() else "未开工"
        rows.append(f"| {title_of(group)} | `{group}/` | {state} |")
    return rows


def title_of(group: str) -> str:
    key = group.split("-")[0]
    if key in BOOK_NAMES:
        return f"{key} · 《{BOOK_NAMES[key]}》"
    return {"protagonist": "主角与书灵"}.get(group, group)


def anchor_of(group: str) -> str:
    t = title_of(group)
    keep = "".join(c for c in t.lower().replace(" ", "-") if c.isalnum() or c in "-_" or "一" <= c <= "鿿")
    return keep


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    groups, problems = collect()
    ids = Counter(fm["asset_id"] for rows in groups.values() for fm, _ in rows)
    outs = Counter(str(fm.get("output")) for rows in groups.values() for fm, _ in rows)
    problems += [f"asset_id 重复：{k}（{v} 次）" for k, v in ids.items() if v > 1]
    problems += [f"output 重复：{k}（{v} 次）" for k, v in outs.items() if v > 1]
    text = render(groups)
    index = BASE / "INDEX.md"
    if a.check:
        if not index.exists() or index.read_text(encoding="utf-8") != text:
            problems.append("INDEX.md 不是最新（重新运行本脚本生成）")
    else:
        index.write_text(text, encoding="utf-8")
        print(f"已生成 {index.relative_to(ROOT)}：{sum(len(v) for v in groups.values())} 份提示词，{len(groups)} 个分组")
    for p in problems:
        print("✘ " + p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
