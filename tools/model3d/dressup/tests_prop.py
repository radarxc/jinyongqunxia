#!/usr/bin/env python3
"""normalize_prop.py 的合成剑/锥测试；不访问网络、不依赖测试框架。"""
from __future__ import annotations

import json
from pathlib import Path
import tempfile
import unittest
from unittest import mock

import numpy as np

import normalize_prop
import check_sockets
from common import quaternion_to_matrix
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


def _sheathed_sword() -> Mesh:
    """细长鞘 + 护手 + 短柄的连续 Mesh，护手距低端约 20%。"""
    rings = []
    for y in np.linspace(0.0, 1.0, 41):
        width = .45 if abs(y - .275) < .013 else (.07 if y < .275 else .10)
        rings.append([[-width, y, -.025], [width, y, -.025],
                      [width, y, .025], [-width, y, .025]])
    positions = np.asarray(rings, dtype=np.float32).reshape(-1, 3)
    indices: list[int] = []
    for ring in range(40):
        for side in range(4):
            a = ring * 4 + side; b = ring * 4 + (side + 1) % 4
            c = a + 4; d = b + 4
            indices.extend((a, b, d, a, d, c))
    indices.extend((0, 3, 2, 0, 2, 1))
    top = 40 * 4; indices.extend((top, top + 1, top + 2, top, top + 2, top + 3))
    section = PrimitiveRange(0, len(positions), 0, len(indices), 0)
    return Mesh(positions, np.asarray(indices, dtype=np.uint16), primitives=[section],
                material_indices=np.array([0]), name="SyntheticSheathedSword")


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


def _matrix_values(translation=(0.0, 0.0, 0.0)) -> list[float]:
    matrix = np.eye(4); matrix[:3, 3] = translation
    return matrix.T.reshape(-1).tolist()


def _socket_skeleton() -> dict:
    return {
        "mPerMu": 2.0,
        "bindWorld": {
            "mixamorig:RightHand": _matrix_values(),
            "mixamorig:RightHandMiddle1": _matrix_values((1.0, 0.0, 0.0)),
            "mixamorig:Head": _matrix_values(),
            "mixamorig:Spine2": _matrix_values(),
            "mixamorig:Hips": _matrix_values(),
        },
        "sockets": {
            "gripR": {"bone": "mixamorig:RightHand", "pos": [0, 0, 0], "quat": [0, 0, 0, 1]},
            "headTop": {"bone": "mixamorig:Head", "pos": [0, 0, 0], "quat": [0, 0, 0, 1]},
            "chest": {"bone": "mixamorig:Spine2", "pos": [0, 0, 0], "quat": [0, 0, 0, 1],
                      "normalLocal": [0, 0, 1]},
            "waistL": {"bone": "mixamorig:Hips", "pos": [0, 0, 0], "quat": [0, 0, 0, 1],
                       "normalLocal": [1, 0, 0]},
        },
    }


class NormalizePropTests(unittest.TestCase):
    def test_strict_triangle_sign_catches_nearest_vertex_disagreement(self) -> None:
        # 查询点最近顶点是 A，其法线朝 -Z，最近顶点法会误判为外部；
        # 最近点位于三角内部，重心插值法线朝 +Z，严格结果必须为负。
        vertices = np.array([[0., 0., 0.], [10., 0., 0.], [0., 10., 0.],
                             [100., 100., -1.], [-100., -100., 1.]])
        faces = np.array([[0, 1, 2]])
        normals = np.array([[0., 0., -1.], [0., 0., 1.], [0., 0., 1.],
                            [0., 0., 1.], [0., 0., 1.]])
        point = np.array([[3.2, 3.2, -0.1]])
        nearest_vertex = int(np.argmin(np.linalg.norm(vertices - point[0], axis=1)))
        vertex_sign = float(np.dot(point[0] - vertices[nearest_vertex], normals[nearest_vertex]))
        strict = check_sockets._strict_signed_distances(point, vertices, faces, normals)
        self.assertGreater(vertex_sign, 0.0)
        self.assertLess(float(strict[0]), 0.0)
        self.assertAlmostEqual(float(strict[0]), -0.1, places=8)
        outside = check_sockets._strict_signed_distances(
            np.array([[20., 20., 2.]]), vertices, faces, normals)
        self.assertGreater(float(outside[0]), 0.0)

    def test_every_counted_point_uses_strict_triangle_sign(self) -> None:
        # 第二点在三角 AABB 外，但按最近三角插值法线为负。曾用正的 AABB
        # 距离代替它，虽不改变全局 min，却会漏掉一个负点。
        vertices = np.array([[0., 0., 0.], [1., 0., 0.], [0., 1., 0.]])
        faces = np.array([[0, 1, 2]])
        normals = np.tile(np.array([0., 0., 1.]), (3, 1))
        points = np.array([[0.2, 0.2, 0.01], [2., 0.2, -0.5]])
        exact = check_sockets._strict_signed_distances(
            points, vertices, faces, normals)
        reference = check_sockets.common_signed_distance(
            points, vertices, faces, normals).distances_mu
        np.testing.assert_allclose(exact, [0.01, -1.1357816691600546], atol=1e-12)
        np.testing.assert_allclose(exact, reference, atol=1e-12)
        np.testing.assert_array_equal(np.signbit(exact), [False, True])
        np.testing.assert_array_equal(np.signbit(exact), np.signbit(reference))
        self.assertEqual(int(np.count_nonzero(exact < 0.0)), 1)

    def test_weapon_dynamic_penetration_levels_are_enforced(self) -> None:
        bind = {"gripDistanceMm": 0.0, "bladeAngleDeg": 0.0}
        for ratio, level, expected in ((0.005, "approved", True),
                                       (0.02, "draft", True),
                                       (0.0200001, "fail", False)):
            with self.subTest(ratio=ratio):
                self.assertEqual(check_sockets._weapon_level(ratio), level)
                passed, failures = check_sockets._passes(
                    "weapon", bind, {"level": level})
                self.assertEqual(passed, expected)
                self.assertEqual(bool(failures), not expected)

    def test_guard_peak_supersedes_only_legacy_narrow_end_check(self) -> None:
        fit = {"sheathed": True, "handleDetection": {
            "method": "guard-peak", "peakFraction": .2, "handleEnd": "min"}}
        old_only = {"level": "fail", "checks": [
            {"name": "prop.semanticDirection", "pass": False}]}
        self.assertTrue(check_sockets._reconcile_validate_direction(old_only, fit))
        self.assertEqual((old_only["level"], old_only["checks"][0]["pass"]),
                         ("approved", True))
        another = {"level": "fail", "checks": [
            {"name": "prop.semanticDirection", "pass": False},
            {"name": "budget.triangles", "pass": False}]}
        self.assertFalse(check_sockets._reconcile_validate_direction(another, fit))
        self.assertEqual(another["level"], "fail")

    def test_tilt_sweep_parallel_results_keep_candidate_order(self) -> None:
        ratios = [.013, .015, .006, .0016, .000008]
        metrics = [{"insideRatio": ratio, "insideVertexTotal": index,
                    "minSignedDistanceMm": {"min": -index, "median": index}}
                   for index, ratio in enumerate(ratios)]

        rows_stub = []
        for index, ((label, value), metric) in enumerate(zip(check_sockets.TILT_CANDIDATES, metrics)):
            rows_stub.append({"candidate": label, "restTiltDeg": value,
                              "level": check_sockets._weapon_level(metric["insideRatio"]),
                              **metric, "_animated": metric})
        with mock.patch.object(check_sockets, "_parallel_frame_sweep",
                               return_value=rows_stub):
            rows, _adjust, signed, selected = check_sockets._tilt_sweep(
                object(), object(), object(), {}, _socket_skeleton(), [])
        self.assertEqual([row["candidate"] for row in rows],
                         ["0", "20", "40", "60", "reverse"])
        self.assertEqual(signed, -150.0)
        self.assertIs(selected, metrics[-1])
        self.assertIsNone(check_sockets._ANIM_CONTEXT)

    def test_all_socket_failures_reject_status_and_cli(self) -> None:
        cases = (
            ("weapon-grip", "weapon", {"gripDistanceMm": 1.0, "bladeAngleDeg": 0.0},
             {"insideRatio": 0.0}),
            ("weapon-blade", "weapon", {"gripDistanceMm": 0.0, "bladeAngleDeg": 1.0},
             {"insideRatio": 0.0}),
            ("hat-inside", "hat", {"upAngleDeg": 0.0,
             "packedRayClearanceMm": {"min": 3.0}}, {"insideVertexCount": {"max": 1}}),
            ("pendant-inside", "pendant", {"upAngleDeg": 0.0},
             {"insideVertexCount": {"max": 1}}),
        )
        for name, prop_class, bind, animated in cases:
            with self.subTest(name=name):
                level, passed, failures = check_sockets._socket_result(
                    prop_class, bind, animated.copy())
                combined, status = check_sockets._combined_status("approved", level)
                self.assertFalse(passed); self.assertTrue(failures)
                self.assertEqual((level, combined, status), ("fail", "fail", "rejected"))
                with tempfile.TemporaryDirectory(prefix="tianshu-socket-status-") as directory:
                    root = Path(directory); manifest = root / "manifest.yaml"
                    manifest.write_text("- id: synthetic\n  status: candidate\n", encoding="utf-8")
                    check_sockets._update_manifest(root, "approved", level)
                    saved = check_sockets.yaml.safe_load(manifest.read_text(encoding="utf-8"))[0]
                    self.assertEqual(saved["status"], "rejected")
                    self.assertIn("联合 level=fail，status=rejected", saved["notes"])
                result = {"pass": False, "props": [{"id": name, "pass": False,
                          "bind": bind, "animated": animated, "level": level}]}
                with mock.patch.object(check_sockets, "check", return_value=result), \
                     mock.patch("builtins.print"):
                    code = check_sockets.main(["--template", "unused", "--props", "unused"])
                self.assertEqual(code, 2)

    def test_weapon_tilt_chooses_direction_toward_fingers(self) -> None:
        adjust, signed = normalize_prop.weapon_grip_adjust(_socket_skeleton(), 40.0)
        direction = quaternion_to_matrix(adjust["quat"]) @ np.array([0.0, 1.0, 0.0])
        self.assertEqual(signed, -40.0)
        self.assertGreater(direction[0], 0.0)
        self.assertGreater(float(np.dot(direction, [1, 0, 0])), 0.6)
        reverse, signed = normalize_prop.weapon_grip_adjust(_socket_skeleton(), -150.0)
        reverse_y = quaternion_to_matrix(reverse["quat"]) @ np.array([0.0, 1.0, 0.0])
        self.assertEqual(signed, -150.0)
        self.assertLess(float(reverse_y[1]), 0.0)

    def test_guard_peak_selects_handle_outside_guard_on_mesh(self) -> None:
        result = normalize_prop.normalize_mesh(
            _sheathed_sword(), "weapon", 1.0, 1.0, grip_ratio=.07)
        evidence = result.end_evidence
        self.assertEqual(result.selected_end, "low")
        self.assertEqual(evidence["method"], "guard-peak")
        self.assertLessEqual(evidence["chosen"]["distanceFromEndFraction"], .35)
        self.assertGreaterEqual(evidence["chosen"]["peakRatio"], 1.4)
        # 输出 -Y 是护手外侧的短柄，+Y 是长鞘；护手应落在握点附近。
        self.assertLess(float(result.mesh.positions[:, 1].min()), 0.0)
        self.assertGreater(float(result.mesh.positions[:, 1].max()), .8)
        guard_y = float(result.mesh.positions[:, 1].min() +
                        evidence["chosen"]["fraction"] * np.ptp(result.mesh.positions[:, 1]))
        self.assertLess(guard_y, .30)

    def test_guard_peak_uses_actual_three_twenty_forty_percent_positions(self) -> None:
        profile = np.ones(40); profile[12] = 2.0
        for actual, qualified in ((.03, False), (.20, True), (.40, False)):
            with self.subTest(actual=actual):
                fractions = np.full(40, np.nan); fractions[12] = actual
                axials = np.full(40, np.nan); axials[12] = actual
                selected, evidence = normalize_prop._guard_peak_end(
                    profile, fractions, axials)
                self.assertEqual(selected, "low" if qualified else None)
                self.assertEqual(evidence["method"],
                                 "guard-peak" if qualified else "narrow-end")
                candidate = evidence["chosen"] if qualified else evidence["candidates"][0]
                self.assertEqual(candidate["fraction"], actual)
                self.assertEqual(candidate["binCenterFraction"], .3125)

    def test_sheathed_sword_points_handle_forward_and_scabbard_down(self) -> None:
        positions = np.array([[-.02, 0, -.01], [.02, 1, .01]])
        adjust, offset_mm = normalize_prop.sheathed_sword_adjust(
            _socket_skeleton(), 35.0, positions)
        frame = quaternion_to_matrix(adjust["quat"]); scabbard = frame[:, 1]
        self.assertLess(scabbard[1], 0.0); self.assertLess(scabbard[2], 0.0)
        self.assertAlmostEqual(np.degrees(np.arcsin(abs(scabbard[1]))), 35.0, places=6)
        self.assertGreater(adjust["pos"][0], 0.0); self.assertGreater(offset_mm, 2.0)

    def test_sheathe_scan_keeps_35_when_not_fail(self) -> None:
        metric = {"insideRatio": .01, "level": "draft"}
        row = {"candidate": "35", "sheatheAngleDeg": 35.0,
               "insideRatio": .01, "level": "draft", "_animated": metric}
        with mock.patch.object(check_sockets, "_parallel_frame_sweep", return_value=[row]) as sweep:
            rows, _adjust, angle, _offset, selected, triggered, reason = check_sockets._sheathe_sweep(
                object(), object(), Mesh(np.zeros((3, 3)), np.array([0, 1, 2])),
                {}, _socket_skeleton(), [])
        self.assertEqual((angle, selected, triggered), (35.0, metric, False))
        self.assertIn("not triggered", reason); self.assertEqual(sweep.call_count, 1)

    def test_sheathe_scan_uses_full_range_only_after_35_fails(self) -> None:
        fail = {"candidate": "35", "sheatheAngleDeg": 35.0,
                "insideRatio": .03, "level": "fail", "_animated": {"insideRatio": .03}}
        full = [{"candidate": label, "sheatheAngleDeg": value,
                 "insideRatio": abs(value - 50) / 1000, "level": "approved",
                 "_animated": {"insideRatio": abs(value - 50) / 1000}}
                for label, value in check_sockets.SHEATHE_CANDIDATES]
        with mock.patch.object(check_sockets, "_parallel_frame_sweep", side_effect=[[fail], full]):
            rows, _adjust, angle, _offset, selected, triggered, reason = check_sockets._sheathe_sweep(
                object(), object(), Mesh(np.zeros((3, 3)), np.array([0, 1, 2])),
                {}, _socket_skeleton(), [])
        self.assertEqual((len(rows), angle, selected, triggered),
                         (6, 50.0, {"insideRatio": 0.0}, True))
        self.assertIn("complete 25°..50°", reason)
        bind = {"handleForwardDeltaMu": .4, "sheatheAngleDeg": angle,
                "sidePlaneDot": 0.0}
        policy = {"fallbackScanTriggered": triggered, "selectedAngleDeg": angle,
                  "allowedAngleDeg": [25.0, 50.0]}
        level, passed, failures = check_sockets._socket_result(
            "weapon", bind, selected, policy)
        self.assertEqual((level, passed, failures), ("approved", True, []))

    def test_sheathe_50_fails_without_fallback_scan(self) -> None:
        bind = {"handleForwardDeltaMu": .4, "sheatheAngleDeg": 50.0,
                "sidePlaneDot": 0.0}
        animated = {"insideRatio": .01}
        policy = {"fallbackScanTriggered": False, "selectedAngleDeg": 50.0,
                  "allowedAngleDeg": [30.0, 40.0]}
        level, passed, failures = check_sockets._socket_result(
            "weapon", bind, animated, policy)
        self.assertEqual((level, passed), ("fail", False))
        self.assertIn("鞘轴与水平夹角不在 30.0°～40.0°", failures)

    def test_hat_lift_reaches_three_mm_for_spherical_skull(self) -> None:
        mesh = normalize_prop.normalize_mesh(_cone(), "hat", 0.45, 1.5, size_axis="width").mesh
        rows = []
        radius = 0.055
        for y in np.linspace(-0.12, -0.01, 12):
            horizontal = np.sqrt(max(0.0, radius * radius - (y + 0.065) ** 2))
            rows.append({"yMu": float(y), "centerXMu": 0.0, "centerZMu": 0.0,
                         "radiusXMu": horizontal, "radiusZMu": horizontal})
        adjust, lift_mu, clearance_mm = normalize_prop.hat_grip_adjust(
            mesh, _socket_skeleton(), {"bone": "mixamorig:Head", "rows": rows})
        self.assertGreaterEqual(lift_mu, 0.0)
        self.assertAlmostEqual(adjust["pos"][1], lift_mu, places=9)
        self.assertAlmostEqual(clearance_mm, 3.0, delta=0.1)

    def test_hat_lift_skips_clearance_gap_when_inner_surface_switches(self) -> None:
        # 第二条射线先要求 lift=29 mm，落进第一条射线低内表面的
        # [28, 31) mm 禁区；求解器必须越过该面切换到 31 mm。
        rays = [np.array([-0.028, -0.022]), np.array([-0.026])]
        target = 0.003
        lift = max(0.0, max(target - float(ray.max()) for ray in rays))
        intervals = sorted((max(0.0, -float(hit)), target - float(hit))
                           for ray in rays for hit in ray if target - float(hit) > 0.0)
        for low, high in intervals:
            if low <= lift < high - 1e-12:
                lift = high
        gaps = normalize_prop._first_overhead_gaps(rays, lift)
        self.assertAlmostEqual(lift, 0.031, places=9)
        self.assertGreaterEqual(float(gaps.min()), target - 1e-12)

    def test_pendant_moves_out_by_half_thickness_plus_two_mm(self) -> None:
        positions = np.array([[-.1, -.1, -.01], [.1, .1, .01]])
        adjust, offset_mm = normalize_prop.pendant_grip_adjust(positions, np.array([0, 0, 1]), 2.0)
        self.assertTrue(np.allclose(adjust["pos"], [0, 0, .011]))
        self.assertAlmostEqual(offset_mm, 22.0, places=6)

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
                components, _ = normalize_prop._component_info(mesh)
                self.assertEqual(fit["stats"]["components"], len(components))
                # fit 的边统计来自 pack 前完整拓扑；pack 只换索引，最终减面拓扑另由 report 校验。
                anchor = normalize_prop._output_anchor(mesh.positions, fit["anchor"], 0.07)
                self.assertTrue(np.array_equal(fit["diagnostics"]["anchorPositionMu"], anchor))
                self.assertLess(np.linalg.norm(anchor), 1e-4)

    def test_weapon_handle_anchor_axis_and_scale(self) -> None:
        with tempfile.TemporaryDirectory(prefix="tianshu-prop-test-") as directory:
            root = Path(directory); raw = root / "sword_raw.glb"; _write_raw(raw, _sword())
            skeleton = root / "skeleton.json"
            skeleton_data = _socket_skeleton()
            skeleton_data["source"] = {"file": "synthetic-body.glb", "sha256": "synthetic"}
            skeleton.write_text(json.dumps(skeleton_data))
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

    def test_checked_in_sheathed_sword_uses_guard_peak_and_waist(self) -> None:
        root = Path(__file__).resolve().parents[3]
        fit_path = root / "assets/default/model3d/dressup/props/item_qingfeng_sword/fit.json"
        if not fit_path.is_file():
            return
        fit = json.loads(fit_path.read_text(encoding="utf-8"))
        self.assertEqual((fit.get("sheathed"), fit["socket"], fit["realSizeM"]),
                         (True, "waistL", 0.9))
        detection = fit["handleDetection"]
        self.assertEqual((detection["method"], detection["handleEnd"]),
                         ("guard-peak", "min"))
        self.assertGreaterEqual(detection["peakFraction"], .05)
        self.assertLessEqual(detection["peakFraction"], .35)
        evidence = fit["diagnostics"]["handleEndEvidence"]
        self.assertEqual((evidence["method"], evidence["selectedEnd"]),
                         ("guard-peak", "high"))
        self.assertEqual(fit["diagnostics"]["selectedEnd"], "high")
        chosen = evidence["chosen"]
        self.assertEqual(chosen["selectedEnd"], "high")
        self.assertLessEqual(chosen["distanceFromEndFraction"], .35)
        mesh = load_glb(fit_path.with_name("item_qingfeng_sword.glb")).mesh()
        y = np.asarray(mesh.positions[:, 1], dtype=float); peak = detection["peakAxialMu"]
        self.assertLess(peak - float(y.min()), float(y.max()) - peak)
        self.assertLessEqual(float(y.min()), 0.0); self.assertLessEqual(0.0, peak)
        _mask, geometry = check_sockets._weapon_mask(check_sockets._used_mesh(
            fit_path.with_name("item_qingfeng_sword.glb")), fit)
        self.assertEqual(geometry["source"], "fit.handleDetection")
        self.assertEqual(geometry["totalVertices"],
                         geometry["handleSegmentVertices"] + geometry["bladeSegmentVertices"])
        self.assertGreater(geometry["verticesPerFrame"], 0)

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
