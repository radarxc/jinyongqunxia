import json,yaml,hashlib,shutil,re
from pathlib import Path
from PIL import Image
R=Path('assets/default/building-map/qing_south');P=R/'review2/buildings_b'
entries={e['id']:e for e in yaml.safe_load((R/'manifest.yaml').read_text())}
hashfile=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
patches=[]
def patch_key(path,key,value):
 old=path.read_text();match=re.search(r'^'+re.escape(key)+r':.*(?:\n(?![^ \n#][^\n]*:)[^\n]*)*',old,re.M)
 new=yaml.safe_dump({key:value},allow_unicode=True,sort_keys=False,width=100000,default_flow_style=None).rstrip()
 if match:
  before=match.group(0).rstrip('\n');patch='*** Begin Patch\n*** Update File: '+str(path)+'\n@@\n'+''.join('-'+l+'\n' for l in before.splitlines())+''.join('+'+l+'\n' for l in new.splitlines())+'*** End Patch';patches.append(patch)
 else:patches.append('*** Begin Patch\n*** Update File: '+str(path)+'\n@@\n '+old.rstrip().splitlines()[-1]+'\n'+''.join('+'+l+'\n' for l in new.splitlines())+'*** End Patch')
for name in ['restaurant','yamen','biaoju','casino','manor','wangfu']:
 id='bld_kit_qing_south_'+name;s=json.loads((P/f'{name}.spec.json').read_text());e=entries[id];meta=R/e['metadata'];m=yaml.safe_load(meta.read_text());w,d=e['building']['footprint'];oldsize=tuple(map(int,e['size'].split('x')))
 sel=s['selected'];src=Path(s['generated_dir'])/s['files'][sel-1];im=Image.open(src).convert('RGBA');L,F,T=s['corners'];span=T[0]-L[0];scale=32*(w+d)/span;box=im.getchannel('A').getbbox();crop=im.crop(box);size=[round(crop.width*scale),round(crop.height*scale)];off=[(oldsize[0]-size[0])//2,(oldsize[1]-size[1])//2];out=Image.new('RGBA',oldsize);out.paste(crop.resize(size,Image.Resampling.LANCZOS),off)
 shutil.copy2(R/e['file'],P/f'{name}.previous-final.png');shutil.copy2(R/'sources'/f'{id}.png',P/f'{name}.previous-source.png');out.save(R/e['file']);shutil.copy2(src,R/'sources'/f'{id}.png')
 def mapped(p):return [round((p[0]-box[0])*size[0]/crop.width+off[0],4),round((p[1]-box[1])*size[1]/crop.height+off[1],4)]
 anchor=mapped([(L[0]+T[0])/2,(L[1]+T[1])/2]);sl=[(F[1]-L[1])/(F[0]-L[0]),(T[1]-F[1])/(T[0]-F[0])];ratio=(F[0]-L[0])/(T[0]-F[0]);err=abs(ratio/(w/d)-1)
 qa=dict(source_corners_px=dict(zip(['left','front','right'],[L,F,T])),source_axis_slopes=sl,axis_tolerance=.03,axis_pass=all(abs(abs(a)-.5)<=.03 for a in sl),source_width_depth_ratio=ratio,expected_width_depth_ratio=w/d,ratio_relative_error=err,ratio_tolerance_suggestion=.1,ratio_pass=err<=.1,measurement_uncertainty_source_px=5,precision_note='view_image原尺寸逐图人工读取可见薄石坪上表面外角；非提示词目标点；隐藏后角由平行四边形推算，±5源px。')
 a=out.getchannel('A');hist=a.histogram();bb=a.getbbox();near=a.point(lambda x:255 if x>=192 else 0).getbbox();px=dict(mode='RGBA',size=list(oldsize),alpha_extrema=list(a.getextrema()),alpha_zero_pixels=hist[0],alpha_partial_pixels=sum(hist[1:255]),alpha_opaque_pixels=hist[255],alpha_near_opaque_pixels=sum(hist[192:]),alpha_nonzero_bbox=list(bb),transparent_margins_px=[bb[0],bb[1],oldsize[0]-bb[2],oldsize[1]-bb[3]],border_alpha_max=max(a.crop((0,0,oldsize[0],1)).getextrema()[1],a.crop((0,oldsize[1]-1,oldsize[0],oldsize[1])).getextrema()[1],a.crop((0,0,1,oldsize[1])).getextrema()[1],a.crop((oldsize[0]-1,0,oldsize[0],oldsize[1])).getextrema()[1]))
 proc=dict(source_archive=f'sources/{id}.png',source_sha256=hashfile(src),source_size=list(im.size),crop_box=list(box),uniform_scale_requested=scale,resized_size=size,rounded_effective_scale=[size[0]/crop.width,size[1]/crop.height],paste_offset=off,final_file=e['file'],steps=['alpha>0 bbox crop','uniform LANCZOS resize; integer rounding only','paste without mask onto RGBA canvas; no repaint/warp/threshold'])
 note='返修第2轮逐张view_image；本轮2候选选第'+str(sel)+'；灰瓦白墙木石质感与宋基线接近，完整无字无人。'+('双轴及占地宽深比实测均在登记容差内。' if qa['axis_pass'] and qa['ratio_pass'] else '占地比例改善，但双轴仍超±0.03，保持candidate并明确未通过几何验收。')
 e.update(prompt=s['prompts'][sel-1],source_path=str(src),source_sha256=hashfile(src),sha256=hashfile(R/e['file']),source_record=f'review2/buildings_b/{name}.source.json',candidate_count=2,geometry_qa=qa,notes=note);e['building']['anchor']=anchor
 updates=dict(building=e['building'],anchor_px=anchor,logical_footprint_polygon_px=[[anchor[0]-16*(w+d),anchor[1]-8*(w-d)],[anchor[0]+16*(w-d),anchor[1]+8*(w+d)],[anchor[0]+16*(w+d),anchor[1]+8*(w-d)],[anchor[0]-16*(w-d),anchor[1]-8*(w+d)]],occluder_proxy_px=list(near),geometry_qa=qa,pixel_qa=px,processing=proc)
 for key,val in updates.items():patch_key(meta,key,val)
 for key in ['visual_review','final_review']:
  if key in m:patch_key(meta,key,note)
 if 'source_request' in m:patch_key(meta,'source_request',e['source_record'])
 source=dict(id=id,round=2,tool='built-in image_gen',model='underlying model not disclosed',candidate_count=2,selected_candidate=sel,prompt=s['prompts'][sel-1],transparent_background=True,source_path=str(src),source_sha256=hashfile(src),source_archive=f'sources/{id}.png',geometry_qa=qa,visual_review=note,candidates=[dict(candidate=i+1,path=str(Path(s['generated_dir'])/f),prompt=s['prompts'][i]) for i,f in enumerate(s['files'])])
 (P/f'{name}.source.json').write_text(json.dumps(source,ensure_ascii=False,indent=None)+'\n');(P/f'{name}.entry.yaml').write_text(yaml.safe_dump(e,allow_unicode=True,sort_keys=False,width=100000,default_flow_style=None));print(name,sl,ratio,err,qa['axis_pass'],qa['ratio_pass'])
(P/'metadata-patches.json').write_text(json.dumps(patches,ensure_ascii=False)+'\n')
