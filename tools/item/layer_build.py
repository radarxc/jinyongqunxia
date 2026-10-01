"""Core deterministic equipment-layer generation algorithms."""
from __future__ import annotations

import hashlib
import math
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageFilter

from tools.item.common import BuildError, alpha_bbox, crop_with_padding, rgb_to_lab
from tools.rig.templates import PART_TO_TEMPLATE, TEMPLATES, VIEWS, template_mask

VISIBLE_CATEGORIES = {"weapons", "clothing", "armor", "accessories", "shoes", "belts"}
CATEGORY_SLOTS = {
    "clothing": ("torso", "pelvis_skirt", "upper_arm_L", "upper_arm_R",
                 "forearm_L", "forearm_R", "thigh_L", "thigh_R",
                 "shin_L", "shin_R"),
    "armor": ("torso", "pelvis_skirt", "pauldron_L", "pauldron_R"),
    "shoes": ("foot_L", "foot_R"),
    "belts": ("belt",),
}


def sample_palette(image: Image.Image, item_id: str) -> list[str]:
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8)
    opaque = rgba[..., 3] >= 230
    pixels = rgba[..., :3][opaque]
    if not len(pixels):
        raise BuildError(f"{item_id}: no opaque pixels for palette")
    luminance = pixels @ np.array([0.2126, 0.7152, 0.0722])
    low, high = np.percentile(luminance, [5, 95])
    filtered = pixels[(luminance >= low) & (luminance <= high)]
    if len(filtered) >= 256:
        pixels = filtered
    if len(pixels) > 50000:
        indices = np.linspace(0, len(pixels) - 1, 50000, dtype=np.int64)
        pixels = pixels[indices]
    lab = rgb_to_lab(pixels)
    k = min(5, max(3, round(math.sqrt(len(pixels)) / 64)))
    seed = int(hashlib.sha256(item_id.encode("utf-8")).hexdigest()[:8], 16)
    rng = np.random.default_rng(seed)
    centers = [lab[int(rng.integers(len(lab)))]]
    for _ in range(1, k):
        distances = np.min([np.sum((lab - center) ** 2, axis=1) for center in centers], axis=0)
        if float(distances.sum()) == 0.0:
            centers.append(lab[len(centers) % len(lab)])
        else:
            centers.append(lab[int(rng.choice(len(lab), p=distances / distances.sum()))])
    center_array = np.asarray(centers)
    labels = np.zeros(len(lab), dtype=np.int32)
    for _ in range(32):
        labels = np.argmin(np.sum((lab[:, None, :] - center_array[None, :, :]) ** 2, axis=2), axis=1)
        for index in range(k):
            members = lab[labels == index]
            if len(members):
                center_array[index] = members.mean(axis=0)
    records = []
    for index in range(k):
        members = pixels[labels == index]
        if len(members):
            rgb = tuple(int(round(value)) for value in members.mean(axis=0))
            records.append((len(members), rgb))
    records.sort(key=lambda item: (-item[0], item[1]))
    colors = [rgb for _, rgb in records]
    while len(colors) < 3:
        base = colors[0]
        delta = 12 if len(colors) == 1 else -12
        colors.append(tuple(max(0, min(255, channel + delta)) for channel in base))
    return ["#{:02X}{:02X}{:02X}".format(*rgb) for rgb in colors]


def _largest_opaque_center(alpha: np.ndarray) -> tuple[int, int] | None:
    mask = alpha >= 230
    seen = np.zeros_like(mask, dtype=bool)
    best: list[tuple[int, int]] = []
    height, width = mask.shape
    for start_y, start_x in zip(*np.nonzero(mask)):
        if seen[start_y, start_x]:
            continue
        stack = [(int(start_x), int(start_y))]
        component: list[tuple[int, int]] = []
        while stack:
            x, y = stack.pop()
            if not (0 <= x < width and 0 <= y < height) or seen[y, x] or not mask[y, x]:
                continue
            seen[y, x] = True
            component.append((x, y))
            stack.extend(((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)))
        if len(component) > len(best):
            best = component
    if not best:
        return None
    return (round(sum(x for x, _ in best) / len(best)),
            round(sum(y for _, y in best) / len(best)))


def texture_patch(image: Image.Image) -> Image.Image:
    left, top, right, bottom = alpha_bbox(image)
    width, height = right - left, bottom - top
    box = (left + width // 3, top + height // 3, right - width // 3, bottom - height // 3)
    patch = image.crop(box)
    if np.any(np.asarray(patch.getchannel("A")) < 230):
        center = _largest_opaque_center(np.asarray(image.getchannel("A")))
        if center is not None:
            patch_width, patch_height = max(1, width // 3), max(1, height // 3)
            x0 = min(max(0, center[0] - patch_width // 2), image.width - patch_width)
            y0 = min(max(0, center[1] - patch_height // 2), image.height - patch_height)
            patch = image.crop((x0, y0, x0 + patch_width, y0 + patch_height))
    if patch.width == 0 or patch.height == 0:
        patch = image.crop((left, top, right, bottom))
    target_w, target_h = max(64, patch.width), max(64, patch.height)
    tiled = Image.new("RGBA", (target_w, target_h))
    for y in range(0, target_h, patch.height):
        for x in range(0, target_w, patch.width):
            tile = patch if (x // patch.width + y // patch.height) % 2 == 0 else patch.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            tiled.alpha_composite(tile, (x, y))
    return tiled.crop((0, 0, 64, 64))


def infer_slots(category: str, entry: dict[str, Any]) -> tuple[str, ...]:
    configured = entry.get("layerSlots")
    if isinstance(configured, list):
        return tuple(str(slot) for slot in configured)
    if category == "weapons":
        return ("weapon_R", "weapon_L") if entry.get("hands") == "pair" else ("weapon_R",)
    if category == "accessories":
        slot = entry.get("slot")
        if slot == "shoulder":
            return ("pauldron_L", "pauldron_R")
        if slot == "cape":
            return ("cape",)
        if slot == "head":
            return ("hair_or_headgear",)
        raise BuildError(
            f"{entry.get('id')}: accessories requires slot=head|shoulder|cape "
            "or an explicit layerSlots list"
        )
    return CATEGORY_SLOTS.get(category, ())


def _tile_fill(mask: Image.Image, texture: Image.Image, primary: str, view: str) -> Image.Image:
    width, height = mask.size
    tile = texture.convert("RGBA")
    canvas = Image.new("RGBA", mask.size, primary)
    for y in range(0, height, tile.height):
        for x in range(0, width, tile.width):
            variant = tile if (x // tile.width + y // tile.height) % 2 == 0 else tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            canvas.alpha_composite(variant, (x, y))
    tint = Image.new("RGBA", mask.size, primary)
    canvas = Image.blend(canvas, tint, 0.55)
    canvas.putalpha(mask)
    edge = mask.filter(ImageFilter.MaxFilter(5))
    inner = mask.filter(ImageFilter.MinFilter(5))
    border = np.maximum(np.asarray(edge, dtype=np.int16) - np.asarray(inner, dtype=np.int16), 0).astype(np.uint8)
    outline = Image.new("RGBA", mask.size, (48, 43, 40, 0))
    outline.putalpha(Image.fromarray(border, "L"))
    canvas.alpha_composite(outline)
    if view == "back34":
        canvas = canvas.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return canvas


def build_template_layer(cutout: Image.Image, item_id: str, slot: str) -> tuple[Image.Image, list[str]]:
    key = PART_TO_TEMPLATE.get(slot)
    if key is None:
        raise BuildError(f"{item_id}: unknown layer slot {slot}")
    template = TEMPLATES[key]
    palette = sample_palette(cutout, item_id)
    texture = texture_patch(cutout)
    cells = [_tile_fill(template_mask(slot, view), texture, palette[0], view) for view in VIEWS]
    strip = Image.new("RGBA", (template.size[0] * 3, template.size[1]))
    for index, cell in enumerate(cells):
        strip.alpha_composite(cell, (index * template.size[0], 0))
    return strip, palette


WEAPON_DEFAULTS = {
    "sword": (0.18, 1.00, (0.65, 1.25)), "blade": (0.20, 0.92, (0.65, 1.25)),
    "spear": (0.16, 2.10, (1.20, 2.60)), "staff": (0.28, 1.85, (1.20, 2.30)),
    "whip": (0.10, 0.42, (0.25, 0.70)), "qin": (0.50, 1.10, (0.90, 1.30)),
    "hidden": (0.22, 0.32, (0.12, 0.80)), "misc": (0.24, 0.85, (0.35, 1.60)),
}
SHORT_KINDS = {"brush", "fan", "flute", "dagger", "token"}
MISC_KINDS = {"wheel", "hook", "pestle", "hammer", "axe", "exotic"}


def weapon_settings(entry: dict[str, Any]) -> tuple[str, float, float]:
    subtype_value = entry.get("subtype") or entry.get("cat") or entry.get("exoticKind")
    if subtype_value is None:
        text = " ".join(str(entry.get(key, "")) for key in ("subject", "prompt", "notes"))
        markers = (("枪", "spear"), ("矛", "spear"), ("棍", "staff"),
                   ("杖", "staff"), ("鞭", "whip"), ("琴", "qin"),
                   ("刀", "blade"), ("剑", "sword"), ("匕", "dagger"),
                   ("扇", "fan"), ("笛", "flute"), ("箫", "flute"),
                   ("笔", "brush"), ("轮", "wheel"), ("钩", "hook"),
                   ("锤", "hammer"), ("斧", "axe"))
        subtype_value = next((value for marker, value in markers if marker in text), "sword")
    subtype = str(subtype_value)
    key = "misc" if subtype in MISC_KINDS else subtype
    if subtype in SHORT_KINDS:
        default = (0.18, 0.42, (0.20, 0.75))
    elif subtype == "blade" and entry.get("hands") == 2:
        default = (0.22, 1.55, (1.20, 2.60))
    else:
        default = WEAPON_DEFAULTS.get(key, WEAPON_DEFAULTS["misc"])
    grip = float(entry.get("gripRatio", default[0]))
    length = float(entry.get("lengthM", default[1]))
    if not default[2][0] <= length <= default[2][1]:
        raise BuildError(f"{entry.get('id')}: lengthM {length} outside {default[2]}")
    if not 0.0 <= grip <= 1.0:
        raise BuildError(f"{entry.get('id')}: gripRatio must be within [0,1]")
    return subtype, grip, length


def build_weapon_layer(cutout: Image.Image, entry: dict[str, Any]) -> tuple[Image.Image, dict[str, Any]]:
    item_id = str(entry["id"])
    subject = crop_with_padding(cutout)
    subtype, grip_ratio, length_m = weapon_settings(entry)
    alpha = np.asarray(subject.getchannel("A"), dtype=np.float64)
    ys, xs = np.nonzero(alpha >= 8)
    weights = alpha[ys, xs]
    points = np.column_stack((xs, ys))
    centered = points - np.average(points, axis=0, weights=weights)
    covariance = (centered * weights[:, None]).T @ centered / weights.sum()
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    ratio = float(eigenvalues[-1] / max(eigenvalues[-2], 1e-9))
    axis = eigenvectors[:, -1] if ratio >= 2.0 else np.array([0.0, -1.0])
    if ratio >= 2.0 and subtype != "qin":
        projection = centered @ axis
        transverse = centered @ np.array([-axis[1], axis[0]])
        cutoff_low, cutoff_high = np.percentile(projection, [12, 88])
        low_width = np.average(np.abs(transverse[projection <= cutoff_low]),
                               weights=weights[projection <= cutoff_low])
        high_width = np.average(np.abs(transverse[projection >= cutoff_high]),
                                weights=weights[projection >= cutoff_high])
        if high_width > low_width:
            axis = -axis
    elif axis[1] > 0:
        axis = -axis
    if bool(entry.get("axisFlip", False)):
        axis = -axis
    angle = math.degrees(math.atan2(axis[0], -axis[1]))
    upright = subject.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    upright = crop_with_padding(upright, validate_area=False)
    target = round(length_m * 256)
    _, alpha_top, _, alpha_bottom = alpha_bbox(upright)
    scale = target / max(alpha_bottom - alpha_top, 1)
    # Scale the whole padded image; alpha is re-measured because Lanczos may add one fringe pixel.
    base_height = max(1, round(upright.height * scale))
    candidates = []
    search_radius = max(8, round(base_height * 0.08))
    for delta in range(-search_radius, search_radius + 1):
        height = max(1, base_height + delta)
        width = max(1, round(upright.width * height / upright.height))
        candidate = upright.resize((width, height), Image.Resampling.LANCZOS)
        _, top, _, bottom = alpha_bbox(candidate)
        candidates.append((abs((bottom - top) - target), abs(delta), delta, candidate))
    _, _, _, scaled = min(candidates, key=lambda item: item[:3])
    _, scaled_top, _, scaled_bottom = alpha_bbox(scaled)
    if abs((scaled_bottom - scaled_top) - target) > 3:
        raise BuildError(f"{item_id}: weapon alpha length cannot converge to {target} px")
    cell_width = max(64, scaled.width + 16)
    cell_height = scaled.height + 16
    cell_width += cell_width % 2
    cell_height += cell_height % 2
    cell = Image.new("RGBA", (cell_width, cell_height))
    cell.alpha_composite(scaled, ((cell_width - scaled.width) // 2, 8))
    strip = Image.new("RGBA", (cell_width * 3, cell_height))
    for index in range(3):
        strip.alpha_composite(cell, (index * cell_width, 0))
    grip = [cell_width // 2, 8 + round(scaled_bottom - 1 - grip_ratio * (scaled_bottom - scaled_top - 1))]
    return strip, {"subtype": subtype, "axisRatio": round(ratio, 6),
                   "rotationDeg": round(angle, 6), "lengthM": length_m,
                   "gripRatio": grip_ratio, "fitScale": round(scale, 8), "grip": grip}
