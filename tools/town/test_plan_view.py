"""North-up output, Chinese labels and stale-source rejection regressions."""

import copy
from contextlib import redirect_stderr, redirect_stdout
import hashlib
import io
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

from PIL import Image

from common import TownError, canonical_bytes, cells_to_json, geometry_masks
from plan_view import COLORS, find_font, history_reference, main, plan_point, render_plan
from test_town import small_spec


def fixture():
    spec = small_spec()
    spec["gates"][0]["basis"] = "图名：和宁门；src_test：测试用命名（原创扩展）"
    spec["streets"][0]["basis"] = "图名：御街；主街（原创扩展）"
    spec["rivers"][0]["basis"] = "图名：中河；用于测试（原创扩展）"
    spec["rivers"].append({**spec["rivers"][0], "id": "second_stream",
                           "points": [{"x": 5, "z": 42}, {"x": 58, "z": 42}],
                           "basis": "图名：东河；用于测试（原创扩展）"})
    spec["zones"][0]["basis"] = "图名：住宅坊巷；用于测试（原创扩展）"
    spec["landmarks"] = [{"id": "lm_test", "type": "test_hall",
                           "origin": {"x": 12, "z": 14}, "size": {"w": 5, "h": 4},
                           "basis": "图名：崇圣寺；仅检验文字与坐标（待考）"}]
    masks = geometry_masks(spec)
    layout = {"grid": copy.deepcopy(spec["grid"]),
              "roads": {key: cells_to_json(cells) for key, cells in masks["roads"].items()},
              "water_cells": cells_to_json(masks["water"]),
              "bridge_cells": cells_to_json(masks["bridges"]),
              "buildings": spec["landmarks"], "validation": {"errors": 0}}
    return spec, layout


class PlanViewTests(unittest.TestCase):
    def test_history_header_uses_city_specific_reference(self):
        spec, layout = fixture()
        spec.update(city_id="city_luoyang", historical_year=702, era_kit="tang")
        spec["design_intent"]["notes"] = [
            "复原依据：history/city_luoyang__tang_702.md（原创扩展）。"]
        self.assertEqual(history_reference(spec), "city_luoyang__tang_702.md")
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "plan.svg"
            render_plan(spec, layout, output, cell_px=10)
            text = output.read_text(encoding="utf-8")
            self.assertIn("history/city_luoyang__tang_702.md", text)
            self.assertNotIn("history/linan.md", text)

    def test_north_and_east_directions(self):
        southwest = plan_point(0, 0, 64)
        northeast = plan_point(64, 64, 64)
        self.assertGreater(northeast[0], southwest[0])
        self.assertLess(northeast[1], southwest[1])
        self.assertEqual(plan_point(5, 6, 64)[1] - plan_point(5, 7, 64)[1], 8)

    def test_matching_svg_png_and_chinese_labels(self):
        spec, layout = fixture()
        spec["wall"]["basis"] = "测试游戏包络（原创扩展）"
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "plan.svg"
            result = render_plan(spec, layout, output, cell_px=10)
            root = ET.parse(output).getroot()
            labels = "".join(root.itertext())
            for name in ("和宁门", "御街", "中河", "东河", "住宅坊巷", "崇圣寺"):
                self.assertIn(name, labels)
            self.assertTrue(root.findall(".//{http://www.w3.org/2000/svg}text"))
            self.assertIn('stroke-dasharray="8 6"', output.read_text())
            with Image.open(output.with_suffix(".png")) as image:
                self.assertEqual(image.size, (result["width"], result["height"]))
                at = plan_point(10.5, 42.5, 64, 10, 64, 136)
                self.assertEqual(image.getpixel(tuple(map(int, at))), (130, 184, 199))
            first = output.read_bytes(), output.with_suffix(".png").read_bytes()
            render_plan(spec, layout, output, cell_px=10)
            self.assertEqual(first, (output.read_bytes(), output.with_suffix(".png").read_bytes()))

    def test_cli_rejects_old_source_and_writes_both_files(self):
        spec, layout = fixture()
        with tempfile.TemporaryDirectory() as directory:
            source, data, output = [Path(directory) / name for name in ("spec.yaml", "layout.yaml", "plan.svg")]
            raw = canonical_bytes(spec)
            source.write_bytes(raw)
            layout["source_spec"] = {"sha256": "0" * 64}
            data.write_bytes(canonical_bytes(layout))
            args = [str(source), str(data), "-o", str(output)]
            with redirect_stderr(io.StringIO()) as errors:
                self.assertEqual(main(args), 1)
            self.assertIn("sha256", errors.getvalue())
            self.assertFalse(output.exists())
            layout["source_spec"]["sha256"] = hashlib.sha256(raw).hexdigest()
            data.write_bytes(canonical_bytes(layout))
            with redirect_stdout(io.StringIO()):
                self.assertEqual(main(args), 0)
            self.assertTrue(output.exists())
            self.assertTrue(output.with_suffix(".png").exists())

    def test_rejects_mismatched_grid_errors_and_missing_font(self):
        spec, layout = fixture()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "plan.svg"
            layout["grid"]["width"] = 96
            with self.assertRaisesRegex(TownError, "网格"):
                render_plan(spec, layout, output)
            layout["grid"] = copy.deepcopy(spec["grid"])
            layout["validation"]["errors"] = 1
            with self.assertRaisesRegex(TownError, "validation.errors"):
                render_plan(spec, layout, output)
            with self.assertRaisesRegex(TownError, "中文字体"):
                find_font(Path(directory) / "missing.ttf")


if __name__ == "__main__":
    unittest.main()
