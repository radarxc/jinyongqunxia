#!/usr/bin/env python3
"""量 GLB 人物模型的头身比（AR-79 / AR-85）。未绑骨的也能量，零点数。

用法：python3 tools/model3d/measure_heads.py <model.glb> [...]
输出 JSON（模型高度归一约 0.98，前方 = +z）：
  heads_crown      头身比：头顶骨（脸前半边的头顶，不含脑后的发髻）到下巴为一头 —— AR-85 定比例用这个口径
  heads_incl_bun   头身比：连发髻 / 帽子在内的最高点到下巴为一头
  shoulder_ratio   左右上臂关节间距 / 身高（有骨架才有）
  hip_ratio        大腿根关节高度 / 身高（有骨架才有）
下巴 = 正中矢状面前轮廓从脸到脖子突然后缩的位置；2026-10 用 37 套模型的侧面轮廓逐一目视核对过。
头上戴宽檐帽、发髻在正头顶或脸前有遮挡时，crown 口径可能偏，要看渲染图复核。
"""
import json, struct, sys
import numpy as np

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load(path):
    b = open(path, 'rb').read(); jl = struct.unpack_from('<I', b, 12)[0]; j = json.loads(b[20:20 + jl])
    binc = b[20 + jl + 8: 20 + jl + 8 + struct.unpack_from('<I', b, 20 + jl)[0]]
    if 'EXT_meshopt_compression' in j.get('extensionsUsed', []): raise SystemExit('meshopt 压缩的 GLB 量不了：先用 tripo_web.js exportGlb 导出 2K 版')
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]; n = NC[a['type']]; dt = np.dtype(CT[a['componentType']])
        start = bv.get('byteOffset', 0) + a.get('byteOffset', 0); stride = bv.get('byteStride', 0) or n * dt.itemsize
        if stride == n * dt.itemsize: return np.frombuffer(binc, dtype=dt, count=a['count'] * n, offset=start).reshape(a['count'], n).astype(float)
        return np.stack([np.frombuffer(binc, dtype=dt, count=n, offset=start + k * stride) for k in range(a['count'])]).astype(float)
    return j, acc


def local(n):
    if 'matrix' in n: return np.array(n['matrix'], dtype=float).reshape(4, 4).T
    x, y, z, w = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1]); t = n.get('translation', [0, 0, 0])
    R = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    M = np.eye(4); M[:3, :3] = R @ np.diag(s); M[:3, 3] = t; return M


def measure(path):
    j, acc = load(path)
    P = np.concatenate([acc(p['attributes']['POSITION']) for m in j['meshes'] for p in m['primitives']])
    x, y, z = P[:, 0], P[:, 1], P[:, 2]; ymin, ymax = y.min(), y.max(); H = ymax - ymin
    tops = y > ymax - 0.06 * H; xc, zc = np.median(x[tops]), np.median(z[tops])
    near = (np.hypot(x - xc, z - zc) < 0.07) & (y > ymax - 0.30 * H); top = y[near].max()
    band = (np.abs(x - xc) < 0.018) & (y > top - 0.30 * H) & (y < top); yb, zb = y[band], z[band] - zc
    step = 0.002; bins = np.arange(top - 0.30 * H, top, step); F = np.full(len(bins), np.nan)
    for k, b0 in enumerate(bins):
        m = (yb >= b0) & (yb < b0 + step)
        if m.any(): F[k] = zb[m].max()
    idx = np.arange(len(F)); ok = ~np.isnan(F); Fi = np.interp(idx, idx[ok], F[ok])
    zone = (bins > top - 0.17 * H) & (bins < top - 0.05 * H); k_nose = np.where(zone)[0][np.argmax(Fi[zone])]
    best, k_chin = 0, None
    for k in range(k_nose - 2, 5, -1):
        if bins[k] > bins[k_nose] - 0.01: continue
        if bins[k] < bins[k_nose] - 0.08: break
        drop = Fi[k] - Fi[max(0, k - 5): k].min()
        if drop > best: best, k_chin = drop, k
    chin = bins[k_chin]
    seg = (np.abs(x - xc) < 0.07) & (y > chin + 0.03) & (y < chin + 0.08); zmid = 0.5 * (z[seg].max() + z[seg].min())
    crown = y[(np.abs(x - xc) < 0.04) & (z > zmid) & (y > chin)].max()
    out = {'file': path.split('/')[-1], 'H': round(float(H), 4), 'chin': round(float(chin), 4), 'crown': round(float(crown), 4), 'top': round(float(top), 4),
           'heads_crown': round(float((crown - ymin) / (crown - chin)), 2), 'heads_incl_bun': round(float(H / (top - chin)), 2)}
    if j.get('skins'):
        parent = {c: i for i, n in enumerate(j['nodes']) for c in n.get('children', [])}; memo = {}
        def world(i):
            if i not in memo: memo[i] = local(j['nodes'][i]) if i not in parent else world(parent[i]) @ local(j['nodes'][i])
            return memo[i]
        J = {(j['nodes'][i].get('name') or '').split(':')[-1]: world(i)[:3, 3] for i in j['skins'][0]['joints']}
        if {'LeftArm', 'RightArm', 'LeftUpLeg', 'RightUpLeg'} <= set(J):
            out['shoulder_ratio'] = round(float(np.linalg.norm(J['LeftArm'] - J['RightArm']) / H), 3)
            out['hip_ratio'] = round(float((0.5 * (J['LeftUpLeg'][1] + J['RightUpLeg'][1]) - ymin) / H), 3)
    return out


if __name__ == '__main__':
    for p in sys.argv[1:]: print(json.dumps(measure(p), ensure_ascii=False))
