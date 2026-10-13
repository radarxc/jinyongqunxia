#!/usr/bin/env python3
"""把整身衣装 GLB 的 baseColor 烘焙为模板 UV 上的非预乘 RGBA 贴图层。

坐标与几何距离使用模型单位（mu）；仅在 JSON/CLI 边界换算毫米。glTF UV
按左上原点读取，产出的 PNG 供 three.js 以 ``flipY=false``、sRGB 色彩空间使用。
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from hashlib import sha256
import io
import json
import math
from pathlib import Path
import resource
import subprocess
import sys
import time
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy.ndimage import binary_closing, distance_transform_edt
from scipy.spatial import cKDTree

try:
    from .common import closest_point_on_triangle, lbs, nearest_triangle, umeyama
    from .glb_io import GLB, Mesh, load_glb
except ImportError:
    from common import closest_point_on_triangle, lbs, nearest_triangle, umeyama
    from glb_io import GLB, Mesh, load_glb

SCHEMA = "tianshu-dressup-layer.v1"
FIT_JOINTS = ("Hips", "Spine", "Spine1", "Spine2", "Neck",
              "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg")
ALLOWED_REGIONS = frozenset({"torsoUpper", "torsoLower", "hips",
                             "upperArmL", "upperArmR", "forearmL",
                             "forearmR", "thighL", "thighR"})
TEMPLATE_IDS = ("tpl_f_medium", "tpl_f_small", "tpl_f_tall")


class BakeError(ValueError):
    """输入或烘焙契约不成立。"""


@dataclass(frozen=True)
class Raster:
    covered: np.ndarray
    positions: np.ndarray
    normals: np.ndarray
    regions: np.ndarray
    face_indices: np.ndarray
    barycentric: np.ndarray


@dataclass(frozen=True)
class Classifier:
    cloth: np.ndarray
    skin: np.ndarray
    midpoint: float
    scale: float
    cloth_samples: int
    skin_samples: int


@dataclass(frozen=True)
class RayHits:
    faces: np.ndarray
    bary: np.ndarray
    distance: np.ndarray
    hit: np.ndarray
    grazing: np.ndarray


@dataclass(frozen=True)
class VertexBake:
    raw_scores: np.ndarray
    smooth_scores: np.ndarray
    stats: dict[str, Any]


@dataclass
class _AabbNode:
    low: np.ndarray
    high: np.ndarray
    left: int = -1
    right: int = -1
    faces: np.ndarray | None = None


@dataclass(frozen=True)
class _RayScene:
    face_ids: np.ndarray
    triangles: np.ndarray
    face_normals: np.ndarray
    nodes: list[_AabbNode]


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def file_sha(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _display_path(path: Path) -> str:
    try:
        return path.resolve().relative_to(_repo_root()).as_posix()
    except ValueError:
        return path.as_posix()


def _asset_bytes(path: Path) -> bytes:
    """读普通文件；sparse checkout 缺文件时只读当前 HEAD 的已跟踪 blob。"""
    if path.exists():
        return path.read_bytes()
    try:
        rel = path.resolve().relative_to(_repo_root()).as_posix()
    except ValueError as exc:
        raise BakeError(f"输入不存在：{path}") from exc
    result = subprocess.run(["git", "show", f"HEAD:{rel}"], cwd=_repo_root(),
                            check=False, capture_output=True)
    if result.returncode or not result.stdout:
        raise BakeError(f"输入不存在且不是 HEAD 中的已跟踪文件：{path}")
    return result.stdout


def open_image(path: Path) -> Image.Image:
    with Image.open(io.BytesIO(_asset_bytes(path))) as image:
        image.load()
        return image.convert("RGB")


def _base_texture(glb: GLB) -> Image.Image:
    primitive = glb.json["meshes"][0]["primitives"][0]
    material = glb.json.get("materials", [])[int(primitive.get("material", 0))]
    info = material.get("pbrMetallicRoughness", {}).get("baseColorTexture")
    if not isinstance(info, dict) or int(info.get("texCoord", 0)) != 0:
        raise BakeError("首个材质必须使用 TEXCOORD_0 baseColorTexture")
    texture = glb.json["textures"][int(info["index"])]
    source = int(texture.get("source", texture.get("extensions", {})
                             .get("KHR_texture_basisu", {}).get("source", -1)))
    if source < 0:
        raise BakeError("baseColorTexture 没有可读 image source")
    data = glb.image(source)
    with Image.open(io.BytesIO(data.data)) as image:
        image.load()
        return image.convert("RGB")


def _bone_key(name: str) -> str:
    short = name.rsplit(":", 1)[-1]
    return "".join(char.lower() for char in short if char.isalnum())


def _matrix(values: Sequence[float]) -> np.ndarray:
    array = np.asarray(values, dtype=np.float64)
    if array.shape != (16,):
        raise BakeError("bindWorld 必须是 16 个列主序数值")
    return array.reshape(4, 4).T


def _source_bones(glb: GLB) -> tuple[list[str], np.ndarray]:
    skin = glb.skin()
    names = [str(glb.json["nodes"][node].get("name", "")) for node in skin.joints]
    worlds = np.asarray([glb.world_matrix(node) for node in skin.joints], dtype=np.float64)
    return names, worlds


def align_dressed(glb: GLB, skeleton: dict[str, Any]) -> tuple[Mesh, dict[str, Any]]:
    """以躯干 Umeyama 粗配并按同名骨逐骨 LBS 到模板 bind 姿态。"""
    mesh = glb.mesh()
    if mesh.joints is None or mesh.weights is None or mesh.uvs is None:
        raise BakeError("整身 GLB 必须含 JOINTS_0 / WEIGHTS_0 / TEXCOORD_0")
    source_names, source_worlds = _source_bones(glb)
    source_map = {_bone_key(name): index for index, name in enumerate(source_names)}
    target_names = [str(name) for name in skeleton.get("joints", [])]
    target_worlds = np.asarray([_matrix(skeleton["bindWorld"][name]) for name in target_names])
    target_map = {_bone_key(name): index for index, name in enumerate(target_names)}
    missing = [name for name in FIT_JOINTS if _bone_key(name) not in source_map
               or _bone_key(name) not in target_map]
    if missing:
        raise BakeError("对齐缺少躯干骨：" + ", ".join(missing))
    src_points = np.asarray([source_worlds[source_map[_bone_key(name)], :3, 3]
                             for name in FIT_JOINTS])
    dst_points = np.asarray([target_worlds[target_map[_bone_key(name)], :3, 3]
                             for name in FIT_JOINTS])
    coarse = umeyama(src_points, dst_points, allow_mirror=False)
    if coarse.mirrored or np.linalg.det(coarse.rotation) < 1.0 - 1e-7:
        raise BakeError("关节粗配需要镜像，拒绝生成贴图层")
    coarse_matrix = np.eye(4, dtype=np.float64)
    coarse_matrix[:3, :3] = coarse.scale * coarse.rotation
    coarse_matrix[:3, 3] = coarse.translation
    coarse_positions = (mesh.positions @ coarse_matrix[:3, :3].T + coarse.translation)
    bone_world = np.empty_like(source_worlds)
    inverse_coarse_bind = np.empty_like(source_worlds)
    angles: dict[str, float] = {}
    for source_index, name in enumerate(source_names):
        key = _bone_key(name)
        if key not in target_map:
            raise BakeError(f"模板缺少源骨 {name}")
        target_world = target_worlds[target_map[key]]
        coarse_bind = coarse_matrix @ source_worlds[source_index]
        bone_world[source_index] = target_world
        inverse_coarse_bind[source_index] = np.linalg.inv(coarse_bind)
        linear = (target_world @ np.linalg.inv(coarse_bind))[:3, :3]
        u, _, vt = np.linalg.svd(linear); rotation = u @ vt
        if np.linalg.det(rotation) < 0: u[:, -1] *= -1; rotation = u @ vt
        angles[name] = float(np.degrees(np.arccos(np.clip((np.trace(rotation) - 1) / 2, -1, 1))))
    aligned = lbs(coarse_positions, mesh.joints, mesh.weights, bone_world, inverse_coarse_bind)
    matrices = bone_world @ inverse_coarse_bind
    normals = None
    if mesh.normals is not None:
        total = matrices @ coarse_matrix
        normal_matrices = np.linalg.inv(total[:, :3, :3]).transpose(0, 2, 1)
        normals = np.einsum("nk,nkij,nj->ni", mesh.weights,
                            normal_matrices[mesh.joints], mesh.normals)
        lengths = np.linalg.norm(normals, axis=1, keepdims=True)
        normals = np.divide(normals, lengths, out=np.zeros_like(normals), where=lengths > 1e-12)
    height = float(skeleton["heightMu"]); residual_pct = coarse.residuals / height * 100.0
    report = {
        "method": "9-torso-joint-umeyama+per-bone-lbs",
        "joints": list(FIT_JOINTS), "scale": coarse.scale, "mirrored": False,
        "rotationDet": float(np.linalg.det(coarse.rotation)),
        "residualMu": {name: float(value) for name, value in zip(FIT_JOINTS, coarse.residuals)},
        "residualPercentHeight": {name: float(value) for name, value in zip(FIT_JOINTS, residual_pct)},
        "rmsPercentHeight": float(np.sqrt(np.mean(residual_pct ** 2))),
        "maxPercentHeight": float(residual_pct.max()),
        "perBoneCorrectionAngleDeg": angles,
    }
    output = Mesh(aligned.astype(np.float32), mesh.indices.copy(),
                  None if normals is None else normals.astype(np.float32), mesh.uvs.copy(),
                  mesh.joints.copy(), mesh.weights.copy(), None, mesh.material_indices.copy(),
                  list(mesh.primitives), mesh.name)
    return output, report


def _srgb_lab(rgb: np.ndarray) -> np.ndarray:
    """sRGB uint8/0..1 → CIE Lab(D65)，供底板样本最近邻分类。"""
    # 分类不得原地改写调用方的取色数组（它随后会成为输出 RGB）。
    value = np.array(rgb, dtype=np.float64, copy=True)
    if value.max(initial=0) > 1.0: value /= 255.0
    linear = np.where(value <= 0.04045, value / 12.92, ((value + 0.055) / 1.055) ** 2.4)
    xyz = linear @ np.array([[0.4124564, 0.2126729, 0.0193339],
                             [0.3575761, 0.7151522, 0.1191920],
                             [0.1804375, 0.0721750, 0.9503041]])
    xyz /= np.array([0.95047, 1.0, 1.08883])
    delta = 6 / 29
    f = np.where(xyz > delta ** 3, np.cbrt(xyz), xyz / (3 * delta ** 2) + 4 / 29)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]),
                     200 * (f[..., 1] - f[..., 2])], axis=-1)


def build_classifier(plate: Image.Image, base_plate: Image.Image,
                     max_samples: int = 4096) -> Classifier:
    """从同画布衣图/素体底板自动取衣色与肤色样本，不含颜色常数。"""
    if plate.size != base_plate.size:
        raise BakeError("--plate 与 --base-plate 必须同画布尺寸")
    dressed = np.asarray(plate.convert("RGB"), dtype=np.float64)
    base = np.asarray(base_plate.convert("RGB"), dtype=np.float64)
    difference = np.linalg.norm(_srgb_lab(dressed) - _srgb_lab(base), axis=2)
    border = np.concatenate([base[0], base[-1], base[:, 0], base[:, -1]], axis=0)
    background = np.median(_srgb_lab(border), axis=0)
    base_lab = _srgb_lab(base); dressed_lab = _srgb_lab(dressed)
    person_distance = np.linalg.norm(base_lab - background, axis=2)
    positive = (difference >= np.quantile(difference, 0.88)) & (person_distance > 4.0)
    unchanged = difference <= np.quantile(difference, 0.55)
    skin = unchanged & (person_distance > 4.0)
    # 去掉衣图编辑在画布边缘留下的细小变化，并以闭运算补足纹样内部。
    positive = binary_closing(positive, iterations=2)
    if positive.sum() < 64 or skin.sum() < 64:
        raise BakeError("底板未能提供足够的衣服色/皮肤色样本")

    def pick(values: np.ndarray) -> np.ndarray:
        flat = values.reshape(-1, 3)
        if len(flat) <= max_samples: return flat
        return flat[np.linspace(0, len(flat) - 1, max_samples, dtype=np.int64)]

    cloth_samples = pick(dressed_lab[positive])
    skin_samples = pick(base_lab[skin])
    cloth_tree, skin_tree = cKDTree(cloth_samples), cKDTree(skin_samples)
    cloth_self = cloth_tree.query(cloth_samples, k=min(2, len(cloth_samples)))[0]
    skin_self = skin_tree.query(skin_samples, k=min(2, len(skin_samples)))[0]
    scale = max(float(np.median(cloth_self[:, -1]) + np.median(skin_self[:, -1])), 2.0)
    return Classifier(cloth_samples, skin_samples, 0.0, scale,
                      int(positive.sum()), int(skin.sum()))


def classify_colors(rgb: np.ndarray, classifier: Classifier) -> np.ndarray:
    lab = _srgb_lab(rgb)
    cloth_distance = cKDTree(classifier.cloth).query(lab, k=1)[0]
    skin_distance = cKDTree(classifier.skin).query(lab, k=1)[0]
    score = (skin_distance - cloth_distance - classifier.midpoint) / classifier.scale
    return 1.0 / (1.0 + np.exp(-np.clip(score, -20, 20)))


def rasterize_uv(mesh: Mesh, vertex_regions: np.ndarray, size: int) -> Raster:
    """在左上原点 UV 画布逐纹素光栅模板面并插值 bind 位置/法线。"""
    if mesh.uvs is None or mesh.normals is None:
        raise BakeError("模板必须含 TEXCOORD_0 与 NORMAL")
    regions = np.asarray(vertex_regions, dtype=np.uint8).reshape(-1)
    if len(regions) != len(mesh.positions): raise BakeError("regions.npy 与模板顶点数不一致")
    covered = np.zeros((size, size), dtype=bool)
    positions = np.zeros((size, size, 3), dtype=np.float32)
    normals = np.zeros_like(positions)
    out_regions = np.full((size, size), 255, dtype=np.uint8)
    face_indices = np.full((size, size), -1, dtype=np.int32)
    barycentric = np.zeros((size, size, 3), dtype=np.float32)
    faces = mesh.indices.reshape(-1, 3)
    pixels = mesh.uvs * np.array([size, size], dtype=np.float32) - 0.5
    for face_index, face in enumerate(faces):
        tri = pixels[face].astype(np.float64)
        x0 = max(0, int(math.ceil(tri[:, 0].min()))); x1 = min(size - 1, int(math.floor(tri[:, 0].max())))
        y0 = max(0, int(math.ceil(tri[:, 1].min()))); y1 = min(size - 1, int(math.floor(tri[:, 1].max())))
        if x1 < x0 or y1 < y0: continue
        denom = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0])
                 + (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(denom) < 1e-10: continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        w0 = ((tri[1, 1] - tri[2, 1]) * (xx - tri[2, 0])
              + (tri[2, 0] - tri[1, 0]) * (yy - tri[2, 1])) / denom
        w1 = ((tri[2, 1] - tri[0, 1]) * (xx - tri[2, 0])
              + (tri[0, 0] - tri[2, 0]) * (yy - tri[2, 1])) / denom
        weights = np.stack([w0, w1, 1.0 - w0 - w1], axis=-1)
        inside = np.all(weights >= -1e-7, axis=2)
        if not np.any(inside): continue
        rows, cols = yy[inside], xx[inside]; bary = weights[inside]
        positions[rows, cols] = bary @ mesh.positions[face]
        interpolated = bary @ mesh.normals[face]
        length = np.linalg.norm(interpolated, axis=1, keepdims=True)
        normals[rows, cols] = np.divide(interpolated, length, out=np.zeros_like(interpolated), where=length > 1e-12)
        out_regions[rows, cols] = regions[face[np.argmax(bary, axis=1)]]
        face_indices[rows, cols] = face_index
        barycentric[rows, cols] = bary
        covered[rows, cols] = True
    return Raster(covered, positions, normals, out_regions, face_indices, barycentric)


def nearest_surface(points: np.ndarray, vertices: np.ndarray, faces: np.ndarray,
                    *, k: int = 16) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """A1 最近三角的兼容包装；包围半径扩候选，细长大三角也不会漏。"""
    result = nearest_triangle(points, vertices, np.asarray(faces).reshape(-1, 3), k=k)
    return result.face_indices, result.barycentric, result.distances_mu


def _aabb_tree(triangles: np.ndarray, leaf_size: int = 64) -> list[_AabbNode]:
    lows, highs = triangles.min(axis=1), triangles.max(axis=1)
    centers = (lows + highs) * 0.5
    nodes: list[_AabbNode] = []

    def build(ids: np.ndarray) -> int:
        index = len(nodes)
        nodes.append(_AabbNode(lows[ids].min(0), highs[ids].max(0)))
        if len(ids) <= leaf_size:
            nodes[index].faces = ids
            return index
        axis = int(np.argmax(np.ptp(centers[ids], axis=0)))
        order = ids[np.argsort(centers[ids, axis], kind="stable")]
        middle = len(order) // 2
        nodes[index].left = build(order[:middle])
        nodes[index].right = build(order[middle:])
        return index

    build(np.arange(len(triangles), dtype=np.int64))
    return nodes


def _ray_scene(vertices: np.ndarray, faces: np.ndarray) -> _RayScene:
    face_ids = np.asarray(faces, dtype=np.int64).reshape(-1, 3)
    triangles = np.asarray(vertices, dtype=np.float64)[face_ids]
    face_normals = np.cross(triangles[:, 1] - triangles[:, 0],
                            triangles[:, 2] - triangles[:, 0])
    lengths = np.linalg.norm(face_normals, axis=1, keepdims=True)
    face_normals = np.divide(face_normals, lengths, out=np.zeros_like(face_normals),
                             where=lengths > 1e-12)
    return _RayScene(face_ids, triangles, face_normals, _aabb_tree(triangles))


def _rays_in_aabb(origins: np.ndarray, directions: np.ndarray, node: _AabbNode,
                   max_distance: float) -> np.ndarray:
    parallel = np.abs(directions) < 1e-12
    safe = np.where(parallel, 1.0, directions)
    t0 = (node.low - origins) / safe
    t1 = (node.high - origins) / safe
    low = np.where(parallel, -np.inf, np.minimum(t0, t1))
    high = np.where(parallel, np.inf, np.maximum(t0, t1))
    outside = np.any(parallel & ((origins < node.low) | (origins > node.high)), axis=1)
    enter, leave = np.max(low, axis=1), np.min(high, axis=1)
    return (~outside) & (leave >= np.maximum(enter, 0.0)) & (enter <= max_distance)


def raycast_outermost(origins: np.ndarray, directions: np.ndarray, vertices: np.ndarray,
                      faces: np.ndarray, max_distance: float,
                      *, scene: _RayScene | None = None) -> RayHits:
    """返回 +n 射程内最外侧非掠射交点；掠射阈值为法线夹角 70 度。"""
    origins = np.asarray(origins, dtype=np.float64)
    directions = np.asarray(directions, dtype=np.float64)
    scene = scene or _ray_scene(vertices, faces)
    face_ids, triangles, nodes = scene.face_ids, scene.triangles, scene.nodes
    best_t = np.full(len(origins), -np.inf, dtype=np.float64)
    best_face = np.full(len(origins), -1, dtype=np.int64)
    best_bary = np.zeros((len(origins), 3), dtype=np.float64)
    grazing = np.zeros(len(origins), dtype=np.int32)
    cosine_limit = math.cos(math.radians(70.0))
    stack = [(0, np.arange(len(origins), dtype=np.int64))]
    while stack:
        node_id, rays = stack.pop()
        node = nodes[node_id]
        inside = _rays_in_aabb(origins[rays], directions[rays], node, max_distance)
        rays = rays[inside]
        if not len(rays):
            continue
        if node.faces is None:
            stack.append((node.left, rays)); stack.append((node.right, rays))
            continue
        tri = triangles[node.faces]; edge1 = tri[:, 1] - tri[:, 0]; edge2 = tri[:, 2] - tri[:, 0]
        direction = directions[rays, None, :]; delta = origins[rays, None, :] - tri[None, :, 0]
        cross = np.cross(direction, edge2[None, :, :]); det = np.einsum("fi,rfi->rf", edge1, cross)
        inverse = np.divide(1.0, det, out=np.zeros_like(det), where=np.abs(det) > 1e-10)
        u = np.einsum("rfi,rfi->rf", delta, cross) * inverse
        q = np.cross(delta, edge1[None, :, :])
        v = np.sum(direction * q, axis=2) * inverse
        distance = np.einsum("fi,rfi->rf", edge2, q) * inverse
        geometric = ((np.abs(det) > 1e-10) & (u >= -1e-8) & (v >= -1e-8)
                     & (u + v <= 1.0 + 1e-8) & (distance >= 0.0)
                     & (distance <= max_distance))
        direction_lengths = np.linalg.norm(directions[rays], axis=1)
        facing = np.abs(direction[:, 0] @ scene.face_normals[node.faces].T)
        facing = np.divide(facing, direction_lengths[:, None], out=np.zeros_like(facing),
                           where=direction_lengths[:, None] > 1e-12)
        rejected = geometric & (facing < cosine_limit)
        grazing[rays] += np.count_nonzero(rejected, axis=1).astype(np.int32)
        valid = geometric & (facing >= cosine_limit)
        distance = np.where(valid, distance, -np.inf); pick = np.argmax(distance, axis=1)
        values = distance[np.arange(len(rays)), pick]; improve = values > best_t[rays]
        selected = rays[improve]; chosen = pick[improve]; best_t[selected] = values[improve]
        best_face[selected] = node.faces[chosen]
        best_bary[selected] = np.stack([1.0 - u[improve, chosen] - v[improve, chosen],
                                        u[improve, chosen], v[improve, chosen]], axis=1)
    hit = best_face >= 0
    return RayHits(best_face, best_bary, np.where(hit, best_t, np.inf), hit, grazing)


def bilinear_sample(image: np.ndarray, uv: np.ndarray) -> np.ndarray:
    # 不在热循环里复制整张贴图；仅被索引出的少量像素随算术提升为 float。
    pixels = np.asarray(image); coords = np.asarray(uv, dtype=np.float64)
    height, width = pixels.shape[:2]
    x = np.clip(coords[:, 0], 0, 1) * (width - 1)
    y = np.clip(coords[:, 1], 0, 1) * (height - 1)
    x0 = np.floor(x).astype(np.int64); y0 = np.floor(y).astype(np.int64)
    x1 = np.minimum(x0 + 1, width - 1); y1 = np.minimum(y0 + 1, height - 1)
    wx = (x - x0)[:, None]; wy = (y - y0)[:, None]
    return ((1 - wy) * ((1 - wx) * pixels[y0, x0] + wx * pixels[y0, x1])
            + wy * ((1 - wx) * pixels[y1, x0] + wx * pixels[y1, x1]))


def sample_surface_pixels(points: np.ndarray, normals: np.ndarray, source: Mesh,
                          source_texture: Image.Image, max_distance_mu: float,
                          cage_mu: float, *, chunk_size: int = 65536
                          ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """逐点射线采色；无正对交点时精算局部 16 个近质心三角。"""
    if source.uvs is None:
        raise BakeError("整身源件必须含 TEXCOORD_0")
    count = len(points); colors = np.zeros((count, 3), dtype=np.float32)
    ray_hit = np.zeros(count, dtype=bool); fallback_hit = np.zeros(count, dtype=bool)
    distance = np.full(count, np.inf, dtype=np.float64)
    grazing = np.zeros(count, dtype=np.int32)
    faces = source.indices.reshape(-1, 3); scene = _ray_scene(source.positions, faces)
    texture = np.asarray(source_texture)
    centers = scene.triangles.mean(axis=1); face_tree = cKDTree(centers)
    for start in range(0, count, chunk_size):
        stop = min(start + chunk_size, count); selection = slice(start, stop)
        ray = raycast_outermost(points[selection] - cage_mu * normals[selection],
                                normals[selection], source.positions, faces,
                                max_distance_mu, scene=scene)
        ray_hit[selection] = ray.hit; grazing[selection] = ray.grazing
        if np.any(ray.hit):
            local = np.flatnonzero(ray.hit); face = ray.faces[local]
            uv = np.einsum("ni,nij->nj", ray.bary[local], source.uvs[faces[face]])
            colors[start + local] = bilinear_sample(texture, uv)
            distance[start + local] = np.maximum(ray.distance[local] - cage_mu, 0.0)
        misses = np.flatnonzero(~ray.hit)
        if len(misses):
            query = points[start + misses]
            _, near_faces = face_tree.query(query, k=min(16, len(faces)))
            near_faces = np.asarray(near_faces).reshape(len(query), -1)
            triangles = scene.triangles[near_faces]
            nearest, weights = closest_point_on_triangle(
                np.broadcast_to(query[:, None, :], triangles.shape[:2] + (3,)),
                triangles[:, :, 0, :], triangles[:, :, 1, :], triangles[:, :, 2, :])
            near_distance = np.linalg.norm(nearest - query[:, None, :], axis=2)
            choice = np.argmin(near_distance, axis=1); chosen_distance = near_distance[np.arange(len(query)), choice]
            usable = chosen_distance <= max_distance_mu
            chosen_faces = near_faces[np.arange(len(query)), choice]
            chosen_weights = weights[np.arange(len(query)), choice]
            uv = np.einsum("ni,nij->nj", chosen_weights[usable],
                           source.uvs[faces[chosen_faces[usable]]])
            colors[start + misses[usable]] = bilinear_sample(texture, uv)
            fallback_hit[start + misses[usable]] = True
            distance[start + misses[usable]] = chosen_distance[usable]
    return colors, ray_hit, fallback_hit, distance, grazing


def smooth_vertex_scores(mesh: Mesh, raw: np.ndarray, allowed: np.ndarray,
                         iterations: int = 2) -> tuple[np.ndarray, dict[str, int]]:
    """焊接同位点后按真实三角邻接做两环 Laplacian；UV 拆点保持同值。"""
    _, groups = np.unique(np.round(mesh.positions, 7), axis=0, return_inverse=True)
    group_count = int(groups.max(initial=-1)) + 1
    counts = np.bincount(groups, minlength=group_count).astype(np.float64)
    scores = np.bincount(groups, weights=np.asarray(raw, np.float64),
                         minlength=group_count) / np.maximum(counts, 1.0)
    group_allowed = np.ones(group_count, dtype=bool)
    np.logical_and.at(group_allowed, groups, np.asarray(allowed, dtype=bool))
    faces = groups[mesh.indices.reshape(-1, 3)]
    edges = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    edges = np.unique(np.sort(edges[edges[:, 0] != edges[:, 1]], axis=1), axis=0)
    starts = np.concatenate([edges[:, 0], edges[:, 1]])
    ends = np.concatenate([edges[:, 1], edges[:, 0]])
    degree = np.bincount(starts, minlength=group_count).astype(np.float64)
    # 高置信标签抑制射线擦到衣摆外层后在裸腿留下的低概率飞点。
    support = scores >= .9
    for _ in range(iterations):
        votes = np.bincount(starts, weights=support[ends], minlength=group_count)
        support = (votes + support) * 2 >= (degree + 1)
        support &= group_allowed
    scores = support.astype(np.float64)
    for _ in range(iterations):
        votes = np.bincount(starts, weights=scores[ends], minlength=group_count)
        neighbor_mean = np.divide(votes, degree, out=scores.copy(), where=degree > 0)
        scores = .5 * scores + .5 * neighbor_mean
    scores[~group_allowed] = 0.0
    return scores[groups].astype(np.float32), {
        "weldedVertices": int(group_count), "weldedDuplicates": int(len(groups) - group_count),
        "meshEdges": int(len(edges)), "laplacianRings": int(iterations)}


def boundary_turn_metric(mesh: Mesh, scores: np.ndarray, threshold: float = .5) -> dict[str, float | int]:
    """在 3D 三角面提取等值线，报告度为 2 节点的平均折角（越低越平滑）。"""
    segments: list[tuple[tuple[float, ...], tuple[float, ...]]] = []
    for face in mesh.indices.reshape(-1, 3):
        points: list[np.ndarray] = []
        for left, right in ((0, 1), (1, 2), (2, 0)):
            a, b = float(scores[face[left]]), float(scores[face[right]])
            if (a - threshold) * (b - threshold) < 0.0:
                weight = (threshold - a) / (b - a)
                points.append(mesh.positions[face[left]] * (1 - weight)
                              + mesh.positions[face[right]] * weight)
        if len(points) == 2:
            segments.append((tuple(np.round(points[0], 7)), tuple(np.round(points[1], 7))))
    adjacency: dict[tuple[float, ...], list[tuple[float, ...]]] = {}
    for start, end in segments:
        adjacency.setdefault(start, []).append(end); adjacency.setdefault(end, []).append(start)
    turns: list[float] = []
    for center, neighbors in adjacency.items():
        if len(neighbors) != 2:
            continue
        vectors = np.asarray(neighbors) - np.asarray(center)
        lengths = np.linalg.norm(vectors, axis=1)
        if np.all(lengths > 1e-10):
            angle = math.acos(float(np.clip(np.dot(vectors[0], vectors[1])
                                             / np.prod(lengths), -1.0, 1.0)))
            turns.append(math.degrees(math.pi - angle))
    return {"segments": len(segments), "degree2Samples": len(turns),
            "meanTurnDeg": float(np.mean(turns)) if turns else 0.0,
            "p95TurnDeg": float(np.quantile(turns, .95)) if turns else 0.0}


def bake_vertices(body: Mesh, vertex_regions: np.ndarray, region_names: dict[int, str],
                  source: Mesh, source_texture: Image.Image, classifier: Classifier,
                  max_distance_mu: float, m_per_mu: float) -> VertexBake:
    allowed_ids = {key for key, name in region_names.items() if name in ALLOWED_REGIONS}
    allowed = np.isin(vertex_regions, list(allowed_ids))
    faces = source.indices.reshape(-1, 3); points = body.positions; normals = body.normals
    cage_mu = 0.005 / m_per_mu
    ray = raycast_outermost(points - cage_mu * normals, normals, source.positions,
                            faces, max_distance_mu)
    face_id, bary = ray.faces.copy(), ray.bary.copy()
    distance = np.maximum(ray.distance - cage_mu, 0.0); misses = ~ray.hit
    if np.any(misses):
        fallback = nearest_surface(points[misses], source.positions, faces, k=16)
        face_id[misses], bary[misses], distance[misses] = fallback
    hit = ray.hit | (misses & (distance <= max_distance_mu)); face_id[~hit] = 0
    bary[~hit] = 0.0
    uv = np.einsum("ni,nij->nj", bary, source.uvs[faces[face_id]])
    colors = bilinear_sample(np.asarray(source_texture), uv).astype(np.float32)
    scores = classify_colors(colors, classifier).astype(np.float32)
    scores[~hit | ~allowed] = 0.0
    smooth, topology = smooth_vertex_scores(body, scores, allowed, iterations=2)
    hit_distance = distance[hit]
    stats = {"vertexCandidates": int(allowed.sum()), "vertexHits": int((hit & allowed).sum()),
             "rayVertexHits": int((ray.hit & allowed).sum()),
             "fallbackVertices": int((misses & allowed).sum()), **topology,
             "grazingVertexHits": int(ray.grazing[allowed].sum()),
             "grazingVertexRays": int(np.count_nonzero(ray.grazing[allowed])),
             "boundaryJaggedness": boundary_turn_metric(body, smooth),
             "vertexDistanceMm": {key: float(value * m_per_mu * 1000) for key, value in {
                 "p50": np.quantile(hit_distance, .5), "p90": np.quantile(hit_distance, .9),
                 "p99": np.quantile(hit_distance, .99), "max": hit_distance.max()}.items()}}
    return VertexBake(scores, smooth, stats)


def pad_gutter(rgb: np.ndarray, alpha: np.ndarray, covered: np.ndarray,
               width: int = 8) -> np.ndarray:
    """把 RGB 与 alpha 一起复制进 UV 岛外指定宽度；不覆盖岛内纹素。"""
    seed = (alpha > 0) & covered
    if not np.any(seed):
        return np.zeros_like(covered)
    seam_distance, nearest = distance_transform_edt(~seed, return_indices=True)
    expansion = (~covered) & (seam_distance <= float(width))
    rgb[expansion] = rgb[nearest[0][expansion], nearest[1][expansion]]
    alpha[expansion] = alpha[nearest[0][expansion], nearest[1][expansion]]
    return expansion


def signed_distance_alpha(distance_px: np.ndarray, feather_px: float = 1.5) -> np.ndarray:
    """把到 0.5 等值线的有向像素距离映射到固定总宽度线性羽化。"""
    if feather_px <= 0:
        raise BakeError("feather_px 必须 > 0")
    return np.clip(.5 + np.asarray(distance_px) / feather_px, 0.0, 1.0)


def _contour_segments(mesh: Mesh, scores: np.ndarray, size: tuple[int, int]
                      ) -> np.ndarray:
    pixels = mesh.uvs * np.asarray(size[::-1], dtype=np.float64) - .5
    segments: list[np.ndarray] = []
    for face in mesh.indices.reshape(-1, 3):
        values = np.asarray(scores[face], dtype=np.float64) - .5
        points: list[np.ndarray] = []
        for left, right in ((0, 1), (1, 2), (2, 0)):
            if values[left] * values[right] < 0.0:
                weight = -values[left] / (values[right] - values[left])
                points.append(pixels[face[left]] * (1 - weight) + pixels[face[right]] * weight)
            elif values[left] == 0.0:
                points.append(pixels[face[left]])
        if len(points) >= 2 and np.linalg.norm(points[0] - points[1]) > 1e-8:
            segments.append(np.stack(points[:2]))
    return np.asarray(segments, dtype=np.float64).reshape(-1, 2, 2)


def contour_alpha(mesh: Mesh, scores: np.ndarray, raster: Raster,
                  candidate: np.ndarray, feather_px: float = 1.5) -> np.ndarray:
    """以 0.5 等值线几何距离生成 alpha；UV 岛边缘不是羽化边界。"""
    rows, cols = np.nonzero(raster.covered)
    faces = mesh.indices.reshape(-1, 3)[raster.face_indices[rows, cols]]
    bary = raster.barycentric[rows, cols]
    pixel_scores = np.einsum("ni,ni->n", bary, scores[faces])
    alpha_values = (pixel_scores >= .5).astype(np.float64)
    segments = _contour_segments(mesh, scores, raster.covered.shape)
    if len(segments):
        distance = np.full(raster.covered.shape, np.inf, dtype=np.float32)
        half_width = feather_px / 2
        height, width = raster.covered.shape
        for segment in segments:
            low = np.floor(segment.min(axis=0) - half_width).astype(int)
            high = np.ceil(segment.max(axis=0) + half_width).astype(int)
            x0, y0 = np.maximum(low, 0); x1, y1 = np.minimum(high, [width - 1, height - 1])
            if x1 < x0 or y1 < y0:
                continue
            yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
            points = np.stack([xx, yy], axis=-1); edge = segment[1] - segment[0]
            length2 = float(np.dot(edge, edge))
            along = np.clip(np.sum((points - segment[0]) * edge, axis=2) / length2, 0, 1)
            local = np.linalg.norm(points - (segment[0] + along[..., None] * edge), axis=2)
            distance[y0:y1 + 1, x0:x1 + 1] = np.minimum(
                distance[y0:y1 + 1, x0:x1 + 1], local)
        sampled_distance = distance[rows, cols]; near = sampled_distance <= half_width
        signed = sampled_distance[near] * np.where(pixel_scores[near] >= .5, 1.0, -1.0)
        alpha_values[near] = signed_distance_alpha(signed, feather_px)
    alpha = np.zeros(raster.covered.shape, dtype=np.float32)
    alpha[rows, cols] = alpha_values; alpha[~candidate] = 0.0
    return alpha


def bake_pixels(body: Mesh, vertex_regions: np.ndarray, raster: Raster,
                region_names: dict[int, str], source: Mesh, source_texture: Image.Image,
                classifier: Classifier, max_distance_mu: float, *, m_per_mu: float = 1.0
                ) -> tuple[np.ndarray, dict[str, Any]]:
    """顶点只决定衣服度；每个候选 UV 纹素独立射线决定 RGB。"""
    allowed_ids = {region_id for region_id, name in region_names.items() if name in ALLOWED_REGIONS}
    candidate = raster.covered & np.isin(raster.regions, list(allowed_ids))
    vertices = bake_vertices(body, vertex_regions, region_names, source, source_texture,
                             classifier, max_distance_mu, m_per_mu)
    rows, cols = np.nonzero(raster.covered); pixel_faces = raster.face_indices[rows, cols]
    faces = body.indices.reshape(-1, 3)[pixel_faces]; bary = raster.barycentric[rows, cols]
    alpha = contour_alpha(body, vertices.smooth_scores, raster, candidate, 1.5)
    rgb = np.zeros((*raster.covered.shape, 3), dtype=np.float32)
    sample_mask = candidate[rows, cols]
    sample_rows, sample_cols = rows[sample_mask], cols[sample_mask]
    cage_mu = 0.005 / m_per_mu
    colors, ray_hit, fallback_hit, distance, grazing = sample_surface_pixels(
        raster.positions[sample_rows, sample_cols], raster.normals[sample_rows, sample_cols],
        source, source_texture, max_distance_mu, cage_mu)
    hit = ray_hit | fallback_hit; rgb[sample_rows[hit], sample_cols[hit]] = colors[hit]
    alpha[sample_rows[~hit], sample_cols[~hit]] = 0.0
    # 防接缝扩边只能进入 UV 岛外；禁止污染任何已光栅化的皮肤禁区。
    expansion = pad_gutter(rgb, alpha, raster.covered, width=8)
    rgba = np.concatenate([np.clip(rgb, 0, 255), alpha[..., None] * 255], axis=2).astype(np.uint8)
    rgba[..., :3][rgba[..., 3] == 0] = 0
    raw_pixel_score = np.einsum("ni,ni->n", bary, vertices.raw_scores[faces])
    pixel_candidate = candidate[rows, cols]
    support_before = int(np.count_nonzero((raw_pixel_score >= .5) & pixel_candidate))
    support_after = int(np.count_nonzero((alpha == 1.0) & candidate))
    boundary = candidate & (alpha > 0) & (alpha < 1)
    hit_distance = distance[hit]
    stats = {
        "rasterizedTexels": int(raster.covered.sum()),
        "candidateTexels": int(candidate.sum()),
        "hitTexels": int(hit.sum()), "hitRate": float(hit.mean()) if len(hit) else 0.0,
        "rayCandidateTexels": int(len(hit)), "rayHitTexels": int(ray_hit.sum()),
        "rayHitRate": float(ray_hit.mean()) if len(ray_hit) else 0.0,
        "fallbackTexels": int(fallback_hit.sum()),
        "grazingHits": int(grazing.sum()), "grazingRays": int(np.count_nonzero(grazing)),
        "distanceMm": {name: float(value * m_per_mu * 1000) for name, value in {
            "p50": np.quantile(hit_distance, .5), "p90": np.quantile(hit_distance, .9),
            "p99": np.quantile(hit_distance, .99), "max": hit_distance.max()}.items()},
        "clothTexelsBeforeClean": support_before, "clothTexelsAfterClean": support_after,
        "boundaryPartialTexels": int(boundary.sum()), "gutterPx": 8,
        "gutterTexels": int(expansion.sum()), **vertices.stats,
    }
    return rgba, stats


def shared_uv_templates(reference: Mesh, candidates: dict[str, Mesh]) -> list[str]:
    """仅返回三角索引和 UV 与参考逐位相等的模板 id。"""
    if reference.uvs is None: raise BakeError("参考模板缺 TEXCOORD_0")
    return [name for name, mesh in candidates.items()
            if mesh.uvs is not None and np.array_equal(reference.indices, mesh.indices)
            and np.array_equal(reference.uvs, mesh.uvs)]


def verify_templates(body_path: Path, reference: Mesh) -> list[str]:
    templates_root = body_path.resolve().parent.parent
    candidates: dict[str, Mesh] = {}
    for template_id in TEMPLATE_IDS:
        path = templates_root / template_id / "body.glb"
        if path.exists(): candidates[template_id] = load_glb(path).mesh()
    matched = shared_uv_templates(reference, candidates)
    if "tpl_f_medium" not in matched:
        raise BakeError("输入 body 不是 tpl_f_medium 的逐位相同 UV/索引")
    return matched


def coverage_by_region(raster: Raster, rgba: np.ndarray, names: dict[int, str]) -> dict[str, float]:
    alpha = rgba[..., 3] > 0
    output: dict[str, float] = {}
    for region_id, name in sorted(names.items()):
        area = raster.covered & (raster.regions == region_id)
        output[name] = float((alpha & area).sum() / area.sum()) if area.any() else 0.0
    return output


def composite_texture(base: Image.Image, rgba: np.ndarray) -> Image.Image:
    layer = Image.fromarray(rgba, "RGBA")
    background = base.convert("RGBA").resize(layer.size, Image.Resampling.LANCZOS)
    return Image.alpha_composite(background, layer).convert("RGB")


def render_orthographic(mesh: Mesh, texture: Image.Image, *, back: bool,
                        width: int = 640, height: int = 960) -> Image.Image:
    """Pillow/NumPy 正交软光栅；+Z 为正面，逐像素 z-buffer、unlit 取色。"""
    if mesh.uvs is None: raise BakeError("预览模板缺 UV")
    positions = np.asarray(mesh.positions, dtype=np.float64); faces = mesh.indices.reshape(-1, 3)
    low, high = positions[:, :2].min(0), positions[:, :2].max(0)
    scale = min((width - 32) / max(high[0] - low[0], 1e-9),
                (height - 32) / max(high[1] - low[1], 1e-9))
    center = (low + high) / 2
    screen = np.empty((len(positions), 2), dtype=np.float64)
    screen[:, 0] = (positions[:, 0] - center[0]) * scale + width / 2
    if back: screen[:, 0] = width - screen[:, 0]
    screen[:, 1] = height / 2 - (positions[:, 1] - center[1]) * scale
    depth = positions[:, 2] * (-1 if back else 1)
    zbuffer = np.full((height, width), -np.inf, dtype=np.float32)
    output = np.full((height, width, 3), [219, 212, 195], dtype=np.uint8)
    tex = np.asarray(texture.convert("RGB"))
    order = np.argsort(depth[faces].mean(axis=1))
    for face in faces[order]:
        tri = screen[face]
        x0 = max(0, int(math.ceil(tri[:, 0].min()))); x1 = min(width - 1, int(math.floor(tri[:, 0].max())))
        y0 = max(0, int(math.ceil(tri[:, 1].min()))); y1 = min(height - 1, int(math.floor(tri[:, 1].max())))
        if x1 < x0 or y1 < y0: continue
        denom = ((tri[1, 1] - tri[2, 1]) * (tri[0, 0] - tri[2, 0])
                 + (tri[2, 0] - tri[1, 0]) * (tri[0, 1] - tri[2, 1]))
        if abs(denom) < 1e-10: continue
        yy, xx = np.mgrid[y0:y1 + 1, x0:x1 + 1]
        w0 = ((tri[1, 1] - tri[2, 1]) * (xx - tri[2, 0])
              + (tri[2, 0] - tri[1, 0]) * (yy - tri[2, 1])) / denom
        w1 = ((tri[2, 1] - tri[0, 1]) * (xx - tri[2, 0])
              + (tri[0, 0] - tri[2, 0]) * (yy - tri[2, 1])) / denom
        bary = np.stack([w0, w1, 1 - w0 - w1], axis=-1)
        inside = np.all(bary >= -1e-7, axis=2)
        if not np.any(inside): continue
        rows, cols, weights = yy[inside], xx[inside], bary[inside]
        values = weights @ depth[face]; visible = values > zbuffer[rows, cols]
        if not np.any(visible): continue
        rows, cols, weights, values = rows[visible], cols[visible], weights[visible], values[visible]
        output[rows, cols] = np.clip(bilinear_sample(tex, weights @ mesh.uvs[face]), 0, 255).astype(np.uint8)
        zbuffer[rows, cols] = values
    return Image.fromarray(output, "RGB")


def _memory_mib() -> float:
    value = float(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
    if sys.platform != "darwin": value *= 1024.0
    return value / (1024.0 * 1024.0)


def _asset_sha(path: Path) -> str:
    return sha256(_asset_bytes(path)).hexdigest()


def save_previews(out_dir: Path, body_glb: GLB, body: Mesh, raster: Raster, rgba: np.ndarray,
                  plate: Image.Image) -> None:
    composite = composite_texture(_base_texture(body_glb), rgba)
    composite.save(out_dir / "preview_basecolor.jpg", format="JPEG", quality=92, optimize=True)
    # 保留岛外 gutter；清零会让软光栅的双线性采样重新露出浅色 UV 缝。
    preview_composite = composite_texture(_base_texture(body_glb), rgba)
    preview_size = (640, 960)
    front = render_orthographic(body, preview_composite, back=False, width=1280, height=1920)
    back = render_orthographic(body, preview_composite, back=True, width=1280, height=1920)
    front = front.resize(preview_size, Image.Resampling.LANCZOS)
    back = back.resize(preview_size, Image.Resampling.LANCZOS)
    front.save(out_dir / "preview_front.png", optimize=True); back.save(out_dir / "preview_back.png", optimize=True)
    detail = front.crop((32, 128, front.width - 32, 560))
    detail.resize((detail.width * 2, detail.height * 2), Image.Resampling.LANCZOS).save(
        out_dir / "preview_front_detail.png", optimize=True)
    edge_crops = ((220, 120, 420, 340), (70, 250, 250, 500), (390, 250, 570, 500))
    edges = Image.new("RGB", (1080, 500), (219, 212, 195))
    for index, bounds in enumerate(edge_crops):
        crop = front.crop(bounds).resize((360, 500), Image.Resampling.LANCZOS)
        edges.paste(crop, (index * 360, 0))
    edges.save(out_dir / "preview_edges_detail.png", optimize=True)
    reference = plate.copy(); reference.thumbnail(front.size, Image.Resampling.LANCZOS)
    compare = Image.new("RGB", (front.width * 2, front.height), (219, 212, 195))
    compare.paste(reference, ((front.width - reference.width) // 2, (front.height - reference.height) // 2))
    compare.paste(front, (front.width, 0)); compare.save(out_dir / "preview_compare.png", optimize=True)


def bake(dressed_path: Path, body_path: Path, skeleton_path: Path, out_dir: Path,
         *, slot: str, layer_id: str, plate_path: Path, base_plate_path: Path,
         size: int = 2048, max_distance_mm: float = 60.0) -> dict[str, Any]:
    started = time.perf_counter(); out_dir.mkdir(parents=True, exist_ok=True)
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    if skeleton.get("schema") != "tianshu-dressup-skeleton.v1":
        raise BakeError("--skeleton schema 不受支持")
    body_glb, dressed_glb = load_glb(body_path), load_glb(dressed_path)
    body = body_glb.mesh(); source, align = align_dressed(dressed_glb, skeleton)
    regions = np.load(skeleton_path.with_name(skeleton["regions"]["file"]), allow_pickle=False)
    region_names = {int(value): str(name) for name, value in skeleton["regions"]["ids"].items()}
    raster = rasterize_uv(body, regions, size)
    plate, base_plate = open_image(plate_path), open_image(base_plate_path)
    classifier = build_classifier(plate, base_plate)
    m_per_mu = float(skeleton["mPerMu"])
    rgba, bake_stats = bake_pixels(body, regions, raster, region_names, source,
                                   _base_texture(dressed_glb), classifier,
                                   max_distance_mm / (1000.0 * m_per_mu), m_per_mu=m_per_mu)
    layer_path = out_dir / "eq_jinzhuang.layer.png"
    Image.fromarray(rgba, "RGBA").save(layer_path, format="PNG", optimize=True)
    save_previews(out_dir, body_glb, body, raster, rgba, plate)
    coverage = coverage_by_region(raster, rgba, region_names)
    templates = verify_templates(body_path, body)
    opaque = int(np.count_nonzero(rgba[..., 3] == 255))
    partial = int(np.count_nonzero((rgba[..., 3] > 0) & (rgba[..., 3] < 255)))
    elapsed = time.perf_counter() - started
    result = {
        "schema": SCHEMA, "kind": "layer", "slot": slot, "id": layer_id,
        "item": "eq_jinzhuang",
        "uv": {"template": "tpl_f_medium", "bodySha256": file_sha(body_path), "size": size,
                 "origin": "top-left", "flipY": False},
        "templates": templates, "align": align, "coverageByRegion": coverage,
        "alpha": {"opaque": opaque, "partial": partial,
                  "transparent": int(rgba.shape[0] * rgba.shape[1] - opaque - partial),
                  "premultiplied": False},
        "source": {"file": _display_path(dressed_path), "sha256": file_sha(dressed_path),
                   "plate": _display_path(plate_path), "plateSha256": _asset_sha(plate_path),
                   "basePlate": _display_path(base_plate_path), "basePlateSha256": _asset_sha(base_plate_path)},
        "classifier": {"space": "CIE Lab D65", "method": "plate-nearest-sample-logistic",
                       "clothSamples": classifier.cloth_samples, "skinSamples": classifier.skin_samples},
        "bake": bake_stats, "stats": {"elapsedSec": elapsed, "peakMemoryMiB": _memory_mib()},
    }
    (out_dir / "layer.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dressed", type=Path, required=True, help="穿衣整身 GLB")
    parser.add_argument("--body", type=Path, required=True, help="模板 body.glb")
    parser.add_argument("--skeleton", type=Path, required=True, help="模板 skeleton.json")
    parser.add_argument("--slot", default="body", help="装备槽，默认 body")
    parser.add_argument("--id", required=True, dest="layer_id", help="贴图层 id")
    parser.add_argument("--out", type=Path, required=True, help="输出目录")
    parser.add_argument("--plate", type=Path, default=_repo_root() / "assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_dressup_eq_jinzhuang_front.png", help="同画布衣图底板")
    parser.add_argument("--base-plate", type=Path, default=_repo_root() / "assets/default/character/female/ch00/threeview/por_npc_zhujue__ch00_f_bald_base_body_apose_narrow.png", help="同画布模板底图")
    parser.add_argument("--size", type=int, default=2048, help="输出方图边长，默认 2048")
    parser.add_argument("--max-distance-mm", type=float, default=60.0, help="最近面距离上限，默认 60 mm")
    parser.add_argument("--json", action="store_true", help="stdout 只输出单个 JSON 对象")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.size < 16 or args.max_distance_mm <= 0:
        print("错误：--size 必须 >= 16，--max-distance-mm 必须 > 0", file=sys.stderr); return 2
    try:
        result = bake(args.dressed, args.body, args.skeleton, args.out, slot=args.slot,
                      layer_id=args.layer_id, plate_path=args.plate, base_plate_path=args.base_plate,
                      size=args.size, max_distance_mm=args.max_distance_mm)
        summary = {"ok": True, "out": args.out.as_posix(), "templates": result["templates"],
                   "coverageByRegion": result["coverageByRegion"], **result["stats"]}
        print(json.dumps(summary, ensure_ascii=False) if args.json else
              f"烘焙完成：{args.out}，{summary['elapsedSec']:.2f}s，峰值 {summary['peakMemoryMiB']:.1f} MiB")
        return 0
    except (OSError, ValueError, KeyError, IndexError, RuntimeError, json.JSONDecodeError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False) if args.json
              else f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
