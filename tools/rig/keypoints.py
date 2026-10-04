#!/usr/bin/env python3
"""Detect rig joints with Apple Vision and deterministic silhouette priors.

Vision is advisory: garment-hidden hips/knees are always regularised against
the selected humanoid body profile.  When the requested SDK/helper is unavailable
the same YAML contract is produced with explicit ``source: manual-prior``.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Mapping, Sequence

import numpy as np
import yaml
from PIL import Image
from scipy import ndimage

VISION_ALIASES = {
    "neck": ("neck", "neck_1_joint"), "root": ("root", "root_joint"),
    "shoulder_L": ("left_shoulder", "leftShoulder", "left_shoulder_joint"),
    "shoulder_R": ("right_shoulder", "rightShoulder", "right_shoulder_joint"),
    "elbow_L": ("left_elbow", "leftElbow", "left_elbow_joint"),
    "elbow_R": ("right_elbow", "rightElbow", "right_elbow_joint"),
    "wrist_L": ("left_wrist", "leftWrist", "left_wrist_joint"),
    "wrist_R": ("right_wrist", "rightWrist", "right_wrist_joint"),
    "hip_L": ("left_hip", "leftHip", "left_hip_joint"),
    "hip_R": ("right_hip", "rightHip", "right_hip_joint"),
    "knee_L": ("left_knee", "leftKnee", "left_knee_joint"),
    "knee_R": ("right_knee", "rightKnee", "right_knee_joint"),
    "ankle_L": ("left_ankle", "leftAnkle", "left_ankle_joint"),
    "ankle_R": ("right_ankle", "rightAnkle", "right_ankle_joint"),
}
VISION_COMPILE_TIMEOUT_S = 60
VISION_RUN_TIMEOUT_S = 15
BODY_PROFILES = {
    "male": {"height": 1.70, "sole_to_ankle": .10, "shin": .40,
             "thigh": .44, "torso": .52, "head": .24},
    "female": {"height": 1.62, "sole_to_ankle": .09, "shin": .38,
               "thigh": .42, "torso": .50, "head": .23},
}


def _bounds(alpha: np.ndarray) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(alpha >= 24)
    if not len(xs):
        raise ValueError("input has no visible figure")
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def _row_span(alpha: np.ndarray, y: float, radius: int = 3) -> tuple[float, float, float]:
    yi = max(0, min(alpha.shape[0] - 1, round(y)))
    band = alpha[max(0, yi - radius):min(alpha.shape[0], yi + radius + 1)] >= 24
    xs = np.flatnonzero(band.any(axis=0))
    if not len(xs):
        return alpha.shape[1] * .35, alpha.shape[1] * .65, alpha.shape[1] * .5
    weights = band.sum(axis=0)
    centre = float(np.average(np.arange(alpha.shape[1]), weights=weights))
    return float(xs[0]), float(xs[-1]), centre


def _snap_inside(alpha: np.ndarray, point: Sequence[float],
                 max_distance: float) -> tuple[float, float]:
    """Move a visible-joint prior to the nearest non-edge silhouette pixel."""
    mask = alpha >= 24
    interior = ndimage.distance_transform_edt(mask) >= 3.0
    ys, xs = np.nonzero(interior)
    if not len(xs):
        ys, xs = np.nonzero(mask)
    distances = (xs - point[0]) ** 2 + (ys - point[1]) ** 2
    allowed = distances <= max_distance ** 2
    if not allowed.any():
        return float(point[0]), float(point[1])
    choices = np.flatnonzero(allowed)
    index = choices[int(np.argmin(distances[choices]))]
    return float(xs[index]), float(ys[index])


def geometric_keypoints(image: Image.Image, view: str, facing: str = "L", *,
                        body_profile: str = "male",
                        garment_profile: str = "short") -> dict[str, dict[str, Any]]:
    if body_profile not in BODY_PROFILES:
        raise ValueError(f"unknown body profile: {body_profile}")
    if garment_profile not in {"short", "ankle-robe"}:
        raise ValueError(f"unknown garment profile: {garment_profile}")
    alpha = np.asarray(image.convert("RGBA").getchannel("A"))
    x0, y0, x1, y1 = _bounds(alpha); height = y1 - y0
    y = lambda fraction: y0 + height * fraction
    profile = BODY_PROFILES[body_profile]
    ppm = height / profile["height"]
    ankle_y = y1 - profile["sole_to_ankle"] * ppm
    knee_y = ankle_y - profile["shin"] * ppm
    hip_y = knee_y - profile["thigh"] * ppm
    neck_y = hip_y - profile["torso"] * ppm
    crown_y = max(float(y0), neck_y - profile["head"] * ppm)
    hem_y = (min(ankle_y - .02 * ppm, y(.93))
             if garment_profile == "ankle-robe" else y(.68))
    crown_centre = _row_span(alpha, crown_y, 5)[2]
    neck = _row_span(alpha, neck_y, 3)[2]
    pelvis = _row_span(alpha, hip_y, 5)[2]
    shoulder_span = _row_span(alpha, y(.235), 5)
    elbow_span = _row_span(alpha, y(.405), 5)
    wrist_span = _row_span(alpha, y(.535), 5)
    hip_span = _row_span(alpha, hip_y, 5)
    knee_span = _row_span(alpha, knee_y, 5)
    ankle_span = _row_span(alpha, ankle_y, 4)

    def pair(span: tuple[float, float, float], spread: float, anatomical_left_on_right: bool):
        left, right, centre = span
        screen_left = centre - (centre - left) * spread
        screen_right = centre + (right - centre) * spread
        if view == "side":
            screen_left, screen_right = centre - 2.0, centre + 2.0
        if anatomical_left_on_right:
            return (screen_right, screen_left)
        return (screen_left, screen_right)

    left_on_right = (view == "front34") == (facing == "L")
    shoulder_l, shoulder_r = pair(shoulder_span, .80, left_on_right)
    elbow_l, elbow_r = pair(elbow_span, .88, left_on_right)
    wrist_l, wrist_r = pair(wrist_span, .92, left_on_right)
    hip_l, hip_r = pair(hip_span, .24, left_on_right)
    knee_l, knee_r = pair(knee_span, .45, left_on_right)
    ankle_l, ankle_r = pair(ankle_span, .55, left_on_right)
    toe_direction = -1 if facing == "L" else 1
    ankle_l, ankle_r = (_snap_inside(alpha, point, height * .045)
                        for point in ((ankle_l, ankle_y), (ankle_r, ankle_y)))
    wrist_l, wrist_r = (_snap_inside(alpha, point, height * .035)
                        for point in ((wrist_l, y(.535)), (wrist_r, y(.535))))
    grip_l = _snap_inside(alpha, (wrist_l[0], y(.58)), height * .04)
    grip_r = _snap_inside(alpha, (wrist_r[0], y(.58)), height * .04)
    toe_l = _snap_inside(alpha, (ankle_l[0] + toe_direction * height * .055,
                                 y(.965)), height * .06)
    toe_r = _snap_inside(alpha, (ankle_r[0] + toe_direction * height * .055,
                                 y(.965)), height * .06)
    values = {
        "crown": (crown_centre, crown_y), "neck": (neck, neck_y),
        "pelvis": (pelvis, hip_y), "hem": (pelvis, hem_y),
        "shoulder_L": (shoulder_l, y(.235)), "shoulder_R": (shoulder_r, y(.235)),
        "elbow_L": (elbow_l, y(.405)), "elbow_R": (elbow_r, y(.405)),
        "wrist_L": wrist_l, "wrist_R": wrist_r,
        "grip_L": grip_l, "grip_R": grip_r,
        "hip_L": (hip_l, hip_y), "hip_R": (hip_r, hip_y),
        "knee_L": (knee_l, knee_y), "knee_R": (knee_r, knee_y),
        "ankle_L": ankle_l, "ankle_R": ankle_r,
        "toe_L": toe_l, "toe_R": toe_r,
    }
    return {name: {"xy": [round(point[0]), round(point[1])],
                   "confidence": 0.42 if name.startswith(("hip_", "knee_")) else 0.55,
                   "source": "bone-prior" if name.startswith(("hip_", "knee_")) else "silhouette-prior"}
            for name, point in values.items()}


def compile_vision(helper: Path, output: Path, sdk: Path | None = None) -> tuple[bool, str]:
    swiftc = shutil.which("swiftc")
    if not swiftc:
        return False, "swiftc not found"
    requested = sdk or Path("/Library/Developer/CommandLineTools/SDKs/MacOSX15.5.sdk")
    command = [swiftc, "-sdk", str(requested), str(helper), "-o", str(output)]
    cache = output.parent / "module-cache"
    cache.mkdir(parents=True, exist_ok=True)
    environment = dict(os.environ, CLANG_MODULE_CACHE_PATH=str(cache / "clang"),
                       SWIFT_MODULECACHE_PATH=str(cache / "swift"))
    try:
        completed = subprocess.run(command, text=True, capture_output=True, check=False,
                                   env=environment, timeout=VISION_COMPILE_TIMEOUT_S)
    except subprocess.TimeoutExpired:
        return False, f"compile timed out after {VISION_COMPILE_TIMEOUT_S}s"
    message = (completed.stderr or completed.stdout).strip().splitlines()
    return completed.returncode == 0, (message[-1] if message else "ok")


def run_vision(image: Path, helper: Path, sdk: Path | None = None) -> tuple[dict[str, Any] | None, str]:
    # swiftc can release module-cache files just after process exit on macOS;
    # a cleanup race must not discard the detector result or its fallback note.
    with tempfile.TemporaryDirectory(prefix="tianshu-vision-",
                                     ignore_cleanup_errors=True) as temporary:
        executable = Path(temporary) / "vision_pose"
        ok, note = compile_vision(helper, executable, sdk)
        if not ok:
            return None, f"compile failed: {note}"
        command = [str(executable), str(image)]
        timed_out = False
        try:
            completed = subprocess.run(command, text=True, capture_output=True,
                                       check=False, timeout=VISION_RUN_TIMEOUT_S)
        except subprocess.TimeoutExpired:
            completed = None; timed_out = True
        if completed is None or completed.returncode:
            try:
                retry = subprocess.run(command + ["--2d-only"], text=True,
                                       capture_output=True, check=False,
                                       timeout=VISION_RUN_TIMEOUT_S)
            except subprocess.TimeoutExpired:
                return None, f"Vision helper timed out after {VISION_RUN_TIMEOUT_S}s (2D fallback also timed out)"
            if retry.returncode:
                detail = (retry.stderr or retry.stdout or
                          (completed.stderr if completed is not None else "")).strip()
                try:
                    payload = json.loads(retry.stdout)
                    detail = str(payload.get("err2d", detail))
                except (json.JSONDecodeError, AttributeError):
                    pass
                return None, f"Vision helper failed: {detail}"
            completed = retry
            reason = "timeout" if timed_out else "failure"
            note = f"ok (2D fallback after 3D helper {reason})"
        try:
            decoded = json.loads(completed.stdout)
            if not isinstance(decoded.get("pose2d"), dict) or not decoded["pose2d"]:
                detail = decoded.get("err2d", "no body pose detected")
                return None, f"Vision unavailable: {detail}"
            return decoded, note
        except json.JSONDecodeError as exc:
            return None, f"Vision helper returned invalid JSON: {exc}"


def _vision_point(raw: Mapping[str, Any], name: str) -> list[float] | None:
    for alias in VISION_ALIASES.get(name, (name,)):
        value = raw.get(alias)
        if isinstance(value, list) and len(value) >= 3:
            return [float(value[0]), float(value[1]), float(value[2])]
    return None


def merge_vision(priors: dict[str, dict[str, Any]], observation: Mapping[str, Any] | None,
                 *, facing: str) -> dict[str, dict[str, Any]]:
    if not observation or not isinstance(observation.get("pose2d"), dict):
        return priors
    raw = observation["pose2d"]
    result = {name: dict(record) for name, record in priors.items()}
    has_anatomical_aliases = any(_vision_point(raw, name) is not None
                                 for name in ("shoulder_L", "shoulder_R"))
    if not has_anatomical_aliases:
        return result
    for name in result:
        point = _vision_point(raw, name)
        if point is None or point[2] < .25:
            continue
        # Hips and knees behind a tunic remain governed by the bone prior.
        blend = .20 if name.startswith(("hip_", "knee_")) else .82
        prior = result[name]["xy"]
        result[name]["xy"] = [round(prior[0] * (1 - blend) + point[0] * blend),
                                  round(prior[1] * (1 - blend) + point[1] * blend)]
        result[name]["confidence"] = round(point[2] * blend + result[name]["confidence"] * (1 - blend), 4)
        result[name]["source"] = "vision+bone-prior" if blend < .5 else "vision2d"
    return result


def write_keypoints(image_path: Path, output: Path, *, view: str, facing: str = "L",
                    helper: Path | None = None, sdk: Path | None = None,
                    no_vision: bool = False, body_profile: str = "male",
                    garment_profile: str = "short") -> dict[str, Any]:
    with Image.open(image_path) as opened:
        image = opened.convert("RGBA")
    priors = geometric_keypoints(image, view, facing, body_profile=body_profile,
                                 garment_profile=garment_profile)
    observation = None; note = "disabled"
    if not no_vision:
        helper = helper or Path(__file__).with_name("vision_pose.swift")
        observation, note = run_vision(image_path, helper, sdk)
    points = merge_vision(priors, observation, facing=facing)
    payload: dict[str, Any] = {
        "schema": "tianshu-rig-keypoints.v1", "coordinates": "source",
        "view": view, "facing": facing, "imageSize": list(image.size),
        "bodyProfile": body_profile, "garmentProfile": garment_profile,
        "detector": "apple-vision" if observation else "manual-prior",
        "detectorNote": note, "keypoints": points,
    }
    if observation and isinstance(observation.get("pose3d"), dict):
        payload["pose3d"] = observation["pose3d"]
        if "bodyHeight" in observation:
            payload["visionBodyHeightM"] = observation["bodyHeight"]
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(yaml.safe_dump(payload, allow_unicode=True, sort_keys=False), encoding="utf-8")
    return payload


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description=__doc__)
    result.add_argument("image", type=Path)
    result.add_argument("--out", type=Path, required=True)
    result.add_argument("--view", choices=("front34", "side", "back34"), required=True)
    result.add_argument("--facing", choices=("L", "R"), default="L")
    result.add_argument("--body-profile", choices=tuple(BODY_PROFILES), default="male")
    result.add_argument("--garment-profile", choices=("short", "ankle-robe"),
                        default="short")
    result.add_argument("--helper", type=Path)
    result.add_argument("--sdk", type=Path, help="Swift SDK (contract default: MacOSX15.5.sdk)")
    result.add_argument("--no-vision", action="store_true")
    return result


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        payload = write_keypoints(args.image.resolve(), args.out.resolve(), view=args.view,
                                  facing=args.facing, helper=args.helper, sdk=args.sdk,
                                  no_vision=args.no_vision, body_profile=args.body_profile,
                                  garment_profile=args.garment_profile)
    except (OSError, ValueError, yaml.YAMLError) as exc:
        print(f"keypoints: {exc}", file=sys.stderr)
        return 1
    print(f"keypoints: wrote {len(payload['keypoints'])} points ({payload['detector']})")
    if payload["detector"] != "apple-vision":
        print(f"keypoints: {payload['detectorNote']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
