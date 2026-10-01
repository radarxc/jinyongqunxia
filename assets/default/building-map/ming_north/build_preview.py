#!/usr/bin/env python3
"""Build the local Ming north candidate review sheet from generated entry/meta files."""
import html
import json
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent
ITEMS = [
    ('house_small', '小民居'), ('house_large', '大民居'), ('courtyard', '院落'),
    ('shop_1f', '单层商铺'), ('shop_2f', '两层商铺'), ('inn', '客栈'),
    ('restaurant', '酒楼 / 茶肆'), ('market_stall', '市场棚'), ('yamen', '衙门'),
    ('biaoju', '镖局 / 货栈'), ('casino', '赌场'), ('manor', '山庄 / 大院'),
    ('wangfu', '王府模块'), ('temple_hall', '寺观殿堂'), ('pagoda', '佛塔'),
    ('guardhouse', '城门守舍'), ('stable', '马厩'), ('warehouse', '仓屋'),
    ('wharf', '码头 / 河埠'),
]


def escape(value):
    return html.escape(str(value), quote=True)


cards = []
ready = warnings = 0
for suffix, label in ITEMS:
    ident = 'bld_kit_ming_north_' + suffix
    entry_path = ROOT / 'meta' / (ident + '.entry.json')
    if not entry_path.exists():
        cards.append(f'<article><h2>{label}</h2><p class="pending">生成中</p>'
                     f'<code>{ident}</code></article>')
        continue
    entry = json.loads(entry_path.read_text())
    metadata = yaml.safe_load((ROOT / entry['meta']).read_text())
    qa = metadata['qa']
    warning = qa['geometry_warning']
    warnings += int(warning)
    ready += 1
    footprint = ' × '.join(str(n) for n in entry['building']['footprint'])
    slopes = ' / '.join(str(n) for n in qa['source_axis_slopes'])
    error = f"{100 * qa['source_ratio_relative_error']:.2f}%"
    verdict = '几何有残差' if warning else '手工量点在建议容差内'
    cls = 'warning' if warning else 'within'
    image_file = escape(entry['file'])
    cards.append(
        f'<article><div class="sprite"><a href="{image_file}" target="_blank">'
        f'<img src="{image_file}" alt="{escape(label)}" loading="lazy"></a></div>'
        f'<h2>{escape(label)} <small>{escape(entry["status"])}</small></h2>'
        f'<code>{escape(entry["building"]["type"])}</code>'
        f'<p>占地 {footprint} 格 · {escape(entry["size"])} px</p>'
        f'<p class="{cls}">{verdict} · 斜率 {slopes} · 宽深误差 {error}</p>'
        f'<details><summary>逐图审查记录与元数据</summary><p>{escape(qa["visual_review"])}</p>'
        f'<p><a href="{escape(entry["meta"])}">元数据</a> · '
        f'<a href="sources/{ident}.json">来源与完整提示词</a></p></details></article>')

page = '''<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>明 · 北方建筑套件审图</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:24px;background:#e9e6df;color:#292b2a;font:15px/1.6 system-ui,sans-serif}
header{margin:0 auto 20px;max-width:1500px}h1{font-size:27px;margin:0}header p{margin:6px 0}
.controls{padding:8px 14px;border-radius:8px;background:#fff;margin:14px auto;max-width:1500px}
body>input{position:absolute;opacity:0;pointer-events:none}label{cursor:pointer;display:inline-block;padding:5px 12px;border:1px solid #bbc0bb;border-radius:6px;margin:3px}
#dark:checked~.controls label[for=dark],#light:checked~.controls label[for=light],#check:checked~.controls label[for=check],#actual:checked~.controls label[for=actual]{background:#315348;color:white;border-color:#315348}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:18px;max-width:1500px;margin:auto}
article{background:#fff;border:1px solid #cacdc6;border-radius:10px;overflow:hidden;padding:14px;min-width:0}
.sprite{height:350px;display:flex;align-items:center;justify-content:center;overflow:auto;border-radius:5px;background:#222827}
.sprite img{display:block;max-height:330px;max-width:100%;object-fit:contain}
#light:checked~main .sprite{background:#faf8f2}
#check:checked~main .sprite{background-color:#eeede8;background-image:conic-gradient(#d0d0cb 25%,transparent 0 50%,#d0d0cb 0 75%,transparent 0);background-size:24px 24px}
#actual:checked~main .sprite{display:block}#actual:checked~main .sprite img{max-width:none;max-height:none}
h2{font-size:18px;margin:12px 0 4px}small{font-size:12px;font-weight:500;color:#777;margin-left:5px}
code{display:block;overflow-wrap:anywhere;font-size:12px;color:#58665e}article p{margin:6px 0;font-size:13px}
.warning{color:#875315}.within{color:#2c6350}.pending{color:#666;height:350px;padding-top:150px;text-align:center}
details{border-top:1px solid #ddd;padding-top:9px;margin-top:10px}summary{cursor:pointer;font-size:13px}a{color:#215e57}
@media(max-width:400px){body{padding:10px}main{grid-template-columns:1fr}}
</style>
<body>
<input type="radio" id="dark" name="bg" checked><input type="radio" id="light" name="bg"><input type="radio" id="check" name="bg"><input type="checkbox" id="actual">
<header><h1>明 · 北方建筑套件</h1>
<p>写实古风 · 灰砖硬山灰瓦 · 透明 PNG · 全部为 candidate，尚未取得作者审批。</p>
<p>__SUMMARY__</p><p>显示为适应卡片尺寸；启用 1:1 后可在图片区域滚动。点击图片单独查看。量点通过不等于运行时拼接通过。</p></header>
<div class="controls"><label for="dark">深底</label><label for="light">浅底</label><label for="check">棋盘底</label><label for="actual">1:1 原像素</label></div>
<main>
__CARDS__
</main></body></html>
'''
summary = f'已登记 {ready} / {len(ITEMS)} 张；手工几何残差告警 {warnings} 张。'
page = page.replace('__SUMMARY__', summary).replace('__CARDS__', '\n'.join(cards))
(ROOT / 'preview.html').write_text(page)
print(summary)
