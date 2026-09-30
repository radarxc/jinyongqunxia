#!/usr/bin/env python3
"""Only crop transparent margins, uniformly rescale, and pad generated RGBA.

Run from repository root; each sources/<id>.json must contain measured
footprint_corners_source_px {left, front, right}. No drawing or warping.
"""
import argparse
import datetime
import hashlib
import json
import math
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalize(path):
    d = json.loads(path.read_text())
    ident, w, h = d['id'], d['w'], d['h']
    catalog = {row['id']: row for row in json.loads((ROOT/'catalog.json').read_text())}
    assert (w, h) == (catalog[ident]['w'], catalog[ident]['h'])
    source = path.with_suffix('.png')
    im = Image.open(source)
    assert im.mode == 'RGBA', (ident, im.mode)
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 128
    p = d['footprint_corners_source_px']
    left, front, right = [p[k] for k in ['left', 'front', 'right']]
    span = right[0] - left[0]
    assert span > 0
    scale = 32 * (w + h) / span
    center = [(left[i] + right[i]) / 2 for i in (0, 1)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    ratio_error = abs(ratio/(w/h)-1)
    crop = alpha.getbbox()
    # Preserve every nonzero alpha pixel, including faint generated edge pixels.
    cut = im.crop(crop)
    new_size = tuple(max(1, round(n*scale)) for n in cut.size)
    cut = cut.resize(new_size, Image.Resampling.LANCZOS)
    # Pillow rounds the pixel extent; record both actual scale factors below.
    sx, sy = new_size[0]/(crop[2]-crop[0]), new_size[1]/(crop[3]-crop[1])
    pad = max(32, math.ceil(max(new_size)/8))
    canvas = tuple(max(512, math.ceil((n+2*pad)/32)*32) for n in new_size)
    offset = [(canvas[i]-new_size[i])//2 for i in (0, 1)]
    final = Image.new('RGBA', canvas, (0, 0, 0, 0))
    final.paste(cut, tuple(offset))
    target = ROOT / (ident+'.png')
    final.save(target)
    anchor = [round((center[i]-crop[i])*[sx, sy][i]+offset[i], 4) for i in (0, 1)]
    a = final.getchannel('A')
    histogram = a.histogram()
    bbox = a.getbbox()
    era = 'song_dali' if ('_dali_' in ident or '_ch01_' in ident) else 'song_southern'
    logical = [[anchor[0]-16*(w+h), anchor[1]-8*(w-h)],
               [anchor[0]+16*(w-h), anchor[1]+8*(w+h)],
               [anchor[0]+16*(w+h), anchor[1]+8*(w-h)],
               [anchor[0]-16*(w-h), anchor[1]-8*(w+h)]]
    geometry = {'source_corners_px': p, 'source_axis_slopes': slopes,
                'axis_tolerance': 0.03, 'axis_pass': abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
                'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': w/h,
                'ratio_relative_error': ratio_error, 'ratio_tolerance_suggestion': 0.1,
                'ratio_pass': ratio_error <= .1, 'measurement_uncertainty_source_px': 3,
                'precision_note': '人工读可见底面边；±3px不确定性；非3D测绘，隐藏后角未直接测得。'}
    stats = {'mode': final.mode, 'size': list(canvas), 'alpha_extrema': list(a.getextrema()),
             'alpha_zero_pixels': histogram[0], 'alpha_partial_pixels': sum(histogram[1:255]),
             'alpha_opaque_pixels': histogram[255], 'alpha_near_opaque_pixels': sum(histogram[192:]),
             'alpha_nonzero_bbox': list(bbox),
             'transparent_margins_px': [bbox[0], bbox[1], canvas[0]-bbox[2], canvas[1]-bbox[3]],
             'border_alpha_max': max(a.crop(box).getextrema()[1] for box in
              [(0,0,canvas[0],1),(0,canvas[1]-1,canvas[0],canvas[1]),(0,0,1,canvas[1]),(canvas[0]-1,0,canvas[0],canvas[1])])}
    processing = {'source_archive': str(source.relative_to(ROOT)), 'source_sha256': sha(source),
                  'source_size': list(im.size), 'crop_box': list(crop), 'uniform_scale_requested': scale,
                  'resized_size': list(new_size), 'rounded_effective_scale': [sx, sy],
                  'paste_offset': offset, 'final_file': target.name,
                  'steps': ['crop to alpha>0 bounding box', 'uniform LANCZOS resize; dimensions rounded to nearest px',
                            'paste without mask into transparent RGBA canvas; no repaint, warp, flip or alpha thresholding']}
    solid = a.point(lambda value: 255 if value >= 192 else 0).getbbox()
    meta = {'id': ident, 'status': 'candidate', 'building': {'type': ident, 'footprint': [w,h], 'anchor': anchor, 'era': era},
            'anchor_px': anchor, 'footprint_m': [w,h], 'logical_footprint_polygon_px': logical,
            'collision_polygon_m': [[0,0],[w,0],[w,h],[0,h]],
            'collision_note': 'design/22 §6.6基线全footprint硬碰撞；非实测墙体，院内行走另需细化，不含阴影。',
            'occluder_proxy_px': [[solid[0],solid[1]],[solid[2],solid[1]],[solid[2],solid[3]],[solid[0],solid[3]]],
            'occluder_note': '仅统计alpha>=192的包围框，未修改图片alpha；保守离线代理，不能替代屋顶淡出/逐像素深度。',
            'height_proxy_m': round((anchor[1]-solid[1])/math.sqrt(1536),2),
            'height_note': '仅顶点与底面中心同XZ时近似成立的投影代理（待实测）；长脊/院落不适用，不是建模实高。',
            'entrance': {'edge': 'N' if ident.endswith('palace_gate') else 'S', 'offset_cells': (w-1)//2},
            'entrance_note': '目录入口边中点代理，非图像门洞实测；地标北门从背面视图无法直接确认（待实测）。',
            'planning_rotations_allowed': [0,90,180,270] if catalog[ident]['rotations']=='四向' else ([0,180] if catalog[ident]['rotations']=='0/180' else [0]),
            'views': [{'rotation_deg': 0, 'yaw_deg': 45, 'pitch_deg': 30, 'file': target.name}],
            'png_rotations_available': [0], 'allowRotation': False, 'glb': None,
            'projection_contract': {'tile_px': [64,32], 'ground_bbox_px': [32*(w+h),16*(w+h)],
                                    'ground_width_px': 32*(w+h), 'light': 'screen_upper_left', 'shadow': 'screen_lower_right_contact_only'},
            'geometry_qa': geometry, 'pixel_qa': stats, 'processing': processing, 'release_ready': False}
    (ROOT/'meta'/f'{ident}.yaml').write_text(yaml.safe_dump(meta,allow_unicode=True,sort_keys=False,width=120,default_flow_style=None))
    entry = {k: d.get(k) for k in ['id','subject','prompt','negative','references','source_path','created']}
    if 'T' in str(d.get('created', '')):
        entry['created_time_basis'] = '生成后记录的接收/归档时间；非工具披露的服务端调用时间'
    else:
        entry['created'] = datetime.datetime.fromtimestamp(source.stat().st_mtime, datetime.timezone.utc).isoformat()
        entry['created_time_basis'] = 'copy2保留的源PNG文件mtime；非工具披露的服务端调用时间'
    entry.update({'file': target.name, 'category': 'building-map', 'style': 'default',
                  'model': 'image_gen (underlying model not disclosed)', 'effort': 'not exposed by image tool',
                  'tool': 'built-in image_gen', 'size': f'{canvas[0]}x{canvas[1]}', 'sha256': sha(target),
                  'status': 'candidate', 'building': meta['building'], 'footprint_m': [w,h],
                  'entrance': meta['entrance'], 'projection_contract': meta['projection_contract'],
                  'metadata': f'meta/{ident}.yaml', 'source_sha256': sha(source),
                  'processing': processing, 'geometry_qa': geometry, 'pixel_qa': stats,
                  'candidate_count': d.get('candidate_count',1),
                  'source_record': f'sources/{ident}.json', 'notes': d.get('visual_review','')})
    (ROOT/'meta'/f'{ident}.entry.json').write_text(json.dumps(entry,ensure_ascii=False)+'\n')
    return ident, geometry['axis_pass'], geometry['ratio_pass'], canvas


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('ids', nargs='*')
    args = parser.parse_args()
    paths = [ROOT/'sources'/f'{v}.json' for v in args.ids] if args.ids else sorted((ROOT/'sources').glob('bld_*.json'))
    for path in paths:
        if 'footprint_corners_source_px' not in json.loads(path.read_text()):
            print('SKIP unmeasured', path.stem)
            continue
        print(normalize(path))
