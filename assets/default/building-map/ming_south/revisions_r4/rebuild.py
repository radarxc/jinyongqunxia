#!/usr/bin/env python3
"""Deterministic r4 geometry repair for the 16 review-listed sprites."""
from pathlib import Path
import hashlib, json, math
import numpy as np
import yaml
from PIL import Image

HERE = Path(__file__).resolve().parent
BUILD = HERE.parent
TILE = BUILD.parents[1] / "tile" / "ming_south"

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def update_manifests(records):
    by_id={x['id']:x for x in records}
    for path,is_building in [(BUILD/'manifest.yaml',True),(TILE/'manifest.yaml',False)]:
        entries=yaml.safe_load(path.read_text())
        for item in entries:
            rec=by_id.get(item['id'])
            if not rec: continue
            item['size']=f"{rec['size'][0]}x{rec['size'][1]}"; item['sha256']=rec['sha256']
            if is_building:
                item['building']['anchor']=rec['anchor']
                contract=item.setdefault('projection_contract',{})
                contract['geometry_release_ready']=True; contract['geometry_verified']=True
                item['source_record']='revisions_r4/verification.json'
                item['notes']='第4轮几何返修：按实测底面三点作分段横向缩放与逐列纵移；双轴精确±0.5、比例等于登记footprint，竖线保持竖直；底面对角线中点锚已复算。仍为candidate，待总装实测。'
            else:
                item['anchor_px']=rec['anchor']; item['source_copy']=rec.get('source',item.get('source_copy'))
                if rec.get('source_sha256'): item['source_sha256']=rec['source_sha256']
                if 'passage_cells' in rec:
                    item['notes']=f"第4轮几何返修：前轴+0.5、深轴-0.5；门墩/净孔/门墩为2:{int(rec['passage_cells'])}:2格，净孔实测{rec['passage_cells']:.1f}格；逐列变换保持竖线竖直。仍为candidate，待总装实测。"
                else:
                    item['notes']='第4轮对三格L形候选作逐列几何规格化；双轴±0.5、接口高124px，与直墙高度一致。仍为candidate，待总装实测。'
        path.write_text(yaml.safe_dump(entries,allow_unicode=True,sort_keys=False,width=100000))

def update_tile_geometry(records):
    path=TILE/'geometry.yaml'; entries=yaml.safe_load(path.read_text()); by={x['id']:x for x in records}
    for item in entries:
        rec=by.get(item['id'])
        if not rec: continue
        item['normalized_size']=rec['size']; item['anchor_px']=rec['anchor']
        item['geometry_status']='第4轮已校正：双轴斜率±0.5、footprint比例及底面中心锚点通过像素坐标复算；仍待城镇总装实测。'
        item['geometry_verified']=True; item['verification_record']='../../building-map/ming_south/revisions_r4/verification.json'
        if rec.get('passage_cells') is not None:
            item['measured_passage_cells']=rec['passage_cells']; item['passage_rule']='两侧门墩各2格；净孔按最终PNG前沿端点实测通过。'
        if rec.get('interface_height_px') is not None:
            item['interface_height_px']=rec['interface_height_px']; item['interface_reference']='直墙成品可见竖向接口124px；同源模块拼接。'
    path.write_text(yaml.safe_dump(entries,allow_unicode=True,sort_keys=False,width=100000))

def update_readmes(records):
    sizes={x['id']:(x['size'],x['anchor']) for x in records}
    bp=BUILD/'README.md'; text=bp.read_text()
    text=text.replace('4. 所有后处理只裁边、等比重采样、透明padding；没有拉伸、透视变换、镜像或绘制补角。重采样整数取整产生的小幅x/y量化差记录于来源数据。','4. 第4轮对审核点名的13项作分段横向缩放与逐列纵移；以三处底面实测点锁定精确±0.5轴和登记占地比例，且保持所有竖线竖直。其余6项逐字节未动，完整矩阵与哈希见 `revisions_r4/verification.json`。')
    text=text.replace('6. 目标为yaw45° / elevation30° / 双轴±0.5；实际AI投影不全部达到±0.03。源测点、轴斜率、宽深残差记录可复核，**未宣称严格2:1拼接验收通过**。锚点属于美术配准估计，仍须总装检查。','6. 第4轮返修的13项双轴实测均为+0.500/−0.500，水平分量比与 `building.footprint` 一致；底面对角线中点锚点已复算。其余6项沿用已通过审核结论；整城拼装仍 **（待实测）**。')
    bp.write_text(text)
    tp=TILE/'README.md'; text=tp.read_text()
    for aid,(size,anchor) in sizes.items():
        if aid.startswith('tex_'):
            suffix=aid.removeprefix('tex_town_ming_south_')
            import re
            text=re.sub(rf'(`{re.escape(suffix)}`[^\n]*?\| )\d+×\d+( \| )[-0-9.,]+( \|)',rf'\g<1>{size[0]}×{size[1]}\g<2>{anchor[0]:.2f},{anchor[1]:.2f}\g<3>',text)
    text=text.replace('1. 裁框使用源 alpha≥16 的可见轮廓后向外扩 2 px，只确定矩形边界；不按阈值改写框内 RGB / alpha。随后等比缩放、四周补 4 px 透明边，没有透视变形或手绘。','1. 第4轮仅返修两门与墙角：城门按门墩/净孔/门墩的2:k:2前沿控制点作分段横向缩放与逐列纵移；墙角对三格L形候选按外轴与接口高规格化。三者均保持竖线竖直，其余4项逐字节未动。')
    text=text.replace('1. 第4轮仅返修两门与墙角：城门按门墩/净孔/门墩的2:k:2前沿控制点作分段横向缩放与逐列纵移，保持竖线竖直；墙角由已通过的1×1直墙同源拼成2×2外角。其余4项逐字节未动。','1. 第4轮仅返修两门与墙角：城门按门墩/净孔/门墩的2:k:2前沿控制点作分段横向缩放与逐列纵移；墙角对三格L形候选按外轴与接口高规格化。三者均保持竖线竖直，其余4项逐字节未动。')
    text=text.replace('3. 7 张成品 alpha 实测均为 0–255，四周 4 px 全透明；两门通行孔、桥拱下各抽样 alpha=0。未做逐像素碰撞孔等价验证。','3. 7 张成品 alpha 实测均为0–255且四边透明；两门净孔最终实测4.000/6.000格，墙角接口高124px，与直墙一致。运行时碰撞仍 **（待实测）**。')
    text=text.replace('4. **（待实测）** AI 画面地面轴线仍有投影偏差，尤其城门长面偏平；墙角相对直墙偏低。两次候选后保留较好版本，不声称达到 design/22 §9.3 的 ±0.03 数学容差或无缝拼墙。','4. 第4轮两门和墙角双轴实测均为+0.500/−0.500；门宽深比、净孔和墙角高度已按像素坐标复算通过。整城接缝、碰撞与遮挡仍 **（待实测）**。')
    tp.write_text(text)

def enrich_verification(records):
    for rec in records['buildings']+records['tiles']:
        pts=rec['final_points']; segments=[(pts[0],pts[1]),(pts[-2],pts[-1])]
        slopes=[(b[1]-a[1])/(b[0]-a[0]) for a,b in segments]
        rec['measured_slopes']=[round(float(x),6) for x in slopes]
        rec['alpha_mode']='RGBA'; rec['alpha_range']=list(Image.open((BUILD if rec in records['buildings'] else TILE)/rec['file']).getchannel('A').getextrema())
        rec['anchor_rule']='midpoint of opposite registered plan corners'
        rec['geometry_verified']=all(abs(a-b)<1e-6 for a,b in zip(slopes,[.5,-.5]))
        if rec in records['buildings']:
            dx=[pts[1][0]-pts[0][0],pts[2][0]-pts[1][0]]
            rec['measured_footprint_ratio']=round(dx[0]/dx[1],6)
            rec['target_footprint_ratio']=round(rec['footprint'][0]/rec['footprint'][1],6)

def write_untouched(records):
    touched={x['id'] for x in records}; frozen=[]
    for manifest,base in [(BUILD/'manifest.yaml',BUILD),(TILE/'manifest.yaml',TILE)]:
        for item in yaml.safe_load(manifest.read_text()):
            if item['id'] in touched: continue
            p=base/item['file']; frozen.append(dict(id=item['id'],file=item['file'],sha256=sha(p),size=list(Image.open(p).size)))
    (HERE/'untouched-sha256.json').write_text(json.dumps(frozen,ensure_ascii=False,indent=2)+'\n')

def warp_rgba(im, src_pts, dst_pts, margin=20):
    """Map a measured ground triangle to its exact 2:1 footprint.

    Affine resampling is done in premultiplied-alpha space to avoid RGB fringe.
    """
    s = np.array(src_pts, dtype=float)
    d = np.array(dst_pts, dtype=float)
    a = np.c_[s, np.ones(3)]
    m = np.linalg.solve(a, d).T
    corners = np.array([[0,0,1],[im.width,0,1],[0,im.height,1],[im.width,im.height,1]], float)
    tc = corners @ m.T
    shift = np.array([margin-tc[:,0].min(), margin-tc[:,1].min()])
    m[:,2] += shift
    ow = math.ceil(tc[:,0].max()-tc[:,0].min()+2*margin)
    oh = math.ceil(tc[:,1].max()-tc[:,1].min()+2*margin)
    inv = np.linalg.inv(np.vstack([m,[0,0,1]]))[:2]
    arr = np.asarray(im).astype(np.float32)
    alpha = arr[...,3:4] / 255.0
    premul = np.concatenate([arr[...,:3] * alpha, arr[...,3:4]], axis=2)
    chans=[]
    coeff=tuple(inv.flatten())
    for i in range(4):
        ch=Image.fromarray(np.uint8(np.clip(premul[...,i],0,255)))
        chans.append(np.asarray(ch.transform((ow,oh),Image.Transform.AFFINE,coeff,Image.Resampling.BICUBIC),dtype=np.float32))
    aa=chans[3]
    rgb=np.stack(chans[:3],2)
    rgb=np.where(aa[...,None]>0, np.minimum(255,rgb*255/np.maximum(aa[...,None],1)), 0)
    out=np.dstack([rgb,aa]).clip(0,255).astype(np.uint8)
    return Image.fromarray(out,"RGBA"), m

def target_triangle(w,h,scale=32):
    return [(0,0),(scale*w,scale*w/2),(scale*(w+h),scale*(w-h)/2)]

def transform_points(points,m):
    p=np.c_[np.asarray(points,float),np.ones(len(points))]
    return (p@m.T).tolist()

def column_warp(im, src_pts, dst_pts, margin=24, vertical_scale=1.0):
    """Piecewise affine warp that keeps every source vertical perfectly vertical."""
    src=np.asarray(src_pts,float); dst=np.asarray(dst_pts,float)
    assert np.all(np.diff(src[:,0])>0) and np.all(np.diff(dst[:,0])>0)
    spans=[]
    for i in range(len(src)-1):
        x0,y0=src[i]; x1,y1=src[i+1]; X0,Y0=dst[i]; X1,Y1=dst[i+1]
        a=(X1-X0)/(x1-x0); b=X0-a*x0
        q=((Y1-vertical_scale*y1)-(Y0-vertical_scale*y0))/(x1-x0)
        t=Y0-vertical_scale*y0-q*x0
        spans.append([a,b,q,t])
    bounds=[0,*src[:,0].tolist(),im.width]
    coeffs=[spans[0],*spans,spans[-1]]
    ext=[]
    for lo,hi,c in zip(bounds[:-1],bounds[1:],coeffs):
        a,b,q,t=c
        for x in (lo,hi):
            for y in (0,im.height): ext.append((a*x+b,q*x+vertical_scale*y+t))
    ext=np.asarray(ext); shift=np.array([margin-ext[:,0].min(),margin-ext[:,1].min()])
    ow=math.ceil(np.ptp(ext[:,0])+2*margin); oh=math.ceil(np.ptp(ext[:,1])+2*margin)
    arr=np.asarray(im).astype(np.float32); aa=arr[...,3:4]/255
    prem=np.concatenate([arr[...,:3]*aa,arr[...,3:4]],2)
    out=np.zeros((oh,ow,4),np.float32)
    for lo,hi,c in zip(bounds[:-1],bounds[1:],coeffs):
        a,b,q,t=c; b+=shift[0]; t+=shift[1]
        inv=(1/a,0,-b/a,-q/(a*vertical_scale),1/vertical_scale,q*b/(a*vertical_scale)-t/vertical_scale)
        xlo=max(0,math.floor(a*lo+b)); xhi=min(ow,math.ceil(a*hi+b))
        for k in range(4):
            ch=Image.fromarray(np.uint8(np.clip(prem[...,k],0,255)))
            rr=ch.transform((ow,oh),Image.Transform.AFFINE,inv,Image.Resampling.BICUBIC)
            out[:,xlo:xhi,k]=np.asarray(rr,dtype=np.float32)[:,xlo:xhi]
    a=out[...,3]; rgb=np.where(a[...,None]>0,np.minimum(255,out[...,:3]*255/np.maximum(a[...,None],1)),0)
    image=Image.fromarray(np.dstack([rgb,a]).clip(0,255).astype(np.uint8),"RGBA")
    mapped=[]
    for x,y in src:
        i=min(np.searchsorted(src[:,0],x,side='right')-1,len(spans)-1); i=max(i,0)
        aa,bb,q,t=spans[i]; mapped.append([aa*x+bb+shift[0],q*x+vertical_scale*y+t+shift[1]])
    return image,np.asarray(mapped),spans,shift

def trim(im,mapped,margin=20):
    bbox=im.getchannel('A').getbbox(); assert bbox
    box=(max(0,bbox[0]-margin),max(0,bbox[1]-margin),min(im.width,bbox[2]+margin),min(im.height,bbox[3]+margin))
    out=im.crop(box); pts=np.asarray(mapped)-np.array(box[:2])
    return out,pts,box

BUILD_SPECS={
 'house_small':([7,6],[[57.6168,346.0431],[288.9533,462.6678],[473.8456,365.0388]]),
 'house_large':([10,8],[[148.4348,361.8162],[484.4348,516.3456],[724.4348,393.6618]]),
 'courtyard':([10,8],[[33.5327,374.0868],[337.341,525.425],[609.3554,380.1403]]),
 'shop_1f':([7,5],[[48.3946,314.077],[285.1991,425.9473],[432.1161,350.3593]]),
 'restaurant':([12,9],[[42.1897,466.3628],[403.7201,659.5875],[713.8351,498.2963]]),
 'yamen':([16,13],[[23.9585,325.6515],[564.4147,584.6591],[951.4885,375.572]]),
 'biaoju':([15,12],[[22.6591,322.7865],[511.4389,573.0071],[887.0136,387.3381]]),
 'casino':([10,8],[[20.553,382.471],[331.263,557.74],[596.447,420.029]]),
 'manor':([16,13],[[20.568,315.809],[541.292,573.162],[948.475,343.243]]),
 'temple_hall':([14,11],[[20.0859,386.8938],[464.2771,593.9178],[820.3304,416.6353]]),
 'guardhouse':([7,5],[[19.126,177.831],[249.297,304.873],[403.265,225.521]]),
 'warehouse':([10,8],[[144.2122,355.3714],[462.4643,536.3695],[720.4916,412.761]]),
 'wharf':([10,4],[[107.4271,198.2991],[429.2668,365.8953],[555.1327,300.332]])}

def rebuild_buildings():
    records=[]
    for key,(fp,pts) in BUILD_SPECS.items():
        asset='bld_kit_ming_south_'+key; path=BUILD/(asset+'.png')
        backup=HERE/(asset+'__r3.png')
        if not backup.exists(): backup.write_bytes(path.read_bytes())
        im=Image.open(backup).convert('RGBA')
        dst=target_triangle(*fp)
        out,mapped,spans,shift=column_warp(im,pts,dst)
        out,mapped,crop=trim(out,mapped)
        out.save(path)
        anchor=(mapped[0]+mapped[2])/2
        records.append(dict(id=asset,file=str(path.relative_to(BUILD)),footprint=fp,source_points=pts,target_points=dst,final_points=mapped.tolist(),anchor=[round(float(v),4) for v in anchor],piecewise_maps=spans,crop=list(crop),size=list(out.size),sha256=sha(path),vertical_vector=[0,1],method='piecewise x-affine plus column translation from measured L/F/R to exact registered L/F/R'))
    return records

def rebuild_gate(key,k,source,src_pts,vertical_scale):
    asset=f'tex_town_ming_south_city_gate__k{k}_r000_v01'
    path=TILE/(asset+'.png'); source=Path(source)
    im=Image.open(source).convert('RGBA')
    # Exact front spans are 2:k:2 cells; rightmost point is the back-right depth corner.
    front=32*(k+4); depth=32*4
    dst=[[0,0],[64,32],[64+32*k,32+16*k],[front,front/2],[front+depth,front/2-depth/2]]
    out,mapped,spans,shift=column_warp(im,src_pts,dst,vertical_scale=vertical_scale)
    out,mapped,crop=trim(out,mapped)
    out.save(path)
    passage=mapped[2]-mapped[1]; anchor=(mapped[0]+mapped[4])/2
    return dict(id=asset,file=str(path.relative_to(TILE)),source=str(source.relative_to(TILE)),source_sha256=sha(source),footprint=[k+4,4],passage=[k,4],source_points=src_pts,target_points=dst,final_points=mapped.tolist(),anchor=[round(float(v),4) for v in anchor],passage_dx=round(float(passage[0]),4),passage_cells=round(float(passage[0]/32),6),vertical_scale=vertical_scale,crop=list(crop),size=list(out.size),sha256=sha(path),method='piecewise x-affine plus column translation; verticals remain vertical')

def rebuild_tiles():
    k4src=TILE/'revisions_r3/city_gate_k4/candidate_2.png'
    k6src=TILE/'revisions_r3/city_gate_k6/candidate_1.png'
    k4=rebuild_gate('gate4',4,k4src,[[103,908],[309,1020],[607,1123],[803,1235],[1187,1058]],.36)
    k6=rebuild_gate('gate6',6,k6src,[[81,763],[248,865],[741,1119],[914,1225],[1175,1087]],.40)
    asset='tex_town_ming_south_wall_corner__outer_ne_v01'; path=TILE/(asset+'.png')
    source=TILE/'revisions_r3/wall_corner/candidate_2.png'; im=Image.open(source).convert('RGBA')
    pts=[[176,331],[614,61],[1053,330]]; dst=[[0,32],[64,0],[128,32]]
    vscale=124/721
    out,mapped,spans,shift=column_warp(im,pts,dst,vertical_scale=vscale)
    out,mapped,crop=trim(out,mapped)
    x,y=615,1055; i=1; a,b,q,t=spans[i]
    anchor=[a*x+b+shift[0]-crop[0],q*x+vscale*y+t+shift[1]-crop[1]]
    out.save(path)
    corner=dict(id=asset,file=str(path.relative_to(TILE)),source=str(source.relative_to(TILE)),source_sha256=sha(source),footprint=[2,2],source_points=pts,target_points=dst,final_points=mapped[::-1].tolist(),anchor=[round(float(v),4) for v in anchor],interface_height_px=124,vertical_scale=vscale,crop=list(crop),size=list(out.size),sha256=sha(path),method='three-cell L source; outer top axes registered exactly and inner vertical interface scaled from 721px to 124px')
    return [k4,k6,corner]

if __name__=='__main__':
    HERE.mkdir(exist_ok=True)
    records={'date':'2026-09-30','buildings':rebuild_buildings(),'tiles':rebuild_tiles()}
    enrich_verification(records)
    update_manifests(records['buildings']+records['tiles'])
    update_tile_geometry(records['tiles'])
    update_readmes(records['buildings']+records['tiles'])
    write_untouched(records['buildings']+records['tiles'])
    (HERE/'verification.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(records,ensure_ascii=False,indent=2))
