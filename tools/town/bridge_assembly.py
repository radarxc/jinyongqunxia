"""Fit native bridge imagery to unchanged, connected planning footprints."""
from math import ceil, floor

from PIL import Image, ImageChops, ImageDraw

try:
    from .common import bridge_rectangle
except ImportError:
    from common import bridge_rectangle


def bridge_groups(bridges):
    """Unify overlapping parallel crossings only when their union is rectangular.

    Linan's north crossings connect two streets across east_canal: their exact
    cell union is [98,106) × [138,145), rather than two stacked bridge sprites.
    The CitySpec objects and their coordinates remain untouched.
    """
    groups = []
    for bridge in bridges:
        group = ([bridge], bridge_rectangle(bridge))
        for index in range(len(groups) - 1, -1, -1):
            members, cells = groups[index]
            same_axis = members[0]["rotation_deg"] == bridge["rotation_deg"]
            same_river = members[0].get("river_ref") == bridge.get("river_ref")
            union = cells | group[1]
            x0, z0, x1, z1 = bounds(union)
            if same_axis and same_river and cells & group[1] and len(union) == (x1-x0)*(z1-z0):
                group = (members + group[0], union)
                groups.pop(index)
        groups.append(group)
    return groups


def bounds(cells):
    return (min(x for x, z in cells), min(z for x, z in cells),
            max(x for x, z in cells) + 1, max(z for x, z in cells) + 1)


# Pixel landmarks measured on the existing native sprites; no assets are edited.
# Deck points are slightly inset on the textured top, avoiding antialiased gaps.
DECK_POINTS = {0: ((37, 112), (108, 149), (213, 20)),
               90: ((15, 76), (361, 242), (131, 14))}
RAIL_BASES = {0: (((45, 144), (209, 64)), ((116, 186), (285, 100))),
              90: (((49, 131), (406, 324)), ((161, 75), (514, 265)))}
CALIBRATED_SHA256 = {
    0: ("d08816357ef2fcd590ca4b43dcb1348440762e347fc6dbab2072b7e7e7311855",
        "1d30003b295213bd05a222fb25652643acd1ae54815a34b8e2203a178f710632"),
    90: ("a6b67d2d25a18ec58c549d2d5c2537ec60dbd6d3c952070ae8f7112efbf20065",
         "29a31c125c0c815fb3a8519467b62983e6c1f8bd1d8b0688b92d508978180840"),
}


def fit_sprite(canvas, sprite, source, target, clip=None):
    """Map two independent ground axes; preserve texture without flat filler."""
    s0, s1, s2 = source
    t0, t1, t2 = target
    ux, uy = t1[0]-t0[0], t1[1]-t0[1]
    vx, vy = t2[0]-t0[0], t2[1]-t0[1]
    det = ux*vy - uy*vx
    if abs(det) < 1e-8:
        raise ValueError("Degenerate bridge footprint")
    a = ((s1[0]-s0[0])*vy - (s2[0]-s0[0])*uy) / det
    b = (-(s1[0]-s0[0])*vx + (s2[0]-s0[0])*ux) / det
    d = ((s1[1]-s0[1])*vy - (s2[1]-s0[1])*uy) / det
    e = (-(s1[1]-s0[1])*vx + (s2[1]-s0[1])*ux) / det
    c, f = s0[0]-a*t0[0]-b*t0[1], s0[1]-d*t0[0]-e*t0[1]
    inverse = a*e-b*d
    corners = [((e*(x-c)-b*(y-f))/inverse,
                (-d*(x-c)+a*(y-f))/inverse)
               for x, y in ((0, 0), (sprite.width, 0),
                            (sprite.width, sprite.height), (0, sprite.height))]
    box = (floor(min(x for x, y in corners))-1, floor(min(y for x, y in corners))-1,
           ceil(max(x for x, y in corners))+1, ceil(max(y for x, y in corners))+1)
    left, top, right, bottom = box
    warped = sprite.transform((right-left, bottom-top), Image.Transform.AFFINE,
                              (a, b, c+a*left+b*top, d, e, f+d*left+e*top),
                              Image.Resampling.BICUBIC)
    if clip:
        mask = Image.new("L", warped.size)
        ImageDraw.Draw(mask).polygon([(x-left, y-top) for x, y in clip], fill=255)
        warped.putalpha(ImageChops.multiply(warped.getchannel("A"), mask))
    canvas.alpha_composite(warped, (left, top))


def rail_piece(sprite, rotation, index):
    """Separate native rails at the transparent gap, never mirror the light."""
    slope, intercept = (-.5, 190) if rotation == 0 else (.5, 30)
    mask = Image.new("L", sprite.size)
    ImageDraw.Draw(mask).polygon([(0, intercept), (sprite.width, intercept+slope*sprite.width),
                                  (sprite.width, sprite.height), (0, sprite.height)], fill=255)
    lower = (index == 1) if rotation == 0 else (index == 0)
    if not lower:
        mask = ImageChops.invert(mask)
    result = sprite.copy()
    result.putalpha(ImageChops.multiply(sprite.getchannel("A"), mask))
    return result


def assemble_bridges(canvas, spec, library, project, scale):
    """Draw exact deck unions and just their two outer long-side railings.

    ``project(x,z)`` supplies the caller's canvas origin and scale. Known native
    sprites are calibrated in image pixels; a new sprite requires new landmarks.
    """
    for bridges, cells in bridge_groups(spec.get("bridges", [])):
        rotation = bridges[0]["rotation_deg"]
        deck_id = f"tex_town_{spec['era_kit']}_bridge_deck"
        rail_id = f"tex_town_{spec['era_kit']}_bridge_rail"
        expected_sha = CALIBRATED_SHA256.get(rotation, (None, None))
        deck = library.calibrated_bridge(deck_id, rotation, expected_sha[0])
        rail = library.calibrated_bridge(rail_id, rotation, expected_sha[1])
        if deck is None or rail is None:
            continue  # AssetLibrary records missing dependencies; never paint flat substitutes.
        expected = {0: ((328, 181), (302, 214)), 90: ((498, 270), (533, 362))}
        signatures = tuple(item[1].get("sha256") for item in (deck, rail))
        if (rotation not in expected or (deck[0].size, rail[0].size) != expected[rotation]
                or signatures != CALIBRATED_SHA256[rotation]):
            library.missing.add(deck_id + "/uncalibrated-bridge-view")
            continue
        x0, z0, x1, z1 = bounds(cells)
        quad = [project(x0, z0), project(x1, z0), project(x1, z1), project(x0, z1)]
        fit_sprite(canvas, deck[0], DECK_POINTS[rotation], (quad[0], quad[1], quad[3]), quad)
        edges = [(quad[0], quad[3]), (quad[1], quad[2])] if rotation == 0 else [(quad[0], quad[1]), (quad[3], quad[2])]
        for index in sorted(range(2), key=lambda i: sum(p[1] for p in edges[i])):
            start, end = RAIL_BASES[rotation][index]
            t0, t1 = edges[index]
            fit_sprite(canvas, rail_piece(rail[0], rotation, index),
                       (start, end, (start[0], start[1]-32)),
                       (t0, t1, (t0[0], t0[1]-32*scale)))
