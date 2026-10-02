#!/usr/bin/env python3
"""Compute eight-yaw projection QA and render a deterministic stick strip."""
from __future__ import annotations

import argparse
import base64
import json
import math
import struct
from pathlib import Path
from typing import Any, Iterable, Sequence

from PIL import Image, ImageDraw

try:
    from .clip_import import BONE_DEFS, canonical_json, round_half_away
except ImportError:  # Direct script execution.
    from clip_import import BONE_DEFS, canonical_json, round_half_away

DIR8 = (("S", 0), ("SW", 45), ("W", 90), ("NW", 135),
        ("N", 180), ("NE", 225), ("E", 270), ("SE", 315))
SPRITE_YAWS = (("front34", 45), ("side", 90), ("back34", 135),
               ("front34M", -45), ("sideM", -90), ("back34M", -135))
ARM_BONES = ("upper_arm_L", "forearm_L", "hand_L",
             "upper_arm_R", "forearm_R", "hand_R")
LIMB_BONES = ARM_BONES + ("thigh_L", "shin_L", "foot_L",
                          "thigh_R", "shin_R", "foot_R")
CONNECT = (
    ("pelvis", "neck"), ("neck", "head"),
    ("shoulder_L", "shoulder_R"), ("hip_L", "hip_R"),
    ("shoulder_L", "elbow_L"), ("elbow_L", "wrist_L"),
    ("shoulder_R", "elbow_R"), ("elbow_R", "wrist_R"),
    ("hip_L", "knee_L"), ("knee_L", "ankle_L"),
    ("ankle_L", "toe_L"), ("hip_R", "knee_R"),
    ("knee_R", "ankle_R"), ("ankle_R", "toe_R"),
)


def unpack_i16(value: str) -> tuple[int, ...]:
    raw = base64.b64decode(value, validate=True)
    if len(raw) % 2:
        raise ValueError("int16 track has odd byte length")
    return struct.unpack("<" + "h" * (len(raw) // 2), raw)


def unpack_u16(value: str) -> tuple[int, ...]:
    raw = base64.b64decode(value, validate=True)
    if len(raw) % 2:
        raise ValueError("uint16 track has odd byte length")
    return struct.unpack("<" + "H" * (len(raw) // 2), raw)


def rotate_y(point: Sequence[float], degrees: float) -> tuple[float, float, float]:
    angle = math.radians(degrees); cosine, sine = math.cos(angle), math.sin(angle)
    return (cosine * point[0] + sine * point[2], point[1],
            -sine * point[0] + cosine * point[2])


def sub(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float]:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def add(a: Sequence[float], b: Sequence[float]) -> tuple[float, float, float]:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def scale(a: Sequence[float], amount: float) -> tuple[float, float, float]:
    return (a[0] * amount, a[1] * amount, a[2] * amount)


def length(a: Sequence[float]) -> float:
    return math.sqrt(sum(value * value for value in a))


def normalize(a: Sequence[float]) -> tuple[float, float, float]:
    size = length(a)
    return (0.0, 0.0, 0.0) if size < 1e-12 else scale(a, 1.0 / size)


def yaw_from_span(left: Sequence[float], right: Sequence[float]) -> float:
    side = sub(right, left); side = normalize((side[0], 0.0, side[2]))
    forward = (side[2], 0.0, -side[0])
    return math.degrees(math.atan2(-forward[0], forward[2]))


def angular_distance(a: float, b: float) -> float:
    return abs((a - b + 180.0) % 360.0 - 180.0)


def nearest_view(yaw: float, current: str | None, hysteresis: float = 10.0) -> str:
    best = min(SPRITE_YAWS, key=lambda item: (angular_distance(yaw, item[1]), item[0]))[0]
    if current is None:
        return best
    old_yaw = dict(SPRITE_YAWS)[current]
    new_yaw = dict(SPRITE_YAWS)[best]
    return best if angular_distance(yaw, new_yaw) + hysteresis < angular_distance(yaw, old_yaw) else current


def unwrap_degrees(values: Sequence[float]) -> list[float]:
    if not values:
        return []
    result = [values[0]]
    for value in values[1:]:
        previous = result[-1]
        delta = (value - previous + 180.0) % 360.0 - 180.0
        result.append(previous + delta)
    return result


def percentile(values: Sequence[float], portion: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values); position = (len(ordered) - 1) * portion
    lo = math.floor(position); hi = math.ceil(position)
    return ordered[lo] if lo == hi else ordered[lo] + (ordered[hi] - ordered[lo]) * (position - lo)


def decode_clip(clip: dict[str, Any]) -> list[dict[str, tuple[float, float, float]]]:
    tracks = clip["tracks"]; bones = tracks["bones"]; count = clip["frameCount"]
    directions = unpack_i16(tracks["directionI16"])
    ratios = unpack_u16(tracks["lengthRatioU16"])
    roots = unpack_i16(tracks["rootMmI16"])
    if len(directions) != count * len(bones) * 3 or len(ratios) != count * len(bones):
        raise ValueError("bone track length does not match frameCount and bones")
    if len(roots) != count * 3:
        raise ValueError("root track length does not match frameCount")
    rest = {name: tuple(value / 1000.0 for value in point)
            for name, point in zip(clip["restPose"]["jointOrder"], clip["restPose"]["jointMm"])}
    definitions = {name: (start, end) for name, start, end in BONE_DEFS}
    rest_lengths = {name: length(sub(rest[end], rest[start]))
                    for name, (start, end) in definitions.items()}
    frames = []
    for frame in range(count):
        points: dict[str, tuple[float, float, float]] = {}
        root = tuple(roots[frame * 3 + axis] / 1000.0 for axis in range(3))
        points["pelvis"] = add(rest["pelvis"], root)
        directions_at: dict[str, tuple[float, float, float]] = {}
        lengths_at: dict[str, float] = {}
        for index, name in enumerate(bones):
            base = (frame * len(bones) + index) * 3
            directions_at[name] = normalize(tuple(directions[base + axis] / 32767.0 for axis in range(3)))
            lengths_at[name] = rest_lengths[name] * ratios[frame * len(bones) + index] / 32767.0
        for name in ("torso", "head"):
            start, end = definitions[name]
            points[end] = add(points[start], scale(directions_at[name], lengths_at[name]))
        for span, centre in (("shoulder_span", "neck"), ("hip_span", "pelvis")):
            vector = scale(directions_at[span], lengths_at[span] * 0.5)
            points[definitions[span][0]], points[definitions[span][1]] = sub(points[centre], vector), add(points[centre], vector)
        for name in bones:
            if name in ("torso", "head", "shoulder_span", "hip_span"):
                continue
            start, end = definitions[name]
            points[end] = add(points[start], scale(directions_at[name], lengths_at[name]))
        frames.append(points)
    return frames


def support_intervals(frames: Sequence[dict[str, Sequence[float]]], side: str, threshold_m: float = 0.005) -> list[list[int]]:
    heights = [frame[f"ankle_{side}"][1] for frame in frames]
    floor = min(heights)
    indices = [index for index, value in enumerate(heights) if value <= floor + threshold_m]
    groups: list[list[int]] = []
    for index in indices:
        if not groups or index > groups[-1][-1] + 1:
            groups.append([index])
        else:
            groups[-1].append(index)
    return [group for group in groups if len(group) >= 3]


def foot_slide(frames: Sequence[dict[str, Sequence[float]]], fps: int, native_speed: float) -> dict[str, Any]:
    phases = []
    for side in ("L", "R"):
        for group in support_intervals(frames, side):
            origin = frames[group[0]][f"ankle_{side}"]
            drift = 0.0
            for index in group:
                point = frames[index][f"ankle_{side}"]
                dx = point[0] - origin[0]
                dz = point[2] - origin[2] + native_speed * (index - group[0]) / fps
                drift = max(drift, math.hypot(dx, dz))
            phases.append({"foot": side, "firstFrame": group[0], "lastFrame": group[-1],
                           "driftCm": round(drift * 100.0, 3)})
    return {"thresholdCm": 0.5, "supportPhases": phases,
            "maxDriftCm": max((item["driftCm"] for item in phases), default=0.0)}


def analyze_direction(frames: Sequence[dict[str, Sequence[float]]], yaw: float, fps: int,
                      weapon_axes: Sequence[Sequence[float]], *, weapon_relevant: bool,
                      weapon_hand: str) -> dict[str, Any]:
    current = None; raw_min = 1.0; clamped_min = 1.0
    crossings = 0; crossing_total = 0; deviations = []; grip_errors = []; weapon_raw = []
    initial_sign: dict[str, int] = {}
    chest_yaws = []
    for index, frame in enumerate(frames):
        points = {name: rotate_y(point, yaw) for name, point in frame.items()}
        chest_yaw = yaw_from_span(points["shoulder_L"], points["shoulder_R"])
        chest_yaws.append(chest_yaw)
        for bone, start, end in BONE_DEFS:
            if bone not in LIMB_BONES:
                continue
            vector = sub(points[end], points[start]); size = max(length(vector), 1e-12)
            ratio = math.hypot(vector[0], vector[1]) / size
            raw_min = min(raw_min, ratio); clamped_min = min(clamped_min, max(0.45, ratio))
        centre_z = (points["pelvis"][2] + points["neck"][2]) * 0.5
        for side in ("L", "R"):
            for joint in ("elbow", "wrist"):
                key = f"{joint}_{side}"
                sign = 1 if points[key][2] >= centre_z else -1
                initial_sign.setdefault(key, sign)
                crossings += sign != initial_sign[key]; crossing_total += 1
        axis = rotate_y(weapon_axes[index], yaw)
        projected = math.hypot(axis[0], axis[1])
        weapon_raw.append(projected)
        if projected <= 1e-12:
            deviations.append(90.0)
        else:
            ux, uy = axis[0] / projected, axis[1] / projected
            rendered_px = max(0.45, projected) * 128.0
            rx, ry = round_half_away(ux * rendered_px), round_half_away(uy * rendered_px)
            rendered_size = max(math.hypot(rx, ry), 1e-12)
            cosine = max(-1.0, min(1.0, (ux * rx + uy * ry) / rendered_size))
            deviations.append(math.degrees(math.acos(cosine)))
        grip = points[f"grip_{weapon_hand}"]; pelvis = points["pelvis"]
        gx, gy = (grip[0] - pelvis[0]) * 128.0, (grip[1] - pelvis[1]) * 128.0
        grip_errors.append(math.hypot(round_half_away(gx) - gx, round_half_away(gy) - gy))
    # A 30 fps mocap can jitter across a view boundary.  Select from the
    # chest-yaw track after a deterministic 3-sample moving average; the 10°
    # hysteresis remains the actual switch guard.
    smooth_yaws = []
    unwrapped = unwrap_degrees(chest_yaws)
    for index in range(len(unwrapped)):
        lo, hi = max(0, index - 1), min(len(unwrapped), index + 2)
        smooth_yaws.append(sum(unwrapped[lo:hi]) / (hi - lo))
    switches = 0
    for chest_yaw in smooth_yaws:
        selected = nearest_view(chest_yaw, current)
        if current is not None and selected != current:
            switches += 1
        current = selected
    duration = max((len(frames) - 1) / fps, 1.0 / fps)
    weapon_metric = ({"max": round(max(deviations), 3),
                      "p95": round(percentile(deviations, 0.95), 3),
                      "rawMinProjection": round(min(weapon_raw), 4),
                      "gripPointErrorPxMax": round(max(grip_errors), 3)} if weapon_relevant else None)
    return {"torsoViewSwitches": switches, "torsoViewSwitchesPerSec": round(switches / duration, 3),
            "rawMinLimbProjection": round(raw_min, 4), "renderMinLimbScale": round(clamped_min, 4),
            "armTorsoPlaneCrossFramePct": round(100.0 * crossings / max(crossing_total, 1), 3),
            "weaponAxisDeviationDeg": weapon_metric}


def analyze_clip(clip: dict[str, Any]) -> tuple[dict[str, Any], list[dict[str, tuple[float, float, float]]]]:
    frames = decode_clip(clip)
    raw_axes = unpack_i16(clip["weapon"]["tipDirectionI16"])
    if len(raw_axes) != len(frames) * 3:
        raise ValueError("weapon track length does not match frameCount")
    weapon_axes = [normalize(tuple(raw_axes[index * 3 + axis] / 32767.0 for axis in range(3)))
                   for index in range(len(frames))]
    weapon_relevant = "sword" in clip["id"] or "sword" in clip["source"]["animation"].lower()
    directions = {name: analyze_direction(frames, yaw, clip["fps"], weapon_axes,
                                          weapon_relevant=weapon_relevant,
                                          weapon_hand=clip["weapon"]["hand"])
                  for name, yaw in DIR8}
    return ({
        "schema": "tianshu-clip-metrics.v1", "clipId": clip["id"],
        "sourceSha256": clip["source"]["sha256"],
        "fps": clip["fps"], "frameCount": clip["frameCount"],
        "thresholds": {"minForeshorten": 0.45, "maxViewSwitchesPerSec": 8.0,
                       "maxFootSlideCm": 2.0, "maxWeaponAxisDeviationDeg": 5.0},
        "directions": directions,
        "walkFootSlide": (foot_slide(frames, clip["fps"], clip["nativeSpeedMmps"] / 1000.0)
                          if clip["nativeSpeedMmps"] > 0 else None),
    }, frames)


def choose_frames(count: int, total: int = 8) -> list[int]:
    if count <= 1:
        return [0] * total
    return [round_half_away(index * (count - 1) / (total - 1)) for index in range(total)]


def render_strip(frames: Sequence[dict[str, Sequence[float]]], output: str | Path,
                 frame_index: int | None = None) -> None:
    width, height, margin, floor_y, pixels_per_m = 8 * 180, 300, 18, 264, 125.0
    image = Image.new("RGB", (width, height), (236, 230, 218))
    draw = ImageDraw.Draw(image)
    chosen = [len(frames) // 2] * 8 if frame_index is None else [frame_index] * 8
    for column, ((name, yaw), index) in enumerate(zip(DIR8, chosen)):
        if not 0 <= index < len(frames):
            raise ValueError("strip frame index out of range")
        x0 = column * 180; draw.rectangle((x0, 0, x0 + 179, height - 1), outline=(170, 160, 145))
        draw.text((x0 + 8, 7), f"{name}  {yaw}°  f{index}", fill=(42, 38, 34))
        points = {joint: rotate_y(point, yaw) for joint, point in frames[index].items()}
        minimum_y = min(points["ankle_L"][1], points["ankle_R"][1],
                        points["toe_L"][1], points["toe_R"][1])
        def xy(point: Sequence[float]) -> tuple[int, int]:
            return (round_half_away(x0 + 90 + point[0] * pixels_per_m),
                    round_half_away(floor_y - (point[1] - minimum_y) * pixels_per_m))
        draw.line((x0 + 8, floor_y, x0 + 172, floor_y), fill=(176, 70, 45), width=1)
        for start, end in CONNECT:
            draw.line((*xy(points[start]), *xy(points[end])), fill=(30, 35, 42), width=4)
        for joint in points:
            radius = 3 if joint not in ("pelvis", "neck") else 4
            x, y = xy(points[joint]); draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=(142, 47, 38))
    output = Path(output); output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=False, compress_level=9)


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("clip", type=Path)
    result.add_argument("--json", dest="json_output", type=Path, required=True)
    result.add_argument("--png", dest="png_output", type=Path, required=True)
    result.add_argument("--frame", type=int, help="same frame in all views (default: eight time samples)")
    return result


def main(argv: Iterable[str] | None = None) -> int:
    args = parser().parse_args(argv)
    clip = json.loads(args.clip.read_text(encoding="utf-8"))
    metrics, frames = analyze_clip(clip)
    args.json_output.parent.mkdir(parents=True, exist_ok=True)
    args.json_output.write_text(canonical_json(metrics), encoding="utf-8")
    representative = args.frame
    if representative is None:
        representative = next((event["frame"] for event in clip["events"]
                               if event["type"] == "hit"), len(frames) // 2)
    render_strip(frames, args.png_output, representative)
    print(f"wrote {args.json_output} and {args.png_output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
