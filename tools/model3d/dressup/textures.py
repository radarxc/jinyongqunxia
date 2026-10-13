#!/usr/bin/env python3
"""整理换装 GLB 材质：baseColor JPEG、删除 PBR 贴图并改为 unlit。"""

from __future__ import annotations

import argparse
import base64
import copy
import io
import json
import mimetypes
from pathlib import Path
import struct
import sys
from typing import Any, Sequence
from urllib.parse import unquote_to_bytes

from PIL import Image

MAGIC = 0x46546C67; JSON_CHUNK = 0x4E4F534A; BIN_CHUNK = 0x004E4942


def _parse(path: Path) -> tuple[dict[str, Any], bytes]:
    data = path.read_bytes()
    if len(data) < 20 or struct.unpack_from("<III", data) != (MAGIC, 2, len(data)):
        raise ValueError(f"{path} 不是有效 GLB 2.0")
    offset = 12; document = None; binary = b""
    while offset < len(data):
        length, kind = struct.unpack_from("<II", data, offset); offset += 8
        payload = data[offset:offset + length]; offset += length
        if kind == JSON_CHUNK: document = json.loads(payload.rstrip(b" \0"))
        elif kind == BIN_CHUNK: binary = payload
    if document is None: raise ValueError("GLB 缺 JSON chunk")
    if "EXT_meshopt_compression" in document.get("extensionsUsed", []):
        raise ValueError("textures.py 请在 pack_glb.mjs 之前运行（输入不可已 meshopt 压缩）")
    return document, binary


def _image_bytes(path: Path, document: dict[str, Any], binary: bytes, index: int) -> bytes:
    spec = document["images"][index]
    if "bufferView" in spec:
        view = document["bufferViews"][spec["bufferView"]]
        start = int(view.get("byteOffset", 0)); return binary[start:start + int(view["byteLength"])]
    uri = spec.get("uri", "")
    if uri.startswith("data:"):
        head, payload = uri.split(",", 1)
        return base64.b64decode(payload) if head.endswith(";base64") else unquote_to_bytes(payload)
    if uri: return (path.parent / uri).read_bytes()
    raise ValueError(f"image {index} 缺 bufferView/uri")


def _jpeg(raw: bytes, maximum: int, quality: int) -> tuple[bytes, list[int]]:
    with Image.open(io.BytesIO(raw)) as source:
        source.load(); image = source.convert("RGBA")
        if max(image.size) > maximum:
            image.thumbnail((maximum, maximum), Image.Resampling.LANCZOS)
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.getchannel("A"))
        output = io.BytesIO(); background.save(output, format="JPEG", quality=quality, optimize=True)
        return output.getvalue(), [int(image.width), int(image.height)]


def _pad(value: int) -> int: return (value + 3) & ~3


def _encode(document: dict[str, Any], binary: bytes) -> bytes:
    raw = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode()
    json_bytes = raw + b" " * (_pad(len(raw)) - len(raw))
    bin_bytes = binary + b"\0" * (_pad(len(binary)) - len(binary))
    total = 12 + 8 + len(json_bytes) + (8 + len(bin_bytes) if bin_bytes else 0)
    result = bytearray(struct.pack("<III", MAGIC, 2, total))
    result += struct.pack("<II", len(json_bytes), JSON_CHUNK) + json_bytes
    if bin_bytes: result += struct.pack("<II", len(bin_bytes), BIN_CHUNK) + bin_bytes
    return bytes(result)


def transform(source: Path, target: Path, maximum: int, quality: int, double_sided: bool) -> dict[str, Any]:
    old, old_bin = _parse(source); document = copy.deepcopy(old)
    used_textures: list[int] = []
    for material in document.get("materials", []):
        pbr = material.setdefault("pbrMetallicRoughness", {})
        base = pbr.get("baseColorTexture")
        if base is not None: used_textures.append(int(base["index"]))
        pbr.pop("metallicRoughnessTexture", None); pbr.pop("metallicFactor", None); pbr.pop("roughnessFactor", None)
        for field in ("normalTexture", "occlusionTexture", "emissiveTexture", "emissiveFactor"):
            material.pop(field, None)
        extensions = material.setdefault("extensions", {}); extensions["KHR_materials_unlit"] = {}
        if double_sided: material["doubleSided"] = True
    texture_map = {old_index: new for new, old_index in enumerate(dict.fromkeys(used_textures))}
    textures = [copy.deepcopy(document.get("textures", [])[index]) for index in texture_map]
    image_indices = list(dict.fromkeys(int(texture["source"]) for texture in textures))
    image_map = {old_index: new for new, old_index in enumerate(image_indices)}
    for texture in textures: texture["source"] = image_map[int(texture["source"])]
    for material in document.get("materials", []):
        base = material.get("pbrMetallicRoughness", {}).get("baseColorTexture")
        if base is not None: base["index"] = texture_map[int(base["index"])]
    chunks: list[bytes] = []; views: list[dict[str, Any]] = []; old_to_new: dict[int, int] = {}
    image_sizes: list[list[int]] = []
    # 保留所有非 image bufferView（几何、动画、IBM）；图片统一 JPEG 后追加。
    old_image_views = {int(image["bufferView"]) for image in old.get("images", []) if "bufferView" in image}
    offset = 0
    for index, view in enumerate(old.get("bufferViews", [])):
        if index in old_image_views: continue
        if int(view.get("buffer", 0)) != 0: raise ValueError("只支持单一内嵌 buffer")
        start = int(view.get("byteOffset", 0)); payload = old_bin[start:start + int(view["byteLength"])]
        offset = _pad(offset); old_to_new[index] = len(views)
        spec = {key: copy.deepcopy(value) for key, value in view.items() if key != "byteOffset"}
        spec["buffer"] = 0; spec["byteOffset"] = offset; spec["byteLength"] = len(payload)
        chunks.append(b"\0" * (offset - sum(len(chunk) for chunk in chunks)) + payload); offset += len(payload); views.append(spec)
    images: list[dict[str, Any]] = []
    for old_index in image_indices:
        payload, size = _jpeg(_image_bytes(source, old, old_bin, old_index), maximum, quality)
        offset = _pad(offset); current = sum(len(chunk) for chunk in chunks)
        chunks.append(b"\0" * (offset - current) + payload)
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(payload)})
        images.append({"bufferView": len(views) - 1, "mimeType": "image/jpeg",
                       **({"name": old["images"][old_index]["name"]} if old["images"][old_index].get("name") else {})})
        image_sizes.append(size); offset += len(payload)
    binary = b"".join(chunks)
    for accessor in document.get("accessors", []):
        if "bufferView" in accessor: accessor["bufferView"] = old_to_new[int(accessor["bufferView"])]
        sparse = accessor.get("sparse")
        if sparse:
            sparse["indices"]["bufferView"] = old_to_new[int(sparse["indices"]["bufferView"])]
            sparse["values"]["bufferView"] = old_to_new[int(sparse["values"]["bufferView"])]
    document["bufferViews"] = views; document["textures"] = textures; document["images"] = images
    document["buffers"] = [{"byteLength": len(binary)}]
    extensions = set(document.get("extensionsUsed", [])); extensions.add("KHR_materials_unlit")
    document["extensionsUsed"] = sorted(extensions)
    target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(_encode(document, binary))
    return {"inputBytes": source.stat().st_size, "outputBytes": target.stat().st_size,
            "baseColorImages": len(images), "imageSizes": image_sizes}


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="输入 GLB")
    parser.add_argument("output", type=Path, help="输出 GLB")
    parser.add_argument("--max", type=int, default=2048, dest="maximum", help="baseColor 最大边（默认 2048）")
    parser.add_argument("--quality", type=int, default=85, help="JPEG 质量（默认 85）")
    parser.add_argument("--double-sided", action="store_true", help="材质设 doubleSided")
    args = parser.parse_args(argv)
    if args.maximum < 1 or not 1 <= args.quality <= 100:
        parser.error("--max 必须 >= 1，--quality 必须在 1..100")
    try:
        print(json.dumps(transform(args.input, args.output, args.maximum, args.quality, args.double_sided), ensure_ascii=False))
        return 0
    except (OSError, ValueError, KeyError, IndexError, json.JSONDecodeError) as exc:
        print(f"错误：{exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
