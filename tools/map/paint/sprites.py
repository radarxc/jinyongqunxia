"""Ink-wash material library for the painted world map.

Only existing repository art is used (no new image generation):
- ``assets/default/map/kit/map_kit_*.png``: transparent ink vignettes
  (mountains, snow ranges, hills, sea patches);
- ``assets/default/map/tiles/map_tile_*.png``: seamless fills;
- ``assets/default/map/tiles/map_strip_*.png``: periodic edge strokes.
Every file read is recorded with its sha256 so the manifest can cite it.
"""
from __future__ import annotations

import math
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
from PIL import Image

from geo import ROOT, sha256_file

KIT_DIR = ROOT / "assets" / "default" / "map" / "kit"
TILE_DIR = ROOT / "assets" / "default" / "map" / "tiles"

USED: Dict[str, str] = {}  # repo-relative path -> sha256 (filled on load)


def _record(path: Path) -> None:
    rel = str(path.relative_to(ROOT))
    if rel not in USED:
        USED[rel] = sha256_file(path)


def _load_rgba(path: Path) -> np.ndarray:
    _record(path)
    with Image.open(path) as im:
        return np.asarray(im.convert("RGBA"), dtype=np.uint8).copy()


class Sprite:
    """A transparent vignette cropped to its ink, kept premultiplied."""

    def __init__(self, sid: str, rgba: np.ndarray, orient: str = "none", kind: str = "", source: str = ""):
        self.sid, self.orient, self.kind, self.source = sid, orient, kind, source
        alpha = rgba[:, :, 3]
        ys, xs = np.nonzero(alpha > 8)
        if len(xs) == 0:
            raise ValueError(f"empty sprite {sid}")
        pad = 2
        y0, y1 = max(0, ys.min() - pad), min(rgba.shape[0], ys.max() + 1 + pad)
        x0, x1 = max(0, xs.min() - pad), min(rgba.shape[1], xs.max() + 1 + pad)
        self.rgba = np.ascontiguousarray(rgba[y0:y1, x0:x1])
        a = self.rgba[:, :, 3]
        vy, vx = np.nonzero(a >= 32)
        self.vis = (int(vx.min()), int(vy.min()), int(vx.max()) + 1, int(vy.max()) + 1)
        self.vis_w = self.vis[2] - self.vis[0]
        self.vis_h = self.vis[3] - self.vis[1]
        # anchor = bottom centre of the visible ink (where the mountain stands)
        self.anchor = (0.5 * (self.vis[0] + self.vis[2]), float(self.vis[3]))
        self.size0 = math.sqrt(self.vis_w * self.vis_h)
        self._cache: Dict[Tuple[int, bool], Tuple[np.ndarray, float, float]] = {}

    def render(self, size_px: float, flip: bool, quantum: int = 4) -> Tuple[np.ndarray, float, float]:
        """Premultiplied float32 RGBA scaled so sqrt(visible w*h) ~= size_px.

        Returns (rgba, anchor_x, anchor_y) in the scaled array's pixels.
        """
        q = max(quantum, int(round(size_px / quantum)) * quantum)
        key = (q, bool(flip))
        if key not in self._cache:
            s = q / self.size0
            h0, w0 = self.rgba.shape[:2]
            w = max(2, int(round(w0 * s)))
            h = max(2, int(round(h0 * s)))
            im = Image.fromarray(self.rgba, "RGBA").convert("RGBa").resize((w, h), Image.Resampling.LANCZOS)
            arr = np.asarray(im, dtype=np.float32) / 255.0
            arr = np.clip(arr, 0.0, 1.0)
            arr[..., :3] = np.minimum(arr[..., :3], arr[..., 3:4])
            if WARM_WHITES is not None and self.kind not in ("tree", "haimian", "xueshan"):
                arr = _warm_whites(arr, *WARM_WHITES)
            ax = self.anchor[0] * w / w0
            ay = self.anchor[1] * h / h0
            if flip:
                arr = arr[:, ::-1].copy()
                ax = w - ax
            self._cache[key] = (np.ascontiguousarray(arr), ax, ay)
        return self._cache[key]


WARM_WHITES: Optional[Tuple[Tuple[float, float, float], float, float, float]] = None


def _warm_whites(arr: np.ndarray, color, strength: float, alpha_cut: float = 0.0, lum_from: float = 0.8) -> np.ndarray:
    """Turn near-white, unsaturated ink (the mist fringes of kit vignettes) into a
    thinner paper-coloured haze: colour pulled to ``color``, opacity cut by
    ``alpha_cut`` at full whiteness.  Snow pieces are not passed through here."""
    a = arr[..., 3:4]
    rgb = np.where(a > 1e-4, arr[..., :3] / np.maximum(a, 1e-4), 0.0)
    lum = rgb.mean(axis=2, keepdims=True)
    sat = rgb.max(axis=2, keepdims=True) - rgb.min(axis=2, keepdims=True)
    w = np.clip((lum - lum_from) / 0.12, 0, 1) * np.clip(1 - sat / 0.12, 0, 1)
    target = np.asarray(color, dtype=np.float32)
    rgb = rgb * (1 - w * strength) + target * (w * strength)
    a2 = a * (1.0 - alpha_cut * w)
    out = np.empty_like(arr)
    out[..., :3] = rgb * a2
    out[..., 3:4] = a2
    return out


def load_kit(names: List[str]) -> Dict[str, Sprite]:
    import yaml  # PyYAML is already a repo tool dependency

    manifest = yaml.safe_load((KIT_DIR / "manifest.yaml").read_text(encoding="utf-8"))
    meta = {row.get("id"): row for row in manifest if isinstance(row, dict)}
    out = {}
    for name in names:
        sid = f"map_kit_{name}"
        path = KIT_DIR / f"{sid}.png"
        kit = (meta.get(sid) or {}).get("kit") or {}
        out[name] = Sprite(name, _load_rgba(path), kit.get("orient", "none"), kit.get("kind", ""), str(path.relative_to(ROOT)))
    return out


def load_tile(name: str) -> np.ndarray:
    path = TILE_DIR / f"map_tile_{name}.png"
    return _load_rgba(path)[:, :, :3].astype(np.float32) / 255.0


def load_strip(name: str) -> np.ndarray:
    path = TILE_DIR / f"map_strip_{name}.png"
    with Image.open(path) as im:
        _record(path)
        arr = np.asarray(im.convert("RGBA").convert("RGBa"), dtype=np.float32) / 255.0
    arr = np.clip(arr, 0.0, 1.0)
    arr[..., :3] = np.minimum(arr[..., :3], arr[..., 3:4])
    return np.ascontiguousarray(arr)


def mist_puffs(seed: int, count: int = 6, w: int = 320, h: int = 96) -> List[np.ndarray]:
    """Soft irregular white puffs (alpha only, float32 h×w) for mountain feet."""
    from raster import rng_for
    from scipy import ndimage

    out = []
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx + 0.5) / w * 2 - 1
    ny = (yy + 0.5) / h * 2 - 1
    for i in range(count):
        r = rng_for(seed, "puff", i)
        field = r.random((h // 8 + 3, w // 8 + 3)).astype(np.float32)
        field = ndimage.zoom(field, 8, order=3)[:h, :w]
        field = ndimage.gaussian_filter(field, 6)
        field = (field - field.min()) / (np.ptp(field) + 1e-6)
        ell = 1.0 - np.sqrt(nx * nx + (ny * 1.15) ** 2)
        a = np.clip(ell * 1.6 + (field - 0.5) * 0.9, 0, 1)
        a = ndimage.gaussian_filter(a, 3)
        out.append(a.astype(np.float32))
    return out


BASELINE_JIANGHU = ROOT / "assets" / "default" / "baseline" / "map" / "ref_map_jianghu__ch01_base01.png"


def baseline_tree_stamps(cfg: dict) -> List[Sprite]:
    """Cut tree groups out of the author-approved jianghu map.

    Deterministic: alpha comes from how much darker a pixel is than the local
    paper (80th percentile in a 45 px window) inside dilated components of dark,
    slightly green ink found in the plains of the approved map; components that
    touch river water, city icons or are line-like are skipped.
    """
    from scipy import ndimage

    rgba = _load_rgba(BASELINE_JIANGHU)
    im = rgba[:, :, :3].astype(np.float32)
    H, W = im.shape[:2]
    lum = im @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    small = lum[::3, ::3]
    bg_s = ndimage.percentile_filter(small, 80, size=15)
    bg = ndimage.zoom(bg_s, 3, order=1)[:H, :W]
    if bg.shape != lum.shape:
        bg = np.pad(bg, ((0, H - bg.shape[0]), (0, W - bg.shape[1])), mode="edge")
    d = bg - lum
    gr = im[..., 1] - im[..., 0]
    blue = (im[..., 2] - im[..., 0] > -2) & (lum > 150) & (lum < 228)
    region = np.zeros((H, W), dtype=bool)
    x0, y0, x1, y1 = cfg["search_box"]
    region[y0:y1, x0:x1] = True
    for bx0, by0, bx1, by1 in cfg["exclude_boxes"]:
        region[max(0, by0 - 10):by1 + 10, max(0, bx0 - 10):bx1 + 10] = False
    seed = (d > cfg["dark_min"]) & (gr > cfg["green_min"]) & region & (bg > 170)
    close = ndimage.binary_closing(seed, iterations=2)
    lab, _ = ndimage.label(ndimage.binary_dilation(close, iterations=1))
    out: List[Sprite] = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if sl is None:
            continue
        comp = lab[sl] == i + 1
        area = int(comp.sum())
        h = sl[0].stop - sl[0].start
        w = sl[1].stop - sl[1].start
        if area < cfg["area"][0] or area > cfg["area"][1] or min(w, h) < 10:
            continue
        if area / float(w * h) < 0.2:
            continue
        ys, xs = np.nonzero(comp)
        cov = np.cov(np.vstack([xs, ys]))
        ev = np.linalg.eigvalsh(cov)
        if ev[0] <= 0 or ev[1] / ev[0] > cfg["max_elongation"]:
            continue
        sy0, sy1 = max(0, sl[0].start - 8), min(H, sl[0].stop + 6)
        sx0, sx1 = max(0, sl[1].start - 8), min(W, sl[1].stop + 8)
        if blue[sy0:sy1, sx0:sx1].mean() > cfg["max_blue"]:
            continue
        m = np.zeros((sy1 - sy0, sx1 - sx0), dtype=np.float32)
        m[sl[0].start - sy0:sl[0].stop - sy0, sl[1].start - sx0:sl[1].stop - sx0] = comp
        m = ndimage.binary_dilation(m > 0, iterations=3).astype(np.float32)
        m = ndimage.gaussian_filter(m, 1.5)
        a = np.clip((d[sy0:sy1, sx0:sx1] - 8.0) / 36.0, 0, 1) * m
        if float((a > 0.5).mean()) < cfg["min_fill"]:
            continue
        sub = im[sy0:sy1, sx0:sx1]
        wsum = float(a.sum()) + 1e-6
        if float(((sub[..., 2] - sub[..., 0]) * a).sum() / wsum) > cfg["max_blue_tint"]:
            continue
        stamp = np.zeros((sy1 - sy0, sx1 - sx0, 4), dtype=np.uint8)
        stamp[..., :3] = rgba[sy0:sy1, sx0:sx1, :3]
        stamp[..., 3] = np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8)
        try:
            out.append(Sprite(f"tree_{sx0}_{sy0}", stamp, "none", "tree", str(BASELINE_JIANGHU.relative_to(ROOT))))
        except ValueError:
            continue
    return out
