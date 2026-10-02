"""Minimal GLB skeleton FK + view projection analysis (numpy only).
Used only for the animation research report; not part of the repo."""
import json, struct, sys
import numpy as np

COMP = {5126: np.float32, 5123: np.uint16, 5121: np.uint8, 5125: np.uint32, 5122: np.int16, 5120: np.int8}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def load_glb(path):
    b = open(path, 'rb').read()
    clen, _ = struct.unpack('<I4s', b[12:20])
    j = json.loads(b[20:20 + clen])
    off = 20 + clen
    blen, _ = struct.unpack('<I4s', b[off:off + 8])
    bin_ = b[off + 8: off + 8 + blen]
    return j, bin_

def accessor(j, bin_, idx):
    a = j['accessors'][idx]
    bv = j['bufferViews'][a['bufferView']]
    dt = COMP[a['componentType']]
    n = NCOMP[a['type']]
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0)
    count = a['count']
    itemsize = np.dtype(dt).itemsize * n
    if stride and stride != itemsize:
        raw = np.frombuffer(bin_, dtype=np.uint8, count=stride * count, offset=start).reshape(count, stride)[:, :itemsize]
        arr = np.frombuffer(raw.tobytes(), dtype=dt).reshape(count, n)
    else:
        arr = np.frombuffer(bin_, dtype=dt, count=count * n, offset=start).reshape(count, n)
    arr = arr.astype(np.float64)
    if a.get('normalized'):
        if dt == np.int16: arr = np.maximum(arr / 32767.0, -1)
        elif dt == np.int8: arr = np.maximum(arr / 127.0, -1)
        elif dt == np.uint16: arr = arr / 65535.0
        elif dt == np.uint8: arr = arr / 255.0
    return arr

def quat_to_mat(q):
    x, y, z, w = q
    return np.array([
        [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
        [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
        [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])

def slerp(q0, q1, t):
    d = np.dot(q0, q1)
    if d < 0: q1, d = -q1, -d
    if d > 0.9995:
        q = q0 + t * (q1 - q0); return q / np.linalg.norm(q)
    th = np.arccos(d); s = np.sin(th)
    return (np.sin((1 - t) * th) * q0 + np.sin(t * th) * q1) / s

class Skeleton:
    def __init__(self, path):
        self.j, self.bin = load_glb(path)
        nodes = self.j['nodes']
        self.names = [n.get('name', f'n{i}') for i, n in enumerate(nodes)]
        self.parent = [-1] * len(nodes)
        for i, n in enumerate(nodes):
            for c in n.get('children', []): self.parent[c] = i
        self.rest_t = [np.array(n.get('translation', [0, 0, 0]), float) for n in nodes]
        self.rest_r = [np.array(n.get('rotation', [0, 0, 0, 1]), float) for n in nodes]
        self.rest_s = [np.array(n.get('scale', [1, 1, 1]), float) for n in nodes]
        # topological order
        order, seen = [], set()
        def visit(i):
            if i in seen: return
            if self.parent[i] >= 0: visit(self.parent[i])
            seen.add(i); order.append(i)
        for i in range(len(nodes)): visit(i)
        self.order = order
        self.idx = {n: i for i, n in enumerate(self.names)}
        self.anims = {a['name']: a for a in self.j.get('animations', [])}

    def duration(self, name):
        a = self.anims[name]; mx = 0
        for s in a['samplers']:
            ia = self.j['accessors'][s['input']]
            mx = max(mx, ia.get('max', [0])[0])
        return mx

    def sample(self, name, t):
        T = [x.copy() for x in self.rest_t]; R = [x.copy() for x in self.rest_r]; S = [x.copy() for x in self.rest_s]
        if name is not None:
            a = self.anims[name]
            for ch in a['channels']:
                node = ch['target'].get('node'); path = ch['target']['path']
                if node is None: continue
                smp = a['samplers'][ch['sampler']]
                times = accessor(self.j, self.bin, smp['input'])[:, 0]
                vals = accessor(self.j, self.bin, smp['output'])
                interp = smp.get('interpolation', 'LINEAR')
                if interp == 'CUBICSPLINE':
                    vals = vals.reshape(len(times), 3, -1)[:, 1, :]
                k = np.searchsorted(times, t) - 1
                k = int(np.clip(k, 0, len(times) - 1))
                if k >= len(times) - 1 or interp == 'STEP':
                    v = vals[min(k, len(vals) - 1)]
                else:
                    u = (t - times[k]) / max(times[k + 1] - times[k], 1e-9)
                    u = float(np.clip(u, 0, 1))
                    v = slerp(vals[k], vals[k + 1], u) if path == 'rotation' else vals[k] * (1 - u) + vals[k + 1] * u
                if path == 'rotation': R[node] = v / np.linalg.norm(v)
                elif path == 'translation': T[node] = v
                elif path == 'scale': S[node] = v
        G = [None] * len(self.names)
        for i in self.order:
            M = np.eye(4); M[:3, :3] = quat_to_mat(R[i]) * S[i]; M[:3, 3] = T[i]
            G[i] = M if self.parent[i] < 0 else G[self.parent[i]] @ M
        return G

    def pos(self, G, name):
        return G[self.idx[name]][:3, 3].copy()
