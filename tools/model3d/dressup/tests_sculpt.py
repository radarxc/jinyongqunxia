#!/usr/bin/env python3
"""sculpt_neck（颈肩平滑雕塑）的回归：合成"躯干—颈—头"旋转体，只写临时目录。"""
from __future__ import annotations

from hashlib import sha256
import json
import math
from pathlib import Path
import sys
import tempfile
import traceback

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import lbs  # noqa: E402
from cut_head import weld_vertices  # noqa: E402
from glb_io import GLBBuilder, Mesh, load_glb  # noqa: E402
from sculpt_neck import MAX_DIHEDRAL_CHANGE_DEG, main as sculpt_main, sculpt  # noqa: E402

NECK_Y, HEAD_Y, CHIN_Y = 0.82, 0.92, 0.925
SEGMENTS = 48


def _radius(y: float) -> float:
    """躯干 0.09 → 肩坡 → 颈 0.03 → 下颌外扩 → 头（球冠）。"""
    if y < 0.78: return 0.09
    if y < 0.82: return 0.09 - (0.06 * (y - 0.78) / 0.04)
    if y < 0.925: return 0.03
    if y < 0.95: return 0.03 + 0.04 * (y - 0.925) / 0.025
    return max(0.07 * math.sqrt(max(1 - ((y - 0.99) / 0.10) ** 2, 0.0)), 0.004)


def _body(path: Path) -> None:
    heights = np.round(np.arange(0.50, 1.085, 0.005), 6)
    positions, uvs, faces = [], [], []
    for row, y in enumerate(heights):
        r = _radius(float(y))
        for i in range(SEGMENTS + 1):   # 末列重复首列：UV 缝（位置逐字节相同、UV 不同，与 Tripo 导出一致）
            angle = 2 * math.pi * (i % SEGMENTS) / SEGMENTS
            positions.append([r * math.sin(angle), y, r * math.cos(angle)]); uvs.append([i / SEGMENTS, 1 - (y - 0.5) / 0.6])
    columns = SEGMENTS + 1
    for row in range(len(heights) - 1):
        for i in range(SEGMENTS):
            a, b = row * columns + i, row * columns + i + 1
            c, d = a + columns, b + columns
            faces += [(a, b, c), (b, d, c)]          # 外法向（+Y 向上为逆时针）
    positions = np.asarray(positions, np.float32); uvs = np.asarray(uvs, np.float32); faces = np.asarray(faces, np.int64)
    head = np.clip((positions[:, 1] - 0.90) / 0.04, 0, 1); head = head * head * (3 - 2 * head)
    joints = np.zeros((len(positions), 4), np.uint16); joints[:, 1] = 1
    weights = np.zeros((len(positions), 4), np.float32); weights[:, 0] = 1 - head; weights[:, 1] = head
    normals = positions.copy(); normals[:, 1] = 0
    normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-9)
    mesh = Mesh(positions, faces.reshape(-1).astype(np.uint32), normals, uvs, joints, weights, None,
                np.zeros(len(faces), np.int32), None, "body")
    builder = GLBBuilder()
    neck = builder.add_node(name="mixamorig:Neck", translation=[0, NECK_Y, 0])
    head_node = builder.add_node(name="mixamorig:Head", translation=[0, HEAD_Y - NECK_Y, 0])
    builder.document["nodes"][neck]["children"] = [head_node]
    ibm = np.array([np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, NECK_Y], [0, 0, 1, 0], [0, 0, 0, 1]])),
                    np.linalg.inv(np.array([[1, 0, 0, 0], [0, 1, 0, HEAD_Y], [0, 0, 1, 0], [0, 0, 0, 1]]))], np.float32)
    skin = builder.add_skin([neck, head_node], builder.add_accessor(ibm, type_name="MAT4"))
    mesh_id = builder.add_mesh(mesh)
    mesh_node = builder.add_node(name="body", mesh=mesh_id, skin=skin); builder.add_scene([neck, mesh_node])
    builder.write(path)
    (path.parent / "skeleton.json").write_text(json.dumps({"mPerMu": 1.0}), encoding="utf-8")


def _world_y(glb, name: str) -> float:
    skin = glb.skin()
    for node in skin.joints:
        if str(glb.json["nodes"][node].get("name", "")).endswith(name): return float(glb.world_matrix(node)[1, 3])
    raise AssertionError(name)


def test_lengthen_and_slim_smoothly() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); body = root / "body.glb"; _body(body); out = root / "out.glb"
        report = sculpt(body, out, lengthen_mm=10, k_front=1.0, k_side=0.8, k_back=0.8, chin_mu=CHIN_Y)
        assert report["gate"]["pass"] and report["flippedFaces"] == 0, report["gate"]
        assert report["dihedralChangeDeg"]["max"] <= 12.0, report["dihedralChangeDeg"]
        # 二面角门量的是整个焊接网格的全部内部边（含 ROI 边界两侧与 ROI 外），不是 ROI 内的子网格
        assert report["dihedralChangeDeg"]["edges"] == _interior_edges(body) and report["dihedralChangeDeg"]["scope"] == "weldedMesh"
        before, after = load_glb(body), load_glb(out); m0, m1 = before.mesh(), after.mesh()
        # 报告里的锚点实测：Head 关节世界位移 (0, 10, 0) mm、Neck 不动、写出后 rest = bind
        np.testing.assert_allclose(report["output"]["headJointMovedMm"], [0, 10, 0], atol=1e-6)
        np.testing.assert_allclose(report["output"]["neckJointMovedMm"], [0, 0, 0], atol=1e-9)
        assert report["output"]["restBindMaxDiffMu"] < 1e-5 and report["output"]["sha256"] == sha256(out.read_bytes()).hexdigest()
        # Head 关节上移 10 mm（mPerMu = 1 → 0.010），Neck 不动
        assert abs(_world_y(after, "Head") - _world_y(before, "Head") - 0.010) < 1e-6
        assert abs(_world_y(after, "Neck") - _world_y(before, "Neck")) < 1e-9
        # 头部刚性上移、躯干不动
        top = m0.positions[:, 1] > 1.0
        np.testing.assert_allclose(m1.positions[top] - m0.positions[top], np.tile([0, 0.010, 0], (int(top.sum()), 1)), atol=1e-6)
        low = m0.positions[:, 1] < 0.70
        np.testing.assert_allclose(m1.positions[low], m0.positions[low], atol=1e-9)
        # 颈中段侧 / 后收细接近 0.8、前不动（取约束环中心高度附近的点）
        root_y = report["measured"]["neckRootMu"]
        y_mid = root_y + 0.49 * (CHIN_Y + 0.022 - root_y)          # 侧向约束环（颈根→头界 40%–58%）中部
        ring = np.abs(m0.positions[:, 1] - y_mid) < 0.003
        cx, cz = report["measured"]["neckCenterMu"]
        r0 = np.hypot(m0.positions[ring, 0] - cx, m0.positions[ring, 2] - cz)
        r1 = np.hypot(m1.positions[ring, 0] - cx, m1.positions[ring, 2] - cz)
        side = np.abs(m0.positions[ring, 0] - cx) > 0.9 * r0
        assert np.all(r1[side] / r0[side] < 0.9) and np.all(r1[side] / r0[side] > 0.75), (r1[side] / r0[side])
        # 拓扑 / UV / 权重不变，rest = bind 保持
        assert np.array_equal(m0.indices, m1.indices) and np.array_equal(m0.uvs, m1.uvs)
        assert np.array_equal(m0.joints, m1.joints) and np.array_equal(m0.weights, m1.weights)
        skin = after.skin(); worlds = np.asarray([after.world_matrix(n) for n in skin.joints])
        rebound = lbs(m1.positions, m1.joints, m1.weights, worlds, skin.inverse_bind_matrices)
        assert np.abs(rebound - m1.positions).max() < 1e-5
        # UV 缝两侧（同位置的重复点）位移相同，没被撕开
        seam = np.flatnonzero(np.isclose(m0.uvs[:, 0], 1.0)); twin = seam - SEGMENTS
        np.testing.assert_allclose(m1.positions[seam], m1.positions[twin], atol=1e-7)
        # 法线仍为单位向量
        np.testing.assert_allclose(np.linalg.norm(m1.normals, axis=1), 1, atol=1e-4)


def _interior_edges(body: Path) -> int:
    mesh = load_glb(body).mesh()
    _, faces, _ = weld_vertices(mesh.positions.astype(np.float64), mesh.indices.reshape(-1, 3).astype(np.int64))
    edges = np.sort(np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]]), axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    return int(np.count_nonzero(counts == 2))


def test_gate_catches_crease_at_roi_boundary() -> None:
    """斜方肌下压环（ρ 1.5–2.6，即半径 45–78 mm）外侧紧贴收窄的 ROI 边界（半径 80 mm）：下压 4 mm 在边界一行内被夹回 0，
    折角落在 ROI 边界上。只量 ROI 内部子网格时这条边没有两侧面、量不到（旧口径约 3°，会放行）；全网格门必须拦下，
    退出码 2、不写文件。默认 ROI（半径 250 mm）时同样的下压能平滑过渡、通过。"""
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); body = root / "body.glb"; _body(body); out = root / "out.glb"
        relaxed = sculpt(body, None, trap_mm=4, chin_mu=CHIN_Y)
        assert relaxed["gate"]["pass"], relaxed["gate"]
        tight = sculpt(body, out, trap_mm=4, roi_mm=(90, 140, 80), chin_mu=CHIN_Y)
        dihedral = tight["dihedralChangeDeg"]
        assert not tight["gate"]["pass"] and not out.exists(), tight["gate"]
        assert dihedral["max"] > MAX_DIHEDRAL_CHANGE_DEG >= dihedral["roiInteriorMax"], dihedral
        cx, cz = tight["measured"]["neckCenterMu"]; worst = dihedral["worstAtMu"]
        assert 70e-3 <= math.hypot(worst[0] - cx, worst[2] - cz) <= 80e-3, worst            # 折在下压环外缘 / ROI 边界
        code = sculpt_main(["--body", str(body), "--out", str(out), "--trap-mm", "4", "--roi-mm", "90", "140", "80",
                            "--chin-mu", str(CHIN_Y)])
        assert code == 2 and not out.exists()


def test_gate_blocks_extreme_and_writes_nothing() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); body = root / "body.glb"; _body(body); out = root / "out.glb"
        report = sculpt(body, out, lengthen_mm=120, k_side=0.2, k_back=0.2, chin_mu=CHIN_Y)
        assert not report["gate"]["pass"] and report["gate"]["problems"], report["gate"]
        assert not out.exists()
        code = sculpt_main(["--body", str(body), "--out", str(out), "--lengthen-mm", "120", "--k-side", "0.2",
                            "--k-back", "0.2", "--chin-mu", str(CHIN_Y)])
        assert code == 2 and not out.exists()


def test_check_only_reports_without_writing() -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary); body = root / "body.glb"; _body(body)
        before = body.read_bytes()
        code = sculpt_main(["--body", str(body), "--check-only", "--lengthen-mm", "8", "--k-side", "0.9", "--chin-mu", str(CHIN_Y)])
        assert code == 0 and body.read_bytes() == before
        assert sorted(p.name for p in root.iterdir()) == ["body.glb", "skeleton.json"]


TESTS = [test_lengthen_and_slim_smoothly, test_gate_catches_crease_at_roi_boundary, test_gate_blocks_extreme_and_writes_nothing,
         test_check_only_reports_without_writing]


if __name__ == "__main__":
    failed = 0
    for test in TESTS:
        try:
            test(); print(f"PASS {test.__name__}")
        except Exception:
            failed += 1; print(f"FAIL {test.__name__}"); traceback.print_exc()
    if failed: sys.exit(1)
    print("tests_sculpt.py PASS")
