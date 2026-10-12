#!/usr/bin/env python3
"""Derive deterministic painted town minimaps and marker metadata."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import re
import sys
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / "assets/default/baseline/town"
OUTPUT = ROOT / "assets/default/town-minimap"
LOCALE = ROOT / "content/locales/zh-Hans/town-facilities.yaml"
FACILITIES = ROOT / "content/town/facilities"
SCHEMA = "town-minimap.v1"
TOWNS = ("town_dali__ch01", "town_hangzhou__ch02")
QUALITY = 82
METHOD = 6
SOUTH = (-2 / math.sqrt(5), 1 / math.sqrt(5))
GLYPHS = {
    "yaopu": "药", "zahuo": "杂", "kedian": "客",
    "tiejiang": "铁", "chengyi": "衣", "mashi": "马", "shitan": "食",
}


def load_yaml(path: Path) -> dict:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"expected mapping: {path}")
    return value


def layout_key(stem: str) -> str:
    return "city_" + stem.removeprefix("town_")


def nested(root: dict, dotted: str) -> str:
    value: object = root
    for part in dotted.split("."):
        if not isinstance(value, dict) or part not in value:
            raise KeyError(dotted)
        value = value[part]
    if not isinstance(value, str) or not value:
        raise ValueError(dotted)
    return value


def town_pixel(x: float, z: float, grid_height: int, scale: float, top: float) -> list[float]:
    """Same flat-ground equation as planningToTownPixels(), at preview scale."""
    return [round(32 * (x + z) * scale, 3),
            round((16 * (grid_height + x - z) + top) * scale, 3)]


def centre(building: dict) -> tuple[float, float]:
    origin, size = building["origin"], building["size"]
    return origin["x"] + size["w"] / 2, origin["z"] + size["h"] / 2


def entrance(building: dict, grid_height: int) -> tuple[float, float] | None:
    """Return the runtime entrance hex centre in planning coordinates."""
    rows = building.get("entrance_hexes", [])
    if rows:
        q, r = rows[0]["q"], rows[0]["r"]
        return 2 * math.sqrt(3) / 3 * (q + r / 2), grid_height - r
    cells = building.get("entrance_cells", [])
    return (cells[0]["x"] + 0.5, cells[0]["z"] + 0.5) if cells else None


def image_bytes(path: Path) -> tuple[bytes, int, int]:
    with Image.open(path) as source:
        image = source.convert("RGB")
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=QUALITY, method=METHOD, exact=True,
                   lossless=False, exif=b"", xmp=b"", icc_profile=None)
        return output.getvalue(), image.width, image.height


def figure_name(row: dict, fallback: str) -> str:
    match = re.search(r"图名：([^；]+)", str(row.get("basis", "")))
    name = match.group(1).strip() if match else fallback
    return re.sub(r"（(?:推定|位置意象|拟|提前)）$", "", name)


def marker(row_id: str, kind: str, glyph: str, name: str, position: tuple[float, float],
           grid_height: int, scale: float, top: float, *, building: dict | None = None) -> dict:
    result = {"id": row_id, "kind": kind, "glyph": glyph, "name": name,
              "px": town_pixel(*position, grid_height, scale, top)}
    if building is not None:
        result["buildingId"] = building["id"]
        target = entrance(building, grid_height)
        if target is not None:
            result["entrance"] = town_pixel(*target, grid_height, scale, top)
    return result


def facility_markers(key: str, buildings: dict[str, dict], locale: dict, grid_height: int,
                     scale: float, top: float) -> list[dict]:
    path = FACILITIES / f"{key}.yaml"
    if not path.exists():
        return []
    result = []
    for row in load_yaml(path).get("facilities", []):
        building = buildings.get(row["buildingId"] )
        if building is None:
            raise ValueError(f"unknown building {key}:{row['buildingId']}")
        sub = row["sub"]
        if sub not in GLYPHS:
            continue
        kind = "inn" if row["kind"] == "inn" else "shop"
        result.append(marker(row["key"], kind, GLYPHS[sub], nested(locale, row["nameKey"]),
                             centre(building), grid_height, scale, top, building=building))
    return result


def landmark_markers(spec: dict, buildings: dict[str, dict], grid_height: int,
                     scale: float, top: float) -> list[dict]:
    result, seen = [], set()
    for row in spec.get("landmarks", []):
        asset = row["type"]
        if "pagoda" in asset:
            kind, glyph, fallback = "pagoda", "塔", "佛塔"
        elif "temple_hall" in asset or "shrine" in asset:
            kind, glyph, fallback = "temple", "寺", "寺院"
        elif "palace_gate" in asset:
            kind, glyph, fallback = "gate", "门", "宫门"
        else:
            continue
        building = next((item for item in buildings.values()
                         if item["type"] == asset and item["origin"] == row["origin"]), None)
        if building is None:
            continue
        seen.add(building["id"] )
        result.append(marker(row["id"], kind, glyph, figure_name(row, fallback), centre(building),
                             grid_height, scale, top, building=building))
    for building in buildings.values():
        asset = building["type"]
        if building["id"] in seen:
            continue
        if "yamen" in asset:
            result.append(marker(f"landmark_{building['id']}", "office", "衙", "衙署",
                                 centre(building), grid_height, scale, top, building=building))
        elif "shrine" in asset:
            result.append(marker(f"landmark_{building['id']}", "temple", "寺", "祠庙",
                                 centre(building), grid_height, scale, top, building=building))
    return result


def gate_markers(spec: dict, grid_height: int, scale: float, top: float) -> list[dict]:
    result = []
    for row in spec.get("gates", []):
        at = row["at"]
        result.append(marker(f"gate_{row['id']}", "gate", "门",
                             figure_name(row, "城门"), (at["x"] + .5, at["z"] + .5),
                             grid_height, scale, top))
    return result


def derive(stem: str) -> tuple[bytes, bytes]:
    key = layout_key(stem)
    layout = load_yaml(BASELINE / f"{stem}.layout.yaml")
    spec = load_yaml(ROOT / layout["source_spec"]["path"] )
    report = json.loads((BASELINE / f"{stem}.preview.render.json").read_text())
    webp, width, height = image_bytes(BASELINE / f"{stem}.preview.png")
    if [width, height] != report["size_px"]:
        raise ValueError(f"preview size mismatch: {stem}")
    grid_width, grid_height = layout["grid"]["width"], layout["grid"]["height"]
    scale, top_master = float(report["scale"]), float(report["top_padding_master_px"] )
    buildings = {row["id"]: row for row in layout["buildings"]}
    locale = load_yaml(LOCALE)
    markers = facility_markers(key, buildings, locale, grid_height, scale, top_master)
    markers += landmark_markers(spec, buildings, grid_height, scale, top_master)
    markers += gate_markers(spec, grid_height, scale, top_master)
    payload = {
        "schemaVersion": SCHEMA,
        "image": {"file": f"{key}.webp", "width": width, "height": height},
        "transform": {"scale": scale, "topPaddingPx": top_master * scale,
                      "gridWidth": grid_width, "gridHeight": grid_height,
                      "tileWidthPx": 64, "tileHeightPx": 32},
        "south": [round(SOUTH[0], 8), round(SOUTH[1], 8)],
        "markers": markers,
    }
    return webp, (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode()


def manifest(blobs: dict[str, bytes]) -> bytes:
    rows = []
    for stem in TOWNS:
        key = layout_key(stem)
        metadata = json.loads(blobs[key + ".json"] )
        rows.append({
            "id": f"minimap_{key}", "file": f"{key}.webp",
            "files": {
                f"{key}.webp": {"sha256": hashlib.sha256(blobs[key + '.webp']).hexdigest()},
                f"{key}.json": {"sha256": hashlib.sha256(blobs[key + '.json']).hexdigest()},
            },
            "category": "town-minimap", "style": "default",
            "subject": f"{key} 微缩城镇小地图",
            "prompt": "python3 tools/town/make_minimap.py", "negative": "无抽象色块；不改作者基线",
            "references": [f"baseline/town/{stem}.preview.png"],
            "tool": "tools/town/make_minimap.py", "model": "none",
            "effort": "deterministic Pillow WebP derivation", "created": "2026-10-11",
            "source_path": f"assets/default/baseline/town/{stem}.preview.png",
            "size": f"{metadata['image']['width']}x{metadata['image']['height']}",
            "sha256": hashlib.sha256(blobs[key + ".webp"]).hexdigest(),
            "status": "candidate",
            "notes": f"派生自 baseline/town/{stem}.preview.png（基线，状态 candidate；AR-117）；生成命令：python3 tools/town/make_minimap.py",
        })
    return yaml.safe_dump(rows, allow_unicode=True, sort_keys=False, width=1000).encode()


def build() -> dict[str, bytes]:
    blobs: dict[str, bytes] = {}
    for stem in TOWNS:
        key = layout_key(stem)
        blobs[f"{key}.webp"], blobs[f"{key}.json"] = derive(stem)
    blobs["manifest.yaml"] = manifest(blobs)
    return blobs


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="verify committed outputs")
    args = parser.parse_args(argv)
    blobs = build()
    if args.check:
        mismatches = [name for name, value in blobs.items()
                      if not (OUTPUT / name).exists() or (OUTPUT / name).read_bytes() != value]
        if mismatches:
            print("town minimap outputs differ: " + ", ".join(mismatches), file=sys.stderr)
            return 1
        print(f"town minimap check passed: {len(TOWNS)} towns")
        return 0
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for name, value in blobs.items():
        (OUTPUT / name).write_bytes(value)
    print(f"wrote {len(blobs)} town minimap files to {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
