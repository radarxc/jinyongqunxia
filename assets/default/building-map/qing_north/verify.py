#!/usr/bin/env python3
"""Read-only final manifest QA; --output optionally stores compact JSON (geometry is advisory)."""
import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

BASE = Path(__file__).resolve().parent
REQUIRED = ("id", "file", "category", "style", "subject", "prompt", "negative", "references", "tool", "model",
            "effort", "created", "source_path", "size", "sha256", "status", "notes")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def geometry_check(entry):
    geometry = entry.get("geometry_qa", {})
    corners = geometry.get("final_corners_px", geometry.get("source_corners_px", {}))
    try:
        left, front, right = (corners[name] for name in ("left", "front", "right"))
        w, h = entry["building"]["footprint"]
        assert left[0] < front[0] < right[0] and w > 0 and h > 0
        slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
        ratio = (front[0]-left[0])/(right[0]-front[0])
        error = abs(ratio/(w/h)-1)
        repaired = "final_corners_px" in geometry
        axis_pass = (all(0.4 <= abs(slope) <= 0.62 for slope in slopes) if repaired else
                     abs(slopes[0]-0.5) <= 0.03 and abs(slopes[1]+0.5) <= 0.03)
        ratio_tolerance = 0.3 if repaired else 0.1
        result = {"measured_axis_slopes": slopes,
                  "axis_range": [0.4, 0.62] if repaired else [0.47, 0.53], "axis_pass": axis_pass,
                  "measured_width_depth_ratio": ratio, "expected_width_depth_ratio": w/h,
                  "ratio_relative_error": error, "ratio_tolerance": ratio_tolerance,
                  "ratio_pass": error <= ratio_tolerance}
        warnings = []
        if not axis_pass:
            warnings.append("人工底边测点斜率超出本条登记阈值；仍为candidate。")
        if error > ratio_tolerance:
            warnings.append(f"底面w:h相对误差超过{ratio_tolerance:.0%}阈值。")
        for key in ("axis_pass", "ratio_pass"):
            if key in geometry and geometry[key] != result[key]:
                warnings.append(f"manifest的{key}与测点重算不一致。")
        return result, warnings
    except (KeyError, TypeError, ValueError, ZeroDivisionError, AssertionError):
        return {"measurable": False}, ["缺少有效L/F/R测点；无法核对近似2:1几何。"]


def check_entry(base, entry):
    errors, warnings = [], []
    asset_id = entry.get("id", "<missing>")
    result = {"id": asset_id}
    for key in REQUIRED:
        if key not in entry or entry[key] is None or entry[key] == "":
            errors.append(f"缺少必填字段：{key}")
    if entry.get("status") not in ("candidate", "approved", "rejected"):
        errors.append("status非法")
    path = base / str(entry.get("file", ""))
    try:
        with Image.open(path) as opened:
            opened.verify()
        with Image.open(path) as im:
            width, height = im.size
            result.update({"size": [width, height], "mode": im.mode, "format": im.format})
            if im.format != "PNG" or im.mode != "RGBA":
                errors.append("必须为PNG真RGBA")
            if min(width, height) < 256:
                errors.append("短边不足256px")
            declared = str(entry.get("size", "")).replace("×", "x").replace(" ", "")
            if declared != f"{width}x{height}":
                errors.append("尺寸声明不一致")
            if im.mode == "RGBA":
                alpha = im.getchannel("A")
                result["alpha_extrema"] = list(alpha.getextrema())
                if result["alpha_extrema"][0] != 0 or result["alpha_extrema"][1] == 0:
                    errors.append("必须同时含透明像素和非透明主体")
                sides = ((0,0,width,1),(0,0,1,height),(0,height-1,width,height),(width-1,0,width,height))
                result["border_alpha_max"] = max(alpha.crop(side).getextrema()[1] for side in sides)
                if result["border_alpha_max"] != 0:
                    errors.append("四边有非透明像素，轮廓可能裁切")
            anchor = entry.get("building", {}).get("anchor", [])
            if len(anchor) != 2 or not all(isinstance(x, (int,float)) and math.isfinite(x) for x in anchor):
                errors.append("anchor不是有限数值坐标")
            elif not (0 <= anchor[0] < width and 0 <= anchor[1] < height):
                errors.append("anchor超出画布")
        result["sha256"] = sha(path)
        if result["sha256"] != entry.get("sha256"):
            errors.append("最终PNG哈希不一致")
    except (OSError, ValueError, TypeError) as exc:
        errors.append(f"最终PNG不可验证：{exc}")
    processing = entry.get("processing", {})
    archive = base / processing.get("source_archive", f"sources/{asset_id}.png")
    declared_source = entry.get("source_sha256") or processing.get("source_sha256")
    try:
        result["source_sha256"] = sha(archive)
        if not declared_source or result["source_sha256"] != declared_source:
            errors.append("原始PNG归档哈希缺失或不一致")
        if processing.get("source_sha256") and processing["source_sha256"] != result["source_sha256"]:
            errors.append("processing中的原图哈希不一致")
        with Image.open(archive) as source:
            if source.mode != "RGBA":
                errors.append("原始PNG不是RGBA")
    except (OSError, TypeError) as exc:
        errors.append(f"原始PNG归档不可验证：{exc}")
    metadata = entry.get("metadata")
    if not metadata or not (base / metadata).is_file():
        errors.append("metadata文件缺失")
    result["geometry_qa"], geometric_warnings = geometry_check(entry)
    result.update({"errors": errors, "warnings": warnings + geometric_warnings, "binary_pass": not errors})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, help="optional compact JSON path; default stdout only")
    args = parser.parse_args()
    data = yaml.safe_load((BASE / "manifest.yaml").read_text(encoding="utf-8"))
    entries = data.get("assets", []) if isinstance(data, dict) else data
    assert isinstance(entries, list), "manifest must be a list or {assets: [...]}"
    results = [check_entry(BASE, entry) for entry in entries]
    ids = [entry.get("id") for entry in entries]
    duplicate_ids = sorted({key for key in ids if ids.count(key) > 1})
    passed = all(item["binary_pass"] for item in results) and not duplicate_ids
    report = {"checked_at": datetime.now(timezone.utc).isoformat(), "count": len(results), "binary_pass": passed,
              "duplicate_ids": duplicate_ids, "geometry_warning_assets": sum(bool(item["warnings"]) for item in results),
              "note": "透明/尺寸/哈希/锚点范围校验不等于精确投影或历史形制验收；四向与实高仍待后续。", "assets": results}
    output = json.dumps(report, ensure_ascii=False, separators=(",", ":")) + "\n"
    if args.output:
        args.output.write_text(output, encoding="utf-8")
    print(output, end="")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
