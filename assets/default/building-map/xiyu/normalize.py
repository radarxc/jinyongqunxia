"""Pure geometry normalization; never paint, recolor, threshold alpha or warp."""
import hashlib
import math
from pathlib import Path
from datetime import datetime, timezone
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def normalize(asset, source, footprint, corners, subject, prompt, basis, notes,
              candidates=1, references=None):
    source = Path(source)
    archive = ROOT / 'sources' / (asset + '.png')
    shutil.copy2(source, archive)
    im = Image.open(archive)
    assert im.mode == 'RGBA', (asset, im.mode)
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] >= 250
    crop = alpha.getbbox()
    left, front, right = corners
    w, h = footprint
    scale = 32 * (w + h) / (right[0] - left[0])
    cut = im.crop(crop)
    size = tuple(round(v * scale) for v in cut.size)
    resized = cut.resize(size, Image.Resampling.LANCZOS)
    canvas = tuple(max(256, math.ceil((v + 64) / 32) * 32) for v in size)
    offset = tuple((a-b)//2 for a,b in zip(canvas,size))
    result = Image.new('RGBA', canvas, (0,0,0,0))
    result.paste(resized, offset)
    target = ROOT / (asset + '.png')
    result.save(target)
    center = [(left[i]+right[i])/2 for i in (0,1)]
    effective = [size[i]/cut.size[i] for i in (0,1)]
    anchor = [round((center[i]-crop[i])*effective[i]+offset[i],4) for i in (0,1)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]),
              (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0])
    a = result.getchannel('A')
    bbox = a.getbbox()
    hist = a.histogram()
    entry = dict(id=asset,file=target.name,category='building-map',style='default',
        subject=subject,prompt=prompt,
        negative='文字、伪字、人物、现代物、背景、厚地台、透视汇聚、卡通、旋转或镜像补朝向',
        references=references or [],tool='built-in image_gen',
        model='image_gen (underlying model not disclosed)',effort='not exposed',
        created=datetime.fromtimestamp(source.stat().st_mtime,timezone.utc).isoformat(),
        created_time_basis='原PNG文件mtime，非服务端调用时间',
        source_path=str(source),size=f'{canvas[0]}x{canvas[1]}',sha256=sha(target),
        status='candidate',notes=notes,
        building=dict(type=asset,footprint=footprint,anchor=anchor,era='xiyu'),
        footprint_m=footprint,footprint_basis=basis,
        entrance=dict(edge='S',offset_cells=(w-1)//2),
        projection_contract=dict(tile_px=[64,32],ground_bbox_px=[32*(w+h),16*(w+h)],
            light='screen_upper_left',shadow='screen_lower_right_contact_only'),
        png_rotations_available=[0],allowRotation=False,
        metadata=f'meta/{asset}.yaml',candidate_count=candidates,
        processing=dict(source_archive=str(archive.relative_to(ROOT)),source_sha256=sha(archive),
            source_size=list(im.size),crop_box=list(crop),uniform_scale_requested=scale,
            resized_size=list(size),rounded_effective_scale=effective,paste_offset=list(offset),
            steps=['alpha>0 bbox crop','uniform LANCZOS resize with pixel rounding',
                   'unmasked paste into transparent canvas; no repaint/warp/alpha threshold']),
        geometry_qa=dict(source_corners_px=dict(left=left,front=front,right=right),
            source_anchor_px=center,source_axis_slopes=slopes,
            axis_tolerance=0.03,axis_pass=abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
            expected_width_depth_ratio=w/h,source_width_depth_ratio=ratio,
            ratio_relative_error=abs(ratio/(w/h)-1),ratio_tolerance_suggestion=.1,
            ratio_pass=abs(ratio/(w/h)-1)<=.1,
            precision_note='人工读取可见底面角点，约±4px；后角遮挡，非3D实测'),
        pixel_qa=dict(mode=result.mode,size=list(canvas),alpha_extrema=list(a.getextrema()),
            alpha_zero_pixels=hist[0],alpha_partial_pixels=sum(hist[1:255]),
            alpha_near_opaque_pixels=sum(hist[250:]),alpha_nonzero_bbox=list(bbox),
            transparent_margins_px=[bbox[0],bbox[1],canvas[0]-bbox[2],canvas[1]-bbox[3]],
            border_alpha_max=max(max(a.crop(b).getextrema()) for b in
                [(0,0,canvas[0],1),(0,canvas[1]-1,canvas[0],canvas[1]),
                 (0,0,1,canvas[1]),(canvas[0]-1,0,canvas[0],canvas[1])]))
    )
    data = yaml.safe_dump(entry,allow_unicode=True,sort_keys=False,width=150)
    assert len(data.splitlines()) <= 150
    (ROOT/'meta'/f'{asset}.yaml').write_text(data)
    return dict(id=asset,size=entry['size'],anchor=anchor,slopes=slopes,
                ratio=ratio,axis_pass=entry['geometry_qa']['axis_pass'],
                ratio_pass=entry['geometry_qa']['ratio_pass'])
