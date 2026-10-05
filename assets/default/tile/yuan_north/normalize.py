"""Selected generated images: alpha-bounds crop, uniform scale, transparent padding only."""
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
SPECS = json.loads((ROOT / 'asset_specs.json').read_text())
def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write_small(path, text):
    assert len(text.splitlines()) <= 150, path
    path.write_text(text, encoding='utf-8')
manifest = ROOT / 'manifest.yaml'
write_small(manifest, '')
for e in SPECS:
    asset = e['id']
    raw = Path(e['source'])
    copy = ROOT / 'source' / (asset + '__source.png')
    shutil.copy2(raw, copy)
    im = Image.open(raw)
    assert im.mode == 'RGBA', (asset, im.mode)
    alpha = im.getchannel('A')
    bbox = alpha.getbbox()
    logical_width = 32 * sum(e['fp'])
    if 'corners' in e:
        corners = e['corners']
        source_width = max(p[0] for p in corners) - min(p[0] for p in corners)
        center = [(corners[0][i] + corners[2][i]) / 2 for i in (0, 1)]
        scale = logical_width / source_width
        edges = [(corners[0], corners[1]), (corners[1], corners[2])]
        slopes = [round((b[1]-a[1])/(b[0]-a[0]), 5) for a,b in edges]
    else:
        center = e['anchor']
        source_height = e['height_pair'][1][1] - e['height_pair'][0][1]
        scale = 16 * math.sqrt(6) * e['height_m'] / source_height
        source_width = logical_width / scale
        slopes = None
        corners = [[center[0]-source_width/2,center[1]], [center[0],center[1]+source_width/4],
                   [center[0]+source_width/2,center[1]], [center[0],center[1]-source_width/4]]
    cropped = im.crop(bbox)
    size = [round(cropped.width*scale), round(cropped.height*scale)]
    resized = cropped.resize(size, Image.Resampling.LANCZOS)
    pad = 8
    final = Image.new('RGBA', (size[0]+2*pad,size[1]+2*pad), (0,0,0,0))
    final.paste(resized, (pad,pad))
    out = ROOT / (asset + '.png')
    final.save(out)
    anchor = [round((center[i]-bbox[i])*scale+pad,3) for i in (0,1)]
    refs = []
    for idx, ref in enumerate(e['refs']):
        p = Path(ref)
        if 'firstPrompt' in e:
            dest = ROOT / 'source' / (asset + '__edit_input.png')
            shutil.copy2(p, dest)
            file = str(dest.relative_to(ROOT))
        else:
            file = str(p.relative_to(REPO))
        refs.append({'file':file,'sha256':sha(p),'note':'实际输入；编辑目标' if 'firstPrompt' in e else '实际输入；仅材质、细节密度风格参考'})
    record = dict(id=asset,file=out.name,category='tile',style='default',subject=e['subject'],prompt=e['prompt'],
      negative='无文字、水印、人物、现代物件、假透明、地台；不作历史实测复原。',references=refs,
      tool='codex exec · image_gen (built-in)',model='image_gen (backend undisclosed)',effort='inherited agent configuration',
      created=datetime.fromtimestamp(raw.stat().st_mtime,timezone.utc).isoformat(),source_path=str(raw),
      size=f'{final.width}x{final.height}',sha256=sha(out),status='candidate',
      tile=dict(kind=e['kind'],footprint=e['fp'],variant=e['variant'],autotile_mask=None),
      source_copy=str(copy.relative_to(ROOT)),source_sha256=sha(copy),anchor_px=anchor,
      notes='仅alpha包围盒裁切、等比LANCZOS缩小、8px透明边；'+e['note'])
    block = yaml.safe_dump([record],allow_unicode=True,sort_keys=False,width=100000)
    assert len(block.splitlines()) <= 150
    with manifest.open('a',encoding='utf-8') as f:
        f.write(block)
    qa = dict(id=asset,status='candidate',attempts=e['attempts'],selected=e.get('selected', 'second' if e['attempts']==2 else 'first'),
      source_size=list(im.size),source_alpha_extrema=list(alpha.getextrema()),source_bbox=list(bbox),
      source_footprint_corners_px=corners,corner_basis='人工观察底面；遮挡点按可见相邻边推导' if slopes else '未绘种植方格；由建议树高及逻辑占地推导，非视觉测量',
      source_anchor_px=center,logical_footprint=e['fp'],logical_projected_width_px=logical_width,
      measured_source_width_px=source_width,uniform_scale=scale,rounding_error_px_max=0.5,transparent_padding_px=pad,
      source_ground_slopes=slopes,target_slopes=[0.5,-0.5],strict_projection_pass=False,
      final_size=list(final.size),anchor_px=anchor,final_alpha_extrema=list(final.getchannel('A').getextrema()),
      source_opening_alpha_samples=[{'at':p,'alpha':im.getpixel(tuple(p))[3]} for p in e.get('opening_samples',[])],
      view_image_review='源图与成品逐张检查：完整轮廓、左上明暗、无文字；几何与年代限制见notes',notes=e['note'])
    write_small(ROOT / (asset + '__qa.yaml'), yaml.safe_dump(qa,allow_unicode=True,sort_keys=False,width=100000))
    if 'firstPrompt' in e:
        history = {'original_prompt':e['firstPrompt'],'original_references':[{'file':str(Path(p).relative_to(REPO)),'sha256':sha(p)} for p in e['firstRefs']], 'selected_edit_prompt':e['prompt'],'note':'原始生成与单次返修；未声明未知模型或seed'}
        write_small(ROOT / 'source' / (asset+'__generation.json'), json.dumps(history,ensure_ascii=False,indent=2)+'\n')
    print(asset,record['size'],anchor,slopes)
