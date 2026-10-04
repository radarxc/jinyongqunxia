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
              view: str = "front34", *, strict_ownership: bool = False) -> np.ndarray:
    height = shape[0]; pivot_name, child_name = PART_JOINTS[part]
    if part == "head" and strict_ownership:
        crown, neck = points["crown"], points["neck"]
        radius = height * .082
        return capsule(shape, crown, neck, radius) & polygon_mask(shape, (
            (crown[0]-radius, crown[1]-height*.025),
            (crown[0]+radius, crown[1]-height*.025),
            (neck[0]+height*.045, neck[1]+height*.018),
            (neck[0]-height*.045, neck[1]+height*.018)))
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
        center = (neck[0] + pelvis[0]) * .5; top = neck[1] - height * .008
        if strict_ownership:
            left, right = sorted((sl, sr), key=lambda point: point[0])
            armpit_y = min(sl[1], sr[1]) + height * .065
            waist_half = height * (.070 if view == "side" else .090)
            armpit_left = (left[0] - height*.005 if view == "side"
                            else center - waist_half)
            armpit_right = (right[0] + height*.005 if view == "side"
                             else center + waist_half)
            return polygon_mask(shape, ((neck[0]-neck_half, top),
                (neck[0]+neck_half, top), right, (armpit_right, armpit_y),
                (pelvis[0]+waist_half, pelvis[1]+height*.045),
                (pelvis[0]-waist_half, pelvis[1]+height*.045),
                (armpit_left, armpit_y), left))
        shoulder_half = (height * (.045 if strict_ownership else .055)
                         if view == "side" else
                         abs(sl[0] - sr[0]) * (.48 if strict_ownership else .55))
        # The old lower corners followed the arm span and admitted hanging
        # forearms.  A torso owns the body column; sleeves own the arms.
        body_half = height * (.075 if view == "side" else
                              (.095 if strict_ownership else .105))
        shoulder_y = min(sl[1], sr[1]) - height * (
            .0125 if strict_ownership else .045)
        return polygon_mask(shape, ((neck[0]-neck_half, top),
            (neck[0]+neck_half, top), (center+shoulder_half, shoulder_y),
            (pelvis[0]+body_half, pelvis[1]+height*.045),
            (pelvis[0]-body_half, pelvis[1]+height*.045),
            (center-shoulder_half, shoulder_y)))
    if part == "pelvis_skirt":
        pelvis, hem = points["pelvis"], points["hem"]
        half_top = height * (.105 if strict_ownership else .16)
        half_bottom = height * (.135 if strict_ownership else .22)
        top = pelvis[1] - height * (.075 if strict_ownership else .035)
        bottom = hem[1] + (2 if strict_ownership else height*.015)
        return polygon_mask(shape, ((pelvis[0]-half_top, top),
            (pelvis[0]+half_top, top), (hem[0]+half_bottom, bottom),
            (hem[0]-half_bottom, bottom)))
    if part == "foot_shared":
        ankle = points[pivot_name]; toe = points[child_name]
        if strict_ownership:
            direction = 1.0 if toe[0] >= ankle[0] else -1.0
            heel = (ankle[0] - direction * height * .025,
                    ankle[1] + height * .005)
            return limb_tube(shape, heel, toe, height * .042, overlap=height*.018)
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


def _segment_distance2(shape: tuple[int, int], start: Sequence[float],
                       end: Sequence[float]) -> np.ndarray:
    yy, xx = np.indices(shape, dtype=np.float32)
    ax, ay = start; bx, by = end; vx, vy = bx-ax, by-ay
    scale = max(vx*vx + vy*vy, 1e-6)
    along = np.clip(((xx-ax)*vx + (yy-ay)*vy) / scale, 0.0, 1.0)
    return (xx-(ax+along*vx))**2 + (yy-(ay+along*vy))**2


def strict_limb_partition(part: str, shape: tuple[int, int],
                          points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Voronoi ownership prevents a shared source from containing both legs."""
    joints = {"thigh_shared": ("hip", "knee"),
              "shin_shared": ("knee", "ankle"),
              "foot_shared": ("ankle", "toe")}
    if part not in joints:
        return np.ones(shape, dtype=bool)
    start, end = joints[part]
    near = _segment_distance2(shape, points[f"{start}_L"], points[f"{end}_L"])
    far = _segment_distance2(shape, points[f"{start}_R"], points[f"{end}_R"])
    return near <= far


def skin_mask(rgba: np.ndarray) -> np.ndarray:
    """Conservative identity-skin mask used to reject overlapping hands."""
    red = rgba[..., 0].astype(np.int16)
    green = rgba[..., 1].astype(np.int16)
    blue = rgba[..., 2].astype(np.int16)
    return ((rgba[..., 3] >= 32) & (red > 140) &
            (red - green > 25) & (green - blue > 4))


def warm_pixel_mask(rgba: np.ndarray) -> np.ndarray:
    """Brown tunic/shoe pixels, distinct from the neutral blue-grey pants."""
    red = rgba[..., 0].astype(np.int16)
    green = rgba[..., 1].astype(np.int16)
    blue = rgba[..., 2].astype(np.int16)
    return ((rgba[..., 3] >= 32) & (red - green >= 7) &
            (green - blue >= 3) & (red - blue >= 12))


def skirt_garment_mask(rgba: np.ndarray,
                       points: Mapping[str, Sequence[float]]) -> np.ndarray:
    """Keep the belt/tunic and stop before cool-grey trouser pixels."""
    opaque = rgba[..., 3] >= 32
    warm = warm_pixel_mask(rgba)
    cloth = ndimage.binary_fill_holes(
        ndimage.binary_closing(warm, iterations=2))
    cloth = ndimage.binary_dilation(cloth, iterations=1) & opaque
    yy = np.indices(opaque.shape)[0]
    waist = yy <= points["pelvis"][1] + rgba.shape[0] * .025
    return opaque & (waist | cloth)


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
                        radius: float = 8.0, *, bridge_disconnected: bool = False,
                        edge_safe_fill: bool = False
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
    result = _nearest_fill(result, missing, visible, edge_safe=edge_safe_fill)
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


def _nearest_fill(rgba: np.ndarray, missing: np.ndarray, visible: np.ndarray, *,
                  edge_safe: bool = False) -> np.ndarray:
    result = rgba.copy()
    if not missing.any() or not visible.any():
        return result
    # Segmentation accepts feathered alpha as visible so silhouettes remain
    # smooth, but fully transparent RGB is conventionally zero.  Restrict
    # colour donors to substantive alpha whenever possible; otherwise a joint
    # cap beside an antialiased edge can turn opaque black.
    opaque = visible & (rgba[..., 3] >= 128)
    donors = opaque if edge_safe and opaque.any() else visible
    candidates = donors & ndimage.binary_dilation(missing, iterations=8)
    if not candidates.any():
        candidates = donors
    indices = ndimage.distance_transform_edt(~candidates, return_distances=False, return_indices=True)
    result[missing, :3] = rgba[indices[0][missing], indices[1][missing], :3]
    result[missing, 3] = 255
    return result


def inpaint_occlusion(rgba: np.ndarray, desired: np.ndarray, visible: np.ndarray, *,
                      edge_safe_fill: bool = False) -> tuple[np.ndarray, float]:
    missing = desired & ~visible
    if not missing.any():
        return rgba.copy(), 0.0
    seed = _nearest_fill(rgba, missing, visible, edge_safe=edge_safe_fill)
    # Biharmonic inpaint is used on small holes; nearest-fill remains the
    # deterministic fallback for large garment-hidden areas.
    inpaint_mask = (missing & ndimage.binary_fill_holes(visible)
                    if edge_safe_fill else missing)
    if inpaint_mask.sum() <= 4096 and inpaint_mask.any() and visible.any():
        working = seed[..., :3].astype(np.float64) / 255.0
        try:
            repaired = inpaint.inpaint_biharmonic(working, inpaint_mask, channel_axis=-1)
            seed[..., :3][inpaint_mask] = np.rint(
                np.clip(repaired[inpaint_mask], 0, 1) * 255).astype(np.uint8)
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


def complete_hidden_thigh(
        image: Image.Image, points: Mapping[str, Sequence[int]]
        ) -> tuple[Image.Image, int]:
    """Extend a source-textured trouser leg through a garment-hidden hip.

    ``image`` is already rotated so hip-to-knee points down.  The lower half
    of the authored thigh supplies both its width and texture.  Only missing
    pixels above the first stable-width row are synthesized; visible source
    pixels are never replaced.  This is deliberately opt-in because a broad
    hidden leg must be paired with a garment-aware production asset.
    """
    rgba = np.asarray(image, dtype=np.uint8).copy()
    alpha = rgba[..., 3] >= 8
    opaque = rgba[..., 3] >= 128
    hip_x, hip_y = (int(round(value)) for value in points["hip_L"][:2])
    knee_x, knee_y = (int(round(value)) for value in points["knee_L"][:2])
    length = knee_y - hip_y
    if length < 16 or abs(knee_x - hip_x) > max(3, round(length * .05)):
        return image, 0

    search_half = max(12, round(length * .45))
    x_min = max(0, hip_x - search_half)
    x_max = min(alpha.shape[1], hip_x + search_half + 1)
    band_start = max(hip_y + 1, round(hip_y + length * .58))
    band_end = min(knee_y, round(hip_y + length * .82))
    rows: list[tuple[int, np.ndarray]] = []
    for y in range(band_start, band_end + 1):
        xs = np.flatnonzero(opaque[y, x_min:x_max]) + x_min
        if len(xs) >= 8:
            rows.append((y, xs))
    if not rows:
        return image, 0

    stable_width = float(np.median([xs[-1] - xs[0] + 1 for _, xs in rows]))
    minimum_width = max(8, round(stable_width * .55))
    join_y = rows[0][0]
    for y in range(max(hip_y + 1, round(hip_y + length * .12)), rows[0][0] + 1):
        widths = []
        for probe in range(y, min(y + 4, alpha.shape[0])):
            xs = np.flatnonzero(opaque[probe, x_min:x_max]) + x_min
            widths.append(xs[-1] - xs[0] + 1 if len(xs) else 0)
        if len(widths) == 4 and min(widths) >= minimum_width:
            join_y = y
            break

    donor_rows = [(y, xs) for y, xs in rows if y >= join_y]
    if not donor_rows:
        donor_rows = rows
    donor_centres = [(xs[0] + xs[-1]) / 2.0 for _, xs in donor_rows]
    donor_halves = [(xs[-1] - xs[0] + 1) / 2.0 for _, xs in donor_rows]
    join_centre = float(np.median(donor_centres))
    join_half = max(5.0, float(np.median(donor_halves)))
    top_y = max(0, hip_y - 7)
    target = np.zeros(alpha.shape, dtype=bool)
    span = max(1, join_y - hip_y)
    for y in range(top_y, min(join_y + 2, alpha.shape[0])):
        t = min(1.0, max(0.0, (y - hip_y) / span))
        centre = hip_x + (join_centre - hip_x) * t
        half = join_half * (0.96 + 0.04 * t)
        left = max(0, int(math.ceil(centre - half)))
        right = min(alpha.shape[1] - 1, int(math.floor(centre + half)))
        if right >= left:
            target[y, left:right + 1] = True

    # Treat feathered remnants inside the extension as gaps as well.  Keeping
    # them produced a dotted horizontal seam exactly where the source trouser
    # first emerged from behind the tunic.
    missing = target & ~opaque
    if not missing.any():
        return image, 0
    for y in np.flatnonzero(missing.any(axis=1)):
        row_t = min(1.0, max(0.0, (y - top_y) / max(join_y - top_y, 1)))
        donor_index = round(row_t * (len(donor_rows) - 1))
        donor_y, donor_xs = donor_rows[donor_index]
        targets = np.flatnonzero(missing[y])
        target_xs = np.flatnonzero(target[y])
        if not len(target_xs):
            continue
        scale = (targets - target_xs[0]) / max(target_xs[-1] - target_xs[0], 1)
        mapped = np.rint(donor_xs[0] + scale * (donor_xs[-1] - donor_xs[0])).astype(int)
        opaque_donors = donor_xs[opaque[donor_y, donor_xs]]
        if len(opaque_donors):
            mapped = opaque_donors[np.abs(opaque_donors[:, None] - mapped).argmin(axis=0)]
        rgba[y, targets] = rgba[donor_y, mapped]
        rgba[y, targets, 3] = 255
    return Image.fromarray(rgba, "RGBA"), int(missing.sum())


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
                 garment_profile: str = "short",
                 edge_safe_fill: bool = False,
                 strict_ownership: bool = False,
                 only_parts: set[str] | None = None,
                 complete_thigh: bool = False) -> list[dict[str, Any]]:
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
        if only_parts is not None and part not in only_parts:
            continue
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
        strict_cap = (part in {"head", "torso", "pelvis_skirt",
                               "foot_shared"} and strict_ownership)
        strict_head = strict_ownership and part == "head"
        if strict_head:
            # ``crown`` is an orientation landmark, not a seam.  Filling a
            # disk there extends the authored hair silhouette into a round
            # cap; standard heads need overlap only where they meet the neck.
            caps = capsule(visible.shape, points["neck"], points["neck"], 5.0)
            seam_caps = capsule(visible.shape, points["neck"], points["neck"], 3.5)
        else:
            caps = (joint_caps(part, visible.shape, points, radius_px=5.0)
                    if strict_cap else core_joint_caps(part, visible.shape, points))
            seam_caps = joint_caps(part, visible.shape, points, radius_px=3.5)
        base_mask = part_mask(part, visible.shape, points, view,
                              strict_ownership=strict_ownership)
        if strict_ownership and part == "torso":
            caps &= base_mask
        ownership = (np.ones_like(visible) if strict_ownership and part == "torso"
                     else isolation_mask(part, visible.shape, points))
        desired = (base_mask & ownership) | caps
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
        if strict_ownership and part == "pelvis_skirt":
            exposed &= skirt_garment_mask(rgba, points)
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
                core = part_mask(part, visible.shape, points, view,
                                 strict_ownership=strict_ownership) & visible
                exposed &= ndimage.binary_dilation(core, iterations=2)
            if strict_ownership:
                exposed &= strict_limb_partition(part, visible.shape, points)
                if part in {"thigh_shared", "shin_shared"}:
                    exposed &= ~warm_pixel_mask(rgba)
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
        repaired, inpainted_pct = inpaint_occlusion(
            cut, repair_target, exposed, edge_safe_fill=edge_safe_fill)
        if part in {"torso", "pelvis_skirt"}:
            # Faces legitimately overlap the neck cap; hands/forearms do not
            # belong to garment parts below the shoulders.
            yy = np.indices(repaired.shape[:2])[0]
            unwanted = skin_mask(repaired) & (yy > min(points["shoulder_L"][1],
                                                        points["shoulder_R"][1]))
            garment = (repaired[..., 3] >= 8) & ~unwanted
            repaired = _nearest_fill(repaired, unwanted, garment,
                                     edge_safe=edge_safe_fill)
        if part in {"thigh_shared", "shin_shared", "foot_shared"}:
            # Biharmonic interpolation can recreate skin-like colours after
            # the overlapping hand was removed.  Refill those pixels from
            # opaque, non-skin garment pixels without changing the silhouette.
            unwanted = skin_mask(repaired)
            clean = (repaired[..., 3] >= 8) & ~unwanted
            repaired = _nearest_fill(repaired, unwanted, clean,
                                     edge_safe=edge_safe_fill)
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
        joint_names = ([pivot_name] if part.startswith("hand_") or strict_head
                       else [pivot_name, child_name])
        if part == "pelvis_skirt":
            # The hip anchors are metadata inside the garment; do not synthesize
            # visible disks or bridges when an occluding arm hides the waist.
            joint_names = [pivot_name, child_name]
        if part == "hair_or_headgear":
            seam_pixels = np.zeros_like(exposed)
        else:
            repaired, seam_pixels = enforce_joint_disks(
                repaired, (joint_points[name] for name in joint_names),
                radius=(2.0 if robe_foot_region is not None else
                        7.0 if strict_ownership and part == "foot_shared"
                        else 8.0),
                bridge_disconnected=False, edge_safe_fill=edge_safe_fill)
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
        if complete_thigh and part == "thigh_shared":
            part_image, hidden_pixels = complete_hidden_thigh(
                part_image, rotated_points)
            if hidden_pixels:
                base_pixels = int((repair_target & ~exposed).sum() +
                                  seam_pixels.sum())
                final_pixels = int((np.asarray(
                    part_image.getchannel("A")) >= 8).sum())
                inpainted_pct = round(
                    100.0 * (base_pixels + hidden_pixels) /
                    max(float(final_pixels), 1.0), 3)
                source_note.update(
                    sourceLimitation="garmentOccludedHip",
                    reconstruction="sourceTrouserContinuation",
                    reconstructedPixels=hidden_pixels)
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
                                            else "neckOnly" if strict_head else True),
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
    result.add_argument("--edge-safe-fill", action="store_true",
                        help="补绘只取实色边缘，并仅对封闭孔洞做双调和插值")
    result.add_argument("--strict-ownership", action="store_true",
                        help="收紧头、衣摆和共享腿的像素所有权")
    result.add_argument("--only", action="append", choices=SOURCE_PARTS,
                        help="仅重切指定部件；可重复传入")
    result.add_argument("--complete-hidden-thigh", action="store_true",
                        help="用可见裤料补齐衣摆遮挡的大腿上段")
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        records = segment_view(args.image.resolve(), args.keypoints.resolve(), args.out.resolve(),
                               view=args.view, standard=args.standard.resolve() if args.standard else None,
                               garment_profile=args.garment_profile,
                               edge_safe_fill=args.edge_safe_fill,
                               strict_ownership=args.strict_ownership,
                               only_parts=set(args.only) if args.only else None,
                               complete_thigh=args.complete_hidden_thigh)
    except (OSError, ValueError, KeyError, yaml.YAMLError) as exc:
        print(f"segment_parts: {exc}", file=sys.stderr)
        return 1
    print(f"segment_parts: wrote {len(records)} parts to {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
