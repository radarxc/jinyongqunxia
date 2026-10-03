#!/usr/bin/env python3
"""解释 town/schema.yaml 的结构约定；几何与跨记录约束由 check_town 处理。"""
from __future__ import annotations

import math
import re
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = yaml.safe_load((ROOT / "docs/design/town/schema.yaml").read_text())


def issue(code, message, path, at=None, severity="error"):
    return dict(code=code, severity=severity, message=message, path=path, at=at)


def sort_issues(issues):
    def key(row):
        at = row["at"]
        coord = (2, 0, 0) if at is None else ((0, at["z"], at["x"])
                 if "x" in at else (1, at["r"], at["q"]))
        return ({"error": 0, "warning": 1, "info": 2}[row["severity"]],
                row["code"], row["path"], coord)
    return sorted(issues, key=key)


class SchemaValidator:
    def __init__(self):
        self.errors = []

    def fail(self, suffix, path, text):
        self.errors.append(issue("TOWN_SCHEMA_" + suffix, text, path))

    def check(self, data, name, path="$"):
        definition = CONTRACT["definitions"][name]
        if not isinstance(data, dict):
            self.fail("TYPE", path, f"需要 {name} 对象")
            return
        fields = definition["fields"]
        required = definition.get("required", list(fields))
        for key in sorted(set(data) - set(fields), key=str):
            self.fail("UNKNOWN_FIELD", f"{path}.{key}", "未知字段")
        for key in required:
            if key not in data:
                self.fail("REQUIRED", f"{path}.{key}", "缺少必填字段；null 不代替缺字段")
        for key in fields.keys() & data.keys():
            self.value(data[key], fields[key], f"{path}.{key}", name, key)
        if name == "CitySpec":
            present = [key for key in ("wall", "walls") if key in data]
            if len(present) != 1:
                self.fail("WALL_FORM", path, "wall 与 walls 必须且只能出现一个")

    def value(self, value, field, path, owner="", key=""):
        typ = field["type"]
        if typ == "NamedWallSpec[]|none":
            if value == "none":
                return
            if not isinstance(value, list) or not value:
                self.fail("TYPE", path, "walls 需要非空 NamedWallSpec 数组或字符串 none")
                return
            for i, child in enumerate(value):
                self.check(child, "NamedWallSpec", f"{path}[{i}]")
            ids = [child.get("id") for child in value if isinstance(child, dict)]
            if len(ids) != len(set(ids)):
                self.fail("DUPLICATE_ID", path, "walls 的 id 必须唯一")
            return
        if "|null" in typ:
            if value is None:
                return
            typ = typ.replace("|null", "")
        if value is None:
            self.fail("TYPE", path, "非 nullable 字段不能为 null")
            return
        if typ == "GridPoint|HexPoint":
            if not isinstance(value, dict):
                self.fail("TYPE", path, "需要 GridPoint 或 HexPoint")
                return
            self.check(value, "GridPoint" if "x" in value else "HexPoint", path)
            return
        if " or lossless RLE" in typ:
            try:
                decoded = decode_ground(value, None)
                for i, row in enumerate(decoded):
                    self.check(row, "GroundCell", f"{path}[{i}]")
            except (ValueError, TypeError, KeyError) as exc:
                self.fail("RLE", path, str(exc))
            return
        if typ == "exactly one of rect or polygon":
            if not isinstance(value, dict) or set(value) not in ({"rect"}, {"polygon"}):
                self.fail("TYPE", path, "geometry 必须且只能有 rect 或 polygon")
            else:
                child = next(iter(value))
                self.check(value[child], child.title(), path + "." + child)
            return
        if typ.startswith("map<"):
            if not isinstance(value, dict) or any(not isinstance(k, str) for k in value):
                self.fail("TYPE", path, "需要字符串键 map")
                return
            child = typ.split(",", 1)[1][:-1]
            for k, v in value.items():
                if " or RLE" not in child:
                    self.value(v, {"type": child, "range": ""}, f"{path}.{k}")
                elif not isinstance(v, list):
                    self.fail("TYPE", f"{path}.{k}", "需要格数组或 RLE")
            return
        if typ.startswith("{"):
            expected = {part.split(":")[0] for part in typ[1:-1].split(",")}
            if not isinstance(value, dict) or set(value) != expected:
                self.fail("TYPE", path, f"需要键 {sorted(expected)}")
            elif any(type(v) is not int for v in value.values()):
                self.fail("TYPE", path, "对象值必须为整数")
            elif expected == {"w", "h"} and any(v < 1 for v in value.values()):
                self.fail("RANGE", path, "占地宽高必须至少 1")
            return
        if typ == "[integer,integer]":
            if not isinstance(value, list) or len(value) != 2 or any(type(v) is not int for v in value):
                self.fail("TYPE", path, "需要恰好两个整数")
                return
        elif match := re.fullmatch(r"(.+)\[(\d+\.\.(?:N|\d+))?\]", typ):
            if not isinstance(value, list):
                self.fail("TYPE", path, "需要数组")
                return
            if match[2]:
                lo, hi = match[2].split("..")
                if len(value) < int(lo) or (hi != "N" and len(value) > int(hi)):
                    self.fail("RANGE", path, f"数组长度应为 {match[2]}")
            for i, child in enumerate(value):
                self.value(child, {"type": match[1], "range": ""}, f"{path}[{i}]")
        elif typ in CONTRACT["definitions"]:
            self.check(value, typ, path)
        elif typ.startswith("enum"):
            allowed = CONTRACT["enums"].get(typ.removeprefix("enum."), field["range"])
            if value not in allowed:
                self.fail("ENUM", path, f"值必须属于 {allowed}")
        elif typ in ("integer", "int", "number", "boolean", "string") or typ.endswith(".id"):
            expected = {"integer": int, "int": int, "number": (int, float), "boolean": bool}
            valid = type(value) in (int, float) if typ == "number" else isinstance(value, expected.get(typ, str))
            if typ in ("integer", "int"):
                valid = type(value) is int
            if not valid or (isinstance(value, float) and not math.isfinite(value)):
                self.fail("TYPE", path, f"需要 {typ}")
                return
        else:
            self.fail("CONTRACT", path, f"未实现契约类型 {typ}")
            return
        self.range(value, field["range"], path, owner, key)

    def range(self, value, rule, path, owner, key):
        if rule in ("non_empty", "non_empty stable tag") and not value:
            self.fail("RANGE", path, "不得为空")
        if isinstance(rule, (int, float)) and value != rule:
            self.fail("RANGE", path, f"必须等于 {rule}")
        if isinstance(rule, list) and isinstance(value, list) and any(v not in rule for v in value):
            self.fail("ENUM", path, f"数组成员必须属于 {rule}")
        if not isinstance(rule, str):
            return
        if rule.startswith("town.") or rule in ("CitySpec", "TownLayout", "pcg32-xsh-rr-64-32",
                                                  "planning-mask-center-and-six-vertices-v1"):
            if value != rule:
                self.fail("VERSION", path, f"必须等于 {rule}")
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            limits = re.match(r"(-?\d+(?:\.\d+)?)\.\.(-?\d+(?:\.\d+)?)(?:;|$)", rule)
            if limits and not float(limits[1]) <= value <= float(limits[2]):
                self.fail("RANGE", path, f"范围为 {limits[0]}")
            if rule.startswith("0..N") and value < 0:
                self.fail("RANGE", path, "必须非负")
            if rule.startswith("one of ") and value not in yaml.safe_load(rule[7:]):
                self.fail("RANGE", path, rule)
        if isinstance(value, str):
            pattern = rule[:rule.index("$") + 1] if rule.startswith("^") and "$" in rule else None
            patterns = {("BuildingInstance", "id"): r"bi_[0-9]{4}",
                        ("GeneratedConnector", "id"): r"gc_[0-9]{4}",
                        ("NamedWallSpec", "id"): r"[a-z][a-z0-9_]*",
                        ("ZoneSpec", "id"): r"zone_[a-z0-9_]+",
                        ("Polyline", "id"): r"[a-z][a-z0-9_]*",
                        ("CitySpec", "chapter_id"): r"ch(?:0[1-9]|1[0-4])"}
            pattern = patterns.get((owner, key), pattern)
            if pattern and not re.fullmatch(pattern.replace("\\\\", "\\"), value):
                self.fail("RANGE", path, f"不符合 {pattern}")
            if owner == "SourceRef" and key == "accessed":
                try:
                    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
                        raise ValueError(value)
                    date.fromisoformat(value)
                except ValueError:
                    self.fail("RANGE", path, "需要有效的带引号 ISO-8601 日期字符串")
        if owner == "ProjectionSpec" and key == "tile_px" and value != [64, 32]:
            self.fail("RANGE", path, "tile_px 必须为 [64,32]")
        if owner == "RuntimePartitionSpec" and key.endswith("band_slots"):
            if any(type(v) is int and not 1 <= v <= 96 for v in value):
                self.fail("RANGE", path, "每个分带须在 1..96")


def validate_schema(data, name):
    validator = SchemaValidator()
    validator.check(data, name)
    return sort_issues(validator.errors)


def decode_ground(rows, width, height=None):
    """展开完整地面 RLE；width=None 仅校验值形状。"""
    if not isinstance(rows, list):
        raise ValueError("ground_cells 必须是数组")
    if not rows or isinstance(rows[0], dict):
        return rows
    result, cursor, previous = [], 0, None
    for run in rows:
        if not isinstance(run, list) or len(run) != 3:
            raise ValueError("RLE 每项必须是 [start,length,value]")
        start, length, value = run
        if type(start) is not int or type(length) is not int or length < 1 or start != cursor:
            raise ValueError("RLE 须连续、正长度、无空洞重叠")
        if not isinstance(value, dict) or "at" in value:
            raise ValueError("ground RLE 值必须为不含 at 的 GroundCell")
        if value == previous:
            raise ValueError("相邻等值 RLE 须合并")
        previous = value
        for index in range(start, start + length):
            result.append(dict(value, at={"x": index % width if width else 0,
                                          "z": index // width if width else 0}))
        cursor += length
    if width and height and cursor != width * height:
        raise ValueError("RLE 长度必须覆盖完整画幅")
    return result


def decode_zone(rows, width, height):
    if not isinstance(rows, list):
        raise ValueError("zone_coverage 需要格数组或 RLE")
    if not rows or isinstance(rows[0], dict):
        if any(not isinstance(p, dict) or set(p) != {"x", "z"}
               or any(type(v) is not int for v in p.values()) for p in rows):
            raise ValueError("zone_coverage 格须为整数 x/z")
        cells = [(p["x"], p["z"]) for p in rows]
        if cells != sorted(set(cells), key=lambda p: (p[1], p[0])):
            raise ValueError("zone_coverage 格数组须唯一并按 z/x 排序")
        return set(cells)
    result, cursor, previous = set(), 0, None
    for run in rows:
        if not isinstance(run, list) or len(run) != 3:
            raise ValueError("zone RLE 项需要 [start,length,bool]")
        start, length, value = run
        if type(start) is not int or start != cursor or type(length) is not int or length < 1:
            raise ValueError("zone RLE 须连续、正长度")
        if type(value) is not bool or value == previous:
            raise ValueError("zone RLE 值须为 bool，且合并邻接等值项")
        if value:
            result.update((i % width, i // width) for i in range(start, start + length))
        cursor += length
        previous = value
    if cursor != width * height:
        raise ValueError("zone RLE 须覆盖完整画幅")
    return result
