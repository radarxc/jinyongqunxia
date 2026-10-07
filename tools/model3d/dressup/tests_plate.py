#!/usr/bin/env python3
"""make_template_plate.py / check_plate.py 的无外部素材单元测试。"""
from __future__ import annotations

import io
import math
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

from PIL import Image, ImageDraw

import check_plate
import make_template_plate


def draw_person(angle_deg: float = 30.0, right_angle_deg: float | None = None) -> tuple[Image.Image, dict[str, int | float]]:
    """画尺寸已知的圆头、矩形躯干和线段四肢 A 字测试人。"""
    width, height = 500, 800
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    ink = (48, 66, 82)
    center = 250
    head_top, head_bottom = 40, 130
    torso_top, torso_bottom = 160, 420
    crotch_y, feet_bottom = 420, 750
    draw.ellipse((205, head_top, 295, head_bottom), fill=ink)
    draw.rectangle((235, 122, 265, torso_top + 4), fill=ink)
    draw.polygon(((190, torso_top), (310, torso_top), (300, torso_bottom),
                  (200, torso_bottom)), fill=ink)
    upper_dy = 150
    for sign in (-1, 1):
        side_angle = right_angle_deg if sign > 0 and right_angle_deg is not None else angle_deg
        upper_dx = math.tan(math.radians(side_angle)) * upper_dy
        shoulder = (center + sign * 60, 180)
        elbow = (shoulder[0] + sign * upper_dx, shoulder[1] + upper_dy)
        wrist = (elbow[0] + sign * upper_dx * 0.78, elbow[1] + 120)
        draw.line((shoulder, elbow, wrist), fill=ink, width=22, joint="curve")
        draw.ellipse((wrist[0] - 13, wrist[1] - 13, wrist[0] + 13, wrist[1] + 13), fill=ink)
    draw.line(((225, 405), (218, 585), (205, feet_bottom)), fill=ink, width=38, joint="curve")
    draw.line(((275, 405), (282, 585), (295, feet_bottom)), fill=ink, width=38, joint="curve")
    return image, {"head_top": head_top, "feet_bottom": feet_bottom,
                   "angle": angle_deg, "crotch_y": crotch_y}


class MeasureTests(unittest.TestCase):
    def test_measure_known_geometry(self) -> None:
        image, expected = draw_person(30)
        measured = make_template_plate.measure_image(image)
        self.assertEqual(measured["head_top_y"], expected["head_top"])
        # Pillow 宽线的圆头端盖会比给定中心线终点多覆盖 1 px。
        self.assertEqual(measured["feet_bottom_y"], expected["feet_bottom"] + 1)
        self.assertLessEqual(abs(measured["left_arm_angle_deg"] - 30), 1.0)
        self.assertLessEqual(abs(measured["right_arm_angle_deg"] - 30), 1.0)
        self.assertAlmostEqual(measured["arm_span_px"], 456, delta=1)
        self.assertAlmostEqual(measured["arm_span_ratio"], 456 / 712, delta=0.002)

    def test_measure_both_sides_independently(self) -> None:
        image, _ = draw_person(30, right_angle_deg=20)
        measured = make_template_plate.measure_image(image)
        self.assertLessEqual(abs(measured["left_arm_angle_deg"] - 30), 1.0)
        self.assertLessEqual(abs(measured["right_arm_angle_deg"] - 20), 1.0)

    def test_stretch_hits_hips_target(self) -> None:
        image, _ = draw_person(30)
        output, before, after = make_template_plate.stretch_image(image, 0.55, 0.18)
        self.assertEqual(output.size, image.size)
        self.assertNotAlmostEqual(before["hips_ratio"], 0.55, delta=0.005)
        self.assertAlmostEqual(after["hips_ratio"], 0.55, delta=0.005)
        self.assertAlmostEqual(after["shoulder_ratio"], 0.18, delta=0.01)
        mask, _ = make_template_plate.foreground_mask(output)
        left, top, right, bottom = make_template_plate._subject_bounds(mask)
        self.assertGreaterEqual(min(left, output.width - 1 - right), output.width * 0.04)
        self.assertGreaterEqual(min(top, output.height - 1 - bottom), output.height * 0.04)


class GateTests(unittest.TestCase):
    def test_same_image_passes(self) -> None:
        image, _ = draw_person(30)
        report, plate_mask, image_mask = check_plate.compare_images(image, image, 30, 3)
        self.assertTrue(report["pass"], report)
        self.assertEqual(check_plate.make_overlay(plate_mask, image_mask).size, image.size)

    def test_ten_degree_arms_fail(self) -> None:
        plate, _ = draw_person(30)
        candidate, _ = draw_person(10)
        report, _, _ = check_plate.compare_images(plate, candidate, 30, 3)
        self.assertFalse(report["pass"])
        self.assertFalse(report["checks"]["left_arm_angle_deg"]["pass"])
        self.assertFalse(report["checks"]["right_arm_angle_deg"]["pass"])

    def test_cli_exit_codes(self) -> None:
        plate, _ = draw_person(30)
        bad, _ = draw_person(10)
        with tempfile.TemporaryDirectory() as directory:
            plate_path = Path(directory) / "plate.png"
            bad_path = Path(directory) / "bad.png"
            overlay_path = Path(directory) / "overlay.png"
            plate.save(plate_path)
            bad.save(bad_path)
            with redirect_stdout(io.StringIO()):
                self.assertEqual(check_plate.main(["--plate", str(plate_path), "--image",
                                                   str(plate_path), "--arm-angle-deg", "30"]), 0)
                self.assertEqual(check_plate.main(["--plate", str(plate_path), "--image",
                                                   str(bad_path), "--arm-angle-deg", "30",
                                                   "--overlay", str(overlay_path)]), 3)
            self.assertTrue(overlay_path.is_file())


if __name__ == "__main__":
    unittest.main(verbosity=2)
