#!/usr/bin/env python3
"""fit_garment/refit_template 的无框架合成测试。"""
from __future__ import annotations

import json
import math
from pathlib import Path
import sys
import tempfile
import traceback
from typing import Any

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fit_garment import (GarmentGateError, SurfaceIndex, _signed_distance_from_query, align_joints,
                         align_landmarks, clear_bind_penetration, derive_regions, encode_skin_clean_texture,
                         fit_file, edge_weight_blend,
                         hide_regions, load_world_mesh, mm_to_mu, push_out, PseudoNormalSign,
                         transfer_template_weights, transfer_weights,
                         vertex_normals, volume_push)  # noqa: E402
from extract_garment import _srgb_to_lab, repair_by_reference, repair_skin_texels  # noqa: E402
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


FIXTURE_VOLATILE_STATS = ("elapsedSec", "peakMemoryMiB")


def _keep_volatile_stats(path: Path, previous: str | None) -> None:
    """入库夹具的 fit.json 里耗时 / 峰值内存是非确定统计：重生成后沿用上一版的值，夹具文件逐字节可复现。"""
    if previous is None or not path.exists():
        return
    old = json.loads(previous).get("stats", {})
    data = json.loads(path.read_text(encoding="utf-8"))
    for key in FIXTURE_VOLATILE_STATS:
        if key in old and key in data.get("stats", {}):
            data["stats"][key] = old[key]
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


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
    fit_path = output / "fit.json"; previous = fit_path.read_text(encoding="utf-8") if fit_path.exists() else None
    result = fit_file(body_path, skeleton_path, raw_path, output, "garment", "body",
                      "_fixture_bodysuit", push_mm=3.0, iters=80, coverage=0.65)
    result["fixtureInput"] = {"seed": 102, "baseOffsetMm": 4.0, "noiseAmplitudeMm": 3.0,
                              "noiseVectorMaxMm": float(noise_norm_mm.max(initial=0.0)),
                              "aggregationVoxelMu": voxel_mu,
                              "noiseComponentRangeMm": [float(noise_mm.min()), float(noise_mm.max())],
                              "prefitInsideFraction": prefit_inside}
    fit_path.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    _keep_volatile_stats(fit_path, previous)
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


def test_full_template_weight_transfer_is_normalized() -> None:
    body, faces = cylinder(1.0, (0.0, 0.5, 1.0)); normals = vertex_normals(body, faces)
    joints, weights = body_skin(body); garment = body * np.array([1.02, 1.0, 1.02])
    result_j, result_w, stats = transfer_template_weights(
        garment, faces, SurfaceIndex(body, faces, normals), joints, weights,
        skeleton(), "body", smooth_rounds=2)
    assert np.allclose(result_w.sum(axis=1), 1.0)
    assert np.all(result_w[:, :-1] >= result_w[:, 1:])
    assert np.all(result_j[result_w > 0] < len(skeleton()["joints"]))
    assert stats["smoothRounds"] == 2 and stats["semanticFallbackVertices"] == 0


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
    fit_path = target_dir / "fit.json"; previous = fit_path.read_text(encoding="utf-8") if fit_path.exists() else None
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
    _keep_volatile_stats(fit_path, previous)


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


def test_preserve_shape_prevents_fold_and_stretch() -> None:
    """旧式单点推离会折叠薄片；保形模式回退该步且不产生翻面/边长越界。"""
    points = np.asarray([[0., 0., 0.], [1., 0., 0.], [0., .02, 0.],
                         [1., .02, 0.]], dtype=np.float64)
    faces = np.asarray([[0, 1, 2], [1, 3, 2]], dtype=np.int64)
    class FoldSurface:
        faces = np.asarray([[0, 1, 2]], dtype=np.int64)
        normals = np.asarray([[0., 1., 0.]] * 3)
        def query(self, query: np.ndarray, **_kwargs):
            active = np.isclose(query[:, 0], 0.) & np.isclose(query[:, 1], 0.)
            signed = np.where(active, -.04, .05)
            nearest = query - signed[:, None] * self.normals[0]
            return (nearest, np.tile([1., 0., 0.], (len(query), 1)),
                    np.zeros(len(query), dtype=np.int64), np.abs(signed))
    # 旧式“直接按短缺逐点推离”会把 0 点越过薄片对边。
    old = points.copy(); old[0] += np.asarray([0., .04, 0.])
    safe, stats = push_out(points, faces, FoldSurface(), .03, 1, allow_draft=True,
                           preserve_shape=True)
    old_n = np.cross(old[faces[:, 1]] - old[faces[:, 0]], old[faces[:, 2]] - old[faces[:, 0]])
    src_n = np.cross(points[faces[:, 1]] - points[faces[:, 0]], points[faces[:, 2]] - points[faces[:, 0]])
    assert np.any(np.einsum("ij,ij->i", old_n, src_n) < 0)
    assert stats["flippedTriangles"] == 0 and stats["stretchWithinRatio"] == 1.0
    safe_n = np.cross(safe[faces[:, 1]] - safe[faces[:, 0]], safe[faces[:, 2]] - safe[faces[:, 0]])
    assert np.all(np.einsum("ij,ij->i", safe_n, src_n) > 0)


def _lat_long(radius_fn, rows: int, cols: int, closed_poles: bool = True) -> tuple[np.ndarray, np.ndarray]:
    """经纬网格：radius_fn(u, v) → 点（u ∈ [0,1] 纬向含端点，v ∈ [0,1) 经向周期）；右手绕序朝外。"""
    points = np.asarray([radius_fn(i / (rows - 1), j / cols) for i in range(rows) for j in range(cols)], float)
    faces = []
    for i in range(rows - 1):
        for j in range(cols):
            a = i * cols + j; b = i * cols + (j + 1) % cols; c = a + cols; d = b + cols
            faces += [(a, b, d), (a, d, c)]
    return points, np.asarray(faces, dtype=np.int64)


def _weld(points: np.ndarray, faces: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    unique, inverse = np.unique(np.round(points, 12), axis=0, return_inverse=True)
    welded = inverse.reshape(-1)[faces]
    keep = (welded[:, 0] != welded[:, 1]) & (welded[:, 1] != welded[:, 2]) & (welded[:, 0] != welded[:, 2])
    return unique, welded[keep]


def _sheet(z: float, half: float, count: int) -> tuple[np.ndarray, np.ndarray]:
    xs = np.linspace(-half, half, count)
    points = np.asarray([[x, y, z] for y in xs for x in xs])
    faces = []
    for r in range(count - 1):
        for c in range(count - 1):
            a = r * count + c; b = a + 1; d = a + count; e = d + 1
            faces += [(a, b, e), (a, e, d)]
    return points, np.asarray(faces, dtype=np.int64)


def test_volume_push_keeps_layers() -> None:
    """交领式两层薄片（相距 4 mm）被下方球面顶穿 2 cm：逐点推离把两层推到同一高度（层间距塌成 0），
    体表位移场整体平移两层——层间距保持、无翻面、全部离开体表 ≥ 3 mm。"""
    sphere_raw, sphere_faces_raw = _lat_long(
        lambda u, v: .1 * np.array([math.sin(math.pi * u) * math.cos(2 * math.pi * v),
                                    math.sin(math.pi * u) * math.sin(2 * math.pi * v), math.cos(math.pi * u)]), 33, 64)
    sphere, sphere_faces = _weld(sphere_raw, sphere_faces_raw); sphere_faces = sphere_faces[:, [0, 2, 1]]
    normals = vertex_normals(sphere, sphere_faces)
    assert normals[np.argmax(sphere[:, 2]), 2] > .99                  # 朝外
    surface = SurfaceIndex(sphere, sphere_faces, normals)
    inner, inner_faces = _sheet(.08, .08, 33); outer, outer_faces = _sheet(.084, .08, 33)
    garment = np.concatenate((inner, outer)); faces = np.concatenate((inner_faces, outer_faces + len(inner)))
    center_inner = int(np.argmin(np.linalg.norm(inner[:, :2], axis=1))); center_outer = len(inner) + center_inner
    old, _ = push_out(garment, faces, surface, .003, 3, allow_draft=True)
    assert old[center_outer, 2] - old[center_inner, 2] < .001        # 旧推离：两层挤到同一高度（互穿 / 闪烁）
    pushed, stats = volume_push(garment, faces, surface, .003, 1.0, allow_draft=True)
    gaps = pushed[len(inner):, 2] - pushed[:len(inner), 2]
    assert gaps.min() > .003, gaps.min()                              # 层间距保持（原 4 mm），无一处塌层
    assert stats["flippedTriangles"] == 0 and stats["residual"] == 0 and stats["insufficientMargin"] == 0, stats
    assert pushed[center_inner, 2] >= .103 - 1e-4, pushed[center_inner]


def test_pseudo_normal_sign_on_concave_mesh() -> None:
    """非凸封闭网格（圆环）上随机点：角度加权伪法向的符号与解析内外判定逐点一致。"""
    major, minor = .1, .04
    torus_raw, torus_faces_raw = _lat_long(
        lambda u, v: np.array([(major + minor * math.cos(2 * math.pi * u)) * math.cos(2 * math.pi * v),
                               (major + minor * math.cos(2 * math.pi * u)) * math.sin(2 * math.pi * v),
                               minor * math.sin(2 * math.pi * u)]), 25, 48)
    torus, torus_faces = _weld(torus_raw, torus_faces_raw)
    normals = vertex_normals(torus, torus_faces)
    assert normals[np.argmax(torus[:, 0]), 0] > .99                   # 朝外
    surface = SurfaceIndex(torus, torus_faces, normals)
    points = np.random.default_rng(7).uniform([-.16, -.16, -.06], [.16, .16, .06], (4000, 3))
    nearest, bary, face_ids, distances = surface.query(points)
    signed = PseudoNormalSign(surface).signed(points, nearest, bary, face_ids, distances)
    ring = np.hypot(np.linalg.norm(points[:, :2], axis=1) - major, points[:, 2])
    decided = np.abs(ring - minor) > .004                             # 离网格面 4 mm 以上（多边形逼近误差之外）
    assert np.array_equal(signed[decided] < 0, ring[decided] < minor)


def test_validate_maps_compacted_garment_to_source() -> None:
    """pack_glb 压紧后的衣物按 tianshuSourceVertexAccessor 回指真实源（与道具同口径）；此前衣物分支不认映射，
    压紧件只能把 fit.source 指向产出本身才对得上顶点数。"""
    import validate
    from types import SimpleNamespace
    from export_skeleton import _world_mesh
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    source_dir = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit"
    fit_path = source_dir / "fit.json"; fit = json.loads(fit_path.read_text(encoding="utf-8"))
    skeleton = json.loads((template / "skeleton.json").read_text(encoding="utf-8"))
    final = _world_mesh(load_glb(source_dir / "_fixture_bodysuit.glb"))[0]
    full = validate._garment_source(fit, fit_path, skeleton, final)
    rows = np.arange(0, len(full), 3)[::-1].copy()
    compacted = SimpleNamespace(positions=final.positions[rows], uvs=None)
    assert np.array_equal(validate._garment_source(fit, fit_path, skeleton, compacted, rows), full[rows])
    try:
        validate._garment_source(fit, fit_path, skeleton, compacted, np.where(rows == rows[0], rows[1], rows))
    except ValueError as error:
        assert "唯一性" in str(error)
    else:
        raise AssertionError("重复映射须拒收")


def test_validate_parity_confirms_a1_inside() -> None:
    """A1 带符号距离以重心插值顶点法向定符号；顶点法向反了的一片（模拟模板胸下倒置面）会把体外 3 cm 的点判成
    体内。封闭身体上以射线奇偶复核后不计入；开口网格无内外，保持 A1 口径。"""
    import validate
    raw, raw_faces = _lat_long(
        lambda u, v: .1 * np.array([math.sin(math.pi * u) * math.cos(2 * math.pi * v),
                                    math.sin(math.pi * u) * math.sin(2 * math.pi * v), math.cos(math.pi * u)]), 33, 64)
    sphere, faces = _weld(raw, raw_faces); faces = faces[:, [0, 2, 1]]
    normals = vertex_normals(sphere, faces); broken = normals.copy(); broken[sphere[:, 2] > .07] *= -1.0
    points = np.asarray([[0., 0., .13], [.05, 0., 0.], [.13, 0., 0.]])   # 坏片上方体外 / 体内（最近点在好区）/ 体外
    a1 = validate._signed_distances(points, sphere, faces, broken)
    assert a1[0] < 0 and a1[1] < 0 and a1[2] > 0                     # 第 0 点被 A1 误判为体内
    assert validate._is_closed(sphere, faces)
    assert list(validate._parity_inside(points, sphere, faces)) == [False, True, False]
    assert list(validate._confirm_inside(a1 < 0, points, sphere, faces, True)) == [False, True, False]
    open_faces = faces[sphere[faces].mean(axis=1)[:, 2] < .09]
    assert not validate._is_closed(sphere, open_faces)
    assert list(validate._confirm_inside(a1 < 0, points, sphere, open_faces, False)) == [True, True, False]


def test_skin_texture_cleanup_island_scope() -> None:
    image = np.full((16, 32, 3), [20, 70, 120], dtype=np.uint8)
    image[6:10, 6:10] = [210, 160, 135]
    image[:, 20:] = [210, 160, 135]
    uvs = np.asarray([[0., 0.], [.48, 0.], [0., 1.], [.48, 1.]])
    faces = np.asarray([[0, 1, 2], [1, 3, 2]])
    mean = _srgb_to_lab(np.asarray([[210., 160., 135.]]))[0]
    cleaned, stats = repair_skin_texels(Image.fromarray(image), uvs, faces, mean, 8.)
    output = np.asarray(cleaned)
    assert stats["skinTexelsBefore"] > 0 and stats["skinTexelsAfter"] == 0
    assert np.all(output[6:10, 6:10] == [20, 70, 120])
    assert np.all(output[:, 20:] == [210, 160, 135])


def test_skin_cleanup_survives_jpeg_encoding() -> None:
    """岛内：左侧远离肤色的布、其余是紧贴阈值外的过渡色、过渡色里一块肤色斑。无余量时斑被填成过渡色
    （有损编码后会落回阈值内）；带余量时取远处布色，且交付 JPEG 解码复测为 0。"""
    from io import BytesIO
    skin_rgb, cloth_rgb = np.asarray([210., 160., 135.]), np.asarray([20., 70., 120.])
    mean = _srgb_to_lab(skin_rgb[None])[0]; threshold = 18.0
    steps = np.linspace(0., 1., 401)[:, None]
    line = np.round(skin_rgb + steps * (cloth_rgb - skin_rgb))
    distance = np.linalg.norm(_srgb_to_lab(line) - mean, axis=1)
    near = line[int(np.argmax((distance > threshold + 1.5) & (distance < threshold + 3.)))]
    image = np.zeros((64, 64, 3), dtype=np.uint8); image[:] = skin_rgb.astype(np.uint8)
    image[:, :32] = near.astype(np.uint8); image[:, :8] = cloth_rgb.astype(np.uint8)
    image[24:40, 16:28] = skin_rgb.astype(np.uint8)
    uvs = np.asarray([[0., 0.], [.5, 0.], [0., 1.], [.5, 1.]]); faces = np.asarray([[0, 1, 2], [1, 3, 2]])
    def patch_distance(rgb: np.ndarray) -> np.ndarray:
        return np.linalg.norm(_srgb_to_lab(rgb[24:40, 16:28].reshape(-1, 3).astype(np.float64)) - mean, axis=1)
    plain, _ = repair_skin_texels(Image.fromarray(image), uvs, faces, mean, threshold)
    assert patch_distance(np.asarray(plain)).max() < threshold + 3.
    payload, stats = encode_skin_clean_texture(Image.fromarray(image), uvs, faces, mean, threshold)
    assert stats["skinTexelsBefore"] == 16 * 12 and stats["replacementMarginDeltaE"] == 6.0
    assert stats["encodedSkinTexelsAfter"] == 0 and stats["encodedSkinRatioAfter"] == 0.0
    with Image.open(BytesIO(payload)) as decoded:
        assert decoded.format == "JPEG"; delivered = np.asarray(decoded.convert("RGB"))
    _, recount = repair_skin_texels(Image.fromarray(delivered), uvs, faces, mean, threshold)
    assert recount["skinTexelsBefore"] == 0
    assert patch_distance(delivered).min() > threshold + 6.
    outside = np.linalg.norm(_srgb_to_lab(delivered[:, 40:].reshape(-1, 3).astype(np.float64)) - mean, axis=1)
    assert outside.max() < 3.0


def test_validate_refit_source_requires_matching_sha() -> None:
    import validate
    root = Path(__file__).resolve().parents[3]
    fixture = root / "assets/default/model3d/dressup/garments/_fixture_bodysuit/refit_identity"
    fit = json.loads((fixture / "fit.json").read_text(encoding="utf-8"))
    skeleton = json.loads((root / fit["body"]["skeleton"]).read_text(encoding="utf-8"))
    assert len(validate._refit_source(fit, fixture / "fit.json", skeleton))
    fit["refitFrom"]["garmentSha256"] = "0" * 64
    try:
        validate._refit_source(fit, fixture / "fit.json", skeleton)
    except ValueError as error:
        assert "garmentSha256" in str(error)
    else:
        raise AssertionError("母版摘要不符时 refit 源必须报错")


def test_untangle_flips_diagonal_of_flipped_sliver() -> None:
    """四边形 a b c d 以 a-c 为对角线；贴合形状里 b 被推过对角线，三角 a b c 朝向与源相反。翻边成 b-d 后
    两种形状下都同向、都不退化；只换索引，顶点不动。没有可行翻边时保持原样并如实报告。"""
    from untangle_glb import untangle
    source = np.asarray([[0., 0., 0.], [1., -.05, 0.], [1., 1., 0.], [0., 1., 0.]])
    final = source.copy(); final[1] = [.55, .6, 0.]
    faces = np.asarray([[0, 1, 2], [0, 2, 3]])
    def normals(points: np.ndarray, tri: np.ndarray) -> np.ndarray:
        corners = points[tri]; return np.cross(corners[:, 1] - corners[:, 0], corners[:, 2] - corners[:, 0])
    assert np.einsum("ij,ij->i", normals(source, faces), normals(final, faces)).min() < 0
    fixed, stats = untangle(source, final, faces)
    assert stats == {"flippedBefore": 1, "edgeFlips": 1, "flippedAfter": 0}
    assert sorted(map(sorted, fixed.tolist())) == [[0, 1, 3], [1, 2, 3]]
    agree = np.einsum("ij,ij->i", normals(source, fixed), normals(final, fixed))
    assert agree.min() > 0 and np.abs(normals(final, fixed)[:, 2]).min() > .3
    lonely, lonely_stats = untangle(source, final, faces[:1])
    assert np.array_equal(lonely, faces[:1]) and lonely_stats["flippedAfter"] == 1 and lonely_stats["edgeFlips"] == 0


def test_untangle_writes_indices_in_place() -> None:
    from untangle_glb import _write_indices
    root = Path(__file__).resolve().parents[3]
    glb = load_glb(root / "assets/default/model3d/dressup/garments/_fixture_bodysuit/_fixture_bodysuit.glb")
    primitive = glb.json["meshes"][0]["primitives"][0]
    faces = np.asarray(glb.accessor(primitive["indices"]), dtype=np.int64).reshape(-1, 3)
    swapped = faces.copy(); swapped[:2] = faces[:2][:, [1, 2, 0]]
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "untangled.glb"; _write_indices(glb, swapped, out); written = load_glb(out)
        rejected = Path(tmp) / "rejected.glb"
        try:
            _write_indices(glb, swapped[:-1], rejected)
        except ValueError:
            assert not rejected.exists()
        else:
            raise AssertionError("面数变化时必须拒绝写回")
    again = written.json["meshes"][0]["primitives"][0]
    assert np.array_equal(np.asarray(written.accessor(again["indices"])).reshape(-1, 3), swapped)
    assert len(written.bin) == len(glb.bin) + (-len(glb.bin) % 4)
    for name, accessor in primitive["attributes"].items():
        assert np.array_equal(np.asarray(written.accessor(again["attributes"][name])), np.asarray(glb.accessor(accessor)))


def test_reference_repair_only_touches_contaminated_texels() -> None:
    """污染区按参考图判：image 里该区已是"清理后的浅灰"（自身不像皮肤），仍要换成同岛远离肤色的布；
    参考图上不像皮肤的纹素（含合法浅布）与岛外纹素逐字节不动。"""
    skin_rgb, cloth_rgb, light_rgb = [210, 160, 135], [20, 70, 120], [190, 195, 205]   # 浅布离肤色均值 ΔE≈31
    mean = _srgb_to_lab(np.asarray([skin_rgb], dtype=np.float64))[0]
    reference = np.zeros((32, 64, 3), dtype=np.uint8); reference[:] = cloth_rgb
    reference[8:20, 10:20] = skin_rgb; reference[2:6, 24:30] = light_rgb; reference[:, 32:] = skin_rgb
    image = reference.copy(); image[8:20, 10:20] = [150, 150, 150]
    uvs = np.asarray([[0., 0.], [.5, 0.], [0., 1.], [.5, 1.]]); faces = np.asarray([[0, 1, 2], [1, 3, 2]])
    repaired, stats = repair_by_reference(Image.fromarray(image), Image.fromarray(reference), uvs, faces, mean)
    output = np.asarray(repaired)
    assert stats["targetTexels"] == 12 * 10 and stats["replacedTexels"] == 12 * 10
    assert np.all(output[8:20, 10:20] == cloth_rgb)
    untouched = np.ones(output.shape[:2], dtype=bool); untouched[8:20, 10:20] = False
    assert np.array_equal(output[untouched], image[untouched])
    assert np.all(output[2:6, 24:30] == light_rgb) and np.all(output[:, 32:] == skin_rgb)


def test_variant_base_replaces_image_losslessly() -> None:
    from io import BytesIO
    from variant_base import replace_image
    root = Path(__file__).resolve().parents[3]
    glb = load_glb(root / "assets/default/model3d/dressup/garments/eq_jinzhuang/extract_run/eq_jinzhuang_raw_aligned.glb")
    primitive = glb.json["meshes"][0]["primitives"][0]
    assert glb.json["images"][0]["mimeType"] == "image/jpeg"
    pixels = (np.arange(16 * 16 * 3) % 251).astype(np.uint8).reshape(16, 16, 3)
    stream = BytesIO(); Image.fromarray(pixels).save(stream, format="PNG")
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "base.glb"; replace_image(glb, 0, stream.getvalue(), "image/png", out); written = load_glb(out)
    assert written.json["images"][0]["mimeType"] == "image/png"
    with Image.open(BytesIO(written.image(0).data)) as decoded:
        assert np.array_equal(np.asarray(decoded.convert("RGB")), pixels)
    again = written.json["meshes"][0]["primitives"][0]
    for name, accessor in [*primitive["attributes"].items(), ("indices", primitive["indices"])]:
        new_accessor = again["indices"] if name == "indices" else again["attributes"][name]
        assert np.array_equal(np.asarray(written.accessor(new_accessor)), np.asarray(glb.accessor(accessor)))


def _variant_provenance(root: Path) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """版型原皮肤污染区（抽取件原贴图相对源肤色均值 ΔE ≤ 阈值 + 余量）与衣物覆盖纹素，口径同 E2b 裁定。"""
    from io import BytesIO
    from bake_texture_layer import rasterize_uv
    garments = root / "assets/default/model3d/dressup/garments"
    cleanup = json.loads((garments / "eq_jinzhuang/fit.json").read_text(encoding="utf-8"))["textureCleanup"]
    base = load_glb(garments / "eq_jinzhuang/eq_jinzhuang.glb"); mesh = base.mesh()
    source = load_glb(garments / "eq_jinzhuang/extract_run/eq_jinzhuang_raw_skinned.glb")
    with Image.open(BytesIO(source.image(0).data)) as image:
        reference = np.asarray(image.convert("RGB"))
    covered = rasterize_uv(mesh, np.zeros(len(mesh.positions), dtype=np.uint8), reference.shape[0]).covered
    lab = _srgb_to_lab(reference.reshape(-1, 3).astype(np.float64)).reshape(reference.shape)
    limit = float(cleanup["deltaEThreshold"]) + float(cleanup["replacementMarginDeltaE"])
    provenance = covered & (np.linalg.norm(lab - np.asarray(cleanup["skinLabMean"]), axis=2) <= limit)
    return provenance, covered, cleanup


def test_delivered_variant_skin_provenance() -> None:
    """交付布衣（GLB 内贴图解码后）：位于版型原皮肤污染区且落在 retexture Lab 盒内的纹素 < 衣物覆盖纹素的 0.1%。"""
    from io import BytesIO
    from retexture_variant import rgb_to_lab
    root = Path(__file__).resolve().parents[3]
    provenance, covered, _ = _variant_provenance(root)
    assert provenance.sum() > 1000, "污染区为空则本测试失去意义"
    for suffix in ("", ".tpl_f_small", ".tpl_f_tall"):
        glb = load_glb(root / f"assets/default/model3d/dressup/garments/eq_buyi/eq_buyi{suffix}.glb")
        with Image.open(BytesIO(glb.image(0).data)) as image:
            lab = rgb_to_lab(np.asarray(image.convert("RGB")).astype(np.float64) / 255.0)
        box = ((lab[..., 0] > 65) & (lab[..., 0] < 95) & (lab[..., 1] > 2) & (lab[..., 1] < 45)
               & (lab[..., 2] > 2) & (lab[..., 2] < 45))
        residue = np.count_nonzero(box & provenance) / np.count_nonzero(covered)
        assert residue < 1e-3, (suffix, residue)


def test_variant_base_keeps_non_target_texels_of_real_base() -> None:
    """真实版型：按来源修补只改污染区（与修补函数同一 UV 岛光栅化），其余纹素（含合法浅布）逐字节不变；污染区修补后远离肤色。"""
    from io import BytesIO
    from extract_garment import _uv_island_labels
    root = Path(__file__).resolve().parents[3]
    garments = root / "assets/default/model3d/dressup/garments"
    cleanup = json.loads((garments / "eq_jinzhuang/fit.json").read_text(encoding="utf-8"))["textureCleanup"]
    mean = np.asarray(cleanup["skinLabMean"]); threshold = float(cleanup["deltaEThreshold"])
    margin = float(cleanup["replacementMarginDeltaE"])
    base = load_glb(garments / "eq_jinzhuang/eq_jinzhuang.glb"); mesh = base.mesh(); faces = mesh.indices.reshape(-1, 3)
    source = load_glb(garments / "eq_jinzhuang/extract_run/eq_jinzhuang_raw_skinned.glb")
    with Image.open(BytesIO(base.image(0).data)) as texture, Image.open(BytesIO(source.image(0).data)) as reference:
        before = np.asarray(texture.convert("RGB")); ref = np.asarray(reference.convert("RGB"))
        repaired, stats = repair_by_reference(texture, reference, mesh.uvs, faces, mean, threshold, margin)
    labels, _ = _uv_island_labels(mesh.uvs, faces, before.shape[1], before.shape[0])
    distance = np.linalg.norm(_srgb_to_lab(ref.reshape(-1, 3).astype(np.float64)).reshape(ref.shape) - mean, axis=2)
    target = (labels > 0) & (distance <= threshold + margin)
    after = np.asarray(repaired); changed = np.any(after != before, axis=2)
    assert stats["targetTexels"] == int(target.sum()) > 1000 and stats["replacedTexels"] == stats["targetTexels"]
    assert not np.any(changed & ~target), int(np.count_nonzero(changed & ~target))
    repaired_distance = np.linalg.norm(_srgb_to_lab(after[target].astype(np.float64)) - mean, axis=1)
    assert np.median(repaired_distance) > threshold + 2 * margin


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


class _NodeTree:
    """apply_arm_abduction 只读 json["nodes"] 的名字与 parents（子 → 父）。"""

    def __init__(self, names: list[str], parents: dict[int, int]) -> None:
        self.json = {"nodes": [{"name": name} for name in names]}; self.parents = parents


def _rigid(rng: np.random.Generator) -> np.ndarray:
    q, _ = np.linalg.qr(rng.normal(size=(3, 3))); q *= np.sign(np.linalg.det(q))
    matrix = np.eye(4); matrix[:3, :3] = q; matrix[:3, 3] = rng.normal(size=3); return matrix


def test_arm_abduction_rotates_arm_subtrees_about_model_forward() -> None:
    """E2c 外展（与运行时 actor 同口径）：左右 Arm 子树在各自动画后的肩关节处绕模型 +Z 转 ±θ，其余节点逐字节不变；
    0 度原样返回；名字带命名空间也认；fit 只认 garment 的 0..20 度。"""
    from validate import _world_matrices, apply_arm_abduction, arm_abduction_deg
    names = ["mixamorig:Hips", "mixamorig:Spine", "mixamorig:LeftShoulder", "mixamorig:LeftArm",
             "mixamorig:LeftForeArm", "mixamorig:RightShoulder", "mixamorig:RightArm", "mixamorig:RightForeArm",
             "mixamorig:Head"]
    tree = _NodeTree(names, {1: 0, 2: 1, 3: 2, 4: 3, 5: 1, 6: 5, 7: 6, 8: 1})
    world = np.stack([_rigid(np.random.default_rng(index)) for index in range(len(names))])
    assert apply_arm_abduction(tree, world, 0.0) is world
    turned = apply_arm_abduction(tree, world, 6.0)
    for root, nodes, sign in ((3, (3, 4), 1.0), (6, (6, 7), -1.0)):
        angle = math.radians(sign * 6.0); c, s = math.cos(angle), math.sin(angle)
        pivot = world[root][:3, 3]; rotate = np.eye(4); rotate[:2, :2] = [[c, -s], [s, c]]
        expected = np.eye(4); expected[:3, 3] = pivot; back = np.eye(4); back[:3, 3] = -pivot
        for node in nodes:
            np.testing.assert_allclose(turned[node], expected @ rotate @ back @ world[node], atol=1e-12)
    for node in (0, 1, 2, 5, 8):
        assert np.array_equal(turned[node], world[node])
    try:
        apply_arm_abduction(_NodeTree(names + ["LeftArm"], {1: 0, 2: 1, 3: 2, 4: 3, 5: 1, 6: 5, 7: 6, 8: 1}),
                            np.concatenate((world, world[:1])), 6.0)
    except ValueError as error:
        assert "LeftArm" in str(error)
    else:
        raise AssertionError("重名 LeftArm 应报错")
    assert arm_abduction_deg({"kind": "garment", "poseOffset": {"armAbductionDeg": 6}}) == 6.0
    assert arm_abduction_deg({"kind": "head", "poseOffset": {"armAbductionDeg": 6}}) == 0.0
    assert arm_abduction_deg({"kind": "garment"}) == 0.0
    for bad in (25, -1, True, "6", float("nan")):
        try:
            arm_abduction_deg({"kind": "garment", "poseOffset": {"armAbductionDeg": bad}})
        except ValueError:
            continue
        raise AssertionError(f"{bad!r} 应报错")
    # 真实模板：带外展的动作采样 = 不带外展的采样再外展；双手向外移
    root = Path(__file__).resolve().parents[3]
    body = load_glb(root / "assets/default/model3d/dressup/templates/tpl_f_medium/body.glb")
    idle = next(item for item in body.json["animations"] if "idle" in str(item.get("name", "")).lower())
    plain, sampled = _world_matrices(body, idle, .4), _world_matrices(body, idle, .4, 6.0)
    np.testing.assert_allclose(sampled, apply_arm_abduction(body, plain, 6.0), atol=1e-12)
    short = [str(node.get("name", "")).rsplit(":", 1)[-1] for node in body.json["nodes"]]
    for side, sign in (("Left", 1.0), ("Right", -1.0)):
        hand = short.index(f"{side}Hand")
        assert sign * (sampled[hand][0, 3] - plain[hand][0, 3]) > .01, side


def _pose_grid(x0: float, columns: int, z: float, step: float = 5.0) -> tuple[np.ndarray, np.ndarray]:
    xs, ys = np.meshgrid(x0 + step * np.arange(columns), step * np.arange(9), indexing="ij")
    points = np.column_stack((xs.ravel(), ys.ravel(), np.full(xs.size, z)))
    index = np.arange(xs.size).reshape(xs.shape); faces = []
    for i in range(columns - 1):
        for j in range(8):
            a, b, c, d = index[i, j], index[i + 1, j], index[i, j + 1], index[i + 1, j + 1]
            faces += [(a, b, d), (a, d, c)]
    return points, np.asarray(faces, dtype=np.int64)


def test_pose_skin_solver_local_tear_and_collision() -> None:
    """E2c 平滑姿势蒙皮（合成，1 mu = 1 mm）：骨 0、2 静止，骨 1 在 walk 帧右移 120 mm、run 帧下沉 10 mm。
    ① 撕裂带：左半绑 0、右半绑 1 → 交界边伸长 120 mm；解后最大伸长回到伸长铰链阈附近（去掉伸长铰链与撕裂平滑时为
    44 mm，已实测）。② 远处棋盘格（骨 0 / 骨 2 交替，二者都不动、无问题）：局部化下保持强先验，最高频图案也只被基础平滑
    抹掉约 0.15（先验处处弱时约 0.6，已实测）。
    ③ 碰撞带：整片绑 1、离地面 5 mm，下沉 10 mm → 可见穿入 5 mm；解后不再穿入。④ 地面全被遮罩隐藏时碰撞带不改。
    ⑤ 同输入两次逐位相同；每行至多 4 骨、和为 1。"""
    from fit_garment import POSE_SKIN_STRETCH_MM, PoseFrame, _pose_skin_solve
    tear_points, tear_faces = _pose_grid(0.0, 61, 30.0)                 # x 0..300，交界 x = 150
    hit_points, hit_faces = _pose_grid(400.0, 13, 5.0)                  # x 400..460，贴地 5 mm
    points = np.concatenate((tear_points, hit_points))
    faces = np.concatenate((tear_faces, hit_faces + len(tear_points)))
    edges = np.unique(np.sort(np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]])), axis=1), axis=0)
    base = np.zeros((len(points), 3)); moving = points[:, 0] >= 150.0
    base[~moving, 0] = 1.0; base[moving, 1] = 1.0
    far = np.flatnonzero(points[:, 0] <= 15.0)                          # 棋盘格：骨 0 / 骨 2 交替
    checker = far[(np.round(points[far, 0] / 5.0) + np.round(points[far, 1] / 5.0)) % 2 == 1]
    base[checker, 0], base[checker, 2] = 0.0, 1.0
    allowed = np.ones_like(base, dtype=bool); loose = np.ones(len(points))
    gx, gy = np.meshgrid(np.arange(-20.0, 600.0, 2.5), np.arange(-20.0, 65.0, 2.5), indexing="ij")
    ground = np.column_stack((gx.ravel(), gy.ravel(), np.zeros(gx.size)))
    up = np.tile([0.0, 0.0, 1.0], (len(ground), 1))

    def bones(offset: tuple[float, float, float]) -> np.ndarray:
        matrices = np.stack((np.eye(4), np.eye(4), np.eye(4))); matrices[1, :3, 3] = offset; return matrices
    frames = [PoseFrame("idle", bones((0.0, 0.0, 0.0)), ground, up),
              PoseFrame("walk", bones((120.0, 0.0, 0.0)), ground, up),
              PoseFrame("run", bones((0.0, 0.0, -10.0)), ground, up)]

    def solve(hidden: np.ndarray | None) -> np.ndarray:
        return _pose_skin_solve(points, edges, base, allowed, loose, frames, 1.0, hidden, rounds=6, refit_rounds=4)[0]
    weights = solve(None)
    assert np.array_equal(weights, solve(None))
    assert np.all(weights >= 0) and np.all(np.count_nonzero(weights, axis=1) <= 4)
    np.testing.assert_allclose(weights.sum(axis=1), 1.0, atol=1e-9)
    rest = np.linalg.norm(points[edges[:, 1]] - points[edges[:, 0]], axis=1)
    growth = 0.0
    for frame in frames:
        posed = np.einsum("vj,jab,vb->va", weights, frame.skin, np.c_[points, np.ones(len(points))])[:, :3]
        growth = max(growth, float((np.linalg.norm(posed[edges[:, 1]] - posed[edges[:, 0]], axis=1) - rest).max()))
    assert growth <= POSE_SKIN_STRETCH_MM + 5.0, growth
    assert np.abs(weights[far] - base[far]).max() < .25, np.abs(weights[far] - base[far]).max()
    hit = len(tear_points) + np.arange(len(hit_points))
    sunk = np.einsum("vj,jab,vb->va", weights[hit], frames[2].skin, np.c_[hit_points, np.ones(len(hit_points))])[:, 2]
    assert sunk.min() > -1.0, sunk.min()
    hidden_weights = solve(np.ones(len(ground), dtype=bool))
    assert np.abs(hidden_weights[hit] - base[hit]).max() < .02


def _dynamic_topology(template: Path, garment: Path, fit: dict[str, Any]) -> tuple[float, int]:
    """72 帧（idle / walk / run 各 24，含 fit 声明的手臂外展）边最大伸长（mm）与塌缩三角数（面积 < bind 5%）。"""
    from validate import _world_matrices, arm_abduction_deg
    from common import lbs
    body = load_glb(template / "body.glb"); asset = load_glb(garment)
    mesh = load_world_mesh(asset, skinned_only=True)
    skeleton_doc = json.loads((template / "skeleton.json").read_text(encoding="utf-8"))
    mm = 1000.0 * float(skeleton_doc["mPerMu"]); degrees = arm_abduction_deg(fit)
    faces = mesh.indices.reshape(-1, 3)
    edges = np.unique(np.sort(np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]])), axis=1), axis=0)
    points = mesh.positions.astype(np.float64)
    rest = np.linalg.norm(points[edges[:, 1]] - points[edges[:, 0]], axis=1) * mm
    def areas(x: np.ndarray) -> np.ndarray:
        return .5 * np.linalg.norm(np.cross(x[faces[:, 1]] - x[faces[:, 0]], x[faces[:, 2]] - x[faces[:, 0]]), axis=1)
    bind_area = areas(points); collapsed = np.zeros(len(faces), dtype=bool); growth = 0.0
    skin = body.skin(); joints = np.asarray(skin.joints)
    for clip in ("idle", "walk", "run"):
        animation = next(item for item in body.json["animations"] if clip in str(item.get("name", "")).lower())
        duration = max(float(np.asarray(body.accessor(item["input"])).max(initial=0)) for item in animation["samplers"])
        for time_sec in np.linspace(0.0, duration, 24, endpoint=False):
            world = _world_matrices(body, animation, float(time_sec), degrees)[joints]
            posed = lbs(mesh.positions, mesh.joints, mesh.weights, world, asset.skin().inverse_bind_matrices)
            length = np.linalg.norm(posed[edges[:, 1]] - posed[edges[:, 0]], axis=1) * mm
            growth = max(growth, float((length - rest).max()))
            collapsed |= (bind_area > 1e-12) & (areas(posed) < .05 * bind_area)
    return growth, int(np.count_nonzero(collapsed))

def test_delivered_garments_dynamic_topology() -> None:
    """E2c 72 帧动态拓扑门（裁定 10-10 14:30 第 3 条）：劲装 / 布衣三体型交付件声明了手臂外展，按声明角度采样 idle /
    walk / run 各 24 帧，边最大伸长 ≤ 30 mm（E2c 前主干 E2b 版 103 mm、traex 版 659 mm）。塌缩三角（任一帧面积 < bind 5%）
    只打印不设门：主干 E2b 版同口径已有百余个，都在胯、腋下、肘、胸下折痕（见 E2c 报告与补充裁定）。"""
    from validate import arm_abduction_deg
    from fit_garment import POSE_SKIN_TEAR_MM
    root = Path(__file__).resolve().parents[3]
    garments = root / "assets/default/model3d/dressup/garments"
    for garment in ("eq_jinzhuang", "eq_buyi"):
        for template in ("tpl_f_medium", "tpl_f_tall", "tpl_f_small"):
            suffix = "" if template == "tpl_f_medium" else f".{template}"
            fit = json.loads((garments / garment / f"fit{suffix}.json").read_text(encoding="utf-8"))
            assert arm_abduction_deg(fit) > 0.0, (garment, template)
            # 裁定 10-10 14:30 第 2 条：采样中伸长超过 8 mm 的边加强平滑；产物与工具常量都不得漂移
            assert fit["weights"]["poseSkin"]["params"]["tearMm"] == POSE_SKIN_TEAR_MM == 8.0, (garment, template)
            growth, collapsed = _dynamic_topology(root / "assets/default/model3d/dressup/templates" / template,
                                                  garments / garment / f"{garment}{suffix}.glb", fit)
            print(f"  {garment}{suffix}: 72 帧最大边伸长 {growth:.1f} mm，塌缩三角 {collapsed}")
            assert growth <= 30.0, (garment, template, growth)


def main() -> int:
    tests = [test_weight_transfer_and_filter, test_edge_template_weights_blend_thirty_mm,
             test_full_template_weight_transfer_is_normalized,
             test_edge_refit_clears_bind_penetration,
             test_surface_query_is_geometric_nearest,
             test_legacy_normal_selected_output_has_real_residual,
             test_push_out, test_hide_regions, test_refit_identity,
             test_refit_changed_bone_lengths, test_fixture_strict_fit, test_align_none_uses_template_weights,
             test_file_nonidentity_refit,
             test_units_skull_and_regions, test_alignment_no_mirror, test_alignment_continuous_pca_yaw,
             test_joint_alignment_mirror_detection, test_joint_alignment_bone_length_scale,
             test_push_gate_failure, test_push_draft_is_explicit,
             test_preserve_shape_prevents_fold_and_stretch, test_volume_push_keeps_layers,
             test_pseudo_normal_sign_on_concave_mesh, test_validate_maps_compacted_garment_to_source,
             test_validate_parity_confirms_a1_inside, test_skin_texture_cleanup_island_scope,
             test_skin_cleanup_survives_jpeg_encoding, test_validate_refit_source_requires_matching_sha,
             test_untangle_flips_diagonal_of_flipped_sliver, test_untangle_writes_indices_in_place,
             test_reference_repair_only_touches_contaminated_texels, test_variant_base_replaces_image_losslessly,
             test_delivered_variant_skin_provenance, test_variant_base_keeps_non_target_texels_of_real_base,
             test_file_identity_and_region, test_arm_abduction_rotates_arm_subtrees_about_model_forward,
             test_pose_skin_solver_local_tear_and_collision, test_delivered_garments_dynamic_topology]
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
