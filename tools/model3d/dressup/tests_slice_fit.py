#!/usr/bin/env python3
"""slice_fit.py（ADR 0002 竖直切片贴合）的无框架合成回归。

合成件：椭圆柱素体（可带两腿、斜手臂）+ 已知双层衣片。断言：r = 0 时内层恰在体外（整件相似、仿射）、
r = 1 时内层贴体 1 mm、厚度 / 层距保持、拓扑与 UV 不变、高度对齐到标注；另对真实模板复算标注与盔甲测试件做一致性回归。
"""
from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path
import sys
import tempfile
import traceback

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import slice_fit as sf  # noqa: E402
from glb_io import GLBBuilder, ImageData, Mesh, PrimitiveRange, load_glb  # noqa: E402
from fit_garment import load_world_mesh  # noqa: E402
from slice_fit_testkit import (BODY_LEVELS, GAP, MM, body_model, cylinder_body, ellipse, garment_model,  # noqa: E402
                               merge, pure_params, shell_garment, tube, wavy_garment, write_static)

ROOT = Path(__file__).resolve().parents[3]
TEMPLATES = ROOT / "assets/default/model3d/dressup/templates"
GARMENTS = ROOT / "assets/default/model3d/dressup/garments"


# ---------------------------------------------------------------------------
# 基础件
# ---------------------------------------------------------------------------

def test_axis_map_exact_monotone() -> None:
    mapping = sf.AxisMap([("a", 0.3, 0.4), ("b", 0.55, 0.6), ("c", 0.8, 0.9), ("bad", 0.6, 0.5)])
    assert mapping.dropped == ["bad"], mapping.dropped
    assert np.allclose(mapping(np.array([0.3, 0.55, 0.8])), [0.4, 0.6, 0.9], atol=1e-12)
    xs = np.linspace(0.0, 1.2, 400); ys = mapping(xs)
    assert np.all(np.diff(ys) > 0), "竖直映射必须单调"
    rigid = sf.AxisMap([("a", 0.3, 0.4), ("b", 0.55, 0.6), ("c", 0.8, 0.9)], linear_only=True)
    assert rigid.kind == "linear" and np.allclose(np.diff(rigid(xs), 2), 0.0, atol=1e-12)


def test_rays_hull_envelopes() -> None:
    square = np.array([[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]], float)
    radius, _ = sf.ray_hits_2d(square, np.zeros(2), np.array([0.0, math.pi / 4]))
    assert np.allclose(radius, [1.0, math.sqrt(2.0)])
    # 两腿（两个圆）的凸包：正前方射线落在两圆公切线上，而不是腿间。
    t = np.linspace(0, 2 * math.pi, 64, endpoint=False)
    legs = np.concatenate([np.column_stack((cx + 0.05 * np.cos(t), 0.05 * np.sin(t))) for cx in (-0.07, 0.07)])
    hull = sf.convex_hull_2d(legs)
    front, cos_beta = sf.hull_rays(hull, hull.centroid, np.array([math.pi / 2]))
    assert abs(front[0] - 0.05) < 1e-3 and cos_beta[0] > 0.99
    raw = np.random.default_rng(1).normal(size=(20, 36)); mask = np.ones_like(raw, bool); mask[5:8, 10:20] = False
    envelope = sf.upper_envelope(raw, mask, 1.5, 1.5, 30)
    assert np.all(envelope[mask] >= raw[mask] - 1e-12)
    values = np.array([1.0, 1.3, 0.9, 1.1]); coords = np.array([0.0, 0.1, 0.2, 0.3])
    lip = sf.lipschitz_envelope(values, np.ones(4, bool), coords, 2.0)
    assert np.all(lip >= values - 1e-12) and np.all(np.abs(np.diff(lip)) <= 2.0 * 0.1 + 1e-12)
    assert np.allclose(sf.lipschitz_envelope(values, np.ones(4, bool), coords, 0.0), 1.3)


# ---------------------------------------------------------------------------
# 作者方案的核心断言
# ---------------------------------------------------------------------------

def _inner_gap(body: sf.BodyModel, positions: np.ndarray, inner_count: int) -> np.ndarray:
    return body.signed_distance(positions[:inner_count])


def test_elastic_r1_inner_ring_one_mm() -> None:
    body = cylinder_body()
    positions, faces, uvs, inner_count = wavy_garment()
    garment = garment_model(positions, faces, uvs, elasticity=1.0)
    result = sf.slice_fit(body, garment, params=pure_params())
    gap = _inner_gap(body, result.positions, inner_count)
    inner_rows = (positions[:inner_count, 1] > 0.31) & (positions[:inner_count, 1] < 0.79)
    assert gap.min() > GAP - 0.05 * MM, f"r=1 内层有点进到 1 mm 以内：{gap.min() / MM:.3f} mm"
    assert np.quantile(gap[inner_rows], 0.98) < GAP + 0.35 * MM, f"r=1 内层没贴体：p98 {np.quantile(gap[inner_rows], 0.98) / MM:.3f} mm"
    # 厚度（内外层配对点距离）不变
    before = np.linalg.norm(positions[inner_count:] - positions[:inner_count], axis=1)
    after = np.linalg.norm(result.positions[inner_count:] - result.positions[:inner_count], axis=1)
    assert np.max(np.abs(after - before)) < 0.02 * MM, f"r=1 厚度变化 {np.max(np.abs(after - before)) / MM:.4f} mm"


def test_inelastic_r0_similarity_just_outside() -> None:
    body = cylinder_body()
    positions, faces, uvs, inner_count = wavy_garment()
    garment = garment_model(positions, faces, uvs, elasticity=0.0)
    result = sf.slice_fit(body, garment, params=pure_params())
    gap = _inner_gap(body, result.positions, inner_count)
    assert GAP - 0.05 * MM < gap.min() < GAP + 0.3 * MM, f"r=0 内层最小间隙 {gap.min() / MM:.3f} mm（应恰为 1 mm）"
    # 整件相似：输出是输入的同一个仿射（竖直线性 + 水平统一缩放 + 平移），逐点残差 ~0
    design = np.column_stack((positions, np.ones(len(positions))))
    solution, *_ = np.linalg.lstsq(design, result.positions, rcond=None)
    residual = np.abs(design @ solution - result.positions).max()
    assert residual < 1e-9, f"r=0 不是整件仿射：残差 {residual:.3e}"
    linear = solution[:3].T
    assert abs(linear[0, 0] - linear[2, 2]) < 1e-9 and abs(linear[0, 2]) < 1e-9 and abs(linear[2, 0]) < 1e-9
    ratio = linear[0, 0]
    before = np.linalg.norm(positions[inner_count:] - positions[:inner_count], axis=1)
    after = np.linalg.norm(result.positions[inner_count:] - result.positions[:inner_count], axis=1)
    assert np.allclose(after, ratio * before, rtol=1e-6), "r=0 厚度应随整件 ratio 缩放"


def test_blend_and_heights() -> None:
    body = cylinder_body()
    positions, faces, uvs, inner_count = wavy_garment()
    garment = garment_model(positions, faces, uvs, elasticity=0.4)
    result = sf.slice_fit(body, garment, params=pure_params())
    blended = 0.4 * result.variants["elastic"] + 0.6 * result.variants["inelastic"]
    assert np.allclose(blended, result.positions, atol=1e-12), "最终 ≠ r·弹性 + (1−r)·非弹性"
    # 标注高度：衣物 0.30 / 0.55 / 0.80 三圈映到素体 0.40 / 0.60 / 0.90
    for y_g, y_b in ((0.30, 0.40), (0.55, 0.60), (0.80, 0.90)):
        ring = np.abs(positions[:, 1] - y_g) < 1e-9
        assert ring.any() and np.allclose(result.positions[ring, 1], y_b, atol=1e-9), f"{y_g} 没映到 {y_b}"
    check = result.diagnostics["verticalCheck"]
    assert check["mappingResidualMaxMm"] < 1e-6 and check["landingResidualMaxMm"] < 1e-6, check
    # 水平对中：错位 (+30, −20) mm 被消掉
    offset = result.diagnostics["parts"][0]["offset"]["meanMm"]
    assert abs(offset[0] + 30) < 1.0 and abs(offset[1] - 20) < 1.0, offset


def test_layers_keep_distance() -> None:
    """非星形 / 多层：前襟外搭一层（层距 6 mm），按角度匹配后层距不变，内层仍贴体。"""
    body = cylinder_body()
    ys = np.linspace(0.30, 0.80, 51)
    inner_fn = lambda y, t: ellipse(0.12, 0.095)(y, t)  # noqa: E731
    base = tube(inner_fn, ys, 72, inward=True)
    flap_angles = np.linspace(math.radians(55), math.radians(125), 15)
    flap_pos = []; flap_uv = []
    for k, y in enumerate(ys):
        r = inner_fn(y, flap_angles) + 6 * MM
        flap_pos.append(np.column_stack((r * np.cos(flap_angles), np.full(len(flap_angles), y), r * np.sin(flap_angles))))
        flap_uv.append(np.column_stack((flap_angles / (2 * math.pi), np.full(len(flap_angles), k / 50))))
    flap_pos = np.concatenate(flap_pos); flap_uv = np.concatenate(flap_uv)
    flap_faces = []
    n = len(flap_angles)
    for k in range(len(ys) - 1):
        for j in range(n - 1):
            a = k * n + j; b = a + 1; c = a + n; d = c + 1
            flap_faces += [(a, b, c), (b, d, c)]
    positions, faces, uvs = merge(base, (flap_pos, np.asarray(flap_faces), flap_uv))
    garment = garment_model(positions, faces, uvs, elasticity=1.0)
    result = sf.slice_fit(body, garment, params=pure_params())
    count = len(base[0])
    flap = slice(count, len(positions))
    # 外搭层每点到最内层（同角度同高度）的径向距离：原 6 mm，贴合后仍 6 mm
    theta = np.arctan2(positions[flap, 2], positions[flap, 0])
    after_inner = np.hypot(*(result.positions[:count][:, [0, 2]].T))
    rows = np.round((positions[flap, 1] - 0.30) / 0.01).astype(int)
    cols = np.round(theta / (2 * math.pi / 72)).astype(int) % 72
    inner_after = after_inner[rows * 72 + cols]
    flap_after = np.hypot(result.positions[flap, 0], result.positions[flap, 2])
    assert np.max(np.abs((flap_after - inner_after) - 6 * MM)) < 0.3 * MM, "外搭层层距没保持"
    gap = body.signed_distance(result.positions[:count])
    assert gap.min() > GAP - 0.05 * MM


def test_skirt_spans_between_legs() -> None:
    """腿间凹截面：裆下素体是两腿，裙装按两腿凸包贴合，不钻进腿间。"""
    left = tube(lambda y, t: 0.05 + 0 * t, np.linspace(0.0, 0.3, 31), 48, center=(0.065, 0.0), closed=True)
    right = tube(lambda y, t: 0.05 + 0 * t, np.linspace(0.0, 0.3, 31), 48, center=(-0.065, 0.0), closed=True)
    torso = tube(ellipse(0.115, 0.07), np.linspace(0.3, 1.0, 71), 96, closed=True)   # 不悬出两腿凸包
    positions, faces, _ = merge(left, right, torso)
    body = body_model(positions, faces)
    skirt_pos, skirt_faces, skirt_uv, inner_count = shell_garment(ellipse(0.16, 0.10), thickness=3 * MM,
                                                                  ys=np.linspace(0.10, 0.60, 51))
    body.landmarks["levels"]["crotch"] = {"yMu": 0.20}; body.landmarks["levels"]["bust"] = {"yMu": 0.60}
    garment = garment_model(skirt_pos, skirt_faces, skirt_uv, elasticity=1.0,
                            design={"bust": 0.60, "pelvis": 0.30, "crotch": 0.10})   # 锚点量得 0.60 / 0.10
    result = sf.slice_fit(body, garment, params=pure_params())
    fitted = result.positions[:inner_count]
    low = fitted[:, 1] < 0.29
    # 正前 / 正后的裙片在两腿公切线外（|z| ≥ 腿半径 + 间隙），没被拉进腿间
    front_back = low & (np.abs(fitted[:, 0]) < 0.02)
    assert front_back.any() and np.all(np.abs(fitted[front_back, 2]) > 0.05 + GAP - 0.1 * MM)
    gap = body.signed_distance(result.positions)
    assert gap.min() > GAP - 0.1 * MM, f"裙子穿进腿：{gap.min() / MM:.3f} mm"


def test_sleeve_follows_arm_axis() -> None:
    """A 字手臂斜穿水平面：袖子按臂骨弦切片；衣物袖轴 30°、素体臂 25°，贴合后袖内层贴臂 1 mm 且沿素体臂轴。"""
    torso = tube(ellipse(0.10, 0.07), np.linspace(0.3, 1.0, 71), 96, closed=True)
    angle_b = math.radians(25.0); axis_b = np.array([math.sin(angle_b), -math.cos(angle_b), 0.0])
    shoulder_b = np.array([0.13, 0.85, 0.0])
    arm_local = tube(lambda y, t: 0.03 + 0 * t, np.linspace(0.0, 0.45, 46), 48, closed=True)
    u = np.array([0.0, 0.0, 1.0]); v = np.cross(axis_b, u)   # 与 slice_fit._limb_frame 同一套 (u, v)

    def place(points, origin, axis, u, v):   # 局部 (x→u, y→axis, z→v)：右手系 (u, axis, -v)…按 v = a×u 取 z→-v 保持朝向
        return origin + points[:, [1]] * axis + points[:, [0]] * u - points[:, [2]] * v

    arm = (place(arm_local[0], shoulder_b, axis_b, u, v), arm_local[1], arm_local[2])
    positions, faces, _ = merge(torso, arm)
    arm_left = np.zeros(len(positions)); arm_left[len(torso[0]):] = 1.0
    limbs = {"armL": {"shoulderMu": shoulder_b.tolist(), "elbowMu": (shoulder_b + 0.25 * axis_b).tolist(),
                      "wristMu": (shoulder_b + 0.45 * axis_b).tolist()}}
    body = body_model(positions, faces, arm_left=arm_left, limbs=limbs)
    # 衣物：躯干管 + 斜 30° 的袖管（更粗、带厚度），袖轴标注取其设计臂关节
    angle_g = math.radians(30.0); axis_g = np.array([math.sin(angle_g), -math.cos(angle_g), 0.0])
    shoulder_g = np.array([0.13, 0.85, 0.0])
    u_g = np.array([0.0, 0.0, 1.0]); v_g = np.cross(axis_g, u_g)
    sleeve_inner = tube(lambda y, t: 0.042 + 0.004 * np.cos(t) + 0 * y, np.linspace(0.08, 0.40, 33), 48, inward=True)
    sleeve_outer = tube(lambda y, t: 0.046 + 0.004 * np.cos(t) + 0 * y, np.linspace(0.08, 0.40, 33), 48)
    sleeve = merge(sleeve_inner, sleeve_outer)
    sleeve = (place(sleeve[0], shoulder_g, axis_g, u_g, v_g), sleeve[1], sleeve[2])
    body_tube = shell_garment(ellipse(0.12, 0.09), thickness=3 * MM, ys=np.linspace(0.45, 0.80, 36))
    g_pos, g_faces, g_uv = merge(body_tube[:3], sleeve)
    sleeves = {"L": {"axis": {"shoulderMu": shoulder_g.tolist(), "elbowMu": (shoulder_g + 0.25 * axis_g).tolist(),
                              "wristMu": (shoulder_g + 0.45 * axis_g).tolist()}}}
    garment = garment_model(g_pos, g_faces, g_uv, elasticity=1.0, design=BODY_LEVELS, sleeves=sleeves)   # 同体设计
    cuff = garment.landmarks["sleeves"]["L"]["cuff"]      # 袖口量得沿弦 0.40：肘 0.25 与腕 0.45 之间按比例 0.75
    assert abs(cuff["anchor"]["tMu"] - 0.40) < 1e-9 and cuff["target"]["between"] == ["elbow", "wrist"]
    result = sf.slice_fit(body, garment, params=pure_params())
    start = len(body_tube[0]); inner = slice(start, start + len(sleeve_inner[0]))
    assert result.weights["armL"][inner].min() == 1.0, "袖管应整块归左臂部件"
    gap = body.signed_distance(result.positions[inner])
    mid = (sleeve_inner[0][:, 1] > 0.10) & (sleeve_inner[0][:, 1] < 0.38)
    assert gap.min() > GAP - 0.1 * MM and np.quantile(gap[mid], 0.95) < GAP + 0.4 * MM, \
        f"袖内层间隙 min {gap.min() / MM:.3f} / p95 {np.quantile(gap[mid], 0.95) / MM:.3f} mm"
    fitted = result.positions[inner]
    direction = np.linalg.svd(fitted - fitted.mean(axis=0))[2][0]
    assert math.degrees(math.acos(abs(float(direction @ axis_b)))) < 0.5, "袖轴没转到素体臂轴"


def test_edge_anchors_and_targets() -> None:
    """衣缘锚点从几何量：后中扇区上 / 下包络中位；内折贴边、前 V 领、腰带垂尾都不当衣缘；目标就近（≤ 10 mm）或按比例；
    贴到另一体型后，同一批衣缘点落在目标上（实际落点残差）、锚点映射残差 ~0。"""
    shape = ellipse(0.12, 0.09)
    top = lambda t: 0.80 - 0.06 * np.clip(np.cos(t - math.pi / 2), 0, None) ** 4 + 0.003 * np.sign(np.sin(9 * t))  # noqa: E731
    main = tube(shape, np.linspace(0.30, 0.80, 51), 72, top_fn=top)
    facing = tube(lambda y, t: shape(y, t) - 2 * MM, np.linspace(0.30, 0.36, 7), 72, inward=True)   # 下摆内折贴边
    angles = np.linspace(math.radians(80), math.radians(100), 5); ys = np.linspace(0.20, 0.40, 11)    # 前中垂带
    strap_pos = np.array([(0.10 * math.cos(a), y, 0.10 * math.sin(a)) for y in ys for a in angles])
    strap_faces = [(k * 5 + j, k * 5 + j + 1, (k + 1) * 5 + j) for k in range(10) for j in range(4)]
    strap_faces += [(k * 5 + j + 1, (k + 1) * 5 + j + 1, (k + 1) * 5 + j) for k in range(10) for j in range(4)]
    strap = (strap_pos, np.asarray(strap_faces), np.zeros((len(strap_pos), 2)))
    positions, faces, uvs = merge(main, facing, strap)
    garment = garment_model(positions, faces, uvs, elasticity=0.9, design={"neckBase": 0.805, "waist": 0.55, "pelvis": 0.30})
    collar, hem = garment.landmarks["collar"], garment.landmarks["hem"]
    assert abs(collar["anchor"]["yMu"] - 0.80) <= 3 * MM + 1e-9 and abs(hem["anchor"]["yMu"] - 0.30) < 1e-9, (collar, hem)
    assert positions[:, 1].min() < 0.21 and collar["target"] == {"level": "neckBase"} and hem["target"] == {"level": "pelvis"}
    target = sf.choose_target(0.80, {"shoulder": 0.75, "neckBase": 0.83}, 10 * MM, "level")   # 都 > 10 mm：按比例
    assert target["between"] == ["shoulder", "neckBase"] and abs(target["t"] - 0.625) < 1e-12
    assert abs(sf.resolve_target(target, {"shoulder": 0.85, "neckBase": 0.95}, "level") - 0.9125) < 1e-12
    result = sf.slice_fit(cylinder_body(), garment, params=pure_params())
    check = result.diagnostics["verticalCheck"]; anchors = result.diagnostics["anchors"]
    assert check["mappingResidualMaxMm"] < 1e-6 and check["landingResidualMaxMm"] < 0.05, check   # 合成件 1 mm = 0.001 mu
    assert abs(anchors["hem"]["targetYMu"] - 0.40) < 1e-12 and abs(anchors["collar"]["targetYMu"] - 0.90) < 1e-12
    stretch = result.diagnostics["verticalStretch"]
    assert abs(stretch["spanRatio"] - 0.50 / (collar["anchor"]["yMu"] - 0.30)) < 1e-9


# ---------------------------------------------------------------------------
# 文件层：拓扑 / UV 不变、CLI、真实标注与测试件的一致性
# ---------------------------------------------------------------------------

def test_cli_topology_uv_unchanged() -> None:
    body = cylinder_body()
    positions, faces, uvs, _ = wavy_garment()
    from io import BytesIO
    from PIL import Image
    stream = BytesIO(); Image.new("RGB", (8, 8), (120, 30, 40)).save(stream, format="PNG")
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        write_static(temp / "body.glb", body.positions, body.faces, None)
        write_static(temp / "garment.glb", positions, faces, uvs, ImageData(stream.getvalue(), "image/png", "t"))
        (temp / "body.json").write_text(json.dumps({"mPerMu": 1.0, "levels": {n: {"yMu": y} for n, y in BODY_LEVELS.items()},
                                                    "limbs": {}}), encoding="utf-8")
        garment_landmarks = garment_model(positions, faces, uvs, elasticity=0.9).landmarks
        (temp / "garment.json").write_text(json.dumps(garment_landmarks), encoding="utf-8")
        code = sf.main(["fit", "--body", str(temp / "body.glb"), "--body-landmarks", str(temp / "body.json"),
                        "--garment", str(temp / "garment.glb"), "--garment-landmarks", str(temp / "garment.json"),
                        "--out", str(temp / "out"), "--id", "g", "--thickness-max-mm", "8"])
        assert code == 0
        source = load_world_mesh(load_glb(temp / "garment.glb")); fitted = load_world_mesh(load_glb(temp / "out/g.slice_fit.glb"))
        assert np.array_equal(source.indices, fitted.indices), "三角索引变了"
        assert np.array_equal(source.uvs, fitted.uvs), "UV 变了"
        glb = load_glb(temp / "out/g.slice_fit.glb")
        assert glb.image(0).data == stream.getvalue(), "贴图字节变了"
        report = json.loads((temp / "out/g.slice_fit.json").read_text(encoding="utf-8"))
        assert report["schema"] == sf.FIT_SCHEMA and report["clearance"]["final"]["insideCount"] == 0
        assert report["topology"]["triangles"] == len(faces)
        assert sf.main(["fit", "--body", str(temp / "missing.glb"), "--body-landmarks", str(temp / "body.json"),
                        "--garment", str(temp / "garment.glb"), "--garment-landmarks", str(temp / "garment.json"),
                        "--out", str(temp / "x")]) == 2


def test_template_landmarks_reproducible() -> None:
    """落盘的模板标注 = 脚本复算（未手改），且标注面自下而上单调。"""
    for template in ("tpl_f_medium", "tpl_f_tall", "tpl_f_small"):
        stored = json.loads((TEMPLATES / template / "slice_landmarks.json").read_text(encoding="utf-8"))
        skeleton = json.loads((TEMPLATES / template / "skeleton.json").read_text(encoding="utf-8"))
        body = sf.load_body(TEMPLATES / template / "body.glb", {}, float(skeleton["mPerMu"]))
        derived = sf.derive_body_landmarks(body, skeleton, template=template)
        for name, record in derived["levels"].items():
            assert abs(record["yMu"] - stored["levels"][name]["yMu"]) < 1e-6, (template, name)
        assert _close(json.loads(json.dumps(derived["limbs"])), stored["limbs"]), f"{template} 臂 / 腿点与复算不符"
        arms = [np.asarray(stored["limbs"][f"arm{side}"]["wristMu"]) - np.asarray(stored["limbs"][f"arm{side}"]["shoulderMu"])
                for side in ("L", "R")]   # 腕取网格最细处：左右臂弦长差 < 5 mm（骨架 Hand 关节差 46 mm）
        assert abs(np.linalg.norm(arms[0]) - np.linalg.norm(arms[1])) * stored["mPerMu"] * 1000 < 5.0, template
        heights = [stored["levels"][name]["yMu"] for name in sf.LEVEL_ORDER]
        assert all(b >= a for a, b in zip(heights, heights[1:])), f"{template} 标注面不单调"
        assert stored["source"]["bodySha256"] == hashlib.sha256((TEMPLATES / template / "body.glb").read_bytes()).hexdigest()


FIXTURES = {"banjia": ("navel", 0.0), "mingguang": ("belowHip", 0.2), "suozi": ("aboveKnee", 0.3)}


def _close(a, b, tol: float = 1e-6) -> bool:
    """落盘 JSON（6 位小数）与复算结果逐项比：浮点差 ≤ tol，其余相等。"""
    if isinstance(a, dict):
        return isinstance(b, dict) and a.keys() == b.keys() and all(_close(a[k], b[k], tol) for k in a)
    if isinstance(a, (list, tuple)):
        return isinstance(b, (list, tuple)) and len(a) == len(b) and all(_close(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, float) or isinstance(b, float):
        return b is not None and a is not None and abs(float(a) - float(b)) <= tol
    return a == b


def test_armor_fixture_deterministic() -> None:
    """三件测试甲都由脚本确定性生成：重生成的 GLB 与入库件逐字节一致；锚点（从生成几何量出）、目标与落盘一致，
    目标正是各自设计的上 / 下沿面。"""
    landmarks = json.loads((TEMPLATES / "tpl_f_medium/slice_landmarks.json").read_text(encoding="utf-8"))
    body = sf.load_body(TEMPLATES / "tpl_f_medium/body.glb", landmarks, landmarks["mPerMu"])
    for kind, (hem_level, elasticity) in FIXTURES.items():
        with tempfile.TemporaryDirectory() as temp:
            record = sf.make_armor_fixture(kind, body, Path(temp))
            fresh = (Path(temp) / f"_fixture_armor_{kind}.glb").read_bytes()
        stored_dir = GARMENTS / f"_fixture_armor_{kind}"
        assert fresh == (stored_dir / f"_fixture_armor_{kind}.glb").read_bytes(), f"{kind} 测试件与入库件不一致"
        stored = json.loads((stored_dir / "slice_landmarks.json").read_text(encoding="utf-8"))
        assert stored["elasticity"] == elasticity and stored["rigid"] is (elasticity <= 0.0)
        assert stored["collar"]["target"] == {"level": "neckBase"} and stored["hem"]["target"] == {"level": hem_level}
        for key in ("anchorRule", "collar", "hem", "sleeves", "levels"):
            assert _close(json.loads(json.dumps(record[key])), stored[key]), (kind, key)


def test_garment_landmarks_reproducible() -> None:
    """劲装标注 = 脚本复算：锚点从原始抽取件几何量出（后中扇区 / 袖口远端），目标为设计体 tpl_f_medium 上最近的标注面；
    衣缘不是全件极值（腰带垂尾低于下摆 7 cm、侧颈峰高于后领 2 cm）。"""
    stored = json.loads((JINZHUANG / "slice_landmarks.json").read_text(encoding="utf-8"))
    design = json.loads((TEMPLATES / "tpl_f_medium/slice_landmarks.json").read_text(encoding="utf-8"))
    raw = JINZHUANG / "extract_run/eq_jinzhuang_raw_skinned.glb"
    fresh = sf.derive_garment_landmarks(raw, design, garment_id="eq_jinzhuang", garment_class="cloth", elasticity=1.0,
                                        fold_mm=75.0, expect={"collar": "neckBase", "hem": "pelvis"})
    for key in ("anchorRule", "collar", "hem", "sleeves", "levels", "alignLevels"):
        assert _close(json.loads(json.dumps(fresh[key])), stored[key]), key
    assert stored["source"]["sha256"] == hashlib.sha256(raw.read_bytes()).hexdigest()
    for side in ("L", "R"):   # 袖口在腕（前臂最细处）外 15 mm 左右：差 > 10 mm，取腕—指根之间按比例
        target = stored["sleeves"][side]["cuff"]["target"]
        assert target["between"] == ["wrist", "hand"] and 0.0 < target["t"] < 0.3, (side, target)
    mesh = load_world_mesh(load_glb(raw))
    assert stored["hem"]["anchor"]["yMu"] - mesh.positions[:, 1].min() > 0.04
    assert mesh.positions[:, 1].max() - stored["collar"]["anchor"]["yMu"] > 0.01


def test_rejects_multi_primitive() -> None:
    """只接受单 mesh / 单 primitive / 单材质衣物；多 primitive 或多 mesh 节点明确报错，CLI 退出码 2。"""
    positions, faces, uvs, _ = wavy_garment()
    half = len(faces) // 2
    with tempfile.TemporaryDirectory() as temp:
        temp = Path(temp)
        builder = GLBBuilder(); first = builder.add_material(unlit=True, name="a"); second = builder.add_material(unlit=True, name="b")
        mesh = Mesh(positions.astype(np.float32), faces.reshape(-1).astype(np.uint32), None, uvs.astype(np.float32),
                    material_indices=np.asarray([0, 1]),
                    primitives=[PrimitiveRange(0, len(positions), 0, half * 3, 0),
                                PrimitiveRange(0, len(positions), half * 3, (len(faces) - half) * 3, 1)], name="two")
        node = builder.add_node(name="two", mesh=builder.add_mesh(mesh, material_map=[first, second]))
        builder.add_scene([node]); builder.write(temp / "two_primitives.glb")
        builder = GLBBuilder(); material = builder.add_material(unlit=True, name="m")
        nodes = []
        for name in ("left", "right"):
            part = Mesh(positions.astype(np.float32), faces.reshape(-1).astype(np.uint32), None, uvs.astype(np.float32),
                        material_indices=np.asarray([0]), primitives=[PrimitiveRange(0, len(positions), 0, faces.size, 0)],
                        name=name)
            nodes.append(builder.add_node(name=name, mesh=builder.add_mesh(part, material_map=[material])))
        builder.add_scene(nodes); builder.write(temp / "two_nodes.glb")
        landmarks = garment_model(positions, faces, uvs, elasticity=1.0).landmarks
        (temp / "garment.json").write_text(json.dumps(landmarks), encoding="utf-8")
        for name in ("two_primitives.glb", "two_nodes.glb"):
            try:
                sf.load_garment(temp / name, landmarks)
            except sf.SliceFitError as error:
                assert "单 primitive" in str(error), error
            else:
                raise AssertionError(f"{name} 应被拒绝")
        body = cylinder_body(); write_static(temp / "body.glb", body.positions, body.faces, None)
        (temp / "body.json").write_text(json.dumps({"mPerMu": 1.0, "levels": {n: {"yMu": y} for n, y in BODY_LEVELS.items()},
                                                    "limbs": {}}), encoding="utf-8")
        code = sf.main(["fit", "--body", str(temp / "body.glb"), "--body-landmarks", str(temp / "body.json"),
                        "--garment", str(temp / "two_primitives.glb"), "--garment-landmarks", str(temp / "garment.json"),
                        "--out", str(temp / "out"), "--no-glb"])
        assert code == 2


JINZHUANG = GARMENTS / "eq_jinzhuang"
REAL_TEMPLATES = ("tpl_f_medium", "tpl_f_tall", "tpl_f_small")


def _report_check(report: dict, name: str) -> dict:
    found = [check for check in report["checks"] if check["name"] == name]
    assert len(found) == 1, f"report 缺 {name}"
    return found[0]


def test_real_jinzhuang_chain_gates() -> None:
    """真实劲装三体型：切片后穿入 0、最小间隙 ≥ 1 mm、拓扑 / UV 不变；P2 链尾 validate 翻面 0、边长 ≥ 99%、bind 穿透 0；
    诊断里的链尾 GLB / fit / report 路径与 SHA 和落盘文件一致（数字全部从落盘数据读出，阈值是门禁本身）。"""
    raw = load_world_mesh(load_glb(JINZHUANG / "extract_run/eq_jinzhuang_raw_skinned.glb"))
    for template in REAL_TEMPLATES:
        diagnostics = json.loads((JINZHUANG / f"shots/slice_fit.{template}.json").read_text(encoding="utf-8"))
        final = diagnostics["clearance"]["final"]
        assert final["insideCount"] == 0 and final["minMm"] >= 1.0 - 1e-6, (template, final)
        topology = diagnostics["topology"]
        assert topology["vertices"] == len(raw.positions) and topology["triangles"] == len(raw.indices) // 3
        assert topology["uvPreserved"] and topology["indicesPreserved"]
        anchors = diagnostics["anchors"]; check = diagnostics["verticalCheck"]
        assert anchors["collar"]["target"] == {"level": "neckBase"} and anchors["hem"]["target"] == {"level": "pelvis"}
        assert check["mappingResidualMaxMm"] < 1e-6, (template, check["mappingResidualMaxMm"])
        for key in ("collar", "hem", "cuffL", "cuffR"):   # 实际衣缘落点：同一批衣缘点变换后离目标 ≤ 1 mm
            assert anchors[key]["landingResidualMm"] <= 1.0, (template, key, anchors[key]["landingResidualMm"])
            assert abs(anchors[key]["storedMinusMeasuredMm"]) < 1e-3, (template, key)
        assert "output" not in diagnostics and diagnostics["reproduce"]["command"].startswith("python3 ")
        chain = diagnostics["chain"]
        for key in ("glb", "fit", "report"):
            path = ROOT / chain[key]["file"]
            assert path.is_file(), path
            assert hashlib.sha256(path.read_bytes()).hexdigest() == chain[key]["sha256"], f"{template} {key} SHA 不符"
        assert chain["intermediate"]["committed"] is False
        report = json.loads((ROOT / chain["report"]["file"]).read_text(encoding="utf-8"))
        flipped = _report_check(report, "geometry.flippedTriangles")
        stretch = _report_check(report, "geometry.edgeRatioInRange")
        bind = _report_check(report, "penetration.bindVertices")
        assert flipped["pass"] and flipped["value"] == 0, (template, flipped)
        assert stretch["pass"] and stretch["value"] >= 0.99, (template, stretch)
        assert bind["pass"] and bind["value"] == 0, (template, bind)
        assert chain["gates"]["pass"] is True
        glb = load_glb(ROOT / chain["glb"]["file"])
        assert len(glb.json["meshes"]) == 1 and len(glb.json["meshes"][0]["primitives"]) == 1
        # 链尾 UV 逐顶点回指原始抽取件（pack 压紧映射），UV 一路不变
        primitive = glb.json["meshes"][0]["primitives"][0]
        rows = np.asarray(glb.accessor(int(primitive["extras"]["tianshuSourceVertexAccessor"])), dtype=np.int64).reshape(-1)
        final_mesh = load_world_mesh(glb, skinned_only=True)
        assert np.array_equal(final_mesh.uvs, raw.uvs[rows]), f"{template} 链尾 UV 与原始件不符"


def test_real_jinzhuang_medium_rerun_matches() -> None:
    """对 medium 复跑一次切片，计数与落盘诊断一致（确定性；浮点允许 1e-6 相对差）。"""
    stored = json.loads((JINZHUANG / "shots/slice_fit.tpl_f_medium.json").read_text(encoding="utf-8"))
    landmarks = json.loads((TEMPLATES / "tpl_f_medium/slice_landmarks.json").read_text(encoding="utf-8"))
    body = sf.load_body(TEMPLATES / "tpl_f_medium/body.glb", landmarks, landmarks["mPerMu"])
    garment = sf.load_garment(JINZHUANG / "extract_run/eq_jinzhuang_raw_skinned.glb",
                              json.loads((JINZHUANG / "slice_landmarks.json").read_text(encoding="utf-8")))
    result = sf.slice_fit(body, garment, params=sf.SliceParams())
    fresh = result.diagnostics
    for stage in ("aligned", "sliced", "final"):
        for key in ("insideCount", "belowClearanceCount"):
            assert fresh["clearance"][stage][key] == stored["clearance"][stage][key], (stage, key)
        assert math.isclose(fresh["clearance"][stage]["minMm"], stored["clearance"][stage]["minMm"], rel_tol=1e-6, abs_tol=1e-6)
    distortion = sf.distortion_stats(garment.positions, result.positions, garment.faces, garment.weld)
    assert distortion["flippedTriangles"] == stored["distortion"]["final"]["flippedTriangles"]
    assert math.isclose(distortion["stretchWithinRatio"], stored["distortion"]["final"]["stretchWithinRatio"], rel_tol=1e-6)
    assert [row["badAfter"] for row in fresh["relax"]] == [row["badAfter"] for row in stored["relax"]]
    for key, row in fresh["anchors"].items():
        assert math.isclose(row["landingResidualMm"], stored["anchors"][key]["landingResidualMm"], rel_tol=1e-6, abs_tol=1e-6), key


def main() -> int:
    tests = [test_axis_map_exact_monotone, test_rays_hull_envelopes, test_elastic_r1_inner_ring_one_mm,
             test_inelastic_r0_similarity_just_outside, test_blend_and_heights, test_layers_keep_distance,
             test_skirt_spans_between_legs, test_sleeve_follows_arm_axis, test_edge_anchors_and_targets,
             test_cli_topology_uv_unchanged,
             test_rejects_multi_primitive, test_template_landmarks_reproducible, test_garment_landmarks_reproducible,
             test_armor_fixture_deterministic,
             test_real_jinzhuang_chain_gates, test_real_jinzhuang_medium_rerun_matches]
    failed = 0
    for test in tests:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:  # noqa: BLE001 - 独立测试入口要继续报告全部失败
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    print(f"{len(tests) - failed}/{len(tests)} tests passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
