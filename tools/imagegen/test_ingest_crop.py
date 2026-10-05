"""Regression tests for the image-ingest frame cropper."""
from __future__ import annotations

import unittest

import numpy as np
from PIL import Image, ImageDraw

from tools.imagegen.ingest import crop_frame


BACKGROUND = (230, 225, 216)
WHITE_FRAME = (255, 255, 255)
DARK_FRAME = (30, 34, 38)
SUBJECT = (48, 62, 70)


def framed_image(
    size: tuple[int, int],
    borders: tuple[int, int, int, int],
    *,
    frame: tuple[int, int, int] = WHITE_FRAME,
    subject_box: tuple[int, int, int, int] | None = None,
) -> Image.Image:
    """Build an RGB image with (left, top, right, bottom) frame widths."""
    width, height = size
    left, top, right, bottom = borders
    image = Image.new("RGB", size, frame)
    draw = ImageDraw.Draw(image)
    draw.rectangle(
        (left, top, width - right - 1, height - bottom - 1),
        fill=BACKGROUND,
    )
    if subject_box is None:
        subject_box = (width // 3, height // 3, 2 * width // 3, 2 * height // 3)
    draw.rectangle(subject_box, fill=SUBJECT)
    return image


def subject_count(image: Image.Image) -> int:
    pixels = np.asarray(image.convert("RGB"))
    return int(np.all(pixels == SUBJECT, axis=2).sum())


def subject_margins(image: Image.Image) -> tuple[int, int, int, int]:
    pixels = np.asarray(image.convert("RGB"))
    rows, columns = np.where(np.all(pixels == SUBJECT, axis=2))
    return (
        int(columns.min()),
        int(rows.min()),
        image.width - int(columns.max()) - 1,
        image.height - int(rows.max()) - 1,
    )


class CropFrameTests(unittest.TestCase):
    def assert_box_near(self, actual: list[int], expected: list[int]) -> None:
        self.assertEqual(4, len(actual))
        for observed, wanted in zip(actual, expected):
            self.assertLessEqual(abs(observed - wanted), 2)

    def assert_subject_intact(self, source: Image.Image, cropped: Image.Image) -> None:
        self.assertEqual(subject_count(source), subject_count(cropped))
        self.assertGreater(min(subject_margins(cropped)), 0)

    def test_four_white_borders_ignore_perpendicular_frame_pixels(self) -> None:
        borders = (18, 12, 19, 13)
        source = framed_image((160, 140), borders)

        cropped, box = crop_frame(source)

        self.assert_box_near(box, [18, 12, 141, 127])
        self.assertEqual((123, 123), cropped.size)
        self.assert_subject_intact(source, cropped)

    def test_top_and_bottom_borders_only(self) -> None:
        source = framed_image((160, 140), (0, 10, 0, 11))

        cropped, box = crop_frame(source)

        self.assert_box_near(box, [0, 10, 160, 129])
        self.assert_subject_intact(source, cropped)

    def test_left_and_right_borders_only(self) -> None:
        source = framed_image((160, 140), (14, 0, 15, 0))

        cropped, box = crop_frame(source)

        self.assert_box_near(box, [14, 0, 145, 140])
        self.assert_subject_intact(source, cropped)

    def test_unframed_image_is_returned_unchanged(self) -> None:
        source = framed_image((160, 140), (0, 0, 0, 0))

        cropped, box = crop_frame(source)

        self.assertIs(source, cropped)
        self.assertEqual([], box)

    def test_dark_frame_is_cropped(self) -> None:
        source = framed_image((160, 140), (9, 8, 10, 9), frame=DARK_FRAME)

        cropped, box = crop_frame(source)

        self.assert_box_near(box, [9, 8, 150, 131])
        self.assert_subject_intact(source, cropped)

    def test_subject_three_pixels_from_inner_edge_is_not_cut(self) -> None:
        borders = (16, 16, 16, 16)
        source = framed_image(
            (160, 160), borders, subject_box=(45, 35, 112, 140)
        )

        cropped, box = crop_frame(source)

        self.assert_box_near(box, [16, 16, 144, 144])
        self.assert_subject_intact(source, cropped)
        self.assertEqual(3, subject_margins(cropped)[3])


if __name__ == "__main__":
    unittest.main()
