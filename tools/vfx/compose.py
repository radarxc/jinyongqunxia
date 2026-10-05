#!/usr/bin/env python3
"""按 Composition 仅生成一张静态 peak.png；动效由 Three.js 执行。"""

from __future__ import annotations

import argparse
import bisect
import math
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


class PeakRenderer:
    """检查所有原料的几何边界，仅采样配置中的一个静态峰值。"""

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

    def render_peak(self) -> Image.Image:
        """静态缩略图按与网页相同的相位、预乘插值和推进遮罩采样。"""
        phase = self.composition['output']['peak_phase']
        transition = self.composition['transition']
        index = max(0, bisect.bisect_right(self.phases, phase) - 1)
        layer = self.frames[index].copy()
        if index + 1 < len(self.frames) and transition['interpolation'] == 'crossfade':
            weight = (phase - self.phases[index]) / (self.phases[index + 1] - self.phases[index])
            layer = (1 - weight) * layer + weight * self.frames[index + 1]
        time = phase * self.duration
        charge, dissipate, end = self.boundaries[1], self.boundaries[3], self.duration
        alpha, scale, drift, reveal, erase = 1.0, 1.0, 0.0, 1.0, 0.0
        if charge > 0 and time < charge:
            progress = _smooth(time / charge)
            alpha, reveal = progress, progress
            scale = transition['scale_from'] + (1 - transition['scale_from']) * progress
        if end > dissipate and time >= dissipate:
            erase = _smooth((time - dissipate) / (end - dissipate))
            alpha = 1 - erase
            drift = transition['drift_fraction'] * self.length * erase
        if time >= end:
            alpha, erase = 0.0, 1.0
        boundary = min(4, bisect.bisect_right(self.boundaries, time) - 1)
        gain = transition['brightness'][boundary]
        if boundary < 4:
            fraction = ((time - self.boundaries[boundary])
                        / (self.boundaries[boundary + 1] - self.boundaries[boundary]))
            gain += fraction * (transition['brightness'][boundary + 1] - gain)
        layer[..., :3] = np.minimum(layer[..., :3] * gain, layer[..., 3:4])
        mask_config = transition.get('directional_mask', {})
        if mask_config.get('enabled', False):
            y, x = np.mgrid[:layer.shape[0], :layer.shape[1]]
            direction = np.asarray(self.effect['direction'])
            along = ((x + 0.5 - self.anchor[0]) * direction[0]
                     + (y + 0.5 - self.anchor[1]) * direction[1])
            along /= self.effect['reference_length_px']
            softness = mask_config['softness']
            def smooth_array(value):
                value = np.clip(value, 0, 1)
                return value * value * (3 - 2 * value)
            mask = np.ones(along.shape)
            if reveal < 1:
                mask *= 1 - smooth_array((along - reveal + softness / 2) / softness)
            if erase > 0:
                mask *= smooth_array((along - erase + softness / 2) / softness)
            layer *= mask[..., None]
        layer *= alpha
        matrix = self.matrix * scale
        offset = self.emit_at + drift * self.direction - matrix @ self.anchor
        effect = warp(layer, matrix, offset, self.size)
        return from_premultiplied(blend(self.background, effect, self.effect['blend']))


def write_peak(composition: str | Path, output: str | Path | None = None,
               suite_root: str | Path | None = None) -> Path:
    renderer = PeakRenderer(composition, suite_root)
    target = Path(output).resolve() if output else renderer.path.with_name('peak.png')
    if target.suffix.lower() != '.png':
        raise VFXError('静态峰值必须输出 PNG')
    for source in renderer.input_paths:
        if target == source or (target.exists() and target.samefile(source)):
            raise VFXError(f'峰值输出会覆盖原料：{target}')
    target.parent.mkdir(parents=True, exist_ok=True)
    renderer.render_peak().save(target)
    return target


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('composition', type=Path, help='Composition YAML')
    parser.add_argument('--output', type=Path, help='静态 PNG，默认同级 peak.png')
    parser.add_argument('--root', type=Path, help='素材套件根目录，默认 Composition 所在目录')
    args = parser.parse_args(argv)
    try:
        print(f'已输出静态峰值：{write_peak(args.composition, args.output, args.root)}')
    except (VFXError, OSError, ValueError) as error:
        print(f'静态预览失败：{error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
