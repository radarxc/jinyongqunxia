#!/usr/bin/env python3
"""Reference implementation of the deterministic tianshu_rig v1 gait."""
from __future__ import annotations

import math
from collections.abc import Mapping
from typing import Any

TAU = 2.0 * math.pi
WEIGHTS = {
    "light": {"kA": 1.08, "kT": 0.94, "kL": 1.06, "inertia": 1.10},
    "medium": {"kA": 1.00, "kT": 1.00, "kL": 1.00, "inertia": 1.00},
    "heavy": {"kA": 0.78, "kT": 1.16, "kL": 0.86, "inertia": 0.72},
}
MODES = {
    "walk": {
        "stepLength": 0.70, "Ahip": 24.0, "Aknee": 34.0, "K0": 4.0,
        "Aankle": 12.0, "Ashoulder": 18.0, "E0": 18.0,
        "Aelbow": 10.0, "Abob": 0.025, "torsoLean": 2.0,
    },
    "run": {
        "stepLength": 1.20, "Ahip": 42.0, "Aknee": 64.0, "K0": 10.0,
        "Aankle": 20.0, "Ashoulder": 30.0, "E0": 58.0,
        "Aelbow": 12.0, "Abob": 0.055, "torsoLean": 7.0,
    },
}


def motion_mode(speed: float) -> str:
    """Select the nominal mode; runtime hysteresis/blending remains an engine concern."""
    if not math.isfinite(speed) or speed < 0:
        raise ValueError("speed must be a finite non-negative number")
    if speed <= 0.05:
        return "idle"
    return "walk" if speed < 2.0 else "run"


def cycle_period(speed: float, weightClass: str, mode: str | None = None) -> float:
    """Return one left+right step cycle in seconds."""
    if not math.isfinite(speed) or speed < 0:
        raise ValueError("speed must be a finite non-negative number")
    if weightClass not in WEIGHTS:
        raise ValueError(f"unknown weightClass: {weightClass}")
    selected = motion_mode(speed) if mode is None else mode
    if selected == "idle":
        return 3.6
    if selected not in MODES:
        raise ValueError(f"unknown motion mode: {selected}")
    weight = WEIGHTS[weightClass]
    raw = 2.0 * MODES[selected]["stepLength"] * weight["kL"] / max(speed, 0.05)
    lower, upper = (0.60, 1.80) if selected == "walk" else (0.38, 0.90)
    return min(upper, max(lower, raw * weight["kT"]))


def _u(phase: float) -> float:
    return math.sin(TAU * phase) + 0.12 * math.sin(2.0 * TAU * phase + math.pi / 6.0)


def _v(phase: float) -> float:
    return max(0.0, math.sin(TAU * (phase - 0.08))) ** 1.25


def _ankle(phase: float) -> float:
    return 0.70 * math.sin(TAU * (phase + 0.08)) + 0.30 * math.sin(2.0 * TAU * phase)


def _shoulder(phase: float) -> float:
    return -math.sin(TAU * phase) - 0.08 * math.sin(2.0 * TAU * phase - math.pi / 4.0)


def _elbow(phase: float) -> float:
    return 0.50 + 0.50 * math.cos(TAU * (phase - 0.10))


def pose(
    t: float, speed: float, weightClass: str = "medium",
    params: Mapping[str, float] | None = None,
) -> dict[str, Any]:
    """Return nominal local joint angles and offsets for normalized phase ``t``."""
    if not math.isfinite(t):
        raise ValueError("t must be finite")
    if weightClass not in WEIGHTS:
        raise ValueError(f"unknown weightClass: {weightClass}")
    phase = t % 1.0
    mode = motion_mode(speed)
    weight = WEIGHTS[weightClass]
    if mode == "idle":
        breath = math.sin(TAU * phase)
        return {
            "mode": mode, "hip_L": 0.0, "hip_R": 0.0,
            "knee_L": 0.0, "knee_R": 0.0, "ankle_L": 0.0, "ankle_R": 0.0,
            "shoulder_L": 0.8 * breath, "shoulder_R": -0.8 * breath,
            "elbow_L": 4.0, "elbow_R": 4.0, "bodyY": 0.004 * breath,
            "torsoScaleY": 1.0 + 0.006 * breath, "torsoRoll": 0.0,
            "torsoLean": 0.0, "pelvisX": 0.0, "period": 3.6,
        }
    values = dict(MODES[mode])
    if params:
        unknown = set(params) - set(values)
        if unknown:
            raise ValueError(f"unknown gait params: {', '.join(sorted(unknown))}")
        overrides = {key: float(value) for key, value in params.items()}
        if any(not math.isfinite(value) for value in overrides.values()):
            raise ValueError("gait params must be finite")
        values.update(overrides)
    positive = ("stepLength", "Ahip", "Aknee", "Aankle",
                "Ashoulder", "Aelbow", "Abob")
    if any(values[key] < 0.0 for key in positive) or values["K0"] < 0.0:
        raise ValueError("gait lengths and amplitudes must be non-negative")
    p_left, p_right = phase, (phase + 0.5) % 1.0
    amplitude = weight["kA"]
    result: dict[str, Any] = {"mode": mode}
    for side, p in (("L", p_left), ("R", p_right)):
        result[f"hip_{side}"] = values["Ahip"] * amplitude * _u(p)
        result[f"knee_{side}"] = values["K0"] + values["Aknee"] * amplitude * _v(p)
        result[f"ankle_{side}"] = values["Aankle"] * amplitude * _ankle(p)
        result[f"shoulder_{side}"] = values["Ashoulder"] * amplitude * _shoulder(p)
        result[f"elbow_{side}"] = values["E0"] + values["Aelbow"] * amplitude * _elbow(p)
    result["bodyY"] = values["Abob"] * amplitude * (
        -math.cos(2.0 * TAU * phase) + 0.15 * math.sin(TAU * phase)
    )
    roll_factor = 1.4 if mode == "run" else 1.0
    result["torsoRoll"] = -2.5 * amplitude * math.sin(TAU * phase) * roll_factor
    result["torsoLean"] = values["torsoLean"] + (2.0 if weightClass == "heavy" else 0.0)
    result["pelvisX"] = 0.012 * amplitude * math.sin(TAU * phase)
    result["torsoScaleY"] = 1.0
    result["period"] = cycle_period(speed, weightClass, mode)
    return result
