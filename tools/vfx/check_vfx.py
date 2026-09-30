#!/usr/bin/env python3
"""校验外放素材 YAML、实际 PNG 与自包含 HTML；失败返回非零。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import unittest

try:
    from .validation import VFXError, check_html, collect_quality, validate_document
except ImportError:
    from validation import VFXError, check_html, collect_quality, validate_document


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("yaml", nargs="*", type=Path, help="EffectSet/EmitterPlate/Composition YAML")
    parser.add_argument("--root", type=Path, help="同一素材套件根目录，默认每个入口 YAML 的父目录")
    parser.add_argument("--html", nargs="+", type=Path, default=[], help="自包含 HTML 文件（可多选）")
    parser.add_argument("--self-test", action="store_true", help="运行 tools/vfx 的全部单元测试")
    args = parser.parse_args(argv)
    if not args.yaml and not args.html and not args.self_test:
        parser.error("至少给出一个 YAML、--html 或 --self-test")
    failed = False
    if args.self_test:
        suite = unittest.defaultTestLoader.discover(str(Path(__file__).parent), pattern="test_*.py")
        if suite.countTestCases() == 0:
            print("错误：未找到单元测试", file=sys.stderr)
            failed = True
        else:
            result = unittest.TextTestRunner(verbosity=2).run(suite)
            failed = not result.wasSuccessful()
    for path in args.yaml:
        try:
            data = validate_document(path, args.root)
            result = {"file": str(path), "kind": data["kind"], "valid": True}
            quality = collect_quality(path, args.root)
            if quality:
                result["quality"] = quality
            if data["kind"] == "Composition":
                try:
                    from .compose import Renderer
                except ImportError:
                    from compose import Renderer
                # Renderer 使用可见像素检查全部帧及阶段极值的几何越界。
                Renderer(path, suite_root=args.root)
                result["geometry_checked"] = True
            print(json.dumps(result, ensure_ascii=False))
        except (VFXError, OSError) as exc:
            print(f"错误：{exc}", file=sys.stderr)
            failed = True
    for path in args.html:
        try:
            print(json.dumps({"file": str(path), **check_html(path)}, ensure_ascii=False))
        except (VFXError, OSError) as exc:
            print(f"错误：{exc}", file=sys.stderr)
            failed = True
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
