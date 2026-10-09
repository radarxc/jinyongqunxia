#!/usr/bin/env python3
"""fit_garment/refit_template 的无框架合成测试。"""
from __future__ import annotations

import json
import math
from pathlib import Path
import sys
import tempfile
import traceback

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fit_garment import (GarmentGateError, SurfaceIndex, _signed_distance_from_query, align_joints,
                         align_landmarks, clear_bind_penetration, derive_regions, fit_file, edge_weight_blend,
                         hide_regions, load_world_mesh, mm_to_mu, push_out, transfer_weights,
                         vertex_normals)  # noqa: E402
from common import nearest_triangle, signed_distance  # noqa: E402
from glb_io import GLB, GLBBuilder, Mesh, PrimitiveRange, Skin, load_glb, write_skinned_glb  # noqa: E402
from refit_template import main as refit_main, refit_file, refit_positions  # noqa: E402


def cylinder(radius: float, ys: tuple[float, ...], sides: int = 24) -> tuple[np.ndarray, np.ndarray]:
    points = np.asarray([[radius * math.cos(2 * math.pi * i / sides), y,
                          radius * math.sin(2 * math.pi * i / sides)] for y in ys for i in range(sides)])
    faces = []
    for row in range(len(ys) - 1):
        for i in range(sides):
            a = row * sides + i; b = row * sides + (i + 1) % sides
            c = (row + 1) * sides + i; d = (row + 1) * sides + (i + 1) % sides
            faces.extend(((a, c, b), (b, c, d)))
    return points, np.asarray(faces, dtype=np.int64)


def assert_serialized_topology(before: Mesh, after: Mesh) -> None:
    """独立按全部原始非零面/有效边检查已序列化 POSITION。"""
    faces = before.indices.reshape(-1, 3).astype(np.int64)
    assert np.array_equal(before.indices, after.indices)
    old = np.asarray(before.positions[faces], dtype=np.float64)
    new = np.asarray(after.positions[faces], dtype=np.float64)
    old_normal = np.cross(old[:, 1] - old[:, 0], old[:, 2] - old[:, 0])
    new_normal = np.cross(new[:, 1] - new[:, 0], new[:, 2] - new[:, 0])
    old_area = np.linalg.norm(old_normal, axis=1); new_area = np.linalg.norm(new_normal, axis=1)
    considered = np.isfinite(old_area) & (old_area > 0.0)
    degenerate = considered & (~np.isfinite(new_area) | (new_area == 0.0))
    flipped = considered & ~degenerate & (np.einsum("ij,ij->i", old_normal, new_normal) < 0.0)
    old_edges = np.linalg.norm(old[:, [1, 2, 0]] - old[:, [0, 1, 2]], axis=2)
    new_edges = np.linalg.norm(new[:, [1, 2, 0]] - new[:, [0, 1, 2]], axis=2)
    valid = np.isfinite(old_edges) & (old_edges > 0.0)
    ratio = np.divide(new_edges, old_edges, out=np.ones_like(new_edges), where=valid)
    good = considered & np.all(~valid | (np.isfinite(ratio) & (ratio >= 0.7) & (ratio <= 1.4)), axis=1)
    assert np.count_nonzero(flipped) == 0 and np.count_nonzero(degenerate) == 0
    assert np.count_nonzero(good) / np.count_nonzero(considered) >= 0.99


def skeleton() -> dict:
    names = ["mixamorig:Hips", "mixamorig:LeftUpLeg", "mixamorig:RightUpLeg",
             "mixamorig:LeftLeg", "mixamorig:RightLeg", "mixamorig:LeftFoot"]
    ys = (0.5, 0.45, 0.45, 0.2, 0.2, 0.0); worlds = {}
    for name, y in zip(names, ys):
        matrix = np.eye(4); matrix[1, 3] = y; worlds[name] = matrix.T.reshape(-1).tolist()
    return {"joints": names, "parents": [-1, 0, 0, 1, 2, 3], "bindWorld": worlds,
            "heightMu": 1.0, "mPerMu": 1.0, "regions": {"ids": {"hips": 0}}}


def body_skin(vertices: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    joints = np.zeros((len(vertices), 4), dtype=np.uint16); weights = np.zeros((len(vertices), 4), dtype=np.float32)
    for index, point in enumerate(vertices):
        row = round(point[1] * 2)
        joint = 0 if row >= 1 else (3 if point[0] < 0 else 4)
        joints[index] = (joint, joint, joint, joint); weights[index, 0] = 1.0
    return joints, weights


def write_target_body(source_body: Path, source_skeleton: Path, output: Path) -> tuple[Path, Path]:
    """写一个与合成骨长变化一致的目标 body/skeleton，供文件级 refit。"""
    source_spec = json.loads(source_skeleton.read_text(encoding="utf-8"))
    target_spec = json.loads(json.dumps(source_spec)); source_glb = load_glb(source_body)
    body = load_world_mesh(source_glb, skinned_only=True)
    if body.joints is None or body.weights is None:
        raise AssertionError("正本缺少 skin")
    names = target_spec["joints"]; parents = target_spec["parents"]
    changed = (("mixamorig:LeftLeg", 1.002), ("mixamorig:LeftFoot", 1.004),
               ("mixamorig:RightLeg", 1.002), ("mixamorig:RightFoot", 1.004))
    for name, factor in changed:
        index = names.index(name); parent = int(parents[index])
        matrix = np.asarray(target_spec["bindWorld"][name]).reshape(4, 4).T
        origin = np.asarray(target_spec["bindWorld"][names[parent]]).reshape(4, 4).T[:3, 3]
        matrix[:3, 3] = origin + factor * (matrix[:3, 3] - origin)
        target_spec["bindWorld"][name] = matrix.T.reshape(-1).tolist()
    positions, _ = refit_positions(body.positions, body.joints, body.weights, source_spec, target_spec)
    body.positions = positions.astype(np.float32)
    body.normals = vertex_normals(body.positions, body.indices.reshape(-1, 3)).astype(np.float32)
    output.mkdir(parents=True, exist_ok=True); body_path = output / "body.glb"
    source_skin = source_glb.skin(); target_document = json.loads(json.dumps(source_glb.json))
    target_glb = GLB(source_body, target_document, source_glb.bin)
    worlds = np.asarray([np.asarray(target_spec["bindWorld"][name]).reshape(4, 4).T for name in names])
    for index, node_index in enumerate(source_skin.joints):
        local = worlds[index] if parents[index] < 0 else np.linalg.inv(worlds[int(parents[index])]) @ worlds[index]
        node = target_document["nodes"][node_index]
        for key in ("translation", "rotation", "scale"):
            node.pop(key, None)
        node["matrix"] = local.T.reshape(-1).tolist()
    target_skin = Skin(target_glb, source_skin.index, source_skin.joints, np.linalg.inv(worlds), None,
                       source_skin.skeleton, source_skin.name)
    write_skinned_glb(body_path, body, target_skin, {"unlit": True, "double_sided": False}, [])
    body_path.chmod(0o644)
    skeleton_path = output / "skeleton.json"
    skeleton_path.write_text(json.dumps(target_spec, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    np.save(output / target_spec["regions"]["file"],
            np.load(source_skeleton.parent / source_spec["regions"]["file"]))
    return body_path, skeleton_path


def build_bodysuit_fixture(root: Path) -> tuple[Path, Path, dict]:
    """从当前正本确定性生成无 skin 贴身壳，并以严格模式贴合。"""
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    output = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit"
    body_path = template / "body.glb"; skeleton_path = template / "skeleton.json"
    skeleton_data = json.loads(skeleton_path.read_text(encoding="utf-8"))
    body = load_world_mesh(load_glb(body_path), skinned_only=True)
    if body.normals is None:
        raise AssertionError("正本缺少 NORMAL")
    regions = np.load(template / skeleton_data["regions"]["file"])
    wanted_names = ("torsoUpper", "torsoLower", "hips", "thighL", "thighR")
    wanted = np.asarray([skeleton_data["regions"]["ids"][name] for name in wanted_names])
    body_faces = body.indices.reshape(-1, 3).astype(np.int64)
    selected_faces = body_faces[np.all(np.isin(regions[body_faces], wanted), axis=1)]
    # 将指定五区的原始顶点按固定空间格聚合成连续测试壳。它仍完全由 regions.npy
    # 选出的表面派生，同时消除 UV seam 与原模型极细长三角对推离门禁的干扰。
    selected = np.unique(selected_faces); voxel_mu = 0.014
    origin = body.positions[selected].min(axis=0)
    cells = np.floor((body.positions[selected] - origin) / voxel_mu).astype(np.int64)
    _, inverse = np.unique(cells, axis=0, return_inverse=True)
    vertex_count = int(inverse.max(initial=-1)) + 1
    counts = np.bincount(inverse, minlength=vertex_count).astype(np.float64)
    unique_positions = np.zeros((vertex_count, 3), dtype=np.float64)
    welded_normals = np.zeros((vertex_count, 3), dtype=np.float64)
    np.add.at(unique_positions, inverse, body.positions[selected])
    np.add.at(welded_normals, inverse, body.normals[selected])
    unique_positions /= counts[:, None]
    welded_normals /= np.maximum(np.linalg.norm(welded_normals, axis=1, keepdims=True), 1e-12)
    old_to_welded = np.full(len(body.positions), -1, dtype=np.int64)
    old_to_welded[selected] = inverse
    faces = old_to_welded[selected_faces]
    keep = np.apply_along_axis(lambda row: len(set(row.tolist())) == 3, 1, faces)
    faces = faces[keep]
    # 同一聚合三角可能来自 seam 两侧；保留第一次出现的原始绕序。
    _, first = np.unique(np.sort(faces, axis=1), axis=0, return_index=True)
    faces = faces[np.sort(first)]
    m_per_mu = float(skeleton_data["mPerMu"]); rng = np.random.default_rng(102)
    # 固定种子产生 2.95~3 mm 的内法向向量噪声；只依赖输入网格，不查询 SDF，
    # 也没有按结果事后改点。向量范数而非单分量受 3 mm 上限约束。
    amplitude_mm = rng.uniform(2.95, 3.0, size=vertex_count)
    noise_direction = -welded_normals
    noise_mm = amplitude_mm[:, None] * noise_direction
    noise_norm_mm = np.linalg.norm(noise_mm, axis=1)
    if float(noise_norm_mm.max(initial=0.0)) > 3.0 + 1e-12:
        raise AssertionError("fixture 噪声向量幅度超过 3 mm")
    positions = (unique_positions.astype(np.float64)
                 + welded_normals * (4.0 / (1000.0 * m_per_mu))
                 + noise_mm / (1000.0 * m_per_mu))
    surface = SurfaceIndex(body.positions, body_faces, body.normals, k=16)
    nearest, bary, face_ids, distances = surface.query(positions)
    body_normal = np.einsum("ni,nij->nj", bary, body.normals[body_faces[face_ids]])
    body_normal /= np.maximum(np.linalg.norm(body_normal, axis=1, keepdims=True), 1e-12)
    sign = np.sign(np.einsum("ij,ij->i", positions - nearest, body_normal)); sign[sign == 0.0] = 1.0
    signed = sign * distances
    prefit_inside = float(np.mean(signed < 0.0))
    if prefit_inside < 0.02:
        raise AssertionError(f"严格 fixture 贴合前穿透率不足 2%：{prefit_inside:.6%}")
    # 只剔除正本原始零面积三角；不按面积阈值豁免小三角。
    base_triangles = unique_positions[faces]
    base_double_area = np.linalg.norm(np.cross(base_triangles[:, 1] - base_triangles[:, 0],
                                               base_triangles[:, 2] - base_triangles[:, 0]), axis=1)
    faces = faces[base_double_area > 0.0]
    mesh = Mesh(positions.astype(np.float32), faces.reshape(-1).astype(np.uint32),
                welded_normals.astype(np.float32), None,
                material_indices=np.asarray([0]),
                primitives=[PrimitiveRange(0, vertex_count, 0, faces.size, 0)],
                name="_fixture_bodysuit_raw")
    builder = GLBBuilder(); builder.add_material(base_color_factor=(0.25, 0.45, 0.7, 1.0),
                                                  unlit=True, double_sided=True, name="FixtureUnlit")
    mesh_index = builder.add_mesh(mesh); node = builder.add_node(name=mesh.name, mesh=mesh_index)
    builder.add_scene([node], name="FixtureScene"); output.mkdir(parents=True, exist_ok=True)
    raw_path = output / "_fixture_bodysuit_raw.glb"; builder.write(raw_path); raw_path.chmod(0o644)
    result = fit_file(body_path, skeleton_path, raw_path, output, "garment", "body",
                      "_fixture_bodysuit", push_mm=3.0, iters=80, coverage=0.65)
    result["fixtureInput"] = {"seed": 102, "baseOffsetMm": 4.0, "noiseAmplitudeMm": 3.0,
                              "noiseVectorMaxMm": float(noise_norm_mm.max(initial=0.0)),
                              "aggregationVoxelMu": voxel_mu,
                              "noiseComponentRangeMm": [float(noise_mm.min()), float(noise_mm.max())],
                              "prefitInsideFraction": prefit_inside}
    (output / "fit.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return raw_path, output / "_fixture_bodysuit.glb", result


def test_weight_transfer_and_filter() -> None:
    body, faces = cylinder(1.0, (0.0, 0.5, 1.0)); normals = vertex_normals(body, faces)
    joints, weights = body_skin(body); garment = body * np.array([1.02, 1.0, 1.02])
    surface = SurfaceIndex(body, faces, normals); result_j, result_w, stats = transfer_weights(
        garment, normals, surface, joints, weights, skeleton(), "body", faces)
    assert np.allclose(result_w.sum(axis=1), 1.0)
    # 套筒各环与最近身体环使用同一主关节。
    assert np.all(result_j[:, 0] == joints[:, 0])
    # LeftFoot 被 body slot 禁止，即使来源权重强制为 Foot 也会回退到允许线段。
    bad_joints = joints.copy(); bad_joints[:, 0] = 5
    filtered_j, filtered_w, filtered = transfer_weights(
        garment, normals, surface, bad_joints, weights, skeleton(), "body", faces)
    assert filtered["filteredVertices"] == len(garment)
    assert 5 not in filtered_j[filtered_w > 0]
    assert stats["highConfidence"] == 1.0 and "joint-segment" in stats["method"]
    # 离体表 >100 mm 的低置信裙摆必须直接走 slot 骨段，不得从邻接可信点扩散。
    far = garment.copy(); far[:24, 0] += 10.0
    _, _, far_stats = transfer_weights(far, normals, surface, joints, weights, skeleton(), "body", faces)
    assert far_stats["farSemanticFallbackVertices"] >= 24
    assert far_stats["farFallbackThresholdMm"] == 100.0


def test_edge_template_weights_blend_thirty_mm() -> None:
    points = np.array([[x * .02, y * .02, 0] for y in range(5) for x in range(5)], np.float32)
    faces = []
    for y in range(4):
        for x in range(4):
            a = y * 5 + x; faces.extend(((a, a + 5, a + 1), (a + 1, a + 5, a + 6)))
    faces = np.asarray(faces, np.int64); count = len(points)
    source_j = np.zeros((count, 4), np.uint16); source_w = np.zeros((count, 4), np.float32); source_w[:, 0] = 1
    template_j = np.ones((count, 4), np.uint16); template_w = np.zeros((count, 4), np.float32); template_w[:, 0] = 1
    joints, weights, stats = edge_weight_blend(
        points, faces, source_j, source_w, template_j, template_w, .03)
    dense = np.zeros((count, 2)); rows = np.repeat(np.arange(count), 4)
    np.add.at(dense, (rows, joints.ravel()), weights.ravel())
    assert np.allclose(dense[[0, 4, 20, 24], 1], 1.0)  # 开口完全用 B。
    assert dense[12, 1] == 0 and 0 < dense[7, 1] < 1  # 30 mm 外 A；带内渐变。
    assert stats["boundaryVertices"] == 16 and stats["blendedVertices"] == 24


def test_edge_refit_clears_bind_penetration() -> None:
    body, body_faces = cylinder(1.0, (0.0, .5, 1.0))
    normals = body.copy(); normals[:, 1] = 0.0
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    surface = SurfaceIndex(body, body_faces, normals)
    garment = body.copy(); garment[:, :][garment[:, 1] > .75] *= np.array([.995, 1., .995])
    cleared, stats = clear_bind_penetration(garment, surface)
    nearest, bary, face_ids, distances = surface.query(cleared)
    body_normal = np.einsum("ni,nij->nj", bary, normals[body_faces[face_ids]])
    signed = _signed_distance_from_query(cleared, nearest, body_normal, distances)
    assert stats["rounds"] and stats["residual"] == 0
    assert np.count_nonzero(signed < 0.0) == 0


def test_surface_query_is_geometric_nearest() -> None:
    """衣物法线不得把查询从几何最近三角改到较远同向表面。"""
    vertices = np.asarray([[-1, -1, 0], [1, -1, 0], [0, 1, 0],
                           [-1, -1, .1], [0, 1, .1], [1, -1, .1]], dtype=float)
    faces = np.asarray([[0, 1, 2], [3, 4, 5]], dtype=np.int64)
    normals = np.asarray([[0, 0, 1]] * 3 + [[0, 0, -1]] * 3, dtype=float)
    points = np.asarray([[0, 0, .02], [.1, -.1, .08]], dtype=float)
    surface = SurfaceIndex(vertices, faces, normals, k=1)
    actual = surface.query(points, reference_normals=np.asarray([[0, 0, -1], [0, 0, 1]]))
    expected = nearest_triangle(points, vertices, faces, k=1)
    assert np.allclose(actual[0], expected.points)
    assert np.allclose(actual[3], expected.distances_mu)
    assert np.array_equal(actual[2], expected.face_indices)


def test_legacy_normal_selected_output_has_real_residual() -> None:
    """回归 r5：旧法线选面可宣称清零，但真实几何最近面仍在内侧。"""
    vertices = np.asarray([[-1, -1, 0], [1, -1, 0], [0, 1, 0],
                           [-1, -1, .1], [0, 1, .1], [1, -1, .1]], dtype=float)
    faces = np.asarray([[0, 1, 2], [3, 4, 5]], dtype=np.int64)
    normals = np.asarray([[0, 0, -1]] * 6, dtype=float)
    legacy_output = np.asarray([[0, 0, .02]], dtype=float)
    legacy_selected = np.asarray([[0, 0, .1]])
    legacy_normal = np.asarray([[0, 0, -1.]])
    assert float(np.einsum("ij,ij->i", legacy_output - legacy_selected, legacy_normal)[0]) > 0.0
    exact = signed_distance(legacy_output, vertices, faces, normals, k=1)
    assert exact.distances_mu[0] < 0.0


def test_push_out() -> None:
    body, body_faces = cylinder(1.0, (0.0, 0.5, 1.0)); normals = vertex_normals(body, body_faces)
    garment, garment_faces = cylinder(0.98, (0.0, 0.5, 1.0)); surface = SurfaceIndex(body, body_faces, normals)
    pushed, stats = push_out(garment, garment_faces, surface, 0.03, 4)
    nearest, bary, face_ids, distances = surface.query(pushed)
    n = np.einsum("ni,nij->nj", bary, normals[body_faces[face_ids]])
    sign = np.sign(np.einsum("ij,ij->i", pushed - nearest, n / np.linalg.norm(n, axis=1, keepdims=True)))
    sign[sign == 0.0] = 1.0; signed = sign * distances
    assert signed.min() >= 0.03 - 1e-6, signed.min()
    assert stats["rounds"][0]["inside"] > 0 and stats["residual"] == 0
    radius = np.linalg.norm(pushed[:, (0, 2)], axis=1)
    assert np.allclose(radius, 1.03, atol=4e-4), (radius.min(), radius.max())
    drift = np.linalg.norm(pushed.mean(axis=0)[[0, 2]] - garment.mean(axis=0)[[0, 2]])
    assert drift < 1e-4, drift
    assert stats["flippedTriangles"] == 0 and stats["stretchWithinRatio"] >= 0.99


def test_hide_regions() -> None:
    body, faces = cylinder(1.0, (0.0, 0.5, 1.0)); normals = vertex_normals(body, faces)
    surface = SurfaceIndex(body, faces, normals); regions = np.zeros(len(body), dtype=np.uint8)
    garment = body * np.array([1.005, 1.0, 1.005])
    hidden, ratios = hide_regions(garment, faces, surface, regions, {"hips": 0}, 0.65, 0.015)
    assert hidden == ["hips"] and ratios["hips"] > 0.65
    hidden_far, _ = hide_regions(body * np.array([1.1, 1.0, 1.1]), faces, surface, regions,
                                 {"hips": 0}, 0.65, 0.015)
    assert hidden_far == []


def test_refit_identity() -> None:
    body, _ = cylinder(1.0, (0.0, 0.5, 1.0)); joints, weights = body_skin(body); spec = skeleton()
    result, ratios = refit_positions(body, joints, weights, spec, json.loads(json.dumps(spec)))
    assert np.max(np.abs(result - body)) < 1e-12
    assert set(ratios.values()) == {1.0}


def test_refit_changed_bone_lengths() -> None:
    source = skeleton(); target = json.loads(json.dumps(source))
    for name, y in (("mixamorig:LeftLeg", -0.05), ("mixamorig:LeftFoot", -0.37)):
        matrix = np.asarray(target["bindWorld"][name]).reshape(4, 4).T
        matrix[1, 3] = y; target["bindWorld"][name] = matrix.T.reshape(-1).tolist()
    positions = np.asarray([[0.0, 0.325, 0.0], [0.0, 0.075, 0.0]])
    joints = np.asarray([[1, 0, 0, 0], [3, 0, 0, 0]], dtype=np.uint16)
    weights = np.asarray([[1.0, 0, 0, 0], [1.0, 0, 0, 0]], dtype=np.float32)
    result, ratios = refit_positions(positions, joints, weights, source, target)
    assert abs(ratios["mixamorig:LeftUpLeg"] - 2.0) < 1e-12
    assert abs(ratios["mixamorig:LeftLeg"] - 1.6) < 1e-12
    assert np.allclose(result[:, 1], [0.2, -0.25], atol=1e-12), result


def test_file_nonidentity_refit() -> None:
    """写合成目标 body/skeleton 并调用完整文件级 refit/CLI。"""
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    source_dir = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit"
    target_dir = source_dir / "refit_nonidentity"; target_template = target_dir / "template"
    body_path, skeleton_path = write_target_body(
        template / "body.glb", template / "skeleton.json", target_template)
    result = refit_file(template / "body.glb", template / "skeleton.json",
                        body_path, skeleton_path, source_dir / "_fixture_bodysuit.glb",
                        source_dir / "fit.json", target_dir)
    assert result["status"] == "fitted" and result["pushOut"]["passed"]
    assert result["refitFrom"]["maxVertexDeltaMu"] > 1e-6
    assert result["pushOut"]["rounds"] and np.isfinite(result["refitFrom"]["maxVertexDeltaMu"])
    output_glb = load_glb(target_dir / "_fixture_bodysuit.glb")
    source_mesh = load_world_mesh(load_glb(source_dir / "_fixture_bodysuit.glb"), skinned_only=True)
    output_mesh = load_world_mesh(output_glb, skinned_only=True)
    assert_serialized_topology(source_mesh, output_mesh)
    target_glb = load_glb(body_path); output_skin = output_glb.skin(); target_skin = target_glb.skin()
    assert output_glb.accessor_bytes(output_skin.inverse_bind_accessor) == target_glb.accessor_bytes(
        target_skin.inverse_bind_accessor)
    assert refit_main(["--from-body", str(template / "body.glb"),
                       "--from-skeleton", str(template / "skeleton.json"),
                       "--to-body", str(body_path), "--to-skeleton", str(skeleton_path),
                       "--garment", str(source_dir / "_fixture_bodysuit.glb"),
                       "--fit", str(source_dir / "fit.json"), "--out", str(target_dir),
                       "--json"]) == 0


def test_units_skull_and_regions() -> None:
    assert abs(mm_to_mu(15.0, 1.5) - 0.01) < 1e-12
    spec = skeleton(); spec["regions"].update({
        "ids": {"hips": 4, "shinL": 13},
        "jointToRegion": {name: ("shinL" if name.endswith("LeftLeg") else "hips")
                          for name in spec["joints"]}})
    joints = np.asarray([[0, 3, 0, 0], [3, 0, 0, 0]], dtype=np.uint16)
    weights = np.asarray([[.8, .2, 0, 0], [.9, .1, 0, 0]], dtype=np.float32)
    regions = derive_regions(joints, weights, spec)
    assert regions.dtype == np.uint8 and np.array_equal(regions, [4, 13])
    spec.update({"measures": {"headTopMu": [0, 1, 0]},
                 "sockets": {"headTop": {"bone": "mixamorig:Hips", "pos": [0, 1, 0]}},
                 "restPose": {"armAngleDeg": 39}})
    source, faces = cylinder(.2, (0, .5, 1)); normal = vertex_normals(source, faces)
    profile = {"bone": "mixamorig:Hips", "stepMu": .005,
               "rows": [{"yMu": y, "centerXMu": 0.0, "centerZMu": 0.0,
                          "radiusXMu": .05, "radiusZMu": .05}
                         for y in np.linspace(-.02, .02, 5)]}
    aligned, _, report = align_landmarks(source, normal, source, spec, "hair", profile)
    assert "headTop" in report and report["skullFit"]["rowsChecked"] == 5
    assert len(report["skullFit"]["sections"]) == 5
    assert np.isfinite(aligned).all()


def test_alignment_no_mirror() -> None:
    source, faces = cylinder(0.3, (-0.5, 0.0, 0.5)); normal = vertex_normals(source, faces)
    body, _ = cylinder(0.2, (0.0, 0.45, 0.9)); spec = skeleton()
    spec.update({"heightMu": 1.0, "neckRing": {"centerMu": [0.0, 0.85, 0.0]},
                 "measures": {"headWidthMu": 0.1, "headTopMu": [0.0, 1.0, 0.0]},
                 "restPose": {"armAngleDeg": 39.0}})
    aligned, _, report = align_landmarks(source, normal, body, spec, "garment")
    assert np.linalg.det(np.eye(3)) > 0 and not report["mirrored"]
    assert abs(aligned[:, 1].min()) < 1e-7 and report["residualMu"]["neckTopMu"] < 1e-7


def test_alignment_continuous_pca_yaw() -> None:
    source, faces = cylinder(0.2, (0.0, 0.45, 0.9))
    source[:, 0] *= 1.8
    expected = 37.25; rotated = source @ np.asarray(
        [[math.cos(math.radians(expected)), 0, math.sin(math.radians(expected))],
         [0, 1, 0], [-math.sin(math.radians(expected)), 0, math.cos(math.radians(expected))]]).T
    normal = vertex_normals(rotated, faces); spec = skeleton()
    spec.update({"heightMu": 1.0, "neckRing": {"centerMu": [0.0, 0.9, 0.0]},
                 "measures": {"headWidthMu": 0.1, "headTopMu": [0.0, 1.0, 0.0]},
                 "restPose": {"armAngleDeg": 39.0}})
    aligned, _, report = align_landmarks(rotated, normal, source, spec, "garment")
    assert abs(abs(report["yawDeg"]) - expected) < 1e-8, report["yawDeg"]
    assert not math.isclose(report["yawDeg"] / 90.0, round(report["yawDeg"] / 90.0), abs_tol=1e-8)
    assert np.max(np.abs(np.sort(aligned[:, 0]) - np.sort(source[:, 0]))) < 1e-6


def test_joint_alignment_mirror_detection() -> None:
    class FakeSkin:
        joints = tuple(range(9))
    class FakeGLB:
        def __init__(self, names: list[str], points: np.ndarray) -> None:
            self.json = {"nodes": [{"name": name} for name in names]}; self.points = points
        def skin(self) -> FakeSkin: return FakeSkin()
        def world_matrix(self, index: int) -> np.ndarray:
            matrix = np.eye(4); matrix[:3, 3] = self.points[index]; return matrix
    names = ["mixamorig:" + name for name in
             ("Hips", "Spine", "Spine1", "Spine2", "Neck", "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg")]
    points = np.asarray([[0, 0, 0], [0, .2, 0], [0, .4, 0], [0, .6, 0], [0, .8, 0],
                         [.3, .6, 0], [-.3, .6, 0], [.1, -.3, 0], [-.1, -.3, 0]], dtype=float)
    worlds = {}
    for name, point in zip(names, points): matrix = np.eye(4); matrix[:3, 3] = point; worlds[name] = matrix.T.reshape(-1).tolist()
    spec = {"joints": names, "parents": [-1, 0, 1, 2, 3, 3, 3, 0, 0], "bindWorld": worlds}
    skin_joints = np.zeros((len(points), 4), dtype=np.uint16)
    skin_joints[:, 0] = np.arange(len(points), dtype=np.uint16)
    skin_weights = np.zeros((len(points), 4), dtype=np.float32); skin_weights[:, 0] = 1.0
    _, _, report, mapping = align_joints(
        points, None, FakeGLB(names, points * [-1, 1, 1]), spec, skin_joints, skin_weights)
    assert report["mirrored"] and report["determinant"] > 0.999999 and np.array_equal(mapping, np.arange(9))
    assert max(report["poseCorrectionDeg"].values()) > 1.0


def test_joint_alignment_bone_length_scale() -> None:
    names = ["mixamorig:" + name for name in
             ("Hips", "Spine", "Spine1", "Spine2", "Neck", "LeftArm", "RightArm",
              "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg")]
    parents = [-1, 0, 1, 2, 3, 3, 3, 0, 0, 7, 8]
    source_points = np.asarray([[0, 0, 0], [0, .2, 0], [0, .4, 0], [0, .6, 0], [0, .8, 0],
                                [.3, .6, 0], [-.3, .6, 0], [.1, -.3, 0], [-.1, -.3, 0],
                                [.1, -.7, 0], [-.1, -.7, 0]], dtype=float)
    target_points = source_points.copy(); target_points[9:, 1] = -1.1
    class FakeSkin:
        joints = tuple(range(len(names)))
    class FakeGLB:
        def __init__(self) -> None:
            self.json = {"nodes": [{"name": name} for name in names]}
            for child, parent in enumerate(parents):
                if parent >= 0: self.json["nodes"][parent].setdefault("children", []).append(child)
        def skin(self) -> FakeSkin: return FakeSkin()
        def world_matrix(self, index: int) -> np.ndarray:
            matrix = np.eye(4); matrix[:3, 3] = source_points[index]; return matrix
    worlds = {}
    for name, point in zip(names, target_points):
        matrix = np.eye(4); matrix[:3, 3] = point; worlds[name] = matrix.T.reshape(-1).tolist()
    joints = np.asarray([[7, 0, 0, 0]], dtype=np.uint16)
    weights = np.asarray([[1.0, 0, 0, 0]], dtype=np.float32)
    aligned, _, report, _ = align_joints(np.asarray([[.1, -.7, 0]]), None, FakeGLB(),
                                                  {"joints": names, "parents": parents,
                                                   "bindWorld": worlds}, joints, weights)
    assert abs(report["boneLengthScale"]["mixamorig:LeftUpLeg"] - 2.0) < 1e-12
    assert np.allclose(aligned[0], [.1, -1.1, 0], atol=1e-7), aligned


def test_push_gate_failure() -> None:
    body, faces = cylinder(1.0, (0.0, 0.5, 1.0))
    class StuckSurface:
        faces = np.asarray([[0, 1, 2]], dtype=np.int64)
        normals = np.asarray([[1., 0, 0], [1., 0, 0], [1., 0, 0]])
        def query(self, points: np.ndarray, **_kwargs):
            count = len(points)
            return (points + np.asarray([1., 0, 0]), np.tile([1., 0, 0], (count, 1)),
                    np.zeros(count, dtype=np.int64), np.ones(count))
    try:
        push_out(body, faces, StuckSurface(), .03, 0, verify_only=True)
    except GarmentGateError:
        return
    raise AssertionError("推离失败必须触发门禁")


def test_push_draft_is_explicit() -> None:
    body, faces = cylinder(1.0, (0.0, 0.5, 1.0))
    class StuckSurface:
        faces = np.asarray([[0, 1, 2]], dtype=np.int64)
        normals = np.asarray([[1., 0, 0], [1., 0, 0], [1., 0, 0]])
        def query(self, points: np.ndarray, **_kwargs):
            count = len(points)
            return (points + np.asarray([1., 0, 0]), np.tile([1., 0, 0], (count, 1)),
                    np.zeros(count, dtype=np.int64), np.ones(count))
    _, stats = push_out(body, faces, StuckSurface(), .03, 1, allow_draft=True)
    assert stats["draft"] and not stats["passed"] and stats["residual"] == len(body)


def test_fixture_strict_fit() -> None:
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    raw, garment, result = build_bodysuit_fixture(root)
    assert raw.is_file() and garment.is_file() and result["status"] == "fitted"
    fixture = result["fixtureInput"]
    assert fixture["seed"] == 102
    assert fixture["noiseVectorMaxMm"] <= 3.0 + 1e-12
    assert fixture["noiseAmplitudeMm"] <= 3.0 and fixture["prefitInsideFraction"] >= 0.02
    assert result["weights"]["highConfidence"] >= 0.85
    push = result["pushOut"]
    assert push["pushMm"] == 3.0 and push["iters"] == 80
    assert push["passed"] and push["residual"] == 0 and push["insufficientMargin"] == 0
    assert push["flippedTriangles"] == 0 and push["stretchWithinRatio"] >= 0.99
    body = load_world_mesh(load_glb(template / "body.glb"), skinned_only=True)
    raw_mesh = load_world_mesh(load_glb(raw))
    fitted = load_world_mesh(load_glb(garment), skinned_only=True)
    aligned_raw = Mesh(raw_mesh.positions.copy(), raw_mesh.indices.copy())
    yaw = math.radians(result["align"]["yawDeg"]); c, s = math.cos(yaw), math.sin(yaw)
    rotation = np.asarray([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    aligned_raw.positions = (raw_mesh.positions @ rotation.T) * result["align"]["scale"]
    aligned_raw.positions += np.asarray(result["align"]["translationMu"])
    assert_serialized_topology(aligned_raw, fitted)
    exact = signed_distance(fitted.positions, body.positions, body.indices.reshape(-1, 3),
                            body.normals, k=16)
    push_mu = mm_to_mu(3.0, json.loads((template / "skeleton.json").read_text())["mPerMu"])
    assert np.count_nonzero(exact.distances_mu < 0.0) == 0
    assert np.count_nonzero(exact.distances_mu < push_mu - max(1e-7, push_mu * 1e-4)) == 0
    hidden = set(result["hideRegions"]); never = set(result["neverHide"])
    assert {"torsoUpper", "torsoLower", "hips"}.issubset(hidden), hidden
    assert hidden.isdisjoint(never)
    glb = load_glb(garment); primitive = glb.json["meshes"][0]["primitives"][0]
    assert len(glb.json["meshes"]) == 1 and len(glb.json["meshes"][0]["primitives"]) == 1
    assert glb.json["materials"][0]["doubleSided"]
    assert "KHR_materials_unlit" in glb.json["materials"][0]["extensions"]
    accessor = glb.json["accessors"][primitive["attributes"]["_REGION"]]
    assert accessor["componentType"] == 5121 and accessor["type"] == "SCALAR"


def test_align_none_uses_template_weights() -> None:
    """已在模板 bind 空间的无 skin 壳不得再次做 landmark/joint 对齐。"""
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    fixture = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit"
    raw = fixture / "_fixture_bodysuit_raw.glb"
    assert raw.is_file(), "test_fixture_strict_fit 必须先生成 raw fixture"
    with tempfile.TemporaryDirectory() as temporary:
        result = fit_file(template / "body.glb", template / "skeleton.json", raw,
                          Path(temporary), "garment", "body", "_fixture_none",
                          push_mm=3.0, iters=80, align_mode="none",
                          notes=["unit-test-none"])
        assert result["align"]["requestedMode"] == "none"
        assert result["align"]["bodySpaceIdentity"]
        assert result["weights"]["method"].startswith("nearest-triangle")
        assert result["template"] == "tpl_f_medium" and result["notes"] == ["unit-test-none"]
        output = load_world_mesh(load_glb(Path(temporary) / "_fixture_none.glb"), skinned_only=True)
        source = load_world_mesh(load_glb(raw))
        assert len(output.positions) == len(source.positions)
def test_file_identity_and_region() -> None:
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    source_dir = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit"
    required = [template / "body.glb", template / "skeleton.json", source_dir / "fit.json",
                source_dir / "_fixture_bodysuit.glb"]
    assert all(path.is_file() for path in required), f"缺严格产物：{[str(p) for p in required if not p.is_file()]}"
    with tempfile.TemporaryDirectory() as temporary:
        result = refit_file(template / "body.glb", template / "skeleton.json",
                            template / "body.glb", template / "skeleton.json",
                            source_dir / "_fixture_bodysuit.glb", source_dir / "fit.json",
                            Path(temporary))
        assert result["status"] == "fitted" and result["pushOut"]["passed"]
        assert result["refitFrom"]["maxVertexDeltaMu"] < 1e-6
        glb = load_glb(Path(temporary) / "_fixture_bodysuit.glb")
        source_mesh = load_world_mesh(load_glb(source_dir / "_fixture_bodysuit.glb"), skinned_only=True)
        assert_serialized_topology(source_mesh, load_world_mesh(glb, skinned_only=True))
        primitive = glb.json["meshes"][0]["primitives"][0]
        accessor = glb.json["accessors"][primitive["attributes"]["_REGION"]]
        assert accessor["componentType"] == 5121 and accessor["type"] == "SCALAR"


def main() -> int:
    tests = [test_weight_transfer_and_filter, test_edge_template_weights_blend_thirty_mm,
             test_edge_refit_clears_bind_penetration,
             test_surface_query_is_geometric_nearest,
             test_legacy_normal_selected_output_has_real_residual,
             test_push_out, test_hide_regions, test_refit_identity,
             test_refit_changed_bone_lengths, test_fixture_strict_fit, test_align_none_uses_template_weights,
             test_file_nonidentity_refit,
             test_units_skull_and_regions, test_alignment_no_mirror, test_alignment_continuous_pca_yaw,
             test_joint_alignment_mirror_detection, test_joint_alignment_bone_length_scale,
             test_push_gate_failure, test_push_draft_is_explicit, test_file_identity_and_region]
    failed = 0
    for test in tests:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:  # noqa: BLE001 - 独立测试入口要继续报告全部失败。
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    print(f"{len(tests) - failed}/{len(tests)} tests passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
