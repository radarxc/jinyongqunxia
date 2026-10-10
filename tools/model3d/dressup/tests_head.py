#!/usr/bin/env python3
"""cut_head（头颈拼接标准工具）的回归：只写临时目录，真实产物只读复算。"""
from __future__ import annotations

import argparse
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
                      _animated_cut_plane, _bridge_penetration, _masked_positions)
from common import lbs, nearest_triangle
from export_skeleton import _world_mesh
from glb_io import GLBBuilder, Mesh, load_glb
from ingest import ingest
from validate import _signed_distances, _world_matrices

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


def _strict_penetration(template_dir: Path, asset: Path, frames: int = 24) -> dict[str, Any]:
    """标准 penetration（D1 口径）独立复算：颈片 + 颈部皮肤（图集亮度判皮、切口到切口以上 40 mm），遮罩平面按 Neck 骨骼
    逐帧变换，切面以下全部点对遮罩后可见身体的带符号距离 < −1 mm 计穿入；bind 计数，动作取各帧最坏比例。"""
    body_glb = load_glb(template_dir / "body.glb"); body, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / "head.glb"); head, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text())
    diagnostics = json.loads((asset / "fit.json").read_text())["diagnostics"]
    m_per_mu = float(skeleton["mPerMu"]); mm = 1 / (1000 * m_per_mu)
    names = [body_glb.json["nodes"][n].get("name", "") for n in body_glb.skin().joints]
    from cut_head import _bone_frame
    bone = _bone_frame(body_glb, {name: i for i, name in enumerate(names)})
    center, axis = np.asarray(skeleton["neckRing"]["centerMu"], float), bone["axis"]
    plane = center + axis * diagnostics["cut"]["maskPlaneMm"] * mm
    h_head = diagnostics["cut"]["headFloorMm"] * mm
    surface = _masked_surface(body, Image.open(asset / "hidemask.png").convert("L")); visible = surface["faces"]
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


def _independent(template_dir: Path, asset: Path, frames: int = 0) -> dict[str, Any]:
    """只从写盘的 head.glb / fit.json / 模板复算：逐面朝向、底带外移、两端 G1、重叠带外露（bind + 三段动作各 frames 帧）。

    重叠带 = 切口以上 0.5 mm–TOP_BAND、bind 时最近皮肤面 < 1 mm 的颈片点；外露只对皮肤面量（发片甩进颈部属垂发穿插）。
    顶缝 G1 只在 A 区内部量：皮肤覆盖切口以上 10 mm 达 80% 的角度里，离任一未覆盖角 ≥ 12° 者。"""
    body_glb = load_glb(template_dir / "body.glb"); body, _, _ = _world_mesh(body_glb)
    head_glb = load_glb(asset / "head.glb"); head, _, _ = _world_mesh(head_glb)
    fit = json.loads((asset / "fit.json").read_text()); skeleton = json.loads((template_dir / "skeleton.json").read_text())
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
    def exposure(points: np.ndarray) -> float:
        return float((_signed_distances(points[band], points, skin_faces, _vertex_normals(points, skin_faces)) / mm)
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


def test_real_asset_recomputed() -> None:
    """若黄蓉产物在库：从写盘 GLB 独立复算逐面朝向、底带外移、两端 G1，以及 bind + idle / walk / run 各 24 帧
    （共 73 帧，与生产检查同一时刻表）的重叠带外露。"""
    root = Path(__file__).resolve().parents[3]
    template = root / "assets/default/model3d/dressup/templates/tpl_f_medium"
    asset = root / "assets/default/model3d/dressup/heads/npc_huangrong"
    if not (asset / "head.glb").is_file() or not template.is_dir(): return
    report = json.loads((asset / "report.json").read_text())
    if "patch" not in report: return                               # 旧版（D1 颈桥）产物不适用
    independent = _independent(template, asset, frames=24)
    assert independent["consistent"] == 1 and independent["outwardFace"] == 1, independent
    assert BOTTOM_LIFT_MM - .05 < independent["liftMinMm"] and independent["liftMaxMm"] < BOTTOM_LIFT_MM + .05, independent
    assert independent["bandCount"] > 500 and independent["bandWeightGapP95"] < .01, independent
    assert independent["exposureMaxMm"]["bind"] <= -.25, independent           # bind 时整带在皮下 ≥ 0.25 mm
    recorded_top = report["checks_detail"]["motion"]["topExposedMaxMm"]
    assert recorded_top["bind"] <= -.25 and abs(recorded_top["bind"] - independent["exposureMaxMm"]["bind"]) < .02, (
        recorded_top, independent["exposureMaxMm"])
    assert max(independent["exposureMaxMm"].values()) <= .1, independent       # 73 帧逐帧重叠带都在头皮下
    assert independent["interiorAngles"] > 200, independent
    assert independent["g1TopAngles"] > 200 and independent["g1TopMaxDeg"] < 5, independent
    assert independent["g1BottomAngles"] > 300 and independent["g1BottomMaxDeg"] < 5, independent
    assert report["patch"]["orientation"]["outwardFaceRatio"] == 1
    assert report["level"] == ("draft" if report["gateLevel"] == "pass" else "fail")
    fit = json.loads((asset / "fit.json").read_text())
    for key in ("source", "body"):                                  # 可移植：仓库相对路径且文件在库
        name = fit[key]["file"]
        assert not Path(name).is_absolute() and (root / name).is_file(), (key, name)
        assert sha256((root / name).read_bytes()).hexdigest() == fit[key]["sha256"], key
    assert set(fit["ring"]) == {"sourceRadiusMu", "scale", "residualMu"} and fit["ring"]["scale"] > 0
    frames = {item["name"]: item.get("frames") for item in report["checks"]}
    assert [frames[f"penetration.{clip}"] for clip in ("idle", "walk", "run")] == [24, 24, 24], frames
    # 标准 penetration 独立复算 73 帧，与 report.json 对拍（同一 D1 口径，切面以下全部参与）。
    strict = _strict_penetration(template, asset)
    recorded = report["checks_detail"]["motion"]["penetration"]
    assert strict["bind"] == recorded["bindVertices"] == 0 and strict["bindEvaluated"] > 0, (strict, recorded)
    for clip in ("idle", "walk", "run"):
        assert abs(strict[clip] - recorded[clip]) < 1e-9 and strict[clip] <= .02, (clip, strict, recorded)
    manifest = yaml.safe_load((asset / "manifest.yaml").read_text())[0]
    for name, record in manifest["files"].items():
        data = (asset / name).read_bytes()
        assert record == {"sha256": sha256(data).hexdigest(), "bytes": len(data)}, name


TESTS = [test_clip_faces_closed_cut, test_subdivide_preserves_surface, test_refine_marked_is_watertight,
         test_one_sided_transition_and_radial_inset, test_biharmonic_band_constraints,
         test_weights_top4_and_ring_interpolation, test_weld_and_compact, test_rasterize_cylinder_first_hit, test_head_floor_and_regions, test_strip_uv_seam, test_hide_mask_plane,
         test_skin_match_uses_true_means, test_end_to_end_with_skin_collar, test_real_asset_recomputed]


if __name__ == "__main__":
    failed = 0
    for test in TESTS:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    if failed: sys.exit(1)
    print("tests_head.py PASS")
