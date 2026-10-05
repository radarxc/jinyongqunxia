"""Join wall cells with native material, without repeating exposed cube ends.

The source PNG is read-only. Its opaque face interiors supply the material;
geometry comes from the occupied cells and the registered three-metre wall.
"""
from __future__ import annotations

import math
from PIL import Image, ImageDraw, ImageOps


def visible_faces(x: int, z: int, occupied: set[tuple[int, int]]) -> tuple[str, ...]:
    """Only camera-facing boundary faces are drawn; internal joins have none."""
    return tuple(name for name, point in (("south", (x, z - 1)),
                                          ("east", (x + 1, z))) if point not in occupied)


def _material(source: Image.Image, face: str) -> Image.Image:
    bounds = source.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("wall material cannot be empty")
    x, y, right, bottom = bounds
    w, h = right - x, bottom - y
    area = {"south": (.16, .36, .38, .68),
            "east": (.62, .36, .84, .68),
            "top": (.42, .055, .58, .09)}[face]
    start_x, start_y = x + area[0]*w, y + area[1]*h
    size = (max(1, round((area[2]-area[0])*w)),
            max(1, round((area[3]-area[1])*h)))
    # Undo the source face's screen slope before mapping it onto world faces.
    slope = {"south": .5, "east": -.5, "top": 0}[face]
    patch = source.transform(size, Image.Transform.AFFINE,
                             (1, 0, start_x, slope, 1, start_y),
                             Image.Resampling.BICUBIC).convert("RGB")
    # Mirrored wallpaper meets at identical texels; no dark sprite outlines.
    row = Image.new("RGB", (patch.width * 2, patch.height))
    row.paste(patch, (0, 0))
    row.paste(ImageOps.mirror(patch), (patch.width, 0))
    tile = Image.new("RGB", (row.width, row.height * 2))
    tile.paste(row, (0, 0))
    tile.paste(ImageOps.flip(row), (0, row.height))
    return tile


def _face(tile: Image.Image, size: tuple[int, int], polygon: list[tuple],
          matrix: tuple[float, ...], phase: int) -> Image.Image:
    # Pillow samples pixel centres; a negative-u axis at the closed x=64
    # boundary samples u=-0.5. Pad the *texture*, not the geometry, so the
    # bicubic footprint never reads the atlas's black outside fill.
    pad = 4
    atlas = Image.new("RGB", (size[0] + tile.width * 2 + pad * 2,
                              size[1] + tile.height * 2 + pad * 2))
    for y in range(pad % tile.height - tile.height, atlas.height, tile.height):
        for x in range((pad-phase) % tile.width - tile.width, atlas.width, tile.width):
            atlas.paste(tile, (x, y))
    a, b, c, d, e, f = matrix
    matrix = (a, b, c + pad, d, e, f + pad)
    texture = atlas.transform(size, Image.Transform.AFFINE, matrix,
                              resample=Image.Resampling.BICUBIC).convert("RGBA")
    mask = Image.new("L", size)
    ImageDraw.Draw(mask).polygon(polygon, fill=255)
    texture.putalpha(mask)
    return texture


class WallAssembly:
    """Painter adapter; draw each cell at its existing depth-sort position."""

    def __init__(self, painter, wall: set[tuple[int, int]], gates: set[tuple[int, int]]):
        self.painter = painter
        self.occupied = wall | gates
        self.cache = {}
        found = painter.tiles.resolve(f"tex_town_{painter.era}_wall", rotation_deg=0)
        self.materials = ({face: _material(found[0], face) for face in ("south", "east", "top")}
                          if found and found[0].getchannel("A").getbbox() else {})
        # Height in world metres, matching the source wall's declared shape.
        self.rise = 16 * math.sqrt(6) * 3

    def sprite(self, x: int, z: int) -> Image.Image:
        faces = visible_faces(x, z, self.occupied)
        phases = tuple((32 * (x if face != "east" else -z)) % tile.width
                       for face, tile in self.materials.items())
        key = faces, phases
        if key in self.cache:
            return self.cache[key]
        h = self.rise
        size = (65, math.ceil(h + 33))
        canvas = Image.new("RGBA", size)
        polygons = {
            "south": [(0, 16), (32, 32), (32, h+32), (0, h+16)],
            "east": [(32, 32), (64, 16), (64, h+16), (32, h+32)],
            "top": [(0, 16), (32, 0), (64, 16), (32, 32)],
        }
        mappings = {"south": (1, 0, 0, -.5, 1, -16),
                    "east": (-1, 0, 64, .5, 1, -48),
                    "top": (.5, 1, -16, -.5, 1, 16)}
        for face in ("top", *faces):
            phase = 32 * (x if face != "east" else -z)
            canvas.alpha_composite(_face(self.materials[face], size,
                                        polygons[face], mappings[face], phase))
        self.cache[key] = canvas
        return canvas

    def draw_cell(self, x: int, z: int) -> bool:
        if not self.materials:
            return False
        painter = self.painter
        try:
            from .render_town import _paste, project
        except ImportError:
            from render_town import _paste, project
        at = project(x + .5, z + .5, painter.height, painter.scale)
        _paste(painter.canvas, self.sprite(x, z), at, (32, self.rise + 16), painter.scale)
        return True
