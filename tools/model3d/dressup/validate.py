#!/usr/bin/env python3
"""校验 3D 纸娃娃资产，并写出 tech/11 §6 的 report.json。"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import sys
from typing import Any, Sequence

import numpy as np
from PIL import Image
from scipy.spatial import cKDTree

# 直接执行时允许导入同目录基础库，同时避开 inspect.py 遮蔽标准库的问题。
_HERE = Path(__file__).resolve().parent
if str(_HERE) not in sys.path:
    sys.path.insert(0, str(_HERE))
from common import compose_matrix, lbs, pca, signed_distance, umeyama  # noqa: E402
from glb_io import GLB, Mesh, load_glb  # noqa: E402

SCHEMA = "tianshu-dressup-report.v1"
FORBIDDEN_HIDE = {"neck", "handL", "handR", "footL", "footR"}
TRIANGLE_LIMITS = {"template": 80_000, "garment": 30_000, "hair": 20_000,
                   "prop": 10_000, "head": 30_000}
REPO = Path(__file__).resolve().parents[3]
SKELETON_SCHEMA = "tianshu-dressup-skeleton.v1"
FIT_SCHEMA = "tianshu-dressup-fit.v1"
UNIT_TOLERANCE = 1e-6


def _fail(message: str) -> int:
    print(f"错误：{message}", file=sys.stderr)
    return 2


def _joint_names(glb: GLB, skin_index: int = 0) -> list[str]:
    skin = glb.skin(skin_index)
    return [glb.json["nodes"][node].get("name", f"node_{node}") for node in skin.joints]


def _mesh(glb: GLB) -> Mesh:
    meshes = glb.meshes()
    if not meshes:
        raise ValueError(f"{glb.path}: 没有 mesh")
    if len(meshes) != 1:
        raise ValueError(f"{glb.path}: 门禁要求单一 mesh，实际 {len(meshes)}")
    return meshes[0]


def _faces(mesh: Mesh) -> np.ndarray:
    return np.asarray(mesh.indices, dtype=np.int64).reshape(-1, 3)


def _result(fit: dict[str, Any], asset_path: Path, fit_path: Path,
            checks: list[dict[str, Any]], requested: str) -> dict[str, Any]:
    passed = all(check["pass"] for check in checks)
    return {"schema": SCHEMA, "level": requested if passed else "fail",
            "template": fit.get("template"),
            "subject": {"kind": fit.get("kind"), "id": fit.get("id")},
            "inputs": {"asset": _input_record(asset_path),
                       "fit": _input_record(fit_path)},
            "checks": checks}


def _world_mesh(glb: GLB) -> Mesh:
    positions: list[np.ndarray] = []; indices: list[np.ndarray] = []; uvs: list[np.ndarray] = []
    joints: list[np.ndarray] = []; weights: list[np.ndarray] = []; regions: list[np.ndarray] = []
    vertex_start = 0; has_uv = has_skin = has_region = True
    for node_index, node in enumerate(glb.json.get("nodes", [])):
        if "mesh" not in node: continue
        mesh = glb.mesh(int(node["mesh"])); matrix = glb.world_matrix(node_index)
        homogeneous = np.column_stack((mesh.positions, np.ones(len(mesh.positions))))
        positions.append((homogeneous @ matrix.T)[:, :3]); indices.append(mesh.indices + vertex_start)
        if mesh.uvs is None: has_uv = False
        else: uvs.append(mesh.uvs)
        if mesh.joints is None or mesh.weights is None: has_skin = False
        else: joints.append(mesh.joints); weights.append(mesh.weights)
        if mesh.regions is None: has_region = False
        else: regions.append(mesh.regions)
        vertex_start += len(mesh.positions)
    if not positions: raise ValueError(f"{glb.path}: 场景没有 mesh 节点")
    return Mesh(np.concatenate(positions), np.concatenate(indices),
                uvs=np.concatenate(uvs) if has_uv else None,
                joints=np.concatenate(joints) if has_skin else None,
                weights=np.concatenate(weights) if has_skin else None,
                regions=np.concatenate(regions) if has_region else None)


def _resolve_recorded(path: str, fit_path: Path) -> Path:
    recorded = Path(path)
    candidates = [recorded] if recorded.is_absolute() else [fit_path.parent / recorded, REPO / recorded]
    git_file = REPO / ".git"
    if not recorded.is_absolute() and git_file.is_file():
        git_dir = Path(git_file.read_text(encoding="utf-8").strip().removeprefix("gitdir: "))
        candidates.extend(parent.parent / recorded for parent in git_dir.parents
                          if parent.parent.name == "jinyongqunxia" and parent.name == ".git")
    source_root = os.environ.get("TIANSHU_SOURCE_ROOT")
    if not recorded.is_absolute() and source_root: candidates.append(Path(source_root) / recorded)
    found = next((value.resolve() for value in candidates if value.is_file()), None)
    if found is None: raise ValueError(f"找不到 fit 记录的真实源几何：{path}")
    return found


def _verified_source(fit: dict[str, Any], fit_path: Path, field: str = "source") -> Path:
    info = fit.get(field, {}); path = _resolve_recorded(info["file"], fit_path)
    expected = info.get("sha256")
    if expected:
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != expected: raise ValueError(f"{field}.sha256 与真实文件不符")
    return path


def _vertex_normals(vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
    normal = np.zeros_like(vertices, dtype=np.float64)
    tri = vertices[faces]
    face_normal = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    for corner in range(3):
        np.add.at(normal, faces[:, corner], face_normal)
    length = np.linalg.norm(normal, axis=1, keepdims=True)
    return np.divide(normal, length, out=np.zeros_like(normal), where=length > 1e-12)


def _signed_distances(points: np.ndarray, vertices: np.ndarray, faces: np.ndarray,
                      normals: np.ndarray, k: int = 16) -> np.ndarray:
    """分块调用基础库的严格最近三角带符号距离，覆盖全部查询点。"""
    output = np.empty(len(points), dtype=np.float64)
    for start in range(0, len(points), 4096):
        block = np.asarray(points[start:start + 4096], dtype=np.float64)
        output[start:start + len(block)] = signed_distance(
            block, vertices, faces, normals, k=k).distances_mu
    return output


def _check(name: str, passed: bool, value: Any, threshold: Any, **extra: Any) -> dict[str, Any]:
    return {"name": name, "pass": bool(passed), "value": value,
            "threshold": threshold, **extra}


def _input_record(path: Path) -> dict[str, Any]:
    data = path.read_bytes()
    return {"sha256": hashlib.sha256(data).hexdigest(), "sizeBytes": len(data)}


def _positive_number(value: Any) -> float | None:
    if isinstance(value, bool):
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) and number > 0 else None


def _present(value: Any) -> bool:
    return value is not None and value != "" and value != [] and value != {}


def _recorded_template(path: Any) -> str | None:
    if not isinstance(path, str) or not path:
        return None
    parts = Path(path.replace("\\", "/")).parts
    if len(parts) < 3 or parts[-3] != "templates" or parts[-1] != "body.glb":
        return None
    return parts[-2]


def _binding_checks(body_path: Path, skeleton: dict[str, Any],
                    fit: dict[str, Any]) -> list[dict[str, Any]]:
    """把正本身份、模板归属与 mu→m 换算纳入可审计门禁。"""
    actual_sha = _input_record(body_path)["sha256"]
    skeleton_source = skeleton.get("source")
    skeleton_source = skeleton_source if isinstance(skeleton_source, dict) else {}
    fit_body = fit.get("body")
    fit_body = fit_body if isinstance(fit_body, dict) else {}
    fit_source = fit.get("source")
    fit_source = fit_source if isinstance(fit_source, dict) else {}

    skeleton_missing = [name for name, value in {
        "source.file": skeleton_source.get("file"),
        "source.sha256": skeleton_source.get("sha256"),
        "unit": skeleton.get("unit"), "heightMu": skeleton.get("heightMu"),
        "defaultHeightM": skeleton.get("defaultHeightM"),
        "mPerMu": skeleton.get("mPerMu"), "joints": skeleton.get("joints"),
    }.items() if not _present(value)]
    fit_missing = [name for name, value in {
        "id": fit.get("id"), "kind": fit.get("kind"),
        "source.file": fit_source.get("file"),
        "source.sha256": fit_source.get("sha256"),
        "body.file": fit_body.get("file"),
        "body.sha256": fit_body.get("sha256"), "template": fit.get("template"),
        "mPerMu": fit.get("mPerMu"),
    }.items() if not _present(value)]

    height_mu = _positive_number(skeleton.get("heightMu"))
    default_height_m = _positive_number(skeleton.get("defaultHeightM"))
    skeleton_m_per_mu = _positive_number(skeleton.get("mPerMu"))
    calculated = (default_height_m / height_mu
                  if default_height_m is not None and height_mu is not None else None)
    skeleton_units_ok = (skeleton.get("unit") == "mu" and calculated is not None and
                         skeleton_m_per_mu is not None and
                         abs(skeleton_m_per_mu - calculated) <= UNIT_TOLERANCE)
    fit_m_per_mu = _positive_number(fit.get("mPerMu"))
    fit_units_ok = (fit_m_per_mu is not None and skeleton_m_per_mu is not None and
                    abs(fit_m_per_mu - skeleton_m_per_mu) <= UNIT_TOLERANCE)

    skeleton_file = skeleton_source.get("file")
    fit_file = fit_body.get("file")
    skeleton_template = _recorded_template(skeleton_file)
    fit_template = _recorded_template(fit_file)
    body_template = _recorded_template(body_path.as_posix())
    explicit_template = fit.get("template")
    template_ok = (skeleton_template is not None and fit_template == skeleton_template and
                   (body_template is None or body_template == skeleton_template) and
                   explicit_template == skeleton_template)
    return [
        _check("binding.skeletonSchema", skeleton.get("schema") == SKELETON_SCHEMA,
               skeleton.get("schema"), SKELETON_SCHEMA),
        _check("binding.skeletonRequired", not skeleton_missing, skeleton_missing, []),
        _check("binding.skeletonBodySha", skeleton_source.get("sha256") == actual_sha,
               {"recorded": skeleton_source.get("sha256"), "actual": actual_sha}, "equal"),
        _check("binding.skeletonUnits", skeleton_units_ok,
               {"unit": skeleton.get("unit"), "recorded": skeleton_m_per_mu,
                "calculated": calculated, "tolerance": UNIT_TOLERANCE}, "abs error <= 1e-6"),
        _check("binding.fitSchema", fit.get("schema") == FIT_SCHEMA, fit.get("schema"), FIT_SCHEMA),
        _check("binding.fitRequired", not fit_missing, fit_missing, []),
        _check("binding.fitBodySha", fit_body.get("sha256") == actual_sha,
               {"recorded": fit_body.get("sha256"), "actual": actual_sha}, "equal"),
        _check("binding.fitTemplate", template_ok,
               {"body": body_template, "skeleton": skeleton_template,
                "fit": fit_template, "explicit": explicit_template},
               "same templates/<id>/body.glb"),
        _check("binding.fitMPerMu", fit_units_ok,
               {"fit": fit_m_per_mu, "skeleton": skeleton_m_per_mu,
                "tolerance": UNIT_TOLERANCE}, "abs error <= 1e-6"),
    ]


def _quat_slerp(left: np.ndarray, right: np.ndarray, alpha: float) -> np.ndarray:
    a, b = left.astype(np.float64), right.astype(np.float64)
    dot = float(np.dot(a, b))
    if dot < 0:
        b, dot = -b, -dot
    if dot > 0.9995:
        value = a + alpha * (b - a)
        return value / np.linalg.norm(value)
    angle = math.acos(max(-1.0, min(1.0, dot)))
    return (math.sin((1 - alpha) * angle) * a + math.sin(alpha * angle) * b) / math.sin(angle)


def _sample(glb: GLB, sampler: dict[str, Any], time: float, rotation: bool) -> np.ndarray:
    interpolation = sampler.get("interpolation", "LINEAR")
    if interpolation == "CUBICSPLINE":
        raise ValueError("动画 sampler CUBICSPLINE 不支持；门禁只接受 LINEAR")
    if interpolation not in ("LINEAR", "STEP"):
        raise ValueError(f"动画 sampler {interpolation} 不支持")
    times = np.asarray(glb.accessor(sampler["input"]), dtype=np.float64).reshape(-1)
    values = np.asarray(glb.accessor(sampler["output"]), dtype=np.float64)
    if len(times) != len(values) or not len(times):
        raise ValueError("动画 sampler 输入/输出数量不符")
    if time <= times[0]: return values[0]
    if time >= times[-1]: return values[-1]
    right = int(np.searchsorted(times, time, side="right")); left = right - 1
    if interpolation == "STEP": return values[left]
    alpha = float((time - times[left]) / (times[right] - times[left]))
    return _quat_slerp(values[left], values[right], alpha) if rotation else values[left] * (1 - alpha) + values[right] * alpha


def _world_matrices(glb: GLB, animation: dict[str, Any], time: float) -> np.ndarray:
    local = [glb.local_matrix(index) for index in range(len(glb.json.get("nodes", [])))]
    animated: dict[int, dict[str, Any]] = {}
    for channel in animation.get("channels", []):
        target = channel.get("target", {}); path = target.get("path")
        if path not in ("translation", "rotation", "scale"):
            if path == "weights": continue
            raise ValueError(f"不支持动画 target.path={path}")
        sampler = animation["samplers"][channel["sampler"]]
        node_index = int(target["node"]); node = glb.json["nodes"][node_index]
        if "matrix" in node:
            raise ValueError(f"动画节点 {node_index} 不得使用 matrix")
        state = animated.setdefault(node_index, {
            "translation": node.get("translation", [0, 0, 0]),
            "rotation": node.get("rotation", [0, 0, 0, 1]),
            "scale": node.get("scale", [1, 1, 1]),
        })
        sampled = _sample(glb, sampler, time, path == "rotation")
        state[path] = sampled
    for node_index, state in animated.items():
        local[node_index] = compose_matrix(
            state["translation"], state["rotation"], state["scale"])
    world = np.empty((len(local), 4, 4), dtype=np.float64)
    pending = set(range(len(local)))
    while pending:
        progressed = False
        for index in tuple(pending):
            parent = glb.parents.get(index)
            if parent is None or parent not in pending:
                world[index] = local[index] if parent is None else world[parent] @ local[index]
                pending.remove(index); progressed = True
        if not progressed: raise ValueError("节点层级含环")
    return world


def _dynamic_penetration(body: GLB, asset: GLB, body_mesh: Mesh, asset_mesh: Mesh, m_per_mu: float) -> dict[str, float]:
    if asset_mesh.joints is None or asset_mesh.weights is None or body_mesh.joints is None or body_mesh.weights is None:
        return {}
    by_name = {str(item.get("name", "")).lower(): item for item in body.json.get("animations", [])}
    result: dict[str, float] = {}; body_skin = body.skin(); asset_skin = asset.skin()
    for clip in ("idle", "walk", "run"):
        animation = next((value for name, value in by_name.items() if clip in name), None)
        if animation is None: raise ValueError(f"正本缺 {clip} 动画")
        ends = [float(np.asarray(body.accessor(s["input"])).max(initial=0)) for s in animation.get("samplers", [])]
        duration = max(ends, default=0.0)
        worst = 0.0
        for time in np.linspace(0.0, duration, 24, endpoint=False):
            world = _world_matrices(body, animation, float(time))
            body_world = world[np.asarray(body_skin.joints)]
            asset_world = world[np.asarray(body_skin.joints)]
            body_pos = lbs(body_mesh.positions, body_mesh.joints, body_mesh.weights, body_world, body_skin.inverse_bind_matrices)
            asset_pos = lbs(asset_mesh.positions, asset_mesh.joints, asset_mesh.weights,
                            asset_world, asset_skin.inverse_bind_matrices)
            body_normals = _vertex_normals(body_pos, _faces(body_mesh))
            distances = _signed_distances(asset_pos, body_pos, _faces(body_mesh), body_normals) * m_per_mu
            worst = max(worst, float(np.count_nonzero(distances < -0.001) / len(distances)))
        result[clip] = worst
    return result


def _penetration_rates(body: GLB, asset: GLB, body_mesh: Mesh, asset_mesh: Mesh,
                       m_per_mu: float) -> tuple[int, dict[str, float]]:
    """独立计算 bind 与三段 clip 穿透；供门禁与合成回归共用。"""
    body_faces = _faces(body_mesh)
    body_normals = (body_mesh.normals if body_mesh.normals is not None
                    else _vertex_normals(body_mesh.positions, body_faces))
    bind = _signed_distances(asset_mesh.positions, body_mesh.positions,
                             body_faces, body_normals) * m_per_mu
    return int(np.count_nonzero(bind < -1e-9)), _dynamic_penetration(
        body, asset, body_mesh, asset_mesh, m_per_mu)


def _texture_sizes(glb: GLB) -> list[list[int]]:
    sizes: list[list[int]] = []
    for index in range(len(glb.json.get("images", []))):
        import io
        with Image.open(io.BytesIO(glb.image(index).data)) as image:
            sizes.append([int(image.width), int(image.height)])
    return sizes


def _material_checks(glb: GLB, kind: str) -> list[dict[str, Any]]:
    materials = glb.json.get("materials", [])
    refs: list[tuple[str, int]] = []
    for material in materials:
        pbr = material.get("pbrMetallicRoughness", {})
        if isinstance(pbr.get("baseColorTexture"), dict):
            refs.append(("baseColorTexture", int(pbr["baseColorTexture"]["index"])))
        for name in ("normalTexture", "occlusionTexture", "emissiveTexture"):
            if isinstance(material.get(name), dict): refs.append((name, int(material[name]["index"])))
        value = pbr.get("metallicRoughnessTexture")
        if isinstance(value, dict): refs.append(("metallicRoughnessTexture", int(value["index"])))
    non_base = [name for name, _ in refs if name != "baseColorTexture"]
    unlit = "KHR_materials_unlit" in glb.json.get("extensionsUsed", []) and bool(materials) and all(
        "KHR_materials_unlit" in material.get("extensions", {}) for material in materials)
    checks = [
        _check("material.unlit", unlit, unlit, True),
        _check("material.onlyBaseColorTexture", not non_base, non_base, []),
    ]
    if kind in ("garment", "hair"):
        double_sided = bool(materials) and all(material.get("doubleSided") is True for material in materials)
        checks.append(_check("material.doubleSided", double_sided, double_sided, True))
    return checks


def _mask_checks(fit: dict[str, Any], skeleton: dict[str, Any]) -> list[dict[str, Any]]:
    hide = set(fit.get("hideRegions", [])); never = set(fit.get("neverHide", []))
    region_ids = set(skeleton.get("regions", {}).get("ids", {}))
    return [_check("mask.knownRegions", hide <= region_ids, sorted(hide - region_ids), []),
            _check("mask.neverHide", not (hide & never), sorted(hide & never), []),
            _check("mask.forbidden", not (hide & FORBIDDEN_HIDE), sorted(hide & FORBIDDEN_HIDE), [])]


def _skinning_checks(body: GLB, asset: GLB, asset_mesh: Mesh,
                     skeleton: dict[str, Any], fit: dict[str, Any]) -> list[dict[str, Any]]:
    checks: list[dict[str, Any]] = []
    extra_sets = sorted({semantic for mesh in asset.json.get("meshes", [])
                         for primitive in mesh.get("primitives", [])
                         for semantic in primitive.get("attributes", {})
                         if re.fullmatch(r"(?:JOINTS|WEIGHTS)_[1-9][0-9]*", semantic)})
    checks.append(_check("weights.onlySet0", not extra_sets, extra_sets, []))
    has_skin = len(asset.json.get("skins", [])) == 1
    checks.append(_check("skeleton.skinCount", has_skin, len(asset.json.get("skins", [])), 1))
    if not has_skin: return checks
    body_names = _joint_names(body)
    asset_spec = asset.json["skins"][0]
    asset_names = [asset.json["nodes"][int(node)].get("name", f"node_{node}")
                   for node in asset_spec.get("joints", [])]
    expected_names = list(skeleton.get("joints", body_names))
    checks.append(_check("skeleton.joints", asset_names == body_names == expected_names,
                         {"asset": len(asset_names), "body": len(body_names)}, "名单逐项相同"))
    body_ibm = body.skin().inverse_bind_matrices
    try:
        asset_ibm = asset.skin().inverse_bind_matrices
        delta = (float(np.max(np.abs(body_ibm - asset_ibm)))
                 if body_ibm.shape == asset_ibm.shape else math.inf)
    except (ValueError, KeyError, IndexError, TypeError):
        delta = math.inf
    checks.append(_check("skeleton.ibmMaxAbs", delta < 1e-5,
                         delta if math.isfinite(delta) else "infinity", "< 1e-5"))
    joints, weights = asset_mesh.joints, asset_mesh.weights
    allowed = fit.get("weights", {}).get("jointsAllowed")
    evidence = isinstance(allowed, list) and bool(allowed)
    checks.append(_check("weights.jointsAllowedPresent", evidence, allowed, "非空数组"))
    if joints is None or weights is None:
        return checks + [_check("weights.attributes", False, False, True)]
    sums = weights.sum(axis=1); finite = bool(np.isfinite(weights).all())
    active_max = int(np.count_nonzero(weights > 1e-8, axis=1).max(initial=0))
    valid_indices = bool(np.all(joints[weights > 1e-8] < len(asset_names)))
    used = {asset_names[int(value)] for value in joints[weights > 1e-8]} if valid_indices else set()
    allowed_ok = evidence and valid_indices and used <= set(allowed)
    return checks + [_check("weights.finite", finite, finite, True),
        _check("weights.sumMaxError", float(np.max(np.abs(sums - 1.0))) <= 1e-3,
               float(np.max(np.abs(sums - 1.0))), "<= 1e-3"),
        _check("weights.maxBones", active_max <= 4, active_max, "<= 4"),
        _check("weights.jointIndices", valid_indices, valid_indices, True),
        _check("weights.jointsAllowed", allowed_ok, sorted(used), sorted(allowed) if evidence else [])]


def _close_fit_checks(fit: dict[str, Any]) -> list[dict[str, Any]]:
    refit = fit.get("refit", {})
    has_p90 = isinstance(refit, dict) and all(
        name in refit for name in ("distanceP90Mm", "sourceDistanceP90Mm"))
    delta = (abs(float(refit["distanceP90Mm"]) - float(refit["sourceDistanceP90Mm"]))
             if has_p90 else None)
    return [_check("geometry.closeFitP90Evidence", has_p90,
                   sorted(refit.keys()) if isinstance(refit, dict) else None,
                   ["distanceP90Mm", "sourceDistanceP90Mm"]),
            _check("geometry.closeFitP90DeltaMm", has_p90 and delta < 5, delta, "< 5")]


def _similarity_quality(source: np.ndarray, final: np.ndarray, faces: np.ndarray) -> tuple[int, float, float]:
    if source.shape != final.shape: raise ValueError("源几何与最终几何顶点数不同，无法独立核算")
    transform = umeyama(source, final, allow_mirror=False)
    fitted = transform.scale * (source @ transform.rotation.T) + transform.translation
    old = fitted[faces]; new = final[faces]
    old_edges = np.linalg.norm(old[:, [1, 2, 0]] - old, axis=2)
    new_edges = np.linalg.norm(new[:, [1, 2, 0]] - new, axis=2)
    ratios = np.divide(new_edges, old_edges, out=np.ones_like(new_edges), where=old_edges > 1e-12)
    old_n = np.cross(old[:, 1] - old[:, 0], old[:, 2] - old[:, 0])
    new_n = np.cross(new[:, 1] - new[:, 0], new[:, 2] - new[:, 0])
    flipped = int(np.count_nonzero(np.einsum("ij,ij->i", old_n, new_n) <= 0))
    good = float(np.mean(np.all((ratios >= 0.7) & (ratios <= 1.4), axis=1)))
    residual = float(np.max(np.linalg.norm(fitted - final, axis=1), initial=0))
    return flipped, good, residual


def _source_geometry(fit: dict[str, Any], fit_path: Path) -> np.ndarray:
    source = fit.get("source", {})
    if not isinstance(source, dict) or not isinstance(source.get("file"), str):
        raise ValueError("fit.source.file 缺失，无法独立核算几何")
    return _world_mesh(load_glb(_verified_source(fit, fit_path))).positions


def _expanded_source(source: np.ndarray, final: np.ndarray) -> np.ndarray:
    if len(source) == len(final): return source
    if len(source) > len(final): raise ValueError("最终几何顶点少于真实源几何")
    distances, duplicate = cKDTree(final[:len(source)]).query(final[len(source):])
    if np.any(distances > 1e-9): raise ValueError("新增顶点不是区域拆点的逐字节副本")
    return np.concatenate((source, source[duplicate]))


def _landmark_source(source: np.ndarray, fit: dict[str, Any],
                     skeleton: dict[str, Any]) -> np.ndarray:
    align = fit.get("align", {})
    scale = float(align.get("scale", math.nan))
    yaw = math.radians(float(align.get("yawDeg", math.nan)))
    if not math.isfinite(scale) or scale <= 0 or not math.isfinite(yaw):
        raise ValueError("fit.align scale/yawDeg 缺失或无效")
    quantile = 0.995
    if fit.get("kind") == "hair":
        head_center = align.get("headCenter", {})
        target = np.asarray(head_center.get("worldMu", []), dtype=float)
        skull = align.get("skullFit", {})
        profile_width = float(skull.get("profileWidthMu", math.nan))
        source_width = float(skull.get("sourceInnerWidthMu", math.nan))
        if target.shape != (3,) or not np.all(np.isfinite(target)):
            raise ValueError("hair fit.align.headCenter.worldMu 缺失或无效")
        expected_scale = profile_width / source_width if source_width > 0 else math.nan
        if not math.isfinite(expected_scale) or not math.isclose(scale, expected_scale, rel_tol=1e-6):
            raise ValueError("hair fit.align.scale 与颅骨宽度缩放不符")
        quantile = 0.92
    else:
        target = np.asarray(skeleton["neckRing"]["centerMu"], dtype=float)
    c, s = math.cos(yaw), math.sin(yaw)
    rotation = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    aligned = scale * (source @ rotation.T)
    cap = aligned[aligned[:, 1] >= np.quantile(aligned[:, 1], quantile)]
    if not len(cap): raise ValueError("源几何没有可用于语义锚定的顶点")
    return aligned + target - cap.mean(axis=0)


def _joint_source(source_glb: GLB, source_mesh: Mesh, skeleton: dict[str, Any]) -> np.ndarray:
    if source_mesh.joints is None or source_mesh.weights is None:
        raise ValueError("fit.align.method=joints 但真实源几何缺蒙皮属性")
    skin = source_glb.skin(); names = _joint_names(source_glb)
    target_names = skeleton["joints"]; target_index = {name: i for i, name in enumerate(target_names)}
    mapping = np.asarray([target_index.get(name, -1) for name in names], dtype=np.int64)
    stems = {"Hips", "Spine", "Spine1", "Spine2", "Neck", "LeftArm",
             "RightArm", "LeftUpLeg", "RightUpLeg"}
    common = [name for name in target_names if name.split(":")[-1] in stems and name in names]
    required = {"LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg"}
    if len(common) < 6 or not required <= {name.split(":")[-1] for name in common}:
        raise ValueError("joints 对齐缺少至少六个躯干关节或左右肢体")
    source_nodes = {source_glb.json["nodes"][node].get("name", ""): node for node in skin.joints}
    source_points = np.asarray([source_glb.world_matrix(source_nodes[name])[:3, 3] for name in common])
    target_points = np.asarray([np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T[:3, 3]
                                for name in common])
    fit = umeyama(source_points, target_points, allow_mirror=False)
    coarse = np.eye(4); coarse[:3, :3] = fit.scale * fit.rotation; coarse[:3, 3] = fit.translation
    aligned = np.column_stack((source_mesh.positions, np.ones(len(source_mesh.positions)))) @ coarse.T
    transforms = np.repeat(np.eye(4)[None, :, :], len(names), axis=0)
    for source_slot, target_slot in enumerate(mapping):
        if target_slot >= 0:
            target_world = np.asarray(skeleton["bindWorld"][target_names[target_slot]]).reshape(4, 4).T
            transforms[source_slot] = target_world @ np.linalg.inv(
                coarse @ source_glb.world_matrix(int(skin.joints[source_slot])))
    used = source_mesh.weights > 1e-8
    if np.any(mapping[source_mesh.joints[used]] < 0):
        raise ValueError("真实源几何权重引用目标骨架不存在的关节")
    posed = np.einsum("nkij,nj->nki", transforms[source_mesh.joints], aligned)[:, :, :3]
    return np.einsum("nk,nki->ni", source_mesh.weights, posed)


def _garment_source(fit: dict[str, Any], fit_path: Path, skeleton: dict[str, Any],
                     final: Mesh) -> np.ndarray:
    source_glb = load_glb(_verified_source(fit, fit_path)); source_mesh = _world_mesh(source_glb)
    method = fit.get("align", {}).get("method")
    if method == "landmarks":
        aligned = _landmark_source(source_mesh.positions, fit, skeleton)
    elif method == "joints":
        aligned = _joint_source(source_glb, source_mesh, skeleton)
    else:
        raise ValueError("fit.align.method 必须是 landmarks 或 joints")
    expected = int(fit.get("stats", {}).get("vertices", len(final.positions)))
    if len(aligned) == expected:
        base = aligned
    else:
        if len(aligned) < expected: raise ValueError("源几何顶点少于最终几何")
        # A4 remove-body-stub 保持顶点顺序、只删未使用点并压紧；以 UV 子序列回指。
        if source_mesh.uvs is None or final.uvs is None: raise ValueError("删面资产缺 UV，无法回指真实源顶点")
        selected: list[int] = []; cursor = 0
        for uv in final.uvs[:expected]:
            found = next((index for index in range(cursor, len(source_mesh.uvs))
                          if np.array_equal(source_mesh.uvs[index], uv)), None)
            if found is None: raise ValueError("最终 UV 顺序不能回指真实源几何")
            selected.append(found); cursor = found + 1
        base = aligned[np.asarray(selected)]
    if len(final.positions) == expected: return base
    distances, duplicate = cKDTree(final.positions[:expected]).query(final.positions[expected:])
    if np.any(distances > 1e-9): raise ValueError("区域拆点不是原顶点的逐字节副本")
    return np.concatenate((base, base[duplicate]))


def _refit_source(fit: dict[str, Any], fit_path: Path, target: dict[str, Any]) -> np.ndarray:
    info = fit["refitFrom"]
    source_mesh = _mesh(load_glb(_resolve_recorded(info["garment"], fit_path)))
    source = json.loads(_resolve_recorded(info["skeleton"], fit_path).read_text(encoding="utf-8"))
    if source_mesh.joints is None or source_mesh.weights is None: raise ValueError("refit 源件缺蒙皮属性")
    source_world = np.asarray([np.asarray(source["bindWorld"][name]).reshape(4, 4).T
                               for name in source["joints"]])
    target_world = np.asarray([np.asarray(target["bindWorld"][name]).reshape(4, 4).T
                               for name in target["joints"]])
    target_by_name = {name: index for index, name in enumerate(target["joints"])}
    mapping = np.asarray([target_by_name[name] for name in source["joints"]])
    def lengths(data: dict[str, Any], world: np.ndarray) -> np.ndarray:
        parents = np.asarray(data["parents"]); points = world[:, :3, 3]; result = np.ones(len(points))
        valid = parents >= 0; result[valid] = np.linalg.norm(points[valid] - points[parents[valid]], axis=1)
        for index in np.flatnonzero(~valid):
            children = np.flatnonzero(parents == index)
            if len(children): result[index] = np.mean(np.linalg.norm(points[children] - points[index], axis=1))
        return result
    ratios = lengths(target, target_world)[mapping] / lengths(source, source_world)
    transforms = np.asarray([target_world[mapping[i]] @ np.diag([ratios[i]] * 3 + [1]) @
                             np.linalg.inv(source_world[i]) for i in range(len(mapping))])
    homogeneous = np.column_stack((source_mesh.positions, np.ones(len(source_mesh.positions))))
    moved = np.einsum("nkij,nj->nki", transforms[source_mesh.joints], homogeneous)[..., :3]
    return np.einsum("nk,nki->ni", source_mesh.weights, moved)


def _region_check(asset: GLB, asset_mesh: Mesh, required: bool) -> dict[str, Any]:
    primitive_count = sum(len(mesh.get("primitives", [])) for mesh in asset.json.get("meshes", []))
    specs = [asset.json["accessors"][primitive["attributes"]["_REGION"]]
             for mesh in asset.json.get("meshes", []) for primitive in mesh.get("primitives", [])
             if "_REGION" in primitive.get("attributes", {})]
    valid = len(specs) == primitive_count and asset_mesh.regions is not None and all(
        spec.get("componentType") == 5121 and spec.get("type") == "SCALAR" and not spec.get("normalized")
        for spec in specs)
    return _check("regions.u8Scalar", valid if required else not specs or valid,
                  [{"componentType": x.get("componentType"), "type": x.get("type")} for x in specs],
                  "u8 SCALAR" if required else "若存在则 u8 SCALAR")


def _geometry_checks(source: np.ndarray, final: Mesh, body: Mesh | None,
                     m_per_mu: float) -> list[dict[str, Any]]:
    faces = _faces(final); flipped, ratio_in, residual = _similarity_quality(source, final.positions, faces)
    checks = [_check("geometry.flippedTriangles", flipped == 0, flipped, 0),
              _check("geometry.edgeRatioInRange", ratio_in >= 0.99, ratio_in, ">= 0.99"),
              _check("geometry.maxResidualMu", math.isfinite(residual), residual, "finite")]
    if body is not None:
        body_faces = _faces(body); normals = body.normals if body.normals is not None else _vertex_normals(body.positions, body_faces)
        samples = np.unique(faces)
        before = np.abs(_signed_distances(source[samples], body.positions, body_faces, normals) * m_per_mu)
        after = np.abs(_signed_distances(final.positions[samples], body.positions, body_faces, normals) * m_per_mu)
        close = before < 0.05
        before_p90 = float(np.quantile(before[close], .9)) if np.any(close) else math.inf
        after_p90 = float(np.quantile(after[close], .9)) if np.any(close) else math.inf
        delta_mm = abs(after_p90 - before_p90) * 1000
        checks.append(_check("geometry.closeFitP90DeltaMm", delta_mm < 5, delta_mm, "< 5",
                             sourceP90Mm=before_p90 * 1000, finalP90Mm=after_p90 * 1000))
    return checks


def _prop_axis_and_anchor(vertices: np.ndarray, fit: dict[str, Any]) -> tuple[float, np.ndarray, float]:
    prop_class = fit.get("class"); axes = pca(vertices)[2]
    axis = axes[0] if prop_class != "hat" else max(axes, key=lambda value: abs(float(value[1])))
    alignment = abs(float(np.dot(axis, [0, 1, 0])))
    if prop_class == "weapon":
        span = float(np.ptp(vertices[:, 1])); ratio = float(fit.get("gripRatio", 0.07))
        anchor = np.array([0.0, float(vertices[:, 1].min()) + ratio * span, 0.0])
    elif prop_class == "hat":
        cutoff = vertices[:, 1].max() - .01 * np.ptp(vertices[:, 1])
        anchor = vertices[vertices[:, 1] >= cutoff].mean(axis=0)
        anchor[1] = vertices[:, 1].max()
    elif prop_class in ("pendant", "pouch"):
        cutoff = vertices[:, 1].max() - .01 * np.ptp(vertices[:, 1])
        anchor = vertices[vertices[:, 1] >= cutoff].mean(axis=0)
    else: anchor = (vertices.min(axis=0) + vertices.max(axis=0)) / 2
    spans = np.ptp(vertices, axis=0); size_axis = fit.get("sizeAxis", "length")
    dimension = max(float(spans[0]), float(spans[2])) if size_axis == "width" else float(spans[1])
    return alignment, anchor, dimension


def _terminal_width(vertices: np.ndarray, high: bool) -> float:
    y = vertices[:, 1]; cutoff = (y.max() - .05 * np.ptp(y) if high else y.min() + .05 * np.ptp(y))
    points = vertices[y >= cutoff] if high else vertices[y <= cutoff]
    return max(float(np.ptp(points[:, 0])), float(np.ptp(points[:, 2])))


def _prop_semantic_direction(vertices: np.ndarray, prop_class: str | None,
                             anchor: np.ndarray) -> tuple[bool, Any]:
    if prop_class in ("weapon", "hat"):
        low = _terminal_width(vertices, False); high = _terminal_width(vertices, True)
        valid = high >= low if prop_class == "weapon" else high <= low
        return valid, {"lowWidthMu": low, "highWidthMu": high}
    if prop_class in ("pendant", "pouch"):
        norm = float(np.linalg.norm(anchor)); median_y = float(np.median(vertices[:, 1]))
        return norm < 1e-4 and median_y < 0, {"anchorNormMu": norm, "medianYMu": median_y}
    return True, "n/a"


def validate(body_path: Path, skeleton_path: Path, asset_path: Path, fit_path: Path, requested: str) -> dict[str, Any]:
    body, asset = load_glb(body_path), load_glb(asset_path)
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    fit = json.loads(fit_path.read_text(encoding="utf-8"))
    body_mesh, asset_mesh = _mesh(body), _mesh(asset)
    checks = _binding_checks(body_path, skeleton, fit)
    kind = fit.get("kind")
    kind_valid = kind in TRIANGLE_LIMITS
    checks.append(_check("fit.kind", kind_valid, kind, sorted(TRIANGLE_LIMITS)))
    if not all(check["pass"] for check in checks):
        return _result(fit, asset_path, fit_path, checks, requested)
    skinned = kind in ("template", "garment", "hair", "head")
    if skinned:
        checks.extend(_skinning_checks(body, asset, asset_mesh, skeleton, fit))
    elif kind == "prop":
        skin_count = len(asset.json.get("skins", []))
        rigid = skin_count == 0 and asset_mesh.joints is None and asset_mesh.weights is None
        checks.append(_check("prop.noSkin", rigid, {"skins": skin_count,
                             "vertexSkinAttributes": asset_mesh.joints is not None or asset_mesh.weights is not None},
                             {"skins": 0, "vertexSkinAttributes": False}))
    if not all(check["pass"] for check in checks):
        return _result(fit, asset_path, fit_path, checks, requested)

    body_faces, asset_faces = _faces(body_mesh), _faces(asset_mesh)
    m_per_mu = _positive_number(skeleton.get("mPerMu")) or 1.0
    body_normals = body_mesh.normals if body_mesh.normals is not None else _vertex_normals(body_mesh.positions, body_faces)
    if skinned:
        static_inside, dynamic = _penetration_rates(
            body, asset, body_mesh, asset_mesh, m_per_mu)
        checks.append(_check("penetration.bindVertices", static_inside == 0, static_inside, 0))
        threshold = 0.005 if requested == "approved" else 0.02
        for clip in ("idle", "walk", "run"):
            present = clip in dynamic; value = dynamic.get(clip)
            checks.append(_check(f"penetration.{clip}", present and value <= threshold, value,
                                 f"<= {threshold}", frames=24))

        checks.extend(_mask_checks(fit, skeleton))

    if kind in ("garment", "hair"):
        source = (_refit_source(fit, fit_path, skeleton) if "refitFrom" in fit
                  else _garment_source(fit, fit_path, skeleton, asset_mesh))
        source = _expanded_source(source, asset_mesh.positions)
        checks.extend(_geometry_checks(source, asset_mesh, body_mesh, m_per_mu))
    elif kind == "prop":
        source = _expanded_source(_source_geometry(fit, fit_path), asset_mesh.positions)
        checks.extend(_geometry_checks(source, asset_mesh, None, m_per_mu))
    checks.append(_region_check(asset, asset_mesh, skinned))

    triangles = len(asset_mesh.indices) // 3
    limit = TRIANGLE_LIMITS.get(kind, 30_000)
    checks.append(_check("budget.triangles", triangles <= limit, triangles, f"<= {limit}"))
    sizes = _texture_sizes(asset); largest = max((max(size) for size in sizes), default=0)
    checks.append(_check("budget.textureMaxDimension", largest <= 2048, largest, "<= 2048", images=sizes))
    checks.extend(_material_checks(asset, str(kind)))
    mesh_nodes = [node for node in asset.json.get("nodes", []) if "mesh" in node]
    material_refs = [primitive.get("material") for mesh in asset.json.get("meshes", [])
                     for primitive in mesh.get("primitives", [])]
    material_count = len(asset.json.get("materials", []))
    checks += [_check("asset.meshNodeCount", len(mesh_nodes) == 1, len(mesh_nodes), 1),
               _check("asset.materialReferences", bool(material_refs) and all(
                   isinstance(value, int) and 0 <= value < material_count for value in material_refs),
                   material_refs, f"0..{material_count - 1}")]

    if kind == "prop":
        transform_keys = sorted({key for node in asset.json.get("nodes", []) for key in
                                 ("matrix", "translation", "rotation", "scale") if key in node})
        anchor_spec = fit.get("diagnostics", {}).get("anchorPositionMu")
        anchor_ok = isinstance(anchor_spec, list) and len(anchor_spec) == 3
        axis_alignment, computed_anchor, axis_length_mu = _prop_axis_and_anchor(asset_mesh.positions, fit)
        anchor = computed_anchor if anchor_ok else np.full(3, math.inf)
        recorded_anchor = np.asarray(anchor_spec if anchor_ok else [math.inf] * 3, dtype=float)
        size_ok = all(name in fit for name in ("measuredLengthMu", "scaleApplied", "realSizeM"))
        measured = float(fit.get("measuredLengthMu", math.nan))
        scale = float(fit.get("scaleApplied", math.nan)); real_m = float(fit.get("realSizeM", math.nan))
        actual_m = axis_length_mu * m_per_mu
        declared_length_mu = measured * scale
        size_error = abs(actual_m - real_m) / real_m if size_ok and real_m > 0 else math.inf
        prop_class = fit.get("class")
        direction_ok, direction_value = _prop_semantic_direction(asset_mesh.positions, prop_class, anchor)
        checks += [_check("prop.noNodeTransform", not transform_keys, transform_keys, []),
                   _check("prop.anchorEvidence", anchor_ok, anchor_ok, True),
                   _check("prop.anchorMu", anchor_ok and float(np.linalg.norm(anchor)) < 1e-4 and
                          np.allclose(recorded_anchor, anchor, atol=1e-7),
                          {"computed": anchor.tolist(), "recorded": recorded_anchor.tolist()}, "norm < 1e-4 and match"),
                   _check("prop.mainAxisY", fit.get("up") == "+Y" and axis_alignment >= 0.999,
                          {"up": fit.get("up"), "alignment": axis_alignment}, "+Y and >= 0.999"),
                   _check("prop.semanticDirection", direction_ok, direction_value,
                          "weapon body +Y; hat opening -Y; pendant/pouch string top y=0"),
                   _check("prop.realSizeEvidence", size_ok, size_ok, True),
                   _check("prop.declaredLengthMu", size_ok and abs(axis_length_mu - declared_length_mu) <= 1e-4,
                          {"mesh": axis_length_mu, "declared": declared_length_mu}, "差 <= 1e-4 mu"),
                   _check("prop.realSizeError", size_error <= 0.02, size_error, "<= 0.02")]

    return _result(fit, asset_path, fit_path, checks, requested)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--body", required=True, type=Path, help="带 idle/walk/run 的素体正本 GLB")
    parser.add_argument("--skeleton", required=True, type=Path, help="正本 skeleton.json")
    parser.add_argument("--asset", required=True, type=Path, help="待校验装备 GLB")
    parser.add_argument("--fit", required=True, type=Path, help="待校验 fit.json")
    parser.add_argument("--out", required=True, type=Path, help="report.json 输出路径")
    parser.add_argument("--level", choices=("draft", "approved"), default="approved", help="申请门禁等级（默认 approved）")
    parser.add_argument("--json", action="store_true", help="stdout 只打印 report JSON")
    args = parser.parse_args(argv)
    try:
        for path in (args.body, args.skeleton, args.asset, args.fit):
            if not path.is_file(): raise ValueError(f"文件不存在：{path}")
        report = validate(args.body, args.skeleton, args.asset, args.fit, args.level)
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        if args.json: print(json.dumps(report, ensure_ascii=False))
        else: print(f"{args.asset}: {report['level']}（{sum(c['pass'] for c in report['checks'])}/{len(report['checks'])} checks）")
        return 3 if report["level"] == "fail" else 0
    except (OSError, ValueError, KeyError, IndexError, TypeError) as exc:
        return _fail(str(exc))


if __name__ == "__main__":
    raise SystemExit(main())
