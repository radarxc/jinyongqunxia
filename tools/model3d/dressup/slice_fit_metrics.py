"""切片贴合（ADR 0002）诊断量：厚度 / 层距、边长与翻面、表面距离。"""
from __future__ import annotations

from typing import Any

try:
    from .slice_fit_base import (mu_to_mm, weld_ids, welded_normals)
except ImportError:
    from slice_fit_base import (mu_to_mm, weld_ids, welded_normals)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from scipy.spatial import cKDTree  # noqa: E402

try:
    from .fit_garment import (SurfaceIndex)
except ImportError:
    from fit_garment import (SurfaceIndex)  # type: ignore[no-redef]


def inward_thickness(positions: np.ndarray, faces: np.ndarray, weld: np.ndarray, max_mu: float,
                     normals: np.ndarray | None = None) -> np.ndarray:
    """沿顶点内法向射线打到同一网格另一层的距离（壳厚 / 层距）；单层处为 nan。"""
    positions = np.asarray(positions, dtype=np.float64)
    normals = welded_normals(positions, faces, weld) if normals is None else normals
    tri = positions[faces]; centers = tri.mean(axis=1)
    radius = float(np.linalg.norm(tri - centers[:, None, :], axis=2).max(initial=0.0))
    tree = cKDTree(centers)
    result = np.full(len(positions), np.nan)
    origins = positions - normals * 1e-7; directions = -normals
    mid = positions - normals * (0.5 * max_mu)
    lists = tree.query_ball_point(mid, 0.5 * max_mu + radius, workers=-1)
    counts = np.fromiter((len(row) for row in lists), dtype=np.int64, count=len(lists))
    owners_all = np.repeat(np.arange(len(positions)), counts)
    faces_all = np.concatenate([np.asarray(row, dtype=np.int64) for row in lists]) if counts.sum() else np.zeros(0, np.int64)
    best = np.full(len(positions), np.inf)
    minimum = 2e-4
    for begin in range(0, len(owners_all), 2_000_000):
        owners = owners_all[begin:begin + 2_000_000]; ids = faces_all[begin:begin + 2_000_000]
        v0, v1, v2 = tri[ids, 0], tri[ids, 1], tri[ids, 2]
        e1 = v1 - v0; e2 = v2 - v0; d = directions[owners]
        h = np.cross(d, e2); a = np.einsum("ij,ij->i", e1, h)
        ok = np.abs(a) > 1e-14
        f = np.divide(1.0, a, out=np.zeros_like(a), where=ok)
        s = origins[owners] - v0
        u = f * np.einsum("ij,ij->i", s, h)
        q = np.cross(s, e1)
        v = f * np.einsum("ij,ij->i", d, q)
        t = f * np.einsum("ij,ij->i", e2, q)
        hit = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > minimum) & (t <= max_mu)
        if np.any(hit):
            np.minimum.at(best, owners[hit], t[hit])
    found = np.isfinite(best)
    result[found] = best[found]
    return result


def distortion_stats(before: np.ndarray, after: np.ndarray, faces: np.ndarray, weld: np.ndarray) -> dict[str, Any]:
    """边长比（焊接后的唯一边）、validate 口径的边长合格率与翻面数。"""
    welded = weld[faces]
    edges = np.sort(np.concatenate((welded[:, [0, 1]], welded[:, [1, 2]], welded[:, [2, 0]])), axis=1)
    edges = np.unique(edges[edges[:, 0] != edges[:, 1]], axis=0)
    count = int(weld.max()) + 1
    rep_before = np.zeros((count, 3)); rep_after = np.zeros((count, 3))
    rep_before[weld] = before; rep_after[weld] = after
    old = np.linalg.norm(rep_before[edges[:, 1]] - rep_before[edges[:, 0]], axis=1)
    new = np.linalg.norm(rep_after[edges[:, 1]] - rep_after[edges[:, 0]], axis=1)
    good = old > 1e-12
    ratio = new[good] / old[good]
    median = float(np.median(ratio))
    old_t = before[faces]; new_t = after[faces]
    old_n = np.cross(old_t[:, 1] - old_t[:, 0], old_t[:, 2] - old_t[:, 0])
    new_n = np.cross(new_t[:, 1] - new_t[:, 0], new_t[:, 2] - new_t[:, 0])
    nonzero = np.linalg.norm(old_n, axis=1) > 0
    flipped = int(np.count_nonzero(nonzero & (np.einsum("ij,ij->i", old_n, new_n) < 0)))
    old_e = np.linalg.norm(old_t[:, [1, 2, 0]] - old_t[:, [0, 1, 2]], axis=2)
    new_e = np.linalg.norm(new_t[:, [1, 2, 0]] - new_t[:, [0, 1, 2]], axis=2)
    tri_ratio = np.divide(new_e, old_e, out=np.ones_like(new_e), where=old_e > 0)
    within = nonzero & np.all((tri_ratio >= 0.7) & (tri_ratio <= 1.4), axis=1)
    within_scaled = nonzero & np.all((tri_ratio / median >= 0.7) & (tri_ratio / median <= 1.4), axis=1)
    return {"edgeRatio": {"p1": float(np.quantile(ratio, 0.01)), "p50": median, "p99": float(np.quantile(ratio, 0.99)),
                          "min": float(ratio.min()), "max": float(ratio.max())},
            "stretchWithinRatio": float(within.sum() / max(1, nonzero.sum())),
            "stretchWithinRatioScaleFree": float(within_scaled.sum() / max(1, nonzero.sum())),
            "flippedTriangles": flipped, "edges": int(len(ratio))}


def thickness_stats(before: np.ndarray, after: np.ndarray, m_per_mu: float) -> dict[str, Any]:
    both = np.isfinite(before) & np.isfinite(after)
    if not both.any():
        return {"pairs": 0}
    delta = mu_to_mm(after[both] - before[both], m_per_mu)
    ratio = after[both] / before[both]
    return {"pairs": int(both.sum()), "beforeP50Mm": float(mu_to_mm(np.median(before[both]), m_per_mu)),
            "deltaP50Mm": float(np.median(delta)), "absDeltaP95Mm": float(np.quantile(np.abs(delta), 0.95)),
            "absDeltaMaxMm": float(np.abs(delta).max()), "ratioP50": float(np.median(ratio)),
            "ratioP5": float(np.quantile(ratio, 0.05)), "ratioP95": float(np.quantile(ratio, 0.95))}


def surface_distance_mm(points: np.ndarray, positions: np.ndarray, faces: np.ndarray, m_per_mu: float) -> dict[str, Any]:
    normals = welded_normals(positions, faces, weld_ids(positions))
    surface = SurfaceIndex(positions, faces, normals, k=16)
    _, _, _, distances = surface.query(np.asarray(points, dtype=np.float64))
    mm = mu_to_mm(distances, m_per_mu)
    return {"p50Mm": float(np.quantile(mm, 0.5)), "p90Mm": float(np.quantile(mm, 0.9)),
            "p99Mm": float(np.quantile(mm, 0.99)), "maxMm": float(mm.max())}
