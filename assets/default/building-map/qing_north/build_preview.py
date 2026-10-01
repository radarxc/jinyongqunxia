#!/usr/bin/env python3
"""Build a local, network-free review page; sprites themselves are not edited."""
import html
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent
TILES = ROOT.parent.parent / 'tile/qing_north'


def main():
    rows = []
    for base, prefix in [(ROOT, ''), (TILES, '../../tile/qing_north/')]:
        for e in yaml.safe_load((base / 'manifest.yaml').read_text()):
            identity = html.escape(e['id'])
            path = html.escape(prefix + e['file'], quote=True)
            spec = e.get('building', e.get('tile', {}))
            footprint = '×'.join(map(str, spec['footprint']))
            anchor = spec.get('anchor', e.get('anchor_px'))
            warning = '精确投影仍需复核'
            qa = e.get('geometry_qa', {})
            if qa.get('axis_pass') and qa.get('ratio_pass'):
                warning = '测点通过本批几何阈值，仍非发布批准'
            rows.append(f'<article data-id="{identity}"><a href="{path}"><div class="sprite"><img src="{path}" alt="{identity}" loading="lazy"></div></a><h2>{identity}</h2><p>占地 {footprint} · {e["size"]} px · candidate</p><p>底心 / 根锚 {anchor}</p><p>{warning}</p></article>')
    head = '''<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>清 · 北方套件 · 26件候选</title>
<style>
:root{font-family:system-ui,sans-serif;color:#322d25;background:#f7f4eb;--surface:#e8e1d2}
body{max-width:1500px;margin:32px auto;padding:0 20px}h1{font-size:28px}p{line-height:1.6}
header{position:sticky;top:0;background:#f7f4ebef;padding:12px 0;z-index:1}button,input{padding:9px;margin:3px;border:1px solid #bbb09a;border-radius:4px}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}
article{background:white;border:1px solid #d6ccbb;padding:10px;border-radius:8px}h2{font-size:13px;overflow-wrap:anywhere}article p{font-size:12px;margin:5px}
.sprite{height:330px;display:flex;align-items:center;justify-content:center;background:var(--surface);overflow:hidden}.sprite img{max-width:100%;max-height:100%;object-fit:contain}
body.checker .sprite{background:repeating-conic-gradient(#dedede 0% 25%,#f7f7f7 0% 50%) 50%/20px 20px}
[hidden]{display:none}a{color:inherit}
</style>
<header><h1>清 · 北方套件</h1><p>19建筑 + 7贴片 · 点击查看原生尺寸PNG。此页按卡片缩放，仅供画风/透明边缘审查，不作等尺度城镇总装。</p>
<p>8/19建筑存在当前阈值下的双轴或宽深比告警；门洞净宽只登记逻辑规格，逐像素通道对格与多朝向尚未完成。全部保留candidate。</p>
<input id="search" placeholder="筛选ID，如 house / gate" aria-label="筛选素材"><button onclick="setBackground('#e8e1d2')">浅底</button><button onclick="setBackground('#25302c')">深底</button><button onclick="document.body.classList.add('checker')">棋盘底</button></header>
<main>
'''
    tail = '''</main><p>来源、完整提示词及候选选择见manifest与sources；测点见meta / tile的qa.jsonl。本页不改变素材。</p>
<script>
function setBackground(color){document.body.classList.remove('checker');document.documentElement.style.setProperty('--surface',color)}
document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('article').forEach(x=>x.hidden=!x.dataset.id.includes(q))});
</script></html>
'''
    output = head + '\n'.join(rows) + '\n' + tail
    assert len(output.splitlines()) <= 150
    (ROOT / 'preview.html').write_text(output, encoding='utf-8')
    print(f'preview.html: {len(rows)} assets')


if __name__ == '__main__':
    main()
