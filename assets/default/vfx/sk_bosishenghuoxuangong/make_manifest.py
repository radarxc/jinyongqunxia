#!/usr/bin/env python3
"""Rebuild the compact manifest after deterministic suite generation."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
CATALOG = "docs/design/catalog/skills-bulu-04-yitian.md §1.4"


def digest(relative: str) -> dict:
    raw = (ROOT / relative).read_bytes()
    return {"file": relative, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def primary(asset_id: str, file: str, subject: str, prompt: str,
            tool: str, model: str) -> dict:
    raw = (ROOT / file).read_bytes()
    with Image.open(ROOT / file) as image:
        size = f"{image.width}x{image.height}"
    return {
        "id": asset_id, "file": file, "category": "vfx", "style": "default",
        "subject": subject, "prompt": prompt,
        "negative": "无人物、手、兵器、文字、水印、边框、棋盘格、纸纹、实体火焰或新增判定。",
        "references": [CATALOG, "assets/default/STYLE.md"],
        "tool": tool, "model": model, "created": "2026-09-30",
        "source_path": file, "size": size, "sha256": hashlib.sha256(raw).hexdigest(),
        "status": "candidate",
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
    entry.update(
        notes="原著未确认本功有可见颜色或固定轮廓；赤金回环、令纹与焰带均为原创扩展。",
        candidate_count=1, selected_candidate=1, pipeline="two-part",
        files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


MOVES = {
    "mv_bosishenghuoxuangong_huanming": (True, "mv_bosishenghuoxuangong_huanming", 450, "wave-0.90s"),
    "mv_bosishenghuoxuangong_huti": (False, "family", 360, "pulse-0.60s"),
    "mv_bosishenghuoxuangong_shouling": (True, "mv_bosishenghuoxuangong_shouling", 450, "wave-0.90s"),
    "mv_bosishenghuoxuangong_tuna": (False, "family", 270, "pulse-0.60s"),
    "mv_bosishenghuoxuangong_zhuanhuan": (False, "family", 360, "pulse-0.60s"),
}


def move_entry(move: str, values: tuple) -> dict:
    ultimate, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = primary(f"vfx_{move}__base01", f"{prefix}/peak.png",
                    f"波斯圣火玄功 / {move} / 静态峰值",
                    f"共享掌面与 {effect} 四帧原料按 Composition 合成；局部长度 {length}px；{rhythm}。",
                    "tools/vfx/compose.py + build_demo.py", "Three.js r186 runtime")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json", f"{prefix}/demo.html"]
    entry["negative"] = "不把自身气场画成离体伤害，不把局部长度当作射程、命中格或投影档。"
    entry["references"] = [CATALOG, "docs/design/23-projection-vfx-pipeline.md §4–§6"]
    entry["notes"] = "五招均 projection:false；峰值只表现自身运劲，范围与效果仍由 Core 解算。"
    entry.update(code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
                 ultimate=ultimate, projection=False, length_px=length, rhythm=rhythm,
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


def main() -> None:
    entries = [
        source_entry("family", "vfx_sk_bosishenghuoxuangong__family_base01",
                     "波斯圣火玄功家族四帧白底原料；赤金回环气带（原创扩展）",
                     "2x2 四帧白底；五道赤金气带、三层呼吸弧环；从左向右。",
                     ("README.md", "make_sources.py", "source_requests.json", "make_manifest.py")),
        source_entry("mv_bosishenghuoxuangong_huanming",
                     "vfx_mv_bosishenghuoxuangong_huanming__effect_base01",
                     "绝招幻明归环四帧白底原料；交错双环与回卷焰带（原创扩展）",
                     "2x2 四帧白底；赤金双环交错、五道焰带回卷归束；从左向右。"),
        source_entry("mv_bosishenghuoxuangong_shouling",
                     "vfx_mv_bosishenghuoxuangong_shouling__effect_base01",
                     "绝招守令归真四帧白底原料；闭合令纹与归心气息（原创扩展）",
                     "2x2 四帧白底；四层断续令纹闭合、三道气息归心；从左向右。"),
    ]
    entries.extend(move_entry(move, values) for move, values in MOVES.items())
    lines = ["assets:"] + ["  - " + json.dumps(entry, ensure_ascii=False, separators=(",", ":"))
                             for entry in entries]
    assert len(lines) <= 150
    (ROOT / "manifest.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
