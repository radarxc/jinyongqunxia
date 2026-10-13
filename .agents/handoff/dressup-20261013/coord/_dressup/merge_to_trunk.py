#!/usr/bin/env python3
"""把换装集成分支并入主检出的主干分支，同时原样保留主检出里的未提交改动。

做法：
1. 备份：`git stash create` 的快照挂到 refs/backup/…（不进 stash 栈），重叠文件另拷一份到备份目录；
2. `git merge-tree` 预演，冲突只允许出现在已核对为"集成分支是超集"的文件里（取集成分支版本）；
3. 与合并结果重叠的已修改文件：先做三方合并（工作区 / HEAD / 合并结果）算出最终内容，再把它们临时还原成 HEAD；
   与合并结果重叠的未跟踪文件：移到备份目录；
4. `git merge --no-ff`，按上面的规则解决冲突后提交；
5. 把三方合并结果写回工作区（未提交），核对每个重叠文件相对新 HEAD 的改动 = 原来的未提交改动。
用法：merge_to_trunk.py [--dry-run]
"""
import difflib, json, os, shutil, subprocess, sys, time
from pathlib import Path

REPO = Path('/Users/bytedance/Projects/jinyongqunxia')
BRANCH = 'claude/dressup-3d-stage-a'
TRUNK = 'claude/vigilant-wright-2unuk1'
TAKE_THEIRS = {'tools/agents/tasks.json', 'assets/default/character/female/ch00/threeview/manifest.yaml'}
SCRATCH = Path('/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_dressup/.agents/coord/_dressup/trunk_merge')
DRY = '--dry-run' in sys.argv


def git(*args, check=True, text=True, input=None):
    r = subprocess.run(['git', *args], cwd=REPO, capture_output=True, text=text, input=input)
    if check and r.returncode != 0:
        raise SystemExit(f'git {" ".join(args)} 失败 rc={r.returncode}\n{r.stdout}\n{r.stderr}')
    return r


def show(rev, path):
    r = git('show', f'{rev}:{path}', check=False, text=False)
    return r.stdout if r.returncode == 0 else None


def lines(b):
    return b.decode('utf-8', 'surrogateescape').splitlines(keepends=True)


def changes(a, b):
    """a→b 的增删行多重集（用于核对未提交改动是否原样保留）。"""
    add, rem = [], []
    for op in difflib.ndiff(lines(a), lines(b)):
        if op.startswith('+ '): add.append(op[2:])
        elif op.startswith('- '): rem.append(op[2:])
    return sorted(add), sorted(rem)


def merge3(w, h, r, tmp):
    for name, data in (('W', w), ('H', h), ('R', r)):
        (tmp / name).write_bytes(data)
    res = subprocess.run(['git', 'merge-file', '-p', '-L', 'working', '-L', 'HEAD', '-L', 'merged',
                          str(tmp / 'W'), str(tmp / 'H'), str(tmp / 'R')], capture_output=True)
    if res.returncode == 0:
        return res.stdout, 'clean'
    add, rem = changes(h, w)
    norm = lambda x: x.rstrip().rstrip(',')   # JSON 末项逗号差异不算内容差异
    rset = {norm(x) for x in lines(r)}
    if all(norm(x) in rset for x in add) and not any(x in set(lines(r)) for x in rem):
        return r, 'subsumed'          # 工作区的改动已全部包含在合并结果里
    return None, 'conflict'


def main():
    head_branch = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip()
    if head_branch != TRUNK:
        raise SystemExit(f'主检出当前分支是 {head_branch}，不是 {TRUNK}')
    if git('diff', '--cached', '--quiet', check=False).returncode != 0:
        raise SystemExit('主检出有已暂存改动，停止')
    ts = time.strftime('%Y%m%d-%H%M%S')
    backup = SCRATCH / ts; backup.mkdir(parents=True, exist_ok=True)
    head = git('rev-parse', 'HEAD').stdout.strip()
    mt = git('merge-tree', '--write-tree', '--name-only', 'HEAD', BRANCH, check=False)
    out = mt.stdout.split('\n'); tree = out[0].strip(); conflicted = []
    for line in out[1:]:
        if not line.strip(): break
        conflicted.append(line.strip())
    for f in conflicted:   # 冲突文件只允许"集成分支版本是主干版本的超集"（主干上的改动是 cherry-pick 过去的旧版本）
        h, b = show('HEAD', f), show(BRANCH, f)
        add, rem = changes(h, b)
        if rem:
            raise SystemExit(f'{f}: 集成分支相对主干删除了行，不能直接取集成分支版本')
        TAKE_THEIRS.add(f)
    changed = set(git('diff', '--name-only', 'HEAD', tree).stdout.split()) | set(conflicted)
    modified = set(git('diff', '--name-only').stdout.split())
    untracked = set(git('ls-files', '--others', '--exclude-standard').stdout.splitlines())
    ov_tracked = sorted(changed & modified); ov_untracked = sorted(changed & untracked)
    tmp = backup / '_m3'; tmp.mkdir(exist_ok=True)
    plan = {}
    for f in ov_tracked:
        w = (REPO / f).read_bytes(); h = show('HEAD', f)
        r = show(BRANCH, f) if f in conflicted else show(tree, f)
        m, how = merge3(w, h, r, tmp)
        plan[f] = {'how': how}
        if m is None:
            raise SystemExit(f'{f}: 工作区改动与合并结果冲突，需人工处理')
        dst = backup / 'tracked' / f; dst.parent.mkdir(parents=True, exist_ok=True); dst.write_bytes(w)
        (backup / 'merged').mkdir(exist_ok=True)
        (backup / 'merged' / f.replace('/', '__')).write_bytes(m)
    summary = {'head': head, 'tree': tree, 'conflicted_take_theirs': conflicted, 'changed_files': len(changed),
               'overlap_tracked': plan, 'overlap_untracked': ov_untracked, 'backup': str(backup)}
    if DRY:
        print(json.dumps(summary, ensure_ascii=False, indent=1)); return
    stash = git('stash', 'create').stdout.strip()
    if stash:
        git('update-ref', f'refs/backup/pre-dressup-merge-{ts}', stash)
        summary['stash_snapshot'] = stash
    for f in ov_untracked:
        dst = backup / 'untracked' / f; dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(REPO / f), dst)
    if ov_tracked:
        git('checkout', 'HEAD', '--', *ov_tracked)
    msg = (f'merge: 3D 纸娃娃换装集成分支 {BRANCH} 并入主干（作者 2026-10-08「你都放到主干吧」）\n\n'
           '主检出原有未提交改动未纳入本提交，合并后原样放回工作区。\n\n'
           'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')
    r = git('merge', '--no-ff', '--no-commit', BRANCH, check=False)
    unresolved = git('diff', '--name-only', '--diff-filter=U').stdout.split()
    if r.returncode != 0 and not unresolved:
        git('merge', '--abort', check=False)
        restore(backup, ov_tracked, ov_untracked)
        raise SystemExit(f'git merge 失败，已还原：\n{r.stdout}\n{r.stderr}')
    for f in unresolved:
        if f not in TAKE_THEIRS:
            git('merge', '--abort', check=False); restore(backup, ov_tracked, ov_untracked)
            raise SystemExit(f'合并出现未核对的冲突 {f}，已还原')
        git('checkout', '--theirs', '--', f); git('add', '--', f)
    git('commit', '-q', '-m', msg)
    summary['merge_commit'] = git('rev-parse', 'HEAD').stdout.strip()
    # 写回未提交改动并核对
    report = {}
    for f in ov_tracked:
        m = (backup / 'merged' / f.replace('/', '__')).read_bytes(); (REPO / f).write_bytes(m)
        w = (backup / 'tracked' / f).read_bytes(); h_old = show(head, f); h_new = show('HEAD', f)
        want, got = changes(h_old, w), changes(h_new, m)
        report[f] = {'how': plan[f]['how'], 'preserved': want == got,
                     'note': '' if want == got else '改动已被合并结果包含或位置变化，需人工看 diff'}
    for f in ov_untracked:
        old = (backup / 'untracked' / f).read_bytes(); new = (REPO / f).read_bytes() if (REPO / f).exists() else None
        report[f] = {'untracked_backup_equals_new': old == new}
    summary['restore_check'] = report
    print(json.dumps(summary, ensure_ascii=False, indent=1))


def restore(backup, ov_tracked, ov_untracked):
    for f in ov_tracked:
        (REPO / f).write_bytes((backup / 'tracked' / f).read_bytes())
    for f in ov_untracked:
        src = backup / 'untracked' / f
        if src.exists():
            (REPO / f).parent.mkdir(parents=True, exist_ok=True); shutil.move(str(src), REPO / f)


if __name__ == '__main__':
    main()
