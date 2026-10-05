import importlib.util
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("terrain_builder_projection", HERE / "build_terrain.py")
builder = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = builder
SPEC.loader.exec_module(builder)


class ProjectionGoldenTest(unittest.TestCase):
    def test_design_19_vectors(self):
        projection = builder.canvas_projection(builder.load_config())
        expected = {
            (73.0, 18.0): (150.00, 2467.61),
            (135.0, 18.0): (3946.00, 2505.84),
            (73.0, 54.0): (878.33, 286.27),
            (135.0, 54.0): (3261.75, 310.27),
            (105.0, 35.0): (2107.23, 1699.92),
        }
        for point, target in expected.items():
            actual = projection(*point)
            self.assertAlmostEqual(actual[0], target[0], delta=0.02, msg=point)
            self.assertAlmostEqual(actual[1], target[1], delta=0.02, msg=point)

    def test_inverse_round_trip(self):
        projection = builder.canvas_projection(builder.load_config())
        for lon, lat in ((73, 18), (135, 54), (105, 35), (100.19, 25.76), (108.94, 34.26)):
            x, y = projection(lon, lat)
            out_lon, out_lat = builder.inverse_albers(projection, x, y)
            self.assertAlmostEqual(float(out_lon), lon, places=9)
            self.assertAlmostEqual(float(out_lat), lat, places=9)


if __name__ == "__main__":
    unittest.main()
