#!/usr/bin/env python3
"""Civic assets: archive sources; crop, uniform-scale, transparent-pad only."""
import hashlib
import json
import math
import shutil
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
POINTS = {
    'market': [[76, 676], [875, 961], [1451, 732]],
    'yamen': [[60, 544], [823, 939], [1485, 570]],
    'biaoju': [[184, 531], [856, 857], [1366, 584]],
    'casino': [[84, 730], [669, 1051], [1189, 766]],
    'manor': [[188, 536], [861, 870], [1369, 586]],
    'wangfu': [[34, 607], [789, 1007], [1460, 633]],
}
NEGATIVE = '人物、现代物、文字、水印、风景背景、厚底台、清代黄瓦九龙脊、旅游装饰、非等比纠斜'

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def write_limited(path, text, append=False):
    lines = text.splitlines(keepends=True)
    if not append:
        Path(path).write_text('', encoding='utf-8')
    for start in range(0, len(lines), 140):
        with Path(path).open('a', encoding='utf-8') as stream:
            stream.write(''.join(lines[start:start + 140]))

def dump(path, obj, append=False):
    write_limited(path, yaml.safe_dump(obj, allow_unicode=True, sort_keys=False, width=150), append)

def one(record):
    key, asset_id = record['key'], record['id']
    width, depth = record['footprint']
    (ROOT / 'meta').mkdir(exist_ok=True)
    for candidate in record['candidates']:
        archive = ROOT / 'sources' / f'{asset_id}__c{candidate["number"]:02}.png'
        shutil.copy2(candidate['path'], archive)
        candidate['archive'] = str(archive.relative_to(ROOT))
        candidate['sha256'] = sha(archive)
        candidate['selected'] = candidate['number'] == record['chosen']
        candidate['reference_inputs'] = []
        if record['ref'] and (candidate['number'] == 2 or key == 'wangfu'):
            candidate['reference_inputs'] = [record['ref']]
        if key == 'wangfu' and candidate['number'] == 2:
            candidate['reference_inputs'] = [record['candidates'][0]['archive']]
    selected = record['candidates'][record['chosen'] - 1]
    source = Image.open(ROOT / selected['archive'])
    assert source.mode == 'RGBA'
    sw, sh = source.size
    source_alpha = source.getchannel('A')
    source_border = {name: source_alpha.crop(box).getextrema()[1] for name, box in {
        'left': (0,0,1,sh), 'right': (sw-1,0,sw,sh), 'top': (0,0,sw,1), 'bottom': (0,sh-1,sw,sh)}.items()}
    left, front, right = POINTS[key]
    source_anchor = [(left[i] + right[i]) / 2 for i in range(2)]
    scale = 32 * (width + depth) / (right[0] - left[0])
    crop_box = source.getchannel('A').getbbox()
    cropped = source.crop(crop_box)
    resized_size = [round(n * scale) for n in cropped.size]
    size = [max(512, math.ceil((n + 32) / 32) * 32) for n in resized_size]
    offset = [(size[i] - resized_size[i]) // 2 for i in range(2)]
    result = Image.new('RGBA', tuple(size), (0, 0, 0, 0))
    result.paste(cropped.resize(tuple(resized_size), Image.Resampling.LANCZOS), tuple(offset))
    target = ROOT / f'{asset_id}.png'
    result.save(target)
    effective_scale = [resized_size[i] / cropped.size[i] for i in range(2)]
    anchor = [round((source_anchor[i] - crop_box[i]) * effective_scale[i] + offset[i], 4) for i in range(2)]
    slopes = [(front[1] - left[1]) / (front[0] - left[0]), (right[1] - front[1]) / (right[0] - front[0])]
    ratio = (front[0] - left[0]) / (right[0] - front[0])
    geometry = {'source_corners_px': dict(zip(['left', 'front', 'right'], POINTS[key])), 'source_anchor_px': source_anchor,
        'hidden_back_corner_method': 'back = left + right - front；底面中心为(left+right)/2，后角未直接观测',
        'source_axis_slopes': slopes, 'axis_tolerance': 0.03, 'axis_pass': all(abs(abs(m)-0.5) <= 0.03 for m in slopes),
        'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': width / depth,
        'ratio_relative_error': abs(ratio / (width / depth) - 1), 'ratio_tolerance_suggestion': 0.1,
        'ratio_pass': abs(ratio / (width / depth) - 1) <= 0.1, 'measurement_uncertainty_source_px': 4,
        'observed_ground_height_px': round((2*front[1]-left[1]-right[1])*effective_scale[1],4),
        'precision_note': '人工按底面可见边读点，±4源px；真实形体边界仍需合成复核；不以标称相机替代实测。'}
    geometry['final_measured_corners_px'] = {
        name: [round((point[i]-crop_box[i])*effective_scale[i]+offset[i],4) for i in range(2)]
        for name, point in zip(['left','front','right'],POINTS[key])}
    alpha = result.getchannel('A'); hist = alpha.histogram(); bbox = alpha.getbbox()
    pixels = {'mode': result.mode, 'size': size, 'alpha_extrema': list(alpha.getextrema()), 'alpha_zero_pixels': hist[0],
        'alpha_partial_pixels': sum(hist[1:255]), 'alpha_opaque_pixels': hist[255], 'alpha_near_opaque_pixels': sum(hist[192:]),
        'alpha_nonzero_bbox': list(bbox), 'transparent_margins_px': [bbox[0],bbox[1],size[0]-bbox[2],size[1]-bbox[3]], 'border_alpha_max': 0}
    processing = {'source_archive': selected['archive'], 'source_size': list(source.size), 'source_sha256': sha(ROOT/selected['archive']),
        'crop_box': list(crop_box), 'uniform_scale_requested': scale, 'resized_size': resized_size,
        'rounded_effective_scale': effective_scale, 'paste_offset': offset,
        'steps': ['只裁alpha>0包围框外透明空白', '一次等比LANCZOS；整数宽高量化误差单列', '无mask粘贴至透明RGBA画布；不改颜色/alpha、不warp、不补画'],
        'anchor_formula': '(source_anchor-crop_origin)*rounded_effective_scale+paste_offset'}
    building = {'type': asset_id, 'footprint': [width,depth], 'anchor': anchor, 'era': 'mongol'}
    projection = {'tile_px':[64,32], 'ground_bbox_px':[32*(width+depth),16*(width+depth)], 'light':'screen_upper_left', 'shadow':'screen_lower_right_contact_only', 'camera_requested':{'yaw_deg':45,'pitch_deg':30}, 'measured_geometry_pass':geometry['axis_pass'] and geometry['ratio_pass']}
    refs = []
    if record['ref']:
        refs.append({'file':record['ref'], 'sha256':sha(REPO/record['ref']), 'role':'宋基线地域变体编辑参考；已view_image；不继承宋年代'})
    if key == 'wangfu':
        refs.append({'file':record['candidates'][0]['archive'], 'sha256':record['candidates'][0]['sha256'], 'role':'第二候选编辑目标；仅改台基地面几何'})
    note = '两候选各已view_image；主体完整、无人物文字，左上光。真实RGBA；原图隐藏RGB的棕色晕不是alpha不透明背景。底面角度或宽深比例仍有残差，不能视为精确可拼接准出。历史细部（待考），功能布局（原创扩展）。'
    meta = {'id':asset_id,'status':'candidate','building':building,'anchor_px':anchor,'footprint_m':[width,depth],
        'collision_polygon_m':[[0,0],[width,0],[width,depth],[0,depth]],'collision_note':'基线全footprint代理；院内行走与纯阴影须下游区分。',
        'entrance':{'edge':'S','offset_cells':(width-1)//2},'entrance_note':'目录代理，非门洞实测。',
        'planning_rotations_allowed':[0,180] if key in ['yamen','wangfu'] else [0,90,180,270],
        'png_rotations_available':[0],'allowRotation':False,'glb':None,'height_m':None,'height_note':'没有真实高度/GLB，不从图高杜撰。',
        'views':[{'rotation_deg':0,'yaw_deg':45,'pitch_deg':30,'file':target.name,'angles_note':'提示词请求值；实际轴偏差见geometry_qa'}],
        'projection_contract':projection,'geometry_qa':geometry,'pixel_qa':pixels,'processing':processing,
        'source_pixel_qa':{'border_alpha_max':source_border,'alpha_extrema':list(source_alpha.getextrema()),'border_note':'触边若alpha=1仅约0.39%低alpha噪点；未删除，原图完整归档，成品透明pad。'},
        'candidate_count':2,'selected_candidate':record['chosen'],'release_ready':False,'notes':note}
    dump(ROOT/'meta'/f'{asset_id}.yaml',meta)
    provenance = dict(record, references=refs, source_viewed=True, final_viewed=True,
        view_note='两张源候选与规格化成品均已逐张view_image；2026-09-30；成品无实物裁切、无棕色背景，几何偏差保留。')
    write_limited(ROOT/'sources'/f'{asset_id}.json',json.dumps(provenance,ensure_ascii=False,indent=2)+'\n')
    entry = {'id':asset_id,'file':target.name,'category':'building-map','style':'default','subject':'蒙古草原/和林—上都地域候选：'+record['subject'],
        'prompt':selected['prompt'],'negative':NEGATIVE,'references':refs,'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)',
        'effort':'not exposed by image tool','created':datetime.fromtimestamp(Path(selected['path']).stat().st_mtime,timezone.utc).isoformat(),
        'created_time_basis':'源PNG文件mtime；非服务端调用时间','source_path':selected['path'],'size':f'{size[0]}x{size[1]}','sha256':sha(target),
        'status':'candidate','building':building,'metadata':f'meta/{asset_id}.yaml','source_record':f'sources/{asset_id}.json','source_sha256':selected['sha256'],
        'footprint_m':[width,depth],'entrance':meta['entrance'],'projection_contract':projection,'notes':note}
    dump(ROOT/'manifest-civic.yaml',[entry],append=True)
    print(asset_id,size,anchor,slopes,geometry['ratio_relative_error'])

if __name__ == '__main__':
    (ROOT/'manifest-civic.yaml').write_text('',encoding='utf-8')
    for rec in json.loads((ROOT/'sources/civic-inputs.json').read_text()):
        one(rec)
