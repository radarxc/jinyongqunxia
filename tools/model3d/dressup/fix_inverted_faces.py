#!/usr/bin/env python3
"""按 E2c 点积口径翻正三角面，只交换原 GLB 中第 2、3 个索引的字节。

面号从 0 起，按 mesh / primitive / triangle 顺序累计；中心 y 使用网格
局部坐标（mu）。拒绝压缩、稀疏、无索引或非 TRIANGLES 输入，避免重建
accessor 破坏字节不变约束。JSON / 图片 / 未识别 chunk 也逐字节保留。
glTF 2.0（2026-10-11 核实）：索引按小端存储，TRIANGLES 每 3 项一面。
参考：https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes
"""

from __future__ import annotations

import argparse
from hashlib import sha256
import json
import os
from pathlib import Path
import struct
import sys
import tempfile
from typing import Any, Sequence

# glb_io 先处理同目录 inspect.py 对标准库 inspect 的遮蔽，再导入 NumPy。
try:
    from .glb_io import GLB, BIN_CHUNK, COMPONENT_DTYPES, _parse_glb
except ImportError:
    from glb_io import GLB, BIN_CHUNK, COMPONENT_DTYPES, _parse_glb

import numpy as np


def _read(path: Path) -> tuple[bytes, GLB, int]:
    raw = path.read_bytes()
    document, binary = _parse_glb(path)
    compressed = {"EXT_meshopt_compression", "KHR_meshopt_compression",
                  "KHR_draco_mesh_compression"}
    extensions = set(document.get("extensionsUsed", []))
    for view in document.get("bufferViews", []):
        extensions.update(view.get("extensions", {}))
    for mesh in document.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            extensions.update(primitive.get("extensions", {}))
    if compressed & extensions:
        raise ValueError("压缩 GLB 无法保证仅修改索引字节；请提供未压缩正本")
    if len(document.get("buffers", [])) != 1:
        raise ValueError("必须恰有一个内嵌 buffer")
    offset, starts = 12, []
    while offset < len(raw):
        length, kind = struct.unpack_from("<II", raw, offset)
        if kind == BIN_CHUNK:
            starts.append(offset + 8)
        offset += 8 + length
    if len(starts) != 1:
        raise ValueError("必须恰有一个 BIN chunk")
    return raw, GLB(path, document, binary), starts[0]


def _index_layout(glb: GLB, index: int) -> tuple[int, int, int]:
    accessor = glb.json["accessors"][index]
    if (accessor.get("type") != "SCALAR" or accessor.get("normalized", False)
            or accessor.get("componentType") not in (5121, 5123, 5125)):
        raise ValueError(f"索引 accessor {index} 必须为非 normalized 的 u8/u16/u32 SCALAR")
    glb.accessor_bytes(index)  # 检查 sparse / stride / bufferView 边界。
    view = glb.json["bufferViews"][accessor["bufferView"]]
    width = COMPONENT_DTYPES[accessor["componentType"]].itemsize
    start = int(view.get("byteOffset", 0)) + int(accessor.get("byteOffset", 0))
    return start, int(view.get("byteStride", width)), width


def _distribution(centers: list[float]) -> dict[str, Any]:
    counts: dict[int, int] = {}
    for y in centers:
        key = int(np.floor(y * 10))
        counts[key] = counts.get(key, 0) + 1
    return {"unit": "mu", "space": "mesh-local", "count": len(centers),
            "min": min(centers) if centers else None,
            "max": max(centers) if centers else None,
            "mean": float(np.mean(centers)) if centers else None,
            "bins": [{"minInclusive": key / 10, "maxExclusive": (key + 1) / 10,
                      "count": count} for key, count in sorted(counts.items())]}


def _scan(glb: GLB) -> tuple[dict[str, Any], dict[int, int], set[int]]:
    patches: dict[int, int] = {}
    seen: dict[int, np.ndarray] = {}
    faces: list[dict[str, Any]] = []
    centers: list[float] = []
    total, primitives, unique_fixed = 0, 0, 0
    for mi, mesh in enumerate(glb.json.get("meshes", [])):
        for pi, primitive in enumerate(mesh.get("primitives", [])):
            label = f"mesh {mi} primitive {pi}"
            attrs = primitive.get("attributes", {})
            if primitive.get("mode", 4) != 4 or "indices" not in primitive:
                raise ValueError(f"{label}: 必须为有索引的 TRIANGLES")
            if not {"POSITION", "NORMAL"} <= attrs.keys():
                raise ValueError(f"{label}: 缺少 POSITION / NORMAL")
            positions = np.asarray(glb.accessor(attrs["POSITION"]), dtype=np.float64)
            normals = np.asarray(glb.accessor(attrs["NORMAL"]), dtype=np.float64)
            if (positions.ndim != 2 or positions.shape[1] != 3
                    or positions.shape != normals.shape
                    or not np.all(np.isfinite(positions)) or not np.all(np.isfinite(normals))):
                raise ValueError(f"{label}: 顶点 / 法线必须为同长有限 N×3")
            index = int(primitive["indices"])
            start, stride, width = _index_layout(glb, index)
            indices = glb.accessor(index, normalized=False)
            if len(indices) % 3 or (len(indices) and int(indices.max()) >= len(positions)):
                raise ValueError(f"{label}: 三角索引数量或顶点下标无效")
            triangles = indices.reshape(-1, 3)
            points = positions[triangles]
            geometric = np.cross(points[:, 1] - points[:, 0], points[:, 2] - points[:, 0])
            dot = np.einsum("ij,ij->i", geometric, normals[triangles].sum(axis=1))
            if not np.all(np.isfinite(dot)):
                raise ValueError(f"{label}: 法向点积溢出")
            inverted = np.flatnonzero(dot < 0)
            if index in seen and not np.array_equal(seen[index], inverted):
                raise ValueError(f"{label}: 共享索引 accessor 的法线方向冲突")
            if index not in seen:
                seen[index] = inverted
                unique_fixed += len(inverted)
                for face in inverted:
                    left = start + (int(face) * 3 + 1) * stride
                    right = left + stride
                    for dst, src in ((left, right), (right, left)):
                        for byte in range(width):
                            value = glb.bin[src + byte]
                            if dst + byte in patches and patches[dst + byte] != value:
                                raise ValueError("重叠索引 accessor 的翻面结果冲突")
                            patches[dst + byte] = value
            for face in inverted:
                y = float(points[face, :, 1].mean())
                centers.append(y)
                if len(faces) < 50:
                    faces.append({"index": total + int(face), "mesh": mi,
                                  "primitive": pi, "triangle": int(face), "centerYMu": y})
            total += len(triangles)
            primitives += 1
    if not primitives:
        raise ValueError("GLB 没有可检查的三角 primitive")
    # 即使不同 accessor 别名引用同一段 BIN，也不能误改未选中的面。
    binary = bytearray(glb.bin)
    for offset, value in patches.items():
        binary[offset] = value
    repaired = GLB(glb.path, glb.json, bytes(binary))
    for index, inverted in seen.items():
        expected = glb.accessor(index, normalized=False).reshape(-1, 3)
        expected[inverted] = expected[inverted][:, [0, 2, 1]]
        if not np.array_equal(repaired.accessor(index).reshape(-1, 3), expected):
            raise ValueError("重叠索引 accessor 会改变未选中的三角")
    report = {"triangles": total, "primitives": primitives, "invertedFaces": len(centers),
              "uniqueInvertedFaces": unique_fixed, "faceIndices": [face["index"] for face in faces],
              "faces": faces, "centerY": _distribution(centers)}
    return report, patches, set(seen)


def _write_atomic(path: Path, payload: bytes, source: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = (path if path.exists() else source).stat().st_mode & 0o777
    fd, temporary = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            os.fchmod(handle.fileno(), mode)
            handle.write(payload)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def fix_faces(body_path: Path, out_path: Path | None = None, *, check: bool = False) -> dict[str, Any]:
    """统计或翻正所有 primitive；失败前不写出，支持原地修复与逐字节幂等。"""
    if not check and out_path is None:
        raise ValueError("修复需要 --out；只读统计请用 --check")
    raw, glb, bin_start = _read(body_path)
    report, patches, index_ids = _scan(glb)
    output = bytearray(raw)
    for offset, value in patches.items():
        output[bin_start + offset] = value
    repaired = GLB(glb.path, glb.json, bytes(output[bin_start:bin_start + len(glb.bin)]))
    protected = set()
    for mesh in glb.json.get("meshes", []):
        for primitive in mesh.get("primitives", []):
            protected.update(primitive.get("attributes", {}).values())
            for target in primitive.get("targets", []):
                protected.update(target.values())
    for animation in glb.json.get("animations", []):
        for sampler in animation.get("samplers", []):
            protected.update((sampler["input"], sampler["output"]))
    protected.update(skin["inverseBindMatrices"] for skin in glb.json.get("skins", [])
                     if "inverseBindMatrices" in skin)
    for index in range(len(glb.json.get("accessors", []))):
        if ((index not in index_ids or index in protected)
                and glb.accessor_bytes(index) != repaired.accessor_bytes(index)):
            raise ValueError(f"索引与非索引 accessor {index} 重叠，无法保证字节不变")
    remaining, _, _ = _scan(repaired)
    if remaining["invertedFaces"]:
        raise ValueError("翻正后的点积检查未归零")
    if not check:
        assert out_path is not None
        if out_path.resolve() != body_path.resolve() or output != raw:
            _write_atomic(out_path, bytes(output), body_path)
    result = {"ok": not check or report["invertedFaces"] == 0, "check": check, **report,
              "fixedFaces": 0 if check else report["invertedFaces"],
              "inputSha256": sha256(raw).hexdigest(),
              "outputSha256": sha256(raw if check else output).hexdigest()}
    return result


def main(argv: Sequence[str] | None = None) -> int:
    """退出码：0 成功，1 为 --check 有倒置面，2 为输入 / 写出错误。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--body", required=True, type=Path, help="待检查的未压缩 GLB")
    parser.add_argument("--out", type=Path, help="输出 GLB，可与 --body 相同")
    parser.add_argument("--check", action="store_true", help="只统计，不写文件；有倒置面退出 1")
    parser.add_argument("--json", action="store_true", help="stdout 只输出单个 JSON 对象")
    args = parser.parse_args(argv)
    try:
        result = fix_faces(args.body, args.out, check=args.check)
    except (OSError, ValueError, NotImplementedError, KeyError, IndexError, TypeError) as exc:
        if args.json:
            print(json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False))
        else:
            print(f"错误：{exc}", file=sys.stderr)
        return 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, separators=(",", ":"), allow_nan=False))
    else:
        print(f"{result['primitives']} primitive / {result['triangles']} 三角，"
              f"倒置面 {result['invertedFaces']}，翻正 {result['fixedFaces']}")
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
