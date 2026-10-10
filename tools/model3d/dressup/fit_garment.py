#!/usr/bin/env python3
"""把无骨骼衣物/发型对齐到正本，转移权重、消除 bind pose 穿模并写 fit.json。

坐标与距离以模型单位（mu）计算；命令行的 ``--push-mm`` 是唯一毫米输入。
脚本既可直接运行，也公开纯几何函数供合成测试和 ``refit_template.py`` 复用。
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from io import BytesIO
import hashlib
import heapq
import json
import math
import os
from pathlib import Path
import resource
import sys
import time
from typing import Any, Sequence

# 同目录 inspect.py 会遮蔽标准库 inspect；NumPy 导入前先缓存标准库模块。
_SCRIPT_DIR = Path(__file__).resolve().parent
_removed = [(i, value) for i, value in enumerate(sys.path)
            if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path
               if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed:
    sys.path.insert(min(_index, len(sys.path)), _value)

import numpy as np
from scipy.spatial import cKDTree
from PIL import Image

try:
    from .common import closest_point_on_triangle, edge_statistics, pca, umeyama
    from .glb_io import GLB, ImageData, Mesh, PrimitiveRange, load_glb, write_skinned_glb
except ImportError:
    from common import closest_point_on_triangle, edge_statistics, pca, umeyama
    from glb_io import GLB, ImageData, Mesh, PrimitiveRange, load_glb, write_skinned_glb

KINDS = ("garment", "hair")
ALIGN_MODES = ("auto", "joints", "landmarks", "none")
EDGE_WEIGHT_MODES = ("off", "template")
WEIGHT_SOURCE_MODES = ("auto", "template")
PUSH_MODES = ("vertex", "volume")
# --push-mode volume（体表位移场推离，见 volume_push）
VOLUME_SIGMA_MM = 40.0          # 首轮高斯核宽 σ（胸部量级的大位移用宽核，层叠的交领整体平移）
VOLUME_SIGMA_MIN_MM = 16.0      # 逐轮收窄的下限
VOLUME_STEP_SIGMA = 1.0         # 单轮外移量上限（× 当轮 σ）
VOLUME_DECAY = 0.7              # 每轮 σ 乘数
VOLUME_NODE_MM = 8.0            # 体表节点的体素边长（体表顶点约 3 mm 一个；σ ≥ 12 mm 时 8 mm 节点足够）
VOLUME_NEAR_MM = 40.0           # 离体表这一距离内全额取场
VOLUME_FAR_MM = 80.0            # 到这一距离渐隐到 0（宽松袖口 / 下摆不随胸部外移）
VOLUME_ROUNDS = 8                # 首段推离最多轮数（之后的残差由垂坠交替里的推离收尾）
# 体表位移场推完后的限拉伸垂坠（DrapeRelaxer）与再推离交替
DRAPE_CYCLES = 6                # 交替次数（0 关闭）
DRAPE_RELAX_ITERS = 4           # 每次限拉伸松弛的投影动力学迭代数
DRAPE_PUSH_ROUNDS = 6           # 每次松弛后体表位移场再推的最多轮数（σ = VOLUME_SIGMA_MIN_MM）
DRAPE_STRAIN_MIN = 0.75         # 边长目标下限（× 静止长度）
DRAPE_STRAIN_MAX = 1.3          # 边长目标上限（validate 门禁 1.4，留余量）
DRAPE_ANCHOR = 1e-3             # 对松弛前位置的弱锚定（相对拉普拉斯对角均值），防整体漂移
DRAPE_PIN = 1e3                 # 新翻面顶点的钉住权重（同上口径）
DRAPE_PIN_ATTEMPTS = 8          # 每步最多加钉重解次数
# --clean-skin-texture：交付贴图按 JPEG q95 编码；编码后解码复测，统计记编码后的真实值
SKIN_REPLACE_MARGIN = 6.0       # 填补色须比肤色阈值再远这么多（ΔE76；实测 q95 重编码漂移 ≤ 3.5）
SKIN_ENCODE_ATTEMPTS = 6        # 解码后仍有肤色纹素时在解码图上再修再编码的最多轮数（劲装实测：35 → 12 → 8 → 1 → 0）
SLOTS = ("body", "innerBody", "hands", "feet", "waist", "cape", "shoulder", "head")
NEVER_HIDE = ("neck", "handL", "handR", "footL", "footR")
SLOT_BONES = {
    "body": ("Hips", "Spine", "Spine1", "Spine2", "Neck", "Shoulder",
             "Arm", "ForeArm", "Hand", "UpLeg", "Leg"),
    "innerBody": ("Hips", "Spine", "Spine1", "Spine2", "Neck", "Shoulder",
                  "Arm", "ForeArm", "Hand", "UpLeg", "Leg"),
    "hands": ("ForeArm", "Hand"), "feet": ("Leg", "Foot", "Toe"),
    "waist": ("Hips", "Spine", "Spine1", "UpLeg"),
    "cape": ("Hips", "Spine", "Spine1", "Spine2", "Neck", "Shoulder"),
    "shoulder": ("Spine1", "Spine2", "Neck", "Shoulder", "Arm", "ForeArm"),
    "head": ("Head", "Neck", "Spine2"),
}
ALIGN_BONES = ("Hips", "Spine", "Spine1", "Spine2", "Neck", "LeftArm", "RightArm",
               "LeftUpLeg", "RightUpLeg")


class GarmentError(ValueError):
    """输入资产或贴合参数不满足契约。"""


class GarmentGateError(GarmentError):
    """几何结果未通过正式入包门禁。"""


@dataclass
class SurfaceIndex:
    """可复用的三角形质心 KD 索引；候选内使用精确点到三角形距离。"""

    vertices: np.ndarray
    faces: np.ndarray
    normals: np.ndarray
    k: int = 16

    def __post_init__(self) -> None:
        self.vertices = np.asarray(self.vertices, dtype=np.float64)
        self.faces = np.asarray(self.faces, dtype=np.int64).reshape(-1, 3)
        self.normals = _unit(np.asarray(self.normals, dtype=np.float64))
        self.triangles = self.vertices[self.faces]
        self.centers = self.triangles.mean(axis=1)
        self.radii = np.linalg.norm(self.triangles - self.centers[:, None, :], axis=2).max(axis=1)
        self.max_radius = float(self.radii.max(initial=0.0))
        self.tree = cKDTree(self.centers)
        ordered = np.argsort(self.radii, kind="stable")
        self.radius_bins = []
        for ids in np.array_split(ordered, min(8, len(ordered))):
            if len(ids):
                self.radius_bins.append((ids, cKDTree(self.centers[ids]),
                                         float(self.radii[ids].max())))

    def query(self, points: np.ndarray, *, reference_normals: np.ndarray | None = None,
              chunk: int = 8192) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """返回几何最近点、重心、面号和距离。

        ``reference_normals`` 只保留为兼容参数并校验形状；绝不参与候选面选择。
        算法与 A1 ``nearest_triangle`` 相同：k 个质心种子给出上界，再用三角形
        包围半径扩展并精算所有可能更近的面。这里按块展平候选，避免逐点 Python 循环。
        """
        pts = np.asarray(points, dtype=np.float64)
        refs = None if reference_normals is None else np.asarray(reference_normals, dtype=np.float64)
        if refs is not None and refs.shape != pts.shape:
            raise GarmentError("reference_normals 与 points 数量不同")
        nearest = np.empty_like(pts); bary = np.empty_like(pts)
        face_ids = np.empty(len(pts), dtype=np.int64); distances = np.empty(len(pts))
        k = min(max(1, self.k), len(self.faces))
        # 查询块自适应：贴身件的候选集很小，可用大块提高吞吐；离体旧壳的
        # 候选更多，限制在 8192 以内以守住内存。
        effective_chunk = min(max(int(chunk), 32768), len(pts))
        for start in range(0, len(pts), effective_chunk):
            stop = min(start + effective_chunk, len(pts)); block = pts[start:stop]
            _, candidates = self.tree.query(block, k=k, workers=-1)
            candidates = np.asarray(candidates).reshape(len(block), k)
            tri = self.triangles[candidates]
            q, b = closest_point_on_triangle(block[:, None, :], tri[:, :, 0], tri[:, :, 1], tri[:, :, 2])
            d2 = np.sum((q - block[:, None, :]) ** 2, axis=2)
            pick = np.argmin(d2, axis=1)
            rows = np.arange(len(block))
            best_d2 = d2[rows, pick].copy(); best = np.sqrt(best_d2)
            best_faces = candidates[rows, pick].copy()
            best_q = q[rows, pick].copy(); best_b = b[rows, pick].copy()
            for bin_ids, bin_tree, bin_radius in self.radius_bins:
                expanded = bin_tree.query_ball_point(block, best + bin_radius, workers=-1)
                counts = np.fromiter((len(row) for row in expanded), dtype=np.int64, count=len(block))
                if not np.any(counts):
                    continue
                candidate_owners = np.repeat(rows, counts)
                local_ids = np.concatenate(expanded).astype(np.int64, copy=False)
                expanded_ids = bin_ids[local_ids]
                center_distance = np.linalg.norm(self.centers[expanded_ids] - block[candidate_owners], axis=1)
                possible = center_distance - self.radii[expanded_ids] <= best[candidate_owners] + 1e-12
                candidate_owners = candidate_owners[possible]; expanded_ids = expanded_ids[possible]
                if not len(candidate_owners):
                    continue
                exact_tri = self.triangles[expanded_ids]
                exact_q, exact_b = closest_point_on_triangle(
                    block[candidate_owners], exact_tri[:, 0], exact_tri[:, 1], exact_tri[:, 2])
                exact_d2 = np.sum((exact_q - block[candidate_owners]) ** 2, axis=1)
                order = np.lexsort((expanded_ids, exact_d2, candidate_owners))
                sorted_owners = candidate_owners[order]
                first = np.r_[True, sorted_owners[1:] != sorted_owners[:-1]]
                chosen = order[first]; chosen_owners = candidate_owners[chosen]
                improve = ((exact_d2[chosen] < best_d2[chosen_owners])
                           | ((exact_d2[chosen] == best_d2[chosen_owners])
                              & (expanded_ids[chosen] < best_faces[chosen_owners])))
                chosen = chosen[improve]; chosen_owners = chosen_owners[improve]
                best_d2[chosen_owners] = exact_d2[chosen]
                best[chosen_owners] = np.sqrt(exact_d2[chosen])
                best_faces[chosen_owners] = expanded_ids[chosen]
                best_q[chosen_owners] = exact_q[chosen]; best_b[chosen_owners] = exact_b[chosen]
            nearest[start:stop] = best_q; bary[start:stop] = best_b
            face_ids[start:stop] = best_faces; distances[start:stop] = np.sqrt(best_d2)
        return nearest, bary, face_ids, distances


def _unit(vectors: np.ndarray) -> np.ndarray:
    length = np.linalg.norm(vectors, axis=1, keepdims=True)
    return np.divide(vectors, length, out=np.zeros_like(vectors), where=length > 1e-12)


def _signed_distance_from_query(points: np.ndarray, nearest: np.ndarray,
                                normals: np.ndarray, distances: np.ndarray) -> np.ndarray:
    """与 A1 common.signed_distance 一致：几何距离乘插值法线判定的符号。"""
    sign = np.sign(np.einsum("ij,ij->i", np.asarray(points) - nearest, normals))
    sign[sign == 0.0] = 1.0
    return sign * np.asarray(distances, dtype=np.float64)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _portable(path: Path) -> str:
    if not path.is_absolute():
        return path.as_posix()
    for marker in ("apps", "assets", "tools", "packages", "docs"):
        found = [i for i, value in enumerate(path.parts) if value == marker]
        if found:
            return Path(*path.parts[found[-1]:]).as_posix()
    return path.name


def _transform_points(points: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    homogeneous = np.column_stack((points, np.ones(len(points))))
    return (homogeneous @ matrix.T)[:, :3]


def _transform_normals(normals: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    return _unit(np.asarray(normals, dtype=np.float64) @ np.linalg.inv(matrix[:3, :3]))


def load_world_mesh(glb: GLB, *, skinned_only: bool = False) -> Mesh:
    """合并场景里的 mesh 实例，把节点 world 变换烘焙到几何。"""
    positions: list[np.ndarray] = []; normals: list[np.ndarray] = []; uvs: list[np.ndarray] = []
    joints: list[np.ndarray] = []; weights: list[np.ndarray] = []; regions: list[np.ndarray] = []
    indices: list[np.ndarray] = []; ranges: list[PrimitiveRange] = []; materials: list[int] = []
    has_normal = has_uv = has_skin = has_region = True; vertex_start = index_start = 0
    nodes = [(i, n) for i, n in enumerate(glb.json.get("nodes", [])) if "mesh" in n]
    if skinned_only:
        nodes = [(i, n) for i, n in nodes if "skin" in n]
    if not nodes:
        raise GarmentError("GLB 没有可用 mesh 节点")
    for node_index, node in nodes:
        source = glb.mesh(int(node["mesh"])); world = glb.world_matrix(node_index)
        positions.append(_transform_points(source.positions, world)); indices.append(source.indices + vertex_start)
        if source.normals is None: has_normal = False
        else: normals.append(_transform_normals(source.normals, world))
        if source.uvs is None: has_uv = False
        else: uvs.append(source.uvs.copy())
        if source.joints is None or source.weights is None: has_skin = False
        else: joints.append(source.joints.copy()); weights.append(source.weights.copy())
        if source.regions is None: has_region = False
        else: regions.append(source.regions.copy())
        for section in source.primitives:
            ranges.append(PrimitiveRange(vertex_start + section.vertex_start, section.vertex_count,
                                         index_start + section.index_start, section.index_count, section.material,
                                         section.mesh_index, section.primitive_index, section.mode, section.attributes))
            materials.append(-1 if section.material is None else int(section.material))
        vertex_start += len(source.positions); index_start += len(source.indices)
    return Mesh(np.concatenate(positions), np.concatenate(indices),
                np.concatenate(normals) if has_normal else None,
                np.concatenate(uvs) if has_uv else None,
                np.concatenate(joints) if has_skin else None, np.concatenate(weights) if has_skin else None,
                np.concatenate(regions) if has_region else None, np.asarray(materials), ranges, "DressupMesh")


def vertex_normals(positions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    """面积加权逐顶点法线；退化或相互抵消处回退 +Z。"""
    pos = np.asarray(positions, dtype=np.float64); tri = np.asarray(faces, dtype=np.int64)
    face_normals = np.cross(pos[tri[:, 1]] - pos[tri[:, 0]], pos[tri[:, 2]] - pos[tri[:, 0]])
    result = np.zeros_like(pos)
    for column in range(3):
        np.add.at(result, tri[:, column], face_normals)
    lengths = np.linalg.norm(result, axis=1)
    result[lengths <= 1e-12] = (0.0, 0.0, 1.0)
    return _unit(result)


def _yaw_matrix(degrees: float) -> np.ndarray:
    angle = math.radians(degrees); c, s = math.cos(angle), math.sin(angle)
    return np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]])


def _axis_length_map(source_axis: np.ndarray, target_axis: np.ndarray, ratio: float) -> np.ndarray:
    """把源骨局部轴旋到目标局部轴，并仅沿源轴应用正骨长比。"""
    a = source_axis / np.linalg.norm(source_axis); b = target_axis / np.linalg.norm(target_axis)
    cross = np.cross(a, b); dot = float(np.clip(a @ b, -1.0, 1.0)); norm = np.linalg.norm(cross)
    if norm <= 1e-12:
        if dot > 0.0:
            rotation = np.eye(3)
        else:
            helper = np.eye(3)[int(np.argmin(np.abs(a)))]
            axis = np.cross(a, helper); axis /= np.linalg.norm(axis)
            rotation = 2.0 * np.outer(axis, axis) - np.eye(3)
    else:
        skew = np.array([[0.0, -cross[2], cross[1]], [cross[2], 0.0, -cross[0]],
                         [-cross[1], cross[0], 0.0]])
        rotation = np.eye(3) + skew + skew @ skew * ((1.0 - dot) / (norm * norm))
    return rotation @ (np.eye(3) + (ratio - 1.0) * np.outer(a, a))


def mm_to_mu(value_mm: float, m_per_mu: float) -> float:
    """毫米转模型单位；所有衣物距离阈值走这一入口。"""
    if m_per_mu <= 0.0:
        raise GarmentError("mPerMu 必须大于零")
    return float(value_mm) / 1000.0 / float(m_per_mu)


def _matrix_from_skeleton(skeleton: dict[str, Any], bone: str) -> np.ndarray:
    return np.asarray(skeleton["bindWorld"][bone], dtype=np.float64).reshape(4, 4).T


def load_skull_profile(skeleton: dict[str, Any], skeleton_path: Path) -> dict[str, Any]:
    """读取并校验 skeleton.json 指向的规范颅骨截面表。"""
    profile_path = skeleton_path.parent / skeleton["skullProfile"]["file"]
    profile = json.loads(profile_path.read_text(encoding="utf-8"))
    if profile.get("bone") not in skeleton["bindWorld"] or len(profile.get("rows", [])) < 3:
        raise GarmentError("skull_profile.json 缺少 Head 截面")
    return profile


def _nearest_vertex_score(candidate: np.ndarray, body: np.ndarray) -> float:
    tree = cKDTree(body); stride = max(1, len(candidate) // 6000)
    distances = tree.query(candidate[::stride], workers=-1)[0]
    return float(np.median(distances) + np.quantile(distances, 0.75))


def _socket_world(skeleton: dict[str, Any], socket_name: str) -> tuple[dict[str, Any], np.ndarray]:
    socket = skeleton["sockets"][socket_name]
    world = _matrix_from_skeleton(skeleton, socket["bone"])
    return socket, _transform_points(np.asarray([socket["pos"]], dtype=np.float64), world)[0]


def _sleeve_angles(positions: np.ndarray, skeleton: dict[str, Any]) -> dict[str, float]:
    """从左右袖口外缘到肩关节的真实方向量袖角；无足够袖顶点时返回空。"""
    points = np.asarray(positions, dtype=np.float64); height = float(np.ptp(points[:, 1]))
    required = ("mixamorig:Hips", "mixamorig:LeftArm", "mixamorig:RightArm")
    if any(name not in skeleton.get("bindWorld", {}) for name in required):
        return {}
    hips = _matrix_from_skeleton(skeleton, "mixamorig:Hips")[:3, 3]
    result: dict[str, float] = {}
    for side, sign in (("Left", 1.0), ("Right", -1.0)):
        shoulder = _matrix_from_skeleton(skeleton, f"mixamorig:{side}Arm")[:3, 3]
        delta = points - shoulder
        mask = ((sign * delta[:, 0] > 0.03 * height) & (points[:, 1] > hips[1])
                & (points[:, 1] < shoulder[1] + 0.05 * height))
        if np.count_nonzero(mask) < 64:
            continue
        candidates = delta[mask]; planar = np.linalg.norm(candidates[:, :2], axis=1)
        outer = candidates[planar >= np.quantile(planar, 0.98)]
        direction = outer.mean(axis=0)
        if abs(direction[0]) < 0.08 * height:
            continue
        result[f"source{side}ArmDeg"] = float(math.degrees(
            math.atan2(abs(direction[0]), max(abs(direction[1]), 1e-12))))
    if len(result) == 2:
        body_angle = float(skeleton.get("restPose", {}).get("armAngleDeg", 0.0))
        result["bodyArmDeg"] = body_angle
        result["leftResidualDeg"] = result["sourceLeftArmDeg"] - body_angle
        result["rightResidualDeg"] = result["sourceRightArmDeg"] - body_angle
        return result
    return {}


def align_landmarks(positions: np.ndarray, normals: np.ndarray | None, body: np.ndarray,
                    skeleton: dict[str, Any], kind: str,
                    skull_profile: dict[str, Any] | None = None) -> tuple[np.ndarray, np.ndarray | None, dict[str, Any]]:
    """无骨架整身壳的语义对齐；水平 PCA 解连续偏航，再解尺度与位置。"""
    source = np.asarray(positions, dtype=np.float64); body = np.asarray(body, dtype=np.float64)
    source_height = float(np.ptp(source[:, 1]))
    if source_height <= 1e-9:
        raise GarmentError("源资产高度为零")
    if kind == "hair":
        if skull_profile is None:
            raise GarmentError("hair 对齐必须提供 skull_profile.json")
        rows = skull_profile["rows"]
        profile_width = 2.0 * max(float(row["radiusXMu"]) for row in rows)
        # 旧马尾是整身壳；先按顶部发腔的横向窄轴估尺度，再把发腔顶挂到
        # 由蒙皮顶点壳导出的 headTop。完整颅骨表的逐行腔体余量在选中候选后核验。
        cap = source[source[:, 1] >= np.quantile(source[:, 1], 0.92)]
        cap_width = min(float(np.ptp(cap[:, axis])) for axis in (0, 2))
        scale = float(profile_width) / max(cap_width, 1e-9)
        head_socket, target = _socket_world(skeleton, "headTop")
        anchor_quantile = 0.995
    else:
        target = np.asarray(skeleton["neckRing"]["centerMu"], dtype=np.float64)
        anchor_quantile = 0.995
        top_y = float(source[source[:, 1] >= np.quantile(source[:, 1], anchor_quantile), 1].mean())
        scale = float(target[1]) / max(top_y - float(source[:, 1].min()), 1e-9)
    _, horizontal_values, horizontal_axes = pca(source[:, (0, 2)])
    if horizontal_values[0] <= 1e-12:
        raise GarmentError("源资产水平投影退化，无法求偏航")
    width_axis = horizontal_axes[0]
    base_yaw = math.degrees(math.atan2(float(width_axis[1]), float(width_axis[0])))
    opposite_yaw = (base_yaw + 360.0) % 360.0 - 180.0
    pca_yaws = (base_yaw, opposite_yaw)
    candidates: list[tuple[float, float, float, np.ndarray, np.ndarray, np.ndarray]] = []
    if kind == "garment":
        # 模板体表直接派生的件已经处于正本坐标；保留 identity 假设，避免再按整身壳
        # 的颈顶/脚底锚点拉伸。是否采用仍由到真实体表的距离评分决定。
        for yaw in pca_yaws:
            rotation = _yaw_matrix(yaw); candidate = source @ rotation.T
            candidates.append((_nearest_vertex_score(candidate, body), 1.0, yaw, candidate, rotation,
                               np.zeros(3, dtype=np.float64)))
    for yaw in pca_yaws:
        rotation = _yaw_matrix(yaw); transformed = scale * (source @ rotation.T)
        top = transformed[transformed[:, 1] >= np.quantile(transformed[:, 1], anchor_quantile)].mean(axis=0)
        translation = target - top
        candidate = transformed + translation
        candidates.append((_nearest_vertex_score(candidate, body), scale, yaw, candidate, rotation, translation))
    _, chosen_scale, yaw, aligned, rotation, translation = min(candidates, key=lambda item: item[0])
    aligned_normals = None if normals is None else _unit(np.asarray(normals) @ rotation.T)
    body_space = (kind == "garment" and chosen_scale == 1.0 and yaw == 0.0
                  and np.allclose(translation, 0.0))
    feet = (0.0 if body_space else abs(float(aligned[:, 1].min()))) if kind == "garment" else None
    top = aligned[aligned[:, 1] >= np.quantile(aligned[:, 1], anchor_quantile)].mean(axis=0)
    report = {
        "method": "landmarks", "scale": chosen_scale, "yawDeg": yaw, "mirrored": False,
        "landmarks": 0, "determinant": 1.0,
        "translationMu": translation.tolist(),
        "bodySpaceIdentity": body_space,
        "residualMu": {"neckTopMu": 0.0 if body_space else float(np.linalg.norm(top - target)),
                       "feetMu": feet},
    }
    sleeve_angles = _sleeve_angles(aligned, skeleton) if kind == "garment" and not body_space else {}
    if sleeve_angles:
        report["poseResidualDeg"] = sleeve_angles
    if kind == "hair":
        head_world = _matrix_from_skeleton(skeleton, skull_profile["bone"])
        local = _transform_points(aligned, np.linalg.inv(head_world))
        row_results = []
        for row in rows:
            delta_y = np.abs(local[:, 1] - float(row["yMu"]))
            width = max(float(skull_profile.get("stepMu", 0.005)) * 0.6, float(np.quantile(delta_y, 0.002)))
            section = local[delta_y <= width]
            radius_x = float(np.quantile(np.abs(section[:, 0] - float(row["centerXMu"])), 0.95))
            radius_z = float(np.quantile(np.abs(section[:, 2] - float(row["centerZMu"])), 0.95))
            row_results.append({"yMu": float(row["yMu"]),
                                "sourceRadiusXMu": radius_x, "sourceRadiusZMu": radius_z,
                                "marginXMu": radius_x - float(row["radiusXMu"]),
                                "marginZMu": radius_z - float(row["radiusZMu"])})
        report["headTop"] = {"bone": head_socket["bone"], "posMu": head_socket["pos"],
                               "worldMu": target.tolist()}
        report["skullFit"] = {"rowsChecked": len(row_results), "profileMaxWidthMu": profile_width,
                                "sourceTopWidthMu": cap_width, "sections": row_results,
                                "minimumCavityMarginMu": float(min(
                                    min(row["marginXMu"], row["marginZMu"]) for row in row_results))}
        report["residualMu"] = {"headTopMu": float(np.linalg.norm(top - target)), "feetMu": None}
    return (aligned.astype(np.float32), None if aligned_normals is None else aligned_normals.astype(np.float32),
            report)


def _effective_bone_children(names: Sequence[str], parents: np.ndarray,
                             points: np.ndarray) -> np.ndarray:
    """为骨长缩放选直接有效子骨；主链优先，否则取最长非 End 子骨。"""
    result = np.full(len(names), -1, dtype=np.int64)
    chain = (("UpLeg", "Leg"), ("Leg", "Foot"), ("Foot", "ToeBase"),
             ("Shoulder", "Arm"), ("Arm", "ForeArm"), ("ForeArm", "Hand"),
             ("Spine", "Spine1"), ("Spine1", "Spine2"), ("Spine2", "Neck"),
             ("Neck", "Head"))
    for index, name in enumerate(names):
        suffix = name.split(":")[-1]
        stem = suffix[4:] if suffix.startswith("Left") else suffix[5:] if suffix.startswith("Right") else suffix
        children = np.flatnonzero(parents == index)
        children = np.asarray([child for child in children if not names[int(child)].endswith("_End")])
        wanted = next((target for source, target in chain if stem == source), None)
        matches = [] if wanted is None else [child for child in children
                                              if names[int(child)].split(":")[-1].endswith(wanted)]
        if matches:
            result[index] = int(matches[0])
        elif len(children):
            lengths = np.linalg.norm(points[children] - points[index], axis=1)
            result[index] = int(children[int(np.argmax(lengths))])
    return result


def align_joints(positions: np.ndarray, normals: np.ndarray | None, source: GLB,
                 skeleton: dict[str, Any], joints: np.ndarray | None = None,
                 weights: np.ndarray | None = None, *, preserve_shape: bool = False
                 ) -> tuple[np.ndarray, np.ndarray | None, dict[str, Any], np.ndarray]:
    """用对称躯干关节作 det=+1 Umeyama，并返回来源 skin slot 到目标 slot 映射。"""
    skin = source.skin(); source_names = [source.json["nodes"][index].get("name", "") for index in skin.joints]
    target_names = skeleton["joints"]; target_index = {name: index for index, name in enumerate(target_names)}
    mapping = np.asarray([target_index.get(name, -1) for name in source_names], dtype=np.int64)
    common = [name for name in target_names if name.split(":")[-1] in ALIGN_BONES and name in source_names]
    required = {"LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg"}
    if len(common) < 6 or not required.issubset({name.split(":")[-1] for name in common}):
        raise GarmentError("自带骨架至少需要 6 个躯干关节，且必须包含左右臂、左右大腿以校验镜像")
    source_nodes = {source.json["nodes"][index].get("name", ""): index for index in skin.joints}
    src = np.asarray([source.world_matrix(source_nodes[name])[:3, 3] for name in common])
    dst = np.asarray([np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T[:3, 3] for name in common])
    fit = umeyama(src, dst, allow_mirror=False)
    if np.linalg.det(fit.rotation) <= 0.0:
        raise GarmentError("关节对齐产生镜像矩阵")
    coarse = np.eye(4); coarse[:3, :3] = fit.scale * fit.rotation; coarse[:3, 3] = fit.translation
    aligned = _transform_points(np.asarray(positions, dtype=np.float64), coarse)
    out_normals = None if normals is None else _transform_normals(np.asarray(normals), coarse)
    pose_angles: dict[str, float] = {}
    length_ratios: dict[str, float] = {}
    if joints is not None and weights is not None:
        source_worlds = np.asarray([source.world_matrix(int(node)) for node in skin.joints])
        target_worlds = np.asarray([_matrix_from_skeleton(skeleton, name) for name in target_names])
        source_points = source_worlds[:, :3, 3]; target_points = target_worlds[:, :3, 3]
        source_slot = {int(node): slot for slot, node in enumerate(skin.joints)}
        source_parents = np.full(len(source_names), -1, dtype=np.int64)
        for parent_node, node in enumerate(source.json.get("nodes", [])):
            if parent_node not in source_slot:
                continue
            for child_node in node.get("children", []):
                if int(child_node) in source_slot:
                    source_parents[source_slot[int(child_node)]] = source_slot[parent_node]
        target_parents = np.asarray(skeleton["parents"], dtype=np.int64)
        source_children = _effective_bone_children(source_names, source_parents, source_points)
        target_children = _effective_bone_children(target_names, target_parents, target_points)
        transforms = np.repeat(np.eye(4)[None, :, :], len(source_names), axis=0)
        for source_slot, target_slot in enumerate(mapping):
            if target_slot < 0:
                continue
            source_world = source_worlds[source_slot]; target_world = target_worlds[int(target_slot)]
            local = np.eye(4); source_child = int(source_children[source_slot])
            target_child = int(target_children[int(target_slot)])
            if (not preserve_shape and source_child >= 0 and target_child >= 0
                    and source_names[source_child] == target_names[target_child]):
                source_vector = source_points[source_child] - source_points[source_slot]
                target_vector = target_points[target_child] - target_points[int(target_slot)]
                source_length = float(np.linalg.norm(source_vector)); target_length = float(np.linalg.norm(target_vector))
                if source_length > 1e-9 and target_length > 1e-9:
                    ratio = target_length / source_length
                    source_axis = source_world[:3, :3].T @ (source_vector / source_length)
                    target_axis = target_world[:3, :3].T @ (target_vector / target_length)
                    local[:3, :3] = _axis_length_map(source_axis, target_axis, ratio)
                    length_ratios[source_names[source_slot]] = ratio
            transforms[source_slot] = target_world @ local @ np.linalg.inv(coarse @ source_world)
            rotation = target_world[:3, :3] @ np.linalg.inv((coarse @ source_world)[:3, :3])
            singular = np.linalg.svd(rotation)[0] @ np.linalg.svd(rotation)[2]
            pose_angles[source_names[source_slot]] = math.degrees(math.acos(np.clip(
                (np.trace(singular) - 1.0) * 0.5, -1.0, 1.0)))
        homogeneous = np.column_stack((aligned, np.ones(len(aligned))))
        posed = np.einsum("nkij,nj->nki", transforms[joints], homogeneous)[..., :3]
        aligned = np.einsum("nk,nki->ni", weights, posed)
        out_normals = None
    residual = {name: float(value) for name, value in zip(common, fit.residuals)}
    return aligned.astype(np.float32), None if out_normals is None else out_normals.astype(np.float32), {
        "method": "joints", "scale": fit.scale, "preserveShape": bool(preserve_shape),
        "yawDeg": math.degrees(math.atan2(fit.rotation[0, 2], fit.rotation[0, 0])),
        "mirrored": fit.mirrored, "landmarks": len(common), "determinant": float(np.linalg.det(fit.rotation)),
        "residualMu": residual, "poseCorrectionDeg": pose_angles, "boneLengthScale": length_ratios,
    }, mapping


def allowed_joint_indices(joint_names: Sequence[str], slot: str) -> np.ndarray:
    """把 slot 白名单展开为模板 skin 下标；名字按冒号后的完整骨名匹配。"""
    stems = SLOT_BONES[slot]; allowed = []
    for index, name in enumerate(joint_names):
        suffix = name.split(":")[-1]
        if any(suffix == stem or suffix == "Left" + stem or suffix == "Right" + stem for stem in stems):
            allowed.append(index)
    if not allowed:
        raise GarmentError(f"slot {slot} 在模板骨架中没有允许关节")
    return np.asarray(allowed, dtype=np.int64)


def _joint_segments(skeleton: dict[str, Any], allowed: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    names = skeleton["joints"]; worlds = np.asarray(
        [np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T for name in names])
    points = worlds[:, :3, 3]; parents = np.asarray(skeleton["parents"], dtype=np.int64)
    starts = points[allowed].copy(); ends = points[allowed].copy()
    allowed_set = set(int(value) for value in allowed)
    for row, joint in enumerate(allowed):
        children = np.flatnonzero(parents == joint)
        usable = [int(child) for child in children if int(child) in allowed_set]
        if usable:
            ends[row] = points[usable].mean(axis=0)
        elif parents[joint] in allowed_set:
            starts[row] = points[int(parents[joint])]
    return starts, ends


def _segment_weights(points: np.ndarray, skeleton: dict[str, Any], allowed: np.ndarray,
                     slot: str) -> tuple[np.ndarray, np.ndarray]:
    """低置信点按到允许关节线段的距离混合；body 的 Hips 给予主导先验。"""
    starts, ends = _joint_segments(skeleton, allowed); direction = ends - starts
    length2 = np.sum(direction * direction, axis=1)
    out_joints = np.zeros((len(points), 4), dtype=np.uint16)
    out_weights = np.zeros((len(points), 4), dtype=np.float32)
    names = skeleton["joints"]
    for begin in range(0, len(points), 8192):
        block = np.asarray(points[begin:begin + 8192], dtype=np.float64)
        delta = block[:, None, :] - starts[None, :, :]
        t = np.divide(np.einsum("nbi,bi->nb", delta, direction), length2[None, :],
                      out=np.zeros((len(block), len(allowed))), where=length2[None, :] > 1e-12)
        closest = starts[None, :, :] + np.clip(t, 0.0, 1.0)[:, :, None] * direction[None, :, :]
        distance = np.linalg.norm(block[:, None, :] - closest, axis=2)
        scores = 1.0 / np.maximum(distance, 0.003) ** 2
        if slot in ("body", "innerBody"):
            suffixes = [names[int(joint)].split(":")[-1] for joint in allowed]
            hips_y = starts[suffixes.index("Hips"), 1] if "Hips" in suffixes else np.median(starts[:, 1])
            shoulder_x = max((abs(starts[i, 0]) for i, value in enumerate(suffixes)
                              if "Shoulder" in value), default=0.16)
            skirt = block[:, 1] < hips_y; sleeve_l = block[:, 0] > shoulder_x; sleeve_r = block[:, 0] < -shoulder_x
            for column, suffix in enumerate(suffixes):
                leg = suffix == "Hips" or "UpLeg" in suffix or suffix.endswith("Leg")
                arm_l = suffix.startswith("Left") and any(value in suffix for value in ("Shoulder", "Arm", "Hand"))
                arm_r = suffix.startswith("Right") and any(value in suffix for value in ("Shoulder", "Arm", "Hand"))
                scores[skirt & ~leg, column] = 0.0
                scores[sleeve_l & ~arm_l, column] = 0.0; scores[sleeve_r & ~arm_r, column] = 0.0
                if suffix == "Hips": scores[skirt, column] *= 3.0
        count = min(4, len(allowed)); top = np.argpartition(scores, -count, axis=1)[:, -count:]
        values = np.take_along_axis(scores, top, axis=1)
        order = np.argsort(values, axis=1)[:, ::-1]; top = np.take_along_axis(top, order, axis=1)
        values = np.take_along_axis(values, order, axis=1); totals = values.sum(axis=1, keepdims=True)
        empty = totals[:, 0] <= 0.0; values[empty, 0] = 1.0; totals[empty, 0] = 1.0
        values /= totals
        out_joints[begin:begin + len(block), :count] = allowed[top]
        out_weights[begin:begin + len(block), :count] = values.astype(np.float32)
    return out_joints, out_weights


def transfer_weights(points: np.ndarray, garment_normals: np.ndarray, surface: SurfaceIndex,
                     body_joints: np.ndarray, body_weights: np.ndarray, skeleton: dict[str, Any],
                     slot: str, faces_garment: np.ndarray | None = None) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """最近三角转移；所有低置信点按到 slot 允许关节线段距离混合。"""
    nearest, bary, face_ids, distances = surface.query(points, reference_normals=garment_normals)
    faces = surface.faces[face_ids]; body_normal = _unit(np.einsum(
        "ni,nij->nj", bary, surface.normals[faces]))
    normal_cos = np.einsum("ij,ij->i", _unit(garment_normals), body_normal)
    diagonal = float(np.linalg.norm(np.ptp(surface.vertices, axis=0)))
    direct = (distances <= 0.05 * diagonal) & (normal_cos >= math.cos(math.radians(30.0)))
    allowed = allowed_joint_indices(skeleton["joints"], slot); allowed_mask = np.zeros(len(skeleton["joints"]), bool)
    allowed_mask[allowed] = True
    result_joints = np.zeros((len(points), 4), dtype=np.uint16)
    result_weights = np.zeros((len(points), 4), dtype=np.float32); filtered = np.zeros(len(points), bool)
    for begin in range(0, len(points), 8192):
        stop = min(begin + 8192, len(points)); tri = faces[begin:stop]; bar = bary[begin:stop]
        source_joints = body_joints[tri].reshape(stop - begin, 12)
        source_weights = (body_weights[tri] * bar[:, :, None]).reshape(stop - begin, 12)
        dense = np.zeros((stop - begin, len(skeleton["joints"])), dtype=np.float32)
        rows = np.repeat(np.arange(stop - begin), 12); np.add.at(dense, (rows, source_joints.ravel()), source_weights.ravel())
        filtered[begin:stop] = np.any((dense > 1e-7) & ~allowed_mask[None, :], axis=1)
        dense[:, ~allowed_mask] = 0.0; total = dense.sum(axis=1)
        usable = direct[begin:stop] & (total > 1e-8)
        if np.any(usable):
            top = np.argpartition(dense[usable], -4, axis=1)[:, -4:]
            values = np.take_along_axis(dense[usable], top, axis=1)
            order = np.argsort(values, axis=1)[:, ::-1]; top = np.take_along_axis(top, order, axis=1)
            values = np.take_along_axis(values, order, axis=1); values /= values.sum(axis=1, keepdims=True)
            rows_out = np.flatnonzero(usable) + begin
            result_joints[rows_out] = top.astype(np.uint16); result_weights[rows_out] = values
    direct_count = int(np.count_nonzero(direct))
    seed_count = int(np.count_nonzero(np.sum(result_weights, axis=1)))
    far_threshold_mu = mm_to_mu(100.0, float(skeleton["mPerMu"]))
    far_low = (~direct) & (distances > far_threshold_mu)
    far_fallback_count = int(np.count_nonzero(far_low))
    low = np.sum(result_weights, axis=1) == 0.0; fallback_count = int(np.count_nonzero(low))
    if np.any(low):
        result_joints[low], result_weights[low] = _segment_weights(points[low], skeleton, allowed, slot)
    result_joints[result_weights <= 0.0] = np.uint16(allowed[0])
    resolved = np.isfinite(result_weights).all(axis=1) & (np.abs(result_weights.sum(axis=1) - 1.0) <= 1e-5)
    stats = {"method": "nearest-triangle-barycentric+low-confidence-joint-segment",
             "highConfidence": float(np.mean(direct)), "highConfidenceVertices": direct_count,
             "directConfidenceVertices": direct_count, "directUsableVertices": seed_count,
             "diffusedVertices": 0,
             "farSemanticFallbackVertices": far_fallback_count,
             "semanticFallbackVertices": fallback_count,
             "farFallbackThresholdMm": 100.0,
             "lowConfidenceVertices": int(len(points) - direct_count),
             "normalizedVertices": int(np.count_nonzero(resolved)),
             "filteredVertices": int(np.count_nonzero(filtered)),
             "maxBones": 4, "jointsAllowed": [skeleton["joints"][int(i)] for i in allowed]}
    return result_joints, result_weights, stats


def transfer_template_weights(points: np.ndarray, faces_garment: np.ndarray, surface: SurfaceIndex,
                              body_joints: np.ndarray, body_weights: np.ndarray,
                              skeleton: dict[str, Any], slot: str, *, smooth_rounds: int = 3
                              ) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """把整件衣物绑定到最近模板面，并在衣物拓扑上平滑稠密权重场。

    与 ``transfer_weights`` 的低置信语义骨段回退不同，本模式是 P2 权重源 B：
    每个顶点都取真实最近模板三角的重心权重，再平滑以避免一条衣片跨骨区时跳变。
    """
    points = np.asarray(points, dtype=np.float64)
    nearest, bary, face_ids, distances = surface.query(points)
    del nearest
    body_faces = surface.faces[face_ids]
    joint_count = len(skeleton["joints"]); allowed = allowed_joint_indices(skeleton["joints"], slot)
    allowed_mask = np.zeros(joint_count, dtype=bool); allowed_mask[allowed] = True
    dense = np.zeros((len(points), joint_count), dtype=np.float32)
    for column in range(3):
        rows = np.repeat(np.arange(len(points)), 4)
        joints = body_joints[body_faces[:, column]]
        values = body_weights[body_faces[:, column]] * bary[:, column, None]
        np.add.at(dense, (rows, joints.ravel()), values.ravel())
    filtered = np.any((dense > 1e-7) & ~allowed_mask[None, :], axis=1)
    dense[:, ~allowed_mask] = 0.0
    tri = np.asarray(faces_garment, dtype=np.int64)
    source = np.concatenate((tri[:, 0], tri[:, 1], tri[:, 2], tri[:, 1], tri[:, 2], tri[:, 0]))
    target = np.concatenate((tri[:, 1], tri[:, 2], tri[:, 0], tri[:, 0], tri[:, 1], tri[:, 2]))
    degree = np.bincount(source, minlength=len(points)).astype(np.float32)[:, None]
    for _ in range(max(0, smooth_rounds)):
        summed = np.zeros_like(dense); np.add.at(summed, source, dense[target])
        average = np.divide(summed, degree, out=dense.copy(), where=degree > 0)
        dense = .5 * dense + .5 * average
        dense[:, ~allowed_mask] = 0.0
    totals = dense.sum(axis=1); low = totals <= 1e-8
    if np.any(low):
        fallback_joints, fallback_weights = _segment_weights(points[low], skeleton, allowed, slot)
        dense[low] = 0.0
        rows = np.repeat(np.flatnonzero(low), 4)
        np.add.at(dense, (rows, fallback_joints.ravel()), fallback_weights.ravel())
        totals = dense.sum(axis=1)
    dense /= totals[:, None]
    top = np.argpartition(dense, -4, axis=1)[:, -4:]
    values = np.take_along_axis(dense, top, axis=1)
    order = np.argsort(values, axis=1)[:, ::-1]
    top = np.take_along_axis(top, order, axis=1); values = np.take_along_axis(values, order, axis=1)
    values /= values.sum(axis=1, keepdims=True)
    return top.astype(np.uint16), values.astype(np.float32), {
        "method": "template-nearest-triangle-barycentric+topology-smooth",
        "smoothRounds": int(smooth_rounds), "templateVertices": int(len(points)),
        "semanticFallbackVertices": int(np.count_nonzero(low)),
        "filteredVertices": int(np.count_nonzero(filtered)), "maxBones": 4,
        "distanceMm": {"p50": float(np.quantile(distances, .5) * skeleton["mPerMu"] * 1000),
                       "p90": float(np.quantile(distances, .9) * skeleton["mPerMu"] * 1000)},
        "jointsAllowed": [skeleton["joints"][int(index)] for index in allowed]}


def filter_existing_weights(joints: np.ndarray, weights: np.ndarray, points: np.ndarray,
                            skeleton: dict[str, Any], slot: str) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """过滤自带骨架的权重；被过滤到空的点采用允许关节线段回退。"""
    allowed = allowed_joint_indices(skeleton["joints"], slot); mask = np.isin(joints, allowed)
    result_w = np.where(mask, weights, 0.0).astype(np.float32); filtered = np.any((weights > 1e-7) & ~mask, axis=1)
    total = result_w.sum(axis=1); valid = total > 1e-8; result_w[valid] /= total[valid, None]
    result_j = joints.astype(np.uint16).copy(); low = ~valid
    if np.any(low): result_j[low], result_w[low] = _segment_weights(points[low], skeleton, allowed, slot)
    result_j[result_w <= 0.0] = np.uint16(allowed[0])
    return result_j, result_w, {"method": "source-skin-filtered+joint-segment-fallback",
        "highConfidence": float(np.mean(valid)), "highConfidenceVertices": int(np.count_nonzero(valid)),
        "lowConfidenceVertices": int(np.count_nonzero(low)), "filteredVertices": int(np.count_nonzero(filtered)),
        "maxBones": 4, "jointsAllowed": [skeleton["joints"][int(i)] for i in allowed]}


def edge_weight_blend(points: np.ndarray, faces: np.ndarray, source_joints: np.ndarray,
                      source_weights: np.ndarray, template_joints: np.ndarray,
                      template_weights: np.ndarray, band_mu: float
                      ) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """开口为模板权重 B，30 mm 内按表面距离线性渐变回源权重 A。"""
    unique, inverse = np.unique(np.round(points, 7), axis=0, return_inverse=True)
    welded_faces = inverse[faces]; boundary, _ = edge_statistics(welded_faces)
    boundary_graph: dict[int, set[int]] = {}
    for left, right in boundary:
        boundary_graph.setdefault(int(left), set()).add(int(right))
        boundary_graph.setdefault(int(right), set()).add(int(left))
    components, seen = [], set()
    for root in sorted(boundary_graph):
        if root in seen: continue
        queue, vertices = [root], []; seen.add(root)
        while queue:
            vertex = queue.pop(); vertices.append(vertex)
            for neighbor in boundary_graph[vertex]:
                if neighbor not in seen: seen.add(neighbor); queue.append(neighbor)
        member = np.asarray(vertices); mask = np.isin(boundary[:, 0], member) & np.isin(boundary[:, 1], member)
        length = np.linalg.norm(unique[boundary[mask, 0]] - unique[boundary[mask, 1]], axis=1).sum()
        components.append((member, float(length), unique[member].mean(axis=0)))
    selected = components
    if len(components) > 4:
        hem = max(components, key=lambda row: row[1])
        substantial = [row for row in components if row[1] >= hem[1] * .07 and row is not hem]
        collar = max(substantial, key=lambda row: row[2][1]); remaining = [row for row in substantial if row is not collar]
        selected = [hem, collar, min(remaining, key=lambda row: row[2][0]),
                    max(remaining, key=lambda row: row[2][0])]
    seeds = np.unique(np.concatenate([row[0] for row in selected]))
    graph: list[list[tuple[int, float]]] = [[] for _ in range(len(unique))]
    edges = np.unique(np.sort(np.concatenate((welded_faces[:, [0, 1]], welded_faces[:, [1, 2]],
                                              welded_faces[:, [2, 0]])), axis=1), axis=0)
    for left, right in edges:
        length = float(np.linalg.norm(unique[left] - unique[right]))
        graph[int(left)].append((int(right), length)); graph[int(right)].append((int(left), length))
    distance = np.full(len(unique), np.inf); queue: list[tuple[float, int]] = []
    for vertex in seeds: distance[vertex] = 0.0; heapq.heappush(queue, (0.0, int(vertex)))
    while queue:
        current, vertex = heapq.heappop(queue)
        if current != distance[vertex] or current >= band_mu: continue
        for neighbor, length in graph[vertex]:
            value = current + length
            if value < distance[neighbor]: distance[neighbor] = value; heapq.heappush(queue, (value, neighbor))
    blend = np.clip(1.0 - distance[inverse] / band_mu, 0.0, 1.0)
    joint_count = int(max(source_joints.max(initial=0), template_joints.max(initial=0))) + 1
    dense = np.zeros((len(points), joint_count), np.float32)
    rows = np.repeat(np.arange(len(points)), 4)
    np.add.at(dense, (rows, source_joints.ravel()), (source_weights * (1 - blend[:, None])).ravel())
    np.add.at(dense, (rows, template_joints.ravel()), (template_weights * blend[:, None]).ravel())
    keep = min(4, joint_count); top = np.argpartition(dense, -keep, axis=1)[:, -keep:]
    values = np.take_along_axis(dense, top, axis=1)
    order = np.argsort(values, axis=1)[:, ::-1]; top = np.take_along_axis(top, order, axis=1)
    values = np.take_along_axis(values, order, axis=1); values /= values.sum(axis=1, keepdims=True)
    if keep < 4:
        top = np.pad(top, ((0, 0), (0, 4 - keep))); values = np.pad(values, ((0, 0), (0, 4 - keep)))
    return top.astype(np.uint16), values.astype(np.float32), {"method": "template-opening-linear-blend",
        "bandMm": None, "openingRings": int(len(selected)),
        "boundaryVertices": int(len(seeds)),
        "blendedVertices": int(np.count_nonzero(blend > 0))}


def remove_body_stub(mesh: Mesh, surface: SurfaceIndex, threshold_mu: float) -> tuple[Mesh, int]:
    """移除贴近体表且反向的三角形；返回重建后的单 primitive 网格。"""
    faces = mesh.indices.reshape(-1, 3).astype(np.int64); centers = mesh.positions[faces].mean(axis=1)
    near, bary, face_ids, distance = surface.query(centers)
    body_normal = _unit(np.einsum("ni,nij->nj", bary, surface.normals[surface.faces[face_ids]]))
    face_normal = _unit(np.cross(mesh.positions[faces[:, 1]] - mesh.positions[faces[:, 0]],
                                 mesh.positions[faces[:, 2]] - mesh.positions[faces[:, 0]]))
    remove = (distance < threshold_mu) & (np.einsum("ij,ij->i", face_normal, body_normal) < 0.0)
    kept = faces[~remove]
    if not len(kept):
        raise GarmentError("--remove-body-stub 删除了全部三角形")
    used = np.unique(kept); remap = np.full(len(mesh.positions), -1, dtype=np.int64); remap[used] = np.arange(len(used))
    def take(value: np.ndarray | None) -> np.ndarray | None:
        return None if value is None else value[used]
    result = Mesh(mesh.positions[used], remap[kept].reshape(-1).astype(np.uint32), take(mesh.normals), take(mesh.uvs),
                  take(mesh.joints), take(mesh.weights), take(mesh.regions), np.array([0]),
                  [PrimitiveRange(0, len(used), 0, kept.size, 0)], mesh.name)
    return result, int(np.count_nonzero(remove))


def _triangle_metrics(before: np.ndarray, after: np.ndarray, faces: np.ndarray
                      ) -> tuple[int, int, float, int]:
    """按全部原始非零面积三角和全部有效原始边计算拓扑门禁。"""
    old = before[faces]; new = after[faces]
    old_n = np.cross(old[:, 1] - old[:, 0], old[:, 2] - old[:, 0])
    new_n = np.cross(new[:, 1] - new[:, 0], new[:, 2] - new[:, 0])
    old_area = np.linalg.norm(old_n, axis=1); new_area = np.linalg.norm(new_n, axis=1)
    original_nonzero = np.isfinite(old_area) & (old_area > 0.0)
    output_degenerate = original_nonzero & (~np.isfinite(new_area) | (new_area == 0.0))
    flipped_mask = original_nonzero & ~output_degenerate & (
        np.einsum("ij,ij->i", old_n, new_n) < 0.0)
    flipped = int(np.count_nonzero(flipped_mask))
    old_edges = np.linalg.norm(old[:, [1, 2, 0]] - old[:, [0, 1, 2]], axis=2)
    new_edges = np.linalg.norm(new[:, [1, 2, 0]] - new[:, [0, 1, 2]], axis=2)
    valid_edges = np.isfinite(old_edges) & (old_edges > 0.0)
    ratio = np.divide(new_edges, old_edges, out=np.ones_like(new_edges), where=valid_edges)
    edge_ok = ~valid_edges | (np.isfinite(ratio) & (ratio >= 0.7) & (ratio <= 1.4))
    considered = original_nonzero
    good = considered & np.all(edge_ok, axis=1)
    total = int(np.count_nonzero(considered))
    good_ratio = float(np.count_nonzero(good) / total) if total else 1.0
    return flipped, int(total - np.count_nonzero(good)), good_ratio, int(np.count_nonzero(output_degenerate))


def verify_serialized_topology(before: np.ndarray, after: np.ndarray, faces: np.ndarray,
                               stats: dict[str, Any], allow_draft: bool) -> None:
    """以实际写出的 float32 POSITION 覆盖拓扑统计并执行严格门禁。"""
    flipped, outliers, good_ratio, degenerate = _triangle_metrics(before, after, faces)
    stats.update({"flippedTriangles": flipped, "degenerateTriangles": degenerate,
                  "stretchOutliers": outliers, "stretchWithinRatio": good_ratio})
    stats["topologyPassed"] = flipped == 0 and degenerate == 0 and good_ratio >= 0.99
    stats["passed"] = bool(stats["clearancePassed"] and stats["topologyPassed"])
    stats["draft"] = not stats["passed"]
    if not stats["passed"] and not allow_draft:
        raise GarmentGateError("序列化拓扑门禁失败："
                               f"flipped={flipped}, degenerate={degenerate}, "
                               f"stretchGood={good_ratio:.6f}")


def _smooth_push(displacement: np.ndarray, faces: np.ndarray, active: np.ndarray,
                 normals: np.ndarray, required: np.ndarray,
                 *, enforce_clearance: bool = False) -> np.ndarray:
    """平滑位移场；远端零位移作锚，待修顶点始终保留法向安全量。"""
    tri = np.asarray(faces, dtype=np.int64)
    source = np.concatenate((tri[:, 0], tri[:, 1], tri[:, 2], tri[:, 1], tri[:, 2], tri[:, 0]))
    target = np.concatenate((tri[:, 1], tri[:, 2], tri[:, 0], tri[:, 0], tri[:, 1], tri[:, 2]))
    # 只扩一环并平滑真实位移向量。深层 max-envelope 会把单个异常最近面的大位移
    # 传播数个环，反而在贴身高密网格上制造翻面。
    support = active.copy()
    np.logical_or.at(support, source, active[target])
    result = np.asarray(displacement, dtype=np.float64).copy()
    degree = np.bincount(source, minlength=len(result)).astype(np.float64)
    for _ in range(1):
        summed = np.zeros_like(result)
        np.add.at(summed, source, result[target])
        average = np.divide(summed, degree[:, None], out=np.zeros_like(result),
                            where=degree[:, None] > 0.0)
        result[active] = 0.5 * result[active] + 0.5 * average[active]
        fringe = support & ~active
        result[fringe] = 0.5 * average[fringe]
        result[~support] = 0.0
    projection = np.einsum("ij,ij->i", result, normals)
    if enforce_clearance:
        # 保留一半法向短缺，余量由下一轮真实最近面复查继续收敛；一次补满会
        # 在法线不连续/薄层切换处形成尖峰并翻面。
        shortfall = np.maximum(required - projection, 0.0)
        result[active] += 0.5 * shortfall[active, None] * normals[active]
    return result


def _topology_metrics(before: np.ndarray, after: np.ndarray, faces: np.ndarray
                      ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """返回逐面翻转、输出退化及边长越界掩码。"""
    old = before[faces]; new = after[faces]
    old_n = np.cross(old[:, 1] - old[:, 0], old[:, 2] - old[:, 0])
    new_n = np.cross(new[:, 1] - new[:, 0], new[:, 2] - new[:, 0])
    original_nonzero = np.linalg.norm(old_n, axis=1) > 0.0
    output_degenerate = original_nonzero & (np.linalg.norm(new_n, axis=1) == 0.0)
    flipped = original_nonzero & ~output_degenerate & (
        np.einsum("ij,ij->i", old_n, new_n) < 0.0)
    old_edges = np.linalg.norm(old[:, [1, 2, 0]] - old[:, [0, 1, 2]], axis=2)
    new_edges = np.linalg.norm(new[:, [1, 2, 0]] - new[:, [0, 1, 2]], axis=2)
    valid = old_edges > 0.0
    ratio = np.divide(new_edges, old_edges, out=np.ones_like(new_edges), where=valid)
    stretch = original_nonzero & np.any(valid & ((ratio < 0.7) | (ratio > 1.4)), axis=1)
    return flipped, output_degenerate, stretch


def _topology_safe_displacement(original: np.ndarray, current: np.ndarray,
                                displacement: np.ndarray, faces: np.ndarray, *,
                                preserve_stretch: bool = False) -> tuple[np.ndarray, int]:
    """按最终 float32 几何回溯新翻面/退化；可同时阻止新边长越界。"""
    limited = np.asarray(displacement, dtype=np.float64).copy(); passes = 0
    tri = np.asarray(faces, dtype=np.int64)
    moved = np.linalg.norm(limited, axis=1) > 1e-12
    affected = np.any(moved[tri], axis=1)
    if not np.any(affected):
        return limited, 0
    local_faces = tri[affected]
    old_flip, old_degenerate, old_stretch = _topology_metrics(original, current, local_faces)
    for passes in range(24):
        candidate = (current + limited).astype(np.float32).astype(np.float64)
        flip, degenerate, stretch = _topology_metrics(original, candidate, local_faces)
        newly_bad = (flip & ~old_flip) | (degenerate & ~old_degenerate)
        if preserve_stretch:
            newly_bad |= stretch & ~old_stretch
        if not np.any(newly_bad):
            return candidate - current, passes
        bad_faces = local_faces[newly_bad]
        magnitudes = np.linalg.norm(limited[bad_faces], axis=2)
        owners = bad_faces[np.arange(len(bad_faces)), np.argmax(magnitudes, axis=1)]
        limited[np.unique(owners)] *= 0.5
    # 极薄三角在有限精度下可能即使连续折半仍跨过零面积。不得把这种失败步长
    # 带入 current；回滚所有仍受影响三角的本轮位移，再复查相邻三角。此操作
    # 仍属于当前 rounds[] 记录的步长选择，既不查询体表，也不在 --iters 外修形。
    for _ in range(24):
        candidate = (current + limited).astype(np.float32).astype(np.float64)
        flip, degenerate, stretch = _topology_metrics(original, candidate, local_faces)
        newly_bad = (flip & ~old_flip) | (degenerate & ~old_degenerate)
        if preserve_stretch:
            newly_bad |= stretch & ~old_stretch
        if not np.any(newly_bad):
            return candidate - current, passes + 1
        limited[np.unique(local_faces[newly_bad])] = 0.0
    return np.zeros_like(limited), passes + 1


def push_out(positions: np.ndarray, faces: np.ndarray, surface: SurfaceIndex, push_mu: float,
             iters: int, *, verify_only: bool = False,
             allow_draft: bool = False,
             reference_normals: np.ndarray | None = None,
             preserve_shape: bool = False) -> tuple[np.ndarray, dict[str, Any]]:
    """逐点沿最近体表法线推离，平滑位移场并在每轮后复查。"""
    # 后续 GLB POSITION 固定写 float32；从首次查询起就在该表示上工作，避免
    # 内存 float64 通过门禁、序列化后却翻面的口径分裂。
    current = np.asarray(positions, dtype=np.float32).astype(np.float64)
    original = current.copy()
    tri = np.asarray(faces, dtype=np.int64); tolerance = max(1e-7, push_mu * 1e-4)
    rounds: list[dict[str, Any]] = []
    round_limit = 0 if verify_only else iters
    source_normals = (vertex_normals(original, tri) if reference_normals is None
                      else _unit(np.asarray(reference_normals, dtype=np.float64)))
    if len(source_normals) != len(original):
        raise GarmentError("reference_normals 与 positions 数量不同")
    # 第 0 次查询给第一轮使用；每轮的推后复查直接成为下一轮输入。这样每轮
    # 恰有一次新的几何查询，既满足逐轮复查，也不重复查询同一批 current。
    nearest, bary, face_ids, distances = surface.query(current)
    normals = _unit(np.einsum("ni,nij->nj", bary, surface.normals[surface.faces[face_ids]]))
    signed = _signed_distance_from_query(current, nearest, normals, distances)
    for _round in range(round_limit):
        active = signed < push_mu - tolerance
        if not np.any(active):
            break
        required = np.maximum(push_mu + tolerance + 5e-6 - signed, 0.0)
        raw = np.zeros_like(current); raw[active] = required[active, None] * normals[active]
        displacement = _smooth_push(raw, tri, active, normals, required, enforce_clearance=True)
        displacement, topology_halvings = _topology_safe_displacement(
            original, current, displacement, tri, preserve_stretch=preserve_shape)
        current = (current + displacement).astype(np.float32).astype(np.float64)
        moved_mask = np.linalg.norm(displacement, axis=1) > 1e-12
        check_nearest = nearest.copy(); check_bary = bary.copy(); check_faces = face_ids.copy()
        check_normals = normals.copy(); checked = signed.copy()
        if np.any(moved_mask):
            moved_nearest, moved_bary, moved_faces, moved_distances = surface.query(current[moved_mask])
            moved_normals = _unit(np.einsum(
                "ni,nij->nj", moved_bary, surface.normals[surface.faces[moved_faces]]))
            check_nearest[moved_mask] = moved_nearest; check_bary[moved_mask] = moved_bary
            check_faces[moved_mask] = moved_faces; check_normals[moved_mask] = moved_normals
            checked[moved_mask] = _signed_distance_from_query(
                current[moved_mask], moved_nearest, moved_normals, moved_distances)
        rounds.append({"inside": int(np.count_nonzero(signed < 0.0)),
                       "insufficientMargin": int(np.count_nonzero(active)),
                       "minimumDistanceMu": float(signed.min(initial=np.inf)),
                       "maximumCorrectionMu": float(required.max(initial=0.0)),
                       "moved": int(np.count_nonzero(np.linalg.norm(displacement, axis=1) > 1e-12)),
                       "topologyStepHalvings": topology_halvings,
                       "afterInside": int(np.count_nonzero(checked < 0.0)),
                       "afterInsufficientMargin": int(np.count_nonzero(checked < push_mu - tolerance))})
        nearest, bary, face_ids, normals, signed = (
            check_nearest, check_bary, check_faces, check_normals, checked)
    # signed 始终来自初查或最后一轮的推后复查；这里只做门禁，不再查询或移动。
    residual = int(np.count_nonzero(signed < 0.0))
    insufficient = int(np.count_nonzero(signed < push_mu - tolerance))
    flipped, outliers, good_ratio, degenerate = _triangle_metrics(original, current, tri)
    topology_passed = flipped == 0 and degenerate == 0 and good_ratio >= 0.99
    clearance_passed = residual == 0 and insufficient == 0
    passed = clearance_passed and topology_passed
    if not passed and not allow_draft:
        raise GarmentGateError("bind 推离门禁失败："
                               f"inside={residual}, margin={insufficient}, flipped={flipped}, "
                               f"stretchGood={good_ratio:.6f}")
    return current.astype(np.float32), {"rounds": rounds, "residual": residual,
                                         "insufficientMargin": insufficient, "flippedTriangles": flipped,
                                         "degenerateTriangles": degenerate,
                                         "stretchOutliers": outliers, "stretchWithinRatio": good_ratio,
                                         "minimumDistanceMu": float(signed.min(initial=np.inf)),
                                         "centroidDriftMu": float(np.linalg.norm(
                                             current.mean(axis=0) - original.mean(axis=0))),
                                         "passed": passed, "topologyPassed": topology_passed,
                                         "clearancePassed": clearance_passed, "draft": not passed,
                                         "preserveShape": bool(preserve_shape),
                                         "movedVertices": int(np.count_nonzero(
                                             np.linalg.norm(current - original, axis=1) > 1e-9))}


def _smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0); return x * x * (3.0 - 2.0 * x)


class PseudoNormalSign:
    """带符号距离的稳健符号（角度加权伪法向，Bærentzen & Aanæs 2005）：最近点在面内取面法向、在边上取两侧面
    法向之和、在顶点上取按角度加权的邻面法向；封闭网格上符号严格正确。插值顶点法向在胸下 / 腋下这类凹处会把
    离体 5 cm 的衣物点判成"体内 5 cm"（E2b 实测：射线奇偶为体外的 3 个点），体表位移场便每轮把那片布再往外推。"""

    def __init__(self, surface: SurfaceIndex) -> None:
        faces = surface.faces; tri = surface.triangles
        normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
        self.face_normals = _unit(normals)
        corner_angles = np.zeros((len(faces), 3))
        for k in range(3):
            a = tri[:, (k + 1) % 3] - tri[:, k]; b = tri[:, (k + 2) % 3] - tri[:, k]
            cosine = np.einsum("ij,ij->i", _unit(a), _unit(b))
            corner_angles[:, k] = np.arccos(np.clip(cosine, -1.0, 1.0))
        self.vertex_normals = np.zeros((len(surface.vertices), 3))
        for k in range(3):
            np.add.at(self.vertex_normals, faces[:, k], corner_angles[:, k, None] * self.face_normals)
        self.vertex_normals = _unit(self.vertex_normals)
        edges = np.sort(np.stack((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]), axis=1).reshape(-1, 2), axis=1)
        self.edge_keys, inverse = np.unique(edges, axis=0, return_inverse=True)
        self.edge_of = inverse.reshape(-1, 3)                     # 面 f 的边 k：角 k → 角 k+1
        self.edge_normals = np.zeros((len(self.edge_keys), 3))
        np.add.at(self.edge_normals, self.edge_of.reshape(-1), np.repeat(self.face_normals, 3, axis=0))
        self.edge_normals = _unit(self.edge_normals)
        self.faces = faces

    def signed(self, points: np.ndarray, nearest: np.ndarray, bary: np.ndarray, face_ids: np.ndarray,
               distances: np.ndarray, tolerance: float = 1e-7) -> np.ndarray:
        normal = self.face_normals[face_ids].copy()
        zero = bary <= tolerance
        on_vertex = zero.sum(axis=1) == 2; on_edge = zero.sum(axis=1) == 1
        if np.any(on_vertex):
            corner = np.argmax(bary[on_vertex], axis=1)
            normal[on_vertex] = self.vertex_normals[self.faces[face_ids[on_vertex], corner]]
        if np.any(on_edge):
            # 重心坐标为 0 的角对着的边：角 k 为 0 → 边 (k+1, k+2) = 边序号 (k+1) % 3
            missing = np.argmax(zero[on_edge], axis=1)
            normal[on_edge] = self.edge_normals[self.edge_of[face_ids[on_edge], (missing + 1) % 3]]
        sign = np.sign(np.einsum("ij,ij->i", np.asarray(points) - nearest, normal)); sign[sign == 0.0] = 1.0
        return sign * np.asarray(distances, dtype=np.float64)


class DrapeRelaxer:
    """限拉伸松弛（投影动力学弹簧，Liu et al. 2013 "Fast simulation of mass-spring systems"）。

    布料按位置焊接（UV 缝的重复点合一，否则拉伸摊不过缝），每条边的目标长度夹到静止长度的
    [DRAPE_STRAIN_MIN, DRAPE_STRAIN_MAX] 倍，再整体解一次拉普拉斯方程组（矩阵只分解一次）。只拉回超限的边：
    胸前被体表位移场竖直拉长的布由此把胸下的布往上、往前带，形成垂坠，而不是在胸下收回体表。
    不做碰撞（逐点碰撞投影让相邻点沿不同法向外推，是折面的主要来源），穿入交给下一轮体表位移场。
    每步对照对齐件（静止形状）查翻面：新翻面的顶点以 DRAPE_PIN 强锚定钉在上一步位置、重新分解再解，
    邻点随之平滑让开；DRAPE_PIN_ATTEMPTS 次后仍有新翻面则停止本次松弛。"""

    def __init__(self, rest: np.ndarray, faces: np.ndarray) -> None:
        from scipy.sparse import coo_matrix, identity
        from scipy.sparse.linalg import splu
        rest = np.asarray(rest, dtype=np.float64); faces = np.asarray(faces, dtype=np.int64)
        _, self.first, inverse = np.unique(rest, axis=0, return_index=True, return_inverse=True)
        self.inverse = inverse.reshape(-1)
        welded = self.inverse[faces]
        edges = np.sort(np.concatenate((welded[:, [0, 1]], welded[:, [1, 2]], welded[:, [2, 0]])), axis=1)
        edges = np.unique(edges[edges[:, 0] != edges[:, 1]], axis=0)
        self.edges = edges; rest_welded = rest[self.first]
        self.rest_lengths = np.linalg.norm(rest_welded[edges[:, 1]] - rest_welded[edges[:, 0]], axis=1)
        count = len(self.first); ones = np.ones(len(edges))
        self.laplacian = coo_matrix((np.concatenate((ones, ones, -ones, -ones)),
                                     (np.concatenate((edges[:, 0], edges[:, 1], edges[:, 0], edges[:, 1])),
                                      np.concatenate((edges[:, 0], edges[:, 1], edges[:, 1], edges[:, 0])))),
                                    shape=(count, count)).tocsc()
        self.anchor = DRAPE_ANCHOR * float(np.mean(self.laplacian.diagonal()))
        self.solver = splu((self.laplacian + self.anchor * identity(count, format="csc")).tocsc())

    def relax(self, current: np.ndarray, original: np.ndarray, faces: np.ndarray, iterations: int
              ) -> tuple[np.ndarray, dict[str, int]]:
        from scipy.sparse import diags
        from scipy.sparse.linalg import splu
        x = np.asarray(current, dtype=np.float64)[self.first].copy(); anchor = x.copy()
        old_flip, _, _ = _topology_metrics(original, original, faces)
        frozen = np.zeros(len(x), bool); done = 0; solver = self.solver
        pin = DRAPE_PIN * float(np.mean(self.laplacian.diagonal()))
        for _ in range(iterations):
            vectors = x[self.edges[:, 1]] - x[self.edges[:, 0]]
            lengths = np.linalg.norm(vectors, axis=1)
            target = np.clip(lengths, DRAPE_STRAIN_MIN * self.rest_lengths, DRAPE_STRAIN_MAX * self.rest_lengths)
            spring = vectors * (target / np.maximum(lengths, 1e-30))[:, None]
            base = self.anchor * anchor
            np.add.at(base, self.edges[:, 1], spring); np.add.at(base, self.edges[:, 0], -spring)
            for _attempt in range(DRAPE_PIN_ATTEMPTS):
                # 新翻面的顶点钉在上一步位置（强锚定进方程重解）：邻点随之平滑让开，而不是只把翻面点硬拉回去。
                rhs = base + (pin * frozen)[:, None] * x
                solved = np.column_stack([solver.solve(rhs[:, axis]) for axis in range(3)])
                candidate = solved[self.inverse].astype(np.float32).astype(np.float64)
                flip, degenerate, _ = _topology_metrics(original, candidate, faces)
                bad = (flip & ~old_flip) | degenerate
                if not np.any(bad): break
                frozen[np.unique(self.inverse[faces[bad]])] = True
                solver = splu((self.laplacian + diags(self.anchor + pin * frozen)).tocsc())
            else:
                break
            x = solved; done += 1
        return x[self.inverse].astype(np.float32).astype(np.float64), {"iterations": done,
                                                                      "frozenVertices": int(np.count_nonzero(frozen))}


def volume_push(positions: np.ndarray, faces: np.ndarray, surface: SurfaceIndex, push_mu: float,
                m_per_mu: float, *, sigma_mm: float = VOLUME_SIGMA_MM, rounds: int = VOLUME_ROUNDS,
                allow_draft: bool = False) -> tuple[np.ndarray, dict[str, Any]]:
    """体表位移场推离 + 限拉伸垂坠（``--push-mode volume``，E2b）。

    逐点推离把交领重叠的几层布各推各的：模板胸部顶穿 Tripo 平胸衣物达 5 cm 时，内层要外移 5 cm、外层不必动，
    内层便从外层穿出、折出翻面。这里先把各点所需外移量落到体表节点（体素抽样的体表顶点）上，同一节点上方
    各层取最大；再以 3D 高斯核把节点位移 D(b)·n(b) 插值成空间平滑场 V(x) = ΣK(x−b)D(b)n(b) / ΣK(x−b)。
    贴体一侧该场沿法向几乎不变（平面上严格不变），重叠的几层布取同一场值整体平移，层序与层间距不变；离体
    VOLUME_NEAR_MM → VOLUME_FAR_MM 渐隐到 0（宽松的袖口 / 下摆不动）。核宽 σ 逐轮乘 VOLUME_DECAY 收窄到
    VOLUME_SIGMA_MIN_MM；单轮外移量封顶 VOLUME_STEP_SIGMA·σ。

    只往外推时胸前的布被竖直拉长 1.5–3.6 倍（胸高点外移 5 cm、胸下的布仍贴着胸下体表）。推完后交替
    DRAPE_CYCLES 次：限拉伸松弛（DrapeRelaxer，胸下的布被带向前形成垂坠）→ 体表位移场再推 DRAPE_PUSH_ROUNDS 轮
    （松弛带进身体的部分成层地推出来）。两步都对照对齐件查翻面：位移场在新翻面顶点周围按高斯局部压低场，
    松弛把新翻面顶点钉住重解。穿入的符号用角度加权伪法向（PseudoNormalSign），凹处不误判；其余门禁口径与
    ``push_out`` 相同。"""
    unit = 1.0 / (1000.0 * m_per_mu)
    current = np.asarray(positions, dtype=np.float32).astype(np.float64)
    original = current.copy(); tri = np.asarray(faces, dtype=np.int64)
    tolerance = max(1e-7, push_mu * 1e-4)
    voxel = VOLUME_NODE_MM * unit
    _, first = np.unique(np.floor(surface.vertices / voxel).astype(np.int64), axis=0, return_index=True)
    nodes = surface.vertices[first]; node_normals = surface.normals[first]
    node_tree = cKDTree(nodes)
    old_flip, _, _ = _topology_metrics(original, original, tri)
    records: list[dict[str, Any]] = []

    sign = PseudoNormalSign(surface)

    def measure(points: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        nearest, bary, face_ids, distances = surface.query(points)
        return nearest, distances, sign.signed(points, nearest, bary, face_ids, distances)

    def push_round(current: np.ndarray, sigma: float, stage: str) -> tuple[np.ndarray, bool]:
        nearest, distances, signed = measure(current)
        active = signed < push_mu - tolerance
        if not np.any(active): return current, False
        need = np.minimum(np.maximum(push_mu + tolerance + 5e-6 - signed, 0.0), VOLUME_STEP_SIGMA * sigma)
        lists = node_tree.query_ball_point(nearest[active], 1.5 * voxel, workers=-1)
        counts = np.fromiter((len(row) for row in lists), dtype=np.int64, count=len(lists))
        demand = np.zeros(len(nodes))
        if counts.sum():
            np.maximum.at(demand, np.concatenate(lists).astype(np.int64), np.repeat(need[active], counts))
        hot = demand > 0.0
        field = np.zeros_like(current)
        if np.any(hot):
            reach, _ = cKDTree(nodes[hot]).query(current, distance_upper_bound=3.0 * sigma, workers=-1)
            candidates = np.flatnonzero(np.isfinite(reach))
            for chunk in np.array_split(candidates, max(1, len(candidates) // 2048)):
                if not len(chunk): continue
                neighbours = node_tree.query_ball_point(current[chunk], 3.0 * sigma, workers=-1)
                sizes = np.fromiter((len(row) for row in neighbours), dtype=np.int64, count=len(chunk))
                if not sizes.sum(): continue
                owners = np.repeat(np.arange(len(chunk)), sizes); ids = np.concatenate(neighbours).astype(np.int64)
                kernel = np.exp(-np.sum((current[chunk][owners] - nodes[ids]) ** 2, axis=1) / (2.0 * sigma * sigma))
                numerator = np.zeros((len(chunk), 3)); denominator = np.zeros(len(chunk))
                np.add.at(numerator, owners, (kernel * demand[ids])[:, None] * node_normals[ids])
                np.add.at(denominator, owners, kernel)
                field[chunk] = np.divide(numerator, denominator[:, None], out=np.zeros_like(numerator),
                                         where=denominator[:, None] > 0.0)
        field *= (1.0 - _smoothstep((distances - VOLUME_NEAR_MM * unit)
                                    / ((VOLUME_FAR_MM - VOLUME_NEAR_MM) * unit)))[:, None]
        # 新翻面只在其顶点周围按高斯（σ/2）把场压低，别处照推；连续 8 次仍有新翻面才整体折半（单个折角就
        # 让整体步长折半到 0 时，其余几百个点也跟着停推）。
        step = 1.0; halvings = 0; damped: set[int] = set(); damping = np.ones(len(current))
        for attempt in range(16):
            candidate = (current + step * damping[:, None] * field).astype(np.float32).astype(np.float64)
            flip, degenerate, _ = _topology_metrics(original, candidate, tri)
            bad = (flip & ~old_flip) | degenerate
            if not np.any(bad): break
            if attempt < 8:
                fresh = [int(v) for v in np.unique(tri[bad]) if int(v) not in damped] or [int(v) for v in np.unique(tri[bad])]
                damped.update(fresh)
                near = cKDTree(current[fresh]).query(current, distance_upper_bound=1.5 * sigma, workers=-1)[0]
                damping *= np.where(np.isfinite(near), 1.0 - np.exp(-near ** 2 / (2.0 * (0.5 * sigma) ** 2)), 1.0)
            else:
                step *= 0.5; halvings += 1
        else:
            candidate = current
        moved = float(np.linalg.norm(candidate - current, axis=1).max(initial=0.0))
        records.append({"stage": stage, "sigmaMm": sigma / unit, "insufficientMargin": int(np.count_nonzero(active)),
                        "inside": int(np.count_nonzero(signed < 0.0)), "minimumDistanceMu": float(signed.min(initial=np.inf)),
                        "maximumDemandMu": float(demand.max(initial=0.0)), "hotNodes": int(np.count_nonzero(hot)),
                        "maximumMoveMu": moved, "stepHalvings": halvings, "dampedVertices": len(damped)})
        return candidate, moved > 0.0

    for round_index in range(rounds):
        sigma = max(sigma_mm * VOLUME_DECAY ** round_index, VOLUME_SIGMA_MIN_MM) * unit
        current, moved = push_round(current, sigma, "push")
        if not moved: break
    drape: list[dict[str, Any]] = []
    relaxer = DrapeRelaxer(original, tri) if DRAPE_CYCLES > 0 else None
    for cycle in range(DRAPE_CYCLES if relaxer is not None else 0):
        relaxed, relax_stats = relaxer.relax(current, original, tri, DRAPE_RELAX_ITERS)
        current = relaxed
        for _ in range(DRAPE_PUSH_ROUNDS):
            current, moved = push_round(current, VOLUME_SIGMA_MIN_MM * unit, f"drape{cycle}")
            if not moved: break
        _, _, good, _ = _triangle_metrics(original, current, tri)
        drape.append({**relax_stats, "stretchWithinRatio": good})
    _, _, signed = measure(current)
    residual = int(np.count_nonzero(signed < 0.0))
    insufficient = int(np.count_nonzero(signed < push_mu - tolerance))
    flipped, outliers, good_ratio, degenerate = _triangle_metrics(original, current, tri)
    topology_passed = flipped == 0 and degenerate == 0 and good_ratio >= 0.99
    clearance_passed = residual == 0 and insufficient == 0
    passed = clearance_passed and topology_passed
    if not passed and not allow_draft:
        raise GarmentGateError("体表位移场推离门禁失败："
                               f"inside={residual}, margin={insufficient}, flipped={flipped}, "
                               f"stretchGood={good_ratio:.6f}")
    return current.astype(np.float32), {
        "mode": "volume", "rounds": records, "drape": drape, "residual": residual,
        "insufficientMargin": insufficient, "flippedTriangles": flipped, "degenerateTriangles": degenerate,
        "stretchOutliers": outliers, "stretchWithinRatio": good_ratio,
        "minimumDistanceMu": float(signed.min(initial=np.inf)),
        "centroidDriftMu": float(np.linalg.norm(current.mean(axis=0) - original.mean(axis=0))),
        "passed": passed, "topologyPassed": topology_passed, "clearancePassed": clearance_passed,
        "draft": not passed, "nodes": int(len(nodes)),
        "volume": {"sigmaMm": sigma_mm, "sigmaMinMm": VOLUME_SIGMA_MIN_MM, "decay": VOLUME_DECAY,
                   "nodeMm": VOLUME_NODE_MM, "nearMm": VOLUME_NEAR_MM, "farMm": VOLUME_FAR_MM,
                   "stepSigma": VOLUME_STEP_SIGMA, "roundsLimit": rounds, "drapeCycles": DRAPE_CYCLES,
                   "drapeRelaxIters": DRAPE_RELAX_ITERS, "drapePushRounds": DRAPE_PUSH_ROUNDS,
                   "strainRange": [DRAPE_STRAIN_MIN, DRAPE_STRAIN_MAX], "drapeAnchor": DRAPE_ANCHOR},
        "movedVertices": int(np.count_nonzero(np.linalg.norm(current - original, axis=1) > 1e-9))}


def clear_bind_penetration(positions: np.ndarray, surface: SurfaceIndex, *, max_iters: int = 12
                           ) -> tuple[np.ndarray, dict[str, Any]]:
    """只清理仍在体表内的孤立 bind 顶点，不追求 3 mm 安全距。

    这是 edge-weight 复查的末段：先由 ``push_out`` 做平滑推离，再把领口等
    开口的少量残留沿最近体表法线推到表面外。原版型几何门仍由 validate
    如实报告，本函数不修改或放宽那些门。
    """
    current = np.asarray(positions, dtype=np.float32).astype(np.float64)
    rounds: list[dict[str, Any]] = []
    for _ in range(max_iters):
        nearest, bary, face_ids, distances = surface.query(current)
        normals = _unit(np.einsum("ni,nij->nj", bary, surface.normals[surface.faces[face_ids]]))
        signed = _signed_distance_from_query(current, nearest, normals, distances)
        active = signed < 0.0
        if not np.any(active):
            break
        correction = -signed[active] + 2e-6
        current[active] = (current[active] + correction[:, None] * normals[active]).astype(np.float32)
        rounds.append({"inside": int(np.count_nonzero(active)),
                       "maximumCorrectionMu": float(correction.max(initial=0.0))})
    nearest, bary, face_ids, distances = surface.query(current)
    normals = _unit(np.einsum("ni,nij->nj", bary, surface.normals[surface.faces[face_ids]]))
    signed = _signed_distance_from_query(current, nearest, normals, distances)
    return current.astype(np.float32), {"rounds": rounds,
                                        "residual": int(np.count_nonzero(signed < 0.0))}


def _ray_triangle_cover(points: np.ndarray, directions: np.ndarray, garment: np.ndarray,
                        faces: np.ndarray, max_distance: float) -> np.ndarray:
    """沿体表外法线作 Moller-Trumbore 射线，返回距离内同向衣物三角命中。"""
    triangles = garment[faces]; tree = cKDTree(triangles.mean(axis=1)); result = np.zeros(len(points), bool)
    k = min(24, len(faces))
    for start in range(0, len(points), 4096):
        origins = points[start:start + 4096]; rays = directions[start:start + 4096]
        candidates = np.asarray(tree.query(origins, k=k, workers=-1)[1]).reshape(len(origins), k)
        tri = triangles[candidates]; edge1 = tri[:, :, 1] - tri[:, :, 0]; edge2 = tri[:, :, 2] - tri[:, :, 0]
        ray = rays[:, None, :]; h = np.cross(ray, edge2); determinant = np.einsum("nki,nki->nk", edge1, h)
        same = np.einsum("nki,nki->nk", np.cross(edge1, edge2), ray) > 0.0
        inverse = np.divide(1.0, determinant, out=np.zeros_like(determinant), where=np.abs(determinant) > 1e-10)
        delta = origins[:, None, :] - tri[:, :, 0]
        u = inverse * np.einsum("nki,nki->nk", delta, h); q = np.cross(delta, edge1)
        v = inverse * np.einsum("nki,nki->nk", ray, q)
        distance = inverse * np.einsum("nki,nki->nk", edge2, q)
        hit = same & (u >= 0.0) & (v >= 0.0) & (u + v <= 1.0) & (distance >= 0.0)
        result[start:start + len(origins)] = np.any(hit & (distance <= max_distance), axis=1)
    return result


def hide_regions(garment: np.ndarray, garment_faces: np.ndarray, surface: SurfaceIndex,
                 body_regions: np.ndarray, region_ids: dict[str, int], coverage: float,
                 max_distance_mu: float) -> tuple[list[str], dict[str, float]]:
    """衣物三角最近点、同向法线与体表外射线段共同判定面积覆盖。"""
    occluded = _ray_triangle_cover(surface.vertices, surface.normals, np.asarray(garment),
                                   np.asarray(garment_faces, dtype=np.int64), max_distance_mu)
    areas = np.zeros(len(surface.vertices), dtype=np.float64)
    tri = surface.vertices[surface.faces]
    tri_area = np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1) / 6.0
    for column in range(3): np.add.at(areas, surface.faces[:, column], tri_area)
    ratios = {}
    for name, value in region_ids.items():
        mask = body_regions == value; total = areas[mask].sum()
        ratios[name] = float(areas[mask & occluded].sum() / total) if total > 0 else 0.0
    hidden = [name for name, ratio in ratios.items() if ratio > coverage and name not in NEVER_HIDE]
    return hidden, ratios


def derive_regions(joints: np.ndarray, weights: np.ndarray, skeleton: dict[str, Any]) -> np.ndarray:
    """由最大蒙皮影响关节派生 B1 消费的 u8 `_REGION`。"""
    strongest = joints[np.arange(len(joints)), np.argmax(weights, axis=1)]
    joint_to_region = skeleton["regions"]["jointToRegion"]
    region_ids = skeleton["regions"]["ids"]
    result = np.empty(len(joints), dtype=np.uint8)
    for index, joint in enumerate(strongest):
        name = skeleton["joints"][int(joint)]
        if name not in joint_to_region:
            raise GarmentError(f"关节 {name} 未配置 region")
        result[index] = np.uint8(region_ids[joint_to_region[name]])
    return result


def _base_color(source: GLB) -> tuple[dict[str, Any], list[ImageData]]:
    materials = source.json.get("materials", []); material = materials[0] if materials else {}
    pbr = material.get("pbrMetallicRoughness", {}); texture_info = pbr.get("baseColorTexture")
    config: dict[str, Any] = {"unlit": True, "double_sided": True,
                              "base_color_factor": pbr.get("baseColorFactor", [1, 1, 1, 1]),
                              "name": material.get("name", "DressupUnlit")}
    if texture_info is None:
        return config, []
    texture = source.json.get("textures", [])[int(texture_info["index"])]
    image = source.image(int(texture["source"])); payload = image.data; mime = image.mime_type
    with Image.open(BytesIO(payload)) as decoded:
        decoded.load()
        if decoded.width > 2048 or decoded.height > 2048 or mime != "image/jpeg":
            converted = decoded.convert("RGB"); converted.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
            output = BytesIO(); converted.save(output, format="JPEG", quality=85, optimize=True)
            payload, mime = output.getvalue(), "image/jpeg"
    config["textureImage"] = 0
    return config, [ImageData(payload, mime, image.name)]


def encode_skin_clean_texture(texture: Image.Image, uvs: np.ndarray, faces: np.ndarray,
                              skin_lab_mean: np.ndarray, threshold: float,
                              margin: float = SKIN_REPLACE_MARGIN, attempts: int = SKIN_ENCODE_ATTEMPTS
                              ) -> tuple[bytes, dict[str, Any]]:
    """清理衣物 UV 岛内的肤色纹素并编码成交付用 JPEG（q95）。

    有损编码会把填补色往回拉，所以编码后解码复测；仍有肤色纹素就在解码图上再修、再编码。
    返回最后一次编码的字节与统计（encoded* 为解码复测值）。"""
    from extract_garment import repair_skin_texels
    image, stats = repair_skin_texels(texture, uvs, faces, skin_lab_mean, threshold, margin)
    payload = b""; remaining = 0; attempt = 0
    for attempt in range(1, max(1, attempts) + 1):
        stream = BytesIO(); image.save(stream, format="JPEG", quality=95, optimize=True)
        payload = stream.getvalue()
        with Image.open(BytesIO(payload)) as decoded:
            repaired, check = repair_skin_texels(decoded.convert("RGB"), uvs, faces, skin_lab_mean,
                                                 threshold, margin)
        remaining = int(check["skinTexelsBefore"])
        if remaining == 0 or attempt == attempts:
            break
        image = repaired; stats["replacedTexels"] += int(check["replacedTexels"])
    total = int(stats["referencedTexels"])
    stats.update({"encoding": "image/jpeg q95", "encodeAttempts": attempt, "encodedSkinTexelsAfter": remaining,
                  "encodedSkinRatioAfter": remaining / total if total else 0.0})
    return payload, stats


def _round(value: Any) -> Any:
    if isinstance(value, float): return round(value, 9)
    if isinstance(value, list): return [_round(item) for item in value]
    if isinstance(value, dict): return {key: _round(item) for key, item in value.items()}
    return value


def fit_file(body_path: Path, skeleton_path: Path, garment_path: Path, output_dir: Path,
             kind: str, slot: str, asset_id: str, *, remove_stub: bool = False,
             push_mm: float = 3.0, iters: int = 3, coverage: float = 0.65,
             allow_draft: bool = False, k: int = 16, align_mode: str = "auto",
             notes: Sequence[str] = (), edge_weights: str = "off",
             edge_band_mm: float = 30.0, weight_source: str = "auto",
             weight_smooth_rounds: int = 3, preserve_shape: bool = False,
             clean_skin_texture: bool = False, skin_delta_e: float = 18.0,
             skin_lab_mean: Sequence[float] | None = None, push_mode: str = "vertex",
             volume_sigma_mm: float = VOLUME_SIGMA_MM, volume_rounds: int = VOLUME_ROUNDS) -> dict[str, Any]:
    """执行完整贴合流水线并返回 fit.json 内容。"""
    started = time.perf_counter()
    if (kind not in KINDS or slot not in SLOTS or align_mode not in ALIGN_MODES
            or edge_weights not in EDGE_WEIGHT_MODES or weight_source not in WEIGHT_SOURCE_MODES
            or edge_band_mm <= 0 or weight_smooth_rounds < 0 or skin_delta_e <= 0
            or push_mm < 0 or iters < 0 or push_mode not in PUSH_MODES
            or volume_sigma_mm <= 0 or volume_rounds < 0
            or not 0 <= coverage <= 1 or k < 1):
        raise GarmentError("kind/slot/push-mm/iters/coverage 参数无效")
    if not asset_id or any(value in asset_id for value in ("/", "\\", "..")):
        raise GarmentError("--id 必须是单个非空路径段")
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    body_glb = load_glb(body_path); body_mesh = load_world_mesh(body_glb, skinned_only=True)
    if body_mesh.normals is None or body_mesh.joints is None or body_mesh.weights is None:
        raise GarmentError("正本必须含 NORMAL / JOINTS_0 / WEIGHTS_0")
    body_faces = body_mesh.indices.reshape(-1, 3)
    surface = SurfaceIndex(body_mesh.positions, body_faces, body_mesh.normals, k=k)
    source_glb = load_glb(garment_path); garment = load_world_mesh(source_glb)
    source_skin = bool(source_glb.json.get("skins", []))
    use_joint_alignment = align_mode == "joints" or (align_mode == "auto" and source_skin)
    preserve_body_space_skin = (align_mode == "none" and source_skin
                                and edge_weights == "template")
    if align_mode == "joints" and not source_skin:
        raise GarmentError("--align joints 要求输入 GLB 带 skin")
    if use_joint_alignment:
        if garment.joints is None or garment.weights is None:
            raise GarmentError("自带 skin 的衣物缺少 JOINTS_0 / WEIGHTS_0")
        positions, normals, align, source_to_target = align_joints(
            garment.positions, garment.normals, source_glb, skeleton, garment.joints, garment.weights,
            preserve_shape=preserve_shape)
        used = garment.weights > 1e-7
        if np.any(source_to_target[garment.joints][used] < 0):
            raise GarmentError("衣物权重引用目标骨架中不存在的骨名")
        garment.joints = source_to_target[garment.joints].astype(np.uint16)
    elif align_mode == "none":
        if preserve_body_space_skin:
            source_names = [source_glb.json["nodes"][node].get("name", "")
                            for node in source_glb.skin().joints]
            if source_names != skeleton["joints"]:
                raise GarmentError("--align none 的带 skin 输入必须与目标 skeleton 同序")
        positions = garment.positions.astype(np.float32).copy()
        normals = None if garment.normals is None else garment.normals.astype(np.float32).copy()
        align = {"method": "joints" if source_skin else "landmarks",
                 "requestedMode": "none", "scale": 1.0,
                 "yawDeg": 0.0, "mirrored": False, "landmarks": 0,
                 "determinant": 1.0, "translationMu": [0.0, 0.0, 0.0],
                 "bodySpaceIdentity": True,
                 "residualMu": {"neckTopMu": 0.0, "feetMu": 0.0}}
    else:
        skull = load_skull_profile(skeleton, skeleton_path) if kind == "hair" else None
        positions, normals, align = align_landmarks(
            garment.positions, garment.normals, body_mesh.positions, skeleton, kind, skull)
    garment.positions = positions; garment.normals = normals if normals is not None else vertex_normals(positions, garment.indices.reshape(-1, 3)).astype(np.float32)
    removed = 0
    if remove_stub:
        garment, removed = remove_body_stub(garment, surface, 0.001 / float(skeleton["mPerMu"]))
    faces = garment.indices.reshape(-1, 3)
    if weight_source == "template":
        garment.joints, garment.weights, weight_stats = transfer_template_weights(
            garment.positions, faces, surface, body_mesh.joints, body_mesh.weights,
            skeleton, slot, smooth_rounds=weight_smooth_rounds)
    elif use_joint_alignment or preserve_body_space_skin:
        garment.joints, garment.weights, weight_stats = filter_existing_weights(
            garment.joints, garment.weights, garment.positions, skeleton, slot)
    else:
        garment.joints, garment.weights, weight_stats = transfer_weights(
            garment.positions, garment.normals, surface, body_mesh.joints, body_mesh.weights, skeleton, slot, faces)
    if edge_weights == "template":
        template_joints, template_weights, _ = transfer_weights(
            garment.positions, garment.normals, surface, body_mesh.joints,
            body_mesh.weights, skeleton, slot, faces)
        garment.joints, garment.weights, edge_stats = edge_weight_blend(
            garment.positions, faces, garment.joints, garment.weights, template_joints,
            template_weights, mm_to_mu(edge_band_mm, float(skeleton["mPerMu"])))
        edge_stats["bandMm"] = edge_band_mm; weight_stats = {**weight_stats, "edgeWeights": edge_stats}
    edge_only_refit = preserve_body_space_skin and edge_weights == "template"
    source_evidence: dict[str, Any] | None = None
    if edge_only_refit:
        candidate = garment_path.with_name(
            "fit.json" if body_path.parent.name == "tpl_f_medium"
            else f"fit.{body_path.parent.name}.json")
        try:
            source_evidence = json.loads(candidate.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            pass
    push_mu = mm_to_mu(push_mm, float(skeleton["mPerMu"]))
    push_reference_normals = garment.normals.copy()
    push_original = garment.positions.astype(np.float32).copy()
    if edge_only_refit:
        source_push = None if source_evidence is None else source_evidence.get("pushOut")
        if isinstance(source_push, dict) and "sourcePushOut" in source_push:
            source_push = source_push["sourcePushOut"]
        garment.positions, push_stats = push_out(
            garment.positions, faces, surface, push_mu, iters, allow_draft=True,
            reference_normals=push_reference_normals, preserve_shape=preserve_shape)
        garment.positions, bind_clearance = clear_bind_penetration(garment.positions, surface)
        push_stats["residual"] = bind_clearance["residual"]
        push_stats["clearancePassed"] = (bind_clearance["residual"] == 0
                                           and push_stats["insufficientMargin"] == 0)
        push_stats["passed"] = bool(push_stats["clearancePassed"]
                                        and push_stats["topologyPassed"])
        push_stats["draft"] = not push_stats["passed"]
        push_stats["bindClearance"] = bind_clearance
        push_stats["edgeWeightsRefit"] = True
        if source_push is not None: push_stats["sourcePushOut"] = source_push
    elif push_mode == "volume":
        garment.positions, push_stats = volume_push(
            garment.positions, faces, surface, push_mu, float(skeleton["mPerMu"]),
            sigma_mm=volume_sigma_mm, rounds=volume_rounds, allow_draft=allow_draft)
    else:
        garment.positions, push_stats = push_out(
            garment.positions, faces, surface, push_mu, iters, allow_draft=allow_draft,
            reference_normals=push_reference_normals, preserve_shape=preserve_shape)
    garment.normals = vertex_normals(garment.positions, faces).astype(np.float32)
    garment.regions = derive_regions(garment.joints, garment.weights, skeleton)
    region_path = skeleton_path.parent / skeleton["regions"]["file"]
    regions = np.load(region_path); hidden, ratios = hide_regions(
        garment.positions, faces, surface, regions, skeleton["regions"]["ids"], coverage,
        mm_to_mu(15.0, float(skeleton["mPerMu"])))
    # 交付约定固定 1 primitive；源资产均为单 primitive，若未来不是则显式合并材质。
    garment.primitives = [PrimitiveRange(0, len(garment.positions), 0, len(garment.indices), 0)]
    garment.material_indices = np.array([0]); garment.name = asset_id
    material, images = _base_color(source_glb); texture_cleanup = None
    if clean_skin_texture:
        if garment.uvs is None or not images:
            raise GarmentError("--clean-skin-texture 要求衣物含 UV 与 baseColorTexture")
        from extract_garment import _srgb_to_lab
        if skin_lab_mean is None:
            skin_glb = source_glb
            extract_record = garment_path.parent / "extract.json"
            if extract_record.exists():
                record = json.loads(extract_record.read_text(encoding="utf-8"))
                dressed = record.get("inputs", {}).get("dressed", {}).get("file")
                if isinstance(dressed, str):
                    candidate = Path(dressed)
                    if not candidate.is_absolute(): candidate = Path.cwd() / candidate
                    if candidate.exists(): skin_glb = load_glb(candidate)
            if not skin_glb.json.get("skins"):
                raise GarmentError("自动皮肤均值要求带 skin 的源模型")
            source_mesh = load_world_mesh(skin_glb, skinned_only=True)
            source_names = [skin_glb.json["nodes"][node].get("name", "")
                            for node in skin_glb.skin().joints]
            hand_slots = np.asarray([index for index, name in enumerate(source_names)
                                     if name.endswith("LeftHand") or name.endswith("RightHand")])
            if not len(hand_slots) or source_mesh.joints is None or source_mesh.weights is None:
                raise GarmentError("源 GLB 没有可用于皮肤均值的手部权重")
            hand_weight = np.sum(source_mesh.weights * np.isin(source_mesh.joints, hand_slots), axis=1)
            sampled = __import__("extract_garment").sample_base_color(skin_glb, source_mesh)
            samples = sampled[hand_weight >= .5]
            if len(samples) < 16:
                raise GarmentError("源 GLB 手部皮肤样本不足")
            skin_lab_mean = np.median(_srgb_to_lab(samples), axis=0)
        with Image.open(BytesIO(images[0].data)) as texture:
            payload, texture_cleanup = encode_skin_clean_texture(
                texture, garment.uvs, faces, np.asarray(skin_lab_mean), skin_delta_e)
        images = [ImageData(payload, "image/jpeg", images[0].name)]
    output_dir.mkdir(parents=True, exist_ok=True)
    glb_path = output_dir / f"{asset_id}.glb"
    write_skinned_glb(glb_path, garment, body_glb.skin(), material, images); glb_path.chmod(0o644)
    serialized = load_world_mesh(load_glb(glb_path), skinned_only=True)
    verify_serialized_topology(push_original, serialized.positions, faces,
                               push_stats, allow_draft)
    boundary, nonmanifold = edge_statistics(faces)
    peak_value = int(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
    # macOS 返回 bytes，Linux 返回 KiB。
    peak_mib = peak_value / (1024.0 * 1024.0) if sys.platform == "darwin" else peak_value / 1024.0
    fit = {
        "schema": "tianshu-dressup-fit.v1", "kind": kind, "slot": slot, "id": asset_id,
        "source": {"file": _portable(garment_path), "sha256": _sha256(garment_path)},
        "body": {"file": _portable(body_path), "sha256": _sha256(body_path),
                 "skeleton": _portable(skeleton_path), "skeletonSha256": _sha256(skeleton_path)},
        "align": align, "weights": weight_stats,
        "pushOut": {"pushMm": push_mm, "pushMu": push_mu, "iters": iters, **push_stats},
        "status": "draft" if push_stats["draft"] else "fitted",
        "hideRegions": hidden, "neverHide": list(NEVER_HIDE), "coverage": coverage,
        "coverageByRegion": ratios, "spring": None, "fitVersion": 1,
        "stats": {"vertices": len(garment.positions), "triangles": len(faces), "primitiveCount": 1,
                  "removedStubTriangles": removed, "boundaryEdges": len(boundary),
                  "nonManifoldEdges": len(nonmanifold), "fileBytes": glb_path.stat().st_size,
                  "nearestTriangleCandidates": k,
                  "elapsedSec": time.perf_counter() - started, "peakMemoryMiB": peak_mib},
    }
    if texture_cleanup is not None: fit["textureCleanup"] = texture_cleanup
    if edge_only_refit and source_evidence is not None:
        fit["source"] = source_evidence["source"]
        fit["align"] = source_evidence["align"]
        if body_path.parent.name != "tpl_f_medium" and "refitFrom" in source_evidence:
            fit["refitFrom"] = source_evidence["refitFrom"]
    # auto 是历史默认，保持其 JSON 字段逐项不变；显式新模式补 A5 绑定身份。
    if align_mode != "auto":
        fit["template"] = body_path.parent.name; fit["mPerMu"] = float(skeleton["mPerMu"])
    if notes:
        fit["notes"] = [str(value) for value in notes]
    elif edge_only_refit and source_evidence is not None and source_evidence.get("notes"):
        fit["notes"] = source_evidence["notes"]
    fit = _round(fit); temporary = output_dir / ".fit.json.tmp"
    temporary.write_text(json.dumps(fit, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(output_dir / "fit.json"); (output_dir / "fit.json").chmod(0o644)
    return fit


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="衣物/发型离线贴合：对齐、权重转移、推离与遮罩统计。")
    parser.add_argument("--body", type=Path, required=True, help="素体正本 GLB")
    parser.add_argument("--skeleton", type=Path, required=True, help="正本 skeleton.json")
    parser.add_argument("--garment", type=Path, required=True, help="无骨架衣物或发型 GLB")
    parser.add_argument("--kind", choices=KINDS, required=True); parser.add_argument("--slot", choices=SLOTS, required=True)
    parser.add_argument("--id", required=True, help="资产 ID 和输出 GLB 文件名")
    parser.add_argument("--out", type=Path, required=True, help="输出目录")
    parser.add_argument("--align", choices=ALIGN_MODES, default="auto",
                        help="auto 保持既有行为；none 表示输入已在模板 bind 空间")
    parser.add_argument("--note", action="append", default=[], help="写入 fit.json.notes，可重复")
    parser.add_argument("--remove-body-stub", action="store_true", help="删除距体表 <1mm 且法线反向的假人三角")
    parser.add_argument("--push-mm", type=float, default=3.0); parser.add_argument("--iters", type=int, default=3)
    parser.add_argument("--push-mode", choices=PUSH_MODES, default="vertex",
                        help="vertex：逐点沿法向推离（默认，既有行为）；volume：体表位移场整体推离（交领等多层不互穿）")
    parser.add_argument("--volume-sigma-mm", type=float, default=VOLUME_SIGMA_MM, help="volume 模式首轮核宽 σ")
    parser.add_argument("--volume-rounds", type=int, default=VOLUME_ROUNDS, help="volume 模式最多轮数")
    parser.add_argument("--k", type=int, default=16, help="最近三角质心候选数（默认 16）")
    parser.add_argument("--coverage", type=float, default=0.65); parser.add_argument("--json", action="store_true")
    parser.add_argument("--edge-weights", choices=EDGE_WEIGHT_MODES, default="off",
                        help="template 时开口使用模板权重；默认 off 保持历史行为")
    parser.add_argument("--edge-band-mm", type=float, default=30.0,
                        help="开口模板权重向源权重渐变带，默认 30 mm")
    parser.add_argument("--weight-source", choices=WEIGHT_SOURCE_MODES, default="auto",
                        help="template 将整件改用模板最近面权重；默认 auto 保持历史行为")
    parser.add_argument("--weight-smooth-rounds", type=int, default=3)
    parser.add_argument("--preserve-shape", action="store_true",
                        help="推离时同时回退新增边长越界；默认关闭")
    parser.add_argument("--clean-skin-texture", action="store_true",
                        help="按源手部皮肤 Lab 均值清理衣物 UV 岛内肤色纹素")
    parser.add_argument("--skin-delta-e", type=float, default=18.0)
    parser.add_argument("--skin-lab-mean", nargs=3, type=float, metavar=("L", "A", "B"),
                        help="显式源皮肤 Lab 均值；省略时从最初带 skin 的源模型取手部中位数")
    parser.add_argument("--allow-draft", action="store_true",
                        help="门禁未通过时仍写 status=draft；默认非零退出且不写产物")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = fit_file(args.body, args.skeleton, args.garment, args.out, args.kind, args.slot, args.id,
                          remove_stub=args.remove_body_stub, push_mm=args.push_mm, iters=args.iters,
                          coverage=args.coverage, allow_draft=args.allow_draft, k=args.k,
                          align_mode=args.align, notes=args.note, edge_weights=args.edge_weights,
                          edge_band_mm=args.edge_band_mm, weight_source=args.weight_source,
                          weight_smooth_rounds=args.weight_smooth_rounds,
                          preserve_shape=args.preserve_shape,
                          clean_skin_texture=args.clean_skin_texture, skin_delta_e=args.skin_delta_e,
                          skin_lab_mean=args.skin_lab_mean, push_mode=args.push_mode,
                          volume_sigma_mm=args.volume_sigma_mm, volume_rounds=args.volume_rounds)
    except GarmentGateError as error:
        print(f"门禁失败：{error}", file=sys.stderr); return 3
    except (OSError, ValueError, json.JSONDecodeError, RuntimeError, NotImplementedError) as error:
        print(f"输入错误：{error}", file=sys.stderr); return 2
    if args.json: print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    else: print(f"已输出 {args.out / (args.id + '.glb')} 与 fit.json；耗时 {result['stats']['elapsedSec']:.3f}s")
    return 0


__all__ = ["ALIGN_MODES", "EDGE_WEIGHT_MODES", "PUSH_MODES", "WEIGHT_SOURCE_MODES", "GarmentError", "GarmentGateError", "SurfaceIndex", "align_landmarks", "allowed_joint_indices",
           "align_joints", "derive_regions", "filter_existing_weights", "fit_file",
           "edge_weight_blend", "encode_skin_clean_texture", "hide_regions", "load_skull_profile", "load_world_mesh", "mm_to_mu", "push_out", "volume_push",
           "transfer_template_weights", "transfer_weights", "vertex_normals"]


if __name__ == "__main__":
    raise SystemExit(main())
