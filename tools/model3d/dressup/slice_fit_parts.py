"""切片贴合（ADR 0002）部件：躯干水平切、袖沿臂骨弦垂直切、部件权重。"""
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any, Sequence

try:
    from .slice_fit_base import (SliceFitError, component_labels, mm_to_mu, smooth_on_mesh)
except ImportError:
    from slice_fit_base import (SliceFitError, component_labels, mm_to_mu, smooth_on_mesh)  # type: ignore[no-redef]

import numpy as np  # noqa: E402

try:
    from .slice_fit_geometry import (AxisMap, HorizontalSlicer, PlaneSection, limb_frame, section_by_plane, section_loops)
except ImportError:
    from slice_fit_geometry import (AxisMap, HorizontalSlicer, PlaneSection, limb_frame, section_by_plane, section_loops)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]
try:
    from .slice_fit_radial import (RadialField, SliceParams, build_radial_field)
except ImportError:
    from slice_fit_radial import (RadialField, SliceParams, build_radial_field)  # type: ignore[no-redef]
try:
    from .slice_fit_anchors import (arm_axes, arm_axis_map)
except ImportError:
    from slice_fit_anchors import (arm_axes, arm_axis_map)  # type: ignore[no-redef]


@dataclass
class PartResult:
    name: str
    field: RadialField
    positions0: np.ndarray      # 只做轴向映射 + 对中（径向不动）
    elastic: np.ndarray         # r = 1
    inelastic: np.ndarray       # r = 0
    frame: dict[str, Any]
    place: Any = None           # 半径数组 → 3D 位置（轴向、中心、角度不变）
    rho_inelastic: np.ndarray | None = None
    radial: np.ndarray | None = None   # 各顶点在世界系里的径向单位向量
    arm: dict[str, Any] | None = None  # 袖：轴向映射、两套弦、袖口锚点（核验落点用）

    def rescale_inelastic(self, factor: float) -> None:
        """刚体件整件放大（只改非弹性半径），仍是同一个相似变换。"""
        self.field.ratio_scale *= factor
        self.rho_inelastic = self.rho_inelastic * factor
        self.inelastic = self.place(self.rho_inelastic)


def _slice_range(values: np.ndarray, spacing: float) -> np.ndarray:
    """覆盖 [min, max] 的等距切片；两端各内缩一点点（切面恰过端点那一圈顶点时交不出线段）。"""
    low, high = float(values.min()), float(values.max())
    inset = min(1e-6, 0.25 * max(high - low, 0.0))
    count = max(2, int(math.ceil((high - low) / spacing)) + 1)
    return np.linspace(low + inset, high - inset, count)


def build_torso_part(body: BodyModel, garment: GarmentModel, weights: np.ndarray, vertical: AxisMap, *,
                     params: SliceParams, r: float, rigid: bool, clearance_mu: float,
                     offset_hint: np.ndarray | None = None) -> PartResult:
    m_per_mu = body.m_per_mu
    spacing = mm_to_mu(params.slice_mm, m_per_mu)
    face_mask = weights[garment.faces].mean(axis=1) >= 0.5
    if not face_mask.any():
        face_mask = np.ones(len(garment.faces), dtype=bool)
    member = np.unique(garment.faces[face_mask])
    coords_g = _slice_range(garment.positions[member, 1], spacing)
    coords_b = vertical(coords_g)
    slicer_g = HorizontalSlicer(garment.positions, garment.faces, garment.weld, face_mask)
    garment_sections = []; body_sections = []
    for y_g, y_b in zip(coords_g, coords_b):
        section = slicer_g(float(y_g))
        garment_sections.append(section.points[:, :, [0, 2]])
        body_section = body.torso_slicer()(float(y_b))
        body_sections.append(body_section.points.reshape(-1, 3)[:, [0, 2]])
    radial = build_radial_field("torso", garment_sections, body_sections, coords_g, coords_b, params=params, r=r,
                                rigid=rigid, clearance_mu=clearance_mu, m_per_mu=m_per_mu, offset_hint=offset_hint)
    sample = radial.sample(garment.positions[:, 1], garment.positions[:, [0, 2]], r)
    y_new = vertical(garment.positions[:, 1])

    def place(rho: np.ndarray) -> np.ndarray:
        return np.column_stack((sample["centerB"][:, 0] + rho * np.cos(sample["theta"]), y_new,
                                sample["centerB"][:, 1] + rho * np.sin(sample["theta"])))

    radial_dirs = np.column_stack((np.cos(sample["theta"]), np.zeros(len(sample["theta"])), np.sin(sample["theta"])))
    return PartResult("torso", radial, place(sample["rho"]), place(sample["rhoElastic"]),
                      place(sample["rhoInelastic"]), {"axis": "+Y"}, place, sample["rhoInelastic"], radial_dirs)


def _loops_around_origin(section: PlaneSection, flat: np.ndarray) -> np.ndarray:
    """只留包住轴点（2D 原点）的环；腋下附近被臂权重带进来的胸侧皮肤是另外的环 / 链，不算手臂截面。"""
    if section.empty:
        return flat
    count, labels = section_loops(section)
    keep = np.zeros(len(flat), dtype=bool); best = None; best_distance = np.inf
    for label in range(count):
        member = labels == label
        points = flat[member].reshape(-1, 2)
        low, high = points.min(axis=0), points.max(axis=0)
        if np.all(low <= 0.0) and np.all(high >= 0.0):
            keep |= member
        distance = float(np.linalg.norm(points.mean(axis=0)))
        if distance < best_distance:
            best, best_distance = member, distance
    if not keep.any() and best is not None:
        keep = best
    return flat[keep]


def build_arm_part(side: str, body: BodyModel, garment: GarmentModel, weights: np.ndarray, *, params: SliceParams,
                   r: float, rigid: bool, clearance_mu: float) -> PartResult:
    sleeve = (garment.landmarks.get("sleeves") or {}).get(side)
    limb = body.landmarks.get("limbs", {}).get(f"arm{side}")
    if not sleeve or not limb:
        raise SliceFitError(f"袖 {side}：衣物或素体缺少臂轴标注")
    axes = arm_axes(sleeve.get("axis", {}), limb)
    p0, q0, a_g, a_b = axes["p0"], axes["q0"], axes["aG"], axes["aB"]
    u_g, v_g = limb_frame(a_g); u_b, v_b = limb_frame(a_b)
    axial, cuff = arm_axis_map(garment, side, axes, rigid, body.m_per_mu)   # 袖口锚点必经（有则）
    m_per_mu = body.m_per_mu; spacing = mm_to_mu(params.slice_mm, m_per_mu)
    face_mask = weights[garment.faces].mean(axis=1) >= 0.5
    if not face_mask.any():
        raise SliceFitError(f"袖 {side}：没有归属此袖的衣物三角")
    member = np.unique(garment.faces[face_mask])
    t_vertices = (garment.positions - p0) @ a_g
    coords_g = _slice_range(t_vertices[member], spacing)
    coords_b = axial(coords_g)
    garment_faces = np.flatnonzero(face_mask); body_faces = np.flatnonzero(body.arm_face_mask[side])
    garment_sections = []; body_sections = []
    for t_g, t_b in zip(coords_g, coords_b):
        origin_g = p0 + t_g * a_g
        section = section_by_plane(garment.positions, garment.faces, garment.weld, origin_g, a_g, garment_faces)
        local = section.points - origin_g
        garment_sections.append(np.stack((local @ u_g, local @ v_g), axis=-1))
        origin_b = q0 + t_b * a_b
        body_section = section_by_plane(body.positions, body.faces, body.weld, origin_b, a_b, body_faces)
        local_b = body_section.points - origin_b
        flat = np.stack((local_b @ u_b, local_b @ v_b), axis=-1)            # (m, 2, 2)
        body_sections.append(_loops_around_origin(body_section, flat).reshape(-1, 2))
    radial = build_radial_field(f"arm{side}", garment_sections, body_sections, coords_g, coords_b, params=params,
                                r=r, rigid=rigid, clearance_mu=clearance_mu, m_per_mu=m_per_mu,
                                body_min_fraction=0.6)
    local = garment.positions - p0
    sample = radial.sample(t_vertices, np.column_stack((local @ u_g, local @ v_g)), r)
    t_new = axial(t_vertices)

    def place(rho: np.ndarray) -> np.ndarray:
        cu = sample["centerB"][:, 0] + rho * np.cos(sample["theta"])
        cv = sample["centerB"][:, 1] + rho * np.sin(sample["theta"])
        return q0 + t_new[:, None] * a_b + cu[:, None] * u_b + cv[:, None] * v_b

    frame = {"garmentShoulderMu": p0, "bodyShoulderMu": q0, "garmentAxisDir": a_g, "bodyAxisDir": a_b,
             "axisMap": axial.describe(),
             "axisAngleDeg": float(math.degrees(math.acos(float(np.clip(a_g @ a_b, -1.0, 1.0)))))}
    radial_dirs = np.cos(sample["theta"])[:, None] * u_b + np.sin(sample["theta"])[:, None] * v_b
    arm = None if cuff is None else {**cuff, "axial": axial, "p0": p0, "aG": a_g, "q0": q0, "aB": a_b}
    return PartResult(f"arm{side}", radial, place(sample["rho"]), place(sample["rhoElastic"]),
                      place(sample["rhoInelastic"]), frame, place, sample["rhoInelastic"], radial_dirs, arm)


def part_weights(body: BodyModel, garment: GarmentModel, coarse: np.ndarray, sides: Sequence[str],
                 iterations: int) -> dict[str, np.ndarray]:
    """粗对齐后取最近素体点的臂权重，在衣物网格上平滑成过渡带；其余归躯干。"""
    count = len(garment.positions)
    result = {"torso": np.ones(count)}
    if not sides:
        return result
    _, bary, face_ids, _ = body.surface().query(coarse)
    tri = body.faces[face_ids]
    total = np.zeros(count)
    for side in sides:
        weight = np.einsum("ij,ij->i", bary, body.arm_weight[side][tri])
        weight = np.clip(smooth_on_mesh(weight, garment.faces, garment.weld, iterations), 0.0, 1.0)
        result[f"arm{side}"] = weight; total += weight
    scale = np.maximum(total, 1.0)
    for side in sides:
        result[f"arm{side}"] /= scale
    result["torso"] = np.clip(1.0 - total / scale, 0.0, 1.0)
    # 分开的连通块（甲片、单独缝上的袖管）几乎全属一个部件时整块归它：刚体片只随一个部件的映射走，
    # 也不会把相邻部件的衣片截进本部件的切面（锁子甲短袖曾因此 ratio 顶到 2）。
    labels = mesh_components(garment)
    names = list(result)
    stacked = np.stack([result[name] for name in names], axis=1)
    sizes = np.bincount(labels)
    largest = int(np.argmax(sizes))
    for label in np.unique(labels):
        member = labels == label
        dominant = int(np.argmax(stacked[member].mean(axis=0)))
        # 主体（最大连通块）可以跨部件，只有几乎全属一个部件时才整块归；其余分开的块（甲片、单缝的袖管）一律整块归主导部件。
        if label != largest or np.mean(stacked[member, dominant] >= 0.5) >= 0.85:
            stacked[member] = 0.0; stacked[member, dominant] = 1.0
    return {name: stacked[:, index] for index, name in enumerate(names)}


def mesh_components(garment: GarmentModel) -> np.ndarray:
    """衣物网格（焊接后）连通块号，逐顶点。"""
    return component_labels(garment.faces, garment.weld)
