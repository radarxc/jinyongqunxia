"""切片贴合（ADR 0002）主流程：竖直映射 → 对中 → 分部件切片 → r 混合 → 3D 残余外推 / 折角平滑。"""
from __future__ import annotations

from dataclasses import dataclass, field, replace
import time
from typing import Any

try:
    from .slice_fit_base import (FIT_SCHEMA, SliceFitError, _unit, mm_to_mu, mu_to_mm, welded_adjacency)
except ImportError:
    from slice_fit_base import (FIT_SCHEMA, SliceFitError, _unit, mm_to_mu, mu_to_mm, welded_adjacency)  # type: ignore[no-redef]

import numpy as np  # noqa: E402

try:
    from .slice_fit_geometry import (AxisMap, HorizontalSlicer, convex_hull_2d)
except ImportError:
    from slice_fit_geometry import (AxisMap, HorizontalSlicer, convex_hull_2d)  # type: ignore[no-redef]
try:
    from .slice_fit_anchors import (anchor_report, vertical_map)
except ImportError:
    from slice_fit_anchors import (anchor_report, vertical_map)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]
try:
    from .slice_fit_parts import (PartResult, _slice_range, build_arm_part, build_torso_part, part_weights)
except ImportError:
    from slice_fit_parts import (PartResult, _slice_range, build_arm_part, build_torso_part, part_weights)  # type: ignore[no-redef]
try:
    from .slice_fit_radial import (SliceParams)
except ImportError:
    from slice_fit_radial import (SliceParams)  # type: ignore[no-redef]


def clearance_stats(body: BodyModel, points: np.ndarray, clearance_mu: float) -> tuple[dict[str, Any], np.ndarray]:
    signed = body.signed_distance(points)
    mm = mu_to_mm(signed, body.m_per_mu)
    stats = {"minMm": float(mm.min()), "p1Mm": float(np.quantile(mm, 0.01)), "p5Mm": float(np.quantile(mm, 0.05)),
             "p50Mm": float(np.quantile(mm, 0.5)), "insideCount": int(np.count_nonzero(signed < 0.0)),
             "insideFraction": float(np.mean(signed < 0.0)),
             "belowClearanceCount": int(np.count_nonzero(signed < clearance_mu - 1e-9)),
             "vertices": int(len(points))}
    return stats, signed


def residual_push(body: BodyModel, garment: GarmentModel, points: np.ndarray, clearance_mu: float,
                  rounds: int) -> tuple[np.ndarray, list[dict[str, Any]]]:
    """水平切片管不到的近水平体表处，按 3D 最近点把不足间隙的点外推（伪法向判内外），位移在网格上局部摊开。"""
    current = np.asarray(points, dtype=np.float64).copy()
    matrix, degree = welded_adjacency(garment.faces, garment.weld)
    welded_count = len(degree); history: list[dict[str, Any]] = []
    for _ in range(max(0, rounds)):
        nearest, bary, face_ids, distances = body.surface().query(current)
        signed = body.sign().signed(current, nearest, bary, face_ids, distances)
        need = clearance_mu + 2e-6 - signed
        active = need > 1e-6
        if not np.any(active):
            break
        direction = _unit(current - nearest)
        direction[signed < 0.0] *= -1.0
        tiny = distances < 1e-9
        if np.any(tiny):
            direction[tiny] = _unit(np.einsum("ni,nij->nj", bary[tiny], body.normals[body.faces[face_ids[tiny]]]))
        displacement = np.zeros_like(current)
        displacement[active] = need[active, None] * direction[active]
        # 焊接空间：同位多点取最大位移；一环扩散两次（邻点随动），再保证主动点达到所需量。
        welded = np.zeros((welded_count, 3)); magnitude = np.zeros(welded_count)
        lengths = np.linalg.norm(displacement, axis=1)
        order = np.argsort(lengths)
        welded[garment.weld[order]] = displacement[order]; magnitude[garment.weld[order]] = lengths[order]
        spread = welded.copy()
        for _step in range(2):
            neighbour = matrix @ spread
            average = np.divide(neighbour, degree[:, None], out=np.zeros_like(neighbour), where=degree[:, None] > 0)
            spread = np.where((magnitude > 0)[:, None], spread, 0.5 * average)
        moved = spread[garment.weld]
        projection = np.einsum("ij,ij->i", moved, direction)
        moved[active] += np.maximum(need[active] - projection[active], 0.0)[:, None] * direction[active]
        current = current + moved
        history.append({"active": int(np.count_nonzero(active)), "inside": int(np.count_nonzero(signed < 0.0)),
                        "maxPushMm": float(mu_to_mm(need[active].max(), body.m_per_mu))})
    return current, history


def bad_triangles(reference: np.ndarray, positions: np.ndarray, faces: np.ndarray,
                  stretch: tuple[float, float] = (0.7, 1.4)) -> np.ndarray:
    """相对参考网格翻面或任一边长比超出 stretch 的三角（validate 几何门口径）。"""
    old = reference[faces]; new = positions[faces]
    old_n = np.cross(old[:, 1] - old[:, 0], old[:, 2] - old[:, 0])
    new_n = np.cross(new[:, 1] - new[:, 0], new[:, 2] - new[:, 0])
    nonzero = np.linalg.norm(old_n, axis=1) > 0
    flipped = nonzero & (np.einsum("ij,ij->i", old_n, new_n) < 0)
    old_e = np.linalg.norm(old[:, [1, 2, 0]] - old[:, [0, 1, 2]], axis=2)
    new_e = np.linalg.norm(new[:, [1, 2, 0]] - new[:, [0, 1, 2]], axis=2)
    ratio = np.divide(new_e, old_e, out=np.ones_like(new_e), where=old_e > 0)
    stretched = nonzero & ~np.all((ratio >= stretch[0]) & (ratio <= stretch[1]), axis=1)
    return flipped | stretched


def relax_bad_regions(garment: GarmentModel, reference: np.ndarray, positions: np.ndarray, *, rings: int,
                      iterations: int, scale: float = 1.0) -> tuple[np.ndarray, int]:
    """翻面 / 超拉伸三角（相对 reference 按 scale 归一）周围 rings 环内，对"相对 reference 的位移"做 Jacobi 平均。

    位移场里的整体旋转 / 缩放是线性的，平均后不变；只抹掉相邻顶点位移突变造成的折角。不同衣层在网格上不相连，
    层间距不受影响。开口边上的点只有单侧邻点，Jacobi 平均会把线性位移场拉向内侧（袖口 / 领口沿轴漂移），
    所以开口边点不参与平均、只作邻点。"""
    bad = bad_triangles(reference * scale, positions, garment.faces)
    if not bad.any():
        return positions, 0
    matrix, degree = welded_adjacency(garment.faces, garment.weld)
    count = len(degree)
    marked = np.zeros(count, dtype=bool); marked[garment.weld[garment.faces[bad]].ravel()] = True
    for _ in range(max(0, rings)):
        marked = marked | ((matrix @ marked.astype(np.float64)) > 0)
    welded = garment.weld[garment.faces]
    edges = np.sort(np.concatenate((welded[:, [0, 1]], welded[:, [1, 2]], welded[:, [2, 0]])), axis=1)
    edges, uses = np.unique(edges[edges[:, 0] != edges[:, 1]], axis=0, return_counts=True)
    marked[edges[uses == 1].ravel()] = False
    displacement = np.zeros((count, 3)); hits = np.zeros(count)
    np.add.at(displacement, garment.weld, positions - reference * scale); np.add.at(hits, garment.weld, 1.0)
    displacement /= np.maximum(hits, 1.0)[:, None]
    for _ in range(max(1, iterations)):
        neighbour = matrix @ displacement
        average = np.divide(neighbour, degree[:, None], out=displacement.copy(), where=degree[:, None] > 0)
        displacement[marked] = 0.5 * displacement[marked] + 0.5 * average[marked]
    relaxed = positions.copy()
    touched = marked[garment.weld]
    relaxed[touched] = reference[touched] * scale + displacement[garment.weld[touched]]
    return relaxed, int(bad.sum())


@dataclass
class SliceFitResult:
    positions: np.ndarray            # 最终（含残余外推）
    sliced: np.ndarray               # 仅切片映射
    variants: dict[str, np.ndarray]  # aligned（径向不动）/ elastic / inelastic
    weights: dict[str, np.ndarray]
    parts: list[PartResult]
    vertical: AxisMap
    diagnostics: dict[str, Any]
    signed_final: np.ndarray = field(default=None)  # type: ignore[assignment]


def slice_fit(body: BodyModel, garment: GarmentModel, *, params: SliceParams | None = None,
              elasticity: float | None = None, clearance_mm: float | None = None) -> SliceFitResult:
    """作者方案主流程（见模块文档）。返回最终位置、各中间变体与诊断。"""
    params = params or SliceParams()
    started = time.perf_counter()
    landmarks = garment.landmarks
    r = float(landmarks.get("elasticity", 0.9) if elasticity is None else elasticity)
    if not 0.0 <= r <= 1.0:
        raise SliceFitError("弹性系数 r 必须在 [0, 1]")
    rigid = bool(landmarks.get("rigid", False)) or r <= 0.0
    gap_mm = float(landmarks.get("clearanceMm", 1.0) if clearance_mm is None else clearance_mm)
    clearance_mu = mm_to_mu(gap_mm, body.m_per_mu)
    if (landmarks.get("legs") or "tube") != "tube":
        raise SliceFitError("目前只实现 legs: tube（裙 / 长衣一圈包两腿）；分腿裤装需按腿骨轴部件，见 ADR 0002")
    vertical = vertical_map(body, garment, rigid)
    # 褶皱尺度：弹性位移场的上包络在非接触区等效成 σ·√n 的核；比它小的褶皱随形保留（只把最深的褶谷顶到体表 + 间隙），
    # 0 = 作者字面"内环贴体"，会把 Tripo 件烘进去的褶皱压平（网格拉伸、贴图上画的褶对不上）。
    fold_mm = float(landmarks.get("foldMm", 0.0) if params.fold_mm is None else params.fold_mm)
    iterations = max(params.envelope_iters, int(round((fold_mm / max(params.sigma_axial_mm, 1e-6)) ** 2)))
    params = replace(params, envelope_iters=iterations, fold_mm=fold_mm)
    sleeves = [side for side in ("L", "R") if (landmarks.get("sleeves") or {}).get(side)]
    # 粗对齐（竖直映射 + 全件常数水平对中）只用于给顶点分部件。
    spacing = mm_to_mu(params.slice_mm, body.m_per_mu)
    coarse_y = vertical(garment.positions[:, 1])
    slicer_all = HorizontalSlicer(garment.positions, garment.faces, garment.weld)
    offsets = []
    for y_g in _slice_range(garment.positions[:, 1], 4 * spacing):
        section = slicer_all(float(y_g)); body_section = body.torso_slicer()(float(vertical(np.array([y_g]))[0]))
        if section.empty or body_section.empty:
            continue
        hull = convex_hull_2d(body_section.points.reshape(-1, 3)[:, [0, 2]])
        points = section.points.reshape(-1, 3)[:, [0, 2]]
        if hull is not None:
            # 只看躯干附近的衣片（窗口 = 素体凸包半宽 × 1.5 + 3 cm），单侧袖子 / 垂带不把中心带偏。
            half = 0.5 * np.ptp(hull.ring, axis=0) * 1.5 + mm_to_mu(30.0, body.m_per_mu)
            near = np.all(np.abs(points - hull.centroid) <= half, axis=1)
            if near.sum() >= 3:
                kept = points[near]
                offsets.append(hull.centroid - 0.5 * (kept.min(axis=0) + kept.max(axis=0)))
    offset0 = np.median(np.asarray(offsets), axis=0) if offsets else np.zeros(2)
    coarse = np.column_stack((garment.positions[:, 0] + offset0[0], coarse_y, garment.positions[:, 2] + offset0[1]))
    weights = part_weights(body, garment, coarse, sleeves, params.part_smooth_iters)
    parts = [build_torso_part(body, garment, weights["torso"], vertical, params=params, r=r, rigid=rigid,
                              clearance_mu=clearance_mu, offset_hint=offset0)]
    for side in sleeves:
        parts.append(build_arm_part(side, body, garment, weights[f"arm{side}"], params=params, r=r, rigid=rigid,
                                    clearance_mu=clearance_mu))
    blend = {key: np.zeros_like(garment.positions) for key in ("aligned", "elastic", "inelastic")}
    for part in parts:
        w = weights[part.name][:, None]
        blend["aligned"] += w * part.positions0; blend["elastic"] += w * part.elastic
        blend["inelastic"] += w * part.inelastic
    sliced = r * blend["elastic"] + (1.0 - r) * blend["inelastic"]
    rigid_bumps: list[dict[str, Any]] = []
    if rigid:
        # 刚体件：水平切面看不到的近水平体表（胸上坡、肩胛）若仍穿入，不做局部外推（会把甲片压出凹坑），
        # 而是按 3D 最近体表法向折算的径向缺口把整件 ratio 统一放大（仍是同一个相似变换），至多 4 轮。
        total_bump = 1.0
        for _ in range(4):
            nearest, bary, face_ids, distances = body.surface().query(sliced)
            signed = body.sign().signed(sliced, nearest, bary, face_ids, distances)
            # 只认躯干体表的穿入；碰到 A 字手臂是姿势问题（交残余外推 / 姿势蒙皮），放大整件只会更往手臂里撑。
            need = np.where(body.torso_face_mask[face_ids], clearance_mu + 1e-6 - signed, 0.0)
            if not np.any(need > 1e-6) or total_bump >= params.rigid_bump_max:
                break
            normals = _unit(np.einsum("ni,nij->nj", bary, body.normals[body.faces[face_ids]]))
            changed = False
            for part in parts:
                member = (weights[part.name] >= 0.5) & (need > 1e-6)
                if not member.any():
                    continue
                cosine = np.clip(np.einsum("ij,ij->i", part.radial[member], normals[member]), 0.3, 1.0)
                rho = np.maximum(part.rho_inelastic[member], 1e-6)
                factor = float(np.max((rho + need[member] / cosine) / rho)) * 1.002
                factor = min(factor, params.rigid_bump_max / total_bump)
                if factor <= 1.0 + 1e-6:
                    continue
                part.rescale_inelastic(factor); changed = True; total_bump *= factor
                rigid_bumps.append({"part": part.name, "factor": factor, "points": int(member.sum()),
                                    "maxNeedMm": float(mu_to_mm(need[member].max(), body.m_per_mu))})
            if not changed:
                break
            blend["inelastic"] = sum(weights[part.name][:, None] * part.inelastic for part in parts)
            sliced = r * blend["elastic"] + (1.0 - r) * blend["inelastic"]
    stats_sliced, _ = clearance_stats(body, sliced, clearance_mu)
    final = sliced
    history: list[dict[str, Any]] = []
    relax: list[dict[str, Any]] = []
    if params.residual_push:
        final, history = residual_push(body, garment, sliced, clearance_mu, params.residual_rounds)
        # 折角（翻面 / 超拉伸）邻域位移平滑 → 再外推，交替至多 relax_cycles 轮；口径与 validate 几何门一致（相对源件）。
        for _cycle in range(max(0, params.relax_cycles)):
            relaxed, bad_before = relax_bad_regions(garment, garment.positions, final, rings=params.relax_rings,
                                                    iterations=params.relax_iters)
            if bad_before == 0:
                break
            pushed_again, more = residual_push(body, garment, relaxed, clearance_mu, params.residual_rounds)
            bad_after = int(bad_triangles(garment.positions, pushed_again, garment.faces).sum())
            relax.append({"badBefore": bad_before, "badAfter": bad_after, "pushRounds": len(more)})
            if bad_after >= bad_before:
                break
            final = pushed_again; history += more
    stats_final, signed_final = clearance_stats(body, final, clearance_mu)
    stats_input, _ = clearance_stats(body, garment.positions, clearance_mu)
    stats_aligned, _ = clearance_stats(body, blend["aligned"], clearance_mu)
    pushed = np.linalg.norm(final - sliced, axis=1)
    # 衣缘核验：锚点源值经映射后与目标之差（标注数值映射残差）+ 结果几何上同法复量的落点与目标之差（实际衣缘落点残差）。
    arms = {part.name[-1]: part.arm for part in parts if part.arm is not None}
    anchors = anchor_report(body, garment, vertical, final, arms)
    diagnostics: dict[str, Any] = {
        "schema": FIT_SCHEMA, "elasticity": r, "rigid": rigid, "clearanceMm": gap_mm, "foldMm": fold_mm,
        "envelopeIters": iterations,
        "params": params.record(), "vertical": vertical.describe(), **anchors,
        "horizontalOffsetMm": mu_to_mm(offset0, body.m_per_mu).tolist(),
        "parts": [{"name": part.name, **part.field.stats, "frame": part.frame,
                   "vertices": int(np.count_nonzero(weights[part.name] >= 0.5))} for part in parts],
        "clearance": {"input": stats_input, "aligned": stats_aligned, "sliced": stats_sliced, "final": stats_final},
        "relax": relax, "rigidRatioBumps": rigid_bumps,
        "residualPush": {"rounds": history, "movedVertices": int(np.count_nonzero(pushed > 1e-9)),
                         "maxMm": float(mu_to_mm(pushed.max(initial=0.0), body.m_per_mu)),
                         "p99Mm": float(mu_to_mm(np.quantile(pushed, 0.99), body.m_per_mu))},
        "elapsedSec": time.perf_counter() - started,
    }
    return SliceFitResult(final, sliced, blend, weights, parts, vertical, diagnostics, signed_final)
