#!/usr/bin/env python3
"""Write and cut the four sk_dagou EffectSets."""
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[4] / "assets/default/vfx/sk_dagou"
SETS = {
    "family": ("vfx_sk_dagou__family_base01", 560, 30),
    "mv_dagou_aokouduozhang": ("vfx_mv_dagou_aokouduozhang__effect_base01", 560, 62),
    "mv_dagou_tianxiawugou": ("vfx_mv_dagou_tianxiawugou__effect_base01", 560, 19),
    "mv_dagou_yajiangoubei": ("vfx_mv_dagou_yajiangoubei__effect_base01", 560, 32),
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
