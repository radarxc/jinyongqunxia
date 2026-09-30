"""Protect reviewed historical relationships without freezing compressed coordinates."""

import unittest

from common import ROOT, load_yaml, point, polygon_cells, polyline_cells
from plan_view import display_name


def city(filename):
    return load_yaml(ROOT / "docs/design/town" / filename)


def record(spec, group, identifier):
    return next(item for item in spec[group] if item["id"] == identifier)


def ordinate(points, value, axis):
    """Interpolate the other axis at a cross-section of a monotone segment."""
    for a, b in zip(points, points[1:]):
        if a[axis] != b[axis] and min(a[axis], b[axis]) <= value <= max(a[axis], b[axis]):
            t = (value - a[axis]) / (b[axis] - a[axis])
            return a[1-axis] + t * (b[1-axis] - a[1-axis])
    raise AssertionError("历史关系目标不在对应河段范围内")


def zone_vertices(zone):
    geometry = zone["geometry"]
    if "polygon" in geometry:
        return [point(p) for p in geometry["polygon"]["points"]]
    low, high = geometry["rect"]["min"], geometry["rect"]["max"]
    return [(x, z) for x in (low["x"], high["x"])
            for z in (low["z"], high["z"])]


class HistoricalTopologyTests(unittest.TestCase):
    def test_dali_north_gate_then_taoxi_then_temple(self):
        spec = city("city_dali__ch01.yaml")
        stream = record(spec, "rivers", "cangshan_stream")
        self.assertEqual(display_name(stream, "W"), "桃溪")
        line = [point(p) for p in stream["points"]]
        gate = record(spec, "gates", "north_gate")
        self.assertLess(gate["at"]["z"], ordinate(line, gate["at"]["x"], 0))
        religious = {zone["id"] for zone in spec["zones"] if zone["kind"] == "religious"}
        landmarks = [item for item in spec["landmarks"] if item["zone_ref"] in religious]
        self.assertTrue(any("pagoda" in item["type"] for item in landmarks))
        self.assertTrue(any("temple_hall" in item["type"] for item in landmarks))
        for landmark in landmarks:
            with self.subTest(landmark=landmark["id"]):
                origin, size = landmark["origin"], landmark["size"]
                for x in (origin["x"], origin["x"] + size["w"]):
                    self.assertGreater(origin["z"], ordinate(line, x, 0) + stream["width_cells"] / 2)

    def test_linan_imperial_bridge_route_and_waterfront_sides(self):
        spec = city("city_hangzhou__ch02.yaml")
        bridge = record(spec, "bridges", "bridge_zhongan")
        self.assertEqual(display_name(bridge, "B"), "众安桥")
        self.assertEqual(bridge["road_ref"], "imperial_street")
        self.assertEqual(bridge["river_ref"], "qinghu_canal")
        river = record(spec, "rivers", bridge["river_ref"])
        self.assertIn(point(bridge["at"]), polyline_cells(river["points"], river["width_cells"]))
        route = [point(p) for p in record(spec, "streets", bridge["road_ref"])["points"]]
        bx, bz = point(bridge["at"])
        north = [(i, end) for i, (start, end) in enumerate(zip(route, route[1:]))
                 if start[0] == end[0] == bx and start[1] < bz < end[1]]
        self.assertEqual(len(north), 1, "众安桥必须在御街北行途中，不得挂在旁街或折西段")
        index, end = north[0]
        # Crossing is followed by further northward travel before the west turn.
        self.assertGreater(end[1], bz)
        after_bridge = route[index+1:]
        west = [(a, b) for a, b in zip(after_bridge, after_bridge[1:])
                if a[1] == b[1] and b[0] < a[0]]
        self.assertTrue(west, "过众安桥北行后须折西通景灵宫")
        self.assertGreaterEqual(west[0][0][1], end[1])
        palace = record(spec, "landmarks", "lm_jingling_palace")
        self.assertLess(palace["origin"]["x"] + palace["size"]["w"] / 2, bx)
        self.assertGreater(palace["origin"]["z"], bz)
        self.assertLessEqual(palace["origin"]["x"], route[-1][0])
        self.assertLessEqual(route[-1][0], palace["origin"]["x"] + palace["size"]["w"])
        lake = record(spec, "lakes", "west_lake_edge")
        vertices = lake["polygon"]["points"]
        self.assertGreaterEqual(len(vertices), 8)
        self.assertLessEqual(len(vertices), 14)
        water = polygon_cells(vertices, spec["grid"]["width"], spec["grid"]["height"])
        row_width = {z: sum(pz == z for _, pz in water) for z in {pz for _, pz in water}}
        widest = max(row_width.values())
        self.assertLess(row_width[min(row_width)], widest, "南端须收窄")
        self.assertLess(row_width[max(row_width)], widest, "北端须收窄")
        west_wall = min(p["x"] for p in spec["wall"]["polygon"]["points"])
        self.assertLess(max(x for x, _ in water) + 1, west_wall, "东岸与西墙之间须有干陆带")
        canal = [point(p) for p in record(spec, "rivers", "east_canal")["points"]]
        for key, expected in (("zone_waterfront_east", "west"),
                              ("zone_gate_service_north", "east")):
            for x, z in zone_vertices(record(spec, "zones", key)):
                with self.subTest(zone=key, at=(x, z)):
                    canal_x = ordinate(canal, z, 1)
                    if expected == "west":
                        self.assertLess(x, canal_x, "河仓必须在盐桥河西岸")
                    else:
                        self.assertGreater(x, canal_x, "军营必须在盐桥河东岸")


if __name__ == "__main__":
    unittest.main()
