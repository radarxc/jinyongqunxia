"""切片贴合（ADR 0002）标注：素体竖直标注面自动求取；模板同板衣物标注（衣缘锚点见 slice_fit_anchors）。"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from .slice_fit_base import (ARM_POINTS, LANDMARK_SCHEMA, LEVEL_LABELS, LEVEL_ORDER, SliceFitError, _portable, _round, _sha256, mm_to_mu)
except ImportError:
    from slice_fit_base import (ARM_POINTS, LANDMARK_SCHEMA, LEVEL_LABELS, LEVEL_ORDER, SliceFitError, _portable, _round, _sha256, mm_to_mu)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from scipy.ndimage import gaussian_filter1d  # noqa: E402

try:
    from .slice_fit_geometry import (HorizontalSlicer, convex_hull_2d, limb_frame, section_by_plane, section_loops)
except ImportError:
    from slice_fit_geometry import (HorizontalSlicer, convex_hull_2d, limb_frame, section_by_plane, section_loops)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel)  # type: ignore[no-redef]
try:
    from .slice_fit_anchors import (garment_anchors, level_heights)
except ImportError:
    from slice_fit_anchors import (garment_anchors, level_heights)  # type: ignore[no-redef]
try:
    from .fit_garment import (load_world_mesh)
except ImportError:
    from fit_garment import (load_world_mesh)  # type: ignore[no-redef]
try:
    from .glb_io import (load_glb)
except ImportError:
    from glb_io import (load_glb)  # type: ignore[no-redef]


def _joint_world(skeleton: dict[str, Any], name: str) -> np.ndarray:
    return np.asarray(skeleton["bindWorld"][name], dtype=np.float64).reshape(4, 4).T[:3, 3]


@dataclass
class TorsoProfile:
    ys: np.ndarray
    width: np.ndarray
    front: np.ndarray
    back: np.ndarray
    perimeter: np.ndarray
    centroid: np.ndarray
    big_loops: np.ndarray
    arm_loops: np.ndarray


def torso_profile(body: BodyModel, ys: np.ndarray) -> TorsoProfile:
    """逐水平面量躯干（非臂三角）截面：宽、前后极值、凸包周长与质心、大环数，以及全截面中"以臂三角为主的独立环"数。"""
    slicer = body.torso_slicer()
    full = HorizontalSlicer(body.positions, body.faces, body.weld)
    arm_total = sum(body.arm_weight.values()) if body.arm_weight else np.zeros(len(body.positions))
    count = len(ys)
    width = np.full(count, np.nan); front = np.full(count, np.nan); back = np.full(count, np.nan)
    perimeter = np.full(count, np.nan); centroid = np.full((count, 2), np.nan)
    big = np.zeros(count, dtype=np.int64); arm_loops = np.zeros(count, dtype=np.int64)
    for index, y in enumerate(ys):
        section = slicer(float(y))
        if section.empty:
            continue
        points = section.points.reshape(-1, 3)
        width[index] = np.ptp(points[:, 0]); front[index] = points[:, 2].max(); back[index] = points[:, 2].min()
        hull = convex_hull_2d(points[:, [0, 2]])
        if hull is not None:
            ring = hull.ring
            perimeter[index] = float(np.linalg.norm(np.roll(ring, -1, axis=0) - ring, axis=1).sum())
            centroid[index] = hull.centroid
        loops, labels = section_loops(section)
        big[index] = sum(1 for label in range(loops) if np.count_nonzero(labels == label) >= 30)
        whole = full(float(y))
        if not whole.empty:
            loops_all, labels_all = section_loops(whole)
            face_arm = np.asarray(arm_total)[body.faces[whole.faces]].mean(axis=1) >= 0.5
            for label in range(loops_all):
                member = labels_all == label
                if np.count_nonzero(member) >= 20 and np.count_nonzero(member & face_arm) >= 0.5 * np.count_nonzero(member):
                    arm_loops[index] += 1
    return TorsoProfile(np.asarray(ys, dtype=np.float64), width, front, back, perimeter, centroid, big, arm_loops)


def _first_crossing(ys: np.ndarray, condition: np.ndarray, *, from_top: bool) -> float | None:
    """沿 ys 方向找条件首次成立处（取与前一采样的中点）。"""
    order = np.arange(len(ys))[::-1] if from_top else np.arange(len(ys))
    previous = None
    for index in order:
        if condition[index]:
            return float(ys[index]) if previous is None else 0.5 * float(ys[index] + ys[previous])
        previous = index
    return None


def mesh_wrist(body: BodyModel, side: str, elbow: np.ndarray, knuckle: np.ndarray, step_mm: float = 1.5) -> np.ndarray:
    """前臂最细处：肘 → 中指指根 50–90% 段逐 step 垂直截本侧臂三角，取凸包周长最小截面的质心。"""
    axis = knuckle - elbow; length = float(np.linalg.norm(axis)); axis = axis / length
    u, v = limb_frame(axis); faces = np.flatnonzero(body.arm_face_mask[side])
    best: tuple[float, np.ndarray] | None = None
    for offset in np.arange(0.5 * length, 0.9 * length, mm_to_mu(step_mm, body.m_per_mu)):
        origin = elbow + offset * axis
        section = section_by_plane(body.positions, body.faces, body.weld, origin, axis, faces)
        if section.empty:
            continue
        local = section.points.reshape(-1, 3) - origin
        hull = convex_hull_2d(np.stack((local @ u, local @ v), axis=1))
        if hull is None:
            continue
        perimeter = float(np.linalg.norm(np.roll(hull.ring, -1, axis=0) - hull.ring, axis=1).sum())
        if best is None or perimeter < best[0]:
            best = (perimeter, origin + hull.centroid[0] * u + hull.centroid[1] * v)
    if best is None:
        raise SliceFitError(f"臂 {side}：肘到指根之间截不到前臂")
    return best[1]


def derive_body_landmarks(body: BodyModel, skeleton: dict[str, Any], *, template: str | None = None,
                          step_mm: float = 2.5) -> dict[str, Any]:
    """从骨骼与网格自动求素体竖直标注、各标注面截面中心与四肢轴（结果须人工看叠图确认后落盘）。"""
    m_per_mu = float(skeleton["mPerMu"]); height = float(skeleton.get("heightMu", np.ptp(body.positions[:, 1])))
    joint = {name.split(":")[-1]: _joint_world(skeleton, name) for name in skeleton["joints"]}
    hips_y = float(joint["Hips"][1]); knee_y = 0.5 * float(joint["LeftLeg"][1] + joint["RightLeg"][1])
    ankle_y = 0.5 * float(joint["LeftFoot"][1] + joint["RightFoot"][1])
    ring_y = float(skeleton.get("neckRing", {}).get("centerMu", [0.0, float(joint["Neck"][1]) + 0.015])[1])
    step = mm_to_mu(step_mm, m_per_mu)
    ys = np.arange(knee_y, ring_y + 2 * step, step)
    profile = torso_profile(body, ys)
    levels: dict[str, dict[str, Any]] = {}

    def put(name: str, y: float, method: str) -> None:
        levels[name] = {"label": LEVEL_LABELS.get(name, name), "yMu": float(y), "method": method}

    # 裆：自下而上，躯干截面由两腿两环变成一环处。
    two = profile.big_loops >= 2
    crotch = None
    for index in range(1, len(ys)):
        if ys[index] < hips_y and two[index - 1] and profile.big_loops[index] == 1:
            crotch = 0.5 * float(ys[index - 1] + ys[index])
            break
    if crotch is None:
        raise SliceFitError("找不到裆（两腿两环 → 一环）")
    put("crotch", crotch, "自下而上躯干截面两腿两环合成一环处")
    # 颈根：自颈环向下，截面宽首次达到颈宽 1.5 倍处。
    neck_width = float(np.interp(ring_y, ys, np.nan_to_num(profile.width, nan=0.0)))
    above = ys > float(joint["LeftArm"][1])
    neck_base = _first_crossing(ys[above], profile.width[above] >= 1.5 * neck_width, from_top=True)
    if neck_base is None:
        raise SliceFitError("找不到颈根")
    put("neckBase", neck_base, f"自颈环（y={ring_y:.4f}）向下截面宽首次 ≥ 1.5 × 颈宽（{neck_width:.4f} mu）")
    # 腋下：自下而上，两臂不再是独立环（并入躯干环）处。
    window = (ys > hips_y + 0.06) & (ys < neck_base)
    armpit = _first_crossing(ys[window], profile.arm_loops[window] < 2, from_top=False)
    put("armpit", armpit if armpit is not None else float(joint["LeftArm"][1]) - 0.045,
        "自下而上两臂独立环并入躯干环处" if armpit is not None else "回退：肩关节下 0.045 mu")
    # 肩（肩峰高）：腋下与颈根之间躯干（含肩、不含臂）截面最宽处。
    window = (ys > levels["armpit"]["yMu"]) & (ys < neck_base)
    widest = np.where(window, np.nan_to_num(profile.width, nan=-np.inf), -np.inf)
    put("shoulder", float(ys[int(np.argmax(widest))]) if window.any() else float(joint["LeftArm"][1]) + 0.02,
        "腋下与颈根之间躯干截面最宽处（肩峰高）")
    put("pelvis", hips_y, "Hips 关节高度")
    # 腰：胯与腋下之间凸包周长最小处。
    window = (ys > hips_y + 0.04) & (ys < levels["armpit"]["yMu"] - 0.04)
    perimeter = np.where(window, np.nan_to_num(profile.perimeter, nan=np.inf), np.inf)
    put("waist", float(ys[int(np.argmin(perimeter))]), "胯与腋下之间躯干凸包周长最小处")
    # 胸：腰与腋下之间前缘最突出处；胸下：自胸向下前缘首个局部最低处。
    front = gaussian_filter1d(np.nan_to_num(profile.front, nan=0.0), 1.0)
    window = (ys > levels["waist"]["yMu"]) & (ys < levels["armpit"]["yMu"])
    bust_index = int(np.argmax(np.where(window, front, -np.inf)))
    put("bust", float(ys[bust_index]), "腰与腋下之间躯干前缘最突出处")
    under = bust_index
    while under > 0 and ys[under - 1] > levels["waist"]["yMu"] and front[under - 1] <= front[under] + 1e-6:
        under -= 1
    put("underBust", float(ys[under]), "自胸向下躯干前缘首个局部最低处")
    # 肚脐：腰下前中线前缘相对 1.5 cm 趋势的最深凹点（深 > 1.7 mm），否则回退。
    middle_x = 0.5 * float(joint["LeftUpLeg"][0] + joint["RightUpLeg"][0])
    strip = body.positions[(np.abs(body.positions[:, 0] - middle_x) < 0.006) & (body.positions[:, 2] > 0.0)
                           & (body.positions[:, 1] > hips_y) & (body.positions[:, 1] < levels["waist"]["yMu"] + 0.01)]
    navel = None
    if len(strip) > 20:
        bins = np.arange(hips_y, levels["waist"]["yMu"] + 0.01, step)
        which = np.digitize(strip[:, 1], bins)
        zf = np.array([strip[which == i, 2].max() if np.any(which == i) else np.nan for i in range(1, len(bins))])
        centers = 0.5 * (bins[:-1] + bins[1:])
        ok = np.isfinite(zf)
        if ok.sum() > 8:
            zf = np.interp(centers, centers[ok], zf[ok])
            residual = zf - gaussian_filter1d(zf, mm_to_mu(15.0, m_per_mu) / step, mode="nearest")
            window = (centers > hips_y + 0.03) & (centers < levels["waist"]["yMu"] + 0.005)
            if window.any():
                pick = int(np.argmin(np.where(window, residual, np.inf)))
                if residual[pick] < -mm_to_mu(1.7, m_per_mu):
                    navel = float(centers[pick])
    put("navel", navel if navel is not None else levels["waist"]["yMu"] - 0.02 * height,
        "腰下前中线前缘最深凹点（脐窝）" if navel is not None else "回退：腰下 0.02 H")
    # 臀围：裆与腰之间凸包周长最大处。
    window = (ys > crotch) & (ys < levels["waist"]["yMu"])
    put("hip", float(ys[int(np.argmax(np.where(window, np.nan_to_num(profile.perimeter, nan=-np.inf), -np.inf)))]),
        "裆与腰之间躯干凸包周长最大处")
    # 臀下（臀沟）：裆下大腿后缘参考值以外 3 mm 处（臀部隆起起点）。
    thigh = (ys > crotch - 0.10) & (ys < crotch - 0.05)
    reference = float(np.nanmedian(profile.back[thigh])) if thigh.any() else float(np.nanmin(profile.back))
    window = (ys > crotch - 0.05) & (ys <= crotch)
    bulge = window & (profile.back < reference - mm_to_mu(3.0, m_per_mu))
    below_hip = float(ys[np.flatnonzero(bulge)[0]]) if bulge.any() else crotch - 0.03 * height
    put("belowHip", below_hip, "裆下大腿后缘外凸 > 3 mm 的最低处（臀沟）" if bulge.any() else "回退：裆下 0.03 H")
    put("midThigh", 0.5 * (crotch + knee_y), "裆与膝中点")
    put("aboveKnee", knee_y + 0.25 * (crotch - knee_y), "膝上：膝 + 0.25 ×（裆 − 膝）")
    put("knee", knee_y, "LeftLeg / RightLeg 关节平均")
    put("calf", knee_y - 0.3 * (knee_y - ankle_y), "膝下 0.3 ×（膝 − 踝）")
    put("aboveAnkle", ankle_y + 0.15 * (knee_y - ankle_y), "踝上：踝 + 0.15 ×（膝 − 踝）")
    put("ankle", ankle_y, "LeftFoot / RightFoot 关节平均")
    # 各标注面的截面中心（躯干凸包面积质心；裆下为两腿凸包）与宽深。
    for name, record in levels.items():
        section = body.torso_slicer()(record["yMu"])
        if section.empty:
            continue
        points = section.points.reshape(-1, 3)[:, [0, 2]]
        hull = convex_hull_2d(points)
        if hull is not None:
            record["centerMu"] = [float(hull.centroid[0]), float(hull.centroid[1])]
        record["widthMu"] = float(np.ptp(points[:, 0])); record["depthMu"] = float(np.ptp(points[:, 1]))
    ordered = {name: levels[name] for name in reversed(LEVEL_ORDER) if name in levels}
    # 臂：肩 / 肘取骨架关节；腕取网格前臂最细处（模板骨架 Hand 关节左右不对称：沿臂弦左 428 / 右 474 mm，网格两侧
    # 最细处都在约 441 mm，故不用 Hand 关节当腕，原值记 wristJointMu）；hand 取中指指根 HandMiddle1。
    limbs: dict[str, Any] = {}
    for side, prefix in (("L", "Left"), ("R", "Right")):
        knuckle = joint.get(f"{prefix}HandMiddle1", joint[f"{prefix}Hand"])
        limbs[f"arm{side}"] = {"shoulderMu": joint[f"{prefix}Arm"].tolist(), "elbowMu": joint[f"{prefix}ForeArm"].tolist(),
                               "wristMu": mesh_wrist(body, side, joint[f"{prefix}ForeArm"], knuckle).tolist(),
                               "handMu": knuckle.tolist(), "wristJointMu": joint[f"{prefix}Hand"].tolist()}
    for side, prefix in (("L", "Left"), ("R", "Right")):
        limbs[f"leg{side}"] = {f"{name}Mu": joint[f"{prefix}{bone}"].tolist()
                               for name, bone in zip(("hip", "knee", "ankle"), ("UpLeg", "Leg", "Foot"))}
    record: dict[str, Any] = {
        "schema": LANDMARK_SCHEMA, "kind": "body", "template": template, "unit": "mu", "up": "+Y", "front": "+Z",
        "heightMu": height, "mPerMu": m_per_mu, "levels": ordered, "limbs": limbs,
        "limbsMethod": "肩 / 肘 = Arm / ForeArm 关节；腕 = 肘 → 中指指根 50–90% 段前臂垂直截面凸包周长最小处的质心；"
                       "hand = HandMiddle1 关节；wristJointMu = 骨架 Hand 关节（只记录）",
        "generator": "tools/model3d/dressup/slice_fit.py body-landmarks",
    }
    if body.path is not None:
        record["source"] = {"body": _portable(body.path), "bodySha256": _sha256(body.path)}
    return _round(record)


def derive_garment_landmarks(garment_path: Path, design: dict[str, Any], *, garment_id: str, garment_class: str,
                             elasticity: float, clearance_mm: float = 1.0, note: str | None = None,
                             fold_mm: float = 0.0, expect: dict[str, str] | None = None) -> dict[str, Any]:
    """在模板上生成（Tripo 同板）的衣物：设计体 = 该模板（中间对应面取模板标注）；领口 / 下摆 / 袖口锚点从衣物几何量出，
    目标按设计体选（slice_fit_anchors）；袖轴取设计体臂点。expect = {"collar": 层名, "hem": 层名} 时核对选中的目标层。"""
    glb = load_glb(garment_path)
    mesh = load_world_mesh(glb)
    garment = GarmentModel(mesh.positions, mesh.indices.reshape(-1, 3).astype(np.int64), mesh.uvs, {})
    m_per_mu = float(design["mPerMu"]); design_levels = level_heights(design)
    # 袖的设计臂 = 设计体（该模板）臂点，与躯干设计面同源；同板件在原生模板上袖轴映射即恒等。
    sleeves = {side: {"axis": {key: value for key, value in design["limbs"][f"arm{side}"].items()
                               if key in {f"{name}Mu" for name in ARM_POINTS}},
                      "axisSource": f"设计体 {design.get('template')} 臂点（肩 / 肘骨架关节、腕网格最细处、指根 HandMiddle1）"}
               for side in ("L", "R") if f"arm{side}" in (design.get("limbs") or {})}
    anchors = garment_anchors(garment, design_levels, sleeves, m_per_mu)
    for key, level in (expect or {}).items():
        if anchors[key]["target"].get("level") != level:
            raise SliceFitError(f"{key} 锚点（{anchors[key]['anchor']['yMu']:.4f} mu）最近的设计体标注面是 "
                                f"{anchors[key]['target']}，不是预期的 {level}")
    # 只登记量得到袖口的袖（同 r1：没有袖口的骨架臂不算袖，免得空袖部件）。
    sleeves = {side: {**sleeves[side], "cuff": cuff} for side, cuff in anchors["cuffs"].items()}
    y_low, y_high = float(garment.positions[:, 1].min()), float(garment.positions[:, 1].max())
    levels = {name: y for name, y in design_levels.items() if y_low - 0.02 <= y <= y_high + 0.02}
    record: dict[str, Any] = {
        "schema": LANDMARK_SCHEMA, "kind": "garment", "id": garment_id, "class": garment_class,
        "elasticity": float(elasticity), "clearanceMm": float(clearance_mm), "foldMm": float(fold_mm),
        "rigid": float(elasticity) <= 0.0,
        "legs": "tube", "unit": "mu", "up": "+Y", "front": "+Z",
        "frame": (f"衣物 GLB 原坐标；在 {design.get('template')} 板上生成，设计体即该模板：levels 为设计体标注面在衣物坐标的高度"
                  "（只作锚点之间的中间对应）；collar / hem / 袖口锚点从衣物几何量出，target 为设计体上的目标面"),
        "designTemplate": design.get("template"), "anchorRule": anchors["anchorRule"],
        "levels": {name: {"yMu": y} for name, y in sorted(levels.items(), key=lambda item: item[1], reverse=True)},
        "alignLevels": [name for name in levels if name not in ("ankle", "aboveAnkle", "calf")],
        "collar": anchors["collar"], "hem": anchors["hem"], "sleeves": sleeves or None,
        "source": {"file": _portable(garment_path), "sha256": _sha256(garment_path)},
        "generator": "tools/model3d/dressup/slice_fit.py garment-landmarks",
    }
    if note:
        record["note"] = note
    return _round(record)
