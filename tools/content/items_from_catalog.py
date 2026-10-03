#!/usr/bin/env python3
"""Generate strict item.v1 YAML from discovered seven/nine-column item catalogs.

The catalog rows remain the authored source. Fields unsupported by the current Zod
schema are retained in text.desc and marked runtimeProjection instead of invented;
authoring-only image notes and duplicated structured fields stay in the catalog.
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CATALOG_DIR = ROOT / "docs/design/catalog"
OFFICIAL_REGISTRY = ROOT / "docs/design/10-items-and-equipment.md"
OUTPUT_DIR = ROOT / "content/items"
# Keep the five catalog-backed bootstrap items at their established paths.
COMMON_ITEMS_DIR = ROOT / "content/common/items"
COMMON_ITEM_IDS = frozenset({
    "eq_qinggangjian", "it_jinchuangyao", "it_jingmi",
    "it_miji_taizuchangquan", "it_xiaohuandan",
})
CHAPTERS = {
    "ch01": "ch01_tianlong", "ch02": "ch02_shediao",
    "ch03": "ch03_shendiao", "ch04": "ch04_yitian",
    "ch05": "ch05_xiaoao", "ch06": "ch06_xiake",
    "ch07": "ch07_bixue", "ch08": "ch08_luding",
    "ch09": "ch09_liancheng", "ch10": "ch10_baima",
    "ch11": "ch11_yuanyang", "ch12": "ch12_shujian",
    "ch13": "ch13_feihu", "ch14": "ch14_xueshan",
}
ITEM_ID = re.compile(r"`((?:it|eq)_[a-z0-9_]+)`")
CODE = re.compile(r"`([^`]*)`")
MARKUP = re.compile(r"\*\*|`")
ITEM_HEADER7 = (
    "ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
    "效果字段", "外观要点（供出图）",
)
ITEM_HEADER9 = (
    "ID", "名称", "子类", "品阶", "出处（书名 / 原创扩展）",
    "说明", "效果字段", "属性投影", "外观要点（供出图）",
)
ITEM_HEADERS = {ITEM_HEADER7: 7, ITEM_HEADER9: 9}
ATTRIBUTE_KEYS = (
    "atk", "hardness", "qiAffinity", "qiEffect",
    "def", "reflect", "antiHidden", "agi", "block", "luck",
    "poison", "antiPoison", "restoreQi", "qiCultivation", "con",
    "healInner", "healOuter", "stamina", "skillRef", "readWis",
    "readBre", "maxLayer", "cultivation", "unlockRef", "artRef",
    "artReq", "travel", "ruleRef",
)
REFERENCE_ATTRIBUTES = frozenset({
    "qiEffect", "skillRef", "unlockRef", "artRef", "ruleRef",
})
FORMAL_ATTRIBUTE_IDS = {
    "qiEffect": re.compile(r"(?:bf|ue|rule)_[a-z0-9_]+"),
    "skillRef": re.compile(r"sk_[a-z0-9_]+"),
    "ruleRef": re.compile(r"rule_[a-z0-9_]+"),
    "unlockRef": re.compile(r"[a-z][a-z0-9]*_[a-z0-9_]+"),
    "artRef": re.compile(r"(?:med|poi|antidote|forge|alchemy|formation|music|art|chess|speech)"),
}
REGISTRY_HEADING = "### 14.2 ID 清单"
GRADE_RESOURCE = {
    1: "huang9", 2: "huang6", 3: "huang3", 4: "xuan9",
    5: "xuan6", 6: "xuan3", 7: "di9", 8: "di6",
    9: "di3", 10: "tian9", 11: "tian6", 12: "tian3",
}
RESOURCE_OVERRIDES = {
    "it_qiannianrenshen": "res_yaocai_di5",
    "it_tianshanxuelian": "res_yaocai_di1",
    "it_duanchangcao": "res_ducai_di9",
}
STRUCTURAL = {
    "grade", "slot", "cat", "hands", "pair", "tags",
    "armorWeight", "hiddenKind", "divine", "catalogTian", "unique",
    "price", "skill", "variant", "maxLayer", "materialGrade",
    "herbFamily", "ageYears", "ingredientKind",
}
USE_EFFECT_KEYS = frozenset({
    "apply", "breakCap", "buff", "cure", "dispel", "healPct",
    "meal", "mpPct", "perm.mpMaxPct", "permStat", "sta", "staPct",
    "sxpBuff", "sxpGrant",
})
USE_CONTROL_KEYS = frozenset({
    "action", "context", "hours", "meridianAid", "perBattle",
    "perChapter", "uniqueUse",
})


@dataclass(frozen=True)
class RegistryAudit:
    """Exact-ID coverage found in design/10's official registry section."""

    catalog_count: int
    registry_id_count: int
    registered_catalog_count: int
    unregistered_ids: tuple[str, ...]


def clean(value: str) -> str:
    return MARKUP.sub("", value).strip()


def parse_effect(cell: str, path: Path, line: int) -> tuple[str, dict[str, str]]:
    match = CODE.search(cell)
    if match is None:
        raise ValueError(f"{path}:{line}: effect code span missing")
    raw = match.group(1).strip()
    fields: dict[str, str] = {}
    for token in raw.split(";"):
        token = token.strip()
        if not token:
            continue
        key, separator, value = token.partition("=")
        if not separator or not key.strip() or key.strip() in fields:
            raise ValueError(f"{path}:{line}: malformed/duplicate effect token {token!r}")
        fields[key.strip()] = value.strip()
    if "grade" not in fields:
        raise ValueError(f"{path}:{line}: grade missing")
    return raw, fields


def parse_attributes(cell: str, path: Path, line: int) -> dict[str, Any]:
    if re.fullmatch(r"`[^`]*`", cell) is None:
        raise ValueError(f"{path}:{line}: attribute projection must be one code span")
    raw = cell[1:-1]
    result: dict[str, Any] = {"version": 2}
    if raw == "—":
        return result
    if not raw or re.fullmatch(r"[^;]+(?:; [^;]+)*", raw) is None:
        raise ValueError(f"{path}:{line}: malformed attribute projection")
    keys: list[str] = []
    for token in raw.split("; "):
        key, separator, value = token.partition("=")
        if not separator or key not in ATTRIBUTE_KEYS or key in result:
            raise ValueError(f"{path}:{line}: malformed/duplicate attribute token {token!r}")
        keys.append(key)
        if key in REFERENCE_ATTRIBUTES:
            if not value:
                raise ValueError(f"{path}:{line}: empty attribute reference {key}")
            if FORMAL_ATTRIBUTE_IDS[key].fullmatch(value) is None:
                raise ValueError(f"{path}:{line}: invalid attribute reference {key}={value}")
            result[key] = value
        elif re.fullmatch(r"\d+", value):
            result[key] = int(value)
        else:
            raise ValueError(f"{path}:{line}: attribute {key} must be a non-negative integer")
    if keys != sorted(keys, key=ATTRIBUTE_KEYS.index):
        raise ValueError(f"{path}:{line}: attribute keys out of canonical order")
    return result


def catalog_paths(catalog_dir: Path = CATALOG_DIR) -> tuple[Path, ...]:
    paths = tuple(sorted(catalog_dir.glob("items-*.md")))
    if not paths:
        raise ValueError(f"{catalog_dir}: no items-*.md catalogs found")
    return paths


def table_cells(line: str) -> list[str]:
    return [part.strip() for part in line.strip().strip("|").split("|")]


def is_separator(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def parse_catalog(path: Path) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    in_item_table = False
    columns: int | None = None
    formats: set[int] = set()
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.startswith("|"):
            in_item_table = False
            continue
        cells = table_cells(line)
        if tuple(cells) in ITEM_HEADERS:
            columns = ITEM_HEADERS[tuple(cells)]
            formats.add(columns)
            if len(formats) > 1:
                raise ValueError(f"{path}:{line_number}: mixed seven/nine-column item tables")
            in_item_table = True
            continue
        if not in_item_table:
            continue
        assert columns is not None
        if is_separator(cells):
            if len(cells) != columns:
                raise ValueError(f"{path}:{line_number}: expected {columns} columns")
            continue
        if len(cells) != columns:
            raise ValueError(f"{path}:{line_number}: expected {columns} columns")
        match = ITEM_ID.fullmatch(cells[0])
        if match is None:
            raise ValueError(f"{path}:{line_number}: invalid item ID {cells[0]!r}")
        if any(not cell for cell in cells[1:]):
            raise ValueError(f"{path}:{line_number}: empty required field")
        effect_index = 5 if columns == 7 else 6
        raw, fields = parse_effect(cells[effect_index], path, line_number)
        row = {
            "id": match.group(1), "name": cells[1], "subZh": cells[2],
            "source": cells[4], "look": cells[-1], "raw": raw,
            "fields": fields, "catalog": path.name, "line": line_number,
        }
        if columns == 9:
            row["lore"] = cells[5]
            row["attributes"] = parse_attributes(cells[7], path, line_number)
        result.append(row)
    if not result:
        raise ValueError(f"{path}: no item rows found")
    return result


def rows(catalog_dir: Path = CATALOG_DIR) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    seen: dict[str, tuple[Path, int]] = {}
    for path in catalog_paths(catalog_dir):
        for row in parse_catalog(path):
            item_id = row["id"]
            if item_id in seen:
                first_path, first_line = seen[item_id]
                raise ValueError(
                    f"duplicate item ID: {item_id} "
                    f"({first_path}:{first_line}, {path}:{row['line']})"
                )
            seen[item_id] = (path, row["line"])
            result.append(row)
    return sorted(result, key=lambda row: row["id"])


def catalog_counts(parsed_rows: list[dict[str, Any]]) -> dict[str, int]:
    return dict(sorted(Counter(row["catalog"] for row in parsed_rows).items()))


def official_registry_ids(path: Path = OFFICIAL_REGISTRY) -> set[str] | None:
    """Return exact IDs in design/10 §14.2, or None when no registry exists."""
    if not path.is_file():
        return None
    text = path.read_text(encoding="utf-8")
    heading = re.search(rf"^{re.escape(REGISTRY_HEADING)}\s*$", text, re.MULTILINE)
    if heading is None:
        return None
    remainder = text[heading.end():]
    next_section = re.search(r"^##\s+", remainder, re.MULTILINE)
    section = remainder[:next_section.start()] if next_section else remainder
    return set(ITEM_ID.findall(section))


def audit_official_registry(
    parsed_rows: list[dict[str, Any]], path: Path = OFFICIAL_REGISTRY
) -> RegistryAudit | None:
    registry_ids = official_registry_ids(path)
    if registry_ids is None:
        return None
    catalog_ids = {row["id"] for row in parsed_rows}
    registered = catalog_ids & registry_ids
    return RegistryAudit(
        catalog_count=len(catalog_ids),
        registry_id_count=len(registry_ids),
        registered_catalog_count=len(registered),
        unregistered_ids=tuple(sorted(catalog_ids - registry_ids)),
    )


def scalar(value: str) -> Any:
    if value == "true":
        return True
    if value == "false":
        return False
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    if re.fullmatch(r"-?\d+(?:\.\d+)?%", value):
        basis_points = Decimal(value[:-1]) * 100
        if basis_points != basis_points.to_integral_value():
            raise ValueError(f"percentage cannot be represented as integer bp: {value!r}")
        return int(basis_points)
    return value


def equipment_kind(row: dict[str, Any]) -> tuple[str, str, str]:
    catalog, sub = row["catalog"], row["subZh"]
    if catalog == "items-weapons.md":
        return "weapon", row["fields"].get("cat", "exotic"), "mainHand"
    if catalog == "items-hidden-weapons.md":
        if row["id"].startswith("it_"):
            return "ammo", row["fields"]["hiddenKind"], "offHand"
        return "hidden", row["fields"]["hiddenKind"], "offHand"
    slots = {
        "items-armor.md": "body", "items-clothing.md": "body",
        "items-innerarmor.md": "innerBody", "items-belts.md": "waist",
        "items-shoes.md": "feet",
    }
    slot = row["fields"].get("slot", slots.get(catalog))
    if slot is None:
        if sub.startswith("护肩"):
            slot = "shoulder"
        elif sub.startswith("披风"):
            slot = "cape"
        else:
            slot = "head"
    return "armor", slot, slot


def material_kind(row: dict[str, Any]) -> str | None:
    sub = row["subZh"]
    if sub.startswith("药材"):
        return "toxin" if "毒草" in sub else "herb"
    if sub.startswith("食材"):
        return "ingredient"
    return None


def item_kind(row: dict[str, Any]) -> str:
    if row["catalog"] in {
        "items-accessories.md", "items-armor.md", "items-belts.md",
        "items-clothing.md", "items-hidden-weapons.md",
        "items-innerarmor.md", "items-shoes.md", "items-weapons.md",
    }:
        return equipment_kind(row)[0]
    if row["catalog"] == "items-manuals.md":
        return "manual"
    if material_kind(row) is not None:
        return "material"
    if row["subZh"].startswith("食品"):
        return "dish" if "菜肴" in row["subZh"] or "名菜" in row["subZh"] else "food"
    if row["subZh"].startswith("补品"):
        return "tonic"
    if "奇毒" in row["subZh"] or "控制" in row["subZh"]:
        return "poison"
    return "pill"


def chapters(source: str) -> str | list[str]:
    codes = sorted({CHAPTERS[code] for code in re.findall(r"ch(?:0[1-9]|1[0-4])", source)})
    return codes or "any"


def origin(source: str) -> tuple[str, str | None]:
    if "原创扩展" in source and "《" not in source and "·" not in source:
        return "expanded", None
    if "原创扩展" in source or "待考" in source:
        return "canonExpanded", clean(source)
    return "canon", clean(source)


def sub_key(row: dict[str, Any], kind: str) -> str:
    fields = row["fields"]
    if kind in {"weapon", "ammo", "hidden"}:
        return fields.get("cat") or fields.get("hiddenKind") or kind
    if kind == "manual":
        return fields["variant"]
    if kind == "armor":
        by_catalog = {
            "items-armor.md": "officialArmor",
            "items-clothing.md": "clothing",
            "items-innerarmor.md": "innerArmor",
            "items-belts.md": "belt",
            "items-shoes.md": "shoes",
        }
        if row["catalog"] in by_catalog:
            return by_catalog[row["catalog"]]
        return {"shoulder": "shoulder", "cape": "cape",
                "head": "headwear"}.get(fields.get("slot", ""), "armor")
    material = material_kind(row)
    if material is not None:
        return material
    return {"pill": "medicine", "tonic": "tonic", "poison": "poison",
            "food": "food", "dish": "dish"}.get(kind, kind)


def stack_limit(kind: str, grade: int) -> int:
    if kind in {"weapon", "armor", "offhand", "hidden", "accessory", "manual"}:
        return 1
    if kind == "material":
        return 999
    if kind in {"ammo", "pill", "poison", "antidote"}:
        if kind == "pill" and grade >= 10:
            return 9
        return 99
    return 9 if grade >= 10 else 20


def parse_object(value: str) -> dict[str, Any]:
    if not value.startswith("{") or not value.endswith("}"):
        raise ValueError(f"expected object literal, got {value!r}")
    result: dict[str, Any] = {}
    for token in value[1:-1].split(","):
        key, separator, raw = token.strip().partition(":")
        if not separator:
            raise ValueError(f"malformed object token: {token!r}")
        result[key] = scalar(raw)
    return result


def dispel_params(value: str) -> dict[str, Any]:
    tags_text, separator, grade_text = value.rpartition(":g")
    if not separator or not grade_text.isdigit():
        tags_text = value
        grade_text = ""
    tags = [tag.strip() for tag in tags_text.split(",") if tag.strip()]
    if not tags:
        raise ValueError(f"dispel tags missing: {value!r}")
    result: dict[str, Any] = {"tags": tags}
    if grade_text:
        result["grade"] = int(grade_text)
    return result


def ratio_bp(value: str) -> int:
    ratio = Decimal(value) * 10_000
    if ratio != ratio.to_integral_value():
        raise ValueError(f"ratio cannot be represented as integer bp: {value!r}")
    return int(ratio)


def use_spec(row: dict[str, Any], kind: str, grade: int) -> dict[str, Any]:
    fields = row["fields"]
    context = fields.get("context", "field" if kind in {"ammo", "tonic"} else "both")
    default_action = "load" if kind == "ammo" else ("eat" if kind in {"food", "dish"} else "consume")
    action = fields.get("action", default_action)
    target = "enemy" if kind == "poison" else "self"
    effects: list[dict[str, Any]] = []
    for key, raw in fields.items():
        if key not in USE_EFFECT_KEYS:
            continue
        op = {"apply": "applyBuff", "buff": "applyBuff", "cure": "dispel",
              "meal": "meal", "perm.mpMaxPct": "permMaxPct",
              "sta": "staPct"}.get(key, key.replace(".", "_"))
        params: dict[str, Any]
        if key in {"healPct", "mpPct", "staPct"}:
            params = {"valueBp": scalar(raw)}
        elif key == "sta":
            if raw != "full":
                raise ValueError(f"unsupported stamina directive: {raw!r}")
            params = {"valueBp": 10_000}
        elif key == "perm.mpMaxPct":
            params = {"mpMaxBp": scalar(raw)}
        elif key == "permStat":
            params = {"stat": "chosenInnate", "value": scalar(raw)}
        elif key == "sxpGrant":
            params = {"pctNextBp": ratio_bp(raw)}
        elif key == "sxpBuff":
            match = re.fullmatch(r"(\d+(?:\.\d+)?)x:(\d+)battle", raw)
            if match is None:
                raise ValueError(f"malformed sxpBuff: {raw!r}")
            params = {"multiplierBp": ratio_bp(match.group(1)),
                      "durationBattles": int(match.group(2))}
        elif key in {"cure", "dispel"}:
            params = dispel_params(raw)
        elif key in {"apply", "buff", "meal"}:
            params = {"value": raw}
        else:
            params = {"value": scalar(raw)}
        effects.append({"op": op, "params": params})
    result: dict[str, Any] = {"context": context, "action": action, "target": target,
                              "effects": effects}
    if "perBattle" in fields:
        result["battleLimit"] = {"perBattle": int(fields["perBattle"]), "cooldown": 2}
    if "meridianAid" in fields:
        result["meridianAid"] = parse_object(fields["meridianAid"])
    if "hours" in fields:
        result["fieldTime"] = int(fields["hours"])
    if row["id"] == "it_jiuzhuanhuanhundan":
        result["context"] = "battle"
        result["effects"] = [{"op": "revive", "params": {"valueBp": 3000}}]
    return result


def mat_family(row: dict[str, Any], kind: str, sub: str) -> str:
    if kind == "weapon":
        return "wood" if sub in {"staff", "whip"} else "metal"
    text = row["subZh"]
    if any(word in text for word in ("布", "帛", "丝", "绸", "锦", "纱", "缎", "衣", "披", "巾")):
        return "fabric"
    if any(word in text for word in ("皮", "裘", "革")):
        return "leather"
    if any(word in text for word in ("玉", "佩", "珠")):
        return "jade"
    return "metal"


def equipment_extension(row: dict[str, Any], kind: str, sub: str) -> dict[str, Any]:
    fields = row["fields"]
    _ignored_kind, _ignored_sub, default_slot = equipment_kind(row)
    slot = fields.get("slot", default_slot)
    value: dict[str, Any] = {"slot": slot}
    if kind == "weapon":
        value["cat"] = fields["cat"]
        value["hands"] = "pair" if fields.get("pair") == "true" else scalar(fields.get("hands", "1"))
    elif kind == "hidden":
        value["cat"] = "hidden"
        value["hiddenKind"] = fields["hiddenKind"]
    tags = [tag.strip() for tag in fields.get("tags", "").split(",") if tag.strip()]
    value["tags"] = tags
    if "armorWeight" in fields:
        value["armorWeight"] = fields["armorWeight"]
    value["matFamily"] = mat_family(row, kind, sub)
    value["divine"] = fields.get("divine") == "true"
    value["catalogTian"] = fields.get("catalogTian") == "true"
    value["uniqueEquipped"] = fields.get("unique") == "true"
    return {"type": "equipment", "value": value}


def material_extension(row: dict[str, Any], grade: int) -> dict[str, Any]:
    fields = row["fields"]
    family = material_kind(row)
    assert family is not None
    resource_family = {
        "herb": "yaocai", "toxin": "ducai", "ingredient": "shicai",
    }[family]
    if fields.get("ingredientKind") == "grain":
        resource_family = "liangshi"
    elif fields.get("ingredientKind") == "meat":
        resource_family = "shoucai"
    resource = RESOURCE_OVERRIDES.get(row["id"], f"res_{resource_family}_{GRADE_RESOURCE[grade]}")
    value: dict[str, Any] = {
        "family": family, "resourceRef": resource,
        "materialGrade": int(fields.get("materialGrade", grade)),
        "rare": grade >= 10,
    }
    if "herbFamily" in fields:
        value["herbFamily"] = fields["herbFamily"]
    if "ageYears" in fields:
        value["ageYears"] = int(fields["ageYears"])
    if "ingredientKind" in fields:
        value["ingredientKind"] = fields["ingredientKind"]
    return {"type": "material", "value": value}


def extension(row: dict[str, Any], kind: str, sub: str, grade: int) -> dict[str, Any]:
    if kind in {"weapon", "armor", "offhand", "hidden", "accessory"}:
        return equipment_extension(row, kind, sub)
    if kind == "material":
        return material_extension(row, grade)
    if kind == "manual":
        fields = row["fields"]
        return {"type": "manual", "value": {"skill": fields["skill"],
                "maxLayer": int(fields["maxLayer"]), "variant": fields["variant"],
                "readMul": 1}}
    return {"type": "generic", "value": {}}


def build(row: dict[str, Any]) -> dict[str, Any]:
    fields = row["fields"]
    grade = int(fields["grade"]); kind = item_kind(row); sub = sub_key(row, kind)
    item_origin, canon_ref = origin(row["source"]); flags: list[str] = []
    if fields.get("unique") == "true" or fields.get("uniqueBatch") == "true":
        flags.append("unique")
    if fields.get("uniqueUse") == "true" or fields.get("perChapter") == "1":
        flags.append("uniqueUse")
    unsupported = sorted(key for key in fields
                         if key not in STRUCTURAL | USE_EFFECT_KEYS | USE_CONTROL_KEYS)
    if row["catalog"] == "items-armor.md" or unsupported:
        flags.append("runtimeProjection")
    item: dict[str, Any] = {
        "schemaVersion": "item.v1", "id": row["id"], "name": row["name"],
        "kind": kind, "sub": sub, "grade": grade, "stack": stack_limit(kind, grade),
        "chapters": chapters(row["source"]), "origin": item_origin,
    }
    if canon_ref is not None:
        item["canonRef"] = canon_ref
    item["price"] = None if grade >= 10 or fields.get("price") == "null" else "auto"
    item["flags"] = sorted(flags)
    if kind in {"ammo", "pill", "tonic", "poison", "antidote", "food", "dish", "wine"}:
        item["use"] = use_spec(row, kind, grade)
    item["assets"] = {"icon": f"item/{row['id'][3:]}"}
    appearance_parts = [
        part.strip() for part in re.split(r"[，；。]", clean(row["look"]))
        if part.strip()
    ]
    appearance = "，".join(appearance_parts[:2])
    description = f"外观：{appearance}。"
    if unsupported:
        projection = "; ".join(f"{key}={fields[key]}" for key in unsupported)
        description += f" 待运行时投影：{projection}。"
    item["text"] = {"desc": description}
    if "lore" in row:
        item["text"]["lore"] = clean(row["lore"])
    item["extension"] = extension(row, kind, sub, grade)
    if "attributes" in row:
        item["extension"]["value"]["attributes"] = row["attributes"]
    return item


def yaml_scalar(value: Any) -> str:
    if value is None:
        return "null"
    if value is True:
        return "true"
    if value is False:
        return "false"
    if isinstance(value, int):
        return str(value)
    if not isinstance(value, str):
        raise TypeError(f"unsupported YAML scalar: {type(value).__name__}")
    if (not value or "\n" in value or "\r" in value or "\t" in value
            or " #" in value or ": " in value
            or value[0] in "-?:,[]{}#&*!|>'\"%@`"
            or value.lower() in {"null", "true", "false", "yes", "no", "on", "off", "~"}
            or re.fullmatch(r"-?\d+(?:\.\d+)?", value)):
        escaped = value.replace("\\", "\\\\").replace('\"', '\\"')
        return f'"{escaped}"'
    return value


def yaml_lines(value: Any, indent: int = 0) -> list[str]:
    prefix = " " * indent
    if isinstance(value, dict):
        lines: list[str] = []
        for key, child in value.items():
            scalar_key = yaml_scalar(key)
            if isinstance(child, (dict, list)):
                if not child:
                    lines.append(f"{prefix}{scalar_key}: {'{}' if isinstance(child, dict) else '[]'}")
                else:
                    lines.append(f"{prefix}{scalar_key}:")
                    child_indent = indent if isinstance(child, list) else indent + 2
                    lines.extend(yaml_lines(child, child_indent))
            else:
                lines.append(f"{prefix}{scalar_key}: {yaml_scalar(child)}")
        return lines
    if isinstance(value, list):
        lines = []
        for child in value:
            if isinstance(child, dict):
                items = list(child.items())
                first_key, first_value = items[0]
                lines.append(f"{prefix}- {yaml_scalar(first_key)}: {yaml_scalar(first_value)}")
                lines.extend(yaml_lines(dict(items[1:]), indent + 2))
            elif isinstance(child, list):
                lines.append(f"{prefix}-")
                lines.extend(yaml_lines(child, indent + 2))
            else:
                lines.append(f"{prefix}- {yaml_scalar(child)}")
        return lines
    return [f"{prefix}{yaml_scalar(value)}"]


def render(item: dict[str, Any]) -> str:
    return "\n".join(yaml_lines(item)) + "\n"


def expected_files(parsed_rows: list[dict[str, Any]] | None = None) -> dict[Path, str]:
    result: dict[Path, str] = {}
    for row in parsed_rows if parsed_rows is not None else rows():
        text = render(build(row))
        if row["id"] not in COMMON_ITEM_IDS:
            result[OUTPUT_DIR / f"{row['id']}.yaml"] = text
    return result


def registry_status(parsed_rows: list[dict[str, Any]]) -> str:
    audit = audit_official_registry(parsed_rows)
    if audit is None:
        return "registry=absent"
    return (
        f"registryExact={audit.registered_catalog_count}/{audit.catalog_count}"
        f" (sectionIds={audit.registry_id_count}, "
        f"unregistered={len(audit.unregistered_ids)})"
    )


def common_item_problems(parsed_rows: list[dict[str, Any]]) -> list[str]:
    catalog_ids = {row["id"] for row in parsed_rows}
    problems = [
        f"bootstrap ID absent from catalogs: {item_id}"
        for item_id in sorted(COMMON_ITEM_IDS - catalog_ids)
    ]
    for item_id in sorted(COMMON_ITEM_IDS & catalog_ids):
        path = COMMON_ITEMS_DIR / f"{item_id}.yaml"
        if not path.is_file():
            problems.append(f"missing bootstrap: {path.relative_to(ROOT)}")
            continue
        matches = re.findall(
            r"^id:\s*([a-z0-9_]+)\s*$",
            path.read_text(encoding="utf-8"),
            re.MULTILINE,
        )
        if matches != [item_id]:
            problems.append(f"bootstrap ID mismatch: {path.relative_to(ROOT)}")
    return problems


def check(generated: dict[Path, str], parsed_rows: list[dict[str, Any]] | None = None) -> int:
    source_rows = parsed_rows if parsed_rows is not None else rows()
    problems = common_item_problems(source_rows)
    actual = set(OUTPUT_DIR.glob("*.yaml")) if OUTPUT_DIR.exists() else set()
    for path, text in generated.items():
        if not path.is_file():
            problems.append(f"missing: {path.relative_to(ROOT)}")
        elif path.read_text(encoding="utf-8") != text:
            problems.append(f"stale: {path.relative_to(ROOT)}")
    for path in sorted(actual - set(generated)):
        problems.append(f"unexpected: {path.relative_to(ROOT)}")
    if problems:
        print("items_from_catalog: check failed", file=sys.stderr)
        for problem in problems[:50]:
            print(f"  - {problem}", file=sys.stderr)
        return 1
    counts = Counter(item_kind(row) for row in source_rows)
    grades = Counter(int(row["fields"]["grade"]) for row in source_rows)
    print(
        f"items_from_catalog: {len(source_rows)} rows current "
        f"({len(generated)} generated, {len(COMMON_ITEM_IDS)} bootstrap); "
        f"catalogs={catalog_counts(source_rows)}; "
        f"kinds={dict(sorted(counts.items()))}; "
        f"grades={dict(sorted(grades.items()))}; {registry_status(source_rows)}"
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    parsed_rows = rows()
    generated = expected_files(parsed_rows)
    if args.check:
        return check(generated, parsed_rows)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    bootstrap_problems = common_item_problems(parsed_rows)
    if bootstrap_problems:
        raise ValueError("; ".join(bootstrap_problems))
    for path in sorted(OUTPUT_DIR.glob("*.yaml")):
        if path not in generated:
            path.unlink()
    for path, text in generated.items():
        if not path.is_file() or path.read_text(encoding="utf-8") != text:
            path.write_text(text, encoding="utf-8")
    print(
        f"items_from_catalog: validated {len(parsed_rows)} rows; wrote "
        f"{len(generated)} sorted files under content/items/; "
        f"retained {len(COMMON_ITEM_IDS)} bootstrap files; "
        f"catalogs={catalog_counts(parsed_rows)}; {registry_status(parsed_rows)}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
