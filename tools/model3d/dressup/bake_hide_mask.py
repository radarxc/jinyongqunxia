#!/usr/bin/env python3
"""把贴合后衣物覆盖范围烘焙成模板 UV 的 8 位身体隐藏遮罩。

白色纹素表示运行时应丢弃身体片元。几何距离使用模型单位（mu），只在
CLI/JSON 边界换算毫米；glTF UV 与输出 PNG 都采用左上原点。
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
import heapq
import io
import json
import math
from pathlib import Path
import resource
import sys
import time
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy.ndimage import (binary_closing, binary_dilation, binary_erosion,
                           binary_fill_holes, binary_opening, distance_transform_edt, label)

try:
    from .bake_texture_layer import (_ray_scene, _rays_in_aabb, Raster, RayHits,
                                     bilinear_sample, rasterize_uv, raycast_outermost)
    from .glb_io import GLB, Mesh, load_glb
    from .fit_garment import SurfaceIndex
    from .common import lbs
except ImportError:
    from bake_texture_layer import (_ray_scene, _rays_in_aabb, Raster, RayHits,
                                    bilinear_sample, rasterize_uv, raycast_outermost)
    from glb_io import GLB, Mesh, load_glb
    from fit_garment import SurfaceIndex
    from common import lbs

NEVER_HIDE = frozenset({"head", "neck", "handL", "handR", "footL", "footR"})
VIEW_ELEVATION_DEG = (-15.0, 80.0)
HOLE_CHECK_VIEWS = np.asarray([
    [0., 0., 1.], [0., 0., -1.], [1., 0., 0.], [-1., 0., 0.],
    [0., 1., 1.], [0., 1., -1.], [1., 1., 0.], [-1., 1., 0.],
], dtype=np.float64)
HOLE_CHECK_VIEWS /= np.linalg.norm(HOLE_CHECK_VIEWS, axis=1)[:, None]


class BakeError(ValueError):
    """输入资产不满足 hide mask 烘焙契约。"""


@dataclass(frozen=True)
class MaskBake:
    mask: np.ndarray
    covered: np.ndarray
    raw: np.ndarray
    opening_safe: np.ndarray
    stats: dict[str, Any]


@dataclass(frozen=True)
class PosedMeshes:
    """同一 bind/动画时刻的身体与衣物表面。"""

    label: str
    body_positions: np.ndarray
    body_normals: np.ndarray
    garment_positions: np.ndarray
    garment_normals: np.ndarray


@dataclass(frozen=True)
class OrthoFrame:
    right: np.ndarray
    up: np.ndarray
    direction: np.ndarray
    low: np.ndarray
    scale: float
    size: int


@dataclass(frozen=True)
class TriangleFragments:
    pixels: np.ndarray
    depths: np.ndarray
    faces: np.ndarray
    barycentric: np.ndarray


def _memory_mib() -> float:
    value = float(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
    if sys.platform != "darwin":
        value *= 1024.0
    return value / (1024.0 * 1024.0)


def _base_texture(glb: GLB) -> Image.Image:
    for material in glb.json.get("materials", []):
        ref = material.get("pbrMetallicRoughness", {}).get("baseColorTexture")
        if isinstance(ref, dict):
            texture = glb.json["textures"][int(ref["index"])]
            source = texture.get("source")
            if source is not None:
                data = glb.image(int(source))
                with Image.open(io.BytesIO(data.data)) as image:
                    return image.convert("RGB")
    return Image.new("RGB", (4, 4), (210, 172, 145))


def _sample_scalar(image: np.ndarray, uv: np.ndarray) -> np.ndarray:
    pixels = np.asarray(image); coords = np.asarray(uv, dtype=np.float64)
    height, width = pixels.shape; x = np.clip(coords[:, 0], 0, 1) * (width - 1)
    y = np.clip(coords[:, 1], 0, 1) * (height - 1)
    x0, y0 = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    x1, y1 = np.minimum(x0 + 1, width - 1), np.minimum(y0 + 1, height - 1)
    wx, wy = x - x0, y - y0
    return ((1 - wy) * ((1 - wx) * pixels[y0, x0] + wx * pixels[y0, x1])
            + wy * ((1 - wx) * pixels[y1, x0] + wx * pixels[y1, x1]))


def _welded_boundary_segments(mesh: Mesh) -> tuple[np.ndarray, np.ndarray,
                                                    np.ndarray, dict[str, int]]:
    """焊接 UV 拆点后提取只被一个三角占用的真实开口边。"""
    rounded = np.round(np.asarray(mesh.positions, dtype=np.float64), 7)
    unique, inverse = np.unique(rounded, axis=0, return_inverse=True)
    faces = inverse[np.asarray(mesh.indices, dtype=np.int64).reshape(-1, 3)]
    edges = np.sort(np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]],
                                    faces[:, [2, 0]])), axis=1)
    edges = edges[edges[:, 0] != edges[:, 1]]
    distinct, counts = np.unique(edges, axis=0, return_counts=True)
    boundary = distinct[counts == 1]
    if not len(boundary):
        raise BakeError("衣物没有开口边界；无法执行领口/袖口/衣摆留边")
    graph: dict[int, set[int]] = {}
    for left, right in boundary:
        graph.setdefault(int(left), set()).add(int(right)); graph.setdefault(int(right), set()).add(int(left))
    components: list[np.ndarray] = []; seen: set[int] = set()
    for root in sorted(graph):
        if root in seen:
            continue
        queue = [root]; seen.add(root); vertices: list[int] = []
        while queue:
            current = queue.pop(); vertices.append(current)
            for neighbor in graph[current]:
                if neighbor not in seen:
                    seen.add(neighbor); queue.append(neighbor)
        components.append(np.asarray(vertices, dtype=np.int64))
    component_rows: list[tuple[int, float, np.ndarray]] = []
    for index, vertices in enumerate(components):
        member = np.isin(boundary[:, 0], vertices) & np.isin(boundary[:, 1], vertices)
        length = float(np.linalg.norm(unique[boundary[member, 0]] - unique[boundary[member, 1]], axis=1).sum())
        component_rows.append((index, length, unique[vertices].mean(axis=0)))
    # 减面件会留下许多内部碎孔；只取衣物四个语义主开口。
    if len(component_rows) <= 4:
        selected_components = {row[0] for row in component_rows}
    else:
        hem = max(component_rows, key=lambda row: row[1])
        substantial = [row for row in component_rows if row[1] >= hem[1] * .07 and row[0] != hem[0]]
        collar = max(substantial, key=lambda row: row[2][1])
        remaining = [row for row in substantial if row[0] != collar[0]]
        left = min(remaining, key=lambda row: row[2][0]); right = max(remaining, key=lambda row: row[2][0])
        selected_components = {hem[0], collar[0], left[0], right[0]}
    selected_vertices = np.concatenate([components[index] for index in sorted(selected_components)])
    selected = boundary[np.isin(boundary[:, 0], selected_vertices) & np.isin(boundary[:, 1], selected_vertices)]
    return unique[selected], unique, selected_vertices, {
        "weldedVertices": int(len(unique)), "boundaryEdges": int(len(boundary)),
        "boundaryComponents": int(len(components)),
        "openingRings": int(len(selected_components)), "openingEdges": int(len(selected)),
        "nonManifoldEdges": int(np.count_nonzero(counts > 2)),
    }


def _opening_geodesic(unique: np.ndarray, faces: np.ndarray,
                      opening_vertices: np.ndarray) -> np.ndarray:
    """在焊接衣物拓扑上计算每个顶点到语义开口的最短表面边长。"""
    edges = np.sort(np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]],
                                    faces[:, [2, 0]])), axis=1)
    edges = np.unique(edges[edges[:, 0] != edges[:, 1]], axis=0)
    graph: list[list[tuple[int, float]]] = [[] for _ in range(len(unique))]
    lengths = np.linalg.norm(unique[edges[:, 0]] - unique[edges[:, 1]], axis=1)
    for (left, right), length in zip(edges, lengths):
        graph[int(left)].append((int(right), float(length)))
        graph[int(right)].append((int(left), float(length)))
    distance = np.full(len(unique), np.inf); queue: list[tuple[float, int]] = []
    for vertex in np.unique(opening_vertices):
        distance[vertex] = 0.0; heapq.heappush(queue, (0.0, int(vertex)))
    while queue:
        current, vertex = heapq.heappop(queue)
        if current != distance[vertex]: continue
        for neighbor, length in graph[vertex]:
            value = current + length
            if value < distance[neighbor]:
                distance[neighbor] = value; heapq.heappush(queue, (value, neighbor))
    return distance


def _hit_opening_geodesic(face_ids: np.ndarray, barycentric: np.ndarray,
                           welded_faces: np.ndarray, welded_positions: np.ndarray,
                           vertex_distance: np.ndarray, opening_edges: np.ndarray
                           ) -> np.ndarray:
    """把首命中三角所属衣面到开口环的测地距离插值到命中点。

    距离只沿焊接后的衣物拓扑传播。空间上贴近、拓扑上属于另一叠襟层的
    自由边不会让当前层误判为开口留边。
    """
    ids = np.asarray(face_ids, dtype=np.int64)
    bary = np.asarray(barycentric, dtype=np.float64)
    if len(ids) != len(bary):
        raise ValueError("face_ids 与 barycentric 数量不同")
    triangles = welded_positions[welded_faces[ids]]
    points = np.einsum("ni,nij->nj", bary, triangles)
    # 把命中点作为临时图节点连到所属三角三个顶点，再接全局测地场。
    # 不能直接重心插值顶点距离：只有上下两圈顶点的粗圆柱会被插值成全零。
    local = np.linalg.norm(triangles - points[:, None, :], axis=2)
    result = np.min(local + vertex_distance[welded_faces[ids]], axis=1)
    face_vertices = welded_faces[ids]
    local_edges = np.sort(face_vertices[:, [[0, 1], [1, 2], [2, 0]]], axis=2)
    base = len(welded_positions)
    opening_keys = opening_edges[:, 0] * base + opening_edges[:, 1]
    edge_keys = local_edges[..., 0] * base + local_edges[..., 1]
    owns_opening = np.isin(edge_keys, opening_keys)
    for edge_index in range(3):
        member = owns_opening[:, edge_index]
        if not np.any(member):
            continue
        segment = welded_positions[local_edges[member, edge_index]]
        vector = segment[:, 1] - segment[:, 0]
        delta = points[member] - segment[:, 0]
        length2 = np.einsum("ij,ij->i", vector, vector)
        along = np.divide(np.einsum("ij,ij->i", delta, vector), length2,
                          out=np.zeros_like(length2), where=length2 > 1e-15)
        nearest = segment[:, 0] + np.clip(along, 0, 1)[:, None] * vector
        result[member] = np.minimum(result[member], np.linalg.norm(points[member] - nearest, axis=1))
    return result


def _selected_opening_edges(faces: np.ndarray, opening_vertices: np.ndarray) -> np.ndarray:
    edges = np.sort(np.concatenate((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]])), axis=1)
    distinct, counts = np.unique(edges[edges[:, 0] != edges[:, 1]], axis=0, return_counts=True)
    boundary = distinct[counts == 1]
    return boundary[np.isin(boundary[:, 0], opening_vertices) & np.isin(boundary[:, 1], opening_vertices)]


def _disk(radius: int) -> np.ndarray:
    yy, xx = np.mgrid[-radius:radius + 1, -radius:radius + 1]
    return xx * xx + yy * yy <= radius * radius


def _gutter(mask: np.ndarray, covered: np.ndarray, width: int = 4) -> np.ndarray:
    result = np.asarray(mask, dtype=bool).copy()
    if not np.any(result):
        return result
    distance, nearest = distance_transform_edt(~result, return_indices=True)
    expansion = (~covered) & (distance <= float(width))
    result[expansion] = result[nearest[0][expansion], nearest[1][expansion]]
    return result


def _bind_penetration_patch(body: Mesh, garment: Mesh, regions: np.ndarray,
                            never_ids: set[int], size: int, opening_vertex_distance: np.ndarray,
                            opening_margin_mu: float, radius: int = 9
                            ) -> tuple[np.ndarray, int]:
    """把衣物 bind 内陷点的最近身体 UV 作为确定覆盖证据。"""
    assert body.normals is not None and body.uvs is not None
    faces = np.asarray(body.indices, np.int64).reshape(-1, 3)
    nearest, bary, face_ids, _ = SurfaceIndex(
        body.positions, faces, body.normals).query(garment.positions)
    tri = faces[face_ids]; normals = np.einsum("ni,nij->nj", bary, body.normals[tri])
    inside = np.einsum("ij,ij->i", garment.positions - nearest, normals) < 0
    region = regions[tri[np.arange(len(tri)), np.argmax(bary, axis=1)]]
    # 当前点本来就是衣物顶点，直接使用它在焊接衣面上的开口测地距离。
    far_from_opening = opening_vertex_distance >= opening_margin_mu
    selected = inside & far_from_opening & ~np.isin(region, list(never_ids)); uv = np.einsum(
        "ni,nij->nj", bary[selected], body.uvs[tri[selected]])
    patch = np.zeros((size, size), bool); structure = _disk(radius)
    x = np.rint(np.clip(uv[:, 0], 0, 1) * (size - 1)).astype(int)
    y = np.rint(np.clip(uv[:, 1], 0, 1) * (size - 1)).astype(int)
    patch[y, x] = True
    return binary_dilation(patch, structure=structure), int(np.count_nonzero(inside))


def _raycast_nearest(origins: np.ndarray, directions: np.ndarray, scene: Any,
                     max_distance: float) -> RayHits:
    """双面求交并返回沿射线的首个衣物层。"""
    best = np.full(len(origins), np.inf); best_face = np.full(len(origins), -1, np.int64)
    best_bary = np.zeros((len(origins), 3)); stack = [(0, np.arange(len(origins)))]
    while stack:
        node_id, rays = stack.pop(); node = scene.nodes[node_id]
        rays = rays[_rays_in_aabb(origins[rays], directions[rays], node, max_distance)]
        if not len(rays): continue
        if node.faces is None:
            stack.append((node.left, rays)); stack.append((node.right, rays)); continue
        tri = scene.triangles[node.faces]; e1 = tri[:, 1] - tri[:, 0]; e2 = tri[:, 2] - tri[:, 0]
        direction = directions[rays, None, :]; delta = origins[rays, None, :] - tri[None, :, 0]
        cross = np.cross(direction, e2[None]); det = np.einsum("fi,rfi->rf", e1, cross)
        inverse = np.divide(1.0, det, out=np.zeros_like(det), where=np.abs(det) > 1e-10)
        u = np.einsum("rfi,rfi->rf", delta, cross) * inverse
        q = np.cross(delta, e1[None]); v = np.sum(direction * q, axis=2) * inverse
        distance = np.einsum("fi,rfi->rf", e2, q) * inverse
        valid = ((np.abs(det) > 1e-10) & (u >= -1e-8) & (v >= -1e-8)
                 & (u + v <= 1.0 + 1e-8) & (distance >= 0) & (distance <= max_distance))
        values = np.where(valid, distance, np.inf); pick = np.argmin(values, axis=1)
        chosen = values[np.arange(len(rays)), pick]; improve = chosen < best[rays]
        selected, column = rays[improve], pick[improve]; best[selected] = chosen[improve]
        best_face[selected] = node.faces[column]
        best_bary[selected] = np.stack((1 - u[improve, column] - v[improve, column],
                                        u[improve, column], v[improve, column]), axis=1)
    hit = best_face >= 0
    return RayHits(best_face, best_bary, best, hit, np.zeros(len(origins), np.int32))


def _next_layer(hit_points: np.ndarray, directions: np.ndarray, garment: Mesh,
                max_distance: float) -> np.ndarray:
    """从首层后 0.1 mm 继续射线，判断叠襟自由边下是否还有衣物层。"""
    if not len(hit_points): return np.zeros(0, bool)
    epsilon = max(max_distance * .001, 1e-6)
    origins = hit_points + directions * epsilon
    ray = _raycast_nearest(origins, directions,
                           _ray_scene(garment.positions, garment.indices.reshape(-1, 3)),
                           max_distance)
    return ray.hit


def _ray_hits(points: np.ndarray, normals: np.ndarray, garment: Mesh,
              max_distance_mu: float, cage_mu: float, chunk_size: int = 65536
              ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """法线加八个 25 度斜向；按到身体点距离选最近命中层。"""
    hits = np.zeros(len(points), bool); faces = garment.indices.reshape(-1, 3)
    first_distance = np.full(len(points), np.inf); first_face = np.full(len(points), -1, np.int64)
    first_bary = np.zeros((len(points), 3)); first_direction = np.zeros_like(points)
    scene = _ray_scene(garment.positions, faces)
    reference = np.where(np.abs(normals[:, 1:2]) < .9, [0., 1., 0.], [1., 0., 0.])
    tangent = np.cross(reference, normals); tangent /= np.maximum(np.linalg.norm(tangent, axis=1)[:, None], 1e-12)
    bitangent = np.cross(normals, tangent); angle = math.radians(25.0)
    directions = [normals]
    for azimuth in np.linspace(0.0, 2 * math.pi, 8, endpoint=False):
        directions.append(math.cos(angle) * normals + math.sin(angle) *
                          (math.cos(azimuth) * tangent + math.sin(azimuth) * bitangent))
    for start in range(0, len(points), chunk_size):
        stop = min(start + chunk_size, len(points))
        origins = points[start:stop] - cage_mu * normals[start:stop]
        for direction in directions:
            ray = _raycast_nearest(origins, direction[start:stop], scene, max_distance_mu + cage_mu)
            distance = np.full(len(origins), np.inf)
            ids = np.flatnonzero(ray.hit)
            hit_points = origins[ids] + ray.distance[ids, None] * direction[start + ids]
            distance[ids] = np.linalg.norm(hit_points - points[start + ids], axis=1)
            improve = ray.hit & (distance < first_distance[start:stop])
            ids = np.flatnonzero(improve); first_distance[start + ids] = distance[ids]
            first_face[start + ids] = ray.faces[ids]; first_bary[start + ids] = ray.bary[ids]
            first_direction[start + ids] = direction[start + ids]
        hits[start:stop] = first_face[start:stop] >= 0
    return hits, first_face, first_bary, first_direction


def _weld_boolean(positions: np.ndarray, values: np.ndarray, *, mode: str) -> np.ndarray:
    """令同一 3D 点的 UV 拆点标签一致；禁区/留边采用保守并集。"""
    _, groups = np.unique(np.round(positions, 7), axis=0, return_inverse=True)
    count = int(groups.max(initial=-1)) + 1
    if mode == "any":
        grouped = np.zeros(count, bool); np.logical_or.at(grouped, groups, values)
    elif mode == "all":
        grouped = np.ones(count, bool); np.logical_and.at(grouped, groups, values)
    else:
        raise ValueError(f"未知焊接模式：{mode}")
    return grouped[groups]


def _split_uv_edges(body: Mesh) -> list[list[tuple[np.ndarray, np.ndarray]]]:
    """返回同一焊接 3D 边在不同 UV 岛中的有向线段组。"""
    assert body.uvs is not None
    _, welded = np.unique(np.round(body.positions, 7), axis=0, return_inverse=True)
    faces = np.asarray(body.indices, dtype=np.int64).reshape(-1, 3)
    topology: set[tuple[int, int]] = set()
    for face in faces:
        for left, right in ((face[0], face[1]), (face[1], face[2]), (face[2], face[0])):
            if left != right:
                topology.add(tuple(sorted((int(left), int(right)))))
    grouped: dict[tuple[int, int], dict[tuple[float, ...], tuple[np.ndarray, np.ndarray]]] = {}
    for left, right in topology:
        wl, wr = int(welded[left]), int(welded[right])
        if wl == wr:
            continue
        if wl > wr:
            left, right, wl, wr = right, left, wr, wl
        start, end = body.uvs[left], body.uvs[right]
        uv_key = tuple(np.round(np.concatenate((start, end)), 9))
        grouped.setdefault((wl, wr), {})[uv_key] = (start, end)
    return [list(segments.values()) for segments in grouped.values() if len(segments) > 1]


def _edge_sample_parameters(segments: list[tuple[np.ndarray, np.ndarray]],
                            height: int, width: int) -> np.ndarray:
    """按最长 UV 线段像素长度加密，并显式包含审核用 33 点。"""
    longest = 0.0
    for start, end in segments:
        delta = (end - start) * np.array([width - 1, height - 1])
        longest = max(longest, float(np.linalg.norm(delta)))
    dense = np.linspace(0.0, 1.0, max(2, 2 * math.ceil(longest) + 1))
    return np.unique(np.concatenate((dense, np.linspace(0.0, 1.0, 33))))


def _synchronize_uv_seams(mask: np.ndarray, protected: np.ndarray, body: Mesh) -> int:
    """形态学后同步三维重合 seam 边全段，而不只同步端点。"""
    assert body.uvs is not None
    height, width = mask.shape
    flat_mask, flat_protected = mask.reshape(-1), protected.reshape(-1)
    parent: dict[int, int] = {}
    def root(pixel: int) -> int:
        parent.setdefault(pixel, pixel)
        while parent[pixel] != pixel:
            parent[pixel] = parent[parent[pixel]]; pixel = parent[pixel]
        return pixel
    def union(left: int, right: int) -> None:
        left_root, right_root = root(left), root(right)
        if left_root != right_root:
            parent[right_root] = left_root
    for segments in _split_uv_edges(body):
        # 只合并同一 3D 参数处的各岛像素；不可合并一条边内相邻参数，
        # 否则公共端点会把整张 seam 网串成一个巨大组件。
        for parameter in _edge_sample_parameters(segments, height, width):
            pixels: list[int] = []
            for start, end in segments:
                uv = np.clip(start + parameter * (end - start), 0, 1)
                column = int(np.rint(uv[0] * (width - 1)))
                row = int(np.rint(uv[1] * (height - 1)))
                pixels.append(row * width + column)
            for pixel in pixels[1:]:
                union(pixels[0], pixel)
    components: dict[int, list[int]] = {}
    for pixel in parent:
        components.setdefault(root(pixel), []).append(pixel)
    changed = 0
    for pixels in components.values():
        value = False if np.any(flat_protected[pixels]) else bool(np.any(flat_mask[pixels]))
        changed += int(np.count_nonzero(flat_mask[pixels] != value))
        flat_mask[pixels] = value
    return changed


def _vertex_normals(positions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    normals = np.zeros_like(positions, dtype=np.float64)
    triangles = positions[faces]
    face_normals = np.cross(triangles[:, 1] - triangles[:, 0],
                            triangles[:, 2] - triangles[:, 0])
    np.add.at(normals, faces.ravel(), np.repeat(face_normals, 3, axis=0))
    lengths = np.linalg.norm(normals, axis=1)
    return normals / np.maximum(lengths[:, None], 1e-12)


def fibonacci_directions(count: int = 128,
                         elevation_deg: tuple[float, float] = VIEW_ELEVATION_DEG
                         ) -> np.ndarray:
    """在游戏相机可达球带内按球面面积确定性均匀采样。"""
    if count < 2:
        raise ValueError("视角数至少为 2")
    low_deg, high_deg = elevation_deg
    if not -90.0 <= low_deg < high_deg <= 90.0:
        raise ValueError("视角仰角范围必须满足 -90 <= low < high <= 90")
    index = np.arange(count, dtype=np.float64)
    low_y, high_y = math.sin(math.radians(low_deg)), math.sin(math.radians(high_deg))
    y = low_y + (high_y - low_y) * index / (count - 1)
    radius = np.sqrt(np.maximum(0.0, 1.0 - y * y))
    azimuth = index * (math.pi * (3.0 - math.sqrt(5.0)))
    return np.column_stack((radius * np.cos(azimuth), y, radius * np.sin(azimuth)))


def orthographic_frame(meshes: Sequence[np.ndarray], direction: np.ndarray,
                       size: int) -> OrthoFrame:
    reference = np.array([0., 1., 0.]) if abs(float(direction[1])) < .9 else np.array([1., 0., 0.])
    right = np.cross(reference, direction); right /= np.linalg.norm(right)
    up = np.cross(direction, right)
    combined = np.concatenate(tuple(meshes), axis=0)
    projected = np.column_stack((combined @ right, combined @ up))
    low, high = projected.min(axis=0), projected.max(axis=0)
    span = max(float((high - low).max()), 1e-9); padding = span * .01
    return OrthoFrame(right, up, direction, low - padding,
                      (size - 1) / (span + 2 * padding), size)


def project_points(points: np.ndarray, frame: OrthoFrame
                   ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    columns = np.rint((points @ frame.right - frame.low[0]) * frame.scale).astype(np.int64)
    rows = np.rint((points @ frame.up - frame.low[1]) * frame.scale).astype(np.int64)
    return (np.clip(rows, 0, frame.size - 1),
            np.clip(columns, 0, frame.size - 1), points @ frame.direction)


def rasterize_triangles(positions: np.ndarray, faces: np.ndarray, frame: OrthoFrame,
                        *, fragments: bool = False
                        ) -> tuple[np.ndarray, TriangleFragments | None]:
    """逐三角重心插值的正交 z-buffer；无屏幕空间膨胀。"""
    screen = np.column_stack(((positions @ frame.right - frame.low[0]) * frame.scale,
                              (positions @ frame.up - frame.low[1]) * frame.scale))
    vertex_depth = positions @ frame.direction
    depth = np.full(frame.size * frame.size, -np.inf, np.float64)
    pixel_parts: list[np.ndarray] = []; depth_parts: list[np.ndarray] = []
    face_parts: list[np.ndarray] = []; bary_parts: list[np.ndarray] = []
    all_faces = np.asarray(faces, dtype=np.int64)
    for start in range(0, len(all_faces), 8192):
        face_ids = np.arange(start, min(start + 8192, len(all_faces)))
        batch_faces = all_faces[face_ids]; tri = screen[batch_faces]
        low = np.maximum(0, np.ceil(tri.min(axis=1)).astype(np.int64))
        high = np.minimum(frame.size - 1, np.floor(tri.max(axis=1)).astype(np.int64))
        widths = np.maximum(0, high[:, 0] - low[:, 0] + 1)
        heights = np.maximum(0, high[:, 1] - low[:, 1] + 1); counts = widths * heights
        expanded = np.repeat(np.arange(len(batch_faces)), counts)
        if not len(expanded): continue
        offsets = np.arange(int(counts.sum())) - np.repeat(np.cumsum(counts) - counts, counts)
        xx = low[expanded, 0] + offsets % widths[expanded]
        yy = low[expanded, 1] + offsets // widths[expanded]
        selected = tri[expanded]
        denom = ((selected[:, 1, 1] - selected[:, 2, 1]) *
                 (selected[:, 0, 0] - selected[:, 2, 0])
                 + (selected[:, 2, 0] - selected[:, 1, 0]) *
                 (selected[:, 0, 1] - selected[:, 2, 1]))
        valid = np.abs(denom) >= 1e-12
        w0 = np.zeros(len(denom)); w1 = np.zeros(len(denom))
        w0[valid] = ((selected[valid, 1, 1] - selected[valid, 2, 1]) * (xx[valid] - selected[valid, 2, 0])
                     + (selected[valid, 2, 0] - selected[valid, 1, 0]) *
                     (yy[valid] - selected[valid, 2, 1])) / denom[valid]
        w1[valid] = ((selected[valid, 2, 1] - selected[valid, 0, 1]) * (xx[valid] - selected[valid, 2, 0])
                     + (selected[valid, 0, 0] - selected[valid, 2, 0]) *
                     (yy[valid] - selected[valid, 2, 1])) / denom[valid]
        bary = np.column_stack((w0, w1, 1.0 - w0 - w1))
        inside = valid & np.all(bary >= -1e-9, axis=1)
        if not np.any(inside): continue
        rows, columns, weights = yy[inside], xx[inside], bary[inside]
        selected_faces = batch_faces[expanded[inside]]
        selected_ids = face_ids[expanded[inside]]
        pixels = rows * frame.size + columns
        values = np.einsum("ni,ni->n", weights, vertex_depth[selected_faces])
        np.maximum.at(depth, pixels, values)
        if fragments:
            pixel_parts.append(pixels); depth_parts.append(values)
            face_parts.append(selected_ids); bary_parts.append(weights)
    if not fragments:
        return depth.reshape(frame.size, frame.size), None
    if not pixel_parts:
        empty_i = np.empty(0, np.int64); empty_f = np.empty(0, np.float64)
        return depth.reshape(frame.size, frame.size), TriangleFragments(
            empty_i, empty_f, empty_i, np.empty((0, 3), np.float64))
    return depth.reshape(frame.size, frame.size), TriangleFragments(
        np.concatenate(pixel_parts), np.concatenate(depth_parts), np.concatenate(face_parts),
        np.concatenate(bary_parts))


def _view_visibility(points: np.ndarray, normals: np.ndarray, body_positions: np.ndarray,
                     body_faces: np.ndarray, garment_positions: np.ndarray,
                     garment_faces: np.ndarray, direction: np.ndarray,
                     candidates: np.ndarray, tolerance_mu: float, depth_size: int) -> np.ndarray:
    """真正三角 z-buffer 下返回候选纹素中当前视角可见者。"""
    frame = orthographic_frame((body_positions, garment_positions), direction, depth_size)
    body_depth, _ = rasterize_triangles(body_positions, body_faces, frame)
    cloth_depth, _ = rasterize_triangles(garment_positions, garment_faces, frame)
    body_flat, cloth_flat = body_depth.ravel(), cloth_depth.ravel()
    ids = np.flatnonzero(candidates); rows, columns, depths = project_points(points[ids], frame)
    pixels = rows * depth_size + columns
    facing = np.einsum("ij,j->i", normals[ids], direction) > .05
    self_front = body_flat[pixels] <= depths + tolerance_mu
    cloth_clear = cloth_flat[pixels] <= depths + tolerance_mu
    return ids[facing & self_front & cloth_clear]


def _bake_rays_mask(body: Mesh, garment: Mesh, raster: Raster, regions: np.ndarray,
              region_names: dict[int, str], *, m_per_mu: float,
              max_distance_mm: float, opening_margin_mm: float,
              morph_radius_px: int = 4, gutter_px: int = 4) -> MaskBake:
    """在 3D 表面判定覆盖/开口留边，再插值到共 UV 的模板纹素。"""
    if body.normals is None or body.uvs is None:
        raise BakeError("模板缺 NORMAL/TEXCOORD_0")
    if len(regions) != len(body.positions):
        raise BakeError("regions.npy 与模板顶点数不一致")
    max_mu = max_distance_mm / (1000.0 * m_per_mu)
    margin_mu = opening_margin_mm / (1000.0 * m_per_mu)
    cage_mu = 0.002 / m_per_mu
    never_ids = {key for key, value in region_names.items() if value in NEVER_HIDE}
    allowed = ~np.isin(regions, list(never_ids))

    _segments, welded, opening_vertices, opening_stats = _welded_boundary_segments(garment)
    _, inverse = np.unique(np.round(garment.positions, 7), axis=0, return_inverse=True)
    garment_faces = inverse[np.asarray(garment.indices).reshape(-1, 3)]
    opening_geodesic = _opening_geodesic(welded, garment_faces, opening_vertices)
    opening_edges = _selected_opening_edges(garment_faces, opening_vertices)
    opening_vertex_distance = opening_geodesic[inverse]
    vertex_hits, vertex_faces, vertex_bary, vertex_directions = _ray_hits(
        body.positions, body.normals, garment, max_mu, cage_mu)
    vertex_hit_margin = np.full(len(body.positions), np.inf)
    hit = np.flatnonzero(vertex_hits)
    vertex_hit_margin[hit] = _hit_opening_geodesic(
        vertex_faces[hit], vertex_bary[hit], garment_faces, welded, opening_geodesic, opening_edges)
    vertex_layered = np.zeros(len(body.positions), bool)
    near = hit[vertex_hit_margin[hit] < margin_mu]
    vertex_layered[near] = _next_layer(
        np.einsum("ni,nij->nj", vertex_bary[near], garment.positions[
            np.asarray(garment.indices).reshape(-1, 3)[vertex_faces[near]]]),
        vertex_directions[near], garment, max_mu)
    vertex_safe = vertex_hits & (vertex_hit_margin < margin_mu) & ~vertex_layered
    vertex_hits = _weld_boolean(body.positions, vertex_hits, mode="all")
    vertex_safe = _weld_boolean(body.positions, vertex_safe | ~allowed, mode="any")
    vertex_covered = _weld_boolean(body.positions, vertex_hits & ~vertex_safe, mode="any")

    rows, cols = np.nonzero(raster.covered)
    body_faces = np.asarray(body.indices, dtype=np.int64).reshape(-1, 3)
    pixel_faces = body_faces[raster.face_indices[rows, cols]]
    bary = raster.barycentric[rows, cols]
    points = raster.positions[rows, cols]; normals = raster.normals[rows, cols]
    # 每个纹素都做真实 3D 射线；顶点重心插值只负责跨 UV 岛的一致支持。
    texel_hits, texel_faces, texel_bary, texel_directions = _ray_hits(
        points, normals, garment, max_mu, cage_mu)
    texel_hit_margin = np.full(len(points), np.inf); hit = np.flatnonzero(texel_hits)
    texel_hit_margin[hit] = _hit_opening_geodesic(
        texel_faces[hit], texel_bary[hit], garment_faces, welded, opening_geodesic, opening_edges)
    texel_layered = np.zeros(len(points), bool); near = hit[texel_hit_margin[hit] < margin_mu]
    texel_layered[near] = _next_layer(
        np.einsum("ni,nij->nj", texel_bary[near], garment.positions[
            np.asarray(garment.indices).reshape(-1, 3)[texel_faces[near]]]),
        texel_directions[near], garment, max_mu)
    texel_safe = texel_hits & (texel_hit_margin < margin_mu) & ~texel_layered
    # 斜射线在凹陷/切线处可能漏过，但最近衣面仍是可靠覆盖层。只在当前
    # 最近衣面距开口测地带 >= margin 时补证据，绝不侵入真正开口留边。
    garment_normals = garment.normals
    if garment_normals is None:
        garment_normals = np.zeros_like(garment.positions, dtype=np.float64)
        triangles = np.asarray(garment.indices).reshape(-1, 3)
        face_normals = np.cross(garment.positions[triangles[:, 1]] - garment.positions[triangles[:, 0]],
                                garment.positions[triangles[:, 2]] - garment.positions[triangles[:, 0]])
        np.add.at(garment_normals, triangles.ravel(), np.repeat(face_normals, 3, axis=0))
    garment_surface = SurfaceIndex(
        garment.positions, np.asarray(garment.indices).reshape(-1, 3), garment_normals)
    _, fallback_bary, fallback_faces, fallback_distance = garment_surface.query(points)
    fallback_margin = _hit_opening_geodesic(
        fallback_faces, fallback_bary, garment_faces, welded, opening_geodesic, opening_edges)
    close_fit_names = {"torsoUpper", "torsoLower", "hips", "upperArmL", "upperArmR",
                       "forearmL", "forearmR"}
    close_fit_ids = {key for key, value in region_names.items() if value in close_fit_names}
    fallback_hits = ((fallback_distance <= max_mu) & (fallback_margin >= margin_mu)
                     & np.isin(raster.regions[rows, cols], list(close_fit_ids)))
    topology_score = np.einsum("ni,ni->n", bary, vertex_covered[pixel_faces])
    safe_score = np.einsum("ni,ni->n", bary, vertex_safe[pixel_faces])
    forbidden = np.isin(raster.regions[rows, cols], list(never_ids))
    raw = np.zeros_like(raster.covered)
    raw[rows, cols] = (texel_hits | fallback_hits) & ~texel_safe & ~forbidden
    opening_safe = np.zeros_like(raw); opening_safe[rows, cols] = texel_safe | forbidden

    # 先填衣服轮廓内被隐藏纹素包围的小岛，再闭后开；最后重施 3D 硬禁区。
    structure = _disk(morph_radius_px)
    filled = binary_fill_holes(raw); islands, count = label(filled & ~raw)
    small = np.zeros_like(raw); filled_islands = 0
    for component in range(1, count + 1):
        member = islands == component
        if int(member.sum()) < 400:
            small |= member; filled_islands += 1
    seeded = raw | small
    # 4 px 闭运算也填不满高分辨率躯干的细碎漏射；只填完全被遮罩围住、
    # 且不接触真正开口安全带的皮肤岛，开口/neverHide 仍由硬禁区保护。
    coverable = np.zeros_like(raw); coverable[rows, cols] = (texel_hits | fallback_hits
                                                             | ((topology_score > 0.0) & ~forbidden))
    background = coverable & ~seeded & ~opening_safe
    components, count = label(background); enclosed = np.zeros_like(raw); enclosed_count = 0
    for component in range(1, count + 1):
        member = components == component
        # background 每个纹素都已有当前衣面命中或同一 3D 面顶点覆盖证据。
        # 即使它在 UV 中碰到岛边/开口安全带，也应只保留 opening_safe 本身，
        # 不能让细缝把整块胸腹漏遮区连通出去。
        enclosed |= member; enclosed_count += 1
    clean = binary_opening(binary_closing(seeded | enclosed, structure=structure), structure=structure)
    clean &= raster.covered & ~opening_safe
    # 开运算本身可能重新打出小孔；以最终结果再执行一次 <400 px² 岛填充。
    post_holes, post_count = label(binary_fill_holes(clean) & ~clean & ~opening_safe)
    post_filled = 0
    for component in range(1, post_count + 1):
        member = post_holes == component
        if int(member.sum()) < 400 and np.all(raster.covered[member]):
            clean |= member; post_filled += 1
    clean[rows[forbidden], cols[forbidden]] = False
    bind_patch, bind_inside = _bind_penetration_patch(
        body, garment, regions, never_ids, raster.covered.shape[0],
        opening_vertex_distance, margin_mu)
    forbidden_pixels = np.isin(raster.regions, list(never_ids))
    bind_opening_guard = np.zeros_like(raw)
    bind_opening_guard[rows, cols] = texel_safe
    clean |= (bind_patch & raster.covered & ~forbidden_pixels
              & ~opening_safe & ~bind_opening_guard)
    seam_pixels = _synchronize_uv_seams(clean, opening_safe | forbidden_pixels, body)
    padded = _gutter(clean, raster.covered, gutter_px)
    seam_pixels += _synchronize_uv_seams(padded, opening_safe | forbidden_pixels, body)
    allowed_texels = raster.covered & ~np.isin(raster.regions, list(never_ids))
    stats = {
        **opening_stats, "bodyVertices": int(len(body.positions)),
        "vertexRayHits": int(vertex_hits.sum()),
        "vertexOpeningSafe": int(vertex_safe.sum()),
        "vertexHidden": int(vertex_covered.sum()),
        "rasterizedTexels": int(raster.covered.sum()),
        "texelRayHits": int(texel_hits.sum()),
        "texelNearestFallbackHits": int(np.count_nonzero(fallback_hits & ~texel_hits)),
        "texelOpeningSafe": int(texel_safe.sum()),
        "interpolatedOpeningSupport": int(np.count_nonzero(safe_score > 0.0)),
        "rawHiddenTexels": int(raw.sum()), "hiddenTexels": int(clean.sum()),
        "filledSmallIslands": filled_islands,
        "filledPostMorphIslands": post_filled,
        "filledEnclosedIslands": enclosed_count,
        "bindPenetratingVertices": bind_inside,
        "bindPatchTexels": int(np.count_nonzero(bind_patch & raster.covered)),
        "synchronizedSeamPixels": seam_pixels,
        "gutterTexels": int(np.count_nonzero(padded & ~raster.covered)),
        "coveredRatio": float(clean.sum() / allowed_texels.sum()) if allowed_texels.any() else 0.0,
        "morphology": {"order": "fill-small-close-open", "radiusPx": morph_radius_px,
                       "islandAreaLimitPx": 400},
        "gutterPx": gutter_px,
    }
    return MaskBake((padded.astype(np.uint8) * 255), vertex_covered, raw, opening_safe, stats)


def _bind_pose(body: Mesh, garment: Mesh) -> PosedMeshes:
    faces = np.asarray(body.indices, dtype=np.int64).reshape(-1, 3)
    garment_faces = np.asarray(garment.indices, dtype=np.int64).reshape(-1, 3)
    normals = (np.asarray(body.normals, dtype=np.float64) if body.normals is not None
               else _vertex_normals(body.positions, faces))
    garment_normals = (np.asarray(garment.normals, dtype=np.float64)
                       if garment.normals is not None
                       else _vertex_normals(garment.positions, garment_faces))
    return PosedMeshes("bind", np.asarray(body.positions, dtype=np.float64), normals,
                       np.asarray(garment.positions, dtype=np.float64), garment_normals)


def _lbs_normals(normals: np.ndarray, joints: np.ndarray, weights: np.ndarray,
                 bone_world: np.ndarray, inverse_bind: np.ndarray) -> np.ndarray:
    """用与位置 LBS 同一骨矩阵的逆转置变换并归一化逐顶点法线。"""
    matrices = np.asarray(bone_world, dtype=np.float64) @ np.asarray(
        inverse_bind, dtype=np.float64)
    normal_matrices = np.linalg.inv(matrices[:, :3, :3]).transpose(0, 2, 1)
    transformed = np.einsum(
        "nkij,nj->nki", normal_matrices[np.asarray(joints, dtype=np.int64)],
        np.asarray(normals, dtype=np.float64))
    result = np.einsum("nk,nki->ni", np.asarray(weights, dtype=np.float64), transformed)
    return result / np.maximum(np.linalg.norm(result, axis=1)[:, None], 1e-12)


def animation_poses(body_glb: GLB, garment_glb: GLB, body: Mesh, garment: Mesh,
                    frames_per_clip: int = 6, arm_abduction: float = 0.0) -> list[PosedMeshes]:
    """按 validate 相同的采样与 LBS 生成 bind + 三段动作姿态（含衣物声明的手臂外展）。"""
    if frames_per_clip < 6:
        raise ValueError("idle/walk/run 每段至少采样 6 帧")
    if body.joints is None or body.weights is None or garment.joints is None or garment.weights is None:
        raise BakeError("visibility 模式要求身体与衣物都有 JOINTS_0/WEIGHTS_0")
    from validate import _world_matrices
    body_skin, garment_skin = body_glb.skin(), garment_glb.skin()
    animations = {str(item.get("name", "")).lower(): item
                  for item in body_glb.json.get("animations", [])}
    poses = [_bind_pose(body, garment)]
    faces = np.asarray(body.indices).reshape(-1, 3)
    garment_faces = np.asarray(garment.indices).reshape(-1, 3)
    body_normals = (body.normals if body.normals is not None
                    else _vertex_normals(body.positions, faces))
    garment_normals = (garment.normals if garment.normals is not None
                       else _vertex_normals(garment.positions, garment_faces))
    for clip in ("idle", "walk", "run"):
        animation = next((value for name, value in animations.items() if clip in name), None)
        if animation is None:
            raise BakeError(f"正本缺 {clip} 动画")
        ends = [float(np.asarray(body_glb.accessor(s["input"])).max(initial=0))
                for s in animation.get("samplers", [])]
        duration = max(ends, default=0.0)
        for frame, sample_time in enumerate(np.linspace(0.0, duration, frames_per_clip, endpoint=False)):
            world = _world_matrices(body_glb, animation, float(sample_time), arm_abduction)
            body_world = world[np.asarray(body_skin.joints)]
            garment_world = world[np.asarray(garment_skin.joints)]
            body_positions = lbs(body.positions, body.joints, body.weights, body_world,
                                 body_skin.inverse_bind_matrices)
            garment_positions = lbs(garment.positions, garment.joints, garment.weights, garment_world,
                                    garment_skin.inverse_bind_matrices)
            poses.append(PosedMeshes(f"{clip}:{frame}", body_positions,
                                     _lbs_normals(body_normals, body.joints, body.weights,
                                                  body_world, body_skin.inverse_bind_matrices),
                                     garment_positions,
                                     _lbs_normals(garment_normals, garment.joints, garment.weights,
                                                  garment_world, garment_skin.inverse_bind_matrices)))
    return poses


def _hole_safety_poses(body_glb: GLB, garment_glb: GLB, body: Mesh, garment: Mesh,
                       arm_abduction: float = 0.0) -> list[PosedMeshes]:
    """返回 validate 使用的全部 24 帧动画姿态（不含 bind）。"""
    return [pose for pose in animation_poses(body_glb, garment_glb, body, garment, 24, arm_abduction)
            if pose.label != "bind"]


def _inside_garment(points: np.ndarray, garment_positions: np.ndarray,
                    garment_faces: np.ndarray, garment_normals: np.ndarray) -> np.ndarray:
    """按最近衣面外法线返回点是否在衣物里侧（带符号距离 < 0）。"""
    nearest, bary, face_ids, _ = SurfaceIndex(
        garment_positions, garment_faces, garment_normals).query(points)
    interpolated = np.einsum(
        "ni,nij->nj", bary, garment_normals[garment_faces[face_ids]])
    interpolated /= np.maximum(np.linalg.norm(interpolated, axis=1)[:, None], 1e-12)
    signed = np.einsum("ij,ij->i", points - nearest, interpolated)
    return signed < 0.0


def _animation_backfill(poses: Sequence[PosedMeshes], directions: np.ndarray,
                        bind_raw: np.ndarray, backfilled: np.ndarray, rows: np.ndarray,
                        columns: np.ndarray, bary: np.ndarray, pixel_faces: np.ndarray,
                        body_faces: np.ndarray, garment_faces: np.ndarray,
                        tolerance_mu: float, depth_size: int
                        ) -> tuple[int, int, int]:
    """只回补动画中直接可见且仍位于衣物里侧的 bind 隐藏纹素。"""
    visible_count = outside_count = evaluated = 0
    for pose in poses:
        points = np.einsum("ni,nij->nj", bary, pose.body_positions[pixel_faces])
        normals = np.einsum("ni,nij->nj", bary, pose.body_normals[pixel_faces])
        normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-12)
        local_candidates = bind_raw[rows, columns] & ~backfilled[rows, columns]
        visible_in_pose = np.zeros(len(rows), dtype=bool)
        for direction in directions:
            found = _view_visibility(points, normals, pose.body_positions, body_faces,
                                     pose.garment_positions, garment_faces, direction,
                                     local_candidates, tolerance_mu, depth_size)
            visible_in_pose[found] = True; local_candidates[found] = False; evaluated += 1
        visible_ids = np.flatnonzero(visible_in_pose)
        if len(visible_ids):
            inside = _inside_garment(points[visible_ids], pose.garment_positions,
                                     garment_faces, pose.garment_normals)
            inside_ids = visible_ids[inside]
            backfilled[rows[inside_ids], columns[inside_ids]] = True
            visible_count += int(len(visible_ids)); outside_count += int(np.count_nonzero(~inside))
    return visible_count, outside_count, evaluated


def _bake_visibility_mask(body: Mesh, garment: Mesh, raster: Raster, regions: np.ndarray,
                          region_names: dict[int, str], *, m_per_mu: float,
                          poses: Sequence[PosedMeshes] | None = None, view_count: int = 128,
                          depth_size: int = 256, morph_radius_px: int = 2,
                          gutter_px: int = 4, safety_poses: Sequence[PosedMeshes] = ()) -> MaskBake:
    """bind 决定隐藏；动画只回补可见且仍在衣物里侧的开口露肤。"""
    if body.uvs is None:
        raise BakeError("模板缺 TEXCOORD_0")
    if view_count < 128:
        raise ValueError("visibility 模式至少需要 128 个视角")
    if depth_size < 64:
        raise ValueError("visibility 深度图边长至少为 64")
    never_ids = {key for key, value in region_names.items() if value in NEVER_HIDE}
    forbidden = np.isin(raster.regions, list(never_ids))
    candidates = raster.covered & ~forbidden
    preserved = np.zeros_like(raster.covered, dtype=bool)
    rows, columns = np.nonzero(raster.covered)
    body_faces = np.asarray(body.indices, dtype=np.int64).reshape(-1, 3)
    pixel_faces = body_faces[raster.face_indices[rows, columns]]
    bary = raster.barycentric[rows, columns]
    garment_faces = np.asarray(garment.indices, dtype=np.int64).reshape(-1, 3)
    directions = fibonacci_directions(view_count)
    tolerance_mu = .002 / m_per_mu
    configured = list(poses) if poses is not None else [_bind_pose(body, garment)]
    bind_poses = [pose for pose in configured if pose.label == "bind"]
    if len(bind_poses) != 1:
        raise BakeError("visibility 模式要求且只允许一个 bind 姿态")
    bind = bind_poses[0]
    points = np.einsum("ni,nij->nj", bary, bind.body_positions[pixel_faces])
    normals = np.einsum("ni,nij->nj", bary, bind.body_normals[pixel_faces])
    normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-12)
    local_candidates = candidates[rows, columns].copy()
    bind_evaluated = 0
    for direction in directions:
        found = _view_visibility(points, normals, bind.body_positions, body_faces,
                                 bind.garment_positions, garment_faces, direction,
                                 local_candidates, tolerance_mu, depth_size)
        preserved[rows[found], columns[found]] = True
        local_candidates[found] = False; bind_evaluated += 1
    bind_raw = candidates & ~preserved

    backfilled = np.zeros_like(raster.covered, dtype=bool)
    animation_visible_texels, animation_outside_texels, animation_evaluated = _animation_backfill(
        [pose for pose in configured if pose.label != "bind"], directions, bind_raw, backfilled,
        rows, columns, bary, pixel_faces, body_faces, garment_faces, tolerance_mu, depth_size)
    safety_visible, safety_outside, safety_evaluated = _animation_backfill(
        safety_poses, HOLE_CHECK_VIEWS, bind_raw, backfilled, rows, columns, bary, pixel_faces,
        body_faces, garment_faces, tolerance_mu, 192)
    animation_visible_texels += safety_visible; animation_outside_texels += safety_outside
    preserved |= backfilled
    raw = candidates & ~preserved
    clean = binary_opening(raw, structure=_disk(morph_radius_px))
    # 开运算后的孔只在原始证据同样“从未可见”时才允许回填；绝不把可见纹素改隐藏。
    holes, count = label(binary_fill_holes(clean) & ~clean & raw)
    filled = 0
    for component in range(1, count + 1):
        member = holes == component
        if int(member.sum()) < 400:
            clean |= member; filled += 1
    protected = preserved | forbidden
    seam_pixels = _synchronize_uv_seams(clean, protected, body)
    clean &= raw
    padded = _gutter(clean, raster.covered, gutter_px)
    seam_pixels += _synchronize_uv_seams(padded, protected, body)
    vertex_hidden = _sample_scalar(clean.astype(np.float32), body.uvs) >= .5
    vertex_hidden = _weld_boolean(body.positions, vertex_hidden, mode="all")
    allowed_texels = raster.covered & ~forbidden
    stats = {
        "mode": "visibility", "views": view_count, "poses": len(configured),
        "viewElevationDeg": list(VIEW_ELEVATION_DEG),
        "poseLabels": [pose.label for pose in configured],
        "bindViewPosePairs": bind_evaluated,
        "animationViewPosePairs": animation_evaluated, "depthMapSize": depth_size,
        "holeSafetyPoses": len(safety_poses), "holeSafetyViewPosePairs": safety_evaluated,
        "depthToleranceMm": 2.0, "rasterizedTexels": int(raster.covered.sum()),
        "bindVisibleTexels": int(np.count_nonzero(preserved & ~backfilled & candidates)),
        "bindHiddenTexels": int(bind_raw.sum()),
        "bindCoveredRatio": float(bind_raw.sum() / allowed_texels.sum())
        if allowed_texels.any() else 0.0,
        "animationVisibleHiddenTexels": animation_visible_texels,
        "animationOutsideVisibleTexels": animation_outside_texels,
        "animationBackfilledTexels": int(backfilled.sum()),
        "rawHiddenTexels": int(raw.sum()), "hiddenTexels": int(clean.sum()),
        "filledSmallIslands": filled, "synchronizedSeamPixels": seam_pixels,
        "gutterTexels": int(np.count_nonzero(padded & ~raster.covered)),
        "coveredRatio": float(clean.sum() / allowed_texels.sum()) if allowed_texels.any() else 0.0,
        "morphology": {"order": "open-fill-invisible-small-islands",
                       "radiusPx": morph_radius_px, "islandAreaLimitPx": 400},
        "gutterPx": gutter_px,
    }
    return MaskBake(padded.astype(np.uint8) * 255, vertex_hidden, raw, protected, stats)


def bake_mask(body: Mesh, garment: Mesh, raster: Raster, regions: np.ndarray,
              region_names: dict[int, str], *, m_per_mu: float,
              max_distance_mm: float = 80.0, opening_margin_mm: float = 15.0,
              morph_radius_px: int = 4, gutter_px: int = 4, mode: str = "visibility",
              poses: Sequence[PosedMeshes] | None = None, view_count: int = 128,
              depth_size: int = 256, safety_poses: Sequence[PosedMeshes] = ()) -> MaskBake:
    if mode == "rays":
        return _bake_rays_mask(body, garment, raster, regions, region_names, m_per_mu=m_per_mu,
                               max_distance_mm=max_distance_mm, opening_margin_mm=opening_margin_mm,
                               morph_radius_px=morph_radius_px, gutter_px=gutter_px)
    if mode != "visibility":
        raise ValueError(f"未知模式：{mode}")
    return _bake_visibility_mask(body, garment, raster, regions, region_names,
                                 m_per_mu=m_per_mu, poses=poses, view_count=view_count,
                                 depth_size=depth_size, morph_radius_px=min(morph_radius_px, 2),
                                 gutter_px=gutter_px, safety_poses=safety_poses)


def _render_view(mesh: Mesh, texture: Image.Image, mask: np.ndarray, *, back: bool,
                 width: int = 480, height: int = 720) -> Image.Image:
    positions = np.asarray(mesh.positions, dtype=np.float64); faces = mesh.indices.reshape(-1, 3)
    low, high = positions[:, :2].min(0), positions[:, :2].max(0)
    scale = min((width - 24) / max(high[0] - low[0], 1e-9),
                (height - 24) / max(high[1] - low[1], 1e-9))
    center = (low + high) / 2; screen = np.empty((len(positions), 2), dtype=np.float64)
    screen[:, 0] = (positions[:, 0] - center[0]) * scale + width / 2
    if back:
        screen[:, 0] = width - screen[:, 0]
    screen[:, 1] = height / 2 - (positions[:, 1] - center[1]) * scale
    depth = positions[:, 2] * (-1 if back else 1)
    zbuffer = np.full((height, width), -np.inf, np.float32)
    output = np.full((height, width, 3), [226, 220, 205], np.uint8)
    tex, mask_pixels = np.asarray(texture.convert("RGB")), np.asarray(mask)
    for face in faces[np.argsort(depth[faces].mean(axis=1))]:
        tri = screen[face]; x0 = max(0, math.ceil(tri[:, 0].min())); x1 = min(width - 1, math.floor(tri[:, 0].max()))
        y0 = max(0, math.ceil(tri[:, 1].min())); y1 = min(height - 1, math.floor(tri[:, 1].max()))
        if x1 < x0 or y1 < y0:
            continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        denom = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0])
                 + (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(denom) < 1e-10:
            continue
        w0 = ((tri[1, 1] - tri[2, 1]) * (xx - tri[2, 0]) + (tri[2, 0] - tri[1, 0]) * (yy - tri[2, 1])) / denom
        w1 = ((tri[2, 1] - tri[0, 1]) * (xx - tri[2, 0]) + (tri[0, 0] - tri[2, 0]) * (yy - tri[2, 1])) / denom
        bary = np.stack((w0, w1, 1 - w0 - w1), axis=-1); inside = np.all(bary >= -1e-7, axis=2)
        rows, columns, weights = yy[inside], xx[inside], bary[inside]
        values = weights @ depth[face]; visible = values > zbuffer[rows, columns]
        rows, columns, weights, values = rows[visible], columns[visible], weights[visible], values[visible]
        if not len(rows):
            continue
        uv = weights @ mesh.uvs[face]; colors = bilinear_sample(tex, uv)
        hidden = _sample_scalar(mask_pixels, uv) >= 127.5
        colors[hidden] = colors[hidden] * 0.35 + np.array([210, 45, 40]) * 0.65
        output[rows, columns] = np.clip(colors, 0, 255).astype(np.uint8); zbuffer[rows, columns] = values
    return Image.fromarray(output, "RGB")


def _overlay_garment_outline(image: Image.Image, body: Mesh, garment: Mesh, *, back: bool) -> None:
    """以投影占用边缘叠加衣物轮廓，供黑洞/漏遮目视质检。"""
    width, height = image.size; low, high = body.positions[:, :2].min(0), body.positions[:, :2].max(0)
    scale = min((width - 24) / max(high[0] - low[0], 1e-9),
                (height - 24) / max(high[1] - low[1], 1e-9)); center = (low + high) / 2
    screen = np.empty((len(garment.positions), 2), dtype=np.float64)
    screen[:, 0] = (garment.positions[:, 0] - center[0]) * scale + width / 2
    if back:
        screen[:, 0] = width - screen[:, 0]
    screen[:, 1] = height / 2 - (garment.positions[:, 1] - center[1]) * scale
    silhouette = np.zeros((height, width), bool)
    for face in garment.indices.reshape(-1, 3):
        tri = screen[face]; x0 = max(0, math.ceil(tri[:, 0].min())); x1 = min(width - 1, math.floor(tri[:, 0].max()))
        y0 = max(0, math.ceil(tri[:, 1].min())); y1 = min(height - 1, math.floor(tri[:, 1].max()))
        if x1 < x0 or y1 < y0:
            continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        denom = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0])
                 + (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(denom) < 1e-10:
            continue
        w0 = ((tri[1, 1] - tri[2, 1]) * (xx - tri[2, 0]) + (tri[2, 0] - tri[1, 0]) * (yy - tri[2, 1])) / denom
        w1 = ((tri[2, 1] - tri[0, 1]) * (xx - tri[2, 0]) + (tri[0, 0] - tri[2, 0]) * (yy - tri[2, 1])) / denom
        silhouette[yy, xx] |= (w0 >= -1e-7) & (w1 >= -1e-7) & (w0 + w1 <= 1 + 1e-7)
    outline = binary_dilation(silhouette, structure=_disk(2)) ^ binary_erosion(silhouette, structure=_disk(2))
    pixels = np.asarray(image).copy(); pixels[outline] = [32, 35, 38]; image.paste(Image.fromarray(pixels, "RGB"))


def _save_preview(path: Path, body_glb: GLB, body: Mesh, garment: Mesh, mask: np.ndarray) -> None:
    front = _render_view(body, _base_texture(body_glb), mask, back=False)
    back = _render_view(body, _base_texture(body_glb), mask, back=True)
    _overlay_garment_outline(front, body, garment, back=False)
    _overlay_garment_outline(back, body, garment, back=True)
    canvas = Image.new("RGB", (front.width * 2, front.height + 32), (226, 220, 205))
    canvas.paste(front, (0, 32)); canvas.paste(back, (front.width, 32))
    canvas.save(path, optimize=True)


def bake(body_path: Path, skeleton_path: Path, garment_path: Path, fit_path: Path,
         out_dir: Path, *, size: int = 1024, max_distance_mm: float = 80.0,
         opening_margin_mm: float = 15.0, mode: str = "visibility",
         view_count: int = 128, frames_per_clip: int = 6,
         depth_size: int = 256) -> dict[str, Any]:
    started = time.perf_counter(); out_dir.mkdir(parents=True, exist_ok=True)
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    fit = json.loads(fit_path.read_text(encoding="utf-8"))
    if skeleton.get("schema") != "tianshu-dressup-skeleton.v1":
        raise BakeError("--skeleton schema 不受支持")
    if fit.get("schema") != "tianshu-dressup-fit.v1":
        raise BakeError("--fit schema 不受支持")
    from validate import arm_abduction_deg
    abduction = arm_abduction_deg(fit)
    body_glb, garment_glb = load_glb(body_path), load_glb(garment_path)
    body, garment = body_glb.mesh(), garment_glb.mesh()
    regions = np.load(skeleton_path.with_name(skeleton["regions"]["file"]), allow_pickle=False)
    names = {int(value): str(name) for name, value in skeleton["regions"]["ids"].items()}
    raster = rasterize_uv(body, regions, size)
    poses = (animation_poses(body_glb, garment_glb, body, garment, frames_per_clip, abduction)
             if mode == "visibility" else None)
    safety_poses = (_hole_safety_poses(body_glb, garment_glb, body, garment, abduction)
                    if mode == "visibility" and frames_per_clip < 24 else ())
    result = bake_mask(body, garment, raster, regions, names, m_per_mu=float(skeleton["mPerMu"]),
                       max_distance_mm=max_distance_mm, opening_margin_mm=opening_margin_mm,
                       mode=mode, poses=poses, view_count=view_count, depth_size=depth_size,
                       safety_poses=safety_poses)
    template = str(fit.get("template", "")); suffix = "" if template == "tpl_f_medium" else f".{template}"
    mask_name = f"hidemask{suffix}.png"; preview_name = f"hidemask_preview{suffix}.png"
    Image.fromarray(result.mask, "L").save(out_dir / mask_name, optimize=True)
    _save_preview(out_dir / preview_name, body_glb, body, garment, result.mask)
    fit["hideMask"] = {"file": mask_name, "size": size,
                       "coveredRatio": result.stats["coveredRatio"],
                       "bindCoveredRatio": result.stats.get("bindCoveredRatio"),
                       "animationBackfilledTexels": result.stats.get("animationBackfilledTexels"),
                       "holeSafetyPoses": result.stats.get("holeSafetyPoses"),
                       "holeSafetyViews": len(HOLE_CHECK_VIEWS) if mode == "visibility" else None,
                       "depthMapSize": depth_size if mode == "visibility" else None,
                       "mode": mode, "views": view_count if mode == "visibility" else 9,
                       "bindPoses": 1 if mode == "visibility" else None,
                       "animationPoses": len(poses) - 1 if poses is not None else None,
                       "viewElevationDeg": list(VIEW_ELEVATION_DEG) if mode == "visibility" else None,
                       "depthToleranceMm": 2.0 if mode == "visibility" else None,
                       "armAbductionDeg": abduction if mode == "visibility" and abduction else None,
                       "marginMm": opening_margin_mm if mode == "rays" else None,
                       "maxDistanceMm": max_distance_mm if mode == "rays" else None}
    fit["hideMask"] = {key: value for key, value in fit["hideMask"].items() if value is not None}
    fit_path.write_text(json.dumps(fit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elapsed = time.perf_counter() - started
    return {"ok": True, "template": template, "file": mask_name, "mode": mode,
            "preview": preview_name, **result.stats,
            "elapsedSec": elapsed, "peakMemoryMiB": _memory_mib()}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--body", required=True, type=Path, help="模板 body.glb")
    parser.add_argument("--skeleton", required=True, type=Path, help="模板 skeleton.json")
    parser.add_argument("--garment", required=True, type=Path, help="贴合后的衣物 GLB")
    parser.add_argument("--fit", required=True, type=Path, help="对应 fit.json（会原位补 hideMask）")
    parser.add_argument("--out", required=True, type=Path, help="遮罩输出目录")
    parser.add_argument("--size", type=int, default=1024, help="方图边长，默认 1024")
    parser.add_argument("--max-distance-mm", type=float, default=80.0)
    parser.add_argument("--opening-margin-mm", type=float, default=15.0)
    parser.add_argument("--mode", choices=("visibility", "rays"), default="visibility")
    parser.add_argument("--views", type=int, default=128,
                        help="visibility 游戏相机球带视角数（>=128，仰角 -15~80 度）")
    parser.add_argument("--frames-per-clip", type=int, default=6, help="每段动画采样帧数（>=6）")
    parser.add_argument("--depth-size", type=int, default=256, help="正交软深度图边长（>=64）")
    parser.add_argument("--json", action="store_true")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if (args.size < 16 or args.max_distance_mm <= 0 or args.opening_margin_mm < 0
            or (args.mode == "visibility" and
                (args.views < 128 or args.frames_per_clip < 6 or args.depth_size < 64))):
        print("错误：尺寸/距离参数非法；visibility 要求 views>=128、frames>=6、depth-size>=64", file=sys.stderr); return 2
    try:
        for path in (args.body, args.skeleton, args.garment, args.fit):
            if not path.is_file():
                raise BakeError(f"文件不存在：{path}")
        result = bake(args.body, args.skeleton, args.garment, args.fit, args.out, size=args.size,
                      max_distance_mm=args.max_distance_mm, opening_margin_mm=args.opening_margin_mm,
                      mode=args.mode, view_count=args.views, frames_per_clip=args.frames_per_clip,
                      depth_size=args.depth_size)
        print(json.dumps(result, ensure_ascii=False) if args.json else
              f"烘焙完成：{result['file']}，覆盖 {result['coveredRatio']:.2%}，{result['elapsedSec']:.2f}s")
        return 0
    except (OSError, ValueError, KeyError, IndexError, RuntimeError, json.JSONDecodeError) as exc:
        failure = {"ok": False, "error": str(exc)}
        print(json.dumps(failure, ensure_ascii=False) if args.json else f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
