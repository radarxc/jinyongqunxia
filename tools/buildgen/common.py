"""Deterministic image primitives for the town build-kit generators."""

from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np
from PIL import Image

MASTER_SIZE = 1024
FIXED_CREATED = "2026-10-11T00:00:00Z"


def derived_seed(kit: str, layer: str, salt: str = "") -> int:
    """Return a stable 64-bit seed; never use Python's salted hash()."""
    payload = f"tianshu/buildkit/v1/{kit}/{layer}/{salt}".encode("utf-8")
    return int.from_bytes(hashlib.sha256(payload).digest()[:8], "big")


def rng_for(kit: str, layer: str, salt: str = "") -> np.random.Generator:
    return np.random.default_rng(derived_seed(kit, layer, salt))


def hex_rgb(value: str) -> np.ndarray:
    value = value.lstrip("#")
    return np.array([int(value[i : i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def _smoothstep(value: np.ndarray) -> np.ndarray:
    return value * value * (3.0 - 2.0 * value)


def periodic_value_noise(
    size: int, cells_x: int, cells_y: int, seed: int
) -> np.ndarray:
    """Bilinearly sample a wrapped random lattice on a 2-D torus."""
    generator = np.random.default_rng(seed)
    lattice = generator.random((cells_y, cells_x), dtype=np.float32)
    x = np.arange(size, dtype=np.float32) * cells_x / size
    y = np.arange(size, dtype=np.float32) * cells_y / size
    xi = np.floor(x).astype(np.int32)
    yi = np.floor(y).astype(np.int32)
    tx = _smoothstep(x - xi)[None, :]
    ty = _smoothstep(y - yi)[:, None]
    x1 = (xi + 1) % cells_x
    y1 = (yi + 1) % cells_y
    a = lattice[yi[:, None], xi[None, :]]
    b = lattice[yi[:, None], x1[None, :]]
    c = lattice[y1[:, None], xi[None, :]]
    d = lattice[y1[:, None], x1[None, :]]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty


def fractal_noise(
    size: int, base_cells: int, octaves: int, seed: int
) -> np.ndarray:
    """Periodic fBm with integer octave frequencies and unit-ish range."""
    result = np.zeros((size, size), dtype=np.float32)
    amplitude = 1.0
    total = 0.0
    for octave in range(octaves):
        cells = base_cells * (2**octave)
        result += amplitude * periodic_value_noise(size, cells, cells, seed + octave)
        total += amplitude
        amplitude *= 0.5
    return result / total


def colorize(base: str, value: np.ndarray, amount: float) -> np.ndarray:
    """Apply a neutral luminance perturbation to a palette base."""
    rgb = hex_rgb(base)[None, None, :]
    delta = (value[..., None] - 0.5) * (2.0 * amount * 255.0)
    return np.clip(rgb + delta, 0, 255)


def enforce_matching_edges(rgb: np.ndarray) -> np.ndarray:
    """Cosine-like edge fusion plus identical opposite edge texels."""
    out = np.asarray(rgb, dtype=np.float32).copy()
    band = min(32, out.shape[0] // 16, out.shape[1] // 16)
    original = out.copy()
    horizontal = (original[:, band, :] + original[:, -band - 1, :]) * 0.5
    for offset in range(band + 1):
        position = offset / band
        weight = position * position * (3 - 2 * position)
        out[:, offset, :] = horizontal * (1 - weight) + original[:, offset, :] * weight
        out[:, -offset - 1, :] = horizontal * (1 - weight) + original[:, -offset - 1, :] * weight
    original = out.copy()
    vertical = (original[band, :, :] + original[-band - 1, :, :]) * 0.5
    for offset in range(band + 1):
        position = offset / band
        weight = position * position * (3 - 2 * position)
        out[offset, :, :] = vertical * (1 - weight) + original[offset, :, :] * weight
        out[-offset - 1, :, :] = vertical * (1 - weight) + original[-offset - 1, :, :] * weight
    horizontal = (out[:, 0, :] + out[:, -1, :]) * 0.5
    out[:, 0, :] = horizontal
    out[:, -1, :] = horizontal
    vertical = (out[0, :, :] + out[-1, :, :]) * 0.5
    out[0, :, :] = vertical
    out[-1, :, :] = vertical
    corner = out[[0, 0, -1, -1], [0, -1, 0, -1], :].mean(axis=0)
    out[[0, 0, -1, -1], [0, -1, 0, -1], :] = corner
    return np.rint(np.clip(out, 0, 255)).astype(np.uint8)


def save_png(rgb: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.fromarray(enforce_matching_edges(rgb), mode="RGB")
    image.save(path, format="PNG", optimize=True, compress_level=9)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def resize_layer(path: Path, size: int) -> Image.Image:
    with Image.open(path) as image:
        return image.convert("RGB").resize((size, size), Image.Resampling.LANCZOS)


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Convert sRGB bytes to CIE L*a*b* using D65."""
    value = np.asarray(rgb, dtype=np.float64) / 255.0
    linear = np.where(value <= 0.04045, value / 12.92, ((value + 0.055) / 1.055) ** 2.4)
    xyz = linear @ np.array(
        [[0.4124564, 0.3575761, 0.1804375],
         [0.2126729, 0.7151522, 0.0721750],
         [0.0193339, 0.1191920, 0.9503041]],
        dtype=np.float64,
    ).T
    xyz /= np.array([0.95047, 1.0, 1.08883], dtype=np.float64)
    epsilon = 216 / 24389
    kappa = 24389 / 27
    f = np.where(xyz > epsilon, np.cbrt(xyz), (kappa * xyz + 16) / 116)
    return np.stack(
        [116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])],
        axis=-1,
    )


def delta_e_2000(lab1: np.ndarray, lab2: np.ndarray) -> np.ndarray:
    """Vectorized CIEDE2000, with all weighting factors fixed at one."""
    l1, a1, b1 = np.moveaxis(np.asarray(lab1, dtype=np.float64), -1, 0)
    l2, a2, b2 = np.moveaxis(np.asarray(lab2, dtype=np.float64), -1, 0)
    c1 = np.hypot(a1, b1)
    c2 = np.hypot(a2, b2)
    cbar = (c1 + c2) / 2
    g = 0.5 * (1 - np.sqrt(cbar**7 / (cbar**7 + 25**7)))
    ap1, ap2 = (1 + g) * a1, (1 + g) * a2
    cp1, cp2 = np.hypot(ap1, b1), np.hypot(ap2, b2)
    hp1 = np.mod(np.degrees(np.arctan2(b1, ap1)), 360)
    hp2 = np.mod(np.degrees(np.arctan2(b2, ap2)), 360)
    dl = l2 - l1
    dc = cp2 - cp1
    dh = hp2 - hp1
    dh = np.where(dh > 180, dh - 360, np.where(dh < -180, dh + 360, dh))
    dh = np.where((cp1 * cp2) == 0, 0, dh)
    d_h = 2 * np.sqrt(cp1 * cp2) * np.sin(np.radians(dh / 2))
    lbar = (l1 + l2) / 2
    cpbar = (cp1 + cp2) / 2
    hsum = hp1 + hp2
    hdiff = np.abs(hp1 - hp2)
    hpbar = np.where(
        (cp1 * cp2) == 0, hsum,
        np.where(hdiff <= 180, hsum / 2, np.where(hsum < 360, (hsum + 360) / 2, (hsum - 360) / 2)),
    )
    t = (1 - 0.17 * np.cos(np.radians(hpbar - 30))
         + 0.24 * np.cos(np.radians(2 * hpbar))
         + 0.32 * np.cos(np.radians(3 * hpbar + 6))
         - 0.20 * np.cos(np.radians(4 * hpbar - 63)))
    sl = 1 + 0.015 * (lbar - 50) ** 2 / np.sqrt(20 + (lbar - 50) ** 2)
    sc = 1 + 0.045 * cpbar
    sh = 1 + 0.015 * cpbar * t
    rt = (-2 * np.sqrt(cpbar**7 / (cpbar**7 + 25**7))
          * np.sin(np.radians(60 * np.exp(-((hpbar - 275) / 25) ** 2))))
    return np.sqrt((dl / sl) ** 2 + (dc / sc) ** 2 + (d_h / sh) ** 2
                   + rt * (dc / sc) * (d_h / sh))


def seam_delta_e(rgb: np.ndarray) -> float:
    lab = rgb_to_lab(rgb)
    horizontal = delta_e_2000(lab[:, 0], lab[:, -1])
    vertical = delta_e_2000(lab[0], lab[-1])
    return float(max(horizontal.max(initial=0), vertical.max(initial=0)))
