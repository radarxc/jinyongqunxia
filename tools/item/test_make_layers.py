"""Tests for deterministic weapon and wearable layer generation."""
from __future__ import annotations

import tempfile
import unittest
import shutil
from pathlib import Path

import yaml
from PIL import Image, ImageDraw

from tools.item.common import (
    BuildError, alpha_bbox, normalize_rgba, remove_background, sha256_file,
)
from tools.item.layer_build import build_weapon_layer, infer_slots
from tools.item.make_layers import process_directory
from tools.rig.templates import TEMPLATES

BACKGROUND = (230, 225, 216)
ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / "assets/default/baseline/item"


def save_art(path: Path, kind: str) -> None:
    image = Image.new("RGB", (320, 320), BACKGROUND)
    draw = ImageDraw.Draw(image)
    if kind == "sword":
        draw.polygon([(154, 42), (166, 42), (168, 244), (160, 285), (152, 244)],
                     fill=(90, 110, 124))
        draw.rectangle((116, 236, 204, 248), fill=(110, 76, 44))
        draw.rectangle((153, 244, 167, 292), fill=(39, 64, 67))
    else:
        draw.polygon([(90, 68), (230, 68), (270, 245), (50, 245)], fill=(54, 84, 96))
        for y in range(85, 235, 12):
            draw.line((70, y, 250, y), fill=(75, 103, 111), width=2)
    image.save(path)


class LayerPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def make_category(self, category: str, entry: dict[str, object], kind: str) -> Path:
        directory = self.root / category
        directory.mkdir()
        save_art(directory / str(entry["file"]), kind)
        (directory / "manifest.yaml").write_text(
            yaml.safe_dump([entry], sort_keys=False), encoding="utf-8"
        )
        return directory

    def test_weapon_is_upright_scaled_and_has_three_view_records(self) -> None:
        directory = self.make_category(
            "weapons", {"id": "eq_testjian", "file": "eq_testjian.png",
                          "cat": "sword", "hands": 1, "lengthM": 1.0}, "sword"
        )

        self.assertEqual(1, process_directory(directory))
        first_hash = sha256_file(directory / "layers/eq_testjian__weapon_R.png")
        data = yaml.safe_load((directory / "layers/layers.yaml").read_text())
        item = data["items"][0]
        records = item["layers"]
        self.assertEqual(["front34", "back34", "side"],
                         [record["view"] for record in records])
        self.assertGreater(item["build"]["axisRatio"], 2.0)
        self.assertLess(abs(item["build"]["rotationDeg"]), 1.0)
        self.assertEqual(1.0, item["build"]["lengthM"])
        weapon = directory / "layers/eq_testjian__weapon_R.png"
        with Image.open(weapon) as image:
            cell = image.crop((0, 0, image.width // 3, image.height))
            _, top, _, bottom = alpha_bbox(cell)
        self.assertLessEqual(abs((bottom - top) - 256), 3)
        self.assertEqual(1, process_directory(directory))
        self.assertEqual(first_hash, sha256_file(directory / "layers/eq_testjian__weapon_R.png"))
        self.assertEqual(1, process_directory(directory, check=True))

    def test_real_yitian_baseline_builds_and_checks(self) -> None:
        directory = self.root / "weapons"
        directory.mkdir()
        shutil.copyfile(BASELINE / "ref_eq_yitianjian__ch04_base01.png",
                        directory / "eq_yitianjian.png")
        entry = {"id": "eq_yitianjian", "file": "eq_yitianjian.png",
                 "cat": "sword", "hands": 1}
        (directory / "manifest.yaml").write_text(
            yaml.safe_dump([entry], sort_keys=False), encoding="utf-8"
        )
        self.assertEqual(1, process_directory(directory))
        first = sha256_file(directory / "layers/eq_yitianjian__weapon_R.png")
        self.assertEqual(1, process_directory(directory))
        self.assertEqual(first, sha256_file(directory / "layers/eq_yitianjian__weapon_R.png"))
        self.assertEqual(1, process_directory(directory, check=True))

    def test_weapon_grip_tracks_visible_row_on_offset_weapon(self) -> None:
        image = Image.new("RGB", (320, 320), BACKGROUND)
        draw = ImageDraw.Draw(image)
        draw.polygon([(70, 30), (85, 30), (185, 245), (175, 250)], fill=(90, 110, 124))
        draw.rectangle((170, 235, 285, 250), fill=(110, 76, 44))
        draw.rectangle((268, 242, 285, 300), fill=(39, 64, 67))
        path = self.root / "offset.png"
        image.save(path)
        cutout, _ = remove_background(normalize_rgba(path))
        strip, metadata = build_weapon_layer(
            cutout, {"id": "eq_testpian", "subtype": "sword"}
        )
        grip_x, grip_y = metadata["grip"]
        self.assertGreater(strip.getpixel((grip_x, grip_y))[3], 0)

    def test_clothing_uses_slot_templates_palette_and_three_cells(self) -> None:
        directory = self.make_category(
            "clothing", {"id": "eq_testyi", "file": "eq_testyi.png"}, "cloth"
        )

        process_directory(directory)
        data = yaml.safe_load((directory / "layers/layers.yaml").read_text())
        item = data["items"][0]
        self.assertGreaterEqual(len(item["palette"]), 3)
        self.assertEqual(30, len(item["layers"]))
        torso = directory / "layers/eq_testyi__torso.png"
        with Image.open(torso) as image:
            self.assertEqual((TEMPLATES["torso"].size[0] * 3,
                              TEMPLATES["torso"].size[1]), image.size)
            self.assertEqual(0, image.getpixel((0, 0))[3])
            self.assertGreater(image.getchannel("A").getbbox()[2], image.width // 3)
        self.assertEqual(1, process_directory(directory, check=True))

    def test_accessory_uses_structured_slot_and_can_be_explicitly_hidden(self) -> None:
        head = self.make_category(
            "accessories", {"id": "eq_testguan", "file": "eq_testguan.png",
                            "slot": "head"}, "cloth"
        )
        self.assertEqual(1, process_directory(head))
        data = yaml.safe_load((head / "layers/layers.yaml").read_text())
        self.assertEqual({"hair_or_headgear"},
                         {record["slot"] for record in data["items"][0]["layers"]})
        # Direct slot inference is authoritative for an explicit empty list.
        self.assertEqual((), infer_slots("accessories", {"layerSlots": []}))
        with self.assertRaisesRegex(BuildError, "requires slot"):
            infer_slots("accessories", {"id": "eq_testunknown"})


if __name__ == "__main__":
    unittest.main()
