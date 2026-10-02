"""Quantify how CC0 mocap clips look when projected onto the three tianshu_rig views.
Metrics per clip x view: limb foreshortening, chest yaw drift (which view sprite fits),
depth-order violations vs. the static z table, per-frame angular speed."""
import sys, glob, math
import numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from glb_fk import Skeleton

UE = dict(pelvis='pelvis', neck='neck_01', head='Head', sh_l='upperarm_l', sh_r='upperarm_r',
          el_l='lowerarm_l', el_r='lowerarm_r', wr_l='hand_l', wr_r='hand_r', hd_l='middle_01_l', hd_r='middle_01_r',
          hip_l='thigh_l', hip_r='thigh_r', kn_l='calf_l', kn_r='calf_r', an_l='foot_l', an_r='foot_r', to_l='ball_l', to_r='ball_r')
DEF = dict(pelvis='DEF-hips', neck='DEF-neck', head='DEF-head', sh_l='DEF-upper_arm.L', sh_r='DEF-upper_arm.R',
           el_l='DEF-forearm.L', el_r='DEF-forearm.R', wr_l='DEF-hand.L', wr_r='DEF-hand.R', hd_l='DEF-f_middle.01.L', hd_r='DEF-f_middle.01.R',
           hip_l='DEF-thigh.L', hip_r='DEF-thigh.R', kn_l='DEF-shin.L', kn_r='DEF-shin.R', an_l='DEF-foot.L', an_r='DEF-foot.R', to_l='DEF-toe.L', to_r='DEF-toe.R')
BONES = {  # part: (from, to)
    'torso': ('pelvis', 'neck'), 'head': ('neck', 'head'),
    'upper_arm_L': ('sh_l', 'el_l'), 'upper_arm_R': ('sh_r', 'el_r'),
    'forearm_L': ('el_l', 'wr_l'), 'forearm_R': ('el_r', 'wr_r'),
    'hand_L': ('wr_l', 'hd_l'), 'hand_R': ('wr_r', 'hd_r'),
    'thigh_L': ('hip_l', 'kn_l'), 'thigh_R': ('hip_r', 'kn_r'),
    'shin_L': ('kn_l', 'an_l'), 'shin_R': ('kn_r', 'an_r'),
    'foot_L': ('an_l', 'to_l'), 'foot_R': ('an_r', 'to_r'),
}
VIEWS = {'front': 0.0, 'front34': 45.0, 'side': 90.0, 'back34': 135.0, 'back': 180.0}
UP = np.array([0, 1.0, 0])

def horiz(v):
    v = v.copy(); v[1] = 0; n = np.linalg.norm(v); return v / n if n > 1e-9 else v

def frames(sk, M, clip, fps=30):
    dur = sk.duration(clip) if clip else 0
    n = max(1, int(round(dur * fps)) + 1)
    out = []
    for k in range(n):
        G = sk.sample(clip, min(k / fps, dur))
        out.append({key: sk.pos(G, name) for key, name in M.items()})
    return out

def rest_frame(sk, M):
    G = sk.sample(None, 0)
    return {key: sk.pos(G, name) for key, name in M.items()}

def char_forward(P):
    r = horiz(P['hip_r'] - P['hip_l'])  # anatomical right
    return horiz(np.cross(UP, r))       # f = u x r

def yaw_of(v):  # angle in XZ plane, 0 = +Z, positive toward -X (screen-left)
    return math.degrees(math.atan2(-v[0], v[2]))

def rot_y(deg):
    a = math.radians(deg); c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

def analyze(path, M, clips, fps=30):
    sk = Skeleton(path)
    rest = rest_frame(sk, M)
    f0 = char_forward(rest)
    base_yaw = yaw_of(f0)
    rest_len = {p: np.linalg.norm(rest[b] - rest[a]) for p, (a, b) in BONES.items()}
    res = []
    for clip in clips:
        if clip not in sk.anims: res.append((clip, None)); continue
        F = frames(sk, M, clip, fps)
        # chest / pelvis yaw relative to initial facing
        chest_yaw, pelvis_yaw = [], []
        for P in F:
            rc = horiz(P['sh_r'] - P['sh_l']); fc = horiz(np.cross(UP, rc))
            rp = horiz(P['hip_r'] - P['hip_l']); fp = horiz(np.cross(UP, rp))
            chest_yaw.append(yaw_of(fc)); pelvis_yaw.append(yaw_of(fp))
        chest_yaw = np.unwrap(np.radians(chest_yaw)); pelvis_yaw = np.unwrap(np.radians(pelvis_yaw))
        y0 = pelvis_yaw[0]
        chest_rel = np.degrees(chest_yaw - y0); pelvis_rel = np.degrees(pelvis_yaw - y0)
        twist = np.degrees(chest_yaw - pelvis_yaw)
        per_view = {}
        for vname, vdeg in VIEWS.items():
            # rotate so that character's initial facing f0 maps to the view facing direction
            R = rot_y(vdeg - base_yaw)
            ratios = {p: [] for p in BONES}
            zviol = 0; ztotal = 0
            for P in F:
                Q = {k: R @ v for k, v in P.items()}
                for p, (a, b) in BONES.items():
                    d = Q[b] - Q[a]
                    ratios[p].append(math.hypot(d[0], d[1]) / max(rest_len[p], 1e-6))
                # depth order check: near arm/far arm vs torso plane (z = toward camera)
                torso_z = (Q['pelvis'][2] + Q['neck'][2]) / 2
                for side in ('l', 'r'):
                    arm_z = (Q[f'el_{side}'][2] + Q[f'wr_{side}'][2]) / 2
                    ztotal += 1
                    # static assumption: in this view the arm keeps the depth sign it has in frame 0
                    if not hasattr(analyze, '_init'): pass
                per_view[vname] = ratios
            # static z-sign violations: compare each frame's sign of (arm - torso) with frame 0 sign
            signs0 = None; viol = 0; tot = 0
            for P in F:
                Q = {k: R @ v for k, v in P.items()}
                torso_z = (Q['pelvis'][2] + Q['neck'][2]) / 2
                s = []
                for side in ('l', 'r'):
                    for j in ('el', 'wr'):
                        s.append(np.sign(Q[f'{j}_{side}'][2] - torso_z))
                if signs0 is None: signs0 = s
                viol += sum(1 for a, b in zip(s, signs0) if a != b); tot += len(s)
            per_view[vname] = (ratios, viol / max(tot, 1))
        res.append((clip, dict(n=len(F), dur=len(F) / fps, chest=(chest_rel.min(), chest_rel.max()),
                               pelvis=(pelvis_rel.min(), pelvis_rel.max()), twist=(twist.min(), twist.max()),
                               views=per_view)))
    return res

def report(path, M, clips):
    print(f'\n### {path.split("/")[-1]}')
    for clip, r in analyze(path, M, clips):
        if r is None: print(f'{clip}: missing'); continue
        print(f"{clip}: {r['n']} frames ({r['dur']:.1f}s); chest yaw {r['chest'][0]:+.0f}..{r['chest'][1]:+.0f} deg; pelvis yaw {r['pelvis'][0]:+.0f}..{r['pelvis'][1]:+.0f}; twist {r['twist'][0]:+.0f}..{r['twist'][1]:+.0f}")
        for vname in ('front34', 'side', 'back34'):
            ratios, zv = r['views'][vname]
            worst = sorted(((min(v), p) for p, v in ratios.items()))[:3]
            arm_r = min(ratios['forearm_R']); arm_l = min(ratios['forearm_L'])
            frac_short = np.mean([np.mean(np.array(ratios[p]) < 0.5) for p in ('upper_arm_R', 'forearm_R', 'upper_arm_L', 'forearm_L')])
            print(f"   {vname:8s} worst-foreshorten " + ', '.join(f'{p}={m:.2f}' for m, p in worst)
                  + f" | arm-segments<0.5 in {frac_short*100:.0f}% frames | arm depth flips vs frame0 {zv*100:.0f}%")

if __name__ == '__main__':
    base = '/private/tmp/claude-501/-Users-bytedance-Projects-jinyongqunxia/0212031f-f2ac-4925-a6ba-d50d0c2e9ce5/scratchpad/ref'
    p1 = glob.glob(base + '/ual1/*/Godot/*.glb')[0]
    p2 = glob.glob(base + '/ual2/*/Unreal-Godot/UAL2_Standard.glb')[0]
    report(p1, DEF, ['Walk_Loop', 'Idle_Loop', 'Sword_Attack', 'Punch_Jab', 'Punch_Cross', 'Hit_Chest', 'Death01', 'Sitting_Idle_Loop', 'Roll'])
    report(p2, UE, ['Sword_Regular_A', 'Sword_Regular_B', 'Sword_Regular_C', 'Sword_Regular_Combo', 'Sword_Block', 'Melee_Hook', 'Hit_Knockback', 'OverhandThrow', 'LayToIdle'])
