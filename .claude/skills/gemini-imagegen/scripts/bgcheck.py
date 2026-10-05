"""入库后检查背景：python3 bgcheck.py <id...>（在 _prod 根目录运行，读 assets/default/item/*/<id>.png）。
dist > 22 记 BG-OFF，背景不匀记 uneven。"""
import sys, glob
import numpy as np
from PIL import Image
T = np.array([230, 225, 216.0])
for x in sys.argv[1:]:
    f = glob.glob(f'assets/default/item/*/{x}.png')[0]
    a = np.asarray(Image.open(f).convert('RGB'), dtype=np.float32)
    h, w = a.shape[:2]; m = max(4, int(min(h, w) * 0.03))
    ring = np.concatenate([a[:m].reshape(-1, 3), a[-m:].reshape(-1, 3), a[:, :m].reshape(-1, 3), a[:, -m:].reshape(-1, 3)])
    med = np.median(ring, axis=0); spread = np.percentile(np.abs(ring - med).max(axis=1), 95)
    d = np.abs(med - T).max()
    flag = 'BG-OFF' if d > 22 else ('uneven' if spread > 25 else '')
    print(f'{x:34s} bg={tuple(int(v) for v in med)} dist={d:4.0f} spread95={spread:4.0f} {flag}')
