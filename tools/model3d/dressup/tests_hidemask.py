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
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0, mode="rays")

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
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0, mode="rays")
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
            m_per_mu=1.0, max_distance_mm=80.0, opening_margin_mm=15.0, mode="rays")
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


class VisibilityMaskTests(unittest.TestCase):
    def setUp(self) -> None:
        # 身体半径 1 m；短筒裙内壁离体 30 mm，下摆以下身体完全暴露。
        self.body = _tube(np.linspace(0.0, 2.0, 41).tolist(), radius=1.0,
                          segments=64, split_bands=True)
        self.garment = _tube(np.linspace(.75, 1.45, 15).tolist(), radius=1.03,
                             segments=64, split_bands=True)
        self.regions = np.full(len(self.body.positions), 2, np.uint8)
        self.raster = rasterize_uv(self.body, self.regions, 160)
        self.result = hide.bake_mask(
            self.body, self.garment, self.raster, self.regions, {2: "torsoLower"},
            m_per_mu=1.0, mode="visibility", poses=[hide._bind_pose(self.body, self.garment)],
            view_count=128, depth_size=128, morph_radius_px=1)

    def test_short_skirt_hem_below_body_stays_visible(self) -> None:
        below = self.raster.covered & (self.raster.positions[..., 1] < .68)
        self.assertGreater(int(below.sum()), 500)
        self.assertEqual(int(self.result.mask[below].max(initial=0)), 0)
        legacy = hide.bake_mask(
            self.body, self.garment, self.raster, self.regions, {2: "torsoLower"},
            m_per_mu=1.0, mode="rays", max_distance_mm=800.0,
            opening_margin_mm=0.0, morph_radius_px=1)
        self.assertGreater(int(np.count_nonzero(legacy.mask[below] >= 128)), 0)

    def test_fully_enclosed_tube_body_is_hidden(self) -> None:
        inside = (self.raster.covered & (self.raster.positions[..., 1] > 1.0)
                  & (self.raster.positions[..., 1] < 1.2))
        self.assertGreater(int(inside.sum()), 500)
        self.assertGreater(float((self.result.mask[inside] >= 128).mean()), .80)

    def test_camera_band_hides_torso_and_preserves_skin_below_hem(self) -> None:
        # 短上衣下缘以下可从正面看到，衣内躯干则在游戏相机球带内被包住。
        torso = (self.raster.covered & (self.raster.positions[..., 1] > 1.0)
                  & (self.raster.positions[..., 1] < 1.2))
        below_hem = (self.raster.covered & (self.raster.positions[..., 1] > .3)
                     & (self.raster.positions[..., 1] < .6))
        elevations = np.degrees(np.arcsin(hide.fibonacci_directions(128)[:, 1]))
        self.assertAlmostEqual(float(elevations.min()), -15.0, places=10)
        self.assertAlmostEqual(float(elevations.max()), 80.0, places=10)
        self.assertGreater(float((self.result.mask[torso] >= 128).mean()), .80)
        self.assertEqual(int(self.result.mask[below_hem].max(initial=0)), 0)

    def test_walk_body_piercing_front_stays_hidden_below_hem_stays_visible(self) -> None:
        # walk 中衣内躯干整体穿到前片外侧：它可见但带符号距离为正，不能回补。
        bind = hide._bind_pose(self.body, self.garment)
        walk_positions = self.body.positions.astype(np.float64).copy()
        torso_vertices = ((walk_positions[:, 1] > .9) & (walk_positions[:, 1] < 1.3))
        radial = walk_positions[torso_vertices][:, [0, 2]]
        radial /= np.maximum(np.linalg.norm(radial, axis=1)[:, None], 1e-12)
        walk_positions[torso_vertices, 0] += .12 * radial[:, 0]
        walk_positions[torso_vertices, 2] += .12 * radial[:, 1]
        walk = hide.PosedMeshes(
            "walk:0", walk_positions,
            hide._vertex_normals(walk_positions, self.body.indices.reshape(-1, 3)),
            self.garment.positions.astype(np.float64), bind.garment_normals)
        result = hide.bake_mask(
            self.body, self.garment, self.raster, self.regions, {2: "torsoLower"},
            m_per_mu=1.0, mode="visibility", poses=[bind, walk],
            view_count=128, depth_size=128, morph_radius_px=1)
        torso = (self.raster.covered & (self.raster.positions[..., 1] > 1.0)
                  & (self.raster.positions[..., 1] < 1.2))
        below_hem = (self.raster.covered & (self.raster.positions[..., 1] > .3)
                     & (self.raster.positions[..., 1] < .6))
        self.assertGreater(result.stats["animationOutsideVisibleTexels"], 0)
        self.assertGreater(float((result.mask[torso] >= 128).mean()), .80)
        self.assertEqual(int(result.mask[below_hem].max(initial=0)), 0)

    def test_synthetic_hole_count_is_zero(self) -> None:
        # 已知正确遮罩只隐藏筒内 0.80~1.40 m 区间；验证器应报告零黑洞。
        hidden_uv = np.zeros_like(self.result.mask, dtype=np.float32)
        enclosed = (self.raster.covered & (self.raster.positions[..., 1] > .80)
                    & (self.raster.positions[..., 1] < 1.40))
        hidden_uv[enclosed] = 1.0
        # 斜上视角能越过开口看到筒内，故正确包覆场景使用封住上下视野的长筒。
        close_garment = _tube(np.linspace(-3.0, 5.0, 81).tolist(), radius=1.03,
                              segments=64, split_bands=True)
        rate, _ = validate._holes_for_pose(
            self.body.positions, close_garment.positions, self.body, close_garment,
            hidden_uv, m_per_mu=1.0)
        self.assertEqual(rate, 0.0)

    def test_face_center_mask_hole_is_reported_when_vertices_are_clear(self) -> None:
        body = Mesh(
            np.array([[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]], np.float32),
            np.array([0, 1, 2, 0, 2, 3], np.uint16),
            np.tile([0, 0, 1], (4, 1)).astype(np.float32),
            np.array([[0, 0], [1, 0], [1, 1], [0, 1]], np.float32))
        garment = Mesh(np.array([[3, 3, -1], [4, 3, -1], [3, 4, -1]], np.float32),
                       np.array([0, 1, 2], np.uint16))
        mask = np.zeros((64, 64), np.float32); mask[24:40, 24:40] = 1
        self.assertTrue(np.all(validate._sample_hide_mask(mask, body.uvs) == 0))
        rate, _ = validate._holes_for_pose(
            body.positions, garment.positions, body, garment, mask, 1.0, size=128)
        self.assertGreater(rate, .01)

    def test_hidden_body_with_garment_behind_is_not_a_background_hole(self) -> None:
        body = Mesh(
            np.array([[-1, -1, .1], [1, -1, .1], [1, 1, .1], [-1, 1, .1]], np.float32),
            np.array([0, 1, 2, 0, 2, 3], np.uint16),
            np.tile([0, 0, 1], (4, 1)).astype(np.float32),
            np.array([[0, 0], [1, 0], [1, 1], [0, 1]], np.float32))
        garment = Mesh(
            np.array([[-1, -1, 0], [1, -1, 0], [1, 1, 0], [-1, 1, 0]], np.float32),
            np.array([0, 1, 2, 0, 2, 3], np.uint16))
        mask = np.ones((32, 32), np.float32)
        holes, _, _ = validate._hole_view(
            body.positions, body.indices.reshape(-1, 3), body.uvs,
            garment.positions, garment.indices.reshape(-1, 3), mask,
            np.array([0., 0., 1.]), .002, 128)
        self.assertEqual(holes, 0)

    def test_unhidden_backface_does_not_fill_front_body_hole(self) -> None:
        front = [[-1, -1, .1], [1, -1, .1], [1, 1, .1], [-1, 1, .1]]
        back = [[-1, -1, 0], [-1, 1, 0], [1, 1, 0], [1, -1, 0]]
        body = Mesh(
            np.asarray(front + back, np.float32),
            np.array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7], np.uint16),
            uvs=np.array([[.4, .4], [.6, .4], [.6, .6], [.4, .6],
                          [0, 0], [.1, 0], [.1, .1], [0, .1]], np.float32))
        garment = Mesh(np.array([[3, 3, -1], [4, 3, -1], [3, 4, -1]], np.float32),
                       np.array([0, 1, 2], np.uint16))
        mask = np.zeros((64, 64), np.float32); mask[20:44, 20:44] = 1
        holes, _, _ = validate._hole_view(
            body.positions, body.indices.reshape(-1, 3), body.uvs,
            garment.positions, garment.indices.reshape(-1, 3), mask,
            np.array([0., 0., 1.]), .002, 128)
        self.assertGreater(holes, 0)

    def test_fibonacci_is_uniform_in_camera_reachable_band(self) -> None:
        directions = hide.fibonacci_directions(128)
        self.assertEqual(directions.shape, (128, 3))
        elevations = np.degrees(np.arcsin(directions[:, 1]))
        self.assertAlmostEqual(float(elevations.min()), -15.0, places=10)
        self.assertAlmostEqual(float(elevations.max()), 80.0, places=10)
        self.assertTrue(np.allclose(np.diff(directions[:, 1]), np.diff(directions[:, 1])[0]))
        hole_elevations = np.degrees(np.arcsin(validate.HOLE_VIEWS[:, 1]))
        self.assertEqual(sorted(np.round(hole_elevations, 8).tolist()), [0.0] * 4 + [45.0] * 4)
        self.assertEqual(self.result.stats["mode"], "visibility")
        self.assertEqual(self.result.stats["views"], 128)
        self.assertEqual(self.result.stats["viewElevationDeg"], [-15.0, 80.0])


class TriangleRasterTests(unittest.TestCase):
    def test_large_oblique_triangle_covers_inside_not_bbox_outside(self) -> None:
        positions = np.array([[-1., -1., .2], [1., -.7, .8], [-.6, 1., .5]])
        faces = np.array([[0, 1, 2]])
        frame = hide.orthographic_frame((positions,), np.array([0., 0., 1.]), 128)
        depth, _ = hide.rasterize_triangles(positions, faces, frame)
        centroid = positions.mean(axis=0, keepdims=True)
        rows, columns, expected = hide.project_points(centroid, frame)
        self.assertAlmostEqual(float(depth[rows[0], columns[0]]), float(expected[0]), delta=.02)
        self.assertTrue(np.isneginf(depth[120, 120]))

    def test_thirty_mm_opening_survives_at_256_and_512(self) -> None:
        body_positions = np.array([[-.5, -.5, 0.], [.5, -.5, 0.],
                                   [.5, .5, 0.], [-.5, .5, 0.]])
        body_faces = np.array([[0, 1, 2], [0, 2, 3]])
        left = [[-.5, -.5, .1], [-.015, -.5, .1], [-.015, .5, .1], [-.5, .5, .1]]
        right = [[.015, -.5, .1], [.5, -.5, .1], [.5, .5, .1], [.015, .5, .1]]
        garment_positions = np.asarray(left + right)
        garment_faces = np.array([[0, 1, 2], [0, 2, 3], [4, 5, 6], [4, 6, 7]])
        for size in (256, 512):
            found = hide._view_visibility(
                np.array([[0., 0., 0.]]), np.array([[0., 0., 1.]]),
                body_positions, body_faces, garment_positions, garment_faces,
                np.array([0., 0., 1.]), np.array([True]), .002, size)
            self.assertEqual(found.tolist(), [0], size)

    def test_depth_maps_converge_at_256_and_512(self) -> None:
        positions = np.array([[-.8, -.8, .2], [.9, -.6, .8], [-.5, .9, .5]])
        faces = np.array([[0, 1, 2]])
        samples = []
        for size in (256, 512):
            frame = hide.orthographic_frame((positions,), np.array([0., 0., 1.]), size)
            depth, _ = hide.rasterize_triangles(positions, faces, frame)
            row, column, _ = hide.project_points(
                np.array([[0., 0., .5294117647]]), frame)
            samples.append(float(depth[row[0], column[0]]))
            self.assertTrue(np.isfinite(samples[-1]))
        self.assertAlmostEqual(samples[0], samples[1], delta=.003)


if __name__ == "__main__":
    unittest.main(verbosity=2)
