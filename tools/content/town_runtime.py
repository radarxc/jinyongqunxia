#!/usr/bin/env python3
"""Compile authored CitySpec and generated TownLayout YAML into browser runtime JSON."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[2]
SPEC_DIR = ROOT / "docs/design/town"
LAYOUT_DIR = ROOT / "assets/default/baseline/town"
TILE_MANIFEST = ROOT / "assets/default/baseline/tile/manifest.yaml"
BUILDING_MANIFEST = ROOT / "assets/default/baseline/building-map/manifest.yaml"
NON_ENTERABLE = ("market_stall", "pagoda", "wharf", "palace_gate")
SHARED_TILE_OWNER = {
    "rammed_earth": "song_dali", "dirt_road": "song_dali",
    "grass": "song_dali", "grey_brick": "song_southern",
    "stone_slab": "song_southern", "water": "song_southern",
    "riverbank": "song_dali", "road_edge": "song_southern",
}
NEIGHBORS = ((0, 1), (1, 1), (1, 0), (1, -1),
             (0, -1), (-1, -1), (-1, 0), (-1, 1))


def load_yaml(path: Path) -> Any:
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def compact(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def sha256_files(paths: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in paths:
        digest.update(path.relative_to(ROOT).as_posix().encode())
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def runs_for_cells(cells: list[dict[str, int]], width: int) -> list[list[int]]:
    indices = sorted({row["z"] * width + row["x"] for row in cells})
    result: list[list[int]] = []
    for index in indices:
        if result and result[-1][0] + result[-1][1] == index:
            result[-1][1] += 1
        else:
            result.append([index, 1])
    return result


def normalize_mask(mask: int) -> int:
    for diagonal, first, second in ((2, 1, 4), (8, 4, 16),
                                    (32, 16, 64), (128, 64, 1)):
        if not mask & first or not mask & second:
            mask &= ~diagonal
    return mask & 255


def autotile_mask(x: int, z: int, cells: set[tuple[int, int]]) -> int:
    return normalize_mask(sum(1 << index for index, (dx, dz) in enumerate(NEIGHBORS)
                              if (x + dx, z + dz) in cells))


def edge_tiles(layout: dict[str, Any], width: int, height: int) -> list[list[Any]]:
    water = {(row["x"], row["z"]) for row in layout["water_cells"]}
    roads: dict[str, set[tuple[int, int]]] = {}
    ground_kind: dict[tuple[int, int], str] = {}
    for start, length, cell in layout["ground_cells"]:
        for index in range(start, start + length):
            ground_kind[index % width, index // width] = cell["ground"]
    for points in layout.get("roads", {}).values():
        for row in points:
            point = row["x"], row["z"]
            if point not in water:
                roads.setdefault(ground_kind[point], set()).add(point)
    result: list[list[Any]] = []
    for group in roads.values():
        for x, z in group:
            mask = autotile_mask(x, z, group)
            if mask != 255:
                result.append([z * width + x, "road_edge", mask])
    domain = set(ground_kind)
    for x, z in domain:
        wet = (x, z) in water
        opposite = sum(1 << index for index, (dx, dz) in enumerate(NEIGHBORS)
                       if (x + dx, z + dz) in domain
                       and ((x + dx, z + dz) in water) != wet)
        if opposite:
            result.append([z * width + x, "riverbank", 255 ^ opposite])
    return sorted(result, key=lambda row: (row[0], row[1]))


def asset_entry(row: dict[str, Any], kind: str) -> dict[str, Any]:
    size = row.get("size")
    width = height = None
    if isinstance(size, str) and "x" in size:
        width, height = (int(value) for value in size.split("x", 1))
    anchor = row.get("anchor_px") or (row.get("building") or {}).get("anchor")
    footprint_width = row.get("footprint_width_px") or (row.get("projection_contract") or {}).get("ground_width_px")
    return {"id": row["id"], "file": row["file"], "kind": kind,
            "width": width, "height": height, "anchor": anchor,
            "footprintWidthPx": footprint_width}


def choose_assets(spec: dict[str, Any], layout: dict[str, Any],
                  tile_rows: list[dict[str, Any]], building_rows: list[dict[str, Any]]) -> dict[str, Any]:
    kit = spec["era_kit"]
    surfaces = {row[2]["ground"] for row in layout["ground_cells"]}
    tile_entries = []
    for surface in sorted(surfaces):
        owner = SHARED_TILE_OWNER.get(surface, kit)
        prefix = f"tex_town_{owner}_{surface}__"
        row = next((item for item in tile_rows if item["id"].startswith(prefix)), None)
        if row is not None:
            tile_entries.append(asset_entry(row, surface))
    for kind in ("road_edge", "riverbank", "bridge_deck", "bridge_rail"):
        owner = SHARED_TILE_OWNER.get(kind, kit)
        tile_entries.extend(asset_entry(row, kind) for row in tile_rows
                            if row["id"].startswith(f"tex_town_{owner}_{kind}__"))
    used = {row["type"] for row in layout["buildings"]}
    building_entries = [asset_entry(row, "building") for row in building_rows if row["id"] in used]
    if used != {row["id"] for row in building_rows if row["id"] in used}:
        missing = sorted(used - {row["id"] for row in building_rows})
        raise ValueError(f"missing building assets: {missing}")
    return {
        "tile": {"baseUrl": "/assets/default/baseline/tile/",
                 "manifest": TILE_MANIFEST.relative_to(ROOT).as_posix(), "entries": tile_entries},
        "building": {"baseUrl": "/assets/default/baseline/building-map/",
                     "manifest": BUILDING_MANIFEST.relative_to(ROOT).as_posix(), "entries": building_entries},
    }


def interior_kind(building_type: str) -> str:
    if any(key in building_type for key in ("shop", "restaurant", "casino")):
        return "shop"
    if "inn" in building_type:
        return "inn"
    if any(key in building_type for key in ("temple", "shrine")):
        return "temple"
    if any(key in building_type for key in ("house", "courtyard", "manor", "wangfu")):
        return "residence"
    return "other"


def nearest_spawn(spec: dict[str, Any], nodes: list[list[Any]]) -> list[int]:
    gate = next(row for row in spec["gates"] if row["primary"])
    target_x, target_z = gate["at"]["x"] + 0.5, gate["at"]["z"] + 0.5
    def rank(node: list[Any]) -> tuple[float, int, int]:
        q, r = node[0], node[1]
        world_x = 2 * math.sqrt(3) / 3 * (q + r / 2)
        world_z = spec["grid"]["height"] - r
        return ((world_x - target_x) ** 2 + (world_z - target_z) ** 2, r, q)
    winner = min(nodes, key=rank)
    return [winner[0], winner[1]]


def compile_town(spec_path: Path, layout_path: Path) -> dict[str, Any]:
    spec, layout = load_yaml(spec_path), load_yaml(layout_path)
    if layout["source_spec"]["city_id"] != spec["city_id"] or layout["grid"] != spec["grid"]:
        raise ValueError(f"spec/layout mismatch: {spec_path}")
    palette: list[dict[str, Any]] = []
    palette_index: dict[str, int] = {}
    ground_runs: list[list[int]] = []
    for start, length, cell in layout["ground_cells"]:
        item = {"ground": cell["ground"], "overlay": cell.get("overlay"),
                "elevationCm": round(cell.get("elevation_m", 0) * 100),
                "walkable": bool(cell["walkable"])}
        key = compact(item)
        if key not in palette_index:
            palette_index[key] = len(palette)
            palette.append(item)
        index = palette_index[key]
        if ground_runs and ground_runs[-1][0] + ground_runs[-1][1] == start and ground_runs[-1][2] == index:
            ground_runs[-1][1] += length
        else:
            ground_runs.append([start, length, index])
    ground_at: dict[int, dict[str, Any]] = {}
    for start, length, cell in layout["ground_cells"]:
        for index in range(start, start + length):
            ground_at[index] = cell
    height = spec["grid"]["height"]
    navigation = []
    for point in layout["walk_layer"]["runtime_hex_walkable"]:
        q, r = point["q"], point["r"]
        world_x = 2 * math.sqrt(3) / 3 * (q + r / 2)
        planning_x = min(spec["grid"]["width"] - 1, max(0, math.floor(world_x)))
        planning_z = min(height - 1, max(0, math.floor(height - r)))
        cell = ground_at[planning_z * spec["grid"]["width"] + planning_x]
        navigation.append([q, r, round(cell.get("elevation_m", 0) * 100), "flat"])
    navigation.sort(key=lambda row: (row[1], row[0]))
    buildings, anchors = [], []
    for row in layout["buildings"]:
        kind = interior_kind(row["type"])
        enterable = not any(token in row["type"] for token in NON_ENTERABLE)
        entrances = [[point["q"], point["r"]] for point in row["entrance_hexes"]]
        buildings.append({"id": row["id"], "type": row["type"],
            "origin": [row["origin"]["x"], row["origin"]["z"]],
            "size": [row["size"]["w"], row["size"]["h"]],
            "rotationDeg": row["rotation_deg"], "entrances": entrances,
            "businessRef": row.get("business_ref"), "poi": row.get("poi"),
            "enterable": enterable, "interiorKind": kind, "assetId": row["type"]})
        if enterable:
            anchors.append({"id": f"anchor_building_{row['id']}", "kind": "building",
                "point": entrances[0], "buildingId": row["id"],
                "ref": row.get("business_ref") or row.get("poi"), "riskBaseBp": None})
        if kind in ("inn", "temple"):
            risk = 100 if kind == "inn" else 250
            anchors.append({"id": f"anchor_meditation_{row['id']}", "kind": "meditation",
                "point": entrances[0], "buildingId": row["id"], "ref": None,
                "riskBaseBp": risk})
    source_paths = [spec_path, layout_path, TILE_MANIFEST, BUILDING_MANIFEST]
    value: dict[str, Any] = {
        "schemaVersion": "town-runtime.v1", "revision": "",
        "cityId": spec["city_id"], "chapterId": spec["chapter_id"],
        "sceneId": spec["city_id"], "displayName": spec["display_name"],
        "historicalYear": spec["historical_year"], "eraKit": spec["era_kit"],
        "source": {"spec": spec_path.relative_to(ROOT).as_posix(),
                   "layout": layout_path.relative_to(ROOT).as_posix(),
                   "sha256": sha256_files(source_paths)},
        "grid": {"width": spec["grid"]["width"], "height": height, "cellM": 1,
                 "chunkCells": spec["grid"]["chunk_cells"]},
        "projection": {"tilePx": spec["projection"]["tile_px"],
                       "pitchDeg": spec["projection"]["pitch_deg"],
                       "yawDeg": spec["projection"]["yaw_deg"], "elevationCmPerM": 100},
        "assets": choose_assets(spec, layout, load_yaml(TILE_MANIFEST), load_yaml(BUILDING_MANIFEST)),
        "groundPalette": palette, "groundRuns": ground_runs,
        "edgeTiles": edge_tiles(layout, spec["grid"]["width"], height),
        "waterRuns": runs_for_cells(layout["water_cells"], spec["grid"]["width"]),
        "bridgeRuns": runs_for_cells(layout["bridge_cells"], spec["grid"]["width"]),
        "navigation": {"neighborOrder": "axial-rq-v1", "maxStepCm": 50,
                       "nodes": navigation, "spawn": nearest_spawn(spec, navigation)},
        "buildings": buildings, "anchors": anchors,
    }
    value["revision"] = hashlib.sha256(compact({**value, "revision": ""}).encode()).hexdigest()
    validate_runtime(value)
    return value


def validate_runtime(value: dict[str, Any]) -> None:
    grid = value["grid"]
    if value["schemaVersion"] != "town-runtime.v1" or grid["cellM"] != 1:
        raise ValueError("runtime contract")
    cursor = 0
    for start, length, palette in value["groundRuns"]:
        if start != cursor or length <= 0 or palette >= len(value["groundPalette"]):
            raise ValueError("ground RLE")
        cursor += length
    if cursor != grid["width"] * grid["height"]:
        raise ValueError("ground RLE coverage")
    for cell, kind, mask in value["edgeTiles"]:
        if not 0 <= cell < grid["width"] * grid["height"] or kind not in ("road_edge", "riverbank") or not 0 <= mask < 255:
            raise ValueError("edge tile")
    nodes = {(q, r) for q, r, _, _ in value["navigation"]["nodes"]}
    if len(nodes) != len(value["navigation"]["nodes"]) or tuple(value["navigation"]["spawn"]) not in nodes:
        raise ValueError("navigation identity")
    for row in value["buildings"]:
        if not row["entrances"] or any(tuple(point) not in nodes for point in row["entrances"]):
            raise ValueError(f"building entrance: {row['id']}")
    anchors = [row["id"] for row in value["anchors"]]
    if len(set(anchors)) != len(anchors) or any(not key.startswith("anchor_") for key in anchors):
        raise ValueError("anchor identity")


def encode(value: dict[str, Any]) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False) + "\n"


def source_pairs() -> list[tuple[Path, Path]]:
    result = []
    for spec_path in sorted(SPEC_DIR.glob("city_*__ch*.yaml")):
        spec = load_yaml(spec_path)
        suffix = spec_path.stem.removeprefix("city_")
        layout_path = LAYOUT_DIR / f"town_{suffix}.layout.yaml"
        if not layout_path.exists():
            raise FileNotFoundError(f"layout missing for {spec_path.relative_to(ROOT)}")
        result.append((spec_path, layout_path))
    return result


def output_path(output_root: Path, value: dict[str, Any]) -> Path:
    return output_root / value["chapterId"] / f"{value['cityId']}.json"


def write_bounded(path: Path, output: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    # Compact JSON deliberately keeps generated writes below the 150-line task limit.
    path.write_text(output, encoding="utf-8", newline="")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("output", nargs="?", default="content/town", type=Path)
    args = parser.parse_args(argv)
    output_root = args.output if args.output.is_absolute() else ROOT / args.output
    failures = []
    for spec_path, layout_path in source_pairs():
        value = compile_town(spec_path, layout_path)
        path, output = output_path(output_root, value), encode(value)
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != output:
                try:
                    failures.append(path.relative_to(ROOT).as_posix())
                except ValueError:
                    failures.append(path.as_posix())
        else:
            write_bounded(path, output)
        print(f"{value['cityId']}: {len(value['navigation']['nodes'])} nodes, "
              f"{len(value['buildings'])} buildings, {len(value['anchors'])} anchors")
    if failures:
        print("stale town runtime: " + ", ".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
