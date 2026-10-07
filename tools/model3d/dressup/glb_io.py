#!/usr/bin/env python3
"""GLB 2.0 离线读写与蒙皮网格桥接。

所有坐标使用模型单位（mu），矩阵在 Python 中为列向量语义的 4×4 行列数组；
写入 glTF 时按规范展平成列主序。遇 meshopt 压缩会自动调用同目录 Node 解码器。
"""

from __future__ import annotations

import argparse
import base64
import copy
import json
import mimetypes
import os
from pathlib import Path
import sys

# 同目录存在规格要求的 inspect.py；先缓存标准库 inspect，避免 dataclasses/NumPy
# 在直接执行脚本时被同名文件遮蔽。
_MODULE_DIR = Path(__file__).resolve().parent
_removed_paths = [(index, value) for index, value in enumerate(sys.path)
                  if Path(value or os.getcwd()).resolve() == _MODULE_DIR]
sys.path[:] = [value for value in sys.path if Path(value or os.getcwd()).resolve() != _MODULE_DIR]
import inspect as _stdlib_inspect  # noqa: F401,E402
for index, value in _removed_paths:
    sys.path.insert(min(index, len(sys.path)), value)

from dataclasses import dataclass, field
import struct
import subprocess
import tempfile
from typing import Any, Iterable, Sequence
from urllib.parse import unquote_to_bytes

import numpy as np

try:
    from .common import compose_matrix
except ImportError:  # 允许 ``python3 glb_io.py`` 所在目录导入。
    from common import compose_matrix


MAGIC = 0x46546C67
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942
COMPONENT_DTYPES = {
    5120: np.dtype("<i1"), 5121: np.dtype("<u1"), 5122: np.dtype("<i2"),
    5123: np.dtype("<u2"), 5125: np.dtype("<u4"), 5126: np.dtype("<f4"),
}
DTYPE_COMPONENTS = {dtype.str: kind for kind, dtype in COMPONENT_DTYPES.items()}
TYPE_COMPONENTS = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT2": 4, "MAT3": 9, "MAT4": 16}


@dataclass(frozen=True)
class PrimitiveRange:
    """统一 Mesh 中一个原始 primitive 的顶点/索引区间。"""

    vertex_start: int
    vertex_count: int
    index_start: int
    index_count: int
    material: int | None
    mesh_index: int = 0
    primitive_index: int = 0
    mode: int = 4
    attributes: tuple[str, ...] = ()


@dataclass
class Mesh:
    """跨 primitive 的统一网格；positions 与所有坐标字段单位为 mu。"""

    positions: np.ndarray
    indices: np.ndarray
    normals: np.ndarray | None = None
    uvs: np.ndarray | None = None
    joints: np.ndarray | None = None
    weights: np.ndarray | None = None
    regions: np.ndarray | None = None
    material_indices: np.ndarray = field(default_factory=lambda: np.empty(0, dtype=np.int32))
    primitives: list[PrimitiveRange] = field(default_factory=list)
    name: str | None = None

    def __post_init__(self) -> None:
        self.positions = np.asarray(self.positions, dtype=np.float32).reshape(-1, 3)
        self.indices = np.asarray(self.indices).reshape(-1)
        if self.normals is not None: self.normals = np.asarray(self.normals, dtype=np.float32).reshape(-1, 3)
        if self.uvs is not None: self.uvs = np.asarray(self.uvs, dtype=np.float32).reshape(-1, 2)
        if self.joints is not None: self.joints = np.asarray(self.joints, dtype=np.uint16).reshape(len(self.positions), -1)
        if self.weights is not None: self.weights = np.asarray(self.weights, dtype=np.float32).reshape(len(self.positions), -1)
        if self.regions is not None: self.regions = np.asarray(self.regions, dtype=np.uint8).reshape(-1)
        self.material_indices = np.asarray(self.material_indices, dtype=np.int32).reshape(-1)
        for label, array in (("normals", self.normals), ("uvs", self.uvs), ("joints", self.joints),
                             ("weights", self.weights), ("regions", self.regions)):
            if array is not None and len(array) != len(self.positions):
                raise ValueError(f"{label} 顶点数与 positions 不同")


@dataclass(frozen=True)
class ImageData:
    """GLB 内嵌图片的原始字节与 MIME。"""

    data: bytes
    mime_type: str
    name: str | None = None


@dataclass(frozen=True)
class Skin:
    """skin 的关节顺序、IBM 数值及原 accessor 来源。"""

    source: "GLB"
    index: int
    joints: tuple[int, ...]
    inverse_bind_matrices: np.ndarray
    inverse_bind_accessor: int | None
    skeleton: int | None
    name: str | None = None


def _uses_meshopt(document: dict[str, Any]) -> bool:
    return "EXT_meshopt_compression" in document.get("extensionsUsed", []) or any(
        "EXT_meshopt_compression" in view.get("extensions", {}) for view in document.get("bufferViews", [])
    )


def _validate_document(document: dict[str, Any], binary: bytes, path: os.PathLike[str] | str) -> None:
    """校验本工具会依赖的 JSON 索引与 BIN 边界。"""
    buffers = document.get("buffers", [])
    meshopt = _uses_meshopt(document)
    if (len(buffers) > 1 and not meshopt) or any(item.get("uri") for item in buffers):
        raise ValueError(f"{path}: 离线 GLB 只支持内嵌 buffer（meshopt 的虚拟 fallback buffer 除外）")
    if buffers and len(binary) < int(buffers[0].get("byteLength", 0)):
        raise ValueError(f"{path}: BIN chunk 短于 buffers[0].byteLength")
    views = document.get("bufferViews", [])
    for index, view in enumerate(views):
        extension = view.get("extensions", {}).get("EXT_meshopt_compression")
        location = extension or view
        buffer_index = int(location.get("buffer", 0)); start = int(location.get("byteOffset", 0)); length = int(location.get("byteLength", 0))
        if buffer_index < 0 or buffer_index >= len(buffers) or start < 0 or length < 0:
            raise ValueError(f"{path}: bufferView {index} 的 buffer/边界无效")
        if extension is None and buffer_index != 0:
            # meshopt 必需模式允许无法读取的 fallback buffer；解码后不会再引用它。
            if not meshopt: raise ValueError(f"{path}: bufferView {index} 指向非内嵌 buffer")
        elif buffer_index != 0 or start + length > len(binary):
            raise ValueError(f"{path}: bufferView {index} 越过 BIN")
    for index, accessor in enumerate(document.get("accessors", [])):
        view_index = accessor.get("bufferView")
        if view_index is not None and not 0 <= int(view_index) < len(views): raise ValueError(f"{path}: accessor {index} 的 bufferView 越界")
        if int(accessor.get("count", -1)) < 0: raise ValueError(f"{path}: accessor {index} 的 count 无效")
    nodes = document.get("nodes", [])
    for index, node in enumerate(nodes):
        for child in node.get("children", []):
            if not 0 <= int(child) < len(nodes): raise ValueError(f"{path}: node {index} 的 child 越界")
    for index, skin in enumerate(document.get("skins", [])):
        if any(not 0 <= int(joint) < len(nodes) for joint in skin.get("joints", [])):
            raise ValueError(f"{path}: skin {index} 的 joint 越界")


def _parse_glb(path: os.PathLike[str] | str) -> tuple[dict[str, Any], bytes]:
    data = Path(path).read_bytes()
    if len(data) < 20:
        raise ValueError(f"{path}: 文件过短，不是 GLB")
    magic, version, total = struct.unpack_from("<III", data)
    if magic != MAGIC or version != 2 or total != len(data):
        raise ValueError(f"{path}: GLB 头无效（magic/version/length）")
    offset, document, binary = 12, None, b""
    while offset < len(data):
        if offset + 8 > len(data):
            raise ValueError(f"{path}: chunk 头截断")
        length, kind = struct.unpack_from("<II", data, offset); offset += 8
        if length % 4 or offset + length > len(data):
            raise ValueError(f"{path}: chunk 长度或边界无效")
        payload = data[offset:offset + length]; offset += length
        if kind == JSON_CHUNK:
            if document is not None: raise ValueError(f"{path}: 重复 JSON chunk")
            try: document = json.loads(payload.rstrip(b" \x00").decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc: raise ValueError(f"{path}: JSON chunk 无效: {exc}") from exc
        elif kind == BIN_CHUNK:
            if binary: raise ValueError(f"{path}: 重复 BIN chunk")
            binary = payload
    if document is None or document.get("asset", {}).get("version") != "2.0":
        raise ValueError(f"{path}: 缺少 glTF 2.0 JSON")
    _validate_document(document, binary, path)
    return document, binary


class GLB:
    """已校验的 GLB 文档，提供 accessor、节点、skin、图片和统一网格读取。"""

    def __init__(self, path: os.PathLike[str] | str, document: dict[str, Any], binary: bytes):
        self.path = Path(path)
        self.json = document
        self.bin = binary
        self._parents: dict[int, int] | None = None
        self._world_cache: dict[int, np.ndarray] = {}

    def accessor_bytes(self, index: int) -> bytes:
        """返回紧密排列的 accessor 原始元素字节；不做 normalized 转换。"""
        accessor = self.json["accessors"][index]
        if "sparse" in accessor:
            raise NotImplementedError("sparse accessor 尚不支持")
        if "bufferView" not in accessor:
            raise NotImplementedError("无 bufferView 的零初始化 accessor 尚不支持")
        view = self.json["bufferViews"][accessor["bufferView"]]
        if "EXT_meshopt_compression" in view.get("extensions", {}):
            raise ValueError("meshopt bufferView 尚未解压；请使用 load_glb")
        dtype = COMPONENT_DTYPES.get(accessor["componentType"])
        count = TYPE_COMPONENTS.get(accessor["type"])
        if dtype is None or count is None:
            raise NotImplementedError("不支持的 accessor componentType/type")
        item_size = dtype.itemsize * count
        stride = int(view.get("byteStride", item_size))
        if stride < item_size or stride % dtype.itemsize:
            raise ValueError(f"accessor {index}: byteStride 无效")
        start = int(view.get("byteOffset", 0)) + int(accessor.get("byteOffset", 0))
        last = start + (int(accessor["count"]) - 1) * stride + item_size if accessor["count"] else start
        view_end = int(view.get("byteOffset", 0)) + int(view["byteLength"])
        if start < int(view.get("byteOffset", 0)) or last > view_end or last > len(self.bin):
            raise ValueError(f"accessor {index}: 数据越过 bufferView/BIN")
        if stride == item_size:
            return bytes(self.bin[start:last])
        return b"".join(bytes(self.bin[start + row * stride:start + row * stride + item_size]) for row in range(accessor["count"]))

    def accessor(self, index: int, *, normalized: bool = True) -> np.ndarray:
        """读取 accessor；normalized 整数默认转 float32，其他保持原 dtype。"""
        spec = self.json["accessors"][index]
        dtype = COMPONENT_DTYPES.get(spec["componentType"]); width = TYPE_COMPONENTS.get(spec["type"])
        if dtype is None or width is None: raise NotImplementedError("不支持的 accessor componentType/type")
        result = np.frombuffer(self.accessor_bytes(index), dtype=dtype).reshape(int(spec["count"]), width).copy()
        if normalized and spec.get("normalized"):
            if spec["componentType"] == 5120: result = np.maximum(result.astype(np.float32) / 127.0, -1.0)
            elif spec["componentType"] == 5122: result = np.maximum(result.astype(np.float32) / 32767.0, -1.0)
            elif spec["componentType"] == 5121: result = result.astype(np.float32) / 255.0
            elif spec["componentType"] == 5123: result = result.astype(np.float32) / 65535.0
            else: raise ValueError("normalized 只允许 int8/int16/uint8/uint16")
        if spec["type"] == "SCALAR": return result[:, 0]
        if spec["type"].startswith("MAT"):
            side = int(spec["type"][-1])
            return result.reshape(-1, side, side).transpose(0, 2, 1)
        return result

    @property
    def parents(self) -> dict[int, int]:
        """节点索引到父节点索引；多父或环由 world_matrix 校验报错。"""
        if self._parents is None:
            parents: dict[int, int] = {}
            for parent, node in enumerate(self.json.get("nodes", [])):
                for child in node.get("children", []):
                    if child in parents: raise ValueError(f"节点 {child} 有多个父节点")
                    parents[child] = parent
            self._parents = parents
        return self._parents

    def local_matrix(self, node_index: int) -> np.ndarray:
        """返回节点局部 4×4 矩阵；translation 单位为 mu。"""
        node = self.json["nodes"][node_index]
        if "matrix" in node:
            if any(key in node for key in ("translation", "rotation", "scale")):
                raise ValueError(f"node {node_index}: matrix 与 TRS 不可并存")
            return np.asarray(node["matrix"], dtype=np.float64).reshape(4, 4).T
        return compose_matrix(node.get("translation", [0, 0, 0]), node.get("rotation", [0, 0, 0, 1]), node.get("scale", [1, 1, 1]))

    def world_matrix(self, node_index: int) -> np.ndarray:
        """返回节点静止姿势世界矩阵；translation 单位为 mu。"""
        def visit(index: int, active: set[int]) -> np.ndarray:
            if index in self._world_cache: return self._world_cache[index]
            if index in active: raise ValueError("节点层级含环")
            active.add(index); local = self.local_matrix(index)
            world = visit(self.parents[index], active) @ local if index in self.parents else local
            active.remove(index); self._world_cache[index] = world
            return world
        return visit(node_index, set()).copy()

    def skin(self, index: int = 0) -> Skin:
        """读取 skin；IBM 返回 B×4×4，若省略则按规范为单位矩阵。"""
        spec = self.json["skins"][index]; joints = tuple(int(value) for value in spec["joints"])
        accessor_index = spec.get("inverseBindMatrices")
        matrices = self.accessor(accessor_index) if accessor_index is not None else np.repeat(np.eye(4)[None], len(joints), axis=0)
        if matrices.shape != (len(joints), 4, 4): raise ValueError(f"skin {index}: IBM 数量/类型与 joints 不符")
        return Skin(self, index, joints, matrices, accessor_index, spec.get("skeleton"), spec.get("name"))

    def image(self, index: int) -> ImageData:
        """提取 image 原字节；支持 bufferView、data URI 与相对 GLB 的外部 URI。"""
        spec = self.json["images"][index]
        uri = spec.get("uri")
        if "bufferView" in spec:
            view = self.json["bufferViews"][spec["bufferView"]]
            start = int(view.get("byteOffset", 0)); end = start + int(view["byteLength"])
            if end > len(self.bin): raise ValueError(f"image {index}: 数据越过 BIN")
            data = bytes(self.bin[start:end])
        elif isinstance(uri, str) and uri.startswith("data:"):
            header, encoded = uri.split(",", 1)
            data = base64.b64decode(encoded, validate=True) if header.endswith(";base64") else unquote_to_bytes(encoded)
        elif isinstance(uri, str):
            data = (self.path.parent / uri).read_bytes()
        else:
            raise ValueError(f"image {index}: 缺 bufferView/uri")
        mime = spec.get("mimeType") or (uri.split(";", 1)[0][5:] if isinstance(uri, str) and uri.startswith("data:") else mimetypes.guess_type(uri or "")[0])
        if not mime: raise ValueError(f"image {index}: 缺 mimeType")
        return ImageData(data, mime, spec.get("name"))

    def meshes(self) -> list[Mesh]:
        """逐 glTF mesh 读取并合并其 primitives，保留每 primitive 区间。"""
        return [self._read_mesh(index) for index in range(len(self.json.get("meshes", [])))]

    def mesh(self, index: int = 0) -> Mesh:
        """读取一个 glTF mesh 为统一 Mesh 数据类。"""
        return self._read_mesh(index)

    def _read_mesh(self, mesh_index: int) -> Mesh:
        spec = self.json["meshes"][mesh_index]
        primitives = spec.get("primitives", [])
        if not primitives: raise ValueError(f"mesh {mesh_index}: 没有 primitive")
        present = {name for primitive in primitives for name in primitive.get("attributes", {})}
        supported = {"NORMAL": ("normals", 3), "TEXCOORD_0": ("uvs", 2), "JOINTS_0": ("joints", 4),
                     "WEIGHTS_0": ("weights", 4), "_REGION": ("regions", 1)}
        arrays: dict[str, list[np.ndarray]] = {field: [] for field, _ in supported.values()}
        positions, indices, ranges, materials = [], [], [], []
        vertex_start = index_start = 0
        for primitive_index, primitive in enumerate(primitives):
            if int(primitive.get("mode", 4)) != 4: raise NotImplementedError("统一 Mesh 只支持 TRIANGLES primitive")
            attrs = primitive.get("attributes", {})
            if "POSITION" not in attrs: raise ValueError("primitive 缺 POSITION")
            pos = np.asarray(self.accessor(attrs["POSITION"]), dtype=np.float32).reshape(-1, 3)
            local_indices = (np.asarray(self.accessor(primitive["indices"]), dtype=np.uint32).reshape(-1)
                             if "indices" in primitive else np.arange(len(pos), dtype=np.uint32))
            if len(local_indices) % 3: raise ValueError("TRIANGLES indices 数量不是 3 的倍数")
            positions.append(pos); indices.append(local_indices + vertex_start)
            material = primitive.get("material"); materials.append(-1 if material is None else material)
            ranges.append(PrimitiveRange(vertex_start, len(pos), index_start, len(local_indices), material,
                                         mesh_index, primitive_index, 4, tuple(sorted(attrs))))
            for semantic, (field_name, width) in supported.items():
                if semantic in attrs:
                    value = self.accessor(attrs[semantic], normalized=semantic != "JOINTS_0")
                    value = np.asarray(value).reshape(len(pos), width)
                elif semantic in present:
                    dtype = np.float32 if semantic not in ("JOINTS_0", "_REGION") else (np.uint16 if semantic == "JOINTS_0" else np.uint8)
                    value = np.zeros((len(pos), width), dtype=dtype)
                else:
                    continue
                arrays[field_name].append(value)
            vertex_start += len(pos); index_start += len(local_indices)
        values = {name: np.concatenate(parts, axis=0) if parts else None for name, parts in arrays.items()}
        regions = values["regions"][:, 0] if values["regions"] is not None else None
        return Mesh(np.concatenate(positions), np.concatenate(indices), values["normals"], values["uvs"],
                    values["joints"], values["weights"], regions, np.asarray(materials), ranges, spec.get("name"))


def load_glb(path: os.PathLike[str] | str) -> GLB:
    """加载 GLB；若含 EXT_meshopt_compression，临时解压后读取并立即删除。"""
    source = Path(path)
    document, binary = _parse_glb(source)
    if not _uses_meshopt(document):
        return GLB(source, document, binary)
    decoder = Path(__file__).with_name("meshopt_decode.mjs")
    with tempfile.TemporaryDirectory(prefix="tianshu-meshopt-") as temp_dir:
        decoded = Path(temp_dir) / "decoded.glb"
        try:
            result = subprocess.run(["node", str(decoder), str(source), str(decoded)], check=False, capture_output=True, text=True)
        except OSError as exc:
            raise RuntimeError(f"无法启动 Node meshopt 解码器: {exc}") from exc
        if result.returncode != 0:
            detail = result.stderr.strip() or result.stdout.strip()
            raise RuntimeError(f"meshopt 解压失败（exit {result.returncode}）: {detail}")
        decoded_json, decoded_bin = _parse_glb(decoded)
        if _uses_meshopt(decoded_json): raise RuntimeError("meshopt 解码输出仍声明压缩扩展")
        return GLB(source, decoded_json, decoded_bin)


class GLBBuilder:
    """确定性的 GLB 构建器；bufferView 按 4 字节对齐。"""

    def __init__(self, *, generator: str = "tianshu dressup glb_io.py") -> None:
        self.document: dict[str, Any] = {"asset": {"version": "2.0", "generator": generator}}
        self.binary = bytearray()

    def _append_bytes(self, payload: bytes, *, target: int | None = None, byte_stride: int | None = None,
                      name: str | None = None) -> int:
        self.binary.extend(b"\x00" * ((-len(self.binary)) % 4)); offset = len(self.binary); self.binary.extend(payload)
        view: dict[str, Any] = {"buffer": 0, "byteOffset": offset, "byteLength": len(payload)}
        if target is not None: view["target"] = target
        if byte_stride is not None: view["byteStride"] = byte_stride
        if name is not None: view["name"] = name
        return self._add("bufferViews", view)

    def _add(self, collection: str, value: dict[str, Any]) -> int:
        items = self.document.setdefault(collection, []); items.append(value); return len(items) - 1

    def add_accessor(self, array: np.ndarray, *, component_type: int | None = None, type_name: str | None = None,
                     normalized: bool = False, target: int | None = None, name: str | None = None) -> int:
        """从 NumPy 数组添加 accessor；4 字节对齐并始终写 min/max。"""
        value = np.asarray(array)
        if value.ndim == 1: value = value.reshape(-1, 1)
        if value.ndim == 3 and value.shape[1:] in ((2, 2), (3, 3), (4, 4)):
            side = value.shape[1]; type_name = type_name or f"MAT{side}"; value = value.transpose(0, 2, 1).reshape(len(value), -1)
        if value.ndim != 2 or len(value) == 0: raise ValueError("accessor array 必须是非空 N×K")
        component_type = component_type or DTYPE_COMPONENTS.get(value.dtype.newbyteorder("<").str)
        if component_type not in COMPONENT_DTYPES: raise ValueError(f"不支持的 dtype/componentType: {value.dtype}/{component_type}")
        width = value.shape[1]
        type_name = type_name or next((kind for kind, count in TYPE_COMPONENTS.items() if count == width and not kind.startswith("MAT")), None)
        if type_name is None or TYPE_COMPONENTS.get(type_name) != width: raise ValueError("无法从数组宽度推导 accessor type")
        encoded = np.ascontiguousarray(value, dtype=COMPONENT_DTYPES[component_type])
        view = self._append_bytes(encoded.tobytes(), target=target, name=name)
        spec: dict[str, Any] = {"bufferView": view, "componentType": component_type, "count": len(encoded), "type": type_name,
                               "min": encoded.min(axis=0).tolist(), "max": encoded.max(axis=0).tolist()}
        if normalized: spec["normalized"] = True
        if name is not None: spec["name"] = name
        return self._add("accessors", spec)

    def add_raw_accessor(self, source: GLB, accessor_index: int, *, name: str | None = None) -> int:
        """逐字节复制紧密 accessor（用于模板 inverseBindMatrices）。"""
        original = source.json["accessors"][accessor_index]
        if "sparse" in original: raise NotImplementedError("sparse accessor 尚不支持")
        view = self._append_bytes(source.accessor_bytes(accessor_index), name=name or original.get("name"))
        spec = {key: copy.deepcopy(value) for key, value in original.items() if key not in ("bufferView", "byteOffset", "sparse")}
        spec["bufferView"] = view
        if name is not None: spec["name"] = name
        return self._add("accessors", spec)

    def add_image(self, image: ImageData | bytes, *, mime_type: str | None = None, name: str | None = None) -> int:
        """将图片原字节嵌入 BIN 并添加 image。"""
        if isinstance(image, ImageData): data, mime, image_name = image.data, image.mime_type, image.name
        else: data, mime, image_name = bytes(image), mime_type, None
        if not mime: raise ValueError("嵌入图片必须提供 mime_type")
        spec: dict[str, Any] = {"bufferView": self._append_bytes(data, name=name or image_name), "mimeType": mime}
        if name or image_name: spec["name"] = name or image_name
        return self._add("images", spec)

    def add_texture(self, image_index: int, *, sampler_index: int | None = None, name: str | None = None) -> int:
        """添加引用 image 的 texture。"""
        spec: dict[str, Any] = {"source": int(image_index)}
        if sampler_index is not None: spec["sampler"] = int(sampler_index)
        if name is not None: spec["name"] = name
        return self._add("textures", spec)

    def add_sampler(self, *, mag_filter: int = 9729, min_filter: int = 9987, wrap_s: int = 10497, wrap_t: int = 10497,
                    name: str | None = None) -> int:
        """添加 glTF 纹理采样器。"""
        spec: dict[str, Any] = {"magFilter": mag_filter, "minFilter": min_filter, "wrapS": wrap_s, "wrapT": wrap_t}
        if name is not None: spec["name"] = name
        return self._add("samplers", spec)

    def add_material(self, *, base_color_texture: int | None = None, base_color_factor: Sequence[float] = (1, 1, 1, 1),
                     unlit: bool = True, double_sided: bool = False, name: str | None = None) -> int:
        """添加只含 baseColor 的 PBR/unlit 材质。"""
        pbr: dict[str, Any] = {"baseColorFactor": [float(value) for value in base_color_factor], "metallicFactor": 0.0, "roughnessFactor": 1.0}
        if len(pbr["baseColorFactor"]) != 4: raise ValueError("base_color_factor 必须是 RGBA 四元组")
        if base_color_texture is not None: pbr["baseColorTexture"] = {"index": int(base_color_texture)}
        spec: dict[str, Any] = {"pbrMetallicRoughness": pbr}
        if unlit:
            spec["extensions"] = {"KHR_materials_unlit": {}}
            used = self.document.setdefault("extensionsUsed", [])
            if "KHR_materials_unlit" not in used: used.append("KHR_materials_unlit")
        if double_sided: spec["doubleSided"] = True
        if name is not None: spec["name"] = name
        return self._add("materials", spec)

    def add_node(self, *, name: str | None = None, children: Iterable[int] | None = None, mesh: int | None = None, skin: int | None = None,
                 matrix: np.ndarray | Sequence[float] | None = None, translation: Sequence[float] | None = None,
                 rotation: Sequence[float] | None = None, scale: Sequence[float] | None = None) -> int:
        """添加 glTF 节点；matrix 为 Python 4×4 时自动列主序编码。"""
        spec: dict[str, Any] = {}
        if name is not None: spec["name"] = name
        if children is not None: spec["children"] = [int(value) for value in children]
        if mesh is not None: spec["mesh"] = int(mesh)
        if skin is not None: spec["skin"] = int(skin)
        if matrix is not None:
            if any(value is not None for value in (translation, rotation, scale)): raise ValueError("matrix 与 TRS 不可并存")
            value = np.asarray(matrix, dtype=np.float64)
            spec["matrix"] = value.T.reshape(-1).tolist() if value.shape == (4, 4) else value.reshape(16).tolist()
        else:
            if translation is not None: spec["translation"] = [float(value) for value in translation]
            if rotation is not None: spec["rotation"] = [float(value) for value in rotation]
            if scale is not None: spec["scale"] = [float(value) for value in scale]
        return self._add("nodes", spec)

    def add_scene(self, nodes: Iterable[int], *, name: str | None = None, make_default: bool = True) -> int:
        """添加场景并可设为默认场景。"""
        spec: dict[str, Any] = {"nodes": [int(value) for value in nodes]}
        if name is not None: spec["name"] = name
        index = self._add("scenes", spec)
        if make_default: self.document["scene"] = index
        return index

    def add_skin(self, joints: Iterable[int], inverse_bind_accessor: int, *, skeleton: int | None = None, name: str | None = None) -> int:
        """添加 skin，joints 顺序保持调用方给定顺序。"""
        spec: dict[str, Any] = {"joints": [int(value) for value in joints], "inverseBindMatrices": int(inverse_bind_accessor)}
        if skeleton is not None: spec["skeleton"] = int(skeleton)
        if name is not None: spec["name"] = name
        return self._add("skins", spec)

    def add_mesh(self, mesh: Mesh, *, material_map: Sequence[int] | None = None) -> int:
        """写统一 Mesh；JOINTS_0=u16、WEIGHTS_0=f32、_REGION=u8 SCALAR。"""
        ranges = mesh.primitives or [PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices),
                                                    int(mesh.material_indices[0]) if len(mesh.material_indices) else None)]
        primitives = []
        for ordinal, section in enumerate(ranges):
            sl = slice(section.vertex_start, section.vertex_start + section.vertex_count)
            local_indices = np.asarray(mesh.indices[section.index_start:section.index_start + section.index_count], dtype=np.int64) - section.vertex_start
            if np.any(local_indices < 0) or np.any(local_indices >= section.vertex_count): raise ValueError("primitive indices 越过自己的顶点区间")
            attributes: dict[str, int] = {"POSITION": self.add_accessor(mesh.positions[sl], component_type=5126, type_name="VEC3", target=34962)}
            if mesh.normals is not None: attributes["NORMAL"] = self.add_accessor(mesh.normals[sl], component_type=5126, type_name="VEC3", target=34962)
            if mesh.uvs is not None: attributes["TEXCOORD_0"] = self.add_accessor(mesh.uvs[sl], component_type=5126, type_name="VEC2", target=34962)
            if mesh.joints is not None: attributes["JOINTS_0"] = self.add_accessor(mesh.joints[sl], component_type=5123, type_name="VEC4", target=34962)
            if mesh.weights is not None: attributes["WEIGHTS_0"] = self.add_accessor(mesh.weights[sl], component_type=5126, type_name="VEC4", target=34962)
            if mesh.regions is not None: attributes["_REGION"] = self.add_accessor(mesh.regions[sl], component_type=5121, type_name="SCALAR", target=34962)
            max_index = int(local_indices.max(initial=0)); index_type = 5123 if max_index <= 65535 else 5125
            primitive: dict[str, Any] = {"attributes": attributes, "indices": self.add_accessor(local_indices, component_type=index_type,
                                                                                                    type_name="SCALAR", target=34963), "mode": 4}
            source_material = section.material if section.material is not None else (int(mesh.material_indices[ordinal]) if ordinal < len(mesh.material_indices) and mesh.material_indices[ordinal] >= 0 else None)
            if source_material is not None: primitive["material"] = int(material_map[source_material] if material_map is not None else source_material)
            primitives.append(primitive)
        spec: dict[str, Any] = {"primitives": primitives}
        if mesh.name is not None: spec["name"] = mesh.name
        return self._add("meshes", spec)

    def add_animation(self, name: str, channels: Sequence[dict[str, Any]]) -> int:
        """添加动画；channel 含 node/path/timesSec/values，插值默认 LINEAR。"""
        samplers, output_channels = [], []
        widths = {"translation": "VEC3", "rotation": "VEC4", "scale": "VEC3", "weights": "SCALAR"}
        for channel in channels:
            path = str(channel["path"]); times = np.asarray(channel["timesSec"], dtype=np.float32).reshape(-1)
            values = np.asarray(channel["values"], dtype=np.float32)
            if path not in widths or len(times) != len(values): raise ValueError("动画 channel 的 path 或关键帧数量无效")
            input_accessor = self.add_accessor(times, component_type=5126, type_name="SCALAR", name=f"{name}_time_sec")
            output_accessor = self.add_accessor(values, component_type=5126, type_name=widths[path], name=f"{name}_{path}")
            samplers.append({"input": input_accessor, "output": output_accessor, "interpolation": channel.get("interpolation", "LINEAR")})
            output_channels.append({"sampler": len(samplers) - 1, "target": {"node": int(channel["node"]), "path": path}})
        return self._add("animations", {"name": name, "samplers": samplers, "channels": output_channels})

    def to_bytes(self) -> bytes:
        """序列化为 GLB 2.0 字节。"""
        self.document["buffers"] = [{"byteLength": len(self.binary)}]
        json_payload = json.dumps(self.document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        json_payload += b" " * ((-len(json_payload)) % 4)
        binary_payload = bytes(self.binary) + b"\x00" * ((-len(self.binary)) % 4)
        total = 12 + 8 + len(json_payload) + (8 + len(binary_payload) if binary_payload else 0)
        result = bytearray(struct.pack("<III", MAGIC, 2, total))
        result += struct.pack("<II", len(json_payload), JSON_CHUNK) + json_payload
        if binary_payload: result += struct.pack("<II", len(binary_payload), BIN_CHUNK) + binary_payload
        return bytes(result)

    def write(self, path: os.PathLike[str] | str) -> None:
        """原子写 GLB 文件（同目录临时文件 + replace）。"""
        destination = Path(path); destination.parent.mkdir(parents=True, exist_ok=True)
        descriptor, temporary = tempfile.mkstemp(prefix=f".{destination.name}.", suffix=".tmp", dir=destination.parent)
        try:
            with os.fdopen(descriptor, "wb") as handle: handle.write(self.to_bytes())
            os.replace(temporary, destination)
        except BaseException:
            try: os.unlink(temporary)
            except FileNotFoundError: pass
            raise


def _copy_skin_nodes(builder: GLBBuilder, skin: Skin) -> tuple[dict[int, int], list[int]]:
    source = skin.source
    included = set(skin.joints)
    if skin.skeleton is not None:
        included.add(skin.skeleton)
    for joint in tuple(included):
        cursor = joint
        while cursor in source.parents:
            cursor = source.parents[cursor]; included.add(cursor)
    mapping: dict[int, int] = {}
    for old in sorted(included):
        node = source.json["nodes"][old]
        spec = {key: copy.deepcopy(node[key]) for key in ("name", "matrix", "translation", "rotation", "scale", "extras", "extensions") if key in node}
        mapping[old] = builder._add("nodes", spec)
    for old in sorted(included):
        children = [mapping[child] for child in source.json["nodes"][old].get("children", []) if child in included]
        if children: builder.document["nodes"][mapping[old]]["children"] = children
    roots = [mapping[index] for index in sorted(included) if index not in source.parents or source.parents[index] not in included]
    return mapping, roots


def write_skinned_glb(
    out: os.PathLike[str] | str, mesh: Mesh, template_skin: Skin, material: dict[str, Any] | None = None,
    images: Sequence[ImageData | bytes | tuple[bytes, str]] = (),
) -> None:
    """写蒙皮 GLB：模板关节顺序、IBM 元素字节、骨名/TRS/层级保持不变，不复制动画。

    ``material`` 使用 ``GLBBuilder.add_material`` 的关键字，可额外给 ``sampler`` 字典与
    ``textureImage`` 图片序号。若传入图片裸 bytes，材质需给 ``imageMimeTypes``。
    """
    if mesh.joints is None or mesh.weights is None: raise ValueError("蒙皮 mesh 必须含 JOINTS_0 与 WEIGHTS_0")
    builder = GLBBuilder(); config = dict(material or {})
    image_mimes = config.pop("imageMimeTypes", [])
    image_ids = []
    for index, image in enumerate(images):
        if isinstance(image, tuple): image_ids.append(builder.add_image(image[0], mime_type=image[1]))
        elif isinstance(image, bytes):
            if index >= len(image_mimes): raise ValueError("bytes 图片缺 imageMimeTypes")
            image_ids.append(builder.add_image(image, mime_type=image_mimes[index]))
        else: image_ids.append(builder.add_image(image))
    texture_image = config.pop("textureImage", 0 if image_ids else None)
    if texture_image is not None:
        if int(texture_image) >= len(image_ids): raise ValueError("textureImage 越界")
        sampler = builder.add_sampler(**config.pop("sampler", {})); config["base_color_texture"] = builder.add_texture(image_ids[int(texture_image)], sampler_index=sampler)
    material_index = builder.add_material(**config)
    if not mesh.primitives:
        mesh.primitives = [PrimitiveRange(0, len(mesh.positions), 0, len(mesh.indices), 0)]
    else:
        mesh = copy.copy(mesh); mesh.primitives = [PrimitiveRange(p.vertex_start, p.vertex_count, p.index_start, p.index_count,
                                                                     0, p.mesh_index, p.primitive_index, p.mode, p.attributes) for p in mesh.primitives]
    mesh_index = builder.add_mesh(mesh, material_map=[material_index])
    node_mapping, roots = _copy_skin_nodes(builder, template_skin)
    if template_skin.inverse_bind_accessor is None:
        ibm_accessor = builder.add_accessor(template_skin.inverse_bind_matrices, component_type=5126, type_name="MAT4", name="inverseBindMatrices")
    else:
        ibm_accessor = builder.add_raw_accessor(template_skin.source, template_skin.inverse_bind_accessor, name="inverseBindMatrices")
    joints = [node_mapping[index] for index in template_skin.joints]
    skeleton = node_mapping.get(template_skin.skeleton) if template_skin.skeleton is not None else joints[0]
    skin_index = builder.add_skin(joints, ibm_accessor, skeleton=skeleton, name=template_skin.name)
    template_mesh_nodes = [(index, node) for index, node in enumerate(template_skin.source.json.get("nodes", []))
                           if node.get("skin") == template_skin.index]
    template_node_index, template_node = template_mesh_nodes[0] if template_mesh_nodes else (None, {})
    node_spec = {key: copy.deepcopy(template_node[key]) for key in ("matrix", "translation", "rotation", "scale") if key in template_node}
    node_spec.update({"name": mesh.name or template_node.get("name", "DressupMesh"), "mesh": mesh_index, "skin": skin_index})
    mesh_node = builder._add("nodes", node_spec)
    template_parent = template_skin.source.parents.get(template_node_index) if template_node_index is not None else None
    if template_parent in node_mapping:
        builder.document["nodes"][node_mapping[template_parent]].setdefault("children", []).append(mesh_node)
    else:
        roots.append(mesh_node)
    builder.add_scene(roots, name="DressupScene")
    builder.write(out)


__all__ = [
    "GLB", "GLBBuilder", "ImageData", "Mesh", "PrimitiveRange", "Skin", "load_glb", "write_skinned_glb",
]


def main(argv: Sequence[str] | None = None) -> int:
    """命令行校验一个 GLB；完整报告请使用 inspect.py。"""
    parser = argparse.ArgumentParser(description="校验并概览 GLB 2.0（坐标单位：模型单位 mu）")
    parser.add_argument("path", nargs="?", help="待校验 .glb；压缩输入会自动解压")
    args = parser.parse_args(argv)
    if args.path is None:
        parser.print_help(); return 0
    try:
        glb = load_glb(args.path); meshes = glb.meshes()
    except (OSError, ValueError, NotImplementedError, RuntimeError) as exc:
        print(f"错误：{exc}", file=sys.stderr); return 2
    result = {"file": str(args.path), "meshes": len(meshes), "vertices": sum(len(mesh.positions) for mesh in meshes),
              "triangles": sum(len(mesh.indices) // 3 for mesh in meshes), "joints": len(glb.skin().joints) if glb.json.get("skins") else 0}
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
