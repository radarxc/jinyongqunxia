#!/usr/bin/env python3
"""Build deterministic white-background source sheets for this VFX suite."""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
CELL = (768, 512)
VERMILION = (176, 37, 24)
CINNABAR = (218, 76, 34)
EMBER = (236, 137, 43)
GOLD = (194, 135, 39)
DARK = (78, 25, 20)


def bezier(points: list[tuple[float, float]], steps: int = 96) -> list[tuple[float, float]]:
    p0, p1, p2, p3 = points
    result = []
    for i in range(steps + 1):
        t, u = i / steps, 1 - i / steps
        result.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                       u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return result


def stroke(canvas: Image.Image, points: list[tuple[float, float]], width: int,
           color: tuple[int, int, int], opacity: int, blur: float = 0) -> None:
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).line(points, fill=(*color, opacity), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def arc(canvas: Image.Image, box: tuple[float, float, float, float], start: int, end: int,
        color: tuple[int, int, int], opacity: int, width: int, blur: float = 0) -> None:
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).arc(box, start, end, fill=(*color, opacity), width=width)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def flecks(canvas: Image.Image, seed: int, amount: int, reach: int, spread: int) -> None:
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(amount):
        x = rng.randint(104, reach)
        y = int(256 + rng.uniform(-spread, spread) * (0.72 + 0.28 * (x / reach)))
        rx, ry = rng.randint(1, 5), rng.randint(1, 3)
        color = DARK if rng.random() < .55 else VERMILION
        draw.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(*color, rng.randint(35, 118)))


def flatten(image: Image.Image) -> Image.Image:
    background = Image.new("RGBA", CELL, "white")
    background.alpha_composite(image)
    return background.convert("RGB")


def family(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.48, 0.74, 1.0, 0.60)[frame]
    for index, (offset, width) in enumerate(((-68, 13), (-35, 18), (0, 23), (37, 16), (70, 10))):
        points = bezier([(96, 256 + offset * .18), (175, 256 + offset),
                         (300, 256 - offset * .60), (438, 256 + offset * .45)])
        color = (VERMILION, CINNABAR, GOLD, CINNABAR, VERMILION)[index]
        stroke(image, points, max(3, int(width * strength)), color,
               int((112 + index * 10) * strength), .8)
    for radius, alpha, width in ((58, 105, 9), (100, 82, 7), (144, 55, 5)):
        box = (96-radius*.25, 256-radius, 96+radius*1.60, 256+radius)
        arc(image, box, -74, 74, EMBER, int(alpha*strength), width, .7)
    flecks(image, 1100 + frame, 34, 465, 106)
    return flatten(image)


def huanming(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.44, 0.72, 1.0, 0.58)[frame]
    # 交错双环与回卷焰带表现“幻明归环”，不是原著固定招式造型。
    for side, color in ((-1, GOLD), (1, CINNABAR)):
        for radius, width, alpha in ((62, 11, 126), (108, 8, 102), (157, 6, 76)):
            cx = 248 + side * 18
            box = (cx-radius, 256-radius, cx+radius, 256+radius)
            arc(image, box, -155 if side < 0 else 25, 155 if side < 0 else 335,
                color, int(alpha*strength), width, .8)
    for index, offset in enumerate((-88, -45, 0, 47, 91)):
        curl = 32 if index % 2 == 0 else -32
        points = bezier([(96, 256 + offset*.14), (215, 256 + offset + curl),
                         (370, 256 - offset*.48 - curl), (548, 256 + offset*.28)])
        stroke(image, points, max(3, int((16-index%2*3)*strength)),
               EMBER if index in (1, 3) else VERMILION, int((133-index*7)*strength), 1.0)
    flecks(image, 2100 + frame, 52, 570, 172)
    return flatten(image)


def shouling(frame: int) -> Image.Image:
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.46, 0.75, 1.0, 0.62)[frame]
    # 层叠闭合令纹与回心焰表现“守令归真”，不画文字或实体圣火令。
    for radius, color, alpha, width in ((62, GOLD, 135, 11), (105, EMBER, 112, 9),
                                         (150, VERMILION, 88, 7), (194, DARK, 58, 5)):
        box = (126-radius*.24, 256-radius, 126+radius*1.72, 256+radius)
        arc(image, box, -78, 78, color, int(alpha*strength), width, .7)
        arc(image, box, 102, 258, color, int(alpha*.62*strength), max(3, width-3), .7)
    for offset, color in ((-42, CINNABAR), (0, GOLD), (42, CINNABAR)):
        points = bezier([(96, 256 + offset*.16), (190, 256 + offset),
                         (318, 256 + offset*.30), (470, 256 + offset*.10)])
        stroke(image, points, max(4, int(15*strength)), color, int(132*strength), .8)
    flecks(image, 3100 + frame, 30, 485, 132)
    return flatten(image)


def sheet(drawer, destination: Path) -> None:
    output = Image.new("RGB", (1536, 1024), "white")
    for index in range(4):
        output.paste(drawer(index), ((index % 2) * 768, (index // 2) * 512))
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, optimize=True)


def main() -> None:
    sheet(family, ROOT / "effect/family/source_sheet.png")
    sheet(huanming, ROOT / "effect/mv_bosishenghuoxuangong_huanming/source_sheet.png")
    sheet(shouling, ROOT / "effect/mv_bosishenghuoxuangong_shouling/source_sheet.png")


if __name__ == "__main__":
    main()
