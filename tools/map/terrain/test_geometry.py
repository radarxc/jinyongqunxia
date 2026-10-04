import json
import importlib.util
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
LAYERS = HERE / "layers"
SPEC = importlib.util.spec_from_file_location("terrain_builder_geometry", HERE / "build_terrain.py")
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


def orientation(a, b, c):
    value = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])
    return 0 if abs(value) < 1e-9 else (1 if value > 0 else -1)


def on_segment(a, b, c):
    return min(a[0], c[0]) <= b[0] <= max(a[0], c[0]) and min(a[1], c[1]) <= b[1] <= max(a[1], c[1])


def intersects(a, b, c, d):
    o1, o2, o3, o4 = orientation(a, b, c), orientation(a, b, d), orientation(c, d, a), orientation(c, d, b)
    if o1 != o2 and o3 != o4:
        return True
    return ((o1 == 0 and on_segment(a, c, b)) or (o2 == 0 and on_segment(a, d, b))
            or (o3 == 0 and on_segment(c, a, d)) or (o4 == 0 and on_segment(c, b, d)))


def self_intersects(ring):
    segments = list(zip(ring, ring[1:]))
    for i, (a, b) in enumerate(segments):
        if a == b:
            return True
        for j in range(i + 1, len(segments)):
            if abs(i - j) <= 1 or (i == 0 and j == len(segments) - 1):
                continue
            c, d = segments[j]
            if a in (c, d) or b in (c, d):
                return True
            if intersects(a, b, c, d):
                return True
    return False


def line_self_intersects(line):
    segments = list(zip(line, line[1:]))
    for i, (a, b) in enumerate(segments):
        if a == b:
            return True
        for j in range(i + 2, len(segments)):
            c, d = segments[j]
            if a in (c, d) or b in (c, d) or intersects(a, b, c, d):
                return True
    return False


class GeometryTest(unittest.TestCase):
    def test_geometry_closure_and_no_self_intersection(self):
        for path in sorted(LAYERS.glob("*.json")):
            document = json.loads(path.read_text(encoding="utf-8"))
            for feature in document.get("features", []):
                geometry = feature["geometry"]
                rings = geometry["coordinates"] if geometry["type"] == "Polygon" else [geometry["coordinates"]]
                check_line = (path.name == "ridges.json")
                orthogonal_polygon = path.name in {"hills.json", "plateaus.json", "basins_plains.json"}
                for ring in rings:
                    if geometry["type"] == "Polygon":
                        self.assertGreaterEqual(len(ring), 4, feature["id"])
                        self.assertEqual(ring[0], ring[-1], feature["id"])
                        self.assertFalse(builder.ring_self_intersects(ring, orthogonal=orthogonal_polygon), feature["id"])
                    else:
                        self.assertGreaterEqual(len(ring), 2, feature["id"])
                        if check_line:
                            self.assertNotEqual(ring[0], ring[-1], feature["id"])
                            self.assertFalse(builder.line_self_intersects(ring), feature["id"])

    def test_canvas_precision_and_bounds(self):
        for path in sorted(LAYERS.glob("*.json")):
            document = json.loads(path.read_text(encoding="utf-8"))
            for feature in document.get("features", []):
                coordinates = feature["geometry"]["coordinates"]
                rings = coordinates if feature["geometry"]["type"] == "Polygon" else [coordinates]
                for ring in rings:
                    for x, y in ring:
                        self.assertEqual(round(x, 2), x)
                        self.assertEqual(round(y, 2), y)
                        self.assertTrue(-1000 <= x <= 5100 and -1000 <= y <= 4100, (feature["id"], x, y))


if __name__ == "__main__":
    unittest.main()
