"""One-shot round-2 provenance script; do not rerun after manifest merge. Crop/resize/pad only."""
from pathlib import Path
import hashlib, json, shutil, re, math
from datetime import datetime, timezone
from PIL import Image
import yaml
ROOT=Path(__file__).resolve().parents[1]
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
jobs=[json.loads(s) for s in (ROOT/'sources/repair-civic-jobs.jsonl').read_text().splitlines()]
old_entries={e['id']:e for e in yaml.safe_load((ROOT/'manifest.yaml').read_text())}
entries=[]; patches=[]
for job in jobs:
    aid='bld_kit_mongol_'+job['key']; old=old_entries[aid]; ref=f'sources/{aid}__r2_input.png'
    shutil.copy2(ROOT/old['file'],ROOT/ref)
    for cand in job['candidates']:
        cand['archive']=f'sources/{aid}__r2_c{cand["number"]:02}.png'
        shutil.copy2(cand['path'],ROOT/cand['archive']); cand['sha256']=sha(ROOT/cand['archive'])
        cand['reference']=ref if cand['number']==1 else f'sources/{aid}__r2_c01.png'
        cand['reference_sha256']=sha(ROOT/cand['reference']); cand['viewed']=True
    chosen=job['candidates'][job['selected']-1]; im=Image.open(ROOT/chosen['archive']); assert im.mode=='RGBA'
    left,front,right=job['points']; rear=[left[i]+right[i]-front[i] for i in range(2)]
    center=[(left[i]+right[i])/2 for i in range(2)]; fp=old['building']['footprint']
    box=im.getchannel('A').getbbox(); crop=im.crop(box); scale=32*sum(fp)/(right[0]-left[0])
    rs=[round(n*scale) for n in crop.size]; sz=[max(512,math.ceil((n+32)/32)*32) for n in rs]
    off=[(sz[i]-rs[i])//2 for i in range(2)]; out=Image.new('RGBA',sz,(0,0,0,0))
    out.paste(crop.resize(rs,Image.Resampling.LANCZOS),tuple(off)); dest=ROOT/old['file']; out.save(dest)
    eff=[rs[i]/crop.size[i] for i in range(2)]; tx=lambda p:[round((p[i]-box[i])*eff[i]+off[i],4) for i in range(2)]
    slopes=[(front[1]-left[1])/(front[0]-left[0]),(right[1]-front[1])/(right[0]-front[0])]
    ratio=(front[0]-left[0])/(right[0]-front[0]); err=abs(ratio/(fp[0]/fp[1])-1)
    axis=all(abs(abs(m)-.5)<=.03 for m in slopes); passed=axis and err<=.1
    geom={'source_corners_px':dict(zip(['left','front','right'],[left,front,right])),'source_anchor_px':center,'hidden_back_corner_method':'back = left + right - front；后角推算，前方三角人工读点。','source_axis_slopes':slopes,'axis_tolerance':.03,'axis_pass':axis,'source_width_depth_ratio':ratio,'expected_width_depth_ratio':fp[0]/fp[1],'ratio_relative_error':err,'ratio_tolerance_suggestion':.1,'ratio_pass':err<=.1,'measurement_uncertainty_source_px':4,'precision_note':'人工逐张view_image读取源PNG真实可见底角，约±4px；未用目标坐标代填。','final_measured_corners_px':dict(zip(['left','front','right'],map(tx,[left,front,right]))),'observed_ground_height_px':round(tx(front)[1]-tx(rear)[1],4)}
    a=out.getchannel('A'); hist=a.histogram(); bb=a.getbbox()
    qa={'mode':'RGBA','size':sz,'alpha_extrema':list(a.getextrema()),'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),'alpha_opaque_pixels':hist[255],'alpha_near_opaque_pixels':sum(hist[192:]),'alpha_nonzero_bbox':list(bb),'transparent_margins_px':[bb[0],bb[1],sz[0]-bb[2],sz[1]-bb[3]],'border_alpha_max':0}
    process={'source_archive':chosen['archive'],'source_size':list(im.size),'source_sha256':chosen['sha256'],'crop_box':list(box),'uniform_scale_requested':scale,'resized_size':rs,'rounded_effective_scale':eff,'paste_offset':off,'steps':['只裁alpha>0包围框外透明空白','一次等比LANCZOS；整数宽高量化误差单列','无mask粘贴至透明RGBA画布；不改颜色/alpha、不warp、不补画'],'anchor_formula':'(source_anchor-crop_origin)*rounded_effective_scale+paste_offset'}
    building=dict(old['building'],anchor=tx(center)); contract=dict(old['projection_contract'],measured_geometry_pass=passed,ground_bbox_semantics='64×32网格目标包围框，非实际底面测量')
    note=f'第2轮返修采用候选{job["selected"]}；轴率{slopes[0]:.5f}/{slopes[1]:.5f}；宽深比{ratio:.5f}，目标{fp[0]/fp[1]:.5f}；轴率/比例检查分别{axis}/{err<=.1}。保持candidate；历史细部（待考），功能布局（原创扩展）；尚未总装验收。'
    record=dict(old,prompt=chosen['prompt'],references=[{'file':chosen['reference'],'sha256':chosen['reference_sha256'],'role':'本轮实际传入的几何返修编辑目标；归档原字节'}],source_path=chosen['path'],source_sha256=chosen['sha256'],created=datetime.fromtimestamp(Path(chosen['path']).stat().st_mtime,timezone.utc).isoformat(),size=f'{sz[0]}x{sz[1]}',sha256=sha(dest),building=building,projection_contract=contract,processing=process,geometry_qa=geom,notes=note)
    record['previous_source']={'source_path':old['source_path'],'source_sha256':old['source_sha256'],'references':old.get('references',[]),'previous_final_archive':ref,'previous_final_sha256':sha(ROOT/ref)}
    record['previous_source']['source_record']=old['source_record']
    record['source_record']=f'sources/{aid}__r2.json'
    record['repair_round']=2; record['repair_candidate_count']=len(job['candidates']); entries.append(record)
    metapath=ROOT/'meta'/f'{aid}.yaml'; oldtext=metapath.read_text()
    changes={'building':building,'anchor_px':tx(center),'projection_contract':contract,'geometry_qa':geom,'pixel_qa':qa,'processing':process,'candidate_count':len(job['candidates']),'selected_candidate':f'run2-c{job["selected"]}','notes':note}
    for key,value in changes.items():
        match=re.search(r'^'+re.escape(key)+r':[^\n]*(?:\n(?![^\s\-\n][^\n]*:)[^\n]*)*',oldtext,re.M); assert match,key
        before=match.group(0).rstrip('\n'); after=key+': '+json.dumps(value,ensure_ascii=False)
        if key=='building': after=after.replace('"anchor": [','"anchor": &id001 [')
        assert len(before.splitlines())+1<=46,(aid,key,len(before.splitlines()))
        patches.append('*** Begin Patch\n*** Update File: '+str(metapath.relative_to(Path.cwd()))+'\n@@\n'+'\n'.join('-'+s for s in before.splitlines())+'\n+'+after+'\n*** End Patch')
    sourceqa={'alpha_extrema':list(im.getchannel('A').getextrema()),'border_note':'源图低alpha晕完整保留，未阈值去除；成品透明pad；不得把隐藏RGB晕判作不透明背景。'}
    before=re.search(r'^source_pixel_qa:[^\n]*(?:\n(?![^\s\-\n][^\n]*:)[^\n]*)*',oldtext,re.M).group(0).rstrip('\n')
    patches.append('*** Begin Patch\n*** Update File: '+str(metapath.relative_to(Path.cwd()))+'\n@@\n'+'\n'.join('-'+s for s in before.splitlines())+'\n+source_pixel_qa: '+json.dumps(sourceqa,ensure_ascii=False)+'\n*** End Patch')
    with (ROOT/'sources'/f'{aid}__r2.json').open('w') as f:f.write(json.dumps(dict(job,previous=record['previous_source'],final=record),ensure_ascii=False)+'\n')
    promptpath=ROOT/'prompts'/f'{aid}__r2.md'
    with promptpath.open('w') as f:
        f.write('# 第2轮投影返修：'+aid+'\n\n')
        for cand in job['candidates']:f.write(f'## 候选{cand["number"]}'+('（采用）' if cand['number']==job['selected'] else '（未采用）')+'\n\n'+cand['prompt']+'\n\n')
        f.write(note+'\n内置image_gen，transparent_background=true；源图及传入图已按字节归档。\n')
    print(aid,sz,slopes,ratio,axis,err<=.1)
(ROOT/'repair-civic-entries.json').write_text('[\n'+',\n'.join(json.dumps(x,ensure_ascii=False) for x in entries)+'\n]\n')
(ROOT/'sources/repair-civic-meta-patches.json').write_text(json.dumps(patches,ensure_ascii=False)+'\n')
