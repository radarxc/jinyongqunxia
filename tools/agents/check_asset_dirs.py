#!/usr/bin/env python3
"""调度器校验辅助：对匹配 glob 的每个素材目录（含 manifest.yaml）跑 check_assets.py；没有 manifest 的目录跳过。

    python3 tools/agents/check_asset_dirs.py "assets/default/character/*/ch0[1-7]" --min 1 --max 999 [--min-side N]
"""
import argparse
import glob
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("pattern")
    ap.add_argument("--min", type=int, default=1)
    ap.add_argument("--max", type=int, default=9999)
    ap.add_argument("--min-side", type=int)
    a = ap.parse_args()
    dirs = sorted(d for d in glob.glob(a.pattern) if (Path(d) / "manifest.yaml").is_file())
    if not dirs:
        print(f"没有匹配且含 manifest.yaml 的目录：{a.pattern}")
        return 1
    bad = 0
    for d in dirs:
        argv = [sys.executable, str(HERE / "check_assets.py"), d, "--min", str(a.min), "--max", str(a.max)]
        if a.min_side:
            argv += ["--min-side", str(a.min_side)]
        p = subprocess.run(argv, capture_output=True, text=True)
        tail = (p.stdout + p.stderr).strip().splitlines()[-1:] or [""]
        print(("✔" if p.returncode == 0 else "✘"), d, tail[0][:160])
        bad += p.returncode != 0
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
