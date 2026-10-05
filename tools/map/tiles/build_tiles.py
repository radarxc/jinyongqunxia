#!/usr/bin/env python3
"""Deterministic bitmap postprocessing/review assembly; never draws asset subjects.

ingest requires external image_gen logs; contact works from repository assets.
Dependencies: Pillow, numpy, PyYAML. All intermediate files stay outside assets.
"""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw, ImageFont

from check_tiles import measured_width

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "assets/default/map/tiles"
PAPER = np.array([238, 228, 204], dtype=float)
NEGATIVE = "无文字、伪字、印章、水印、边框、中心构图、具体物件、现代元素；不复制参考地理布局。"
LABELS = {"water": "水面", "lake": "湖面", "plain": "平原", "grassland": "草原",
          "desert": "沙漠", "plateau": "高原", "coast": "海岸线", "lakeshore": "湖岸",
          "river": "河流", "road": "道路", "region": "区域边界"}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def wrap_blend(a, axis, band):
    """Cosine-taper correction in opposing edge bands, leaving centre untouched.

    Average matching distances from the two opposite edges. At distance zero
    both get exactly the same pixels; correction is zero beyond the band.
    """
    b = np.moveaxis(a.copy(), axis, 0)
    for d in range(band):
        t = 0.5 * (1 + np.cos(np.pi * d / (band - 1)))
        left, right = b[d].copy(), b[-1 - d].copy()
        mean = (left + right) / 2
        b[d], b[-1 - d] = left * (1 - t) + mean * t, right * (1 - t) + mean * t
    return np.moveaxis(b, 0, axis)


def premultiply(a):
    b = a.astype(float).copy()
    b[..., :3] *= b[..., 3:4] / 255
    return b


def unpremultiply(a):
    b = a.copy()
    b[..., :3] *= 255 / np.maximum(b[..., 3:4], 1e-9)
    b = np.round(np.clip(b, 0, 255)).astype(np.uint8)
    b[b[..., 3] == 0, :3] = 0
    return b


def process_tile(source, kind):
    raw = np.array(source.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)).astype(float)
    # Material is deliberately faint. Uniform grading preserves generated marks.
    strength = 0.32 if kind == "water" else 0.22 if kind == "lake" else 0.38
    raw[..., :3] = PAPER * (1 - strength) + raw[..., :3] * strength
    raw[..., 3] = 255
    a = wrap_blend(wrap_blend(raw, 1, 64), 0, 64)
    a = np.round(np.clip(a, 0, 255)).astype(np.uint8)
    return Image.fromarray(a), {"target_size": [512, 512], "paper_strength": strength,
                               "wrap_band_px": 64, "axes": [1, 0]}


def process_strip(source, spec):
    if source.mode != "RGBA":
        raise ValueError(f"{spec['id']}: generated source has no true RGBA alpha")
    a = np.array(source)
    occupied = np.sum(a[..., 3] >= 32, axis=1) > a.shape[1] * 0.03
    rows = np.flatnonzero(occupied)
    if not rows.size:
        raise ValueError("generated source has no brush")
    y0, y1 = max(0, int(rows[0]) - 8), min(a.shape[0], int(rows[-1]) + 9)
    crop = source.crop((0, y0, source.width, y1))
    nominal = measured_width(np.array(crop))
    target = spec["target_width"]
    if spec["kind"] == "coast":
        target = 24 if "_xi_" in spec["id"] else 48
    elif spec["kind"] == "lakeshore":
        target = 20 if "_xi_" in spec["id"] else 40
    height = max(2, round(crop.height * target / max(nominal, 1)))
    if height > 112:
        raise ValueError("brush too tall for safe transparent margins")
    resized = crop.resize((1024, height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (1024, 128))
    offset = (128 - height) // 2
    canvas.paste(resized, (0, offset))
    ink = np.array(canvas)
    # Very low-alpha resampling can amplify irrelevant RGB into bright fringes.
    # Limit only those pixels' chroma; alpha and the main brush stay untouched.
    rgb = ink[..., :3].astype(float)
    span = np.ptp(rgb, axis=-1, keepdims=True)
    mean = rgb.mean(axis=-1, keepdims=True)
    muted = mean + (rgb - mean) * np.minimum(1, 48 / np.maximum(span, 1))
    fringe = (ink[..., 3] > 0) & (ink[..., 3] < 32)
    ink[fringe, :3] = np.round(muted[fringe]).astype(np.uint8)
    b = premultiply(ink)
    # Blend premultiplied RGB and alpha together to avoid dark join fringes.
    b = wrap_blend(b, 1, 128)
    result = unpremultiply(b)
    result[[0, -1], :, :] = 0
    return Image.fromarray(result), {"crop_box": [0, y0, source.width, y1],
                                    "resized_size": [1024, height], "offset_y": offset,
                                    "wrap_band_px": 128, "target_width_px": target,
                                    "width_px": measured_width(result),
                                    "fringe_alpha_below": 32, "fringe_chroma_cap": 48}


def ingest(logs):
    specs = json.loads((logs / "prompts.json").read_text())
    records = {r["id"]: r for r in map(json.loads, (logs / "generation.jsonl").read_text().splitlines())}
    entries = []
    for spec in specs:
        raw = logs / (spec["id"] + ".png")
        with Image.open(raw) as source:
            source_size = f"{source.width}x{source.height}"
            im, recipe = process_tile(source, spec["kind"]) if spec["role"] == "tile" else process_strip(source, spec)
        path = OUT / raw.name
        im.save(path)
        refs = [str(Path(r).relative_to(ROOT)) for r in spec["references"]]
        note = ("image_gen 独立生成；两张已审基线与同类 kit 作为风格输入。只后处理生成像素，不用代码绘制主体。"
                + ("完整画幅缩至512方图，与宣纸色按记载比例匀混降低对比；两轴64px余弦渐变对边平均，中心384×384未做接缝修补。"
                   if spec["role"] == "tile" else
                   "保留生成alpha；按有效墨迹裁掉上下空白与离散边缘噪点，重采样归一粗细、透明补边；alpha<32的边缘RGB通道跨度钳至48，压制重采样杂色；左右128px预乘RGB/alpha余弦渐变平均，上下外缘置零。")
                + "recipe记录可复跑参数；status为candidate，后端型号未披露。")
        entry = {"id": spec["id"], "file": path.name, "category": "map", "style": "default",
                 "role": spec["role"], "label": spec["label"], "subject": f"{spec['label']}；AR-83通用笔墨质感（原创扩展），不绑定地理或书界。",
                 "prompt": spec["prompt"], "negative": NEGATIVE, "references": refs,
                 "tool": "codex exec · image_gen; Pillow/numpy 无缝化后处理", "model": "image_gen（独立图像后端未披露）",
                 "effort": "not_disclosed", "created": records[spec["id"]]["created"],
                 "source_path": records[spec["id"]]["source_path"], "source_size": source_size,
                 "source_sha256": digest(raw), "size": f"{im.width}x{im.height}",
                 "sha256": digest(path), "status": "candidate", "notes": note, "recipe": recipe}
        entry[spec["role"]] = ({"kind": spec["kind"], "alpha": "opaque"} if spec["role"] == "tile" else
                               {"kind": spec["kind"], "width_px": recipe["width_px"], "water_side": spec["water_side"]})
        entries.append(entry)
    # Keep each write comfortably below 150 lines; save one entry per append.
    with (OUT / "manifest.yaml").open("w", encoding="utf-8") as f:
        for entry in entries:
            f.write(yaml.safe_dump([entry], allow_unicode=True, sort_keys=False, width=110))
    print(f"Ingested {len(entries)} independently generated materials")


def font(size):
    for path in ("/System/Library/Fonts/Hiragino Sans GB.ttc", "/System/Library/Fonts/STHeiti Light.ttc",
                 "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"):
        if Path(path).is_file():
            return ImageFont.truetype(path, size)
    raise FileNotFoundError("Contact sheet needs a Chinese font: Hiragino Sans GB / STHeiti / Noto Sans CJK")


def curve_preview(im):
    """Resample the existing strip along a sine path; no brush is synthesized."""
    width, height = 1024, 180
    xx = np.arange(width)
    centre = 90 + 32 * np.sin(2 * np.pi * xx / (width - 1))
    slope = np.gradient(centre)
    arc = np.cumsum(np.sqrt(1 + slope ** 2))
    yy, gridx = np.mgrid[:height, :width]
    normal = (yy - centre[None, :]) / np.sqrt(1 + slope[None, :] ** 2)
    srcx = (arc[None, :] + normal * slope[None, :]) % im.width
    srcy = normal + im.height / 2
    a = premultiply(np.array(im))
    x0 = np.floor(srcx).astype(int) % im.width
    y0 = np.floor(np.clip(srcy, 0, im.height - 1)).astype(int)
    x1, y1 = (x0 + 1) % im.width, np.minimum(y0 + 1, im.height - 1)
    tx, ty = (srcx - np.floor(srcx))[..., None], (srcy - np.floor(srcy))[..., None]
    b = (a[y0, x0] * (1 - tx) + a[y0, x1] * tx) * (1 - ty)
    b += (a[y1, x0] * (1 - tx) + a[y1, x1] * tx) * ty
    b[(srcy < 0) | (srcy > im.height - 1)] = 0
    return Image.fromarray(unpremultiply(b))


def contact():
    entries = yaml.safe_load((OUT / "manifest.yaml").read_text())
    entries = [e for e in entries if e.get("role") != "contact_sheet"]
    sheet = Image.new("RGB", (2400, 5980), tuple(PAPER.astype(int)))
    draw = ImageDraw.Draw(sheet)
    draw.text((32, 16), "江湖大地图 · 水墨贴片 AR-83 · candidate", font=font(36), fill="#211f1a")
    draw.text((32, 66), "12张填充 / 10条笔触；单件与重复实图，曲线只对已有像素重采样。", font=font(23), fill="#554c3e")
    for i, name in enumerate(("ref_map_jianghu__ch01_base01", "ref_map_dali__ch01_base01")):
        with Image.open(ROOT / "assets/default/baseline/map" / (name + ".png")) as base:
            thumb = base.convert("RGB")
            thumb.thumbnail((660, 270))
            sheet.paste(thumb, (230 + 1190 * i, 128))
        draw.text((32 + 1190 * i, 112), "已审江湖总图" if i == 0 else "已审大理图", font=font(22), fill="#554c3e")
    def paste_rgba(im, x, y):
        sheet.paste(im, (x, y), im)
    y = 430
    for kind in ("water", "lake", "plain", "grassland", "desert", "plateau"):
        draw.text((32, y), LABELS[kind] + " · 每张右侧为2×2平铺", font=font(27), fill="#211f1a")
        for i, entry in enumerate(e for e in entries if e.get("tile", {}).get("kind") == kind):
            x = 32 + 1190 * i
            im = Image.open(OUT / entry["file"]).convert("RGBA")
            draw.text((x, y + 44), entry["file"], font=font(20), fill="#554c3e")
            sheet.paste(im.convert("RGB").resize((256, 256)), (x, y + 104))
            repeat = Image.fromarray(np.tile(np.array(im), (2, 2, 1))).convert("RGB")
            sheet.paste(repeat.resize((384, 384)), (x + 340, y + 84))
            draw.text((x, y + 374), "512×512 · RGBA不透明", font=font(20), fill="#554c3e")
            draw.text((x + 752, y + 150), "独立变体\n淡墨底纹\n均匀质感", font=font(21), fill="#554c3e", spacing=12)
        y += 480
    for kind in ("coast", "lakeshore", "river", "road", "region"):
        draw.text((32, y), LABELS[kind] + " · 单条 / 三连 / 曲线路径", font=font(27), fill="#211f1a")
        for i, entry in enumerate(e for e in entries if e.get("strip", {}).get("kind") == kind):
            x = 32 + 1190 * i
            config = entry["strip"]
            im = Image.open(OUT / entry["file"]).convert("RGBA")
            draw.text((x, y + 42), f"{entry['file']} · 宽{config['width_px']}px", font=font(20), fill="#554c3e")
            draw.text((x, y + 70), f"1024×128 · 水侧={config['water_side']}", font=font(19), fill="#554c3e")
            paste_rgba(im, x, y + 90)
            triple = Image.fromarray(np.tile(np.array(im), (1, 3, 1))).resize((1024, 128), Image.Resampling.LANCZOS)
            paste_rgba(triple, x, y + 198)
            draw.text((x, y + 198), "三连：横向缩至1/3，高度1:1", font=font(18), fill="#554c3e")
            draw.text((x, y + 292), "曲线示意", font=font(18), fill="#554c3e")
            paste_rgba(curve_preview(im).resize((860, 151), Image.Resampling.LANCZOS), x, y + 292)
            # A small dark-ground view exposes alpha fringes without altering art.
            dark = Image.new("RGBA", (200, 70), (55, 61, 55, 255))
            small = im.resize((200, 70))
            dark.alpha_composite(small)
            draw.text((x + 900, y + 340), "深底alpha", font=font(18), fill="#554c3e")
            sheet.paste(dark.convert("RGB"), (x + 900, y + 366))
        y += 500
    path = OUT / "_contact_sheet.png"
    sheet.save(path)
    refs = ["assets/default/baseline/map/ref_map_jianghu__ch01_base01.png",
            "assets/default/baseline/map/ref_map_dali__ch01_base01.png"] + [str((OUT / e["file"]).relative_to(ROOT)) for e in entries]
    entry = {"id": "map_tiles_contact_01", "file": path.name, "category": "map", "style": "default",
             "role": "contact_sheet", "subject": "AR-83品类对照表与平铺/三连/曲线审样（原创扩展）",
             "prompt": "按六类填充、五类笔触分行；两张基线在上；每件展示单图与2×2/三连、曲线和深底alpha预览。",
             "negative": "不供运行时取件；底色与审样文字不属于贴片。", "references": refs,
             "tool": "tools/map/tiles/build_tiles.py contact · Pillow/numpy 组合既有素材",
             "model": "deterministic bitmap composition (not generation)", "effort": "not_applicable",
             "created": datetime.now(timezone.utc).isoformat(), "source_path": "tools/map/tiles/build_tiles.py",
             "size": f"{sheet.width}x{sheet.height}", "sha256": digest(path), "status": "candidate",
             "notes": "曲线路径按弧长和法线双线性重采样原笔触；非GIS落位，不代表拐角、分岔与闭环已验收。"}
    with (OUT / "manifest.yaml").open("w", encoding="utf-8") as f:
        for item in entries + [entry]:
            f.write(yaml.safe_dump([item], allow_unicode=True, sort_keys=False, width=110))
    print(f"Contact sheet: {sheet.size}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("ingest", "contact"))
    parser.add_argument("--logs", type=Path)
    args = parser.parse_args()
    if args.action == "ingest":
        if args.logs is None:
            parser.error("ingest needs --logs pointing to the external prompts/source records")
        ingest(args.logs)
    else:
        contact()


if __name__ == "__main__":
    main()
