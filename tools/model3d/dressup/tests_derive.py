#!/usr/bin/env python3
"""derive_template.py 的合成与正本产物回归；不访问网络。"""

from __future__ import annotations

import json
import copy
from contextlib import redirect_stdout
from hashlib import sha256
import io
from pathlib import Path
import tempfile

import numpy as np

try:
    from .common import lbs
    from .derive_template import (DeriveError, _geometric_vertex_normals, _serialize, _write_accessor, canonical_displacement, canonical_positions, displacement_limit,
                                  derive, enforce_gates, geometry_quality, joint_map, load_specs, main as derive_main,
                                  metrics, repair_folds, rotate_surface_normals, scale_hips_translation, scaled_document,
                                  source_m_per_mu, transform_normals, validate_tracks)
    from .glb_io import GLB, Mesh, load_glb
except ImportError:
    from common import lbs
    from derive_template import (DeriveError, _geometric_vertex_normals, _serialize, _write_accessor, canonical_displacement, canonical_positions, displacement_limit,
                                 derive, enforce_gates, geometry_quality, joint_map, load_specs, main as derive_main,
                                 metrics, repair_folds, rotate_surface_normals, scale_hips_translation, scaled_document,
                                 source_m_per_mu, transform_normals, validate_tracks)
    from glb_io import GLB, Mesh, load_glb


def synthetic(animation_path: str = "translation", animation_node: int = 0) -> GLB:
    """Hips→UpLeg→Leg→Foot 的列向量测试骨架，另含最小躯干/双臂。"""
    names = ["Hips", "LeftUpLeg", "LeftLeg", "LeftFoot", "RightUpLeg", "RightLeg",
             "RightFoot", "Spine", "Spine1", "Spine2", "Neck", "Head",
             "LeftShoulder", "LeftArm", "LeftForeArm", "RightShoulder", "RightArm", "RightForeArm"]
    parents = [None, 0, 1, 2, 0, 4, 5, 0, 7, 8, 9, 10, 9, 12, 13, 9, 15, 16]
    translations = [[0, 3, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0],
                    [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
                    [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0]]
    nodes = [{"name": f"mixamorig:{name}", "translation": value} for name, value in zip(names, translations)]
    for child, parent in enumerate(parents):
        if parent is not None: nodes[parent].setdefault("children", []).append(child)
    document = {"asset": {"version": "2.0"}, "nodes": nodes,
                "skins": [{"joints": list(range(len(nodes)))}],
                "animations": [{"samplers": [{"output": 0}],
                                "channels": [{"sampler": 0, "target": {"node": animation_node, "path": animation_path}}]}],
                "accessors": [{"bufferView": 0, "componentType": 5126, "count": 2, "type": "VEC3"}],
                "bufferViews": [{"buffer": 0, "byteLength": 24}], "buffers": [{"byteLength": 24}]}
    glb = GLB(Path("synthetic.glb"), document, np.asarray([[0, 0, 0], [1, 2, 3]], dtype="<f4").tobytes())
    worlds = np.asarray([glb.world_matrix(i) for i in range(len(nodes))]); glb.json["skins"][0]["inverseBindMatrices"] = None
    glb.skin = lambda index=0: type("Skin", (), {"joints": tuple(range(len(nodes))),
        "inverse_bind_matrices": np.linalg.inv(worlds)})()
    return glb


def check(condition: bool, message: str) -> None:
    if not condition: raise AssertionError(message)


def test_specs() -> None:
    specs = load_specs(Path(__file__).with_name("template_specs.json"))
    check(len(specs) == 6 and specs["tpl_f_tall"].hips_ratio == 0.585, "六模板规格读取失败")


def test_bone_lengths() -> None:
    source = synthetic(); document = scaled_document(source, k_leg=1.25, k_spine=0.8, k_shoulder=1.1, k_arm=0.9)
    check(document["nodes"][0]["translation"] == [0, 3, 0], "Hips bind translation 不得缩放或平移")
    check(np.allclose(document["nodes"][1]["translation"], [0, -1.25, 0]), "UpLeg 子骨长度未缩放")
    check(np.allclose(document["nodes"][2]["translation"], [0, -1.25, 0]), "Leg 子骨长度未缩放")
    check(np.allclose(document["nodes"][8]["translation"], [0, .8, 0]), "Spine 子骨长度未缩放")
    check(np.allclose(document["nodes"][10]["translation"], [0, .8, 0]), "Neck 未按 k_spine 缩放")
    check(document["nodes"][11]["translation"] == [0, 1, 0], "Head translation 不得缩放")
    check(np.allclose(document["nodes"][14]["translation"], [-.9, 0, 0]), "ForeArm 未按 k_arm 缩放")


def test_lbs_and_ibm() -> None:
    source = synthetic(); old_world = np.asarray([source.world_matrix(i) for i in range(18)]); old_ibm = np.linalg.inv(old_world)
    changed = GLB(source.path, scaled_document(source, k_leg=2, k_spine=1, k_shoulder=1, k_arm=1), source.bin)
    new_world = np.asarray([changed.world_matrix(i) for i in range(18)])
    point = np.asarray([[0, 1, 0]], dtype=float); joints = np.asarray([[2, 0, 0, 0]]); weights = np.asarray([[1., 0, 0, 0]])
    moved = lbs(point, joints, weights, new_world, old_ibm)
    check(np.allclose(moved, [[0, -1, 0]]), "旧 IBM + 新 bind 世界矩阵未按两段腿骨位移顶点")
    hips_point = lbs(point, np.asarray([[0, 0, 0, 0]]), weights, new_world, old_ibm)
    check(np.array_equal(hips_point, point), "Hips 权重顶点不应因腿链缩放移动")
    new_ibm = np.linalg.inv(new_world)
    check(np.max(np.abs(new_world @ new_ibm - np.eye(4))) < 1e-12, "新 IBM 与 bind 世界矩阵不互逆")
    normals = transform_normals(np.asarray([[0, 3, 0.]]), joints, weights, new_world, old_ibm)
    check(np.allclose(normals, [[0, 1, 0]]) and np.allclose(np.linalg.norm(normals, axis=1), 1), "法线未归一")


def test_tracks() -> None:
    source = synthetic(); before = np.asarray([[0., -2, 0], [1, 2, 3]])
    check(validate_tracks(source) == [(0, 0)], "Hips translation 轨道未识别")
    after = scale_hips_translation(before, 1.5)
    check(np.array_equal(after, before * 1.5), "Hips 根运动必须逐分量严格等于 source × k_leg")
    check(np.array_equal(after - before * 1.5, np.zeros_like(after)), "Hips 根运动不得叠加额外偏移")
    check(np.array_equal(before, [[0, -2, 0], [1, 2, 3]]), "轨道缩放修改了输入")
    for path, node in (("translation", 2), ("scale", 0)):
        try: validate_tracks(synthetic(path, node))
        except DeriveError: pass
        else: raise AssertionError(f"应拒绝 {path} 轨道")


def test_independent_height_and_gates() -> None:
    specs = load_specs(Path(__file__).with_name("template_specs.json"))
    source, target = specs["tpl_f_medium"], specs["tpl_f_small"]
    with tempfile.TemporaryDirectory() as temporary:
        body = Path(temporary) / "body.glb"; body.write_bytes(b"unused")
        (body.parent / "skeleton.json").write_text(json.dumps({
            "defaultHeightM": source.height_m, "mPerMu": 2.0}), encoding="utf-8")
        m_per_mu = source_m_per_mu(body, source.height_m / 2.0, source)
        wrong_height_mu = source.height_m / 2.0
        check(abs(wrong_height_mu * m_per_mu - target.height_m) > 0.01,
              "错误几何身高不能用目标结果回算为零误差")
    source = np.asarray([[0., 4., 0.], [1., 5., 0.]])
    target = np.asarray([[0., -7., 0.], [1., -5.9, 0.]])
    source_canonical, _ = canonical_positions(source); target_canonical, _ = canonical_positions(target)
    maximum, source_floor, target_floor = canonical_displacement(source, target)
    check((source_floor, target_floor) == (4.0, -7.0), "脚底基准未分别取源/目标最小 y")
    check(source_canonical[:, 1].min() == target_canonical[:, 1].min() == 0, "规范坐标脚底必须为 y=0")
    check(abs(maximum - 0.1) < 1e-12, "规范坐标位移仍受整体平移影响")
    limit = displacement_limit(1.0, 1.1)
    check(abs(limit - 0.2) < 1e-12 and displacement_limit(1.0, 1.01) == 0.04, "动态位移上限错误")
    enforce_gates({"heightRatio": 0.0, "hipsRatio": 0.0, "shoulderRatio": 0.0}, limit, False, limit)
    failures = ((limit + 1e-6, {"heightRatio": 0., "hipsRatio": 0., "shoulderRatio": 0.}),
                (0.0, {"heightRatio": .005001, "hipsRatio": 0., "shoulderRatio": 0.}))
    for displacement, error in failures:
        try: enforce_gates(error, displacement, False, limit)
        except DeriveError: pass
        else: raise AssertionError("位移或比例超限必须失败")


def test_fold_repair_preserves_two_ring_boundary() -> None:
    width = 9
    source = np.array([[x * .01, y * .01, 0] for y in range(width) for x in range(width)], dtype=float)
    faces = []
    for y in range(width - 1):
        for x in range(width - 1):
            a = y * width + x; faces.extend([[a, a + 1, a + width], [a + 1, a + width + 1, a + width]])
    faces = np.asarray(faces); center = 4 * width + 4
    source[center, 1] = source[center - width, 1] + .0001  # 0.1 mm 窄三角
    normals = np.tile([0., 0., 1.], (len(source), 1)); skin_weights = np.zeros(len(source)); skin_weights[center] = 1
    for shrink in (.3, .5, .65):
        # 平移型 LBS 的极窄过渡权重，让腿链缩短时局部越过邻面。
        target = source + [.004, -.003, .002]
        target[:, 1] -= skin_weights * .003 * (1 - shrink); snapshot = target.copy()
        a = Mesh(source, faces.reshape(-1), normals=normals); b = Mesh(target, faces.reshape(-1), normals=normals)
        check(geometry_quality(a, b)["flippedFaces"] == 2, "合成窄三角没有产生预期翻向")
        cross = lambda p: np.cross(p[faces[:, 1]] - p[faces[:, 0]], p[faces[:, 2]] - p[faces[:, 0]])
        flipped = np.einsum("ij,ij->i", cross(source), cross(target)) <= 0
        allowed = np.zeros(len(source), dtype=bool); allowed[np.unique(faces[flipped])] = True
        for _ in range(2): allowed[np.unique(faces[np.any(allowed[faces], axis=1)])] = True
        result, report = repair_folds(source, target, faces, m_per_mu=1.7)
        check(report["before"] == 2 and report["after"] == 0, "防折叠没有清零")
        check(np.array_equal(result[~allowed], target[~allowed]), "两环邻域外不应移动")
        check(np.array_equal(target, snapshot), "防折叠修改了输入")
        check(abs(report["maxCorrectionMm"] - np.linalg.norm(result - target, axis=1).max() * 1700) < 1e-9, "修复量单位错误")
        check(geometry_quality(a, Mesh(result, faces.reshape(-1), normals=normals))["flippedFaces"] == 0, "实际三角仍翻向")
        repeated, second = repair_folds(source, result, faces)
        check(np.array_equal(repeated, result) and second["maxCorrectionMm"] == 0, "防折叠不幂等")


def test_normal_rotation_and_consistency() -> None:
    source = np.array([[0., 0, 0], [1, 0, 0], [0, 1, 0]]); faces = np.array([[0, 1, 2]])
    normals = np.tile([.6, 0, .8], (3, 1))
    for angle in (.1, .7, 1.2):
        c, s = np.cos(angle), np.sin(angle); rotation = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
        target = source @ rotation.T; result = rotate_surface_normals(source, target, faces, normals)
        check(np.allclose(result, normals @ rotation.T, atol=1e-10), "未保持原法线与几何法线的夹角")
        check(np.allclose(np.linalg.norm(result, axis=1), 1), "旋转法线未归一")
    # 变形前后几何法线的转角不足以独自保证每个很窄三角与三顶点法线和同向。
    points = np.array([[0., 0, 0], [1, 0, 0], [0, 1, 0], [.1, .1, .2]])
    adjacent = np.array([[0, 1, 3], [1, 2, 3], [2, 0, 3]])
    stored = np.array([[0., 0, 1], [0, 0, 1], [0, 0, 1], [.3, .4, -.02]])
    stored /= np.linalg.norm(stored, axis=1, keepdims=True)
    deformed = points.copy(); deformed[3] = [.7, .01, .03]
    a, b = _geometric_vertex_normals(points, adjacent), _geometric_vertex_normals(deformed, adjacent)
    cross = np.cross(a, b); sine = np.linalg.norm(cross, axis=1, keepdims=True); k = cross / np.maximum(sine, 1e-30)
    cosine = np.sum(a * b, axis=1, keepdims=True)
    rotation_only = stored * cosine + np.cross(k, stored) * sine + k * np.sum(k * stored, axis=1, keepdims=True) * (1 - cosine)
    raw = geometry_quality(Mesh(points, adjacent.reshape(-1), normals=stored),
                           Mesh(deformed, adjacent.reshape(-1), normals=rotation_only))
    check(raw["flippedFaces"] == 0 and raw["newNegativeFaces"] == 1, "反例必须证明只旋转仍有新反向面")
    corrected = rotate_surface_normals(points, deformed, adjacent, stored)
    quality = geometry_quality(Mesh(points, adjacent.reshape(-1), normals=stored),
                               Mesh(deformed, adjacent.reshape(-1), normals=corrected))
    check(quality["sourceNegativeFaces"] == quality["newNegativeFaces"] == 0, "新反向面未清零")


def test_real_products() -> None:
    root = Path(__file__).resolve().parents[3]
    templates = root / "assets/default/model3d/dressup/templates"
    products = sorted(templates.glob("*/derive.json"))
    check(bool(products), "没有发现派生产物，回归不得静默跳过")
    for report_path in products:
        report = json.loads(report_path.read_text()); path = report_path.parent; name = report["targetId"]
        source_path = templates / report["source"]["templateId"]
        source = load_glb(source_path / "body.glb"); source_height = metrics(source, source.mesh().positions)["heightMu"]
        source_skeleton = json.loads((source_path / "skeleton.json").read_text())
        source_radii = source_skeleton["neckRing"]["radiusMu"]; expected_ratio = report["target"]["heightRatio"]
        target = load_glb(path / "body.glb"); actual_ratio = metrics(target, target.mesh().positions)["heightMu"] / source_height
        check(name == path.name, f"{name} 模板目录与记录 ID 不符")
        actual_metrics = metrics(target, target.mesh().positions)
        check(abs(actual_ratio - expected_ratio) <= 0.005, f"{name} 几何身高未真实改变")
        check(report["source"]["sha256"] == sha256((source_path / "body.glb").read_bytes()).hexdigest(), f"{name} 源 SHA 不一致")
        check(set(report["scale"]) == {"leg", "spine", "shoulder", "arm"},
              f"{name} 派生记录不得含 rootOffset 等整体平移")
        source_names, target_names = joint_map(source), joint_map(target)
        k_leg, k_spine = report["scale"]["leg"], report["scale"]["spine"]
        check(target.json["nodes"][target_names["Hips"]].get("translation")
              == source.json["nodes"][source_names["Hips"]].get("translation"),
              f"{name} Hips bind translation 被改写")
        source_neck = np.asarray(source.json["nodes"][source_names["Neck"]]["translation"])
        target_neck = np.asarray(target.json["nodes"][target_names["Neck"]]["translation"])
        check(np.allclose(target_neck, source_neck * k_spine), f"{name} Neck 未按 k_spine 缩放")
        check(target.json["nodes"][target_names["Head"]].get("translation")
              == source.json["nodes"][source_names["Head"]].get("translation"),
              f"{name} Head translation 被缩放")
        for source_animation, target_animation in zip(source.json["animations"], target.json["animations"]):
            for source_channel, target_channel in zip(source_animation["channels"], target_animation["channels"]):
                if source_channel["target"]["path"] != "translation": continue
                source_accessor = source_animation["samplers"][source_channel["sampler"]]["output"]
                target_accessor = target_animation["samplers"][target_channel["sampler"]]["output"]
                expected = np.asarray(scale_hips_translation(source.accessor(source_accessor), k_leg), dtype=np.float32)
                check(np.array_equal(target.accessor(target_accessor), expected),
                      f"{name} Hips translation 不严格等于 source × k_leg")
        maximum, source_floor, target_floor = canonical_displacement(source.mesh().positions, target.mesh().positions)
        measured = report["measured"]
        check(abs(measured["sourceFloorYMu"] - source_floor) < 1e-12
              and abs(measured["targetFloorYMu"] - target_floor) < 1e-12
              and abs(measured["maxVertexDisplacementMu"] - maximum) < 1e-12,
              f"{name} 脚底规范坐标位移记录不一致")
        check(abs(target_floor - source_floor) > 1e-3, f"{name} 疑似用整体平移强行对齐脚底")
        check(maximum <= report["measured"]["maxVertexDisplacementLimitMu"], f"{name} 规范坐标位移超限")
        enforce_gates({"heightRatio": actual_ratio - expected_ratio,
                       "hipsRatio": actual_metrics["hipsRatio"] - report["target"]["hipsRatio"],
                       "shoulderRatio": actual_metrics["shoulderRatio"] - report["target"]["shoulderRatio"]},
                      maximum, not np.all(np.isfinite(target.mesh().positions)),
                      displacement_limit(source_height, source_height * expected_ratio))
        skeleton = json.loads((path / "skeleton.json").read_text())
        differences = [abs(skeleton["neckRing"]["radiusMu"][axis] * skeleton["mPerMu"]
                           - source_radii[axis] * source_skeleton["mPerMu"]) for axis in ("x", "z")]
        check(max(differences) < 0.002, f"{name} 实际 skeleton.json 颈环差达到 2 mm")
        quality = geometry_quality(source.mesh(), target.mesh())
        # 旧产物不重派生；section 环或新修复记录的产物必须自动进入 T5b 几何门。
        if skeleton["neckRing"].get("mode") == "section" or "foldRepair" in report:
            check(quality["flippedFaces"] == quality["newNegativeFaces"] == 0, f"{name} 新派生几何门失败")
            check(quality["negativeFaces"] <= quality["sourceNegativeFaces"], f"{name} 反向面增加")
            check(report["foldRepair"]["after"] == 0, f"{name} 修复记录未清零")


def test_derive_and_check_in_temporary_directory() -> None:
    root = Path(__file__).resolve().parents[3]; templates = root / "assets/default/model3d/dressup/templates"
    source = templates / "tpl_f_medium/body.glb"; specs = Path(__file__).with_name("template_specs.json")
    source_bytes = source.read_bytes()
    with tempfile.TemporaryDirectory(prefix="tianshu-t5b-derive-") as directory:
        out = Path(directory); report = derive(source, specs, "tpl_f_small", out)
        check(report["foldRepair"]["after"] == report["validation"]["newNegativeFaces"] == 0, "临时派生几何门失败")
        args = ["--from", str(source), "--spec", str(specs), "--id", "tpl_f_small", "--out", str(out), "--check", "--json"]
        before = {p.name: p.read_bytes() for p in out.iterdir()}
        with redirect_stdout(io.StringIO()): code = derive_main(args)
        check(code == 0 and before == {p.name: p.read_bytes() for p in out.iterdir()}, "--check 不应写文件")
        damaged = copy.deepcopy(report); damaged["outputSha256"] = "0" * 64
        (out / "derive.json").write_text(json.dumps(damaged))
        with redirect_stdout(io.StringIO()): code = derive_main(args)
        check(code != 0, "--check 接受被篡改产物")
        # 同时更新 SHA，确保校验的是实际几何而非仅检查摘要。
        output = load_glb(out / "body.glb"); positions = output.mesh().positions.astype(float)
        face = output.mesh().indices.reshape(-1, 3)[0]; a, b, c = positions[face]
        positions[face[2]] = a + b - c
        binary = bytearray(output.bin); offset = 0
        for primitive in output.json["meshes"][0]["primitives"]:
            index = primitive["attributes"]["POSITION"]; count = output.json["accessors"][index]["count"]
            _write_accessor(output, binary, index, positions[offset:offset + count], extrema=True); offset += count
        payload = _serialize(output.json, bytes(binary)); (out / "body.glb").write_bytes(payload)
        damaged = copy.deepcopy(report); damaged["outputSha256"] = sha256(payload).hexdigest()
        (out / "derive.json").write_text(json.dumps(damaged))
        stream = io.StringIO()
        with redirect_stdout(stream): code = derive_main(args)
        check(code != 0 and "翻向" in stream.getvalue(), "--check 只验摘要却没有重测翻向")
    check(source.read_bytes() == source_bytes, "测试修改了真实源模板")


def main() -> int:
    tests = [test_specs, test_bone_lengths, test_lbs_and_ibm, test_tracks,
             test_independent_height_and_gates, test_fold_repair_preserves_two_ring_boundary,
             test_normal_rotation_and_consistency, test_real_products, test_derive_and_check_in_temporary_directory]
    for test in tests: test()
    print(f"通过：{len(tests)}/{len(tests)} derive tests")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
