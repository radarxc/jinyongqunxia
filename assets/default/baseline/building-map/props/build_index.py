#!/usr/bin/env python3
"""Native plant preview; overlays are HTML/SVG and never modify PNG pixels."""
import html
from pathlib import Path
import yaml

ROOT=Path(__file__).resolve().parent
entries=yaml.safe_load((ROOT/'manifest.yaml').read_text())
assert len(entries)==14
header='''<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>植物候选 · 7类14变体</title><style>
body{font:15px system-ui;margin:24px;background:#eee9df;color:#242520}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
article{border:1px solid #bbb;padding:14px;background:white;border-radius:8px}
.picture{height:300px;position:relative;background:var(--back,#d8dfcb)}
img,svg{width:100%;height:100%;position:absolute;object-fit:contain}
svg{display:none;pointer-events:none}.show svg{display:block}code{font-size:12px;overflow-wrap:anywhere}
small{display:block;line-height:1.6;margin:12px 0}h2{font-size:17px}button{margin:12px}
</style><h1>植物候选 · 7类14变体</h1>
<p>最新design/22 §4.4补项；均candidate，历史植物意象待考。图片为原生尺寸，预览放大显示。
蓝点是固定根锚，橙线以下必须透明；实际测得根与锚点的偏差另列。无碰撞，接触影交运行时。</p>
<label><input id="overlay" type="checkbox">显示根锚</label>
<button data-color="#d8dfcb">草灰底</button><button data-color="#fff">白底</button>
<button data-color="#242424">深底</button><p><a href="../preview.html">返回38件建筑</a></p><main>'''
with (ROOT/'preview.html').open('w') as f:
    f.write(header)
    for e in entries:
        w,h=e['pixel_qa']['size_px']; ax,ay=e['anchor_px']
        block=f'''<article><h2>{html.escape(e['subject'])}</h2><code>{e['id']}</code>
<div class="picture"><img src="{e['file']}" alt="{html.escape(e['subject'])}">
<svg viewBox="0 0 {w} {h}"><path d="M0,{ay}H{w}" stroke="#d57926" stroke-width="0.5"/>
<circle cx="{ax}" cy="{ay}" r="2" fill="#0861e8"/></svg></div>
<small>{w}×{h} RGBA · alpha {e['pixel_qa']['alpha_extrema']} · 根锚{e['anchor_px']}<br>
实测根偏差{e['processing']['root_offset_px']}px；锚下alpha最大{e['pixel_qa']['alpha_below_anchor_max']}</small>
<a href="{e['file']}">原尺寸</a> · <a href="{e['processing']['source_archive']}">生成原图</a> ·
<a href="{e['metadata']}">元数据</a><details><summary>审图记录</summary>{html.escape(e['notes'])}</details></article>'''
        f.write(block)
    f.write('''</main><script>
document.querySelector('#overlay').addEventListener('change',e=>document.body.classList.toggle('show',e.target.checked));
document.querySelectorAll('button[data-color]').forEach(b=>b.addEventListener('click',()=>document.body.style.setProperty('--back',b.dataset.color)));
</script></html>''')
print('plant preview:',len(entries))
