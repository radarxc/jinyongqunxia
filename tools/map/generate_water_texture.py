#!/usr/bin/env python3
"""Generate seamless classical Chinese ink-wash water ripple texture (tex_map_ocean.png).
Replaces the old cloud-sea texture with elegant, authentic water wave ripples.
"""

import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SIZE = 1024

def make_seamless_waves():
    print(f"Generating seamless water ripple texture: {SIZE}x{SIZE}...")
    
    # Base watercolor: refined antique azure parchment #9ab5c2
    base_r, base_g, base_b = 154, 181, 194
    img = Image.new("RGBA", (SIZE, SIZE), (base_r, base_g, base_b, 255))
    draw = ImageDraw.Draw(img)

    # 1. Subtle global paper grain / tonal modulation (seamless sine harmonics)
    x = np.linspace(0, 2 * math.pi, SIZE, endpoint=False)
    y = np.linspace(0, 2 * math.pi, SIZE, endpoint=False)
    X, Y = np.meshgrid(x, y)
    
    # Seamless harmonic waves
    tonal = (
        np.sin(X * 3 + Y * 2) * 4.0 +
        np.cos(X * 2 - Y * 4) * 3.5 +
        np.sin(X * 5 + Y * 3) * 2.5 +
        np.sin(Y * 8) * 1.5
    )
    
    base_arr = np.zeros((SIZE, SIZE, 4), dtype=np.float32)
    base_arr[:, :, 0] = base_r + tonal
    base_arr[:, :, 1] = base_g + tonal * 0.95
    base_arr[:, :, 2] = base_b + tonal * 0.9
    base_arr[:, :, 3] = 255.0
    np.clip(base_arr, 0, 255, out=base_arr)
    img = Image.fromarray(base_arr.astype(np.uint8))
    draw = ImageDraw.Draw(img)

    # 2. Draw classical Chinese rhythmic wave ripples (层波水纹)
    # Rows of interlocking wave arcs
    wave_overlay = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    wave_draw = ImageDraw.Draw(wave_overlay)

    ROW_SPACING = 24
    ARC_WIDTH = 48
    ARC_HEIGHT = 10

    for row_idx in range(SIZE // ROW_SPACING + 2):
        cy = (row_idx * ROW_SPACING) % SIZE
        # Stagger alternating rows by half an arc width
        offset_x = (ARC_WIDTH // 2) if (row_idx % 2 == 1) else 0
        
        for col_idx in range(-1, SIZE // ARC_WIDTH + 2):
            cx = col_idx * ARC_WIDTH + offset_x
            
            # Draw curved wave arc: an arc or bezier-like polygon
            # We want an arc curving gently upward or downward
            pts = []
            for step in range(13):
                t = step / 12.0
                px = cx + t * ARC_WIDTH
                # Parabolic curve
                py = cy - math.sin(t * math.pi) * ARC_HEIGHT
                pts.append((px, py))
            
            # Wrap points across tile borders seamlessly
            for shift_x in (-SIZE, 0, SIZE):
                for shift_y in (-SIZE, 0, SIZE):
                    shifted = [(x + shift_x, y + shift_y) for x, y in pts]
                    # Draw wave trough shadow (deep water teal)
                    wave_draw.line(shifted, fill=(116, 145, 158, 140), width=2, joint="curve")
                    # Draw subtle wave crest highlight (foam light)
                    highlight = [(x + shift_x, y + shift_y - 1.2) for x, y in pts]
                    wave_draw.line(highlight, fill=(182, 206, 216, 110), width=1, joint="curve")

    # Gentle blur to make the wave strokes feel like ink wash on silk
    wave_overlay = wave_overlay.filter(ImageFilter.GaussianBlur(0.8))
    img.alpha_composite(wave_overlay)

    # 3. Add fine mineral paper texture noise
    noise = np.random.RandomState(12345).randint(-3, 4, (SIZE, SIZE, 3), dtype=np.int16)
    final_arr = np.array(img.convert("RGB"), dtype=np.int16)
    final_arr[:, :, :3] += noise
    np.clip(final_arr, 0, 255, out=final_arr)
    final_img = Image.fromarray(final_arr.astype(np.uint8))

    out_path = ROOT / "apps" / "game" / "public" / "img" / "tex_map_ocean.png"
    final_img.save(out_path, format="PNG", optimize=True)
    print(f"Saved {out_path} ({out_path.stat().st_size} bytes)")

    preview_path = Path("/Users/bytedance/.gemini/antigravity/brain/266def8a-da55-4552-901d-55eb01b559d0/preview_water_texture.png")
    final_img.save(preview_path, format="PNG")
    print(f"Saved preview to {preview_path}")

if __name__ == "__main__":
    make_seamless_waves()
