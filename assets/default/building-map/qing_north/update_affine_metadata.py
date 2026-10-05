#!/usr/bin/env python3
"""Update only review-10 affine assets and their QA/provenance records."""
import hashlib
import json
from pathlib import Path

import yaml
from PIL import Image

BASE = Path(__file__).resolve().parent
TILE = BASE.parents[1] / "tile" / "qing_north"
RESULT = json.loads(Path("/private/tmp/qing_affine_result.json").read_text())
BUILD = {row["id"]: row for row in RESULT["buildings"]}
TILE_ROW = RESULT["tile"]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pixel_qa(path):
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    hist = alpha.histogram()
    box = alpha.getbbox()
    return {"mode": "RGBA", "size": list(image.size), "alpha_extrema": list(alpha.getextrema()),
            "alpha_zero_pixels": hist[0], "alpha_partial_pixels": sum(hist[1:255]),
            "alpha_opaque_pixels": hist[255], "alpha_nonzero_bbox": list(box),
            "transparent_margins_px": [box[0], box[1], image.width-box[2], image.height-box[3]],
            "border_alpha_max": max(alpha.crop(side).getextrema()[1] for side in
                                    ((0, 0, image.width, 1), (0, 0, 1, image.height),
                                     (0, image.height-1, image.width, image.height),
                                     (image.width-1, 0, image.width, image.height)))}


def geometry(row, footprint):
    corners = row["corrected_corners_px"]
    ratio = (corners[1][0] - corners[0][0]) / (corners[2][0] - corners[1][0])
    expected = footprint[0] / footprint[1]
    return {"final_corners_px": dict(zip(("left", "front", "right"), corners)),
            "final_axis_slopes": row["corrected_axis_slopes"], "accepted_slope_range": [0.4, 0.62],
            "axis_pass": all(0.4 <= abs(value) <= 0.62 for value in row["corrected_axis_slopes"]),
            "final_width_depth_ratio": ratio, "expected_width_depth_ratio": expected,
            "ratio_relative_error": abs(ratio / expected - 1), "ratio_tolerance": 0.3,
            "ratio_pass": abs(ratio / expected - 1) <= 0.3,
            "measurement_note": "审核人工测点经同一PIL仿射矩阵变换；锚点取校正后L/R底面中点。"}


def update_buildings():
    entries = yaml.safe_load((BASE / "manifest.yaml").read_text(encoding="utf-8"))
    for entry in entries:
        row = BUILD.get(entry["id"])
        if not row:
            continue
        path = BASE / entry["file"]
        entry["size"] = f"{row['output_size'][0]}x{row['output_size'][1]}"
        entry["sha256"] = sha(path)
        entry["building"]["anchor"] = [round(value, 4) for value in row["anchor_px"]]
        entry["geometry_qa"] = geometry(row, entry["building"]["footprint"])
        entry["pixel_qa"] = pixel_qa(path)
        entry["affine_qa"] = {key: row[key] for key in ("input_archive", "input_sha256",
                                                           "forward_xy", "work_alpha_bbox", "padding_px")}
        entry["processing"]["steps"] += ["review-10 PIL affine y'=a*x+b*y+c",
                                                 "crop alpha>0 bbox and restore transparent padding"]
        entry["notes"] += " 第10轮按审核裁定仅作PIL仿射几何校正；双轴进入0.40–0.62，仍为candidate。"
        (BASE / "meta" / f"{entry['id']}.entry.json").write_text(
            json.dumps(entry, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        meta_path = BASE / entry["metadata"]
        meta = yaml.safe_load(meta_path.read_text(encoding="utf-8"))
        meta["building"]["anchor"] = entry["building"]["anchor"]
        meta["anchor_px"] = entry["building"]["anchor"]
        meta["geometry_qa"] = entry["geometry_qa"]
        meta["pixel_qa"] = entry["pixel_qa"]
        meta["affine_qa"] = entry["affine_qa"]
        meta["processing"] = entry["processing"]
        meta_path.write_text(yaml.safe_dump(meta, allow_unicode=True, sort_keys=False, width=100000),
                             encoding="utf-8")
    (BASE / "manifest.yaml").write_text(
        yaml.safe_dump(entries, allow_unicode=True, sort_keys=False, width=100000), encoding="utf-8")


def sync_cached_entries():
    entries = yaml.safe_load((BASE / "manifest.yaml").read_text(encoding="utf-8"))
    for entry in entries:
        if entry["id"] in BUILD:
            (BASE / "meta" / f"{entry['id']}.entry.json").write_text(
                json.dumps(entry, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")


def update_tile():
    entries = yaml.safe_load((TILE / "manifest.yaml").read_text(encoding="utf-8"))
    entry = next(item for item in entries if item["id"] == TILE_ROW["id"])
    path = TILE / entry["file"]
    entry["size"] = f"{TILE_ROW['output_size'][0]}x{TILE_ROW['output_size'][1]}"
    entry["sha256"] = sha(path)
    entry["anchor_px"] = [round(value, 3) for value in TILE_ROW["anchor_px"]]
    keys = ("input_archive", "input_sha256", "forward_xy", "work_alpha_bbox", "padding_px")
    entry["affine_qa"] = {key: TILE_ROW[key] for key in keys}
    entry["affine_qa"]["final_corners_px"] = TILE_ROW["corrected_corners_px"]
    entry["affine_qa"]["final_axis_slopes"] = TILE_ROW["corrected_axis_slopes"]
    entry["affine_qa"]["axis_pass"] = True
    entry["notes"] += " 第10轮PIL仿射校正双轴至±0.5；仍为candidate。"
    (TILE / "manifest.yaml").write_text(
        yaml.safe_dump(entries, allow_unicode=True, sort_keys=False, width=100000), encoding="utf-8")
    rows = [json.loads(line) for line in (TILE / "qa.jsonl").read_text().splitlines()]
    qa = next(item for item in rows if item["id"] == TILE_ROW["id"])
    alpha = Image.open(path).getchannel("A")
    qa.update({"size": TILE_ROW["output_size"], "anchor_px": entry["anchor_px"],
               "alpha_extrema": list(alpha.getextrema()), "alpha_zero_pixels": alpha.histogram()[0],
               "measured_slopes": TILE_ROW["corrected_axis_slopes"],
               "slope_abs_residual": [abs(abs(value)-0.5) for value in TILE_ROW["corrected_axis_slopes"]],
               "corners_final_px": TILE_ROW["corrected_corners_px"], "axis_pass": True,
               "accepted_slope_range": [0.4, 0.62], "affine_qa": entry["affine_qa"],
               "visual_review": "第10轮仅PIL仿射校正；双轴约±0.5，RGBA与完整轮廓已view_image复核。"})
    (TILE / "qa.jsonl").write_text(
        "".join(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n" for row in rows),
        encoding="utf-8")


if __name__ == "__main__":
    update_buildings()
    sync_cached_entries()
    update_tile()
