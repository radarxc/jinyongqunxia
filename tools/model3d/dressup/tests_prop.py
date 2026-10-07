#!/usr/bin/env python3
"""normalize_prop.py 的合成剑/锥测试；不访问网络、不依赖测试框架。"""
from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest

import numpy as np

import normalize_prop
from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb


def _boxes(specs: list[tuple[tuple[float, float, float], tuple[float, float, float]]]) -> Mesh:
    """合并互不焊接的轴对齐盒；spec 为 center / full size。"""
    positions: list[list[float]] = []
    indices: list[int] = []
    faces = ((0, 2, 1), (0, 3, 2), (4, 5, 6), (4, 6, 7),
             (0, 1, 5), (0, 5, 4), (3, 7, 6), (3, 6, 2),
             (0, 4, 7), (0, 7, 3), (1, 2, 6), (1, 6, 5))
    signs = ((-1, -1, -1), (1, -1, -1), (1, 1, -1), (-1, 1, -1),
             (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1))
    for center, size in specs:
        offset = len(positions)
        positions.extend([[center[axis] + sign[axis] * size[axis] / 2 for axis in range(3)]
                          for sign in signs])
        indices.extend(offset + vertex for face in faces for vertex in face)
    values = np.asarray(positions, dtype=np.float32)
    section = PrimitiveRange(0, len(values), 0, len(indices), 0)
    return Mesh(values, np.asarray(indices, dtype=np.uint16), primitives=[section],
                material_indices=np.array([0]), name="SyntheticSword")


def _seamed_boxes(
    specs: list[tuple[tuple[float, float, float], tuple[float, float, float]]],
) -> Mesh:
    """把每个三角形拆成独立顶点，模拟 UV/法线接缝。"""
    indexed = _boxes(specs)
    positions = indexed.positions[indexed.indices]
    indices = np.arange(len(positions), dtype=np.uint32)
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    return Mesh(positions, indices, primitives=[section],
                material_indices=np.array([0]), name="SeamedBoxes")


def _sword() -> Mesh:
    # 细柄 + 宽护手 + 长刃；绕 Z/X 旋转，验证不是依赖输入轴。
    mesh = _boxes([((0, 0.15, 0), (0.08, 0.30, 0.05)),
                   ((0, 0.32, 0), (0.60, 0.06, 0.05)),
                   ((0, 1.17, 0), (0.14, 1.64, 0.035))])
    rz = np.array([[np.cos(0.61), -np.sin(0.61), 0],
                   [np.sin(0.61), np.cos(0.61), 0], [0, 0, 1]])
    rx = np.array([[1, 0, 0], [0, np.cos(0.37), -np.sin(0.37)],
                   [0, np.sin(0.37), np.cos(0.37)]])
    mesh.positions = (mesh.positions @ (rz @ rx).T + np.array([2.0, -1.0, 0.5])).astype(np.float32)
    return mesh


def _cone(segments: int = 48) -> Mesh:
    positions = [[0.0, 1.2, 0.0]]
    for index in range(segments):
        angle = 2 * np.pi * index / segments
        positions.append([0.72 * np.cos(angle), -0.8, 0.72 * np.sin(angle)])
    positions.append([0.0, -0.8, 0.0]); center = len(positions) - 1
    indices: list[int] = []
    for index in range(segments):
        nxt = 1 + (index + 1) % segments
        indices.extend((0, 1 + index, nxt, center, nxt, 1 + index))
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    return Mesh(np.asarray(positions, dtype=np.float32), np.asarray(indices, dtype=np.uint16),
                primitives=[section], material_indices=np.array([0]), name="SyntheticCone")


def _write_raw(path: Path, mesh: Mesh) -> None:
    builder = GLBBuilder(generator="normalize_prop tests")
    material = builder.add_material(unlit=False, name="RawPbr")
    mesh_id = builder.add_mesh(mesh, material_map=[material])
    node = builder.add_node(mesh=mesh_id, translation=[0.1, -0.2, 0.3])
    builder.add_scene([node]); builder.write(path)


class NormalizePropTests(unittest.TestCase):
    def test_welded_seams_and_separate_components(self) -> None:
        one = _seamed_boxes([((0, 0, 0), (2, 2, 2))])
        components, welded_faces = normalize_prop._component_info(one)
        self.assertEqual(len(components), 1)
        boundary, nonmanifold = normalize_prop.edge_statistics(welded_faces)
        self.assertEqual((len(boundary), len(nonmanifold)), (0, 0))
        two = _seamed_boxes([((0, 0, 0), (2, 2, 2)),
                             ((4, 0, 0), (1, 1, 1))])
        self.assertEqual(len(normalize_prop._component_info(two)[0]), 2)

    def test_keep_largest_retains_complete_larger_box(self) -> None:
        mesh = _seamed_boxes([((0, 0, 0), (2, 2, 2)),
                              ((4, 0, 0), (1, 1, 1))])
        components, _ = normalize_prop._component_info(mesh)
        kept = normalize_prop._keep_largest_component(mesh, components)
        self.assertEqual(len(kept.indices) // 3, 12)
        self.assertTrue(np.allclose(np.ptp(kept.positions, axis=0), [2, 2, 2]))
        self.assertEqual(len(normalize_prop._component_info(kept)[0]), 1)
        with tempfile.TemporaryDirectory(prefix="tianshu-prop-keep-") as directory:
            root = Path(directory); raw = root / "two_boxes.glb"; _write_raw(raw, mesh)
            skeleton = root / "skeleton.json"
            skeleton.write_text(json.dumps({"mPerMu": 1.0, "source": {}}))
            fit = normalize_prop.normalize_file(
                raw, root / "out", "largest_box", "generic", 1.0,
                skeleton=skeleton, keep="largest")
            output = load_glb(root / "out/largest_box.glb").mesh()
            self.assertEqual((fit["diagnostics"]["componentsInput"],
                              fit["stats"]["components"]), (2, 1))
            self.assertEqual(len(output.indices) // 3, 12)

    def test_checked_in_samples_use_welded_statistics_and_real_anchor(self) -> None:
        root = Path(__file__).resolve().parents[3]
        props = root / "assets/default/model3d/dressup/props"
        for asset_id in ("item_qingfeng_sword", "item_bamboo_hat",
                         "luxury_jade_pendant"):
            with self.subTest(asset_id=asset_id):
                directory = props / asset_id
                fit = json.loads((directory / "fit.json").read_text(encoding="utf-8"))
                mesh = load_glb(directory / f"{asset_id}.glb").mesh()
                components, welded_faces = normalize_prop._component_info(mesh)
                boundary, nonmanifold = normalize_prop.edge_statistics(welded_faces)
                self.assertEqual(fit["stats"]["components"], len(components))
                self.assertEqual(fit["stats"]["boundaryEdges"], len(boundary))
                self.assertEqual(fit["stats"]["nonManifoldEdges"], len(nonmanifold))
                anchor = normalize_prop._output_anchor(mesh.positions, fit["anchor"], 0.07)
                self.assertTrue(np.array_equal(fit["diagnostics"]["anchorPositionMu"], anchor))
                self.assertLess(np.linalg.norm(anchor), 1e-4)

    def test_weapon_handle_anchor_axis_and_scale(self) -> None:
        with tempfile.TemporaryDirectory(prefix="tianshu-prop-test-") as directory:
            root = Path(directory); raw = root / "sword_raw.glb"; _write_raw(raw, _sword())
            skeleton = root / "skeleton.json"
            skeleton.write_text(json.dumps({"mPerMu": 2.0, "source": {"file": "synthetic-body.glb",
                                                                         "sha256": "synthetic"}}))
            fit = normalize_prop.normalize_file(raw, root / "out", "synthetic_sword", "weapon", 1.0,
                                                skeleton=skeleton, grip_ratio=0.07)
            output = load_glb(root / "out/synthetic_sword.glb")
            positions = output.mesh().positions
            profile = fit["diagnostics"]["profileWidthsMu"]
            selected = fit["diagnostics"]["selectedEnd"]
            selected_width = np.median(profile[:3] if selected == "low" else profile[-3:])
            other_width = np.median(profile[-3:] if selected == "low" else profile[:3])
            self.assertLessEqual(selected_width, other_width)
            self.assertAlmostEqual(fit["scaleApplied"], 1 / (fit["measuredLengthMu"] * 2), places=7)
            self.assertAlmostEqual(
                float(positions[:, 1].min()), -0.07 * float(np.ptp(positions[:, 1])), places=5)
            self.assertGreater(float(np.ptp(positions[:, 1])), 4 * float(np.ptp(positions[:, 0])))
            expected_anchor = normalize_prop._output_anchor(positions, "grip", 0.07)
            self.assertTrue(np.array_equal(fit["diagnostics"]["anchorPositionMu"], expected_anchor))
            self.assertLess(np.linalg.norm(expected_anchor), 1e-7)
            self.assertFalse(any(key in output.json["nodes"][0] for key in ("matrix", "translation", "rotation", "scale")))
            self.assertIn("KHR_materials_unlit", output.json["materials"][0]["extensions"])
            second = normalize_prop.normalize_file(raw, root / "out2", "synthetic_sword", "weapon", 1.0,
                                                   skeleton=skeleton, grip_ratio=0.07)
            self.assertEqual(fit, second)
            self.assertEqual((root / "out/synthetic_sword.glb").read_bytes(),
                             (root / "out2/synthetic_sword.glb").read_bytes())

    def test_hat_cone_tip_is_origin_and_opening_negative_y(self) -> None:
        result = normalize_prop.normalize_mesh(_cone(), "hat", 0.45, 1.5, size_axis="width")
        positions = result.mesh.positions
        tip = positions[np.argmax(positions[:, 1])]
        self.assertLess(np.linalg.norm(tip), 1e-6)
        self.assertLess(float(positions[:, 1].min()), -0.1)
        self.assertEqual(result.selected_end, "high")
        self.assertAlmostEqual(max(float(np.ptp(positions[:, 0])), float(np.ptp(positions[:, 2]))) * 1.5,
                               0.45, places=6)


if __name__ == "__main__":
    unittest.main(verbosity=2)
