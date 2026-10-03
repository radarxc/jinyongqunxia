#!/usr/bin/env python3
"""Generate deterministic non-production rig placeholders, then run make_parts."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.rig.make_parts import build_manifest
from tools.rig.templates import PART_TO_TEMPLATE, SOURCE_PARTS, TEMPLATES, VIEWS, template_mask

PALETTE = {
    "head": (233, 207, 180, 255), "hair_or_headgear": (33, 28, 26, 255),
    "torso": (107, 81, 65, 255), "pelvis_skirt": (57, 76, 83, 255),
    "upper_arm": (107, 81, 65, 255), "forearm": (57, 76, 83, 255),
    "hand": (233, 207, 180, 255), "thigh": (57, 76, 83, 255),
    "shin": (57, 76, 83, 255), "foot": (51, 43, 39, 255),
}


def placeholder_image(part: str, view: str, scale: float) -> Image.Image:
    template_key = PART_TO_TEMPLATE[part]
    template = TEMPLATES[template_key]
    mask = template_mask(part, view)
    if scale != 1.0:
        size = (max(2, round(template.size[0] * scale)), max(2, round(template.size[1] * scale)))
        mask = mask.resize(size, Image.Resampling.NEAREST)
    cap_draw = ImageDraw.Draw(mask)
    left, top, right, bottom = mask.getbbox()
    joints = [(round((left + right - 1) / 2), top),
              (round((left + right - 1) / 2), bottom - 1)]
    if part == "torso":
        shoulder_y = round(mask.height * .20)
        joints += [(round(mask.width * ratio), shoulder_y) for ratio in
                   ((.14, .86) if view == "back34" else (.86, .14))]
    elif part == "pelvis_skirt":
        joints += [(round(mask.width * ratio), top) for ratio in
                   ((.32, .68) if view == "back34" else (.68, .32))]
    radius = max(7, round(12 * scale))
    for x, y in joints:
        cap_draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=255)
    image = Image.new("RGBA", mask.size)
    color_key = (part.rsplit("_", 1)[0] if part.endswith(("_L", "_R"))
                 else part if part in PALETTE else template_key)
    image.paste(PALETTE.get(color_key, (107, 81, 65, 255)), mask=mask)
    outline = mask.filter(ImageFilter.MaxFilter(5))
    ink = Image.new("RGBA", mask.size, (36, 27, 24, 255))
    bordered = Image.new("RGBA", mask.size)
    bordered.paste(ink, mask=outline)
    bordered.alpha_composite(image)
    draw = ImageDraw.Draw(bordered)
    draw.line((mask.width // 2, 4, mask.width // 2, mask.height - 5), fill=(255, 255, 255, 80), width=1)
    return bordered


def generate(set_dir: Path) -> None:
    scale = 1.62 / 1.70 if set_dir.name.startswith("female") else 1.0
    for view in VIEWS:
        view_dir = set_dir / view
        view_dir.mkdir(parents=True, exist_ok=True)
        for part in SOURCE_PARTS:
            placeholder_image(part, view, scale).save(view_dir / f"{part}.png")
    build_manifest(set_dir, placeholder=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="生成明确标注的 rig 程序占位套件。")
    parser.add_argument("set_dirs", nargs="+", type=Path)
    args = parser.parse_args()
    for set_dir in args.set_dirs:
        generate(set_dir.resolve())
        print(f"{set_dir}: placeholder rig generated")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
