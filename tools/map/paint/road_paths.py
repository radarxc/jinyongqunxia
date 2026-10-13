#!/usr/bin/env python3
"""Least-effort display geometry for the world-map roads (AR-113).

Every road segment that appears in ``content/world/ch01..ch14/map.yaml`` gets a
polyline that follows the terrain instead of a straight line: a minimum-cost
path on a 4096×3072 raster (8 cells per grid unit, about the 1' DEM spacing)
built from ETOPO 2022 relief and Natural Earth 10m water.  Only the drawn
geometry changes; travel distance and all core rules stay as they are (they keep
using ``distanceLi`` and the content points).

Cost per land cell (flat lowland = 1):

    (1 + slope_k * slope^2) * (1 + valley_k * above_valley_floor_km) * (1 + plateau_k * plateau)
    + river_cross on the cells of major rivers (both banks walkable, a crossing pays once)

Sea and lake cells are impassable except "ferry" water within ferry_max_km / 2 of
land (a crossing of at most ~ferry_max_km between two shores), priced
ferry_cost per cell, so ferries are only used where no land route exists
(Qiongzhou strait).  Interior points of a content road are honoured as via-points.

Paths are traced with skimage's MCP (8-connected, geometric), simplified with
Douglas-Peucker, lightly Chaikin-smoothed and re-validated: no sample may lie
farther than ``shore_tolerance_grid`` into sea or lake except along the ferry
crossing the raw path itself used.  First / last points equal the road's start /
end node points exactly.

    python3 tools/map/paint/road_paths.py            # writes docs/design/map/road_paths.json + QA
    python3 tools/map/paint/road_paths.py --check    # rebuild in memory, compare bytes with the file
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import geo  # noqa: E402
import raster  # noqa: E402

ROOT = geo.ROOT
OUT = ROOT / "docs" / "design" / "map" / "road_paths.json"
QA = ROOT / ".agents" / "coord" / "ART-worldmap-painted" / "qa"
BASE_MAP = ROOT / "assets" / "default" / "map" / "world" / "map_world_jianghu__base01.webp"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"

PARAMS: Dict[str, Any] = {
    "cells_per_grid": 8,            # 4096×3072 cost raster (0.125 grid unit ≈ 1.7 km per cell, ~ the 1' DEM)
    "slope_k": 150.0,               # slope as rise/run measured on the 1' DEM (critical-slope style: 1 + (s/0.08)^2)
    "slope_blur_dem_cells": 1.0,
    "valley_k": 1.6,                # per 1000 m above the local valley floor (min within valley_window)
    "valley_window_dem_cells": 11,
    "plateau_k": 0.25,
    "plateau_from_m": 2500,
    "plateau_full_m": 5000,
    "river_cross": 10.0,            # per river cell; a crossing touches ~2 cells
    "river_major_max_scalerank": 4,
    "river_major_names": [["Huai", "淮河"], ["Han", "汉水"], ["Songhua", "松花江"], ["Liao", "辽河"],
                          ["Yalu", "鸭绿江"], ["Tarim", "塔里木河"], ["Ile", "伊犁河"], ["Hong", "红河"]],
    "ferry_max_km": 40.0,
    "ferry_cost": 40.0,             # per water cell: only worth it where no land route exists (islands)
    "use_content_waypoints": True,  # interior points of a content road are honoured as via-points
    "shore_tolerance_grid": 0.25,   # within this distance of land a sample counts as on the shore (2 px @4096)
    "dp_tolerance_grid": 0.3,
    "chaikin_iterations": 1,
    "validate_step_grid": 0.1,
    "region_box_lonlat": [44.0, 2.0, 166.0, 68.0],
}


# ---------------------------------------------------------------- roads
def load_segments() -> Tuple[Dict[Tuple[str, str, str], Dict[str, Any]], Dict[str, Tuple[int, int]]]:
    segs: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
    points: Dict[str, Tuple[int, int]] = {}
    for path in sorted((ROOT / "content" / "world").glob("ch*/map.yaml")):
        mp = json.loads(path.read_text(encoding="utf-8"))["actions"][0]["map"]
        ch = path.parent.name
        for n in mp["nodes"]:
            points.setdefault(n["id"], tuple(n["point"]))
        for r in mp["roads"]:
            key = (r["key"], r["start"], r["end"])
            rec = segs.setdefault(key, {"kind": r["kind"], "chapters": [], "points": [tuple(p) for p in r["points"]]})
            rec["chapters"].append(ch)
    return segs, points


# ---------------------------------------------------------------- cost raster
class CostGrid:
    def __init__(self, params: Dict[str, Any]):
        self.p = params
        r = int(params["cells_per_grid"])
        self.r = r
        self.W, self.H = 512 * r, 384 * r
        self.proj = geo.Proj(self.W, self.H)
        box = params["region_box_lonlat"]
        prj = lambda ring: np.column_stack(self.proj.fwd(ring[:, 0], ring[:, 1]))  # noqa: E731
        land_rings = [prj(p) for _, p in geo.parts_in_box("ne_10m_land", box)]
        minor_rings = [prj(p) for _, p in geo.parts_in_box("ne_10m_minor_islands", box)]
        cfg = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
        wcfg = cfg["water"]
        keep_res, drop = set(wcfg["keep_reservoir_names"]), set(wcfg["exclude_lake_names"])

        def keep_lake(props):
            name = props.get("name") or ""
            if name in drop:
                return False
            return not (wcfg["exclude_reservoir_class"] and props.get("featurecla") == "Reservoir" and name not in keep_res)

        lakes = []
        for props, part in geo.parts_in_box("ne_10m_lakes", box, keep_lake):
            if any(_point_in_ring(pt, part) for pt in wcfg["exclude_lake_points"]):
                continue
            lakes.append(part)
        hist = set(wcfg["historic_lakes"])
        lakes += [part for _, part in geo.parts_in_box("ne_10m_lakes_historic", box, lambda q: (q.get("name") or "") in hist)]
        lake_rings = [prj(p) for p in lakes]
        win = raster.Window(0, 0, self.W, self.H)
        land = np.maximum(raster.rasterize_rings(land_rings, win, ss=2), raster.rasterize_rings(minor_rings, win, ss=2))
        lake = raster.rasterize_rings(lake_rings, win, ss=2)
        self.land = (land * (1 - lake)) >= 0.5
        cell_km = 6371.0088 / self.proj.cp.scale
        self.cell_km = cell_km
        water = ~self.land
        self.water_depth = ndimage.distance_transform_edt(water).astype(np.float32)  # cells to nearest land cell
        dist_to_land = self.water_depth * cell_km
        self.ferry = water & (dist_to_land <= params["ferry_max_km"] / 2.0)

        # relief from the 1' DEM: slope magnitude (rise/run) with metric spacing
        dem = np.nan_to_num(geo.load_dem(), nan=-60.0).astype(np.float64)
        dem = np.maximum(dem, 0.0)
        dem = ndimage.gaussian_filter(dem, params["slope_blur_dem_cells"])
        rows = np.arange(dem.shape[0])
        lat = geo.DEM_META["lat_edge_north"] - (rows + 0.5) * geo.DEM_META["cell_deg"]
        dy_m = geo.DEM_META["cell_deg"] * 111_195.0
        dx_m = dy_m * np.cos(np.radians(lat))[:, None]
        gy, gx = np.gradient(dem)
        slope = np.hypot(gx / dx_m, gy / dy_m)
        ys = (np.arange(self.H) + 0.5)
        xs = (np.arange(self.W) + 0.5)
        X, Y = np.meshgrid(xs, ys)
        lon, lat_c = self.proj.inv(X, Y)
        ri, ci = geo.dem_index(lon, lat_c)
        self.elev = ndimage.map_coordinates(dem, [ri, ci], order=1, mode="nearest").astype(np.float32)
        self.slope = ndimage.map_coordinates(slope, [ri, ci], order=1, mode="nearest").astype(np.float32)
        floor = ndimage.minimum_filter(dem, size=int(params["valley_window_dem_cells"]))
        above = ndimage.gaussian_filter(dem - floor, 1.0)
        self.above = ndimage.map_coordinates(above, [ri, ci], order=1, mode="nearest").astype(np.float32)

        plateau = raster.smoothstep(params["plateau_from_m"], params["plateau_full_m"], self.elev)
        cost = ((1.0 + params["slope_k"] * self.slope.astype(np.float64) ** 2)
                * (1.0 + params["valley_k"] * self.above.astype(np.float64) / 1000.0)
                * (1.0 + params["plateau_k"] * plateau))

        # major rivers: one-time crossing cost (4-connected 2-px band so diagonals cannot slip through)
        promote = {tuple(x) for x in params["river_major_names"]}
        riv = Image.new("L", (self.W, self.H), 0)
        draw = ImageDraw.Draw(riv)
        for props, part in geo.parts_in_box("ne_10m_rivers_lake_centerlines", box):
            sr = props.get("scalerank")
            if sr is None:
                continue
            if sr <= params["river_major_max_scalerank"] or (props.get("name"), props.get("name_zh")) in promote:
                line = prj(part)
                draw.line([tuple(pt) for pt in line.tolist()], fill=255, width=2)
        self.river = (np.asarray(riv) > 0) & self.land
        cost = cost + params["river_cross"] * self.river
        cost = np.where(self.land, cost, np.where(self.ferry, params["ferry_cost"], np.inf))
        self.cost = cost

    def cell_of(self, gx: float, gy: float) -> Tuple[int, int]:
        return int(min(self.H - 1, max(0, math.floor(gy * self.r)))), int(min(self.W - 1, max(0, math.floor(gx * self.r))))


def _point_in_ring(pt, ring) -> bool:
    x, y = pt
    xs, ys = ring[:, 0], ring[:, 1]
    xj, yj = np.roll(xs, 1), np.roll(ys, 1)
    cond = (ys > y) != (yj > y)
    with np.errstate(divide="ignore", invalid="ignore"):
        cross = (xj - xs) * (y - ys) / (yj - ys) + xs
    return bool(np.count_nonzero(cond & (x < cross)) % 2)


# ---------------------------------------------------------------- geometry
def dp_simplify(pts: np.ndarray, tol: float) -> np.ndarray:
    if len(pts) < 3:
        return pts
    keep = np.zeros(len(pts), dtype=bool)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        a, b = pts[i], pts[j]
        ab = b - a
        L = math.hypot(ab[0], ab[1])
        seg = pts[i + 1:j]
        if L < 1e-12:
            d = np.hypot(seg[:, 0] - a[0], seg[:, 1] - a[1])
        else:
            d = np.abs(ab[0] * (seg[:, 1] - a[1]) - ab[1] * (seg[:, 0] - a[0])) / L
        k = int(np.argmax(d))
        if d[k] > tol:
            m = i + 1 + k
            keep[m] = True
            stack.append((i, m))
            stack.append((m, j))
    return pts[keep]


def chaikin_fixed(pts: np.ndarray, iterations: int) -> np.ndarray:
    out = pts
    for _ in range(iterations):
        if len(out) < 3:
            break
        q = 0.75 * out[:-1] + 0.25 * out[1:]
        r = 0.25 * out[:-1] + 0.75 * out[1:]
        mid = np.empty((2 * len(q), 2))
        mid[0::2] = q
        mid[1::2] = r
        out = np.vstack([out[:1], mid[1:-1], out[-1:]])
    return out


def sample_polyline(pts: np.ndarray, step: float) -> np.ndarray:
    out = [pts[0]]
    for a, b in zip(pts[:-1], pts[1:]):
        L = math.hypot(*(b - a))
        n = max(1, int(math.ceil(L / step)))
        for t in range(1, n + 1):
            out.append(a + (b - a) * (t / n))
    return np.array(out)


def polyline_length(pts: np.ndarray) -> float:
    d = np.diff(pts, axis=0)
    return float(np.hypot(d[:, 0], d[:, 1]).sum())


# ---------------------------------------------------------------- solve
def solve(grid: CostGrid, segs, points, params) -> Tuple[Dict[Tuple[str, str, str], np.ndarray], Dict[Tuple[str, str, str], Dict[str, Any]]]:
    from skimage.graph import MCP_Geometric

    land_dist, (land_r, land_c) = ndimage.distance_transform_edt(~grid.land, return_indices=True)
    by_start: Dict[str, List[Tuple[str, str, str]]] = defaultdict(list)
    for key in sorted(segs):
        by_start[key[1]].append(key)
    paths: Dict[Tuple[str, str, str], np.ndarray] = {}
    qa: Dict[Tuple[str, str, str], Dict[str, Any]] = {}
    r = grid.r

    def snap(node: str) -> Tuple[int, int]:
        rr, cc = grid.cell_of(*points[node])
        if not grid.land[rr, cc]:
            rr, cc = int(land_r[rr, cc]), int(land_c[rr, cc])
        return rr, cc

    def snap_xy(pt) -> Tuple[int, int]:
        rr, cc = grid.cell_of(*pt)
        if not grid.land[rr, cc]:
            rr, cc = int(land_r[rr, cc]), int(land_c[rr, cc])
        return rr, cc

    # legs: (from_cell, to_cell) -> traced cells; roads without waypoints share one MCP run per start node
    traced: Dict[Tuple[Tuple[int, int], Tuple[int, int]], np.ndarray] = {}
    for start in sorted(by_start):
        keys = [k for k in by_start[start] if not (params["use_content_waypoints"] and len(segs[k]["points"]) > 2)]
        if not keys:
            continue
        s_cell = snap(start)
        ends = [snap(k[2]) for k in keys]
        mcp = MCP_Geometric(grid.cost, fully_connected=True)
        mcp.find_costs([s_cell], ends, find_all_ends=True)
        for e_cell in ends:
            traced[(s_cell, e_cell)] = np.array(mcp.traceback(e_cell), dtype=np.float64)
    for key in sorted(segs):
        if not (params["use_content_waypoints"] and len(segs[key]["points"]) > 2):
            continue
        cells_via = [snap(key[1])] + [snap_xy(pt) for pt in segs[key]["points"][1:-1]] + [snap(key[2])]
        for a_cell, b_cell in zip(cells_via[:-1], cells_via[1:]):
            if (a_cell, b_cell) not in traced:
                mcp = MCP_Geometric(grid.cost, fully_connected=True)
                mcp.find_costs([a_cell], [b_cell])
                traced[(a_cell, b_cell)] = np.array(mcp.traceback(b_cell), dtype=np.float64)

    for key in sorted(segs):
        if params["use_content_waypoints"] and len(segs[key]["points"]) > 2:
            cells_via = [snap(key[1])] + [snap_xy(pt) for pt in segs[key]["points"][1:-1]] + [snap(key[2])]
        else:
            cells_via = [snap(key[1]), snap(key[2])]
        parts = [traced[(a_cell, b_cell)] for a_cell, b_cell in zip(cells_via[:-1], cells_via[1:])]
        cells = np.vstack([parts[0]] + [p_[1:] for p_ in parts[1:]])
        raw = np.column_stack([(cells[:, 1] + 0.5) / r, (cells[:, 0] + 0.5) / r])
        p0 = np.array(points[key[1]], dtype=np.float64)
        p1 = np.array(points[key[2]], dtype=np.float64)
        raw = np.vstack([p0, raw, p1])
        shore = params["shore_tolerance_grid"] * r
        crossing = {(int(a), int(b)) for a, b in cells.astype(int) if grid.water_depth[int(a), int(b)] > shore}
        allowed = set()
        for a, b in crossing:
            for da in range(-3, 4):
                for db in range(-3, 4):
                    allowed.add((a + da, b + db))

        def bad_water(poly: np.ndarray) -> int:
            n = 0
            for x, y in sample_polyline(poly, params["validate_step_grid"])[1:-1]:
                rr, cc = int(min(grid.H - 1, max(0, y * r))), int(min(grid.W - 1, max(0, x * r)))
                if grid.water_depth[rr, cc] > shore and (rr, cc) not in allowed:
                    n += 1
            return n

        chosen = None
        for tol, smooth in ((params["dp_tolerance_grid"], params["chaikin_iterations"]),
                            (params["dp_tolerance_grid"], 0),
                            (params["dp_tolerance_grid"] / 2, 0),
                            (params["dp_tolerance_grid"] / 6, 0)):
            cand = dp_simplify(raw, tol)
            cand = chaikin_fixed(cand, smooth)
            cand[0], cand[-1] = p0, p1
            if bad_water(cand) == 0:
                chosen = (cand, tol, smooth)
                break
        if chosen is None:
            cand = raw.copy()
            chosen = (cand, 0.0, 0)
        path = np.round(chosen[0], 2)
        path[0], path[-1] = p0, p1
        # drop consecutive duplicates after rounding
        keep = [0] + [i for i in range(1, len(path)) if not np.allclose(path[i], path[i - 1])]
        path = path[keep]
        if not np.array_equal(path[-1], p1):
            path = np.vstack([path, p1])
        paths[key] = path
        straight = float(math.hypot(*(p1 - p0)))
        smp = sample_polyline(path, params["validate_step_grid"])
        rows_ = np.clip((smp[:, 1] * r).astype(int), 0, grid.H - 1)
        cols_ = np.clip((smp[:, 0] * r).astype(int), 0, grid.W - 1)
        wet = grid.water_depth[rows_, cols_] > params["shore_tolerance_grid"] * r
        # length (grid units) of samples farther than the shore tolerance into sea / lake
        wet_len = float(wet[1:-1].sum()) * params["validate_step_grid"]
        qa[key] = {
            "length": round(polyline_length(path), 2),
            "straight": round(straight, 2),
            "ratio": round(polyline_length(path) / straight, 3) if straight > 1e-9 else 1.0,
            "water_len_grid": round(wet_len, 2),
            "ferry": bool(wet_len > 0),
            "max_slope_pct": round(float(grid.slope[rows_, cols_].max()) * 100, 1),
            "dp_tolerance": chosen[1],
            "smoothing": chosen[2],
            "vertices": int(len(path)),
            "start_snapped": bool(not grid.land[grid.cell_of(*points[key[1]])]),
            "end_snapped": bool(not grid.land[grid.cell_of(*points[key[2]])]),
        }
    return paths, qa


def build_document(segs, paths, params) -> Dict[str, Any]:
    by_key: Dict[str, List[Tuple[str, str, str]]] = defaultdict(list)
    for key in segs:
        by_key[key[0]].append(key)
    main: Dict[str, Any] = {}
    variants: Dict[str, Any] = {}
    for k in sorted(by_key):
        options = sorted(by_key[k], key=lambda kk: (-len(segs[kk]["chapters"]), kk[1], kk[2]))
        main[k] = paths[options[0]].tolist()
        if len(options) > 1:
            variants[k] = [{"start": kk[1], "end": kk[2], "chapters": sorted(set(segs[kk]["chapters"])),
                            "path": paths[kk].tolist()} for kk in options]
    return {
        "schema": "tianshu.road-paths.v1",
        "grid": {"width": 512, "height": 384},
        "generator": "tools/map/paint/road_paths.py",
        "params": params,
        "notes": ("显示几何（AR-113）：每条路段在 ETOPO 2022 60″ 坡度 / 海拔与 Natural Earth 10m 水体上的最省力路线，"
                  "首末点等于 road.start / road.end 节点的 point（按 start→end 方向）；只改画法，里程与 core 规则不变。"
                  "同一个 road.key 在个别章节端点不同（该章开放节点不同、路线分段不同）：paths[key] 给出现章节最多的那一种，"
                  "variants[key] 逐一列出该 key 的全部端点组合及所在章节，端点与 paths[key] 不符时按 variants 取。"),
        "paths": main,
        "variants": variants,
    }


def _num(v: float) -> str:
    t = f"{float(v):.2f}".rstrip("0").rstrip(".")
    return "0" if t in ("-0", "") else t


def _path_json(path) -> str:
    return "[" + ",".join(f"[{_num(x)},{_num(y)}]" for x, y in path) + "]"


def dumps(doc: Dict[str, Any]) -> bytes:
    """Stable, diff-friendly JSON: one road per line, coordinates with at most two decimals."""
    head = {k: doc[k] for k in ("schema", "grid", "generator", "params", "notes")}
    lines = ["{"]
    for k, v in head.items():
        lines.append(f" {json.dumps(k)}: {json.dumps(v, ensure_ascii=False, sort_keys=True)},")
    lines.append(' "paths": {')
    keys = list(doc["paths"])
    for i, k in enumerate(keys):
        lines.append(f"  {json.dumps(k, ensure_ascii=False)}: {_path_json(doc['paths'][k])}" + ("," if i < len(keys) - 1 else ""))
    lines.append(" },")
    lines.append(' "variants": {')
    vkeys = list(doc["variants"])
    for i, k in enumerate(vkeys):
        items = []
        for var in doc["variants"][k]:
            items.append("{" + f"\"start\": {json.dumps(var['start'])}, \"end\": {json.dumps(var['end'])}, "
                         f"\"chapters\": {json.dumps(var['chapters'])}, \"path\": {_path_json(var['path'])}" + "}")
        lines.append(f"  {json.dumps(k, ensure_ascii=False)}: [" + ", ".join(items) + "]" + ("," if i < len(vkeys) - 1 else ""))
    lines.append(" }")
    lines.append("}")
    text = "\n".join(lines) + "\n"
    json.loads(text)  # must stay valid JSON
    return text.encode("utf-8")


# ---------------------------------------------------------------- QA images
def _font(size: int):
    return ImageFont.truetype(FONT, size)


def draw_paths(base: Image.Image, scale: float, ox: float, oy: float, segs, paths, show_old=True, show_new=True,
               w_old=2, w_new=3):
    im = base.copy()
    d = ImageDraw.Draw(im, "RGBA")
    for key in sorted(segs):
        if show_old:
            pts = [((x - ox) * scale, (y - oy) * scale) for x, y in segs[key]["points"]]
            d.line(pts, fill=(200, 40, 40, 200), width=w_old)
        if show_new:
            pts = [((x - ox) * scale, (y - oy) * scale) for x, y in paths[key].tolist()]
            d.line(pts, fill=(30, 50, 120, 235), width=w_new, joint="curve")
    return im


def qa_images(segs, paths, points) -> List[Path]:
    QA.mkdir(parents=True, exist_ok=True)
    base_full = Image.open(BASE_MAP).convert("RGB")
    out = []
    small = base_full.resize((2048, 1536), Image.Resampling.LANCZOS)
    s = 2048 / 512
    left = draw_paths(small, s, 0, 0, segs, paths, show_old=True, show_new=False, w_old=3)
    right = draw_paths(small, s, 0, 0, segs, paths, show_old=False, show_new=True, w_new=3)
    sheet = Image.new("RGB", (2 * 2048 + 30, 1536 + 60), (245, 241, 232))
    sheet.paste(left, (10, 50))
    sheet.paste(right, (2048 + 20, 50))
    d = ImageDraw.Draw(sheet)
    d.text((10, 10), "旧：路段直线（content/world map.yaml 的 points）", fill=(60, 50, 40), font=_font(30))
    d.text((2048 + 20, 10), "新：最省力路线（docs/design/map/road_paths.json）", fill=(60, 50, 40), font=_font(30))
    path = QA / "roads_before_after.jpg"
    sheet.save(path, quality=86)
    out.append(path)
    overlay = draw_paths(small, s, 0, 0, segs, paths, show_old=True, show_new=True, w_old=2, w_new=3)
    path = QA / "roads_overlay.jpg"
    overlay.save(path, quality=86)
    out.append(path)
    regions = {
        "关中—汉中（蜀道）": ("city_xian", "city_hanzhong", "city_bazhong", "city_chengdu"),
        "河西走廊": ("city_lanzhou", "city_wuwei", "city_zhangye", "city_jiuquan", "city_dunhuang"),
        "太行": ("city_taiyuan", "city_changzhi", "city_jincheng", "city_zhengding", "city_jiaozuo", "city_anyang"),
        "大理—拉萨": ("city_dali", "city_lijiang", "city_qamdo", "city_lhasa", "city_yushu"),
        "广州—海口": ("city_guangzhou", "city_zhaoqing", "city_haikou", "city_sanya"),
    }
    W = base_full.width
    k = W / 512
    for name, ids in regions.items():
        xs = [points[i][0] for i in ids if i in points]
        ys = [points[i][1] for i in ids if i in points]
        pad = 12
        gx0, gx1 = min(xs) - pad, max(xs) + pad
        gy0, gy1 = min(ys) - pad, max(ys) + pad
        z = 2.0  # enlarge the 100% crop for review
        crop = base_full.crop((int(gx0 * k), int(gy0 * k), int(gx1 * k), int(gy1 * k)))
        crop = crop.resize((int(crop.width * z), int(crop.height * z)), Image.Resampling.LANCZOS)
        sub = {kk: v for kk, v in segs.items()
               if any(gx0 <= x <= gx1 and gy0 <= y <= gy1 for x, y in v["points"])}
        img = draw_paths(crop, k * z, gx0, gy0, sub, paths, show_old=True, show_new=True, w_old=3, w_new=5)
        canvas = Image.new("RGB", (img.width, img.height + 44), (245, 241, 232))
        canvas.paste(img, (0, 44))
        d = ImageDraw.Draw(canvas)
        d.text((8, 8), f"{name}（底图 100% 放大 2 倍）  红 = 旧直线  蓝 = 新路线", fill=(60, 50, 40), font=_font(24))
        img = canvas
        path = QA / f"roads_{name.split('（')[0].replace('—', '_')}.jpg"
        img.save(path, quality=90)
        out.append(path)
    return out


# ---------------------------------------------------------------- main
def build() -> Tuple[Dict[str, Any], Dict, Dict, Dict]:
    segs, points = load_segments()
    issues = geo.verify_inputs()
    if issues:
        raise SystemExit("inputs: " + "; ".join(issues))
    grid = CostGrid(PARAMS)
    paths, qa = solve(grid, segs, points, PARAMS)
    doc = build_document(segs, paths, PARAMS)
    return doc, segs, paths, qa


def main(argv: Sequence[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--no-images", action="store_true")
    args = ap.parse_args(argv)
    doc, segs, paths, qa = build()
    payload = dumps(doc)
    # structural checks
    _, points = load_segments()
    errors = []
    for key, path in paths.items():
        if tuple(path[0]) != tuple(map(float, points[key[1]])) or tuple(path[-1]) != tuple(map(float, points[key[2]])):
            errors.append(f"endpoint mismatch {key}")
    if args.check:
        same = OUT.is_file() and OUT.read_bytes() == payload
        print("road_paths.json reproducible:", "ok" if same else "DIFFERS")
        print("endpoints exact:", "ok" if not errors else errors[:5])
        return 0 if same and not errors else 1
    if errors:
        print("\n".join(errors))
        return 1
    OUT.write_bytes(payload)
    print("wrote", OUT, len(payload), "bytes sha256", hashlib.sha256(payload).hexdigest())
    rows = []
    for key in sorted(qa):
        q = dict(qa[key])
        q.update({"key": key[0], "start": key[1], "end": key[2], "kind": segs[key]["kind"], "chapters": len(set(segs[key]["chapters"]))})
        rows.append(q)
    ratios = np.array([q["ratio"] for q in rows])
    summary = {
        "segments": len(rows),
        "keys": len(doc["paths"]),
        "keys_with_variants": len(doc["variants"]),
        "ratio_percentiles": {str(p): round(float(np.percentile(ratios, p)), 3) for p in (0, 10, 25, 50, 75, 90, 100)},
        "ratio_bins": dict(Counter("<1.05" if r < 1.05 else "1.05-1.2" if r < 1.2 else "1.2-1.5" if r < 1.5 else "1.5-2" if r < 2 else ">=2" for r in ratios)),
        "touch_water": [f"{q['key']} {q['start']}>{q['end']} {q['water_len_grid']}" for q in rows if q["ferry"]],
        "snapped_endpoints": [f"{q['key']} {q['start']}>{q['end']}" for q in rows if q["start_snapped"] or q["end_snapped"]],
        "max_slope_pct_percentiles": {str(p): round(float(np.percentile([q['max_slope_pct'] for q in rows], p)), 1) for p in (50, 90, 100)},
        "sha256": hashlib.sha256(payload).hexdigest(),
    }
    QA.mkdir(parents=True, exist_ok=True)
    (QA / "road_paths_qa.json").write_text(json.dumps({"summary": summary, "roads": rows}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=1))
    if not args.no_images:
        for p in qa_images(segs, paths, points):
            print("image", p)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
