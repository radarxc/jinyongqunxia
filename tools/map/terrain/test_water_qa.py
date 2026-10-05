import importlib.util
import json
import os
import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("terrain_builder_water_qa", HERE / "build_terrain.py")
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


class WaterQATest(unittest.TestCase):
    def test_historical_lake_exclusions(self):
        document = json.loads((builder.LAYERS_DIR / "water.json").read_text(encoding="utf-8"))
        names = {feature["properties"].get("name") for feature in document["features"]}
        for name, _, _ in builder.EXCLUDED_LAKES:
            self.assertNotIn(name, names)

    def test_check_mode_creates_no_files(self):
        before = {str(path.relative_to(builder.HERE)) for path in builder.HERE.rglob("*") if path.is_file()}
        writes = []
        original = os.open
        def guarded(path, flags, *args, **kwargs):
            if flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND):
                writes.append(str(path))
            return original(path, flags, *args, **kwargs)
        os.open = guarded
        try:
            self.assertEqual(builder.main(["--check"]), 0)
        finally:
            os.open = original
        after = {str(path.relative_to(builder.HERE)) for path in builder.HERE.rglob("*") if path.is_file()}
        self.assertEqual(writes, [])
        self.assertEqual(before, after)

    def test_full_preview_matches_authoritative_water_masks(self):
        config = builder.load_config()
        projection = builder.canvas_projection(config)
        land, lakes = builder.make_water_masks(
            config, projection, builder.ne_reader.load(builder.GEODATA, "land"),
            builder.ne_reader.load(builder.GEODATA, "lakes"))
        for name, lon, lat in (("chang_an", 108.94, 34.26), ("beijing", 116.40, 39.90),
                               ("dali", 100.16, 25.69), ("chengdu", 104.07, 30.67)):
            x, y = projection(lon, lat)
            column = min(land.shape[1] - 1, max(0, int(x * land.shape[1] / 4096)))
            row = min(land.shape[0] - 1, max(0, int(y * land.shape[0] / 3072)))
            self.assertTrue(land[row, column], name)
        rgb = np.asarray(Image.open(builder.PREVIEW_DIR / "full.png").convert("RGB"), dtype=np.int16)
        water = ((rgb[:, :, 2] - rgb[:, :, 0] > 3)
                 & (rgb[:, :, 2] >= rgb[:, :, 1] - 3) & (rgb.mean(2) > 110))
        def quarter(mask, threshold):
            image = Image.fromarray((mask * 255).astype("uint8"))
            return np.asarray(image.resize((384, 288), Image.Resampling.BOX)) > threshold
        preview, sea = quarter(water, 90), quarter(~land, 127)
        delivered_lakes = Image.new("L", (1536, 1152), 0)
        delivered_draw = ImageDraw.Draw(delivered_lakes)
        water_doc = json.loads((builder.LAYERS_DIR / "water.json").read_text(encoding="utf-8"))
        for feature in water_doc["features"]:
            if feature["properties"]["water_type"] == "lake":
                for ring in feature["geometry"]["coordinates"]:
                    delivered_draw.polygon([(x * 1536 / 4096, y * 1152 / 3072) for x, y in ring], fill=255)
        lake = quarter(np.asarray(delivered_lakes) > 0, 180)
        sea_iou = float((preview & sea).sum() / max(1, (preview | sea).sum()))
        nearby = np.asarray(Image.fromarray((preview * 255).astype("uint8")).filter(ImageFilter.MaxFilter(5))) > 0
        lake_hit = float((lake & nearby).sum() / max(1, lake.sum()))
        known = Image.new("L", (1536, 1152), 0)
        draw = ImageDraw.Draw(known)
        for feature in water_doc["features"]:
            if feature["properties"]["water_type"] == "river":
                draw.line([(x * 1536 / 4096, y * 1152 / 3072)
                           for x, y in feature["geometry"]["coordinates"]], fill=255, width=6)
        known_mask = (np.asarray(known) > 0) | ~land | lakes
        known_quarter = quarter(known_mask, 0)
        allowed = np.asarray(Image.fromarray((known_quarter * 255).astype("uint8")).filter(
            ImageFilter.MaxFilter(21))) > 0
        extra_water = float((preview & ~allowed).mean())
        self.assertGreaterEqual(sea_iou, 0.85)
        self.assertGreaterEqual(lake_hit, 0.85)
        self.assertLessEqual(extra_water, 0.005)


if __name__ == "__main__":
    unittest.main()
