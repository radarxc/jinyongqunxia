#!/usr/bin/env python3
"""Manual-title QA helper（在 _prod 根目录运行；输出到 $GEM_QA_DIR，默认 .agents/coord/gemini_qa）.
  python3 mqa.py view <id>                 -> view.jpg: original (left) vs downloaded edit (right), plus bg stats
  python3 mqa.py crop <id> x0 y0 x1 y1     -> crop.jpg: crop of the downloaded edit (fractions 0..1), upscaled
  python3 mqa.py reject <id>               -> move ~/Downloads/gemini__<id>.jpeg into $GEM_QA_DIR/rejected/<id>_tN.jpeg
"""
import os, sys, shutil
from pathlib import Path
import numpy as np
from PIL import Image

S = Path(os.environ.get('GEM_QA_DIR', '.agents/coord/gemini_qa'))  # 输出目录，默认 _prod 下 .agents/coord/gemini_qa
S.mkdir(parents=True, exist_ok=True)
ROOT = Path.cwd()  # 在 _prod 工作区根目录运行
T = np.array([230, 225, 216.0])


def bg(im):
    a = np.asarray(im.convert('RGB'), dtype=np.float32)
    h, w = a.shape[:2]; m = max(4, int(min(h, w) * 0.03))
    ring = np.concatenate([a[:m].reshape(-1, 3), a[-m:].reshape(-1, 3), a[:, :m].reshape(-1, 3), a[:, -m:].reshape(-1, 3)])
    med = np.median(ring, axis=0)
    return tuple(int(v) for v in med), float(np.abs(med - T).max()), float(np.percentile(np.abs(ring - med).max(axis=1), 95))


cmd, mid = sys.argv[1], sys.argv[2]
dl = Path.home() / 'Downloads' / f'gemini__{mid}.jpeg'
orig = ROOT / 'assets/default/item/manuals' / f'{mid}.png'
if cmd == 'view':
    a, b = Image.open(orig).convert('RGB'), Image.open(dl).convert('RGB')
    print('orig', a.size, 'bg', bg(a)); print('edit', b.size, 'bg', bg(b))
    W = 560; s = Image.new('RGB', (W * 2 + 10, W), (255, 255, 255))
    s.paste(a.resize((W, W)), (0, 0)); s.paste(b.resize((W, W)), (W + 10, 0))
    s.save(S / 'view.jpg', quality=88); print('ok view.jpg')
elif cmd == 'crop':
    b = Image.open(dl).convert('RGB'); w, h = b.size
    x0, y0, x1, y1 = (float(v) for v in sys.argv[3:7])
    c = b.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    k = 900 / max(c.size); c = c.resize((int(c.size[0] * k), int(c.size[1] * k)), Image.LANCZOS)
    c.save(S / 'crop.jpg', quality=92); print('ok crop.jpg', c.size)
elif cmd == 'reject':
    d = S / 'rejected'; d.mkdir(exist_ok=True)
    n = 1
    while (d / f'{mid}_t{n}.jpeg').exists():
        n += 1
    shutil.move(str(dl), d / f'{mid}_t{n}.jpeg'); print('moved to', d / f'{mid}_t{n}.jpeg')
