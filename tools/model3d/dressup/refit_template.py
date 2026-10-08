#!/usr/bin/env python3
"""在共享骨名的纸娃娃模板间重贴合蒙皮衣物。

每个影响先逆回来源骨局部，沿该关节到有效子关节的实际骨轴缩放，再由目标 bind world 正变换；
多影响按原权重混合。A == B 时走同一公式且误差仅为 float32 舍入。
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import resource
import sys
import time
from typing import Any, Sequence

_SCRIPT_DIR = Path(__file__).resolve().parent
_removed = [(i, value) for i, value in enumerate(sys.path)
            if Path(value or os.getcwd()).resolve() == _SCRIPT_DIR]
sys.path[:] = [value for value in sys.path
               if Path(value or os.getcwd()).resolve() != _SCRIPT_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed:
    sys.path.insert(min(_index, len(sys.path)), _value)

import numpy as np

try:
    from .common import edge_statistics
    from .fit_garment import (GarmentError, GarmentGateError, SurfaceIndex, _base_color, _portable, _round,
                              _sha256, derive_regions, hide_regions, load_world_mesh, mm_to_mu,
                              push_out, verify_serialized_topology, vertex_normals)
    from .glb_io import PrimitiveRange, load_glb, write_skinned_glb
except ImportError:
    from common import edge_statistics
    from fit_garment import (GarmentError, GarmentGateError, SurfaceIndex, _base_color, _portable, _round,
                             _sha256, derive_regions, hide_regions, load_world_mesh, mm_to_mu,
                             push_out, verify_serialized_topology, vertex_normals)
    from glb_io import PrimitiveRange, load_glb, write_skinned_glb


def _worlds(skeleton: dict[str, Any]) -> np.ndarray:
    return np.asarray([np.asarray(skeleton["bindWorld"][name], dtype=np.float64).reshape(4, 4).T
                       for name in skeleton["joints"]])


def _effective_children(skeleton: dict[str, Any]) -> np.ndarray:
    """选控制骨段的子关节；分支优先同侧主链，再取最长非 End 子段。"""
    names = skeleton["joints"]; parents = np.asarray(skeleton["parents"], dtype=np.int64)
    worlds = _worlds(skeleton); points = worlds[:, :3, 3]
    result = np.full(len(names), -1, dtype=np.int64)
    chain = (("UpLeg", "Leg"), ("Leg", "Foot"), ("Foot", "ToeBase"),
             ("Shoulder", "Arm"), ("Arm", "ForeArm"), ("ForeArm", "Hand"),
             ("Spine", "Spine1"), ("Spine1", "Spine2"), ("Spine2", "Neck"),
             ("Neck", "Head"))
    for index, name in enumerate(names):
        suffix = name.split(":")[-1]
        stem = suffix[4:] if suffix.startswith("Left") else suffix[5:] if suffix.startswith("Right") else suffix
        children = np.flatnonzero(parents == index)
        children = np.asarray([child for child in children if not names[int(child)].endswith("_End")], dtype=np.int64)
        wanted = next((target for source, target in chain if stem == source), None)
        if wanted is not None:
            match = [child for child in children if names[int(child)].split(":")[-1].endswith(wanted)]
            if match: result[index] = int(match[0]); continue
        if len(children):
            distances = np.linalg.norm(points[children] - points[index], axis=1)
            result[index] = int(children[int(np.argmax(distances))])
    return result


def _axis_scale(source_axis: np.ndarray, target_axis: np.ndarray, ratio: float) -> np.ndarray:
    """把来源实际骨轴旋到目标轴，并只沿轴向应用骨长比。"""
    a = source_axis / np.linalg.norm(source_axis); b = target_axis / np.linalg.norm(target_axis)
    cross = np.cross(a, b); dot = float(np.clip(a @ b, -1.0, 1.0)); norm = np.linalg.norm(cross)
    if norm <= 1e-12:
        if dot > 0.0: rotation = np.eye(3)
        else:
            helper = np.eye(3)[int(np.argmin(np.abs(a)))]
            axis = np.cross(a, helper); axis /= np.linalg.norm(axis)
            rotation = 2.0 * np.outer(axis, axis) - np.eye(3)
    else:
        skew = np.array([[0.0, -cross[2], cross[1]], [cross[2], 0.0, -cross[0]],
                         [-cross[1], cross[0], 0.0]])
        rotation = np.eye(3) + skew + skew @ skew * ((1.0 - dot) / (norm * norm))
    return rotation @ (np.eye(3) + (ratio - 1.0) * np.outer(a, a))


def refit_positions(positions: np.ndarray, joints: np.ndarray, weights: np.ndarray,
                    from_skeleton: dict[str, Any], to_skeleton: dict[str, Any]) -> tuple[np.ndarray, dict[str, float]]:
    """逆来源骨局部再正变换到目标骨，返回新位置与逐骨骨长比。"""
    source_names = from_skeleton["joints"]; target_names = to_skeleton["joints"]
    target_by_name = {name: index for index, name in enumerate(target_names)}
    if any(name not in target_by_name for name in source_names):
        raise GarmentError("目标骨架缺少来源骨名")
    mapping = np.asarray([target_by_name[name] for name in source_names], dtype=np.int64)
    source_world = _worlds(from_skeleton); target_world = _worlds(to_skeleton)
    source_child = _effective_children(from_skeleton); target_child_all = _effective_children(to_skeleton)
    source_points = source_world[:, :3, 3]; target_points = target_world[:, :3, 3]
    ratios = np.ones(len(source_names), dtype=np.float64); axes: list[np.ndarray | None] = [None] * len(source_names)
    target_axes: list[np.ndarray | None] = [None] * len(source_names)
    for index, child in enumerate(source_child):
        target_index = int(mapping[index]); target_child = int(target_child_all[target_index])
        if child < 0 or target_child < 0 or source_names[int(child)] != target_names[target_child]: continue
        source_vector = source_points[int(child)] - source_points[index]
        target_vector = target_points[target_child] - target_points[target_index]
        source_length = float(np.linalg.norm(source_vector)); target_length = float(np.linalg.norm(target_vector))
        if source_length <= 1e-9 or target_length <= 1e-9: continue
        ratios[index] = target_length / source_length
        axes[index] = source_world[index][:3, :3].T @ (source_vector / source_length)
        target_axes[index] = target_world[target_index][:3, :3].T @ (target_vector / target_length)
    # 同一模板显式置 1，避免同源 JSON 舍入造成非零恒等误差。
    same = source_names == target_names and np.array_equal(source_world, target_world)
    if same: ratios.fill(1.0)
    transforms = np.empty_like(source_world)
    for index in range(len(source_world)):
        local = np.eye(4)
        if axes[index] is not None and target_axes[index] is not None:
            local[:3, :3] = _axis_scale(axes[index], target_axes[index], ratios[index])
        transforms[index] = target_world[mapping[index]] @ local @ np.linalg.inv(source_world[index])
    homogeneous = np.column_stack((positions, np.ones(len(positions))))
    transformed = np.einsum("nkij,nj->nki", transforms[joints], homogeneous)[..., :3]
    result = np.einsum("nk,nki->ni", weights, transformed)
    return result, {name: float(ratios[index]) for index, name in enumerate(source_names)}


def refit_file(from_body_path: Path, from_skeleton_path: Path, to_body_path: Path, to_skeleton_path: Path,
               garment_path: Path, fit_path: Path, output_dir: Path,
               *, allow_draft: bool = False) -> dict[str, Any]:
    """执行跨模板重贴合并写同名 GLB 与 fit.json。"""
    started = time.perf_counter(); source_fit = json.loads(fit_path.read_text(encoding="utf-8"))
    from_skeleton = json.loads(from_skeleton_path.read_text(encoding="utf-8"))
    to_skeleton = json.loads(to_skeleton_path.read_text(encoding="utf-8"))
    source_glb = load_glb(garment_path); garment = load_world_mesh(source_glb, skinned_only=True)
    if garment.joints is None or garment.weights is None:
        raise GarmentError("来源装备不是蒙皮 GLB")
    original = garment.positions.copy()
    garment.positions, ratios = refit_positions(original, garment.joints, garment.weights, from_skeleton, to_skeleton)
    target_by_name = {name: index for index, name in enumerate(to_skeleton["joints"])}
    joint_mapping = np.asarray([target_by_name[name] for name in from_skeleton["joints"]], dtype=np.uint16)
    garment.joints = joint_mapping[garment.joints]
    identity = (_sha256(from_body_path) == _sha256(to_body_path)
                and _sha256(from_skeleton_path) == _sha256(to_skeleton_path))
    to_body_glb = load_glb(to_body_path); body = load_world_mesh(to_body_glb, skinned_only=True)
    if body.normals is None:
        raise GarmentError("目标正本缺少 NORMAL")
    surface = SurfaceIndex(body.positions, body.indices.reshape(-1, 3), body.normals)
    faces = garment.indices.reshape(-1, 3)
    push_original = original.astype(np.float32).copy()
    push_config = source_fit.get("pushOut", {})
    push_mm = float(push_config.get("pushMm", push_config.get("mm", 3.0)))
    push_mu = mm_to_mu(push_mm, float(to_skeleton["mPerMu"]))
    if identity:
        if source_fit.get("status") != "fitted" or not push_config.get("passed", False):
            raise GarmentGateError("恒等 refit 的来源必须已通过严格 bind 推离门禁")
        # 不信任来源 fit.json 中的计数：以当前 GLB 对目标正本作真实最近三角复算，
        # verify_only 不移动任何顶点，也不会在来源 --iters 上限外校正。
        garment.positions, push_stats = push_out(
            garment.positions, faces, surface, push_mu, 0, verify_only=True,
            allow_draft=allow_draft, reference_normals=garment.normals)
        push_stats["identityVerified"] = True
    else:
        # 骨长变形后先重算法线；旧来源法线不能参与目标体最近面消歧。
        garment.normals = vertex_normals(garment.positions, faces).astype(np.float32)
        garment.positions, push_stats = push_out(garment.positions, faces, surface, push_mu,
                                                   int(push_config.get("iters", 3)),
                                                   allow_draft=allow_draft, reference_normals=garment.normals)
        garment.normals = vertex_normals(garment.positions, faces).astype(np.float32)
    garment.regions = derive_regions(garment.joints, garment.weights, to_skeleton)
    regions = np.load(to_skeleton_path.parent / to_skeleton["regions"]["file"])
    coverage = float(source_fit.get("coverage", 0.65)); hidden, coverage_stats = hide_regions(
        garment.positions, faces, surface, regions, to_skeleton["regions"]["ids"], coverage,
        mm_to_mu(15.0, float(to_skeleton["mPerMu"])))
    garment.primitives = [PrimitiveRange(0, len(garment.positions), 0, len(garment.indices), 0)]
    garment.material_indices = np.array([0]); garment.name = source_fit["id"]
    material, images = _base_color(source_glb); output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / garment_path.name
    write_skinned_glb(output_path, garment, to_body_glb.skin(), material, images); output_path.chmod(0o644)
    serialized = load_world_mesh(load_glb(output_path), skinned_only=True)
    verify_serialized_topology(push_original, serialized.positions, faces,
                               push_stats, allow_draft)
    maximum = float(np.max(np.abs(garment.positions.astype(np.float64) - original.astype(np.float64))))
    if identity and maximum >= 1e-6:
        raise GarmentError(f"恒等 refit 最大位差 {maximum:.9g} mu，不满足 <1e-6")
    boundary, nonmanifold = edge_statistics(faces); peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    peak_mib = peak / (1024.0 * 1024.0) if sys.platform == "darwin" else peak / 1024.0
    result = dict(source_fit); result.update({
        "body": {"file": _portable(to_body_path), "sha256": _sha256(to_body_path),
                 "skeleton": _portable(to_skeleton_path), "skeletonSha256": _sha256(to_skeleton_path)},
        "refitFrom": {"body": _portable(from_body_path), "bodySha256": _sha256(from_body_path),
                      "skeleton": _portable(from_skeleton_path), "skeletonSha256": _sha256(from_skeleton_path),
                      "garment": _portable(garment_path), "garmentSha256": _sha256(garment_path),
                      "method": "inverse-source-bone-local+target-bind-effective-child-axis",
                      "maxVertexDeltaMu": maximum, "boneLengthScale": ratios},
        "pushOut": {"pushMm": push_mm, "pushMu": push_mu,
                    "iters": int(push_config.get("iters", 3)), **push_stats},
        "status": "draft" if push_stats["draft"] else "fitted",
        "hideRegions": hidden, "coverageByRegion": coverage_stats,
        "stats": {"vertices": len(garment.positions), "triangles": len(faces), "primitiveCount": 1,
                  "boundaryEdges": len(boundary), "nonManifoldEdges": len(nonmanifold),
                  "fileBytes": output_path.stat().st_size, "elapsedSec": time.perf_counter() - started,
                  "peakMemoryMiB": peak_mib},
    })
    result = _round(result); temporary = output_dir / ".fit.json.tmp"
    temporary.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(output_dir / "fit.json"); (output_dir / "fit.json").chmod(0o644)
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="把已贴合的蒙皮衣物从来源体型自动重贴合到目标体型。")
    parser.add_argument("--from-body", type=Path, required=True); parser.add_argument("--from-skeleton", type=Path, required=True)
    parser.add_argument("--to-body", type=Path, required=True); parser.add_argument("--to-skeleton", type=Path, required=True)
    parser.add_argument("--garment", type=Path, required=True); parser.add_argument("--fit", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True); parser.add_argument("--json", action="store_true")
    parser.add_argument("--allow-draft", action="store_true",
                        help="目标推离门禁未通过时仍写 status=draft")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = refit_file(args.from_body, args.from_skeleton, args.to_body, args.to_skeleton,
                            args.garment, args.fit, args.out, allow_draft=args.allow_draft)
    except GarmentGateError as error:
        print(f"门禁失败：{error}", file=sys.stderr); return 3
    except (OSError, ValueError, json.JSONDecodeError, RuntimeError, NotImplementedError) as error:
        print(f"输入错误：{error}", file=sys.stderr); return 2
    if args.json: print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    else: print(f"已输出 {args.out / args.garment.name} 与 fit.json；最大位差 {result['refitFrom']['maxVertexDeltaMu']:.9g} mu")
    return 0


__all__ = ["refit_file", "refit_positions"]


if __name__ == "__main__":
    raise SystemExit(main())
