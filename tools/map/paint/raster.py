"""Deterministic raster helpers for the painted world map.

Everything here is pure numpy / Pillow / scipy and depends only on its
arguments, so the same inputs give byte-identical outputs.  Noise is defined in
global canvas coordinates: rendering a window gives the same pixels as
cropping the full render.
"""
from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence, Tuple

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage


def rng_for(seed: int, *salt) -> np.random.Generator:
    digest = hashlib.sha256(repr((int(seed),) + tuple(str(s) for s in salt)).encode("utf-8")).digest()
    return np.random.Generator(np.random.PCG64(int.from_bytes(digest[:8], "little")))


@dataclass(frozen=True)
class Window:
    """Half-open pixel box [x0, x1) × [y0, y1) in global canvas pixels."""

    x0: int
    y0: int
    x1: int
    y1: int

    @property
    def w(self) -> int:
        return self.x1 - self.x0

    @property
    def h(self) -> int:
        return self.y1 - self.y0

    def grow(self, pad: int) -> "Window":
        return Window(self.x0 - pad, self.y0 - pad, self.x1 + pad, self.y1 + pad)

    def meets(self, bx0: float, by0: float, bx1: float, by1: float) -> bool:
        return not (bx1 < self.x0 or bx0 > self.x1 or by1 < self.y0 or by0 > self.y1)


# ------------------------------------------------------------------ polygons
def rasterize_rings(rings: Sequence[np.ndarray], win: Window, ss: int = 2, scale: float = 1.0) -> np.ndarray:
    """Even-odd coverage in [0, 1] of rings (canvas px * scale) over ``win``.

    ``scale`` maps canvas px to the raster's units (e.g. 1/4 for an analysis
    grid whose window is given in analysis cells).
    """
    big_w, big_h = win.w * ss, win.h * ss
    acc = np.zeros((big_h, big_w), dtype=bool)
    for ring in rings:
        if len(ring) < 3:
            continue
        xs = (ring[:, 0] * scale - win.x0) * ss
        ys = (ring[:, 1] * scale - win.y0) * ss
        bx0 = max(0, int(math.floor(xs.min())) - 1)
        by0 = max(0, int(math.floor(ys.min())) - 1)
        bx1 = min(big_w, int(math.ceil(xs.max())) + 2)
        by1 = min(big_h, int(math.ceil(ys.max())) + 2)
        if bx1 <= bx0 or by1 <= by0:
            continue
        sub = Image.new("1", (bx1 - bx0, by1 - by0), 0)
        pts = list(zip((xs - bx0).tolist(), (ys - by0).tolist()))
        ImageDraw.Draw(sub).polygon(pts, fill=1)
        acc[by0:by1, bx0:bx1] ^= np.asarray(sub, dtype=bool)
    if ss == 1:
        return acc.astype(np.float32)
    return acc.reshape(win.h, ss, win.w, ss).mean(axis=(1, 3), dtype=np.float32)


def ring_bbox(ring: np.ndarray) -> Tuple[float, float, float, float]:
    lo = ring.min(axis=0)
    hi = ring.max(axis=0)
    return float(lo[0]), float(lo[1]), float(hi[0]), float(hi[1])


def ring_length(ring: np.ndarray) -> float:
    d = np.diff(ring, axis=0)
    return float(np.hypot(d[:, 0], d[:, 1]).sum())


def decimate(line: np.ndarray, min_step: float, closed: bool = False) -> np.ndarray:
    """Drop vertices closer than ``min_step`` to the last kept one (keeps ends)."""
    if len(line) < 3:
        return line
    keep = [0]
    last = line[0]
    step2 = min_step * min_step
    for i in range(1, len(line) - 1):
        d = line[i] - last
        if d[0] * d[0] + d[1] * d[1] >= step2:
            keep.append(i)
            last = line[i]
    keep.append(len(line) - 1)
    out = line[keep]
    if closed and len(out) > 2 and not np.allclose(out[0], out[-1]):
        out = np.vstack([out, out[:1]])
    return out


def chaikin(line: np.ndarray, iterations: int) -> np.ndarray:
    pts = line
    for _ in range(iterations):
        if len(pts) < 3:
            break
        q = 0.75 * pts[:-1] + 0.25 * pts[1:]
        r = 0.25 * pts[:-1] + 0.75 * pts[1:]
        mid = np.empty((2 * len(q), 2))
        mid[0::2] = q
        mid[1::2] = r
        pts = np.vstack([pts[:1], mid, pts[-1:]])
    return pts


# ------------------------------------------------------------------ noise
_NOISE_COEF: dict = {}


def _noise_coef(seed: int, salt: str, octave: int, c: float, canvas_w: int, canvas_h: int) -> np.ndarray:
    key = (seed, salt, octave, c, canvas_w, canvas_h)
    if key not in _NOISE_COEF:
        gh = int(math.ceil((canvas_h + 2048) / c)) + 6
        gw = int(math.ceil((canvas_w + 2048) / c)) + 6
        grid = rng_for(seed, "noise", salt, octave).random((gh, gw))
        _NOISE_COEF[key] = ndimage.spline_filter(grid, order=3, mode="nearest")
    return _NOISE_COEF[key]


def value_noise(win: Window, cell: float, seed: int, salt: str, canvas_w: int, canvas_h: int,
                octaves: int = 3, persistence: float = 0.5, lattice: int = 4) -> np.ndarray:
    """Fractal value noise in [0, 1], defined on global canvas coordinates.

    Evaluated on a global lattice every ``lattice`` px (aligned to multiples of
    ``lattice``) and bilinearly interpolated, so any window equals the same
    crop of a full-canvas evaluation.
    """
    lat = max(1, int(lattice))
    ly0 = (win.y0 // lat) - 1
    lx0 = (win.x0 // lat) - 1
    ly1 = -(-win.y1 // lat) + 2
    lx1 = -(-win.x1 // lat) + 2
    ys = np.arange(ly0, ly1, dtype=np.float64) * lat + 0.5 * lat
    xs = np.arange(lx0, lx1, dtype=np.float64) * lat + 0.5 * lat
    total = np.zeros((len(ys), len(xs)), dtype=np.float64)
    amp_sum = 0.0
    amp = 1.0
    for octave in range(octaves):
        c = cell / (2 ** octave)
        coef = _noise_coef(seed, salt, octave, c, canvas_w, canvas_h)
        gy = (ys + 1024.0) / c
        gx = (xs + 1024.0) / c
        r0 = max(0, int(math.floor(gy.min())) - 3)
        r1 = min(coef.shape[0], int(math.ceil(gy.max())) + 4)
        c0 = max(0, int(math.floor(gx.min())) - 3)
        c1 = min(coef.shape[1], int(math.ceil(gx.max())) + 4)
        sub = coef[r0:r1, c0:c1]
        cy = np.repeat((gy - r0)[:, None], len(xs), axis=1)
        cx = np.repeat((gx - c0)[None, :], len(ys), axis=0)
        val = ndimage.map_coordinates(sub, [cy, cx], order=3, mode="nearest", prefilter=False)
        total += amp * val
        amp_sum += amp
        amp *= persistence
    lattice_vals = total / amp_sum
    # bilinear from lattice centres to pixel centres
    py = (np.arange(win.y0, win.y1, dtype=np.float64) + 0.5 - 0.5 * lat) / lat - ly0
    px = (np.arange(win.x0, win.x1, dtype=np.float64) + 0.5 - 0.5 * lat) / lat - lx0
    iy = np.floor(py).astype(np.int64)
    ix = np.floor(px).astype(np.int64)
    fy = (py - iy)[:, None]
    fx = (px - ix)[None, :]
    v00 = lattice_vals[np.ix_(iy, ix)]
    v01 = lattice_vals[np.ix_(iy, ix + 1)]
    v10 = lattice_vals[np.ix_(iy + 1, ix)]
    v11 = lattice_vals[np.ix_(iy + 1, ix + 1)]
    out = v00 * (1 - fy) * (1 - fx) + v01 * (1 - fy) * fx + v10 * fy * (1 - fx) + v11 * fy * fx
    return np.clip(out, 0.0, 1.0).astype(np.float32)


def grain(win: Window, seed: int, salt: str = "grain", period: int = 1024) -> np.ndarray:
    """Fine paper grain in [-1, 1], tiled with a long period in global coords."""
    base = rng_for(seed, "grain", salt).random((period, period)).astype(np.float32)
    base = ndimage.gaussian_filter(base, 0.7, mode="wrap")
    base = (base - base.mean()) / (base.std() + 1e-6)
    ys = np.arange(win.y0, win.y1) % period
    xs = np.arange(win.x0, win.x1) % period
    return np.clip(base[np.ix_(ys, xs)] / 2.5, -1.0, 1.0)


def tile_texture(tile: np.ndarray, win: Window, scale: float = 1.0, offset: Tuple[int, int] = (0, 0)) -> np.ndarray:
    """Seamless tile (h, w, c) repeated in global coordinates over ``win``."""
    th, tw = tile.shape[:2]
    if scale != 1.0:
        im = Image.fromarray(np.clip(tile * 255.0 + 0.5, 0, 255).astype(np.uint8))
        im = im.resize((int(round(tw * scale)), int(round(th * scale))), Image.Resampling.LANCZOS)
        tile = np.asarray(im, dtype=np.float32) / 255.0
        th, tw = tile.shape[:2]
    ys = (np.arange(win.y0, win.y1) + offset[1]) % th
    xs = (np.arange(win.x0, win.x1) + offset[0]) % tw
    return tile[np.ix_(ys, xs)]


# ------------------------------------------------------------------ ribbons
def ribbon_fields(lines: Sequence[np.ndarray], win: Window, reach: float):
    """Nearest-segment fields for pixels within ``reach`` px of any polyline.

    Returns (dist, u, side, line_id): distance to the nearest polyline, its
    arclength coordinate, the side sign (+1 left of travel, -1 right) and the
    polyline index (-1 where nothing is within reach).
    """
    dist = np.full((win.h, win.w), np.inf, dtype=np.float32)
    u = np.zeros((win.h, win.w), dtype=np.float32)
    side = np.zeros((win.h, win.w), dtype=np.int8)
    lid = np.full((win.h, win.w), -1, dtype=np.int32)
    for li, line in enumerate(lines):
        if len(line) < 2:
            continue
        seg = np.diff(line, axis=0)
        seg_len = np.hypot(seg[:, 0], seg[:, 1])
        cum = np.concatenate([[0.0], np.cumsum(seg_len)])
        lo = np.minimum(line[:-1], line[1:]) - reach - 1
        hi = np.maximum(line[:-1], line[1:]) + reach + 1
        hit = (hi[:, 0] >= win.x0) & (lo[:, 0] <= win.x1) & (hi[:, 1] >= win.y0) & (lo[:, 1] <= win.y1) & (seg_len > 1e-9)
        for i in np.nonzero(hit)[0]:
            x0 = max(win.x0, int(math.floor(lo[i, 0])))
            y0 = max(win.y0, int(math.floor(lo[i, 1])))
            x1 = min(win.x1, int(math.ceil(hi[i, 0])))
            y1 = min(win.y1, int(math.ceil(hi[i, 1])))
            if x1 <= x0 or y1 <= y0:
                continue
            px = np.arange(x0, x1, dtype=np.float32) + 0.5
            py = np.arange(y0, y1, dtype=np.float32) + 0.5
            ax, ay = float(line[i, 0]), float(line[i, 1])
            dx, dy = float(seg[i, 0]), float(seg[i, 1])
            L2 = dx * dx + dy * dy
            rx = px[None, :] - ax
            ry = py[:, None] - ay
            t = np.clip((rx * dx + ry * dy) / L2, 0.0, 1.0)
            ex = rx - t * dx
            ey = ry - t * dy
            d = np.sqrt(ex * ex + ey * ey)
            sl = (slice(y0 - win.y0, y1 - win.y0), slice(x0 - win.x0, x1 - win.x0))
            cur = dist[sl]
            better = (d < cur) & (d <= reach)
            if not better.any():
                continue
            cur[better] = d[better]
            u[sl][better] = (cum[i] + t * seg_len[i])[better]
            cross = dx * ry - dy * rx
            side[sl][better] = np.where(cross[better] >= 0, -1, 1).astype(np.int8)
            lid[sl][better] = li
    return dist, u, side, lid


def strip_band(strip: np.ndarray, threshold: float = 32 / 255, min_cover: float = 0.03) -> Tuple[float, float]:
    alpha = strip[:, :, 3]
    rows = np.nonzero((alpha > threshold).mean(axis=1) > min_cover)[0]
    return float(rows.min()), float(rows.max() + 1)


def sample_strip(strip: np.ndarray, band: Tuple[float, float], u: np.ndarray, v: np.ndarray, halfwidth) -> np.ndarray:
    """Bilinear sample of a premultiplied RGBA strip (rows, cols, 4).

    ``v`` is the signed across-distance in canvas px (negative = top rows of the
    strip, i.e. the water side of shore strips), ``u`` the along-distance.
    ``halfwidth`` (scalar or array) is the canvas half-width of the strip band.
    """
    rows, cols = strip.shape[:2]
    r0, r1 = band
    rc = 0.5 * (r0 + r1)
    hb = 0.5 * (r1 - r0)
    k = hb / np.maximum(halfwidth, 1e-3)
    rr = rc + v * k
    cc = np.mod(u * k, cols)
    valid = (rr >= 0) & (rr <= rows - 1)
    rr = np.clip(rr, 0, rows - 1)
    ri = np.floor(rr).astype(np.int32)
    ci = np.floor(cc).astype(np.int32) % cols
    fr = (rr - ri)[..., None].astype(np.float32)
    fc = (cc - np.floor(cc))[..., None].astype(np.float32)
    ri1 = np.minimum(ri + 1, rows - 1)
    ci1 = (ci + 1) % cols
    out = (strip[ri, ci] * (1 - fr) * (1 - fc) + strip[ri1, ci] * fr * (1 - fc)
           + strip[ri, ci1] * (1 - fr) * fc + strip[ri1, ci1] * fr * fc)
    out[~valid] = 0.0
    return out.astype(np.float32)


# ------------------------------------------------------------------ compositing
def over(dst_rgb: np.ndarray, src_premul_rgb: np.ndarray, src_a: np.ndarray) -> None:
    """In-place premultiplied 'over' onto an opaque RGB float buffer."""
    dst_rgb *= (1.0 - src_a)[..., None]
    dst_rgb += src_premul_rgb


def over_layer(dst: np.ndarray, src: np.ndarray) -> None:
    """In-place premultiplied RGBA over RGBA (both float32, (h, w, 4))."""
    a = src[..., 3:4]
    dst *= (1.0 - a)
    dst += src


def smoothstep(e0: float, e1: float, x):
    t = np.clip((np.asarray(x, dtype=np.float32) - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def to_uint8(rgb: np.ndarray) -> np.ndarray:
    return np.clip(rgb * 255.0 + 0.5, 0, 255).astype(np.uint8)
