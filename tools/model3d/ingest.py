#!/usr/bin/env python3
"""Tripo 网页版产物入库（AR-65）：~/Downloads/tripo__<npc_id>.* → assets/default/model3d/<npc_id>/。

在 _prod 根目录运行：
  python3 tools/model3d/ingest.py <npc_id> --project <pid> --gen-op <op> --rig-op <op> \\
      --ref assets/default/character/<性别>/chNN/threeview/<…>_apose_slim.png \\
      --subject "阿青（越女剑 ch00 · 少女）· 窄轮廓 A 字版" --notes "看图验收：…" [--commit]

读入（驱动 tools/model3d/tripo_web.js 存的文件名）：
  tripo__<npc>.glb                     绑骨后基础模型（无动画）→ model_rig.glb
  tripo__<npc>.png / .webp / .jpg      预览（Tripo 封面渲染）→ preview.png（RGB，长边 ≤ 1024）
  tripo__<npc>__anim_<a>_<b>.glb       给了 --anim 时：动作单文件 → anim_<a>_<b>.glb
  tripo__<npc>__rig.*                  骨架叠加图，只用于看图，入库后删掉
检查：GLB 文件头、65 个 mixamorig 关节（另允许 neutral_bone，共 66）、基础模型不带动画、关节体检（髋 / 头 / 头顶 / 手 / 脚的高度）。
写 manifest.yaml（字段同已入库的 38 套），--commit 时只按目录路径提交（撞上 index.lock 自动重试）。
用掉的下载文件会删掉（--keep-src 保留）。--dry-run 只检查不搬文件。
"""
import argparse, datetime, glob, hashlib, json, math, os, shutil, struct, subprocess, sys, time

REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
GEN = {
    'ai_model': 'HD Model · H3.1 Best Quality (v3.1-20260211)', 'geometry_quality': 'detailed（Ultra Mesh Quality）',
    'texture': True, 'texture_quality': 'extreme（8K 生成）', 'pbr': True, 'delight': True, 'topology': 'triangle', 'face_limit': 100000,
    'texture_alignment': 'original_image', 'generate_parts': False, 'ai_complete': False, 'visibility': 'private',
}
RIG = {'rigging_type': 'Humanoid（biped）', 'skeleton_preset': 'Mixamo（mixamorig:*）', 'rig_model_version': 'v3.0-20260909'}
EXPORT = {'format': 'GLB', 'texture_resolution': '2k', 'export_skeleton': True}
PREVIEW_NOTES = 'Tripo 绑骨后自带的封面渲染 studio_mesh（正面、白底、600×778），由 tripo_web.js preview() 取回，转 RGB PNG（长边 ≤ 1024）。'


def die(msg):
    print('ERROR: ' + msg, file=sys.stderr)
    sys.exit(2)


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def wait_file(path, secs):
    t0, last = time.time(), -1
    while time.time() - t0 < secs:
        if os.path.exists(path):
            s = os.path.getsize(path)
            if s > 0 and s == last:
                return True
            last = s
        time.sleep(2)
    return os.path.exists(path) and os.path.getsize(path) > 0


def glb(path):
    b = open(path, 'rb').read()
    if len(b) < 20 or struct.unpack_from('<I', b, 0)[0] != 0x46546C67:
        die(f'{path} 不是 GLB')
    j = json.loads(b[20:20 + struct.unpack_from('<I', b, 12)[0]])
    tris = verts = 0
    for m in j.get('meshes', []):
        for p in m['primitives']:
            if 'indices' in p:
                tris += j['accessors'][p['indices']]['count'] // 3
            verts += j['accessors'][p['attributes']['POSITION']]['count']
    anims = []
    for a in j.get('animations', []):
        mx = max([j['accessors'][s['input']].get('max', [0])[0] for s in a['samplers']] or [0])
        anims.append(f"{a.get('name')} ({round(mx, 3)}s)")
    imgs = [f"{im.get('mimeType')} {j['bufferViews'][im['bufferView']]['byteLength']} B" for im in j.get('images', []) if 'bufferView' in im]
    sk = (j.get('skins') or [{}])[0].get('joints', [])
    names = [j['nodes'][i].get('name', '') for i in sk]
    return {'json': j, 'size_bytes': len(b), 'sha256': hashlib.sha256(b).hexdigest(), 'joints': len(sk), 'joint_names': names,
            'triangles': tris, 'vertices': verts, 'animations': anims, 'textures': imgs}


def local(n):
    if 'matrix' in n:
        return list(n['matrix'])
    x, y, z, w = n.get('rotation', [0, 0, 0, 1]); sx, sy, sz = n.get('scale', [1, 1, 1]); tx, ty, tz = n.get('translation', [0, 0, 0])
    return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
            2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
            2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1]


def mul(a, b):
    return [sum(a[k * 4 + r] * b[c * 4 + k] for k in range(4)) for c in range(4) for r in range(4)]


def joint_check(j):
    """静止姿势下 mixamorig 关节的世界坐标体检（模型高度约 0.98）；阈值同 tripo_web.js joints()。"""
    parent = {c: i for i, n in enumerate(j['nodes']) for c in n.get('children', [])}
    memo = {}

    def world(i):
        if i not in memo:
            memo[i] = local(j['nodes'][i]) if i not in parent else mul(world(parent[i]), local(j['nodes'][i]))
        return memo[i]
    pos = {}
    for i in j['skins'][0]['joints']:
        nm = j['nodes'][i].get('name', '')
        if nm.startswith('mixamorig'):
            w = world(i); pos[nm.split(':')[-1].replace('mixamorig', '')] = [round(w[12], 3), round(w[13], 3), round(w[14], 3)]
    H, hd, tp = pos.get('Hips'), pos.get('Head'), pos.get('HeadTop_End')
    lh, rh, lf, rf = pos.get('LeftHand'), pos.get('RightHand'), pos.get('LeftFoot'), pos.get('RightFoot')
    out = lambda a: round(math.hypot(a[0] - H[0], a[2] - H[2]), 3) if a and H else None
    chk = {'hips': bool(H) and 0.45 < H[1] < 0.65, 'head': bool(H and hd) and hd[1] > 0.72 and hd[1] > H[1], 'top': bool(tp and hd) and tp[1] > hd[1],
           'feet': bool(lf and rf) and lf[1] < 0.15 and rf[1] < 0.15,
           'hands': bool(lh and rh) and out(lh) > 0.12 and out(rh) > 0.12 and abs(lh[1] - rh[1]) < 0.1}
    text = (f"关节体检（ingest.py）：髋 y{H[1]}、头 y{hd[1]}、头顶骨端 y{tp[1]}、双手 y{lh[1]}/{rh[1]} 外展 {out(lh)}/{out(rh)}、脚 y{lf[1]}/{rf[1]}"
            if all([H, hd, tp, lh, rh, lf, rf]) else '关节体检：缺关节')
    return all(chk.values()), chk, text


def preview_png(src, dst):
    from PIL import Image
    im = Image.open(src)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
    else:
        im = im.convert('RGB')
    w, h = im.size; s = min(1.0, 1024 / max(w, h))
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    im.save(dst, optimize=True)
    return im.size


def git(*args, check=False):
    return subprocess.run(['git', *args], cwd=REPO, capture_output=True, text=True, check=check)


def commit(path, msg, npc):
    for i in range(10):
        git('add', '--', path)
        git('commit', '-q', '-m', msg, '-m', 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>', '--', path)
        if not git('status', '--porcelain', '--', path).stdout.strip() and npc in git('log', '-1', '--format=%s', '--', path).stdout:
            return git('log', '-1', '--format=%h', '--', path).stdout.strip()
        time.sleep(5)
    die('提交失败（10 次重试后仍有未提交改动），看 git status')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('npc'); ap.add_argument('--project', required=True); ap.add_argument('--gen-op', required=True); ap.add_argument('--rig-op', required=True)
    ap.add_argument('--gen-kind', default='image_to_model', choices=['image_to_model', 'multiview_to_model'])
    ap.add_argument('--ref', required=True, action='append', help='生成输入图（仓库相对路径，可多次：多视图按 Front/Left/Back/Right 顺序给）')
    ap.add_argument('--ref-use', action='append', default=[], help='与 --ref 一一对应的用途说明')
    ap.add_argument('--ref2', action='append', default=[], help='额外登记的参考：<path>=<用途>（不是生成输入）')
    ap.add_argument('--input', default=None, help='生成输入说明（写进 options.generate.input）')
    ap.add_argument('--subject', required=True); ap.add_argument('--notes', required=True)
    ap.add_argument('--anim', default='', help='动作单文件的预设名，逗号分隔，如 idle,walk,run')
    ap.add_argument('--anim-ops', default='', help='idle=<op>,walk=<op>,run=<op>')
    ap.add_argument('--credits', default='generate=65,rig=20')
    ap.add_argument('--preview-notes', default=PREVIEW_NOTES)
    ap.add_argument('--replace', action='store_true'); ap.add_argument('--commit', action='store_true'); ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--keep-src', action='store_true'); ap.add_argument('--msg', default=None)
    ap.add_argument('--src', default=os.path.expanduser('~/Downloads')); ap.add_argument('--wait', type=int, default=90)
    ap.add_argument('--out-root', default='assets/default/model3d')
    ap.add_argument('--backup-root', default='.agents/coord/ART-3d-tripo-web/replaced', help='--replace 时旧文件的备份目录（不进 git）')
    a = ap.parse_args()
    os.chdir(REPO)
    npc, src = a.npc, a.src
    anims = [x for x in a.anim.split(',') if x]
    dup = glob.glob(os.path.join(src, f'tripo__{npc}* (*)*'))
    if dup:
        die('下载目录里有 Chrome 改名的重名文件，先清理再重存：' + ', '.join(os.path.basename(d) for d in dup))
    base = os.path.join(src, f'tripo__{npc}.glb')
    if not wait_file(base, a.wait):
        die(f'等不到 {base}（reload 存盘方式要每个文件整页刷新一次再 flushSave）')
    prev = next((p for p in (os.path.join(src, f'tripo__{npc}.{e}') for e in ('png', 'webp', 'jpg')) if os.path.exists(p)), None)
    if not prev and wait_file(os.path.join(src, f'tripo__{npc}.png'), a.wait):
        prev = os.path.join(src, f'tripo__{npc}.png')
    if not prev:
        die(f'找不到预览 tripo__{npc}.png / .webp / .jpg')
    anim_src = os.path.join(src, f"tripo__{npc}__anim_{'_'.join(anims)}.glb") if anims else None
    if anim_src and not wait_file(anim_src, a.wait):
        die(f'等不到 {anim_src}')
    refs = [r for r in a.ref]
    for r in refs + [x.split('=', 1)[0] for x in a.ref2]:
        if not os.path.exists(r):
            die(f'参考图不存在：{r}')

    g = glb(base)
    bad = [n for n in g['joint_names'] if not n.startswith('mixamorig') and n != 'neutral_bone']
    if g['joints'] not in (65, 66) or bad:
        die(f"关节不对：{g['joints']} 个，非 mixamorig：{bad}")
    if g['animations']:
        die(f"基础模型不该带动画：{g['animations']}")
    ok, chk, jtext = joint_check(g['json'])
    if not ok:
        die(f'关节体检不过（绑骨可能坏了）：{chk} {jtext}')
    ga = None
    if anim_src:
        ga = glb(anim_src)
        if ga['joints'] != g['joints'] or len(ga['animations']) != len(anims):
            die(f"动作文件不对：关节 {ga['joints']}，动画 {ga['animations']}")

    d = os.path.join(a.out_root, npc)
    old = os.path.join(d, 'model_rig.glb')
    replaces = None
    if os.path.exists(old) and not a.replace:
        die(f'{d} 已有模型；重做请加 --replace（会先备份）')
    created = datetime.datetime.now().astimezone().isoformat(timespec='seconds')
    credits = {k: int(v) for k, v in (x.split('=') for x in a.credits.split(',') if x)}
    gen = dict(GEN, input=a.input or ('单图（A 字姿势全身参考）' if a.gen_kind == 'image_to_model' else 'multiview'))
    uses = a.ref_use + [None] * len(refs)
    references = [{'path': r, 'sha256': sha(r), 'use': uses[i] or ('单图生成输入（A 字姿势全身参考）' if a.gen_kind == 'image_to_model' else f'多视图第 {i + 1} 槽')}
                  for i, r in enumerate(refs)]
    references += [{'path': p, 'sha256': sha(p), 'use': u} for p, u in (x.split('=', 1) for x in a.ref2)]
    tm = {'project_id': a.project, 'url': f'https://studio.tripo3d.ai/workspace/generate/{a.project}',
          'generate_op': f'{a.gen_op}（{a.gen_kind}）', 'rig_op': a.rig_op}
    anim_ops = dict(x.split('=', 1) for x in a.anim_ops.split(',') if x)
    if anims:
        tm['animation_ops'] = {n: anim_ops.get(n, '?') for n in anims}
    plan = {'npc': npc, 'dir': d, 'glb': g['size_bytes'], 'joints': g['joints'], 'tris': g['triangles'], 'check': jtext,
            'preview': os.path.basename(prev), 'anim': ga and ga['animations'], 'replace': os.path.exists(old)}
    if a.dry_run:
        print(json.dumps(plan, ensure_ascii=False)); return

    os.makedirs(d, exist_ok=True)
    if os.path.exists(old):
        bk = os.path.join(a.backup_root, f"{npc}__{datetime.datetime.now().strftime('%Y%m%d%H%M')}")
        os.makedirs(bk, exist_ok=True)
        for f in os.listdir(d):
            shutil.copy2(os.path.join(d, f), bk)
        try:
            import yaml
            prev_pid = (yaml.safe_load(open(os.path.join(d, 'manifest.yaml')))[0].get('tripo_model') or {}).get('project_id')
        except Exception:
            prev_pid = None
        replaces = {'project_id': prev_pid, 'commit': git('log', '-1', '--format=%h', '--', old).stdout.strip(), 'backup': bk + '/'}
        tm['replaces'] = replaces
    shutil.copy2(base, os.path.join(d, 'model_rig.glb'))
    files = [('model_rig.glb', g, dict(EXPORT, animations=0), {**{'generate': 65, 'rig': 20}, **credits, 'export': 0},
              f'绑骨后基础模型（无动画）。{a.notes}；{jtext}。')]
    if anim_src:
        an = f"anim_{'_'.join(anims)}.glb"; shutil.copy2(anim_src, os.path.join(d, an))
        files.append((an, ga, dict(EXPORT, animations=[x.split(' ')[0] for x in ga['animations']], stay_in_place=True), {'animation_preset': 0, 'export': 0},
                      f"动作单文件：一个 GLB 内含 {' / '.join(x.split(' ')[0] for x in ga['animations'])}，同一套网格 + {ga['joints']} 关节骨架，原地（Animation stay in Place 开）。"))
    psize = preview_png(prev, os.path.join(d, 'preview.png'))

    import yaml
    entries = []
    for fn, gi, ex, cr, notes in files:
        opts = {'generate': gen, 'rig': RIG}
        if fn.startswith('anim_'):
            opts['animation'] = {'presets': [f'preset:biped:{n}' for n in anims]}
        opts['export'] = ex
        entries.append({'id': f"{npc}__{fn.rsplit('.', 1)[0]}", 'file': fn, 'category': 'model3d', 'style': 'default', 'subject': a.subject,
                        'tool': 'tripo-studio-web', 'model_version': 'v3.1-20260211（生成）/ v3.0-20260909（绑骨）', 'tripo_model': tm, 'options': opts,
                        'credits': cr, 'references': references, 'sha256': gi['sha256'], 'size_bytes': gi['size_bytes'], 'joints': gi['joints'],
                        'triangles': gi['triangles'], 'vertices': gi['vertices'], 'animations': gi['animations'], 'textures': gi['textures'],
                        'preview': 'preview.png', 'visibility': 'private', 'created': created, 'status': 'candidate', 'notes': notes})
    pv = os.path.join(d, 'preview.png')
    entries.append({'id': f'{npc}__preview', 'file': 'preview.png', 'category': 'model3d', 'style': 'default', 'subject': a.subject + ' · 3D 预览',
                    'tool': 'tripo-studio-web（Tripo 封面渲染）', 'tripo_model': tm, 'size': f'{psize[0]}x{psize[1]}', 'sha256': sha(pv),
                    'size_bytes': os.path.getsize(pv), 'created': created, 'status': 'candidate', 'notes': a.preview_notes})

    class NoAlias(yaml.SafeDumper):
        def ignore_aliases(self, data):
            return True
    with open(os.path.join(d, 'manifest.yaml'), 'w') as fh:
        yaml.dump(entries, fh, Dumper=NoAlias, allow_unicode=True, sort_keys=False, width=200)
    if not a.keep_src:
        for p in [base, prev, anim_src] + glob.glob(os.path.join(src, f'tripo__{npc}__rig.*')):
            if p and os.path.exists(p):
                os.remove(p)
    if a.commit:
        plan['commit'] = commit(d, a.msg or f'assets(model3d): {npc} Tripo 网页版建模与骨架（AR-41）', npc)
    print(json.dumps(plan, ensure_ascii=False))


if __name__ == '__main__':
    main()
