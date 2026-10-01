#!/usr/bin/env python3
"""Write the five Huashan Purple Qi Art Composition YAML files."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parent

MOVES = {
    "mv_huashanziqijue_tuna": {
        "effect": "family", "length": 270, "width": 1.00, "ultimate": False,
        "note": "紫气吐纳；短促贴身气息 1.5×180=270 px",
    },
    "mv_huashanziqijue_yunqi": {
        "effect": "family", "length": 315, "width": 0.92, "ultimate": False,
        "note": "运气随剑；收束运劲 1.75×180=315 px",
    },
    "mv_huashanziqijue_huti": {
        "effect": "family", "length": 360, "width": 1.18, "ultimate": False,
        "note": "紫气护体；贴身护体气场 2×180=360 px",
    },
    "mv_huashanziqijue_yingfeng": {
        "effect": "mv_huashanziqijue_yingfeng", "length": 450, "width": 1.26,
        "ultimate": True, "note": "绝招迎峰守一；守峰气障 2.5×180=450 px",
    },
    "mv_huashanziqijue_guiyuan": {
        "effect": "mv_huashanziqijue_guiyuan", "length": 450, "width": 1.24,
        "ultimate": True, "note": "绝招紫气归元；归元回环 2.5×180=450 px",
    },
}


def composition(move: str, data: dict) -> str:
    if data["ultimate"]:
        rhythm = "{charge_s: 0.15, release_s: 0.2, sustain_s: 0.4, dissipate_s: 0.15}"
        peak = "0.3888888888888889"
    else:
        rhythm = "{charge_s: 0.1, release_s: 0.15, sustain_s: 0.25, dissipate_s: 0.1}"
        peak = "0.4166666666666667"
    return f"""# {data['note']}；projection:false，长度只控制自身气场版面。
kind: Composition
version: 1
asset_id: vfx_{move}__base01
subject_ref: sk_huashanziqijue
move_ref: {move}
mode: baseline
effect_set: ../../effect/{data['effect']}/effect-set.yaml
emitter_plate: ../../../emitters/palm/emitter-plate.yaml
canvas_px: [1536, 1024]
background: '#4A433C'
emit_at_px: [430, 512]
angle_deg: 0
range_hex: 0
pixels_per_hex: 180
length_px: {data['length']}
scale: [1, {data['width']:.2f}]
emitter_scale: 0.32
rhythm: {rhythm}
transition:
  interpolation: crossfade
  scale_from: 0.95
  drift_fraction: 0
  brightness: [0.78, 1, 1.08, 1, 0.78]
  directional_mask: {{enabled: true, softness: 0.08}}
output:
  fps: 20
  loop: true
  loop_gap_s: 0.4
  peak_phase: {peak}
  preview_size_px: [768, 512]
  html_max_bytes: 3000000
  optional_animation: none
"""


def main() -> None:
    for move, data in MOVES.items():
        directory = ROOT / "moves" / move
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "composition.yaml").write_text(composition(move, data), encoding="utf-8")


if __name__ == "__main__":
    main()
