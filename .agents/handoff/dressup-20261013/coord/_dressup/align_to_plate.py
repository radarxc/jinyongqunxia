"""把 agy 产物整图缩放 / 平移到模板底图画布：人物高相同、脚底对齐、头顶冠带中心对齐；只做整图仿射与补边。"""
import sys, json
from PIL import Image
import numpy as np

def mask(a):
    bg = a[5:40, 5:40].reshape(-1, 3).mean(0)
    return np.abs(a - bg).max(2) > 18

def stats(m):
    ys, xs = np.nonzero(m); top, bot = ys.min(), ys.max(); h = bot - top + 1
    hy, hx = np.nonzero(m[top:top + int(0.06 * h)])
    return int(top), int(bot), int(h), float(hx.mean())

plate, src_path, out = sys.argv[1:4]
P = np.asarray(Image.open(plate).convert('RGB')).astype(int)
src = Image.open(src_path).convert('RGB'); G = np.asarray(src).astype(int)
pt, pb, ph, phx = stats(mask(P)); gt, gb, gh, ghx = stats(mask(G))
s = ph / gh
big = src.resize((round(src.width * s), round(src.height * s)), Image.LANCZOS)
ox = round(phx - ghx * s); oy = round(pb - gb * s)
bg = tuple(int(v) for v in P[5:40, 5:40].reshape(-1, 3).mean(0).round())
canvas = Image.new('RGB', (P.shape[1], P.shape[0]), bg); canvas.paste(big, (ox, oy)); canvas.save(out)
at, ab, ah, ahx = stats(mask(np.asarray(canvas).astype(int)))
print(json.dumps({"source": src_path.split('/')[-1], "source_size": list(src.size), "scale": round(s, 5),
                  "offset": [ox, oy], "background_rgb": list(bg), "plate_person": [pt, pb, ph, round(phx, 1)],
                  "aligned_person": [at, ab, ah, round(ahx, 1)]}, ensure_ascii=False))
