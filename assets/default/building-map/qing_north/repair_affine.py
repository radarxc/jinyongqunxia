#!/usr/bin/env python3
"""Replay review-10 affine slope correction for the eight named candidates."""
import hashlib
import json
import math
from pathlib import Path

import yaml
from PIL import Image

BUILD = Path(__file__).resolve().parent
TILE = BUILD.parents[1] / "tile" / "qing_north"
BUILD_IDS = {
    "bld_kit_qing_north_courtyard", "bld_kit_qing_north_inn",
    "bld_kit_qing_north_restaurant", "bld_kit_qing_north_shop_2f",
    "bld_kit_qing_north_temple_hall", "bld_kit_qing_north_warehouse",
    "bld_kit_qing_north_wharf",
}
TILE_ID = "tex_town_qing_north_wall_corner__outer_ne_v01"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def affine(image, points, padding):
    left, front, right = points
    m1 = (front[1] - left[1]) / (front[0] - left[0])
    m2 = (right[1] - front[1]) / (right[0] - front[0])
    shear_yx = 0.5 - m1 / (m1 - m2)
    scale_y = 1 / (m1 - m2)
    width, height = image.size
    extrema = [shear_yx * x + scale_y * y for x in (0, width) for y in (0, height)]
    y_min, y_max = math.floor(min(extrema)), math.ceil(max(extrema))
    offset_y = -y_min
    inverse = (1, 0, 0, -shear_yx / scale_y, 1 / scale_y, -offset_y / scale_y)
    work = image.transform((width, y_max - y_min), Image.Transform.AFFINE, inverse,
                           resample=Image.Resampling.BICUBIC, fillcolor=(0, 0, 0, 0))
    box = work.getchannel("A").getbbox()
    crop = work.crop(box)
    output = Image.new("RGBA", (crop.width + 2 * padding, crop.height + 2 * padding))
    output.paste(crop, (padding, padding))

    def convert(point):
        return [point[0] - box[0] + padding,
                shear_yx * point[0] + scale_y * point[1] + offset_y - box[1] + padding]

    corrected = [convert(point) for point in points]
    slopes = [(corrected[1][1] - corrected[0][1]) / (corrected[1][0] - corrected[0][0]),
              (corrected[2][1] - corrected[1][1]) / (corrected[2][0] - corrected[1][0])]
    anchor = [(corrected[0][i] + corrected[2][i]) / 2 for i in (0, 1)]
    return output, corrected, slopes, anchor, {
        "forward_xy": [1, 0, shear_yx, scale_y, 0, offset_y],
        "work_alpha_bbox": list(box), "padding_px": padding,
    }


def building_points(entry):
    processing = entry["processing"]
    box = processing["crop_box"]
    sx, sy = processing["rounded_effective_scale"]
    ox, oy = processing["paste_offset"][:2]
    corners = entry["geometry_qa"]["source_corners_px"]
    return [[(corners[name][0] - box[0]) * sx + ox,
             (corners[name][1] - box[1]) * sy + oy]
            for name in ("left", "front", "right")]


def run_buildings():
    entries = yaml.safe_load((BUILD / "manifest.yaml").read_text(encoding="utf-8"))
    records = []
    for entry in entries:
        if entry["id"] not in BUILD_IDS:
            continue
        final = BUILD / entry["file"]
        before = BUILD / "sources" / f"{entry['id']}__before_affine_r10.png"
        expected = entry.get("affine_qa", {}).get("input_sha256", entry["sha256"])
        if not before.exists():
            if sha(final) != expected:
                raise ValueError(f"unexpected input hash: {entry['id']}")
            before.write_bytes(final.read_bytes())
        if sha(before) != expected:
            raise ValueError(f"archived input hash mismatch: {entry['id']}")
        source = Image.open(before).convert("RGBA")
        output, corners, slopes, anchor, matrix = affine(
            source, building_points(entry), 20 if entry["id"].endswith("temple_hall") else 16)
        output.save(final)
        records.append({"id": entry["id"], "input_archive": str(before.relative_to(BUILD)),
                        "input_sha256": sha(before), "output_size": list(output.size),
                        "output_sha256": sha(final), "corrected_corners_px": corners,
                        "corrected_axis_slopes": slopes, "anchor_px": anchor, **matrix})
    return records


def run_tile():
    entries = yaml.safe_load((TILE / "manifest.yaml").read_text(encoding="utf-8"))
    entry = next(item for item in entries if item["id"] == TILE_ID)
    qa_rows = [json.loads(line) for line in (TILE / "qa.jsonl").read_text().splitlines()]
    qa = next(item for item in qa_rows if item["id"] == TILE_ID)
    final = TILE / entry["file"]
    before = TILE / "source" / f"{TILE_ID}__before_affine_r10.png"
    expected = entry.get("affine_qa", {}).get("input_sha256", entry["sha256"])
    if not before.exists():
        if sha(final) != expected:
            raise ValueError("unexpected tile input hash")
        before.write_bytes(final.read_bytes())
    if sha(before) != expected:
        raise ValueError("archived tile input hash mismatch")
    crop = qa["crop"]
    sx, sy = qa["scale_integer_x_y"]
    points = [[(x - crop[0]) * sx + 4, (y - crop[1]) * sy + 4]
              for x, y in qa["corners_raw"][:3]]
    output, corners, slopes, anchor, matrix = affine(Image.open(before).convert("RGBA"), points, 4)
    output.save(final)
    return {"id": TILE_ID, "input_archive": str(before.relative_to(TILE)),
            "input_sha256": sha(before), "output_size": list(output.size),
            "output_sha256": sha(final), "corrected_corners_px": corners,
            "corrected_axis_slopes": slopes, "anchor_px": anchor, **matrix}


def write_tile_output(record):
    path = TILE / f"{TILE_ID}.png"
    before = TILE / record["input_archive"]
    source = Image.open(before).convert("RGBA")
    _, _, shear_yx, scale_y, _, offset_y = record["forward_xy"]
    extrema = [shear_yx*x + scale_y*y for x in (0, source.width) for y in (0, source.height)]
    height = math.ceil(max(extrema)) - math.floor(min(extrema))
    inverse = (1, 0, 0, -shear_yx/scale_y, 1/scale_y, -offset_y/scale_y)
    work = source.transform((source.width, height), Image.Transform.AFFINE, inverse,
                            resample=Image.Resampling.BICUBIC, fillcolor=(0, 0, 0, 0))
    box, pad = record["work_alpha_bbox"], record["padding_px"]
    crop = work.crop(box)
    output = Image.new("RGBA", (crop.width+2*pad, crop.height+2*pad))
    output.paste(crop, (pad, pad))
    output.save(path)
    if sha(path) != record["output_sha256"]:
        raise ValueError("tile replay hash mismatch")


if __name__ == "__main__":
    result = {"buildings": run_buildings(), "tile": run_tile()}
    write_tile_output(result["tile"])
    print(json.dumps(result, ensure_ascii=False, indent=2))
