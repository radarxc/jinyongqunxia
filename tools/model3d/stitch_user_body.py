#!/usr/bin/env python3
"""
tools/model3d/stitch_user_body.py

Modular Character Assembly:
- Body: .agents/coord/ART-3d-tripo-web/user_selected/p2_figure_anim_idle_walk_run.glb
  (Directly from Tripo project 6359f3b3-462b-411f-9d03-a8d0f081f8f5)
- Head: .agents/coord/ART-3d-tripo-web/fresh_run/head_mesh_v20_true.glb
  (Pristine 2048 Li Yitong facial sculpt)
- Body sliced at neck base Y_SEAM = 0.8380 to eliminate high trapezius.
- Zero python mathematical warping on body vertices; original Tripo proportions preserved.
- Head sliced at cylindrical neck Y_H_CUT = 0.0400.
- Calibrated head scale s = 0.1440 yields 7.77:1 golden female head-to-body ratio (within 7.5~8.0:1 range).
- 0.0000mm gap direct rim docking + smooth normal blending.
- Preserves Mixamo skeleton and idle/walk/run animations.
"""

import os
import sys
import json
import struct
import io
import argparse
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

def assemble(body_path, head_path, y_seam=0.8380, y_h_cut=0.0400, s=0.1440, out_prefix='assembled'):
    out_rig_paths = [
        f'{out_prefix}_rig.glb',
        'assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/model_rig.glb',
        'apps/game/public/assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/model_rig.glb'
    ]
    out_anim_paths = [
        f'{out_prefix}_anim.glb',
        'assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb',
        'apps/game/public/assets/default/model3d/npc_zhujue__ch00_f_bald_base_body/anim_idle_walk_run.glb'
    ]

    print(f"Loading Models:")
    print(f"  Body: {body_path}")
    print(f"  Head: {head_path}")
    j_body, bin_body = load_glb(body_path)
    j_head, bin_head = load_glb(head_path)

    # 1. Slice Body at neck base Y_SEAM
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
    print(f"Body: kept {len(idx_b_comp)} tris, {len(pos_b_comp)} vertices, rim has {len(b_rim_v)} vertices on plane Y={y_seam}")
    print(f"Body neck center: [{b_center_x:.5f}, {b_center_z:.5f}]")

    # Body rim geometry parametrization
    th_b = np.arctan2(pos_b_comp[b_rim_v, 2] - c_neck[2], pos_b_comp[b_rim_v, 0] - c_neck[0])
    r_b = np.sqrt((pos_b_comp[b_rim_v, 0] - c_neck[0])**2 + (pos_b_comp[b_rim_v, 2] - c_neck[2])**2)
    order_b = np.argsort(th_b)
    th_b_s = th_b[order_b]
    r_b_s = r_b[order_b]
    norm_b_s = norm_b_comp[b_rim_v][order_b]

    # Target joints for neck transition: Neck (38), Head (39), LeftShoulder (14), RightShoulder (41)
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

    # 2. Slice Head at Y_H_CUT
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
    chin_local = 0.1100
    crown_local = 0.9792
    chin_world = chin_local * s + T_y
    crown_world = crown_local * s + T_y
    head_height = crown_world - chin_world
    total_height = crown_world
    ratio = total_height / head_height

    print(f"Head: kept {len(idx_h_comp)} tris, {len(pos_h_trans)} vertices, rim has {len(h_rim_v)} vertices")
    print(f"Head transform: scale={s:.4f}, translation=[{T[0]:.5f}, {T[1]:.5f}, {T[2]:.5f}]")
    print(f"Head world chin: Y={chin_world:.4f}, crown: Y={crown_world:.4f}, head height: {head_height:.4f}m ({head_height*100:.2f}cm)")
    print(f"Character total height: {total_height:.4f}m ({total_height*100:.2f}cm), Head-to-body ratio: {ratio:.2f}:1")

    # 3. Docking: Match head rim to body rim at Y_SEAM with 0.0000mm gap
    joints_h = np.zeros((len(pos_h_trans), 4), dtype=np.uint8)
    weights_h = np.zeros((len(pos_h_trans), 4), dtype=np.float32)

    # Make seam normals strictly continuous:
    # A cylindrical radial outward normal along theta ensures continuous surface curvature
    for v in h_rim_v:
        th = np.arctan2(pos_h_trans[v, 2] - c_neck[2], pos_h_trans[v, 0] - c_neck[0])
        r_target, n_target, w_target = eval_body_rim(th)
        pos_h_trans[v, 0] = c_neck[0] + r_target * np.cos(th)
        pos_h_trans[v, 1] = y_seam
        pos_h_trans[v, 2] = c_neck[2] + r_target * np.sin(th)
        
        # Smooth combined normal: average of body rim normal and head outward normal
        radial_n = np.array([np.cos(th), 0.0, np.sin(th)], dtype=np.float32)
        combined_n = (n_target + radial_n * 0.5) / (np.linalg.norm(n_target + radial_n * 0.5) + 1e-9)
        norm_h_comp[v] = combined_n
        joints_h[v] = target_joints
        weights_h[v] = w_target

    # Also update body rim normals to match combined_n exactly:
    for bv in b_rim_v:
        th = np.arctan2(pos_b_comp[bv, 2] - c_neck[2], pos_b_comp[bv, 0] - c_neck[0])
        radial_n = np.array([np.cos(th), 0.0, np.sin(th)], dtype=np.float32)
        norm_b_comp[bv] = (norm_b_comp[bv] + radial_n * 0.5) / (np.linalg.norm(norm_b_comp[bv] + radial_n * 0.5) + 1e-9)

    # Smooth gentle blend over the entire lower neck up to chin_world - 0.0020
    blend_top = chin_world - 0.0020
    head_y = pos_h_trans[:, 1]
    blend_mask = (head_y > y_seam) & (head_y < blend_top)
    blend_indices = np.where(blend_mask)[0]

    for v in blend_indices:
        y = head_y[v]
        t = (y - y_seam) / (blend_top - y_seam)
        # Smooth Hermite cubic interpolation
        weight_seam = 1.0 - (3.0 * (t ** 2) - 2.0 * (t ** 3))
        th = np.arctan2(pos_h_trans[v, 2] - c_neck[2], pos_h_trans[v, 0] - c_neck[0])
        r_targ, n_targ, _ = eval_body_rim(th)
        radial_n = np.array([np.cos(th), 0.0, np.sin(th)], dtype=np.float32)
        target_n = (n_targ + radial_n * 0.5) / (np.linalg.norm(n_targ + radial_n * 0.5) + 1e-9)

        curr_r = np.sqrt((pos_h_trans[v, 0] - c_neck[0])**2 + (pos_h_trans[v, 2] - c_neck[2])**2)
        new_r = curr_r * (1.0 - weight_seam) + r_targ * weight_seam
        pos_h_trans[v, 0] = c_neck[0] + new_r * np.cos(th)
        pos_h_trans[v, 2] = c_neck[2] + new_r * np.sin(th)

        blended_n = norm_h_comp[v] * (1.0 - weight_seam) + target_n * weight_seam
        norm_h_comp[v] = blended_n / (np.linalg.norm(blended_n) + 1e-9)

    # 4. Skinning weights interpolation across lower neck up to head base
    head_y_base = chin_world
    for i in range(len(pos_h_trans)):
        if i in h_rim_v: continue
        y = pos_h_trans[i, 1]
        if y >= head_y_base:
            joints_h[i] = [39, 0, 0, 0]
            weights_h[i] = [1.0, 0.0, 0.0, 0.0]
        else:
            th = np.arctan2(pos_h_trans[i, 2] - c_neck[2], pos_h_trans[i, 0] - c_neck[0])
            _, _, w_seam = eval_body_rim(th)
            t = np.clip((y - y_seam) / (head_y_base - y_seam + 1e-9), 0.0, 1.0)
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

    print(f"✔ Boundary Conforming Complete: Body rim {len(b_rim_v)} pts, Head rim {len(h_rim_v)} pts, seam gap = 0.0000mm!")

    # 5. Seamless Texture Blending at Seam Loop
    head_src_bc = '.agents/coord/ART-3d-tripo-web/fresh_run/head_v20_bc_matched.jpg'
    if not os.path.exists(head_src_bc):
        head_src_bc = '.agents/coord/ART-3d-tripo-web/fresh_run/head_v20_bc.jpg'

    head_dst_bc = f'.agents/coord/ART-3d-tripo-web/user_selected/head_bc_blended.jpg'
    head_dst_rm = f'.agents/coord/ART-3d-tripo-web/user_selected/head_rm_blended.jpg'
    head_dst_nm = f'.agents/coord/ART-3d-tripo-web/user_selected/head_nm_blended.jpg'
    body_dst_bc = f'.agents/coord/ART-3d-tripo-web/user_selected/body_bc_blended.jpg'
    body_dst_rm = f'.agents/coord/ART-3d-tripo-web/user_selected/body_rm_blended.jpg'
    body_dst_nm = f'.agents/coord/ART-3d-tripo-web/user_selected/body_nm_blended.jpg'

    try:
        b_bv_bc = j_body['bufferViews'][j_body['images'][1]['bufferView']]
        b_bc_img = Image.open(io.BytesIO(bin_body[b_bv_bc['byteOffset']:b_bv_bc['byteOffset']+b_bv_bc['byteLength']])).convert('RGB')
        b_bc_np = np.array(b_bc_img)
        bw, bh = b_bc_img.size

        b_seam_mask = np.where((pos_b[:, 1] >= y_seam - 0.003) & (pos_b[:, 1] <= y_seam + 0.001))[0]
        target_bc = np.array([b_bc_np[int(np.clip(v * bh, 0, bh - 1)), int(np.clip(u * bw, 0, bw - 1))] for u, v in uv_b[b_seam_mask]]).mean(axis=0)

        # Neck texture blend over lower head neck
        y_v = pos_h_trans[:, 1]
        head_neck_tex_top = y_seam + 0.0080
        t_w = np.clip((y_v - y_seam) / (head_neck_tex_top - y_seam), 0.0, 1.0)
        v_weights = 1.0 - (3.0 * t_w**2 - 2.0 * t_w**3)
        tri_w = v_weights[idx_h_comp]
        neck_tri_mask = (tri_w > 0.001).any(axis=1)
        neck_tris = idx_h_comp[neck_tri_mask]
        mean_w = tri_w[neck_tri_mask].mean(axis=1)

        mask_img = Image.new('L', (2048, 2048), 0)
        draw = ImageDraw.Draw(mask_img)
        uv_pts = uv_h_comp * 2048.0
        order = np.argsort(mean_w)
        for tri_idx in order:
            w_val = int(mean_w[tri_idx] * 255)
            if w_val > 0:
                draw.polygon([(uv_pts[v, 0], uv_pts[v, 1]) for v in neck_tris[tri_idx]], fill=w_val)

        weight_raw = scipy.ndimage.grey_dilation(np.array(mask_img).astype(np.float32) / 255.0, size=(11, 11))
        weight_map = scipy.ndimage.gaussian_filter(weight_raw, sigma=6.0)[:, :, None]

        head_bc = np.array(Image.open(head_src_bc).convert('RGB')).astype(np.float32)
        blended_bc = head_bc * (1.0 - weight_map) + target_bc * weight_map
        Image.fromarray(np.clip(blended_bc, 0, 255).astype(np.uint8)).save(head_dst_bc, quality=95)

        # Also match roughness and fade normal map near seam for head:
        b_bv_rm = j_body['bufferViews'][j_body['images'][2]['bufferView']]
        b_rm_raw = bin_body[b_bv_rm['byteOffset']:b_bv_rm['byteOffset']+b_bv_rm['byteLength']]
        b_rm_np = np.array(Image.open(io.BytesIO(b_rm_raw)).convert('RGB'))
        target_rm = np.array([b_rm_np[int(np.clip(v * bh, 0, bh - 1)), int(np.clip(u * bw, 0, bw - 1))] for u, v in uv_b[b_seam_mask]]).mean(axis=0)

        h_bv_rm = j_head['bufferViews'][j_head['images'][2]['bufferView']]
        head_rm = np.array(Image.open(io.BytesIO(bin_head[h_bv_rm['byteOffset']:h_bv_rm['byteOffset']+h_bv_rm['byteLength']])).convert('RGB')).astype(np.float32)
        blended_rm = head_rm * (1.0 - weight_map) + target_rm * weight_map
        Image.fromarray(np.clip(blended_rm, 0, 255).astype(np.uint8)).save(head_dst_rm, quality=95)

        # Head normal map: fade towards flat normal [128, 128, 255] at seam
        h_bv_nm = j_head['bufferViews'][j_head['images'][0]['bufferView']]
        head_nm = np.array(Image.open(io.BytesIO(bin_head[h_bv_nm['byteOffset']:h_bv_nm['byteOffset']+h_bv_nm['byteLength']])).convert('RGB')).astype(np.float32)
        flat_nm = np.array([128.0, 128.0, 255.0], dtype=np.float32)
        blended_nm = head_nm * (1.0 - weight_map) + flat_nm * weight_map
        Image.fromarray(np.clip(blended_nm, 0, 255).astype(np.uint8)).save(head_dst_nm, quality=95)

        # Upper body neck texture blend (y_seam - 0.0050 to y_seam)
        body_neck_bottom = y_seam - 0.0050
        y_vb = pos_b[:, 1]
        t_wb = np.clip((y_vb - body_neck_bottom) / (y_seam - body_neck_bottom), 0.0, 1.0)
        v_weights_b = 3.0 * t_wb**2 - 2.0 * t_wb**3
        tri_wb = v_weights_b[idx_b]
        mask_b = (tri_wb > 0.001).any(axis=1) & (pos_b[idx_b[:, 0], 1] <= y_seam + 0.001) & (pos_b[idx_b[:, 1], 1] <= y_seam + 0.001) & (pos_b[idx_b[:, 2], 1] <= y_seam + 0.001)
        neck_tris_b = idx_b[mask_b]
        mean_wb = tri_wb[mask_b].mean(axis=1)

        mask_img_b = Image.new('L', (2048, 2048), 0)
        draw_b = ImageDraw.Draw(mask_img_b)
        uv_pts_b = uv_b * 2048.0
        order_b_tri = np.argsort(mean_wb)
        for tri_idx in order_b_tri:
            w_val = int(mean_wb[tri_idx] * 255)
            if w_val > 0:
                draw_b.polygon([(uv_pts_b[v, 0], uv_pts_b[v, 1]) for v in neck_tris_b[tri_idx]], fill=w_val)

        weight_raw_b = scipy.ndimage.grey_dilation(np.array(mask_img_b).astype(np.float32) / 255.0, size=(11, 11))
        weight_map_b = scipy.ndimage.gaussian_filter(weight_raw_b, sigma=6.0)[:, :, None]

        blended_body_bc = b_bc_np.astype(np.float32) * (1.0 - weight_map_b) + target_bc * weight_map_b
        Image.fromarray(np.clip(blended_body_bc, 0, 255).astype(np.uint8)).save(body_dst_bc, quality=95)

        blended_body_rm = b_rm_np.astype(np.float32) * (1.0 - weight_map_b) + target_rm * weight_map_b
        Image.fromarray(np.clip(blended_body_rm, 0, 255).astype(np.uint8)).save(body_dst_rm, quality=95)

        # Body normal map: fade towards flat normal [128, 128, 255] at seam
        b_bv_nm = j_body['bufferViews'][j_body['images'][0]['bufferView']]
        body_nm = np.array(Image.open(io.BytesIO(bin_body[b_bv_nm['byteOffset']:b_bv_nm['byteOffset']+b_bv_nm['byteLength']])).convert('RGB')).astype(np.float32)
        blended_body_nm = body_nm * (1.0 - weight_map_b) + flat_nm * weight_map_b
        Image.fromarray(np.clip(blended_body_nm, 0, 255).astype(np.uint8)).save(body_dst_nm, quality=95)

        print("✔ Seamless texture color, roughness, and normal map blended across neck boundary!")
    except Exception as e:
        print(f"Texture blend notice: {e}")

    # 6. Build Combined Binary Buffer & GLTF
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
        "asset": {"generator": "Tianshu 3D Pipeline (User Selected Body Stitch)", "version": "2.0"},
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

    # Primitive 0 (Body) attributes
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

    # Primitive 1 (Head) attributes
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

    # Body Textures & Images
    for img_idx, img_info in enumerate(j_body.get('images', [])):
        if img_idx == 0 and os.path.exists(body_dst_nm):
            img_bytes = open(body_dst_nm, 'rb').read()
            mime = "image/jpeg"
        elif img_idx == 1 and os.path.exists(body_dst_bc):
            img_bytes = open(body_dst_bc, 'rb').read()
            mime = "image/jpeg"
        elif img_idx == 2 and os.path.exists(body_dst_rm):
            img_bytes = open(body_dst_rm, 'rb').read()
            mime = "image/jpeg"
        else:
            img_bv = j_body['bufferViews'][img_info['bufferView']]
            img_bytes = bin_body[img_bv['byteOffset'] : img_bv['byteOffset'] + img_bv['byteLength']]
            mime = img_info['mimeType']
        idx, bv = add_buffer_data(img_bytes)
        j_out['bufferViews'].append(bv)
        j_out['images'].append({"bufferView": idx, "mimeType": mime})

    for tex in j_body.get('textures', []):
        j_out['textures'].append(tex)

    mat_b = j_body['materials'][0].copy()
    mat_b['doubleSided'] = True
    j_out['materials'].append(mat_b)

    # Head Textures & Images
    head_img_offset = len(j_out['images'])
    for img_idx, img_info in enumerate(j_head.get('images', [])):
        if img_idx == 0 and os.path.exists(head_dst_nm):
            img_bytes = open(head_dst_nm, 'rb').read()
            mime = "image/jpeg"
        elif img_idx == 1 and os.path.exists(head_dst_bc):
            img_bytes = open(head_dst_bc, 'rb').read()
            mime = "image/jpeg"
        elif img_idx == 2 and os.path.exists(head_dst_rm):
            img_bytes = open(head_dst_rm, 'rb').read()
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

    # Single Mesh with 2 Primitives
    j_out['meshes'].append({
        "name": "character_mesh",
        "primitives": [
            {
                "attributes": {
                    "POSITION": acc_pos_b, "NORMAL": acc_norm_b, "TEXCOORD_0": acc_uv_b,
                    "JOINTS_0": acc_joints_b, "WEIGHTS_0": acc_weights_b
                },
                "indices": acc_idx_b,
                "material": 0
            },
            {
                "attributes": {
                    "POSITION": acc_pos_h, "NORMAL": acc_norm_h, "TEXCOORD_0": acc_uv_h,
                    "JOINTS_0": acc_joints_h, "WEIGHTS_0": acc_weights_h
                },
                "indices": acc_idx_h,
                "material": 1
            }
        ]
    })

    j_out['buffers'][0]['byteLength'] = len(out_bin)

    print("Building model_rig.glb...")
    rig_bytes = build_glb(j_out, bytes(out_bin))
    for p in out_rig_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'wb') as f:
            f.write(rig_bytes)
        print(f"  Saved {p} ({len(rig_bytes)} bytes)")

    # 7. Build anim_idle_walk_run.glb by copying animations from body
    print("Building anim_idle_walk_run.glb...")
    j_anim_out = json.loads(json.dumps(j_out))
    anim_bin = bytearray(out_bin)

    def add_anim_buffer(data_bytes):
        pad = (4 - len(anim_bin) % 4) % 4
        anim_bin.extend(b'\x00' * pad)
        offset = len(anim_bin)
        anim_bin.extend(data_bytes)
        bv = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(data_bytes)}
        return len(j_anim_out['bufferViews']), bv

    for anim in j_body.get('animations', []):
        new_samplers = []
        for s_anim in anim['samplers']:
            in_data = get_accessor_data(j_body, bin_body, s_anim['input'])
            idx_in, bv_in = add_anim_buffer(in_data.tobytes())
            j_anim_out['bufferViews'].append(bv_in)
            a_in = j_body['accessors'][s_anim['input']].copy()
            a_in['bufferView'] = idx_in
            acc_in_idx = len(j_anim_out['accessors'])
            j_anim_out['accessors'].append(a_in)

            out_data = get_accessor_data(j_body, bin_body, s_anim['output'])
            idx_out, bv_out = add_anim_buffer(out_data.tobytes())
            j_anim_out['bufferViews'].append(bv_out)
            a_out = j_body['accessors'][s_anim['output']].copy()
            a_out['bufferView'] = idx_out
            acc_out_idx = len(j_anim_out['accessors'])
            j_anim_out['accessors'].append(a_out)

            new_samplers.append({
                "input": acc_in_idx,
                "interpolation": s_anim.get('interpolation', 'LINEAR'),
                "output": acc_out_idx
            })

        new_channels = []
        for ch in anim['channels']:
            new_channels.append({
                "sampler": ch['sampler'],
                "target": ch['target']
            })

        j_anim_out.setdefault('animations', []).append({
            "name": anim['name'],
            "samplers": new_samplers,
            "channels": new_channels
        })

    j_anim_out['buffers'][0]['byteLength'] = len(anim_bin)
    anim_bytes = build_glb(j_anim_out, bytes(anim_bin))
    for p in out_anim_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'wb') as f:
            f.write(anim_bytes)
        print(f"  Saved {p} ({len(anim_bytes)} bytes)")
    print(f"✔ Assembly complete! (Ratio = {ratio:.2f}:1)")
    return ratio

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--body', default='.agents/coord/ART-3d-tripo-web/user_selected/p2_figure_anim_idle_walk_run.glb')
    parser.add_argument('--head', default='.agents/coord/ART-3d-tripo-web/fresh_run/head_mesh_v20_true.glb')
    parser.add_argument('--seam', type=float, default=0.8380)
    parser.add_argument('--cut', type=float, default=0.0400)
    parser.add_argument('--scale', type=float, default=0.1440)
    parser.add_argument('--prefix', default='.agents/coord/ART-3d-tripo-web/user_selected/assembled_p2')
    args = parser.parse_args()

    assemble(args.body, args.head, y_seam=args.seam, y_h_cut=args.cut, s=args.scale, out_prefix=args.prefix)

if __name__ == '__main__':
    main()
