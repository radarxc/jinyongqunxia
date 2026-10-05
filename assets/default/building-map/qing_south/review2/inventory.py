from pathlib import Path
import hashlib,json
root=Path(__file__).parent.parent; out=root/'review2/file-inventory.json'
paths=sorted({p for base in [root,Path('assets/default/tile/qing_south')] for p in base.rglob('*') if p.is_file() and p!=out})
paths += [Path('assets/default/prompts/building-map.md'),Path('assets/default/prompts/tile.md'),Path('tools/agents/reports/KIT-qing_south.md')]
rows=[]
for p in paths:
 b=p.read_bytes()
 try: lines=len(b.decode('utf-8').splitlines())
 except UnicodeDecodeError: lines=None
 rows.append({'file':str(p),'bytes':len(b),'lines':lines,'sha256':hashlib.sha256(b).hexdigest()})
text='[\n'+',\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+'\n]\n'; lines=text.splitlines(True)
assert not out.exists(), 'new revision inventory only; never rewrite existing inventory'
for i in range(0,len(lines),45):
 with out.open('w' if i==0 else 'a') as f: f.writelines(lines[i:i+45])
print(len(rows),'files;',len(lines),'inventory lines; writes <=45 lines')
