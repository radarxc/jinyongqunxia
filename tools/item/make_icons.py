#!/usr/bin/env python3
"""Build deterministic 256/128/64/32 item icons from catalog artwork."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from typing import Any

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from tools.item.common import (
    ICON_SIZES, BuildError, all_category_dirs, dump_manifest, icon_pyramid,
    sha256_bytes, sha256_file, source_entries, write_or_check,
)

ROOT = Path(__file__).resolve().parents[2]
ITEM_ROOT = ROOT / "assets/default/item"


def expected_icons(item_id: str, blobs: dict[int, bytes]) -> list[dict[str, Any]]:
    return [
        {
            "file": f"icons/{item_id}_{size}.png",
            "size": [size, size],
            "sha256": sha256_bytes(blobs[size]),
        }
        for size in ICON_SIZES
    ]


def process_directory(directory: Path, *, check: bool = False) -> int:
    directory = directory.resolve()
    if not directory.is_dir():
        raise BuildError(f"物品类别目录不存在: {directory}")
    root, entries = source_entries(directory)
    changed = False
    for entry, source in entries:
        item_id = str(entry["id"])
        blobs, background = icon_pyramid(source)
        icons = expected_icons(item_id, blobs)
        build = {"version": 1, "background": background["background"],
                 "seedRatio": background["seedRatio"]}
        for size, record in zip(ICON_SIZES, icons):
            write_or_check(directory / record["file"], blobs[size], check)
        if check:
            if entry.get("icons") != icons:
                raise BuildError(f"{item_id}: manifest icons 字段与派生文件不一致")
            if entry.get("iconSourceSha256") != sha256_file(source):
                raise BuildError(f"{item_id}: manifest 源图哈希已过期")
            if entry.get("iconBuild") != build:
                raise BuildError(f"{item_id}: manifest iconBuild 字段已过期")
        else:
            entry["icons"] = icons
            entry["iconSourceSha256"] = sha256_file(source)
            entry["iconBuild"] = build
            changed = True
    if not check and changed:
        dump_manifest(directory / "manifest.yaml", root)
    return len(entries)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="按 tech/09 §3 生成确定性物品四档透明图标。"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("directory", nargs="?", type=Path, help="物品类别目录")
    group.add_argument("--all", action="store_true", help="处理 assets/default/item 下现有类别")
    parser.add_argument("--check", action="store_true", help="重建到内存并核对，不写文件")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    directories = all_category_dirs(ITEM_ROOT) if args.all else [args.directory]
    total = 0
    try:
        for directory in directories:
            count = process_directory(directory, check=args.check)
            total += count
            print(f"{directory}: {count} item(s) {'checked' if args.check else 'built'}")
    except (BuildError, OSError, ValueError) as exc:
        print(f"make_icons: {exc}", file=sys.stderr)
        return 1
    print(f"make_icons: {total} item(s) total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
