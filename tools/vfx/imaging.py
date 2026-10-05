"""Shared linear-light, premultiplied-alpha image operations (design/23 §4)."""

from __future__ import annotations

import math

import numpy as np
from PIL import Image


def srgb_decode(value: np.ndarray) -> np.ndarray:
    """Decode normalized sRGB; alpha must never pass through this function."""
    value = np.clip(np.asarray(value, dtype=np.float32), 0, 1)
    return np.where(value <= 0.04045, value / 12.92,
                    ((value + 0.055) / 1.055) ** 2.4)


def srgb_encode(value: np.ndarray) -> np.ndarray:
    """Encode normalized linear RGB without integer overflow or HDR wrapping."""
    value = np.clip(np.asarray(value, dtype=np.float32), 0, 1)
    return np.where(value <= 0.0031308, value * 12.92,
                    1.055 * value ** (1 / 2.4) - 0.055)


def to_premultiplied(image: Image.Image) -> np.ndarray:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255
    rgba[..., :3] = srgb_decode(rgba[..., :3]) * rgba[..., 3:4]
    return rgba


def from_premultiplied(rgba: np.ndarray) -> Image.Image:
    rgba = np.clip(np.asarray(rgba, dtype=np.float32), 0, 1)
    alpha = rgba[..., 3:4]
    straight = np.divide(rgba[..., :3], alpha,
                         out=np.zeros_like(rgba[..., :3]), where=alpha > 0)
    encoded = np.concatenate((srgb_encode(straight), alpha), axis=-1)
    pixels = np.rint(encoded * 255).astype(np.uint8)
    pixels[pixels[..., 3] == 0, :3] = 0
    return Image.fromarray(pixels, "RGBA")


def blend(back: np.ndarray, front: np.ndarray, mode: str = "normal") -> np.ndarray:
    """Blend two linear premultiplied RGBA arrays in background/source order."""
    back, front = np.asarray(back), np.asarray(front)
    ab, af = back[..., 3:4], front[..., 3:4]
    pb, pf = back[..., :3], front[..., :3]
    if mode == "lighter":
        alpha = np.minimum(1, ab + af)
        rgb = np.minimum(alpha, np.minimum(1, pb + pf))
    elif mode == "normal":
        alpha = af + ab * (1 - af)
        rgb = pf + pb * (1 - af)
    elif mode in ("multiply", "screen"):
        cb = np.divide(pb, ab, out=np.zeros_like(pb), where=ab > 0)
        cf = np.divide(pf, af, out=np.zeros_like(pf), where=af > 0)
        mixed = cb * cf if mode == "multiply" else 1 - (1 - cb) * (1 - cf)
        alpha = af + ab * (1 - af)
        rgb = pf * (1 - ab) + af * ab * mixed + pb * (1 - af)
    else:
        raise ValueError(f"未知混合模式：{mode}")
    return np.clip(np.concatenate((rgb, alpha), axis=-1), 0, 1)


def rotation(angle: float) -> np.ndarray:
    """Screen-coordinate rotation: positive radians turn clockwise."""
    cosine, sine = math.cos(angle), math.sin(angle)
    return np.array([[cosine, -sine], [sine, cosine]], dtype=np.float64)


def warp(rgba: np.ndarray, matrix: np.ndarray, offset: np.ndarray,
         size_px: tuple[int, int] | list[int]) -> np.ndarray:
    """Inverse-sample p_out=M*p+offset; integer boundaries, half-pixel centers.

    Each row chunk bounds temporary memory. Transparent exterior participates
    in bilinear interpolation; interpolation always includes alpha and P.
    """
    width, height = size_px
    inverse = np.linalg.inv(np.asarray(matrix, dtype=np.float64))
    offset = np.asarray(offset, dtype=np.float64)
    source_h, source_w = rgba.shape[:2]
    output = np.zeros((height, width, 4), dtype=np.float32)
    output_x = np.arange(width, dtype=np.float64)[None, :] + 0.5
    for first in range(0, height, 64):
        last = min(first + 64, height)
        output_y = np.arange(first, last, dtype=np.float64)[:, None] + 0.5
        local_x, local_y = output_x - offset[0], output_y - offset[1]
        x = inverse[0, 0] * local_x + inverse[0, 1] * local_y - 0.5
        y = inverse[1, 0] * local_x + inverse[1, 1] * local_y - 0.5
        x0, y0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
        frac_x, frac_y = x - x0, y - y0
        target = output[first:last]
        for dx, dy in ((0, 0), (1, 0), (0, 1), (1, 1)):
            xi, yi = x0 + dx, y0 + dy
            valid = (xi >= 0) & (xi < source_w) & (yi >= 0) & (yi < source_h)
            weight = (frac_x if dx else 1 - frac_x) * (frac_y if dy else 1 - frac_y)
            values = rgba[np.clip(yi, 0, source_h - 1), np.clip(xi, 0, source_w - 1)]
            target += values * (weight * valid)[..., None].astype(np.float32)
    return output
