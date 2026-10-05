#!/usr/bin/env python3
"""Pre-process 2D turnaround slices for High-Charm Male Hero (AR-93 / AR-94).
- Level shoulders ("不要溜肩" -> "平肩")
- Widen shoulders (+10% width, +18% relative to base)
- Clean background flyaway wisps around hair silhouette
- Preserve author-approved handsome face, eyes, eyebrows 100% intact
- Stretch below neck (y=210) for >= 8.0 heads
- Maximize vertical canvas occupancy for taller stature
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def warp_front(im_path):
    im = Image.open(im_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    H, W, C = arr.shape
    xc = 193.0

    y_coords, x_coords = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.abs(x_coords - xc)

    # 1. Shoulder lift profile: rises from d=35 to d=110, peaks at 38px, tapers smoothly past d=130
    rise = smoothstep(35.0, 110.0, d)
    fall = 1.0 - smoothstep(125.0, 175.0, d) * 0.45
    lift_h = 38.0 * rise * fall

    # Vertical window: starts around y=165, full strength y in [210, 310], tapers to 0 at y=440
    # Note: Head and neck (y <= 165) are COMPLETELY UNTOUCHED!
    vert_rise = smoothstep(165.0, 215.0, y_coords)
    vert_fall = 1.0 - smoothstep(310.0, 440.0, y_coords)
    vert_factor = vert_rise * vert_fall

    total_lift = lift_h * vert_factor
    src_y = y_coords + total_lift

    # 2. Horizontal expansion (+18% width around shoulders [180, 380])
    exp_vert = smoothstep(170.0, 230.0, y_coords) * (1.0 - smoothstep(360.0, 500.0, y_coords))
    expand_factor = 0.18 * exp_vert
    src_x = xc + (x_coords - xc) / (1.0 + expand_factor)

    warped = np.zeros_like(arr)
    for c in range(3):
        warped[:, :, c] = map_coordinates(arr[:, :, c], [src_y, src_x], order=2, mode='nearest')

    return Image.fromarray(np.clip(warped, 0, 255).astype(np.uint8))

def warp_back(im_path):
    im = Image.open(im_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    H, W, C = arr.shape
    xc = 195.0

    y_coords, x_coords = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.abs(x_coords - xc)

    rise = smoothstep(35.0, 110.0, d)
    fall = 1.0 - smoothstep(125.0, 175.0, d) * 0.45
    lift_h = 38.0 * rise * fall

    vert_rise = smoothstep(165.0, 215.0, y_coords)
    vert_fall = 1.0 - smoothstep(310.0, 440.0, y_coords)
    vert_factor = vert_rise * vert_fall

    total_lift = lift_h * vert_factor
    src_y = y_coords + total_lift

    exp_vert = smoothstep(170.0, 230.0, y_coords) * (1.0 - smoothstep(360.0, 500.0, y_coords))
    expand_factor = 0.18 * exp_vert
    src_x = xc + (x_coords - xc) / (1.0 + expand_factor)

    warped = np.zeros_like(arr)
    for c in range(3):
        warped[:, :, c] = map_coordinates(arr[:, :, c], [src_y, src_x], order=2, mode='nearest')

    return Image.fromarray(np.clip(warped, 0, 255).astype(np.uint8))

def warp_left(im_path):
    im = Image.open(im_path).convert('RGB')
    arr = np.array(im, dtype=np.float32)
    H, W, C = arr.shape
    xc = 135.0

    y_coords, x_coords = np.mgrid[0:H, 0:W].astype(np.float32)
    # Side view: broaden chest depth slightly (+8%)
    exp_vert = smoothstep(180.0, 240.0, y_coords) * (1.0 - smoothstep(360.0, 500.0, y_coords))
    expand_factor = 0.08 * exp_vert
    src_x = xc + (x_coords - xc) / (1.0 + expand_factor)

    warped = np.zeros_like(arr)
    for c in range(3):
        warped[:, :, c] = map_coordinates(arr[:, :, c], [y_coords, src_x], order=2, mode='nearest')

    return Image.fromarray(np.clip(warped, 0, 255).astype(np.uint8))

def clean_bg_wisps(im):
    """Clean only semi-transparent wisps against the plain background outside head."""
    arr = np.array(im)
    bg = arr[-2, 2].copy()
    
    # Left of head: x < 140, y in [70, 180]
    for y in range(70, 180):
        for x in range(0, 142):
            d_bg = np.max(np.abs(arr[y, x].astype(int) - bg.astype(int)))
            if 10 < d_bg < 45: # semi-transparent hazy wisps
                arr[y, x] = bg
                
    # Right of head: x > 250, y in [70, 180]
    for y in range(70, 180):
        for x in range(250, arr.shape[1]):
            d_bg = np.max(np.abs(arr[y, x].astype(int) - bg.astype(int)))
            if 10 < d_bg < 45:
                arr[y, x] = bg

    return Image.fromarray(arr)

def stretch_below_neck(im, neck_y=210, scale_y=1.15):
    W, H = im.size
    top = im.crop((0, 0, W, neck_y))
    low = im.crop((0, neck_y, W, H))
    new_low_h = round((H - neck_y) * scale_y)
    low = low.resize((W, new_low_h), Image.LANCZOS)
    out = Image.new('RGB', (W, neck_y + new_low_h))
    out.paste(top, (0, 0))
    out.paste(low, (0, neck_y))
    return out

def crop_to_fit(im, pad_top=4, pad_bottom=4):
    """Ensure character occupies maximal vertical height for height normalization."""
    arr = np.array(im)
    bg = arr[-2, 2]
    diff = np.max(np.abs(arr.astype(int) - bg.astype(int)), axis=2) > 25
    rows = np.where(diff.any(axis=1))[0]
    cols = np.where(diff.any(axis=0))[0]
    
    top, bottom = rows[0], rows[-1]
    left, right = cols[0], cols[-1]
    
    crop_top = max(0, top - pad_top)
    crop_bottom = min(im.height, bottom + pad_bottom)
    
    pad_h = 24
    crop_left = max(0, left - pad_h)
    crop_right = min(im.width, right + pad_h)
    
    cropped = im.crop((crop_left, crop_top, crop_right, crop_bottom))
    return cropped

def process_all():
    os.makedirs('scratch/threeview_slices_v3', exist_ok=True)
    
    # Front view: warp shoulders, clean bg wisps, stretch below neck, crop
    f_warped = warp_front('scratch/threeview_slices/zhujue_m_front.png')
    f_clean = clean_bg_wisps(f_warped)
    f_stretched = stretch_below_neck(f_clean, neck_y=210, scale_y=1.15)
    f_final = crop_to_fit(f_stretched)
    f_final.save('scratch/threeview_slices_v3/zhujue_m_v3_front.png')
    print('Processed Front:', f_final.size)
    
    # Back view
    b_warped = warp_back('scratch/threeview_slices/zhujue_m_back.png')
    b_clean = clean_bg_wisps(b_warped)
    b_stretched = stretch_below_neck(b_clean, neck_y=210, scale_y=1.15)
    b_final = crop_to_fit(b_stretched)
    b_final.save('scratch/threeview_slices_v3/zhujue_m_v3_back.png')
    print('Processed Back:', b_final.size)
    
    # Left view
    l_warped = warp_left('scratch/threeview_slices/zhujue_m_left.png')
    l_stretched = stretch_below_neck(l_warped, neck_y=210, scale_y=1.15)
    l_final = crop_to_fit(l_stretched)
    l_final.save('scratch/threeview_slices_v3/zhujue_m_v3_left.png')
    print('Processed Left:', l_final.size)

if __name__ == '__main__':
    process_all()
