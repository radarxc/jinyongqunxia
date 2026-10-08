#!/usr/bin/env python3
"""以同一拓扑、分骨平移与 LBS 从中等正本派生体型模板。"""

from __future__ import annotations

import argparse
import copy
from dataclasses import dataclass
from hashlib import sha256
import json
import os
from pathlib import Path
import struct
import sys
import tempfile
import time
from typing import Any, Sequence

import numpy as np

try:
    from .common import lbs
    from .glb_io import GLB, load_glb
    from .normalize_rig import rest_bind_max_diff, validate_rig
except ImportError:
    from common import lbs
    from glb_io import GLB, load_glb
    from normalize_rig import rest_bind_max_diff, validate_rig

MAGIC, JSON_CHUNK, BIN_CHUNK = 0x46546C67, 0x4E4F534A, 0x004E4942
LEG = {"LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg", "RightFoot"}
SPINE = {"Spine", "Spine1", "Spine2", "Neck"}
ARM = {"LeftArm", "LeftForeArm", "RightArm", "RightForeArm"}
SHOULDER = {"LeftShoulder", "RightShoulder"}
REQUIRED = {"Hips", "Head", "LeftArm", "RightArm"} | LEG | SPINE | ARM | SHOULDER
RATIO_TOLERANCE = 0.005
MIN_DISPLACEMENT_LIMIT_MU = 0.04
class DeriveError(ValueError):
    """输入不满足模板派生契约。"""
@dataclass(frozen=True)
class TemplateSpec:
    id: str
    gender: str
    height_m: float
    hips_ratio: float
    shoulder_ratio: float
    source: str
def load_specs(path: Path) -> dict[str, TemplateSpec]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schema") != "tianshu.dressup-template-specs.v1":
        raise DeriveError("template_specs.json schema 不受支持")
    result: dict[str, TemplateSpec] = {}
    required = {"id", "gender", "heightM", "hipsRatio", "shoulderRatio", "source"}
    for row in data.get("templates", []):
        if set(row) != required: raise DeriveError("每个模板规格必须且只能含六个契约字段")
        spec = TemplateSpec(str(row["id"]), str(row["gender"]), float(row["heightM"]),
                            float(row["hipsRatio"]), float(row["shoulderRatio"]), str(row["source"]))
        if spec.id in result or min(spec.height_m, spec.hips_ratio, spec.shoulder_ratio) <= 0:
            raise DeriveError(f"模板规格重复或数值无效：{spec.id}")
        result[spec.id] = spec
    if len(result) != 6: raise DeriveError("规格表必须包含六个模板")
    return result


def _short(name: str) -> str:
    return name.rsplit(":", 1)[-1]

def joint_map(glb: GLB) -> dict[str, int]:
    result = {_short(str(glb.json["nodes"][node].get("name", ""))): node for node in glb.skin().joints}
    missing = sorted(REQUIRED - set(result))
    if missing: raise DeriveError("缺少派生所需关节：" + ", ".join(missing))
    return result

def _worlds(glb: GLB) -> np.ndarray:
    return np.asarray([glb.world_matrix(node) for node in glb.skin().joints], dtype=np.float64)

def _set_translation(document: dict[str, Any], node: int, factor: float) -> None:
    spec = document["nodes"][node]
    if "matrix" in spec: raise DeriveError(f"关节 {spec.get('name', node)} 使用 matrix，不能只改 translation")
    spec["translation"] = (np.asarray(spec.get("translation", [0, 0, 0]), dtype=float) * factor).tolist()

def _move_node_world(document: dict[str, Any], source: GLB, node: int, delta_world: np.ndarray) -> None:
    parent = source.parents.get(node)
    parent_linear = np.eye(3) if parent is None else GLB(source.path, document, source.bin).world_matrix(parent)[:3, :3]
    local_delta = np.linalg.solve(parent_linear, np.asarray(delta_world, dtype=float))
    spec = document["nodes"][node]
    spec["translation"] = (np.asarray(spec.get("translation", [0, 0, 0]), dtype=float) + local_delta).tolist()

def scaled_document(source: GLB, *, k_leg: float, k_spine: float, k_shoulder: float,
                    k_arm: float) -> dict[str, Any]:
    """只改指定子骨 translation；Hips/Head、旋转和 scale 保持源值。"""
    document = copy.deepcopy(source.json); names = joint_map(source)
    for group, factor in ((LEG, k_leg), (SPINE, k_spine), (ARM, k_arm)):
        for name in group: _set_translation(document, names[name], factor)
    # 只沿当前左右肩轴移动 Shoulder 子骨；不缩放其 y/z 分量，以保持规范颈环。
    working = GLB(source.path, document, source.bin)
    left = working.world_matrix(names["LeftArm"])[:3, 3]
    right = working.world_matrix(names["RightArm"])[:3, 3]
    vector = left - right
    if np.linalg.norm(vector) <= 1e-12: raise DeriveError("左右肩关节重合")
    delta = vector * (k_shoulder - 1.0) * 0.5
    _move_node_world(document, source, names["LeftShoulder"], delta)
    _move_node_world(document, source, names["RightShoulder"], -delta)
    return document


def validate_tracks(glb: GLB) -> list[tuple[int, int]]:
    """拒绝非 Hips translation/任意 scale，返回 Hips translation sampler。"""
    hips = joint_map(glb)["Hips"]; roots: list[tuple[int, int]] = []
    for animation_index, animation in enumerate(glb.json.get("animations", [])):
        for channel in animation.get("channels", []):
            target = channel.get("target", {}); path = target.get("path"); node = int(target.get("node", -1))
            if path == "scale": raise DeriveError("动画仍含 scale 轨道；请先运行 normalize_rig.py")
            if path == "translation" and node != hips:
                raise DeriveError("动画仍含非 Hips translation 轨道；请先运行 normalize_rig.py")
            if path == "translation": roots.append((animation_index, int(channel["sampler"])))
    return roots


def _write_accessor(glb: GLB, binary: bytearray, index: int, values: np.ndarray, *, extrema: bool = False) -> None:
    spec = glb.json["accessors"][index]; expected = {"VEC3": 3, "MAT4": 16}.get(spec.get("type"))
    packed = np.asarray(values, dtype="<f4")
    if spec.get("componentType") != 5126 or expected is None or packed.reshape(len(packed), -1).shape[1] != expected:
        raise DeriveError(f"accessor {index} 必须是 float32 VEC3/MAT4")
    rows = packed.transpose(0, 2, 1).reshape(len(packed), 16) if spec["type"] == "MAT4" else packed.reshape(len(packed), 3)
    view = glb.json["bufferViews"][spec["bufferView"]]; stride = int(view.get("byteStride", expected * 4))
    start = int(view.get("byteOffset", 0)) + int(spec.get("byteOffset", 0))
    for row, value in enumerate(rows): binary[start + row * stride:start + row * stride + expected * 4] = value.tobytes()
    if extrema:
        spec["min"], spec["max"] = packed.min(axis=0).astype(float).tolist(), packed.max(axis=0).astype(float).tolist()


def _mesh_accessors(glb: GLB, semantic: str) -> list[int]:
    return list(dict.fromkeys(int(p["attributes"][semantic]) for mesh in glb.json.get("meshes", [])
                              for p in mesh.get("primitives", []) if semantic in p.get("attributes", {})))


def _vertex_arrays(glb: GLB, semantic: str) -> tuple[list[int], np.ndarray]:
    indices = _mesh_accessors(glb, semantic)
    return indices, np.concatenate([np.asarray(glb.accessor(index), dtype=np.float64) for index in indices])


def transform_normals(normals: np.ndarray, joints: np.ndarray, weights: np.ndarray,
                      worlds: np.ndarray, ibm: np.ndarray) -> np.ndarray:
    """按混合蒙皮线性部变换法线并归一。"""
    matrices = (worlds @ ibm)[:, :3, :3]
    transformed = np.einsum("nk,nkij,nj->ni", weights, matrices[joints], normals)
    lengths = np.linalg.norm(transformed, axis=1)
    if np.any(lengths <= 1e-12): raise DeriveError("法线 LBS 后退化为零")
    return transformed / lengths[:, None]


def scale_hips_translation(values: np.ndarray, k_leg: float) -> np.ndarray:
    """根运动随腿链比例缩放，不改输入数组。"""
    tracks = np.asarray(values, dtype=np.float64)
    if tracks.ndim != 2 or tracks.shape[1] != 3 or not np.all(np.isfinite(tracks)):
        raise DeriveError("Hips translation 轨道必须是有限 N×3")
    return tracks * k_leg


def _height(positions: np.ndarray) -> float:
    return float(np.ptp(np.asarray(positions)[:, 1]))


def metrics(glb: GLB, positions: np.ndarray, names: dict[str, int] | None = None) -> dict[str, float]:
    names = names or joint_map(glb); height = _height(positions)
    point = lambda name: glb.world_matrix(names[name])[:3, 3]
    shoulder = float(np.linalg.norm(point("LeftArm") - point("RightArm")))
    floor_y = float(np.asarray(positions)[:, 1].min())
    return {"heightMu": height, "floorYMu": floor_y,
            "hipsRatio": float((point("Hips")[1] - floor_y) / height),
            "shoulderRatio": shoulder / height}


def _deformed(source: GLB, old_ibm: np.ndarray, *, k_leg: float, k_spine: float,
              k_shoulder: float, k_arm: float) -> tuple[GLB, np.ndarray]:
    document = scaled_document(source, k_leg=k_leg, k_spine=k_spine, k_shoulder=k_shoulder,
                               k_arm=k_arm)
    candidate = GLB(source.path, document, source.bin); mesh = source.mesh()
    positions = lbs(mesh.positions, mesh.joints, mesh.weights, _worlds(candidate), old_ibm)
    return candidate, positions


def _solve_chains(source: GLB, old_ibm: np.ndarray, target_height: float, target_hips_ratio: float,
                  target_shoulder_ratio: float, k_arm: float) -> tuple[float, float, float]:
    """以实测网格身高/髋比联立解腿与脊柱，再解肩轴位移。"""
    ratio = target_height / _height(source.mesh().positions)
    values = np.asarray([ratio, ratio], dtype=np.float64)
    epsilon = 1e-5
    for _ in range(10):
        glb, positions = _deformed(source, old_ibm, k_leg=values[0], k_spine=values[1],
                                   k_shoulder=1.0, k_arm=k_arm)
        actual = metrics(glb, positions)
        residual = np.asarray([actual["heightMu"] - target_height, actual["hipsRatio"] - target_hips_ratio])
        jacobian = np.empty((2, 2), dtype=np.float64)
        for column in range(2):
            probe = values.copy(); probe[column] += epsilon
            probe_glb, probe_positions = _deformed(source, old_ibm, k_leg=probe[0], k_spine=probe[1],
                                                   k_shoulder=1.0, k_arm=k_arm)
            probe_metrics = metrics(probe_glb, probe_positions)
            jacobian[:, column] = (np.asarray([probe_metrics["heightMu"], probe_metrics["hipsRatio"]])
                                   - np.asarray([actual["heightMu"], actual["hipsRatio"]])) / epsilon
        try: values -= np.linalg.solve(jacobian, residual)
        except np.linalg.LinAlgError as exc: raise DeriveError("腿/脊柱缩放方程奇异") from exc
    glb, _ = _deformed(source, old_ibm, k_leg=values[0], k_spine=values[1], k_shoulder=1.0, k_arm=k_arm)
    names = joint_map(source)
    width = float(np.linalg.norm(glb.world_matrix(names["LeftArm"])[:3, 3]
                                 - glb.world_matrix(names["RightArm"])[:3, 3]))
    if width <= 1e-12: raise DeriveError("肩关节距为零")
    return float(values[0]), float(values[1]), float(target_shoulder_ratio * target_height / width)


def canonical_positions(positions: np.ndarray) -> tuple[np.ndarray, float]:
    """返回脚底 y=0 的规范坐标副本及原脚底 y；不改写派生 GLB。"""
    result = np.asarray(positions, dtype=np.float64).copy()
    if result.ndim != 2 or result.shape[1] != 3 or not np.all(np.isfinite(result)):
        raise DeriveError("顶点必须是有限 N×3")
    floor_y = float(result[:, 1].min())
    result[:, 1] -= floor_y
    return result, floor_y


def canonical_displacement(source_positions: np.ndarray, target_positions: np.ndarray) -> tuple[float, float, float]:
    """在源/目标各自脚底 y=0 后逐顶点比较，避免整体平移规避门禁。"""
    source, source_floor = canonical_positions(source_positions)
    target, target_floor = canonical_positions(target_positions)
    if source.shape != target.shape: raise DeriveError("源与派生顶点数不一致")
    displacement = np.linalg.norm(target - source, axis=1)
    return float(displacement.max(initial=0.0)), source_floor, target_floor


def displacement_limit(source_height: float, target_height: float) -> float:
    return max(MIN_DISPLACEMENT_LIMIT_MU, 2.0 * abs(target_height - source_height))


def enforce_gates(error: dict[str, float], max_displacement: float, contains_nan: bool,
                  max_displacement_limit: float = MIN_DISPLACEMENT_LIMIT_MU) -> None:
    if contains_nan: raise DeriveError("派生顶点或法线含 NaN/Inf")
    if any(abs(error[key]) > RATIO_TOLERANCE for key in ("heightRatio", "hipsRatio", "shoulderRatio")):
        raise DeriveError("身高比、髋高比或肩宽比未命中 ±0.5% 契约")
    if max_displacement > max_displacement_limit:
        raise DeriveError(
            f"规范坐标最大顶点位移 {max_displacement:.8f} mu 超过 {max_displacement_limit:.8f} mu")


def source_m_per_mu(source_path: Path, source_height: float, source_spec: TemplateSpec) -> float:
    """从源 skeleton.json 继承米制标尺；不允许目标结果反算标尺。"""
    skeleton_path = source_path.with_name("skeleton.json")
    if not skeleton_path.exists(): raise DeriveError(f"源模板缺少 {skeleton_path.name}，不能确定米制标尺")
    data = json.loads(skeleton_path.read_text(encoding="utf-8"))
    value = float(data.get("mPerMu", 0)); declared_height = float(data.get("defaultHeightM", 0))
    if value <= 0 or abs(declared_height - source_spec.height_m) > 1e-6:
        raise DeriveError("源 skeleton.json 的 mPerMu/defaultHeightM 与规格不一致")
    if abs(source_height * value - source_spec.height_m) > 1e-6:
        raise DeriveError("源 skeleton.json 的米制标尺与源 GLB 实测身高不一致")
    return value


def _serialize(document: dict[str, Any], binary: bytes) -> bytes:
    document["buffers"][0]["byteLength"] = len(binary)
    encoded = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    encoded += b" " * ((-len(encoded)) % 4); binary += b"\x00" * ((-len(binary)) % 4)
    total = 12 + 8 + len(encoded) + (8 + len(binary) if binary else 0)
    output = bytearray(struct.pack("<III", MAGIC, 2, total))
    output += struct.pack("<II", len(encoded), JSON_CHUNK) + encoded
    if binary: output += struct.pack("<II", len(binary), BIN_CHUNK) + binary
    return bytes(output)


def _atomic_bytes(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle: handle.write(payload)
        os.replace(temporary, path)
    except BaseException:
        try: os.unlink(temporary)
        except FileNotFoundError: pass
        raise


def derive(source_path: Path, specs_path: Path, target_id: str, out_dir: Path) -> dict[str, Any]:
    started = time.perf_counter(); specs = load_specs(specs_path)
    if target_id not in specs: raise DeriveError(f"规格表不存在模板 {target_id}")
    target = specs[target_id]
    if target.source not in specs: raise DeriveError(f"规格源 {target.source} 不存在")
    if target.id == target.source: raise DeriveError("目标就是中等源模板，无需派生")
    source = load_glb(source_path); validate_rig(source); root_tracks = validate_tracks(source)
    if len(source.json.get("meshes", [])) != 1: raise DeriveError("派生正本必须恰有一个 mesh")
    mesh, skin, names = source.mesh(), source.skin(), joint_map(source)
    if mesh.joints is None or mesh.weights is None or mesh.normals is None:
        raise DeriveError("正本必须含 NORMAL / JOINTS_0 / WEIGHTS_0")
    source_metrics = metrics(source, mesh.positions, names); source_height = source_metrics["heightMu"]
    source_spec = specs[target.source]; height_ratio = target.height_m / source_spec.height_m
    target_height = source_height * height_ratio; k_arm = height_ratio
    k_leg, k_spine, k_shoulder = _solve_chains(
        source, skin.inverse_bind_matrices, target_height, target.hips_ratio, target.shoulder_ratio, k_arm)
    document = scaled_document(source, k_leg=k_leg, k_spine=k_spine, k_shoulder=k_shoulder,
                               k_arm=k_arm)
    binary = bytearray(source.bin); working = GLB(source.path, document, bytes(binary)); worlds = _worlds(working)
    positions = lbs(mesh.positions, mesh.joints, mesh.weights, worlds, skin.inverse_bind_matrices)
    normals = transform_normals(mesh.normals, mesh.joints, mesh.weights, worlds, skin.inverse_bind_matrices)
    pos_accessors, _ = _vertex_arrays(source, "POSITION"); normal_accessors, _ = _vertex_arrays(source, "NORMAL")
    offset = 0
    for index in pos_accessors:
        count = int(document["accessors"][index]["count"]); _write_accessor(working, binary, index, positions[offset:offset + count], extrema=True); offset += count
    offset = 0
    for index in normal_accessors:
        count = int(document["accessors"][index]["count"]); _write_accessor(working, binary, index, normals[offset:offset + count]); offset += count
    for animation_index, sampler_index in root_tracks:
        sampler = document["animations"][animation_index]["samplers"][sampler_index]; accessor = int(sampler["output"])
        values = scale_hips_translation(source.accessor(accessor), k_leg)
        _write_accessor(working, binary, accessor, values, extrema=True)
    new_ibm = np.linalg.inv(worlds); ibm_accessor = skin.inverse_bind_accessor
    if ibm_accessor is None: raise DeriveError("skin 必须显式提供 inverseBindMatrices")
    _write_accessor(working, binary, ibm_accessor, new_ibm)
    output_path = out_dir / "body.glb"; _atomic_bytes(output_path, _serialize(document, bytes(binary)))
    output = load_glb(output_path); validate_rig(output); output_mesh = output.mesh(); measured = metrics(output, output_mesh.positions)
    source_names = [source.json["nodes"][node].get("name") for node in skin.joints]
    output_names = [output.json["nodes"][node].get("name") for node in output.skin().joints]
    if source_names != output_names: raise DeriveError("写出后 skin.joints 名称或顺序改变")
    if not np.array_equal(mesh.indices, output_mesh.indices):
        raise DeriveError("写出后拓扑 indices 改变")
    if mesh.uvs is not None and not np.array_equal(mesh.uvs, output_mesh.uvs): raise DeriveError("写出后 UV 改变")
    if not np.array_equal(mesh.joints, output_mesh.joints) or not np.array_equal(mesh.weights, output_mesh.weights):
        raise DeriveError("写出后蒙皮 joints/weights 改变")
    for source_animation, output_animation in zip(source.json.get("animations", []), output.json.get("animations", [])):
        source_rotation = [source.accessor(source_animation["samplers"][c["sampler"]]["output"])
                           for c in source_animation["channels"] if c["target"]["path"] == "rotation"]
        output_rotation = [output.accessor(output_animation["samplers"][c["sampler"]]["output"])
                           for c in output_animation["channels"] if c["target"]["path"] == "rotation"]
        if len(source_rotation) != len(output_rotation) or any(not np.array_equal(a, b) for a, b in zip(source_rotation, output_rotation)):
            raise DeriveError("写出后 rotation 轨道改变")
    preserved = ("materials", "textures", "images", "samplers")
    if any(source.json.get(key) != output.json.get(key) for key in preserved): raise DeriveError("写出后材质或贴图引用改变")
    contains_nan = bool(not np.all(np.isfinite(output_mesh.positions)) or not np.all(np.isfinite(output_mesh.normals)))
    elapsed = time.perf_counter() - started
    m_per_mu = source_m_per_mu(source_path, source_height, source_spec)
    measured_height_m = measured["heightMu"] * m_per_mu
    measured_height_ratio = measured["heightMu"] / source_height
    max_displacement, source_floor_y, target_floor_y = canonical_displacement(
        mesh.positions, output_mesh.positions)
    max_displacement_limit = displacement_limit(source_height, target_height)
    report: dict[str, Any] = {
        "schema": "tianshu.dressup-template-derive.v1",
        "source": {"file": str(source_path), "sha256": sha256(source_path.read_bytes()).hexdigest(),
                   "templateId": target.source},
        "targetId": target.id, "gender": target.gender, "heightM": target.height_m,
        "scale": {"leg": k_leg, "spine": k_spine, "shoulder": k_shoulder,
                  "arm": k_arm},
        "measured": {**measured, "heightM": measured_height_m, "heightRatio": measured_height_ratio,
                     "mPerMu": m_per_mu, "maxVertexDisplacementMu": max_displacement,
                     "maxVertexDisplacementLimitMu": max_displacement_limit,
                     "sourceFloorYMu": source_floor_y, "targetFloorYMu": target_floor_y,
                     "containsNaN": contains_nan},
        "target": {"heightM": target.height_m, "heightMu": target_height, "heightRatio": height_ratio,
                   "hipsRatio": target.hips_ratio,
                   "shoulderRatio": target.shoulder_ratio},
        "error": {"heightM": measured_height_m - target.height_m,
                  "heightRatio": measured_height_ratio - height_ratio,
                  "hipsRatio": measured["hipsRatio"] - target.hips_ratio,
                  "shoulderRatio": measured["shoulderRatio"] - target.shoulder_ratio},
        "validation": {"topologyUnchanged": True, "uvUnchanged": True, "skinWeightsUnchanged": True,
                       "materialTexturesUnchanged": True, "jointOrderUnchanged": True,
                       "restBindMaxDiff": rest_bind_max_diff(output), "rotationTracksUnchanged": True,
                       "hipsTranslationTracksScaled": len(root_tracks),
                       "hipsTranslationScale": k_leg, "canonicalFloorYMu": 0.0, "nan": contains_nan},
        "elapsedSec": elapsed, "outputSha256": sha256(output_path.read_bytes()).hexdigest(),
    }
    enforce_gates(report["error"], max_displacement, contains_nan, max_displacement_limit)
    (out_dir / "derive.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return report


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="从中等 GLB 以分骨 translation + LBS 派生换装模板")
    parser.add_argument("--from", dest="source", required=True, type=Path, help="已过 normalize_rig.py --check 的中等 body.glb")
    parser.add_argument("--spec", required=True, type=Path, help="template_specs.json")
    parser.add_argument("--id", required=True, help="目标模板 id")
    parser.add_argument("--out", required=True, type=Path, help="输出目录")
    parser.add_argument("--json", action="store_true", help="stdout 只输出一个 JSON 对象")
    args = parser.parse_args(argv)
    try:
        result = derive(args.source, args.spec, args.id, args.out)
    except (OSError, ValueError, NotImplementedError, RuntimeError, np.linalg.LinAlgError) as exc:
        if args.json: print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else: print(f"错误：{exc}", file=sys.stderr)
        return 2
    result = {"ok": True, **result}
    if args.json: print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    else:
        measured = result["measured"]
        print(f"通过：{result['targetId']}，身高 {measured['heightM']:.6f} m，髋比 {measured['hipsRatio']:.6f}，"
              f"肩比 {measured['shoulderRatio']:.6f}，最大位移 {measured['maxVertexDisplacementMu']:.6f} mu，"
              f"NaN={measured['containsNaN']}，{result['elapsedSec']:.3f} s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
