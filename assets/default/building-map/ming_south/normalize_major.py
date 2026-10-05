"""Normalize nine major Ming Jiangnan building candidates; geometry only."""
from pathlib import Path
import hashlib
import json
import math
from datetime import datetime
from PIL import Image
import yaml

ROOT = Path(__file__).resolve().parent
PREFIX = 'bld_kit_ming_south_'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def dump(path, value, append=False):
    text = yaml.safe_dump(value, allow_unicode=True, sort_keys=False, width=100000)
    assert len(text.splitlines()) <= 150, (path, len(text.splitlines()))
    with path.open('a' if append else 'w', encoding='utf-8') as stream:
        stream.write(text)

def run():
    catalog = json.loads((ROOT / 'major-selected.json').read_text())
    out = ROOT / 'manifest-major.yaml'
    results = []
    for i, row in enumerate(catalog):
        key, w, h = row['type'], *row['footprint']
        asset = PREFIX + key
        source = ROOT / 'sources' / (PREFIX + row['source_key'] + '.png')
        rec = json.loads(source.with_suffix('.json').read_text())
        im = Image.open(source)
        assert im.mode == 'RGBA'
        alpha = im.getchannel('A')
        tight = alpha.point(lambda n: 255 if n >= 3 else 0).getbbox()
        box = (max(0,tight[0]-4), max(0,tight[1]-4), min(im.width,tight[2]+4), min(im.height,tight[3]+4))
        discarded = alpha.copy()
        discarded.paste(0, box)
        assert discarded.getextrema()[1] <= 2
        left, front, right = row['ground_lfr']
        ground_center = [(left[0]+right[0])/2, (left[1]+right[1])/2]
        span = right[0]-left[0]
        q = 32*(w+h)/span
        crop = im.crop(box)
        resized = (round(crop.width*q), round(crop.height*q))
        sx, sy = resized[0]/crop.width, resized[1]/crop.height
        canvas_size = (max(256,resized[0]+32), max(256,resized[1]+32))
        offset = [(canvas_size[0]-resized[0])//2, (canvas_size[1]-resized[1])//2]
        normalized = Image.new('RGBA', canvas_size, (0,0,0,0))
        normalized.paste(crop.resize(resized, Image.Resampling.LANCZOS), tuple(offset))
        file = ROOT / (asset+'.png')
        normalized.save(file)
        transform = lambda p: [round((p[0]-box[0])*sx+offset[0],3), round((p[1]-box[1])*sy+offset[1],3)]
        anchor = transform(ground_center)
        slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
        errors = [abs(slopes[0]-0.5),abs(slopes[1]+0.5)]
        source_ratio = (front[0]-left[0])/(right[0]-front[0])
        fa = normalized.getchannel('A')
        hist = fa.histogram()
        bounds = fa.getbbox()
        margins = [bounds[0],bounds[1],canvas_size[0]-bounds[2],canvas_size[1]-bounds[3]]
        assert min(margins) >= 12 and hist[0] > 0 and sum(hist[240:]) > 0
        original_type = 'bld_kit_ming_'+key if key in ['yamen','biaoju','wangfu','temple_hall'] else None
        origin = 'design/22 §3.4 冻结占地的江南同构变体' if original_type else '【建议值】本任务功能补齐；沿用近类宋套件比例，待design/22登记'
        projection = {'target': 'orthographic yaw45 pitch30; 64x32 px/m', 'provided_views': ['southwest_single_view'], 'allowRotation': False, 'geometry_release_ready': False}
        meta = {'id':asset,'footprint_m':[w,h],'footprint_origin':origin,'skeleton_type':original_type,'anchor_px':anchor,'entrance':{'side':'S','offset_m':w/2,'status':'【建议值】门位由图像识别；待拼接实测'},'projection_contract':projection,'measurement':{'method':'人工读取地面左/前/右角；后角被遮挡时由平行四边形推定，不使用alpha bbox猜锚点','uncertainty_source_px':4,'ground_lfr_source_px':row['ground_lfr'],'ground_lfr_final_px':[transform(p) for p in row['ground_lfr']],'ground_center_source_px':ground_center,'source_slopes':slopes,'slope_abs_errors':errors,'slope_tolerance_suggestion':0.03,'slope_check':max(errors)<=0.03,'observed_w_h_ratio':source_ratio,'target_w_h_ratio':w/h,'width_scale_target_px':32*(w+h),'width_scale_actual_px':span*sx,'depth_scale_target_px':16*(w+h),'depth_observed_px':(2*front[1]-left[1]-right[1])*sy},'processing':{'source_file':str(source.relative_to(ROOT)),'source_path':rec['source'],'source_sha256':sha(source),'source_size_px':list(im.size),'crop_box':list(box),'crop_rule':'alpha>=3 bbox expanded4 source px; retained pixels alpha unmodified','discarded_alpha_max':discarded.getextrema()[1],'requested_uniform_scale':q,'rounded_effective_scale_xy':[sx,sy],'resized_px':list(resized),'canvas_px':list(canvas_size),'paste_offset_px':offset,'final_sha256':sha(file)},'verification':{'mode':normalized.mode,'alpha_extrema':list(fa.getextrema()),'zero_alpha_pixels':hist[0],'partial_alpha_pixels':sum(hist[1:255]),'opaque_pixels':hist[255],'nonzero_alpha_bbox':list(bounds),'margins_px':margins,'source_viewed':True,'final_viewed':False,'runtime_assembly_tested':False},'limitations':['单视图candidate，不提供GLB、四向模型或经实测的碰撞/遮挡多边形','底面宽度已标定；残余斜率、宽深比例和深度误差保留，不能声称严格2:1拼接已验收','建筑为原创扩展；年代细部待考；门位/高度及遮挡待实测'],'candidate_count':row['candidate_count'],'selected_candidate':row['selected_candidate'],'selection_note':row['selection_note']}
        dump(ROOT/'meta'/(asset+'.yaml'),meta)
        item={'id':asset,'file':asset+'.png','category':'building-map','style':'default','subject':row['subject']+'（明代江南；原创扩展，细部待考）','prompt':rec['prompt'],'negative':'伪透明、文字、人物、现代物、天空、厚地台、广域烘焙影、清式艳丽彩画','references':[rec['ref']] if rec.get('ref') else [],'tool':'image_gen built-in','model':'未披露：工具返回未提供图像模型标识','effort':'未披露：工具未提供图像生成推理强度','created':datetime.now().astimezone().isoformat(timespec='seconds'),'source_path':rec['source'],'size':f'{canvas_size[0]}x{canvas_size[1]}','sha256':sha(file),'status':'candidate','notes':origin+'；'+row['selection_note']+'；真实RGBA，几何只裁切/等比重采样/透明pad。精确投影与拼接待实测。','building':{'type':asset,'footprint':[w,h],'anchor':anchor,'era':'ming_south'},'footprint_m':[w,h],'entrance':meta['entrance'],'projection_contract':projection,'metadata':'meta/'+asset+'.yaml','candidate_count':row['candidate_count'],'source_sha256':sha(source),'style_reference_chain':row['style_reference_chain'],'historical_research':'major-research.json'}
        dump(out,[item],append=i>0)
        results.append({'id':asset,'size':list(canvas_size),'footprint':[w,h],'anchor':anchor,'slopes':slopes,'slope_check':max(errors)<=0.03,'depth_scale_residual_px':meta['measurement']['depth_observed_px']-16*(w+h)})
    (ROOT/'major-summary.json').write_text(json.dumps(results,ensure_ascii=False,separators=(',',':'))+'\n')
    print(json.dumps(results,ensure_ascii=False,indent=2))

if __name__ == '__main__':
    run()
