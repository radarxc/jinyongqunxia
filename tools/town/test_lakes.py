"""Polygon lakes share river collision rules without inventing river centerlines."""

import copy
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET

from PIL import Image

from check_town import validate_layout, validate_spec
from common import (canonical_bytes, catalog, cells_from_json, geometry_masks,
                    polygon_cells, rectangle, zone_winners)
from gen_layout import generate_layout
from plan_view import label_records, plan_point, render_plan
from render_town import project, write_overlay
from schema_check import decode_ground, validate_schema
from test_town import small_spec


def lake_record(points=None):
    return {"id": "test_lake", "polygon": {"points": [
        {"x": x, "z": z} for x, z in (points or [(26, 31), (38, 31), (38, 33), (26, 33)])]},
        "basis": "图名：测试湖；src_layout_design：湖形测试（原创扩展）"}


def lake_spec():
    spec = small_spec()
    spec["rivers"] = []
    spec["lakes"] = [lake_record()]
    spec["bridges"][0]["river_ref"] = "test_lake"
    return spec


def codes(spec):
    return {row["code"] for row in validate_spec(spec)}


class LakeGeometryTests(unittest.TestCase):
    def test_optional_lakes_preserve_legacy_water_mask(self):
        spec = small_spec()
        original = geometry_masks(spec)
        spec["lakes"] = []
        self.assertEqual(validate_schema(spec, "CitySpec"), [])
        self.assertEqual(original, geometry_masks(spec))

    def test_concave_polygon_raster_uses_cell_centers_and_not_bounding_box(self):
        lake = lake_record([(20, 20), (28, 20), (28, 23), (24, 23), (24, 28), (20, 28)])
        cells = polygon_cells(lake["polygon"]["points"], 64, 64)
        self.assertEqual(len(cells), 8 * 3 + 4 * 5)
        self.assertIn((23, 27), cells)
        self.assertNotIn((24, 23), cells)
        triangle = lake_record([(10, 10), (14, 10), (10, 14)])
        self.assertIn((11, 12), polygon_cells(triangle["polygon"]["points"], 64, 64))

    def test_river_lake_union_counts_overlap_once_and_is_not_navigable_by_default(self):
        spec = small_spec()
        spec["lakes"] = [lake_record()]
        masks = geometry_masks(spec)
        river, lake = masks["river_cells"]["test_stream"], masks["lake_cells"]["test_lake"]
        self.assertTrue(river & lake)
        self.assertEqual(masks["water"], river | lake)
        self.assertFalse(masks["navigable_water"])
        spec["rivers"][0]["navigable"] = True
        self.assertEqual(geometry_masks(spec)["navigable_water"], river)

    def test_invalid_polygon_and_out_of_bounds_are_rejected(self):
        for vertices, expected in [
            ([(26, 31), (38, 33), (26, 33), (38, 31)], "TOWN_GEOMETRY_POLYGON"),
            ([(26, 31), (38, 31), (38, 33), (26, 31)], "TOWN_GEOMETRY_POLYGON"),
            ([(26, 31), (65, 31), (38, 33)], "TOWN_GEOMETRY_BOUNDS")]:
            with self.subTest(vertices=vertices):
                spec = lake_spec()
                spec["lakes"] = [lake_record(vertices)]
                self.assertIn(expected, codes(spec))

    def test_water_body_ids_are_unambiguous_for_bridges(self):
        spec = small_spec()
        spec["lakes"] = [lake_record()]
        spec["lakes"][0]["id"] = "test_stream"
        self.assertIn("TOWN_GEOMETRY_DUPLICATE_ID", codes(spec))
        spec = lake_spec()
        spec["lakes"].append(copy.deepcopy(spec["lakes"][0]))
        self.assertIn("TOWN_GEOMETRY_DUPLICATE_ID", codes(spec))

    def test_lake_bridge_crossing_is_valid_without_a_river_normal(self):
        self.assertEqual(validate_spec(lake_spec()), [])

    def test_lake_bridge_must_reference_the_crossed_body_and_reach_dry_roads(self):
        spec = lake_spec()
        spec["bridges"][0]["length_cells"] = 2
        self.assertIn("TOWN_BRIDGE_END_DISCONNECTED", codes(spec))
        spec = lake_spec()
        spec["lakes"].append(lake_record([(10, 20), (14, 20), (14, 24), (10, 24)]))
        spec["lakes"][1]["id"] = "other_lake"
        spec["bridges"][0]["river_ref"] = "other_lake"
        self.assertIn("TOWN_BRIDGE_OFF_WATER", codes(spec))
        spec["bridges"][0]["river_ref"] = "missing_lake"
        self.assertIn("TOWN_ID_REF_BRIDGE", codes(spec))

    def test_road_and_fixed_building_cannot_ignore_lake_water(self):
        spec = lake_spec()
        spec["bridges"] = []
        self.assertIn("TOWN_ROAD_WATER_UNBRIDGED", codes(spec))
        spec = lake_spec()
        kind = "bld_kit_song_dali_shop"
        entry = catalog()[kind]
        spec["landmarks"] = [dict(id="lm_test", type=kind, origin=dict(x=26, z=31),
            size=dict(w=entry["w"], h=entry["h"]), rotation_deg=0,
            zone_ref=spec["zones"][0]["id"], poi=None, basis=spec["wall"]["basis"])]
        self.assertIn("TOWN_BUILDING_ON_WATER", codes(spec))


class LakeLayoutTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec = lake_spec()
        cls.layout, cls.stats = generate_layout(cls.spec)

    def test_generated_lake_is_deterministic_and_excluded_from_land_uses(self):
        layout, _ = generate_layout(self.spec)
        self.assertEqual(canonical_bytes(layout), canonical_bytes(self.layout))
        self.assertFalse([row for row in validate_layout(self.spec, layout)
                          if row["severity"] == "error"])
        water = cells_from_json(layout["water_cells"])
        bridges = cells_from_json(layout["bridge_cells"])
        self.assertEqual(water, geometry_masks(self.spec)["lake_cells"]["test_lake"])
        self.assertEqual(self.stats["lake_cells"], {"test_lake": len(water)})
        for building in layout["buildings"]:
            self.assertFalse(rectangle(building["origin"], building["size"]) & water)
        self.assertFalse(cells_from_json(d["at"] for d in layout["decorations"]) & water)
        for cells in layout["zone_coverage"].values():
            self.assertFalse(cells_from_json(cells) & water)
        walkable = cells_from_json(layout["walk_layer"]["planning_walkable"])
        self.assertFalse(walkable & (water - bridges))
        self.assertTrue(bridges <= walkable)
        ground = decode_ground(layout["ground_cells"], 64)
        water_ground = cells_from_json(row["at"] for row in ground if row["ground"] == "water")
        self.assertEqual(water_ground, water)

    def test_plan_view_labels_and_paints_polygon_lake(self):
        labels = label_records(self.spec, zone_winners(self.spec))
        water_labels = [label for label in labels if label["code"].startswith("W")]
        self.assertEqual([(label["name"], label["id"]) for label in water_labels],
                         [("测试湖", "test_lake")])
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "plan.svg"
            render_plan(self.spec, self.layout, output, cell_px=10)
            self.assertIn("测试湖", "".join(ET.parse(output).getroot().itertext()))
            with Image.open(output.with_suffix(".png")) as image:
                at = plan_point(27.5, 31.5, 64, 10, 64, 136)
                self.assertEqual(image.getpixel(tuple(map(int, at))), (130, 184, 199))

    def test_overlay_retains_source_lake_vertices_with_no_cell_center_shift(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "lake.overlay.svg"
            write_overlay(self.layout, self.spec, output, Path(directory) / "lake.png",
                          (4096, 2048), [])
            namespace = {"svg": "http://www.w3.org/2000/svg"}
            root = ET.parse(output).getroot()
            polygons = root.findall('.//svg:g[@id="roads-water"]/svg:polygon', namespace)
            lake = next(poly for poly in polygons if poly.find("svg:title", namespace).text
                        == "test_lake lake boundary")
            expected = " ".join(f"{x:.2f},{y:.2f}" for x, y in
                (project(p["x"], p["z"], 64) for p in self.spec["lakes"][0]["polygon"]["points"]))
            self.assertEqual(lake.attrib["points"], expected)


if __name__ == "__main__":
    unittest.main()
