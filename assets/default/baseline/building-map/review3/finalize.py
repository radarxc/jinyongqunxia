"""Only archive and normalize the review-3 Dali palace replacement."""
import datetime, hashlib, importlib.util, json, re, shutil
from pathlib import Path
from PIL import Image
R=Path(__file__).resolve().parent.parent
P=R/'review3'; I='bld_kit_song_dali_wangfu'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def bounded(path,text):
    lines=text.splitlines(True)
    with Path(path).open('w') as f:
        for n in range(0,len(lines),50): f.writelines(lines[n:n+50])
def write(path,data): bounded(path,json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def main():
    src=R/'sources'/I; archive=R/'sources'/'rejected'/(I+'_pre_review3')
    assert not archive.with_suffix('.png').exists(), 'Already finalized; do not rerun'
    old=json.loads(src.with_suffix('.json').read_text())
    for ext in ['.png','.json']: shutil.copy2(src.with_suffix(ext),archive.with_suffix(ext))
    for path in [R/(I+'.png'),R/'meta'/(I+'.yaml'),R/'meta'/(I+'.entry.json')]:
        shutil.copy2(path,P/('before-'+path.name))
    shutil.copy2(R/'check-results.json',P/'before-check-results.json')
    chunks={}
    for file,pattern in [('manifest.yaml',r'(?m)^- id: (\S+)\n.*?(?=^- id: |\Z)'),('preview.html',r'<article>.*?</article>')]:
        chunks[file]=[hashlib.sha256(m[0].encode()).hexdigest() for m in re.finditer(pattern,(R/file).read_text(),re.S) if I not in m[0]]
    write(P/'unchanged-sections.json',chunks)
    call=json.loads((P/'generation-call.json').read_text())
    reason='第2轮审核：蓝灰亮瓦、橙黄木柱、描边及鲜亮花木造成模型感；本轮材质返修淘汰。'
    for item in old.get('candidate_history',[]):
        if item.get('status')=='selected':
            item.update(status='rejected',source_archive=str(archive.with_suffix('.png').relative_to(R)),reason=reason)
    refs=[]
    roles=['编辑目标；只保留院落与占地方向，旧材质已淘汰','同批通过审核的大理衙门；灰瓦、粗糙土石与木材参考','同批通过审核的大理庄园；自然木色、旧瓦与克制花木参考','approved宋构基线；仅物理材质，不继承摄影透视或寺院题材']
    for n,input_file in enumerate(call['referenced_image_paths']):
        path=archive.with_suffix('.png') if n==0 else Path(input_file)
        refs.append({'file':str(path.relative_to(Path.cwd())),'input_file':input_file,'sha256':sha(path),'role':roles[n],'status':'rejected' if n==0 else ('approved' if n==3 else 'candidate')})
    shutil.copy2(call['source_path'],src.with_suffix('.png'))
    im=Image.open(src.with_suffix('.png'));a=im.getchannel('A');h=a.histogram()
    p={'left':[29,559],'front':[871,998],'right':[1515,648]}
    old.update(prompt=call['prompt'],references=refs,source_path=call['source_path'],source_sha256=sha(src.with_suffix('.png')),created=datetime.datetime.now(datetime.timezone.utc).isoformat(),candidate_count=old['candidate_count']+1)
    old.update(negative='文字、水印、现代物、人物、背景、厚底台、亮橙柱、蓝亮瓦、描边、塑料/卡通/微缩模型、鲜亮花木、透视汇聚、裁切',source_size=list(im.size),source_alpha={'mode':im.mode,'range':list(a.getextrema()),'transparent_pixels':h[0],'partial_pixels':sum(h[1:255]),'opaque_pixels':h[255],'bbox':list(a.getbbox())})
    old.update(footprint_corners_source_px=p,ground_edges_source_px=[[p['left'],p['front']],[p['front'],p['right']]])
    old['projection_review']='第3次运行读可见外石沿接地点±3px；保留原18×14及长短边方向，右轴略陡仍触发strict告警；不以理想点代替实测，不warp。'
    old['visual_review']='第3次运行主代理及独立复核：旧版亮橙柱、蓝灰亮瓦、硬描边和鲜亮花木已淘汰；新图哑光棕木、低饱和灰陶瓦、粗糙土石墙及克制暗绿山茶与大理衙门/庄园材质一致，宋构approved基线仅作材质参考。主体完整，左上光/右下接触影，无字无人无现代物；右轴strict残差保留，形制待考，仍candidate。'
    old['candidate_history'].append({'phase':'review3','attempt':1,'status':'selected','source_archive':str(src.with_suffix('.png').relative_to(R)),'source_path':call['source_path'],'source_sha256':old['source_sha256'],'reason':'材质专项复核入选；旧版风格淘汰原因及原始记录见pre_review3归档。'})
    old['review3']={'calls':1,'selected_new':1,'rejected_new':0,'replaced_previous':1,'previous_source_record':str(archive.with_suffix('.json').relative_to(R)),'previous_final':str((P/('before-'+I+'.png')).relative_to(R)),'source_center_px':[(p['left'][i]+p['right'][i])/2 for i in (0,1)]}
    write(src.with_suffix('.json'),old)
    original=Path.write_text
    Path.write_text=lambda self,text,*args,**kwargs: bounded(self,text)
    try:
        spec=importlib.util.spec_from_file_location('town_normalize',R/'normalize.py')
        mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        print(mod.normalize(src.with_suffix('.json')))
    finally: Path.write_text=original
if __name__=='__main__': main()
