"""Shared deterministic image and manifest helpers for item builders."""
from __future__ import annotations

import hashlib
import io
import math
import re
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import yaml
from PIL import Image, ImageOps

REFERENCE_BG = np.array([230.0, 225.0, 216.0], dtype=np.float32)
ICON_SIZES = (256, 128, 64, 32)
ID_PREFIXES = ("eq_", "it_")
ITEM_ID_RE = re.compile(r"(?:eq|it)_[a-z0-9]+(?:_[a-z0-9]+)*\Z")


class BuildError(ValueError):
    """An input asset cannot satisfy the deterministic build contract."""


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def png_bytes(image: Image.Image) -> bytes:
    stream = io.BytesIO()
    image.save(stream, "PNG", optimize=False, compress_level=9)
    return stream.getvalue()


def load_manifest(directory: Path) -> tuple[Any, list[dict[str, Any]]]:
    path = directory / "manifest.yaml"
    if path.exists():
        root = yaml.safe_load(path.read_text(encoding="utf-8"))
        root = [] if root is None else root
    else:
        root = []
    if isinstance(root, list):
        entries = root
    elif isinstance(root, dict) and isinstance(root.get("assets"), list):
        entries = root["assets"]
    else:
        raise BuildError(f"{path}: manifest 顶层须为列表或含 assets 列表的映射")
    known = {str(item.get("file")) for item in entries if isinstance(item, dict)}
    for source in sorted(directory.glob("*.png")):
        if source.name not in known and source.stem.startswith(ID_PREFIXES):
            entries.append({"id": source.stem, "file": source.name})
    return root, entries


def source_entries(directory: Path) -> tuple[Any, list[tuple[dict[str, Any], Path]]]:
    root, entries = load_manifest(directory)
    selected: list[tuple[dict[str, Any], Path]] = []
    seen_ids: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        item_id = str(entry.get("id", ""))
        file_name = entry.get("file")
        if not item_id.startswith(ID_PREFIXES) or not isinstance(file_name, str):
            continue
        if not ITEM_ID_RE.fullmatch(item_id):
            raise BuildError(f"非法物品 ID: {item_id}")
        if item_id in seen_ids:
            raise BuildError(f"重复物品 ID: {item_id}")
        seen_ids.add(item_id)
        source = (directory / file_name).resolve()
        try:
            source.relative_to(directory.resolve())
        except ValueError as exc:
            raise BuildError(f"{item_id}: source path escapes category directory") from exc
        if source.parent != directory.resolve() or source.suffix.lower() != ".png":
            continue
        if not source.is_file():
            raise BuildError(f"{item_id}: missing source {file_name}")
        selected.append((entry, source))
    selected.sort(key=lambda pair: str(pair[0]["id"]))
    return root, selected


def dump_manifest(path: Path, root: Any) -> None:
    text = yaml.safe_dump(root, allow_unicode=True, sort_keys=False, width=1000)
    path.write_text(text, encoding="utf-8")


def normalize_rgba(path: Path) -> Image.Image:
    with Image.open(path) as opened:
        return ImageOps.exif_transpose(opened).convert("RGBA")


def rgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """Convert an array whose final axis is sRGB bytes to CIE Lab (D65)."""
    values = rgb.astype(np.float64) / 255.0
    linear = np.where(values <= 0.04045, values / 12.92, ((values + 0.055) / 1.055) ** 2.4)
    xyz = linear @ np.array(
        [[0.4124564, 0.3575761, 0.1804375],
         [0.2126729, 0.7151522, 0.0721750],
         [0.0193339, 0.1191920, 0.9503041]]
    ).T
    xyz /= np.array([0.95047, 1.0, 1.08883])
    delta = 6.0 / 29.0
    transformed = np.where(
        xyz > delta ** 3, np.cbrt(xyz), xyz / (3.0 * delta ** 2) + 4.0 / 29.0
    )
    return np.stack(
        (116.0 * transformed[..., 1] - 16.0,
         500.0 * (transformed[..., 0] - transformed[..., 1]),
         200.0 * (transformed[..., 1] - transformed[..., 2])),
        axis=-1,
    )


def _edge_ring(height: int, width: int) -> np.ndarray:
    thickness = max(1, int(math.ceil(min(height, width) * 0.03)))
    ring = np.zeros((height, width), dtype=bool)
    ring[:thickness] = ring[-thickness:] = True
    ring[:, :thickness] = ring[:, -thickness:] = True
    return ring


def _connected_candidates(candidate: np.ndarray, seeds: np.ndarray) -> np.ndarray:
    height, width = candidate.shape
    connected = np.zeros_like(candidate, dtype=bool)
    seed_points = zip(*np.nonzero(seeds))
    for seed_y, seed_x in seed_points:
        if connected[seed_y, seed_x] or not candidate[seed_y, seed_x]:
            continue
        stack = [(int(seed_x), int(seed_y))]
        while stack:
            x, y = stack.pop()
            if connected[y, x] or not candidate[y, x]:
                continue
            left = x
            while left > 0 and candidate[y, left - 1] and not connected[y, left - 1]:
                left -= 1
            right = x
            while right + 1 < width and candidate[y, right + 1] and not connected[y, right + 1]:
                right += 1
            connected[y, left:right + 1] = True
            for adjacent_y in (y - 1, y + 1):
                if not 0 <= adjacent_y < height:
                    continue
                scan_left, scan_right = max(0, left - 1), min(width - 1, right + 1)
                pending = candidate[adjacent_y, scan_left:scan_right + 1] & ~connected[adjacent_y, scan_left:scan_right + 1]
                indices = np.flatnonzero(pending)
                if len(indices):
                    starts = indices[np.r_[True, np.diff(indices) > 1]]
                    stack.extend((scan_left + int(item), adjacent_y) for item in starts)
    return connected


def _local_opaque_saturation(rgb: np.ndarray, alpha: np.ndarray) -> np.ndarray:
    value = rgb.max(axis=2)
    saturation = np.divide(
        value - rgb.min(axis=2), value, out=np.zeros_like(value), where=value > 0
    )
    opaque = alpha >= 250
    nearby = np.zeros_like(saturation)
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            src_y = slice(max(0, -dy), min(alpha.shape[0], alpha.shape[0] - dy))
            src_x = slice(max(0, -dx), min(alpha.shape[1], alpha.shape[1] - dx))
            dst_y = slice(max(0, dy), min(alpha.shape[0], alpha.shape[0] + dy))
            dst_x = slice(max(0, dx), min(alpha.shape[1], alpha.shape[1] + dx))
            values = np.where(opaque[src_y, src_x], saturation[src_y, src_x], 0.0)
            nearby[dst_y, dst_x] = np.maximum(nearby[dst_y, dst_x], values)
    return nearby


def remove_background(image: Image.Image) -> tuple[Image.Image, dict[str, Any]]:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb = rgba[..., :3].astype(np.float32)
    height, width = rgba.shape[:2]
    ring = _edge_ring(height, width)
    lab = rgb_to_lab(rgb)
    reference_lab = rgb_to_lab(REFERENCE_BG.reshape(1, 1, 3))[0, 0]
    ref_distance = np.linalg.norm(lab - reference_lab, axis=2)
    neutral = rgb.max(axis=2) - rgb.min(axis=2) <= 34.0
    seeds = ring & (ref_distance <= 18.0) & neutral
    ratio = float(seeds.sum()) / float(ring.sum())
    if ratio < 0.40:
        raise BuildError(f"边界背景种子仅 {ratio:.1%}，低于 40%")
    background = np.median(rgb[seeds], axis=0)
    background_lab = rgb_to_lab(background.reshape(1, 1, 3))[0, 0]
    distance = np.linalg.norm(lab - background_lab, axis=2)
    connected = _connected_candidates(distance < 22.0, seeds)
    alpha = rgba[..., 3].astype(np.float32)
    alpha[connected & (distance <= 10.0)] = 0.0
    feather = connected & (distance > 10.0) & (distance < 22.0)
    alpha[feather] *= (distance[feather] - 10.0) / 12.0
    rgba[..., 3] = np.rint(alpha).astype(np.uint8)

    partial = (rgba[..., 3] > 0) & (rgba[..., 3] < 255)
    if np.any(partial):
        a = np.maximum(rgba[..., 3].astype(np.float32) / 255.0, 1.0 / 255.0)
        corrected = (rgb - background[None, None, :] * (1.0 - a[..., None])) / a[..., None]
        corrected = np.clip(corrected, 0.0, 255.0)
        cap = _local_opaque_saturation(corrected / 255.0, rgba[..., 3]) + 0.08
        hsv_value = corrected.max(axis=2) / 255.0
        hsv_min = corrected.min(axis=2) / 255.0
        sat = np.divide(hsv_value - hsv_min, hsv_value, out=np.zeros_like(hsv_value), where=hsv_value > 0)
        over = partial & (sat > cap) & (sat > 0)
        if np.any(over):
            factor = np.ones_like(sat)
            factor[over] = cap[over] / sat[over]
            grey = corrected.max(axis=2, keepdims=True)
            corrected = grey + (corrected - grey) * factor[..., None]
        rgba[..., :3][partial] = np.rint(corrected[partial]).astype(np.uint8)
    rgba[..., :3][rgba[..., 3] == 0] = 0
    visible = rgba[..., 3] >= 8
    touches_edge = bool(visible[0].any() or visible[-1].any() or
                        visible[:, 0].any() or visible[:, -1].any())
    if touches_edge and float(connected.sum()) / connected.size > 0.08:
        raise BuildError("主体与画布边界相连，无法可靠自动抠底")
    return Image.fromarray(rgba, "RGBA"), {
        "background": [int(round(value)) for value in background],
        "seedRatio": round(ratio, 6),
    }


def alpha_bbox(image: Image.Image, threshold: int = 8) -> tuple[int, int, int, int]:
    alpha = np.asarray(image.getchannel("A"))
    ys, xs = np.nonzero(alpha >= threshold)
    if not len(xs):
        raise BuildError("主体 alpha 为空")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def crop_with_padding(image: Image.Image, *, validate_area: bool = True) -> Image.Image:
    left, top, right, bottom = alpha_bbox(image)
    width, height = right - left, bottom - top
    occupied = width * height / float(image.width * image.height)
    if validate_area and (occupied < 0.05 or occupied > 0.92):
        raise BuildError(f"主体包围盒占比 {occupied:.1%}，须在 5%–92%")
    pad = max(4, int(math.ceil(0.08 * max(width, height))))
    out_width = width + pad * 2
    out_height = height + pad * 2
    out_width += out_width % 2
    out_height += out_height % 2
    output = Image.new("RGBA", (out_width, out_height))
    output.alpha_composite(image.crop((left, top, right, bottom)), (pad, pad))
    return output


def premultiplied_resize(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.float32) / 255.0
    alpha = rgba[..., 3:4]
    premultiplied = np.concatenate((rgba[..., :3] * alpha, alpha), axis=2)
    work = Image.fromarray(np.rint(premultiplied * 255.0).astype(np.uint8), "RGBA")
    resized = np.asarray(work.resize(size, Image.Resampling.LANCZOS), dtype=np.float32) / 255.0
    out_alpha = resized[..., 3:4]
    rgb = np.divide(
        resized[..., :3], out_alpha, out=np.zeros_like(resized[..., :3]), where=out_alpha > 0
    )
    result = np.concatenate((np.clip(rgb, 0, 1), out_alpha), axis=2)
    return Image.fromarray(np.rint(result * 255.0).astype(np.uint8), "RGBA")


def make_icon_master(cropped: Image.Image) -> Image.Image:
    left, top, right, bottom = alpha_bbox(cropped)
    longest = max(right - left, bottom - top)
    nominal = 215.0 / longest
    base_width, base_height = round(cropped.width * nominal), round(cropped.height * nominal)
    scaled: Image.Image | None = None
    candidates: list[tuple[int, int, int, Image.Image]] = []
    for delta in range(-8, 9):
        width = max(1, base_width + delta)
        height = max(1, round(base_height * width / max(base_width, 1)))
        candidate = premultiplied_resize(cropped, (width, height))
        scaled_box = alpha_bbox(candidate)
        measured = max(scaled_box[2] - scaled_box[0], scaled_box[3] - scaled_box[1])
        candidates.append((abs(measured - 215), abs(delta), delta, candidate))
    candidates.sort(key=lambda item: item[:3])
    best_error, _, _, scaled = candidates[0]
    if best_error:
        # The alpha threshold can skip an integer size on pathological diagonals.
        # Such inputs retain the nearest possible size and still remain deterministic.
        scaled_box = alpha_bbox(scaled)
        measured = max(scaled_box[2] - scaled_box[0], scaled_box[3] - scaled_box[1])
        if abs(measured - 215) > 1:
            raise BuildError("无法把主体 alpha 包围盒收敛到 215±1 px")
    if scaled.width > 256 or scaled.height > 256:
        raise BuildError("8% 补边无法装入 256 px 图标画布")
    output = Image.new("RGBA", (256, 256))
    output.alpha_composite(scaled, ((256 - scaled.width) // 2, (256 - scaled.height) // 2))
    return output


def icon_pyramid(source: Path) -> tuple[dict[int, bytes], dict[str, Any]]:
    cutout, metadata = remove_background(normalize_rgba(source))
    master = make_icon_master(crop_with_padding(cutout))
    images = {256: master}
    images.update({size: premultiplied_resize(master, (size, size)) for size in ICON_SIZES[1:]})
    return {size: png_bytes(image) for size, image in images.items()}, metadata


def write_or_check(path: Path, data: bytes, check: bool) -> None:
    if check:
        if not path.is_file():
            raise BuildError(f"缺少派生文件 {path}")
        if sha256_file(path) != sha256_bytes(data):
            raise BuildError(f"派生文件与源图不一致 {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def all_category_dirs(root: Path, allowed: Iterable[str] | None = None) -> list[Path]:
    names = set(allowed) if allowed is not None else None
    if not root.is_dir():
        return []
    return [
        path for path in sorted(root.iterdir())
        if path.is_dir() and not path.name.startswith(".") and (names is None or path.name in names)
    ]
