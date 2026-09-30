"""Splice only the review-3 palace manifest/preview entry; leave others verbatim."""
import html,json,re
from pathlib import Path
import yaml
R=Path(__file__).resolve().parent.parent
ids=['bld_kit_song_dali_wangfu']
class Dumper(yaml.SafeDumper):
    def ignore_aliases(self,data): return True
def bounded(path,text):
    lines=text.splitlines(True)
    with path.open('w') as f:
        for n in range(0,len(lines),50): f.writelines(lines[n:n+50])
manifest=R/'manifest.yaml';old=manifest.read_text();text=old
entries={i:json.loads((R/'meta'/(i+'.entry.json')).read_text()) for i in ids}
for i,e in entries.items():
    pattern=r'(?m)^- id: '+re.escape(i)+r'\n.*?(?=^- id: |\Z)'
    chunk=yaml.dump([e],Dumper=Dumper,allow_unicode=True,sort_keys=False,width=160,default_flow_style=None)
    text,n=re.subn(pattern,lambda m:chunk,text,flags=re.S);assert n==1,(i,n)
for m in re.finditer(r'(?m)^- id: (\S+)\n.*?(?=^- id: |\Z)',old,re.S):
    if m[1] not in ids: assert m[0] in text,m[1]
bounded(manifest,text)
preview=R/'preview.html';text=preview.read_text()
for i,e in entries.items():
    m=yaml.safe_load((R/e['metadata']).read_text());w,h=e['pixel_qa']['size'];ax,ay=e['building']['anchor']
    poly=' '.join(f'{x},{y}' for x,y in m['logical_footprint_polygon_px']);g=e['geometry_qa'];passed=g['axis_pass'] and g['ratio_pass']
    status='读点两项在建议容差内' if passed else '本轮明显问题已修；严格几何仍有小幅告警'
    new=f'''<article><h2>{html.escape(e['subject'])}</h2><code>{i}</code>
<div class="image"><img loading="lazy" src="{e['file']}" alt="{html.escape(e['subject'])}">
<svg viewBox="0 0 {w} {h}"><polygon points="{poly}" fill="none" stroke="#e8751d" stroke-width="3"/>
<circle cx="{ax}" cy="{ay}" r="5" fill="#0985ff"/></svg></div>
<p class="{'ok' if passed else 'warn'}">{status}</p>
<small>占地 {e['building']['footprint']} 格 · {w}×{h} RGBA · alpha {e['pixel_qa']['alpha_extrema']}<br>
轴斜率 {g['source_axis_slopes'][0]:+.3f} / {g['source_axis_slopes'][1]:+.3f} · 宽深比误差 {g['ratio_relative_error']:.1%}</small>
<a href="{e['file']}">原尺寸成品</a> · <a href="{e['processing']['source_archive']}">生成原图</a> · <a href="{e['metadata']}">元数据</a>
<details><summary>审图记录</summary><p>{html.escape(e['notes'])}</p></details></article>'''
    pattern=r'<article>(?:(?!</article>).)*<code>'+re.escape(i)+r'</code>.*?</article>'
    text,n=re.subn(pattern,lambda match:new,text,flags=re.S);assert n==1,(i,n)
bounded(preview,text)
print('Updated 1 manifest stanza and 1 preview article; others preserved verbatim.')
