#!/usr/bin/env python3
"""
tools/model3d/stitch_v21_test.py

Test runner for lower body cut and calibrated head scale.
Allows testing different combinations of (Y_SEAM, Y_H_CUT, s)
and saves them to inspect in character-3d viewer.
"""

import os
import sys
import json
import struct
import io
import numpy as np
from PIL import Image, ImageDraw
import scipy.ndimage

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}

def load_glb(path):
    b = open(path, 'rb').read()
    jl = struct.unpack_from('<I', b, 12)[0]
    j = json.loads(b[20:20+jl])
    bl = struct.unpack_from('<I', b, 20+jl)[0]
    binc = b[20+jl+8: 20+jl+8+bl]
    return j, binc

def get_accessor_data(j, binc, acc_idx):
    a = j['accessors'][acc_idx]
    bv = j['bufferViews'][a['bufferView']]
    n = NC[a['type']]
    dt = np.dtype(CT[a['componentType']])
    start = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0) or (n * dt.itemsize)
    if stride == n * dt.itemsize:
        return np.frombuffer(binc, dtype=dt, count=a['count'] * n, offset=start).reshape(a['count'], n)
    return np.stack([np.frombuffer(binc, dtype=dt, count=n, offset=start + k * stride) for k in range(a['count'])])

def build_glb(j, binc):
    j_bytes = json.dumps(j, separators=(',', ':')).encode('utf-8')
    pad_j = (4 - len(j_bytes) % 4) % 4
    j_bytes += b' ' * pad_j

    pad_b = (4 - len(binc) % 4) % 4
    binc_padded = binc + b'\x00' * pad_b

    total_len = 12 + 8 + len(j_bytes) + 8 + len(binc_padded)
    header = struct.pack('<4sII', b'glTF', 2, total_len)
    chunk0_hdr = struct.pack('<II', len(j_bytes), 0x4E4F534A)
    chunk1_hdr = struct.pack('<II', len(binc_padded), 0x004E4942)

    return header + chunk0_hdr + j_bytes + chunk1_hdr + binc_padded

def slice_mesh_plane(pos, norm, uv, joints, weights, indices, y_plane, keep_below=True):
    new_pos = list(pos)
    new_norm = list(norm)
    new_uv = list(uv)
    new_joints = list(joints)
    new_weights = list(weights)
    new_idx = []
    edge_cache = {}
    
    def get_intersection(i0, i1):
        edge = (min(i0, i1), max(i0, i1))
        if edge in edge_cache: return edge_cache[edge]
        p0, p1 = pos[i0], pos[i1]
        t = float((y_plane - p0[1]) / (p1[1] - p0[1]))
        t = max(0.0, min(1.0, t))
        p_new = p0 * (1.0 - t) + p1 * t
        p_new[1] = y_plane
        n_new = norm[i0] * (1.0 - t) + norm[i1] * t
        n_len = np.linalg.norm(n_new)
        if n_len > 1e-6: n_new /= n_len
        uv_new = uv[i0] * (1.0 - t) + uv[i1] * t
        w_new = weights[i0] * (1.0 - t) + weights[i1] * t
        j_new = joints[i0] if t < 0.5 else joints[i1]
        new_v_idx = len(new_pos)
        new_pos.append(p_new)
        new_norm.append(n_new)
        new_uv.append(uv_new)
        new_joints.append(j_new)
        new_weights.append(w_new)
        edge_cache[edge] = new_v_idx
        return new_v_idx

    for tri in indices:
        i0, i1, i2 = tri
        y0, y1, y2 = pos[i0, 1], pos[i1, 1], pos[i2, 1]
        k0 = (y0 <= y_plane) if keep_below else (y0 >= y_plane)
        k1 = (y1 <= y_plane) if keep_below else (y1 >= y_plane)
        k2 = (y2 <= y_plane) if keep_below else (y2 >= y_plane)
        num_kept = int(k0) + int(k1) + int(k2)
        if num_kept == 3:
            new_idx.append([i0, i1, i2])
        elif num_kept == 0:
            continue
        elif num_kept == 1:
            if k0: a, b, c = i0, i1, i2
            elif k1: a, b, c = i1, i2, i0
            else: a, b, c = i2, i0, i1
            new_idx.append([a, get_intersection(a, b), get_intersection(a, c)])
        elif num_kept == 2:
            if not k0: c, a, b = i0, i1, i2
            elif not k1: c, a, b = i1, i2, i0
            else: c, a, b = i2, i0, i1
            p1 = get_intersection(a, c)
            p2 = get_intersection(b, c)
            new_idx.append([a, b, p2])
            new_idx.append([a, p2, p1])

    pos_arr = np.array(new_pos, dtype=np.float32)
    norm_arr = np.array(new_norm, dtype=np.float32)
    uv_arr = np.array(new_uv, dtype=np.float32)
    joints_arr = np.array(new_joints, dtype=np.uint8)
    weights_arr = np.array(new_weights, dtype=np.float32)
    idx_arr = np.array(new_idx, dtype=np.uint32)

    tri_v0 = pos_arr[idx_arr[:, 0]]
    tri_v1 = pos_arr[idx_arr[:, 1]]
    tri_v2 = pos_arr[idx_arr[:, 2]]
    fn = np.cross(tri_v1 - tri_v0, tri_v2 - tri_v0)
    non_deg = np.linalg.norm(fn, axis=1) > 1e-9
    idx_arr = idx_arr[non_deg]

    used_v = np.unique(idx_arr)
    remap = np.full(len(pos_arr), -1, dtype=np.int32)
    remap[used_v] = np.arange(len(used_v))
    rim_v_compact = remap[list(edge_cache.values())]
    rim_v_compact = rim_v_compact[rim_v_compact >= 0]

    return (
        pos_arr[used_v], norm_arr[used_v], uv_arr[used_v],
        joints_arr[used_v], weights_arr[used_v], remap[idx_arr].astype(np.uint32),
        rim_v_compact
    )

def assemble_model(y_seam, y_h_cut, s, out_path):
    body_glb_path = '.agents/coord/ART-3d-tripo-web/fresh_run/fresh_body_anim_full_v20.glb'
    head_glb_path = '.agents/coord/ART-3d-tripo-web/fresh_run/head_mesh_v20_true.glb'

    j_body, bin_body = load_glb(body_glb_path)
    j_head, bin_head = load_glb(head_glb_path)

    # 1. Body: Sliced at y_seam (lower cut)
    prim_b = j_body['meshes'][0]['primitives'][0]
    pos_b = get_accessor_data(j_body, bin_body, prim_b['attributes']['POSITION']).astype(np.float32)
    norm_b = get_accessor_data(j_body, bin_body, prim_b['attributes']['NORMAL']).astype(np.float32)
    uv_b = get_accessor_data(j_body, bin_body, prim_b['attributes']['TEXCOORD_0']).astype(np.float32)
    joints_b = get_accessor_data(j_body, bin_body, prim_b['attributes']['JOINTS_0']).astype(np.uint8)
    weights_b = get_accessor_data(j_body, bin_body, prim_b['attributes']['WEIGHTS_0']).astype(np.float32)
    idx_b = get_accessor_data(j_body, bin_body, prim_b['indices']).astype(np.uint32).reshape(-1, 3)

    pos_b_comp, norm_b_comp, uv_b_comp, joints_b_comp, weights_b_comp, idx_b_comp, b_rim_v = slice_mesh_plane(
        pos_b, norm_b, uv_b, joints_b, weights_b, idx_b, y_plane=y_seam, keep_below=True
    )
    for v in b_rim_v:
        pos_b_comp[v, 1] = y_seam

    c_b = pos_b_comp[b_rim_v][:, [0, 2]].mean(axis=0)
    b_center_x = float(c_b[0])
    b_center_z = float(c_b[1])
    c_neck = np.array([b_center_x, y_seam, b_center_z], dtype=np.float32)

    # Body rim geometry & skinning parametrization
    th_b = np.arctan2(pos_b_comp[b_rim_v, 2] - c_neck[2], pos_b_comp[b_rim_v, 0] - c_neck[0])
    r_b = np.sqrt((pos_b_comp[b_rim_v, 0] - c_neck[0])**2 + (pos_b_comp[b_rim_v, 2] - c_neck[2])**2)
    order_b = np.argsort(th_b)
    th_b_s = th_b[order_b]
    r_b_s = r_b[order_b]
    norm_b_s = norm_b_comp[b_rim_v][order_b]

    # Target joints: [Neck (38), Head (39), LeftShoulder (14), RightShoulder (41)]
    target_joints = [38, 39, 14, 41]
    b_rim_ordered = b_rim_v[order_b]
    body_rim_weights = np.zeros((len(b_rim_v), 4), dtype=np.float32)
    for i, bv in enumerate(b_rim_ordered):
        for k, j_id in enumerate(target_joints):
            m = (joints_b_comp[bv] == j_id)
            body_rim_weights[i, k] = weights_b_comp[bv][m].sum()
        s_tot = body_rim_weights[i].sum()
        if s_tot > 1e-6: body_rim_weights[i] /= s_tot
        else: body_rim_weights[i] = np.array([0.80, 0.06, 0.07, 0.07], dtype=np.float32)
        joints_b_comp[bv] = target_joints
        weights_b_comp[bv] = body_rim_weights[i]

    def eval_body_rim(theta):
        idx = np.searchsorted(th_b_s, theta)
        i0 = (idx - 1) % len(th_b_s)
        i1 = idx % len(th_b_s)
        dt = np.arctan2(np.sin(th_b_s[i1] - th_b_s[i0]), np.cos(th_b_s[i1] - th_b_s[i0]))
        d_tar = np.arctan2(np.sin(theta - th_b_s[i0]), np.cos(theta - th_b_s[i0]))
        alpha = np.clip(d_tar / (dt + 1e-9), 0.0, 1.0)
        r_val = (1.0 - alpha) * r_b_s[i0] + alpha * r_b_s[i1]
        n_val = (1.0 - alpha) * norm_b_s[i0] + alpha * norm_b_s[i1]
        n_val /= (np.linalg.norm(n_val) + 1e-9)
        w_val = (1.0 - alpha) * body_rim_weights[i0] + alpha * body_rim_weights[i1]
        return r_val, n_val, w_val

    # 2. Extract Head Mesh & Slice at neck cylinder y_h_cut
    prim_h = j_head['meshes'][0]['primitives'][0]
    pos_h = get_accessor_data(j_head, bin_head, prim_h['attributes']['POSITION']).astype(np.float32)
    norm_h = get_accessor_data(j_head, bin_head, prim_h['attributes']['NORMAL']).astype(np.float32)
    uv_h = get_accessor_data(j_head, bin_head, prim_h['attributes']['TEXCOORD_0']).astype(np.float32)
    idx_h = get_accessor_data(j_head, bin_head, prim_h['indices']).astype(np.uint32).reshape(-1, 3)

    dummy_j = np.zeros((len(pos_h), 4), dtype=np.uint8)
    dummy_w = np.zeros((len(pos_h), 4), dtype=np.float32)
    pos_h_comp, norm_h_comp, uv_h_comp, _, _, idx_h_comp, h_rim_v = slice_mesh_plane(
        pos_h, norm_h, uv_h, dummy_j, dummy_w, idx_h, y_plane=y_h_cut, keep_below=False
    )

    h_rim_pts = pos_h_comp[h_rim_v]
    h_loc_cx = float(h_rim_pts[:, 0].mean())
    h_loc_cz = float(h_rim_pts[:, 2].mean())

    T_x = b_center_x - s * h_loc_cx
    T_y = y_seam - s * y_h_cut
    T_z = b_center_z - s * h_loc_cz
    T = np.array([T_x, T_y, T_z], dtype=np.float32)

    pos_h_trans = pos_h_comp * s + T
    chin_world_y = 0.1061 * s + T_y
    crown_world_y = 0.9792 * s + T_y
    head_height = crown_world_y - chin_world_y
    total_height = crown_world_y
    ratio = total_height / head_height

    print(f"Assembly params: y_seam={y_seam:.4f}, y_h_cut={y_h_cut:.4f}, s={s:.4f}")
    print(f"Head chin: Y={chin_world_y:.4f}, crown: Y={crown_world_y:.4f}, head height: {head_height*100:.2f}cm")
    print(f"Total height: {total_height:.4f}m, Head Ratio: {ratio:.2f}:1")

    # 3. Docking: Match head rim to body rim at y_seam
    joints_h = np.zeros((len(pos_h_trans), 4), dtype=np.uint8)
    weights_h = np.zeros((len(pos_h_trans), 4), dtype=np.float32)

    for v in h_rim_v:
        th = np.arctan2(pos_h_trans[v, 2] - c_neck[2], pos_h_trans[v, 0] - c_neck[0])
        r_target, n_target, w_target = eval_body_rim(th)
        pos_h_trans[v, 0] = c_neck[0] + r_target * np.cos(th)
        pos_h_trans[v, 1] = y_seam
        pos_h_trans[v, 2] = c_neck[2] + r_target * np.sin(th)
        norm_h_comp[v] = n_target
        joints_h[v] = target_joints
        weights_h[v] = w_target

    # Smooth gentle blend over blend_height (e.g. 8mm) above seam
    # This creates a graceful transition from body collar to head neck
    blend_height = 0.0080
    h_blend_mask = np.where((pos_h_trans[:, 1] <= y_seam + blend_height) & (pos_h_trans[:, 1] > y_seam))[0]
    for v in h_blend_mask:
        y = pos_h_trans[v, 1]
        t = (y - y_seam) / blend_height
        w = float(3.0 * (1.0 - t)**2 - 2.0 * (1.0 - t)**3)
        th = np.arctan2(pos_h_trans[v, 2] - c_neck[2], pos_h_trans[v, 0] - c_neck[0])
        r_targ, n_targ, _ = eval_body_rim(th)
        cur_r = np.linalg.norm(pos_h_trans[v, [0, 2]] - c_neck[[0, 2]])
        blended_r = cur_r * (1.0 - w) + r_targ * w
        pos_h_trans[v, 0] = c_neck[0] + blended_r * np.cos(th)
        pos_h_trans[v, 2] = c_neck[2] + blended_r * np.sin(th)
        blended_n = norm_h_comp[v] * (1.0 - w) + n_targ * w
        norm_h_comp[v] = blended_n / (np.linalg.norm(blended_n) + 1e-9)

    # 4. Skinning weights interpolation
    head_y_base = chin_world_y + 0.010
    for i in range(len(pos_h_trans)):
        if i in h_rim_v: continue
        y = pos_h_trans[i, 1]
        if y >= head_y_base:
            joints_h[i] = [39, 0, 0, 0]
            weights_h[i] = [1.0, 0.0, 0.0, 0.0]
        else:
            th = np.arctan2(pos_h_trans[i, 2] - c_neck[2], pos_h_trans[i, 0] - c_neck[0])
            _, _, w_seam = eval_body_rim(th)
            t = np.clip((y - y_seam) / (head_y_base - y_seam), 0.0, 1.0)
            w_head_bone = float(3.0 * (t ** 2) - 2.0 * (t ** 3))
            w_seam_scale = 1.0 - w_head_bone

            new_w = np.zeros(4, dtype=np.float32)
            for k, j_id in enumerate(target_joints):
                if j_id == 39:
                    new_w[k] = w_seam[k] * w_seam_scale + w_head_bone
                else:
                    new_w[k] = w_seam[k] * w_seam_scale

            s_sum = new_w.sum()
            if s_sum > 1e-6: new_w /= s_sum
            else: new_w = np.array([0.0, 1.0, 0.0, 0.0], dtype=np.float32)
            joints_h[i] = target_joints
            weights_h[i] = new_w

    # 5. Pack GLTF
    out_bin = bytearray()
    def add_buffer_data(data_bytes, stride=0):
        pad = (4 - len(out_bin) % 4) % 4
        out_bin.extend(b'\x00' * pad)
        offset = len(out_bin)
        out_bin.extend(data_bytes)
        bv = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(data_bytes)}
        if stride > 0: bv['byteStride'] = stride
        return len(j_out['bufferViews']), bv

    j_out = {
        "asset": {"generator": "Tianshu 3D Pipeline (Clean V21 Stitch)", "version": "2.0"},
        "scene": 0,
        "scenes": j_body['scenes'],
        "nodes": j_body['nodes'],
        "skins": j_body['skins'],
        "meshes": [],
        "materials": [],
        "textures": [],
        "images": [],
        "samplers": j_body.get('samplers', [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 10497, 'wrapT': 10497}]),
        "accessors": [],
        "bufferViews": [],
        "buffers": [{"byteLength": 0}]
    }

    # InverseBindMatrices
    ibm_data = get_accessor_data(j_body, bin_body, j_body['skins'][0]['inverseBindMatrices']).astype(np.float32)
    ibm_idx, ibm_bv = add_buffer_data(ibm_data.tobytes())
    j_out['bufferViews'].append(ibm_bv)
    ibm_acc = {"bufferView": ibm_idx, "byteOffset": 0, "componentType": 5126, "count": len(ibm_data), "type": "MAT4"}
    j_out['skins'][0]['inverseBindMatrices'] = len(j_out['accessors'])
    j_out['accessors'].append(ibm_acc)

    # Primitive 0 (Body)
    p0_idx, p0_bv = add_buffer_data(pos_b_comp.tobytes()); j_out['bufferViews'].append(p0_bv)
    acc_pos_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": p0_idx, "byteOffset": 0, "componentType": 5126, "count": len(pos_b_comp), "type": "VEC3", "min": pos_b_comp.min(axis=0).tolist(), "max": pos_b_comp.max(axis=0).tolist()})

    n0_idx, n0_bv = add_buffer_data(norm_b_comp.tobytes()); j_out['bufferViews'].append(n0_bv)
    acc_norm_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": n0_idx, "byteOffset": 0, "componentType": 5126, "count": len(norm_b_comp), "type": "VEC3"})

    u0_idx, u0_bv = add_buffer_data(uv_b_comp.tobytes()); j_out['bufferViews'].append(u0_bv)
    acc_uv_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": u0_idx, "byteOffset": 0, "componentType": 5126, "count": len(uv_b_comp), "type": "VEC2"})

    j0_idx, j0_bv = add_buffer_data(joints_b_comp.tobytes()); j_out['bufferViews'].append(j0_bv)
    acc_joints_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": j0_idx, "byteOffset": 0, "componentType": 5121, "count": len(joints_b_comp), "type": "VEC4"})

    w0_idx, w0_bv = add_buffer_data(weights_b_comp.tobytes()); j_out['bufferViews'].append(w0_bv)
    acc_weights_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": w0_idx, "byteOffset": 0, "componentType": 5126, "count": len(weights_b_comp), "type": "VEC4"})

    i0_idx, i0_bv = add_buffer_data(idx_b_comp.flatten().tobytes()); j_out['bufferViews'].append(i0_bv)
    acc_idx_b = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": i0_idx, "byteOffset": 0, "componentType": 5125, "count": len(idx_b_comp.flatten()), "type": "SCALAR"})

    # Primitive 1 (Head)
    p1_idx, p1_bv = add_buffer_data(pos_h_trans.tobytes()); j_out['bufferViews'].append(p1_bv)
    acc_pos_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": p1_idx, "byteOffset": 0, "componentType": 5126, "count": len(pos_h_trans), "type": "VEC3", "min": pos_h_trans.min(axis=0).tolist(), "max": pos_h_trans.max(axis=0).tolist()})

    n1_idx, n1_bv = add_buffer_data(norm_h_comp.tobytes()); j_out['bufferViews'].append(n1_bv)
    acc_norm_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": n1_idx, "byteOffset": 0, "componentType": 5126, "count": len(norm_h_comp), "type": "VEC3"})

    u1_idx, u1_bv = add_buffer_data(uv_h_comp.tobytes()); j_out['bufferViews'].append(u1_bv)
    acc_uv_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": u1_idx, "byteOffset": 0, "componentType": 5126, "count": len(uv_h_comp), "type": "VEC2"})

    j1_idx, j1_bv = add_buffer_data(joints_h.tobytes()); j_out['bufferViews'].append(j1_bv)
    acc_joints_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": j1_idx, "byteOffset": 0, "componentType": 5121, "count": len(joints_h), "type": "VEC4"})

    w1_idx, w1_bv = add_buffer_data(weights_h.tobytes()); j_out['bufferViews'].append(w1_bv)
    acc_weights_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": w1_idx, "byteOffset": 0, "componentType": 5126, "count": len(weights_h), "type": "VEC4"})

    i1_idx, i1_bv = add_buffer_data(idx_h_comp.flatten().tobytes()); j_out['bufferViews'].append(i1_bv)
    acc_idx_h = len(j_out['accessors'])
    j_out['accessors'].append({"bufferView": i1_idx, "byteOffset": 0, "componentType": 5125, "count": len(idx_h_comp.flatten()), "type": "SCALAR"})

    # Body Textures
    for img_idx, img_info in enumerate(j_body.get('images', [])):
        img_bv = j_body['bufferViews'][img_info['bufferView']]
        img_bytes = bin_body[img_bv['byteOffset'] : img_bv['byteOffset'] + img_bv['byteLength']]
        idx, bv = add_buffer_data(img_bytes)
        j_out['bufferViews'].append(bv)
        j_out['images'].append({"bufferView": idx, "mimeType": img_info['mimeType']})

    for tex in j_body.get('textures', []):
        j_out['textures'].append(tex)

    mat_b = j_body['materials'][0].copy()
    mat_b['doubleSided'] = True
    j_out['materials'].append(mat_b)

    # Head Textures (using head_v20_bc_matched.jpg for porcelain tone match)
    matched_head_bc_path = '.agents/coord/ART-3d-tripo-web/fresh_run/head_v21_bc_blended.jpg'
    head_img_offset = len(j_out['images'])
    for img_idx, img_info in enumerate(j_head.get('images', [])):
        if img_idx == 1 and os.path.exists(matched_head_bc_path):
            img_bytes = open(matched_head_bc_path, 'rb').read()
            mime = "image/jpeg"
        else:
            img_bv = j_head['bufferViews'][img_info['bufferView']]
            img_bytes = bin_head[img_bv['byteOffset'] : img_bv['byteOffset'] + img_bv['byteLength']]
            mime = img_info['mimeType']
        idx, bv = add_buffer_data(img_bytes)
        j_out['bufferViews'].append(bv)
        j_out['images'].append({"bufferView": idx, "mimeType": mime})

    head_tex_offset = len(j_out['textures'])
    for tex in j_head.get('textures', []):
        new_tex = tex.copy()
        new_tex['source'] += head_img_offset
        j_out['textures'].append(new_tex)

    mat_h = j_head['materials'][0].copy()
    mat_h['doubleSided'] = True
    pbr_h = mat_h['pbrMetallicRoughness'].copy()
    pbr_h['baseColorTexture'] = {'index': mat_h['pbrMetallicRoughness']['baseColorTexture']['index'] + head_tex_offset}
    if 'metallicRoughnessTexture' in pbr_h:
        pbr_h['metallicRoughnessTexture'] = {'index': pbr_h['metallicRoughnessTexture']['index'] + head_tex_offset}
    mat_h['pbrMetallicRoughness'] = pbr_h
    if 'normalTexture' in mat_h:
        mat_h['normalTexture'] = {'index': mat_h['normalTexture']['index'] + head_tex_offset}
    j_out['materials'].append(mat_h)

    j_out['meshes'].append({
        "primitives": [
            {
                "attributes": {
                    "POSITION": acc_pos_b, "NORMAL": acc_norm_b, "TEXCOORD_0": acc_uv_b,
                    "JOINTS_0": acc_joints_b, "WEIGHTS_0": acc_weights_b
                },
                "indices": acc_idx_b, "material": 0, "mode": 4
            },
            {
                "attributes": {
                    "POSITION": acc_pos_h, "NORMAL": acc_norm_h, "TEXCOORD_0": acc_uv_h,
                    "JOINTS_0": acc_joints_h, "WEIGHTS_0": acc_weights_h
                },
                "indices": acc_idx_h, "material": 1, "mode": 4
            }
        ]
    })

    # Include animations if present in body
    if 'animations' in j_body:
        j_out['animations'] = []
        for anim in j_body['animations']:
            new_anim = {"name": anim.get('name', 'anim'), "channels": anim['channels'], "samplers": []}
            for samp in anim['samplers']:
                in_data = get_accessor_data(j_body, bin_body, samp['input'])
                out_data = get_accessor_data(j_body, bin_body, samp['output'])
                in_idx, in_bv = add_buffer_data(in_data.tobytes()); j_out['bufferViews'].append(in_bv)
                acc_in = len(j_out['accessors'])
                j_out['accessors'].append({"bufferView": in_idx, "byteOffset": 0, "componentType": 5126, "count": len(in_data), "type": "SCALAR", "min": [float(in_data.min())], "max": [float(in_data.max())]})
                out_idx, out_bv = add_buffer_data(out_data.tobytes()); j_out['bufferViews'].append(out_bv)
                acc_out = len(j_out['accessors'])
                a_type = j_body['accessors'][samp['output']]['type']
                j_out['accessors'].append({"bufferView": out_idx, "byteOffset": 0, "componentType": 5126, "count": len(out_data), "type": a_type})
                new_anim['samplers'].append({"input": acc_in, "output": acc_out, "interpolation": samp.get('interpolation', 'LINEAR')})
            j_out['animations'].append(new_anim)

    j_out['buffers'][0]['byteLength'] = len(out_bin)
    glb_bytes = build_glb(j_out, out_bin)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(glb_bytes)
    print(f"Saved: {out_path} ({len(glb_bytes)} bytes)")

if __name__ == '__main__':
    y_seam = float(sys.argv[1]) if len(sys.argv) > 1 else 0.8360
    y_h_cut = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0150
    s = float(sys.argv[3]) if len(sys.argv) > 3 else 0.1360
    out_path = sys.argv[4] if len(sys.argv) > 4 else 'apps/game/public/assets/temp/test_v21.glb'
    assemble_model(y_seam, y_h_cut, s, out_path)
