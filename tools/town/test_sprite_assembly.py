"""Regression tests for whole-span sprites and unchanged planning geometry."""
import unittest
from copy import deepcopy
from unittest.mock import patch

from PIL import Image, ImageDraw

from render_town import Painter, _paste, project, visible_wall_cells


class Library:
    def __init__(self, footprint=(3, 5)):
        self.missing = set()
        self.calls = []
        self.footprint = footprint

    def resolve(self, asset_id, **kwargs):
        self.calls.append((asset_id, kwargs))
        return Image.new("RGBA", (320, 240)), {
            "anchor_px": [160, 150],
            "footprint_width_px": 32 * sum(self.footprint),
        }


class SpriteAssemblyTests(unittest.TestCase):
    def painter(self, spec, library):
        layout = {"grid": {"width": 32, "height": 32},
                  "ground_cells": [[0, 1024, {"ground": "water", "elevation_m": 0}]]}
        return Painter(layout, dict(era_kit="song_dali", **spec), library, library, .25)

    def test_bridge_passes_unchanged_geometry_to_union_assembly(self):
        bridge = {"at": {"x": 16, "z": 16}, "length_cells": 10,
                  "width_cells": 6, "rotation_deg": 0}
        library = Library()
        painter = self.painter({"bridges": [bridge]}, library)
        with patch("bridge_assembly.assemble_bridges") as assemble:
            painter.bridge_details()
        assemble.assert_called_once()
        args = assemble.call_args.args
        self.assertIs(args[0], painter.canvas)
        self.assertEqual(args[1]["bridges"], [bridge])
        self.assertIs(args[2], library)
        self.assertEqual(args[3](16, 16), project(16, 16, 32, .25))
        self.assertEqual(args[4], .25)

    def test_gate_uses_footprint_center_and_width(self):
        gate = {"id": "gate", "at": {"x": 16, "z": 16},
                "width_cells": 4, "rotation_deg": 0,
                "footprint_cells": {"w": 8, "h": 4},
                "passage_cells": {"w": 4, "h": 4}, "asset_type": "gate"}
        painter = self.painter({}, Library((12, 4)))
        with patch("render_town._paste") as paste:
            painter.gate(gate)
        self.assertEqual(paste.call_count, 1)
        self.assertEqual(paste.call_args.args[-1], .25 * 12 / 16)
        self.assertEqual(paste.call_args.args[2], project(17, 17, 32, .25))

    def test_dali_temple_envelope_is_not_solid_wall(self):
        spec = {"city_id": "city_dali", "wall": {"basis": "寺域游戏包络"},
                "gates": [{"side": "north", "at": {"z": 61}}]}
        cells = {(44, 61), (60, 61), (44, 80), (6, 92), (6, 40)}
        self.assertEqual(visible_wall_cells(spec, cells), {(44, 61), (60, 61), (6, 40)})
        self.assertEqual(len(cells), 5)  # Do not mutate collision/planning cells.
        spec["city_id"] = "city_hangzhou"
        self.assertEqual(visible_wall_cells(spec, cells), cells)

    def test_dali_temple_envelope_never_marks_finished_png(self):
        spec = {"city_id": "city_dali", "wall": {"basis": "寺域游戏包络", "polygon": {
                    "points": [{"x": x, "z": z} for x, z in [(4, 4), (28, 4), (28, 28), (4, 28)]]}},
                "gates": [{"id": "north", "side": "north", "at": {"x": 16, "z": 16},
                           "rotation_deg": 0, "footprint_cells": {"w": 1, "h": 1}}]}
        for scale in (1, .25):
            with self.subTest(scale=scale):
                library = Library()
                layout = {"grid": {"width": 32, "height": 32},
                          "ground_cells": [[0, 1024, {"ground": "rammed_earth", "elevation_m": 0}]]}
                painter = Painter(layout, dict(era_kit="song_dali", **spec), library, library, scale)
                original = deepcopy((painter.spec, painter.layout))
                before = painter.canvas.tobytes()
                # Suppress actual sprites so only unintended planning marks can change pixels.
                with patch("seam_assembly.WallAssembly") as walls, patch.object(painter, "gate"):
                    walls.return_value.draw_cell.return_value = True
                    painter.objects()
                self.assertEqual(painter.canvas.tobytes(), before)
                drawn = {call.args for call in walls.return_value.draw_cell.call_args_list}
                self.assertTrue(drawn)
                self.assertTrue(all(z <= 16 for _, z in drawn))
                self.assertEqual((painter.spec, painter.layout), original)

    def test_northern_tower_gets_headroom_without_moving_layout(self):
        library = Library()
        sprite = Image.new("RGBA", (20, 200))
        ImageDraw.Draw(sprite).rectangle((4, 2, 16, 190), fill="red")
        library.resolve = lambda *a, **k: (sprite, {"anchor_px": [10, 190], "footprint_width_px": 64})
        tower = {"type": "tower", "origin": {"x": 0, "z": 31}, "size": {"w": 1, "h": 1}}
        layout = {"grid": {"width": 32, "height": 32}, "buildings": [tower],
                  "ground_cells": [[0, 1024, {"ground": "water", "elevation_m": 0}]]}
        painter = Painter(layout, {"era_kit": "song_dali"}, library, library, 1)
        painter.building(tower)
        # Topmost non-background pixel has the requested 32 master pixels of air.
        self.assertEqual(painter.top_padding, 204)
        self.assertEqual(painter.canvas.getpixel((1024, 32))[:3], (255, 0, 0))
        self.assertEqual(tower["origin"], {"x": 0, "z": 31})

    def test_transparent_ground_edge_does_not_expose_paper(self):
        library = Library()
        sprite = Image.new("RGBA", (64, 32))
        ImageDraw.Draw(sprite).polygon([(32, 2), (60, 16), (32, 29), (3, 16)], fill="#786048")
        library.resolve = lambda *a, **k: (sprite, {"id": "earth", "anchor_px": [32, 16], "tile_px": [64, 32]})
        painter = self.painter({}, library)
        painter.flat(8, 8, "rammed_earth")
        x, y = project(8.5, 8.5, 32, .25)
        self.assertEqual(painter.canvas.getpixel((round(x), round(y)))[:3], (120, 96, 72))
        self.assertEqual(painter.canvas.getpixel((round(x)-8, round(y)))[:3], (120, 96, 72))

    def test_bridge_deck_cannot_spill_over_logical_footprint(self):
        canvas = Image.new("RGBA", (80, 80), "blue")
        sprite = Image.new("RGBA", (80, 80), "red")
        polygon = [(40, 20), (60, 40), (40, 60), (20, 40)]
        _paste(canvas, sprite, (40, 40), (40, 40), 1, clip_polygon=polygon)
        self.assertEqual(canvas.getpixel((40, 40)), (255, 0, 0, 255))
        self.assertEqual(canvas.getpixel((61, 40)), (0, 0, 255, 255))
        self.assertEqual(sprite.getpixel((61, 40)), (255, 0, 0, 255))


if __name__ == "__main__":
    unittest.main()
