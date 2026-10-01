"""Reproduce selected Mongol house candidates: crop, uniform scale, transparent pad only."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil
import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parent
entries = json.loads((ROOT / 'production-houses.json').read_text())
manifest = ROOT / 'manifest-houses.yaml'
manifest.write_text('', encoding='utf-8')
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()

class NoAliasDumper(yaml.SafeDumper):
    def ignore_aliases(self, data):
        return True

def write_yaml(path, data, append=False):
    text = yaml.dump(data, Dumper=NoAliasDumper, allow_unicode=True, sort_keys=False, width=160)
    lines = text.splitlines(keepends=True)
    if not append:
        path.write_text('', encoding='utf-8')
    for i in range(0, len(lines), 140):
        with path.open('a', encoding='utf-8') as f:
            f.write(''.join(lines[i:i + 140]))

for e in entries:
    asset_id, fp = e['id'], e['footprint']
    chosen = e['candidates'][e['selected'] - 1]
    src = Path(chosen['source'])
    archive = ROOT / 'sources' / (asset_id + '.png')
    shutil.copy2(src, archive)
    original = Image.open(archive)
    assert original.mode == 'RGBA', (asset_id, original.mode)
    alpha = original.getchannel('A')
    assert alpha.getextrema()[0] == 0 and alpha.getextrema()[1] > 0
    box = alpha.getbbox()
    left, front, right = e['points']
    rear = [left[0] + right[0] - front[0], left[1] + right[1] - front[1]]
    center = [(left[0] + right[0]) / 2, (left[1] + right[1]) / 2]
    scale = 32 * sum(fp) / (right[0] - left[0])
    crop = original.crop(box)
    resized_size = [round(crop.width * scale), round(crop.height * scale)]
    scaled = crop.resize(resized_size, Image.Resampling.LANCZOS)
    size = [max(512, resized_size[0] + 32), max(512, resized_size[1] + 32)]
    offset = [(size[0] - resized_size[0]) // 2, (size[1] - resized_size[1]) // 2]
    final = Image.new('RGBA', size, (0, 0, 0, 0))
    final.paste(scaled, tuple(offset))
    path = ROOT / (asset_id + '.png')
    final.save(path)
    transform = lambda p: [round((p[i] - box[i]) * scale + offset[i], 4) for i in range(2)]
    anchor = transform(center)
    slopes = [(front[1] - left[1]) / (front[0] - left[0]), (right[1] - front[1]) / (right[0] - front[0])]
    ratio = (front[0] - left[0]) / (right[0] - front[0])
    ratio_error = abs(ratio / (fp[0] / fp[1]) - 1)
    geometry = {'source_corners_px': {'left': left, 'front': front, 'right': right, 'rear_inferred': rear},
        'source_anchor_px': center, 'source_axis_slopes': slopes, 'axis_tolerance': 0.03,
        'axis_pass': abs(slopes[0] - 0.5) <= 0.03 and abs(slopes[1] + 0.5) <= 0.03,
        'source_width_depth_ratio': ratio, 'expected_width_depth_ratio': fp[0] / fp[1],
        'ratio_relative_error': ratio_error, 'ratio_tolerance_suggestion': 0.1, 'ratio_pass': ratio_error <= 0.1,
        'measurement_uncertainty_source_px': 5,
        'precision_note': '人工读取可见土面边界，约±5px；后角按平行四边形推算，锚点为左右角中点。仅宽度标定，未修正投影残差；不是精确3D测量。'}
    a = final.getchannel('A')
    hist, bbox = a.histogram(), a.getbbox()
    qa = {'mode': final.mode, 'size': size, 'alpha_extrema': list(a.getextrema()),
        'alpha_zero_pixels': hist[0], 'alpha_partial_pixels': sum(hist[1:255]), 'alpha_opaque_pixels': hist[255],
        'alpha_nonzero_bbox': list(bbox), 'transparent_margins_px': [bbox[0], bbox[1], size[0] - bbox[2], size[1] - bbox[3]],
        'border_alpha_max': max(a.crop((0, 0, size[0], 1)).getextrema()[1], a.crop((0, size[1]-1, size[0], size[1])).getextrema()[1], a.crop((0, 0, 1, size[1])).getextrema()[1], a.crop((size[0]-1, 0, size[0], size[1])).getextrema()[1])}
    processing = {'source_archive': 'sources/' + archive.name, 'source_sha256': sha(archive), 'source_size': list(original.size),
        'crop_box': list(box), 'uniform_scale_requested': scale, 'resized_size': resized_size,
        'rounded_effective_scale': [resized_size[0] / crop.width, resized_size[1] / crop.height],
        'paste_offset': offset, 'final_file': path.name,
        'steps': ['crop alpha>0 bbox', 'uniform LANCZOS resize, dimensions rounded to nearest pixel', 'paste unmasked onto transparent RGBA canvas; no warp, repaint, flip or alpha threshold']}
    building = {'type': asset_id, 'footprint': fp, 'anchor': anchor, 'era': 'mongol'}
    contract = {'tile_px': [64, 32], 'ground_bbox_target_px': [32*sum(fp), 16*sum(fp)],
        'ground_width_px': 32*sum(fp), 'ground_height_measured_px': round((front[1] - rear[1]) * scale, 4),
        'light': 'screen_upper_left', 'shadow': 'screen_lower_right_contact_only', 'projection_verified': False}
    meta = {'id': asset_id, 'status': 'candidate', 'building': building, 'anchor_px': list(anchor), 'footprint_m': fp,
        'footprint_basis': e['basis'], 'measured_ground_polygon_px': [transform(p) for p in [left, front, right, rear]],
        'collision_polygon_m': [[0, 0], [fp[0], 0], fp, [0, fp[1]]],
        'collision_note': '全占地仅规划阻挡代理；毡帐/院落内可行走区域另需细化，不含阴影。',
        'entrance': {'edge': 'S', 'offset_cells': (fp[0]-1)//2}, 'entrance_note': '规划边中点代理，非门洞实测（待实测）',
        'height_m': None, 'height_note': '未测量；不能由roof顶点与center直接反推整体高度。',
        'planning_rotations_allowed': [0, 90, 180, 270], 'png_rotations_available': [0], 'allowRotation': False,
        'views': [{'rotation_deg': 0, 'yaw_deg_requested': 45, 'pitch_deg_requested': 30, 'file': path.name}], 'glb': None,
        'projection_contract': contract, 'geometry_qa': geometry, 'pixel_qa': qa, 'processing': processing,
        'selected_candidate': e['selected'], 'visual_review': e['note'], 'release_ready': False}
    write_yaml(ROOT / 'meta' / (asset_id + '.yaml'), meta)
    visual_refs = [{'file': 'assets/default/baseline/building-map/bld_kit_song_southern_shop_1f.png', 'role': '人工view_image对照材质与细节密度；未作为工具输入'},
                   {'file': 'assets/default/baseline/building-map/bld_kit_song_dali_inn.png', 'role': '人工view_image对照材质与细节密度；未作为工具输入'}]
    refs = []
    if e['key'] == 'courtyard':
        edit_input = Path(e['candidates'][0]['source'])
        edit_archive = ROOT / 'sources' / (asset_id + '__edit_input.png')
        shutil.copy2(edit_input, edit_archive)
        refs.append({'file': 'sources/' + edit_archive.name, 'source_path': str(edit_input), 'role': '第二候选image_gen编辑输入', 'sha256': sha(edit_archive)})
    record = {'id': asset_id, 'file': path.name, 'category': 'building-map', 'style': 'default',
        'subject': '蒙古草原/和林13世纪意象·' + e['subject'] + '（原创扩展；具体年代细部待考）', 'prompt': chosen['prompt'],
        'negative': '文字、水印、人物、现代旅游毡帐、景观背景、厚底座、裁切、透视汇聚', 'references': refs,
        'visual_baseline_refs': visual_refs,
        'tool': 'built-in image_gen', 'model': 'image_gen (underlying model not disclosed)', 'effort': 'not exposed by image tool',
        'created': datetime.fromtimestamp(src.stat().st_mtime, timezone.utc).isoformat(),
        'created_time_basis': '源PNG文件mtime；非工具披露的服务端调用时间', 'source_path': str(src), 'source_sha256': sha(src),
        'size': f'{size[0]}x{size[1]}', 'sha256': sha(path), 'status': 'candidate', 'building': building,
        'footprint_m': fp, 'entrance': meta['entrance'], 'projection_contract': contract, 'metadata': 'meta/' + asset_id + '.yaml',
        'processing': processing, 'notes': e['basis'] + '；' + e['note'] + '仅候选，未完成四向/GLB、碰撞与总装实测。'}
    write_yaml(manifest, [record], append=True)
    print(asset_id, size, 'axis_pass', geometry['axis_pass'], 'ratio_error', round(ratio_error, 4))
