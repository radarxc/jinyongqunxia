import numpy as np
from PIL import Image

def process_tpose_image():
    src_path = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/female_tpose_unlit_square_1791356010616.jpg'
    out_path = '/Users/bytedance/Projects/jinyongqunxia/.agents/coord/ART-3d-tripo-web/user_selected/zhujue_f_tpose_unlit_2048.png'
    
    im = Image.open(src_path).convert('RGB')
    arr = np.array(im)
    
    # 1. Perfectly inpaint mole at (486, 144) using mirrored opposite cheek patch
    opp_patch = arr[139:150, 533:544].copy()
    opp_patch = np.fliplr(opp_patch)
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            dist = np.hypot(dx, dy)
            if dist <= 4.0:
                weight = max(0, 1.0 - dist / 4.0)
                src_val = opp_patch[dy + 5, dx + 5]
                cur_val = arr[144 + dy, 486 + dx]
                arr[144 + dy, 486 + dx] = (cur_val * (1 - weight) + src_val * weight).astype(np.uint8)
                
    im = Image.fromarray(arr)
    
    # 2. Stretch lower body vertically:
    # Chin is at Y=186, Crotch is at Y=548, Feet at Y=1001, Crown at Y=70
    upper = im.crop((0, 0, 1024, 548))
    lower = im.crop((0, 548, 1024, 1001))
    
    # Stretch lower body vertically by 1.10x
    new_lower_h = int(lower.height * 1.10)
    lower_stretched = lower.resize((1024, new_lower_h), Image.Resampling.LANCZOS)
    
    # Combine upper and lower
    combined_h = 548 + new_lower_h
    combined = Image.new('RGB', (1024, combined_h), (255, 255, 255))
    combined.paste(upper, (0, 0))
    combined.paste(lower_stretched, (0, 548))
    
    # 3. Clean background: ensure any border pixels > 245 are pure white 255
    comb_arr = np.array(combined)
    # BFS or simple flood fill from corners:
    # Any pixel connected to border with (R>240 and G>240 and B>240)
    from collections import deque
    h, w, _ = comb_arr.shape
    visited = np.zeros((h, w), dtype=bool)
    q = deque([(0, 0), (0, w-1), (h-1, 0), (h-1, w-1)])
    for y, x in list(q):
        visited[y, x] = True
    while q:
        cy, cx = q.popleft()
        comb_arr[cy, cx] = [255, 255, 255]
        for ny, nx in ((cy+1, cx), (cy-1, cx), (cy, cx+1), (cy, cx-1)):
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                p = comb_arr[ny, nx]
                if p[0] > 240 and p[1] > 240 and p[2] > 240:
                    visited[ny, nx] = True
                    q.append((ny, nx))
                    
    combined = Image.fromarray(comb_arr)
    
    # 4. Measure tight bounding box of character
    non_bg = (comb_arr[:, :, 0] < 250) | (comb_arr[:, :, 1] < 250) | (comb_arr[:, :, 2] < 250)
    ys, xs = np.where(non_bg)
    ymin, ymax = ys.min(), ys.max()
    xmin, xmax = xs.min(), xs.max()
    
    char_w = xmax - xmin + 1
    char_h = ymax - ymin + 1
    char_crop = combined.crop((xmin, ymin, xmax + 1, ymax + 1))
    
    # 5. Place onto a 2048x2048 canvas with ~82% height scale
    scale = 1680.0 / char_h
    target_w = int(char_w * scale)
    target_h = int(char_h * scale)
    
    char_resized = char_crop.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Create final 2048x2048 canvas
    final_canvas = Image.new('RGB', (2048, 2048), (255, 255, 255))
    offset_x = (2048 - target_w) // 2
    offset_y = (2048 - target_h) // 2
    
    final_canvas.paste(char_resized, (offset_x, offset_y))
    final_canvas.save(out_path, quality=100)
    
    # Also save a copy in brain artifacts for inspection
    artifact_path = '/Users/bytedance/.gemini/antigravity/brain/7966c7f3-b2b9-4421-ae03-163e89c52b09/zhujue_f_tpose_unlit_2048.png'
    final_canvas.save(artifact_path, quality=100)
    
    new_head_h = (186 - 70) * scale
    new_total_h = target_h
    ratio = new_total_h / new_head_h
    
    print(f'Processed T-pose saved to: {out_path}')
    print(f'Character BBox on 2048 canvas: x=[{offset_x}, {offset_x + target_w}], y=[{offset_y}, {offset_y + target_h}]')
    print(f'Margins: Left/Right={offset_x}, Top/Bottom={offset_y}')
    print(f'Head height: {new_head_h:.1f} px, Total height: {new_total_h} px')
    print(f'Head-to-body ratio: {ratio:.2f} : 1')

if __name__ == '__main__':
    process_tpose_image()
