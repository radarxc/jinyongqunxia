"""切片贴合（ADR 0002）盔甲测试件：在"另一体型"的凸包截面上程序生成带厚度甲壳。"""
from __future__ import annotations

from io import BytesIO
import math
from pathlib import Path
from typing import Any, Sequence

try:
    from .slice_fit_base import (ARM_POINTS, LANDMARK_SCHEMA, LEVEL_ORDER, SliceFitError, _portable, _sha256, _unit, mm_to_mu, welded_normals, write_json)
except ImportError:
    from slice_fit_base import (ARM_POINTS, LANDMARK_SCHEMA, LEVEL_ORDER, SliceFitError, _portable, _sha256, _unit, mm_to_mu, welded_normals, write_json)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402
from scipy.ndimage import gaussian_filter1d  # noqa: E402

try:
    from .slice_fit_geometry import (convex_hull_2d, fill_grid, hull_rays, normalized_smooth, section_by_plane, upper_envelope)
except ImportError:
    from slice_fit_geometry import (convex_hull_2d, fill_grid, hull_rays, normalized_smooth, section_by_plane, upper_envelope)  # type: ignore[no-redef]
try:
    from .slice_fit_model import (BodyModel, GarmentModel, write_static_glb)
except ImportError:
    from slice_fit_model import (BodyModel, GarmentModel, write_static_glb)  # type: ignore[no-redef]
try:
    from .slice_fit_geometry import (limb_frame as _limb_frame)
except ImportError:
    from slice_fit_geometry import (limb_frame as _limb_frame)  # type: ignore[no-redef]
try:
    from .slice_fit_anchors import (garment_anchors)
except ImportError:
    from slice_fit_anchors import (garment_anchors)  # type: ignore[no-redef]
try:
    from .glb_io import (ImageData)
except ImportError:
    from glb_io import (ImageData)  # type: ignore[no-redef]


ARMOR_KINDS = {
    "banjia": {"label": "板甲", "elasticity": 0.0, "scale": (1.10, 1.06, 1.12), "offset": (0.012, -0.02, -0.010),
               "top": "neckBase", "bottom": "navel", "thicknessMm": 3.0, "standoffMm": 6.0,
               "note": "板甲测试件：胸背一体整片到肚脐、两侧开袖窿，r = 0（整件相似）；按"
                       "宽 1.10 / 高 1.06 / 厚 1.12 倍的体型制作并错位 (+20, −34, −17) mm，用来检验缩小对齐。"},
    "mingguang": {"label": "明光铠", "elasticity": 0.2, "scale": (0.93, 0.95, 0.94), "offset": (-0.008, 0.015, 0.006),
                  "top": "neckBase", "bottom": "belowHip", "thicknessMm": 2.5, "standoffMm": 5.0,
                  "note": "明光铠测试件：胸背甲 + 两面护心镜 + 腹甲（叠在胸背甲外）+ 前后分片甲裙到臀下，r = 0.2；"
                          "按宽 0.93 / 高 0.95 / 厚 0.94 倍的小体型制作并错位 (−14, +25, +10) mm，用来检验放大对齐与多层层距。"},
    "suozi": {"label": "锁子甲", "elasticity": 0.3, "scale": (0.96, 1.08, 1.05), "offset": (0.0, 0.03, 0.008),
              "top": "neckBase", "bottom": "aboveKnee", "thicknessMm": 4.0, "standoffMm": 4.0,
              "note": "锁子甲测试件：长到膝上的甲衣（腋下 3 cm 以上两侧开袖窿、前后开衩）+ 两只盖住肩头到上臂中段的短袖管，"
                      "r = 0.3；按宽 0.96 / 高 1.08 / 厚 1.05 倍的高瘦体型制作并错位 (0, +51, +14) mm，用来检验竖直分段对齐、裆下两腿凸包与袖轴。"},
}


def _design_transform(kind: dict[str, Any], pivot_y: float):
    sx, sy, sz = kind["scale"]; dx, dy, dz = kind["offset"]

    def apply(points: np.ndarray) -> np.ndarray:
        points = np.asarray(points, dtype=np.float64)
        out = np.empty_like(points)
        out[..., 0] = points[..., 0] * sx + dx
        out[..., 1] = pivot_y + (points[..., 1] - pivot_y) * sy + dy
        out[..., 2] = points[..., 2] * sz + dz
        return out

    def apply_y(y: float) -> float:
        return float(pivot_y + (y - pivot_y) * sy + dy)

    return apply, apply_y


def _grid_shell(radius_in: np.ndarray, thickness: float, ys: np.ndarray, angles: np.ndarray, center: np.ndarray,
                cell_mask: np.ndarray, uv_v: tuple[float, float]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """(高度 × 角度) 网格上的带厚度壳：内外两层 + 沿激活区边界的侧壁；返回顶点、三角、UV。"""
    rows, cols = radius_in.shape
    node_used = np.zeros((rows, cols), dtype=bool)
    for k in range(rows - 1):
        for j in range(cols):
            if cell_mask[k, j]:
                j1 = (j + 1) % cols
                node_used[k, j] = node_used[k, j1] = node_used[k + 1, j] = node_used[k + 1, j1] = True
    index = -np.ones((2, rows, cols), dtype=np.int64)
    positions = []; uvs = []
    counter = 0
    for layer, offset in ((0, 0.0), (1, thickness)):
        for k in range(rows):
            for j in range(cols):
                if not node_used[k, j]:
                    continue
                r = radius_in[k, j] + offset
                positions.append((center[k, 0] + r * math.cos(angles[j]), ys[k], center[k, 1] + r * math.sin(angles[j])))
                uvs.append((j / cols, uv_v[0] + (uv_v[1] - uv_v[0]) * k / max(rows - 1, 1)))
                index[layer, k, j] = counter; counter += 1
    faces = []
    for k in range(rows - 1):
        for j in range(cols):
            if not cell_mask[k, j]:
                continue
            j1 = (j + 1) % cols
            a, b, c, d = index[0, k, j], index[0, k, j1], index[0, k + 1, j], index[0, k + 1, j1]
            faces += [(a, c, b), (b, c, d)]          # 内层：法向朝内
            a, b, c, d = index[1, k, j], index[1, k, j1], index[1, k + 1, j], index[1, k + 1, j1]
            faces += [(a, b, c), (b, d, c)]          # 外层：法向朝外
    # 侧壁：激活格与非激活格（或网格外）的边界边
    def wall(n0: tuple[int, int], n1: tuple[int, int], flip: bool) -> None:
        i0, i1 = index[0][n0], index[0][n1]; o0, o1 = index[1][n0], index[1][n1]
        if flip:
            faces.extend([(i0, o0, i1), (i1, o0, o1)])
        else:
            faces.extend([(i0, i1, o0), (i1, o1, o0)])
    for k in range(rows - 1):
        for j in range(cols):
            if not cell_mask[k, j]:
                continue
            j1 = (j + 1) % cols
            if k == 0 or not cell_mask[k - 1, j]:
                wall((k, j), (k, j1), False)
            if k == rows - 2 or not cell_mask[k + 1, j]:
                wall((k + 1, j), (k + 1, j1), True)
            if not cell_mask[k, (j - 1) % cols]:
                wall((k, j), (k + 1, j), True)
            if not cell_mask[k, j1]:
                wall((k, j1), (k + 1, j1), False)
    # 上面按"内层朝外"写出，整体翻转后：内层朝内、外层朝外、侧壁朝外。
    return np.asarray(positions), np.asarray(faces, dtype=np.int64)[:, [0, 2, 1]], np.asarray(uvs)


def _merge(parts: Sequence[tuple[np.ndarray, np.ndarray, np.ndarray]]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    positions, faces, uvs = [], [], []; base = 0
    for p, f, u in parts:
        positions.append(p); faces.append(f + base); uvs.append(u); base += len(p)
    return np.concatenate(positions), np.concatenate(faces), np.concatenate(uvs)


def _armor_texture(kind: str, size: int = 256) -> bytes:
    yy, xx = np.mgrid[0:size, 0:size] / size
    if kind == "banjia":
        base = np.array([0.62, 0.64, 0.68]); stripe = (np.mod(yy * 6, 1.0) < 0.06)
        rivet = (np.hypot(np.mod(xx * 24, 1.0) - 0.5, np.mod(yy * 6, 1.0) - 0.12) < 0.12)
        image = base[None, None, :] * (0.92 + 0.08 * np.sin(xx * 20))[..., None]
        image[stripe] = [0.38, 0.40, 0.44]; image[rivet] = [0.86, 0.80, 0.55]
    elif kind == "mingguang":
        base = np.array([0.80, 0.62, 0.28])
        scale_row = np.mod(yy * 18, 1.0); scale_col = np.mod(xx * 32 + 0.5 * (np.floor(yy * 18) % 2), 1.0)
        edge = (np.hypot(scale_col - 0.5, scale_row - 0.1) > 0.48)
        image = np.tile(base, (size, size, 1)) * (0.85 + 0.15 * scale_row)[..., None]
        image[edge] = [0.45, 0.30, 0.12]
    else:
        ring = np.hypot(np.mod(xx * 40, 1.0) - 0.5, np.mod(yy * 40, 1.0) - 0.5)
        image = np.tile(np.array([0.36, 0.38, 0.42]), (size, size, 1))
        image[(ring > 0.28) & (ring < 0.42)] = [0.68, 0.70, 0.74]
    stream = BytesIO()
    Image.fromarray((np.clip(image, 0, 1) * 255).astype(np.uint8)).save(stream, format="PNG", optimize=True)
    return stream.getvalue()


def make_armor_fixture(kind_name: str, body: BodyModel, out_dir: Path) -> dict[str, Any]:
    """在"另一体型"（模板按 scale / offset 变形）的凸包截面上程序生成带厚度的甲壳，写 GLB + 标注 + 说明。"""
    if kind_name not in ARMOR_KINDS:
        raise SliceFitError(f"未知盔甲 {kind_name}")
    kind = ARMOR_KINDS[kind_name]
    levels = {name: rec["yMu"] for name, rec in body.landmarks["levels"].items()}
    m_per_mu = body.m_per_mu
    pivot = levels["pelvis"]
    apply, apply_y = _design_transform(kind, pivot)
    design_positions = apply(body.positions)
    design = BodyModel(design_positions, body.faces, welded_normals(design_positions, body.faces, body.weld), body.uvs,
                       body.arm_weight, {}, m_per_mu, None, None, body.weld)
    design_levels = {name: apply_y(y) for name, y in levels.items()}
    thickness = mm_to_mu(kind["thicknessMm"], m_per_mu); standoff = mm_to_mu(kind["standoffMm"], m_per_mu)
    cols = 96; angles = np.arange(cols) * 2 * math.pi / cols
    deg = np.degrees(angles)
    y_top = design_levels[kind["top"]] + mm_to_mu(4.0, m_per_mu); y_bottom = design_levels[kind["bottom"]]
    step = mm_to_mu(6.0, m_per_mu)
    ys = np.arange(y_bottom, y_top + 0.5 * step, step)
    hull_r = np.full((len(ys), cols), np.nan); centers = np.zeros((len(ys), 2))
    slicer = design.torso_slicer()
    for k, y in enumerate(ys):
        section = slicer(float(y))
        hull = convex_hull_2d(section.points.reshape(-1, 3)[:, [0, 2]]) if not section.empty else None
        if hull is None:
            continue
        centers[k] = hull.centroid
        hull_r[k], _ = hull_rays(hull, hull.centroid, angles)
    valid = np.isfinite(hull_r).all(axis=1)
    centers = normalized_smooth(centers, valid, 3.0)
    for k in range(len(ys)):
        section = slicer(float(ys[k]))
        hull = convex_hull_2d(section.points.reshape(-1, 3)[:, [0, 2]]) if not section.empty else None
        if hull is not None:
            hull_r[k], _ = hull_rays(hull, centers[k], angles)
    raw = fill_grid(np.nan_to_num(hull_r), np.isfinite(hull_r)) + standoff
    # 制作出来的甲面是光顺的：角向只留低阶谐波、竖向平滑，再取不低于"凸包 + 最小离体"的上包络。
    spectrum = np.fft.rfft(raw, axis=1); spectrum[:, 9:] = 0
    smooth = gaussian_filter1d(np.fft.irfft(spectrum, n=cols, axis=1), 2.0, axis=0, mode="nearest")
    radius_in = upper_envelope(np.maximum(raw, smooth), np.ones_like(raw, dtype=bool), 2.0, 2.0, 30)
    a_front = np.abs(((deg - 90 + 180) % 360) - 180); a_back = np.abs(((deg - 270 + 180) % 360) - 180)
    side_gap = np.minimum(np.abs(((deg + 180) % 360) - 180), np.abs(((deg - 180 + 180) % 360) - 180))
    cells = np.ones((len(ys) - 1, cols), dtype=bool)
    yc = 0.5 * (ys[:-1] + ys[1:])
    armpit = design_levels["armpit"]; shoulder = design_levels["shoulder"]
    parts = []
    texture_rows = (0.0, 1.0)
    if kind_name == "banjia":
        # 袖窿：腋下以上两侧开口；领口：前中 U 形下挖 3 cm。
        hole = (yc[:, None] > armpit - mm_to_mu(15, m_per_mu)) & (side_gap[None, :] < 38)
        neck = (yc[:, None] > design_levels["neckBase"] - mm_to_mu(30, m_per_mu) * np.cos(np.radians(np.minimum(a_front, 90)))[None, :]) & (a_front[None, :] < 55)
        cells &= ~hole & ~neck
        parts.append(_grid_shell(radius_in, thickness, ys, angles, centers, cells, texture_rows))
    elif kind_name == "mingguang":
        waist = design_levels["waist"]
        top = ys >= waist - mm_to_mu(10, m_per_mu)
        ys_top = ys[top]; rin_top = radius_in[top]; c_top = centers[top]
        yct = 0.5 * (ys_top[:-1] + ys_top[1:])
        cells_top = np.ones((len(ys_top) - 1, cols), dtype=bool)
        hole = (yct[:, None] > armpit - mm_to_mu(15, m_per_mu)) & (side_gap[None, :] < 40)
        neck = (yct[:, None] > design_levels["neckBase"] - mm_to_mu(25, m_per_mu)) & (a_front[None, :] < 40)
        cells_top &= ~hole & ~neck
        parts.append(_grid_shell(rin_top, thickness, ys_top, angles, c_top, cells_top, (0.0, 0.5)))
        # 腹甲：叠在胸背甲外（前 ±60°，胸下到腰下），层距 2 mm。
        belly = (ys >= waist - mm_to_mu(25, m_per_mu)) & (ys <= design_levels["underBust"])
        ys_b = ys[belly]; cells_b = np.ones((len(ys_b) - 1, cols), dtype=bool)
        cells_b &= (a_front[None, :] < 60)
        parts.append(_grid_shell(radius_in[belly] + thickness + mm_to_mu(2.0, m_per_mu), thickness, ys_b, angles,
                                 centers[belly], cells_b, (0.5, 0.65)))
        # 甲裙：腰下到臀下，向下外扩，左右开衩成前后两片。
        skirt = ys <= waist - mm_to_mu(5, m_per_mu)
        ys_s = ys[skirt]; flare = mm_to_mu(25.0, m_per_mu) * np.clip((ys_s.max() - ys_s) / max(np.ptp(ys_s), 1e-9), 0, 1)
        rin_s = radius_in[skirt] + thickness + mm_to_mu(3.0, m_per_mu) + flare[:, None]
        cells_s = np.ones((len(ys_s) - 1, cols), dtype=bool) & (side_gap[None, :] > 10)
        parts.append(_grid_shell(rin_s, thickness, ys_s, angles, centers[skirt], cells_s, (0.65, 1.0)))
        # 护心镜：胸高左右各一面穹顶圆盘，贴在胸背甲外 2 mm。
        bust = design_levels["bust"]; kb = int(np.argmin(np.abs(ys_top - bust)))
        for side_deg in (90 - 24, 90 + 24):
            j = int(round(side_deg / 360 * cols)) % cols
            r_out = rin_top[kb, j] + thickness
            base = np.array([c_top[kb, 0] + r_out * math.cos(angles[j]), ys_top[kb], c_top[kb, 1] + r_out * math.sin(angles[j])])
            normal = _unit(np.array([math.cos(angles[j]), 0.0, math.sin(angles[j])]))
            t1 = _unit(np.cross([0.0, 1.0, 0.0], normal)); t2 = np.cross(normal, t1)
            radius = mm_to_mu(42.0, m_per_mu); dome = mm_to_mu(8.0, m_per_mu); lift = mm_to_mu(2.0, m_per_mu)
            rings, segs = 8, 40
            pts, uv = [], []
            for layer in (0, 1):
                for ring in range(rings + 1):
                    rr = radius * ring / rings
                    height = lift + dome * (1 - (rr / radius) ** 2) + layer * thickness
                    for s in range(segs):
                        phi = 2 * math.pi * s / segs
                        pts.append(base + t1 * rr * math.cos(phi) + t2 * rr * math.sin(phi) + normal * height)
                        uv.append((0.5 + 0.08 * rr / radius * math.cos(phi), 0.25 + 0.08 * rr / radius * math.sin(phi)))
            pts = np.asarray(pts); uv = np.asarray(uv); per = (rings + 1) * segs
            tri = []
            for layer in (0, 1):
                for ring in range(rings):
                    for s in range(segs):
                        s1 = (s + 1) % segs
                        a = layer * per + ring * segs + s; b = layer * per + ring * segs + s1
                        c = layer * per + (ring + 1) * segs + s; d = layer * per + (ring + 1) * segs + s1
                        tri += [(a, c, b), (b, c, d)] if layer == 1 else [(a, b, c), (b, d, c)]
            for s in range(segs):
                s1 = (s + 1) % segs
                a = rings * segs + s; b = rings * segs + s1; c = per + rings * segs + s; d = per + rings * segs + s1
                tri += [(a, b, c), (b, d, c)]
            parts.append((pts, np.asarray(tri, dtype=np.int64), uv))
    else:  # suozi
        hole = (yc[:, None] > armpit - mm_to_mu(30, m_per_mu)) & (side_gap[None, :] < 32)
        neck = (yc[:, None] > design_levels["neckBase"] - mm_to_mu(20, m_per_mu)) & (a_front[None, :] < 35)
        slit = (yc[:, None] < design_levels["crotch"] - mm_to_mu(40, m_per_mu)) & ((a_front[None, :] < 6) | (a_back[None, :] < 6))
        cells &= ~hole & ~neck & ~slit
        flare = mm_to_mu(15.0, m_per_mu) * np.clip((design_levels["crotch"] - ys) / max(design_levels["crotch"] - ys.min(), 1e-9), 0, 1)
        parts.append(_grid_shell(radius_in + flare[:, None], thickness, ys, angles, centers, cells, (0.0, 0.8)))
        # 短袖：沿设计体手臂骨弦，从肩上 1 cm 到上臂中段；截面取设计体臂凸包 + 离体。
        for side, prefix in (("L", "Left"), ("R", "Right")):
            limb = body.landmarks["limbs"][f"arm{side}"]
            q0 = apply(np.asarray(limb["shoulderMu"])); q1 = apply(np.asarray(limb["elbowMu"]))
            axis = _unit(q1 - q0); u, v = _limb_frame(axis); w = -v   # (u, axis, w) 右手系
            ts = np.arange(-0.02, 0.55 * np.linalg.norm(q1 - q0), step)
            faces_arm = np.flatnonzero(design.arm_face_mask[side])
            r_arm = np.full((len(ts), cols), np.nan); c_arm = np.zeros((len(ts), 2))
            for k, t in enumerate(ts):
                origin = q0 + t * axis
                section = section_by_plane(design.positions, design.faces, design.weld, origin, axis, faces_arm)
                local = section.points.reshape(-1, 3) - origin
                hull = convex_hull_2d(np.stack((local @ u, local @ w), axis=-1)) if len(local) >= 3 else None
                if hull is None:
                    continue
                c_arm[k] = hull.centroid; r_arm[k], _ = hull_rays(hull, hull.centroid, angles)
            ok = np.isfinite(r_arm).all(axis=1)
            sizes = np.full(len(ts), np.nan)
            sizes[ok] = np.median(r_arm[ok], axis=1)
            ok &= sizes >= 0.6 * np.nanmedian(sizes)          # 肩关节处只截到一小段臂皮肤，不算截面
            r_arm[~ok] = np.nan
            c_arm = normalized_smooth(c_arm, ok, 2.0)
            r_arm = fill_grid(np.nan_to_num(r_arm), np.isfinite(r_arm))
            spectrum = np.fft.rfft(r_arm, axis=1); spectrum[:, 6:] = 0
            r_arm = np.maximum(np.fft.irfft(spectrum, n=cols, axis=1), r_arm) + standoff + mm_to_mu(4.0, m_per_mu)
            r_arm = gaussian_filter1d(r_arm, 1.5, axis=0, mode="nearest")
            cells_arm = np.ones((len(ts) - 1, cols), dtype=bool)
            # 袖山斜裁：朝躯干一侧（±75°）在腋下 12 mm 以上不做，否则 A 字姿势下袖管内侧必然插进胸侧。
            toward = np.array([0.0, design_levels["armpit"], 0.0]) - q0
            theta_torso = math.atan2(float(toward @ w), float(toward @ u))
            t_cut = (design_levels["armpit"] - q0[1]) / min(axis[1], -1e-6) + mm_to_mu(12.0, m_per_mu)
            gap = np.abs((angles - theta_torso + math.pi) % (2 * math.pi) - math.pi)
            tc = 0.5 * (ts[:-1] + ts[1:])
            cells_arm &= ~((tc[:, None] < t_cut) & (gap[None, :] < math.radians(75.0)))
            # 袖管在 (t, 角度) 上建壳，再映射回 3D。
            local_pos, local_faces, local_uv = _grid_shell(r_arm, thickness, ts, angles, c_arm, cells_arm, (0.8, 1.0))
            t_axis = local_pos[:, 1]; cu = local_pos[:, 0]; cv = local_pos[:, 2]
            world = q0 + t_axis[:, None] * axis + cu[:, None] * u + cv[:, None] * w
            parts.append((world, local_faces, local_uv))
    positions, faces, uvs = _merge(parts)
    out_dir = Path(out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    asset_id = f"_fixture_armor_{kind_name}"
    image = ImageData(_armor_texture(kind_name), "image/png", f"{asset_id}_basecolor")
    garment = GarmentModel(positions, faces, uvs.astype(np.float32), {}, image, [1.0, 1.0, 1.0, 1.0],
                           None, None, asset_id)
    glb_path = out_dir / f"{asset_id}.glb"
    write_static_glb(glb_path, garment, positions, name=asset_id)
    sleeves = None
    if kind_name == "suozi":
        sleeves = {side: {"axis": {f"{name}Mu": apply(np.asarray(body.landmarks["limbs"][f"arm{side}"][f"{name}Mu"])).tolist()
                                   for name in ARM_POINTS}, "axisSource": "设计体手臂关节（模板关节经同一设计变形）"}
                   for side in ("L", "R")}
    # 衣缘锚点从生成出的几何量（与真实件同一方法），目标按设计体选；应正好落回本件设计的上 / 下沿面。
    anchors = garment_anchors(garment, design_levels, sleeves, m_per_mu)
    for key, level in (("collar", kind["top"]), ("hem", kind["bottom"])):
        if anchors[key]["target"].get("level") != level:
            raise SliceFitError(f"{kind_name} {key} 锚点选到 {anchors[key]['target']}，不是设计的 {level}")
    for side in (sleeves or {}):
        if side not in anchors["cuffs"]:
            raise SliceFitError(f"{kind_name} 袖 {side} 量不出袖口")
        sleeves[side]["cuff"] = anchors["cuffs"][side]
    align = [kind["top"], kind["bottom"]] if kind["elasticity"] <= 0 else [
        name for name in LEVEL_ORDER if design_levels[kind["bottom"]] - 0.001 <= design_levels[name] <= design_levels[kind["top"]] + 0.001]
    landmarks = {
        "schema": LANDMARK_SCHEMA, "kind": "garment", "id": asset_id, "class": "armor", "armorType": kind_name,
        "label": kind["label"], "elasticity": kind["elasticity"], "clearanceMm": 1.0,
        "rigid": kind["elasticity"] <= 0.0, "legs": "tube", "unit": "mu", "up": "+Y", "front": "+Z",
        "frame": "测试件 GLB 原坐标（设计体 = tpl_f_medium 按 design.scale / offset 变形）；levels 为设计体标注面，"
                 "collar / hem / 袖口锚点从生成的几何量出，target 为设计体上的目标面",
        "design": {"base": body.landmarks.get("template"), "scale": list(kind["scale"]), "offsetMu": list(kind["offset"]),
                   "pivotYMu": pivot, "thicknessMm": kind["thicknessMm"], "standoffMm": kind["standoffMm"]},
        "levels": {name: {"yMu": design_levels[name]} for name in reversed(LEVEL_ORDER)},
        "alignLevels": align, "anchorRule": anchors["anchorRule"],
        "collar": anchors["collar"], "hem": anchors["hem"],
        "sleeves": sleeves, "note": kind["note"],
        "source": {"file": _portable(glb_path), "sha256": _sha256(glb_path),
                   "generator": f"tools/model3d/dressup/slice_fit.py armor-fixture --kind {kind_name}"},
        "stats": {"vertices": int(len(positions)), "triangles": int(len(faces)), "components": len(parts)},
    }
    write_json(out_dir / "slice_landmarks.json", landmarks)
    (out_dir / "README.txt").write_text(kind["note"] + "\n", encoding="utf-8")
    return landmarks
