#!/usr/bin/env python3
"""调度器校验辅助：素材目录的 manifest.yaml 与图片文件是否齐全、有效。

用法（在工作区根目录运行）：
    python3 tools/agents/check_assets.py assets/default/baseline/map --min 1 --max 2

检查：
- 目录下有 manifest.yaml（顶层为列表，或 {assets: [...]}）；
- 图片条目数在 [min, max] 之间（按 file 扩展名 png/jpg/jpeg/webp 计，代码类附件不计）；
- 每条都有必填字段且非空；file 存在、确为 PNG/JPEG/WebP、短边 ≥ 512 像素、size 与实际一致、sha256 一致；
- status 为 candidate / approved / rejected 之一；
- 条目声明了 code（如招式的可运行效果代码）时，该路径存在。
"""
import argparse
import hashlib
import sys
from pathlib import Path

import yaml
from PIL import Image

REQUIRED = ["id", "file", "category", "style", "subject", "prompt", "tool", "model", "created", "size", "sha256", "status"]
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp"}
STATUSES = {"candidate", "approved", "rejected"}


def load_entries(manifest: Path) -> list:
    data = yaml.safe_load(manifest.read_text(encoding="utf-8"))
    if isinstance(data, dict):
        data = data.get("assets", [])
    if not isinstance(data, list):
        raise ValueError("manifest.yaml 顶层应为列表，或含 assets 列表的映射")
    return data


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--min", type=int, default=1)
    ap.add_argument("--max", type=int, default=2)
    ap.add_argument("--min-side", type=int, default=512)
    a = ap.parse_args()
    d = Path(a.dir)
    manifest = d / "manifest.yaml"
    if not manifest.is_file():
        print(f"缺少 {manifest}")
        return 1
    try:
        entries = load_entries(manifest)
    except Exception as e:  # noqa: BLE001
        print(f"manifest.yaml 解析失败：{e}")
        return 1
    problems = []
    images = 0
    ids = set()
    for i, e in enumerate(entries, 1):
        if not isinstance(e, dict):
            problems.append(f"第 {i} 条不是映射")
            continue
        tag = e.get("id") or f"第 {i} 条"
        for k in REQUIRED:
            if not str(e.get(k, "")).strip():
                problems.append(f"{tag}：缺字段 {k}")
        if e.get("id") in ids:
            problems.append(f"{tag}：id 重复")
        ids.add(e.get("id"))
        if str(e.get("status", "")).strip() and e.get("status") not in STATUSES:
            problems.append(f"{tag}：status 应为 {sorted(STATUSES)} 之一")
        f = d / str(e.get("file", ""))
        if f.suffix.lower() in IMAGE_EXT:
            images += 1
            if not f.is_file():
                problems.append(f"{tag}：文件不存在 {f}")
                continue
            try:
                with Image.open(f) as im:
                    im.verify()
                with Image.open(f) as im:
                    w, h = im.size
                    fmt = im.format
            except Exception as ex:  # noqa: BLE001
                problems.append(f"{tag}：不是有效图片（{ex}）")
                continue
            if fmt not in {"PNG", "JPEG", "WEBP"}:
                problems.append(f"{tag}：格式 {fmt} 不在 PNG/JPEG/WebP 之内")
            if min(w, h) < a.min_side:
                problems.append(f"{tag}：短边 {min(w, h)} < {a.min_side}")
            size = str(e.get("size", "")).replace("×", "x").replace(" ", "")
            if size and size != f"{w}x{h}":
                problems.append(f"{tag}：size 写 {e.get('size')}，实际 {w}x{h}")
            sha = hashlib.sha256(f.read_bytes()).hexdigest()
            if str(e.get("sha256", "")).strip() and e.get("sha256") != sha:
                problems.append(f"{tag}：sha256 不一致（实际 {sha}）")
        elif str(e.get("file", "")).strip() and not f.exists():
            problems.append(f"{tag}：文件不存在 {f}")
        code = e.get("code")
        if code and not (d / str(code)).exists():
            problems.append(f"{tag}：声明的代码 {code} 不存在")
    if not (a.min <= images <= a.max):
        problems.append(f"图片条目 {images} 张，要求 {a.min}–{a.max} 张")
    for p in problems:
        print("✘", p)
    print(f"{d}：图片 {images} 张，条目 {len(entries)} 条，问题 {len(problems)} 个")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
