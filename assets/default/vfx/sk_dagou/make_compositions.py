#!/usr/bin/env python3
"""Write the twelve requested sk_dagou Composition YAML files."""
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
PULSE = {"charge_s": 0.10, "release_s": 0.15, "sustain_s": 0.25,
         "dissipate_s": 0.10}
WAVE = {"charge_s": 0.15, "release_s": 0.20, "sustain_s": 0.40,
        "dissipate_s": 0.15}

# move, effect folder, ultimate, range display, explicit local length, angle, width correction
MOVES = [
    ("mv_dagou_aokouduozhang", "mv_dagou_aokouduozhang", True, 1, 256, -18, 1.20),
    ("mv_dagou_ban", "family", False, 2, 240, 16, 0.82),
    ("mv_dagou_bangdashuangquan", "family", False, 2, 288, 10, 1.08),
    ("mv_dagou_bogouchaotian", "family", False, 2, 288, -22, 0.92),
    ("mv_dagou_chan", "family", False, 2, 256, 18, 1.18),
    ("mv_dagou_egoulanlu", "family", False, 0, 192, 0, 1.35),
    ("mv_dagou_fanjiegoutun", "family", False, 2, 288, -12, 1.00),
    ("mv_dagou_tianxiawugou", "mv_dagou_tianxiawugou", True, 0, 320, 0, 1.35),
    ("mv_dagou_xiedagoubei", "family", False, 2, 288, 5, 0.75),
    ("mv_dagou_yajiangoubei", "mv_dagou_yajiangoubei", True, 2, 320, 18, 1.25),
    ("mv_dagou_yin", "family", False, 3, 384, 4, 0.88),
]


def composition(move, effect, ultimate, range_hex, length, angle, scale_y):
    data = {
        "kind": "Composition", "version": 1,
        "asset_id": f"vfx_{move}__base01", "subject_ref": "sk_dagou",
        "mode": "baseline",
        "effect_set": f"../../effect/{effect}/effect-set.yaml",
        "emitter_plate": "../../../emitters/staff/emitter-plate.yaml",
        "canvas_px": [1536, 1024], "background": "#EFE6D2",
        "emit_at_px": [650, 512], "angle_deg": angle,
        "range_hex": range_hex, "pixels_per_hex": 256, "length_px": length,
        "scale": [1, scale_y], "emitter_scale": 0.5,
        "rhythm": WAVE if ultimate else PULSE,
        "transition": {
            "interpolation": "crossfade", "scale_from": 0.95,
            "drift_fraction": 0, "brightness": [0.8, 1, 1, 1, 0.8],
            "directional_mask": {"enabled": True, "softness": 0.08},
        },
        "output": {
            "fps": 20, "loop": True, "loop_gap_s": 0.4,
            "peak_phase": 0.5, "preview_size_px": [768, 512],
            "html_max_bytes": 3000000, "optional_animation": "none",
        },
    }
    data["move_ref"] = move
    return data


def main():
    for row in MOVES:
        target = ROOT / "moves" / row[0] / "composition.yaml"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(yaml.safe_dump(composition(*row), allow_unicode=True,
                                         sort_keys=False), encoding="utf-8")


if __name__ == "__main__":
    main()
