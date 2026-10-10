#!/usr/bin/env python3
"""头颈拼接标准工具：把绑骨整身 NPC 的头接到换装模板身体上（AR-109 / D1b）。

全部在模板骨架坐标里计算（单位 mu）；柱面坐标以规范颈环中心为原点、模板颈轴为 h 轴，
θ 自右（+X）转向前，背后为 270°。步骤：
1. 源头按模板 Neck→Head 骨段比例对齐，按颅宽 / 脸高几何平均缩放（沿用 D1）。
2. 在 (θ,h) 网格上光栅化源头，得皮肤 / 外包络半径场 r_skin、r_env；逐角度找可信皮肤
   连续 FLOOR_RUN_MM（6 mm）的最低起点，加余量得头皮切面 h_head（领口以上）。按角度分区：
   A 区（h_head 以上有皮肤：前与两侧）、B 区（无皮肤：后颈被头发遮住）。
3. 源头非头发三角在 h_head 处精确裁开（插值位置 / UV），切口是平滑闭合曲线。
4. 模板颈片：复制模板 h_b..h_top(θ) 之间的三角（A 区到 h_head 以上 4 mm，B 区到后脑；遮罩平面以下整块保留
   模板三角、不裁不细分，顶点与身体同权重），
   用余切拉普拉斯的双调和能量 dᵀ L M⁻¹ L d 求位移场：底带位移为 0 并沿法向外移 BOTTOM_LIFT_MM（0.3 mm）
   （盖住遮罩边界），A 区顶带贴到头皮下 0.3 mm，B 区保持模板形状但收进发帘内 3 mm。
   两端各约束一整条带，所以与身体、头皮都是 G1；接缝靠重叠而非逐点焊接。
5. 颈片重烘到头图集底部的柱面 UV 条带：底部 = 身体贴图 × skinTint（与运行时身体着色一致），
   A 区向上按角度增益到头切口处的头色，B 区向上渐变到发色（发际线）。skinTint 对准切口处的颈色
   （A 区平均增益乘回后重烘，作者 2026-10-10 方案 2），身体整体与颈子同色，颈片只剩逐角的细微差。
6. 身体遮罩只隐藏遮罩平面（规范环平面 = 底带下沿以上 MASK_OFFSET_MM）以上、与颈片同一批模板三角；
   运行时截图用 shoot_head.mjs 验证。
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from hashlib import sha256
import io
import json
import math
from pathlib import Path
import tempfile
import time
from typing import Any, Sequence

import numpy as np
from PIL import Image, ImageDraw
from scipy import sparse
from scipy.sparse.csgraph import connected_components
from scipy.sparse.linalg import splu
import yaml

try:
    from .common import closest_point_on_triangle, lbs, nearest_triangle, signed_distance
    from .export_skeleton import _bone_weights, _world_mesh
    from .glb_io import Mesh, load_glb, write_skinned_glb
    from .ingest import ingest as ingest_asset
    from .textures import _image_bytes, transform as texture_transform
    from .validate import (HOLE_TOLERANCE, _hole_rates, _load_hide_mask, _signed_distances, _world_matrices,
                           validate as validate_asset)
except ImportError:
    from common import closest_point_on_triangle, lbs, nearest_triangle, signed_distance
    from export_skeleton import _bone_weights, _world_mesh
    from glb_io import Mesh, load_glb, write_skinned_glb
    from ingest import ingest as ingest_asset
    from textures import _image_bytes, transform as texture_transform
    from validate import (HOLE_TOLERANCE, _hole_rates, _load_hide_mask, _signed_distances, _world_matrices,
                          validate as validate_asset)

TAU = 2 * math.pi
CLIP_SNAP_MU = 2e-5             # 裁切：|场值| 小于此值（约 34 µm）的顶点视为恰在切面上，避免生成 float32 下法向会翻的碎三角
SKIN_DELTA_E_MAX = 7.0          # 皮肤可信度：与脸颈参考色的 ΔE2000 上限（沿用 D1）
NECK_OUTER_RADIUS_FACTOR = 1.15  # 选面时去高领滚边的颈壳半径系数（沿用 D1）
HIDE_MASK_SIZE = 1024
ANGLE_BINS = 360                # 源头半径场的角度分辨率（1°）
NECK_PROBE_MM = (15.0, 35.0)    # 判定"有颈部皮肤的角度"所用的高度段（规范环在颈根，下巴约在 +33 mm）
FLOOR_COVERAGE = .97            # 头皮切面：这些角度上皮肤覆盖率连续 FLOOR_RUN_MM 不低于该值的最低高度
FLOOR_RUN_MM = 6.0
HEAD_FLOOR_MARGIN_MM = 2.0      # 头皮切面在该高度之上的余量
FREE_ZONE_MIN_MM = 8.0          # 颈片底带与 G1 裙带之间至少留的自由变形高度（决定头皮切面下限）
SKIN_FAMILY_MIN = .06           # 颈部皮肤选面：Head + Neck 权重均值下限（D1 只看 Head，丢了颈下半截）
HAIR_DARK_MEAN = .48            # 头发颜色：深色指 RGB 均值低于此值
HAIR_NEUTRAL_SAT = .45          # 头发颜色：深色须近中性（饱和度低于此值）或极暗（均值 < HAIR_NEAR_BLACK），棕色须 G ≥ 0.6R；
HAIR_NEAR_BLACK = .15           #   深红 / 深蓝衣领不算头发（D2 穆念慈：红领被当头发整面保留，后颈出现红色碎片）
HAIR_BROWN_GREEN_RED = .6       #   棕色的 G/R 下限（穆念慈深红领 G/R ≈ 0.43–0.51，棕发 ≥ 0.6）
COLLAR_REMNANT_BAND_MM = 12.0   # 衣领残片（D2 穆念慈后颈：深红立领、内衬、领口外翻折边裁剩的薄片）：裁后头上切口以上
COLLAR_REMNANT_OUTER_MM = 1.5   #   这一高度内、面心比自颈轴向外第一层皮肤再往外超过 OUTER 的非头发面，以颈部权重为主
COLLAR_REMNANT_HEAD_MAX = .5    #   （Head 权重 < 该值：下巴 / 脸不动）、不像发丝（深色且不偏红的算发丝：被当成皮肤的发丝不动），
COLLAR_REMNANT_MIN_FACES = 8    #   且相邻成片不少于这么多个面（发丝里零星的亮面不动）时整片去掉
COLLAR_RED_GREEN_RED = .65      #   深色但 G/R 低于此值（偏红）的是衣料，不当发丝保护
SEAM_TONE_BAND_MM = 10.0        # 切口带调平（D2 穆念慈：白内领烘进颈皮，切口处比上方亮 3–5 L*、白斑到 +17，颈片又从
SEAM_TONE_PROBE_MM = 6.0        #   切口取色，切口上下成一条亮带）：逐角量切口以上 PROBE 内头皮的中位亮度，比本人参考肤色
SEAM_TONE_LIGHT_MIN = 3.0       #   亮 MIN 以上的角度渐入、FULL 起全量（黄蓉三体型逐角最大 +2.1，不触发）；切口以上 BAND 内
SEAM_TONE_LIGHT_FULL = 5.0      #   的头皮纹素向同角度 REF 段头皮的中位色插值，HOLD 内全量（颈片顶带就在其下）、到 BAND 归零
SEAM_TONE_HOLD_MM = 4.0
SEAM_TONE_REF_MM = (12.0, 24.0)
SEAM_TONE_REF_SKIN_DE = 15.0    #   参考段须像皮肤（与本人参考肤色 ΔE76 < 该值），发帘等角度不调
SEAM_TONE_SMOOTH_DEG = 3.0      #   逐角权重的周期高斯平滑 σ（度）
SEAM_TONE_COLLAR_MM = 12.0      # 只调源件切口下方这一高度内贴着衣料（非皮肤、非头发面，颈壳半径内）的角度：领口颜色只会烘进
                                # 紧挨衣领的那圈颈皮。D2 第三版素模切口下整圈是皮肤，后颈天然比脸亮 6 L*，误调平把切口一圈
                                # 压暗 6.5 L*、上方原皮照旧，后颈成"亮块 + 横线"（5173 实拍）
BODY_TINT_RANGE = (.7, 1.4)     # 身体染色对准切口颈色（作者 2026-10-10 方案 2）后各通道 skinTint 的取值范围
NECK_FIT_RAMP_MM = 20.0         # 颈部粗细适配（D2，见 fit_neck_to_template）：切口处按需收细的量向上这一高度内渐隐到不动
NECK_FIT_MAX_MM = 4.0           #   单角最多收细这么多
NECK_FIT_SHELL = 1.12           #   只动颈壳内的点（半径 ≤ 切口处头皮半径 × 该系数），下巴 / 脸不动
NECK_FIT_BELOW_MM = 6.0         #   切口以下这一高度内的点同样收（裁切前的颈子，决定切口剖面与 G1 斜率）
NECK_FIT_SMOOTH_DEG = 3         #   逐角收细量的周期高斯平滑 σ（度，整数）
CUT_COLOR_ROWS = 2                # 切口头色：切口以上首两行（细网格行）
NECK_CENTER_PROBE_MM = 0.5      # 颈子截面对中（D2c，见 center_neck_section）：在切口以上这一高度比较头皮与模板颈子截面中心
NECK_CENTER_MAX_MM = 20.0       #   平移量上限（超出视为源头 / 模板量测异常，直接报错）
TINT_SEAM_BAND_MM = 2.0         # 身体染色对准下接缝（D2c）：取遮罩平面上下这一高度内的颈片条带行作"下接缝附近身体色"
ORNAMENT_MIN_MM = 35.0          # 非皮肤非头发的面（发饰、耳坠）只保留这一高度以上的
TOP_JUMP_MM = 6.0               # 顶带目标半径相对切面处的跳变上限（防止贴到下巴等其他表面）
REGION_SMOOTH_DEG = 5.0         # A / B 区权重的周期平滑 σ
TRANSITION_DEG = 12.0           # A 区内离 B 区不足这一角度的列算发际线过渡带：接缝 G1 / 鼓包 / 色差只报不判
PATCH_BOTTOM_MM = -3.0          # 颈片下沿 h_b（相对规范环平面，沿模板颈轴）：与之相交的模板三角整块保留，下沿是模板边
BOTTOM_BAND_MM = 8.0            # 底部重叠带：位移 0（外移 BOTTOM_LIFT_MM），与身体重叠
MASK_OFFSET_MM = 3.0            # 遮罩平面在 h_b 以上的距离 = 规范环平面（D1 裁定的规范切面）：颈根蒙皮以 Neck 为主，
                                # 动作中按 Neck 骨刚性摆动的切面能跟住遮罩开口边（D1b 审核 r3：平面放在环下 9 mm 的肩顶时，
                                # 切面漂到开口边以上 3–8 mm，隐藏区的凸肩面点按标准口径算出 −15 mm 穿入）
BOTTOM_LIFT_MM = 0.3            # 底带沿法向外移，压住身体、避免 z-fighting（颈根在 run 帧受压起拱会吃掉约 0.26 mm）
TOP_BAND_MM = 4.0               # A 区顶部重叠带：颈片沿头皮下方延伸
TOP_INSET_MM = 0.3              # A 区顶带内缩于头皮下
TOP_COVER_MM = 3.0              # 顶带外露只对"覆盖皮肤"量：bind 时离重叠带点 ≤ 此距离的头皮面（D2：头后仰时后脑皮肤
                                # 贴近颈后属头网格自接触，按全局最近头皮面量会把它当成顶带上方的皮肤，见 top_band_exposure）
G1_SKIRT_MM = 5.0               # A 区切口下方按头皮切向线性外推的约束带（保证与头皮 G1）
G1_SLOPE_MM = 3.0               # 头皮切向取切口以上这一高度内的平均斜率（与 G1 量测窗口一致）
SKIRT_ROOM_MM = 0.7             # G1 裙带向下外扩量的饱和上限：底端（底带上沿）半径余量再加这一值（D1c：tall / small 切口低、
                                # 过渡段只有 8 mm，0.5 时左后方切向被压平 5–6°；0.7 时 ≤ 4.1°、鼓包 ≤ 0.6 mm）
SEAM_SKIN_MM = 6.0              # 切口以上这一高度内的头皮一律走颈部权重场（不论半径），保证重叠带两层同权重
BACK_TOP_MM = 130.0             # B 区（后颈 / 后脑）颈片上沿
ENVELOPE_INSET_MM = 3.0         # B 区收进源头外包络（发帘内侧）的距离
PATCH_RADIUS_MAX_MM = 190.0     # 颈片 / 遮罩只取颈轴这一半径内的模板三角
PATCH_SUBDIVISIONS = 1          # 颈片一级细分次数（模板三角 2–4 mm；只细分 DENSE_LIMIT_MM 以下的面，红绿闭合）
DENSE_LIMIT_MM = 12.0           # 只细分最低点在切口以上这一高度以内的颈片面（再往上是 B 区发帘内侧，看不见）
PATCH_MERGE_MM = .05            # 颈片复制时并掉相距 < 0.05 mm 的顶点（清源网格微褶皱）
SLIVER_MM = .02                 # 裁切 / 细分后消去最小高 < 0.02 mm 的退化碎条（面积≈0，法向是数值噪声）
NEEDLE_MM = .1                  # 碎条最短边短于此值按针形并点，否则按帽形翻边（见 remove_slivers）
WEIGHT_BLEND_MM = 40.0          # 头皮下缘自颈片权重过渡到 Head 的高度
NECK_SHELL_FACTOR = 1.35        # 参与权重过渡的颈部皮肤：半径 ≤ 切面处皮肤半径 × 该系数（排除下巴 / 脸）
SHELL_FADE = .25                # 颈壳外再过这一半径比才完全归 Head（权重连续，不在单个三角里跳变）
SEAM_FADE_MM = 4.0              # 切口上沿皮肤（不论半径）属于颈部的程度向上渐隐的高度
BAND_REACH_MM = 4.0             # 离颈片重叠带这一距离内的头部顶点（不论肤 / 发）完全走颈部权重场
BAND_FADE_MM = 4.0              # 再过这一距离淡出到默认权重
COLOR_BLEND_MM = 14.0           # A 区颈片向头切口色增益的渐变高度
COLOR_SMOOTH_DEG = 4.0          # 头切口色 / 模板环色的角度平滑 σ
HAIRLINE_MM = 12.0              # B 区：h_head 以上多高开始渐变到发色
HAIRLINE_BLEND_MM = 14.0
ATLAS_SIZE = 2048
ATLAS_JPEG_QUALITY = 90         # 4:4:4 色度、单次编码
STRIP_ROWS = 256                # 图集底部条带行数（含顶部防渗 guard）
STRIP_GUARD = 12
STRIP_SEAM = 1.5 * math.pi      # 条带 u 接缝放在背后（θ = 270°，头发下）
STRIP_SPLIT_MM = 8.0            # 条带分段：h_head + 8 mm 以下（颈部可见段）给 STRIP_LOWER_ROWS 行，以上（后脑发色区）给其余行
STRIP_LOWER_ROWS = 176


def _srgb_to_linear(value: np.ndarray) -> np.ndarray:
    value = np.asarray(value, dtype=np.float64)
    return np.where(value <= .04045, value / 12.92, ((value + .055) / 1.055) ** 2.4)


def _linear_to_srgb(value: np.ndarray) -> np.ndarray:
    value = np.clip(value, 0, 1)
    return np.where(value <= .0031308, value * 12.92, 1.055 * value ** (1 / 2.4) - .055)


def _srgb_to_lab(value: np.ndarray) -> np.ndarray:
    xyz = _srgb_to_linear(value) @ np.array([
        [.4124, .3576, .1805], [.2126, .7152, .0722], [.0193, .1192, .9505],
    ]).T
    xyz /= np.array([.95047, 1, 1.08883])
    d = 6 / 29
    f = np.where(xyz > d ** 3, np.cbrt(xyz), xyz / (3 * d * d) + 4 / 29)
    return np.column_stack((116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]),
                            200 * (f[:, 1] - f[:, 2])))


def delta_e_cie2000(left: np.ndarray, right: np.ndarray) -> float:
    l1, a1, b1 = map(float, left); l2, a2, b2 = map(float, right)
    c1, c2 = math.hypot(a1, b1), math.hypot(a2, b2); cb = (c1 + c2) / 2
    g = .5 * (1 - math.sqrt(cb ** 7 / (cb ** 7 + 25 ** 7)))
    ap1, ap2 = (1 + g) * a1, (1 + g) * a2
    cp1, cp2 = math.hypot(ap1, b1), math.hypot(ap2, b2)
    hp1, hp2 = math.atan2(b1, ap1) % (2 * math.pi), math.atan2(b2, ap2) % (2 * math.pi)
    dh = hp2 - hp1
    if cp1 * cp2 == 0: dh = 0
    elif dh > math.pi: dh -= 2 * math.pi
    elif dh < -math.pi: dh += 2 * math.pi
    dl, dc = l2 - l1, cp2 - cp1
    d_h = 2 * math.sqrt(cp1 * cp2) * math.sin(dh / 2)
    lb, cbp = (l1 + l2) / 2, (cp1 + cp2) / 2
    if cp1 * cp2 == 0: hb = hp1 + hp2
    elif abs(hp1 - hp2) <= math.pi: hb = (hp1 + hp2) / 2
    elif hp1 + hp2 < 2 * math.pi: hb = (hp1 + hp2 + 2 * math.pi) / 2
    else: hb = (hp1 + hp2 - 2 * math.pi) / 2
    t = (1 - .17 * math.cos(hb - math.radians(30)) + .24 * math.cos(2 * hb)
         + .32 * math.cos(3 * hb + math.radians(6)) - .20 * math.cos(4 * hb - math.radians(63)))
    sl = 1 + .015 * (lb - 50) ** 2 / math.sqrt(20 + (lb - 50) ** 2)
    sc, sh = 1 + .045 * cbp, 1 + .015 * cbp * t
    rc = 2 * math.sqrt(cbp ** 7 / (cbp ** 7 + 25 ** 7))
    rt = -math.sin(2 * math.radians(30) * math.exp(-((math.degrees(hb) - 275) / 25) ** 2)) * rc
    return math.sqrt((dl / sl) ** 2 + (dc / sc) ** 2 + (d_h / sh) ** 2
                     + rt * (dc / sc) * (d_h / sh))


def _texture(glb: Any) -> Image.Image | None:
    materials = glb.json.get("materials", [])
    if not materials: return None
    pbr = materials[0].get("pbrMetallicRoughness", {})
    if "baseColorTexture" not in pbr: return None
    texture = glb.json["textures"][pbr["baseColorTexture"]["index"]]
    data = _image_bytes(glb.path, glb.json, glb.bin, texture["source"])
    return Image.open(io.BytesIO(data)).convert("RGB")


def vertex_colors(glb: Any, mesh: Mesh) -> np.ndarray:
    image = _texture(glb)
    if image is None or mesh.uvs is None: return np.full((len(mesh.positions), 3), .65)
    array = np.asarray(image, dtype=np.float64) / 255
    x = np.clip(mesh.uvs[:, 0], 0, 1) * (image.width - 1)
    y = np.clip(mesh.uvs[:, 1], 0, 1) * (image.height - 1)
    return array[y.astype(int), x.astype(int)]


def _weights_for(mesh: Mesh, slot: int) -> np.ndarray:
    return _bone_weights(mesh, slot)


def classify_vertices(glb: Any, mesh: Mesh, positions: np.ndarray, slots: dict[str, int]) -> dict[str, np.ndarray]:
    """以脸颈参考色的 Lab 距离分皮肤；深色 / 棕色头骨族顶点分作头发。"""
    colors = vertex_colors(glb, mesh)
    head = _weights_for(mesh, slots["mixamorig:Head"])
    neck = _weights_for(mesh, slots["mixamorig:Neck"])
    family = head + neck > .04
    high, low = colors.max(axis=1), colors.min(axis=1)
    saturation = (high - low) / np.maximum(high, 1e-8)
    warm = ((colors[:, 0] > colors[:, 1] * 1.015) &
            (colors[:, 1] > colors[:, 2] * 1.01) &
            (colors[:, 0] > .38) & (saturation > .06) & (saturation < .58))
    reference_mask = warm & (head > .12) & (colors.mean(axis=1) > .52)
    if np.count_nonzero(reference_mask) < 16: reference_mask = warm & family
    reference = np.median(colors[reference_mask], axis=0)
    reference_lab = _srgb_to_lab(reference[None, :])[0]
    color_labs = _srgb_to_lab(colors)
    skin_delta = np.fromiter((delta_e_cie2000(value, reference_lab) for value in color_labs),
                             dtype=np.float64, count=len(colors))
    skin = warm & family
    trusted_skin = skin & (skin_delta < SKIN_DELTA_E_MAX)
    hair = family & ~skin & hair_colors(colors)
    return {"skin": skin, "trustedSkin": trusted_skin, "hair": hair,
            "colors": colors, "skinDeltaE": skin_delta,
            "skinReferenceSrgb": reference, "skinDeltaEThreshold": SKIN_DELTA_E_MAX,
            "headWeight": head, "neckWeight": neck}


def hair_colors(colors: np.ndarray) -> np.ndarray:
    """头发候选色：近中性的深色（含极暗的任意色相）或棕色。高饱和的深红 / 深蓝等衣料色不算——
    后颈裸露（发髻全盘）时衣领贴着切口，按旧规则（深色或偏棕即头发）会被当头发整面保留（D2）。"""
    colors = np.asarray(colors, dtype=np.float64)
    high, low, mean = colors.max(axis=1), colors.min(axis=1), colors.mean(axis=1)
    saturation = (high - low) / np.maximum(high, 1e-8)
    neutral_dark = (mean < HAIR_DARK_MEAN) & ((saturation < HAIR_NEUTRAL_SAT) | (mean < HAIR_NEAR_BLACK))
    brown = ((colors[:, 0] > colors[:, 1] * 1.03) & (colors[:, 1] >= colors[:, 2] * .96)
             & (colors[:, 1] >= colors[:, 0] * HAIR_BROWN_GREEN_RED))
    return neutral_dark | brown


def _bone_frame(glb: Any, slots: dict[str, int]) -> dict[str, np.ndarray]:
    neck = glb.world_matrix(glb.skin().joints[slots["mixamorig:Neck"]])[:3, 3]
    head = glb.world_matrix(glb.skin().joints[slots["mixamorig:Head"]])[:3, 3]
    axis = head - neck; length = float(np.linalg.norm(axis)); axis /= length
    right = np.array([1., 0, 0]); right -= axis * np.dot(right, axis); right /= np.linalg.norm(right)
    front = np.cross(right, axis)
    if front[2] < 0: front = -front; right = -right
    return {"neck": neck, "head": head, "axis": axis, "right": right,
            "front": front, "length": np.array(length)}


def cut_plane_from_bone_ratio(source_glb: Any, source_slots: dict[str, int],
                              template_glb: Any, template_slots: dict[str, int],
                              ring_center: np.ndarray) -> dict[str, Any]:
    source, template = _bone_frame(source_glb, source_slots), _bone_frame(template_glb, template_slots)
    segment = template["head"] - template["neck"]
    fraction = float(np.dot(ring_center - template["neck"], segment) / np.dot(segment, segment))
    return {"fraction": fraction, "sourceCenter": source["neck"] + fraction *
            (source["head"] - source["neck"]), "source": source, "template": template}


def _robust_extent(values: np.ndarray, low: float = 1, high: float = 99) -> float:
    if len(values) < 4: raise ValueError("量头样本不足")
    return float(np.percentile(values, high) - np.percentile(values, low))


def skin_section_radius(positions: np.ndarray, colors: np.ndarray, skin: np.ndarray,
                        cut: dict[str, Any], half_width: float = .003) -> tuple[dict[str, float], int]:
    """源头在切面处的颈部皮肤截面半径（沿用 D1，供 fit.json.ring 的兼容字段）。"""
    rel = positions - cut["sourceCenter"]; height = rel @ cut["source"]["axis"]
    mask = skin & (np.abs(height) <= half_width)
    # 高领边缘会被抗锯齿染成暖灰；截面报告只计与脸颈肤色相符的明亮像素。
    if np.any(mask):
        brightness = colors.mean(axis=1); threshold = max(.58, float(np.percentile(brightness[mask], 55)))
        filtered = mask & (brightness >= threshold)
        if np.count_nonzero(filtered) >= 12: mask = filtered
    x, z = rel[mask] @ cut["source"]["right"], rel[mask] @ cut["source"]["front"]
    if len(x) < 8: return {"x": 0., "z": 0.}, int(len(x))
    return {"x": float(np.percentile(np.abs(x), 82)),
            "z": float(np.percentile(np.abs(z), 82))}, int(len(x))


def measure_head(positions: np.ndarray, classified: dict[str, np.ndarray], frame: dict[str, np.ndarray]) -> dict[str, float]:
    rel = positions - frame["head"]
    axial, lateral, depth = rel @ frame["axis"], rel @ frame["right"], rel @ frame["front"]
    skin = classified["skin"] & (classified["headWeight"] > .08)
    if np.count_nonzero(skin) < 64: raise ValueError("无法从头部贴图取得足够皮肤顶点")
    # 耳高取 Head 局部轴中段；排掉前鼻尖后以 1/99 分位数测颅宽。
    mid = skin & (axial >= np.percentile(axial[skin], 35)) & (axial <= np.percentile(axial[skin], 70))
    ear_width = _robust_extent(lateral[mid] if np.count_nonzero(mid) >= 32 else lateral[skin])
    front_skin = skin & (depth >= np.percentile(depth[skin], 58))
    chin = float(np.percentile(axial[front_skin], 2))
    brow = float(np.percentile(axial[front_skin], 63))
    face_height = brow - chin
    mouth_band = front_skin & (axial >= chin) & (axial <= chin + max(face_height * .52, .012))
    mouth = float(np.percentile(axial[mouth_band], 72)) if np.any(mouth_band) else chin + face_height * .36
    return {"earWidthMu": ear_width, "faceHeightMu": face_height,
            "chinAxialMu": chin, "mouthAxialMu": mouth,
            "chinMouthRatio": (mouth - chin) / max(face_height, 1e-9)}


def target_head_measures(template_dir: Path, skeleton: dict[str, Any]) -> dict[str, float]:
    profile = json.loads((template_dir / skeleton["skullProfile"]["file"]).read_text())
    rows = profile["rows"]
    # 中下脸高度不用发髻/颅顶；skullProfile 在 Head 局部的 20--70 百分段提供稳定比例。
    span = float(np.percentile([r["yMu"] for r in rows], 70) -
                 np.percentile([r["yMu"] for r in rows], 20))
    return {"earWidthMu": float(skeleton["measures"]["headWidthMu"]),
            "faceHeightMu": span}


def head_scale(measured: dict[str, float], target: dict[str, float]) -> tuple[float, float, dict[str, float]]:
    width_scale = target["earWidthMu"] / measured["earWidthMu"]
    face_scale = target["faceHeightMu"] / measured["faceHeightMu"]
    raw = math.sqrt(width_scale * face_scale)
    return raw, float(np.clip(raw, .92, 1.08)), {"widthScale": width_scale, "faceScale": face_scale}


def _rotation(source: dict[str, np.ndarray], target: dict[str, np.ndarray]) -> np.ndarray:
    src = np.column_stack((source["right"], source["axis"], source["front"]))
    dst = np.column_stack((target["right"], target["axis"], target["front"]))
    result = dst @ src.T
    if np.linalg.det(result) < .999: raise ValueError("源/模板骨架坐标系不能用正旋转对齐")
    return result


def transform_head(points: np.ndarray, normals: np.ndarray | None, cut: dict[str, Any],
                   ring_center: np.ndarray, scale: float) -> tuple[np.ndarray, np.ndarray | None, np.ndarray]:
    rotation = _rotation(cut["source"], cut["template"])
    transformed = (points - cut["sourceCenter"]) @ rotation.T * scale + ring_center
    transformed_normals = None if normals is None else normals @ rotation.T
    return transformed, transformed_normals, rotation


def _vertex_normals(positions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    result = np.zeros_like(positions, dtype=np.float64)
    tri = positions[faces]; normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    for corner in range(3): np.add.at(result, faces[:, corner], normals)
    length = np.linalg.norm(result, axis=1, keepdims=True)
    return np.divide(result, length, out=np.zeros_like(result), where=length > 1e-12)


def skin_match(source_colors: np.ndarray, classified: dict[str, np.ndarray], source_positions: np.ndarray,
               cut: dict[str, Any], template_colors: np.ndarray, template_mesh: Mesh,
               template_skeleton: dict[str, Any], tint: np.ndarray | None = None) -> dict[str, Any]:
    height = (source_positions - cut["sourceCenter"]) @ cut["source"]["axis"]
    source_mask = classified["skin"] & (height >= .005) & (height <= .065)
    if np.count_nonzero(source_mask) < 16: source_mask = classified["skin"]
    head_region = template_skeleton["regions"]["ids"]["head"]
    neck_region = template_skeleton["regions"]["ids"]["neck"]
    template_mask = np.isin(template_mesh.regions, [head_region, neck_region])
    source_samples = source_colors[source_mask]
    template_samples = template_colors[template_mask]
    source = np.mean(source_samples, axis=0)
    template = np.mean(template_samples, axis=0)
    if tint is None: tint = np.clip(_srgb_to_linear(source) / np.maximum(_srgb_to_linear(template), 1e-6), .8, 1.25)
    tinted_samples = _linear_to_srgb(_srgb_to_linear(template_samples) * tint)
    tinted = np.mean(tinted_samples, axis=0)
    lab = _srgb_to_lab(np.stack((source, template, tinted)))
    return {"sourceSrgb": source, "templateSrgb": template, "tintedTemplateSrgb": tinted,
            "averageSpace": "sRGB arithmetic mean",
            "skinTint": tint,
            "deltaEBefore": delta_e_cie2000(lab[0], lab[1]),
            "deltaE": delta_e_cie2000(lab[0], lab[2]),
            "sourceSamples": int(np.count_nonzero(source_mask)),
            "templateSamples": int(np.count_nonzero(template_mask))}


def _face_colors(glb: Any, mesh: Mesh) -> np.ndarray:
    colors = vertex_colors(glb, mesh); return (colors[mesh.indices.reshape(-1, 3)].mean(axis=1) * 255).astype(np.uint8)


def _sample_mask(mask: Image.Image, uvs: np.ndarray) -> np.ndarray:
    """复现运行时 LinearFilter + clamp-to-edge 的红通道采样。"""
    values = np.asarray(mask.convert("L"), dtype=np.float64)
    x = np.clip(uvs[:, 0] * mask.width - .5, 0, mask.width - 1)
    y = np.clip(uvs[:, 1] * mask.height - .5, 0, mask.height - 1)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    x1, y1 = np.minimum(x0 + 1, mask.width - 1), np.minimum(y0 + 1, mask.height - 1)
    fx, fy = x - x0, y - y0
    return ((1 - fy) * ((1 - fx) * values[y0, x0] + fx * values[y0, x1])
            + fy * ((1 - fx) * values[y1, x0] + fx * values[y1, x1]))


def _masked_surface(body: Mesh, mask: Image.Image) -> dict[str, Any]:
    """把 UV mask 的 128 等值线转成可动画的裁切拓扑。"""
    if body.uvs is None: raise ValueError("模板缺 UV，不能应用 hide mask")
    faces = body.indices.reshape(-1, 3); values = _sample_mask(mask, body.uvs).astype(float)
    visible = np.all(values[faces] < 128, axis=1)
    hidden = np.all(values[faces] >= 128, axis=1)
    output_faces = [face.tolist() for face in faces[visible]]
    edges: list[tuple[int, int, float]] = []
    next_vertex = len(body.positions)
    for face in faces[~visible & ~hidden]:
        polygon: list[tuple[int, int, float] | int] = []
        for corner, current in enumerate(face):
            previous = int(face[corner - 1]); current = int(current)
            current_in, previous_in = values[current] < 128, values[previous] < 128
            if current_in != previous_in:
                alpha = float((128 - values[previous]) / (values[current] - values[previous]))
                edges.append((previous, current, alpha)); polygon.append(next_vertex); next_vertex += 1
            if current_in: polygon.append(current)
        for corner in range(1, len(polygon) - 1):
            output_faces.append([polygon[0], polygon[corner], polygon[corner + 1]])
    return {"faces": np.asarray(output_faces, np.int64), "edges": edges,
            "hiddenTriangles": int(np.count_nonzero(hidden)),
            "clippedTriangles": int(np.count_nonzero(~visible & ~hidden))}


def _masked_positions(positions: np.ndarray, surface: dict[str, Any]) -> np.ndarray:
    edges = surface["edges"]
    if not edges: return positions
    extra = np.asarray([positions[left] * (1 - alpha) + positions[right] * alpha
                        for left, right, alpha in edges])
    return np.concatenate((positions, extra))


def render_preview(path: Path, template_glb: Any, template_mesh: Mesh, head_glb: Any, head_mesh: Mesh,
                   ring_center: np.ndarray, mask_path: Path, size: int = 500,
                   body_tint: Sequence[float] | None = None, check_path: Path | None = None) -> None:
    mask = Image.open(mask_path).convert("L")
    surface = _masked_surface(template_mesh, mask); all_faces = surface["faces"]
    body_positions = _masked_positions(template_mesh.positions, surface)
    colors = vertex_colors(template_glb, template_mesh)
    if body_tint is not None:
        colors = _linear_to_srgb(_srgb_to_linear(colors) * np.asarray(body_tint))
    edge_colors = np.asarray([colors[left] * (1 - alpha) + colors[right] * alpha
                              for left, right, alpha in surface["edges"]])
    body_vertex_colors = np.concatenate((colors, edge_colors)) if len(edge_colors) else colors
    body_polygons = [body_positions[face] for face in all_faces]
    body_colors = [(body_vertex_colors[face].mean(axis=0) * 255).astype(np.uint8) for face in all_faces]
    head_faces = head_mesh.indices.reshape(-1, 3); head_colors = _face_colors(head_glb, head_mesh)

    def panel(canvas: Image.Image, origin: tuple[int, int], yaw: float, zoom: bool = False,
              draw_head: bool = True) -> None:
        draw = ImageDraw.Draw(canvas); c, s = math.cos(yaw), math.sin(yaw)
        def rotate(points: np.ndarray) -> np.ndarray:
            return np.column_stack((points[:, 0] * c + points[:, 2] * s, points[:, 1],
                                    -points[:, 0] * s + points[:, 2] * c))
        rb, rh = rotate(body_positions), rotate(head_mesh.positions)
        if zoom:
            center = rotate(np.asarray(ring_center)[None, :])[0]
            bounds = np.array([[center[0] - .065, center[1] - .035], [center[0] + .065, center[1] + .095]])
        else:
            all_xy = np.concatenate((rb[:, :2], rh[:, :2])); bounds = np.array([all_xy.min(0), all_xy.max(0)])
        scale = min((size - 20) / max(bounds[1, 0] - bounds[0, 0], 1e-6),
                    (size - 20) / max(bounds[1, 1] - bounds[0, 1], 1e-6))
        center = bounds.mean(0)
        def project(points: np.ndarray) -> np.ndarray:
            return np.column_stack(((points[:, 0] - center[0]) * scale + origin[0] + size / 2,
                                    origin[1] + size / 2 - (points[:, 1] - center[1]) * scale))
        ph = project(rh); entries = []
        for polygon, color in zip(body_polygons, body_colors):
            rotated = rotate(polygon); entries.append((float(rotated[:, 2].mean()), project(rotated), color))
        if draw_head:
            entries += [(float(rh[f, 2].mean()), ph[f], color) for f, color in zip(head_faces, head_colors)]
        for _, polygon, color in sorted(entries, key=lambda item: item[0]):
            draw.polygon([tuple(point) for point in polygon], fill=tuple(map(int, color)))
    canvas = Image.new("RGB", (size * 3, size * 2), (247, 245, 240))
    panel(canvas, (0, 0), 0); panel(canvas, (size, 0), math.pi / 2); panel(canvas, (size * 2, 0), math.pi)
    panel(canvas, (0, size), 0, True); panel(canvas, (size, size), math.pi / 2, True)
    canvas.save(path)
    check = Image.new("RGB", (size, size), (247, 245, 240)); panel(check, (0, 0), 0, draw_head=False)
    check.save(check_path or path.with_name("self_check_preview.png"))


def _round(value: Any) -> Any:
    if isinstance(value, dict): return {key: _round(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)): return [_round(item) for item in value]
    if isinstance(value, np.ndarray): return _round(value.tolist())
    if isinstance(value, (np.floating, float)): return round(float(value), 9)
    if isinstance(value, (np.integer,)): return int(value)
    return value


OUTPUT_KEYS = ("glb", "fit", "report", "mask", "preview", "check")


def output_names(out_dir: Path, template_name: str) -> dict[str, str]:
    """产物文件名。目录里还没有 manifest、或 manifest 的主模板就是本模板时不带后缀（head.glb、fit.json …）；
    否则是同一 NPC 的另一体型变体，统一加 .<模板> 后缀（head.tpl_f_tall.glb、hidemask.tpl_f_tall.png …，
    与 ingest 的变体命名、validate 的 holes_preview.<模板>.png 一致），manifest 在 fits 下按模板登记。"""
    primary = None
    manifest = out_dir / "manifest.yaml"
    if manifest.is_file():
        rows = yaml.safe_load(manifest.read_text(encoding="utf-8"))
        if isinstance(rows, list) and rows and isinstance(rows[0], dict): primary = rows[0].get("template")
    suffix = "" if primary in (None, template_name) else f".{template_name}"
    return {"suffix": suffix, "glb": f"head{suffix}.glb", "fit": f"fit{suffix}.json", "report": f"report{suffix}.json",
            "mask": f"hidemask{suffix}.png", "preview": f"preview{suffix}.png",
            "check": f"self_check_preview{suffix}.png"}


def _file_digests(out_dir: Path, names: dict[str, str]) -> dict[str, dict[str, Any]]:
    digests = {}
    for key in OUTPUT_KEYS:
        data = (out_dir / names[key]).read_bytes()
        digests[names[key]] = {"sha256": sha256(data).hexdigest(), "bytes": len(data)}
    return digests


def _write_manifest(out_dir: Path, npc_id: str, report: dict[str, Any], template_name: str,
                    names: dict[str, str]) -> None:
    """先经 ingest 校验（主体型与变体同一口径：report 主体 / 模板身份 / 输入摘要），再写 manifest：
    主体型重写顶层字段，保留其他体型的 fits 与文件摘要；变体只更新 fits[模板] 与自己的文件摘要。"""
    manifest_path = out_dir / "manifest.yaml"
    existing = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))[0] if manifest_path.is_file() else None
    with tempfile.TemporaryDirectory() as temporary:
        source = out_dir
        if names["suffix"]:                       # ingest 按主名读源目录：变体先以主名拷到临时目录
            source = Path(temporary) / "src"; source.mkdir()
            for key, name in (("glb", "head.glb"), ("fit", "fit.json"), ("report", "report.json")):
                (source / name).write_bytes((out_dir / names[key]).read_bytes())
        root = Path(temporary) / "assets"
        args = argparse.Namespace(kind="head", id=npc_id, src=source,
                                  template=template_name, slot="body", item=None,
                                  asset_root=root, commit=False)
        ingest_asset(args)
        generated = yaml.safe_load((root / "heads" / npc_id / "manifest.yaml").read_text())[0]
    digests = _file_digests(out_dir, names)
    if not names["suffix"]:
        generated.update({"npc": npc_id, "experimental": True,
                          "gateLevel": report["gateLevel"],
                          "vertices": report["stats"]["vertices"],
                          "triangles": report["stats"]["triangles"]})
        others = {name: entry for name, entry in (existing or {}).get("fits", {}).items() if name != template_name}
        generated["fits"] = {**generated["fits"], **others}
        generated["files"] = {**digests, **{name: entry for name, entry in (existing or {}).get("files", {}).items()
                                            if name not in digests}}
        row = generated
    else:
        if existing is None: raise ValueError("先产出主体型（无后缀）再加体型变体")
        row = existing
        row.setdefault("fits", {})[template_name] = {
            "file": names["glb"], "fit": names["fit"], "report": names["report"],
            "status": generated["status"], "gateLevel": report["gateLevel"],
            "sha256": digests[names["glb"]]["sha256"], "size_bytes": digests[names["glb"]]["bytes"],
            "vertices": report["stats"]["vertices"], "triangles": report["stats"]["triangles"]}
        row["files"] = {**{name: entry for name, entry in row.get("files", {}).items() if name not in digests},
                        **digests}
    manifest_path.write_text(yaml.safe_dump([row], allow_unicode=True, sort_keys=False, width=120), encoding="utf-8")


def _drop_variant(out_dir: Path, template_name: str, names: dict[str, str]) -> None:
    """变体本次不通过：从 manifest 撤下该体型（构建不再发布它），文件留在目录里供排查。"""
    manifest_path = out_dir / "manifest.yaml"
    if not names["suffix"] or not manifest_path.is_file(): return
    row = yaml.safe_load(manifest_path.read_text(encoding="utf-8"))[0]
    row.get("fits", {}).pop(template_name, None)
    for key in OUTPUT_KEYS: row.get("files", {}).pop(names[key], None)
    manifest_path.write_text(yaml.safe_dump([row], allow_unicode=True, sort_keys=False, width=120), encoding="utf-8")



# ---------------------------------------------------------------- 柱面坐标与 (θ,h) 光栅化

def neck_frame(cut: dict[str, Any], ring_center: np.ndarray) -> dict[str, np.ndarray]:
    """模板颈轴柱面坐标系：原点为规范颈环中心，θ 从右（+X）转向前，背后为 270°。"""
    template = cut["template"]
    return {"center": np.asarray(ring_center, dtype=np.float64), "axis": np.asarray(template["axis"], float),
            "right": np.asarray(template["right"], float), "front": np.asarray(template["front"], float)}


def cylinder(points: np.ndarray, frame: dict[str, np.ndarray]) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rel = np.asarray(points, dtype=np.float64) - frame["center"]
    x, h, z = rel @ frame["right"], rel @ frame["axis"], rel @ frame["front"]
    return np.mod(np.arctan2(z, x), TAU), h, np.hypot(x, z)


def from_cylinder(theta: np.ndarray, h: np.ndarray, rho: np.ndarray, frame: dict[str, np.ndarray]) -> np.ndarray:
    return (frame["center"] + np.outer(h, frame["axis"]) + np.outer(rho * np.cos(theta), frame["right"])
            + np.outer(rho * np.sin(theta), frame["front"]))


@dataclass
class CylinderGrid:
    """(θ,h) 网格；格心 θ_i = offset + (i+½)·2π/n，h_j = lo + (j+½)·Δh。"""

    theta_count: int
    h_lo: float
    h_hi: float
    h_count: int
    theta_offset: float = 0.

    @property
    def dtheta(self) -> float: return TAU / self.theta_count

    @property
    def dh(self) -> float: return (self.h_hi - self.h_lo) / self.h_count

    def theta_centers(self) -> np.ndarray:
        return self.theta_offset + (np.arange(self.theta_count) + .5) * self.dtheta

    def h_centers(self) -> np.ndarray:
        return self.h_lo + (np.arange(self.h_count) + .5) * self.dh


def rasterize_cylinder(points: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray], grid: CylinderGrid,
                       corner_values: np.ndarray | None = None, rho_min: float = 0.
                       ) -> tuple[np.ndarray, np.ndarray, np.ndarray | None]:
    """在 (θ,h) 网格上光栅化三角，逐格保留半径最小者（自颈轴向外的第一层表面）。

    corner_values 为可选的 (F,3,k) 逐角属性，按 (θ,h) 平面重心插值。跨越颈轴（θ 跨度 > 90°）
    或贴近颈轴（半径 ≤ rho_min）的三角不参与。返回 rho（无覆盖为 inf）、face（-1）、values。

    半径取格心径向射线与三角所在平面的精确交点：(θ,h) 上线性插值 ρ 等于沿圆弧插值，大三角中部
    比真实平面偏外（跨 18° 约 0.4 mm，D1b 实测使顶带 bind 时就贴到皮外）。射线与平面近乎平行
    （夹角 < 12°）时退回线性插值。
    """
    points = np.asarray(points, dtype=np.float64)
    theta, h, rho = cylinder(points, frame)
    theta = np.mod(theta - grid.theta_offset, TAU)
    local = np.stack(((points - frame["center"]) @ frame["right"], (points - frame["center"]) @ frame["axis"],
                      (points - frame["center"]) @ frame["front"]), axis=1)
    best = np.full((grid.theta_count, grid.h_count), np.inf)
    face_id = np.full((grid.theta_count, grid.h_count), -1, dtype=np.int64)
    k = 0 if corner_values is None else corner_values.shape[2]
    values = np.zeros((grid.theta_count, grid.h_count, k)) if k else None
    dtheta, dh = grid.dtheta, grid.dh
    for index, face in enumerate(np.asarray(faces)):
        r = rho[face]
        if r.min() <= rho_min: continue
        t = theta[face].copy()
        t[1:] = t[0] + (np.mod(t[1:] - t[0] + math.pi, TAU) - math.pi)
        if t.max() - t.min() > math.pi / 2: continue
        hh = h[face]
        det = (t[1] - t[0]) * (hh[2] - hh[0]) - (t[2] - t[0]) * (hh[1] - hh[0])
        if abs(det) < 1e-18: continue
        i0, i1 = math.floor(t.min() / dtheta - .5), math.ceil(t.max() / dtheta - .5)
        j0 = max(math.floor((hh.min() - grid.h_lo) / dh - .5), 0)
        j1 = min(math.ceil((hh.max() - grid.h_lo) / dh - .5), grid.h_count - 1)
        if j1 < j0: continue
        ii, jj = np.arange(i0, i1 + 1), np.arange(j0, j1 + 1)
        gt, gh = np.meshgrid((ii + .5) * dtheta, grid.h_lo + (jj + .5) * dh, indexing="ij")
        b1 = ((gt - t[0]) * (hh[2] - hh[0]) - (t[2] - t[0]) * (gh - hh[0])) / det
        b2 = ((t[1] - t[0]) * (gh - hh[0]) - (gt - t[0]) * (hh[1] - hh[0])) / det
        b0 = 1 - b1 - b2
        inside = (b0 >= -1e-9) & (b1 >= -1e-9) & (b2 >= -1e-9)
        if not inside.any(): continue
        radius = b0 * r[0] + b1 * r[1] + b2 * r[2]
        corner_xyz = local[face]
        normal = np.cross(corner_xyz[1] - corner_xyz[0], corner_xyz[2] - corner_xyz[0])
        length = float(np.linalg.norm(normal))
        if length > 0:
            angle = gt + grid.theta_offset
            facing = np.cos(angle) * normal[0] + np.sin(angle) * normal[2]
            usable = np.abs(facing) > .2 * length
            exact = np.divide(normal @ corner_xyz[0] - gh * normal[1], facing,
                              out=np.full_like(facing, np.nan), where=usable)
            usable &= (exact >= .5 * r.min()) & (exact <= r.max() * 1.01)
            radius = np.where(usable, exact, radius)
        ci = np.broadcast_to(np.mod(ii, grid.theta_count)[:, None], inside.shape)
        cj = np.broadcast_to(jj[None, :], inside.shape)
        take = inside & (radius < best[ci, cj])
        if not take.any(): continue
        best[ci[take], cj[take]] = radius[take]; face_id[ci[take], cj[take]] = index
        if k:
            corner = corner_values[index]
            values[ci[take], cj[take]] = (b0[take][:, None] * corner[0] + b1[take][:, None] * corner[1]
                                          + b2[take][:, None] * corner[2])
    return best, face_id, values


def sample_grid(field: np.ndarray, grid: CylinderGrid, theta: np.ndarray, h: np.ndarray) -> np.ndarray:
    """θ 周期、h 截断的双线性采样；任一相邻格无效（非有限）即返回 nan。"""
    x = np.mod(np.asarray(theta) - grid.theta_offset, TAU) / grid.dtheta - .5
    y = np.clip((np.asarray(h) - grid.h_lo) / grid.dh - .5, 0, grid.h_count - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    x0 %= grid.theta_count; x1 = (x0 + 1) % grid.theta_count; y1 = np.minimum(y0 + 1, grid.h_count - 1)
    field = np.where(np.isfinite(field), field, np.nan)      # 无覆盖格（inf）按 nan 传播，避免 0 × inf 告警
    values = ((1 - fx) * (1 - fy) * field[x0, y0] + fx * (1 - fy) * field[x1, y0]
              + (1 - fx) * fy * field[x0, y1] + fx * fy * field[x1, y1])
    return np.where(np.isfinite(values), values, np.nan)


def smooth_cyclic(values: np.ndarray, sigma_bins: float, valid: np.ndarray | None = None) -> np.ndarray:
    """周期高斯平滑（归一化卷积，无效样本不参与）；沿首轴平滑，可带尾随通道。"""
    count = len(values); offsets = np.arange(-int(3 * sigma_bins) - 1, int(3 * sigma_bins) + 2)
    kernel = np.exp(-.5 * (offsets / max(sigma_bins, 1e-9)) ** 2)
    weight = np.ones(count) if valid is None else valid.astype(np.float64)
    data = np.where(weight.reshape((-1,) + (1,) * (values.ndim - 1)) > 0, values, 0.)
    total = np.zeros_like(data, dtype=np.float64); norm = np.zeros(count)
    for offset, factor in zip(offsets, kernel):
        total += factor * np.roll(data * weight.reshape((-1,) + (1,) * (values.ndim - 1)), offset, axis=0)
        norm += factor * np.roll(weight, offset)
    out = total / np.maximum(norm, 1e-12).reshape((-1,) + (1,) * (values.ndim - 1))
    return np.where((norm > 1e-9).reshape((-1,) + (1,) * (values.ndim - 1)), out, np.nan)


def _smoothstep(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0., 1.); return x * x * (3 - 2 * x)


# ---------------------------------------------------------------- 网格裁切 / 焊接 / 拉普拉斯

def weld_vertices(positions: np.ndarray, faces: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """按位置精确相等焊接（UV 缝处的重复点）；返回 (唯一位置, 新面, 原点→唯一点映射)。"""
    unique, first, inverse = np.unique(np.asarray(positions, dtype=np.float32), axis=0,
                                       return_index=True, return_inverse=True)
    inverse = inverse.reshape(-1)
    return np.asarray(positions, dtype=np.float64)[first], inverse[np.asarray(faces)], inverse


def sliver_height(triangles: np.ndarray) -> np.ndarray:
    """逐三角最小高（2·面积 / 最长边）；triangles 为 (F,3,3) 顶点坐标。"""
    area2 = np.linalg.norm(np.cross(triangles[:, 1] - triangles[:, 0], triangles[:, 2] - triangles[:, 0]), axis=1)
    longest = np.max(np.linalg.norm(triangles[:, [1, 2, 0]] - triangles, axis=2), axis=1)
    return area2 / np.maximum(longest, 1e-30)


def sliver_faces(positions: np.ndarray, faces: np.ndarray, min_height: float) -> np.ndarray:
    """最小高（2·面积 / 最长边）小于 min_height 的退化三角。"""
    return sliver_height(positions[faces]) < min_height


def remove_slivers(positions: np.ndarray, faces: np.ndarray, corner_values: np.ndarray, min_height: float,
                   needle_length: float, passes: int = 8) -> tuple[np.ndarray, np.ndarray, dict[str, int]]:
    """消去最小高 < min_height 的退化三角，网格保持流形、不开洞。直接删内部碎条会留下 4–6 点的小洞和零宽
    裂缝（D1c 实测 tall / small 模板颈片上各有 5 / 3 处），洞边被当成侧向开口钉在模板原位，顶出 5 mm 鼓包：

    - 针形（最短边 < needle_length）：短边并成一点（保留在边界上的那一端），满足环邻条件才并；
    - 帽形（顶点几乎落在最长边上）：与最长边对面的三角翻边。顶点在边上，翻后两三角与原两三角同一曲面；
      新三角取对面三角的逐角属性，顶点处按其在最长边上的参数插值；
    - 最长边在边界上的帽形：顶点不在边界上时直接删（边界改走该顶点），否则保留。
    返回 (面, 逐角属性, 统计)；顶点数组不变，并掉的点不再被引用（由 compact_mesh 清掉）。"""
    positions = np.asarray(positions, dtype=np.float64)
    face_list = [[int(v) for v in face] for face in np.asarray(faces)]
    corners = [np.array(corner, dtype=np.float64) for corner in np.asarray(corner_values)]
    alive = np.ones(len(face_list), bool)
    edge_face: dict[tuple[int, int], int] = {}
    vertex_faces: dict[int, set[int]] = {}
    def attach(index: int, face: list[int], corner: np.ndarray) -> None:
        face_list[index], corners[index], alive[index] = face, corner, True
        for k in range(3):
            edge_face[(face[k], face[(k + 1) % 3])] = index
            vertex_faces.setdefault(face[k], set()).add(index)
    def detach(index: int) -> None:
        face = face_list[index]
        for k in range(3):
            if edge_face.get((face[k], face[(k + 1) % 3])) == index: del edge_face[(face[k], face[(k + 1) % 3])]
            vertex_faces[face[k]].discard(index)
        alive[index] = False
    for index, face in enumerate(face_list): attach(index, face, corners[index])
    def on_boundary(vertex: int) -> bool:
        for index in vertex_faces.get(vertex, ()):
            face = face_list[index]
            for k in range(3):
                a, b = face[k], face[(k + 1) % 3]
                if vertex in (a, b) and (b, a) not in edge_face: return True
        return False
    def ring(vertex: int) -> set[int]:
        return {v for index in vertex_faces.get(vertex, ()) for v in face_list[index]} - {vertex}
    def height(face: list[int]) -> float:
        return float(sliver_height(positions[np.asarray(face)][None])[0])
    stats = {"slivers": 0, "collapsed": 0, "flipped": 0, "deleted": 0, "remaining": 0}
    def collapse(keep: int, drop: int) -> bool:
        if on_boundary(drop) and not on_boundary(keep): keep, drop = drop, keep
        shared = vertex_faces[keep] & vertex_faces[drop]
        opposite = {v for index in shared for v in face_list[index]} - {keep, drop}
        if ring(keep) & ring(drop) != opposite: return False            # 环邻条件：并后不出非流形边
        boundary_edge = any((face_list[index][(k + 1) % 3], face_list[index][k]) not in edge_face
                            for index in shared for k in range(3)
                            if {face_list[index][k], face_list[index][(k + 1) % 3]} == {keep, drop})
        if on_boundary(keep) and on_boundary(drop) and not boundary_edge: return False   # 会把边界捏成一点
        for index in list(vertex_faces[drop] - shared):
            face = [keep if v == drop else v for v in face_list[index]]; corner = corners[index]
            detach(index); attach(index, face, corner)
        for index in shared: detach(index)
        return True
    def flip(index: int, a: int, b: int, p: int) -> bool:
        other = edge_face.get((b, a))
        if other is None:
            if on_boundary(p): return False
            detach(index); stats["deleted"] += 1; return True
        face_o = face_list[other]; q = next(v for v in face_o if v not in (a, b))
        if q == p or (p, q) in edge_face or (q, p) in edge_face: return False
        k_a, k_b, k_q = face_o.index(a), face_o.index(b), face_o.index(q)
        ab = positions[b] - positions[a]
        t = float(np.clip(np.dot(positions[p] - positions[a], ab) / max(np.dot(ab, ab), 1e-30), 0., 1.))
        corner_o = corners[other]; corner_p = corner_o[k_a] * (1 - t) + corner_o[k_b] * t
        first, second = [a, q, p], [q, b, p]
        normal_o = np.cross(positions[face_o[1]] - positions[face_o[0]], positions[face_o[2]] - positions[face_o[0]])
        for face in (first, second):
            normal = np.cross(positions[face[1]] - positions[face[0]], positions[face[2]] - positions[face[0]])
            if np.dot(normal, normal_o) <= 0: return False
        detach(index); detach(other)
        attach(index, first, np.stack((corner_o[k_a], corner_o[k_q], corner_p)))
        attach(other, second, np.stack((corner_o[k_q], corner_o[k_b], corner_p)))
        stats["flipped"] += 1; return True
    for _ in range(passes):
        live = np.flatnonzero(alive)
        bad = live[sliver_height(positions[np.asarray([face_list[i] for i in live])]) < min_height] if len(live) else live
        if not len(bad): break
        stats["slivers"] = max(stats["slivers"], len(bad)); progress = False
        for index in bad:
            if not alive[index] or height(face_list[index]) >= min_height: continue
            face = face_list[index]; pts = positions[np.asarray(face)]
            lengths = np.linalg.norm(pts[[1, 2, 0]] - pts, axis=1)          # 边 k：角 k → 角 k+1
            shortest = int(np.argmin(lengths))
            if lengths[shortest] < needle_length:
                if collapse(face[shortest], face[(shortest + 1) % 3]):
                    stats["collapsed"] += 1; progress = True
                continue
            longest = int(np.argmax(lengths))
            if flip(index, face[longest], face[(longest + 1) % 3], face[(longest + 2) % 3]): progress = True
        if not progress: break
    live = np.flatnonzero(alive)
    out_faces = np.asarray([face_list[i] for i in live], dtype=np.int64).reshape(-1, 3)
    stats["remaining"] = int(np.count_nonzero(sliver_height(positions[out_faces]) < min_height)) if len(out_faces) else 0
    corner_shape = (0,) + tuple(np.asarray(corner_values).shape[1:])
    out_corners = np.asarray([corners[i] for i in live]) if len(live) else np.zeros(corner_shape)
    return out_faces, out_corners, stats


def merge_close_vertices(positions: np.ndarray, faces: np.ndarray, corner_values: np.ndarray, tolerance: float
                         ) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """把相距 < tolerance 的顶点并到同一代表点（并查集），去掉因此退化的三角。

    用于清理源网格里的微褶皱（D1b 审核 r1：模板在颈根有一团 0.003–0.04 mm 的微三角，法向乱指）。
    返回 (每个原顶点的代表点序号, 新面, 保留面的逐角属性)。"""
    from scipy.spatial import cKDTree
    parent = np.arange(len(positions))
    def root(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]; index = parent[index]
        return index
    for a, b in cKDTree(positions).query_pairs(tolerance):
        ra, rb = root(int(a)), root(int(b))
        if ra != rb: parent[max(ra, rb)] = min(ra, rb)
    representative = np.array([root(index) for index in range(len(positions))])
    merged = representative[faces]
    keep = (merged[:, 0] != merged[:, 1]) & (merged[:, 1] != merged[:, 2]) & (merged[:, 0] != merged[:, 2])
    return representative, merged[keep], corner_values[keep]


def clip_faces(positions: np.ndarray, faces: np.ndarray, field: np.ndarray, vertex_values: np.ndarray,
               corner_values: np.ndarray, clip_mask: np.ndarray | None = None
               ) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """保留 field ≥ 0 的部分，跨零三角按边精确裁开并保持绕序。

    vertex_values (n,k) 为逐顶点属性（如稠密蒙皮权重），corner_values (F,3,c) 为逐角属性（如 UV），
    均沿边线性插值。同一条边在相邻三角里只生成一个新点，切口闭合。clip_mask 为 False 的三角
    原样保留（例如不裁的头发）。返回 (位置, 面, 顶点属性, 逐角属性, 源三角号)。
    """
    positions = np.asarray(positions, dtype=np.float64); faces = np.asarray(faces, dtype=np.int64)
    field = np.asarray(field, dtype=np.float64)
    # 贴着切面的顶点（|f| < CLIP_SNAP_MU，约 34 µm）记为 0：切点直接复用该顶点，不生成零面积碎三角
    # （D1b 审核 r1：底切面贴着模板顶点处出过 5 个面积≈0、法向随机的"朝里"三角）。
    field = np.where(np.abs(field) < CLIP_SNAP_MU, 0., field)
    out_positions = [positions]; out_values = [np.asarray(vertex_values, dtype=np.float64)]
    new_faces: list[tuple[int, int, int]] = []; new_corners: list[np.ndarray] = []; sources: list[int] = []
    edge_vertex: dict[tuple[int, int], int] = {}; extra_positions: list[np.ndarray] = []
    extra_values: list[np.ndarray] = []; next_index = len(positions)

    def cut_point(a: int, b: int) -> tuple[int, float]:
        nonlocal next_index
        if field[a] == 0: return a, 0.
        if field[b] == 0: return b, 1.
        key = (a, b) if a < b else (b, a)
        alpha = field[key[0]] / (field[key[0]] - field[key[1]])
        if key not in edge_vertex:
            extra_positions.append(positions[key[0]] * (1 - alpha) + positions[key[1]] * alpha)
            extra_values.append(out_values[0][key[0]] * (1 - alpha) + out_values[0][key[1]] * alpha)
            edge_vertex[key] = next_index; next_index += 1
        # 返回相对 a→b 的参数，供逐角属性插值
        return edge_vertex[key], (alpha if key[0] == a else 1 - alpha)

    for index, face in enumerate(faces):
        inside = field[face] >= 0
        if (clip_mask is not None and not clip_mask[index]) or inside.all():
            new_faces.append(tuple(face)); new_corners.append(corner_values[index]); sources.append(index)
            continue
        if not inside.any(): continue
        polygon: list[tuple[int, np.ndarray]] = []
        for corner in range(3):
            previous = (corner + 2) % 3
            a, b = int(face[previous]), int(face[corner])
            if inside[previous] != inside[corner]:
                vertex, t = cut_point(a, b)
                polygon.append((vertex, corner_values[index][previous] * (1 - t) + corner_values[index][corner] * t))
            if inside[corner]: polygon.append((int(face[corner]), corner_values[index][corner]))
        unique: list[tuple[int, np.ndarray]] = []
        for item in polygon:                               # 切点与原顶点重合时去掉重复
            if not unique or unique[-1][0] != item[0]: unique.append(item)
        if len(unique) > 1 and unique[0][0] == unique[-1][0]: unique.pop()
        polygon = unique
        if len(polygon) < 3: continue
        for corner in range(1, len(polygon) - 1):
            trio = (polygon[0], polygon[corner], polygon[corner + 1])
            new_faces.append(tuple(item[0] for item in trio))
            new_corners.append(np.stack([item[1] for item in trio])); sources.append(index)
    all_positions = np.concatenate([positions] + ([np.asarray(extra_positions)] if extra_positions else []))
    all_values = np.concatenate([out_values[0]] + ([np.asarray(extra_values)] if extra_values else []))
    corner_shape = (0,) + tuple(np.asarray(corner_values).shape[1:])
    return (all_positions, np.asarray(new_faces, dtype=np.int64).reshape(-1, 3), all_values,
            np.asarray(new_corners).reshape(corner_shape) if not new_corners else np.asarray(new_corners),
            np.asarray(sources, dtype=np.int64))


def split_faces(positions: np.ndarray, faces: np.ndarray, field: np.ndarray, vertex_values: np.ndarray,
                corner_values: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """沿 field 的零等值线把跨线三角切开、两侧都保留（与 clip_faces 同样按边去重切点、保持绕序）。"""
    positions = np.asarray(positions, dtype=np.float64); faces = np.asarray(faces, dtype=np.int64)
    field = np.where(np.abs(field) < CLIP_SNAP_MU, 0., np.asarray(field, dtype=np.float64))
    values = np.asarray(vertex_values, dtype=np.float64)
    extra_positions: list[np.ndarray] = []; extra_values: list[np.ndarray] = []
    edge_vertex: dict[tuple[int, int], int] = {}
    out_faces: list[tuple[int, int, int]] = []; out_corners: list[np.ndarray] = []
    def cut_point(a: int, b: int) -> tuple[int, float]:
        key = (a, b) if a < b else (b, a)
        alpha = field[key[0]] / (field[key[0]] - field[key[1]])
        if key not in edge_vertex:
            edge_vertex[key] = len(positions) + len(extra_positions)
            extra_positions.append(positions[key[0]] * (1 - alpha) + positions[key[1]] * alpha)
            extra_values.append(values[key[0]] * (1 - alpha) + values[key[1]] * alpha)
        return edge_vertex[key], (alpha if key[0] == a else 1 - alpha)
    for index, face in enumerate(faces):
        sign = np.sign(field[face])
        if not ((sign > 0).any() and (sign < 0).any()):
            out_faces.append(tuple(face)); out_corners.append(corner_values[index]); continue
        for side in (1., -1.):
            polygon: list[tuple[int, np.ndarray]] = []
            for corner in range(3):
                previous = (corner + 2) % 3
                a, b = int(face[previous]), int(face[corner])
                if sign[previous] * sign[corner] < 0:
                    vertex, t = cut_point(a, b)
                    polygon.append((vertex, corner_values[index][previous] * (1 - t) + corner_values[index][corner] * t))
                if sign[corner] == side or sign[corner] == 0:
                    polygon.append((b, corner_values[index][corner]))
            for corner in range(1, len(polygon) - 1):
                trio = (polygon[0], polygon[corner], polygon[corner + 1])
                out_faces.append(tuple(item[0] for item in trio)); out_corners.append(np.stack([item[1] for item in trio]))
    all_positions = np.concatenate([positions] + ([np.asarray(extra_positions)] if extra_positions else []))
    all_values = np.concatenate([values] + ([np.asarray(extra_values)] if extra_values else []))
    return all_positions, np.asarray(out_faces, dtype=np.int64).reshape(-1, 3), all_values, np.asarray(out_corners)


def compact_mesh(positions: np.ndarray, faces: np.ndarray, *arrays: np.ndarray
                 ) -> tuple[np.ndarray, np.ndarray, list[np.ndarray], np.ndarray]:
    """删去未被引用的顶点；返回 (位置, 面, 同步裁剪的逐顶点数组, 旧→新映射)。"""
    used = np.zeros(len(positions), dtype=bool); used[np.asarray(faces).reshape(-1)] = True
    remap = np.full(len(positions), -1, dtype=np.int64); remap[used] = np.arange(np.count_nonzero(used))
    return positions[used], remap[faces], [array[used] for array in arrays], remap


def subdivide_midpoint(positions: np.ndarray, faces: np.ndarray, vertex_values: np.ndarray,
                       corner_values: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """一次中点细分（每三角 → 4，共享边只生成一个中点）：几何形状不变，只增加约束带里的自由度。"""
    edges = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    keys = np.sort(edges, axis=1)
    unique, inverse = np.unique(keys, axis=0, return_inverse=True); inverse = inverse.reshape(-1)
    count = len(positions); mid = count + inverse.reshape(3, -1).T          # (F,3)：边 01、12、20 的中点
    new_positions = np.concatenate((positions, .5 * (positions[unique[:, 0]] + positions[unique[:, 1]])))
    new_values = np.concatenate((vertex_values, .5 * (vertex_values[unique[:, 0]] + vertex_values[unique[:, 1]])))
    a, b, c = faces[:, 0], faces[:, 1], faces[:, 2]; ab, bc, ca = mid[:, 0], mid[:, 1], mid[:, 2]
    new_faces = np.concatenate((np.column_stack((a, ab, ca)), np.column_stack((ab, b, bc)),
                                np.column_stack((ca, bc, c)), np.column_stack((ab, bc, ca))))
    ua, ub, uc = corner_values[:, 0], corner_values[:, 1], corner_values[:, 2]
    uab, ubc, uca = .5 * (ua + ub), .5 * (ub + uc), .5 * (uc + ua)
    new_corners = np.concatenate((np.stack((ua, uab, uca), 1), np.stack((uab, ub, ubc), 1),
                                  np.stack((uca, ubc, uc), 1), np.stack((uab, ubc, uca), 1)))
    return new_positions, new_faces, new_values, new_corners


def refine_marked(positions: np.ndarray, faces: np.ndarray, vertex_values: np.ndarray, corner_values: np.ndarray,
                  marked: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """红绿局部细分：marked 面一分四；被分边 ≥ 2 条的邻面升级为一分四（迭代到稳定），恰 1 条的邻面从该边中点
    连对角一分二。无 T 形节点，网格保持水密；几何形状不变。"""
    corners = np.stack((faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]), axis=1)
    unique, inverse = np.unique(np.sort(corners.reshape(-1, 2), axis=1), axis=0, return_inverse=True)
    edge_of = inverse.reshape(-1, 3)
    red = np.asarray(marked, bool).copy()
    while True:
        split = np.zeros(len(unique), bool); split[edge_of[red].reshape(-1)] = True
        grown = red | (split[edge_of].sum(axis=1) >= 2)
        if np.array_equal(grown, red): break
        red = grown
    split_ids = np.flatnonzero(split)
    middle = np.full(len(unique), -1, dtype=np.int64); middle[split_ids] = len(positions) + np.arange(len(split_ids))
    ends = unique[split_ids]
    new_positions = np.concatenate((positions, .5 * (positions[ends[:, 0]] + positions[ends[:, 1]])))
    new_values = np.concatenate((vertex_values, .5 * (vertex_values[ends[:, 0]] + vertex_values[ends[:, 1]])))
    count = split[edge_of].sum(axis=1)
    keep = count == 0
    out_faces, out_corners = [faces[keep]], [corner_values[keep]]
    a, b, c = faces[red, 0], faces[red, 1], faces[red, 2]
    ab, bc, ca = middle[edge_of[red, 0]], middle[edge_of[red, 1]], middle[edge_of[red, 2]]
    ua, ub, uc = corner_values[red, 0], corner_values[red, 1], corner_values[red, 2]
    uab, ubc, uca = .5 * (ua + ub), .5 * (ub + uc), .5 * (uc + ua)
    out_faces += [np.column_stack((a, ab, ca)), np.column_stack((ab, b, bc)), np.column_stack((ca, bc, c)),
                  np.column_stack((ab, bc, ca))]
    out_corners += [np.stack((ua, uab, uca), 1), np.stack((uab, ub, ubc), 1), np.stack((uca, ubc, uc), 1),
                    np.stack((uab, ubc, uca), 1)]
    green = np.flatnonzero(count == 1)
    if len(green):
        k = np.argmax(split[edge_of[green]], axis=1)              # 被分的边 k 连接角 k 与角 k+1
        rows = np.arange(len(green))
        c0, c1, c2 = (faces[green, (k + shift) % 3] for shift in (0, 1, 2))
        u0, u1, u2 = (corner_values[green][rows, (k + shift) % 3] for shift in (0, 1, 2))
        m = middle[edge_of[green, k]]; um = .5 * (u0 + u1)
        out_faces += [np.column_stack((c0, m, c2)), np.column_stack((m, c1, c2))]
        out_corners += [np.stack((u0, um, u2), 1), np.stack((um, u1, u2), 1)]
    return new_positions, np.concatenate(out_faces), new_values, np.concatenate(out_corners)


def face_normals(positions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    tri = positions[faces]; return np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])


def cotangent_laplacian(positions: np.ndarray, faces: np.ndarray, cot_clamp: float = 1e3
                        ) -> tuple[sparse.csr_matrix, np.ndarray]:
    """余切拉普拉斯 L（半正定，L = D − W）与重心法集中质量 M（每点 1/3 邻面面积）。"""
    count = len(positions); tri = positions[faces]
    rows, cols, weights = [], [], []
    for corner in range(3):
        i, j, k = faces[:, corner], faces[:, (corner + 1) % 3], faces[:, (corner + 2) % 3]
        u = positions[j] - positions[i]; v = positions[k] - positions[i]
        cross = np.linalg.norm(np.cross(u, v), axis=1)
        cot = np.clip(np.einsum("ij,ij->i", u, v) / np.maximum(cross, 1e-20), -cot_clamp, cot_clamp)
        rows += [j, k]; cols += [k, j]; weights += [.5 * cot, .5 * cot]   # 角 i 对边 (j,k)
    W = sparse.csr_matrix((np.concatenate(weights), (np.concatenate(rows), np.concatenate(cols))),
                          shape=(count, count))
    L = sparse.diags(np.asarray(W.sum(axis=1)).reshape(-1)) - W
    area = .5 * np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    mass = np.zeros(count); np.add.at(mass, faces.reshape(-1), np.repeat(area / 3, 3))
    return L.tocsr(), mass


def biharmonic_displacement(positions: np.ndarray, faces: np.ndarray, constrained: np.ndarray,
                            targets: np.ndarray) -> tuple[np.ndarray, dict[str, float]]:
    """解 L M⁻¹ L d = 0（自由点）且约束点 d = target − p：带约束的双调和位移场。"""
    L, mass = cotangent_laplacian(positions, faces)
    floor = max(float(np.median(mass[mass > 0])) * 1e-3, 1e-30) if np.any(mass > 0) else 1e-30
    Q = (L @ sparse.diags(1 / np.maximum(mass, floor)) @ L).tocsr()
    free = ~constrained
    displacement = np.zeros_like(positions, dtype=np.float64)
    displacement[constrained] = targets[constrained] - positions[constrained]
    if np.any(free):
        Qff = Q[free][:, free].tocsc(); Qfc = Q[free][:, constrained]
        solver = splu(Qff)
        displacement[free] = solver.solve(-(Qfc @ displacement[constrained]))
    residual = Q[free] @ displacement if np.any(free) else np.zeros((0, 3))
    stats = {"freeVertices": int(np.count_nonzero(free)), "constrainedVertices": int(np.count_nonzero(constrained)),
             "residualMaxMu": float(np.abs(residual).max(initial=0.)),
             "displacementMaxMu": float(np.linalg.norm(displacement, axis=1).max(initial=0.))}
    return displacement, stats


def orientation_report(positions: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray]) -> dict[str, Any]:
    """绕序一致性（内部边两侧方向相反）与外法向占比（面积加权，法向·径向 > 0）。"""
    directed = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    undirected = np.sort(directed, axis=1)
    keys, inverse, counts = np.unique(undirected, axis=0, return_inverse=True, return_counts=True)
    inverse = inverse.reshape(-1)
    forward = (directed[:, 0] < directed[:, 1]).astype(np.int64)
    forward_count = np.zeros(len(keys), dtype=np.int64); np.add.at(forward_count, inverse, forward)
    interior = counts == 2
    consistent = interior & (forward_count == 1)
    normals = face_normals(positions, faces); area = .5 * np.linalg.norm(normals, axis=1)
    centroid = positions[faces].mean(axis=1) - frame["center"]
    radial = centroid - np.outer(centroid @ frame["axis"], frame["axis"])
    outward = np.einsum("ij,ij->i", normals, radial) > 0
    return {"interiorEdges": int(np.count_nonzero(interior)),
            "consistentEdgeRatio": float(np.count_nonzero(consistent) / max(np.count_nonzero(interior), 1)),
            "boundaryEdges": int(np.count_nonzero(counts == 1)),
            "nonManifoldEdges": int(np.count_nonzero(counts > 2)),
            "outwardAreaRatio": float(area[outward].sum() / max(area.sum(), 1e-30)),
            "outwardFaceRatio": float(np.count_nonzero(outward) / max(len(faces), 1))}


def boundary_loops(faces: np.ndarray) -> list[np.ndarray]:
    """边界边串成环（按出现顺序）；用于统计颈片开口数。"""
    directed = np.concatenate([faces[:, [0, 1]], faces[:, [1, 2]], faces[:, [2, 0]]])
    undirected = np.sort(directed, axis=1)
    keys, counts = np.unique(undirected, axis=0, return_counts=True)
    boundary = {tuple(edge) for edge in keys[counts == 1]}
    following: dict[int, int] = {}
    for a, b in directed:
        if (min(a, b), max(a, b)) in boundary: following[int(a)] = int(b)
    loops: list[np.ndarray] = []; seen: set[int] = set()
    for start in list(following):
        if start in seen: continue
        loop = [start]; seen.add(start); current = following[start]
        while current != start and current in following and current not in seen:
            loop.append(current); seen.add(current); current = following[current]
        loops.append(np.asarray(loop))
    return loops



# ---------------------------------------------------------------- 拼接：源头侧

def dense_weights(joints: np.ndarray, weights: np.ndarray, joint_count: int) -> np.ndarray:
    dense = np.zeros((len(joints), joint_count))
    np.add.at(dense, (np.repeat(np.arange(len(joints)), joints.shape[1]), joints.reshape(-1)),
              weights.reshape(-1))
    return dense


def top4_weights(dense: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    if dense.shape[1] < 4: dense = np.pad(dense, ((0, 0), (0, 4 - dense.shape[1])))
    order = np.argsort(-dense, axis=1)[:, :4]
    values = np.take_along_axis(dense, order, axis=1); values = np.maximum(values, 0)
    total = values.sum(axis=1, keepdims=True)
    values = np.divide(values, total, out=np.zeros_like(values), where=total > 1e-12)
    joints = np.where(values > 0, order, 0).astype(np.uint16)
    return joints, values.astype(np.float32)


def head_envelopes(points: np.ndarray, faces: np.ndarray, skin_faces: np.ndarray, trusted_faces: np.ndarray,
                   frame: dict[str, np.ndarray], mm: float) -> dict[str, Any]:
    """源头三张半径场：皮肤、可信皮肤、全部保留面（外包络，后颈处即发帘内侧）。"""
    grid = CylinderGrid(ANGLE_BINS, -40 * mm, 160 * mm, 200)
    _, height, _ = cylinder(points, frame)
    band = (height[faces].max(axis=1) >= grid.h_lo) & (height[faces].min(axis=1) <= grid.h_hi)
    rho_min = 4 * mm
    skin, _, _ = rasterize_cylinder(points, faces[band & skin_faces], frame, grid, rho_min=rho_min)
    trusted, _, _ = rasterize_cylinder(points, faces[band & trusted_faces], frame, grid, rho_min=rho_min)
    envelope, _, _ = rasterize_cylinder(points, faces[band], frame, grid, rho_min=rho_min)
    return {"grid": grid, "skin": skin, "trusted": trusted, "env": envelope}


def _one_sided_weight(region: np.ndarray, width_bins: float) -> np.ndarray:
    """region 内为 1；外侧按到最近 region 格的周期距离在 width_bins 内 smoothstep 降到 0。"""
    count = len(region); inside = np.flatnonzero(region)
    if not len(inside): return np.zeros(count)
    gap = np.abs(np.arange(count)[:, None] - inside[None, :])
    distance = np.minimum(gap, count - gap).min(axis=1)
    return np.where(region, 1., 1 - _smoothstep(distance / max(width_bins, 1e-9)))


def head_floor(envelopes: dict[str, Any], mm: float) -> dict[str, Any]:
    """头皮切面高度 h_head 与皮肤角度分区。

    先取在 NECK_PROBE_MM 高度段有颈部皮肤（半径 15–75 mm）的角度；在这些角度上按高度统计
    皮肤覆盖率，取覆盖率连续 FLOOR_RUN_MM 不低于 FLOOR_COVERAGE 的最低高度 + 余量（领口、高领
    以上）。A 区 = h_head 以上 10 mm 内皮肤覆盖 ≥ 80% 的角度，再做周期平滑；其余为 B 区。
    """
    grid = envelopes["grid"]; h = grid.h_centers()
    def neck_like(field: np.ndarray) -> np.ndarray:
        return np.isfinite(field) & (field >= 15 * mm) & (field <= 75 * mm)
    skin = neck_like(envelopes["skin"])
    probe = (h >= NECK_PROBE_MM[0] * mm) & (h <= NECK_PROBE_MM[1] * mm)
    angles = skin[:, probe].any(axis=1)
    if np.count_nonzero(angles) < grid.theta_count // 6:
        raise ValueError("源头可见颈部皮肤角度不足 1/6 圈，无法确定头皮切面")
    coverage_by_h = skin[angles].mean(axis=0)
    run = max(int(round(FLOOR_RUN_MM * mm / grid.dh)), 1)
    window = np.convolve((coverage_by_h >= FLOOR_COVERAGE).astype(np.int32), np.ones(run, np.int32), "valid") == run
    start = h[:len(window)] - grid.dh / 2
    ok = np.flatnonzero(window & (start >= -10 * mm) & (start <= NECK_PROBE_MM[1] * mm))
    if not len(ok): raise ValueError("源头颈部皮肤在任何高度都不连续，无法确定头皮切面")
    h_head = float(start[ok[0]]) + HEAD_FLOOR_MARGIN_MM * mm
    floor_min = (PATCH_BOTTOM_MM + BOTTOM_BAND_MM + G1_SKIRT_MM + FREE_ZONE_MIN_MM) * mm
    clamped = h_head < floor_min
    h_head = max(h_head, floor_min)
    band = (h >= h_head) & (h <= h_head + 10 * mm)
    coverage = skin[:, band].mean(axis=1) if np.any(band) else np.zeros(grid.theta_count)
    region_a = coverage >= .8
    # 过渡只放在 B 侧：A 区（切口处有头皮）全为 1，顶带 / G1 裙带逐角都精确贴头皮；B 区按到最近 A 角的周期距离
    # 在 2·REGION_SMOOTH_DEG 内降到 0（D1b 实测：两侧对称平滑时 A 区边缘约 10° 内裙带混进模板形状，G1 达 7.6°）。
    weight_a = _one_sided_weight(region_a, 2 * REGION_SMOOTH_DEG * grid.theta_count / 360)
    # A 区内部 = 离任一 B 角 ≥ TRANSITION_DEG：G1 / 鼓包 / 顶缝色差在内部门禁，靠近发际线的过渡列只报。
    interior = region_a & (_one_sided_weight(~region_a, TRANSITION_DEG * grid.theta_count / 360) <= 0)
    return {"hHead": h_head, "hHeadClampedToMin": bool(clamped), "coverageByHeight": coverage_by_h,
            "probeAngles": int(np.count_nonzero(angles)),
            "coverage": coverage, "regionA": region_a, "weightA": weight_a, "interiorA": interior}


def select_head_faces_v2(mesh: Mesh, positions: np.ndarray, classified: dict[str, np.ndarray],
                         frame: dict[str, np.ndarray], mm: float) -> tuple[np.ndarray, np.ndarray]:
    """模板坐标里的整头选面：皮肤按 Head + Neck 权重（颈下半截多为 Neck 权重）、头发按 Head 权重，
    非皮肤非头发的面（衣领、衣身）只留 ORNAMENT_MIN_MM 以上的发饰 / 耳坠。皮肤稍后在 h_head 处裁开。"""
    faces = mesh.indices.reshape(-1, 3)
    head = classified["headWeight"]; family = head + classified["neckWeight"]
    skin_count, hair_count = classified["skin"][faces].sum(axis=1), classified["hair"][faces].sum(axis=1)
    _, height, _ = cylinder(positions, frame)
    skin_faces = (skin_count >= 2) & (family[faces].mean(axis=1) >= SKIN_FAMILY_MIN)
    hair_faces = (hair_count >= 2) & (head[faces].mean(axis=1) >= .025)
    ornaments = ((skin_count < 2) & (hair_count < 2) & (height[faces].mean(axis=1) >= ORNAMENT_MIN_MM * mm)
                 & (head[faces].mean(axis=1) >= .10))
    # 下巴以下的浅色滚边 / 肤色高领会被分成皮肤：以皮肤三角"自颈轴向外第一层"的半径场为颈壳，
    # 下巴以下、任一顶点超出颈壳 × NECK_OUTER_RADIUS_FACTOR 的非头发三角剔除（D1 思路，改用半径场不依赖分箱）。
    theta, height, radius = cylinder(positions, frame)
    front = np.sin(theta) > .5
    chin_pool = classified["skin"] & (head > .08) & front & (height > 0)
    chin = float(np.percentile(height[chin_pool], 2)) if np.count_nonzero(chin_pool) >= 8 else 40 * mm
    grid = CylinderGrid(ANGLE_BINS, -45 * mm, max(chin, 0.) + 5 * mm, 100)
    band = (height[faces].max(axis=1) >= grid.h_lo) & (height[faces].min(axis=1) <= grid.h_hi)
    inner, _, _ = rasterize_cylinder(positions, faces[skin_faces & band], frame, grid, rho_min=4 * mm)
    shell = sample_grid(inner, grid, theta, height)
    outside = np.isfinite(shell) & (radius > np.nan_to_num(shell, nan=np.inf) * NECK_OUTER_RADIUS_FACTOR)
    face_height = height[faces].mean(axis=1)
    collar = ((face_height >= -40 * mm) & (face_height <= chin) & ~hair_faces & np.any(outside[faces], axis=1))
    kept = faces[(skin_faces | hair_faces | ornaments) & ~collar]
    used = np.zeros(len(positions), dtype=bool); used[kept.reshape(-1)] = True
    remap = np.full(len(positions), -1, dtype=np.int64); remap[used] = np.arange(np.count_nonzero(used))
    return remap[kept], used


def drop_collar_remnants(head: dict[str, np.ndarray], frame: dict[str, np.ndarray], h_head: float, mm: float,
                         texture: np.ndarray | None = None) -> tuple[dict[str, np.ndarray], dict[str, Any]]:
    """去裁后头上的衣领残片（D2）：深红立领、内衬、领口外翻折边贴着颈子立到切口以上，过了暖色判定被当成皮肤，
    切口一裁就在颈外留下外翘的薄片（穆念慈后颈 229°–307°，外伸到 11 mm）。同一位置里面已有真颈皮，所以按"比自颈轴向外
    第一层皮肤再往外"判定：切口以上 COLLAR_REMNANT_BAND_MM 内、面心外伸超过 COLLAR_REMNANT_OUTER_MM 的非头发面，
    以颈部权重为主、不像发丝、且相邻成片不少于 COLLAR_REMNANT_MIN_FACES 个面者整片去掉。只删不改：第一层皮肤
    （切口剖面、颈部适配、颈片约束的来源）不受影响。下巴（Head 权重高）、被当成皮肤的深色发丝、发丝里零星的亮面
    都不动（黄蓉三体型均为 0）。

    另给 texture（源 baseColor，H×W×3，0–1）时，切口顶带（切口以上 TOP_BAND_MM 内，颈片顶带就在其下 0.3 mm）里
    贴图采样过半偏红（G/R < COLLAR_RED_GREEN_RED）的非头发、颈部权重为主的面也去掉：顶点落在肤色上而被判成皮肤
    的第一层面，三角内部却是红领（穆念慈 270° / 299° 各一个），删掉后露出的是按头色烘焙的颈片。"""
    positions, faces = head["positions"], head["faces"]
    face_skin = head["skin"][faces].sum(axis=1) >= 2
    band_top = h_head + COLLAR_REMNANT_BAND_MM * mm
    grid = CylinderGrid(ANGLE_BINS, h_head, band_top, int(round(4 * COLLAR_REMNANT_BAND_MM)))
    first, _, _ = rasterize_cylinder(positions, faces[face_skin], frame, grid, rho_min=4 * mm)
    theta, center_h, center_rho = cylinder(positions[faces].mean(axis=1), frame)
    outward = center_rho - sample_grid(first, grid, theta, center_h)
    color = head["colors"][faces].mean(axis=1)
    hair_like = (color.mean(axis=1) < HAIR_DARK_MEAN) & (color[:, 1] >= COLLAR_RED_GREEN_RED * color[:, 0])
    candidate = (np.nan_to_num(outward, nan=-np.inf) > COLLAR_REMNANT_OUTER_MM * mm) & (center_h <= band_top)
    candidate &= (head["hair"][faces].sum(axis=1) < 2) & ~hair_like
    candidate &= head["headWeight"][faces].mean(axis=1) < COLLAR_REMNANT_HEAD_MAX
    drop = np.zeros(len(faces), dtype=bool); ids = np.flatnonzero(candidate); sizes = np.zeros(0, dtype=int)
    if len(ids):
        rows = np.repeat(np.arange(len(ids)), 3)
        incidence = sparse.csr_matrix((np.ones(len(rows)), (rows, faces[ids].reshape(-1))),
                                      shape=(len(ids), len(positions)))
        _, labels = connected_components(incidence @ incidence.T, directed=False)
        sizes = np.bincount(labels)
        drop[ids[sizes[labels] >= COLLAR_REMNANT_MIN_FACES]] = True
    remnant_count = int(np.count_nonzero(drop)); red_texture = np.zeros(len(faces), dtype=bool)
    if texture is not None:
        _, height, _ = cylinder(positions, frame)
        seam = ((height[faces].max(axis=1) <= h_head + TOP_BAND_MM * mm) & (head["hair"][faces].sum(axis=1) < 2)
                & (head["headWeight"][faces].mean(axis=1) < COLLAR_REMNANT_HEAD_MAX) & ~drop)
        steps = 6; a, b = np.meshgrid(np.arange(steps + 1), np.arange(steps + 1)); inside = (a + b) <= steps
        bary = np.column_stack((a[inside], b[inside], steps - a[inside] - b[inside])) / steps
        uv = np.einsum("pk,fkj->fpj", bary, head["uvs"][faces[seam]])
        height_px, width_px = texture.shape[:2]                     # 与 GPU 最近纹素同口径：floor(uv × 尺寸)
        x = np.clip(np.floor(uv[..., 0] * width_px).astype(int), 0, width_px - 1)
        y = np.clip(np.floor(uv[..., 1] * height_px).astype(int), 0, height_px - 1)
        sampled = texture[y, x]
        reddish = sampled[..., 1] < COLLAR_RED_GREEN_RED * sampled[..., 0]
        red_texture[np.flatnonzero(seam)[reddish.mean(axis=1) >= .5]] = True
        drop |= red_texture
    stats = {"candidates": int(len(ids)), "dropped": remnant_count, "redTextureDropped": int(np.count_nonzero(red_texture)),
             "droppedClusters": sorted((int(size) for size in sizes if size >= COLLAR_REMNANT_MIN_FACES), reverse=True),
             "ignoredClusterMaxFaces": int(max((size for size in sizes if size < COLLAR_REMNANT_MIN_FACES), default=0)),
             "droppedThetaDeg": ([float(np.degrees(theta[drop]).min()), float(np.degrees(theta[drop]).max())]
                                 if drop.any() else []),
             "droppedOutwardMaxMm": float(outward[drop].max() / mm) if drop.any() else 0.}
    if not drop.any(): return head, stats
    keys = [key for key in head if key not in ("positions", "faces")]
    kept_positions, kept_faces, kept_values, _ = compact_mesh(positions, faces[~drop], *(head[key] for key in keys))
    return {"positions": kept_positions, "faces": kept_faces, **dict(zip(keys, kept_values))}, stats


def collar_adjacent(positions: np.ndarray, faces: np.ndarray, skin: np.ndarray, hair: np.ndarray,
                    frame: dict[str, np.ndarray], h_head: float, mm: float) -> np.ndarray:
    """逐角（ANGLE_BINS）：源件切口下方 SEAM_TONE_COLLAR_MM 内、颈壳半径 15–75 mm 处有无衣料面（三角多数顶点
    既非皮肤也非头发）。光栅化保留离颈轴最近的一层，外面的肩部衣料不会挡住领口。"""
    faces = np.asarray(faces).reshape(-1, 3)
    cloth = faces[(skin[faces].sum(axis=1) < 2) & (hair[faces].sum(axis=1) < 2)]
    if not len(cloth): return np.zeros(ANGLE_BINS, bool)
    grid = CylinderGrid(ANGLE_BINS, h_head - SEAM_TONE_COLLAR_MM * mm, h_head, int(round(SEAM_TONE_COLLAR_MM / .5)))
    rho, _, _ = rasterize_cylinder(positions, cloth, frame, grid, rho_min=4 * mm)
    return (np.isfinite(rho) & (rho >= 15 * mm) & (rho <= 75 * mm)).any(axis=1)


def level_seam_tone(texture: np.ndarray, head: dict[str, np.ndarray], frame: dict[str, np.ndarray], h_head: float,
                    skin_reference: np.ndarray, mm: float, collar: np.ndarray | None = None
                    ) -> tuple[np.ndarray, dict[str, Any]]:
    """切口带调平（D2）：生成头的颈皮常把衣领颜色烘在领口一圈（穆念慈白内领：切口处比上方亮 3–5 L*，白斑到 +17），
    颈片又从切口处取色往下过渡到身体，切口上下于是成一条亮带。逐角量切口以上 SEAM_TONE_PROBE_MM 内头皮的中位
    亮度，比本人参考肤色（classify 的脸颈参考色）亮 SEAM_TONE_LIGHT_MIN 以上才算污染（到 _FULL 全量，按角度平滑）；
    污染角度上，切口以上 SEAM_TONE_BAND_MM 内的头皮纹素在线性空间向同角度 SEAM_TONE_REF_MM 段头皮的中位色插值，
    切口以上 SEAM_TONE_HOLD_MM 内全量、到 BAND 归零。参考段不像皮肤（发帘）的角度不动。只改切口带皮肤三角内的纹素与其外 1 像素、不属于
    其他头部三角的填充纹素；未触发时原图逐字节返回（黄蓉三体型均不触发）。texture 为 H×W×3 的 uint8。
    collar（逐角布尔，collar_adjacent）给出时只调源件切口下方贴着衣料的角度：切口下仍是皮肤的角度（素模整圈）
    亮只是天然明暗，不是领口烘色。"""
    texture = np.asarray(texture, dtype=np.uint8)
    positions, faces, uvs = head["positions"], head["faces"], head["uvs"]
    skin_faces = faces[head["skin"][faces].sum(axis=1) >= 2]
    reference_lab = _srgb_to_lab(np.asarray(skin_reference, dtype=np.float64)[None, :])[0]
    stats: dict[str, Any] = {"bandMm": SEAM_TONE_BAND_MM, "holdMm": SEAM_TONE_HOLD_MM, "probeMm": SEAM_TONE_PROBE_MM,
                             "refMm": list(SEAM_TONE_REF_MM),
                             "lightMin": SEAM_TONE_LIGHT_MIN, "lightFull": SEAM_TONE_LIGHT_FULL,
                             "skinReferenceSrgb": [float(value) for value in skin_reference],
                             "angles": 0, "probeExcessMaxL": None, "texelsChanged": 0, "paddingTexels": 0,
                             "collarMm": SEAM_TONE_COLLAR_MM,
                             "collarDeg": None if collar is None else [int(i) for i in np.flatnonzero(collar)]}
    if not len(skin_faces): return texture, stats
    top = h_head + max(SEAM_TONE_REF_MM[1], SEAM_TONE_BAND_MM) * mm
    grid = CylinderGrid(ANGLE_BINS, h_head, top, int(round((top - h_head) / (.25 * mm))))
    rho, _, uv = rasterize_cylinder(positions, skin_faces, frame, grid, corner_values=uvs[skin_faces])
    height_px, width_px = texture.shape[:2]
    covered = np.isfinite(rho) & np.all(np.isfinite(uv), axis=-1)
    x = np.clip(np.floor(np.nan_to_num(uv[..., 0]) * width_px).astype(int), 0, width_px - 1)
    y = np.clip(np.floor(np.nan_to_num(uv[..., 1]) * height_px).astype(int), 0, height_px - 1)
    srgb = texture[y, x].astype(np.float64) / 255
    lightness = np.where(covered, _srgb_to_lab(srgb.reshape(-1, 3)).reshape(covered.shape + (3,))[..., 0], np.nan)
    rows = (grid.h_centers() - h_head) / mm
    probe_rows = rows < SEAM_TONE_PROBE_MM; ref_rows = (rows >= SEAM_TONE_REF_MM[0]) & (rows < SEAM_TONE_REF_MM[1])
    ref_count = covered[:, ref_rows].sum(axis=1); probe_count = covered[:, probe_rows].sum(axis=1)
    probe = np.full(ANGLE_BINS, np.nan); target = np.full((ANGLE_BINS, 3), np.nan)
    linear = _srgb_to_linear(srgb)
    for index in np.flatnonzero((ref_count > 0) & (probe_count > 0)):
        probe[index] = np.median(lightness[index, probe_rows][covered[index, probe_rows]])
        target[index] = np.median(linear[index, ref_rows][covered[index, ref_rows]], axis=0)
    target_lab = _srgb_to_lab(_linear_to_srgb(np.nan_to_num(target)))
    ref_ok = np.isfinite(target).all(axis=1) & (np.linalg.norm(target_lab - reference_lab, axis=1) < SEAM_TONE_REF_SKIN_DE)
    excess = probe - reference_lab[0]
    weight = np.where(ref_ok & np.isfinite(excess),
                      np.clip((np.nan_to_num(excess) - SEAM_TONE_LIGHT_MIN) / (SEAM_TONE_LIGHT_FULL - SEAM_TONE_LIGHT_MIN),
                              0., 1.), 0.)
    stats["probeExcessMaxL"] = float(np.nanmax(excess)) if np.isfinite(excess).any() else None
    if collar is not None:                       # 切口下仍是皮肤的角度不调（按角度平滑后乘，领口两端渐出）
        weight = weight * np.clip(smooth_cyclic(np.asarray(collar, dtype=np.float64),
                                                SEAM_TONE_SMOOTH_DEG * ANGLE_BINS / 360), 0., 1.)
    if not weight.any(): return texture, stats
    weight = np.where(ref_ok, np.nan_to_num(smooth_cyclic(weight, SEAM_TONE_SMOOTH_DEG * ANGLE_BINS / 360)), 0.)
    centers = grid.theta_centers()
    target = np.stack([np.interp(centers, centers[ref_ok], target[ref_ok, c], period=TAU) for c in range(3)], axis=1)
    stats["angles"] = int(np.count_nonzero(weight > 1e-3))
    # 贴图空间：切口带皮肤三角内的纹素按各自的 (θ, h) 取权重与目标色。
    _, vertex_height, _ = cylinder(positions, frame)
    band = skin_faces[vertex_height[skin_faces].min(axis=1) <= h_head + SEAM_TONE_BAND_MM * mm]
    out = texture.copy(); shift = np.zeros(texture.shape, dtype=np.float64); inside = np.zeros(texture.shape[:2], bool)
    for face in band:
        corner = uvs[face] * [width_px, height_px] - .5
        x0, y0 = np.maximum(np.floor(corner.min(axis=0)).astype(int), 0)
        x1, y1 = np.minimum(np.ceil(corner.max(axis=0)).astype(int), [width_px - 1, height_px - 1])
        if x1 < x0 or y1 < y0: continue
        grid_x, grid_y = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1))
        pixels = np.column_stack((grid_x.ravel(), grid_y.ravel())).astype(np.float64)
        edges = np.column_stack((corner[1] - corner[0], corner[2] - corner[0]))
        if abs(np.linalg.det(edges)) < 1e-12: continue
        local = np.linalg.solve(edges, (pixels - corner[0]).T).T
        bary = np.column_stack((1 - local.sum(axis=1), local)); hit = (bary >= -1e-9).all(axis=1)
        if not hit.any(): continue
        theta, height, _ = cylinder(bary[hit] @ positions[face], frame)
        texel_weight = (_cyclic_lookup(weight, theta) * (1 - _smoothstep(
            (height - h_head - SEAM_TONE_HOLD_MM * mm) / ((SEAM_TONE_BAND_MM - SEAM_TONE_HOLD_MM) * mm))))
        px, py = pixels[hit, 0].astype(int), pixels[hit, 1].astype(int)
        old = _srgb_to_linear(texture[py, px].astype(np.float64) / 255)
        aim = np.stack([_cyclic_lookup(target[:, c], theta) for c in range(3)], axis=1)
        new = old + texel_weight[:, None] * (aim - old)
        shift[py, px] = new - old; inside[py, px] = True
        value = np.round(_linear_to_srgb(new) * 255).astype(np.uint8)
        changed = (texel_weight > 0) & np.any(value != texture[py, px], axis=1)
        out[py[changed], px[changed]] = value[changed]
    stats["texelsChanged"] = int(np.count_nonzero(np.any(out != texture, axis=2)))
    # 外 1 像素：UV 岛边的填充纹素（不属于其他头部三角）跟随最近内部纹素的同一色移，免得双线性取样拖出亮边。
    others = Image.new("1", (width_px, height_px), 0); draw = ImageDraw.Draw(others)
    band_set = {tuple(face) for face in band.tolist()}
    for face in faces:
        if tuple(face.tolist()) in band_set: continue
        corner = uvs[face] * [width_px, height_px] - .5
        draw.polygon([(float(u), float(v)) for u, v in corner], fill=1)
    from scipy.ndimage import distance_transform_edt
    distance, (near_y, near_x) = distance_transform_edt(~inside, return_indices=True)
    ring = (distance > 0) & (distance <= 1.5) & ~np.asarray(others, dtype=bool)
    ring_y, ring_x = np.nonzero(ring)
    if len(ring_y):
        old = _srgb_to_linear(texture[ring_y, ring_x].astype(np.float64) / 255)
        new = old + shift[near_y[ring_y, ring_x], near_x[ring_y, ring_x]]
        value = np.round(_linear_to_srgb(new) * 255).astype(np.uint8)
        changed = np.any(value != texture[ring_y, ring_x], axis=1)
        out[ring_y[changed], ring_x[changed]] = value[changed]
        stats["paddingTexels"] = int(np.count_nonzero(changed))
    return out, stats


def weight_a_at(theta: np.ndarray, floor: dict[str, Any]) -> np.ndarray:
    """A 区权重按角度周期线性插值（floor 的角度格与源头半径场相同，起点 θ = 0）。"""
    values = floor["weightA"]; count = len(values)
    x = np.mod(np.asarray(theta), TAU) / (TAU / count) - .5
    x0 = np.floor(x).astype(int); fx = x - x0
    return (1 - fx) * values[x0 % count] + fx * values[(x0 + 1) % count]


def clip_head(positions: np.ndarray, uvs: np.ndarray, faces: np.ndarray, skin: np.ndarray, hair: np.ndarray,
              frame: dict[str, np.ndarray], h_head: float, head_weight: np.ndarray | None = None,
              colors: np.ndarray | None = None) -> dict[str, np.ndarray]:
    """把头上的非头发三角在 h_head 处精确裁开（插值位置 / UV / Head 权重 / 颜色），头发与发饰之外的残领一并去掉。"""
    _, height, _ = cylinder(positions, frame)
    face_hair = hair[faces].sum(axis=1) >= 2
    if head_weight is None: head_weight = np.zeros(len(positions))
    if colors is None: colors = np.zeros((len(positions), 3))
    values = np.column_stack((uvs, skin.astype(np.float64), hair.astype(np.float64), head_weight, colors))
    corner = np.zeros((len(faces), 3, 0))
    clipped_positions, clipped_faces, clipped_values, _, _ = clip_faces(
        positions, faces, height - h_head, values, corner, clip_mask=~face_hair)
    clipped_positions, clipped_faces, (clipped_values,), _ = compact_mesh(
        clipped_positions, clipped_faces, clipped_values)
    return {"positions": clipped_positions, "faces": clipped_faces, "uvs": clipped_values[:, :2],
            "skin": clipped_values[:, 2] >= .5, "hair": clipped_values[:, 3] >= .5,
            "headWeight": clipped_values[:, 4], "colors": clipped_values[:, 5:8]}


# ---------------------------------------------------------------- 拼接：模板颈片

def template_patch(template_mesh: Mesh, skeleton: dict[str, Any], frame: dict[str, np.ndarray],
                   h_bottom: float, top_of: Any, joint_count: int, mm: float,
                   refine: tuple[float, float] | None = None, dense_below: float | None = None,
                   exact_below: float | None = None) -> dict[str, np.ndarray]:
    """复制模板 h_bottom..h_top(θ) 之间的三角：先按位置焊接 UV 缝，再两次精确裁切。

    逐角 UV（模板身体图集）单独随面保留，供条带烘焙时跨 UV 缝也能正确取色。细分两级（都是红绿局部细分，
    无 T 形节点）：最低点不高于 dense_below 的面一分四（B 区长进发帘内侧的部分看不见，不细分，省三角预算）；
    高度范围与 refine = (h_lo, h_hi) 相交的面再一分四（G1 裙带的量测窗口里要有足够顶点）。

    给出 exact_below（遮罩平面）时，下沿不在 h_bottom 处裁开（与之相交的模板三角整块保留），并先沿遮罩平面
    切开跨面、只细分平面以上的面：遮罩平面以下的颈片顶点全是模板原顶点（加平面上的切点）、权重与身体逐字
    相同，动作中与身体逐帧同步。裁切 / 细分出的新点是 2–3 个模板点的插值权重（常有 5 根骨骼），截成 4 根后在 run 帧偏出
    0.5–0.9 mm（D1c 实测 tall / small：丢掉 2% 的 Head 权重，底带压进身体 0.2 mm）。
    """
    faces = template_mesh.indices.reshape(-1, 3).astype(np.int64)
    welded, welded_faces, inverse = weld_vertices(template_mesh.positions, faces)
    first = np.full(len(welded), -1, dtype=np.int64)
    first[inverse[::-1]] = np.arange(len(inverse))[::-1]
    weights = dense_weights(template_mesh.joints[first], template_mesh.weights[first], joint_count)
    regions = template_mesh.regions[first]
    # 模板整体的面积加权平滑法向（在整张身体上算，不受裁切后微碎片影响），随裁切 / 细分插值，用作底带外移方向。
    smooth_normals = _vertex_normals(welded, welded_faces)
    corner_uvs = template_mesh.uvs[faces].astype(np.float64)
    theta, height, rho = cylinder(welded, frame)
    ids = skeleton["regions"]["ids"]
    allowed = np.isin(regions, [ids["head"], ids["neck"], ids["torsoUpper"]]) & (rho <= PATCH_RADIUS_MAX_MM * mm)
    top = top_of(theta)
    keep = (np.all(allowed[welded_faces], axis=1) & (height[welded_faces].max(axis=1) >= h_bottom)
            & np.any(height[welded_faces] <= top[welded_faces], axis=1))
    faces_in, corners_in = welded_faces[keep], corner_uvs[keep]
    _, faces_in, corners_in = merge_close_vertices(welded, faces_in, corners_in, PATCH_MERGE_MM * mm)
    values = np.column_stack((weights, regions.astype(np.float64), smooth_normals))
    if exact_below is None:
        positions, faces_in, values, corners_in, _ = clip_faces(welded, faces_in, height - h_bottom, values, corners_in)
    else:
        positions = welded
    theta, height, _ = cylinder(positions, frame)
    positions, faces_in, values, corners_in, _ = clip_faces(
        positions, faces_in, top_of(theta) - height, values, corners_in)
    positions, faces_in, (values,), _ = compact_mesh(positions, faces_in, values)
    above = None
    if exact_below is not None:
        # 先沿遮罩平面把跨面切开：平面以上照常细分，平面以下只剩模板原顶点与平面上的切点（大三角模板也成立）。
        _, height, _ = cylinder(positions, frame)
        positions, faces_in, values, corners_in = split_faces(positions, faces_in, height - exact_below,
                                                              values, corners_in)
        above = lambda h: h[faces_in].min(axis=1) >= exact_below - CLIP_SNAP_MU   # noqa: E731
    for _ in range(PATCH_SUBDIVISIONS):
        if dense_below is None:
            positions, faces_in, values, corners_in = subdivide_midpoint(positions, faces_in, values, corners_in)
        else:
            _, height, _ = cylinder(positions, frame)
            marked = height[faces_in].min(axis=1) <= dense_below
            if above is not None: marked &= above(height)
            positions, faces_in, values, corners_in = refine_marked(positions, faces_in, values, corners_in, marked)
    if refine is not None:
        _, height, _ = cylinder(positions, frame)
        span = height[faces_in]
        marked = (span.max(axis=1) >= refine[0]) & (span.min(axis=1) <= refine[1])
        if above is not None: marked &= above(height)
        positions, faces_in, values, corners_in = refine_marked(positions, faces_in, values, corners_in, marked)
    # 沿底带上沿把跨线的面一分为二：底带上沿恰有一圈约束点，底缝 G1 窗口不会落到"一角在带内、一角自由"的
    # 大三角上（粗网格模板上曾差 10°）；每个跨线面只多 1–2 个三角。
    _, height, _ = cylinder(positions, frame)
    positions, faces_in, values, corners_in = split_faces(positions, faces_in, height - (h_bottom + BOTTOM_BAND_MM * mm),
                                                          values, corners_in)
    # 裁切贴着原顶点 / 切面陡变处会留下面积≈0 的碎条，其法向是数值噪声：并点 / 翻边消去（不开洞）。
    faces_in, corners_in, sliver_stats = remove_slivers(positions, faces_in, corners_in, SLIVER_MM * mm, NEEDLE_MM * mm)
    positions, faces_in, (values,), _ = compact_mesh(positions, faces_in, values)
    normals = values[:, joint_count + 1:joint_count + 4]
    normals = normals / np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-12)
    return {"positions": positions, "faces": faces_in, "weights": values[:, :joint_count],
            "regions": np.rint(values[:, joint_count]).astype(np.uint8), "cornerUvs": corners_in,
            "normals": normals, "allowedTemplateVertices": allowed[inverse], "slivers": sliver_stats}


def head_cut_profile(head: dict[str, np.ndarray], frame: dict[str, np.ndarray], h_head: float,
                     mm: float, columns: int = 720) -> dict[str, Any]:
    """裁后头皮在切口附近的细网格（720 列 × 0.25 mm 行，切口到 +TOP_BAND+1 mm）与逐角切口半径 / 斜率。

    顶带目标、G1 裙带外推都从这张网格取，与 seam_metrics 的 G1 量法同一口径（D1b 审核 r1：用 1 mm 粗网格外推时
    个别角度 G1 到 6.8°）。斜率取切口以上 0.25–G1_SLOPE_MM 的线性拟合，按 0.75° 轻度周期平滑。"""
    skin_faces = head["faces"][head["skin"][head["faces"]].sum(axis=1) >= 2]
    rows = int(round((TOP_BAND_MM + 1) / .25))
    grid = CylinderGrid(columns, h_head, h_head + (TOP_BAND_MM + 1) * mm, rows)
    rho, _, _ = rasterize_cylinder(head["positions"], skin_faces, frame, grid, rho_min=4 * mm)
    heights = grid.h_centers()
    window = (heights >= h_head + .25 * mm) & (heights <= h_head + G1_SLOPE_MM * mm)
    slope, at_cut = np.full(columns, np.nan), np.full(columns, np.nan)
    for index in range(columns):
        valid = window & np.isfinite(rho[index])
        if np.count_nonzero(valid) >= 3:
            fitted, intercept = np.polyfit(heights[valid], rho[index][valid], 1)
            slope[index], at_cut[index] = fitted, fitted * h_head + intercept
    valid = np.isfinite(slope)
    slope = smooth_cyclic(np.nan_to_num(slope), 1.5, valid=valid)
    at_cut = smooth_cyclic(np.nan_to_num(at_cut), 1.5, valid=valid)
    # 无头皮的角度（B 区）按周期线性插补成"虚拟切口剖面"，供 B 侧过渡带把 A 区形状平滑接到模板形状。
    good = np.isfinite(slope) & np.isfinite(at_cut) & (at_cut > 0)
    if good.any() and not good.all():
        centers = grid.theta_centers()
        slope = np.interp(centers, centers[good], slope[good], period=TAU)
        at_cut = np.interp(centers, centers[good], at_cut[good], period=TAU)
    # 逐列把缺行按最近的有效行补齐（头皮在发际线边缘卷起 / 断开时，同一列上下仍连续），顶带目标不在相邻点间跳变。
    filled = rho.copy()
    for index in range(columns):
        present = np.flatnonzero(np.isfinite(rho[index]))
        if len(present) and len(present) < rows:
            nearest = present[np.abs(np.arange(rows)[:, None] - present[None, :]).argmin(axis=1)]
            filled[index] = rho[index][nearest]
    return {"grid": grid, "rho": filled, "slope": slope, "atCut": at_cut, "valid": good}


def angle_ranges(mask: np.ndarray) -> list[list[int]]:
    """逐度布尔量压成闭区间 [起, 止]（度序号，不跨 0 度回绕；全真为 [[0, n-1]]）。"""
    flags = np.asarray(mask, dtype=bool); edges = np.diff(np.r_[0, flags.astype(np.int8), 0])
    return [[int(a), int(b) - 1] for a, b in zip(np.flatnonzero(edges == 1), np.flatnonzero(edges == -1))]


def _section_center(radius: np.ndarray, theta: np.ndarray, valid: np.ndarray) -> tuple[float, float, float, int]:
    """逐角半径 r(θ) 在 valid 角度上拟合 R + cx·cosθ + cz·sinθ（最小二乘）：返回截面中心 (cx, cz)、平均半径与角数。"""
    if np.count_nonzero(valid) < len(theta) // 3: return 0., 0., float("nan"), int(np.count_nonzero(valid))
    design = np.column_stack((np.ones(np.count_nonzero(valid)), np.cos(theta[valid]), np.sin(theta[valid])))
    (mean, cx, cz), *_ = np.linalg.lstsq(design, radius[valid], rcond=None)
    return float(cx), float(cz), float(mean), int(np.count_nonzero(valid))


def center_neck_section(positions: np.ndarray, frame: dict[str, np.ndarray], h_head: float, head_ring: np.ndarray,
                        template_ring: np.ndarray, ring_theta: np.ndarray, mm: float,
                        region_a: np.ndarray | None = None) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """颈子截面对中（D2c）：头按骨骼对位（源颈骨上同比例点 → 模板规范颈环中心），柱面轴是颈骨方向；但模板颈子在
    切口高度的截面中心不在这根轴上（tpl_f_medium 前 8 mm、右 5 mm，tall 前 10–11 mm、右 7 mm），头颈子却按轴居中，
    于是整体偏后偏左，侧面看喉部、后颈在切口处各一道台阶（作者 2026-10-10"穆念慈的颈部还是错开的"）。
    在切口以上 NECK_CENTER_PROBE_MM 处，只取两边都量得到的 A 区角度（region_a > 0.5），按头皮与模板颈子的逐角半径
    各拟合截面中心，在垂直颈轴的平面内平移整个头使两中心重合。返回平移后的点、平移向量（mu）与诊断。"""
    # 两边只在共同量得到的角度上拟合：后颈被发帘挡住时头皮缺一段，颈子截面又不是正圆，各用各的角度会把圆心拟偏
    # （黄蓉 287 / 360 角时偏 2 mm）。
    common = np.isfinite(head_ring) & (head_ring > 0) & np.isfinite(template_ring) & (template_ring > 0)
    if region_a is not None:          # 只按看得见的 A 区对中：发帘下（B 区）的颈皮不看，黄蓉颈子比模板细 6 mm 时圆心随角度集合变
        common &= np.nan_to_num(np.asarray(region_a, dtype=np.float64), nan=0.) > .5
    hx, hz, h_mean, h_count = _section_center(head_ring, ring_theta, common)
    tx, tz, t_mean, t_count = _section_center(template_ring, ring_theta, common)
    if not (np.isfinite(h_mean) and np.isfinite(t_mean)):
        raise ValueError(f"颈子截面对中缺数据：头 {h_count} 角、模板 {t_count} 角有半径")
    dx, dz = tx - hx, tz - hz
    if np.hypot(dx, dz) > NECK_CENTER_MAX_MM * mm:
        raise ValueError(f"颈子截面中心相差 {np.hypot(dx, dz) / mm:.1f} mm，超过 {NECK_CENTER_MAX_MM:g} mm，疑似量测异常")
    shift = dx * np.asarray(frame["right"], dtype=np.float64) + dz * np.asarray(frame["front"], dtype=np.float64)
    return positions + shift, shift, {
        "probeMm": NECK_CENTER_PROBE_MM, "hHeadMm": float(h_head / mm),
        "headCenterMm": [float(hx / mm), float(hz / mm)], "templateCenterMm": [float(tx / mm), float(tz / mm)],
        "shiftMm": [float(dx / mm), float(dz / mm)], "shiftNormMm": float(np.hypot(dx, dz) / mm),
        "headMeanRadiusMm": float(h_mean / mm), "templateMeanRadiusMm": float(t_mean / mm),
        "headAngles": h_count, "templateAngles": t_count,
        # 非正圆截面的拟合圆心随角度集合变（黄蓉 tall 换一组 A 区角度差 1.3 mm）：记下所用角度，供独立复核同口径复量
        "anglesDeg": angle_ranges(common)}


def fit_neck_to_template(positions: np.ndarray, frame: dict[str, np.ndarray], h_head: float, h_band_top: float,
                         ring_theta: np.ndarray, head_ring: np.ndarray, head_slope: np.ndarray,
                         template_ring: np.ndarray, template_slope: np.ndarray, region_a: np.ndarray, mm: float
                         ) -> tuple[np.ndarray, dict[str, Any]]:
    """颈部粗细适配（D2）：按需把头侧颈子在切口处收细，使颈片桥逐角单调（不再先收再鼓再收）。

    颈片自由段从底带上沿 h_band_top（模板半径 r_b、斜率 s_b）到 G1 裙带下沿 h_head − G1_SKIRT（头皮半径减内缩再按
    斜率 s_t 向下外推）。两端都向上收（s_b、s_t < 0）而总落差不足时，光顺曲线只能先收再鼓再收——发髻全盘、后颈裸露
    的生成头整圈受检，后颈两侧就出这种 S 形（穆念慈 194°–223°）。三次 Hermite 单调的充分条件是平均斜率
    Δ ≤ (s_b + s_t) / 3（斜率比 α + β ≤ 3）；逐角算出满足它所需的最小收细量（毫米，至多 NECK_FIT_MAX_MM），只在
    A 区、两端都向上收的角度做，按角度平滑后在切口处整量施加，向上 NECK_FIT_RAMP_MM 内线性渐隐到不动。只动颈壳内
    的点（半径 ≤ 该角切口处头皮半径 × NECK_FIT_SHELL：下巴、脸、发髻不动）。颈子本来就收得够快的角度算出来是 0，
    不动；前方喉部 s_t > 0（往下巴变粗）也不动。黄蓉三体型各有 70–87 个角度生效，颈片转折 / 鼓包反而更小。"""
    bins = len(ring_theta)
    length = (h_head - G1_SKIRT_MM * mm) - h_band_top
    narrowing = (head_slope < 0) & (template_slope < 0)
    skirt_bottom = head_ring - TOP_INSET_MM * mm - np.minimum(head_slope, 0.) * G1_SKIRT_MM * mm
    needed = template_ring + length * (template_slope + head_slope) / 3
    amount = np.where(narrowing & np.isfinite(skirt_bottom) & np.isfinite(needed), skirt_bottom - needed, 0.)
    amount = np.clip(amount, 0., NECK_FIT_MAX_MM * mm) * np.clip(np.nan_to_num(region_a, nan=0.), 0., 1.)
    kernel_x = np.arange(-3 * NECK_FIT_SMOOTH_DEG, 3 * NECK_FIT_SMOOTH_DEG + 1)
    kernel = np.exp(-.5 * (kernel_x / NECK_FIT_SMOOTH_DEG) ** 2); kernel /= kernel.sum()
    padded = np.concatenate((amount[-len(kernel_x):], amount, amount[:len(kernel_x)]))
    amount = np.convolve(padded, kernel, mode="same")[len(kernel_x):len(kernel_x) + bins]
    theta, height, rho = cylinder(positions, frame)
    vertex_amount = _cyclic_lookup(amount, theta)
    ring_at = _cyclic_lookup(np.nan_to_num(head_ring, nan=0.), theta)
    weight = np.clip(1 - (height - h_head) / (NECK_FIT_RAMP_MM * mm), 0., 1.)
    shell = (ring_at > 0) & (rho > 0) & (rho <= ring_at * NECK_FIT_SHELL) & (height >= h_head - NECK_FIT_BELOW_MM * mm)
    new_rho = np.where(shell, np.maximum(rho - weight * vertex_amount, .5 * rho), rho)
    scale = np.where(rho > 0, new_rho / np.where(rho > 0, rho, 1.), 1.)
    axis = np.asarray(frame["axis"], dtype=np.float64); relative = positions - frame["center"]
    along = (relative @ axis)[:, None] * axis
    fitted = frame["center"] + along + (relative - along) * scale[:, None]
    moved = scale < 1 - 1e-9; active = amount > 1e-6 * mm
    return fitted, {"rampMm": NECK_FIT_RAMP_MM, "maxMm": NECK_FIT_MAX_MM, "shell": NECK_FIT_SHELL,
                    "smoothDeg": NECK_FIT_SMOOTH_DEG, "freeZoneMm": float(length / mm),
                    "activeAngles": int(np.count_nonzero(active)), "movedVertices": int(np.count_nonzero(moved)),
                    "amountMaxMm": float(amount.max(initial=0.) / mm),
                    "maxShrinkMm": float(np.max((rho - new_rho)[moved], initial=0.) / mm)}


def _cyclic_lookup(values: np.ndarray, theta: np.ndarray) -> np.ndarray:
    count = len(values); x = np.mod(np.asarray(theta), TAU) / (TAU / count) - .5
    x0 = np.floor(x).astype(int); fx = x - x0
    return (1 - fx) * values[x0 % count] + fx * values[(x0 + 1) % count]


def patch_targets(positions: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray],
                  envelopes: dict[str, Any], floor: dict[str, Any], h_bottom: float, mm: float,
                  normals: np.ndarray | None = None, profile: dict[str, Any] | None = None
                  ) -> tuple[np.ndarray, np.ndarray, dict[str, np.ndarray]]:
    """约束带与目标位置：底带外移 BOTTOM_LIFT_MM（位移即法向偏移），h_head 以上的顶带按角度分区——
    A 区贴到源头皮肤下 0.3 mm，B 区保持模板形状但收进发帘内 3 mm。"""
    grid = envelopes["grid"]
    theta, height, rho = cylinder(positions, frame)
    if normals is None: normals = _vertex_normals(positions, faces)
    bottom = height <= h_bottom + BOTTOM_BAND_MM * mm
    top = height >= floor["hHead"]
    weight_a = weight_a_at(theta, floor)
    rho_skin = sample_grid(envelopes["skin"], grid, theta, height)
    if profile is not None:                     # 切口附近改用裁后头皮的细网格
        fine = sample_grid(profile["rho"], profile["grid"], theta, height)
        inside = (height >= profile["grid"].h_lo) & (height <= profile["grid"].h_hi) & np.isfinite(fine)
        rho_skin = np.where(inside, fine, rho_skin)
    rho_env = sample_grid(envelopes["env"], grid, theta, height)
    rho_ref = sample_grid(envelopes["skin"], grid, theta, np.full_like(height, floor["hHead"] + .5 * mm))
    jump = np.isfinite(rho_ref) & (np.abs(np.nan_to_num(rho_skin, nan=np.inf) - rho_ref) > TOP_JUMP_MM * mm)
    rho_skin = np.where(jump, rho_ref, rho_skin)
    rho_a = rho_skin - TOP_INSET_MM * mm
    effective = np.where(np.isfinite(rho_a), weight_a, 0.)
    if profile is not None:
        # 头皮缺处（B 侧过渡带、A 区零星空洞）用虚拟切口剖面沿斜率外推，只在切口以上 TOP_BAND 内全权，
        # 再向上 TOP_BAND 渐隐到 B 区形状（过渡带里颈片一直长进发帘，外推不能延伸到那里）。
        virtual = (_cyclic_lookup(profile["atCut"], theta) - TOP_INSET_MM * mm
                   + np.clip(_cyclic_lookup(profile["slope"], theta), -1, 1) * (height - floor["hHead"]))
        near_cut = 1 - _smoothstep((height - floor["hHead"] - TOP_BAND_MM * mm) / (TOP_BAND_MM * mm))
        effective = np.where(np.isfinite(rho_a), effective, weight_a * near_cut)
        rho_a = np.where(np.isfinite(rho_a), rho_a, virtual)
    rho_b = np.where(np.isfinite(rho_env), np.minimum(rho, rho_env - ENVELOPE_INSET_MM * mm), rho)
    rho_target = effective * np.nan_to_num(rho_a) + (1 - effective) * rho_b
    # A/B 过渡区凡有头皮处（切口到 TOP_BAND+1 mm）不得高出 A 区目标：B 区模板形状只许更深，不许顶出头皮。
    under = top & np.isfinite(rho_skin) & (height <= floor["hHead"] + (TOP_BAND_MM + 1) * mm)
    rho_target = np.where(under, np.minimum(rho_target, rho_a), rho_target)
    targets = positions.copy()
    targets[top] = from_cylinder(theta[top], height[top], rho_target[top], frame)
    # G1 裙带：切口下方 G1_SKIRT_MM 内，A 区沿头皮在切口处的切向线性外推（B 区仍取模板）。
    h_head = floor["hHead"]
    skirt = (height < h_head) & (height >= h_head - G1_SKIRT_MM * mm) & ~bottom
    if profile is not None:
        rho_0 = _cyclic_lookup(profile["atCut"], theta); slope = np.clip(_cyclic_lookup(profile["slope"], theta), -1, 1)
        rho_0 = np.where(rho_0 > 0, rho_0, np.nan)
        # 向下外扩的外推量按 tanh 饱和到"底端余量 + SKIRT_ROOM_MM"：切口处斜率不变（G1），但源颈比模板宽且
        # 向下外扩时不再把颈片顶成鼓包（D1b 实测：发际线边缘 −18°～−32° 外推 5 mm，鼓出 1.9 mm）。
        rise = slope * (height - h_head)
        room = np.maximum(_ring_radius(positions, faces, frame, h_bottom + BOTTOM_BAND_MM * mm, theta)
                          - (rho_0 - TOP_INSET_MM * mm), 0.) + SKIRT_ROOM_MM * mm
        room = np.where(np.isfinite(room), room, np.inf)
        capped = np.where(np.isfinite(room), room * np.tanh(rise / np.where(np.isfinite(room), room, 1.)), rise)
        rise = np.where(rise > 0, capped, rise)
        rho_skirt = rho_0 - TOP_INSET_MM * mm + rise
    else:
        rho_0 = sample_grid(envelopes["skin"], grid, theta, np.full_like(height, h_head + .5 * mm))
        rho_1 = sample_grid(envelopes["skin"], grid, theta, np.full_like(height, h_head + G1_SLOPE_MM * mm))
        slope = np.clip((rho_1 - rho_0) / ((G1_SLOPE_MM - .5) * mm), -1, 1)
        rho_skirt = rho_0 - TOP_INSET_MM * mm + slope * (height - h_head - .5 * mm)
    skirt_weight = np.where(np.isfinite(rho_skirt), weight_a, 0.)
    rho_skirt = skirt_weight * np.nan_to_num(rho_skirt) + (1 - skirt_weight) * rho
    targets[skirt] = from_cylinder(theta[skirt], height[skirt], rho_skirt[skirt], frame)
    targets[bottom] = positions[bottom] + normals[bottom] * (BOTTOM_LIFT_MM * mm)
    constrained = bottom | top | skirt
    return constrained, targets, {"bottom": bottom, "top": top, "skirt": skirt, "weightA": weight_a,
                                  "skinMissingInA": top & (weight_a > .5) & ~np.isfinite(rho_skin)}


def _ring_radius(positions: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray], height: float,
                 theta: np.ndarray, bins: int = 360) -> np.ndarray:
    """网格在高度 height 处逐角（首层）半径，按 θ 周期线性插值到给定角度；无覆盖为 nan。"""
    grid = CylinderGrid(bins, height - 1e-9, height + 1e-9, 1)
    rho, _, _ = rasterize_cylinder(positions, faces, frame, grid)
    ring = rho[:, 0]; valid = np.isfinite(ring)
    if not valid.any(): return np.full(len(theta), np.nan)
    centers = grid.theta_centers()
    return np.interp(np.mod(theta, TAU), centers[valid], ring[valid], period=TAU)


def inset_under_skin(targets: np.ndarray, mask: np.ndarray, positions: np.ndarray, faces: np.ndarray,
                     frame: dict[str, np.ndarray], h_head: float, mm: float, rounds: int = 4
                     ) -> tuple[np.ndarray, dict[str, Any]]:
    """顶带目标按到头皮网格的精确带符号距离再压一次：距离在 (−TOP_INSET, +1 mm) 的点沿径向内收，使法向距离
    达到 −TOP_INSET（径向内缩 0.3 mm 在斜面上只合法向 0.3·cosφ）。只改半径、不改 (θ,h)：沿头皮法向压时，
    发际线卷边处法向几乎是侧向，会把相邻点挤扁成翻面的细条。法向径向分量 < 0.3（卷边、近水平面）或最近点
    在切口以上 0.25 mm 内（开口边，法向无定义）时不动；单次径向移动不超过 2·TOP_INSET。迭代至多 rounds 次。

    步长按带符号距离的真实梯度（最近点 → 该点的几何方向）与径向的夹角折算：最近点落在面角 / 棱边附近时，
    插值顶点法向与该方向可差 50° 以上，按顶点法向估的步长只走所需的 1/4（D1c tall 发际线点两轮只到 −0.19 mm）。
    梯度径向分量 ≤ 0.05（径向内移不再加深）的点不动；步长分母下限 0.15。"""
    out = targets.copy(); ids = np.flatnonzero(mask); moved = np.zeros(len(targets), bool)
    if not len(ids) or not len(faces): return out, {"moved": 0, "maxMoveMm": 0.}
    normals = _vertex_normals(positions, faces)
    for _ in range(rounds):
        result = signed_distance(out[ids], positions, faces, normals, k=16)
        direction = np.einsum("ni,nij->nj", result.barycentric, normals[faces[result.face_indices]])
        direction /= np.maximum(np.linalg.norm(direction, axis=1, keepdims=True), 1e-12)
        # 外向梯度：点在外为 最近点→点，在内为 点→最近点；贴着表面（< 1 µm）时退回插值法向。
        offset = (out[ids] - result.nearest_points) * np.sign(result.distances_mu)[:, None]
        length = np.linalg.norm(offset, axis=1)
        gradient = np.where(length[:, None] > 1e-3 * mm, offset / np.maximum(length, 1e-30)[:, None], direction)
        _, near_height, _ = cylinder(result.nearest_points, frame)
        theta, height, rho = cylinder(out[ids], frame)
        radial = np.cos(theta)[:, None] * frame["right"] + np.sin(theta)[:, None] * frame["front"]
        facing = np.einsum("ij,ij->i", direction, radial)                       # 卷边判据（插值法向，同前）
        gain = np.einsum("ij,ij->i", gradient, radial)                          # 径向内移对带符号距离的实际增益
        push = ((result.distances_mu > -TOP_INSET_MM * mm + 1e-9) & (result.distances_mu < 1 * mm)
                & (near_height >= h_head + .25 * mm) & (facing >= .3) & (gain > .05))
        if not push.any(): break
        shift = np.clip((-TOP_INSET_MM * mm - result.distances_mu) / np.maximum(gain, .15), -2 * TOP_INSET_MM * mm, 0.)
        rows = np.flatnonzero(push)
        out[ids[rows]] = from_cylinder(theta[rows], height[rows], rho[rows] + shift[rows], frame)
        moved[ids[rows]] = True
    shift = np.linalg.norm(out - targets, axis=1)
    return out, {"moved": int(np.count_nonzero(moved)), "maxMoveMm": float(shift.max(initial=0) / mm)}


def blend_head_weights(dense: np.ndarray, height: np.ndarray, h_head: float, head_slot: int,
                       mm: float, mask: np.ndarray) -> np.ndarray:
    """h_head 以上 WEIGHT_BLEND_MM 内由颈片权重平滑过渡到 Head（只作用于 mask 选中的点）。"""
    blend = _smoothstep((height - h_head) / (WEIGHT_BLEND_MM * mm)) * mask
    out = dense * (1 - blend)[:, None]; out[:, head_slot] += blend
    return out


def patch_ring_weights(positions: np.ndarray, faces: np.ndarray, dense: np.ndarray, frame: dict[str, np.ndarray],
                       h_cut: float, bins: int = ANGLE_BINS) -> np.ndarray:
    """颈片在切口高度 h_cut 处逐角的模板权重：在 (θ,h) 网格的单行上光栅化颈片三角，按重心插值稠密权重
    （不依赖切口附近恰好有顶点）；无覆盖的角度周期插补。"""
    grid = CylinderGrid(bins, h_cut - 1e-9, h_cut + 1e-9, 1)
    rho, _, values = rasterize_cylinder(positions, faces, frame, grid, corner_values=dense[faces])
    valid = np.isfinite(rho[:, 0])
    ring = values[:, 0, :]
    if not valid.all():
        filled = smooth_cyclic(ring, 1., valid=valid)
        if np.isnan(filled).any(): filled = smooth_cyclic(ring, bins / 8, valid=valid)
        ring = np.where(valid[:, None], ring, np.nan_to_num(filled))
    total = ring.sum(axis=1, keepdims=True)
    return np.divide(ring, total, out=np.zeros_like(ring), where=total > 1e-9)


def head_vertex_weights(head: dict[str, np.ndarray], frame: dict[str, np.ndarray], floor: dict[str, Any],
                        envelopes: dict[str, Any], top_weights: np.ndarray, joint_count: int,
                        slots: dict[str, int], mm: float, band_points: np.ndarray | None = None) -> np.ndarray:
    """头部权重 = m·W(θ,h) + (1−m)·默认（Head=1；切口以下的垂发按高度在 Head / Neck / Spine2 间分配，沿用 D1）。

    W 与颈片重叠带同一函数；m 是皮肤"属于颈部"的程度，按半径比 q = ρ / 切口上 3 mm 处的皮肤半径（B 区周期插补）
    平滑过渡：q ≤ NECK_SHELL_FACTOR 为 1、再过 SHELL_FADE 归 0（下巴 / 脸）；切口以上 SEAM_SKIN_MM 内不论半径为 1，
    再向上 SEAM_FADE_MM 渐隐。m 连续 → 皮肤三角各角权重不在单个三角里跳变。凡是皮肤三角的角（含发际线发根、颜色
    介于肤发之间未归类的点）按同一规则进场：否则发际线皮肤三角一角 Head=1，动作中整片翻折压过颈片（D1b 实测
    0.6–0.9 mm）。不属于任何皮肤三角的头发保持默认权重——让贴颈垂发也跟颈部走，会把发片拉成刷子状（run 帧截图）。
    此外离颈片重叠带（band_points，变形后）BAND_REACH_MM 内的任何头部顶点（发际线上颜色近肤、归类为头发的面）都完全
    进场，再过 BAND_FADE_MM 淡出：重叠带上方的一切几何与颈片同步。"""
    theta, height, rho = cylinder(head["positions"], frame)
    h_head = floor["hHead"]; above = height - h_head
    grid = envelopes["grid"]; centers = grid.theta_centers()
    ring = sample_grid(envelopes["skin"], grid, centers, np.full_like(centers, h_head + 3 * mm))
    valid = np.isfinite(ring)
    if valid.any() and not valid.all():
        ring = np.interp(centers, centers[valid], ring[valid], period=TAU)
    ref = np.interp(theta, centers, ring, period=TAU) if valid.any() else np.full_like(theta, np.nan)
    ratio = np.divide(rho, ref, out=np.full_like(rho, np.inf), where=np.isfinite(ref) & (ref > 0))
    faces = head["faces"]; skin_corner = np.zeros(len(height), bool)
    skin_corner[np.unique(faces[head["skin"][faces].sum(axis=1) >= 2])] = True
    skin = (head["skin"] | skin_corner).astype(np.float64)      # 皮肤 + 皮肤三角的其余角（发际线发根、介于肤发之间的色）
    member = skin * (1 - _smoothstep((ratio - NECK_SHELL_FACTOR) / SHELL_FADE)) * (above <= WEIGHT_BLEND_MM * mm)
    member *= _smoothstep((above + 3 * mm) / (3 * mm))
    seam = skin * (1 - _smoothstep((above - SEAM_SKIN_MM * mm) / (SEAM_FADE_MM * mm)))
    member = np.maximum(member, seam)
    if band_points is not None and len(band_points):
        from scipy.spatial import cKDTree
        distance, _ = cKDTree(band_points).query(head["positions"])
        member = np.maximum(member, 1 - _smoothstep((distance - BAND_REACH_MM * mm) / (BAND_FADE_MM * mm)))
    default = np.zeros((len(height), joint_count)); default[:, slots["mixamorig:Head"]] = 1
    hanging = head["hair"] & (height < 0)
    for row in np.flatnonzero(hanging):
        alpha = float(np.clip((height[row] + .10) / .10, 0, 1))
        default[row] = 0
        default[row, slots["mixamorig:Head"]] = .35 + .55 * alpha
        default[row, slots["mixamorig:Neck"]] = .45 * (1 - alpha)
        default[row, slots.get("mixamorig:Spine2", slots["mixamorig:Neck"])] += .20 * (1 - alpha)
    bins = len(top_weights)
    index = np.floor(theta / TAU * bins).astype(int) % bins
    field = blend_head_weights(top_weights[index], height, h_head, slots["mixamorig:Head"], mm, np.ones(len(height)))
    return member[:, None] * field + (1 - member)[:, None] * default


# ---------------------------------------------------------------- 拼接：条带贴图

def _bilinear(image: np.ndarray, uvs: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    x = np.clip(uvs[:, 0] * width - .5, 0, width - 1); y = np.clip(uvs[:, 1] * height - .5, 0, height - 1)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    x1, y1 = np.minimum(x0 + 1, width - 1), np.minimum(y0 + 1, height - 1)
    fx, fy = (x - x0)[:, None], (y - y0)[:, None]
    return ((1 - fx) * (1 - fy) * image[y0, x0] + fx * (1 - fy) * image[y0, x1]
            + (1 - fx) * fy * image[y1, x0] + fx * fy * image[y1, x1])


def _fill_nearest(values: np.ndarray, valid: np.ndarray) -> np.ndarray:
    if valid.all() or not valid.any(): return values
    from scipy.ndimage import distance_transform_edt
    _, (iy, ix) = distance_transform_edt(~valid, return_indices=True)
    return values[iy, ix]


@dataclass
class StripLayout:
    """条带的分段高度映射：内容行 0 = h_hi（顶），upper 段 [h_split, h_hi]、lower 段 [h_lo, h_split]。
    接缝所在的 lower 段约 0.26 mm 一行，后脑发色区较疏；烘焙在 lower 段分辨率的均匀细网格上做，再按此映射重采样。"""

    h_lo: float
    h_split: float
    h_hi: float
    rows_lower: int
    rows_upper: int
    width: int = ATLAS_SIZE

    @property
    def rows(self) -> int: return self.rows_lower + self.rows_upper

    def row_of(self, h: np.ndarray) -> np.ndarray:
        h = np.asarray(h, dtype=np.float64)
        upper = (self.h_hi - h) / (self.h_hi - self.h_split) * self.rows_upper
        lower = self.rows_upper + (self.h_split - h) / (self.h_split - self.h_lo) * self.rows_lower
        return np.where(h >= self.h_split, upper, lower)

    def h_of_rows(self) -> np.ndarray:
        centers = np.arange(self.rows) + .5
        return np.where(centers <= self.rows_upper,
                        self.h_hi - centers / self.rows_upper * (self.h_hi - self.h_split),
                        self.h_split - (centers - self.rows_upper) / self.rows_lower * (self.h_split - self.h_lo))

    def fine_grid(self) -> CylinderGrid:
        dh = (self.h_split - self.h_lo) / self.rows_lower
        return CylinderGrid(self.width, self.h_lo, self.h_hi, int(math.ceil((self.h_hi - self.h_lo) / dh)),
                            theta_offset=STRIP_SEAM)


def resample_strip(fine: np.ndarray, grid: CylinderGrid, layout: StripLayout) -> np.ndarray:
    """细网格烘焙结果（行：h 由高到低）按分段映射线性重采样到条带内容行。"""
    heights = grid.h_centers()[::-1]                         # 与 fine 的行序一致（由高到低）
    targets = layout.h_of_rows()
    position = np.interp(-targets, -heights, np.arange(len(heights)))
    low = np.clip(np.floor(position).astype(int), 0, len(heights) - 1)
    high = np.clip(low + 1, 0, len(heights) - 1); weight = (position - low)[:, None, None]
    out = fine[low].astype(np.float64) * (1 - weight) + fine[high].astype(np.float64) * weight
    return np.round(out).astype(np.uint8)


def bake_strip(patch: dict[str, np.ndarray], frame: dict[str, np.ndarray], grid: CylinderGrid,
               body_image: Image.Image, tint: np.ndarray, head: dict[str, np.ndarray], head_image: Image.Image,
               floor: dict[str, Any], hair_linear: np.ndarray, mm: float) -> tuple[np.ndarray, dict[str, Any]]:
    """颈片条带（θ 列 × h 行，h 由高到低自上而下），线性空间合成后转 sRGB：

    - 基色：模板身体贴图 × skinTint（与运行时身体着色一致），底部接缝因此与身体同色；
    - A 区 h ≥ h_head（重叠带，藏在头皮下）：逐纹素直接取头皮贴图色，即使穿出也与头皮一致；
    - A 区 h < h_head：逐列增益 G = 头切口色 / 模板色，平滑分量在 COLOR_BLEND_MM 内、逐列细节在
      2 mm 内淡出，切口处逐列精确连续又不拖出竖纹；
    - B 区 h_head + HAIRLINE_MM 以上渐变到发色（发帘下的后颈 / 后脑）。
    """
    body = np.asarray(body_image.convert("RGB"), dtype=np.float64) / 255
    rho, _, uv = rasterize_cylinder(patch["sourcePositions"], patch["faces"], frame, grid,
                                    corner_values=patch["cornerUvs"])
    covered = np.isfinite(rho)
    colors = _bilinear(body, uv.reshape(-1, 2)).reshape(grid.theta_count, grid.h_count, 3)
    linear = _fill_nearest(_srgb_to_linear(np.clip(colors, 0, 1)) * np.asarray(tint)[None, None, :], covered)
    theta_c, h_c = grid.theta_centers(), grid.h_centers()
    h_head = floor["hHead"]; weight_a = weight_a_at(theta_c, floor)
    # 头皮（已在 h_head 处裁开）在同一 (θ,h) 网格上的贴图色。
    head_img = np.asarray(head_image.convert("RGB"), dtype=np.float64) / 255
    skin_faces = head["faces"][head["skin"][head["faces"]].sum(axis=1) >= 2]
    _, skin_height, _ = cylinder(head["positions"], frame)
    near_cut = skin_height[skin_faces].min(axis=1) <= h_head + (TOP_BAND_MM + 2) * mm
    skin_faces = skin_faces[near_cut]
    head_rho, _, head_uv = rasterize_cylinder(head["positions"], skin_faces, frame, grid,
                                              corner_values=head["uvs"][skin_faces])
    band = (h_c >= h_head) & (h_c <= h_head + (TOP_BAND_MM + 1.5) * mm)
    head_valid = np.isfinite(head_rho) & band[None, :]
    head_lin = np.zeros_like(linear)
    if np.any(head_valid):
        head_lin[head_valid] = _srgb_to_linear(np.clip(_bilinear(head_img, head_uv[head_valid]), 0, 1))
    # 切口行：每列 h_head 之上首两行的头皮色均值（D2c 起按任务口径严格两行；D1b 起此处曾取三行）。
    first_rows = np.flatnonzero(band)[:CUT_COLOR_ROWS]
    row_valid = head_valid[:, first_rows]
    count = row_valid.sum(axis=1)
    head_row = np.divide((head_lin[:, first_rows] * row_valid[:, :, None]).sum(axis=1), count[:, None],
                         out=np.zeros((grid.theta_count, 3)), where=count[:, None] > 0)
    tpl_row = linear[:, first_rows].mean(axis=1)
    # 下接缝附近的身体色（D2c，作者"身体颜色和脖子下面接缝附近颜色对齐"）：遮罩平面上下 TINT_SEAM_BAND_MM 内的条带行，
    # 即运行时可见身体开始处；染色增益 = 切口头色 ÷ 这里的染色后身体色（不是同高度、被遮罩隐藏的模板上段颈子）。
    mask_h = (PATCH_BOTTOM_MM + MASK_OFFSET_MM) * mm
    seam_rows = np.flatnonzero(np.abs(h_c - mask_h) <= TINT_SEAM_BAND_MM * mm)
    seam_valid = covered[:, seam_rows]
    seam_count = seam_valid.sum(axis=1)
    body_seam = np.divide((linear[:, seam_rows] * seam_valid[:, :, None]).sum(axis=1), seam_count[:, None],
                          out=np.full((grid.theta_count, 3), np.nan), where=seam_count[:, None] > 0)
    has_head = count > 0
    gain_exact = np.where(has_head[:, None], np.clip(head_row / np.maximum(tpl_row, 1e-6), .5, 2.), 1.)
    sigma = COLOR_SMOOTH_DEG * grid.theta_count / 360
    gain_smooth = np.nan_to_num(smooth_cyclic(gain_exact, sigma, valid=has_head), nan=1.)
    gain_exact = np.where(has_head[:, None], gain_exact, gain_smooth)
    slow = _smoothstep((h_c - (h_head - COLOR_BLEND_MM * mm)) / (COLOR_BLEND_MM * mm))
    fast = _smoothstep((h_c - (h_head - 2 * mm)) / (2 * mm))
    gain = (1 + (gain_smooth[:, None, :] - 1) * slow[None, :, None]
            + (gain_exact - gain_smooth)[:, None, :] * fast[None, :, None])
    below = (h_c < h_head)[None, :, None]
    weight = weight_a[:, None, None]
    linear = np.where(below, linear * (1 + (gain - 1) * weight), linear)
    overlap = head_valid[:, :, None] & ~below
    linear = np.where(overlap, linear * (1 - weight) + head_lin * weight, linear)
    # 重叠带里缺头皮的格（例如 A/B 交界）沿用切口行增益。
    linear = np.where(~head_valid[:, :, None] & ~below, linear * (1 + (gain_exact[:, None, :] - 1) * weight), linear)
    hair_ramp = _smoothstep((h_c - (h_head + HAIRLINE_MM * mm)) / (HAIRLINE_BLEND_MM * mm))
    hair_mix = ((1 - weight_a)[:, None] * hair_ramp[None, :])[:, :, None]
    linear = linear * (1 - hair_mix) + np.asarray(hair_linear)[None, None, :] * hair_mix
    srgb = np.clip(_linear_to_srgb(np.clip(linear, 0, 1)), 0, 1)
    image = np.round(srgb.transpose(1, 0, 2)[::-1] * 255).astype(np.uint8)   # 行：h 由高到低
    region = has_head & (weight_a > .5)
    seam_region = region & (seam_count > 0)
    gain_seam = np.divide(head_row, body_seam, out=np.ones_like(head_row), where=np.isfinite(body_seam) & (body_seam > 1e-6))
    return image, {"coveredRatio": float(covered.mean()),
                   "seamRows": int(len(seam_rows)), "seamAngles": int(np.count_nonzero(seam_region)),
                   "gainSeamMean": (np.clip(gain_seam[seam_region], .5, 2.).mean(axis=0) if np.any(seam_region)
                                    else np.ones(3)),
                   "bodySeamSrgb": (_linear_to_srgb(body_seam[seam_region].mean(axis=0)) if np.any(seam_region)
                                    else None),
                   "headOverlapTexels": int(np.count_nonzero(head_valid)),
                   "gainMean": gain_smooth[region].mean(axis=0) if np.any(region) else np.ones(3),
                   "headCutSrgb": _linear_to_srgb(head_row[region].mean(axis=0)) if np.any(region) else None,
                   "bodyCutSrgb": _linear_to_srgb(tpl_row[region].mean(axis=0)) if np.any(region) else None}


def head_canvas(source_image: Image.Image, size: int = ATLAS_SIZE) -> Image.Image:
    """最终图集的上半部：源头图集压到上方 size−STRIP_ROWS 行（头 UV 的 v 同比压缩），下方留给条带。
    条带烘焙也从这张图取头皮色，保证重叠带与最终显示逐纹素一致（发际线附近原图 / 缩图差可达 ΔE 3）。"""
    canvas = Image.new("RGB", (size, size))
    canvas.paste(source_image.convert("RGB").resize((size, size - STRIP_ROWS), Image.Resampling.LANCZOS), (0, 0))
    return canvas


def compose_atlas(canvas: Image.Image, strip: np.ndarray, size: int = ATLAS_SIZE) -> Image.Image:
    """在 head_canvas 下方 STRIP_ROWS 行写颈片条带（顶部 STRIP_GUARD 行复制首行防渗色）。"""
    atlas = canvas.copy()
    if strip.shape[:2] != (STRIP_ROWS - STRIP_GUARD, size): raise ValueError(f"条带尺寸 {strip.shape} 与图集不符")
    content = Image.fromarray(strip, "RGB")
    guard = content.crop((0, 0, size, 1)).resize((size, STRIP_GUARD))
    atlas.paste(guard, (0, size - STRIP_ROWS)); atlas.paste(content, (0, size - STRIP_ROWS + STRIP_GUARD))
    return atlas


def patch_strip_uvs(source_positions: np.ndarray, faces: np.ndarray, frame: dict[str, np.ndarray],
                    layout: StripLayout, size: int = ATLAS_SIZE) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """按原（未变形）模板位置给颈片柱面 UV（v 走条带分段映射）；跨背后接缝的三角在缝另一侧复制顶点
    （u+1，依赖 REPEAT）。返回 (uv, 新面, 新顶点→原顶点)。"""
    theta, height, _ = cylinder(source_positions, frame)
    u = np.mod(theta - STRIP_SEAM, TAU) / TAU
    v = (size - STRIP_ROWS + STRIP_GUARD + layout.row_of(height)) / size
    uvs = [np.column_stack((u, v))]; origin = [np.arange(len(u))]
    duplicate: dict[int, int] = {}; next_index = len(u)
    out_faces = faces.copy()
    for index, face in enumerate(faces):
        uu = u[face]
        if uu.max() - uu.min() <= .5: continue
        for corner, vertex in enumerate(face):
            if uu[corner] < .5:
                if vertex not in duplicate:
                    duplicate[int(vertex)] = next_index; next_index += 1
                    uvs.append(np.array([[u[vertex] + 1., v[vertex]]])); origin.append(np.array([vertex]))
                out_faces[index, corner] = duplicate[int(vertex)]
    return np.concatenate(uvs), out_faces, np.concatenate(origin)



# ---------------------------------------------------------------- 身体遮罩

def bake_hide_mask(path: Path, body: Mesh, allowed_faces: np.ndarray, axis: np.ndarray,
                   center: np.ndarray, size: int = HIDE_MASK_SIZE) -> dict[str, Any]:
    """烘焙有符号高度场；运行时红通道 0.5 等值线就是遮罩平面（规范环平面，落在底部重叠带内）。

    只在 allowed_faces（与颈片同一批模板三角）上写值，其余身体保持可见。
    """
    if body.uvs is None: raise ValueError("模板须含 UV")
    scale = 4; high_size = size * scale
    field = np.zeros((high_size, high_size), dtype=np.uint8)
    coverage = np.zeros((high_size, high_size), dtype=bool)
    height = (body.positions - center) @ axis
    all_faces = body.indices.reshape(-1, 3)
    crossing = allowed_faces & np.any(height[all_faces] > 0, axis=1) & np.any(height[all_faces] <= 0, axis=1)
    transition_mu = max(float(np.abs(height[all_faces[crossing]]).max(initial=.002)), .002) * 1.001
    covered = 0
    for face in all_faces[allowed_faces]:
        if np.all(height[face] <= -transition_mu): continue
        uv = np.clip(body.uvs[face], 0, 1) * (high_size - 1)
        x0, y0 = np.floor(uv.min(axis=0)).astype(int); x1, y1 = np.ceil(uv.max(axis=0)).astype(int)
        if x1 < x0 or y1 < y0: continue
        xx, yy = np.meshgrid(np.arange(x0, x1 + 1) + .5, np.arange(y0, y1 + 1) + .5)
        denominator = ((uv[1, 1] - uv[2, 1]) * (uv[0, 0] - uv[2, 0])
                       + (uv[2, 0] - uv[1, 0]) * (uv[0, 1] - uv[2, 1]))
        if abs(denominator) < 1e-12: continue
        a = ((uv[1, 1] - uv[2, 1]) * (xx - uv[2, 0])
             + (uv[2, 0] - uv[1, 0]) * (yy - uv[2, 1])) / denominator
        b = ((uv[2, 1] - uv[0, 1]) * (xx - uv[2, 0])
             + (uv[0, 0] - uv[2, 0]) * (yy - uv[2, 1])) / denominator
        c = 1 - a - b; inside = (a >= 0) & (b >= 0) & (c >= 0)
        if not np.any(inside): continue
        signed = a * height[face[0]] + b * height[face[1]] + c * height[face[2]]
        encoded = np.clip(128 + signed * (127 / transition_mu), 0, 255)
        tile = field[y0:y1 + 1, x0:x1 + 1]; tile_coverage = coverage[y0:y1 + 1, x0:x1 + 1]
        encoded_u8 = encoded.astype(np.uint8)
        overlap = inside & tile_coverage
        tile[inside & ~tile_coverage] = encoded_u8[inside & ~tile_coverage]
        tile[overlap] = np.maximum(tile[overlap], encoded_u8[overlap])
        tile_coverage[inside] = True; covered += 1
    # 每个 UV 岛外扩 2 texel 同值 gutter（传播局部有符号高度，不做 max 扩张），避免线性过滤在岛边读到 0。
    for _ in range(scale * 2):
        total = np.zeros_like(field, dtype=np.uint16); count = np.zeros_like(field, dtype=np.uint8)
        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            source_y = slice(max(0, -dy), min(high_size, high_size - dy))
            source_x = slice(max(0, -dx), min(high_size, high_size - dx))
            target_y = slice(max(0, dy), min(high_size, high_size + dy))
            target_x = slice(max(0, dx), min(high_size, high_size + dx))
            valid = coverage[source_y, source_x]
            total[target_y, target_x] += field[source_y, source_x] * valid
            count[target_y, target_x] += valid
        fill = ~coverage & (count > 0)
        field[fill] = (total[fill] / count[fill]).astype(np.uint8); coverage[fill] = True
    result_values = np.asarray(Image.fromarray(field, "L").resize((size, size), Image.Resampling.BOX)).copy()
    # 在穿越遮罩平面的三角顶点上迭代校正四 texel，使 LinearFilter 下 0.5 等值线回到真实高度零点。
    calibrated_faces = allowed_faces & np.any(height[all_faces] > -transition_mu, axis=1)
    calibrated_vertices = np.unique(all_faces[calibrated_faces])
    for _ in range(4):
        sampled = _sample_mask(Image.fromarray(result_values, "L"), body.uvs[calibrated_vertices])
        desired = np.clip(128 + height[calibrated_vertices] * (127 / transition_mu), 0, 255)
        for vertex, correction in zip(calibrated_vertices, desired - sampled):
            x = float(np.clip(body.uvs[vertex, 0] * size - .5, 0, size - 1))
            y = float(np.clip(body.uvs[vertex, 1] * size - .5, 0, size - 1))
            x0, y0 = int(math.floor(x)), int(math.floor(y))
            for py in {y0, min(y0 + 1, size - 1)}:
                for px in {x0, min(x0 + 1, size - 1)}:
                    result_values[py, px] = np.uint8(np.clip(float(result_values[py, px]) + correction, 0, 255))
    result = Image.fromarray(result_values, "L"); result.save(path, format="PNG")
    values = np.asarray(result)
    return {"file": path.name, "size": size, "mode": result.mode,
            "encoding": "signed-height-zero-at-0.5", "transitionRangeMu": transition_mu,
            "coveredTriangles": covered, "whitePixels": int(np.count_nonzero(values == 255)),
            "transitionPixels": int(np.count_nonzero((values > 0) & (values < 255)))}


def hide_mask_integrity(body: Mesh, mask: Image.Image, allowed_faces: np.ndarray, axis: np.ndarray,
                        center: np.ndarray, m_per_mu: float, band_mu: float) -> dict[str, Any]:
    """按 shader 的 > 0.5 门槛核对：遮罩平面以上的允许区全隐藏，平面以下仍保留身体，
    且可见边界全部落在颈片底部重叠带（平面 ± band/2）之内。"""
    faces = body.indices.reshape(-1, 3); height = (body.positions - center) @ axis
    hidden = _sample_mask(mask, body.uvs) > 127.5
    surface = _masked_surface(body, mask); positions = _masked_positions(body.positions, surface)
    visible_height = (positions - center) @ axis
    tolerance_mu = .0005 / max(m_per_mu, 1e-12)
    vertex_allowed = np.zeros(len(positions), dtype=bool)
    vertex_allowed[np.unique(faces[allowed_faces])] = True
    vertex_allowed[len(body.positions):] = True   # 裁切新点只出现在跨遮罩的允许三角上
    visible_faces = surface["faces"]
    scoped = np.all(vertex_allowed[visible_faces], axis=1)
    leaks = scoped & np.any(visible_height[visible_faces] > tolerance_mu, axis=1)
    boundary = visible_height[len(body.positions):]
    below_faces = allowed_faces & np.all(height[faces] < -band_mu, axis=1)
    return {"aboveVisibleVertices": int(len(np.unique(visible_faces[leaks]))) if np.any(leaks) else 0,
            "aboveVisibleTriangles": int(np.count_nonzero(leaks)),
            "boundaryMaxAboveMm": float(visible_height[np.unique(visible_faces[scoped])].max(initial=0) * m_per_mu * 1000),
            "boundaryToleranceMm": .5,
            "boundaryHeightRangeMm": [float(boundary.min() * m_per_mu * 1000) if len(boundary) else 0.,
                                      float(boundary.max() * m_per_mu * 1000) if len(boundary) else 0.],
            "boundaryWithinBand": bool(len(boundary) == 0 or np.abs(boundary).max() <= band_mu),
            "belowRetainedTriangles": int(np.count_nonzero(below_faces & np.all(~hidden[faces], axis=1)))}



# ---------------------------------------------------------------- 检查

def _animated_plane(center: np.ndarray, axis: np.ndarray, bone_world: np.ndarray,
                    inverse_bind: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """遮罩平面随 Neck 骨骼变换（与 D1 第 9 轮口径一致）。"""
    deform = bone_world @ inverse_bind
    posed_center = (deform @ np.append(center, 1.))[:3]
    posed_axis = deform[:3, :3] @ axis
    return posed_center, posed_axis / max(float(np.linalg.norm(posed_axis)), 1e-12)


def _nearest_signed(points: np.ndarray, vertices: np.ndarray, faces: np.ndarray, normals: np.ndarray,
                    bind_vertices: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """带符号距离 + 最近点在绑定姿势下的位置（用来排除落在开口边上的最近点）。"""
    result = signed_distance(points, vertices, faces, normals, k=16)
    bind_points = np.einsum("ni,nij->nj", result.barycentric, bind_vertices[faces[result.face_indices]])
    return result.distances_mu, bind_points


def covering_skin_faces(bind_vertices: np.ndarray, skin_faces: np.ndarray, band_points: np.ndarray,
                        radius: float) -> np.ndarray:
    """bind 时离任一重叠带点 ≤ radius 的头皮面（重叠带的"覆盖皮肤"）：精确点-三角距离，候选按面心 + 外接半径取。"""
    if not len(skin_faces) or not len(band_points): return skin_faces[:0]
    from scipy.spatial import cKDTree
    triangles = np.asarray(bind_vertices, dtype=np.float64)[skin_faces]
    centers = triangles.mean(axis=1)
    reach = np.linalg.norm(triangles - centers[:, None, :], axis=2).max(axis=1) + radius
    near = cKDTree(np.asarray(band_points, dtype=np.float64)).query_ball_point(centers, reach)
    face_ids = np.repeat(np.arange(len(skin_faces)), [len(items) for items in near])
    if not len(face_ids): return skin_faces[:0]
    point_ids = np.concatenate([np.asarray(items, dtype=np.int64) for items in near if items])
    tri = triangles[face_ids]
    closest, _ = closest_point_on_triangle(np.asarray(band_points, dtype=np.float64)[point_ids],
                                           tri[:, 0], tri[:, 1], tri[:, 2])
    within = np.linalg.norm(closest - np.asarray(band_points, dtype=np.float64)[point_ids], axis=1) <= radius
    keep = np.zeros(len(skin_faces), bool); keep[face_ids[within]] = True
    return skin_faces[keep]


def top_band_exposure(posed: np.ndarray, bind_vertices: np.ndarray, top_ids: np.ndarray, cover_faces: np.ndarray,
                      skin_faces: np.ndarray, frame: dict[str, np.ndarray], h_head: float, m_per_mu: float
                      ) -> dict[str, np.ndarray]:
    """一帧的重叠带外露（mu，带符号，正 = 露出）：`cover` 对覆盖皮肤（门禁口径），`any` 对全部头皮面（只报）。

    头后仰时后脑 / 发际线皮肤会贴近颈后（LBS 自接触，D2 穆念慈素模 run 0.156 s：最近面在 bind 时切口上 47 mm、
    ρ 57 mm），全局最近头皮面就成了它，顶带点按它的法向算到 +0.22 mm；而对自身上方的颈后皮肤仍在皮下 0.26 mm。
    法线按整片头皮算（覆盖面边缘的顶点法线不因截取而偏）；`above` 排除最近点落在切口开口边（bind 时切口以上 0.5 mm 内）。"""
    normals = _vertex_normals(posed, skin_faces)
    points = posed[top_ids]
    cover, cover_bind = _nearest_signed(points, posed, cover_faces, normals, bind_vertices)
    every, every_bind = _nearest_signed(points, posed, skin_faces, normals, bind_vertices)
    edge = h_head + .0005 / m_per_mu
    return {"cover": cover, "coverAbove": (cover_bind - frame["center"]) @ frame["axis"] >= edge,
            "any": every, "anyAbove": (every_bind - frame["center"]) @ frame["axis"] >= edge}


def _bridge_penetration(distances: np.ndarray, points: np.ndarray, center: np.ndarray,
                        axis: np.ndarray, threshold: float) -> np.ndarray:
    """标准口径（D1 已定）：只计动画切面以下的真实穿入；切面以下不得再按半径 / 最近点 / 距离过滤。"""
    below = (points - center) @ axis < 0
    return (distances < -threshold) & below


def _animated_cut_plane(center: np.ndarray, axis: np.ndarray, bone_world: np.ndarray,
                        inverse_bind: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """按 D1 第 9 轮裁定用 Neck 骨骼变换规范切面（D1b 的遮罩平面就在规范环平面上）。"""
    deform = bone_world @ inverse_bind
    posed_center = (deform @ np.append(center, 1.))[:3]
    posed_axis = deform[:3, :3] @ axis
    return posed_center, posed_axis / max(float(np.linalg.norm(posed_axis)), 1e-12)


def splice_checks(template_glb: Any, template_mesh: Mesh, head_glb: Any, head_mesh: Mesh,
                  groups: dict[str, np.ndarray], frame: dict[str, np.ndarray], mask_height: float,
                  h_head: float, mask_path: Path, m_per_mu: float, frames: int = 24) -> dict[str, Any]:
    """bind + idle/walk/run 各 frames 帧：

    - 标准 penetration（D1 已定口径）：颈片 + 颈部头皮里位于动画切面（遮罩平面按 Neck 骨骼变换）以下的全部点，
      对遮罩后可见身体的带符号距离 < −1 mm 的比例；切面以上身体已开口，只计入 aboveCutExcluded，切面以下不再过滤；
    - 底部重叠：颈片底带中低于遮罩平面 1 mm 以上的点，对可见身体的最小带符号距离（应 ≈ +BOTTOM_LIFT_MM）；
    - 顶部重叠：重叠带颈片点（切口以上 0.5 mm–TOP_BAND、bind 时最近头皮面 < 1 mm）对其覆盖皮肤（bind 时离重叠带
      ≤ TOP_COVER_MM 的头皮面）的带符号距离，最近点须在头皮切口以上 0.5 mm（头皮开口边上法向无定义）；门禁为 73 帧
      逐帧最大外露 ≤ 0.1 mm；对全部头皮面的同一量（头后仰时后脑贴近颈后的自接触会进来）只报 topExposedAnyMaxMm；
    - 垂发 penetration（全部头发点、< −1 mm 的比例）只报。"""
    template_skin, head_skin = template_glb.skin(), head_glb.skin()
    surface = _masked_surface(template_mesh, Image.open(mask_path).convert("L"))
    visible_faces = surface["faces"]
    scope_ids = np.unique(np.concatenate((groups["patch"], groups["neckSkin"])))
    bottom_ids, top_ids, hair_ids = groups["patchBottomInterior"], groups["patchTopA"], groups["hair"]
    skin_faces = groups["skinFaces"]
    threshold = .001 / m_per_mu
    names = [template_glb.json["nodes"][node].get("name", "") for node in template_skin.joints]
    neck_slot = names.index("mixamorig:Neck")
    plane_center = frame["center"] + frame["axis"] * mask_height
    result: dict[str, Any] = {"penetration": {}, "penetrationWorst": {}, "evaluatedVertices": {},
                              "aboveCutExcluded": {}, "bottomOverlapMinMm": {}, "topExposedRatio": {},
                              "topExposedMaxMm": {}, "topExposedP99Mm": {}, "topExposedWorst": {},
                              "topEvaluated": {}, "topExposedAnyMaxMm": {}, "hairPenetration": {}}
    head_bind = head_mesh.positions.astype(np.float64)
    top_theta, top_height, _ = cylinder(head_bind[top_ids], frame) if len(top_ids) else (np.zeros(0),) * 3
    cover_faces = covering_skin_faces(head_bind, skin_faces, head_bind[top_ids], TOP_COVER_MM / (1000 * m_per_mu))
    result["topCoverFaces"] = int(len(cover_faces))
    clips: list[tuple[str, Any, list[float]]] = [("bind", None, [0.])]
    for clip in ("idle", "walk", "run"):
        animation = next((item for item in template_glb.json.get("animations", [])
                          if clip in item.get("name", "").lower()), None)
        if animation is None: raise ValueError(f"模板缺 {clip} 动画")
        ends = [float(np.asarray(template_glb.accessor(s["input"])).max(initial=0))
                for s in animation.get("samplers", [])]
        clips.append((clip, animation, list(np.linspace(0, max(ends, default=0), frames, endpoint=False))))
    sampled = 0
    for clip, animation, times in clips:
        worst: dict[str, Any] = {"ratio": 0., "count": 0, "evaluated": 0, "time": None, "minimumMm": 0.}
        evaluated = 0; excluded = 0; bottom_min = math.inf; top_ratio = 0.; top_max = -math.inf; top_count = 0
        hair_ratio = 0.; top_p99 = -math.inf; top_worst: dict[str, Any] = {}; top_any = -math.inf
        for at in times:
            if animation is None:
                body = template_mesh.positions.astype(np.float64); head = head_bind
                cut_center, cut_axis = plane_center, frame["axis"]
            else:
                world = _world_matrices(template_glb, animation, float(at))
                bone_world = world[np.asarray(template_skin.joints)]
                body = lbs(template_mesh.positions, template_mesh.joints, template_mesh.weights,
                           bone_world, template_skin.inverse_bind_matrices)
                head = lbs(head_mesh.positions, head_mesh.joints, head_mesh.weights,
                           bone_world, head_skin.inverse_bind_matrices)
                cut_center, cut_axis = _animated_cut_plane(plane_center, frame["axis"], bone_world[neck_slot],
                                                           template_skin.inverse_bind_matrices[neck_slot])
            body = _masked_positions(body, surface)
            normals = _vertex_normals(body, visible_faces)
            below = (head[scope_ids] - cut_center) @ cut_axis < 0
            query = scope_ids[below]
            excluded = max(excluded, int(np.count_nonzero(~below)))
            if len(query):
                distance = _signed_distances(head[query], body, visible_faces, normals)
                count = int(np.count_nonzero(_bridge_penetration(distance, head[query], cut_center, cut_axis,
                                                                 threshold)))
                ratio = count / len(query)
                if worst["time"] is None or ratio > worst["ratio"]:
                    worst = {"ratio": ratio, "count": count, "evaluated": int(len(query)), "time": float(at),
                             "minimumMm": float(distance.min() * m_per_mu * 1000)}
            evaluated = max(evaluated, int(len(query)))
            if len(bottom_ids):
                lift = _signed_distances(head[bottom_ids], body, visible_faces, normals)
                bottom_min = min(bottom_min, float(lift.min()))
            if len(top_ids) and len(cover_faces):
                exposure = top_band_exposure(head, head_bind, top_ids, cover_faces, skin_faces, frame, h_head, m_per_mu)
                outside, above = exposure["cover"], exposure["coverAbove"]
                if np.any(exposure["anyAbove"]): top_any = max(top_any, float(exposure["any"][exposure["anyAbove"]].max()))
                if np.any(above):
                    top_ratio = max(top_ratio, float(np.count_nonzero(above & (outside > .0001 / m_per_mu))
                                                     / np.count_nonzero(above)))
                    top_p99 = max(top_p99, float(np.percentile(outside[above], 99)))
                    candidate = float(outside[above].max())        # 带符号：bind 时应为负（整带在皮下）
                    if candidate > top_max:
                        top_max = candidate; index = int(np.flatnonzero(above)[np.argmax(outside[above])])
                        top_worst = {"time": float(at), "thetaDeg": float(np.degrees(top_theta[index])),
                                     "heightMm": float(top_height[index] * m_per_mu * 1000)}
                top_count = max(top_count, int(np.count_nonzero(above)))
            if len(hair_ids):
                hair = _signed_distances(head[hair_ids], body, visible_faces, normals)
                hair_ratio = max(hair_ratio, float(np.count_nonzero(hair < -threshold) / len(hair_ids)))
            sampled += 1
        key = "bindVertices" if clip == "bind" else clip
        result["penetration"][key] = worst["count"] if clip == "bind" else worst["ratio"]
        result["penetrationWorst"][clip] = worst
        result["evaluatedVertices"][clip] = evaluated
        result["aboveCutExcluded"][clip] = excluded
        result["bottomOverlapMinMm"][clip] = bottom_min * m_per_mu * 1000
        result["topExposedRatio"][clip] = top_ratio
        result["topExposedMaxMm"][clip] = top_max * m_per_mu * 1000 if math.isfinite(top_max) else None
        result["topExposedP99Mm"][clip] = top_p99 * m_per_mu * 1000 if math.isfinite(top_p99) else None
        result["topExposedWorst"][clip] = top_worst
        result["topEvaluated"][clip] = top_count
        result["topExposedAnyMaxMm"][clip] = top_any * m_per_mu * 1000 if math.isfinite(top_any) else None
        result["hairPenetration"][clip] = hair_ratio
    result["frames"] = sampled
    result["framesPerClip"] = {clip: len(times) for clip, _, times in clips}
    bind_top = result["topExposedMaxMm"].get("bind")
    result["topUnderSkinMinMm"] = -bind_top if bind_top is not None else None   # bind 时整带最浅的皮下深度
    result["penetrationThresholdMm"] = 1.
    result["penetrationScope"] = ("neck patch + neck skin below the animated cut plane (mask plane = canonical ring "
                                  "plane, posed by the Neck bone); every point below participates")
    return result


def _top_band_pass(motion: dict[str, Any]) -> bool:
    """顶部重叠带门禁：bind 时整带最大带符号距离 ≤ −0.25 mm（在皮下），73 帧里每帧最大外露 ≤ +0.1 mm。"""
    values = motion["topExposedMaxMm"]
    if any(value is None for value in values.values()): return False
    return values["bind"] <= -.25 and max(values.values()) <= .1


def neck_holes(template_glb: Any, template_mesh: Mesh, head_glb: Any, head_mesh: Mesh, fit_path: Path,
               head_region: int, m_per_mu: float) -> dict[str, float]:
    """validate 的 holes 判据（8 向正交视图里被遮罩隐藏、前后都无可见几何的身体片元），只在颈 / 肩上量：
    模板头部区域按设计整体由源头替换，源头比模板头小的轮廓处露背景不算空洞。"""
    faces = template_mesh.indices.reshape(-1, 3)
    keep = ~np.all(template_mesh.regions[faces] == head_region, axis=1)
    body = Mesh(template_mesh.positions, faces[keep].reshape(-1), template_mesh.normals, template_mesh.uvs,
                template_mesh.joints, template_mesh.weights, template_mesh.regions,
                np.zeros(int(np.count_nonzero(keep)), np.int32), None, template_mesh.name)
    fit = json.loads(fit_path.read_text(encoding="utf-8"))
    mask = _load_hide_mask(fit, fit_path, body)
    rates, _ = _hole_rates(template_glb, head_glb, body, head_mesh, mask, m_per_mu)
    return rates


def seam_metrics(atlas: Image.Image, body_image: Image.Image, tint: np.ndarray, head_mesh: Mesh,
                 groups: dict[str, np.ndarray], bottom_corner_uvs: np.ndarray, frame: dict[str, np.ndarray],
                 floor: dict[str, Any], h_bottom: float, mm: float) -> dict[str, Any]:
    """最终 GLB + 最终（JPEG 压缩后）图集上的接缝量：

    - 底缝色差：颈片底带顶点在条带上的色 vs 同一模板点的身体贴图 × skinTint；
    - 顶缝色差：A 区内部（权重 > 0.99）逐 1°，头皮取切口上 0.25–1.25 mm、颈片取切口下 0.25–1.25 mm 的均色；
    - G1：同样逐 1°，两侧各取 0.5–2.5 mm 拟合 r(h)，夹角 = |atan(颈片 dr/dh) − atan(头皮 dr/dh)|，
      台阶 = 两侧拟合外推到切口处的半径差；
    - 中段形状：逐 1° 颈片半径剖面（底带以上到切口）的拐点数与相对两端的鼓包 / 凹陷。"""
    atlas_np = np.asarray(atlas.convert("RGB"), dtype=np.float64) / 255
    body_np = np.asarray(body_image.convert("RGB"), dtype=np.float64) / 255
    bottom = groups["patchBottom"]
    strip_colors = _bilinear(atlas_np, head_mesh.uvs[bottom].astype(np.float64))
    body_colors = _linear_to_srgb(_srgb_to_linear(_bilinear(body_np, bottom_corner_uvs)) * tint)
    labs = _srgb_to_lab(np.concatenate((strip_colors, body_colors))); n = len(bottom)
    bottom_delta = np.array([delta_e_cie2000(labs[i], labs[i + n]) for i in range(n)])
    positions = head_mesh.positions.astype(np.float64); uvs = head_mesh.uvs.astype(np.float64)
    faces = head_mesh.indices.reshape(-1, 3)
    patch_set = np.zeros(len(positions), bool); patch_set[groups["patch"]] = True
    patch_faces = faces[np.all(patch_set[faces], axis=1)]; skin_faces = groups["skinFaces"]
    h_head = floor["hHead"]
    def raster(face_set: np.ndarray, lo: float, hi: float, rows: int) -> tuple[np.ndarray, np.ndarray]:
        grid = CylinderGrid(360, lo, hi, rows)
        rho, _, uv = rasterize_cylinder(positions, face_set, frame, grid, corner_values=uvs[face_set])
        return rho, uv
    head_rho, head_uv = raster(skin_faces, h_head + .5 * mm, h_head + 2.5 * mm, 4)
    patch_rho, patch_uv = raster(patch_faces, h_head - 2.5 * mm, h_head - .5 * mm, 4)
    # 色差只取紧贴切口两侧 0.25–1.25 mm（接缝线上的跳变）；斜率拟合仍用 0.5–2.5 mm。
    head_color_rho, head_color_uv = raster(skin_faces, h_head + .25 * mm, h_head + 1.25 * mm, 2)
    patch_color_rho, patch_color_uv = raster(patch_faces, h_head - 1.25 * mm, h_head - .25 * mm, 2)
    theta = (np.arange(360) + .5) * TAU / 360
    in_a = weight_a_at(theta, floor) > .99
    interior_bins = floor["interiorA"]
    region = in_a & interior_bins[np.floor(theta / TAU * len(interior_bins)).astype(int) % len(interior_bins)]
    transition = in_a & ~region
    def mean_color(rho: np.ndarray, uv: np.ndarray) -> np.ndarray:
        valid = np.isfinite(rho); out = np.full((360, 3), np.nan)
        for index in np.flatnonzero(valid.any(axis=1)):
            out[index] = _srgb_to_linear(_bilinear(atlas_np, uv[index][valid[index]])).mean(axis=0)
        return out
    head_color, patch_color = (mean_color(head_color_rho, head_color_uv),
                               mean_color(patch_color_rho, patch_color_uv))
    colored = np.isfinite(head_color).all(axis=1) & np.isfinite(patch_color).all(axis=1)
    def color_delta(columns: np.ndarray) -> np.ndarray:
        return np.array([delta_e_cie2000(*_srgb_to_lab(np.stack((_linear_to_srgb(head_color[i]),
                                                                  _linear_to_srgb(patch_color[i])))))
                         for i in np.flatnonzero(columns & colored)])
    top_delta, transition_delta = color_delta(region), color_delta(transition)
    def fit(rho: np.ndarray, lo: float) -> tuple[np.ndarray, np.ndarray]:
        """逐角线性拟合 r(h)，返回斜率与外推到切口 h_head 处的半径。"""
        heights = lo + (np.arange(rho.shape[1]) + .5) * (2 * mm / rho.shape[1])
        slopes, at_cut = np.full(360, np.nan), np.full(360, np.nan)
        for index in range(360):
            valid = np.isfinite(rho[index])
            if np.count_nonzero(valid) >= 2:
                slope_value, intercept = np.polyfit(heights[valid], rho[index][valid], 1)
                slopes[index], at_cut[index] = slope_value, slope_value * h_head + intercept
        return slopes, at_cut
    head_slope, head_cut = fit(head_rho, h_head + .5 * mm)
    patch_slope, patch_cut = fit(patch_rho, h_head - 2.5 * mm)
    sloped = np.isfinite(head_slope) & np.isfinite(patch_slope)
    all_angles = np.degrees(np.abs(np.arctan(patch_slope) - np.arctan(head_slope)))
    g1_valid = region & sloped
    angles = all_angles[g1_valid]
    step = np.abs(head_cut - patch_cut)[g1_valid] / mm
    profile_rho, _ = raster(patch_faces, h_bottom + BOTTOM_BAND_MM * mm, h_head, 24)
    turning, bulge, waist = [], [], []
    column_bulge = np.full(360, np.nan)
    for index in np.flatnonzero(in_a):
        values = profile_rho[index][np.isfinite(profile_rho[index])]
        if len(values) < 6: continue
        # 外凸（高于两端）即"多出一圈"的鼓圈；内凹（低于两端）是下巴下方喉部的自然凹角，只报。
        column_bulge[index] = max(values.max() - max(values[0], values[-1]), 0.) / mm
        if not region[index]: continue
        diff = np.diff(values); signs = np.sign(diff[np.abs(diff) > .1 * mm])
        turning.append(int(np.count_nonzero(np.diff(signs) != 0)))
        bulge.append(column_bulge[index])
        waist.append(max(min(values[0], values[-1]) - values.min(), 0.) / mm)
    edge = transition & sloped
    transition_report = {"angles": int(np.count_nonzero(transition)),
                         "g1MaxDeg": float(all_angles[edge].max(initial=0)),
                         "g1P95Deg": float(np.percentile(all_angles[edge], 95)) if edge.any() else 0.,
                         "stepMaxMm": float((np.abs(head_cut - patch_cut)[edge] / mm).max(initial=0)),
                         "bulgeMaxMm": float(np.nan_to_num(column_bulge[transition]).max(initial=0)),
                         "colorP95": float(np.percentile(transition_delta, 95)) if len(transition_delta) else 0.,
                         "worstG1Deg": int(np.flatnonzero(edge)[np.argmax(all_angles[edge])]) if edge.any() else None}
    return {"bottom": {"mean": float(bottom_delta.mean()) if n else 0.,
                       "p95": float(np.percentile(bottom_delta, 95)) if n else 0.,
                       "max": float(bottom_delta.max(initial=0)), "samples": int(n)},
            "top": {"mean": float(top_delta.mean()) if len(top_delta) else 0.,
                    "p95": float(np.percentile(top_delta, 95)) if len(top_delta) else 0.,
                    "max": float(top_delta.max(initial=0)), "angles": int(len(top_delta))},
            "g1": {"meanDeg": float(angles.mean()) if len(angles) else 0.,
                   "p95Deg": float(np.percentile(angles, 95)) if len(angles) else 0.,
                   "maxDeg": float(angles.max(initial=0)), "angles": int(len(angles)),
                   "radialStepMeanMm": float(step.mean()) if len(step) else 0.,
                   "radialStepMaxMm": float(step.max(initial=0)),
                   "worstDeg": int(np.flatnonzero(g1_valid)[np.argmax(angles)]) if len(angles) else None,
                   "worstStepDeg": int(np.flatnonzero(g1_valid)[np.argmax(step)]) if len(step) else None},
            "shape": {"angles": len(turning), "maxTurningPoints": int(max(turning, default=0)),
                      "anglesOverOneTurn": int(np.count_nonzero(np.asarray(turning) > 1)),
                      "maxBulgeMm": float(max(bulge, default=0.)), "maxWaistMm": float(max(waist, default=0.))},
            "transition": transition_report}


def bottom_seam_metrics(template_mesh: Mesh, allowed_faces: np.ndarray, head_mesh: Mesh, groups: dict[str, np.ndarray],
                        frame: dict[str, np.ndarray], mask_height: float, mm: float) -> dict[str, Any]:
    """底缝 G1：底带里颈片与身体在可见边缘（遮罩平面）处重叠，两张面在同一窗口（平面 ±2 mm）各自拟合 r(h)，
    夹角 = 两切向之差；台阶 = 两拟合在平面处的半径差（颈片在外，应 ≈ BOTTOM_LIFT_MM）。逐 1°，全圈。
    （两侧各取一段会把模板在颈根外扩处的自身曲率算成 G1 偏差。）"""
    template_faces = template_mesh.indices.reshape(-1, 3)
    positions = head_mesh.positions.astype(np.float64); faces = head_mesh.indices.reshape(-1, 3)
    in_patch = np.zeros(len(positions), bool); in_patch[groups["patch"]] = True
    patch_faces = faces[np.all(in_patch[faces], axis=1)]
    def fit(points: np.ndarray, face_set: np.ndarray, lo: float) -> tuple[np.ndarray, np.ndarray]:
        grid = CylinderGrid(360, lo, lo + 4 * mm, 8)
        rho, _, _ = rasterize_cylinder(points, face_set, frame, grid)
        heights = grid.h_centers(); slopes, at = np.full(360, np.nan), np.full(360, np.nan)
        for index in range(360):
            valid = np.isfinite(rho[index])
            if np.count_nonzero(valid) >= 2:
                value, intercept = np.polyfit(heights[valid], rho[index][valid], 1)
                slopes[index], at[index] = value, value * mask_height + intercept
        return slopes, at
    body_slope, body_at = fit(template_mesh.positions.astype(np.float64), template_faces[allowed_faces],
                              mask_height - 2 * mm)
    patch_slope, patch_at = fit(positions, patch_faces, mask_height - 2 * mm)
    valid = np.isfinite(body_slope) & np.isfinite(patch_slope)
    angles = np.degrees(np.abs(np.arctan(patch_slope[valid]) - np.arctan(body_slope[valid])))
    step = (patch_at - body_at)[valid] / mm
    return {"meanDeg": float(angles.mean()) if len(angles) else 0., "p95Deg": float(np.percentile(angles, 95))
            if len(angles) else 0., "maxDeg": float(angles.max(initial=0)), "angles": int(len(angles)),
            "stepMeanMm": float(step.mean()) if len(step) else 0., "stepMinMm": float(step.min()) if len(step) else 0.,
            "stepMaxMm": float(step.max()) if len(step) else 0.}


# ---------------------------------------------------------------- 报告

def _head_report(report: dict[str, Any], diagnostics: dict[str, Any]) -> dict[str, Any]:
    """validate 的通用检查保留；penetration 换成遮罩后可见身体口径，追加拼接专项检查。"""
    report["checks"] = [item for item in report["checks"]
                        if not item["name"].startswith(("penetration.", "holes."))]
    checks = diagnostics["checks"]; motion = checks["motion"]; penetration = motion["penetration"]
    mask = diagnostics["hideMask"]; patch = diagnostics["patch"]; color = checks["color"]
    report["checks"] += [
        {"name": "penetration.bindVertices", "pass": penetration["bindVertices"] == 0,
         "value": penetration["bindVertices"], "threshold": 0, "frames": 1,
         "evaluated": motion["evaluatedVertices"]["bind"], "aboveCutExcluded": motion["aboveCutExcluded"]["bind"],
         "scope": motion["penetrationScope"]},
        *[{"name": f"penetration.{clip}", "pass": penetration[clip] <= .02, "value": penetration[clip],
           "threshold": "<= 0.02 (worst frame)", "frames": motion["framesPerClip"][clip],
           "worst": motion["penetrationWorst"][clip], "aboveCutExcluded": motion["aboveCutExcluded"][clip],
           "scope": motion["penetrationScope"]}
          for clip in ("idle", "walk", "run")],
        {"name": "head.patchBottomOverlap", "pass": min(motion["bottomOverlapMinMm"].values()) >= -.05,
         "value": motion["bottomOverlapMinMm"], "threshold": f">= -0.05 mm (lift {BOTTOM_LIFT_MM:g} mm)", "frames": motion["frames"],
         "framesPerClip": motion["framesPerClip"]},
        {"name": "head.patchTopUnderSkin", "pass": _top_band_pass(motion),
         "value": {"bindUnderSkinMinMm": motion["topUnderSkinMinMm"], "ratio": motion["topExposedRatio"],
                   "p99Mm": motion["topExposedP99Mm"], "maxMm": motion["topExposedMaxMm"],
                   "worst": motion["topExposedWorst"], "evaluated": motion["topEvaluated"],
                   "coverFaces": motion["topCoverFaces"], "anySkinMaxMmReportOnly": motion["topExposedAnyMaxMm"]},
         "threshold": "overlap band (cut+0.5 .. +4 mm, nearest skin face < 1 mm at bind) vs its covering skin "
                      f"(skin faces within {TOP_COVER_MM:g} mm of the band at bind), signed: "
                      "bind max <= -0.25 mm (whole band under skin); every one of 73 frames max <= +0.1 mm",
         "frames": motion["frames"], "framesPerClip": motion["framesPerClip"]},
        {"name": "head.hideMaskLeak", "pass": mask["leakTriangles"] == 0, "value": mask["leakTriangles"],
         "threshold": 0, "scope": "template triangles outside the copied patch must never be hidden (any vertex > 0.5)"},
        {"name": "head.hideMaskAbove",
         "pass": mask["aboveVisibleVertices"] == 0 and mask["aboveVisibleTriangles"] == 0
                 and mask["belowRetainedTriangles"] > 0 and mask["boundaryWithinBand"],
         "value": {key: mask[key] for key in ("aboveVisibleVertices", "aboveVisibleTriangles",
                                              "belowRetainedTriangles", "boundaryWithinBand",
                                              "boundaryHeightRangeMm")}, "threshold": 0},
        {"name": "head.patchOrientation",
         "pass": patch["orientation"]["consistentEdgeRatio"] == 1 and patch["orientation"]["outwardFaceRatio"] == 1
                 and patch["orientation"]["nonManifoldEdges"] == 0,
         "value": patch["orientation"], "threshold": "edges 100% consistent, every face outward (100%), non-manifold 0"},
        {"name": "head.patchBiharmonic", "pass": patch["solve"]["residualMaxMu"] < 1e-6,
         "value": patch["solve"], "threshold": "residual < 1e-6 mu"},
        {"name": "head.seamColorBottom", "pass": color["bottom"]["p95"] < 2.,
         "value": color["bottom"], "threshold": "ΔE2000 p95 < 2"},
        {"name": "head.seamColorTop", "pass": color["top"]["p95"] < 2.,
         "value": color["top"], "threshold": "ΔE2000 p95 < 2 (region A, 1° bins, ±0.25–1.25 mm of the cut)"},
        {"name": "head.seamG1Top", "pass": checks["g1"]["maxDeg"] < 5. and checks["g1"]["radialStepMaxMm"] < 1.,
         "value": checks["g1"],
         "threshold": "V4: tangent angle < 5° at every region-A degree (slopes fitted 0.5–2.5 mm each side of the cut), "
                      "radial step < 1 mm"},
        {"name": "head.seamG1Bottom",
         "pass": checks["g1Bottom"]["maxDeg"] < 5. and 0 <= checks["g1Bottom"]["stepMinMm"]
                 and checks["g1Bottom"]["stepMaxMm"] < 1.,
         "value": checks["g1Bottom"],
         "threshold": "V4: tangent angle < 5° at every degree (patch vs body over the same ±2 mm window at the visible "
                      "body edge); patch outside body (step 0..1 mm)"},
        {"name": "head.patchShape",
         "pass": checks["shape"]["maxBulgeMm"] < 1. and checks["shape"]["anglesOverOneTurn"] <= .02 * max(
             checks["shape"]["angles"], 1),
         "value": checks["shape"],
         "threshold": "per-angle radius profile: convex bulge above both ends < 1 mm (no extra ring); "
                      "> 1 turning point (0.1 mm noise) on <= 2% of angles; throat waist report-only"}]
    report.update({key: diagnostics[key] for key in
                   ("gateLevel", "stats", "measurements", "cut", "hideMask", "patch", "head", "params", "color")})
    report["checks_detail"] = checks
    report["penetrationHairReportOnly"] = motion["hairPenetration"]
    report["holesNeckReportOnly"] = {
        "value": checks["neckHoles"], "tolerance": HOLE_TOLERANCE,
        "reason": "validate 的 holes 判据（被遮罩隐藏、视线上无其他几何的身体片元）为衣物设计；头资产按设计用更细的"
                  "源颈 / 源头替换模板颈头，侧视轮廓收窄处（喉部）也被计入，不代表表面破洞。真破洞由 orientation、"
                  "patchBottomOverlap、patchTopUnderSkin、hideMaskLeak 与运行时截图把关。"}
    report["level"] = "draft" if diagnostics["gateLevel"] == "pass" and all(
        item["pass"] for item in report["checks"]) else "fail"
    report["gateLevel"] = "pass" if report["level"] == "draft" else "fail"   # 与 level 一致（含 validate 通用检查）
    return report


REPO_ROOT = Path(__file__).resolve().parents[3]


def _input_record(path: Path) -> dict[str, str]:
    """输入文件记录：仓库内的文件一律写仓库相对路径（与调用时用绝对还是相对路径无关），仓库外的保持原样。"""
    resolved = Path(path).resolve()
    try: name = resolved.relative_to(REPO_ROOT).as_posix()
    except ValueError: name = Path(path).as_posix()
    return {"file": name, "sha256": sha256(resolved.read_bytes()).hexdigest()}


def refresh_preview_and_manifest(template_dir: Path, npc_id: str, out_dir: Path) -> None:
    """只刷新确定性的质检图，保留完整实跑诊断。"""
    names = output_names(out_dir, template_dir.name)
    template_glb = load_glb(template_dir / "body.glb"); template_mesh, _, _ = _world_mesh(template_glb)
    head_glb = load_glb(out_dir / names["glb"]); head_mesh, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text(encoding="utf-8"))
    fit = json.loads((out_dir / names["fit"]).read_text(encoding="utf-8"))
    render_preview(out_dir / names["preview"], template_glb, template_mesh, head_glb, head_mesh,
                   np.asarray(skeleton["neckRing"]["centerMu"]), out_dir / names["mask"],
                   body_tint=fit["skinTint"], check_path=out_dir / names["check"])


# ---------------------------------------------------------------- 主流程

def process_head(source_path: Path, template_dir: Path, npc_id: str, out_dir: Path,
                 fast: bool = False) -> dict[str, Any]:
    started = time.monotonic(); out_dir.mkdir(parents=True, exist_ok=True)
    names = output_names(out_dir, template_dir.name)
    source_glb = load_glb(source_path); source_mesh, source_positions, source_normals = _world_mesh(source_glb)
    template_glb = load_glb(template_dir / "body.glb"); template_mesh, _, _ = _world_mesh(template_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text(encoding="utf-8"))
    m_per_mu = float(skeleton["mPerMu"]); mm = 1 / (1000 * m_per_mu)
    source_names = [source_glb.json["nodes"][node].get("name", "") for node in source_glb.skin().joints]
    template_names = [template_glb.json["nodes"][node].get("name", "") for node in template_glb.skin().joints]
    source_slots, template_slots = ({name: index for index, name in enumerate(names)}
                                    for names in (source_names, template_names))
    joint_count = len(template_names)
    ring_center = np.asarray(skeleton["neckRing"]["centerMu"], dtype=np.float64)
    cut = cut_plane_from_bone_ratio(source_glb, source_slots, template_glb, template_slots, ring_center)
    frame = neck_frame(cut, ring_center)
    classified = classify_vertices(source_glb, source_mesh, source_positions, source_slots)
    measured = measure_head(source_positions, classified, cut["source"])
    target = target_head_measures(template_dir, skeleton); raw_scale, scale, scale_parts = head_scale(measured, target)
    transformed, _, _ = transform_head(source_positions, source_normals, cut, ring_center, scale)
    # 1) 源头：模板坐标里选面（颈部皮肤 + 头发 + 发饰，去衣领 / 衣身）。
    selected_faces, used = select_head_faces_v2(source_mesh, transformed, classified, frame, mm)
    used_ids = np.flatnonzero(used)
    head_positions = transformed[used_ids]; head_uvs = source_mesh.uvs[used_ids].astype(np.float64)
    head_skin_flags = classified["skin"][used_ids]; head_hair_flags = classified["hair"][used_ids]
    trusted_flags = classified["trustedSkin"][used_ids]
    face_skin = head_skin_flags[selected_faces].sum(axis=1) >= 2
    face_trusted = trusted_flags[selected_faces].sum(axis=1) >= 2
    envelopes = head_envelopes(head_positions, selected_faces, face_skin, face_trusted, frame, mm)
    floor = head_floor(envelopes, mm)
    ring_theta = (np.arange(ANGLE_BINS) + .5) * (TAU / ANGLE_BINS)
    template_faces = template_mesh.indices.reshape(-1, 3)
    # 1a) 颈子截面对中（D2c）：切口处头皮截面中心对到模板颈子截面中心，再按平移后的头重算包络与切面。
    probe = floor["hHead"] + NECK_CENTER_PROBE_MM * mm
    head_positions, center_shift, neck_center = center_neck_section(
        head_positions, frame, floor["hHead"],
        sample_grid(envelopes["skin"], envelopes["grid"], ring_theta, np.full(ANGLE_BINS, probe)),
        _ring_radius(template_mesh.positions, template_faces, frame, probe, ring_theta), ring_theta, mm,
        weight_a_at(ring_theta, floor))
    transformed = transformed + center_shift                          # 衣领检测等仍用整源件坐标：随头一起平移
    envelopes = head_envelopes(head_positions, selected_faces, face_skin, face_trusted, frame, mm)
    floor = head_floor(envelopes, mm)
    neck_center["hHeadAfterMm"] = float(floor["hHead"] / mm)
    # 1b) 颈部粗细适配：两端都向上收而落差不足的角度，按 Hermite 单调条件收细切口处的头侧颈子（只收不放），
    #     再按适配后的头重算包络与切面。
    slope_step = 2 * mm
    head_ring = sample_grid(envelopes["skin"], envelopes["grid"], ring_theta, np.full(ANGLE_BINS, floor["hHead"] + .5 * mm))
    head_ring_up = sample_grid(envelopes["skin"], envelopes["grid"], ring_theta,
                               np.full(ANGLE_BINS, floor["hHead"] + .5 * mm + slope_step))
    h_band_top = PATCH_BOTTOM_MM * mm + BOTTOM_BAND_MM * mm
    template_ring = _ring_radius(template_mesh.positions, template_faces, frame, h_band_top, ring_theta)
    template_ring_up = _ring_radius(template_mesh.positions, template_faces, frame, h_band_top + slope_step, ring_theta)
    hh_before = float(floor["hHead"])
    head_positions, neck_fit = fit_neck_to_template(
        head_positions, frame, floor["hHead"], h_band_top, ring_theta, head_ring, (head_ring_up - head_ring) / slope_step,
        template_ring, (template_ring_up - template_ring) / slope_step, weight_a_at(ring_theta, floor), mm)
    if neck_fit["movedVertices"]:
        envelopes = head_envelopes(head_positions, selected_faces, face_skin, face_trusted, frame, mm)
        floor = head_floor(envelopes, mm)
    neck_fit.update({"hHeadBeforeMm": hh_before / mm, "hHeadAfterMm": float(floor["hHead"]) / mm})
    h_head = floor["hHead"]; h_bottom = PATCH_BOTTOM_MM * mm; mask_height = h_bottom + MASK_OFFSET_MM * mm
    head = clip_head(head_positions, head_uvs, selected_faces, head_skin_flags, head_hair_flags, frame, h_head,
                     classified["headWeight"][used_ids], classified["colors"][used_ids])
    source_image = _texture(source_glb)
    head, remnants = drop_collar_remnants(                            # 1c) 裁剩的衣领薄片 / 切口顶带的红领面
        head, frame, h_head, mm, None if source_image is None else np.asarray(source_image, dtype=np.float64) / 255)
    seam_tone: dict[str, Any] = {}
    if source_image is not None:                                      # 1d) 切口带调平（领口烘进颈皮的亮带，只调贴着衣领的角度）
        collar = collar_adjacent(transformed, source_mesh.indices, classified["skin"], classified["hair"], frame,
                                 h_head, mm)
        toned, seam_tone = level_seam_tone(np.asarray(source_image, dtype=np.uint8), head, frame, h_head,
                                           classified["skinReferenceSrgb"], mm, collar)
        if seam_tone["texelsChanged"] or seam_tone["paddingTexels"]: source_image = Image.fromarray(toned, "RGB")
    # 2) 模板颈片：h_b..h_top(θ)；A 区到 h_head 以上 TOP_BAND，B 区到 BACK_TOP。
    def top_of(theta: np.ndarray) -> np.ndarray:
        weight = weight_a_at(theta, floor)
        return weight * (h_head + TOP_BAND_MM * mm) + (1 - weight) * (BACK_TOP_MM * mm)
    patch = template_patch(template_mesh, skeleton, frame, h_bottom, top_of, joint_count, mm,
                           refine=(h_head - (G1_SKIRT_MM + 1) * mm, h_head + .25 * mm),
                           dense_below=h_head + DENSE_LIMIT_MM * mm, exact_below=mask_height)
    source_patch_positions = patch["positions"].copy()
    profile = head_cut_profile(head, frame, h_head, mm)
    constrained, targets, bands = patch_targets(patch["positions"], patch["faces"], frame, envelopes, floor,
                                                h_bottom, mm, patch["normals"], profile)
    head_skin_faces = head["faces"][head["skin"][head["faces"]].sum(axis=1) >= 2]
    _, target_height, _ = cylinder(targets, frame)
    targets, inset_stats = inset_under_skin(
        targets, bands["top"] & (target_height <= h_head + (TOP_BAND_MM + 1) * mm),
        head["positions"], head_skin_faces, frame, h_head, mm)
    # 侧向开口（与未复制的混合区三角相邻的边界）在 h_head 以下也钉在原位 + 外移，防止与身体开缝。
    loops = boundary_loops(patch["faces"])
    loop_ids = np.unique(np.concatenate(loops)) if loops else np.empty(0, dtype=np.int64)
    _, loop_height, _ = cylinder(patch["positions"][loop_ids], frame)
    side = loop_ids[(loop_height > h_bottom + BOTTOM_BAND_MM * mm) & (loop_height < h_head)]
    if len(side):
        side_normals = patch["normals"][side]
        targets[side] = patch["positions"][side] + side_normals * (BOTTOM_LIFT_MM * mm)
        constrained[side] = True
    displacement, solve = biharmonic_displacement(patch["positions"], patch["faces"], constrained, targets)
    deformed = patch["positions"] + displacement
    # 蒙皮：重叠带两层（颈片顶带、头皮下缘）共用同一权重场 W(θ,h) = (1−s)·W_ring(θ) + s·Head，
    # W_ring 是切口 ±1 mm 内颈片模板权重的逐角均值；颈片在 G1 裙带里由自身模板权重渐变到该场。
    # 两层同权重 → 同变换，0.3 mm 内缩在动作中保持（D1b 实测：各用各的权重时动作帧外露达 4–18 mm）。
    theta_p, height_p, _ = cylinder(source_patch_positions, frame)
    head_slot = template_slots["mixamorig:Head"]
    ring_weights = patch_ring_weights(source_patch_positions, patch["faces"], patch["weights"], frame, h_head)
    # 截成前 3 根骨骼再混 Head：权重场全程 ≤ 4 根，头皮与颈片都不会被 glTF 的 4 影响上限截出差异。
    order = np.argsort(-ring_weights, axis=1)[:, :3]
    kept = np.zeros_like(ring_weights); np.put_along_axis(kept, order, np.take_along_axis(ring_weights, order, 1), 1)
    ring_weights = kept / np.maximum(kept.sum(axis=1, keepdims=True), 1e-12)
    ring_index = np.floor(theta_p / TAU * len(ring_weights)).astype(int) % len(ring_weights)
    field = blend_head_weights(ring_weights[ring_index], height_p, h_head, head_slot, mm, np.ones(len(height_p)))
    # 切口以上凡源头在该处有皮肤（含 A/B 过渡区的发际线皮肤）的颈片点都完全进入同一权重场；B 区无皮肤处保持模板权重。
    skin_here = np.isfinite(sample_grid(envelopes["skin"], envelopes["grid"], theta_p, height_p)) & (height_p >= h_head)
    region = np.maximum(bands["weightA"], skin_here.astype(np.float64))
    into_field = region * _smoothstep((height_p - (h_head - G1_SKIRT_MM * mm)) / (G1_SKIRT_MM * mm))
    into_field = np.where((height_p >= h_head) & skin_here, 1., into_field)   # 重叠带完全取场值（与头皮同一函数）
    patch_weights = patch["weights"] * (1 - into_field)[:, None] + field * into_field[:, None]
    band_points = deformed[(height_p >= h_head) & (height_p <= h_head + (TOP_BAND_MM + 1) * mm)
                           & (skin_here | (bands["weightA"] > 0))]
    head_dense = head_vertex_weights(head, frame, floor, envelopes, ring_weights, joint_count, template_slots, mm,
                                     band_points)
    # 重叠带里的颈片点再改取正上方头皮三角按重心插值的最终（截 4 根后）权重：头皮三角内部本就是逐角权重的线性
    # 插值，而 W(θ,h) 沿高度是 smoothstep，在 8 mm 的大三角里两者差 0.02–0.05（D1b 实测 run 外露 0.5 mm）。
    # 两层取同一个线性插值后，只剩 LBS 的二阶项（Δw·Δx）。
    # 范围按几何口径（切口以上、离头皮三角 < 1.5 mm），与门禁的重叠带取点一致：粗网格包络在发际线过渡区边缘会把
    # 有头皮处判成"无皮肤"，那里的颈片点只拿到 W(θ,h)，与头皮三角插值差 0.02（D1c tall / small run 外露 0.105–0.109 mm）。
    overlap = height_p >= h_head
    if np.any(overlap):
        head_final = dense_weights(*top4_weights(head_dense), joint_count)
        skin_faces_w = head["faces"][head["skin"][head["faces"]].sum(axis=1) >= 2]
        nearest = nearest_triangle(deformed[overlap], head["positions"], skin_faces_w, k=16)
        close = nearest.distances_mu < 1.5 * mm
        copied = np.einsum("ni,nij->nj", nearest.barycentric[close], head_final[skin_faces_w[nearest.face_indices[close]]])
        patch_weights[np.flatnonzero(overlap)[close]] = copied / np.maximum(copied.sum(axis=1, keepdims=True), 1e-12)
    # 3) 贴图：头图集 + 颈片条带。
    source_colors, template_colors = vertex_colors(source_glb, source_mesh), vertex_colors(template_glb, template_mesh)
    matching = skin_match(source_colors, classified, source_positions, cut, template_colors, template_mesh, skeleton)
    tint = np.asarray(matching["skinTint"], dtype=np.float64)
    body_image = _texture(template_glb)
    if source_image is None or body_image is None: raise ValueError("源头与模板都须带 baseColor 贴图")
    hair_samples = classified["colors"][classified["hair"] & (classified["headWeight"] > .3)]
    hair_linear = np.median(_srgb_to_linear(hair_samples), axis=0) if len(hair_samples) else np.array([.03, .02, .015])
    max_top = float(BACK_TOP_MM * mm + 1 * mm)
    # 下沿是整块模板三角，最低点在 h_bottom 以下一个三角内：条带下界跟到颈片实际最低点。
    patch_low = float(cylinder(source_patch_positions, frame)[1].min(initial=h_bottom))
    layout = StripLayout(min(h_bottom, patch_low) - 1 * mm, h_head + STRIP_SPLIT_MM * mm, max_top, STRIP_LOWER_ROWS,
                         STRIP_ROWS - STRIP_GUARD - STRIP_LOWER_ROWS)
    grid = layout.fine_grid()
    patch_for_bake = {"sourcePositions": source_patch_positions, "faces": patch["faces"],
                      "cornerUvs": patch["cornerUvs"]}
    canvas = head_canvas(source_image)
    head_uv_final = head["uvs"].copy(); head_uv_final[:, 1] *= (ATLAS_SIZE - STRIP_ROWS) / ATLAS_SIZE
    strip, strip_info = bake_strip(patch_for_bake, frame, grid, body_image, tint, {**head, "uvs": head_uv_final},
                                   canvas, floor, hair_linear, mm)
    # 身体染色对准切口颈色（作者 2026-10-10 方案 2）：A 区平均增益乘回 skinTint 再重烘，身体整体与颈子同色。
    # D2c（作者"身体颜色和脖子下面接缝附近颜色对齐"）：增益 = 切口头色 ÷ 下接缝附近（遮罩平面上下 TINT_SEAM_BAND_MM）的
    # 染色后身体色；D2 原口径是同高度、被遮罩隐藏的模板上段颈子色，模板脖子自身有上下明暗时下接缝仍差一截。
    face_tint, first_gain = tint, np.asarray(strip_info["gainSeamMean"], dtype=np.float64)
    tint = np.clip(face_tint * first_gain, *BODY_TINT_RANGE)
    if not np.allclose(tint, face_tint, atol=1e-6):
        strip, strip_info = bake_strip(patch_for_bake, frame, grid, body_image, tint, {**head, "uvs": head_uv_final},
                                       canvas, floor, hair_linear, mm)
    face_matching = matching
    matching = skin_match(source_colors, classified, source_positions, cut, template_colors, template_mesh, skeleton,
                          tint=tint)
    def _neck_delta_e(body_key: str) -> float | None:
        if strip_info["headCutSrgb"] is None or strip_info[body_key] is None: return None
        lab = _srgb_to_lab(np.stack((strip_info["headCutSrgb"], strip_info[body_key])))
        return float(delta_e_cie2000(lab[0], lab[1]))
    seam_delta_e, same_height_delta_e = _neck_delta_e("bodySeamSrgb"), _neck_delta_e("bodyCutSrgb")
    matching.update({"deltaEFaceMean": matching["deltaE"],
                     "deltaE": seam_delta_e if seam_delta_e is not None else matching["deltaE"],
                     "deltaESameHeight": same_height_delta_e,
                     "neckMatch": {"reference": "headCut/bodySeam", "faceTint": [float(value) for value in face_tint],
                                   "faceDeltaE": float(face_matching["deltaE"]),
                                   "gainBefore": [float(value) for value in first_gain],
                                   "clipped": bool(np.any((tint <= BODY_TINT_RANGE[0]) | (tint >= BODY_TINT_RANGE[1]))),
                                   "residualGain": [float(value) for value in strip_info["gainSeamMean"]],
                                   "residualGainSameHeight": [float(value) for value in strip_info["gainMean"]],
                                   "seamAngles": int(strip_info["seamAngles"]), "seamBandMm": TINT_SEAM_BAND_MM}})
    atlas = compose_atlas(canvas, resample_strip(strip, grid, layout))
    patch_uvs, patch_faces_uv, patch_origin = patch_strip_uvs(source_patch_positions, patch["faces"], frame, layout)
    # 4) 合并：头（_REGION=head）+ 颈片（_REGION=neck）。
    head_count = len(head["positions"])
    positions = np.concatenate((head["positions"], deformed[patch_origin]))
    uvs = np.concatenate((head_uv_final, patch_uvs))
    dense = np.concatenate((head_dense, patch_weights[patch_origin]))
    joints, weights = top4_weights(dense)
    faces = np.concatenate((head["faces"], patch_faces_uv + head_count))
    region_ids = skeleton["regions"]["ids"]
    regions = np.concatenate((np.full(head_count, region_ids["head"], np.uint8),
                              np.full(len(patch_origin), region_ids["neck"], np.uint8)))
    mesh = Mesh(positions.astype(np.float32), faces.astype(np.uint32).reshape(-1),
                _vertex_normals(positions, faces).astype(np.float32), uvs.astype(np.float32),
                joints, weights, regions, np.zeros(len(faces), np.int32), None, "head")
    # 只编一次 JPEG，且用 4:4:4 色度：4:2:0（或 transform 的二次转码）会把发际线附近头皮色度带偏 ΔE 2–4，
    # 与条带在切口处对不上。write_skinned_glb 默认即 unlit 材质。
    payload = io.BytesIO(); atlas.save(payload, format="JPEG", quality=ATLAS_JPEG_QUALITY, subsampling=0, optimize=True)
    final_path = out_dir / names["glb"]
    write_skinned_glb(final_path, mesh, template_glb.skin(), {"textureImage": 0}, [(payload.getvalue(), "image/jpeg")])
    final_path.chmod(0o644)   # 写入器经临时文件落盘（0600），与其他素材保持 0644
    # 5) 身体遮罩：遮罩平面（规范环平面）以上、与颈片同一批模板三角。
    template_faces = template_mesh.indices.reshape(-1, 3)
    allowed_vertices = patch["allowedTemplateVertices"]
    allowed_faces = np.all(allowed_vertices[template_faces], axis=1)
    mask_center = frame["center"] + frame["axis"] * mask_height
    hide_mask = bake_hide_mask(out_dir / names["mask"], template_mesh, allowed_faces, frame["axis"], mask_center)
    mask_image = Image.open(out_dir / names["mask"]).convert("L")
    hide_mask.update(hide_mask_integrity(template_mesh, mask_image, allowed_faces, frame["axis"], mask_center,
                                         m_per_mu, MASK_OFFSET_MM * mm))
    # 外渗：颈片范围外（未复制）的身体三角，任一顶点按运行时 > 0.5 判为隐藏即是真破洞（gutter 渗到 UV 邻岛等）。
    hidden_vertex = _sample_mask(mask_image, template_mesh.uvs) > 127.5
    leak = ~allowed_faces & np.any(hidden_vertex[template_faces], axis=1)
    hide_mask["leakTriangles"] = int(np.count_nonzero(leak))
    # 6) 分组（最终 GLB 顶点序号）与诊断。
    final_glb = load_glb(final_path); final_mesh, _, _ = _world_mesh(final_glb)
    patch_ids = np.arange(head_count, len(positions))
    origin_bottom = bands["bottom"][patch_origin]
    theta_h, height_h, rho_h = cylinder(head["positions"], frame)
    shell_ref = sample_grid(envelopes["skin"], envelopes["grid"], theta_h, np.full_like(height_h, h_head + .5 * mm))
    in_shell = (np.isfinite(shell_ref) & (rho_h >= .8 * np.nan_to_num(shell_ref, nan=np.inf))
                & (rho_h <= NECK_SHELL_FACTOR * np.nan_to_num(shell_ref, nan=0.)))
    # 颈部皮肤 = 切口到切口以上 WEIGHT_BLEND_MM、颈壳内的皮肤点（切口以下的"皮肤"点只可能挂在垂发面上，不算）。
    neck_skin = np.flatnonzero(head["skin"] & in_shell & (height_h >= h_head - .5 * mm)
                               & (height_h <= h_head + WEIGHT_BLEND_MM * mm))
    neck_skin_faces = head["faces"][np.all(np.isin(head["faces"], neck_skin), axis=1)]
    head_in_a = weight_a_at(theta_h, floor) > .5
    head_rim = np.flatnonzero(head["skin"] & in_shell & head_in_a & (rho_h <= 1.15 * np.nan_to_num(shell_ref, nan=0.))
                              & (height_h <= h_head + 3 * mm))
    _, height_patch_src, _ = cylinder(source_patch_positions[patch_origin], frame)
    patch_rim = patch_ids[(np.abs(height_patch_src - h_head) <= 1.5 * mm) & (bands["weightA"][patch_origin] > .5)]
    origin_height = cylinder(source_patch_positions[patch_origin], frame)[1]
    skin_face_mask = head["skin"][head["faces"]].sum(axis=1) >= 2
    overlap_band = (origin_height >= h_head + .5 * mm) & (origin_height <= h_head + TOP_BAND_MM * mm)
    if overlap_band.any() and skin_face_mask.any():
        nearest_skin = nearest_triangle(positions[patch_ids[overlap_band]], positions, head["faces"][skin_face_mask], k=16)
        overlap_band[np.flatnonzero(overlap_band)[nearest_skin.distances_mu >= 1 * mm]] = False
    groups = {"patch": patch_ids, "patchBottom": patch_ids[origin_bottom],
              "patchBottomInterior": patch_ids[origin_bottom & (origin_height < mask_height - 1 * mm)],
              # 重叠带 = 切口以上 0.5 mm 到 TOP_BAND_MM、bind 时最近头皮面在 1 mm 内的颈片点（几何口径，与测试同一定义；
              # 含 A/B 过渡区的发际线皮肤下方；B 区长进发帘的模板颈片不在头皮旁，自然不计）。
              "patchTopA": patch_ids[overlap_band],
              "neckSkin": neck_skin, "neckSkinFaces": neck_skin_faces, "skinFaces": head["faces"][skin_face_mask],
              "hair": np.flatnonzero(head["hair"]), "headRim": head_rim, "patchRim": patch_rim}
    orientation = orientation_report(deformed, patch["faces"], frame)
    final_atlas = Image.open(io.BytesIO(_image_bytes(final_glb.path, final_glb.json, final_glb.bin,
                                                     final_glb.json["textures"][0]["source"]))).convert("RGB")
    bottom_corner = np.zeros((len(groups["patchBottom"]), 2))
    # 底带顶点对应的模板 UV：取含该点的任一颈片三角的逐角 UV。
    corner_lookup: dict[int, np.ndarray] = {}
    for face_index, face in enumerate(patch["faces"]):
        for corner, vertex in enumerate(face):
            corner_lookup.setdefault(int(vertex), patch["cornerUvs"][face_index, corner])
    for row, vertex in enumerate(patch_origin[origin_bottom]):
        bottom_corner[row] = corner_lookup[int(vertex)]
    seams = seam_metrics(final_atlas, body_image, tint, final_mesh, groups, bottom_corner, frame, floor,
                         h_bottom, mm)
    color = {"bottom": seams["bottom"], "top": seams["top"]}; g1 = seams["g1"]; shape = seams["shape"]
    g1_bottom = bottom_seam_metrics(template_mesh, allowed_faces, final_mesh, groups, frame, mask_height, mm)
    motion = None if fast else splice_checks(template_glb, template_mesh, final_glb, final_mesh, groups, frame,
                                             mask_height, h_head, out_dir / names["mask"], m_per_mu)
    source_radius, _ = skin_section_radius(source_positions, classified["colors"], classified["skin"], cut)
    fit = {"schema": "tianshu-dressup-fit.v1", "id": npc_id, "kind": "head", "npc": npc_id,
           "template": template_dir.name, "mPerMu": m_per_mu,
           "source": _input_record(source_path), "body": _input_record(template_dir / "body.glb"),
           # 兼容 D1 接口：源颈切面半径、头缩放；residualMu = 头部与模板身体衔接处的约束残差
           # （D1 为颈桥底环对模板颈环的最大距离；D1b 衔接件是模板颈片，取其双调和带约束残差）。
           "ring": {"sourceRadiusMu": source_radius, "scale": scale, "residualMu": solve["residualMaxMu"]},
           "hideRegions": [], "hideMask": {"file": names["mask"], "size": HIDE_MASK_SIZE},
           "neverHide": [], "skinTint": matching["skinTint"],
           "weights": {"jointsAllowed": template_names},
           "deltaEBefore": matching["deltaEBefore"], "deltaE": matching["deltaE"],
           "deltaEFaceMean": matching["deltaEFaceMean"], "deltaESameHeight": matching.get("deltaESameHeight")}
    elapsed_ms = int((time.monotonic() - started) * 1000)
    overall_ratio_before = math.sqrt(measured["earWidthMu"] * measured["faceHeightMu"] /
                                     (target["earWidthMu"] * target["faceHeightMu"]))
    overall_deviation = abs(overall_ratio_before * scale - 1); clamped = abs(raw_scale - scale) > 1e-9
    to_mm = lambda value: float(value) * m_per_mu * 1000
    params = {"patchBottomMm": PATCH_BOTTOM_MM, "bottomBandMm": BOTTOM_BAND_MM, "maskOffsetMm": MASK_OFFSET_MM,
              "bottomLiftMm": BOTTOM_LIFT_MM,
              "topBandMm": TOP_BAND_MM, "topInsetMm": TOP_INSET_MM, "topCoverMm": TOP_COVER_MM,
              "g1SkirtMm": G1_SKIRT_MM, "headFloorMarginMm": HEAD_FLOOR_MARGIN_MM,
              "floorCoverage": FLOOR_COVERAGE, "floorRunMm": FLOOR_RUN_MM, "backTopMm": BACK_TOP_MM, "envelopeInsetMm": ENVELOPE_INSET_MM,
              "hairlineMm": HAIRLINE_MM, "hairlineBlendMm": HAIRLINE_BLEND_MM, "colorBlendMm": COLOR_BLEND_MM,
              "weightBlendMm": WEIGHT_BLEND_MM, "patchSubdivisions": PATCH_SUBDIVISIONS, "patchMergeMm": PATCH_MERGE_MM, "sliverMm": SLIVER_MM, "stripRows": STRIP_ROWS, "stripLowerRows": STRIP_LOWER_ROWS,
              "stripSplitMm": STRIP_SPLIT_MM, "atlasSize": ATLAS_SIZE, "atlasJpeg": "q90 4:4:4",
              "regionSmoothDeg": REGION_SMOOTH_DEG, "neckFitRampMm": NECK_FIT_RAMP_MM, "neckFitMaxMm": NECK_FIT_MAX_MM,
              "neckFitShell": NECK_FIT_SHELL, "neckFitBelowMm": NECK_FIT_BELOW_MM, "neckFitSmoothDeg": NECK_FIT_SMOOTH_DEG,
              "hairNeutralSaturation": HAIR_NEUTRAL_SAT, "hairNearBlack": HAIR_NEAR_BLACK,
              "hairBrownGreenRed": HAIR_BROWN_GREEN_RED,
              "hairDarkMean": HAIR_DARK_MEAN, "collarRedGreenRed": COLLAR_RED_GREEN_RED,
              "collarRemnantBandMm": COLLAR_REMNANT_BAND_MM, "collarRemnantOuterMm": COLLAR_REMNANT_OUTER_MM,
              "collarRemnantHeadMax": COLLAR_REMNANT_HEAD_MAX, "collarRemnantMinFaces": COLLAR_REMNANT_MIN_FACES,
              "seamToneBandMm": SEAM_TONE_BAND_MM, "seamToneHoldMm": SEAM_TONE_HOLD_MM, "seamToneProbeMm": SEAM_TONE_PROBE_MM,
              "seamToneLightMin": SEAM_TONE_LIGHT_MIN, "seamToneLightFull": SEAM_TONE_LIGHT_FULL,
              "seamToneRefMm": list(SEAM_TONE_REF_MM), "seamToneRefSkinDeltaE": SEAM_TONE_REF_SKIN_DE,
              "seamToneSmoothDeg": SEAM_TONE_SMOOTH_DEG, "seamToneCollarMm": SEAM_TONE_COLLAR_MM}
    diagnostics = {
        "npc": npc_id, "params": params,
        "cut": {"templateBoneFraction": cut["fraction"], "sourceCenterMu": cut["sourceCenter"],
                "headFloorMm": to_mm(h_head), "maskPlaneMm": to_mm(mask_height),
                "regionADeg": float(np.count_nonzero(floor["regionA"]) * 360 / len(floor["regionA"])),
                "probeAngles": floor["probeAngles"]},
        "measurements": {"sourceEarWidthMu": measured["earWidthMu"], "sourceFaceHeightMu": measured["faceHeightMu"],
                         "targetEarWidthMu": target["earWidthMu"], "targetFaceHeightMu": target["faceHeightMu"],
                         **scale_parts, "rawScale": raw_scale, "scaleApplied": scale, "scaleClamped": clamped,
                         "overallSizeDeviationRatio": overall_deviation,
                         "overallSizeGatePass": overall_deviation < .01 or clamped},
        "head": {"vertices": head_count, "triangles": int(len(head["faces"])),
                 "neckSkinVertices": int(len(neck_skin))},
        "collarRemnants": dict(remnants), "seamTone": dict(seam_tone), "neckCenter": dict(neck_center),
        "neckFit": dict(neck_fit),
        "patch": {"vertices": int(len(patch["positions"])), "triangles": int(len(patch["faces"])),
                  "uvSeamDuplicates": int(len(patch_origin) - len(patch["positions"])),
                  "boundaryLoops": len(loops), "sideBoundaryPinned": int(len(side)),
                  "constrained": {"bottom": int(np.count_nonzero(bands["bottom"])),
                                  "top": int(np.count_nonzero(bands["top"])),
                                  "g1Skirt": int(np.count_nonzero(bands["skirt"]))},
                  "skinMissingInRegionA": int(np.count_nonzero(bands["skinMissingInA"])),
                  "displacementMaxMm": to_mm(np.linalg.norm(displacement, axis=1).max(initial=0)),
                  "skinInset": inset_stats, "solve": solve, "orientation": orientation},
        "hideMask": hide_mask, "color": {**matching, "strip": {"coveredRatio": strip_info["coveredRatio"],
                                                               "gainMean": strip_info["gainMean"]}},
        "checks": {"color": color, "g1": g1, "g1Bottom": g1_bottom, "shape": shape, "motion": motion,
                   "transitionReportOnly": seams["transition"]},
        "stats": {"vertices": len(final_mesh.positions), "triangles": len(final_mesh.indices) // 3,
                  "fileSize": final_path.stat().st_size, "durationMs": elapsed_ms}}
    pass_gate = (orientation["consistentEdgeRatio"] == 1 and orientation["outwardFaceRatio"] == 1
                 and orientation["nonManifoldEdges"] == 0
                 and solve["residualMaxMu"] < 1e-6 and hide_mask["aboveVisibleTriangles"] == 0
                 and hide_mask["belowRetainedTriangles"] > 0 and hide_mask["boundaryWithinBand"]
                 and hide_mask["leakTriangles"] == 0
                 and color["bottom"]["p95"] < 2 and color["top"]["p95"] < 2
                 and g1["maxDeg"] < 5 and g1_bottom["maxDeg"] < 5
                 and g1["radialStepMaxMm"] < 1 and 0 <= g1_bottom["stepMinMm"] and g1_bottom["stepMaxMm"] < 1
                 and shape["maxBulgeMm"] < 1
                 and shape["anglesOverOneTurn"] <= .02 * max(shape["angles"], 1)
                 and matching["deltaE"] < 3 and (overall_deviation < .01 or clamped))
    if motion is not None:
        pass_gate = pass_gate and (motion["penetration"]["bindVertices"] == 0
                                   and all(motion["penetration"][clip] <= .02 for clip in ("idle", "walk", "run"))
                                   and min(motion["bottomOverlapMinMm"].values()) >= -.05
                                   and _top_band_pass(motion))
    diagnostics["gateLevel"] = "pass" if pass_gate else "fail"
    fit["diagnostics"] = _round(diagnostics)
    (out_dir / names["fit"]).write_text(json.dumps(_round(fit), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if fast:
        return _round({"gateLevel": diagnostics["gateLevel"], **diagnostics})
    render_preview(out_dir / names["preview"], template_glb, template_mesh, final_glb, final_mesh,
                   ring_center, out_dir / names["mask"], body_tint=matching["skinTint"],
                   check_path=out_dir / names["check"])
    holes = neck_holes(template_glb, template_mesh, final_glb, final_mesh, out_dir / names["fit"],
                       region_ids["head"], m_per_mu)
    diagnostics["checks"]["neckHoles"] = holes
    fit["diagnostics"] = _round(diagnostics)
    (out_dir / names["fit"]).write_text(json.dumps(_round(fit), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = validate_asset(template_dir / "body.glb", template_dir / "skeleton.json",
                            final_path, out_dir / names["fit"], "draft")
    # validate 顺手写的整身 holes 预览不属于头资产（头的空洞改按颈 / 肩口径 neck_holes 量），不留在资产目录。
    for stale in ("holes_preview.png", f"holes_preview.{template_dir.name}.png"):
        (out_dir / stale).unlink(missing_ok=True)
    report = _head_report(report, diagnostics)
    (out_dir / names["report"]).write_text(json.dumps(_round(report), ensure_ascii=False, indent=2) + "\n",
                                           encoding="utf-8")
    if report["level"] == "draft":      # ingest 拒收 fail 产物：不通过时只留报告，不写 manifest（变体从 fits 撤下）
        _write_manifest(out_dir, npc_id, report, template_dir.name, names)
    else:
        diagnostics["gateLevel"] = "fail"
        _drop_variant(out_dir, template_dir.name, names)
    return _round({"gateLevel": diagnostics["gateLevel"], **diagnostics})


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--source", required=True, type=Path); parser.add_argument("--template", required=True, type=Path)
    parser.add_argument("--id", required=True); parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--fast", action="store_true",
                        help="迭代用：只出 head.glb / fit.json / hidemask.png 与静态检查，跳过动作帧、validate、预览与 manifest")
    parser.add_argument("--refresh-preview", action="store_true", help="只从已有产物刷新质检图")
    args = parser.parse_args(argv)
    if args.refresh_preview:
        refresh_preview_and_manifest(args.template, args.id, args.out); return 0
    report = process_head(args.source, args.template, args.id, args.out, fast=args.fast)
    if args.json: print(json.dumps(report, ensure_ascii=False))
    else: print(f"{args.id}: {report['gateLevel']} · {report['stats']['vertices']} vertices · "
                f"{report['stats']['durationMs']} ms")
    return 0 if report["gateLevel"] == "pass" else 2


if __name__ == "__main__": raise SystemExit(main())
