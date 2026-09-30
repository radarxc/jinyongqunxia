"""Archive root-owned image_gen candidates and update only two reviewed assets."""
import datetime, hashlib, json, shutil
from pathlib import Path
from PIL import Image
P=Path(__file__).resolve().parent; R=P.parent
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,d):
    lines=json.dumps(d,ensure_ascii=False,indent=2).splitlines(True)
    with Path(p).open('w') as f:
        for i in range(0,len(lines),50): f.writelines(lines[i:i+50])
runs=json.loads((P/'root-generation.json').read_text())
corners={'stable':[[226,653],[879,976],[1373,738]],'wharf':[[30,396],[1055,939],[1468,715]]}
for kind in ['stable','wharf']:
    ident='bld_kit_song_southern_'+kind; src=R/'sources'/ident
    old=json.loads(src.with_suffix('.json').read_text())
    archive=R/'sources'/'rejected'/(ident+'_pre_review2')
    assert not archive.with_suffix('.png').exists(), 'Already archived: do not rerun finalization'
    for ext in ['.png','.json']: shutil.copy2(src.with_suffix(ext),archive.with_suffix(ext))
    group=[d.copy() for d in runs if d['id']==ident]
    paths={}
    for d in group:
        target=src.with_suffix('.png') if d['selected'] else R/'sources'/'rejected'/(ident+'_review2_'+str(d['sequence'])+'.png')
        shutil.copy2(d['source_path'],target);d['saved_path']=str(target);d['source_sha256']=sha(target);paths[Path(d['source_path']).name]=str(target)
    hist=old.get('candidate_history',[])+[{'source_path':old['source_path'],'source_sha256':old['source_sha256'],'saved_path':str(archive.with_suffix('.png')),'selection':'unselected','reason':'第1轮审核：底面宽深比例不合格；原记录保存在同名.json。','prompt':old['prompt'],'references':old['references']}]
    for d in group:
        ref=d['ref'];rf=None
        if ref=='guide': rf=P/('southern_'+kind+'_geometry_guide.png')
        elif ref=='old': rf=archive.with_suffix('.png')
        elif ref: rf=Path(paths[ref])
        d['references']=[] if rf is None else [{'file':str(rf),'sha256':sha(rf),'role':'占地线框几何参考；不作资产像素合成' if ref=='guide' else '本轮前候选；仅image_gen编辑参考'}]
        d['selection']='selected' if d['selected'] else 'unselected'
        if d['selected']: selected=d
        else: hist.append(d)
    im=Image.open(src.with_suffix('.png'));p=dict(zip(['left','front','right'],corners[kind]))
    old.update({k:selected[k] for k in ['prompt','references','source_path','source_sha256']})
    old.update(created=datetime.datetime.now(datetime.timezone.utc).isoformat(),candidate_count=old['candidate_count']+len(group),candidate_history=hist,source_dimensions=list(im.size),alpha_extrema=list(im.getchannel('A').getextrema()),footprint_corners_source_px=p,ground_edges_source_px=[[p['left'],p['front']],[p['front'],p['right']]])
    old['visual_review']=selected['reason']+' 宋式灰瓦木构/灰石材质、左上光、无字无人无现代物，真实alpha，主体完整。底面读点来自实际接触边，未warp/拉伸；64×32叠合图另存review2。'
    old['review2']={'calls':len(group),'rejected_new':len(group)-1,'previous_source_record':str(archive.with_suffix('.json')),'overlay':'review2/'+ident+'_overlay.png','visual_result':'修复点名的明显比例问题；细小残差见geometry_qa'}
    write(src.with_suffix('.json'),old)
    write(P/(ident+'_calls.json'),group)
    print(ident,old['candidate_count'],im.size,p)
