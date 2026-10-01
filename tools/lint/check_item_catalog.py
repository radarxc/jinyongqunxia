#!/usr/bin/env python3
"""校验物品名录（docs/design/catalog/items-*.md）的七列机器行。

    python3 tools/lint/check_item_catalog.py docs/design/catalog/items-food.md --min 130

检查：每个机器行恰好七列；ID 形如 it_/eq_ + 小写字母数字下划线且文件内唯一；子类在允许集合内（按文件名选集合，
未配置的文件只检查非空）；品阶 ∈ 天/地/玄/黄；效果字段含 `grade=`；外观要点非空；行数 ≥ --min。退出码 0 通过，1 有问题。
"""
import argparse
import re
import sys
from collections import Counter
from pathlib import Path

ROW = re.compile(r"^\|\s*`((?:it|eq)_[a-z0-9_]+)`\s*\|(.*)$")
SUBCATS = {
    "items-food.md": {"食材·谷物", "食材·肉", "食材·水产", "食材·菜蔬", "食材·果", "食材·调料", "食材·珍材",
                      "食品·干粮", "食品·点心", "食品·腌藏", "食品·汤羹", "食品·菜肴", "食品·名菜"},
}
GRADES = {"天", "地", "玄", "黄"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--min", type=int, default=1)
    a = ap.parse_args()
    p = Path(a.path)
    problems, ids, rows = [], Counter(), 0
    allowed = SUBCATS.get(p.name)
    for n, ln in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        m = ROW.match(ln)
        if not m:
            if ln.startswith("| `") and not ln.startswith("| `ID"):
                problems.append(f"第 {n} 行：像机器行但 ID 不合规（须 it_/eq_ + 小写字母数字下划线）")
            continue
        rows += 1
        iid = m.group(1)
        ids[iid] += 1
        cells = [c.strip() for c in m.group(2).strip().strip("|").split("|")]
        if len(cells) != 6:
            problems.append(f"第 {n} 行 `{iid}`：应为七列，实际 {len(cells) + 1} 列")
            continue
        name, sub, grade, source, effect, look = cells
        if not name:
            problems.append(f"第 {n} 行 `{iid}`：名称为空")
        if allowed is not None and sub not in allowed:
            problems.append(f"第 {n} 行 `{iid}`：子类 `{sub}` 不在允许集合")
        elif not sub:
            problems.append(f"第 {n} 行 `{iid}`：子类为空")
        g = grade.strip("*").strip()
        if not (g and g[0] in GRADES and g[1:] in ("", "上", "中", "下")):
            problems.append(f"第 {n} 行 `{iid}`：品阶 `{grade}` 须为 天/地/玄/黄，可带 上/中/下（如 玄上）")
        if not source:
            problems.append(f"第 {n} 行 `{iid}`：出处为空（原创写 **（原创扩展）**）")
        if "grade=" not in effect:
            problems.append(f"第 {n} 行 `{iid}`：效果字段缺 `grade=`")
        if len(look) < 6:
            problems.append(f"第 {n} 行 `{iid}`：外观要点太短，出不了图")
    problems += [f"ID 重复：`{k}`（{v} 次）" for k, v in ids.items() if v > 1]
    if rows < a.min:
        problems.append(f"机器行只有 {rows} 行，要求 ≥ {a.min}")
    if problems:
        print(f"✘ {p}：{len(problems)} 个问题（共 {rows} 行）")
        for x in problems[:80]:
            print("  - " + x)
        return 1
    print(f"✔ {p}：{rows} 行机器行通过检查")
    return 0


if __name__ == "__main__":
    sys.exit(main())
