"""第3轮两门：仅矩形裁边、精确1/2等比缩小与8px透明扩边。"""
from pathlib import Path
import hashlib, json
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
SPECS = {
    'k4': {'candidate': 2, 'crop': [232, 136, 1142, 934], 'L': [302, 666], 'F': [812, 922], 'R': [1071, 791], 'opening': [[428, 731], [685, 855]], 'fits': [0.520978, -0.506823, 0.525596, -0.506522]},
    'k6': {'candidate': 1, 'crop': [168, 100, 1204, 964], 'L': [236, 632], 'F': [876, 953], 'R': [1134, 823], 'opening': [[364, 697], [748, 887]], 'fits': [0.509989, -0.502893, 0.509095, -0.504014]},
}
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
for key, spec in SPECS.items():
    ident = f'tex_town_yuan_north_city_gate__{key}_r000_v01'
    src = ROOT / 'source' / f'gate_{key}_repair3_c{spec["candidate"]}.png'
    im = Image.open(src); crop = spec['crop']; body = im.crop(crop)
    body = body.resize((body.width // 2, body.height // 2), Image.Resampling.LANCZOS)
    out = Image.new('RGBA', (body.width + 16, body.height + 16)); out.paste(body, (8, 8))
    dst = ROOT / f'{ident}.png'; out.save(dst)
    L, F, R = (spec[x] for x in ('L', 'F', 'R'))
    slopes = [(F[1]-L[1])/(F[0]-L[0]), (R[1]-F[1])/(R[0]-F[0])]
    center = [(L[i]+R[i])/2 for i in range(2)]
    transform = lambda p: [(p[i]-crop[i])*0.5+8 for i in range(2)]
    opening = spec['opening']; net_width = (opening[1][0]-opening[0][0])*0.5/32
    datum = dict(spec, id=ident, source_copy=str(src.relative_to(ROOT)), source_sha256=sha(src), sha256=sha(dst), size=list(out.size), anchor=transform(center), source_anchor=center, slopes=slopes, net_width=net_width, measured_width_depth_ratio=(F[0]-L[0])/(R[0]-F[0]), final_corners=[transform(p) for p in (L,F,R)], final_opening=[transform(p) for p in opening], alpha_extrema=list(out.getchannel('A').getextrema()), alpha_bbox=out.getbbox(), source_bbox=im.getbbox())
    # 仅写新的一行结果；manifest与现有QA由小补丁按字段更新。
    (ROOT / 'source' / f'gate_{key}_repair3_processing.json').write_text(json.dumps(datum, ensure_ascii=False) + '\n')
    print(ident, 'size', out.size, 'slopes', slopes, 'net_width_m', net_width, 'alpha', datum['alpha_extrema'])
