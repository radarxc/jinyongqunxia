#!/usr/bin/env python3
"""Build deterministic AR-68 terrain layers and previews.

Inputs live outside git in ``.agents/coord/geodata``: an ETOPO 2022 30 arc-
second WCS subset and Natural Earth 10m land/lakes/rivers. Outputs use the
exact Albers/CanvasProjection implementation from tools/map/render_map.py.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import math
import os
import sys
import tempfile
from collections import deque
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
def find_geodata() -> Path:
    override = os.environ.get("TIANSHU_GEODATA")
    candidates = ([Path(override)] if override else [])
    candidates.append(ROOT / ".agents" / "coord" / "geodata")
    candidates.extend(parent / "coord" / "geodata" for parent in HERE.parents)
    for candidate in candidates:
        if candidate.is_dir():
            return candidate
    return candidates[0]

GEODATA = find_geodata()
CONFIG_PATH = HERE / "config.json"
LAYERS_DIR = HERE / "layers"
PREVIEW_DIR = HERE / "preview"
DEM_NAME = "ETOPO_2022_v1_30s_73E135E_18N54N_surface.tif"
DEM_PATH = GEODATA / DEM_NAME
DEM_URL = (
    "https://www.ngdc.noaa.gov/thredds/wcs/global/ETOPO2022/30s/"
    "30s_surface_elev_netcdf/ETOPO_2022_v1_30s_N90W180_surface.nc"
    "?service=WCS&version=1.0.0&request=GetCoverage&coverage=z"
    "&bbox=73,18,135,54&crs=OGC:CRS84&format=GeoTIFF_Float"
    "&resx=0.008333333333333333&resy=0.008333333333333333"
)
EXPECTED_INPUTS = {
    DEM_NAME: "b30076fe4d8400cfbedf247b3c25cdd98782a47a976ceb05af1ee2f0e74dd06f",
    "ne_10m_land.zip": "e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc",
    "ne_10m_lakes.zip": "0803a06f9c3cb4671d89b68c48b142aad9366ba40f665245e12a913fbc61722a",
    "ne_10m_rivers_lake_centerlines.zip": "ded71b01870855ccfe19b51f2ec14c9bb48fae23c0e9f3c11974d426433b5c38",
}
LAYER_NAMES = ("ridges", "hills", "plateaus", "basins_plains", "water")
SUPPLEMENTAL_LAKES = (
    {"name": "洱海", "wikidata": "Q83628", "lon": 100.1875, "lat": 25.763333, "length_km": 40.0, "area_km2": 252.91, "tilt_deg": -14.0},
    {"name": "滇池", "wikidata": "Q83640", "lon": 102.671389, "lat": 24.800556, "length_km": 39.0, "area_km2": 297.90, "tilt_deg": 10.0},
    {"name": "抚仙湖", "wikidata": "Q127016", "lon": 102.888889, "lat": 24.50225, "length_km": 30.0, "area_km2": 211.0, "tilt_deg": 0.0},
)
# Copied from the Gemini handoff's ``geo2.EXCLUDE``.  Natural Earth labels
# these modern reservoirs/seasonal waters as lakes, so ``featurecla`` alone
# is insufficient for a historical cross-era basemap.
EXCLUDED_LAKES = (
    ("松花湖", 126.83, 43.64),
    ("宿鸭湖水库", 114.24, 33.01),
    ("昭平台水库", 112.56, 33.33),
    ("乌拉盖", 117.48, 45.49),
)

spec = importlib.util.spec_from_file_location("terrain_render_map", ROOT / "tools/map/render_map.py")
render_map = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = render_map
spec.loader.exec_module(render_map)
sys.path.insert(0, str(HERE))
import ne_reader  # noqa: E402


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def load_config() -> Dict[str, Any]:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))


def source_paths() -> Dict[str, Path]:
    return {name: GEODATA / name for name in EXPECTED_INPUTS}


def validate_sources() -> List[str]:
    issues = []
    for name, expected in EXPECTED_INPUTS.items():
        path = GEODATA / name
        if not path.is_file():
            issues.append(f"missing input: {path}")
        elif sha256(path) != expected:
            issues.append(f"sha256 mismatch: {path}")
    for stem in ne_reader.STEMS.values():
        for suffix in (".shp", ".dbf", ".VERSION.txt"):
            path = GEODATA / stem / f"{stem}{suffix}"
            if not path.is_file():
                issues.append(f"missing Natural Earth member: {path}")
    return issues


def canvas_projection(config):
    canvas = config["canvas"]
    return render_map.CanvasProjection(canvas["width"], canvas["height"], canvas["margin"], config["extent_wgs84"])


def inverse_albers(projection, x, y):
    albers = projection.albers
    raw_x = (x - projection.offset_x) / projection.scale
    raw_y = (projection.offset_y - y) / projection.scale
    rho = np.sqrt(raw_x * raw_x + (albers.rho0 - raw_y) ** 2)
    theta = np.arctan2(raw_x, albers.rho0 - raw_y)
    lon = np.degrees(albers.lambda0 + theta / albers.n)
    lat = np.degrees(np.arcsin(np.clip((albers.c - (rho * albers.n) ** 2) / (2 * albers.n), -1, 1)))
    return lon, lat


def analysis_grid(config, projection):
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    xs = (np.arange(aw, dtype=np.float64) + 0.5) * cw / aw
    ys = (np.arange(ah, dtype=np.float64) + 0.5) * ch / ah
    return np.meshgrid(xs, ys)


def read_dem_sample(config, projection):
    Image.MAX_IMAGE_PIXELS = None
    image = Image.open(DEM_PATH)
    if image.size != (7441, 4321) or image.mode != "F":
        raise ValueError(f"unexpected DEM layout: {image.mode} {image.size}")
    elevation_source = np.asarray(image, dtype=np.float32)
    x, y = analysis_grid(config, projection)
    lon, lat = inverse_albers(projection, x, y)
    # GeoTIFF ModelTiepoint/ModelPixelScale describe pixel centres.  Do not
    # clamp out-of-coverage Albers pixels to an edge cell: that used to copy
    # the western/northern edge elevation into long false terrain bands.
    col = (lon - 73.0) * 120.0
    row = (54.008333333333326 - lat) * 120.0
    valid = (col >= 0.0) & (col <= image.width - 1) & (row >= 0.0) & (row <= image.height - 1)
    sample_col = np.clip(col, 0, image.width - 1)
    sample_row = np.clip(row, 0, image.height - 1)
    c0 = np.clip(np.floor(sample_col).astype(np.int32), 0, image.width - 2)
    r0 = np.clip(np.floor(sample_row).astype(np.int32), 0, image.height - 2)
    fc, fr = sample_col - c0, sample_row - r0
    z = (elevation_source[r0, c0] * (1 - fc) * (1 - fr) + elevation_source[r0, c0 + 1] * fc * (1 - fr)
         + elevation_source[r0 + 1, c0] * (1 - fc) * fr + elevation_source[r0 + 1, c0 + 1] * fc * fr)
    z = z.astype(np.float32)
    z[~valid] = 0.0
    return z, lon, lat, valid


def box_blur(array: np.ndarray, radius: int) -> np.ndarray:
    """Fast edge-padded square mean; deterministic and SciPy-free."""
    if radius <= 0:
        return array.astype(np.float32, copy=True)
    size = radius * 2 + 1
    padded = np.pad(array.astype(np.float64), radius, mode="edge")
    integral = np.pad(padded, ((1, 0), (1, 0)), mode="constant").cumsum(0).cumsum(1)
    total = integral[size:, size:] - integral[:-size, size:] - integral[size:, :-size] + integral[:-size, :-size]
    return (total / (size * size)).astype(np.float32)


def masked_box_blur(array: np.ndarray, valid: np.ndarray, radius: int) -> np.ndarray:
    """Mean over valid neighbours, without leaking clamped edge values."""
    if radius <= 0:
        output = array.astype(np.float32, copy=True)
        output[~valid] = 0.0
        return output
    numerator = box_blur(np.where(valid, array, 0.0), radius)
    denominator = box_blur(valid.astype(np.float32), radius)
    output = np.divide(numerator, denominator, out=np.zeros_like(numerator), where=denominator > 0)
    output[~valid] = 0.0
    return output.astype(np.float32)


def project_ring(projection, ring):
    return [[round(value, 2) for value in projection(lon, lat)] for lon, lat in ring]


def excluded_lake(feature):
    west, south, east, north = feature["bbox"]
    center_lon, center_lat = (west + east) / 2.0, (south + north) / 2.0
    return any(
        abs(center_lon - excluded_lon) < 0.06 and abs(center_lat - excluded_lat) < 0.06
        for _, excluded_lon, excluded_lat in EXCLUDED_LAKES
    )


def make_water_masks(config, projection, land_features, lake_features):
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    scale_x, scale_y = aw / cw, ah / ch
    land_image = Image.new("L", (aw, ah), 0)
    land_draw = ImageDraw.Draw(land_image)
    for feature in land_features:
        for part in feature["parts"]:
            if len(part) < 3:
                continue
            points = [(projection(lon, lat)[0] * scale_x, projection(lon, lat)[1] * scale_y) for lon, lat in part]
            land_draw.polygon(points, fill=0 if ne_reader.signed_area(part) > 0 else 255)
    lake_image = Image.new("L", (aw, ah), 0)
    lake_draw = ImageDraw.Draw(lake_image)
    for feature in lake_features:
        if feature["props"].get("featurecla") == "Reservoir" or excluded_lake(feature):
            continue
        for part in feature["parts"]:
            if len(part) >= 3 and ne_reader.signed_area(part) <= 0:
                points = [(projection(lon, lat)[0] * scale_x, projection(lon, lat)[1] * scale_y) for lon, lat in part]
                lake_draw.polygon(points, fill=255)
    for lake in SUPPLEMENTAL_LAKES:
        points = [(projection(lon, lat)[0] * scale_x, projection(lon, lat)[1] * scale_y) for lon, lat in lake_ellipse(lake)]
        lake_draw.polygon(points, fill=255)
    land = np.asarray(land_image) > 127
    lakes = np.asarray(lake_image) > 127
    return land, lakes


def classify(config, elevation, land, lakes, dem_valid):
    cfg, classes = config["analysis"], config["classes"]
    smoothed = masked_box_blur(elevation, dem_valid, cfg["smooth_radius_cells"])
    radius = cfg["rugged_radius_cells"]
    mean = masked_box_blur(elevation, dem_valid, radius)
    mean_square = masked_box_blur(elevation * elevation, dem_valid, radius)
    rugged = np.sqrt(np.maximum(0.0, mean_square - mean * mean)).astype(np.float32)
    dzdy, dzdx = np.gradient(smoothed)
    cell_km = 6371.0088 / (projection_scale(config) * config["analysis"]["width"] / config["canvas"]["width"])
    slope = np.degrees(np.arctan(np.hypot(dzdx, dzdy) / max(1.0, cell_km * 1000.0))).astype(np.float32)
    dry = dem_valid & land & ~lakes & (elevation >= 0)
    plateau = dry & (smoothed >= classes["highland_plateau"]["min_elevation_m"]) & (rugged <= classes["highland_plateau"]["max_ruggedness_m"])
    hills = dry & ~plateau & (smoothed >= classes["hill"]["min_elevation_m"]) & (smoothed < classes["hill"]["max_elevation_m"]) & (rugged >= classes["hill"]["min_ruggedness_m"])
    plains = dry & ~plateau & ~hills & (smoothed < classes["basin_plain"]["max_elevation_m"]) & (rugged < classes["basin_plain"]["max_ruggedness_m"])
    return {
        "elevation": elevation, "smoothed": smoothed, "rugged": rugged,
        "slope": slope, "dem_valid": dem_valid, "plateaus": plateau,
        "hills": hills, "basins_plains": plains,
    }


def projection_scale(config):
    return canvas_projection(config).scale


def connected_components(mask: np.ndarray, minimum: int, diagonal: bool = False):
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    components = []
    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            queue, cells = deque([(x, y)]), []
            seen[y, x] = True
            while queue:
                cx, cy = queue.popleft()
                cells.append((cx, cy))
                neighbours = ((cx, cy - 1), (cx - 1, cy), (cx + 1, cy), (cx, cy + 1))
                if diagonal:
                    neighbours += ((cx - 1, cy - 1), (cx + 1, cy - 1),
                                   (cx - 1, cy + 1), (cx + 1, cy + 1))
                for nx, ny in neighbours:
                    if 0 <= nx < width and 0 <= ny < height and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        queue.append((nx, ny))
            if len(cells) >= minimum:
                components.append(cells)
    return components


def component_polygon(cells, config):
    stride = config["analysis"]["polygon_stride_cells"]
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    selected = {(x // stride, y // stride) for x, y in cells}
    return cells_to_polygons(selected, config, stride)


def cells_to_polygons(selected, config, stride=1):
    """Return simple rings for a set of four-connected raster cells."""
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    # Four-connected components have one unambiguous lattice boundary.  Keep
    # it exact: morphological closing previously inflated the source mask and
    # the arbitrary edge walk silently lost most outer rings.
    edges = set()
    for x, y in sorted(selected, key=lambda p: (p[1], p[0])):
        for start, end in (((x, y), (x + 1, y)), ((x + 1, y), (x + 1, y + 1)), ((x + 1, y + 1), (x, y + 1)), ((x, y + 1), (x, y))):
            reverse = (end, start)
            if reverse in edges:
                edges.remove(reverse)
            else:
                edges.add((start, end))
    # Four-connected components may contain diagonal background contacts.
    # At such a vertex, joining edges would make a self-touching ring; split
    # the filled component at the contact by taking the left turn first.
    outgoing = {}
    for start, end in edges:
        outgoing.setdefault(start, set()).add(end)
    direction = {(1, 0): 0, (0, 1): 1, (-1, 0): 2, (0, -1): 3}
    loops = []
    while any(outgoing.values()):
        start = min(point for point, targets in outgoing.items() if targets)
        first = min(outgoing[start])
        outgoing[start].remove(first)
        loop, previous, current = [start, first], start, first
        for _ in range(len(edges) + 1):
            if current == start:
                break
            options = outgoing.get(current, [])
            if not options:
                break
            incoming = direction[(current[0] - previous[0], current[1] - previous[1])]
            nxt = min(
                options,
                key=lambda point: (
                    # Prefer left, straight, then right.
                    {3: 0, 0: 1, 1: 2, 2: 3}[
                        (direction[(point[0] - current[0], point[1] - current[1])] - incoming) % 4
                    ],
                    point,
                ),
            )
            options.remove(nxt)
            previous, current = current, nxt
            loop.append(current)
        if len(loop) >= 4 and loop[-1] == loop[0]:
            scale_x, scale_y = cw * stride / aw, ch * stride / ah
            points = [[x * scale_x, y * scale_y] for x, y in loop]
            simplified = quantize_ring(simplify_orthogonal(points))
            if len(simplified) >= 4 and abs(polygon_area(simplified)) > 0.01:
                loops.append(simplified)
    return loops


def quantize_ring(points):
    """Round to the design/19 precision without creating zero segments."""
    output = []
    for x, y in points:
        point = [round(x, 2), round(y, 2)]
        if not output or point != output[-1]:
            output.append(point)
    if output and output[0] != output[-1]:
        output.append(output[0])
    return output


def simplify_orthogonal(points):
    if len(points) <= 4:
        return points
    # Simplify against adjacent source vertices, not the last retained point.
    # The latter can erase a corner after a long run and make two distant
    # segments overlap after two-decimal coordinate quantisation.
    output = [points[0]]
    for previous, current, following in zip(points, points[1:], points[2:]):
        if ((previous[0] == current[0] == following[0])
                or (previous[1] == current[1] == following[1])):
            continue
        output.append(current)
    output.append(points[-1])
    return output


def polygon_area(points):
    return 0.5 * sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:]))


def clip_ring_to_canvas(ring, width, height):
    """Sutherland-Hodgman clip of one closed polygon ring."""
    points = [list(point) for point in ring[:-1] if len(point) == 2]
    boundaries = (
        (lambda p: p[0] >= 0, lambda a, b: [0.0, a[1] + (b[1] - a[1]) * (0 - a[0]) / (b[0] - a[0])] if b[0] != a[0] else [0.0, a[1]]),
        (lambda p: p[0] <= width, lambda a, b: [float(width), a[1] + (b[1] - a[1]) * (width - a[0]) / (b[0] - a[0])] if b[0] != a[0] else [float(width), a[1]]),
        (lambda p: p[1] >= 0, lambda a, b: [a[0] + (b[0] - a[0]) * (0 - a[1]) / (b[1] - a[1]), 0.0] if b[1] != a[1] else [a[0], 0.0]),
        (lambda p: p[1] <= height, lambda a, b: [a[0] + (b[0] - a[0]) * (height - a[1]) / (b[1] - a[1]), float(height)] if b[1] != a[1] else [a[0], float(height)]),
    )
    for inside, intersection in boundaries:
        if not points:
            break
        output, previous = [], points[-1]
        previous_inside = inside(previous)
        for current in points:
            current_inside = inside(current)
            if current_inside:
                if not previous_inside:
                    output.append(intersection(previous, current))
                output.append(current)
            elif previous_inside:
                output.append(intersection(previous, current))
            previous, previous_inside = current, current_inside
        points = output
    points = [[round(x, 2), round(y, 2)] for x, y in points]
    if len(points) >= 3:
        points.append(points[0])
    return points


def mask_boundary_rings(mask: np.ndarray, config):
    """Vectorize a Boolean land mask as simple, closed marching-square rings."""
    padded = np.pad(mask.astype(np.uint8), 1)
    table = {
        1: ((3, 2),), 2: ((2, 1),), 3: ((3, 1),), 4: ((1, 0),),
        5: ((1, 0), (3, 2)), 6: ((2, 0),), 7: ((3, 0),),
        8: ((0, 3),), 9: ((0, 2),), 10: ((0, 3), (2, 1)),
        11: ((0, 1),), 12: ((1, 3),), 13: ((1, 2),), 14: ((2, 3),),
    }
    def edge_point(x, y, edge):
        return ((2*x+1, 2*y), (2*x+2, 2*y+1),
                (2*x+1, 2*y+2), (2*x, 2*y+1))[edge]
    outgoing = {}
    for y in range(padded.shape[0] - 1):
        for x in range(padded.shape[1] - 1):
            code = (int(padded[y, x]) * 8 + int(padded[y, x+1]) * 4
                    + int(padded[y+1, x+1]) * 2 + int(padded[y+1, x]))
            for start, end in table.get(code, ()):
                outgoing[edge_point(x, y, start)] = edge_point(x, y, end)
    scale_x = config["canvas"]["width"] / (2 * mask.shape[1])
    scale_y = config["canvas"]["height"] / (2 * mask.shape[0])
    rings = []
    while outgoing:
        start = min(outgoing); current = start; raw = [start]
        while True:
            current = outgoing.pop(current); raw.append(current)
            if current == start:
                break
        points = [[round((x-1)*scale_x, 2), round((y-1)*scale_y, 2)] for x, y in raw]
        ring = simplify_orthogonal(points)
        if len(ring) < 4 or ring_self_intersects(ring):
            raise ValueError("invalid land boundary topology")
        rings.append(ring)
    return sorted(rings, key=lambda ring: (-abs(polygon_area(ring)), ring[0]))


def mask_features(mask, terrain, config, prefix):
    minimum = config["analysis"]["minimum_component_cells"]
    features = []
    for index, cells in enumerate(connected_components(mask, minimum), 1):
        loops = component_polygon(cells, config)
        if not loops:
            continue
        values = np.array([terrain["smoothed"][y, x] for x, y in cells])
        rugged = np.array([terrain["rugged"][y, x] for x, y in cells])
        outer_rings = [ring for ring in loops if polygon_area(ring) > 0]
        hole_rings = [ring for ring in loops if polygon_area(ring) < 0]
        if not outer_rings:
            raise ValueError(f"component {prefix}_{index:04d} has no outer ring")
        polygons = [[outer] for outer in outer_rings]
        for hole in hole_rings:
            probe = hole[0]
            containers = [
                polygon for polygon in polygons if point_in_ring(probe, polygon[0])
            ]
            if not containers:
                raise ValueError(f"orphan hole in {prefix}_{index:04d}")
            min(containers, key=lambda polygon: abs(polygon_area(polygon[0]))).append(hole)
        for polygon_index, rings in enumerate(polygons, 1):
            if any(ring_self_intersects(ring, orthogonal=True) for ring in rings):
                raise ValueError(f"self-intersecting polygon in {prefix}_{index:04d}")
            features.append({
                "id": f"{prefix}_{index:04d}_{polygon_index:02d}",
                "geometry": {"type": "Polygon", "coordinates": rings},
                "properties": {
                    "mean_elevation_m": int(round(float(values.mean()))),
                    "mean_ruggedness_m": int(round(float(rugged.mean()))),
                    "source_cells": len(cells),
                },
            })
    return features


def point_in_ring(point, ring):
    x, y = point
    inside = False
    for a, b in zip(ring, ring[1:]):
        if (a[1] > y) != (b[1] > y):
            crossing_x = a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])
            if x < crossing_x:
                inside = not inside
    return inside


def ring_self_intersects(ring, orthogonal=False):
    if orthogonal:
        vertices = ring[:-1]
        if len(set(map(tuple, vertices))) != len(vertices):
            return True
        horizontal, vertical = [], []
        for index, (a, b) in enumerate(zip(ring, ring[1:])):
            if a == b:
                return True
            if a[1] == b[1]:
                horizontal.append((min(a[0], b[0]), max(a[0], b[0]), a[1], index))
            elif a[0] == b[0]:
                vertical.append((a[0], min(a[1], b[1]), max(a[1], b[1]), index))
            else:
                return True
        segment_count = len(ring) - 1
        adjacent = lambda i, j: abs(i - j) <= 1 or {i, j} == {0, segment_count - 1}
        for hx0, hx1, hy, hi in horizontal:
            for vx, vy0, vy1, vi in vertical:
                if hx0 <= vx <= hx1 and vy0 <= hy <= vy1 and not adjacent(hi, vi):
                    return True
        for family, horizontal_family in ((horizontal, True), (vertical, False)):
            by_axis = {}
            for first, second, third, index in family:
                low, high, axis = (first, second, third) if horizontal_family else (second, third, first)
                by_axis.setdefault(axis, []).append((low, high, index))
            for intervals in by_axis.values():
                intervals.sort()
                for position, (low, high, index) in enumerate(intervals):
                    for next_low, next_high, next_index in intervals[position + 1:]:
                        if next_low > high:
                            break
                        if not adjacent(index, next_index):
                            return True
        return False
    def orient(a, b, c):
        value = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
        return 0 if abs(value) < 1e-9 else (1 if value > 0 else -1)
    def on_segment(a, b, c):
        return min(a[0], c[0]) <= b[0] <= max(a[0], c[0]) and min(a[1], c[1]) <= b[1] <= max(a[1], c[1])
    def crosses(a, b, c, d):
        return segments_intersect(a, b, c, d)
    segments = list(zip(ring, ring[1:]))
    for i, (a, b) in enumerate(segments):
        if a == b:
            return True
        for j in range(i + 1, len(segments)):
            if abs(i - j) <= 1 or (i == 0 and j == len(segments) - 1):
                continue
            c, d = segments[j]
            if a in (c, d) or b in (c, d) or crosses(a, b, c, d):
                return True
    return False


def sample_bilinear(array, x, y):
    height, width = array.shape
    x = np.clip(x, 0, width - 1.001)
    y = np.clip(y, 0, height - 1.001)
    x0, y0 = int(math.floor(x)), int(math.floor(y))
    fx, fy = x - x0, y - y0
    return float(array[y0, x0] * (1 - fx) * (1 - fy) + array[y0, x0 + 1] * fx * (1 - fy)
                 + array[y0 + 1, x0] * (1 - fx) * fy + array[y0 + 1, x0 + 1] * fx * fy)


def line_self_intersects(points):
    """True for a repeated/crossing non-adjacent segment in a polyline."""
    if len(points) < 2:
        return True
    segments = list(zip(points, points[1:]))
    for index, (start, end) in enumerate(segments):
        if start == end:
            return True
        for other_index in range(index + 2, len(segments)):
            other_start, other_end = segments[other_index]
            if start in (other_start, other_end) or end in (other_start, other_end):
                return True
            if segments_intersect(start, end, other_start, other_end):
                return True
    return False


def segments_intersect(a, b, c, d):
    def orient(p, q, r):
        value = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
        return 0 if abs(value) < 1e-9 else (1 if value > 0 else -1)
    def on_segment(p, q, r):
        return min(p[0], r[0]) <= q[0] <= max(p[0], r[0]) and min(p[1], r[1]) <= q[1] <= max(p[1], r[1])
    o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
    return ((o1 != o2 and o3 != o4) or (o1 == 0 and on_segment(a, c, b))
            or (o2 == 0 and on_segment(a, d, b)) or (o3 == 0 and on_segment(c, a, d))
            or (o4 == 0 and on_segment(c, b, d)))


def longest_simple_subline(points, minimum):
    """Deterministically stop before the first crossing and keep a valid line."""
    output = []
    for point in points:
        rounded = [round(point[0], 2), round(point[1], 2)]
        if output and rounded == output[-1]:
            continue
        candidate = output + [rounded]
        if len(candidate) >= 2 and line_self_intersects(candidate):
            break
        output.append(rounded)
    return output if len(output) >= minimum else []


def ridge_features(config, projection, terrain, land):
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    threshold = config["classes"]["ridge"]
    elevation = terrain["smoothed"]
    smooth = masked_box_blur(elevation, terrain["dem_valid"], 10)
    prominence = elevation - smooth
    candidates = land & (elevation >= threshold["min_elevation_m"]) & (prominence >= threshold["min_prominence_m"])
    features, occupied = [], np.zeros_like(candidates, dtype=bool)
    step = 4
    for y in range(step, ah - step, step):
        for x in range(step, aw - step, step):
            if not candidates[y, x] or occupied[y, x]:
                continue
            window = elevation[y - step : y + step + 1, x - step : x + step + 1]
            if elevation[y, x] < float(window.max()) - 1e-5:
                continue
            points = [(float(x), float(y))]
            initial_gradient = np.array([terrain["smoothed"][y, x + 1] - terrain["smoothed"][y, x - 1], terrain["smoothed"][y + 1, x] - terrain["smoothed"][y - 1, x]])
            initial_tangent = math.atan2(float(initial_gradient[1]), float(initial_gradient[0])) + math.pi / 2
            for direction in (-1.0, 1.0):
                current_x, current_y, branch = float(x), float(y), []
                previous_angle = initial_tangent if direction > 0 else initial_tangent + math.pi
                for _ in range(80):
                    best = None
                    for angle_index in range(16):
                        angle = 2 * math.pi * angle_index / 16
                        delta = abs(math.atan2(math.sin(angle - previous_angle), math.cos(angle - previous_angle)))
                        if delta > math.pi * 0.34:
                            continue
                        nx, ny = current_x + math.cos(angle) * step, current_y + math.sin(angle) * step
                        if not (1 <= nx < aw - 2 and 1 <= ny < ah - 2):
                            continue
                        if not candidates[int(round(ny)), int(round(nx))]:
                            continue
                        value = sample_bilinear(prominence, nx, ny) + 0.06 * sample_bilinear(elevation, nx, ny) - 45.0 * delta
                        if best is None or value > best[0]:
                            best = (value, nx, ny, angle)
                    if best is None or best[0] < threshold["min_prominence_m"]:
                        break
                    _, nx, ny, angle = best
                    if math.hypot(nx - x, ny - y) > 85 or occupied[int(ny), int(nx)]:
                        break
                    branch.append((nx, ny))
                    current_x, current_y = nx, ny
                    previous_angle = angle
                if direction < 0:
                    points = list(reversed(branch)) + points
                else:
                    points.extend(branch)
            if len(points) < threshold["min_length_cells"]:
                continue
            for px, py in points:
                occupied[max(0, int(py) - 4) : min(ah, int(py) + 5), max(0, int(px) - 4) : min(aw, int(px) + 5)] = True
            canvas_points = longest_simple_subline(
                [[px * cw / aw, py * ch / ah] for px, py in points],
                threshold["min_length_cells"],
            )
            if not canvas_points:
                continue
            # Keep property samples aligned if a crossing truncated the trace.
            points = [(px * aw / cw, py * ah / ch) for px, py in canvas_points]
            zvals = [sample_bilinear(elevation, px, py) for px, py in points]
            dx, dy = points[-1][0] - points[0][0], points[-1][1] - points[0][1]
            bearing = (math.degrees(math.atan2(dx, -dy)) + 360.0) % 180.0
            features.append({
                "id": f"ridge_{len(features) + 1:04d}",
                "geometry": {"type": "LineString", "coordinates": canvas_points},
                "properties": {
                    "mean_elevation_m": int(round(sum(zvals) / len(zvals))),
                    "relative_height_m": int(round(sum(sample_bilinear(prominence, px, py) for px, py in points) / len(points))),
                    "orientation_deg_from_north": round(bearing, 1),
                },
            })
    return sorted(features, key=lambda item: item["id"])


def water_features(config, projection, land, lake_features, river_features):
    features = []
    canvas_width, canvas_height = config["canvas"]["width"], config["canvas"]["height"]
    for index, ring in enumerate(mask_boundary_rings(land, config), 1):
        topology = "land_outer" if polygon_area(ring) > 0 else "land_hole"
        features.append({"id": f"land_boundary_{index:04d}", "geometry": {"type": "Polygon", "coordinates": [ring]}, "properties": {"water_type": "sea_exterior", "topology": topology}})
    for feature_index, feature in enumerate(lake_features, 1):
        if config["water"]["exclude_reservoirs"] and (
                feature["props"].get("featurecla") == "Reservoir" or excluded_lake(feature)):
            continue
        name = feature["props"].get("name_zh") or feature["props"].get("name") or ""
        for part_index, part in enumerate(feature["parts"], 1):
            if len(part) < 4 or ne_reader.signed_area(part) > 0:
                continue
            ring = project_ring(projection, part)
            if ring[0] != ring[-1]:
                ring.append(ring[0])
            ring = clip_ring_to_canvas(ring, canvas_width, canvas_height)
            if len(ring) < 4 or ring_self_intersects(ring):
                continue
            features.append({"id": f"lake_{feature_index:04d}_{part_index:02d}", "geometry": {"type": "Polygon", "coordinates": [ring]}, "properties": {"water_type": "lake", "name": name}})
    for lake in SUPPLEMENTAL_LAKES:
        ring = project_ring(projection, lake_ellipse(lake))
        ring.append(ring[0])
        ring = clip_ring_to_canvas(ring, canvas_width, canvas_height)
        if len(ring) < 4 or ring_self_intersects(ring):
            continue
        features.append({"id": f"lake_wikidata_{lake['wikidata'].lower()}", "geometry": {"type": "Polygon", "coordinates": [ring]}, "properties": {"water_type": "lake", "name": lake["name"], "supplemental_source": f"Wikidata {lake['wikidata']} CC0"}})
    max_rank = config["water"]["river_max_scalerank"]
    for feature_index, feature in enumerate(river_features, 1):
        props = feature["props"]
        rank = props.get("scalerank")
        if props.get("featurecla") != "River" or rank is None or rank > max_rank:
            continue
        name = props.get("name_zh") or props.get("name") or ""
        for part_index, part in enumerate(feature["parts"], 1):
            if len(part) < 2:
                continue
            features.append({"id": f"river_{feature_index:04d}_{part_index:02d}", "geometry": {"type": "LineString", "coordinates": project_ring(projection, part)}, "properties": {"water_type": "river", "name": name, "scalerank": int(rank)}})
    return features


def lake_ellipse(lake, points=48):
    major = lake["length_km"] / 2.0
    minor = lake["area_km2"] / (math.pi * major)
    tilt = math.radians(lake["tilt_deg"])
    lon_km = 111.32 * math.cos(math.radians(lake["lat"]))
    output = []
    for index in range(points):
        angle = 2 * math.pi * index / points
        east, north = minor * math.cos(angle), major * math.sin(angle)
        rotated_east = east * math.cos(tilt) + north * math.sin(tilt)
        rotated_north = -east * math.sin(tilt) + north * math.cos(tilt)
        output.append((lake["lon"] + rotated_east / lon_km, lake["lat"] + rotated_north / 110.57))
    return output


def layer_document(name, features, config, sources):
    return {
        "schema": "tianshu.terrain-layer.v1",
        "layer": name,
        "coordinate_space": {
            "type": "canvas_px",
            "origin": "top_left",
            "x_axis": "right",
            "y_axis": "down",
            "precision_decimals": 2,
            "width": config["canvas"]["width"],
            "height": config["canvas"]["height"],
            "margin": config["canvas"]["margin"],
        },
        "projection": {
            "name": "Spherical Albers Equal Area",
            "standard_parallels_deg": [25.0, 47.0],
            "central_meridian_deg": 105.0,
            "latitude_of_origin_deg": 35.0,
            "extent_wgs84": config["extent_wgs84"],
            "implementation": "tools/map/render_map.py::CanvasProjection",
        },
        "sources": sources,
        "features": features,
    }


def metadata_sources():
    return [
        {"id": "etopo2022_30s_surface", "version": "v1", "license": "CC0-1.0 / US public domain", "url": DEM_URL, "file": DEM_NAME, "sha256": EXPECTED_INPUTS[DEM_NAME]},
        {"id": "naturalearth_10m_land", "version": "5.1.1", "license": "public domain", "url": "https://naciscdn.org/naturalearth/10m/physical/ne_10m_land.zip", "file": "ne_10m_land.zip", "sha256": EXPECTED_INPUTS["ne_10m_land.zip"]},
        {"id": "naturalearth_10m_lakes", "version": "5.0.0", "license": "public domain", "url": "https://naciscdn.org/naturalearth/10m/physical/ne_10m_lakes.zip", "file": "ne_10m_lakes.zip", "sha256": EXPECTED_INPUTS["ne_10m_lakes.zip"]},
        {"id": "naturalearth_10m_rivers_lake_centerlines", "version": "5.0.0", "license": "public domain", "url": "https://naciscdn.org/naturalearth/10m/physical/ne_10m_rivers_lake_centerlines.zip", "file": "ne_10m_rivers_lake_centerlines.zip", "sha256": EXPECTED_INPUTS["ne_10m_rivers_lake_centerlines.zip"]},
        {"id": "wikidata_lake_supplements", "version": "2026-10-03 handoff snapshot", "license": "CC0-1.0", "url": "https://www.wikidata.org/", "items": [lake["wikidata"] for lake in SUPPLEMENTAL_LAKES]},
    ]


def build_documents(config):
    projection = canvas_projection(config)
    elevation, _, _, dem_valid = read_dem_sample(config, projection)
    land_features = ne_reader.load(GEODATA, "land")
    lake_features = ne_reader.load(GEODATA, "lakes")
    river_features = ne_reader.load(GEODATA, "rivers")
    land, lakes = make_water_masks(config, projection, land_features, lake_features)
    terrain = classify(config, elevation, land, lakes, dem_valid)
    documents = {
        "ridges": ridge_features(config, projection, terrain, dem_valid & land & ~lakes),
        "hills": mask_features(terrain["hills"], terrain, config, "hill"),
        "plateaus": mask_features(terrain["plateaus"], terrain, config, "plateau"),
        "basins_plains": mask_features(terrain["basins_plains"], terrain, config, "basin_plain"),
        "water": water_features(config, projection, land, lake_features, river_features),
    }
    sources = metadata_sources()
    return {name: layer_document(name, documents[name], config, sources) for name in LAYER_NAMES}, terrain, land, lakes


def atomic_write(path: Path, payload: bytes):
    path.parent.mkdir(parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(prefix=path.name + ".", dir=path.parent)
    try:
        with os.fdopen(handle, "wb") as stream:
            stream.write(payload)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def draw_polygon(draw, coordinates, fill, outline=None, width=1, hole_fill=None):
    if not coordinates:
        return
    ring = [(x, y) for x, y in coordinates[0]]
    if len(ring) >= 3:
        draw.polygon(ring, fill=fill)
        for hole in coordinates[1:]:
            if len(hole) >= 3:
                draw.polygon([(x, y) for x, y in hole], fill=hole_fill)
        if outline:
            draw.line(ring, fill=outline, width=width, joint="curve")


def rasterize_layer(document, config):
    """Fill delivered Polygon JSON back onto the analysis grid."""
    aw, ah = config["analysis"]["width"], config["analysis"]["height"]
    cw, ch = config["canvas"]["width"], config["canvas"]["height"]
    scale = 2
    image = Image.new("L", (aw * scale, ah * scale), 0)
    for feature in document["features"]:
        if feature["geometry"]["type"] != "Polygon":
            continue
        rings = feature["geometry"]["coordinates"]
        feature_image = Image.new("L", image.size, 0)
        draw = ImageDraw.Draw(feature_image)
        for index, ring in enumerate(rings):
            # Sample classification cell centres at odd coordinates on a 2x
            # grid; vector boundaries remain on even cell-edge coordinates.
            points = [(x * aw / cw * scale, y * ah / ch * scale) for x, y in ring]
            if len(points) >= 3:
                draw.polygon(points, fill=255 if index == 0 else 0)
        image = Image.fromarray(np.maximum(np.asarray(image), np.asarray(feature_image)))
    return np.asarray(image)[1::scale, 1::scale] > 127


def layer_coverages(documents, terrain, config):
    coverages = {}
    for name in ("hills", "plateaus", "basins_plains"):
        source = terrain[name]
        restored = rasterize_layer(documents[name], config)
        coverages[name] = float((restored & source).sum() / max(1, source.sum()))
    return coverages


def render_preview(documents, config, name, include_rivers=True):
    preview = config["preview"][name]
    target_w, target_h = preview["width"], preview["height"]
    if "canvas_bbox" in preview:
        x0, y0, x1, y1 = preview["canvas_bbox"]
    elif "region_id" in preview:
        box = region_albers_box(preview["region_id"], target_w / target_h)
        projection = canvas_projection(config)
        x0 = projection.offset_x + box[0] * projection.scale
        x1 = projection.offset_x + box[1] * projection.scale
        y0 = projection.offset_y - box[3] * projection.scale
        y1 = projection.offset_y - box[2] * projection.scale
    else:
        projection = canvas_projection(config)
        west, south, east, north = preview["wgs84_bbox"]
        samples = []
        for i in range(65):
            lon = west + (east - west) * i / 64
            lat = south + (north - south) * i / 64
            samples.extend((projection(lon, south), projection(lon, north), projection(west, lat), projection(east, lat)))
        xs, ys = zip(*samples)
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        bw, bh = (x1 - x0) * 1.04, (y1 - y0) * 1.04
        if bw / bh < target_w / target_h:
            bw = bh * target_w / target_h
        else:
            bh = bw * target_h / target_w
        x0, x1, y0, y1 = cx - bw / 2, cx + bw / 2, cy - bh / 2, cy + bh / 2
    sx, sy = target_w / (x1 - x0), target_h / (y1 - y0)
    transform = lambda p: ((p[0] - x0) * sx, (p[1] - y0) * sy)
    scale = 2
    background = (196, 221, 238)
    image = Image.new("RGB", (target_w * scale, target_h * scale), background)
    draw = ImageDraw.Draw(image, "RGBA")
    colors = {"basins_plains": (242, 236, 222, 255), "plateaus": (182, 174, 154, 255), "hills": (142, 132, 112, 255)}
    land_rings, land_holes = [], []
    for feature in documents["water"]["features"]:
        if feature["properties"]["water_type"] == "sea_exterior":
            target = land_holes if feature["properties"].get("topology") == "land_hole" else land_rings
            target.extend(feature["geometry"]["coordinates"])
    for ring in land_rings:
        points = [tuple(v * scale for v in transform(point)) for point in ring]
        if len(points) >= 3:
            draw.polygon(points, fill=(238, 228, 204, 255))
    land_mask = Image.new("L", image.size, 0)
    land_mask_draw = ImageDraw.Draw(land_mask)
    for ring in land_rings:
        points = [tuple(v * scale for v in transform(point)) for point in ring]
        if len(points) >= 3:
            land_mask_draw.polygon(points, fill=255)
    for ring in land_holes:
        points = [tuple(v * scale for v in transform(point)) for point in ring]
        if len(points) >= 3:
            land_mask_draw.polygon(points, fill=0)
    # Preview the actual delivery documents, including their holes.  This is
    # deliberately not allowed to fall back to the classification raster.
    for layer in ("basins_plains", "plateaus", "hills"):
        for feature in documents[layer]["features"]:
            rings = [[[v * scale for v in transform(point)] for point in ring]
                     for ring in feature["geometry"]["coordinates"]]
            draw_polygon(draw, rings, colors[layer], hole_fill=(238, 228, 204, 255))
    for feature in documents["water"]["features"]:
        geometry, kind = feature["geometry"], feature["properties"]["water_type"]
        if kind == "sea_exterior":
            rings = [[[v * scale for v in transform(point)] for point in ring] for ring in geometry["coordinates"]]
            if rings:
                draw.line([tuple(point) for point in rings[0]], fill=(82, 105, 112, 210), width=2 * scale, joint="curve")
        elif kind == "lake":
            rings = [[[v * scale for v in transform(point)] for point in ring] for ring in geometry["coordinates"]]
            draw_polygon(draw, rings, (196, 221, 238, 255), (82, 105, 112, 210), 2 * scale)
        elif kind == "river" and include_rivers:
            if name == "full" and feature["properties"]["scalerank"] > 3:
                continue
            points = [tuple(v * scale for v in transform(point)) for point in geometry["coordinates"]]
            if len(points) >= 2:
                rank = feature["properties"]["scalerank"]
                draw.line(points, fill=(52, 112, 186, 230), width=(4 if rank <= 3 else 3) * scale, joint="curve")
    alpha = np.asarray(land_mask) > 0
    pixels = np.asarray(image).copy()
    outside = ~alpha
    pixels[outside] = np.array(background, dtype=np.uint8)
    image = Image.fromarray(pixels)
    draw = ImageDraw.Draw(image, "RGBA")
    for feature in documents["water"]["features"]:
        geometry, kind = feature["geometry"], feature["properties"]["water_type"]
        if kind == "lake":
            rings = [[[v * scale for v in transform(point)] for point in ring] for ring in geometry["coordinates"]]
            draw_polygon(draw, rings, (196, 221, 238, 255), (82, 105, 112, 210), 2 * scale)
        elif kind == "river" and include_rivers:
            if name == "full" and feature["properties"]["scalerank"] > 3:
                continue
            points = [tuple(v * scale for v in transform(point)) for point in geometry["coordinates"]]
            if len(points) >= 2:
                rank = feature["properties"]["scalerank"]
                draw.line(points, fill=(52, 112, 186, 230), width=(4 if rank <= 3 else 3) * scale, joint="curve")
    # Keep the sea exactly water-colored after coastline/raster antialiasing.
    pixels = np.asarray(image).copy()
    pixels[~alpha] = np.array((196, 221, 238), dtype=np.uint8)
    image = Image.fromarray(pixels)
    draw = ImageDraw.Draw(image, "RGBA")
    if name == "full":
        for feature in documents["water"]["features"]:
            if feature["properties"]["water_type"] != "lake":
                continue
            rings = [[[v * scale for v in transform(point)] for point in ring]
                     for ring in feature["geometry"]["coordinates"]]
            draw_polygon(draw, rings, (196, 221, 238, 255), (82, 105, 112, 210), 2 * scale)
    for feature in documents["ridges"]["features"]:
        points = [tuple(v * scale for v in transform(point)) for point in feature["geometry"]["coordinates"]]
        if len(points) >= 2:
            draw.line(points, fill=(33, 31, 26, 205), width=3 * scale, joint="curve")
    image = image.resize((target_w, target_h), Image.Resampling.LANCZOS)
    output = io.BytesIO()
    image.save(output, format="PNG", optimize=True, compress_level=9)
    return output.getvalue()


def region_albers_box(region_id, aspect=1.5, margin=0.04):
    regions = json.loads((ROOT / "docs/design/map/regions.yaml").read_text(encoding="utf-8"))["regions"]
    region = next(row for row in regions if row["id"] == region_id)
    west, south, east, north = region["bounds"]
    albers = render_map.Albers()
    points = []
    for index in range(41):
        lon = west + (east - west) * index / 40
        lat = south + (north - south) * index / 40
        points.extend((albers.raw(lon, south), albers.raw(lon, north), albers.raw(west, lat), albers.raw(east, lat)))
    xs, ys = zip(*points)
    center_x, center_y = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    width, height = (max(xs) - min(xs)) * (1 + margin), (max(ys) - min(ys)) * (1 + margin)
    if width / height < aspect:
        width = height * aspect
    else:
        height = width / aspect
    return center_x - width / 2, center_x + width / 2, center_y - height / 2, center_y + height / 2


def load_delivered_documents():
    return {
        name: json.loads((LAYERS_DIR / f"{name}.json").read_text(encoding="utf-8"))
        for name in LAYER_NAMES
    }


def expected_outputs(documents, config, preview_documents=None):
    outputs = {LAYERS_DIR / f"{name}.json": canonical_bytes(documents[name]) for name in LAYER_NAMES}
    preview_documents = preview_documents or documents
    for name in ("full", "dali", "guanzhong"):
        outputs[PREVIEW_DIR / f"{name}.png"] = render_preview(
            preview_documents, config, name, include_rivers=True)
    manifest = {
        "schema": "tianshu.terrain-manifest.v1",
        "config_sha256": sha256(CONFIG_PATH),
        "input_sha256": EXPECTED_INPUTS,
        "outputs": {str(path.relative_to(HERE)): {"bytes": len(payload), "sha256": hashlib.sha256(payload).hexdigest()} for path, payload in sorted(outputs.items(), key=lambda item: str(item[0]))},
    }
    outputs[LAYERS_DIR / "manifest.json"] = canonical_bytes(manifest)
    return outputs


def check_outputs(outputs, documents=None, terrain=None, config=None):
    issues = []
    for path, expected in outputs.items():
        if not path.is_file():
            issues.append(f"missing output: {path.relative_to(ROOT)}")
        elif path.read_bytes() != expected:
            issues.append(f"stale output: {path.relative_to(ROOT)}")
    json_total = sum(len(payload) for path, payload in outputs.items() if path.suffix == ".json")
    png_total = sum(len(payload) for path, payload in outputs.items() if path.suffix == ".png")
    if json_total > 15 * 1024 * 1024:
        issues.append(f"JSON budget exceeded: {json_total} bytes")
    if png_total > 6 * 1024 * 1024:
        issues.append(f"PNG budget exceeded: {png_total} bytes")
    coverages = {}
    if documents is not None and terrain is not None and config is not None:
        coverages = layer_coverages(documents, terrain, config)
        for name, coverage in coverages.items():
            if coverage < 0.95:
                issues.append(f"coverage below 0.95: {name}={coverage:.6f}")
    return issues, json_total, png_total, coverages


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate sources and byte-for-byte outputs without writing")
    args = parser.parse_args(argv)
    source_issues = validate_sources()
    if source_issues:
        for issue in source_issues:
            print(f"ERROR: {issue}", file=sys.stderr)
        return 1
    config = load_config()
    documents, terrain, land, lakes = build_documents(config)
    if args.check:
        try:
            delivered_documents = load_delivered_documents()
        except (OSError, ValueError, json.JSONDecodeError):
            delivered_documents = documents
        outputs = expected_outputs(documents, config, delivered_documents)
        issues, json_total, png_total, coverages = check_outputs(
            outputs, delivered_documents, terrain, config)
        for name in ("hills", "plateaus", "basins_plains"):
            print(f"COVERAGE {name} {coverages[name]:.6f}")
        if issues:
            for issue in issues:
                print(f"ERROR: {issue}", file=sys.stderr)
            return 1
        print(f"OK: terrain sources and outputs verified; json={json_total} bytes png={png_total} bytes")
        return 0
    layer_outputs = {
        LAYERS_DIR / f"{name}.json": canonical_bytes(documents[name])
        for name in LAYER_NAMES
    }
    for path, payload in layer_outputs.items():
        atomic_write(path, payload)
    outputs = expected_outputs(documents, config, load_delivered_documents())
    for path, payload in outputs.items():
        atomic_write(path, payload)
    _, json_total, png_total, coverages = check_outputs(outputs, documents, terrain, config)
    counts = " ".join(f"{name}={len(documents[name]['features'])}" for name in LAYER_NAMES)
    coverage_text = " ".join(f"{name}={value:.6f}" for name, value in coverages.items())
    print(f"OK: terrain rebuilt; {counts}; {coverage_text}; json={json_total} bytes png={png_total} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
