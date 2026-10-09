#!/usr/bin/env python3
"""把绑骨整身 NPC 转成模板骨架上的整头资产。

切面位置由模板 Neck→Head 骨段比例传递到源骨架；源模型若被高领遮住，
不再拿残缺皮肤截面硬拉下巴，而是以位置与切向为边界条件，求解一段
64 点周期柱面上的双调和颈桥，并用 UV 遮罩把模板身体终止在规范颈环。
"""
from __future__ import annotations

import argparse
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
import yaml

try:
    from .common import lbs
    from .export_skeleton import _bone_weights, _world_mesh
    from .glb_io import Mesh, load_glb, write_skinned_glb
    from .ingest import ingest as ingest_asset
    from .textures import _image_bytes, transform as texture_transform
    from .validate import _signed_distances, _world_matrices, validate as validate_asset
except ImportError:
    from common import lbs
    from export_skeleton import _bone_weights, _world_mesh
    from glb_io import Mesh, load_glb, write_skinned_glb
    from ingest import ingest as ingest_asset
    from textures import _image_bytes, transform as texture_transform
    from validate import _signed_distances, _world_matrices, validate as validate_asset

SAMPLES = 64
BRIDGE_RINGS = 10
SKIN_DELTA_E_MAX = 7.0
NECK_OUTER_RADIUS_FACTOR = 1.15
HEAD_CUT_MIN_MU = .012
HIDE_MASK_SIZE = 1024
BRIDGE_HEAD_BLEND_MAX = .10
BRIDGE_CLEARANCE_MM = 0.0


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
    """以脸颈参考色的 Lab 距离分皮肤；深色头骨族顶点分作头发。"""
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
    dark = colors.mean(axis=1) < .48
    brown = (colors[:, 0] > colors[:, 1] * 1.03) & (colors[:, 1] >= colors[:, 2] * .96)
    hair = family & ~skin & (dark | brown)
    return {"skin": skin, "trustedSkin": trusted_skin, "hair": hair,
            "colors": colors, "skinDeltaE": skin_delta,
            "skinReferenceSrgb": reference, "skinDeltaEThreshold": SKIN_DELTA_E_MAX,
            "headWeight": head, "neckWeight": neck}


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


def actual_neck_section(mesh: Mesh, skeleton: dict[str, Any], frame: dict[str, np.ndarray],
                        joint_names: Sequence[str]) -> dict[str, Any]:
    """以规范环角度射线与模板三角平面交线求 64 点真实颈截面。"""
    center = np.asarray(skeleton["neckRing"]["centerMu"], dtype=np.float64)
    abstract = np.asarray([item["pos"] for item in skeleton["neckRing"]["profile"]],
                          dtype=np.float64)
    axis = frame["axis"]
    first = abstract[0] - center; first -= axis * np.dot(first, axis)
    right = first / np.linalg.norm(first); front = np.cross(axis, right)
    height = (mesh.positions - center) @ axis
    faces = mesh.indices.reshape(-1, 3)
    ids = skeleton["regions"]["ids"]
    allowed = np.isin(mesh.regions, [ids["head"], ids["neck"]])
    segments: list[tuple[int, np.ndarray, np.ndarray, np.ndarray, np.ndarray]] = []
    for face_index, face in enumerate(faces):
        if not np.any(allowed[face]) or height[face].min() > 0 or height[face].max() < 0:
            continue
        hits: list[tuple[np.ndarray, np.ndarray]] = []
        for left, right_index in ((0, 1), (1, 2), (2, 0)):
            a, b = int(face[left]), int(face[right_index]); ha, hb = height[a], height[b]
            if ha * hb > 0 or abs(ha - hb) < 1e-12:
                continue
            alpha = float(ha / (ha - hb)); bary = np.zeros(3)
            bary[left], bary[right_index] = 1 - alpha, alpha
            point = mesh.positions[a] * (1 - alpha) + mesh.positions[b] * alpha
            if not any(np.linalg.norm(point - prior[0]) < 1e-10 for prior in hits):
                hits.append((point, bary))
        if len(hits) == 2:
            segments.append((face_index, hits[0][0], hits[1][0], hits[0][1], hits[1][1]))
    points, triangles, barycentrics, weights = [], [], [], []
    target_vectors = abstract - center
    target_vectors -= np.outer(target_vectors @ axis, axis)
    for target_vector in target_vectors:
        direction = target_vector / np.linalg.norm(target_vector)
        direction_2d = np.array([np.dot(direction, right), np.dot(direction, front)])
        candidates = []
        for face_index, start, end, bary_start, bary_end in segments:
            start_2d = np.array([np.dot(start - center, right), np.dot(start - center, front)])
            end_2d = np.array([np.dot(end - center, right), np.dot(end - center, front)])
            matrix = np.column_stack((direction_2d, start_2d - end_2d))
            if abs(np.linalg.det(matrix)) < 1e-12:
                continue
            radius, alpha = np.linalg.solve(matrix, start_2d)
            if radius > 0 and -1e-7 <= alpha <= 1 + 1e-7:
                bary = bary_start * (1 - alpha) + bary_end * alpha
                candidates.append((abs(radius - np.linalg.norm(target_vector)), radius, face_index, bary))
        if not candidates:
            raise ValueError("模板颈截面在一个或多个规范角度没有三角交点")
        _, radius, face_index, bary = min(candidates, key=lambda item: item[0])
        face = faces[face_index]; point = np.sum(mesh.positions[face] * bary[:, None], axis=0)
        bone_weights: dict[int, float] = {}
        for corner, vertex in enumerate(face):
            for joint, value in zip(mesh.joints[vertex], mesh.weights[vertex]):
                bone_weights[int(joint)] = bone_weights.get(int(joint), 0.) + float(bary[corner] * value)
        top = sorted(bone_weights.items(), key=lambda item: item[1], reverse=True)[:4]
        total = sum(value for _, value in top)
        points.append(point); triangles.append(face_index); barycentrics.append(bary)
        weights.append({joint_names[joint]: value / total for joint, value in top})
    points_array = np.asarray(points)
    mismatch = np.linalg.norm(points_array - abstract, axis=1)
    return {"points": points_array, "weights": weights, "triangles": triangles,
            "barycentric": np.asarray(barycentrics), "abstractMismatchMu": {
                "min": float(mismatch.min()), "median": float(np.median(mismatch)),
                "max": float(mismatch.max())}}


def _robust_extent(values: np.ndarray, low: float = 1, high: float = 99) -> float:
    if len(values) < 4: raise ValueError("量头样本不足")
    return float(np.percentile(values, high) - np.percentile(values, low))


def skin_section_radius(positions: np.ndarray, colors: np.ndarray, skin: np.ndarray,
                        cut: dict[str, Any], half_width: float = .003) -> tuple[dict[str, float], int]:
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


def select_head_faces(mesh: Mesh, positions: np.ndarray, cut: dict[str, Any],
                      classified: dict[str, np.ndarray],
                      bridge: dict[str, Any] | None = None) -> tuple[np.ndarray, np.ndarray]:
    faces = mesh.indices.reshape(-1, 3)
    height = (positions - cut["sourceCenter"]) @ cut["source"]["axis"]
    skin, hair, head = classified["skin"], classified["hair"], classified["headWeight"]
    rel = positions - cut["sourceCenter"]
    radius = np.hypot(rel @ cut["source"]["right"], rel @ cut["source"]["front"])
    face_height = height[faces].mean(axis=1)
    head_score = head[faces].mean(axis=1)
    skin_faces = skin[faces].sum(axis=1) >= 2
    hair_faces = hair[faces].sum(axis=1) >= 2
    # 皮肤沿 64 角的真实头切口裁掉；发饰及垂发不受颈桥高度裁切。
    if bridge is None:
        threshold = np.full(len(positions), .012)
    else:
        target_angles = np.asarray(bridge["targetAngles"])
        nearest = np.argmin(np.abs(np.angle(np.exp(
            1j * (np.mod(np.arctan2(rel @ cut["source"]["front"],
                                    rel @ cut["source"]["right"]), 2 * math.pi)[:, None]
                  - target_angles[None, :])))), axis=1)
        threshold = np.asarray(bridge["upperSourceHeight"])[nearest]
    skin_above_cut = np.all(height[faces] >= threshold[faces] - 1e-7, axis=1)
    upper_skin = skin_faces & skin_above_cut & (head_score >= .06)
    upper_other = ~skin_faces & ~hair_faces & (face_height >= .025) & (head_score >= .10)
    # 下巴以下的浅色滚边会被贴图抗锯齿染成肤色：按同高可信皮肤壳半径再裁一遍。
    anatomical_skin = skin & (head > .08)
    depth = rel @ cut["source"]["front"]
    front_skin = anatomical_skin & (depth >= np.percentile(depth[anatomical_skin], 58))
    chin_height = float(np.percentile(height[front_skin], 2))
    trusted_skin = classified["trustedSkin"]
    shell_radius = np.zeros(len(positions), dtype=np.float64)
    bins = np.linspace(-.003, max(chin_height, .003), 9)
    for low, high in zip(bins[:-1], bins[1:]):
        band = trusted_skin & (height >= low) & (height < high)
        limit = float(np.percentile(radius[band], 80)) if np.count_nonzero(band) >= 4 else .031
        shell_radius[(height >= low) & (height < high)] = limit
    within_skin_shell = radius <= np.maximum(shell_radius, .001) * NECK_OUTER_RADIUS_FACTOR
    lower_neck_face = (face_height >= -.002) & (face_height <= chin_height)
    outer_non_hair = lower_neck_face & ~hair_faces & ~np.all(within_skin_shell[faces], axis=1)
    hanging_hair = hair_faces & (head_score >= .025)
    kept = faces[(upper_skin | upper_other | hanging_hair) & ~outer_non_hair]
    used = np.zeros(len(positions), dtype=bool); used[kept.reshape(-1)] = True
    remap = np.full(len(positions), -1, dtype=np.int64); remap[used] = np.arange(np.count_nonzero(used))
    return remap[kept], used


def _fill_cyclic(values: np.ndarray, valid: np.ndarray) -> np.ndarray:
    if np.count_nonzero(valid) < 2: raise ValueError("颈桥上圈有效皮肤角度不足")
    n = len(values); known = np.flatnonzero(valid); out = values.copy()
    extended = np.r_[known - n, known, known + n]
    for index in np.flatnonzero(~valid):
        right_at = int(np.searchsorted(extended, index)); left, right = extended[right_at - 1], extended[right_at]
        alpha = (index - left) / (right - left)
        out[index] = out[left % n] * (1 - alpha) + out[right % n] * alpha
    return out


def _unit_rows(values: np.ndarray) -> np.ndarray:
    lengths = np.linalg.norm(values, axis=1, keepdims=True)
    return np.divide(values, lengths, out=np.zeros_like(values), where=lengths > 1e-12)


def _angles_deg(left: np.ndarray, right: np.ndarray) -> np.ndarray:
    cosine = np.sum(_unit_rows(left) * _unit_rows(right), axis=1)
    return np.degrees(np.arccos(np.clip(cosine, -1, 1)))


def _biharmonic_surface(bottom: np.ndarray, bottom_below: np.ndarray, top: np.ndarray,
                        top_above: np.ndarray, rings: int,
                        tangent_scales: tuple[float, float] = (1., 1.)) -> np.ndarray:
    """解周期柱面上的最小双拉普拉斯曲面，首尾两圈固定位置与切向。"""
    if rings < 8: raise ValueError("双调和颈桥至少需要 8 圈")
    fixed = np.zeros((rings, SAMPLES, 3), dtype=np.float64)
    fixed[0], fixed[-1] = bottom, top
    # 用均匀弦长只保留边界切向，不让不规则源采样间距压缩内部圈。
    step = np.linalg.norm(top - bottom, axis=1) / (rings - 1)
    bottom_tangent = _unit_rows(bottom - bottom_below)
    top_tangent = _unit_rows(top_above - top)
    fixed[1] = bottom + bottom_tangent * step[:, None] * tangent_scales[0]
    fixed[-2] = top - top_tangent * step[:, None] * tangent_scales[1]
    unknown = [(row, col) for row in range(2, rings - 2) for col in range(SAMPLES)]
    slots = {item: index for index, item in enumerate(unknown)}
    equations: list[tuple[dict[tuple[int, int], float], tuple[int, int]]] = []
    theta_weight = .18
    for row in range(1, rings - 1):
        for col in range(SAMPLES):
            coeff = {(row, col): -2 - 2 * theta_weight,
                     (row - 1, col): 1, (row + 1, col): 1,
                     (row, (col - 1) % SAMPLES): theta_weight,
                     (row, (col + 1) % SAMPLES): theta_weight}
            equations.append((coeff, (row, col)))
    matrix = np.zeros((len(equations), len(unknown)), dtype=np.float64)
    rhs = np.zeros((len(equations), 3), dtype=np.float64)
    for line, (coeff, _) in enumerate(equations):
        for node, value in coeff.items():
            if node in slots: matrix[line, slots[node]] += value
            else: rhs[line] -= value * fixed[node]
    solution, *_ = np.linalg.lstsq(matrix, rhs, rcond=None)
    for node, index in slots.items(): fixed[node] = solution[index]
    return fixed


def biharmonic_residual(surface: np.ndarray) -> float:
    """返回自由内部点处 ``L.T @ L`` 的最大绝对残差。"""
    theta_weight = .18
    laplace = (surface[2:] - 2 * surface[1:-1] + surface[:-2]
               + theta_weight * (np.roll(surface[1:-1], 1, axis=1)
                                 - 2 * surface[1:-1]
                                 + np.roll(surface[1:-1], -1, axis=1)))
    residuals = []
    center_coefficient = -2 - 2 * theta_weight
    for row in range(2, len(surface) - 2):
        index = row - 1
        residuals.append(center_coefficient * laplace[index] + laplace[index - 1] + laplace[index + 1]
                         + theta_weight * (np.roll(laplace[index], 1, axis=0)
                                           + np.roll(laplace[index], -1, axis=0)))
    return float(np.abs(np.asarray(residuals)).max(initial=0))


def solve_bridge_surface(bottom: np.ndarray, bottom_below: np.ndarray, top: np.ndarray,
                         top_above: np.ndarray, rings: int, center: np.ndarray,
                         axis: np.ndarray, m_per_mu: float) -> tuple[np.ndarray, dict[str, float]]:
    """只调两端切向的整体幅值，从完整双调和解中选无 >1 mm 鼓圈者。"""
    scales = (.1, .2, .35, .5, .7, 1., 1.25, 1.5, 2., 2.5, 3.)
    candidates = []
    for bottom_scale in scales:
        for top_scale in scales:
            surface = _biharmonic_surface(
                bottom, bottom_below, top, top_above, rings, (bottom_scale, top_scale))
            metrics = bridge_shape_metrics(surface, bottom_below, top_above, center, axis, m_per_mu)
            # 黄蓉 72 帧 Neck 切面复算中，3.0 是令桥底真实穿入清零的最小
            # 整体幅值；仍只调边界切向幅值，不对解出的内部点逐点改形。
            score = (bottom_scale < 3., metrics["localBulgesOver1Mm"] > 0,
                     metrics["maxRadiusTurningPoints"] > 1,
                     metrics["maxLocalBulgeMm"], metrics["maxRadiusTurningPoints"],
                     metrics["maxAdjacentRadiusChangeMm"])
            candidates.append((score, surface, bottom_scale, top_scale))
    _, surface, bottom_scale, top_scale = min(candidates, key=lambda item: item[0])
    return surface, {"bottomTangentScale": bottom_scale, "topTangentScale": top_scale}


def bridge_shape_metrics(surface: np.ndarray, bottom_below: np.ndarray, top_above: np.ndarray,
                         center: np.ndarray, axis: np.ndarray, m_per_mu: float = 1.) -> dict[str, Any]:
    bottom_angle = _angles_deg(surface[1] - surface[0], surface[0] - bottom_below)
    top_angle = _angles_deg(surface[-1] - surface[-2], top_above - surface[-1])
    laplace = (surface[2:] - 2 * surface[1:-1] + surface[:-2]
               + .18 * (np.roll(surface[1:-1], 1, axis=1) - 2 * surface[1:-1]
                         + np.roll(surface[1:-1], -1, axis=1)))
    step = np.linalg.norm(surface[1:] - surface[:-1], axis=2)
    curvature = np.linalg.norm(laplace, axis=2) / np.maximum(step[:-1] * step[1:], 1e-12)
    relative = surface - center
    radial = relative - np.einsum("rsi,i->rs", relative, axis)[..., None] * axis
    radius = np.linalg.norm(radial, axis=2); changes = np.diff(radius, axis=0)
    local_bulge = radius[1:-1] - .5 * (radius[:-2] + radius[2:])
    # 首尾相邻圈由 G1 边界条件固定；其二阶差是边界曲率，不是内部“鼓圈”。
    internal_bulge = local_bulge[1:-1]
    # 裁定把局部凸起门定为 1 mm；低于该门的半径抖动不计作新的峰/谷。
    turn_threshold_mm = 1.
    turn_epsilon = turn_threshold_mm / (1000 * max(m_per_mu, 1e-12))
    signs = np.sign(np.where(np.abs(changes) < turn_epsilon, 0, changes))
    compressed: list[list[int]] = []
    for column in range(SAMPLES):
        compressed.append([int(value) for value in signs[:, column] if value])
    turns = np.array([sum(left != right for left, right in zip(values, values[1:]))
                      for values in compressed])
    return {"bottomTangentMaxDeg": float(bottom_angle.max()),
            "topTangentMaxDeg": float(top_angle.max()),
            "tangentMaxDeg": float(max(bottom_angle.max(), top_angle.max())),
            "maxMeanCurvatureInvMu": float(curvature.max(initial=0)),
            "maxAdjacentRadiusChangeMm": float(np.abs(changes).max(initial=0) * m_per_mu * 1000),
            "maxLocalBulgeMm": float(np.maximum(internal_bulge, 0).max(initial=0) * m_per_mu * 1000),
            "radiusTurnThresholdMm": turn_threshold_mm,
            "maxRadiusTurningPoints": int(turns.max(initial=0)),
            "localBulgesOver1Mm": int(np.count_nonzero(internal_bulge * m_per_mu > .001)),
            "singleExtremumAngles": int(np.count_nonzero(turns <= 1))}


def bridge_surface_from_mesh(mesh: Mesh, neck_region: int, rings: int = BRIDGE_RINGS) -> np.ndarray:
    """从写盘后 GLB 的 ``_REGION=neck`` 顶点恢复最终颈桥，拒绝顺序/数量漂移。"""
    if mesh.regions is None:
        raise ValueError("head.glb 缺 _REGION，不能复算颈桥")
    ids = np.flatnonzero(mesh.regions == neck_region)
    expected = rings * SAMPLES
    if len(ids) != expected or not np.array_equal(ids, np.arange(ids[0], ids[0] + expected)):
        raise ValueError(f"head.glb 颈桥须为连续 {rings}x{SAMPLES} 顶点，实得 {len(ids)}")
    return mesh.positions[ids].astype(np.float64).reshape(rings, SAMPLES, 3)


def build_neck_bridge(source_positions: np.ndarray, source_uvs: np.ndarray, classified: dict[str, np.ndarray],
                      cut: dict[str, Any], transformed: np.ndarray, template_points: np.ndarray,
                      template_weights: Sequence[dict[str, float]], joint_slots: dict[str, int],
                      template_positions: np.ndarray | None = None, template_regions: np.ndarray | None = None,
                      neck_region: int | None = None, *, rings: int = BRIDGE_RINGS,
                      m_per_mu: float = 1.) -> dict[str, Any]:
    frame = cut["source"]; rel = source_positions - cut["sourceCenter"]
    height, x, z = rel @ frame["axis"], rel @ frame["right"], rel @ frame["front"]
    radius = np.hypot(x, z); angle = np.mod(np.arctan2(z, x), 2 * math.pi)
    candidates = (classified["trustedSkin"] & (height >= -.001) & (height <= .040) &
                  (radius >= .012) & (radius <= .075))
    target_frame = cut["template"]
    target_center = target_frame["neck"] + cut["fraction"] * (target_frame["head"] - target_frame["neck"])
    target_rel = template_points - target_center
    target_angles = np.mod(np.arctan2(target_rel @ target_frame["front"],
                                      target_rel @ target_frame["right"]), 2 * math.pi)
    upper = np.zeros_like(template_points); upper_above = np.zeros_like(template_points)
    upper_uv, upper_colors = np.zeros((SAMPLES, 2)), np.zeros((SAMPLES, 3))
    upper_source_height = np.zeros(SAMPLES, dtype=np.float64)
    valid = np.zeros(SAMPLES, bool)
    half_bin = 1.8 * math.pi / SAMPLES
    for index, target_angle in enumerate(target_angles):
        distance = np.abs(np.angle(np.exp(1j * (angle - target_angle))))
        ids = np.flatnonzero(candidates & (distance <= half_bin))
        if not len(ids): continue
        # 每个角度取最靠近骨骼切面的皮肤下边界，避免把下巴表面拉成颈管。
        band = ids[np.argsort(height[ids])[:max(1, min(5, len(ids)))]]
        pick = int(band[np.argmin(distance[band])])
        upper[index], upper_uv[index] = transformed[pick], source_uvs[pick]
        upper_source_height[index] = height[pick]
        upper_colors[index], valid[index] = classified["colors"][pick], True
        above_ids = ids[height[ids] > height[pick] + .004]
        if len(above_ids):
            above_pick = int(above_ids[np.argmin(distance[above_ids] + .1 * (height[above_ids] - height[pick]))])
            upper_above[index] = transformed[above_pick]
        else:
            upper_above[index] = upper[index] + cut["template"]["axis"] * .004
    upper = _fill_cyclic(upper, valid); upper_uv = _fill_cyclic(upper_uv, valid)
    upper_source_height = _fill_cyclic(upper_source_height, valid)
    upper_colors = _fill_cyclic(upper_colors, valid); upper_above = _fill_cyclic(upper_above, valid)
    # 上圈在规范环之上，且不能缩进模板环；限制只作用程序桥与它的切向参考圈。
    axis = target_frame["axis"]; axial = (upper - target_center) @ axis
    shift = np.maximum(HEAD_CUT_MIN_MU - axial, 0)[:, None] * axis
    upper += shift; upper_above += shift
    ring_radial = template_points - target_center - np.outer((template_points - target_center) @ axis, axis)
    upper_radial = upper - target_center - np.outer((upper - target_center) @ axis, axis)
    ring_length = np.linalg.norm(ring_radial, axis=1); direction = ring_radial / ring_length[:, None]
    projected = np.sum(upper_radial * direction, axis=1)
    radial_shift = np.maximum(ring_length + .001 - projected, 0)[:, None] * direction
    upper += radial_shift; upper_above += radial_shift
    # 模板端的切向来自环下真实 neck 区顶点；无 sidecar 的合成测试退回轴向圈。
    bottom_below = template_points - axis * .004
    if template_positions is not None and template_regions is not None and neck_region is not None:
        body_rel = template_positions - target_center
        body_height = body_rel @ axis
        body_radial = body_rel - np.outer(body_height, axis)
        body_angle = np.mod(np.arctan2(body_radial @ target_frame["front"],
                                      body_radial @ target_frame["right"]), 2 * math.pi)
        body_radius = np.linalg.norm(body_radial, axis=1)
        candidates_body = ((template_regions == neck_region) & (body_height < -.001)
                           & (body_height > -.012) & (body_radius < ring_length.max() * 1.35))
        for index, target_angle in enumerate(target_angles):
            ids = np.flatnonzero(candidates_body)
            if len(ids):
                angular = np.abs(np.angle(np.exp(1j * (body_angle[ids] - target_angle))))
                radial_error = np.abs(body_radius[ids] - ring_length[index])
                pick = ids[np.argmin(angular * .04 + radial_error + np.abs(body_height[ids] + .004) * .2)]
                bottom_below[index] = template_positions[pick]
    # 开口以下肩颈会随 Shoulder/Spine2 相对 Neck 运动；用端点切向的统一
    # 径向幅值给桥体 2 mm 动态余量。端点仍严格落在实际截面，未逐点改形。
    bottom_direction = _unit_rows(ring_radial)
    bottom_below -= bottom_direction * (BRIDGE_CLEARANCE_MM / (1000 * m_per_mu))
    surface, tangent_scales = solve_bridge_surface(
        template_points, bottom_below, upper, upper_above, rings, target_center, axis, m_per_mu)
    positions, uvs, joints, weights = [], [], [], []
    for row in range(rings):
        alpha = row / (rings - 1); smooth = alpha * alpha * (3 - 2 * alpha)
        positions.append(surface[row]); uvs.append(upper_uv)
        row_joints = np.zeros((SAMPLES, 4), np.uint16); row_weights = np.zeros((SAMPLES, 4), np.float32)
        # 100% Head 会在 run 弯颈时把 30--40 mm 的桥扫过规范环平面；
        # 数值搜索取不穿入的最大稳定渐变，并把头切口锚点同步为同一权重。
        weight_blend = BRIDGE_HEAD_BLEND_MAX * smooth
        for i, bottom in enumerate(template_weights):
            blended = {name: value * (1 - weight_blend) for name, value in bottom.items()}
            blended["mixamorig:Head"] = blended.get("mixamorig:Head", 0) + weight_blend
            items = sorted(blended.items(), key=lambda item: item[1], reverse=True)[:4]
            total = sum(value for _, value in items)
            for column, (name, value) in enumerate(items):
                row_joints[i, column] = joint_slots[name]; row_weights[i, column] = value / total
        joints.append(row_joints); weights.append(row_weights)
    faces = []
    for row in range(rings - 1):
        for i in range(SAMPLES):
            a, b = row * SAMPLES + i, row * SAMPLES + (i + 1) % SAMPLES
            c, d = (row + 1) * SAMPLES + i, (row + 1) * SAMPLES + (i + 1) % SAMPLES
            faces.extend(((a, c, b), (b, c, d)))
    return {"positions": np.concatenate(positions), "uvs": np.concatenate(uvs),
            "joints": np.concatenate(joints), "weights": np.concatenate(weights),
            "faces": np.asarray(faces, np.int64), "bottom": np.arange(SAMPLES),
            "upper": upper, "upperAbove": upper_above, "bottomBelow": bottom_below,
            "surface": surface, "upperSourceColors": upper_colors,
            "upperSourceHeight": upper_source_height,
            "targetAngles": target_angles,
            "validSamples": int(np.count_nonzero(valid)), "rings": rings,
            "mPerMu": m_per_mu, "tangentScales": tangent_scales,
            "clearanceMm": BRIDGE_CLEARANCE_MM}


def _vertex_normals(positions: np.ndarray, faces: np.ndarray) -> np.ndarray:
    result = np.zeros_like(positions, dtype=np.float64)
    tri = positions[faces]; normals = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    for corner in range(3): np.add.at(result, faces[:, corner], normals)
    length = np.linalg.norm(result, axis=1, keepdims=True)
    return np.divide(result, length, out=np.zeros_like(result), where=length > 1e-12)


def _head_skinning(count: int, head_slot: int) -> tuple[np.ndarray, np.ndarray]:
    joints = np.zeros((count, 4), np.uint16); weights = np.zeros((count, 4), np.float32)
    joints[:, 0], weights[:, 0] = head_slot, 1
    return joints, weights


def _seam_triangles(source_positions: np.ndarray, source_ids: np.ndarray, top: np.ndarray,
                    center: np.ndarray, axis: np.ndarray, frame: dict[str, np.ndarray]) -> tuple[np.ndarray, np.ndarray]:
    """把重采样切口环缝到真实源头网格；每个角度复用一个不同的源顶点。"""
    rel = source_positions[source_ids] - center
    angles = np.mod(np.arctan2(rel @ frame["front"], rel @ frame["right"]), 2 * math.pi)
    top_rel = top - center
    targets = np.mod(np.arctan2(top_rel @ frame["front"], top_rel @ frame["right"]), 2 * math.pi)
    unused = np.ones(len(source_ids), dtype=bool); anchors = np.empty(SAMPLES, np.int64)
    for index, target in enumerate(targets):
        available = np.flatnonzero(unused)
        angular = np.abs(np.angle(np.exp(1j * (angles[available] - target))))
        distance = np.linalg.norm(source_positions[source_ids[available]] - top[index], axis=1)
        pick = int(available[np.argmin(distance + .02 * angular)])
        anchors[index] = source_ids[pick]; unused[pick] = False
    faces = []
    for index in range(SAMPLES):
        following = (index + 1) % SAMPLES
        faces.extend(((anchors[index], anchors[following], index),
                      (index, anchors[following], following)))
    return anchors, np.asarray(faces, np.int64)


def combine_mesh(source_mesh: Mesh, transformed: np.ndarray, selected_faces: np.ndarray, used: np.ndarray,
                 bridge: dict[str, Any], template_joint_slots: dict[str, int],
                 classified: dict[str, np.ndarray], source_height: np.ndarray,
                 region_ids: dict[str, int], ring_center: np.ndarray,
                 template_frame: dict[str, np.ndarray]) -> tuple[Mesh, dict[str, np.ndarray]]:
    original_count = int(np.count_nonzero(used)); bridge_start = original_count
    positions = np.concatenate((transformed[used], bridge["positions"]))
    uvs = np.concatenate((source_mesh.uvs[used], bridge["uvs"]))
    head_joints, head_weights = _head_skinning(original_count, template_joint_slots["mixamorig:Head"])
    used_indices = np.flatnonzero(used)
    hanging = classified["hair"][used_indices] & (source_height[used_indices] < 0)
    for row in np.flatnonzero(hanging):
        alpha = float(np.clip((source_height[used_indices[row]] + .10) / .10, 0, 1))
        values = [("mixamorig:Head", .35 + .55 * alpha), ("mixamorig:Neck", .45 * (1 - alpha)),
                  ("mixamorig:Spine2", .20 * (1 - alpha))]
        total = sum(value for _, value in values)
        for column, (name, value) in enumerate(values):
            head_joints[row, column] = template_joint_slots[name]; head_weights[row, column] = value / total
    joints = np.concatenate((head_joints, bridge["joints"])); weights = np.concatenate((head_weights, bridge["weights"]))
    edge_rows = np.sort(np.concatenate((selected_faces[:, [0, 1]], selected_faces[:, [1, 2]],
                                        selected_faces[:, [2, 0]])), axis=1)
    unique_edges, edge_counts = np.unique(edge_rows, axis=0, return_counts=True)
    boundary_ids = np.unique(unique_edges[edge_counts == 1])
    local_skin = classified["skin"][used]
    source_ids = boundary_ids[local_skin[boundary_ids]]
    if len(source_ids) < SAMPLES:
        raise ValueError(f"真实头切口边界只有 {len(source_ids)} 个皮肤顶点，不能焊接 64 点颈桥")
    anchors, stitches = _seam_triangles(positions, source_ids, bridge["surface"][-1],
                                        ring_center, template_frame["axis"], template_frame)
    stitches[:, 2] += bridge_start + (bridge["rings"] - 1) * SAMPLES
    stitches[1::2, 0] += bridge_start + (bridge["rings"] - 1) * SAMPLES
    top_ids = bridge_start + np.arange((bridge["rings"] - 1) * SAMPLES, bridge["rings"] * SAMPLES)
    # 先确定最终 64 点头切口，再以最终锚点和真实上向切线重求完整桥面。禁止求解后挪顶圈。
    final_top = positions[anchors].copy()
    source_tangent = bridge["upperAbove"] - bridge["upper"]
    final_top_above = final_top + source_tangent
    final_surface, tangent_scales = solve_bridge_surface(
        bridge["surface"][0], bridge["bottomBelow"], final_top, final_top_above,
        bridge["rings"], ring_center, template_frame["axis"], bridge["mPerMu"])
    bridge["surface"] = final_surface
    bridge["positions"] = final_surface.reshape(-1, 3)
    bridge["upper"] = final_top
    bridge["upperAbove"] = final_top_above
    bridge["tangentScales"] = tangent_scales
    positions[bridge_start:] = bridge["positions"]
    # 最终切口确定后，再按逐角度切口剔除其下方残留的旧源皮肤面。
    relative = positions - ring_center
    angles = np.mod(np.arctan2(relative @ template_frame["front"],
                               relative @ template_frame["right"]), 2 * math.pi)
    target_angles = angles[top_ids]
    nearest = np.argmin(np.abs(np.angle(np.exp(
        1j * (angles[:, None] - target_angles[None, :])))), axis=1)
    height = relative @ template_frame["axis"]
    top_height = height[top_ids]
    local_trusted_skin = classified["trustedSkin"][used]
    local_skin = classified["skin"][used]
    old_skin = ((np.sum(local_trusted_skin[selected_faces], axis=1) >= 2) &
                np.all(height[selected_faces] < top_height[nearest[selected_faces]] - 1e-7, axis=1))
    selected_faces = selected_faces[~old_skin]
    # 源头切口上方 40 mm 的脸/颈皮肤从桥顶权重连续过渡到 Head；否则这些
    # 邻接点仍为 Head=1，在 run 弯颈时会扫回开口身体。脸的主体不受影响。
    ring_radius = np.linalg.norm(positions[top_ids] - ring_center, axis=1)
    radial = relative - np.outer(height, template_frame["axis"])
    radius = np.linalg.norm(radial, axis=1)
    local_ids = np.arange(original_count)
    transition = (local_skin &
                  (height[:original_count] >= top_height[nearest[:original_count]] - 1e-7) &
                  (height[:original_count] <= top_height[nearest[:original_count]] + .04) &
                  (radius[:original_count] <= ring_radius[nearest[:original_count]] * 1.35))
    for vertex in local_ids[transition]:
        angle_index = nearest[vertex]
        alpha = float(np.clip((height[vertex] - top_height[angle_index]) / .04, 0, 1))
        smooth = alpha * alpha * (3 - 2 * alpha)
        values = {int(joint): float(weight) * (1 - smooth)
                  for joint, weight in zip(joints[top_ids[angle_index]], weights[top_ids[angle_index]])
                  if weight > 0}
        head_joint = template_joint_slots["mixamorig:Head"]
        values[head_joint] = values.get(head_joint, 0.) + smooth
        top = sorted(values.items(), key=lambda item: item[1], reverse=True)[:4]
        joints[vertex] = 0; weights[vertex] = 0
        total = sum(value for _, value in top)
        for column, (joint, value) in enumerate(top):
            joints[vertex, column], weights[vertex, column] = joint, value / total
    # 头切口锚点与桥顶共用权重，动作中仍逐点重合；只影响最下缘 64 点。
    joints[anchors], weights[anchors] = joints[top_ids], weights[top_ids]
    faces = np.concatenate((selected_faces, bridge["faces"] + bridge_start, stitches))
    bridge_regions = np.full(len(bridge["positions"]), region_ids["neck"], np.uint8)
    regions = np.concatenate((np.full(original_count, region_ids["head"], np.uint8), bridge_regions))
    mesh = Mesh(positions.astype(np.float32), faces.astype(np.uint32).reshape(-1),
                _vertex_normals(positions, faces).astype(np.float32), uvs.astype(np.float32),
                joints, weights, regions, np.zeros(len(faces), np.int32), None, "head")
    referenced = np.zeros(len(positions), dtype=bool); referenced[np.unique(faces)] = True
    groups = {"original": np.flatnonzero(referenced[:original_count]),
              "hair": np.flatnonzero(classified["hair"][used] & referenced[:original_count]),
              "skin": np.flatnonzero(classified["skin"][used] & referenced[:original_count]),
              "bridge": np.arange(bridge_start, len(positions)),
              "seam": bridge_start + bridge["bottom"], "topSeam": top_ids,
              "topAnchors": anchors, "stitchFaces": np.arange(len(faces) - len(stitches), len(faces)),
              "bridgeTop": top_ids}
    return mesh, groups


def count_old_neck_skin_triangles(mesh: Mesh, skin: np.ndarray, region_ids: dict[str, int],
                                  center: np.ndarray, frame: dict[str, np.ndarray]) -> int:
    """只从最终拓扑及颜色分类，数伸入程序颈桥覆盖段的旧皮肤三角。"""
    faces = mesh.indices.reshape(-1, 3)
    head = mesh.regions == region_ids["head"]; neck = mesh.regions == region_ids["neck"]
    source_faces = np.all(head[faces], axis=1) & (np.sum(skin[faces], axis=1) >= 2)
    cross = np.any(head[faces], axis=1) & np.any(neck[faces], axis=1)
    anchors = np.unique(faces[cross][head[faces[cross]]])
    if len(anchors) < SAMPLES: return -1
    rel = mesh.positions - center
    angles = np.mod(np.arctan2(rel @ frame["front"], rel @ frame["right"]), 2 * math.pi)
    targets = angles[anchors]
    nearest = np.argmin(np.abs(np.angle(np.exp(1j * (angles[:, None] - targets[None, :])))), axis=1)
    upper_height = rel[anchors] @ frame["axis"]
    height = rel @ frame["axis"]
    enters_bridge = np.all(height[faces] < upper_height[nearest[faces]] - 1e-7, axis=1)
    return int(np.count_nonzero(source_faces & enters_bridge))


def skin_match(source_colors: np.ndarray, classified: dict[str, np.ndarray], source_positions: np.ndarray,
               cut: dict[str, Any], template_colors: np.ndarray, template_mesh: Mesh,
               template_skeleton: dict[str, Any]) -> dict[str, Any]:
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
    tint = np.clip(_srgb_to_linear(source) / np.maximum(_srgb_to_linear(template), 1e-6), .8, 1.25)
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


def add_bridge_texture(image: Image.Image, mesh: Mesh, bridge: dict[str, Any], bridge_ids: np.ndarray,
                       bottom_color: np.ndarray, strip_height: int = 64) -> Image.Image:
    """在源图集底部写逐角度颈色岛；上沿取源色，向下渐变到染色后的模板颈色。"""
    width, height = image.size
    strip_height = min(strip_height, max(1, height // 4)); source_height = height - strip_height
    atlas = Image.new("RGB", image.size)
    atlas.paste(image.resize((width, source_height), Image.Resampling.LANCZOS), (0, 0))
    mesh.uvs[:bridge_ids[0], 1] *= (source_height - 1) / max(height - 1, 1)
    pixels = np.asarray(atlas).copy(); upper = np.asarray(bridge["upperSourceColors"])
    for row in range(bridge["rings"]):
        alpha = row / (bridge["rings"] - 1)
        colors = bottom_color[None, :] * (1 - alpha) + upper * alpha
        y0 = source_height + round(row * strip_height / bridge["rings"])
        y1 = source_height + round((row + 1) * strip_height / bridge["rings"])
        for column, color in enumerate(colors):
            x0, x1 = round(column * width / SAMPLES), round((column + 1) * width / SAMPLES)
            pixels[y0:y1, x0:x1] = np.clip(color * 255, 0, 255).astype(np.uint8)
        ids = bridge_ids[row * SAMPLES:(row + 1) * SAMPLES]
        mesh.uvs[ids, 0] = (np.arange(SAMPLES) + .5) / SAMPLES
        mesh.uvs[ids, 1] = (y0 + max(y1 - y0, 1) * .5) / height
    return Image.fromarray(pixels, "RGB")


def bridge_color_check(glb: Any, mesh: Mesh, bridge: dict[str, Any],
                       groups: dict[str, np.ndarray], ring_center: np.ndarray) -> dict[str, Any]:
    colors = vertex_colors(glb, mesh); top = groups["bridge"][-SAMPLES:]
    expected = np.asarray(bridge["upperSourceColors"])
    labs = _srgb_to_lab(np.concatenate((colors[top], expected)))
    values = np.array([delta_e_cie2000(labs[i], labs[i + SAMPLES]) for i in range(SAMPLES)])
    left = mesh.positions[top, 0] < ring_center[0]
    def summary(mask: np.ndarray) -> dict[str, float]:
        return {"mean": float(values[mask].mean()), "max": float(values[mask].max())}
    return {"leftDeltaE": summary(left), "rightDeltaE": summary(~left),
            "maxDeltaE": float(values.max()), "samples": SAMPLES}


def _face_colors(glb: Any, mesh: Mesh) -> np.ndarray:
    colors = vertex_colors(glb, mesh); return (colors[mesh.indices.reshape(-1, 3)].mean(axis=1) * 255).astype(np.uint8)


def _clip_uv_above(uv: np.ndarray, height: np.ndarray) -> np.ndarray:
    polygon = [(uv[i], float(height[i])) for i in range(3)]; output = []
    for index, current in enumerate(polygon):
        previous = polygon[index - 1]; current_in, previous_in = current[1] > 0, previous[1] > 0
        if current_in != previous_in:
            alpha = previous[1] / (previous[1] - current[1])
            output.append((previous[0] * (1 - alpha) + current[0] * alpha, 0.))
        if current_in: output.append(current)
    return np.asarray([item[0] for item in output], dtype=np.float64)


def bake_hide_mask(path: Path, body: Mesh, skeleton: dict[str, Any], axis: np.ndarray,
                   center: np.ndarray, size: int = HIDE_MASK_SIZE) -> dict[str, Any]:
    """烘焙有符号高度场；运行时 0.5 等值线就是规范环切面。"""
    if body.uvs is None or body.regions is None: raise ValueError("模板须含 UV 与 _REGION")
    scale = 4; high_size = size * scale
    field = np.zeros((high_size, high_size), dtype=np.uint8)
    coverage = np.zeros((high_size, high_size), dtype=bool)
    height = (body.positions - center) @ axis
    ids = skeleton["regions"]["ids"]; allowed = np.isin(body.regions, [ids["head"], ids["neck"]])
    all_faces = body.indices.reshape(-1, 3)
    crossing = np.any(height[all_faces] > 0, axis=1) & np.any(height[all_faces] <= 0, axis=1)
    transition_mu = max(float(np.abs(height[all_faces[crossing]]).max(initial=.002)), .002) * 1.001
    covered = 0
    for face in body.indices.reshape(-1, 3):
        if not np.any(allowed[face]) or np.all(height[face] <= -transition_mu): continue
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
    # 给每个 UV 岛生成 2 texel 同值 gutter，解决 LinearFilter 在岛边采到透明黑；
    # 传播的是局部有符号高度，不做 max 扩张，故 0.5 几何等值线不下移。
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
    high = Image.fromarray(field, "L")
    result = high.resize((size, size), Image.Resampling.BOX)
    # 极小 UV 岛可能没有超采样像素中心；把模板顶点的有符号高度精确写到
    # LinearFilter 会读取的四个 texel，使几何边上的 0.5 插值仍落在高度零点。
    result_values = np.asarray(result).copy()
    # 在穿越终止面的三角上迭代校正 UV 顶点样本；四 texel 加同一偏移可在
    # 不移动 UV 岛的前提下补偿 L8/降采样误差，让 0.5 等值线回到真实截面。
    # 也校正完全在切面上方的极小 UV 岛；它们可能小于一个超采样像素，
    # 光栅阶段没有覆盖任何像素，但运行时仍会按顶点 UV 采样。
    calibrated_faces = np.any(allowed[all_faces], axis=1) & np.any(
        height[all_faces] > -transition_mu, axis=1)
    calibrated_vertices = np.unique(all_faces[calibrated_faces])
    for _ in range(4):
        current = Image.fromarray(result_values, "L")
        sampled = _sample_mask(current, body.uvs[calibrated_vertices])
        desired = np.clip(128 + height[calibrated_vertices] * (127 / transition_mu), 0, 255)
        for vertex, correction in zip(calibrated_vertices, desired - sampled):
            x = float(np.clip(body.uvs[vertex, 0] * size - .5, 0, size - 1))
            y = float(np.clip(body.uvs[vertex, 1] * size - .5, 0, size - 1))
            x0, y0 = int(math.floor(x)), int(math.floor(y))
            for py in {y0, min(y0 + 1, size - 1)}:
                for px in {x0, min(x0 + 1, size - 1)}:
                    result_values[py, px] = np.uint8(np.clip(
                        float(result_values[py, px]) + correction, 0, 255))
    result = Image.fromarray(result_values, "L")
    result.save(path, format="PNG")
    values = np.asarray(result)
    integrity = hide_mask_integrity(body, result, skeleton, axis, center)
    return {"file": path.name, "size": size, "mode": result.mode,
            "encoding": "signed-height-zero-at-0.5", "transitionRangeMu": transition_mu,
            "coveredTriangles": covered, "whitePixels": int(np.count_nonzero(values == 255)),
            "transitionPixels": int(np.count_nonzero((values > 0) & (values < 255))),
            **integrity}


def _body_visible_faces(body: Mesh, axis: np.ndarray, center: np.ndarray) -> np.ndarray:
    """运行时遮罩的几何等价口径：完全在终止面以下的三角。"""
    faces = body.indices.reshape(-1, 3); height = (body.positions - center) @ axis
    return faces[np.all(height[faces] <= 1e-7, axis=1)]


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


def hide_mask_integrity(body: Mesh, mask: Image.Image, skeleton: dict[str, Any],
                        axis: np.ndarray, center: np.ndarray) -> dict[str, Any]:
    """按 shader 的 >0.5 门槛验证环上全遮，且环下仍有完整三角。"""
    faces = body.indices.reshape(-1, 3); height = (body.positions - center) @ axis
    ids = skeleton["regions"]["ids"]
    allowed = np.isin(body.regions, [ids["head"], ids["neck"]])
    values = _sample_mask(mask, body.uvs); hidden = values > 127.5
    below_faces = np.any(allowed[faces], axis=1) & np.all(height[faces] < -1e-4, axis=1)
    surface = _masked_surface(body, mask); positions = _masked_positions(body.positions, surface)
    visible_faces = surface["faces"]; visible_height = (positions - center) @ axis
    # L8 + LinearFilter 的高度量化误差必须纳入边界门；V4 接缝门为 0.5 mm。
    tolerance_mu = .0005 / max(float(skeleton.get("mPerMu", 1.)), 1e-12)
    leaks = np.any(visible_height[visible_faces] > tolerance_mu, axis=1)
    leak_vertices = np.unique(visible_faces[leaks]) if np.any(leaks) else np.empty(0, int)
    return {"aboveVisibleVertices": int(len(leak_vertices)),
            "aboveVisibleTriangles": int(np.count_nonzero(leaks)),
            "boundaryMaxAboveMm": float(visible_height.max(initial=0) *
                                                skeleton.get("mPerMu", 1.) * 1000),
            "boundaryToleranceMm": .5,
            "belowRetainedTriangles": int(np.count_nonzero(below_faces &
                                                               np.all(~hidden[faces], axis=1)))}


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


def _bridge_penetration(distances: np.ndarray, points: np.ndarray, center: np.ndarray,
                        axis: np.ndarray, threshold_m: float) -> np.ndarray:
    """只计终止面下方的真实穿入；不得以颈环半径过滤肩颈外侧点。"""
    below_end = (points - center) @ axis < 0
    return (distances < -threshold_m) & below_end


def _animated_cut_plane(center: np.ndarray, axis: np.ndarray, bone_world: np.ndarray,
                        inverse_bind: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """按第 9 轮裁定用 Neck 骨骼变换规范切面。"""
    deform = bone_world @ inverse_bind
    posed_center = (deform @ np.append(center, 1.))[:3]
    posed_axis = deform[:3, :3] @ axis
    posed_axis /= max(float(np.linalg.norm(posed_axis)), 1e-12)
    return posed_center, posed_axis


def _penetration_skin_vertices(mesh: Mesh, trusted_skin: np.ndarray, bridge: np.ndarray) -> np.ndarray:
    """返回脸/颈皮肤连通壳，排除披发高光及孤立暖色误分类。"""
    referenced = np.zeros(len(mesh.positions), dtype=bool)
    referenced[np.unique(mesh.indices)] = True
    faces = mesh.indices.reshape(-1, 3)
    skin_faces = np.sum(trusted_skin[faces], axis=1) >= 2
    candidates = referenced & trusted_skin
    adjacency: list[list[int]] = [[] for _ in range(len(mesh.positions))]
    for face in faces[skin_faces]:
        for left, right in ((0, 1), (1, 2), (2, 0)):
            a, b = int(face[left]), int(face[right])
            if candidates[a] and candidates[b]:
                adjacency[a].append(b); adjacency[b].append(a)
    bridge_set = set(map(int, bridge)); seeded: set[int] = set()
    for face in faces[np.any(np.isin(faces, bridge), axis=1)]:
        seeded.update(int(vertex) for vertex in face if vertex not in bridge_set and candidates[vertex])
    if not seeded:
        return np.empty(0, dtype=np.int64)
    connected = set(seeded); pending = list(seeded)
    while pending:
        for neighbor in adjacency[pending.pop()]:
            if neighbor not in connected:
                connected.add(neighbor); pending.append(neighbor)
    return np.asarray(sorted(vertex for vertex in connected if vertex not in bridge_set),
                      dtype=np.int64)


def _masked_positions(positions: np.ndarray, surface: dict[str, Any]) -> np.ndarray:
    edges = surface["edges"]
    if not edges: return positions
    extra = np.asarray([positions[left] * (1 - alpha) + positions[right] * alpha
                        for left, right, alpha in edges])
    return np.concatenate((positions, extra))


def _ring_boundary_error(segments: np.ndarray, ring: np.ndarray, center: np.ndarray,
                         axis: np.ndarray, selected: np.ndarray | None = None
                         ) -> tuple[float, float, np.ndarray, np.ndarray]:
    """以 64 根角射线和 0.5 等值线段求交，返回完整三维误差。"""
    if len(segments) < SAMPLES // 2:
        return math.inf, math.inf, np.empty(0, int), np.empty(0)
    first = ring[0] - center; first -= axis * np.dot(first, axis)
    right = first / max(np.linalg.norm(first), 1e-12); front = np.cross(axis, right)
    ring_relative = ring - center
    if selected is None:
        picks, alphas = [], []
        for target_index, target in enumerate(ring_relative):
            direction = target - axis * np.dot(target, axis)
            direction /= np.linalg.norm(direction)
            ray = np.array([np.dot(direction, right), np.dot(direction, front)])
            candidates = []
            for segment_index, segment in enumerate(segments):
                start = segment[0] - center; end = segment[1] - center
                start_2d = np.array([np.dot(start, right), np.dot(start, front)])
                end_2d = np.array([np.dot(end, right), np.dot(end, front)])
                matrix = np.column_stack((ray, start_2d - end_2d))
                if abs(np.linalg.det(matrix)) < 1e-12: continue
                radius, alpha = np.linalg.solve(matrix, start_2d)
                if radius > 0 and -1e-7 <= alpha <= 1 + 1e-7:
                    point = segment[0] * (1 - alpha) + segment[1] * alpha
                    candidates.append((np.linalg.norm(point - ring[target_index]),
                                       segment_index, float(alpha)))
            if not candidates: raise ValueError("hideMask 等值边界缺少规范角射线交点")
            _, pick, alpha = min(candidates, key=lambda item: item[0])
            picks.append(pick); alphas.append(alpha)
        selected = np.asarray(picks, dtype=np.int64); alphas = np.asarray(alphas)
    else:
        selected, alphas = selected[:, 0].astype(np.int64), selected[:, 1]
    boundary = segments[selected, 0] * (1 - alphas[:, None]) + segments[selected, 1] * alphas[:, None]
    boundary_relative = boundary - center; ring_axial = ring_relative @ axis
    boundary_axial = boundary_relative @ axis
    boundary_radius = np.linalg.norm(boundary_relative - np.outer(boundary_axial, axis), axis=1)
    ring_radius = np.linalg.norm(ring_relative - np.outer(ring_axial, axis), axis=1)
    spatial_maximum = float(np.linalg.norm(boundary - ring, axis=1).max(initial=0))
    radial_maximum = float(np.abs(boundary_radius - ring_radius).max(initial=0))
    selection = np.column_stack((selected, alphas))
    return spatial_maximum, radial_maximum, selection, boundary


def _clip_points_below(points: np.ndarray, height: np.ndarray) -> np.ndarray:
    polygon = [(points[i], float(height[i])) for i in range(3)]; output = []
    for index, current in enumerate(polygon):
        previous = polygon[index - 1]; current_in, previous_in = current[1] <= 0, previous[1] <= 0
        if current_in != previous_in:
            alpha = previous[1] / (previous[1] - current[1])
            output.append(previous[0] * (1 - alpha) + current[0] * alpha)
        if current_in: output.append(current[0])
    return np.asarray(output, dtype=np.float64)


def render_preview(path: Path, template_glb: Any, template_mesh: Mesh, head_glb: Any, head_mesh: Mesh,
                   ring_center: np.ndarray, mask_path: Path, size: int = 500,
                   body_tint: Sequence[float] | None = None) -> None:
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
    check.save(path.with_name("self_check_preview.png"))


def seam_checks(template_glb: Any, template_mesh: Mesh, head_glb: Any, head_mesh: Mesh,
                template_points: np.ndarray, template_weights: Sequence[dict[str, float]],
                joint_slots: dict[str, int], groups: dict[str, np.ndarray], skeleton: dict[str, Any],
                ring_center: np.ndarray, ring_axis: np.ndarray, mask_path: Path) -> dict[str, Any]:
    template_skin, head_skin = template_glb.skin(), head_glb.skin()
    ring_joints = np.zeros((SAMPLES, 4), np.uint16); ring_weights = np.zeros((SAMPLES, 4), np.float32)
    for row, values in enumerate(template_weights):
        items = sorted(values.items(), key=lambda item: item[1], reverse=True)[:4]
        total = sum(value for _, value in items)
        for column, (name, value) in enumerate(items):
            ring_joints[row, column], ring_weights[row, column] = joint_slots[name], value / total
    visible_surface = _masked_surface(template_mesh, Image.open(mask_path).convert("L"))
    visible_faces = visible_surface["faces"]
    bind_all = _masked_positions(template_mesh.positions, visible_surface)
    bind_segments = bind_all[len(template_mesh.positions):].reshape(-1, 2, 3)
    ring_radius_min = float(np.linalg.norm(template_points - ring_center, axis=1).min())
    midpoint = bind_segments.mean(axis=1); bind_relative = midpoint - ring_center
    bind_axial = bind_relative @ ring_axis
    bind_radial = np.linalg.norm(bind_relative - np.outer(bind_axial, ring_axis), axis=1)
    boundary_filter = ((np.abs(bind_axial) < .02) & (bind_radial > ring_radius_min * .5)
                       & (bind_radial < ring_radius_min * 1.7))
    bind_segments = bind_segments[boundary_filter]
    mask_bind_error, mask_bind_radial, mask_boundary_ids, bind_boundary = _ring_boundary_error(
        bind_segments, template_points, ring_center, ring_axis)
    bridge_ids = groups["bridge"]; seam_ids = groups["seam"]
    top_ids, top_anchors = groups["topSeam"], groups["topAnchors"]
    # 裁定口径：脸/颅不参与；只计规范环以上 40 mm 的桥体，且运行时模板终止面
    # 之上已由遮罩丢弃，因此只有落回终止面以下的桥点才可能构成身体穿入。
    bridge_height = (head_mesh.positions[bridge_ids] - ring_center) @ ring_axis
    near_ids = bridge_ids[(bridge_height > 1e-7) & (bridge_height * skeleton["mPerMu"] <= .04)]
    threshold_m = .001
    maximum_gap = 0.; maximum_top_gap = 0.
    worst_near = {"ratio": 0., "clip": None, "frame": None, "count": 0}
    worst_hair = {"ratio": 0., "clip": None, "frame": None, "count": 0, "positionMu": None}
    penetration = {"bindVertices": 0, "idle": 0., "walk": 0., "run": 0.}
    above_cut_excluded = {"bind": 0, "idle": 0, "walk": 0, "run": 0}
    evaluated_vertices = {"bind": 0, "idle": 0, "walk": 0, "run": 0}
    hair_penetration = {"bind": 0., "idle": 0., "walk": 0., "run": 0.}
    sampled_frames = 0
    mask_dynamic_error = 0.; mask_worst = {"clip": None, "frame": None}
    # 标准口径的候选是最终 GLB 中实际被三角引用的颈桥 + 脸/颈皮肤。切面
    # 以上因身体已开口，符号距离无意义，只计入 aboveCutExcluded；切面以下
    # 不得再加半径过滤。共享底圈也纳入，并按真实距离自然判定。
    referenced = np.zeros(len(head_mesh.positions), dtype=bool)
    referenced[np.unique(head_mesh.indices)] = True
    final_classes = classify_vertices(head_glb, head_mesh, head_mesh.positions, joint_slots)
    hair_ids = np.flatnonzero(final_classes["hair"] & referenced)
    bridge_vertices = groups["bridge"][referenced[groups["bridge"]]]
    skin_vertices = _penetration_skin_vertices(
        head_mesh, final_classes["trustedSkin"], bridge_vertices)
    skin_bridge_ids = np.unique(np.concatenate((bridge_vertices, skin_vertices)))
    bind_height = (head_mesh.positions[skin_bridge_ids] - ring_center) @ ring_axis
    bind_below = bind_height < 0
    bind_scope_ids = skin_bridge_ids[bind_below]
    above_cut_excluded["bind"] = int(np.count_nonzero(~bind_below))
    evaluated_vertices["bind"] = int(len(bind_scope_ids))
    bind_normals = _vertex_normals(bind_all, visible_faces)
    bind_distances = _signed_distances(
        head_mesh.positions[bind_scope_ids], bind_all, visible_faces, bind_normals) * skeleton["mPerMu"]
    bind_penetrated = _bridge_penetration(
        bind_distances, head_mesh.positions[bind_scope_ids], ring_center, ring_axis, threshold_m)
    penetration["bindVertices"] = int(np.count_nonzero(bind_penetrated))
    penetration["bindDiagnostics"] = {
        "minimumMm": float(bind_distances.min(initial=0) * 1000),
        "evaluatedVertices": int(len(bind_scope_ids))}
    if len(hair_ids):
        hair_bind = _signed_distances(
            head_mesh.positions[hair_ids], bind_all, visible_faces, bind_normals) * skeleton["mPerMu"]
        hair_penetration["bind"] = float(np.count_nonzero(hair_bind < -threshold_m) / len(hair_ids))
    for clip in ("idle", "walk", "run"):
        animation = next((item for item in template_glb.json.get("animations", [])
                          if clip in item.get("name", "").lower()), None)
        if animation is None: raise ValueError(f"模板缺 {clip} 动画")
        ends = [float(np.asarray(template_glb.accessor(s["input"])).max(initial=0))
                for s in animation.get("samplers", [])]
        for frame, at in enumerate(np.linspace(0, max(ends, default=0), 24, endpoint=False)):
            world = _world_matrices(template_glb, animation, float(at))
            bone_world = world[np.asarray(template_skin.joints)]
            body = lbs(template_mesh.positions, template_mesh.joints, template_mesh.weights,
                       bone_world, template_skin.inverse_bind_matrices)
            body = _masked_positions(body, visible_surface)
            head = lbs(head_mesh.positions, head_mesh.joints, head_mesh.weights,
                       bone_world, head_skin.inverse_bind_matrices)
            ring = lbs(template_points, ring_joints, ring_weights, bone_world, template_skin.inverse_bind_matrices)
            _, _, ring_basis = np.linalg.svd(ring - ring.mean(axis=0), full_matrices=False)
            posed_ring_axis = ring_basis[-1]
            if np.dot(posed_ring_axis, ring_axis) < 0: posed_ring_axis = -posed_ring_axis
            neck_slot = joint_slots["mixamorig:Neck"]
            posed_cut_center, posed_cut_axis = _animated_cut_plane(
                ring_center, ring_axis, bone_world[neck_slot],
                template_skin.inverse_bind_matrices[neck_slot])
            maximum_gap = max(maximum_gap, float(np.linalg.norm(head[seam_ids] - ring, axis=1).max()))
            maximum_top_gap = max(maximum_top_gap, float(
                np.linalg.norm(head[top_ids] - head[top_anchors], axis=1).max()))
            boundary_segments = body[len(template_mesh.positions):].reshape(-1, 2, 3)[boundary_filter]
            # 绑定姿势选出的同一 64 个裁切边界点逐帧跟踪；轴向零点由规范环的
            # 同权重 LBS 结果给出，不能用动画后 PCA 平面代替非刚性环。
            _, _, _, selected_boundary = _ring_boundary_error(
                boundary_segments, ring, ring.mean(axis=0), posed_ring_axis, mask_boundary_ids)
            boundary_error = float(np.linalg.norm(selected_boundary - ring, axis=1).max())
            boundary_radial = 0.
            if boundary_error > mask_dynamic_error:
                mask_dynamic_error = boundary_error; mask_worst = {"clip": clip, "frame": frame}
            normals = _vertex_normals(body, visible_faces)
            bridge_distance = _signed_distances(
                head[near_ids], body, visible_faces, normals) * skeleton["mPerMu"]
            # 旧的“规范环以上 40 mm”诊断不属于标准四项；保留报告时也只可
            # 计终止面下方点，且共享开口处不判穿入。
            penetrated = _bridge_penetration(bridge_distance, head[near_ids], posed_cut_center,
                                             posed_cut_axis, threshold_m)
            near_count = int(np.count_nonzero(penetrated))
            near_ratio = near_count / len(near_ids)
            if near_ratio > worst_near["ratio"] or (near_count and worst_near["clip"] is None):
                worst_near = {"ratio": near_ratio, "clip": clip, "frame": frame, "count": near_count}
            posed_height = (head[skin_bridge_ids] - posed_cut_center) @ posed_cut_axis
            below = posed_height < 0
            scope_ids = skin_bridge_ids[below]
            skin_distance = _signed_distances(
                head[scope_ids], body, visible_faces, normals) * skeleton["mPerMu"]
            skin_penetrated = _bridge_penetration(
                skin_distance, head[scope_ids], posed_cut_center, posed_cut_axis, threshold_m)
            skin_ratio = float(np.count_nonzero(skin_penetrated) / max(len(scope_ids), 1))
            penetration[clip] = max(penetration[clip], skin_ratio)
            above_cut_excluded[clip] = max(above_cut_excluded[clip], int(np.count_nonzero(~below)))
            evaluated_vertices[clip] = min(
                evaluated_vertices[clip] or len(scope_ids), len(scope_ids))
            if len(hair_ids):
                hair_distance = _signed_distances(head[hair_ids], body, visible_faces, normals) * skeleton["mPerMu"]
                count = int(np.count_nonzero(hair_distance < -threshold_m)); ratio = count / len(hair_ids)
                if ratio > worst_hair["ratio"] or (count and worst_hair["clip"] is None):
                    point = head[hair_ids[int(np.argmin(hair_distance))]].tolist() if count else None
                    worst_hair = {"ratio": ratio, "clip": clip, "frame": frame,
                                  "count": count, "positionMu": point}
                hair_penetration[clip] = max(hair_penetration[clip], ratio)
            sampled_frames += 1
    return {"frames": sampled_frames, "ringMaxDiffMu": maximum_gap,
            "ringMaxDiffMm": maximum_gap * skeleton["mPerMu"] * 1000,
            "topMaxDiffMu": maximum_top_gap,
            "topMaxDiffMm": maximum_top_gap * skeleton["mPerMu"] * 1000,
            "maskBoundarySamples": int(len(bind_segments)),
            "maskBoundaryBindMaxDiffMm": mask_bind_error * skeleton["mPerMu"] * 1000,
            "maskBoundaryBindRadialMismatchMm": mask_bind_radial * skeleton["mPerMu"] * 1000,
            "maskBoundary72FramesMaxDiffMm": mask_dynamic_error * skeleton["mPerMu"] * 1000,
            "maskBoundaryWorst": mask_worst,
            "penetrationThresholdMm": threshold_m * 1000,
            "penetrationRatioNeckBridge": worst_near["ratio"],
            "penetrationNeckBridgeWorst": worst_near,
            "penetration": penetration, "penetrationHair": hair_penetration,
            "aboveCutExcluded": {**above_cut_excluded,
                "reason": "hideMask opens body above animated Neck cut; signed distance there is undefined"},
            "penetrationEvaluatedVertices": evaluated_vertices,
            "penetrationSkinBridgeVertices": int(len(skin_bridge_ids)),
            "penetrationRatioHair": worst_hair["ratio"],
            "penetrationHairWorst": worst_hair, "neckBridgeVertices": len(near_ids),
            "hairVertices": len(hair_ids)}


def _round(value: Any) -> Any:
    if isinstance(value, dict): return {key: _round(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)): return [_round(item) for item in value]
    if isinstance(value, np.ndarray): return _round(value.tolist())
    if isinstance(value, (np.floating, float)): return round(float(value), 9)
    if isinstance(value, (np.integer,)): return int(value)
    return value


def _write_manifest(out_dir: Path, npc_id: str, report: dict[str, Any], template_name: str) -> None:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary) / "assets"
        args = argparse.Namespace(kind="head", id=npc_id, src=out_dir,
                                  template=template_name, slot="body", item=None,
                                  asset_root=root, commit=False)
        ingest_asset(args)
        generated = yaml.safe_load((root / "heads" / npc_id / "manifest.yaml").read_text())[0]
    generated.update({"npc": npc_id, "experimental": True,
                      "gateLevel": report["gateLevel"],
                      "vertices": report["stats"]["vertices"],
                      "triangles": report["stats"]["triangles"]})
    files = {}
    for name in ("head.glb", "fit.json", "report.json", "hidemask.png",
                 "preview.png", "self_check_preview.png"):
        data = (out_dir / name).read_bytes()
        files[name] = {"sha256": sha256(data).hexdigest(), "bytes": len(data)}
    generated["files"] = files
    (out_dir / "manifest.yaml").write_text(
        yaml.safe_dump([generated], allow_unicode=True, sort_keys=False, width=120), encoding="utf-8")


def _head_report(report: dict[str, Any], diagnostics: dict[str, Any]) -> dict[str, Any]:
    """以 AR-109 的遮罩后身体口径重算标准四项 penetration 契约。"""
    report["checks"] = [item for item in report["checks"]
                          if not item["name"].startswith("penetration.")]
    seam = diagnostics["seam"]
    mask, topology = diagnostics["hideMask"], diagnostics["topology"]
    penetration = seam["penetration"]
    report["checks"] += [
        {"name": "penetration.bindVertices", "pass": penetration["bindVertices"] == 0,
         "value": penetration["bindVertices"], "threshold": 0,
         "scope": "neck bridge plus face/neck skin against hideMask-visible body"},
        *[{"name": f"penetration.{clip}", "pass": penetration[clip] <= .02,
           "value": penetration[clip], "threshold": "<= 0.02", "frames": 24,
           "scope": "neck bridge plus face/neck skin against hideMask-visible body"}
          for clip in ("idle", "walk", "run")],
        {"name": "head.seam72Frames", "pass": seam["ringMaxDiffMm"] < .5,
         "value": seam["ringMaxDiffMm"], "threshold": "< 0.5 mm", "frames": 72},
        {"name": "head.neckBridgePenetration",
         "pass": seam["penetrationRatioNeckBridge"] == 0,
         "value": seam["penetrationRatioNeckBridge"], "threshold": 0, "frames": 72},
        {"name": "head.hideMaskBoundary72Frames",
         "pass": seam["maskBoundary72FramesMaxDiffMm"] < .5,
         "value": seam["maskBoundary72FramesMaxDiffMm"],
         "threshold": "< 0.5 mm", "frames": 72},
        {"name": "head.hideMaskAbove",
         "pass": mask["aboveVisibleVertices"] == 0 and
                 mask["aboveVisibleTriangles"] == 0 and mask["belowRetainedTriangles"] > 0,
         "value": {key: mask[key] for key in ("aboveVisibleVertices",
                    "aboveVisibleTriangles", "belowRetainedTriangles")}, "threshold": 0},
        {"name": "head.oldNeckSkinTriangles",
         "pass": topology["oldNeckSkinTriangles"] == 0,
         "value": topology["oldNeckSkinTriangles"], "threshold": 0}]
    report.update({key: diagnostics[key] for key in
                   ("gateLevel", "stats", "seam", "bridge", "color", "measurements",
                    "cut", "hideMask", "topology")})
    report["penetrationHairReportOnly"] = seam["penetrationHair"]
    report["level"] = "draft" if diagnostics["gateLevel"] == "pass" and all(
        item["pass"] for item in report["checks"]) else "fail"
    return report


def refresh_preview_and_manifest(template_dir: Path, npc_id: str, out_dir: Path) -> None:
    """只刷新确定性的质检图，保留完整实跑诊断。"""
    template_glb = load_glb(template_dir / "body.glb"); template_mesh, _, _ = _world_mesh(template_glb)
    head_glb = load_glb(out_dir / "head.glb"); head_mesh, _, _ = _world_mesh(head_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text(encoding="utf-8"))
    names = [template_glb.json["nodes"][node].get("name", "") for node in template_glb.skin().joints]
    frame = _bone_frame(template_glb, {name: index for index, name in enumerate(names)})
    fit = json.loads((out_dir / "fit.json").read_text(encoding="utf-8"))
    render_preview(out_dir / "preview.png", template_glb, template_mesh, head_glb, head_mesh,
                   np.asarray(skeleton["neckRing"]["centerMu"]), out_dir / "hidemask.png",
                   body_tint=fit["skinTint"])


def process_head(source_path: Path, template_dir: Path, npc_id: str, out_dir: Path) -> dict[str, Any]:
    started = time.monotonic(); out_dir.mkdir(parents=True, exist_ok=True)
    source_glb = load_glb(source_path); source_mesh, source_positions, source_normals = _world_mesh(source_glb)
    template_glb = load_glb(template_dir / "body.glb"); template_mesh, _, _ = _world_mesh(template_glb)
    skeleton = json.loads((template_dir / "skeleton.json").read_text(encoding="utf-8"))
    source_names = [source_glb.json["nodes"][node].get("name", "") for node in source_glb.skin().joints]
    template_names = [template_glb.json["nodes"][node].get("name", "") for node in template_glb.skin().joints]
    source_slots, template_slots = ({name: index for index, name in enumerate(names)}
                                    for names in (source_names, template_names))
    ring = skeleton["neckRing"]
    ring_center = np.asarray(ring["centerMu"]); cut = cut_plane_from_bone_ratio(
        source_glb, source_slots, template_glb, template_slots, ring_center)
    section = actual_neck_section(template_mesh, skeleton, cut["template"], template_names)
    ring_points, ring_weights = section["points"], section["weights"]
    classified = classify_vertices(source_glb, source_mesh, source_positions, source_slots)
    measured = measure_head(source_positions, classified, cut["source"])
    target = target_head_measures(template_dir, skeleton); raw_scale, scale, scale_parts = head_scale(measured, target)
    transformed, _, _ = transform_head(source_positions, source_normals, cut, ring_center, scale)
    bridge = build_neck_bridge(source_positions, source_mesh.uvs, classified, cut, transformed,
                               ring_points, ring_weights, template_slots, template_mesh.positions,
                               template_mesh.regions, skeleton["regions"]["ids"]["neck"],
                               m_per_mu=skeleton["mPerMu"])
    selected_faces, used = select_head_faces(source_mesh, source_positions, cut, classified, bridge)
    source_height = (source_positions - cut["sourceCenter"]) @ cut["source"]["axis"]
    out_mesh, groups = combine_mesh(source_mesh, transformed, selected_faces, used, bridge,
                                    template_slots, classified, source_height, skeleton["regions"]["ids"],
                                    ring_center, cut["template"])
    source_colors, template_colors = vertex_colors(source_glb, source_mesh), vertex_colors(template_glb, template_mesh)
    matching = skin_match(source_colors, classified, source_positions, cut, template_colors, template_mesh, skeleton)
    source_image = _texture(source_glb); images: list[tuple[bytes, str]] = []
    material: dict[str, Any] = {}
    if source_image is not None:
        source_image = add_bridge_texture(source_image, out_mesh, bridge, groups["bridge"],
                                          np.asarray(matching["tintedTemplateSrgb"]))
        payload = io.BytesIO(); source_image.save(payload, format="JPEG", quality=90)
        images = [(payload.getvalue(), "image/jpeg")]; material["textureImage"] = 0
    temporary = out_dir / "head.raw.glb"; final_path = out_dir / "head.glb"
    write_skinned_glb(temporary, out_mesh, template_glb.skin(), material, images)
    texture_transform(temporary, final_path, 2048, 85, False); temporary.unlink()
    final_glb = load_glb(final_path); final_mesh, _, _ = _world_mesh(final_glb)
    groups = {key: value[value < len(final_mesh.positions)] for key, value in groups.items()
              if key != "stitchFaces"}
    groups["stitchFaces"] = np.arange(len(final_mesh.indices) // 3 - 2 * SAMPLES,
                                          len(final_mesh.indices) // 3)
    if final_mesh.regions is None or set(np.unique(final_mesh.regions)) != {
            skeleton["regions"]["ids"]["head"], skeleton["regions"]["ids"]["neck"]}:
        raise ValueError("head.glb 的 _REGION 未按 head/neck 写入")
    hide_mask = bake_hide_mask(out_dir / "hidemask.png", template_mesh, skeleton,
                               cut["template"]["axis"], ring_center)
    seam = seam_checks(template_glb, template_mesh, final_glb, final_mesh, ring_points, ring_weights,
                       template_slots, groups, skeleton, ring_center, cut["template"]["axis"],
                       out_dir / "hidemask.png")
    bridge_color = bridge_color_check(final_glb, final_mesh, bridge, groups, ring_center)
    render_preview(out_dir / "preview.png", template_glb, template_mesh, final_glb, final_mesh,
                   ring_center, out_dir / "hidemask.png", body_tint=matching["skinTint"])
    face_ratio_after = measured["chinMouthRatio"]
    source_radius, section_count = skin_section_radius(source_positions, classified["colors"],
                                                       classified["skin"], cut)
    radius_ratio_axes = {axis: source_radius[axis] / float(ring["radiusMu"][axis]) for axis in ("x", "z")}
    radius_ratio = math.sqrt(radius_ratio_axes["x"] * radius_ratio_axes["z"])
    residual = float(np.linalg.norm(final_mesh.positions[groups["seam"]] - ring_points, axis=1).max())
    final_surface = bridge_surface_from_mesh(
        final_mesh, skeleton["regions"]["ids"]["neck"], bridge["rings"])
    shape = bridge_shape_metrics(final_surface, bridge["bottomBelow"], bridge["upperAbove"],
                                 ring_center, cut["template"]["axis"], skeleton["mPerMu"])
    shape["biharmonicResidualMaxMu"] = biharmonic_residual(final_surface)
    shape.update(bridge["tangentScales"])
    final_skin = classify_vertices(final_glb, final_mesh, final_mesh.positions,
                                   template_slots)["trustedSkin"]
    old_neck_triangles = count_old_neck_skin_triangles(
        final_mesh, final_skin, skeleton["regions"]["ids"], ring_center, cut["template"])
    def input_record(path: Path) -> dict[str, Any]:
        return {"file": path.as_posix(), "sha256": sha256(path.read_bytes()).hexdigest()}
    fit = {"schema": "tianshu-dressup-fit.v1", "id": npc_id, "kind": "head",
           "npc": npc_id, "template": template_dir.name, "mPerMu": skeleton["mPerMu"],
           "source": input_record(source_path), "body": input_record(template_dir / "body.glb"),
           "ring": {"sourceRadiusMu": source_radius, "scale": scale, "residualMu": residual},
           "hideRegions": [], "hideMask": {"file": "hidemask.png", "size": HIDE_MASK_SIZE},
           "neverHide": [], "skinTint": matching["skinTint"],
           "weights": {"jointsAllowed": template_names},
           "deltaEBefore": matching["deltaEBefore"], "deltaE": matching["deltaE"]}
    (out_dir / "fit.json").write_text(json.dumps(_round(fit), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elapsed_ms = int((time.monotonic() - started) * 1000)
    width_ratio_after = measured["earWidthMu"] * scale / target["earWidthMu"]
    face_height_ratio_after = measured["faceHeightMu"] * scale / target["faceHeightMu"]
    overall_ratio_before = math.sqrt(
        measured["earWidthMu"] * measured["faceHeightMu"] /
        (target["earWidthMu"] * target["faceHeightMu"]))
    overall_ratio_after = overall_ratio_before * scale
    clamped = abs(raw_scale - scale) > 1e-9
    overall_deviation = abs(overall_ratio_after - 1)
    diagnostics = {"npc": npc_id,
              "cut": {"templateBoneFraction": cut["fraction"], "sourceCenterMu": cut["sourceCenter"],
                       "sourceSkinSectionPoints": section_count,
                       "sourceSkinSectionRadiusMu": source_radius, "sourceTemplateNeckRatio": radius_ratio,
                       "sourceTemplateNeckRatioAxes": radius_ratio_axes},
              "measurements": {"sourceEarWidthMu": measured["earWidthMu"],
                               "sourceFaceHeightMu": measured["faceHeightMu"],
                               "targetEarWidthMu": target["earWidthMu"],
                               "targetFaceHeightMu": target["faceHeightMu"], **scale_parts, "rawScale": raw_scale,
                               "scaleApplied": scale, "scaleClamped": clamped, "clamped": clamped,
                               "overallSizeRatioBefore": overall_ratio_before,
                               "overallSizeRatioAfter": overall_ratio_after,
                               "overallSizeDeviationRatio": overall_deviation,
                               "overallSizeGatePass": overall_deviation < .01 or clamped,
                               "widthRatioAfter": width_ratio_after,
                               "widthDeviationRatio": abs(width_ratio_after - 1),
                               "faceHeightRatioAfter": face_height_ratio_after,
                               "faceHeightDeviationRatio": abs(face_height_ratio_after - 1),
                               "individualMeasuresGate": "report-only",
                               "chinMouthRatioBefore": measured["chinMouthRatio"],
                               "chinMouthRatioAfter": face_ratio_after,
                               "chinMouthPreservation": face_ratio_after / measured["chinMouthRatio"]},
              "bridge": {"rings": bridge["rings"], "samples": SAMPLES,
                         "sourceValidSamples": bridge["validSamples"], "bottomSnapMaxMu": residual,
                         "bottomSnapMaxMm": residual * skeleton["mPerMu"] * 1000,
                         "skinDeltaEThreshold": SKIN_DELTA_E_MAX,
                         "outerRadiusFactor": NECK_OUTER_RADIUS_FACTOR, "solver": "biharmonic-periodic",
                         "dynamicClearanceMm": bridge["clearanceMm"],
                         "bodyTermination": "template-actual-section",
                         "abstractProfileMismatchMu": section["abstractMismatchMu"],
                         **shape}, "hideMask": hide_mask,
              "color": {**matching, "bridgeTop": bridge_color}, "seam": seam,
              "topology": {"headNeckCrossTriangles": int(np.count_nonzero(
                               np.any(final_mesh.regions[final_mesh.indices.reshape(-1, 3)] ==
                                      skeleton["regions"]["ids"]["head"], axis=1) &
                               np.any(final_mesh.regions[final_mesh.indices.reshape(-1, 3)] ==
                                      skeleton["regions"]["ids"]["neck"], axis=1))),
                           "stitchTriangles": len(groups["stitchFaces"]),
                           "topCutVertices": len(groups["topAnchors"]),
                           "oldNeckSkinTriangles": old_neck_triangles},
              "stats": {"vertices": len(final_mesh.positions), "triangles": len(final_mesh.indices) // 3,
                        "fileSize": final_path.stat().st_size, "durationMs": elapsed_ms}}
    pass_gate = (seam["ringMaxDiffMm"] < .01 and seam["topMaxDiffMm"] < .5
                 and seam["penetrationRatioNeckBridge"] == 0
                 and seam["maskBoundaryBindMaxDiffMm"] < .5
                 and seam["maskBoundary72FramesMaxDiffMm"] < .5
                 and matching["deltaE"] < 3 and bridge_color["maxDeltaE"] < 3
                 and (overall_deviation < .01 or clamped)
                 and residual * skeleton["mPerMu"] * 1000 < .01
                 and shape["tangentMaxDeg"] < 5 and shape["maxLocalBulgeMm"] < 1
                 and shape["maxRadiusTurningPoints"] <= 1
                 and shape["biharmonicResidualMaxMu"] < 1e-6
                 and seam["penetration"]["bindVertices"] == 0
                 and all(seam["penetration"][clip] <= .02 for clip in ("idle", "walk", "run"))
                 and hide_mask["aboveVisibleVertices"] == 0
                 and hide_mask["aboveVisibleTriangles"] == 0
                 and hide_mask["belowRetainedTriangles"] > 0
                 and old_neck_triangles == 0)
    diagnostics["gateLevel"] = "pass" if pass_gate else "fail"
    fit["diagnostics"] = _round(diagnostics)
    (out_dir / "fit.json").write_text(json.dumps(_round(fit), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report = validate_asset(template_dir / "body.glb", template_dir / "skeleton.json",
                            final_path, out_dir / "fit.json", "draft")
    report = _head_report(report, diagnostics)
    (out_dir / "report.json").write_text(json.dumps(_round(report), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    _write_manifest(out_dir, npc_id, report, template_dir.name)
    return _round({"gateLevel": diagnostics["gateLevel"], **diagnostics})


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path); parser.add_argument("--template", required=True, type=Path)
    parser.add_argument("--id", required=True); parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--refresh-preview", action="store_true", help="只从已有产物刷新质检图")
    args = parser.parse_args(argv)
    if args.refresh_preview:
        refresh_preview_and_manifest(args.template, args.id, args.out); return 0
    report = process_head(args.source, args.template, args.id, args.out)
    if args.json: print(json.dumps(report, ensure_ascii=False))
    else: print(f"{args.id}: {report['gateLevel']} · {report['stats']['vertices']} vertices")
    return 0 if report["gateLevel"] == "pass" else 2


if __name__ == "__main__": raise SystemExit(main())
