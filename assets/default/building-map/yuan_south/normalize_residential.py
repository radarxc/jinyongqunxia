"""仅重放住宅/商业7项的裁边、等比缩放和透明留白；无绘制/warp/阈值改色。"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def save_text(path, text):
    lines = text.splitlines(keepends=True)
    for start in range(0, len(lines), 140):
        with path.open('w' if start == 0 else 'a', encoding='utf-8') as out:
            out.writelines(lines[start:start+140])

def normalize(item):
    key = item['key']
    asset_id = 'bld_kit_yuan_south_' + key
    calls = []
    for suffix in ['', '.v2']:
        call = json.loads((ROOT / 'sources' / (key+suffix+'.call.json')).read_text())
        src = Path(call['source_path'])
        archive = ROOT / 'sources' / (asset_id+suffix+'.png')
        shutil.copy2(src, archive)
        call.update(source_archive=str(archive.relative_to(ROOT)), source_sha256=sha(archive),
                    source_size=list(Image.open(archive).size),
                    created=datetime.fromtimestamp(src.stat().st_mtime, timezone.utc).isoformat(),
                    created_time_basis='source PNG mtime, not service-side call timestamp')
        ref = Path(call['reference'])
        if not ref.is_absolute():
            ref = REPO / ref
        call['reference_sha256'] = sha(ref)
        calls.append(call)
        save_text(ROOT / 'sources' / (key+suffix+'.call.json'), json.dumps(call, ensure_ascii=False, indent=2)+'\n')
    call = calls[item['selected']-1]
    src = ROOT / call['source_archive']
    im = Image.open(src)
    assert im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 0
    box = im.getchannel('A').getbbox()
    left, front, right = item['corners']
    w, h = item['footprint']
    scale = 32*(w+h)/(right[0]-left[0])
    cropped = im.crop(box)
    sz = [round(v*scale) for v in cropped.size]
    resized = cropped.resize(sz, Image.Resampling.LANCZOS)
    canvas = [max(256, math.ceil((v+48)/16)*16) for v in sz]
    offset = [(canvas[i]-sz[i])//2 for i in range(2)]
    out = Image.new('RGBA', canvas, (0,0,0,0))
    out.paste(resized, offset)
    dst = ROOT / (asset_id+'.png')
    out.save(dst)
    effective = [sz[i]/cropped.size[i] for i in range(2)]
    center = [(left[i]+right[i])/2 for i in range(2)]
    anchor = [round((center[i]-box[i])*effective[i]+offset[i], 4) for i in range(2)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    geometry = dict(source_corners_px=dict(left=left,front=front,right=right),
        source_axis_slopes=slopes,axis_pass=abs(slopes[0]-0.5)<=0.03 and abs(slopes[1]+0.5)<=0.03,
        axis_tolerance=0.03,source_width_depth_ratio=ratio,expected_width_depth_ratio=w/h,
        ratio_relative_error=abs(ratio/(w/h)-1),ratio_pass=abs(ratio/(w/h)-1)<=0.1,
        measurement_uncertainty_source_px=6,
        precision_note='人工读同一底面三角；隐藏后角L+R-F推定，中心(L+R)/2；非测绘，严格投影残差仍保留。')
    alpha = out.getchannel('A'); hist = alpha.histogram(); bbox = alpha.getbbox()
    pixel = dict(mode=out.mode,size=canvas,alpha_extrema=list(alpha.getextrema()),
        alpha_zero_pixels=hist[0],alpha_partial_pixels=sum(hist[1:255]),alpha_opaque_pixels=hist[255],
        alpha_near_opaque_pixels=sum(hist[240:]),alpha_nonzero_bbox=list(bbox),
        transparent_margins_px=[bbox[0],bbox[1],canvas[0]-bbox[2],canvas[1]-bbox[3]])
    process = dict(source_archive=call['source_archive'],source_sha256=call['source_sha256'],
        source_size=list(im.size),crop_box=list(box),uniform_scale_requested=scale,
        resized_size=sz,rounded_effective_scale=effective,paste_offset=offset,
        steps=['alpha>0矩形裁边，保留全部非零alpha','一次等比LANCZOS，尺寸取整','无mask粘贴到透明RGBA；无重绘、warp、旋转或alpha阈值'])
    notes = item['notes']+'；原图已view_image；候选形制（原创扩展），具体元末细部（待考）；仅原向单视图，严格拼接（待实测）。'
    entry = dict(id=asset_id,file=dst.name,category='building-map',style='default',
        subject='元末江南·'+item['name']+'（原创扩展）',prompt=call['prompt'],
        negative='文字、水印、现代物、人物、清式彩画、旅游马头墙、厚底座、景观背景',
        references=[dict(file=call['reference'],sha256=call['reference_sha256'],role='生成参考或第二候选编辑目标，详见调用记录')],
        tool='built-in image_gen',model='image_gen (underlying model not disclosed)',effort='not exposed',
        created=call['created'],created_time_basis=call['created_time_basis'],source_path=call['source_path'],
        size=f'{canvas[0]}x{canvas[1]}',sha256=sha(dst),status='candidate',
        building=dict(type=asset_id,footprint=[w,h],anchor=anchor,era='yuan'),footprint_m=[w,h],
        footprint_basis=item['basis'],entrance=dict(edge='S',offset_cells=w//2),
        projection_contract=dict(tile_px=[64,32],ground_bbox_px=[32*(w+h),16*(w+h)],light='screen_upper_left',shadow='screen_lower_right_contact_only'),
        metadata='meta/'+asset_id+'.yaml',source_record='sources/'+key+('.v2' if item['selected']==2 else '')+'.call.json',
        candidate_count=2,selected_candidate=item['selected'],selection_reason=item['notes'],
        source_sha256=call['source_sha256'],processing=process,geometry_qa=geometry,pixel_qa=pixel,
        png_rotations_available=[0],allowRotation=False,release_ready=False,notes=notes)
    meta = dict(asset_id=asset_id,anchor_px=anchor,footprint_cells=[w,h],entrance=entry['entrance'],
        actual_height_m=None,height_note='仅PNG，未实测高度',png_rotations_available=[0],allowRotation=False,
        collision_polygon_local_m=[[0,0],[w,0],[w,h],[0,h]],collision_note='矩形占地仅候选代理；院内/入口通行待布局联调',
        occlusion_polygon_px=[[bbox[0],bbox[1]],[bbox[2],bbox[1]],[bbox[2],bbox[3]],[bbox[0],bbox[3]]],
        occlusion_note='alpha包络代理，非运行时精细遮挡',processing=process,geometry_qa=geometry,pixel_qa=pixel)
    save_text(ROOT / entry['metadata'],yaml.safe_dump(meta,allow_unicode=True,sort_keys=False))
    save_text(ROOT / 'meta' / (asset_id+'.entry.json'),json.dumps(entry,ensure_ascii=False,indent=2)+'\n')
    return entry

if __name__ == '__main__':
    items = json.loads((ROOT/'residential_catalog.json').read_text())
    manifest = ROOT/'manifest_residential.yaml'
    for index, item in enumerate(items):
        entry = normalize(item)
        text = yaml.safe_dump([entry],allow_unicode=True,sort_keys=False,width=140)
        for start in range(0,len(text.splitlines(keepends=True)),140):
            with manifest.open('w' if index==0 and start==0 else 'a',encoding='utf-8') as out:
                out.writelines(text.splitlines(keepends=True)[start:start+140])
        print(entry['id'],entry['size'],entry['building']['anchor'],entry['geometry_qa']['source_axis_slopes'])
