#!/usr/bin/env python3
"""Compose deterministic three-view rig pose strips for asset review."""
from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from PIL import Image, ImageDraw

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.rig.gait import pose
from tools.rig.templates import VIEWS
from tools.rig.clips.clip_metrics import (
    DIR8, decode_clip, nearest_view, normalize, rotate_y, unpack_i16,
    unwrap_degrees, yaw_from_span,
)
from tools.rig.clips.clip_import import BONE_DEFS

CELL = (256, 320)
GAP = 16
BACKGROUND = (230, 225, 216, 255)
ITEM_ROOT = Path(__file__).resolve().parents[2] / "assets/default/item"
DEFAULT_SWORD_ID = "eq_qinggangjian"
WORK_CELL = (512, 640)
SHARED_LIMB_Z = {
    "front34": {
        "thigh": {"R": 3, "L": 10}, "shin": {"R": 4, "L": 11},
        "foot": {"R": 5, "L": 12},
    },
    "back34": {
        "thigh": {"R": 3, "L": 9}, "shin": {"R": 4, "L": 10},
        "foot": {"R": 5, "L": 11},
    },
    "side": {
        "thigh": {"R": 3, "L": 10}, "shin": {"R": 4, "L": 11},
        "foot": {"R": 5, "L": 12},
    },
}


@dataclass
class Placement:
    image: Image.Image
    pivot: tuple[int, int]
    anchor: tuple[float, float]
    angle: float
    z: float
    part: str
    child: dict[str, list[int]]


def _transform(point: tuple[int, int] | list[int], pivot: tuple[int, int],
               anchor: tuple[float, float], angle: float) -> tuple[float, float]:
    radians = math.radians(angle)
    dx, dy = point[0] - pivot[0], point[1] - pivot[1]
    return (anchor[0] + dx * math.cos(radians) - dy * math.sin(radians),
            anchor[1] + dx * math.sin(radians) + dy * math.cos(radians))


def _child(placement: Placement, name: str) -> tuple[float, float]:
    return _transform(placement.child[name], placement.pivot, placement.anchor, placement.angle)


def _draw_rotated(canvas: Image.Image, placement: Placement) -> None:
    image, pivot = placement.image, placement.pivot
    radius = int(math.ceil(max(
        math.hypot(x - pivot[0], y - pivot[1])
        for x, y in ((0, 0), (image.width, 0), (0, image.height), image.size)
    ))) + 2
    square = Image.new("RGBA", (2 * radius + 1, 2 * radius + 1))
    square.alpha_composite(image, (radius - pivot[0], radius - pivot[1]))
    rotated = square.rotate(-placement.angle, resample=Image.Resampling.BICUBIC, center=(radius, radius))
    canvas.alpha_composite(rotated, (round(placement.anchor[0] - radius),
                                     round(placement.anchor[1] - radius)))


def _draw_scaled_rotated(canvas: Image.Image, placement: Placement, scale_y: float) -> None:
    scale_y = max(.45, float(scale_y))
    if abs(scale_y - 1.0) < 1e-6:
        _draw_rotated(canvas, placement); return
    image = placement.image.resize((placement.image.width, max(1, round(placement.image.height * scale_y))),
                                   Image.Resampling.BICUBIC)
    pivot = (placement.pivot[0], round(placement.pivot[1] * scale_y))
    child = {name: [value[0], round(value[1] * scale_y)] for name, value in placement.child.items()}
    _draw_rotated(canvas, Placement(image, pivot, placement.anchor, placement.angle,
                                    placement.z, placement.part, child))


def _downsample(canvas: Image.Image) -> Image.Image:
    result = canvas.resize(CELL, Image.Resampling.LANCZOS)
    result.putalpha(result.getchannel("A").point(lambda value: 255 if value else 0))
    return result


def _seal_joint_pinholes(image: Image.Image,
                         joints: list[tuple[float, float]]) -> Image.Image:
    """Close only one-pixel resampling holes enclosed inside joint seams."""
    source = image.load(); result = image.copy(); output = result.load()
    sx, sy = CELL[0] / WORK_CELL[0], CELL[1] / WORK_CELL[1]
    for joint_x, joint_y in joints:
        cx, cy = round(joint_x * sx), round(joint_y * sy)
        for y in range(max(1, cy - 3), min(image.height - 1, cy + 4)):
            for x in range(max(1, cx - 3), min(image.width - 1, cx + 4)):
                if (x-cx) ** 2 + (y-cy) ** 2 > 9 or source[x, y][3]:
                    continue
                neighbours = (source[x-1, y], source[x+1, y],
                              source[x, y-1], source[x, y+1])
                if all(pixel[3] for pixel in neighbours):
                    output[x, y] = tuple(
                        round(sum(pixel[channel] for pixel in neighbours) / 4)
                        for channel in range(3)) + (255,)
    return result


def _load_manifest(set_dir: Path) -> dict[str, Any]:
    data = yaml.safe_load((set_dir / "manifest.yaml").read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("schema") != "tianshu-rig.v1":
        raise ValueError("rig manifest must use schema tianshu-rig.v1")
    return data


def _source_map(set_dir: Path, manifest: dict[str, Any], view: str) -> dict[str, dict[str, Any]]:
    result = {}
    for record in manifest.get("parts", []):
        if record.get("view") == view:
            item = dict(record)
            with Image.open(set_dir / item["file"]) as opened:
                item["image"] = opened.convert("RGBA")
            result[str(item["id"])] = item
    return result


def _part(source: dict[str, dict[str, Any]], name: str, anchor: tuple[float, float],
          angle: float, *, shared: str | None = None, z: float | None = None) -> Placement:
    record = source[shared or name]
    image = record["image"]
    if shared and name.endswith("_R"):
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        pivot = (image.width - 1 - record["pivot"][0], record["pivot"][1])
        child = {key: [image.width - 1 - value[0], value[1]] for key, value in record["childJoint"].items()}
    else:
        pivot = tuple(record["pivot"])
        child = record["childJoint"]
    return Placement(image, pivot, anchor, angle + float(record.get("restAngle", 0.0)),
                     float(record["zOrder"] if z is None else z), name, child)


def _garment_occludes_legs(source: dict[str, dict[str, Any]]) -> bool:
    """Long-robed identities keep reconstructed legs behind the skirt."""
    return any(source.get(part, {}).get("source", {}).get("sourceLimitation")
               == "garmentHidden" for part in ("thigh_shared", "shin_shared"))


def _garment_occludes_thigh_hip(source: dict[str, dict[str, Any]]) -> bool:
    """Whether a completed thigh begins under a short tunic or skirt."""
    return (source.get("thigh_shared", {}).get("source", {})
            .get("sourceLimitation") == "garmentOccludedHip")


def _place_legs_behind_skirt(source: dict[str, dict[str, Any]],
                             pieces: list[Placement],
                             depths: dict[str, float] | None = None) -> None:
    long_garment = _garment_occludes_legs(source)
    hidden_hip = _garment_occludes_thigh_hip(source)
    if not long_garment and not hidden_hip:
        return
    skirt = next(item for item in pieces if item.part == "pelvis_skirt")
    hem = _child(skirt, "hem")
    if long_garment:
        for item in pieces:
            if item.part.startswith(("thigh_", "shin_")):
                # These source-textured pieces preserve the hidden FK chain only;
                # drawing them outside a rigid skirt looks like rectangular cloth.
                item.image = Image.new("RGBA", item.image.size)
            elif item.part.startswith("foot_"):
                child = next(iter(item.child.values()))
                shoe_length = math.dist(item.pivot, child)
                # A rigid ankle-length skirt cannot reveal a shoe whose ankle has
                # travelled well beyond its hem.  Keep a small seam allowance,
                # rather than scaling the threshold to a long source shoe.
                if math.dist(item.anchor, hem) > max(18.0, shoe_length * .82):
                    item.image = Image.new("RGBA", item.image.size)
    affected = (("thigh_",) if hidden_hip and not long_garment
                else ("thigh_", "shin_", "foot_"))
    if depths is None:
        skirt_z = skirt.z
        for item in pieces:
            if item.part.startswith(affected):
                item.z = min(item.z, skirt_z - 1.0)
        return
    behind = depths.get("pelvis_skirt", 0.0) - 1.0
    for item in pieces:
        if item.part.startswith(affected):
            depths[item.part] = behind


def compose_pose(set_dir: Path, manifest: dict[str, Any], view: str,
                 values: dict[str, Any], equipment: list[tuple[dict[str, Any], Image.Image]] | None = None) -> Image.Image:
    source = _source_map(set_dir, manifest, view)
    canvas = Image.new("RGBA", WORK_CELL, BACKGROUND)
    root = (WORK_CELL[0] / 2 + values.get("pelvisX", 0.0) * 256,
            330 + values.get("bodyY", 0.0) * 256)
    pieces: list[Placement] = []
    pelvis = _part(source, "pelvis_skirt", root, values.get("torsoRoll", 0.0))
    torso = _part(source, "torso", root, values.get("torsoRoll", 0.0) + values.get("torsoLean", 0.0))
    pieces.extend((pelvis, torso))
    neck = _child(torso, "neck")
    head_angle = torso.angle - 0.55 * values.get("torsoRoll", 0.0)
    pieces.append(_part(source, "head", neck, head_angle))
    pieces.append(_part(source, "hair_or_headgear", neck, head_angle))
    for side in ("L", "R"):
        shoulder = _child(torso, f"shoulder_{side}")
        upper = _part(source, f"upper_arm_{side}", shoulder,
                      torso.angle + values[f"shoulder_{side}"])
        pieces.append(upper)
        elbow_anchor = _child(upper, f"elbow_{side}")
        forearm = _part(source, f"forearm_{side}", elbow_anchor,
                        upper.angle + values[f"elbow_{side}"])
        pieces.append(forearm)
        wrist = _child(forearm, f"wrist_{side}")
        # Hand source pixels point down; the normalized forearm points left
        # and carries restAngle=-90, so compensate the 90-degree axis delta.
        pieces.append(_part(source, f"hand_{side}", wrist, forearm.angle + 90.0))
        hip_anchor = _child(pelvis, f"hip_{side}")
        thigh = _part(source, f"thigh_{side}", hip_anchor,
                      pelvis.angle + values[f"hip_{side}"],
                      shared="thigh_shared", z=SHARED_LIMB_Z[view]["thigh"][side])
        pieces.append(thigh)
        knee = _child(thigh, "knee")
        shin = _part(source, f"shin_{side}", knee, thigh.angle + values[f"knee_{side}"],
                     shared="shin_shared", z=SHARED_LIMB_Z[view]["shin"][side])
        pieces.append(shin)
        ankle = _child(shin, "ankle")
        pieces.append(_part(source, f"foot_{side}", ankle, shin.angle + values[f"ankle_{side}"],
                            shared="foot_shared", z=SHARED_LIMB_Z[view]["foot"][side]))
    placements = {item.part: item for item in pieces}
    for record, layer_image in equipment or []:
        slot = str(record["slot"])
        if slot in placements:
            parent = placements[slot]
            anchor, angle = parent.anchor, parent.angle
        elif slot.startswith("pauldron_"):
            side = slot[-1]
            anchor, angle = _child(torso, f"shoulder_{side}"), torso.angle
        elif slot == "cape":
            anchor, angle = neck, torso.angle
        elif slot == "belt":
            anchor, angle = root, pelvis.angle
        elif slot.startswith("weapon_"):
            side = slot[-1]
            hand = placements[f"hand_{side}"]
            anchor, angle = _child(hand, f"grip_{side}"), hand.angle
        else:
            continue
        pieces.append(Placement(layer_image, tuple(record["pivot"]), anchor, angle,
                                float(record["zOrder"]), f"equipment:{slot}", {}))
    _place_legs_behind_skirt(source, pieces)
    for placement in sorted(pieces, key=lambda item: (item.z, item.part)):
        _draw_rotated(canvas, placement)
    return _downsample(canvas)


def _angle_and_ratio(start: tuple[float, float, float], end: tuple[float, float, float]) -> tuple[float, float]:
    dx, dy, dz = end[0]-start[0], -(end[1]-start[1]), end[2]-start[2]
    length3 = max(math.sqrt(dx*dx + dy*dy + dz*dz), 1e-9)
    return math.degrees(math.atan2(dy, dx)), max(.45, math.hypot(dx, dy) / length3)


def depth_order(pieces: list[Placement], depths: dict[str, float]) -> list[Placement]:
    """Sort far-to-near; stable manifest z resolves equal-depth overlap."""
    return sorted(pieces, key=lambda item: (depths.get(item.part, 0.0),
                                            item.z, item.part))


def _scaled(placement: Placement, ratio: float) -> Placement:
    ratio = max(.45, ratio)
    if abs(ratio - 1.0) < 1e-6:
        return placement
    old_pivot = placement.pivot
    child = next(iter(placement.child.values()))
    horizontal = abs(child[0] - old_pivot[0]) > abs(child[1] - old_pivot[1])
    sx, sy = (ratio, 1.0) if horizontal else (1.0, ratio)
    image = placement.image.resize((max(1, round(placement.image.width * sx)),
                                    max(1, round(placement.image.height * sy))),
                                   Image.Resampling.BICUBIC)
    pivot = (round(old_pivot[0] * sx), round(old_pivot[1] * sy))
    return Placement(image, pivot,
                     placement.anchor, placement.angle, placement.z, placement.part,
                     {name: [round(value[0] * sx), round(value[1] * sy)]
                      for name, value in placement.child.items()})


def _absolute_part(source: dict[str, dict[str, Any]], name: str, anchor: tuple[float, float],
                   desired_angle: float, ratio: float, *, shared: str | None = None,
                   z: float | None = None) -> Placement:
    probe = _part(source, name, anchor, 0.0, shared=shared, z=z)
    child_name = next(iter(probe.child))
    if name == "torso": child_name = "neck"
    baseline = math.degrees(math.atan2(probe.child[child_name][1] - probe.pivot[1],
                                       probe.child[child_name][0] - probe.pivot[0]))
    rest = float(source[shared or name].get("restAngle", 0.0))
    return _scaled(_part(source, name, anchor, desired_angle - baseline - rest,
                         shared=shared, z=z), ratio)


def clip_projection(frame: dict[str, tuple[float, float, float]], yaw: float,
                    selected: str | None = None) -> dict[str, Any]:
    """Project one decoded frame using the same yaw/clamp contract as metrics."""
    points = {name: rotate_y(point, yaw) for name, point in frame.items()}
    definitions = {name: (start, end) for name, start, end in BONE_DEFS}
    angles: dict[str, float] = {}; ratios: dict[str, float] = {}
    depths: dict[str, float] = {}
    for bone, (start, end) in definitions.items():
        angles[bone], ratios[bone] = _angle_and_ratio(points[start], points[end])
        depths[bone] = (points[start][2] + points[end][2]) * .5
    chest_yaw = yaw_from_span(points["shoulder_L"], points["shoulder_R"])
    selected = selected or nearest_view(chest_yaw, None)
    mirrored = selected.endswith("M")
    view = selected[:-1] if mirrored else selected
    return {"points": points, "angles": angles, "ratios": ratios, "depths": depths,
            "view": view, "mirrored": mirrored, "selected": selected,
            "chestYawDeg": chest_yaw}


def clip_projection_track(
        frames: list[dict[str, tuple[float, float, float]]], yaw: float
        ) -> list[dict[str, Any]]:
    raw = []
    for frame in frames:
        points = {name: rotate_y(point, yaw) for name, point in frame.items()}
        raw.append(yaw_from_span(points["shoulder_L"], points["shoulder_R"]))
    unwrapped = unwrap_degrees(raw); smoothed = []
    for index in range(len(unwrapped)):
        lo, hi = max(0, index - 1), min(len(unwrapped), index + 2)
        smoothed.append(sum(unwrapped[lo:hi]) / (hi - lo))
    result = []; current = None
    for frame, chest_yaw in zip(frames, smoothed):
        current = nearest_view(chest_yaw, current)
        result.append(clip_projection(frame, yaw, current))
    return result


def compose_clip_pose(set_dir: Path, manifest: dict[str, Any],
                      frame: dict[str, tuple[float, float, float]], yaw: float,
                      selected: str | None = None,
                      weapon: tuple[dict[str, Any], Image.Image,
                                    tuple[float, float, float]] | None = None
                      ) -> Image.Image:
    projected = clip_projection(frame, yaw, selected)
    mirrored = projected["mirrored"]
    view = projected["view"]
    source = _source_map(set_dir, manifest, view)
    points, angles, ratios = projected["points"], projected["angles"], projected["ratios"]
    canvas = Image.new("RGBA", WORK_CELL, BACKGROUND)
    floor = 584.0; ppm = 256.0
    min_y = min(points[name][1] for name in ("ankle_L", "ankle_R", "toe_L", "toe_R"))
    root = (WORK_CELL[0] / 2, floor - (points["pelvis"][1] - min_y) * ppm)
    pieces: list[Placement] = []
    torso = _absolute_part(source, "torso", root, angles["torso"], ratios["torso"])
    pelvis = _part(source, "pelvis_skirt", root, torso.angle)
    pieces.extend((pelvis, torso)); neck = _child(torso, "neck")
    head = _absolute_part(source, "head", neck, angles["head"], ratios["head"])
    pieces.extend((head, _absolute_part(source, "hair_or_headgear", neck,
                                        angles["head"], ratios["head"])))
    for side in ("L", "R"):
        upper_name, fore_name, hand_name = f"upper_arm_{side}", f"forearm_{side}", f"hand_{side}"
        upper = _absolute_part(source, upper_name, _child(torso, f"shoulder_{side}"),
                               angles[upper_name], ratios[upper_name])
        pieces.append(upper); fore = _absolute_part(source, fore_name, _child(upper, f"elbow_{side}"),
                                                     angles[fore_name], ratios[fore_name])
        pieces.append(fore); pieces.append(_absolute_part(source, hand_name, _child(fore, f"wrist_{side}"),
                                                           angles[hand_name], ratios[hand_name]))
        thigh_name, shin_name, foot_name = f"thigh_{side}", f"shin_{side}", f"foot_{side}"
        thigh = _absolute_part(source, thigh_name, _child(pelvis, f"hip_{side}"), angles[thigh_name], ratios[thigh_name],
                               shared="thigh_shared", z=SHARED_LIMB_Z[view]["thigh"][side])
        pieces.append(thigh); shin = _absolute_part(source, shin_name, _child(thigh, "knee"), angles[shin_name], ratios[shin_name],
                                                    shared="shin_shared", z=SHARED_LIMB_Z[view]["shin"][side])
        pieces.append(shin); pieces.append(_absolute_part(source, foot_name, _child(shin, "ankle"), angles[foot_name], ratios[foot_name],
                                                          shared="foot_shared", z=SHARED_LIMB_Z[view]["foot"][side]))
    depths = {name: depth for name, depth in projected["depths"].items()}
    depths.update(pelvis_skirt=depths["hip_span"], hair_or_headgear=depths["head"])
    if mirrored:
        renamed = {}
        for name, depth in depths.items():
            other = name[:-1] + ("R" if name.endswith("L") else "L") if name.endswith(("L", "R")) else name
            renamed[other] = depth
        depths = renamed
    _place_legs_behind_skirt(source, pieces, depths)
    if weapon is not None:
        record, weapon_image, axis = weapon
        hand = pieces[[item.part for item in pieces].index("hand_R")]
        anchor = _child(hand, "grip_R")
        angle, depth = weapon_angle_depth(
            axis, yaw, projected["points"]["grip_R"][2])
        pieces.append(Placement(weapon_image, tuple(record["pivot"]), anchor,
                                angle, float(record["zOrder"]),
                                "weapon_R", {}))
        depths["weapon_R"] = depth
    for item in depth_order(pieces, depths):
        _draw_rotated(canvas, item)
    joint_centres = [root, neck]
    for item in pieces:
        joint_centres.append(item.anchor)
        joint_centres.extend(_child(item, name) for name in item.child)
    result = _seal_joint_pinholes(_downsample(canvas), joint_centres)
    if mirrored:
        result = result.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return result


def projected_fk_joints(set_dir: Path, manifest: dict[str, Any],
                        frame: dict[str, tuple[float, float, float]], yaw: float,
                        selected: str | None = None
                        ) -> dict[str, tuple[float, float]]:
    """Return output-pixel joint centres from the exact sprite FK chain."""
    projected = clip_projection(frame, yaw, selected); view = projected["view"]
    source = _source_map(set_dir, manifest, view)
    points, angles, ratios = projected["points"], projected["angles"], projected["ratios"]
    floor = 584.0; minimum = min(points[n][1] for n in ("ankle_L", "ankle_R", "toe_L", "toe_R"))
    root = (WORK_CELL[0] / 2, floor - (points["pelvis"][1] - minimum) * 256)
    joints = {"pelvis": root}
    torso = _absolute_part(source, "torso", root, angles["torso"], ratios["torso"]); joints["neck"] = _child(torso, "neck")
    pelvis = _part(source, "pelvis_skirt", root, torso.angle)
    for side in ("L", "R"):
        joints[f"shoulder_{side}"] = _child(torso, f"shoulder_{side}")
        upper = _absolute_part(source, f"upper_arm_{side}", joints[f"shoulder_{side}"], angles[f"upper_arm_{side}"], ratios[f"upper_arm_{side}"]); joints[f"elbow_{side}"] = _child(upper, f"elbow_{side}")
        fore = _absolute_part(source, f"forearm_{side}", joints[f"elbow_{side}"], angles[f"forearm_{side}"], ratios[f"forearm_{side}"]); joints[f"wrist_{side}"] = _child(fore, f"wrist_{side}")
        joints[f"hip_{side}"] = _child(pelvis, f"hip_{side}")
        thigh = _absolute_part(source, f"thigh_{side}", joints[f"hip_{side}"], angles[f"thigh_{side}"], ratios[f"thigh_{side}"], shared="thigh_shared"); joints[f"knee_{side}"] = _child(thigh, "knee")
        shin = _absolute_part(source, f"shin_{side}", joints[f"knee_{side}"], angles[f"shin_{side}"], ratios[f"shin_{side}"], shared="shin_shared"); joints[f"ankle_{side}"] = _child(shin, "ankle")
    result = {name: (x * CELL[0] / WORK_CELL[0], y * CELL[1] / WORK_CELL[1]) for name, (x, y) in joints.items()}
    return ({name: (CELL[0] - 1 - x, y) for name, (x, y) in result.items()}
            if projected["mirrored"] else result)


def load_equipment(item_ids: list[str], view: str) -> list[tuple[dict[str, Any], Image.Image]]:
    wanted = set(item_ids)
    found: set[str] = set()
    result: list[tuple[dict[str, Any], Image.Image]] = []
    for layer_path in sorted(ITEM_ROOT.glob("*/layers/layers.yaml")):
        root = yaml.safe_load(layer_path.read_text(encoding="utf-8"))
        for item in root.get("items", []) if isinstance(root, dict) else []:
            if item.get("item") not in wanted:
                continue
            found.add(str(item["item"]))
            for record in item.get("layers", []):
                if record.get("view") != view:
                    continue
                relative = layer_path.parent.relative_to(ITEM_ROOT) / record["file"]
                source = ITEM_ROOT / relative
                if not source.is_file():
                    source = next((parent / "assets/default/item" / relative
                                   for parent in Path(__file__).resolve().parents
                                   if (parent / "assets/default/item" / relative).is_file()), source)
                with Image.open(source) as opened:
                    strip = opened.convert("RGBA")
                x, y, width, height = record["sourceRect"]
                result.append((record, strip.crop((x, y, x + width, y + height))))
    missing = wanted - found
    if missing:
        raise ValueError(f"equipment layer not found: {', '.join(sorted(missing))}")
    return result


def decode_weapon_axes(clip: dict[str, Any]) -> list[tuple[float, float, float]]:
    weapon = clip.get("weapon")
    if not isinstance(weapon, dict) or not weapon.get("tipDirectionI16"):
        return []
    raw = unpack_i16(str(weapon["tipDirectionI16"]))
    if len(raw) != int(clip["frameCount"]) * 3:
        raise ValueError("weapon track length does not match frameCount")
    return [normalize(tuple(raw[index * 3 + axis] / 32767.0 for axis in range(3)))
            for index in range(int(clip["frameCount"]))]


def weapon_angle_depth(axis: tuple[float, float, float], yaw: float,
                       grip_depth: float) -> tuple[float, float]:
    """Project the authored grip-to-tip axis into angle and z midpoint."""
    rotated = rotate_y(axis, yaw)
    return (math.degrees(math.atan2(-rotated[1], rotated[0])) + 90.0,
            grip_depth + rotated[2] * .5)


def make_strip(set_dir: Path, *, motion: str = "walk", weight: str = "medium",
               equipment: list[str] | None = None) -> Image.Image:
    manifest = _load_manifest(set_dir)
    samples = (("idle", 0.0), (motion, 0.0), (motion, 0.25), (motion, 0.5), (motion, 0.75))
    speed = {"idle": 0.0, "walk": 1.4, "run": 4.0}[motion]
    width = len(samples) * CELL[0] + (len(samples) - 1) * GAP
    height = len(VIEWS) * CELL[1] + (len(VIEWS) - 1) * GAP
    strip = Image.new("RGBA", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(strip)
    for row, view in enumerate(VIEWS):
        layers = load_equipment(equipment or [], view)
        for column, (sample_motion, phase) in enumerate(samples):
            sample_speed = 0.0 if sample_motion == "idle" else speed
            values = pose(phase, sample_speed, weight)
            frame = compose_pose(set_dir, manifest, view, values, layers)
            x, y = column * (CELL[0] + GAP), row * (CELL[1] + GAP)
            strip.alpha_composite(frame, (x, y))
            draw.line((x, y + 239, x + CELL[0], y + 239), fill=(130, 120, 108, 80))
    return strip


def render_clip_frames(set_dir: Path, clip_path: Path, *, dir8: bool = False) -> tuple[list[Image.Image], dict[str, Any]]:
    clip = json.loads(clip_path.read_text(encoding="utf-8"))
    decoded = decode_clip(clip); manifest = _load_manifest(set_dir)
    weapon_axes = decode_weapon_axes(clip)
    weapon_layers = ({view: load_equipment([DEFAULT_SWORD_ID], view)[0]
                      for view in VIEWS}
                     if weapon_axes and "sword" in str(clip.get("id", "")) else {})
    yaws = list(DIR8 if dir8 else (("S", 0),))
    tracks = {yaw: clip_projection_track(decoded, yaw) for _, yaw in yaws}
    rendered: list[Image.Image] = []
    for index, frame in enumerate(decoded):
        row = Image.new("RGBA", (CELL[0] * len(yaws), CELL[1]), BACKGROUND)
        for column, (_, yaw) in enumerate(yaws):
            selected = tracks[yaw][index]["selected"]
            projected = tracks[yaw][index]
            layer = weapon_layers.get(projected["view"])
            weapon = ((*layer, weapon_axes[index]) if layer else None)
            row.alpha_composite(compose_clip_pose(set_dir, manifest, frame, yaw, selected, weapon),
                                (column * CELL[0], 0))
        rendered.append(row)
    return rendered, clip


def clip_strip(set_dir: Path, clip_path: Path, *, dir8: bool = True) -> Image.Image:
    frames, _ = render_clip_frames(set_dir, clip_path, dir8=dir8)
    if dir8:
        return frames[next((index for index in range(len(frames)) if index >= len(frames)//2), 0)]
    chosen = [round(index * (len(frames)-1) / 7) for index in range(8)]
    result = Image.new("RGBA", (CELL[0] * len(chosen), CELL[1]), BACKGROUND)
    for column, index in enumerate(chosen):
        result.alpha_composite(frames[index], (column * CELL[0], 0))
    return result


def save_gif(frames: list[Image.Image], output: Path, fps: int) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(output, save_all=True, append_images=frames[1:], loop=0,
                   duration=max(20, round(1000 / fps)), disposal=2, optimize=False)


def gait_vs_clip(set_dir: Path, clip_path: Path) -> tuple[list[Image.Image], int]:
    clip_frames, clip = render_clip_frames(set_dir, clip_path, dir8=False)
    manifest = _load_manifest(set_dir); output = []
    count = len(clip_frames)
    for index, clip_frame in enumerate(clip_frames):
        phase = index / max(count - 1, 1)
        gait_frame = compose_pose(set_dir, manifest, "front34", pose(phase, 1.4, "medium"))
        combined = Image.new("RGBA", (CELL[0] * 2, CELL[1]), BACKGROUND)
        combined.alpha_composite(gait_frame, (0, 0)); combined.alpha_composite(clip_frame, (CELL[0], 0))
        draw = ImageDraw.Draw(combined); draw.text((8, 8), "procedural gait", fill=(30, 25, 20, 255))
        draw.text((CELL[0]+8, 8), "CC0 clip_walk", fill=(30, 25, 20, 255))
        output.append(combined)
    return output, int(clip["fps"])


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="生成三视图待机加四相位 rig 审阅条带。")
    parser.add_argument("set_dir", nargs="?", type=Path)
    parser.add_argument("--set", dest="set_option", type=Path, help="set_dir 的兼容别名")
    parser.add_argument("--motion", choices=("idle", "walk", "run"), default="walk")
    parser.add_argument("--weight", choices=("light", "medium", "heavy"), default="medium")
    parser.add_argument("--equipment", default="", help="逗号分隔装备 ID；从 item/*/layers 加载")
    parser.add_argument("--clip", type=Path, help="tianshu-clip.v1 JSON")
    parser.add_argument("--dir8", action="store_true", help="同时渲染八方向")
    parser.add_argument("--gif", action="store_true", help="输出动画 GIF（需 --clip）")
    parser.add_argument("--compare-gait", action="store_true", help="程序步态与 clip 左右 A/B")
    parser.add_argument("--out", type=Path, required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if (args.gif or args.compare_gait) and not args.clip:
        parser.error("--gif/--compare-gait requires --clip")
    if args.compare_gait and not args.gif:
        parser.error("--compare-gait requires --gif")
    set_dir = args.set_option or args.set_dir
    if set_dir is None:
        print("preview: set_dir is required", file=sys.stderr)
        return 2
    try:
        if args.clip and args.compare_gait:
            frames, fps = gait_vs_clip(set_dir.resolve(), args.clip.resolve())
            save_gif(frames, args.out, fps); strip = frames[0]
        elif args.clip and args.gif:
            frames, clip = render_clip_frames(set_dir.resolve(), args.clip.resolve(), dir8=args.dir8)
            save_gif(frames, args.out, int(clip["fps"])); strip = frames[0]
        elif args.clip:
            strip = clip_strip(set_dir.resolve(), args.clip.resolve(), dir8=args.dir8)
            args.out.parent.mkdir(parents=True, exist_ok=True)
            strip.save(args.out, "PNG", optimize=False, compress_level=9)
        else:
            strip = make_strip(set_dir.resolve(), motion=args.motion, weight=args.weight,
                               equipment=[item for item in args.equipment.split(",") if item])
            args.out.parent.mkdir(parents=True, exist_ok=True)
            strip.save(args.out, "PNG", optimize=False, compress_level=9)
    except (OSError, ValueError, KeyError, yaml.YAMLError) as exc:
        print(f"preview: {exc}", file=sys.stderr)
        return 1
    print(f"preview: wrote {args.out} ({strip.width}x{strip.height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
