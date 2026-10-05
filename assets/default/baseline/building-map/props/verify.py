#!/usr/bin/env python3
"""Verify the late-added native-size plant contract independently."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import yaml
from PIL import Image

ROOT=Path(__file__).resolve().parent


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--strict-roots',action='store_true')
    args=parser.parse_args()
    catalog={c['asset_id']:c for c in json.loads((ROOT/'catalog.json').read_text())}
    entries=yaml.safe_load((ROOT/'manifest.yaml').read_text())
    assert isinstance(entries,list) and len(entries)==14 and len(catalog)==7
    assert len({e['file'] for e in entries})==14
    pairs={(e['asset_id'],e['variant_key']) for e in entries}
    assert pairs=={(ident,key) for ident in catalog for key in ('v01','v02')}
    root_residuals=[]
    for e in entries:
        c=catalog[e['asset_id']]
        v=math.ceil(16*math.sqrt(6)*c['Y'])
        assert c['size_px']==[64*c['s']+8,32*c['s']+v+8]
        assert c['anchor_px']==[32*c['s']+4,16*c['s']+v+4]
        meta=yaml.safe_load((ROOT/e['metadata']).read_text())
        assert meta['asset_id']==c['asset_id'] and meta['collision']=='none'
        assert meta['footprint_cells']=={'w':1,'h':1} and meta['placement_domain']=='land'
        assert meta['visual_bounds_m']=={'w':c['s'],'d':c['s'],'h':c['Y']}
        assert [v['key'] for v in meta['variants']]==['v01','v02']
        assert meta['release_ready'] is False
        variant=next(v for v in meta['variants'] if v['key']==e['variant_key'])
        assert variant['file']==e['file'] and variant['status']==e['status']=='candidate'
        assert e['id']==e['asset_id']+'__'+e['variant_key'] and e['file']==e['id']+'.png'
        assert variant['size_px']==e['pixel_qa']['size_px']==c['size_px']
        assert meta['projection_contract']['tile_px']==[64,32]
        assert variant['anchor_px']==e['anchor_px']==c['anchor_px']
        assert variant['processing']==e['processing'] and variant['pixel_qa']==e['pixel_qa']
        im=Image.open(ROOT/e['file']); alpha=im.getchannel('A'); bbox=alpha.getbbox()
        assert im.mode=='RGBA' and list(im.size)==c['size_px']
        assert e['size']==f'{im.width}x{im.height}' and sha(ROOT/e['file'])==e['sha256']
        assert alpha.getextrema()[0]==0 and alpha.getextrema()[1]>=128
        assert list(alpha.getextrema())==e['pixel_qa']['alpha_extrema']
        hist=alpha.histogram()
        assert hist[0]==e['pixel_qa']['alpha_zero_pixels']
        assert sum(hist[1:255])==e['pixel_qa']['alpha_partial_pixels']
        assert hist[255]==e['pixel_qa']['alpha_opaque_pixels']
        assert sum(hist[192:])==e['pixel_qa']['alpha_near_opaque_pixels']
        margins=[bbox[0],bbox[1],im.width-bbox[2],im.height-bbox[3]]
        assert min(margins)>=4 and margins==e['pixel_qa']['transparent_margins_px']
        assert alpha.crop((0,c['anchor_px'][1]+1,im.width,im.height)).getextrema()[1]==0
        p=e['processing']; source=ROOT/p['source_archive']
        record=json.loads((ROOT/e['source_record']).read_text())
        assert sha(source)==e['source_sha256']==p['source_sha256']==record['source_sha256']
        assert record['prompt']==e['prompt'] and record.get('references',[])==e['references']
        assert list(Image.open(source).size)==p['source_size']
        src_alpha=Image.open(source).getchannel('A')
        assert list(src_alpha.getbbox())==p['source_alpha_bbox']
        visible=src_alpha.point(lambda value:255 if value>=3 else 0).getbbox()
        sw,sh=p['source_size']
        assert p['crop_box']==[max(0,visible[0]-4),max(0,visible[1]-4),min(sw,visible[2]+4),min(sh,visible[3]+4)]
        x0,y0,x1,y1=p['crop_box']; removed=0; largest=0
        for box in ((0,0,sw,y0),(0,y1,sw,sh),(0,y0,x0,y1),(x1,y0,sw,y1)):
            if box[0]<box[2] and box[1]<box[3]:
                hist=src_alpha.crop(box).histogram();removed+=sum(hist[1:])
                largest=max(largest,max(i for i,n in enumerate(hist) if n))
        assert largest==p['cropped_alpha_max']<=2 and removed==p['cropped_nonzero_pixels']
        assert p['source_measured_root_px']==record['root_source_px']
        crop=p['crop_box']; sx,sy=p['rounded_effective_scale']; ox,oy=p['paste_offset']
        rx,ry=p['source_measured_root_px']
        assert p['source_conservative_ground_y']==max(ry,crop[3])
        transformed=[round((rx-crop[0])*sx+ox,4),round((ry-crop[1])*sy+oy,4)]
        assert transformed==p['transformed_measured_root_px']
        err=[round(transformed[i]-c['anchor_px'][i],4) for i in (0,1)]
        assert err==p['root_offset_px']
        passed=max(abs(x) for x in err)<=1
        assert passed==variant['root_within_one_px']
        if not passed:
            root_residuals.append(e['id'])
    print(json.dumps({'entries':14,'types':7,'native_size_alpha_hash_metadata_errors':0,
                      'root_offset_over_one_px':root_residuals},ensure_ascii=False,indent=2))
    return 1 if args.strict_roots and root_residuals else 0


if __name__=='__main__':
    raise SystemExit(main())
