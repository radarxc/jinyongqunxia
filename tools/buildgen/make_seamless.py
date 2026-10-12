#!/usr/bin/env python3
"""Normalize generated texture samples into deterministic seamless layers.

The seam repair uses a half-image offset, a raised-cosine feather over the
resulting centre cross, and a final symmetric edge-band fusion.  The latter
also makes the first and last texels identical so the measured tile boundary
is continuous after 8-bit PNG quantization.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

DEFAULT_REPEAT_THRESHOLD = 50.0


def _parse_extent(value: str, option: str) -> tuple[float, float]:
    parts = value.lower().split("x")
    if len(parts) == 1:
        parts *= 2
    if len(parts) != 2:
        raise argparse.ArgumentTypeError(f"{option} must be M or WxH")
    try:
        extent = (float(parts[0]), float(parts[1]))
    except ValueError as error:
        raise argparse.ArgumentTypeError(f"{option} must contain numbers") from error
    if not all(math.isfinite(item) and item > 0 for item in extent):
        raise argparse.ArgumentTypeError(f"{option} values must be positive")
    return extent


def scale_to_repeat(
    image: Image.Image,
    size: int,
    repeat_m: tuple[float, float],
    src_scale_m: tuple[float, float] | None,
) -> np.ndarray:
    """Resize and top-left tile/crop ``image`` to one repeat extent.

    A source covering 2 m and a requested 1 m repeat is resized to one half
    along that axis, then repeated twice, as required by the build-kit spec.
    """
    if size <= 0:
        raise ValueError("size must be positive")
    rgb = image.convert("RGB")
    if src_scale_m is None:
        return np.asarray(
            rgb.resize((size, size), Image.Resampling.LANCZOS), dtype=np.uint8
        ).copy()
    target_w = max(1, round(size * repeat_m[0] / src_scale_m[0]))
    target_h = max(1, round(size * repeat_m[1] / src_scale_m[1]))
    sample = np.asarray(
        rgb.resize((target_w, target_h), Image.Resampling.LANCZOS), dtype=np.uint8
    )
    copies_x = math.ceil(size / target_w)
    copies_y = math.ceil(size / target_h)
    return np.tile(sample, (copies_y, copies_x, 1))[:size, :size].copy()


def _rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    value = np.asarray(rgb, dtype=np.float64) / 255.0
    linear = np.where(
        value <= 0.04045, value / 12.92, ((value + 0.055) / 1.055) ** 2.4
    )
    xyz = linear @ np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ]
    ).T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    epsilon, kappa = 216 / 24389, 24389 / 27
    f = np.where(xyz > epsilon, np.cbrt(xyz), (kappa * xyz + 16) / 116)
    return np.stack(
        (116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]),
         200 * (f[..., 1] - f[..., 2])),
        axis=-1,
    )


def _lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    value = np.asarray(lab, dtype=np.float64)
    fy = (value[..., 0] + 16) / 116
    fx = fy + value[..., 1] / 500
    fz = fy - value[..., 2] / 200
    epsilon, kappa = 216 / 24389, 24389 / 27
    f = np.stack((fx, fy, fz), axis=-1)
    xyz = np.where(f**3 > epsilon, f**3, (116 * f - 16) / kappa)
    xyz *= np.array([0.95047, 1.0, 1.08883])
    linear = xyz @ np.array(
        [
            [3.2404542, -1.5371385, -0.4985314],
            [-0.9692660, 1.8760108, 0.0415560],
            [0.0556434, -0.2040259, 1.0572252],
        ]
    ).T
    srgb = np.where(
        linear <= 0.0031308, 12.92 * linear,
        1.055 * np.maximum(linear, 0) ** (1 / 2.4) - 0.055,
    )
    return np.rint(np.clip(srgb, 0, 1) * 255).astype(np.uint8)


def delta_e_2000(lab1: np.ndarray, lab2: np.ndarray) -> np.ndarray:
    """Return vectorized CIEDE2000 with all weighting factors equal to 1."""
    l1, a1, b1 = np.moveaxis(np.asarray(lab1, dtype=np.float64), -1, 0)
    l2, a2, b2 = np.moveaxis(np.asarray(lab2, dtype=np.float64), -1, 0)
    c1, c2 = np.hypot(a1, b1), np.hypot(a2, b2)
    cbar = (c1 + c2) / 2
    g = 0.5 * (1 - np.sqrt(cbar**7 / (cbar**7 + 25**7)))
    ap1, ap2 = (1 + g) * a1, (1 + g) * a2
    cp1, cp2 = np.hypot(ap1, b1), np.hypot(ap2, b2)
    hp1 = np.mod(np.degrees(np.arctan2(b1, ap1)), 360)
    hp2 = np.mod(np.degrees(np.arctan2(b2, ap2)), 360)
    dl, dc = l2 - l1, cp2 - cp1
    dh = hp2 - hp1
    dh = np.where(dh > 180, dh - 360, np.where(dh < -180, dh + 360, dh))
    dh = np.where(cp1 * cp2 == 0, 0, dh)
    big_dh = 2 * np.sqrt(cp1 * cp2) * np.sin(np.radians(dh / 2))
    lbar, cpbar = (l1 + l2) / 2, (cp1 + cp2) / 2
    hsum, hdiff = hp1 + hp2, np.abs(hp1 - hp2)
    hpbar = np.where(
        cp1 * cp2 == 0,
        hsum,
        np.where(
            hdiff <= 180, hsum / 2,
            np.where(hsum < 360, (hsum + 360) / 2, (hsum - 360) / 2),
        ),
    )
    t = (
        1 - 0.17 * np.cos(np.radians(hpbar - 30))
        + 0.24 * np.cos(np.radians(2 * hpbar))
        + 0.32 * np.cos(np.radians(3 * hpbar + 6))
        - 0.20 * np.cos(np.radians(4 * hpbar - 63))
    )
    sl = 1 + 0.015 * (lbar - 50) ** 2 / np.sqrt(20 + (lbar - 50) ** 2)
    sc, sh = 1 + 0.045 * cpbar, 1 + 0.015 * cpbar * t
    rt = (
        -2 * np.sqrt(cpbar**7 / (cpbar**7 + 25**7))
        * np.sin(np.radians(60 * np.exp(-((hpbar - 275) / 25) ** 2)))
    )
    return np.sqrt(
        (dl / sl) ** 2 + (dc / sc) ** 2 + (big_dh / sh) ** 2
        + rt * (dc / sc) * (big_dh / sh)
    )


def mean_delta_e(rgb1: np.ndarray, rgb2: np.ndarray) -> float:
    """Mean pixel CIEDE2000; arrays must have the same shape."""
    if np.shape(rgb1) != np.shape(rgb2):
        raise ValueError("mean_delta_e arrays must have the same shape")
    return float(np.mean(delta_e_2000(_rgb_to_lab(rgb1), _rgb_to_lab(rgb2))))


def seam_delta_e(rgb: np.ndarray) -> dict[str, float]:
    """Return mean opposite-edge differences and their maximum in CIEDE2000."""
    lab = _rgb_to_lab(rgb)
    left_right = float(np.mean(delta_e_2000(lab[:, 0], lab[:, -1])))
    top_bottom = float(np.mean(delta_e_2000(lab[0], lab[-1])))
    return {
        "left_right": left_right,
        "top_bottom": top_bottom,
        "max": max(left_right, top_bottom),
    }


def _fuse_central_axis(array: np.ndarray, axis: int, band: int) -> np.ndarray:
    """Symmetrically feather the two sides of a central seam."""
    out = array.copy()
    centre = out.shape[axis] // 2
    band = min(band, centre, out.shape[axis] - centre)
    if band <= 0:
        return out
    source = out.copy()
    for offset in range(band):
        left, right = centre - 1 - offset, centre + offset
        position = offset / max(1, band - 1)
        keep = position * position * (3 - 2 * position)
        left_slice = [slice(None)] * out.ndim
        right_slice = [slice(None)] * out.ndim
        left_slice[axis], right_slice[axis] = left, right
        pair_mean = (source[tuple(left_slice)] + source[tuple(right_slice)]) * 0.5
        out[tuple(left_slice)] = (
            pair_mean * (1 - keep) + source[tuple(left_slice)] * keep
        )
        out[tuple(right_slice)] = (
            pair_mean * (1 - keep) + source[tuple(right_slice)] * keep
        )
    return out


def make_seamless(rgb: np.ndarray, blend: float = 0.12) -> np.ndarray:
    """Move boundaries to the centre, feather the cross, then move it back."""
    source = np.asarray(rgb, dtype=np.float32)
    if source.ndim != 3 or source.shape[2] != 3:
        raise ValueError("make_seamless expects an HxWx3 RGB array")
    if not 0 < blend <= 0.5:
        raise ValueError("blend must be in (0, 0.5]")
    shift_y, shift_x = source.shape[0] // 2, source.shape[1] // 2
    shifted = np.roll(source, (shift_y, shift_x), axis=(0, 1))
    # ``blend * dimension`` is the full feather width, split across the seam.
    shifted = _fuse_central_axis(
        shifted, axis=1, band=max(1, round(blend * source.shape[1] / 2))
    )
    shifted = _fuse_central_axis(
        shifted, axis=0, band=max(1, round(blend * source.shape[0] / 2))
    )
    repaired = np.roll(shifted, (-shift_y, -shift_x), axis=(0, 1))
    result = np.rint(np.clip(repaired, 0, 255)).astype(np.uint8)
    # Rounding and the second axis pass can differ by one code value at corners.
    edge = np.rint((result[:, 0].astype(float) + result[:, -1]) * 0.5).astype(np.uint8)
    result[:, 0] = edge
    result[:, -1] = edge
    edge = np.rint((result[0].astype(float) + result[-1]) * 0.5).astype(np.uint8)
    result[0] = edge
    result[-1] = edge
    corner = np.rint(
        result[[0, 0, -1, -1], [0, -1, 0, -1]].astype(float).mean(axis=0)
    ).astype(np.uint8)
    result[[0, 0, -1, -1], [0, -1, 0, -1]] = corner
    return result


def match_color_lab(rgb: np.ndarray, reference: np.ndarray) -> np.ndarray:
    """Match per-channel Lab mean/std; spatial texture is left untouched."""
    lab = _rgb_to_lab(rgb)
    ref_lab = _rgb_to_lab(reference)
    axes = tuple(range(lab.ndim - 1))
    ref_axes = tuple(range(ref_lab.ndim - 1))
    mean = lab.mean(axis=axes)
    std = lab.std(axis=axes)
    ref_mean = ref_lab.mean(axis=ref_axes)
    ref_std = ref_lab.std(axis=ref_axes)
    scale = np.divide(ref_std, std, out=np.ones(3), where=std > 1e-6)
    return _lab_to_rgb((lab - mean) * scale + ref_mean)


def color_delta_e(rgb: np.ndarray, reference: np.ndarray) -> float:
    """CIEDE2000 between the mean Lab colors of two images."""
    lab_mean = _rgb_to_lab(rgb).reshape(-1, 3).mean(axis=0)
    ref_mean = _rgb_to_lab(reference).reshape(-1, 3).mean(axis=0)
    return float(delta_e_2000(lab_mean, ref_mean))


def analyze_repetition(
    rgb: np.ndarray, threshold: float = DEFAULT_REPEAT_THRESHOLD
) -> dict[str, Any]:
    """Find the strongest non-DC 2-D FFT peak and classify short repetition."""
    value = np.asarray(rgb, dtype=np.float64)
    gray = value[..., 0] * 0.2126 + value[..., 1] * 0.7152 + value[..., 2] * 0.0722
    power = np.abs(np.fft.fft2(gray)) ** 2
    power[0, 0] = 0.0
    peak_index = np.unravel_index(int(np.argmax(power)), power.shape)
    peak = float(power[peak_index])
    # Average all non-DC bins, including exact zeros: they are part of the
    # spectrum and must not artificially weaken the peak/mean ratio.
    mean_energy = float(power.sum() / max(1, power.size - 1))
    ratio = peak / mean_energy if mean_energy > 0 else 0.0
    height, width = gray.shape
    fy = int(round(np.fft.fftfreq(height)[peak_index[0]] * height))
    fx = int(round(np.fft.fftfreq(width)[peak_index[1]] * width))
    cycles = math.hypot(fx, fy)
    period = min(width, height) / cycles if cycles > 0 else None
    warning = bool(
        period is not None
        and period < min(width, height) / 3
        and ratio > threshold
    )
    return {
        "frequency": [fx, fy],
        "period_px": round(period, 6) if period is not None else None,
        "energy_ratio": round(ratio, 6),
        "threshold": threshold,
        "warning": warning,
    }


def _save_png(rgb: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgb, mode="RGB").save(
        path, format="PNG", optimize=True, compress_level=9
    )


def process(
    input_path: Path,
    output_path: Path,
    size: int,
    repeat_m: tuple[float, float],
    src_scale_m: tuple[float, float] | None = None,
    reference_path: Path | None = None,
    match_color: bool = False,
    blend: float = 0.12,
) -> dict[str, Any]:
    """Run the complete layer pipeline and return its JSON-ready summary."""
    if match_color and reference_path is None:
        raise ValueError("--match-color requires --ref")
    with Image.open(input_path) as opened:
        normalized = scale_to_repeat(opened, size, repeat_m, src_scale_m)
    result = make_seamless(normalized, blend)
    reference: np.ndarray | None = None
    if reference_path is not None:
        with Image.open(reference_path) as opened:
            reference = np.asarray(opened.convert("RGB"), dtype=np.uint8)
    if match_color and reference is not None:
        result = match_color_lab(result, reference)
    seams = seam_delta_e(result)
    color_de = color_delta_e(result, reference) if reference is not None else None
    repetition = analyze_repetition(result)
    _save_png(result, output_path)
    preview = np.tile(result, (3, 3, 1))
    preview_path = Path(f"{output_path}.tile3x3.png")
    _save_png(preview, preview_path)
    return {
        "input": str(input_path),
        "output": str(output_path),
        "preview": str(preview_path),
        "size": [size, size],
        "repeat_m": [repeat_m[0], repeat_m[1]],
        "src_scale_m": (
            [src_scale_m[0], src_scale_m[1]] if src_scale_m is not None else None
        ),
        "blend": blend,
        "seam_delta_e2000": {key: round(value, 6) for key, value in seams.items()},
        "color_delta_e2000": round(color_de, 6) if color_de is not None else None,
        "repeat_peak": repetition,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--in", dest="input_path", type=Path, required=True)
    parser.add_argument("--out", dest="output_path", type=Path, required=True)
    parser.add_argument("--size", type=int, default=1024)
    parser.add_argument("--repeat-m", required=True, metavar="WxH")
    parser.add_argument(
        "--src-scale-m", metavar="M|WxH",
        help="real metres covered by the source sample (one value means square)",
    )
    parser.add_argument("--ref", dest="reference_path", type=Path)
    parser.add_argument("--match-color", action="store_true")
    parser.add_argument("--blend", type=float, default=0.12)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        repeat_m = _parse_extent(args.repeat_m, "--repeat-m")
        src_scale_m = (
            _parse_extent(args.src_scale_m, "--src-scale-m")
            if args.src_scale_m is not None else None
        )
        summary = process(
            args.input_path, args.output_path, args.size, repeat_m, src_scale_m,
            args.reference_path, args.match_color, args.blend,
        )
    except (OSError, ValueError) as error:
        parser.error(str(error))
    if summary["repeat_peak"]["warning"]:
        print("REPEAT_PATTERN", file=sys.stderr)
    print(json.dumps(summary, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
