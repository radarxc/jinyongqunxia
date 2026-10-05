"""Reproduce only crop/uniform resize/padding for buildings_b deliverables."""
from pathlib import Path
import datetime, hashlib, json, math, shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parents[3]
KINDS = 'yamen biaoju manor palace_hall temple_hall pagoda guardhouse warehouse wharf'.split()

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def save_text(p, text):
    lines = text.splitlines(keepends=True)
    for start in range(0, len(lines), 100):
        with p.open('w' if start == 0 else 'a', encoding='utf-8') as f:
            f.writelines(lines[start:start + 100])

for kind in KINDS:
    asset_id = 'bld_kit_song_north_' + kind
    cfg = json.loads((ROOT / 'sources' / (asset_id + '.generation.json')).read_text())
    selected = cfg['candidates'][cfg['selected_candidate'] - 1]
    history = []
    for c in cfg['candidates']:
        source = Path(c['source_path'])
        archive = ROOT / 'sources' / (asset_id + f".candidate{c['number']}.png")
        shutil.copy2(source, archive)
        history.append(dict(c, source_archive=str(archive.relative_to(ROOT)), source_sha256=sha(archive)))
    source = Path(selected['source_path'])
    im = Image.open(source)
    assert im.mode == 'RGBA', (asset_id, im.mode)
    alpha = im.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] > 0
    bbox = alpha.getbbox()
    w, h = cfg['footprint']
    corners = cfg['source_corners_px']
    left, front, right = [corners[k] for k in ('left', 'front', 'right')]
    scale = 32 * (w + h) / (right[0] - left[0])
    cut = im.crop(bbox)
    dims = [round(cut.width * scale), round(cut.height * scale)]
    cut = cut.resize(dims, Image.Resampling.LANCZOS)
    size = [max(256, int(math.ceil((n + 64) / 16)) * 16) for n in dims]
    offset = [(size[i] - dims[i]) // 2 for i in range(2)]
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    out.paste(cut, offset)
    final = ROOT / (asset_id + '.png')
    out.save(final)
    anchor = [((left[i] + right[i]) / 2 - bbox[i]) * dims[i] / (bbox[i + 2] - bbox[i]) + offset[i] for i in range(2)]
    slopes = [(front[1] - left[1]) / (front[0] - left[0]), (right[1] - front[1]) / (right[0] - front[0])]
    ratio = (front[0] - left[0]) / (right[0] - front[0])
    ratio_error = abs(ratio / (w / h) - 1)
    a = out.getchannel('A'); hist = a.histogram(); bb = a.getbbox()
    margins = [bb[0], bb[1], out.width - bb[2], out.height - bb[3]]
    assert min(margins) >= 16
    ref = Path(selected['reference_path'])
    entry = dict(id=asset_id, file=final.name, category='building-map', style='default', subject=cfg['subject'],
        prompt=selected['prompt'], negative='文字、水印、现代元素、人物、场景背景、厚底座、塑料感、清式重彩、黄琉璃宫顶、透视汇聚',
        references=[dict(id=ref.stem, file=str(ref.relative_to(REPO)), sha256=sha(ref), role='宋套件仅材质与写实细节参考；非本图几何或历史准确性背书')],
        tool='built-in image_gen', model='image_gen (underlying model not disclosed)', effort='not exposed by image tool',
        created=datetime.datetime.fromtimestamp(source.stat().st_mtime, datetime.timezone.utc).isoformat(),
        created_time_basis='源PNG文件mtime；非服务端披露调用时间', source_path=str(source), source_sha256=sha(source),
        size=f'{out.width}x{out.height}', sha256=sha(final), status='candidate',
        building=dict(type=asset_id, footprint=[w, h], anchor=[round(n, 4) for n in anchor], era='song_north'),
        footprint_m=[w, h], anchor_px=[round(n, 4) for n in anchor], allowRotation=False, views=['S'], entrance=dict(edge='S'),
        projection_contract=dict(tile_px=[64, 32], ground_bbox_px=[32*(w+h), 16*(w+h)], camera_target='yaw45 pitch30 orthographic 2:1', light='screen_upper_left', shadow='screen_lower_right_contact_only'),
        candidate_count=len(history), selected_candidate=cfg['selected_candidate'], source_record=f'sources/{asset_id}.provenance.json',
        processing=dict(source_archive=history[cfg['selected_candidate']-1]['source_archive'], source_size=list(im.size), crop_box=list(bbox),
            uniform_scale_requested=scale, resized_size=dims, rounded_effective_scale=[dims[i]/(bbox[i+2]-bbox[i]) for i in range(2)],
            paste_offset=offset, final_canvas=size, steps=['crop alpha>0 bounding box', 'one uniform LANCZOS resize with integer size rounding', 'pad RGBA; original alpha preserved; no thresholding, repaint, warp or flip']),
        geometry_qa=dict(source_corners_px=corners, anchor_method='(left+right)/2; rear inferred as left+right-front',
            source_axis_slopes=slopes, axis_tolerance=0.03, axis_pass=all(abs(abs(m)-0.5)<=0.03 for m in slopes),
            source_width_depth_ratio=ratio, expected_width_depth_ratio=w/h, ratio_relative_error=ratio_error, ratio_tolerance_suggestion=0.1,
            ratio_pass=ratio_error<=0.1, measurement_uncertainty_source_px=4, precision_note='人工量可见薄底面三角点；后角遮挡推算，非测绘；残差不以几何变形修正'),
        pixel_qa=dict(mode=out.mode, size=list(out.size), alpha_extrema=list(a.getextrema()), alpha_zero_pixels=hist[0],
            alpha_partial_pixels=sum(hist[1:255]), alpha_opaque_pixels=hist[255], alpha_near_opaque_pixels=sum(hist[240:]),
            alpha_nonzero_bbox=list(bb), transparent_margins_px=margins, border_alpha_max=0),
        notes='已逐张view_image原图与最终PNG自查。' + cfg['notes'] + '单视图；运行时拼接待实测；形制组合为原创扩展，细部待考。')
    (ROOT / 'entries').mkdir(exist_ok=True)
    save_text(ROOT / 'entries' / (asset_id + '.yaml'), yaml.safe_dump(entry, allow_unicode=True, sort_keys=False, width=150))
    provenance = dict(entry=entry, candidates=history, geometry_formula='s=32(w+h)/(Rx-Lx); image size rounded; anchor[i]=(source_anchor[i]-crop[i])*resized_size[i]/crop_size[i]+paste_offset[i]')
    save_text(ROOT / 'sources' / (asset_id + '.provenance.json'), json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
    print(kind, entry['size'], 'slopes', [round(v, 4) for v in slopes], 'ratio_error', round(ratio_error, 4), 'margin', min(margins))
