"""Build the selected manifest and a local review page, without changing image pixels."""
from pathlib import Path
import html
import json
import yaml

ROOT = Path(__file__).resolve().parent


class Dumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True


def build():
    entries = [yaml.safe_load(p.read_text()) for p in sorted((ROOT/'meta').glob('bld_kit_xiyu_*.yaml'))]
    assert len(entries) == 19, f'Expected 19 selected buildings, found {len(entries)}'
    manifest = ROOT/'manifest.yaml'
    with manifest.open('w') as stream:
        for entry in entries:
            block = yaml.dump([entry], Dumper=Dumper, allow_unicode=True,
                              sort_keys=False, default_flow_style=None, width=180)
            assert len(block.splitlines()) <= 150
            stream.write(block)
            stream.flush()
    tile_root = ROOT.parent.parent/'tile'/'xiyu'
    tiles = yaml.safe_load((tile_root/'manifest.yaml').read_text())
    lines = ['<!doctype html><html lang="zh-CN"><meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1"><title>西域套件 · 候选审图</title>',
        '<style>body{margin:24px;background:#dedbd2;color:#272820;font:15px system-ui}',
        'header{position:sticky;top:0;padding:12px;background:#f5f2e8f0;z-index:2;border-radius:8px}',
        'main{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px;margin-top:18px}',
        'article{padding:12px;background:#ffffff40;border:1px solid #a5a295;border-radius:8px}',
        '.art{position:relative;max-width:100%;margin:auto}.art img{display:block;width:100%}',
        'svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none}',
        'body.overlay svg{display:block}code{overflow-wrap:anywhere;font-size:12px}',
        'a{color:inherit}.warn{color:#814116}p{line-height:1.5}button,label{margin-right:12px}</style>',
        '<header><strong>西域套件 · 19 建筑 / 7 贴片 · 全部 candidate</strong><p>点击图片打开原尺寸透明 PNG；缩略图不能判断真实米尺度。青线是逻辑占地，红点是登记锚点，偏离处供装配复核。</p>',
        '<button onclick="document.body.style.background=\'#dedbd2\';document.body.style.color=\'#272820\'">浅底</button>',
        '<button onclick="document.body.style.background=\'#303438\';document.body.style.color=\'#e7e7e7\'">深底</button>',
        '<label><input type="checkbox" onchange="document.body.classList.toggle(\'overlay\',this.checked)">建筑逻辑占地</label>',
        '<a href="manifest.yaml">建筑清单</a> · <a href="../../tile/xiyu/QA.md">贴片 QA</a></header><main>']
    for e in entries+tiles:
        building = 'building' in e
        prefix = '' if building else '../../tile/xiyu/'
        file = prefix+e['file']
        width,height = map(int,e['size'].replace('×','x').split('x'))
        fp = e['building']['footprint'] if building else e['tile']['footprint']
        content = f'<article><code>{html.escape(e["id"])}</code><div class="art" style="width:{width}px"><a href="{file}"><img src="{file}" alt="{html.escape(e["subject"])}" loading="lazy"></a>'
        if building:
            x,y = e['building']['anchor'];w,h = fp
            points = [(x-16*(w+h),y-8*(w-h)),(x+16*(w-h),y+8*(w+h)),
                      (x+16*(w+h),y+8*(w-h)),(x-16*(w-h),y-8*(w+h))]
            point_text = ' '.join(f'{a:.2f},{b:.2f}' for a,b in points)
            content += f'<svg viewBox="0 0 {width} {height}"><polygon points="{point_text}" stroke="#009fac" fill="none" stroke-width="2"/><circle cx="{x}" cy="{y}" r="4" fill="#d43a2f"/></svg>'
        content += f'</div><p>{fp[0]}×{fp[1]} 格 · {width}×{height}px · candidate</p>'
        content += f'<p>{html.escape(e["subject"])}</p>'
        if building:
            qa=e['geometry_qa'];flags=[]
            if not qa['axis_pass']:flags.append('轴斜率超 ±0.03')
            if not qa['ratio_pass']:flags.append('宽深比偏差超过 10%')
            content += f'<p class="warn">{html.escape("；".join(flags) or "量点阈值内；仍待总装")}</p>'
            content += f'<a href="{e["metadata"]}">逐图元数据</a>'
        else:
            content += '<p class="warn">墙门净空、接缝与桥栏遮挡待总装</p>'
        lines.append(content+'</article>')
    lines.append('</main><p>仅原向单视图；图像细部为地域原创组合，非具名古迹测绘。与宋件的画风比较请见只读基线。</p>')
    lines.append('<p><a href="../../baseline/building-map/bld_kit_song_dali_house.png">宋·大理民居</a> · <a href="../../baseline/building-map/bld_kit_song_southern_courtyard.png">宋·临安院落</a></p></html>')
    assert len(lines)<=150
    (ROOT/'preview.html').write_text('\n'.join(lines)+'\n')
    print(f'Built {len(entries)} building entries and {len(tiles)} tile previews')


if __name__=='__main__':
    build()
