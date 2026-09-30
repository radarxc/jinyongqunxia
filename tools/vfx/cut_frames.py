#!/usr/bin/env python3
"""Cut explicit source rectangles and remove white in linear light (design/23)."""
from __future__ import annotations

import argparse
import copy
import json
import math
import os
from pathlib import Path
import shutil

import numpy as np
from PIL import Image

from imaging import srgb_decode, srgb_encode
from validation import (VFXError, load_yaml, resolve_path, save_yaml,
                        validate_document, validate_schema)


DEFAULT_KEYING = {
    "method": "white_key", "white_cutoff_8bit": 250, "opaque_luma": 0.20,
    "key_full_8bit": 25, "epsilon": 1 / 255, "dewhite": True,
}


def same_file(first: Path, second: Path) -> bool:
    return first.resolve() == second.resolve() or (
        first.exists() and second.exists() and first.samefile(second))


def white_to_rgba(image: Image.Image, keying: dict) -> Image.Image:
    """Keep thresholds in encoded sRGB; solve the white matte in linear RGB."""
    validate_schema(keying, "Keying")
    w = keying["white_cutoff_8bit"] / 255
    b, k = keying["opaque_luma"], keying["key_full_8bit"] / 255
    if b >= w or k <= 1 - w:
        raise VFXError("source.keying: opaque_luma < w and key_full > 255-cutoff required")
    if image.mode not in ("RGB", "RGBA"):
        raise VFXError("source: expected RGB or opaque RGBA")
    if image.mode == "RGBA" and image.getextrema()[3] != (255, 255):
        raise VFXError("source: white-background input must be opaque")
    color = np.asarray(image.convert("RGB"), dtype=np.float64) / 255
    removed = np.min(color, axis=2) >= w
    if keying["method"] == "white_luma":
        a0 = (w - color @ np.array([0.2126, 0.7152, 0.0722])) / (w - b)
    else:
        a0 = (1 - np.min(color, axis=2) - (1 - w)) / (k - (1 - w))
    linear = srgb_decode(color)
    alpha = np.maximum(np.clip(a0, 0, 1), 1 - linear.min(axis=2))
    alpha[removed] = 0
    foreground = np.clip((linear - (1 - alpha[..., None])) /
                         np.maximum(alpha[..., None], keying["epsilon"]), 0, 1)
    rgba = np.concatenate((srgb_encode(foreground), alpha[..., None]), axis=2)
    result = np.floor(np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8)
    result[result[..., 3] == 0, :3] = 0
    return Image.fromarray(result)


def quality_metrics(source: Image.Image, result: Image.Image, border: int = 8) -> dict:
    """Ratios use actual edge/border populations, not the full image area."""
    rgba = np.asarray(result.convert("RGBA"))
    alpha = rgba[..., 3] / 255
    edge = (alpha > 0) & (alpha < 1)
    white = np.all(rgba[..., :3] >= 250, axis=2) & edge
    mask = np.ones(alpha.shape, dtype=bool)
    if alpha.shape[0] > 2 * border and alpha.shape[1] > 2 * border:
        mask[border:-border, border:-border] = False
    rebuilt = srgb_encode(srgb_decode(rgba[..., :3] / 255) * alpha[..., None]
                         + 1 - alpha[..., None]) * 255
    original = np.asarray(source.convert("RGB"), dtype=np.float64)
    error = np.abs(rebuilt - original)[alpha > 0]
    return {
        "border_px": border,
        "border_alpha_ratio": float(np.mean(alpha[mask] > 1 / 255)),
        "semi_transparent_pixels": int(edge.sum()),
        "residual_white_edge_ratio": float(white.sum() / max(1, edge.sum())),
        "white_rebuild_max_8bit": float(error.max()) if error.size else 0.0,
        "white_rebuild_mean_8bit": float(error.mean()) if error.size else 0.0,
    }


def write_previews(frames: list[Image.Image], folder: Path) -> None:
    """Contact sheets on linear-light black, gray and white backgrounds."""
    width, height = frames[0].size
    for name, value in (("black", 0), ("gray", 128), ("white", 255)):
        sheet = Image.new("RGB", (width * len(frames), height))
        background = srgb_decode(np.array(value / 255))
        for index, frame in enumerate(frames):
            rgba = np.asarray(frame, dtype=np.float64) / 255
            a = rgba[..., 3:4]
            rgb = srgb_encode(srgb_decode(rgba[..., :3]) * a + background * (1 - a))
            pixels = np.floor(np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8)
            sheet.paste(Image.fromarray(pixels), (index * width, 0))
        sheet.save(folder / f"preview_{name}.png")


def cut_effect(config: dict, output_path: Path, suite_root: Path | None = None,
               preview: bool = False) -> dict:
    """Config paths belong to output_path; source files are never overwritten."""
    config = copy.deepcopy(config)
    output_path = Path(output_path).resolve()
    root = Path(suite_root or output_path.parent).resolve()
    if not output_path.is_relative_to(root) or output_path.suffix.lower() not in (".yaml", ".yml"):
        raise VFXError("output: YAML must be inside the suite root")
    validate_schema(config, "EffectSet")
    phases = [frame["phase"] for frame in config["frames"]]
    if phases[0] != 0 or phases[-1] != 1 or any(a >= b for a, b in zip(phases, phases[1:])):
        raise VFXError("frames.phase: must increase strictly from 0 to 1")
    if abs(math.hypot(*config["direction"]) - 1) > 1e-6:
        raise VFXError("direction: must be a unit vector")
    for frame in config["frames"]:
        if any(point >= bound for point, bound in zip(frame["anchor_px"], config["size_px"])):
            raise VFXError("frames.anchor_px: outside frame")
    if config["style"] == "qi_sword" and config["blend"] not in ("screen", "lighter"):
        raise VFXError("qi_sword.blend: requires screen/lighter")
    sources = [resolve_path(output_path, p, root) for p in config["source"]["files"]]
    if config["source"]["mode"] == "grid" and len(sources) != 1:
        raise VFXError("grid: requires exactly one original")
    images = []
    for path in sources:
        with Image.open(path) as image:
            if image.format != "PNG":
                raise VFXError(f"source: not PNG: {path}")
            images.append(image.copy())
    frames, metrics, destinations, occupied = [], [], [], {}
    rects = config["source"]["rects"]
    if len(rects) != len(config["frames"]):
        raise VFXError("source.rects: count must equal frames")
    for index, (rect_info, frame_info) in enumerate(zip(rects, config["frames"])):
        file_index = rect_info["file_index"]
        if file_index >= len(images):
            raise VFXError(f"source.rects[{index}].file_index: out of bounds")
        image = images[file_index]
        x, y, width, height = rect_info["rect_px"]
        if x + width > image.width or y + height > image.height:
            raise VFXError(f"source.rects[{index}]: outside source")
        if [width, height] != config["size_px"]:
            raise VFXError(f"source.rects[{index}]: size_px mismatch; no implicit resize")
        if config["source"]["mode"] == "singles" and (x, y, width, height) != (
                0, 0, image.width, image.height):
            raise VFXError("source.rects: singles requires the whole image")
        for bx, by, bw, bh in occupied.get(file_index, []):
            if x < bx + bw and bx < x + width and y < by + bh and by < y + height:
                raise VFXError(f"source.rects[{index}]: overlapping rectangles")
        occupied.setdefault(file_index, []).append((x, y, width, height))
        # Output need not exist yet, but must stay in the suite after symlink resolution.
        relative = frame_info["file"]
        destination = (output_path.parent / relative).resolve()
        if (Path(relative).is_absolute() or "\\" in relative or ":" in relative
                or not destination.is_relative_to(root) or destination.suffix.lower() != ".png"):
            raise VFXError(f"frames[{index}].file: unsafe PNG output path")
        if any(same_file(destination, other) for other in [*sources, output_path, *destinations]):
            raise VFXError(f"frames[{index}].file: would overwrite source or duplicate frame")
        destinations.append(destination)
        crop = image.crop((x, y, x + width, y + height))
        frame = white_to_rgba(crop, config["source"]["keying"])
        alpha = np.asarray(frame)[..., 3]
        if not np.any(alpha == 0) or not np.any(alpha > 0):
            raise VFXError(f"frames[{index}]: requires both transparent and visible pixels")
        frames.append(frame)
        metrics.append(quality_metrics(crop, frame))
    if config["source"]["mode"] == "singles" and (
            len(images) != len(frames) or set(occupied) != set(range(len(images)))):
        raise VFXError("source.files: singles requires one frame per file")
    if any(same_file(output_path, source) for source in sources):
        raise VFXError("output YAML would overwrite an original source")
    sidecars = [output_path.parent / "quality.json"]
    if preview:
        sidecars += [output_path.parent / f"preview_{name}.png" for name in ("black", "gray", "white")]
    for extra in sidecars:
        if not extra.resolve().is_relative_to(root) or any(
                same_file(extra, other) for other in [*sources, *destinations, output_path]):
            raise VFXError(f"sidecar would overwrite source/frame or escape suite: {extra}")
    for destination, frame in zip(destinations, frames):
        destination.parent.mkdir(parents=True, exist_ok=True)
        frame.save(destination)
    save_yaml(output_path, config)
    validate_document(output_path, suite_root=root)
    (output_path.parent / "quality.json").write_text(
        json.dumps({"frames": metrics}, indent=2) + "\n", encoding="utf-8")
    if preview:
        write_previews(frames, output_path.parent)
    return config


def simple_config(args: argparse.Namespace) -> dict:
    """Build an explicit EffectSet; copy external inputs without re-encoding."""
    if not args.inputs or not args.asset_id or not args.anchor:
        raise VFXError("direct input requires sources, --asset-id and --anchor")
    if args.reference_length is None or args.root_width is None:
        raise VFXError("direct input requires --reference-length and --root-width")
    folder = args.output.resolve().parent
    folder.mkdir(parents=True, exist_ok=True)
    files = []
    for index, source in enumerate(args.inputs):
        source = source.resolve()
        target = folder / f"source_{index + 1:02d}.png"
        if source.is_relative_to(folder):
            target = source
        else:
            if not target.resolve().is_relative_to(folder):
                raise VFXError(f"source copy target escapes output directory: {target}")
            if target.exists():
                if target.read_bytes() != source.read_bytes():
                    raise VFXError(f"refusing to overwrite different source: {target}")
            elif target != source:
                shutil.copyfile(source, target)
        files.append(os.path.relpath(target, folder).replace(os.sep, "/"))
    rects = []
    if args.grid:
        if len(files) != 1 or not args.size:
            raise VFXError("--grid requires exactly one source and --size W H")
        cols, rows = args.grid
        count = args.count if args.count is not None else cols * rows
        if min(cols, rows) < 1 or not 4 <= count <= min(8, cols * rows):
            raise VFXError("--grid/--count: require 4..8 occupied cells")
        width, height = args.size
        for index in range(count):
            rects.append({"file_index": 0, "rect_px": [
                args.margin[0] + index % cols * (width + args.gap[0]),
                args.margin[1] + index // cols * (height + args.gap[1]), width, height]})
    else:
        for index, name in enumerate(files):
            with Image.open(folder / name) as image:
                rects.append({"file_index": index, "rect_px": [0, 0, *image.size]})
        width, height = rects[0]["rect_px"][2:]
        count = len(files)
    phases = args.phases or [i / max(1, count - 1) for i in range(count)]
    if len(phases) != count:
        raise VFXError("--phases: count must match frames")
    keying = dict(DEFAULT_KEYING, method=args.method or (
        "white_luma" if args.style == "ink" else "white_key"))
    keying.update(white_cutoff_8bit=args.white_cutoff, opaque_luma=args.opaque_luma,
                  key_full_8bit=args.key_full)
    return dict(kind="EffectSet", version=1, asset_id=args.asset_id,
                size_px=[width, height], color_space="srgb", alpha_mode="straight",
                style=args.style, direction=args.direction, reference_length_px=args.reference_length,
                root_width_px=args.root_width, blend=args.blend,
                source=dict(mode="grid" if args.grid else "singles", files=files,
                            rects=rects, keying=keying),
                frames=[dict(file=f"frame_{i:03d}.png", anchor_px=args.anchor, phase=phases[i])
                        for i in range(count)])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("inputs", nargs="*", type=Path, help="ordered white PNG sources")
    parser.add_argument("--config", type=Path, help="complete EffectSet with explicit rectangles")
    parser.add_argument("--output", type=Path, required=True, help="EffectSet YAML destination")
    parser.add_argument("--root", type=Path, help="suite root for paths")
    parser.add_argument("--preview", action="store_true", help="black/gray/white contact sheets")
    parser.add_argument("--asset-id")
    parser.add_argument("--grid", nargs=2, type=int, metavar=("COLS", "ROWS"))
    parser.add_argument("--size", nargs=2, type=int, metavar=("W", "H"))
    parser.add_argument("--gap", nargs=2, type=int, default=[0, 0])
    parser.add_argument("--margin", nargs=2, type=int, default=[0, 0])
    parser.add_argument("--count", type=int)
    parser.add_argument("--anchor", nargs=2, type=float, help="local cropped-frame root x y")
    parser.add_argument("--direction", nargs=2, type=float, default=[1, 0])
    parser.add_argument("--phases", nargs="+", type=float)
    parser.add_argument("--reference-length", type=float)
    parser.add_argument("--root-width", type=float)
    parser.add_argument("--style", choices=["ink", "gold_ink", "qi_sword"], default="gold_ink")
    parser.add_argument("--blend", choices=["normal", "multiply", "screen", "lighter"], default="normal")
    parser.add_argument("--method", choices=["white_luma", "white_key"])
    parser.add_argument("--white-cutoff", type=int, default=250)
    parser.add_argument("--opaque-luma", type=float, default=0.20)
    parser.add_argument("--key-full", type=int, default=25)
    args = parser.parse_args()
    try:
        if args.config and args.inputs:
            raise VFXError("use --config or positional source images")
        if args.config:
            config = load_yaml(args.config)
            root = (args.root or args.config.resolve().parent).resolve()
            # Rebase input/output metadata paths when saving beside a different YAML.
            for entry in config["frames"]:
                target = args.config.resolve().parent / entry["file"]
                entry["file"] = os.path.relpath(target, args.output.resolve().parent)
            config["source"]["files"] = [os.path.relpath(
                resolve_path(args.config.resolve(), p, root), args.output.resolve().parent)
                for p in config["source"]["files"]]
        else:
            config = simple_config(args)
            root = args.root or args.output.resolve().parent
        result = cut_effect(config, args.output, root, preview=args.preview)
        print(f"EffectSet: {args.output} ({len(result['frames'])} RGBA frames)")
        return 0
    except (VFXError, OSError, ValueError, KeyError) as exc:
        parser.exit(1, f"cut_frames: {exc}\n")


if __name__ == "__main__":
    raise SystemExit(main())
