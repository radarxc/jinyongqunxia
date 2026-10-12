import hashlib
import importlib.util
import json
import math
import re
import unittest
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SPEC = importlib.util.spec_from_file_location("make_minimap", ROOT / "tools/town/make_minimap.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)
BASELINE = ROOT / "assets/default/baseline/town"


def load_yaml(path):
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def source(stem):
    layout = load_yaml(BASELINE / f"{stem}.layout.yaml")
    report = json.loads((BASELINE / f"{stem}.preview.render.json").read_text())
    spec = load_yaml(ROOT / layout["source_spec"]["path"])
    return layout, report, spec


def polygon(svg, building_id):
    pattern = rf'<polygon points="([^"]+)"[^>]*(?:/>|>\s*</polygon>)\s*<text[^>]*>{building_id} '
    match = re.search(pattern, svg)
    if not match:
        raise AssertionError(f"missing overlay polygon for {building_id}")
    return [tuple(map(float, pair.split(","))) for pair in match.group(1).split()]


def inside(point, vertices):
    sign = None
    for a, b in zip(vertices, vertices[1:] + vertices[:1]):
        cross = (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0])
        if abs(cross) < 1e-6:
            continue
        current = cross > 0
        if sign is None:
            sign = current
        elif sign != current:
            return False
    return True


class MakeMinimapTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.first = MODULE.build()
        cls.second = MODULE.build()
        cls.metadata = {MODULE.layout_key(stem): json.loads(cls.first[MODULE.layout_key(stem) + ".json"])
                        for stem in MODULE.TOWNS}

    def test_both_towns_are_byte_deterministic_and_match_source_structure(self):
        self.assertEqual(self.first, self.second)
        for name, value in self.first.items():
            committed = ROOT / "assets/default/town-minimap" / name
            self.assertEqual(hashlib.sha256(value).digest(),
                             hashlib.sha256(committed.read_bytes()).digest())
        for stem in MODULE.TOWNS:
            key = MODULE.layout_key(stem)
            layout, report, _ = source(stem)
            payload = self.metadata[key]
            with Image.open(BASELINE / f"{stem}.preview.png") as preview:
                self.assertEqual([preview.width, preview.height], report["size_px"])
            self.assertEqual(payload["image"]["width"], report["size_px"][0])
            self.assertEqual(payload["image"]["height"], report["size_px"][1])
            self.assertEqual(payload["transform"]["scale"], report["scale"])
            self.assertEqual(payload["transform"]["topPaddingPx"],
                             report["top_padding_master_px"] * report["scale"])
            self.assertEqual(payload["transform"]["gridWidth"], layout["grid"]["width"])
            self.assertEqual(payload["transform"]["gridHeight"], layout["grid"]["height"])
            self.assertTrue(payload["markers"], key)
    def test_facility_and_pagoda_markers_are_inside_real_overlay_footprints(self):
        stem = "town_dali__ch01"
        layout, report, _ = source(stem)
        svg = (BASELINE / f"{stem}.overlay.svg").read_text()
        markers = {row.get("buildingId"): row for row in self.metadata[MODULE.layout_key(stem)]["markers"]}
        facility = load_yaml(ROOT / "content/town/facilities" / "city_dali__ch01.yaml")
        drugstore_id = next(row["buildingId"] for row in facility["facilities"]
                            if row["sub"] == "yaopu")
        pagoda_id = next(row["id"] for row in layout["buildings"]
                          if row["type"].endswith("chongshengsi_pagoda"))
        office_id = next(row["id"] for row in layout["buildings"]
                         if "yamen" in row["type"])
        for building_id in (drugstore_id, pagoda_id, office_id):
            vertices = [(x * report["scale"],
                         (y + report["top_padding_master_px"]) * report["scale"])
                        for x, y in polygon(svg, building_id)]
            self.assertTrue(inside(markers[building_id]["px"], vertices), building_id)

    def test_south_matches_each_layout_south_gate_within_thirty_degrees(self):
        for stem in MODULE.TOWNS:
            key = MODULE.layout_key(stem)
            layout, report, spec = source(stem)
            payload = self.metadata[key]
            centre = MODULE.town_pixel(layout["grid"]["width"] / 2,
                                       layout["grid"]["height"] / 2,
                                       layout["grid"]["height"], report["scale"],
                                       report["top_padding_master_px"])
            gate_spec = next(row for row in spec["gates"] if row["side"] == "south")
            gate = next(row for row in payload["markers"] if row["id"] == f"gate_{gate_spec['id']}")
            dx, dy = gate["px"][0] - centre[0], gate["px"][1] - centre[1]
            length = math.hypot(dx, dy)
            dot = dx / length * payload["south"][0] + dy / length * payload["south"][1]
            self.assertLessEqual(math.degrees(math.acos(max(-1, min(1, dot)))), 30, key)

    def test_facility_ids_and_names_are_loaded_from_facility_and_locale_sources(self):
        locale = load_yaml(ROOT / "content/locales/zh-Hans/town-facilities.yaml")
        for stem in MODULE.TOWNS:
            key = MODULE.layout_key(stem)
            facility_path = ROOT / "content/town/facilities" / f"{key}.yaml"
            expected = {}
            if facility_path.exists():
                for row in load_yaml(facility_path)["facilities"]:
                    expected[row["key"]] = MODULE.nested(locale, row["nameKey"])
            actual = {row["id"]: row["name"] for row in self.metadata[key]["markers"]
                      if row["id"] in expected}
            self.assertEqual(actual, expected)
            self.assertNotIn("店铺", actual.values())


if __name__ == "__main__":
    unittest.main()
