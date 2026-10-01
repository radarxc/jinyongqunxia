"""Collect per-asset records and build local review page without image edits."""
import html
import json
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parent
TILES = ROOT.parents[1] / 'tile' / 'liao_jin_north'

def write_parts(path, text):
    lines = text.splitlines(True)
    with path.open('w', encoding='utf-8') as stream:
        for start in range(0, len(lines), 100):
            stream.write(''.join(lines[start:start+100]))

def entries(folder):
    paths = list(folder.glob('*.entry.json')) + list((folder/'meta').glob('*.entry.json'))
    result = [json.loads(p.read_text()) for p in sorted(paths)]
    assert len(result) == len({r['id'] for r in result}), 'duplicate id'
    return sorted(result, key=lambda r:r['id'])

buildings, tiles = entries(ROOT), entries(TILES)
assert len(buildings) == 19 and len(tiles) == 7
for folder, records in [(ROOT, buildings), (TILES, tiles)]:
    write_parts(folder/'manifest.yaml', yaml.safe_dump(records, allow_unicode=True, sort_keys=False, width=140))

page = ['<!doctype html><html lang="zh-CN"><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1"><title>辽金北方套件候选审图</title>',
        '<style>body{font:16px system-ui;margin:24px;background:#e8e1d4;color:#28221b}button{padding:8px;margin:8px}',
        '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:14px}',
        'article{background:#f8f4ec;padding:14px;border:1px solid #aaa;border-radius:8px;overflow:hidden}',
        '.art{height:290px;display:flex;justify-content:center;align-items:center;background:var(--bg,#c9c1ae);position:relative}',
        'img{max-height:280px;max-width:100%;object-fit:contain}h2{font-size:17px;overflow-wrap:anywhere}p{margin:8px 0}',
        '.warn{color:#873513}small{overflow-wrap:anywhere}</style>',
        '<h1>辽 · 金北方套件</h1><p>19张建筑＋7张贴片 · 全部 candidate · 单视图</p>',
        '<p>点击图片打开实际PNG；显示按alpha合成。卡片适配尺寸仅供审图，不能代表同屏游戏比例。</p>',
        '<p class="warn">精确2:1未全部通过。城门、墙件与桥有明显几何残差，不能据文件校验声明净宽对格或无缝拼接。</p>',
        '<button onclick="document.body.style.setProperty(\'--bg\',\'#eee6d7\')">浅底</button>',
        '<button onclick="document.body.style.setProperty(\'--bg\',\'#292e32\')">深底</button>',
        '<button onclick="document.body.style.setProperty(\'--bg\',\'#7f9488\')">绿底</button><main class="grid">']
for kind, records in [('building', buildings), ('tile', tiles)]:
    for record in records:
        ident = record['id']
        url = record['file'] if kind == 'building' else '../../tile/liao_jin_north/'+record['file']
        data = record[kind]
        qa = record.get('geometry_qa', {})
        suffix = ident.replace('bld_kit_liao_jin_north_', '').replace('tex_town_liao_jin_north_', '')
        status = '底面轴线通过（仅手工量点）' if qa.get('axis_pass') else '底面轴线待复核 / 植物不适用'
        page.extend([f'<article><h2>{html.escape(suffix)}</h2><a class="art" href="{url}"><img loading="lazy" src="{url}" alt="{html.escape(record["subject"])}"></a>',
                     f'<p>{record["size"]} · 占地 {data["footprint"]}</p><p class="warn">{status}</p>',
                     f'<small>{html.escape(record.get("notes", ""))}</small></article>'])
page.append('</main></html>\n')
write_parts(ROOT/'preview.html', '\n'.join(page))
print(f'building entries={len(buildings)}; tile entries={len(tiles)}; review page written')
