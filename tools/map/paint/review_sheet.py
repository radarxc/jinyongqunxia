#!/usr/bin/env python3
"""Side-by-side review sheets for the painted world map (QA only, not assets).

    python3 tools/map/paint/review_sheet.py sample east      # sample vs live map vs approved map
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from geo import ROOT  # noqa: E402

WORK = ROOT / ".agents" / "coord" / "ART-worldmap-painted"
LIVE = ROOT / "assets" / "default" / "map" / "world" / "map_world_jianghu__base01.webp"
APPROVED = ROOT / "assets" / "default" / "baseline" / "map" / "ref_map_jianghu__ch01_base01.png"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"


def _font(size: int):
    try:
        return ImageFont.truetype(FONT, size)
    except OSError as exc:  # no silent tofu
        raise SystemExit(f"CJK font missing ({FONT}): {exc}")


def panel(img: Image.Image, w: int, h: int, title: str, bg=(245, 241, 232)) -> Image.Image:
    out = Image.new("RGB", (w, h + 44), bg)
    scale = min(w / img.width, h / img.height)
    im = img.resize((max(1, int(round(img.width * scale))), max(1, int(round(img.height * scale)))), Image.Resampling.LANCZOS)
    out.paste(im, ((w - im.width) // 2, 44 + (h - im.height) // 2))
    ImageDraw.Draw(out).text((10, 8), title, fill=(60, 50, 40), font=_font(22))
    return out


def sample_sheet(name: str) -> Path:
    cfg = json.loads((HERE / "config.json").read_text(encoding="utf-8"))
    x0, y0, x1, y1 = cfg["samples"][name]["window"]
    W = cfg["canvas"]["width"]
    ours = Image.open(WORK / "sample" / f"compose_{name}.png").convert("RGB")
    live = Image.open(LIVE).convert("RGB")
    s = live.width / W
    live_crop = live.crop((int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s)))
    appr = Image.open(APPROVED).convert("RGB")
    # the old live map stretched the approved painting over the whole grid (0..512 × 0..384);
    # the same grid window in the approved painting's own pixels:
    gx0, gy0, gx1, gy1 = x0 / W * 512, y0 / W * 512, x1 / W * 512, y1 / W * 512
    ax = appr.width / 512.0
    ay = appr.height / 384.0
    appr_crop = appr.crop((int(gx0 * ax), int(gy0 * ay), int(gx1 * ax), int(gy1 * ay)))
    pw, ph = 960, 720
    panels = [
        panel(ours, pw, ph, f"新合成（GIS + 仓库水墨贴图）· 全图 4096 尺度原样裁出 {x1 - x0}×{y1 - y0}"),
        panel(live_crop, pw, ph, "现网临时底图（旧总图拉伸裁出）· 同一网格范围"),
        panel(appr_crop, pw, ph, "作者已审江湖总图 · 同一网格范围（非地理图，仅比画风）"),
    ]
    sheet = Image.new("RGB", (pw * 3 + 40, ph + 44 + 20), (245, 241, 232))
    for i, p in enumerate(panels):
        sheet.paste(p, (10 + i * (pw + 10), 10))
    out = WORK / "sample" / f"compare_{name}.jpg"
    sheet.save(out, quality=90)
    return out


def zoom_sheet(name: str, boxes) -> Path:
    ours = Image.open(WORK / "sample" / f"compose_{name}.png").convert("RGB")
    tiles = []
    for title, (bx0, by0, bx1, by1) in boxes:
        tiles.append(panel(ours.crop((bx0, by0, bx1, by1)), bx1 - bx0, by1 - by0, title))
    w = sum(t.width for t in tiles) + 10 * (len(tiles) + 1)
    h = max(t.height for t in tiles) + 20
    sheet = Image.new("RGB", (w, h), (245, 241, 232))
    x = 10
    for t in tiles:
        sheet.paste(t, (x, 10))
        x += t.width + 10
    out = WORK / "sample" / f"zoom100_{name}.jpg"
    sheet.save(out, quality=92)
    return out


if __name__ == "__main__":
    which = sys.argv[1] if len(sys.argv) > 1 else "sample"
    nm = sys.argv[2] if len(sys.argv) > 2 else "east"
    print(sample_sheet(nm))
    print(zoom_sheet(nm, [("100% · 山东半岛与渤海口", (150, 220, 650, 600)),
                          ("100% · 朝鲜半岛南部", (520, 120, 900, 500)),
                          ("100% · 九州 / 四国 / 本州西部", (800, 230, 1280, 610)),
                          ("100% · 长江口与太湖", (180, 540, 560, 900))]))
