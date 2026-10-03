"""小型内置城镇回归；不需要任何正式贴片或建筑图片。"""

from __future__ import annotations

import copy
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET

from PIL import Image

from common import (HexGrid, PCG32, ROOT, TownError, bridge_rectangle,
                    building_entrance, canonical_bytes, canonical_hash,
                    cells_from_json, connected, entrance_path, gate_cells,
                    geometry_masks, hexes_from_json, load_yaml, polyline_cells,
                    rectangle, root_seed, substream, supercover)
from check_town import check_fixed_geometry, validate_layout, validate_spec
from render_town import (autotile_mask, building_sort_key, normalize_mask,
                         project, render_layout)
from roads import GenerationError, connect_path, width_two_edge
from schema_check import validate_schema


def small_spec():
    """64 格是 v1 最小合法画幅；几何完全内置，不复制正式城市。"""
    basis = "src_layout_design：单元测试用原创几何，不作为历史布局"
    return {
        "schema_version": "town.city_spec.v1", "kind": "CitySpec",
        "city_id": "city_dali", "chapter_id": "ch01", "book_world": "ch01_tianlong",
        "display_name": "内置测试城", "historical_year": 1093, "era_kit": "song_dali",
        "seed": 42, "design_intent": {"prosperity": "test", "notes": ["内置回归"]},
        "grid": {"width": 64, "height": 64, "cell_m": 1, "chunk_cells": 32},
        "runtime_partition": {"q_min": -32, "r_min": 1, "q_slot_count": 87,
                              "r_slot_count": 64, "q_band_slots": [87],
                              "r_band_slots": [64], "formal_scene_refs": None},
        "projection": {"tile_px": [64, 32], "pitch_deg": 30, "yaw_deg": 45},
        "wall": {"polygon": {"points": [{"x": 4, "z": 4}, {"x": 60, "z": 4},
                                          {"x": 60, "z": 60}, {"x": 4, "z": 60}]},
                 "inside_margin_cells": 2, "basis": basis},
        "gates": [{"id": "south_gate", "side": "south", "at": {"x": 32, "z": 4},
                   "width_cells": 4, "asset_type": "tex_town_song_dali_city_gate",
                   "rotation_deg": 0, "footprint_cells": {"w": 8, "h": 4},
                   "passage_cells": {"w": 4, "h": 4}, "road_ref": "main_north_south",
                   "primary": True, "basis": basis}],
        "streets": [{"id": "main_north_south", "class": "main_axis", "width_cells": 5,
                     "points": [{"x": 32, "z": 4}, {"x": 32, "z": 58}],
                     "surface": "dirt_road", "priority": 100, "basis": basis}],
        "rivers": [{"id": "test_stream", "width_cells": 2,
                    "points": [{"x": 8, "z": 32}, {"x": 56, "z": 32}],
                    "flow": "east", "navigable": False, "basis": basis}],
        "bridges": [{"id": "bridge_main_axis", "at": {"x": 32, "z": 32},
                     "river_ref": "test_stream", "road_ref": "main_north_south",
                     "length_cells": 6, "width_cells": 5, "rotation_deg": 0, "basis": basis}],
        "zones": [{"id": "zone_commercial_south", "kind": "commercial",
                   "geometry": {"rect": {"min": {"x": 10, "z": 10}, "max": {"x": 50, "z": 54}}},
                   "priority": 80, "density": 0.5,
                   "allowed_building_types": ["bld_kit_song_dali_shop"],
                   "ground_mix": {"rammed_earth": 75, "grass": 25}, "basis": basis}],
        "landmarks": [],
        "building_quotas": [{"type": "bld_kit_song_dali_shop", "zone_refs": ["zone_commercial_south"],
                             "count": {"min": 2, "max": 2}, "required": True,
                             "business_ref": None, "institution_ref": None,
                             "placement_note": "只放两座商铺以覆盖真实候选流程"}],
        "vegetation": {"palette": ["prp_song_dali_grass"], "density": 0.01,
                       "avoid_road_cells": 1, "cluster_rule": "2至5株成组", "basis": basis},
        "sources": [{"key": "src_layout_design", "kind": "design_interpretation",
                     "title": "测试几何", "url": None, "accessed": None,
                     "confidence": "original_extension", "supports": ["layout"],
                     "note": "只用于自动化测试"}],
    }


class ContractTests(unittest.TestCase):
    def test_declared_water_gates_open_wall_and_undeclared_crossings_fail(self):
        spec = small_spec()
        spec["rivers"][0]["points"] = [{"x": 0, "z": 32}, {"x": 63, "z": 32}]
        basis = "测试水门（原创扩展）"
        spec["water_gates"] = [
            {"id": "west_water_gate", "wall_ref": "outer", "kind": "water_gate",
             "side": "west", "at": {"x": 4, "z": 32}, "width_cells": 4,
             "asset_type": "tex_town_song_dali_city_gate", "rotation_deg": 90,
             "footprint_cells": {"w": 8, "h": 4},
             "passage_cells": {"w": 4, "h": 4}, "basis": basis},
            {"id": "east_water_gate", "wall_ref": "outer", "kind": "water_gate",
             "side": "east", "at": {"x": 60, "z": 32}, "width_cells": 4,
             "asset_type": "tex_town_song_dali_city_gate", "rotation_deg": 270,
             "footprint_cells": {"w": 8, "h": 4},
             "passage_cells": {"w": 4, "h": 4}, "basis": basis}]
        masks = geometry_masks(spec)
        self.assertFalse(masks["wall"] & masks["water"] - masks["water_passages"])
        self.assertNotIn("TOWN_GATE_ON_WATER",
                         {row["code"] for row in check_fixed_geometry(spec, masks)})
        undeclared = copy.deepcopy(spec)
        undeclared["water_gates"].pop()
        undeclared_masks = geometry_masks(undeclared)
        issues = [row for row in check_fixed_geometry(undeclared, undeclared_masks)
                  if row["code"] == "TOWN_WALL_WATER_UNDECLARED"]
        expected = undeclared_masks["wall"] & undeclared_masks["water"] \
                   - undeclared_masks["water_passages"]
        self.assertEqual(len(issues), len(expected))
        self.assertTrue(all(f"共 {len(expected)} 格" in row["message"] for row in issues))

    def test_multiple_walls_share_cells_and_gate_belongs_to_named_wall(self):
        spec = small_spec()
        del spec["wall"]
        basis = "测试城垣（原创扩展）"
        spec["walls"] = [
            {"id": "west_city", "role": "outer",
             "polygon": {"points": [{"x": 4, "z": 4}, {"x": 32, "z": 4},
                                        {"x": 32, "z": 60}, {"x": 4, "z": 60}]},
             "inside_margin_cells": 2, "basis": basis},
            {"id": "east_city", "role": "inner",
             "polygon": {"points": [{"x": 32, "z": 4}, {"x": 60, "z": 4},
                                        {"x": 60, "z": 60}, {"x": 32, "z": 60}]},
             "inside_margin_cells": 2, "basis": basis},
        ]
        spec["gates"][0]["wall_ref"] = "west_city"
        masks = geometry_masks(spec)
        summed = sum(len(cells) for cells in masks["walls"].values())
        self.assertLess(len(masks["wall"]), summed)
        self.assertIn((32, 20), masks["walls"]["west_city"] & masks["walls"]["east_city"])
        self.assertNotIn("TOWN_GATE_WALL_REF", {row["code"] for row in validate_spec(spec)})
        spec["gates"][0]["wall_ref"] = "missing_wall"
        self.assertIn("TOWN_GATE_WALL_REF", {row["code"] for row in validate_spec(spec)})

    def test_water_gate_opens_only_its_named_wall(self):
        spec = small_spec()
        del spec["wall"]
        basis = "测试命名水门归属（原创扩展）"
        spec["walls"] = [
            {"id": "west_city", "role": "outer",
             "polygon": {"points": [{"x": 4, "z": 4}, {"x": 32, "z": 4},
                                        {"x": 32, "z": 60}, {"x": 4, "z": 60}]},
             "inside_margin_cells": 2, "basis": basis},
            {"id": "east_city", "role": "inner",
             "polygon": {"points": [{"x": 32, "z": 4}, {"x": 60, "z": 4},
                                        {"x": 60, "z": 60}, {"x": 32, "z": 60}]},
             "inside_margin_cells": 2, "basis": basis},
        ]
        spec["gates"][0]["wall_ref"] = "west_city"
        spec["rivers"][0]["points"] = [{"x": 0, "z": 32}, {"x": 63, "z": 32}]
        spec["water_gates"] = [{
            "id": "west_city_water_gate", "wall_ref": "west_city",
            "kind": "water_gate", "side": "east", "at": {"x": 32, "z": 32},
            "width_cells": 4, "asset_type": "tex_town_song_dali_city_gate",
            "rotation_deg": 270, "footprint_cells": {"w": 8, "h": 4},
            "passage_cells": {"w": 4, "h": 4}, "basis": basis,
        }]
        masks = geometry_masks(spec)
        issues = [row for row in check_fixed_geometry(spec, masks)
                  if row["code"] == "TOWN_WALL_WATER_UNDECLARED"]
        shared_water = (masks["walls"]["east_city"] & masks["water"]
                        & masks["water_passages"])
        self.assertTrue(shared_water)
        reported = {(row["at"]["x"], row["at"]["z"]) for row in issues}
        self.assertTrue(shared_water <= reported)

    def test_named_wall_ids_are_stable_and_unique(self):
        spec = small_spec()
        del spec["wall"]
        wall = {"id": "same_wall", "role": "outer",
                "polygon": {"points": [{"x": 4, "z": 4}, {"x": 60, "z": 4},
                                           {"x": 60, "z": 60}, {"x": 4, "z": 60}]},
                "inside_margin_cells": 2, "basis": "测试城垣（原创扩展）"}
        spec["walls"] = [copy.deepcopy(wall), copy.deepcopy(wall)]
        issues = validate_schema(spec, "CitySpec")
        self.assertIn("TOWN_SCHEMA_DUPLICATE_ID", {row["code"] for row in issues})
        spec["walls"][1]["id"] = "Inner Wall"
        issues = validate_schema(spec, "CitySpec")
        self.assertIn("TOWN_SCHEMA_RANGE", {row["code"] for row in issues})

    def test_walls_none_uses_full_bounds_and_allows_no_gate(self):
        spec = small_spec()
        del spec["wall"]
        spec["walls"] = "none"
        spec["gates"] = []
        spec["rivers"] = []
        spec["bridges"] = []
        masks = geometry_masks(spec)
        self.assertEqual(masks["wall"], set())
        self.assertEqual(masks["interior"], masks["bounds"])
        self.assertEqual(masks["margin"], masks["bounds"])
        self.assertNotIn("TOWN_GATE_PRIMARY", {row["code"] for row in validate_spec(spec)})

    def test_walls_none_pipeline_uses_main_axis_as_navigation_root(self):
        from gen_layout import generate_layout
        spec = small_spec()
        del spec["wall"]
        spec["walls"] = "none"
        spec["gates"] = []
        spec["rivers"] = []
        spec["bridges"] = []
        layout, stats = generate_layout(spec)
        self.assertTrue(stats["complete"])
        self.assertFalse([row for row in validate_layout(spec, layout, check_assets=False)
                          if row["severity"] == "error"])

    def test_tang_xiyu_tubo_are_valid_era_kits(self):
        for era in ("tang", "xiyu", "tubo"):
            spec = small_spec()
            spec["era_kit"] = era
            spec["gates"][0]["asset_type"] = f"tex_town_{era}_city_gate"
            for gate in spec.get("water_gates", []):
                gate["asset_type"] = f"tex_town_{era}_city_gate"
            self.assertNotIn("TOWN_SCHEMA_ENUM",
                             {row["code"] for row in validate_schema(spec, "CitySpec")})

    def test_era_kit_asset_fallback_is_explicit(self):
        from assets import AssetLibrary
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            Image.new("RGBA", (64, 32), (120, 90, 60, 255)).save(directory / "tile.png")
            manifest = directory / "manifest.yaml"
            manifest.write_bytes(canonical_bytes({"assets": [
                {"id": "tex_town_song_southern_rammed_earth", "file": "tile.png"},
                {"id": "tex_town_song_dali_rammed_earth", "file": "tile.png"},
            ]}))
            library = AssetLibrary(manifest)
            for era, owner in (("tang", "song_southern"), ("xiyu", "song_dali"),
                               ("tubo", "song_dali")):
                requested = f"tex_town_{era}_rammed_earth"
                found = library.resolve(requested)
                self.assertIsNotNone(found)
                self.assertIn(f"era-kit-fallback:{requested}->tex_town_{owner}_rammed_earth",
                              found[1]["adaptations"])

    def test_tang_bridge_fallback_selects_the_available_native_rotation(self):
        from assets import AssetLibrary
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            Image.new("RGBA", (64, 32), (120, 90, 60, 255)).save(directory / "bridge-0.png")
            Image.new("RGBA", (64, 32), (120, 90, 60, 255)).save(directory / "bridge-90.png")
            manifest = directory / "manifest.yaml"
            manifest.write_bytes(canonical_bytes({"assets": [
                {"id": "tex_town_song_dali_bridge_deck", "file": "bridge-0.png",
                 "rotation_deg": 0},
                {"id": "tex_town_song_southern_bridge_deck", "file": "bridge-90.png",
                 "rotation_deg": 90},
            ]}))
            found = AssetLibrary(manifest).resolve("tex_town_tang_bridge_deck", rotation_deg=0)
            self.assertIsNotNone(found)
            self.assertIn(
                "shared-bridge-view:tex_town_song_southern_bridge_deck->"
                "tex_town_song_dali_bridge_deck", found[1]["adaptations"]
            )

    def test_pcg_reference_vectors(self):
        generator = PCG32(42, 54)
        self.assertEqual([generator.next() for _ in range(6)],
                         [0xa15c02b7, 0x7b47f409, 0xba1d3330, 0x83d2f293, 0xbfa4784b, 0xcbed606e])
        spec = dict(city_id="city_dali", chapter_id="ch01", seed=109301)
        root = root_seed(spec)
        self.assertEqual(root, 0x6a461730c6982b98)
        generator = substream(root, "roads")
        self.assertEqual([generator.next() for _ in range(4)],
                         [0xa903fdf0, 0xcc58feb9, 0x0215efc9, 0x1cbf99c4])
        for invalid in (0, -1, 2 ** 32 + 1, True, 1.5):
            with self.assertRaises(TownError):
                generator.uniform(invalid)

    def test_sixteen_rotated_entrances_and_buffers(self):
        expected = {
            "N": [(16, 32), (22, 27), (17, 19), (9, 26)],
            "E": [(24, 25), (15, 19), (9, 26), (16, 34)],
            "S": [(16, 19), (9, 27), (17, 32), (22, 26)],
            "W": [(9, 25), (15, 34), (24, 26), (16, 19)],
        }
        for edge in "NESW":
            for rotation, cell in zip((0, 90, 180, 270), expected[edge]):
                with self.subTest(edge=edge, rotation=rotation):
                    entrance, normal = building_entrance((10, 20), 14, 12, rotation, edge)
                    self.assertEqual(entrance, cell)
                    size = (12, 14) if rotation in (90, 270) else (14, 12)
                    buffer = {(cell[0] + normal[0] * i, cell[1] + normal[1] * i) for i in range(4)}
                    self.assertFalse(buffer & rectangle((10, 20), size))

    def test_supercover_corner_and_even_road_width(self):
        self.assertEqual(supercover((0.5, 0.5), (1.5, 1.5)),
                         {(0, 0), (1, 0), (0, 1), (1, 1)})
        self.assertEqual(supercover((1, 0.5), (1, 1.5)),
                         {(0, 0), (1, 0), (0, 1), (1, 1)})
        self.assertEqual(polyline_cells([(2, 2), (2, 4)], 2),
                         {(2, 2), (3, 2), (2, 3), (3, 3), (2, 4), (3, 4)})

    def test_even_bridge_and_gate_have_different_bias(self):
        bridge = dict(at=dict(x=20, z=30), width_cells=4, length_cells=6, rotation_deg=0)
        self.assertEqual(bridge_rectangle(bridge), rectangle((18, 27), (4, 6)))
        bridge["rotation_deg"] = 90
        self.assertEqual(bridge_rectangle(bridge), rectangle((17, 28), (6, 4)))
        gate = dict(at=dict(x=20, z=30), rotation_deg=0, footprint_cells=dict(w=8, h=4),
                    passage_cells=dict(w=4, h=4))
        self.assertEqual(gate_cells(gate, True), rectangle((19, 29), (4, 4)))
        self.assertEqual(len(gate_cells(gate) - gate_cells(gate, True)), 16)

    def test_entrance_bfs_ties_by_road_then_target_then_path(self):
        walk = rectangle((0, 0), (7, 7))
        roads = {"z_road": {(3, 5)}, "a_road": {(5, 3)}}
        self.assertEqual(entrance_path((3, 3), walk, roads), [(3, 3), (4, 3), (5, 3)])
        self.assertEqual(entrance_path((1, 1), walk, {"road": {(2, 2)}}),
                         [(1, 1), (2, 1), (2, 2)])
        self.assertIsNone(entrance_path((0, 0), walk, {"road": {(6, 6)}}))

    def test_full_width_connector_rejects_one_cell_corridor(self):
        corridor = {(x, 1) for x in range(6)}
        args = ([(0, 1)], {(5, 1)}, corridor, {(0, 1), (5, 1)}, {}, {}, 0, 6, 3)
        self.assertIsNone(connect_path(*args))
        wider = corridor | {(x, 0) for x in range(6)}
        path = connect_path(args[0], args[1], wider, *args[3:])
        self.assertEqual(path, [(x, 1) for x in range(6)])
        self.assertTrue(all(width_two_edge(a, b) <= wider for a, b in zip(path, path[1:])))

    def test_hex_samples_are_conservative_and_slots_match(self):
        grid = HexGrid(96, 96)
        self.assertEqual(len(grid.slots), 8016)
        slot = (0, 20)
        samples = set(grid.samples[slot])
        self.assertIn(slot, grid.walkable(samples))
        samples.remove(next(iter(samples)))
        self.assertNotIn(slot, grid.walkable(samples))
        self.assertEqual(len(HexGrid(160, 160).slots), 22240)

    def test_hex_incremental_cache_handles_changed_footprints(self):
        grid = HexGrid(64, 64)
        planning = rectangle((4, 4), (56, 56))
        branches = [planning, planning - rectangle((12, 12), (6, 5)),
                    planning - rectangle((13, 14), (6, 5)), planning]
        for branch in branches:
            expected = {slot for slot, samples in grid.samples.items() if samples <= branch}
            actual = grid.walkable(branch)
            self.assertEqual(actual, expected)
            root = min(actual)
            self.assertEqual(grid.connected(actual, root), connected(actual, root, hexagonal=True))
            # 返回值可由调用方修改；下一次读取不能受它影响。
            actual.clear()
            self.assertEqual(grid.walkable(branch), expected)

    def test_schema_rejects_unknown_and_strict_yaml(self):
        spec = small_spec()
        self.assertFalse(validate_schema(spec, "CitySpec"))
        spec["grid"]["typo"] = 1
        self.assertIn("TOWN_SCHEMA_UNKNOWN_FIELD", {x["code"] for x in validate_schema(spec, "CitySpec")})
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "invalid.yaml"
            for contents in ("date: 2026-09-30\n", "seed: 1\nseed: 2\n", "value: .nan\n"):
                path.write_text(contents, encoding="utf-8")
                with self.subTest(contents=contents), self.assertRaises(TownError):
                    load_yaml(path)

    def test_autotile_gates_diagonals_and_has_47_cases(self):
        self.assertEqual(normalize_mask(2), 0)
        self.assertEqual(normalize_mask(1 | 2), 1)
        self.assertEqual(normalize_mask(1 | 2 | 4), 7)
        self.assertEqual(len({normalize_mask(mask) for mask in range(256)}), 47)
        cells = {(4, 5), (5, 5), (5, 4), (3, 3)}
        self.assertEqual(autotile_mask(4, 4, cells), 7)

    def test_depth_sort_uses_far_corner_and_stable_id(self):
        def building(ident, x, z, w, h):
            return dict(id=ident, origin=dict(x=x, z=z), size=dict(w=w, h=h))
        # 两座中心深度相同，宽楼远角更靠前，应最后绘制。
        wide = building("wide", 10, 10, 10, 2)
        narrow = building("narrow", 14, 10, 2, 2)
        self.assertEqual(sorted([wide, narrow], key=lambda b: building_sort_key(b, 64)), [narrow, wide])
        tie_a, tie_b = building("a", 2, 4, 6, 5), building("b", 2, 4, 6, 5)
        self.assertLess(building_sort_key(tie_a, 64), building_sort_key(tie_b, 64))
        self.assertEqual(project(11, 20, 64), (992, 880))
        self.assertEqual(project(10, 21, 64), (992, 848))

    def test_asset_alias_exact_mask_view_and_invalid_metadata(self):
        from assets import AssetLibrary
        with tempfile.TemporaryDirectory() as directory:
            directory = Path(directory)
            Image.new("RGBA", (64, 32), (120, 90, 60, 255)).save(directory / "tile.png")
            manifest = directory / "manifest.yaml"
            manifest.write_bytes(canonical_bytes({"assets": [
                {"id": "road", "masks": {"7": "tile.png"}},
                {"id": "road_alias", "alias": "road"},
                {"id": "house", "views": {"0": "tile.png", "90": "tile.png"}},
                {"id": "broken", "masks": ["oops"]},
            ]}))
            library = AssetLibrary(manifest)
            self.assertEqual(library.resolve("road_alias", mask=7)[0].size, (64, 32))
            self.assertIsNone(library.resolve("road", mask=5))
            self.assertEqual(library.resolve("house", rotation_deg=90)[1]["rotation_deg"], 90)
            self.assertIsNone(library.resolve("house", rotation_deg=180))
            self.assertIsNone(library.resolve("broken", mask=7))
            self.assertIn("broken/mask=7/metadata", library.missing)
            self.assertTrue(library.warnings)


class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from gen_layout import generate_layout
        cls.spec = small_spec()
        cls.layout, cls.stats = generate_layout(cls.spec)

    def test_generate_is_deterministic_and_does_not_mutate_spec(self):
        from gen_layout import generate_layout
        spec = small_spec()
        second, _ = generate_layout(spec)
        self.assertEqual(spec, small_spec())
        self.assertEqual(canonical_bytes(second), canonical_bytes(self.layout))
        self.assertEqual(canonical_hash(second), canonical_hash(self.layout))

    def test_api_and_cli_do_not_embed_absolute_source_paths(self):
        from gen_layout import generate_layout
        first, _ = generate_layout(small_spec(), "/private/tmp/a/city.yaml")
        second, _ = generate_layout(small_spec(), "/private/tmp/b/city.yaml")
        self.assertEqual(canonical_bytes(first), canonical_bytes(second))
        self.assertEqual(first["source_spec"]["path"], "city.yaml")
        with tempfile.TemporaryDirectory() as directory:
            source, output = Path(directory) / "spec.yaml", Path(directory) / "layout.yaml"
            source.write_bytes(canonical_bytes(self.spec))
            result = subprocess.run([sys.executable, str(ROOT / "tools/town/gen_layout.py"),
                                     str(source), "-o", str(output)], cwd=ROOT,
                                    text=True, capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            contents = output.read_text(encoding="utf-8")
            self.assertNotIn(directory, contents)
            self.assertEqual(load_yaml(output)["source_spec"]["path"], source.name)

    def test_generated_layout_is_valid_and_footprints_disjoint(self):
        self.assertEqual(validate_spec(self.spec), [])
        issues = validate_layout(self.spec, self.layout, check_assets=False)
        self.assertEqual([row for row in issues if row["severity"] == "error"], [])
        self.assertEqual(len(self.layout["buildings"]), 2)
        occupied = set()
        water = cells_from_json(self.layout["water_cells"])
        for building in self.layout["buildings"]:
            footprint = rectangle(building["origin"], building["size"])
            self.assertFalse(occupied & footprint)
            self.assertFalse(water & footprint)
            occupied |= footprint
        self.assertFalse(occupied & cells_from_json(self.layout["walk_layer"]["planning_walkable"]))

    def test_road_planning_and_hex_connectivity(self):
        roads = set().union(*(cells_from_json(cells) for cells in self.layout["roads"].values()))
        self.assertEqual(connected(roads, (32, 4)), roads)
        planning = cells_from_json(self.layout["walk_layer"]["planning_walkable"])
        reached = connected(planning, (32, 4))
        for building in self.layout["buildings"]:
            self.assertLessEqual(cells_from_json(building["entrance_cells"]), reached)
        grid, masks = HexGrid(64, 64), geometry_masks(self.spec)
        runtime = hexes_from_json(self.layout["walk_layer"]["runtime_hex_walkable"])
        self.assertEqual(grid.walkable(planning), runtime)
        gate = self.spec["gates"][0]
        root = grid.gate_hex(gate, runtime, masks["interior"], roads, masks["passages"],
                             wall_points=self.spec["wall"]["polygon"]["points"])
        component = grid.connected(runtime, root)
        for building in self.layout["buildings"]:
            self.assertLessEqual(hexes_from_json(building["entrance_hexes"]), component)

    def test_validator_rejects_overlap_and_water(self):
        changed = copy.deepcopy(self.layout)
        for key in ("origin", "size", "rotation_deg"):
            changed["buildings"][1][key] = copy.deepcopy(changed["buildings"][0][key])
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_BUILDING_OVERLAP", codes)
        changed = copy.deepcopy(self.layout)
        changed["buildings"][0]["origin"] = {"x": 12, "z": 31}
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_BUILDING_ON_WATER", codes)

    def test_validator_rejects_outside_wall_and_wrong_walk_layer(self):
        changed = copy.deepcopy(self.layout)
        changed["buildings"][0]["origin"] = {"x": 0, "z": 10}
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_BUILDING_OUTSIDE_WALL", codes)
        changed = copy.deepcopy(self.layout)
        changed["walk_layer"]["planning_walkable"].pop()
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_WALK_FOOTPRINT_MISMATCH", codes)

    def test_missing_assets_warn_and_strict_assets_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            missing = Path(directory) / "absent.yaml"
            for strict, severity in ((False, "warning"), (True, "error")):
                issues = validate_layout(self.spec, self.layout, strict_assets=strict,
                                         tile_manifest=missing, building_manifest=missing)
                absent = [row for row in issues if row["code"] == "TOWN_ASSET_MISSING"]
                self.assertTrue(absent)
                self.assertEqual({row["severity"] for row in absent}, {severity})

    def test_bridge_removal_fails_generation_and_layout_check(self):
        from gen_layout import generate_layout
        changed_spec = copy.deepcopy(self.spec)
        changed_spec["bridges"] = []
        with self.assertRaises(GenerationError) as caught:
            generate_layout(changed_spec)
        self.assertEqual(caught.exception.issue["code"], "TOWN_ROAD_WATER_UNBRIDGED")
        changed = copy.deepcopy(self.layout)
        changed["bridge_cells"] = []
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_ROAD_WATER_UNBRIDGED", codes)

    def test_empty_ground_does_not_count_as_road_connection(self):
        changed = copy.deepcopy(self.layout)
        for key in changed["roads"]:
            changed["roads"][key] = [p for p in changed["roads"][key] if p["z"] != 20]
        # 地面与行走层保持可达，只有道路格标签被切断。
        planning = cells_from_json(changed["walk_layer"]["planning_walkable"])
        self.assertIn((32, 21), connected(planning, (32, 4)))
        codes = {x["code"] for x in validate_layout(self.spec, changed, check_assets=False)}
        self.assertIn("TOWN_ROAD_COMPONENT_DISCONNECTED", codes)

    def test_distinct_python_hashseeds_produce_identical_bytes(self):
        script = ("from test_town import small_spec; from gen_layout import generate_layout; "
                  "from common import canonical_bytes; import sys; "
                  "sys.stdout.buffer.write(canonical_bytes(generate_layout(small_spec())[0]))")
        outputs = []
        for seed in ("1", "98765"):
            env = dict(os.environ, PYTHONHASHSEED=seed, PYTHONPATH=str(ROOT / "tools/town"))
            outputs.append(subprocess.check_output([sys.executable, "-c", script], env=env,
                                                    cwd=ROOT, timeout=30))
        self.assertEqual(outputs[0], outputs[1])

    def test_placeholder_render_produces_png_svg_and_missing_list(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "town.png"
            overlay = Path(directory) / "town.overlay.svg"
            missing = Path(directory) / "absent_manifest.yaml"
            report = render_layout(self.layout, output, spec=self.spec, scale=0.125,
                                   tile_manifest=missing, building_manifest=missing, overlay=overlay)
            with Image.open(output) as image:
                self.assertEqual(image.size, (512, 256))
                self.assertGreater(len(image.getcolors(512 * 256)), 5)
            self.assertEqual(report["size_px"], [512, 256])
            self.assertTrue(any("bld_kit_song_dali_shop" in x for x in report["missing_assets"]))
            self.assertEqual(report["missing_assets"], sorted(set(report["missing_assets"])))
            self.assertEqual(ET.parse(overlay).getroot().tag, "{http://www.w3.org/2000/svg}svg")
            expected = [b["id"] for b in sorted(self.layout["buildings"],
                                                key=lambda b: building_sort_key(b, 64))]
            actual = [ident for ident in report["building_draw_order"] if ident in expected]
            self.assertEqual(actual, expected)

    def test_cli_hard_failure_does_not_write_layout(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "spec.yaml"
            output = Path(directory) / "layout.yaml"
            invalid = copy.deepcopy(self.spec)
            invalid["bridges"] = []
            source.write_bytes(canonical_bytes(invalid))
            result = subprocess.run([sys.executable, str(ROOT / "tools/town/gen_layout.py"),
                                     str(source), "-o", str(output)], cwd=ROOT,
                                    text=True, capture_output=True, timeout=30)
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn("TOWN_ROAD_WATER_UNBRIDGED", result.stderr + result.stdout)
            self.assertFalse(output.exists())


class ConstructiveTests(unittest.TestCase):
    def test_fixed_yamen_reserves_all_four_entrance_cells(self):
        from gen_layout import generate_layout
        spec = small_spec()
        spec["seed"] = 0
        zone = spec["zones"][0]
        kind = "bld_kit_song_dali_yamen"
        zone["allowed_building_types"].append(kind)
        spec["landmarks"] = [dict(id="lm_test_yamen", type=kind,
            origin=dict(x=10, z=18), size=dict(w=14, h=11), rotation_deg=0,
            zone_ref=zone["id"], poi=None, basis=zone["basis"])]
        spec["building_quotas"][0]["count"] = {"min": 0, "max": 8}
        layout, _ = generate_layout(spec)
        buffer = {(16, z) for z in range(14, 18)}
        self.assertLessEqual(buffer, cells_from_json(layout["walk_layer"]["planning_walkable"]))
        self.assertFalse(buffer & {(d["at"]["x"], d["at"]["z"]) for d in layout["decorations"]})
        self.assertFalse([i for i in validate_layout(spec, layout, check_assets=False)
                          if i["severity"] == "error"])

    def test_fixed_building_outside_quota_zone_does_not_satisfy_minimum(self):
        from gen_layout import generate_layout
        spec = small_spec()
        zone = spec["zones"][0]
        kind = "bld_kit_song_dali_inn"
        zone["allowed_building_types"].append(kind)
        east = dict(zone, id="zone_commercial_east", priority=90,
                    geometry={"rect": {"min": {"x": 35, "z": 10},
                                         "max": {"x": 50, "z": 54}}})
        spec["zones"].append(east)
        spec["landmarks"] = [dict(id="lm_test_inn", type=kind,
            origin=dict(x=10, z=16), size=dict(w=10, h=8), rotation_deg=0,
            zone_ref=zone["id"], poi=None, basis=zone["basis"])]
        spec["building_quotas"][0].update(type=kind, zone_refs=[east["id"]],
                                          count={"min": 1, "max": 1})
        layout, _ = generate_layout(spec)
        self.assertEqual(sum(b["type"] == kind and b["zone_ref"] == east["id"]
                             for b in layout["buildings"]), 1)
        self.assertFalse([i for i in validate_layout(spec, layout, check_assets=False)
                          if i["severity"] == "error"])

    def test_generic_shortfall_is_reported_and_checker_keeps_minimum(self):
        from gen_layout import generate_layout
        spec = small_spec()
        spec["zones"][0]["geometry"]["rect"] = {
            "min": {"x": 26, "z": 10}, "max": {"x": 30, "z": 30}}
        layout, stats = generate_layout(spec)
        self.assertEqual(layout["buildings"], [])
        self.assertEqual(stats["missing_required"], {"bld_kit_song_dali_shop": 2})
        codes = {row["code"] for row in validate_layout(spec, layout, check_assets=False)}
        self.assertIn("TOWN_REQUIRED_QUOTA", codes)

    def test_functional_shortfall_fails_generation(self):
        from gen_layout import generate_layout
        spec = small_spec()
        spec["zones"][0]["geometry"]["rect"] = {
            "min": {"x": 26, "z": 10}, "max": {"x": 30, "z": 30}}
        kind = "bld_kit_song_dali_inn"
        spec["zones"][0]["allowed_building_types"] = [kind]
        spec["building_quotas"][0].update(type=kind, count={"min": 1, "max": 1})
        with self.assertRaises(GenerationError) as caught:
            generate_layout(spec)
        self.assertEqual(caught.exception.issue["code"], "TOWN_REQUIRED_NO_SPACE")

    def test_functional_building_precedes_greedy_generic_fill(self):
        from gen_layout import generate_layout
        spec = small_spec()
        shrine = "bld_kit_song_dali_shrine"
        spec["zones"][0]["allowed_building_types"].append(shrine)
        quota = copy.deepcopy(spec["building_quotas"][0])
        quota.update(type=shrine, count={"min": 1, "max": 1})
        spec["building_quotas"] = [quota]
        baseline, _ = generate_layout(spec)
        shop = copy.deepcopy(small_spec()["building_quotas"][0])
        shop["count"] = {"min": 0, "max": 8}
        spec["building_quotas"].insert(0, shop)
        filled, _ = generate_layout(spec)
        first = next(b for b in baseline["buildings"] if b["type"] == shrine)
        second = next(b for b in filled["buildings"] if b["type"] == shrine)
        for key in ("origin", "size", "rotation_deg", "entrance_cells"):
            self.assertEqual(first[key], second[key])
        self.assertGreater(sum(b["type"] == shop["type"] for b in filled["buildings"]), 0)
        self.assertFalse([i for i in validate_layout(spec, filled, check_assets=False)
                          if i["severity"] == "error"])

    def test_fixed_entrance_gets_an_automatic_path_to_street(self):
        from gen_layout import generate_layout
        spec = small_spec()
        kind = "bld_kit_song_dali_inn"
        zone = spec["zones"][0]
        zone["allowed_building_types"].append(kind)
        spec["landmarks"] = [dict(id="lm_test_inn", type=kind,
            origin=dict(x=10, z=16), size=dict(w=10, h=8), rotation_deg=0,
            zone_ref=zone["id"], poi=None, basis=zone["basis"])]
        quota = copy.deepcopy(spec["building_quotas"][0])
        quota.update(type=kind, count={"min": 1, "max": 1})
        spec["building_quotas"].append(quota)
        layout, _ = generate_layout(spec)
        connectors = [c for c in layout["generated_connectors"]
                      if c["reason"] == "required_entrance_unconnected"]
        self.assertTrue(connectors)
        self.assertTrue(any(len(c["cells"]) > 7 for c in connectors))
        self.assertFalse([i for i in validate_layout(spec, layout, check_assets=False)
                          if i["severity"] == "error"])

    def test_entrance_path_avoids_other_palace_zone(self):
        from common import cells_to_json, zone_winners
        from gen_layout import generate_layout
        spec = small_spec()
        zone = spec["zones"][0]
        kind = "bld_kit_song_dali_inn"
        zone["allowed_building_types"].append(kind)
        palace = dict(zone, id="zone_palace_test", kind="palace", priority=90,
                      geometry={"rect": {"min": {"x": 22, "z": 10},
                                           "max": {"x": 30, "z": 30}}})
        spec["zones"].append(palace)
        spec["landmarks"] = [dict(id="lm_test_inn", type=kind,
            origin=dict(x=10, z=16), size=dict(w=10, h=8), rotation_deg=0,
            zone_ref=zone["id"], poi=None, basis=zone["basis"])]
        spec["building_quotas"][0]["count"] = {"min": 0, "max": 0}
        layout, _ = generate_layout(spec)
        protected = zone_winners(spec)[palace["id"]]
        for connector in layout["generated_connectors"]:
            self.assertFalse(cells_from_json(layout["roads"][connector["id"]]) & protected)
        self.assertFalse([i for i in validate_layout(spec, layout, check_assets=False)
                          if i["severity"] == "error"])
        # 伪造穿宫禁的直线步道：即使地面可走，独立检查仍须拦截。
        changed = copy.deepcopy(layout)
        connector = changed["generated_connectors"][0]
        x, z = connector["from"]["x"], connector["from"]["z"]
        chain = [{"x": px, "z": z} for px in range(x, 31)]
        connector.update(cells=chain, to=chain[-1])
        changed["roads"][connector["id"]] = cells_to_json(polyline_cells(chain, 2))
        codes = {i["code"] for i in validate_layout(spec, changed, check_assets=False)}
        self.assertIn("TOWN_CONNECTOR_PALACE", codes)


if __name__ == "__main__":
    unittest.main()
