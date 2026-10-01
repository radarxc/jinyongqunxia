"""Rebuild six utility sprites with crop, uniform resize and transparent padding only."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def write_small(path, value):
    text = yaml.safe_dump(value, allow_unicode=True, sort_keys=False, width=180, default_flow_style=None)
    lines = text.splitlines(True)
    with path.open('w', encoding='utf-8') as out:
        for i in range(0, len(lines), 100):
            out.writelines(lines[i:i + 100])

def normalize(rec):
    ident = rec['id']
    src = Path(rec['source_path'])
    for sub in ('sources', 'meta'):
        (ROOT / sub).mkdir(exist_ok=True)
    archive = ROOT / 'sources' / f'{ident}.png'
    shutil.copy2(src, archive)
    original = Image.open(archive)
    assert original.mode == 'RGBA'
    alpha = original.getchannel('A')
    crop = alpha.getbbox()
    left, front, right = [rec['source_corners_px'][key] for key in ('left', 'front', 'right')]
    w, h = rec['footprint']
    scale = 32 * (w + h) / (right[0] - left[0])
    cropped = original.crop(crop)
    scaled_size = [round(d * scale) for d in cropped.size]
    resized = cropped.resize(scaled_size, Image.Resampling.LANCZOS)
    canvas_size = [max(512, math.ceil((d + 128) / 32) * 32) for d in scaled_size]
    offset = [(canvas_size[i] - scaled_size[i]) // 2 for i in range(2)]
    final = Image.new('RGBA', canvas_size, (0, 0, 0, 0))
    final.paste(resized, offset)
    target = ROOT / f'{ident}.png'
    final.save(target)
    source_anchor = [(left[i] + right[i]) / 2 for i in range(2)]
    anchor = [round((source_anchor[i] - crop[i]) * scale + offset[i], 4) for i in range(2)]
    slopes = [(front[1] - left[1]) / (front[0] - left[0]), (right[1] - front[1]) / (right[0] - front[0])]
    ratio = (front[0] - left[0]) / (right[0] - front[0])
    geometry = {'source_corners_px': rec['source_corners_px'], 'source_axis_slopes': slopes,
        'axis_tolerance': .03, 'axis_pass': abs(slopes[0] - .5) <= .03 and abs(slopes[1] + .5) <= .03,
        'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': w / h,
        'ratio_relative_error': abs(ratio / (w / h) - 1), 'ratio_tolerance_suggestion': .1,
        'ratio_pass': abs(ratio / (w / h) - 1) <= .1, 'measurement_uncertainty_source_px': 5,
        'precision_note': '人工读底面左右/前角，误差约±5源像素；隐藏后角未直接测得。锚点是左右对角中心代理，残差不靠变形消除。'}
    a = final.getchannel('A')
    histogram = a.histogram()
    bbox = a.getbbox()
    pixel = {'mode': final.mode, 'size': canvas_size, 'alpha_extrema': a.getextrema(),
        'alpha_zero_pixels': histogram[0], 'alpha_partial_pixels': sum(histogram[1:255]),
        'alpha_opaque_pixels': histogram[255], 'alpha_nonzero_bbox': bbox,
        'transparent_margins_px': [bbox[0], bbox[1], canvas_size[0]-bbox[2], canvas_size[1]-bbox[3]],
        'border_alpha_max': max(max(a.crop(box).getextrema()) for box in [(0,0,canvas_size[0],1),(0,canvas_size[1]-1,*canvas_size),(0,0,1,canvas_size[1]),(canvas_size[0]-1,0,*canvas_size)])}
    processing = {'source_archive': f'sources/{ident}.png', 'source_sha256': sha(archive), 'source_size': original.size,
        'crop_box': crop, 'uniform_scale_requested': scale, 'resized_size': scaled_size,
        'rounded_effective_scale': [scaled_size[i]/cropped.size[i] for i in range(2)], 'paste_offset': offset,
        'steps': ['crop alpha>0 bounding rectangle', 'uniform LANCZOS resize with integer rounding', 'paste without mask into transparent RGBA; no alpha threshold, warp, repaint or mirror']}
    building = {'type': ident, 'footprint': [w,h], 'anchor': anchor, 'era': 'yuan'}
    projection = {'tile_px':[64,32], 'ground_bbox_px':[32*(w+h),16*(w+h)], 'ground_width_px':32*(w+h),
        'light':'screen_upper_left', 'shadow':'screen_lower_right_contact_only', 'note':'目标契约；实测残差见geometry_qa，不冒充精确反推相机。'}
    entry = {'id': ident, 'file': f'{ident}.png', 'category':'building-map','style':'default','subject':rec['subject'],
        'prompt':rec['prompt'],'negative':'文字、水印、人物、现代物、大背景、光晕、厚地台、夸张翘角、透视汇聚',
        'references':[], 'visual_comparison_reference':{'file':'assets/default/baseline/building-map/bld_kit_song_southern_warehouse.png','role':'已view_image视觉比照；未作为工具图像输入'},
        'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)','effort':'not exposed by image tool',
        'created':datetime.fromtimestamp(src.stat().st_mtime,timezone.utc).isoformat(),'created_time_basis':'源PNG文件mtime，非服务端时间回执',
        'source_path':str(src),'size':f'{canvas_size[0]}x{canvas_size[1]}','sha256':sha(target),'status':'candidate',
        'building':building,'footprint_m':[w,h], 'footprint_basis':rec['footprint_basis'],
        'entrance':{'edge':'S','offset_cells':w//2},'projection_contract':projection,'metadata':f'meta/{ident}.yaml',
        'source_record':f'sources/{ident}.json','source_sha256':sha(archive),'processing':processing,'geometry_qa':geometry,
        'pixel_qa':pixel,'candidate_count':2,'selected_candidate':rec['selected_candidate'],'notes':rec['notes']}
    logical = [[anchor[0]-16*(w+h),anchor[1]+8*(h-w)], [anchor[0]+16*(w-h),anchor[1]+8*(w+h)],
        [anchor[0]+16*(w+h),anchor[1]+8*(w-h)], [anchor[0]+16*(h-w),anchor[1]-8*(w+h)]]
    metadata = {'id':ident,'status':'candidate','building':building,'anchor_px':anchor,'logical_footprint_polygon_px':logical,
        'collision_polygon_m':[[0,0],[w,0],[w,h],[0,h]],'collision_note':'完整占地逻辑代理；非实测墙体，不含阴影。河埠不启用port。',
        'actual_height_m':None,'height_note':'单图不能可靠反推实际高度，待后续3D建模实测。',
        'entrance':entry['entrance'],'entrance_note':'逻辑入口中点代理，未实测门洞。',
        'planning_rotations_allowed':rec['rotations'],'png_rotations_available':[0],'allowRotation':False,
        'views':[{'rotation_deg':0,'yaw_deg':45,'pitch_deg':30,'file':entry['file']}],'glb':None,
        'projection_contract':projection,'geometry_qa':geometry,'pixel_qa':pixel,'processing':processing,'release_ready':False}
    write_small(ROOT/'meta'/f'{ident}.yaml',metadata)
    write_small(ROOT/'meta'/f'{ident}.entry.yaml',entry)
    source_record = dict(rec, source_sha256=sha(archive), source_size=list(original.size), processing=processing)
    lines = json.dumps(source_record,ensure_ascii=False,indent=2).splitlines(True)
    with (ROOT/'sources'/f'{ident}.json').open('w',encoding='utf-8') as out:
        for i in range(0,len(lines),100): out.writelines(lines[i:i+100])
    print(ident, entry['size'], anchor, 'axis', geometry['axis_pass'], 'ratio', geometry['ratio_pass'])
    return entry

if __name__ == '__main__':
    records = json.loads((ROOT/'sources'/'utility-inputs.json').read_text())
    entries = [normalize(r) for r in records]
    write_small(ROOT/'manifest_utility.yaml',entries)
