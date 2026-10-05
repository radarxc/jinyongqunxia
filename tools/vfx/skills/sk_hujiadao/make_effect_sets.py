#!/usr/bin/env python3
"""写入并切分胡家刀法三套 EffectSet。"""
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_hujiadao"
SETS = {
    "family": ("vfx_sk_hujiadao__family_base01", 570, 48),
    "mv_hujiadao_fengxue": ("vfx_mv_hujiadao_fengxue__effect_base01", 580, 72),
    "mv_hujiadao_humiaohuzhao": ("vfx_mv_hujiadao_humiaohuzhao__effect_base01", 580, 62),
}


def config(asset_id, reference_length, root_width):
    return {
        "kind": "EffectSet", "version": 1, "asset_id": asset_id,
        "size_px": [768, 512], "color_space": "srgb",
        "alpha_mode": "straight", "style": "ink",
        "direction": [1, 0], "reference_length_px": reference_length,
        "root_width_px": root_width, "blend": "normal",
        "source": {
            "mode": "grid", "files": ["source_sheet.png"],
            "rects": [
                {"file_index": 0, "rect_px": [0, 0, 768, 512]},
                {"file_index": 0, "rect_px": [768, 0, 768, 512]},
                {"file_index": 0, "rect_px": [0, 512, 768, 512]},
                {"file_index": 0, "rect_px": [768, 512, 768, 512]},
            ],
            "keying": {
                "method": "white_key", "white_cutoff_8bit": 250,
                "opaque_luma": 0.20, "key_full_8bit": 80,
                "epsilon": 0.00392156862745098, "dewhite": True,
            },
        },
        "frames": [
            {"file": f"frame_{index:03d}.png", "anchor_px": [96, 256],
             "phase": phase}
            for index, phase in enumerate((0, 0.25, 0.5, 1))
        ],
    }


def main():
    for folder, values in SETS.items():
        path = ROOT / "effect" / folder / "effect-set.yaml"
        path.write_text(yaml.safe_dump(config(*values), allow_unicode=True,
                                       sort_keys=False), encoding="utf-8")


if __name__ == "__main__":
    main()
