"""Calibrate the two reviewed Tubo gate sprites to a strict 2:1 ground grid."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import math
import shutil

import numpy as np
from PIL import Image, PngImagePlugin

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
REJECTED = SOURCE / "rejected"
GENERATED = Path("/Users/bytedance/.codex/generated_images/01a0f459-de72-7532-8933-e846fde53484")


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def premultiply(image: Image.Image) -> Image.Image:
    array = np.asarray(image.convert("RGBA")).astype(np.float32)
    array[..., :3] *= array[..., 3:4] / 255.0
    return Image.fromarray(np.uint8(np.clip(array, 0, 255)), "RGBA")


def unpremultiply(image: Image.Image) -> Image.Image:
    array = np.asarray(image).astype(np.float32)
    alpha = array[..., 3:4]
    array[..., :3] = np.where(alpha > 0, array[..., :3] * 255 / np.maximum(alpha, 1), 0)
    return Image.fromarray(np.uint8(np.clip(array, 0, 255)), "RGBA")


def calibrated(source: Image.Image, scale_y: float, shear_y: float) -> Image.Image:
    """Map both observed ground axes to slopes +/-0.5; x and verticals stay vertical."""
    image = premultiply(source)
    width, height = image.size
    pad = 32
    out_height = math.ceil(scale_y * height + abs(shear_y) * width) + 2 * pad
    inverse = (1, 0, -pad, -shear_y / scale_y, 1 / scale_y,
               (shear_y * pad - pad) / scale_y)
    warped = image.transform((width + 2 * pad, out_height), Image.Transform.AFFINE,
                             inverse, Image.Resampling.BICUBIC)
    return unpremultiply(warped)


def build(filename: str, generated_name: str, scale_y: float, shear_y: float,
          final_width: int, axes: list[float]):
    source_path = GENERATED / generated_name
    source = Image.open(source_path).convert("RGBA")
    warped = calibrated(source, scale_y, shear_y)
    bbox = warped.getchannel("A").point(lambda value: 255 if value >= 4 else 0).getbbox()
    margin = 16
    warped = warped.crop((bbox[0] - margin, bbox[1] - margin,
                          bbox[2] + margin, bbox[3] + margin))
    ratio = final_width / warped.width
    final = warped.resize((final_width, round(warped.height * ratio)), Image.Resampling.LANCZOS)
    alpha = final.getchannel("A").point(lambda value: 0 if value < 4 else (255 if value > 248 else value))
    final.putalpha(alpha)
    meta = PngImagePlugin.PngInfo()
    meta.add_text("generator", "Pillow affine projection calibration of reviewed image_gen asset")
    meta.add_text("projection", "orthographic 2:1 ground axes +0.5/-0.5; verticals vertical")
    final_path = ROOT / filename
    final.save(final_path, pnginfo=meta, optimize=True)
    raw_path = SOURCE / (final_path.stem + "__raw.png")
    shutil.copyfile(source_path, raw_path)
    return {
        "id": final_path.stem, "created": datetime.now(timezone.utc).isoformat(),
        "method": "Pillow affine projection calibration of reviewed image_gen asset",
        "source_reference": str(REJECTED / (Path(filename).stem + "__pre_review_round1.png")),
        "source_reference_sha256": sha(REJECTED / (Path(filename).stem + "__pre_review_round1.png")),
        "image_gen_source": str(source_path), "image_gen_source_sha256": sha(source_path),
        "raw_path": str(raw_path), "raw_size": list(source.size), "raw_sha256": sha(raw_path),
        "final_path": str(final_path), "size": list(final.size), "final_sha256": sha(final_path),
        "projection": {"yaw_deg": 45, "elevation_deg": 30,
                       "measured_input_ground_axis_slopes": axes,
                       "affine_scale_y": scale_y, "affine_shear_y": shear_y,
                       "calibration_target_ground_axis_slopes": [0.5, -0.5]},
        "transparent_background": True, "candidate_count_this_round": 1,
    }


if __name__ == "__main__":
    # Robust fits on the reviewed sprites' two outer ground-contact directions.
    # y' = scale_y*y + shear_y*x solves both fitted slopes to +0.5/-0.5.
    specs = [
        ("tex_town_tubo_city_gate__k4_r000_v01.png",
         "exec-14903b34-0704-4065-b977-c62fa1a8a354.png", 1.227, 0.102, 400, [0.3244, -0.4875]),
        ("tex_town_tubo_city_gate__k6_r000_v01.png",
         "exec-7d917305-1c37-44b9-bda6-6a89b11b322b.png", 1.239, 0.119, 464, [0.3073, -0.4997]),
    ]
    records = [build(*spec) for spec in specs]
    record_path = SOURCE / "city-gate-review-round1.jsonl"
    record_path.write_text("".join(json.dumps(item, ensure_ascii=False) + "\n"
                                   for item in records), encoding="utf-8")
    print(json.dumps(records, ensure_ascii=False, indent=2))
