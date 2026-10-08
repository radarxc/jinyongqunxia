#!/usr/bin/env python3
"""从唯一正本蒙皮网格派生骨架帧、尺寸、颈环、区域和握拳姿势。"""

from __future__ import annotations

import argparse
import copy
from hashlib import sha256
import json
import math
import os
from pathlib import Path
import tempfile
import sys
from typing import Any, Sequence

import numpy as np
from scipy.spatial import ConvexHull

try:
    from .common import compose_matrix, matrix_to_quaternion, pca
    from .glb_io import GLB, Mesh, load_glb
    from .normalize_rig import _serialize, rest_bind_max_diff
except ImportError:
    from common import compose_matrix, matrix_to_quaternion, pca
    from glb_io import GLB, Mesh, load_glb
    from normalize_rig import _serialize, rest_bind_max_diff


SCHEMA = "tianshu-dressup-skeleton.v1"
JOINT_TO_REGION = {
    "Head": "head", "HeadTop_End": "head", "Neck": "neck", "Spine2": "torsoUpper",
    "Spine1": "torsoLower", "Spine": "torsoLower", "Hips": "hips",
    "LeftShoulder": "torsoUpper", "RightShoulder": "torsoUpper",
    "LeftArm": "upperArmL", "RightArm": "upperArmR",
    "LeftForeArm": "forearmL", "RightForeArm": "forearmR",
    "LeftUpLeg": "thighL", "RightUpLeg": "thighR", "LeftLeg": "shinL", "RightLeg": "shinR",
}
for side, suffix in (("Left", "L"), ("Right", "R")):
    JOINT_TO_REGION[f"{side}Hand"] = f"hand{suffix}"
    JOINT_TO_REGION[f"{side}Foot"] = f"foot{suffix}"
    JOINT_TO_REGION[f"{side}ToeBase"] = f"foot{suffix}"
    JOINT_TO_REGION[f"{side}Toe_End"] = f"foot{suffix}"
    for finger in ("Thumb", "Index", "Middle", "Ring", "Pinky"):
        for segment in range(1, 5): JOINT_TO_REGION[f"{side}Hand{finger}{segment}"] = f"hand{suffix}"
REGION_IDS = {name: index for index, name in enumerate((
    "head", "neck", "torsoUpper", "torsoLower", "hips", "upperArmL", "upperArmR",
    "forearmL", "forearmR", "handL", "handR", "thighL", "thighR", "shinL", "shinR", "footL", "footR"))}


class SkeletonError(ValueError):
    """正本无法满足 skeleton.v1 派生契约。"""


def _round(value: Any, digits: int = 8) -> Any:
    if isinstance(value, dict): return {key: _round(item, digits) for key, item in value.items()}
    if isinstance(value, (list, tuple)): return [_round(item, digits) for item in value]
    if isinstance(value, np.ndarray): return [_round(item, digits) for item in value.tolist()]
    if isinstance(value, (np.floating, float)): return round(float(value), digits)
    if isinstance(value, (np.integer,)): return int(value)
    return value


def _names(glb: GLB) -> list[str]:
    return [str(glb.json["nodes"][node].get("name", f"node:{node}")) for node in glb.skin().joints]


def _world_mesh(glb: GLB) -> tuple[Mesh, np.ndarray, np.ndarray | None]:
    mesh = glb.mesh()
    candidates = [(index, node) for index, node in enumerate(glb.json.get("nodes", [])) if node.get("mesh") == 0]
    transform = glb.world_matrix(candidates[0][0]) if candidates else np.eye(4)
    positions = (np.c_[mesh.positions, np.ones(len(mesh.positions))] @ transform.T)[:, :3]
    normals = None
    if mesh.normals is not None:
        linear = np.linalg.inv(transform[:3, :3]).T
        normals = mesh.normals @ linear.T
        normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-12)
    return mesh, positions, normals


def _bone_weights(mesh: Mesh, joint_slot: int) -> np.ndarray:
    if mesh.joints is None or mesh.weights is None: raise SkeletonError("正本 mesh 缺 JOINTS_0/WEIGHTS_0")
    return np.max(np.where(mesh.joints == joint_slot, mesh.weights, 0.0), axis=1)


def _shell(mesh: Mesh, positions: np.ndarray, slots: dict[str, int], name: str, threshold: float = 0.5) -> np.ndarray:
    if name not in slots: raise SkeletonError(f"缺少关节 {name}")
    points = positions[_bone_weights(mesh, slots[name]) >= threshold]
    if len(points) < 4: raise SkeletonError(f"{name} 权重壳顶点不足")
    return points


def _family_shell(mesh: Mesh, positions: np.ndarray, slots: dict[str, int], prefixes: Sequence[str], threshold: float = 0.5) -> np.ndarray:
    family = [slot for name, slot in slots.items() if any(name.startswith(prefix) for prefix in prefixes)]
    score = np.sum(np.where(np.isin(mesh.joints, family), mesh.weights, 0.0), axis=1)
    points = positions[score >= threshold]
    if len(points) < 4: raise SkeletonError(f"骨族 {prefixes} 权重壳顶点不足")
    return points


def _width(points: np.ndarray) -> float:
    return float(np.ptp(points[:, 0]))


def _horizontal_width(points: np.ndarray, y: float, half: float = 0.004) -> float:
    section = points[np.abs(points[:, 1] - y) <= half]
    return _width(section) if len(section) >= 4 else _width(points)


def _convex_perimeter(points_xz: np.ndarray) -> float:
    if len(points_xz) < 3: return 0.0
    hull = ConvexHull(points_xz)
    ordered = points_xz[hull.vertices]
    return float(np.linalg.norm(ordered - np.roll(ordered, -1, axis=0), axis=1).sum())


def derive_measures(glb: GLB, mesh: Mesh, positions: np.ndarray, slots: dict[str, int]) -> tuple[dict[str, Any], np.ndarray]:
    head = _shell(mesh, positions, slots, "mixamorig:Head")
    top = head[head[:, 1] >= float(head[:, 1].max()) - 0.003].mean(axis=0)
    best_perimeter = 0.0
    for height in np.arange(head[:, 1].min(), head[:, 1].max() + 0.002, 0.002):
        section = head[np.abs(head[:, 1] - height) <= 0.0025]
        if len(section) >= 12:
            best_perimeter = max(best_perimeter, _convex_perimeter(section[:, [0, 2]]))
    spine2 = _shell(mesh, positions, slots, "mixamorig:Spine2")
    spine = _shell(mesh, positions, slots, "mixamorig:Spine")
    hips = _shell(mesh, positions, slots, "mixamorig:Hips")
    shoulder = np.concatenate([_shell(mesh, positions, slots, f"mixamorig:{side}Shoulder") for side in ("Left", "Right")])
    hand_length, hand_thickness, foot_length = {}, {}, []
    for side, short in (("Left", "L"), ("Right", "R")):
        hand = _family_shell(mesh, positions, slots, (f"mixamorig:{side}Hand",))
        _, _, hand_axes = pca(hand); extents = np.ptp((hand - hand.mean(axis=0)) @ hand_axes.T, axis=0)
        hand_length[short], hand_thickness[short] = float(extents.max()), float(extents.min())
        foot = _family_shell(mesh, positions, slots, (f"mixamorig:{side}Foot", f"mixamorig:{side}Toe"))
        _, _, foot_axes = pca(foot); foot_extent = np.ptp((foot - foot.mean(axis=0)) @ foot_axes.T, axis=0)
        foot_length.append(float(foot_extent.max()))
    result = {
        "headWidthMu": _width(head), "headDepthMu": float(np.ptp(head[:, 2])),
        "headCircumferenceMu": best_perimeter, "headTopMu": _round(top),
        "shoulderSkinWidthMu": _horizontal_width(shoulder, np.percentile(shoulder[:, 1], 88.5), 0.003),
        "chestWidthMu": _horizontal_width(spine2, np.percentile(spine2[:, 1], 58), 0.01),
        "waistWidthMu": _horizontal_width(spine, float(np.percentile(spine[:, 1], 95)), 0.004),
        "hipWidthMu": _horizontal_width(_shell(mesh, positions, slots, "mixamorig:Spine1"),
                                           float(np.percentile(_shell(mesh, positions, slots, "mixamorig:Spine1")[:, 1], 25)), 0.004),
        "handLengthMu": _round(hand_length), "handThicknessMu": _round(hand_thickness),
        "footLengthMu": float(np.mean(foot_length)),
    }
    return {key: _round(value) for key, value in result.items()}, top


def fit_ellipse(points_2d: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """拟合可旋转椭圆，返回中心、主半径与二维正交轴。"""
    points = np.asarray(points_2d, dtype=np.float64)
    if points.ndim != 2 or points.shape[1] != 2 or len(points) < 8: raise SkeletonError("椭圆拟合至少需要 8 个二维点")
    center = np.median(points, axis=0); centered = points - center
    _, _, axes = np.linalg.svd(centered, full_matrices=False)
    projected = centered @ axes.T
    # 壳的离散切片含相邻高度；分位数抑制极少数衣领/肩部外点。
    radii = np.percentile(np.abs(projected), 95, axis=0)
    if np.min(radii) <= 1e-8: raise SkeletonError("切片退化，不能拟合椭圆")
    return center, radii, axes


def _plane_basis(axis: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    direction = np.asarray(axis, dtype=float); direction /= np.linalg.norm(direction)
    seed = np.eye(3)[int(np.argmin(np.abs(direction)))]
    u = seed - direction * np.dot(seed, direction); u /= np.linalg.norm(u)
    return direction, u, np.cross(direction, u)


def find_neck_ring(local_points: np.ndarray, neck_weights: np.ndarray, primary: np.ndarray, axis: np.ndarray,
                   *, slice_half: float = 0.0025) -> dict[str, Any]:
    """沿 Neck→Head 轴搜索 100% Neck 主导且近圆的第一段。"""
    axis, plane_u, plane_v = _plane_basis(axis)
    axial = local_points @ axis
    candidates = []
    for height in np.arange(0.004, 0.0351, 0.001):
        selected = np.abs(axial - height) <= slice_half
        ring = selected & (neck_weights >= 0.5)
        if np.sum(ring) < 24: continue
        section = np.column_stack((local_points[ring] @ plane_u, local_points[ring] @ plane_v))
        center, radii, axes = fit_ellipse(section)
        ratio = float(max(radii) / min(radii))
        dominance = float(np.mean(primary[selected] == 1)) if np.any(selected) else 0.0
        candidates.append((height, dominance, ratio, center, radii, axes, int(np.sum(ring))))
    valid = [item for item in candidates if item[1] >= 1.0 - 1e-12 and item[2] < 1.3]
    if not valid: raise SkeletonError("未找到 Neck 主导且长宽比 < 1.3 的颈环切片")
    height, dominance, ratio, center, radii, axes, count = valid[0]
    return {"height": height, "dominance": dominance, "ratio": ratio, "center2d": center,
            "radii": radii, "axes": axes, "axis": axis, "planeU": plane_u, "planeV": plane_v,
            "vertices": count}


def derive_neck_ring(glb: GLB, mesh: Mesh, positions: np.ndarray, slots: dict[str, int]) -> dict[str, Any]:
    neck_slot = slots["mixamorig:Neck"]; neck_node = glb.skin().joints[neck_slot]
    inverse = np.linalg.inv(glb.world_matrix(neck_node))
    local = (np.c_[positions, np.ones(len(positions))] @ inverse.T)[:, :3]
    head_node = glb.skin().joints[slots["mixamorig:Head"]]
    head_local = (inverse @ np.r_[glb.world_matrix(head_node)[:3, 3], 1.0])[:3]
    neck_weights = _bone_weights(mesh, neck_slot)
    primary = np.argmax(mesh.weights, axis=1)
    primary_slots = mesh.joints[np.arange(len(mesh.joints)), primary]
    found = find_neck_ring(local, neck_weights, (primary_slots == neck_slot).astype(np.uint8), head_local)
    angles = np.linspace(0.0, 2 * math.pi, 64, endpoint=False)
    circle = np.column_stack((np.cos(angles), np.sin(angles)))
    plane_points = found["center2d"] + (circle * found["radii"]) @ found["axes"]
    profile = []
    up = math.sin(math.radians(15.0)); radial_scale = math.cos(math.radians(15.0))
    for angle, point in zip(angles, plane_points):
        radial_2d = (circle[len(profile)] / found["radii"]) @ found["axes"]
        radial_2d /= np.linalg.norm(radial_2d)
        left_bias = 0.005 * math.cos(angle)
        weights = {"mixamorig:Neck": 0.85, "mixamorig:Spine2": 0.10,
                   "mixamorig:LeftShoulder": 0.025 + left_bias, "mixamorig:RightShoulder": 0.025 - left_bias}
        local_pos = (found["axis"] * found["height"] + found["planeU"] * point[0]
                     + found["planeV"] * point[1])
        local_normal = radial_scale * (found["planeU"] * radial_2d[0] + found["planeV"] * radial_2d[1]) + up * found["axis"]
        world_pos = (glb.world_matrix(neck_node) @ np.r_[local_pos, 1.0])[:3]
        world_normal = glb.world_matrix(neck_node)[:3, :3] @ local_normal; world_normal /= np.linalg.norm(world_normal)
        profile.append({"pos": _round(world_pos), "normal": _round(world_normal),
                        "weights": {key: _round(value) for key, value in weights.items()}})
    ring_payload = json.dumps(profile, sort_keys=True, separators=(",", ":")).encode()
    center_local = (found["axis"] * found["height"] + found["planeU"] * found["center2d"][0]
                    + found["planeV"] * found["center2d"][1])
    center_world = (glb.world_matrix(neck_node) @ np.r_[center_local, 1.0])[:3]
    return {"localYMu": _round(found["height"]), "centerMu": _round(center_world), "centerLocalMu": _round(center_local),
            "radiusMu": {"x": _round(found["radii"][0]), "z": _round(found["radii"][1])},
            "samples": 64, "profile": profile, "lipOffsetMu": 0.004, "neckDominance": _round(found["dominance"]),
            "sliceAspectRatio": _round(found["ratio"]), "sliceVertices": found["vertices"],
            "axisLocal": _round(found["axis"]),
            "sha256": sha256(ring_payload).hexdigest()}


def derive_skull_profile(glb: GLB, mesh: Mesh, positions: np.ndarray, slots: dict[str, int], step: float = 0.005) -> dict[str, Any]:
    head_slot = slots["mixamorig:Head"]; selected = _bone_weights(mesh, head_slot) >= 0.5
    inverse = np.linalg.inv(glb.world_matrix(glb.skin().joints[head_slot]))
    local = (np.c_[positions[selected], np.ones(np.sum(selected))] @ inverse.T)[:, :3]
    bottom, top = float(local[:, 1].min()), float(local[:, 1].max())
    rows = []
    heights = np.arange(bottom, top + step * 0.5, step)
    for height in heights:
        band = local[np.abs(local[:, 1] - height) <= step * 0.65]
        if len(band) < 8:
            nearest = np.argsort(np.abs(local[:, 1] - height))[:max(8, min(64, len(local)))]
            band = local[nearest]
        center = np.median(band[:, [0, 2]], axis=0)
        radius = np.percentile(np.abs(band[:, [0, 2]] - center), 95, axis=0)
        rows.append({"yMu": _round(height), "centerXMu": _round(center[0]), "centerZMu": _round(center[1]),
                     "radiusXMu": _round(radius[0]), "radiusZMu": _round(radius[1])})
    return {"schema": "tianshu-dressup-skull-profile.v1", "unit": "mu", "bone": "mixamorig:Head",
            "stepMu": step, "rows": rows}


def _frame_quaternion(primary_axis: np.ndarray, normal: np.ndarray) -> np.ndarray:
    x = np.array(primary_axis, dtype=float, copy=True); x /= np.linalg.norm(x)
    z = np.array(normal, dtype=float, copy=True); z -= x * np.dot(x, z); z /= np.linalg.norm(z)
    y = np.cross(z, x); y /= np.linalg.norm(y)
    return matrix_to_quaternion(np.column_stack((x, y, z)))


def _socket(glb: GLB, bone: str, world_pos: np.ndarray, world_normal: np.ndarray | None = None,
            world_axis: np.ndarray | None = None, **extra: Any) -> dict[str, Any]:
    names = _names(glb); node = glb.skin().joints[names.index(bone)]; world = glb.world_matrix(node); inverse = np.linalg.inv(world)
    local_pos = (inverse @ np.r_[world_pos, 1.0])[:3]
    # 方向只乘仿射线性部分；平移不会作用于向量。
    local_normal = inverse[:3, :3] @ world_normal if world_normal is not None else np.array([0.0, 0.0, 1.0])
    local_axis = inverse[:3, :3] @ world_axis if world_axis is not None else np.array([1.0, 0.0, 0.0])
    result = {"bone": bone, "pos": _round(local_pos), "quat": _round(_frame_quaternion(local_axis, local_normal))}
    if world_normal is not None: result["normalLocal"] = _round(local_normal / np.linalg.norm(local_normal))
    result.update(extra); return result


def _surface_vertex(positions: np.ndarray, normals: np.ndarray | None, indices: np.ndarray,
                    direction: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """从候选壳选择方向极点，并以局部邻域真实顶点法线稳健定向。"""
    if len(indices) == 0: raise SkeletonError("表面插槽没有候选顶点")
    direction = np.asarray(direction, dtype=float); direction /= np.linalg.norm(direction)
    points = positions[indices]; chosen = int(np.argmax(points @ direction)); point = points[chosen]
    if normals is None: raise SkeletonError("表面插槽要求 NORMAL 顶点属性")
    distances = np.linalg.norm(points - point, axis=1)
    nearby = normals[indices[distances <= 0.006]]
    aligned = nearby[(nearby @ direction) > 0]
    normal = np.mean(aligned if len(aligned) else nearby, axis=0)
    if np.linalg.norm(normal) <= 1e-8: raise SkeletonError("表面插槽邻域法线退化")
    normal /= np.linalg.norm(normal)
    if np.dot(normal, direction) < 0: normal = -normal
    return point, normal


def _grip_point(center: np.ndarray, palm_normal: np.ndarray, palm_offset: float = 0.0153, radius: float = 0.014) -> np.ndarray:
    normal = np.asarray(palm_normal, dtype=float); normal /= np.linalg.norm(normal)
    return np.asarray(center, dtype=float) + (palm_offset + radius) * normal


def derive_sockets(glb: GLB, mesh: Mesh, positions: np.ndarray, normals: np.ndarray | None, slots: dict[str, int],
                   head_top: np.ndarray, neck_ring: dict[str, Any]) -> dict[str, Any]:
    sockets: dict[str, Any] = {}
    names = _names(glb); nodes = glb.skin().joints
    for side, short in (("Right", "R"), ("Left", "L")):
        bone = f"mixamorig:{side}Hand"; slot = slots[bone]; mask = _bone_weights(mesh, slot) > 0.9
        world = glb.world_matrix(nodes[slot]); inverse = np.linalg.inv(world)
        local = (np.c_[positions[mask], np.ones(np.sum(mask))] @ inverse.T)[:, :3]
        center, _, axes = pca(local); thin = axes[-1]
        thumb_node = nodes[slots[f"mixamorig:{side}HandThumb1"]]
        thumb = (inverse @ np.r_[glb.world_matrix(thumb_node)[:3, 3], 1])[:3]
        if np.dot(thumb - center, thin) < 0: thin = -thin
        index_world = glb.world_matrix(nodes[slots[f"mixamorig:{side}HandIndex1"]])[:3, 3]
        pinky_world = glb.world_matrix(nodes[slots[f"mixamorig:{side}HandPinky1"]])[:3, 3]
        world_normal = world[:3, :3] @ thin; world_axis = pinky_world - index_world
        grip_local = _grip_point(center, thin)
        grip_world = (world @ np.r_[grip_local, 1])[:3]
        sockets[f"grip{short}"] = _socket(glb, bone, grip_world, world_normal, world_axis,
                                                palmNormalLocal=_round(thin), palmOffsetMu=0.0153, radiusMu=0.014)
    head = _shell(mesh, positions, slots, "mixamorig:Head")
    head_ids = np.flatnonzero(_bone_weights(mesh, slots["mixamorig:Head"]) >= 0.5)
    top_ids = head_ids[positions[head_ids, 1] >= float(positions[head_ids, 1].max()) - 0.003]
    if normals is None: raise SkeletonError("头部插槽要求 NORMAL 顶点属性")
    top_normal = normals[top_ids].mean(axis=0); top_normal /= np.linalg.norm(top_normal)
    if top_normal[1] < 0: top_normal = -top_normal
    _, front_normal = _surface_vertex(positions, normals, head_ids, np.array([0, 0, 1.0]))
    sockets["headTop"] = _socket(glb, "mixamorig:Head", head_top, top_normal)
    sockets["headCenter"] = _socket(glb, "mixamorig:Head", head.mean(axis=0), front_normal)
    neck_node = nodes[slots["mixamorig:Neck"]]; neck_world = glb.world_matrix(neck_node)
    sockets["neck"] = _socket(glb, "mixamorig:Neck", np.asarray(neck_ring["centerMu"]), neck_world[:3, 1])
    spine = _shell(mesh, positions, slots, "mixamorig:Spine2")
    chest_y = float(np.percentile(spine[:, 1], 58)); spine_ids = np.flatnonzero(
        (_bone_weights(mesh, slots["mixamorig:Spine2"]) >= 0.5) & (np.abs(positions[:, 1] - chest_y) <= 0.008))
    for name, direction in (("chest", [0, 0, 1]), ("back", [0, 0, -1])):
        point, normal = _surface_vertex(positions, normals, spine_ids, np.asarray(direction))
        sockets[name] = _socket(glb, "mixamorig:Spine2", point, normal)
    waist_shell = _shell(mesh, positions, slots, "mixamorig:Spine")
    waist_y = float(np.percentile(waist_shell[:, 1], 70)); waist_ids = np.flatnonzero(
        (_bone_weights(mesh, slots["mixamorig:Spine"]) >= 0.5) & (np.abs(positions[:, 1] - waist_y) <= 0.008))
    for name, direction in (("waistL", [1, 0, 0]), ("waistR", [-1, 0, 0]), ("waistBack", [0, 0, -1])):
        point, normal = _surface_vertex(positions, normals, waist_ids, np.asarray(direction))
        sockets[name] = _socket(glb, "mixamorig:Hips", point, normal)
    if any(np.allclose(sockets["waistBack"]["pos"], sockets[name]["pos"], atol=1e-6) for name in ("waistL", "waistR")):
        raise SkeletonError("waistBack 不得与左右腰插槽重合")
    for side, short in (("Left", "L"), ("Right", "R")):
        foot_ids = np.flatnonzero(_bone_weights(mesh, slots[f"mixamorig:{side}Foot"]) >= 0.5)
        point, normal = _surface_vertex(positions, normals, foot_ids, np.array([0, -1, 0.0]))
        sockets[f"foot{short}"] = _socket(glb, f"mixamorig:{side}Foot", point, normal, np.array([0, 0, -1.0]))
    return sockets


def _dominant_region(ids: np.ndarray) -> int:
    counts = np.bincount(ids.astype(np.int64), minlength=len(REGION_IDS))
    return int(np.flatnonzero(counts == counts.max())[0])


def derive_regions(mesh: Mesh, names: list[str]) -> tuple[np.ndarray, dict[str, str], float, np.ndarray]:
    if mesh.joints is None or mesh.weights is None: raise SkeletonError("区域派生要求蒙皮权重")
    mapping: dict[str, str] = {}
    for name in names:
        short = name.removeprefix("mixamorig:")
        if short not in JOINT_TO_REGION: raise SkeletonError(f"jointToRegion 未覆盖 {name}")
        mapping[name] = JOINT_TO_REGION[short]
    influence = np.argmax(mesh.weights, axis=1)
    slots = mesh.joints[np.arange(len(mesh.joints)), influence]
    regions = np.asarray([REGION_IDS[mapping[names[int(slot)]]] for slot in slots], dtype=np.uint8)
    faces = np.asarray(mesh.indices, dtype=np.int64).reshape(-1, 3)
    triangles = regions[faces]
    cross = np.any(triangles != triangles[:, :1], axis=1)
    # flat varying 由 provoking vertex 决定；跨区面拆点属于后续 body GLB 打包任务。
    triangle_regions = np.asarray([_dominant_region(row) for row in triangles], dtype=np.uint8)
    return regions, mapping, float(np.mean(cross)), triangle_regions


def _axis_angle(axis: np.ndarray, angle_deg: float) -> np.ndarray:
    axis = np.asarray(axis, dtype=float); axis /= np.linalg.norm(axis)
    half = math.radians(angle_deg) * 0.5; sine = math.sin(half)
    return np.r_[axis * sine, math.cos(half)]


def _multiply_quaternion(left: np.ndarray, right: np.ndarray) -> np.ndarray:
    lx, ly, lz, lw = left; rx, ry, rz, rw = right
    result = np.array([lw*rx + lx*rw + ly*rz - lz*ry, lw*ry - lx*rz + ly*rw + lz*rx,
                       lw*rz + lx*ry - ly*rx + lz*rw, lw*rw - lx*rx - ly*ry - lz*rz])
    if result[3] < 0: result = -result
    return result / np.linalg.norm(result)


def _idle_first_rotations(glb: GLB) -> dict[int, np.ndarray]:
    idle = next((item for item in glb.json.get("animations", []) if str(item.get("name", "")).lower() == "idle"), None)
    if idle is None: raise SkeletonError("正本缺 idle 动画，不能派生 fingerPose.fist")
    rotations: dict[int, np.ndarray] = {}
    for channel in idle.get("channels", []):
        if channel.get("target", {}).get("path") != "rotation": continue
        sampler = idle["samplers"][int(channel["sampler"])]
        rotations[int(channel["target"]["node"])] = np.asarray(glb.accessor(int(sampler["output"]))[0], dtype=float)
    return rotations


def _idle_world_matrices(glb: GLB, rotations: dict[int, np.ndarray]) -> dict[int, np.ndarray]:
    cache: dict[int, np.ndarray] = {}
    def visit(node: int) -> np.ndarray:
        if node in cache: return cache[node]
        spec = glb.json["nodes"][node]
        local = (glb.local_matrix(node) if node not in rotations else
                 compose_matrix(spec.get("translation", [0, 0, 0]), rotations[node], spec.get("scale", [1, 1, 1])))
        cache[node] = visit(glb.parents[node]) @ local if node in glb.parents else local
        return cache[node]
    for node in range(len(glb.json.get("nodes", []))): visit(node)
    return cache


def _flex_axis(segment_world: np.ndarray, palm_normal_world: np.ndarray, bone_world: np.ndarray) -> np.ndarray:
    segment = segment_world / np.linalg.norm(segment_world)
    target = palm_normal_world - segment * np.dot(palm_normal_world, segment)
    if np.linalg.norm(target) <= 1e-8: raise SkeletonError("指骨与掌面法线退化，不能派生弯曲轴")
    axis_world = np.cross(segment, target / np.linalg.norm(target))
    axis_local = np.linalg.inv(bone_world[:3, :3]) @ axis_world
    return axis_local / np.linalg.norm(axis_local)


def derive_fist(glb: GLB, names: list[str], sockets: dict[str, Any]) -> tuple[dict[str, Any], dict[str, float]]:
    idle = _idle_first_rotations(glb); node_for = dict(zip(names, glb.skin().joints))
    idle_world = _idle_world_matrices(glb, idle)
    result, angles = {}, {}
    for side in ("Left", "Right"):
        hand = node_for[f"mixamorig:{side}Hand"]
        palm_local = np.asarray(sockets[f"grip{side[0]}"]["palmNormalLocal"], dtype=float)
        palm_world = idle_world[hand][:3, :3] @ palm_local; palm_world /= np.linalg.norm(palm_world)
        for finger in ("Thumb", "Index", "Middle", "Ring", "Pinky"):
            for segment in range(1, 4):
                name = f"mixamorig:{side}Hand{finger}{segment}"; node = node_for[name]
                child = node_for[f"mixamorig:{side}Hand{finger}{segment + 1}"]
                base = idle.get(node, np.asarray(glb.json["nodes"][node].get("rotation", [0, 0, 0, 1]), dtype=float))
                angle = 25.0 + 5.0 * (segment - 1)
                bone_vector = idle_world[child][:3, 3] - idle_world[node][:3, 3]
                axis = _flex_axis(bone_vector, palm_world, idle_world[node])
                result[name] = _round(_multiply_quaternion(base, _axis_angle(axis, angle)))
                angles[name] = angle
    return result, angles


def _arm_angles(glb: GLB, slots: dict[str, int]) -> dict[str, float]:
    nodes = glb.skin().joints
    values = {}
    for side in ("Left", "Right"):
        shoulder = glb.world_matrix(nodes[slots[f"mixamorig:{side}Shoulder"]])[:3, 3]
        arm = glb.world_matrix(nodes[slots[f"mixamorig:{side}Arm"]])[:3, 3]
        fore = glb.world_matrix(nodes[slots[f"mixamorig:{side}ForeArm"]])[:3, 3]
        hand = glb.world_matrix(nodes[slots[f"mixamorig:{side}Hand"]])[:3, 3]
        upper, lower = fore - arm, hand - fore
        values[f"arm{side}"] = math.degrees(math.acos(np.clip(abs(upper[1]) / np.linalg.norm(upper), -1, 1)))
        values[f"fore{side}"] = math.degrees(math.acos(np.clip(abs(lower[1]) / np.linalg.norm(lower), -1, 1)))
    return {"armAngleDeg": _round(np.mean([values["armLeft"], values["armRight"]])),
            "forearmAngleDeg": _round(values["foreLeft"])}


def _parents(glb: GLB) -> list[int]:
    joints = glb.skin().joints; slot = {node: index for index, node in enumerate(joints)}
    return [slot.get(glb.parents.get(node), -1) for node in joints]


def embed_regions(body_path: Path, regions: np.ndarray) -> bool:
    """把 sidecar 同序区域追加为各 primitive 的 u8 SCALAR ``_REGION``。"""
    source = load_glb(body_path); mesh = source.mesh()
    if len(regions) != len(mesh.positions): raise SkeletonError("_REGION 数量与顶点顺序不符")
    existing = [p.get("attributes", {}).get("_REGION") for m in source.json["meshes"] for p in m["primitives"]]
    if all(value is not None for value in existing):
        loaded = source.mesh().regions
        if loaded is None or not np.array_equal(loaded, regions): raise SkeletonError("body.glb 已有 _REGION 与派生结果不符")
        for accessor_index in existing:
            spec = source.json["accessors"][int(accessor_index)]
            if spec.get("componentType") != 5121 or spec.get("type") != "SCALAR":
                raise SkeletonError("body.glb _REGION 必须是 u8 SCALAR")
        return False
    if any(value is not None for value in existing): raise SkeletonError("body.glb 只有部分 primitive 带 _REGION")
    document, binary = copy.deepcopy(source.json), bytearray(source.bin)
    for section in mesh.primitives:
        while len(binary) % 4: binary.append(0)
        values = np.ascontiguousarray(regions[section.vertex_start:section.vertex_start + section.vertex_count], dtype=np.uint8)
        offset = len(binary); binary.extend(values.tobytes())
        view = len(document.setdefault("bufferViews", []))
        document["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(values), "target": 34962})
        accessor = len(document.setdefault("accessors", []))
        document["accessors"].append({"bufferView": view, "componentType": 5121, "count": len(values),
                                         "type": "SCALAR", "min": [int(values.min())], "max": [int(values.max())]})
        document["meshes"][section.mesh_index]["primitives"][section.primitive_index]["attributes"]["_REGION"] = accessor
    payload = _serialize(document, bytes(binary)); descriptor, temporary = tempfile.mkstemp(prefix=f".{body_path.name}.", dir=body_path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle: handle.write(payload)
        checked = load_glb(temporary)
        if not np.array_equal(checked.mesh().positions, mesh.positions): raise SkeletonError("写 _REGION 改变了顶点顺序")
        if _names(checked) != _names(source) or not np.array_equal(checked.skin().inverse_bind_matrices, source.skin().inverse_bind_matrices):
            raise SkeletonError("写 _REGION 改变了 skin.joints 或 IBM")
        os.replace(temporary, body_path)
    finally:
        try: os.unlink(temporary)
        except FileNotFoundError: pass
    return True


def export(body_path: Path, out_dir: Path, default_height_m: float = 1.65) -> dict[str, Any]:
    glb = load_glb(body_path); difference = rest_bind_max_diff(glb)
    if difference >= 1e-5: raise SkeletonError(f"rest != bind：{difference:.9g}")
    names = _names(glb)
    if len(names) != 65: raise SkeletonError(f"规范骨架应为 65 关节，实际 {len(names)}")
    slots = {name: index for index, name in enumerate(names)}; mesh, positions, normals = _world_mesh(glb)
    measures, head_top = derive_measures(glb, mesh, positions, slots)
    height_mu = float(np.ptp(positions[:, 1])); neck_ring = derive_neck_ring(glb, mesh, positions, slots)
    skull = derive_skull_profile(glb, mesh, positions, slots)
    regions, joint_mapping, cross_ratio, triangle_regions = derive_regions(mesh, names)
    sockets = derive_sockets(glb, mesh, positions, normals, slots, head_top, neck_ring)
    fist, fist_angles = derive_fist(glb, names, sockets)
    out_dir.mkdir(parents=True, exist_ok=True)
    skull_path = out_dir / "skull_profile.json"
    skull_bytes = (json.dumps(skull, ensure_ascii=False, indent=2) + "\n").encode(); skull_path.write_bytes(skull_bytes)
    np.save(out_dir / "regions.npy", regions, allow_pickle=False)
    region_embedded = embed_regions(body_path, regions)
    source_sha = sha256(body_path.read_bytes()).hexdigest()
    skeleton = {"schema": SCHEMA, "source": {"file": body_path.as_posix(), "sha256": source_sha, "generator": "Tripo"},
                "unit": "mu", "heightMu": _round(height_mu), "defaultHeightM": default_height_m,
                "mPerMu": _round(default_height_m / height_mu), "joints": names, "parents": _parents(glb),
                "bindWorld": {name: _round(glb.world_matrix(node).T.reshape(-1)) for name, node in zip(names, glb.skin().joints)},
                "restPose": _arm_angles(glb, slots), "measures": measures, "neckRing": neck_ring,
                "skullProfile": {"file": "skull_profile.json", "stepMu": 0.005, "sha256": sha256(skull_bytes).hexdigest()},
                "sockets": sockets, "regions": {"ids": REGION_IDS, "jointToRegion": joint_mapping, "file": "regions.npy",
                                                        "triangleRule": "vertex-majority", "triangles": len(triangle_regions),
                                                        "crossTriangleRatio": _round(cross_ratio)},
                "fingerPose": {"fist": fist, "tightenDeg": {_round_name: angle for _round_name, angle in fist_angles.items()}},
                "validation": {"restBindMaxDiff": difference}}
    skeleton_path = out_dir / "skeleton.json"; skeleton_path.write_text(json.dumps(skeleton, ensure_ascii=False, indent=2) + "\n")
    return {"ok": True, "skeleton": str(skeleton_path), "regions": str(out_dir / 'regions.npy'),
            "skullProfile": str(skull_path), "heightMu": height_mu, "mPerMu": default_height_m / height_mu,
            "ringSha": neck_ring["sha256"], "skeletonSha": sha256(skeleton_path.read_bytes()).hexdigest(),
            "crossTriangleRatio": cross_ratio, "skullRows": len(skull["rows"]), "measures": measures,
            "sockets": sockets, "regionEmbedded": region_embedded, "bodySha": source_sha}


def _finite_vector(value: Any, length: int, label: str) -> np.ndarray:
    try: result = np.asarray(value, dtype=float)
    except (TypeError, ValueError) as exc: raise SkeletonError(f"{label} 必须是数值数组") from exc
    if result.shape != (length,) or not np.all(np.isfinite(result)): raise SkeletonError(f"{label} 必须是 {length} 个有限数")
    return result


def _check_quaternion(value: Any, label: str) -> None:
    quat = _finite_vector(value, 4, label)
    if abs(float(np.linalg.norm(quat)) - 1.0) > 1e-4: raise SkeletonError(f"{label} 必须归一化")


def _check_neck_ring(ring: Any) -> None:
    required = {"localYMu", "centerMu", "centerLocalMu", "radiusMu", "samples", "profile",
                "lipOffsetMu", "neckDominance", "sliceAspectRatio", "sliceVertices", "axisLocal", "sha256"}
    if not isinstance(ring, dict) or required - set(ring): raise SkeletonError("neckRing 字段不齐")
    if ring["samples"] != 64 or len(ring["profile"]) != 64: raise SkeletonError("颈环必须有 64 点")
    _finite_vector(ring["centerMu"], 3, "neckRing.centerMu"); _finite_vector(ring["centerLocalMu"], 3, "neckRing.centerLocalMu")
    axis = _finite_vector(ring["axisLocal"], 3, "neckRing.axisLocal")
    if abs(float(np.linalg.norm(axis)) - 1) > 1e-4: raise SkeletonError("neckRing.axisLocal 必须归一化")
    if not np.isfinite(float(ring["localYMu"])) or not 0.004 <= float(ring["localYMu"]) <= 0.035:
        raise SkeletonError("neckRing.localYMu 不在搜索区间")
    if float(ring["neckDominance"]) != 1.0 or not 1 <= float(ring["sliceAspectRatio"]) < 1.3:
        raise SkeletonError("neckRing 必须 100% Neck 主导且长宽比 < 1.3")
    if int(ring["sliceVertices"]) < 24 or abs(float(ring["lipOffsetMu"]) - 0.004) > 1e-9:
        raise SkeletonError("neckRing 切片顶点或唇环偏移无效")
    keys = {"mixamorig:Neck", "mixamorig:Spine2", "mixamorig:LeftShoulder", "mixamorig:RightShoulder"}
    for index, point in enumerate(ring["profile"]):
        if not isinstance(point, dict) or set(point) != {"pos", "normal", "weights"}: raise SkeletonError(f"neckRing.profile[{index}] 字段不齐")
        _finite_vector(point["pos"], 3, f"neckRing.profile[{index}].pos")
        normal = _finite_vector(point["normal"], 3, f"neckRing.profile[{index}].normal")
        if abs(float(np.linalg.norm(normal)) - 1) > 1e-4: raise SkeletonError("颈环法线必须归一化")
        if set(point["weights"]) != keys or any(not np.isfinite(float(v)) or float(v) < 0 for v in point["weights"].values()):
            raise SkeletonError("颈环每点必须有四个非负有限权重")
        if abs(sum(map(float, point["weights"].values())) - 1) > 1e-6: raise SkeletonError("颈环四权重和必须为 1")
    payload = json.dumps(ring["profile"], sort_keys=True, separators=(",", ":")).encode()
    if sha256(payload).hexdigest() != ring["sha256"]: raise SkeletonError("neckRing sha256 不一致")


def check_outputs(out_dir: Path) -> dict[str, Any]:
    required_top = {"schema", "source", "unit", "heightMu", "defaultHeightM", "mPerMu", "joints", "parents",
                    "bindWorld", "restPose", "measures", "neckRing", "skullProfile", "sockets", "regions", "fingerPose", "validation"}
    skeleton_path = out_dir / "skeleton.json"
    try: data = json.loads(skeleton_path.read_text())
    except (OSError, json.JSONDecodeError) as exc: raise SkeletonError(f"不能读取 skeleton.json：{exc}") from exc
    missing = required_top - set(data)
    if missing: raise SkeletonError(f"skeleton.json 缺字段：{', '.join(sorted(missing))}")
    if data["schema"] != SCHEMA or len(data["joints"]) != 65 or len(data["parents"]) != 65:
        raise SkeletonError("schema 或 65 关节/parents 契约不符")
    if not isinstance(data["source"], dict) or {"file", "sha256", "generator"} - set(data["source"]):
        raise SkeletonError("source 字段不齐")
    if len(set(data["joints"])) != 65 or any(not isinstance(value, int) or value < -1 or value >= 65 for value in data["parents"]):
        raise SkeletonError("joints 必须唯一且 parents 索引有效")
    if set(data["bindWorld"]) != set(data["joints"]): raise SkeletonError("bindWorld 必须覆盖全部 joints")
    for name, matrix in data["bindWorld"].items(): _finite_vector(matrix, 16, f"bindWorld.{name}")
    if data["unit"] != "mu" or any(not np.isfinite(float(data[key])) or float(data[key]) <= 0
                                            for key in ("heightMu", "defaultHeightM", "mPerMu")):
        raise SkeletonError("unit/heightMu/defaultHeightM/mPerMu 无效")
    if abs(float(data["defaultHeightM"]) / float(data["heightMu"]) - float(data["mPerMu"])) > 1e-6:
        raise SkeletonError("mPerMu 与身高换算不一致")
    if set(data["restPose"]) != {"armAngleDeg", "forearmAngleDeg"}: raise SkeletonError("restPose 字段不齐")
    if not all(np.isfinite(float(value)) for value in data["restPose"].values()): raise SkeletonError("restPose 含非有限数")
    measures = data["measures"]
    scalar_measures = {"headWidthMu", "headDepthMu", "headCircumferenceMu", "shoulderSkinWidthMu",
                       "chestWidthMu", "waistWidthMu", "hipWidthMu", "footLengthMu"}
    if not isinstance(measures, dict) or (scalar_measures | {"headTopMu", "handLengthMu", "handThicknessMu"}) - set(measures):
        raise SkeletonError("measures 字段不齐")
    if any(not np.isfinite(float(measures[key])) or float(measures[key]) <= 0 for key in scalar_measures):
        raise SkeletonError("measures 标量必须为正有限数")
    _finite_vector(measures["headTopMu"], 3, "measures.headTopMu")
    for key in ("handLengthMu", "handThicknessMu"):
        if set(measures[key]) != {"L", "R"} or any(not np.isfinite(float(v)) or float(v) <= 0 for v in measures[key].values()):
            raise SkeletonError(f"measures.{key} 必须含 L/R 正有限数")
    if not 0.08 <= float(measures.get("headWidthMu", 0)) <= 0.12: raise SkeletonError("头宽不在 0.08~0.12 mu")
    radii = data["neckRing"].get("radiusMu", {})
    if any(not 0.025 <= float(radii.get(axis, 0)) <= 0.045 for axis in ("x", "z")):
        raise SkeletonError("颈环半径不在 0.025~0.045 mu")
    _check_neck_ring(data["neckRing"])
    validation = data["validation"]
    if set(validation) != {"restBindMaxDiff"} or not np.isfinite(float(validation["restBindMaxDiff"])) or float(validation["restBindMaxDiff"]) >= 1e-5:
        raise SkeletonError("rest=bind 差不满足 <1e-5")
    expected_sockets = {"gripR", "gripL", "headTop", "headCenter", "neck", "chest", "back",
                        "waistL", "waistR", "waistBack", "footL", "footR"}
    socket_bones = {"gripR": "mixamorig:RightHand", "gripL": "mixamorig:LeftHand",
                    "headTop": "mixamorig:Head", "headCenter": "mixamorig:Head", "neck": "mixamorig:Neck",
                    "chest": "mixamorig:Spine2", "back": "mixamorig:Spine2",
                    "waistL": "mixamorig:Hips", "waistR": "mixamorig:Hips", "waistBack": "mixamorig:Hips",
                    "footL": "mixamorig:LeftFoot", "footR": "mixamorig:RightFoot"}
    if not isinstance(data["sockets"], dict) or set(data["sockets"]) != expected_sockets: raise SkeletonError("插槽字段不齐")
    for name, socket in data["sockets"].items():
        required = {"bone", "pos", "quat"}
        if not isinstance(socket, dict) or required - set(socket) or socket["bone"] != socket_bones[name]:
            raise SkeletonError(f"sockets.{name} 字段或父骨无效")
        _finite_vector(socket["pos"], 3, f"sockets.{name}.pos"); _check_quaternion(socket["quat"], f"sockets.{name}.quat")
        if "normalLocal" not in socket: raise SkeletonError(f"sockets.{name} 缺真实表面法线")
        normal = _finite_vector(socket["normalLocal"], 3, f"sockets.{name}.normalLocal")
        if abs(float(np.linalg.norm(normal)) - 1) > 1e-4: raise SkeletonError(f"sockets.{name}.normalLocal 未归一化")
    for name in ("gripL", "gripR"):
        if not {"palmNormalLocal", "palmOffsetMu", "radiusMu"} <= set(data["sockets"][name]): raise SkeletonError(f"{name} 握轴字段不齐")
        normal = _finite_vector(data["sockets"][name]["palmNormalLocal"], 3, f"{name}.palmNormalLocal")
        if abs(float(np.linalg.norm(normal)) - 1) > 1e-4: raise SkeletonError(f"{name} 掌面法线未归一化")
        if abs(float(data["sockets"][name]["palmOffsetMu"]) - 0.0153) > 1e-9 or abs(float(data["sockets"][name]["radiusMu"]) - 0.014) > 1e-9:
            raise SkeletonError(f"{name} 握轴外推参数无效")
        if float(np.linalg.norm(data["sockets"][name]["pos"])) >= 0.06: raise SkeletonError(f"{name} 握轴点超出手骨局部范围")
    if any(np.allclose(data["sockets"]["waistBack"]["pos"], data["sockets"][name]["pos"], atol=1e-6)
           for name in ("waistL", "waistR")): raise SkeletonError("waistBack 与左右腰插槽重合")
    fist = data["fingerPose"].get("fist", {}); tighten = data["fingerPose"].get("tightenDeg", {})
    expected_fingers = {f"mixamorig:{side}Hand{finger}{segment}" for side in ("Left", "Right")
                        for finger in ("Thumb", "Index", "Middle", "Ring", "Pinky") for segment in range(1, 4)}
    if set(fist) != expected_fingers or set(tighten) != expected_fingers: raise SkeletonError("握拳必须恰含 30 根指骨及角度")
    for name, quat in fist.items(): _check_quaternion(quat, f"fingerPose.fist.{name}")
    if any(float(value) not in (25.0, 30.0, 35.0) for value in tighten.values()): raise SkeletonError("握拳角度必须是 25/30/35°")
    region = data["regions"]
    if not isinstance(region, dict) or {"ids", "jointToRegion", "file", "triangleRule", "triangles", "crossTriangleRatio"} - set(region):
        raise SkeletonError("regions 字段不齐")
    expected_mapping = {name: JOINT_TO_REGION[name.removeprefix("mixamorig:")] for name in data["joints"]}
    if region["ids"] != REGION_IDS or region["jointToRegion"] != expected_mapping:
        raise SkeletonError("regions 必须覆盖规范 17 区及全部关节")
    if set(region["jointToRegion"].values()) != set(REGION_IDS): raise SkeletonError("jointToRegion 未覆盖 17 区")
    if region["triangleRule"] != "vertex-majority" or int(region["triangles"]) <= 0 or not 0 <= float(region["crossTriangleRatio"]) <= 1:
        raise SkeletonError("regions 三角统计无效")
    skull_ref = data["skullProfile"]
    if not isinstance(skull_ref, dict) or set(skull_ref) != {"file", "stepMu", "sha256"} or float(skull_ref["stepMu"]) != 0.005:
        raise SkeletonError("skullProfile 引用字段无效")
    regions_path, skull_path = out_dir / region["file"], out_dir / skull_ref["file"]
    regions = np.load(regions_path, allow_pickle=False)
    if regions.dtype != np.uint8 or regions.ndim != 1: raise SkeletonError("regions.npy 必须是一维 u8")
    if set(map(int, np.unique(regions))) != set(REGION_IDS.values()): raise SkeletonError("regions.npy 必须覆盖 17 区 ID")
    skull_bytes = skull_path.read_bytes()
    if sha256(skull_bytes).hexdigest() != skull_ref["sha256"]: raise SkeletonError("skullProfile sha256 不一致")
    try: skull = json.loads(skull_bytes)
    except json.JSONDecodeError as exc: raise SkeletonError("skull_profile.json 无效") from exc
    if set(skull) != {"schema", "unit", "bone", "stepMu", "rows"} or not skull["rows"]:
        raise SkeletonError("skull_profile.json 字段不齐")
    if skull["schema"] != "tianshu-dressup-skull-profile.v1" or skull["unit"] != "mu" or skull["bone"] != "mixamorig:Head" or float(skull["stepMu"]) != 0.005:
        raise SkeletonError("skull_profile.json 契约值无效")
    previous_y = None
    for index, row in enumerate(skull["rows"]):
        if set(row) != {"yMu", "centerXMu", "centerZMu", "radiusXMu", "radiusZMu"}: raise SkeletonError(f"skull row {index} 字段不齐")
        if any(not np.isfinite(float(value)) for value in row.values()): raise SkeletonError(f"skull row {index} 含非有限数")
        if float(row["radiusXMu"]) <= 0 or float(row["radiusZMu"]) <= 0: raise SkeletonError(f"skull row {index} 半径非正")
        if previous_y is not None and abs(float(row["yMu"]) - previous_y - 0.005) > 1e-6: raise SkeletonError("skull rows 不按 5 mm 递增")
        previous_y = float(row["yMu"])
    declared_source = Path(data["source"].get("file", ""))
    source_path = declared_source if declared_source.exists() else out_dir / "body.glb"
    if source_path.exists():
        if sha256(source_path.read_bytes()).hexdigest() != data["source"].get("sha256"): raise SkeletonError("source body sha256 不一致")
        body = load_glb(source_path); body_regions = body.mesh().regions
        if _names(body) != data["joints"]: raise SkeletonError("body.glb skin.joints 与 skeleton.json 不一致")
        if _parents(body) != data["parents"]: raise SkeletonError("body.glb parents 与 skeleton.json 不一致")
        actual_bind = {name: body.world_matrix(node).T.reshape(-1) for name, node in zip(_names(body), body.skin().joints)}
        if any(not np.allclose(actual_bind[name], data["bindWorld"][name], atol=1e-5, rtol=0) for name in data["joints"]):
            raise SkeletonError("body.glb bindWorld 与 skeleton.json 不一致")
        actual_diff = rest_bind_max_diff(body)
        if actual_diff >= 1e-5 or abs(actual_diff - float(validation["restBindMaxDiff"])) > 1e-8:
            raise SkeletonError("body.glb rest/bind 与 validation 不一致")
        if body_regions is None or not np.array_equal(body_regions, regions): raise SkeletonError("body.glb _REGION 与 regions.npy 不一致")
        specs = [body.json["accessors"][p["attributes"]["_REGION"]] for m in body.json["meshes"] for p in m["primitives"]]
        if any(spec.get("componentType") != 5121 or spec.get("type") != "SCALAR" for spec in specs): raise SkeletonError("body.glb _REGION 不是 u8 SCALAR")
    return {"ok": True, "joints": 65, "vertices": len(regions), "headWidthMu": measures["headWidthMu"],
            "neckRadiusMu": radii, "restBindMaxDiff": data["validation"]["restBindMaxDiff"]}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="从换装正本派生 skeleton.json / regions.npy / skull_profile.json")
    parser.add_argument("--body", type=Path, help="正本蒙皮 GLB")
    parser.add_argument("--out", required=True, type=Path, help="输出目录；--check 时为已有产物目录")
    parser.add_argument("--default-height-m", type=float, default=1.65, help="运行时默认身高（米，默认 1.65）")
    parser.add_argument("--json", action="store_true", help="stdout 输出单个 JSON 对象")
    parser.add_argument("--check", action="store_true", help="只校验已有输出")
    args = parser.parse_args(argv)
    try:
        if args.check: result = check_outputs(args.out)
        else:
            if args.body is None: raise SkeletonError("导出模式必须提供 --body")
            if args.default_height_m <= 0: raise SkeletonError("--default-height-m 必须 > 0")
            result = export(args.body, args.out, args.default_height_m)
    except (OSError, ValueError, NotImplementedError, RuntimeError, np.linalg.LinAlgError) as exc:
        if args.json: print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else: print(f"错误：{exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")) if args.json else
          f"通过：{result.get('joints', 65)} joints，{result.get('vertices', '已导出')} vertices")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
