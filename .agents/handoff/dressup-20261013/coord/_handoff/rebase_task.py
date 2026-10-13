#!/usr/bin/env python3
"""把任务工作区挪到新基点（协调者工具；supervise.rebase_before_rework 在校验失败后调用）。

用法：rebase_task.py <任务ID> --new-base <提交> [--dry-run]（cwd 任意，ROOT 按本文件位置推出）

只处理无冲突情形：任务产物须是"基点上的未提交快照"或"基点之上恰一个提交"。
三方预演（git merge-tree）有冲突就不动工作区、退出 1；成功时输出含"带冲突标记 0 个"。
不用 git stash（stash 栈全仓共享）：快照用临时索引 + commit-tree，备份引用写 refs/backup/rebase/<任务>/<时间>。
未提交模式下挪完后 HEAD = 新基点、索引 = 新基点、工作区 = 三方合并结果（任务改动仍是未提交改动）。
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "tools" / "agents"))
import step as S  # noqa: E402

IDENT = {"GIT_AUTHOR_NAME": "rebase-task", "GIT_AUTHOR_EMAIL": "ops@local",
         "GIT_COMMITTER_NAME": "rebase-task", "GIT_COMMITTER_EMAIL": "ops@local"}


def git(wt: Path, *args: str, env: dict | None = None, input: str | None = None,
        check: bool = True) -> subprocess.CompletedProcess:
    p = subprocess.run(["git", "--no-optional-locks", *args], cwd=wt, env=env, input=input,
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if check and p.returncode:
        raise RuntimeError(f"git {' '.join(args[:3])} 失败：{p.stderr.strip()[:400]}")
    return p


def snapshot_tree(wt: Path) -> str:
    """用复制的索引（保留 skip-worktree 位）给工作区拍一棵树，不碰真实索引。"""
    with tempfile.TemporaryDirectory(prefix="tianshu-rebase-") as td:
        index = git(wt, "rev-parse", "--git-path", "index").stdout.strip()
        src = Path(index) if Path(index).is_absolute() else wt / index
        dest = Path(td) / "index"
        shutil.copy2(src, dest)
        env = {**os.environ, "GIT_INDEX_FILE": str(dest)}
        git(wt, "add", "-A", env=env)
        return git(wt, "write-tree", env=env).stdout.strip()


def write_from_tree(wt: Path, tree: str, path: str) -> None:
    entry = git(wt, "ls-tree", tree, "--", path).stdout.strip()
    mode = entry.split(None, 1)[0] if entry else "100644"
    data = subprocess.run(["git", "cat-file", "blob", f"{tree}:{path}"], cwd=wt,
                          capture_output=True, check=True).stdout
    target = wt / path
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_symlink() or target.exists():
        if target.is_dir() and not target.is_symlink():
            raise RuntimeError(f"{path} 在工作区是目录，无法写回")
        target.unlink()
    if mode == "120000":
        os.symlink(data.decode("utf-8"), target)
        return
    target.write_bytes(data)
    os.chmod(target, 0o755 if mode == "100755" else 0o644)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("tid")
    ap.add_argument("--new-base", required=True)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--resolve", action="append", default=[], metavar="PATH=FILE",
                    help="协调者人工合并：冲突文件 PATH 采用 FILE 的内容（可多次）；只在冲突全部被覆盖时生效")
    a = ap.parse_args()
    resolve = {}
    for item in a.resolve:
        path, _, source = item.partition("=")
        if not path or not source or not Path(source).is_file():
            print(f"--resolve 参数无效：{item}")
            return 2
        resolve[path] = Path(source).read_bytes()
    wt = ROOT / ".agents" / "wt" / a.tid
    state = S.LockedState(ROOT / ".agents" / "state.json")
    base = (state.get(a.tid) or {}).get("base")
    if not wt.is_dir() or not base:
        print(f"{a.tid}：缺工作区或基点，未改动")
        return 2
    new = git(wt, "rev-parse", "--verify", f"{a.new_base}^{{commit}}").stdout.strip()
    if new == base:
        print(f"{a.tid}：基点未变；带冲突标记 0 个：无")
        return 0
    if git(wt, "merge-base", "--is-ancestor", base, new, check=False).returncode:
        print(f"{a.tid}：新基点 {new[:12]} 不是旧基点 {base[:12]} 的后代，未改动")
        return 2
    head = git(wt, "rev-parse", "HEAD").stdout.strip()
    dirty = bool(git(wt, "status", "--porcelain").stdout.strip())
    count = int(git(wt, "rev-list", "--count", f"{base}..{head}").stdout.strip())
    if count + int(dirty) != 1:
        print(f"{a.tid}：产物须是一个未提交快照或基点上一个提交（现有提交 {count}、未提交 {dirty}），未改动")
        return 2
    env = {**os.environ, **IDENT}
    tip = (git(wt, "commit-tree", snapshot_tree(wt), "-p", base, env=env,
               input=f"rebase snapshot {a.tid}\n").stdout.strip() if dirty else head)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    git(wt, "update-ref", f"refs/backup/rebase/{a.tid}/{stamp}", tip)
    preview = git(wt, "merge-tree", "--write-tree", "--name-only", f"--merge-base={base}", new, tip,
                  check=False)
    merged = preview.stdout.splitlines()[0].strip() if preview.stdout.strip() else ""
    if preview.returncode:
        files = preview.stdout.split("\n\n", 1)[0].splitlines()[1:]
        if not merged or not files or any(f not in resolve for f in files):
            print(f"{a.tid}：带冲突标记 {len(files) or 1} 个：{'、'.join(files) or preview.stderr.strip()[:300]}；"
                  f"未改动工作区（快照备份 refs/backup/rebase/{a.tid}/{stamp}）")
            return 1
        # 冲突全部由协调者给定内容覆盖：在临时索引里把这些路径换成给定内容，得到最终树。
        with tempfile.TemporaryDirectory(prefix="tianshu-rebase-resolve-") as td:
            env_idx = {**os.environ, "GIT_INDEX_FILE": str(Path(td) / "index")}
            git(wt, "read-tree", merged, env=env_idx)
            for path in files:
                blob = subprocess.run(["git", "hash-object", "-w", "--stdin"], cwd=wt, input=resolve[path],
                                      capture_output=True, check=True).stdout.decode().strip()
                entry = git(wt, "ls-tree", tip, "--", path).stdout.strip()
                mode = entry.split(None, 1)[0] if entry else "100644"
                git(wt, "update-index", "--cacheinfo", f"{mode},{blob},{path}", env=env_idx)
            merged = git(wt, "write-tree", env=env_idx).stdout.strip()
        print(f"{a.tid}：冲突 {len(files)} 个由协调者给定内容合并：{'、'.join(files)}")
    if a.dry_run:
        print(f"{a.tid}：预演无冲突，带冲突标记 0 个：无（dry-run，未改动）")
        return 0
    if dirty:
        raw = git(wt, "diff", "--name-status", "--no-renames", "-z", new, merged).stdout
        parts = [p for p in raw.split("\0") if p]
        changes = list(zip(parts[0::2], parts[1::2]))
        git(wt, "checkout", "--force", "--detach", new)
        for status, path in changes:
            if status.startswith("D"):
                target = wt / path
                if target.is_symlink() or target.is_file():
                    target.unlink()
            else:
                write_from_tree(wt, merged, path)
        after = snapshot_tree(wt)
        if after != merged:
            print(f"{a.tid}：写回后工作区树 {after[:12]} ≠ 预演合并树 {merged[:12]}；"
                  f"快照备份 refs/backup/rebase/{a.tid}/{stamp}，请人工核对")
            return 3
    else:
        message = git(wt, "log", "-1", "--format=%B", head).stdout
        author = git(wt, "log", "-1", "--format=%an%x00%ae%x00%aI", head).stdout.strip().split("\0")
        cenv = {**env, "GIT_AUTHOR_NAME": author[0], "GIT_AUTHOR_EMAIL": author[1], "GIT_AUTHOR_DATE": author[2]}
        commit = git(wt, "commit-tree", merged, "-p", new, env=cenv, input=message).stdout.strip()
        git(wt, "checkout", "--force", "--detach", commit)
    state.update(a.tid, base=new)
    print(f"{a.tid}：基点 {base[:12]} → {new[:12]}，{'未提交改动' if dirty else '任务提交'}已按三方合并写回；"
          f"带冲突标记 0 个：无（快照备份 refs/backup/rebase/{a.tid}/{stamp}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
