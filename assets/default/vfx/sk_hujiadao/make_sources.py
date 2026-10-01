#!/usr/bin/env python3
"""生成胡家刀法三套可复现的白底四帧候选原料。"""
from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
CELL = (768, 512)
CRIMSON = (174, 43, 36)
VERMILION = (211, 67, 43)
RUSSET = (126, 55, 39)
CHARCOAL = (55, 47, 44)
SNOW_BLUE = (170, 192, 196)
PHASE = (0.48, 0.76, 1.0, 0.60)


def bezier(points, steps=120):
    p0, p1, p2, p3 = points
    out = []
    for index in range(steps + 1):
        t, u = index / steps, 1 - index / steps
        out.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return out


def stroke(canvas, points, width, color, alpha, blur=0.0):
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).line(points, fill=(*color, alpha), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def arc(canvas, box, start, end, color, alpha, width, blur=0.0):
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).arc(box, start, end, fill=(*color, alpha), width=width)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def flecks(canvas, seed, count, x_end, spread, colors=(RUSSET, CHARCOAL)):
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(count):
        x = rng.randint(120, x_end)
        y = int(256 + rng.uniform(-spread, spread))
        rx, ry = rng.randint(1, 5), rng.randint(1, 3)
        color = colors[rng.randrange(len(colors))]
        draw.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(*color, rng.randint(35, 105)))


def dry_gaps(canvas, seed, x0=220, x1=650, spread=145):
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(20):
        x = rng.randint(x0, x1)
        y = int(256 + rng.uniform(-spread, spread))
        draw.ellipse((x, y, x+rng.randint(3, 12), y+rng.randint(1, 4)), fill="white")


def base():
    return Image.new("RGBA", CELL, "white")


def family(frame):
    """刚健刀罡与回刃双弧；阳赤造型均为原创扩展。"""
    image, power = base(), PHASE[frame]
    spine = bezier([(96, 256), (230, 190), (446, 162), (660, 224)])
    return_arc = bezier([(96, 258), (270, 328), (500, 354), (642, 284)])
    for path, width, color, alpha in (
            (spine, 46, VERMILION, 128), (spine, 15, CRIMSON, 185),
            (return_arc, 28, RUSSET, 120), (return_arc, 9, CHARCOAL, 150)):
        stroke(image, path, max(4, int(width*power)), color, int(alpha*power), 1.2)
    hook = bezier([(380, 168), (540, 104), (684, 198), (608, 304)])
    stroke(image, hook, max(4, int(14*power)), CRIMSON, int(118*power), 0.9)
    flecks(image, 6100+frame, 38, 686, 140)
    dry_gaps(image, 6200+frame)
    return image.convert("RGB")


def fengxue(frame):
    """辽东风雪：赤色锥形刀势卷入灰蓝飞雪；原创视觉。"""
    image, power = base(), PHASE[frame]
    for index, target_y in enumerate((118, 170, 222, 274, 326, 378)):
        path = bezier([(96, 256), (225, 250+(target_y-256)*.28),
                       (430, target_y), (668-index*5, target_y)])
        color = CRIMSON if index in (2, 3) else (VERMILION if index % 2 else RUSSET)
        stroke(image, path, max(4, int((23-index%3*3)*power)),
               color, int((142-index*7)*power), 1.3)
    for radius, width in ((80, 12), (142, 9), (204, 6)):
        arc(image, (82, 256-radius, 96+radius*2.1, 256+radius), -62, 62,
            SNOW_BLUE, int(112*power), max(3, int(width*power)), 1.0)
    flecks(image, 7100+frame, 66, 690, 184, (SNOW_BLUE, CHARCOAL, RUSSET))
    dry_gaps(image, 7200+frame, 190, 640, 182)
    return image.convert("RGB")


def humiaohuzhao(frame):
    """胡苗互照：刀弧与剑隙交错照见破绽；原创视觉。"""
    image, power = base(), PHASE[frame]
    upper = bezier([(96, 252), (255, 112), (520, 126), (668, 234)])
    lower = bezier([(96, 262), (258, 396), (522, 382), (668, 278)])
    for path in (upper, lower):
        stroke(image, path, max(7, int(37*power)), VERMILION, int(120*power), 2.4)
        stroke(image, path, max(4, int(12*power)), CRIMSON, int(174*power), 0.8)
    # 中央素白留隙表现“互知破绽”，两条冷灰细线只作剑势参照。
    for offset in (-24, 24):
        path = bezier([(122, 256+offset*.15), (285, 256+offset),
                       (470, 256-offset*.35), (642, 256+offset*.1)])
        stroke(image, path, max(3, int(9*power)), SNOW_BLUE, int(132*power), 0.6)
    flecks(image, 8100+frame, 46, 690, 168, (RUSSET, CHARCOAL, SNOW_BLUE))
    dry_gaps(image, 8200+frame, 230, 632, 164)
    return image.convert("RGB")


def sheet(drawer, folder):
    output = Image.new("RGB", (1536, 1024), "white")
    for index in range(4):
        output.paste(drawer(index), ((index % 2)*768, (index // 2)*512))
    destination = ROOT / "effect" / folder / "source_sheet.png"
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, optimize=True)


def main():
    for drawer, folder in (
            (family, "family"),
            (fengxue, "mv_hujiadao_fengxue"),
            (humiaohuzhao, "mv_hujiadao_humiaohuzhao")):
        sheet(drawer, folder)


if __name__ == "__main__":
    main()
