#!/usr/bin/env python3
"""Build deterministic white-background source sheets for the Bihai VFX suite."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
CELL = (768, 512)
GOLD = (184, 124, 38)
DEEP = (48, 76, 73)
JADE = (67, 139, 132)
PALE = (214, 178, 94)


def bezier(points: list[tuple[float, float]], steps: int = 100) -> list[tuple[float, float]]:
    p0, p1, p2, p3 = points
    result = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        result.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                       u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return result


def composite_stroke(canvas: Image.Image, points: list[tuple[float, float]], width: int,
                     color: tuple[int, int, int], opacity: int, blur: float = 0) -> None:
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    draw = ImageDraw.Draw(layer)
    draw.line(points, fill=(*color, opacity), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def flecks(canvas: Image.Image, seed: int, amount: int, reach: int, spread: int,
           color: tuple[int, int, int]) -> None:
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(amount):
        x = rng.randint(120, reach)
        taper = max(0.15, 1 - (x - 120) / max(1, reach - 120))
        y = int(256 + rng.uniform(-spread, spread) * (0.55 + 0.45 * taper))
        r = rng.randint(1, 4)
        a = rng.randint(35, 125)
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(*color, a))


def family(frame: int) -> Image.Image:
    im = Image.new("RGBA", CELL, "white")
    strength = (0.48, 0.72, 1.0, 0.58)[frame]
    shifts = (-5, -2, 0, 3)
    for band, (offset, width) in enumerate(((-66, 15), (-31, 12), (0, 18), (34, 11), (66, 9))):
        wave = 16 + 7 * band
        pts = bezier([(96, 256 + offset * .28), (245, 256 + offset + wave),
                      (455, 256 + offset - wave), (690, 256 + offset * .55 + shifts[frame])])
        color = GOLD if band in (1, 3) else JADE
        composite_stroke(im, pts, max(3, int(width * strength)), color,
                         int((105 + band * 16) * strength), 1.2)
    for radius, alpha, width in ((58, 88, 8), (106, 72, 7), (158, 54, 5)):
        layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
        d = ImageDraw.Draw(layer)
        box = (96-radius*.25, 256-radius, 96+radius*1.75, 256+radius)
        d.arc(box, -67, 67, fill=(*PALE, int(alpha*strength)), width=width)
        im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(.7)))
    flecks(im, 210 + frame, 42, 700, 100, DEEP)
    return flatten(im)


def chaosheng(frame: int) -> Image.Image:
    im = Image.new("RGBA", CELL, "white")
    strength = (0.42, 0.72, 1.0, 0.56)[frame]
    for i, radius in enumerate((62, 112, 170, 226)):
        layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
        d = ImageDraw.Draw(layer)
        x0 = 104 + radius * .10
        box = (x0-radius*.35, 256-radius, x0+radius*1.7, 256+radius)
        color = GOLD if i % 2 == 0 else JADE
        d.arc(box, -74, 74, fill=(*color, int((105-10*i)*strength)), width=max(4, 13-i*2))
        im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(1.0)))
    for i, offset in enumerate((-112, -64, -18, 31, 78, 119)):
        pts = bezier([(96, 256 + offset*.12), (260, 256 + offset),
                      (454, 256 - offset*.55), (704, 256 + offset*.36)])
        composite_stroke(im, pts, max(3, int((14-i%3*2)*strength)),
                         PALE if i in (1, 4) else DEEP, int((125-7*i)*strength), 1.1)
    flecks(im, 410 + frame, 62, 710, 178, GOLD)
    return flatten(im)


def dingshen(frame: int) -> Image.Image:
    im = Image.new("RGBA", CELL, "white")
    strength = (0.46, 0.74, 1.0, 0.60)[frame]
    for i, radius in enumerate((52, 91, 134, 176)):
        layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
        d = ImageDraw.Draw(layer)
        box = (96-radius*.25, 256-radius, 96+radius*1.75, 256+radius)
        color = PALE if i < 2 else GOLD
        d.arc(box, -82, 82, fill=(*color, int((130-15*i)*strength)), width=11-i)
        d.arc(box, 98, 262, fill=(*JADE, int((75-8*i)*strength)), width=max(3, 7-i))
        im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(.7)))
    axis = bezier([(96, 256), (210, 238), (345, 268), (548, 256)])
    composite_stroke(im, axis, max(4, int(15*strength)), DEEP, int(145*strength), .8)
    flecks(im, 610 + frame, 28, 560, 116, JADE)
    return flatten(im)


def flatten(image: Image.Image) -> Image.Image:
    bg = Image.new("RGBA", CELL, "white")
    bg.alpha_composite(image)
    return bg.convert("RGB")


def sheet(drawer, destination: Path) -> None:
    out = Image.new("RGB", (1536, 1024), "white")
    for i in range(4):
        out.paste(drawer(i), ((i % 2) * 768, (i // 2) * 512))
    destination.parent.mkdir(parents=True, exist_ok=True)
    out.save(destination, optimize=True)


def main() -> None:
    sheet(family, ROOT / "effect/family/source_sheet.png")
    sheet(chaosheng, ROOT / "effect/mv_bihai_chaosheng/source_sheet.png")
    sheet(dingshen, ROOT / "effect/mv_bihai_dingshen/source_sheet.png")


if __name__ == "__main__":
    main()
