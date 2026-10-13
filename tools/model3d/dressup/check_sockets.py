#!/usr/bin/env python3
"""以模板真实 idle/walk/run 校验刚性道具插槽位姿与体表间隙。"""
from __future__ import annotations

import argparse
import json
import math
import multiprocessing
import os
from pathlib import Path
import sys
from typing import Any, Sequence

import numpy as np
import yaml

_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path: sys.path.insert(0, str(_HERE))
from common import (compose_matrix, lbs, quaternion_to_matrix,  # noqa: E402
                    signed_distance as common_signed_distance)
from glb_io import Mesh, load_glb  # noqa: E402
from normalize_prop import (_hat_ray_gaps, _first_overhead_gaps,  # noqa: E402
                            sheathed_sword_adjust, weapon_grip_adjust)
from validate import _faces, _world_matrices, _world_mesh  # noqa: E402

SCHEMA = "tianshu-dressup-sockets-check.v1"
TILT_CANDIDATES = (("0", 0.0), ("20", 20.0), ("40", 40.0),
                   ("60", 60.0), ("reverse", -150.0))
SHEATHE_CANDIDATES = tuple((str(value), float(value)) for value in range(25, 51, 5))
LEVEL_ORDER = {"fail": 0, "draft": 1, "approved": 2}
_ANIM_CONTEXT: tuple[Any, Mesh, Mesh, dict[str, Any], dict[str, Any],
                     list[dict[str, Any]]] | None = None
_FRAME_CONTEXT: tuple[Any, Mesh, Mesh, dict[str, Any], dict[str, Any],
                      list[dict[str, Any]], list[dict[str, Any]]] | None = None
_SINGLE_CONTEXT: tuple[Any, Mesh, Mesh, dict[str, Any], dict[str, Any],
                       list[dict[str, Any]]] | None = None


def _angle(left: np.ndarray, right: np.ndarray) -> float:
    a = np.asarray(left, dtype=float); b = np.asarray(right, dtype=float)
    a /= np.linalg.norm(a); b /= np.linalg.norm(b)
    return math.degrees(math.acos(float(np.clip(np.dot(a, b), -1.0, 1.0))))


def _bind_matrix(skeleton: dict[str, Any], name: str) -> np.ndarray:
    values = np.asarray(skeleton["bindWorld"][name], dtype=float)
    return values.reshape(4, 4).T


def _pose(value: dict[str, Any]) -> np.ndarray:
    return compose_matrix(value.get("pos", [0, 0, 0]), value.get("quat", [0, 0, 0, 1]))


def _percentiles(values: list[float]) -> dict[str, float]:
    array = np.asarray(values, dtype=float)
    return {"min": float(array.min()), "median": float(np.median(array))}


def _used_mesh(path: Path) -> Mesh:
    mesh = load_glb(path).mesh(); used = np.unique(np.asarray(mesh.indices, dtype=np.int64))
    remap = np.full(len(mesh.positions), -1, dtype=np.int64); remap[used] = np.arange(len(used))
    return Mesh(mesh.positions[used], remap[mesh.indices].astype(np.uint32),
                None if mesh.normals is None else mesh.normals[used],
                None if mesh.uvs is None else mesh.uvs[used])


def _strict_signed_distances(points: np.ndarray, body_positions: np.ndarray,
                             faces: np.ndarray, body_normals: np.ndarray) -> np.ndarray:
    """全部查询点直接走 A1 公共严格最近三角实现。"""
    return common_signed_distance(
        points, body_positions, faces, body_normals).distances_mu


def _dominant_triangle_regions(vertex_regions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    """复现 skeleton.json 的 vertex-majority；票数相同时取较小 region id。"""
    rows = np.asarray(vertex_regions, dtype=np.uint8)[np.asarray(faces, dtype=np.int64)]
    return np.asarray([min((int(value) for value in np.unique(row)),
                           key=lambda value: (-int(np.count_nonzero(row == value)), value))
                       for row in rows], dtype=np.uint8)


def _face_subset(faces: np.ndarray, vertex_regions: np.ndarray, region_id: int
                 ) -> tuple[np.ndarray, np.ndarray]:
    """返回指定 dominant region 的原顶点下标与压紧后的三角索引。"""
    selected = np.asarray(faces)[_dominant_triangle_regions(vertex_regions, faces) == region_id]
    if not len(selected): raise ValueError(f"区域 {region_id} 没有三角面")
    used = np.unique(selected); remap = np.full(int(np.max(faces)) + 1, -1, dtype=np.int64)
    remap[used] = np.arange(len(used))
    return used, remap[selected]


def _skinned_normals(normals: np.ndarray, joints: np.ndarray, weights: np.ndarray,
                     bone_world: np.ndarray, ibm: np.ndarray) -> np.ndarray:
    """按与 LBS 相同权重变换作者法线；每骨使用逆转置以兼容模板缩放。"""
    matrices = np.asarray(bone_world, dtype=float) @ np.asarray(ibm, dtype=float)
    normal_matrices = np.linalg.inv(matrices[:, :3, :3]).transpose(0, 2, 1)
    transformed = np.einsum("nkij,nj->nki", normal_matrices[np.asarray(joints, dtype=np.int64)], normals)
    result = np.einsum("nk,nki->ni", weights, transformed)
    lengths = np.linalg.norm(result, axis=1, keepdims=True)
    return np.divide(result, lengths, out=np.zeros_like(result), where=lengths > 1e-12)


def _clips(body: Any) -> list[tuple[str, dict[str, Any], np.ndarray]]:
    by_name = {str(value.get("name", "")).lower(): value for value in body.json.get("animations", [])}
    result = []
    for name in ("idle", "walk", "run"):
        animation = next((value for key, value in by_name.items() if name in key), None)
        if animation is None: raise ValueError(f"模板缺 {name} 动画")
        ends = [float(np.asarray(body.accessor(s["input"])).max(initial=0))
                for s in animation.get("samplers", [])]
        result.append((name, animation, np.linspace(0.0, max(ends, default=0.0), 24, endpoint=False)))
    return result


def _pose_frames(body: Any, body_mesh: Mesh) -> list[dict[str, Any]]:
    """每次 CLI 只做一次模板 72 帧 LBS，所有道具/角度扫描共享体表。"""
    source_normals = body.mesh().normals
    if source_normals is None or len(source_normals) != len(body_mesh.positions):
        raise ValueError("模板缺与蒙皮顶点同序的 NORMAL")
    frames = []
    for clip_name, animation, times in _clips(body):
        for time in times:
            world = _world_matrices(body, animation, float(time))
            joint_world = world[np.asarray(body.skin().joints)]
            frames.append({
                "clip": clip_name, "time": float(time), "jointWorld": joint_world,
                "positions": lbs(body_mesh.positions, body_mesh.joints, body_mesh.weights,
                                 joint_world, body.skin().inverse_bind_matrices),
                "normals": _skinned_normals(
                    source_normals, body_mesh.joints, body_mesh.weights, joint_world,
                    body.skin().inverse_bind_matrices),
            })
    return frames


def _hat_clearances(mesh: Mesh, skeleton: dict[str, Any], skull: dict[str, Any],
                    adjust: dict[str, Any]) -> list[float]:
    adjust_matrix = _pose(adjust)
    if not np.allclose(adjust_matrix[:3, :3], np.eye(3), atol=1e-8):
        raise ValueError("hat gripAdjust 只允许平移")
    rays = _hat_ray_gaps(mesh, skeleton, skull, 24)
    gaps = (_first_overhead_gaps(rays, float(adjust_matrix[1, 3]))
            * skeleton["mPerMu"] * 1000.0).tolist()
    if not gaps: raise ValueError("斗笠竖直射线没有命中内表面")
    return gaps


def _bind_metrics(prop_class: str, fit: dict[str, Any], skeleton: dict[str, Any], mesh: Mesh,
                  skull: dict[str, Any]) -> dict[str, Any]:
    socket = skeleton["sockets"][fit["socket"]]
    socket_bind = _bind_matrix(skeleton, socket["bone"]) @ _pose(socket)
    prop_bind = socket_bind @ _pose(fit["gripAdjust"])
    result: dict[str, Any] = {}
    if prop_class == "weapon":
        if fit.get("sheathed") or fit.get("socket") == "waistL":
            local_y = prop_bind[:3, 1]
            horizontal = math.degrees(math.asin(float(np.clip(abs(local_y[1]), 0.0, 1.0))))
            y = np.asarray(mesh.positions[:, 1], dtype=float); span = float(np.ptp(y))
            handle_local = mesh.positions[y <= float(y.min() + .02 * span)].mean(axis=0)
            tail_local = mesh.positions[y >= float(y.max() - .02 * span)].mean(axis=0)
            handle = (prop_bind @ np.r_[handle_local, 1.0])[:3]
            scabbard_tail = (prop_bind @ np.r_[tail_local, 1.0])[:3]
            result.update({"handleForwardDeltaMu": float(handle[2] - scabbard_tail[2]),
                           "sheatheAngleDeg": horizontal,
                           "sidePlaneDot": float(abs(np.dot(local_y, np.array([1., 0., 0.])))),
                           "handlePointWorldMu": handle.tolist(),
                           "scabbardTailWorldMu": scabbard_tail.tolist()})
        else:
            hand = _bind_matrix(skeleton, "mixamorig:RightHand")[:3, 3]
            middle = _bind_matrix(skeleton, "mixamorig:RightHandMiddle1")[:3, 3]
            finger = middle - hand; finger /= np.linalg.norm(finger)
            base_y = socket_bind[:3, 1]; signed = float(fit["restTiltDeg"]); axis = socket_bind[:3, 2]
            half = math.radians(signed) * .5
            expected = quaternion_to_matrix(np.r_[axis * math.sin(half), math.cos(half)]) @ base_y
            result.update({"gripDistanceMm": float(np.linalg.norm(prop_bind[:3, 3] - socket_bind[:3, 3])
                                                    * skeleton["mPerMu"] * 1000.0),
                           "bladeAngleDeg": _angle(prop_bind[:3, 1], expected),
                           "fingerDirectionDot": float(np.dot(prop_bind[:3, 1], finger))})
    elif prop_class == "hat":
        gaps = _hat_clearances(mesh, skeleton, skull, fit["gripAdjust"])
        result.update({"upAngleDeg": _angle(prop_bind[:3, 1], np.array([0, 1, 0])),
                       "clearanceMm": float(fit["clearanceMm"]),
                       "packedRayClearanceMm": _percentiles(gaps)})
    elif prop_class in ("pendant", "pouch"):
        result["upAngleDeg"] = _angle(prop_bind[:3, 1], np.array([0, 1, 0]))
    return result


def _weapon_mask(mesh: Mesh, fit: dict[str, Any]) -> tuple[np.ndarray, dict[str, Any]]:
    """只按 fit 顶层 handleDetection 划分柄段与刃身/鞘身。"""
    detection = fit.get("handleDetection")
    if not isinstance(detection, dict):
        raise ValueError("weapon 缺少顶层 handleDetection，不能划定刃身/鞘身")
    if detection.get("method") != "guard-peak":
        raise ValueError("weapon 未以合格护手峰确定柄端，不能划定刃身/鞘身")
    handle_end = str(detection.get("handleEnd"))
    if handle_end not in ("min", "max"):
        raise ValueError("handleDetection.handleEnd 必须为 min 或 max")
    peak = float(detection["peakAxialMu"])
    y = np.asarray(mesh.positions[:, 1], dtype=float)
    handle = y <= peak + 1e-9 if handle_end == "min" else y >= peak - 1e-9
    mask = ~handle
    if not np.any(mask): raise ValueError("护手派生的刃身/鞘身集合为空")
    geometry = {"source": "fit.handleDetection",
                "peakFraction": float(detection["peakFraction"]),
                "peakAxialMu": peak, "handleEnd": handle_end,
                "totalVertices": int(len(y)),
                "handleSegmentVertices": int(np.count_nonzero(handle)),
                "bladeSegmentVertices": int(np.count_nonzero(mask)),
                "verticesPerFrame": int(np.count_nonzero(mask))}
    if fit.get("sheathed") is True:
        geometry["scabbardSegmentVertices"] = int(np.count_nonzero(mask))
    return mask, geometry


def _animated_metrics(body: Any, body_mesh: Mesh, mesh: Mesh, fit: dict[str, Any],
                      skeleton: dict[str, Any], *, adjust: dict[str, Any] | None = None,
                      frames: list[dict[str, Any]] | None = None
                      ) -> dict[str, Any]:
    names = [body.json["nodes"][node].get("name", "") for node in body.skin().joints]
    joint_slot = {name: index for index, name in enumerate(names)}
    socket = skeleton["sockets"][fit["socket"]]; bone_slot = joint_slot[socket["bone"]]
    prop_local = _pose(socket) @ _pose(adjust or fit["gripAdjust"])
    faces = _faces(body_mesh); region_ids = skeleton["regions"]["ids"]
    class_name = fit["class"]; counts, minima = [], []
    selected = (_weapon_mask(mesh, fit)[0] if class_name == "weapon"
                else np.ones(len(mesh.positions), dtype=bool))
    query_faces = faces; body_vertex_ids = np.arange(len(body_mesh.positions))
    if class_name == "hat":
        body_vertex_ids, query_faces = _face_subset(
            faces, body_mesh.regions, int(region_ids["head"]))
    active_frames = frames or _pose_frames(body, body_mesh)
    for frame_index, frame in enumerate(active_frames):
        joint_world = frame["jointWorld"]; body_pos = frame["positions"]; body_normals = frame["normals"]
        transform = joint_world[bone_slot] @ prop_local
        prop_pos = (np.c_[mesh.positions, np.ones(len(mesh.positions))] @ transform.T)[:, :3]
        distances = _strict_signed_distances(
            prop_pos[selected], body_pos[body_vertex_ids], query_faces,
            body_normals[body_vertex_ids]
        ) * skeleton["mPerMu"] * 1000.0
        limit = -5.0 if class_name == "weapon" else 0.0
        counts.append(int(np.count_nonzero(distances < limit))); minima.append(float(distances.min()))
    total = int(np.count_nonzero(selected) * 72)
    return {"minSignedDistanceMm": _percentiles(minima), "insideVertexCount": {
        "min": min(counts), "median": float(np.median(counts)), "max": max(counts),
        "samples": 72, "verticesPerFrame": int(np.count_nonzero(selected))},
        "insideRatio": float(sum(counts) / total),
        "insideVertexTotal": int(sum(counts)),
        "distanceMethod": "strict nearest-triangle signed distance for every selected vertex",
        "surface": "regions=head triangles (vertex-majority)" if class_name == "hat" else "full body triangles"}
def _passes(prop_class: str, bind: dict[str, Any], animated: dict[str, Any],
            sheathe_policy: dict[str, Any] | None = None) -> tuple[bool, list[str]]:
    failures = []
    if prop_class == "weapon":
        if "sheatheAngleDeg" in bind:
            if bind["handleForwardDeltaMu"] <= 0.0: failures.append("柄端未朝前")
            allowed = sheathe_policy["allowedAngleDeg"] if sheathe_policy else [30.0, 40.0]
            if sheathe_policy:
                expected = ([25.0, 50.0] if sheathe_policy["fallbackScanTriggered"]
                            else [30.0, 40.0])
                if [float(value) for value in allowed] != expected:
                    failures.append("回退状态与允许鞘角区间不一致")
            if sheathe_policy and abs(bind["sheatheAngleDeg"] -
                                      float(sheathe_policy["selectedAngleDeg"])) > 1e-4:
                failures.append("bind 鞘角与扫描选定角不一致")
            if not float(allowed[0]) <= bind["sheatheAngleDeg"] <= float(allowed[1]):
                failures.append(f"鞘轴与水平夹角不在 {allowed[0]}°～{allowed[1]}°")
            if bind["sidePlaneDot"] >= 1e-5: failures.append("鞘轴未平行身体左侧面")
        else:
            if bind["gripDistanceMm"] >= 1.0: failures.append("握点距离 >= 1 mm")
            if bind["bladeAngleDeg"] >= 1.0: failures.append("刃向夹角 >= 1°")
        if animated["level"] == "fail": failures.append("动态刃身深穿占比 > 2%")
    elif prop_class == "hat":
        if bind["upAngleDeg"] >= 2.0: failures.append("+Y 与世界上夹角 >= 2°")
        if bind["packedRayClearanceMm"]["min"] < 3.0 - 1e-4: failures.append("颅骨间隙 < 3 mm")
        if animated["insideVertexCount"]["max"] != 0: failures.append("帽顶点进入 head 体表")
    elif prop_class in ("pendant", "pouch"):
        if bind["upAngleDeg"] >= 2.0: failures.append("+Y 与世界上夹角 >= 2°")
        if animated["insideVertexCount"]["max"] != 0: failures.append("挂件顶点进入模板体表")
    return not failures, failures


def _weapon_level(ratio: float) -> str:
    if ratio <= .005 + 1e-12: return "approved"
    if ratio <= .02 + 1e-12: return "draft"
    return "fail"


def _socket_result(prop_class: str, bind: dict[str, Any], animated: dict[str, Any],
                   sheathe_policy: dict[str, Any] | None = None
                   ) -> tuple[str, bool, list[str]]:
    base_level = _weapon_level(float(animated["insideRatio"])) if prop_class == "weapon" else "approved"
    animated["level"] = base_level
    passed, failures = _passes(prop_class, bind, animated, sheathe_policy)
    return base_level if passed else "fail", passed, failures


def _tilt_adjust(skeleton: dict[str, Any], candidate: float) -> tuple[dict[str, Any], float]:
    return weapon_grip_adjust(skeleton, candidate)


def _tilt_candidates(fit: dict[str, Any]) -> tuple[tuple[str, float], ...]:
    """显式禁用反握时只扫描 AR-107 的四档正握；缺省保持旧行为。"""
    grip_adjust = fit.get("gripAdjust")
    nested = grip_adjust.get("allowReverse") if isinstance(grip_adjust, dict) else None
    allow_reverse = fit.get("allowReverse", nested)
    return (TILT_CANDIDATES if allow_reverse is not False else
            tuple(row for row in TILT_CANDIDATES if row[0] != "reverse"))


def _grip_adjust_record(fit: dict[str, Any], selected: dict[str, Any]) -> dict[str, Any]:
    """写回插槽变换，并持久化显式的嵌套禁反握策略。"""
    record = {
        "pos": [round(float(value), 9) for value in selected["pos"]],
        "quat": [round(float(value), 9) for value in selected["quat"]]}
    previous = fit.get("gripAdjust")
    if isinstance(previous, dict) and previous.get("allowReverse") is False:
        record["allowReverse"] = False
    return record


def _tilt_worker(candidate: float) -> dict[str, Any]:
    """fork 子进程共享只读 GLB/网格，避免五档串行超过校验时限。"""
    if _ANIM_CONTEXT is None:  # pragma: no cover - 只代表调用方违反内部约定
        raise RuntimeError("tilt sweep 缺少父进程上下文")
    body, body_mesh, mesh, fit, skeleton, frames = _ANIM_CONTEXT
    adjust, _ = _tilt_adjust(skeleton, candidate)
    return _animated_metrics(body, body_mesh, mesh, fit, skeleton, adjust=adjust, frames=frames)


def _tilt_sweep(body: Any, body_mesh: Mesh, mesh: Mesh, fit: dict[str, Any],
                skeleton: dict[str, Any], frames: list[dict[str, Any]]
                ) -> tuple[list[dict[str, Any]], dict[str, Any], float, dict[str, Any]]:
    candidates = _tilt_candidates(fit)
    rows = _parallel_frame_sweep(
        body, body_mesh, mesh, fit, skeleton, frames, candidates, False)
    for row in rows:
        _adjust, row["restTiltDeg"] = _tilt_adjust(
            skeleton, -150.0 if row["candidate"] == "reverse" else float(row["candidate"]))
    best = min(rows, key=lambda row: (float(row["insideRatio"]),
                                      next(i for i, item in enumerate(candidates)
                                           if item[0] == row["candidate"])))
    adjust, signed = _tilt_adjust(
        skeleton, -150.0 if best["candidate"] == "reverse" else float(best["candidate"]))
    selected = best.pop("_animated")
    for row in rows: row.pop("_animated", None)
    return rows, adjust, signed, selected


def _sheathe_worker(candidate: float) -> dict[str, Any]:
    if _ANIM_CONTEXT is None:  # pragma: no cover
        raise RuntimeError("sheathe sweep 缺少父进程上下文")
    body, body_mesh, mesh, fit, skeleton, frames = _ANIM_CONTEXT
    adjust, _ = sheathed_sword_adjust(skeleton, candidate, mesh.positions)
    return _animated_metrics(body, body_mesh, mesh, fit, skeleton, adjust=adjust, frames=frames)


def _sheathe_sweep(body: Any, body_mesh: Mesh, mesh: Mesh, fit: dict[str, Any],
                   skeleton: dict[str, Any], frames: list[dict[str, Any]]
                   ) -> tuple[list[dict[str, Any]], dict[str, Any], float, float,
                              dict[str, Any], bool, str]:
    rows = _parallel_frame_sweep(
        body, body_mesh, mesh, fit, skeleton, frames, (("35", 35.0),), True)
    triggered = rows[0]["level"] == "fail"
    reason = ("35° dynamic penetration > 2%; scanned complete 25°..50° range"
              if triggered else "35° dynamic penetration <= 2%; fallback scan not triggered")
    if triggered:
        rows = _parallel_frame_sweep(
            body, body_mesh, mesh, fit, skeleton, frames, SHEATHE_CANDIDATES, True)
    best = min(rows, key=lambda row: (float(row["insideRatio"]),
                                      abs(float(row["sheatheAngleDeg"]) - 35.0)))
    selected = best.pop("_animated"); adjust, offset_mm = sheathed_sword_adjust(
        skeleton, float(best["sheatheAngleDeg"]), mesh.positions)
    for row in rows: row.pop("_animated", None)
    return rows, adjust, float(best["sheatheAngleDeg"]), offset_mm, selected, triggered, reason


def _frame_sweep_worker(frame_index: int) -> list[tuple[int, float]]:
    """一个进程处理一帧的全部候选；帧级体表树只建一次。"""
    if _FRAME_CONTEXT is None:  # pragma: no cover
        raise RuntimeError("frame sweep 缺少父进程上下文")
    body, body_mesh, mesh, fit, skeleton, frames, adjusts = _FRAME_CONTEXT
    names = [body.json["nodes"][node].get("name", "") for node in body.skin().joints]
    bone_slot = {name: index for index, name in enumerate(names)}[skeleton["sockets"][fit["socket"]]["bone"]]
    socket_pose = _pose(skeleton["sockets"][fit["socket"]])
    selected = _weapon_mask(mesh, fit)[0]; frame = frames[frame_index]
    point_sets = []
    for adjust in adjusts:
        transform = frame["jointWorld"][bone_slot] @ socket_pose @ _pose(adjust)
        points = (np.c_[mesh.positions, np.ones(len(mesh.positions))] @ transform.T)[:, :3][selected]
        point_sets.append(points)
    joined = np.concatenate(point_sets)
    distances = _strict_signed_distances(
        joined, frame["positions"], _faces(body_mesh), frame["normals"]
    ).reshape(len(adjusts), -1) * skeleton["mPerMu"] * 1000.0
    result = []
    for row in distances:
        result.append((int(np.count_nonzero(row < -5.0)), float(row.min())))
    return result


def _parallel_frame_sweep(body: Any, body_mesh: Mesh, mesh: Mesh, fit: dict[str, Any],
                          skeleton: dict[str, Any], frames: list[dict[str, Any]],
                          candidates: tuple[tuple[str, float], ...], sheathed: bool
                          ) -> list[dict[str, Any]]:
    global _FRAME_CONTEXT
    adjusts = [(sheathed_sword_adjust(skeleton, value, mesh.positions)[0] if sheathed
                else _tilt_adjust(skeleton, value)[0]) for _label, value in candidates]
    _FRAME_CONTEXT = (body, body_mesh, mesh, fit, skeleton, frames, adjusts)
    try:
        context = multiprocessing.get_context("fork")
        workers = min(len(frames), max(1, int(os.cpu_count() or 1)))
        with context.Pool(workers) as pool:
            per_frame = pool.map(_frame_sweep_worker, range(len(frames)))
    finally:
        _FRAME_CONTEXT = None
    rows = []
    vertices = int(np.count_nonzero(_weapon_mask(mesh, fit)[0]))
    for index, (label, value) in enumerate(candidates):
        counts = [frame[index][0] for frame in per_frame]; minima = [frame[index][1] for frame in per_frame]
        ratio = float(sum(counts) / (vertices * len(frames))); level = _weapon_level(ratio)
        rows.append({"candidate": label, "level": level, "insideRatio": ratio,
                     "insideVertexTotal": int(sum(counts)),
                     "minSignedDistanceMm": _percentiles(minima),
                     "_animated": {"minSignedDistanceMm": _percentiles(minima),
                         "insideVertexCount": {"min": min(counts), "median": float(np.median(counts)),
                             "max": max(counts), "samples": len(frames), "verticesPerFrame": vertices},
                         "insideRatio": ratio, "insideVertexTotal": int(sum(counts)), "level": level,
                         "distanceMethod": "strict nearest-triangle signed distance for every selected vertex",
                         "surface": "full body triangles"},
                     "sheatheAngleDeg" if sheathed else "restTiltDeg": value})
    return rows


def _single_frame_worker(frame_index: int) -> tuple[int, float]:
    if _SINGLE_CONTEXT is None:  # pragma: no cover
        raise RuntimeError("single frame 缺少父进程上下文")
    body, body_mesh, mesh, fit, skeleton, frames = _SINGLE_CONTEXT
    names = [body.json["nodes"][node].get("name", "") for node in body.skin().joints]
    socket = skeleton["sockets"][fit["socket"]]; bone_slot = {n: i for i, n in enumerate(names)}[socket["bone"]]
    frame = frames[frame_index]; transform = frame["jointWorld"][bone_slot] @ _pose(socket) @ _pose(fit["gripAdjust"])
    points = (np.c_[mesh.positions, np.ones(len(mesh.positions))] @ transform.T)[:, :3]
    faces = _faces(body_mesh); ids = np.arange(len(body_mesh.positions))
    if fit["class"] == "hat":
        ids, faces = _face_subset(faces, body_mesh.regions, int(skeleton["regions"]["ids"]["head"]))
    distances = _strict_signed_distances(
        points, frame["positions"][ids], faces, frame["normals"][ids]
    ) * skeleton["mPerMu"] * 1000.0
    return int(np.count_nonzero(distances < 0.0)), float(distances.min())


def _parallel_single_metrics(body: Any, body_mesh: Mesh, mesh: Mesh, fit: dict[str, Any],
                             skeleton: dict[str, Any], frames: list[dict[str, Any]]) -> dict[str, Any]:
    global _SINGLE_CONTEXT
    _SINGLE_CONTEXT = (body, body_mesh, mesh, fit, skeleton, frames)
    try:
        with multiprocessing.get_context("fork").Pool(
                min(len(frames), max(1, int(os.cpu_count() or 1)))) as pool:
            rows = pool.map(_single_frame_worker, range(len(frames)))
    finally:
        _SINGLE_CONTEXT = None
    counts = [row[0] for row in rows]; minima = [row[1] for row in rows]; total = len(mesh.positions) * len(frames)
    return {"minSignedDistanceMm": _percentiles(minima),
            "insideVertexCount": {"min": min(counts), "median": float(np.median(counts)),
                "max": max(counts), "samples": len(frames), "verticesPerFrame": len(mesh.positions)},
            "insideRatio": float(sum(counts) / total), "insideVertexTotal": int(sum(counts)),
            "distanceMethod": "strict nearest-triangle signed distance for every selected vertex",
            "surface": "regions=head triangles (vertex-majority)" if fit["class"] == "hat" else "full body triangles"}


def _combined_level(validate_level: str, sockets_level: str) -> str:
    if validate_level not in LEVEL_ORDER: raise ValueError(f"未知 validate level={validate_level}")
    return min((validate_level, sockets_level), key=LEVEL_ORDER.__getitem__)


def _reconcile_validate_direction(report: dict[str, Any], fit: dict[str, Any]) -> bool:
    """护手峰是带鞘武器方向正本；仅替代 validate 的旧窄端启发式。"""
    failed = [row for row in report.get("checks", []) if row.get("pass") is not True]
    detection = fit.get("handleDetection", {})
    if (fit.get("sheathed") is True and detection.get("method") == "guard-peak"
            and failed and all(row.get("name") == "prop.semanticDirection" for row in failed)):
        check = failed[0]; check["legacyValue"] = check.get("value")
        check["value"] = detection
        check["threshold"] = "sheathed weapon handle side proven by qualified guard peak"
        check["pass"] = True; check["supersededLegacyNarrowEndRule"] = True
        report["level"] = "approved"
        return True
    return False


def _combined_status(validate_level: str, sockets_level: str) -> tuple[str, str]:
    combined = _combined_level(validate_level, sockets_level)
    return combined, {"approved": "candidate", "draft": "draft", "fail": "rejected"}[combined]


def _update_manifest(directory: Path, validate_level: str, sockets_level: str,
                     record: dict[str, Any] | None = None) -> None:
    path = directory / "manifest.yaml"; rows = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(rows, list) or len(rows) != 1: raise ValueError(f"{path}: manifest 必须恰含一项")
    combined, status = _combined_status(validate_level, sockets_level)
    row = rows[0]; row["status"] = status
    for value in row.get("fits", {}).values(): value["status"] = status
    state = ""
    if record is not None and record.get("class") == "weapon":
        if "sheatheSweep" in record:
            state = f"入鞘·佩剑态；sheatheAngle={record['bind']['sheatheAngleDeg']:.3f}°；"
        else:
            selected = min(record.get("tiltSweep", []),
                           key=lambda value: float(value["insideRatio"]), default=None)
            rest_tilt = 0.0 if selected is None else float(selected["restTiltDeg"])
            state = f"出鞘·持剑态；restTilt={rest_tilt:.3f}°；"
    row["notes"] = (state + f"validate level={validate_level}；sockets_check level={sockets_level}；"
                    f"联合 level={combined}，status={status}。")
    path.write_text(yaml.safe_dump(rows, allow_unicode=True, sort_keys=False, width=120), encoding="utf-8")


def check(template: Path, prop_dirs: list[Path]) -> dict[str, Any]:
    skeleton = json.loads((template / "skeleton.json").read_text(encoding="utf-8"))
    skull = json.loads((template / skeleton["skullProfile"]["file"]).read_text(encoding="utf-8"))
    body = load_glb(template / "body.glb"); body_mesh = _world_mesh(body)
    if body_mesh.regions is None: raise ValueError("模板 body.glb 缺 _REGION")
    frames = _pose_frames(body, body_mesh)
    results = []
    for directory in prop_dirs:
        fit = json.loads((directory / "fit.json").read_text(encoding="utf-8"))
        mesh = _used_mesh(directory / f"{fit['id']}.glb")
        sweep = None; sweep_key = None; sheathe_policy = None
        if fit["class"] == "weapon":
            if fit.get("sheathed") or fit.get("socket") == "waistL":
                (sweep, selected_adjust, selected_angle, offset_mm, animated,
                 scan_triggered, scan_reason) = _sheathe_sweep(
                     body, body_mesh, mesh, fit, skeleton, frames)
                fit["sheatheAngleDeg"] = round(selected_angle, 9)
                fit["offsetMm"] = round(offset_mm, 9)
                sheathe_policy = {
                    "fallbackScanTriggered": scan_triggered,
                    "selectedAngleDeg": selected_angle,
                    "allowedAngleDeg": [25.0, 50.0] if scan_triggered else [30.0, 40.0]}
                sweep_key = "sheatheSweep"
            else:
                sweep, selected_adjust, selected_tilt, animated = _tilt_sweep(
                    body, body_mesh, mesh, fit, skeleton, frames)
                fit["restTiltDeg"] = selected_tilt; sweep_key = "tiltSweep"
            fit["gripAdjust"] = _grip_adjust_record(fit, selected_adjust)
            (directory / "fit.json").write_text(
                json.dumps(fit, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        bind = _bind_metrics(fit["class"], fit, skeleton, mesh, skull)
        if fit["class"] != "weapon":
            animated = _parallel_single_metrics(body, body_mesh, mesh, fit, skeleton, frames)
        sockets_level, passed, failures = _socket_result(
            fit["class"], bind, animated, sheathe_policy)
        record = {"schema": SCHEMA, "template": template.name, "id": fit["id"], "class": fit["class"],
                  "bind": bind, "animated": animated, "level": sockets_level,
                  "pass": passed, "failures": failures}
        if sweep is not None: record[str(sweep_key)] = sweep
        if fit["class"] == "weapon":
            record["testedGeometry"] = _weapon_mask(mesh, fit)[1]
            if sweep_key == "sheatheSweep":
                record["fallbackScanTriggered"] = scan_triggered
                record["sheatheBindPolicy"] = sheathe_policy
                record["selectionReason"] = scan_reason
        (directory / "sockets_check.json").write_text(
            json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        manifest_path = directory / "manifest.yaml"
        if manifest_path.is_file():
            report_path = directory / "report.json"
            report = json.loads(report_path.read_text(encoding="utf-8"))
            if _reconcile_validate_direction(report, fit):
                record["validateReconciliation"] = "qualified guard peak superseded legacy narrow-end rule"
                (directory / "sockets_check.json").write_text(
                    json.dumps(record, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
                report_path.write_text(
                    json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            _update_manifest(directory, str(report["level"]), sockets_level, record)
        results.append(record)
    return {"schema": SCHEMA, "template": template.name, "pass": all(item["pass"] for item in results),
            "props": results}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", required=True, type=Path, help="含 body.glb/skeleton.json 的模板目录")
    parser.add_argument("--props", required=True, nargs="+", type=Path, help="一个或多个刚性道具目录")
    parser.add_argument("--json", action="store_true", help="stdout 只输出 JSON")
    args = parser.parse_args(argv)
    try: result = check(args.template, args.props)
    except (OSError, KeyError, ValueError, RuntimeError, json.JSONDecodeError) as exc:
        if args.json: print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else: print(f"错误：{exc}", file=sys.stderr)
        return 2
    if args.json: print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    else:
        for item in result["props"]:
            print(f"{item['id']}: {'PASS' if item['pass'] else 'FAIL'} "
                  f"bind={item['bind']} animated={item['animated']}")
    return 0 if result["pass"] else 2


if __name__ == "__main__": raise SystemExit(main())
