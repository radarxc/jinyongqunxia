"""切片贴合（ADR 0002）径向场：每个部件"弹性 / 非弹性切面"的（沿轴 × 角度）网格。"""
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any, Sequence

try:
    from .slice_fit_base import (SliceFitError, mm_to_mu, mu_to_mm)
except ImportError:
    from slice_fit_base import (SliceFitError, mm_to_mu, mu_to_mm)  # type: ignore[no-redef]

import numpy as np  # noqa: E402

try:
    from .slice_fit_geometry import (convex_hull_2d, fill_grid, hull_rays, lipschitz_envelope, normalized_smooth, ray_hits_2d, upper_envelope)
except ImportError:
    from slice_fit_geometry import (convex_hull_2d, fill_grid, hull_rays, lipschitz_envelope, normalized_smooth, ray_hits_2d, upper_envelope)  # type: ignore[no-redef]


@dataclass
class SliceParams:
    """切片贴合参数；毫米量在内部按 mPerMu 换成 mu。"""

    slice_mm: float = 4.0              # 切片间距（沿部件轴）
    angles: int = 144                  # 每片角度数（2.5°）
    sigma_theta_deg: float = 8.0       # 弹性位移场角向平滑
    sigma_axial_mm: float = 12.0       # 弹性位移场沿轴平滑
    envelope_iters: int = 3            # 上包络平滑迭代下限（非接触区等效核 ≈ σ·√n）
    fold_mm: float | None = None       # 褶皱保留尺度；None 取衣物标注 foldMm（缺省 0 = 作者字面"完全贴身"）
    ratio_slope_per_mm: float = 0.01   # 非弹性 ratio 沿高度的斜率上限（× r，每毫米；即 0.1·r /cm）；r = 0 时为常数
    center_sigma_mm: float = 30.0      # 中心差沿轴平滑（刚体件取常数）
    body_center_sigma_mm: float = 10.0  # 素体截面中心沿轴平滑
    coverage_min: float = 0.6          # 参与求中心差的衣物切片最少角度覆盖
    part_smooth_iters: int = 12        # 部件权重在衣物网格上的平滑轮数
    max_clearance_factor: float = 4.0  # 倾斜体表上水平间隙最多放大到法向间隙的倍数
    cap_tilt_deg: float = 56.309932474  # 体表偏离竖直超过此角（tan = 1.5；肩顶 / 胸上坡）的格不参与非弹性 ratio
    rigid_bump_max: float = 1.15       # 刚体件按 3D 复核整件放大的总上限
    residual_push: bool = True         # 3D 残余外推（只推不拉）
    residual_rounds: int = 8
    relax_cycles: int = 3              # 翻面 / 超拉伸三角邻域的位移局部平滑 + 再外推，最多轮数（0 关闭）
    relax_rings: int = 2
    relax_iters: int = 16

    def record(self) -> dict[str, Any]:
        """诊断 JSON 用：数值字段带单位后缀（Mm / Deg），其余为无量纲比例或计数。"""
        return {"sliceMm": self.slice_mm, "angles": self.angles, "sigmaThetaDeg": self.sigma_theta_deg,
                "sigmaAxialMm": self.sigma_axial_mm, "envelopeIters": self.envelope_iters, "foldMm": self.fold_mm,
                "ratioSlopePerMm": self.ratio_slope_per_mm, "centerSigmaMm": self.center_sigma_mm,
                "bodyCenterSigmaMm": self.body_center_sigma_mm, "coverageMin": self.coverage_min,
                "partSmoothIters": self.part_smooth_iters, "maxClearanceFactor": self.max_clearance_factor,
                "capTiltDeg": self.cap_tilt_deg, "rigidBumpMax": self.rigid_bump_max,
                "residualPush": self.residual_push, "residualRounds": self.residual_rounds,
                "relaxCycles": self.relax_cycles, "relaxRings": self.relax_rings, "relaxIters": self.relax_iters}


@dataclass
class RadialField:
    """一个部件的切片场：沿轴 K 片 × A 个角度。"""

    name: str
    coords_g: np.ndarray
    coords_b: np.ndarray
    angles: np.ndarray
    center_b: np.ndarray
    offset: np.ndarray
    rho_in: np.ndarray
    body_r: np.ndarray
    target: np.ndarray
    delta_raw: np.ndarray
    delta: np.ndarray
    ratio_raw: np.ndarray
    ratio: np.ndarray
    coverage: np.ndarray
    stats: dict[str, Any]

    @property
    def spacing(self) -> float:
        return float(self.coords_g[1] - self.coords_g[0]) if len(self.coords_g) > 1 else 1.0

    def center_g(self) -> np.ndarray:
        return self.center_b - self.offset

    ratio_scale: float = 1.0

    def sample(self, coord_g: np.ndarray, local2: np.ndarray, r: float) -> dict[str, np.ndarray]:
        """逐顶点：衣物沿轴坐标与 2D 偏移 → 三种半径（原 / 弹性 / 非弹性）与素体侧中心。"""
        count = len(self.coords_g)
        kf = np.clip((np.asarray(coord_g) - self.coords_g[0]) / self.spacing, 0.0, count - 1.0)
        k0 = np.floor(kf).astype(np.int64); k1 = np.minimum(k0 + 1, count - 1); wk = kf - k0
        center_g = self.center_g(); center_b = self.center_b
        cg = center_g[k0] * (1 - wk)[:, None] + center_g[k1] * wk[:, None]
        cb = center_b[k0] * (1 - wk)[:, None] + center_b[k1] * wk[:, None]
        q = np.asarray(local2, dtype=np.float64) - cg
        rho = np.linalg.norm(q, axis=1); theta = np.arctan2(q[:, 1], q[:, 0])
        bins = len(self.angles); step = 2.0 * math.pi / bins
        jf = np.mod((theta - self.angles[0]) / step, bins)
        j0 = np.floor(jf).astype(np.int64) % bins; j1 = (j0 + 1) % bins; wj = jf - np.floor(jf)
        delta = ((self.delta[k0, j0] * (1 - wj) + self.delta[k0, j1] * wj) * (1 - wk)
                 + (self.delta[k1, j0] * (1 - wj) + self.delta[k1, j1] * wj) * wk)
        ratio = (self.ratio[k0] * (1 - wk) + self.ratio[k1] * wk) * self.ratio_scale
        return {"rho": rho, "theta": theta, "rhoElastic": rho + delta, "rhoInelastic": ratio * rho,
                "centerB": cb, "delta": delta, "ratio": ratio}


def build_radial_field(name: str, garment_sections: Sequence[np.ndarray], body_sections: Sequence[np.ndarray],
                       coords_g: np.ndarray, coords_b: np.ndarray, *, params: SliceParams, r: float, rigid: bool,
                       clearance_mu: float, m_per_mu: float, offset_hint: np.ndarray | None = None,
                       body_min_fraction: float = 0.0) -> RadialField:
    """作者切面流程（按角度匹配的修正版）：

    garment_sections[k] 为衣物第 k 片的 2D 线段 (m, 2, 2)，body_sections[k] 为对应素体片的 2D 点云。
    """
    count = len(coords_g); bins = int(params.angles)
    angles = np.arange(bins) * (2.0 * math.pi / bins)
    spacing = float(coords_g[1] - coords_g[0]) if count > 1 else 1.0
    # 1. 素体凸包与面积质心
    hulls = [convex_hull_2d(points) if len(points) >= 3 else None for points in body_sections]
    if body_min_fraction > 0.0:
        # 四肢部件：靠近肩关节的切面只截到一小段带臂权重的皮肤（半径远小于上臂），这是"盖顶"不是截面，
        # 不作约束（由相邻有效片插补，3D 复核兜底）。
        sizes = np.array([np.median(np.linalg.norm(h.ring - h.centroid, axis=1)) if h is not None else np.nan
                          for h in hulls])
        if np.isfinite(sizes).any():
            typical = float(np.nanmedian(sizes))
            hulls = [h if h is not None and sizes[i] >= body_min_fraction * typical else None
                     for i, h in enumerate(hulls)]
    body_valid = np.array([hull is not None for hull in hulls])
    if not body_valid.any():
        raise SliceFitError(f"{name}：衣物覆盖范围内没有素体截面")
    raw_center_b = np.array([hull.centroid if hull is not None else (np.nan, np.nan) for hull in hulls])
    center_b = normalized_smooth(raw_center_b, body_valid, mm_to_mu(params.body_center_sigma_mm, m_per_mu) / spacing)
    # 2. 衣物中心：每片包围盒中心；覆盖率必须绕"素体对齐后的中心"量（绕衣片自身中心量时，一条垂下的腰带尾
    #    也是 100% 覆盖，会被当成整件衣服撑到臀围那么大）。先取全部有衣片切片的中心差中位数作初值，再按覆盖率
    #    重选有效片、重算，有效片的中心差沿轴平滑（刚体件取覆盖率加权常数），无效片由邻近有效片外推。
    raw_center_g = np.full((count, 2), np.nan)
    for k, segments in enumerate(garment_sections):
        if len(segments):
            points = segments.reshape(-1, 2)
            raw_center_g[k] = 0.5 * (points.min(axis=0) + points.max(axis=0))
    has = np.isfinite(raw_center_g[:, 0]) & body_valid
    if not has.any():
        raise SliceFitError(f"{name}：衣物没有可用切片")
    offset_raw = center_b - raw_center_g
    guess = np.median(offset_raw[has], axis=0) if offset_hint is None else np.asarray(offset_hint, dtype=np.float64)
    coverage = np.zeros(count)

    def measure_coverage(offset_rows: np.ndarray) -> None:
        for k in np.flatnonzero(has):
            hits, _ = ray_hits_2d(garment_sections[k], center_b[k] - offset_rows[k], angles)
            coverage[k] = float(np.mean(np.isfinite(hits)))

    measure_coverage(np.repeat(guess[None, :], count, axis=0))
    centered = has & (coverage >= params.coverage_min)
    if centered.sum() >= 3:
        guess = np.median(offset_raw[centered], axis=0)
        measure_coverage(np.repeat(guess[None, :], count, axis=0))
        centered = has & (coverage >= params.coverage_min)
    if not centered.any():
        centered = has
    if rigid:
        weights = np.maximum(coverage[centered], 1e-3)
        offset = np.repeat(((offset_raw[centered] * weights[:, None]).sum(axis=0) / weights.sum())[None, :], count, axis=0)
    else:
        offset = normalized_smooth(offset_raw, centered, mm_to_mu(params.center_sigma_mm, m_per_mu) / spacing)
    center_g = center_b - offset
    # 3. 射线：衣物取最内层，素体取凸包
    rho_in = np.full((count, bins), np.nan); body_r = np.full((count, bins), np.nan)
    cos_beta = np.full((count, bins), np.nan)
    for k in range(count):
        if len(garment_sections[k]):
            rho_in[k], _ = ray_hits_2d(garment_sections[k], center_g[k], angles, mode="min")
        if hulls[k] is not None:
            body_r[k], cos_beta[k] = hull_rays(hulls[k], center_b[k], angles)
    # 4. 体表倾角：水平间隙 = 法向间隙 × √(1 + s²) / cosβ（夹在 [1, max_factor] 倍）
    filled_r = fill_grid(np.nan_to_num(body_r), np.isfinite(body_r))
    slope = np.gradient(filled_r, coords_b, axis=0) if count > 1 else np.zeros_like(filled_r)
    cos_b = np.clip(np.nan_to_num(cos_beta, nan=1.0), 0.25, 1.0)
    tilt = np.abs(slope * cos_b)
    factor = np.sqrt(1.0 + tilt ** 2) / cos_b
    factor = np.clip(factor, 1.0, params.max_clearance_factor)
    target = body_r + clearance_mu * factor
    mask = np.isfinite(rho_in) & np.isfinite(target)
    delta_raw = np.where(mask, target - rho_in, np.nan)
    sigma_rows = mm_to_mu(params.sigma_axial_mm, m_per_mu) / spacing
    sigma_cols = math.radians(params.sigma_theta_deg) / (2.0 * math.pi / bins)
    delta = upper_envelope(np.nan_to_num(delta_raw), mask, sigma_rows, sigma_cols, params.envelope_iters)
    # 5. 非弹性：逐片最小 ratio → 沿高度 Lipschitz 上包络（斜率 ∝ r；刚体为常数）
    # 近水平体表（盖顶）上"水平放大多少才在体外"没有意义（差一点高度就差很多半径），这些格不参与 ratio，
    # 留给 3D 复核；否则肩坡一片的尖峰会被 Lipschitz 上包络带到腋下，把甲衣两侧撑进手臂。
    ratio_mask = mask & (tilt <= math.tan(math.radians(params.cap_tilt_deg)))
    with np.errstate(divide="ignore", invalid="ignore"):
        ratio_cells = np.where(ratio_mask, target / rho_in, np.nan)
    row_ok = ratio_mask.any(axis=1)
    ratio_raw = np.full(count, np.nan)
    ratio_raw[row_ok] = np.nanmax(ratio_cells[row_ok], axis=1)
    ratio_raw = np.clip(ratio_raw, 0.5, 2.0)
    slope_per_mu = 0.0 if rigid else params.ratio_slope_per_mm * max(r, 0.0) * 1000.0 * m_per_mu
    ratio = lipschitz_envelope(ratio_raw, row_ok, coords_g, slope_per_mu)
    argmax = (np.unravel_index(int(np.nanargmax(np.where(ratio_mask, ratio_cells, -np.inf))), mask.shape)
              if ratio_mask.any() else (0, 0))
    stats = {
        "slices": count, "angles": bins, "spacingMu": spacing, "coverageMean": float(coverage.mean()),
        "maskedFraction": float(mask.mean()), "bodySlices": int(body_valid.sum()),
        "centerSlices": int(centered.sum()),
        "offset": {"meanMm": mu_to_mm(offset.mean(axis=0), m_per_mu).tolist(),
                   "rangeMm": mu_to_mm(np.ptp(offset, axis=0), m_per_mu).tolist()},
        "elasticDelta": {"minMm": float(mu_to_mm(np.nanmin(delta_raw), m_per_mu)) if mask.any() else None,
                         "maxMm": float(mu_to_mm(np.nanmax(delta_raw), m_per_mu)) if mask.any() else None,
                         "envelopeLiftP90Mm": float(mu_to_mm(np.quantile((delta - np.nan_to_num(delta_raw))[mask], 0.9), m_per_mu)) if mask.any() else None},
        "ratio": {"rawMin": float(np.nanmin(ratio_raw)) if row_ok.any() else None,
                  "rawMax": float(np.nanmax(ratio_raw)) if row_ok.any() else None,
                  "min": float(ratio.min()), "max": float(ratio.max()), "slopePerMm": slope_per_mu * 0.001 / m_per_mu,
                  "tightestSlice": int(argmax[0]), "tightestAngleDeg": float(math.degrees(angles[argmax[1]]))},
        "capCellsExcludedFromRatio": int(np.count_nonzero(mask & ~ratio_mask)),
        "clearanceFactor": {"p50": float(np.quantile(factor[mask], 0.5)) if mask.any() else None,
                            "max": float(factor[mask].max()) if mask.any() else None},
    }
    return RadialField(name, np.asarray(coords_g, dtype=np.float64), np.asarray(coords_b, dtype=np.float64), angles,
                       center_b, offset, rho_in, body_r, target, delta_raw, delta, ratio_raw, ratio, coverage, stats)
