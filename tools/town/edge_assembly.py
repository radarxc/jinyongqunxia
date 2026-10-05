"""Select shoreline pieces without changing logical water occupancy."""

from PIL import Image, ImageDraw

# Same planning axes and bit order as render_town.autotile_mask.
NEIGHBORS = ((0, 1), (1, 1), (1, 0), (1, -1),
             (0, -1), (-1, -1), (-1, 0), (-1, 1))


def shore_bank_masks(water: set[tuple[int, int]], domain: set[tuple[int, int]]
                     ) -> dict[tuple[int, int], int]:
    """Both sides, including diagonal contact; outside the frame is not land.

    A zero bit faces the opposite material. Keep raw diagonal bits so an
    isolated concave corner can receive a tiny corner cap, not a full V.
    """
    result = {}
    for x, z in domain:
        wet = (x, z) in water
        opposite = sum(1 << i for i, (dx, dz) in enumerate(NEIGHBORS)
                       if (x + dx, z + dz) in domain
                       and ((x + dx, z + dz) in water) != wet)
        if opposite:
            result[x, z] = 255 ^ opposite
    return result


def water_fringe_mask(mask: int) -> Image.Image:
    """A narrow wet strip on dry cells, with tiny diagonal-only corner caps.

    Coordinates are the native 64x32 diamond. The strip is 0.16 grid cells
    deep, stays inside its tile, and never modifies collision/water_cells.
    """
    image = Image.new("L", (64, 32))
    draw = ImageDraw.Draw(image)
    def uv(points):
        return [(32 * (u + v), 16 * (1 + u - v)) for u, v in points]
    d = .16
    strips = ((1, [(0, 1-d), (1, 1-d), (1, 1), (0, 1)]),
              (4, [(1-d, 0), (1, 0), (1, 1), (1-d, 1)]),
              (16, [(0, 0), (1, 0), (1, d), (0, d)]),
              (64, [(0, 0), (d, 0), (d, 1), (0, 1)]))
    for bit, points in strips:
        if not mask & bit:
            draw.polygon(uv(points), fill=215)
    for bit, u, v in ((2, 1, 1), (8, 1, 0), (32, 0, 0), (128, 0, 1)):
        if not mask & bit:
            du, dv = d if u == 0 else -d, d if v == 0 else -d
            draw.polygon(uv([(u, v), (u+du, v), (u, v+dv)]), fill=215)
    return image


def land_bank_masks(water: set[tuple[int, int]], land: set[tuple[int, int]]
                    ) -> dict[tuple[int, int], int]:
    """An exposed side of a land tile faces water, never the map exterior.

    Only cardinal contact creates a bank. Diagonal-only contact is completed by
    the neighboring banks and must not create a short V inside the water.
    """
    result = {}
    for x, z in land - water:
        mask = sum(1 << i for i, (dx, dz) in enumerate(NEIGHBORS)
                   if (x + dx, z + dz) not in water)
        if mask & 85 == 85:
            continue
        for diagonal, first, second in ((2, 1, 4), (8, 4, 16),
                                        (32, 16, 64), (128, 64, 1)):
            if not mask & first or not mask & second:
                mask &= ~diagonal
        result[x, z] = mask
    return result
