"""Normalize six KIT-mongol assets using crop, uniform resize and transparent pad only."""
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

BASE = Path(__file__).resolve().parent
JOBS = json.loads((BASE / 'root-jobs.json').read_text())
SELECTED = {
    'temple_hall': ('bld_kit_mongol_temple_hall', [[30,708],[780,1050],[1403,744]]),
    'stupa': ('stupaRetry', [[224,713],[742,998],[1320,684]]),
    'guardhouse': ('bld_kit_mongol_guardhouse', [[36,831],[606,1100],[1351,785]]),
    'stable': ('stableRetry', [[201,630],[856,996],[1354,723]]),
    'warehouse': ('bld_kit_mongol_warehouse', [[150,669],[782,974],[1306,737]]),
    'wharf': ('bld_kit_mongol_wharf', [[167,559],[799,920],[1111,748]]),
}

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def dump_small(path, obj):
    content = yaml.safe_dump(obj, allow_unicode=True, sort_keys=False, width=100000,
                             default_flow_style=None)
    assert len(content.splitlines()) <= 150, path
    path.write_text(content)

entries = []
for job in JOBS:
    name = job['name']
    key, corners = SELECTED[name]
    call = json.loads((BASE / 'sources' / (key + '__call.json')).read_text())
    source = BASE / 'sources' / (key + '__raw.png')
    im = Image.open(source)
    assert im.mode == 'RGBA'
    crop = im.getchannel('A').getbbox()
    cut = im.crop(crop)
    left, front, right = corners
    w, h = job['footprint']
    scale = 32 * (w + h) / (right[0] - left[0])
    resized = [round(cut.width * scale), round(cut.height * scale)]
    size = [max(256, math.ceil((n + 64) / 16) * 16) for n in resized]
    offset = [(size[i] - resized[i]) // 2 for i in range(2)]
    image = Image.new('RGBA', size, (0,0,0,0))
    image.paste(cut.resize(resized, Image.Resampling.LANCZOS), offset)
    target = BASE / (job['id'] + '.png')
    image.save(target)
    sx, sy = resized[0]/cut.width, resized[1]/cut.height
    anchor_src = [(left[i] + right[i])/2 for i in range(2)]
    anchor = [round((anchor_src[i]-crop[i]) * [sx,sy][i] + offset[i],4) for i in range(2)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    qa = {'source_corners_LFR_px': corners, 'source_axis_slopes': slopes,
          'axis_tolerance': 0.03, 'axis_pass': abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
          'width_depth_ratio': ratio, 'expected_ratio': w/h,
          'ratio_relative_error': abs(ratio/(w/h)-1), 'ratio_tolerance_suggestion': .1,
          'ratio_pass': abs(ratio/(w/h)-1)<=.1, 'measurement_uncertainty_source_px': 5,
          'note': '人工读取可见底面L/F/R；隐藏后角由平行边推算。几何残差未warp修正。'}
    processing = {'source_archive': str(source.relative_to(BASE)), 'source_sha256': sha(source),
                  'source_size': list(im.size), 'crop_box': list(crop),
                  'uniform_scale_requested': scale, 'resized_size': resized,
                  'actual_scale_xy': [sx,sy], 'paste_offset': offset,
                  'anchor_source_px': anchor_src, 'alpha_edits': 'none',
                  'note': '只裁全透明包围留白、一次等比目标LANCZOS、透明padding；整数尺寸有亚像素取整。'}
    refs = []
    for ref in call['references']:
        rp = Path(ref)
        if name == 'stupa':
            rp = BASE / 'sources/bld_kit_mongol_stupa__raw.png'
        elif not rp.is_absolute():
            rp = BASE.parents[3] / ref
        record = {'file':str(rp.relative_to(BASE)) if name == 'stupa' else ref,
                  'sha256':sha(rp),'role':'实际image_gen编辑输入'}
        if name == 'stupa':
            record['source_path'] = ref
        refs.append(record)
    entry = {'id':job['id'],'file':target.name,'category':'building-map','style':'default',
             'subject':'13–14世纪蒙古草原/和林/上都语境：'+job['cn']+'（原创扩展；非具名文物复原）',
             'prompt':call['prompt'],'negative':'无文字/人物/现代元素/厚地台/背景/伪透明/透视汇聚',
             'references':refs,'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)',
             'effort':'not exposed','created':datetime.fromtimestamp(source.stat().st_mtime,timezone.utc).isoformat(),
             'created_time_basis':'源PNG文件mtime，不是服务端调用时间','source_path':call['source_path'],
             'size':f'{size[0]}x{size[1]}','sha256':sha(target),'status':'candidate',
             'building':{'type':job['id'],'footprint':[w,h],'anchor':anchor,'era':'mongol'},
             'footprint_m':[w,h],'footprint_basis':job['basis'],
             'entrance':{'edge':'S','offset_cells':w//2},
             'projection_contract':{'tile_px':[64,32],'ground_bbox_px':[32*(w+h),16*(w+h)],
                                    'light':'screen_upper_left','shadow':'screen_lower_right_contact_only'},
             'metadata':'meta/'+job['id']+'.yaml','processing':processing,
             'notes':'仅原向单视图；锚点为底面中心代理；精确接缝/碰撞/遮挡待实测；底面严格几何见meta。'}
    meta = {'id':job['id'],'building':entry['building'],'anchor_px':anchor,
            'geometry_qa':qa,'processing':processing,'views':[{'rotation_deg':0,'file':target.name}],
            'allowRotation':False,'glb':None,'release_ready':False,
            'pixel_qa':{'mode':image.mode,'size':size,'alpha_extrema':list(image.getchannel('A').getextrema()),
                        'alpha_bbox':list(image.getchannel('A').getbbox()),
                        'transparent_pixels':image.getchannel('A').histogram()[0]},
            'collision_polygon_m':[[0,0],[w,0],[w,h],[0,h]],
            'collision_note':'候选逻辑矩形，非实墙测绘；河埠仅装饰，不创建port或旅行服务。',
            'historical_note':'仅地域母题有文字参考；具体屋面/门窗/彩画/塔式为原创设计，待考。'}
    dump_small(BASE / 'meta' / (job['id']+'.yaml'), meta)
    dump_small(BASE / 'meta' / (job['id']+'__entry.yaml'), entry)
    entries.append(entry)
    print(job['id'], entry['size'], 'anchor',anchor,'axes',slopes,'ratio_error',round(qa['ratio_relative_error'],3))
out = BASE / 'manifest-root.yaml'
out.write_text('')
for entry in entries:
    content=yaml.safe_dump([entry],allow_unicode=True,sort_keys=False,width=100000,default_flow_style=None)
    assert len(content.splitlines())<=150
    with out.open('a') as f:
        f.write(content)
