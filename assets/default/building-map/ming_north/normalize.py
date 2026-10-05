#!/usr/bin/env python3
"""Ming north candidate sprites: transparent crop, uniform scale, transparent pad.

Usage: python3 normalize.py sources/<id>.json
Source JSON keys: id, subject, footprint, source_path, prompt, references,
created, points={L:[x,y],F:[x,y],R:[x,y]}, footprint_basis, visual_review.
Source coordinates are continuous pixel coordinates from the top-left edge.
No recolouring, alpha reconstruction, warping, painting or perspective repair.
"""
import hashlib
import json
import math
import shutil
import sys
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main(path):
    data = json.loads(Path(path).read_text())
    ident = data['id']
    original = Path(data['source_path'])
    source = ROOT / 'sources' / f'{ident}.png'
    if original.resolve() != source.resolve():
        shutil.copyfile(original, source)
    im = Image.open(source)
    assert im.mode == 'RGBA', (ident, im.mode)
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 250
    content = alpha.point(lambda value: 255 if value >= 3 else 0).getbbox()
    assert content and content[0] > 0 and content[1] > 0
    assert content[2] < im.width and content[3] < im.height, 'Visible source touches edge'
    bbox = (max(0, content[0]-4), max(0, content[1]-4),
            min(im.width, content[2]+4), min(im.height, content[3]+4))
    removed = alpha.copy()
    removed.paste(0, bbox)
    removed_hist = removed.histogram()
    assert removed.getextrema()[1] <= 2
    L, F, R = (data['points'][key] for key in ('L', 'F', 'R'))
    w, h = data['footprint']
    scale = 32 * (w + h) / (R[0] - L[0])
    crop = im.crop(bbox)
    size = [max(1, round(value * scale)) for value in crop.size]
    # Integer raster dimensions quantize the common scale by < 0.5 pixel.
    scaled = crop.resize(size, Image.Resampling.LANCZOS)
    canvas = [max(256, math.ceil((v + 32) / 32) * 32) for v in size]
    offset = [(canvas[i] - size[i]) // 2 for i in (0, 1)]
    out = Image.new('RGBA', canvas, (0, 0, 0, 0))
    out.paste(scaled, offset)
    target = ROOT / f'{ident}.png'
    out.save(target)
    sx, sy = size[0] / crop.width, size[1] / crop.height
    def transform(pt):
        return [round((pt[0] - bbox[0]) * sx + offset[0], 4),
                round((pt[1] - bbox[1]) * sy + offset[1], 4)]
    center = [(L[i] + R[i]) / 2 for i in (0, 1)]
    anchor = transform(center)
    positive = (F[1] - L[1]) / (F[0] - L[0])
    negative = (R[1] - F[1]) / (R[0] - F[0])
    ratio_error = abs((F[0] - L[0]) / (R[0] - F[0]) / (w / h) - 1)
    a = out.getchannel('A')
    hist = a.histogram()
    qa = {'mode': out.mode, 'alpha_extrema': list(a.getextrema()),
          'alpha_zero_pixels': hist[0], 'alpha_partial_pixels': sum(hist[1:255]),
          'alpha_opaque_pixels': hist[255], 'alpha_bbox': list(a.getbbox()),
          'rectangular_trim_removed_nonzero': sum(removed_hist[1:]),
          'rectangular_trim_removed_max_alpha': removed.getextrema()[1],
          'source_axis_slopes': [round(positive, 5), round(negative, 5)],
          'source_ratio_relative_error': round(ratio_error, 5),
          'geometry_warning': abs(positive - .5) > .03 or
                              abs(negative + .5) > .03 or ratio_error > .1,
          'visual_review': data.get('visual_review', ''),
          'limitation': 'Manual visible ground-corner estimates; hidden corner inferred; runtime untested.'}
    metadata = {'id': ident, 'footprint_m': [w, h], 'footprint_basis': data['footprint_basis'],
                'anchor_px': anchor, 'entrance': {'edge': 'S', 'offset_cells': w / 2},
                'png_rotations_available': [0], 'allowRotation': False,
                'projection_contract': 'yaw45_pitch30_dimetric_2to1_target',
                'height_m': None, 'collision_polygon_local_m': [[0,0],[w,0],[w,h],[0,h]],
                'collision_note': 'Bounding rectangle proxy only; not runtime collision approval.',
                'occlusion_polygon_px': None, 'runtime_validation': '待实测',
                'source_points_px': data['points'], 'source_anchor_px': center,
                'target_ground_span_px': 32 * (w + h),
                'geometry': {'crop_box': list(bbox), 'uniform_scale': scale,
                             'scaled_size': size, 'canvas_size': canvas,
                             'paste_offset': offset, 'raster_scales': [sx, sy]},
                'qa': qa, 'source_sha256': sha(source), 'sha256': sha(target)}
    (ROOT / 'meta').mkdir(exist_ok=True)
    (ROOT / 'meta' / f'{ident}.yaml').write_text(
        yaml.safe_dump(metadata, allow_unicode=True, sort_keys=False))
    entry = {key: data[key] for key in ('id', 'subject', 'prompt', 'references', 'created', 'source_path')}
    entry.update({'file': target.name, 'category': 'building-map', 'style': 'default',
                  'negative': data.get('negative', 'No text, modern objects, people, scenery, opaque background, clipped roofs.'),
                  'tool': 'image_gen', 'model': 'image_gen (underlying model undisclosed)',
                  'effort': 'not_exposed', 'size': f'{canvas[0]}x{canvas[1]}',
                  'sha256': sha(target), 'status': 'candidate',
                  'building': {'type': ident, 'footprint': [w,h], 'anchor': anchor, 'era': 'ming_north'},
                  'footprint_m': [w,h], 'entrance': metadata['entrance'],
                  'projection_contract': metadata['projection_contract'],
                  'source_copy': f'sources/{ident}.png', 'source_sha256': sha(source),
                  'meta': f'meta/{ident}.yaml',
                  'notes': '（原创扩展）匿名明代北方意象；仅原向单视图；底面跨度等比标定，斜率/宽深残差见meta；拼接（待实测）。'})
    (ROOT / 'meta' / f'{ident}.entry.json').write_text(
        json.dumps(entry, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'id': ident, 'size': entry['size'], 'anchor': anchor, 'qa': qa}, ensure_ascii=False))


if __name__ == '__main__':
    main(sys.argv[1])
