"""切片贴合（ADR 0002）几何：平面切片、2D 射线、凸包、网格包络与单调轴映射。"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Sequence

try:
    from .slice_fit_base import (SliceFitError, _unit)
except ImportError:
    from slice_fit_base import (SliceFitError, _unit)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from scipy.interpolate import PchipInterpolator  # noqa: E402
from scipy.ndimage import gaussian_filter, gaussian_filter1d  # noqa: E402
from scipy.sparse import coo_matrix  # noqa: E402
from scipy.sparse.csgraph import connected_components  # noqa: E402
from scipy.spatial import ConvexHull  # noqa: E402


@dataclass
class PlaneSection:
    """平面与三角网格的交线段：points (m, 2, 3)、所属三角 faces (m,)、焊接边键 keys (m, 2)。"""

    points: np.ndarray
    faces: np.ndarray
    keys: np.ndarray

    @property
    def empty(self) -> bool:
        return len(self.faces) == 0


def _empty_section() -> PlaneSection:
    return PlaneSection(np.zeros((0, 2, 3)), np.zeros(0, np.int64), np.zeros((0, 2), np.int64))


def section_by_plane(positions: np.ndarray, faces: np.ndarray, weld: np.ndarray, origin: Sequence[float],
                     normal: Sequence[float], face_ids: np.ndarray | None = None) -> PlaneSection:
    """平面 (origin, normal) 与指定三角的交线段（顶点恰在平面上按正侧处理）。"""
    ids = np.arange(len(faces), dtype=np.int64) if face_ids is None else np.asarray(face_ids, dtype=np.int64)
    if not len(ids):
        return _empty_section()
    tri = faces[ids]
    corners = np.asarray(positions, dtype=np.float64)[tri]
    dist = (corners - np.asarray(origin, dtype=np.float64)) @ np.asarray(normal, dtype=np.float64)
    side = dist >= 0.0
    crossing = side.any(axis=1) & ~side.all(axis=1)
    if not np.any(crossing):
        return _empty_section()
    tri, corners, dist, side, ids = tri[crossing], corners[crossing], dist[crossing], side[crossing], ids[crossing]
    points = np.zeros((len(tri), 3, 3)); keys = np.full((len(tri), 3), -1, dtype=np.int64)
    scale = int(weld.max(initial=0)) + 1
    for edge, (a, b) in enumerate(((0, 1), (1, 2), (2, 0))):
        cut = side[:, a] != side[:, b]
        t = dist[cut, a] / (dist[cut, a] - dist[cut, b])
        points[cut, edge] = corners[cut, a] + t[:, None] * (corners[cut, b] - corners[cut, a])
        wa, wb = weld[tri[cut, a]], weld[tri[cut, b]]
        keys[cut, edge] = np.minimum(wa, wb) * scale + np.maximum(wa, wb)
    order = np.argsort(keys < 0, axis=1, kind="stable")[:, :2]
    rows = np.arange(len(tri))[:, None]
    return PlaneSection(points[rows, order], ids, keys[rows, order])


class HorizontalSlicer:
    """按三角 y 区间排序，快速取水平面 y 的候选三角。"""

    def __init__(self, positions: np.ndarray, faces: np.ndarray, weld: np.ndarray,
                 face_mask: np.ndarray | None = None) -> None:
        self.positions = np.asarray(positions, dtype=np.float64); self.faces = faces; self.weld = weld
        ids = np.arange(len(faces)) if face_mask is None else np.flatnonzero(face_mask)
        ys = self.positions[faces[ids]][:, :, 1]
        order = np.argsort(ys.min(axis=1), kind="stable")
        self.ids = ids[order]; self.ymin = ys.min(axis=1)[order]; self.ymax = ys.max(axis=1)[order]

    def __call__(self, y: float) -> PlaneSection:
        count = int(np.searchsorted(self.ymin, y, side="right"))
        candidates = self.ids[:count][self.ymax[:count] >= y]
        return section_by_plane(self.positions, self.faces, self.weld, (0.0, y, 0.0), (0.0, 1.0, 0.0), candidates)


def section_loops(section: PlaneSection) -> tuple[int, np.ndarray]:
    """把交线段按共享网格边连成环 / 链，返回个数与每段的环号。"""
    if section.empty:
        return 0, np.zeros(0, dtype=np.int64)
    unique, inverse = np.unique(section.keys.reshape(-1), return_inverse=True)
    inverse = inverse.reshape(-1, 2)
    graph = coo_matrix((np.ones(len(inverse)), (inverse[:, 0], inverse[:, 1])), shape=(len(unique), len(unique)))
    count, labels = connected_components(graph, directed=False)
    return int(count), labels[inverse[:, 0]]


def ray_hits_2d(segments: np.ndarray, center: np.ndarray, angles: np.ndarray, *,
                mode: str = "min") -> tuple[np.ndarray, np.ndarray]:
    """从 center 沿各角度射线与 2D 线段求交，返回最近（或最远）正向交点半径与线段号；无交点为 nan / -1。"""
    radii = np.full(len(angles), np.nan); which = np.full(len(angles), -1, dtype=np.int64)
    segments = np.asarray(segments, dtype=np.float64)
    if not len(segments):
        return radii, which
    direction = np.stack((np.cos(angles), np.sin(angles)), axis=1)
    start = segments[:, 0] - np.asarray(center, dtype=np.float64); edge = segments[:, 1] - segments[:, 0]
    best = np.full(len(angles), np.inf if mode == "min" else -np.inf)
    for begin in range(0, len(segments), 4096):
        p = start[begin:begin + 4096]; e = edge[begin:begin + 4096]
        denom = e[None, :, 0] * direction[:, None, 1] - e[None, :, 1] * direction[:, None, 0]
        numer = -(p[None, :, 0] * direction[:, None, 1] - p[None, :, 1] * direction[:, None, 0])
        with np.errstate(divide="ignore", invalid="ignore"):
            lam = numer / denom
            reach = ((p[None, :, 0] + lam * e[None, :, 0]) * direction[:, None, 0]
                     + (p[None, :, 1] + lam * e[None, :, 1]) * direction[:, None, 1])
        valid = (np.abs(denom) > 1e-18) & (lam >= -1e-12) & (lam <= 1.0 + 1e-12) & (reach > 1e-9)
        if mode == "min":
            values = np.where(valid, reach, np.inf); pick = np.argmin(values, axis=1)
            chosen = values[np.arange(len(angles)), pick]; better = chosen < best
        else:
            values = np.where(valid, reach, -np.inf); pick = np.argmax(values, axis=1)
            chosen = values[np.arange(len(angles)), pick]; better = chosen > best
        best[better] = chosen[better]; which[better] = pick[better] + begin
    found = np.isfinite(best)
    radii[found] = best[found]
    return radii, which


@dataclass
class HullProfile:
    centroid: np.ndarray          # 面积质心（凸多边形内必在内部）
    ring: np.ndarray              # 逆时针凸包顶点
    radius: np.ndarray | None = None
    cos_beta: np.ndarray | None = None


def convex_hull_2d(points: np.ndarray) -> HullProfile | None:
    """2D 凸包与面积质心；点不足或退化时返回 None。"""
    points = np.asarray(points, dtype=np.float64).reshape(-1, 2)
    points = points[np.all(np.isfinite(points), axis=1)]
    if len(points) < 3 or np.ptp(points[:, 0]) < 1e-9 or np.ptp(points[:, 1]) < 1e-9:
        return None
    try:
        hull = ConvexHull(points)
    except Exception:  # noqa: BLE001 - Qhull 退化输入
        return None
    ring = points[hull.vertices]
    nxt = np.roll(ring, -1, axis=0)
    cross = ring[:, 0] * nxt[:, 1] - nxt[:, 0] * ring[:, 1]
    area = 0.5 * cross.sum()
    if abs(area) < 1e-14:
        return None
    centroid = np.array([((ring[:, 0] + nxt[:, 0]) * cross).sum(), ((ring[:, 1] + nxt[:, 1]) * cross).sum()]) / (6.0 * area)
    return HullProfile(centroid, ring)


def hull_rays(profile: HullProfile, center: np.ndarray, angles: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """凸包射线半径与"径向 · 外法向"余弦（径向偏移换算成法向偏移用）。"""
    ring = profile.ring
    segments = np.stack((ring, np.roll(ring, -1, axis=0)), axis=1)
    radius, which = ray_hits_2d(segments, center, angles)
    edge = segments[:, 1] - segments[:, 0]
    normals = _unit(np.stack((edge[:, 1], -edge[:, 0]), axis=1))   # 逆时针多边形的外法向
    direction = np.stack((np.cos(angles), np.sin(angles)), axis=1)
    cos_beta = np.full(len(angles), np.nan)
    ok = which >= 0
    cos_beta[ok] = np.einsum("ij,ij->i", normals[which[ok]], direction[ok])
    return radius, cos_beta


def fill_grid(values: np.ndarray, mask: np.ndarray) -> np.ndarray:
    """角向周期线性插值补空格，再沿轴向插值补空行。"""
    out = np.array(values, dtype=np.float64)
    rows, count = out.shape
    columns = np.arange(count)
    row_ok = mask.any(axis=1)
    if not row_ok.any():
        return np.zeros_like(out)
    for row in np.flatnonzero(row_ok):
        known = np.flatnonzero(mask[row])
        if len(known) == count:
            continue
        xp = np.concatenate((known - count, known, known + count)); fp = np.tile(out[row, known], 3)
        out[row] = np.interp(columns, xp, fp)
    good = np.flatnonzero(row_ok)
    if len(good) < rows:
        for column in range(count):
            out[:, column] = np.interp(np.arange(rows), good, out[good, column])
    return out


def upper_envelope(raw: np.ndarray, mask: np.ndarray, sigma_rows: float, sigma_cols: float,
                   iterations: int) -> np.ndarray:
    """平滑且在 mask 上不低于 raw 的包络（反复"高斯平滑 → 与所需值取大"）。"""
    envelope = fill_grid(raw, mask)
    for _ in range(max(1, iterations)):
        smooth = gaussian_filter(envelope, sigma=(max(sigma_rows, 1e-6), max(sigma_cols, 1e-6)),
                                 mode=("nearest", "wrap"))
        envelope = np.where(mask, np.maximum(raw, smooth), smooth)
    return envelope


def lipschitz_envelope(values: np.ndarray, valid: np.ndarray, coords: np.ndarray, slope: float) -> np.ndarray:
    """不低于 values、斜率不超过 slope 的最小函数；slope ≤ 0 时为常数（全局最大）。"""
    values = np.asarray(values, dtype=np.float64); coords = np.asarray(coords, dtype=np.float64)
    good = np.asarray(valid, dtype=bool) & np.isfinite(values)
    if not good.any():
        return np.ones_like(values)
    if slope <= 0.0:
        return np.full_like(values, float(values[good].max()))
    return np.max(values[good][None, :] - slope * np.abs(coords[:, None] - coords[good][None, :]), axis=1)


def normalized_smooth(values: np.ndarray, valid: np.ndarray, sigma: float) -> np.ndarray:
    """只用有效样本的归一化高斯平滑；无效处由邻近有效值外推。"""
    values = np.asarray(values, dtype=np.float64)
    good = np.asarray(valid, dtype=bool) & np.all(np.isfinite(values.reshape(len(values), -1)), axis=1)
    if not good.any():
        return np.zeros_like(values)
    flat = values.reshape(len(values), -1).copy(); flat[~good] = 0.0
    weight = good.astype(np.float64)
    if sigma > 0:
        numerator = gaussian_filter1d(flat, sigma, axis=0, mode="nearest")
        denominator = gaussian_filter1d(weight, sigma, mode="nearest")
    else:
        numerator, denominator = flat, weight
    out = np.divide(numerator, denominator[:, None], out=np.zeros_like(numerator),
                    where=denominator[:, None] > 1e-6)
    known = np.flatnonzero(denominator > 1e-6)
    for column in range(out.shape[1]):
        out[:, column] = np.interp(np.arange(len(out)), known, out[known, column])
    return out.reshape(values.shape)


@dataclass
class AxisMap:
    """单调一维映射：衣物沿轴坐标 → 素体沿轴坐标；标注范围外按端点斜率线性外推。

    required 里的对（衣缘锚点）必须保留；其余对与它们冲突时丢弃（写诊断）。unit_extrapolation：标注范围外按斜率 1
    平移（锚点之外的垂带、领座随锚点走，不按躯干斜率缩放）。"""

    pairs: list[tuple[str, float, float]]
    linear_only: bool = False
    required: Sequence[str] = ()
    unit_extrapolation: bool = False
    dropped: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        pairs = sorted(((str(n), float(a), float(b)) for n, a, b in self.pairs), key=lambda item: item[1])
        if not pairs:
            raise SliceFitError("竖直对齐至少需要一对同名标注")
        must = {i for i, pair in enumerate(pairs) if pair[0] in set(self.required)}
        # 取含全部必经对、素体坐标也严格递增的最长子序列，其余视为标注冲突丢弃（写诊断）。
        best: list[int] = []
        count = len(pairs)
        for mask in range(1, 1 << count):
            chosen = [i for i in range(count) if mask >> i & 1]
            if not must <= set(chosen):
                continue
            gs = [pairs[i][1] for i in chosen]; bs = [pairs[i][2] for i in chosen]
            if all(b2 - b1 > 1e-9 and g2 - g1 > 1e-9 for g1, g2, b1, b2 in zip(gs, gs[1:], bs, bs[1:])):
                if len(chosen) > len(best):
                    best = chosen
        if not best:
            raise SliceFitError(f"必经锚点 {sorted(self.required)} 自身不单调（衣物高 / 素体目标次序相反）")
        self.dropped = [pairs[i][0] for i in range(count) if i not in best]
        pairs = [pairs[i] for i in best]
        if self.linear_only and len(pairs) > 2:
            # 一段线性：两端优先取必经对（只有一个必经对时配另一端）。
            keep = [pair for pair in pairs if pair[0] in set(self.required)]
            if len(keep) >= 2:
                pairs = [keep[0], keep[-1]]
            elif keep:
                pairs = [pairs[0], keep[0]] if keep[0] is not pairs[0] else [keep[0], pairs[-1]]
            else:
                pairs = [pairs[0], pairs[-1]]
        self.pairs = pairs
        self.xg = np.array([p[1] for p in pairs]); self.xb = np.array([p[2] for p in pairs])
        if len(pairs) == 1:
            self.kind = "shift"
        elif len(pairs) == 2 and not self.unit_extrapolation:
            self.kind = "linear"
        else:
            self.kind = "pchip"
            self._pchip = PchipInterpolator(self.xg, self.xb, extrapolate=False)
        if len(pairs) >= 2:
            if self.kind == "pchip":
                derivative = self._pchip.derivative()
                self.slope_lo = float(derivative(self.xg[0])); self.slope_hi = float(derivative(self.xg[-1]))
            else:
                slope = float((self.xb[-1] - self.xb[0]) / (self.xg[-1] - self.xg[0]))
                self.slope_lo = self.slope_hi = slope
        else:
            self.slope_lo = self.slope_hi = 1.0
        if self.unit_extrapolation and self.kind != "linear":
            self.slope_lo = self.slope_hi = 1.0

    def __call__(self, x: Any) -> np.ndarray:
        x = np.asarray(x, dtype=np.float64)
        if self.kind == "shift":
            return x + (self.xb[0] - self.xg[0])
        if self.kind == "linear":
            return self.xb[0] + (self.xb[-1] - self.xb[0]) / (self.xg[-1] - self.xg[0]) * (x - self.xg[0])
        out = np.empty_like(x)
        low = x < self.xg[0]; high = x > self.xg[-1]; mid = ~(low | high)
        out[mid] = self._pchip(x[mid])
        out[low] = self.xb[0] + self.slope_lo * (x[low] - self.xg[0])
        out[high] = self.xb[-1] + self.slope_hi * (x[high] - self.xg[-1])
        return out

    def describe(self) -> dict[str, Any]:
        return {"kind": self.kind, "pairs": [{"level": n, "garmentMu": g, "bodyMu": b} for n, g, b in self.pairs],
                "required": list(self.required), "dropped": self.dropped, "endSlopes": [self.slope_lo, self.slope_hi]}


def limb_frame(axis: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """肢体轴的横截面基 (u, v)：u = 前向（+Z）去掉轴向分量，v = 轴 × u。"""
    front = np.array([0.0, 0.0, 1.0])
    u = front - (front @ axis) * axis
    if np.linalg.norm(u) < 1e-6:
        u = np.array([1.0, 0.0, 0.0]) - axis[0] * axis
    u = u / np.linalg.norm(u); v = np.cross(axis, u)
    return u, v
