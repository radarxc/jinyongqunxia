"""Real-asset adapter validation regressions; no full town generation required."""

from __future__ import annotations

from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
import yaml

from assets import AssetLibrary
from check_town import asset_metadata_issues, validate_assets


def sprite(size=(32, 32)):
    image = Image.new("RGBA", size)
    image.paste((90, 80, 60, 255), (4, 4, size[0] - 4, size[1] - 4))
    return image


class SpriteValidationTests(unittest.TestCase):
    def setUp(self):
        self.meta = dict(anchor_px=[16, 24], footprint_cells={"w": 1, "h": 1}, status="candidate")

    def check(self, image=None, meta=None, **kwargs):
        return asset_metadata_issues((sprite() if image is None else image, self.meta if meta is None else meta),
                                     "test", "assets.test", isolated=True, footprint=True, **kwargs)

    def test_valid_candidate_and_finite_geometry(self):
        self.assertEqual(self.check(), [])
        for value in (None, [float("nan"), 4], [2, -1], [33, 2], [True, 2], [1]):
            with self.subTest(anchor=value):
                issues = self.check(meta=dict(self.meta, anchor_px=value))
                self.assertIn("TOWN_ASSET_ANCHOR", {row["code"] for row in issues})
        self.assertEqual(self.check(meta=dict(self.meta, anchor_px={"x": 16, "y": 24})), [])
        issues = self.check(meta=dict(self.meta, footprint_cells={"w": 0, "h": 1}))
        self.assertIn("TOWN_ASSET_FOOTPRINT", {row["code"] for row in issues})
        issues = self.check(meta=dict(self.meta, footprint_width_px=float("nan")))
        self.assertIn("TOWN_ASSET_FOOTPRINT", {row["code"] for row in issues})

    def test_transparency_uses_loaded_pixels(self):
        self.assertIn("TOWN_ASSET_EMPTY", {row["code"] for row in self.check(Image.new("RGBA", (32, 32)))})
        image = sprite()
        image.putpixel((0, 8), (0, 0, 0, 1))
        self.assertIn("TOWN_ASSET_CROPPED", {row["code"] for row in self.check(image)})
        self.assertIn("TOWN_ASSET_RGBA", {row["code"] for row in self.check(sprite().convert("RGB"))})

    def test_candidate_substitution_warns_but_release_rejects_even_approved(self):
        meta = dict(self.meta, status="approved", adaptations=["native view 0 used for 90"])
        issues = self.check(meta=meta)
        self.assertEqual([(row["code"], row["severity"]) for row in issues],
                         [("TOWN_ASSET_SUBSTITUTION", "warning")])
        self.assertEqual(self.check(meta=meta, release=True)[0]["severity"], "error")
        self.assertIn("TOWN_ASSET_NOT_APPROVED", {row["code"] for row in self.check(release=True)})

    def test_loader_keeps_missing_file_and_non_rgba_explicit(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            (base / "manifest.yaml").write_text(yaml.safe_dump([
                {"id": "missing", "file": "absent.png"}, {"id": "rgb", "file": "rgb.png"}]))
            sprite().convert("RGB").save(base / "rgb.png")
            library = AssetLibrary(base / "manifest.yaml")
            self.assertIsNone(library.resolve("missing"))
            self.assertIsNone(library.resolve("rgb"))
            self.assertTrue(library.missing)
            self.assertTrue(library.warnings)


class AssetPassTests(unittest.TestCase):
    def setUp(self):
        self.spec = dict(era_kit="song_dali", grid={"width": 1, "height": 1}, gates=[], bridges=[],
                         wall={"polygon": {"points": []}}, vegetation={"palette": []})
        self.layout = dict(buildings=[], roads={}, water_cells=[],
                           ground_cells=[dict(at={"x": 0, "z": 0}, ground="grass")])

    def validate_with(self, resolver, **kwargs):
        class Library:
            warnings = set()
            def __init__(self, *args):
                pass
            resolve = staticmethod(resolver)
        with patch("assets.AssetLibrary", Library):
            return validate_assets(self.spec, self.layout, strict=True, **kwargs)

    def test_bad_later_ground_variant_is_checked(self):
        def resolve(asset_id, variant_index=0, **kwargs):
            image = Image.new("RGBA", (32, 32)) if variant_index == 3 else sprite()
            return image, dict(file=f"v{variant_index}.png", anchor_px=[16, 16], status="candidate")
        self.assertIn("TOWN_ASSET_EMPTY", {row["code"] for row in self.validate_with(resolve)})

    def test_plant_native_contract_and_distinct_variants_remain_enforced(self):
        self.layout["ground_cells"] = []
        self.spec["vegetation"]["palette"] = ["prp_song_dali_grass"]
        image = Image.new("RGBA", (72, 60))
        image.paste((30, 90, 30, 255), (8, 8, 64, 40))
        meta = dict(anchor_px=[36, 40], footprint_cells={"w": 1, "h": 1},
                    collision="none", placement_domain="land", status="candidate")
        def resolve(asset_id, variant_index=0, **kwargs):
            return image, dict(meta, file=f"grass{variant_index}.png")
        self.assertEqual(self.validate_with(resolve), [])
        meta["collision"] = "solid"
        self.assertIn("TOWN_VEGETATION_ASSET_INVALID", {row["code"] for row in self.validate_with(resolve)})
        meta["collision"] = "none"
        same_file = lambda *args, **kwargs: (image, dict(meta, file="one.png"))
        self.assertIn("TOWN_ASSET_MISSING", {row["code"] for row in self.validate_with(same_file)})
        image.putpixel((36, 45), (30, 90, 30, 1))
        self.assertIn("TOWN_VEGETATION_ASSET_INVALID", {row["code"] for row in self.validate_with(resolve)})


if __name__ == "__main__":
    unittest.main()
