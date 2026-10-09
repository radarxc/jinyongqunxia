#!/usr/bin/env python3
"""hide mask 合成回归；只在临时目录写文件。"""
from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest

import numpy as np
from PIL import Image

import bake_hide_mask as hide
from bake_texture_layer import rasterize_uv
from glb_io import Mesh, PrimitiveRange
import validate


def _tube(rows: list[float], *, radius: float, segments: int = 32,
          split_bands: bool = False) -> Mesh:
    """开口圆柱；split_bands=True 时每段独立顶点/UV 岛。"""
    positions: list[list[float]] = []; normals: list[list[float]] = []
    uvs: list[list[float]] = []; indices: list[int] = []
    if split_bands:
        bands = [(rows[i], rows[i + 1], i) for i in range(len(rows) - 1)]
    else:
        bands = [(rows[0], rows[-1], 0)]
        rows = [rows[0], rows[-1]]
    band_count = len(bands)
    for y0, y1, band in bands:
        start = len(positions)
        for row, y in enumerate((y0, y1)):
            for index in range(segments + 1):
                angle = 2 * np.pi * index / segments
                x, z = np.cos(angle), np.sin(angle)
                positions.append([radius * x, y, radius * z]); normals.append([x, 0, z])
                low = band / band_count; high = (band + 0.8) / band_count
                uvs.append([index / segments, low if row == 0 else high])
        stride = segments + 1
        for index in range(segments):
            a, b, c, d = start + index, start + index + 1, start + stride + index, start + stride + index + 1
            indices.extend((a, c, b, b, c, d))
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    return Mesh(np.asarray(positions, np.float32), np.asarray(indices, np.uint32),
                np.asarray(normals, np.float32), np.asarray(uvs, np.float32),
                material_indices=np.array([0]), primitives=[section])


def _body() -> tuple[Mesh, np.ndarray]:
    rows = [0.0, .2, .35, .8, 1.2, 1.65, 1.8, 2.0]
    mesh = _tube(rows, radius=1.0, split_bands=True)
    regions = np.empty(len(mesh.positions), np.uint8); stride = 33 * 2
    for band in range(len(rows) - 1):
        regions[band * stride:(band + 1) * stride] = 9 if band == 3 else 2
    return mesh, regions


class HideMaskTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.body, cls.regions = _body(); cls.garment = _tube([.2, 1.8], radius=1.003)
        cls.raster = rasterize_uv(cls.body, cls.regions, 192)
        cls.result = hide.bake_mask(
            cls.body, cls.garment, cls.raster, cls.regions, {2: "torsoUpper", 9: "handL"},
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0)

    def test_sleeve_covered_segment_is_hidden(self) -> None:
        core = self.raster.covered & (self.raster.positions[..., 1] > .4) & (self.raster.positions[..., 1] < .52)
        self.assertGreater(int(core.sum()), 100)
        self.assertGreater(float((self.result.mask[core] >= 128).mean()), .95)
        self.assertGreater(self.result.stats["coveredRatio"], .25)

    def test_eighty_mm_oblique_ray_hits_when_normal_misses(self) -> None:
        body = Mesh(np.array([[0., 0., 0.]], np.float32), np.array([], np.uint32),
                    np.array([[0., 0., 1.]], np.float32), np.array([[.5, .5]], np.float32))
        # 位于 +Z 55 mm、+X 25 mm：法线射线不穿三角，25°斜射线在 80 mm 内命中。
        garment = Mesh(np.array([[.020, -.010, .055], [.035, -.010, .055],
                                  [.0275, .010, .055]], np.float32),
                       np.array([0, 1, 2], np.uint32))
        hit, _, _, direction = hide._ray_hits(
            body.positions, body.normals, garment, .080, .002)
        self.assertTrue(bool(hit[0])); self.assertGreater(abs(float(direction[0, 0])), .3)
        normal_only = hide._raycast_nearest(
            body.positions - .002 * body.normals, body.normals,
            hide._ray_scene(garment.positions, garment.indices.reshape(-1, 3)), .082)
        self.assertFalse(bool(normal_only.hit[0]))

    def test_opening_margin_fifteen_mm_is_not_hidden(self) -> None:
        near = self.raster.covered & (np.abs(self.raster.positions[..., 1] - .2) < .014)
        near |= self.raster.covered & (np.abs(self.raster.positions[..., 1] - 1.8) < .014)
        self.assertGreater(int(near.sum()), 20)
        self.assertEqual(int(self.result.mask[near].max(initial=0)), 0)

    def test_opening_margin_wins_over_bind_penetration_patch(self) -> None:
        garment = _tube([.2, 1.8], radius=.997)
        result = hide.bake_mask(
            self.body, garment, self.raster, self.regions, {2: "torsoUpper", 9: "handL"},
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0)
        near = self.raster.covered & (np.abs(self.raster.positions[..., 1] - .2) < .014)
        near |= self.raster.covered & (np.abs(self.raster.positions[..., 1] - 1.8) < .014)
        self.assertGreater(result.stats["bindPenetratingVertices"], 0)
        self.assertEqual(int(result.mask[near].max(initial=0)), 0)

    def test_overlapping_free_edge_keeps_inner_layer_covered(self) -> None:
        outer = _tube([.2, 1.8], radius=1.003)
        inner = _tube([.0, 2.0], radius=1.006)
        offset = len(outer.positions)
        garment = Mesh(np.concatenate((outer.positions, inner.positions)),
                       np.concatenate((outer.indices, inner.indices + offset)),
                       np.concatenate((outer.normals, inner.normals)),
                       np.concatenate((outer.uvs, inner.uvs)))
        result = hide.bake_mask(
            self.body, garment, self.raster, self.regions, {2: "torsoUpper", 9: "handL"},
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0)
        overlapped = (self.raster.covered & (self.raster.positions[..., 1] > .19)
                      & (self.raster.positions[..., 1] < .214)
                      & (self.raster.regions != 9))
        self.assertGreater(float((result.mask[overlapped] >= 128).mean()), .6)

    def test_first_hit_uses_its_own_opening_ring_geodesic(self) -> None:
        # 两层衣面在空间上相邻；内层命中点靠近外层自由边，但沿内层拓扑离
        # 自己的开口很远，因此不能被外层开口错误保护。
        outer = _tube([.2, .6], radius=1.003); inner = _tube([.0, 2.0], radius=1.006)
        offset = len(outer.positions)
        garment = Mesh(np.concatenate((outer.positions, inner.positions)),
                       np.concatenate((outer.indices, inner.indices + offset)),
                       np.concatenate((outer.normals, inner.normals)),
                       np.concatenate((outer.uvs, inner.uvs)))
        segments, welded, openings, _ = hide._welded_boundary_segments(garment)
        del segments
        _, inverse = np.unique(np.round(garment.positions, 7), axis=0, return_inverse=True)
        faces = inverse[garment.indices.reshape(-1, 3)]
        distance = hide._opening_geodesic(welded, faces, openings)
        edges = hide._selected_opening_edges(faces, openings)
        inner_face = len(outer.indices) // 3
        own = hide._hit_opening_geodesic(
            np.array([inner_face]), np.array([[.5, .25, .25]]), faces, welded, distance, edges)
        self.assertGreater(float(own[0]), .015)

    def test_never_hide_region_is_not_hidden(self) -> None:
        forbidden = self.raster.covered & (self.raster.regions == 9)
        self.assertGreater(int(forbidden.sum()), 20)
        self.assertEqual(int(self.result.mask[forbidden].max(initial=0)), 0)
        self.assertFalse(np.any(self.result.covered[self.regions == 9]))

    def test_duplicate_uv_island_vertices_stay_consistent(self) -> None:
        rounded = np.round(self.body.positions, 7)
        _, inverse = np.unique(rounded, axis=0, return_inverse=True)
        for group in np.unique(inverse):
            values = self.result.covered[inverse == group]
            self.assertTrue(np.all(values == values[0]))
        self.assertGreater(self.result.stats["gutterTexels"], 0)
        # 最终 PNG（形态学与 seam 同步之后）在重复 3D 点的各 UV 岛取样一致。
        uv = self.body.uvs; size = self.result.mask.shape[0]
        x = np.rint(uv[:, 0] * (size - 1)).astype(int); y = np.rint(uv[:, 1] * (size - 1)).astype(int)
        pixels = self.result.mask[y, x]
        for group in np.unique(inverse):
            values = pixels[inverse == group]
            self.assertTrue(np.all(values == values[0]))

    def test_final_png_matches_along_split_seam_edge_interior(self) -> None:
        # 两三角只在 3D 中共边，UV 中把整条边拆到相距很远的两个岛。
        mesh = Mesh(
            np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0],
                      [0, 0, 0], [1, 0, 0], [0, -1, 0]], np.float32),
            np.array([0, 1, 2, 3, 5, 4], np.uint16),
            np.tile([0, 0, 1], (6, 1)).astype(np.float32),
            np.array([[.1, .2], [.9, .2], [.1, .1],
                      [.1, .8], [.9, .8], [.1, .9]], np.float32))
        size = 64; mask = np.zeros((size, size), bool)
        first_row = int(np.rint(.2 * (size - 1)))
        mask[first_row, int(np.rint(.1 * (size - 1))):int(np.rint(.9 * (size - 1))) + 1] = True
        changed = hide._synchronize_uv_seams(mask, np.zeros_like(mask), mesh)
        self.assertGreater(changed, 2)  # 旧实现只会改两个重复顶点。
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "final.png"
            Image.fromarray(mask.astype(np.uint8) * 255, mode="L").save(path)
            final = np.asarray(Image.open(path))
        for parameter in np.linspace(0.0, 1.0, 33):
            column = int(np.rint((.1 + .8 * parameter) * (size - 1)))
            upper = int(np.rint(.2 * (size - 1))); lower = int(np.rint(.8 * (size - 1)))
            self.assertEqual(int(final[upper, column]), int(final[lower, column]))

    def test_validate_visible_penetration_counts_only_unhidden_surface(self) -> None:
        mask = np.zeros((16, 16), np.uint8); mask[:, :8] = 255
        body = Mesh(
            np.array([[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]], np.float32),
            np.array([0, 1, 2, 0, 2, 3], np.uint16),
            np.tile([0, 0, 1], (4, 1)).astype(np.float32),
            np.array([[0, 0], [1, 0], [1, 1], [0, 1]], np.float32))
        points = np.array([[-.5, 0, -.01], [.5, 0, -.01], [.5, .5, .01]], np.float64)
        distances, visible = validate._distances_and_visibility(
            points, body.positions, body, body.normals, mask.astype(np.float32) / 255.0)
        penetrating = distances < 0
        self.assertEqual(int(penetrating.sum()), 2)
        self.assertEqual(int(np.count_nonzero(penetrating & visible)), 1)
        self.assertFalse(visible[0]); self.assertTrue(visible[1])

    def test_validate_mask_file_and_legacy_absence(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory); path = root / "hidemask.png"
            Image.new("L", (16, 16), 255).save(path)
            loaded = validate._load_hide_mask(
                {"hideMask": {"file": path.name, "size": 16}}, root / "fit.json", self.body)
            self.assertEqual(loaded.shape, (16, 16)); self.assertEqual(float(loaded.min()), 1.0)
            self.assertIsNone(validate._load_hide_mask({}, root / "legacy.json", self.body))
            Image.new("RGB", (16, 16), (255, 255, 255)).save(path)
            with self.assertRaisesRegex(ValueError, "L8"):
                validate._load_hide_mask(
                    {"hideMask": {"file": path.name, "size": 16}}, root / "fit.json", self.body)

    def test_jinzhuang_reports_have_zero_visible_bind_on_all_templates(self) -> None:
        root = Path(__file__).resolve().parents[3]
        asset = root / "assets/default/model3d/dressup/garments/eq_jinzhuang"
        for name in ("report.json", "report.tpl_f_small.json", "report.tpl_f_tall.json"):
            report = json.loads((asset / name).read_text(encoding="utf-8"))
            checks = {row["name"]: row for row in report["checks"]}
            self.assertEqual(checks["penetration.bindVertices.visible"]["value"], 0, name)
            self.assertTrue(checks["penetration.bindVertices.visible"]["pass"], name)


if __name__ == "__main__":
    unittest.main(verbosity=2)
