#!/usr/bin/env python3
"""Compose source-aligned VFX layers without moving the emitter (design/23)."""

from __future__ import annotations

import argparse
import bisect
import json
import math
import os
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

try:
    from .imaging import blend, from_premultiplied, rotation, to_premultiplied, warp
    from .validation import VFXError, load_yaml, resolve_path, validate_document
except ImportError:
    from imaging import blend, from_premultiplied, rotation, to_premultiplied, warp
    from validation import VFXError, load_yaml, resolve_path, validate_document


def _image(path: Path) -> np.ndarray:
    with Image.open(path) as image:
        return to_premultiplied(image)


def _smooth(value: float) -> float:
    value = min(1.0, max(0.0, value))
    return value * value * (3 - 2 * value)


def _visible_bounds(rgba: np.ndarray, matrix: np.ndarray,
                    offset: np.ndarray) -> np.ndarray:
    """Conservative visible bounds, including bilinear sampling support."""
    if not np.all(np.isfinite(matrix)) or not np.all(np.isfinite(offset)):
        raise VFXError("几何变换超出有限数范围；请减小比例或长度")
    y, x = np.nonzero(rgba[..., 3] > 0)
    if not len(x):
        raise VFXError("素材没有可见像素")
    points = np.column_stack((x + 0.5, y + 0.5)) @ matrix.T + offset
    if not np.all(np.isfinite(points)):
        raise VFXError("变换后的像素坐标超出有限数范围")
    pixel_radius = np.abs(matrix) @ np.array([0.5, 0.5])
    # Pixel cells must fit; enlarged bilinear kernels must also not reach an
    # off-canvas pixel center. Identity leaves the original cell bounds intact.
    radius = np.maximum(pixel_radius, 2 * pixel_radius - 0.5)
    return np.concatenate((points.min(axis=0) - radius, points.max(axis=0) + radius))


class Renderer:
    """Retain raw layers so animation applies its envelope exactly once.

    ``render(..., animated=False)`` creates un-enveloped inspection keyframes.
    ``animated=True`` samples source layers and applies the configured rhythm.
    """

    def __init__(self, composition_path: str | Path, suite_root: str | Path | None = None):
        self.path = Path(composition_path).resolve()
        self.suite_root = Path(suite_root).resolve() if suite_root else self.path.parent
        self.composition = validate_document(self.path, suite_root=self.suite_root)
        if self.composition["kind"] != "Composition":
            raise VFXError("compose 需要 Composition YAML")
        comp = self.composition
        effect_path = resolve_path(self.path, comp["effect_set"], self.suite_root)
        emitter_path = resolve_path(self.path, comp["emitter_plate"], self.suite_root)
        self.effect, self.emitter = load_yaml(effect_path), load_yaml(emitter_path)
        self.input_paths = {self.path, effect_path, emitter_path,
                            resolve_path(emitter_path, self.emitter["file"], self.suite_root)}
        self.input_paths.update(resolve_path(effect_path, name, self.suite_root)
                                for name in self.effect["source"]["files"])
        self.input_paths.update(resolve_path(effect_path, frame["file"], self.suite_root)
                                for frame in self.effect["frames"])
        self.phases = [float(frame["phase"]) for frame in self.effect["frames"]]
        self.size = tuple(comp["canvas_px"])
        self.emit_at = np.asarray(comp["emit_at_px"], dtype=np.float64)
        self.length = comp.get("length_px", comp["range_hex"] * comp["pixels_per_hex"])
        theta = math.radians(comp["angle_deg"])
        phi = math.atan2(self.effect["direction"][1], self.effect["direction"][0])
        psi = math.atan2(self.emitter["direction"][1], self.emitter["direction"][0])
        self.direction = np.array([math.cos(theta), math.sin(theta)])
        sx = self.length / self.effect["reference_length_px"] * comp["scale"][0]
        sy = (comp["emitter_scale"] * self.emitter["emission_width_px"]
              / self.effect["root_width_px"] * comp["scale"][1])
        self.matrix = rotation(theta) @ np.diag([sx, sy]) @ rotation(-phi)
        emitter_matrix = comp["emitter_scale"] * rotation(theta - psi)
        emitter_anchor = np.asarray(self.emitter["emit_point_px"], dtype=np.float64)
        emitter_offset = self.emit_at - emitter_matrix @ emitter_anchor
        plate = _image(resolve_path(emitter_path, self.emitter["file"], self.suite_root))
        raw = [_image(resolve_path(effect_path, frame["file"], self.suite_root))
               for frame in self.effect["frames"]]
        anchors = np.asarray([frame["anchor_px"] for frame in self.effect["frames"]])
        self._align_frames(raw, anchors)
        common_anchors = np.repeat(self.anchor[None, :], len(raw), axis=0)
        self.geometry_report = self._check_geometry(self.frames, common_anchors, plate,
                                                    emitter_matrix, emitter_offset)
        background = Image.new("RGBA", self.size, comp["background"])
        self.background = blend(to_premultiplied(background),
                                warp(plate, emitter_matrix, emitter_offset, self.size))
        rhythm = comp["rhythm"]
        durations = [rhythm[key] for key in
                     ("charge_s", "release_s", "sustain_s", "dissipate_s")]
        self.boundaries = [0.0] + np.cumsum(durations).tolist()
        self.duration = self.boundaries[-1]

    def _align_frames(self, frames: list[np.ndarray], anchors: np.ndarray) -> None:
        # All frame roots share this canvas. No per-frame bounding-box crop.
        self.anchor = np.ceil(anchors.max(axis=0)) + 1
        sizes = np.asarray([[frame.shape[1], frame.shape[0]] for frame in frames])
        size = np.ceil((sizes - anchors).max(axis=0) + self.anchor).astype(int) + 1
        self.frames = []
        for frame, anchor in zip(frames, anchors):
            shift = self.anchor - anchor
            if np.all(shift == np.floor(shift)):
                aligned = np.zeros((size[1], size[0], 4), dtype=np.float32)
                x, y = shift.astype(int)
                height, width = frame.shape[:2]
                aligned[y:y + height, x:x + width] = frame
            else:
                aligned = warp(frame, np.eye(2), shift, size)
            self.frames.append(aligned)

    def _check_geometry(self, frames: list[np.ndarray], anchors: np.ndarray,
                        plate: np.ndarray, emitter_matrix: np.ndarray,
                        emitter_offset: np.ndarray) -> dict:
        transition = self.composition["transition"]
        # During charge k changes; during dissipate only drift changes. Each
        # transformed coordinate is affine in either parameter, so endpoint
        # extrema contain every intermediate phase, including crossfades.
        poses = ((1.0, 0.0), (transition["scale_from"], 0.0),
                 (1.0, transition["drift_fraction"] * self.length))
        bounds = [_visible_bounds(plate, emitter_matrix, emitter_offset)]
        for frame, anchor in zip(frames, anchors):
            for scale, drift in poses:
                matrix = self.matrix * scale
                offset = self.emit_at + drift * self.direction - matrix @ anchor
                bounds.append(_visible_bounds(frame, matrix, offset))
        bounds = np.asarray(bounds)
        low, high = bounds[:, :2].min(axis=0), bounds[:, 2:].max(axis=0)
        size = np.asarray(self.size)
        if np.any(low < -1e-6) or np.any(high > size + 1e-6):
            raise VFXError(f"变换后可见像素越界：{low.tolist()}–{high.tolist()}，"
                           f"画幅 {list(self.size)}；请调整 emit_at_px、比例或画幅")
        safe = float(min(np.min(low), np.min(size - high)))
        blank = max(0.0, 1 - float(np.prod(high - low) / np.prod(size)))
        return {"visible_bounds_px": [*low.tolist(), *high.tolist()],
                "safe_margin_px": safe, "blank_fraction_lower_bound": blank}

    def sample_effect(self, phase: float) -> np.ndarray:
        """Sample root-aligned premultiplied source layers, without envelope."""
        if not math.isfinite(phase) or not 0 <= phase <= 1:
            raise VFXError("采样 phase 必须是 [0,1] 内的有限数")
        current = max(0, bisect.bisect_right(self.phases, phase) - 1)
        if current == len(self.frames) - 1:
            return self.frames[current].copy()
        if self.composition["transition"]["interpolation"] == "hold":
            return self.frames[current].copy()
        weight = ((phase - self.phases[current])
                  / (self.phases[current + 1] - self.phases[current]))
        return (1 - weight) * self.frames[current] + weight * self.frames[current + 1]

    def envelope(self, phase: float) -> tuple[float, float, float, float]:
        """Return effect opacity, root scale, forward drift in px, and gain."""
        if not math.isfinite(phase) or not 0 <= phase <= 1:
            raise VFXError("采样 phase 必须是 [0,1] 内的有限数")
        time = phase * self.duration
        charge, dissipate_start, end = self.boundaries[1], self.boundaries[3], self.duration
        transition = self.composition["transition"]
        alpha, scale, drift = 1.0, 1.0, 0.0
        if charge > 0 and time < charge:
            progress = _smooth(time / charge)
            alpha = progress
            scale = transition["scale_from"] + (1 - transition["scale_from"]) * progress
        if end > dissipate_start and time >= dissipate_start:
            progress = _smooth((time - dissipate_start) / (end - dissipate_start))
            alpha = 1 - progress
            drift = transition["drift_fraction"] * self.length * progress
        # bisect_right selects the last value at coincident phase boundaries.
        index = min(4, bisect.bisect_right(self.boundaries, time) - 1)
        gains = transition["brightness"]
        gain = gains[index]
        if index < 4:
            weight = ((time - self.boundaries[index])
                      / (self.boundaries[index + 1] - self.boundaries[index]))
            gain += weight * (gains[index + 1] - gains[index])
        return float(alpha), float(scale), float(drift), float(gain)

    def render(self, phase: float, animated: bool = True) -> Image.Image:
        layer = self.sample_effect(phase)
        alpha, scale, drift, gain = self.envelope(phase) if animated else (1, 1, 0, 1)
        if alpha == 0:
            return from_premultiplied(self.background)
        # min(P*g,a) equals a*clamp(g*C); gain never touches the emitter.
        layer[..., :3] = np.minimum(layer[..., :3] * gain, layer[..., 3:4])
        layer *= alpha
        matrix = self.matrix * scale
        offset = self.emit_at + drift * self.direction - matrix @ self.anchor
        effect = warp(layer, matrix, offset, self.size)
        return from_premultiplied(blend(self.background, effect, self.effect["blend"]))


def export_keyframes(renderer: Renderer, output: str | Path) -> dict:
    output = Path(output).resolve()
    names = [f"key_{index:03d}.png" for index in range(len(renderer.phases))]
    previous = output / "keyframes.json"
    stale = []
    if previous.exists():
        try:
            old = json.loads(previous.read_text(encoding="utf-8"))
            own = (old.get("sampling") == "layered_keyframes_without_envelope"
                   and (output / old["composition"]).resolve() == renderer.path)
            if own:
                stale = [output / row["file"] for row in old["frames"]
                         if re.fullmatch(r"key_\d{3}\.png", row["file"])
                         and row["file"] not in names]
        except (OSError, ValueError, TypeError, KeyError, AttributeError) as error:
            raise VFXError(f"已有 keyframes.json 无法安全读取：{error}") from error
    planned = [output / name for name in names] + [previous] + stale
    for target in planned:
        if any(target.resolve() == source.resolve()
               or (target.exists() and source.exists() and target.samefile(source))
               for source in renderer.input_paths):
            raise VFXError(f"关键帧输出会覆盖原料：{target}")
    output.mkdir(parents=True, exist_ok=True)
    records = []
    for filename, phase in zip(names, renderer.phases):
        renderer.render(phase, animated=False).save(output / filename)
        records.append({"file": filename, "phase": phase})
    for target in stale:
        if target.exists():
            target.unlink()
    manifest = {
        "version": 1,
        "composition": Path(os.path.relpath(renderer.path, output)).as_posix(),
        "sampling": "layered_keyframes_without_envelope",
        "frames": records,
        "geometry": renderer.geometry_report,
    }
    (output / "keyframes.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("composition", type=Path, help="Composition YAML")
    parser.add_argument("--output", type=Path, help="关键帧目录，默认 Composition 同级 frames/")
    parser.add_argument("--root", type=Path, help="素材套件根目录，默认 Composition 所在目录")
    args = parser.parse_args(argv)
    try:
        renderer = Renderer(args.composition, args.root)
        output = args.output or args.composition.parent / "frames"
        manifest = export_keyframes(renderer, output)
        print(f"已输出 {len(manifest['frames'])} 个关键帧：{output}")
    except (VFXError, OSError, ValueError) as error:
        print(f"合成失败：{error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
