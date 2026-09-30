"""Bridge unions must preserve planning geometry and native surface texture."""
from copy import deepcopy
from pathlib import Path
import unittest
from unittest.mock import patch

from PIL import Image, ImageDraw
import yaml

from bridge_assembly import DECK_POINTS, assemble_bridges, bounds, bridge_groups, fit_sprite
from assets import AssetLibrary, DEFAULT_TILES


class BridgeAssemblyTests(unittest.TestCase):
    def test_northern_crossings_share_only_outer_rails(self):
        source = Path(__file__).parents[2] / "docs/design/town/city_hangzhou__ch02.yaml"
        spec = yaml.safe_load(source.read_text())
        bridges = [b for b in spec["bridges"] if b["id"] in ("bridge_north", "bridge_gate_north")]
        original = deepcopy(bridges)
        groups = bridge_groups(bridges)
        self.assertEqual(len(groups), 1)
        self.assertEqual(bounds(groups[0][1]), (98, 138, 106, 145))
        self.assertEqual(len(groups[0][1]), 56)  # 32 + 48 - 24 overlap.
        canvas = Image.new("RGBA", (600, 500))
        library = AssetLibrary(DEFAULT_TILES)
        project = lambda x, z: (32*(x+z-236), 16*(x-z+47))
        with patch("bridge_assembly.fit_sprite", wraps=fit_sprite) as draw:
            assemble_bridges(canvas, dict(spec, bridges=bridges), library, project, 1)
        self.assertEqual(draw.call_count, 3)  # One union deck, two exterior rails.
        self.assertFalse(library.missing)
        self.assertEqual(bridges, original)
        self.assertEqual([call.args[3][:2] for call in draw.call_args_list[1:]],
                         [(project(98, 145), project(106, 145)),
                          (project(98, 138), project(106, 138))])

    def test_nonrectangular_union_never_fills_water(self):
        base = dict(length_cells=4, width_cells=4, rotation_deg=90, river_ref="canal")
        bridges = [dict(base, at=dict(x=5, z=5)), dict(base, at=dict(x=7, z=7))]
        self.assertEqual(len(bridge_groups(bridges)), 2)
        separated = [dict(base, at=dict(x=5, z=5)), dict(base, at=dict(x=10, z=5))]
        self.assertEqual(len(bridge_groups(separated)), 2)

    def test_deck_axes_fit_without_exposed_solid_filler(self):
        sprite = Image.new("RGBA", (60, 40), "#123456")
        ImageDraw.Draw(sprite).rectangle((25, 0, 35, 40), fill="#abcdef")
        canvas = Image.new("RGBA", (160, 120))
        source = ((5, 5), (55, 5), (5, 35))
        quad = [(20, 50), (100, 90), (140, 70), (60, 30)]
        fit_sprite(canvas, sprite, source, (quad[0], quad[1], quad[3]), quad)
        self.assertEqual(canvas.getpixel((80, 60)), (171, 205, 239, 255))
        self.assertEqual(canvas.getpixel((30, 51)), (18, 52, 86, 255))
        self.assertEqual(canvas.getpixel((20, 30))[3], 0)
        mask = Image.new("L", canvas.size)
        ImageDraw.Draw(mask).polygon([(22, 50), (100, 88), (138, 70), (60, 32)], fill=255)
        self.assertTrue(all(alpha == 255 for alpha, inside in
                            zip(canvas.getchannel("A").tobytes(), mask.tobytes()) if inside))

    def test_native_decks_cover_the_whole_target_with_texture(self):
        library = AssetLibrary(DEFAULT_TILES)
        quad = [(20, 140), (276, 268), (500, 156), (244, 28)]
        mask = Image.new("L", (520, 300))
        ImageDraw.Draw(mask).polygon([(23, 140), (276, 265), (497, 156), (244, 31)], fill=255)
        for rotation in (0, 90):
            sprite, _ = library.resolve("tex_town_song_southern_bridge_deck", rotation_deg=rotation)
            canvas = Image.new("RGBA", mask.size)
            fit_sprite(canvas, sprite, DECK_POINTS[rotation], (quad[0], quad[1], quad[3]), quad)
            interior = [alpha for alpha, inside in
                        zip(canvas.getchannel("A").tobytes(), mask.tobytes()) if inside]
            self.assertGreaterEqual(min(interior), 245, rotation)  # Bicubic edge antialias.
            self.assertGreater(len(canvas.getcolors(100000)), 100, rotation)

    def test_changed_native_version_requires_recalibration(self):
        library = AssetLibrary(DEFAULT_TILES)
        native_resolve = library.resolve
        def changed(*args, **kwargs):
            sprite, meta = native_resolve(*args, **kwargs)
            return sprite, dict(meta, sha256="changed-version")
        canvas = Image.new("RGBA", (500, 300))
        bridge = dict(at=dict(x=8, z=8), length_cells=8, width_cells=7, rotation_deg=90)
        with patch.object(library, "resolve", side_effect=changed):
            assemble_bridges(canvas, dict(era_kit="song_southern", bridges=[bridge]),
                             library, lambda x, z: (32*(x+z), 16*(16+x-z)), 1)
        self.assertIsNone(canvas.getbbox())
        self.assertIn("tex_town_song_southern_bridge_deck/uncalibrated-bridge-view", library.missing)


if __name__ == "__main__":
    unittest.main()
