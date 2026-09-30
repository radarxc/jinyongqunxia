#!/usr/bin/env python3
"""Assemble manifest and an HTML-only QA index. Does not change image pixels."""
import html
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent


class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def main():
    catalog = json.loads((ROOT/'catalog.json').read_text())
    entries = [json.loads((ROOT/'meta'/f"{row['id']}.entry.json").read_text()) for row in catalog]
    assert len(entries) == 38 and len({e['id'] for e in entries}) == 38
    # One entry per write: bounded chunks, top-level YAML sequence.
    with (ROOT/'manifest.yaml').open('w') as stream:
        for entry in entries:
            chunk = yaml.dump([entry], Dumper=NoAliasDumper, allow_unicode=True,
                              sort_keys=False, width=160, default_flow_style=None)
            for start in range(0, len(chunk.splitlines(True)), 120):
                stream.writelines(chunk.splitlines(True)[start:start+120])
    header = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>宋套件 · 38 张候选 · TOWN-buildings</title>
<style>
body{font:15px system-ui;margin:24px;background:#eee9df;color:#292621}
header{max-width:1100px;margin:auto}h1{font-size:26px}button,label{margin-right:16px}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:20px;margin-top:24px}
article{background:white;border:1px solid #c7c1b6;border-radius:8px;overflow:hidden;padding:14px}
.image{height:360px;position:relative;background:var(--back,#d8dfcb)}
.image img,.image svg{position:absolute;width:100%;height:100%;object-fit:contain}
.image svg{pointer-events:none;display:none}.show .image svg{display:block}
h2{font-size:17px}code{overflow-wrap:anywhere;font-size:12px}.warn{color:#943d17}.ok{color:#245d38}
small{display:block;margin:8px 0;line-height:1.6}p{line-height:1.65}
</style><header><h1>宋套件 · 38 张候选</h1>
<p>大理 1093 / 临安 1223。图片均为候选，未批准发布。橙线是目录理想占地，蓝点是底面中心；不把理想线冒充已测轮廓。
单视图锁定 45°。地面基准 64×32；画布留白不计入占地。点击原图查看文件真实像素。</p>
<label><input id="overlay" type="checkbox"> 显示锚点与理想占地</label>
<button data-color="#d8dfcb">草灰底</button><button data-color="#fff">白底</button>
<button data-color="#242424">深底</button><p id="count"></p>
<p>收尾新增：<a href="props/preview.html">7类植物 · 14变体审图</a>（原生小尺寸，独立清单与根锚）。</p></header><main>'''
    with (ROOT/'preview.html').open('w') as stream:
        stream.write(header)
        for e in entries:
            meta = yaml.safe_load((ROOT/e['metadata']).read_text())
            w, h = e['pixel_qa']['size']; ax, ay = e['building']['anchor']
            poly = ' '.join(f'{x},{y}' for x,y in meta['logical_footprint_polygon_px'])
            g = e['geometry_qa']; passed = g['axis_pass'] and g['ratio_pass']
            status = '读点两项在建议容差内' if passed else '几何残差待修，不可发布'
            line = f'''<article><h2>{html.escape(e['subject'])}</h2><code>{e['id']}</code>
<div class="image"><img loading="lazy" src="{e['file']}" alt="{html.escape(e['subject'])}">
<svg viewBox="0 0 {w} {h}"><polygon points="{poly}" fill="none" stroke="#e8751d" stroke-width="3"/>
<circle cx="{ax}" cy="{ay}" r="5" fill="#0985ff"/></svg></div>
<p class="{'ok' if passed else 'warn'}">{status}</p>
<small>占地 {e['building']['footprint']} 格 · {w}×{h} RGBA · alpha {e['pixel_qa']['alpha_extrema']}<br>
轴斜率 {g['source_axis_slopes'][0]:+.3f} / {g['source_axis_slopes'][1]:+.3f} · 宽深比误差 {g['ratio_relative_error']:.1%}</small>
<a href="{e['file']}">原尺寸成品</a> · <a href="{e['processing']['source_archive']}">生成原图</a> · <a href="{e['metadata']}">元数据</a>
<details><summary>审图记录</summary><p>{html.escape(e['notes'])}</p></details></article>'''
            stream.write(line)
        stream.write('''</main><script>
document.querySelector('#overlay').addEventListener('change',e=>document.body.classList.toggle('show',e.target.checked));
document.querySelectorAll('button[data-color]').forEach(b=>b.addEventListener('click',()=>document.body.style.setProperty('--back',b.dataset.color)));
document.querySelector('#count').textContent='38 / 38 条目齐全；文件校验与光学几何验收分别登记。';
</script></html>''')
    print('manifest and HTML index:', len(entries))


if __name__ == '__main__':
    main()
