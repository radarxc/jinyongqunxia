#!/usr/bin/env python3
"""cut_head（头颈拼接标准工具）的回归：只写临时目录，真实产物只读复算。"""
from __future__ import annotations

import argparse
import contextlib
from hashlib import sha256
import io
import json
import math
from pathlib import Path
import sys
import tempfile
import traceback
from typing import Any, Sequence

import numpy as np
from PIL import Image
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cut_head import (TAU, CylinderGrid, _masked_surface, _vertex_normals, bake_hide_mask, biharmonic_displacement,
                      boundary_loops, clip_faces, compact_mesh, cylinder, dense_weights, head_floor,
                      hide_mask_integrity, orientation_report, patch_ring_weights, top4_weights, weld_vertices,
                      patch_strip_uvs, process_head, rasterize_cylinder, resample_strip, sample_grid, skin_match,
                      StripLayout, STRIP_GUARD,
                      subdivide_midpoint, PATCH_BOTTOM_MM, BOTTOM_BAND_MM, BOTTOM_LIFT_MM, STRIP_ROWS, ATLAS_SIZE,
                      TOP_BAND_MM, TOP_INSET_MM, _one_sided_weight, inset_under_skin, refine_marked,
                      _animated_cut_plane, _bridge_penetration, _masked_positions, remove_slivers, sliver_faces,
                      output_names, _write_manifest, _drop_variant, fit_neck_to_template, hair_colors, G1_SKIRT_MM,
                      NECK_FIT_BELOW_MM, NECK_FIT_MAX_MM, NECK_FIT_RAMP_MM, drop_collar_remnants,
                      COLLAR_REMNANT_MIN_FACES, level_seam_tone, _srgb_to_lab, SEAM_TONE_BAND_MM, SEAM_TONE_LIGHT_MIN,
                      SEAM_TONE_LIGHT_FULL, SEAM_TONE_REF_MM, SEAM_TONE_HOLD_MM, TOP_COVER_MM, covering_skin_faces,
                      top_band_exposure, collar_adjacent, center_neck_section, bake_strip, MASK_OFFSET_MM,
                      _srgb_to_linear, uv_islands, skyline_pack, pack_head_canvas, load_hd_texture, apply_texel_delta,
                      TextureMismatch, PACK_GUTTER_PX, _library_record, main as cut_head_main)
from common import closest_point_on_triangle, lbs, nearest_triangle
from export_skeleton import _world_mesh
from glb_io import GLBBuilder, Mesh, load_glb
from ingest import ingest
from validate import _resolve_recorded, _signed_distances, _world_matrices

UP = {"center": np.zeros(3), "axis": np.array([0., 1, 0]), "right": np.array([1., 0, 0]), "front": np.array([0., 0, 1])}


def _skin(builder: GLBBuilder, neck_y: float, head_y: float) -> tuple[int, list[int]]:
    neck = builder.add_node(name="mixamorig:Neck", translation=[0, neck_y, 0])
    head = builder.add_node(name="mixamorig:Head", translation=[0, head_y - neck_y, 0])
    builder.document["nodes"][neck]["children"] = [head]
    ibm = np.array([np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, neck_y],
                                            [0, 0, 1, 0], [0, 0, 0, 1]])),
                    np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, head_y],
                                            [0, 0, 1, 0], [0, 0, 0, 1]]))], np.float32)
    return builder.add_skin([neck, head], builder.add_accessor(ibm, type_name="MAT4")), [neck, head]


def _cylinder(rings: list[tuple[float, float]], color_uv: float = .25, segments: int = 64
              ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """外法向（右手绕序朝外）的开口圆柱。"""
    positions, uvs = [], []
    for y, radius in rings:
        for i in range(segments):
            angle = TAU * i / segments
            positions.append([radius * math.cos(angle), y, radius * math.sin(angle)])
            uvs.append([color_uv, .5])
    faces = []
    for row in range(len(rings) - 1):
        for i in range(segments):
            a, b = row * segments + i, row * segments + (i + 1) % segments
            c, d = a + segments, b + segments; faces += [(a, c, b), (b, c, d)]
    return np.asarray(positions, np.float32), np.asarray(faces, np.int64), np.asarray(uvs, np.float32)


def _write_glb(path: Path, positions: np.ndarray, faces: np.ndarray, uvs: np.ndarray,
               neck_y: float, head_y: float, regions: np.ndarray | None = None) -> None:
    joints = np.zeros((len(positions), 4), np.uint16); weights = np.zeros((len(positions), 4), np.float32)
    high = positions[:, 1] >= (neck_y + head_y) / 2; joints[high, 0] = 1; weights[:, 0] = 1
    normals = positions.copy(); normals[:, 1] = 0
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-9)
    mesh = Mesh(positions, faces.reshape(-1).astype(np.uint32), normals, uvs, joints, weights, regions,
                np.zeros(len(faces), np.int32), None, "mock")
    image = Image.new("RGB", (128, 128), (214, 176, 145))
    image.paste((45, 31, 22), (43, 0, 86, 128)); image.paste((225, 191, 166), (86, 0, 128, 128))
    buffer = io.BytesIO(); image.save(buffer, format="PNG")
    builder = GLBBuilder(); skin, nodes = _skin(builder, neck_y, head_y)
    image_id = builder.add_image(buffer.getvalue(), mime_type="image/png"); texture = builder.add_texture(image_id)
    material = builder.add_material(base_color_texture=texture); mesh_id = builder.add_mesh(mesh, material_map=[material])
    mesh_node = builder.add_node(name="mesh", mesh=mesh_id, skin=skin); builder.add_scene([nodes[0], mesh_node])
    builder.document["animations"] = [{"name": name, "samplers": [], "channels": []}
                                      for name in ("idle", "walk", "run")]
    builder.write(path)


def _template(directory: Path) -> None:
    """肩（r 80 mm）→ 颈（r 30 mm）的合成模板；规范环在 y = 1.02（mPerMu = 1）。"""
    directory.mkdir(parents=True)
    positions, faces, uvs = _cylinder([(0, .08), (.95, .08), (1.0, .03), (1.04, .03), (1.08, .03)])
    uvs[:, 0] = .25 + positions[:, 0] * .5
    uvs[:, 1] = np.repeat([.1, .3, .5, .7, .9], 64)
    regions = np.where(positions[:, 1] > 1.03, 0, np.where(positions[:, 1] > .96, 1, 2)).astype(np.uint8)
    _write_glb(directory / "body.glb", positions, faces, uvs, 1.0, 1.1, regions)
    ring = [{"pos": [.03 * math.cos(TAU * i / 64), 1.02, .03 * math.sin(TAU * i / 64)],
             "weights": {"mixamorig:Neck": .75, "mixamorig:Head": .25}} for i in range(64)]
    skeleton = {"schema": "tianshu-dressup-skeleton.v1", "mPerMu": 1., "unit": "mu", "heightMu": 1.3,
                "defaultHeightM": 1.3,
                "source": {"file": str(directory / "body.glb"),
                           "sha256": sha256((directory / "body.glb").read_bytes()).hexdigest()},
                "neckRing": {"centerMu": [0, 1.02, 0], "radiusMu": {"x": .03, "z": .03}, "profile": ring},
                "measures": {"headWidthMu": .12, "headTopMu": [0, 1.24, 0]},
                "skullProfile": {"file": "skull_profile.json"},
                "regions": {"ids": {"head": 0, "neck": 1, "torsoUpper": 2}},
                "joints": ["mixamorig:Neck", "mixamorig:Head"]}
    (directory / "skeleton.json").write_text(json.dumps(skeleton))
    rows = [{"yMu": y} for y in np.linspace(-.03, .09, 25)]
    (directory / "skull_profile.json").write_text(json.dumps({"rows": rows}))


def _source_mapped(path: Path) -> None:
    """同 _source（无高领），但 UV 按柱面展开（u 随角度、v 随高度，各圈一块连续 UV）——给 --texture 的图集排布用。"""
    rings = [(.85, .035), (.95, .035), (1.02, .034), (1.08, .045), (1.14, .06),
             (1.20, .065), (1.26, .05), (1.30, .015)]
    positions, faces, uvs = _cylinder(rings)
    angle = np.arctan2(positions[:, 2], positions[:, 0]) % TAU
    uvs = np.column_stack((.05 + .4 * angle / TAU, .1 + .8 * (1.3 - positions[:, 1]) / .45)).astype(np.float32)
    _write_glb(path, positions, faces, uvs, 1.0, 1.1)


def _source(path: Path, high_collar: bool) -> None:
    """颈管 + 球头；高立领是包住颈部、同样被分成"皮肤"的浅色圆柱（r 55 mm）。"""
    rings = [(.85, .035), (.95, .035), (1.02, .034), (1.08, .045), (1.14, .06),
             (1.20, .065), (1.26, .05), (1.30, .015)]
    positions, faces, uvs = _cylinder(rings)
    if high_collar:
        collar_pos, collar_faces, collar_uv = _cylinder([(.99, .055), (1.05, .055)], .85)
        offset = len(positions); positions = np.concatenate((positions, collar_pos))
        faces = np.concatenate((faces, collar_faces + offset)); uvs = np.concatenate((uvs, collar_uv))
    _write_glb(path, positions, faces, uvs, 1.0, 1.1)


def test_clip_faces_closed_cut() -> None:
    positions, faces, uvs = _cylinder([(0, 1.), (1, 1.), (2, 1.)])
    corner = np.stack((np.asarray([[TAU * (i % 64) / 64, positions[i, 1]] for i in range(len(positions))])[faces]), 0)
    values = np.column_stack((positions[:, 1], np.ones(len(positions))))
    out_p, out_f, out_v, out_c, source = clip_faces(positions, faces, positions[:, 1] - .5, values, corner)
    new = np.arange(len(positions), len(out_p))
    edges = np.unique(np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1), axis=0)
    crossing = np.count_nonzero((positions[edges[:, 0], 1] - .5) * (positions[edges[:, 1], 1] - .5) < 0)
    assert len(new) == crossing == 128, (len(new), crossing)   # 竖边 + 对角边，每条只生成一个切点
    np.testing.assert_allclose(out_p[new, 1], .5, atol=1e-12)
    np.testing.assert_allclose(out_v[new, 0], .5, atol=1e-12)  # 顶点属性线性插值
    used = np.unique(out_f)
    assert np.all(out_p[used, 1] >= .5 - 1e-12)
    loops = boundary_loops(out_f)
    assert sorted(len(loop) for loop in loops) == [64, 128], [len(loop) for loop in loops]
    cut_corners = out_c[np.isin(out_f, new)]
    np.testing.assert_allclose(cut_corners[:, 1], .5, atol=1e-12)  # 逐角属性同样落在切面
    report = orientation_report(out_p, out_f, UP)
    assert report["consistentEdgeRatio"] == 1 and report["outwardAreaRatio"] == 1, report
    # clip_mask = False 的三角原样保留（如头发）。
    keep = np.zeros(len(faces), bool); keep[:4] = True
    _, kept_faces, _, _, kept_source = clip_faces(positions, faces, positions[:, 1] - .5, values, corner, ~keep)
    assert np.all(np.isin(np.arange(4), kept_source))


def test_subdivide_preserves_surface() -> None:
    positions, faces, _ = _cylinder([(0, 1.), (1, 1.)], segments=16)
    corner = np.zeros((len(faces), 3, 2)); corner[:, :, 0] = np.arange(3)
    values = positions[:, 1:2].astype(np.float64)
    p2, f2, v2, c2 = subdivide_midpoint(positions.astype(np.float64), faces, values, corner)
    edges = len(np.unique(np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1), axis=0))
    assert len(f2) == 4 * len(faces) and len(p2) == len(positions) + edges
    np.testing.assert_allclose(v2[:, 0], p2[:, 1], atol=1e-12)
    assert orientation_report(p2, f2, UP)["consistentEdgeRatio"] == 1
    assert orientation_report(p2, f2, UP)["outwardAreaRatio"] == 1
    assert set(np.round(c2[:, :, 0].reshape(-1), 6)) <= {0., .5, 1., 1.5, 2.}


def test_refine_marked_is_watertight() -> None:
    # 红绿局部细分：只加密标记带，邻接面按被分边数一分二 / 升级一分四，无 T 形节点；形状、朝向、逐角属性不变。
    positions, faces, _ = _cylinder([(y, 1.) for y in np.linspace(0, 1, 11)], segments=24)
    positions = positions.astype(np.float64)
    corner = np.repeat(positions[faces][:, :, 1:2], 1, axis=2)
    values = positions[:, 1:2].copy()
    span = positions[faces][:, :, 1]
    marked = (span.max(axis=1) >= .39) & (span.min(axis=1) <= .61)
    p2, f2, v2, c2 = refine_marked(positions, faces, values, corner, marked)
    report = orientation_report(p2, f2, UP)
    assert report["consistentEdgeRatio"] == 1 and report["outwardAreaRatio"] == 1 and report["nonManifoldEdges"] == 0
    assert len(boundary_loops(f2)) == 2                                         # 仍是上下两个开口，没有裂缝
    def area(points: np.ndarray, tris: np.ndarray) -> float:
        return float(.5 * np.linalg.norm(np.cross(points[tris][:, 1] - points[tris][:, 0],
                                                  points[tris][:, 2] - points[tris][:, 0]), axis=1).sum())
    assert abs(area(p2, f2) - area(positions, faces)) < 1e-12
    assert len(f2) > len(faces) + 3 * np.count_nonzero(marked)
    np.testing.assert_allclose(v2[:, 0], p2[:, 1], atol=1e-12)
    np.testing.assert_allclose(c2[:, :, 0], p2[f2][:, :, 1], atol=1e-12)
    untouched = (span.max(axis=1) < .25) | (span.min(axis=1) > .75)            # 离标记带隔一行以上的面原样保留
    assert untouched.any() and {tuple(face) for face in faces[untouched].tolist()} <= {tuple(row) for row in f2.tolist()}


def test_one_sided_transition_and_radial_inset() -> None:
    # A/B 过渡只放在 B 侧：A 区全为 1，B 区按到 A 的距离在宽度内降到 0。
    region = np.zeros(36, bool); region[:20] = True
    weight = _one_sided_weight(region, 4)
    assert np.all(weight[region] == 1) and abs(weight[21] - .5) < 1e-9 and weight[20] > .8 and weight[24] == 0
    np.testing.assert_allclose(weight[33:36], weight[22:19:-1])                 # 两侧边界对称
    assert np.all(weight[~region] < 1)
    # 顶带精确内缩：斜锥面上径向内缩 0.3 只合法向 0.3·cosφ，inset_under_skin 只改半径把法向距离补足到 0.3，(θ,h) 不变。
    mm = .001; rings = [(y, .04 - .5 * y) for y in np.linspace(0, .01, 11)]   # 半径随高度 1:2 收窄（法向偏离径向 26.6°）
    skin, skin_faces, _ = _cylinder(rings, segments=128); skin = skin.astype(np.float64)
    theta = np.linspace(0, TAU, 40, endpoint=False); heights = np.full(40, .005)
    targets = np.column_stack((np.cos(theta), np.zeros(40), np.sin(theta))) * (.04 - .5 * .005 - TOP_INSET_MM * mm)
    targets[:, 1] = heights
    moved, stats = inset_under_skin(targets, np.ones(40, bool), skin, skin_faces, UP, 0., mm)
    from common import signed_distance
    distance = signed_distance(moved, skin, skin_faces, _vertex_normals(skin, skin_faces)).distances_mu / mm
    np.testing.assert_allclose(distance, -TOP_INSET_MM, atol=.01)
    t0, h0, r0 = cylinder(targets, UP); t1, h1, r1 = cylinder(moved, UP)
    np.testing.assert_allclose(t1, t0, atol=1e-12); np.testing.assert_allclose(h1, h0, atol=1e-12)
    assert np.all(r1 < r0) and stats["moved"] == 40


def test_biharmonic_band_constraints() -> None:
    rings = [(y, 1.) for y in np.linspace(0, .6, 31)]
    positions, faces, _ = _cylinder(rings, segments=48); positions = positions.astype(np.float64)
    ring = np.repeat(np.arange(31), 48)
    bottom, top = ring <= 2, ring >= 27
    targets = positions.copy(); targets[top, 0] *= .8; targets[top, 2] *= .8
    displacement, stats = biharmonic_displacement(positions, faces, bottom | top, targets)
    deformed = positions + displacement
    np.testing.assert_allclose(deformed[bottom | top], targets[bottom | top], atol=1e-12)
    assert stats["residualMaxMu"] < 1e-9, stats
    radius = np.hypot(deformed[:, 0], deformed[:, 2]).reshape(31, 48).mean(axis=1)
    assert np.all(np.diff(radius) <= 1e-9), radius             # 单调收窄，无鼓包
    mean_slope = .2 / 24
    assert abs(radius[3] - radius[2]) < .25 * mean_slope, radius    # 两端各钉三圈 → 出约束带处斜率趋零（G1）
    assert abs(radius[27] - radius[26]) < .25 * mean_slope, radius
    assert abs(radius[15] - radius[14]) > mean_slope, radius        # 变形集中在中段


def test_weights_top4_and_ring_interpolation() -> None:
    # 少于 4 根骨骼时补齐到 4 列；权重和为 1，零权重行保持全零。
    joints, weights = top4_weights(np.array([[.2, .6], [0., 0.]]))
    assert joints.shape == weights.shape == (2, 4)
    np.testing.assert_allclose(weights[0].sum(), 1); assert joints[0, 0] == 1 and weights[1].sum() == 0
    dense = dense_weights(np.array([[0, 1, 0, 0]], np.uint16), np.array([[.25, .75, 0, 0]], np.float32), 3)
    np.testing.assert_allclose(dense, [[.25, .75, 0]])
    # 切口处逐角权重 = 颈片三角在切口高度的重心插值（不依赖附近恰有顶点）：Head 权重随高度线性增长。
    positions, faces, _ = _cylinder([(0., .03), (.04, .03)])
    head_share = positions[:, 1] / .04
    ring = patch_ring_weights(positions.astype(np.float64), faces,
                              np.column_stack((1 - head_share, head_share)), UP, .01, bins=36)
    np.testing.assert_allclose(ring[:, 1], .25, atol=1e-6)
    np.testing.assert_allclose(ring.sum(axis=1), 1, atol=1e-9)


def test_weld_and_compact() -> None:
    # UV 缝的重复点按位置焊接，面索引改指唯一点；compact 删去未引用点并同步裁剪属性。
    positions = np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]], np.float32)
    faces = np.array([[0, 1, 2], [3, 4, 2]])
    unique, welded, inverse = weld_vertices(positions, faces)
    assert len(unique) == 4 and inverse[1] == inverse[3]
    assert welded[0, 1] == welded[1, 0]
    extra = np.concatenate((unique, [[9., 9, 9]]))
    kept, kept_faces, (tags,), remap = compact_mesh(extra, welded, np.arange(5.))
    assert len(kept) == 4 and remap[4] == -1 and kept_faces.max() == 3 and list(tags) == [0., 1., 2., 3.]


def _grid(count: int = 5) -> tuple[np.ndarray, np.ndarray]:
    """count × count 点的单位间距平面网格（z = 0，法向 +z）。"""
    positions = np.array([[x, y, 0.] for y in range(count) for x in range(count)])
    faces = []
    for y in range(count - 1):
        for x in range(count - 1):
            a = y * count + x; b, c, d = a + 1, a + count, a + count + 1
            faces += [(a, b, d), (a, d, c)]
    return positions, np.asarray(faces, np.int64)


def _directed_edges_unique(faces: np.ndarray) -> bool:
    edges = np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]))
    return len(np.unique(edges, axis=0)) == len(edges)


def test_remove_slivers_keeps_manifold() -> None:
    # 内部帽形碎条（顶点离最长边 1e-4）与针形碎条（短边 1e-3）：并点 / 翻边后无碎条、仍是一圈边界、
    # 面积不变、逐角 UV 仍是位置的线性函数；直接删同样的碎条会开洞（D1c tall / small 颈片鼓包的根因）。
    positions, faces = _grid()
    faces = [tuple(face) for face in faces]
    # 帽形：内部边 (6,12) 的两侧为 (6,12,...)；在 (6,12) 中点偏 1e-4 处加顶点 p，把含 6→12 的面一分为二并插入碎条。
    a, b = 6, 12
    with_ab = next(face for face in faces if any((face[k], face[(k + 1) % 3]) == (a, b) for k in range(3)))
    c = next(v for v in with_ab if v not in (a, b))
    mid = (positions[a] + positions[b]) / 2 + np.array([1e-4, -1e-4, 0])
    p = len(positions); positions = np.vstack((positions, mid))
    faces.remove(with_ab); faces += [(a, p, c), (p, b, c), (a, b, p)]
    # 针形：内部边 (7,13) 在离 7 只有 1e-3 处劈开，两侧各生成一个针形三角。
    v, w = 7, 13
    n = len(positions); positions = np.vstack((positions, positions[v] + (positions[w] - positions[v]) * 1e-3 / np.sqrt(2)))
    for face in [face for face in faces if v in face and w in face]:
        k = next(k for k in range(3) if {face[k], face[(k + 1) % 3]} == {v, w})
        first, second, third = face[k], face[(k + 1) % 3], face[(k + 2) % 3]
        faces.remove(face); faces += [(first, n, third), (n, second, third)]
    faces = np.asarray(faces, np.int64)
    corners = positions[faces][:, :, :2].copy()                      # UV = (x, y)
    assert sliver_faces(positions, faces, .02).sum() >= 3 and _directed_edges_unique(faces)
    def area(face_array: np.ndarray) -> float:
        tri = positions[face_array]
        return float(np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1).sum() / 2)
    deleted = faces[~sliver_faces(positions, faces, .02)]
    assert len(boundary_loops(deleted)) > 1                          # 旧做法：删内部碎条即开洞
    out, out_corners, stats = remove_slivers(positions, faces, corners, .02, .1)
    assert stats["remaining"] == 0 and not sliver_faces(positions, out, .02).any(), stats
    assert stats["collapsed"] >= 1 and stats["flipped"] >= 1, stats
    assert len(boundary_loops(out)) == 1 and _directed_edges_unique(out)
    assert abs(area(out) - 16.) < 1e-3
    normals = np.cross(positions[out][:, 1] - positions[out][:, 0], positions[out][:, 2] - positions[out][:, 0])
    assert np.all(normals[:, 2] > 0)                                 # 绕序一致（全部朝 +z）
    np.testing.assert_allclose(out_corners, positions[out][:, :, :2], atol=2e-3)


def test_rasterize_cylinder_first_hit() -> None:
    inner, inner_faces, _ = _cylinder([(-.1, .5), (1.1, .5)])
    outer, outer_faces, _ = _cylinder([(-.1, 1.), (1.1, 1.)])
    positions = np.concatenate((inner, outer)).astype(np.float64)
    faces = np.concatenate((inner_faces, outer_faces + len(inner)))
    corner = np.zeros((len(faces), 3, 1)); corner[len(inner_faces):] = 1.
    grid = CylinderGrid(90, 0., 1., 20)
    rho, face, values = rasterize_cylinder(positions, faces, UP, grid, corner_values=corner)
    assert np.all(np.isfinite(rho)) and np.all(face >= 0)
    assert np.abs(rho - .5).max() < 2e-3                         # 颈轴向外的第一层
    assert np.all(values[..., 0] == 0)
    sampled = sample_grid(rho, grid, np.array([0., math.pi]), np.array([.5, .5]))
    np.testing.assert_allclose(sampled, .5, atol=2e-3)
    # 半径是径向射线与三角平面的精确交点：20 棱柱的平面半径 R·cos(π/N)/cos(Δ)，不是沿圆弧插值（弦高 0.012）。
    prism, prism_faces, _ = _cylinder([(0., 1.), (1., 1.)], segments=20)
    coarse = CylinderGrid(360, .1, .9, 4)
    rho, _, _ = rasterize_cylinder(prism.astype(np.float64), prism_faces, UP, coarse)
    offset = np.mod(coarse.theta_centers(), TAU / 20) - math.pi / 20
    np.testing.assert_allclose(rho[:, 0], math.cos(math.pi / 20) / np.cos(offset), atol=1e-9)


def test_head_floor_and_regions() -> None:
    mm = .001; grid = CylinderGrid(360, -40 * mm, 160 * mm, 200)
    theta, height = grid.theta_centers(), grid.h_centers()
    skin = np.full((360, 200), np.inf)
    skin[np.ix_(np.degrees(theta) < 270, height >= 20 * mm)] = 40 * mm
    floor = head_floor({"grid": grid, "skin": skin}, mm)
    assert abs(floor["hHead"] - 22 * mm) < 1.01 * mm, floor["hHead"]
    assert np.count_nonzero(floor["regionA"]) == 270
    assert floor["weightA"][135] > .99 and floor["weightA"][315] < .01
    # 源头整条颈都有皮肤时，切面不低于"底带 + G1 裙带 + 自由段"的下限。
    full = np.full((360, 200), 40 * mm)
    low = head_floor({"grid": grid, "skin": full}, mm)
    assert low["hHeadClampedToMin"] and low["hHead"] >= 5.99 * mm


def test_strip_uv_seam() -> None:
    positions, faces, _ = _cylinder([(1.009, .03), (1.03, .03)])
    frame = {**UP, "center": np.array([0, 1.02, 0])}
    layout = StripLayout(-.013, .032, .131, 176, STRIP_ROWS - STRIP_GUARD - 176)
    uvs, new_faces, origin = patch_strip_uvs(positions.astype(np.float64), faces, frame, layout)
    span = uvs[new_faces][:, :, 0].max(axis=1) - uvs[new_faces][:, :, 0].min(axis=1)
    assert span.max() <= .5 and len(origin) > len(positions)
    assert np.all((uvs[:, 1] > (ATLAS_SIZE - STRIP_ROWS) / ATLAS_SIZE) & (uvs[:, 1] < 1))
    # 分段映射连续、单调；行中心反算高度与正算一致。
    heights = np.linspace(-.013, .131, 500); rows = layout.row_of(heights)
    assert np.all(np.diff(rows) < 0) and abs(layout.row_of(.032) - layout.rows_upper) < 1e-9
    np.testing.assert_allclose(layout.row_of(layout.h_of_rows()), np.arange(layout.rows) + .5, atol=1e-9)
    # 重采样：细网格上随高度线性变化的灰度，重采样后仍等于各行中心高度处的值。
    grid = layout.fine_grid(); fine_h = grid.h_centers()[::-1]
    fine = np.repeat(np.repeat(np.round((fine_h - fine_h.min()) / np.ptp(fine_h) * 255)[:, None, None], 4, 1), 3, 2)
    out = resample_strip(fine.astype(np.uint8), grid, layout)
    expected = np.round((layout.h_of_rows() - fine_h.min()) / np.ptp(fine_h) * 255)
    assert np.abs(out[:, 0, 0].astype(float) - expected).max() <= 1.5


def test_hide_mask_plane() -> None:
    positions = np.array([[-1, .1, 0], [0, .1, 0], [-1, .1, 1], [0, .1, 1],
                          [0, -.1, 0], [1, -.1, 0], [0, -.1, 1], [1, -.1, 1]], np.float32)
    uvs = np.array([[0, 0], [.35, 0], [0, 1], [.35, 1], [.65, 0], [1, 0], [.65, 1], [1, 1]], np.float32)
    faces = np.array([[0, 1, 2], [1, 3, 2], [4, 5, 6], [5, 7, 6]], np.uint32)
    mesh = Mesh(positions, faces.reshape(-1), uvs=uvs, regions=np.array([0] * 4 + [1] * 4, np.uint8))
    allowed = np.ones(4, bool)
    with tempfile.TemporaryDirectory() as temporary:
        output = Path(temporary) / "mask.png"
        stats = bake_hide_mask(output, mesh, allowed, np.array([0., 1, 0]), np.zeros(3), 64)
        pixels = np.asarray(Image.open(output))
        assert pixels[32, 16] > 250 and pixels[32, 48] < 5
        assert stats["mode"] == "L" and stats["transitionPixels"] > 0
        integrity = hide_mask_integrity(mesh, Image.open(output), allowed, np.array([0., 1, 0]), np.zeros(3), 1., .05)
        assert integrity["aboveVisibleTriangles"] == 0 and integrity["belowRetainedTriangles"] == 2, integrity
        # 不在 allowed 里的三角（如手臂）即使高于遮罩平面也不隐藏。
        partial = np.array([True, False, True, True])
        bake_hide_mask(output, mesh, partial, np.array([0., 1, 0]), np.zeros(3), 64)
        surface = _masked_surface(mesh, Image.open(output).convert("L"))
        assert surface["hiddenTriangles"] == 1, surface["hiddenTriangles"]
    # 标准 penetration（D1 口径）：切面以下即使在颈环半径外、压进肩颈 2 mm，也必须计入。
    points = np.array([[0, -.02, 0], [.04, -.02, 0]])
    penetration = _bridge_penetration(np.array([-.002, -.002]), points, np.zeros(3), np.array([0., 1, 0]), .001)
    assert penetration.tolist() == [True, True]
    # 身体在切面以上已经开口；到颈口边缘的负距离不计（只有这一种排除）。
    above = _bridge_penetration(np.array([-.002]), np.array([[0, .02, 0]]), np.zeros(3), np.array([0., 1, 0]), .001)
    assert not above[0]
    # 动画切面随 Neck 骨刚性摆动：绕 x 轴转 30° 的骨把切面中心与法向一起转走。
    cos, sin = math.cos(math.radians(30)), math.sin(math.radians(30))
    bone = np.eye(4); bone[1:3, 1:3] = [[cos, -sin], [sin, cos]]
    center, axis = _animated_cut_plane(np.array([0, .1, 0]), np.array([0., 1, 0]), bone, np.eye(4))
    np.testing.assert_allclose(axis, [0, cos, sin], atol=1e-12)
    np.testing.assert_allclose(center, [0, .1 * cos, .1 * sin], atol=1e-12)


def test_skin_match_uses_true_means() -> None:
    source = np.asarray([[.72, .61, .55]] * 3 + [[.795, .71, .65]] * 2)
    template = np.asarray([[.77, .68, .60]] * 3 + [[.82, .73, .65]] * 2)
    positions = np.asarray([[0., .02, 0.]] * len(source))
    classified = {"skin": np.ones(len(source), dtype=bool)}
    mesh = Mesh(np.zeros((len(template), 3), np.float32), np.array([0, 1, 2], np.uint32),
                regions=np.ones(len(template), np.uint8))
    cut = {"sourceCenter": np.zeros(3), "source": {"axis": np.array([0., 1, 0])}}
    regions = {"regions": {"ids": {"head": 0, "neck": 1}}}
    result = skin_match(source, classified, positions, cut, template, mesh, regions)
    from cut_head import _linear_to_srgb, _srgb_to_lab, _srgb_to_linear, delta_e_cie2000
    expected = _srgb_to_linear(source.mean(axis=0)) / _srgb_to_linear(template.mean(axis=0))
    np.testing.assert_allclose(result["skinTint"], expected, atol=1e-12)
    assert result["deltaE"] < result["deltaEBefore"] and result["deltaE"] < 3
    warm = np.asarray([[.80, .62, .56]] * 4 + [[.84, .66, .60]])
    yellow = np.asarray([[.78, .70, .58]] * 4 + [[.82, .74, .62]])
    hue = skin_match(warm, classified, positions, cut, yellow, mesh, regions)
    assert hue["skinTint"][0] > 1 > hue["skinTint"][1], hue
    inverse = _linear_to_srgb(_srgb_to_linear(yellow) / np.asarray(hue["skinTint"])).mean(axis=0)
    lab = _srgb_to_lab(np.stack((warm.mean(axis=0), inverse)))
    assert delta_e_cie2000(lab[0], lab[1]) > hue["deltaEBefore"]


def test_hair_colors_rule() -> None:
    """头发候选色（D2）：近中性深色、极暗任意色相、棕色算；高饱和深红 / 深蓝 / 深绿衣料与浅色布不算。
    旧规则"均值 < 0.48 或偏棕"把穆念慈深红后领整面当头发保留，后颈出现红色碎片。"""
    hair = np.array([[.10, .08, .07],     # 黑发
                     [.30, .30, .30],     # 灰发
                     [.25, .22, .20],     # 深棕灰
                     [.45, .30, .20],     # 棕发（G/R 0.67）
                     [.12, .03, .03]])    # 极暗（任意色相）
    cloth = np.array([[.45, .08, .08],    # 深红领（穆念慈后领）
                      [.55, .28, .28],    # 红领亮面（G/R 0.51，旧"棕色"线 0.5 会收成头发）
                      [.08, .10, .40],    # 深蓝布
                      [.10, .35, .12],    # 深绿布
                      [.80, .80, .82]])   # 浅色布
    assert hair_colors(hair).all() and not hair_colors(cloth).any(), (hair_colors(hair), hair_colors(cloth))
    assert cloth[0].mean() < .48                                      # 旧规则下深红领算"深色"


def test_neck_fit_monotone_bridge() -> None:
    """D2 颈部粗细适配：两端都向上收而落差不足时，切口处按 Hermite 单调条件 Δ ≤ (s_b + s_t) / 3 收细，向上
    NECK_FIT_RAMP_MM 内线性渐隐；颈壳外、切口下 NECK_FIT_BELOW_MM 以外、喉部外扩、模板外扩、落差已够、B 区一律
    不动；单角封顶 NECK_FIT_MAX_MM；逐角收细量按周期高斯平滑（A 区跨 0° 也连续）。"""
    bins = 360; ring_theta = (np.arange(bins) + .5) * TAU / bins
    h_band_top, h_head, r_b, s_b, s_t = 5., 30., 50., -.2, -.3          # 单位 mm（mm = 1）
    length = h_head - G1_SKIRT_MM - h_band_top
    needed = r_b + length * (s_b + s_t) / 3

    def bridge_rises(r_top: float) -> int:
        """自由段三次 Hermite（底 r_b / s_b → 顶 r_top / s_t）里向上变粗的步数；0 即单调收细。"""
        t = np.linspace(0., 1., 2001)
        curve = ((2 * t ** 3 - 3 * t ** 2 + 1) * r_b + (t ** 3 - 2 * t ** 2 + t) * length * s_b
                 + (-2 * t ** 3 + 3 * t ** 2) * r_top + (t ** 3 - t ** 2) * length * s_t)
        return int(np.count_nonzero(np.diff(curve) > 1e-9))

    hh, aa = (grid.ravel() for grid in np.meshgrid(np.arange(h_head - 10., h_head + 31.), ring_theta[::10],
                                                   indexing="ij"))
    count = len(hh)

    def run(r_cut: float, head_slope: float = s_t, template_slope: float = s_b,
            region_a: np.ndarray | None = None) -> tuple[np.ndarray, dict[str, Any]]:
        radius = np.concatenate((r_cut + head_slope * (hh - h_head),     # 颈壳内的颈子
                                 np.full(count, r_cut * 1.2)))            # 颈壳外（下巴 / 脸）
        theta, height = np.tile(aa, 2), np.tile(hh, 2)
        points = np.column_stack((radius * np.cos(theta), height, radius * np.sin(theta)))
        fitted, stats = fit_neck_to_template(
            points, UP, h_head, h_band_top, ring_theta, np.full(bins, r_cut), np.full(bins, head_slope),
            np.full(bins, r_b), np.full(bins, template_slope), np.ones(bins) if region_a is None else region_a, 1.)
        before, after = cylinder(points, UP), cylinder(fitted, UP)
        assert np.allclose(before[1], after[1]) and np.allclose(np.cos(before[0] - after[0]), 1.)   # 只改半径
        return before[2] - after[2], stats

    r_cut = 48.5
    skirt_bottom = r_cut - TOP_INSET_MM - s_t * G1_SKIRT_MM               # G1 裙带下沿（自由段顶端）
    expected = skirt_bottom - needed
    assert 0 < expected < NECK_FIT_MAX_MM
    assert bridge_rises(skirt_bottom) > 0 and bridge_rises(skirt_bottom - expected) == 0   # 原桥 S 形，收细后单调
    shrink, stats = run(r_cut)
    ramp = np.clip(1 - (hh - h_head) / NECK_FIT_RAMP_MM, 0., 1.) * (hh >= h_head - NECK_FIT_BELOW_MM)
    assert np.allclose(shrink[:count], ramp * expected, atol=1e-9) and np.abs(shrink[count:]).max() < 1e-12, stats
    assert stats["activeAngles"] == bins and abs(stats["amountMaxMm"] - expected) < 1e-9, stats
    assert stats["movedVertices"] == np.count_nonzero(ramp > 0) and abs(stats["freeZoneMm"] - length) < 1e-9, stats
    for case in ({"r_cut": 45.},                                          # 落差已够
                 {"r_cut": r_cut, "head_slope": .3},                      # 喉部往下巴变粗
                 {"r_cut": r_cut, "template_slope": .1},                  # 模板颈子向上外扩
                 {"r_cut": r_cut, "region_a": np.zeros(bins)}):           # B 区
        shrink, stats = run(**case)
        assert np.abs(shrink).max() < 1e-12 and stats["activeAngles"] == stats["movedVertices"] == 0, (case, stats)
    shrink, stats = run(55.)                                              # 缺 9.5 mm：封顶
    assert abs(stats["amountMaxMm"] - NECK_FIT_MAX_MM) < 1e-9 and abs(shrink.max() - NECK_FIT_MAX_MM) < 1e-9, stats
    window = np.zeros(bins); window[:20] = window[-20:] = 1.               # A 区 340°–20°，跨 0°
    shrink, stats = run(r_cut, region_a=window)
    degrees = np.degrees(aa[hh == h_head]); at_cut = shrink[:count][hh == h_head]
    full, off = (degrees < 10.6) | (degrees > 350), (degrees > 29.4) & (degrees < 330.6)   # 离窗口边 ≥ 3σ
    assert full.sum() == 3 and np.allclose(at_cut[full], expected) and np.allclose(at_cut[off], 0., atol=1e-12)
    edge = at_cut[~full & ~off]                                           # 窗口边上渐变
    assert len(edge) == 2 and np.all((edge > 0) & (edge < expected)), edge


def _remnant_head(parts: list[dict[str, Any]]) -> tuple[dict[str, np.ndarray], np.ndarray]:
    """按柱面片拼一个裁后头（UP 框架、mm = 1）：每片 θ0..θ1（度）× h0..h1、半径固定，返回头与逐面片号。"""
    positions, faces, colors, weights, skin, hair, uvs, tags = [], [], [], [], [], [], [], []
    for tag, part in enumerate(parts):
        columns, rows = part.get("columns", 10), part.get("rows", 3)
        theta = np.radians(np.linspace(part["theta"][0], part["theta"][1], columns + 1))
        grid_t, grid_h = np.meshgrid(theta, np.linspace(part["h"][0], part["h"][1], rows + 1), indexing="ij")
        offset = sum(len(item) for item in positions); radius = part["radius"]
        positions.append(np.column_stack((radius * np.cos(grid_t).ravel(), grid_h.ravel(), radius * np.sin(grid_t).ravel())))
        for i in range(columns):
            for j in range(rows):
                a = offset + i * (rows + 1) + j; b = a + rows + 1
                faces += [[a, a + 1, b], [b, a + 1, b + 1]]; tags += [tag, tag]
        count = (columns + 1) * (rows + 1)
        colors.append(np.tile(part.get("color", (.85, .72, .66)), (count, 1)))
        weights.append(np.full(count, part.get("headWeight", .05)))
        skin.append(np.full(count, part.get("skin", True))); hair.append(np.full(count, part.get("hair", False)))
        uvs.append(np.tile(part.get("uv", (.75, .5)), (count, 1)))
    head = {"positions": np.concatenate(positions), "faces": np.asarray(faces), "uvs": np.concatenate(uvs),
            "skin": np.concatenate(skin), "hair": np.concatenate(hair), "headWeight": np.concatenate(weights),
            "colors": np.concatenate(colors)}
    return head, np.asarray(tags)


def _surviving_tags(head: dict[str, np.ndarray], parts: list[dict[str, Any]]) -> list[int]:
    """输出头里每片还剩几个面（按面心落在哪片的 θ / h / 半径范围判）。"""
    theta, height, rho = cylinder(head["positions"][head["faces"]].mean(axis=1), UP)
    degrees = np.degrees(theta); counts = []
    for part in parts:
        inside = ((degrees >= part["theta"][0] - 1e-6) & (degrees <= part["theta"][1] + 1e-6)
                  & (height >= part["h"][0]) & (height <= part["h"][1]) & (np.abs(rho - part["radius"]) < .5))
        counts.append(int(np.count_nonzero(inside)))
    return counts


def test_drop_collar_remnants() -> None:
    """D2 衣领残片：裁后头上比第一层皮肤再往外、以颈部权重为主、不像发丝、成片（≥ COLLAR_REMNANT_MIN_FACES）的
    面整片去掉；第一层皮肤、被当成皮肤的深色发丝、下巴（Head 权重高）、头发面、零星亮面、带外的面都不动。
    给贴图时，切口顶带里贴图过半偏红的第一层面也去掉（GPU 最近纹素口径），带外与 Head 权重高的不动。"""
    h_head = 30.
    parts = [{"theta": (0, 360), "h": (h_head, h_head + 20), "radius": 40., "columns": 72, "rows": 10},   # 真颈皮
             {"theta": (230, 300), "h": (h_head, h_head + 6), "radius": 46., "color": (.87, .77, .71)},  # 浅色内衬 → 删
             {"theta": (310, 340), "h": (h_head, h_head + 3), "radius": 47., "color": (.55, .25, .25)},  # 深红立领 → 删
             {"theta": (150, 180), "h": (h_head, h_head + 10), "radius": 50., "color": (.30, .27, .25)},  # 深色发丝
             {"theta": (80, 100), "h": (h_head + 8, h_head + 11), "radius": 48., "headWeight": .9},       # 下巴
             {"theta": (190, 220), "h": (h_head, h_head + 6), "radius": 46., "hair": True, "skin": False},  # 头发面
             {"theta": (20, 22), "h": (h_head + 1, h_head + 2), "radius": 45., "columns": 1, "rows": 1},  # 零星 2 面
             {"theta": (240, 260), "h": (h_head + 14, h_head + 16), "radius": 46.}]                       # 带外
    head, _ = _remnant_head(parts)
    before = _surviving_tags(head, parts)
    out, stats = drop_collar_remnants(head, UP, h_head, 1.)
    after = _surviving_tags(out, parts)
    assert before == [1440, 60, 60, 60, 60, 60, 2, 60], before
    assert after == [1440, 0, 0, 60, 60, 60, 2, 60], after
    assert stats["dropped"] == 120 and stats["droppedClusters"] == [60, 60] and stats["redTextureDropped"] == 0, stats
    assert stats["ignoredClusterMaxFaces"] == 2 < COLLAR_REMNANT_MIN_FACES, stats
    assert abs(stats["droppedOutwardMaxMm"] - 7.) < .2 and len(out["colors"]) == len(out["positions"]), stats
    assert set(out) == set(head)                                                  # 逐顶点属性随面一起压缩
    # 贴图：左半红领、右半肤色；切口顶带（≤ 切口 + 4 mm）里贴图偏红的第一层面去掉。
    texture = np.zeros((8, 8, 3)); texture[:, :4] = (.55, .25, .25); texture[:, 4:] = (.85, .72, .66)
    parts = [{"theta": (0, 360), "h": (h_head, h_head + 20), "radius": 40., "columns": 72, "rows": 10},
             {"theta": (100, 110), "h": (h_head, h_head + 2), "radius": 40., "uv": (.25, .5), "columns": 2, "rows": 1},
             {"theta": (120, 130), "h": (h_head + 5, h_head + 7), "radius": 40., "uv": (.25, .5), "columns": 2, "rows": 1},
             {"theta": (140, 150), "h": (h_head, h_head + 2), "radius": 40., "uv": (.25, .5), "headWeight": .9,
              "columns": 2, "rows": 1},
             {"theta": (160, 170), "h": (h_head, h_head + 2), "radius": 40., "uv": (.75, .5), "columns": 2, "rows": 1}]
    head, _ = _remnant_head(parts)
    out, stats = drop_collar_remnants(head, UP, h_head, 1., texture)
    assert stats["redTextureDropped"] == 4 and stats["dropped"] == 0, stats
    assert len(out["faces"]) == len(head["faces"]) - 4, (len(out["faces"]), len(head["faces"]))
    untouched, _ = drop_collar_remnants(head, UP, h_head, 1.)                    # 不给贴图：只做几何判定
    assert len(untouched["faces"]) == len(head["faces"])


def test_top_band_covering_skin() -> None:
    """D2 顶带外露口径：只对覆盖皮肤（bind 时离重叠带 ≤ TOP_COVER_MM 的头皮面）量。远处一片头皮在动作中贴到颈后
    （头后仰时后脑贴近颈后的自接触）时，全局最近头皮面会换成它、把皮下的顶带点算成露出——覆盖皮肤口径不受影响；
    覆盖皮肤本身塌进顶带以内（真正露出）时照样量出正值。单位：1 mu = 1 mm。"""
    h_head, radius, columns, rows = 10., 40., 72, 20
    theta = np.radians(np.linspace(0., 360., columns, endpoint=False)); heights = np.linspace(h_head, h_head + 20, rows + 1)
    grid_t, grid_h = np.meshgrid(theta, heights, indexing="ij")
    neck = np.column_stack((radius * np.cos(grid_t).ravel(), grid_h.ravel(), radius * np.sin(grid_t).ravel()))
    faces = []
    for i in range(columns):
        for j in range(rows):
            a = i * (rows + 1) + j; b = ((i + 1) % columns) * (rows + 1) + j
            faces += [[a, a + 1, b], [b, a + 1, b + 1]]                    # 法向朝外
    neck_faces = np.asarray(faces)
    def flap(r: float, h: float, at: float) -> np.ndarray:                # θ = at 处一小片外法向朝外的头皮（4 mm 见方）
        t = np.radians([at - 3, at - 3, at + 3, at + 3]); y = np.array([h - 2, h + 2, h - 2, h + 2])
        return np.column_stack((r * np.cos(t), y, r * np.sin(t)))
    flap_bind = flap(55., 45., 90.); flap_start = len(neck)
    flap_faces = np.array([[0, 1, 2], [2, 1, 3]]) + flap_start
    band_t = np.radians(np.arange(0., 360., 10.)); band_h = np.full(len(band_t), h_head + 2.)
    band = np.column_stack(((radius - TOP_INSET_MM) * np.cos(band_t), band_h, (radius - TOP_INSET_MM) * np.sin(band_t)))
    bind = np.concatenate((neck, flap_bind, band)); top_ids = np.arange(len(neck) + 4, len(bind))
    skin_faces = np.concatenate((neck_faces, flap_faces))
    cover = covering_skin_faces(bind, skin_faces, bind[top_ids], TOP_COVER_MM)
    assert len(cover) and not np.isin(flap_faces, cover).all(axis=1).any(), "远处那片头皮不属于覆盖皮肤"
    assert len(covering_skin_faces(bind, skin_faces, bind[top_ids][:0], TOP_COVER_MM)) == 0
    def run(posed: np.ndarray) -> dict[str, np.ndarray]:
        return top_band_exposure(posed, bind, top_ids, cover, skin_faces, UP, h_head, .001)
    still = run(bind)
    np.testing.assert_allclose(still["cover"], -TOP_INSET_MM, atol=1e-3)            # 72 边形：弦面比顶点列浅 0.3 µm 级
    np.testing.assert_allclose(still["any"], still["cover"], atol=1e-9)    # 无自接触：两种口径逐点相同
    contact = bind.copy(); contact[flap_start:flap_start + 4] = flap(radius - TOP_INSET_MM - .2, h_head + 2., 90.)
    touched = run(contact)
    assert touched["anyAbove"].all() and touched["any"].max() > .1, touched["any"].max()          # 全局口径误报露出
    assert touched["coverAbove"].all() and touched["cover"].max() <= -.25, touched["cover"].max()  # 覆盖皮肤口径仍在皮下
    collapsed = bind.copy(); collapsed[:len(neck)] = neck * np.array([(radius - .5) / radius, 1, (radius - .5) / radius])
    opened = run(collapsed)
    assert opened["cover"].max() > .1 and opened["coverAbove"].all(), opened["cover"].max()     # 真露出照样拦下


def test_center_neck_section() -> None:
    """D2c 颈子截面对中：头皮截面圆心在轴上、模板颈子截面圆心偏前右 (5, 8) mm；逐角半径拟合两圆心后平移整头，
    缺掉后颈 100° 的角度（发帘挡住）也不偏。单位 1 mu = 1 mm。"""
    theta = (np.arange(360) + .5) * (TAU / 360)
    def ring(cx: float, cz: float, radius: float) -> np.ndarray:  # 圆心 (cx, cz) 的圆在各角方向上的极径
        b = cx * np.cos(theta) + cz * np.sin(theta)
        return b + np.sqrt(np.maximum(b * b - (cx * cx + cz * cz - radius * radius), 0.))
    head_ring, template_ring = ring(0., 0., 40.), ring(5., 8., 42.)
    gap = head_ring.copy(); gap[220:320] = np.nan                  # 后颈一段量不到
    points = np.array([[0., 18., 40.], [10., 30., -5.]])
    for measured in (head_ring, gap):
        moved, shift, info = center_neck_section(points, UP, 18., measured, template_ring, theta, 1.)
        np.testing.assert_allclose(shift, [5., 0., 8.], atol=.35)   # 右 = +x、前 = +z
        np.testing.assert_allclose(moved - points, np.repeat(shift[None], 2, 0), atol=1e-12)
        assert abs(info["shiftNormMm"] - np.hypot(5, 8)) < .35 and info["headAngles"] == info["templateAngles"] in (360, 260), info
        assert info["anglesDeg"] == ([[0, 359]] if measured is head_ring else [[0, 219], [320, 359]]), info["anglesDeg"]
    # 截面不是正圆（椭圆）时，只在共同角度上拟合才不偏：头皮缺后颈 100° 仍得到与满圈相同的平移。
    squash = 1 + .12 * np.cos(2 * theta)
    full = center_neck_section(points, UP, 18., ring(0., 0., 40.) * squash, ring(5., 8., 42.) * squash, theta, 1.)[1]
    part = center_neck_section(points, UP, 18., np.where(np.isnan(gap), np.nan, ring(0., 0., 40.) * squash),
                               ring(5., 8., 42.) * squash, theta, 1.)[1]
    assert np.linalg.norm(full - part) < .5, (full, part)          # 椭圆两边半径不同时仍有约 0.3 mm 残差，远小于 1 mm 门
    try:
        center_neck_section(points, UP, 18., head_ring, ring(30., 0., 42.), theta, 1.)
    except ValueError as error:
        assert "疑似量测异常" in str(error)
    else:
        raise AssertionError("偏差超上限应报错")


def test_body_tint_seam_reference() -> None:
    """D2c 身体染色对准下接缝（作者"身体颜色和脖子下面接缝附近颜色对齐"）：模板颈子贴图上浅下深，头皮均匀色。
    bake_strip 的 gainSeamMean = 切口头色 ÷ 遮罩平面附近的模板色（下接缝），与同高度口径 gainMean 不同；按它染色重烘后
    下接缝残余增益为 1。单位 1 mu = 1 m。"""
    mm = .001; h_head = .018; radius = .040
    columns, rows = 72, 40
    t = (np.arange(columns + 1) / columns) * TAU; h = np.linspace(-.013, h_head + .004, rows + 1)
    tt, hh = np.meshgrid(t, h, indexing="ij")
    patch_points = np.column_stack((radius * np.cos(tt).ravel(), hh.ravel(), radius * np.sin(tt).ravel()))
    faces = []
    for i in range(columns):
        for j in range(rows):
            a = i * (rows + 1) + j; b = a + rows + 1
            faces += [[a, a + 1, b], [b, a + 1, b + 1]]
    faces = np.asarray(faces)
    uv = np.column_stack(((tt / TAU).ravel(), ((h[-1] - hh) / (h[-1] - h[0])).ravel()))   # v 向下：顶行 = 高处
    body = np.zeros((128, 64, 3), np.uint8)
    top, bottom = np.array([226., 196., 176.]), np.array([180., 150., 132.])
    for row in range(128): body[row] = np.round(top + (bottom - top) * row / 127)
    head_h = np.linspace(h_head, h_head + .03, 16)
    ht, hv = np.meshgrid(t, head_h, indexing="ij")
    head_points = np.column_stack(((radius + .0003) * np.cos(ht).ravel(), hv.ravel(), (radius + .0003) * np.sin(ht).ravel()))
    head_faces = []
    for i in range(columns):
        for j in range(len(head_h) - 1):
            a = i * len(head_h) + j; b = a + len(head_h)
            head_faces += [[a, a + 1, b], [b, a + 1, b + 1]]
    # 头皮贴图 v 随高度线性（切口 v = 0），第三行起换成另一种颜色：切口头色只许由切口以上首两行决定。
    head_v = (hv.ravel() - h_head) / .03
    head = {"positions": head_points, "faces": np.asarray(head_faces), "skin": np.ones(len(head_points), bool),
            "uvs": np.column_stack((np.full(len(head_points), .5), head_v))}
    floor = {"hHead": h_head, "weightA": np.ones(360)}
    layout = StripLayout(-.014, h_head + .008, .131, 176, STRIP_ROWS - STRIP_GUARD - 176)
    grid_h = layout.fine_grid().h_centers(); cut_rows = grid_h[grid_h >= h_head][:3]
    head_color, third_color = np.array([205., 172., 152.]), np.array([120., 80., 60.])
    split = ((cut_rows[1] + cut_rows[2]) / 2 - h_head) / .03          # 第二、三行之间换色（贴图 512 行，两侧各隔一个像素以上）
    head_pixels = np.where((np.arange(512)[:, None, None] + .5) / 512 < split, head_color, third_color)
    head_image = Image.fromarray(np.broadcast_to(head_pixels, (512, 8, 3)).astype(np.uint8))
    patch = {"sourcePositions": patch_points, "faces": faces, "cornerUvs": uv[faces]}
    args = (layout.fine_grid(), Image.fromarray(body))
    _, info = bake_strip(patch, UP, args[0], args[1], np.ones(3), head, head_image, floor, np.array([.03, .02, .015]), mm)
    lin = lambda srgb: _srgb_to_linear(np.asarray(srgb, float) / 255)
    def body_at(height: float) -> np.ndarray:                       # 贴图在该高度的线性色（与 cornerUvs 同一映射）
        v = (h[-1] - height) / (h[-1] - h[0]); y = np.clip(v * 128 - .5, 0, 127)
        return lin(top + (bottom - top) * y / 127)
    seam_h = (PATCH_BOTTOM_MM + MASK_OFFSET_MM) * mm
    np.testing.assert_allclose(info["gainSeamMean"], lin(head_color) / body_at(seam_h), rtol=.03)
    three_rows = (2 * lin(head_color) + lin(third_color)) / 3 / body_at(seam_h)   # 若取三行会得到的增益
    assert np.all(np.abs(np.asarray(info["gainSeamMean"]) - three_rows) > .1 * three_rows), (info["gainSeamMean"], three_rows)
    np.testing.assert_allclose(info["gainMean"], lin(head_color) / body_at(h_head), rtol=.03)
    assert np.all(info["gainSeamMean"] > info["gainMean"] * 1.1), (info["gainSeamMean"], info["gainMean"])   # 上浅下深
    assert info["seamAngles"] > 300 and info["seamRows"] > 0, info
    _, again = bake_strip(patch, UP, args[0], args[1], np.asarray(info["gainSeamMean"]), head, head_image, floor,
                          np.array([.03, .02, .015]), mm)
    np.testing.assert_allclose(again["gainSeamMean"], 1., atol=.01)   # 对准后下接缝残余增益为 1


def test_level_seam_tone() -> None:
    """D2 切口带调平：切口带中位亮度比本人参考肤色亮 ≥ SEAM_TONE_LIGHT_MIN 的角度，切口以上 SEAM_TONE_BAND_MM 内的
    头皮纹素向同角度参考段的颜色插值（HOLD 内全量、BAND 处归零）；BAND 以上与未触发的角度逐字节不动；全无亮带时
    原图原样返回（黄蓉这类无污染的头不受影响）。"""
    h_head, radius, span = 30., 40., 40.
    columns, rows = 72, 40
    theta = np.radians(np.linspace(0., 360., columns + 1)); heights = np.linspace(h_head, h_head + span, rows + 1)
    grid_t, grid_h = np.meshgrid(theta, heights, indexing="ij")
    positions = np.column_stack((radius * np.cos(grid_t).ravel(), grid_h.ravel(), radius * np.sin(grid_t).ravel()))
    uvs = np.column_stack(((grid_t / TAU).ravel(), (1 - (grid_h - h_head) / span).ravel()))
    faces = []
    for i in range(columns):
        for j in range(rows):
            a = i * (rows + 1) + j; b = a + rows + 1
            faces += [[a, a + 1, b], [b, a + 1, b + 1]]
    head = {"positions": positions, "faces": np.asarray(faces), "uvs": uvs, "skin": np.ones(len(positions), bool),
            "hair": np.zeros(len(positions), bool)}
    width, height = 360, 160                                   # 纹素 (x, y) ↔ θ = x + 0.5 度，h = 切口 + (1 − v)·span
    skin = np.array([204, 173, 158], np.uint8); light = np.array([230, 209, 194], np.uint8)
    texel_theta = (np.arange(width) + .5) * 360 / width
    texel_h = (1 - (np.arange(height) + .5) / height) * span
    clean = np.tile(skin, (height, width, 1))
    texture = clean.copy()
    texture[np.ix_(texel_h < 8, texel_theta >= 180)] = light    # 后半圈切口以上 8 mm 一条亮带（白内领烘进颈皮）
    reference = skin / 255.
    out, stats = level_seam_tone(texture, head, UP, h_head, reference, 1.)
    assert stats["angles"] > 150 and stats["texelsChanged"] > 0 and stats["probeExcessMaxL"] > SEAM_TONE_LIGHT_MIN, stats
    lab_skin = _srgb_to_lab(reference[None, :])[0]
    def lightness(block: np.ndarray) -> np.ndarray:
        return _srgb_to_lab(block.reshape(-1, 3) / 255.)[:, 0]
    hold = np.ix_(texel_h < SEAM_TONE_HOLD_MM - .25, (texel_theta > 200) & (texel_theta < 340))
    assert np.abs(lightness(out[hold]) - lab_skin[0]).max() < 1.0          # 保持区内整段拉回参考段肤色
    mid = np.ix_((texel_h > 6.5) & (texel_h < 7.5), (texel_theta > 200) & (texel_theta < 340))
    before, after = lightness(texture[mid]), lightness(out[mid])
    assert np.all(after < before - 1.) and np.all(after > lab_skin[0] + .5)  # 往上渐弱：只拉回一部分
    assert np.array_equal(out[texel_h > SEAM_TONE_BAND_MM + .5], texture[texel_h > SEAM_TONE_BAND_MM + .5])
    assert np.array_equal(out[:, (texel_theta > 20) & (texel_theta < 160)],
                          texture[:, (texel_theta > 20) & (texel_theta < 160)])  # 未触发的角度逐字节不动
    noisy = clean.copy(); noisy[texel_h < 6] = np.array([209, 178, 162], np.uint8)   # 只亮约 +2 L*：不算污染
    untouched, quiet = level_seam_tone(noisy, head, UP, h_head, reference, 1.)
    assert quiet["angles"] == 0 and quiet["texelsChanged"] == 0 and np.array_equal(untouched, noisy), quiet
    assert SEAM_TONE_REF_MM[0] > SEAM_TONE_BAND_MM
    # 只调贴着衣领的角度（D2 第三版素模）：切口下整圈是皮肤时同一条亮带原样保留；只有后半圈 200°–340° 贴衣领时，
    # 只有那段被调、前半圈逐字节不动。
    bare, bare_stats = level_seam_tone(texture, head, UP, h_head, reference, 1., np.zeros(360, bool))
    assert np.array_equal(bare, texture) and bare_stats["texelsChanged"] == 0 and bare_stats["collarDeg"] == [], bare_stats
    collar = np.zeros(360, bool); collar[200:340] = True
    part, part_stats = level_seam_tone(texture, head, UP, h_head, reference, 1., collar)
    assert part_stats["collarDeg"] == list(range(200, 340)) and part_stats["texelsChanged"] > 0, part_stats
    assert np.abs(lightness(part[np.ix_(texel_h < SEAM_TONE_HOLD_MM - .25, (texel_theta > 215) & (texel_theta < 325))])
                  - lab_skin[0]).max() < 1.0
    assert np.array_equal(part[:, (texel_theta > 180) & (texel_theta < 185)], texture[:, (texel_theta > 180) & (texel_theta < 185)])


def test_collar_adjacent() -> None:
    """collar_adjacent：切口下方 SEAM_TONE_COLLAR_MM 内、颈壳半径 15–75 mm 处有衣料面（非皮肤、非头发）的角度。
    颈子整圈皮肤；后半圈（180°–360°）切口下 5 mm 处一圈衣领；前半圈切口下 30 mm（带外）一圈衣料；
    左侧一片垂到切口下的头发、前右 20°–60° 切口下一圈 100 mm 外的肩部衣料，都不算。单位 1 mu = 1 mm。"""
    h_head = 20.
    def ring(radius: float, lo: float, hi: float, start: float, stop: float, columns: int = 72) -> tuple[np.ndarray, np.ndarray]:
        t = np.radians(np.linspace(start, stop, columns + 1)); y = np.array([lo, hi])
        tt, yy = np.meshgrid(t, y, indexing="ij")
        points = np.column_stack((radius * np.cos(tt).ravel(), yy.ravel(), radius * np.sin(tt).ravel()))
        faces = []
        for i in range(columns):
            a = 2 * i; b = a + 2
            faces += [[a, a + 1, b], [b, a + 1, b + 1]]
        return points, np.asarray(faces)
    parts = [("skin", ring(40., -40., 60., 0., 360., 144)), ("cloth", ring(42., 12., 17., 180., 360.)),
             ("cloth", ring(42., -14., -8., 0., 180.)), ("hair", ring(44., 5., 30., 150., 170., 8)),
             ("cloth", ring(100., 10., 18., 20., 60., 8))]
    positions, faces, skin, hair = [], [], [], []
    for kind, (points, tri) in parts:
        faces.append(tri + sum(len(p) for p in positions)); positions.append(points)
        skin.append(np.full(len(points), kind == "skin")); hair.append(np.full(len(points), kind == "hair"))
    positions, faces = np.concatenate(positions), np.concatenate(faces)
    adjacent = collar_adjacent(positions, faces, np.concatenate(skin), np.concatenate(hair), UP, h_head, 1.)
    assert adjacent.shape == (360,)
    assert adjacent[185:355].all() and not adjacent[5:175].any(), np.flatnonzero(adjacent)[:20]
    assert not collar_adjacent(positions, faces, np.ones(len(positions), bool), np.zeros(len(positions), bool),
                               UP, h_head, 1.).any()                                   # 全是皮肤：无衣领


def _slopes(points: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray], lo: float, hi: float,
            at: float) -> tuple[np.ndarray, np.ndarray]:
    """逐 1° 首层光栅化后线性拟合 r(h)：返回斜率与外推到 h=at 的半径。"""
    grid = CylinderGrid(360, lo, hi, 8)
    rho, _, _ = rasterize_cylinder(points, faces, frame, grid)
    heights = grid.h_centers(); slope, value = np.full(360, np.nan), np.full(360, np.nan)
    for index in range(360):
        valid = np.isfinite(rho[index])
        if np.count_nonzero(valid) >= 3:
            fitted, intercept = np.polyfit(heights[valid], rho[index][valid], 1)
            slope[index], value[index] = fitted, fitted * at + intercept
    return slope, value


def _skin_faces(glb: Any, mesh: Mesh, faces: np.ndarray) -> np.ndarray:
    """独立判皮（不读生产分类）：图集上三角三角色的平均亮度 > 0.35 为皮肤（黄蓉发色 L≈0.15、肤色 L≈0.7）。"""
    from cut_head import _image_bytes
    image = np.asarray(Image.open(io.BytesIO(_image_bytes(glb.path, glb.json, glb.bin, glb.json["textures"][0]["source"])))
                       .convert("RGB"), dtype=np.float64) / 255
    height, width = image.shape[:2]; uvs = mesh.uvs.astype(np.float64)
    colors = image[np.clip((uvs[:, 1] * height).astype(int), 0, height - 1), np.clip((uvs[:, 0] * width).astype(int), 0, width - 1)]
    luma = colors @ np.array([.2126, .7152, .0722])
    return faces[luma[faces].mean(axis=1) > .35]


def _seam_band_light(template_dir: Path, asset: Path, files: dict[str, str], reference_srgb: Sequence[float],
                     collar_deg: Sequence[int] | None = None) -> dict[str, Any]:
    """交付图集上的切口亮带（D2）：逐角量切口以上 0–4 mm 头皮的中位亮度，与同角度 SEAM_TONE_REF_MM 段比、也与本人
    参考肤色比；比上方亮 2 L* 以上、且比本人肤色亮到调平全量线 SEAM_TONE_LIGHT_FULL 以上的角度即"切口处一条亮带"
    （穆念慈第二版调平前 93 个角度、调平后 0；下巴下方喉部的自然明暗在全量线以下）。按 GPU 最近纹素取样。
    collar_deg（fit 的 seamTone.collarDeg）给出时只数贴着衣领的角度：切口下仍是皮肤处的亮是天然明暗（素模后颈）。"""
    from cut_head import _bone_frame, _image_bytes
    body_glb = load_glb(template_dir / "body.glb"); head_glb = load_glb(asset / files["glb"]); head, _, _ = _world_mesh(head_glb)
    fit = json.loads((asset / files["fit"]).read_text()); skeleton = json.loads((template_dir / "skeleton.json").read_text())
    mm = 1 / (1000 * float(skeleton["mPerMu"])); h_head = fit["diagnostics"]["cut"]["headFloorMm"] * mm
    neck_id = skeleton["regions"]["ids"]["neck"]; faces = head.indices.reshape(-1, 3)
    skin_faces = _skin_faces(head_glb, head, faces[np.all(head.regions[faces] != neck_id, axis=1)])
    names = [body_glb.json["nodes"][n].get("name", "") for n in body_glb.skin().joints]
    bone = _bone_frame(body_glb, {name: i for i, name in enumerate(names)})
    frame = {"center": np.asarray(skeleton["neckRing"]["centerMu"], float), "axis": bone["axis"],
             "right": bone["right"], "front": bone["front"]}
    top = SEAM_TONE_REF_MM[1]
    grid = CylinderGrid(360, h_head, h_head + top * mm, int(round(top * 4)))
    rho, _, uv = rasterize_cylinder(head.positions.astype(np.float64), skin_faces, frame, grid,
                                    corner_values=head.uvs.astype(np.float64)[skin_faces])
    atlas = np.asarray(Image.open(io.BytesIO(_image_bytes(head_glb.path, head_glb.json, head_glb.bin,
                                                          head_glb.json["textures"][0]["source"]))).convert("RGB"))
    height, width = atlas.shape[:2]; covered = np.isfinite(rho) & np.all(np.isfinite(uv), axis=-1)
    x = np.clip(np.floor(np.nan_to_num(uv[..., 0]) * width).astype(int), 0, width - 1)
    y = np.clip(np.floor(np.nan_to_num(uv[..., 1]) * height).astype(int), 0, height - 1)
    lightness = _srgb_to_lab(atlas[y, x].reshape(-1, 3) / 255.).reshape(covered.shape + (3,))[..., 0]
    rows = (grid.h_centers() - h_head) / mm
    band_rows, ref_rows = rows < 4, (rows >= SEAM_TONE_REF_MM[0]) & (rows < SEAM_TONE_REF_MM[1])
    usable = (covered[:, band_rows].sum(axis=1) > 0) & (covered[:, ref_rows].sum(axis=1) > 0)
    band = np.array([np.median(lightness[i, band_rows][covered[i, band_rows]]) if usable[i] else np.nan for i in range(360)])
    ref = np.array([np.median(lightness[i, ref_rows][covered[i, ref_rows]]) if usable[i] else np.nan for i in range(360)])
    reference = _srgb_to_lab(np.asarray(reference_srgb, float)[None, :])[0][0]
    step = band - ref
    light = usable & (step > 2.) & (band - reference > SEAM_TONE_LIGHT_FULL)
    if collar_deg is not None: light &= np.isin(np.arange(360), np.asarray(collar_deg, dtype=int))
    return {"angles": int(usable.sum()), "lightAngles": int(light.sum()),
            "stepMaxL": float(np.nanmax(step)) if usable.any() else 0., "bandExcessMaxL": float(np.nanmax(band - reference))
            if usable.any() else 0.}


def _neck_center_gap(template_dir: Path, asset: Path, files: dict[str, str]) -> float:
    """交付头在切口以上 0.5 mm 处的头皮截面中心与模板颈子截面中心之差（mm，D2c）：两者逐角首层半径按
    r = R + cx·cosθ + cz·sinθ 最小二乘拟合圆心。头皮按图集亮度判（_skin_faces），与生产的分类独立。"""
    from cut_head import _bone_frame
    body_glb = load_glb(template_dir / "body.glb"); body, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / files["glb"]); head, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text())
    fit = json.loads((asset / files["fit"]).read_text())
    mm = 1 / (1000 * float(skeleton["mPerMu"])); probe = (fit["diagnostics"]["cut"]["headFloorMm"] + .5) * mm
    names = [body_glb.json["nodes"][n].get("name", "") for n in body_glb.skin().joints]
    bone = _bone_frame(body_glb, {name: i for i, name in enumerate(names)})
    frame = {"center": np.asarray(skeleton["neckRing"]["centerMu"], float), "axis": bone["axis"],
             "right": bone["right"], "front": bone["front"]}
    neck_id = skeleton["regions"]["ids"]["neck"]; faces = head.indices.reshape(-1, 3)
    skin = _skin_faces(head_glb, head, faces[np.all(head.regions[faces] != neck_id, axis=1)])
    grid = CylinderGrid(360, probe - 1e-6, probe + 1e-6, 1); theta = grid.theta_centers()
    head_r = rasterize_cylinder(head.positions.astype(np.float64), skin, frame, grid, rho_min=4 * mm)[0][:, 0]
    body_r = rasterize_cylinder(body.positions.astype(np.float64), body.indices.reshape(-1, 3), frame, grid, rho_min=4 * mm)[0][:, 0]
    # 看得见的 A 区（与 _independent 同口径：切口以上 10 mm 内头皮覆盖 ≥ 80% 的角度）。
    h_head = fit["diagnostics"]["cut"]["headFloorMm"] * mm
    covered, _, _ = rasterize_cylinder(head.positions.astype(np.float64), skin, frame, CylinderGrid(360, h_head, h_head + 10 * mm, 20))
    region_a = np.isfinite(covered).mean(axis=1) >= .8
    # 非正圆截面的拟合圆心随角度集合变（黄蓉换一组同样合理的 A 区角度差 1.3 mm），所以在生产记下的对中角度上复量；
    # 这组角度须基本落在独立判出的 A 区里（≥ 90%），防止按看不见的颈皮对中。
    recorded = np.zeros(len(theta), dtype=bool)
    for start, stop in fit["diagnostics"]["neckCenter"]["anglesDeg"]: recorded[start:stop + 1] = True
    inside = float(np.count_nonzero(recorded & region_a) / max(np.count_nonzero(recorded), 1))
    assert inside >= .9, ("对中角度落在独立 A 区之外", inside)
    ok = np.isfinite(head_r) & np.isfinite(body_r) & recorded
    design = np.column_stack((np.ones(ok.sum()), np.cos(theta[ok]), np.sin(theta[ok])))
    head_c = np.linalg.lstsq(design, head_r[ok], rcond=None)[0][1:]; body_c = np.linalg.lstsq(design, body_r[ok], rcond=None)[0][1:]
    return float(np.linalg.norm(head_c - body_c) / mm)


def _strict_penetration(template_dir: Path, asset: Path, frames: int = 24,
                        files: dict[str, str] | None = None) -> dict[str, Any]:
    """标准 penetration（D1 口径）独立复算：颈片 + 颈部皮肤（图集亮度判皮、切口到切口以上 40 mm），遮罩平面按 Neck 骨骼
    逐帧变换，切面以下全部点对遮罩后可见身体的带符号距离 < −1 mm 计穿入；bind 计数，动作取各帧最坏比例。"""
    files = files or {"glb": "head.glb", "fit": "fit.json", "mask": "hidemask.png"}
    body_glb = load_glb(template_dir / "body.glb"); body, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / files["glb"]); head, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text())
    diagnostics = json.loads((asset / files["fit"]).read_text())["diagnostics"]
    m_per_mu = float(skeleton["mPerMu"]); mm = 1 / (1000 * m_per_mu)
    names = [body_glb.json["nodes"][n].get("name", "") for n in body_glb.skin().joints]
    from cut_head import _bone_frame
    bone = _bone_frame(body_glb, {name: i for i, name in enumerate(names)})
    center, axis = np.asarray(skeleton["neckRing"]["centerMu"], float), bone["axis"]
    plane = center + axis * diagnostics["cut"]["maskPlaneMm"] * mm
    h_head = diagnostics["cut"]["headFloorMm"] * mm
    surface = _masked_surface(body, Image.open(asset / files["mask"]).convert("L")); visible = surface["faces"]
    faces = head.indices.reshape(-1, 3); neck_id = skeleton["regions"]["ids"]["neck"]
    skin = np.unique(_skin_faces(head_glb, head, faces[np.all(head.regions[faces] != neck_id, axis=1)]))
    frame = {"center": center, "axis": axis, "right": bone["right"], "front": bone["front"]}
    theta, height, radius = cylinder(head.positions.astype(np.float64), frame)
    patch = np.flatnonzero(head.regions == neck_id)
    # 颈壳：每 10° 取颈片在切口 ±1 mm 处的最大半径，× 1.35（与生产的颈部皮肤口径一致，排除离颈轴很远的亮色发帘）。
    rim = patch[np.abs(height[patch] - h_head) <= 1 * mm]
    shell = np.full(36, np.nan); np.fmax.at(shell, (np.degrees(theta[rim]) // 10).astype(int) % 36, radius[rim])
    shell = np.where(np.isfinite(shell), shell, np.nanmax(shell))
    # 头皮在切口处已裁掉：切口以下亮色的只会是发饰 / 发片高光（垂到背上），不是颈部皮肤。
    skin = skin[(height[skin] >= h_head - .5 * mm) & (height[skin] <= h_head + 40 * mm)
                & (radius[skin] <= 1.35 * shell[(np.degrees(theta[skin]) // 10).astype(int) % 36])]
    candidates = np.unique(np.concatenate((patch, skin)))
    neck = names.index("mixamorig:Neck"); skin_def = body_glb.skin(); head_skin = head_glb.skin()
    def measure(body_points: np.ndarray, head_points: np.ndarray, cut_center: np.ndarray, cut_axis: np.ndarray
                ) -> tuple[int, int]:
        query = candidates[(head_points[candidates] - cut_center) @ cut_axis < 0]
        if not len(query): return 0, 0
        positions = _masked_positions(body_points, surface)
        distance = _signed_distances(head_points[query], positions, visible, _vertex_normals(positions, visible))
        return int(np.count_nonzero(distance < -.001 / m_per_mu)), int(len(query))
    count, evaluated = measure(body.positions.astype(np.float64), head.positions.astype(np.float64), plane, axis)
    result: dict[str, Any] = {"bind": count, "bindEvaluated": evaluated}
    for clip in ("idle", "walk", "run"):
        animation = next(item for item in body_glb.json["animations"] if clip in item.get("name", "").lower())
        end = max(float(np.asarray(body_glb.accessor(s["input"])).max(initial=0)) for s in animation["samplers"])
        worst = 0.
        for at in np.linspace(0, end, frames, endpoint=False):
            world = _world_matrices(body_glb, animation, float(at))[np.asarray(skin_def.joints)]
            deform = world[neck] @ skin_def.inverse_bind_matrices[neck]
            cut_axis = deform[:3, :3] @ axis; cut_axis /= np.linalg.norm(cut_axis)
            count, evaluated = measure(lbs(body.positions, body.joints, body.weights, world, skin_def.inverse_bind_matrices),
                                       lbs(head.positions, head.joints, head.weights, world, head_skin.inverse_bind_matrices),
                                       (deform @ np.append(plane, 1.))[:3], cut_axis)
            worst = max(worst, count / max(evaluated, 1))
        result[clip] = worst
    return result


def _independent(template_dir: Path, asset: Path, frames: int = 0,
                 files: dict[str, str] | None = None) -> dict[str, Any]:
    """只从写盘的 head.glb / fit.json / 模板复算：逐面朝向、底带外移、两端 G1、重叠带外露（bind + 三段动作各 frames 帧）。

    重叠带 = 切口以上 0.5 mm–TOP_BAND、bind 时最近皮肤面 < 1 mm 的颈片点；外露只对覆盖皮肤量（bind 时离重叠带
    ≤ TOP_COVER_MM 的皮肤面：发片甩进颈部属垂发穿插，后脑皮肤贴近颈后属头网格自接触）。
    顶缝 G1 只在 A 区内部量：皮肤覆盖切口以上 10 mm 达 80% 的角度里，离任一未覆盖角 ≥ 12° 者。"""
    files = files or {"glb": "head.glb", "fit": "fit.json", "mask": "hidemask.png"}
    body_glb = load_glb(template_dir / "body.glb"); body, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / files["glb"]); head, _, _ = _world_mesh(head_glb)
    fit = json.loads((asset / files["fit"]).read_text()); skeleton = json.loads((template_dir / "skeleton.json").read_text())
    diagnostics = fit["diagnostics"]; m_per_mu = float(skeleton["mPerMu"]); mm = 1 / (1000 * m_per_mu)
    neck_id = skeleton["regions"]["ids"]["neck"]
    positions = head.positions.astype(np.float64)
    patch = np.flatnonzero(head.regions == neck_id); faces = head.indices.reshape(-1, 3)
    patch_faces = faces[np.all(head.regions[faces] == neck_id, axis=1)]
    head_faces = faces[np.all(head.regions[faces] != neck_id, axis=1)]
    skin_faces = _skin_faces(head_glb, head, head_faces)
    names = [body_glb.json["nodes"][n].get("name", "") for n in body_glb.skin().joints]
    from cut_head import _bone_frame
    bone = _bone_frame(body_glb, {name: i for i, name in enumerate(names)})
    frame = {"center": np.asarray(skeleton["neckRing"]["centerMu"], float), "axis": bone["axis"],
             "right": bone["right"], "front": bone["front"]}
    orientation = orientation_report(positions, patch_faces, frame)
    _, height, _ = cylinder(positions[patch], frame)
    mask_height = diagnostics["cut"]["maskPlaneMm"] * mm; h_head = diagnostics["cut"]["headFloorMm"] * mm
    bottom = patch[height <= mask_height - 1 * mm]
    body_faces = body.indices.reshape(-1, 3)
    lift = _signed_distances(positions[bottom], body.positions, body_faces,
                             _vertex_normals(body.positions.astype(np.float64), body_faces)) / mm
    band = patch[(height >= h_head + .5 * mm) & (height <= h_head + (TOP_BAND_MM + .001) * mm)]   # 顶沿裁切点 float32 误差
    if not len(band) or not len(skin_faces): raise AssertionError(f"重叠带为空：band {len(band)}，皮肤面 {len(skin_faces)}")
    near = nearest_triangle(positions[band], positions, skin_faces, k=16)
    band, near_face, near_bary = (band[near.distances_mu < 1 * mm], near.face_indices[near.distances_mu < 1 * mm],
                                  near.barycentric[near.distances_mu < 1 * mm])
    joint_total = int(max(head.joints.max(), 0)) + 1
    dense = dense_weights(head.joints, head.weights, joint_total)
    weight_gap = np.abs(dense[band] - np.einsum("ni,nij->nj", near_bary, dense[skin_faces[near_face]])).sum(axis=1)
    # 覆盖皮肤：bind 时离任一重叠带点 ≤ TOP_COVER_MM 的皮肤面（逐带点取面心近邻、精确点-三角距离）；外露只对它们量，
    # 法线仍按整片皮肤算。头后仰时贴近颈后的后脑皮肤不在其中（D2 口径，见 test_top_band_covering_skin）。
    triangles = positions[skin_faces]; centers = triangles.mean(axis=1)
    reach = float(np.linalg.norm(triangles - centers[:, None, :], axis=2).max()) + TOP_COVER_MM * mm
    from scipy.spatial import cKDTree
    covered = np.zeros(len(skin_faces), bool)
    for point, near_ids in zip(positions[band], cKDTree(centers).query_ball_point(positions[band], reach)):
        ids = np.asarray(near_ids, dtype=np.int64)
        if not len(ids): continue
        closest, _ = closest_point_on_triangle(np.broadcast_to(point, (len(ids), 3)), triangles[ids, 0],
                                               triangles[ids, 1], triangles[ids, 2])
        covered[ids[np.linalg.norm(closest - point, axis=1) <= TOP_COVER_MM * mm]] = True
    cover_faces = skin_faces[covered]
    def exposure(points: np.ndarray) -> float:
        return float((_signed_distances(points[band], points, cover_faces, _vertex_normals(points, skin_faces)) / mm)
                     .max(initial=-1))
    exposures = {"bind": exposure(positions)}
    if frames:
        skin = body_glb.skin(); head_skin = head_glb.skin()
        for clip in ("idle", "walk", "run"):
            animation = next(item for item in body_glb.json["animations"] if clip in item.get("name", "").lower())
            end = max(float(np.asarray(body_glb.accessor(sampler["input"])).max(initial=0))
                      for sampler in animation["samplers"])
            worst = -1.
            for at in np.linspace(0, end, frames, endpoint=False):
                world = _world_matrices(body_glb, animation, float(at))[np.asarray(skin.joints)]
                worst = max(worst, exposure(lbs(head.positions, head.joints, head.weights, world,
                                                head_skin.inverse_bind_matrices)))
            exposures[clip] = worst
    coverage_grid = CylinderGrid(360, h_head, h_head + 10 * mm, 20)
    covered, _, _ = rasterize_cylinder(positions, skin_faces, frame, coverage_grid)
    region_a = np.isfinite(covered).mean(axis=1) >= .8
    gap = np.abs(np.arange(360)[:, None] - np.flatnonzero(~region_a)[None, :])
    interior = region_a & (np.minimum(gap, 360 - gap).min(axis=1, initial=360) >= 12)
    head_slope, head_at = _slopes(positions, skin_faces, frame, h_head + .5 * mm, h_head + 2.5 * mm, h_head)
    patch_slope, patch_at = _slopes(positions, patch_faces, frame, h_head - 2.5 * mm, h_head - .5 * mm, h_head)
    top = interior & np.isfinite(head_slope) & np.isfinite(patch_slope)
    top_angle = np.degrees(np.abs(np.arctan(head_slope) - np.arctan(patch_slope)))[top]
    body_slope, _ = _slopes(body.positions.astype(np.float64), body_faces, frame, mask_height - 2 * mm,
                            mask_height + 2 * mm, mask_height)
    low_slope, _ = _slopes(positions, patch_faces, frame, mask_height - 2 * mm, mask_height + 2 * mm, mask_height)
    both = np.isfinite(body_slope) & np.isfinite(low_slope)
    bottom_angle = np.degrees(np.abs(np.arctan(body_slope[both]) - np.arctan(low_slope[both])))
    outward_face = 1 - np.count_nonzero(np.einsum(
        "ij,ij->i", np.cross(positions[patch_faces][:, 1] - positions[patch_faces][:, 0],
                             positions[patch_faces][:, 2] - positions[patch_faces][:, 0]),
        (lambda c: c - np.outer(c @ frame["axis"], frame["axis"]))(positions[patch_faces].mean(axis=1) - frame["center"]))
        <= 0) / max(len(patch_faces), 1)
    return {"consistent": orientation["consistentEdgeRatio"], "outward": orientation["outwardAreaRatio"],
            "outwardFace": float(outward_face), "liftMinMm": float(lift.min()), "liftMaxMm": float(lift.max()),
            "bandCount": int(len(band)), "bandWeightGapP95": float(np.percentile(weight_gap, 95)) if len(band) else 0.,
            "exposureMaxMm": exposures, "interiorAngles": int(np.count_nonzero(interior)),
            "g1TopMaxDeg": float(top_angle.max(initial=0)), "g1TopAngles": int(len(top_angle)),
            "g1BottomMaxDeg": float(bottom_angle.max(initial=0)), "g1BottomAngles": int(len(bottom_angle))}


def test_end_to_end_with_skin_collar() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source = root / "source.glb"; _source(source, True); out = root / "out"
        report = process_head(source, template, "synthetic", out)
        fit = json.loads((out / "fit.json").read_text()); result = load_glb(out / "head.glb")
        mesh = result.mesh(); emitted = json.loads((out / "report.json").read_text())
        assert fit["kind"] == "head" and fit["hideRegions"] == [] and fit["hideMask"] == {"file": "hidemask.png",
                                                                                          "size": 1024}
        assert len(fit["skinTint"]) == 3 and all(value > 0 for value in fit["skinTint"])
        color = fit["diagnostics"]["color"]; neck = color["neckMatch"]           # 方案 2：身体染色对准切口颈色
        assert fit["skinTint"] == color["skinTint"] and fit["deltaE"] == color["deltaE"] < 3, color
        if not neck["clipped"]:
            np.testing.assert_allclose(neck["residualGain"], 1, atol=1e-3)
            np.testing.assert_allclose(np.asarray(neck["faceTint"]) * np.asarray(neck["gainBefore"]), fit["skinTint"],
                                       rtol=1e-6)
        assert len(result.skin().joints) == len(load_glb(template / "body.glb").skin().joints)
        assert set(np.unique(mesh.regions)) == {0, 1}
        np.testing.assert_allclose(mesh.weights.sum(axis=1), 1, atol=1e-3)   # 切口处无零权重点（粗网格回归）
        assert len(result.json["meshes"]) == 1 and len(result.json["meshes"][0]["primitives"]) == 1
        assert "KHR_materials_unlit" in result.json["materials"][0].get("extensions", {})
        cut = report["cut"]; assert cut["headFloorMm"] >= 5.99   # 整颈有皮肤 → 切面取下限
        patch = report["patch"]
        assert (patch["orientation"]["consistentEdgeRatio"] == 1 and patch["orientation"]["outwardFaceRatio"] == 1
                and patch["orientation"]["nonManifoldEdges"] == 0), patch["orientation"]
        assert set(fit["ring"]) == {"sourceRadiusMu", "scale", "residualMu"} and fit["ring"]["residualMu"] < 1e-6
        frames = {item["name"]: item.get("frames") for item in emitted["checks"]}
        assert [frames[f"penetration.{clip}"] for clip in ("idle", "walk", "run")] == [24, 24, 24], frames
        assert report["checks"]["motion"]["framesPerClip"] == {"bind": 1, "idle": 24, "walk": 24, "run": 24}
        assert patch["solve"]["residualMaxMu"] < 1e-6
        mask = report["hideMask"]
        assert mask["aboveVisibleTriangles"] == 0 and mask["belowRetainedTriangles"] > 0 and mask["boundaryWithinBand"]
        # 肤色高领（r 55 mm）被颈壳过滤掉：头部顶点在颈段不得超出 45 mm。
        frame = {**UP, "center": np.array([0, 1.02, 0])}
        _, height, radius = cylinder(mesh.positions[mesh.regions == 0], frame)
        assert not np.any((height > -.03) & (height < .03) & (radius > .045))
        independent = _independent(template, out)
        assert independent["consistent"] == 1 and independent["outwardFace"] == 1, independent
        assert abs(independent["liftMinMm"] - BOTTOM_LIFT_MM) < .05 and abs(independent["liftMaxMm"] - BOTTOM_LIFT_MM) < .05
        # bind 时整条重叠带在头皮下 ≥ 0.25 mm（带符号，不截成 0），生产报告与独立复算一致。
        assert independent["bandCount"] > 0 and independent["exposureMaxMm"]["bind"] <= -.25, independent
        assert report["checks"]["motion"]["topUnderSkinMinMm"] >= .25, report["checks"]["motion"]["topExposedMaxMm"]
        assert emitted["level"] == ("draft" if emitted["gateLevel"] == "pass" else "fail")
        assert emitted["stats"]["fileSize"] == (out / "head.glb").stat().st_size
        manifest = yaml.safe_load((out / "manifest.yaml").read_text())[0]
        for name, record in manifest["files"].items():
            data = (out / name).read_bytes()
            assert record == {"sha256": sha256(data).hexdigest(), "bytes": len(data)}, name
        ingested = ingest(argparse.Namespace(kind="head", id="synthetic", src=out, template="template", slot="body",
                                             item=None, asset_root=root / "ingested", commit=False))
        assert ingested["status"] in ("draft", "rejected")
        # 同一 NPC 的第二体型：产物带 .<模板> 后缀、fit 引用带后缀的遮罩，manifest 在 fits 下追加、主体型不动。
        template_b = root / "templates" / "template_b"; _template(template_b)
        primary_bytes = (out / "head.glb").read_bytes()
        report_b = process_head(source, template_b, "synthetic", out)
        names_b = output_names(out, "template_b")
        assert (names_b["glb"], names_b["fit"], names_b["mask"]) == (
            "head.template_b.glb", "fit.template_b.json", "hidemask.template_b.png")
        fit_b = json.loads((out / names_b["fit"]).read_text())
        assert fit_b["template"] == "template_b" and fit_b["hideMask"]["file"] == "hidemask.template_b.png"
        assert report_b["gateLevel"] == "pass" and (out / "head.glb").read_bytes() == primary_bytes
        merged = yaml.safe_load((out / "manifest.yaml").read_text())[0]
        assert merged["template"] == "template" and merged["file"] == "head.glb"
        assert merged["fits"]["template_b"]["file"] == "head.template_b.glb" and set(merged["fits"]) == {
            "template", "template_b"}
        for name, record in merged["files"].items():
            data = (out / name).read_bytes()
            assert record == {"sha256": sha256(data).hexdigest(), "bytes": len(data)}, name
        assert all(names_b[key] in merged["files"] for key in ("glb", "fit", "report", "mask", "preview", "check"))
        # 主体型重写 manifest 时保留变体登记；变体不通过时从 fits 撤下。
        _write_manifest(out, "synthetic", emitted, "template", output_names(out, "template"))
        assert set(yaml.safe_load((out / "manifest.yaml").read_text())[0]["fits"]) == {"template", "template_b"}
        _drop_variant(out, "template_b", names_b)
        dropped = yaml.safe_load((out / "manifest.yaml").read_text())[0]
        assert set(dropped["fits"]) == {"template"} and names_b["glb"] not in dropped["files"]


def test_uv_islands_and_skyline_pack() -> None:
    """H1：岛 = 共享顶点的连通分量（按首次出现的三角编号）；天际线排布不重叠、不出界，放不下返回 None。"""
    quads = np.array([[0, 1, 2], [0, 2, 3]])
    faces = np.concatenate((quads + 8, quads, quads + 4))           # 三块不相连的四边形，首个三角属于顶点 8..11
    labels = uv_islands(faces, 13)
    assert labels[12] == -1 and list(labels[8:12]) == [0] * 4 and list(labels[:4]) == [1] * 4 and list(labels[4:8]) == [2] * 4
    rng = np.random.default_rng(7)
    sizes = rng.integers(4, 40, size=(60, 2))
    assert int((sizes[:, 0] * sizes[:, 1]).sum()) < .6 * 240 * 260      # 面积占六成以内：天际线应能放下
    placed = skyline_pack(sizes, 240, 260)
    assert placed is not None
    occupied = np.zeros((260, 240), dtype=np.int32)
    for (x, y), (w, h) in zip(placed, sizes):
        assert x >= 0 and y >= 0 and x + w <= 240 and y + h <= 260
        occupied[y:y + h, x:x + w] += 1
    assert occupied.max() == 1                                      # 互不重叠
    assert skyline_pack(np.array([[100, 100], [100, 100]]), 150, 150) is None
    assert skyline_pack(np.array([[151, 10]]), 150, 150) is None


def test_pack_head_canvas_mapping() -> None:
    """同一缩放比、UV 改写与重采样一致（平滑图上新 UV 取样 ≈ 高清图旧 UV 取样）、矩形不重叠、空隙填满。"""
    yy, xx = np.mgrid[0:512, 0:512].astype(np.float64)
    hd = np.stack((xx / 2, yy / 2, 128 + 60 * np.sin(xx / 40) * np.cos(yy / 50)), axis=2)
    image = Image.fromarray(np.clip(np.rint(hd), 0, 255).astype(np.uint8), "RGB")
    quads = np.array([[0, 1, 2], [0, 2, 3]])
    boxes = [(.05, .05, .45, .35), (.6, .1, .95, .9), (.1, .55, .3, .95)]
    uvs = np.concatenate([[[a, b], [c, b], [c, d], [a, d]] for a, b, c, d in boxes])
    faces = np.concatenate([quads + 4 * i for i in range(3)])
    size, rows = 256, 224
    canvas, new_uvs, info = pack_head_canvas(image, uvs, faces, size=size, rows=rows)
    assert info["islands"] == 3 and 0 < info["scaleDstPerSrc"] <= 1 and info["headCoverage"] > .3
    factor = info["scaleDstPerSrc"] * 512 / size                    # 新 UV = factor × 旧 UV + 每岛平移
    for i in range(3):
        block = slice(4 * i, 4 * i + 4)
        shift = new_uvs[block] - factor * uvs[block]
        np.testing.assert_allclose(shift, shift[0][None].repeat(4, axis=0), atol=1e-9)
        assert np.all(new_uvs[block][:, 1] * size <= rows - PACK_GUTTER_PX + 1e-6) and np.all(new_uvs[block] >= 0)
    rng = np.random.default_rng(3)
    weights = rng.dirichlet((1, 1, 1), size=200)
    for i in range(3):
        tri = faces[2 * i]
        old = weights @ uvs[tri]; new = weights @ new_uvs[tri]
        a = np.asarray(canvas, dtype=np.float64) / 255; b = np.asarray(image, dtype=np.float64) / 255
        from cut_head import _bilinear
        error = np.abs(_bilinear(a, new) - _bilinear(b, old)).max() * 255
        assert error < 4, (i, error)
    head = np.asarray(canvas)[:rows]
    assert not np.any(np.all(head == 0, axis=2))                    # 岛间空隙按最近纹素填满（mip 不混黑）
    assert np.all(np.asarray(canvas)[rows:] == 0)                   # 条带区留给 compose_atlas


def test_hd_texture_guard_and_delta() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        rng = np.random.default_rng(11)
        base = Image.fromarray(rng.integers(0, 255, size=(64, 64, 3), dtype=np.uint8), "RGB")
        good = root / "good.png"; base.resize((256, 256), Image.Resampling.NEAREST).save(good)
        image, record = load_hd_texture(good, base)
        assert image.size == (256, 256) and record["factor"] == 4 and record["meanAbsDiffVsEmbedded"] < 1e-9
        assert record["sha256"] == sha256(good.read_bytes()).hexdigest()
        odd = root / "odd.png"; base.resize((100, 100)).save(odd)
        other = root / "other.png"
        Image.fromarray(rng.integers(0, 255, size=(128, 128, 3), dtype=np.uint8), "RGB").save(other)
        for bad in (odd, other):
            try:
                load_hd_texture(bad, base); raise AssertionError(f"{bad.name} 应被拒")
            except TextureMismatch:
                pass
        after = np.asarray(base).copy(); after[10:20, 10:20] = np.clip(after[10:20, 10:20].astype(int) + 20, 0, 255)
        toned, changed = apply_texel_delta(image, base, Image.fromarray(after, "RGB"))
        assert changed == int(np.count_nonzero(np.any(after != np.asarray(base), axis=2)))
        diff = np.asarray(toned, dtype=np.int64) - np.asarray(image, dtype=np.int64)
        assert np.abs(diff[:, :20]).max() <= 20 and np.abs(diff[48:72, 48:72]).max() > 0
        assert np.all(diff[160:, 160:] == 0)                       # 改动只在对应区域
        same, none = apply_texel_delta(image, base, base)
        assert none == 0 and same is image


def test_end_to_end_with_hd_texture() -> None:
    """--texture：门禁照常通过；头部 UV 进图集上方、同一缩放比；fit.source 记录高清图；不给时无 atlas 诊断。"""
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source = root / "source.glb"; _source_mapped(source)
        embedded = Image.new("RGB", (128, 128), (214, 176, 145))
        embedded.paste((45, 31, 22), (43, 0, 86, 128)); embedded.paste((225, 191, 166), (86, 0, 128, 128))
        hd = root / "hd.png"; embedded.resize((512, 512), Image.Resampling.NEAREST).save(hd)
        legacy = process_head(source, template, "synthetic", root / "legacy", fast=True)
        assert "atlas" not in legacy and "texture" not in json.loads((root / "legacy" / "fit.json").read_text())["source"]
        report = process_head(source, template, "synthetic", root / "packed", fast=True, texture_path=hd)
        assert report["gateLevel"] == legacy["gateLevel"] == "pass", (report["gateLevel"], legacy["gateLevel"])
        atlas = report["atlas"]
        assert atlas["mode"] == "packed" and atlas["islands"] >= 1 and atlas["seamToneTexelsApplied"] == 0
        fit = json.loads((root / "packed" / "fit.json").read_text())
        texture = fit["source"]["texture"]                               # 任务契约 texture {path, sha256, size}
        assert {"path", "sha256", "size"} <= set(texture) and texture["size"] == [512, 512] and texture["factor"] == 4
        assert Path(texture["path"]).resolve() == hd.resolve() and texture["sha256"] == sha256(hd.read_bytes()).hexdigest()
        # 仓库内的文件记仓库相对路径（本地素材库在主检出里时同样相对主检出根）
        assert _library_record(Path(__file__))["path"] == "tools/model3d/dressup/tests_head.py"
        # 肤色、切口增益、颈环、遮罩都在内嵌贴图口径上算：与不给 --texture 时逐项相同
        legacy_fit = json.loads((root / "legacy" / "fit.json").read_text())
        for key in ("skinTint", "deltaE", "ring", "hideMask"):
            assert fit[key] == legacy_fit[key], key
        assert fit["diagnostics"]["color"] == legacy_fit["diagnostics"]["color"]
        assert (root / "packed" / "hidemask.png").read_bytes() == (root / "legacy" / "hidemask.png").read_bytes()
        mesh = load_glb(root / "packed" / "head.glb").mesh()
        head_uv = mesh.uvs[mesh.regions == 0]
        assert np.all(head_uv[:, 1] * ATLAS_SIZE <= ATLAS_SIZE - STRIP_ROWS) and np.all(head_uv >= 0)
        # 几何、权重与旧口径逐点相同（只有图集与头部 UV 变）
        old = load_glb(root / "legacy" / "head.glb").mesh()
        np.testing.assert_array_equal(old.positions, mesh.positions); np.testing.assert_array_equal(old.indices, mesh.indices)
        np.testing.assert_array_equal(old.weights, mesh.weights)
        np.testing.assert_array_equal(old.uvs[old.regions == 1], mesh.uvs[mesh.regions == 1])   # 颈片条带 UV 不变
        # 条带最下面一段（离切口远于 COLOR_BLEND_MM，只取模板身体色 × skinTint）与 legacy 解码后逐像素相同：条带从第 1792 行起、
        # 与 JPEG 8×8 块（4:4:4）对齐；切口附近与发色区从高清头部画布取色，允许不同。
        def strip_rows(path: Path) -> np.ndarray:
            glb = load_glb(path); image = glb.image(0)
            return np.asarray(Image.open(io.BytesIO(getattr(image, "data", image))).convert("RGB"))[ATLAS_SIZE - STRIP_ROWS:]
        old_strip, new_strip = strip_rows(root / "legacy" / "head.glb"), strip_rows(root / "packed" / "head.glb")
        np.testing.assert_array_equal(old_strip[-32:], new_strip[-32:])
        with tempfile.TemporaryDirectory() as other:
            bad = Path(other) / "bad.png"; Image.new("RGB", (300, 300), (0, 0, 0)).save(bad)
            try:
                process_head(source, template, "synthetic", root / "bad", fast=True, texture_path=bad)
                raise AssertionError("尺寸不符的 --texture 应被拒")
            except TextureMismatch:
                pass


def test_cli_texture_mismatch_exit_code() -> None:
    """CLI：--texture 尺寸不是源件贴图的整数倍、或缩回后与内嵌贴图对不上时，退出码 2、输出说明原因、不写产物。"""
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source = root / "source.glb"; _source_mapped(source)
        odd = root / "odd.png"; Image.new("RGB", (300, 300), (0, 0, 0)).save(odd)
        other = root / "other.png"; Image.new("RGB", (512, 512), (20, 200, 40)).save(other)
        for bad, reason in ((odd, "整数倍"), (other, "平均差")):
            out = root / f"out_{bad.stem}"; buffer = io.StringIO()
            with contextlib.redirect_stdout(buffer):
                code = cut_head_main(["--source", str(source), "--template", str(template), "--id", "synthetic",
                                      "--out", str(out), "--fast", "--texture", str(bad)])
            text = buffer.getvalue()
            assert code == 2 and "--texture 不可用" in text and reason in text, (bad.name, code, text)
            assert not (out / "head.glb").exists() and not (out / "fit.json").exists()


def test_packed_islands_from_output_uvs() -> None:
    """H1：从 pack_head_canvas 实际改写后的 UV 反求每岛矩形——全岛同一缩放、不旋转，都在头部画布内，
    岛与岛、岛与画布边至少隔 2 px（gutter）。"""
    rng = np.random.default_rng(5)
    hd_size, size, rows = 1024, 512, 448
    image = Image.fromarray(rng.integers(0, 255, size=(hd_size, hd_size, 3), dtype=np.uint8), "RGB")
    uvs: list[list[float]] = []; faces: list[list[int]] = []
    for row in range(4):
        for column in range(4):              # 4×4 格各放一个随机大小的岛：矩形或六边形三角扇
            w, h = rng.uniform(.04, .2, size=2); x, y = .25 * column + .02, .25 * row + .02; first = len(uvs)
            if (row + column) % 3:
                uvs += [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
                faces += [[first, first + 1, first + 2], [first, first + 2, first + 3]]
            else:
                uvs += [[x + w / 2, y + h / 2]] + [[x + w / 2 * (1 + math.cos(a)), y + h / 2 * (1 + math.sin(a))]
                                                   for a in np.linspace(0, TAU, 7)[:-1]]
                faces += [[first, first + 1 + i, first + 1 + (i + 1) % 6] for i in range(6)]
    uv_array, face_array = np.asarray(uvs), np.asarray(faces)
    _, new_uvs, info = pack_head_canvas(image, uv_array, face_array, size=size, rows=rows)
    islands = uv_islands(face_array, len(uv_array)); scale = info["scaleDstPerSrc"]
    assert info["islands"] == 16 and 0 < scale <= 1
    boxes = []
    for index in range(info["islands"]):
        old = uv_array[islands == index] * hd_size; new = new_uvs[islands == index] * size
        np.testing.assert_allclose(new - new.min(axis=0), (old - old.min(axis=0)) * scale, atol=1e-9)
        boxes.append((*new.min(axis=0), *new.max(axis=0)))
    box = np.asarray(boxes)
    assert np.all(box[:, :2] >= 2) and np.all(box[:, 2] <= size - 2) and np.all(box[:, 3] <= rows - 2), box
    for i in range(len(box)):
        for j in range(i + 1, len(box)):
            gap = max(box[j, 0] - box[i, 2], box[i, 0] - box[j, 2], box[j, 1] - box[i, 3], box[i, 1] - box[j, 3])
            assert gap >= 2, (i, j, gap)


# 不给 --texture 的回归基线：H1 之前的 cut_head.py（git 4f3a140e5）对 _template + _source_mapped 合成资产完整实跑的产物摘要；
# fit.json 去掉 durationMs、临时目录换成 <tmp> 后按 sort_keys 序列化再取摘要。摘要依赖本机 numpy / Pillow（libjpeg）版本：
# 依赖升级后不一致时，先用 4f3a140e5 的 cut_head.py 在新环境重算基线，确认旧代码也变了再改这里。
LEGACY_GOLDEN_SHA256 = {
    "head.glb": "51e920aa31bddb9e5640642cfe0f91296da30af06274990d9c51302890a00b31",
    "hidemask.png": "084a7bfd45f52f67bc0250208742137a56e055decb87fe85f4ad993396f54f8d",
    "preview.png": "7800c1b63c0a29d0aaef58c7d0f1e0c2741394a79fba41f69546a6a5aeca33d0",
    "self_check_preview.png": "4e0cad08d0721cf3b7df1d0c542fcc6149d50175cd255674e6530c65dc732ef3",
    "fit.json": "5fd4be5c4f46680bc6971e0c1ccf3f42fe22e8a1d3485c37cbd9f4890af77587",
}


def _without_run_specifics(value: Any, roots: Sequence[str]) -> Any:
    if isinstance(value, dict): return {k: _without_run_specifics(v, roots) for k, v in value.items() if k != "durationMs"}
    if isinstance(value, list): return [_without_run_specifics(v, roots) for v in value]
    if isinstance(value, str):
        for root in roots: value = value.replace(root, "<tmp>")
    return value


def test_legacy_golden_without_texture() -> None:
    """不给 --texture：head.glb / 遮罩 / preview / self-check 与 H1 之前逐字节相同，fit.json 除 durationMs 外相同。"""
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); template = root / "templates" / "template"; _template(template)
        source = root / "source.glb"; _source_mapped(source); out = root / "out"
        report = process_head(source, template, "synthetic", out)
        assert report["gateLevel"] == "pass" and "atlas" not in report
        roots = sorted({str(root), str(root.resolve())}, key=len, reverse=True)
        digests = {name: sha256((out / name).read_bytes()).hexdigest() for name in LEGACY_GOLDEN_SHA256 if name != "fit.json"}
        fit = _without_run_specifics(json.loads((out / "fit.json").read_text()), roots)
        digests["fit.json"] = sha256(json.dumps(fit, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        assert digests == LEGACY_GOLDEN_SHA256, {name: digests[name] for name in digests if digests[name] != LEGACY_GOLDEN_SHA256[name]}


def test_real_asset_recomputed() -> None:
    """库内每个已切头（heads/*/manifest.yaml：D1 黄蓉、D2 穆念慈……）：manifest 里登记的每个体型（fits）各自从写盘
    GLB 独立复算逐面朝向、底带外移、两端 G1，以及 bind + idle / walk / run 各 24 帧（共 73 帧，与生产检查同一
    时刻表）的重叠带外露与标准 penetration。"""
    root = Path(__file__).resolve().parents[3]
    for manifest_path in sorted((root / "assets/default/model3d/dressup/heads").glob("*/manifest.yaml")):
        try:
            _check_real_head(root, manifest_path.parent)
        except AssertionError as error:
            raise AssertionError(f"{manifest_path.parent.name}: {error}") from error


def _check_real_head(root: Path, asset: Path) -> None:
    manifest = yaml.safe_load((asset / "manifest.yaml").read_text())[0]
    for name, record in manifest["files"].items():
        data = (asset / name).read_bytes()
        assert record == {"sha256": sha256(data).hexdigest(), "bytes": len(data)}, name
    assert manifest["fits"][manifest["template"]]["file"] == manifest["file"] == "head.glb"
    for template_name, entry in manifest["fits"].items():
        template = root / "assets/default/model3d/dressup/templates" / template_name
        assert template.is_dir(), template_name
        fit = json.loads((asset / entry["fit"]).read_text())
        names = {"glb": entry["file"], "fit": entry["fit"], "mask": fit["hideMask"]["file"]}
        # 变体文件名与 cut_head 的命名约定一致，且全部登记在 files 摘要里（构建只发布登记过的体型）。
        expected = {key: value for key, value in output_names(asset, template_name).items() if key != "suffix"}
        assert {key: expected[key] for key in ("glb", "fit", "report", "mask")} == {**names, "report": entry["report"]}, (
            template_name, names)
        assert all(value in manifest["files"] for value in expected.values()), (template_name, expected)
        report = json.loads((asset / entry["report"]).read_text())
        assert "patch" in report and fit["template"] == report["template"] == template_name
        assert entry["status"] == "draft" and report["level"] == "draft" and report["gateLevel"] == "pass", template_name
        independent = _independent(template, asset, frames=24, files=names)
        assert independent["consistent"] == 1 and independent["outwardFace"] == 1, (template_name, independent)
        assert BOTTOM_LIFT_MM - .05 < independent["liftMinMm"] and independent["liftMaxMm"] < BOTTOM_LIFT_MM + .05, (
            template_name, independent)
        assert independent["bandCount"] > 500 and independent["bandWeightGapP95"] < .01, (template_name, independent)
        assert independent["exposureMaxMm"]["bind"] <= -.25, (template_name, independent)   # bind 时整带在皮下 ≥ 0.25 mm
        recorded_top = report["checks_detail"]["motion"]["topExposedMaxMm"]
        assert recorded_top["bind"] <= -.25 and abs(recorded_top["bind"] - independent["exposureMaxMm"]["bind"]) < .02, (
            template_name, recorded_top, independent["exposureMaxMm"])
        assert max(independent["exposureMaxMm"].values()) <= .1, (template_name, independent)   # 73 帧逐帧都在头皮下
        assert independent["interiorAngles"] > 200, (template_name, independent)
        assert independent["g1TopAngles"] > 200 and independent["g1TopMaxDeg"] < 5, (template_name, independent)
        assert independent["g1BottomAngles"] > 300 and independent["g1BottomMaxDeg"] < 5, (template_name, independent)
        assert report["patch"]["orientation"]["outwardFaceRatio"] == 1 and report["patch"]["boundaryLoops"] == 2
        for key in ("source", "body"):                              # 可移植：仓库相对路径且文件在库
            name = fit[key]["file"]
            assert not Path(name).is_absolute() and (root / name).is_file(), (template_name, key, name)
            assert sha256((root / name).read_bytes()).hexdigest() == fit[key]["sha256"], (template_name, key)
        texture = fit["source"].get("texture")
        if texture:   # H1：高清贴图在主检出本地素材库（不入 git），按 validate 同一规则解析并核对哈希与尺寸
            name = texture["path"]
            assert not Path(name).is_absolute() and name.startswith("apps/game/public/models/props/"), (template_name, name)
            resolved = _resolve_recorded(name, asset / entry["fit"])
            assert sha256(resolved.read_bytes()).hexdigest() == texture["sha256"], (template_name, name)
            with Image.open(resolved) as image:
                assert list(image.size) == texture["size"], (template_name, image.size, texture["size"])
            atlas = fit["diagnostics"]["atlas"]
            assert atlas["mode"] == "packed" and atlas["linearGainVsLegacy"] >= 2, (template_name, atlas)
        assert fit["body"]["file"].endswith(f"templates/{template_name}/body.glb"), (template_name, fit["body"])
        assert set(fit["ring"]) == {"sourceRadiusMu", "scale", "residualMu"} and fit["ring"]["scale"] > 0
        frames = {item["name"]: item.get("frames") for item in report["checks"]}
        assert [frames[f"penetration.{clip}"] for clip in ("idle", "walk", "run")] == [24, 24, 24], (template_name, frames)
        # 标准 penetration 独立复算 73 帧，与 report 对拍（同一 D1 口径，切面以下全部参与）。
        strict = _strict_penetration(template, asset, files=names)
        recorded = report["checks_detail"]["motion"]["penetration"]
        assert strict["bind"] == recorded["bindVertices"] == 0 and strict["bindEvaluated"] > 0, (
            template_name, strict, recorded)
        for clip in ("idle", "walk", "run"):
            assert abs(strict[clip] - recorded[clip]) < 1e-9 and strict[clip] <= .02, (template_name, clip, strict, recorded)
        tone = fit["diagnostics"].get("seamTone")
        if tone:   # 切口带调平之后的头（D2 起）：贴着衣领的角度上交付图集不得留切口亮带；切口下整圈皮肤的头（素模）不得调平
            light = _seam_band_light(template, asset, names, tone["skinReferenceSrgb"], tone.get("collarDeg"))
            assert light["angles"] > 180 and light["lightAngles"] == 0, (template_name, light, tone)
            if tone.get("collarDeg") == []:
                assert tone["texelsChanged"] == 0 and tone["paddingTexels"] == 0, (template_name, tone)
        center = fit["diagnostics"].get("neckCenter")
        if center:   # D2c 起：切口处头皮截面中心对齐模板颈子截面中心（侧面不再错开）
            gap = _neck_center_gap(template, asset, names)
            assert gap < 1.0, (template_name, gap, center)
            match = fit["diagnostics"]["color"]["neckMatch"]
            assert match["reference"] == "headCut/bodySeam" and fit["deltaE"] < 3, (template_name, match)


TESTS = [test_clip_faces_closed_cut, test_subdivide_preserves_surface, test_refine_marked_is_watertight,
         test_one_sided_transition_and_radial_inset, test_biharmonic_band_constraints,
         test_weights_top4_and_ring_interpolation, test_weld_and_compact, test_remove_slivers_keeps_manifold,
         test_rasterize_cylinder_first_hit, test_head_floor_and_regions, test_strip_uv_seam, test_hide_mask_plane,
         test_skin_match_uses_true_means, test_hair_colors_rule, test_neck_fit_monotone_bridge, test_drop_collar_remnants,
         test_top_band_covering_skin, test_level_seam_tone, test_collar_adjacent, test_center_neck_section,
         test_body_tint_seam_reference, test_uv_islands_and_skyline_pack, test_pack_head_canvas_mapping,
         test_hd_texture_guard_and_delta, test_end_to_end_with_hd_texture, test_cli_texture_mismatch_exit_code,
         test_packed_islands_from_output_uvs, test_legacy_golden_without_texture,
         test_end_to_end_with_skin_collar, test_real_asset_recomputed]


if __name__ == "__main__":
    failed = 0
    for test in TESTS:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    if failed: sys.exit(1)
    print("tests_head.py PASS")
