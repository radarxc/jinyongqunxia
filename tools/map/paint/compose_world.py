#!/usr/bin/env python3
"""Deterministic painted world map for the jianghu grid (AR-111).

Draws the whole 4:3 grid extent (``CanvasProjection(W, H, 18*W/512)``) from
GIS data (Natural Earth 10m coast / islands / lakes / rivers, ETOPO 2022 60"
relief) using only existing ink-wash art from the repository:
``assets/default/map/kit`` vignettes, ``assets/default/map/tiles`` fills and
edge strips.  No AI generation happens here; the same inputs and seed give the
same bytes.

    python3 tools/map/paint/compose_world.py --sample east          # sample window
    python3 tools/map/paint/compose_world.py --full                 # 4096x3072 map
    python3 tools/map/paint/compose_world.py --check                # self-tests + hashes
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import geo  # noqa: E402
import raster  # noqa: E402
import sprites  # noqa: E402
from raster import Window, rng_for, smoothstep  # noqa: E402

CONFIG_PATH = HERE / "config.json"
WORK = geo.ROOT / ".agents" / "coord" / "ART-worldmap-painted"
T0 = time.time()


def log(msg: str) -> None:
    print(f"[{time.time() - T0:7.1f}s] {msg}", flush=True)


# ====================================================================== world
class World:
    """Global (window-independent) geometry, analysis fields and placements."""

    def __init__(self, cfg: Dict[str, Any], width: Optional[int] = None):
        self.cfg = cfg
        self.W = int(width or cfg["canvas"]["width"])
        self.H = self.W * 3 // 4
        self.k = self.W / 4096.0
        self.seed = int(cfg["seed"])
        self.proj = geo.Proj(self.W, self.H)
        self._vectors()
        log("vectors ready")
        self._materials()
        self._analysis()
        log("analysis fields ready")
        self._place_mountains()
        log(f"mountains placed: {len(self.peaks)}")
        self._place_sea_decor()
        log(f"sea decor placed: {len(self.sea_decor)}")
        self._place_plains()
        log(f"plains: trees {len(self.tree_marks)}, patches {len(self.patches)}")

    # ------------------------------------------------------------ vectors
    def _project(self, ring: np.ndarray) -> np.ndarray:
        x, y = self.proj.fwd(ring[:, 0], ring[:, 1])
        return np.column_stack([x, y])

    def _vectors(self) -> None:
        cfg = self.cfg
        box = cfg["region_box_lonlat"]
        self.land_rings = [self._project(p) for _, p in geo.parts_in_box("ne_10m_land", box)]
        self.minor_rings = [self._project(p) for _, p in geo.parts_in_box("ne_10m_minor_islands", box)]

        wcfg = cfg["water"]
        keep_res = set(wcfg["keep_reservoir_names"])
        drop_names = set(wcfg["exclude_lake_names"])

        def keep_lake(props):
            name = props.get("name") or ""
            if name in drop_names:
                return False
            if wcfg["exclude_reservoir_class"] and props.get("featurecla") == "Reservoir" and name not in keep_res:
                return False
            return True

        lakes = []
        for props, part in geo.parts_in_box("ne_10m_lakes", box, keep_lake):
            if any(_point_in_ring(pt, part) for pt in wcfg["exclude_lake_points"]):
                continue
            lakes.append(part)
        hist = set(wcfg["historic_lakes"])
        for props, part in geo.parts_in_box("ne_10m_lakes_historic", box, lambda p: (p.get("name") or "") in hist):
            lakes.append(part)
        self.lake_rings = [self._project(p) for p in lakes]

        rcfg = cfg["rivers"]
        skip = set(rcfg["skip_featurecla"])
        promote = {tuple(pair) for pair in rcfg["major_names"]}
        extra = {tuple(pair) for pair in rcfg["extra_names"]}

        def keep_river(p):
            if p.get("scalerank") is None or (p.get("featurecla") or "") in skip:
                return False
            key = (p.get("name"), p.get("name_zh"))
            return p["scalerank"] <= rcfg["max_scalerank"] or key in promote or key in extra

        self.rivers: List[Tuple[int, np.ndarray, bool]] = []
        self.named_river_lines: List[np.ndarray] = []  # extra / traced rivers: mountains keep off them too
        for props, part in geo.parts_in_box("ne_10m_rivers_lake_centerlines", box, keep_river):
            line = self._project(part)
            line = raster.decimate(line, rcfg["decimate_px"] * self.k)
            line = raster.chaikin(line, rcfg["chaikin_iterations"])
            key = (props.get("name"), props.get("name_zh"))
            rank = int(props["scalerank"])
            if key in extra and rank > rcfg["max_scalerank"]:
                rank = int(rcfg["extra_rank"])  # named tributaries (渭河、汾河…) drawn at the tributary width
            major = rank <= rcfg["major_max_scalerank"] or key in promote
            self.rivers.append((rank, line, major))
            if key in extra:
                self.named_river_lines.append(line)
        # rivers Natural Earth lacks, traced from ETOPO (tools/map/paint/trace_rivers.py)
        supplement = json.loads((HERE / rcfg["supplement_file"]).read_text(encoding="utf-8"))
        for row in supplement["rivers"]:
            line = self._project(np.asarray(row["line"], dtype=np.float64))
            line = raster.decimate(line, rcfg["decimate_px"] * self.k)
            line = raster.chaikin(line, rcfg["chaikin_iterations"])
            self.rivers.append((int(rcfg["extra_rank"]), line, False))
            self.named_river_lines.append(line)
        self.rivers.sort(key=lambda item: (item[2], -item[0]))  # minor first, majors on top

        # coast polylines for strips / ink
        ccfg = cfg["coast"]
        self.coast_lines: List[np.ndarray] = []
        self.coast_major: List[bool] = []
        for ring in self.land_rings + self.minor_rings:
            line = raster.decimate(ring, ccfg["decimate_px"] * self.k, closed=True)
            if len(line) < 4:
                continue
            self.coast_lines.append(line)
            self.coast_major.append(raster.ring_length(line) >= ccfg["minor_ring_len_px"] * self.k)
        self.lake_lines = [raster.decimate(r, ccfg["decimate_px"] * self.k, closed=True) for r in self.lake_rings]

        # geography regions for land classes
        cls = cfg["classes"]
        self.desert_rings: List[np.ndarray] = []
        self.gobi_rings: List[np.ndarray] = []
        self.basin_rings: Dict[str, List[np.ndarray]] = {name: [] for name in cls["basin_floor_desert"]}
        self.steppe_rings: List[np.ndarray] = []
        for props, part in geo.parts_in_box("ne_10m_geography_regions_polys", box):
            name = props.get("name") or ""
            fc = props.get("featurecla") or ""
            if fc == "Desert" and name not in cls["exclude_desert_names"]:
                (self.gobi_rings if name == "GOBI DESERT" else self.desert_rings).append(self._project(part))
            if name in self.basin_rings:
                self.basin_rings[name].append(self._project(part))
            if name in ("MONGOLIAN PLATEAU", "KAZAKH STEPPE", "KAZAKH UPLAND"):
                self.steppe_rings.append(self._project(part))
        for pts in cls["extra_deserts"].values():
            self.desert_rings.append(self._project(np.array(pts + pts[:1], dtype=np.float64)))

    # ------------------------------------------------------------ materials
    def _materials(self) -> None:
        cfg = self.cfg
        ww = cfg["mountains"].get("warm_whites")
        sprites.WARM_WHITES = ((tuple(c / 255.0 for c in ww["color"]), float(ww["strength"]),
                                float(ww.get("alpha_cut", 0.0)), float(ww.get("lum_from", 0.8))) if ww else None)
        names = sorted({n for group in cfg["kit"].values() for n in group} | set(cfg["sea"]["decor"]["kinds"]))
        self.kit = sprites.load_kit(names)
        self.tiles = {cls: [sprites.load_tile(n) for n in names_] for cls, names_ in cfg["tiles"].items()}
        strip_names = {cfg["coast"]["strip_major"], cfg["coast"]["strip_minor"], cfg["lakeshore"]["strip"],
                       cfg["rivers"]["strip_thick"], cfg["rivers"]["strip_thin"]}
        self.strips = {n: sprites.load_strip(n) for n in sorted(strip_names)}
        self.strip_bands = {n: raster.strip_band(s) for n, s in self.strips.items()}
        self.puffs = sprites.mist_puffs(self.seed)
        self.trees = sprites.baseline_tree_stamps(cfg["trees"])
        patch_names = [n for n in cfg["plain_patches"]["kinds"] if n not in self.kit]
        self.kit.update(sprites.load_kit(patch_names))

    # ------------------------------------------------------------ analysis grid
    def _analysis(self) -> None:
        cfg = self.cfg
        a = max(1, int(round(cfg["analysis"]["cell_px"] * self.k)))
        m = int(cfg["analysis"]["margin_cells"])
        self.a, self.m = a, m
        gw = -(-self.W // a) + 2 * m
        gh = -(-self.H // a) + 2 * m
        self.gwin = Window(-m, -m, gw - m, gh - m)
        cx = (np.arange(gw) - m + 0.5) * a
        cy = (np.arange(gh) - m + 0.5) * a
        X, Y = np.meshgrid(cx, cy)
        lon, lat = self.proj.inv(X, Y)
        self.g_lon, self.g_lat = lon.astype(np.float32), lat.astype(np.float32)

        dem = geo.load_dem()
        dem0 = np.nan_to_num(dem, nan=-60.0).astype(np.float32)
        r, c = geo.dem_index(lon, lat)
        dem_s = ndimage.gaussian_filter(dem0, 1.2)
        self.g_elev = ndimage.map_coordinates(dem_s, [r, c], order=1, mode="nearest").astype(np.float32)
        mc = cfg["mountains"]
        n = int(mc["relief_window_cells"])
        demp = np.maximum(dem0, 0.0)
        relief = ndimage.maximum_filter(demp, size=n) - ndimage.minimum_filter(demp, size=n)
        relief = ndimage.gaussian_filter(relief, 1.0)
        self.g_relief = ndimage.map_coordinates(relief, [r, c], order=1, mode="nearest").astype(np.float32)

        scale = 1.0 / a
        land_main = raster.rasterize_rings(self.land_rings, self.gwin, ss=2, scale=scale)
        land_minor = raster.rasterize_rings(self.minor_rings, self.gwin, ss=2, scale=scale)
        lake = raster.rasterize_rings(self.lake_rings, self.gwin, ss=2, scale=scale)
        self.g_landraw = np.maximum(land_main, land_minor)
        self.g_lake = lake
        self.g_land = self.g_landraw * (1.0 - lake)

        # basin / plain floor: height above the local low band (10th percentile within ~floor_radius)
        fr = int(cfg["mountains"]["floor_window_cells"])
        e_land = np.where(self.g_landraw > 0.5, self.g_elev, np.nan)
        coarse = e_land[::4, ::4]
        coarse = np.where(np.isnan(coarse), np.nanmax(coarse[np.isfinite(coarse)]) if np.isfinite(coarse).any() else 0.0, coarse)
        low_c = ndimage.percentile_filter(coarse, 10, size=max(3, fr // 4 | 1))
        low = ndimage.zoom(low_c, 4, order=1)[:gh, :gw]
        if low.shape != self.g_elev.shape:
            low = np.pad(low, ((0, gh - low.shape[0]), (0, gw - low.shape[1])), mode="edge")
        self.g_floor = (self.g_elev - low).astype(np.float32)

        # high flat plateaus (青藏、帕米尔、羌塘、可可西里): the 15 km relief window sees little there, so the
        # mountains on them come from GIS prominence above the plateau base instead (see _place_plateau)
        pc = cfg["plateau"]
        cell_km = 6371.0088 / self.proj.cp.scale * a
        elev_s = ndimage.gaussian_filter(self.g_elev, pc["zone_smooth_km"] / cell_km)
        relief_s = ndimage.gaussian_filter(self.g_relief, pc["zone_relief_smooth_km"] / cell_km)
        zone = (elev_s >= pc["zone_min_m"]) & (relief_s < pc["zone_max_relief_m"]) & (self.g_landraw > 0.5)
        lab, n_lab = ndimage.label(zone)
        if n_lab:
            counts = np.bincount(lab.ravel())
            small = counts < pc["zone_min_cells"]
            small[0] = False
            zone &= ~small[lab]
        # crest elevation: max of the lightly smoothed 1' DEM within ~crest_window_km, so narrow ridges survive
        crest_cells = max(1, int(round(pc["crest_window_km"] / 1.85))) | 1
        crest_dem = ndimage.maximum_filter(dem_s, size=crest_cells)
        self.g_crest = ndimage.map_coordinates(crest_dem, [r, c], order=1, mode="nearest").astype(np.float32)
        prom = np.zeros_like(self.g_elev)
        if zone.any():
            size = int(round(pc["base_window_km"] / cell_km)) | 1
            rows = np.nonzero(zone.any(axis=1))[0]
            cols = np.nonzero(zone.any(axis=0))[0]
            r0, r1 = max(0, rows[0] - size), min(gh, rows[-1] + size + 1)
            c0, c1 = max(0, cols[0] - size), min(gw, cols[-1] + size + 1)
            base = ndimage.percentile_filter(self.g_elev[r0:r1, c0:c1], pc["base_percentile"], size=size)
            prom[r0:r1, c0:c1] = self.g_crest[r0:r1, c0:c1] - base
        self.g_zone = zone
        self.g_prom = np.where(zone, prom, 0.0).astype(np.float32)

        # free land run northward / sideways (cells) so sprites can be fitted on islands
        landb = self.g_landraw > 0.5
        self.g_run_n = _run_length(landb, axis=0)
        left = _run_length(landb, axis=1)
        right = _run_length(landb[:, ::-1], axis=1)[:, ::-1]
        self.g_run_w = np.minimum(left, right)

        # intensity of mountains
        rl = np.clip((self.g_relief - mc["relief_lo_m"]) / (mc["relief_hi_m"] - mc["relief_lo_m"]), 0, 1) ** mc["relief_gamma"]
        boost = mc["elev_boost"] * smoothstep(mc["elev_boost_from_m"], mc["elev_boost_full_m"], self.g_elev)
        self.g_int = np.clip(rl + boost * (rl > 0.02), 0, 1).astype(np.float32)

        # ridge orientation from the structure tensor of smoothed elevation
        es = ndimage.gaussian_filter(self.g_elev, mc["orient_blur_cells"])
        gy, gx = np.gradient(es)
        s2 = mc["orient_blur_cells"] * 1.5
        jxx = ndimage.gaussian_filter(gx * gx, s2)
        jxy = ndimage.gaussian_filter(gx * gy, s2)
        jyy = ndimage.gaussian_filter(gy * gy, s2)
        theta_grad = 0.5 * np.arctan2(2 * jxy, jxx - jyy)          # image coords (y down)
        ridge = theta_grad + np.pi / 2
        self.g_angle = np.mod(-np.degrees(ridge), 180.0).astype(np.float32)  # math coords (y up)
        self.g_aniso = (np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2) / (jxx + jyy + 1e-3)).astype(np.float32)

        # rivers corridor (analysis grid)
        rc = cfg["rivers"]
        corridor = Image.new("L", (gw * 2, gh * 2), 0)
        corridor_major = Image.new("L", (gw * 2, gh * 2), 0)
        draw = ImageDraw.Draw(corridor)
        draw_major = ImageDraw.Draw(corridor_major)
        for rank, line, major in self.rivers:
            hw = river_halfwidth(cfg, rank, major, self.k)
            width = max(1, int(round(2 * (hw + rc["corridor_px"] * self.k) * 2 / a)))
            pts = [(((x / a) + m) * 2, ((y / a) + m) * 2) for x, y in line]
            draw.line(pts, fill=255, width=width)
            if major or rank <= rc["avoid_max_scalerank"]:
                draw_major.line(pts, fill=255, width=width)
        for line in self.named_river_lines:
            hw = float(rc["halfwidth_by_rank"][str(rc["extra_rank"])]) * self.k
            width = max(1, int(round(2 * (hw + rc["corridor_px"] * self.k) * 2 / a)))
            draw_major.line([(((x / a) + m) * 2, ((y / a) + m) * 2) for x, y in line], fill=255, width=width)
        def _down(im):
            arr = np.asarray(im, dtype=np.float32) / 255.0
            return arr.reshape(gh, 2, gw, 2).mean(axis=(1, 3))
        self.g_river = _down(corridor)
        self.g_water = np.clip(_down(corridor_major) + self.g_lake, 0, 1)
        river_dist = ndimage.distance_transform_edt(self.g_river < 0.5) * a  # px

        # land classes
        cls = cfg["classes"]
        desert = raster.rasterize_rings(self.desert_rings, self.gwin, ss=1, scale=scale)
        gobi = raster.rasterize_rings(self.gobi_rings, self.gwin, ss=1, scale=scale)
        steppe = raster.rasterize_rings(self.steppe_rings, self.gwin, ss=1, scale=scale)
        for name, thr in cls["basin_floor_desert"].items():
            basin = raster.rasterize_rings(self.basin_rings[name], self.gwin, ss=1, scale=scale)
            desert = np.maximum(desert, basin * (self.g_elev < thr))
        lat_w = smoothstep(cls["grass_lat_from"], cls["grass_lat_full"], self.g_lat)
        lon_w = 1.0 - smoothstep(cls["grass_lon_east_from"], cls["grass_lon_east_to"], self.g_lon)
        grass = np.maximum(steppe, lat_w * lon_w) * (1 - desert)
        desert = np.maximum(desert, gobi * cls["gobi_desert_weight"])
        plateau = smoothstep(cls["plateau_from_m"], cls["plateau_full_m"], self.g_elev)
        blur = cfg["land"]["class_blur_cells"] * self.k
        noise = raster.value_noise(self.gwin, 24.0 * self.k, self.seed, "classes", gw, gh, octaves=3)
        nz = (noise - 0.5) * 2 * cfg["land"]["class_noise"]
        w_desert = np.clip(ndimage.gaussian_filter(desert.astype(np.float32), blur) + nz, 0, 1) * (1 - plateau)
        w_grass = np.clip(ndimage.gaussian_filter(grass.astype(np.float32), blur) - nz, 0, 1) * (1 - plateau) * (1 - w_desert)
        w_plateau = np.clip(ndimage.gaussian_filter(plateau.astype(np.float32), blur * 0.6), 0, 1)
        w_plain = np.clip(1 - w_desert - w_grass - w_plateau, 0, 1)
        tot = w_desert + w_grass + w_plateau + w_plain + 1e-6
        self.g_classes = {"desert": w_desert / tot, "grass": w_grass / tot, "plateau": w_plateau / tot, "plain": w_plain / tot}
        self.g_arid = np.clip(w_desert + 0.6 * w_grass, 0, 1)

        # valley mist field
        mi = cfg["mist"]
        emean = ndimage.gaussian_filter(self.g_elev, mi["valley_blur_cells"])
        valley = smoothstep(mi["valley_depth_m"][0], mi["valley_depth_m"][1], emean - self.g_elev)
        ib = ndimage.gaussian_filter(self.g_int, 3.0)
        mnoise = raster.value_noise(self.gwin, mi["noise_cell_px"] * self.k / a, self.seed, "mist", gw, gh, octaves=3)
        mnoise = np.clip((mnoise - 0.5) * 2.4 + 0.5, 0, 1)
        clear = smoothstep(mi["river_clear_px"] * self.k * 0.5, mi["river_clear_px"] * self.k * 2.0, river_dist)
        self.g_mist = (mi["valley_alpha"] * smoothstep(mi["intensity_from"], mi["intensity_full"], ib)
                       * (0.25 + 0.75 * mnoise) * (0.35 + 0.65 * valley) * (0.35 + 0.65 * clear)).astype(np.float32)

    # ------------------------------------------------------------ helpers
    def g_at(self, field: np.ndarray, x: float, y: float) -> float:
        j = int(x // self.a) + self.m
        i = int(y // self.a) + self.m
        if 0 <= i < field.shape[0] and 0 <= j < field.shape[1]:
            return float(field[i, j])
        return 0.0

    def up(self, field: np.ndarray, win: Window) -> np.ndarray:
        """Bilinear upsample of an analysis field to window pixels."""
        a, m = self.a, self.m
        py = (np.arange(win.y0, win.y1, dtype=np.float64) + 0.5) / a - 0.5 + m
        px = (np.arange(win.x0, win.x1, dtype=np.float64) + 0.5) / a - 0.5 + m
        py = np.clip(py, 0, field.shape[0] - 1.001)
        px = np.clip(px, 0, field.shape[1] - 1.001)
        iy = np.floor(py).astype(np.int64)
        ix = np.floor(px).astype(np.int64)
        fy = (py - iy)[:, None].astype(np.float32)
        fx = (px - ix)[None, :].astype(np.float32)
        f = field.astype(np.float32)
        return (f[np.ix_(iy, ix)] * (1 - fy) * (1 - fx) + f[np.ix_(iy, ix + 1)] * (1 - fy) * fx
                + f[np.ix_(iy + 1, ix)] * fy * (1 - fx) + f[np.ix_(iy + 1, ix + 1)] * fy * fx)

    def footprint_overlap(self, rgba: np.ndarray, ox: float, oy: float, field: np.ndarray) -> float:
        """Alpha-weighted mean of an analysis field under a sprite placed at (ox, oy)."""
        a, m = self.a, self.m
        h, w = rgba.shape[:2]
        alpha = rgba[::a, ::a, 3]
        i0 = int(math.floor(oy / a)) + m
        j0 = int(math.floor(ox / a)) + m
        hh, ww = alpha.shape
        i1, j1 = i0 + hh, j0 + ww
        if i0 < 0 or j0 < 0 or i1 > field.shape[0] or j1 > field.shape[1]:
            ci0, cj0 = max(0, i0), max(0, j0)
            ci1, cj1 = min(field.shape[0], i1), min(field.shape[1], j1)
            if ci1 <= ci0 or cj1 <= cj0:
                return 1.0
            alpha = alpha[ci0 - i0:ci1 - i0, cj0 - j0:cj1 - j0]
            i0, j0, i1, j1 = ci0, cj0, ci1, cj1
        tot = float(alpha.sum())
        if tot <= 1e-6:
            return 0.0
        return float((alpha * field[i0:i1, j0:j1]).sum() / tot)

    # ------------------------------------------------------------ mountains
    def _variants(self, kind: str, orient: str) -> List[Tuple[str, bool]]:
        names = self.cfg["kit"][kind]
        flip_map = {"nesw": "nwse", "nwse": "nesw", "ew": "ew", "ns": "ns", "none": "none"}
        out = []
        for name in names:
            spr = self.kit[name]
            if orient == "none" or spr.orient == "none":
                out.append((name, False))
                out.append((name, True))
            else:
                if spr.orient == orient:
                    out.append((name, False))
                    if orient in ("ew", "ns"):
                        out.append((name, True))
                if flip_map.get(spr.orient) == orient and orient in ("nesw", "nwse"):
                    out.append((name, True))
        return out

    def _place_mountains(self) -> None:
        cfg = self.cfg
        mc = cfg["mountains"]
        rng = rng_for(self.seed, "mountains")
        step = mc["candidate_step_px"] * self.k
        nx = int(self.W / step) + 1
        ny = int(self.H / step) + 1
        gx = (np.arange(nx)[None, :] + rng.random((ny, nx))) * step
        gy = (np.arange(ny)[:, None] + rng.random((ny, nx))) * step
        gx = gx.ravel()
        gy = gy.ravel()
        jj = np.clip((gx // self.a).astype(int) + self.m, 0, self.g_int.shape[1] - 1)
        ii = np.clip((gy // self.a).astype(int) + self.m, 0, self.g_int.shape[0] - 1)
        inten = self.g_int[ii, jj]
        land = self.g_land[ii, jj]
        elev = self.g_elev[ii, jj]
        relief = self.g_relief[ii, jj]
        plateau_rock = elev >= mc["plateau_rock_from_m"]
        ok = (land > 0.6) & ((relief >= mc["hill_relief_m"]) | (elev >= mc["snow_from_m"]))
        idx = np.nonzero(ok)[0]
        pr = inten[idx] + mc["priority_jitter"] * rng.random(len(idx))
        order = idx[np.argsort(-pr, kind="stable")]
        rolls = rng.random((len(gx), 6))

        # relief bands: sprites are kept inside the N-S / E-W extent of the relief band they stand on,
        # so a range south of a valley (Qilian / Hexi corridor, Qinling / Wei valley) does not spill over it
        band = (self.g_relief >= mc["band_relief_m"]) | (self.g_elev >= mc["snow_from_m"])
        band = ndimage.binary_closing(band, iterations=int(mc["band_closing_iter"])) & (self.g_landraw > 0.5)
        b_n = _run_length(band, axis=0)
        b_s = _run_length(band[::-1], axis=0)[::-1]
        b_w = _run_length(band, axis=1)
        b_e = _run_length(band[:, ::-1], axis=1)[:, ::-1]

        sizes = mc["sizes_px"]
        placed: List[Dict[str, Any]] = []
        cell = 120.0 * self.k
        grid: Dict[Tuple[int, int], List[int]] = {}
        sea_field = 1.0 - self.g_landraw
        water_field = self.g_water

        for ci in order:
            x, y = float(gx[ci]), float(gy[ci])
            I = float(inten[ci])
            e = float(elev[ci])
            roll = rolls[ci]
            jj_, ii_ = int(jj[ci]), int(ii[ci])
            aniso = float(self.g_aniso[ii_, jj_])
            ang = float(self.g_angle[ii_, jj_])
            arid = float(self.g_arid[ii_, jj_])
            orient = _orient_class(ang) if aniso >= mc["anisotropy_min"] else "none"
            rel = float(relief[ci])
            floor = float(self.g_floor[ii_, jj_])
            alpha = 1.0
            if e >= mc["snow_from_m"]:
                kind = "xueshan"
                orient_use = orient if orient != "none" else ("ew" if roll[0] < 0.5 else "nesw")
                t = 0.3 + 0.7 * smoothstep(mc["snow_from_m"], 6000, e) * (0.45 + 0.55 * I)
            elif rel >= mc["mountain_relief_m"]:
                share = mc["range_share_high"] if I >= mc["range_intensity"] else mc["range_share"]
                kind = "shanmai" if (orient != "none" and roll[0] < share) else "shanfeng"
                orient_use = orient if kind == "shanmai" else "none"
                t = 0.1 + 0.9 * I ** mc["size_gamma"]
            elif rel >= mc["hill_relief_m"] and floor >= mc["floor_m"]:
                if arid > 0.45 or e >= mc["plateau_rock_from_m"]:
                    kind = "rock_small"
                    alpha = mc["rock_alpha"]
                elif roll[0] < mc["hill_peak_share"]:
                    kind = "rock_small"
                    alpha = mc["rock_alpha"]
                else:
                    kind = "qiuling"
                    alpha = mc["hill_alpha"]
                orient_use = "none"
                t = 0.2 + 0.8 * I
            else:
                continue
            group = "shanfeng" if kind == "rock_small" else kind
            variants = self._variants(group, orient_use)
            if not variants:
                variants = self._variants(group, "none")
            name, flip = variants[int(roll[1] * len(variants)) % len(variants)]
            if kind == "rock_small":
                small = [v for v in variants if v[0] in ("shanfeng_03", "shanfeng_05", "shanfeng_06")]
                if small:
                    name, flip = small[int(roll[1] * len(small)) % len(small)]
            smin, smax = sizes[kind]
            size = (smin + (smax - smin) * float(np.clip(t, 0, 1))) * (1 + mc["size_jitter"] * (2 * roll[2] - 1)) * self.k
            run_n = float(self.g_run_n[ii_, jj_]) * self.a
            run_w = float(self.g_run_w[ii_, jj_]) * self.a

            def _fit(nm: str) -> float:
                sp_ = self.kit[nm]
                return min(run_n * mc["fit_north"] * sp_.size0 / sp_.vis_h, run_w * 2 * mc["fit_side"] * sp_.size0 / sp_.vis_w)

            fit = _fit(name)
            if fit < mc["refit_below"] * size and kind != "xueshan":
                # narrow land: prefer the variant (any peak / range piece) that fits largest
                pool = self._variants("shanfeng", "none") + self._variants(group, orient_use)
                best = max(pool, key=lambda v: (_fit(v[0]), v[0], v[1]))
                if _fit(best[0]) > fit * 1.15:
                    name, flip = best
                    fit = _fit(name)
            spr = self.kit[name]
            size = min(size, max(fit, mc["min_size_px"] * self.k))
            a_, m_ = self.a, self.m
            if band[ii_, jj_]:
                y_top = (ii_ - m_ - int(b_n[ii_, jj_]) + 1) * a_
                y_bot = (ii_ - m_ + int(b_s[ii_, jj_])) * a_
                x_lft = (jj_ - m_ - int(b_w[ii_, jj_]) + 1) * a_
                x_rgt = (jj_ - m_ + int(b_e[ii_, jj_])) * a_
            else:
                y_top, y_bot, x_lft, x_rgt = y - a_, y + a_, x - a_, x + a_
            t_ns, t_ew = y_bot - y_top, x_rgt - x_lft
            h_cap = max(t_ns * mc["band_h_ratio"], mc["band_min_h_px"] * self.k)
            w_cap = max(t_ew * mc["band_w_ratio"], mc["band_min_w_px"] * self.k)
            size_intended = size
            size = min(size, h_cap * spr.size0 / spr.vis_h, w_cap * spr.size0 / spr.vis_w)
            over = max(0.0, (mc["band_h_ratio"] - 1.0) * t_ns)

            def _anchor(s_try: float, shift: float = 0.0) -> Tuple[float, float]:
                """Sprite base (x, y): inside the band, overshoot split evenly north / south;
                ``shift`` (fraction of the sprite height) moves the base within those limits."""
                h_ = spr.vis_h * s_try / spr.size0
                w_ = spr.vis_w * s_try / spr.size0
                lo = y_top - 0.5 * over + h_          # highest allowed base (top stays within band + overshoot)
                hi = y_bot + 0.5 * over               # lowest allowed base
                foot = y + 0.5 * h_ + shift * h_
                foot = max(lo, min(hi, foot)) if lo <= hi else 0.5 * (lo + hi)
                if x_rgt - x_lft >= w_:
                    xc = min(max(x, x_lft + 0.5 * w_), x_rgt - 0.5 * w_)
                else:
                    xc = 0.5 * (x_lft + x_rgt)
                return xc, foot

            ratio = mc["spacing_ratio"] + mc["spacing_ratio_sparse"] * (1.0 - I)
            if kind in ("qiuling", "rock_small"):
                ratio *= mc["hill_spacing_mult"]
            excl = ratio * max(size, mc["band_spacing_keep"] * size_intended)
            x, y = _anchor(size)
            # neighbour check
            gxk, gyk = int(x // cell), int(y // cell)
            reach = int(math.ceil((excl + sizes["xueshan"][1] * self.k * mc["spacing_ratio"]) / (2 * cell))) + 1
            clash = False
            for di in range(-reach, reach + 1):
                for dj in range(-reach, reach + 1):
                    for pid in grid.get((gxk + di, gyk + dj), ()):
                        q = placed[pid]
                        need = 0.5 * (excl + q["excl"])
                        if (q["x"] - x) ** 2 + (q["y"] - y) ** 2 < need * need:
                            clash = True
                            break
                    if clash:
                        break
                if clash:
                    break
            if clash:
                continue
            accepted = None
            for shrink in (1.0, 0.8, 0.64, 0.51, 0.41):
                s_try = size * shrink
                if s_try < mc["min_size_px"] * self.k:
                    break
                arr, ax, ay = spr.render(s_try, flip)
                for shift in mc["base_shifts"]:
                    x_try, y_try = _anchor(s_try, shift)
                    ox, oy = x_try - ax, y_try - ay
                    if self.footprint_overlap(arr, ox, oy, sea_field) > mc["max_sea_overlap"]:
                        continue
                    if self.footprint_overlap(arr, ox, oy, water_field) > mc["max_water_overlap"]:
                        continue
                    accepted = s_try
                    x, y = x_try, y_try
                    break
                if accepted is not None:
                    break
            if accepted is None:
                continue
            tone = 1.0 + mc["tone_jitter"] * (2 * roll[3] - 1)
            rec = {"x": x, "y": y, "name": name, "flip": bool(flip), "size": accepted,
                   "excl": ratio * max(accepted, mc["band_spacing_keep"] * size_intended),
                   "kind": kind, "tone": tone, "I": I, "elev": e, "puff": int(roll[4] * len(self.puffs)), "arid": arid,
                   "alpha": alpha}
            placed.append(rec)
            grid.setdefault((gxk, gyk), []).append(len(placed) - 1)
        # high plateaus: the placement above stays exactly as it was everywhere else; on the plateau its pieces are
        # replaced by GIS ridge ranges (_place_plateau), and rim pieces that rise over the plateau are shrunk in place
        placed = self._clear_plateau(placed)
        grid = {}
        for n_, q in enumerate(placed):
            grid.setdefault((int(q["x"] // cell), int(q["y"] // cell)), []).append(n_)
        self.n_offplateau = len(placed)
        self._place_plateau(placed, grid, cell)
        placed.sort(key=lambda p: (p["y"], p["x"]))
        self.peaks = placed

    def _clear_plateau(self, placed: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pc = self.cfg["plateau"]
        a, m = self.a, self.m
        zone_f = self.g_zone.astype(np.float32)
        kept = []
        self.n_plateau_removed = 0
        self.n_rim_shrunk = 0
        for q in placed:
            i = int(q["y"] // a) + m
            j = int(q["x"] // a) + m
            if 0 <= i < zone_f.shape[0] and 0 <= j < zone_f.shape[1] and self.g_zone[i, j]:
                self.n_plateau_removed += 1
                continue
            spr = self.kit[q["name"]]
            size = q["size"]
            shrunk = False
            while True:
                arr, ax, ay = spr.render(size, q["flip"])
                if self.footprint_overlap(arr, q["x"] - ax, q["y"] - ay, zone_f) <= pc["rim_zone_overlap_max"]:
                    break
                if size * 0.85 < pc["rim_min_size_px"] * self.k:
                    break
                size *= 0.85
                shrunk = True
            if shrunk:
                self.n_rim_shrunk += 1
                q = dict(q, size=size)
            kept.append(q)
        return kept

    # ------------------------------------------------------------ plateau mountains
    def _place_plateau(self, placed: List[Dict[str, Any]], grid: Dict[Tuple[int, int], List[int]], cell: float) -> None:
        """Mountains on the high flat plateaus, from GIS: ridge lines (skeleton of the prominence mask above the
        plateau base) carry oriented range pieces, sized by prominence, kept within the prominence band; wide
        valleys and lake basins (low prominence) stay flat; crests >= snow_m use snow pieces."""
        from skimage.morphology import skeletonize

        cfg = self.cfg
        mc, pc = cfg["mountains"], cfg["plateau"]
        a, m = self.a, self.m
        land = self.g_landraw > 0.5
        P = self.g_prom
        if not self.g_zone.any():
            return
        mask = self.g_zone & land & (ndimage.gaussian_filter(P, pc["ridge_smooth_cells"]) >= pc["prom_hill_m"])
        lab_r, n_r = ndimage.label(mask)
        if n_r:
            cnt = np.bincount(lab_r.ravel())
            tiny = cnt < int(pc["min_ridge_cells"])
            tiny[0] = False
            mask &= ~tiny[lab_r]
        skel = skeletonize(mask)
        ci, cj = np.nonzero(skel)
        rng = rng_for(self.seed, "plateau")
        jitter = rng.random(len(ci))
        rolls = rng.random((len(ci), 6))
        prom_c = P[ci, cj]
        order = np.argsort(-(prom_c + pc["priority_jitter_m"] * jitter), kind="stable")

        band = ndimage.binary_closing(self.g_zone & (P >= pc["prom_band_m"]), iterations=int(pc["band_closing_iter"])) & land
        b_n = _run_length(band, axis=0)
        b_s = _run_length(band[::-1], axis=0)[::-1]
        sea_field = 1.0 - self.g_landraw
        water_field = self.g_water
        mine: List[Dict[str, Any]] = []
        mgrid: Dict[Tuple[int, int], List[int]] = {}
        mcell = 160.0 * self.k
        kx, ky = pc["overlap_x"], pc["overlap_y"]

        for k in order:
            i, j = int(ci[k]), int(cj[k])
            roll = rolls[k]
            x = (j - m + roll[5]) * a
            y = (i - m + roll[4]) * a
            prom = float(P[i, j])
            crest = float(self.g_crest[i, j])
            I = float(np.clip((prom - pc["prom_lo_m"]) / (pc["prom_hi_m"] - pc["prom_lo_m"]), 0, 1)) ** pc["prom_gamma"]
            ang = float(self.g_angle[i, j])
            dev = min(ang % 180.0, 180.0 - ang % 180.0)  # degrees away from east-west
            if float(self.g_aniso[i, j]) < pc["anisotropy_min"]:
                orient = "none"
            elif dev <= pc["ew_tolerance_deg"]:
                orient = "ew"
            else:
                orient = _orient_class(ang)
            alpha = 1.0
            if crest >= pc["snow_m"] and prom >= pc["prom_snow_m"]:
                kind, group = "xueshan", "xueshan"
                orient_use = orient if orient != "none" else "ew"
            elif prom >= pc["prom_mountain_m"]:
                kind = "shanmai" if orient != "none" else "shanfeng"
                group, orient_use = kind, (orient if kind == "shanmai" else "none")
            else:
                kind = "low"
                group, orient_use = ("shanmai", orient) if orient != "none" else ("shanfeng", "none")
                alpha = pc["low_alpha"]
            variants = self._variants(group, orient_use) or self._variants(group, "none")
            name, flip = variants[int(roll[1] * len(variants)) % len(variants)]
            spr = self.kit[name]
            smin, smax = pc["sizes_px"][kind]
            size = (smin + (smax - smin) * I) * (1 + mc["size_jitter"] * (2 * roll[2] - 1)) * self.k
            # keep the piece within the prominence band (north / south), with a limited overshoot
            if band[i, j]:
                y_top = (i - m - int(b_n[i, j]) + 1) * a
                y_bot = (i - m + int(b_s[i, j])) * a
            else:
                y_top, y_bot = y - a, y + a
            t_ns = y_bot - y_top
            h_cap = max(t_ns * pc["band_h_ratio"], pc["band_min_h_px"] * self.k)
            size = min(size, h_cap * spr.size0 / spr.vis_h)
            accepted = None
            for shrink in (1.0, 0.8, 0.64, 0.51):
                s_try = size * shrink
                if s_try < pc["min_size_px"] * self.k:
                    break
                w_ = spr.vis_w * s_try / spr.size0
                h_ = spr.vis_h * s_try / spr.size0
                foot = y + (1.0 - pc["crest_from_top"]) * h_  # ridge line sits crest_from_top below the piece's top
                over = 0.5 * max(0.0, h_ - t_ns)
                foot = min(foot, y_bot + over)
                foot = max(foot, y_top - over + h_)
                cx, cy = x, foot - 0.5 * h_
                # clash with other plateau pieces (axis-aligned ellipses) and with the rest of the map
                gk = (int(cx // mcell), int(cy // mcell))
                clash = False
                for di in (-2, -1, 0, 1, 2):
                    for dj in (-2, -1, 0, 1, 2):
                        for q_i in mgrid.get((gk[0] + di, gk[1] + dj), ()):
                            q = mine[q_i]
                            ex = (cx - q["cx"]) / (kx * 0.5 * (w_ + q["w"]))
                            ey = (cy - q["cy"]) / (ky * 0.5 * (h_ + q["h"]))
                            if ex * ex + ey * ey < 1.0:
                                clash = True
                                break
                        if clash:
                            break
                    if clash:
                        break
                if not clash:
                    # the rest of the map: same ellipse test on the visible boxes of those pieces
                    gxk, gyk = int(x // cell), int(foot // cell)
                    for di in (-3, -2, -1, 0, 1, 2, 3):
                        for dj in (-3, -2, -1, 0, 1, 2, 3):
                            for q_i in grid.get((gxk + di, gyk + dj), ()):
                                q = placed[q_i]
                                qs = self.kit[q["name"]]
                                qw = qs.vis_w * q["size"] / qs.size0
                                qh = qs.vis_h * q["size"] / qs.size0
                                ex = (cx - q["x"]) / (pc["outside_overlap_x"] * 0.5 * (w_ + qw))
                                ey = (cy - (q["y"] - 0.5 * qh)) / (pc["outside_overlap_y"] * 0.5 * (h_ + qh))
                                if ex * ex + ey * ey < 1.0:
                                    clash = True
                                    break
                            if clash:
                                break
                        if clash:
                            break
                if clash:
                    break  # a smaller piece would sit in the same crowd; leave the spot
                arr, ax, ay = spr.render(s_try, flip)
                ox, oy = x - ax, foot - ay
                if self.footprint_overlap(arr, ox, oy, sea_field) > mc["max_sea_overlap"]:
                    continue
                if self.footprint_overlap(arr, ox, oy, water_field) > pc["max_water_overlap"]:
                    continue
                accepted = (s_try, foot, cx, cy, w_, h_)
                break
            if accepted is None:
                continue
            s_try, foot, cx, cy, w_, h_ = accepted
            tone = 1.0 + mc["tone_jitter"] * (2 * roll[3] - 1)
            rec = {"x": x, "y": foot, "name": name, "flip": bool(flip), "size": s_try,
                   "excl": mc["spacing_ratio"] * s_try, "kind": "qiuling" if kind == "low" else kind, "tone": tone,
                   "I": I, "elev": crest, "puff": int(roll[0] * len(self.puffs)), "arid": 0.0, "alpha": alpha,
                   "plateau": True, "cx": cx, "cy": cy, "w": w_, "h": h_}
            mine.append(rec)
            mgrid.setdefault((int(cx // mcell), int(cy // mcell)), []).append(len(mine) - 1)
            placed.append(rec)
            grid.setdefault((int(x // cell), int(foot // cell)), []).append(len(placed) - 1)

    # ------------------------------------------------------------ plains
    def _poisson(self, cand_x, cand_y, spacing, order) -> List[int]:
        cell = float(max(spacing.max(), 1.0))
        grid: Dict[Tuple[int, int], List[int]] = {}
        acc: List[int] = []
        for ci in order:
            x, y, sp = cand_x[ci], cand_y[ci], spacing[ci]
            gx_, gy_ = int(x // cell), int(y // cell)
            clash = False
            for di in (-1, 0, 1):
                for dj in (-1, 0, 1):
                    for q in grid.get((gx_ + di, gy_ + dj), ()):
                        need = 0.5 * (sp + spacing[q])
                        if (cand_x[q] - x) ** 2 + (cand_y[q] - y) ** 2 < need * need:
                            clash = True
                            break
                    if clash:
                        break
                if clash:
                    break
            if not clash:
                acc.append(ci)
                grid.setdefault((gx_, gy_), []).append(ci)
        return acc

    def _place_plains(self) -> None:
        cfg = self.cfg
        tc = cfg["trees"]
        rng = rng_for(self.seed, "trees")
        step = 9.0 * self.k
        nx, ny = int(self.W / step) + 1, int(self.H / step) + 1
        gx = ((np.arange(nx)[None, :] + rng.random((ny, nx))) * step).ravel()
        gy = ((np.arange(ny)[:, None] + rng.random((ny, nx))) * step).ravel()
        jj = np.clip((gx // self.a).astype(int) + self.m, 0, self.g_int.shape[1] - 1)
        ii = np.clip((gy // self.a).astype(int) + self.m, 0, self.g_int.shape[0] - 1)
        cl = self.g_classes
        humid = (1.0 - cl["desert"]) * (1.0 - 0.9 * cl["grass"]) * (1.0 - cl["plateau"])
        hum = humid[ii, jj]
        ok = ((self.g_land[ii, jj] > 0.85) & (self.g_int[ii, jj] < tc["max_intensity"]) & (self.g_water[ii, jj] < 0.05)
              & (self.g_river[ii, jj] < 0.3) & (hum > tc["min_humidity"]))
        idx = np.nonzero(ok)[0]
        spacing = np.full(len(gx), 1e9)
        spacing[idx] = (tc["spacing_dry"] + (tc["spacing_humid"] - tc["spacing_dry"]) * hum[idx]) * self.k
        hilly = smoothstep(0.04, 0.16, self.g_int[ii, jj])
        spacing[idx] *= 1.0 + (tc["hill_sparse"] - 1.0) * hilly[idx]
        order = idx[np.argsort(rng.random(len(idx)), kind="stable")]
        acc = self._poisson(gx, gy, spacing, order)
        rolls = rng.random((len(gx), 3))
        marks = []
        for ci in acc:
            st = self.trees[int(rolls[ci, 0] * len(self.trees)) % len(self.trees)]
            scale = tc["scale"][0] + (tc["scale"][1] - tc["scale"][0]) * rolls[ci, 1]
            size = st.size0 * scale * self.k
            flip = bool(rolls[ci, 2] < 0.5)
            arr, ax, ay = st.render(size, flip, quantum=2)
            ox, oy = gx[ci] - ax, gy[ci] - ay
            if self.footprint_overlap(arr, ox, oy, 1.0 - self.g_landraw) > 0.05:
                continue
            if self.footprint_overlap(arr, ox, oy, self.g_water) > 0.08:
                continue
            marks.append({"x": float(gx[ci]), "y": float(gy[ci]), "tree": self.trees.index(st), "size": size, "flip": flip})
        self.tree_marks = marks

        pc = cfg["plain_patches"]
        rng = rng_for(self.seed, "patches")
        step = 60.0 * self.k
        nx, ny = int(self.W / step) + 1, int(self.H / step) + 1
        gx = ((np.arange(nx)[None, :] + rng.random((ny, nx))) * step).ravel()
        gy = ((np.arange(ny)[:, None] + rng.random((ny, nx))) * step).ravel()
        jj = np.clip((gx // self.a).astype(int) + self.m, 0, self.g_int.shape[1] - 1)
        ii = np.clip((gy // self.a).astype(int) + self.m, 0, self.g_int.shape[0] - 1)
        ok = (self.g_land[ii, jj] > 0.8) & (self.g_int[ii, jj] < pc["max_intensity"]) & (self.g_classes["plain"][ii, jj] > 0.4)
        idx = np.nonzero(ok)[0]
        spacing = np.full(len(gx), 1e9)
        spacing[idx] = pc["spacing"] * self.k
        order = idx[np.argsort(rng.random(len(idx)), kind="stable")]
        acc = self._poisson(gx, gy, spacing, order)
        rolls = rng.random((len(gx), 4))
        patches = []
        for ci in acc:
            name = pc["kinds"][int(rolls[ci, 0] * len(pc["kinds"])) % len(pc["kinds"])]
            size = (pc["size_px"][0] + (pc["size_px"][1] - pc["size_px"][0]) * rolls[ci, 1]) * self.k
            alpha = pc["alpha"][0] + (pc["alpha"][1] - pc["alpha"][0]) * rolls[ci, 2]
            patches.append({"x": float(gx[ci]), "y": float(gy[ci]), "name": name, "size": size, "flip": bool(rolls[ci, 3] < 0.5), "alpha": alpha})
        self.patches = patches

    # ------------------------------------------------------------ sea decor
    def _place_sea_decor(self) -> None:
        cfg = self.cfg["sea"]["decor"]
        rng = rng_for(self.seed, "seadecor")
        sea = (self.g_landraw < 0.5)
        dist = ndimage.distance_transform_edt(sea) * self.a
        inside = np.zeros_like(sea)
        inside[self.m:-self.m, self.m:-self.m] = True
        step = 40.0 * self.k
        nx, ny = int(self.W / step) + 1, int(self.H / step) + 1
        gx = ((np.arange(nx)[None, :] + rng.random((ny, nx))) * step).ravel()
        gy = ((np.arange(ny)[:, None] + rng.random((ny, nx))) * step).ravel()
        jj = np.clip((gx // self.a).astype(int) + self.m, 0, sea.shape[1] - 1)
        ii = np.clip((gy // self.a).astype(int) + self.m, 0, sea.shape[0] - 1)
        d = dist[ii, jj]
        ok = sea[ii, jj] & (d > 6 * self.k) & (d <= cfg["max_dist_px"] * self.k)
        idx = np.nonzero(ok)[0]
        order = idx[np.argsort(rng.random(len(idx)), kind="stable")]
        rolls = rng.random((len(gx), 4))
        placed: List[Dict[str, Any]] = []
        land_field = self.g_landraw
        near = cfg["near_px"] * self.k
        for ci in order:
            x, y, dd = float(gx[ci]), float(gy[ci]), float(d[ci])
            nearness = math.exp(-dd / near)
            spacing = (cfg["spacing_far"] + (cfg["spacing_near"] - cfg["spacing_far"]) * nearness) * self.k
            if any((p["x"] - x) ** 2 + (p["y"] - y) ** 2 < spacing * spacing for p in placed[-400:]):
                continue
            if any((p["x"] - x) ** 2 + (p["y"] - y) ** 2 < spacing * spacing for p in placed[:-400]):
                continue
            kinds = cfg["kinds"]
            if nearness < 0.35:
                kinds = [k_ for k_ in kinds if k_ != cfg["wave_kind_near_only"]]
            name = kinds[int(rolls[ci, 0] * len(kinds)) % len(kinds)]
            size = (cfg["size_px"][0] + (cfg["size_px"][1] - cfg["size_px"][0]) * rolls[ci, 1]) * self.k
            flip = rolls[ci, 2] < 0.5
            arr, ax, ay = self.kit[name].render(size, flip)
            ox, oy = x - arr.shape[1] / 2, y - arr.shape[0] / 2
            if self.footprint_overlap(arr, ox, oy, land_field) > 0.04:
                continue
            alpha = cfg["alpha_far"] + (cfg["alpha_near"] - cfg["alpha_far"]) * nearness
            placed.append({"x": x, "y": y, "name": name, "flip": bool(flip), "size": size, "alpha": alpha})
        placed.sort(key=lambda p: (p["y"], p["x"]))
        self.sea_decor = placed


def river_halfwidth(cfg: Dict[str, Any], rank: int, major: bool, k: float) -> float:
    rc = cfg["rivers"]
    if major:
        table = rc["major_halfwidth_by_rank"]
        return float(table.get(str(rank), table["promoted"])) * k
    return float(rc["halfwidth_by_rank"][str(rank)]) * k


def _run_length(mask: np.ndarray, axis: int) -> np.ndarray:
    """Count of consecutive True cells ending at each cell along +axis (inclusive)."""
    m = mask if axis == 0 else mask.T
    out = np.zeros(m.shape, dtype=np.int32)
    run = np.zeros(m.shape[1], dtype=np.int32)
    for i in range(m.shape[0]):
        run = np.where(m[i], run + 1, 0)
        out[i] = run
    return out if axis == 0 else out.T


def _orient_class(angle: float) -> str:
    a = angle % 180.0
    if a < 22.5 or a >= 157.5:
        return "ew"
    if a < 67.5:
        return "nesw"
    if a < 112.5:
        return "ns"
    return "nwse"


def _point_in_ring(pt: Sequence[float], ring: np.ndarray) -> bool:
    x, y = pt
    xs, ys = ring[:, 0], ring[:, 1]
    xj, yj = np.roll(xs, 1), np.roll(ys, 1)
    cond = (ys > y) != (yj > y)
    with np.errstate(divide="ignore", invalid="ignore"):
        cross = (xj - xs) * (y - ys) / (yj - ys) + xs
    return bool(np.count_nonzero(cond & (x < cross)) % 2)


# ====================================================================== render
def render(world: World, win: Window) -> np.ndarray:
    """Render ``win`` (global canvas px) to an RGB uint8 array."""
    cfg = world.cfg
    k = world.k
    seed = world.seed
    W, H = world.W, world.H
    PAD = int(160 * k)
    pwin = win.grow(PAD)

    # ---------------------------------------------------------- masks
    land_main = raster.rasterize_rings([r for r in world.land_rings if pwin.meets(*raster.ring_bbox(r))], pwin, ss=2)
    land_minor = raster.rasterize_rings([r for r in world.minor_rings if pwin.meets(*raster.ring_bbox(r))], pwin, ss=2)
    lake_p = raster.rasterize_rings([r for r in world.lake_rings if pwin.meets(*raster.ring_bbox(r))], pwin, ss=2)
    landraw_p = np.maximum(land_main, land_minor)
    sea_dist_p = ndimage.distance_transform_edt(landraw_p < 0.5).astype(np.float32)
    crop = (slice(PAD, PAD + win.h), slice(PAD, PAD + win.w))
    landraw = landraw_p[crop]
    lake = lake_p[crop]
    land = landraw * (1.0 - lake)
    sea = 1.0 - landraw
    sea_dist = sea_dist_p[crop]
    log("masks")

    # ---------------------------------------------------------- paper
    pc = np.array(cfg["paper"]["color"], dtype=np.float32) / 255.0
    wash = raster.value_noise(win, cfg["paper"]["wash_cell_px"] * k, seed, "paperwash", W, H, octaves=4)

    # ---------------------------------------------------------- land texture
    lc = cfg["land"]
    mix = raster.value_noise(win, 420 * k, seed, "tilemix", W, H, octaves=2)
    mixs = smoothstep(0.35, 0.65, mix)[..., None]
    tex = np.zeros((win.h, win.w, 3), dtype=np.float32)
    tint = {"plain": lc["lowland_warm"], "grass": lc["grass_tint"], "desert": lc["desert_tint"], "plateau": lc["plateau_tint"]}
    for cls_name in ("plain", "grass", "desert", "plateau"):
        wfield = world.up(world.g_classes[cls_name], win)
        if float(wfield.max()) <= 1e-4:
            continue
        t1, t2 = world.tiles[cls_name]
        layer = (raster.tile_texture(t1, win, lc["tile_scale"]) * (1 - mixs)
                 + raster.tile_texture(t2, win, lc["tile_scale"], offset=(173, 291)) * mixs)
        layer *= np.array(tint[cls_name], dtype=np.float32)
        tex += layer * wfield[..., None]
    tex *= np.array(lc["tint"], dtype=np.float32)

    # elevation for hillshade / snow
    hs, elev = _hillshade(world, win)
    inten = world.up(world.g_int, win)
    strength = lc["hillshade_strength"] + lc["hillshade_mountain_boost"] * inten
    tex *= np.clip(1.0 + strength * hs, 0.6, 1.25)[..., None]
    snow = lc["snow_wash_alpha"] * smoothstep(lc["snow_wash_from_m"], lc["snow_wash_full_m"], elev)
    sc = np.array(lc["snow_color"], dtype=np.float32) / 255.0
    tex = tex * (1 - snow[..., None]) + sc * snow[..., None]
    log("land texture")

    # ---------------------------------------------------------- sea texture
    sc_ = cfg["sea"]
    s1, s2 = world.tiles["sea"]
    stex = (raster.tile_texture(s1, win) * (1 - mixs) + raster.tile_texture(s2, win, offset=(311, 97)) * mixs)
    near = np.exp(-sea_dist / (sc_["falloff_px"] * k))
    snoise = raster.value_noise(win, 260 * k, seed, "seawash", W, H, octaves=3)
    alpha_w = (sc_["far_alpha"] + (sc_["near_alpha"] - sc_["far_alpha"]) * near) * (1 + (snoise - 0.5) * 2 * sc_["noise_strength"])
    col = (np.array(sc_["near_color"], np.float32) / 255.0 * near[..., None]
           + np.array(sc_["far_color"], np.float32) / 255.0 * (1 - near[..., None]))
    stex = stex * (1 - alpha_w[..., None]) + col * alpha_w[..., None]

    # lakes
    wc = cfg["water"]
    l1, l2 = world.tiles["lake"]
    ltex = raster.tile_texture(l1, win) * (1 - mixs) + raster.tile_texture(l2, win, offset=(59, 401)) * mixs
    lcol = np.array(wc["lake_color"], np.float32) / 255.0
    ltex = ltex * (1 - wc["lake_alpha"]) + lcol * wc["lake_alpha"]

    washf = (1.0 + (wash - 0.5) * 2 * cfg["paper"]["wash_strength"])[..., None]
    img = (tex * land[..., None] + stex * sea[..., None] + ltex * (landraw * lake)[..., None]) * washf
    log("sea / lakes")

    # ---------------------------------------------------------- plain patches (field tones)
    pat = np.zeros((win.h, win.w, 4), dtype=np.float32)
    for p in world.patches:
        arr, _, _ = world.kit[p["name"]].render(p["size"], p["flip"])
        _blit(pat, arr * p["alpha"], int(round(p["x"] - arr.shape[1] / 2)) - win.x0, int(round(p["y"] - arr.shape[0] / 2)) - win.y0)
    pat *= land[..., None]
    raster.over(img, pat[..., :3], pat[..., 3])

    # ---------------------------------------------------------- sea decor
    deco = np.zeros((win.h, win.w, 4), dtype=np.float32)
    for p in world.sea_decor:
        arr, _, _ = world.kit[p["name"]].render(p["size"], p["flip"])
        ox = int(round(p["x"] - arr.shape[1] / 2))
        oy = int(round(p["y"] - arr.shape[0] / 2))
        _blit(deco, arr * p["alpha"], ox - win.x0, oy - win.y0)
    deco *= sea[..., None]
    raster.over(img, deco[..., :3], deco[..., 3])
    log("sea decor")

    # ---------------------------------------------------------- rivers
    rc = cfg["rivers"]
    river_lines = [line for _, line, _ in world.rivers]
    hw_list = np.array([river_halfwidth(cfg, r_, mj, k) for r_, _, mj in world.rivers] + [1.0], dtype=np.float32)
    major_list = np.array([mj for _, _, mj in world.rivers] + [False], dtype=bool)
    reach = float(hw_list.max()) * 1.6 + 2
    dist, u, side, lid = raster.ribbon_fields(river_lines, win, reach)
    hit = lid >= 0
    if hit.any():
        li = np.where(hit, lid, len(river_lines))
        hw = hw_list[li]
        thick = major_list[li]
        v = np.where(hit, dist * np.where(side == 0, 1, side), 1e6).astype(np.float32)
        out = np.zeros((win.h, win.w, 4), dtype=np.float32)
        for name, sel, lt in ((rc["strip_thin"], ~thick & hit, rc["lighten"]), (rc["strip_thick"], thick & hit, rc["major_lighten"])):
            if sel.any():
                smp = raster.sample_strip(world.strips[name], world.strip_bands[name], u, v, hw)
                if lt:
                    tgt = np.array(lt["color"], dtype=np.float32) / 255.0
                    smp[..., :3] = smp[..., :3] * (1 - lt["amount"]) + tgt * smp[..., 3:4] * lt["amount"]
                out[sel] = smp[sel]
        clip = np.clip(ndimage.maximum_filter(land, size=3) * (1.0 - lake), 0, 1)
        out *= (clip * rc["alpha"])[..., None]
        raster.over(img, out[..., :3], out[..., 3])
    log("rivers")

    # ---------------------------------------------------------- lake shores
    lsc = cfg["lakeshore"]
    lake_lines = [l_ for l_ in world.lake_lines if win.grow(20).meets(*raster.ring_bbox(l_))]
    if lake_lines:
        hwl = lsc["halfwidth"] * k
        dist_l, u_l, _, lid_l = raster.ribbon_fields(lake_lines, win, hwl * 1.6 + 2)
        hit_l = lid_l >= 0
        v_l = np.where(lake > 0.5, -dist_l, dist_l).astype(np.float32)
        smp = raster.sample_strip(world.strips[lsc["strip"]], world.strip_bands[lsc["strip"]], u_l, v_l, hwl)
        smp[~hit_l] = 0
        smp *= lsc["strip_alpha"]
        raster.over(img, smp[..., :3], smp[..., 3])

    # ---------------------------------------------------------- coast strips
    cc = cfg["coast"]
    coast_sel = [i for i, l_ in enumerate(world.coast_lines) if win.grow(40).meets(*raster.ring_bbox(l_))]
    coast_lines = [world.coast_lines[i] for i in coast_sel]
    coast_major = np.array([world.coast_major[i] for i in coast_sel] + [False], dtype=bool)
    hw_major = (cc["water_halfwidth_major"] * k, cc["land_halfwidth_major"] * k)
    hw_minor = (cc["water_halfwidth_minor"] * k, cc["land_halfwidth_minor"] * k)
    dist_c, u_c, _, lid_c = raster.ribbon_fields(coast_lines, win, hw_major[0] * 1.6 + 3)
    hit_c = lid_c >= 0
    major = coast_major[np.where(hit_c, lid_c, len(coast_sel))]
    water_side = landraw < 0.5
    v_c = np.where(water_side, -dist_c, dist_c).astype(np.float32)
    out = np.zeros((win.h, win.w, 4), dtype=np.float32)
    for name, sel, hw_ in ((cc["strip_minor"], hit_c & ~major, hw_minor), (cc["strip_major"], hit_c & major, hw_major)):
        if sel.any():
            hw_arr = np.where(water_side, hw_[0], hw_[1]).astype(np.float32)
            smp = raster.sample_strip(world.strips[name], world.strip_bands[name], u_c, v_c, hw_arr)
            out[sel] = smp[sel]
    out *= cc["strip_alpha"]
    raster.over(img, out[..., :3], out[..., 3])
    log("coast strips")

    # ---------------------------------------------------------- mountains + mist
    layer = np.zeros((win.h, win.w, 4), dtype=np.float32)
    mist_rgb = np.array(cfg["mist"]["color"], dtype=np.float32) / 255.0
    gm = world.up(world.g_mist, win)
    layer[..., :3] = mist_rgb * gm[..., None]
    layer[..., 3] = gm
    mc = cfg["mountains"]
    paper = pc
    fade_top = mc["aerial_top_fade"]
    margin = int(260 * k)
    items = [(p["y"], p["x"], 0, p) for p in world.peaks] + [(t["y"], t["x"], 1, t) for t in world.tree_marks]
    items.sort(key=lambda it: (it[0], it[1], it[2]))
    tree_alpha = cfg["trees"]["alpha"]
    for _, _, is_tree, p in items:
        if not (win.x0 - margin <= p["x"] <= win.x1 + margin and win.y0 - 20 <= p["y"] <= win.y1 + margin):
            continue
        if is_tree:
            arr, ax, ay = world.trees[p["tree"]].render(p["size"], p["flip"], quantum=2)
            _blit(layer, arr * tree_alpha, int(round(p["x"] - ax)) - win.x0, int(round(p["y"] - ay)) - win.y0)
            continue
        arr, ax, ay = world.kit[p["name"]].render(p["size"], p["flip"])
        ox = int(round(p["x"] - ax)) - win.x0
        oy = int(round(p["y"] - ay)) - win.y0
        h_, w_ = arr.shape[:2]
        if ox >= win.w or oy >= win.h or ox + w_ <= 0 or oy + h_ <= 0:
            continue
        src = arr.copy()
        # ink tone jitter and a light aerial fade toward the top of the map
        fade = fade_top * (1.0 - p["y"] / H)
        tone = p["tone"]
        rgb = src[..., :3]
        a_ = src[..., 3:4]
        rgb *= tone
        rgb += (paper * a_ - rgb) * fade
        np.minimum(rgb, a_, out=rgb)
        if p.get("alpha", 1.0) < 1.0:
            src *= p["alpha"]
        _blit(layer, src, ox, oy)
        # foot mist
        pw = max(8, int(round(arr.shape[1] * 1.05 / 4)) * 4)
        ph = max(4, int(round(arr.shape[0] * cfg["mist"]["foot_height_ratio"] / 4)) * 4)
        pr = _puff(world, p["puff"], pw, ph, mist_rgb, cfg["mist"]["foot_alpha"])
        _blit(layer, pr, int(round(p["x"] - pw / 2)) - win.x0, int(round(p["y"] - ph * 0.62)) - win.y0)
    clipm = np.clip(land, 0, 1)
    layer *= clipm[..., None]
    raster.over(img, layer[..., :3], layer[..., 3])
    log("mountains")

    # ---------------------------------------------------------- coast + lake ink
    ink = np.array(cc["ink_color"], dtype=np.float32) / 255.0
    var = raster.value_noise(win, cc["ink_var_period_px"] * k, seed, "inkvar", W, H, octaves=2)
    ihw = (cc["ink_halfwidth"] + cc["ink_halfwidth_var"] * (var - 0.5) * 2) * max(k, 0.5)
    ia = np.clip(ihw + 0.5 - dist_c, 0, 1) * cc["ink_alpha"]
    ia[~hit_c] = 0
    raster.over(img, ink * ia[..., None], ia)
    if lake_lines:
        ial = np.clip(ihw * 0.8 + 0.5 - dist_l, 0, 1) * lsc["ink_alpha"]
        ial[~hit_l] = 0
        raster.over(img, ink * ial[..., None], ial)

    # ---------------------------------------------------------- paper grain
    g = raster.grain(win, seed)
    img *= (1.0 + g[..., None] * cfg["paper"]["grain_strength"])
    log("done")
    return raster.to_uint8(np.clip(img, 0, 1))


_PUFF_CACHE: Dict[Tuple[int, int, int], np.ndarray] = {}


def _puff(world: "World", idx: int, pw: int, ph: int, rgb: np.ndarray, alpha: float) -> np.ndarray:
    key = (idx, pw, ph)
    if key not in _PUFF_CACHE:
        puff = world.puffs[idx]
        pim = np.asarray(Image.fromarray((puff * 255).astype(np.uint8)).resize((pw, ph), Image.Resampling.BILINEAR),
                         dtype=np.float32) / 255.0
        pa = pim * alpha
        pr = np.empty((ph, pw, 4), dtype=np.float32)
        pr[..., :3] = rgb * pa[..., None]
        pr[..., 3] = pa
        _PUFF_CACHE[key] = pr
    return _PUFF_CACHE[key]


def _blit(dst: np.ndarray, src: np.ndarray, ox: int, oy: int) -> None:
    """Premultiplied RGBA 'over' of src at integer offset into dst (h, w, 4)."""
    h, w = src.shape[:2]
    H, W = dst.shape[:2]
    x0, y0 = max(0, ox), max(0, oy)
    x1, y1 = min(W, ox + w), min(H, oy + h)
    if x1 <= x0 or y1 <= y0:
        return
    s = src[y0 - oy:y1 - oy, x0 - ox:x1 - ox]
    d = dst[y0:y1, x0:x1]
    if dst.shape[2] == 4:
        d *= (1.0 - s[..., 3:4])
        d += s
    else:
        d *= (1.0 - s[..., 3:4])
        d += s[..., :3]


def _hillshade(world: World, win: Window) -> Tuple[np.ndarray, np.ndarray]:
    """Relative hillshade (-1..1-ish, 0 = flat) and elevation (m) at window pixels."""
    g = win.grow(1)
    ys = np.arange(g.y0, g.y1, dtype=np.float64) + 0.5
    xs = np.arange(g.x0, g.x1, dtype=np.float64) + 0.5
    X, Y = np.meshgrid(xs, ys)
    lon, lat = world.proj.inv(X, Y)
    r, c = geo.dem_index(lon, lat)
    dem = _dem_smooth()
    e = ndimage.map_coordinates(dem, [r, c], order=1, mode="nearest").astype(np.float32)
    e = np.maximum(e, 0.0)
    px_m = 6371008.8 / world.proj.cp.scale
    z = world.cfg["land"]["hillshade_z"]
    dzdx = (e[1:-1, 2:] - e[1:-1, :-2]) / (2 * px_m) * z
    dzdy = -(e[2:, 1:-1] - e[:-2, 1:-1]) / (2 * px_m) * z  # y up
    nx_, ny_, nz_ = -dzdx, -dzdy, np.ones_like(dzdx)
    norm = np.sqrt(nx_ * nx_ + ny_ * ny_ + 1.0)
    L = np.array([-1.0, 1.0, 1.4])
    L /= np.linalg.norm(L)
    shade = (nx_ * L[0] + ny_ * L[1] + nz_ * L[2]) / norm
    rel = (shade - L[2]) / L[2]
    return rel.astype(np.float32), e[1:-1, 1:-1]


_DEM_S = None


def _dem_smooth() -> np.ndarray:
    global _DEM_S
    if _DEM_S is None:
        dem = np.nan_to_num(geo.load_dem(), nan=-60.0).astype(np.float32)
        _DEM_S = ndimage.gaussian_filter(dem, 0.7)
    return _DEM_S


# ====================================================================== checks
CHECK_NODES = ("city_beijing", "city_kaifeng", "city_hangzhou", "city_chengdu", "city_lhasa",
               "city_kashgar", "city_dali", "city_guangzhou", "city_shenyang", "city_lanzhou")
LOCK_PATH = HERE / "compose.lock.json"


def check_projection() -> Tuple[bool, List[str]]:
    """10 open ch10 nodes: cities.yaml lon/lat -> grid vs map.yaml point, <= 1 grid unit."""
    root = geo.ROOT
    mp = json.loads((root / "content/world/ch10/map.yaml").read_text(encoding="utf-8"))["actions"][0]["map"]
    cities = {c["id"]: c for c in json.loads((root / "docs/design/map/cities.yaml").read_text(encoding="utf-8"))["cities"]}
    proj = geo.Proj(512, 384)
    nodes = {n["id"]: n for n in mp["nodes"]}
    lines, ok = [], True
    for nid in CHECK_NODES:
        node, city = nodes[nid], cities[nid]
        x, y = proj.fwd(city["longitude"], city["latitude"])
        dev = float(math.hypot(float(x) - node["point"][0], float(y) - node["point"][1]))
        ok &= node.get("open", False) and dev <= 1.0
        lines.append(f"  {nid:16s} grid=({float(x):7.2f},{float(y):7.2f}) point={node['point']} dev={dev:.3f}")
    # every open node, as information (content bugs are reported, not fixed here)
    for n in mp["nodes"]:
        c = cities.get(n["id"])
        if not n.get("open") or not c:
            continue
        x, y = proj.fwd(c["longitude"], c["latitude"])
        dev = float(math.hypot(float(x) - n["point"][0], float(y) - n["point"][1]))
        if dev > 1.0:
            lines.append(f"  WARN open node {n['id']} point {n['point']} is {dev:.1f} grid units from its cities.yaml lon/lat")
    return ok, lines


def run_check(cfg: Dict[str, Any]) -> int:
    failures = 0
    issues = geo.verify_inputs()
    print("inputs:", "ok" if not issues else issues)
    failures += bool(issues)
    ok, lines = check_projection()
    print("projection (10 nodes <= 1 grid unit):", "ok" if ok else "FAIL")
    print("\n".join(lines))
    failures += not ok
    # determinism: two independent worlds, same window
    win = Window(2900, 1450, 3300, 1750)
    digests = []
    for i in range(2):
        _PUFF_CACHE.clear()
        w = World(cfg)
        digests.append(hashlib.sha256(render(w, win).tobytes()).hexdigest())
    same = digests[0] == digests[1]
    print("determinism (two worlds, same window):", "ok" if same else "FAIL", digests[0])
    failures += not same
    if LOCK_PATH.is_file():
        lock = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
        cfg_sha = hashlib.sha256(CONFIG_PATH.read_bytes()).hexdigest()
        if lock.get("config_sha256") != cfg_sha:
            print("lock: config changed since lock was written (re-run with --write-lock after review)")
        for rel, expected in sorted(lock.get("inputs", {}).items()):
            if rel.startswith("tools/") and geo.sha256_file(geo.ROOT / rel) != expected:
                print("lock: input changed", rel)
                failures += 1
        for rel, expected in sorted(lock.get("materials", {}).items()):
            got = geo.sha256_file(geo.ROOT / rel)
            if got != expected:
                print("lock: material changed", rel)
                failures += 1
        for rel, expected in sorted(lock.get("outputs", {}).items()):
            path = geo.ROOT / rel
            if not path.is_file():
                print("lock: missing output", rel)
                failures += 1
            elif geo.sha256_file(path) != expected:
                print("lock: output differs", rel)
                failures += 1
        if lock.get("check_window_sha256") and lock["check_window_sha256"] != digests[0]:
            print("lock: check window render differs from lock")
            failures += 1
    print("CHECK", "PASSED" if failures == 0 else f"FAILED ({failures})")
    return 0 if failures == 0 else 1


def write_lock(cfg: Dict[str, Any], outputs: Sequence[Path]) -> None:
    win = Window(2900, 1450, 3300, 1750)
    w = World(cfg)
    lock = {
        "schema": "tianshu.worldmap-paint-lock.v1",
        "config_sha256": hashlib.sha256(CONFIG_PATH.read_bytes()).hexdigest(),
        "inputs": {**geo.INPUT_SHA256,
                   "tools/map/paint/" + cfg["rivers"]["supplement_file"]: geo.sha256_file(HERE / cfg["rivers"]["supplement_file"])},
        "materials": dict(sorted(sprites.USED.items())),
        "outputs": {str(p.relative_to(geo.ROOT)): geo.sha256_file(p) for p in outputs if p.is_file()},
        "check_window": [win.x0, win.y0, win.x1, win.y1],
        "check_window_sha256": hashlib.sha256(render(w, win).tobytes()).hexdigest(),
    }
    LOCK_PATH.write_text(json.dumps(lock, ensure_ascii=False, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print("wrote", LOCK_PATH)


# ====================================================================== CLI
def main(argv: Optional[Sequence[str]] = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--sample", help="render a named sample window from config.json")
    ap.add_argument("--window", help="x0,y0,x1,y1 in full-canvas px")
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--width", type=int, default=None)
    ap.add_argument("--out", type=Path)
    ap.add_argument("--deliver", action="store_true",
                    help="full render -> PNG master in the work dir + WebP q85 base and 1024x768 preview in assets/default/map/world")
    ap.add_argument("--check", action="store_true", help="inputs, projection self-test, determinism, lock")
    ap.add_argument("--write-lock", nargs="*", type=Path, metavar="OUTPUT", help="record hashes after a reviewed render")
    args = ap.parse_args(argv)
    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if args.check:
        return run_check(cfg)
    if args.write_lock is not None:
        write_lock(cfg, [p if p.is_absolute() else geo.ROOT / p for p in args.write_lock])
        return 0
    issues = geo.verify_inputs()
    if issues:
        for msg in issues:
            print("ERROR", msg, file=sys.stderr)
        return 2
    world = World(cfg, args.width)
    if args.deliver:
        rgb = render(world, Window(0, 0, world.W, world.H))
        im = Image.fromarray(rgb, "RGB")
        master = WORK / "full" / f"compose_full_{world.W}.png"
        master.parent.mkdir(parents=True, exist_ok=True)
        im.save(master, optimize=False, compress_level=6)
        dst = geo.ROOT / "assets" / "default" / "map" / "world"
        base = dst / "map_world_jianghu__base01.webp"
        im.save(base, "WEBP", quality=85, method=6)
        im.resize((1024, 768), Image.Resampling.LANCZOS).save(dst / "map_world_jianghu__base01_preview.webp", "WEBP", quality=85, method=6)
        for path in (master, base, dst / "map_world_jianghu__base01_preview.webp"):
            log(f"wrote {path.relative_to(geo.ROOT)} {path.stat().st_size} bytes sha256={geo.sha256_file(path)}")
        return 0
    if args.full:
        win = Window(0, 0, world.W, world.H)
    elif args.window:
        x0, y0, x1, y1 = (int(v) for v in args.window.split(","))
        win = Window(x0, y0, x1, y1)
    else:
        name = args.sample or "east"
        x0, y0, x1, y1 = cfg["samples"][name]["window"]
        s = world.k
        win = Window(int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s))
    rgb = render(world, win)
    out = args.out or (WORK / "sample" / f"compose_{args.sample or 'east'}.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgb, "RGB").save(out, optimize=False, compress_level=6)
    log(f"wrote {out} sha256={hashlib.sha256(out.read_bytes()).hexdigest()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
