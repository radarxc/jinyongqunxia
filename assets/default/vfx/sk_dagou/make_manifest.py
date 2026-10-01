#!/usr/bin/env python3
"""Rebuild manifest.yaml with hashes for the sk_dagou suite."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
EFFECTS = {
    "family": ("vfx_sk_dagou__family_base01", "打狗棒法家族四帧原料；轻灵钩月棒劲"),
    "mv_dagou_aokouduozhang": ("vfx_mv_dagou_aokouduozhang__effect_base01", "獒口夺杖四帧原料；双钩合拢"),
    "mv_dagou_tianxiawugou": ("vfx_mv_dagou_tianxiawugou__effect_base01", "天下无狗四帧原料；棒影扇面"),
    "mv_dagou_yajiangoubei": ("vfx_mv_dagou_yajiangoubei__effect_base01", "压肩狗背四帧原料；斜落压劲"),
}
MOVES = {
    "mv_dagou_aokouduozhang": (True, False, "mv_dagou_aokouduozhang", 256, "wave / 0.90s"),
    "mv_dagou_ban": (False, False, "family", 240, "pulse / 0.60s"),
    "mv_dagou_bangdashuangquan": (False, False, "family", 288, "pulse / 0.60s"),
    "mv_dagou_bogouchaotian": (False, False, "family", 288, "pulse / 0.60s"),
    "mv_dagou_chan": (False, False, "family", 256, "pulse / 0.60s"),
    "mv_dagou_egoulanlu": (False, False, "family", 192, "pulse / 0.60s"),
    "mv_dagou_fanjiegoutun": (False, False, "family", 288, "pulse / 0.60s"),
    "mv_dagou_tianxiawugou": (True, False, "mv_dagou_tianxiawugou", 320, "wave / 0.90s"),
    "mv_dagou_xiedagoubei": (False, False, "family", 288, "pulse / 0.60s"),
    "mv_dagou_yajiangoubei": (True, False, "mv_dagou_yajiangoubei", 320, "wave / 0.90s"),
    "mv_dagou_yin": (False, False, "family", 384, "pulse / 0.60s"),
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
        "id": asset_id, "file": file, "category": "vfx", "style": "default",
        "subject": subject, "prompt": prompt,
        "negative": "无人物、手、额外兵器、实体犬、文字、水印、边框、棋盘格、纸纹或新增判定。",
        "references": ["docs/design/catalog/skills-wujue.md §2.3",
                       "assets/default/STYLE.md"],
        "tool": tool, "model": model, "effort": effort, "created": "2026-09-30",
        "source_path": file, "size": size, "sha256": hashlib.sha256(raw).hexdigest(),
        "status": "candidate",
    }


def effect_entry(folder, asset_id, subject):
    prefix = f"effect/{folder}"
    entry = base(asset_id, f"{prefix}/source_sheet.png", subject + "（原创扩展）",
                 "2x2 四帧白底；素白、暖灰与焦墨棍劲；从左向右。",
                 "Pillow deterministic source renderer + tools/vfx/cut_frames.py",
                 "not applicable; image_gen attempt stalled", "deterministic local render")
    files = [f"{prefix}/effect-set.yaml"]
    files += [f"{prefix}/frame_{i:03d}.png" for i in range(4)]
    files += [f"{prefix}/preview_{name}.png" for name in ("black", "gray", "white")]
    files += [f"{prefix}/quality.json"]
    if folder == "family":
        files += ["README.md", "make_sources.py", "make_effect_sets.py",
                  "make_compositions.py", "make_manifest.py", "source_requests.json"]
    entry.update(candidate_count=1, selected_candidate=1, pipeline="two-part",
                 notes="中性素白为项目色板倾向；轮廓均为原创扩展。image_gen 无回执，未伪称模型生成。",
                 files=[entry["file"], *files], file_integrity=[digest(x) for x in files])
    return entry


def move_entry(move, values):
    ultimate, projection, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = base(f"vfx_{move}__base01", f"{prefix}/peak.png",
                 f"打狗棒法 / {move} / 静态峰值",
                 f"共享 staff 发出方与 {effect} 四帧原料按 Composition 合成；长度 {length}px；{rhythm}。",
                 "tools/vfx/compose.py + build_demo.py", "Three.js r186 runtime",
                 "deterministic tool output")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json",
             f"{prefix}/demo.html"]
    entry["references"] = ["docs/design/catalog/skills-wujue.md §2.3",
                           "docs/design/23-projection-vfx-pipeline.md §4–6"]
    entry["negative"] = "不把局部有向片段当成真气外放、完整命中格、伤害段或人物动作。"
    note = "峰值为表现候选；玩法由 Core 解算。"
    entry.update(code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
                 ultimate=ultimate, projection=projection, length_px=length, rhythm=rhythm,
                 notes=note, files=[entry["file"], *files],
                 file_integrity=[digest(x) for x in files])
    return entry


def main():
    entries = [effect_entry(folder, *values) for folder, values in EFFECTS.items()]
    entries += [move_entry(move, values) for move, values in MOVES.items()]
    lines = ["assets:"] + ["  - " + json.dumps(x, ensure_ascii=False, separators=(",", ":"))
                             for x in entries]
    (ROOT / "manifest.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
