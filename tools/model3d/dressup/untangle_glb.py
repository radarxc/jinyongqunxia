#!/usr/bin/env python3
"""减面后衣物的翻面修复（E2b）。

pack_glb 在贴合后的形状上减面，会留下少量在源形状上近乎共线的细长三角（E2b 劲装：袖子上 42 mm 长、
0.16 mm 高），其朝向在源 / 贴合两种形状之间对调，validate 记为翻面。这里对这些三角做局部翻边：与最长
（或任一）边对面的三角交换对角线，只改索引、不动顶点与属性。接受条件：两种形状下新三角都不退化、朝向一致，
且贴合形状上新三角与原两三角的合法向同侧（不折起）。源形状按 validate 的回指口径取（含压紧映射与相似变换）。

用法：python3 untangle_glb.py --asset 减面后.glb（--no-meshopt）--fit fit.json --skeleton skeleton.json --out 修复后.glb
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import struct
import sys
from typing import Any, Sequence

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import umeyama  # noqa: E402
from export_skeleton import _world_mesh  # noqa: E402
from glb_io import load_glb  # noqa: E402
import validate  # noqa: E402

MIN_RELATIVE_HEIGHT = 1e-3      # 新三角在两种形状下最小高须超过最长边的这一比例


def _normals(points: np.ndarray, faces: np.ndarray) -> np.ndarray:
    tri = points[faces]; return np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])


def _healthy(points: np.ndarray, face: Sequence[int]) -> float:
    tri = points[list(face)]
    area2 = float(np.linalg.norm(np.cross(tri[1] - tri[0], tri[2] - tri[0])))
    longest = float(np.max(np.linalg.norm(tri[[1, 2, 0]] - tri, axis=1)))
    return area2 / max(longest * longest, 1e-30)


def untangle(source: np.ndarray, final: np.ndarray, faces: np.ndarray, passes: int = 8
             ) -> tuple[np.ndarray, dict[str, int]]:
    """source / final 为同序顶点（source 已按相似变换对齐到 final）；返回新面表与统计。"""
    faces = np.asarray(faces, dtype=np.int64).copy()
    stats = {"flippedBefore": 0, "edgeFlips": 0, "flippedAfter": 0}
    def flipped_mask() -> np.ndarray:
        return np.einsum("ij,ij->i", _normals(source, faces), _normals(final, faces)) <= 0
    stats["flippedBefore"] = int(np.count_nonzero(flipped_mask()))
    for _ in range(passes):
        bad = np.flatnonzero(flipped_mask())
        if not len(bad): break
        edge_face: dict[tuple[int, int], int] = {}
        for index, face in enumerate(faces):
            for k in range(3): edge_face[(int(face[k]), int(face[(k + 1) % 3]))] = index
        progress = False; touched: set[int] = set()
        for index in bad:
            if index in touched: continue
            face = [int(v) for v in faces[index]]; best = None
            for k in range(3):
                a, b, p = face[k], face[(k + 1) % 3], face[(k + 2) % 3]
                other = edge_face.get((b, a))
                if other is None or other in touched: continue
                q = next(int(v) for v in faces[other] if int(v) not in (a, b))
                if q == p or (p, q) in edge_face or (q, p) in edge_face: continue
                first, second = [a, q, p], [q, b, p]
                combined = _normals(final, np.asarray([face, [int(v) for v in faces[other]]])).sum(axis=0)
                quality = min(_healthy(points, tri) for points in (source, final) for tri in (first, second))
                if quality <= MIN_RELATIVE_HEIGHT: continue
                new = np.asarray([first, second])
                agree = np.einsum("ij,ij->i", _normals(source, new), _normals(final, new))
                if np.any(agree <= 0) or np.any(_normals(final, new) @ combined <= 0): continue
                if best is None or quality > best[0]: best = (quality, other, first, second)
            if best is None: continue
            _, other, first, second = best
            faces[index] = first; faces[other] = second
            touched.update((int(index), int(other))); stats["edgeFlips"] += 1; progress = True
        if not progress: break
    stats["flippedAfter"] = int(np.count_nonzero(flipped_mask()))
    return faces, stats


def _write_indices(glb: Any, faces: np.ndarray, out_path: Path) -> None:
    """把新索引写回原 GLB 的索引缓冲（同长度、同类型），其余 JSON / BIN 逐字节不变（JSON 重新序列化）。"""
    primitive = glb.json["meshes"][0]["primitives"][0]
    accessor = glb.json["accessors"][primitive["indices"]]
    view = glb.json["bufferViews"][accessor["bufferView"]]
    dtype = {5123: "<u2", 5125: "<u4"}.get(accessor["componentType"])
    if dtype is None or accessor["count"] != faces.size or "extensions" in view:
        raise ValueError("只支持未压缩的 uint16 / uint32 索引，且面数不变（先用 pack_glb --no-meshopt 输出）")
    binary = bytearray(glb.bin)
    start = int(view.get("byteOffset", 0)) + int(accessor.get("byteOffset", 0))
    data = faces.reshape(-1).astype(dtype).tobytes()
    binary[start:start + len(data)] = data
    text = json.dumps(glb.json, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    text += b" " * (-len(text) % 4); binary += b"\0" * (-len(binary) % 4)
    total = 12 + 8 + len(text) + 8 + len(binary)
    out_path.write_bytes(struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(text), 0x4E4F534A)
                         + text + struct.pack("<II", len(binary), 0x004E4942) + bytes(binary))


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--asset", type=Path, required=True); parser.add_argument("--fit", type=Path, required=True)
    parser.add_argument("--skeleton", type=Path, required=True); parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args(argv)
    glb = load_glb(args.asset); mesh = _world_mesh(glb)[0]
    fit = json.loads(args.fit.read_text(encoding="utf-8"))
    skeleton = json.loads(args.skeleton.read_text(encoding="utf-8"))
    primitive = glb.json["meshes"][0]["primitives"][0]
    accessor = primitive.get("extras", {}).get("tianshuSourceVertexAccessor")
    rows = None if accessor is None else np.asarray(glb.accessor(int(accessor)), dtype=np.int64).reshape(-1)
    source = validate._expanded_source(validate._garment_source(fit, args.fit, skeleton, mesh, rows), mesh.positions)
    final = mesh.positions.astype(np.float64)
    transform = umeyama(source, final, allow_mirror=False)
    aligned = transform.scale * (source @ transform.rotation.T) + transform.translation
    faces, stats = untangle(aligned, final, mesh.indices.reshape(-1, 3))
    _write_indices(glb, faces, args.out)
    print(json.dumps(stats, ensure_ascii=False))
    return 0 if stats["flippedAfter"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
