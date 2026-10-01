"""Rebuild only the selected R3 wharf: alpha crop, uniform resize, transparent pad."""
from pathlib import Path
import hashlib, json, math, shutil
from PIL import Image
D = Path(__file__).resolve().parent
ROOT = D.parents[1]
source = D / 'candidate_2.png'
target = ROOT / 'bld_kit_ming_south_wharf.png'
if not (D / 'original.png').exists():
    shutil.copyfile(target, D / 'original.png')
im = Image.open(source)
assert im.mode == 'RGBA'
box = im.getchannel('A').getbbox()
crop = im.crop(box)
scale = 448 / (1315 - 223)
size = tuple(round(n * scale) for n in crop.size)
resized = crop.resize(size, Image.Resampling.LANCZOS)
canvas = tuple(max(256, math.ceil((n + 32) / 16) * 16) for n in size)
offset = tuple((n - m) // 2 for n, m in zip(canvas, size))
out = Image.new('RGBA', canvas)
out.paste(resized, offset)
out.save(target)
sx, sy = [a / b for a, b in zip(size, crop.size)]
anchor = [((223 + 1315) / 2 - box[0]) * sx + offset[0], ((461 + 710) / 2 - box[1]) * sy + offset[1]]
alpha = out.getchannel('A')
record = json.loads((D / 'result.json').read_text())
record['normalization_applied'] = True
record['processing'] = dict(source_file=str(source.relative_to(ROOT)), crop=list(box), nominal_scale=scale, resized=list(size), canvas=list(canvas), paste=list(offset), scale_xy=[sx, sy], anchor_px=anchor, final_sha256=hashlib.sha256(target.read_bytes()).hexdigest(), alpha_extrema=list(alpha.getextrema()), alpha_bbox=list(alpha.getbbox()), alpha_zero_pixels=alpha.histogram()[0], method='all nonzero-alpha bbox, LANCZOS uniform nominal scale with integer rounding, transparent pad; no mask/warp/repaint')
record['attempts'][1]['decision_reason'] = '双轴在±0.03内，比例残差2.28%；选择改善候选，保留残差供审校，不宣称精确网格对齐'
(D / 'result.json').write_text(json.dumps(record, ensure_ascii=False) + '\n')
print(json.dumps(record['processing'], ensure_ascii=False))
