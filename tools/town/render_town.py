#!/usr/bin/env python3
"""Render TownLayout data as a 45-degree PNG and independently toggleable SVG."""

from __future__ import annotations

import argparse
from collections import defaultdict
from html import escape
import json
import math
from pathlib import Path
import sys
import time

import yaml
from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat

try:
    from .assets import AssetLibrary, DEFAULT_BUILDINGS, DEFAULT_TILES, ROOT, asset_library
    from .edge_assembly import shore_bank_masks, water_fringe_mask
    from .water_material import WaterMaterial
except ImportError:
    from assets import AssetLibrary, DEFAULT_BUILDINGS, DEFAULT_TILES, ROOT, asset_library
    from edge_assembly import shore_bank_masks, water_fringe_mask
    from water_material import WaterMaterial

NEIGHBORS = ((0, 1), (1, 1), (1, 0), (1, -1),
             (0, -1), (-1, -1), (-1, 0), (-1, 1))
COLORS = {"rammed_earth": "#bbab8a", "grey_brick": "#96998e",
          "stone_slab": "#bfc0ac", "dirt_road": "#d6bf95",
          "grass": "#8b9d74", "water": "#6e9eaa", "bridge_deck": "#b59c70"}


def normalize_mask(mask: int) -> int:
    """Gate diagonals by both cardinal neighbors: 256 inputs become 47 masks."""
    for diagonal, first, second in ((2, 1, 4), (8, 4, 16),
                                    (32, 16, 64), (128, 64, 1)):
        if not mask & first or not mask & second:
            mask &= ~diagonal
    return mask & 255


def autotile_mask(x: int, z: int, cells: set[tuple[int, int]]) -> int:
    return normalize_mask(sum(1 << i for i, (dx, dz) in enumerate(NEIGHBORS)
                              if (x + dx, z + dz) in cells))


def project(x: float, z: float, height: int, scale: float = 1.0,
            elevation: float = 0.0) -> tuple[float, float]:
    """Planning +z points north; world +z points south (design/22 §1.2)."""
    return (32 * (x + z) * scale,
            (16 * (height + x - z) - 16 * math.sqrt(6) * elevation) * scale)


def footprint_corners(building: dict) -> list[tuple[float, float]]:
    x, z = building["origin"]["x"], building["origin"]["z"]
    w, h = building["size"]["w"], building["size"]["h"]
    return [(x, z), (x + w, z), (x + w, z + h), (x, z + h)]


def visible_wall_cells(spec: dict, cells: set[tuple[int, int]]) -> set[tuple[int, int]]:
    """The Dali temple envelope is a planning boundary, not an excavated wall."""
    if (spec.get("city_id") == "city_dali" and "wall" in spec
            and "游戏包络" in spec["wall"].get("basis", "")):
        north = next(g for g in spec["gates"] if g["side"] == "north")["at"]["z"]
        return {(x, z) for x, z in cells if z <= north}
    return cells


def building_sort_key(building: dict, height: int) -> tuple:
    corners = footprint_corners(building)
    x, z = building["origin"]["x"], building["origin"]["z"]
    w, h = building["size"]["w"], building["size"]["h"]
    return max(cx + height - cz for cx, cz in corners), height - z - h / 2, x + w / 2, building["id"]


def variant_hash(root: int, x: int, z: int, asset_id: str) -> int:
    value = 14695981039346656037
    data = root.to_bytes(8, "little") + f"tile\0{x},{z}\0{asset_id}".encode()
    for byte in data:
        value = ((value ^ byte) * 1099511628211) & ((1 << 64) - 1)
    return value


def ground_records(layout: dict) -> dict[tuple[int, int], dict]:
    width = layout["grid"]["width"]
    result = {}
    for record in layout["ground_cells"]:
        if isinstance(record, dict):
            point = record["at"]
            result[point["x"], point["z"]] = record
        else:
            start, length, value = record
            for index in range(start, start + length):
                result[index % width, index // width] = value
    if len(result) != width * layout["grid"]["height"]:
        raise ValueError("ground_cells 必须完整覆盖网格")
    return result


def _points(values: list[dict]) -> set[tuple[int, int]]:
    return {(point["x"], point["z"]) for point in values}


def _anchor(meta: dict) -> tuple[float, float] | None:
    value = meta.get("anchor_px")
    if isinstance(value, dict):
        value = value.get("x"), value.get("y")
    if isinstance(value, (list, tuple)) and len(value) == 2:
        if all(isinstance(v, (int, float)) and math.isfinite(v) for v in value):
            return tuple(value)
    return None


def _positive_number(value) -> bool:
    return (isinstance(value, (int, float)) and not isinstance(value, bool)
            and math.isfinite(value) and value > 0)


def _paste(canvas: Image.Image, sprite: Image.Image, at: tuple[float, float],
           anchor: tuple[float, float], ratio: float, *, clip_polygon: list[tuple] | None = None) -> None:
    size = max(1, round(sprite.width * ratio)), max(1, round(sprite.height * ratio))
    if sprite.size != size:
        sprite = sprite.resize(size, Image.Resampling.LANCZOS)
    offset = round(at[0] - anchor[0] * ratio), round(at[1] - anchor[1] * ratio)
    if clip_polygon is not None:
        mask = Image.new("L", sprite.size)
        ImageDraw.Draw(mask).polygon([(x - offset[0], y - offset[1]) for x, y in clip_polygon], fill=255)
        sprite = sprite.copy()
        sprite.putalpha(ImageChops.multiply(sprite.getchannel("A"), mask))
    canvas.alpha_composite(sprite, offset)


def _polygon(x: float, z: float, height: int, scale: float,
             w: float = 1, h: float = 1, elevation: float = 0) -> list[tuple]:
    return [project(a, b, height, scale, elevation)
            for a, b in ((x, z), (x + w, z), (x + w, z + h), (x, z + h))]


def _source(layout: dict, spec: dict | None) -> dict:
    if spec is not None:
        return spec
    path = Path(layout.get("source_spec", {}).get("path", ""))
    if not path.is_file():
        path = ROOT / path
    if path.is_file():
        return yaml.safe_load(path.read_text(encoding="utf-8"))
    raise ValueError("无法读取 source_spec.path；请用 --spec 指定 CitySpec")


class Painter:
    def __init__(self, layout: dict, spec: dict, tiles: AssetLibrary,
                 buildings: AssetLibrary, scale: float, background: str = "#ede8d9"):
        self.layout, self.spec, self.tiles, self.buildings = layout, spec, tiles, buildings
        self.scale = scale
        self.height = layout["grid"]["height"]
        self.width = layout["grid"]["width"]
        span = self.width + self.height
        # Tall northern landmarks may project above the terrain diamond.
        min_y = 0.0
        for instance in layout.get("buildings", []):
            found = buildings.resolve(instance["type"], rotation_deg=instance.get("rotation_deg", 0))
            if not found:
                continue
            sprite, meta = found
            anchor, source_width = _anchor(meta), meta.get("footprint_width_px")
            bounds = sprite.getchannel("A").getbbox()
            if anchor and bounds and _positive_number(source_width):
                x = instance["origin"]["x"] + instance["size"]["w"] / 2
                z = instance["origin"]["z"] + instance["size"]["h"] / 2
                ratio = 32 * (instance["size"]["w"] + instance["size"]["h"]) / source_width
                y = project(x, z, self.height)[1] + (bounds[1] - anchor[1]) * ratio
                min_y = min(min_y, y)
        self.top_padding = math.ceil(-min_y + 32) if min_y < 0 else 0
        self.height += self.top_padding / 16
        self.canvas = Image.new("RGBA", (round(span * 32 * scale), round((span * 16 + self.top_padding) * scale)),
                                background)
        self.draw = ImageDraw.Draw(self.canvas)
        self.era = spec["era_kit"]
        root = layout.get("generator", {}).get("root_seed_u64", "0")
        self.root = int(root, 0) if isinstance(root, str) else int(root)
        self.ground = ground_records(layout)
        self.draw_order = []
        self.ground_colors = {}
        self.water_material = None
        self.water_metrics = {}

    def tile(self, x: int, z: int, kind: str, *, mask: int | None = None,
             rotation_deg: int | None = None, opaque_ground: bool = False,
             alpha_mask: Image.Image | None = None) -> bool:
        asset_id = kind if kind.startswith("tex_") else f"tex_town_{self.era}_{kind}"
        if kind == "water":
            if self.water_material is None:
                self.water_material = WaterMaterial(self.tiles, asset_id, self.root)
            elevation = self.ground.get((x, z), {}).get("elevation_m", 0)
            return self.water_material.paint(self.canvas,
                _polygon(x, z, self.height, self.scale, elevation=elevation),
                self.scale, alpha_mask)
        variant = variant_hash(self.root, x, z, asset_id)
        found = self.tiles.resolve(asset_id, variant_index=variant,
                                   mask=mask, rotation_deg=rotation_deg)
        if found is None:
            return False
        sprite, meta = found
        anchor = _anchor(meta) or (sprite.width / 2, sprite.height / 2)
        elevation = self.ground.get((x, z), {}).get("elevation_m", 0)
        at = project(x + .5, z + .5, self.height, self.scale, elevation)
        tile_size = meta.get("tile_px", [64, 32])
        tile_width = tile_size[0] if isinstance(tile_size, (list, tuple)) and tile_size else None
        if not _positive_number(tile_width):
            self.tiles.missing.add(asset_id + "/tile_px")
            return False
        if opaque_ground:
            key = meta.get("id", asset_id)
            if key not in self.ground_colors:
                mean = ImageStat.Stat(sprite.convert("RGB"), sprite.getchannel("A")).mean
                self.ground_colors[key] = tuple(round(v) for v in mean)
            # Real sprites have antialiased diamond edges: cover their subpixel gaps
            # with the same material color instead of exposing the paper background.
            self.draw.polygon(_polygon(x, z, self.height, self.scale, elevation=elevation),
                              fill=self.ground_colors[key])
        if alpha_mask is not None:
            sprite = sprite.copy()
            sprite.putalpha(ImageChops.multiply(sprite.getchannel("A"), alpha_mask))
        clip = (_polygon(x, z, self.height, self.scale, elevation=elevation)
                if mask is not None or alpha_mask is not None else None)
        _paste(self.canvas, sprite, at, anchor, self.scale * 64 / tile_width,
               clip_polygon=clip)
        return True

    def flat(self, x: int, z: int, kind: str) -> None:
        if self.tile(x, z, kind, opaque_ground=True):
            return
        elevation = self.ground[x, z].get("elevation_m", 0)
        polygon = _polygon(x, z, self.height, self.scale, elevation=elevation)
        color = COLORS.get(kind, "#d6a0b5")
        self.draw.polygon(polygon, fill=color)

    def edge(self, x: int, z: int, kind: str, mask: int) -> None:
        if self.tile(x, z, kind, mask=mask):
            return
        p = _polygon(x, z, self.height, self.scale)
        color = "#456674" if kind == "riverbank" else "#9e886a"
        thickness = max(1, round(2 * self.scale))
        # N/E/S/W are actual planning edges. Concave joins come from adjacent
        # dry cells, never short diagonal strokes inside a water tile.
        for bit, a, b in ((1, 3, 2), (4, 2, 1), (16, 1, 0), (64, 0, 3)):
            if not mask & bit:
                self.draw.line([p[a], p[b]], fill=color, width=thickness)

    def terrain(self) -> None:
        water = _points(self.layout.get("water_cells", []))
        roads = set().union(*(_points(value) for value in self.layout.get("roads", {}).values()))
        surfaces = defaultdict(set)
        for point in roads - water:
            surfaces[self.ground[point]["ground"]].add(point)
        # All masks are derived from immutable data before any pass is drawn.
        road_masks = {p: autotile_mask(*p, group) for group in surfaces.values() for p in group}
        bank_masks = shore_bank_masks(water, set(self.ground))
        self.water_metrics = {
            "water_cells": len(water),
            "sampling": "global_continuous",
            "material_variants": 4 if water else 0,
            "brightness_range": list(WaterMaterial.BRIGHTNESS_RANGE) if water else [],
            "brightness_mode": "seeded_continuous_low_frequency",
            "shore_water_cells": len(set(bank_masks) & water),
            "shore_land_cells": len(set(bank_masks) - water),
            "land_water_fringe_cells": .16,
        }
        for (x, z), cell in sorted(self.ground.items(), key=lambda item: (item[0][1], item[0][0])):
            kind = cell["ground"]
            self.flat(x, z, "rammed_earth" if kind in ("water", "bridge_deck") else kind)
        for (x, z), mask in sorted(road_masks.items()):
            if mask != 255:
                self.edge(x, z, "road_edge", mask)
        for x, z in sorted(water):
            self.flat(x, z, "water")
        for (x, z), mask in sorted(bank_masks.items()):
            if mask != 255:
                if (x, z) not in water:
                    self.tile(x, z, "water", alpha_mask=water_fringe_mask(mask))
                self.edge(x, z, "riverbank", mask)
        # A bridge sprite describes the entire span, never one sprite per water cell.
        self.bridge_details()
        for (x, z), cell in sorted(self.ground.items()):
            overlay = cell.get("overlay")
            if overlay and not any(overlay.endswith("_" + kind) for kind in ("road_edge", "riverbank", "bridge_deck")):
                if not self.tile(x, z, overlay):
                    p = project(x + .5, z + .5, self.height, self.scale)
                    self.draw.ellipse((p[0] - 2, p[1] - 2, p[0] + 2, p[1] + 2), fill="#bc5090")

    def bridge_details(self) -> None:
        try:
            from .bridge_assembly import assemble_bridges
        except ImportError:
            from bridge_assembly import assemble_bridges
        assemble_bridges(self.canvas, self.spec, self.tiles,
                         lambda x, z: project(x, z, self.height, self.scale), self.scale)

    def block(self, building: dict, color: str = "#85765f", tall: float = 2.0,
              label: bool = True) -> None:
        polygon = [project(x, z, self.height, self.scale) for x, z in footprint_corners(building)]
        lift = 16 * math.sqrt(6) * tall * self.scale
        top = [(x, y - lift) for x, y in polygon]
        for a, b in ((0, 1), (1, 2)):
            self.draw.polygon([polygon[a], polygon[b], top[b], top[a]], fill=color, outline="#504c43")
        self.draw.polygon(top, fill="#b8ad95", outline="#56594d")
        if label:
            center = (sum(p[0] for p in top) / 4, sum(p[1] for p in top) / 4)
            text = building["id"]
            font = ImageFont.load_default()
            box = self.draw.textbbox((0, 0), text, font=font)
            at = center[0] - (box[2] - box[0]) / 2, center[1] - 5
            self.draw.text(at, text, font=font, fill="#262e28", stroke_width=1, stroke_fill="#dfd6bf")

    def building(self, instance: dict) -> None:
        found = self.buildings.resolve(instance["type"], rotation_deg=instance.get("rotation_deg", 0))
        if found is not None:
            sprite, meta = found
            anchor = _anchor(meta)
            footprint = meta.get("footprint_m", meta.get("footprint_cells"))
            source_width = meta.get("footprint_width_px")
            if source_width is None and isinstance(footprint, dict):
                w, h = footprint.get("w"), footprint.get("h", footprint.get("d"))
                if _positive_number(w) and _positive_number(h):
                    source_width = 32 * (w + h)
            if (anchor and _positive_number(source_width)
                    and 0 <= anchor[0] <= sprite.width and 0 <= anchor[1] <= sprite.height):
                x = instance["origin"]["x"] + instance["size"]["w"] / 2
                z = instance["origin"]["z"] + instance["size"]["h"] / 2
                target_width = 32 * (instance["size"]["w"] + instance["size"]["h"])
                _paste(self.canvas, sprite, project(x, z, self.height, self.scale), anchor,
                       self.scale * target_width / source_width)
                return
            self.buildings.missing.add(instance["type"] + "/anchor-or-footprint")
        self.block(instance)

    def decoration(self, item: dict) -> None:
        x, z = item["at"]["x"], item["at"]["z"]
        asset_id = item["asset_id"]
        found = self.buildings.resolve(asset_id, variant_index=variant_hash(self.root, x, z, asset_id) % 2)
        at = project(x + .5, z + .5, self.height, self.scale)
        if found is not None:
            sprite, meta = found
            anchor = _anchor(meta)
            if anchor:
                _paste(self.canvas, sprite, at, anchor, self.scale)
                return
            self.buildings.missing.add(asset_id + "/anchor_px")
        s = self.scale
        stem = 24 if "grass" in asset_id or "camellia" in asset_id else 72
        self.draw.line([at, (at[0], at[1] - stem * s)], fill="#665c42", width=max(1, round(4 * s)))
        self.draw.ellipse((at[0] - 20 * s, at[1] - (stem + 18) * s,
                           at[0] + 20 * s, at[1] - (stem - 18) * s), fill="#60785a", outline="#405b48")

    def gate(self, gate: dict) -> None:
        try:
            from .common import gate_cells
            from .gate_assembly import assemble_gate
        except ImportError:
            from common import gate_cells
            from gate_assembly import assemble_gate
        x, z = gate["at"]["x"], gate["at"]["z"]
        found = self.tiles.resolve(gate["asset_type"], rotation_deg=gate["rotation_deg"],
                                   width_cells=gate["width_cells"])
        full, passage = gate_cells(gate), gate_cells(gate, passage=True)
        if found and assemble_gate(self.canvas, found, full, passage, gate["rotation_deg"],
                                   lambda x, z: project(x, z, self.height, self.scale),
                                   self.scale, self.tiles):
            return
        lo_x, hi_x = min(p[0] for p in full), max(p[0] for p in full) + 1
        lo_z, hi_z = min(p[1] for p in full), max(p[1] for p in full) + 1
        if found is not None and _anchor(found[1]) and _positive_number(found[1].get("footprint_width_px")):
            target_width = 32 * (hi_x - lo_x + hi_z - lo_z)
            _paste(self.canvas, found[0],
                   project((lo_x + hi_x)/2, (lo_z + hi_z)/2, self.height, self.scale),
                   _anchor(found[1]), self.scale * target_width / found[1]["footprint_width_px"])
            return
        if found is not None:
            self.tiles.missing.add(gate["asset_type"] + "/anchor_px")
        # Pillars never paint a solid ground-level wall across the passage.
        for a, b in sorted(full - passage, key=lambda p: p[0] - p[1]):
            block = {"id": gate["id"], "origin": {"x": a, "z": b}, "size": {"w": 1, "h": 1}}
            self.block(block, "#7c8071", 3.5, label=False)
        roof = _polygon(lo_x, lo_z, self.height, self.scale, hi_x - lo_x, hi_z - lo_z, 4)
        self.draw.polygon(roof, fill="#666c5a", outline="#393e36")

    def objects(self) -> None:
        try:
            from .common import gate_cells, polyline_cells, wall_specs
            from .seam_assembly import WallAssembly
        except ImportError:
            from common import gate_cells, polyline_cells, wall_specs
            from seam_assembly import WallAssembly
        gates = [*self.spec.get("gates", []), *self.spec.get("water_gates", [])]
        covered = set().union(*(gate_cells(gate) for gate in gates))
        all_wall = set().union(*(polyline_cells(wall["polygon"]["points"], vertices=True,
                                                closed=True) for wall in wall_specs(self.spec))) - covered
        wall = visible_wall_cells(self.spec, all_wall)
        walls = WallAssembly(self, wall, covered)
        # Nonphysical planning envelopes belong only in planning views, never the PNG.
        objects = []
        for x, z in wall:
            item = {"id": f"wall_{z}_{x}", "origin": {"x": x, "z": z}, "size": {"w": 1, "h": 1}}
            objects.append((building_sort_key(item, self.height), "wall", item))
        for item in self.layout.get("buildings", []):
            objects.append((building_sort_key(item, self.height), "building", item))
        for item in self.layout.get("decorations", []):
            shape = {"id": item["id"], "origin": item["at"], "size": {"w": 1, "h": 1}}
            objects.append((building_sort_key(shape, self.height), "decoration", item))
        for gate in gates:
            cells = gate_cells(gate)
            x, z = min(p[0] for p in cells), min(p[1] for p in cells)
            shape = {"id": gate["id"], "origin": {"x": x, "z": z},
                     "size": {"w": max(p[0] for p in cells) + 1 - x, "h": max(p[1] for p in cells) + 1 - z}}
            objects.append((building_sort_key(shape, self.height), "gate", gate))
        for _, kind, item in sorted(objects, key=lambda item: item[0]):
            if kind == "wall":
                x, z = item["origin"]["x"], item["origin"]["z"]
                if not walls.draw_cell(x, z):
                    self.block(item, "#858678", 1.5, label=False)
            elif kind == "building":
                self.draw_order.append(item["id"])
                self.building(item)
            elif kind == "gate":
                self.gate(item)
            else:
                self.decoration(item)


def write_overlay(layout: dict, spec: dict, path: Path, image_path: Path,
                  size: tuple[int, int], missing: list[str], top_padding: int = 0) -> None:
    """SVG uses master-pixel viewBox; all debug groups can be toggled separately."""
    width, height = layout["grid"]["width"], layout["grid"]["height"]
    master_w, master_h = (width + height) * 32, (width + height) * 16 + top_padding
    lines = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size[0]}" height="{size[1]}" '
             f'viewBox="0 0 {master_w} {master_h}">',
             '<style>text{font-family:monospace;font-size:16px;paint-order:stroke;stroke:#f8f5e9;'
             'stroke-width:3px;stroke-linejoin:round} .outline{fill:none;stroke-width:2}</style>',
             '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" '
             'orient="auto"><path d="M0 0L8 3L0 6" fill="#244fa0"/></marker></defs>',
             '<desc>' + escape(json.dumps({"missing_assets": missing}, ensure_ascii=False)) + '</desc>']
    if path.parent.resolve() == image_path.parent.resolve():
        lines += ['<g id="preview">', f'<image href="{escape(image_path.name, quote=True)}" '
                  f'width="{master_w}" height="{master_h}"/>', '</g>']
    lines.append(f'<g id="planning" transform="translate(0 {top_padding})">')

    def coords(points):
        return " ".join(f"{a:.2f},{b:.2f}" for a, b in (project(x, z, height) for x, z in points))

    def text_at(x, z, label, color="#263331"):
        a, b = project(x, z, height)
        return f'<text x="{a:.2f}" y="{b:.2f}" fill="{color}">{escape(str(label))}</text>'

    lines.append('<g id="grid" opacity=".5">')
    for x in range(0, width + 1, 8):
        stroke = 2 if x % 32 == 0 else .7
        lines.append(f'<polyline points="{coords([(x, 0), (x, height)])}" fill="none" '
                     f'stroke="#37444b" stroke-width="{stroke}"/>')
        lines.append(text_at(x, 0, f"x={x}"))
    for z in range(0, height + 1, 8):
        stroke = 2 if z % 32 == 0 else .7
        lines.append(f'<polyline points="{coords([(0, z), (width, z)])}" fill="none" '
                     f'stroke="#37444b" stroke-width="{stroke}"/>')
        lines.append(text_at(0, z, f"z={z}"))
    lines.append('</g><g id="zones">')
    zone_colors = ["#d48770", "#82a470", "#bdaa68", "#829abb", "#af85af"]
    for i, zone in enumerate(spec.get("zones", [])):
        shape = zone["geometry"]
        if "rect" in shape:
            lo, hi = shape["rect"]["min"], shape["rect"]["max"]
            points = [(lo["x"], lo["z"]), (hi["x"], lo["z"]),
                      (hi["x"], hi["z"]), (lo["x"], hi["z"])]
        else:
            points = [(p["x"], p["z"]) for p in shape["polygon"]["points"]]
        color = zone_colors[i % len(zone_colors)]
        lines.append(f'<polygon points="{coords(points)}" fill="{color}" fill-opacity=".08" '
                     f'stroke="{color}" stroke-width="3"/>')
        lines.append(text_at(*points[-1], f'{zone["id"]} p={zone["priority"]}'))
    lines.append('</g><g id="roads-water" fill="none">')
    for field, color in (("streets", "#bc8635"), ("rivers", "#186b8d")):
        for item in spec.get(field, []):
            points = [(p["x"] + .5, p["z"] + .5) for p in item["points"]]
            lines.append(f'<polyline points="{coords(points)}" stroke="{color}" stroke-width="3" '
                         f'stroke-dasharray="9 4"><title>{escape(item["id"])} '
                         f'width={item["width_cells"]}</title></polyline>')
    for lake in spec.get("lakes", []):
        points = [(p["x"], p["z"]) for p in lake["polygon"]["points"]]
        lines.append(f'<polygon points="{coords(points)}" stroke="#186b8d" stroke-width="3" '
                     f'stroke-dasharray="9 4"><title>{escape(lake["id"])} lake boundary</title></polygon>')
    for item in layout.get("generated_connectors", []):
        points = item.get("cells", [])
        if points:
            lines.append(f'<polyline points="{coords([(p["x"]+.5,p["z"]+.5) for p in points])}" '
                         'stroke="#ffad00" stroke-width="4"/>')
    for field in ("bridges", "gates", "water_gates"):
        for item in spec.get(field, []):
            lines.append(text_at(item["at"]["x"], item["at"]["z"], item["id"], "#214d7a"))
    lines.append('</g><g id="buildings">')
    issues = layout.get("validation", {}).get("issues", [])
    for i, building in enumerate(layout.get("buildings", [])):
        conflict = any(issue.get("severity") == "error" and
                       (issue.get("path") == f"buildings[{i}]" or building["id"] in issue.get("message", ""))
                       for issue in issues)
        color = "#d12838" if conflict else "#45443c"
        lines.append(f'<polygon points="{coords(footprint_corners(building))}" class="outline" stroke="{color}"/>')
        x = building["origin"]["x"] + building["size"]["w"] / 2
        z = building["origin"]["z"] + building["size"]["h"] / 2
        lines.append(text_at(x, z, f'{building["id"]} {building["type"]}', color))
        for door in building.get("entrance_cells", []):
            lines.append(f'<polyline points="{coords([(x,z),(door["x"]+.5,door["z"]+.5)])}" '
                         'fill="none" stroke="#244fa0" stroke-width="2" marker-end="url(#arrow)"/>')
    lines.append('</g><g id="walk" style="display:none" fill="#cb3441" fill-opacity=".22">')
    blocked = [point for point, cell in ground_records(layout).items() if not cell["walkable"]]
    for x, z in blocked:
        lines.append(f'<polygon points="{coords([(x,z),(x+1,z),(x+1,z+1),(x,z+1)])}"/>')
    vertices = [(math.sqrt(3)/3, 1/3), (0, 2/3), (-math.sqrt(3)/3, 1/3),
                (-math.sqrt(3)/3, -1/3), (0, -2/3), (math.sqrt(3)/3, -1/3)]
    for point in layout.get("walk_layer", {}).get("runtime_hex_blocked", []):
        wx = 2 * math.sqrt(3) / 3 * (point["q"] + point["r"] / 2)
        wz = point["r"]
        polygon = [(wx + dx, height - wz - dz) for dx, dz in vertices]
        lines.append(f'<polygon points="{coords(polygon)}" fill="none" stroke="#792863" stroke-width="1"/>')
    lines.append('</g><g id="validation">')
    for i, asset_id in enumerate(missing[:12]):
        lines.append(f'<text x="20" y="{30 + 23*i}" fill="#9b3349">missing: {escape(asset_id)}</text>')
    if len(missing) > 12:
        lines.append(f'<text x="20" y="320">+ {len(missing)-12} missing; full list in SVG desc / render JSON</text>')
    for issue in issues:
        at = issue.get("at")
        if at and "x" in at:
            x, y = project(at["x"] + .5, at["z"] + .5, height)
            lines.append(f'<circle cx="{x}" cy="{y}" r="18" fill="none" stroke="#df2436" stroke-width="4">'
                         f'<title>{escape(issue["message"])}</title></circle>')
    lines.append('</g></g></svg>')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def incomplete_watermark(canvas: Image.Image, validation: dict) -> str | None:
    """Keep failed diagnostic layouts visibly distinct from valid previews."""
    if validation.get("errors", 0) <= 0:
        return None
    first = next((issue for issue in validation.get("issues", [])
                  if issue.get("severity") == "error"), {})
    code = first.get("code", "TOWN_VALIDATION_ERROR")
    message = f"INCOMPLETE LAYOUT | {code}"
    font = ImageFont.load_default()
    bounds = font.getbbox(message)
    text_layer = Image.new("RGBA", (bounds[2] - bounds[0] + 4, bounds[3] - bounds[1] + 4))
    ImageDraw.Draw(text_layer).text((2 - bounds[0], 2 - bounds[1]), message,
                                   font=font, fill="#85172e")
    ratio = min(2.0, max(1, canvas.width - 20) / text_layer.width,
                max(1, canvas.height - 8) / text_layer.height)
    text_layer = text_layer.resize((max(1, round(text_layer.width * ratio)),
                                   max(1, round(text_layer.height * ratio))), Image.Resampling.NEAREST)
    bar_height = min(canvas.height, text_layer.height + 12)
    ImageDraw.Draw(canvas).rectangle((0, 0, canvas.width, bar_height), fill="#f7d7d4", outline="#a42f3a", width=2)
    canvas.alpha_composite(text_layer, (max(0, (canvas.width - text_layer.width) // 2), 6))
    return f"{message}; validation.errors={validation['errors']}，仅供诊断，未通过完整布局校验"


def render_layout(layout: dict, output: str | Path, *, spec: dict | None = None,
                  tile_manifest: str | Path | None = None,
                  building_manifest: str | Path | None = None,
                  scale: float = 1.0, overlay: str | Path | None = None,
                  placeholders_only: bool = False, jpeg_quality: int = 85) -> dict:
    """Render a deterministic image; return metrics and every missing asset key."""
    started = time.perf_counter()
    if not isinstance(scale, (float, int)) or not math.isfinite(scale) or scale <= 0:
        raise ValueError("scale 必须为有限正数")
    spec = _source(layout, spec)
    if layout["grid"] != spec["grid"]:
        raise ValueError("CitySpec 与 TownLayout.grid 不一致")
    span = layout["grid"]["width"] + layout["grid"]["height"]
    if round(span * 16 * scale) < 1:
        raise ValueError("scale 太小：输出高度不足 1 像素")
    if span * span * 512 * scale * scale > 200_000_000:
        raise ValueError("输出超过 200 MP；请调低 --scale")
    if type(jpeg_quality) is not int or not 1 <= jpeg_quality <= 100:
        raise ValueError("jpeg_quality 须为 1..100 的整数")
    output = Path(output)
    is_jpeg = output.suffix.lower() in {".jpg", ".jpeg"}
    tiles = asset_library("tile", spec["era_kit"], tile_manifest, placeholders_only)
    buildings = asset_library("building-map", spec["era_kit"], building_manifest, placeholders_only)
    painter = Painter(layout, spec, tiles, buildings, scale,
                      background="#faf8ef" if is_jpeg else "#ede8d9")
    painter.terrain()
    painter.objects()
    incomplete = incomplete_watermark(painter.canvas, layout.get("validation", {}))
    warnings = tiles.warnings | buildings.warnings
    if incomplete:
        warnings.add(incomplete)
    output.parent.mkdir(parents=True, exist_ok=True)
    if is_jpeg:
        flattened = Image.new("RGB", painter.canvas.size, "#faf8ef")
        flattened.paste(painter.canvas, mask=painter.canvas.getchannel("A"))
        flattened.save(output, format="JPEG", quality=jpeg_quality, optimize=True)
    else:
        painter.canvas.save(output, format="PNG")
    missing = sorted(tiles.missing | buildings.missing)
    if overlay is not None:
        write_overlay(layout, spec, Path(overlay), output, painter.canvas.size, missing,
                      painter.top_padding)
    return {"output": str(output), "size_px": list(painter.canvas.size), "scale": scale,
            "diagnostic": incomplete is not None,
            "elapsed_seconds": round(time.perf_counter() - started, 4),
            "top_padding_master_px": painter.top_padding,
            "water_surface": painter.water_metrics,
            "missing_assets": missing, "warnings": sorted(warnings),
            "used_asset_ids": sorted(tiles.used_ids | buildings.used_ids),
            "asset_substitutions": [dict(requested_id=a, actual_id=b, reason=c)
                                    for a, b, c in sorted(tiles.substitutions | buildings.substitutions)],
            "building_draw_order": painter.draw_order,
            "overlay": str(overlay) if overlay is not None else None}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("layout", type=Path, help="TownLayout YAML")
    parser.add_argument("-o", "--output", type=Path, required=True, help="输出 PNG 或 JPEG")
    parser.add_argument("--spec", type=Path, help="覆盖 source_spec.path")
    parser.add_argument("--tile-manifest", type=Path)
    parser.add_argument("--building-manifest", type=Path)
    parser.add_argument("--scale", type=float, default=1.0, help="相对 64×32 母版比例")
    parser.add_argument("--overlay", type=Path, help="输出独立 SVG；walk 组默认隐藏")
    parser.add_argument("--placeholders-only", action="store_true", help="强制占位，仍报告缺失键")
    parser.add_argument("--jpeg-quality", type=int, default=85, help="JPEG 质量，默认 85")
    parser.add_argument("--report", type=Path, help="保存渲染 JSON（stdout 也始终打印）")
    args = parser.parse_args(argv)
    try:
        layout = yaml.safe_load(args.layout.read_text(encoding="utf-8"))
        spec = yaml.safe_load(args.spec.read_text(encoding="utf-8")) if args.spec else None
        report = render_layout(layout, args.output, spec=spec, tile_manifest=args.tile_manifest,
                               building_manifest=args.building_manifest, scale=args.scale,
                               overlay=args.overlay, placeholders_only=args.placeholders_only,
                               jpeg_quality=args.jpeg_quality)
        serialized = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(serialized, encoding="utf-8")
        print(serialized, end="")
        return 0
    except (OSError, ValueError, KeyError, TypeError, yaml.YAMLError) as exc:
        print(f"TOWN_RENDER_ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
