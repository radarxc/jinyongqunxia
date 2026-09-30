#!/usr/bin/env python3
"""Rebuild the explicitly non-production VFX pipeline placeholder."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from cut_frames import cut_effect
from imaging import srgb_decode, srgb_encode
from validation import save_yaml

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = REPO_ROOT / "assets/default/baseline/vfx/preview"
KEYING = {
    "method": "white_key", "white_cutoff_8bit": 250, "opaque_luma": 0.2,
    # 255 - min(201, 164, 92): keep solid gold without making soft edges opaque.
    "key_full_8bit": 163, "epsilon": 1 / 255, "dewhite": True,
}


def fixture_configs() -> tuple[dict, dict, dict]:
    """Small, valid metadata shared by placeholder and synthetic tests."""
    effect = {
        "kind": "EffectSet", "version": 1,
        "asset_id": "vfx_sk_xianglong_dragon", "size_px": [320, 160],
        "color_space": "srgb", "alpha_mode": "straight", "style": "gold_ink",
        "direction": [1, 0], "reference_length_px": 224, "root_width_px": 32,
        "blend": "normal", "source": {
            "mode": "grid", "files": ["source_placeholder.png"],
            "rects": [{"file_index": 0, "rect_px": [i * 336, 0, 320, 160]}
                      for i in range(4)], "keying": dict(KEYING),
        },
        "frames": [{"file": f"frame_{i:03d}.png", "anchor_px": [48, 80],
                    "phase": i / 3} for i in range(4)],
    }
    emitter = {
        "kind": "EmitterPlate", "version": 1, "file": "plate.png",
        "size_px": [128, 128], "color_space": "srgb", "alpha_mode": "straight",
        "category": "palm", "emit_point_px": [88, 64], "direction": [1, 0],
        "emission_width_px": 32,
    }
    composition = {
        "kind": "Composition", "version": 1,
        "asset_id": "vfx_mv_xianglong18_kanglong__ch02_base01",
        "subject_ref": "mv_xianglong18_kanglong", "mode": "baseline",
        "effect_set": "effect/effect-set.yaml",
        "emitter_plate": "emitter/emitter-plate.yaml", "canvas_px": [640, 400],
        "background": "#EFE6D2", "emit_at_px": [160, 200], "angle_deg": 0,
        "range_hex": 1, "pixels_per_hex": 320, "scale": [1, 1],
        "emitter_scale": 1,
        "rhythm": {"charge_s": 0.1, "release_s": 0.15,
                   "sustain_s": 0.25, "dissipate_s": 0.1},
        "transition": {"interpolation": "crossfade", "scale_from": 0.95,
                       "drift_fraction": 0.02, "brightness": [0.8, 1, 1, 1, 0.8]},
        "output": {"fps": 20, "loop": True, "loop_gap_s": 0.4,
                   "peak_phase": 0.25 / 0.6, "preview_size_px": [640, 400],
                   "html_max_bytes": 3000000, "optional_animation": "none"},
    }
    return effect, emitter, composition


def placeholder_coverage() -> np.ndarray:
    """Known coverage for the synthetic arc; never inferred from real plates."""
    y, x = np.mgrid[:160, :320]
    progress = np.clip((x + 0.5 - 48) / 224, 0, 1)
    center = 80 - 20 * np.sin(np.pi * progress)
    half_width = 16 * (1 - 0.30 * np.sin(np.pi * progress))
    coverage = np.clip((half_width - np.abs(y + 0.5 - center)) / 2, 0, 1)
    coverage *= np.clip((x + 0.5 - 48) / 2, 0, 1)
    coverage *= np.clip((272 - x - 0.5) / 5, 0, 1)
    return coverage


def draw_source() -> Image.Image:
    """A mathematical gold arc, permitted only as a pipeline placeholder."""
    coverage = placeholder_coverage()
    foreground = srgb_decode(np.array([201, 164, 92]) / 255)
    sheet = Image.new("RGB", (4 * 320 + 3 * 16, 160), "white")
    for index, strength in enumerate([0.50, 0.85, 1.0, 0.45]):
        alpha = (coverage * strength)[..., None]
        rgb = srgb_encode(alpha * foreground + (1 - alpha))
        frame = Image.fromarray(np.rint(rgb * 255).astype(np.uint8), "RGB")
        sheet.paste(frame, (index * 336, 0))
    return sheet


def draw_emitter() -> Image.Image:
    """Grey schematic palm, deliberately not an approved anatomical plate."""
    plate = Image.new("RGBA", (128, 128))
    draw = ImageDraw.Draw(plate)
    grey = (111, 107, 103, 255)
    draw.rounded_rectangle((20, 51, 67, 79), radius=8, fill=grey)
    draw.ellipse((49, 43, 95, 86), fill=grey)
    for top, right in [(44, 107), (53, 114), (62, 110), (71, 103)]:
        draw.rounded_rectangle((78, top, right, top + 7), radius=3, fill=grey)
    draw.polygon([(57, 51), (72, 33), (79, 35), (69, 61)], fill=grey)
    return plate


def write_fixture(root: Path) -> Path:
    """Write source images/configuration and cut the four synthetic frames."""
    effect, emitter, composition = fixture_configs()
    (root / "effect").mkdir(parents=True, exist_ok=True)
    (root / "emitter").mkdir(parents=True, exist_ok=True)
    draw_source().save(root / "effect/source_placeholder.png")
    draw_emitter().save(root / "emitter/plate.png")
    cut_effect(effect, root / "effect/effect-set.yaml", suite_root=root)
    save_yaml(root / "emitter/emitter-plate.yaml", emitter)
    save_yaml(root / "composition.yaml", composition)
    return root / "composition.yaml"


def contact_sheet(paths: list[Path], target: Path) -> None:
    """Labelled small sheet for quick frame-order and clipping inspection."""
    tile_width, tile_height = 240, 175
    sheet = Image.new("RGB", (tile_width * 4, tile_height * ((len(paths) + 3) // 4)),
                      "#EFE6D2")
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(paths):
        with Image.open(path) as image:
            thumb = image.convert("RGBA")
        thumb.thumbnail((232, 145))
        x, y = (index % 4) * tile_width, (index // 4) * tile_height
        sheet.paste(thumb, (x + 4, y + 4), thumb)
        draw.text((x + 4, y + 150), path.name, fill="#4A433C")
    sheet.save(target)


def reference_quality(result: Image.Image, coverage: np.ndarray) -> dict:
    """Compare known gold/coverage on three backgrounds, including opaque errors.

    The 2/255 allowance covers 8-bit rounding, not perceptual acceptance.
    Real plates have no such oracle; white reconstruction alone is insufficient.
    """
    rgba = np.asarray(result, dtype=np.float64) / 255
    alpha = rgba[..., 3:4]
    truth_alpha = coverage[..., None]
    foreground = srgb_decode(np.array([201, 164, 92]) / 255)
    edge = (coverage > 0) & (coverage < 1)
    core = coverage == 1
    colors = np.abs(rgba[..., :3] * 255 - [201, 164, 92])
    metrics = {
        "foreground_rgb": [201, 164, 92], "bright_tolerance_8bit": 2,
        "edge_pixels": int(edge.sum()), "solid_pixels": int(core.sum()),
        "solid_color_max_error_8bit": float(colors[core].max()) if core.any() else None,
        "coverage_max_error": float(np.abs(alpha - truth_alpha).max()),
        "backgrounds": {},
    }
    for name, value in (("black", 0), ("gray", 128), ("white", 255)):
        background = srgb_decode(np.array(value / 255))
        actual = srgb_encode(srgb_decode(rgba[..., :3]) * alpha + background * (1 - alpha))
        expected = srgb_encode(foreground * truth_alpha + background * (1 - truth_alpha))
        error = ((actual - expected) * 255)[edge]
        metrics["backgrounds"][name] = {
            "bright_edge_ratio": float(np.mean(np.any(error > 2, axis=1))) if error.size else 0,
            "edge_bright_max_8bit": float(max(0, error.max())) if error.size else 0,
            "edge_abs_max_8bit": float(np.abs(error).max()) if error.size else 0,
            "edge_abs_mean_8bit": float(np.abs(error).mean()) if error.size else 0,
        }
    return metrics


def build_placeholder(root: Path) -> dict:
    from animate import animate
    from compose import Renderer, export_keyframes
    from cut_frames import quality_metrics
    from imaging import blend, from_premultiplied, to_premultiplied
    from validation import check_html, validate_document

    root = root.resolve()
    composition_path = write_fixture(root)
    renderer = Renderer(composition_path, suite_root=root)
    frames = root / "frames"
    frames.mkdir(exist_ok=True)
    export_keyframes(renderer, frames)
    result = animate(composition_path, frames_dir=frames, output_dir=root,
                     html_name="demo_placeholder.html")
    source = draw_source()
    metrics = []
    references = []
    coverage = placeholder_coverage()
    for index in range(4):
        rgba = Image.open(root / f"effect/frame_{index:03d}.png").convert("RGBA")
        crop = source.crop((index * 336, 0, index * 336 + 320, 160))
        metrics.append(quality_metrics(crop, rgba))
        references.append(reference_quality(rgba, coverage * [0.50, 0.85, 1.0, 0.45][index]))
    for name, color in [("black", "#000000"), ("gray", "#808080"), ("white", "#FFFFFF")]:
        preview = Image.new("RGB", (640, 320), color)
        for index in range(4):
            with Image.open(root / f"effect/frame_{index:03d}.png") as rgba:
                back = to_premultiplied(Image.new("RGBA", rgba.size, color))
                image = from_premultiplied(blend(back, to_premultiplied(rgba), "normal"))
            preview.paste(image, ((index % 2) * 320, (index // 2) * 160))
        preview.save(root / f"effect/preview_{name}.png")
    sampled = sorted(frames.glob("frame_*.png"))
    contact_sheet(sampled, root / "frames_thumbnail.png")
    validate_document(composition_path, suite_root=root)
    html = check_html(root / "demo_placeholder.html")
    summary = {"placeholder": True, "sampled_frames": len(sampled), "quality": metrics,
               "reference_quality": references, "html": html, "animation": result}
    (root / "placeholder_quality.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2, default=str) + "\n", encoding="utf-8")
    (root / "README.md").write_text(PLACEHOLDER_README, encoding="utf-8")
    return summary


PLACEHOLDER_README = """# 外放管线占位样例（非正式素材）

此目录只有程序生成的金色渐变弧与灰色掌形示意，用于验收切帧、抠图、根部对齐、
插帧与离线 HTML 播放。它不是金龙、不是亢龙有悔的造型成品，也不代表作者审美批准。
未加入任何素材 manifest。程序绘图仅用于这个明确标记的测试占位；正式效果与发出方
必须使用分别生成并审核的素材，不能以程序图代替。

从仓库根目录重建：

```sh
python3 tools/vfx/make_placeholder.py
python3 tools/vfx/check_vfx.py assets/default/baseline/vfx/preview/composition.yaml
```

打开 `demo_placeholder.html`，可播放/暂停、调速或选择减少动态静帧。
资源为内嵌 WebP；HTML 可置于 `sandbox=\"allow-scripts\"` 的 `srcdoc` iframe。
桌面浏览器与移动设备的实际观感须人工复核；占位不能证明真实素材造型合格。

| 文件 | 用途 |
|---|---|
| `effect/source_placeholder.png` | 4 格白底原件，单格 320×160，格间 16 px |
| `effect/effect-set.yaml`、`effect/frame_000.png`–`frame_003.png` | EffectSet 与 4 张抠图帧 |
| `effect/preview_black.png` / `preview_gray.png` / `preview_white.png` | 黑、50% 灰、白底质检联系表 |
| `effect/quality.json` | cut 阶段逐帧抠图指标 |
| `emitter/plate.png`、`emitter/emitter-plate.yaml` | 原生透明灰掌占位与视觉发出点 |
| `composition.yaml` | 基线模式、固定纸底、根部合成及节奏配置 |
| `frames/key_000.png`–`key_003.png` | 4 张整图关键帧，不预先施加包络 |
| `frames/keyframes.json` | 关键帧相位、原 Composition 引用与变换边界 |
| `frames/frame_0000.png`–`frame_0012.png` | 13 张整图重采样帧 |
| `peak.png`、`frames_thumbnail.png` | 精确峰值与帧序列缩略图 |
| `demo_placeholder.html`、`animation.json` | 单文件演示与实际输出/时间表 |
| `placeholder_quality.json` | 本次生成的抠图质量与 HTML 大小实测 |

占位显式使用 `key_full_8bit=163=255−min(201,164,92)`，通用默认仍为 25。
`reference_quality` 用已知金色与生成前覆盖率在三底对拍；黑/灰底亮边比例按任一
通道高于真值 2/255 计数，分母是原始柔边像素（包括误判为不透明的输出）。
同时记录绝对色差与覆盖率误差：实心金色保持原色，柔边会更深、更饱和，不能
据此宣称恢复了真实 alpha。真实素材没有此真值，须独立调参并逐帧检查三底。

母版仅 640×400，便于仓库保存与工具回归，不充当 1536×1024 正式母版。
总时长为 0.10+0.15+0.25+0.10=0.60 s，20 fps 输出 ceil(0.60×20)+1=13 帧；
末帧只持有 0.40 s 循环间隔，一轮 1.00 s。峰值相位为 0.25/0.60。
纵向比例为 320/224，横向为 32/32=1；方向 0° 向右，90° 向下。
效果每帧保留至少 32 px 白边；4 张原始末帧仍含颜色，最终透明由时间包络生成。

`vfx_sk_xianglong_dragon`、`vfx_mv_xianglong18_kanglong__ch02_base01` 与
`mv_xianglong18_kanglong` 复用已存在的结构引用，只为让占位通过 schema/外键校验。
本目录不登记新 ID，不声明该招的射程或范围，也不把占位转为生产候选。
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    result = build_placeholder(args.output)
    print(json.dumps({"output": str(args.output), "frames": result["sampled_frames"],
                      "html": result["html"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
