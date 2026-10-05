"""Register native gate piers to the unchanged planning rectangle.

The native PNGs have approximate 2:1 ground slopes. Per-column affine strips
fit their measured ground feet while keeping verticals vertical, retaining the
source roof, texture and light. No image or CitySpec is rewritten.
"""
from math import ceil, floor, sqrt

from PIL import Image


# Five front-ground landmarks, left to right. For 0/180 they mark front-left,
# left opening, right opening, front-right, rear-right. For 90/270 they mark
# front-left, front-right, left opening, right opening, rear-right.
# Calibration is tied to the delivered PNG hash, never inferred from canvas size.
GATES = {
    "tex_town_song_dali_city_gate__k6_r000_v01": (
        "e9b506106cb9990538b516b27e1526bbc5262841c9737f41a20c4058ee8073d5",
        ((31, 227), (100, 252), (294, 302), (356, 325), (435, 288)), 114),
    "tex_town_song_dali_city_gate__k5_r180_v01": (
        "4e468b8a3eabe66541b0f8b38258e03d0ab92b89a913eddb0fc97aca5907dee5",
        ((13, 215), (82, 239), (232, 273), (301, 296), (398, 253)), 99),
    "tex_town_song_southern_city_gate__k8_r000_v01": (
        "71b7989460b8b1308da88e710b001309f36b7fd647d64a59529fcbe6534b6786",
        ((59, 263), (130, 285), (364, 341), (446, 367), (502, 334)), 108),
    "tex_town_song_southern_city_gate__k7_r180_v01": (
        "7ff9687c6708ce491a0cbdfdf5ca7e70e8a9b4c23452928829f91595fd4eb2af",
        ((63, 269), (126, 285), (352, 330), (416, 347), (493, 327)), 108),
    "tex_town_song_southern_city_gate__k5_r090_v01": (
        "cf496605ee82c8a3acac02fa162e6a6ff80c7004da6f1bad51ed665aa99d07db",
        ((66, 269), (138, 299), (200, 284), (371, 249), (427, 237)), 100),
    "tex_town_song_southern_city_gate__k6_r270_v01": (
        "57f4428ec34f3f7932ac4b6cd203a33a23a5627d6879477f6b473ab96e14d0d8",
        ((59, 321), (166, 360), (233, 339), (408, 300), (489, 276)), 105),
}


def ground_targets(full, passage, rotation, project):
    """Return matching visual feet from full/passage cell bounds."""
    x0, z0 = min(x for x, z in full), min(z for x, z in full)
    x1, z1 = max(x for x, z in full)+1, max(z for x, z in full)+1
    if rotation in (0, 180):
        left, right = min(x for x, z in passage), max(x for x, z in passage)+1
        points = ((x0, z0), (left, z0), (right, z0), (x1, z0), (x1, z1))
    else:
        left, right = min(z for x, z in passage), max(z for x, z in passage)+1
        points = ((x0, z0), (x1, z0), (x1, left), (x1, right), (x1, z1))
    return tuple(project(x, z) for x, z in points)


def fit_vertical_strips(canvas, sprite, source, target, vertical_scale):
    """Fit ground profiles without shearing upright posts or adding a floor."""
    for index, (s0, s1, t0, t1) in enumerate(zip(source, source[1:], target, target[1:])):
        dx = (s1[0]-s0[0])/(t1[0]-t0[0])
        # Inverse affine: u = dx*x+c; v = d*x+e*y+f.
        # All pixels above a measured foot retain the same x as that foot.
        d = ((s1[1]-s0[1])-(t1[1]-t0[1])/vertical_scale)/(t1[0]-t0[0])
        e = 1/vertical_scale
        c, f = s0[0]-dx*t0[0], s0[1]-d*t0[0]-e*t0[1]
        left = floor((0-c)/dx) if index == 0 else round(t0[0])
        right = ceil((sprite.width-c)/dx) if index == len(source)-2 else round(t1[0])
        top = floor(min((-d*x-f)/e for x in (left, right)))
        bottom = ceil(max((sprite.height-d*x-f)/e for x in (left, right)))
        if right <= left or bottom <= top:
            continue
        piece = sprite.transform((right-left, bottom-top), Image.Transform.AFFINE,
                                 (dx, 0, c+dx*left, d, e, f+d*left+e*top),
                                 Image.Resampling.BICUBIC)
        canvas.alpha_composite(piece, (left, top))


def assemble_gate(canvas, found, full, passage, rotation, project, scale, library):
    """True for a calibrated delivery; other gate libraries use normal metadata."""
    sprite, meta = found
    asset_id = meta.get("id")
    if asset_id not in GATES:
        return False
    expected, feet, pier_height = GATES[asset_id]
    if meta.get("sha256") != expected:
        library.missing.add(asset_id + "/uncalibrated-gate-view")
        return False
    targets = ground_targets(full, passage, rotation, project)
    fit_vertical_strips(canvas, sprite, feet, targets, scale*16*sqrt(6)*3/pier_height)
    return True
