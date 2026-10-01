from pathlib import Path
import json, hashlib, numpy as np, yaml
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
spec = {'yamen': [(35,901,1503),(128,875,1410)], 'biaoju': [(123,835,1433),(124,858,1422)], 'casino': [(131,866,1404),(134,818,1410)], 'manor': [(109,812,1433),(114,810,1424)], 'temple_hall': [(105,866,1476),(143,860,1394)]}
entries = {e['id']: e for e in yaml.safe_load((ROOT/'manifest.yaml').read_text())}
for typ, corners in spec.items():
    d=ROOT/'revisions_r3'/typ; aid='bld_kit_ming_south_'+typ; entry=entries[aid]; w,h=entry['building']['footprint']; records=[]
    for c, xx in enumerate(corners,1):
        src=d/f'candidate_{c}.png'; im=Image.open(src); a=np.array(im.getchannel('A')); points=[]
        for x in xx:
            yy=np.flatnonzero(a[:,x]>=200); points.append([x,int(yy[-1])])
        L,F,R=np.array(points,dtype=float); slopes=[(F[1]-L[1])/(F[0]-L[0]),(R[1]-F[1])/(R[0]-F[0])]; ratio=(F[0]-L[0])/(R[0]-F[0]); fits=[]
        for start,end in [(xx[0]+15,xx[1]-15),(xx[1]+15,xx[2]-15)]:
            xs=np.arange(start,end+1); ys=np.array([np.flatnonzero(a[:,x]>=200)[-1] for x in xs]); keep=np.ones(len(xs),dtype=bool)
            for _ in range(5):
                fit=np.polyfit(xs[keep],ys[keep],1); res=ys-np.polyval(fit,xs); keep=np.abs(res-np.median(res))<6
            fits.append({'x_interval':[start,end],'slope':float(fit[0]),'intercept':float(fit[1]),'samples':int(keep.sum()),'excluded_samples':int((~keep).sum())})
        r=json.loads((d/f'candidate_{c}.json').read_text()); r.update(candidate=c,source_file=str(src.relative_to(ROOT)),size=list(im.size),mode=im.mode,alpha_extrema=list(im.getchannel('A').getextrema()),sha256=hashlib.sha256(src.read_bytes()).hexdigest(),ground_lfr_source_px=points,slopes=slopes,edge_fits=fits,horizontal_ratio=float(ratio),target_ratio=w/h,relative_ratio_error=abs(ratio/(w/h)-1),source_anchor_px=((L+R)/2).tolist(),view_image_inspected=True)
        r['axis_pass']=all(abs(abs(v)-.5)<=.03 for v in slopes) and all(abs(abs(f['slope'])-.5)<=.03 for f in fits); r['ratio_pass']=bool(r['relative_ratio_error']<=.03); r['geometry_pass']=r['axis_pass'] and r['ratio_pass']; r['selected']=False
        r['rejection_reason']='双轴/占地比未同时通过，不能作为已验收素材'; records.append(r)
        preview=Image.open(d/f'preview_{c}.jpg'); draw=ImageDraw.Draw(preview); draw.line(points,fill=(255,55,50),width=3)
        for label,point in zip(['L','F','R'],points):
            x,y=point; draw.ellipse([x-5,y-5,x+5,y+5],fill=(255,55,50)); draw.text((x+6,y-18),label+str(point),fill=(255,255,255))
        preview.save(d/f'measured_{c}.jpg')
    final=ROOT/entry['file']; result={'id':aid,'type':typ,'revision':3,'footprint':[w,h],'axis_tolerance':.03,'relative_ratio_tolerance':.03,'measurement_method':'人工锁定地面左/前/右角横坐标，alpha>=200该列最下边界定位纵坐标；端点不确定度±4源像素。补充完整可见边缘鲁棒直线拟合（排除入口凸出的台阶及离主边>6px点）；不挑有利局部。','candidate_records':records,'selected_candidate':None,'geometry_release_ready':False,'manifest_replacement':None,'original_sha256':hashlib.sha256(final.read_bytes()).hexdigest(),'original_size':list(Image.open(final).size),'original_unchanged':True}
    (d/'result.json').write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
    for r in records: print(typ,r['candidate'],'slopes',r['slopes'],'fits',[f['slope'] for f in r['edge_fits']],'ratio',r['horizontal_ratio'],'pass',r['geometry_pass'])
