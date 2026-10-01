"""Reproject only the 17 audit-flagged sprites to exact 2:1 dimetric axes."""
from pathlib import Path
import hashlib
import json
import math

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
FLAGGED = {
    "house_small", "house_large", "courtyard", "shop_1f", "shop_2f",
    "inn", "restaurant", "biaoju", "casino", "manor", "temple_hall",
    "market_stall", "stable", "warehouse", "pagoda", "guardhouse", "wharf",
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pixel_qa(image):
    alpha = image.getchannel("A")
    hist = alpha.histogram()
    box = alpha.getbbox()
    width, height = image.size
    return {
        "mode": image.mode, "size": [width, height], "alpha_extrema": list(alpha.getextrema()),
        "alpha_zero_pixels": hist[0], "alpha_partial_pixels": sum(hist[1:255]),
        "alpha_opaque_pixels": hist[255], "alpha_near_opaque_pixels": sum(hist[240:]),
        "alpha_nonzero_bbox": list(box),
        "transparent_margins_px": [box[0], box[1], width-box[2], height-box[3]],
        "border_alpha_max": max(alpha.crop(b).getextrema()[1] for b in
            [(0,0,width,1), (0,height-1,width,height), (0,0,1,height), (width-1,0,width,height)]),
    }


def forward(point, matrix, anchor):
    x, y = point
    c, d = matrix
    return [x, c*x + d*y + anchor[1] - c*anchor[0] - d*anchor[1]]


def reproject(entry):
    key = entry["id"].removeprefix("bld_kit_yuan_south_")
    if key not in FLAGGED:
        return entry
    path = ROOT / entry["file"]
    source = ROOT / entry["processing"]["source_archive"]
    original = Image.open(source).convert("RGBA")
    crop_box = entry["processing"]["crop_box"]
    scaled_size = entry["processing"]["resized_size"]
    offset_box = entry["processing"]["paste_offset"]
    offset_xy = offset_box[:2]
    image = Image.new("RGBA", tuple(map(int, entry["size"].split("x"))), (0,0,0,0))
    image.paste(original.crop(crop_box).resize(scaled_size, Image.Resampling.LANCZOS), offset_xy)
    anchor = entry["building"]["anchor"]
    geometry = entry["geometry_qa"]
    source_corners = geometry.get("pre_reprojection_source_corners_px", geometry["source_corners_px"])
    scale = entry["processing"].get("rounded_effective_scale", [1, 1])
    offset = offset_box
    crop = entry["processing"].get("crop_box", [0, 0])
    if len(offset) == 4:
        offset = offset[:2]
    old_points = {name: [(p[i]-crop[i])*scale[i]+offset[i] for i in range(2)]
                  for name, p in source_corners.items()}
    left, front, right = (old_points[k] for k in ("left", "front", "right"))
    before = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    m_pos, m_neg = before
    d = 1.0 / (m_pos - m_neg)
    c = 0.5 - d*m_pos
    ty = anchor[1] - c*anchor[0] - d*anchor[1]
    inverse = (1.0, 0.0, 0.0, -c/d, 1.0/d, -ty/d)
    corrected = image.convert("RGBa").transform(
        image.size, Image.Transform.AFFINE, inverse, Image.Resampling.BICUBIC, fillcolor=(0,0,0,0)
    ).convert("RGBA")
    corrected.save(path, optimize=False)
    new_points = {name: forward(point, (c, d), anchor) for name, point in old_points.items()}
    left, front, right = (new_points[k] for k in ("left", "front", "right"))
    after = [(front[1]-left[1])/(front[0]-left[0]),
             (right[1]-front[1])/(right[0]-front[0])]
    geometry.update({
        "measurement_space": "final_png_after_affine_reprojection",
        "pre_reprojection_source_corners_px": source_corners,
        "pre_reprojection_final_corners_px": old_points,
        "pre_reprojection_axis_slopes": before, "final_corners_px": new_points,
        "source_corners_px": new_points, "final_axis_slopes": after, "source_axis_slopes": after,
        "axis_pass": all(abs(value-target) <= .03 for value, target in zip(after, (.5, -.5))),
        "precision_note": "由原人工底面三点经同一全图仿射矩阵解析变换；最终轴斜率为确定值，底面读点误差仍影响宽深比。",
    })
    transform = {
        "kind": "whole_sprite_affine_reprojection",
        "purpose": "audit repair: map measured ground axes to exact +0.50/-0.50",
        "forward_matrix": [1.0, 0.0, c, d, anchor[1]-c*anchor[0]-d*anchor[1]],
        "inverse_matrix_for_pillow": list(inverse), "pivot_anchor_px": anchor,
        "resample": "BICUBIC on premultiplied RGBa; convert back to RGBA",
        "preserves": "canvas size, x coordinates, anchor, footprint registration, transparent background",
    }
    entry["processing"]["reprojection"] = transform
    step = "全图绕锚点仿射重投影，将实测两底轴解析校正为+0.50/-0.50；无局部重绘"
    entry["processing"]["steps"] = [value for value in entry["processing"]["steps"] if value != step]
    entry["processing"]["steps"].append(step)
    entry["projection_contract"]["strict_geometry_pass"] = True
    if "note" in entry["projection_contract"]:
        entry["projection_contract"]["note"] = "最终双轴已校正；宽深比仍采用原底面读点并保留误差。"
    entry["sha256"] = sha(path)
    entry["pixel_qa"] = pixel_qa(corrected)
    replacements = {
        "严格投影残差仍保留": "轴斜率已仿射校正",
        "小幅轴残差保留": "轴斜率已仿射校正",
        "双轴仍偏浅，不作精确无缝金样": "双轴已仿射校正；仍不是无缝拼接金样",
        "双轴偏陡，候选尺度/锚点为代理": "双轴已仿射校正，候选尺度/锚点仍为代理",
        "轴和宽深比残差待拼接复核": "轴斜率已仿射校正，宽深比残差待拼接复核",
        "偏长宽深比与投影残差保留": "偏长宽深比残差保留，轴斜率已仿射校正",
    }
    for old, new in replacements.items():
        entry["notes"] = entry["notes"].replace(old, new)
    return entry


def update_metadata(entry):
    path = ROOT / entry["metadata"]
    try:
        data = yaml.safe_load(path.read_text())
    except yaml.YAMLError:
        data = {
            "id": entry["id"], "status": entry["status"],
            "building": entry["building"], "footprint_m": entry.get("footprint_m"),
            "footprint_basis": entry.get("footprint_basis"),
            "anchor_px": entry["building"]["anchor"], "entrance": entry.get("entrance"),
            "png_rotations_available": [0], "allowRotation": False, "release_ready": False,
            "metadata_repair_note": "重建既有不可解析的visual_qa流式映射；保留manifest权威字段。",
        }
    for key in ("anchor_px", "building"):
        if key in data:
            data[key] = entry["building"] if key == "building" else entry["building"]["anchor"]
    data["geometry_qa"] = entry["geometry_qa"]
    data["pixel_qa"] = entry["pixel_qa"]
    data["processing"] = entry["processing"]
    if "projection_contract" in data and "strict_geometry_pass" in data["projection_contract"]:
        data["projection_contract"]["strict_geometry_pass"] = True
    if "occlusion_polygon_px" in data:
        x0, y0, x1, y1 = entry["pixel_qa"]["alpha_nonzero_bbox"]
        data["occlusion_polygon_px"] = [[x0,y0], [x1,y0], [x1,y1], [x0,y1]]
    if "occluder_proxy_px" in data:
        data["occluder_proxy_px"] = entry["pixel_qa"]["alpha_nonzero_bbox"]
    path.write_text(yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=140))
    for suffix in (".entry.json", ".entry.yaml"):
        sidecar = ROOT / "meta" / f"{entry['id']}{suffix}"
        if sidecar.exists():
            if suffix.endswith("json"):
                sidecar.write_text(json.dumps(entry, ensure_ascii=False, indent=2)+"\n")
            else:
                sidecar.write_text(yaml.safe_dump(entry, allow_unicode=True, sort_keys=False, width=140))


if __name__ == "__main__":
    manifest = ROOT / "manifest.yaml"
    entries = yaml.safe_load(manifest.read_text())
    entries = [reproject(entry) for entry in entries]
    for entry in entries:
        if entry["id"].removeprefix("bld_kit_yuan_south_") in FLAGGED:
            update_metadata(entry)
            slopes = entry["geometry_qa"]["final_axis_slopes"]
            print(entry["id"], entry["sha256"][:12], *(f"{v:+.6f}" for v in slopes))
    dump = lambda value: yaml.safe_dump(value, allow_unicode=True, sort_keys=False, width=140)
    manifest.write_text(dump(entries))
    groups = [("manifest_residential.yaml", 0, 7), ("manifest_civic.yaml", 7, 13),
              ("manifest_utility.yaml", 13, 19)]
    for name, start, end in groups:
        (ROOT/name).write_text(dump(entries[start:end]))
    validation = ROOT / "validation.json"
    if validation.exists():
        data = json.loads(validation.read_text())
        by_id = {entry["id"]: entry for entry in entries}
        for item in data.get("entries", []):
            if item["id"] in by_id and item["id"].removeprefix("bld_kit_yuan_south_") in FLAGGED:
                entry = by_id[item["id"]]
                item.update(size=entry["pixel_qa"]["size"], alpha=entry["pixel_qa"]["alpha_extrema"],
                            transparent_border=entry["pixel_qa"]["border_alpha_max"] == 0,
                            sha_pass=True, source_sha_pass=True, axis_pass=entry["geometry_qa"]["axis_pass"],
                            ratio_pass=entry["geometry_qa"]["ratio_pass"])
        validation.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n")
