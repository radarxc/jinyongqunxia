"""Reproduce the five architectural tile candidates using geometry only."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]
RAW = Path('/Users/bytedance/.codex/generated_images/01a0f426-f9e3-79d3-9163-e8824f174953')
PROMPTS = json.loads((ROOT/'sources/generation-prompts.json').read_text())
PROMPTS['bridge_retry'] = json.loads((ROOT/'sources/bridge-retry-prompt.json').read_text())['prompt']
BASE = 'assets/default/baseline/'
SPECS = [
    dict(key='gate4', suffix='city_gate__k4_r000_v01', kind='city_gate', fp=[8,4], variant='k4_r000_v01', raw='exec-f8d21cd0-e149-46ec-ad52-350241b92bd3.png', ref=BASE+'tile/tex_town_song_southern_city_gate__k8_r000_v01.png', points=[[172,710],[1165,995],[1370,904]], count=2, clear=4, opening=[[415,785],[879,898]], note='首候选完整；第二候选足部触边且未改善斜率，淘汰。门洞实际比例与标称净宽有偏差，不满足精确GateSpec对格。'),
    dict(key='gate6_retry', suffix='city_gate__k6_r000_v01', kind='city_gate', fp=[10,4], variant='k6_r000_v01', raw='exec-a3e183df-f1aa-492a-af7b-6ca71d5e4746.png', ref=str(RAW/'exec-40676d05-d500-40ac-948b-24af82c5818b.png'), points=[[142,725],[1168,964],[1397,834]], count=2, clear=6, opening=[[387,785],[930,909]], note='选第二候选，孔较首版增宽；正面归一化孔宽仍不足标称6格，正面轴线偏平、进深偏浅，不满足精确GateSpec对格。'),
    dict(key='wall', suffix='wall__earth_r000_v01', kind='wall', fp=[1,1], variant='earth_r000_v01', raw='exec-afdaac90-cf87-4a13-875c-9c243fa935e1.png', ref=BASE+'tile/tex_town_song_dali_wall__earth_r000_v01.png', points=[[159,1365],[460,1561],[766,1377]], count=1, note='夯土墙身与局部压顶砖；地面轴线偏陡，重复接缝待总装。'),
    dict(key='corner', suffix='wall_corner__outer_ne_v01', kind='wall_corner', fp=[2,2], variant='outer_ne_v01', raw='exec-064911ac-1ebc-4481-9a8d-b136fbf07245.png', ref=BASE+'tile/tex_town_song_dali_wall_corner__outer_ne_v01.png', points=[[84,1068],[665,1438],[1226,1099]], count=1, note='L形墙角；底面L/R可见，缺失前角按墙顶平移的后角[645,729]推算，非实体；包络中心落在L形内空处。墙厚与直段未精确匹配。'),
    dict(key='bridge_retry', suffix='bridge_deck__w3_l6_r000_v01', kind='bridge_deck', fp=[3,6], variant='w3_l6_r000_v01', raw='exec-98bedd6c-77f1-43c8-be16-a765cec3d6a5.png', ref=str(RAW/'exec-b7992d10-6830-4f49-954f-0bc56ea58761.png'), points=[[149,701],[537,933],[1494,480]], count=2, note='选第二候选，较首版短阔；整桥含栏杆，只供静态合成，未拆近侧遮挡层。借贯木拱母题，不是虹桥工程复原，桥头接路仍有残差。'),
]

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def run():
    for s in SPECS:
        ident = 'tex_town_song_north_' + s['suffix']
        source = RAW/s['raw']
        archived = ROOT/'sources'/f'{ident}__source.png'
        shutil.copy2(source, archived)
        im = Image.open(source)
        assert im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 0
        crop = im.getchannel('A').getbbox()
        left, front, right = s['points']
        target_w = 32*sum(s['fp'])
        scale = target_w/(right[0]-left[0])
        cropped = im.crop(crop)
        scaled = tuple(max(1,round(v*scale)) for v in cropped.size)
        small = cropped.resize(scaled, Image.Resampling.LANCZOS)
        out = Image.new('RGBA', (scaled[0]+32, scaled[1]+32))
        out.paste(small, (16,16))
        dest = ROOT/f'{ident}.png'
        out.save(dest)
        sx, sy = scaled[0]/cropped.width, scaled[1]/cropped.height
        anchor_src = [(left[i]+right[i])/2 for i in (0,1)]
        anchor = [round((anchor_src[0]-crop[0])*sx+16,4),round((anchor_src[1]-crop[1])*sy+16,4)]
        slopes = [(front[1]-left[1])/(front[0]-left[0]),(right[1]-front[1])/(right[0]-front[0])]
        ratio = (front[0]-left[0])/(right[0]-front[0])
        ref = Path(s['ref']) if Path(s['ref']).is_absolute() else REPO/s['ref']
        actual_ref = str(ref)
        if ref.is_relative_to(RAW):
            ref_copy = ROOT/'sources'/f'{ident}__candidate1.png'
            shutil.copy2(ref, ref_copy)
            actual_ref = str(ref_copy.relative_to(REPO))
        alpha = out.getchannel('A')
        entry = dict(id=ident,file=dest.name,category='tile',style='default',subject='北宋中原·'+s['kind']+'（原创扩展）；建筑细部待考',prompt=PROMPTS[s['key']],negative='无人物、文字、背景、厚底台、假棋盘；不改alpha伪造透明',references=[dict(file=actual_ref,sha256=sha(ref),role='实际输入：宋基线风格参考或本件首候选编辑目标')],tool='built-in image_gen',model='image_gen (underlying model undisclosed)',effort='not exposed by image tool',created=datetime.fromtimestamp(source.stat().st_mtime,timezone.utc).isoformat(),created_time_basis='源PNG文件mtime',source_path=str(source),source_copy=str(archived.relative_to(ROOT)),source_sha256=sha(archived),size=f'{out.width}x{out.height}',sha256=sha(dest),status='candidate')
        entry['tile'] = dict(kind=s['kind'],footprint=s['fp'],variant=s['variant'],autotile_mask=None)
        entry['anchor_px'] = anchor
        entry['era'] = 'song_north'
        entry['allowRotation'] = False
        entry['candidate_count'] = s['count']
        entry['processing'] = dict(crop_box=list(crop),uniform_scale=scale,resized_size=list(scaled),paste_offset=[16,16],source_anchor_px=anchor_src,steps=['crop alpha>0 bbox','uniform LANCZOS resize with integer rounding','transparent padding; preserve RGBA; no warp, alpha cleanup or repaint'])
        entry['geometry_qa'] = dict(source_points_lfr=s['points'],source_axis_slopes=[round(x,6) for x in slopes],target_axis_slopes=[0.5,-0.5],axis_tolerance=0.03,axis_pass=all(abs(abs(x)-0.5)<=0.03 for x in slopes),source_axis_ratio=round(ratio,6),target_axis_ratio=s['fp'][0]/s['fp'][1],uncertainty_source_px=5,ground_width_target_px=target_w,measurement='人工量取可见底面；墙角按缺角包络推算；不代表3D测绘或精确拼接通过')
        entry['pixel_qa'] = dict(mode=out.mode,alpha_extrema=list(alpha.getextrema()),alpha_nonzero_bbox=list(alpha.getbbox()),alpha_zero_pixels=alpha.histogram()[0],transparent_padding_px=16)
        if 'clear' in s:
            entry['gate'] = dict(width_cells=s['clear'],footprint_cells=dict(w=s['fp'][0],h=4),passage_cells=dict(w=s['clear'],h=4),rotation_deg=0,facade_normalized_clear_width_cells=round(s['fp'][0]*(s['opening'][1][0]-s['opening'][0][0])/(front[0]-left[0]),3),opening_source_front_endpoints=s['opening'],precise_mask_verified=False,other_directions_available=False)
            dx = (s['opening'][1][0]-s['opening'][0][0])*sx
            dy = (s['opening'][1][1]-s['opening'][0][1])*sy
            entry['gate'].update(normalization_note='以整个正面宽归一为8或10格的比例估值，不是64×32成品格实测', opening_vector_final_px=[round(dx,3),round(dy,3)], opening_vector_target_px=[32*s['clear'],16*s['clear']])
        entry['notes'] = s['note']+' 源图及成品逐张view_image；源alpha原样保留，缩放可产生255，隐藏RGB不当作可见背景。'
        text = yaml.safe_dump(entry,allow_unicode=True,sort_keys=False,width=140,default_flow_style=None)
        assert len(text.splitlines()) <= 150
        (ROOT/'entries'/f'{ident}.yaml').write_text(text)
        print(ident,entry['size'],anchor,entry['geometry_qa']['source_axis_slopes'])

if __name__ == '__main__':
    run()
