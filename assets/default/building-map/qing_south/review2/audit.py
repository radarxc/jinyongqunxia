from pathlib import Path
from PIL import Image
import hashlib,json,yaml
root=Path(__file__).parent.parent; roots=[root,Path('assets/default/tile/qing_south')]; sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest(); assets=[]; problems=[]
for base in roots:
 for e in yaml.safe_load((base/'manifest.yaml').read_text()):
  p=base/e['file']; im=Image.open(p); a=im.getchannel('A'); box=a.getbbox(); size=f'{im.width}x{im.height}'
  borders=[a.crop((0,0,im.width,1)),a.crop((0,im.height-1,im.width,im.height)),a.crop((0,0,1,im.height)),a.crop((im.width-1,0,im.width,im.height))]; border=max(x.getextrema()[1] for x in borders)
  q=e.get('geometry_qa',{}); footprint=e.get('building',e.get('tile'))['footprint']; anchor=e.get('building',{}).get('anchor',e.get('anchor_px'))
  r={'id':e['id'],'size':size,'footprint':footprint,'alpha':a.getextrema(),'border_alpha_max':border,'axis_pass':q.get('axis_pass'),'ratio_pass':q.get('ratio_pass')}; assets.append(r)
  if e['sha256']!=sha(p) or e['size']!=size or im.mode!='RGBA' or a.getextrema()!=(0,255) or border or not (0<=anchor[0]<im.width and 0<=anchor[1]<im.height): problems.append(e['id'])
  source=e.get('source_copy',e.get('source_path')); source=Path(source) if source.startswith('/') else base/source
  if not source.exists() or sha(source)!=e['source_sha256']: problems.append(e['id']+':source')
  for ref in e.get('references',[]):
   rp=Path(ref['file'] if isinstance(ref,dict) else ref)
   if not rp.exists() or (isinstance(ref,dict) and ref.get('sha256') and sha(rp)!=ref['sha256']): problems.append(e['id']+':reference')
  if 'building' in e:
   m=yaml.safe_load((base/e['metadata']).read_text())
   if m['building']!=e['building'] or m['geometry_qa']!=q: problems.append(e['id']+':metadata')
b=assets[:19]; result={'date':'2026-09-30','round':2,'png_count':len(assets),'problems':problems,'building_axis_pass':sum(bool(x['axis_pass']) for x in b),'building_ratio_pass':sum(bool(x['ratio_pass']) for x in b),'building_both_pass':sum(bool(x['axis_pass'] and x['ratio_pass']) for x in b),'geometry_limits':'candidate; failed geometry remains explicitly recorded','assets':assets}
(root/'review2/audit.json').write_text(json.dumps(result,ensure_ascii=False)+'\n'); print(json.dumps({k:v for k,v in result.items() if k!='assets'},ensure_ascii=False))
