#!/usr/bin/env python3
"""AR-68 小样的等比缩放、清单登记、审样排版与真实 alpha 校验。

不生成绘画内容，不移除背景，不改写基线。所有文本按条目分节保存。
"""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
BASELINES = [
    "assets/default/baseline/map/ref_map_jianghu__ch01_base01.png",
    "assets/default/baseline/map/ref_map_dali__ch01_base01.png",
]
PAPER = (238, 228, 204, 255)
INK = (33, 31, 26, 255)
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


def write_manifest(entries):
    path = HERE / "manifest.yaml"
    path.write_text("# AR-68 第2步：22件 draft 小样及审样对照表；status: candidate 表示待作者审样，review_stage: draft 保留草稿阶段。\n", encoding="utf-8")
    for entry in entries:
        section = yaml.safe_dump([entry], allow_unicode=True, sort_keys=False, width=110)
        assert len(section.splitlines()) < 150
        with path.open("a", encoding="utf-8") as f:
            f.write(section)


def ingest():
    jobs = json.loads((HERE / "prompts.json").read_text(encoding="utf-8"))["jobs"]
    records = [json.loads(line) for line in (HERE / "generation.jsonl").read_text().splitlines() if line]
    sources = {r["id"]: r for r in records}
    entries = []
    for job in jobs:
        if job["id"] not in sources:
            continue
        record = sources[job["id"]]
        source = Path(record["source_path"])
        target = HERE / (job["id"] + ".png")
        with Image.open(source) as im:
            assert im.mode == "RGBA", f"{source}: 源图必须已经具有真实 RGBA"
            assert im.getchannel("A").getextrema()[0] == 0, f"{source}: 缺透明像素"
            original_size = im.size
            side = job["side"]
            # 保留完整画幅和原始 alpha；等比缩到目标的90%，再加透明安全边距。
            im.thumbnail((round(side * .9), round(side * .9)), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            canvas.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
            canvas.save(target, optimize=True)
        entries.append({
            "id": job["id"], "file": target.name, "category": "map", "style": "default",
            "role": "sample", "group": job["group"], "label": job["label"],
            "subject": f"{job['group']}：{job['label']}；通用古代江湖地图概念贴图（原创扩展）；不绑定书界地点或精确年代。",
            "prompt": job["prompt"],
            "negative": "无文字、伪字、印章、水印、现代元素、完整纸底、背景风景；不复制基线布局。",
            "references": BASELINES, "tool": "codex exec · image_gen; Pillow 等比缩放与透明补边",
            "model": "image_gen（独立图像后端未披露）", "effort": "not_disclosed",
            "created": record.get("created") or datetime.fromtimestamp(source.stat().st_mtime, timezone.utc).isoformat(), "source_path": str(source),
            "source_size": f"{original_size[0]}x{original_size[1]}", "source_sha256": sha(source),
            "size": f"{side}x{side}", "sha256": sha(target), "status": "candidate",
            "review_stage": "draft",
            "notes": "两张 approved 基线均作为风格输入；真透明由 image_gen 生成，保留 alpha，未抠底或用代码画主体。仅等比缩放完整原画幅并加透明边距；内含主体纸纹与淡墨渗化，整幅纸底交渲染器。建筑形制是识别性概念（待考），不作历史复原；走向、河湖轮廓不得替代 GIS 几何；道路河流不是无缝连续贴图。执行会话与图像后端型号不混同，本轮不声称后端型号已核实。",
        })
    write_manifest(entries)
    print(f"登记 {len(entries)} 件小样")


def font(size):
    return ImageFont.truetype(FONT, size)


def fitted(im, box):
    out = im.copy()
    out.thumbnail(box, Image.Resampling.LANCZOS)
    return out


def text(draw, xy, value, size=26, fill=INK):
    draw.text(xy, value, font=font(size), fill=fill)


def plate(draw, box, color=PAPER):
    draw.rounded_rectangle(box, radius=12, fill=color)


def compose():
    entries = yaml.safe_load((HERE / "manifest.yaml").read_text(encoding="utf-8"))
    samples = [e for e in entries if e.get("role") == "sample"]
    assert len(samples) == 22, "对照表必须包含完整22件小样"
    groups = list(dict.fromkeys(e["group"] for e in samples))
    width, header, row_height, margin = 2400, 600, 340, 24
    height = header + len(groups) * row_height + 120
    sheet = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    plate(draw, (margin, margin, width - margin, 146))
    text(draw, (54, 39), "江湖大地图 · 水墨贴图小样", 44)
    text(draw, (55, 98), "AR-68 第2步 / 22件 / draft待作者审样 / 图内纸纹，图外真透明", 26)
    for i, path in enumerate(BASELINES):
        x = margin + i * 1180
        plate(draw, (x, 165, x + 1155, 577))
        text(draw, (x + 25, 179), ("已审基线：江湖总图", "已审基线：大理")[i], 28)
        with Image.open(ROOT / path) as im:
            thumb = fitted(im.convert("RGBA"), (1120, 340))
            sheet.alpha_composite(thumb, (x + (1155 - thumb.width) // 2, 225))
    for row, group in enumerate(groups):
        y = header + row * row_height
        plate(draw, (margin, y, width - margin, y + row_height - 12))
        text(draw, (45, y + 19), group, 29)
        batch = [e for e in samples if e["group"] == group]
        text(draw, (45, y + 64), f"{len(batch)} 件", 24)
        for col, entry in enumerate(batch):
            x, top, tile = 230 + col * 355, y + 12, 270
            for gy in range(0, tile, 18):
                for gx in range(0, tile, 18):
                    color = PAPER if (gx // 18 + gy // 18) % 2 == 0 else (228, 218, 194, 255)
                    draw.rectangle((x + gx, top + gy, x + min(gx + 17, tile - 1), top + min(gy + 17, tile - 1)), fill=color)
            with Image.open(HERE / entry["file"]) as im:
                thumb = fitted(im, (tile, tile))
                sheet.alpha_composite(thumb, (x + (tile - thumb.width) // 2, top + (tile - thumb.height) // 2))
                # 小幅深底预览便于审查纸色边晕；底色仅属于对照表。
                draw.rectangle((x + 265, top + 172, x + 338, top + 245), fill=(66, 73, 70, 255))
                dark = fitted(im, (72, 72))
                sheet.alpha_composite(dark, (x + 266, top + 173))
            text(draw, (x, y + 283), entry["label"] + " · " + entry["size"], 22)
            text(draw, (x, y + 311), entry["id"].replace("map_kit_", "").replace("ico_", ""), 16)
    y = height - 101
    plate(draw, (margin, y, width - margin, height - margin))
    text(draw, (49, y + 11), "浅格与右侧深底小图仅供透明叠放审查；贴图文件无底色、无文字。缩略图展示笔墨，非最终地图比例。", 25)
    text(draw, (49, y + 45), "本轮只审样：墨色 / 水域晕染 / 聚落四级 / 标记识别；未接GIS与坐标，未批准生产。", 24)
    path = HERE / "_contact_sheet.png"
    sheet.save(path, optimize=True)
    entry = {
        "id": "map_kit_contact_sheet_01", "file": path.name, "category": "map", "style": "default",
        "role": "contact_sheet", "subject": "22件小样按品类分行，并列两张已审基线；仅供作者审样。",
        "prompt": "Pillow排版；照manifest顺序、九个品类分行，中文品类名和尺寸由系统字体绘制；每图浅格底与深底小图检查alpha；无新增AI绘画。",
        "negative": "不回写基线，不将审样底色或文字写入贴图，不作为生产地图。",
        "references": BASELINES + [str((HERE / e['file']).relative_to(ROOT)) for e in samples],
        "tool": "Pillow · build_review.py", "model": "not_applicable（本地排版，无生成模型）",
        "effort": "not_applicable", "created": now(), "source_path": str(Path(__file__).resolve()),
        "size": f"{width}x{height}", "sha256": sha(path), "status": "candidate",
        "review_stage": "draft",
        "notes": "RGBA，四角及外缘alpha=0；内层宣纸色审样板、浅格与深底小图为可见排版内容。标签只在本表；所有22件原贴图无字。对照表尺寸例外，不是512/1024的可用贴图。",
    }
    write_manifest(samples + [entry])
    print(f"对照表 {width}x{height}，9行，22件小样，另有2张基线缩略图")


def check():
    entries = yaml.safe_load((HERE / "manifest.yaml").read_text(encoding="utf-8"))
    expected = json.loads((HERE / "prompts.json").read_text(encoding="utf-8"))["jobs"]
    required = "id file category style subject prompt negative references tool model effort created source_path size sha256 status review_stage notes".split()
    samples = [e for e in entries if e.get("role") == "sample"]
    assert {e["id"] for e in samples} == {j["id"] for j in expected}
    assert len(samples) == 22 and len(entries) == 23
    assert len({e["id"] for e in entries}) == len(entries)
    assert {e["file"] for e in entries} == {p.name for p in HERE.glob("*.png")}
    metrics = []
    for entry in entries:
        assert all(entry.get(k) for k in required), entry["id"]
        assert entry["status"] == "candidate", entry["id"]
        assert entry["review_stage"] == "draft", entry["id"]
        assert all((ROOT / r).is_file() for r in entry["references"])
        datetime.fromisoformat(entry["created"].replace("Z", "+00:00"))
        path = HERE / entry["file"]
        assert sha(path) == entry["sha256"], path
        with Image.open(path) as im:
            im.verify()
        with Image.open(path) as im:
            assert im.format == "PNG" and im.mode == "RGBA", path
            assert entry["size"] == f"{im.width}x{im.height}", path
            assert min(im.size) >= 512, path
            if entry["role"] == "sample":
                assert im.size in ((512, 512), (1024, 1024)), path
            a = im.getchannel("A")
            assert a.getextrema()[0] == 0 and a.getextrema()[1] > 0, path
            corners = [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]
            assert all(a.getpixel(p) == 0 for p in corners), path
            edges = [(0, 0, im.width, 1), (0, im.height - 1, im.width, im.height),
                     (0, 0, 1, im.height), (im.width - 1, 0, im.width, im.height)]
            assert all(a.crop(box).getextrema() == (0, 0) for box in edges), path
            hist = a.histogram()
            assert sum(hist[1:]) > 256, path
            if entry["role"] == "sample":
                assert sum(hist[1:255]) > 0, path
            metrics.append({"id": entry["id"], "size": entry["size"], "rgba": True,
                            "corner_alpha": [0, 0, 0, 0], "edge_alpha": 0,
                            "zero_alpha_percent": round(hist[0] * 100 / (im.width * im.height), 2),
                            "semi_alpha_pixels": sum(hist[1:255]), "sha256": entry["sha256"]})
    baseline_manifest = yaml.safe_load((ROOT / "assets/default/baseline/map/manifest.yaml").read_text())
    hashes = {e["file"]: e["sha256"] for e in baseline_manifest}
    assert all(sha(ROOT / p) == hashes[Path(p).name] for p in BASELINES), "基线发生变化"
    path = HERE / "validation.jsonl"
    path.write_text("", encoding="utf-8")
    for metric in metrics:
        with path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(metric, ensure_ascii=False) + "\n")
    print("PASS: 22件小样 + 1张对照表；字段/尺寸/hash/真实RGBA/四角及全外缘透明/基线hash全部通过")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("ingest", "compose", "check"))
    action = parser.parse_args().action
    {"ingest": ingest, "compose": compose, "check": check}[action]()
