#!/usr/bin/env python3
"""按当前文件内容重建段氏一阳诀 manifest。"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
CATALOG = "docs/design/catalog/skills-bulu-01-tianlong.md §1.1"


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
        "negative": "无人物、手、兵器、文字、水印、边框、棋盘格、纸纹、实体太阳、经络图或新增判定。",
        "references": [CATALOG, "assets/default/STYLE.md"],
        "tool": tool, "model": model, "effort": "deterministic local render",
        "created": "2026-10-01", "source_path": file, "size": size,
        "sha256": hashlib.sha256(raw).hexdigest(), "status": "candidate",
    }


def source_entry(folder: str, asset_id: str, subject: str, brief: str, extras=()) -> dict:
    prefix = f"effect/{folder}"
    entry = primary(asset_id, f"{prefix}/source_sheet.png", subject, brief,
                    "Pillow deterministic source renderer + tools/vfx/cut_frames.py",
                    "not applicable; image_gen blocked before generation")
    files = [f"{prefix}/effect-set.yaml"]
    files += [f"{prefix}/frame_{index:03d}.png" for index in range(4)]
    files += [f"{prefix}/preview_{name}.png" for name in ("black", "gray", "white")]
    files += [f"{prefix}/quality.json", *extras]
    entry.update(notes="调和淡金与全部轮廓均为原创扩展；原著未确认可见颜色。",
                 candidate_count=1, selected_candidate=1, pipeline="two-part",
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


MOVES = {
    "mv_duanshiyangjue_guanyuan": (False, "family", 360, "pulse-0.60s"),
    "mv_duanshiyangjue_humai": (False, "family", 360, "pulse-0.60s"),
    "mv_duanshiyangjue_yangqi": (False, "family", 270, "pulse-0.60s"),
    "mv_duanshiyangjue_yiyang": (True, "mv_duanshiyangjue_yiyang", 450, "wave-0.90s"),
    "mv_duanshiyangjue_zhouliu": (True, "mv_duanshiyangjue_zhouliu", 540, "wave-0.90s"),
}


def move_entry(move: str, values: tuple) -> dict:
    ultimate, effect, length, rhythm = values
    prefix = f"moves/{move}"
    entry = primary(f"vfx_{move}__base01", f"{prefix}/peak.png",
                    f"段氏一阳诀 / {move} / 静态峰值",
                    f"共享掌面与 {effect} 四帧原料按 Composition 合成；自身局部长度 {length}px；{rhythm}。",
                    "tools/vfx/compose.py + build_demo.py", "Three.js r186 runtime")
    files = [f"{prefix}/composition.yaml", f"{prefix}/composition.json", f"{prefix}/demo.html"]
    entry["negative"] = "不把自身气场画成离体攻击，不把局部长度当作射程、命中格或外放强化档。"
    entry["references"] = [CATALOG, "docs/design/23-projection-vfx-pipeline.md §4–§6"]
    entry["notes"] = "五招均 projection:false；峰值只表现自身运劲，玩法效果仍由 Core 解算。"
    entry.update(code=f"{prefix}/demo.html", pipeline="two-part", effect_set=effect,
                 ultimate=ultimate, projection=False, length_px=length, rhythm=rhythm,
                 files=[entry["file"], *files], file_integrity=[digest(path) for path in files])
    return entry


def main() -> None:
    extras = ("README.md", "make_sources.py", "make_compositions.py",
              "source_requests.json", "make_manifest.py")
    entries = [
        source_entry("family", "vfx_sk_duanshiyangjue__family_base01",
                     "段氏一阳诀家族四帧白底原料；调和气息与护脉弧（原创扩展）",
                     "2x2 四帧白底；三缕淡金气息、两层护脉弧；同一宽根向右。", extras),
        source_entry("mv_duanshiyangjue_yiyang", "vfx_mv_duanshiyangjue_yiyang__effect_base01",
                     "绝招一阳归元四帧白底原料；三层归元气轮（原创扩展）",
                     "2x2 四帧白底；三层淡金气轮向一束归拢；同一宽根向右。"),
        source_entry("mv_duanshiyangjue_zhouliu", "vfx_mv_duanshiyangjue_zhouliu__effect_base01",
                     "绝招任督周流四帧白底原料；上下双路周天气环（原创扩展）",
                     "2x2 四帧白底；上下双路长弧与近根周天环相合；同一宽根向右。"),
    ]
    entries.extend(move_entry(move, values) for move, values in MOVES.items())
    lines = ["assets:"] + ["  - " + json.dumps(entry, ensure_ascii=False, separators=(",", ":"))
                             for entry in entries]
    assert len(lines) <= 150
    (ROOT / "manifest.yaml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
