#!/usr/bin/env python3
"""Rebuild manifest.yaml with hashes for the Gold Snake Sword suite."""

import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_jinshejian"
CATALOG = "docs/design/catalog/skills-xiake-bixue.md §10.2"


def digest(relative):
    raw = (ROOT / relative).read_bytes()
    return {"file": relative, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def primary(asset_id, file, subject, prompt, tool, model):
    raw = (ROOT / file).read_bytes()
    with Image.open(ROOT / file) as image:
        size = f"{image.width}x{image.height}"
    return {"id": asset_id, "file": file, "category": "vfx", "style": "default",
            "subject": subject, "prompt": prompt,
            "negative": "无人物、手、兵器、文字、网格、纸纹、场景、白色高光或新增玩法判定。",
            "references": [CATALOG, "assets/default/STYLE.md"], "tool": tool, "model": model,
            "effort": "deterministic local render", "created": "2026-10-01",
            "source_path": file, "size": size, "sha256": hashlib.sha256(raw).hexdigest(),
            "status": "candidate"}


def source_entry(folder, asset_id, subject, brief, extras=()):
    prefix = f"effect/{folder}"
    entry = primary(asset_id, f"{prefix}/source_sheet.png", subject, brief,
                    "Pillow deterministic source renderer + tools/vfx/cut_frames.py",
                    "not applicable; image_gen unavailable in this session")
    files = [f"{prefix}/effect-set.yaml"]
    files += [f"{prefix}/frame_{i:03d}.png" for i in range(4)]
    files += [f"{prefix}/preview_{name}.png" for name in ("black", "gray", "white")]
    files += [f"{prefix}/quality.json", *extras]
    entry.update(notes="阴青取自图鉴nature:yin；蛇形剑痕和可见颜色均（原创扩展），原著动作与招名（待考）。",
                 candidate_count=1, selected_candidate=1, pipeline="two-part",
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


MOVES = {
    "mv_jinshejian_shexing": (False, "family", 256, "pulse-0.60s"),
    "mv_jinshejian_tuxin": (False, "family", 512, "pulse-0.60s"),
    "mv_jinshejian_panshen": (False, "family", 192, "pulse-0.60s"),
    "mv_jinshejian_zhuijian": (False, "family", 720, "pulse-0.60s"),
    "mv_jinshejian_nilinhui": (True, "mv_jinshejian_nilinhui", 256, "wave-0.90s"),
    "mv_jinshejian_kuangwu": (True, "mv_jinshejian_kuangwu", 768, "wave-0.90s"),
}


def move_entry(move, values):
    ultimate, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = primary(f"vfx_{move}__base01", f"{prefix}/peak.png",
                    f"金蛇剑法 / {move} / 共享剑与{effect}效果套合成峰值",
                    f"按Composition从共享剑尖沿右向合成；长度{length}px；{rhythm}。",
                    "tools/vfx/compose.py + tools/vfx/build_demo.py", "Three.js r186 runtime")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json", f"{prefix}/demo.html"]
    entry["negative"] = "不复制共享剑图，不从帧数、分叉或视觉长度推导命中、伤害段或外放档。"
    entry["references"] = [CATALOG, "docs/design/23-projection-vfx-pipeline.md §4–§6"]
    entry.update(notes="图鉴标记projection:false；锥剑同鸣为实体暗器投射，不改写为真气外放。",
                 code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
                 ultimate=ultimate, projection=False, length_px=length, rhythm=rhythm,
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


def main():
    entries = [
        source_entry("family", "vfx_sk_jinshejian__family_base01",
                     "金蛇剑法家族四帧白底原料；阴青蛇行剑痕（原创扩展）",
                     "2x2四帧白底；同根阴青剑痕由浅聚至盛势再淡出。",
                     ()),
        source_entry("mv_jinshejian_nilinhui", "vfx_mv_jinshejian_nilinhui__effect_base01",
                     "绝招逆鳞回锋四帧白底原料；上挑回锋弧（原创扩展）",
                     "2x2四帧白底；从剑尖发出的高拱回锋弧，不编码绕背位移。"),
        source_entry("mv_jinshejian_kuangwu", "vfx_mv_jinshejian_kuangwu__effect_base01",
                     "绝招金蛇狂舞四帧白底原料；七股同根扇痕（原创扩展）",
                     "2x2四帧白底；七股阴青蛇行剑痕同根展开，不以分叉定义伤害段。"),
    ]
    entries.extend(move_entry(move, values) for move, values in MOVES.items())
    lines = ["assets:"] + ["  - " + json.dumps(e, ensure_ascii=False, separators=(",", ":"))
                             for e in entries]
    assert len(lines) <= 150
    (ROOT / "manifest.yaml").write_text(chr(10).join(lines) + chr(10), encoding="utf-8")


if __name__ == "__main__":
    main()
