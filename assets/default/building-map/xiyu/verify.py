#!/usr/bin/env python3
"""Validate individual metadata and pixel-exact geometry; projection warnings stay visible."""
import argparse
import hashlib
import math
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
FOOTPRINTS = dict(house_small=[7, 6], house_large=[10, 8], courtyard=[10, 8],
    shop_1f=[7, 5], shop_2f=[8, 6], inn=[12, 9], restaurant=[12, 9],
    market=[5, 4], yamen=[16, 12], wharf=[10, 4], biaoju=[14, 11],
    casino=[10, 8], manor=[16, 13], palace=[24, 20], temple_hall=[14, 11],
    pagoda=[7, 7], guardhouse=[7, 5], stable=[9, 7], warehouse=[10, 8])


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def close(actual, expected, label, tolerance=0.0001):
    require(len(actual) == len(expected), label + ': length mismatch')
    require(all(math.isfinite(float(a)) and abs(a-b) <= tolerance
                for a, b in zip(actual, expected)), label + ': mismatch')


def validate(path):
    e = yaml.safe_load(path.read_text(encoding='utf-8'))
    asset = e['id']; b = e['building']; p = e['processing']; g = e['geometry_qa']
    require(asset == path.stem == b['type'], 'id/type/meta stem mismatch')
    suffix = asset.removeprefix('bld_kit_xiyu_')
    require(suffix in FOOTPRINTS, 'unknown xiyu building type')
    require(b['footprint'] == e['footprint_m'] == FOOTPRINTS[suffix], 'footprint mismatch')
    require(b['era'] == 'xiyu' and e['status'] == 'candidate', 'era/status mismatch')
    require(type(e['candidate_count']) is int and 1 <= e['candidate_count'] <= 2,
            'candidate_count must be integer 1 or 2')
    require(e['png_rotations_available'] == [0] and e['allowRotation'] is False,
            'single-view rotation contract mismatch')
    require((ROOT / e['metadata']).resolve() == path.resolve(), 'metadata path mismatch')
    target = ROOT / e['file']; source = ROOT / p['source_archive']
    require(sha(target) == e['sha256'], 'final SHA mismatch')
    require(sha(source) == p['source_sha256'], 'source SHA mismatch')
    with Image.open(target) as opened:
        require(opened.format == 'PNG', 'final is not PNG')
        im = opened.copy()
    with Image.open(source) as opened:
        src = opened.copy()
    require(im.mode == src.mode == 'RGBA', 'source/final must both be RGBA')
    size = tuple(int(x) for x in e['size'].replace('×', 'x').split('x'))
    require(im.size == size and min(size) >= 256, 'final size/minimum mismatch')
    require(list(src.size) == p['source_size'], 'source size mismatch')
    alpha = im.getchannel('A'); source_alpha = src.getchannel('A')
    require(alpha.getextrema()[0] == source_alpha.getextrema()[0] == 0,
            'source/final missing transparent pixels')
    require(min(alpha.getextrema()[1], source_alpha.getextrema()[1]) >= 250,
            'source/final missing near-opaque subject')
    w, h = im.size
    border = max(alpha.crop(box).getextrema()[1] for box in
                 [(0, 0, w, 1), (0, h-1, w, h), (0, 0, 1, h), (w-1, 0, w, h)])
    require(border == e['pixel_qa']['border_alpha_max'] == 0, 'nontransparent border')
    require(list(alpha.getbbox()) == e['pixel_qa']['alpha_nonzero_bbox'], 'alpha bbox mismatch')
    require(list(alpha.getextrema()) == e['pixel_qa']['alpha_extrema'], 'alpha range mismatch')
    crop = p['crop_box']; resized_size = p['resized_size']; offset = p['paste_offset']
    require(tuple(crop) == source_alpha.getbbox(), 'crop must preserve every nonzero alpha pixel')
    require(all(v >= 0 for v in offset) and all(offset[i]+resized_size[i] <= size[i]
                for i in (0, 1)), 'resized sprite exceeds final canvas')
    cut = src.crop(crop); scale = p['uniform_scale_requested']
    require(resized_size == [round(v*scale) for v in cut.size], 'nonuniform resize declaration')
    effective = [resized_size[i]/cut.size[i] for i in (0, 1)]
    close(p['rounded_effective_scale'], effective, 'rounded scale')
    rebuilt = Image.new('RGBA', im.size, (0, 0, 0, 0))
    rebuilt.paste(cut.resize(tuple(resized_size), Image.Resampling.LANCZOS), tuple(offset))
    require(rebuilt.tobytes() == im.tobytes(), 'pure geometry reconstruction differs pixelwise')
    corners = g['source_corners_px']; left = corners['left']; front = corners['front']
    right = corners['right']; center = [(left[i]+right[i])/2 for i in (0, 1)]
    require(0 <= left[0] < front[0] < right[0] < src.width, 'invalid corner x ordering')
    require(all(0 <= point[1] < src.height for point in (left, front, right)), 'corner outside source')
    close(g['source_anchor_px'], center, 'source anchor')
    anchor = [round((center[i]-crop[i])*effective[i]+offset[i], 4) for i in (0, 1)]
    close(b['anchor'], anchor, 'final anchor')
    bbox = alpha.getbbox()
    require(0 <= anchor[0] < w and 0 <= anchor[1] < h, 'anchor outside final canvas')
    require(bbox[0] <= anchor[0] < bbox[2] and bbox[1] <= anchor[1] < bbox[3],
            'anchor outside visible sprite bounds')
    fp = b['footprint']; ground = [32*sum(fp), 16*sum(fp)]
    require(e['projection_contract']['ground_bbox_px'] == ground, 'ground projection mismatch')
    close([scale], [ground[0]/(right[0]-left[0])], 'ground normalization scale')
    slopes = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0]); expected = fp[0]/fp[1]
    error = abs(ratio/expected-1); axis_pass = all(abs(a-b) <= g['axis_tolerance']
                    for a, b in zip(slopes, [0.5, -0.5]))
    ratio_pass = error <= g['ratio_tolerance_suggestion']
    close(g['source_axis_slopes'], slopes, 'axis measurements')
    close([g['source_width_depth_ratio'], g['expected_width_depth_ratio'],
           g['ratio_relative_error']], [ratio, expected, error], 'ratio measurements')
    require(g['axis_pass'] is axis_pass and g['ratio_pass'] is ratio_pass, 'false QA pass/fail flag')
    return asset, axis_pass, ratio_pass, slopes, error


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--expected', type=int, help='optional expected number of metadata files')
    args = parser.parse_args(); files = sorted((ROOT/'meta').glob('*.yaml'))
    errors = []; warnings = []; seen = set()
    if not files or (args.expected is not None and len(files) != args.expected):
        errors.append(f'metadata count {len(files)} does not satisfy expected {args.expected}')
    for path in files:
        try:
            asset, axis_ok, ratio_ok, slopes, ratio_error = validate(path)
            require(asset not in seen, 'duplicate asset id'); seen.add(asset)
            if not axis_ok or not ratio_ok:
                warnings.append(f'{asset}: axis={axis_ok} slopes={slopes}; '
                                f'ratio={ratio_ok} relative_error={ratio_error:.4%}')
        except Exception as exc:
            errors.append(f'{path.name}: {type(exc).__name__}: {exc}')
    for message in warnings: print('WARN', message)
    for message in errors: print('ERROR', message)
    print(f'metadata={len(files)} validated={len(seen)} errors={len(errors)} '
          f'geometry_warnings={len(warnings)}; warnings are NOT geometry approval')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
