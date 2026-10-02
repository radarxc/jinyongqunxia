"""Constrained torso transform: spine similarity + width scale (no shear).
Reports width-ratio spread after per-part view selection and residual of shoulder points."""
import sys, glob
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from glb_fk import Skeleton
from analyze_clips import UE, DEF, horiz, UP, yaw_of, rot_y, frames, rest_frame, char_forward
from view_switch import SPRITE_YAWS, nearest_view

def proj(P, R):
    return {k: (R @ v)[:2] for k, v in P.items()}

def spine_frame(A):
    o = A['pelvis']; s = A['neck'] - o; L = np.linalg.norm(s); u = s / L
    n = np.array([u[1], -u[0]])  # perpendicular (screen-right when spine is up)
    return o, u, n, L

def run(path, M, clips, ppm=128):
    sk = Skeleton(path); rest = rest_frame(sk, M); base = yaw_of(char_forward(rest))
    ref = {k: proj(rest, rot_y(y - base)) for k, y in SPRITE_YAWS.items()}
    print(f'\n### {path.split("/")[-1]}')
    for clip in clips:
        F = frames(sk, M, clip, 30)
        for vname, vdeg in (('front34', 45), ('side', 90), ('back34', 135)):
            R = rot_y(vdeg - base); cur = None; wr = []; res = []
            for P in F:
                Q3 = {k: R @ v for k, v in P.items()}
                rc = horiz(Q3['sh_r'] - Q3['sh_l']); theta = yaw_of(horiz(np.cross(UP, rc)))
                cur = nearest_view(theta, cur)
                A = proj(P, R); B = ref[cur]
                oa, ua, na, La = spine_frame(A); ob, ub, nb, Lb = spine_frame(B)
                # shoulder coordinates in spine frames
                def coords(X, o, u, n, L): return np.array([[np.dot(X[k] - o, n), np.dot(X[k] - o, u)] for k in ('sh_l', 'sh_r')])
                ca = coords(A, oa, ua, na, La); cb = coords(B, ob, ub, nb, Lb)
                wa = ca[1, 0] - ca[0, 0]; wb = cb[1, 0] - cb[0, 0]
                w = wa / wb if abs(wb) > 1e-6 else 1.0
                wr.append(w)
                # predicted shoulders with similarity (scale La/Lb along spine) + width scale clamp
                wc = float(np.clip(w, 0.6, 1.4)); s = La / Lb
                pred = np.array([[cb[i, 0] * s * wc, cb[i, 1] * s] for i in range(2)])
                res.append(np.sqrt(((pred - ca) ** 2).sum(1)).max() * ppm)
            wr = np.array(wr)
            print(f"{clip:20s} {vname:8s} width-ratio p5={np.percentile(wr,5):+.2f} p50={np.percentile(wr,50):+.2f} p95={np.percentile(wr,95):+.2f} | frames outside[0.6,1.4]={np.mean((wr<0.6)|(wr>1.4))*100:.0f}% | shoulder err p95={np.percentile(res,95):.1f}px")

if __name__ == '__main__':
    base = '/private/tmp/claude-501/-Users-bytedance-Projects-jinyongqunxia/0212031f-f2ac-4925-a6ba-d50d0c2e9ce5/scratchpad/ref'
    p1 = glob.glob(base + '/ual1/*/Godot/*.glb')[0]
    p2 = glob.glob(base + '/ual2/*/Unreal-Godot/UAL2_Standard.glb')[0]
    run(p1, DEF, ['Walk_Loop', 'Sword_Attack', 'Punch_Jab', 'Hit_Chest'])
    run(p2, UE, ['Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook'])
