#!/usr/bin/env python3
"""Replay selected sources plus recorded review-10 affine corrections."""
import argparse
import hashlib
import io
import json
import math
from pathlib import Path

import yaml
from PIL import Image

BASE = Path(__file__).resolve().parent
PREFIX = "bld_kit_qing_north_"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def replay(base, entry):
    processing = entry["processing"]
    archive = (base / processing["source_archive"]).resolve()
    if not archive.is_relative_to(base.resolve()):
        raise ValueError("source archive must be inside this kit")
    raw = archive.read_bytes()
    if sha(raw) != processing["source_sha256"] or sha(raw) != entry["source_sha256"]:
        raise ValueError("selected source hash mismatch; never fall back to an external old image")
    with Image.open(io.BytesIO(raw)) as opened:
        if opened.mode != "RGBA" or list(opened.size) != processing["source_size"]:
            raise ValueError("source mode or size mismatch")
        image = opened.copy()
    box = processing["crop_box"]
    if list(image.getchannel("A").getbbox()) != box:
        raise ValueError("crop must preserve the entire nonzero-alpha source")
    geometry = entry["geometry_qa"]
    corners = geometry.get("source_corners_px")
    if corners is None and entry.get("affine_qa"):
        # Recover pre-affine normalized points by inverting the recorded matrix,
        # then map those points back through crop/resize to the selected source.
        final = geometry["final_corners_px"]
        affine = entry["affine_qa"]
        _, _, shear_yx, scale_y, _, offset_y = affine["forward_xy"]
        work_x, work_y, _, _ = affine["work_alpha_bbox"]
        pad = affine["padding_px"]
        normalized = {}
        for name in ("left", "front", "right"):
            x = final[name][0] + work_x - pad
            transformed_y = final[name][1] + work_y - pad
            y = (transformed_y - shear_yx * x - offset_y) / scale_y
            normalized[name] = [x, y]
        box = processing["crop_box"]
        sx, sy = processing["rounded_effective_scale"]
        ox, oy = processing["paste_offset"][:2]
        corners = {name: [(point[0] - ox) / sx + box[0],
                          (point[1] - oy) / sy + box[1]]
                   for name, point in normalized.items()}
    left, right = corners["left"], corners["right"]
    w, h = entry["building"]["footprint"]
    scale = 32 * (w + h) / (right[0] - left[0])
    if abs(scale - processing["uniform_scale_requested"]) > 1e-10:
        raise ValueError("selected measurements and normalization scale disagree")
    crop = image.crop(box)
    size = [max(1, round(crop.width * scale)), max(1, round(crop.height * scale))]
    if size != processing["resized_size"]:
        raise ValueError("resize is not the recorded uniform scale with integer rounding")
    sx, sy = size[0] / crop.width, size[1] / crop.height
    offset = processing["paste_offset"][:2]
    canvas_size = (size[0] + 2 * offset[0], size[1] + 2 * offset[1]) if entry.get("affine_qa") else tuple(
        map(int, entry["size"].replace("×", "x").split("x")))
    if not entry.get("affine_qa") and any(
            offset[i] < 0 or offset[i] + size[i] > canvas_size[i] for i in (0, 1)):
        raise ValueError("paste would clip the selected image")
    center = [(left[i] + right[i]) / 2 for i in (0, 1)]
    anchor = [(center[0] - box[0]) * sx + offset[0], (center[1] - box[1]) * sy + offset[1]]
    if not entry.get("affine_qa") and max(
            abs(a - b) for a, b in zip(anchor, entry["building"]["anchor"])) > 0.001:
        raise ValueError("anchor does not follow actual crop, rounded resize and offset")
    metadata = yaml.safe_load((base / entry["metadata"]).read_text(encoding="utf-8"))
    for key in ("building", "processing", "geometry_qa"):
        if metadata[key] != entry[key]:
            raise ValueError(f"metadata {key} differs from selected manifest")
    cached = base / "meta" / f"{entry['id']}.entry.json"
    cached_entry = json.loads(cached.read_text(encoding="utf-8"))
    replay_entry = {key: value for key, value in entry.items() if key != "historical_references"}
    if cached_entry != replay_entry:
        raise ValueError("cached manifest entry is stale")
    canvas = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    canvas.paste(crop.resize(size, Image.Resampling.LANCZOS), tuple(offset))
    affine = entry.get("affine_qa")
    if affine:
        archive = base / affine["input_archive"]
        if sha(archive.read_bytes()) != affine["input_sha256"]:
            raise ValueError("affine input archive hash mismatch")
        canvas = Image.open(archive).convert("RGBA")
        _, _, shear_yx, scale_y, _, offset_y = affine["forward_xy"]
        extrema = [shear_yx*x + scale_y*y for x in (0, canvas.width) for y in (0, canvas.height)]
        work_h = math.ceil(max(extrema)) - math.floor(min(extrema))
        inverse = (1, 0, 0, -shear_yx/scale_y, 1/scale_y, -offset_y/scale_y)
        canvas = canvas.transform((canvas.width, work_h), Image.Transform.AFFINE, inverse,
                                  resample=Image.Resampling.BICUBIC, fillcolor=(0, 0, 0, 0))
        box = affine["work_alpha_bbox"]
        crop = canvas.crop(box)
        pad = affine["padding_px"]
        canvas = Image.new("RGBA", (crop.width+2*pad, crop.height+2*pad))
        canvas.paste(crop, (pad, pad))
    buffer = io.BytesIO()
    canvas.save(buffer, format="PNG")
    output = buffer.getvalue()
    if sha(output) != entry["sha256"]:
        raise ValueError("replay hash differs; inspect Pillow/encoder before changing approved provenance")
    final = base / entry["file"]
    exists = final.is_file()
    matches = exists and sha(final.read_bytes()) == entry["sha256"]
    return output, {"id": entry["id"], "size": list(canvas.size), "source_sha256": sha(raw),
                    "replay_sha256": sha(output), "anchor_px": entry["building"]["anchor"],
                    "existing_file_matches": matches, "replay_matches_manifest": True}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--id", action="append", help="selected full ID or suffix; repeatable")
    parser.add_argument("--write", action="store_true", help="restore only PNGs already matching the recorded hash")
    args = parser.parse_args()
    entries = yaml.safe_load((BASE / "manifest.yaml").read_text(encoding="utf-8"))
    selected = {x if x.startswith(PREFIX) else PREFIX + x for x in args.id} if args.id else None
    known = {entry["id"] for entry in entries}
    if selected and selected - known:
        parser.error("unknown selected ID: " + ", ".join(sorted(selected - known)))
    prepared, results = [], []
    for entry in entries:
        if selected is not None and entry["id"] not in selected:
            continue
        try:
            output, result = replay(BASE, entry)
            prepared.append((BASE / entry["file"], output, result))
            results.append(result)
        except (OSError, ValueError, KeyError, TypeError, ZeroDivisionError) as exc:
            results.append({"id": entry["id"], "error": str(exc)})
    passed = all("error" not in result for result in results)
    if args.write and passed:
        for path, output, result in prepared:
            if not result["existing_file_matches"]:
                path.write_bytes(output)
            result["restored"] = not result["existing_file_matches"]
    if not args.write:
        passed = passed and all(result.get("existing_file_matches", False) for result in results)
    print(json.dumps({"count": len(results), "passed": passed, "write": args.write, "assets": results,
                      "note": "Uses local selected archives only. Never changes manifest, metadata, history or alpha."},
                     ensure_ascii=False, separators=(",", ":")))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
