"""Regressions for native gate feet, transparent holes and unchanged sources."""
from copy import deepcopy
from pathlib import Path
from types import SimpleNamespace
import hashlib
import unittest

from PIL import Image, ImageDraw

from assets import AssetLibrary, DEFAULT_TILES
from common import gate_cells
from gate_assembly import GATES, assemble_gate, fit_vertical_strips, ground_targets
from render_town import project


class GateAssemblyTests(unittest.TestCase):
    def gate(self, rotation):
        return {"at": {"x": 16, "z": 16}, "rotation_deg": rotation,
                "footprint_cells": {"w": 8, "h": 4},
                "passage_cells": {"w": 4, "h": 4}}

    def test_all_orientations_match_full_rectangle_and_clear_passage(self):
        for rotation in (0, 90, 180, 270):
            gate = self.gate(rotation)
            original = deepcopy(gate)
            full, passage = gate_cells(gate), gate_cells(gate, True)
            points = ground_targets(full, passage, rotation, lambda x, z: project(x, z, 32))
            spans = [points[i+1][0]-points[i][0] for i in range(4)]
            self.assertEqual(spans, [64, 128, 64, 128] if rotation in (0, 180)
                             else [128, 64, 128, 64])
            self.assertEqual(points[-1][0]-points[0][0], 32*(8+4))
            self.assertEqual(gate, original)

    def test_strip_fit_keeps_posts_vertical_without_opaque_floor(self):
        source = Image.new("RGBA", (81, 81))
        draw = ImageDraw.Draw(source)
        draw.rectangle((5, 20, 14, 50), fill="red")
        draw.rectangle((65, 30, 74, 60), fill="red")
        original = source.tobytes()
        canvas = Image.new("RGBA", (160, 160))
        fit_vertical_strips(canvas, source, ((5, 50), (75, 60)),
                            ((20, 100), (120, 150)), 2)
        for x, y in ((24, 50), (24, 90), (113, 98), (113, 135)):
            self.assertEqual(canvas.getpixel((x, y))[3], 255)
        self.assertEqual(canvas.getpixel((70, 115))[3], 0)
        self.assertEqual(source.tobytes(), original)

    def test_changed_registered_gate_requires_recalibration(self):
        asset_id = next(iter(GATES))
        library = SimpleNamespace(missing=set())
        gate = self.gate(0)
        result = assemble_gate(Image.new("RGBA", (32, 32)),
                               (Image.new("RGBA", (1, 1)), {"id": asset_id, "sha256": "changed"}),
                               gate_cells(gate), gate_cells(gate, True), 0,
                               lambda x, z: (x, z), 1, library)
        self.assertFalse(result)
        self.assertEqual(library.missing, {asset_id + "/uncalibrated-gate-view"})

    @unittest.skipUnless(Path(DEFAULT_TILES).is_file(), "native delivery is optional")
    def test_current_delivered_gates_use_registered_pixel_landmarks(self):
        library = AssetLibrary(DEFAULT_TILES)
        for asset_id, (signature, feet, height) in GATES.items():
            found = library.resolve(asset_id)
            self.assertIsNotNone(found, asset_id)
            sprite, meta = found
            self.assertEqual(meta["sha256"], signature)
            self.assertEqual(hashlib.sha256((DEFAULT_TILES.parent / meta["file"]).read_bytes()).hexdigest(), signature)
            rotation = meta["rotation_deg"]
            gate = self.gate(rotation)
            original = sprite.tobytes()
            canvas = Image.new("RGBA", (2048, 2048))
            self.assertTrue(assemble_gate(canvas, found, gate_cells(gate), gate_cells(gate, True),
                                          rotation, lambda x, z: project(x, z, 32), 1, library))
            self.assertIsNotNone(canvas.getbbox())
            self.assertEqual(sprite.tobytes(), original)
        self.assertFalse(library.missing)


if __name__ == "__main__":
    unittest.main()
