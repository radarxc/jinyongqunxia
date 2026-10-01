"""Only crop transparent margins, uniformly resize and pad; no painted content."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, math
import yaml
from PIL import Image
BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[3]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def normalize(suffix, version, points, note):
    aid = 'bld_kit_yuan_north_' + suffix
    stem = aid + ('.v02' if version == 2 else '')
    d = json.loads((BASE / 'sources' / (stem + '.json')).read_text())
    src = BASE / 'sources' / (stem + '.png')
    im = Image.open(src)
    assert im.mode == 'RGBA'
    a = im.getchannel('A')
    assert a.getextrema()[0] == 0 and a.getextrema()[1] >= 250
    L,F,R = points
    w,h = d['footprint']
    target = 32 * (w+h)
    scale = target / (R[0]-L[0])
    box = a.getbbox()
    cropped = im.crop(box)
    resized_size = [round(cropped.width*scale),round(cropped.height*scale)]
    sprite = cropped.resize(resized_size, Image.Resampling.LANCZOS)
    canvas = [max(512,math.ceil((n+96)/32)*32) for n in resized_size]
    offset = [(canvas[i]-resized_size[i])//2 for i in range(2)]
    out = Image.new('RGBA',canvas,(0,0,0,0))
    out.paste(sprite,offset)
    dst = BASE / (aid+'.png')
    out.save(dst)
    eff = [resized_size[0]/cropped.width,resized_size[1]/cropped.height]
    center = [(L[i]+R[i])/2 for i in range(2)]
    anchor = [round((center[i]-box[i])*eff[i]+offset[i],4) for i in range(2)]
    slopes = [(F[1]-L[1])/(F[0]-L[0]),(R[1]-F[1])/(R[0]-F[0])]
    ratio = (F[0]-L[0])/(R[0]-F[0])
    geo = {'source_corners_px':{'left':L,'front':F,'right':R},
           'anchor_source_px':center,'source_axis_slopes':slopes,
           'axis_tolerance':0.03,'axis_pass':abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
           'source_width_depth_ratio':ratio,'expected_width_depth_ratio':w/h,
           'ratio_relative_error':abs(ratio/(w/h)-1),'ratio_tolerance_suggestion':.1,
           'ratio_pass':abs(ratio/(w/h)-1)<=.1,'measurement_uncertainty_source_px':4,
           'measurement_note':'人工读取薄底面三角点，±4源px；后角按平行四边形推定，非历史实测。'}
    pa = out.getchannel('A');hist=pa.histogram();bbox=pa.getbbox()
    pixel = {'mode':out.mode,'size':canvas,'alpha_extrema':list(pa.getextrema()),
             'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),
             'alpha_opaque_pixels':hist[255],'alpha_near_opaque_pixels':sum(hist[250:]),
             'nonzero_bbox':list(bbox),'transparent_margins_px':[bbox[0],bbox[1],canvas[0]-bbox[2],canvas[1]-bbox[3]],
             'border_alpha_max':max(pa.crop(r).getextrema()[1] for r in [(0,0,canvas[0],1),(0,canvas[1]-1,canvas[0],canvas[1]),(0,0,1,canvas[1]),(canvas[0]-1,0,canvas[0],canvas[1])])}
    ref = ROOT / d['reference']
    original = ROOT / 'assets/default/baseline/building-map/bld_kit_song_southern_house.png'
    refs=[{'file':d['reference'],'sha256':sha(ref),'role':'已view_image；第二候选为相机纠正目标，首候选为宋材质参考'}]
    if ref != original:
        refs.append({'file':str(original.relative_to(ROOT)),'sha256':sha(original),'role':'首候选输入的宋套件材质和细节基线；间接参考'})
    frozen = d['type'] in ['bld_kit_yuan_house','bld_kit_yuan_market']
    entry={'id':aid,'file':aid+'.png','category':'building-map','style':'default',
           'subject':'元代北方·'+d['title']+'；匿名建筑组合（原创扩展），具体细部（待考）。',
           'prompt':d['prompt'],'negative':'现代元素、人物、文字、景观背景、厚底座、塑料质感、明清官式彩画、裁边、假透明、透视汇聚',
           'references':refs,'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)',
           'effort':'not exposed by image tool','created':datetime.fromtimestamp(src.stat().st_mtime,timezone.utc).isoformat(),
           'created_time_basis':'源PNG文件mtime；非服务端回执时间','source_path':d['source_path'],
           'size':f'{canvas[0]}x{canvas[1]}','sha256':sha(dst),'status':'candidate',
           'building':{'type':d['type'],'footprint':[w,h],'anchor':anchor,'era':'yuan_north'},
           'anchor_px':anchor,'footprint_m':[w,h],
           'footprint_basis':'design/22 §3.4 冻结骨架' if frozen else '【建议值】同构借用 design/22 §3.2–3.3 对应宋建筑占地，不是历史尺寸',
           'entrance':{'edge':'S','offset_cells':max(0,w//2-1)},'png_rotations_available':[0],
           'allowRotation':False,'projection_contract':{'tile_px':[64,32],'ground_bbox_px':[target,16*(w+h)],'light':'screen_upper_left','shadow':'screen_lower_right_contact_only'},
           'source_archive':'sources/'+stem+'.png','source_sha256':sha(src),'source_record':'sources/'+stem+'.json',
           'processing':{'source_size':list(im.size),'crop_box':list(box),'uniform_scale_requested':scale,
                         'resized_size':resized_size,'rounded_effective_scale':eff,'paste_offset':offset,
                         'steps':['crop alpha>0 bounding box','one uniform LANCZOS resize with integer rounding','paste without alpha mask into transparent RGBA canvas']},
           'geometry_qa':geo,'pixel_qa':pixel,'candidate_count':2,'selected_candidate':version,
           'notes':note+'；源图已逐张view_image。几何超差如实登记，底面中心为三点平行四边形代理；仅固定镜头候选，未做整城接缝/碰撞/真机验收。',
           'historical_basis':[{'url':'https://www.sxrcylg.cn/index.php?a=index&aid=1035&c=View&m=home','accessed':'2026-09-30','used':'仅元代殿堂木构/土坯墙砖裙/筒板瓦与木门母题；不能证明匿名民居原貌。'}]}
    entry_path=BASE/'meta'/(aid+'.entry.yaml')
    text=yaml.safe_dump(entry,allow_unicode=True,sort_keys=False,width=100000,default_flow_style=None)
    assert len(text.splitlines())<=150
    entry_path.write_text(text)
    d['source_corners_px']=geo['source_corners_px'];d['selection_note']=note;d['candidate_count']=2;d['selected_candidate']=version
    (BASE/'sources'/(stem+'.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
    print(aid,entry['size'],[round(s,4) for s in slopes],round(geo['ratio_relative_error'],4))

if __name__=='__main__':
    selections=json.loads((BASE/'root-selections.json').read_text())
    for suffix,selection in selections.items():
        normalize(suffix,selection['version'],selection['points'],selection['note'])
