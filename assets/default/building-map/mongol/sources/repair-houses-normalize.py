"""Second-run selected assets: crop, uniform resize, pad; emit small metadata patches."""
from pathlib import Path
import hashlib, json, shutil, re
from datetime import datetime, timezone
from PIL import Image
import yaml

ROOT = Path(__file__).resolve().parents[1]
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
data = json.loads((ROOT / 'sources/repair-houses-data.json').read_text())
manifest = {e['id']: e for e in yaml.safe_load((ROOT / 'manifest.yaml').read_text())}
entries, patches = [], []
def append_prompts(e, aid, note):
    with (ROOT / 'prompts' / (aid + '.md')).open('a') as f:
        f.write('\n## 第2轮投影返修（2026-09-30）\n\n')
        for i, cand in enumerate(e['candidates'], 1):
            f.write(f'本轮候选{i}（'+('采用' if i == e['selected'] else '未采用')+'）：\n\n'+cand['prompt']+'\n\n')
        f.write(note+'\n来源PNG保留在sources/*__r2_c*.png；本轮仍用built-in image_gen，透明参数true。\n')

for e in data:
    aid = 'bld_kit_mongol_' + e['name']; old = manifest[aid]
    for i, cand in enumerate(e['candidates'], 1):
        shutil.copy2(cand['source'], ROOT / 'sources' / f'{aid}__r2_c{i:02}.png')
    if e['selected'] == 0:
        note = '第2轮已重出2候选，轴率及占地比例综合未优于旧图；保留旧成品字节，投影仍未修复。'
        record = dict(old, repair_round=2, repair_attempts=e['candidate_measurements'], notes=old['notes']+' '+note)
        entries.append(record); append_prompts(e, aid, note)
        metapath = ROOT / 'meta' / (aid + '.yaml')
        patches.append('*** Begin Patch\n*** Update File: '+str(metapath.relative_to(Path.cwd()))+'\n@@\n release_ready: false\n+repair_attempts: '+json.dumps(e['candidate_measurements'],ensure_ascii=False)+'\n+repair_result: '+json.dumps(note,ensure_ascii=False)+'\n*** End Patch')
        print(aid, 'retained original', old['size']); continue
    chosen = e['candidates'][e['selected'] - 1]
    archive = f'sources/{aid}__r2_c{e["selected"]:02}.png'
    src = ROOT / archive; im = Image.open(src); assert im.mode == 'RGBA'
    box = im.getchannel('A').getbbox(); crop = im.crop(box)
    fp = old['building']['footprint']; left, front, right = e['points']
    rear = [left[i] + right[i] - front[i] for i in range(2)]
    center = [(left[i] + right[i]) / 2 for i in range(2)]
    scale = 32 * sum(fp) / (right[0] - left[0])
    rs = [round(crop.width * scale), round(crop.height * scale)]
    sz = [max(512, rs[0] + 32), max(512, rs[1] + 32)]
    off = [(sz[i] - rs[i]) // 2 for i in range(2)]
    out = Image.new('RGBA', sz, (0, 0, 0, 0))
    out.paste(crop.resize(rs, Image.Resampling.LANCZOS), tuple(off)); dest = ROOT / (aid + '.png'); out.save(dest)
    effective = [rs[0] / crop.width, rs[1] / crop.height]
    tx = lambda p: [round((p[i] - box[i]) * effective[i] + off[i], 4) for i in range(2)]
    slopes = [(front[1]-left[1])/(front[0]-left[0]), (right[1]-front[1])/(right[0]-front[0])]
    ratio = (front[0]-left[0])/(right[0]-front[0]); err = abs(ratio/(fp[0]/fp[1])-1)
    axis_pass = abs(slopes[0]-.5) <= .03 and abs(slopes[1]+.5) <= .03
    geometry = {'source_corners_px': {'left': left, 'front': front, 'right': right, 'rear_inferred': rear}, 'source_anchor_px': center, 'source_axis_slopes': slopes, 'axis_tolerance': .03, 'axis_pass': axis_pass, 'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': fp[0]/fp[1], 'ratio_relative_error': err, 'ratio_tolerance_suggestion': .1, 'ratio_pass': err <= .1, 'measurement_uncertainty_source_px': 5, 'precision_note': '返修源图可见土面角人工量取约±5px；后角由L+R-F推算，锚点为L/R中点；未warp。', 'edge_note': e.get('edge_note', '')}
    a = out.getchannel('A'); hist = a.histogram(); bbox = a.getbbox()
    geometry.update(e.get('additional_geometry', {}))
    qa = {'mode': out.mode, 'size': sz, 'alpha_extrema': list(a.getextrema()), 'alpha_zero_pixels': hist[0], 'alpha_partial_pixels': sum(hist[1:255]), 'alpha_opaque_pixels': hist[255], 'alpha_nonzero_bbox': list(bbox), 'transparent_margins_px': [bbox[0], bbox[1], sz[0]-bbox[2], sz[1]-bbox[3]], 'border_alpha_max': 0}
    processing = {'source_archive': archive, 'source_sha256': sha(src), 'source_size': list(im.size), 'crop_box': list(box), 'uniform_scale_requested': scale, 'resized_size': rs, 'rounded_effective_scale': effective, 'paste_offset': off, 'final_file': dest.name, 'steps': ['crop alpha>0 bbox', 'uniform LANCZOS resize, dimensions rounded to nearest pixel', 'paste unmasked onto transparent RGBA canvas; no warp, repaint, flip or alpha threshold']}
    anchor = tx(center); building = dict(old['building'], anchor=anchor)
    contract = dict(old['projection_contract'], ground_width_px=round(tx(right)[0]-tx(left)[0],4), ground_height_measured_px=round(tx(front)[1]-tx(rear)[1],4), projection_verified=e.get('projection_verified', axis_pass and err <= .1))
    note = f'第2轮返修采用本轮候选{e["selected"]}；轴率{slopes[0]:.5f}/{slopes[1]:.5f}；宽深比{ratio:.5f}，目标{fp[0]/fp[1]:.5f}；轴率/比例检查分别{axis_pass}/{err <= .1}。仍为candidate，非3D/四向及总装验收。'
    meta = {'building': building, 'anchor_px': anchor, 'measured_ground_polygon_px': [tx(p) for p in [left,front,right,rear]], 'projection_contract': contract, 'geometry_qa': geometry, 'pixel_qa': qa, 'processing': processing, 'selected_candidate': f'run2-c{e["selected"]}', 'visual_review': note}
    metapath = ROOT / 'meta' / (aid + '.yaml'); oldtext = metapath.read_text()
    for key, value in meta.items():
        match = re.search(r'^'+re.escape(key)+r':[^\n]*(?:\n(?![^\s\-\n][^\n]*:)[^\n]*)*', oldtext, re.M)
        assert match, key
        before = match.group(0).rstrip('\n'); after = key + ': ' + json.dumps(value, ensure_ascii=False)
        assert len(before.splitlines()) + len(after.splitlines()) <= 46, (key, len(before.splitlines()))
        patches.append('*** Begin Patch\n*** Update File: '+str(metapath.relative_to(Path.cwd()))+'\n@@\n'+'\n'.join('-'+s for s in before.splitlines())+'\n+'+after+'\n*** End Patch')
    created = datetime.fromtimestamp(Path(chosen['source']).stat().st_mtime, timezone.utc).isoformat()
    record = dict(old, prompt=chosen['prompt'], source_path=chosen['source'], source_sha256=sha(src), created=created, size=f'{sz[0]}x{sz[1]}', sha256=sha(dest), building=building, projection_contract=contract, processing=processing, notes=old['notes'].split('；')[0]+'；'+note)
    record['repair_round'] = 2; record['previous_source'] = {'source_path': old['source_path'], 'source_sha256': old['source_sha256'], 'source_archive': old['processing']['source_archive'], 'references': old.get('references', [])}
    record['references'] = [{'file': f'sources/{aid}__r2_c01.png', 'role': '本轮第二候选的题材编辑输入', 'sha256': sha(ROOT / f'sources/{aid}__r2_c01.png')}] if e['selected'] == 2 else []
    if e['selected'] == 2 and e['name'] != 'house_small':
        guide = 'sources/bld_kit_mongol_house_small__r2_c02.png'
        record['references'].append({'file': guide, 'role': '第二候选的底面投影参考；其建筑内容不采用', 'sha256': sha(ROOT / guide)})
    record['geometry_qa'] = geometry
    record['repair_attempts'] = e['candidate_measurements']
    entries.append(record)
    append_prompts(e, aid, note)
    print(aid, sz, slopes, ratio, axis_pass, err <= .1)
(ROOT / 'repair-houses-entries.json').write_text('[\n'+',\n'.join(json.dumps(x,ensure_ascii=False) for x in entries)+'\n]\n')
(ROOT / 'sources/repair-houses-meta-patches.json').write_text(json.dumps(patches,ensure_ascii=False))
