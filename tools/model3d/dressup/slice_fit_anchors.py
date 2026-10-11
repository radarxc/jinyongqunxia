"""切片贴合（ADR 0002）衣缘锚点：领口 / 下摆 / 袖口的源位置从衣物自身几何量出，目标按设计体标注选，
竖直与袖轴映射以锚点为必经点，变换后在结果几何上按同一方法复量落点（核验）。

- 领口 / 下摆以后中为准（服装"后中长"口径）：绕衣物竖直轴（全部顶点 x、z 的中位数）取后中 ±45° 扇区，每 2.5°
  方位格取最高点（领口上沿）/ 最低点（下摆下沿），锚点 = 各格中位数。前片造型（交领 V 口、前襟、腰带垂尾）与两袖
  不进扇区；Tripo 件下摆内折，开口边在可见下沿之上，不当衣缘。
- 袖口：绕设计臂弦（肩 → 最远臂点）每 10° 方位格取袖口附近顶点沿轴最远点，锚点 = 各格中位数。袖口附近 = 开口件
  离设计最远臂点最近的开口环质心 2 倍环半径内的顶点；闭合壳件离设计臂弦最近的独立连通块（非主体）。
- 目标：设计体标注面（袖口为臂点）里离锚点最近且差 ≤ 10 mm 的那面；都更远时取夹住锚点的上下两面按比例 t。
- 映射：两锚点（袖为肩点 + 袖口锚点）必经；弹性件另取锚点之间、离锚点 ≥ 40 mm 的设计体标注面作中间对应，
  锚点之外（腰带垂尾、领座）随最近锚点平移（斜率 1）；刚体件一段线性。
- 落点：锚点由一批"衣缘点"（各方位格的最高 / 最低 / 最远顶点）定；变换后取同一批点的高度（袖口为沿素体臂弦位置）
  中位数与目标比。结果上重新分格取点只报（后领锯齿、袖子转角带动方位中心时会换点，不是映射误差）。
"""
from __future__ import annotations

from typing import Any

try:
    from .slice_fit_base import (ARM_POINTS, SliceFitError, _unit, component_labels, mm_to_mu, mu_to_mm)
except ImportError:
    from slice_fit_base import (ARM_POINTS, SliceFitError, _unit, component_labels, mm_to_mu, mu_to_mm)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from scipy.sparse import coo_matrix  # noqa: E402
from scipy.sparse.csgraph import connected_components  # noqa: E402

try:
    from .slice_fit_geometry import (AxisMap, limb_frame)
except ImportError:
    from slice_fit_geometry import (AxisMap, limb_frame)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]


ANCHOR_RULE = {"sectorDeg": 90.0, "binDeg": 2.5, "cuffBinDeg": 10.0, "cuffNeighborhood": 2.0,
               "toleranceMm": 10.0, "minKnotGapMm": 40.0}
EDGE_KEYS = (("collar", True), ("hem", False))


def anchor_rule(landmarks: dict[str, Any] | None = None) -> dict[str, float]:
    return {**ANCHOR_RULE, **((landmarks or {}).get("anchorRule") or {})}


def level_heights(landmarks: dict[str, Any]) -> dict[str, float]:
    return {name: float(record["yMu"] if isinstance(record, dict) else record)
            for name, record in (landmarks.get("levels") or {}).items()}


def boundary_loops(garment: GarmentModel) -> list[dict[str, Any]]:
    """衣物开口（边界环）：中心、长度、y 范围与点（焊接后）。"""
    welded = garment.weld[garment.faces]
    edges = np.sort(np.concatenate((welded[:, [0, 1]], welded[:, [1, 2]], welded[:, [2, 0]])), axis=1)
    edges = edges[edges[:, 0] != edges[:, 1]]
    unique, counts = np.unique(edges, axis=0, return_counts=True)
    boundary = unique[counts == 1]
    if not len(boundary):
        return []
    count = int(garment.weld.max()) + 1
    graph = coo_matrix((np.ones(len(boundary)), (boundary[:, 0], boundary[:, 1])), shape=(count, count))
    _, labels = connected_components(graph, directed=False)
    representative = np.zeros((count, 3)); representative[garment.weld] = garment.positions
    loops = []
    for label in np.unique(labels[boundary[:, 0]]):
        member = boundary[labels[boundary[:, 0]] == label]
        points = representative[np.unique(member)]
        length = float(np.linalg.norm(representative[member[:, 0]] - representative[member[:, 1]], axis=1).sum())
        loops.append({"centerMu": points.mean(axis=0), "lengthMu": length, "yMinMu": float(points[:, 1].min()),
                      "yMaxMu": float(points[:, 1].max()), "points": points})
    return sorted(loops, key=lambda item: -item["lengthMu"])


def _extreme_per_bin(values: np.ndarray, bins: np.ndarray, count: int, upper: bool) -> np.ndarray:
    """每格取最大（upper）/ 最小值所在的下标（空格跳过）。"""
    picks = []
    for index in range(count):
        member = np.flatnonzero(bins == index)
        if len(member):
            picks.append(int(member[np.argmax(values[member])] if upper else member[np.argmin(values[member])]))
    return np.asarray(picks, dtype=np.int64)


def edge_anchor(positions: np.ndarray, *, upper: bool, rule: dict[str, float] | None = None) -> dict[str, Any]:
    """后中扇区逐方位格取最高点（领口）/ 最低点（下摆）为衣缘点，锚点 = 衣缘点高度中位数；picks 为衣缘点顶点号。"""
    rule = rule or ANCHOR_RULE
    points = np.asarray(positions, dtype=np.float64)
    center = np.array([float(np.median(points[:, 0])), float(np.median(points[:, 2]))])
    azimuth = np.degrees(np.arctan2(points[:, 2] - center[1], points[:, 0] - center[0]))
    relative = (azimuth + 90.0 + 180.0) % 360.0 - 180.0          # 0° = 后中（−Z）
    half = 0.5 * float(rule["sectorDeg"]); width = float(rule["binDeg"])
    count = max(1, int(round(2.0 * half / width)))
    inside = np.flatnonzero(np.abs(relative) < half)
    bins = np.clip(((relative[inside] + half) / width).astype(np.int64), 0, count - 1)
    picks = inside[_extreme_per_bin(points[inside, 1], bins, count, upper)]
    if len(picks) < max(3, count // 3):
        raise SliceFitError("后中扇区里衣物点太少，量不出领口 / 下摆锚点")
    values = points[picks, 1]
    return {"method": "backSectorUpperEnvelopeMedian" if upper else "backSectorLowerEnvelopeMedian",
            "yMu": float(np.median(values)), "p10YMu": float(np.quantile(values, 0.1)),
            "p90YMu": float(np.quantile(values, 0.9)), "bins": int(len(picks)),
            "centerMu": [float(center[0]), float(center[1])], "picks": picks}


def axial_anchor(points: np.ndarray, origin: np.ndarray, direction: np.ndarray,
                 rule: dict[str, float] | None = None) -> dict[str, Any]:
    """绕轴逐方位格取沿轴最远点为衣缘点，锚点 = 其沿轴坐标中位数（袖口远端）；picks 为 points 内下标。"""
    rule = rule or ANCHOR_RULE
    axis = _unit(np.asarray(direction, dtype=np.float64)); u, v = limb_frame(axis)
    offset = np.asarray(points, dtype=np.float64) - np.asarray(origin, dtype=np.float64)
    t = offset @ axis
    width = float(rule["cuffBinDeg"]); count = max(1, int(round(360.0 / width)))
    bins = np.clip((np.degrees(np.arctan2(offset @ v, offset @ u)) % 360.0 / width).astype(np.int64), 0, count - 1)
    picks = _extreme_per_bin(t, bins, count, True)
    if len(picks) < max(3, count // 3):
        raise SliceFitError("袖口附近点太少，量不出袖口锚点")
    values = t[picks]
    return {"method": "distalEnvelopeMedian", "tMu": float(np.median(values)), "p10TMu": float(np.quantile(values, 0.1)),
            "p90TMu": float(np.quantile(values, 0.9)), "bins": int(len(picks)), "picks": picks}


def _public(anchor: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in anchor.items() if key != "picks"}


def arm_axes(garment_axis: dict[str, Any], body_limb: dict[str, Any] | None = None) -> dict[str, Any]:
    """袖轴：衣物设计臂点（与素体臂点共有，须含 shoulder），弦 = 肩 → 腕（无腕取最远共有点）；named* 为各点沿弦坐标。"""
    garment_points = {name: np.asarray(garment_axis[f"{name}Mu"], dtype=np.float64)
                      for name in ARM_POINTS if f"{name}Mu" in garment_axis}
    body_points = None if body_limb is None else {name: np.asarray(body_limb[f"{name}Mu"], dtype=np.float64)
                                                  for name in ARM_POINTS if f"{name}Mu" in body_limb}
    names = [name for name in ARM_POINTS if name in garment_points and (body_points is None or name in body_points)]
    if len(names) < 2 or names[0] != "shoulder":
        raise SliceFitError("袖轴至少需要 shoulder 与另一臂点")
    end = "wrist" if "wrist" in names else [name for name in names if name != "hand"][-1]   # 弦 = 肩 → 腕
    p0 = garment_points["shoulder"]; a_g = _unit(garment_points[end] - p0)
    axes: dict[str, Any] = {"names": names, "p0": p0, "aG": a_g, "distalG": garment_points[end],
                            "namedG": {name: float((garment_points[name] - p0) @ a_g) for name in names}}
    if body_points is not None:
        q0 = body_points["shoulder"]; a_b = _unit(body_points[end] - q0)
        axes.update(q0=q0, aB=a_b, namedB={name: float((body_points[name] - q0) @ a_b) for name in names})
    return axes


def cuff_vertices(garment: GarmentModel, axes: dict[str, Any],
                  rule: dict[str, float] | None = None) -> tuple[np.ndarray, str] | None:
    """袖口附近顶点：开口件取袖口环邻域，闭合壳件取独立袖管连通块；都找不到返回 None（袖只用设计臂点）。"""
    rule = rule or ANCHOR_RULE
    p0, distal = axes["p0"], axes["distalG"]; length = float(np.linalg.norm(distal - p0))
    loops = boundary_loops(garment)
    if loops:
        best = min(loops, key=lambda loop: float(np.linalg.norm(loop["centerMu"] - distal)))
        if float(np.linalg.norm(best["centerMu"] - distal)) <= 0.25 * length:
            points = best["points"]; center = points.mean(axis=0)
            radius = float(np.sqrt(np.mean(np.sum((points - center) ** 2, axis=1))))
            near = np.linalg.norm(garment.positions - center, axis=1) <= float(rule["cuffNeighborhood"]) * radius
            return np.flatnonzero(near), "cuffLoopNeighborhood"
    labels = component_labels(garment.faces, garment.weld)
    sizes = np.bincount(labels)
    if len(sizes) < 2:
        return None

    def distance(label: int) -> float:
        offset = garment.positions[labels == label].mean(axis=0) - p0
        along = float(np.clip(offset @ axes["aG"], 0.0, length))
        return float(np.linalg.norm(offset - along * axes["aG"]))

    best_label = min((label for label in range(len(sizes)) if label != int(np.argmax(sizes))), key=distance)
    if distance(best_label) > 0.25 * length:
        return None
    return np.flatnonzero(labels == best_label), "sleeveComponent"


def choose_target(value: float, named: dict[str, float], tolerance: float, key: str) -> dict[str, Any]:
    """离锚点最近且差 ≤ tolerance 的标注面；都更远时取夹住锚点的上下两面与比例 t。"""
    nearest = min(named, key=lambda name: (abs(named[name] - value), name))
    if abs(named[nearest] - value) <= tolerance:
        return {key: nearest}
    below = sorted((y, name) for name, y in named.items() if y < value)
    above = sorted((y, name) for name, y in named.items() if y > value)
    if not below or not above:
        raise SliceFitError(f"锚点在设计体标注范围之外，且离最近的 {nearest} 超过容差")
    (low, name_low), (high, name_high) = below[-1], above[0]
    return {"between": [name_low, name_high], "t": float((value - low) / (high - low))}


def resolve_target(target: dict[str, Any], named: dict[str, float], key: str) -> float:
    try:
        if key in target:
            return float(named[target[key]])
        low, high = target["between"]
        return float(named[low] + float(target["t"]) * (named[high] - named[low]))
    except KeyError as error:
        raise SliceFitError(f"目标 {target} 在素体标注里找不到：{error}") from error


def garment_anchors(garment: GarmentModel, design_levels: dict[str, float], sleeves: dict[str, Any] | None,
                    m_per_mu: float, rule: dict[str, float] | None = None) -> dict[str, Any]:
    """量领口 / 下摆 / 袖口锚点并按设计体选目标（标注落盘用）。"""
    rule = rule or ANCHOR_RULE
    tolerance = mm_to_mu(rule["toleranceMm"], m_per_mu)
    out: dict[str, Any] = {"anchorRule": dict(rule), "cuffs": {}}
    for key, upper in EDGE_KEYS:
        anchor = _public(edge_anchor(garment.positions, upper=upper, rule=rule))
        target = choose_target(anchor["yMu"], design_levels, tolerance, "level")
        design = resolve_target(target, design_levels, "level")
        out[key] = {"anchor": anchor, "target": target, "designTargetYMu": design,
                    "anchorMinusDesignTargetMm": float(mu_to_mm(anchor["yMu"] - design, m_per_mu))}
    for side, sleeve in (sleeves or {}).items():
        axes = arm_axes(sleeve["axis"])
        found = cuff_vertices(garment, axes, rule)
        if found is None:
            continue
        ids, kind = found
        anchor = _public(axial_anchor(garment.positions[ids], axes["p0"], axes["aG"], rule))
        target = choose_target(anchor["tMu"], axes["namedG"], tolerance, "point")
        design = resolve_target(target, axes["namedG"], "point")
        out["cuffs"][side] = {"anchor": {**anchor, "vertexSet": kind, "vertices": int(len(ids)), "axisPoints": axes["names"]},
                              "target": target, "designTargetTMu": design,
                              "anchorMinusDesignTargetMm": float(mu_to_mm(anchor["tMu"] - design, m_per_mu))}
    return out


def vertical_map(body: BodyModel, garment: GarmentModel, rigid: bool) -> AxisMap:
    """领口 / 下摆锚点 → 素体目标（必经）；弹性件另取两锚点之间、离锚点 ≥ minKnotGapMm 的设计体标注面；刚体件一段线性。"""
    landmarks = garment.landmarks; rule = anchor_rule(landmarks)
    body_levels = level_heights(body.landmarks); design = level_heights(landmarks)
    pairs = []
    for key, _ in EDGE_KEYS:
        entry = landmarks.get(key) or {}
        if "anchor" not in entry or "target" not in entry:
            raise SliceFitError(f"衣物标注缺 {key}.anchor / {key}.target（衣缘锚点须从几何量出，见 ADR 0002 §4）")
        pairs.append((key, float(entry["anchor"]["yMu"]), resolve_target(entry["target"], body_levels, "level")))
    if not rigid:
        gap = mm_to_mu(rule["minKnotGapMm"], body.m_per_mu)
        low, high = sorted(pair[1] for pair in pairs)
        for name in landmarks.get("alignLevels") or list(design):
            if name in design and name in body_levels and low + gap <= design[name] <= high - gap:
                pairs.append((name, design[name], body_levels[name]))
    return AxisMap(pairs, linear_only=rigid, required=("collar", "hem"), unit_extrapolation=not rigid)


def arm_axis_map(garment: GarmentModel, side: str, axes: dict[str, Any], rigid: bool,
                 m_per_mu: float) -> tuple[AxisMap, dict[str, Any] | None]:
    """袖沿轴映射：设计臂点 → 素体臂点；有袖口锚点时它必经，离它 < minKnotGapMm 的臂点（肩点除外）让位。"""
    names = axes["names"]
    pairs = [(name, axes["namedG"][name], axes["namedB"][name]) for name in names]
    cuff = (((garment.landmarks.get("sleeves") or {}).get(side) or {}).get("cuff") or {})
    if "anchor" not in cuff:
        return AxisMap(pairs, linear_only=rigid), None
    if list(cuff["anchor"].get("axisPoints", names)) != list(names):
        raise SliceFitError(f"袖 {side}：袖口锚点量取时的臂点 {cuff['anchor'].get('axisPoints')} 与本次 {names} 不同")
    rule = anchor_rule(garment.landmarks); gap = mm_to_mu(rule["minKnotGapMm"], m_per_mu)
    source = float(cuff["anchor"]["tMu"]); target = resolve_target(cuff["target"], axes["namedB"], "point")
    pairs = [pair for pair in pairs if pair[0] == "shoulder" or abs(pair[1] - source) >= gap] + [("cuff", source, target)]
    found = cuff_vertices(garment, axes, rule)
    if found is None:
        raise SliceFitError(f"袖 {side}：标注有袖口锚点，但在衣物几何上找不到袖口")
    info = {"target": cuff["target"], "sourceTMu": source, "targetTMu": target, "ids": found[0]}
    return AxisMap(pairs, linear_only=rigid, required=("cuff",)), info


def landing_arms(garment: GarmentModel, body_landmarks: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """量落点用的袖信息（两套弦 + 袖口附近顶点），只取有袖口锚点的袖。"""
    arms = {}
    for side, sleeve in (garment.landmarks.get("sleeves") or {}).items():
        limb = (body_landmarks.get("limbs") or {}).get(f"arm{side}")
        if not limb or "anchor" not in (sleeve.get("cuff") or {}):
            continue
        axes = arm_axes(sleeve["axis"], limb)
        found = cuff_vertices(garment, axes, anchor_rule(garment.landmarks))
        if found is not None:
            arms[side] = {"p0": axes["p0"], "aG": axes["aG"], "q0": axes["q0"], "aB": axes["aB"], "ids": found[0]}
    return arms


def anchor_landing(positions: np.ndarray, garment: GarmentModel, arms: dict[str, dict[str, Any]],
                   rows: np.ndarray | None = None) -> dict[str, Any]:
    """同一批衣缘点（源件上按同法选出）在给定几何里的位置：领口 / 下摆取高度中位数，袖口取沿素体臂弦坐标中位数。
    rows：压紧件顶点 → 源顶点（链尾件；只用保留下来的衣缘点），None = 与源件同拓扑。"""
    rule = anchor_rule(garment.landmarks); positions = np.asarray(positions, dtype=np.float64)
    lookup = None if rows is None else {int(row): index for index, row in enumerate(np.asarray(rows).reshape(-1))}

    def kept(picks: np.ndarray) -> np.ndarray:
        if lookup is None:
            return picks
        return np.asarray([lookup[int(pick)] for pick in picks if int(pick) in lookup], dtype=np.int64)

    out: dict[str, Any] = {}
    for key, upper in EDGE_KEYS:
        picks = edge_anchor(garment.positions, upper=upper, rule=rule)["picks"]; index = kept(picks)
        out[key] = {"value": float(np.median(positions[index, 1])) if len(index) else None,
                    "points": int(len(picks)), "kept": int(len(index))}
    for side, arm in arms.items():
        picks = arm["ids"][axial_anchor(garment.positions[arm["ids"]], arm["p0"], arm["aG"], rule)["picks"]]
        index = kept(picks)
        out[f"cuff{side}"] = {"value": float(np.median((positions[index] - arm["q0"]) @ arm["aB"])) if len(index) else None,
                              "points": int(len(picks)), "kept": int(len(index))}
    return out


def anchor_report(body: BodyModel, garment: GarmentModel, vertical: AxisMap, positions: np.ndarray,
                  arms: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """锚点诊断：标注数值映射残差（源值经映射后与目标之差）与实际衣缘落点残差（同一批衣缘点变换后与目标之差）。"""
    m = body.m_per_mu; landmarks = garment.landmarks; rule = anchor_rule(landmarks)
    body_levels = level_heights(body.landmarks)
    landed = anchor_landing(positions, garment, arms)
    anchors: dict[str, Any] = {}
    for key, upper in EDGE_KEYS:
        entry = landmarks[key]; source = float(entry["anchor"]["yMu"])
        fresh = edge_anchor(garment.positions, upper=upper, rule=rule)["yMu"]
        target = resolve_target(entry["target"], body_levels, "level")
        mapped = float(vertical(np.array([source]))[0]); value = landed[key]["value"]
        resampled = edge_anchor(positions, upper=upper, rule=rule)["yMu"]
        anchors[key] = {"target": entry["target"], "sourceYMu": source, "storedMinusMeasuredMm": float(mu_to_mm(source - fresh, m)),
                        "designTargetYMu": entry.get("designTargetYMu"), "targetYMu": target,
                        "shiftMm": float(mu_to_mm(target - source, m)), "mappedYMu": mapped,
                        "mappingResidualMm": float(mu_to_mm(abs(mapped - target), m)),
                        "edgePoints": landed[key]["points"], "landedYMu": value,
                        "landingResidualMm": float(mu_to_mm(abs(value - target), m)),
                        "resampledYMu": resampled, "resampledResidualMm": float(mu_to_mm(abs(resampled - target), m))}
    pairs = [{"name": name, "garmentMu": g, "bodyMu": b, "residualMm": float(mu_to_mm(abs(float(vertical(np.array([g]))[0]) - b), m))}
             for name, g, b in vertical.pairs]
    dropped = list(vertical.dropped)
    for side, arm in arms.items():
        source = arm["sourceTMu"]; mapped = float(arm["axial"](np.array([source]))[0]); target = arm["targetTMu"]
        fresh = axial_anchor(garment.positions[arm["ids"]], arm["p0"], arm["aG"], rule)["tMu"]
        value = landed[f"cuff{side}"]["value"]
        resampled = axial_anchor(positions[arm["ids"]], arm["q0"], arm["aB"], rule)["tMu"]
        anchors[f"cuff{side}"] = {"target": arm["target"], "sourceTMu": source,
                                  "storedMinusMeasuredMm": float(mu_to_mm(source - fresh, m)), "targetTMu": target,
                                  "stretch": target / source, "mappedTMu": mapped,
                                  "mappingResidualMm": float(mu_to_mm(abs(mapped - target), m)),
                                  "edgePoints": landed[f"cuff{side}"]["points"], "landedTMu": value,
                                  "landingResidualMm": float(mu_to_mm(abs(value - target), m)),
                                  "resampledTMu": resampled, "resampledResidualMm": float(mu_to_mm(abs(resampled - target), m))}
        pairs += [{"name": f"arm{side}.{name}", "garmentMu": g, "bodyMu": b,
                   "residualMm": float(mu_to_mm(abs(float(arm["axial"](np.array([g]))[0]) - b), m))}
                  for name, g, b in arm["axial"].pairs]
        dropped += [f"arm{side}.{name}" for name in arm["axial"].dropped]
    collar, hem = anchors["collar"], anchors["hem"]
    span = collar["sourceYMu"] - hem["sourceYMu"]
    xs = np.linspace(hem["sourceYMu"], collar["sourceYMu"], 241); slope = np.gradient(vertical(xs), xs)
    stretch = {"spanRatio": (collar["targetYMu"] - hem["targetYMu"]) / span, "slopeMin": float(slope.min()),
               "slopeMax": float(slope.max()), "collarShiftMm": collar["shiftMm"], "hemShiftMm": hem["shiftMm"]}
    if collar["designTargetYMu"] is not None and hem["designTargetYMu"] is not None:
        stretch["designSpanRatio"] = (collar["designTargetYMu"] - hem["designTargetYMu"]) / span
    check = {"mappingResidualMaxMm": max([row["residualMm"] for row in pairs] + [row["mappingResidualMm"] for row in anchors.values()]),
             "landingResidualMaxMm": max(row["landingResidualMm"] for row in anchors.values()),
             "resampledResidualMaxMm": max(row["resampledResidualMm"] for row in anchors.values()),
             "pairs": pairs, "dropped": dropped}
    low, high = float(garment.positions[:, 1].min()), float(garment.positions[:, 1].max())
    extremes = {"lowestYMu": low, "lowestBelowHemAnchorMm": float(mu_to_mm(hem["sourceYMu"] - low, m)),
                "highestYMu": high, "highestAboveCollarAnchorMm": float(mu_to_mm(high - collar["sourceYMu"], m)),
                "note": "全件最低 / 最高顶点（如腰带垂尾、侧颈峰），只报；衣缘以锚点为准"}
    return {"anchors": anchors, "verticalCheck": check, "verticalStretch": stretch, "extremes": extremes}


__all__ = ["ANCHOR_RULE", "EDGE_KEYS", "anchor_landing", "anchor_report", "anchor_rule", "arm_axes", "arm_axis_map",
           "axial_anchor", "boundary_loops", "choose_target", "cuff_vertices", "edge_anchor", "garment_anchors",
           "landing_arms", "level_heights", "resolve_target", "vertical_map"]
