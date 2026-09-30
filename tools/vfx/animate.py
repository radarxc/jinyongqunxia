#!/usr/bin/env python3
"""Resample separated VFX layers and embed WebP frames in a standalone player."""
from __future__ import annotations

import argparse
import base64
import io
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

from compose import Renderer
from validation import VFXError, check_html


def sample_times(duration: float, fps: int) -> list[float]:
    if not math.isfinite(duration) or duration <= 0 or not 1 <= fps <= 60:
        raise VFXError("animation: positive finite duration and fps 1..60 required")
    intervals = duration * fps
    if math.isclose(intervals, round(intervals), rel_tol=0, abs_tol=1e-10):
        intervals = round(intervals)
    times = [min(index / fps, duration) for index in range(math.ceil(intervals) + 1)]
    times[-1] = duration
    return times


def data_uri(image: Image.Image, size: tuple[int, int], quality: int) -> str:
    stream = io.BytesIO()
    image.resize(size, Image.Resampling.LANCZOS).save(
        stream, format="WEBP", quality=quality, method=6)
    return "data:image/webp;base64," + base64.b64encode(stream.getvalue()).decode("ascii")


def write_html(frames: list[Image.Image], peak: Image.Image, times: list[float],
               output: dict, path: Path, quality: int = 82) -> dict:
    if not 1 <= quality <= 100:
        raise VFXError("quality: must be 1..100")
    template = Path(__file__).with_name("player.html").read_text(encoding="utf-8")
    size = tuple(output["preview_size_px"])
    original_size = size
    attempts = []
    # Reduce only the embedded preview. PNG masters and exact peak never change.
    divisor = math.gcd(*size)
    unit = (size[0] // divisor, size[1] // divisor)
    for step in range(12):
        q = max(25, quality - 12 * (step % 3))
        multiple = max(1, int(divisor * 0.75 ** (step // 3)))
        size = (unit[0] * multiple, unit[1] * multiple)
        encoded = [data_uri(frame, size, q) for frame in frames]
        payload = dict(frames=encoded, peak=data_uri(peak, size, q), times=times,
                       duration=times[-1], loop=output["loop"], gap=output["loop_gap_s"],
                       size=size)
        html = template.replace("__VFX_DATA__", json.dumps(payload, separators=(",", ":")))
        content = html.encode("utf-8")
        attempts.append(dict(size=list(size), quality=q, bytes=len(content)))
        if len(content) <= output["html_max_bytes"]:
            path.write_bytes(content)
            check_html(path, output["html_max_bytes"])
            return dict(file=path.name, bytes=len(content), size=list(size), quality=q,
                        reduced=(size != original_size or q != quality), attempts=attempts)
    raise VFXError(f"HTML remains over {output['html_max_bytes']} bytes after preview reductions")


def write_optional(frames: list[Image.Image], times: list[float], output: dict,
                   folder: Path, kind: str) -> dict | None:
    if kind == "none":
        return None
    if kind not in ("apng", "webp"):
        raise VFXError("optional_animation: expected none/apng/webp")
    # Difference of rounded boundaries avoids accumulating timing quantization error.
    boundaries = [round(t * 1000) for t in times]
    durations = [b - a for a, b in zip(boundaries, boundaries[1:])]
    durations.append(round(output["loop_gap_s"] * 1000) if output["loop"] else 0)
    path = folder / f"animation.{kind}"
    kwargs = dict(save_all=True, append_images=frames[1:], duration=durations,
                  loop=0 if output["loop"] else 1)
    if kind == "apng":
        frames[0].save(path, format="PNG", disposal=0, blend=0, **kwargs)
    else:
        frames[0].save(path, format="WEBP", lossless=True, method=6, **kwargs)
    with Image.open(path) as image:
        count = image.n_frames
    return dict(file=path.name, bytes=path.stat().st_size, encoded_frames=count,
                duration_ms=durations, loop=output["loop"],
                timing_note="millisecond quantization; viewers may clamp zero endpoint duration")


def verify_keys(renderer: Renderer, directory: Path) -> list[str]:
    keys = sorted(directory.glob("key_*.png"))
    expected = [directory / f"key_{i:03d}.png" for i in range(len(renderer.phases))]
    if keys != expected:
        raise VFXError(f"{directory}: expected exactly key_000.png..key_{len(expected)-1:03d}.png")
    for phase, path in zip(renderer.phases, keys):
        with Image.open(path) as image:
            reference = renderer.render(phase, animated=False)
            if image.mode != "RGBA" or image.size != reference.size:
                raise VFXError(f"{path}: composed key mode/size mismatch")
            if not np.array_equal(np.asarray(image), np.asarray(reference)):
                raise VFXError(f"{path}: stale keyframe; rerun compose for this Composition")
    return [path.name for path in keys]


def animate(composition_path: Path, frames_dir: Path | None = None,
            output_dir: Path | None = None, html_name: str = "demo.html", quality: int = 82,
            optional_animation: str | None = None, suite_root: Path | None = None) -> dict:
    composition_path = Path(composition_path).resolve()
    renderer = Renderer(composition_path, suite_root=suite_root)
    directory = Path(frames_dir or composition_path.parent / "frames").resolve()
    folder = Path(output_dir or composition_path.parent).resolve()
    if Path(html_name).name != html_name or Path(html_name).suffix.lower() != ".html":
        raise VFXError("html_name: require a local .html filename")
    protected = {composition_path}
    effect_path = (composition_path.parent / renderer.composition["effect_set"]).resolve()
    emitter_path = (composition_path.parent / renderer.composition["emitter_plate"]).resolve()
    protected.update([effect_path, emitter_path])
    protected.update((effect_path.parent / entry["file"]).resolve()
                     for entry in renderer.effect["frames"])
    protected.update((effect_path.parent / file).resolve()
                     for file in renderer.effect["source"]["files"])
    protected.add((emitter_path.parent / renderer.emitter["file"]).resolve())
    keys = verify_keys(renderer, directory)
    output = renderer.composition["output"]
    times = sample_times(renderer.duration, output["fps"])
    frame_folder = folder / "frames"
    destinations = [frame_folder / f"frame_{i:04d}.png" for i in range(len(times))]
    outputs = [*destinations, folder / "peak.png", folder / html_name,
               folder / "animation.json", folder / "animation.apng", folder / "animation.webp"]
    if any(path.resolve() in protected or (path.exists() and any(
            path.samefile(source) for source in protected)) for path in outputs):
        raise VFXError("animation output would overwrite a source or metadata input")
    frames = [renderer.render(t / renderer.duration, animated=True) for t in times]
    peak = renderer.render(output["peak_phase"], animated=True)
    frame_folder.mkdir(parents=True, exist_ok=True)
    # Only retire files owned by the previous output manifest, never a broad glob.
    old_manifest = folder / "animation.json"
    if old_manifest.is_file():
        try:
            old_data = json.loads(old_manifest.read_text(encoding="utf-8"))
            old_names = old_data.get("frames", []) if isinstance(old_data, dict) else []
            old_names = old_names if isinstance(old_names, list) else []
        except (OSError, ValueError):
            old_names = []
        for name in old_names:
            if not isinstance(name, str):
                continue
            old = folder / name
            if (old.parent == frame_folder and old.name.startswith("frame_")
                    and old.suffix == ".png" and old.stem[6:].isdigit()
                    and old not in destinations and old.is_file()
                    and old.resolve().is_relative_to(frame_folder.resolve())
                    and not any(old.samefile(source) for source in protected)):
                old.unlink()
    for path, image in zip(destinations, frames):
        image.save(path)
    peak.save(folder / "peak.png")
    html = write_html(frames, peak, times, output, folder / html_name, quality)
    optional = write_optional(frames, times, output, folder,
                              optional_animation or output["optional_animation"])
    report = dict(version=1, sampling="separated_layers_single_envelope",
                  composition=str(composition_path.relative_to(folder))
                  if composition_path.is_relative_to(folder) else str(composition_path),
                  keyframes=keys, master_size=list(frames[0].size),
                  duration_s=renderer.duration, times_s=times,
                  frame_durations_s=[b - a for a, b in zip(times, times[1:])]
                  + [output["loop_gap_s"] if output["loop"] else 0],
                  frames=[f"frames/{p.name}" for p in destinations],
                  peak=dict(file="peak.png", phase=output["peak_phase"]),
                  html=html, optional_animation=optional,
                  geometry=renderer.geometry_report)
    (folder / "animation.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("composition", type=Path)
    parser.add_argument("--frames", type=Path, help="compose key_NNN.png directory")
    parser.add_argument("--output", type=Path, help="output suite directory")
    parser.add_argument("--root", type=Path, help="input suite root")
    parser.add_argument("--html-name", default="demo.html")
    parser.add_argument("--quality", type=int, default=82, help="embedded WebP quality 1..100")
    parser.add_argument("--optional-animation", choices=["none", "apng", "webp"])
    args = parser.parse_args()
    try:
        report = animate(args.composition, args.frames, args.output, args.html_name,
                         args.quality, args.optional_animation, args.root)
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0
    except (VFXError, OSError, ValueError) as exc:
        parser.exit(1, f"animate: {exc}\n")


if __name__ == "__main__":
    raise SystemExit(main())
