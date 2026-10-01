from pathlib import Path
import yaml,json,datetime
root=Path(__file__).parent.parent; file=root/'manifest.yaml'; lines=file.read_text().splitlines(True)
data=yaml.safe_load(file.read_text()); nodes=yaml.compose(file.read_text()).value; req=json.loads((root/'review2/requests.json').read_text()); patches=[]
def patch(key,val,node,aid,indent=2):
    pair=next((v for k,v in node.value if k.value==key),None)
    kn=next(k for k,v in node.value if k.value==key)
    # Node end can coincide with next key; full old value ends there.
    start=kn.start_mark.line; end=pair.end_mark.line+(pair.end_mark.column>indent)
    old=''.join(lines[start:end]); new=' '*indent+key+': '+json.dumps(val,ensure_ascii=False)+'\n'
    changes=['-'+s for s in old.splitlines()]+['+'+new.rstrip('\n')]
    p='*** Begin Patch\n*** Update File: '+str(file)+'\n@@ - id: '+aid+'\n'+'\n'.join(changes)+'\n*** End Patch'
    assert len(p.splitlines())<=50,(key,len(p.splitlines())); patches.append(p)
for k in (4,6):
 aid=f'tex_town_qing_south_city_gate__k{k}_r000_v01'; idx=next(i for i,e in enumerate(data) if e['id']==aid); node=nodes[idx]
 r=json.loads((root/f'review2/gate_k{k}_measurement.json').read_text()); q=req[f'gate{k}'][1]; gen=q['result'].split(' as ')[1].split(' by default')[0]
 values={name:r[name] for name in ['size','sha256','source_sha256','source_copy','anchor_px']}
 values.update(prompt=q['prompt'],references=[str(root/p) for p in q['references']],source_path=gen,created=datetime.datetime.now(datetime.timezone.utc).isoformat(),tool='built-in image_gen',notes='第2轮几何返修；每门2候选选第2；PIL仅裁切等比缩放透明留边。实测几何仍不完全满足4格进深/净宽，不可release；详见review2/gate_k'+str(k)+'_measurement.json。')
 for key,val in values.items(): patch(key,val,node,aid)
 geom=next(v for key,v in node.value if key.value=='geometry'); ax,ay=r['anchor_px']; w=k+4
 polygon=[[ax-16*(w+4),ay+8*(4-w)],[ax+16*(w-4),ay+8*(w+4)],[ax+16*(w+4),ay+8*(w-4)],[ax+16*(4-w),ay-8*(w+4)]]
 vals={x:r[x] for x in ['source_anchor_px','crop_box','uniform_scale','padding_px']}
 vals.update(anchor_basis='源底面左右角中点，经同一裁切等比缩放换算；测点±5源px',footprint_polygon_target_px=polygon,validation='geometry revision attempted; strict gate footprint and passage still failed')
 for key,val in vals.items(): patch(key,val,geom,aid,4)
 # Append compact QA ahead of unique note; unchanged other tile blocks stay byte-identical.
 patches.append('*** Begin Patch\n*** Update File: '+str(file)+'\n@@ - id: '+aid+'\n+  geometry_qa: '+json.dumps(r['geometry_qa'],ensure_ascii=False)+'\n   notes: '+json.dumps(values['notes'],ensure_ascii=False)+'\n*** End Patch')
(root/'review2/manifest-patches.json').write_text(json.dumps(patches,ensure_ascii=False)+'\n')
print(len(patches),'patches, maximum',max(len(p.splitlines()) for p in patches),'lines')
