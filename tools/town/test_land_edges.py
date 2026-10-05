"""Legacy land-mask API and current two-sided shoreline regressions."""
import unittest

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from edge_assembly import NEIGHBORS, land_bank_masks, shore_bank_masks
from render_town import Painter, _polygon


class LandBankTests(unittest.TestCase):
    def test_straight_waterway_banks_face_water_from_dry_neighbors(self):
        water = {(2, z) for z in range(5)}
        land = {(x, z) for x in range(5) for z in range(5)} - water
        masks = land_bank_masks(water, land)
        self.assertEqual(set(masks), {(x, z) for x in (1, 3) for z in range(5)})
        self.assertEqual(masks[1, 2], 241)  # east side of western bank
        self.assertEqual(masks[3, 2], 31)   # west side of eastern bank
        self.assertFalse(set(masks) & water)

    def test_diagonal_contact_has_no_short_corner_spur(self):
        self.assertEqual(land_bank_masks({(1, 1)}, {(0, 0)}), {})

    def test_map_boundary_is_not_mistaken_for_a_water_bank(self):
        self.assertEqual(land_bank_masks(set(), {(0, 0)}), {})
        self.assertEqual(land_bank_masks({(0, 1)}, {(0, 0)}), {(0, 0): 124})

    def test_concave_water_corner_uses_two_land_sides_and_preserves_inputs(self):
        water = {(1, 0), (0, 1), (1, 1)}
        land = {(0, 0), (0, -1), (-1, 0)}
        before = water.copy(), land.copy()
        self.assertEqual(land_bank_masks(water, land)[0, 0], 112)
        self.assertEqual((water, land), before)

    def test_concave_clipped_lake_has_paired_banks_and_no_exterior_bank(self):
        domain = {(x, z) for x in range(12) for z in range(12)}
        water = {(x, z) for x in range(8) for z in range(1, 10)
                 if 2 <= x+z <= 13 and not (x >= 4 and z >= 5)}
        masks = shore_bank_masks(water, domain)
        paired_sides = 0
        for x, z in water:
            for index in (0, 2, 4, 6):
                dx, dz = NEIGHBORS[index]
                neighbor = x+dx, z+dz
                if neighbor in domain - water:
                    self.assertFalse(masks[x, z] & (1 << index))
                    self.assertFalse(masks[neighbor] & (1 << ((index+4) % 8)))
                    paired_sides += 1
                elif neighbor not in domain:
                    self.assertTrue(masks.get((x, z), 255) & (1 << index))
        self.assertEqual(paired_sides, 26)
        self.assertNotIn((2, 3), masks)

    def test_boundary_pieces_never_color_deep_water_at_both_output_scales(self):
        class Library:
            def resolve(self, asset_id, **kwargs):
                edge = "riverbank" in asset_id or "road_edge" in asset_id
                color = "red" if edge else "blue" if asset_id.endswith("water") else "brown"
                # Deliberately oversized opaque corners expose absent clipping.
                sprite = Image.new("RGBA", (64, 32), color)
                if not edge:
                    sprite = Image.new("RGBA", (64, 32))
                    ImageDraw.Draw(sprite).polygon([(0, 16), (32, 32), (64, 16), (32, 0)], fill=color)
                return sprite, dict(id=asset_id, anchor_px=[32, 16], tile_px=[64, 32])

        water = {(x, z) for x in range(1, 7) for z in range(1, 7)}
        ground = [dict(at=dict(x=x, z=z), ground="water" if (x, z) in water else "grass")
                  for z in range(8) for x in range(8)]
        layout = dict(grid=dict(width=8, height=8), ground_cells=ground,
                      water_cells=[dict(x=x, z=z) for x, z in water],
                      roads=dict(street=[dict(x=2, z=z) for z in range(6)]))
        for scale in (1, .25):
            with self.subTest(scale=scale):
                painter = Painter(layout, dict(era_kit="song_dali"), Library(), Library(), scale)
                painter.terrain()
                water_mask = Image.new("L", painter.canvas.size)
                # The author now requires banks in boundary water cells, too.
                # An oversized bad edge sprite must still never escape that
                # boundary cell into the neighbouring deep-water cells.
                for x, z in {(x, z) for x in range(3, 5) for z in range(3, 5)}:
                    ImageDraw.Draw(water_mask).polygon(_polygon(x, z, 8, scale), fill=255)
                water_mask = water_mask.filter(ImageFilter.MinFilter(3))
                red = np.all(np.asarray(painter.canvas)[:, :, :3] == (255, 0, 0), axis=2)
                self.assertFalse(np.any(red & (np.asarray(water_mask) > 0)))
                self.assertTrue(np.any(red))

    def test_single_edge_is_clipped_to_its_land_diamond(self):
        class Library:
            def resolve(self, *args, **kwargs):
                return Image.new("RGBA", (64, 32), "red"), dict(anchor_px=[32, 16])

        layout = dict(grid=dict(width=8, height=8),
                      ground_cells=[[0, 64, dict(ground="grass", elevation_m=0)]])
        painter = Painter(layout, dict(era_kit="song_dali"), Library(), Library(), 1)
        painter.canvas.paste((0, 0, 0, 0), (0, 0, *painter.canvas.size))
        painter.edge(3, 3, "riverbank", 124)
        diamond = Image.new("L", painter.canvas.size)
        ImageDraw.Draw(diamond).polygon(_polygon(3, 3, 8, 1), fill=255)
        self.assertFalse(np.any((np.asarray(painter.canvas)[:, :, 3] > 0)
                                & (np.asarray(diamond) == 0)))


if __name__ == "__main__":
    unittest.main()
