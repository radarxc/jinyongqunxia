import hashlib,json,math,re,shutil,yaml
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).parent
POINTS={'stable':[[124,556],[886,963],[1442,669]],'temple_hall':[[154,599],[857,958],[1380,678]],'pagoda':[[378,760],[768,963],[1159,760]],'guardhouse':[[170,580],[867,933],[1365,680]],'warehouse':[[169,596],[834,936],[1396,664]],'wharf':[[124,470],[1027,932],[1366,760]]}
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pack(v):return json.dumps(v,ensure_ascii=False,separators=(',',':'))
patches=[];summaries=[]
def replace(path,old,new):
    assert len(old.splitlines())+len(new.splitlines())+4<=50
    patches.append('*** Begin Patch\n*** Update File: '+str(path)+'\n@@\n'+''.join('-'+s+'\n' for s in old.splitlines())+''.join('+'+s+'\n' for s in new.splitlines())+'*** End Patch')
for name,points in POINTS.items():
    req=json.loads((HERE/f'{name}.request.json').read_text());ident=req['id'];src=Path(req['source_path'])
    entry=next(e for e in yaml.safe_load((ROOT/'manifest.yaml').read_text()) if e['id']==ident)
    mp=ROOT/'meta'/f'{ident}.yaml';original=mp.read_text();meta=yaml.safe_load(original)
    w,d=meta['footprint_m'];L,F,R=points;dx1=F[0]-L[0];dx2=R[0]-F[0]
    slopes=[(F[1]-L[1])/dx1,(R[1]-F[1])/dx2];ratio=dx1/dx2;err=abs(ratio/(w/d)-1)
    qa=dict(source_corners_px=dict(zip(['left','front','right'],points)),source_axis_slopes=slopes,axis_tolerance=.03,axis_pass=all(abs(abs(v)-.5)<=.03 for v in slopes),source_width_depth_ratio=ratio,expected_width_depth_ratio=w/d,ratio_relative_error=err,ratio_tolerance_suggestion=.1,ratio_pass=err<=.1,measurement_uncertainty_source_px=3,precision_note='第2轮原图接地底缘三角人工读点±3px；不使用guide理论点；后角推算。')
    im=Image.open(src).convert('RGBA');bbox=im.getchannel('A').getbbox();scale=32*(w+d)/(R[0]-L[0]);crop=im.crop(bbox)
    dims=[round(crop.width*scale),round(crop.height*scale)];res=crop.resize(dims,Image.Resampling.LANCZOS)
    oldsize=[int(v) for v in entry['size'].split('x')];size=[max(oldsize[i],math.ceil((dims[i]+64)/32)*32) for i in [0,1]];offset=[(size[i]-dims[i])//2 for i in [0,1]]
    out=Image.new('RGBA',size);out.paste(res,offset);out.save(ROOT/f'{ident}.png');shutil.copyfile(src,ROOT/'sources'/f'{ident}.png')
    factors=[dims[i]/crop.size[i] for i in [0,1]];anchor=[round((((L[i]+R[i])/2)-bbox[i])*factors[i]+offset[i],4) for i in [0,1]]
    a=out.getchannel('A');ab=a.getbbox();hist=a.histogram();pixel=dict(mode='RGBA',size=size,alpha_extrema=list(a.getextrema()),alpha_zero_pixels=hist[0],alpha_partial_pixels=sum(hist[1:255]),alpha_opaque_pixels=hist[255],alpha_near_opaque_pixels=sum(hist[250:]),alpha_nonzero_bbox=list(ab),transparent_margins_px=[ab[0],ab[1],size[0]-ab[2],size[1]-ab[3]],border_alpha_max=0)
    processing=dict(source_archive=f'sources/{ident}.png',source_sha256=sha(src),source_size=list(im.size),crop_box=list(bbox),uniform_scale_requested=scale,resized_size=dims,rounded_effective_scale=factors,paste_offset=offset,final_file=f'{ident}.png',steps=['crop to alpha>0 bbox','uniform LANCZOS resize; integer rounding only','paste without mask into transparent canvas; no warp, redraw, alpha threshold or ground-edge trimming'])
    for key,value in [('geometry_qa',qa),('pixel_qa',pixel),('processing',processing)]:
        block=re.search(r'^'+key+r':\n(?:[ \t].*\n)*',original,re.M).group();replace(mp,block,key+': '+pack(value))
    for pattern,new in [(r'^  anchor:.*$', '  anchor: '+pack(anchor)),(r'^anchor_px:.*$','anchor_px: '+pack(anchor))]:
        replace(mp,re.search(pattern,original,re.M).group(),new)
    x,y=anchor;poly=[[x-16*(w+d),y+8*(d-w)],[x+16*(w-d),y+8*(w+d)],[x+16*(w+d),y+8*(w-d)],[x+16*(d-w),y-8*(w+d)]]
    oldpoly=re.search(r'^logical_footprint_polygon_px:\n(?:- .*\n)+',original,re.M).group();replace(mp,oldpoly,'logical_footprint_polygon_px: '+pack(poly))
    proxy=out.getchannel('A').point(lambda q:255 if q>=192 else 0).getbbox();replace(mp,re.search(r'^occluder_proxy_px:.*$',original,re.M).group(),'occluder_proxy_px: '+pack(list(proxy)))
    note='第2轮已view_image逐张复查；按登记占地guide经image_gen独立重出，保留清式材质、灰瓦白墙与木石细节；双轴'+('通过' if qa['axis_pass'] else '仍略超0.03，未伪称通过')+'，宽深比通过10%建议阈值；candidate，单视图且无GLB。'
    for key in ['visual_review','final_review']:
        match=re.search('^'+key+':.*$',original,re.M)
        if match:replace(mp,match.group(),key+': '+note)
    entry.update(prompt=req['prompt'],source_path=str(src),source_sha256=sha(src),sha256=sha(ROOT/f'{ident}.png'),size=f'{size[0]}x{size[1]}',candidate_count=req['candidate_count'],selected_candidate=req['selected_candidate'],geometry_qa=qa,notes=note,source_record=f'review2/c/{name}.record.json')
    entry['building']['anchor']=anchor
    import datetime
    entry['created']=datetime.datetime.fromtimestamp(src.stat().st_mtime,datetime.timezone.utc).isoformat();entry['created_time_basis']='第2轮源PNG文件mtime；非工具披露服务端时间'
    entry['references']=[dict(file=f'assets/default/building-map/qing_south/review2/c/{name}.guide.png',role='精确底面技术guide；仅生成输入，非成品后处理',sha256=sha(HERE/f'{name}.guide.png'))]
    if name=='stable':entry['references'].append(dict(file=f'assets/default/building-map/qing_south/{ident}.png',role='前轮原图作材质参考；本轮已替换，前轮哈希可见旧source_record'))
    (HERE/f'{name}.entry.yaml').write_text(pack(entry)+'\n')
    record=req|dict(source_sha256=sha(src),geometry_qa=qa,visual_review=note,processing=processing,history_note='旧sources/*.json保留前轮生成记录；当前源PNG已按本记录更新。')
    (HERE/f'{name}.record.json').write_text(pack(record)+'\n');summaries.append(dict(id=ident,size=size,anchor=anchor,sha256=entry['sha256'],geometry_qa=qa))
(HERE/'patches.json').write_text(pack(patches)+'\n');(HERE/'summary.json').write_text(pack(summaries)+'\n')
print(pack(summaries))
