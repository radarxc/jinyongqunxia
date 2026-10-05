"""Civic group: preserve alpha, crop transparent space, uniform resize, transparent pad."""
from pathlib import Path
from PIL import Image
import json, hashlib, shutil, math, sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def process(specpath):
    p = json.loads(Path(specpath).read_text())
    aid = p['id']; src = Path(p['source_path'])
    archive = ROOT / 'sources' / (aid + '.png')
    shutil.copy2(src, archive)
    im = Image.open(archive)
    assert im.mode == 'RGBA', im.mode
    alpha = im.getchannel('A'); crop = alpha.getbbox()
    assert alpha.getextrema()[0] == 0
    w, h = p['footprint']; left, front, right = p['corners']
    scale = 32 * (w+h) / (right[0]-left[0])
    cut = im.crop(crop)
    nw, nh = (round(cut.width*scale), round(cut.height*scale))
    scaled = cut.resize((nw,nh), Image.Resampling.LANCZOS)
    width = max(512,math.ceil((nw+96)/32)*32)
    height = max(512,math.ceil((nh+96)/32)*32)
    px, py = (width-nw)//2, (height-nh)//2
    out = Image.new('RGBA',(width,height),(0,0,0,0))
    out.paste(scaled,(px,py))
    target = ROOT / (aid+'.png'); out.save(target)
    anchor_source = [(left[i]+right[i])/2 for i in (0,1)]
    anchor = [round((anchor_source[0]-crop[0])*scale+px,4),
              round((anchor_source[1]-crop[1])*scale+py,4)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    aa=out.getchannel('A'); hist=aa.histogram(); bbox=aa.getbbox()
    refs=[]
    for ref in p['references']:
        refs.append(dict(ref,sha256=sha(ref['file'])))
    e={
      'id':aid,'file':aid+'.png','category':'building-map','style':'default',
      'subject':p['subject'],'prompt':p['prompt'],'negative':p['negative'],
      'references':refs,'tool':'built-in image_gen','model':'image_gen (underlying model not disclosed)',
      'effort':'not exposed by image tool',
      'created':datetime.fromtimestamp(src.stat().st_mtime,timezone.utc).isoformat(),
      'created_time_basis':'源PNG文件mtime；非工具披露的服务端调用时间',
      'source_path':str(src),'source_sha256':sha(archive),
      'size':f'{width}x{height}','sha256':sha(target),'status':'candidate',
      'building':{'type':aid,'footprint':[w,h],'anchor':anchor,'era':'liao_jin_north'},
      'footprint_m':[w,h],'entrance':{'edge':'S','offset_cells':w//2},
      'projection_contract':{'tile_px':[64,32],'ground_bbox_px':[32*(w+h),16*(w+h)],
          'light':'screen_upper_left','shadow':'screen_lower_right_contact_only'},
      'processing':{'source_archive':f'sources/{aid}.png','source_sha256':sha(archive),
          'source_size':list(im.size),'crop_box':list(crop),'uniform_scale_requested':scale,
          'resized_size':[nw,nh],'rounded_effective_scale':[nw/cut.width,nh/cut.height],
          'paste_offset':[px,py],'final_file':aid+'.png',
          'steps':['crop to alpha>0 bbox','one uniform LANCZOS resize (dimensions rounded)',
                   'paste without mask into transparent RGBA padding; alpha retained; no repaint/warp']},
      'geometry_qa':{'source_corners_px':{'left':left,'front':front,'right':right},
          'source_axis_slopes':slopes,'axis_tolerance':0.03,
          'axis_pass':abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
          'source_width_depth_ratio':ratio,'expected_width_depth_ratio':w/h,
          'ratio_relative_error':abs(ratio/(w/h)-1),'ratio_tolerance_suggestion':0.1,
          'ratio_pass':abs(ratio/(w/h)-1)<=0.1,'measurement_uncertainty_source_px':3,
          'source_anchor_px':anchor_source,'anchor_method':'(left+right)/2 then crop/uniform scale/padding',
          'precision_note':'人工读可见底面外边端点，±3px；隐藏后角由平行四边形假设推算。未过阈值不表示通过。'},
      'pixel_qa':{'mode':out.mode,'size':list(out.size),'alpha_extrema':list(aa.getextrema()),
          'alpha_zero_pixels':hist[0],'alpha_partial_pixels':sum(hist[1:255]),
          'alpha_opaque_pixels':hist[255],'alpha_near_opaque_pixels':sum(hist[250:]),
          'alpha_nonzero_bbox':list(bbox),
          'transparent_margins_px':[bbox[0],bbox[1],width-bbox[2],height-bbox[3]],
          'border_alpha_max':max(aa.crop((0,0,width,1)).getextrema()[1],
              aa.crop((0,height-1,width,height)).getextrema()[1],
              aa.crop((0,0,1,height)).getextrema()[1],aa.crop((width-1,0,width,height)).getextrema()[1])},
      'candidate_count':p['candidate_count'],'candidate_records':p['candidate_records'],
      'notes':p['notes'],'metadata':f'meta/{aid}.entry.json'
    }
    # Compact one field per line keeps each output write well under 150 lines.
    body='{\n'+',\n'.join('  '+json.dumps(k,ensure_ascii=False)+': '+json.dumps(v,ensure_ascii=False) for k,v in e.items())+'\n}\n'
    (ROOT/'meta'/(aid+'.entry.json')).write_text(body)
    print(aid, e['size'], 'slopes',slopes,'axis_pass',e['geometry_qa']['axis_pass'],'ratio_error',e['geometry_qa']['ratio_relative_error'])

if __name__=='__main__':
    for spec in sys.argv[1:]: process(spec)
