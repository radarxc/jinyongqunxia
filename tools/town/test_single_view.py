"""Single-view placement and generation-time bridge union regressions."""
from copy import deepcopy
from pathlib import Path
import tempfile
import unittest

from PIL import Image
import yaml

from check_town import validate_assets, validate_layout, validate_spec
from common import ROOT, building_entrance, catalog, geometry_masks, load_yaml, rectangle, root_seed, zone_winners
from gen_layout import generate_layout
from placement import candidates_for
from roads import GenerationError, bridge_footprint_cells, planning_bridge_groups
from test_town import small_spec


class SingleViewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec = small_spec()
        cls.layout, cls.stats = generate_layout(cls.spec)

    def test_generated_buildings_use_native_unswapped_footprint(self):
        for building in self.layout["buildings"]:
            entry = catalog()[building["type"]]
            self.assertEqual(building["rotation_deg"], 0)
            self.assertEqual(building["size"], dict(w=entry["w"], h=entry["h"]))
        self.assertEqual(validate_layout(self.spec, self.layout, check_assets=False), [])

    def test_candidate_can_stand_away_from_road_without_rotating_to_face_it(self):
        spec = self.spec
        masks = geometry_masks(spec)
        candidates = candidates_for(spec, spec["building_quotas"][0], masks,
                                    zone_winners(spec), masks["roads"], [], set(), root_seed(spec))
        roads = set().union(*masks["roads"].values())
        self.assertTrue(any(c.entrance not in roads for c in candidates))
        self.assertEqual({c.building["rotation_deg"] for c in candidates}, {0})
        entry = catalog()[spec["building_quotas"][0]["type"]]
        self.assertEqual({(c.building["size"]["w"], c.building["size"]["h"])
                          for c in candidates}, {(entry["w"], entry["h"])})
        self.assertTrue(any(c.entrance not in {
            building_entrance(c.building["origin"], entry["w"], entry["h"], 0, edge)[0]
            for edge in entry["entrance_edges"]} for c in candidates))

    def test_optional_storage_cannot_displace_required_shops(self):
        spec = small_spec()
        spec["building_quotas"][0]["count"] = dict(min=0, max=8)
        baseline, _ = generate_layout(spec)
        kind = "bld_kit_song_dali_warehouse"
        spec["zones"][0]["allowed_building_types"].append(kind)
        quota = deepcopy(spec["building_quotas"][0])
        quota.update(type=kind, required=False, count=dict(min=0, max=1))
        spec["building_quotas"].append(quota)
        filled, _ = generate_layout(spec)
        shops = [b for b in filled["buildings"] if b["type"].endswith("_shop")]
        self.assertEqual([(b["origin"], b["entrance_cells"]) for b in shops],
                         [(b["origin"], b["entrance_cells"]) for b in baseline["buildings"]])

    def test_stale_rotation_and_swapped_footprint_remain_errors(self):
        layout = deepcopy(self.layout)
        building = layout["buildings"][0]
        building["rotation_deg"] = 90
        building["size"] = dict(w=building["size"]["h"], h=building["size"]["w"])
        issues = validate_layout(self.spec, layout, check_assets=False)
        self.assertTrue({"TOWN_BUILDING_ROTATION", "TOWN_BUILDING_SIZE"}
                        <= {item["code"] for item in issues})

    def test_strict_native_view_keeps_missing_and_footprint_checks(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            image = root / "shop.png"
            sprite = Image.new("RGBA", (64, 32))
            sprite.paste((80, 90, 100, 255), (4, 4, 60, 28))
            sprite.save(image)
            building = self.layout["buildings"][0]
            row = dict(id=building["type"], file=image.name, status="candidate",
                       anchor_px=[32, 16], building=dict(footprint=list(building["size"].values())),
                       views=[dict(rotation_deg=0, file=image.name)])
            manifest = root / "manifest.yaml"
            def problems():
                manifest.write_text(yaml.safe_dump([row]))
                return [i for i in validate_assets(self.spec, self.layout, strict=True,
                        building_manifest=manifest, tile_manifest=manifest)
                        if i["path"] == "assets.buildings"]
            self.assertEqual(problems(), [])
            row["building"]["footprint"] = [99, 99]
            self.assertIn("TOWN_BUILDING_VIEW_FOOTPRINT", {i["code"] for i in problems()})
            image.unlink()
            self.assertIn("TOWN_ASSET_MISSING", {i["code"] for i in problems()})


class PlanningBridgeTests(unittest.TestCase):
    def test_dry_bridge_heads_exclude_candidates_and_reject_fixed_buildings(self):
        spec = small_spec()
        spec["bridges"][0]["width_cells"] = 9
        masks = geometry_masks(spec)
        bridge = bridge_footprint_cells(masks)
        origin = dict(x=23, z=25)
        size = dict(w=6, h=5)
        foot = rectangle(origin, size)
        self.assertEqual(foot & bridge, {(28, 29)})
        self.assertFalse(foot & masks["water"])
        self.assertFalse(foot & set().union(*masks["roads"].values()))
        candidates = candidates_for(spec, spec["building_quotas"][0], masks,
                                    zone_winners(spec), masks["roads"], [], set(), root_seed(spec))
        self.assertTrue(candidates)
        self.assertFalse(any(candidate.foot & bridge for candidate in candidates))
        layout, _ = generate_layout(spec)
        self.assertFalse(any(rectangle(b["origin"], b["size"]) & bridge for b in layout["buildings"]))
        self.assertFalse({(d["at"]["x"], d["at"]["z"]) for d in layout["decorations"]} & bridge)
        self.assertFalse([i for i in validate_layout(spec, layout, check_assets=False)
                          if i["severity"] == "error"])
        layout["buildings"][0]["origin"] = origin
        self.assertIn("TOWN_BUILDING_ON_BRIDGE", {i["code"] for i in
                      validate_layout(spec, layout, check_assets=False)})
        spec["landmarks"] = [dict(id="lm_bridge_intruder", type=spec["building_quotas"][0]["type"],
                                 origin=origin, size=size, rotation_deg=0, poi=None,
                                 zone_ref=spec["zones"][0]["id"], basis=spec["zones"][0]["basis"])]
        self.assertIn("TOWN_BUILDING_ON_BRIDGE", {i["code"] for i in validate_spec(spec)})
        with self.assertRaises(GenerationError) as raised:
            generate_layout(spec)
        self.assertEqual(raised.exception.issue["code"], "TOWN_BUILDING_ON_BRIDGE")

    def test_linan_twelve_source_crossings_have_eleven_disjoint_decks(self):
        spec = load_yaml(ROOT / "docs/design/town/city_hangzhou__ch02.yaml")
        original = deepcopy(spec)
        groups = planning_bridge_groups(spec["bridges"])
        self.assertEqual(len(spec["bridges"]), 12)
        self.assertEqual(len(groups), 11)
        merged = [(members, cells) for members, cells in groups if len(members) > 1]
        self.assertEqual(len(merged), 1)
        self.assertEqual({b["id"] for b in merged[0][0]}, {"bridge_north", "bridge_gate_north"})
        self.assertEqual(len(merged[0][1]), 56)
        for i, (_, cells) in enumerate(groups):
            for _, other in groups[i+1:]:
                self.assertFalse(cells & other)
        self.assertEqual(spec, original)

    def test_overlaps_that_cannot_be_merged_fail_before_generation(self):
        base = dict(length_cells=4, width_cells=4, rotation_deg=90, river_ref="canal")
        first = dict(base, id="first", at=dict(x=5, z=5))
        for second in (dict(base, id="second", at=dict(x=7, z=7)),
                       dict(base, id="second", at=dict(x=5, z=5), river_ref="other"),
                       dict(base, id="second", at=dict(x=5, z=5), rotation_deg=0)):
            with self.subTest(second=second), self.assertRaises(GenerationError) as raised:
                planning_bridge_groups([first, second])
            self.assertEqual(raised.exception.issue["code"], "TOWN_BRIDGE_OVERLAP")


if __name__ == "__main__":
    unittest.main()
