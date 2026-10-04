#!/usr/bin/env python3
"""Segment a normalized rig view into 13 joint-capped source parts."""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

import numpy as np
import yaml
from PIL import Image, ImageDraw
from scipy import ndimage
from skimage.restoration import inpaint

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.rig.templates import PART_JOINTS, SHARED_CHILD_JOINTS, SOURCE_PARTS

ARM_PARTS = ("upper_arm_L", "upper_arm_R", "forearm_L", "forearm_R",
             "hand_L", "hand_R")
REUSE_SIDE = {"upper_arm_R": "upper_arm_L", "forearm_R": "forearm_L",
              "hand_R": "hand_L", "thigh_shared": "thigh_shared",
              "shin_shared": "shin_shared", "foot_shared": "foot_shared"}
MAX_INPAINTED_PCT = 20.0


def load_keypoints(path: Path) -> tuple[dict[str, tuple[float, float]], dict[str, float]]:
    loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(loaded, dict) or not isinstance(loaded.get("keypoints"), dict):
        raise ValueError(f"{path}: missing keypoints mapping")
    points: dict[str, tuple[float, float]] = {}; confidence: dict[str, float] = {}
    for name, record in loaded["keypoints"].items():
        value = record.get("xy") if isinstance(record, dict) else record
        if not isinstance(value, (list, tuple)) or len(value) != 2:
            raise ValueError(f"{path}:{name}: point must have two coordinates")
        points[str(name)] = (float(value[0]), float(value[1]))
        confidence[str(name)] = float(record.get("confidence", 1.0)
                                      if isinstance(record, dict) else 1.0)
    return points, confidence


def capsule(shape: tuple[int, int], start: Sequence[float], end: Sequence[float],
            radius: float) -> np.ndarray:
    yy, xx = np.indices(shape, dtype=np.float32)
    ax, ay = start; bx, by = end; vx, vy = bx - ax, by - ay
    denom = max(vx * vx + vy * vy, 1e-6)
    t = np.clip(((xx - ax) * vx + (yy - ay) * vy) / denom, 0.0, 1.0)
    return (xx - (ax + t * vx)) ** 2 + (yy - (ay + t * vy)) ** 2 <= radius ** 2


def limb_tube(shape: tuple[int, int], start: Sequence[float], end: Sequence[float],
              radius: float, overlap: float = 5.0) -> np.ndarray:
    """Capsule clipped along its axis so neighbours do not enter end caps."""
    yy, xx = np.indices(shape, dtype=np.float32)
    ax, ay = start; bx, by = end; vx, vy = bx - ax, by - ay
    length = max(math.hypot(vx, vy), 1e-6)
    along = ((xx - ax) * vx + (yy - ay) * vy) / length
    return (capsule(shape, start, end, radius) &
            (along >= -overlap) & (along <= length + overlap))


def split_arm_masks(shape: tuple[int, int], elbow: Sequence[float],
                    grip: Sequence[float], wrist_fraction: float = .60
                    ) -> tuple[np.ndarray, np.ndarray]:
    """Partition one visible elbow-to-fingertip chain at its wrist waist."""
    yy, xx = np.indices(shape, dtype=np.float32)
    ax, ay = elbow; bx, by = grip; vx, vy = bx-ax, by-ay
    length = max(math.hypot(vx, vy), 1e-6)
    along = ((xx-ax)*vx + (yy-ay)*vy) / length
    overlap = 3.5
    return (along <= length*wrist_fraction + overlap,
            along >= length*wrist_fraction - overlap)


def arm_wrist(points: Mapping[str, Sequence[float]], side: str,
              fraction: float = .60) -> tuple[float, float]:
    """Infer the wrist waist; silhouette priors can land on the knuckles."""
    elbow, grip = points[f"elbow_{side}"], points[f"grip_{side}"]
    return (elbow[0] + (grip[0]-elbow[0])*fraction,
            elbow[1] + (grip[1]-elbow[1])*fraction)


def polygon_mask(shape: tuple[int, int], points: Sequence[Sequence[float]]) -> np.ndarray:
    mask = Image.new("L", (shape[1], shape[0]))
    ImageDraw.Draw(mask).polygon([(round(x), round(y)) for x, y in points], fill=255)
    return np.asarray(mask) > 0


def part_mask(part: str, shape: tuple[int, int], points: Mapping[str, Sequence[float]],
              view: str = "front34") -> np.ndarray:
    height = shape[0]; pivot_name, child_name = PART_JOINTS[part]
    if part in {"head", "hair_or_headgear"}:
        crown, neck = points["crown"], points["neck"]
        radius = height * (.100 if part == "head" else .105)
        mask = capsule(shape, crown, neck, radius)
        if part == "hair_or_headgear":
            yy = np.indices(shape)[0]
            mask &= yy <= crown[1] + (neck[1] - crown[1]) * .72
        return mask
    if part == "torso":
        neck, pelvis = points["neck"], points["pelvis"]
        sl, sr = points["shoulder_L"], points["shoulder_R"]
        neck_half = height * (.017 if view == "side" else .025)
        shoulder_half = (height * .055 if view == "side" else
                         abs(sl[0] - sr[0]) * .55)
        # The old lower corners followed the arm span and admitted hanging
        # forearms.  A torso owns the body column; sleeves own the arms.
        body_half = height * (.075 if view == "side" else .105)
        center = (neck[0] + pelvis[0]) * .5; top = neck[1] - height * .008
        shoulder_y = min(sl[1], sr[1]) - height * .045
        return polygon_mask(shape, ((neck[0]-neck_half, top),
            (neck[0]+neck_half, top), (center+shoulder_half, shoulder_y),
            (pelvis[0]+body_half, pelvis[1]+height*.045),
            (pelvis[0]-body_half, pelvis[1]+height*.045),
            (center-shoulder_half, shoulder_y)))
    if part == "pelvis_skirt":
        pelvis, hem = points["pelvis"], points["hem"]
        half_top, half_bottom = height * .16, height * .22
        return polygon_mask(shape, ((pelvis[0]-half_top, pelvis[1]-height*.035),
            (pelvis[0]+half_top, pelvis[1]-height*.035),
            (hem[0]+half_bottom, hem[1]+height*.015),
            (hem[0]-half_bottom, hem[1]+height*.015)))
    if part == "foot_shared":
        ankle = points[pivot_name]; toe = points[child_name]
        direction = 1.0 if toe[0] >= ankle[0] else -1.0
        toe = (toe[0] + direction * height * .055, toe[1])
        return limb_tube(shape, ankle, toe, height * .075)
    if part.startswith(("forearm_", "hand_")):
        side = part[-1]
        wrist = arm_wrist(points, side)
        whole = limb_tube(shape, points[f"elbow_{side}"],
                          points[f"grip_{side}"],
                          height * (.040 if view == "side" else .055))
        return (whole & limb_tube(shape, points[f"elbow_{side}"], wrist,
                                  height*.06, overlap=3.5)
                if part.startswith("forearm_") else
                whole & limb_tube(shape, wrist, points[f"grip_{side}"],
                                  height*.06, overlap=3.5))
    radii = {"upper_arm": .070, "forearm": .055, "hand": .042,
             "thigh": .095, "shin": .074, "foot": .055}
    if view == "side":
        radii.update(upper_arm=.045, forearm=.028, hand=.024,
                     thigh=.050, shin=.045, foot=.050)
    family = part.split("_")[0] if not part.startswith("upper_arm") else "upper_arm"
    return limb_tube(shape, points[pivot_name], points[child_name],
                     height * radii[family])


def isolation_mask(part: str, shape: tuple[int, int],
                   points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Exclude pixels owned by articulated children from core garments."""
    keep = np.ones(shape, dtype=bool)
    if part not in {"torso", "pelvis_skirt"}:
        return keep
    height = shape[0]
    arm_radius = height * (.034 if part == "torso" else .047)
    for side in ("L", "R"):
        start = points[f"shoulder_{side}"]
        end = points[f"wrist_{side}"]
        arm = capsule(shape, start, end, arm_radius)
        arm &= ~capsule(shape, start, start, height * .038)
        keep &= ~arm
    if part == "pelvis_skirt":
        for side in ("L", "R"):
            hand = capsule(shape, points[f"wrist_{side}"],
                           points[f"grip_{side}"], height * .032)
            keep &= ~hand
    return keep


def core_joint_caps(part: str, shape: tuple[int, int],
                    points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Core caps must never reintroduce pixels removed as arms/hands."""
    caps = joint_caps(part, shape, points, radius_px=8.0)
    if part not in {"torso", "pelvis_skirt"}:
        return caps
    return caps & isolation_mask(part, shape, points)


def neighbouring_limb_mask(part: str, shape: tuple[int, int],
                           points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Pixels from overlapping articulated neighbours must not enter a part."""
    height = shape[0]; blocked = np.zeros(shape, dtype=bool)
    if part in {"thigh_shared", "shin_shared", "foot_shared"}:
        for side in ("L", "R"):
            blocked |= limb_tube(shape, points[f"elbow_{side}"],
                                 points[f"grip_{side}"], height * .030, 3)
    return blocked


def skin_mask(rgba: np.ndarray) -> np.ndarray:
    """Conservative identity-skin mask used to reject overlapping hands."""
    red = rgba[..., 0].astype(np.int16)
    green = rgba[..., 1].astype(np.int16)
    blue = rgba[..., 2].astype(np.int16)
    return ((rgba[..., 3] >= 32) & (red > 140) &
            (red - green > 25) & (green - blue > 4))


def hand_pixel_mask(rgba: np.ndarray) -> np.ndarray:
    """YCbCr skin classifier: retain shaded fingers, reject linen/robe."""
    rgb = rgba[..., :3].astype(np.uint8)
    ycbcr = np.asarray(Image.fromarray(rgb, "RGB").convert("YCbCr"))
    red = rgb[..., 0].astype(np.int16)
    cb = ycbcr[..., 1].astype(np.int16)
    cr = ycbcr[..., 2].astype(np.int16)
    return ((rgba[..., 3] >= 32) & (red > 70) &
            (cr >= 139) & (cr - cb >= 15))


def hair_mask(rgba: np.ndarray, points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Keep dark hair/tie pixels while excluding face, neck, and collar."""
    yy, xx = np.indices(rgba.shape[:2])
    crown, neck = points["crown"], points["neck"]; height = rgba.shape[0]
    red, green, blue = (rgba[..., index].astype(np.int16) for index in range(3))
    luminance = (2126 * red + 7152 * green + 722 * blue) // 10000
    region = (((xx - neck[0]) ** 2 +
               (np.maximum(yy - crown[1], 0) * .15) ** 2 < (height * .115) ** 2) &
              (yy >= max(0, crown[1] - height * .035)) &
              (yy <= neck[1] + height * .005) & (rgba[..., 3] >= 200))
    skin = ((red > 135) & (red - green > 22) & (green - blue > 2) &
            (red > green * 1.08) & region)
    face = ndimage.binary_dilation(ndimage.binary_fill_holes(
        ndimage.binary_closing(skin, iterations=4)), iterations=3)
    # Highlighted black hair can be much lighter than its local base.  Keep
    # those neutral highlights only when connected to genuinely dark hair.
    dark_seed = (luminance < 112) & ~face
    neutral_highlight = ((luminance < 190) &
                         (np.maximum.reduce((red, green, blue)) -
                          np.minimum.reduce((red, green, blue)) < 22) & ~face)
    dark = dark_seed | (neutral_highlight &
                        ndimage.binary_dilation(dark_seed, iterations=2))
    tie = ((red > 60) & (red > green * 1.28) & (red > blue * 1.18) &
           (luminance < 125) & ~face)
    candidates = region & (dark | tie)
    labels, _ = ndimage.label(candidates)
    if labels.max() == 0:
        return candidates
    sizes = np.bincount(labels.ravel()); sizes[0] = 0
    # Small connected tie/ribbon islands are legitimate; single-pixel dark
    # antialias specks are not.
    return np.isin(labels, np.flatnonzero(sizes >= 5))


def keep_primary_component(mask: np.ndarray, seeds: Sequence[Sequence[float]]) -> np.ndarray:
    """Drop disconnected pixels from adjacent limbs caught by a broad mask."""
    labels, count = ndimage.label(mask)
    if count <= 1:
        return mask
    selected: set[int] = set()
    for x, y in seeds:
        iy = min(mask.shape[0] - 1, max(0, round(y)))
        ix = min(mask.shape[1] - 1, max(0, round(x)))
        label = int(labels[iy, ix])
        if label:
            selected.add(label)
    if not selected:
        sizes = np.bincount(labels.ravel()); selected.add(int(np.argmax(sizes[1:]) + 1))
    return np.isin(labels, list(selected))


def enforce_joint_disks(rgba: np.ndarray, points: Sequence[Sequence[float]],
                        radius: float = 8.0, *, bridge_disconnected: bool = False
                        ) -> tuple[np.ndarray, np.ndarray]:
    """Fill only disks touching the part; an authored miss must not float."""
    result = rgba.copy(); visible = result[..., 3] >= 8
    disks = np.zeros(visible.shape, dtype=bool)
    for point in points:
        candidate = capsule(visible.shape, point, point, radius)
        if not np.any(candidate & ndimage.binary_dilation(visible, iterations=1)):
            if not bridge_disconnected or not visible.any():
                continue
            nearest = ndimage.distance_transform_edt(
                ~visible, return_distances=False, return_indices=True)
            x = min(visible.shape[1] - 1, max(0, round(point[0])))
            y = min(visible.shape[0] - 1, max(0, round(point[1])))
            target = (float(nearest[1, y, x]), float(nearest[0, y, x]))
            candidate |= capsule(visible.shape, point, target, max(2.0, radius * .4))
        disks |= candidate
    missing = disks & ~visible
    result = _nearest_fill(result, missing, visible)
    connected = keep_primary_component(result[..., 3] >= 8, points)
    result[..., 3][~connected] = 0; result[..., :3][~connected] = 0
    missing &= connected
    return result, missing


def keep_largest_component(rgba: np.ndarray) -> np.ndarray:
    """Remove interpolation crumbs after rotate/inpaint without adding pixels."""
    alpha = rgba[..., 3] >= 8
    labels, count = ndimage.label(alpha)
    if count <= 1:
        return rgba
    sizes = np.bincount(labels.ravel()); keep = int(np.argmax(sizes[1:]) + 1)
    result = rgba.copy(); result[labels != keep] = 0
    return result


def joint_caps(part: str, shape: tuple[int, int],
               points: Mapping[str, Sequence[float]], radius_px: float | None = None
               ) -> np.ndarray:
    """Opaque overlap at both joints prevents rotation from opening seams."""
    pivot, child = PART_JOINTS[part]
    radii = {"head": .035, "hair_or_headgear": .035, "torso": .045,
             "pelvis_skirt": .050, "upper_arm_L": .035,
             "upper_arm_R": .035, "forearm_L": .030,
             "forearm_R": .030, "hand_L": .024, "hand_R": .024,
             "thigh_shared": .045, "shin_shared": .038,
             "foot_shared": .030}
    radius = shape[0] * radii[part] if radius_px is None else radius_px
    # A hand only overlaps its parent at the wrist.  ``grip`` is a terminal
    # attachment point, so synthesising an opaque cap there creates a disk
    # that never existed in the source sheet.
    names = [pivot] if part.startswith("hand_") else [pivot, child]
    if part == "torso":
        names.extend(("shoulder_L", "shoulder_R"))
    elif part == "pelvis_skirt":
        names.extend(("hip_L", "hip_R"))
    result = np.zeros(shape, dtype=bool)
    for name in names:
        result |= capsule(shape, points[name], points[name], radius)
    return result


def repair_region(desired: np.ndarray, exposed: np.ndarray, caps: np.ndarray,
                  *, max_gap: int = 6, max_hole: int = 1024) -> np.ndarray:
    """Select only bounded occlusions; never extrapolate a whole capsule."""
    if not exposed.any():
        return exposed.copy()
    closed = ndimage.binary_closing(exposed, iterations=max(1, max_gap // 2))
    candidates = (closed | ndimage.binary_fill_holes(exposed)) & desired & ~exposed
    labels, count = ndimage.label(candidates)
    small = np.zeros_like(exposed)
    if count:
        sizes = np.bincount(labels.ravel())
        keep = np.flatnonzero((sizes <= max_hole) & (sizes > 0))
        small = np.isin(labels, keep)
    distance = ndimage.distance_transform_edt(~exposed)
    near_caps = caps & desired & (distance <= max_gap)
    return exposed | small | near_caps


def _nearest_fill(rgba: np.ndarray, missing: np.ndarray, visible: np.ndarray) -> np.ndarray:
    result = rgba.copy()
    if not missing.any() or not visible.any():
        return result
    candidates = visible & ndimage.binary_dilation(missing, iterations=8)
    if not candidates.any():
        candidates = visible
    indices = ndimage.distance_transform_edt(~candidates, return_distances=False, return_indices=True)
    result[missing, :3] = rgba[indices[0][missing], indices[1][missing], :3]
    result[missing, 3] = 255
    return result


def inpaint_occlusion(rgba: np.ndarray, desired: np.ndarray, visible: np.ndarray) -> tuple[np.ndarray, float]:
    missing = desired & ~visible
    if not missing.any():
        return rgba.copy(), 0.0
    seed = _nearest_fill(rgba, missing, visible)
    # Biharmonic inpaint is used on small holes; nearest-fill remains the
    # deterministic fallback for large garment-hidden areas.
    if missing.sum() <= 4096 and visible.any():
        working = seed[..., :3].astype(np.float64) / 255.0
        try:
            boundary_holes = missing
            repaired = inpaint.inpaint_biharmonic(working, boundary_holes, channel_axis=-1)
            seed[..., :3][boundary_holes] = np.rint(np.clip(repaired[boundary_holes], 0, 1) * 255).astype(np.uint8)
        except (ValueError, RuntimeError):
            pass
    percent = round(100.0 * float(missing.sum()) / max(float(desired.sum()), 1.0), 3)
    return seed, percent


def _rotate_part(image: Image.Image, points: dict[str, tuple[float, float]],
                 pivot_name: str, child_name: str, target_angle: float = 90.0
                 ) -> tuple[Image.Image, dict[str, list[int]]]:
    pivot, child = points[pivot_name], points[child_name]
    angle = math.degrees(math.atan2(child[1] - pivot[1], child[0] - pivot[0]))
    rotation = target_angle - angle
    margin = max(image.size)
    square = Image.new("RGBA", (image.width + margin * 2, image.height + margin * 2))
    square.alpha_composite(image, (margin, margin))
    rotated = square.rotate(-rotation, resample=Image.Resampling.BICUBIC, expand=False,
                            center=(pivot[0] + margin, pivot[1] + margin))
    radians = math.radians(rotation)
    transformed: dict[str, list[int]] = {}
    for name, point in points.items():
        dx, dy = point[0] - pivot[0], point[1] - pivot[1]
        transformed[name] = [round(pivot[0] + margin + dx * math.cos(radians) - dy * math.sin(radians)),
                             round(pivot[1] + margin + dx * math.sin(radians) + dy * math.cos(radians))]
    return rotated, transformed


def _crop_part(image: Image.Image, points: Mapping[str, Sequence[int]]) -> tuple[Image.Image, dict[str, list[int]]]:
    alpha = np.asarray(image.getchannel("A")); ys, xs = np.nonzero(alpha >= 8)
    if not len(xs):
        raise ValueError("segmented part is empty")
    pad = max(6, round(max(xs.max()-xs.min()+1, ys.max()-ys.min()+1) * .08))
    point_x = [round(value[0]) for value in points.values()]
    point_y = [round(value[1]) for value in points.values()]
    left = max(0, min(int(xs.min()), min(point_x))-pad)
    top = max(0, min(int(ys.min()), min(point_y))-pad)
    right = min(image.width, max(int(xs.max())+1, max(point_x)+1)+pad)
    bottom = min(image.height, max(int(ys.max())+1, max(point_y)+1)+pad)
    cropped = image.crop((left, top, right, bottom))
    return cropped, {name: [round(value[0]-left), round(value[1]-top)]
                     for name, value in points.items()}


def _fallback_part(standard: Path | None, view: str, part: str
                   ) -> tuple[Image.Image, dict[str, tuple[float, float]]] | None:
    if standard is None:
        return None
    path = standard / view / f"{part}.png"
    if not path.is_file():
        return None
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
    manifest = yaml.safe_load((standard / "manifest.yaml").read_text(encoding="utf-8"))
    record = next((item for item in manifest.get("parts", [])
                   if item.get("view") == view and item.get("id") == part), None)
    if record is None:
        raise ValueError(f"{standard}: fallback metadata missing {view}/{part}")
    pivot, child = PART_JOINTS[part]
    child_key = SHARED_CHILD_JOINTS.get(part, child)
    points = {pivot: tuple(record["pivot"]),
              child: tuple(record["childJoint"][child_key])}
    for name in (("shoulder_L", "shoulder_R") if part == "torso" else
                 ("hip_L", "hip_R") if part == "pelvis_skirt" else ()):
        points[name] = tuple(record["childJoint"][name])
    return image, points


def _reconstruct_side_thigh(
        rgba: np.ndarray, points: Mapping[str, Sequence[float]]
        ) -> tuple[Image.Image, dict[str, tuple[float, float]], list[int]]:
    """Stretch a visible source-trouser patch when the side thighs overlap."""
    height, width = rgba.shape[:2]; hip, knee = points["hip_L"], points["knee_L"]
    top = max(0, round(knee[1] - height*.02))
    bottom = min(height, round(knee[1] + height*.105))
    left = max(0, round(knee[0] - height*.10))
    right = min(width, round(knee[0] + height*.10))
    patch = rgba[top:bottom, left:right].copy()
    mask = patch[..., 3] >= 32
    seed = (knee[0]-left, min(max(knee[1]-top, 0), patch.shape[0]-1))
    mask = keep_primary_component(mask, (seed,))
    patch[~mask] = 0
    ys, xs = np.nonzero(mask)
    if not len(xs):
        raise ValueError("side/thigh_shared: source trouser patch is empty")
    patch = patch[ys.min():ys.max()+1, xs.min():xs.max()+1]
    joint_x = min(max(round(knee[0]-left-xs.min()), 0), patch.shape[1]-1)
    bone_px = max(16, round(math.dist(hip, knee)))
    image = Image.fromarray(patch, "RGBA").resize(
        (patch.shape[1], bone_px + 1), Image.Resampling.BICUBIC)
    subset = {"hip_L": (joint_x, 0.0), "knee_L": (joint_x, float(bone_px))}
    return image, subset, [left+int(xs.min()), top+int(ys.min()),
                           left+int(xs.max())+1, top+int(ys.max())+1]


def _point_subset(part: str, points: Mapping[str, tuple[float, float]]) -> dict[str, tuple[float, float]]:
    pivot, child = PART_JOINTS[part]
    result = {name: points[name] for name in (pivot, child)}
    if part.startswith(("forearm_", "hand_")):
        result[pivot if part.startswith("hand_") else child] = arm_wrist(points, part[-1])
    if part == "torso":
        result.update({name: points[name] for name in ("shoulder_L", "shoulder_R")})
    if part == "pelvis_skirt":
        result.update({name: points[name] for name in ("hip_L", "hip_R")})
    return result


def segment_view(image_path: Path, keypoints_path: Path, out_dir: Path, *, view: str,
                 standard: Path | None = None,
                 garment_profile: str = "short") -> list[dict[str, Any]]:
    if garment_profile not in {"short", "ankle-robe"}:
        raise ValueError(f"unknown garment profile: {garment_profile}")
    with Image.open(image_path) as opened:
        source_image = opened.convert("RGBA")
    rgba = np.asarray(source_image, dtype=np.uint8)
    # A high threshold prevents feathered backdrop pixels from becoming
    # texture seeds when an occluded capsule is extrapolated.
    visible = rgba[..., 3] >= 200
    points, confidence = load_keypoints(keypoints_path)
    missing = {name for names in PART_JOINTS.values() for name in names if name not in points}
    if missing:
        raise ValueError(f"keypoints missing: {', '.join(sorted(missing))}")
    out_dir.mkdir(parents=True, exist_ok=True)
    records: list[dict[str, Any]] = []
    for part in SOURCE_PARTS:
        reuse = (view == "side" and part in {"upper_arm_R", "forearm_R", "hand_R"})
        if reuse:
            near_part = part[:-1] + "L"
            with Image.open(out_dir / f"{near_part}.png") as opened:
                part_image = opened.convert("RGBA")
            near_note = yaml.safe_load((out_dir / f"{near_part}.pivots.yaml").read_text(encoding="utf-8"))
            renamed = {name[:-1] + "R" if name.endswith("_L") else name: value
                       for name, value in near_note["keypoints"].items()}
            note = dict(near_note.get("source", {})); note["reusedFrom"] = near_part
            output = out_dir / f"{part}.png"
            part_image.save(output, "PNG", optimize=False, compress_level=9)
            sidecar_path = out_dir / f"{part}.pivots.yaml"
            sidecar_path.write_text(yaml.safe_dump({"coordinates": "source",
                "keypoints": renamed, "source": note}, allow_unicode=True, sort_keys=False),
                encoding="utf-8")
            records.append({"part": part, "file": output.name, "pivots": sidecar_path.name,
                "inpaintedPct": float(note.get("inpaintedPct", 0.0)),
                "standardFallback": bool(note.get("standardFallback", False)),
                "reusedFrom": near_part})
            continue
        source_note: dict[str, Any] = {}
        if garment_profile == "ankle-robe" and part in {"thigh_shared", "shin_shared"}:
            source_note.update(sourceLimitation="garmentHidden",
                               reconstruction="sourceRobeTexture")
        caps = core_joint_caps(part, visible.shape, points)
        seam_caps = joint_caps(part, visible.shape, points, radius_px=3.5)
        desired = ((part_mask(part, visible.shape, points, view) &
                    isolation_mask(part, visible.shape, points)) | caps)
        if part == "hair_or_headgear":
            desired = hair_mask(rgba, points)
        if (garment_profile == "ankle-robe" and view == "side"
                and part == "torso"):
            # Both profile sleeves cross the narrow body column.  Removing
            # their full capsules can split the collar/chest from the waist,
            # after which largest-component cleanup discards the upper torso.
            # Restore only a slim neck-to-pelvis core; sleeves remain owned by
            # the arm parts and the source pixels keep the torso connected.
            desired |= capsule(visible.shape, points["neck"], points["pelvis"],
                               visible.shape[0] * .035)
        pivot_name, child_name = PART_JOINTS[part]
        robe_foot_region = None
        robe_foot_component = False
        if garment_profile == "ankle-robe" and part == "foot_shared":
            # The broad foot capsule otherwise captures a rectangular strip of
            # the ankle-length robe.  Only the exposed shoe/sock below the
            # ankle belongs to the articulated foot.
            yy = np.indices(visible.shape)[0]
            robe_foot_component = view == "front34"
            offset = 2 if robe_foot_component else 3
            robe_foot_region = yy >= round(points[pivot_name][1] - offset)
            if robe_foot_component:
                desired = visible & robe_foot_region
            else:
                desired &= robe_foot_region
        seeds = ((points[pivot_name],) if robe_foot_component else
                 (points[pivot_name], points[child_name]))
        exposed = keep_primary_component(desired & visible, seeds)
        if robe_foot_component:
            # At ankle height the skirt and both shoes can be one silhouette;
            # below it, keep only the component containing the near ankle.
            desired = exposed.copy()
        if part.startswith("hand_"):
            exposed &= hand_pixel_mask(rgba)
        if part.startswith(("forearm_", "hand_")):
            side = part[-1]
            forearm_side, hand_side = split_arm_masks(
                visible.shape, points[f"elbow_{side}"], points[f"grip_{side}"]
            )
            exposed &= forearm_side if part.startswith("forearm_") else hand_side
        removed_occluder = np.zeros_like(exposed)
        if part not in {"torso", "pelvis_skirt", "head",
                        "hair_or_headgear"}:
            if not robe_foot_component:
                core = part_mask(part, visible.shape, points, view) & visible
                exposed &= ndimage.binary_dilation(core, iterations=2)
            blocked = neighbouring_limb_mask(part, visible.shape, points)
            keep_joints = joint_caps(part, visible.shape, points, radius_px=5.0)
            removed_occluder |= exposed & blocked & ~keep_joints
            exposed &= ~(blocked & ~keep_joints)
            if part in {"thigh_shared", "shin_shared", "foot_shared"}:
                removed_occluder |= exposed & skin_mask(rgba)
                exposed &= ~skin_mask(rgba)
        repair_target = repair_region(desired, exposed, seam_caps)
        if removed_occluder.any():
            repair_target |= ndimage.binary_closing(removed_occluder, iterations=4)
        cut = rgba.copy(); cut[..., 3][~exposed] = 0; cut[..., :3][cut[..., 3] == 0] = 0
        repaired, inpainted_pct = inpaint_occlusion(cut, repair_target, exposed)
        if part in {"torso", "pelvis_skirt"}:
            # Faces legitimately overlap the neck cap; hands/forearms do not
            # belong to garment parts below the shoulders.
            yy = np.indices(repaired.shape[:2])[0]
            unwanted = skin_mask(repaired) & (yy > min(points["shoulder_L"][1],
                                                        points["shoulder_R"][1]))
            garment = (repaired[..., 3] >= 8) & ~unwanted
            repaired = _nearest_fill(repaired, unwanted, garment)
        if part in {"thigh_shared", "shin_shared", "foot_shared"}:
            # Biharmonic interpolation can recreate skin-like colours after
            # the overlapping hand was removed.  Refill those pixels from
            # opaque, non-skin garment pixels without changing the silhouette.
            unwanted = skin_mask(repaired)
            clean = (repaired[..., 3] >= 8) & ~unwanted
            repaired = _nearest_fill(repaired, unwanted, clean)
        if garment_profile == "ankle-robe" and view == "side" and (
                part.startswith(("upper_arm_", "forearm_", "hand_"))):
            # Source joints contain no solid black disks; interpolation at the
            # narrow profile seams can nevertheless create them.  They become
            # conspicuous dots when the arm rotates across the waist.
            opaque = repaired[..., 3] >= 8
            cap_region = joint_caps(part, visible.shape, points, radius_px=10.0)
            near_black = (opaque & cap_region &
                          (repaired[..., :3].max(axis=2) < 45))
            repaired = _nearest_fill(repaired, near_black, opaque & ~near_black)
        joint_points = dict(points)
        if part.startswith(("forearm_", "hand_")):
            joint_points["wrist_" + part[-1]] = arm_wrist(points, part[-1])
        joint_names = [pivot_name] if part.startswith("hand_") else [pivot_name, child_name]
        if part == "pelvis_skirt":
            # The hip anchors are metadata inside the garment; do not synthesize
            # visible disks or bridges when an occluding arm hides the waist.
            joint_names = [pivot_name, child_name]
        if part == "hair_or_headgear":
            seam_pixels = np.zeros_like(exposed)
        else:
            repaired, seam_pixels = enforce_joint_disks(
                repaired, (joint_points[name] for name in joint_names),
                radius=(2.0 if robe_foot_region is not None else 8.0),
                bridge_disconnected=False)
            if robe_foot_region is not None:
                repaired[~robe_foot_region] = 0
                seam_pixels &= robe_foot_region
        if part == "torso":
            repaired, seam_pixels = enforce_joint_disks(
                repaired, (points[pivot_name],), radius=8.0)
        inpainted_pct = round(float(100.0 * (
            (repair_target & ~exposed).sum() + seam_pixels.sum()) /
            max(float(desired.sum()), 1.0)), 3)
        measured_inpainted_pct = inpainted_pct
        part_image = Image.fromarray(repaired, "RGBA")
        subset = _point_subset(part, points)
        if robe_foot_component:
            shoe_y, shoe_x = np.nonzero(repaired[..., 3] >= 8)
            ankle_x, ankle_y = points[pivot_name]
            farthest = np.argmax((shoe_x - ankle_x) ** 2 +
                                 (shoe_y - ankle_y) ** 2)
            subset[child_name] = (float(shoe_x[farthest]),
                                  float(shoe_y[farthest]))
        fallback = False
        use_fallback = inpainted_pct > MAX_INPAINTED_PCT
        if use_fallback and view == "side" and part == "thigh_shared":
            part_image, subset, source_rect = _reconstruct_side_thigh(rgba, points)
            source_note.update(reconstruction=("sourceRobePatch"
                               if garment_profile == "ankle-robe"
                               else "sourceTrouserPatch"),
                               sourceRect=source_rect, coordinates="reconstructed")
            use_fallback = False
            inpainted_pct = 0.0
        if use_fallback or not np.any(np.asarray(part_image.getchannel("A")) >= 8):
            replacement = _fallback_part(standard, view, part)
            if replacement is None:
                raise ValueError(f"{view}/{part}: empty and no standard fallback")
            part_image, subset = replacement; fallback = True
            inpainted_pct = 0.0
        pivot_name, child_name = PART_JOINTS[part]
        if part not in {"torso", "pelvis_skirt", "head", "hair_or_headgear", "foot_shared"}:
            target_angle = 180.0 if part.startswith("forearm_") else 90.0
            part_image, rotated_points = _rotate_part(
                part_image, subset, pivot_name, child_name, target_angle
            )
        else:
            rotated_points = {name: [round(value[0]), round(value[1])] for name, value in subset.items()}
        part_image = Image.fromarray(keep_largest_component(
            np.asarray(part_image, dtype=np.uint8)), "RGBA")
        part_image, local_points = _crop_part(part_image, rotated_points)
        output = out_dir / f"{part}.png"
        part_image.save(output, "PNG", optimize=False, compress_level=9)
        sidecar = {"coordinates": "source", "keypoints": local_points,
                   "source": {"keypoints": list(subset),
                              "inpaintedPct": inpainted_pct,
                              "rejectedInpaintedPct": (measured_inpainted_pct
                                                       if fallback else 0.0),
                              "jointCaps": ("wristOnly" if part.startswith("hand_")
                                            else True),
                              "standardFallback": fallback,
                              "lowConfidence": [name for name in subset
                                                if confidence.get(name, 1.0) < .5]}}
        sidecar["source"].update(source_note)
        sidecar_path = out_dir / f"{part}.pivots.yaml"
        sidecar_path.write_text(yaml.safe_dump(sidecar, allow_unicode=True, sort_keys=False),
                                encoding="utf-8")
        records.append({"part": part, "file": output.name,
                        "pivots": sidecar_path.name, "inpaintedPct": inpainted_pct,
                        "standardFallback": fallback})
    return records


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("image", type=Path)
    result.add_argument("keypoints", type=Path)
    result.add_argument("--out", type=Path, required=True)
    result.add_argument("--view", choices=("front34", "side", "back34"), required=True)
    result.add_argument("--standard", type=Path, help="male_std/female_std fallback root")
    result.add_argument("--garment-profile", choices=("short", "ankle-robe"),
                        default="short")
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        records = segment_view(args.image.resolve(), args.keypoints.resolve(), args.out.resolve(),
                               view=args.view, standard=args.standard.resolve() if args.standard else None,
                               garment_profile=args.garment_profile)
    except (OSError, ValueError, KeyError, yaml.YAMLError) as exc:
        print(f"segment_parts: {exc}", file=sys.stderr)
        return 1
    print(f"segment_parts: wrote {len(records)} parts to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
