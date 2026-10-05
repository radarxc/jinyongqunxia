"""Real-delivery schema adapters, using tiny local fixtures without source assets."""
from io import BytesIO
import tempfile
from pathlib import Path
import unittest
from unittest.mock import patch

from PIL import Image
import yaml

from assets import AssetLibrary, manifest_stack
from render_town import normalize_mask


class AssetAdapterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.manifest = self.root / "manifest.yaml"

    def tearDown(self):
        self.temp.cleanup()

    def write(self, rows, path=None):
        path = path or self.manifest
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(yaml.safe_dump(rows))

    def png(self, name, color=(50, 100, 150, 255)):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        image = Image.new("RGBA", (64, 32))
        image.paste(color, (4, 4, 60, 28))
        image.save(path)
        return image

    def tile(self, kind, variant, era="song_dali", footprint=(1, 1), mask=None):
        asset_id = f"tex_town_{era}_{kind}__{variant}"
        self.png(asset_id + ".png")
        return dict(id=asset_id, file=asset_id + ".png", status="candidate",
                    anchor_px=[32, 16], tile=dict(kind=kind, variant=variant,
                    footprint=list(footprint), autotile_mask=mask))

    def test_variants_shared_material_and_real_ids(self):
        rows = [self.tile("grass", f"v0{i}") for i in range(1, 5)]
        self.write(rows)
        lib = AssetLibrary(self.manifest)
        seen = {lib.resolve("tex_town_song_southern_grass", variant_index=i)[1]["id"]
                for i in range(4)}
        self.assertEqual(seen, {row["id"] for row in rows})
        self.assertEqual(lib.used_ids, seen)
        self.assertEqual(len(lib.substitutions), 4)
        self.assertIsNone(lib.resolve("tex_town_song_southern_unknown"))
        self.assertFalse(lib.warnings)

    def test_overlay_manifest_wins_before_baseline(self):
        overlay = self.root / "overlay/manifest.yaml"
        baseline = self.root / "baseline/manifest.yaml"
        for folder, color in ((overlay.parent, (180, 20, 20, 255)),
                              (baseline.parent, (20, 20, 180, 255))):
            folder.mkdir(parents=True)
            image = Image.new("RGBA", (64, 32), color)
            image.save(folder / "tile.png")
            (folder / "manifest.yaml").write_text(yaml.safe_dump([
                {"id": "tex_town_ming_north_wall", "file": "tile.png",
                 "status": "candidate", "tile": {"kind": "wall",
                 "footprint": [1, 1], "variant": "r000"}}]))
        lib = AssetLibrary([overlay, baseline], era_kit="ming_north")
        image, meta = lib.resolve("tex_town_ming_north_wall", rotation_deg=0)
        self.assertEqual(image.getpixel((32, 16)), (180, 20, 20, 255))
        self.assertEqual(meta["_base"], overlay.parent)

    def test_new_kit_missing_ground_falls_back_and_is_auditable(self):
        self.png("earth.png")
        self.write([{"id": "tex_town_song_dali_rammed_earth",
                     "file": "earth.png", "status": "candidate",
                     "anchor_px": [32, 16], "tile": {"kind": "rammed_earth",
                     "footprint": [1, 1], "variant": "v01"}}])
        found = AssetLibrary(self.manifest, era_kit="ming_north").resolve(
            "tex_town_ming_north_rammed_earth")
        self.assertIsNotNone(found)
        self.assertIn(
            "era-kit-fallback:tex_town_ming_north_rammed_earth->"
            "tex_town_song_dali_rammed_earth", found[1]["adaptations"]
        )
        self.assertEqual(len(found[1]["adaptations"]), 1)

    def test_rotated_fallback_reports_only_the_asset_actually_used(self):
        rows = [self.tile("bridge_deck", "w3_l5_r000_v01",
                          footprint=(3, 5)),
                self.tile("bridge_deck", "w5_l10_r090_v01",
                          era="song_southern", footprint=(5, 10))]
        self.write(rows)
        found = AssetLibrary(self.manifest, era_kit="qing_south").resolve(
            "tex_town_qing_south_bridge_deck", rotation_deg=90)
        self.assertIsNotNone(found)
        self.assertEqual(found[1]["id"], rows[1]["id"])
        self.assertEqual(found[1]["adaptations"], [
            "era-kit-fallback:tex_town_qing_south_bridge_deck->"
            "tex_town_song_southern_bridge_deck",
        ])

    def test_manifest_stack_uses_overlay_only_when_not_explicit(self):
        explicit = self.root / "fixture.yaml"
        self.assertEqual(manifest_stack("tile", "ming_north", explicit), [explicit])
        paths = manifest_stack("tile", "ming_north")
        self.assertEqual(paths[-1].name, "manifest.yaml")
        self.assertIn("baseline/tile", paths[-1].as_posix())
        self.assertIn("tile/ming_north", paths[0].as_posix())

    def test_building_list_views_require_exact_rotation_and_meta_file_base(self):
        original = self.png("house.png")
        self.write(dict(building=dict(footprint=[6, 5], anchor=[32, 16]),
                        views=[dict(rotation_deg=0, file="house.png")]), self.root / "meta/house.yaml")
        self.write([dict(id="bld_kit_song_dali_house", file="house.png", metadata="meta/house.yaml")])
        lib = AssetLibrary(self.manifest)
        image, meta = lib.resolve("bld_kit_song_dali_house", rotation_deg=0)
        self.assertEqual(image.tobytes(), original.tobytes())
        self.assertEqual(meta["rotation_deg"], 0)
        self.assertEqual(meta["requested_rotation_deg"], 0)
        self.assertEqual(meta["footprint_width_px"], 352)
        self.assertEqual(meta["anchor_px"], [32, 16])
        self.assertEqual(meta["adaptations"], [])
        for rotation in (90, 180, 270):
            self.assertIsNone(lib.resolve("bld_kit_song_dali_house", rotation_deg=rotation))
            self.assertIn(f"bld_kit_song_dali_house/rotation_deg={rotation}", lib.missing)
        self.assertFalse(lib.substitutions)
        self.assertIsNone(lib.resolve("bld_kit_song_dali_missing", rotation_deg=90))

    def test_sparse_checkout_reads_tracked_metadata_and_png_blobs(self):
        metadata = yaml.safe_dump(dict(
            building=dict(footprint=[6, 5], anchor=[32, 16]),
            views=[dict(rotation_deg=0, file="house.png")],
        )).encode()
        output = BytesIO()
        Image.new("RGBA", (64, 32), (1, 2, 3, 255)).save(output, format="PNG")
        blobs = {"house.yaml": metadata, "house.png": output.getvalue()}
        self.write([dict(id="house", file="house.png", status="candidate",
                         metadata="meta/house.yaml")])

        def tracked(path):
            return blobs.get(path.name)

        with patch("assets._git_blob", side_effect=tracked):
            lib = AssetLibrary(self.manifest)
            image, meta = lib.resolve("house", rotation_deg=0)
        self.assertEqual(image.size, (64, 32))
        self.assertEqual(meta["footprint_cells"], {"w": 6, "h": 5})
        self.assertFalse(lib.warnings)

    def test_props_submanifest_does_not_duplicate_shared_metadata_variants(self):
        self.write([])
        rows = []
        for index in (1, 2):
            name = f"prp_song_dali_camellia__v0{index}"
            self.png(f"props/{name}.png")
            rows.append(dict(id=name, asset_id="prp_song_dali_camellia", variant_key=f"v0{index}",
                             file=name + ".png", metadata="meta/camellia.yaml"))
        self.write(dict(placement_domain="land", collision="none", footprint_cells=dict(w=1, h=1),
                        variants=[dict(key=f"v0{i}", file=rows[i - 1]["file"]) for i in (1, 2)]),
                   self.root / "props/meta/camellia.yaml")
        self.write(rows, self.root / "props/manifest.yaml")
        lib = AssetLibrary(self.manifest)
        ids = [lib.resolve("prp_song_dali_camellia", variant_index=i)[1]["source_ids"][0]
               for i in range(2)]
        self.assertEqual(ids, [row["id"] for row in rows])
        self.assertFalse(lib.warnings)

    def test_strict_building_view_missing_or_footprint_mismatch_fails(self):
        from check_town import validate_assets
        self.png("house.png")
        rows = [dict(id="bld_kit_song_dali_house", file="house.png",
                     status="candidate", anchor_px=[32, 16],
                     building=dict(footprint=[6, 5]),
                     views=[dict(rotation_deg=0, file="house.png")])]
        spec = dict(grid=dict(width=1, height=1), era_kit="song_dali",
                    gates=[], bridges=[], vegetation=dict(palette=[]),
                    wall=dict(polygon=dict(points=[])))
        building = dict(id="bi_0052", type=rows[0]["id"], rotation_deg=270,
                        size=dict(w=5, h=6))
        layout = dict(buildings=[building], ground_cells=[], roads={}, water_cells=[])
        self.write(rows)
        def problems(strict):
            return validate_assets(spec, layout, strict=strict,
                                   building_manifest=self.manifest, tile_manifest=self.manifest)
        for strict, severity in ((False, "warning"), (True, "error")):
            found = [i for i in problems(strict) if i["path"] == "assets.buildings"]
            self.assertEqual([(i["code"], i["severity"]) for i in found],
                             [("TOWN_ASSET_MISSING", severity)])
        rows[0]["views"].append(dict(rotation_deg=270, file="house.png"))
        self.write(rows)
        self.assertIn("TOWN_BUILDING_VIEW_FOOTPRINT", {i["code"] for i in problems(True)})
        rows[0]["views"][-1]["footprint_cells"] = dict(w=5, h=6)
        self.write(rows)
        self.assertFalse([i for i in problems(True) if i["path"] == "assets.buildings"])

    def test_gate_bridge_and_wall_keep_native_geometry(self):
        self.write([self.tile("city_gate", "k6_r000_v01", footprint=(10, 4)),
                    self.tile("bridge_deck", "w3_l5_r000_v01", footprint=(3, 5)),
                    self.tile("wall", "earth_r000_v01")])
        lib = AssetLibrary(self.manifest)
        _, gate = lib.resolve("tex_town_song_dali_city_gate", width_cells=4, rotation_deg=0)
        self.assertEqual(gate["width_cells"], 6)
        self.assertEqual(gate["footprint_cells"], dict(w=10, h=4))
        self.assertTrue(gate["adaptations"])
        self.assertIsNone(lib.resolve("tex_town_song_dali_city_gate", width_cells=4, rotation_deg=90))
        _, bridge = lib.resolve("tex_town_song_southern_bridge_deck", rotation_deg=0)
        self.assertEqual(bridge["length_cells"], 5)
        self.assertEqual(bridge["source_ids"], ["tex_town_song_dali_bridge_deck__w3_l5_r000_v01"])
        self.assertTrue(lib.resolve("tex_town_song_dali_wall", rotation_deg=90)[1]["adaptations"])

    def test_baseline_gate_missing_view_uses_other_baseline_kit(self):
        rows = [self.tile("city_gate", "k6_r000_v01", footprint=(10, 4)),
                self.tile("city_gate", "k5_r090_v01", era="song_southern",
                          footprint=(9, 4))]
        self.write(rows)
        found = AssetLibrary(self.manifest, era_kit="song_dali").resolve(
            "tex_town_song_dali_city_gate", rotation_deg=90, width_cells=3)
        self.assertIsNotNone(found)
        self.assertEqual(found[1]["requested_rotation_deg"], 90)
        self.assertEqual(found[1]["width_cells"], 5)
        self.assertEqual(found[1]["adaptations"], [
            "shared-gate-view:tex_town_song_dali_city_gate->"
            "tex_town_song_southern_city_gate",
            "gate-width:requested=3,source=5",
        ])

    def test_uncalibrated_kit_bridge_falls_back_to_calibrated_baseline(self):
        rows = [self.tile("bridge_deck", "w4_l6_r090_v01", era="qing_north",
                          footprint=(4, 6)),
                self.tile("bridge_deck", "w5_l10_r090_v01", era="song_southern",
                          footprint=(5, 10))]
        rows[0]["sha256"] = "uncalibrated"
        rows[1]["sha256"] = "approved-sha"
        self.write(rows)
        lib = AssetLibrary(self.manifest, era_kit="qing_north")
        found = lib.calibrated_bridge(
            "tex_town_qing_north_bridge_deck", 90, "approved-sha")
        self.assertIsNotNone(found)
        self.assertEqual(found[1]["sha256"], "approved-sha")
        self.assertEqual(found[1]["adaptations"], [
            "uncalibrated-bridge-fallback:tex_town_qing_north_bridge_deck->"
            "tex_town_song_southern_bridge_deck",
        ])
        self.assertEqual(lib.used_ids, {rows[1]["id"]})
        self.assertEqual(lib.substitutions, {(
            "tex_town_qing_north_bridge_deck", rows[1]["id"],
            found[1]["adaptations"][0],
        )})

    def test_all_47_masks_compose_but_missing_edge_is_not_invented(self):
        masks = dict(n=124, e=241, s=199, w=31, ne=112, se=193, sw=7, nw=28)
        rows = [self.tile("riverbank", name, mask=mask) for name, mask in masks.items()]
        self.write(rows)
        lib = AssetLibrary(self.manifest)
        for mask in sorted({normalize_mask(i) for i in range(256)}):
            with self.subTest(mask=mask):
                image, meta = lib.resolve("tex_town_song_dali_riverbank", mask=mask)
                self.assertEqual(image.size, (64, 32))
                self.assertEqual(meta["mask"], mask)
                self.assertEqual(bool(image.getbbox()), mask & 85 != 85)
        # A missing diagonal alone has no exposed cardinal bank. Its neighboring
        # tiles provide the concave join, without a clipped V inside the water.
        self.assertFalse(lib.resolve("tex_town_song_dali_riverbank", mask=253)[0].getbbox())
        self.assertFalse(lib.missing)
        self.assertIsNone(lib.resolve("tex_town_song_dali_riverbank", mask=999))
        self.write(rows[:-1])
        self.assertIsNone(AssetLibrary(self.manifest).resolve("tex_town_song_dali_riverbank", mask=0))


if __name__ == "__main__":
    unittest.main()
