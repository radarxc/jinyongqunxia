#!/usr/bin/env python3
"""Supplementary river courses that Natural Earth 10m lacks (AR-113).

Natural Earth 10m has no 湟水, 北洛河, 洛河 / 伊河 (Henan) and only the lowest
stretch of the 岷江 (Leshan → Yibin).  Their courses are derived here from the
ETOPO 2022 60" surface already used for the map (NOAA, public domain):

1. Priority-Flood + ε depression filling (Barnes et al. 2014) on a regional
   subset of the DEM, then D8 steepest-descent flow directions;
2. each river is traced downstream from a riverside county seat listed in
   GeoNames (CC BY 4.0; ids below) until it reaches the stream-mouth point
   GeoNames gives for that river (or a later waypoint when D8 would leave the
   river on a flat alluvial fan, as on the Chengdu plain, where the next
   GeoNames waypoints are joined by a valley-floor least-cost path instead);
3. the end point is snapped onto the parent river as drawn, the line is
   Douglas-Peucker simplified (0.01°) and written in lon / lat.

The waypoint coordinates are copied here (with their GeoNames ids) from
``.agents/coord/geodata/geonames/CN.zip`` (see the README there), so the
trace needs only the DEM at run time.  QA prints, for every waypoint, how far
the traced course passes from it.

    python3 tools/map/paint/trace_rivers.py            # writes tools/map/paint/rivers_supplement.json
    python3 tools/map/paint/trace_rivers.py --check    # rebuild in memory, compare bytes
"""
from __future__ import annotations

import argparse
import hashlib
import heapq
import json
import math
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import geo  # noqa: E402

OUT = HERE / "rivers_supplement.json"
CELL = geo.DEM_META["cell_deg"]

# (geonameid, name, lon, lat) — GeoNames CN dump downloaded 2026-10-11
RIVERS: List[Dict[str, Any]] = [
    {
        "id": "huangshui", "name": "湟水", "parent": ["Huang", "黄河"],
        "bbox": [100.4, 35.8, 103.8, 37.4],
        "start": [1796743, "Sanjiaocheng (海晏县城)", 101.000, 36.891],
        "via": [[1807128, "Huangyuan Chengguanzhen (湟源)", 101.271, 36.687],
                [1788852, "Xining (西宁)", 101.757, 36.626],
                [1799471, "Nianbo (乐都 / 海东)", 102.416, 36.480]],
        "mouth": [1807220, "Huang Shui (stream mouth)", 103.359, 36.122],
    },
    {
        "id": "beiluo", "name": "北洛河", "parent": ["Wei", "渭河"],
        "bbox": [107.4, 34.3, 110.6, 37.6],
        "start": [1791043, "Wuqi (吴起)", 108.172, 36.926],
        "via": [[1798532, "Pucheng Chengguanzhen (蒲城)", 109.584, 34.956],
                [1814092, "Dali (大荔)", 109.939, 34.796]],
        "mouth": [1801933, "Luo He (stream mouth into the Wei)", 110.119, 34.665],
    },
    {
        "id": "luohe", "name": "洛河", "parent": ["Huang", "黄河"],
        "bbox": [109.7, 33.6, 113.4, 35.1],
        "start": [1801731, "Lushi (卢氏)", 111.054, 34.057],
        "via": [[1801868, "Luoning (洛宁)", 111.652, 34.386],
                [1786421, "Yiyang (宜阳)", 112.187, 34.517],
                [1801792, "Luoyang (洛阳)", 112.437, 34.673],
                [1807683, "Yanshi (偃师)", 112.784, 34.724]],
        "mouth": [1786677, "Yiluo He (stream mouth)", 113.063, 34.839],
    },
    {
        "id": "yihe", "name": "伊河", "parent": ["traced", "luohe"],
        "bbox": [111.2, 33.5, 113.2, 34.9],
        "start": [1802202, "Luanchuan Chengguanzhen (栾川)", 111.613, 33.781],
        "via": [[1793966, "Song Xian (嵩县)", 112.080, 34.132],
                [1786750, "Yichuan (伊川)", 112.426, 34.420]],
        "mouth": [1786716, "Yi He (stream mouth into the Luo)", 112.800, 34.684],
    },
    {
        "id": "minjiang_upper", "name": "岷江（上中游）", "parent": ["Min", "岷江"],
        "bbox": [102.9, 29.3, 104.5, 33.3],
        "start": [1805754, "Jin'an (松潘县城)", 103.597, 32.639],
        "via": [[1811182, "Fengyi (茂县)", 103.854, 31.684],
                [1791566, "Weizhou (汶川)", 103.585, 31.493],
                [1809831, "Dujiangyan (灌口)", 103.646, 30.988],
                [1790886, "Wujin (新津)", 103.813, 30.411],
                [1800818, "Meishan (眉山)", 103.837, 30.044]],
        "mouth": [13100534, "Min Jiang (Leshan)", 103.768, 29.590],
        # below Dujiangyan the Min fans out over the Chengdu plain: follow the waypoints there
        "valley_after": 3,
    },
]

PARAMS = {
    "fill_epsilon_m": 1e-3,
    "stop_km": 3.0,              # trace stops within this distance of the next fixed point / mouth
    "max_waypoint_miss_km": 8.0,  # QA: D8 must pass this close to each waypoint, else valley path is used
    "valley_k": 4.0,             # valley-floor least-cost path: cost = 1 + valley_k * (m above local floor / 100)
    "valley_window_cells": 7,
    "simplify_deg": 0.01,
    "snap_parent_km": 12.0,
}


# ---------------------------------------------------------------- DEM subset
class Subset:
    def __init__(self, bbox: Sequence[float]):
        w, s, e, n = bbox
        dem = geo.load_dem()
        r0, c0 = geo.dem_index(w, n)
        r1, c1 = geo.dem_index(e, s)
        self.r0, self.c0 = int(math.floor(r0)), int(math.floor(c0))
        self.r1, self.c1 = int(math.ceil(r1)) + 1, int(math.ceil(c1)) + 1
        self.z = np.nan_to_num(dem[self.r0:self.r1, self.c0:self.c1].astype(np.float64), nan=-100.0)
        self.h, self.w = self.z.shape

    def rc(self, lon: float, lat: float) -> Tuple[int, int]:
        r, c = geo.dem_index(lon, lat)
        return int(round(float(r))) - self.r0, int(round(float(c))) - self.c0

    def lonlat(self, r: float, c: float) -> Tuple[float, float]:
        lon = geo.DEM_META["lon_edge_west"] + (c + self.c0 + 0.5) * CELL
        lat = geo.DEM_META["lat_edge_north"] - (r + self.r0 + 0.5) * CELL
        return lon, lat


def km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    lat = math.radians(0.5 * (a[1] + b[1]))
    dx = (a[0] - b[0]) * 111.195 * math.cos(lat)
    dy = (a[1] - b[1]) * 111.195
    return math.hypot(dx, dy)


def priority_flood(z: np.ndarray, eps: float) -> np.ndarray:
    """Barnes 2014 Priority-Flood + ε; outlets = subset border and sea cells (z < 0)."""
    h, w = z.shape
    filled = z.copy()
    closed = np.zeros((h, w), dtype=bool)
    heap: List[Tuple[float, int, int, int]] = []
    count = 0
    for r in range(h):
        for c in range(w):
            if r in (0, h - 1) or c in (0, w - 1) or z[r, c] < 0:
                heapq.heappush(heap, (filled[r, c], count, r, c))
                closed[r, c] = True
                count += 1
    nbrs = ((-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1))
    while heap:
        zc, _, r, c = heapq.heappop(heap)
        for dr, dc in nbrs:
            rr, cc = r + dr, c + dc
            if 0 <= rr < h and 0 <= cc < w and not closed[rr, cc]:
                closed[rr, cc] = True
                if filled[rr, cc] <= zc:
                    filled[rr, cc] = zc + eps
                heapq.heappush(heap, (filled[rr, cc], count, rr, cc))
                count += 1
    return filled


def d8_trace(sub: Subset, filled: np.ndarray, start: Tuple[int, int], stop: Tuple[float, float],
             stop_km: float, max_steps: int = 20000) -> List[Tuple[int, int]]:
    lat_mid = math.radians(sub.lonlat(sub.h / 2, sub.w / 2)[1])
    dx = math.cos(lat_mid)
    nbrs = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    dist = [math.hypot(dr, dc * dx) for dr, dc in nbrs]
    r, c = start
    path = [(r, c)]
    for _ in range(max_steps):
        if km(sub.lonlat(r, c), stop) <= stop_km:
            break
        best, best_slope = None, 0.0
        for (dr, dc), d in zip(nbrs, dist):
            rr, cc = r + dr, c + dc
            if 0 <= rr < sub.h and 0 <= cc < sub.w:
                slope = (filled[r, c] - filled[rr, cc]) / d
                if slope > best_slope:
                    best, best_slope = (rr, cc), slope
        if best is None:
            break
        r, c = best
        path.append((r, c))
        if r in (0, sub.h - 1) or c in (0, sub.w - 1):
            break
    return path


def valley_path(sub: Subset, a: Tuple[int, int], b: Tuple[int, int]) -> List[Tuple[int, int]]:
    from scipy import ndimage
    from skimage.graph import MCP_Geometric

    floor = ndimage.minimum_filter(sub.z, size=int(PARAMS["valley_window_cells"]))
    cost = 1.0 + PARAMS["valley_k"] * np.maximum(sub.z - floor, 0.0) / 100.0
    cost = np.where(sub.z < 0, np.inf, cost)
    mcp = MCP_Geometric(cost, fully_connected=True)
    mcp.find_costs([a], [b])
    return [tuple(map(int, p)) for p in mcp.traceback(b)]


def dp(points: np.ndarray, tol: float) -> np.ndarray:
    if len(points) < 3:
        return points
    keep = np.zeros(len(points), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = points[i], points[j]
        ab = b - a
        L = math.hypot(*ab)
        seg = points[i + 1:j]
        d = (np.hypot(seg[:, 0] - a[0], seg[:, 1] - a[1]) if L < 1e-12
             else np.abs(ab[0] * (seg[:, 1] - a[1]) - ab[1] * (seg[:, 0] - a[0])) / L)
        k = int(np.argmax(d))
        if d[k] > tol:
            keep[i + 1 + k] = True
            stack += [(i, i + 1 + k), (i + 1 + k, j)]
    return points[keep]


def nearest_on(lines: Sequence[np.ndarray], pt: Tuple[float, float]) -> Tuple[float, Tuple[float, float]]:
    best = (1e18, pt)
    for L in lines:
        a, b = L[:-1], L[1:]
        d = b - a
        L2 = np.maximum((d ** 2).sum(1), 1e-18)
        t = np.clip(((pt[0] - a[:, 0]) * d[:, 0] + (pt[1] - a[:, 1]) * d[:, 1]) / L2, 0, 1)
        q = a + d * t[:, None]
        for (qx, qy) in q:
            dd = km((qx, qy), pt)
            if dd < best[0]:
                best = (dd, (float(qx), float(qy)))
    return best


def parent_lines(parent: Sequence[str], traced: Dict[str, np.ndarray]) -> List[np.ndarray]:
    if parent[0] == "traced":
        return [traced[parent[1]]]
    name, zh = parent
    return [part for props, part in geo.parts_in_box("ne_10m_rivers_lake_centerlines", (95, 25, 120, 40))
            if (props.get("name"), props.get("name_zh")) == (name, zh)]


def build() -> Tuple[Dict[str, Any], List[str]]:
    issues = geo.verify_inputs()
    if issues:
        raise SystemExit("inputs: " + "; ".join(issues))
    traced: Dict[str, np.ndarray] = {}
    out_rivers = []
    report: List[str] = []
    for spec in RIVERS:
        sub = Subset(spec["bbox"])
        filled = priority_flood(sub.z, PARAMS["fill_epsilon_m"])
        fixed = [spec["start"]] + spec["via"] + [spec["mouth"]]
        valley_after = spec.get("valley_after")
        cells: List[Tuple[int, int]] = []
        method = []
        # D8 from the start to the first fixed point it should reach; fall back to valley paths per leg
        i = 0
        cur = sub.rc(fixed[0][2], fixed[0][3])
        cells.append(cur)
        while i < len(fixed) - 1:
            nxt = fixed[i + 1]
            target = (nxt[2], nxt[3])
            use_valley = valley_after is not None and i >= valley_after
            leg = None
            if not use_valley:
                leg = d8_trace(sub, filled, cur, target, PARAMS["stop_km"])
                miss = km(sub.lonlat(*leg[-1]), target)
                if miss > PARAMS["max_waypoint_miss_km"]:
                    leg = None
            if leg is None:
                leg = valley_path(sub, cur, sub.rc(*target))
                method.append(f"{fixed[i][1]}→{nxt[1]}: valley")
            else:
                method.append(f"{fixed[i][1]}→{nxt[1]}: D8")
            cells.extend(leg[1:])
            cur = cells[-1]
            i += 1
        pts = np.array([sub.lonlat(r, c) for r, c in cells], dtype=np.float64)
        # QA: distance from every fixed point to the traced course
        for f in fixed:
            d, _ = nearest_on([pts], (f[2], f[3]))
            report.append(f"{spec['id']:15s} {f[1]:40s} miss {d:5.1f} km")
        # snap the end onto the parent as drawn
        d_par, q = nearest_on(parent_lines(spec["parent"], traced), (float(pts[-1, 0]), float(pts[-1, 1])))
        if d_par <= PARAMS["snap_parent_km"]:
            pts = np.vstack([pts, [q]])
        report.append(f"{spec['id']:15s} end → parent {spec['parent'][1]} {d_par:5.1f} km ({'snapped' if d_par <= PARAMS['snap_parent_km'] else 'NOT snapped'})")
        simp = dp(pts, PARAMS["simplify_deg"])
        simp = np.round(simp, 3)
        traced[spec["id"]] = simp
        out_rivers.append({
            "id": spec["id"], "name": spec["name"], "parent": spec["parent"][1],
            "waypoints_geonames": [[f[0], f[1], f[2], f[3]] for f in fixed],
            "method": method,
            "line": simp.tolist(),
        })
    doc = {
        "schema": "tianshu.rivers-supplement.v1",
        "generator": "tools/map/paint/trace_rivers.py",
        "sources": {
            "dem": "ETOPO 2022 v1 60\" surface (NOAA NCEI, public domain) — .agents/coord/geodata/etopo2022_60s, sha256 "
                   + geo.INPUT_SHA256["etopo2022_60s/etopo2022_60s_surface_mosaic.npy"],
            "waypoints": "GeoNames CN dump (CC BY 4.0), downloaded 2026-10-11 — ids per river; see .agents/coord/geodata/README.md",
        },
        "params": PARAMS,
        "rivers": out_rivers,
    }
    return doc, report


def dumps(doc: Dict[str, Any]) -> bytes:
    return (json.dumps(doc, ensure_ascii=False, indent=1, sort_keys=False) + "\n").encode("utf-8")


def main(argv: Optional[Sequence[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args(argv)
    doc, report = build()
    payload = dumps(doc)
    print("\n".join(report))
    if args.check:
        same = OUT.is_file() and OUT.read_bytes() == payload
        print("rivers_supplement.json reproducible:", "ok" if same else "DIFFERS")
        return 0 if same else 1
    OUT.write_bytes(payload)
    print("wrote", OUT, len(payload), "bytes sha256", hashlib.sha256(payload).hexdigest())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
