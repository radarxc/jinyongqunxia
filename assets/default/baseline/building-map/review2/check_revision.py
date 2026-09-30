"""Verify the 14-asset repair and byte preservation of all other old files."""
import hashlib,json
from pathlib import Path
import yaml
from PIL import Image,ImageChops
R=Path(__file__).resolve().parent.parent; W=Path.cwd()
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
ids=['bld_kit_song_dali_'+s for s in ['yamen','wangfu','stable','wharf']]
ids+=['bld_kit_song_southern_'+s for s in ['shop_2f','inn','restaurant','yamen','biaoju','casino','manor','guardhouse','stable','wharf']]
before=json.loads((R/'review2'/'before-sha256.json').read_text())
entries=yaml.safe_load((R/'manifest.yaml').read_text()); errors=[];rows=[]
for e in entries:
    path=R/e['file']; ident=e['id']
    if ident not in ids:
        assert sha(path)==before[str(path.relative_to(W))]
        continue
    assert sha(path)!=before[str(path.relative_to(W))]
    p=e['processing']; im=Image.open(R/p['source_archive']);out=Image.new('RGBA',tuple(e['pixel_qa']['size']),(0,0,0,0))
    cut=im.crop(p['crop_box']).resize(p['resized_size'],Image.Resampling.LANCZOS)
    out.paste(cut,tuple(p['paste_offset']))
    assert out.tobytes()==Image.open(path).tobytes(),ident
    for ref in e['references']:
        f=Path(ref.get('file',ref.get('path',''))); assert f.is_file() and sha(f)==ref['sha256'],(ident,ref)
    rows.append({'id':ident,'sha256':sha(path),'source_sha256':sha(R/p['source_archive']),'size':e['size'],'alpha':e['pixel_qa']['alpha_extrema'],'anchor':e['building']['anchor'],'candidate_count':e['candidate_count'],'axis_slopes':e['geometry_qa']['source_axis_slopes'],'ratio_relative_error':e['geometry_qa']['ratio_relative_error'],'strict_pass':e['geometry_qa']['axis_pass'] and e['geometry_qa']['ratio_pass']})
assert len(rows)==14
changed=[]
shared=['manifest.yaml','preview.html','check-results.json','file-inventory.json']
for k,v in before.items():
    f=W/k
    if sha(f)==v: continue
    changed.append(k)
    allowed=any(ident in f.name for ident in ids) or f.name in shared or k=='tools/agents/reports/TOWN-buildings.md'
    assert allowed,k
assert all(sha(W/k)==v for k,v in before.items() if '/props/' in k)
print(json.dumps({'repaired':rows,'preserved_buildings':24,'preserved_plants':14,'old_files_changed':changed,'geometry_strict_pass_count':sum(x['strict_pass'] for x in rows),'geometry_warning_count':sum(not x['strict_pass'] for x in rows)},ensure_ascii=False,indent=2))
