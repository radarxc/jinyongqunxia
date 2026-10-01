#!/usr/bin/env python3
"""生成段氏一阳诀三套可复现的白底四帧候选原料。"""

from __future__ import annotations

import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
CELL = (768, 512)
PALE_GOLD = (222, 194, 119)
ANTIQUE_GOLD = (187, 142, 61)
WARM_OCHRE = (160, 108, 42)
DARK_GOLD = (105, 73, 31)


def bezier(points: list[tuple[float, float]], steps: int = 112) -> list[tuple[float, float]]:
    """以稳定采样生成三次贝塞尔折线。"""
    p0, p1, p2, p3 = points
    result = []
    for index in range(steps + 1):
        t, u = index / steps, 1 - index / steps
        result.append((
            u**3 * p0[0] + 3 * u*u*t * p1[0] + 3 * u*t*t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u*u*t * p1[1] + 3 * u*t*t * p2[1] + t**3 * p3[1],
        ))
    return result


def stroke(canvas: Image.Image, points: list[tuple[float, float]], width: int,
           color: tuple[int, int, int], opacity: int, blur: float = 0.0) -> None:
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).line(points, fill=(*color, opacity), width=width, joint="curve")
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def arc(canvas: Image.Image, box: tuple[float, float, float, float], start: int, end: int,
        color: tuple[int, int, int], opacity: int, width: int, blur: float = 0.0) -> None:
    layer = Image.new("RGBA", CELL, (255, 255, 255, 0))
    ImageDraw.Draw(layer).arc(box, start, end, fill=(*color, opacity), width=width)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    canvas.alpha_composite(layer)


def flecks(canvas: Image.Image, seed: int, count: int, reach: int, spread: int) -> None:
    rng = random.Random(seed)
    draw = ImageDraw.Draw(canvas)
    for _ in range(count):
        x = rng.randint(112, reach)
        y = int(256 + rng.uniform(-spread, spread) * (0.55 + 0.45 * x / reach))
        rx, ry = rng.randint(1, 4), rng.randint(1, 3)
        color = DARK_GOLD if rng.random() < 0.45 else WARM_OCHRE
        draw.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(*color, rng.randint(28, 82)))


def flatten(image: Image.Image) -> Image.Image:
    background = Image.new("RGBA", CELL, "white")
    background.alpha_composite(image)
    return background.convert("RGB")


def family(frame: int) -> Image.Image:
    """三缕调和气息与双弧护脉；全为原创视觉。"""
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.48, 0.76, 1.0, 0.62)[frame]
    for offset, width, color in ((-62, 18, PALE_GOLD), (0, 25, ANTIQUE_GOLD),
                                 (62, 15, WARM_OCHRE)):
        points = bezier([(96, 256 + offset * 0.18), (180, 256 + offset),
                         (292, 256 - offset * 0.72), (450, 256 + offset * 0.36)])
        stroke(image, points, max(4, int(width * strength)), color,
               int(150 * strength), 0.9)
    for radius, alpha, width in ((78, 108, 10), (132, 70, 7)):
        box = (92-radius*0.18, 256-radius, 92+radius*1.62, 256+radius)
        arc(image, box, -72, 72, PALE_GOLD, int(alpha*strength), width, 0.8)
    flecks(image, 4100 + frame, 28, 474, 112)
    return flatten(image)


def yiyang(frame: int) -> Image.Image:
    """一阳归元：一束回归丹田的圆融气轮；原创视觉。"""
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.43, 0.73, 1.0, 0.60)[frame]
    for radius, color, alpha, width in ((66, PALE_GOLD, 145, 13),
                                        (112, ANTIQUE_GOLD, 110, 10),
                                        (158, WARM_OCHRE, 72, 7)):
        box = (280-radius, 256-radius, 280+radius, 256+radius)
        arc(image, box, -150, 150, color, int(alpha*strength),
            max(4, int(width*strength)), 0.9)
    for offset, color in ((-54, PALE_GOLD), (0, ANTIQUE_GOLD), (54, PALE_GOLD)):
        points = bezier([(96, 256 + offset*0.12), (178, 256 + offset),
                         (252, 256 - offset*0.28), (442, 256 + offset*0.12)])
        stroke(image, points, max(4, int(19*strength)), color, int(142*strength), 0.9)
    flecks(image, 5100 + frame, 38, 485, 148)
    return flatten(image)


def zhouliu(frame: int) -> Image.Image:
    """任督周流：上下双路环合成护体周天；原创视觉。"""
    image = Image.new("RGBA", CELL, (255, 255, 255, 0))
    strength = (0.45, 0.74, 1.0, 0.63)[frame]
    for side, color in ((-1, PALE_GOLD), (1, ANTIQUE_GOLD)):
        points = bezier([(96, 256 + side*12), (188, 256 + side*126),
                         (382, 256 + side*152), (535, 256 + side*42)])
        stroke(image, points, max(5, int(22*strength)), color, int(148*strength), 1.0)
        echo = [(x, 256 + (y-256)*0.72) for x, y in points]
        stroke(image, echo, max(3, int(9*strength)), WARM_OCHRE,
               int(84*strength), 0.8)
    for radius, alpha, width in ((72, 120, 10), (125, 84, 8), (178, 54, 5)):
        box = (112-radius*0.22, 256-radius, 112+radius*1.70, 256+radius)
        arc(image, box, -82, 82, PALE_GOLD, int(alpha*strength), width, 0.8)
        arc(image, box, 98, 262, ANTIQUE_GOLD, int(alpha*0.78*strength), width, 0.8)
    flecks(image, 6100 + frame, 46, 560, 178)
    return flatten(image)


def sheet(drawer, destination: Path) -> None:
    output = Image.new("RGB", (1536, 1024), "white")
    for index in range(4):
        output.paste(drawer(index), ((index % 2) * 768, (index // 2) * 512))
    destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(destination, optimize=True)


def main() -> None:
    sheet(family, ROOT / "effect/family/source_sheet.png")
    sheet(yiyang, ROOT / "effect/mv_duanshiyangjue_yiyang/source_sheet.png")
    sheet(zhouliu, ROOT / "effect/mv_duanshiyangjue_zhouliu/source_sheet.png")


if __name__ == "__main__":
    main()
