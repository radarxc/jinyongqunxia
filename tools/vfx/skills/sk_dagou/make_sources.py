#!/usr/bin/env python3
"""Build deterministic white-background source sheets for sk_dagou."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_dagou"
CELL = (768, 512)
IVORY = (218, 214, 199)
WARM = (166, 160, 148)
ASH = (107, 111, 108)
CHAR = (49, 54, 52)
PHASE = (0.48, 0.76, 1.0, 0.58)


def bezier(points, steps=120):
    p0, p1, p2, p3 = points
    out = []
    for index in range(steps + 1):
        t, u = index / steps, 1 - index / steps
        out.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return out


def line(canvas, points, width, color, alpha, blur=0.0):
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).line(points, fill=(*color, alpha), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def dust(canvas, seed, count, x_end, spread):
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(count):
        x = rng.randint(130, x_end)
        y = int(256 + rng.uniform(-spread, spread))
        radius = rng.randint(1, 4)
        draw.ellipse((x-radius, y-radius, x+radius, y+radius),
                     fill=(*ASH, rng.randint(28, 105)))


def dry_gaps(canvas, seed, x0=210, x1=620, spread=145):
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(22):
        x = rng.randint(x0, x1)
        y = int(256 + rng.uniform(-spread, spread))
        draw.ellipse((x, y, x+rng.randint(3, 13), y+rng.randint(1, 4)), fill="white")


def base() -> Image.Image:
    return Image.new("RGBA", CELL, "white")


def family(frame):
    im, power = base(), PHASE[frame]
    curves = [
        [(96, 256), (235, 146), (432, 114), (640, 222)],
        [(96, 256), (250, 205), (455, 184), (658, 250)],
        [(96, 256), (246, 306), (452, 356), (622, 286)],
    ]
    for index, points in enumerate(curves):
        path = bezier(points)
        line(im, path, max(5, int((32-index*7)*power)), IVORY, int(118*power), 2.6)
        line(im, path, max(3, int((10-index*2)*power)), CHAR if index == 1 else WARM,
             int((145-index*18)*power), 0.7)
    hook = bezier([(430, 180), (614, 104), (684, 250), (564, 332)])
    line(im, hook, max(4, int(19*power)), ASH, int(105*power), 1.6)
    dust(im, 1100+frame, 38, 675, 145)
    dry_gaps(im, 1200+frame)
    return flatten(im)


def aokou(frame):
    im, power = base(), PHASE[frame]
    upper = bezier([(96, 252), (252, 120), (515, 112), (632, 222)])
    lower = bezier([(96, 260), (260, 386), (522, 390), (632, 286)])
    for path in (upper, lower):
        line(im, path, max(8, int(42*power)), IVORY, int(125*power), 3.2)
        line(im, path, max(4, int(13*power)), CHAR, int(165*power), 0.9)
    for y, bend in ((232, -36), (278, 36)):
        path = bezier([(330, 256), (455, y+bend), (565, y), (645, 256)])
        line(im, path, max(3, int(10*power)), WARM, int(130*power), 0.8)
    dust(im, 2100+frame, 30, 680, 154)
    dry_gaps(im, 2200+frame, 250, 610, 155)
    return flatten(im)


def tianxia(frame):
    im, power = base(), PHASE[frame]
    for index, target_y in enumerate((92, 142, 198, 256, 314, 370, 420)):
        path = bezier([(96, 256), (222, 256+(target_y-256)*.32),
                       (430, target_y), (654-index*5, target_y)])
        line(im, path, max(3, int((16-index%3*2)*power)),
             CHAR if index == 3 else (WARM if index % 2 else IVORY),
             int((132-index*6)*power), 1.2)
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    draw = ImageDraw.Draw(layer)
    for radius, width in ((74, 10), (130, 8), (188, 6)):
        draw.arc((96-radius*.15, 256-radius, 96+radius*1.9, 256+radius), -68, 68,
                 fill=(*ASH, int(105*power)), width=max(3, int(width*power)))
    im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.0)))
    dust(im, 3100+frame, 58, 686, 186)
    dry_gaps(im, 3200+frame, 180, 625, 188)
    return flatten(im)


def yajian(frame):
    im, power = base(), PHASE[frame]
    spine = bezier([(96, 238), (252, 168), (420, 218), (610, 354)])
    line(im, spine, max(10, int(54*power)), IVORY, int(128*power), 3.6)
    line(im, spine, max(4, int(15*power)), CHAR, int(170*power), 0.9)
    for index, y in enumerate((270, 305, 340, 374)):
        path = bezier([(250+index*22, y-28), (395, y-45), (540, y+8), (656, y)])
        line(im, path, max(3, int((13-index*2)*power)), WARM, int((138-index*15)*power), 1.0)
    dust(im, 4100+frame, 34, 676, 156)
    dry_gaps(im, 4200+frame, 250, 610, 150)
    return flatten(im)


def flatten(image):
    white = Image.new("RGBA", CELL, "white")
    white.alpha_composite(image)
    return white.convert("RGB")


def sheet(drawer, folder):
    out = Image.new("RGB", (1536, 1024), "white")
    for index in range(4):
        out.paste(drawer(index), ((index % 2)*768, (index // 2)*512))
    destination = ROOT / "effect" / folder / "source_sheet.png"
    destination.parent.mkdir(parents=True, exist_ok=True)
    out.save(destination, optimize=True)


def main():
    for drawer, folder in ((family, "family"), (aokou, "mv_dagou_aokouduozhang"),
                           (tianxia, "mv_dagou_tianxiawugou"),
                           (yajian, "mv_dagou_yajiangoubei")):
        sheet(drawer, folder)


if __name__ == "__main__":
    main()
