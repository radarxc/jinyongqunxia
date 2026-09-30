"""Lake/river boundary material and deterministic water-surface regressions."""
import unittest

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from assets import AssetLibrary, DEFAULT_TILES
from edge_assembly import NEIGHBORS, shore_bank_masks, water_fringe_mask
from render_town import Painter, _polygon, project
from water_material import WaterMaterial


def water_edge_statistics(painter):
    """Compare actual RGB steps across every interior cell edge with its interior."""
    rgb = np.asarray(painter.canvas)[:, :, :3].astype(float)
    py, px = np.indices(rgb.shape[:2], dtype=float)
    u, v = (px+.5)/(32*painter.scale), (py+.5)/(16*painter.scale)
    x, z = (u+v-painter.height)/2, (u-v+painter.height)/2
    # Exclude only the exterior raster contour; retain all internal grid edges.
    valid = (x >= .25) & (z >= .25) & (x < painter.width-.25) & (z < painter.height-.25)
    labels = np.stack((np.floor(x), np.floor(z)), axis=-1)
    edges, interiors, segments = [], [], set()
    for a, b in ((np.s_[:, :-1], np.s_[:, 1:]),
                 (np.s_[:-1, :], np.s_[1:, :])):
        usable = valid[a] & valid[b]
        crossing = np.any(labels[a] != labels[b], axis=-1)
        difference = np.max(np.abs(rgb[a]-rgb[b]), axis=-1)
        edges.extend(difference[usable & crossing])
        interiors.extend(difference[usable & ~crossing])
        for axis in (0, 1):
            single_edge = usable & (np.abs(labels[a]-labels[b]).sum(axis=-1) == 1)
            selected = single_edge & (labels[a][..., axis] != labels[b][..., axis])
            starts = np.minimum(labels[a], labels[b])[selected]
            segments.update((int(i), int(j), axis) for i, j in np.unique(starts, axis=0))
    return dict(edge_mean=float(np.mean(edges)), inside_mean=float(np.mean(interiors)),
                edge_p95=float(np.percentile(edges, 95)),
                inside_p95=float(np.percentile(interiors, 95)),
                edge_max=float(np.max(edges)), inside_max=float(np.max(interiors)),
                edge_count=len(edges), edge_segments=len(segments),
                texture_std=float(rgb[valid].std(axis=0).max()))


class WaterRenderTests(unittest.TestCase):
    def test_every_eight_neighbor_boundary_on_both_sides_has_a_mask(self):
        domain = {(x, z) for x in range(7) for z in range(7)}
        water = {(x, z) for x, z in domain if x+z <= 5}
        masks = shore_bank_masks(water, domain)
        expected = {p for p in domain if any(
            (p[0]+dx, p[1]+dz) in domain
            and (((p[0]+dx, p[1]+dz) in water) != (p in water))
            for dx, dz in NEIGHBORS)}
        self.assertEqual(set(masks), expected)
        self.assertTrue(set(masks) & water)
        self.assertTrue(set(masks) - water)
        self.assertEqual(shore_bank_masks(domain, domain), {})
        self.assertEqual(shore_bank_masks({(1, 1)}, {(0, 0), (1, 1)}),
                         {(0, 0): 253, (1, 1): 223})

    def test_native_corner_caps_do_not_draw_full_v_spurs(self):
        library = AssetLibrary(DEFAULT_TILES)
        for mask in (253, 247, 223, 127):
            image, meta = library.resolve("tex_town_song_dali_riverbank", mask=mask)
            alpha = np.asarray(image)[:, :, 3]
            self.assertGreater(np.count_nonzero(alpha), 0)
            self.assertLessEqual(np.count_nonzero(alpha), 16)
            self.assertEqual(len(meta["source_ids"]), 1)
        self.assertFalse(library.missing)

    def test_material_is_reproducible_and_seed_changes_global_texture(self):
        def render(root):
            canvas = Image.new("RGBA", (192, 96))
            material = WaterMaterial(AssetLibrary(DEFAULT_TILES),
                                     "tex_town_song_southern_water", root)
            material.paint(canvas, [(0, 0), (192, 0), (192, 96), (0, 96)], 1)
            return canvas.tobytes()
        self.assertEqual(render(122302), render(122302))
        self.assertNotEqual(render(122302), render(109301))

    def test_fringe_uses_water_without_covering_cell_centres(self):
        for mask in (251, 254, 239, 191, 253):
            alpha = np.asarray(water_fringe_mask(mask))
            self.assertGreater(np.count_nonzero(alpha), 0)
            self.assertEqual(alpha[16, 32], 0)

    def test_brightness_drift_exists_for_flat_sources_without_grid_steps(self):
        class FlatLibrary:
            def resolve(self, asset_id, **kwargs):
                return Image.new("RGBA", (64, 32), (160, 160, 160, 255)), {}

        canvas = Image.new("RGBA", (768, 384))
        material = WaterMaterial(FlatLibrary(), "water", 122302)
        material.paint(canvas, [(0, 0), (768, 0), (768, 384), (0, 384)], 1)
        rgba = np.asarray(canvas).astype(int)
        # Flat source imagery isolates the renderer's explicit brightness field.
        self.assertGreater(np.std(rgba[:, :, 0]), 1)
        self.assertGreaterEqual(rgba[:, :, :3].min(), round(160*.985))
        self.assertLessEqual(rgba[:, :, :3].max(), round(160*1.015))
        self.assertTrue(np.all(rgba[:, :, 3] == 255))
        for axis in (0, 1):
            self.assertLessEqual(np.max(np.abs(np.diff(rgba[:, :, :3], axis=axis))), 1)

    def test_real_water_cell_edges_have_continuous_color_and_nonzero_texture(self):
        layout = dict(grid=dict(width=12, height=12), roads={},
                      ground_cells=[[0, 144, dict(ground="water")]],
                      water_cells=[dict(x=x, z=z) for x in range(12) for z in range(12)])
        for era in ("song_dali", "song_southern"):
            for scale in (1, .25):
                with self.subTest(era=era, scale=scale):
                    painter = Painter(layout, dict(era_kit=era),
                                      AssetLibrary(DEFAULT_TILES), AssetLibrary(DEFAULT_TILES), scale)
                    painter.terrain()
                    stats = water_edge_statistics(painter)
                    self.assertGreater(stats["edge_count"], 100)
                    self.assertEqual(stats["edge_segments"], 2*12*(12-1))
                    self.assertGreater(stats["texture_std"], .4, stats)
                    self.assertLessEqual(stats["edge_mean"], stats["inside_mean"]*1.5+.3, stats)
                    self.assertLessEqual(stats["edge_p95"], stats["inside_p95"]*1.5+1, stats)
                    self.assertLessEqual(stats["edge_max"], stats["inside_max"]+2, stats)

    def test_global_water_field_matches_whole_polygon_when_drawn_cell_by_cell(self):
        for scale in (1, .25):
            with self.subTest(scale=scale):
                material = WaterMaterial(AssetLibrary(DEFAULT_TILES),
                                         "tex_town_song_southern_water", 122302)
                size = round(20*32*scale), round(20*16*scale)
                whole, cells = Image.new("RGBA", size), Image.new("RGBA", size)
                polygon = _polygon(1, 1, 10, scale, 8, 8)
                material.paint(whole, polygon, scale)
                for x in range(1, 9):
                    for z in range(1, 9):
                        material.paint(cells, _polygon(x, z, 10, scale), scale)
                interior = Image.new("L", size)
                ImageDraw.Draw(interior).polygon(polygon, fill=255)
                mask = np.asarray(interior.filter(ImageFilter.MinFilter(3))) == 255
                self.assertTrue(np.array_equal(np.asarray(whole)[mask], np.asarray(cells)[mask]))

    def test_each_side_contains_both_shore_and_water_material(self):
        native = AssetLibrary(DEFAULT_TILES)
        class Library:
            def resolve(self, asset_id, **kwargs):
                if asset_id.endswith("riverbank"):
                    sprite, meta = native.resolve(asset_id, **kwargs)
                    red = Image.new("RGBA", sprite.size, "red")
                    red.putalpha(sprite.getchannel("A"))
                    return red, meta
                color = "blue" if asset_id.endswith("water") else "green"
                sprite = Image.new("RGBA", (64, 32))
                ImageDraw.Draw(sprite).polygon([(0, 16), (32, 32), (64, 16), (32, 0)], fill=color)
                return sprite, dict(id=asset_id, anchor_px=[32, 16], tile_px=[64, 32])
        layout = dict(grid=dict(width=6, height=6), roads={},
                      ground_cells=[[0, 36, dict(ground="grass")]],
                      water_cells=[dict(x=x, z=z) for x in range(3, 6) for z in range(6)])
        painter = Painter(layout, dict(era_kit="song_dali"), Library(), Library(), 1)
        painter.terrain()
        rgb = np.asarray(painter.canvas)[:, :, :3].astype(int)
        for x in (2, 3):
            mask = Image.new("L", painter.canvas.size)
            ImageDraw.Draw(mask).polygon(_polygon(x, 3, 6, 1), fill=255)
            samples = rgb[np.asarray(mask) > 0]
            self.assertTrue(np.any(samples[:, 2] > samples[:, 0] + 40), "water texture missing")
            self.assertTrue(np.any(samples[:, 0] > samples[:, 2] + 40), "bank texture missing")

    def test_real_material_two_sided_render_is_reproducible_and_opaque(self):
        water = {(x, z) for x in range(2, 10) for z in range(2, 10)
                 if 5 <= x+z <= 15}
        layout = dict(grid=dict(width=12, height=12),
                      ground_cells=[[0, 144, dict(ground="grass")]],
                      water_cells=[dict(x=x, z=z) for x, z in sorted(water)], roads={})
        def render(scale):
            painter = Painter(layout, dict(era_kit="song_southern"),
                              AssetLibrary(DEFAULT_TILES), AssetLibrary(DEFAULT_TILES), scale)
            painter.terrain()
            return painter
        for scale in (1, .25):
            a, b = render(scale), render(scale)
            self.assertEqual(a.canvas.tobytes(), b.canvas.tobytes())
            self.assertFalse(a.tiles.missing)
            self.assertEqual(a.canvas.getchannel("A").getextrema(), (255, 255))
            self.assertTrue(all(f"tex_town_song_southern_water__v{i:02d}" in a.tiles.used_ids
                                for i in range(1, 5)))
            # Interior centres are actual textured water, never paper gaps.
            for x, z in water:
                px, py = project(x+.5, z+.5, 12, scale)
                self.assertNotEqual(a.canvas.getpixel((round(px), round(py)))[:3], (237, 232, 217))


if __name__ == "__main__":
    unittest.main()
