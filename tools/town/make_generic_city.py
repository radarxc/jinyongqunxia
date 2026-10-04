#!/usr/bin/env python3
"""Generate deterministic inferred CitySpec files for secondary towns and sites."""

from __future__ import annotations

import argparse
from collections import Counter
from copy import deepcopy
import hashlib
from pathlib import Path
import re
import sys

import yaml

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "tools/agents"))

from prod_plan import BAND_YEAR, KITS, city_units, kit_for  # noqa: E402
from check_town import validate_spec  # noqa: E402
from common import catalog, canonical_bytes  # noqa: E402

BASIS = "推定格局（作者 2026-09-30：小城 / 遗址不做史料复原）"
CITIES = ROOT / "docs/design/map/cities.yaml"
DEFAULT_OUT = ROOT / "docs/design/town"
WET_REGIONS = ("rg_jiangnan", "rg_zhedong", "rg_jianghuai", "rg_fujian",
               "rg_jingxiang", "rg_huxiang", "rg_bashu", "rg_lingnan",
               "rg_jiangxi", "rg_guangxi", "rg_donghai_islands",
               "rg_nanhai_islands", "rg_taiwan", "rg_dali", "rg_yundian")
BUSINESS_SUFFIX = {"escort_agency": "biaoju", "casino": "casino",
                   "manor": "manor", "inn": "inn",
                   "market": "market", "river_or_sea_port": "wharf"}


def source_data(path: Path = CITIES) -> dict:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("cities"), list):
        raise ValueError(f"{path}：城市名录格式无效")
    return data


def chapter_worlds() -> dict[str, str]:
    text = (ROOT / "docs/00-canon.md").read_text(encoding="utf-8")
    result = {}
    for value in re.findall(r"\bch(?:0[1-9]|1[0-4])_[a-z0-9_]+\b", text):
        result.setdefault(value[:4], value)
    return result


def stable_seed(city_id: str, band: str) -> int:
    return int.from_bytes(hashlib.sha256(f"{city_id}\0{band}".encode()).digest()[:4], "big")


def partition(size: int) -> dict:
    import math
    qs = [q for r in range(1, size + 1)
          for q in range(math.ceil(-r / 2), math.ceil(math.sqrt(3) * size / 2 - r / 2))]
    count = max(qs) - min(qs) + 1
    q_bands = [count] if count <= 96 else [(count + 1) // 2, count // 2]
    return {"q_min": min(qs), "r_min": 1, "q_slot_count": count,
            "r_slot_count": size, "q_band_slots": q_bands,
            "r_band_slots": [size], "formal_scene_refs": None}


def kit_types(kit: str) -> dict[str, str]:
    prefix = f"bld_kit_{kit}_"
    return {type_id.removeprefix(prefix): type_id for type_id in catalog()
            if type_id.startswith(prefix)}


def choose(types: dict[str, str], *suffixes: str) -> str:
    for suffix in suffixes:
        if suffix in types:
            return types[suffix]
    raise ValueError(f"套件缺少功能建筑：{suffixes}")


def add_type(zone: dict, type_id: str) -> None:
    if type_id not in zone["allowed_building_types"]:
        zone["allowed_building_types"].append(type_id)


def quota(type_id: str, zone: str, count: tuple[int, int] = (1, 1)) -> dict:
    return {"type": type_id, "zone_refs": [zone],
            "count": {"min": count[0], "max": count[1]},
            "required": count[0] > 0, "business_ref": None,
            "institution_ref": None, "placement_note": BASIS}


def rect(x0: int, z0: int, x1: int, z1: int) -> dict:
    return {"rect": {"min": {"x": x0, "z": z0},
                     "max": {"x": x1, "z": z1}}}


def zones_and_quotas(kit: str, size: int, businesses: list[str], site: bool) -> tuple[list, list]:
    types = kit_types(kit)
    house = choose(types, "house_small", "house")
    shop = choose(types, "shop_1f", "shop")
    office = choose(types, "courtyard") if site else choose(types, "yamen", "courtyard")
    market = choose(types, "market_stall", "market")
    temple = choose(types, "temple_hall", "stupa", "pagoda")
    # Every zone touches the four-cell cross street.  Otherwise an automatic
    # connector can bisect the only rectangle large enough for a 17x13 yamen.
    if site:
        pad, road_lo, road_hi, limit, office_end = 6, 31, 35, 58, 17
    else:
        pad, road_lo, road_hi, limit, office_end = 12, 47, 51, 84, 29
    rows = [
        ("zone_office", "administrative",
         rect(pad, pad, office_end, road_lo), 100, [office]),
        ("zone_market", "market",
         rect(road_hi, pad, limit, road_lo), 90, [market, shop]),
        ("zone_commercial", "commercial",
         rect(road_hi, road_hi, limit, limit), 85, [shop]),
        ("zone_religious", "religious",
         rect(office_end, pad, road_lo, road_lo), 80, [temple]),
        ("zone_residential", "residential",
         rect(pad, road_hi, road_lo, limit), 50, [house]),
    ]
    zones = [{"id": ident, "kind": kind, "geometry": geometry,
              "priority": priority, "density": 0.35 if site else 0.52,
              "allowed_building_types": allowed,
              "ground_mix": {"rammed_earth": 100}, "basis": BASIS}
             for ident, kind, geometry, priority, allowed in rows]
    quotas = [quota(office, "zone_office"), quota(market, "zone_market"),
              quota(shop, "zone_commercial", (1, 2)),
              quota(temple, "zone_religious"),
              quota(house, "zone_residential", (1, 2) if site else (2, 4))]
    zone_by_kind = {row["kind"]: row for row in zones}
    for business in businesses:
        suffix = BUSINESS_SUFFIX.get(business)
        if suffix is None:
            continue
        choices = {"market": ("market_stall", "market"),
                   "wharf": ("wharf",)}.get(suffix, (suffix,))
        type_id = choose(types, *choices)
        zone = (zone_by_kind["market"] if suffix in {"market", "wharf"}
                else zone_by_kind["residential"] if suffix == "manor"
                else zone_by_kind["commercial"])
        add_type(zone, type_id)
        existing = next((row for row in quotas if row["type"] == type_id), None)
        if existing:
            existing["count"] = {"min": 1, "max": max(1, existing["count"]["max"])}
            existing["required"] = True
        else:
            quotas.append(quota(type_id, zone["id"]))
    return zones, quotas


def wall_and_gates(kit: str, size: int, site: bool, unwalled: bool) -> tuple[object, list]:
    if unwalled:
        return "none", []
    pad, middle = (8, 32) if site else (10, 48)
    if site:
        walls = [{"id": "ruin_wall", "role": "division",
                  "polygon": {"points": [{"x": pad, "z": pad},
                                              {"x": middle - 8, "z": pad},
                                              {"x": middle - 8, "z": pad + 1},
                                              {"x": pad, "z": pad + 1}]},
                  "inside_margin_cells": 0, "basis": BASIS}]
    else:
        walls = [{"id": "outer", "role": "outer",
                  "polygon": {"points": [{"x": pad, "z": pad},
                                              {"x": size - pad, "z": pad},
                                              {"x": size - pad, "z": size - pad},
                                              {"x": pad, "z": size - pad}]},
                  "inside_margin_cells": 2, "basis": BASIS}]
    def gate(ident, side, x, z, rotation, road, primary=False):
        width = 4
        return {"id": ident, "side": side, "at": {"x": x, "z": z},
                "width_cells": width, "asset_type": f"tex_town_{kit}_city_gate",
                "rotation_deg": rotation, "footprint_cells": {"w": 8, "h": 4},
                "passage_cells": {"w": 4, "h": 4}, "road_ref": road,
                "primary": primary, "wall_ref": "outer", "basis": BASIS}
    gates = [] if site else [gate("south_gate", "south", middle, pad, 0,
                                  "main_north_south", True)]
    if not site:
        gates.append(gate("north_gate", "north", middle, size - pad, 180,
                          "main_north_south"))
    return walls, gates


def make_spec(city: dict, band: str, chapter: str, chapters: dict, worlds: dict) -> dict:
    importance = city.get("importance")
    if importance not in {"secondary", "site"}:
        raise ValueError(f"{city['id']} importance={importance!r}，只允许 secondary/site")
    era = (city.get("eras") or {}).get(chapter, {})
    if not era.get("open") or chapters[chapter]["band"] != band:
        raise ValueError(f"{city['id']} {chapter} 不属于开放年代带 {band}")
    site, size = importance == "site", 64 if importance == "site" else 96
    kit = kit_for(city.get("region", ""), band)
    wet = (city.get("region", "").startswith(WET_REGIONS)
           or "river_or_sea_port" in (city.get("businesses") or []))
    unwalled = kit == "mongol" and city.get("region") in {"rg_mobei", "rg_monan"}
    walls, gates = wall_and_gates(kit, size, site, unwalled)
    middle, start, end = size // 2, 0 if unwalled else (8 if site else 10), size - (0 if unwalled else (8 if site else 10))
    streets = [{"id": "main_north_south", "class": "main_axis", "width_cells": 4,
                "points": [{"x": middle, "z": start}, {"x": middle, "z": end}],
                "surface": "dirt_road", "priority": 100, "basis": BASIS},
               {"id": "market_cross_street", "class": "secondary", "width_cells": 4,
                "points": [{"x": start + 2, "z": middle}, {"x": end - 2, "z": middle}],
                "surface": "dirt_road", "priority": 80, "basis": BASIS}]
    rivers, bridges = [], []
    if wet:
        # Keep the canal along the outer edge of the eastern districts so it
        # does not split required building footprints.
        river_x = end - (4 if site else 6)
        rivers = [{"id": "generic_canal", "width_cells": 4,
                   "points": [{"x": river_x, "z": start + 3},
                              {"x": river_x, "z": end - 3}],
                   "flow": "south", "navigable": True, "basis": BASIS}]
        # Even-width river rasterization biases east; anchor the even-length
        # bridge one cell east so both extreme x columns land on dry road.
        bridges = [{"id": "market_bridge", "at": {"x": river_x + 1, "z": middle},
                    "river_ref": "generic_canal", "road_ref": "market_cross_street",
                    "length_cells": 6, "width_cells": 4, "rotation_deg": 90,
                    "basis": BASIS}]
    zones, quotas = zones_and_quotas(kit, size, city.get("businesses") or [], site)
    display = era.get("name") or city.get("modern_name") or city["id"]
    return {"schema_version": "town.city_spec.v1", "kind": "CitySpec",
            "city_id": city["id"], "chapter_id": chapter, "book_world": worlds[chapter],
            "display_name": display, "historical_year": chapters[chapter]["year"],
            "era_kit": kit, "seed": stable_seed(city["id"], band),
            "design_intent": {"prosperity": f"generic_{importance}",
                              "notes": [BASIS, "依据：src_generic_layout",
                                        f"region={city.get('region', '')}; band={band}"]},
            "grid": {"width": size, "height": size, "cell_m": 1, "chunk_cells": 32},
            "runtime_partition": partition(size),
            "projection": {"tile_px": [64, 32], "pitch_deg": 30, "yaw_deg": 45},
            "walls": walls, "gates": gates, "streets": streets, "rivers": rivers,
            "bridges": bridges, "zones": zones, "landmarks": [],
            "building_quotas": quotas,
            "vegetation": {"palette": ["prp_song_dali_grass"],
                           "density": 0.025 if site else 0.012, "avoid_road_cells": 1,
                           "cluster_rule": "2至5株成组", "basis": BASIS},
            "sources": [{"key": "src_generic_layout", "kind": "design_interpretation",
                         "title": "小城与遗址推定格局规则", "url": None, "accessed": None,
                         "confidence": "original_extension", "supports": ["layout"],
                         "note": BASIS}]}


def selected_units(data: dict, city_id: str | None, band: str | None,
                   importance: set[str]) -> list[tuple[dict, str, list[str]]]:
    cities = {row["id"]: row for row in data["cities"]}
    if city_id and city_id not in cities:
        raise ValueError(f"未知城市：{city_id}")
    result = []
    for (candidate, era_band), unit in sorted(city_units(band).items()):
        city = cities[candidate]
        if city_id and candidate != city_id:
            continue
        if city.get("importance") not in importance:
            continue
        result.append((city, era_band, sorted(unit["chapters"])))
    if city_id and band and not result:
        raise ValueError(f"{city_id} 在 {band} 没有开放章节，或 importance 不在筛选范围")
    return result


def run(args) -> tuple[int, dict]:
    data, worlds = source_data(), chapter_worlds()
    importance = {item.strip() for item in args.importance.split(",") if item.strip()}
    if not importance or importance - {"secondary", "site"}:
        raise ValueError("--importance 只接受 secondary,site 的非空子集")
    units = selected_units(data, args.city, args.band, importance)
    if args.primary_chapter:
        units = [(city, band, chapters) for city, band, chapters in units
                 if args.primary_chapter in chapters]
    totals, kits, bands, invalid = 0, Counter(), Counter(), []
    for city, era_band, chapters in units:
        if args.primary_chapter:
            chapters = [args.primary_chapter] + [ch for ch in chapters if ch != args.primary_chapter]
        anchor = make_spec(city, era_band, chapters[0], data["chapters"], worlds)
        anchor["historical_year"] = BAND_YEAR[era_band]
        specs = []
        for chapter in chapters:
            spec = deepcopy(anchor)
            spec["chapter_id"] = chapter
            spec["book_world"] = worlds[chapter]
            specs.append(spec)
        for spec in specs[1:]:
            comparable = deepcopy(spec)
            comparable.update(chapter_id=anchor["chapter_id"],
                              book_world=anchor["book_world"])
            if comparable != anchor:
                raise AssertionError(f"{city['id']} {era_band} 同带规格发生非章节差异")
        for spec in specs:
            issues = validate_spec(spec)
            errors = [row for row in issues if row["severity"] == "error"]
            if errors:
                invalid.append((spec["city_id"], spec["chapter_id"], errors))
            elif not args.check:
                path = args.out / f"{spec['city_id']}__{spec['chapter_id']}.yaml"
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(canonical_bytes(spec))
            totals += 1
            kits[spec["era_kit"]] += 1
            bands[era_band] += 1
    summary = {"units": len(units), "specs": totals, "invalid": len(invalid),
               "by_band": dict(sorted(bands.items())), "by_kit": dict(sorted(kits.items()))}
    if invalid:
        for city, chapter, issues in invalid[:20]:
            print(f"{city} {chapter}: {issues[0]['code']} {issues[0]['path']} {issues[0]['message']}",
                  file=sys.stderr)
    print(yaml.safe_dump(summary, allow_unicode=True, sort_keys=False).strip())
    return (1 if invalid else 0), summary


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--city")
    target.add_argument("--all", action="store_true")
    parser.add_argument("--band", choices=sorted(BAND_YEAR))
    parser.add_argument("--importance", default="secondary,site")
    parser.add_argument("--primary-chapter", choices=sorted(chapter_worlds()))
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--check", action="store_true", help="只校验，不写规格")
    args = parser.parse_args(argv)
    if args.city and not args.band:
        parser.error("--city 必须同时给出 --band")
    try:
        return run(args)[0]
    except (OSError, ValueError, KeyError, TypeError, yaml.YAMLError) as exc:
        print(f"TOWN_GENERIC_ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
