#!/usr/bin/env python3
"""Build three deterministic white-background concept sheets for this VFX suite."""

from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).parent
W, H = 768, 512
TEAL = (32, 112, 115)
CYAN = (79, 159, 163)
INK = (31, 54, 58)


def curve(draw, points, fill, width):
    draw.line(points, fill=fill, width=width, joint="curve")
    for x, y in points[::max(1, len(points) // 12)]:
        draw.ellipse((x-width/2, y-width/2, x+width/2, y+width/2), fill=fill)


def path(kind, frame, offset=0):
    pts = []
    for i in range(121):
        t = i / 120
        x = 96 + 590 * t
        amp = [10, 20, 30, 17][frame]
        if kind == "family":
            y = 256 + amp * math.sin(t * math.pi * 3.2 + offset) * (0.3 + 0.7*t)
        elif kind == "nilinhui":
            y = 256 + amp * math.sin(t * math.pi * 2.0 + offset) - 115*math.sin(math.pi*t)
        else:
            y = 256 + amp * math.sin(t * math.pi * 4.2 + offset)
        pts.append((x, y))
    return pts


def paint(kind, frame):
    im = Image.new("RGB", (W, H), "white")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(glow)
    strength = [0.48, 0.72, 1.0, 0.58][frame]
    branches = [-1, 0, 1] if kind != "kuangwu" else [-3, -2, -1, 0, 1, 2, 3]
    for b in branches:
        pts = path(kind, frame, b * 0.23)
        if kind == "kuangwu" and b:
            pts = [(x, y + b * 18 * math.sin(math.pi*(x-96)/590)) for x, y in pts]
        curve(g, pts, (*CYAN, int(45*strength)), max(7, int((30-abs(b)*3)*strength)))
    glow = glow.filter(ImageFilter.GaussianBlur(10))
    im = Image.alpha_composite(im.convert("RGBA"), glow)
    d = ImageDraw.Draw(im)
    for b in branches:
        pts = path(kind, frame, b * 0.23)
        if kind == "kuangwu" and b:
            pts = [(x, y + b * 18 * math.sin(math.pi*(x-96)/590)) for x, y in pts]
        color = (*TEAL, int(185*strength)) if b % 2 else (*INK, int(155*strength))
        curve(d, pts, color, max(2, int((10-abs(b))*strength)))
    # continuous sword-tip root, plus sparse deterministic dry-brush flecks
    d.polygon([(88, 248), (128, 252), (128, 260), (88, 264)], fill=(*TEAL, int(210*strength)))
    rng = random.Random({"family": 11, "nilinhui": 23, "kuangwu": 37}[kind] + frame)
    for _ in range(34 if kind == "kuangwu" else 22):
        x = rng.randint(145, 650); y = rng.randint(150, 365)
        r = rng.randint(1, 4)
        d.ellipse((x-r, y-r, x+r, y+r), fill=(*CYAN, rng.randint(25, 85)))
    white = Image.new("RGBA", im.size, "white")
    white.alpha_composite(im)
    return white.convert("RGB")


for folder, kind in (("family", "family"), ("mv_jinshejian_nilinhui", "nilinhui"),
                     ("mv_jinshejian_kuangwu", "kuangwu")):
    sheet = Image.new("RGB", (W*2, H*2), "white")
    for n in range(4):
        sheet.paste(paint(kind, n), ((n % 2)*W, (n // 2)*H))
    sheet.save(ROOT / "effect" / folder / "source_sheet.png", optimize=True)
