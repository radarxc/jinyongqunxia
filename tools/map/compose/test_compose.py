import importlib.util
import math
import sys
import unittest
from unittest import mock
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("compose_map_tested", HERE / "compose_map.py")
compose = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = compose
SPEC.loader.exec_module(compose)
CONFIG = compose.load_structured(HERE / "config.json")


class ProjectionAndDataTest(unittest.TestCase):
    def test_design_19_projection_vectors(self):
        projection = compose.render_map.CanvasProjection(4096, 3072, 150, (73, 18, 135, 54))
        expected = {(73, 18): (150.00, 2467.61), (135, 18): (3946.00, 2505.84),
                    (73, 54): (878.33, 286.27), (135, 54): (3261.75, 310.27),
                    (105, 35): (2107.23, 1699.92)}
        for point, target in expected.items():
            actual = projection(*point)
            self.assertAlmostEqual(actual[0], target[0], delta=0.02)
            self.assertAlmostEqual(actual[1], target[1], delta=0.02)

    def test_manifests_and_region_count(self):
        tiles, strips, kit = compose.asset_indexes()
        self.assertTrue({"water", "lake", "plain", "grassland", "desert", "plateau"} <= set(tiles))
        self.assertEqual(len(strips), 10)
        self.assertTrue({"shanfeng", "xueshan", "dacheng", "menpai", "yiji"} <= set(kit))
        regions = compose.load_structured(compose.MAP_DATA / "regions.yaml")["regions"]
        self.assertEqual(len(regions), 30)

    def test_sample_gis_is_ne10m_with_erhai(self):
        water = compose.load_structured(HERE / "data/rg_dali_cangshan_ne10m.json")
        self.assertEqual(water["coordinate_space"], "WGS84_lonlat")
        lakes = [row for row in water["features"]
                 if row["properties"].get("water_type") == "lake"]
        rivers = [row for row in water["features"]
                  if row["properties"].get("water_type") == "river"]
        self.assertIn("洱海", {row["properties"].get("name") for row in lakes})
        self.assertGreaterEqual(len(rivers), 20)
        self.assertTrue(all(row["properties"]["scalerank"] <= 9 for row in rivers))

    def test_kit_fallback_uses_alpha_bbox(self):
        image = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
        ImageDraw.Draw(image).rectangle((10, 30, 90, 70), fill=(20, 20, 20, 255))
        kit = compose.infer_kit(image, "map_kit_shanfeng_99")
        self.assertEqual((kit["kind"], kit["volume"], kit["orient"]),
                         ("shanfeng", "large", "ew"))
        self.assertEqual(kit["anchor"], [0.505, 0.71])

    def test_low_confidence_contract_all_ten(self):
        data = compose.load_structured(compose.MAP_DATA / "pois.yaml")
        self.assertEqual(sum(row["confidence"] == "低" for row in data["pois"]), 10)


class GeometryAndInkTest(unittest.TestCase):
    def test_path_resampling_closes_without_gap(self):
        square = [(5, 5), (95, 5), (95, 95), (5, 95)]
        samples = compose.resample_path(square, 17, closed=True)
        maximum = max(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(samples, samples[1:] + samples[:1]))
        self.assertLessEqual(maximum, 17.01)

    def test_chaikin_keeps_endpoints_and_smooths_corner(self):
        raw = [(0, 0), (30, 0), (30, 30)]
        smooth = compose.chaikin_path(raw, 3)
        self.assertEqual((smooth[0], smooth[-1]), (raw[0], raw[-1]))
        self.assertGreater(len(smooth), len(raw))
        self.assertNotIn((30.0, 0.0), smooth[1:-1])

    def test_strip_join_has_alpha(self):
        _, strips, _ = compose.asset_indexes()
        base = Image.new("RGB", (120, 120), (238, 228, 204))
        _, seams = compose.stroke_path(base, [(10, 60), (60, 20), (110, 60)], strips[("river", "thin")], 5, CONFIG)
        self.assertTrue(seams)
        self.assertGreater(min(seams), 0.0)

    def test_strip_follows_y_down_path_angle(self):
        _, strips, _ = compose.asset_indexes()
        base = Image.new("RGB", (160, 160), "white")
        out, _ = compose.stroke_path(base, [(20, 140), (140, 20)],
                                     strips[("river", "thick")], 16, CONFIG)
        ink = np.any(np.asarray(out) != 255, axis=2)
        self.assertTrue(all(ink[y, x] for x, y in ((40, 120), (80, 80), (120, 40))))
        self.assertFalse(any(ink[y, x] for x, y in ((40, 40), (120, 120))))

    def test_water_side_follows_ring_winding(self):
        clockwise = [(10, 10), (90, 10), (90, 90), (10, 90)]
        self.assertGreater(compose.signed_screen_area(clockwise), 0)
        self.assertTrue(compose.water_side_requires_flip(clockwise, True))
        self.assertFalse(compose.water_side_requires_flip(clockwise, False))
        self.assertFalse(compose.water_side_requires_flip(list(reversed(clockwise)), True))

    def test_optional_desert_layer_uses_desert_tile(self):
        frame = compose.Frame("test", (0, 0, 100, 100), 100, 100, lambda x, y: (x, y))
        polygon = {"geometry": {"type": "Polygon",
                   "coordinates": [[[0, 0], [100, 0], [100, 100], [0, 100]]]},
                   "properties": {}}
        water = {"features": [{**polygon, "properties": {"water_type": "sea_exterior",
                                      "topology": "land_outer"}}]}
        calls = []
        fake = lambda paths, size, tile_size, seed, jitter, key: (calls.append(key) or Image.new("RGB", size, "white"))
        assets = {key: [Path(key)] for key in ("plain", "grassland", "desert", "plateau", "water", "lake")}
        with mock.patch.object(compose, "tiled_texture", side_effect=fake):
            compose.fill_regions(Image.new("RGB", (100, 100), "white"),
                                 {"basins_plains": {"features": []},
                                  "deserts": {"features": [polygon]}},
                                 water, frame, assets, CONFIG, 1, True)
        self.assertIn("desert", calls)

    def test_tile_and_noise_deterministic(self):
        tiles, _, _ = compose.asset_indexes()
        first = compose.tiled_texture(tiles["plain"], (256, 192), 64, 77, True, "plain")
        second = compose.tiled_texture(tiles["plain"], (256, 192), 64, 77, True, "plain")
        self.assertEqual(compose.png_bytes(first), compose.png_bytes(second))
        periodic = np.asarray(compose.tiled_texture(tiles["plain"], (128, 128), 64, 77, False, "plain"))
        self.assertTrue(np.array_equal(periodic[:, :64], periodic[:, 64:]))
        self.assertTrue(np.array_equal(compose.low_frequency_noise((100, 80), 20, 9),
                                       compose.low_frequency_noise((100, 80), 20, 9)))

    def test_dissolve_and_multiply(self):
        self.assertTrue(compose.verify_dissolve(CONFIG, 77))
        self.assertTrue(compose.verify_multiply())

    def test_dem_relief_asset_and_provenance(self):
        terrain = CONFIG["terrain"]
        path = HERE / terrain["relief_file"]
        meta = compose.load_structured(HERE / terrain["relief_meta"])
        self.assertEqual(compose.sha256_bytes(path.read_bytes()), meta["png_sha256"])
        with Image.open(path) as source:
            self.assertEqual(source.size, tuple(terrain["relief_size"]))
            self.assertGreater(len(np.unique(np.asarray(source.getchannel("G")))), 1)
        ink = compose.dem_relief_ink((192, 128), CONFIG)
        self.assertEqual((ink.mode, ink.size), ("RGBA", (192, 128)))
        elevation, ruggedness = compose.dem_fields((192, 128), CONFIG)
        self.assertEqual((elevation.shape, ruggedness.shape), ((128, 192), (128, 192)))
        self.assertGreater(float(elevation.max()), 4000)

    def test_dem_mountains_use_multiple_kit_variants(self):
        _, _, kit = compose.asset_indexes()
        elevation, ruggedness = compose.dem_fields((1536, 1024), CONFIG)
        rows = compose.prepare_peaks((1536, 1024), [], kit, CONFIG, CONFIG["seed"], True, dem=(elevation, ruggedness))
        self.assertGreaterEqual(len(rows), 12)
        self.assertGreaterEqual(len({row["asset_id"] for row in rows}), 4)
        self.assertEqual({row["kind"] for row in rows}, {"qiuling", "shanmai", "shanfeng", "xueshan"})

    def test_decor_respects_gis_water_exclusion(self):
        base = Image.new("RGB", (40, 40), "white")
        ink = Image.new("RGBA", (20, 20), (20, 20, 20, 255))
        water = Image.new("L", base.size, 0)
        ImageDraw.Draw(water).rectangle((20, 0, 39, 39), fill=255)
        out = compose.place_asset(base, ink, (10, 10), (20, 20), water)
        self.assertLess(out.getpixel((15, 20))[0], 255)
        self.assertEqual(out.getpixel((25, 20)), (255, 255, 255))

    def test_poisson_spacing_and_high_filter(self):
        ridge = {"id": "r", "points": [(0, 0), (500, 0)], "mean_elevation_m": 3000, "relative_height_m": 200}
        rows = compose.poisson_along_ridges([ridge], 100, 3, 2400, 150)
        self.assertGreaterEqual(len(rows), 3)
        self.assertTrue(all(math.hypot(a["x"] - b["x"], a["y"] - b["y"]) >= 100
                            for i, a in enumerate(rows) for b in rows[i + 1:]))
        self.assertEqual(compose.poisson_along_ridges([{**ridge, "mean_elevation_m": 2000}], 100, 3, 2400, 150), [])

    def test_jitter_bounds_and_no_vertical_flip(self):
        _, _, kit = compose.asset_indexes(); row = kit["shanfeng"][0]
        _, _, meta = compose.transform_asset(Path(row["path"]), 80, row["kit"]["anchor"], 9, "peak", True, False, CONFIG)
        self.assertLessEqual(abs(meta["rotation_deg"]), 6)
        self.assertTrue(0.85 <= meta["scale"] <= 1.15)
        self.assertFalse(meta["flip_vertical"])

    def test_clickable_target_sizes_visible_art_not_transparent_canvas(self):
        _, _, kit = compose.asset_indexes(); row = kit["dacheng"][0]
        image, anchor, _ = compose.transform_asset(
            Path(row["path"]), 132, row["kit"]["anchor"], 9, "city", False, True, CONFIG)
        bbox = image.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
        self.assertIsNotNone(bbox)
        self.assertGreaterEqual(max(bbox[2] - bbox[0], bbox[3] - bbox[1]), 118)
        self.assertTrue(0 <= anchor[0] <= image.width and 0 <= anchor[1] <= image.height)

    def test_rotated_anchor_uses_same_transform_as_asset(self):
        point = compose.rotate_point_y_down((80, 50), (100, 100), (100, 100), 90)
        self.assertAlmostEqual(point[0], 50)
        self.assertAlmostEqual(point[1], 20)

    def test_configured_feather_and_peak_density(self):
        self.assertEqual(CONFIG["boundary"]["join_feather_px"], 5)
        ridge = {"id": "r", "points": [(0, 0), (2000, 0)],
                 "mean_elevation_m": 3000, "relative_height_m": 200}
        rows = compose.poisson_along_ridges([ridge], 80, 3, 2400, 150)
        limit = round(CONFIG["terrain"]["peak_density_per_mpx"] * 1536 * 1024 / 1_000_000)
        self.assertGreater(len(rows), limit)


class EraAndMarkerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        _, cls.data = compose.load_inputs()
        sample = CONFIG["sample"]
        cls.frame = compose.make_frame(sample["region_id"], sample["width"], sample["height"], sample["frame_margin"])

    def test_chapter_filter_and_exact_projection(self):
        rows = compose.build_marker_rows(self.frame, "ch01", self.data, CONFIG)
        ids = {row["id"] for row in rows}
        self.assertIn("city_dali", ids); self.assertIn("sect_tianlongsi", ids); self.assertIn("post_dali", ids)
        self.assertIn("site_xiaoyao_wuliang", ids)
        for row in rows:
            self.assertIn("ch01", row["open_chapters"])
            self.assertEqual((row["x"], row["y"]), self.frame.lonlat(row["longitude"], row["latitude"]))

    def test_city_seat_move_contract(self):
        city = {"longitude": 1, "latitude": 2,
                "seat_moves": [{"eras": ["old"], "longitude": 3, "latitude": 4}]}
        self.assertEqual(compose.chapter_city_position(city, "ch01", {"ch01": {"band": "old"}}), (3, 4))

    def test_city_capital_symbol_uses_current_era_status(self):
        city = {"importance": "capital"}
        self.assertEqual(compose.city_visual_tier(city, {"status": "都城"}), "capital")
        self.assertEqual(compose.city_visual_tier(city, {"status": "路府州县"}), "major")
        self.assertEqual(compose.city_preferred_variant("capital"), "map_kit_dacheng_01")

    def test_poi_visual_uses_era_overrides(self):
        poi = {"name": "关址", "kind": "关隘",
               "eras": {"ch12": {"name": "故址", "display_kind": "遗迹"}}}
        self.assertEqual(compose.poi_visual(poi, "ch12"), ("故址", "yiji"))

    def test_marker_collision_does_not_move_coordinates(self):
        rows = compose.build_marker_rows(self.frame, "ch01", self.data, CONFIG)
        before = {row["id"]: (row["x"], row["y"]) for row in rows}
        after = compose.resolve_marker_collisions(rows, [], CONFIG["markers"]["minimum_spacing_px"])
        self.assertEqual(before, {row["id"]: (row["x"], row["y"]) for row in after})

    def test_nearby_markers_do_not_repeat_variant(self):
        _, _, kit = compose.asset_indexes()
        rows = [{"id": "a", "kind": "menpai", "x": 30.0, "y": 30.0, "size": 40,
                 "clickable": True, "alpha": 1.0, "rendered": True},
                {"id": "b", "kind": "menpai", "x": 60.0, "y": 60.0, "size": 40,
                 "clickable": True, "alpha": 1.0, "rendered": True}]
        _, _, placed = compose.place_markers(Image.new("RGB", (100, 100), "white"), rows, kit, CONFIG, 9, True)
        self.assertNotEqual(placed[0]["asset_id"], placed[1]["asset_id"])

    def test_approved_comparison_output_contract(self):
        self.assertTrue(compose.APPROVED_SAMPLE.is_file())
        products = {
            "default": (Image.new("RGB", (32, 24), "white"), {}, {}),
            "no_jitter": (Image.new("RGB", (32, 24), "white"), {}, {}),
            "river_6": (Image.new("RGB", (32, 24), "white"), {}, {}),
            "river_9": (Image.new("RGB", (32, 24), "white"), {}, {}),
        }
        with mock.patch.object(compose, "load_image", return_value=Image.new("RGB", (32, 24), "white")):
            outputs = compose.output_payloads(CONFIG, products, {})
        self.assertTrue(any(path.name.endswith("_vs_approved.png") for path in outputs))


if __name__ == "__main__":
    unittest.main()
