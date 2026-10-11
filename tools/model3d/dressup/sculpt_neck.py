#!/usr/bin/env python3
"""换装模板颈肩平滑雕塑（T4b，作者 2026-10-11「男女脖子都太粗……算法要平滑，否则有突变」）。

只改 bind 姿势顶点位置与法线、Head 关节位置与 IBM；拓扑、UV、蒙皮权重、joints 顺序、动画轨一律不变（rest = bind 保持）。
位移场是一个整体光滑场：在少数集合上给约束，其余点解带约束的双调和方程（`cut_head.biharmonic_displacement`，
余切拉普拉斯 L M⁻¹ L），UV 缝处的重复点先按位置焊接，解完再映回——不逐点套分段衰减，所以没有折线 / 鼓包。

约束集（模板 bind 坐标，+Y 上、+Z 前；毫米参数按 skeleton.json 的 mPerMu 换算）：
- 头部 H：高于头界 hb(θ) + 10 mm 的点整体上移 L（颈加长）；Head 关节同步上移 L（子骨跟随），IBM 重算。
  hb(θ) = 下巴 + 前 / 侧 / 后三个高度按 cos²/sin² 角度权重混合（θ 自 +Z 量起）。
- 躯干 T：颈根下 60 mm 以下、或颈截面椭圆归一半径 ρ > rho_out 的点位移 0。
- 颈中段 C：ρ < 1.25、高度在颈根→头界的 40%–58% 之间：径向按角度收细（前 kf / 侧 ks / 后 kb）+ 竖直 L·t（与颈加长一致）。
- 颈根 B（可选）：ρ < base_rho、颈根上下 base_lo..base_hi（按颈长比例）：侧 / 后按 base_ks / base_kb 收细。
- 斜方肌 P（可选，trap_mm > 0）：ρ ∈ [trap_rho_lo, trap_rho_hi]、颈根下 35 mm 到上 5 mm 的上表面点下移 d（前侧减半）。
- ROI（颈根下 90 mm 到下巴上 140 mm、水平 250 mm 内）其余点自由；ROI 边界与 ROI 外按所在区域取值（下巴以上头部 = L，其余 0）。
法线：按焊接网格变形前后面积加权几何法线的最小旋转去转原法线（保留原着色风格）。

门（任一不过退出 2、不写文件；三项都在整个焊接网格上算，含 ROI 边界两侧与 ROI 外）：翻面 0；
相邻面二面角变化最大 ≤ 12°；边长比 ∈ [0.5, 2]。
用法：sculpt_neck.py --body <glb> --out <glb> [--lengthen-mm L] [--k-front kf --k-side ks --k-back kb] [--trap-mm d]
      [--roi-mm 90 140 250] [--check-only] [--json]
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys
from typing import Any, Sequence

import numpy as np

try:
    from . import derive_template as D
    from .common import lbs
    from .cut_head import biharmonic_displacement, weld_vertices
    from .glb_io import GLB, load_glb
except ImportError:
    import derive_template as D
    from common import lbs
    from cut_head import biharmonic_displacement, weld_vertices
    from glb_io import GLB, load_glb

MAX_DIHEDRAL_CHANGE_DEG = 12.0
EDGE_RATIO_RANGE = (0.5, 2.0)
CORE_T_RANGE = (0.40, 0.58)          # 颈中段收细环：颈根→头界的比例区间
HEAD_MARGIN_MM = 10.0                # 头部集在头界以上的余量（留给过渡）
TORSO_BELOW_MM = 60.0                # 颈根以下这一距离之外固定
ROI_BELOW_MM, ROI_ABOVE_MM, ROI_RADIUS_MM = 90.0, 140.0, 250.0


REPO_ROOT = Path(__file__).resolve().parents[3]


def _portable(path: Path) -> str:
    """仓库内的文件记仓库相对路径（报告不带本机目录）；仓库外的只记文件名。"""
    resolved = Path(path).resolve()
    return resolved.relative_to(REPO_ROOT).as_posix() if resolved.is_relative_to(REPO_ROOT) else resolved.name


class SculptError(ValueError):
    """雕塑结果过不了平滑 / 拓扑门。"""


def _vertex_normals(points: np.ndarray, faces: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    face = np.cross(points[faces[:, 1]] - points[faces[:, 0]], points[faces[:, 2]] - points[faces[:, 0]])
    vertex = np.zeros_like(points)
    for corner in range(3): np.add.at(vertex, faces[:, corner], face)
    return vertex / np.maximum(np.linalg.norm(vertex, axis=1, keepdims=True), 1e-12), face


def rotate_between(a: np.ndarray, b: np.ndarray, v: np.ndarray) -> np.ndarray:
    """把 v 按 a→b 的最小旋转（Rodrigues）转过去；a、b、v 为 N×3 单位向量。"""
    axis = np.cross(a, b); sine = np.linalg.norm(axis, axis=1, keepdims=True)
    cosine = np.einsum("ij,ij->i", a, b)[:, None]; k = axis / np.maximum(sine, 1e-12)
    out = v * cosine + np.cross(k, v) * sine + k * np.einsum("ij,ij->i", k, v)[:, None] * (1 - cosine)
    same = sine[:, 0] < 1e-9; out[same] = v[same]
    return out / np.maximum(np.linalg.norm(out, axis=1, keepdims=True), 1e-12)


def dihedral_change(before: np.ndarray, after: np.ndarray, faces: np.ndarray, *, return_edges: bool = False):
    """内部边两侧面法向夹角在变形前后的变化（度）；return_edges 时另返回每条边的两端点序号（N×2）。"""
    edges = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    owner = np.tile(np.arange(len(faces)), 3); key = np.sort(edges, axis=1)
    order = np.lexsort((key[:, 1], key[:, 0])); key, owner = key[order], owner[order]
    pair = np.all(key[1:] == key[:-1], axis=1); a, b = owner[:-1][pair], owner[1:][pair]
    def angles(points: np.ndarray) -> np.ndarray:
        n = np.cross(points[faces[:, 1]] - points[faces[:, 0]], points[faces[:, 2]] - points[faces[:, 0]])
        n /= np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-15)
        return np.degrees(np.arccos(np.clip(np.einsum("ij,ij->i", n[a], n[b]), -1, 1)))
    change = np.abs(angles(after) - angles(before)) if len(a) else np.zeros(0)
    return (change, key[:-1][pair]) if return_edges else change


def _joint_slots(glb: GLB) -> dict[str, int]:
    return {str(glb.json["nodes"][node].get("name", "")).rsplit(":", 1)[-1]: slot for slot, node in enumerate(glb.skin().joints)}


def _chin(body: Path, positions: np.ndarray, head_weight: np.ndarray, neck: np.ndarray) -> float:
    """下巴高度：优先 tools/model3d/measure_heads.py（正中矢状面前轮廓口径）；量不出时取正中前缘 Head 主导点的最低 1%。"""
    try:
        sys.path.append(str(Path(__file__).resolve().parents[1]))
        import measure_heads
        return float(measure_heads.measure(str(body))["chin"])
    except Exception:
        front = (np.abs(positions[:, 0] - neck[0]) < 0.006) & (positions[:, 2] > neck[2]) & (head_weight > .5)
        if not np.any(front): raise SculptError("找不到下巴（正中前缘没有 Head 主导点）")
        return float(np.percentile(positions[front, 1], 1))


def sculpt(body: Path, out: Path | None, *, lengthen_mm: float = 0.0, k_front: float = 1.0, k_side: float = 1.0,
           k_back: float = 1.0, base_k_side: float = 1.0, base_k_back: float = 1.0, base_lo: float = -0.35,
           base_hi: float = -0.15, base_rho: float = 2.0, trap_mm: float = 0.0, trap_rho: tuple[float, float] = (1.5, 2.6),
           head_boundary_mm: tuple[float, float, float] = (4.0, 22.0, 30.0), rho_out: float = 3.6,
           roi_mm: tuple[float, float, float] = (ROI_BELOW_MM, ROI_ABOVE_MM, ROI_RADIUS_MM),
           m_per_mu: float | None = None, chin_mu: float | None = None) -> dict[str, Any]:
    source = load_glb(body); skin = source.skin(); mesh = source.mesh(); slots = _joint_slots(source)
    for name in ("Neck", "Head"):
        if name not in slots: raise SculptError(f"缺少关节 {name}")
    if m_per_mu is None:
        skeleton_path = body.parent / "skeleton.json"
        if not skeleton_path.is_file(): raise SculptError("缺 skeleton.json，须给 --m-per-mu")
        m_per_mu = float(json.loads(skeleton_path.read_text(encoding="utf-8"))["mPerMu"])
    mm = 1 / (1000 * m_per_mu)
    positions = mesh.positions.astype(np.float64); faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    worlds = D._worlds(source)
    if np.abs(lbs(mesh.positions, mesh.joints, mesh.weights, worlds, skin.inverse_bind_matrices) - positions).max() > 1e-4:
        raise SculptError("模板须 rest = bind 且 mesh 节点无变换（先过 normalize_rig.py）")
    welded, welded_faces, inverse = weld_vertices(positions, faces)
    head_weight = np.zeros(len(positions))
    for column in range(mesh.joints.shape[1]):
        head_weight += np.where(mesh.joints[:, column] == slots["Head"], mesh.weights[:, column], 0.0)
    neck = worlds[slots["Neck"]][:3, 3]
    chin = float(chin_mu) if chin_mu is not None else _chin(body, positions, head_weight, neck)
    cx, cz = float(neck[0]), float(neck[2])
    for _ in range(3):   # 颈段截面包围盒中心（下巴下 8–16 mm、离当前中心 80 mm 内）
        band = (welded[:, 1] < chin - 8 * mm) & (welded[:, 1] > chin - 16 * mm) & (np.hypot(welded[:, 0] - cx, welded[:, 2] - cz) < 80 * mm)
        if np.count_nonzero(band) < 8: raise SculptError("颈段截面点太少")
        cx = float((welded[band, 0].max() + welded[band, 0].min()) / 2); cz = float((welded[band, 2].max() + welded[band, 2].min()) / 2)
    rx = float(np.percentile(np.abs(welded[band, 0] - cx), 97)); rz = float(np.percentile(np.abs(welded[band, 2] - cz), 97))
    dx, dz = welded[:, 0] - cx, welded[:, 2] - cz; h = welded[:, 1]
    rho = np.sqrt((dx / rx) ** 2 + (dz / rz) ** 2); theta = np.arctan2(dx, dz)
    front = np.maximum(np.cos(theta), 0) ** 2; back = np.maximum(-np.cos(theta), 0) ** 2; side = np.sin(theta) ** 2
    root = chin - 14 * mm      # 颈根：沿颈向下、截面宽度比颈段扩 25% 处
    for step in range(1, 200):
        y = chin - 14 * mm - step * mm
        sl = (np.abs(h - y) < 1 * mm) & (np.abs(dz) < rz * 1.2)
        if np.any(sl) and np.percentile(np.abs(dx[sl]), 99) > rx * 1.25: root = y; break
    L = lengthen_mm * mm
    hb_front, hb_side, hb_back = head_boundary_mm
    hb = chin + (hb_front * front + hb_side * side + hb_back * back) * mm
    t_mid = (h - root) / np.maximum(hb - root, 1e-9)
    head_set = h > hb + HEAD_MARGIN_MM * mm
    torso_set = ((h < root - TORSO_BELOW_MM * mm) | (rho > rho_out)) & ~head_set
    core = (rho < 1.25) & (t_mid > CORE_T_RANGE[0]) & (t_mid < CORE_T_RANGE[1]) & ~head_set & ~torso_set
    target = np.zeros_like(welded)
    target[head_set, 1] = L
    k = k_front * front + k_side * side + k_back * back
    target[core, 0] = (k[core] - 1) * dx[core]; target[core, 2] = (k[core] - 1) * dz[core]
    target[core, 1] = L * np.clip(t_mid[core], 0, 1)
    base = np.zeros(len(welded), dtype=bool)
    if base_k_side != 1.0 or base_k_back != 1.0:
        base = (rho < base_rho) & (t_mid > base_lo) & (t_mid < base_hi) & ~head_set & ~torso_set & ~core
        k_base = 1.0 * front + base_k_side * side + base_k_back * back
        target[base, 0] = (k_base[base] - 1) * dx[base]; target[base, 2] = (k_base[base] - 1) * dz[base]
    normals_welded, _ = _vertex_normals(welded, welded_faces)
    trap = np.zeros(len(welded), dtype=bool)
    if trap_mm > 0:
        trap = ((rho > trap_rho[0]) & (rho < trap_rho[1]) & (h > root - 35 * mm) & (h < root + 5 * mm)
                & (normals_welded[:, 1] > 0.25) & ~head_set & ~torso_set & ~core & ~base)
        target[trap, 1] = -trap_mm * mm * (0.5 + 0.5 * (side[trap] + back[trap]))
    roi_below, roi_above, roi_radius = roi_mm
    roi = (h > root - roi_below * mm) & (h < chin + roi_above * mm) & (np.hypot(dx, dz) < roi_radius * mm)
    displacement = np.zeros_like(welded)
    displacement[(h >= chin) & (~roi | head_set)] = (0.0, L, 0.0)
    face_in = np.all(roi[welded_faces], axis=1)
    used = np.unique(welded_faces[face_in]); local = -np.ones(len(welded), dtype=np.int64); local[used] = np.arange(len(used))
    boundary = np.zeros(len(welded), dtype=bool); boundary[np.unique(welded_faces[~face_in])] = True
    fixed = head_set | torso_set | core | base | trap
    constrained = (fixed | boundary)[used]
    sub_target = target[used].copy()
    loose = boundary[used] & ~fixed[used]
    sub_target[loose] = np.where((h[used][loose] >= chin)[:, None], np.array([0.0, L, 0.0]), 0.0)
    solved, solve = biharmonic_displacement(welded[used], local[welded_faces[face_in]], constrained, welded[used] + sub_target)
    displacement[used] = solved
    moved = welded + displacement
    # 门
    normals_before, faces_before = _vertex_normals(welded, welded_faces)
    normals_after, faces_after = _vertex_normals(moved, welded_faces)
    flipped = int(np.count_nonzero(np.einsum("ij,ij->i", faces_before, faces_after) <= 0))
    edges = np.concatenate([welded_faces[:, [0, 1]], welded_faces[:, [1, 2]], welded_faces[:, [2, 0]]])
    ratio = (np.linalg.norm(moved[edges[:, 0]] - moved[edges[:, 1]], axis=1)
             / np.maximum(np.linalg.norm(welded[edges[:, 0]] - welded[edges[:, 1]], axis=1), 1e-12))
    dihedral, dihedral_edges = dihedral_change(welded, moved, welded_faces, return_edges=True)   # 全焊接网格：ROI 边界上内外两面共用的边也要量
    interior = dihedral_change(welded, moved, welded_faces[face_in])                            # 只在 ROI 内部（对照用，不作门）
    worst = int(np.argmax(dihedral)) if len(dihedral) else None
    report: dict[str, Any] = {
        "schema": "tianshu.dressup-neck-sculpt.v1", "body": _portable(body),
        "bodySha256": hashlib.sha256(Path(body).read_bytes()).hexdigest(),
        "params": {"lengthenMm": lengthen_mm, "kFront": k_front, "kSide": k_side, "kBack": k_back,
                   "baseKSide": base_k_side, "baseKBack": base_k_back, "baseRange": [base_lo, base_hi], "baseRho": base_rho,
                   "trapMm": trap_mm, "trapRho": list(trap_rho), "headBoundaryMm": list(head_boundary_mm), "rhoOut": rho_out,
                   "roiMm": list(roi_mm)},
        "measured": {"chinMu": chin, "neckRootMu": root, "neckCenterMu": [cx, cz], "neckRadiusMm": [rx / mm, rz / mm],
                     "mPerMu": m_per_mu},
        "sets": {"head": int(head_set.sum()), "torso": int(torso_set.sum()), "core": int(core.sum()), "base": int(base.sum()),
                 "trap": int(trap.sum()), "roiFree": int(len(used) - np.count_nonzero(constrained))},
        "solve": solve, "maxDisplacementMm": float(np.linalg.norm(displacement, axis=1).max() / mm),
        "flippedFaces": flipped,
        "edgeRatio": {"min": float(ratio.min()), "p001": float(np.percentile(ratio, .1)), "p999": float(np.percentile(ratio, 99.9)),
                      "max": float(ratio.max())},
        "dihedralChangeDeg": {"scope": "weldedMesh", "edges": int(len(dihedral)),
                              "p99": float(np.percentile(dihedral, 99)) if len(dihedral) else 0.0,
                              "p999": float(np.percentile(dihedral, 99.9)) if len(dihedral) else 0.0,
                              "max": float(dihedral.max(initial=0.0)),
                              "overLimit": int(np.count_nonzero(dihedral > MAX_DIHEDRAL_CHANGE_DEG)),
                              "worstAtMu": (welded[dihedral_edges[worst]].mean(axis=0).tolist() if worst is not None else None),
                              "roiInteriorMax": float(interior.max(initial=0.0))},
    }
    problems = []
    if flipped: problems.append(f"翻面 {flipped}")
    if report["dihedralChangeDeg"]["max"] > MAX_DIHEDRAL_CHANGE_DEG:
        problems.append(f"二面角变化最大 {report['dihedralChangeDeg']['max']:.2f}° > {MAX_DIHEDRAL_CHANGE_DEG}°")
    if not (EDGE_RATIO_RANGE[0] <= ratio.min() and ratio.max() <= EDGE_RATIO_RANGE[1]):
        problems.append(f"边长比 {ratio.min():.3f}–{ratio.max():.3f} 超出 {EDGE_RATIO_RANGE}")
    report["gate"] = {"pass": not problems, "problems": problems}
    if problems or out is None: return report
    # 写回：位置、法线（按几何法线旋转原法线）、Head 关节上移 L、IBM 重算
    final_positions = moved[inverse]
    normals = rotate_between(normals_before[inverse], normals_after[inverse], mesh.normals.astype(np.float64))
    document = copy.deepcopy(source.json)
    D._move_node_world(document, source, source.skin().joints[slots["Head"]], np.array([0.0, L, 0.0]))
    binary = bytearray(source.bin); working = GLB(source.path, document, bytes(binary)); new_worlds = D._worlds(working)
    position_accessors, _ = D._vertex_arrays(source, "POSITION"); normal_accessors, _ = D._vertex_arrays(source, "NORMAL")
    offset = 0
    for index in position_accessors:
        count = int(document["accessors"][index]["count"])
        D._write_accessor(working, binary, index, final_positions[offset:offset + count], extrema=True); offset += count
    offset = 0
    for index in normal_accessors:
        count = int(document["accessors"][index]["count"])
        D._write_accessor(working, binary, index, normals[offset:offset + count]); offset += count
    if skin.inverse_bind_accessor is None: raise SculptError("skin 必须显式提供 inverseBindMatrices")
    D._write_accessor(working, binary, skin.inverse_bind_accessor, np.linalg.inv(new_worlds))
    D._atomic_bytes(out, D._serialize(document, bytes(binary)))
    written = load_glb(out); written_mesh = written.mesh()
    if not np.array_equal(written_mesh.indices, mesh.indices) or not np.array_equal(written_mesh.joints, mesh.joints) \
            or not np.array_equal(written_mesh.weights, mesh.weights) or (mesh.uvs is not None and not np.array_equal(written_mesh.uvs, mesh.uvs)):
        raise SculptError("写出后拓扑 / UV / 权重改变")
    head_moved = (D._worlds(written)[slots["Head"]][:3, 3] - worlds[slots["Head"]][:3, 3]) / mm
    neck_moved = (D._worlds(written)[slots["Neck"]][:3, 3] - worlds[slots["Neck"]][:3, 3]) / mm
    rebound = lbs(written_mesh.positions, written_mesh.joints, written_mesh.weights, D._worlds(written),
                  written.skin().inverse_bind_matrices)
    report["output"] = {"file": _portable(out), "sha256": hashlib.sha256(Path(out).read_bytes()).hexdigest(),
                        "headJointMovedMm": head_moved.tolist(), "neckJointMovedMm": neck_moved.tolist(),
                        "restBindMaxDiffMu": float(np.abs(rebound - written_mesh.positions).max())}
    return report


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--body", required=True, type=Path); parser.add_argument("--out", type=Path)
    parser.add_argument("--lengthen-mm", type=float, default=0.0)
    parser.add_argument("--k-front", type=float, default=1.0); parser.add_argument("--k-side", type=float, default=1.0)
    parser.add_argument("--k-back", type=float, default=1.0)
    parser.add_argument("--base-k-side", type=float, default=1.0); parser.add_argument("--base-k-back", type=float, default=1.0)
    parser.add_argument("--trap-mm", type=float, default=0.0)
    parser.add_argument("--roi-mm", type=float, nargs=3, metavar=("BELOW", "ABOVE", "RADIUS"),
                        default=(ROI_BELOW_MM, ROI_ABOVE_MM, ROI_RADIUS_MM), help="求解区：颈根下 / 下巴上 / 水平半径（mm）")
    parser.add_argument("--m-per-mu", type=float); parser.add_argument("--chin-mu", type=float)
    parser.add_argument("--check-only", action="store_true", help="只算并输出报告，不写文件")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)
    if not args.check_only and args.out is None: parser.error("需要 --out（或 --check-only）")
    try:
        report = sculpt(args.body, None if args.check_only else args.out, lengthen_mm=args.lengthen_mm, k_front=args.k_front,
                        k_side=args.k_side, k_back=args.k_back, base_k_side=args.base_k_side, base_k_back=args.base_k_back,
                        trap_mm=args.trap_mm, roi_mm=tuple(args.roi_mm), m_per_mu=args.m_per_mu, chin_mu=args.chin_mu)
    except SculptError as error:
        print(f"雕塑失败：{error}"); return 2
    if args.json: print(json.dumps(report, ensure_ascii=False))
    else:
        print(f"{'通过' if report['gate']['pass'] else '未过门'}：翻面 {report['flippedFaces']}，二面角变化最大 "
              f"{report['dihedralChangeDeg']['max']:.2f}°，边长比 {report['edgeRatio']['min']:.3f}–{report['edgeRatio']['max']:.3f}")
    return 0 if report["gate"]["pass"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
