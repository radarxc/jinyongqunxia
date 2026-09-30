"""Regressions for boundary-only wall faces and unchanged source imagery."""
import unittest
from types import SimpleNamespace

from PIL import Image
from seam_assembly import WallAssembly, visible_faces
from render_town import project


class SeamAssemblyTests(unittest.TestCase):
    def assembly(self, cells):
        source = Image.new("RGBA", (80, 180), "#9a8867")
        before = source.tobytes()
        library = SimpleNamespace(resolve=lambda *args, **kwargs: (source, {}))
        painter = SimpleNamespace(tiles=library, era="song_dali", height=20,
                                  scale=1, canvas=Image.new("RGBA", (800, 800)))
        assembly = WallAssembly(painter, cells, set())
        self.assertEqual(before, source.tobytes())
        return assembly

    def test_internal_ends_and_inner_corner_are_not_exposed(self):
        cells = {(0, 0), (1, 0), (1, 1)}
        self.assertEqual(visible_faces(0, 0, cells), ("south",))
        self.assertEqual(visible_faces(1, 1, cells), ("east",))

    def test_top_and_south_face_join_without_alpha_gap(self):
        assembly = self.assembly({(5, 5), (6, 5)})
        for point in ((5, 5), (6, 5)):
            self.assertTrue(assembly.draw_cell(*point))
        # Shared edge lies at ground project(6,5), and retains a solid top.
        alpha = assembly.painter.canvas.getchannel("A")
        self.assertEqual(alpha.getpixel((352, round(336-assembly.rise))), 255)

    def test_cube_end_is_transparent_at_internal_join(self):
        assembly = self.assembly({(0, 0), (1, 0)})
        self.assertEqual(assembly.sprite(0, 0).getpixel((48, 70))[3], 0)
        self.assertEqual(assembly.sprite(1, 0).getpixel((48, 70))[3], 255)

    def test_gate_footprint_culls_attached_wall_end(self):
        assembly = self.assembly({(0, 0)})
        assembly.occupied.add((1, 0))
        self.assertEqual(assembly.sprite(0, 0).getpixel((48, 70))[3], 0)

    def test_wall_join_does_not_change_planning_occupancy(self):
        cells = {(0, 0), (1, 0), (1, 1)}
        expected = set(cells)
        assembly = self.assembly(cells)
        for point in cells:
            sprite = assembly.sprite(*point)
            self.assertEqual(sprite.size[0], 65)
        self.assertEqual(cells, expected)

    def test_closed_east_boundary_never_samples_black_atlas_fill(self):
        assembly = self.assembly({(0, z) for z in range(12)})
        for z in range(12):
            sprite = assembly.sprite(0, z)
            for y in range(40, 110):
                self.assertEqual(sprite.getpixel((64, y)), (154, 136, 103, 255))
                self.assertEqual(sprite.getpixel((63, y)), (154, 136, 103, 255))

    def test_continuous_top_and_face_at_preview_scales(self):
        for scale in (.25, .5, 1):
            assembly = self.assembly({(5, 5), (6, 5)})
            assembly.painter.scale = scale
            for point in ((5, 5), (6, 5)):
                assembly.draw_cell(*point)
            # The shared upper edge may be antialiased, never transparent;
            # the continuous front face below it remains fully opaque.
            for elevation, minimum_alpha in ((3, 240), (2, 255)):
                at = project(6, 5.5, 20, scale, elevation)
                alpha = assembly.painter.canvas.getpixel(tuple(round(v) for v in at))[3]
                self.assertGreaterEqual(alpha, minimum_alpha)
