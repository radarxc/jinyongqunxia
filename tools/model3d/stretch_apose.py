#!/usr/bin/env python3
"""把 A 字参考图「脖子以下」纵向拉长，做 Tripo 的输入图（AR-85 比例补偿）。头部（脖子线以上）原样不动，画布按需加高。

用法：
  python3 tools/model3d/stretch_apose.py <A字图.png> <输出.png> --neck <脖子线 y 像素> --scale <倍数>
  python3 tools/model3d/stretch_apose.py <A字图.png> <输出.png> --neck 249 --target 9.14 --skull 60 --chin 237
    第二种按目标 2D 头身比（头顶骨到下巴为一头，不含发髻）反算倍数。

背景必须是纯色：拉伸只是逐行纵向重采样，背景跟着拉也看不出来。
Tripo 会把头做大约 4–15%（AR-79 实测），所以 2D 目标 = 3D 目标 × 放大系数。
"""
import argparse, json, hashlib
from PIL import Image


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--neck', type=int, required=True, help='脖子线（像素行）：这一行以上原样保留')
    ap.add_argument('--scale', type=float, help='脖子线以下的纵向倍数')
    ap.add_argument('--target', type=float, help='目标 2D 头身比（与 --skull / --chin 一起用）')
    ap.add_argument('--skull', type=int, help='头顶骨（不含发髻）的像素行'); ap.add_argument('--chin', type=int, help='下巴的像素行')
    ap.add_argument('--bottom', type=int, help='脚底像素行（默认自动找：从下往上第一行非背景）')
    a = ap.parse_args()
    im = Image.open(a.src).convert('RGB'); W, H = im.size
    bottom = a.bottom
    if bottom is None:
        px = im.load(); bg = px[2, H - 2]
        bottom = next(y for y in range(H - 1, 0, -1) if any(max(abs(px[x, y][k] - bg[k]) for k in range(3)) > 28 for x in range(0, W, 2)))
    s = a.scale
    if s is None:
        if not (a.target and a.skull is not None and a.chin is not None): ap.error('给 --scale，或者 --target --skull --chin')
        h = a.chin - a.skull; need = (a.target - 1) * h          # 下巴以下需要的像素
        s = (need - (a.neck - a.chin)) / (bottom - a.neck)
    top = im.crop((0, 0, W, a.neck)); low = im.crop((0, a.neck, W, H))
    low = low.resize((W, round((H - a.neck) * s)), Image.LANCZOS)
    out = Image.new('RGB', (W, a.neck + low.height)); out.paste(top, (0, 0)); out.paste(low, (0, a.neck)); out.save(a.dst, optimize=True)
    info = {'src': a.src, 'src_sha256': hashlib.sha256(open(a.src, 'rb').read()).hexdigest(), 'dst': a.dst, 'dst_sha256': hashlib.sha256(open(a.dst, 'rb').read()).hexdigest(),
            'neck_row': a.neck, 'scale_below_neck': round(s, 4), 'src_size': [W, H], 'dst_size': list(out.size), 'feet_row_src': bottom,
            'feet_row_dst': round(a.neck + (bottom - a.neck) * s)}
    if a.skull is not None and a.chin is not None:
        h = a.chin - a.skull
        info['heads_2d_before'] = round((bottom - a.skull) / h, 3); info['heads_2d_after'] = round((info['feet_row_dst'] - a.skull) / h, 3)
    print(json.dumps(info, ensure_ascii=False))


if __name__ == '__main__':
    main()
