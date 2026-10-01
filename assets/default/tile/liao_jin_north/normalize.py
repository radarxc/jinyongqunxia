"""Replay selected tile geometry only; preserve original RGBA and source bytes."""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[3]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, data):
    lines = (json.dumps(data, ensure_ascii=False, indent=2) + '\n').splitlines(True)
    with path.open('w', encoding='utf-8') as out:
        for start in range(0, len(lines), 100):
            out.write(''.join(lines[start:start + 100]))

def normalize(spec):
    ident = spec['id']
    src = Path(spec['source_path'])
    archive = ROOT / 'source' / (ident + '.png')
    archive.parent.mkdir(exist_ok=True)
    if src.exists():
        shutil.copy2(src, archive)
    im = Image.open(archive)
    assert im.mode == 'RGBA' and im.getchannel('A').getextrema()[0] == 0
    box = im.getchannel('A').getbbox()
    geo = {'measurement_uncertainty_source_px': 5}
    if spec['points']:
        left, front, right = spec['points']
        source_anchor = [(left[n] + right[n]) / 2 for n in (0, 1)]
        scale = 32 * sum(spec['footprint']) / (right[0] - left[0])
        slopes = [(front[1]-left[1])/(front[0]-left[0]),
                  (right[1]-front[1])/(right[0]-front[0])]
        ratio = (front[0]-left[0])/(right[0]-front[0])
        expected = spec['footprint'][0]/spec['footprint'][1]
        geo.update(source_corners_px={'left': left, 'front': front, 'right': right},
                   source_axis_slopes=slopes, axis_tolerance=0.03,
                   axis_pass=abs(slopes[0]-.5)<=.03 and abs(slopes[1]+.5)<=.03,
                   expected_width_depth_ratio=expected, source_width_depth_ratio=ratio,
                   ratio_relative_error=abs(ratio/expected-1), ratio_pass=abs(ratio/expected-1)<=.1)
    else:
        source_anchor = spec['root']
        scale = spec['visual_height_target']/(source_anchor[1]-spec['visual_top'])
        geo.update(axis_pass=None, source_root_px=source_anchor,
                   visual_height_target_px=320, note='植物树干根锚；占地1×1是种植点包络，非树冠尺寸；无可量底面两轴。')
    geo['measurement_note'] = spec.get('measurement_note', '人工量读底面角；非文物实测或3D相机反解，目标与实测分列。')
    crop = im.crop(box)
    resized = crop.resize(tuple(max(1, round(v * scale)) for v in crop.size), Image.Resampling.LANCZOS)
    size = (max(32, resized.width+32), max(32, resized.height+32))
    offset = [(size[n]-resized.size[n])//2 for n in (0, 1)]
    final = Image.new('RGBA', size, (0, 0, 0, 0))
    final.paste(resized, offset)
    dst = ROOT / (ident + '.png')
    final.save(dst)
    anchor = [round((source_anchor[n]-box[n])*scale+offset[n], 4) for n in (0, 1)]
    alpha = final.getchannel('A')
    hist = alpha.histogram()
    references = []
    for value in spec['references']:
        p = Path(value) if value.startswith('/') else REPO / value
        references.append({'file': value, 'sha256': sha(p), 'role': '实际输入：写实材质、细节密度与构图参考；不继承史实断代'})
    kind, variant = ident.removeprefix('tex_town_liao_jin_north_').split('__')
    entry = dict(id=ident, file=dst.name, category='tile', style='default', subject=spec['subject'],
                 prompt=spec['prompt'], negative='无字、无人、无现代物、无背景、无厚地台、无假棋盘透明、无透视汇聚',
                 references=references, tool='built-in image_gen', model='image_gen (backend undisclosed)',
                 effort='not exposed by image tool', created=datetime.fromtimestamp(archive.stat().st_mtime, timezone.utc).isoformat(),
                 created_time_basis='源PNG文件mtime；非服务端回执时间', source_path=spec['source_path'],
                 size=f'{size[0]}x{size[1]}', sha256=sha(dst), status='candidate',
                 tile=dict(kind=kind, footprint=spec['footprint'], variant=variant, autotile_mask=None),
                 source_copy=str(archive.relative_to(ROOT)), source_sha256=sha(archive), anchor_px=anchor,
                 candidate_count=spec['candidate_count'], selected_candidate=spec['selected_candidate'],
                 png_rotations_available=[0], allowRotation=False, geometry_qa=geo,
                 processing=dict(source_size=list(im.size), crop_box=list(box), uniform_scale=scale,
                                 resized_size=list(resized.size), paste_offset=offset,
                                 steps=['alpha bbox crop', 'uniform LANCZOS resize with integer rounding', 'transparent padding; no mask, repaint, warp, rotation or alpha threshold']),
                 pixel_qa=dict(mode=final.mode, alpha_extrema=list(alpha.getextrema()), alpha_zero_pixels=hist[0],
                               alpha_near_opaque_pixels=sum(hist[250:]), alpha_nonzero_bbox=list(alpha.getbbox()), border_alpha_max=0),
                 notes='原图及成品逐张view_image；左上光/右下接触影，写实古风候选；几何残差见geometry_qa，单视图，装配待实测。')
    if 'pass_width' in spec:
        k = spec['pass_width']
        entry['gate_contract'] = dict(width_cells=k, footprint_cells={'w': k+4, 'h': 4}, passage_cells={'w': k, 'h': 4},
                                      passage_ratio_target=k/(k+4), passage_ratio_observed=spec['passage_ratio_observed'],
                                      source_opening_alpha_samples=[{'point': p, 'alpha': im.getpixel(tuple(p))[3]} for p in spec['alpha_probes']],
                                      passage_alignment_pass=False, note='净宽是逻辑掩膜目标；视觉孔与轴线有偏差，不能宣称精确对格；孔内透明采样不替代完整掩膜验证。')
    if not spec['points']:
        entry['notes'] += ' 植物仅北方物种意象，辽金庭院栽植位置待考；根锚，不含碰撞定义。'
    if kind == 'bridge_deck':
        entry['notes'] += ' 本张含桥栏，仅静态预览；运行时前栏遮挡须分层。'
    write_json(ROOT / 'meta' / (ident + '.entry.json'), entry)
    print(ident, entry['size'], anchor, geo.get('source_axis_slopes'))

if __name__ == '__main__':
    for path in sorted((ROOT / 'meta').glob('*.input.json')):
        normalize(json.loads(path.read_text()))
