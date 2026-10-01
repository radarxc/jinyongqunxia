from pathlib import Path
import yaml,json,sys
root=Path(__file__).parent.parent
names=sys.argv[1:]; patches=[]
for file in [root/'manifest.yaml',root/'manifest-domestic.yaml',root/'manifest-civic.yaml']:
 lines=file.read_text().splitlines(True); data=yaml.safe_load(file.read_text()); nodes=yaml.compose(file.read_text()).value
 if isinstance(data,dict): raise ValueError('expected sequence')
 for short in names:
  aid='bld_kit_qing_south_'+short; target=root/'meta'/f'{aid}.entry.yaml'
  if not target.exists(): raise ValueError(str(target))
  desired=yaml.safe_load(target.read_text()); idx=next((i for i,e in enumerate(data) if e['id']==aid),None)
  if idx is None: continue
  node=nodes[idx]; current=data[idx]
  for key,val in desired.items():
   if current.get(key)==val: continue
   new='  '+key+': '+json.dumps(val,ensure_ascii=False)
   pair=next(((kn,vn) for kn,vn in node.value if kn.value==key),None)
   if pair:
    kn,vn=pair; end=vn.end_mark.line+(vn.end_mark.column>2)
    old=''.join(lines[kn.start_mark.line:end]).rstrip('\n')
    change='\n'.join('-'+s for s in old.splitlines())+'\n+'+new
    p='*** Begin Patch\n*** Update File: '+str(file)+'\n@@ - id: '+aid+'\n'+change+'\n*** End Patch'
   else:
    p='*** Begin Patch\n*** Update File: '+str(file)+'\n@@\n - id: '+aid+'\n+'+new+'\n*** End Patch'
   assert len(p.splitlines())<=50,(file,aid,key,len(p.splitlines()))
   patches.append(p)
(root/'review2/integration-patches.json').write_text(json.dumps(patches,ensure_ascii=False)+'\n')
print(len(patches),'patches; max',max((len(p.splitlines()) for p in patches),default=0),'lines')
