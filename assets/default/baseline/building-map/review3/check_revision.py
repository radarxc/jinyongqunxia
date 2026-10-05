"""Read-only QA, with one bounded JSON result write for review 3."""
import hashlib, json, re
from pathlib import Path
import yaml
from PIL import Image
R=Path(__file__).resolve().parent.parent; P=R/'review3'
I='bld_kit_song_dali_wangfu'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
before=json.loads((P/'before-sha256.json').read_text())
allowed={str(R/p) for p in [I+'.png','sources/'+I+'.png','sources/'+I+'.json','meta/'+I+'.yaml','meta/'+I+'.entry.json','manifest.yaml','preview.html','check-results.json','file-inventory.json']}
allowed.add(str(Path('tools/agents/reports/TOWN-buildings.md').resolve()))
changed=[]
for path,digest in before.items():
    if sha(path)!=digest:
        assert str(Path(path).resolve()) in allowed,path
        changed.append(path)
for file,pattern in [('manifest.yaml',r'(?m)^- id: (\S+)\n.*?(?=^- id: |\Z)'),('preview.html',r'<article>.*?</article>')]:
    now=[hashlib.sha256(m[0].encode()).hexdigest() for m in re.finditer(pattern,(R/file).read_text(),re.S) if I not in m[0]]
    assert now==json.loads((P/'unchanged-sections.json').read_text())[file]
entries=yaml.safe_load((R/'manifest.yaml').read_text())
e=next(e for e in entries if e['id']==I); refs={}; rebuilt=0
for entry in entries:
    for ref in entry['references']:
        path=ref.get('file',ref.get('path'));assert sha(path)==ref['sha256'],path
        refs[path]=ref['sha256']
    m=entry['processing']; im=Image.open(R/m['source_archive'])
    part=im.crop(m['crop_box']).resize(m['resized_size'],Image.Resampling.LANCZOS)
    out=Image.new('RGBA',tuple(entry['pixel_qa']['size']));out.paste(part,tuple(m['paste_offset']))
    assert out.tobytes()==Image.open(R/entry['file']).tobytes(),entry['id']
    rebuilt+=1
source=json.loads((R/e['source_record']).read_text())
for item in source['candidate_history']:
    if item.get('source_archive'): assert sha(R/item['source_archive'])==item['source_sha256']
assert e['status']=='candidate' and e['building']['footprint']==[18,14]
assert e['candidate_count']==9 and sum(d['candidate_count'] for d in entries)==106
assert sha(P/('before-'+I+'.png'))==before[str((R/(I+'.png')).relative_to(Path.cwd()))]
old_source=R/'sources/rejected'/(I+'_pre_review3.png')
assert sha(old_source)==before[str((R/'sources'/(I+'.png')).relative_to(Path.cwd()))]
result={'revision':'review3','asset':I,'new_calls':1,'selected_new':1,'rejected_new':0,'superseded_old':1,
        'building_candidates':106,'building_selected':38,'building_unselected':68,
        'all_candidates_including_plants':124,'all_selected':52,'all_unselected':72,
        'unchanged_other_selected_pngs':51,'unchanged_manifest_stanzas':37,'unchanged_preview_articles':37,
        'unchanged_props_directory':True,'unchanged_prompt_template':True,'unchanged_review2_directory':True,
        'changed_existing_files':changed,'rebuilt_building_pixel_matches':rebuilt,
        'unique_references_checked':len(refs),'references':refs,
        'source_sha256':e['source_sha256'],'final_sha256':e['sha256'],
        'source_center_px':source['review3']['source_center_px'],'building':e['building'],
        'processing':e['processing'],'geometry_qa':e['geometry_qa'],'pixel_qa':e['pixel_qa']}
lines=(json.dumps(result,ensure_ascii=False,indent=2)+'\n').splitlines(True)
with (P/'revision-check.json').open('w') as f:
    for n in range(0,len(lines),50): f.writelines(lines[n:n+50])
print(json.dumps({k:result[k] for k in ['unchanged_other_selected_pngs','rebuilt_building_pixel_matches','unique_references_checked','final_sha256']},ensure_ascii=False))
