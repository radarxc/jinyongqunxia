#!/usr/bin/env python3
"""Deterministic AR-83 GIS/DEM ink-map compositor.

The checked-in sample is deliberately a region crop; the same scene graph
uses design/19's full-canvas Albers coordinates so a later task can render the
whole map without changing placement code.  Pillow and numpy are the only
non-stdlib dependencies already used by the repository.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import math
import re
import sys
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping, Sequence

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CONFIG_PATH = HERE / "config.json"
TERRAIN = ROOT / "tools/map/terrain/layers"
MAP_DATA = ROOT / "docs/design/map"
TILES = ROOT / "assets/default/map/tiles"
KIT = ROOT / "assets/default/map/kit"
OUTPUT = ROOT / "assets/default/map/composed/sample"
APPROVED_SAMPLE = ROOT / "assets/default/map/regions/rg_dali_cangshan.png"
CHAPTERS = tuple(f"ch{i:02d}" for i in range(1, 15))
RESAMPLE = Image.Resampling.LANCZOS

_spec = importlib.util.spec_from_file_location("compose_render_map", ROOT / "tools/map/render_map.py")
render_map = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
sys.modules[_spec.name] = render_map
_spec.loader.exec_module(render_map)


def load_structured(path: Path) -> Any:
    """Read JSON-compatible YAML, falling back to the repo's PyYAML."""
    text = path.read_text(encoding="utf-8")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        try:
            import yaml  # type: ignore
        except ImportError as error:
            raise RuntimeError(f"{path} requires PyYAML") from error
        return yaml.safe_load(text)


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def seed_for(seed: int, *parts: Any) -> int:
    payload = "|".join([str(seed), *(str(part) for part in parts)]).encode("utf-8")
    return int.from_bytes(hashlib.sha256(payload).digest()[:8], "big")


def rng_for(seed: int, *parts: Any) -> np.random.Generator:
    return np.random.default_rng(seed_for(seed, *parts))


def png_bytes(image: Image.Image) -> bytes:
    stream = io.BytesIO()
    image.save(stream, format="PNG", optimize=True, compress_level=9)
    return stream.getvalue()


@lru_cache(maxsize=96)
def _load_image_cached(path: str, mode: str) -> Image.Image:
    with Image.open(path) as source:
        return source.convert(mode)


def load_image(path: Path, mode: str) -> Image.Image:
    return _load_image_cached(str(path), mode).copy()


def parse_scalar(value: str) -> Any:
    raw = value.strip()
    if raw in ("true", "false"): return raw == "true"
    if raw in ("null", "~"): return None
    if re.fullmatch(r"[-+]?\d+", raw): return int(raw)
    if re.fullmatch(r"[-+]?(?:\d+\.\d*|\d*\.\d+)", raw): return float(raw)
    return raw.strip("'\"")


def load_asset_manifest(path: Path) -> list[dict[str, Any]]:
    """Small manifest parser so normal generation does not require PyYAML."""
    rows: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    section: str | None = None
    anchors: list[float] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("- id: "):
            if current is not None: rows.append(current)
            current, section, anchors = {"id": line[6:].strip()}, None, []
        elif current is None:
            continue
        elif line.startswith("  file: "):
            current["file"] = parse_scalar(line[8:])
        elif line.startswith("  role: "):
            current["role"] = parse_scalar(line[8:])
        elif line == "  tile:":
            current["tile"], section = {}, "tile"
        elif line == "  strip:":
            current["strip"], section = {}, "strip"
        elif line == "  kit:":
            current["kit"], section = {}, "kit"
        elif section and line.startswith("    anchor:"):
            current[section]["anchor"], anchors = anchors, []
        elif section and line.startswith("    - "):
            anchors.append(float(parse_scalar(line[6:])))
            current[section]["anchor"] = anchors
        elif section and line.startswith("    ") and ":" in line:
            key, value = line.strip().split(":", 1)
            current[section][key] = parse_scalar(value)
        elif line.startswith("  ") and not line.startswith("    "):
            section = None
    if current is not None: rows.append(current)
    return rows


def infer_kit(image: Image.Image, asset_id: str) -> dict[str, Any]:
    match = re.search(r"(?:^|_)kit_([^_]+)_", asset_id)
    if not match:
        raise ValueError(f"cannot infer kit kind from {asset_id}")
    alpha = image.convert("RGBA").getchannel("A").point(lambda value: 255 if value >= 32 else 0)
    box = alpha.getbbox() or (0, 0, image.width, image.height)
    width, height = box[2] - box[0], box[3] - box[1]
    span = max(width / image.width, height / image.height)
    volume = "large" if span >= 0.72 else "small" if span <= 0.48 else "medium"
    ratio = width / max(1, height)
    orient = "ew" if ratio >= 1.35 else "ns" if ratio <= 0.74 else "none"
    return {"kind": match.group(1), "volume": volume, "orient": orient,
            "anchor": [(box[0] + box[2]) / 2 / image.width, box[3] / image.height]}


@dataclass(frozen=True)
class Frame:
    region_id: str
    box: tuple[float, float, float, float]
    width: int
    height: int
    projection: Any

    def canvas_to_output(self, point: Sequence[float]) -> tuple[float, float]:
        x0, y0, x1, y1 = self.box
        return ((float(point[0]) - x0) * self.width / (x1 - x0),
                (float(point[1]) - y0) * self.height / (y1 - y0))

    def lonlat(self, lon: float, lat: float) -> tuple[float, float]:
        return self.canvas_to_output(self.projection(float(lon), float(lat)))

    def visible(self, point: Sequence[float], pad: float = 0.0) -> bool:
        x, y = self.canvas_to_output(point)
        return -pad <= x <= self.width + pad and -pad <= y <= self.height + pad


def make_frame(region_id: str, width: int, height: int, margin: float) -> Frame:
    regions = load_structured(MAP_DATA / "regions.yaml")["regions"]
    region = next(row for row in regions if row["id"] == region_id)
    west, south, east, north = region["bounds"]
    albers = render_map.Albers()
    samples = []
    for index in range(41):
        lon = west + (east - west) * index / 40
        lat = south + (north - south) * index / 40
        samples.extend((albers.raw(lon, south), albers.raw(lon, north),
                        albers.raw(west, lat), albers.raw(east, lat)))
    xs, ys = zip(*samples)
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    bw, bh = (max(xs) - min(xs)) * (1 + margin), (max(ys) - min(ys)) * (1 + margin)
    aspect = width / height
    if bw / bh < aspect: bw = bh * aspect
    else: bh = bw / aspect
    unit_box = (cx - bw / 2, cx + bw / 2, cy - bh / 2, cy + bh / 2)
    projection = render_map.CanvasProjection(4096, 3072, 150, (73, 18, 135, 54))
    box = (projection.offset_x + unit_box[0] * projection.scale,
           projection.offset_y - unit_box[3] * projection.scale,
           projection.offset_x + unit_box[1] * projection.scale,
           projection.offset_y - unit_box[2] * projection.scale)
    return Frame(region_id, box, width, height, projection)


def feature_points(feature: Mapping[str, Any], frame: Frame) -> list[list[tuple[float, float]]]:
    geometry = feature["geometry"]
    wgs84 = feature.get("properties", {}).get("coordinate_space") == "WGS84_lonlat"
    project = (lambda point: frame.lonlat(*point)) if wgs84 else frame.canvas_to_output
    if geometry["type"] == "LineString":
        return [[project(point) for point in geometry["coordinates"]]]
    return [[project(point) for point in ring] for ring in geometry["coordinates"]]


def feature_hits_frame(feature: Mapping[str, Any], frame: Frame, pad: float = 0.0) -> bool:
    geometry = feature["geometry"]
    raw = geometry["coordinates"] if geometry["type"] == "LineString" else [p for ring in geometry["coordinates"] for p in ring]
    if not raw: return False
    wgs84 = feature.get("properties", {}).get("coordinate_space") == "WGS84_lonlat"
    points = [frame.lonlat(*point) if wgs84 else frame.canvas_to_output(point) for point in raw]
    return not (max(p[0] for p in points) < -pad or min(p[0] for p in points) > frame.width + pad
                or max(p[1] for p in points) < -pad or min(p[1] for p in points) > frame.height + pad)


def polygon_mask(size: tuple[int, int], rings: Sequence[Sequence[Sequence[float]]],
                 blur: float = 0.0) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for index, ring in enumerate(rings):
        if len(ring) >= 3:
            draw.polygon([tuple(point) for point in ring], fill=255 if index == 0 else 0)
    return mask.filter(ImageFilter.GaussianBlur(blur)) if blur else mask


def masks_from_water(water: Mapping[str, Any], frame: Frame) -> tuple[Image.Image, Image.Image, list, list]:
    land = Image.new("L", (frame.width, frame.height), 0)
    land_draw = ImageDraw.Draw(land)
    lakes = Image.new("L", land.size, 0)
    lake_draw = ImageDraw.Draw(lakes)
    coast_rings, lake_rings = [], []
    for feature in water["features"]:
        props = feature["properties"]
        if props.get("water_type") == "sea_exterior":
            for ring in feature_points(feature, frame):
                if len(ring) >= 3:
                    land_draw.polygon(ring, fill=0 if props.get("topology") == "land_hole" else 255)
                    coast_rings.append((ring, props.get("topology")))
        elif props.get("water_type") == "lake":
            rings = feature_points(feature, frame)
            for ring in rings:
                if len(ring) >= 3: lake_draw.polygon(ring, fill=255)
            lake_rings.extend(rings)
    return land, lakes, coast_rings, lake_rings


def low_frequency_noise(size: tuple[int, int], scale: int, seed: int) -> np.ndarray:
    width, height = size
    small = (max(2, math.ceil(width / scale) + 2), max(2, math.ceil(height / scale) + 2))
    values = rng_for(seed, "noise").normal(0.0, 1.0, (small[1], small[0])).astype(np.float32)
    lo, hi = float(values.min()), float(values.max())
    raw = ((values - lo) * 255 / max(1e-6, hi - lo)).astype(np.uint8)
    smooth = Image.fromarray(raw, "L").resize(size, Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(scale / 3))
    return np.asarray(smooth, dtype=np.float32) / 127.5 - 1.0


def prepared_tile(path: Path, size: int, seed: int, jitter: bool, key: str) -> Image.Image:
    image = load_image(path, "RGB")
    if jitter:
        rng = rng_for(seed, "tile-transform", key)
        if rng.integers(0, 2): image = ImageOps.mirror(image)
        if rng.integers(0, 2): image = ImageOps.flip(image)
    return image.resize((size, size), RESAMPLE)


def tiled_texture(paths: Sequence[Path], size: tuple[int, int], tile_size: int,
                  seed: int, jitter: bool, key: str) -> Image.Image:
    rng = rng_for(seed, "tile-layout", key)
    index = int(rng.integers(0, len(paths))) if jitter else 0
    tile = prepared_tile(paths[index], tile_size, seed, jitter, f"{key}:{paths[index].name}")
    side = int(math.ceil(math.hypot(*size))) + tile_size * 3
    plane = Image.new("RGB", (side, side))
    for y in range(0, side, tile_size):
        for x in range(0, side, tile_size): plane.paste(tile, (x, y))
    angle = float(rng.uniform(0, 360)) if jitter else 0.0
    if angle: plane = plane.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)
    ox = int(rng.integers(-tile_size // 3, tile_size // 3 + 1)) if jitter else 0
    oy = int(rng.integers(-tile_size // 3, tile_size // 3 + 1)) if jitter else 0
    left, top = (side - size[0]) // 2 + ox, (side - size[1]) // 2 + oy
    return plane.crop((left, top, left + size[0], top + size[1]))


def modulate_texture(texture: Image.Image, strength: float, scale: int, seed: int) -> Image.Image:
    array = np.asarray(texture, dtype=np.float32)
    noise = low_frequency_noise(texture.size, scale, seed)[..., None]
    factor = 1.0 + noise * strength
    return Image.fromarray(np.clip(array * factor, 0, 255).astype(np.uint8), "RGB")


def masked_multiply(base: Image.Image, layer: Image.Image, mask: Image.Image, opacity: float = 1.0) -> Image.Image:
    multiplied = ImageChops.multiply(base.convert("RGB"), layer.convert("RGB"))
    if opacity < 1:
        multiplied = Image.blend(base.convert("RGB"), multiplied, opacity)
    return Image.composite(multiplied, base.convert("RGB"), mask)


def fill_regions(base: Image.Image, layers: Mapping[str, Any], water: Mapping[str, Any],
                 frame: Frame, tile_assets: Mapping[str, list[Path]], config: Mapping[str, Any],
                 seed: int, jitter: bool) -> tuple[Image.Image, Image.Image, Image.Image, list, list]:
    land, lakes, coasts, shores = masks_from_water(water, frame)
    radius = config["fill"]["transition_radius_px"]
    soft_land = land.filter(ImageFilter.GaussianBlur(radius))
    sea = ImageOps.invert(soft_land)
    output = base.copy()
    masks: dict[str, Image.Image] = {"water": sea, "lake": lakes.filter(ImageFilter.GaussianBlur(radius / 2))}
    terrain_map = {"basins_plains": "plain", "hills": "grassland", "plateaus": "plateau",
                   "deserts": "desert"}
    for layer_name, kind in terrain_map.items():
        if layer_name not in layers:
            continue
        mask = Image.new("L", output.size, 0)
        for feature in layers[layer_name]["features"]:
            if not feature_hits_frame(feature, frame): continue
            feature_mask = polygon_mask(output.size, feature_points(feature, frame))
            mask = ImageChops.lighter(mask, feature_mask)
        masks[kind] = ImageChops.multiply(mask.filter(ImageFilter.GaussianBlur(radius)), land)
    # Plain land stays mostly bare rice paper.  Classified polygons only add a
    # faint, heavily feathered edge wash; mountain mass is drawn with kit art.
    masks["plain"] = ImageChops.lighter(masks.get("plain", Image.new("L", output.size)), land)
    for kind in ("plain", "grassland", "desert", "plateau", "water", "lake"):
        if kind not in masks:
            continue
        if config["fill"]["layer_opacity"][kind] <= 0:
            continue
        paths = tile_assets.get(kind) or tile_assets["plain"]
        texture = tiled_texture(paths, output.size, config["fill"]["tile_size_px"], seed, jitter, kind)
        texture = modulate_texture(texture, config["fill"]["noise_strength"],
                                   config["fill"]["noise_scale_px"], seed_for(seed, kind))
        output = masked_multiply(output, texture, masks[kind], config["fill"]["layer_opacity"][kind])
    plain_edge = ImageChops.subtract(
        masks["plain"].filter(ImageFilter.MaxFilter(9)),
        masks["plain"].filter(ImageFilter.MinFilter(9)))
    plain_edge = plain_edge.filter(ImageFilter.GaussianBlur(config["fill"]["plain_edge_wash_px"]))
    edge_ink = Image.new("RGB", output.size, (128, 119, 100))
    output = masked_multiply(output, edge_ink, plain_edge, config["fill"]["plain_edge_wash_opacity"])
    water_color = tuple(config["rivers"]["water_color"])
    water_wash = Image.new("RGB", output.size, water_color)
    output = Image.composite(Image.blend(output, water_wash, 0.72), output, masks["water"] )
    output = Image.composite(Image.blend(output, water_wash, 0.86), output, masks["lake"] )
    return output, land, lakes, coasts, shores


def chaikin_path(points: Sequence[Sequence[float]], iterations: int = 3,
                 closed: bool = False) -> list[tuple[float, float]]:
    """Round GIS polylines without changing their endpoints."""
    output = [tuple(map(float, point)) for point in points]
    if len(output) < 3:
        return output
    for _ in range(max(0, iterations)):
        source = output + ([output[0]] if closed else [])
        refined: list[tuple[float, float]] = [] if closed else [output[0]]
        for a, b in zip(source, source[1:]):
            refined.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            refined.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        if not closed:
            refined.append(output[-1])
        output = refined
    return output


def path_length(points: Sequence[Sequence[float]]) -> float:
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(points, points[1:]))


def signed_screen_area(points: Sequence[Sequence[float]]) -> float:
    """Shoelace area in y-down canvas coordinates; positive is clockwise."""
    if len(points) < 3:
        return 0.0
    return 0.5 * sum(a[0] * b[1] - b[0] * a[1]
                     for a, b in zip(points, [*points[1:], points[0]]))


def water_side_requires_flip(points: Sequence[Sequence[float]], water_is_interior: bool) -> bool:
    """Manifest ``water_side=top`` is the directed path's left side."""
    interior_is_right = signed_screen_area(points) > 0
    return interior_is_right if water_is_interior else not interior_is_right


def resample_path(points: Sequence[Sequence[float]], step: float, closed: bool = False) -> list[tuple[float, float, float]]:
    raw = [tuple(map(float, point)) for point in points]
    if closed and raw and raw[0] != raw[-1]: raw.append(raw[0])
    if len(raw) < 2: return []
    segments = []
    total = 0.0
    for a, b in zip(raw, raw[1:]):
        length = math.hypot(b[0] - a[0], b[1] - a[1])
        if length > 1e-6:
            segments.append((total, total + length, a, b)); total += length
    if not segments: return []
    count = max(1, math.ceil(total / max(1.0, step)))
    distances = [index * total / count for index in range(count + (0 if closed else 1))]
    output, segment_index = [], 0
    for distance in distances:
        while segment_index + 1 < len(segments) and distance > segments[segment_index][1]: segment_index += 1
        start_d, end_d, a, b = segments[segment_index]
        fraction = (distance - start_d) / max(1e-9, end_d - start_d)
        x, y = a[0] + (b[0] - a[0]) * fraction, a[1] + (b[1] - a[1]) * fraction
        output.append((x, y, math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))))
    return output


@lru_cache(maxsize=512)
def _strip_stamp_cached(path: str, length: int, width: int, source_width: int, angle_bucket: int, water_side: str,
                        reverse_normal: bool, feather_px: int) -> Image.Image:
    image = load_image(Path(path), "RGBA")
    if water_side == "top" and reverse_normal: image = ImageOps.flip(image)
    canvas_height = max(2, round(width * image.height / max(1, source_width)))
    image = image.resize((max(2, length), canvas_height), RESAMPLE)
    # Feather each segment's longitudinal ends; the configured overlap makes
    # adjacent premultiplied strokes sum smoothly without a black join.
    alpha = np.asarray(image.getchannel("A"), dtype=np.float32)
    feather = max(2, min(length // 3, feather_px))
    ramp = np.ones(length, dtype=np.float32)
    ramp[:feather] = np.linspace(0, 1, feather, endpoint=False)
    ramp[-feather:] = np.linspace(1, 0, feather, endpoint=False)
    image.putalpha(Image.fromarray(np.clip(alpha * ramp[None, :], 0, 255).astype(np.uint8), "L"))
    # atan2 uses clockwise-positive angles on a y-down canvas, while Pillow's
    # rotate is counter-clockwise-positive.  Negate so the strip follows the
    # path instead of crossing it.
    return image.rotate(-angle_bucket, expand=True, resample=Image.Resampling.BICUBIC)


def strip_stamp(path: Path, length: int, width: int, angle: float, water_side: str = "none",
                reverse_normal: bool = False, feather_px: int = 5, source_width: int | None = None) -> Image.Image:
    angle_bucket = int(round(angle / 2.0) * 2)
    return _strip_stamp_cached(str(path), length, width, source_width or width, angle_bucket,
                               water_side, reverse_normal, feather_px).copy()


def multiply_rgba(base: Image.Image, overlay: Image.Image) -> Image.Image:
    """Alpha-aware darkening; result cannot be lighter than either ink layer."""
    rgb = ImageChops.multiply(base.convert("RGB"), overlay.convert("RGB"))
    return Image.composite(rgb, base.convert("RGB"), overlay.getchannel("A"))


def dem_relief_ink(size: tuple[int, int], config: Mapping[str, Any]) -> Image.Image:
    """Convert checked-in DEM hillshade, slope classes and ruggedness to ink."""
    terrain = config["terrain"]
    path, meta_path = HERE / terrain["relief_file"], HERE / terrain["relief_meta"]
    meta = load_structured(meta_path)
    if sha256_bytes(path.read_bytes()) != meta["png_sha256"]:
        raise ValueError("DEM relief PNG does not match its provenance metadata")
    source = load_image(path, "RGB")
    if source.size != tuple(terrain["relief_size"]):
        raise ValueError(f"unexpected DEM relief size: {source.size}")
    hill, slope, rugged = source.split()
    hill = hill.resize(size, Image.Resampling.BICUBIC)
    shade = Image.merge("RGBA", (hill, hill, hill,
                        Image.new("L", size, round(255 * terrain["hillshade_opacity"]))))
    slope_edge = ImageChops.subtract(slope.filter(ImageFilter.MaxFilter(3)),
                                     slope.filter(ImageFilter.MinFilter(3)))
    slope_edge = slope_edge.point(lambda value: 255 if value else 0).resize(size, RESAMPLE)
    slope_edge = slope_edge.filter(ImageFilter.GaussianBlur(0.7))
    slope_edge = slope_edge.point(lambda value: round(value * terrain["slope_edge_opacity"]))
    edge = Image.new("RGBA", size, (62, 58, 50, 0)); edge.putalpha(slope_edge)
    rugged = rugged.resize(size, Image.Resampling.BICUBIC)
    rugged = rugged.point(lambda value: round(value * terrain["rugged_opacity"]))
    texture = Image.new("RGBA", size, (78, 73, 63, 0)); texture.putalpha(rugged)
    return Image.alpha_composite(Image.alpha_composite(shade, edge), texture)


def dem_fields(size: tuple[int, int], config: Mapping[str, Any]) -> tuple[np.ndarray, np.ndarray]:
    """Return DEM elevation and ruggedness aligned to the output canvas."""
    terrain = config["terrain"]
    meta = load_structured(HERE / terrain["relief_meta"])
    elevation_path = HERE / terrain["elevation_file"]
    elevation_meta = meta.get("elevation", {})
    if sha256_bytes(elevation_path.read_bytes()) != elevation_meta.get("png_sha256"):
        raise ValueError("DEM elevation PNG does not match its provenance metadata")
    elevation_image = load_image(elevation_path, "I").resize(size, Image.Resampling.BICUBIC)
    elevation = np.asarray(elevation_image, dtype=np.float32)
    relief = load_image(HERE / terrain["relief_file"], "RGB")
    rugged = np.asarray(relief.getchannel("B").resize(size, Image.Resampling.BICUBIC), dtype=np.float32)
    lo, hi = map(float, terrain["rugged_range_m"])
    return elevation, lo + rugged * (hi - lo) / 255.0


def stroke_path(base: Image.Image, points: Sequence[Sequence[float]], strip: Mapping[str, Any],
                target_width: int, config: Mapping[str, Any], closed: bool = False,
                water_side: str = "none", reverse_normal: bool = False) -> tuple[Image.Image, list[float]]:
    segment = config["boundary"]["segment_px"]
    overlap = config["boundary"]["overlap_px"]
    samples = resample_path(points, segment - overlap, closed)
    layer = Image.new("RGBA", base.size, (255, 255, 255, 0))
    seam_alpha = []
    for x, y, angle in samples:
        pad = segment + overlap + target_width * 2
        if not (-pad <= x <= base.width + pad and -pad <= y <= base.height + pad):
            continue
        stamp = strip_stamp(Path(strip["path"]), segment + overlap, target_width, angle, water_side, reverse_normal,
                            config["boundary"]["join_feather_px"],
                            int(strip["strip"]["width_px"]))
        position = (round(x - stamp.width / 2), round(y - stamp.height / 2))
        layer.alpha_composite(stamp, position)
        if 0 <= round(x) < base.width and 0 <= round(y) < base.height:
            seam_alpha.append(float(layer.getchannel("A").getpixel((round(x), round(y))) / 255))
    return multiply_rgba(base, layer), seam_alpha


def draw_boundaries(base: Image.Image, coasts: Sequence, shores: Sequence, frame: Frame,
                    strips: Mapping[tuple[str, str], Mapping[str, Any]], config: Mapping[str, Any]) -> tuple[Image.Image, list[float]]:
    output, seams = base, []
    for ring, topology in coasts:
        if path_length(ring) < 4: continue
        band = "thick" if path_length(ring) > frame.width * 0.45 else "thin"
        width = config["boundary"]["width_classes"]["coast"][band]
        strip = strips[("coast", band)]
        output, values = stroke_path(output, ring, strip, width, config, True,
                                     strip["strip"].get("water_side", "none"),
                                     water_side_requires_flip(ring, topology == "land_hole"))
        seams.extend(values)
    for ring in shores:
        if path_length(ring) < 4: continue
        width = config["boundary"]["width_classes"]["lakeshore"]["thin"]
        strip = strips[("lakeshore", "thin")]
        output, values = stroke_path(output, ring, strip, width, config, True,
                                     strip["strip"].get("water_side", "none"),
                                     water_side_requires_flip(ring, True))
        seams.extend(values)
    return output, seams


def river_width(rank: int, config: Mapping[str, Any]) -> tuple[int, str]:
    widths = config["rivers"]["width_by_scalerank"]
    if rank <= 3: return int(widths["3"]), "thick"
    if rank <= 6: return int(widths["6"]), "thick"
    return int(widths["9"]), "thin"


def draw_rivers(base: Image.Image, water: Mapping[str, Any], frame: Frame,
                strips: Mapping[tuple[str, str], Mapping[str, Any]], config: Mapping[str, Any],
                max_scalerank: int) -> tuple[Image.Image, list[str]]:
    output, selected = base, []
    for feature in water["features"]:
        props = feature["properties"]
        if props.get("water_type") != "river" or int(props["scalerank"]) > max_scalerank:
            continue
        if not feature_hits_frame(feature, frame, 20): continue
        points = chaikin_path(feature_points(feature, frame)[0],
                              config["rivers"]["smooth_iterations"])
        width, band = river_width(int(props["scalerank"]), config)
        # Supersampling keeps GIS geometry but removes one-pixel staircase
        # edges at the sample scale. It also produces genuinely round caps.
        aa = 3
        water_layer = Image.new("RGBA", (output.width * aa, output.height * aa), (255, 255, 255, 0))
        draw = ImageDraw.Draw(water_layer)
        aa_points = [(x * aa, y * aa) for x, y in points]
        water_color = tuple(config["rivers"]["water_color"])
        ink_color = tuple(config["rivers"]["ink_color"])
        edge = int(config["rivers"]["edge_width_px"])
        # A pale cyan-white channel with two fine ink banks matches the
        # approved Dali map.  Curves and round endpoint discs avoid spikes.
        draw.line(aa_points, fill=ink_color + (178,), width=(width + edge * 2) * aa, joint="curve")
        draw.line(aa_points, fill=water_color + (255,), width=width * aa, joint="curve")
        radius = width * aa / 2
        for x, y in (aa_points[0], aa_points[-1]):
            draw.ellipse((x - radius, y - radius, x + radius, y + radius),
                         fill=water_color + (255,))
        water_layer = water_layer.resize(output.size, RESAMPLE)
        output = Image.alpha_composite(output.convert("RGBA"), water_layer).convert("RGB")
        selected.append(feature["id"])
    return output, selected


def river_exclusion_mask(size: tuple[int, int], water: Mapping[str, Any], frame: Frame,
                         config: Mapping[str, Any], max_scalerank: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    for feature in water["features"]:
        props = feature["properties"]
        if props.get("water_type") != "river" or int(props["scalerank"]) > max_scalerank:
            continue
        points = chaikin_path(feature_points(feature, frame)[0], config["rivers"]["smooth_iterations"])
        if len(points) > 1:
            draw.line(points, fill=255, width=config["terrain"]["river_clearance_px"], joint="curve")
    return mask.filter(ImageFilter.GaussianBlur(5))


def draw_routes(base: Image.Image, routes: Mapping[str, Any], frame: Frame, chapter: str,
                strips: Mapping[tuple[str, str], Mapping[str, Any]], config: Mapping[str, Any]) -> tuple[Image.Image, list[str]]:
    output, selected = base, []
    for route in routes.get("routes", []):
        if chapter not in route.get("open_chapters", []) or len(route.get("geometry", [])) < 2:
            continue
        points = [frame.lonlat(lon, lat) for lon, lat in route["geometry"]]
        if max(p[0] for p in points) < -20 or min(p[0] for p in points) > frame.width + 20 or max(p[1] for p in points) < -20 or min(p[1] for p in points) > frame.height + 20:
            continue
        points = chaikin_path(points, 2)
        layer = Image.new("RGBA", output.size, (255, 255, 255, 0))
        ImageDraw.Draw(layer).line(points, fill=(82, 73, 59, 150), width=2, joint="curve")
        # Dry-brush gaps read as the approved map's quiet dotted paths.
        gap_mask = Image.new("L", output.size, 0); gap_draw = ImageDraw.Draw(gap_mask)
        for index, (x, y, _) in enumerate(resample_path(points, 14)):
            if index % 3 != 2: gap_draw.ellipse((x - 1.5, y - 1.5, x + 1.5, y + 1.5), fill=255)
        layer.putalpha(ImageChops.multiply(layer.getchannel("A"), gap_mask.filter(ImageFilter.GaussianBlur(0.45))))
        output = multiply_rgba(output, layer)
        selected.append(route["id"] )
    return output, selected


def terrain_ink(base: Image.Image, layers: Mapping[str, Any], frame: Frame,
                config: Mapping[str, Any]) -> tuple[Image.Image, list[dict[str, Any]]]:
    # The checked-in relief is a small, reproducible ETOPO derivative: its
    # channels carry NW hillshade, slope-class edges and local ruggedness.
    relief = dem_relief_ink(base.size, config)
    elevation, ruggedness = dem_fields(base.size, config)
    terrain = config["terrain"]
    mountain = ((elevation >= terrain["mountain_min_elevation_m"])
                & (ruggedness >= terrain["mountain_min_ruggedness_m"]))
    mountain_mask = Image.fromarray((mountain * 255).astype(np.uint8), "L")
    mountain_mask = mountain_mask.filter(ImageFilter.GaussianBlur(config["fill"]["transition_radius_px"]))
    relief.putalpha(ImageChops.multiply(relief.getchannel("A"), mountain_mask))
    output = multiply_rgba(base, relief)
    ridge_draw = Image.new("RGBA", base.size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(ridge_draw)
    ridge_rows = []
    for feature in layers["ridges"]["features"]:
        if not feature_hits_frame(feature, frame, 40): continue
        points = feature_points(feature, frame)[0]
        draw.line(points, fill=(39, 36, 30, round(255 * config["terrain"]["ridge_opacity"])),
                  width=config["terrain"]["ridge_width_px"], joint="curve")
        ridge_rows.append({"id": feature["id"], "points": points, **feature["properties"]})
    ridge_draw = ridge_draw.filter(ImageFilter.GaussianBlur(0.7))
    return multiply_rgba(output, ridge_draw), ridge_rows


def poisson_accept(points: Sequence[tuple[float, float]], candidate: tuple[float, float], minimum: float) -> bool:
    return all(math.hypot(candidate[0] - x, candidate[1] - y) >= minimum for x, y in points)


def poisson_along_ridges(ridges: Sequence[Mapping[str, Any]], spacing: float, seed: int,
                         minimum_elevation: float, minimum_relative: float) -> list[dict[str, Any]]:
    candidates = []
    for ridge in ridges:
        if ridge["mean_elevation_m"] < minimum_elevation or ridge["relative_height_m"] < minimum_relative:
            continue
        # Higher, sharper ridges receive more candidates before the global
        # density cap; Poisson rejection still enforces one minimum spacing.
        elevation_weight = min(1.0, max(0.0, (ridge["mean_elevation_m"] - minimum_elevation) / 1800))
        relief_weight = min(1.0, max(0.0, (ridge["relative_height_m"] - minimum_relative) / 350))
        density_weight = 0.75 + 0.45 * elevation_weight + 0.30 * relief_weight
        for x, y, angle in resample_path(ridge["points"], spacing * 0.72 / density_weight):
            if x < 0 or y < 0:
                continue
            priority = rng_for(seed, "peak-candidate", ridge["id"], round(x, 2), round(y, 2)).random() / density_weight
            candidates.append((float(priority), {"x": x, "y": y, "angle": angle, "ridge": ridge}))
    accepted: list[dict[str, Any]] = []
    for _, candidate in sorted(candidates, key=lambda row: row[0]):
        if poisson_accept([(p["x"], p["y"]) for p in accepted], (candidate["x"], candidate["y"]), spacing):
            accepted.append(candidate)
    return accepted


def mountain_candidates(elevation: np.ndarray, ruggedness: np.ndarray, config: Mapping[str, Any],
                        seed: int) -> list[dict[str, Any]]:
    """Deterministic Poisson candidates from DEM mass, not a texture fill."""
    terrain = config["terrain"]
    spacing = float(terrain["mountain_spacing_px"])
    step = max(18, round(spacing * 0.52))
    rng = rng_for(seed, "dem-mountain-grid")
    candidates: list[tuple[float, dict[str, Any]]] = []
    for y0 in range(-step, elevation.shape[0] + step, step):
        for x0 in range(-step, elevation.shape[1] + step, step):
            x = int(round(x0 + rng.uniform(-0.34, 0.34) * step))
            y = int(round(y0 + rng.uniform(-0.30, 0.30) * step))
            if not (0 <= x < elevation.shape[1] and 0 <= y < elevation.shape[0]):
                continue
            elev, rugged = float(elevation[y, x]), float(ruggedness[y, x])
            if elev < terrain["mountain_min_elevation_m"] or rugged < terrain["mountain_min_ruggedness_m"]:
                continue
            score = elev / 5000.0 + rugged / 320.0 + float(rng.uniform(0, 0.18))
            candidates.append((-score, {"x": float(x), "y": float(y),
                                        "elevation_m": elev, "ruggedness_m": rugged}))
    # A jittered sample can miss a narrow summit. Add each coarse cell's
    # strongest elevation/ruggedness point so high peaks remain represented.
    for y0 in range(0, elevation.shape[0], step):
        for x0 in range(0, elevation.shape[1], step):
            y1, x1 = min(elevation.shape[0], y0 + step), min(elevation.shape[1], x0 + step)
            elev_cell, rugged_cell = elevation[y0:y1, x0:x1], ruggedness[y0:y1, x0:x1]
            strength = elev_cell / 5000.0 + rugged_cell / 320.0
            iy, ix = np.unravel_index(int(np.argmax(strength)), strength.shape)
            elev, rugged = float(elev_cell[iy, ix]), float(rugged_cell[iy, ix])
            if elev < terrain["mountain_min_elevation_m"] or rugged < terrain["mountain_min_ruggedness_m"]:
                continue
            candidates.append((-(elev / 5000.0 + rugged / 320.0 + 0.22),
                               {"x": float(x0 + ix), "y": float(y0 + iy),
                                "elevation_m": elev, "ruggedness_m": rugged}))
    accepted: list[dict[str, Any]] = []
    for _, candidate in sorted(candidates, key=lambda row: row[0]):
        if poisson_accept([(p["x"], p["y"]) for p in accepted],
                          (candidate["x"], candidate["y"]), spacing):
            accepted.append(candidate)
    limit = max(1, round(terrain["mountain_density_per_mpx"]
                         * elevation.shape[1] * elevation.shape[0] / 1_000_000))
    return accepted[:limit]


def mountain_kind(elevation_m: float, ruggedness_m: float, config: Mapping[str, Any]) -> str:
    terrain = config["terrain"]
    if elevation_m >= terrain["snow_min_elevation_m"]:
        return "xueshan"
    if elevation_m >= terrain["peak_min_elevation_m"]:
        return "shanfeng"
    if elevation_m >= 1450:
        return "shanmai"
    return "qiuling"


def rotate_point_y_down(point: Sequence[float], old_size: Sequence[float],
                        new_size: Sequence[float], angle_deg: float) -> tuple[float, float]:
    """Map a point through Pillow's positive (visual CCW) rotation."""
    radians = math.radians(angle_deg)
    cosine, sine = math.cos(radians), math.sin(radians)
    dx, dy = point[0] - old_size[0] / 2, point[1] - old_size[1] / 2
    return (new_size[0] / 2 + cosine * dx + sine * dy,
            new_size[1] / 2 - sine * dx + cosine * dy)


def transform_asset(path: Path, target: int, anchor: Sequence[float], seed: int, key: str,
                    jitter: bool, clickable: bool, config: Mapping[str, Any]) -> tuple[Image.Image, tuple[float, float], dict[str, Any]]:
    image = load_image(path, "RGBA")
    original_size = image.size
    # Marker paintings carry generous transparent safety margins. Crop those
    # margins before sizing so target describes the visible symbol rather
    # than the source canvas, while retaining a little authored edge wash.
    if clickable:
        alpha_bbox = image.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
        if alpha_bbox:
            pad = max(2, round(max(image.size) * 0.025))
            left, top, right, bottom = alpha_bbox
            crop_box = (max(0, left - pad), max(0, top - pad),
                        min(image.width, right + pad), min(image.height, bottom + pad))
            image = image.crop(crop_box)
            anchor = ((anchor[0] * original_size[0] - crop_box[0]) / image.width,
                      (anchor[1] * original_size[1] - crop_box[1]) / image.height)
    scale_jitter = config["jitter"]["clickable_scale"] if clickable else config["jitter"]["oriented_scale"]
    rng = rng_for(seed, "asset", key)
    scale = 1.0 + (rng.uniform(-scale_jitter, scale_jitter) if jitter else 0.0)
    rotation = rng.uniform(-config["jitter"]["oriented_rotation_deg"], config["jitter"]["oriented_rotation_deg"]) if jitter else 0.0
    flip_h = bool(rng.integers(0, 2)) if jitter else False
    ink = 1.0 + (rng.uniform(-config["jitter"]["oriented_ink"], config["jitter"]["oriented_ink"]) if jitter else 0.0)
    side = max(8, round(target * scale))
    resize_scale = side / max(image.size)
    image = image.resize((max(1, round(image.width * resize_scale)),
                          max(1, round(image.height * resize_scale))), RESAMPLE)
    transformed_anchor = [anchor[0], anchor[1]]
    if flip_h:
        image = ImageOps.mirror(image); transformed_anchor[0] = 1.0 - transformed_anchor[0]
    # Only horizontal flips are permitted for upright assets.
    if rotation:
        old_anchor = (transformed_anchor[0] * image.width, transformed_anchor[1] * image.height)
        old_size = image.size
        image = image.rotate(rotation, expand=True, resample=Image.Resampling.BICUBIC)
        rotated_anchor = rotate_point_y_down(old_anchor, old_size, image.size, rotation)
        transformed_anchor = [rotated_anchor[0] / image.width, rotated_anchor[1] / image.height]
    if ink != 1.0:
        rgb = ImageEnhance.Brightness(image.convert("RGB")).enhance(ink)
        rgb.putalpha(image.getchannel("A")); image = rgb
    meta = {"scale": round(scale, 6), "rotation_deg": round(rotation, 6),
            "flip_horizontal": flip_h, "flip_vertical": False, "ink_factor": round(ink, 6),
            "source_size": list(original_size)}
    return image, (transformed_anchor[0] * image.width, transformed_anchor[1] * image.height), meta


def dissolve_asset(image: Image.Image, config: Mapping[str, Any], seed: int, key: str,
                   alpha_factor: float = 1.0) -> Image.Image:
    alpha = image.getchannel("A")
    radius = config["dissolve"]["feather_radius_px"]
    feather = alpha.filter(ImageFilter.GaussianBlur(radius))
    noise = low_frequency_noise(image.size, max(4, radius * 2), seed_for(seed, "dissolve", key))
    a = np.asarray(feather, dtype=np.float32)
    original = np.asarray(alpha, dtype=np.float32)
    a = np.minimum(original, a * (1.0 + noise * config["dissolve"]["noise_strength"])) * alpha_factor
    out = image.copy(); out.putalpha(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L"))
    bleed = out.filter(ImageFilter.GaussianBlur(config["dissolve"]["bleed_radius_px"]))
    bleed.putalpha(bleed.getchannel("A").point(lambda value: round(value * 0.22)))
    return Image.alpha_composite(bleed, out)


def place_asset(base: Image.Image, image: Image.Image, anchor_px: tuple[float, float],
                landing: tuple[float, float], exclusion_mask: Image.Image | None = None) -> Image.Image:
    layer = Image.new("RGBA", base.size, (255, 255, 255, 0))
    position = (round(landing[0] - anchor_px[0]), round(landing[1] - anchor_px[1]))
    layer.alpha_composite(image, position)
    if exclusion_mask is not None:
        allowed = ImageOps.invert(exclusion_mask.convert("L"))
        layer.putalpha(ImageChops.multiply(layer.getchannel("A"), allowed))
    return multiply_rgba(base, layer)


def marker_halo(base: Image.Image, image: Image.Image, anchor_px: tuple[float, float],
                landing: tuple[float, float], config: Mapping[str, Any]) -> Image.Image:
    """Lift clickable ink from busy mountains with a soft paper clearing."""
    layer = Image.new("L", base.size, 0)
    position = (round(landing[0] - anchor_px[0]), round(landing[1] - anchor_px[1]))
    alpha = image.getchannel("A").filter(ImageFilter.MaxFilter(9))
    layer.paste(alpha, position)
    layer = layer.filter(ImageFilter.GaussianBlur(config["markers"]["paper_halo_px"]))
    paper = Image.new("RGB", base.size, tuple(config["paper"]["color"]))
    return Image.composite(paper, base, layer.point(lambda value: round(value * 0.74)))


def choose_variant(rows: Sequence[Mapping[str, Any]], points: Sequence[Mapping[str, Any]],
                   candidate: tuple[float, float], repeat_radius: float, seed: int, key: str,
                   preferred_volume: str | None = None, preferred_orient: str | None = None
                   ) -> Mapping[str, Any]:
    blocked = {point["asset_id"] for point in points
               if math.hypot(point["x"] - candidate[0], point["y"] - candidate[1]) < repeat_radius}
    choices = list(rows)
    if preferred_volume and any(row["kit"].get("volume") == preferred_volume for row in choices):
        choices = [row for row in choices if row["kit"].get("volume") == preferred_volume]
    if preferred_orient and any(row["kit"].get("orient") == preferred_orient for row in choices):
        choices = [row for row in choices if row["kit"].get("orient") == preferred_orient]
    choices = [row for row in choices if row["id"] not in blocked] or choices
    return choices[seed_for(seed, "variant", key) % len(choices)]


def ridge_orientation(angle: float) -> str:
    normalized = angle % 180
    if normalized < 22.5 or normalized >= 157.5: return "ew"
    if normalized < 67.5: return "nwse"
    if normalized < 112.5: return "ns"
    return "nesw"


def prepare_peaks(size: tuple[int, int], ridge_rows: Sequence[Mapping[str, Any]],
                  kit: Mapping[str, list[Mapping[str, Any]]], config: Mapping[str, Any],
                  seed: int, jitter: bool, marker_rows: Sequence[Mapping[str, Any]] = (),
                  dem: tuple[np.ndarray, np.ndarray] | None = None,
                  exclusion_mask: Image.Image | None = None) -> list[dict[str, Any]]:
    if dem is None:
        points = poisson_along_ridges(ridge_rows, config["terrain"]["peak_spacing_px"], seed,
                                      config["terrain"]["peak_min_elevation_m"],
                                      config["terrain"]["peak_min_relative_height_m"])
        for point in points:
            point["elevation_m"] = point["ridge"]["mean_elevation_m"]
            point["ruggedness_m"] = point["ridge"]["relative_height_m"]
    else:
        points = mountain_candidates(*dem, config, seed)
    marker_gap = config["terrain"]["peak_size_px"] / 2 + config["terrain"]["peak_marker_gap_px"]
    points = [point for point in points if point["x"] < size[0] and point["y"] < size[1]
              if all(math.hypot(point["x"] - row["x"], point["y"] - row["y"])
                     >= marker_gap + marker_visual_radius(row) for row in marker_rows)]
    if exclusion_mask is not None:
        points = [point for point in points if exclusion_mask.getpixel((
            min(size[0] - 1, max(0, round(point["x"]))),
            min(size[1] - 1, max(0, round(point["y"])))) ) < 96]
    placed: list[dict[str, Any]] = []
    for index, point in enumerate(points):
        elevation = point["elevation_m"]
        ruggedness = point["ruggedness_m"]
        kind = mountain_kind(elevation, ruggedness, config)
        rows = kit.get(kind) or kit["shanfeng"]
        row = choose_variant(rows, placed, (point["x"], point["y"]),
                             config["jitter"]["variant_repeat_radius_px"], seed, f"peak:{index}",
                             "large" if elevation >= 3000 else "medium",
                             ridge_orientation(point["angle"]) if "angle" in point else None)
        target = config["terrain"]["mountain_sizes_px"].get(kind, config["terrain"]["peak_size_px"])
        if row["kit"].get("volume") == "small": target *= 0.82
        elif row["kit"].get("volume") == "large": target *= 1.10
        target = round(target * min(1.08, max(0.88, 0.86 + ruggedness / 650.0)))
        near_min, near_max = config["terrain"]["perspective_scale_range"]
        target = round(target * (near_min + (near_max - near_min) * point["y"] / max(1, size[1])))
        image, anchor, transform = transform_asset(Path(row["path"]), target,
                                                    row["kit"]["anchor"],
                                                    seed, f"peak:{index}:{row['id']}", jitter, False, config)
        image = dissolve_asset(image, config, seed, f"peak:{index}")
        metadata = {"id": f"peak:{index:04d}", "x": point["x"], "y": point["y"],
                    "landing_y": point["y"], "asset_id": row["id"], "kind": kind,
                    "elevation_m": round(elevation, 1),
                    "relative_height_m": round(ruggedness, 1), "transform": transform}
        placed.append({**metadata, "image": image, "anchor": anchor,
                       "landing": (point["x"], point["y"])})
    return sorted(placed, key=lambda row: (row["landing_y"], row["id"]))


def place_peaks(base: Image.Image, ridge_rows: Sequence[Mapping[str, Any]], kit: Mapping[str, list[Mapping[str, Any]]],
                config: Mapping[str, Any], seed: int, jitter: bool,
                marker_rows: Sequence[Mapping[str, Any]] = ()) -> tuple[Image.Image, list[dict[str, Any]]]:
    prepared = prepare_peaks(base.size, ridge_rows, kit, config, seed, jitter, marker_rows)
    output = base
    for row in prepared:
        output = place_asset(output, row["image"], row["anchor"], row["landing"])
    return output, [{key: value for key, value in row.items() if key not in ("image", "anchor", "landing")}
                    for row in prepared]


def city_visual_tier(city: Mapping[str, Any], era: Mapping[str, Any]) -> str:
    if era.get("status") == "都城":
        return "capital"
    if city.get("importance") in ("capital", "major"):
        return "major"
    return "secondary"


def city_kind(tier: str) -> str:
    return {"capital": "dacheng", "major": "zhoufu",
            "secondary": "xianzhen"}[tier]


def city_preferred_variant(tier: str) -> str:
    """Prefer the clearest small-scale silhouettes from the candidate kit."""
    return {"capital": "map_kit_dacheng_01", "major": "map_kit_zhoufu_01",
            "secondary": "map_kit_xianzhen_01"}[tier]


def poi_kind(poi: Mapping[str, Any]) -> str:
    return {"关隘": "guanai", "寺观": "simiao", "遗迹": "yiji",
            "城镇": "xianzhen", "村落": "cunluo", "庄园": "xianzhen"}.get(poi.get("kind"), "yiji")


def poi_visual(poi: Mapping[str, Any], chapter: str) -> tuple[str, str]:
    era = poi.get("eras", {}).get(chapter, {})
    display_kind = era.get("display_kind", poi.get("kind"))
    return era.get("name", poi["name"]), poi_kind({"kind": display_kind})


def chapter_city_position(city: Mapping[str, Any], chapter: str, chapters: Mapping[str, Any]) -> tuple[float, float]:
    longitude, latitude = float(city["longitude"]), float(city["latitude"])
    band = chapters[chapter]["band"]
    for move in city.get("seat_moves", []):
        if band in move.get("eras", []):
            longitude, latitude = float(move["longitude"]), float(move["latitude"])
    return longitude, latitude


def build_marker_rows(frame: Frame, chapter: str, map_data: Mapping[str, Any],
                      config: Mapping[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for city in map_data["cities"]["cities"]:
        era = city.get("eras", {}).get(chapter, {})
        if not era.get("open"): continue
        longitude, latitude = chapter_city_position(city, chapter, map_data["cities"]["chapters"])
        xy = frame.lonlat(longitude, latitude)
        if -20 <= xy[0] <= frame.width + 20 and -20 <= xy[1] <= frame.height + 20:
            tier = city_visual_tier(city, era)
            rows.append({"id": city["id"], "type": "city", "kind": city_kind(tier),
                         "preferred_asset_id": city_preferred_variant(tier),
                         "name": era.get("name") or city["modern_name"], "longitude": longitude,
                         "latitude": latitude, "x": xy[0], "y": xy[1],
                         "size": config["markers"]["city_sizes_px"][tier],
                         "click_radius": config["markers"]["click_radius_px"][tier],
                         "confidence": "authoritative", "clickable": True, "open_chapters": city.get("chapters", [])})
    for sect in map_data["sects"]["sects"]:
        state = sect.get("availability", {}).get(chapter)
        if state not in ("O", "H"): continue
        xy = frame.lonlat(sect["longitude"], sect["latitude"])
        if -20 <= xy[0] <= frame.width + 20 and -20 <= xy[1] <= frame.height + 20:
            rows.append({"id": sect["id"], "type": "sect", "kind": "menpai", "name": sect["name"],
                         "longitude": sect["longitude"], "latitude": sect["latitude"], "x": xy[0], "y": xy[1],
                         "size": config["markers"]["sect_size_px"], "click_radius": config["markers"]["click_radius_px"]["sect"],
                         "confidence": sect.get("coordinate_precision", "unknown"), "alpha": 0.48 if state == "H" else 1.0,
                         "clickable": True, "open_chapters": [ch for ch, value in sect.get("availability", {}).items() if value in ("O", "H")]})
        for branch in sect.get("branches", []):
            if chapter not in branch.get("open_chapters", []) or branch.get("offmap_id"):
                continue
            xy = frame.lonlat(branch["longitude"], branch["latitude"])
            if -20 <= xy[0] <= frame.width + 20 and -20 <= xy[1] <= frame.height + 20:
                rows.append({"id": branch["id"], "type": "sect", "kind": "menpai", "name": branch["name"],
                             "longitude": branch["longitude"], "latitude": branch["latitude"], "x": xy[0], "y": xy[1],
                             "size": config["markers"]["sect_size_px"], "click_radius": config["markers"]["click_radius_px"]["sect"],
                             "confidence": "branch_anchor", "alpha": 0.48 if state == "H" else 1.0,
                             "clickable": True, "open_chapters": branch["open_chapters"]})
    for poi in map_data["pois"]["pois"]:
        if chapter not in poi.get("chapters", []): continue
        xy = frame.lonlat(poi["lon"], poi["lat"])
        if -20 <= xy[0] <= frame.width + 20 and -20 <= xy[1] <= frame.height + 20:
            low = poi.get("confidence") == "低"
            name, kind = poi_visual(poi, chapter)
            rows.append({"id": poi["id"], "type": "poi", "kind": kind, "name": name,
                         "longitude": poi["lon"], "latitude": poi["lat"], "x": xy[0], "y": xy[1],
                         "size": config["markers"]["poi_size_px"], "click_radius": None if low else config["markers"]["click_radius_px"]["poi"],
                         "confidence": poi["confidence"], "alpha": config["markers"]["low_confidence_alpha"] if low else 1.0,
                         "clickable": not low, "regional_only": low, "open_chapters": poi["chapters"]})
    for key, kind in (("posts", "yizhan"), ("ports", "matou")):
        for travel in map_data["routes"].get(key, []):
            if chapter not in travel.get("open_chapters", []): continue
            xy = frame.lonlat(travel["longitude"], travel["latitude"])
            if -20 <= xy[0] <= frame.width + 20 and -20 <= xy[1] <= frame.height + 20:
                rows.append({"id": travel["id"], "type": key[:-1], "kind": kind, "name": travel["name"],
                             "longitude": travel["longitude"], "latitude": travel["latitude"], "x": xy[0], "y": xy[1],
                             "size": config["markers"]["travel_size_px"], "click_radius": config["markers"]["click_radius_px"]["travel"],
                             "confidence": "authoritative", "alpha": 1.0, "clickable": True,
                             "open_chapters": travel["open_chapters"]})
    return rows


def marker_visual_radius(row: Mapping[str, Any]) -> float:
    return float(row.get("size", 0)) / 2


def resolve_marker_collisions(rows: Sequence[dict[str, Any]], peak_points: Sequence[Mapping[str, Any]],
                              minimum: float) -> list[dict[str, Any]]:
    """Keep exact coordinates; merge collocated symbols and suppress overlaps."""
    output: list[dict[str, Any]] = []
    priority = {"city": 0, "sect": 1, "post": 2, "port": 2, "poi": 3}
    for row in sorted(rows, key=lambda item: (priority[item["type"]], item["id"])):
        same = next((other for other in output if math.hypot(row["x"] - other["x"], row["y"] - other["y"]) < 1.0), None)
        if same:
            same.setdefault("coincident_ids", []).append(row["id"]); row["rendered"] = False
            output.append(row); continue
        too_close = next((other for other in output if other.get("rendered", True) and
                          math.hypot(row["x"] - other["x"], row["y"] - other["y"]) < minimum), None)
        row["rendered"] = too_close is None
        if too_close: too_close.setdefault("coincident_ids", []).append(row["id"])
        output.append(row)
    return output


def place_markers(base: Image.Image, rows: Sequence[dict[str, Any]], kit: Mapping[str, list[Mapping[str, Any]]],
                  config: Mapping[str, Any], seed: int, jitter: bool,
                  exclusion_mask: Image.Image | None = None
                  ) -> tuple[Image.Image, list[dict[str, Any]], list[dict[str, Any]]]:
    renderable = [row for row in rows if row.get("rendered", True)]
    selections: list[dict[str, Any]] = []
    prepared = []
    for row in sorted(renderable, key=lambda item: (item["y"], item["id"])):
        variants = kit.get(row["kind"]) or kit["yiji"]
        preferred = next((asset for asset in variants
                          if asset["id"] == row.get("preferred_asset_id")), None)
        variant = preferred or choose_variant(variants, selections, (row["x"], row["y"]),
                                              config["jitter"]["variant_repeat_radius_px"], seed, row["id"])
        image, anchor, transform = transform_asset(Path(variant["path"]), row["size"], variant["kit"]["anchor"],
                                                    seed, row["id"], jitter, row["clickable"], config)
        image = dissolve_asset(image, config, seed, row["id"], row.get("alpha", 1.0))
        prepared.append((row["y"], row, variant, image, anchor, transform))
        selections.append({"asset_id": variant["id"], "x": row["x"], "y": row["y"]})
    output, placements = base, []
    for _, row, variant, image, anchor, transform in sorted(prepared, key=lambda item: (item[0], item[1]["id"])):
        output = marker_halo(output, image, anchor, (row["x"], row["y"]), config)
        output = place_asset(output, image, anchor, (row["x"], row["y"]), exclusion_mask)
        placements.append({"id": row["id"], "asset_id": variant["id"], "x": row["x"], "y": row["y"],
                           "landing_y": row["y"], "clickable": row["clickable"],
                           "transform": transform})
    return output, list(rows), placements


def place_ordered_decor(base: Image.Image, peaks: Sequence[Mapping[str, Any]],
                        rows: Sequence[dict[str, Any]], kit: Mapping[str, list[Mapping[str, Any]]],
                        config: Mapping[str, Any], seed: int, jitter: bool,
                        exclusion_mask: Image.Image | None = None
                        ) -> tuple[Image.Image, list[dict[str, Any]], list[dict[str, Any]]]:
    """Composite all point art by manifest landing y, with markers as ties."""
    marker_rows = [row for row in rows if row.get("rendered", True)]
    selections: list[dict[str, Any]] = []
    prepared = []
    for row in sorted(marker_rows, key=lambda item: (item["y"], item["id"])):
        variants = kit.get(row["kind"]) or kit["yiji"]
        preferred = next((asset for asset in variants
                          if asset["id"] == row.get("preferred_asset_id")), None)
        variant = preferred or choose_variant(variants, selections, (row["x"], row["y"]),
                                              config["jitter"]["variant_repeat_radius_px"], seed, row["id"])
        image, anchor, transform = transform_asset(Path(variant["path"]), row["size"], variant["kit"]["anchor"],
                                                    seed, row["id"], jitter, row["clickable"], config)
        image = dissolve_asset(image, config, seed, row["id"], row.get("alpha", 1.0))
        metadata = {"id": row["id"], "asset_id": variant["id"], "x": row["x"], "y": row["y"],
                    "landing_y": row["y"], "clickable": row["clickable"], "transform": transform}
        prepared.append({**metadata, "image": image, "anchor": anchor, "landing": (row["x"], row["y"])})
        selections.append(metadata)
    draw_queue = [*({**row, "layer_order": 0} for row in peaks),
                  *({**row, "layer_order": 1} for row in prepared)]
    draw_queue.sort(key=lambda item: (item["landing_y"], item["layer_order"], item["id"]))
    output = base
    for row in draw_queue:
        if row["layer_order"] == 1:
            output = marker_halo(output, row["image"], row["anchor"], row["landing"], config)
        output = place_asset(output, row["image"], row["anchor"], row["landing"], exclusion_mask)
    peak_metrics = [{key: value for key, value in row.items() if key not in ("image", "anchor", "landing")}
                    for row in peaks]
    placements = [{key: value for key, value in row.items() if key not in ("image", "anchor", "landing")}
                  for row in prepared]
    draw_order = [{"id": row["id"], "landing_y": row["landing_y"]} for row in draw_queue]
    return output, peak_metrics, placements, draw_order


def place_prepared_peaks(base: Image.Image, peaks: Sequence[Mapping[str, Any]],
                         exclusion_mask: Image.Image | None = None
                         ) -> tuple[Image.Image, list[dict[str, Any]]]:
    output = base
    ordered = sorted(peaks, key=lambda row: (row["landing_y"], row["id"]))
    for row in ordered:
        output = place_asset(output, row["image"], row["anchor"], row["landing"], exclusion_mask)
    metrics = [{key: value for key, value in row.items() if key not in ("image", "anchor", "landing")}
               for row in ordered]
    return output, metrics


def valley_mist(base: Image.Image, peaks: Sequence[Mapping[str, Any]],
                config: Mapping[str, Any], seed: int) -> Image.Image:
    """Fixed-seed cloud-white bands soften mountain feet and valleys."""
    if not peaks:
        return base
    terrain = config["terrain"]
    mask = Image.new("L", base.size, 0)
    draw = ImageDraw.Draw(mask)
    rng = rng_for(seed, "valley-mist")
    band_h = float(terrain["mist_band_height_px"])
    for index, row in enumerate(sorted(peaks, key=lambda item: item["landing_y"])):
        if index % 2:
            continue
        width = float(rng.uniform(130, 250))
        x, y = row["x"] + float(rng.uniform(-32, 32)), row["landing_y"] - band_h * 0.35
        draw.ellipse((x - width / 2, y - band_h / 2, x + width / 2, y + band_h / 2), fill=210)
    mask = mask.filter(ImageFilter.GaussianBlur(terrain["mist_blur_px"]))
    mask = mask.point(lambda value: round(value * terrain["mist_opacity"]))
    paper = Image.new("RGB", base.size, tuple(config["paper"]["color"]))
    return Image.composite(paper, base, mask)


def paper_background(size: tuple[int, int], config: Mapping[str, Any], seed: int) -> Image.Image:
    color = np.array(config["paper"]["color"], dtype=np.float32)
    grain = low_frequency_noise(size, config["paper"]["grain_scale_px"], seed_for(seed, "paper-grain"))
    wash = low_frequency_noise(size, config["paper"]["wash_scale_px"], seed_for(seed, "paper-wash"))
    factor = 1 + grain[..., None] * config["paper"]["grain_strength"] + wash[..., None] * config["paper"]["wash_strength"]
    return Image.fromarray(np.clip(color[None, None, :] * factor, 0, 255).astype(np.uint8), "RGB")


def final_paper_wash(image: Image.Image, config: Mapping[str, Any], seed: int) -> Image.Image:
    noise = low_frequency_noise(image.size, config["paper"]["wash_scale_px"] * 2, seed_for(seed, "final-wash"))
    wash = np.empty((image.height, image.width, 4), dtype=np.uint8)
    # Equal RGB channels darken as neutral ink without shifting the audited
    # grey-cyan water hue; warmth already comes from the paper ground.
    wash[..., :3] = np.array((96, 96, 96), dtype=np.uint8)
    wash[..., 3] = np.clip((noise + 1) * 255 * config["paper"]["wash_strength"] * 0.5, 0, 255).astype(np.uint8)
    return multiply_rgba(image, Image.fromarray(wash, "RGBA"))


def restore_lakes(image: Image.Image, lakes: Image.Image, config: Mapping[str, Any]) -> Image.Image:
    color = Image.new("RGB", image.size, tuple(config["rivers"]["water_color"]))
    return Image.composite(color, image, lakes)


def draw_lake_outlines(image: Image.Image, shores: Sequence[Sequence[Sequence[float]]],
                       config: Mapping[str, Any]) -> Image.Image:
    """Finish narrow lakes with a fine anti-aliased bank, without dead ink."""
    scale = 3
    layer = Image.new("RGBA", (image.width * scale, image.height * scale), (255, 255, 255, 0))
    draw = ImageDraw.Draw(layer)
    ink = tuple(config["rivers"]["ink_color"]) + (190,)
    for ring in shores:
        if len(ring) < 3:
            continue
        points = [(round(x * scale), round(y * scale)) for x, y in [*ring, ring[0]]]
        draw.line(points, fill=ink, width=2 * scale, joint="curve")
    layer = layer.resize(image.size, RESAMPLE)
    return multiply_rgba(image, layer)


def asset_indexes() -> tuple[dict[str, list[Path]], dict[tuple[str, str], dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    tile_rows = load_asset_manifest(TILES / "manifest.yaml")
    tiles: dict[str, list[Path]] = {}
    strips: dict[tuple[str, str], dict[str, Any]] = {}
    for row in tile_rows:
        if "tile" in row:
            tiles.setdefault(row["tile"]["kind"], []).append(TILES / row["file"] )
        elif "strip" in row:
            band = "thick" if int(row["strip"]["width_px"]) >= {"coast": 36, "lakeshore": 30, "river": 27, "road": 12, "region": 9}[row["strip"]["kind"]] else "thin"
            strips[(row["strip"]["kind"], band)] = {**row, "path": TILES / row["file"]}
    kit: dict[str, list[dict[str, Any]]] = {}
    for row in load_asset_manifest(KIT / "manifest.yaml"):
        if row.get("role") == "contact_sheet": continue
        path = KIT / row["file"]
        if "kit" not in row: row = {**row, "kit": infer_kit(load_image(path, "RGBA"), row["id"])}
        row = {**row, "path": path}
        kit.setdefault(row["kit"]["kind"], []).append(row)
    return tiles, strips, kit


def load_inputs() -> tuple[dict[str, Any], dict[str, Any]]:
    layer_names = ("ridges", "hills", "plateaus", "basins_plains", "deserts")
    layers = {name: load_structured(TERRAIN / f"{name}.json")
              for name in layer_names if (TERRAIN / f"{name}.json").is_file()}
    sample_water = HERE / "data/rg_dali_cangshan_ne10m.json"
    layers["water"] = load_structured(sample_water if sample_water.is_file() else TERRAIN / "water.json")
    map_data = {name: load_structured(MAP_DATA / f"{name}.yaml") for name in ("cities", "sects", "routes", "regions", "pois")}
    return layers, map_data


def marker_document(rows: Sequence[Mapping[str, Any]], frame: Frame, chapter: str, seed: int) -> dict[str, Any]:
    fields = []
    for row in sorted(rows, key=lambda item: item["id"]):
        fields.append({"id": row["id"], "type": row["type"], "name": row["name"],
                       "canvas": {"x": round(row["x"], 2), "y": round(row["y"], 2)},
                       "wgs84": {"lon": row["longitude"], "lat": row["latitude"]},
                       "click_radius": row["click_radius"], "clickable": row["clickable"],
                       "confidence": row["confidence"], "regional_only": bool(row.get("regional_only", False)),
                       "rendered": bool(row.get("rendered", True)), "coincident_ids": row.get("coincident_ids", []),
                       "open_chapters": row["open_chapters"]})
    return {"schema": "tianshu.map-markers.v1", "region_id": frame.region_id, "chapter": chapter,
            "coordinate_space": {"type": "region_canvas_px", "origin": "top_left", "width": frame.width, "height": frame.height},
            "projection": "design/19 §2 spherical Albers; exact WGS84 anchors, no position jitter", "seed": seed, "markers": fields}


def render_scene(config: Mapping[str, Any], layers: Mapping[str, Any], map_data: Mapping[str, Any],
                 max_scalerank: int, jitter: bool, seed: int) -> tuple[Image.Image, dict[str, Any], dict[str, Any]]:
    sample = config["sample"]
    frame = make_frame(sample["region_id"], sample["width"], sample["height"], sample["frame_margin"])
    tiles, strips, kit = asset_indexes()
    image = paper_background((frame.width, frame.height), config, seed)
    image, land, lakes, coasts, shores = fill_regions(image, layers, layers["water"], frame, tiles, config, seed, jitter)
    image, ridges = terrain_ink(image, layers, frame, config)
    image = restore_lakes(image, lakes, config)
    image, seams = draw_boundaries(image, coasts, shores, frame, strips, config)
    image, selected_rivers = draw_rivers(image, layers["water"], frame, strips, config, max_scalerank)
    image, selected_routes = draw_routes(image, map_data["routes"], frame, sample["chapter"], strips, config)
    markers = build_marker_rows(frame, sample["chapter"], map_data, config)
    dem = dem_fields(image.size, config)
    river_clear = river_exclusion_mask(image.size, layers["water"], frame, config, max_scalerank)
    mountain_exclusion = ImageChops.lighter(lakes, river_clear)
    prepared_peaks = prepare_peaks(image.size, ridges, kit, config, seed, jitter, markers, dem, mountain_exclusion)
    peak_points = [{key: value for key, value in row.items() if key not in ("image", "anchor", "landing")}
                   for row in prepared_peaks]
    markers = resolve_marker_collisions(markers, peak_points, config["markers"]["minimum_spacing_px"])
    image = valley_mist(image, prepared_peaks, config, seed)
    image, peaks, placements, draw_order = place_ordered_decor(
        image, prepared_peaks, markers, kit, config, seed, jitter, mountain_exclusion)
    # Water is the foreground at a shoreline: a city anchor stays exact, while
    # any oversized transparent art extending into a lake is submerged.
    image = restore_lakes(image, lakes, config)
    image = draw_lake_outlines(image, shores, config)
    image = final_paper_wash(image, config, seed)
    metrics = {"river_feature_ids": selected_rivers, "river_count": len(selected_rivers), "route_feature_ids": selected_routes,
               "seam_alpha_min": round(min(seams) if seams else 1.0, 6), "ridge_count": len(ridges),
               "peaks": peaks, "placements": placements, "draw_order": draw_order, "marker_rows": markers,
               "jitter": jitter, "max_scalerank": max_scalerank,
               "land_mask": land, "lake_mask": lakes}
    return image, marker_document(markers, frame, sample["chapter"], seed), metrics


def compare_pair(left: Image.Image, right: Image.Image, left_label: str, right_label: str) -> Image.Image:
    gap, label_h = 16, 46
    out = Image.new("RGB", (left.width * 2 + gap, left.height + label_h), (238, 228, 204))
    out.paste(left, (0, label_h)); out.paste(right, (left.width + gap, label_h))
    draw = ImageDraw.Draw(out)
    draw.text((16, 14), left_label, fill=(33, 31, 26)); draw.text((left.width + gap + 16, 14), right_label, fill=(33, 31, 26))
    return out


def difference_ratio(a: Image.Image, b: Image.Image) -> float:
    first, second = np.asarray(a.convert("RGB"), dtype=np.int16), np.asarray(b.convert("RGB"), dtype=np.int16)
    return float(np.mean(np.any(first != second, axis=2)))


def alpha_monotonicity(image: Image.Image) -> float:
    alpha = np.asarray(image.getchannel("A"), dtype=np.float32)
    if not np.any(alpha > 0): return 1.0
    blurred = np.asarray(image.getchannel("A").filter(ImageFilter.GaussianBlur(2)), dtype=np.float32)
    outer = (alpha < 64) & (alpha > 0); inner = alpha > 192
    if not outer.any() or not inner.any(): return 1.0
    return float(blurred[inner].mean() >= blurred[outer].mean())


def verify_dissolve(config: Mapping[str, Any], seed: int) -> bool:
    alpha = Image.new("L", (80, 80), 0)
    ImageDraw.Draw(alpha).ellipse((12, 12, 68, 68), fill=255)
    source = Image.new("RGBA", alpha.size, (45, 42, 35, 0)); source.putalpha(alpha)
    dissolved = dissolve_asset(source, config, seed, "self-test")
    a = np.asarray(dissolved.getchannel("A"), dtype=np.float32)
    yy, xx = np.ogrid[:80, :80]; radius = np.sqrt((xx - 40) ** 2 + (yy - 40) ** 2)
    means = [float(a[(radius >= lo) & (radius < hi)].mean()) for lo, hi in ((0, 14), (14, 22), (22, 29), (29, 36))]
    return all(left + 1e-6 >= right for left, right in zip(means, means[1:]))


def verify_multiply() -> bool:
    base = Image.new("RGB", (4, 4), (210, 190, 170))
    overlay = Image.new("RGBA", (4, 4), (90, 100, 110, 255))
    out = np.asarray(multiply_rgba(base, overlay), dtype=np.int16)
    return bool(np.all(out <= np.asarray(base, dtype=np.int16)) and np.all(out <= np.asarray(overlay.convert("RGB"), dtype=np.int16)))


def runtime_checks(config: Mapping[str, Any], layers: Mapping[str, Any], map_data: Mapping[str, Any],
                   products: Mapping[str, Any], progress: bool = False) -> dict[str, Any]:
    default_image = products["default"][0]
    if progress: print("compose: verify repeat render", file=sys.stderr, flush=True)
    repeat_image, repeat_markers, repeat_metrics = render_scene(config, layers, map_data, config["rivers"]["default_max_scalerank"], True, config["seed"])
    hash_a, hash_b = sha256_bytes(png_bytes(default_image)), sha256_bytes(png_bytes(repeat_image))
    if progress: print("compose: verify changed seed", file=sys.stderr, flush=True)
    seed_changed = render_scene(config, layers, map_data, config["rivers"]["default_max_scalerank"], True, config["seed"] + 1)[0]
    marker_bytes = canonical_json(products["default"][1])
    repeat_marker_bytes = canonical_json(repeat_markers)
    low_rows = [row for row in map_data["pois"]["pois"] if row.get("confidence") == "低"]
    low_contract = all(not row["clickable"] and row["click_radius"] is None
                       for row in products["default"][1]["markers"] if row["confidence"] == "低")
    transforms = [row["transform"] for row in products["default"][2]["peaks"] + products["default"][2]["placements"]]
    jitter_bounds = all((0.85 <= row["scale"] <= 1.15 and abs(row["rotation_deg"]) <= 6.000001
                         and not row["flip_vertical"] and 0.88 <= row["ink_factor"] <= 1.12) for row in transforms)
    clickable_bounds = all(0.92 <= row["transform"]["scale"] <= 1.08
                           for row in products["default"][2]["placements"] if row["clickable"])
    no_jitter_identity = all(row["scale"] == 1 and row["rotation_deg"] == 0
                             and not row["flip_horizontal"] and not row["flip_vertical"]
                             and row["ink_factor"] == 1
                             for row in [item["transform"] for item in products["no_jitter"][2]["peaks"]
                                         + products["no_jitter"][2]["placements"]])
    peaks = products["default"][2]["peaks"]
    poisson_ok = all(math.hypot(a["x"] - b["x"], a["y"] - b["y"]) + 1e-6 >= config["terrain"]["peak_spacing_px"]
                     for index, a in enumerate(peaks) for b in peaks[index + 1:])
    markers = products["default"][1]["markers"]
    raw_marker_rows = products["default"][2]["marker_rows"]
    peak_marker_clear = all(
        math.hypot(peak["x"] - marker["canvas"]["x"], peak["y"] - marker["canvas"]["y"]) + 1e-6
        >= config["terrain"]["mountain_sizes_px"].get(peak["kind"], config["terrain"]["peak_size_px"]) / 2
        + config["terrain"]["peak_marker_gap_px"]
        + marker_visual_radius(raw_marker)
        for peak in peaks for marker, raw_marker in zip(markers, raw_marker_rows))
    placements = products["default"][2]["placements"]
    draw_order = products["default"][2]["draw_order"]
    occlusion_sorted = all(a["landing_y"] <= b["landing_y"] for a, b in zip(draw_order, draw_order[1:]))
    marker_spacing = all(math.hypot(a["x"] - b["x"], a["y"] - b["y"]) + 1e-6
                         >= config["markers"]["minimum_spacing_px"]
                         for index, a in enumerate(placements) for b in placements[index + 1:])
    marker_projection = True
    frame = make_frame(config["sample"]["region_id"], config["sample"]["width"], config["sample"]["height"], config["sample"]["frame_margin"])
    for row in products["default"][1]["markers"]:
        x, y = frame.lonlat(row["wgs84"]["lon"], row["wgs84"]["lat"] )
        marker_projection &= abs(x - row["canvas"]["x"]) <= 0.011 and abs(y - row["canvas"]["y"]) <= 0.011
    return {
        "deterministic_png": hash_a == hash_b, "deterministic_marker_json": marker_bytes == repeat_marker_bytes,
        "default_png_sha256": hash_a, "seed_changes_pixels": difference_ratio(default_image, seed_changed) > 0.01,
        "river_counts": {str(rank): products[f"river_{rank}"][2]["river_count"] for rank in config["rivers"]["comparison_max_scaleranks"]},
        "river_outputs_differ": difference_ratio(products["river_6"][0], products["river_9"][0]) > 0.0001,
        "jitter_outputs_differ": difference_ratio(products["no_jitter"][0], default_image) > 0.001,
        "jitter_preserves_marker_json": canonical_json(products["no_jitter"][1]) == marker_bytes,
        "seam_alpha_min": products["default"][2]["seam_alpha_min"],
        "all_10_low_confidence_present": len(low_rows) == 10, "visible_low_confidence_nonclickable": low_contract,
        "jitter_bounds_and_no_vertical_flip": jitter_bounds, "clickable_scale_within_8_percent": clickable_bounds,
        "no_jitter_transforms_identity": no_jitter_identity, "peak_poisson_spacing": poisson_ok,
        "peak_marker_minimum_gap": peak_marker_clear, "marker_minimum_spacing": marker_spacing,
        "mountains_dem_qualified": all(row["elevation_m"] >= config["terrain"]["mountain_min_elevation_m"]
                                         and row["relative_height_m"] >= config["terrain"]["mountain_min_ruggedness_m"]
                                         for row in peaks),
        "snow_high_only": all(row["elevation_m"] >= config["terrain"]["snow_min_elevation_m"]
                              for row in peaks if row["kind"] == "xueshan"),
        "marker_projection_exact": bool(marker_projection),
        "occlusion_sorted_by_landing_y": occlusion_sorted,
        "multiply_never_lightens": verify_multiply(), "dissolve_alpha_monotonic": verify_dissolve(config, config["seed"]),
        "repeat_metrics_equal": products["default"][2]["river_feature_ids"] == repeat_metrics["river_feature_ids"],
    }


def render_products(config: Mapping[str, Any], layers: Mapping[str, Any], map_data: Mapping[str, Any],
                    progress: bool = False) -> dict[str, Any]:
    default_rank = config["rivers"]["default_max_scalerank"]
    products = {}
    for key, jitter in (("default", True), ("no_jitter", False)):
        if progress: print(f"compose: render {key}", file=sys.stderr, flush=True)
        products[key] = render_scene(config, layers, map_data, default_rank, jitter, config["seed"])
    for rank in config["rivers"]["comparison_max_scaleranks"]:
        if progress: print(f"compose: render river threshold {rank}", file=sys.stderr, flush=True)
        products[f"river_{rank}"] = render_scene(config, layers, map_data, rank, True, config["seed"])
    return products


def output_payloads(config: Mapping[str, Any], products: Mapping[str, Any], checks: Mapping[str, Any]) -> dict[Path, bytes]:
    rid = config["sample"]["region_id"]
    default, no_jitter = products["default"][0], products["no_jitter"][0]
    river_low, river_high = (products[f"river_{rank}"][0] for rank in config["rivers"]["comparison_max_scaleranks"] )
    approved = load_image(APPROVED_SAMPLE, "RGB").resize(default.size, RESAMPLE)
    outputs = {
        OUTPUT / f"{rid}.png": png_bytes(default),
        OUTPUT / f"{rid}_markers.json": canonical_json(products["default"][1]),
        OUTPUT / f"{rid}_rivers_compare_r6_r9.png": png_bytes(compare_pair(river_low, river_high, "scalerank <= 6", "scalerank <= 9")),
        OUTPUT / f"{rid}_jitter_compare_off_on.png": png_bytes(compare_pair(no_jitter, default, "jitter off", "jitter on")),
        OUTPUT / f"{rid}_vs_approved.png": png_bytes(compare_pair(approved, default, "approved reference", "program composition")),
        OUTPUT / f"{rid}_check.json": canonical_json(checks),
    }
    manifest = {"schema": "tianshu.map-compose-manifest.v1", "config_sha256": sha256_bytes(CONFIG_PATH.read_bytes()),
                "outputs": {path.name: {"bytes": len(payload), "sha256": sha256_bytes(payload)} for path, payload in sorted(outputs.items())}}
    outputs[OUTPUT / "manifest.json"] = canonical_json(manifest)
    return outputs


def write_or_check(outputs: Mapping[Path, bytes], check: bool) -> list[str]:
    issues = []
    if check:
        for path, expected in outputs.items():
            if not path.is_file(): issues.append(f"missing output: {path.relative_to(ROOT)}")
            elif path.read_bytes() != expected: issues.append(f"stale output: {path.relative_to(ROOT)}")
    else:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        for path, payload in outputs.items(): path.write_bytes(payload)
    return issues


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sample", action="store_true", help="render the approved Dali sample frame")
    parser.add_argument("--check", action="store_true", help="verify byte-identical checked-in outputs")
    parser.add_argument("--no-jitter", action="store_true", help="render one sample with AR-69 transforms disabled")
    parser.add_argument("--seed", type=int, help="override the fixed seed")
    parser.add_argument("--river-threshold", type=int, choices=range(1, 10), help="maximum Natural Earth scalerank")
    parser.add_argument("--output", type=Path, help="single-output path for threshold/jitter review")
    args = parser.parse_args(argv)
    if not args.sample: parser.error("this task intentionally ships sample mode only; pass --sample")
    config = load_structured(CONFIG_PATH)
    if args.seed is not None: config["seed"] = args.seed
    layers, map_data = load_inputs()
    if args.output or args.no_jitter or args.river_threshold is not None:
        rank = args.river_threshold or config["rivers"]["default_max_scalerank"]
        product = render_scene(config, layers, map_data, rank, not args.no_jitter, config["seed"] )
        target = args.output or OUTPUT / f"{config['sample']['region_id']}_preview.png"
        if args.check:
            expected = png_bytes(product[0]); issues = [] if target.is_file() and target.read_bytes() == expected else [f"stale output: {target}"]
        else:
            target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(png_bytes(product[0])); issues = []
        if issues:
            print("FAIL " + "; ".join(issues), file=sys.stderr); return 1
        print(json.dumps({"output": str(target), "sha256": sha256_bytes(png_bytes(product[0]))}, ensure_ascii=False)); return 0
    products = render_products(config, layers, map_data, progress=True)
    checks = runtime_checks(config, layers, map_data, products, progress=True)
    failed = [name for name, value in checks.items() if isinstance(value, bool) and not value]
    outputs = output_payloads(config, products, checks)
    issues = write_or_check(outputs, args.check)
    if failed: issues.append("runtime checks: " + ", ".join(failed))
    if issues:
        print("FAIL " + "; ".join(issues), file=sys.stderr); return 1
    print(json.dumps({"status": "ok", "mode": "check" if args.check else "build", "outputs": len(outputs),
                      "png_sha256": checks["default_png_sha256"], "river_counts": checks["river_counts"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
