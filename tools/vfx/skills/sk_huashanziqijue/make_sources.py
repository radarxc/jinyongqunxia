#!/usr/bin/env python3
"""Build deterministic white-background source sheets for Huashan Purple Qi Art."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_huashanziqijue"
CELL = (768, 512)
PURPLE = (86, 42, 132)
VIOLET = (128, 69, 171)
LILAC = (176, 116, 199)
VERMILION = (197, 58, 48)
ROSE = (218, 86, 94)
GOLD = (207, 153, 53)
DARK = (55, 30, 71)


def bezier(points: list[tuple[float, float]], steps: int = 110) -> list[tuple[float, float]]:
    p0, p1, p2, p3 = points
    result = []
    for index in range(steps + 1):
        t, u = index / steps, 1 - index / steps
        result.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                       u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return result


def stroke(canvas: Image.Image, points: list[tuple[float, float]], width: int,
           color: tuple[int, int, int], opacity: int, blur: float = 0) -> None:
    layer = Image.new("RGBA", CELL, (0, 0, 0, 0))
    ImageDraw.Draw(layer).line(points, fill=(*color, opacity), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def arc(canvas: Image.Image, box: tuple[float, float, float, float], start: float, end: float,
        color: tuple[int, int, int], opacity: int, width: int, blur: float = 0) -> None:
    layer = Image.new("RGBA", CELL, (0, 0, 0, 0))
    ImageDraw.Draw(layer).arc(box, start, end, fill=(*color, opacity), width=width)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def flecks(canvas: Image.Image, seed: int, amount: int, reach: int, spread: int) -> None:
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(amount):
        x = rng.randint(110, reach)
        y = int(256 + rng.uniform(-spread, spread))
        rx, ry = rng.randint(1, 4), rng.randint(1, 3)
        color = DARK if rng.random() < .62 else PURPLE
        draw.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(*color, rng.randint(28, 104)))


def flatten(image: Image.Image) -> Image.Image:
    background = Image.new("RGBA", CELL, "white")
    background.alpha_composite(image)
    return background.convert("RGB")


def family(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (0, 0, 0, 0))
    strength = (0.46, 0.74, 1.0, 0.60)[frame]
    # Three restrained crest ribbons evoke upright Huashan qi without literal scenery.
    crests = [
        [(96, 256), (190, 222), (266, 116), (506, 198)],
        [(96, 256), (218, 264), (302, 177), (555, 252)],
        [(96, 256), (192, 294), (296, 395), (510, 316)],
        [(96, 256), (210, 244), (345, 306), (574, 274)],
    ]
    for index, points in enumerate(crests):
        width = max(4, int((20 - index * 3) * strength))
        color = (PURPLE, VIOLET, LILAC, VERMILION)[index]
        stroke(image, bezier(points), width + 9, color, int(36 * strength), 5.0)
        stroke(image, bezier(points), width, color, int((145 - index * 12) * strength), 0.8)
    stroke(image, bezier([(96, 256), (220, 257), (350, 246), (548, 256)]),
           max(4, int(12 * strength)), GOLD, int(126 * strength), 1.0)
    for radius, opacity in ((54, 80), (92, 60), (128, 38)):
        arc(image, (96-radius*.22, 256-radius, 96+radius*1.48, 256+radius),
            -72, 72, VERMILION, int(opacity * strength), max(3, int(7*strength)), .8)
    flecks(image, 4100 + frame, 28, 560, 136)
    return flatten(image)


def yingfeng(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (0, 0, 0, 0))
    strength = (0.43, 0.73, 1.0, 0.59)[frame]
    # Nested angular ridges form a defensive crest; not a literal mountain or shield.
    ridges = [
        [(96, 256), (218, 221), (322, 82), (603, 181)],
        [(96, 256), (240, 254), (364, 137), (625, 228)],
        [(96, 256), (230, 282), (350, 389), (604, 312)],
        [(96, 256), (205, 305), (315, 446), (560, 344)],
    ]
    for index, points in enumerate(ridges):
        color = (PURPLE, VIOLET, LILAC, PURPLE)[index]
        width = max(4, int((25 - index * 3) * strength))
        stroke(image, bezier(points), width + 12, color, int(32 * strength), 6.0)
        stroke(image, bezier(points), width, color, int((156 - index * 14) * strength), 1.0)
    spine = [(96, 256), (218, 250), (310, 225), (500, 256)]
    stroke(image, bezier(spine), max(5, int(18*strength)), VERMILION, int(152*strength), 1)
    stroke(image, bezier(spine), max(3, int(7*strength)), GOLD, int(176*strength), .6)
    for radius, opacity, width in ((70, 102, 10), (116, 72, 7), (164, 46, 5)):
        arc(image, (100-radius*.22, 256-radius, 100+radius*1.46, 256+radius),
            -77, 77, VIOLET, int(opacity*strength), max(3, int(width*strength)), .8)
    flecks(image, 5100 + frame, 42, 635, 186)
    return flatten(image)


def guiyuan(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (0, 0, 0, 0))
    strength = (0.44, 0.74, 1.0, 0.60)[frame]
    # Outward arcs return into an open spiral around an empty luminous center.
    upper = [(96, 256), (225, 198), (370, 68), (598, 185)]
    lower = [(96, 256), (232, 312), (382, 443), (602, 326)]
    for points, color in ((upper, VIOLET), (lower, PURPLE)):
        stroke(image, bezier(points), max(5, int(27*strength)), color, int(62*strength), 5)
        stroke(image, bezier(points), max(4, int(17*strength)), color, int(155*strength), 1)
    center = (455, 256)
    for radius, color, opacity, width, gap in (
        (148, LILAC, 112, 13, 36), (108, VIOLET, 138, 15, 48),
        (70, ROSE, 142, 12, 62), (40, GOLD, 152, 8, 76),
    ):
        arc(image, (center[0]-radius, center[1]-radius, center[0]+radius, center[1]+radius),
            180+gap/2, 540-gap/2, color, int(opacity*strength), max(3, int(width*strength)), .8)
    for index, offset in enumerate((-64, -28, 24, 62)):
        points = [(96, 256 + offset*.12), (230, 256 + offset),
                  (360, 256 - offset*.42), (490, 256 + offset*.14)]
        stroke(image, bezier(points), max(3, int((10-index%2*2)*strength)),
               ROSE if index % 2 else VIOLET, int((118-index*8)*strength), .8)
    flecks(image, 6100 + frame, 38, 636, 174)
    return flatten(image)


def sheet(drawer, destination: Path) -> None:
    output = Image.new("RGB", (1536, 1024), "white")
    for index in range(4):
        output.paste(drawer(index), ((index % 2) * 768, (index // 2) * 512))
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, optimize=True)


def main() -> None:
    sheet(family, ROOT / "effect/family/source_sheet.png")
    sheet(yingfeng, ROOT / "effect/mv_huashanziqijue_yingfeng/source_sheet.png")
    sheet(guiyuan, ROOT / "effect/mv_huashanziqijue_guiyuan/source_sheet.png")


if __name__ == "__main__":
    main()
