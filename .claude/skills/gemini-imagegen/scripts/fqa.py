#!/usr/bin/env python3
"""Item QA sheet: python3 fqa.py <id...> -> $GEM_QA_DIR/food_sheet.jpg（读 ~/Downloads/gemini__<id>.jpeg），打印背景偏差与贴边检测。"""
import sys, os
import numpy as np
from PIL import Image
S = os.environ.get('GEM_QA_DIR', '.agents/coord/gemini_qa')  # 输出目录
os.makedirs(S, exist_ok=True)
T = np.array([230, 225, 216.0])
ids = sys.argv[1:]
W = 400
cols = min(3, len(ids)); rows = (len(ids) + cols - 1) // cols
s = Image.new('RGB', (W * cols, W * rows), (255, 255, 255))
for i, x in enumerate(ids):
    im = Image.open(os.path.expanduser(f'~/Downloads/gemini__{x}.jpeg')).convert('RGB')
    a = np.asarray(im, dtype=np.float32); h, w = a.shape[:2]; m = int(min(h, w) * 0.03)
    ring = np.concatenate([a[:m].reshape(-1, 3), a[-m:].reshape(-1, 3), a[:, :m].reshape(-1, 3), a[:, -m:].reshape(-1, 3)])
    med = np.median(ring, axis=0)
    # background uniformity: fraction of pixels in outer 15% band deviating > 25 from bg median
    b = int(min(h, w) * 0.15)
    band = np.concatenate([a[:b].reshape(-1, 3), a[-b:].reshape(-1, 3), a[:, :b].reshape(-1, 3), a[:, -b:].reshape(-1, 3)])
    off = float((np.abs(band - med).max(axis=1) > 25).mean())
    e = int(min(h, w) * 0.006) + 2
    edges = {k: float((np.abs(v - med).max(axis=2) > 30).mean()) for k, v in (('L', a[:, :e]), ('R', a[:, -e:]), ('T', a[:e]), ('B', a[-e:]))}
    touch = [k for k, v in edges.items() if v > 0.01]
    print(f'{x} {im.size} bg={med.astype(int).tolist()} dev={np.abs(med - T).max():.0f} band_off={off:.3f}' + (f'  EDGE-TOUCH {touch}' if touch else ''))
    s.paste(im.resize((W, W)), ((i % cols) * W, (i // cols) * W))
s.save(S + '/food_sheet.jpg', quality=88)
