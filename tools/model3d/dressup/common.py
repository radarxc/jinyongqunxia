#!/usr/bin/env python3
"""3D 纸娃娃离线几何公共库。

坐标和距离均使用模型单位（mu）；角度 API 若无特别说明使用弧度。模块只依赖
Python 3.11、NumPy 与 SciPy，函数不读写全局状态，供阶段 A2--A5 直接导入。
"""

from __future__ import annotations

import argparse
from collections import deque
import os
from pathlib import Path
import sys
from typing import NamedTuple, Sequence

# 防止同目录 inspect.py 遮蔽 NumPy/SciPy 所需的标准库 inspect。
_MODULE_DIR = Path(__file__).resolve().parent
_removed_paths = [(index, value) for index, value in enumerate(sys.path)
                  if Path(value or os.getcwd()).resolve() == _MODULE_DIR]
sys.path[:] = [value for value in sys.path if Path(value or os.getcwd()).resolve() != _MODULE_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for index, value in _removed_paths:
    sys.path.insert(min(index, len(sys.path)), value)

import numpy as np
from scipy.spatial import cKDTree


_EPS = np.finfo(np.float64).eps * 32


class UmeyamaResult(NamedTuple):
    """相似变换结果：目标点约等于 ``scale * source @ R.T + translation``。"""

    scale: float
    rotation: np.ndarray
    translation: np.ndarray
    residuals: np.ndarray
    mirrored: bool


class NearestTriangleResult(NamedTuple):
    """点到网格最近面结果；距离单位为 mu。"""

    points: np.ndarray
    barycentric: np.ndarray
    face_indices: np.ndarray
    distances_mu: np.ndarray


class SignedDistanceResult(NamedTuple):
    """带符号距离结果；沿插值顶点法线方向为正。"""

    distances_mu: np.ndarray
    nearest_points: np.ndarray
    face_indices: np.ndarray
    barycentric: np.ndarray


def umeyama(source: np.ndarray, target: np.ndarray, *, allow_mirror: bool = False) -> UmeyamaResult:
    """以最小二乘恢复 3D 相似变换，并报告是否需要镜像才能最优拟合。

    ``source`` 与 ``target`` 是相同形状的 N×D 点集（N >= D）。默认返回正旋转；
    ``mirrored`` 仍会标明无约束解是否含反射。``allow_mirror=True`` 时可返回反射矩阵。
    """
    src = np.asarray(source, dtype=np.float64)
    dst = np.asarray(target, dtype=np.float64)
    if src.shape != dst.shape or src.ndim != 2 or src.shape[0] < src.shape[1]:
        raise ValueError("source/target 必须是同形状 N×D 点集，且 N >= D")
    src_mean, dst_mean = src.mean(axis=0), dst.mean(axis=0)
    src0, dst0 = src - src_mean, dst - dst_mean
    variance = np.sum(src0 * src0) / src.shape[0]
    if variance <= _EPS:
        raise ValueError("source 点集退化，无法恢复尺度")
    covariance = dst0.T @ src0 / src.shape[0]
    u, singular, vt = np.linalg.svd(covariance)
    raw_rotation = u @ vt
    mirrored = bool(np.linalg.det(raw_rotation) < 0.0)
    signs = np.ones(src.shape[1], dtype=np.float64)
    if mirrored and not allow_mirror:
        signs[-1] = -1.0
    rotation = (u * signs) @ vt
    scale = float(np.dot(singular, signs) / variance)
    translation = dst_mean - scale * (rotation @ src_mean)
    fitted = scale * (src @ rotation.T) + translation
    residuals = np.linalg.norm(dst - fitted, axis=1)
    return UmeyamaResult(scale, rotation, translation, residuals, mirrored)


def quaternion_to_matrix(quaternion: Sequence[float]) -> np.ndarray:
    """将 glTF 四元数 ``[x,y,z,w]`` 转成 3×3 旋转矩阵。"""
    q = np.asarray(quaternion, dtype=np.float64)
    if q.shape != (4,):
        raise ValueError("quaternion 必须有 4 个分量 [x,y,z,w]")
    norm = np.linalg.norm(q)
    if norm <= _EPS:
        raise ValueError("零四元数没有旋转含义")
    x, y, z, w = q / norm
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
    ])


def matrix_to_quaternion(matrix: np.ndarray) -> np.ndarray:
    """将 3×3 正交旋转矩阵转成规范化 glTF 四元数 ``[x,y,z,w]``。"""
    m = np.asarray(matrix, dtype=np.float64)
    if m.shape != (3, 3):
        raise ValueError("matrix 必须是 3×3")
    if not np.allclose(m.T @ m, np.eye(3), atol=1e-7) or np.linalg.det(m) < 0.0:
        raise ValueError("matrix 必须是无镜像的正交旋转矩阵")
    # 最大对角候选四选一，避免 trace 接近 -1 时失稳。
    candidates = np.array([
        1 + m[0, 0] - m[1, 1] - m[2, 2],
        1 - m[0, 0] + m[1, 1] - m[2, 2],
        1 - m[0, 0] - m[1, 1] + m[2, 2],
        1 + np.trace(m),
    ])
    i = int(np.argmax(candidates))
    root = np.sqrt(max(candidates[i], 0.0)) * 0.5
    if root <= _EPS:
        raise ValueError("旋转矩阵数值退化")
    q = np.empty(4, dtype=np.float64)
    q[i] = root
    d = 4.0 * root
    if i == 0:
        q[1], q[2], q[3] = (m[0, 1] + m[1, 0]) / d, (m[0, 2] + m[2, 0]) / d, (m[2, 1] - m[1, 2]) / d
    elif i == 1:
        q[0], q[2], q[3] = (m[0, 1] + m[1, 0]) / d, (m[1, 2] + m[2, 1]) / d, (m[0, 2] - m[2, 0]) / d
    elif i == 2:
        q[0], q[1], q[3] = (m[0, 2] + m[2, 0]) / d, (m[1, 2] + m[2, 1]) / d, (m[1, 0] - m[0, 1]) / d
    else:
        q[0], q[1], q[2] = (m[2, 1] - m[1, 2]) / d, (m[0, 2] - m[2, 0]) / d, (m[1, 0] - m[0, 1]) / d
    if q[3] < 0.0:
        q = -q
    return q / np.linalg.norm(q)


def compose_matrix(
    translation: Sequence[float] = (0.0, 0.0, 0.0),
    rotation: Sequence[float] = (0.0, 0.0, 0.0, 1.0),
    scale: Sequence[float] = (1.0, 1.0, 1.0),
) -> np.ndarray:
    """按 glTF TRS 顺序合成 4×4 列向量变换矩阵；translation 使用 mu。"""
    t, s = np.asarray(translation, dtype=np.float64), np.asarray(scale, dtype=np.float64)
    if t.shape != (3,) or s.shape != (3,):
        raise ValueError("translation 与 scale 必须各有 3 个分量")
    matrix = np.eye(4, dtype=np.float64)
    matrix[:3, :3] = quaternion_to_matrix(rotation) @ np.diag(s)
    matrix[:3, 3] = t
    return matrix


def decompose_matrix(matrix: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """将无剪切 4×4 仿射矩阵分解为 translation(mu)、quaternion、scale。"""
    m = np.asarray(matrix, dtype=np.float64)
    if m.shape != (4, 4) or not np.allclose(m[3], [0, 0, 0, 1], atol=1e-8):
        raise ValueError("matrix 必须是 4×4 仿射矩阵")
    linear = m[:3, :3]
    scale = np.linalg.norm(linear, axis=0)
    if np.any(scale <= _EPS):
        raise ValueError("matrix 含零尺度，无法分解")
    rotation = linear / scale
    if np.linalg.det(rotation) < 0.0:
        axis = int(np.argmax(scale))
        scale[axis] *= -1.0
        rotation[:, axis] *= -1.0
    if not np.allclose(rotation.T @ rotation, np.eye(3), atol=1e-7):
        raise ValueError("matrix 含剪切，不能表示为单纯 TRS")
    return m[:3, 3].copy(), matrix_to_quaternion(rotation), scale


def pca(points: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """返回点集的中心、降序特征值与对应主轴（每行一根轴）。"""
    pts = np.asarray(points, dtype=np.float64)
    if pts.ndim != 2 or pts.shape[0] < 2:
        raise ValueError("points 必须至少含两个点")
    center = pts.mean(axis=0)
    covariance = (pts - center).T @ (pts - center) / pts.shape[0]
    values, vectors = np.linalg.eigh(covariance)
    order = np.argsort(values)[::-1]
    axes = vectors[:, order].T
    # 固定每根轴符号，使结果跨 BLAS 实现可复现。
    for axis in axes:
        pivot = int(np.argmax(np.abs(axis)))
        if axis[pivot] < 0.0:
            axis *= -1.0
    if axes.shape == (3, 3) and np.linalg.det(axes) < 0.0:
        axes[-1] *= -1.0
    return center, values[order], axes


def closest_point_on_triangle(
    points: np.ndarray, triangle_a: np.ndarray, triangle_b: np.ndarray, triangle_c: np.ndarray
) -> tuple[np.ndarray, np.ndarray]:
    """Ericson 5.1.5 的向量化点-三角最近点，返回最近点与重心坐标。

    四个参数支持 ``(...,3)`` 广播，退化三角形会回落到三条边的精确最近点。
    """
    p, a, b, c = np.broadcast_arrays(
        np.asarray(points, dtype=np.float64), np.asarray(triangle_a, dtype=np.float64),
        np.asarray(triangle_b, dtype=np.float64), np.asarray(triangle_c, dtype=np.float64),
    )
    if p.shape[-1] != 3:
        raise ValueError("点和三角顶点的末维必须为 3")
    shape = p.shape[:-1]
    pf, af, bf, cf = (x.reshape(-1, 3) for x in (p, a, b, c))
    ab, ac, ap = bf - af, cf - af, pf - af
    d1, d2 = np.einsum("ij,ij->i", ab, ap), np.einsum("ij,ij->i", ac, ap)
    bp = pf - bf
    d3, d4 = np.einsum("ij,ij->i", ab, bp), np.einsum("ij,ij->i", ac, bp)
    cp = pf - cf
    d5, d6 = np.einsum("ij,ij->i", ab, cp), np.einsum("ij,ij->i", ac, cp)
    bary = np.full((len(pf), 3), np.nan, dtype=np.float64)

    def assign(mask: np.ndarray, values: tuple[np.ndarray | float, ...]) -> None:
        fresh = mask & np.isnan(bary[:, 0])
        if not np.any(fresh):
            return
        for column, value in enumerate(values):
            bary[fresh, column] = value if np.isscalar(value) else value[fresh]

    assign((d1 <= 0) & (d2 <= 0), (1.0, 0.0, 0.0))
    assign((d3 >= 0) & (d4 <= d3), (0.0, 1.0, 0.0))
    vc = d1 * d4 - d3 * d2
    denom = d1 - d3
    v = np.divide(d1, denom, out=np.zeros_like(d1), where=np.abs(denom) > _EPS)
    assign((vc <= 0) & (d1 >= 0) & (d3 <= 0), (1 - v, v, 0.0))
    assign((d6 >= 0) & (d5 <= d6), (0.0, 0.0, 1.0))
    vb = d5 * d2 - d1 * d6
    denom = d2 - d6
    w = np.divide(d2, denom, out=np.zeros_like(d2), where=np.abs(denom) > _EPS)
    assign((vb <= 0) & (d2 >= 0) & (d6 <= 0), (1 - w, 0.0, w))
    va = d3 * d6 - d5 * d4
    denom = (d4 - d3) + (d5 - d6)
    w_edge = np.divide(d4 - d3, denom, out=np.zeros_like(d1), where=np.abs(denom) > _EPS)
    assign((va <= 0) & ((d4 - d3) >= 0) & ((d5 - d6) >= 0), (0.0, 1 - w_edge, w_edge))
    interior = np.isnan(bary[:, 0])
    denom = va + vb + vc
    valid = interior & (np.abs(denom) > _EPS)
    bary[valid, 1] = vb[valid] / denom[valid]
    bary[valid, 2] = vc[valid] / denom[valid]
    bary[valid, 0] = 1.0 - bary[valid, 1] - bary[valid, 2]

    degenerate = np.isnan(bary[:, 0])
    if np.any(degenerate):
        ids = np.flatnonzero(degenerate)
        candidates, weights = [], []
        for start, end, pair in ((af, bf, (0, 1)), (bf, cf, (1, 2)), (cf, af, (2, 0))):
            edge = end[ids] - start[ids]
            length2 = np.einsum("ij,ij->i", edge, edge)
            alpha = np.divide(np.einsum("ij,ij->i", pf[ids] - start[ids], edge), length2,
                              out=np.zeros_like(length2), where=length2 > _EPS)
            alpha = np.clip(alpha, 0.0, 1.0)
            candidates.append(start[ids] + alpha[:, None] * edge)
            bw = np.zeros((len(ids), 3)); bw[:, pair[0]] = 1 - alpha; bw[:, pair[1]] = alpha
            weights.append(bw)
        candidate_points = np.stack(candidates, axis=1)
        pick = np.argmin(np.sum((candidate_points - pf[ids, None, :]) ** 2, axis=2), axis=1)
        bary[ids] = np.stack(weights, axis=1)[np.arange(len(ids)), pick]
    nearest = bary[:, :1] * af + bary[:, 1:2] * bf + bary[:, 2:] * cf
    return nearest.reshape(*shape, 3), bary.reshape(*shape, 3)


def nearest_triangle(
    points: np.ndarray, vertices: np.ndarray, faces: np.ndarray, *, k: int = 16
) -> NearestTriangleResult:
    """用面质心 cKDTree 取候选，再精确求点到三角面的最近点。

    ``k`` 是首轮候选数。为保证细长三角形也正确，函数会按三角形包围半径扩展
    KD 查询，并精算所有可能优于当前结果的面，而非把“最近质心”当作严格最近面。
    """
    pts = np.asarray(points, dtype=np.float64)
    verts = np.asarray(vertices, dtype=np.float64)
    tri_indices = np.asarray(faces, dtype=np.int64)
    if pts.ndim != 2 or pts.shape[1] != 3 or verts.ndim != 2 or verts.shape[1] != 3:
        raise ValueError("points/vertices 必须是 N×3")
    if tri_indices.ndim != 2 or tri_indices.shape[1] != 3 or len(tri_indices) == 0:
        raise ValueError("faces 必须是非空 M×3 三角索引")
    if np.any(tri_indices < 0) or np.any(tri_indices >= len(verts)):
        raise ValueError("faces 含越界顶点索引")
    triangles = verts[tri_indices]
    centers = triangles.mean(axis=1)
    radii = np.linalg.norm(triangles - centers[:, None, :], axis=2).max(axis=1)
    tree = cKDTree(centers)
    initial_k = min(max(int(k), 1), len(triangles))
    _, seeds = tree.query(pts, k=initial_k)
    seeds = np.asarray(seeds).reshape(len(pts), -1)
    out_points = np.empty_like(pts)
    out_bary = np.empty_like(pts)
    out_faces = np.empty(len(pts), dtype=np.int64)
    out_distances = np.empty(len(pts), dtype=np.float64)
    max_radius = float(radii.max(initial=0.0))
    for row, point in enumerate(pts):
        candidate_ids = np.unique(seeds[row])
        seed_tri = triangles[candidate_ids]
        nearest, bary = closest_point_on_triangle(
            np.broadcast_to(point, (len(candidate_ids), 3)), seed_tri[:, 0], seed_tri[:, 1], seed_tri[:, 2]
        )
        distances = np.linalg.norm(nearest - point, axis=1)
        best = float(distances.min())
        expanded = np.asarray(tree.query_ball_point(point, best + max_radius), dtype=np.int64)
        if len(expanded) and (len(expanded) != len(candidate_ids) or not np.array_equal(expanded, candidate_ids)):
            possible = np.linalg.norm(centers[expanded] - point, axis=1) - radii[expanded] <= best + _EPS
            candidate_ids = expanded[possible]
            tri = triangles[candidate_ids]
            nearest, bary = closest_point_on_triangle(
                np.broadcast_to(point, (len(candidate_ids), 3)), tri[:, 0], tri[:, 1], tri[:, 2]
            )
            distances = np.linalg.norm(nearest - point, axis=1)
        pick = int(np.argmin(distances))
        out_points[row], out_bary[row] = nearest[pick], bary[pick]
        out_faces[row], out_distances[row] = candidate_ids[pick], distances[pick]
    return NearestTriangleResult(out_points, out_bary, out_faces, out_distances)


def lbs(
    positions: np.ndarray, joints: np.ndarray, weights: np.ndarray, bone_world: np.ndarray, ibm: np.ndarray
) -> np.ndarray:
    """线性混合蒙皮；positions/bone translation 均为 mu，返回 N×3 变形点。"""
    pos = np.asarray(positions, dtype=np.float64)
    joint_ids = np.asarray(joints, dtype=np.int64)
    influence = np.asarray(weights, dtype=np.float64)
    worlds, inverses = np.asarray(bone_world, dtype=np.float64), np.asarray(ibm, dtype=np.float64)
    if pos.ndim != 2 or pos.shape[1] != 3:
        raise ValueError("positions 必须是 N×3")
    if joint_ids.shape != influence.shape or joint_ids.ndim != 2 or joint_ids.shape[0] != len(pos):
        raise ValueError("joints/weights 必须是同形状 N×K")
    if worlds.shape != inverses.shape or worlds.ndim != 3 or worlds.shape[1:] != (4, 4):
        raise ValueError("bone_world/ibm 必须是同形状 B×4×4")
    if np.any(joint_ids < 0) or np.any(joint_ids >= len(worlds)):
        raise ValueError("joints 含越界关节索引")
    matrices = worlds @ inverses
    homogeneous = np.concatenate([pos, np.ones((len(pos), 1))], axis=1)
    transformed = np.einsum("nkij,nj->nki", matrices[joint_ids], homogeneous)[..., :3]
    return np.einsum("nk,nki->ni", influence, transformed)


def signed_distance(
    points: np.ndarray, body_vertices: np.ndarray, body_faces: np.ndarray, body_normals: np.ndarray, *, k: int = 16
) -> SignedDistanceResult:
    """按“最近体表点连线 · 重心插值法线”求带符号距离（mu）。

    ``body_normals`` 是逐顶点外法线；闭合且法线一致的网格外部为正、内部为负。
    """
    normals = np.asarray(body_normals, dtype=np.float64)
    verts = np.asarray(body_vertices, dtype=np.float64)
    faces = np.asarray(body_faces, dtype=np.int64)
    if normals.shape != verts.shape:
        raise ValueError("body_normals 必须与 body_vertices 同形状")
    nearest = nearest_triangle(points, verts, faces, k=k)
    tri_normals = normals[faces[nearest.face_indices]]
    interpolated = np.einsum("ni,nij->nj", nearest.barycentric, tri_normals)
    length = np.linalg.norm(interpolated, axis=1, keepdims=True)
    interpolated = np.divide(interpolated, length, out=np.zeros_like(interpolated), where=length > _EPS)
    offsets = np.asarray(points, dtype=np.float64) - nearest.points
    sign = np.sign(np.einsum("ij,ij->i", offsets, interpolated))
    sign[sign == 0.0] = 1.0
    return SignedDistanceResult(sign * nearest.distances_mu, nearest.points, nearest.face_indices, nearest.barycentric)


def adjacency_list(vertex_count: int, faces: np.ndarray) -> list[np.ndarray]:
    """由三角索引生成无向、去重、升序的逐顶点邻接表。"""
    if vertex_count < 0:
        raise ValueError("vertex_count 不能为负")
    tri = np.asarray(faces, dtype=np.int64)
    if tri.ndim != 2 or tri.shape[1] != 3:
        raise ValueError("faces 必须是 M×3")
    if tri.size and (tri.min() < 0 or tri.max() >= vertex_count):
        raise ValueError("faces 含越界顶点索引")
    neighbors: list[set[int]] = [set() for _ in range(vertex_count)]
    for a, b, c in tri:
        if a != b: neighbors[a].add(int(b)); neighbors[b].add(int(a))
        if b != c: neighbors[b].add(int(c)); neighbors[c].add(int(b))
        if c != a: neighbors[c].add(int(a)); neighbors[a].add(int(c))
    return [np.asarray(sorted(items), dtype=np.int64) for items in neighbors]


def connected_components(vertex_count: int, faces: np.ndarray) -> list[np.ndarray]:
    """返回按最小顶点编号排序的网格连通块，每块为升序顶点索引。"""
    graph = adjacency_list(vertex_count, faces)
    seen = np.zeros(vertex_count, dtype=bool)
    components: list[np.ndarray] = []
    for root in range(vertex_count):
        if seen[root]:
            continue
        seen[root] = True
        queue, component = deque([root]), []
        while queue:
            vertex = queue.popleft(); component.append(vertex)
            for neighbor in graph[vertex]:
                if not seen[neighbor]:
                    seen[neighbor] = True; queue.append(int(neighbor))
        components.append(np.asarray(sorted(component), dtype=np.int64))
    return components


def edge_statistics(faces: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """返回边界边（出现一次）与非流形边（出现超过两次），均为 E×2。"""
    tri = np.asarray(faces, dtype=np.int64)
    if tri.ndim != 2 or tri.shape[1] != 3:
        raise ValueError("faces 必须是 M×3")
    if len(tri) == 0:
        empty = np.empty((0, 2), dtype=np.int64)
        return empty, empty.copy()
    edges = np.concatenate([tri[:, [0, 1]], tri[:, [1, 2]], tri[:, [2, 0]]])
    edges.sort(axis=1)
    unique, counts = np.unique(edges, axis=0, return_counts=True)
    return unique[counts == 1], unique[counts > 2]


def laplacian_smooth(
    vertices: np.ndarray, faces: np.ndarray | None = None, *, adjacency: Sequence[Sequence[int]] | None = None,
    iterations: int = 1, lambda_: float = 0.5, fixed: Sequence[int] | np.ndarray | None = None,
) -> np.ndarray:
    """均匀拉普拉斯平滑，坐标单位 mu；可固定指定顶点索引或布尔掩码。"""
    verts = np.asarray(vertices, dtype=np.float64)
    if verts.ndim != 2 or verts.shape[1] != 3:
        raise ValueError("vertices 必须是 N×3")
    if iterations < 0 or not 0.0 <= lambda_ <= 1.0:
        raise ValueError("iterations >= 0 且 lambda_ 必须在 [0,1]")
    if adjacency is None:
        if faces is None:
            raise ValueError("faces 与 adjacency 至少提供一个")
        graph = adjacency_list(len(verts), faces)
    else:
        if len(adjacency) != len(verts):
            raise ValueError("adjacency 长度必须等于顶点数")
        graph = [np.asarray(row, dtype=np.int64) for row in adjacency]
    frozen = np.zeros(len(verts), dtype=bool)
    if fixed is not None:
        raw = np.asarray(fixed)
        if raw.dtype == np.bool_:
            if raw.shape != (len(verts),):
                raise ValueError("fixed 布尔掩码长度错误")
            frozen = raw.copy()
        else:
            frozen[np.asarray(raw, dtype=np.int64)] = True
    current = verts.copy()
    for _ in range(iterations):
        updated = current.copy()
        for index, neighbors in enumerate(graph):
            if not frozen[index] and len(neighbors):
                updated[index] += lambda_ * (current[neighbors].mean(axis=0) - current[index])
        current = updated
    return current


# 明确基础库的稳定公开面，后续任务只追加、不改这些签名。
__all__ = [
    "NearestTriangleResult", "SignedDistanceResult", "UmeyamaResult", "adjacency_list",
    "closest_point_on_triangle", "compose_matrix", "connected_components", "decompose_matrix",
    "edge_statistics", "laplacian_smooth", "lbs", "matrix_to_quaternion", "nearest_triangle",
    "pca", "quaternion_to_matrix", "signed_distance", "umeyama",
]


def main(argv: Sequence[str] | None = None) -> int:
    """公共数学库命令行入口；用于发现 API，计算请从 Python 导入。"""
    parser = argparse.ArgumentParser(description="3D 换装公共几何库（坐标/距离单位：模型单位 mu）")
    parser.parse_args(argv)
    print("可导入 API：" + ", ".join(__all__))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
