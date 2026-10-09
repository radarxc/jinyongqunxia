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
except ImportError:
    from bake_texture_layer import (_ray_scene, _rays_in_aabb, Raster, RayHits,
                                    bilinear_sample, rasterize_uv, raycast_outermost)
    from glb_io import GLB, Mesh, load_glb
    from fit_garment import SurfaceIndex

NEVER_HIDE = frozenset({"head", "neck", "handL", "handR", "footL", "footR"})


class BakeError(ValueError):
    """输入资产不满足 hide mask 烘焙契约。"""


@dataclass(frozen=True)
class MaskBake:
    mask: np.ndarray
    covered: np.ndarray
    raw: np.ndarray
    opening_safe: np.ndarray
    stats: dict[str, Any]


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


def bake_mask(body: Mesh, garment: Mesh, raster: Raster, regions: np.ndarray,
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
         opening_margin_mm: float = 15.0) -> dict[str, Any]:
    started = time.perf_counter(); out_dir.mkdir(parents=True, exist_ok=True)
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    fit = json.loads(fit_path.read_text(encoding="utf-8"))
    if skeleton.get("schema") != "tianshu-dressup-skeleton.v1":
        raise BakeError("--skeleton schema 不受支持")
    if fit.get("schema") != "tianshu-dressup-fit.v1":
        raise BakeError("--fit schema 不受支持")
    body_glb, garment_glb = load_glb(body_path), load_glb(garment_path)
    body, garment = body_glb.mesh(), garment_glb.mesh()
    regions = np.load(skeleton_path.with_name(skeleton["regions"]["file"]), allow_pickle=False)
    names = {int(value): str(name) for name, value in skeleton["regions"]["ids"].items()}
    raster = rasterize_uv(body, regions, size)
    result = bake_mask(body, garment, raster, regions, names, m_per_mu=float(skeleton["mPerMu"]),
                       max_distance_mm=max_distance_mm, opening_margin_mm=opening_margin_mm)
    template = str(fit.get("template", "")); suffix = "" if template == "tpl_f_medium" else f".{template}"
    mask_name = f"hidemask{suffix}.png"; preview_name = f"hidemask_preview{suffix}.png"
    Image.fromarray(result.mask, "L").save(out_dir / mask_name, optimize=True)
    _save_preview(out_dir / preview_name, body_glb, body, garment, result.mask)
    fit["hideMask"] = {"file": mask_name, "size": size,
                       "coveredRatio": result.stats["coveredRatio"],
                       "marginMm": opening_margin_mm,
                       "maxDistanceMm": max_distance_mm}
    fit_path.write_text(json.dumps(fit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elapsed = time.perf_counter() - started
    return {"ok": True, "template": template, "file": mask_name,
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
    parser.add_argument("--json", action="store_true")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.size < 16 or args.max_distance_mm <= 0 or args.opening_margin_mm < 0:
        print("错误：--size >= 16、--max-distance-mm > 0、--opening-margin-mm >= 0", file=sys.stderr); return 2
    try:
        for path in (args.body, args.skeleton, args.garment, args.fit):
            if not path.is_file():
                raise BakeError(f"文件不存在：{path}")
        result = bake(args.body, args.skeleton, args.garment, args.fit, args.out, size=args.size,
                      max_distance_mm=args.max_distance_mm, opening_margin_mm=args.opening_margin_mm)
        print(json.dumps(result, ensure_ascii=False) if args.json else
              f"烘焙完成：{result['file']}，覆盖 {result['coveredRatio']:.2%}，{result['elapsedSec']:.2f}s")
        return 0
    except (OSError, ValueError, KeyError, IndexError, RuntimeError, json.JSONDecodeError) as exc:
        failure = {"ok": False, "error": str(exc)}
        print(json.dumps(failure, ensure_ascii=False) if args.json else f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
