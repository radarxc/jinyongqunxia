"""切片贴合（ADR 0002）输入输出：素体 / 衣物模型、读入约束与静态 GLB 写出。"""
from __future__ import annotations

from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from typing import Any, Sequence

try:
    from .slice_fit_base import (SliceFitError, weld_ids, welded_normals)
except ImportError:
    from slice_fit_base import (SliceFitError, weld_ids, welded_normals)  # type: ignore[no-redef]

import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402

try:
    from .slice_fit_geometry import (HorizontalSlicer)
except ImportError:
    from slice_fit_geometry import (HorizontalSlicer)  # type: ignore[no-redef]
try:
    from .fit_garment import (PseudoNormalSign, SurfaceIndex, load_world_mesh)
except ImportError:
    from fit_garment import (PseudoNormalSign, SurfaceIndex, load_world_mesh)  # type: ignore[no-redef]
try:
    from .glb_io import (GLB, GLBBuilder, ImageData, Mesh, PrimitiveRange, load_glb)
except ImportError:
    from glb_io import (GLB, GLBBuilder, ImageData, Mesh, PrimitiveRange, load_glb)  # type: ignore[no-redef]


def _texture_array(glb: GLB) -> tuple[np.ndarray | None, ImageData | None, list[float]]:
    """首个材质的 baseColor 贴图（RGB 数组 + 原图字节）与因子。"""
    factor = [1.0, 1.0, 1.0, 1.0]
    for material in glb.json.get("materials", []):
        pbr = material.get("pbrMetallicRoughness", {})
        factor = [float(v) for v in pbr.get("baseColorFactor", factor)]
        reference = pbr.get("baseColorTexture")
        if isinstance(reference, dict):
            texture = glb.json["textures"][int(reference["index"])]
            if texture.get("source") is not None:
                data = glb.image(int(texture["source"]))
                with Image.open(BytesIO(data.data)) as image:
                    array = np.asarray(image.convert("RGB"))
                return array, data, factor
        break
    return None, None, factor


@dataclass
class BodyModel:
    """素体：bind 空间网格、按蒙皮权重的左右臂归属、标注与 mPerMu。"""

    positions: np.ndarray
    faces: np.ndarray
    normals: np.ndarray
    uvs: np.ndarray | None
    arm_weight: dict[str, np.ndarray]
    landmarks: dict[str, Any]
    m_per_mu: float
    path: Path | None = None
    texture: np.ndarray | None = None
    weld: np.ndarray = field(default=None)  # type: ignore[assignment]
    _surface: SurfaceIndex | None = None
    _sign: PseudoNormalSign | None = None
    _torso_slicer: HorizontalSlicer | None = None

    def __post_init__(self) -> None:
        self.positions = np.asarray(self.positions, dtype=np.float64)
        self.faces = np.asarray(self.faces, dtype=np.int64).reshape(-1, 3)
        if self.weld is None:
            self.weld = weld_ids(self.positions)
        arm = sum(self.arm_weight.values()) if self.arm_weight else np.zeros(len(self.positions))
        self.torso_face_mask = np.asarray(arm, dtype=np.float64)[self.faces].mean(axis=1) < 0.5
        self.arm_face_mask = {side: np.asarray(weight)[self.faces].mean(axis=1) >= 0.5
                              for side, weight in self.arm_weight.items()}

    def surface(self) -> SurfaceIndex:
        if self._surface is None:
            self._surface = SurfaceIndex(self.positions, self.faces, self.normals, k=16)
        return self._surface

    def sign(self) -> PseudoNormalSign:
        if self._sign is None:
            self._sign = PseudoNormalSign(self.surface())
        return self._sign

    def torso_slicer(self) -> HorizontalSlicer:
        if self._torso_slicer is None:
            self._torso_slicer = HorizontalSlicer(self.positions, self.faces, self.weld, self.torso_face_mask)
        return self._torso_slicer

    def signed_distance(self, points: np.ndarray) -> np.ndarray:
        nearest, bary, face_ids, distances = self.surface().query(np.asarray(points, dtype=np.float64))
        return self.sign().signed(points, nearest, bary, face_ids, distances)


def _arm_weights_from_skin(mesh: Mesh, joint_names: Sequence[str]) -> dict[str, np.ndarray]:
    result = {"L": np.zeros(len(mesh.positions)), "R": np.zeros(len(mesh.positions))}
    if mesh.joints is None or mesh.weights is None:
        return result
    for index, name in enumerate(joint_names):
        stem = name.split(":")[-1]
        if not ("Arm" in stem or "Hand" in stem):
            continue
        side = "L" if stem.startswith("Left") else "R" if stem.startswith("Right") else None
        if side is None:
            continue
        result[side] += np.sum(mesh.weights * (mesh.joints == index), axis=1)
    return result


def load_body(body_path: Path, landmarks: dict[str, Any] | None = None,
              m_per_mu: float | None = None) -> BodyModel:
    """读素体 GLB（有 skin 时只取蒙皮网格），臂归属来自蒙皮权重；无 skin 则全为躯干。"""
    glb = load_glb(body_path)
    skinned = bool(glb.json.get("skins"))
    mesh = load_world_mesh(glb, skinned_only=skinned)
    faces = mesh.indices.reshape(-1, 3).astype(np.int64)
    names = ([glb.json["nodes"][index].get("name", "") for index in glb.skin().joints] if skinned else [])
    arm = _arm_weights_from_skin(mesh, names)
    weld = weld_ids(mesh.positions)
    normals = (mesh.normals.astype(np.float64) if mesh.normals is not None
               else welded_normals(mesh.positions, faces, weld))
    texture, _, _ = _texture_array(glb)
    landmarks = dict(landmarks or {})
    scale = float(m_per_mu if m_per_mu is not None else landmarks.get("mPerMu", 1.0))
    return BodyModel(mesh.positions, faces, normals, mesh.uvs, arm, landmarks, scale, Path(body_path),
                     texture, weld)


@dataclass
class GarmentModel:
    """衣物 / 盔甲：原始空间网格（拓扑、UV、贴图原样保留）与标注。"""

    positions: np.ndarray
    faces: np.ndarray
    uvs: np.ndarray | None
    landmarks: dict[str, Any]
    image: ImageData | None = None
    base_color_factor: list[float] = field(default_factory=lambda: [1.0, 1.0, 1.0, 1.0])
    texture: np.ndarray | None = None
    path: Path | None = None
    name: str = "garment"
    weld: np.ndarray = field(default=None)  # type: ignore[assignment]

    def __post_init__(self) -> None:
        self.positions = np.asarray(self.positions, dtype=np.float64)
        self.faces = np.asarray(self.faces, dtype=np.int64).reshape(-1, 3)
        if self.weld is None:
            self.weld = weld_ids(self.positions)


def check_single_primitive(glb: GLB) -> None:
    """本原型只接受单 mesh 节点 / 单 mesh / 单 primitive / 至多一个材质的衣物（现有 Tripo 抽取件与测试甲都是）。

    输出按单 primitive、单材质写回；多 primitive / 多材质输入若硬压成一个会丢材质分区，所以明确拒绝（ADR 0002 下一步）。"""
    nodes = [node for node in glb.json.get("nodes", []) if "mesh" in node]
    meshes = glb.json.get("meshes", [])
    primitives = sum(len(mesh.get("primitives", [])) for mesh in meshes)
    materials = len(glb.json.get("materials", []))
    if len(nodes) != 1 or len(meshes) != 1 or primitives != 1 or materials > 1:
        raise SliceFitError(f"只支持单 mesh / 单 primitive / 单材质衣物：mesh 节点 {len(nodes)}、mesh {len(meshes)}、"
                            f"primitive {primitives}、材质 {materials}（多 primitive 见 ADR 0002 下一步）")


def load_garment(path: Path, landmarks: dict[str, Any]) -> GarmentModel:
    glb = load_glb(path)
    check_single_primitive(glb)
    mesh = load_world_mesh(glb)
    texture, image, factor = _texture_array(glb)
    return GarmentModel(mesh.positions, mesh.indices.reshape(-1, 3).astype(np.int64), mesh.uvs, landmarks,
                        image, factor, texture, Path(path), str(landmarks.get("id") or Path(path).stem))


def write_static_glb(path: Path, garment: GarmentModel, positions: np.ndarray, *, name: str | None = None) -> None:
    """拓扑、UV、贴图原样，只换顶点位置（法线按新位置重算）；静态 unlit 双面材质。"""
    positions = np.asarray(positions, dtype=np.float64)
    normals = welded_normals(positions, garment.faces, garment.weld)
    builder = GLBBuilder(generator="tianshu dressup slice_fit.py")
    texture = None
    if garment.image is not None:
        image = builder.add_image(garment.image); sampler = builder.add_sampler()
        texture = builder.add_texture(image, sampler_index=sampler)
    material = builder.add_material(base_color_texture=texture, base_color_factor=garment.base_color_factor,
                                    unlit=True, double_sided=True, name=f"{name or garment.name}_unlit")
    mesh = Mesh(positions.astype(np.float32), garment.faces.reshape(-1).astype(np.uint32), normals.astype(np.float32),
                garment.uvs, material_indices=np.asarray([0]),
                primitives=[PrimitiveRange(0, len(positions), 0, garment.faces.size, 0)], name=name or garment.name)
    mesh_index = builder.add_mesh(mesh, material_map=[material])
    node = builder.add_node(name=name or garment.name, mesh=mesh_index)
    builder.add_scene([node], name="SliceFitScene")
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    builder.write(path)
    path.chmod(0o644)
