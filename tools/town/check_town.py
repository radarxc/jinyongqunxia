#!/usr/bin/env python3
"""校验 CitySpec / TownLayout；开发态缺素材警告，严格模式报错。"""
from __future__ import annotations

import argparse
from collections import Counter, deque
from functools import lru_cache
import hashlib
import json
import math
from pathlib import Path
import re
import sys

import yaml

from schema_check import ROOT, decode_ground, decode_zone, issue, sort_issues, validate_schema

DIRECTIONS = ((0, 1), (1, 0), (0, -1), (-1, 0))
PALETTE = {"prp_song_dali_camellia", "prp_song_dali_bamboo", "prp_song_dali_broadleaf",
           "prp_song_dali_grass", "prp_song_willow", "prp_song_bamboo", "prp_song_broadleaf"}


def points(rows):
    return {(p["x"], p["z"]) for p in rows}


def point(cell):
    return {"x": cell[0], "z": cell[1]}


def first(cells):
    return point(min(cells, key=lambda c: (c[1], c[0]))) if cells else None


def neighbors(cell):
    return [(cell[0] + dx, cell[1] + dz) for dx, dz in DIRECTIONS]


def component(cells, root):
    if root not in cells:
        return set()
    seen, queue = {root}, deque([root])
    while queue:
        for other in neighbors(queue.popleft()):
            if other in cells and other not in seen:
                seen.add(other)
                queue.append(other)
    return seen


def components(cells):
    remaining, result = set(cells), []
    while remaining:
        found = component(remaining, min(remaining, key=lambda p: (p[1], p[0])))
        result.append(found)
        remaining -= found
    return result


def near_road(start, walkable, road_cells, limit=6):
    """只验证存在性；生成器负责保存按稳定平局规则选出的接驳。"""
    if start not in walkable:
        return False
    seen, frontier = {start}, {start}
    for _ in range(limit + 1):
        if frontier & road_cells:
            return True
        frontier = {other for cell in frontier for other in neighbors(cell)
                    if other in walkable and other not in seen}
        seen |= frontier
    return False


@lru_cache(maxsize=1)
def registered_ids():
    """外键须先在负责定义的资料中出现，不以输入自身作登记。"""
    files = [p for p in (ROOT / "docs").rglob("*") if p.suffix in (".md", ".yaml")
             and "town" not in p.parts and p.name != "22-town-layout-and-generation.md"]
    return set(re.findall(r"\b(?:city|ch\d{2}|biz|sect|poi|sc)_[a-z0-9_]+\b",
                          "\n".join(p.read_text() for p in files)))


def source_checks(spec):
    result, refs = [], set()
    def scan(value):
        if isinstance(value, dict):
            for key, child in value.items():
                if key == "basis" and isinstance(child, str):
                    refs.update(re.findall(r"src_[a-z0-9_]+", child))
                elif key != "sources":
                    scan(child)
        elif isinstance(value, list):
            for child in value:
                scan(child)
    scan(spec)
    counts = Counter(row["key"] for row in spec["sources"])
    for key, count in sorted(counts.items()):
        if count > 1:
            result.append(issue("TOWN_SOURCE_DUPLICATE", f"来源重复 {key}", "sources"))
        if key not in refs:
            result.append(issue("TOWN_SOURCE_UNUSED", f"来源未被 basis 引用 {key}", "sources"))
    for key in sorted(refs - counts.keys()):
        result.append(issue("TOWN_SOURCE_REF_MISSING", f"basis 引用未知来源 {key}", "sources"))
    return result


def polygon_error(poly):
    """整数方向测试，包含相交边、重复顶点和零面积。"""
    pts = [(p["x"], p["z"]) for p in poly]
    def cross(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    def touches(a, b, c, d):
        if max(a[0], b[0]) < min(c[0], d[0]) or max(c[0], d[0]) < min(a[0], b[0]):
            return False
        if max(a[1], b[1]) < min(c[1], d[1]) or max(c[1], d[1]) < min(a[1], b[1]):
            return False
        return cross(a, b, c) * cross(a, b, d) <= 0 and cross(c, d, a) * cross(c, d, b) <= 0
    if len(set(pts)) != len(pts):
        return "多边形有重复顶点"
    if not sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(pts, pts[1:] + pts[:1])):
        return "多边形面积为零"
    for i, a in enumerate(pts):
        for j in range(i + 1, len(pts)):
            if j in (i + 1, len(pts) - 1 if i == 0 else -1):
                continue
            if touches(a, pts[(i + 1) % len(pts)], pts[j], pts[(j + 1) % len(pts)]):
                return "多边形边自交"
    return None


def validate_spec(spec):
    result = validate_schema(spec, "CitySpec")
    if result:
        return result
    from common import catalog, geometry_masks, in_polygon, polygon_cells, rectangle, wall_specs
    result += source_checks(spec)
    entries = catalog()
    zones = {z["id"]: z for z in spec["zones"]}
    streets = {r["id"]: r for r in spec["streets"]}
    rivers = {r["id"]: r for r in spec["rivers"]}
    lakes = {lake["id"]: lake for lake in spec.get("lakes", [])}
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    def add(code, message, path, at=None):
        result.append(issue(code, message, path, at))
    def check_points(value, path="$"):
        if isinstance(value, dict):
            if set(value) == {"x", "z"} and not (0 <= value["x"] <= width and 0 <= value["z"] <= height):
                add("TOWN_GEOMETRY_BOUNDS", "点超出规划画幅", path, value)
            for key, child in value.items():
                check_points(child, path + "." + key)
        elif isinstance(value, list):
            for i, child in enumerate(value):
                check_points(child, f"{path}[{i}]")
    check_points(spec)
    for group in ("gates", "water_gates", "streets", "rivers", "lakes", "bridges", "zones", "landmarks", "building_quotas"):
        key = "type" if group == "building_quotas" else "id"
        if len({row[key] for row in spec.get(group, [])}) != len(spec.get(group, [])):
            add("TOWN_GEOMETRY_DUPLICATE_ID", "局部键重复", group)
    if rivers.keys() & lakes.keys():
        add("TOWN_GEOMETRY_DUPLICATE_ID", "河流与湖体共用局部 ID，不能重名", "lakes")
    walls = wall_specs(spec)
    polygons = [(f"walls[{i}].polygon", wall["polygon"]["points"])
                for i, wall in enumerate(walls)]
    polygons += [(f"lakes[{i}].polygon", lake["polygon"]["points"])
                 for i, lake in enumerate(spec.get("lakes", []))]
    for i, zone in enumerate(spec["zones"]):
        path = f"zones[{i}]"
        geometry = zone["geometry"]
        if "rect" in geometry:
            rect = geometry["rect"]
            if any(rect["min"][k] >= rect["max"][k] for k in ("x", "z")):
                add("TOWN_GEOMETRY_RECT", "矩形需要 min < max", path + ".geometry")
            vertices = [{"x": x, "z": z} for x in (rect["min"]["x"], rect["max"]["x"])
                        for z in (rect["min"]["z"], rect["max"]["z"])]
        else:
            polygons.append((path + ".geometry.polygon", geometry["polygon"]["points"]))
            vertices = geometry["polygon"]["points"]
        if walls and any(not any(in_polygon(p, wall["polygon"]["points"]) for wall in walls)
                         for p in vertices):
            add("TOWN_GEOMETRY_ZONE_OUTSIDE_WALL", "分区区框不得越墙或静默裁剪", path + ".geometry")
        mix = zone["ground_mix"]
        if sum(mix.values()) != 100 or any(k not in {"rammed_earth", "grey_brick", "stone_slab", "dirt_road", "grass", "bridge_deck"}
                                         or not 1 <= v <= 100 for k, v in mix.items()):
            add("TOWN_SCHEMA_GROUND_MIX", "ground_mix 须为非水面整数权重且总和 100", path)
        for kind in zone["allowed_building_types"]:
            if kind not in entries:
                add("TOWN_ID_REF_TYPE", f"建筑目录未登记 {kind}", path)
    for path, poly in polygons:
        if error := polygon_error(poly):
            add("TOWN_GEOMETRY_POLYGON", error, path)
    for i, quota in enumerate(spec["building_quotas"]):
        path, kind = f"building_quotas[{i}]", quota["type"]
        if kind not in entries:
            add("TOWN_ID_REF_TYPE", f"建筑目录未登记 {kind}", path)
        if not 0 <= quota["count"]["min"] <= quota["count"]["max"]:
            add("TOWN_SCHEMA_QUOTA", "配额需要 0 <= min <= max", path)
        for ref in quota["zone_refs"]:
            if ref not in zones or kind not in zones[ref]["allowed_building_types"]:
                add("TOWN_ID_REF_ZONE", f"配额分区不存在或不允许此 type: {ref}", path)
        if kind in entries and quota["count"]["max"] > entries[kind]["max_per_zone"] * len(set(quota["zone_refs"])):
            add("TOWN_QUOTA_CATALOG_MAX", "quota.max 超过所列分区的目录上限之和", path)
        business = quota["business_ref"]
        expected = "escort" if kind.endswith("_biaoju") else kind.rsplit("_", 1)[-1]
        if business and f"_{expected}_" not in business:
            add("TOWN_ID_REF_BUSINESS_KIND", f"营生与建筑功能不匹配: {business}", path)
        if kind.endswith("_wharf") and (business or quota["institution_ref"]):
            add("TOWN_ID_REF_WHARF", "河埠仅外观，不能绑定营生或机构", path)
    refs = registered_ids()
    for key in ("city_id", "book_world"):
        if spec[key] not in refs:
            add("TOWN_ID_REF_CONTENT", f"未登记 {spec[key]}", key)
    for group in ("landmarks", "building_quotas"):
        for i, row in enumerate(spec[group]):
            for key in ("poi", "business_ref", "institution_ref"):
                if row.get(key) and row[key] not in refs:
                    add("TOWN_ID_REF_CONTENT", f"未登记 {row[key]}", f"{group}[{i}].{key}")
    palette = spec["vegetation"]["palette"]
    if len(set(palette)) != len(palette) or not set(palette) <= PALETTE:
        add("TOWN_VEGETATION_PALETTE_INVALID", "植物须为七项陆生白名单非重复子集", "vegetation.palette")
    partition = spec["runtime_partition"]
    q_values = [q for r in range(1, height + 1) for q in
                range(math.ceil(-r / 2), math.ceil(math.sqrt(3) * width / 2 - r / 2))]
    expected = dict(q_min=min(q_values), r_min=1, q_slot_count=max(q_values) - min(q_values) + 1,
                    r_slot_count=height)
    if any(partition[k] != v for k, v in expected.items()) or any(
            sum(partition[axis + "_band_slots"]) != partition[axis + "_slot_count"] for axis in ("q", "r")):
        add("TOWN_PROJECTION_PARTITION", f"六角轴框/分带不符，预期 {expected}", "runtime_partition")
    scenes = partition["formal_scene_refs"]
    if scenes is not None and (len(scenes) != len(partition["q_band_slots"]) * len(partition["r_band_slots"])
                               or len(set(scenes)) != len(scenes)
                               or any(not s.startswith("sc_") or s not in refs for s in scenes)):
        add("TOWN_ID_REF_SCENE", "街区分带需要相同数量、不重复、已登记的 sc_* 引用", "runtime_partition.formal_scene_refs")
    if not spec["book_world"].startswith(spec["chapter_id"] + "_"):
        add("TOWN_ID_REF_CHAPTER", "book_world 须属于 chapter_id", "book_world")
    wall_ids = {wall["id"] for wall in walls}
    if walls and sum(g["primary"] for g in spec["gates"]) != 1:
        add("TOWN_GATE_PRIMARY", "有墙城镇必须恰有一个 primary 城门", "gates")
    if not walls and any(g["primary"] for g in spec["gates"]):
        add("TOWN_GATE_PRIMARY", "无墙营地不得声明 primary 城门", "gates")
    for i, gate in enumerate(spec["gates"]):
        wall_ref = gate.get("wall_ref", "outer" if "wall" in spec else None)
        if wall_ref not in wall_ids:
            add("TOWN_GATE_WALL_REF", f"城门引用不存在的城垣 {wall_ref}", f"gates[{i}].wall_ref")
        if gate["road_ref"] not in streets:
            add("TOWN_ID_REF_ROAD", "城门引用不存在的道路", f"gates[{i}]")
        w = gate["width_cells"]
        if (gate["footprint_cells"] != {"w": w + 4, "h": 4}
                or gate["passage_cells"] != {"w": w, "h": 4}
                or gate["rotation_deg"] != {"south": 0, "west": 90, "north": 180, "east": 270}[gate["side"]]
                or gate["asset_type"] != "tex_town_" + spec["era_kit"] + "_city_gate"):
            add("TOWN_GATE_GEOMETRY", "门楼占地、孔宽、方向或资产 ID 不符合契约", f"gates[{i}]")
    for i, gate in enumerate(spec.get("water_gates", [])):
        if gate["wall_ref"] not in wall_ids:
            add("TOWN_GATE_WALL_REF", f"水门引用不存在的城垣 {gate['wall_ref']}", f"water_gates[{i}].wall_ref")
        w = gate["width_cells"]
        if (gate["footprint_cells"] != {"w": w + 4, "h": 4}
                or gate["passage_cells"] != {"w": w, "h": 4}
                or gate["rotation_deg"] != {"south": 0, "west": 90, "north": 180, "east": 270}[gate["side"]]
                or gate["asset_type"] != "tex_town_" + spec["era_kit"] + "_city_gate"):
            add("TOWN_GATE_GEOMETRY", "水门门楼占地、孔宽、方向或回退资产 ID 不符合契约", f"water_gates[{i}]")
    for i, bridge in enumerate(spec["bridges"]):
        if bridge["road_ref"] not in streets or bridge["river_ref"] not in rivers.keys() | lakes.keys():
            add("TOWN_ID_REF_BRIDGE", "桥引用不存在的道路/河流或湖体", f"bridges[{i}]")
        elif (bridge["river_ref"] in rivers
              and not rivers[bridge["river_ref"]]["width_cells"] <= bridge["length_cells"] <= 20):
            add("TOWN_SCHEMA_BRIDGE_LENGTH", "桥长必须为河宽至 20 格", f"bridges[{i}]")
    if any(s["surface"] == "water" for s in spec["streets"]):
        add("TOWN_SCHEMA_ROAD_SURFACE", "街道路面不能为 water", "streets")
    if result:
        return sort_issues(result)
    masks = geometry_masks(spec)
    result += check_fixed_geometry(spec, masks)
    primary = next((g for g in spec["gates"] if g["primary"]), None)
    main_roads = set().union(*(masks["roads"][s["id"]] for s in spec["streets"] if s["class"] == "main_axis"))
    if primary and (primary["at"]["x"], primary["at"]["z"]) not in main_roads:
        add("TOWN_ROAD_PRIMARY_DISCONNECTED", "主门 at 不在阶段 B 主轴格集合", "streets", primary["at"])
    return sort_issues(result)


def check_fixed_geometry(spec, masks):
    from common import catalog, gate_cells, rectangle, zone_winners, segment_distance, wall_spec
    from roads import GenerationError, bridge_footprint_cells, planning_bridge_groups
    result, occupied = [], set()
    bridge_footprints = bridge_footprint_cells(masks)
    def add(code, text, path, cells=None):
        result.append(issue(code, text, path, first(cells)))
    for i, gate in enumerate(spec["gates"]):
        passage = gate_cells(gate, True)
        footprint = gate_cells(gate)
        at = (gate["at"]["x"], gate["at"]["z"])
        road = masks["roads"][gate["road_ref"]]
        owner = wall_spec(spec, gate.get("wall_ref"))
        owner_cells = masks["walls"].get(owner["id"], set()) if owner else set()
        owner_interior = masks["wall_interiors"].get(owner["id"], set()) if owner else set()
        if at not in owner_cells:
            add("TOWN_GATE_OFF_WALL", "城门锚点没有落在墙栅格", f"gates[{i}]", {at})
        if owner and not (passage & owner_interior and passage - owner_interior):
            add("TOWN_GATE_PASSAGE", "城门通行孔没有跨墙", f"gates[{i}]")
        if not passage & {n for p in road for n in [p, *neighbors(p)]}:
            add("TOWN_GATE_PASSAGE", "城门通行孔未接指定路", f"gates[{i}]")
        if footprint & masks["water"]:
            add("TOWN_GATE_ON_WATER", "城门楼/孔压水", f"gates[{i}]", footprint & masks["water"])
        if not passage <= footprint:
            add("TOWN_GATE_PASSAGE", "通行孔超出门楼占地", f"gates[{i}]")
    for i, gate in enumerate(spec.get("water_gates", [])):
        passage, footprint = gate_cells(gate, True), gate_cells(gate)
        at = (gate["at"]["x"], gate["at"]["z"])
        owner = wall_spec(spec, gate["wall_ref"])
        owner_cells = masks["walls"].get(owner["id"], set()) if owner else set()
        water = masks["water"]
        if at not in owner_cells:
            add("TOWN_GATE_OFF_WALL", "水门锚点没有落在指定墙栅格", f"water_gates[{i}]", {at})
        if at not in water or not (owner_cells & water & passage):
            add("TOWN_WATER_GATE_PASSAGE", "水门锚点与孔须落在指定墙水交界", f"water_gates[{i}]", {at})
        if not passage <= footprint:
            add("TOWN_GATE_PASSAGE", "水门通行孔超出门楼占地", f"water_gates[{i}]")
    undeclared = set().union(*(
        cells & masks["water"] - masks["water_passages_by_wall"].get(wall_id, set())
        for wall_id, cells in masks["walls"].items()
    ))
    total = len(undeclared)
    for cell in sorted(undeclared, key=lambda p: (p[1], p[0])):
        add("TOWN_WALL_WATER_UNDECLARED", f"墙水相交未由水门声明；共 {total} 格", "water_gates", {cell})
    try:
        planning_bridge_groups(spec["bridges"])
    except GenerationError as exc:
        result.append(exc.issue)
    for i, bridge in enumerate(spec["bridges"]):
        rect = masks["bridge_rectangles"][bridge["id"]]
        road = masks["roads"][bridge["road_ref"]]
        at = (bridge["at"]["x"], bridge["at"]["z"])
        water = masks["water_bodies"][bridge["river_ref"]]
        if at not in road & water:
            add("TOWN_BRIDGE_OFF_WATER", "桥锚点须在所引用水体与道路交点", f"bridges[{i}]", {at})
        river = next((r for r in spec["rivers"] if r["id"] == bridge["river_ref"]), None)
        if river is not None:
            segments = list(zip(river["points"], river["points"][1:]))
            a, b = min(segments, key=lambda pair: segment_distance(at, *pair))
            dx, dz = b["x"] - a["x"], b["z"] - a["z"]
            along = abs(dz) if bridge["rotation_deg"] in (0, 180) else abs(dx)
            if dx * dx + dz * dz and along / math.hypot(dx, dz) > math.sqrt(0.5) + 1e-9:
                add("TOWN_BRIDGE_ORIENTATION", "桥轴偏离河流局部法向超过 45°", f"bridges[{i}]")
        if not rect & masks["water"]:
            add("TOWN_BRIDGE_OFF_WATER", "桥矩形未覆盖水面", f"bridges[{i}]")
        axis = 1 if bridge["rotation_deg"] in (0, 180) else 0
        lo, hi = min(p[axis] for p in rect), max(p[axis] for p in rect)
        dry = road - masks["water"]
        if not all(any(p in dry for p in rect if p[axis] == side) for side in (lo, hi)):
            add("TOWN_BRIDGE_END_DISCONNECTED", "桥的两端须接陆地道路", f"bridges[{i}]")
    roads = set().union(*masks["roads"].values())
    unbridged = roads & masks["water"] - masks["bridges"]
    if unbridged:
        add("TOWN_ROAD_WATER_UNBRIDGED", "道路与水交叉但无桥覆盖", "streets", unbridged)
    winners = zone_winners(spec)
    for i, landmark in enumerate(spec["landmarks"]):
        kind, path = landmark["type"], f"landmarks[{i}]"
        if kind not in catalog():
            add("TOWN_ID_REF_TYPE", f"未知建筑 {kind}", path)
            continue
        entry = catalog()[kind]
        if landmark["size"] != {"w": entry["w"], "h": entry["h"]}:
            add("TOWN_BUILDING_SIZE", "固定建筑尺寸须等于目录原生 0° 占地", path)
        if landmark["rotation_deg"] != 0:
            add("TOWN_BUILDING_ROTATION", "单视图建筑只允许原生 0°", path)
        footprint = rectangle(landmark["origin"], landmark["size"])
        for forbidden, code in ((occupied, "TOWN_BUILDING_OVERLAP"),
                                (masks["water"], "TOWN_BUILDING_ON_WATER"),
                                (bridge_footprints, "TOWN_BUILDING_ON_BRIDGE"),
                                (roads, "TOWN_BUILDING_ON_ROAD"),
                                (masks["hard"], "TOWN_BUILDING_ON_WALL"),
                                (masks["gate_footprints"], "TOWN_BUILDING_ON_GATE")):
            if footprint & forbidden:
                add(code, "固定建筑违反硬占地约束", path, footprint & forbidden)
        if not footprint <= masks["margin"]:
            add("TOWN_BUILDING_OUTSIDE_WALL", "固定建筑越墙或不满足退距", path, footprint - masks["margin"])
        occupied |= footprint
    return result


def check_cell_list(rows, path, bounds, result, hex_mode=False):
    keys = ("q", "r") if hex_mode else ("x", "z")
    seq = [(p[keys[0]], p[keys[1]]) for p in rows]
    cells = set(seq)
    if len(cells) != len(seq) or seq != sorted(cells, key=lambda p: (p[1], p[0])):
        result.append(issue("TOWN_SCHEMA_CELL_ORDER", "格数组必须无重复，按 z/x 或 r/q 排序", path))
    if bounds is not None and not cells <= bounds:
        result.append(issue("TOWN_GEOMETRY_BOUNDS", "格数组超出画幅", path))
    return cells


def validate_layout(spec, layout, strict_assets=False, tile_manifest=None, building_manifest=None,
                    release=False, check_assets=True):
    result = validate_schema(layout, "TownLayout")
    if result:
        return result
    from common import geometry_masks, rectangle, catalog, building_entrance, zone_winners
    from placement import access_edges
    from roads import bridge_footprint_cells
    masks, entries = geometry_masks(spec), catalog()
    bridge_footprints = bridge_footprint_cells(masks)
    width, height = spec["grid"]["width"], spec["grid"]["height"]
    def add(code, text, path, cells=None):
        result.append(issue(code, text, path, first(cells)))
    if layout["grid"] != spec["grid"] or layout["runtime_partition"] != spec["runtime_partition"]:
        add("TOWN_PROJECTION_LAYOUT", "布局 grid/runtime_partition 须等于来源", "grid")
    for key in ("city_id", "chapter_id", "seed"):
        if layout["source_spec"][key] != spec[key]:
            add("TOWN_SCHEMA_SOURCE", f"来源 {key} 不一致", "source_spec")
    source_path = ROOT / layout["source_spec"]["path"]
    if source_path.exists() and hashlib.sha256(source_path.read_bytes()).hexdigest() != layout["source_spec"]["sha256"]:
        add("TOWN_REPLAY_SOURCE_HASH", "原始 CitySpec 字节摘要不匹配", "source_spec.sha256")
    if release and not spec["runtime_partition"]["formal_scene_refs"]:
        add("TOWN_SCENE_REF_MISSING", "release 需要正式 sc_* 引用", "runtime_partition.formal_scene_refs")
    bounds = masks["bounds"]
    water = check_cell_list(layout["water_cells"], "water_cells", bounds, result)
    bridges = check_cell_list(layout["bridge_cells"], "bridge_cells", bounds, result)
    if water != masks["water"]:
        add("TOWN_WATER_MASK_MISMATCH", "水格与规格栅格化结果不一致", "water_cells", water ^ masks["water"])
    if bridges != masks["bridges"]:
        add("TOWN_BRIDGE_MASK_MISMATCH", "桥格须等于固定桥矩形与水交集", "bridge_cells", bridges ^ masks["bridges"])
    road_map = {key: check_cell_list(rows, f"roads.{key}", bounds, result)
                for key, rows in layout["roads"].items()}
    roads = set().union(*road_map.values()) if road_map else set()
    for key, cells in masks["roads"].items():
        if road_map.get(key) != cells:
            add("TOWN_ROAD_MASK_MISMATCH", "手写道路不可删除/裁窄/改宽", f"roads.{key}", cells ^ road_map.get(key, set()))
    if roads & water - bridges:
        add("TOWN_ROAD_WATER_UNBRIDGED", "道路水面交集须全部覆盖桥", "roads", roads & water - bridges)
    occupied, footprints = set(), {}
    ids = [b["id"] for b in layout["buildings"]]
    if len(set(ids)) != len(ids):
        add("TOWN_GEOMETRY_DUPLICATE_ID", "建筑实例 ID 重复", "buildings")
    winners = zone_winners(spec)
    zones = {z["id"]: z for z in spec["zones"]}
    for i, building in enumerate(layout["buildings"]):
        path, kind = f"buildings[{i}]", building["type"]
        footprint = rectangle(building["origin"], building["size"])
        footprints[building["id"]] = footprint
        if kind not in entries:
            add("TOWN_ID_REF_TYPE", f"目录不存在 {kind}", path)
            continue
        entry = entries[kind]
        if building["size"] != {"w": entry["w"], "h": entry["h"]}:
            add("TOWN_BUILDING_SIZE", "占地须等于目录原生 0° 尺寸，不可交换宽高", path)
        if building["rotation_deg"] != 0:
            add("TOWN_BUILDING_ROTATION", "单视图建筑只允许原生 0°", path)
        for forbidden, code in ((occupied, "TOWN_BUILDING_OVERLAP"), (water, "TOWN_BUILDING_ON_WATER"),
                                (bridge_footprints, "TOWN_BUILDING_ON_BRIDGE"),
                                (masks["hard"], "TOWN_BUILDING_ON_WALL"),
                                (roads, "TOWN_BUILDING_ON_ROAD"), (masks["gate_footprints"], "TOWN_BUILDING_ON_GATE")):
            if footprint & forbidden:
                add(code, "建筑违反硬占地约束", path, footprint & forbidden)
        if not footprint <= masks["margin"]:
            add("TOWN_BUILDING_OUTSIDE_WALL", "建筑不满足墙内四顶点退距", path, footprint - masks["margin"])
        zone = building["zone_ref"]
        if zone not in zones or kind not in zones[zone]["allowed_building_types"] or not footprint <= winners.get(zone, set()):
            add("TOWN_BUILDING_ZONE", "占地须全属于允许此 type 的同一胜出分区", path)
        possible = {building_entrance(building["origin"], entry["w"], entry["h"], building["rotation_deg"], edge)[0]
                    for edge in access_edges(entry)}
        actual = points(building["entrance_cells"])
        if not actual <= possible or len(actual) != len(building["entrance_cells"]):
            add("TOWN_ENTRANCE_GEOMETRY", "接入点须位于原生占地某一边的外侧中心格", path)
        if not actual <= masks["margin"]:
            add("TOWN_ENTRANCE_OUTSIDE_WALL", "入口不满足墙内退距", path, actual - masks["margin"])
        if len(building["entrance_hexes"]) != len(building["entrance_cells"]):
            add("TOWN_ENTRANCE_HEX_MAPPING", "入口规划格与六角须一一对应", path)
        if kind.endswith("_wharf") and (building["poi"] or building["business_ref"]):
            add("TOWN_ID_REF_WHARF", "河埠不能绑定 POI/营生", path)
        occupied |= footprint
    walk_expected = masks["walkable"] - occupied
    walk = check_cell_list(layout["walk_layer"]["planning_walkable"], "walk_layer.planning_walkable", bounds, result)
    if walk != walk_expected:
        add("TOWN_WALK_FOOTPRINT_MISMATCH", "行走层须等于空城可走域扣建筑硬占地", "walk_layer", walk ^ walk_expected)
    if walk & water - bridges:
        add("TOWN_WALK_WATER_MISMATCH", "无桥水格不可走", "walk_layer", walk & water - bridges)
    if not roads <= walk:
        add("TOWN_ROAD_BLOCKED", "道路格必须可走", "roads", roads - walk)
    try:
        ground = decode_ground(layout["ground_cells"], width, height)
        covered = points([g["at"] for g in ground])
        if len(ground) != width * height or covered != bounds:
            add("TOWN_SCHEMA_GROUND_COVERAGE", "地面格必须完整且只覆盖一次", "ground_cells")
        ground_walk = points([g["at"] for g in ground if g["walkable"]])
        if ground_walk != walk:
            add("TOWN_WALK_GROUND_MISMATCH", "GroundCell.walkable 与行走层不一致", "ground_cells", ground_walk ^ walk)
        wrong_water = set()
        for row in ground:
            cell = (row["at"]["x"], row["at"]["z"])
            if ((cell in water - bridges and row["ground"] != "water")
                    or (cell not in water and row["ground"] == "water")
                    or (cell in bridges and row["ground"] not in ("water", "bridge_deck"))):
                wrong_water.add(cell)
        if wrong_water:
            add("TOWN_GROUND_WATER_MISMATCH", "非桥水格的地表类型必须为 water", "ground_cells", wrong_water)
    except (ValueError, TypeError, KeyError) as exc:
        add("TOWN_SCHEMA_RLE", str(exc), "ground_cells")
    primary = next((g for g in spec["gates"] if g["primary"]), None)
    if primary:
        root = (primary["at"]["x"], primary["at"]["z"])
        road_component = component(roads, root)
        if road_component != roads or not road_component:
            details = [{"cells": len(c), "streets": sorted(k for k, r in road_map.items() if r & c)} for c in components(roads)]
            add("TOWN_ROAD_COMPONENT_DISCONNECTED", f"道路自身分量须恰为 1: {details}", "roads")
        main = set().union(*(road_map.get(s["id"], set()) for s in spec["streets"] if s["class"] == "main_axis"))
        if root not in main:
            add("TOWN_ROAD_PRIMARY_DISCONNECTED", "主城门须直接接入手写主轴", "roads")
        targets = [z for z in spec["zones"] if z["kind"] in ("palace", "princely", "commercial", "market")]
        if targets:
            priority = max(z["priority"] for z in targets)
            boundaries = {p for z in targets if z["priority"] == priority for p in winners[z["id"]]
                          if any(n not in winners[z["id"]] for n in neighbors(p))}
        else:
            boundaries = set()
        if not boundaries & {p for cell in road_component for p in [cell, *neighbors(cell)]}:
            add("TOWN_ROAD_PRIMARY_DISCONNECTED", "主道路分量没有接最高优先级目标区边界", "roads")
        reachable = component(walk, root)
        for i, building in enumerate(layout["buildings"]):
            for entrance in points(building["entrance_cells"]):
                if entrance not in reachable or not near_road(entrance, walk, roads):
                    add("TOWN_ENTRANCE_UNREACHABLE", "入口须连主门且在 6 步内接路", f"buildings[{i}]", {entrance})
        for i, gate in enumerate(spec["gates"]):
            if (gate["at"]["x"], gate["at"]["z"]) not in reachable:
                add("TOWN_GATE_UNREACHABLE", "城门规划入口不可达", f"gates[{i}]")
    result += check_layout_details(spec, layout, masks, road_map, walk_expected, footprints)
    result += check_hex(spec, layout, masks, road_map, walk_expected)
    if check_assets:
        result += validate_assets(spec, layout, strict_assets or release, tile_manifest, building_manifest, release)
    summary = layout["validation"]
    for severity, field in (("error", "errors"), ("warning", "warnings"), ("info", "infos")):
        if summary[field] != sum(i["severity"] == severity for i in summary["issues"]):
            add("TOWN_SCHEMA_VALIDATION_SUMMARY", "摘要统计与内嵌 issues 不一致", "validation")
    if len(set(summary["checks_run"])) != len(summary["checks_run"]):
        add("TOWN_SCHEMA_VALIDATION_SUMMARY", "checks_run 不能重复", "validation.checks_run")
    if summary["issues"] != sort_issues(summary["issues"]):
        add("TOWN_SCHEMA_VALIDATION_SUMMARY", "内嵌 issues 必须按契约排序", "validation.issues")
    return sort_issues(result)


def check_layout_details(spec, layout, masks, road_map, walk, footprints):
    from common import building_entrance, catalog, entrance_path, expand, polyline_cells, rectangle, zone_winners
    from placement import access_edges
    from roads import bridge_footprint_cells
    result, entries = [], catalog()
    winners = zone_winners(spec)
    roads = set().union(*road_map.values()) if road_map else set()
    occupied = set().union(*footprints.values()) if footprints else set()
    fixed = layout["buildings"][:len(spec["landmarks"])]
    fixed_foot = set().union(*(footprints[b["id"]] for b in fixed))
    tower_ring, fixed_buffer, all_buffer = set(), set(), set()
    def add(code, text, path, cells=None):
        result.append(issue(code, text, path, first(cells)))
    for i, landmark in enumerate(spec["landmarks"]):
        if i >= len(fixed) or any(fixed[i][k] != landmark[k] for k in ("type", "origin", "size", "rotation_deg", "zone_ref", "poi")):
            add("TOWN_LANDMARK_CHANGED", "固定地标必须保留且按声明顺序排在前部", "buildings")
        if "chongshengsi_pagoda" in landmark["type"]:
            tower_ring |= expand(rectangle(landmark["origin"], landmark["size"]), 3)
    tower_ring -= fixed_foot
    for i, building in enumerate(layout["buildings"]):
        kind, path = building["type"], f"buildings[{i}]"
        if kind not in entries:
            continue
        if footprints[building["id"]] & tower_ring:
            add("TOWN_BUILDING_LANDMARK_CLEARANCE", "建筑侵入固定塔净空", path)
        entry = entries[kind]
        normals = dict(building_entrance(building["origin"], entry["w"], entry["h"], building["rotation_deg"], edge)
                       for edge in access_edges(entry))
        for cell in points(building["entrance_cells"]):
            if cell not in normals:
                continue
            dx, dz = normals[cell]
            depth = 4 if kind.endswith("_yamen") else 1
            buffer = {(cell[0] + j * dx, cell[1] + j * dz) for j in range(depth)}
            if (not buffer <= masks["margin"] or buffer & occupied or buffer & masks["hard"]
                    or buffer & (masks["water"] - masks["bridges"])):
                add("TOWN_ENTRANCE_BUFFER", "入口缓冲不满足墙距/建筑/水面约束", path, buffer - walk)
            own_tower = "chongshengsi_pagoda" in kind
            if not own_tower and buffer & tower_ring:
                add("TOWN_ENTRANCE_BUFFER", "入口缓冲侵入固定塔净空", path)
            all_buffer |= buffer
            connector = entrance_path(cell, walk, road_map)
            if connector:
                all_buffer |= set(connector)
            if i < len(fixed):
                fixed_buffer |= buffer
    quota_types = {q["type"] for q in spec["building_quotas"]}
    for i, quota in enumerate(spec["building_quotas"]):
        selected = [b for b in layout["buildings"] if b["type"] == quota["type"] and b["zone_ref"] in quota["zone_refs"]]
        count = len(selected)
        if count > quota["count"]["max"] or (quota["required"] and count < quota["count"]["min"]):
            add("TOWN_REQUIRED_QUOTA", f"{quota['type']} 数量 {count} 不满足 {quota['count']}", f"building_quotas[{i}]")
        if any(b["business_ref"] != quota["business_ref"] for b in selected):
            add("TOWN_ID_REF_BUSINESS", "实例营生引用须等于对应配额", f"building_quotas[{i}]")
    by_zone = Counter((b["type"], b["zone_ref"]) for b in layout["buildings"])
    for (kind, zone), count in by_zone.items():
        if kind in entries and count > entries[kind]["max_per_zone"]:
            add("TOWN_QUOTA_CATALOG_MAX", f"{kind} 在 {zone} 超过目录每区上限", "buildings")
    zone_kinds = {z["id"]: z["kind"] for z in spec["zones"]}
    navigable_water = masks["navigable_water"]
    for i, building in enumerate(layout["buildings"]):
        foot = footprints[building["id"]]
        kind = building["type"]
        if kind.endswith("_wharf") and not any(n in navigable_water for p in foot for n in neighbors(p)):
            add("TOWN_WHARF_SHORE", "河埠至少一边须四邻接可航水格", f"buildings[{i}]")
        for other in layout["buildings"][:i]:
            other_type = other["type"]
            palace = kind.endswith("_palace_hall") or kind == "bld_lm_ch02_linan_palace_gate"
            other_palace = other_type.endswith("_palace_hall") or other_type == "bld_lm_ch02_linan_palace_gate"
            gap = 3 if ((palace and zone_kinds.get(other["zone_ref"]) != "palace")
                        or (other_palace and zone_kinds.get(building["zone_ref"]) != "palace")) else 0
            if ((kind.endswith("_house") and other_type.endswith(("_stable", "_warehouse")))
                    or (other_type.endswith("_house") and kind.endswith(("_stable", "_warehouse")))):
                gap = max(gap, 1)
            if gap and foot & expand(footprints[other["id"]], gap):
                add("TOWN_BUILDING_CLEARANCE", f"建筑 {building['id']}/{other['id']} 不满足 {gap} 格净空", f"buildings[{i}]")
    street_ids = {r["id"] for r in spec["streets"]}
    connector_ids = {c["id"] for c in layout["generated_connectors"]}
    if set(road_map) != street_ids | connector_ids or len(connector_ids) != len(layout["generated_connectors"]):
        add("TOWN_ID_REF_ROAD", "道路键必须与原街/生成接驳一一对应", "roads")
    earlier_roads = set().union(*masks["roads"].values())
    for i, connector in enumerate(layout["generated_connectors"]):
        path = f"generated_connectors[{i}]"
        chain = [(p["x"], p["z"]) for p in connector["cells"]]
        if len(set(chain)) != len(chain) or any(b not in neighbors(a) for a, b in zip(chain, chain[1:])):
            add("TOWN_CONNECTOR_CHAIN", "接驳须为无重复四邻中心链", path)
        if connector["cells"][0] != connector["from"] or connector["cells"][-1] != connector["to"]:
            add("TOWN_CONNECTOR_ENDPOINTS", "接驳 from/to 须等于中心链端点", path)
        expected = polyline_cells(connector["cells"], connector["width_cells"])
        if road_map.get(connector["id"]) != expected or not expected <= walk:
            add("TOWN_CONNECTOR_WIDTH", "接驳必须保留全宽且不侵硬阻挡", path)
        is_entrance = connector["reason"] == "required_entrance_unconnected"
        source_building = any(b["zone_ref"] == connector["zone_ref"]
                              and connector["from"] in b["entrance_cells"]
                              for b in layout["buildings"])
        if is_entrance and not source_building:
            add("TOWN_CONNECTOR_SOURCE", "入口接驳起点须属于所声明分区的建筑入口", path)
        own_zone = connector["zone_ref"] if is_entrance and source_building else None
        protected = set().union(*(winners[z["id"]] for z in spec["zones"]
                                  if z["kind"] == "palace" and z["id"] != own_zone))
        if forbidden := expected & protected - earlier_roads:
            add("TOWN_CONNECTOR_PALACE", "新增步道不得穿越其他宫禁分区", path, forbidden)
        earlier_roads |= expected
        others = set().union(*(cells for key, cells in road_map.items() if key != connector["id"]))
        if chain[-1] not in others:
            add("TOWN_CONNECTOR_TARGET", "接驳末端须落在另一道路", path)
    frozen_roads = set().union(*(cells for key, cells in road_map.items() if key not in {
        c["id"] for c in layout["generated_connectors"] if c["reason"] == "required_entrance_unconnected"}))
    if set(layout["zone_coverage"]) != set(winners):
        add("TOWN_ZONE_COVERAGE", "zone_coverage 键须匹配全部分区", "zone_coverage")
    for zone, rows in layout["zone_coverage"].items():
        try:
            actual = decode_zone(rows, spec["grid"]["width"], spec["grid"]["height"])
            expected = (winners.get(zone, set()) & masks["margin"] - frozen_roads - masks["water"]
                        - bridge_footprint_cells(masks) - masks["gate_footprints"] - tower_ring - fixed_buffer)
            if actual != expected:
                add("TOWN_ZONE_COVERAGE", "覆盖须为阶段 D 冻结分母（保留固定占地）", "zone_coverage." + zone, actual ^ expected)
        except (ValueError, TypeError) as exc:
            add("TOWN_SCHEMA_RLE", str(exc), "zone_coverage." + zone)
    seen, last = set(), None
    avoid = spec["vegetation"]["avoid_road_cells"]
    excluded = roads if avoid == 1 else expand(roads, avoid - 1) if avoid > 1 else set()
    allowed = walk & masks["interior"] - masks["water"] - bridge_footprint_cells(masks) - tower_ring - all_buffer - excluded
    for i, decoration in enumerate(layout["decorations"]):
        cell = (decoration["at"]["x"], decoration["at"]["z"])
        order = cell[1], cell[0], decoration["asset_id"]
        if cell in seen or cell not in allowed or decoration["asset_id"] not in spec["vegetation"]["palette"]:
            add("TOWN_VEGETATION_DOMAIN_INVALID", "植物不在允许的陆地候选域或重复占格", f"decorations[{i}]", {cell})
        if decoration["id"] != f"dec_{i + 1:04d}" or (last is not None and order < last):
            add("TOWN_SCHEMA_DECORATION_ORDER", "植物须按 z/x/asset 排序后编号", f"decorations[{i}]")
        seen.add(cell)
        last = order
    return result


def check_hex(spec, layout, masks, road_map, walk):
    from common import HexGrid, wall_spec
    result = []
    grid = HexGrid(spec["grid"]["width"], spec["grid"]["height"])
    expected = grid.walkable(walk)
    layer = layout["walk_layer"]
    actual = check_cell_list(layer["runtime_hex_walkable"], "walk_layer.runtime_hex_walkable", grid.slots, result, True)
    blocked = check_cell_list(layer["runtime_hex_blocked"], "walk_layer.runtime_hex_blocked", grid.slots, result, True)
    if actual != expected or blocked != grid.slots - expected:
        result.append(issue("TOWN_HEX_SAMPLE_MISMATCH", "六角走/挡全集必须按中心与六顶点重采样", "walk_layer"))
    primary = next((g for g in spec["gates"] if g["primary"]), None)
    if primary is None:
        roads = set().union(*road_map.values()) if road_map else set()
        root = grid.entrance_hex(min(roads, key=lambda p: (p[1], p[0])), expected, walk, radius=2) if roads else None
    else:
        owner = wall_spec(spec, primary.get("wall_ref"))
        points_ = owner["polygon"]["points"] if owner else None
        root = grid.gate_hex(primary, expected, masks["interior"], road_map.get(primary["road_ref"], set()),
                             masks["passages"], wall_points=points_)
    connected = grid.connected(expected, root) if root else set()
    for i, gate in enumerate(spec["gates"]):
        owner = wall_spec(spec, gate.get("wall_ref"))
        points_ = owner["polygon"]["points"] if owner else None
        selected = grid.gate_hex(gate, expected, masks["interior"], road_map.get(gate["road_ref"], set()),
                                masks["passages"], component=connected,
                                wall_points=points_)
        if selected is None:
            result.append(issue("TOWN_GATE_HEX_UNREACHABLE", "城门无主门分量内的合法六角入口", f"gates[{i}]", gate["at"]))
    for i, building in enumerate(layout["buildings"]):
        for j, entrance in enumerate(building["entrance_cells"]):
            target = grid.entrance_hex((entrance["x"], entrance["z"]), connected, walk)
            if target is None:
                result.append(issue("TOWN_HEX_DISCONNECTED", "建筑入口无合法且连通主门的六角", f"buildings[{i}].entrance_cells[{j}]", entrance))
            elif j >= len(building["entrance_hexes"]) or building["entrance_hexes"][j] != {"q": target[0], "r": target[1]}:
                result.append(issue("TOWN_ENTRANCE_HEX_MAPPING", "入口六角不符合距离/r/q稳定选择", f"buildings[{i}].entrance_hexes[{j}]", entrance))
    return result


def asset_metadata_issues(asset, label, path, *, isolated=False, footprint=False, release=False):
    """Validate the actual decoded sprite, including candidate adaptations.

    Ground / seam tiles may intentionally touch their canvas edges. Independent
    buildings and vegetation must retain transparent margins; no stored QA result
    can substitute for inspecting the PNG that the renderer will actually load.
    """
    image, meta = asset
    result = []
    def add(code, message, severity="error"):
        result.append(issue(code, f"{label}: {message}", path, severity=severity))
    def finite(value):
        return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)
    if image.mode != "RGBA":
        add("TOWN_ASSET_RGBA", "素材须为 RGBA")
    else:
        bounds = image.getchannel("A").getbbox()
        if not bounds:
            add("TOWN_ASSET_EMPTY", "素材完全透明")
        elif isolated and (bounds[0] == 0 or bounds[1] == 0 or bounds[2] == image.width or bounds[3] == image.height):
            add("TOWN_ASSET_CROPPED", "独立对象非透明轮廓触画布边")
    anchor = meta.get("anchor_px")
    if isinstance(anchor, dict):
        anchor = [anchor.get("x"), anchor.get("y")]
    if (not isinstance(anchor, (list, tuple)) or len(anchor) != 2
            or not all(finite(n) for n in anchor)
            or not 0 <= anchor[0] <= image.width or not 0 <= anchor[1] <= image.height):
        add("TOWN_ASSET_ANCHOR", "缺有效图内锚点")
    if footprint:
        width = meta.get("footprint_width_px")
        size = meta.get("footprint_cells", meta.get("footprint_m"))
        if isinstance(size, dict):
            size = [size.get("w"), size.get("h")]
        valid_size = (isinstance(size, (list, tuple)) and len(size) == 2
                      and all(finite(n) and n > 0 for n in size))
        # The renderer prefers an explicitly supplied pixel width. A malformed
        # width must not be hidden by otherwise valid logical dimensions.
        if not ((finite(width) and width > 0) if width is not None else valid_size):
            add("TOWN_ASSET_FOOTPRINT", "缺有效正数底面尺度")
    if release and meta.get("status") != "approved":
        add("TOWN_ASSET_NOT_APPROVED", "素材未 approved")
    for adaptation in meta.get("adaptations", []):
        add("TOWN_ASSET_SUBSTITUTION", str(adaptation), "error" if release else "warning")
    return result


def validate_assets(spec, layout, strict=False, tile_manifest=None, building_manifest=None, release=False):
    from assets import AssetLibrary
    from edge_assembly import shore_bank_masks
    from render_town import autotile_mask, visible_wall_cells
    from common import gate_cells, polyline_cells, wall_specs
    result = []
    severity = "error" if strict else "warning"
    tiles = AssetLibrary(tile_manifest or ROOT / "assets/default/baseline/tile/manifest.yaml")
    buildings = AssetLibrary(building_manifest or ROOT / "assets/default/baseline/building-map/manifest.yaml")
    used_types = sorted({b["type"] for b in layout["buildings"]})
    for kind in used_types:
        used = [b for b in layout["buildings"] if b["type"] == kind]
        for rotation in sorted({b["rotation_deg"] for b in used}):
            asset = buildings.resolve(kind, rotation_deg=rotation)
            if asset is None:
                result.append(issue("TOWN_ASSET_MISSING", f"建筑素材缺失 {kind} rotation={rotation}", "assets.buildings", severity=severity))
            else:
                result += asset_metadata_issues(asset, f"{kind} rotation={rotation}", "assets.buildings",
                                                isolated=True, footprint=True, release=release)
                size = asset[1].get("footprint_cells")
                for building in (b for b in used if b["rotation_deg"] == rotation):
                    if size != building["size"]:
                        result.append(issue("TOWN_BUILDING_VIEW_FOOTPRINT",
                            f"{building['id']} 视图底面 {size} 与布局 {building['size']} 不符",
                            "assets.buildings", severity=severity))
    for gate in [*spec["gates"], *spec.get("water_gates", [])]:
        asset = tiles.resolve(gate["asset_type"], rotation_deg=gate["rotation_deg"], width_cells=gate["width_cells"])
        if asset is None:
            result.append(issue("TOWN_ASSET_MISSING", f"完整城门变体缺失 {gate['id']}", "assets.gates", severity=severity))
        else:
            result += asset_metadata_issues(asset, gate["id"], "assets.gates", footprint=True, release=release)
    grounds = decode_ground(layout["ground_cells"], spec["grid"]["width"], spec["grid"]["height"])
    required_tiles = {(f"tex_town_{spec['era_kit']}_{row['ground']}", None, None) for row in grounds}
    road_cells = set().union(*(points(rows) for rows in layout["roads"].values()))
    water_cells = points(layout["water_cells"])
    ground_map = {(row["at"]["x"], row["at"]["z"]): row for row in grounds}
    surfaces = {}
    for cell in road_cells - water_cells:
        surfaces.setdefault(ground_map[cell]["ground"], set()).add(cell)
    for suffix, cells in [("road_edge", group) for group in surfaces.values()]:
        required_tiles.update((f"tex_town_{spec['era_kit']}_{suffix}", mask, None)
                              for x, z in cells if (mask := autotile_mask(x, z, cells)) & 85 != 85)
    required_tiles.update((f"tex_town_{spec['era_kit']}_riverbank", mask, None)
                          for mask in shore_bank_masks(water_cells, set(ground_map)).values())
    covered = set().union(*(gate_cells(g) for g in [*spec["gates"], *spec.get("water_gates", [])]))
    wall = set().union(*(polyline_cells(row["polygon"]["points"], vertices=True, closed=True)
                         for row in wall_specs(spec))) - covered
    if visible_wall_cells(spec, wall):
        # WallAssembly reprojects native face materials onto the cell union;
        # it never places the old doubled corner or borrows a rotated wall.
        required_tiles.add((f"tex_town_{spec['era_kit']}_wall", None, 0))
    if spec["bridges"]:
        required_tiles.add((f"tex_town_{spec['era_kit']}_bridge_deck", None, None))
        required_tiles |= {(f"tex_town_{spec['era_kit']}_{suffix}", None, bridge["rotation_deg"])
                           for suffix in ("bridge_deck", "bridge_rail") for bridge in spec["bridges"]}
    for asset_id, mask, rotation in sorted(required_tiles, key=lambda row: (row[0], *(-1 if v is None else v for v in row[1:]))):
        detail = (f" mask={mask}" if mask is not None else "") + (f" rotation={rotation}" if rotation is not None else "")
        # Four native ground variants are selected by the renderer's hash. Check
        # each actual image, not merely v01; single-image records repeat safely.
        is_ground = mask is None and rotation is None
        checked = set()
        for variant in range(4 if is_ground else 1):
            asset = tiles.resolve(asset_id, mask=mask, rotation_deg=rotation, variant_index=variant)
            if asset is None:
                result.append(issue("TOWN_ASSET_MISSING", f"贴片缺失 {asset_id}{detail}", "assets.tiles", severity=severity))
                continue
            key = (id(asset[0]), asset[1].get("file"))
            if key in checked:
                continue
            checked.add(key)
            result += asset_metadata_issues(asset, asset_id + detail, "assets.tiles",
                                            footprint=rotation is not None, release=release)
    plant_sizes = {"prp_song_dali_camellia": ((136, 131), (68, 95)),
                   "prp_song_dali_bamboo": ((136, 190), (68, 154)),
                   "prp_song_dali_broadleaf": ((136, 229), (68, 193)),
                   "prp_song_dali_grass": ((72, 60), (36, 40)),
                   "prp_song_willow": ((136, 229), (68, 193)),
                   "prp_song_bamboo": ((136, 190), (68, 154)),
                   "prp_song_broadleaf": ((136, 229), (68, 193))}
    for kind in spec["vegetation"]["palette"]:
        variants = []
        for variant in range(2):
            asset = buildings.resolve(kind, variant_index=variant)
            if asset is None:
                result.append(issue("TOWN_ASSET_MISSING", f"植物素材缺失 {kind} v{variant + 1:02d}", "assets.vegetation", severity=severity))
                continue
            image, meta = asset
            result += asset_metadata_issues(asset, f"{kind} v{variant + 1:02d}", "assets.vegetation",
                                            isolated=True, footprint=True, release=release)
            variants.append(meta.get("file", meta.get("png")))
            size, anchor = plant_sizes[kind]
            invalid = (image.size != size or tuple(meta.get("anchor_px", ())) != anchor
                       or meta.get("placement_domain") != "land" or meta.get("collision") != "none"
                       or meta.get("footprint_cells") != {"w": 1, "h": 1}
                       or meta.get("asset_type", meta.get("type")) == "terrain")
            if image.getchannel("A").crop((0, anchor[1] + 1, image.width, image.height)).getbbox():
                invalid = True
            if invalid:
                result.append(issue("TOWN_VEGETATION_ASSET_INVALID", f"植物域/尺寸/根锚/透明下沿不符 {kind}", "assets.vegetation"))
        if len(variants) == 2 and variants[0] == variants[1]:
            result.append(issue("TOWN_ASSET_MISSING", f"植物必须交付不同文件的两变体 {kind}", "assets.vegetation", severity=severity))
    for library, path in ((tiles, "assets.tiles"), (buildings, "assets.buildings")):
        for message in sorted(library.warnings):
            result.append(issue("TOWN_ASSET_METADATA", message, path, severity=severity))
    return result


class TownArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(1, f"{self.prog}: {message}\n")


def main(argv=None):
    parser = TownArgumentParser(description=__doc__)
    parser.add_argument("spec_pos", nargs="?", help="CitySpec YAML")
    parser.add_argument("layout_pos", nargs="?", help="TownLayout YAML")
    parser.add_argument("--spec", dest="spec_opt")
    parser.add_argument("--layout", dest="layout_opt")
    parser.add_argument("--tile-manifest")
    parser.add_argument("--building-manifest")
    parser.add_argument("--assets", type=Path, help="素材风格包根，例如 assets/default")
    parser.add_argument("--strict-assets", action="store_true")
    parser.add_argument("--release", action="store_true")
    parser.add_argument("--json", action="store_true", help="输出机器可读 issue 数组")
    args = parser.parse_args(argv)
    from common import TownError, load_yaml
    try:
        layout_path = args.layout_opt or args.layout_pos
        layout = load_yaml(layout_path) if layout_path else None
        spec_path = args.spec_opt or args.spec_pos or (layout or {}).get("source_spec", {}).get("path")
        if not spec_path:
            parser.error("需要 CitySpec 路径或带 source_spec 的 --layout")
        spec = load_yaml(spec_path)
        issues = validate_spec(spec)
        if layout is not None and not any(i["severity"] == "error" for i in issues):
            tile = args.tile_manifest or (args.assets / "baseline/tile/manifest.yaml" if args.assets else None)
            building = args.building_manifest or (args.assets / "baseline/building-map/manifest.yaml" if args.assets else None)
            issues += validate_layout(spec, layout, args.strict_assets, tile, building, args.release)
        issues = sort_issues(issues)
    except (OSError, ValueError, TypeError, KeyError, yaml.YAMLError, TownError) as exc:
        issues = [issue("TOWN_SCHEMA_PARSE", str(exc), "$")]
    errors = sum(i["severity"] == "error" for i in issues)
    if args.json:
        print(json.dumps(issues, ensure_ascii=False, indent=2))
    else:
        for row in issues:
            print(f"{row['severity'].upper()} {row['code']} {row['path']}: {row['message']}"
                  + (f" at={row['at']}" if row["at"] else ""))
        print(f"town check: {errors} errors, {sum(i['severity'] == 'warning' for i in issues)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
