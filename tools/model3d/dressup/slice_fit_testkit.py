"""切片贴合（ADR 0002）测试用合成件：椭圆柱素体（可带两腿、斜手臂）、双层衣片、按真实流程量锚点的衣物标注。

只给 ``tests_slice_fit.py`` 用；合成件 mPerMu = 1（1 mm = 0.001 mu）。
"""
from __future__ import annotations

import math
from pathlib import Path
import sys

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import slice_fit as sf  # noqa: E402
from glb_io import GLBBuilder, ImageData, Mesh, PrimitiveRange  # noqa: E402

MM = 0.001
GAP = 1.0 * MM
BODY_LEVELS = {"neckBase": 0.90, "bust": 0.75, "waist": 0.60, "pelvis": 0.40, "crotch": 0.30}
# 合成衣物"为另一体型设计"：设计体标注面（衣物坐标）。锚点（上下沿）按真实流程量，目标按它选。
GARMENT_DESIGN = {"neckBase": 0.80, "waist": 0.55, "pelvis": 0.30}


def tube(radius_fn, ys: np.ndarray, sides: int, *, center=(0.0, 0.0), closed: bool = False, inward: bool = False,
         top_fn=None):
    """沿 +Y 的管：radius_fn(y, θ) → 半径；top_fn(θ) 给出最上一圈的高度（领口造型）；closed 时加两端盖。"""
    theta = np.arange(sides) * 2 * math.pi / sides
    positions = []; uvs = []
    for k, y in enumerate(ys):
        r = radius_fn(y, theta)
        height = np.full(sides, y) if top_fn is None or k < len(ys) - 1 else top_fn(theta)
        positions.append(np.column_stack((center[0] + r * np.cos(theta), height, center[1] + r * np.sin(theta))))
        uvs.append(np.column_stack((theta / (2 * math.pi), np.full(sides, k / max(len(ys) - 1, 1)))))
    positions = np.concatenate(positions); uvs = np.concatenate(uvs)
    faces = []
    for k in range(len(ys) - 1):
        for j in range(sides):
            a = k * sides + j; b = k * sides + (j + 1) % sides; c = (k + 1) * sides + j; d = (k + 1) * sides + (j + 1) % sides
            faces += [(a, c, b), (b, c, d)]
    if closed:
        base = len(positions)
        positions = np.vstack((positions, [[center[0], ys[0], center[1]], [center[0], ys[-1], center[1]]]))
        uvs = np.vstack((uvs, [[0.5, 0.0], [0.5, 1.0]]))
        top = (len(ys) - 1) * sides
        for j in range(sides):
            faces += [(base, j, (j + 1) % sides), (base + 1, top + (j + 1) % sides, top + j)]
    faces = np.asarray(faces, dtype=np.int64)
    if inward:
        faces = faces[:, [0, 2, 1]]
    return positions, faces, uvs


def merge(*parts):
    positions, faces, uvs = [], [], []; base = 0
    for p, f, u in parts:
        positions.append(p); faces.append(f + base); uvs.append(u); base += len(p)
    return np.concatenate(positions), np.concatenate(faces), np.concatenate(uvs)


def ellipse(ax: float, az: float):
    return lambda y, t: ax * az / np.sqrt((az * np.cos(t)) ** 2 + (ax * np.sin(t)) ** 2)


def body_model(positions, faces, *, arm_left=None, limbs=None, levels=None) -> sf.BodyModel:
    weld = sf.weld_ids(positions)
    normals = sf.welded_normals(positions, faces, weld)
    count = len(positions)
    arm = {"L": np.zeros(count) if arm_left is None else arm_left, "R": np.zeros(count)}
    landmarks = {"levels": {name: {"yMu": y} for name, y in (levels or BODY_LEVELS).items()}, "limbs": limbs or {}}
    return sf.BodyModel(positions, faces, normals, None, arm, landmarks, 1.0, None, None, weld)


def cylinder_body() -> sf.BodyModel:
    positions, faces, _ = tube(ellipse(0.10, 0.07), np.linspace(0.0, 1.0, 81), 96, closed=True)
    return body_model(positions, faces)


def shell_garment(inner_fn, *, thickness: float, ys: np.ndarray, sides: int = 72, center=(0.0, 0.0)):
    """双层衣片：内层（法向朝里）+ 外层（内层 + 厚度），返回位置、三角、UV、内外配对数。"""
    inner = tube(inner_fn, ys, sides, center=center, inward=True)
    outer = tube(lambda y, t: inner_fn(y, t) + thickness, ys, sides, center=center)
    positions, faces, uvs = merge(inner, outer)
    return positions, faces, uvs, len(inner[0])


def garment_model(positions, faces, uvs, *, elasticity: float, design=None, sleeves=None,
                  clearance_mm=1.0) -> sf.GarmentModel:
    """合成衣物 + 标注：设计体标注面 design（衣物坐标）；领口 / 下摆 / 袖口锚点按真实流程从几何量出、目标按设计体选。"""
    design = dict(design or GARMENT_DESIGN)
    garment = sf.GarmentModel(positions, faces, None if uvs is None else uvs.astype(np.float32), {}, None,
                              [1, 1, 1, 1], None, None, "synthetic")
    anchors = sf.garment_anchors(garment, design, sleeves, 1.0)
    sleeves = {side: {**sleeves[side], "cuff": cuff} for side, cuff in anchors["cuffs"].items()} if sleeves else None
    garment.landmarks = {"elasticity": elasticity, "clearanceMm": clearance_mm, "rigid": elasticity <= 0.0,
                         "legs": "tube", "anchorRule": anchors["anchorRule"], "collar": anchors["collar"],
                         "hem": anchors["hem"], "levels": {name: {"yMu": value} for name, value in design.items()},
                         "alignLevels": list(design), "sleeves": sleeves}
    return garment


def pure_params(**kw) -> sf.SliceParams:
    """只看切片本身：关掉 3D 残余外推与折角平滑；合成素体是竖直柱面，没有盖顶。"""
    base = dict(residual_push=False, relax_cycles=0, sigma_theta_deg=4.0, sigma_axial_mm=6.0)
    base.update(kw)
    return sf.SliceParams(**base)


def wavy_garment(offset=(0.03, -0.02)):
    """为另一体型做的衣服：更宽更扁、带二阶起伏，竖直方向 0.30–0.80（素体标注 0.40–0.90），并错位。"""
    inner = lambda y, t: ellipse(0.125, 0.10)(y, t) * (1.0 + 0.06 * np.cos(2 * t + 0.4))  # noqa: E731
    return shell_garment(inner, thickness=4 * MM, ys=np.linspace(0.30, 0.80, 51), center=offset)


def write_static(path: Path, positions, faces, uvs, image: ImageData | None = None) -> None:
    builder = GLBBuilder()
    texture = None
    if image is not None:
        texture = builder.add_texture(builder.add_image(image), sampler_index=builder.add_sampler())
    material = builder.add_material(base_color_texture=texture, unlit=True, name="m")
    mesh = Mesh(positions.astype(np.float32), faces.reshape(-1).astype(np.uint32),
                sf.welded_normals(positions, faces, sf.weld_ids(positions)).astype(np.float32),
                None if uvs is None else uvs.astype(np.float32), material_indices=np.asarray([0]),
                primitives=[PrimitiveRange(0, len(positions), 0, faces.size, 0)], name="m")
    node = builder.add_node(name="m", mesh=builder.add_mesh(mesh, material_map=[material]))
    builder.add_scene([node]); builder.write(path)


__all__ = ["BODY_LEVELS", "GAP", "GARMENT_DESIGN", "MM", "body_model", "cylinder_body", "ellipse", "garment_model",
           "merge", "pure_params", "shell_garment", "tube", "wavy_garment", "write_static"]
