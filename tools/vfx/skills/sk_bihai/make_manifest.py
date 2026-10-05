#!/usr/bin/env python3
"""Rebuild the compact manifest after deterministic suite generation."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_bihai"


def digest(relative: str) -> dict:
    raw = (ROOT / relative).read_bytes()
    return {"file": relative, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def primary(asset_id: str, file: str, subject: str, prompt: str, tool: str, model: str) -> dict:
    raw = (ROOT / file).read_bytes()
    with Image.open(ROOT / file) as image:
        size = f"{image.width}x{image.height}"
    return {
        "id": asset_id, "file": file, "category": "vfx", "style": "default",
        "subject": subject, "prompt": prompt,
        "negative": "无人物、手、乐器、文字、水印、边框、棋盘格、纸纹、实体海浪或新增判定。",
        "references": ["docs/design/catalog/skills-wujue.md §3.3", "assets/default/STYLE.md"],
        "tool": tool, "model": model, "effort": "deterministic local render; not applicable",
        "created": "2026-09-30", "source_path": file, "size": size,
        "sha256": hashlib.sha256(raw).hexdigest(), "status": "candidate",
    }


def source_entry(folder: str, asset_id: str, subject: str, brief: str, extras=()) -> dict:
    prefix = f"effect/{folder}"
    entry = primary(asset_id, f"{prefix}/source_sheet.png", subject, brief,
                    "Pillow deterministic source renderer + tools/vfx/cut_frames.py",
                    "not applicable; image_gen unavailable in this session")
    files = [f"{prefix}/effect-set.yaml"]
    files += [f"{prefix}/frame_{index:03d}.png" for index in range(4)]
    files += [f"{prefix}/preview_{name}.png" for name in ("black", "gray", "white")]
    files += [f"{prefix}/quality.json", *extras]
    entry.update(notes="原著未确认可见颜色或固定能量轮廓；金青水纹与音环均为原创扩展。",
                 candidate_count=1, selected_candidate=1, pipeline="two-part",
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


MOVES = {
    "mv_bihai_chaoqi": (False, True, "family", 720, "pulse-0.60s"),
    "mv_bihai_chaosheng": (True, True, "mv_bihai_chaosheng", 900, "wave-0.90s"),
    "mv_bihai_chaoyong": (False, True, "family", 540, "pulse-0.60s"),
    "mv_bihai_dingshen": (True, False, "mv_bihai_dingshen", 540, "wave-0.90s"),
    "mv_bihai_jingtao": (False, True, "family", 900, "pulse-0.60s"),
    "mv_bihai_xinsui": (False, False, "family", 900, "pulse-0.60s"),
    "mv_bihai_yuyin": (False, True, "family", 720, "pulse-0.60s"),
}


def move_entry(move: str, values: tuple) -> dict:
    ultimate, projection, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = primary(f"vfx_{move}__base01", f"{prefix}/peak.png",
                    f"碧海潮生曲 / {move} / 静态峰值",
                    f"共享掌面与 {effect} 四帧原料按 Composition 合成；长度 {length}px；{rhythm}。",
                    "tools/vfx/compose.py + build_demo.py", "Three.js r186 runtime")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json", f"{prefix}/demo.html"]
    entry["negative"] = "不把单张有向片段当成完整命中格、伤害段、投影档或人物动作。"
    entry["references"] = ["docs/design/catalog/skills-wujue.md §3.3",
                           "docs/design/23-projection-vfx-pipeline.md §4–6"]
    entry["effort"] = "deterministic tool output"
    entry["notes"] = "峰值为表现候选；运行时范围、命中和伤害仍由 Core 解算。"
    entry.update(code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
                 ultimate=ultimate, projection=projection, length_px=length, rhythm=rhythm,
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


def main() -> None:
    entries = [
        source_entry("family", "vfx_sk_bihai__family_base01",
                     "碧海潮生曲家族四帧白底原料；金青潮纹与同心音波（原创扩展）",
                     "2x2 四帧白底；五层金青潮纹束、近根同心音环、墨点余韵；从左向右。",
                     ("README.md", "source_requests.json")),
        source_entry("mv_bihai_chaosheng", "vfx_mv_bihai_chaosheng__effect_base01",
                     "绝招碧海潮生四帧白底原料；多层潮环（原创扩展）",
                     "2x2 四帧白底；束紧再展开的潮线与交替金青大音环；从左向右。"),
        source_entry("mv_bihai_dingshen", "vfx_mv_bihai_dingshen__effect_base01",
                     "支援绝招定神四帧白底原料；收束护持音环（原创扩展）",
                     "2x2 四帧白底；金青互补圆环向稳定轴线收束；从左向右。"),
    ]
    entries.extend(move_entry(move, values) for move, values in MOVES.items())
    lines = ["assets:"] + ["  - " + json.dumps(entry, ensure_ascii=False, separators=(",", ":"))
                             for entry in entries]
    assert len(lines) <= 150
    (ROOT / "manifest.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
