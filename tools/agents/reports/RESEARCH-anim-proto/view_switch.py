"""Per-part view selection + torso affine fit test for projected mocap.
For each clip/view: how many torso view switches (with hysteresis), affine-fit residual in px @128ppm,
and anisotropy (distortion) of the fitted torso affine."""
import sys, glob, math
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from glb_fk import Skeleton
from analyze_clips import UE, DEF, horiz, UP, yaw_of, rot_y, frames, rest_frame, char_forward

SPRITE_YAWS = {'front34': 45, 'side': 90, 'back34': 135, 'front34M': -45, 'sideM': -90, 'back34M': -135}

def nearest_view(theta, current, hyst=10.0):
    # theta in degrees (wrapped to [-180,180)); pick sprite whose yaw is closest, with hysteresis
    def dist(a, b):
        d = (a - b + 180) % 360 - 180; return abs(d)
    best = min(SPRITE_YAWS, key=lambda k: dist(theta, SPRITE_YAWS[k]))
    if current is None: return best
    if dist(theta, SPRITE_YAWS[best]) + hyst < dist(theta, SPRITE_YAWS[current]): return best
    return current

def anchors2d(P, R):
    Q = {k: R @ v for k, v in P.items()}
    return np.array([[Q[k][0], Q[k][1]] for k in ('pelvis', 'neck', 'sh_l', 'sh_r')])

def fit_affine(src, dst):
    A = np.hstack([src, np.ones((len(src), 1))])
    X, *_ = np.linalg.lstsq(A, dst, rcond=None)  # 3x2
    res = A @ X - dst
    M = X[:2, :].T
    sv = np.linalg.svd(M, compute_uv=False)
    return np.sqrt((res ** 2).sum(1).mean()), sv[0] / max(sv[1], 1e-9), np.linalg.det(M)

def run(path, M, clips, ppm=128, fps=30):
    sk = Skeleton(path)
    rest = rest_frame(sk, M)
    base_yaw = yaw_of(char_forward(rest))
    # reference sprite layouts: rest pose projected at each sprite's canonical yaw
    ref = {}
    for name, y in SPRITE_YAWS.items():
        ref[name] = anchors2d(rest, rot_y(y - base_yaw))
    print(f'\n### {path.split("/")[-1]}')
    for clip in clips:
        F = frames(sk, M, clip, fps)
        for vname, vdeg in (('front34', 45), ('side', 90), ('back34', 135)):
            R = rot_y(vdeg - base_yaw)
            cur = None; switches = 0; resid = []; aniso = []; flips = 0
            for P in F:
                Q = {k: R @ v for k, v in P.items()}
                rc = horiz(Q['sh_r'] - Q['sh_l']); fc = horiz(np.cross(UP, rc))
                theta = yaw_of(fc)
                nxt = nearest_view(theta, cur)
                if cur is not None and nxt != cur: switches += 1
                cur = nxt
                # fit chosen sprite's anchors to the projected frame anchors
                src = ref[cur].copy(); dst = anchors2d(P, R)
                r, an, det = fit_affine(src - src[0], dst - dst[0])
                resid.append(r * ppm); aniso.append(an); flips += det < 0
            print(f"{clip:20s} {vname:8s} torso-view switches={switches:2d} | affine resid p95={np.percentile(resid,95):.1f}px max={max(resid):.1f}px @{ppm}ppm | anisotropy p95={np.percentile(aniso,95):.2f} | det<0 frames={flips}")

if __name__ == '__main__':
    base = '/private/tmp/claude-501/-Users-bytedance-Projects-jinyongqunxia/0212031f-f2ac-4925-a6ba-d50d0c2e9ce5/scratchpad/ref'
    p1 = glob.glob(base + '/ual1/*/Godot/*.glb')[0]
    p2 = glob.glob(base + '/ual2/*/Unreal-Godot/UAL2_Standard.glb')[0]
    run(p1, DEF, ['Walk_Loop', 'Sword_Attack', 'Punch_Jab', 'Hit_Chest', 'Death01'])
    run(p2, UE, ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C', 'Melee_Hook', 'Hit_Knockback'])
