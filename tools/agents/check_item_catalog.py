#!/usr/bin/env python3
"""Validate AR-20 item-art catalog Markdown tables."""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


EXPECTED = (
    "items-medicine.md", "items-food.md", "items-manuals.md",
    "items-weapons.md", "items-clothing.md", "items-armor.md",
    "items-innerarmor.md", "items-accessories.md", "items-shoes.md",
    "items-belts.md", "items-hidden-weapons.md",
)
HEADER = (
    "ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
    "效果字段", "外观要点（供出图）",
)
MIN_ROWS = {
    "items-manuals.md": 1,  # 只补既有 it_miji_* 遗漏，不设新增配额
    "items-weapons.md": 24, "items-clothing.md": 12,
    "items-armor.md": 6, "items-innerarmor.md": 6,
    "items-accessories.md": 12, "items-shoes.md": 6,
    "items-belts.md": 6, "items-hidden-weapons.md": 12,
}
EXACT_ROWS = {
    "items-weapons.md": 24, "items-clothing.md": 12,
    "items-accessories.md": 12, "items-hidden-weapons.md": 12,
}
ID_RE = re.compile(r"`((?:it|eq)_[a-z0-9]+(?:_[a-z0-9]+)*)`")
SEP_RE = re.compile(r"^:?-{3,}:?$")
GRADES = ("天", "地", "玄", "黄")
GRADE_RE = re.compile(r"(?:^|[;`\s])grade=(\d+)(?=;|`|\s|$)")
GRADE_BANDS = {
    "黄": range(1, 4),
    "玄": range(4, 7),
    "地": range(7, 10),
    "天": range(10, 13),
}


def cells(line: str) -> list[str] | None:
    text = line.strip()
    if not (text.startswith("|") and text.endswith("|")):
        return None
    return [part.strip() for part in text[1:-1].split("|")]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("catalog_dir", type=Path)
    args = parser.parse_args()
    catalog_dir = args.catalog_dir.resolve()
    errors: list[str] = []
    rows: list[tuple[str, str, int, list[str]]] = []

    if not catalog_dir.is_dir():
        print(f"ERROR: not a directory: {catalog_dir}", file=sys.stderr)
        return 2
    actual = {path.name for path in catalog_dir.glob("items-*.md")}
    for name in sorted(set(EXPECTED) - actual):
        errors.append(f"missing catalog: {name}")
    for name in sorted(actual - set(EXPECTED)):
        errors.append(f"unexpected items catalog: {name}")

    for name in EXPECTED:
        path = catalog_dir / name
        if not path.is_file():
            continue
        lines = path.read_text(encoding="utf-8").splitlines()
        header_at = None
        for index, line in enumerate(lines):
            parsed = cells(line)
            if parsed == list(HEADER):
                header_at = index
                break
        if header_at is None:
            errors.append(f"{name}: missing exact seven-column header")
            continue
        if header_at + 1 >= len(lines):
            errors.append(f"{name}:{header_at + 1}: missing table separator")
            continue
        separator = cells(lines[header_at + 1])
        if separator is None or len(separator) != 7 or not all(SEP_RE.fullmatch(x) for x in separator):
            errors.append(f"{name}:{header_at + 2}: invalid table separator")
        for number, line in enumerate(lines[header_at + 2 :], header_at + 3):
            parsed = cells(line)
            if parsed is None:
                if line.strip():
                    errors.append(f"{name}:{number}: non-table content after catalog header")
                continue
            if len(parsed) != 7:
                errors.append(f"{name}:{number}: expected 7 columns, got {len(parsed)}")
                continue
            rows.append((name, line, number, parsed))

    ids: dict[str, tuple[str, int]] = {}
    per_file: Counter[str] = Counter()
    per_grade: dict[str, Counter[str]] = defaultdict(Counter)
    per_subgroup: Counter[tuple[str, str]] = Counter()
    subgroup_grades: dict[tuple[str, str], Counter[str]] = defaultdict(Counter)
    design_doc = catalog_dir.parent / "10-items-and-equipment.md"
    design_text = design_doc.read_text(encoding="utf-8") if design_doc.is_file() else ""
    for name, _line, number, row in rows:
        item_id, item_name, subtype, grade, source, effect, appearance = row
        match = ID_RE.fullmatch(item_id)
        where = f"{name}:{number}"
        if not match:
            errors.append(f"{where}: invalid ID or prefix: {item_id!r}")
            continue
        value = match.group(1)
        if value in ids:
            errors.append(f"{where}: duplicate ID {value}; first at {ids[value][0]}:{ids[value][1]}")
        else:
            ids[value] = (name, number)
        if grade not in GRADES:
            errors.append(f"{where}: grade must be one of 天地玄黄, got {grade!r}")
        grade_match = GRADE_RE.search(effect)
        if grade_match is None:
            errors.append(f"{where}: effect must contain an integer grade=N")
        elif grade in GRADE_BANDS:
            numeric_grade = int(grade_match.group(1))
            if numeric_grade not in GRADE_BANDS[grade]:
                expected = min(GRADE_BANDS[grade]), max(GRADE_BANDS[grade])
                errors.append(
                    f"{where}: displayed grade {grade} conflicts with "
                    f"grade={numeric_grade}; expected {expected[0]}..{expected[1]}"
                )
        if not all((item_name, subtype, source, effect, appearance)):
            errors.append(f"{where}: name/subtype/source/effect/appearance must be non-empty")
        if design_text and f"`{value}`" not in design_text:
            errors.append(f"{where}: {value} is not registered in design/10")
        if "catalogTian=true" in effect:
            required = ("divine=false", "unique=true", "price=null")
            missing = [field for field in required if field not in effect]
            if grade != "天":
                errors.append(f"{where}: catalogTian item must display 天 grade")
            if missing:
                errors.append(
                    f"{where}: catalogTian missing {','.join(missing)}"
                )
        elif "divine=true" in effect and grade != "天":
            errors.append(f"{where}: divine item must display 天 grade")
        per_file[name] += 1
        per_grade[name][grade] += 1
        subgroup = subtype.split("·", 1)[0]
        per_subgroup[(name, subgroup)] += 1
        subgroup_grades[(name, subgroup)][grade] += 1

    for name, minimum in MIN_ROWS.items():
        if per_file[name] < minimum:
            errors.append(f"{name}: needs at least {minimum} rows, got {per_file[name]}")
    for name, exact in EXACT_ROWS.items():
        if per_file[name] != exact:
            errors.append(f"{name}: expected exactly {exact} curated rows, got {per_file[name]}")
    for name in EXPECTED:
        missing = set(GRADES) - set(per_grade[name])
        if missing:
            errors.append(f"{name}: missing grade samples: {'/'.join(sorted(missing))}")
    for name, group, minimum in (("items-medicine.md", x, 8) for x in ("药物", "补品", "药材")):
        if per_subgroup[(name, group)] < minimum:
            errors.append(f"{name}: {group} needs at least {minimum} rows")
        missing = set(GRADES) - set(subgroup_grades[(name, group)])
        if missing:
            errors.append(f"{name}: {group} missing grades: {'/'.join(sorted(missing))}")
    for group in ("食材", "食品"):
        if per_subgroup[("items-food.md", group)] < 12:
            errors.append(f"items-food.md: {group} needs at least 12 rows")
        missing = set(GRADES) - set(subgroup_grades[("items-food.md", group)])
        if missing:
            errors.append(f"items-food.md: {group} missing grades: {'/'.join(sorted(missing))}")

    law_fields = (
        "uniform:true", "allowedIdentityTags:[",
        "violation:uniformImpersonation", "wantedIntent:activate",
        "normalGate:blocked",
    )
    for name, _line, number, row in rows:
        if name != "items-armor.md":
            continue
        effect = row[5]
        missing = [field for field in law_fields if field not in effect]
        if missing:
            errors.append(
                f"{name}:{number}: incomplete lawProfile, missing {','.join(missing)}"
            )

    for name in EXPECTED:
        counts = per_grade[name]
        print(f"{name}: total={per_file[name]} 天={counts['天']} 地={counts['地']} 玄={counts['玄']} 黄={counts['黄']}")
    if errors:
        print(f"FAILED: {len(errors)} error(s)", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"OK: {len(EXPECTED)} catalogs, {len(rows)} rows, {len(ids)} unique IDs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
