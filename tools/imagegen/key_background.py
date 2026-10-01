#!/usr/bin/env python3
"""把纯色底（浅暖灰 RGB(230,225,216) 或接近白色）的生成图抠成透明 RGBA。复用 tools/item/common.remove_background：
边界连通色键（Lab 距离）→ 羽化 → 去色溢；主体内部与背景同色的区域只要不和画布边缘连通就保留。

    python3 tools/imagegen/key_background.py in.png out.png
    python3 tools/imagegen/key_background.py in1.png in2.png --outdir dir/

失败（背景种子不足 40%、主体贴边）时退出码 1 并说明原因：多半是生成图背景有渐变 / 纸纹 / 投影，重出时强调"均匀平涂背景"。
"""
import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from PIL import Image  # noqa: E402

from tools.item.common import BuildError, remove_background  # noqa: E402


def key_one(src: Path, dst: Path) -> dict:
    out, meta = remove_background(Image.open(src))
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    a = out.getchannel("A").getextrema()
    return {"src": str(src), "dst": str(dst), "alpha": a, **meta}


def main() -> int:
    ap = argparse.ArgumentParser(description="纯色底生成图抠透明")
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--outdir")
    a = ap.parse_args()
    pairs = []
    if a.outdir:
        pairs = [(Path(x), Path(a.outdir) / (Path(x).stem + ".png")) for x in a.inputs]
    elif len(a.inputs) == 2:
        pairs = [(Path(a.inputs[0]), Path(a.inputs[1]))]
    else:
        ap.error("给两个参数（输入、输出），或多个输入加 --outdir")
    bad = 0
    for src, dst in pairs:
        try:
            r = key_one(src, dst)
            print(f"✔ {src.name} → {dst}（背景 {r['background']}，alpha {r['alpha']}）")
        except BuildError as e:
            bad += 1
            print(f"✘ {src.name}：{e}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
