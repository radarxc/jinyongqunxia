"""Abstract pixel fixtures for cut/geometry tests; never production assets."""
from pathlib import Path
import numpy as np
from PIL import Image
from cut_frames import cut_effect
from imaging import srgb_decode, srgb_encode
from validation import save_yaml

KEYING = {
    "method": "white_key", "white_cutoff_8bit": 250, "opaque_luma": 0.2,
    # 255 - min(201, 164, 92): keep solid gold without making soft edges opaque.
    "key_full_8bit": 163, "epsilon": 1 / 255, "dewhite": True,
}


def fixture_configs() -> tuple[dict, dict, dict]:
    """Small metadata used only by unit tests."""
    effect = {
        "kind": "EffectSet", "version": 1,
        "asset_id": "vfx_sk_xianglong_dragon", "size_px": [320, 160],
        "color_space": "srgb", "alpha_mode": "straight", "style": "gold_ink",
        "direction": [1, 0], "reference_length_px": 224, "root_width_px": 32,
        "blend": "normal", "source": {
            "mode": "grid", "files": ["source_test.png"],
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


def write_fixture(root: Path) -> Path:
    effect, emitter, composition = fixture_configs()
    (root / 'effect').mkdir(parents=True, exist_ok=True)
    (root / 'emitter').mkdir(parents=True, exist_ok=True)
    sheet = Image.new('RGB', (4 * 320 + 3 * 16, 160), 'white')
    for index in range(4):
        sheet.paste((201, 164, 92), (index * 336 + 48, 70, index * 336 + 100 + index * 20, 90))
    sheet.save(root / 'effect/source_test.png')
    plate = Image.new('RGBA', (128, 128))
    plate.paste((111, 107, 103, 255), (20, 48, 89, 80))
    plate.save(root / 'emitter/plate.png')
    cut_effect(effect, root / 'effect/effect-set.yaml', suite_root=root)
    save_yaml(root / 'emitter/emitter-plate.yaml', emitter)
    save_yaml(root / 'composition.yaml', composition)
    return root / 'composition.yaml'

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


