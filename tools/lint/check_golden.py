#!/usr/bin/env python3
"""
金样目录检查器：校验 art/golden/ 的规格（T4b 产出与准出共用）。

    python3 tools/lint/check_golden.py art/golden [--max-files 40] [--max-kb 400] [--max-edge 1024] [--json]

规则（tech/07 §7.4 与 tools/agents/prompts/_assets.md）：
  1. 目录内存在 index.yaml，格式为 JSON 兼容的 YAML 列表，每项含 path / subject / variant / sha256 / score；
  2. index 中列出的每个文件存在、sha256 一致、score 为 1–5 且 ≥ 4；
  3. 目录内所有 .webp 都在 index 中（联系表 contact-*.webp 与 review-*.md / notes.md / index.yaml 除外）；
  4. 单文件 ≤ --max-kb（联系表 ≤ 1.5 倍）、长边 ≤ --max-edge、格式为 WebP；
  5. 文件总数（含联系表）≤ --max-files。
只用标准库；不依赖 PyYAML（内置一个只覆盖“- key: value”列表块的最小解析器）。
"""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
import sys
from pathlib import Path


def parse_index(text: str) -> list:
    """解析形如
        - path: a/b.webp
          subject: pc_main_m
          score: 4
    的 YAML 子集；值去掉首尾引号；不支持嵌套、锚点、多文档。"""
    items, cur = [], None
    for ln in text.splitlines():
        s = ln.rstrip()
        if not s.strip() or s.lstrip().startswith("#"):
            continue
        stripped = s.lstrip()
        if stripped.startswith("- "):
            cur = {}
            items.append(cur)
            stripped = stripped[2:].strip()
            if not stripped:
                continue
        if cur is None:
            raise ValueError(f"index.yaml：列表项之外的内容：{s!r}")
        if ":" not in stripped:
            raise ValueError(f"index.yaml：无法解析的行：{s!r}")
        k, v = stripped.split(":", 1)
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in "\"'":
            v = v[1:-1]
        cur[k.strip()] = v
    return items


def webp_size(data: bytes):
    """返回 (width, height)；非 WebP 返回 None。支持 VP8 / VP8L / VP8X。"""
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    chunk = data[12:16]
    if chunk == b"VP8X":
        w = 1 + int.from_bytes(data[24:27], "little")
        h = 1 + int.from_bytes(data[27:30], "little")
        return w, h
    if chunk == b"VP8L":
        b = data[21:25]
        bits = int.from_bytes(b, "little")
        w = (bits & 0x3FFF) + 1
        h = ((bits >> 14) & 0x3FFF) + 1
        return w, h
    if chunk == b"VP8 ":
        # 关键帧：起始码 9d 01 2a 后跟 14 位宽 / 14 位高
        i = data.find(b"\x9d\x01\x2a", 20, 40)
        if i < 0:
            return None
        w, h = struct.unpack("<HH", data[i + 3:i + 7])
        return w & 0x3FFF, h & 0x3FFF
    return None


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("dir")
    ap.add_argument("--max-files", type=int, default=40)
    ap.add_argument("--max-kb", type=int, default=400)
    ap.add_argument("--max-edge", type=int, default=1024)
    ap.add_argument("--min-score", type=int, default=4)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args(argv)
    root = Path(a.dir)
    errors, warnings = [], []
    idx = root / "index.yaml"
    if not idx.is_file():
        errors.append("缺少 index.yaml")
        return report(errors, warnings, a.json)
    try:
        items = parse_index(idx.read_text(encoding="utf-8"))
    except ValueError as e:
        errors.append(str(e))
        return report(errors, warnings, a.json)
    listed = set()
    for i, it in enumerate(items, 1):
        for k in ("path", "subject", "variant", "sha256", "score"):
            if k not in it:
                errors.append(f"index[{i}] 缺少字段 {k}")
        p = root / it.get("path", "")
        if not it.get("path") or not p.is_file():
            errors.append(f"index[{i}] 文件不存在：{it.get('path')}")
            continue
        listed.add(p.resolve())
        data = p.read_bytes()
        if it.get("sha256") and hashlib.sha256(data).hexdigest() != it["sha256"].lower():
            errors.append(f"{it['path']}：sha256 与 index 不一致")
        try:
            sc = int(it.get("score", "0"))
        except ValueError:
            sc = 0
        if not 1 <= sc <= 5:
            errors.append(f"{it['path']}：score 必须为 1–5，得到 {it.get('score')}")
        elif sc < a.min_score:
            errors.append(f"{it['path']}：score {sc} < {a.min_score}，不应进入 golden")
    files = [p for p in root.rglob("*") if p.is_file()]
    webps = [p for p in files if p.suffix.lower() == ".webp"]
    if len(files) > a.max_files:
        errors.append(f"目录内文件数 {len(files)} > {a.max_files}")
    for p in webps:
        data = p.read_bytes()
        is_contact = p.name.startswith("contact-")
        limit = a.max_kb * (1.5 if is_contact else 1)
        if len(data) > limit * 1024:
            errors.append(f"{p.relative_to(root)}：{len(data) // 1024} KB > {int(limit)} KB")
        dims = webp_size(data)
        if dims is None:
            errors.append(f"{p.relative_to(root)}：不是可识别的 WebP")
        elif max(dims) > a.max_edge and not is_contact:
            errors.append(f"{p.relative_to(root)}：长边 {max(dims)} > {a.max_edge}")
        if not is_contact and p.resolve() not in listed:
            errors.append(f"{p.relative_to(root)}：未在 index.yaml 登记")
    others = [p for p in files if p.suffix.lower() not in (".webp", ".yaml", ".md")]
    for p in others:
        warnings.append(f"{p.relative_to(root)}：非 WebP / YAML / Markdown 文件（应只提交缩图与说明）")
    return report(errors, warnings, a.json, {"files": len(files), "webp": len(webps), "indexed": len(listed)})


def report(errors, warnings, as_json, stats=None) -> int:
    if as_json:
        print(json.dumps({"errors": errors, "warnings": warnings, "stats": stats or {}}, ensure_ascii=False, indent=1))
    else:
        for w in warnings:
            print("warning:", w)
        for e in errors:
            print("error:", e)
        print(f"golden check: {'FAIL' if errors else 'OK'}; errors={len(errors)} warnings={len(warnings)} {stats or ''}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
