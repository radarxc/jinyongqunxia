#!/usr/bin/env python3
"""Rebuild the ten household/commercial candidates; only geometric PIL edits."""
import hashlib
import json
import math
import shutil
from datetime import datetime, timezone
from pathlib import Path

import yaml
from PIL import Image

BASE = Path(__file__).resolve().parent
REPO = BASE.parents[3]
KEYS = ['house_small', 'house_large', 'courtyard', 'shop_1f', 'shop_2f',
        'inn', 'restaurant', 'market_stall', 'warehouse', 'wharf']


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_short(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, separators=(',', ':')) + '\n')


manifest = BASE / 'manifest-root.yaml'
manifest.write_text('')
for key in KEYS:
    record_path = BASE / 'sources' / (key + '.json')
    rec = json.loads(record_path.read_text())
    asset_id = rec['id']
    source = BASE / 'sources' / (asset_id + '.png')
    if not source.exists():
        shutil.copyfile(rec['source_path'], source)
    im = Image.open(source)
    assert im.mode == 'RGBA', (key, im.mode)
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 250
    bbox = alpha.getbbox()  # Preserve every nonzero-alpha pixel, including faint noise.
    cropped = im.crop(bbox)
    left, front, right = rec['ground_points_source']
    w, h = rec['footprint']
    scale = 32 * (w + h) / (right[0] - left[0])
    nw, nh = (max(1, round(x * scale)) for x in cropped.size)
    scaled = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    cw = max(256, math.ceil((nw + 32) / 16) * 16)
    ch = max(256, math.ceil((nh + 32) / 16) * 16)
    px, py = (cw - nw) // 2, (ch - nh) // 2
    final = Image.new('RGBA', (cw, ch))
    final.paste(scaled, (px, py))  # No alpha mask: retain generated alpha exactly after resize.
    target = BASE / (asset_id + '.png')
    final.save(target)
    sx, sy = nw / cropped.width, nh / cropped.height
    center = [(left[i] + right[i]) / 2 for i in range(2)]
    anchor = [round((center[0] - bbox[0]) * sx + px, 4),
              round((center[1] - bbox[1]) * sy + py, 4)]
    slopes = [(front[1] - left[1]) / (front[0] - left[0]),
              (right[1] - front[1]) / (right[0] - front[0])]
    ratio_error = abs((front[0] - left[0]) / (right[0] - front[0]) / (w / h) - 1)
    a = final.getchannel('A'); hist = a.histogram(); bb = a.getbbox()
    rec['processing'] = dict(crop=list(bbox), nominal_scale=scale,
        resized=[nw, nh], canvas=[cw, ch], paste=[px, py], scale_xy=[sx, sy],
        source_sha256=sha(source), final_sha256=sha(target), anchor_px=anchor,
        alpha_extrema=list(a.getextrema()), alpha_zero_pixels=hist[0],
        transparent_margins_px=[bb[0], bb[1], cw-bb[2], ch-bb[3]])
    rec['geometry'] = dict(slopes=slopes, target_slopes=[0.5,-0.5],
        axis_tolerance=0.03, axis_within_tolerance=all(abs(v-t)<=0.03 for v,t in zip(slopes,[0.5,-0.5])),
        relative_footprint_ratio_error=ratio_error, exact_registration_verified=False)
    rec['source_copy'] = str(source.relative_to(BASE))
    for attempt in rec['attempts']:
        p = Path(attempt['source_path'])
        if p.exists():
            attempt['sha256'] = sha(p)
    write_short(record_path, rec)
    references = []
    for p in rec['references']:
        path = Path(p)
        references.append(dict(path=str(path.relative_to(REPO)) if path.is_relative_to(REPO) else str(path),
                               sha256=sha(path), role='edit_target'))
    entry = dict(id=asset_id, file=target.name, category='building-map', style='default',
        subject=rec['subject'], prompt=rec['prompt'],
        negative='No people, readable text, watermark, scenery, modern glass, painted checkerboard, Qing ornament or thick diorama pedestal.',
        references=references, tool='codex exec · image_gen',
        model='image_gen (underlying image model undisclosed)', effort='not_exposed',
        created=rec.setdefault('created', datetime.now(timezone.utc).isoformat()),
        source_path=rec['source_path'], source_copy=str(source.relative_to(BASE)),
        source_sha256=sha(source), size=f'{cw}x{ch}', sha256=sha(target), status='candidate',
        building=dict(type=asset_id, footprint=[w,h], anchor=anchor, era='ming_south'),
        footprint_basis=rec['footprint_basis'], candidate_count=len(rec['attempts']),
        source_record=str(record_path.relative_to(BASE)),
        projection_contract=dict(yaw_deg=45, elevation_deg=30, ground_tile_px=[64,32],
                                 actual_views=[0], allowRotation=False, geometry_verified=False),
        notes='已逐图view_image；仅透明裁边、等比LANCZOS及padding。底面中心为人工测点推算；轴向/占地比例残差见来源记录，未宣称精确拼接或四向已完成。')
    write_short(record_path, rec)
    block = yaml.safe_dump([entry], allow_unicode=True, sort_keys=False, width=100000)
    assert len(block.splitlines()) <= 150
    with manifest.open('a') as out:
        out.write(block)
    print(key, entry['size'], 'anchor', anchor, 'slopes', [round(v,3) for v in slopes],
          'ratio_error', round(ratio_error,3))
