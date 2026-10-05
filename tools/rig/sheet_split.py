#!/usr/bin/env python3
"""Split a three-column rig sheet, key its backdrop, and normalize height.

The implementation deliberately has a dependency-free colour-key path.  A
locally cached BiRefNet session may be selected explicitly, but this command
never downloads model weights as a side effect.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
from pathlib import Path
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import color

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

KEY_RGB = np.array((230, 225, 216), dtype=np.float32)
VIEW_NAMES = ("front34", "side", "back34")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _edge_background(rgb: np.ndarray) -> np.ndarray:
    h, w = rgb.shape[:2]
    edge = np.concatenate((rgb[: max(2, h // 40)].reshape(-1, 3),
                           rgb[-max(2, h // 40):].reshape(-1, 3),
                           rgb[:, : max(2, w // 80)].reshape(-1, 3),
                           rgb[:, -max(2, w // 80):].reshape(-1, 3)))
    key_distance = np.linalg.norm(edge.astype(np.float32) - KEY_RGB, axis=1)
    candidates = edge[key_distance <= np.percentile(key_distance, 80)]
    return np.median(candidates if len(candidates) else edge, axis=0)


def color_key(image: Image.Image, tolerance: float = 12.0,
              feather: float = 12.0) -> tuple[Image.Image, dict[str, Any]]:
    """Remove edge-connected warm-grey pixels in Lab with a soft edge."""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[..., :3]
    background = _edge_background(rgb)
    lab = color.rgb2lab(rgb.astype(np.float32) / 255.0)
    bg_lab = color.rgb2lab((background / 255.0).reshape(1, 1, 3))
    distance = color.deltaE_ciede2000(lab, bg_lab)
    candidate = distance < tolerance + feather
    seeds = np.zeros(candidate.shape, dtype=bool)
    seeds[[0, -1], :] = candidate[[0, -1], :]
    seeds[:, [0, -1]] = candidate[:, [0, -1]]
    labels, _ = ndimage.label(candidate)
    edge_labels = np.unique(labels[seeds])
    connected = np.isin(labels, edge_labels[edge_labels != 0])
    alpha = rgba[..., 3].astype(np.float32)
    alpha[connected & (distance <= tolerance)] = 0.0
    soft = connected & (distance > tolerance)
    alpha[soft] *= np.clip((distance[soft] - tolerance) / feather, 0.0, 1.0)
    rgba[..., 3] = np.rint(alpha).astype(np.uint8)
    rgba[..., :3][rgba[..., 3] == 0] = 0
    return Image.fromarray(rgba, "RGBA"), {
        "method": "lab-color-key",
        "requestedKey": "#E6E1D8",
        "measuredBackground": [round(float(v), 2) for v in background],
        "toleranceDeltaE2000": tolerance, "featherDeltaE2000": feather,
    }


def _cached_birefnet() -> bool:
    roots = (Path.home() / ".u2net", Path.home() / ".cache/rembg",
             Path.home() / ".rembg/models")
    return any(root.exists() and any(root.rglob("*birefnet*")) for root in roots)


def remove_background(image: Image.Image, method: str) -> tuple[Image.Image, dict[str, Any]]:
    if method in {"auto", "birefnet"} and _cached_birefnet():
        try:
            os.environ.setdefault("NUMBA_DISABLE_JIT", "1")
            from rembg import new_session, remove
            session = new_session("birefnet-general-lite")
            result = remove(image.convert("RGB"), session=session)
            return result.convert("RGBA"), {"method": "birefnet-general-lite"}
        except Exception as exc:  # Optional path must not block the colour key.
            if method == "birefnet":
                raise RuntimeError(f"cached BiRefNet failed: {exc}") from exc
    return color_key(image)


def _components(alpha: np.ndarray) -> list[tuple[int, int, int, int, int]]:
    mask = alpha >= 24
    labels, count = ndimage.label(mask)
    records = []
    for label_id in range(1, count + 1):
        ys, xs = np.nonzero(labels == label_id)
        if len(xs) >= mask.size * 0.001:
            records.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1,
                            int(ys.max()) + 1, len(xs)))
    return records


def find_figures(image: Image.Image) -> list[tuple[int, int, int, int]]:
    """Return the three dominant, left-to-right figure bounds."""
    alpha = np.asarray(image.getchannel("A"))
    records = sorted(_components(alpha), key=lambda item: item[4], reverse=True)
    plausible = [item for item in records if item[3] - item[1] >= image.height * 0.55]
    if len(plausible) < 3:
        raise ValueError(f"expected three tall connected figures, found {len(plausible)}")
    main = sorted(plausible[:3], key=lambda item: item[0])
    if any(main[index][2] >= main[index + 1][0] for index in range(2)):
        raise ValueError("three figure components overlap horizontally")
    bounds = []
    for index, record in enumerate(main):
        lo = 0 if index == 0 else (main[index - 1][2] + record[0]) // 2
        hi = image.width if index == 2 else (record[2] + main[index + 1][0]) // 2
        region = alpha[:, lo:hi] >= 24
        ys, xs = np.nonzero(region)
        bounds.append((lo + int(xs.min()), int(ys.min()), lo + int(xs.max()) + 1,
                       int(ys.max()) + 1))
    return bounds


def shoulder_ratio(alpha: np.ndarray) -> float:
    ys, xs = np.nonzero(alpha >= 24)
    height = int(ys.max() - ys.min() + 1)
    top = int(ys.min())
    spans = []
    for y in range(top + round(height * 0.20), top + round(height * 0.43)):
        row = np.flatnonzero(alpha[y] >= 24)
        if len(row):
            spans.append(int(row[-1] - row[0] + 1))
    return round(float(np.percentile(spans, 65)) / height, 4) if spans else 0.0


def infer_views(ratios: Sequence[float]) -> tuple[list[str], bool]:
    if len(ratios) != 3:
        raise ValueError("view inference requires exactly three shoulder ratios")
    side = min(range(3), key=lambda index: (ratios[index], index))
    remaining = [index for index in range(3) if index != side]
    names = [""] * 3
    names[side] = "side"
    names[remaining[0]], names[remaining[1]] = "front34", "back34"
    # The sheet contract fixes side in the centre; the ratio is an independent check.
    valid = side == 1 and ratios[1] <= min(ratios[0], ratios[2]) * 0.86
    return names, valid


def armpit_clearance(alpha: np.ndarray, view: str) -> dict[str, Any]:
    mask = alpha >= 48
    ys, xs = np.nonzero(mask)
    height = int(ys.max() - ys.min() + 1)
    widths = []
    rows = range(int(ys.min() + height * 0.28), int(ys.min() + height * 0.57))
    for y in rows:
        row = mask[y]
        changes = np.diff(np.r_[False, row, False].astype(np.int8))
        starts, ends = np.flatnonzero(changes == 1), np.flatnonzero(changes == -1)
        gaps = [starts[index + 1] - ends[index]
                for index in range(len(starts) - 1)]
        widths.extend(gap for gap in gaps if gap >= 2)
    required = 2 if view != "side" else 1
    largest = [int(value) for value in sorted(widths, reverse=True)[:required]]
    if view == "side" and not largest:
        # True profile naturally merges both arms with the torso.  The gap
        # contract is satisfied when the silhouette is narrow enough to
        # reuse the near limb for the hidden far limb.
        ratio = shoulder_ratio(alpha)
        return {"pass": ratio <= .22, "requiredGaps": 0,
                "largestGapsPx": [], "profileShoulderRatio": ratio}
    return {"pass": len(largest) >= required, "requiredGaps": required,
            "largestGapsPx": largest}


def normalize_figure(image: Image.Image, bounds: tuple[int, int, int, int],
                     target_height: int, canvas: tuple[int, int] = (256, 480)) -> Image.Image:
    crop = image.crop(bounds)
    scale = target_height / crop.height
    resized = crop.resize((max(1, round(crop.width * scale)), target_height),
                          Image.Resampling.LANCZOS)
    if resized.width > canvas[0] - 16:
        raise ValueError(f"normalized figure width {resized.width}px exceeds canvas {canvas[0]}px")
    result = Image.new("RGBA", canvas)
    result.alpha_composite(resized, ((canvas[0] - resized.width) // 2, canvas[1] - 20 - target_height))
    return result


def split_sheet(sheet: Path, out_dir: Path, *, height_m: float = 1.70,
                ppm: int = 256, facing: str = "L", method: str = "auto") -> dict[str, Any]:
    if facing not in {"L", "R"}:
        raise ValueError("facing must be L or R")
    with Image.open(sheet) as opened:
        cutout, key_meta = remove_background(opened, method)
    bounds = find_figures(cutout)
    ratios = [shoulder_ratio(np.asarray(cutout.crop(box).getchannel("A"))) for box in bounds]
    names, view_check = infer_views(ratios)
    if set(names) != set(VIEW_NAMES):
        raise ValueError("could not assign all three rig views")
    target_height = round(height_m * ppm)
    out_dir.mkdir(parents=True, exist_ok=True)
    views: dict[str, Any] = {}
    failures = []
    for source_index, (name, box) in enumerate(zip(names, bounds)):
        normalized = normalize_figure(cutout, box, target_height)
        output = out_dir / f"{name}.png"
        normalized.save(output, "PNG", optimize=False, compress_level=9)
        clearance = armpit_clearance(np.asarray(cutout.crop(box).getchannel("A")), name)
        if not clearance["pass"]:
            failures.append(name)
        views[name] = {"sourceColumn": source_index, "sourceBounds": list(box),
                       "shoulderHeightRatio": ratios[source_index],
                       "normalizedSize": list(normalized.size),
                       "figureHeightPx": target_height, "footY": normalized.height - 20,
                       "armpitClearance": clearance, "file": output.name}
    manifest = {"schema": "tianshu-rig-sheet.v1", "source": sheet.name,
                "sourceSha256": sha256_file(sheet), "facing": facing,
                "ppm": ppm, "heightM": height_m, "backgroundRemoval": key_meta,
                "viewOrderBySource": names, "viewRatioCheck": view_check,
                "views": views, "armpitFailures": failures}
    (out_dir / "sheet.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        raise ValueError("armpit background gap check failed: " + ", ".join(failures))
    if not view_check:
        raise ValueError(f"side-view shoulder ratio check failed: {ratios}")
    return manifest


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("sheet", type=Path)
    result.add_argument("--out", type=Path, required=True)
    result.add_argument("--height-m", type=float, default=1.70)
    result.add_argument("--ppm", type=int, default=256)
    result.add_argument("--facing", choices=("L", "R"), default="L")
    result.add_argument("--matting", choices=("auto", "color-key", "birefnet"),
                        default="auto")
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        result = split_sheet(args.sheet.resolve(), args.out.resolve(),
                             height_m=args.height_m, ppm=args.ppm,
                             facing=args.facing, method=args.matting)
    except (OSError, ValueError, RuntimeError) as exc:
        print(f"sheet_split: {exc}", file=sys.stderr)
        return 1
    print(f"sheet_split: wrote {len(result['views'])} views to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
