#!/usr/bin/env python3
"""核对一门武学全部招式的交付、共享发出方、HTML 与 manifest 完整性。"""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path
import re
import sys

from PIL import Image
import yaml

try:
    from .validation import ROOT, VFXError, check_html, load_yaml, resolve_path
except ImportError:
    from validation import ROOT, VFXError, check_html, load_yaml, resolve_path

DELIVERABLES = ("composition.yaml", "composition.json", "peak.png", "demo.html")


def _references(composition: Path, suite: Path, repo_root: Path) -> list[str]:
    problems = []
    try:
        data = load_yaml(composition)
        if data.get("kind") != "Composition":
            raise VFXError(f"{composition}：kind 必须为 Composition")
        move = composition.parent.name
        if data.get("move_ref", data.get("subject_ref")) != move:
            problems.append(f"{composition}：subject_ref / move_ref 必须绑定 {move}")
    except (VFXError, OSError) as exc:
        return [str(exc)]
    for field, kind, root in (
        ("effect_set", "EffectSet", suite),
        ("emitter_plate", "EmitterPlate", repo_root / "assets/default/vfx"),
    ):
        try:
            path = resolve_path(composition, data.get(field), root)
            allowed = suite if field == "effect_set" else root / "emitters"
            if not path.is_relative_to(allowed.resolve()):
                raise VFXError(f"{composition}：{field} 必须位于 {allowed}")
            document = load_yaml(path)
            if document.get("kind") != kind:
                raise VFXError(f"{path}：kind 必须为 {kind}")
            if kind == "EmitterPlate":
                resolve_path(path, document.get("file"), allowed)
            else:
                source = document.get("source", {})
                frames = document.get("frames", [])
                if not isinstance(source, dict) or not isinstance(frames, list):
                    raise VFXError(f"{path}：source / frames 格式错误")
                source_files = source.get("files", [])
                if not isinstance(source_files, list):
                    raise VFXError(f"{path}：source.files 必须为列表")
                for relative in source_files:
                    resolve_path(path, relative, allowed)
                for frame in frames:
                    if not isinstance(frame, dict):
                        raise VFXError(f"{path}：frames 项必须为对象")
                    resolve_path(path, frame.get("file"), allowed)
        except (VFXError, OSError, RuntimeError) as exc:
            problems.append(str(exc))
    return problems


def _record(record: object, owner: Path, suite: Path, label: str,
            *, primary: bool) -> tuple[Path | None, list[str]]:
    """主条目 size 是图片宽高；完整性记录 bytes / 整数 size 是文件字节数。"""
    problems = []
    if not isinstance(record, dict):
        return None, [f"{label}：条目必须为对象"]
    try:
        path = resolve_path(owner, record.get("file"), suite)
        raw = path.read_bytes()
    except (VFXError, OSError, RuntimeError) as exc:
        return None, [f"{label}：{exc}"]
    digest = hashlib.sha256(raw).hexdigest()
    if record.get("sha256") != digest:
        problems.append(f"{label}：sha256 不一致或缺失（实际 {digest}）")
    size = record.get("size")
    if primary and size is None:
        problems.append(f"{label}：缺少 size")
    dimensions = None
    if isinstance(size, str):
        dimensions = re.fullmatch(r"\s*(\d+)\s*[x×]\s*(\d+)\s*", size)
    if dimensions:
        try:
            with Image.open(path) as image:
                image.load()
                actual = image.size
            declared = tuple(int(x) for x in dimensions.groups())
            if declared != actual:
                problems.append(f"{label}：size={size}，实际 {actual[0]}x{actual[1]}")
        except (OSError, ValueError) as exc:
            problems.append(f"{label}：图片无法读取：{exc}")
    elif size is not None and (type(size) is not int or size != len(raw)):
        problems.append(f"{label}：size 应为图片宽x高或字节数 {len(raw)}")
    if "bytes" in record and (type(record["bytes"]) is not int or record["bytes"] != len(raw)):
        problems.append(f"{label}：bytes 不一致（实际 {len(raw)}）")
    if not primary and "bytes" not in record and type(size) is not int:
        problems.append(f"{label}：完整性记录缺少 bytes / 整数 size")
    return path if not problems else None, problems


def _manifest(suite: Path, required: set[Path]) -> list[str]:
    manifest = suite / "manifest.yaml"
    try:
        data = yaml.safe_load(manifest.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, yaml.YAMLError) as exc:
        return [f"{manifest}：无法读取 manifest：{exc}"]
    entries = data.get("assets") if isinstance(data, dict) else data
    if not isinstance(entries, list) or not entries:
        return [f"{manifest}：要求非空列表或 {{assets: [...]}}"]
    problems, covered, primaries = [], set(), set()
    for index, entry in enumerate(entries, 1):
        label = f"{manifest} 第 {index} 条"
        path, found = _record(entry, manifest, suite, label, primary=True)
        problems.extend(found)
        if path is not None:
            if path in primaries:
                problems.append(f"{label}：重复主文件 {path}")
            primaries.add(path)
            covered.add(path)
        if not isinstance(entry, dict):
            continue
        for key in ("code",):
            if key in entry:
                try:
                    resolve_path(manifest, entry[key], suite)
                except (VFXError, OSError, RuntimeError) as exc:
                    problems.append(f"{label}.{key}：{exc}")
        records = entry.get("file_integrity", [])
        if not isinstance(records, list):
            problems.append(f"{label}.file_integrity：必须为列表")
            records = []
        recorded = set()
        for number, record in enumerate(records, 1):
            path, found = _record(record, manifest, suite,
                                  f"{label}.file_integrity[{number}]", primary=False)
            problems.extend(found)
            if path is not None:
                if path in recorded:
                    problems.append(f"{label}：重复完整性文件 {path}")
                recorded.add(path)
                covered.add(path)
        files = entry.get("files", [])
        if not isinstance(files, list):
            problems.append(f"{label}.files：必须为路径列表")
            files = []
        for relative in files:
            try:
                path = resolve_path(manifest, relative, suite)
                if path not in recorded and path not in primaries:
                    problems.append(f"{label}：files 中 {relative} 无有效完整性记录")
            except (VFXError, OSError, RuntimeError) as exc:
                problems.append(f"{label}.files：{exc}")
    for path in sorted(required - covered):
        problems.append(f"{manifest}：缺有效 size / bytes / sha256 记录：{path.relative_to(suite)}")
    return problems


def check_skill_suite(skill_dir: Path, catalog: Path, *, repo_root: Path = ROOT) -> list[str]:
    """返回全部问题；只读磁盘。repo_root 参数供隔离测试使用。"""
    try:
        from .bind_moves import catalog_moves
    except ImportError:
        from bind_moves import catalog_moves
    suite, root = Path(skill_dir).resolve(), Path(repo_root).resolve()
    problems = []
    if not suite.is_dir():
        return [f"{suite}：武学套件目录不存在"]
    if not re.fullmatch(r"sk_[a-z0-9_]+", suite.name):
        return [f"{suite}：套件目录名必须是 sk_* 武学 ID"]
    try:
        moves = sorted({row["move"] for row in catalog_moves(Path(catalog))
                        if row["skill"] == suite.name})
    except (OSError, UnicodeError, ValueError, KeyError) as exc:
        return [f"{catalog}：图鉴解析失败：{exc}"]
    if not moves:
        return [f"{catalog}：未找到 {suite.name} 的正式招式（绝招 + 普通招）"]
    required = set()
    for move in moves:
        directory = suite / "moves" / move
        for filename in DELIVERABLES:
            path = directory / filename
            required.add(path)
            if not path.is_file():
                problems.append(f"{move}：缺少 {path.relative_to(suite)}")
            elif not path.resolve().is_relative_to(suite):
                problems.append(f"{move}：交付文件符号链接逃出套件：{filename}")
        composition, demo = directory / "composition.yaml", directory / "demo.html"
        if composition.is_file() and composition.resolve().is_relative_to(suite):
            problems.extend(_references(composition, suite, root))
        if demo.is_file():
            try:
                check_html(demo, max_bytes=3_000_000)
            except (VFXError, OSError) as exc:
                problems.append(f"{move}：{exc}")
    problems.extend(_manifest(suite, required))
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_dir", type=Path, help="assets/default/vfx/<skill_id>")
    parser.add_argument("--catalog", type=Path, required=True, help="该门武学归属的图鉴 Markdown")
    args = parser.parse_args(argv)
    problems = check_skill_suite(args.skill_dir, args.catalog)
    for problem in problems:
        print(f"✘ {problem}")
    print(f"{args.skill_dir}：{len(problems)} 个问题；{'通过' if not problems else '未通过'}")
    return int(bool(problems))


if __name__ == "__main__":
    sys.exit(main())
