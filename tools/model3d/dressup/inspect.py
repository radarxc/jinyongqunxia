#!/usr/bin/env python3
"""离线体检 GLB：几何、节点、骨架、材质、蒙皮与 bind pose。

JSON 数值遵循 tech/11：坐标/距离字段带 Mu，角度带 Deg，文件大小带 Bytes。
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# 文件名按规格必须叫 inspect.py。其他同目录脚本先 import NumPy 时，Python 会把
# 本文件当标准库 inspect 找到；此分支加载真正标准库实现且不加载 NumPy，避免循环导入。
_SCRIPT_DIR = Path(__file__).resolve().parent
if __name__ == "inspect":
    _stdlib_source = Path(os.__file__).with_name("inspect.py").read_text(encoding="utf-8")
    exec(compile(_stdlib_source, str(Path(os.__file__).with_name("inspect.py")), "exec"), globals())

import argparse
from collections import Counter
from io import BytesIO
import json
from typing import Any, Sequence

if __name__ != "inspect":
    import numpy as np
    from PIL import Image

    try:
        from .common import connected_components, edge_statistics
        from .glb_io import GLB, load_glb
    except ImportError:
        from common import connected_components, edge_statistics
        from glb_io import GLB, load_glb


def _clean(value: Any) -> Any:
    """把 NumPy 数值转成可 JSON 序列化的有限 Python 数值。"""
    if isinstance(value, dict): return {key: _clean(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)): return [_clean(item) for item in value]
    if isinstance(value, np.ndarray): return _clean(value.tolist())
    if isinstance(value, np.integer): return int(value)
    if isinstance(value, np.floating): return float(value) if np.isfinite(value) else None
    return value


def _node_tree(glb: GLB) -> list[dict[str, Any]]:
    nodes = glb.json.get("nodes", [])
    scene_index = glb.json.get("scene")
    if scene_index is not None:
        roots = glb.json["scenes"][scene_index].get("nodes", [])
    else:
        roots = [index for index in range(len(nodes)) if index not in glb.parents]

    def descend(index: int) -> dict[str, Any]:
        node = nodes[index]
        return {
            "index": index, "name": node.get("name", f"node_{index}"),
            "mesh": node.get("mesh"), "skin": node.get("skin"),
            "children": [descend(child) for child in node.get("children", [])],
        }
    return [descend(index) for index in roots]


def _skeleton(glb: GLB) -> dict[str, Any]:
    if not glb.json.get("skins"):
        return {"joints": 0, "names": [], "nodes": [], "restBindMaxDiff": None}
    skin = glb.skin(0); joint_set = set(skin.joints)
    entries = []
    for node_index in skin.joints:
        parent = glb.parents.get(node_index)
        entries.append({
            "index": node_index, "name": glb.json["nodes"][node_index].get("name", f"node_{node_index}"),
            "parent": parent if parent in joint_set else None,
            "children": [child for child in glb.json["nodes"][node_index].get("children", []) if child in joint_set],
        })
    differences = [float(np.max(np.abs(np.linalg.inv(ibm) - glb.world_matrix(joint))))
                   for joint, ibm in zip(skin.joints, skin.inverse_bind_matrices)]
    return {
        "joints": len(skin.joints), "names": [entry["name"] for entry in entries], "nodes": entries,
        "restBindMaxDiff": max(differences, default=0.0),
    }


def _angle_from_vertical(vector: np.ndarray) -> float:
    length = np.linalg.norm(vector)
    if length == 0.0: return float("nan")
    return float(np.degrees(np.arccos(np.clip(abs(vector[1]) / length, -1.0, 1.0))))


def _rest_angles(glb: GLB) -> dict[str, float | None]:
    if not glb.json.get("skins"): return {"armAngleDeg": None, "forearmAngleDeg": None}
    skin = glb.skin(0)
    names = {glb.json["nodes"][index].get("name", ""): index for index in skin.joints}
    sides: dict[str, dict[str, float]] = {}
    for side in ("Left", "Right"):
        required = [f"mixamorig:{side}{part}" for part in ("Arm", "ForeArm", "Hand")]
        if not all(name in names for name in required): continue
        points = [glb.world_matrix(names[name])[:3, 3] for name in required]
        sides[side.lower()] = {"armDeg": _angle_from_vertical(points[1] - points[0]),
                               "forearmDeg": _angle_from_vertical(points[2] - points[1])}
    left = sides.get("left")
    arms = [value["armDeg"] for value in sides.values()]
    return {"armAngleDeg": float(np.mean(arms)) if arms else None,
            "forearmAngleDeg": left["forearmDeg"] if left else None, **sides}


def _materials(glb: GLB) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    image_info = []
    for index, spec in enumerate(glb.json.get("images", [])):
        info: dict[str, Any] = {"index": index, "name": spec.get("name"), "mimeType": spec.get("mimeType")}
        try:
            image = glb.image(index); info["byteLengthBytes"] = len(image.data)
            with Image.open(BytesIO(image.data)) as decoded: info["widthPx"], info["heightPx"] = decoded.size
        except (NotImplementedError, ValueError, OSError) as exc:
            info["error"] = str(exc)
        image_info.append(info)
    textures = glb.json.get("textures", [])
    materials = []
    for index, material in enumerate(glb.json.get("materials", [])):
        pbr = material.get("pbrMetallicRoughness", {}); texture = pbr.get("baseColorTexture", {}).get("index")
        source = textures[texture].get("source") if texture is not None and texture < len(textures) else None
        materials.append({"index": index, "name": material.get("name"), "unlit": "KHR_materials_unlit" in material.get("extensions", {}),
                          "doubleSided": bool(material.get("doubleSided", False)), "baseColorTexture": texture, "image": source})
    return materials, image_info


def _geometry(glb: GLB) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    primitive_info, positions_world, global_faces = [], [], []
    vertex_offset = 0
    mesh_nodes: dict[int, list[int]] = {}
    for node_index, node in enumerate(glb.json.get("nodes", [])):
        if "mesh" in node: mesh_nodes.setdefault(int(node["mesh"]), []).append(node_index)
    for mesh_index, mesh in enumerate(glb.meshes()):
        node_indices = mesh_nodes.get(mesh_index, []) or [None]
        for node_index in node_indices:
            world = glb.world_matrix(node_index) if node_index is not None else np.eye(4)
            points = (np.c_[mesh.positions, np.ones(len(mesh.positions))] @ world.T)[:, :3]
            positions_world.append(points)
            for section in mesh.primitives:
                index_slice = mesh.indices[section.index_start:section.index_start + section.index_count]
                faces = index_slice.reshape(-1, 3) + vertex_offset
                global_faces.append(faces)
                local_points = points[section.vertex_start:section.vertex_start + section.vertex_count]
                primitive_info.append({
                    "mesh": mesh_index, "primitive": section.primitive_index, "node": node_index,
                    "vertices": section.vertex_count, "triangles": section.index_count // 3,
                    "attributes": list(section.attributes), "material": section.material,
                    "worldBoundsMu": {"min": local_points.min(axis=0), "max": local_points.max(axis=0)},
                })
            vertex_offset += len(points)
    if positions_world:
        all_points = np.concatenate(positions_world); all_faces = np.concatenate(global_faces) if global_faces else np.empty((0, 3), dtype=np.int64)
        components = connected_components(len(all_points), all_faces); boundary, nonmanifold = edge_statistics(all_faces)
        summary = {
            "vertices": len(all_points), "triangles": len(all_faces),
            "worldBoundsMu": {"min": all_points.min(axis=0), "max": all_points.max(axis=0)},
            "connectedComponents": len(components), "componentVertexCounts": sorted((len(item) for item in components), reverse=True),
            "boundaryEdges": len(boundary), "nonManifoldEdges": len(nonmanifold),
        }
    else:
        summary = {"vertices": 0, "triangles": 0, "worldBoundsMu": None, "connectedComponents": 0,
                   "componentVertexCounts": [], "boundaryEdges": 0, "nonManifoldEdges": 0}
    return primitive_info, summary


def _skinning(glb: GLB) -> dict[str, Any] | None:
    meshes = glb.meshes()
    influenced = [mesh for mesh in meshes if mesh.joints is not None and mesh.weights is not None]
    if not influenced: return None
    joints = np.concatenate([mesh.joints for mesh in influenced]); weights = np.concatenate([mesh.weights for mesh in influenced])
    active = weights > 1e-6; counts = active.sum(axis=1); sums = weights.sum(axis=1)
    used = np.unique(joints[active]) if np.any(active) else np.empty(0, dtype=np.uint16)
    distribution = Counter(int(value) for value in counts)
    return {
        "vertices": len(weights), "bonesPerVertex": {str(key): distribution[key] for key in sorted(distribution)},
        "weightSumRange": [float(sums.min()), float(sums.max())], "maxWeight": float(weights.max(initial=0.0)),
        "usedJointSlots": len(used), "usedJointIndices": used.tolist(),
    }


def inspect_glb(path: str | Path) -> dict[str, Any]:
    """读取并返回一份完整、可 JSON 序列化的 GLB 体检报告。"""
    source = Path(path); glb = load_glb(source)
    primitives, geometry = _geometry(glb); materials, images = _materials(glb)
    animations = []
    for animation in glb.json.get("animations", []):
        durations = [float(np.max(glb.accessor(sampler["input"]), initial=0.0)) for sampler in animation.get("samplers", [])]
        animations.append({"name": animation.get("name"), "durationSec": max(durations, default=0.0),
                           "channels": len(animation.get("channels", []))})
    report = {
        "schema": "tianshu-dressup-inspect.v1", "file": str(source), "fileBytes": source.stat().st_size,
        "extensionsUsed": glb.json.get("extensionsUsed", []), "nodeTree": _node_tree(glb),
        "skeleton": _skeleton(glb), "primitives": primitives, "geometry": geometry,
        "materials": materials, "images": images, "skinning": _skinning(glb),
        "restPose": _rest_angles(glb), "animations": animations,
    }
    return _clean(report)


def _human(report: dict[str, Any]) -> str:
    geometry, skeleton = report["geometry"], report["skeleton"]
    lines = [f"文件：{report['file']}（{report['fileBytes']} bytes）",
             f"几何：{geometry['vertices']} 顶点 / {geometry['triangles']} 三角 / {len(report['primitives'])} primitive",
             f"拓扑：{geometry['connectedComponents']} 连通块 / {geometry['boundaryEdges']} 边界边 / {geometry['nonManifoldEdges']} 非流形边",
             f"骨架：{skeleton['joints']} 关节；rest=bind 最大差 {skeleton['restBindMaxDiff']}",
             f"A 姿势：上臂 {report['restPose']['armAngleDeg']}°；左前臂 {report['restPose']['forearmAngleDeg']}°",
             f"材质/图片：{len(report['materials'])} / {len(report['images'])}"]
    if report["skinning"]:
        skin = report["skinning"]; lines.append(f"蒙皮：{skin['usedJointSlots']} 个关节槽；权重和范围 {skin['weightSumRange']}")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="体检 GLB 的节点、骨架、几何、材质、蒙皮与 bind pose")
    parser.add_argument("path", help="输入 .glb 路径（坐标单位为模型单位 mu）")
    parser.add_argument("--json", action="store_true", help="stdout 只输出一个 JSON 对象")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    """命令行入口：成功 0，输入/参数错误 2。"""
    parser = build_parser(); args = parser.parse_args(argv)
    try: report = inspect_glb(args.path)
    except (OSError, ValueError, NotImplementedError, RuntimeError) as exc:
        print(json.dumps({"error": str(exc)}, ensure_ascii=False) if args.json else f"错误：{exc}", file=sys.stderr); return 2
    print(json.dumps(report, ensure_ascii=False, separators=(",", ":")) if args.json else _human(report))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
