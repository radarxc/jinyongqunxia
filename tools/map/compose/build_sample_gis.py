#!/usr/bin/env python3
"""Build the Dali Natural Earth 10m water layer used by the sample.

The small shapefile reader and filtering rules are copied from the coordinator
handoff's ``ne.py`` / ``geo2.py``.  Normal composition consumes only the
checked-in JSON, so it never depends on coordinator paths.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import struct
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
GEO = ROOT.parent.parent / "coord/geodata"
OUTPUT = HERE / "data/rg_dali_cangshan_ne10m.json"
REGION = "rg_dali_cangshan"
SOURCES = {
    "land": ("ne_10m_land", "5.1.1"),
    "lakes": ("ne_10m_lakes", "5.0.0"),
    "rivers": ("ne_10m_rivers_lake_centerlines", "5.0.0"),
}

_spec = importlib.util.spec_from_file_location("compose_sample_gis", HERE / "compose_map.py")
compose = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
sys.modules[_spec.name] = compose
_spec.loader.exec_module(compose)


def read_dbf(path: Path) -> list[dict[str, Any]]:
    payload = path.read_bytes()
    count = struct.unpack("<I", payload[4:8])[0]
    header, record = struct.unpack("<HH", payload[8:12])
    fields, offset = [], 32
    while payload[offset] != 0x0D:
        name = payload[offset:offset + 11].split(b"\0")[0].decode("ascii", "replace")
        fields.append((name, chr(payload[offset + 11]), payload[offset + 16]))
        offset += 32
    rows = []
    for index in range(count):
        row = payload[header + index * record:header + (index + 1) * record]
        values, position = {}, 1
        for name, kind, length in fields:
            raw = row[position:position + length].decode("utf-8", "replace").replace("\x00", "").strip()
            position += length
            if kind in "NF":
                try: values[name] = float(raw) if raw else None
                except ValueError: values[name] = None
            else: values[name] = raw
        rows.append(values)
    return rows


def read_shp(path: Path) -> list[dict[str, Any] | None]:
    payload, offset, rows = path.read_bytes(), 100, []
    while offset + 8 <= len(payload):
        length = struct.unpack(">i", payload[offset + 4:offset + 8])[0] * 2
        record = payload[offset + 8:offset + 8 + length]; offset += 8 + length
        if struct.unpack("<i", record[:4])[0] == 0:
            rows.append(None); continue
        bbox = struct.unpack("<4d", record[4:36])
        part_count, point_count = struct.unpack("<2i", record[36:44])
        parts = list(struct.unpack(f"<{part_count}i", record[44:44 + 4 * part_count]))
        start = 44 + 4 * part_count
        flat = struct.unpack(f"<{2 * point_count}d", record[start:start + 16 * point_count])
        points = list(zip(flat[0::2], flat[1::2])); parts.append(point_count)
        rows.append({"bbox": bbox, "parts": [points[parts[i]:parts[i + 1]] for i in range(part_count)]})
    return rows


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def hit(bbox: tuple[float, float, float, float], window: tuple[float, float, float, float]) -> bool:
    return not (bbox[2] < window[0] or bbox[0] > window[2]
                or bbox[3] < window[1] or bbox[1] > window[3])


def signed_area(ring: list[tuple[float, float]]) -> float:
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2)
               in zip(ring, ring[1:] + ring[:1])) / 2


def ellipse_lonlat(row: dict[str, Any], count: int = 48) -> list[tuple[float, float]]:
    major = row["len_km"] / 2
    minor = row["area_km2"] / (math.pi * major)
    tilt = math.radians(row["tilt"])
    kx, ky = 111.32 * math.cos(math.radians(row["lat"])), 110.57
    points = []
    for index in range(count):
        angle = 2 * math.pi * index / count
        x, y = minor * math.cos(angle), major * math.sin(angle)
        east = x * math.cos(tilt) + y * math.sin(tilt)
        north = -x * math.sin(tilt) + y * math.cos(tilt)
        points.append((row["lon"] + east / kx, row["lat"] + north / ky))
    return points


def feature(kind: str, index: int, geometry: str, coordinates: Any, **properties: Any) -> dict[str, Any]:
    properties["coordinate_space"] = "WGS84_lonlat"
    return {"id": f"ne10m_{kind}_{index:04d}",
            "geometry": {"type": geometry, "coordinates": coordinates},
            "properties": properties}


def load_source(name: str) -> list[tuple[dict[str, Any], dict[str, Any]]]:
    stem, _ = SOURCES[name]
    shp = GEO / stem / f"{stem}.shp"
    return [(props, geometry) for props, geometry in zip(read_dbf(shp.with_suffix(".dbf")), read_shp(shp))
            if geometry is not None]


def build() -> bytes:
    region = next(row for row in compose.load_structured(compose.MAP_DATA / "regions.yaml")["regions"]
                  if row["id"] == REGION)
    west, south, east, north = map(float, region["bounds"])
    window = (west - 4.0, south - 1.0, east + 4.0, north + 1.0)
    features: list[dict[str, Any]] = []
    index = 0
    for props, geometry in load_source("land"):
        if not hit(geometry["bbox"], window): continue
        for ring in geometry["parts"]:
            if not hit((min(x for x, _ in ring), min(y for _, y in ring),
                        max(x for x, _ in ring), max(y for _, y in ring)), window): continue
            index += 1
            topology = "land_hole" if signed_area(ring) > 0 else "land_outer"
            features.append(feature("land", index, "Polygon", [[list(point) for point in ring]],
                                    water_type="sea_exterior", topology=topology))
    exclusions = ((126.83, 43.64), (114.24, 33.01), (112.56, 33.33), (117.48, 45.49))
    index = 0
    for props, geometry in load_source("lakes"):
        cx, cy = (geometry["bbox"][0] + geometry["bbox"][2]) / 2, (geometry["bbox"][1] + geometry["bbox"][3]) / 2
        if props.get("featurecla") == "Reservoir" or any(abs(cx - x) < .06 and abs(cy - y) < .06 for x, y in exclusions): continue
        if not hit(geometry["bbox"], window): continue
        for ring in geometry["parts"]:
            if signed_area(ring) > 0: continue
            index += 1
            features.append(feature("lake", index, "Polygon", [[list(point) for point in ring]],
                                    water_type="lake", name=props.get("name_zh") or props.get("name") or "", source="NE10m"))
    wikidata_lakes = [
        {"name": "洱海", "wd": "Q83628", "lat": 25.763333, "lon": 100.1875, "len_km": 40.0, "area_km2": 252.91, "tilt": -14},
        {"name": "滇池", "wd": "Q83640", "lat": 24.800556, "lon": 102.671389, "len_km": 39.0, "area_km2": 297.90, "tilt": 10},
        {"name": "抚仙湖", "wd": "Q127016", "lat": 24.50225, "lon": 102.888889, "len_km": 30.0, "area_km2": 211.0, "tilt": 0},
    ]
    for row in wikidata_lakes:
        if not hit((row["lon"] - .3, row["lat"] - .3, row["lon"] + .3, row["lat"] + .3), window): continue
        index += 1
        features.append(feature("lake", index, "Polygon", [[list(point) for point in ellipse_lonlat(row)]],
                                water_type="lake", name=row["name"], source=f"Wikidata {row['wd']}"))
    index = 0
    for props, geometry in load_source("rivers"):
        rank = props.get("scalerank")
        if props.get("featurecla") != "River" or rank is None or rank > 9 or not hit(geometry["bbox"], window): continue
        for line in geometry["parts"]:
            index += 1
            features.append(feature("river", index, "LineString", [list(point) for point in line],
                                    water_type="river", scalerank=int(rank),
                                    name=props.get("name_zh") or props.get("name") or ""))
    source_rows = {}
    for name, (stem, version) in SOURCES.items():
        archive = GEO / f"{stem}.zip"
        source_rows[name] = {"dataset": stem, "version": version,
                             "sha256": sha256_file(archive),
                             "url": f"https://naciscdn.org/naturalearth/10m/physical/{stem}.zip"}
    document = {"schema": "tianshu.map-compose-sample-gis.v1", "region_id": REGION,
                "coordinate_space": "WGS84_lonlat", "features": features,
                "sources": source_rows, "wikidata_lakes": wikidata_lakes,
                "provenance": "coordinator HANDOFF_CODEX.md geo2.py/ne.py filtering and reader"}
    return compose.canonical_json(document)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    payload = build()
    if args.check:
        if not OUTPUT.is_file() or OUTPUT.read_bytes() != payload:
            print(f"stale sample GIS: {OUTPUT}", file=sys.stderr); return 1
    else:
        OUTPUT.parent.mkdir(parents=True, exist_ok=True); OUTPUT.write_bytes(payload)
    print(json.dumps({"status": "ok", "check": args.check, "output": str(OUTPUT),
                      "sha256": hashlib.sha256(payload).hexdigest()}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
