#!/usr/bin/env python3
"""QA triptych for the plateau mountains (AR-113 follow-up): DEM hillshade / old / new.

    python3 tools/map/paint/tibet_qa.py <old full png> <new full png>   # writes qa/tibet_dem_old_new.jpg, qa/full_old_new_plateau.jpg
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import geo  # noqa: E402

QA = geo.ROOT / ".agents" / "coord" / "ART-worldmap-painted" / "qa"
FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
BOX = (72.5, 26.5, 104.5, 40.5)  # lon / lat window of the plateau
LABELS = {"冈底斯山": (84.0, 30.6), "念青唐古拉山": (91.0, 30.3), "唐古拉山": (92.0, 32.8), "可可西里山": (91.5, 35.4),
          "巴颜喀拉山": (98.0, 34.0), "昆仑山": (87.0, 36.0), "阿尔金山": (89.0, 38.6), "祁连山": (98.5, 38.6),
          "喜马拉雅山": (86.0, 28.0), "帕米尔": (74.8, 38.2), "柴达木盆地": (94.5, 37.2), "纳木错": (90.6, 30.75),
          "色林错": (89.0, 31.8), "青海湖": (100.2, 36.9)}


def font(n):
    return ImageFont.truetype(FONT, n)


def crop_box(width: int):
    proj = geo.Proj(width, width * 3 // 4)
    xs, ys = [], []
    for lon in np.linspace(BOX[0], BOX[2], 17):
        for lat in np.linspace(BOX[1], BOX[3], 17):
            x, y = proj.fwd(lon, lat)
            xs.append(float(x))
            ys.append(float(y))
    return proj, (int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys)))


def hillshade(proj, box, out_w):
    x0, y0, x1, y1 = box
    k = (x1 - x0) / out_w
    out_h = int(round((y1 - y0) / k))
    xs = x0 + (np.arange(out_w) + 0.5) * k
    ys = y0 + (np.arange(out_h) + 0.5) * k
    X, Y = np.meshgrid(xs, ys)
    lon, lat = proj.inv(X, Y)
    r, c = geo.dem_index(lon, lat)
    dem = np.maximum(np.nan_to_num(geo.load_dem(), nan=0.0), 0.0)
    e = ndimage.map_coordinates(dem, [r, c], order=1)
    gy, gx = np.gradient(e)
    shade = np.clip(0.72 - (gx - gy) * 0.0045, 0, 1)
    t = np.clip(e / 6000.0, 0, 1)[..., None]
    low = np.array([150, 170, 120], np.float32)
    mid = np.array([200, 180, 140], np.float32)
    high = np.array([250, 250, 250], np.float32)
    col = np.where(t < 0.6, low + (mid - low) * (t / 0.6), mid + (high - mid) * ((t - 0.6) / 0.4))
    rgb = col * (0.45 + 0.75 * shade[..., None])
    return Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))


def label(img, proj, box, scale):
    d = ImageDraw.Draw(img)
    for name, (lon, lat) in LABELS.items():
        x, y = proj.fwd(lon, lat)
        px, py = (float(x) - box[0]) / scale, (float(y) - box[1]) / scale
        d.text((px - 2, py - 10), name, fill=(170, 20, 20), font=font(18))


def main() -> int:
    old_p, new_p = Path(sys.argv[1]), Path(sys.argv[2])
    old = Image.open(old_p).convert("RGB")
    new = Image.open(new_p).convert("RGB")
    W = new.width
    proj, box = crop_box(W)
    out_w = 1100
    scale = (box[2] - box[0]) / out_w
    panels = [hillshade(proj, box, out_w)]
    for im in (old, new):
        c = im.crop(box)
        panels.append(c.resize((out_w, int(round(c.height / scale))), Image.Resampling.LANCZOS))
    for p in panels:
        label(p, proj, box, scale)
    h = panels[0].height
    sheet = Image.new("RGB", (out_w * 3 + 40, h + 50), (245, 241, 232))
    d = ImageDraw.Draw(sheet)
    titles = ["ETOPO 2022 晕渲（海拔着色）", "上一版（按 15 km 起伏落点）", "本版（按高原基准面突起量 + 山脊走向）"]
    for i, (p, t) in enumerate(zip(panels, titles)):
        sheet.paste(p, (10 + i * (out_w + 10), 44))
        d.text((10 + i * (out_w + 10), 10), t, fill=(60, 50, 40), font=font(24))
    QA.mkdir(parents=True, exist_ok=True)
    sheet.save(QA / "tibet_dem_old_new.jpg", quality=88)
    o = old.resize((1024, 768), Image.Resampling.LANCZOS)
    n = new.resize((1024, 768), Image.Resampling.LANCZOS)
    full = Image.new("RGB", (2 * 1024 + 30, 768 + 50), (245, 241, 232))
    full.paste(o, (10, 40))
    full.paste(n, (1024 + 20, 40))
    d = ImageDraw.Draw(full)
    d.text((10, 8), "上一版（AR-113 首次重出）", fill=(60, 50, 40), font=font(22))
    d.text((1024 + 20, 8), "本版（青藏等高原按 GIS 突起量摆山）", fill=(60, 50, 40), font=font(22))
    full.save(QA / "full_old_new_plateau.jpg", quality=88)
    print(QA / "tibet_dem_old_new.jpg")
    print(QA / "full_old_new_plateau.jpg")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
