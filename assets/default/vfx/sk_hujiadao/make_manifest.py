#!/usr/bin/env python3
"""重建 sk_hujiadao manifest，并冻结交付哈希。"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
EFFECTS = {
    "family": ("vfx_sk_hujiadao__family_base01", "胡家刀法家族四帧原料；刚健刀罡与回刃双弧"),
    "mv_hujiadao_fengxue": ("vfx_mv_hujiadao_fengxue__effect_base01", "辽东风雪四帧原料；锥形刀势与飞雪"),
    "mv_hujiadao_humiaohuzhao": ("vfx_mv_hujiadao_humiaohuzhao__effect_base01", "胡苗互照四帧原料；刀弧与剑隙"),
}
MOVES = {
    "mv_hujiadao_cangfeng": (False, "family", 240, "pulse / 0.60s"),
    "mv_hujiadao_fengxue": (True, "mv_hujiadao_fengxue", 512, "wave / 0.90s"),
    "mv_hujiadao_guanshan": (False, "family", 512, "pulse / 0.60s"),
    "mv_hujiadao_humiaohuzhao": (True, "mv_hujiadao_humiaohuzhao", 320, "wave / 0.90s"),
    "mv_hujiadao_pianfeng": (False, "family", 320, "pulse / 0.60s"),
    "mv_hujiadao_wangyue": (False, "family", 288, "pulse / 0.60s"),
    "mv_hujiadao_yingmen": (False, "family", 256, "pulse / 0.60s"),
}


def digest(relative):
    raw = (ROOT / relative).read_bytes()
    return {"file": relative, "bytes": len(raw),
            "sha256": hashlib.sha256(raw).hexdigest()}


def base(asset_id, file, subject, prompt, tool, model, effort):
    raw = (ROOT / file).read_bytes()
    with Image.open(ROOT / file) as image:
        size = f"{image.width}x{image.height}"
    return {
        "id": asset_id, "file": file, "category": "vfx",
        "style": "default", "subject": subject, "prompt": prompt,
        "negative": "无人物、手、额外兵器、实体虎、文字、水印、边框、棋盘格、纸纹、硬阴影或新增判定。",
        "references": ["docs/design/catalog/skills-qianlong.md §3.1",
                       "assets/default/STYLE.md"],
        "tool": tool, "model": model, "effort": effort,
        "created": "2026-10-01", "source_path": file, "size": size,
        "sha256": hashlib.sha256(raw).hexdigest(), "status": "candidate",
    }


def effect_entry(folder, asset_id, subject):
    prefix = f"effect/{folder}"
    entry = base(
        asset_id, f"{prefix}/source_sheet.png", subject + "（原创扩展）",
        "2x2 四帧纯白底；阳赤水墨刀势、焦墨飞白；同一宽根向右。",
        "Pillow deterministic source renderer + tools/vfx/cut_frames.py",
        "not applicable; image_gen unavailable in continuation session",
        "deterministic local render")
    files = [f"{prefix}/effect-set.yaml"]
    files += [f"{prefix}/frame_{index:03d}.png" for index in range(4)]
    files += [f"{prefix}/preview_{name}.png" for name in ("black", "gray", "white")]
    files += [f"{prefix}/quality.json"]
    if folder == "family":
        files += ["README.md", "make_sources.py", "make_effect_sets.py",
                  "make_compositions.py", "make_manifest.py", "source_requests.json"]
    entry.update(
        candidate_count=1, selected_candidate=1, pipeline="two-part",
        notes="阳赤取自 nature:yang 的项目色板倾向；可见轮廓均为原创扩展。当前会话无 image_gen，未伪称模型生成。",
        files=[entry["file"], *files], file_integrity=[digest(x) for x in files])
    return entry


def move_entry(move, values):
    ultimate, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = base(
        f"vfx_{move}__base01", f"{prefix}/peak.png",
        f"胡家刀法 / {move} / 静态峰值",
        f"共享 sabre 发出方与 {effect} 四帧原料按 Composition 合成；局部长度 {length}px；{rhythm}。",
        "tools/vfx/compose.py + build_demo.py", "Three.js r186 runtime",
        "deterministic tool output")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json",
             f"{prefix}/demo.html"]
    entry["references"] = ["docs/design/catalog/skills-qianlong.md §3.1",
                           "docs/design/23-projection-vfx-pipeline.md §4–§6"]
    entry["negative"] = "不把近身局部刀势当成真气外放、完整命中格、伤害段或人物动作。"
    entry.update(
        code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
        ultimate=ultimate, projection=False, length_px=length, rhythm=rhythm,
        notes="图鉴 projection:false；峰值只表现近身局部刀势，玩法由 Core 解算。",
        files=[entry["file"], *files], file_integrity=[digest(x) for x in files])
    return entry


def main():
    entries = [effect_entry(folder, *values) for folder, values in EFFECTS.items()]
    entries += [move_entry(move, values) for move, values in MOVES.items()]
    lines = ["assets:"] + [
        "  - " + json.dumps(entry, ensure_ascii=False, separators=(",", ":"))
        for entry in entries
    ]
    (ROOT / "manifest.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
