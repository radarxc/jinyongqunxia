"""GIS inputs and projection for the painted world map (AR-111).

Raw data lives outside git in ``.agents/coord/geodata`` (see the README there):
Natural Earth 10m shapefiles and an ETOPO 2022 60" mosaic.  Every input is
checked against the sha256 recorded below before use.

The projection is exactly ``tools/map/render_map.py::CanvasProjection`` with
``margin = 18 * W / 512``, i.e. the content grid ``CanvasProjection(512, 384, 18)``
scaled by ``W / 512``.  ``Proj.fwd`` / ``Proj.inv`` are vectorised versions of
the same formulas.
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import struct
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]


def _geodata_dir() -> Path:
    override = os.environ.get("TIANSHU_GEODATA")
    if override:
        return Path(override)
    return ROOT / ".agents" / "coord" / "geodata"


GEODATA = _geodata_dir()

# sha256 of every raw input (relative to GEODATA).  Shapefile members are read
# from the unpacked zip next to it; the zip hash pins their content.
INPUT_SHA256 = {
    "ne_10m_land/ne_10m_land.zip": "e547d749445eaa0964aba76738090ec88f5e63c4585122170f98c67a7ea922dc",
    "ne_10m_minor_islands/ne_10m_minor_islands.zip": "47c0b3ce26df7b4dbabdbb251023918cb2f5c83462a426288f1f253da7284db2",
    "ne_10m_lakes/ne_10m_lakes.zip": "0803a06f9c3cb4671d89b68c48b142aad9366ba40f665245e12a913fbc61722a",
    "ne_10m_lakes_historic/ne_10m_lakes_historic.zip": "f82fb212a4e472fcfd43afb78b37b20792987cda4aa239aab6818e4b0fb713ac",
    "ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines.zip": "ded71b01870855ccfe19b51f2ec14c9bb48fae23c0e9f3c11974d426433b5c38",
    "ne_10m_geography_regions_polys/ne_10m_geography_regions_polys.zip": "cb7b9db200284ed1551f20eacc7f3333e9b5f311c19f7cb2670694529f688682",
    "etopo2022_60s/etopo2022_60s_surface_mosaic.npy": "7604138131e120385727d49a3db2a5285b39caa7acd5dd5fd68ef2516c6bb93a",
}
DEM_META = {"lon_edge_west": 48.9, "lat_edge_north": 63.1, "cell_deg": 1.0 / 60.0}

_spec = importlib.util.spec_from_file_location("paint_render_map", ROOT / "tools/map/render_map.py")
render_map = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
sys.modules[_spec.name] = render_map
_spec.loader.exec_module(render_map)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_inputs() -> List[str]:
    issues = []
    for rel, expected in INPUT_SHA256.items():
        path = GEODATA / rel
        if not path.is_file():
            issues.append(f"missing input: {path}")
        elif sha256_file(path) != expected:
            issues.append(f"sha256 mismatch: {path}")
    for rel in INPUT_SHA256:
        if rel.endswith(".zip"):
            stem = Path(rel).stem
            for suffix in (".shp", ".dbf"):
                member = GEODATA / stem / f"{stem}{suffix}"
                if not member.is_file():
                    issues.append(f"missing unpacked member: {member}")
    return issues


# ---------------------------------------------------------------- projection
class Proj:
    """CanvasProjection(W, H, 18*W/512), vectorised.  Pixel x right, y down."""

    def __init__(self, width: int, height: int):
        self.width, self.height = int(width), int(height)
        self.cp = render_map.CanvasProjection(self.width, self.height, 18.0 * self.width / 512.0)
        alb = self.cp.albers
        self.n, self.c, self.rho0, self.lam0 = alb.n, alb.c, alb.rho0, alb.lambda0
        self.k = self.width / 512.0  # image px per grid unit

    def fwd(self, lon, lat):
        lam = np.radians(np.asarray(lon, dtype=np.float64))
        phi = np.radians(np.asarray(lat, dtype=np.float64))
        theta = self.n * (lam - self.lam0)
        rho = np.sqrt(np.maximum(0.0, self.c - 2.0 * self.n * np.sin(phi))) / self.n
        x = rho * np.sin(theta)
        y = self.rho0 - rho * np.cos(theta)
        return self.cp.offset_x + x * self.cp.scale, self.cp.offset_y - y * self.cp.scale

    def inv(self, px, py):
        x = (np.asarray(px, dtype=np.float64) - self.cp.offset_x) / self.cp.scale
        y = (self.cp.offset_y - np.asarray(py, dtype=np.float64)) / self.cp.scale
        rho = np.hypot(x, self.rho0 - y)
        theta = np.arctan2(x, self.rho0 - y)
        lon = np.degrees(self.lam0 + theta / self.n)
        s = (self.c - (rho * self.n) ** 2) / (2.0 * self.n)
        lat = np.degrees(np.arcsin(np.clip(s, -1.0, 1.0)))
        return lon, lat


# ---------------------------------------------------------------- shapefiles
def _read_dbf(path: Path) -> List[Dict[str, Any]]:
    data = path.read_bytes()
    count = struct.unpack("<I", data[4:8])[0]
    header_len, record_len = struct.unpack("<HH", data[8:12])
    fields, offset = [], 32
    while data[offset] != 0x0D:
        name = data[offset:offset + 11].split(b"\0")[0].decode("ascii", "replace")
        fields.append((name, chr(data[offset + 11]), data[offset + 16]))
        offset += 32
    rows = []
    for index in range(count):
        record = data[header_len + index * record_len: header_len + (index + 1) * record_len]
        position, row = 1, {}
        for name, kind, length in fields:
            raw = record[position:position + length].decode("utf-8", "replace").replace("\x00", "").strip()
            position += length
            if kind in "NF":
                try:
                    row[name.lower()] = float(raw) if raw else None
                except ValueError:
                    row[name.lower()] = None
            else:
                row[name.lower()] = raw
        rows.append(row)
    return rows


def _read_shp(path: Path) -> List[Optional[List[np.ndarray]]]:
    data, offset, rows = path.read_bytes(), 100, []
    while offset + 8 <= len(data):
        content_len = struct.unpack(">i", data[offset + 4: offset + 8])[0] * 2
        record = data[offset + 8: offset + 8 + content_len]
        offset += 8 + content_len
        shape_type = struct.unpack("<i", record[:4])[0]
        if shape_type == 0:
            rows.append(None)
            continue
        part_count, point_count = struct.unpack("<2i", record[36:44])
        starts = list(struct.unpack(f"<{part_count}i", record[44:44 + 4 * part_count]))
        point_offset = 44 + 4 * part_count
        values = np.frombuffer(record, dtype="<f8", count=2 * point_count, offset=point_offset).reshape(-1, 2)
        starts.append(point_count)
        rows.append([np.array(values[starts[i]:starts[i + 1]], dtype=np.float64) for i in range(part_count)])
    return rows


_SHAPE_CACHE: Dict[str, List[Tuple[Dict[str, Any], List[np.ndarray]]]] = {}


def read_shapes(stem: str) -> List[Tuple[Dict[str, Any], List[np.ndarray]]]:
    """All records of a Natural Earth layer as (props, [part arrays lon/lat])."""
    if stem not in _SHAPE_CACHE:
        base = GEODATA / stem / stem
        props = _read_dbf(base.with_suffix(".dbf"))
        geoms = _read_shp(base.with_suffix(".shp"))
        _SHAPE_CACHE[stem] = [(p, g) for p, g in zip(props, geoms) if g is not None]
    return _SHAPE_CACHE[stem]


def parts_in_box(stem: str, box: Sequence[float], keep=None) -> List[Tuple[Dict[str, Any], np.ndarray]]:
    """(props, part) for every part whose own bbox meets box=(W,S,E,N)."""
    west, south, east, north = box
    out = []
    for props, parts in read_shapes(stem):
        if keep is not None and not keep(props):
            continue
        for part in parts:
            if len(part) < 2:
                continue
            lo = part.min(axis=0)
            hi = part.max(axis=0)
            if hi[0] < west or lo[0] > east or hi[1] < south or lo[1] > north:
                continue
            out.append((props, part))
    return out


# ---------------------------------------------------------------- DEM
_DEM: Optional[np.ndarray] = None


def load_dem() -> np.ndarray:
    global _DEM
    if _DEM is None:
        _DEM = np.load(GEODATA / "etopo2022_60s" / "etopo2022_60s_surface_mosaic.npy")
    return _DEM


def dem_index(lon, lat):
    """Fractional (row, col) of cell centres in the DEM mosaic."""
    cell = DEM_META["cell_deg"]
    col = (np.asarray(lon) - DEM_META["lon_edge_west"]) / cell - 0.5
    row = (DEM_META["lat_edge_north"] - np.asarray(lat)) / cell - 0.5
    return row, col


def load_json(path: Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))
