#!/usr/bin/env python3
"""为贴图变体准备版型副本（E2b）。

retexture_variant 用版型件贴图做颜色映射。版型件抽取时带进来的皮肤区（E2b 已清成布色）经映射后仍会落在变体的
浅色里（劲装交领带 → 布衣浅米色带）。这里按来源修补：用抽取件原贴图判出污染区（相对源肤色均值 ΔE76 ≤ 阈值 + 余量），
把版型副本贴图里这些纹素换成同一 UV 岛内最近的干净布料纹素（extract_garment.repair_by_reference），其余纹素逐字节
不动；副本贴图无损（PNG）写回，各体型副本共用同一张（retexture 只读主体型贴图）。fit / report / hidemask 原样复制。

输入须为未压缩 GLB（先 pack_glb.mjs --no-meshopt）：retexture 读 meshopt 压缩件会出错，这里也只改写未压缩件。
肤色均值、阈值与余量取版型 fit.json 的 textureCleanup（fit_garment --clean-skin-texture 写入）。

用法：python3 variant_base.py --base <未压缩版型目录> --source <抽取件 GLB> --out <输出目录>
输出目录名须与版型 ID 相同（retexture 以 --base 目录名找 <ID>.glb）。
"""
from __future__ import annotations

import argparse
import copy
from io import BytesIO
import json
from pathlib import Path
import shutil
import struct
import sys
from typing import Any, Sequence

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extract_garment import repair_by_reference  # noqa: E402
from glb_io import GLB, load_glb  # noqa: E402


def _base_color_image(glb: GLB) -> int:
    primitive = glb.json["meshes"][0]["primitives"][0]
    material = glb.json["materials"][int(primitive.get("material", 0))]
    info = material.get("pbrMetallicRoughness", {}).get("baseColorTexture")
    if not isinstance(info, dict) or int(info.get("texCoord", 0)) != 0:
        raise ValueError("版型首个材质须以 TEXCOORD_0 引用 baseColorTexture")
    return int(glb.json["textures"][int(info["index"])]["source"])


def replace_image(glb: GLB, image_index: int, payload: bytes, mime: str, out_path: Path) -> None:
    """重排 BIN：image_index 的 bufferView 换成 payload，其余 bufferView 原样拷贝（4 字节对齐），JSON 只改偏移与 MIME。"""
    document = copy.deepcopy(glb.json)
    if "EXT_meshopt_compression" in document.get("extensionsUsed", []):
        raise ValueError("只改写未压缩 GLB：先用 pack_glb.mjs --no-meshopt 输出")
    if len(document.get("buffers", [])) != 1:
        raise ValueError("只支持单 buffer 的 GLB")
    image = document["images"][image_index]; target = image.get("bufferView")
    if target is None:
        raise ValueError("贴图须内嵌在 GLB 的 bufferView 里")
    binary = bytearray()
    for index, view in enumerate(document["bufferViews"]):
        if view.get("buffer", 0) != 0 or "extensions" in view:
            raise ValueError("bufferView 只能引用 buffer 0 且不带扩展")
        start = int(view.get("byteOffset", 0))
        data = payload if index == target else bytes(glb.bin[start:start + int(view["byteLength"])])
        binary += b"\0" * (-len(binary) % 4)
        view["byteOffset"] = len(binary); view["byteLength"] = len(data); binary += data
    binary += b"\0" * (-len(binary) % 4)
    document["buffers"][0]["byteLength"] = len(binary); image["mimeType"] = mime
    text = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    text += b" " * (-len(text) % 4)
    total = 12 + 8 + len(text) + 8 + len(binary)
    out_path.write_bytes(struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(text), 0x4E4F534A)
                         + text + struct.pack("<II", len(binary), 0x004E4942) + bytes(binary))


def prepare(base: Path, source: Path, out: Path) -> dict[str, Any]:
    base_id = base.name; main = base / f"{base_id}.glb"
    fit = json.loads((base / "fit.json").read_text(encoding="utf-8"))
    cleanup = fit.get("textureCleanup")
    if not isinstance(cleanup, dict) or "skinLabMean" not in cleanup:
        raise ValueError("版型 fit.json 缺 textureCleanup.skinLabMean（先用 fit_garment --clean-skin-texture 贴合）")
    threshold = float(cleanup.get("deltaEThreshold", 18.0)); margin = float(cleanup.get("replacementMarginDeltaE", 6.0))
    glb = load_glb(main); mesh = glb.mesh(); index = _base_color_image(glb)
    source_glb = load_glb(source)
    with Image.open(BytesIO(glb.image(index).data)) as texture, \
            Image.open(BytesIO(source_glb.image(_base_color_image(source_glb)).data)) as reference:
        prepared, stats = repair_by_reference(texture, reference, mesh.uvs, mesh.indices.reshape(-1, 3),
                                              np.asarray(cleanup["skinLabMean"]), threshold, margin)
    stream = BytesIO(); prepared.save(stream, format="PNG", optimize=True); payload = stream.getvalue()
    out.mkdir(parents=True, exist_ok=True); written = []
    for path in sorted(base.glob(f"{base_id}*.glb")):
        replace_image(load_glb(path), index, payload, "image/png", out / path.name); written.append(path.name)
    for path in sorted(base.iterdir()):
        if path.is_file() and path.suffix in (".json", ".png") and not path.name.endswith(".glb"):
            shutil.copy2(path, out / path.name)
    return {**stats, "glbs": written}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--base", type=Path, required=True, help="未压缩版型目录（含 <ID>.glb、fit*.json、report*.json、hidemask*.png）")
    parser.add_argument("--source", type=Path, required=True, help="版型的抽取件 GLB（原贴图带皮肤区）")
    parser.add_argument("--out", type=Path, required=True, help="输出目录，目录名须与版型 ID 相同")
    args = parser.parse_args(argv)
    if args.out.name != args.base.name:
        parser.error("--out 目录名须与版型 ID（--base 目录名）相同")
    print(json.dumps(prepare(args.base, args.source, args.out), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
