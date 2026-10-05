"""Tests for deterministic item background removal and icon generation."""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw

from tools.item.common import BuildError, alpha_bbox, remove_background, sha256_file
from tools.item.make_icons import process_directory

ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / "assets/default/baseline/item"


class IconPipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name) / "manuals"
        self.directory.mkdir()

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def copy_baseline(self, original: str, item_id: str) -> None:
        shutil.copyfile(BASELINE / original, self.directory / f"{item_id}.png")
        manifest = [{"id": item_id, "file": f"{item_id}.png", "subject": "test"}]
        (self.directory / "manifest.yaml").write_text(
            yaml.safe_dump(manifest, sort_keys=False), encoding="utf-8"
        )

    def test_remove_background_keeps_internal_ivory_hole(self) -> None:
        source = Image.new("RGB", (640, 640), (230, 225, 216))
        draw = ImageDraw.Draw(source)
        draw.ellipse((152, 152, 488, 488), fill=(40, 70, 90))
        draw.ellipse((264, 264, 376, 376), fill=(230, 225, 216))
        source = source.resize((160, 160), Image.Resampling.LANCZOS)
        cutout, metadata = remove_background(source)
        alpha = np.asarray(cutout.getchannel("A"))

        self.assertGreater(metadata["seedRatio"], 0.99)
        self.assertEqual(0, int(alpha[0, 0]))
        self.assertEqual(255, int(alpha[80, 80]))
        self.assertTrue(np.any((alpha > 0) & (alpha < 255)))

    def test_real_baseline_builds_four_sizes_and_is_deterministic(self) -> None:
        self.copy_baseline("ref_it_miji_jiuyin_shang__ch02_base01.png",
                           "it_miji_jiuyin_shang")

        self.assertEqual(1, process_directory(self.directory))
        first = {path.name: sha256_file(path) for path in (self.directory / "icons").glob("*.png")}
        sizes = set()
        for path in (self.directory / "icons").glob("*.png"):
            with Image.open(path) as generated:
                sizes.add(generated.width)
        self.assertEqual({32, 64, 128, 256}, sizes)
        with Image.open(self.directory / "icons/it_miji_jiuyin_shang_256.png") as icon:
            left, top, right, bottom = alpha_bbox(icon)
            self.assertEqual(215, max(right - left, bottom - top))
            self.assertGreaterEqual(min(left, top, 256 - right, 256 - bottom), 17)

        self.assertEqual(1, process_directory(self.directory))
        second = {path.name: sha256_file(path) for path in (self.directory / "icons").glob("*.png")}
        self.assertEqual(first, second)
        self.assertEqual(1, process_directory(self.directory, check=True))
        entry = yaml.safe_load((self.directory / "manifest.yaml").read_text())[0]
        self.assertEqual([256, 128, 64, 32], [item["size"][0] for item in entry["icons"]])
        self.assertEqual(64, len(entry["iconSourceSha256"]))

    def test_check_detects_modified_icon(self) -> None:
        self.copy_baseline("ref_eq_yitianjian__ch04_base01.png", "eq_yitianjian")
        process_directory(self.directory)
        path = self.directory / "icons/eq_yitianjian_32.png"
        path.write_bytes(path.read_bytes() + b"tamper")

        with self.assertRaisesRegex(BuildError, "派生文件与源图不一致"):
            process_directory(self.directory, check=True)

    def test_check_detects_stale_build_metadata(self) -> None:
        self.copy_baseline("ref_it_miji_jiuyin_shang__ch02_base01.png",
                           "it_miji_jiuyin_shang")
        process_directory(self.directory)
        path = self.directory / "manifest.yaml"
        entries = yaml.safe_load(path.read_text(encoding="utf-8"))
        entries[0]["iconBuild"]["version"] = 0
        path.write_text(yaml.safe_dump(entries, sort_keys=False), encoding="utf-8")
        with self.assertRaisesRegex(BuildError, "iconBuild"):
            process_directory(self.directory, check=True)

    def test_cli_build_and_check(self) -> None:
        self.copy_baseline("ref_eq_yitianjian__ch04_base01.png", "eq_yitianjian")
        script = ROOT / "tools/item/make_icons.py"
        built = subprocess.run([sys.executable, str(script), str(self.directory)],
                               cwd=ROOT, text=True, capture_output=True, check=False)
        checked = subprocess.run([sys.executable, str(script), str(self.directory), "--check"],
                                 cwd=ROOT, text=True, capture_output=True, check=False)
        self.assertEqual(0, built.returncode, built.stderr)
        self.assertEqual(0, checked.returncode, checked.stderr)
        self.assertIn("1 item(s) checked", checked.stdout)

    def test_rejects_duplicate_item_ids_before_overwriting_outputs(self) -> None:
        source = BASELINE / "ref_eq_yitianjian__ch04_base01.png"
        shutil.copyfile(source, self.directory / "eq_testjian_a.png")
        shutil.copyfile(source, self.directory / "eq_testjian_b.png")
        entries = [{"id": "eq_testjian", "file": "eq_testjian_a.png"},
                   {"id": "eq_testjian", "file": "eq_testjian_b.png"}]
        (self.directory / "manifest.yaml").write_text(
            yaml.safe_dump(entries, sort_keys=False), encoding="utf-8"
        )
        with self.assertRaisesRegex(BuildError, "重复物品 ID"):
            process_directory(self.directory)


if __name__ == "__main__":
    unittest.main()
