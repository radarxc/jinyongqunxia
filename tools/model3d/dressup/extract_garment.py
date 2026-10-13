#!/usr/bin/env python3
"""从 Tripo 蒙皮整身模型抽出衣服壳，并输出源/模板 bind 两种中间件。

分割只使用输入本身派生的证据：模板带符号距离、底板 Lab 色样和模板区域。
坐标与距离内部为 mu，报告距离按 skeleton.mPerMu 换算为 mm。
"""
from __future__ import annotations

import argparse
from collections import Counter, deque
from dataclasses import dataclass
from io import BytesIO
import hashlib
import json
import math
import os
from pathlib import Path
import resource
import sys
import time
from typing import Any, Sequence

_HERE = Path(__file__).resolve().parent
_removed = [(i, value) for i, value in enumerate(sys.path)
            if Path(value or os.getcwd()).resolve() == _HERE]
sys.path[:] = [value for value in sys.path
               if Path(value or os.getcwd()).resolve() != _HERE]
import inspect as _stdlib_inspect  # noqa: F401,E402
for _index, _value in _removed:
    sys.path.insert(min(_index, len(sys.path)), _value)

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt
from scipy.spatial import cKDTree

try:
    from .common import edge_statistics, umeyama
    from .fit_garment import (SurfaceIndex, _base_color, align_joints,
                              load_world_mesh, vertex_normals)
    from .glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb, write_skinned_glb
except ImportError:
    from common import edge_statistics, umeyama
    from fit_garment import (SurfaceIndex, _base_color, align_joints,
                             load_world_mesh, vertex_normals)
    from glb_io import GLBBuilder, Mesh, PrimitiveRange, load_glb, write_skinned_glb

DEFAULT_REGIONS = ("torsoUpper", "torsoLower", "hips", "upperArmL",
                   "upperArmR", "forearmL", "forearmR", "thighL", "thighR")
FORBIDDEN_REGIONS = {"head", "neck", "handL", "handR", "footL",
                     "footR", "shinL", "shinR"}
TORSO_STEMS = {"Hips", "Spine", "Spine1", "Spine2", "Neck",
               "LeftArm", "RightArm", "LeftUpLeg", "RightUpLeg"}
WRIST_STEMS = ("LeftHand", "RightHand")
FOOT_STEMS = ("LeftFoot", "RightFoot")


class ExtractError(ValueError):
    """输入或抽壳结果不满足契约。"""


@dataclass
class Evidence:
    region: np.ndarray
    geometry: np.ndarray
    color: np.ndarray
    signed_mu: np.ndarray
    distance_threshold_mu: float
    region_names: list[str]


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _portable(path: Path) -> str:
    parts = path.resolve().parts
    for marker in ("assets", "tools", "docs", "packages"):
        if marker in parts:
            return Path(*parts[parts.index(marker):]).as_posix()
    return path.name


def _round(value: Any) -> Any:
    if isinstance(value, float):
        return round(value, 9)
    if isinstance(value, list):
        return [_round(item) for item in value]
    if isinstance(value, dict):
        return {key: _round(item) for key, item in value.items()}
    return value


def _unit(vectors: np.ndarray) -> np.ndarray:
    value = np.asarray(vectors, dtype=np.float64)
    length = np.linalg.norm(value, axis=1, keepdims=True)
    return np.divide(value, length, out=np.zeros_like(value), where=length > 1e-12)


def _srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """D65 sRGB 转 CIE Lab；只依赖 NumPy，避免新增颜色库。"""
    value = np.asarray(rgb, dtype=np.float64) / 255.0
    linear = np.where(value <= 0.04045, value / 12.92, ((value + 0.055) / 1.055) ** 2.4)
    xyz = linear @ np.asarray([[0.4124564, 0.2126729, 0.0193339],
                               [0.3575761, 0.7151522, 0.1191920],
                               [0.1804375, 0.0721750, 0.9503041]])
    xyz /= np.asarray([0.95047, 1.0, 1.08883])
    delta = 6.0 / 29.0
    f = np.where(xyz > delta ** 3, np.cbrt(xyz), xyz / (3 * delta * delta) + 4.0 / 29.0)
    return np.column_stack((116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]),
                            200 * (f[:, 1] - f[:, 2])))


def plate_lab_samples(plate_path: Path, base_path: Path) -> tuple[np.ndarray, np.ndarray, dict[str, Any]]:
    """由同画布底板差异自动建立衣色/肤色样本。"""
    with Image.open(plate_path) as image:
        plate = np.asarray(image.convert("RGB"), dtype=np.uint8)
    with Image.open(base_path) as image:
        base = np.asarray(image.convert("RGB"), dtype=np.uint8)
    if plate.shape != base.shape:
        raise ExtractError("--plate 与 --base-plate 必须为同尺寸 RGB 画布")
    plate_lab = _srgb_to_lab(plate.reshape(-1, 3)); base_lab = _srgb_to_lab(base.reshape(-1, 3))
    delta = np.linalg.norm(plate_lab - base_lab, axis=1)
    neutral = np.asarray(base.reshape(-1, 3), dtype=np.float64)
    spread = neutral.max(axis=1) - neutral.min(axis=1)
    background = (neutral.mean(axis=1) > 205) & (spread < 30)
    foreground = ~background
    values = delta[foreground]
    if len(values) < 256:
        raise ExtractError("底板人物区不足，无法派生颜色样本")
    low, high = np.quantile(values, [0.35, 0.72])
    garment_mask = foreground & (delta >= high)
    # 身体底板与衣图上共同可见的头/手/脚提供最可靠肤色；未穿衣躯干因生成器
    # 光照略变，不可与真正肤色混作同权样本。
    ys = (np.broadcast_to(np.arange(plate.shape[0])[:, None], plate.shape[:2])
          / max(plate.shape[0] - 1, 1)).reshape(-1)
    skin_zone = (ys < 0.28) | ((ys > 0.36) & (ys < 0.60)) | (ys > 0.80)
    skin_mask = foreground & (delta <= low) & skin_zone
    # 每类均匀抽样，限制内存且保持确定性。
    def sample(mask: np.ndarray) -> np.ndarray:
        rows = plate_lab[mask]
        stride = max(1, len(rows) // 4096)
        return rows[::stride][:4096]
    garment, skin = sample(garment_mask), sample(skin_mask)
    if len(garment) < 64 or len(skin) < 64:
        raise ExtractError("底板 Lab 衣色/肤色样本不足")
    garment_rows = np.flatnonzero(garment_mask.reshape(plate.shape[:2]).any(axis=1))
    foreground_rows = np.flatnonzero(foreground.reshape(plate.shape[:2]).any(axis=1))
    body_y_floor = ((foreground_rows.max() - garment_rows.max())
                    / max(foreground_rows.max() - foreground_rows.min(), 1))
    stats = {"deltaEThresholds": {"skinMax": float(low), "garmentMin": float(high)},
             "garmentSamples": len(garment), "skinSamples": len(skin),
             "canvasPx": [int(plate.shape[1]), int(plate.shape[0])],
             "garmentVerticalRange": [float(garment_rows.min() / plate.shape[0]),
                                        float(garment_rows.max() / plate.shape[0])],
             "bodyYFloorFraction": float(body_y_floor)}
    return garment, skin, stats


def sample_base_color(source: Any, mesh: Mesh) -> np.ndarray:
    """按 glTF UV（原点左上，v 向下）双线性取 baseColor RGB。"""
    if mesh.uvs is None:
        raise ExtractError("整身网格缺 TEXCOORD_0，无法按贴图颜色分割")
    materials = source.json.get("materials", [])
    if not materials:
        raise ExtractError("整身 GLB 缺材质")
    texture_info = materials[0].get("pbrMetallicRoughness", {}).get("baseColorTexture")
    if not isinstance(texture_info, dict):
        raise ExtractError("整身材质缺 baseColorTexture")
    texture = source.json.get("textures", [])[int(texture_info["index"])]
    with Image.open(BytesIO(source.image(int(texture["source"])).data)) as image:
        array = np.asarray(image.convert("RGB"), dtype=np.float64)
    uv = np.asarray(mesh.uvs, dtype=np.float64)
    x = np.mod(uv[:, 0], 1.0) * (array.shape[1] - 1)
    # glTF 的 TEXCOORD_0 与 Pillow 像素行都是顶部为 0；这里不可再做 1-v。
    y = np.mod(uv[:, 1], 1.0) * (array.shape[0] - 1)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    x1 = np.minimum(x0 + 1, array.shape[1] - 1); y1 = np.minimum(y0 + 1, array.shape[0] - 1)
    fx = x - x0; fy = y - y0
    return ((1 - fx)[:, None] * (1 - fy)[:, None] * array[y0, x0]
            + fx[:, None] * (1 - fy)[:, None] * array[y0, x1]
            + (1 - fx)[:, None] * fy[:, None] * array[y1, x0]
            + fx[:, None] * fy[:, None] * array[y1, x1])


def classify_lab(rgb: np.ndarray, garment_samples: np.ndarray, skin_samples: np.ndarray) -> np.ndarray:
    """以底板两类 Lab 样本的近邻距离分类顶点颜色。"""
    lab = _srgb_to_lab(rgb)
    garment_distance = cKDTree(garment_samples).query(lab, workers=-1)[0]
    skin_distance = cKDTree(skin_samples).query(lab, workers=-1)[0]
    # 近黑衣纹理可离底板画风样本较远，但与肤色仍有巨大间隔；用距离比而非
    # 写死 RGB 常数，阴影肤色则因更接近 skin 样本被拒。
    return garment_distance < 0.80 * skin_distance


def _uv_island_labels(uvs: np.ndarray, faces: np.ndarray, width: int, height: int) -> tuple[np.ndarray, int]:
    """把衣物三角按共享边连通分成 UV 岛并光栅化：返回逐纹素岛编号（0 = 未被引用）与岛数。"""
    tri = np.asarray(faces, dtype=np.int64).reshape(-1, 3)
    if np.any(tri < 0) or np.any(tri >= len(uvs)):
        raise ExtractError("衣物索引越过 UV 数组")
    adjacency, _ = triangle_adjacency(tri)
    components = _components(np.ones(len(tri), dtype=bool), adjacency)
    island_map = Image.new("I", (width, height), 0); draw = ImageDraw.Draw(island_map)
    pixels = np.asarray(uvs, dtype=np.float64) * np.asarray([width, height]) - .5
    for island_id, component in enumerate(components, 1):
        for face_id in component:
            polygon = [(float(pixels[index, 0]), float(pixels[index, 1]))
                       for index in tri[int(face_id)]]
            draw.polygon(polygon, fill=island_id)
    return np.asarray(island_map, dtype=np.int32), len(components)


def _fill_from_nearest(rgb: np.ndarray, labels: np.ndarray, islands: int, bad: np.ndarray,
                       preferred: np.ndarray, fallback: np.ndarray) -> int:
    """逐岛把 bad 纹素换成同岛最近 preferred 纹素的颜色（岛内没有时用 fallback）；原位修改 rgb，返回替换数。"""
    replaced = 0
    for island_id in range(1, islands + 1):
        island = labels == island_id; target = island & bad
        if not np.any(target):
            continue
        good = island & preferred
        if not np.any(good):
            good = island & fallback
        if not np.any(good):
            continue
        rows, cols = np.nonzero(island); y0, y1 = rows.min(), rows.max() + 1
        x0, x1 = cols.min(), cols.max() + 1
        _, nearest = distance_transform_edt(~good[y0:y1, x0:x1], return_indices=True)
        local = target[y0:y1, x0:x1]; source_y, source_x = nearest[:, local]
        target_y, target_x = np.nonzero(local)
        rgb[y0 + target_y, x0 + target_x] = rgb[y0 + source_y, x0 + source_x]
        replaced += len(target_y)
    return replaced


def _skin_distance(rgb: np.ndarray, skin_lab_mean: np.ndarray) -> np.ndarray:
    lab = _srgb_to_lab(rgb.reshape(-1, 3)).reshape(rgb.shape[0], rgb.shape[1], 3)
    return np.linalg.norm(lab - np.asarray(skin_lab_mean)[None, None, :], axis=2)


def repair_skin_texels(image: Image.Image, uvs: np.ndarray, faces: np.ndarray,
                       skin_lab_mean: np.ndarray, threshold: float = 18.0, margin: float = 0.0
                       ) -> tuple[Image.Image, dict[str, Any]]:
    """只在衣物 UV 岛内，把接近源皮肤均值的纹素替换为最近布料色。

    margin > 0 时只从 Delta E 超过 threshold + margin 的布料纹素取色（岛内没有时退回任一非肤色纹素），
    免得填进去的是紧贴阈值的过渡色、有损编码后又落回阈值内。"""
    if threshold <= 0:
        raise ExtractError("skin Delta E 阈值必须大于零")
    if margin < 0:
        raise ExtractError("skin Delta E 余量不能为负")
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8).copy(); height, width = rgb.shape[:2]
    labels, islands = _uv_island_labels(uvs, faces, width, height); covered = labels > 0
    distance = _skin_distance(rgb, skin_lab_mean)
    skin = covered & (distance <= threshold); before = int(np.count_nonzero(skin))
    replaced = _fill_from_nearest(rgb, labels, islands, skin, distance > threshold + margin, ~skin)
    after = int(np.count_nonzero(covered & (_skin_distance(rgb, skin_lab_mean) <= threshold)))
    total = int(np.count_nonzero(covered))
    return Image.fromarray(rgb, "RGB"), {
        "method": "CIE-Lab-mean-deltaE+same-uv-island-nearest",
        "deltaEThreshold": float(threshold), "replacementMarginDeltaE": float(margin),
        "skinLabMean": np.asarray(skin_lab_mean).tolist(),
        "referencedTexels": total, "skinTexelsBefore": before, "skinTexelsAfter": after,
        "skinRatioBefore": before / total if total else 0.0,
        "skinRatioAfter": after / total if total else 0.0, "replacedTexels": replaced}


def repair_by_reference(image: Image.Image, reference: Image.Image, uvs: np.ndarray, faces: np.ndarray,
                        skin_lab_mean: np.ndarray, threshold: float = 18.0, margin: float = 6.0
                        ) -> tuple[Image.Image, dict[str, Any]]:
    """按来源修补：污染区由参考图（抽取件原贴图）判定，而不是看 image 当前的颜色。

    污染区 = 衣物纹素中参考图相对源皮肤均值 Delta E ≤ threshold + margin 的部分（含肤色与布料交界的过渡环）；
    这些纹素换成同一 UV 岛内最近的、参考图上 Delta E > threshold + 2 × margin 的纹素在 image 里的颜色。
    其余纹素逐字节不动。用于给贴图变体准备版型副本：版型清理后的填补色经颜色映射仍可能落在变体的浅色里。"""
    if threshold <= 0 or margin < 0:
        raise ExtractError("skin Delta E 阈值须大于零、余量不能为负")
    rgb = np.asarray(image.convert("RGB"), dtype=np.uint8).copy(); height, width = rgb.shape[:2]
    ref = np.asarray(reference.convert("RGB"), dtype=np.uint8)
    if ref.shape != rgb.shape:
        raise ExtractError(f"参考图尺寸 {ref.shape[:2]} 与贴图 {rgb.shape[:2]} 不一致")
    labels, islands = _uv_island_labels(uvs, faces, width, height); covered = labels > 0
    distance = _skin_distance(ref, skin_lab_mean)
    target = covered & (distance <= threshold + margin)
    replaced = _fill_from_nearest(rgb, labels, islands, target, distance > threshold + 2 * margin, ~target)
    total = int(np.count_nonzero(covered))
    return Image.fromarray(rgb, "RGB"), {
        "method": "reference-provenance+same-uv-island-nearest",
        "deltaEThreshold": float(threshold), "marginDeltaE": float(margin),
        "skinLabMean": np.asarray(skin_lab_mean).tolist(), "referencedTexels": total,
        "targetTexels": int(np.count_nonzero(target)), "replacedTexels": replaced}


def triangle_adjacency(faces: np.ndarray) -> tuple[list[np.ndarray], dict[tuple[int, int], list[int]]]:
    """按共享边构建三角邻接与边→面表。"""
    edges: dict[tuple[int, int], list[int]] = {}
    for face_id, face in enumerate(np.asarray(faces, dtype=np.int64)):
        for left, right in ((face[0], face[1]), (face[1], face[2]), (face[2], face[0])):
            edge = (int(min(left, right)), int(max(left, right)))
            edges.setdefault(edge, []).append(face_id)
    adjacency: list[list[int]] = [[] for _ in range(len(faces))]
    for owners in edges.values():
        if len(owners) == 2:
            adjacency[owners[0]].append(owners[1]); adjacency[owners[1]].append(owners[0])
    return [np.asarray(sorted(set(row)), dtype=np.int64) for row in adjacency], edges


def _components(mask: np.ndarray, adjacency: list[np.ndarray]) -> list[np.ndarray]:
    seen = np.zeros(len(mask), dtype=bool); result = []
    for start in np.flatnonzero(mask):
        if seen[start]:
            continue
        queue = [int(start)]; seen[start] = True; component = []
        while queue:
            current = queue.pop(); component.append(current)
            for other in adjacency[current]:
                if mask[int(other)] and not seen[int(other)]:
                    seen[int(other)] = True; queue.append(int(other))
        result.append(np.asarray(component, dtype=np.int64))
    return sorted(result, key=len, reverse=True)


def clean_triangle_mask(mask: np.ndarray, adjacency: list[np.ndarray], *,
                        majority_rounds: int = 2, island_min: int | None = None,
                        hole_max: int | None = None) -> tuple[np.ndarray, dict[str, int]]:
    """多数平滑、去小岛、补内洞；阈值按面数派生。"""
    result = np.asarray(mask, dtype=bool).copy(); before = int(result.sum())
    for _ in range(max(0, majority_rounds)):
        updated = result.copy()
        for index, neighbors in enumerate(adjacency):
            if len(neighbors) < 2:
                continue
            positives = int(result[neighbors].sum())
            if positives * 3 >= len(neighbors) * 2:
                updated[index] = True
            elif (len(neighbors) - positives) * 3 >= len(neighbors) * 2:
                updated[index] = False
        result = updated
    after_majority = int(result.sum())
    island_min = island_min if island_min is not None else max(4, len(mask) // 4000)
    removed = 0
    for component in _components(result, adjacency):
        if len(component) >= island_min:
            continue
        result[component] = False; removed += len(component)
    after_islands = int(result.sum())
    hole_max = hole_max if hole_max is not None else max(3, island_min // 2)
    filled = 0
    for component in _components(~result, adjacency):
        if len(component) > hole_max:
            continue
        boundary = {int(other) for face in component for other in adjacency[int(face)]
                    if result[int(other)]}
        if boundary:
            result[component] = True; filled += len(component)
    return result, {"initial": before, "afterMajority": after_majority,
                    "afterSmallIslands": after_islands, "final": int(result.sum()),
                    "removedSmallIslandTriangles": removed, "filledHoleTriangles": filled}


def build_evidence(aligned: Mesh, body: Mesh, body_regions: np.ndarray,
                   skeleton: dict[str, Any], keep_regions: Sequence[str],
                   color_vertices: np.ndarray) -> Evidence:
    """计算三项逐面证据；区域是硬约束，其余两项联合投票。"""
    if body.normals is None:
        raise ExtractError("模板 body 缺 NORMAL")
    faces = aligned.indices.reshape(-1, 3).astype(np.int64)
    centers = aligned.positions[faces].mean(axis=1)
    surface = SurfaceIndex(body.positions, body.indices.reshape(-1, 3), body.normals)
    nearest, bary, face_ids, distances = surface.query(centers)
    body_faces = body.indices.reshape(-1, 3)[face_ids]
    normal = _unit(np.einsum("ni,nij->nj", bary, body.normals[body_faces]))
    sign = np.sign(np.einsum("ij,ij->i", centers - nearest, normal)); sign[sign == 0] = 1
    signed = sign * distances
    nearest_vertices = body_faces[np.arange(len(body_faces)), np.argmax(bary, axis=1)]
    reverse = {int(value): name for name, value in skeleton["regions"]["ids"].items()}
    names = [reverse.get(int(value), f"unknown:{int(value)}")
             for value in body_regions[nearest_vertices]]
    allowed = set(keep_regions) - FORBIDDEN_REGIONS
    region = np.asarray([name in allowed for name in names], dtype=bool)
    allowed_distance = np.abs(signed[region])
    if not len(allowed_distance):
        raise ExtractError("允许区域没有可分割三角")
    # 衣壳应明显离开体表，但腰/袖贴身处仍需保留；阈值从允许区分布而非颜色常数派生。
    threshold = float(max(np.quantile(allowed_distance, 0.30), 0.001))
    geometry = (signed >= -0.001) & (np.abs(signed) >= threshold)
    color = np.count_nonzero(color_vertices[faces], axis=1) >= 2
    return Evidence(region, geometry, color, signed, threshold, names)


def segment_triangles(evidence: Evidence, faces: np.ndarray, positions: np.ndarray | None = None,
                      y_floor_mu: float | None = None) -> tuple[np.ndarray, dict[str, Any]]:
    """三项证据联合分割；区域硬限制，几何/颜色至少一项支持。"""
    # Lab 底板样本是衣/肤主判据；几何距离单列审计，避免贴身布因低于距离分位
    # 被打成孔洞。区域仍是不可越过的硬限制。
    topology_faces = faces
    if positions is not None:
        # Tripo 会在 UV seam 复制同位置顶点；按 1e-6 mu 焊接仅用于邻接，不改网格。
        quantized = np.rint(np.asarray(positions, dtype=np.float64) / 1e-6).astype(np.int64)
        _, welded = np.unique(quantized, axis=0, return_inverse=True)
        topology_faces = welded[np.asarray(faces, dtype=np.int64)]
    adjacency, _ = triangle_adjacency(topology_faces)
    initial = evidence.region & evidence.color
    # 颜色是主判据；邻接清理只去极小孤岛并补被误判成肤色的小洞。阈值随面数派生。
    island_min = max(4, len(faces) // 250)
    hole_max = max(3, len(faces) // 300)
    result, stages = clean_triangle_mask(initial, adjacency, majority_rounds=1,
                                         island_min=island_min, hole_max=hole_max)
    # 清理不得越过区域硬约束。
    result &= evidence.region
    stages["afterRegionConstraint"] = int(result.sum())
    # 深层候选只能整块剔除；逐面剔除会在交领/腰带的连续衣面凿出大孔。
    # 区域与颜色已经是硬条件，因此主连通衣壳中的深层面保留并单列审计。
    deep_inside = evidence.signed_mu < -max(3.0 * evidence.distance_threshold_mu, 0.015)
    stages["deepInsideCandidateTriangles"] = int(np.count_nonzero(result & deep_inside))
    components = _components(result, adjacency)
    removed_deep = 0
    for component in components[1:]:
        if np.count_nonzero(deep_inside[component]) * 2 < len(component):
            continue
        result[component] = False
        removed_deep += len(component)
    stages["afterDeepBodyShell"] = int(result.sum())
    stages["removedDeepBodyShellTriangles"] = removed_deep
    # 深层残壳移除后再去由其遗留的极小岛，不填新洞。
    component_min = max(4, len(faces) // 200)
    removed_after = 0
    for component in _components(result, adjacency):
        if len(component) < component_min:
            result[component] = False; removed_after += len(component)
    stages["removedPostDepthIslandTriangles"] = removed_after
    stages["final"] = int(result.sum())
    counts = {"region": int(evidence.region.sum()), "geometry": int(evidence.geometry.sum()),
              "color": int(evidence.color.sum()),
              "allThree": int((evidence.region & evidence.geometry & evidence.color).sum()),
              "regionAndGeometry": int((evidence.region & evidence.geometry).sum()),
              "regionAndColor": int((evidence.region & evidence.color).sum())}
    return result, {"evidenceTriangles": counts, "stages": stages}


def subset_mesh(mesh: Mesh, selected_faces: np.ndarray, positions: np.ndarray | None = None,
                normals: np.ndarray | None = None, *, keep_skin: bool = True) -> tuple[Mesh, np.ndarray]:
    """抽取三角子网格，返回网格及对应源顶点号。"""
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)[selected_faces]
    if not len(faces):
        raise ExtractError("分割结果为空")
    used = np.unique(faces); remap = np.full(len(mesh.positions), -1, dtype=np.int64)
    remap[used] = np.arange(len(used))
    def take(value: np.ndarray | None) -> np.ndarray | None:
        return None if value is None else np.asarray(value)[used].copy()
    out_positions = take(mesh.positions if positions is None else positions)
    out_normals = take(mesh.normals if normals is None else normals)
    result = Mesh(out_positions, remap[faces].reshape(-1).astype(np.uint32), out_normals,
                  take(mesh.uvs), take(mesh.joints) if keep_skin else None,
                  take(mesh.weights) if keep_skin else None, None, np.asarray([0]),
                  [PrimitiveRange(0, len(used), 0, faces.size, 0)], "ExtractedGarment")
    return result, used


def compact_indexed_mesh(mesh: Mesh, indices: np.ndarray, *, keep_skin: bool = True) -> Mesh:
    """按给定减面索引删除未引用顶点，属性逐行原值重排。"""
    source_indices = np.asarray(indices, dtype=np.int64).reshape(-1)
    used = np.unique(source_indices)
    if len(used) == 0 or int(used[-1]) >= len(mesh.positions):
        raise ExtractError("减面索引为空或越过源网格顶点")
    remap = np.full(len(mesh.positions), -1, dtype=np.int64); remap[used] = np.arange(len(used))
    def take(value: np.ndarray | None) -> np.ndarray | None:
        return None if value is None else np.asarray(value)[used].copy()
    return Mesh(take(mesh.positions), remap[source_indices].astype(np.uint32), take(mesh.normals),
                take(mesh.uvs), take(mesh.joints) if keep_skin else None,
                take(mesh.weights) if keep_skin else None, take(mesh.regions), np.asarray([0]),
                [PrimitiveRange(0, len(used), 0, len(source_indices), 0)], mesh.name)


def write_static_glb(path: Path, mesh: Mesh, material: dict[str, Any], images: list[Any]) -> None:
    """写无 skin 的模板 bind 空间 GLB。"""
    builder = GLBBuilder(); config = dict(material); image_ids = [builder.add_image(image) for image in images]
    texture_image = config.pop("textureImage", 0 if image_ids else None)
    if texture_image is not None:
        sampler = builder.add_sampler(); config["base_color_texture"] = builder.add_texture(
            image_ids[int(texture_image)], sampler_index=sampler)
    material_id = builder.add_material(**config)
    mesh.primitives = [PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices), material_id)]
    mesh.material_indices = np.asarray([material_id]); mesh_index = builder.add_mesh(mesh)
    node = builder.add_node(name=mesh.name or "ExtractedGarmentAligned", mesh=mesh_index)
    builder.add_scene([node], name="ExtractedGarmentScene"); builder.write(path)


def _welded_topology(positions: np.ndarray, faces: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """按位置焊 UV seam，返回焊后点、面和原点到焊点映射。"""
    points = np.asarray(positions, dtype=np.float64)
    quantized = np.rint(points / 1e-6).astype(np.int64)
    _, inverse = np.unique(quantized, axis=0, return_inverse=True)
    welded = np.zeros((int(inverse.max(initial=-1)) + 1, 3), dtype=np.float64)
    counts = np.bincount(inverse); np.add.at(welded, inverse, points)
    welded /= np.maximum(counts[:, None], 1)
    return welded, inverse[np.asarray(faces, dtype=np.int64)], inverse


def _boundary_cycles(positions: np.ndarray, faces: np.ndarray) -> tuple[list[dict[str, Any]], int, int]:
    """返回焊接拓扑的闭合边界环、开放链数和边界边数。"""
    _, edges = triangle_adjacency(faces)
    boundary = [edge for edge, owners in edges.items() if len(owners) == 1]
    graph: dict[int, list[int]] = {}
    for left, right in boundary:
        graph.setdefault(left, []).append(right); graph.setdefault(right, []).append(left)
    seen: set[tuple[int, int]] = set(); cycles: list[dict[str, Any]] = []; chains = 0
    for edge in sorted(boundary):
        if edge in seen or (edge[1], edge[0]) in seen:
            continue
        start = edge[0]; current = start; vertices = [start]; length = 0.0; closed = False
        for _ in range(len(boundary) + 1):
            options = [value for value in graph[current]
                       if (current, value) not in seen and (value, current) not in seen]
            if not options:
                break
            nxt = min(options); seen.add((current, nxt))
            length += float(np.linalg.norm(positions[current] - positions[nxt]))
            current = nxt; vertices.append(current)
            if current == start:
                closed = True; break
        if closed and len(vertices) >= 4:
            ids = np.asarray(vertices[:-1], dtype=np.int64); points = positions[ids]
            cycles.append({"vertexIds": ids, "vertices": len(ids), "lengthMu": length,
                           "centerMu": points.mean(axis=0).tolist()})
        else:
            chains += 1
    cycles.sort(key=lambda row: (-row["centerMu"][1], -row["lengthMu"]))
    return cycles, chains, len(boundary)


def _semantic_cycle_indices(cycles: Sequence[dict[str, Any]], positions: np.ndarray) -> list[tuple[str, int]]:
    """从原始孔洞中稳定选出领口、双袖口和主下摆。"""
    if not cycles:
        return []
    maximum = max(float(row["lengthMu"]) for row in cycles)
    meaningful = [index for index, row in enumerate(cycles)
                  if row["vertices"] >= 4 and row["lengthMu"] >= max(.02, .02 * maximum)]
    if len(meaningful) < 4:
        return [(f"opening{order + 1}", index) for order, index in enumerate(meaningful)]
    centers = np.asarray([row["centerMu"] for row in cycles], dtype=float)
    width = float(np.ptp(positions[:, 0])); remaining = set(meaningful)
    central = [index for index in remaining if abs(centers[index, 0]) <= max(.15 * width, 1e-6)]
    collar = max(central or list(remaining), key=lambda index: centers[index, 1])
    remaining.remove(collar)
    left = max(remaining, key=lambda index: centers[index, 0]); remaining.remove(left)
    right = min(remaining, key=lambda index: centers[index, 0]); remaining.remove(right)
    # 真下摆通常是除领袖外周长最大的环；开衩底端的小孔不能冒充下摆。
    lower = [index for index in remaining if centers[index, 1] < centers[collar, 1]] or list(remaining)
    hem = max(lower, key=lambda index: float(cycles[index]["lengthMu"]))
    return [("collar", collar), ("sleeveL", left), ("sleeveR", right), ("hem", hem)]


def _ear_clip(points: np.ndarray) -> list[tuple[int, int, int]]:
    """把近似平面的简单边界环耳切成三角，不新增顶点。"""
    centered = np.asarray(points, dtype=np.float64) - np.mean(points, axis=0)
    _, _, axes = np.linalg.svd(centered, full_matrices=False)
    planar = centered @ axes[:2].T
    def cross2(left: np.ndarray, right: np.ndarray) -> np.ndarray:
        return left[..., 0] * right[..., 1] - left[..., 1] * right[..., 0]
    area = sum(cross2(planar[i], planar[(i + 1) % len(planar)]) for i in range(len(planar)))
    order = list(range(len(planar))) if area > 0 else list(reversed(range(len(planar))))
    triangles: list[tuple[int, int, int]] = []
    while len(order) > 3:
        for cursor, current in enumerate(order):
            before, after = order[cursor - 1], order[(cursor + 1) % len(order)]
            a, b, c = planar[before], planar[current], planar[after]
            if cross2(b - a, c - b) <= 1e-12:
                continue
            cross = cross2(c - a, planar[order] - a)
            inside = ((cross2(b - a, planar[order] - a) >= -1e-12)
                      & (cross2(c - b, planar[order] - b) >= -1e-12)
                      & (cross <= 1e-12))
            inside[[order.index(value) for value in (before, current, after)]] = False
            if np.any(inside):
                continue
            triangles.append((before, current, after)); order.pop(cursor); break
        else:
            raise ExtractError("额外孔洞边界无法稳定三角化")
    triangles.append(tuple(order))
    return triangles


def clean_opening_edges(selected: np.ndarray, faces: np.ndarray, positions: np.ndarray,
                        vertex_rgb: np.ndarray, garment_samples: np.ndarray | None = None,
                        skin_samples: np.ndarray | None = None) -> tuple[np.ndarray, dict[str, Any]]:
    """删除边界齿片与肤色切边三角，不越过既有分割结果。"""
    result = np.asarray(selected, dtype=bool).copy(); face_ids = np.flatnonzero(result)
    welded, welded_faces, _ = _welded_topology(positions, faces)
    selected_faces = welded_faces[face_ids]
    _, edge_owners = triangle_adjacency(selected_faces)
    boundary = {edge for edge, owners in edge_owners.items() if len(owners) == 1}
    boundary_vertices = {value for edge in boundary for value in edge}
    edge_counts = np.zeros(len(face_ids), dtype=np.uint8)
    near_boundary = np.zeros(len(face_ids), dtype=bool)
    for local, face in enumerate(selected_faces):
        edges = (tuple(sorted((int(face[0]), int(face[1])))),
                 tuple(sorted((int(face[1]), int(face[2])))),
                 tuple(sorted((int(face[2]), int(face[0])))))
        edge_counts[local] = sum(edge in boundary for edge in edges)
        near_boundary[local] = any(int(value) in boundary_vertices for value in face)
    teeth = edge_counts >= 2
    skin_edge = np.zeros(len(face_ids), dtype=bool)
    if garment_samples is not None and skin_samples is not None:
        centroid_rgb = np.asarray(vertex_rgb, dtype=np.float64)[faces[face_ids]].mean(axis=1)
        skin_edge = near_boundary & ~classify_lab(centroid_rgb, garment_samples, skin_samples)
    remove_local = teeth | skin_edge
    result[face_ids[remove_local]] = False
    # 剔边后不得留下单面齿屑；只删极小孤岛，不吞腰带/垂带等有效附件。
    cleaned_faces = welded_faces[np.flatnonzero(result)]
    cleaned_adjacency, _ = triangle_adjacency(cleaned_faces)
    removed_islands = 0
    for component in _components(np.ones(len(cleaned_faces), dtype=bool), cleaned_adjacency):
        if len(component) < 4:
            original_ids = np.flatnonzero(result)[component]
            result[original_ids] = False; removed_islands += len(component)
    return result, {"beforeTriangles": len(face_ids),
                    "boundaryAdjacentTriangles": int(near_boundary.sum()),
                    "twoBoundaryEdgeTriangles": int(teeth.sum()),
                    "skinColorBoundaryTriangles": int(skin_edge.sum()),
                    "overlapTriangles": int((teeth & skin_edge).sum()),
                    "removedTinyIslandTriangles": removed_islands,
                    "removedTriangles": int(remove_local.sum()) + removed_islands,
                    "afterTriangles": int(result.sum()),
                    "weldedVertices": len(welded)}


def fill_internal_holes(selected: np.ndarray, faces: np.ndarray, positions: np.ndarray,
                        allowed: np.ndarray | None = None) -> tuple[np.ndarray, dict[str, Any]]:
    """从源整身网格补回被分割凿出的有限面块，保留四个外部开口。"""
    result = np.asarray(selected, dtype=bool).copy()
    quantized = np.rint(np.asarray(positions, dtype=np.float64) / 1e-6).astype(np.int64)
    _, inverse = np.unique(quantized, axis=0, return_inverse=True)
    topology_faces = inverse[np.asarray(faces, dtype=np.int64)]
    adjacency, _ = triangle_adjacency(topology_faces)
    maximum = max(4, len(faces) // 200)
    allowed_mask = np.ones(len(faces), dtype=bool) if allowed is None else np.asarray(allowed, dtype=bool)
    filled: list[int] = []
    for component in _components(~result, adjacency):
        if len(component) > maximum:
            continue
        if not np.all(allowed_mask[component]):
            continue
        boundary = {int(other) for face in component for other in adjacency[int(face)]
                    if result[int(other)]}
        if not boundary:
            continue
        # 真开口通向大补集；封闭的小补集才是分割造成的孔洞。
        result[component] = True
        filled.append(len(component))
    return result, {"filledComponents": len(filled), "filledTriangles": sum(filled),
                    "componentTriangles": sorted(filled, reverse=True),
                    "maximumComponentTriangles": maximum}


def cap_nonsemantic_openings(mesh: Mesh) -> tuple[Mesh, dict[str, Any]]:
    """封闭领/双袖/下摆之外的破损环；不新增点，不改属性。"""
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    welded, welded_faces, inverse = _welded_topology(mesh.positions, faces)
    cycles, chains, _ = _boundary_cycles(welded, welded_faces)
    if chains:
        raise ExtractError("衣壳边界存在开放链，不能自动封口")
    semantic = {index for _, index in _semantic_cycle_indices(cycles, welded)}
    representative = np.full(len(welded), -1, dtype=np.int64)
    for source, target in enumerate(inverse):
        if representative[target] < 0:
            representative[target] = source
    added: list[np.ndarray] = []; per_loop: list[int] = []
    for index, cycle in enumerate(cycles):
        if index in semantic:
            continue
        ids = np.asarray(cycle["vertexIds"], dtype=np.int64)
        triangles = np.asarray(_ear_clip(welded[ids]), dtype=np.int64)
        added.append(representative[ids[triangles]])
        per_loop.append(len(triangles))
    if not added:
        return mesh, {"cappedLoops": 0, "addedTriangles": 0, "loopTriangles": []}
    combined = np.concatenate((faces, *added), axis=0).astype(np.uint32)
    result = Mesh(mesh.positions, combined.reshape(-1), vertex_normals(mesh.positions, combined).astype(np.float32),
                  mesh.uvs, mesh.joints, mesh.weights, mesh.regions, mesh.material_indices,
                  [PrimitiveRange(0, len(mesh.positions), 0, combined.size, 0)], mesh.name)
    return result, {"cappedLoops": len(added), "addedTriangles": sum(per_loop),
                    "loopTriangles": per_loop}


def smooth_opening_edges(mesh: Mesh, m_per_mu: float, *, blend: float = .5,
                         maximum_mm: float = 2.0) -> tuple[Mesh, dict[str, Any]]:
    """只在四个语义开口环做一次限幅环向平滑，UV seam 同点同移。"""
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    welded, welded_faces, inverse = _welded_topology(mesh.positions, faces)
    cycles, _, _ = _boundary_cycles(welded, welded_faces)
    selection = _semantic_cycle_indices(cycles, welded)
    target = welded.copy(); maximum_mu = maximum_mm / 1000.0 / m_per_mu
    moved: set[int] = set(); per_opening: dict[str, int] = {}
    for name, index in selection:
        ids = np.asarray(cycles[index]["vertexIds"], dtype=np.int64)
        if len(ids) < 4:
            continue
        proposed = (1.0 - blend) * welded[ids] + blend * .5 * (
            welded[np.roll(ids, 1)] + welded[np.roll(ids, -1)])
        delta = proposed - welded[ids]; length = np.linalg.norm(delta, axis=1)
        scale = np.minimum(1.0, maximum_mu / np.maximum(length, 1e-12))
        target[ids] = welded[ids] + delta * scale[:, None]
        moved.update(int(value) for value in ids); per_opening[name] = len(ids)
    positions = target[inverse].astype(np.float32)
    result = Mesh(positions, mesh.indices.copy(), vertex_normals(positions, faces).astype(np.float32),
                  mesh.uvs, mesh.joints, mesh.weights, mesh.regions, mesh.material_indices,
                  mesh.primitives, mesh.name)
    displacement = np.linalg.norm(positions.astype(np.float64) - mesh.positions, axis=1)
    return result, {"method": "semantic-loop-laplacian-clamped",
                    "openingVertexCounts": per_opening, "weldedVerticesMoved": len(moved),
                    "sourceVerticesMoved": int(np.count_nonzero(displacement > 0)),
                    "maxDisplacementMm": float(displacement.max(initial=0) * m_per_mu * 1000),
                    "blend": blend, "clampMm": maximum_mm}


def boundary_loops(positions: np.ndarray, faces: np.ndarray) -> dict[str, Any]:
    """统计流形边界环；开放链单列，避免把碎片误报成领/袖/下摆。"""
    welded, welded_faces, _ = _welded_topology(positions, faces)
    welded_faces = welded_faces[np.all(np.diff(np.sort(welded_faces, axis=1), axis=1) != 0, axis=1)]
    cycles, chains, boundary_edges = _boundary_cycles(welded, welded_faces)
    selection = _semantic_cycle_indices(cycles, welded)
    semantic = [{"name": name, **{key: value for key, value in cycles[index].items()
                                      if key != "vertexIds"}} for name, index in selection]
    loops = [{key: value for key, value in row.items() if key != "vertexIds"} for row in cycles]
    return {"count": len(loops), "loops": loops,
            "semanticOpenings": semantic, "openChains": chains,
            "boundaryEdges": boundary_edges}


def require_four_openings(openings: dict[str, Any]) -> None:
    """真实边界门禁；语义命名不能掩盖额外孔洞或开放链。"""
    if openings["count"] != 4 or openings["openChains"] != 0:
        raise ExtractError("衣壳真实拓扑必须恰有领口、双袖口、下摆四个闭合边界环")
    if len(openings["semanticOpenings"]) != 4:
        raise ExtractError("四个真实边界环无法完整命名为领口、双袖口和下摆")


def coverage_area(faces: np.ndarray, positions: np.ndarray, region_names: Sequence[str],
                  selected: np.ndarray) -> dict[str, float]:
    triangles = positions[faces]
    area = 0.5 * np.linalg.norm(np.cross(triangles[:, 1] - triangles[:, 0],
                                         triangles[:, 2] - triangles[:, 0]), axis=1)
    result = {}
    for name in sorted(set(region_names)):
        mask = np.asarray([value == name for value in region_names])
        denominator = float(area[mask].sum())
        result[name] = float(area[mask & selected].sum() / denominator) if denominator > 0 else 0.0
    return result


def alignment_summary(source: Any, skeleton: dict[str, Any], align: dict[str, Any]) -> dict[str, Any]:
    """把关节残差按躯干/腕/脚拆开，并换算成 %H。"""
    source_skin = source.skin(); source_nodes = {source.json["nodes"][node].get("name", ""): node
                                                 for node in source_skin.joints}
    target_names = set(skeleton["joints"]); height = float(skeleton["heightMu"])
    coarse_residual = {name: float(value) for name, value in align.get("residualMu", {}).items()}
    def residuals(stems: Sequence[str]) -> dict[str, float]:
        names = [name for name in target_names if name.split(":")[-1] in stems and name in source_nodes]
        if not names:
            return {}
        src = np.asarray([source.world_matrix(source_nodes[name])[:3, 3] for name in names])
        dst = np.asarray([np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T[:3, 3] for name in names])
        torso_names = list(coarse_residual)
        torso_src = np.asarray([source.world_matrix(source_nodes[name])[:3, 3] for name in torso_names])
        torso_dst = np.asarray([np.asarray(skeleton["bindWorld"][name]).reshape(4, 4).T[:3, 3]
                               for name in torso_names])
        fit = umeyama(torso_src, torso_dst, allow_mirror=False)
        moved = fit.scale * (src @ fit.rotation.T) + fit.translation
        return {name: float(np.linalg.norm(a - b)) for name, a, b in zip(names, moved, dst)}
    wrists = residuals(WRIST_STEMS); feet = residuals(FOOT_STEMS)
    def stats(values: dict[str, float]) -> dict[str, Any]:
        rows = np.asarray(list(values.values()), dtype=float)
        return {"perJointMu": values, "rmsMu": float(np.sqrt(np.mean(rows * rows))) if len(rows) else None,
                "rmsPercentH": float(100 * np.sqrt(np.mean(rows * rows)) / height) if len(rows) else None,
                "maxPercentH": float(100 * rows.max() / height) if len(rows) else None}
    return {"torso": stats(coarse_residual), "wrists": stats(wrists), "feet": stats(feet)}


def _qc_image(body: Mesh, garment: Mesh, *, back: bool = False, size: int = 768) -> Image.Image:
    """Pillow 正交软光栅：灰模板轮廓、蓝衣壳。"""
    all_points = np.concatenate((body.positions, garment.positions))
    x = -all_points[:, 0] if back else all_points[:, 0]; y = all_points[:, 1]
    margin = 40.0; scale = min((size - 2 * margin) / max(float(np.ptp(x)), 1e-9),
                               (size - 2 * margin) / max(float(np.ptp(y)), 1e-9))
    center_x = float((x.min() + x.max()) * 0.5); min_y = float(y.min())
    def projected(points: np.ndarray) -> np.ndarray:
        px = (-points[:, 0] if back else points[:, 0] - 0.0)
        return np.column_stack(((px - center_x) * scale + size / 2,
                                size - margin - (points[:, 1] - min_y) * scale))
    image = Image.new("RGB", (size, size), (247, 245, 240)); pixels = ImageDraw.Draw(image, "RGBA")
    for mesh, fill, outline in ((body, (145, 145, 145, 70), (90, 90, 90, 80)),
                                (garment, (48, 112, 170, 205), (23, 65, 105, 230))):
        faces = mesh.indices.reshape(-1, 3).astype(np.int64); points = projected(mesh.positions)
        depths = mesh.positions[faces, 2].mean(axis=1)
        # Painter 顺序必须远到近；本资产正面为 +Z，最后绘制最大 Z。
        order = np.argsort(-depths if back else depths)
        stride = max(1, len(order) // 70000)
        for face_id in order[::stride]:
            polygon = [tuple(points[index]) for index in faces[face_id]]
            pixels.polygon(polygon, fill=fill, outline=outline)
    return image


def render_qc(path: Path, body: Mesh, garment: Mesh, *, back: bool = False, size: int = 768) -> None:
    """保存模板与衣壳的前/后视质检图。"""
    _qc_image(body, garment, back=back, size=size).save(path)


def render_edges_detail(path: Path, body: Mesh, before: Mesh, after: Mesh) -> None:
    """保存开口清理前后并排细节，覆盖领口、袖口与下摆。"""
    panels: list[Image.Image] = []
    for label, mesh in (("BEFORE", before), ("AFTER", after)):
        source = _qc_image(body, mesh, size=640)
        # 裁去头顶与小腿，放大四个开口所在的上半身；标签只用 ASCII 保证字体可用。
        crop = source.crop((70, 75, 570, 470)).resize((750, 592), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (750, 640), (247, 245, 240)); canvas.paste(crop, (0, 48))
        ImageDraw.Draw(canvas).text((24, 14), label, fill=(30, 30, 30))
        panels.append(canvas)
    result = Image.new("RGB", (1500, 640), (247, 245, 240))
    result.paste(panels[0], (0, 0)); result.paste(panels[1], (750, 0)); result.save(path)


def render_color_qc(path: Path, mesh: Mesh, colors: np.ndarray, *, size: int = 768) -> None:
    """把逐顶点 baseColor 采样软光栅成正视图，供人工核对 UV 方向。"""
    points3 = np.asarray(mesh.positions, dtype=np.float64)
    x = points3[:, 0]; y = points3[:, 1]; margin = 40.0
    scale = min((size - 2 * margin) / max(float(np.ptp(x)), 1e-9),
                (size - 2 * margin) / max(float(np.ptp(y)), 1e-9))
    points = np.column_stack(((x - float((x.min() + x.max()) * .5)) * scale + size / 2,
                              size - margin - (y - float(y.min())) * scale))
    image = Image.new("RGB", (size, size), (247, 245, 240)); draw = ImageDraw.Draw(image)
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    # 正面为 +Z：先画背面的小 Z，再画靠镜头的大 Z。
    order = np.argsort(points3[faces, 2].mean(axis=1))
    stride = max(1, len(order) // 90000)
    rgb = np.clip(np.rint(np.asarray(colors, dtype=np.float64)), 0, 255).astype(np.uint8)
    for face_id in order[::stride]:
        face = faces[face_id]; fill = tuple(int(value) for value in rgb[face].mean(axis=0))
        draw.polygon([tuple(points[index]) for index in face], fill=fill)
    image.save(path)


def extract_file(dressed_path: Path, body_path: Path, skeleton_path: Path, slot: str,
                 asset_id: str, output_dir: Path, *, plate_path: Path | None = None,
                 base_plate_path: Path | None = None, keep_regions: Sequence[str] = DEFAULT_REGIONS) -> dict[str, Any]:
    started = time.perf_counter()
    if slot != "body":
        raise ExtractError("首件抽壳仅支持 --slot body")
    if bool(plate_path) != bool(base_plate_path):
        raise ExtractError("--plate 与 --base-plate 必须成对提供")
    skeleton = json.loads(skeleton_path.read_text(encoding="utf-8"))
    unknown = set(keep_regions) - set(skeleton["regions"]["ids"]); forbidden = set(keep_regions) & FORBIDDEN_REGIONS
    if unknown or forbidden:
        raise ExtractError(f"--keep-regions 含未知/禁区：{sorted(unknown | forbidden)}")
    source_glb = load_glb(dressed_path); source = load_world_mesh(source_glb, skinned_only=True)
    body_glb = load_glb(body_path); body = load_world_mesh(body_glb, skinned_only=True)
    if source.joints is None or source.weights is None or source.normals is None:
        raise ExtractError("整身源件必须含 NORMAL / JOINTS_0 / WEIGHTS_0")
    aligned_positions, aligned_normals, align, mapping = align_joints(
        source.positions, source.normals, source_glb, skeleton, source.joints, source.weights)
    aligned_normals = (vertex_normals(aligned_positions, source.indices.reshape(-1, 3))
                       if aligned_normals is None else aligned_normals)
    aligned = Mesh(aligned_positions, source.indices.copy(), aligned_normals.astype(np.float32),
                   source.uvs, source.joints, source.weights, None, source.material_indices,
                   source.primitives, source.name)
    garment_samples: np.ndarray | None = None; skin_samples: np.ndarray | None = None
    if plate_path is not None and base_plate_path is not None:
        garment_samples, skin_samples, plate_stats = plate_lab_samples(plate_path, base_plate_path)
        sampled_rgb = sample_base_color(source_glb, source)
        color_vertices = classify_lab(sampled_rgb, garment_samples, skin_samples)
    else:
        # 无底板时只对允许区域中相对较暗的一簇作数据驱动二分；合成测试可走此路径。
        sampled_rgb = sample_base_color(source_glb, source); lightness = _srgb_to_lab(sampled_rgb)[:, 0]
        threshold = float(np.median(lightness)); color_vertices = lightness < threshold
        plate_stats = {"fallback": "texture-L-median", "lightnessMedian": threshold}
    body_regions = np.load(skeleton_path.parent / skeleton["regions"]["file"])
    evidence = build_evidence(aligned, body, body_regions, skeleton, keep_regions, color_vertices)
    faces = source.indices.reshape(-1, 3).astype(np.int64)
    y_floor = (float(np.min(aligned_positions[:, 1]))
               + float(plate_stats.get("bodyYFloorFraction", 0.0)) * float(np.ptp(aligned_positions[:, 1])))
    selected, segmentation = segment_triangles(evidence, faces, aligned_positions, y_floor)
    segmentation["bodyYFloorMu"] = y_floor
    aligned_pre_cleanup, _ = subset_mesh(
        source, selected, aligned_positions, aligned_normals, keep_skin=False)
    selected, edge_cleanup = clean_opening_edges(
        selected, faces, aligned_positions, sampled_rgb, garment_samples, skin_samples)
    segmentation["edgeCleanup"] = edge_cleanup
    segmentation["stages"]["afterEdgeCleanup"] = int(selected.sum())
    selected, hole_repair = fill_internal_holes(
        selected, faces, aligned_positions, evidence.region)
    segmentation["holeRepair"] = hole_repair
    segmentation["stages"]["afterHoleRepair"] = int(selected.sum())
    raw, used = subset_mesh(source, selected, keep_skin=True)
    aligned_before, aligned_used = subset_mesh(
        source, selected, aligned_positions, aligned_normals, keep_skin=False)
    if not np.array_equal(used, aligned_used):
        raise ExtractError("两种输出的源顶点映射不一致")
    aligned_smoothed, edge_smoothing = smooth_opening_edges(
        aligned_before, float(skeleton["mPerMu"]))
    aligned_raw, cap_stats = cap_nonsemantic_openings(aligned_smoothed)
    segmentation["topologyRepair"] = cap_stats
    cap_faces = aligned_raw.indices.reshape(-1, 3)
    raw = Mesh(raw.positions, aligned_raw.indices.copy(),
               vertex_normals(raw.positions, cap_faces).astype(np.float32), raw.uvs,
               raw.joints, raw.weights, raw.regions, raw.material_indices,
               [PrimitiveRange(0, len(raw.positions), 0, aligned_raw.indices.size, 0)], raw.name)
    segmentation["edgeSmoothing"] = edge_smoothing
    output_dir.mkdir(parents=True, exist_ok=True); material, images = _base_color(source_glb)
    material["double_sided"] = True
    skinned_path = output_dir / f"{asset_id}_raw_skinned.glb"
    aligned_path = output_dir / f"{asset_id}_raw_aligned.glb"
    write_skinned_glb(skinned_path, raw, source_glb.skin(), material, images)
    write_static_glb(aligned_path, aligned_raw, material, images)
    render_qc(output_dir / "extract_front.png", body, aligned_raw, back=False)
    render_qc(output_dir / "extract_back.png", body, aligned_raw, back=True)
    render_edges_detail(output_dir / "extract_edges_detail.png", body, aligned_pre_cleanup, aligned_raw)
    render_color_qc(output_dir / "extract_color_check_front.png", aligned, sampled_rgb)
    loops = boundary_loops(aligned_raw.positions, aligned_raw.indices.reshape(-1, 3))
    require_four_openings(loops)
    selected_faces = aligned_raw.indices.reshape(-1, 3)
    quantized = np.rint(aligned_raw.positions.astype(np.float64) / 1e-6).astype(np.int64)
    _, welded = np.unique(quantized, axis=0, return_inverse=True)
    components = _components(np.ones(len(selected_faces), dtype=bool),
                             triangle_adjacency(welded[selected_faces])[0])
    selected_signed = np.abs(evidence.signed_mu[selected]) * float(skeleton["mPerMu"]) * 1000.0
    peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    peak_mib = peak / (1024.0 * 1024.0) if sys.platform == "darwin" else peak / 1024.0
    result = {
        "schema": "tianshu-dressup-extract.v1", "id": asset_id, "slot": slot,
        "inputs": {"dressed": {"file": _portable(dressed_path), "sha256": _sha256(dressed_path)},
                   "body": {"file": _portable(body_path), "sha256": _sha256(body_path)},
                   "skeleton": {"file": _portable(skeleton_path), "sha256": _sha256(skeleton_path)},
                   "plate": None if plate_path is None else {"file": _portable(plate_path), "sha256": _sha256(plate_path)},
                   "basePlate": None if base_plate_path is None else {"file": _portable(base_plate_path), "sha256": _sha256(base_plate_path)}},
        "align": {**align, "residualPercentH": alignment_summary(source_glb, skeleton, align)},
        "segmentation": {**segmentation, "keepRegions": list(keep_regions),
                           "forbiddenRegions": sorted(FORBIDDEN_REGIONS),
                           "distanceThresholdMu": evidence.distance_threshold_mu,
                           "plateColorModel": {**plate_stats, "uvOrigin": "top-left",
                                                "vDirection": "down"}},
        "topology": {"vertices": len(raw.positions), "triangles": len(selected_faces),
                     "components": len(components), "componentTriangles": [len(row) for row in components[:20]],
                     "openings": loops},
        "distanceToBodyMm": {"p50": float(np.quantile(selected_signed, .5)),
                              "p90": float(np.quantile(selected_signed, .9)),
                              "max": float(selected_signed.max(initial=0))},
        "coverageAreaByRegion": coverage_area(faces, aligned_positions, evidence.region_names, selected),
        "outputs": {"rawSkinned": skinned_path.name, "rawAligned": aligned_path.name,
                    "frontQc": "extract_front.png", "backQc": "extract_back.png",
                    "colorCheckFrontQc": "extract_color_check_front.png",
                    "edgesDetailQc": "extract_edges_detail.png"},
        "stats": {"elapsedSec": time.perf_counter() - started, "peakMemoryMiB": peak_mib},
    }
    result = _round(result); (output_dir / "extract.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dressed", required=True, type=Path, help="带源 skin 的整身 GLB")
    parser.add_argument("--body", required=True, type=Path, help="模板 body.glb")
    parser.add_argument("--skeleton", required=True, type=Path, help="模板 skeleton.json")
    parser.add_argument("--slot", default="body", choices=("body",))
    parser.add_argument("--id", required=True, help="装备 ID")
    parser.add_argument("--out", required=True, type=Path, help="输出目录")
    parser.add_argument("--plate", type=Path, help="同画布衣图底板")
    parser.add_argument("--base-plate", type=Path, help="同画布模板底图")
    parser.add_argument("--keep-regions", nargs="+", default=list(DEFAULT_REGIONS),
                        help="允许进入衣壳的模板区域名")
    parser.add_argument("--json", action="store_true", help="stdout 仅输出 JSON")
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        result = extract_file(args.dressed, args.body, args.skeleton, args.slot, args.id, args.out,
                              plate_path=args.plate, base_plate_path=args.base_plate,
                              keep_regions=args.keep_regions)
    except (OSError, ValueError, KeyError, RuntimeError, NotImplementedError, json.JSONDecodeError) as error:
        print(f"输入错误：{error}", file=sys.stderr); return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    else:
        print(f"已抽出 {result['topology']['triangles']} 三角，输出 {args.out / 'extract.json'}")
    return 0


__all__ = ["Evidence", "ExtractError", "boundary_loops", "build_evidence",
           "classify_lab", "clean_triangle_mask", "extract_file",
           "compact_indexed_mesh", "plate_lab_samples", "require_four_openings",
           "repair_by_reference", "repair_skin_texels", "sample_base_color", "segment_triangles", "subset_mesh",
           "triangle_adjacency"]


if __name__ == "__main__":
    raise SystemExit(main())
