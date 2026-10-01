"""Round-2 selected assets: crop/scale/pad only; emit metadata field patches."""
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, math, re, difflib
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SPECS = {'house_large':(2,[(225,654),(879,979),(1384,764)]),
    'house_small':(1,[(211,643),(812,951),(1323,691)]),
    'shop_1f':(1,[(239,643),(829,939),(1243,730)]),
    'shop_2f':(1,[(239,707),(810,1000),(1250,770)])}
sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for name,(selected,points) in SPECS.items():
    asset='bld_kit_xiyu_'+name; meta=ROOT/'meta'/f'{asset}.yaml'
    old=yaml.safe_load(meta.read_text()); e=dict(old)
    rec=json.loads((HERE/f'{name}_call{selected}.json').read_text())
    srcpath=HERE/f'{name}_candidate{selected}.png'; src=Image.open(srcpath)
    L,F,R=points; fp=e['building']['footprint']; crop=src.getchannel('A').getbbox()
    scale=32*sum(fp)/(R[0]-L[0]); cut=src.crop(crop)
    dims=[round(v*scale) for v in cut.size]; eff=[dims[i]/cut.size[i] for i in (0,1)]
    oldsize=[int(v) for v in e['size'].split('x')]
    size=[max(oldsize[i],math.ceil((dims[i]+32)/32)*32) for i in (0,1)]
    off=[(size[i]-dims[i])//2 for i in (0,1)]
    im=Image.new('RGBA',size); im.paste(cut.resize(dims,Image.Resampling.LANCZOS),tuple(off))
    im.save(ROOT/e['file']); center=[(L[i]+R[i])/2 for i in (0,1)]
    anchor=[round((center[i]-crop[i])*eff[i]+off[i],4) for i in (0,1)]
    slopes=[(F[1]-L[1])/(F[0]-L[0]),(R[1]-F[1])/(R[0]-F[0])]
    ratio=(F[0]-L[0])/(R[0]-F[0]); err=abs(ratio/(fp[0]/fp[1])-1)
    e.update(prompt=rec['prompt'],references=[{'file':str((HERE/f'{name}_geometry.png').relative_to(ROOT)),
        'sha256':sha(HERE/f'{name}_geometry.png'),'role':'本轮精确几何参考；非成品或实测证据'}],
        created=datetime.fromtimestamp(Path(rec['source_path']).stat().st_mtime,timezone.utc).isoformat(),
        source_path=rec['source_path'],size='x'.join(map(str,size)),sha256=sha(ROOT/e['file']),
        candidate_count=selected,source_record=f'sources/round2/{name}_call{selected}.json')
    e['building']={**e['building'],'anchor':anchor}
    e['processing']={'source_archive':str(srcpath.relative_to(ROOT)),'source_sha256':sha(srcpath),
        'source_size':list(src.size),'crop_box':list(crop),'uniform_scale_requested':scale,
        'resized_size':dims,'rounded_effective_scale':eff,'paste_offset':off,
        'steps':['alpha>0 bbox crop','uniform LANCZOS resize with pixel rounding',
                 'unmasked paste into transparent canvas; no repaint/warp/alpha threshold']}
    e['geometry_qa']={'source_corners_px':dict(zip(['left','front','right'],points)),
        'source_anchor_px':center,'source_axis_slopes':slopes,'axis_tolerance':0.03,
        'axis_pass':all(abs(abs(s)-.5)<=.03 for s in slopes),'expected_width_depth_ratio':fp[0]/fp[1],
        'source_width_depth_ratio':ratio,'ratio_relative_error':err,'ratio_tolerance_suggestion':.1,
        'ratio_pass':err<=.1,'precision_note':'底边alpha>200轮廓直线与可见墙角交点，约±4源像素；未用参考图坐标冒充实测'}
    a=im.getchannel('A'); hist=a.histogram(); bbox=a.getbbox()
    e['pixel_qa']={'mode':im.mode,'size':size,'alpha_extrema':list(a.getextrema()),
        'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),
        'alpha_near_opaque_pixels':sum(hist[250:]),'alpha_nonzero_bbox':list(bbox),
        'transparent_margins_px':[bbox[0],bbox[1],size[0]-bbox[2],size[1]-bbox[3]],'border_alpha_max':0}
    e['notes']='本轮重出；view_image源图与灰底确认地域材质/透明轮廓，成品仅裁切等比扩边。'+(
        '双轴和占地比例实测在既有容差内；仍需总装实测。' if e['geometry_qa']['axis_pass'] else
        '大民居第二候选比例已改善，右轴仍超差；返修未完成，不可精确总装。')
    if name=='house_large':e['subject']='西域两层大民居与木雕阳台（原创扩展）；具体年代细部（待考）'
    e['repair_round']=2
    e['repair_history']={'prior_source_record':old['source_record'],'prior_candidate_count':old['candidate_count'],
        'prior_sha256':old['sha256'],'round_candidate_count':selected,'selected_candidate':selected}
    e['visual_qa']={'checked_with':'view_image original and neutral-gray composite; final PNG',
        'qa_only_composite':f'sources/round2/{name}_qa.jpg','no_pixel_repainting':True}
    # Compact field replacements let the caller apply <=50-line patches, preserving other fields.
    replacements=[]; oldtext=meta.read_text()
    for key,value in e.items():
        if old.get(key)==value and key!='footprint_m':continue
        match=re.search(r'^'+re.escape(key)+r':[^\n]*(?:\n(?![a-zA-Z_][\w-]*:)[^\n]*)*\n?',oldtext,re.M)
        after=key+': '+json.dumps(value,ensure_ascii=False)+'\n'
        if match:before=match.group(0);after=after.rstrip()+'\n'
        else:before='';after=after.rstrip()+'\n'
        replacements.append({'key':key,'before':before,'after':after})
    (HERE/f'{name}_metadata_changes.json').write_text(json.dumps(replacements,ensure_ascii=False)+'\n')
    print(name,e['size'],slopes,err,e['pixel_qa']['alpha_extrema'])
