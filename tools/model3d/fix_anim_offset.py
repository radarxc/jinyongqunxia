#!/usr/bin/env python3
"""去掉 Tripo 原地动作里 Hips 的整体水平偏移（AR-85 实测：跑步片段整段前移约 0.55，约半个身高，切换动作会跳位）。

用法：python3 tools/model3d/fix_anim_offset.py <in.glb> <out.glb> [--clips run,walk] [--tol 0.01]
做法：逐个动画找 mixamorig:Hips 的 translation 通道，换算到世界坐标，若整段的水平均值偏离绑定姿势超过 tol，
就把每一帧的水平位置平移回去（只改 x/z，高度起伏和帧内摆动不动），写回原 buffer（不改文件结构）。打印改了什么。
"""
import argparse, json, struct
import numpy as np


def local(n):
    if 'matrix' in n: return np.array(n['matrix'], dtype=float).reshape(4, 4).T
    x, y, z, w = n.get('rotation', [0, 0, 0, 1]); s = n.get('scale', [1, 1, 1]); t = n.get('translation', [0, 0, 0])
    R = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
    M = np.eye(4); M[:3, :3] = R @ np.diag(s); M[:3, 3] = t; return M


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--clips', default=''); ap.add_argument('--tol', type=float, default=0.01)
    a = ap.parse_args()
    b = bytearray(open(a.src, 'rb').read()); jl = struct.unpack_from('<I', b, 12)[0]; j = json.loads(bytes(b[20:20 + jl]))
    bin_off = 20 + jl + 8
    parent = {c: i for i, n in enumerate(j['nodes']) for c in n.get('children', [])}
    def world(i):
        M = local(j['nodes'][i]); p = parent.get(i)
        while p is not None: M = local(j['nodes'][p]) @ M; p = parent.get(p)
        return M
    hips = next(i for i, n in enumerate(j['nodes']) if (n.get('name') or '').split(':')[-1] in ('Hips', 'mixamorigHips'))
    Mp = world(parent[hips]) if hips in parent else np.eye(4); Mp_inv = np.linalg.inv(Mp)
    bind = (world(hips))[:3, 3]
    want = set(x for x in a.clips.split(',') if x); report = []
    for an in j.get('animations', []):
        if want and an.get('name') not in want: continue
        for ch in an['channels']:
            if ch['target'].get('node') != hips or ch['target'].get('path') != 'translation': continue
            acc = j['accessors'][an['samplers'][ch['sampler']]['output']]; bv = j['bufferViews'][acc['bufferView']]
            assert acc['componentType'] == 5126 and acc['type'] == 'VEC3'
            off = bin_off + bv.get('byteOffset', 0) + acc.get('byteOffset', 0); stride = bv.get('byteStride', 12) or 12
            vals = np.array([struct.unpack_from('<3f', b, off + k * stride) for k in range(acc['count'])], dtype=float)
            W = (Mp @ np.c_[vals, np.ones(len(vals))].T).T[:, :3]
            d = W[:, [0, 2]].mean(axis=0) - bind[[0, 2]]
            if np.hypot(*d) <= a.tol: report.append({'clip': an.get('name'), 'offset_xz': d.round(4).tolist(), 'fixed': False}); continue
            W[:, 0] -= d[0]; W[:, 2] -= d[1]
            L = (Mp_inv @ np.c_[W, np.ones(len(W))].T).T[:, :3]
            for k in range(len(L)): struct.pack_into('<3f', b, off + k * stride, *L[k])
            if 'min' in acc: acc['min'] = L.min(axis=0).tolist()
            if 'max' in acc: acc['max'] = L.max(axis=0).tolist()
            report.append({'clip': an.get('name'), 'offset_xz': d.round(4).tolist(), 'fixed': True})
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * ((4 - len(js) % 4) % 4)
    out = bytearray(b[:12]) + struct.pack('<I', len(js)) + b'JSON' + js + b[20 + jl:]
    struct.pack_into('<I', out, 8, len(out))
    open(a.dst, 'wb').write(out)
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
