#!/usr/bin/env python3
"""Verify file/provenance/placement data; optionally fail on optical residuals."""
import argparse
import hashlib
import json
import math
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--strict-geometry', action='store_true')
    args = parser.parse_args()
    catalog = {row['id']: row for row in json.loads((ROOT/'catalog.json').read_text())}
    entries = yaml.safe_load((ROOT/'manifest.yaml').read_text())
    assert isinstance(entries, list) and len(entries) == len(catalog) == 38
    assert {e['id'] for e in entries} == set(catalog)
    residuals = []
    for e in entries:
        ident = e['id']; c = catalog[ident]
        meta = yaml.safe_load((ROOT/e['metadata']).read_text())
        source = ROOT/e['processing']['source_archive']
        source_record = json.loads((ROOT/e['source_record']).read_text())
        assert digest(source) == e['source_sha256'] == e['processing']['source_sha256']
        assert source_record['source_sha256'] == e['source_sha256']
        assert source_record['prompt'] == e['prompt']
        assert source_record['references'] == e['references']
        assert source_record['candidate_count'] == e['candidate_count']
        assert digest(ROOT/e['file']) == e['sha256']
        assert e['status'] == meta['status'] == 'candidate'
        assert e['building'] == meta['building']
        assert e['geometry_qa'] == meta['geometry_qa']
        assert e['processing'] == meta['processing']
        assert e['pixel_qa'] == meta['pixel_qa']
        assert e['building']['type'] == ident
        assert e['building']['footprint'] == [c['w'], c['h']]
        assert e['footprint_m'] == [c['w'], c['h']]
        assert e['projection_contract']['tile_px'] == [64,32]
        assert e['projection_contract']['ground_width_px'] == 32*(c['w']+c['h'])
        assert meta['png_rotations_available'] == [0] and meta['allowRotation'] is False
        assert meta['release_ready'] is False
        im = Image.open(ROOT/e['file']); a = im.getchannel('A')
        assert im.mode == 'RGBA' and min(im.size) >= 512
        assert e['size'] == f'{im.width}x{im.height}'
        assert a.getextrema()[0] == 0 and a.getextrema()[1] >= 128
        assert e['pixel_qa']['alpha_extrema'] == list(a.getextrema())
        histogram = a.histogram()
        assert e['pixel_qa']['alpha_zero_pixels'] == histogram[0]
        assert e['pixel_qa']['alpha_partial_pixels'] == sum(histogram[1:255])
        assert e['pixel_qa']['alpha_opaque_pixels'] == histogram[255]
        assert e['pixel_qa']['alpha_near_opaque_pixels'] == sum(histogram[192:])
        assert a.getbbox() == tuple(e['pixel_qa']['alpha_nonzero_bbox'])
        bbox = a.getbbox()
        assert bbox[0]>0 and bbox[1]>0 and bbox[2]<im.width and bbox[3]<im.height
        ax, ay = e['building']['anchor']
        assert 0 <= ax < im.width and 0 <= ay < im.height
        p = e['geometry_qa']['source_corners_px']; processing = e['processing']
        assert source_record['footprint_corners_source_px'] == p
        left, front, right = [p[k] for k in ('left','front','right')]
        slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
        ratio = (front[0]-left[0])/(right[0]-front[0])
        error = abs(ratio/(c['w']/c['h'])-1)
        g = e['geometry_qa']
        assert all(math.isclose(x,y) for x,y in zip(slopes,g['source_axis_slopes']))
        assert math.isclose(ratio,g['source_width_depth_ratio'])
        assert math.isclose(error,g['ratio_relative_error'])
        assert g['axis_pass'] == (abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03)
        assert g['ratio_pass'] == (error<=.1)
        assert math.isclose(processing['uniform_scale_requested'],32*(c['w']+c['h'])/(right[0]-left[0]))
        scale = processing['rounded_effective_scale']; crop = processing['crop_box']; offset = processing['paste_offset']
        expected = [round(((p['left'][i]+p['right'][i])/2-crop[i])*scale[i]+offset[i],4) for i in (0,1)]
        assert expected == e['building']['anchor']
        if not (e['geometry_qa']['axis_pass'] and e['geometry_qa']['ratio_pass']):
            residuals.append(ident)
    print(json.dumps({'entries':len(entries),'file_alpha_hash_anchor_errors':0,
                      'optical_geometry_residual_count':len(residuals),'residual_ids':residuals},ensure_ascii=False,indent=2))
    return 1 if args.strict_geometry and residuals else 0


if __name__ == '__main__':
    raise SystemExit(main())
