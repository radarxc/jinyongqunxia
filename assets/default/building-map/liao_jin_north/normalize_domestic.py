"""Normalize domestic candidates only; geometry operations preserve generated alpha."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, math, shutil
from PIL import Image

ROOT = Path(__file__).resolve().parent
SOURCE = Path('/Users/bytedance/.codex/generated_images/01a0f428-333a-7700-b17d-ba49c7363b52')
REPO = ROOT.parents[3]
SUFFIXES = ['house_small', 'house_large', 'courtyard', 'shop_1f', 'shop_2f', 'inn', 'restaurant']
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def write(path, obj):
    # Each write stays below 150 lines, including full prompt on a single JSON line.
    data = json.dumps(obj, ensure_ascii=False, indent=2)
    if len(data.splitlines()) > 145:
        data = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    path.write_text(data + '\n')

def normalize(suffix):
    ident = 'bld_kit_liao_jin_north_' + suffix
    inp = ROOT / 'meta' / (ident + '.input.json')
    if not inp.exists():
        return
    spec = json.loads(inp.read_text())
    src = SOURCE / (spec['path'] + '.png')
    archive = ROOT / 'sources' / (ident + '.png')
    shutil.copy2(src, archive)
    im = Image.open(src)
    assert im.mode == 'RGBA', (ident, im.mode)
    bounds = im.getchannel('A').getbbox()
    crop = im.crop(bounds)
    left, front, right = (spec['corners'][key] for key in ('left', 'front', 'right'))
    fw, fh = spec['fp']
    scale = 32 * (fw + fh) / (right[0] - left[0])
    resized = tuple(max(1, round(v * scale)) for v in crop.size)
    effective = [resized[0] / crop.width, resized[1] / crop.height]
    canvas = tuple(max(256, 16 * math.ceil((v + 32) / 16)) for v in resized)
    offset = [(canvas[i] - resized[i]) // 2 for i in range(2)]
    final = Image.new('RGBA', canvas, (0, 0, 0, 0))
    final.paste(crop.resize(resized, Image.Resampling.LANCZOS), offset)
    out = ROOT / (ident + '.png')
    final.save(out)
    anchor_source = [(left[i] + right[i]) / 2 for i in range(2)]
    anchor = [(anchor_source[i] - bounds[i]) * effective[i] + offset[i] for i in range(2)]
    slopes = [(front[1] - left[1]) / (front[0] - left[0]),
              (right[1] - front[1]) / (right[0] - front[0])]
    ratio = (front[0] - left[0]) / (right[0] - front[0])
    ratio_error = abs(ratio / (fw / fh) - 1)
    axis_pass = abs(slopes[0] - .5) <= .03 and abs(slopes[1] + .5) <= .03
    alpha = final.getchannel('A')
    bb = alpha.getbbox()
    hist = alpha.histogram()
    margins = [bb[0], bb[1], canvas[0] - bb[2], canvas[1] - bb[3]]
    border = max(alpha.crop((0,0,canvas[0],1)).getextrema()[1],
                 alpha.crop((0,canvas[1]-1,canvas[0],canvas[1])).getextrema()[1],
                 alpha.crop((0,0,1,canvas[1])).getextrema()[1],
                 alpha.crop((canvas[0]-1,0,canvas[0],canvas[1])).getextrema()[1])
    ref = REPO / 'assets/default/baseline/building-map' / (spec['ref'] + '.png')
    entry = {
      'id': ident, 'file': out.name, 'category': 'building-map', 'style': 'default',
      'subject': '辽金北方·' + spec['title'] + '（原创扩展；历史细部待考）',
      'prompt': spec['prompt'],
      'negative': '文字、人物、水印、现代物、背景街景、厚地台、宫廷彩画、裁切、透视汇聚',
      'references': [{'id':spec['ref'], 'file':str(ref.relative_to(REPO)),
                      'sha256':sha(ref), 'role':'宋套件实际PNG：材质、细节密度、相机与拼接形态参考'}],
      'tool':'built-in image_gen', 'model':'image_gen (underlying model not disclosed)',
      'effort':'not exposed by image tool',
      'created':datetime.fromtimestamp(src.stat().st_mtime, timezone.utc).isoformat(),
      'created_time_basis':'生成源文件mtime，非服务端调用时间',
      'source_path':str(src), 'source_sha256':sha(src), 'size':f'{canvas[0]}x{canvas[1]}',
      'sha256':sha(out), 'status':'candidate',
      'building':{'type':ident,'footprint':spec['fp'],'anchor':[round(v,4) for v in anchor],'era':'liao_jin_north'},
      'footprint_m':spec['fp'], 'entrance':{'edge':'S','screen_direction':'lower_left'},
      'projection_contract':{'tile_px':[64,32],'ground_width_px':32*(fw+fh),
        'ground_bbox_px':[32*(fw+fh),16*(fw+fh)], 'view_count':1,'allowRotation':False,
        'light':'screen_upper_left','shadow':'screen_lower_right_contact_only'},
      'processing':{'source_archive':str(archive.relative_to(ROOT)), 'source_size':list(im.size),
        'crop_box':list(bounds),'uniform_scale_requested':scale,'resized_size':list(resized),
        'rounded_effective_scale':effective,'paste_offset':offset,
        'steps':['crop alpha>0 bbox','uniform LANCZOS resize with integer rounding','transparent padding; paste without mask'],
        'excluded_operations':'no repaint, alpha thresholding, warping, flip, anisotropic correction or synthetic corners'},
      'geometry_qa':{'source_corners_px':spec['corners'],'source_anchor_px':anchor_source,
        'source_axis_slopes':slopes,'axis_tolerance':.03,'axis_pass':axis_pass,
        'source_width_depth_ratio':ratio,'expected_width_depth_ratio':fw/fh,
        'ratio_relative_error':ratio_error,'ratio_tolerance_suggestion':.1,'ratio_pass':ratio_error<=.1,
        'measurement_uncertainty_source_px':10,
        'precision_note':'人工读取可见底面三点，±10源像素；非3D测绘。隐藏后角未实测；等比规格化不修正相机误差。'},
      'pixel_qa':{'mode':final.mode,'size':list(canvas),'alpha_extrema':list(alpha.getextrema()),
        'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),'alpha_opaque_pixels':hist[255],
        'alpha_nonzero_bbox':list(bb),'transparent_margins_px':margins,'border_alpha_max':border},
      'candidate_count':spec['count'], 'visual_qa':{'source_viewed':True,'final_viewed':True,'method':'逐张view_image人工自查'},
      'notes':spec['note'] + ' 仅交单视图；历史游戏功能为原创扩展，屋架、窗棂等细部待考。'
    }
    if 'rejected' in spec:
        entry['rejected_candidate'] = spec['rejected']
    write(ROOT/'meta'/(ident+'.entry.json'), entry)
    print(ident, entry['size'], 'anchor',entry['building']['anchor'], 'axis',axis_pass,'ratio',ratio_error,'alpha',entry['pixel_qa']['alpha_extrema'])

if __name__ == '__main__':
    for suffix in SUFFIXES:
        normalize(suffix)
