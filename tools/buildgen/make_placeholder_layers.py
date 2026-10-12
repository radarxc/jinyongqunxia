#!/usr/bin/env python3
"""Generate deterministic, metre-scaled placeholder layers for town build kits."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import numpy as np

from common import (FIXED_CREATED, MASTER_SIZE, colorize, fractal_noise,
                    hex_rgb, rng_for, save_png, sha256_file)

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_ROOT = ROOT / "assets/default/buildkit"
GENERATE_COMMAND = "python3 tools/buildgen/make_placeholder_layers.py --all"
NEGATIVE = "无透视、无投影、无文字、无标志、无物件、无墙脚阴影。"


@dataclass(frozen=True)
class LayerSpec:
    id: str
    repeat_mm: tuple[int, int]
    base: str
    pattern: str
    scale_mm: tuple[int | None, int | None]
    basis: str


SONG_LAYERS = (
    LayerSpec("tile_roof", (2070, 1920), "#55585b", "roof", (230, 320), "仰合瓦列距 230 mm、块面纵距 320 mm"),
    LayerSpec("ridge_tiles", (920, 990), "#55585b", "ridge", (230, 330), "脊瓦 230×330 mm"),
    LayerSpec("eave_soffit", (920, 1000), "#8a644b", "boards", (230, None), "望板椽条间距 230 mm"),
    LayerSpec("timber_lacquer", (1100, 1000), "#6e4b39", "wood", (220, None), "漆木板宽 220 mm"),
    LayerSpec("timber_raw", (920, 1000), "#8a684d", "wood", (230, None), "原木板宽 230 mm"),
    LayerSpec("plaster_lime", (1800, 2100), "#e3dccb", "plaster", (900, 700), "低频灰泥斑驳约 900×700 mm"),
    LayerSpec("earth_plaster", (2400, 1950), "#b59a75", "plaster", (800, 650), "低频土抹面斑驳约 800×650 mm"),
    LayerSpec("stone_rubble", (2000, 2000), "#8d877c", "rubble", (400, 400), "毛石块径 300–500 mm，中值 400"),
    LayerSpec("stone_ashlar", (2000, 2000), "#938d82", "brick", (400, 200), "条石 400×200 mm"),
    LayerSpec("brick_grey", (1230, 1000), "#777873", "brick", (410, 200), "宋砖顺砌面 410×200 mm"),
    LayerSpec("lattice_window", (980, 980), "#714b35", "lattice", (70, 70), "直棂/方格间距 70 mm"),
    LayerSpec("door_planks", (900, 2000), "#65422f", "boards", (225, None), "门板宽 225 mm"),
    LayerSpec("floor_pavers", (2000, 2000), "#969083", "pavers", (500, 500), "方地砖 500 mm"),
    LayerSpec("floor_wood", (2000, 2000), "#806047", "boards", (200, None), "木地板板宽 200 mm"),
    LayerSpec("painted_band", (1000, 1000), "#765848", "painted", (250, 250), "彩画带 250 mm 几何重复"),
    LayerSpec("cloth_awning", (996, 996), "#9f8265", "cloth", (12, 12), "布棚经纬约 12 mm（占位可读性放大）"),
)

XIYU_LAYERS = (
    LayerSpec("mud_roof", (2400, 2100), "#aa7d50", "plaster", (800, 700), "泥顶低频斑驳约 800×700 mm"),
    LayerSpec("parapet_coping", (1200, 1000), "#ad8053", "brick", (400, 200), "女儿墙压顶 400×200 mm"),
    LayerSpec("joist_soffit", (690, 1000), "#76513a", "boards", (230, None), "椽底条距 230 mm"),
    LayerSpec("timber_carved", (1000, 1000), "#76513a", "carved", (250, 250), "雕木 250 mm 几何单元"),
    LayerSpec("timber_raw", (920, 1000), "#8b6847", "wood", (230, None), "原木板宽 230 mm"),
    LayerSpec("mud_plaster_ochre", (2400, 1950), "#b88a58", "plaster", (800, 650), "赭泥低频斑驳约 800×650 mm"),
    LayerSpec("mud_plaster_limewash", (1800, 2100), "#ddd3bc", "plaster", (900, 700), "白灰泥低频斑驳约 900×700 mm"),
    LayerSpec("brick_fired", (900, 1050), "#9a6545", "brick", (300, 150), "烧砖占位 300×150 mm"),
    LayerSpec("adobe_brick", (2000, 2000), "#ad8054", "brick", (400, 200), "土坯砖 400×200×100 mm"),
    LayerSpec("brick_lattice", (1000, 1000), "#a47149", "open_brick", (200, 200), "晾房镂空棋盘 200 mm"),
    LayerSpec("lattice_wood", (980, 980), "#76513a", "lattice", (70, 70), "木花格间距 70 mm"),
    LayerSpec("door_carved", (1000, 2000), "#68432f", "carved", (250, 250), "雕门 250 mm 几何单元"),
    LayerSpec("floor_earth", (2000, 1800), "#a77a4d", "earth", (500, 450), "夯土地表颗粒团约 500×450 mm"),
    LayerSpec("carpet_kilim", (2000, 2000), "#8f5944", "kilim", (400, 400), "毡毯 400 mm 几何纹"),
    LayerSpec("dome_plaster", (1800, 2100), "#c9b995", "plaster", (900, 700), "穹顶灰低频斑驳约 900×700 mm（唐式禁用但保槽）"),
    LayerSpec("canvas_awning", (996, 996), "#b39a76", "cloth", (12, 12), "帆布经纬约 12 mm（占位可读性放大）"),
)

PROPS_LAYERS = (
    LayerSpec("wood_furniture", (1000, 1000), "#76513f", "wood", (200, None), "家具板宽 200 mm"),
    LayerSpec("wood_rough", (1000, 1000), "#856a4c", "wood", (250, None), "粗木板宽 250 mm"),
    LayerSpec("ceramic_glaze", (1000, 1000), "#74887d", "ceramic", (250, 250), "釉陶细斑约 250 mm"),
    LayerSpec("iron", (900, 900), "#4e4d49", "iron", (300, 300), "锻铁锤痕约 300 mm"),
    LayerSpec("cloth_bolt", (996, 996), "#8f7258", "cloth", (12, 12), "布匹经纬约 12 mm（占位可读性放大）"),
    LayerSpec("paper_books", (1000, 1000), "#d6c9a7", "paper", (None, 200), "书页叠边约 200 mm"),
    LayerSpec("straw_basket", (1040, 1040), "#a88b55", "basket", (80, 80), "草编间距 80 mm"),
    LayerSpec("medicine_drawers", (1000, 1000), "#76513f", "drawers", (250, 200), "药屉面 250×200 mm"),
)

KITS = {"song_dali": SONG_LAYERS, "xiyu": XIYU_LAYERS, "props": PROPS_LAYERS}


def grid_mm(spec: LayerSpec) -> tuple[np.ndarray, np.ndarray]:
    x = np.arange(MASTER_SIZE, dtype=np.float32) * spec.repeat_mm[0] / MASTER_SIZE
    y = np.arange(MASTER_SIZE, dtype=np.float32) * spec.repeat_mm[1] / MASTER_SIZE
    return np.meshgrid(x, y)


def base_surface(kit: str, spec: LayerSpec, amount: float = 0.035) -> np.ndarray:
    noise = fractal_noise(MASTER_SIZE, 2, 5, int(rng_for(kit, spec.id).integers(2**31)))
    return colorize(spec.base, noise, amount)


def darken(rgb: np.ndarray, mask: np.ndarray, value: float) -> None:
    rgb -= mask[..., None].astype(np.float32) * value


def line_distance(value: np.ndarray, period: float, offset: float = 0.0) -> np.ndarray:
    phase = np.mod(value - offset, period)
    return np.minimum(phase, period - phase)


def add_scale_signature(rgb: np.ndarray, spec: LayerSpec) -> np.ndarray:
    """Give each declared physical period a subtle, measurable face variation."""
    x, y = grid_mm(spec)
    if spec.scale_mm[0] is not None:
        rgb += np.cos(2 * np.pi * x / spec.scale_mm[0])[..., None] * 5.0
    if spec.scale_mm[1] is not None:
        rgb += np.cos(2 * np.pi * y / spec.scale_mm[1])[..., None] * 5.0
    return rgb


DOMINANT_BOARD_U = {
    ("song_dali", layer) for layer in ("eave_soffit", "timber_lacquer",
                                          "timber_raw", "door_planks", "floor_wood")
} | {("xiyu", "timber_raw"), ("props", "wood_furniture")}
DOMINANT_BRICK_V = {
    ("song_dali", "stone_ashlar"), ("song_dali", "brick_grey"),
    ("xiyu", "parapet_coping"), ("xiyu", "brick_fired"),
    ("xiyu", "adobe_brick"),
}


def render_roof(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.025)
    x, y = grid_mm(spec)
    spacing = float(spec.scale_mm[0])
    barrel = np.cos(2 * np.pi * x / spacing)
    rgb += barrel[..., None] * 16.0
    darken(rgb, line_distance(x, spacing) < 12, 8)
    rows = float(spec.scale_mm[1])
    darken(rgb, line_distance(y, rows) < 10, 14)
    stagger = np.mod(np.floor(y / rows), 2) * spacing * 0.5
    joints = (line_distance(x - stagger, spacing, 0) < 9) & (line_distance(y, rows, rows / 2) < 45)
    darken(rgb, joints, 12)
    return rgb


def render_ridge(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.025)
    x, y = grid_mm(spec)
    spacing = float(spec.scale_mm[0])
    rgb += (np.cos(2 * np.pi * x / spacing) * 8)[..., None]
    darken(rgb, line_distance(x, spacing) < 14, 18)
    darken(rgb, line_distance(y, float(spec.scale_mm[1])) < 10, 12)
    return rgb


def render_boards(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.025)
    x, y = grid_mm(spec)
    width = float(spec.scale_mm[0])
    if (kit, spec.id) in DOMINANT_BOARD_U:
        # Low crown across each board makes board width, not seam harmonics, dominant.
        rgb += np.cos(2 * np.pi * x / width)[..., None] * 3.0
    darken(rgb, line_distance(x, width) < 9, 22)
    grain = np.sin(2 * np.pi * y / 300 + np.sin(2 * np.pi * x / spec.repeat_mm[0]))
    rgb += grain[..., None] * 3.0
    return rgb


def render_wood(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = render_boards(kit, spec)
    x, y = grid_mm(spec)
    grain = np.sin(2 * np.pi * (y / 150 + 0.07 * np.sin(2 * np.pi * x / 600)))
    rgb += grain[..., None] * 2.5
    return rgb


def render_plaster(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.035)
    x, y = grid_mm(spec)
    scale_x, scale_y = spec.scale_mm
    broad = (np.cos(2 * np.pi * x / scale_x) + np.cos(2 * np.pi * y / scale_y))
    cross = np.cos(2 * np.pi * (x / scale_x + y / scale_y))
    rgb += (broad * 5.0 + cross * 2.0)[..., None]
    return rgb


def render_brick(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.035)
    x, y = grid_mm(spec)
    width, height = map(float, spec.scale_mm)
    if (kit, spec.id) in DOMINANT_BRICK_V:
        # Broad face variation is part of each course and suppresses thin-joint harmonics.
        rgb += np.cos(2 * np.pi * y / height)[..., None] * 3.0
    darken(rgb, line_distance(y, height) < max(5, height * 0.035), 25)
    row = np.floor(y / height).astype(np.int32)
    shifted_x = x - (row % 2) * width * 0.5
    vertical = line_distance(shifted_x, width) < max(5, width * 0.025)
    away_from_bed = line_distance(y, height) > max(10, height * 0.1)
    darken(rgb, vertical & away_from_bed, 25)
    return rgb


def render_rubble(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.045)
    x, y = grid_mm(spec)
    cell = float(spec.scale_mm[0])
    row = np.floor(y / cell).astype(np.int32)
    wobble_x = 25 * np.sin(2 * np.pi * y / 750)
    wobble_y = 22 * np.sin(2 * np.pi * x / 620)
    darken(rgb, line_distance(y + wobble_y, cell) < 15, 23)
    shifted = x + wobble_x - (row % 2) * 190
    darken(rgb, (line_distance(shifted, cell) < 14) & (line_distance(y + wobble_y, cell) > 35), 23)
    return rgb


def render_lattice(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.018) - 25
    x, y = grid_mm(spec)
    spacing = float(spec.scale_mm[0])
    bars = (line_distance(x, spacing) < 9) | (line_distance(y, spacing) < 9)
    rgb[bars] = hex_rgb(spec.base) + 18
    return rgb


def render_pavers(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.035)
    x, y = grid_mm(spec)
    size = float(spec.scale_mm[0])
    if (kit, spec.id) == ("song_dali", "floor_pavers"):
        rgb += np.cos(2 * np.pi * x / size)[..., None] * 3.0
    darken(rgb, (line_distance(x, size) < 13) | (line_distance(y, size) < 13), 24)
    return rgb


def render_painted(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.018)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    band = np.mod(y, scale_y)
    alternate = np.mod(np.floor(x / scale_x) + np.floor(y / scale_y), 2)
    accent = (band > 60) & (band < 190) & (alternate == 0)
    rgb[accent] = rgb[accent] * 0.72 + np.array([50, 71, 65]) * 0.28
    darken(rgb, line_distance(y, scale_y) < 8, 20)
    return rgb


def render_cloth(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.02)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    weave = np.cos(2 * np.pi * x / scale_x) + np.cos(2 * np.pi * y / scale_y)
    rgb += weave[..., None] * 2.3
    return rgb


def render_carved(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.025)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    phase_x = np.mod(x, scale_x) - scale_x / 2
    phase_y = np.mod(y, scale_y) - scale_y / 2
    motif = np.abs(np.abs(phase_x) + np.abs(phase_y) - 75) < 9
    darken(rgb, motif, 24)
    return rgb


def render_open_brick(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = render_brick(kit, spec)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    checker = (np.floor(x / scale_x) + np.floor(y / scale_y)).astype(np.int32) % 2 == 0
    inset = ((line_distance(x - scale_x / 2, scale_x) < scale_x * 0.325)
             & (line_distance(y - scale_y / 2, scale_y) < scale_y * 0.325))
    rgb[checker & inset] *= 0.38
    return rgb


def render_earth(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.06)
    x, y = grid_mm(spec)
    scale_x, scale_y = spec.scale_mm
    flecks = (np.sin(2 * np.pi * x / (scale_x / 5))
              + np.sin(2 * np.pi * y / (scale_y / 5))) > 1.86
    darken(rgb, flecks, 10)
    return rgb


def render_kilim(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.018)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    dx = np.abs(np.mod(x, scale_x) - scale_x / 2)
    dy = np.abs(np.mod(y, scale_y) - scale_y / 2)
    diamonds = np.abs(dx + dy - 150) < 13
    rgb[diamonds] = np.array([73, 78, 70], dtype=np.float32)
    darken(rgb, line_distance(y, scale_y / 2) < 7, 12)
    return rgb


def render_ceramic(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.018)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    speck = (np.cos(2 * np.pi * x / scale_x) + np.cos(2 * np.pi * y / scale_y)) > 1.82
    rgb[speck] += 8
    return rgb


def render_iron(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.04)
    x, y = grid_mm(spec)
    scale_x, scale_y = map(float, spec.scale_mm)
    hammer = np.cos(2 * np.pi * x / scale_x) * np.cos(2 * np.pi * y / scale_y)
    rgb += hammer[..., None] * 3
    return rgb


def render_paper(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.018)
    _, y = grid_mm(spec)
    height = float(spec.scale_mm[1])
    darken(rgb, line_distance(y, height) < 5, 15)
    darken(rgb, line_distance(y - 24, height) < 3, 8)
    return rgb


def render_basket(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.02)
    x, y = grid_mm(spec)
    spacing = float(spec.scale_mm[0])
    diagonal_a = line_distance(x + y, spacing) < 8
    diagonal_b = line_distance(x - y, spacing) < 8
    rgb[diagonal_a] += 10
    darken(rgb, diagonal_b, 13)
    return rgb


def render_drawers(kit: str, spec: LayerSpec) -> np.ndarray:
    rgb = base_surface(kit, spec, 0.025)
    x, y = grid_mm(spec)
    width, height = map(float, spec.scale_mm)
    # Drawer-face crown makes the full 200 mm row beat thin frame harmonics.
    rgb += np.cos(2 * np.pi * y / height)[..., None] * 3.0
    lines = (line_distance(x, width) < 8) | (line_distance(y, height) < 8)
    darken(rgb, lines, 23)
    knob = ((line_distance(x - width / 2, width) < 12)
            & (line_distance(y - height / 2, height) < 12))
    darken(rgb, knob, 35)
    return rgb


RENDERERS: dict[str, Callable[[str, LayerSpec], np.ndarray]] = {
    "roof": render_roof, "ridge": render_ridge, "boards": render_boards,
    "wood": render_wood, "plaster": render_plaster, "brick": render_brick,
    "rubble": render_rubble, "lattice": render_lattice, "pavers": render_pavers,
    "painted": render_painted, "cloth": render_cloth, "carved": render_carved,
    "open_brick": render_open_brick, "earth": render_earth, "kilim": render_kilim,
    "ceramic": render_ceramic, "iron": render_iron, "paper": render_paper,
    "basket": render_basket, "drawers": render_drawers,
}


def yaml_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def manifest_text(kit: str, specs: tuple[LayerSpec, ...], directory: Path) -> str:
    lines = [
        "schemaVersion: buildkit-layers.v1", f"kit: {kit}",
        "status: candidate", "tool: procedural", "model: numpy+pillow",
        f"created: '{FIXED_CREATED}'", f"command: {yaml_quote(GENERATE_COMMAND)}",
        "masterSize: [1024, 1024]", "layers:",
    ]
    for index, spec in enumerate(specs):
        relative = f"layers/{spec.id}.png"
        scale = ", ".join("null" if value is None else str(value) for value in spec.scale_mm)
        lines.extend([
            f"  - index: {index}", f"    id: {spec.id}", f"    file: {relative}",
            "    category: buildkit_layer", "    style: default",
            f"    subject: {yaml_quote(kit + ' · ' + spec.id + '，程序化真实尺度占位贴图')}",
            f"    prompt: {yaml_quote('程序化生成；尺度依据：' + spec.basis + '；平光、正交、无缝。')}",
            f"    negative: {yaml_quote(NEGATIVE)}", "    references: []",
            "    tool: procedural", "    model: numpy+pillow", "    effort: deterministic",
            f"    command: {yaml_quote(GENERATE_COMMAND)}",
            f"    created: '{FIXED_CREATED}'", f"    source_path: tools/buildgen/make_placeholder_layers.py",
            "    size: 1024x1024", f"    repeatMm: [{spec.repeat_mm[0]}, {spec.repeat_mm[1]}]",
            f"    scaleMm: [{scale}]",
            f"    sha256: {sha256_file(directory / relative)}", "    status: candidate",
            f"    notes: {yaml_quote('母版恰覆盖 repeatMm；' + spec.basis + '；正式图须保持槽位、尺寸、平铺原点与 repeatMm。')}",
        ])
    return "\n".join(lines) + "\n"


def generate_kit(kit: str, output_root: Path = OUTPUT_ROOT) -> list[Path]:
    specs = KITS[kit]
    directory = output_root / kit
    layers_dir = directory / "layers"
    layers_dir.mkdir(parents=True, exist_ok=True)
    expected = {f"{spec.id}.png" for spec in specs}
    for stale in layers_dir.glob("*.png"):
        if stale.name not in expected:
            stale.unlink()
    output: list[Path] = []
    for spec in specs:
        rgb = add_scale_signature(RENDERERS[spec.pattern](kit, spec), spec)
        path = layers_dir / f"{spec.id}.png"
        save_png(rgb, path)
        if path.stat().st_size > 2 * 1024 * 1024:
            raise RuntimeError(f"{path}: PNG exceeds 2 MiB")
        output.append(path)
    manifest = directory / "manifest.yaml"
    manifest.write_text(manifest_text(kit, specs, directory), encoding="utf-8")
    output.append(manifest)
    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    target = parser.add_mutually_exclusive_group(required=True)
    target.add_argument("--all", action="store_true", help="generate all three sets")
    target.add_argument("--kit", choices=tuple(KITS), help="generate one set")
    parser.add_argument("--output-root", type=Path, default=OUTPUT_ROOT, help=argparse.SUPPRESS)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    kits = tuple(KITS) if args.all else (args.kit,)
    total = 0
    for kit in kits:
        paths = generate_kit(kit, args.output_root)
        total += len(paths) - 1
        print(f"generated {kit}: {len(paths) - 1} layers")
    print(f"generated {total} deterministic 1024x1024 PNG layers")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
