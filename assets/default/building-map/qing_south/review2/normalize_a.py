from pathlib import Path
from PIL import Image
import yaml,json,hashlib,shutil,re
ROOT=Path(__file__).resolve().parents[1]; OUT=Path(__file__).parent
SPECS={
 'house_large':('house_large_2',[[190,862],[710,1109],[1094,911]],2,'双轴通过，宽深比仍超10%；选第二候选保留真实残差。'),
 'courtyard':('courtyard_2',[[136,563],[807,928],[1405,640]],2,'第二候选右轴改善；左轴及宽深比仍超容差，未解决。'),
 'shop_1f':('shop_1f_2',[[160,580],[872,943],[1375,682]],2,'第二候选基座三角双轴及宽深比通过。'),
 'shop_2f':('shop_2f',[[171,589],[853,933],[1365,674]],1,'第一候选基座三角双轴及宽深比通过。'),
 'inn':('inn',[[89,555],[835,945],[1450,621]],1,'第一候选三角局部放大核对，双轴及宽深比通过；比值误差9.02%。')}
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
entries={e['id']:e for e in yaml.safe_load((ROOT/'manifest.yaml').read_text())};patches=[]
def block(key,val):return yaml.safe_dump({key:val},allow_unicode=True,sort_keys=False,default_flow_style=False if isinstance(val,str) else None,width=160)
def replace_section(path,key,val):
 text=path.read_text(); new=block(key,val)
 pattern=r'(?m)^'+re.escape(key)+r':[^\n]*(?:\n(?:[ \t].*|-[^\n]*|$))*\n?'
 hit=re.search(pattern,text)
 if not hit:raise ValueError(key)
 old=hit.group().rstrip('\n');new=new.rstrip('\n')
 patch='*** Begin Patch\n*** Update File: '+str(path.relative_to(Path.cwd()))+'\n@@\n'+'\n'.join('-'+l for l in old.splitlines())+'\n'+'\n'.join('+'+l for l in new.splitlines())+'\n*** End Patch'
 assert len(patch.splitlines())<=50,(key,len(patch.splitlines()))
 patches.append(patch)
def write_chunks(path,text):
 lines=text.splitlines(True)
 for i in range(0,len(lines),45):
  with path.open('w' if i==0 else 'a') as f:f.writelines(lines[i:i+45])
for name,(key,corners,count,note) in SPECS.items():
 id='bld_kit_qing_south_'+name;e=entries[id];mp=ROOT/'meta'/f'{id}.yaml';m=yaml.safe_load(mp.read_text())
 request=json.loads((OUT/(key+'.request.json')).read_text());source=Path(request['source_path'])
 archive=ROOT/'sources'/f'{id}.png'
 if not (OUT/(name+'.before.png')).exists():shutil.copy2(archive,OUT/(name+'.before.png'))
 shutil.copy2(source,archive);im=Image.open(source).convert('RGBA');box=im.getchannel('A').getbbox();crop=im.crop(box)
 L,F,R=corners;w,d=e['building']['footprint'];scale=32*(w+d)/(R[0]-L[0]);sz=(round(crop.width*scale),round(crop.height*scale))
 cropped=crop.resize(sz,Image.Resampling.LANCZOS);canvas=Image.new('RGBA',tuple(m['pixel_qa']['size']));offset=((canvas.width-sz[0])//2,(canvas.height-sz[1])//2)
 assert min(offset)>=4;canvas.paste(cropped,offset);canvas.save(ROOT/e['file'])
 sx=sz[0]/crop.width;sy=sz[1]/crop.height
 transform=lambda p:[round((p[0]-box[0])*sx+offset[0],4),round((p[1]-box[1])*sy+offset[1],4)]
 anchor=transform([(L[0]+R[0])/2,(L[1]+R[1])/2]);slopes=[(F[1]-L[1])/(F[0]-L[0]),(R[1]-F[1])/(R[0]-F[0])];ratio=(F[0]-L[0])/(R[0]-F[0])
 geometry={'source_corners_px':dict(zip(['left','front','right'],corners)),'source_axis_slopes':slopes,'axis_tolerance':0.03,'axis_pass':all(abs(abs(s)-0.5)<=0.03 for s in slopes),'source_width_depth_ratio':ratio,'expected_width_depth_ratio':w/d,'ratio_relative_error':abs(ratio/(w/d)-1),'ratio_tolerance_suggestion':0.1,'ratio_pass':abs(ratio/(w/d)-1)<=0.1,'measurement_uncertainty_source_px':3,'precision_note':'原尺寸及6倍局部view_image人工读取可见石基角；±3源px；隐藏后角未实测。guide理论点不参与实测。'}
 alpha=canvas.getchannel('A');hist=alpha.histogram();bb=list(alpha.getbbox());cw,ch=canvas.size
 pixel={'mode':'RGBA','size':list(canvas.size),'alpha_extrema':list(alpha.getextrema()),'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),'alpha_opaque_pixels':hist[255],'alpha_nonzero_bbox':bb,'transparent_margins_px':[bb[0],bb[1],cw-bb[2],ch-bb[3]],'border_alpha_max':0}
 process={'source_archive':str(archive.relative_to(ROOT)),'source_sha256':sha(source),'source_size':list(im.size),'crop_box':list(box),'uniform_scale_requested':scale,'resized_size':list(sz),'rounded_effective_scale':[sx,sy],'paste_offset':list(offset),'steps':['alpha>0 bounding-box crop','uniform LANCZOS resize with integer size rounding','paste without mask into transparent RGBA; no warp, alpha threshold, recolor or repaint']}
 request.update({'id':id,'tool':'built-in image_gen','candidate_count':count,'selected_candidate':2 if key.endswith('_2') else 1,'source_archive':str(archive.relative_to(ROOT)),'source_sha256':sha(source),'transparent_background':True,'revision':'review2'})
 reqpath=OUT/(name+'.selected.request.json');reqpath.write_text(json.dumps(request,ensure_ascii=False)+'\n')
 note='第2轮返修：'+note+'新源图及RGBA浅底预览已view_image；灰瓦粉墙深木、左上光和短右下影完整，无文字人物水印。单视图candidate，非release。'
 finalnote=f'成品{cw}×{ch}，仅裁切等比缩小并透明留边；最终像素和可见三角详见pixel_qa/geometry_qa。'
 measure={'source_size':list(im.size),'corners':geometry['source_corners_px'],'geometry_qa':geometry,'visual_review':note,'final_review':finalnote,'final_corners_px':[transform(p) for p in corners]}
 measurepath=OUT/(name+'.measure.json');measurepath.write_text(json.dumps(measure,ensure_ascii=False)+'\n')
 e.update({'prompt':request['prompt'],'source_path':str(source),'source_sha256':sha(source),'sha256':sha(ROOT/e['file']),'size':f'{cw}x{ch}','geometry_qa':geometry,'source_record':str(reqpath.relative_to(ROOT)),'notes':note})
 e['building']['anchor']=anchor
 for key2,value in [('building',e['building']),('anchor_px',anchor),('logical_footprint_polygon_px',[[anchor[0]-16*(w+d),anchor[1]+8*(d-w)],[anchor[0]+16*(w-d),anchor[1]+8*(w+d)],[anchor[0]+16*(w+d),anchor[1]+8*(w-d)],[anchor[0]+16*(d-w),anchor[1]-8*(w+d)]]),('occluder_proxy_px',list(alpha.point(lambda v:255 if v>=192 else 0).getbbox())),('geometry_qa',geometry),('pixel_qa',pixel),('processing',process),('visual_review',note),('final_review',finalnote),('source_request',str(reqpath.relative_to(ROOT))),('source_measure',str(measurepath.relative_to(ROOT)))]:replace_section(mp,key2,value)
 write_chunks(OUT/(name+'.entry.yaml'),yaml.safe_dump(e,allow_unicode=True,sort_keys=False,width=160))
 print(name,canvas.size,geometry['source_axis_slopes'],ratio,geometry['ratio_relative_error'],geometry['axis_pass'],geometry['ratio_pass'],pixel['alpha_extrema'])
(OUT/'a_meta_patches.json').write_text(json.dumps(patches,ensure_ascii=False)+'\n')
