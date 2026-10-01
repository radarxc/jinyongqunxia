"""Create exact dimetric blockouts for the third xiyu geometry repair pass."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parent
SIZE = (1536, 1024)
COLORS = {
    "top": (218, 190, 145, 255),
    "front": (187, 139, 91, 255),
    "right": (151, 104, 70, 255),
    "inner": (126, 87, 59, 255),
    "edge": (45, 72, 87, 255),
}


def shifted(points, dy):
    return [(x, y - dy) for x, y in points]


def polygon(draw, points, fill):
    draw.polygon(points, fill=fill, outline=COLORS["edge"], width=3)


def solid_box(path, base, height, terrace=False):
    image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    left, front, right, rear = base
    top_left, top_front, top_right, top_rear = shifted(base, height)
    polygon(draw, [left, front, top_front, top_left], COLORS["front"])
    polygon(draw, [front, right, top_right, top_front], COLORS["right"])
    polygon(draw, [top_left, top_front, top_right, top_rear], COLORS["top"])
    if terrace:
        # A shallow front balcony remains inside the exact ground silhouette.
        p0 = (left[0] + 55, left[1] - 95)
        p1 = (front[0] - 55, front[1] - 95)
        p2 = (p1[0] + 44, p1[1] - 22)
        p3 = (p0[0] + 44, p0[1] - 22)
        polygon(draw, [p0, p1, p2, p3], COLORS["top"])
    image.save(path)


def courtyard(path, base, wall_height=185, inset=150):
    image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    left, front, right, rear = base
    polygon(draw, base, COLORS["top"])
    top = shifted(base, wall_height)
    polygon(draw, [left, front, top[1], top[0]], COLORS["front"])
    polygon(draw, [front, right, top[2], top[1]], COLORS["right"])
    polygon(draw, [top[0], top[1], top[2], top[3]], COLORS["top"])

    # Inner opening is the same dimetric rectangle, inset equally on all sides.
    unit_x = (front[0] - left[0]) / 10
    dx = unit_x * inset / 100
    dy = dx / 2
    inner = [
        (left[0] + 2 * dx, left[1]),
        (front[0], front[1] - 2 * dy),
        (right[0] - 2 * dx, right[1]),
        (rear[0], rear[1] + 2 * dy),
    ]
    polygon(draw, inner, COLORS["inner"])
    image.save(path)


def main():
    # Every base edge is exactly +0.5 or -0.5 in image coordinates.
    solid_box(
        ROOT / "house_large_geometry.png",
        [(230, 650), (810, 940), (1274, 708), (694, 418)],
        300,
        terrace=True,
    )
    courtyard(
        ROOT / "casino_geometry.png",
        [(180, 570), (780, 870), (1260, 630), (660, 330)],
    )
    solid_box(
        ROOT / "restaurant_geometry.png",
        [(208, 580), (848, 900), (1328, 660), (688, 340)],
        300,
        terrace=True,
    )


if __name__ == "__main__":
    main()
