"""Inferred secondary-town and site generator regressions."""

from __future__ import annotations

import argparse
from copy import deepcopy
from pathlib import Path
import tempfile
import unittest

from common import canonical_bytes, load_yaml
from gen_layout import generate_layout
from make_generic_city import (BAND_YEAR, BASIS, chapter_worlds, make_spec, run,
                               source_data, stable_seed)


class GenericCityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = source_data()
        cls.worlds = chapter_worlds()
        cls.cities = {city["id"]: city for city in cls.data["cities"]}

    def spec(self, city_id, band):
        city = self.cities[city_id]
        chapter = next(ch for ch, era in city["eras"].items()
                       if era.get("open") and self.data["chapters"][ch]["band"] == band)
        return make_spec(city, band, chapter, self.data["chapters"], self.worlds)

    def assert_generates(self, spec):
        layout, stats = generate_layout(spec)
        self.assertTrue(stats["complete"])
        self.assertEqual(layout["validation"]["errors"], 0)
        return layout

    def test_secondary_is_96_square_walled_and_deterministic(self):
        first = self.spec("city_ankang", "northern_song")
        second = self.spec("city_ankang", "northern_song")
        self.assertEqual(canonical_bytes(first), canonical_bytes(second))
        self.assertEqual(first["grid"]["width"], 96)
        self.assertEqual(len(first["gates"]), 2)
        self.assertEqual(first["seed"], stable_seed(first["city_id"],
                                                       "northern_song"))
        self.assertIn(BASIS, first["design_intent"]["notes"])
        self.assert_generates(first)

    def test_every_executable_basis_preserves_author_wording(self):
        spec = self.spec("city_ankang", "northern_song")
        found = []

        def collect(value):
            if isinstance(value, dict):
                for key, child in value.items():
                    if key == "basis":
                        found.append(child)
                    else:
                        collect(child)
            elif isinstance(value, list):
                for child in value:
                    collect(child)

        collect(spec)
        self.assertGreater(len(found), 0)
        self.assertEqual(set(found), {BASIS})
        self.assertIn("依据：src_generic_layout", spec["design_intent"]["notes"])

    def test_site_is_64_square_with_one_division_ruin_wall(self):
        spec = self.spec("city_khotan_kunlun", "qing_middle")
        self.assertEqual(spec["grid"]["width"], 64)
        self.assertEqual(spec["gates"], [])
        self.assertEqual([wall["role"] for wall in spec["walls"]], ["division"])
        self.assertIn("bld_kit_xiyu_temple_hall",
                      {q["type"] for q in spec["building_quotas"]})
        self.assert_generates(spec)

    def test_tubo_uses_regional_buddhist_hall(self):
        spec = self.spec("city_yushu", "northern_song")
        self.assertEqual(spec["era_kit"], "tubo")
        self.assertIn("bld_kit_tubo_temple_hall",
                      {q["type"] for q in spec["building_quotas"]})

    def test_all_supported_businesses_add_one_functional_building(self):
        city = deepcopy(self.cities["city_ankang"])
        city["businesses"] = ["escort_agency", "casino", "manor",
                                "inn", "market", "river_or_sea_port"]
        chapter = next(ch for ch, era in city["eras"].items()
                       if era.get("open")
                       and self.data["chapters"][ch]["band"] == "northern_song")
        spec = make_spec(city, "northern_song", chapter,
                         self.data["chapters"], self.worlds)
        quotas = {q["type"].rsplit("_", 1)[-1]: q
                  for q in spec["building_quotas"]}
        for suffix in ("biaoju", "casino", "manor", "inn", "stall", "wharf"):
            self.assertEqual(quotas[suffix]["count"], {"min": 1, "max": 1})
            self.assertTrue(quotas[suffix]["required"])

    def test_wet_region_has_one_navigable_river_and_bridge(self):
        spec = self.spec("city_taohuadao", "southern_song_jin_mongol")
        self.assertEqual(len(spec["rivers"]), 1)
        self.assertTrue(spec["rivers"][0]["navigable"])
        self.assertEqual(len(spec["bridges"]), 1)
        self.assert_generates(spec)

    def test_unwalled_steppe_uses_main_axis_navigation_root(self):
        spec = self.spec("city_baotou", "qing_early")
        self.assertEqual(spec["walls"], "none")
        self.assertEqual(spec["gates"], [])
        self.assert_generates(spec)

    def test_same_band_files_differ_only_by_chapter_fields(self):
        city = self.cities["city_taohuadao"]
        band = "qing_middle"
        chapters = [ch for ch, era in sorted(city["eras"].items())
                    if era.get("open") and self.data["chapters"][ch]["band"] == band]
        self.assertGreater(len(chapters), 1)
        with tempfile.TemporaryDirectory() as directory:
            args = argparse.Namespace(city=city["id"], band=band,
                importance="secondary,site", primary_chapter=chapters[-1],
                out=Path(directory), check=False)
            code, summary = run(args)
            self.assertEqual((code, summary["specs"]), (0, len(chapters)))
            specs = [load_yaml(Path(directory) / f"{city['id']}__{ch}.yaml")
                     for ch in chapters]
        anchor = deepcopy(specs[0])
        self.assertEqual(anchor["historical_year"], BAND_YEAR[band])
        for spec in specs[1:]:
            spec["chapter_id"] = anchor["chapter_id"]
            spec["book_world"] = anchor["book_world"]
            self.assertEqual(spec, anchor)

    def test_check_mode_writes_nothing(self):
        with tempfile.TemporaryDirectory() as directory:
            args = argparse.Namespace(city="city_taohuadao",
                band="southern_song_jin_mongol", importance="secondary,site",
                primary_chapter=None, out=Path(directory), check=True)
            code, summary = run(args)
            self.assertEqual(code, 0)
            self.assertEqual(summary["invalid"], 0)
            self.assertEqual(list(Path(directory).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
