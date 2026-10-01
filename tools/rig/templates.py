"""Deterministic pixel masks and joint metadata for rig v1 slots."""
from __future__ import annotations

from dataclasses import dataclass

from PIL import Image, ImageDraw

VIEWS = ("front34", "back34", "side")


@dataclass(frozen=True)
class Template:
    size: tuple[int, int]
    pivot: tuple[int, int]
    child: tuple[int, int]


TEMPLATES = {
    "torso": Template((132, 154), (66, 142), (66, 9)),
    "pelvis_skirt": Template((146, 92), (73, 8), (73, 80)),
    "upper_arm": Template((58, 92), (29, 8), (29, 85)),
    "forearm": Template((52, 82), (26, 8), (26, 75)),
    "hand": Template((40, 62), (20, 6), (20, 33)),
    "thigh": Template((64, 128), (32, 8), (32, 121)),
    "shin": Template((58, 116), (29, 7), (29, 109)),
    "headgear": Template((112, 80), (56, 72), (56, 8)),
    "pauldron": Template((60, 48), (30, 20), (30, 40)),
    "cape": Template((154, 244), (77, 12), (77, 232)),
    "foot": Template((96, 68), (48, 8), (90, 57)),
    "belt": Template((138, 40), (69, 10), (69, 36)),
    "pouch": Template((52, 60), (26, 10), (26, 52)),
}

PART_TO_TEMPLATE = {
    "head": "headgear", "hair_or_headgear": "headgear",
    "torso": "torso", "pelvis_skirt": "pelvis_skirt",
    "upper_arm_L": "upper_arm", "upper_arm_R": "upper_arm",
    "forearm_L": "forearm", "forearm_R": "forearm",
    "hand_L": "hand", "hand_R": "hand",
    "thigh_shared": "thigh", "shin_shared": "shin",
    "foot_shared": "foot", "thigh_L": "thigh", "thigh_R": "thigh",
    "shin_L": "shin", "shin_R": "shin",
    "foot_L": "foot", "foot_R": "foot",
    "pauldron_L": "pauldron", "pauldron_R": "pauldron",
    "cape": "cape", "belt": "belt", "pouch": "pouch",
}

SOURCE_PARTS = (
    "head", "hair_or_headgear", "torso", "pelvis_skirt",
    "upper_arm_L", "upper_arm_R", "forearm_L", "forearm_R",
    "hand_L", "hand_R", "thigh_shared", "shin_shared", "foot_shared",
)


def _shape(slot: str, width: int, height: int) -> list[tuple[int, int]]:
    x0, x1, y0, y1 = 3, width - 4, 3, height - 4
    if slot == "torso":
        return [(width * 30 // 100, y0), (width * 70 // 100, y0), (x1, height // 3),
                (width * 77 // 100, y1), (width * 23 // 100, y1), (x0, height // 3)]
    if slot in {"pelvis_skirt", "cape"}:
        return [(width * 34 // 100, y0), (width * 66 // 100, y0),
                (x1, y1), (x0, y1)]
    if slot == "headgear":
        return [(width // 5, height * 3 // 4), (width // 4, height // 4),
                (width // 2, y0), (width * 3 // 4, height // 4),
                (width * 4 // 5, height * 3 // 4)]
    if slot == "pauldron":
        return [(x0, height // 2), (width // 5, height // 5),
                (width * 4 // 5, height // 5), (x1, height // 2), (width // 2, y1)]
    if slot == "foot":
        return [(width // 2, y0), (width * 3 // 4, height // 3),
                (x1, height * 3 // 4), (width * 9 // 10, y1), (width // 3, y1)]
    if slot == "belt":
        return [(x0, height // 5), (x1, height // 5), (width * 9 // 10, height * 3 // 5),
                (width * 3 // 5, height * 3 // 5), (width // 2, y1),
                (width * 2 // 5, height * 3 // 5), (width // 10, height * 3 // 5)]
    return [(width * 2 // 5, y0), (width * 3 // 5, y0),
            (width * 4 // 5, y1), (width // 5, y1)]


def template_mask(slot: str, view: str) -> Image.Image:
    key = PART_TO_TEMPLATE.get(slot, slot)
    template = TEMPLATES[key]
    mask = Image.new("L", template.size)
    draw = ImageDraw.Draw(mask)
    polygon = _shape(key, *template.size)
    draw.polygon(polygon, fill=255)
    if view == "side":
        narrowed = mask.resize((max(1, round(mask.width * 0.72)), mask.height), Image.Resampling.NEAREST)
        mask = Image.new("L", template.size)
        mask.paste(narrowed, ((mask.width - narrowed.width) // 2, 0))
    if slot.endswith("_R"):
        mask = mask.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return mask
