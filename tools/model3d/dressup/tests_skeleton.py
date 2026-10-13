#!/usr/bin/env python3
"""A2 骨架派生与规范化的无网络合成测试。"""

from __future__ import annotations

import copy
from contextlib import redirect_stderr, redirect_stdout
from hashlib import sha256
import io
import json
import math
from pathlib import Path
import shutil
import sys
import tempfile

import numpy as np
from scipy.special import ellipe

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import compose_matrix, matrix_to_quaternion, nearest_triangle, quaternion_to_matrix  # noqa: E402
from export_skeleton import (REGION_IDS, SECTION_HEIGHT_FRACTION, SkeletonError, _check_neck_ring,
                             _check_section_surface, _flex_axis, _grip_frame, _grip_point, _plane_basis, _rotation_part,
                             _socket, _surface_vertex,
                             derive_neck_ring, derive_regions, derive_torso_socket_surfaces, embed_regions,
                             find_neck_ring, fit_ellipse,
                             main as export_main)  # noqa: E402
from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb  # noqa: E402
from normalize_rig import facing_yaw, normalize, strip_constant_tracks  # noqa: E402


def _assert_close(actual, expected, tolerance=1e-6) -> None:
    if not np.allclose(actual, expected, atol=tolerance, rtol=0):
        raise AssertionError(f"{actual!r} != {expected!r}")


def test_region_mapping() -> None:
    mesh = Mesh(np.zeros((4, 3)), np.array([0, 1, 2, 1, 2, 3]), joints=np.array([[0, 1, 0, 0], [0, 1, 0, 0],
                     [1, 0, 0, 0], [1, 0, 0, 0]], dtype=np.uint16), weights=np.array([[.8, .2, 0, 0], [.6, .4, 0, 0],
                     [.9, .1, 0, 0], [.7, .3, 0, 0]], dtype=np.float32))
    regions, mapping, cross, triangles = derive_regions(mesh, ["mixamorig:Head", "mixamorig:Neck"])
    assert mapping["mixamorig:Head"] == "head"
    assert regions.tolist() == [REGION_IDS["head"], REGION_IDS["head"], REGION_IDS["neck"], REGION_IDS["neck"]]
    _assert_close(cross, 1.0)
    assert triangles.tolist() == [REGION_IDS["head"], REGION_IDS["neck"]]


def test_neck_ring_and_ellipse() -> None:
    angles = np.linspace(0, 2 * math.pi, 96, endpoint=False)
    axis = np.array([0.31, 0.91, -0.27]); axis, plane_u, plane_v = _plane_basis(axis)
    turn = math.radians(31); ellipse_axes = np.array([[math.cos(turn), -math.sin(turn)],
                                                       [math.sin(turn), math.cos(turn)]])
    rings, weights, primary = [], [], []
    for height, radii, dominant in ((0.008, (0.050, 0.020), False), (0.014, (0.030, 0.026), True)):
        section = np.column_stack((radii[0] * np.cos(angles), radii[1] * np.sin(angles))) @ ellipse_axes.T
        rings.append(axis * height + section[:, :1] * plane_u + section[:, 1:] * plane_v)
        weights.append(np.ones(len(angles)) * .9); primary.append(np.ones(len(angles), dtype=np.uint8) * dominant)
    points = np.concatenate(rings); result = find_neck_ring(points, np.concatenate(weights), np.concatenate(primary), axis, slice_half=.0004)
    _assert_close(result["height"], .014); _assert_close(np.sort(result["radii"]), [.026, .030], 5e-4)
    planar = np.column_stack((rings[1] @ plane_u, rings[1] @ plane_v))
    center, radii, fitted_axes = fit_ellipse(planar + [0.01, -0.02])
    _assert_close(center, [.01, -.02]); _assert_close(np.sort(radii), [.026, .030], 5e-4)
    assert abs(float(np.dot(fitted_axes[0], ellipse_axes[:, 0]))) > .99


def test_neck_ring_skips_wide_trapezius_slice() -> None:
    """T4b：最低的 Neck 主导近圆段偏宽（截到斜方肌）时，取其上方第一段半径在区间内的；都偏宽时仍取最低段。"""
    angles = np.linspace(0, 2 * math.pi, 96, endpoint=False)
    axis, plane_u, plane_v = _plane_basis(np.array([0.0, 1.0, 0.0]))
    def build(specs):
        rings, weights, primary = [], [], []
        for height, (rx, rz) in specs:
            section = np.column_stack((rx * np.cos(angles), rz * np.sin(angles)))
            rings.append(axis * height + section[:, :1] * plane_u + section[:, 1:] * plane_v)
            weights.append(np.ones(len(angles))); primary.append(np.ones(len(angles), dtype=np.uint8))
        return np.concatenate(rings), np.concatenate(weights), np.concatenate(primary)
    points, weights, primary = build([(0.014, (0.050, 0.042)), (0.020, (0.036, 0.030))])
    result = find_neck_ring(points, weights, primary, axis, slice_half=.0004)
    _assert_close(result["height"], .020); _assert_close(np.sort(result["radii"]), [.030, .036], 5e-4)
    points, weights, primary = build([(0.014, (0.050, 0.042)), (0.020, (0.049, 0.041))])
    result = find_neck_ring(points, weights, primary, axis, slice_half=.0004)
    _assert_close(result["height"], .014)


def _tube(radii=(.036, .030), center=(0., 0.), length=.08, *, closed=True, count=256) -> Mesh:
    angles = np.linspace(0, 2 * math.pi if closed else 1.6 * math.pi, count, endpoint=False)
    points = np.array([[center[0] + radii[0] * math.cos(a), y, center[1] + radii[1] * math.sin(a)]
                       for y in (0, length * SECTION_HEIGHT_FRACTION, length) for a in angles])
    faces = []
    for row in range(2):
        for index in range(count if closed else count - 1):
            a, b = row * count + index, row * count + (index + 1) % count
            faces.extend([[a, b, a + count], [b, b + count, a + count]])
    weights = np.tile([.60, .20, .15, .05], (len(points), 1))
    joints = np.tile([0, 2, 3, 4], (len(points), 1)); joints[count:, 1:] = [1, 2, 5]
    return Mesh(points, np.asarray(faces).reshape(-1), joints=joints, weights=weights)


class _SectionRig:
    def __init__(self, mesh: Mesh, length=.08):
        self.length = length; self.value = mesh
        self.json = {"nodes": [{"name": f"mixamorig:{name}"} for name in
                                ("Neck", "Head", "Spine2", "LeftShoulder", "RightShoulder", "Hips")]}
    def skin(self): return type("Skin", (), {"joints": tuple(range(6))})()
    def mesh(self): return self.value
    def world_matrix(self, node): return compose_matrix([0, self.length if node == 1 else 0, 0])


def _tube_ring(mesh: Mesh, length=.08, fraction=None):
    glb = _SectionRig(mesh, length)
    slots = {node["name"]: index for index, node in enumerate(glb.json["nodes"])}
    source = None if fraction is None else {"neckRing": {"mode": "section", "heightFraction": fraction}}
    return derive_neck_ring(glb, mesh, mesh.positions, slots, ring_mode="section", ring_from=source, m_per_mu=1.7)


def test_section_ellipse_and_weights() -> None:
    # 解析椭圆周长 = 4a E(1-b²/a²)；测试圆、偏心椭圆及非顶点高度的重心权重。
    for radii in ((.030, .030), (.036, .030), (.042, .034)):
        mesh = _tube(radii); ring = _tube_ring(mesh, fraction=.13)
        _assert_close(list(ring["radiusMu"].values()), radii, min(radii) * .005)
        exact = 4 * radii[0] * ellipe(1 - (radii[1] / radii[0]) ** 2) * 1700
        assert abs(ring["perimeterMm"] / exact - 1) < .005
        samples = np.asarray([point["pos"] for point in ring["profile"]])
        nearest = nearest_triangle(samples, mesh.positions, mesh.indices.reshape(-1, 3))
        assert nearest.distances_mu.max() * 1700 < .0001
        for point, index, bary in zip(ring["profile"], nearest.face_indices, nearest.barycentric):
            corners = mesh.indices.reshape(-1, 3)[index]; dense = np.zeros(6)
            np.add.at(dense, mesh.joints[corners].reshape(-1), (bary[:, None] * mesh.weights[corners]).reshape(-1))
            order = np.argsort(-dense, kind="stable")[:4]; dense /= dense[order].sum()
            names = [node["name"] for node in _SectionRig(mesh).json["nodes"]]
            assert set(point["weights"]) == {names[i] for i in order}
            _assert_close(list(point["weights"].values()), dense[order], 2e-6)
            _assert_close(point["normal"][1], math.sin(math.radians(15)), 1e-7)
        _check_neck_ring(ring)


def test_section_selects_axis_loop() -> None:
    # 含轴的偏心颈环、较大的含轴外环、较小的不含轴环、未闭合弧，均穿过同一切面。
    parts = [_tube(center=(.005, -.004)), _tube((.065, .060)),
             _tube((.01, .009), center=(.10, 0)), _tube((.04, .031), center=(-.10, 0), closed=False)]
    offsets = np.cumsum([0] + [len(part.positions) for part in parts])
    mesh = Mesh(np.concatenate([p.positions for p in parts]),
                np.concatenate([p.indices + offset for p, offset in zip(parts, offsets)]),
                joints=np.concatenate([p.joints for p in parts]), weights=np.concatenate([p.weights for p in parts]))
    ring = _tube_ring(mesh); _assert_close(ring["centerLocalMu"], [.005, .012, -.004], 2e-6)
    _assert_close(list(ring["radiusMu"].values()), [.036, .030], 2e-6)
    for invalid in (_tube(closed=False), _tube(center=(.10, 0))):
        try: _tube_ring(invalid)
        except SkeletonError: pass
        else: raise AssertionError("没有含轴闭环的截面必须失败")


def test_section_oblique_axis_and_uv_seams() -> None:
    mesh = _tube(); faces = mesh.indices.reshape(-1, 3)
    angles = (.23, .67, 1.19)
    for angle in angles:
        c, s = math.cos(angle), math.sin(angle); rotation = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
        # 每面独立三点，模拟所有边都被 UV 缝拆点；切面穿过管中段顶点与共面边。
        split = Mesh((mesh.positions @ rotation.T)[faces].reshape(-1, 3), np.arange(faces.size),
                     joints=mesh.joints[faces].reshape(-1, 4), weights=mesh.weights[faces].reshape(-1, 4))
        rig = _SectionRig(split)
        rig.world_matrix = lambda node: compose_matrix((rotation @ np.array([0., .08, 0])) if node == 1 else [0, 0, 0])
        slots = {node["name"]: i for i, node in enumerate(rig.json["nodes"])}
        ring = derive_neck_ring(rig, split, split.positions, slots, ring_mode="section")
        _assert_close(ring["localYMu"], .012); _assert_close(ring["axisLocal"], rotation[:, 1], 1e-7)
        _assert_close(list(ring["radiusMu"].values()), [.036, .030], 2e-6)
        points = np.asarray([point["pos"] for point in ring["profile"]])
        _assert_close(points @ rotation[:, 1], np.full(64, .012), 1e-7)
        assert nearest_triangle(points, split.positions, split.indices.reshape(-1, 3)).distances_mu.max() < 1e-7


def test_section_height_scales_and_check_rejects_damage() -> None:
    for length in (.04, .08, .16):
        mesh = _tube(length=length); ring = _tube_ring(mesh, length)
        _assert_close(ring["localYMu"], SECTION_HEIGHT_FRACTION * length)
        _assert_close(list(ring["radiusMu"].values()), [.036, .030], 2e-6)
        inherited = _tube_ring(mesh, length, fraction=.20)
        _assert_close(inherited["localYMu"], .20 * length)
        data = {"neckRing": ring, "mPerMu": 1.7}
        assert _check_section_surface(data, _SectionRig(mesh, length)) < .0001
        mutations = [lambda r: r["profile"][0]["pos"].__setitem__(0, .10),
                     lambda r: r["profile"].reverse(), lambda r: r.__setitem__("heightFraction", .1),
                     lambda r: r.__setitem__("perimeterMm", 1),
                     lambda r: r["profile"][0]["weights"].__setitem__("mixamorig:Neck", .1)]
        for mutate in mutations:
            damaged = copy.deepcopy(data); mutate(damaged["neckRing"])
            try: _check_section_surface(damaged, _SectionRig(mesh, length))
            except SkeletonError: pass
            else: raise AssertionError("section 校验接受损坏截面")


class _SocketGLB:
    def __init__(self) -> None:
        self.skin_value = type("Skin", (), {"joints": (0,)})()
        self.json = {"nodes": [{"name": "bone"}]}
        self.transform = compose_matrix([1.2, -0.4, 2.0], matrix_to_quaternion(np.array([[0., 0., 1.], [0., 1., 0.], [-1., 0., 0.]])))
    def skin(self): return self.skin_value
    def world_matrix(self, _node): return self.transform


def test_socket_round_trip() -> None:
    glb = _SocketGLB(); local = np.array([.2, .3, -.1]); world = (glb.transform @ np.r_[local, 1])[:3]
    result = _socket(glb, "bone", world, np.array([0., 0., 1.]))
    _assert_close(result["pos"], local)
    _assert_close((glb.transform @ np.r_[result["pos"], 1])[:3], world)
    frame = _rotation_part(glb.transform) @ quaternion_to_matrix(result["quat"])
    _assert_close(frame, np.eye(3), 1e-7)
    _assert_close(result["normalLocal"], [0, 0, 1])


def test_grip_frames_follow_projected_pinky_to_index() -> None:
    finger = np.array([0.2, 0.95, -0.1])
    for side, blade, palm in (
            ("L", np.array([1.0, 0.3, 0.2]), np.array([0.1, 0.1, 1.0])),
            ("R", np.array([-1.0, 0.3, 0.2]), np.array([-0.1, 0.1, 1.0]))):
        frame = _grip_frame(blade, finger, palm)
        projected = blade - finger / np.linalg.norm(finger) * np.dot(blade, finger / np.linalg.norm(finger))
        projected /= np.linalg.norm(projected)
        _assert_close(frame[:, 1], projected)
        _assert_close(frame.T @ frame, np.eye(3))
        _assert_close(np.linalg.det(frame), 1.0)
        assert np.dot(frame[:, 2], palm) > 0, side


def test_grip_surface_and_flex_axes() -> None:
    center = np.array([.1, .2, .3]); normal = np.array([0., 0., 2.])
    grip = _grip_point(center, normal)
    _assert_close(grip, center + [0, 0, .0293]); _assert_close(np.linalg.norm(grip - center), .0293)
    positions = np.array([[0, 0, 0], [1, 0, 0], [.999, .001, 0], [-1, 0, 0]], dtype=float)
    normals = np.array([[0, 1, 0], [.8, .6, 0], [.6, .8, 0], [-1, 0, 0]], dtype=float)
    point, surface_normal = _surface_vertex(positions, normals, np.arange(4), np.array([1, 0, 0]))
    _assert_close(point, [1, 0, 0]); assert surface_normal[1] > .6
    first = _flex_axis(np.array([1., 0, 0]), np.array([0., 0, 1]), np.eye(4))
    second = _flex_axis(np.array([0., 1, 0]), np.array([1., 0, 0.]), np.eye(4))
    _assert_close(np.linalg.norm(first), 1); _assert_close(np.linalg.norm(second), 1)
    assert not np.allclose(first, second)


class _TorsoSocketRig:
    def __init__(self) -> None:
        self.json = {"nodes": [{"name": f"mixamorig:{name}"} for name in ("Hips", "Spine", "Spine2")]}
        self.skin_value = type("Skin", (), {"joints": (0, 1, 2)})()
    def skin(self): return self.skin_value
    def world_matrix(self, node): return compose_matrix([0, (0, .10, .20)[node], 0])


def _torso_socket_fixture() -> tuple[_TorsoSocketRig, Mesh, np.ndarray, np.ndarray, dict[str, int], np.ndarray]:
    """腰侧有下垂 A 字臂，Spine 权重只刷后背，右胸比左胸更凸。"""
    count = 16; angles = np.linspace(0, 2 * math.pi, count, endpoint=False)
    rings, normals = [], []
    for y, radius_x, radius_z in ((0, .12, .08), (.05, .10, .07), (.10, .08, .06),
                                          (.15, .10, .07), (.20, .12, .08)):
        rings.extend([[radius_x * math.cos(a), y, radius_z * math.sin(a)] for a in angles])
        normals.extend([[math.cos(a), 0, math.sin(a)] for a in angles])
    faces = []
    for row in range(4):
        for index in range(count):
            following = (index + 1) % count; a = row * count + index; b = row * count + following
            faces.extend([[a, b, a + count], [b, b + count, a + count]])
    # A 字臂垂到腰两侧；给真实三角，但区域不是躯干，不能参与腰截面或腰带候选。
    for side in (-1, 1):
        start = len(rings); rings.extend([[side * .17, .095, -.015], [side * .17, .095, .015],
                                          [side * .17, .105, -.015], [side * .17, .105, .015]])
        normals.extend([[side, 0, 0]] * 4); faces.extend([[start, start + 1, start + 2],
                                                          [start + 1, start + 3, start + 2]])
    chest = [[.08, .16, .14], [-.09, .16, .17], [.06, .16, -.08], [-.06, .16, -.08]]
    chest_normals = [[.45, 0, .89], [-.45, 0, .89], [.2, 0, -.98], [-.2, 0, -.98]]
    chest_start = len(rings); rings.extend(chest); normals.extend(chest_normals)
    positions = np.asarray(rings, dtype=np.float32); surface_normals = np.asarray(normals, dtype=np.float32)
    joints = np.zeros((len(positions), 4), dtype=np.uint16); weights = np.zeros((len(positions), 4), dtype=np.float32)
    weights[:, 0] = 1
    # 每圈后半部才有 Spine 权重，模拟 Tripo 把 Spine 壳只刷到后背。
    for row in range(5):
        rear = row * count + np.flatnonzero(np.sin(angles) < -.35)
        joints[rear, 0] = 1
    joints[chest_start:, 0] = 2
    mesh = Mesh(positions, np.asarray(faces).reshape(-1), normals=surface_normals, joints=joints, weights=weights)
    regions = np.full(len(positions), REGION_IDS["torsoLower"], dtype=np.uint8)
    regions[5 * count:chest_start] = REGION_IDS["upperArmL"]
    regions[chest_start:] = REGION_IDS["torsoUpper"]
    slots = {f"mixamorig:{name}": index for index, name in enumerate(("Hips", "Spine", "Spine2"))}
    return _TorsoSocketRig(), mesh, positions, surface_normals, slots, regions


def test_waist_band_ignores_arms_and_back_only_spine_weights() -> None:
    rig, mesh, positions, normals, slots, regions = _torso_socket_fixture()
    legacy, _, _ = derive_torso_socket_surfaces(rig, mesh, positions, normals, slots)
    band, waist_y, perimeter = derive_torso_socket_surfaces(
        rig, mesh, positions, normals, slots, socket_mode="waist-band", regions=regions, m_per_mu=1)
    assert legacy["waistL"][0][2] < -.02
    _assert_close(band["waistL"][0], [.08, .10, 0], 1e-6)
    _assert_close(band["waistR"][0], [-.08, .10, 0], 1e-6)
    assert band["waistL"][1][0] > .95 and band["waistR"][1][0] < -.95
    _assert_close(waist_y, .10); assert .43 < float(perimeter) < .45
    rig.world_matrix = lambda node: compose_matrix([0, (.10, .10, .20)[node], 0])
    try: derive_torso_socket_surfaces(
        rig, mesh, positions, normals, slots, socket_mode="waist-band", regions=regions, m_per_mu=1)
    except SkeletonError as exc: assert "不足 10 mm" in str(exc)
    else: raise AssertionError("端点处的最小腰截面必须失败")


def test_waist_band_chest_stays_on_character_left() -> None:
    rig, mesh, positions, normals, slots, regions = _torso_socket_fixture()
    legacy, _, _ = derive_torso_socket_surfaces(rig, mesh, positions, normals, slots)
    band, _, _ = derive_torso_socket_surfaces(
        rig, mesh, positions, normals, slots, socket_mode="waist-band", regions=regions, m_per_mu=1)
    assert legacy["chest"][0][0] < 0 and band["chest"][0][0] > 0
    _assert_close(legacy["back"][0], band["back"][0])


def _make_rig(path: Path) -> None:
    builder = GLBBuilder()
    hips = builder.add_node(name="mixamorig:Hips", translation=[0, 0, 0])
    spine = builder.add_node(name="mixamorig:Spine2", translation=[0, 1, 0])
    left = builder.add_node(name="mixamorig:LeftShoulder", translation=[-1, 0, 0])
    right = builder.add_node(name="mixamorig:RightShoulder", translation=[1, 0, 0])
    builder.document["nodes"][hips]["children"] = [spine]
    builder.document["nodes"][spine]["children"] = [left, right]
    ibm = np.stack([np.linalg.inv(compose_matrix()), np.linalg.inv(compose_matrix([0, 1, 0])),
                    np.linalg.inv(compose_matrix([-1, 1, 0])), np.linalg.inv(compose_matrix([1, 1, 0]))])
    ibm_id = builder.add_accessor(ibm, component_type=5126, type_name="MAT4")
    builder.add_skin([hips, spine, left, right], ibm_id, skeleton=hips)
    times = np.array([0., 1.], dtype=np.float32); translations = np.array([[0, 0, 0], [0, 0, 0]], dtype=np.float32)
    scales = np.ones((2, 3), dtype=np.float32); rotations = np.array([[0, 0, 0, 1], [0, 0, 0, 1]], dtype=np.float32)
    builder.add_animation("idle", [{"node": hips, "path": "translation", "timesSec": times, "values": translations},
                          {"node": spine, "path": "translation", "timesSec": times, "values": translations},
                          {"node": spine, "path": "scale", "timesSec": times, "values": scales},
                          {"node": spine, "path": "rotation", "timesSec": times, "values": rotations}])
    mesh = Mesh(np.array([[-1, 0, 0], [1, 0, 0], [-1, 1, 0], [1, 1, 0]], dtype=np.float32),
                np.array([0, 1, 2, 1, 3, 2]), joints=np.array([[0, 0, 0, 0], [0, 0, 0, 0],
                [1, 0, 0, 0], [1, 0, 0, 0]], dtype=np.uint16), weights=np.array([[1, 0, 0, 0]] * 4, dtype=np.float32),
                primitives=[PrimitiveRange(0, 4, 0, 6, None)])
    mesh_node = builder.add_node(name="body", mesh=builder.add_mesh(mesh), skin=0)
    builder.add_scene([hips, mesh_node]); builder.write(path)


def test_track_strip_and_yaw() -> None:
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-test-") as directory:
        path = Path(directory) / "rig.glb"; _make_rig(path); glb = load_glb(path)
        # left-right is reversed, hence cross(shoulder, spine) faces -Z and requires 180 degrees.
        yaw, facing = facing_yaw(glb); _assert_close(abs(yaw), 180.0); _assert_close(facing, [0, 0, -1])
        removed = strip_constant_tracks(glb.json, glb)
        assert removed == {"scale": 1, "translation": 1, "total": 2}
        paths = [item["target"]["path"] for item in glb.json["animations"][0]["channels"]]
        assert paths == ["translation", "rotation"]
        target = Path(directory) / "normalized.glb"; report = normalize(path, target)
        assert abs(report["yawAppliedDeg"]) == 180.0
        normalized_yaw, normalized_facing = facing_yaw(load_glb(target))
        _assert_close(normalized_yaw, 0.0); _assert_close(normalized_facing, [0, 0, 1])


def test_region_glb_attribute() -> None:
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-region-") as directory:
        path = Path(directory) / "rig.glb"; _make_rig(path); original = load_glb(path)
        names = [original.json["nodes"][node]["name"] for node in original.skin().joints]
        ibm = original.skin().inverse_bind_matrices.copy(); regions = np.array([0, 1, 2, 3], dtype=np.uint8)
        assert embed_regions(path, regions); assert not embed_regions(path, regions)
        loaded = load_glb(path); _assert_close(loaded.mesh().regions, regions)
        assert [loaded.json["nodes"][node]["name"] for node in loaded.skin().joints] == names
        _assert_close(loaded.skin().inverse_bind_matrices, ibm)
        accessor = loaded.json["accessors"][loaded.json["meshes"][0]["primitives"][0]["attributes"]["_REGION"]]
        assert accessor["componentType"] == 5121 and accessor["type"] == "SCALAR"


def test_check_rejects_nested_damage() -> None:
    source = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates/tpl_f_medium"
    if not (source / "skeleton.json").exists(): return
    mutations = [
        lambda data: data["bindWorld"].pop(data["joints"][0]),
        lambda data: data["measures"].pop("handLengthMu"),
        lambda data: data["neckRing"]["profile"][0].pop("pos"),
        lambda data: data["neckRing"].__setitem__("sha256", "0" * 64),
        lambda data: data["neckRing"]["profile"][0]["weights"].pop("mixamorig:Neck"),
        lambda data: data["sockets"].__setitem__("gripR", {}),
        lambda data: data["sockets"]["chest"].pop("normalLocal"),
        lambda data: data["sockets"]["waistBack"].__setitem__("bone", "mixamorig:Head"),
        lambda data: data["sockets"]["waistBack"].__setitem__("pos", data["sockets"]["waistL"]["pos"]),
        lambda data: data.__setitem__("socketMode", "waist-band"),
        lambda data: data["fingerPose"]["fist"].pop(next(iter(data["fingerPose"]["fist"]))),
        lambda data: data["regions"]["ids"].pop("head"),
        lambda data: data["skullProfile"].__setitem__("sha256", "0" * 64),
    ]
    baseline = json.loads((source / "skeleton.json").read_text())
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-check-") as directory:
        out = Path(directory); shutil.copy2(source / "regions.npy", out / "regions.npy")
        shutil.copy2(source / "skull_profile.json", out / "skull_profile.json")
        for mutate in mutations:
            damaged = copy.deepcopy(baseline); mutate(damaged)
            (out / "skeleton.json").write_text(json.dumps(damaged))
            with redirect_stdout(io.StringIO()), redirect_stderr(io.StringIO()):
                code = export_main(["--check", "--out", str(out)])
            assert code != 0, "--check 接受了损坏的嵌套字段"


def test_real_normalize_round_trip() -> None:
    source = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates/tpl_f_medium/body.glb"
    if not source.exists(): return
    with tempfile.TemporaryDirectory(prefix="tianshu-a2-real-") as directory:
        target = Path(directory) / "body.glb"; report = normalize(source, target)
        # 首次处理剥 387 条；已规范化正本重跑必须幂等（剥 0 条）。
        assert report["tracksRemoved"] in ({"scale": 195, "translation": 192, "total": 387},
                                               {"scale": 0, "translation": 0, "total": 0})
        assert report["restBindMaxDiffAfter"] < 1e-5
        assert sum(len(a["channels"]) for a in load_glb(target).json["animations"]) == 198


def test_legacy_exports_byte_identical() -> None:
    templates = Path(__file__).resolve().parents[3] / "assets/default/model3d/dressup/templates"
    for name in ("tpl_f_medium", "tpl_f_small", "tpl_f_tall", "tpl_m_medium", "tpl_m_lean", "tpl_m_bulk"):
        source = templates / name; expected_bytes = (source / "skeleton.json").read_bytes()
        expected = json.loads(expected_bytes); body_bytes = (source / "body.glb").read_bytes()
        with tempfile.TemporaryDirectory(prefix="tianshu-t5b-legacy-") as directory:
            out = Path(directory); (out / "body.glb").write_bytes(body_bytes)
            # 默认模式通过 CLI 走实际导出；先复制 body，避免 embed_regions 写正本。
            arguments = ["--body", str(out / "body.glb"), "--out", str(out),
                         "--default-height-m", str(expected["defaultHeightM"]), "--json"]
            if expected["neckRing"].get("mode") == "section": arguments.extend(["--ring-mode", "section"])
            with redirect_stdout(io.StringIO()):
                code = export_main(arguments)
            assert code == 0
            actual = json.loads((out / "skeleton.json").read_bytes())
            actual["source"]["file"] = expected["source"]["file"]
            assert (json.dumps(actual, ensure_ascii=False, indent=2) + "\n").encode() == expected_bytes, name
            assert json.dumps(actual["neckRing"]) == json.dumps(expected["neckRing"]), name
            for filename in ("regions.npy", "skull_profile.json", "body.glb"):
                assert (out / filename).read_bytes() == (source / filename).read_bytes(), (name, filename)
        assert (source / "body.glb").read_bytes() == body_bytes
    f2_legacy_sha = {"tpl_f2_medium": "bdc6a4ae59eb2667397b78e2d99ba1abf9bed49ed41c99839eb582377f8c04c1",
                     "tpl_f2_small": "d3d9d764d40b19e44386d4e8b5d178f9dcfa2ba31b5dcae83a3934dc94195677",
                     "tpl_f2_tall": "66b981e07439961cb79cc105df905b0b8b84880042f97f08bc5c830eb397f57d"}
    for name, expected_sha in f2_legacy_sha.items():
        source = templates / name; body_bytes = (source / "body.glb").read_bytes()
        expected = json.loads((source / "skeleton.json").read_text())
        with tempfile.TemporaryDirectory(prefix="tianshu-t6-f2-legacy-") as directory:
            out = Path(directory)
            arguments = ["--body", str(source / "body.glb"), "--out", str(out),
                         "--default-height-m", str(expected["defaultHeightM"]), "--ring-mode", "section", "--json"]
            if name != "tpl_f2_medium":
                arguments.extend(["--ring-from", str(templates / "tpl_f2_medium/skeleton.json")])
            with redirect_stdout(io.StringIO()): code = export_main(arguments)
            actual = json.loads((out / "skeleton.json").read_text()); actual["source"]["file"] = expected["source"]["file"]
            rendered = (json.dumps(actual, ensure_ascii=False, indent=2) + "\n").encode()
            assert code == 0 and sha256(rendered).hexdigest() == expected_sha, name
            for filename in ("regions.npy", "skull_profile.json"):
                assert (out / filename).read_bytes() == (source / filename).read_bytes(), (name, filename)
        assert (source / "body.glb").read_bytes() == body_bytes


def main() -> int:
    tests = [test_region_mapping, test_neck_ring_and_ellipse, test_neck_ring_skips_wide_trapezius_slice, test_socket_round_trip,
             test_grip_frames_follow_projected_pinky_to_index, test_grip_surface_and_flex_axes,
             test_waist_band_ignores_arms_and_back_only_spine_weights, test_waist_band_chest_stays_on_character_left,
             test_track_strip_and_yaw, test_region_glb_attribute, test_check_rejects_nested_damage, test_real_normalize_round_trip,
             test_section_ellipse_and_weights, test_section_selects_axis_loop,
             test_section_oblique_axis_and_uv_seams, test_section_height_scales_and_check_rejects_damage,
             test_legacy_exports_byte_identical]
    for test in tests:
        test(); print(f"PASS {test.__name__}")
    print(f"{len(tests)}/{len(tests)} tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
