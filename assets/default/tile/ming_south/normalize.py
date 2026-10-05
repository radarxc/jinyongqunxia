#!/usr/bin/env python3
"""Reproduce selected tile PNGs: alpha-bbox crop, uniform resize, 4 px padding only."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

from PIL import Image
import yaml

ROOT = Path(__file__).resolve().parent
SPECS = json.loads((ROOT / 'generation.json').read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def append_yaml(path, record):
    text = yaml.safe_dump([record], allow_unicode=True, sort_keys=False, width=100000)
    assert len(text.splitlines()) <= 150
    with path.open('a') as handle:
        handle.write(text)


def main():
    (ROOT / 'source').mkdir(exist_ok=True)
    manifest, geometry = ROOT / 'manifest.yaml', ROOT / 'geometry.yaml'
    manifest.write_text('')
    geometry.write_text('')
    for spec in SPECS:
        src = Path(spec['source_path'])
        copy = ROOT / 'source' / (spec['id'] + '__source.png')
        if not copy.exists():
            shutil.copyfile(src, copy)
        im = Image.open(copy)
        assert im.mode == 'RGBA'
        a = im.getchannel('A')
        assert a.getextrema()[0] == 0 and a.getextrema()[1] > 240
        # Use a visibility threshold only to locate the crop rectangle; alpha/RGB remain unchanged.
        visible = a.point(lambda value: 255 if value >= 16 else 0).getbbox()
        bbox = (max(0, visible[0] - 2), max(0, visible[1] - 2),
                min(im.width, visible[2] + 2), min(im.height, visible[3] + 2))
        cropped = im.crop(bbox)
        ratio = spec['ground_width_target'] / spec['ground_width_source']
        size = tuple(max(1, round(value * ratio)) for value in cropped.size)
        resized = cropped.resize(size, Image.Resampling.LANCZOS)
        final = Image.new('RGBA', (size[0] + 8, size[1] + 8))
        final.paste(resized, (4, 4))
        path = ROOT / (spec['id'] + '.png')
        final.save(path)
        anchor = [round((value - bbox[i]) * ratio + 4, 2)
                  for i, value in enumerate(spec['anchor_source'])]
        refs = []
        for ref in spec['references']:
            refs.append(dict(file=ref['file'], sha256=ref['sha256'], note=ref['note']))
        notes = '原创地域组合；按alpha≥16轮廓外扩2px取裁框、等比缩放、四周4px透明边，未阈值改写像素；底面/根锚人工估测。'
        if spec['kind'] in ('city_gate', 'wall', 'wall_corner', 'bridge'):
            notes += '2:1轴向与格孔/墙接缝尚有视觉误差，须总装配准；仅一个方向候选。'
        else:
            notes += '占地为冠幅建议值；仅静态预览植物，不替代design/22§4.4公告板合同。'
        entry = dict(id=spec['id'], file=path.name, category='tile', style='default',
                     subject=spec['subject'], prompt=spec['prompt'],
                     negative='无文字、人物、水印、现代物件、背景地台、假棋盘；门孔与拱下真透明。',
                     references=refs, tool='codex exec · image_gen (built-in)',
                     model='image_gen (backend undisclosed)', effort='inherited agent configuration',
                     created=datetime.fromtimestamp(copy.stat().st_mtime, timezone.utc).isoformat(),
                     source_path=spec['source_path'], size=f'{final.width}x{final.height}',
                     sha256=sha(path), status='candidate',
                     tile=dict(kind=spec['kind'], footprint=spec['footprint'],
                               variant=spec['variant'], autotile_mask=None),
                     source_copy=str(copy.relative_to(ROOT)), source_sha256=sha(copy),
                     anchor_px=anchor, notes=notes)
        append_yaml(manifest, entry)
        audit = dict(id=spec['id'], selected_candidate=spec['selected_candidate'],
                     candidates=spec['candidates'], source_size=list(im.size),
                     source_alpha_range=list(a.getextrema()), alpha_bbox=list(bbox),
                     crop_rule='alpha≥16仅定位裁框后外扩2px；框内RGBA原样交由等比缩放，未清零或改色。',
                     source_anchor_px=spec['anchor_source'], anchor_method='底面中心或根点人工估测，非alpha框底边',
                     measured_plan_width_px=spec['ground_width_source'],
                     target_plan_width_px=spec['ground_width_target'], scale=ratio,
                     scale_basis='64×32格：水平包络32×(w+h)；植物用冠幅包络，均为建议值。',
                     normalized_size=list(final.size), anchor_px=anchor,
                     alpha_range=list(final.getchannel('A').getextrema()),
                     geometry_status='待实测：AI投影非严格计量几何；不得据此宣称运行时契约通过。')
        if spec['kind'] == 'city_gate':
            width = 4 if spec['key'] == 'gate4' else 6
            audit.update(rotation_deg=0, width_cells=width,
                         footprint_cells=dict(w=width + 4, h=4),
                         passage_cells=dict(w=width, h=4),
                         passage_rule='双门墩各2格；声明为目标逻辑孔，非逐像素碰撞验收。')
        append_yaml(geometry, audit)
        print(spec['id'], entry['size'], anchor, audit['alpha_range'])


if __name__ == '__main__':
    main()
