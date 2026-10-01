#!/usr/bin/env python3
"""Build deterministic visible equipment strips and layers.yaml metadata."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

import yaml

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.item.common import (
    BuildError, all_category_dirs, normalize_rgba, png_bytes, remove_background,
    sha256_bytes, sha256_file, source_entries, write_or_check,
)
from tools.item.layer_build import (
    VISIBLE_CATEGORIES, build_template_layer, build_weapon_layer, infer_slots,
)
from tools.rig.templates import PART_TO_TEMPLATE, TEMPLATES, VIEWS

ROOT = Path(__file__).resolve().parents[2]
ITEM_ROOT = ROOT / "assets/default/item"
TOOL_VERSION = 1
BASE_Z = {
    "torso": (6.1, 7.1, 7.1), "pelvis_skirt": (7.1, 6.1, 6.1),
    "upper_arm_L": (0.1, 1.1, 0.1), "upper_arm_R": (13.1, 13.1, 13.1),
    "forearm_L": (1.1, 0.1, 1.1), "forearm_R": (14.1, 14.1, 14.1),
    "thigh_L": (3.1, 3.1, 3.1), "thigh_R": (10.1, 9.1, 10.1),
    "shin_L": (4.1, 4.1, 4.1), "shin_R": (11.1, 10.1, 11.1),
    "foot_L": (5, 5, 5), "foot_R": (12, 11, 12),
    "hair_or_headgear": (9, 12, 9), "belt": (7.15, 7.15, 7.15),
    "pauldron_L": (-0.1, 0.9, -0.1), "pauldron_R": (13.3, 13.3, 13.3),
    "cape": (-2, 11.5, -2), "weapon_R": (15.25, 15.25, 15.25),
    "weapon_L": (2.25, 2.25, 2.25),
}
TINT_SLOT = {
    "torso": "clothPrimary", "upper_arm_L": "clothPrimary",
    "upper_arm_R": "clothPrimary", "pelvis_skirt": "clothSecondary",
    "forearm_L": "clothSecondary", "forearm_R": "clothSecondary",
    "thigh_L": "clothSecondary", "thigh_R": "clothSecondary",
    "shin_L": "clothSecondary", "shin_R": "clothSecondary",
    "foot_L": "footwear", "foot_R": "footwear",
}


def _records(category: str, slot: str, file_name: str, size: tuple[int, int],
             pivot: list[int]) -> list[dict[str, Any]]:
    z_values = BASE_Z[slot]
    if category == "armor" and slot in {"torso", "pelvis_skirt"}:
        z_values = tuple(value + 0.1 for value in z_values)
    tint = {"slot": TINT_SLOT.get(slot, "fixed"),
            "strength": 1.0 if slot in TINT_SLOT else 0.0}
    return [{"slot": slot, "view": view, "file": file_name,
             "sourceRect": [index * size[0], 0, size[0], size[1]],
             "pivot": list(pivot), "scale": 1.0, "zOrder": z_values[index],
             "tint": dict(tint)} for index, view in enumerate(VIEWS)]


def build_item(category: str, entry: dict[str, Any], source: Path) -> tuple[dict[str, bytes], dict[str, Any]]:
    item_id = str(entry["id"])
    cutout, _ = remove_background(normalize_rgba(source))
    files: dict[str, bytes] = {}
    records: list[dict[str, Any]] = []
    palette: list[str] = []
    build_meta: dict[str, Any] = {}
    slots = infer_slots(category, entry)
    for slot in slots:
        file_name = f"{item_id}__{slot}.png"
        if category == "weapons":
            strip, metadata = build_weapon_layer(cutout, entry)
            pivot = list(metadata["grip"])
            build_meta = metadata
            cell_size = (strip.width // 3, strip.height)
        else:
            strip, palette = build_template_layer(cutout, item_id, slot)
            template = TEMPLATES[PART_TO_TEMPLATE[slot]]
            pivot = list(template.pivot)
            cell_size = template.size
        files[file_name] = png_bytes(strip)
        records.extend(_records(category, slot, file_name, cell_size, pivot))
    metadata = {"item": item_id, "sourceSha256": sha256_file(source),
                "toolVersion": TOOL_VERSION, "palette": palette,
                "build": build_meta, "layers": records}
    metadata["files"] = [{"file": name, "sha256": sha256_bytes(data)}
                         for name, data in sorted(files.items())]
    return files, metadata


def _canonical_yaml(data: dict[str, Any]) -> str:
    return yaml.safe_dump(data, allow_unicode=True, sort_keys=False, width=1000)


def process_directory(directory: Path, *, check: bool = False) -> int:
    directory = directory.resolve()
    category = directory.name
    if category not in VISIBLE_CATEGORIES:
        return 0
    if not directory.is_dir():
        raise BuildError(f"物品类别目录不存在: {directory}")
    _, entries = source_entries(directory)
    items: list[dict[str, Any]] = []
    processed = 0
    for entry, source in entries:
        if not infer_slots(category, entry):
            continue
        files, metadata = build_item(category, entry, source)
        for name, data in sorted(files.items()):
            write_or_check(directory / "layers" / name, data, check)
        items.append(metadata)
        processed += 1
    layer_root = {"version": 1, "category": category, "items": items}
    layer_path = directory / "layers/layers.yaml"
    expected = _canonical_yaml(layer_root)
    if check:
        if not layer_path.is_file():
            raise BuildError(f"缺少层清单 {layer_path}")
        try:
            current = yaml.safe_load(layer_path.read_text(encoding="utf-8"))
        except yaml.YAMLError as exc:
            raise BuildError(f"{layer_path}: invalid YAML: {exc}") from exc
        if current != layer_root:
            raise BuildError(f"层清单与源图不一致 {layer_path}")
    else:
        layer_path.parent.mkdir(parents=True, exist_ok=True)
        layer_path.write_text(expected, encoding="utf-8")
    return processed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="按 tech/09 §2–§3 生成确定性角色装备覆盖层。"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("directory", nargs="?", type=Path, help="可见装备类别目录")
    group.add_argument("--all", action="store_true", help="处理现有可见装备类别")
    parser.add_argument("--check", action="store_true", help="重建到内存并核对，不写文件")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    directories = (all_category_dirs(ITEM_ROOT, VISIBLE_CATEGORIES)
                   if args.all else [args.directory])
    total = 0
    try:
        for directory in directories:
            count = process_directory(directory, check=args.check)
            total += count
            print(f"{directory}: {count} item(s) {'checked' if args.check else 'built'}")
    except (BuildError, OSError, ValueError) as exc:
        print(f"make_layers: {exc}", file=sys.stderr)
        return 1
    print(f"make_layers: {total} item(s) total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
