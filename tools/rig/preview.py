#!/usr/bin/env python3
"""Compose deterministic three-view rig pose strips for asset review."""
from __future__ import annotations

import argparse
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml
from PIL import Image, ImageDraw

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.rig.gait import pose
from tools.rig.templates import VIEWS

CELL = (256, 320)
GAP = 16
BACKGROUND = (230, 225, 216, 255)
ITEM_ROOT = Path(__file__).resolve().parents[2] / "assets/default/item"
WORK_CELL = (512, 640)
SHARED_LIMB_Z = {
    "front34": {
        "thigh": {"R": 3, "L": 10}, "shin": {"R": 4, "L": 11},
        "foot": {"R": 5, "L": 12},
    },
    "back34": {
        "thigh": {"R": 3, "L": 9}, "shin": {"R": 4, "L": 10},
        "foot": {"R": 5, "L": 11},
    },
    "side": {
        "thigh": {"R": 3, "L": 10}, "shin": {"R": 4, "L": 11},
        "foot": {"R": 5, "L": 12},
    },
}


@dataclass
class Placement:
    image: Image.Image
    pivot: tuple[int, int]
    anchor: tuple[float, float]
    angle: float
    z: float
    part: str
    child: dict[str, list[int]]


def _transform(point: tuple[int, int] | list[int], pivot: tuple[int, int],
               anchor: tuple[float, float], angle: float) -> tuple[float, float]:
    radians = math.radians(angle)
    dx, dy = point[0] - pivot[0], point[1] - pivot[1]
    return (anchor[0] + dx * math.cos(radians) - dy * math.sin(radians),
            anchor[1] + dx * math.sin(radians) + dy * math.cos(radians))


def _child(placement: Placement, name: str) -> tuple[float, float]:
    return _transform(placement.child[name], placement.pivot, placement.anchor, placement.angle)


def _draw_rotated(canvas: Image.Image, placement: Placement) -> None:
    image, pivot = placement.image, placement.pivot
    radius = int(math.ceil(max(
        math.hypot(x - pivot[0], y - pivot[1])
        for x, y in ((0, 0), (image.width, 0), (0, image.height), image.size)
    ))) + 2
    square = Image.new("RGBA", (2 * radius + 1, 2 * radius + 1))
    square.alpha_composite(image, (radius - pivot[0], radius - pivot[1]))
    rotated = square.rotate(-placement.angle, resample=Image.Resampling.BICUBIC, center=(radius, radius))
    canvas.alpha_composite(rotated, (round(placement.anchor[0] - radius),
                                     round(placement.anchor[1] - radius)))


def _load_manifest(set_dir: Path) -> dict[str, Any]:
    data = yaml.safe_load((set_dir / "manifest.yaml").read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("schema") != "tianshu-rig.v1":
        raise ValueError("rig manifest must use schema tianshu-rig.v1")
    return data


def _source_map(set_dir: Path, manifest: dict[str, Any], view: str) -> dict[str, dict[str, Any]]:
    result = {}
    for record in manifest.get("parts", []):
        if record.get("view") == view:
            item = dict(record)
            with Image.open(set_dir / item["file"]) as opened:
                item["image"] = opened.convert("RGBA")
            result[str(item["id"])] = item
    return result


def _part(source: dict[str, dict[str, Any]], name: str, anchor: tuple[float, float],
          angle: float, *, shared: str | None = None, z: float | None = None) -> Placement:
    record = source[shared or name]
    image = record["image"]
    if shared and name.endswith("_R"):
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        pivot = (image.width - 1 - record["pivot"][0], record["pivot"][1])
        child = {key: [image.width - 1 - value[0], value[1]] for key, value in record["childJoint"].items()}
    else:
        pivot = tuple(record["pivot"])
        child = record["childJoint"]
    return Placement(image, pivot, anchor, angle + float(record.get("restAngle", 0.0)),
                     float(record["zOrder"] if z is None else z), name, child)


def compose_pose(set_dir: Path, manifest: dict[str, Any], view: str,
                 values: dict[str, Any], equipment: list[tuple[dict[str, Any], Image.Image]] | None = None) -> Image.Image:
    source = _source_map(set_dir, manifest, view)
    canvas = Image.new("RGBA", WORK_CELL, BACKGROUND)
    root = (WORK_CELL[0] / 2 + values.get("pelvisX", 0.0) * 256,
            330 + values.get("bodyY", 0.0) * 256)
    pieces: list[Placement] = []
    pelvis = _part(source, "pelvis_skirt", root, values.get("torsoRoll", 0.0))
    torso = _part(source, "torso", root, values.get("torsoRoll", 0.0) + values.get("torsoLean", 0.0))
    pieces.extend((pelvis, torso))
    neck = _child(torso, "neck")
    head_angle = torso.angle - 0.55 * values.get("torsoRoll", 0.0)
    pieces.append(_part(source, "head", neck, head_angle))
    pieces.append(_part(source, "hair_or_headgear", neck, head_angle))
    for side in ("L", "R"):
        shoulder = _child(torso, f"shoulder_{side}")
        upper = _part(source, f"upper_arm_{side}", shoulder,
                      torso.angle + values[f"shoulder_{side}"])
        pieces.append(upper)
        elbow_anchor = _child(upper, f"elbow_{side}")
        forearm = _part(source, f"forearm_{side}", elbow_anchor,
                        upper.angle + values[f"elbow_{side}"])
        pieces.append(forearm)
        wrist = _child(forearm, f"wrist_{side}")
        pieces.append(_part(source, f"hand_{side}", wrist, forearm.angle))
        hip_anchor = _child(pelvis, f"hip_{side}")
        thigh = _part(source, f"thigh_{side}", hip_anchor,
                      pelvis.angle + values[f"hip_{side}"],
                      shared="thigh_shared", z=SHARED_LIMB_Z[view]["thigh"][side])
        pieces.append(thigh)
        knee = _child(thigh, "knee")
        shin = _part(source, f"shin_{side}", knee, thigh.angle + values[f"knee_{side}"],
                     shared="shin_shared", z=SHARED_LIMB_Z[view]["shin"][side])
        pieces.append(shin)
        ankle = _child(shin, "ankle")
        pieces.append(_part(source, f"foot_{side}", ankle, shin.angle + values[f"ankle_{side}"],
                            shared="foot_shared", z=SHARED_LIMB_Z[view]["foot"][side]))
    placements = {item.part: item for item in pieces}
    for record, layer_image in equipment or []:
        slot = str(record["slot"])
        if slot in placements:
            parent = placements[slot]
            anchor, angle = parent.anchor, parent.angle
        elif slot.startswith("pauldron_"):
            side = slot[-1]
            anchor, angle = _child(torso, f"shoulder_{side}"), torso.angle
        elif slot == "cape":
            anchor, angle = neck, torso.angle
        elif slot == "belt":
            anchor, angle = root, pelvis.angle
        elif slot.startswith("weapon_"):
            side = slot[-1]
            hand = placements[f"hand_{side}"]
            anchor, angle = _child(hand, f"grip_{side}"), hand.angle
        else:
            continue
        pieces.append(Placement(layer_image, tuple(record["pivot"]), anchor, angle,
                                float(record["zOrder"]), f"equipment:{slot}", {}))
    for placement in sorted(pieces, key=lambda item: (item.z, item.part)):
        _draw_rotated(canvas, placement)
    return canvas.resize(CELL, Image.Resampling.LANCZOS)


def load_equipment(item_ids: list[str], view: str) -> list[tuple[dict[str, Any], Image.Image]]:
    wanted = set(item_ids)
    found: set[str] = set()
    result: list[tuple[dict[str, Any], Image.Image]] = []
    for layer_path in sorted(ITEM_ROOT.glob("*/layers/layers.yaml")):
        root = yaml.safe_load(layer_path.read_text(encoding="utf-8"))
        for item in root.get("items", []) if isinstance(root, dict) else []:
            if item.get("item") not in wanted:
                continue
            found.add(str(item["item"]))
            for record in item.get("layers", []):
                if record.get("view") != view:
                    continue
                with Image.open(layer_path.parent / record["file"]) as opened:
                    strip = opened.convert("RGBA")
                x, y, width, height = record["sourceRect"]
                result.append((record, strip.crop((x, y, x + width, y + height))))
    missing = wanted - found
    if missing:
        raise ValueError(f"equipment layer not found: {', '.join(sorted(missing))}")
    return result


def make_strip(set_dir: Path, *, motion: str = "walk", weight: str = "medium",
               equipment: list[str] | None = None) -> Image.Image:
    manifest = _load_manifest(set_dir)
    samples = (("idle", 0.0), (motion, 0.0), (motion, 0.25), (motion, 0.5), (motion, 0.75))
    speed = {"idle": 0.0, "walk": 1.4, "run": 4.0}[motion]
    width = len(samples) * CELL[0] + (len(samples) - 1) * GAP
    height = len(VIEWS) * CELL[1] + (len(VIEWS) - 1) * GAP
    strip = Image.new("RGBA", (width, height), BACKGROUND)
    draw = ImageDraw.Draw(strip)
    for row, view in enumerate(VIEWS):
        layers = load_equipment(equipment or [], view)
        for column, (sample_motion, phase) in enumerate(samples):
            sample_speed = 0.0 if sample_motion == "idle" else speed
            values = pose(phase, sample_speed, weight)
            frame = compose_pose(set_dir, manifest, view, values, layers)
            x, y = column * (CELL[0] + GAP), row * (CELL[1] + GAP)
            strip.alpha_composite(frame, (x, y))
            draw.line((x, y + 239, x + CELL[0], y + 239), fill=(130, 120, 108, 80))
    return strip


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="生成三视图待机加四相位 rig 审阅条带。")
    parser.add_argument("set_dir", nargs="?", type=Path)
    parser.add_argument("--set", dest="set_option", type=Path, help="set_dir 的兼容别名")
    parser.add_argument("--motion", choices=("idle", "walk", "run"), default="walk")
    parser.add_argument("--weight", choices=("light", "medium", "heavy"), default="medium")
    parser.add_argument("--equipment", default="", help="逗号分隔装备 ID；从 item/*/layers 加载")
    parser.add_argument("--out", type=Path, required=True)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    set_dir = args.set_option or args.set_dir
    if set_dir is None:
        print("preview: set_dir is required", file=sys.stderr)
        return 2
    try:
        strip = make_strip(set_dir.resolve(), motion=args.motion, weight=args.weight,
                           equipment=[item for item in args.equipment.split(",") if item])
        args.out.parent.mkdir(parents=True, exist_ok=True)
        strip.save(args.out, "PNG", optimize=False, compress_level=9)
    except (OSError, ValueError, KeyError, yaml.YAMLError) as exc:
        print(f"preview: {exc}", file=sys.stderr)
        return 1
    print(f"preview: wrote {args.out} ({strip.width}x{strip.height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
