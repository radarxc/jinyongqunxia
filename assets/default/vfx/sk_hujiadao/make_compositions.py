#!/usr/bin/env python3
"""写入胡家刀法七招 Composition YAML。"""
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
PULSE = {"charge_s": 0.10, "release_s": 0.15,
         "sustain_s": 0.25, "dissipate_s": 0.10}
WAVE = {"charge_s": 0.15, "release_s": 0.20,
        "sustain_s": 0.40, "dissipate_s": 0.15}

# mv, effect, ultimate, local length px, angle, width correction, range note
MOVES = [
    ("mv_hujiadao_cangfeng", "family", False, 240, 10, 0.82, "单体近身回刃"),
    ("mv_hujiadao_fengxue", "mv_hujiadao_fengxue", True, 512, 0, 1.18, "锥2近身局部片段"),
    ("mv_hujiadao_guanshan", "family", False, 512, -4, 0.88, "线2近身"),
    ("mv_hujiadao_humiaohuzhao", "mv_hujiadao_humiaohuzhao", True, 320, 0, 1.06, "单体近身"),
    ("mv_hujiadao_pianfeng", "family", False, 320, 18, 1.12, "横扫近身局部片段"),
    ("mv_hujiadao_wangyue", "family", False, 288, -18, 0.95, "绕背近身接触片段"),
    ("mv_hujiadao_yingmen", "family", False, 256, 0, 0.92, "单体近身"),
]


def composition(move, effect, ultimate, length, angle, scale_y, note):
    rhythm = WAVE if ultimate else PULSE
    total = sum(rhythm.values())
    return {
        "kind": "Composition", "version": 1,
        "asset_id": f"vfx_{move}__base01",
        "subject_ref": "sk_hujiadao", "move_ref": move,
        "mode": "baseline",
        "effect_set": f"../../effect/{effect}/effect-set.yaml",
        "emitter_plate": "../../../emitters/sabre/emitter-plate.yaml",
        "canvas_px": [1536, 1024], "background": "#EFE6D2",
        "emit_at_px": [630, 512], "angle_deg": angle,
        # 图鉴均 projection:false；range_hex=0，length 只表现近身局部刀势。
        "range_hex": 0, "pixels_per_hex": 256, "length_px": length,
        "scale": [1, scale_y], "emitter_scale": 0.46,
        "rhythm": rhythm,
        "transition": {
            "interpolation": "crossfade", "scale_from": 0.95,
            "drift_fraction": 0, "brightness": [0.8, 1, 1, 1, 0.8],
            "directional_mask": {"enabled": True, "softness": 0.08},
        },
        "output": {
            "fps": 20, "loop": True, "loop_gap_s": 0.4,
            "peak_phase": (rhythm["charge_s"] + rhythm["release_s"]) / total,
            "preview_size_px": [768, 512], "html_max_bytes": 3000000,
            "optional_animation": "none",
        },
    }


def main():
    for row in MOVES:
        path = ROOT / "moves" / row[0] / "composition.yaml"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(yaml.safe_dump(composition(*row), allow_unicode=True,
                                       sort_keys=False), encoding="utf-8")


if __name__ == "__main__":
    main()
