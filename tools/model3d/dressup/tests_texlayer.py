#!/usr/bin/env python3
"""bake_texture_layer.py 合成圆柱回归测试；不访问网络、不依赖测试框架。"""
from __future__ import annotations

import unittest

import numpy as np
from PIL import Image

import bake_texture_layer as texlayer
from glb_io import Mesh, PrimitiveRange


def _cylinder(segments: int = 24, radius: float = 1.0) -> tuple[Mesh, np.ndarray]:
    """两段、UV 接缝拆点的圆柱；下段 region 2，顶段 region 0。"""
    positions: list[list[float]] = []; normals: list[list[float]] = []
    uvs: list[list[float]] = []; regions: list[int] = []; indices: list[int] = []
    for band, (y0, y1, region) in enumerate(((0.0, 1.0, 2), (1.0, 2.0, 0))):
        offset = len(positions)
        for row, y in enumerate((y0, y1)):
            for index in range(segments + 1):
                angle = 2 * np.pi * index / segments
                normal = [np.cos(angle), 0.0, np.sin(angle)]
                positions.append([radius * normal[0], y, radius * normal[2]])
                normals.append(normal); uvs.append([index / segments, (band + row) / 2])
                regions.append(region)
        stride = segments + 1
        for index in range(segments):
            a = offset + index; b = a + 1; c = a + stride; d = c + 1
            indices.extend((a, c, b, b, c, d))
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    mesh = Mesh(np.asarray(positions, np.float32), np.asarray(indices, np.uint32),
                np.asarray(normals, np.float32), np.asarray(uvs, np.float32),
                material_indices=np.array([0]), primitives=[section], name="SyntheticCylinder")
    return mesh, np.asarray(regions, np.uint8)


def _classifier() -> texlayer.Classifier:
    cloth = np.array([[160, 28, 24], [175, 35, 30], [145, 24, 20]], np.uint8)
    skin = np.array([[224, 177, 145], [210, 158, 126], [235, 190, 155]], np.uint8)
    return texlayer.Classifier(texlayer._srgb_lab(cloth), texlayer._srgb_lab(skin),
                               0.0, 3.0, len(cloth), len(skin))


def _source_texture() -> Image.Image:
    image = np.empty((16, 32, 3), dtype=np.uint8)
    image[:, :16] = [160, 28, 24]; image[:, 16:] = [224, 177, 145]
    return Image.fromarray(image, "RGB")


class TextureLayerTests(unittest.TestCase):
    def test_uv_raster_covers_cylinder_and_interpolates(self) -> None:
        mesh, regions = _cylinder(); raster = texlayer.rasterize_uv(mesh, regions, 96)
        self.assertGreater(raster.covered.mean(), 0.96)
        self.assertTrue(np.all(np.isfinite(raster.positions[raster.covered])))
        self.assertTrue(np.allclose(np.linalg.norm(raster.normals[raster.covered], axis=1), 1, atol=1e-5))
        self.assertEqual(set(np.unique(raster.regions[raster.covered])), {0, 2})

    def test_nearest_surface_and_bilinear_color(self) -> None:
        body, _ = _cylinder(radius=1.0); sleeve, _ = _cylinder(radius=1.025)
        points = body.positions[[1, 8, 17]]
        face, bary, distance = texlayer.nearest_surface(points, sleeve.positions,
                                                        sleeve.indices.reshape(-1, 3), k=8)
        # 离散 24 边形的面距略小于解析圆半径差 0.025。
        self.assertTrue(np.all((distance > 0.024) & (distance < 0.025)))
        uv = np.einsum("ni,nij->nj", bary, sleeve.uvs[sleeve.indices.reshape(-1, 3)[face]])
        colors = texlayer.bilinear_sample(np.asarray(_source_texture()), uv)
        self.assertTrue(np.all(np.isfinite(colors)))
        probabilities = texlayer.classify_colors(colors, _classifier())
        self.assertGreater(probabilities.max(), 0.9); self.assertLess(probabilities.min(), 0.1)

    def test_ray_selects_outermost_nested_sleeve(self) -> None:
        body, _ = _cylinder(radius=1.0)
        middle, _ = _cylinder(radius=1.025); outer, _ = _cylinder(radius=1.05)
        vertices = np.concatenate([middle.positions, outer.positions])
        faces = np.concatenate([middle.indices.reshape(-1, 3),
                                outer.indices.reshape(-1, 3) + len(middle.positions)])
        ids = np.arange(1, 23); normals = body.normals[ids]
        hits = texlayer.raycast_outermost(body.positions[ids] - .005 * normals, normals,
                                          vertices, faces, .1)
        self.assertTrue(np.all(hits.hit))
        self.assertTrue(np.all((hits.distance > .054) & (hits.distance < .056)))
        self.assertTrue(np.all(hits.faces >= len(middle.indices) // 3))

    def test_ray_skips_outer_grazing_hit_for_next_facing_hit(self) -> None:
        vertices = np.array([[-.05, -.1, -.12], [.05, -.1, .28], [0, .1, .08],
                             [-.1, -.1, .04], [.1, -.1, .04], [0, .1, .04]])
        faces = np.array([[0, 1, 2], [3, 4, 5]])
        hit = texlayer.raycast_outermost(np.array([[0., 0., 0.]]),
                                         np.array([[0., 0., 1.]]), vertices, faces, .1)
        self.assertTrue(hit.hit[0]); self.assertEqual(hit.faces[0], 1)
        self.assertAlmostEqual(hit.distance[0], .04, places=6)
        self.assertGreaterEqual(hit.grazing[0], 1)

    def test_region_constraint_feather_and_padding(self) -> None:
        body, regions = _cylinder(); sleeve, _ = _cylinder(radius=1.025)
        body.uvs = body.uvs * np.float32(0.8) + np.float32(0.1)
        raster = texlayer.rasterize_uv(body, regions, 128)
        rgba, stats = texlayer.bake_pixels(
            body, regions, raster, {0: "head", 2: "torsoUpper"}, sleeve, _source_texture(),
            _classifier(), 0.1)
        alpha = rgba[..., 3]
        self.assertGreater(stats["hitRate"], 0.99)
        self.assertEqual(stats["rayCandidateTexels"], stats["candidateTexels"])
        self.assertGreater(stats["rayCandidateTexels"], len(body.positions))
        self.assertGreater(np.count_nonzero(alpha == 255), 10)
        forbidden = raster.covered & (raster.regions == 0)
        self.assertEqual(int(alpha[forbidden].max(initial=0)), 0)
        self.assertTrue(np.all(rgba[alpha == 0, :3] == 0))
        self.assertGreater(float(rgba[alpha > 0, :3].mean()), 10.0)
        self.assertGreater(np.count_nonzero((~raster.covered) & (alpha > 0)), 0)

    def test_ray_miss_falls_back_and_counts(self) -> None:
        body, regions = _cylinder(); sleeve, _ = _cylinder(radius=1.025)
        sleeve.positions[:, 0] += 0.08  # 部分内侧法线射线无交点，最近面仍在阈值内。
        raster = texlayer.rasterize_uv(body, regions, 64)
        _, stats = texlayer.bake_pixels(body, regions, raster,
                                        {0: "head", 2: "torsoUpper"}, sleeve,
                                        _source_texture(), _classifier(), 0.15)
        self.assertGreater(stats["fallbackTexels"], 0)
        self.assertEqual(stats["hitTexels"], stats["candidateTexels"])
        self.assertEqual(stats["rayCandidateTexels"], stats["candidateTexels"])

    def test_welded_uv_seam_gets_identical_smoothed_score(self) -> None:
        mesh, regions = _cylinder(segments=12)
        raw = np.linspace(0.0, 1.0, len(mesh.positions), dtype=np.float32)
        raw[0], raw[12] = 0.0, 1.0  # 两个 UV 端点是同一 3D 位置。
        smooth, stats = texlayer.smooth_vertex_scores(mesh, raw, regions == 2, iterations=2)
        self.assertEqual(smooth[0], smooth[12])
        self.assertEqual(smooth[0], smooth[12])
        self.assertEqual(smooth[24], smooth[36])
        self.assertGreater(stats["weldedDuplicates"], 0)
        self.assertEqual(stats["laplacianRings"], 2)

    def test_signed_distance_feather_is_exactly_one_point_five_pixels(self) -> None:
        distance = np.array([-1.0, -.75, 0.0, .75, 1.0])
        alpha = texlayer.signed_distance_alpha(distance, feather_px=1.5)
        np.testing.assert_allclose(alpha, [0.0, 0.0, .5, 1.0, 1.0])

    def test_alpha_is_opaque_inside_and_partial_only_at_3d_boundary(self) -> None:
        body, regions = _cylinder(); sleeve, _ = _cylinder(radius=1.025)
        raster = texlayer.rasterize_uv(body, regions, 96)
        rgba, _ = texlayer.bake_pixels(body, regions, raster,
                                       {0: "head", 2: "torsoUpper"}, sleeve,
                                       _source_texture(), _classifier(), .1)
        alpha = rgba[..., 3]; partial = raster.covered & (alpha > 0) & (alpha < 255)
        self.assertGreater(np.count_nonzero(alpha == 255), 10)
        self.assertFalse(np.any(partial & (raster.regions == 0)))
        seam_columns = np.nonzero(partial)[1]
        self.assertTrue(not len(seam_columns) or np.all((seam_columns > 2) & (seam_columns < 93)))

    def test_gutter_expands_rgb_and_alpha_exactly_eight_pixels(self) -> None:
        covered = np.zeros((40, 40), bool); covered[16:24, 16:24] = True
        alpha = np.zeros((40, 40), np.float32); alpha[16:24, 16:20] = 1.0
        rgb = np.zeros((40, 40, 3), np.float32); rgb[alpha > 0] = [20, 40, 60]
        expanded = texlayer.pad_gutter(rgb, alpha, covered, width=8)
        self.assertTrue(expanded[8, 16]); self.assertTrue(expanded[16, 8])
        self.assertFalse(expanded[7, 16]); self.assertFalse(expanded[16, 7])
        self.assertTrue(np.all(rgb[expanded] == [20, 40, 60]))
        self.assertTrue(np.all(alpha[expanded] == 1.0))
        # 岛内透明半边保持原值，最近有效纹素不得越权复制进岛内。
        self.assertTrue(np.all(rgb[16:24, 20:24] == 0))
        self.assertTrue(np.all(alpha[16:24, 20:24] == 0))

    def test_shared_uv_rejects_single_changed_value(self) -> None:
        reference, _ = _cylinder(); same, _ = _cylinder(); changed, _ = _cylinder()
        changed.uvs[3, 0] += np.float32(1 / 1024)
        self.assertEqual(texlayer.shared_uv_templates(reference, {"same": same, "changed": changed}),
                         ["same"])

    def test_plate_classifier_learns_samples_without_color_constants(self) -> None:
        base = np.full((64, 64, 3), [218, 210, 194], dtype=np.uint8)
        base[8:56, 18:46] = [224, 177, 145]
        dressed = base.copy(); dressed[24:48, 18:46] = [40, 90, 160]
        classifier = texlayer.build_classifier(Image.fromarray(dressed), Image.fromarray(base), 128)
        probability = texlayer.classify_colors(np.array([[40, 90, 160], [224, 177, 145]]), classifier)
        self.assertGreater(probability[0], 0.9); self.assertLess(probability[1], 0.1)


if __name__ == "__main__":
    unittest.main(verbosity=2)
