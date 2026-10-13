#!/usr/bin/env python3
"""规范化 3D 换装正本骨架、朝向与动画轨道。

只依赖 A1 的 ``glb_io``。坐标使用 mu，矩阵为列向量语义；契约错误返回 2。
"""

from __future__ import annotations

import argparse
import copy
import json
import math
import os
from pathlib import Path
import struct
import sys
import tempfile
from typing import Any, Sequence

import numpy as np

try:
    from .common import matrix_to_quaternion, quaternion_to_matrix
    from .glb_io import GLB, load_glb
except ImportError:
    from common import matrix_to_quaternion, quaternion_to_matrix
    from glb_io import GLB, load_glb


MAGIC = 0x46546C67
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942
TOLERANCE = 1e-5
CONSTANT_TOLERANCE = 1e-6


class RigError(ValueError):
    """输入不满足唯一骨架契约。"""


def _joint_names(glb: GLB) -> list[str]:
    skin = glb.skin()
    return [str(glb.json["nodes"][node].get("name", f"node:{node}")) for node in skin.joints]


def rest_bind_max_diff(glb: GLB) -> float:
    """返回 ``inv(IBM)`` 与静止节点世界矩阵的最大逐元素差。"""
    skin = glb.skin()
    differences = [np.max(np.abs(np.linalg.inv(ibm) - glb.world_matrix(node)))
                   for node, ibm in zip(skin.joints, skin.inverse_bind_matrices)]
    return float(max(differences, default=0.0))


def validate_rig(body: GLB, animation: GLB | None = None) -> dict[str, Any]:
    """校验 rest=bind，并在给动画文件时校验关节名单及 IBM。"""
    if len(body.json.get("skins", [])) != 1:
        raise RigError("正本必须恰有一个 skin")
    difference = rest_bind_max_diff(body)
    if difference >= TOLERANCE:
        raise RigError(f"rest != bind：最大逐元素差 {difference:.9g} >= {TOLERANCE:g}")
    result: dict[str, Any] = {"joints": len(body.skin().joints), "restBindMaxDiff": difference}
    if animation is not None:
        if len(animation.json.get("skins", [])) != 1:
            raise RigError("动画文件必须恰有一个 skin")
        body_names, animation_names = _joint_names(body), _joint_names(animation)
        if body_names != animation_names:
            raise RigError("模型与动画的 skin.joints 名单或顺序不一致")
        ibm_diff = float(np.max(np.abs(body.skin().inverse_bind_matrices - animation.skin().inverse_bind_matrices)))
        if ibm_diff >= TOLERANCE:
            raise RigError(f"模型与动画 IBM 不一致：最大差 {ibm_diff:.9g} >= {TOLERANCE:g}")
        result["animationIbmMaxDiff"] = ibm_diff
    return result


def facing_yaw(glb: GLB) -> tuple[float, np.ndarray]:
    """以 ``(左肩-右肩) × (Spine2-Hips)`` 求面向及归一化 yaw。"""
    names = {name: node for name, node in zip(_joint_names(glb), glb.skin().joints)}
    required = ["mixamorig:LeftShoulder", "mixamorig:RightShoulder", "mixamorig:Spine2", "mixamorig:Hips"]
    if any(name not in names for name in required):
        raise RigError("缺少 yaw 判定所需的 Hips/Spine2/LeftShoulder/RightShoulder")
    point = lambda name: glb.world_matrix(names[name])[:3, 3]
    across = point(required[0]) - point(required[1])
    upward = point(required[2]) - point(required[3])
    facing = np.cross(across, upward)
    facing[1] = 0.0
    length = float(np.linalg.norm(facing))
    if length < 1e-8:
        raise RigError("双肩与脊柱退化，不能判定面向")
    facing /= length
    yaw = math.atan2(float(facing[0]), float(facing[2]))
    return math.degrees(yaw), facing


def strip_constant_tracks(document: dict[str, Any], glb: GLB) -> dict[str, int]:
    """原位移除常量 scale 与非 Hips 常量 translation，返回计数。"""
    removed = {"scale": 0, "translation": 0, "total": 0}
    nodes = document.get("nodes", [])
    for animation in document.get("animations", []):
        kept = []
        for channel in animation.get("channels", []):
            target = channel.get("target", {})
            path, node = target.get("path"), int(target.get("node", -1))
            sampler = animation.get("samplers", [])[int(channel["sampler"])]
            values = np.asarray(glb.accessor(int(sampler["output"])), dtype=np.float64)
            constant = len(values) <= 1 or float(np.max(np.abs(values - values[0]))) <= CONSTANT_TOLERANCE
            hips = 0 <= node < len(nodes) and nodes[node].get("name") == "mixamorig:Hips"
            discard = constant and (path == "scale" or (path == "translation" and not hips))
            if discard:
                removed[str(path)] += 1; removed["total"] += 1
            else:
                kept.append(channel)
        animation["channels"] = kept
    return removed


def import_animations(document: dict[str, Any], binary: bytearray, body: GLB, animation: GLB) -> None:
    """把独立动画的 sampler accessor 紧密复制进正本文档并按骨名重映射节点。"""
    body_nodes = {node.get("name"): index for index, node in enumerate(document.get("nodes", [])) if node.get("name")}
    accessor_map: dict[int, int] = {}

    def copy_accessor(source_index: int) -> int:
        if source_index in accessor_map: return accessor_map[source_index]
        while len(binary) % 4: binary.append(0)
        raw = animation.accessor_bytes(source_index); offset = len(binary); binary.extend(raw)
        view_index = len(document.setdefault("bufferViews", []))
        document["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(raw)})
        spec = copy.deepcopy(animation.json["accessors"][source_index]); spec["bufferView"] = view_index; spec.pop("byteOffset", None)
        accessor_map[source_index] = len(document.setdefault("accessors", [])); document["accessors"].append(spec)
        return accessor_map[source_index]

    imported = []
    for source in animation.json.get("animations", []):
        samplers = [{**copy.deepcopy(item), "input": copy_accessor(int(item["input"])),
                     "output": copy_accessor(int(item["output"]))} for item in source.get("samplers", [])]
        channels = []
        for item in source.get("channels", []):
            channel = copy.deepcopy(item); source_node = int(channel["target"]["node"])
            name = animation.json["nodes"][source_node].get("name")
            if name not in body_nodes: raise RigError(f"动画 channel 节点 {name or source_node} 在模型中不存在")
            channel["target"]["node"] = body_nodes[name]; channels.append(channel)
        output = {key: copy.deepcopy(value) for key, value in source.items() if key not in ("samplers", "channels")}
        output.update({"samplers": samplers, "channels": channels}); imported.append(output)
    document["animations"] = imported


def _rotation_y(angle_rad: float) -> np.ndarray:
    cosine, sine = math.cos(angle_rad), math.sin(angle_rad)
    return np.array([[cosine, 0.0, sine], [0.0, 1.0, 0.0], [-sine, 0.0, cosine]], dtype=np.float64)


def _rotate_accessor(glb: GLB, binary: bytearray, accessor_index: int, rotation: np.ndarray, *, normal: bool = False) -> None:
    """在原 BIN 内改写紧密/stride accessor，并刷新 POSITION min/max。"""
    spec = glb.json["accessors"][accessor_index]
    if spec.get("componentType") != 5126 or spec.get("type") != "VEC3":
        raise RigError("yaw 归一只支持 float32 VEC3 POSITION/NORMAL")
    values = np.asarray(glb.accessor(accessor_index), dtype=np.float64) @ rotation.T
    if normal:
        lengths = np.linalg.norm(values, axis=1)
        values = np.divide(values, lengths[:, None], out=np.zeros_like(values), where=lengths[:, None] > 0)
    view = glb.json["bufferViews"][spec["bufferView"]]
    stride = int(view.get("byteStride", 12))
    start = int(view.get("byteOffset", 0)) + int(spec.get("byteOffset", 0))
    packed = np.asarray(values, dtype="<f4")
    for row, value in enumerate(packed):
        binary[start + row * stride:start + row * stride + 12] = value.tobytes()
    if not normal:
        spec["min"] = packed.min(axis=0).astype(float).tolist()
        spec["max"] = packed.max(axis=0).astype(float).tolist()


def _write_float_accessor(glb: GLB, binary: bytearray, accessor_index: int, values: np.ndarray) -> None:
    spec = glb.json["accessors"][accessor_index]
    width = {"VEC3": 3, "VEC4": 4}.get(spec.get("type"))
    if spec.get("componentType") != 5126 or width is None: raise RigError("动画 yaw 归一只支持 float32 VEC3/VEC4")
    packed = np.asarray(values, dtype="<f4").reshape(int(spec["count"]), width)
    view = glb.json["bufferViews"][spec["bufferView"]]; stride = int(view.get("byteStride", width * 4))
    start = int(view.get("byteOffset", 0)) + int(spec.get("byteOffset", 0))
    for row, value in enumerate(packed): binary[start + row * stride:start + row * stride + width * 4] = value.tobytes()


def apply_yaw(document: dict[str, Any], binary: bytearray, glb: GLB, yaw_deg: float) -> None:
    """把网格与骨架根绕 Y 旋到 +Z，并据新世界矩阵重算 IBM。"""
    if abs(yaw_deg) <= 1e-4:
        return
    rotation = _rotation_y(-math.radians(yaw_deg))
    used: set[tuple[int, bool]] = set()
    for mesh in document.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            for semantic, is_normal in (("POSITION", False), ("NORMAL", True)):
                if semantic in primitive.get("attributes", {}):
                    key = (int(primitive["attributes"][semantic]), is_normal)
                    if key not in used:
                        _rotate_accessor(glb, binary, key[0], rotation, normal=is_normal); used.add(key)
    skin = glb.skin()
    roots = [node for node in skin.joints if glb.parents.get(node) not in set(skin.joints)]
    q_yaw = matrix_to_quaternion(rotation)
    for node_index in roots:
        node = document["nodes"][node_index]
        if "matrix" in node:
            local = np.asarray(node["matrix"], dtype=np.float64).reshape(4, 4).T
            transform = np.eye(4); transform[:3, :3] = rotation
            node["matrix"] = (transform @ local).T.reshape(-1).tolist()
        else:
            translation = rotation @ np.asarray(node.get("translation", [0, 0, 0]), dtype=np.float64)
            old_rotation = quaternion_to_matrix(node.get("rotation", [0, 0, 0, 1]))
            node["translation"] = translation.tolist()
            node["rotation"] = matrix_to_quaternion(quaternion_to_matrix(q_yaw) @ old_rotation).tolist()
    for animation in document.get("animations", []):
        for channel in animation.get("channels", []):
            target = channel.get("target", {}); node_index = int(target.get("node", -1))
            if node_index not in roots or target.get("path") not in ("translation", "rotation"): continue
            accessor = int(animation["samplers"][int(channel["sampler"])] ["output"]); values = np.asarray(glb.accessor(accessor), dtype=float)
            if target["path"] == "translation": values = values @ rotation.T
            else: values = np.asarray([matrix_to_quaternion(rotation @ quaternion_to_matrix(value)) for value in values])
            _write_float_accessor(glb, binary, accessor, values)
    # 根变换左乘 Y 旋转，故每个新 IBM = 旧 IBM · inv(Y)。
    inverse = np.eye(4); inverse[:3, :3] = rotation.T
    ibm_index = skin.inverse_bind_accessor
    if ibm_index is None:
        raise RigError("yaw 归一要求 skin.inverseBindMatrices")
    matrices = skin.inverse_bind_matrices @ inverse
    spec = document["accessors"][ibm_index]; view = document["bufferViews"][spec["bufferView"]]
    stride = int(view.get("byteStride", 64)); start = int(view.get("byteOffset", 0)) + int(spec.get("byteOffset", 0))
    packed = np.asarray(matrices.transpose(0, 2, 1), dtype="<f4").reshape(len(matrices), 16)
    for row, value in enumerate(packed):
        binary[start + row * stride:start + row * stride + 64] = value.tobytes()


def _serialize(document: dict[str, Any], binary: bytes) -> bytes:
    document["buffers"][0]["byteLength"] = len(binary)
    encoded = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode()
    encoded += b" " * ((-len(encoded)) % 4)
    binary += b"\x00" * ((-len(binary)) % 4)
    total = 12 + 8 + len(encoded) + (8 + len(binary) if binary else 0)
    output = bytearray(struct.pack("<III", MAGIC, 2, total))
    output += struct.pack("<II", len(encoded), JSON_CHUNK) + encoded
    if binary:
        output += struct.pack("<II", len(binary), BIN_CHUNK) + binary
    return bytes(output)


def normalize(body_path: Path, out_path: Path, animation_path: Path | None = None) -> dict[str, Any]:
    body = load_glb(body_path); animation = load_glb(animation_path) if animation_path else None
    result = validate_rig(body, animation)
    yaw_deg, facing = facing_yaw(body)
    document, binary = copy.deepcopy(body.json), bytearray(body.bin)
    if animation is not None: import_animations(document, binary, body, animation)
    working = GLB(body.path, document, bytes(binary))
    apply_yaw(document, binary, working, yaw_deg)
    working = GLB(body.path, document, bytes(binary))
    stripped = strip_constant_tracks(document, working)
    payload = _serialize(document, bytes(binary))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{out_path.name}.", suffix=".tmp", dir=out_path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
        os.replace(temporary, out_path)
    except BaseException:
        try: os.unlink(temporary)
        except FileNotFoundError: pass
        raise
    checked = load_glb(out_path); after = rest_bind_max_diff(checked)
    if after >= TOLERANCE:
        raise RigError(f"规范化输出 rest != bind：{after:.9g}")
    result.update({"file": str(out_path), "yawBeforeDeg": yaw_deg, "facingBefore": facing.tolist(),
                   "yawAppliedDeg": -yaw_deg if abs(yaw_deg) > 1e-4 else 0.0, "tracksRemoved": stripped,
                   "restBindMaxDiffAfter": after})
    return result


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="校验并规范化换装正本骨架、+Z 面向及动画轨道")
    parser.add_argument("--body", required=True, type=Path, help="正本蒙皮 GLB")
    parser.add_argument("--anim", type=Path, help="可选独立动画 GLB，用于骨架/IBM 一致性校验")
    parser.add_argument("--out", type=Path, help="输出 GLB；省略时仅校验")
    parser.add_argument("--check", action="store_true", help="只校验，不写输出")
    parser.add_argument("--json", action="store_true", help="stdout 输出单个 JSON 对象")
    args = parser.parse_args(argv)
    try:
        body = load_glb(args.body)
        if args.check or args.out is None:
            result = validate_rig(body, load_glb(args.anim) if args.anim else None)
            yaw_deg, facing = facing_yaw(body)
            result.update({"file": str(args.body), "yawDeg": yaw_deg, "facing": facing.tolist()})
        else:
            result = normalize(args.body, args.out, args.anim)
    except (OSError, ValueError, NotImplementedError, RuntimeError, np.linalg.LinAlgError) as exc:
        if args.json:
            print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else:
            print(f"错误：{exc}", file=sys.stderr)
        return 2
    result["ok"] = True
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")) if args.json else
          f"通过：{result['joints']} joints，rest=bind {result['restBindMaxDiff']:.3g}，yaw {result.get('yawDeg', result.get('yawBeforeDeg')):.6g}°")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
