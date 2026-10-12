#!/usr/bin/env python3
"""Pack build-kit layer masters into stable vertical WebP texture strips."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageChops, ImageStat

from common import FIXED_CREATED, resize_layer, sha256_file

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_ROOT = ROOT / "assets/default/buildkit"
KITS = ("song_dali", "xiyu", "props")
STRIP_COMMAND = "python3 tools/buildgen/build_layer_strips.py --all --check"
STRIP_MAX_CHANNEL_MAE = 6.0


@dataclass(frozen=True)
class ManifestLayer:
    index: int
    id: str
    file: str
    repeat_mm: tuple[int, int]
    sha256: str


def parse_pair(value: str) -> tuple[int, int]:
    match = re.fullmatch(r"\[(\d+),\s*(\d+)\]", value.strip())
    if not match:
        raise ValueError(f"invalid integer pair: {value}")
    return int(match.group(1)), int(match.group(2))


def parse_layers(path: Path) -> list[ManifestLayer]:
    layers: list[ManifestLayer] = []
    current: dict[str, object] | None = None
    in_layers = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        if raw == "layers:":
            in_layers = True
            continue
        if in_layers and raw and not raw.startswith("  "):
            break
        match = re.match(r"  - index: (\d+)$", raw) if in_layers else None
        if match:
            if current is not None:
                layers.append(ManifestLayer(**current))
            current = {"index": int(match.group(1))}
            continue
        if current is None:
            continue
        field = re.match(r"    (id|file|repeatMm|sha256): (.+)$", raw)
        if field:
            key = {"repeatMm": "repeat_mm"}.get(field.group(1), field.group(1))
            current[key] = parse_pair(field.group(2)) if key == "repeat_mm" else field.group(2)
    if current is not None:
        layers.append(ManifestLayer(**current))
    if not layers:
        raise ValueError(f"{path}: no layers")
    return layers


def expected_sizes(kit: str) -> tuple[int, ...]:
    return (256,) if kit == "props" else (512, 256)


def pack_strip(directory: Path, layers: list[ManifestLayer], size: int) -> Path:
    strip = Image.new("RGB", (size, size * len(layers)))
    for position, layer in enumerate(layers):
        image = resize_layer(directory / layer.file, size)
        strip.paste(image, (0, position * size))
    path = directory / f"strip_{size}.webp"
    strip.save(path, format="WEBP", quality=85, method=6, exact=True)
    return path


def strip_manifest_text(kit: str, layers: list[ManifestLayer], directory: Path) -> str:
    lines = ["strips:"]
    for size in expected_sizes(kit):
        path = directory / f"strip_{size}.webp"
        lines.extend([
            f"  - id: {kit}_strip_{size}", f"    file: {path.name}",
            "    category: buildkit_strip", "    style: default",
            f"    subject: '{kit} 程序化占位贴图按层下标纵向条带'",
            f"    prompt: '由 1024x1024 母版按 manifest 层序缩至 {size}x{size} 后纵向拼接。'",
            "    negative: '不重排、不裁切、不加边距、不改平铺原点。'", "    references: []",
            "    tool: procedural", "    model: pillow-webp", "    effort: deterministic",
            f"    command: '{STRIP_COMMAND}'",
            f"    created: '{FIXED_CREATED}'", "    source_path: tools/buildgen/build_layer_strips.py",
            f"    size: {size}x{size * len(layers)}", f"    layerSize: {size}",
            f"    layerCount: {len(layers)}",
            "    order: [" + ", ".join(layer.id for layer in layers) + "]",
            f"    sha256: {sha256_file(path)}", "    status: candidate",
            f"    notes: 'WebP quality 85；层下标从上到下 0..{len(layers) - 1}。'",
        ])
    return "\n".join(lines) + "\n"


def replace_strip_section(manifest: Path, text: str) -> None:
    content = manifest.read_text(encoding="utf-8")
    marker = "strips:\n"
    if marker in content:
        content = content[: content.index(marker)]
    if not content.endswith("\n"):
        content += "\n"
    manifest.write_text(content + text, encoding="utf-8")


def validate_kit(directory: Path, kit: str) -> list[str]:
    errors: list[str] = []
    manifest = directory / "manifest.yaml"
    layers = parse_layers(manifest)
    expected_count = 8 if kit == "props" else 16
    if len(layers) != expected_count:
        errors.append(f"{kit}: expected {expected_count} layers, got {len(layers)}")
    if [layer.index for layer in layers] != list(range(len(layers))):
        errors.append(f"{kit}: non-contiguous layer indices")
    if len({layer.id for layer in layers}) != len(layers):
        errors.append(f"{kit}: duplicate layer id")
    for layer in layers:
        path = directory / layer.file
        if not path.is_file():
            errors.append(f"{kit}: missing {layer.file}")
            continue
        if sha256_file(path) != layer.sha256:
            errors.append(f"{kit}/{layer.id}: master manifest sha256 mismatch")
        with Image.open(path) as image:
            if image.size != (1024, 1024):
                errors.append(f"{kit}/{layer.id}: master is {image.size}, expected 1024x1024")
    text = manifest.read_text(encoding="utf-8")
    for size in expected_sizes(kit):
        path = directory / f"strip_{size}.webp"
        if not path.is_file():
            errors.append(f"{kit}: missing {path.name}")
            continue
        with Image.open(path) as image:
            expected = (size, size * len(layers))
            if image.size != expected:
                errors.append(f"{kit}/{path.name}: {image.size} != {expected}")
            else:
                decoded = image.convert("RGB")
                references = [resize_layer(directory / layer.file, size) for layer in layers]
                for position, layer in enumerate(layers):
                    box = (0, position * size, size, (position + 1) * size)
                    actual = decoded.crop(box)
                    scores = [max(ImageStat.Stat(
                        ImageChops.difference(actual, reference)
                    ).mean) for reference in references]
                    channel_mae = scores[position]
                    if channel_mae > STRIP_MAX_CHANNEL_MAE:
                        errors.append(
                            f"{kit}/{path.name}: slice {position} != {layer.id} "
                            f"(channel MAE {channel_mae:.3f} > {STRIP_MAX_CHANNEL_MAE:.1f})"
                        )
                    nearest = min(range(len(scores)), key=scores.__getitem__)
                    if nearest != position:
                        errors.append(
                            f"{kit}/{path.name}: slice {position} matches "
                            f"{layers[nearest].id}, expected {layer.id}"
                        )
        digest = sha256_file(path)
        block = re.search(
            rf"  - id: {re.escape(kit)}_strip_{size}\n(?:(?!  - id:).)*?    sha256: ([0-9a-f]{{64}})",
            text, re.DOTALL,
        )
        if not block or block.group(1) != digest:
            errors.append(f"{kit}/{path.name}: manifest sha256 mismatch")
        order = "order: [" + ", ".join(layer.id for layer in layers) + "]"
        if order not in text:
            errors.append(f"{kit}/{path.name}: manifest order mismatch")
    unexpected = (directory / "strip_512.webp") if kit == "props" else None
    if unexpected and unexpected.exists():
        errors.append("props: unexpected strip_512.webp")
    return errors


def build_kit(root: Path, kit: str) -> None:
    directory = root / kit
    manifest = directory / "manifest.yaml"
    layers = parse_layers(manifest)
    for size in expected_sizes(kit):
        pack_strip(directory, layers, size)
    replace_strip_section(manifest, strip_manifest_text(kit, layers, directory))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--all", action="store_true")
    target.add_argument("--kit", choices=KITS)
    parser.add_argument("--check", action="store_true", help="validate result after packing")
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT, help=argparse.SUPPRESS)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    kits = KITS if args.all else (args.kit,)
    for kit in kits:
        build_kit(args.root, kit)
        print(f"packed {kit}: {', '.join(str(value) for value in expected_sizes(kit))} px layers")
    if args.check:
        errors = [error for kit in kits for error in validate_kit(args.root / kit, kit)]
        if errors:
            for error in errors:
                print(f"ERROR: {error}")
            return 1
        print(f"checked {len(kits)} manifests: layer count, order, dimensions and sha256 OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
