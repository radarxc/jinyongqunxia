#!/usr/bin/env python3
"""Native-size plant sprites: crop, uniform fit, transparent pad; never repaint."""
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


def write_yaml(path, value):
    lines = yaml.safe_dump(value, allow_unicode=True, sort_keys=False, width=140,
                           default_flow_style=None).splitlines(True)
    with path.open('w') as stream:
        for start in range(0, len(lines), 120):
            stream.writelines(lines[start:start+120])


def normalize(c, index):
    key = f'v{index+1:02d}'
    ident = c['asset_id']+'__'+key
    record = ROOT/'sources'/f'{ident}.json'
    d = json.loads(record.read_text())
    source = record.with_suffix('.png')
    im = Image.open(source)
    assert im.mode == 'RGBA'
    a = im.getchannel('A'); raw_bbox = a.getbbox()
    assert a.getextrema()[0] == 0 and a.getextrema()[1] >= 128
    assert sha(source) == d['source_sha256']
    visible = a.point(lambda value: 255 if value>=3 else 0).getbbox()
    crop = (max(0,visible[0]-4),max(0,visible[1]-4),
            min(im.width,visible[2]+4),min(im.height,visible[3]+4))
    # Measurement mask only: the saved image keeps original RGBA inside a rectangle.
    regions=[(0,0,im.width,crop[1]),(0,crop[3],im.width,im.height),
             (0,crop[1],crop[0],crop[3]),(crop[2],crop[1],im.width,crop[3])]
    removed_count=0; removed_max=0
    for box in regions:
        if box[0]<box[2] and box[1]<box[3]:
            hist=a.crop(box).histogram()
            removed_count+=sum(hist[1:])
            removed_max=max(removed_max,max(i for i,n in enumerate(hist) if n))
    assert removed_max<=2
    measured = d['root_source_px']
    rx, ry = measured
    ground_y = max(ry, crop[3])
    w, h = c['size_px']; ax, ay = c['anchor_px']
    assert crop[0] < rx < crop[2]
    scale = min((ax-4)/(rx-crop[0]), (w-4-ax)/(crop[2]-rx),
                (ay-4)/(ground_y-crop[1]))
    # Compute rounded placement before the single resampling operation.
    for _ in range(100):
        nw, nh = [max(1, math.floor(v*scale)) for v in (crop[2]-crop[0],crop[3]-crop[1])]
        sx, sy = nw/(crop[2]-crop[0]), nh/(crop[3]-crop[1])
        ox, oy = round(ax-(rx-crop[0])*sx), round(ay-(ground_y-crop[1])*sy)
        if ox>=4 and oy>=4 and ox+nw<=w-4 and oy+nh<=ay:
            break
        scale *= .995
    else:
        raise ValueError(f'cannot fit root / transparent margins: {ident}')
    cut = im.crop(crop).resize((nw,nh),Image.Resampling.LANCZOS)
    out = Image.new('RGBA',(w,h),(0,0,0,0)); out.paste(cut,(ox,oy))
    target = ROOT/f'{ident}.png'; out.save(target)
    alpha = out.getchannel('A'); bbox = alpha.getbbox(); hist = alpha.histogram()
    actual_root = [round((rx-crop[0])*sx+ox,4),round((ry-crop[1])*sy+oy,4)]
    root_error = [round(actual_root[0]-ax,4),round(actual_root[1]-ay,4)]
    stats = {'mode':'RGBA','size_px':[w,h],'alpha_extrema':list(alpha.getextrema()),
             'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),
             'alpha_opaque_pixels':hist[255],'alpha_near_opaque_pixels':sum(hist[192:]),
             'alpha_bbox':list(bbox),'transparent_margins_px':[bbox[0],bbox[1],w-bbox[2],h-bbox[3]],
             'alpha_below_anchor_max':alpha.crop((0,ay+1,w,h)).getextrema()[1]}
    assert min(stats['transparent_margins_px'])>=4 and stats['alpha_below_anchor_max']==0
    processing = {'source_archive':str(source.relative_to(ROOT)),'source_path':d['source_path'],
                  'source_sha256':sha(source),'source_size':list(im.size),'crop_box':list(crop),
                  'source_alpha_bbox':list(raw_bbox),'crop_basis':'alpha>=3 bbox +4 source px; rectangle only',
                  'cropped_nonzero_pixels':removed_count,'cropped_alpha_max':removed_max,
                  'uniform_scale_requested':scale,'rounded_effective_scale':[sx,sy],
                  'resized_size':[nw,nh],'paste_offset':[ox,oy],'source_measured_root_px':measured,
                  'source_conservative_ground_y':ground_y,'transformed_measured_root_px':actual_root,
                  'coordinate_convention':'图像左上外缘为(0,0)的连续边界坐标；crop_box半开，末个非零像素可位于根锚上一行',
                  'root_offset_px':root_error,'steps':['rectangular transparent-edge trim; removed alpha<=2 only',
                  'uniform fit; floor integer extents','one LANCZOS resize',
                  'paste without mask; transparent native canvas; no repaint/warp/per-pixel alpha edits']}
    notes = d.get('visual_review','')
    notes += ' 只在矩形裁边中去除远端alpha<=2杂点，未逐像素修改透明度；原图保全。根锚偏差另列，不将视觉拟合宣称为物种实测尺寸。'
    created=d.get('created','')
    if 'T' not in str(created):
        created=datetime.datetime.fromtimestamp(source.stat().st_mtime,datetime.timezone.utc).isoformat()
    entry = {'id':ident,'asset_id':c['asset_id'],'variant_key':key,'file':target.name,'category':'prop',
             'style':'default','subject':c['name']+' · '+c['variants'][index]+'（原创植物意象，历史栽植待考）',
             'prompt':d['prompt'],'negative':d.get('negative',''),'references':d.get('references',[]),
             'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)',
             'effort':'not exposed by image tool','created':created,
             'created_time_basis':'生成后接收/归档记录或源文件mtime；非服务端调用时间',
             'source_path':d['source_path'],'source_sha256':sha(source),'source_record':str(record.relative_to(ROOT)),
             'size':f'{w}x{h}','sha256':sha(target),'status':'candidate','anchor_px':[ax,ay],
             'metadata':f'meta/{c["asset_id"]}.yaml','pixel_qa':stats,'processing':processing,
             'candidate_count':d.get('candidate_count',1),'notes':notes}
    variant = {'key':key,'file':target.name,'size_px':[w,h],'anchor_px':[ax,ay],
               'status':'candidate','pixel_qa':stats,'processing':processing,
               'root_within_one_px':max(abs(v) for v in root_error)<=1}
    return entry, variant


def main():
    catalog = json.loads((ROOT/'catalog.json').read_text())
    (ROOT/'meta').mkdir(exist_ok=True)
    entries=[]
    for c in catalog:
        variants=[]
        for index in range(2):
            entry, variant = normalize(c,index)
            entries.append(entry); variants.append(variant)
        meta={'asset_id':c['asset_id'],'era':c['era'],'placement_domain':'land',
              'footprint_cells':{'w':1,'h':1},'visual_bounds_m':{'w':c['s'],'d':c['s'],'h':c['Y']},
              'collision':'none','projection_contract':{'yaw_deg':45,'pitch_deg':30,'tile_px':[64,32],
              'light':'screen_upper_left','ground_shadow':'separate_runtime_layer'},
              'variants':variants,'status':'candidate','release_ready':False,
              'runtime_note':'PNG母版，prop/model公告板由TOWN-render构造；本轮未交GLB；植物Y与s为上游建议包络。'}
        write_yaml(ROOT/'meta'/f'{c["asset_id"]}.yaml',meta)
    write_yaml(ROOT/'manifest.yaml',entries)
    print('plant variants:',len(entries))


if __name__ == '__main__':
    main()
