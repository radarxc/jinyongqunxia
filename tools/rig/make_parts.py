#!/usr/bin/env python3
"""Normalize a three-view rig set and maintain its tianshu-rig.v1 manifest."""
from __future__ import annotations

import argparse
import math
import re
import sys
from pathlib import Path
from typing import Any

import yaml
from PIL import Image

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.item.common import BuildError, alpha_bbox, png_bytes, sha256_bytes, sha256_file
from tools.rig.templates import SOURCE_PARTS, VIEWS


class _NoAliasDumper(yaml.SafeDumper):
    """content-registry 禁 YAML 锚点 / 别名（构建会失败）：同一对象被多处引用时也逐处展开写。"""

    def ignore_aliases(self, data):
        return True

Z_ORDER = {
    "front34": {"upper_arm_L": 0, "forearm_L": 1, "hand_L": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "torso": 6, "pelvis_skirt": 7, "head": 8,
        "hair_or_headgear": 9, "upper_arm_R": 13, "forearm_R": 14, "hand_R": 15},
    "back34": {"forearm_L": 0, "upper_arm_L": 1, "hand_L": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "pelvis_skirt": 6, "torso": 7, "head": 8,
        "hair_or_headgear": 12, "upper_arm_R": 13, "forearm_R": 14, "hand_R": 15},
    "side": {"upper_arm_L": 0, "forearm_L": 1, "hand_L": 2,
        "thigh_shared": 3, "shin_shared": 4, "foot_shared": 5,
        "pelvis_skirt": 6, "torso": 7, "head": 8,
        "hair_or_headgear": 9, "upper_arm_R": 13, "forearm_R": 14, "hand_R": 15},
}
TINTABLE = {"hair_or_headgear": "hair", "torso": "clothPrimary",
    "upper_arm_L": "clothPrimary", "upper_arm_R": "clothPrimary",
    "pelvis_skirt": "clothSecondary", "forearm_L": "clothSecondary",
    "forearm_R": "clothSecondary", "thigh_shared": "clothSecondary",
    "shin_shared": "clothSecondary", "foot_shared": "footwear"}


def normalize_part(path: Path) -> tuple[Image.Image, int]:
    with Image.open(path) as opened:
        image = opened.convert("RGBA")
    left, top, right, bottom = alpha_bbox(image)
    length = max(right - left, bottom - top)
    pad = max(4, int(math.ceil(0.04 * length)))
    width, height = right - left + 2 * pad, bottom - top + 2 * pad
    width += width % 2
    height += height % 2
    output = Image.new("RGBA", (width, height))
    output.alpha_composite(image.crop((left, top, right, bottom)), (pad, pad))
    return output, pad


def _point_in_bounds(point: list[int], size: tuple[int, int]) -> bool:
    return len(point) == 2 and -1 <= point[0] <= size[0] and -1 <= point[1] <= size[1]


def joint_metadata(part: str, size: tuple[int, int], pad: int) -> tuple[list[int], dict[str, list[int]]]:
    width, height = size
    cx, top, bottom = round((width - 1) / 2), pad, height - pad - 1
    if part in {"head", "hair_or_headgear"}:
        return [cx, bottom], {"crown": [cx, top]}
    if part == "torso":
        return [cx, bottom], {"neck": [cx, top],
            "shoulder_L": [round(width * 0.14), round(height * 0.20)],
            "shoulder_R": [round(width * 0.86), round(height * 0.20)]}
    if part == "pelvis_skirt":
        return [cx, top], {"hip_L": [round(width * 0.32), top],
            "hip_R": [round(width * 0.68), top], "hem": [cx, bottom]}
    names = {"upper_arm_L": "elbow_L", "upper_arm_R": "elbow_R",
        "forearm_L": "wrist_L", "forearm_R": "wrist_R",
        "thigh_shared": "knee", "shin_shared": "ankle"}
    if part in {"hand_L", "hand_R"}:
        name = "grip_L" if part.endswith("_L") else "grip_R"
        return [cx, top], {name: [cx, top + round(0.56 * (bottom - top))]}
    if part == "foot_shared":
        return [cx, top], {"toe": [width - pad - 1, bottom]}
    return [cx, top], {names[part]: [cx, bottom]}


def _base_manifest(set_dir: Path, existing: dict[str, Any] | None) -> dict[str, Any]:
    manifest = dict(existing or {})
    set_id = str(manifest.get("set", set_dir.name))
    if not re.fullmatch(r"[a-z][a-z0-9_]*", set_id):
        raise BuildError(f"invalid rig set key: {set_id}")
    manifest.update({"schema": "tianshu-rig.v1", "set": set_id, "ppm": 256,
        "views": list(VIEWS), "mirrorPolicy": {"dir8": {0: "front34", 1: "front34",
            2: "side", 3: "back34", 4: "back34", 5: "back34", 6: "side", 7: "front34"},
            "mirrored": [5, 6, 7]}})
    manifest.setdefault("heightM", 1.62 if set_id.startswith("female") else 1.70)
    manifest.setdefault("palette", {"clothPrimary": "#6B5141", "clothSecondary": "#394C53",
        "skin": "#E9CFB4", "footwear": "#332B27", "hair": "#211C1A"})
    return manifest


def build_manifest(set_dir: Path, *, check: bool = False) -> dict[str, Any]:
    path = set_dir / "manifest.yaml"
    existing: dict[str, Any] | None = None
    if path.exists():
        loaded = yaml.safe_load(path.read_text(encoding="utf-8"))
        if not isinstance(loaded, dict):
            raise BuildError(f"{path}: manifest must be a mapping")
        existing = loaded
    manifest = _base_manifest(set_dir, existing)
    old_parts = {(item.get("view"), item.get("id")): item
                 for item in (existing or {}).get("parts", []) if isinstance(item, dict)}
    records: list[dict[str, Any]] = []
    for view in VIEWS:
        view_dir = set_dir / view
        if not view_dir.is_dir():
            raise BuildError(f"missing rig view directory: {view_dir}")
        pngs = list(view_dir.glob("*.png"))
        actual = {item.stem for item in pngs}
        missing, unknown = set(SOURCE_PARTS) - actual, actual - set(SOURCE_PARTS)
        if missing or unknown or len(pngs) != len(actual):
            raise BuildError(f"{view}: parts mismatch missing={sorted(missing)} unknown={sorted(unknown)}")
        for part in SOURCE_PARTS:
            source = view_dir / f"{part}.png"
            normalized, pad = normalize_part(source)
            blob = png_bytes(normalized)
            if check:
                if sha256_file(source) != sha256_bytes(blob):
                    raise BuildError(f"{source}: image is not normalized")
            else:
                source.write_bytes(blob)
            pivot, child = joint_metadata(part, normalized.size, pad)
            if not _point_in_bounds(pivot, normalized.size) or any(
                    not _point_in_bounds(point, normalized.size) for point in child.values()):
                raise BuildError(f"{view}/{part}: pivot or childJoint lies outside image")
            previous = old_parts.get((view, part), {})
            if previous:
                previous_file = Path(str(previous.get("file", "")))
                if previous_file.is_absolute() or ".." in previous_file.parts:
                    raise BuildError(f"{view}/{part}: manifest file path escapes rig set")
            default_angle = -90.0 if part.startswith("forearm_") else 0.0
            rest_angle = float(previous.get("restAngle", default_angle))
            if not math.isfinite(rest_angle) or not -180.0 <= rest_angle < 180.0:
                raise BuildError(f"{view}/{part}: invalid restAngle {rest_angle}")
            if part.startswith("forearm_") and rest_angle != -90.0:
                raise BuildError(f"{view}/{part}: v1 forearm restAngle must be -90.0")
            record = dict(previous)
            record.update({"id": part, "file": f"{view}/{part}.png", "view": view,
                "pivot": pivot, "childJoint": child, "size": list(normalized.size),
                "restAngle": rest_angle, "zOrder": Z_ORDER[view][part],
                "tintable": TINTABLE.get(part, False), "sha256": sha256_bytes(blob)})
            records.append(record)
    manifest["parts"] = records
    if check:
        if existing != manifest:
            raise BuildError(f"{path}: manifest differs from normalized source parts")
    else:
        path.write_text(yaml.dump(manifest, Dumper=_NoAliasDumper, allow_unicode=True, sort_keys=False, width=1000), encoding="utf-8")
    return manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="规范化 tianshu_rig 三视图部件并写 manifest。")
    parser.add_argument("set_dir", type=Path)
    parser.add_argument("--check", action="store_true", help="核对 PNG 与 manifest，不写文件")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        manifest = build_manifest(args.set_dir.resolve(), check=args.check)
    except (BuildError, OSError, ValueError, yaml.YAMLError) as exc:
        print(f"make_parts: {exc}", file=sys.stderr)
        return 1
    print(f"{args.set_dir}: {len(manifest['parts'])} part image(s) {'checked' if args.check else 'built'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
