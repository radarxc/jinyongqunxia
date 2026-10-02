import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import town_runtime


class TownRuntimeTest(unittest.TestCase):
    def test_compiles_baseline_towns_deterministically(self):
        pairs = town_runtime.source_pairs()
        self.assertEqual([path.stem for path, _ in pairs],
                         ["city_dali__ch01", "city_hangzhou__ch02"])
        for spec, layout in pairs:
            first = town_runtime.compile_town(spec, layout)
            second = town_runtime.compile_town(spec, layout)
            self.assertEqual(town_runtime.encode(first), town_runtime.encode(second))
            self.assertEqual(first["projection"]["tilePx"], [64, 32])
            self.assertIn(first["navigation"]["spawn"],
                          [row[:2] for row in first["navigation"]["nodes"]])
            surfaces = {cell["ground"] for cell in first["groundPalette"]}
            tile_kinds = {entry["kind"] for entry in first["assets"]["tile"]["entries"]}
            self.assertLessEqual(surfaces, tile_kinds)
            self.assertIn("road_edge", tile_kinds)
            self.assertIn("riverbank", tile_kinds)
            self.assertTrue(first["edgeTiles"])
            self.assertEqual(first["edgeTiles"], sorted(first["edgeTiles"],
                             key=lambda row: (row[0], row[1])))
            self.assertEqual({row[1] for row in first["edgeTiles"]},
                             {"road_edge", "riverbank"})
            self.assertTrue(all(0 <= row[2] < 255 for row in first["edgeTiles"]))

    def test_check_detects_stale_then_accepts_generated_files(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.assertEqual(town_runtime.main([str(root)]), 0)
            self.assertEqual(town_runtime.main(["--check", str(root)]), 0)
            path = root / "ch01/city_dali.json"
            value = json.loads(path.read_text())
            path.write_text(json.dumps({**value, "revision": "0" * 64}) + chr(10))
            self.assertEqual(town_runtime.main(["--check", str(root)]), 1)


if __name__ == "__main__":
    unittest.main()
