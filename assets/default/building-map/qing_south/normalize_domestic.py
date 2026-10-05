#!/usr/bin/env python3
"""Normalize measured domestic sprites: crop, uniform resize, transparent pad only."""
import datetime
import hashlib
import json
import math
import shutil
import sys
from pathlib import Path
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
IDS = ['house_small', 'house_large', 'courtyard', 'shop_1f', 'shop_2f', 'inn',
       'restaurant', 'market_stall', 'warehouse', 'wharf']
FOOTPRINT_SOURCE = {'house_large': 'design/22 §3.4 bld_kit_qing_early_house',
                    'shop_1f': 'design/22 §3.4 bld_kit_qing_early_shop'}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def dump(path, obj):
    text = yaml.safe_dump(obj, allow_unicode=True, sort_keys=False, width=160, default_flow_style=None)
    assert len(text.splitlines()) <= 150, (path, len(text.splitlines()))
    path.write_text(text)

def process(suffix):
    ident = 'bld_kit_qing_south_' + suffix
    req = json.loads((ROOT/'sources'/f'{ident}.request.json').read_text())
    measure = json.loads((ROOT/'sources'/f'{ident}.measure.json').read_text())
    source = ROOT/'sources'/f'{ident}.png'
    shutil.copy2(req['source_path'], source)
    rejected = req.get('rejected_candidate')
    if rejected:
        rejected_dir = ROOT/'sources'/'rejected'
        rejected_dir.mkdir(exist_ok=True)
        number = rejected.get('candidate_number', 1)
        shutil.copy2(rejected['source_path'], rejected_dir/f'{ident}__candidate{number:02d}.png')
    im = Image.open(source)
    assert im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 0
    assert list(im.size) == measure['source_size'], (ident, im.size, measure['source_size'])
    left, front, right = [measure['corners'][name] for name in ('left', 'front', 'right')]
    w, h = req['footprint']
    scale = 32*(w+h)/(right[0]-left[0])
    center = [(left[n]+right[n])/2 for n in (0, 1)]
    crop = im.getchannel('A').getbbox()
    cut = im.crop(crop)
    new_size = tuple(max(1, round(n*scale)) for n in cut.size)
    actual = [new_size[n]/cut.size[n] for n in (0, 1)]
    cut = cut.resize(new_size, Image.Resampling.LANCZOS)
    pad = max(32, math.ceil(max(new_size)/8))
    canvas = tuple(max(512, math.ceil((n+pad*2)/32)*32) for n in new_size)
    paste = [(canvas[n]-new_size[n])//2 for n in (0, 1)]
    final = Image.new('RGBA', canvas, (0, 0, 0, 0))
    final.paste(cut, tuple(paste))
    target = ROOT/f'{ident}.png'
    final.save(target)
    anchor = [round((center[n]-crop[n])*actual[n]+paste[n], 4) for n in (0, 1)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    geometry = {'source_corners_px': measure['corners'], 'source_axis_slopes': slopes,
                'axis_tolerance': 0.03, 'axis_pass': all(abs(a-b)<=.03 for a,b in zip(slopes,[.5,-.5])),
                'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': w/h,
                'ratio_relative_error': abs(ratio/(w/h)-1), 'ratio_tolerance_suggestion': .1,
                'ratio_pass': abs(ratio/(w/h)-1)<=.1, 'measurement_uncertainty_source_px': 5,
                'precision_note': '原尺寸view_image人工读可见地面三角，±5源px；隐藏后角未实测，相机为目标而非反解。'}
    a = final.getchannel('A'); bbox = a.getbbox(); hist = a.histogram()
    pixel = {'mode': 'RGBA', 'size': list(canvas), 'alpha_extrema': list(a.getextrema()),
             'alpha_zero_pixels': hist[0], 'alpha_partial_pixels': sum(hist[1:255]), 'alpha_opaque_pixels': hist[255],
             'alpha_nonzero_bbox': list(bbox),
             'transparent_margins_px': [bbox[0],bbox[1],canvas[0]-bbox[2],canvas[1]-bbox[3]]}
    pixel['border_alpha_max'] = max(a.crop(b).getextrema()[1] for b in [(0,0,canvas[0],1),
        (0,canvas[1]-1,canvas[0],canvas[1]),(0,0,1,canvas[1]),(canvas[0]-1,0,canvas[0],canvas[1])])
    processing = {'source_archive': f'sources/{ident}.png', 'source_sha256': sha(source),
                  'source_size': list(im.size), 'crop_box': list(crop), 'uniform_scale_requested': scale,
                  'resized_size': list(new_size), 'rounded_effective_scale': actual, 'paste_offset': paste,
                  'steps': ['alpha>0 bounding-box crop', 'uniform LANCZOS resize with integer size rounding',
                            'paste without mask into transparent RGBA; no warp, alpha threshold, recolor or repaint']}
    building = {'type': ident, 'footprint': [w,h], 'anchor': anchor, 'era': 'qing_south'}
    projection = {'tile_px': [64,32], 'ground_bbox_px': [32*(w+h),16*(w+h)],
                  'light': 'screen_upper_left', 'shadow': 'screen_lower_right_contact_only'}
    entrance = {'edge': 'S', 'offset_cells': (w-1)//2}
    logical = [[anchor[0]-16*(w+h),anchor[1]-8*(w-h)], [anchor[0]+16*(w-h),anchor[1]+8*(w+h)],
               [anchor[0]+16*(w+h),anchor[1]+8*(w-h)], [anchor[0]-16*(w-h),anchor[1]-8*(w+h)]]
    meta = {'id': ident, 'status': 'candidate', 'building': building, 'anchor_px': anchor, 'footprint_m': [w,h],
            'footprint_source': FOOTPRINT_SOURCE.get(suffix, 'design/22 §3.3 bld_kit_song_southern_'+('house' if suffix=='house_small' else suffix)),
            'logical_footprint_polygon_px': logical, 'occluder_proxy_px': list(a.point(lambda v:255 if v>=192 else 0).getbbox()),
            'occluder_note': 'alpha>=192包围框仅测量代理；不修改PNG alpha；不能替代屋顶淡出/逐像素深度。',
            'height_m': None, 'height_note': '单视图不能可靠测量实际高度，待建模实测。',
            'planning_rotations_allowed': [0,180] if suffix=='wharf' else [0,90,180,270],
            'entrance': entrance, 'entrance_note': '南边中点规划代理，非图像门洞测量（待实测）。',
            'collision_polygon_m': [[0,0],[w,0],[w,h],[0,h]],
            'collision_note': '全矩形规划代理；院内通行、河埠台阶及门洞需细化，阴影不参与碰撞。',
            'views': [{'rotation_deg': 0, 'yaw_deg': 45, 'pitch_deg': 30, 'file': target.name}],
            'png_rotations_available': [0], 'allowRotation': False, 'glb': None, 'release_ready': False,
            'projection_contract': projection, 'geometry_qa': geometry, 'pixel_qa': pixel,
            'processing': processing, 'visual_review': measure['visual_review'], 'final_review': measure.get('final_review', '未复查'),
            'source_request': f'sources/{ident}.request.json', 'source_measure': f'sources/{ident}.measure.json'}
    (ROOT/'meta').mkdir(exist_ok=True)
    dump(ROOT/'meta'/f'{ident}.yaml', meta)
    ref = Path(req['reference'])
    entry = {'id': ident, 'file': target.name, 'category': 'building-map', 'style': 'default',
        'subject': '清初至清中江南·'+req['subject']+'（匿名原创组合，细部待考）',
        'prompt': req['prompt'], 'negative': '文字、人物、现代物件、实底背景、厚底台、裁切、强透视、金黄屋顶泛化',
        'references': [{'file': str(ref), 'sha256': sha(ref), 'role': '宋建筑材质、细节密度与相机意图参考'}],
        'tool': 'built-in image_gen', 'model': 'image_gen (underlying model not disclosed)',
        'effort': 'not exposed by image tool',
        'created': datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat(),
        'created_time_basis': 'copy2保留源PNG mtime，非服务端生成时间回执', 'source_path': req['source_path'],
        'source_sha256': sha(source), 'size': f'{canvas[0]}x{canvas[1]}', 'sha256': sha(target), 'status': 'candidate',
        'building': building, 'footprint_m': [w,h], 'entrance': entrance, 'projection_contract': projection,
        'metadata': f'meta/{ident}.yaml', 'source_record': f'sources/{ident}.request.json',
        'candidate_count': req['candidate_count'], 'geometry_qa': geometry, 'notes': measure['visual_review']}
    dump(ROOT/'meta'/f'{ident}.entry.yaml', entry)
    print(ident, canvas, geometry['axis_pass'], geometry['ratio_pass'])

if __name__ == '__main__':
    for suffix in sys.argv[1:]:
        assert suffix in IDS
        process(suffix)
    with (ROOT/'manifest-domestic.yaml').open('w') as out:
        for suffix in IDS:
            p = ROOT/'meta'/f'bld_kit_qing_south_{suffix}.entry.yaml'
            if p.exists():
                block = yaml.safe_dump([yaml.safe_load(p.read_text())], allow_unicode=True,sort_keys=False,width=160,default_flow_style=None)
                assert len(block.splitlines()) <= 150
                out.write(block)
