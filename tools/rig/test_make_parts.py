"""Tests for rig part normalization, metadata and pose-strip preview."""
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import yaml
from PIL import Image, ImageDraw

from tools.item.common import BuildError, sha256_file
from tools.rig.make_parts import build_manifest
from tools.rig.preview import make_strip
from tools.rig import preview
from tools.rig.templates import SOURCE_PARTS, TEMPLATES, VIEWS, PART_TO_TEMPLATE


def synthetic_part(path: Path, part: str) -> None:
    template = TEMPLATES[PART_TO_TEMPLATE[part]]
    image = Image.new("RGBA", (template.size[0] + 24, template.size[1] + 20))
    draw = ImageDraw.Draw(image)
    if part in {"head", "hair_or_headgear"}:
        draw.ellipse((12, 10, image.width - 13, image.height - 11), fill=(90, 70, 55, 255))
    else:
        draw.rounded_rectangle((12, 10, image.width - 13, image.height - 11),
                               radius=6, fill=(62, 91, 105, 255))
    image.save(path)


class RigPartPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.set_dir = Path(self.temporary.name) / "male_test"
        for view in VIEWS:
            directory = self.set_dir / view
            directory.mkdir(parents=True)
            for part in SOURCE_PARTS:
                synthetic_part(directory / f"{part}.png", part)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_builds_39_records_and_check_is_deterministic(self) -> None:
        manifest = build_manifest(self.set_dir)
        self.assertEqual(39, len(manifest["parts"]))
        self.assertEqual(256, manifest["ppm"])
        forearms = [item for item in manifest["parts"] if item["id"].startswith("forearm_")]
        self.assertEqual({-90.0}, {item["restAngle"] for item in forearms})
        torso = next(item for item in manifest["parts"]
                     if item["id"] == "torso" and item["view"] == "front34")
        width, height = torso["size"]
        self.assertTrue(0 <= torso["pivot"][0] < width)
        self.assertTrue(0 <= torso["pivot"][1] < height)
        self.assertEqual({"neck", "shoulder_L", "shoulder_R"}, set(torso["childJoint"]))

        before = sha256_file(self.set_dir / "manifest.yaml")
        build_manifest(self.set_dir)
        self.assertEqual(before, sha256_file(self.set_dir / "manifest.yaml"))
        checked = build_manifest(self.set_dir, check=True)
        self.assertEqual(manifest, checked)

    def test_preview_has_idle_plus_four_phases_in_three_rows(self) -> None:
        build_manifest(self.set_dir)
        strip = make_strip(self.set_dir, motion="walk", weight="heavy")
        self.assertEqual((5 * 256 + 4 * 16, 3 * 320 + 2 * 16), strip.size)
        self.assertIsNotNone(strip.getbbox())
        self.assertEqual(strip.tobytes(),
                         make_strip(self.set_dir, motion="walk", weight="heavy").tobytes())

    def test_preview_composites_equipment_layer(self) -> None:
        build_manifest(self.set_dir)
        layer = Image.new("RGBA", (18, 36), (245, 20, 30, 255))
        record = {"slot": "weapon_R", "pivot": [9, 30], "zOrder": 15.25}
        with patch.object(preview, "load_equipment", return_value=[(record, layer)]) as loader:
            equipped = make_strip(self.set_dir, equipment=["eq_testjian"])
        plain = make_strip(self.set_dir)

        self.assertNotEqual(plain.tobytes(), equipped.tobytes())
        self.assertEqual(3, loader.call_count)
        loader.assert_any_call(["eq_testjian"], "front34")

    def test_missing_source_part_is_rejected(self) -> None:
        (self.set_dir / "side/foot_shared.png").unlink()
        with self.assertRaisesRegex(BuildError, "parts mismatch"):
            build_manifest(self.set_dir)

    def test_check_detects_pixel_mutation(self) -> None:
        build_manifest(self.set_dir)
        target = self.set_dir / "front34/head.png"
        with Image.open(target) as opened:
            image = opened.copy()
        image.putpixel((0, 0), (255, 0, 0, 255))
        image.save(target)
        with self.assertRaisesRegex(BuildError, "not normalized"):
            build_manifest(self.set_dir, check=True)

    def test_rejects_non_v1_forearm_rest_angle(self) -> None:
        manifest = build_manifest(self.set_dir)
        record = next(item for item in manifest["parts"]
                      if item["view"] == "front34" and item["id"] == "forearm_L")
        record["restAngle"] = 0.0
        (self.set_dir / "manifest.yaml").write_text(
            yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8"
        )
        with self.assertRaisesRegex(BuildError, "must be -90.0"):
            build_manifest(self.set_dir, check=True)


if __name__ == "__main__":
    unittest.main()
