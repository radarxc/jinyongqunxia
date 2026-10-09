#!/usr/bin/env python3
"""归一化刚性换装道具：语义定向、真实尺寸缩放、烘焙 GLB 与 fit.json。

坐标以模型单位（mu）计算；输出顶点已经变换，唯一 mesh 节点不含 TRS。
脚本可直接运行，也可导入 ``normalize_mesh`` 进行合成几何测试。
"""
from __future__ import annotations

import argparse
import copy
from dataclasses import dataclass
import hashlib
import json
import os
from pathlib import Path
import sys
from typing import Any, Sequence

# 同目录 inspect.py 会遮蔽标准库；NumPy 导入前先缓存标准库 inspect。
_SCRIPT_DIR = Path(__file__).resolve().parent
_removed_paths = [(index, value) for index, value in enumerate(sys.path)
                  if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed_paths:
    sys.path.insert(min(_index, len(sys.path)), _value)

import numpy as np

try:
    from .common import (connected_components, edge_statistics, matrix_to_quaternion,
                         pca, quaternion_to_matrix)
    from .glb_io import GLB, GLBBuilder, Mesh, PrimitiveRange, load_glb
except ImportError:
    from common import (connected_components, edge_statistics, matrix_to_quaternion,
                        pca, quaternion_to_matrix)
    from glb_io import GLB, GLBBuilder, Mesh, PrimitiveRange, load_glb

PROP_CLASSES = ("weapon", "hat", "pendant", "pouch", "fan",
                "scroll", "beads", "gourd", "generic")
SOCKETS = {"weapon": "gripR", "hat": "headTop", "pendant": "chest",
           "pouch": "chest", "beads": "chest", "gourd": "waistL",
           "fan": "waistL", "scroll": "waistL", "generic": "waistL"}


class PropError(ValueError):
    """输入资产或归一化参数不满足契约。"""


@dataclass
class NormalizeResult:
    """纯几何归一化结果；长度字段在缩放前以 mu 表示。"""

    mesh: Mesh
    measured_length_mu: float
    scale_applied: float
    anchor_name: str
    anchor_source_mu: np.ndarray
    profile_widths_mu: np.ndarray
    selected_end: str | None
    end_evidence: dict[str, Any] | None = None


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _portable_path(path: Path) -> str:
    """优先写仓库相对标识，避免把调用机器的检出根带进 fit。"""
    raw = path.as_posix()
    if not path.is_absolute():
        return raw
    parts = path.parts
    for marker in ("apps", "assets", "tools", "packages", "docs"):
        positions = [index for index, value in enumerate(parts) if value == marker]
        if positions:
            return Path(*parts[positions[-1]:]).as_posix()
    return path.name


def _transform_points(points: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    homogeneous = np.column_stack((points, np.ones(len(points))))
    return (homogeneous @ matrix.T)[:, :3]


def _transform_normals(normals: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    transformed = normals @ np.linalg.inv(matrix[:3, :3])
    lengths = np.linalg.norm(transformed, axis=1, keepdims=True)
    if np.any(lengths <= 1e-12):
        raise PropError("节点变换产生零法线")
    return transformed / lengths


def _mesh_instances(glb: GLB) -> Mesh:
    """合并所有 mesh 节点实例并把节点世界矩阵烘焙进顶点。"""
    positions: list[np.ndarray] = []
    normals: list[np.ndarray] = []
    uvs: list[np.ndarray] = []
    indices: list[np.ndarray] = []
    ranges: list[PrimitiveRange] = []
    materials: list[int] = []
    has_normals = has_uvs = True
    vertex_start = index_start = 0
    nodes = [(index, node) for index, node in enumerate(glb.json.get("nodes", [])) if "mesh" in node]
    if not nodes:
        raise PropError("GLB 没有引用 mesh 的节点")
    for node_index, node in nodes:
        source = glb.mesh(int(node["mesh"]))
        world = glb.world_matrix(node_index)
        positions.append(_transform_points(source.positions, world))
        if source.normals is None:
            has_normals = False
        else:
            normals.append(_transform_normals(source.normals, world))
        if source.uvs is None:
            has_uvs = False
        else:
            uvs.append(source.uvs.copy())
        indices.append(source.indices.astype(np.uint32) + vertex_start)
        for section in source.primitives:
            ranges.append(PrimitiveRange(vertex_start + section.vertex_start, section.vertex_count,
                                         index_start + section.index_start, section.index_count, section.material,
                                         section.mesh_index, section.primitive_index, section.mode, section.attributes))
            materials.append(-1 if section.material is None else int(section.material))
        vertex_start += len(source.positions)
        index_start += len(source.indices)
    return Mesh(np.concatenate(positions), np.concatenate(indices),
                np.concatenate(normals) if has_normals else None,
                np.concatenate(uvs) if has_uvs else None,
                material_indices=np.asarray(materials), primitives=ranges, name="NormalizedProp")


def _component_info(mesh: Mesh) -> tuple[list[np.ndarray], np.ndarray]:
    """在实际被索引的 POSITION 焊接拓扑上分块，并把每块映射回原顶点。"""
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    used = np.unique(faces)
    _, used_to_welded = np.unique(mesh.positions[used], axis=0, return_inverse=True)
    original_to_welded = np.full(len(mesh.positions), -1, dtype=np.int64)
    original_to_welded[used] = used_to_welded
    welded_faces = original_to_welded[faces]
    welded_count = int(used_to_welded.max()) + 1
    welded_components = connected_components(welded_count, welded_faces)
    labels = np.empty(welded_count, dtype=np.int64)
    for label, component in enumerate(welded_components):
        labels[component] = label
    components = [used[labels[used_to_welded] == label]
                  for label in range(len(welded_components))]
    return components, welded_faces


def _component_area(mesh: Mesh, component: np.ndarray) -> float:
    """以三角形表面积定义几何最大块，不受接缝顶点数影响。"""
    keep = np.zeros(len(mesh.positions), dtype=bool); keep[component] = True
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    triangles = mesh.positions[faces[np.all(keep[faces], axis=1)]].astype(np.float64)
    if not len(triangles):
        return 0.0
    cross = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
    return float(np.linalg.norm(cross, axis=1).sum() * 0.5)


def _keep_largest_component(mesh: Mesh, components: list[np.ndarray]) -> Mesh:
    """保留最大拓扑块，同时维持 primitive/material 分段。"""
    largest = max(components, key=lambda item: (_component_area(mesh, item), len(item), -int(item[0])))
    keep = np.zeros(len(mesh.positions), dtype=bool); keep[largest] = True
    positions: list[np.ndarray] = []
    normals: list[np.ndarray] = []
    uvs: list[np.ndarray] = []
    indices: list[np.ndarray] = []
    ranges: list[PrimitiveRange] = []
    materials: list[int] = []
    vertex_start = index_start = 0
    for section in mesh.primitives:
        triangles = mesh.indices[section.index_start:section.index_start + section.index_count].reshape(-1, 3)
        triangles = triangles[np.all(keep[triangles], axis=1)]
        if not len(triangles):
            continue
        used = np.unique(triangles)
        remap = np.full(len(mesh.positions), -1, dtype=np.int64); remap[used] = np.arange(len(used))
        local_indices = remap[triangles].reshape(-1).astype(np.uint32) + vertex_start
        positions.append(mesh.positions[used]); indices.append(local_indices)
        if mesh.normals is not None: normals.append(mesh.normals[used])
        if mesh.uvs is not None: uvs.append(mesh.uvs[used])
        ranges.append(PrimitiveRange(vertex_start, len(used), index_start, len(local_indices), section.material,
                                     section.mesh_index, section.primitive_index, 4, section.attributes))
        materials.append(-1 if section.material is None else int(section.material))
        vertex_start += len(used); index_start += len(local_indices)
    if not positions:
        raise PropError("最大连通块没有三角形")
    return Mesh(np.concatenate(positions), np.concatenate(indices),
                np.concatenate(normals) if normals else None, np.concatenate(uvs) if uvs else None,
                material_indices=np.asarray(materials), primitives=ranges, name=mesh.name)


def _sliced_widths(local: np.ndarray, axis: int, bins: int = 20) -> np.ndarray:
    """沿指定轴切片，返回每片横截面最大跨度；空片线性补齐。"""
    return _sliced_width_profile(local, axis, bins)[0]


def _sliced_width_profile(local: np.ndarray, axis: int, bins: int = 20
                          ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """返回切片宽度，以及各片最大截面半径顶点的真实轴向位置。"""
    coordinate = local[:, axis]
    low, high = float(coordinate.min()), float(coordinate.max())
    if high - low <= 1e-9:
        raise PropError("道具主轴长度为零")
    edges = np.linspace(low, high, bins + 1)
    other = [index for index in range(3) if index != axis]
    widths = np.full(bins, np.nan)
    peak_fractions = np.full(bins, np.nan)
    peak_axials = np.full(bins, np.nan)
    for index in range(bins):
        mask = ((coordinate >= edges[index]) &
                ((coordinate < edges[index + 1]) if index + 1 < bins else (coordinate <= edges[index + 1])))
        if np.any(mask):
            section = local[mask][:, other]
            widths[index] = float(np.ptp(section, axis=0).max())
            center = np.median(section, axis=0)
            farthest = int(np.argmax(np.linalg.norm(section - center, axis=1)))
            axial = float(coordinate[mask][farthest])
            peak_axials[index] = axial
            peak_fractions[index] = (axial - low) / (high - low)
    valid = np.flatnonzero(np.isfinite(widths))
    if not len(valid):
        raise PropError("无法计算剖面宽度")
    widths = np.interp(np.arange(bins), valid, widths[valid])
    return widths, peak_fractions, peak_axials


def _guard_peak_end(profile: np.ndarray, peak_fractions: np.ndarray,
                    peak_axials: np.ndarray | None = None) -> tuple[str | None, dict[str, Any]]:
    """找护手横向峰；护手外侧（较短一侧）即柄端。

    bin 只发现局部峰；资格只按峰邻域内最大截面半径顶点的真实位置判断。
    真实位置距任一端须为 5%--35%，且峰宽须高于两侧邻段中位宽 1.4 倍。
    没有合格峰时由调用方回退到“窄端 = 柄”。
    """
    widths = np.asarray(profile, dtype=float)
    actual = np.asarray(peak_fractions, dtype=float)
    axials = (np.full(len(widths), np.nan) if peak_axials is None
              else np.asarray(peak_axials, dtype=float))
    if actual.shape != widths.shape or axials.shape != widths.shape:
        raise PropError("护手峰实际位置数组与宽度剖面长度不一致")
    candidates: list[dict[str, Any]] = []
    flank_gap = max(2, int(round(len(widths) * .20)))
    flank_span = max(2, int(round(len(widths) * .15)))
    for index in range(2, len(widths) - 2):
        fraction = float(actual[index])
        if not np.isfinite(fraction):
            continue
        distance = min(fraction, 1.0 - fraction)
        bin_low = index / len(widths)
        bin_high = (index + 1) / len(widths)
        distance_range = ([bin_low, bin_high] if fraction < 0.5
                          else [1.0 - bin_high, 1.0 - bin_low])
        left_values = widths[max(0, index - flank_gap - flank_span):max(0, index - flank_gap)]
        right_values = widths[min(len(widths), index + flank_gap):
                              min(len(widths), index + flank_gap + flank_span)]
        if not len(left_values) or not len(right_values):
            continue
        left = float(np.median(left_values)); right = float(np.median(right_values))
        neighbor = max(left, right, 1e-12)
        ratio = float(widths[index] / neighbor)
        local_peak = widths[index] >= float(np.max(widths[index - 2:index + 3]))
        if local_peak and ratio >= 1.4:
            candidates.append({
                "bin": index, "fraction": fraction, "distanceFromEndFraction": distance,
                "binCenterFraction": (index + 0.5) / len(widths),
                "binFractionRange": [bin_low, bin_high],
                "distanceFromEndRange": distance_range,
                "peakAxialMu": float(axials[index]) if np.isfinite(axials[index]) else None,
                "widthMu": float(widths[index]), "leftMedianMu": left,
                "rightMedianMu": right, "peakRatio": ratio,
                "selectedEnd": "low" if fraction < 0.5 else "high",
            })
    qualified = [row for row in candidates
                 if 0.05 - 1e-12 <= row["distanceFromEndFraction"] <= 0.35 + 1e-12]
    if not qualified:
        return None, {"method": "narrow-end", "candidates": candidates}
    chosen = min(qualified, key=lambda row: (row["distanceFromEndFraction"],
                                              -row["peakRatio"], -row["widthMu"]))
    return str(chosen["selectedEnd"]), {"method": "guard-peak", "chosen": chosen,
                                           "candidates": candidates}


def _weapon_handle_detection(local: np.ndarray, axis: int = 1, bins: int = 40
                             ) -> tuple[str, np.ndarray, dict[str, Any]]:
    """按真实护手峰选柄端；无合格峰时才回退到窄端。"""
    widths, fractions, axials = _sliced_width_profile(local, axis, bins)
    selected, evidence = _guard_peak_end(widths, fractions, axials)
    if selected is None:
        low_width = float(np.median(widths[:3])); high_width = float(np.median(widths[-3:]))
        selected = "low" if low_width <= high_width else "high"
        evidence["fallbackWidthsMu"] = {"low": low_width, "high": high_width}
    evidence["selectedEnd"] = selected
    return selected, widths, evidence


def _hat_axis(local: np.ndarray) -> tuple[int, np.ndarray, bool]:
    """从三根 PCA 轴选端部宽度不对称最大者；窄端即锥顶。"""
    candidates = []
    for axis in range(3):
        widths = _sliced_widths(local, axis)
        peak = max(float(widths.max()), 1e-9)
        low = float(np.median(widths[:3])); high = float(np.median(widths[-3:]))
        candidates.append((abs(low - high) / peak, axis, widths, low <= high))
    _, axis, widths, tip_is_low = max(candidates, key=lambda item: (item[0], -item[1]))
    return axis, widths, tip_is_low


def _anchor_cluster(local: np.ndarray, axis: int, high: bool, fraction: float = 0.01) -> np.ndarray:
    coordinate = local[:, axis]
    low, top = float(coordinate.min()), float(coordinate.max())
    span = top - low
    threshold = top - fraction * span if high else low + fraction * span
    mask = coordinate >= threshold if high else coordinate <= threshold
    if not np.any(mask):
        raise PropError("语义锚点簇为空")
    anchor = local[mask].mean(axis=0)
    anchor[axis] = top if high else low
    return anchor


def normalize_mesh(mesh: Mesh, prop_class: str, real_size_m: float, m_per_mu: float, *,
                   size_axis: str = "length", grip_ratio: float = 0.07, flip: bool = False) -> NormalizeResult:
    """纯几何归一化：返回已烘焙尺度/定向/锚点的网格。"""
    if prop_class not in PROP_CLASSES:
        raise PropError(f"未知 --class：{prop_class}")
    if real_size_m <= 0 or m_per_mu <= 0:
        raise PropError("realSizeM 与 mPerMu 必须大于 0")
    if not 0 <= grip_ratio <= 0.5:
        raise PropError("--grip-ratio 必须在 [0, 0.5]")
    if not np.all(np.isfinite(mesh.positions)):
        raise PropError("网格 POSITION 含 NaN/Inf")
    center, _, axes = pca(mesh.positions)
    pca_local = (mesh.positions.astype(np.float64) - center) @ axes.T
    main_axis = 0
    profile = np.empty(0)
    selected_end: str | None = None
    end_evidence: dict[str, Any] | None = None
    if prop_class == "hat":
        main_axis, profile, semantic_low = _hat_axis(pca_local)
        semantic_low = bool(semantic_low) != bool(flip)
        selected_end = "low" if semantic_low else "high"
        # 输出 +Y 从开口指向锥顶，使开口在锚点的 -Y 侧。
        main = (-1.0 if semantic_low else 1.0) * axes[main_axis]
        anchor_name = "tip"
    elif prop_class == "weapon":
        guard_end, profile, end_evidence = _weapon_handle_detection(
            pca_local, main_axis, bins=40)
        semantic_low = (guard_end == "low") != bool(flip)
        selected_end = "low" if semantic_low else "high"
        end_evidence["selectedEndBeforeFlip"] = guard_end
        end_evidence["selectedEnd"] = selected_end
        # 柄/扇轴端为 -Y，主体伸向 +Y。
        main = (1.0 if semantic_low else -1.0) * axes[main_axis]
        anchor_name = "grip"
    else:
        main = (-1.0 if flip else 1.0) * axes[main_axis]
        anchor_name = "stringTop" if prop_class in ("pendant", "pouch") else "center"
    second_axis = next(index for index in range(3) if index != main_axis)
    if prop_class == "hat":
        second_axis = max((index for index in range(3) if index != main_axis),
                          key=lambda index: float(np.ptp(pca_local[:, index])))
    second = axes[second_axis].copy()
    lateral = np.cross(main, second)
    lateral /= np.linalg.norm(lateral)
    second = np.cross(lateral, main)
    second /= np.linalg.norm(second)
    basis = np.stack((lateral, main, second))
    oriented = (mesh.positions.astype(np.float64) - center) @ basis.T
    if anchor_name == "grip":
        low, high = float(oriented[:, 1].min()), float(oriented[:, 1].max())
        anchor = np.array([0.0, low + grip_ratio * (high - low), 0.0])
    elif anchor_name == "tip":
        anchor = _anchor_cluster(oriented, 1, True)
    elif anchor_name == "stringTop":
        coordinate = oriented[:, 1]; cutoff = coordinate.max() - 0.01 * np.ptp(coordinate)
        anchor = oriented[coordinate >= cutoff].mean(axis=0)
    else:
        anchor = (oriented.min(axis=0) + oriented.max(axis=0)) / 2.0
    centered = oriented - anchor
    dimensions = {"length": float(np.ptp(centered[:, 1])),
                  "width": max(float(np.ptp(centered[:, 0])), float(np.ptp(centered[:, 2]))),
                  "height": float(np.ptp(centered[:, 1]))}
    measured = dimensions[size_axis]
    if measured <= 1e-9:
        raise PropError(f"--size-axis {size_axis} 测得长度为零")
    scale = real_size_m / (measured * m_per_mu)
    output_positions = (centered * scale).astype(np.float32)
    output_normals = None
    if mesh.normals is not None:
        output_normals = (mesh.normals.astype(np.float64) @ basis.T)
        output_normals /= np.linalg.norm(output_normals, axis=1, keepdims=True)
        output_normals = output_normals.astype(np.float32)
    output = Mesh(output_positions, mesh.indices.copy(), output_normals,
                  None if mesh.uvs is None else mesh.uvs.copy(),
                  material_indices=mesh.material_indices.copy(),
                  primitives=copy.deepcopy(mesh.primitives), name=mesh.name)
    # anchor_source_mu 是节点变换已烘焙后的源空间坐标。
    anchor_source = center + anchor @ basis
    return NormalizeResult(output, measured, scale, anchor_name, anchor_source, profile,
                           selected_end, end_evidence)


def _body_scale(body: Path | None, skeleton: Path | None, default_height_m: float) -> tuple[float, dict[str, Any]]:
    if skeleton is not None:
        data = json.loads(skeleton.read_text(encoding="utf-8"))
        m_per_mu = float(data.get("mPerMu", 0))
        if m_per_mu <= 0:
            raise PropError("skeleton.json 缺少正数 mPerMu")
        source = data.get("source", {})
        return m_per_mu, {"file": source.get("file", _portable_path(skeleton)),
                          "sha256": source.get("sha256", _sha256(skeleton))}
    if body is None:
        raise PropError("必须提供 --body 或 --skeleton")
    body_glb = load_glb(body); body_mesh = _mesh_instances(body_glb)
    height_mu = float(np.ptp(body_mesh.positions[:, 1]))
    if height_mu <= 1e-9:
        raise PropError("正本网格高度为零")
    return default_height_m / height_mu, {"file": _portable_path(body), "sha256": _sha256(body)}


def _bind_matrix(skeleton: dict[str, Any], name: str) -> np.ndarray:
    values = np.asarray(skeleton.get("bindWorld", {}).get(name), dtype=float)
    if values.shape != (16,) or not np.all(np.isfinite(values)):
        raise PropError(f"skeleton.bindWorld 缺少有效关节 {name}")
    return values.reshape(4, 4).T


def _socket_matrix(skeleton: dict[str, Any], name: str) -> np.ndarray:
    socket = skeleton.get("sockets", {}).get(name)
    if not isinstance(socket, dict): raise PropError(f"skeleton.sockets 缺少 {name}")
    bone = _bind_matrix(skeleton, str(socket.get("bone", "")))
    position = np.asarray(socket.get("pos"), dtype=float)
    quaternion = np.asarray(socket.get("quat"), dtype=float)
    if position.shape != (3,) or quaternion.shape != (4,): raise PropError(f"sockets.{name} 位姿无效")
    local = np.eye(4); local[:3, :3] = quaternion_to_matrix(quaternion); local[:3, 3] = position
    return bone @ local


def _axis_quaternion(axis: np.ndarray, angle_deg: float) -> np.ndarray:
    direction = np.asarray(axis, dtype=float); direction /= np.linalg.norm(direction)
    half = np.deg2rad(angle_deg) * 0.5
    return np.r_[direction * np.sin(half), np.cos(half)]


def weapon_grip_adjust(skeleton: dict[str, Any], rest_tilt_deg: float) -> tuple[dict[str, list[float]], float]:
    """绕掌面法线选取让 +Y 更靠近 Hand→Middle1 的倾角符号。"""
    if not np.isfinite(rest_tilt_deg) or not (0 <= rest_tilt_deg <= 90 or rest_tilt_deg == -150):
        raise PropError("--rest-tilt-deg 必须在 [0, 90] 或为反握 -150")
    if rest_tilt_deg == -150:
        quaternion = _axis_quaternion(np.array([0.0, 0.0, 1.0]), -150.0)
        return {"pos": [0.0, 0.0, 0.0], "quat": quaternion.tolist()}, -150.0
    socket_world = _socket_matrix(skeleton, "gripR")
    hand = _bind_matrix(skeleton, "mixamorig:RightHand")[:3, 3]
    middle = _bind_matrix(skeleton, "mixamorig:RightHandMiddle1")[:3, 3]
    finger_local = np.linalg.inv(socket_world[:3, :3]) @ (middle - hand)
    finger_local /= np.linalg.norm(finger_local)
    candidates = []
    for signed in (-float(rest_tilt_deg), float(rest_tilt_deg)):
        quaternion = _axis_quaternion(np.array([0.0, 0.0, 1.0]), signed)
        direction = quaternion_to_matrix(quaternion) @ np.array([0.0, 1.0, 0.0])
        candidates.append((float(np.dot(direction, finger_local)), signed, quaternion))
    _, signed, quaternion = max(candidates, key=lambda item: (item[0], -item[1]))
    return {"pos": [0.0, 0.0, 0.0], "quat": quaternion.tolist()}, signed


def sheathed_sword_adjust(skeleton: dict[str, Any], angle_deg: float,
                         positions: np.ndarray, clearance_mm: float = 2.0
                         ) -> tuple[dict[str, list[float]], float]:
    """佩剑：柄端朝 +Z 前方，鞘身沿左侧向后下，轴角为给定值。

    weapon +Y 由柄端指向鞘尾，因此目标方向是后、下；+X 取角色左侧面法线，
    +Z 用右手系补齐。平移先把柄端放在 waistL 原点，再沿插槽法线外移
    物件半厚与 2 mm，避免静态髋部相交。
    """
    if not np.isfinite(angle_deg) or not 0.0 < angle_deg < 90.0:
        raise PropError("佩剑角度必须在 (0, 90)")
    radians = np.deg2rad(float(angle_deg))
    y_axis = np.array([0.0, -np.sin(radians), -np.cos(radians)])
    x_axis = np.array([1.0, 0.0, 0.0])
    z_axis = np.cross(x_axis, y_axis); z_axis /= np.linalg.norm(z_axis)
    frame = np.column_stack((x_axis, y_axis, z_axis))
    quaternion = matrix_to_quaternion(frame)
    socket = skeleton.get("sockets", {}).get("waistL", {})
    normal = np.asarray(socket.get("normalLocal"), dtype=float)
    if normal.shape != (3,) or np.linalg.norm(normal) <= 1e-12:
        raise PropError("sockets.waistL.normalLocal 无效")
    normal /= np.linalg.norm(normal)
    rotated = np.asarray(positions, dtype=float) @ frame.T
    projection = rotated @ normal
    half_thickness = float(np.ptp(projection) * 0.5)
    offset_mu = half_thickness + clearance_mm / (1000.0 * float(skeleton["mPerMu"]))
    return {"pos": (normal * offset_mu).tolist(), "quat": quaternion.tolist()}, \
        offset_mu * float(skeleton["mPerMu"]) * 1000.0


def pendant_grip_adjust(positions: np.ndarray, normal_local: np.ndarray,
                        m_per_mu: float, clearance_mm: float = 2.0) -> tuple[dict[str, list[float]], float]:
    """沿插槽法线外移道具半厚与固定表面间隙。"""
    normal = np.asarray(normal_local, dtype=float); normal /= np.linalg.norm(normal)
    projection = np.asarray(positions, dtype=float) @ normal
    offset_mu = float(np.ptp(projection) * 0.5 + clearance_mm / (1000.0 * m_per_mu))
    return {"pos": (normal * offset_mu).tolist(), "quat": [0.0, 0.0, 0.0, 1.0]}, offset_mu * m_per_mu * 1000.0


def _vertical_intersections_y(vertices: np.ndarray, faces: np.ndarray,
                              x: float, z: float, *, inner_only: bool = False) -> np.ndarray:
    """返回竖直线的全部命中高度；帽内表面以朝下三角识别。"""
    triangles = vertices[faces]
    x0, z0 = triangles[:, 0, 0], triangles[:, 0, 2]
    x1, z1 = triangles[:, 1, 0], triangles[:, 1, 2]
    x2, z2 = triangles[:, 2, 0], triangles[:, 2, 2]
    box = ((x >= np.minimum(np.minimum(x0, x1), x2) - 1e-10) &
           (x <= np.maximum(np.maximum(x0, x1), x2) + 1e-10) &
           (z >= np.minimum(np.minimum(z0, z1), z2) - 1e-10) &
           (z <= np.maximum(np.maximum(z0, z1), z2) + 1e-10))
    if inner_only:
        normals = np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0])
        box &= normals[:, 1] < -1e-10 * np.linalg.norm(normals, axis=1)
    if not np.any(box): return np.empty(0)
    tri = triangles[box]; ax, az = tri[:, 0, 0], tri[:, 0, 2]
    bx, bz = tri[:, 1, 0], tri[:, 1, 2]; cx, cz = tri[:, 2, 0], tri[:, 2, 2]
    denominator = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz)
    valid = np.abs(denominator) > 1e-12
    if not np.any(valid): return np.empty(0)
    tri, denominator = tri[valid], denominator[valid]
    ax, az = tri[:, 0, 0], tri[:, 0, 2]
    bx, bz = tri[:, 1, 0], tri[:, 1, 2]; cx, cz = tri[:, 2, 0], tri[:, 2, 2]
    first = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / denominator
    second = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / denominator
    third = 1.0 - first - second
    inside = (first >= -1e-8) & (second >= -1e-8) & (third >= -1e-8)
    if not np.any(inside): return np.empty(0)
    heights = (first * tri[:, 0, 1] + second * tri[:, 1, 1] + third * tri[:, 2, 1])[inside]
    return np.sort(heights)


def _hat_ray_gaps(mesh: Mesh, skeleton: dict[str, Any], skull: dict[str, Any],
                  samples: int) -> list[np.ndarray]:
    """返回每个帽檐内颅骨采样点到全部内表面的未抬升竖直距离。"""
    socket_world = _socket_matrix(skeleton, "headTop")
    head_world = _bind_matrix(skeleton, str(skull.get("bone", "mixamorig:Head")))
    head_to_socket = np.linalg.inv(socket_world) @ head_world
    faces = np.asarray(mesh.indices, dtype=np.int64).reshape(-1, 3)
    angles = np.linspace(0.0, 2.0 * np.pi, samples, endpoint=False)
    rays = []
    for row in skull.get("rows", []):
        for angle in angles:
            local = np.array([float(row["centerXMu"]) + float(row["radiusXMu"]) * np.cos(angle),
                              float(row["yMu"]),
                              float(row["centerZMu"]) + float(row["radiusZMu"]) * np.sin(angle), 1.0])
            point = (head_to_socket @ local)[:3]
            hits = _vertical_intersections_y(
                mesh.positions, faces, float(point[0]), float(point[2]), inner_only=True)
            # 无内表面命中的采样点在帽檐外，不构成约束。
            if len(hits): rays.append(hits - float(point[1]))
    return rays


def _first_overhead_gaps(rays: list[np.ndarray], lift_mu: float) -> np.ndarray:
    """取抬升后各射线沿 +Y 遇到的第一片内表面。"""
    result = []
    for ray in rays:
        overhead = ray + lift_mu
        overhead = overhead[overhead >= -1e-10]
        if len(overhead): result.append(float(overhead.min()))
    return np.asarray(result, dtype=float)


def hat_grip_adjust(mesh: Mesh, skeleton: dict[str, Any], skull: dict[str, Any],
                    clearance_mm: float = 3.0, samples: int = 24) -> tuple[dict[str, list[float]], float, float]:
    """以颅骨椭圆全周竖直射线求帽内表面的最低安全抬升。"""
    if samples < 8: raise PropError("帽子全周采样至少 8 点")
    rays = _hat_ray_gaps(mesh, skeleton, skull, samples)
    if not rays: raise PropError("颅骨全周竖直射线均未命中帽子内表面")
    target_mu = clearance_mm / (1000.0 * float(skeleton["mPerMu"]))
    # 每个命中 h 在 lift 区间 [-h, target-h) 内都会成为不足 3 mm 的第一命中。
    # 从“每条射线至少有一片合格内表面”的下界开始，跳过所有这类禁区。
    lift_mu = max(0.0, max(target_mu - float(ray.max()) for ray in rays))
    intervals = sorted((max(0.0, -float(hit)), target_mu - float(hit))
                       for ray in rays for hit in ray if target_mu - float(hit) > 0.0)
    for low, high in intervals:
        if low <= lift_mu < high - 1e-12: lift_mu = high
    gaps = _first_overhead_gaps(rays, lift_mu)
    if len(gaps) != len(rays): raise PropError("存在帽檐内射线未命中抬升后的内表面")
    measured_mm = float(gaps.min()) * float(skeleton["mPerMu"]) * 1000.0
    return {"pos": [0.0, lift_mu, 0.0], "quat": [0.0, 0.0, 0.0, 1.0]}, lift_mu, measured_mm


def _sampler_config(glb: GLB, texture: dict[str, Any]) -> dict[str, Any]:
    if "sampler" not in texture:
        return {}
    sampler = glb.json.get("samplers", [])[int(texture["sampler"])]
    aliases = {"magFilter": "mag_filter", "minFilter": "min_filter",
               "wrapS": "wrap_s", "wrapT": "wrap_t", "name": "name"}
    return {aliases[key]: value for key, value in sampler.items() if key in aliases}


def _write_prop(path: Path, mesh: Mesh, source: GLB) -> None:
    """写只含 baseColor 的 unlit GLB，图片 payload 保持逐字节一致。"""
    builder = GLBBuilder(generator="tianshu normalize_prop.py")
    material_map: list[int] = []
    materials = source.json.get("materials", [])
    for source_index, material in enumerate(materials):
        pbr = material.get("pbrMetallicRoughness", {})
        texture_info = pbr.get("baseColorTexture")
        texture_id = None
        if texture_info is not None:
            texture = source.json.get("textures", [])[int(texture_info["index"])]
            if "source" not in texture:
                raise PropError(f"材质 {source_index} 的 baseColor texture 没有 source")
            image_id = builder.add_image(source.image(int(texture["source"])))
            sampler_id = builder.add_sampler(**_sampler_config(source, texture))
            texture_id = builder.add_texture(image_id, sampler_index=sampler_id, name=texture.get("name"))
        material_map.append(builder.add_material(
            base_color_texture=texture_id, base_color_factor=pbr.get("baseColorFactor", [1, 1, 1, 1]),
            unlit=True, double_sided=bool(material.get("doubleSided", False)), name=material.get("name")))
    if not material_map:
        material_map.append(builder.add_material(unlit=True, name="NormalizedPropUnlit"))
    safe_map = []
    for index in range(max(len(materials), 1)):
        safe_map.append(material_map[index] if index < len(material_map) else material_map[0])
    mesh_index = builder.add_mesh(mesh, material_map=safe_map)
    node_index = builder.add_node(name=mesh.name or "NormalizedProp", mesh=mesh_index)
    builder.add_scene([node_index], name="NormalizedPropScene")
    builder.write(path)
    path.chmod(0o644)


def _round_tree(value: Any) -> Any:
    if isinstance(value, float):
        return round(value, 9)
    if isinstance(value, list):
        return [_round_tree(item) for item in value]
    if isinstance(value, dict):
        return {key: _round_tree(item) for key, item in value.items()}
    return value


def _output_anchor(positions: np.ndarray, anchor_name: str, grip_ratio: float) -> np.ndarray:
    """从最终 float32 输出几何复算语义锚点残差（输出 mu）。"""
    points = np.asarray(positions, dtype=np.float64)
    if anchor_name == "grip":
        low, high = float(points[:, 1].min()), float(points[:, 1].max())
        return np.array([0.0, low + grip_ratio * (high - low), 0.0])
    if anchor_name == "tip":
        return _anchor_cluster(points, 1, True)
    if anchor_name == "stringTop":
        coordinate = points[:, 1]
        cutoff = coordinate.max() - 0.01 * np.ptp(coordinate)
        return points[coordinate >= cutoff].mean(axis=0)
    return (points.min(axis=0) + points.max(axis=0)) / 2.0


def _handle_detection_for_output(positions: np.ndarray, evidence: dict[str, Any],
                                 selected_end: str, grip_ratio: float) -> dict[str, Any]:
    """把源空间护手证据换算成输出 +Y，并记录精确柄/主体顶点划分。"""
    chosen = evidence.get("chosen")
    method = str(evidence.get("method"))
    if method == "guard-peak" and not isinstance(chosen, dict):
        raise PropError("guard-peak 缺少 chosen 证据")
    y = np.asarray(positions[:, 1], dtype=float)
    low, high = float(y.min()), float(y.max()); span = high - low
    if span <= 1e-12:
        raise PropError("武器输出主轴长度为零")
    if method == "guard-peak":
        distance = float(chosen["distanceFromEndFraction"])
        peak_y = low + distance * span
        peak_fraction = distance
    else:
        peak_y = low + grip_ratio * span
        peak_fraction = grip_ratio
    # normalize_mesh 总把所选柄端变换到输出 -Y；护手外侧即 y <= peak。
    handle = y <= peak_y + 1e-9
    blade = ~handle
    if not np.any(handle) or not np.any(blade):
        raise PropError("护手峰没有把武器划分成非空柄段与主体段")
    return {
        "method": method, "peakFraction": peak_fraction,
        "peakAxialMu": peak_y, "handleEnd": "min",
        "handleSegmentVertices": int(np.count_nonzero(handle)),
        "bladeSegmentVertices": int(np.count_nonzero(blade)),
    }


def normalize_file(source_path: Path, output_dir: Path, asset_id: str, prop_class: str, real_size_m: float, *,
                   body: Path | None = None, skeleton: Path | None = None, default_height_m: float = 1.65,
                   size_axis: str = "length", grip_ratio: float = 0.07, flip: bool = False,
                   keep: str = "all", rest_tilt_deg: float = 40.0,
                   sheathed: bool = False, sheathe_angle_deg: float = 35.0) -> dict[str, Any]:
    """完整文件流水线并返回即将写入 fit.json 的对象。"""
    if not asset_id or any(character in asset_id for character in ("/", "\\", "..")):
        raise PropError("--id 必须是单个非空路径段")
    glb = load_glb(source_path); mesh = _mesh_instances(glb)
    components_before, _ = _component_info(mesh)
    if keep == "largest" and len(components_before) > 1:
        mesh = _keep_largest_component(mesh, components_before)
    components_after, faces_after = _component_info(mesh)
    m_per_mu, body_info = _body_scale(body, skeleton, default_height_m)
    result = normalize_mesh(mesh, prop_class, real_size_m, m_per_mu, size_axis=size_axis,
                            grip_ratio=grip_ratio, flip=flip)
    output_dir.mkdir(parents=True, exist_ok=True)
    glb_path = output_dir / f"{asset_id}.glb"
    _write_prop(glb_path, result.mesh, glb)
    output_anchor = _output_anchor(load_glb(glb_path).mesh().positions, result.anchor_name, grip_ratio)
    boundary, nonmanifold = edge_statistics(faces_after)
    diagnostics: dict[str, Any] = {
        "componentsInput": len(components_before), "componentsOutput": len(components_after),
        "keep": keep, "anchorSourceMu": result.anchor_source_mu.tolist(),
        "anchorPositionMu": output_anchor.tolist(),
    }
    if len(result.profile_widths_mu):
        diagnostics["profileWidthsMu"] = result.profile_widths_mu.tolist()
        diagnostics["selectedEnd"] = result.selected_end
    if result.end_evidence is not None:
        diagnostics["handleEndEvidence"] = result.end_evidence
    handle_detection = None
    if prop_class == "weapon" and result.end_evidence is not None:
        handle_detection = _handle_detection_for_output(
            result.mesh.positions, result.end_evidence, str(result.selected_end), grip_ratio)
    grip_adjust = {"pos": [0.0, 0.0, 0.0], "quat": [0.0, 0.0, 0.0, 1.0]}
    adjustment: dict[str, Any] = {}
    skeleton_data = None
    if prop_class in ("weapon", "hat", "pendant", "pouch"):
        if skeleton is None: raise PropError(f"{prop_class} 默认 gripAdjust 要求 --skeleton")
        skeleton_data = json.loads(skeleton.read_text(encoding="utf-8"))
    if prop_class == "weapon":
        if sheathed:
            grip_adjust, offset_mm = sheathed_sword_adjust(
                skeleton_data, sheathe_angle_deg, result.mesh.positions)
            adjustment.update({"sheathed": True, "sheatheAngleDeg": sheathe_angle_deg,
                               "offsetMm": offset_mm})
        else:
            grip_adjust, signed_tilt = weapon_grip_adjust(skeleton_data, rest_tilt_deg)
            adjustment["restTiltDeg"] = signed_tilt
    elif prop_class == "hat":
        skull_path = skeleton.parent / str(skeleton_data.get("skullProfile", {}).get("file", "skull_profile.json"))
        try: skull = json.loads(skull_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc: raise PropError(f"不能读取颅骨轮廓：{exc}") from exc
        grip_adjust, lift_mu, clearance_mm = hat_grip_adjust(result.mesh, skeleton_data, skull)
        adjustment.update({"clearanceMm": clearance_mm, "liftMu": lift_mu})
    elif prop_class in ("pendant", "pouch"):
        socket = skeleton_data.get("sockets", {}).get(SOCKETS[prop_class], {})
        grip_adjust, offset_mm = pendant_grip_adjust(
            result.mesh.positions, np.asarray(socket.get("normalLocal"), dtype=float), m_per_mu)
        adjustment["offsetMm"] = offset_mm
    source_file = body_info.get("file", "")
    source_parts = Path(source_file).parts
    template = source_parts[-2] if len(source_parts) >= 3 and source_parts[-3] == "templates" else None
    fit = {
        "schema": "tianshu-dressup-fit.v1", "kind": "prop", "class": prop_class, "id": asset_id,
        "source": {"file": _portable_path(source_path), "sha256": _sha256(source_path)},
        "body": body_info, "realSizeM": real_size_m, "sizeAxis": size_axis,
        "measuredLengthMu": result.measured_length_mu, "mPerMu": m_per_mu,
        "scaleApplied": result.scale_applied, "anchor": result.anchor_name,
        "forward": "+Z", "up": "+Y",
        "socket": "waistL" if prop_class == "weapon" and sheathed else SOCKETS[prop_class],
        "gripAdjust": grip_adjust,
        "stats": {"vertices": len(result.mesh.positions), "triangles": len(result.mesh.indices) // 3,
                  "components": len(components_after), "boundaryEdges": len(boundary),
                  "nonManifoldEdges": len(nonmanifold), "fileBytes": glb_path.stat().st_size},
        "diagnostics": diagnostics,
    }
    if template is not None: fit["template"] = template
    if handle_detection is not None: fit["handleDetection"] = handle_detection
    fit.update(adjustment)
    fit = _round_tree(fit)
    # 锚点诊断保留 float32 几何所能表达的真实残差，不做 1e-9 舍入。
    fit["diagnostics"]["anchorPositionMu"] = [float(value) for value in output_anchor]
    fit_path = output_dir / "fit.json"
    temporary = output_dir / ".fit.json.tmp"
    temporary.write_text(json.dumps(fit, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(fit_path)
    fit_path.chmod(0o644)
    return fit


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="归一化刚性换装道具：主轴 +Y、语义锚点归原点、按真实米制尺寸缩放。")
    parser.add_argument("input", type=Path, help="Tripo 原始 _raw.glb（meshopt 会自动解压）")
    parser.add_argument("--class", dest="prop_class", choices=PROP_CLASSES, required=True, help="道具语义类别")
    parser.add_argument("--real-size-m", type=float, required=True, help="目标真实尺寸（米）")
    parser.add_argument("--size-axis", choices=("length", "width", "height"), default="length",
                        help="real-size-m 对应尺寸（默认 length）")
    parser.add_argument("--flip", action="store_true", help="反转自动判定的主轴方向")
    parser.add_argument("--grip-ratio", type=float, default=0.07,
                        help="weapon 握点距柄尾占主长比例（默认 0.07）")
    parser.add_argument("--rest-tilt-deg", type=float, default=40.0,
                        help="weapon 待机倾角（默认 40°，自动选符号；-150 表示反握）")
    parser.add_argument("--sheathed", action="store_true",
                        help="weapon 为入鞘佩剑态：挂 waistL，默认后下斜 35°")
    parser.add_argument("--sheathe-angle-deg", type=float, default=35.0,
                        help="入鞘佩剑与水平面夹角（默认 35°；动态扫描后可取 25°~50°）")
    parser.add_argument("--keep", choices=("largest", "all"), default="all",
                        help="保留最大连通块或全部（默认 all）")
    parser.add_argument("--id", required=True, help="输出资产 ID，也是 GLB 文件名")
    parser.add_argument("--out", type=Path, required=True, help="输出目录（写 <id>.glb 与 fit.json）")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--body", type=Path, help="素体正本 GLB，用包围盒高度推导 mPerMu")
    source.add_argument("--skeleton", type=Path, help="skeleton.json，优先直接读取 mPerMu")
    parser.add_argument("--default-height-m", type=float, default=1.65,
                        help="由 --body 换算时的正本身高米数（默认 1.65）")
    parser.add_argument("--json", action="store_true", help="stdout 仅输出单行 JSON")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        fit = normalize_file(args.input, args.out, args.id, args.prop_class, args.real_size_m,
                             body=args.body, skeleton=args.skeleton, default_height_m=args.default_height_m,
                             size_axis=args.size_axis, grip_ratio=args.grip_ratio, flip=args.flip, keep=args.keep,
                             rest_tilt_deg=args.rest_tilt_deg, sheathed=args.sheathed,
                             sheathe_angle_deg=args.sheathe_angle_deg)
    except (OSError, json.JSONDecodeError, PropError, ValueError, NotImplementedError, RuntimeError) as error:
        print(f"输入错误：{error}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(fit, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    else:
        stats = fit["stats"]
        print(f"已输出 {args.out / (args.id + '.glb')} 与 {args.out / 'fit.json'}")
        print(f"measuredLengthMu={fit['measuredLengthMu']:.9f} scaleApplied={fit['scaleApplied']:.9f} "
              f"components={stats['components']} triangles={stats['triangles']}")
    return 0


__all__ = ["NormalizeResult", "PropError", "hat_grip_adjust", "normalize_file", "normalize_mesh",
           "pendant_grip_adjust", "sheathed_sword_adjust", "weapon_grip_adjust"]


if __name__ == "__main__":
    raise SystemExit(main())
