#!/usr/bin/env python3
"""Build the checked-in Dali DEM relief used by the AR-83 sample."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
CONFIG = HERE / "config.json"
DEFAULT_DEM = ROOT.parent.parent / "coord/geodata/ETOPO_2022_v1_30s_73E135E_18N54N_surface.tif"
DEM_SHA256 = "b30076fe4d8400cfbedf247b3c25cdd98782a47a976ceb05af1ee2f0e74dd06f"

_spec = importlib.util.spec_from_file_location("compose_relief", HERE / "compose_map.py")
compose = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
sys.modules[_spec.name] = compose
_spec.loader.exec_module(compose)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def box_blur(array: np.ndarray, radius: int) -> np.ndarray:
    if radius <= 0:
        return array.astype(np.float32, copy=True)
    size = radius * 2 + 1
    padded = np.pad(array.astype(np.float64), radius, mode="edge")
    integral = np.pad(padded, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
    total = integral[size:, size:] - integral[:-size, size:]
    total -= integral[size:, :-size] - integral[:-size, :-size]
    return (total / (size * size)).astype(np.float32)


def inverse_albers(frame: compose.Frame, width: int, height: int) -> tuple[np.ndarray, np.ndarray]:
    x0, y0, x1, y1 = frame.box
    x = x0 + (np.arange(width) + 0.5) / width * (x1 - x0)
    y = y0 + (np.arange(height) + 0.5) / height * (y1 - y0)
    canvas_x, canvas_y = np.meshgrid(x, y)
    projection = frame.projection
    raw_x = (canvas_x - projection.offset_x) / projection.scale
    raw_y = (projection.offset_y - canvas_y) / projection.scale
    albers = projection.albers
    rho = np.sqrt(raw_x * raw_x + (albers.rho0 - raw_y) ** 2)
    theta = np.arctan2(raw_x, albers.rho0 - raw_y)
    lon = np.degrees(albers.lambda0 + theta / albers.n)
    lat = np.degrees(np.arcsin(np.clip((albers.c - (rho * albers.n) ** 2) / (2 * albers.n), -1, 1)))
    return lon, lat


def sample_dem(path: Path, lon: np.ndarray, lat: np.ndarray) -> np.ndarray:
    Image.MAX_IMAGE_PIXELS = None
    with Image.open(path) as source:
        if source.size != (7441, 4321) or source.mode != "F":
            raise ValueError(f"unexpected DEM layout: {source.mode} {source.size}")
        elevation = np.asarray(source, dtype=np.float32)
    # GeoTIFF tags declare PixelIsArea with tie point (73E, 54.008333N)
    # at the outer corner; subtract half a cell to address array centres.
    col = np.clip((lon - 73.0) * 120.0 - 0.5, 0, elevation.shape[1] - 1)
    row = np.clip((54.008333333333326 - lat) * 120.0 - 0.5, 0, elevation.shape[0] - 1)
    c0 = np.clip(np.floor(col).astype(np.int32), 0, elevation.shape[1] - 2)
    r0 = np.clip(np.floor(row).astype(np.int32), 0, elevation.shape[0] - 2)
    fc, fr = col - c0, row - r0
    return (elevation[r0, c0] * (1 - fc) * (1 - fr)
            + elevation[r0, c0 + 1] * fc * (1 - fr)
            + elevation[r0 + 1, c0] * (1 - fc) * fr
            + elevation[r0 + 1, c0 + 1] * fc * fr).astype(np.float32)


def relief_channels(elevation: np.ndarray, lon: np.ndarray, lat: np.ndarray,
                    terrain: dict) -> tuple[np.ndarray, dict]:
    smooth = box_blur(elevation, int(terrain["dem_smooth_radius_px"]))
    radius = int(terrain["rugged_radius_px"])
    mean = box_blur(smooth, radius)
    rugged = np.sqrt(np.maximum(0, box_blur(smooth * smooth, radius) - mean * mean))
    lat_km = 111.2 * float(np.mean(np.abs(np.diff(lat, axis=0))))
    lon_km = 111.2 * math.cos(math.radians(float(lat.mean()))) * float(np.mean(np.abs(np.diff(lon, axis=1))))
    dzdy, dzdx = np.gradient(smooth, max(0.001, lat_km * 1000), max(0.001, lon_km * 1000))
    slope = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
    aspect = np.arctan2(-dzdx, dzdy)
    azimuth = math.radians(float(terrain["hillshade_azimuth_deg"]))
    altitude = math.radians(float(terrain["hillshade_altitude_deg"]))
    hillshade = np.sin(altitude) * np.cos(np.radians(slope))
    hillshade += np.cos(altitude) * np.sin(np.radians(slope)) * np.cos(azimuth - aspect)
    hillshade = np.clip((hillshade + 1) * 127.5, 0, 255).astype(np.uint8)
    slope_band = np.digitize(slope, terrain["slope_breaks_deg"]).astype(np.uint16)
    slope_band = (slope_band * 255 // max(1, len(terrain["slope_breaks_deg"]))).astype(np.uint8)
    lo, hi = map(float, terrain["rugged_range_m"])
    rugged_byte = np.clip((rugged - lo) * 255 / (hi - lo), 0, 255).astype(np.uint8)
    channels = np.dstack((hillshade, slope_band, rugged_byte))
    stats = {"elevation_m": [round(float(elevation.min()), 2), round(float(elevation.max()), 2)],
             "slope_deg": [round(float(slope.min()), 4), round(float(slope.max()), 4)],
             "ruggedness_m": [round(float(rugged.min()), 2), round(float(rugged.max()), 2)]}
    return channels, stats


def elevation_png(elevation: np.ndarray) -> bytes:
    """Store metres as deterministic unsigned 16-bit pixels."""
    values = np.clip(np.rint(elevation), 0, 65535).astype(np.uint16)
    return compose.png_bytes(Image.fromarray(values))


def build(dem_path: Path) -> list[tuple[Path, bytes]]:
    config = json.loads(CONFIG.read_text())
    sample, terrain = config["sample"], config["terrain"]
    width, height = terrain["relief_size"]
    frame = compose.make_frame(sample["region_id"], sample["width"], sample["height"], sample["frame_margin"])
    lon, lat = inverse_albers(frame, width, height)
    elevation = sample_dem(dem_path, lon, lat)
    channels, stats = relief_channels(elevation, lon, lat, terrain)
    image = Image.fromarray(channels, "RGB")
    payload = compose.png_bytes(image)
    elevation_payload = elevation_png(elevation)
    png_path = HERE / terrain["relief_file"]
    elevation_path = HERE / terrain["elevation_file"]
    meta_path = HERE / terrain["relief_meta"]
    meta = {"schema": "tianshu.map-dem-relief.v1", "region_id": sample["region_id"],
            "size": [width, height], "channels": {"r": "hillshade_northwest",
            "g": "slope_5_bands", "b": "local_ruggedness"},
            "source": {"file": dem_path.name, "sha256": DEM_SHA256,
            "dataset": "NOAA NCEI ETOPO 2022 v1 surface 30 arc-second"},
            "projection": "design/19 §2 spherical Albers",
            "parameters": {key: terrain[key] for key in ("dem_smooth_radius_px", "rugged_radius_px",
            "rugged_range_m", "slope_breaks_deg", "hillshade_azimuth_deg", "hillshade_altitude_deg")},
            "elevation": {"file": elevation_path.name, "unit": "metre",
            "encoding": "uint16 rounded metres",
            "png_sha256": hashlib.sha256(elevation_payload).hexdigest()},
            "stats": stats, "png_sha256": hashlib.sha256(payload).hexdigest()}
    meta_payload = compose.canonical_json(meta)
    return [(png_path, payload), (elevation_path, elevation_payload), (meta_path, meta_payload)]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dem", type=Path, default=DEFAULT_DEM)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not args.dem.is_file():
        raise FileNotFoundError(f"missing ETOPO source; pass --dem: {args.dem}")
    if sha256_file(args.dem) != DEM_SHA256:
        raise ValueError("ETOPO source sha256 mismatch")
    outputs = build(args.dem)
    if args.check:
        stale = [path for path, payload in outputs
                 if not path.is_file() or path.read_bytes() != payload]
        if stale: print("stale relief: " + ", ".join(map(str, stale)), file=sys.stderr); return 1
    else:
        for path, payload in outputs:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    print(json.dumps({"status": "ok", "check": args.check,
                      "outputs": [str(path) for path, _ in outputs]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
