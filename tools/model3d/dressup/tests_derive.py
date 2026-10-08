#!/usr/bin/env python3
"""derive_template.py 的合成与正本产物回归；不访问网络。"""

from __future__ import annotations

import json
from pathlib import Path
import tempfile

import numpy as np

try:
    from .common import lbs
    from .derive_template import (DeriveError, canonical_displacement, canonical_positions, displacement_limit,
                                  enforce_gates, joint_map, load_specs, metrics, scale_hips_translation, scaled_document,
                                  source_m_per_mu, transform_normals, validate_tracks)
    from .glb_io import GLB, load_glb
except ImportError:
    from common import lbs
    from derive_template import (DeriveError, canonical_displacement, canonical_positions, displacement_limit,
                                 enforce_gates, joint_map, load_specs, metrics, scale_hips_translation, scaled_document,
                                 source_m_per_mu, transform_normals, validate_tracks)
    from glb_io import GLB, load_glb


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


def test_real_products() -> None:
    root = Path(__file__).resolve().parents[3]
    templates = root / "assets/default/model3d/dressup/templates"
    paths = {name: templates / name for name in ("tpl_f_medium", "tpl_f_small", "tpl_f_tall")}
    if not all((path / "body.glb").exists() and (path / "skeleton.json").exists() for path in paths.values()):
        return
    source = load_glb(paths["tpl_f_medium"] / "body.glb"); source_height = metrics(source, source.mesh().positions)["heightMu"]
    source_skeleton = json.loads((paths["tpl_f_medium"] / "skeleton.json").read_text())
    source_radii = source_skeleton["neckRing"]["radiusMu"]
    for name, expected_ratio in (("tpl_f_small", 1.58 / 1.66), ("tpl_f_tall", 1.72 / 1.66)):
        target = load_glb(paths[name] / "body.glb"); actual_ratio = metrics(target, target.mesh().positions)["heightMu"] / source_height
        check(abs(actual_ratio - expected_ratio) <= 0.005, f"{name} 几何身高未真实改变")
        report = json.loads((paths[name] / "derive.json").read_text())
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
        skeleton = json.loads((paths[name] / "skeleton.json").read_text())
        differences = [abs(skeleton["neckRing"]["radiusMu"][axis] * skeleton["mPerMu"]
                           - source_radii[axis] * source_skeleton["mPerMu"]) for axis in ("x", "z")]
        check(max(differences) < 0.002, f"{name} 实际 skeleton.json 颈环差达到 2 mm")


def main() -> int:
    tests = [test_specs, test_bone_lengths, test_lbs_and_ibm, test_tracks,
             test_independent_height_and_gates, test_real_products]
    for test in tests: test()
    print(f"通过：{len(tests)}/{len(tests)} derive tests")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
