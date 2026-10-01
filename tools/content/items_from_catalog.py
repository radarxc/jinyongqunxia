#!/usr/bin/env python3
"""Generate strict item.v1 YAML from the eleven seven-column item catalogs.

The catalog rows remain the authored source. Fields unsupported by the current Zod
schema are retained in text.desc and marked runtimeProjection instead of invented.
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from decimal import Decimal
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
CATALOG_DIR = ROOT / "docs/design/catalog"
OUTPUT_DIR = ROOT / "content/items"
# Keep the five catalog-backed bootstrap items at their established paths.
COMMON_ITEMS_DIR = ROOT / "content/common/items"
COMMON_ITEM_IDS = frozenset({
    "eq_qinggangjian", "it_jinchuangyao", "it_jingmi",
    "it_miji_taizuchangquan", "it_xiaohuandan",
})
CATALOGS = (
    "items-accessories.md", "items-armor.md", "items-belts.md",
    "items-clothing.md", "items-food.md", "items-hidden-weapons.md",
    "items-innerarmor.md", "items-manuals.md", "items-medicine.md",
    "items-shoes.md", "items-weapons.md",
)
EXPECTED_COUNTS = {
    "items-accessories.md": 48, "items-armor.md": 8, "items-belts.md": 26,
    "items-clothing.md": 30, "items-food.md": 28, "items-hidden-weapons.md": 24,
    "items-innerarmor.md": 8, "items-manuals.md": 18, "items-medicine.md": 32,
    "items-shoes.md": 26, "items-weapons.md": 118,
}
CHAPTERS = {
    "ch01": "ch01_tianlong", "ch02": "ch02_shediao",
    "ch03": "ch03_shendiao", "ch04": "ch04_yitian",
    "ch05": "ch05_xiaoao", "ch06": "ch06_xiake",
    "ch07": "ch07_bixue", "ch08": "ch08_luding",
    "ch09": "ch09_liancheng", "ch10": "ch10_baima",
    "ch11": "ch11_yuanyang", "ch12": "ch12_shujian",
    "ch13": "ch13_feihu", "ch14": "ch14_xueshan",
}
ROW = re.compile(r"^\|\s*`((?:it|eq)_[a-z0-9_]+)`\s*\|(.*)$")
CODE = re.compile(r"`([^`]*)`")
MARKUP = re.compile(r"\*\*|`")
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


def rows() -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for filename in CATALOGS:
        path = CATALOG_DIR / filename
        count = 0
        for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            match = ROW.match(line)
            if match is None:
                continue
            cells = [part.strip() for part in match.group(2).strip().strip("|").split("|")]
            if len(cells) != 6:
                raise ValueError(f"{path}:{line_number}: expected seven columns")
            item_id = match.group(1)
            if item_id in seen:
                raise ValueError(f"duplicate item ID: {item_id}")
            seen.add(item_id)
            raw, fields = parse_effect(cells[4], path, line_number)
            result.append({"id": item_id, "name": cells[0], "subZh": cells[1],
                           "source": cells[3], "look": cells[5], "raw": raw,
                           "fields": fields, "catalog": filename})
            count += 1
        if count != EXPECTED_COUNTS[filename]:
            raise ValueError(f"{path}: expected {EXPECTED_COUNTS[filename]}, got {count}")
    if len(result) != sum(EXPECTED_COUNTS.values()):
        raise ValueError(f"expected 366 rows, got {len(result)}")
    return sorted(result, key=lambda row: row["id"])


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
    description = f"名录投影：{row['subZh']}；{row['raw']}。外观：{clean(row['look'])}"
    item["text"] = {"desc": description, "short": row["name"]}
    item["extension"] = extension(row, kind, sub, grade)
    return item


def render(item: dict[str, Any]) -> str:
    return yaml.safe_dump(item, allow_unicode=True, sort_keys=False, width=1000)


def expected_files() -> dict[Path, str]:
    result: dict[Path, str] = {}
    for row in rows():
        directory = COMMON_ITEMS_DIR if row["id"] in COMMON_ITEM_IDS else OUTPUT_DIR
        path = directory / f"{row['id']}.yaml"
        result[path] = render(build(row))
    return result


def check(generated: dict[Path, str]) -> int:
    problems: list[str] = []
    actual = set(OUTPUT_DIR.glob("*.yaml")) if OUTPUT_DIR.exists() else set()
    actual.update(path for path in COMMON_ITEMS_DIR.glob("*.yaml")
                  if path.stem in COMMON_ITEM_IDS)
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
    counts = Counter(item_kind(row) for row in rows())
    grades = Counter(int(row["fields"]["grade"]) for row in rows())
    print(f"items_from_catalog: {len(generated)} files current; kinds={dict(sorted(counts.items()))}; grades={dict(sorted(grades.items()))}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    generated = expected_files()
    if args.check:
        return check(generated)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    COMMON_ITEMS_DIR.mkdir(parents=True, exist_ok=True)
    for path in sorted(OUTPUT_DIR.glob("*.yaml")):
        if path not in generated:
            path.unlink()
    for path, text in generated.items():
        path.write_text(text, encoding="utf-8")
    print(f"items_from_catalog: wrote {len(generated)} sorted files under content/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
