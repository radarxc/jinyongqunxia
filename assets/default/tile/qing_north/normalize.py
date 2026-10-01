#!/usr/bin/env python3
"""本套件可重放规格化：仅RGBA裁框、等比缩放与透明padding。"""
from pathlib import Path
import hashlib
import json
import math
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
ROWS = [json.loads(s) for s in (ROOT / 'generation.jsonl').read_text().splitlines()]
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

for index, row in enumerate(ROWS):
    selected = Path(row['source'])
    source = ROOT / 'source' / (row['id'] + '__selected.png')
    if not source.exists() or sha(source) != row['source_sha256']:
        shutil.copy2(selected, source)
    im = Image.open(source)
    assert im.mode == 'RGBA'
    alpha = im.getchannel('A')
    box = alpha.getbbox()
    w, h = row['footprint']
    if 'corners' in row:
        left, front, right, back = row['corners']
        origin = [(left[0] + right[0]) / 2, (left[1] + right[1]) / 2]
        scale = 32 * (w + h) / (right[0] - left[0])
        slopes = [(front[1] - left[1]) / (front[0] - left[0]),
                  (right[1] - front[1]) / (right[0] - front[0])]
    else:
        origin = row['root']
        solid_box = alpha.point(lambda a: 255 if a >= 128 else 0).getbbox()
        scale = math.ceil(16 * math.sqrt(6) * row['height']) / (origin[1] - solid_box[1])
        slopes = []
    crop = im.crop(box)
    dest_size = [round(crop.width * scale), round(crop.height * scale)]
    resized = crop.resize(dest_size, Image.Resampling.LANCZOS)
    output = Image.new('RGBA', (resized.width + 8, resized.height + 8))
    output.paste(resized, (4, 4))
    final = ROOT / (row['id'] + '.png')
    output.save(final)
    sx, sy = resized.width / crop.width, resized.height / crop.height
    anchor = [round((origin[0] - box[0]) * sx + 4, 3), round((origin[1] - box[1]) * sy + 4, 3)]
    notes = '仅非零alpha外接矩形裁切、等比缩放（整数尺寸舍入）、4px透明边；原alpha保留；单朝向candidate，几何残差见qa.jsonl。'
    entry = {
        'id': row['id'], 'file': final.name, 'category': 'tile', 'style': 'default',
        'subject': row['subject'], 'prompt': row['prompt'],
        'negative': '无文字、水印、人物、现代物件、地台、背景；禁止假棋盘透明；禁止旋转单图充当四朝向。',
        'references': row['reference_records'],
        'tool': 'codex exec · image_gen (built-in)', 'model': 'image_gen (backend undisclosed)',
        'effort': 'not_exposed',
        'created': row['created'],
        'source_path': row['source'], 'size': f'{output.width}x{output.height}',
        'sha256': sha(final), 'status': 'candidate',
        'tile': {'kind': row['kind'], 'footprint': row['footprint'], 'variant': row['variant'], 'autotile_mask': None},
        'source_copy': str(source.relative_to(ROOT)), 'source_sha256': sha(source),
        'anchor_px': anchor, 'notes': notes,
    }
    # 每次只写一条记录（约40行），遵守单次写入150行上限。
    with (ROOT / 'manifest.yaml').open('w' if index == 0 else 'a') as handle:
        yaml.safe_dump([entry], handle, allow_unicode=True, sort_keys=False, width=100000)
    qa = {'id': row['id'], 'source_size': list(im.size), 'crop': list(box), 'scale_target': scale,
          'scale_integer_x_y': [sx, sy], 'size': list(output.size), 'anchor_px': anchor,
          'raw_alpha_extrema': list(alpha.getextrema()), 'alpha_extrema': list(output.getchannel('A').getextrema()),
          'alpha_zero_pixels': output.getchannel('A').histogram()[0],
          'measured_slopes': slopes, 'slope_abs_residual': [abs(abs(s) - .5) for s in slopes],
          'measurement_note': row['measurement_note'], 'corners_raw': row.get('corners'),
          'inferred_corner_indices': row['inferred_corner_indices'],
          'height_m_target': row['height'], 'rotation_complete': False,
          'visual_review': '已view_image逐张查看原图与成品；光向/灰材质/剪影为候选可用，精确2:1与接缝未通过。'}
    qa.update(row.get('repair_qa', {}))
    if 'passage' in row:
        qa.update({'passage_cells': [row['passage'], 4], 'solid_pier_width_cells': 2,
                   'logical_footprint_rect_xywh': [0, 0, w, h],
                   'logical_passage_rect_xywh': [2, 0, row['passage'], 4],
                   'logical_pier_rects_xywh': [[0, 0, 2, 4], [row['passage'] + 2, 0, 2, 4]],
                   'logical_anchor_m': [w / 2, h / 2],
                   'source_passage_probe_xy': row['alpha_probe'], 'source_passage_probe_alpha': alpha.getpixel(tuple(row['alpha_probe'])),
                   'passage_mask_alignment': '仅逻辑规格；未声称图像孔与格掩膜精确重合'})
    if 'root' in row:
        qa['root_raw'] = row['root']
        qa['visual_canopy_width_measured_px'] = round(row['visual_width'] * scale, 3)
        qa['root_to_crown_height_target_px'] = math.ceil(16 * math.sqrt(6) * row['height'])
        qa['species_review'] = '地域意象候选，非植物鉴定或古树复原'
    with (ROOT / 'qa.jsonl').open('w' if index == 0 else 'a') as handle:
        handle.write(json.dumps(qa, ensure_ascii=False) + '\n')
    print(row['id'], output.size, anchor, 'slopes', slopes)
