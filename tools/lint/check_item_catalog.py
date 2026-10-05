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
COLLECTIBLE_SUBS = {
    "porcelain": "porcelain", "瓷器／茶具": "porcelain", "瓷器/茶具": "porcelain",
    "jade": "jade", "玉器": "jade",
    "bronze": "bronze", "香炉／铜器／金银器": "bronze", "香炉/铜器/金银器": "bronze",
    "qin": "qin", "琴与乐器": "qin", "琴／乐器": "qin", "琴/乐器": "qin",
    "calligraphy": "calligraphy", "书法／拜帖／名家手迹": "calligraphy",
    "书法/拜帖/名家手迹": "calligraphy",
    "stationery": "stationery", "笔墨纸砚": "stationery",
    "antique": "antique", "其他古玩": "antique",
}
SUBCATS = {
    "items-food.md": {"食材·谷物", "食材·肉", "食材·水产", "食材·菜蔬", "食材·果", "食材·调料", "食材·珍材",
                      "食品·干粮", "食品·点心", "食品·腌藏", "食品·汤羹", "食品·菜肴", "食品·名菜"},
    "items-collectibles.md": set(COLLECTIBLE_SUBS),
}
GRADES = {"天", "地", "玄", "黄"}
HEADER7 = ("ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
           "效果字段", "外观要点（供出图）")
HEADER9 = ("ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
           "说明", "效果字段", "属性投影", "外观要点（供出图）")
COLLECTIBLE_HEADER9 = ("ID", "名称", "子类", "品阶", "出处",
                       "效果字段", "外观要点", "说明", "属性投影")
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
    "collectible": frozenset({
        "giftValue", "giftTo", "eraRange", "provenance",
        "study", "appraise", "luck",
    }),
}
COLLECTIBLE_KEYS = (
    "giftValue", "giftTo", "eraRange", "provenance",
    "study", "appraise", "luck",
)
COLLECTIBLE_REQUIRED_KEYS = COLLECTIBLE_KEYS[:6]
GIFT_TO_KEYS = ("preferred", "disliked", "taboo", "sectRefs", "npcOverrides")
GIFT_PREFERENCES = (
    "scholar", "warrior", "monastic", "lady", "noble",
    "merchant", "sect", "musician", "collector",
)
GIFT_REACTIONS = frozenset({"favored", "neutral", "disliked", "taboo"})
ERA_BANDS = ("chunqiu", "tang", "song_north", "song_south", "yuan", "ming", "qing")
PROVENANCES = frozenset({"book", "history", "expanded"})
STUDY_ARTS = frozenset({"music", "art", "chess", "lore"})
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


def split_top_level(value: str, separator: str) -> list[str] | None:
    parts: list[str] = []
    start = 0
    stack: list[str] = []
    closing = {"[": "]", "{": "}"}
    for index, character in enumerate(value):
        if character in closing:
            stack.append(closing[character])
        elif character in "]}":
            if not stack or character != stack.pop():
                return None
        elif character == separator and not stack:
            parts.append(value[start:index])
            start = index + 1
    if stack:
        return None
    parts.append(value[start:])
    return parts


def parse_named_object(value: str) -> tuple[list[tuple[str, str]] | None, str | None]:
    if not value.startswith("{") or not value.endswith("}"):
        return None, "须为 {...} 对象"
    tokens = split_top_level(value[1:-1], ",")
    if tokens is None or not tokens or any(not token for token in tokens):
        return None, "对象括号或逗号格式不合法"
    result: list[tuple[str, str]] = []
    seen: set[str] = set()
    for token in tokens:
        key, separator, raw = token.partition(":")
        if not separator or not re.fullmatch(r"[a-z][A-Za-z0-9_]*", key) or not raw:
            return None, f"对象项 `{token}` 须为 key:value"
        if key in seen:
            return None, f"对象键重复 `{key}`"
        seen.add(key)
        result.append((key, raw))
    return result, None


def parse_enum_list(value: str) -> tuple[list[str] | None, str | None]:
    if not value.startswith("[") or not value.endswith("]"):
        return None, "须为非空 [...] 列表"
    values = value[1:-1].split(",")
    if not values or any(not item for item in values):
        return None, "列表不得为空或含空项"
    if any(re.fullmatch(r"[a-z][a-z0-9_]*", item) is None for item in values):
        return None, "列表项须为小写枚举或正式 ID"
    if len(values) != len(set(values)):
        return None, "列表项不得重复"
    return values, None


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
    if path.name == "items-collectibles.md":
        return "collectible"
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


def parse_gift_to(value: str) -> tuple[dict[str, Any] | None, list[str]]:
    pairs, error = parse_named_object(value)
    if pairs is None:
        return None, [f"giftTo {error}"]
    errors: list[str] = []
    keys = [key for key, _raw in pairs]
    unknown = [key for key in keys if key not in GIFT_TO_KEYS]
    errors.extend(f"giftTo 对象键 `{key}` 不在闭集" for key in unknown)
    known = [key for key in keys if key in GIFT_TO_KEYS]
    if known != sorted(known, key=GIFT_TO_KEYS.index):
        errors.append("giftTo 对象键顺序不规范")
    if "preferred" not in keys:
        errors.append("giftTo 缺少必填键 `preferred`")
    result: dict[str, Any] = {}
    used_preferences: set[str] = set()
    for key, raw in pairs:
        if key in {"preferred", "disliked", "taboo"}:
            values, list_error = parse_enum_list(raw)
            if values is None:
                errors.append(f"giftTo.{key} {list_error}")
                continue
            for item in values:
                if item not in GIFT_PREFERENCES:
                    errors.append(f"`{item}` 不在 giftTo 偏好标签闭集")
                elif item in used_preferences:
                    errors.append(f"giftTo 偏好标签 `{item}` 不得跨列表重复")
                else:
                    used_preferences.add(item)
            known_values = [item for item in values if item in GIFT_PREFERENCES]
            if known_values != sorted(known_values, key=GIFT_PREFERENCES.index):
                errors.append(f"giftTo.{key} 标签顺序不规范")
            result[key] = values
        elif key == "sectRefs":
            values, list_error = parse_enum_list(raw)
            if values is None:
                errors.append(f"giftTo.sectRefs {list_error}")
                continue
            for item in values:
                if re.fullmatch(r"sect_[a-z0-9_]+", item) is None:
                    errors.append(f"giftTo.sectRefs 的 `{item}` 须为正式 sect_ ID")
            result[key] = values
        elif key == "npcOverrides":
            overrides, object_error = parse_named_object(raw)
            if overrides is None:
                errors.append(f"giftTo.npcOverrides {object_error}")
                continue
            parsed_overrides: dict[str, str] = {}
            for npc_id, reaction in overrides:
                if re.fullmatch(r"npc_[a-z0-9_]+", npc_id) is None:
                    errors.append(f"giftTo.npcOverrides 的 `{npc_id}` 须为正式 npc_ ID")
                if reaction not in GIFT_REACTIONS:
                    errors.append(f"giftTo.npcOverrides 反应 `{reaction}` 不在闭集")
                parsed_overrides[npc_id] = reaction
            result[key] = parsed_overrides
    return result, errors


def parse_collectible_values(
    raw: str, *, allow_structural: bool = False
) -> tuple[dict[str, Any] | None, list[str]]:
    if not raw or (";" in raw and re.fullmatch(r"[^;]+(?:; [^;]+)*", raw) is None):
        return None, ["收藏品机器行须以分号加恰一个空格分隔"]
    tokens: list[tuple[str, str]] = []
    errors: list[str] = []
    seen: set[str] = set()
    for token in raw.split("; " if ";" in raw else ";"):
        key, separator, value = token.partition("=")
        if not separator or re.fullmatch(r"[a-z][A-Za-z0-9]*", key) is None:
            errors.append(f"收藏品属性项 `{token}` 须为小写驼峰 key=value")
            continue
        if key not in COLLECTIBLE_KEYS:
            if not allow_structural:
                errors.append(f"属性键 `{key}` 不在收藏品白名单")
            continue
        if key in seen:
            errors.append(f"属性键重复 `{key}`")
            continue
        seen.add(key)
        tokens.append((key, value))
    keys = [key for key, _value in tokens]
    if keys != sorted(keys, key=COLLECTIBLE_KEYS.index):
        errors.append("属性键顺序不规范（须按 §11.5.3）")
    for key in COLLECTIBLE_REQUIRED_KEYS:
        if key not in seen:
            errors.append(f"收藏品必填属性缺少 `{key}`")
    result: dict[str, Any] = {}
    for key, value in tokens:
        if key == "giftValue":
            if re.fullmatch(r"[0-4]", value) is None:
                errors.append("giftValue 须为 0–4 的整数")
            else:
                result[key] = int(value)
        elif key == "giftTo":
            parsed, nested_errors = parse_gift_to(value)
            errors.extend(nested_errors)
            if parsed is not None:
                result[key] = parsed
        elif key == "eraRange":
            values, list_error = parse_enum_list(value)
            if values is None:
                errors.append(f"eraRange {list_error}")
            else:
                for item in values:
                    if item not in ERA_BANDS:
                        errors.append(f"`{item}` 不在 eraRange 年代带枚举")
                known_values = [item for item in values if item in ERA_BANDS]
                if known_values != sorted(known_values, key=ERA_BANDS.index):
                    errors.append("eraRange 年代带顺序不规范")
                result[key] = values
        elif key == "provenance":
            if value not in PROVENANCES:
                errors.append("provenance 只允许 book/history/expanded")
            else:
                result[key] = value
        elif key == "study":
            if value == "none":
                result[key] = value
                continue
            pairs, object_error = parse_named_object(value)
            if pairs is None:
                errors.append(f"study {object_error}，或写 none")
                continue
            study = dict(pairs)
            if [key for key, _raw in pairs] != ["art", "delta", "once"]:
                errors.append("study 对象须按 art,delta,once 且仅含这三个键")
            if study.get("art") not in STUDY_ARTS:
                errors.append("study.art 只允许 music/art/chess/lore")
            if re.fullmatch(r"[1-9]\d*", study.get("delta", "")) is None:
                errors.append("study.delta 须为正整数")
            if study.get("once") != "true":
                errors.append("study.once 必须为 true")
            result[key] = {"art": study.get("art"),
                           "delta": int(study["delta"]) if study.get("delta", "").isdigit() else study.get("delta"),
                           "once": study.get("once") == "true"}
        elif key == "appraise":
            pairs, object_error = parse_named_object(value)
            if pairs is None:
                errors.append(f"appraise {object_error}")
                continue
            appraise = dict(pairs)
            if [key for key, _raw in pairs] != ["art", "dc"]:
                errors.append("appraise 对象须按 art,dc 且仅含这两个键")
            if appraise.get("art") != "art":
                errors.append("appraise.art 必须为 art")
            if re.fullmatch(r"\d+", appraise.get("dc", "")) is None:
                errors.append("appraise.dc 须为非负整数")
            result[key] = {"art": appraise.get("art"),
                           "dc": int(appraise["dc"]) if appraise.get("dc", "").isdigit() else appraise.get("dc")}
        elif key == "luck":
            if re.fullmatch(r"\d+", value) is None:
                errors.append("luck 须为非负整数")
            else:
                result[key] = int(value)
    return result, errors


def parse_collectible_attributes(cell: str) -> tuple[dict[str, Any] | None, list[str]]:
    if re.fullmatch(r"`[^`]*`", cell) is None:
        return None, ["属性投影须为且仅为一个反引号代码跨度"]
    return parse_collectible_values(cell[1:-1])


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
    path: Path, line: int, row: dict[str, str]
) -> tuple[list[str], list[str]]:
    problems: list[str] = []
    warnings: list[str] = []
    subcategory = markdown_text(row["子类"])
    lore = row["说明"]
    effect = row["效果字段"]
    projection = row["属性投影"]
    lore_length = len(markdown_text(lore))
    if not 60 <= lore_length <= 120:
        problems.append(f"说明长度 {lore_length}，须为 60–120 个 Unicode 码点（Markdown 标记不计）")
    if path.name == "items-collectibles.md":
        attributes, attribute_errors = parse_collectible_attributes(projection)
    else:
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
    if path.name == "items-collectibles.md":
        effect_values, effect_errors = parse_collectible_values(
            re.search(r"`([^`]*)`", effect).group(1)
            if re.search(r"`([^`]*)`", effect) else "",
            allow_structural=True,
        )
        problems.extend(f"效果字段：{error}" for error in effect_errors)
        effect_sub = fields.get("sub")
        if effect_sub is None or COLLECTIBLE_SUBS.get(effect_sub) != COLLECTIBLE_SUBS.get(subcategory):
            problems.append("效果字段 `sub` 须与子类列对应")
        if fields.get("stack") != "1":
            problems.append("效果字段 `stack` 必须为 1")
        if effect_values is not None:
            for key in COLLECTIBLE_REQUIRED_KEYS:
                if key in effect_values and key in attributes and effect_values[key] != attributes[key]:
                    problems.append(
                        f"双写不一致：`{key}` 效果字段为 {effect_values[key]!r}，"
                        f"属性投影为 {attributes[key]!r}"
                    )
        if 1 <= grade <= 12 and isinstance(attributes.get("giftValue"), int):
            expected_gift_value = grade_band(grade) + 1
            actual_gift_value = attributes["giftValue"]
            zero_exception = (
                actual_gift_value == 0
                and "无馈赠价值" in markdown_text(lore)
            )
            if actual_gift_value != expected_gift_value and not zero_exception:
                problems.append(
                    f"giftValue={actual_gift_value} 与品阶默认值 "
                    f"{expected_gift_value} 不一致，且说明未写明无馈赠价值的剧情复制品依据"
                )
        if 1 <= grade <= 12 and isinstance(attributes.get("appraise"), dict):
            expected_dc = 8 * grade - 4
            actual_dc = attributes["appraise"].get("dc")
            if actual_dc != expected_dc:
                problems.append(f"appraise.dc 须为 8×{grade}−4={expected_dc}，实际 {actual_dc}")
        return problems, warnings
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
    current_header: tuple[str, ...] | None = None
    allowed = SUBCATS.get(path.name)
    lines = path.read_text(encoding="utf-8").splitlines()
    for n, line in enumerate(lines, 1):
        if line.startswith("|"):
            header = tuple(table_cells(line))
            if path.name == "items-collectibles.md" and header and header[0] == "ID":
                if header == COLLECTIBLE_HEADER9:
                    formats.add(9)
                    current_columns = 9
                    current_header = header
                    continue
                problems.append(
                    f"第 {n} 行：收藏品九列表头顺序须为 "
                    f"{'｜'.join(COLLECTIBLE_HEADER9)}"
                )
                formats.add(9)
                current_columns = 9
                current_header = (
                    header if len(header) == 9 and set(header) == set(COLLECTIBLE_HEADER9)
                    else COLLECTIBLE_HEADER9
                )
                continue
            if header == HEADER7:
                formats.add(7)
                current_columns = 7
                current_header = HEADER7
                continue
            if header == HEADER9:
                formats.add(9)
                current_columns = 9
                current_header = HEADER9
                continue
        match = ROW.match(line)
        if not match:
            if line.startswith("| `") and not line.startswith("| `ID"):
                problems.append(f"第 {n} 行：像机器行但 ID 不合规（须 it_/eq_ + 小写字母数字下划线）")
            continue
        rows += 1
        iid = match.group(1)
        ids[iid] += 1
        if path.name == "items-collectibles.md" and not iid.startswith("it_"):
            problems.append(f"第 {n} 行 `{iid}`：收藏品 ID 须以 `it_` 开头")
        cells = [f"`{iid}`", *[cell.strip() for cell in match.group(2).strip().strip("|").split("|")]]
        columns = current_columns or (9 if path.name == "items-collectibles.md" else
                                      next(iter(formats)) if len(formats) == 1 else 7)
        if len(cells) != columns:
            label = "七列" if columns == 7 else "九列"
            problems.append(f"第 {n} 行 `{iid}`：应为{label}，实际 {len(cells)} 列")
            continue
        row_header = current_header or (COLLECTIBLE_HEADER9 if path.name == "items-collectibles.md"
                                        else HEADER7 if columns == 7 else HEADER9)
        row = dict(zip(row_header, cells))
        name = row["名称"]
        sub = markdown_text(row["子类"])
        grade = row["品阶"]
        source = row.get("出处", row.get("出处（书名 / 原创扩展）", ""))
        effect = row["效果字段"]
        look = row.get("外观要点", row.get("外观要点（供出图）", ""))
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
            row_problems, row_warnings = check_nine(path, n, row)
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
