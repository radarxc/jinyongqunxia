#!/usr/bin/env python3
"""校验物品名录（docs/design/catalog/items-*.md）的七／九列机器行。

    python3 tools/lint/check_item_catalog.py docs/design/catalog/items-food.md --min 130

九列另检查说明长度、属性投影语法／顺序／白名单及可复算双写。值带与类别适用性只报警告。
"""
import argparse
import re
import sys
from collections import Counter
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any

ROW = re.compile(r"^\|\s*`((?:it|eq)_[a-z0-9_]+)`\s*\|(.*)$")
SUBCATS = {
    "items-food.md": {"食材·谷物", "食材·肉", "食材·水产", "食材·菜蔬", "食材·果", "食材·调料", "食材·珍材",
                      "食品·干粮", "食品·点心", "食品·腌藏", "食品·汤羹", "食品·菜肴", "食品·名菜"},
}
GRADES = {"天", "地", "玄", "黄"}
HEADER7 = ("ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
           "效果字段", "外观要点（供出图）")
HEADER9 = ("ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
           "说明", "效果字段", "属性投影", "外观要点（供出图）")
ATTRIBUTE_KEYS = (
    "atk", "hardness", "qiAffinity", "qiEffect",
    "def", "reflect", "antiHidden", "agi", "block", "luck",
    "poison", "antiPoison",
    "restoreQi", "qiCultivation", "con", "healInner", "healOuter",
    "stamina", "skillRef", "readWis", "readBre", "maxLayer",
    "cultivation", "unlockRef", "artRef", "artReq", "travel", "ruleRef",
)
NUMERIC_KEYS = frozenset(ATTRIBUTE_KEYS) - {
    "qiEffect", "skillRef", "unlockRef", "artRef", "ruleRef",
}
ART_IDS = frozenset({
    "med", "poi", "antidote", "forge", "alchemy", "formation",
    "music", "art", "chess", "speech",
})
FORMAL_ID = re.compile(r"[a-z][a-z0-9]*_[a-z0-9_]+")
REFERENCE_PATTERNS = {
    "qiEffect": re.compile(r"(?:bf|ue|rule)_[a-z0-9_]+"),
    "skillRef": re.compile(r"sk_[a-z0-9_]+"),
    "ruleRef": re.compile(r"rule_[a-z0-9_]+"),
}
G = tuple(map(Decimal, (
    "1.00", "1.10", "1.20", "1.40", "1.55", "1.70",
    "2.00", "2.20", "2.40", "2.80", "3.10", "3.50",
)))
CATEGORY_KEYS = {
    "weapon": frozenset({"atk", "hardness", "qiAffinity", "qiEffect", "poison"}),
    "equipment": frozenset({"def", "reflect", "antiHidden", "agi", "block",
                              "luck", "poison", "antiPoison"}),
    "medicine": frozenset({"restoreQi", "qiCultivation", "con", "healInner",
                             "healOuter"}),
    "food": frozenset({"healInner", "healOuter", "stamina"}),
    "manual": frozenset({"skillRef", "readWis", "readBre", "maxLayer",
                           "cultivation"}),
}
REQUIRED_KEYS_BY_FILE = {
    "items-weapons.md": ("atk", "hardness", "qiAffinity"),
    "items-hidden-weapons.md": ("atk", "hardness", "qiAffinity"),
    "items-clothing.md": ("def",),
    "items-armor.md": ("def",),
    "items-innerarmor.md": ("def",),
    "items-shoes.md": ("def", "agi"),
    "items-manuals.md": ("skillRef", "maxLayer"),
}
OTHER_EQUIPMENT_KEYS = frozenset({"luck", "def", "poison", "antiPoison"})
BANDS = {
    "atk": ((60, 120), (70, 125), (80, 135), (90, 140)),
    "hardness": ((20, 45), (35, 60), (50, 80), (70, 100)),
    "qiAffinity": ((80, 105), (90, 110), (95, 120), (100, 130)),
    "def": ((3, 42), (4, 60), (5, 84), (7, 123)),
    "reflect": ((0, 200), (0, 400), (0, 700), (0, 1000)),
    "antiHidden": ((0, 300), (0, 500), (0, 800), (0, 1200)),
    "agi": ((0, 1), (0, 2), (0, 3), (0, 4)),
    "block": ((0, 4), (0, 7), (0, 10), (0, 14)),
    "luck": ((0, 1), (0, 2), (0, 3), (0, 4)),
    "poison": ((0, 3), (0, 6), (0, 9), (0, 12)),
    "antiPoison": ((0, 3), (0, 6), (0, 9), (0, 12)),
    "restoreQi": ((0, 8), (0, 12), (0, 16), (0, 22)),
    "qiCultivation": ((0, 1000), (0, 2000), (0, 3500), (0, 5000)),
    "con": ((0, 0), (0, 1), (0, 1), (0, 2)),
    "healInner": ((0, 2), (0, 4), (0, 7), (0, 10)),
    "healOuter": ((0, 7), (0, 10), (0, 14), (0, 18)),
    "stamina": ((0, 15), (0, 20), (0, 28), (0, 35)),
    "readWis": ((15, 30), (25, 40), (35, 55), (45, 80)),
    "readBre": ((15, 30), (25, 40), (35, 55), (45, 80)),
    "maxLayer": ((1, 10),) * 4,
    "cultivation": ((0, 1000), (0, 2000), (0, 3500), (0, 5000)),
    "artReq": ((4, 20), (28, 44), (52, 68), (76, 92)),
    "travel": ((0, 3000), (1500, 4000), (3000, 6000), (4500, 7000)),
}


def table_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def markdown_text(value: str) -> str:
    value = re.sub(r"!\[([^]]*)]\([^)]*\)", r"\1", value)
    value = re.sub(r"\[([^]]+)]\([^)]*\)", r"\1", value)
    value = re.sub(r"<[^>]+>", "", value)
    value = re.sub(r"^[>#]+\s*", "", value)
    return re.sub(r"[*_~`]", "", value).strip()


def effect_fields(cell: str) -> dict[str, str]:
    match = re.search(r"`([^`]*)`", cell)
    if match is None:
        return {}
    fields: dict[str, str] = {}
    for token in match.group(1).split(";"):
        key, separator, value = token.strip().partition("=")
        if separator and key and key not in fields:
            fields[key] = value.strip()
    return fields


def round_half_up(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def decimal_number(value: str, *, percent: bool = False) -> Decimal | None:
    raw = value[:-1] if percent and value.endswith("%") else value
    if percent and not value.endswith("%"):
        return None
    try:
        return Decimal(raw)
    except InvalidOperation:
        return None


def category(path: Path) -> str:
    if path.name in {"items-weapons.md", "items-hidden-weapons.md"}:
        return "weapon"
    if path.name in {
        "items-accessories.md", "items-armor.md", "items-belts.md",
        "items-clothing.md", "items-innerarmor.md", "items-shoes.md",
    }:
        return "equipment"
    if path.name == "items-medicine.md":
        return "medicine"
    if path.name == "items-food.md":
        return "food"
    if path.name == "items-manuals.md":
        return "manual"
    return "other"


def grade_band(grade: int) -> int:
    return 0 if grade <= 3 else 1 if grade <= 6 else 2 if grade <= 9 else 3


def required_attribute_keys(path: Path, subcategory: str) -> tuple[str, ...]:
    if path.name == "items-food.md" and subcategory.startswith("食品·"):
        return ("stamina",)
    if path.name == "items-accessories.md":
        if subcategory.startswith(("护腕·", "护手·")):
            return ("def", "block")
        if subcategory.startswith(("护肩·", "披风·", "头饰·")):
            return ("def",)
    return REQUIRED_KEYS_BY_FILE.get(path.name, ())


def parse_attributes(cell: str) -> tuple[dict[str, Any] | None, list[str]]:
    errors: list[str] = []
    if re.fullmatch(r"`[^`]*`", cell) is None:
        return None, ["属性投影须为且仅为一个反引号代码跨度"]
    raw = cell[1:-1]
    if raw == "—":
        return {}, errors
    if not raw or ";" in raw and re.fullmatch(r"[^;]+(?:; [^;]+)*", raw) is None:
        return None, ["属性投影须以分号加恰一个空格分隔"]
    result: dict[str, Any] = {}
    keys: list[str] = []
    for token in raw.split("; " if ";" in raw else ";"):
        key, separator, value = token.partition("=")
        if not separator or not re.fullmatch(r"[a-z][A-Za-z0-9]*", key):
            errors.append(f"属性项 `{token}` 须为小写驼峰 key=value")
            continue
        if key in result:
            errors.append(f"属性键重复 `{key}`")
            continue
        keys.append(key)
        if key not in ATTRIBUTE_KEYS:
            errors.append(f"属性键 `{key}` 不在白名单")
            result[key] = value
        elif key in NUMERIC_KEYS:
            if re.fullmatch(r"\d+", value) is None:
                errors.append(f"属性 `{key}` 的值 `{value}` 须为非负整数且不得带单位")
            else:
                result[key] = int(value)
        else:
            if not value:
                errors.append(f"引用属性 `{key}` 不能为空")
            elif key == "artRef" and value not in ART_IDS:
                errors.append(f"artRef `{value}` 不是正式 ArtId")
            elif key in REFERENCE_PATTERNS and REFERENCE_PATTERNS[key].fullmatch(value) is None:
                errors.append(f"引用属性 `{key}` 的值 `{value}` 须为正式 ID")
            elif key not in REFERENCE_PATTERNS and key != "artRef" and FORMAL_ID.fullmatch(value) is None:
                errors.append(f"引用属性 `{key}` 的值 `{value}` 须为正式 ID")
            result[key] = value
    known = [key for key in keys if key in ATTRIBUTE_KEYS]
    if known != sorted(known, key=ATTRIBUTE_KEYS.index):
        errors.append("属性键顺序不规范（须按 §4.10.5）")
    return result, errors


def expected_def(path: Path, fields: dict[str, str], grade: int) -> int | None:
    slot = fields.get("slot")
    coefficient: Decimal | None = None
    if path.name in {"items-clothing.md", "items-armor.md"} or slot == "body":
        weight = fields.get("armorWeight")
        if weight in {"light", "medium", "heavy"}:
            coefficient = {"light": Decimal("0.28"), "medium": Decimal("0.30"),
                           "heavy": Decimal("0.35")}[weight]
    elif path.name == "items-innerarmor.md" or slot == "innerBody":
        coefficient = Decimal("0.18")
    elif path.name in {"items-belts.md", "items-shoes.md"} or slot in {"head", "hands", "waist", "feet"}:
        coefficient = Decimal("0.05")
    elif slot in {"shoulder", "cape"}:
        coefficient = Decimal("0.025")
    elif slot in {"offHand", "shield"}:
        coefficient = Decimal("0.10")
    if coefficient is None and ("defOutK" in fields or "defInK" in fields):
        out = decimal_number(fields.get("defOutK", "0"))
        inner = decimal_number(fields.get("defInK", "0"))
        if out is not None and inner is not None:
            coefficient = out + inner
    return None if coefficient is None else round_half_up(Decimal(100) * coefficient * G[grade - 1])


def expected_double_writes(
    path: Path, fields: dict[str, str], grade: int
) -> tuple[dict[str, Any], list[str], list[str]]:
    expected: dict[str, Any] = {}
    warnings: list[str] = []
    errors: list[str] = []
    direct = {"skillRef": "skill", "maxLayer": "maxLayer"}
    for projected, authored in direct.items():
        if authored in fields:
            raw = fields[authored]
            expected[projected] = int(raw) if projected == "maxLayer" and raw.isdigit() else raw
    for key in NUMERIC_KEYS:
        if key in fields and fields[key].isdigit():
            expected[key] = int(fields[key])
    formulas = {
        "atk": ("mainK", Decimal(100), False),
        "reflect": ("reflectPct", Decimal(100), True),
        "restoreQi": ("mpPct", Decimal(1), True),
        "healOuter": ("healPct", Decimal(1), True),
        "stamina": ("staPct", Decimal(1), True),
    }
    for projected, (authored, multiplier, percent) in formulas.items():
        if authored not in fields:
            continue
        authored_value = fields[authored]
        number = decimal_number(authored_value, percent=percent)
        if projected == "reflect" and number is None:
            number = decimal_number(authored_value)
            multiplier = Decimal(10000)
        if number is None:
            warnings.append(f"旧字段 `{authored}` 无法复算，跳过 `{projected}` 双写校验")
        else:
            expected[projected] = round_half_up(number * multiplier)
    for authored in ("resPoisonPp", "poisonResPp"):
        if authored in fields:
            number = decimal_number(fields[authored])
            if number is None or number != number.to_integral_value():
                warnings.append(f"旧字段 `{authored}` 非整数，跳过 `antiPoison` 双写校验")
            else:
                expected["antiPoison"] = int(number)
    if "sxpGrant" in fields:
        raw_grant = fields["sxpGrant"]
        grant_object = re.fullmatch(r"\{([^{}]+)\}", raw_grant)
        if grant_object:
            parts = dict(part.strip().partition(":")[::2] for part in grant_object.group(1).split(",")
                         if ":" in part)
            if parts.get("mode") != "pctNext":
                number = None
                errors.append("旧字段 `sxpGrant` 对象的 mode 须为 `pctNext`")
            elif "value" not in parts:
                number = None
                errors.append("旧字段 `sxpGrant` 对象缺少数值 `value`")
            else:
                number = decimal_number(parts["value"])
                if number is None:
                    errors.append("旧字段 `sxpGrant` 对象的数值 `value` 无法解析")
        else:
            number = decimal_number(raw_grant)
            if number is None:
                errors.append("旧字段 `sxpGrant` 标量值无法解析")
        if number is not None:
            expected["qiCultivation"] = round_half_up(number * Decimal(10000))
    if "permStat" in fields:
        raw = fields["permStat"]
        match = re.search(r"(?:^|[,{}])\s*con:(\d+)(?:[,}]|$)", raw)
        if match:
            expected["con"] = int(match.group(1))
    defense = expected_def(path, fields, grade)
    if defense is not None:
        expected["def"] = defense
    return expected, warnings, errors


def check_nine(
    path: Path, line: int, cells: list[str]
) -> tuple[list[str], list[str]]:
    problems: list[str] = []
    warnings: list[str] = []
    subcategory, lore, effect, projection = cells[2], cells[5], cells[6], cells[7]
    lore_length = len(markdown_text(lore))
    if not 60 <= lore_length <= 120:
        problems.append(f"说明长度 {lore_length}，须为 60–120 个 Unicode 码点（Markdown 标记不计）")
    attributes, attribute_errors = parse_attributes(projection)
    problems.extend(attribute_errors)
    if attributes is None:
        return problems, warnings
    if isinstance(attributes.get("qiEffect"), str) and "原创扩展" in attributes["qiEffect"]:
        problems.append("qiEffect 占位待登记，构建不通过")
    fields = effect_fields(effect)
    try:
        grade = int(fields.get("grade", ""))
    except ValueError:
        grade = 0
    if not 1 <= grade <= 12:
        problems.append("效果字段 `grade` 须为 1–12 的整数")
    expected: dict[str, Any] = {}
    if 1 <= grade <= 12:
        expected, formula_warnings, formula_errors = expected_double_writes(path, fields, grade)
        warnings.extend(formula_warnings)
        if "qiCultivation" in attributes:
            problems.extend(formula_errors)
        for key, value in expected.items():
            if key not in attributes:
                problems.append(f"双写不一致：缺少 `{key}={value}`")
            elif attributes[key] != value:
                problems.append(f"双写不一致：`{key}` 应为 {value}，实际 {attributes[key]}")
        band = grade_band(grade)
        for key, value in attributes.items():
            if key in BANDS and isinstance(value, int):
                low, high = BANDS[key][band]
                if not low <= value <= high and not (key == "hardness" and value == 0):
                    warnings.append(f"属性 `{key}={value}` 超出本品阶典型值带 {low}–{high}")
    required = required_attribute_keys(path, subcategory)
    for key in required:
        if key not in attributes and key not in expected:
            problems.append(f"类别必填属性缺少 `{key}`")
    if path.name in {"items-belts.md", "items-accessories.md"} and not required:
        if not OTHER_EQUIPMENT_KEYS.intersection(attributes):
            problems.append("类别必填属性须至少含一项 `luck/def/poison/antiPoison`")
    if path.name == "items-medicine.md" and subcategory.startswith(("药物·", "补品·")):
        if not CATEGORY_KEYS["medicine"].intersection(attributes):
            problems.append("类别必填属性须至少含一项药品效用字段")
    allowed = CATEGORY_KEYS.get(category(path))
    food_qi_exception = (
        path.name == "items-food.md"
        and bool({"sxpGrant", "perm.mpMaxPct"}.intersection(fields))
    )
    if (path.name == "items-food.md" and "qiCultivation" in attributes
            and not food_qi_exception):
        problems.append(
            "食品属性 `qiCultivation` 仅允许旧效果字段含 "
            "`sxpGrant` 或 `perm.mpMaxPct`"
        )
    if allowed is not None:
        for key in attributes:
            if key == "qiCultivation" and food_qi_exception:
                continue
            if key in ATTRIBUTE_KEYS and key not in allowed:
                warnings.append(f"属性 `{key}` 不属于 {category(path)} 常用字段集")
    return problems, warnings


def check_catalog(path: Path, minimum: int = 1) -> tuple[list[str], list[str], int, str]:
    problems: list[str] = []
    warnings: list[str] = []
    ids: Counter[str] = Counter()
    rows = 0
    formats: set[int] = set()
    current_columns: int | None = None
    allowed = SUBCATS.get(path.name)
    lines = path.read_text(encoding="utf-8").splitlines()
    for n, line in enumerate(lines, 1):
        if line.startswith("|"):
            header = tuple(table_cells(line))
            if header == HEADER7:
                formats.add(7)
                current_columns = 7
                continue
            if header == HEADER9:
                formats.add(9)
                current_columns = 9
                continue
        match = ROW.match(line)
        if not match:
            if line.startswith("| `") and not line.startswith("| `ID"):
                problems.append(f"第 {n} 行：像机器行但 ID 不合规（须 it_/eq_ + 小写字母数字下划线）")
            continue
        rows += 1
        iid = match.group(1)
        ids[iid] += 1
        cells = [f"`{iid}`", *[cell.strip() for cell in match.group(2).strip().strip("|").split("|")]]
        columns = current_columns or (next(iter(formats)) if len(formats) == 1 else 7)
        if len(cells) != columns:
            label = "七列" if columns == 7 else "九列"
            problems.append(f"第 {n} 行 `{iid}`：应为{label}，实际 {len(cells)} 列")
            continue
        if columns == 7:
            _id, name, sub, grade, source, effect, look = cells
        else:
            _id, name, sub, grade, source, _lore, effect, _projection, look = cells
        if not name:
            problems.append(f"第 {n} 行 `{iid}`：名称为空")
        if allowed is not None and sub not in allowed:
            problems.append(f"第 {n} 行 `{iid}`：子类 `{sub}` 不在允许集合")
        elif not sub:
            problems.append(f"第 {n} 行 `{iid}`：子类为空")
        grade_label = grade.strip("*").strip()
        if not (grade_label and grade_label[0] in GRADES and grade_label[1:] in ("", "上", "中", "下")):
            problems.append(f"第 {n} 行 `{iid}`：品阶 `{grade}` 须为 天/地/玄/黄，可带 上/中/下（如 玄上）")
        if not source:
            problems.append(f"第 {n} 行 `{iid}`：出处为空（原创写 **（原创扩展）**）")
        if "grade=" not in effect:
            problems.append(f"第 {n} 行 `{iid}`：效果字段缺 `grade=`")
        if len(look) < 6:
            problems.append(f"第 {n} 行 `{iid}`：外观要点太短，出不了图")
        if columns == 9:
            row_problems, row_warnings = check_nine(path, n, cells)
            problems.extend(f"第 {n} 行 `{iid}`：{reason}" for reason in row_problems)
            warnings.extend(f"第 {n} 行 `{iid}`：{reason}" for reason in row_warnings)
            fields = effect_fields(effect)
            if grade_label and grade_label[0] in GRADES and fields.get("grade", "").isdigit():
                grade_number = int(fields["grade"]); groups = {"黄": range(1, 4), "玄": range(4, 7),
                                                               "地": range(7, 10), "天": range(10, 13)}
                if 1 <= grade_number <= 12 and grade_number not in groups[grade_label[0]]:
                    problems.append(f"第 {n} 行 `{iid}`：品阶 `{grade_label}` 与 `grade={grade_number}` 不同阶")
    if formats == {7, 9}:
        problems.insert(0, "同一文件混用七列与九列表头")
    problems.extend(f"ID 重复：`{key}`（{count} 次）" for key, count in ids.items() if count > 1)
    if rows < minimum:
        problems.append(f"机器行只有 {rows} 行，要求 ≥ {minimum}")
    format_label = "七/九列混用" if formats == {7, 9} else "九列" if formats == {9} else "七列"
    return problems, warnings, rows, format_label


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--min", type=int, default=1)
    a = ap.parse_args(argv)
    p = Path(a.path)
    problems, warnings, rows, format_label = check_catalog(p, a.min)
    if problems:
        print(f"✘ {p}：{len(problems)} 个问题（共 {rows} 行，{format_label}）")
        for x in problems[:80]:
            print("  - " + x)
        for x in warnings[:80]:
            print("  - 警告：" + x)
        return 1
    print(f"✔ {p}：{rows} 行{format_label}机器行通过检查")
    for x in warnings[:80]:
        print("  - 警告：" + x)
    return 0


if __name__ == "__main__":
    sys.exit(main())
