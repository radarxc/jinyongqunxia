#!/usr/bin/env python3
"""素材线第三波追踪：持 .agents/merge.lock 把暂存目录里的文件拷进 _prod，并按路径提交（不与 step.py merge 的 cherry-pick 交错）。

用法：
    commit_staged.py <message_file> [--stage DIR] [--tasks TASKS_JSON] [--extra PATH ...] [--dry]

- --stage DIR：DIR 下的相对路径 = _prod 下的目标路径，逐个拷入（覆盖）。
- --tasks F：F 是 JSON 列表，每项是一条 tasks.json 任务；同 id 已存在则原位替换，不存在则追加到末尾。
  在锁内重新读盘再写回（indent=1、ensure_ascii=False、末尾换行，与原文件逐字节同格式）。
- --extra PATH：已经在 _prod 里改好的文件（如 tools/agents/batch_run.py），一并按路径提交。
提交只含上述路径（git commit -- <paths>），不碰别人的改动；不 push。
"""
import argparse
import fcntl
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path("/Users/bytedance/Projects/jinyongqunxia/.agents/wt/_prod")
TASKS = ROOT / "tools/agents/tasks.json"


def git(*args, check=True):
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=check)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("message_file")
    ap.add_argument("--stage")
    ap.add_argument("--tasks")
    ap.add_argument("--extra", nargs="*", default=[])
    ap.add_argument("--append", nargs=2, action="append", default=[], metavar=("REPO_PATH", "TEXT_FILE"),
                    help="在锁内把 TEXT_FILE 的内容追加到 _prod 的 REPO_PATH 末尾（如 HANDOFF.md）")
    ap.add_argument("--dry", action="store_true")
    a = ap.parse_args()
    msg = Path(a.message_file).read_text(encoding="utf-8")
    paths: list[str] = []
    copies: list[tuple[Path, Path]] = []
    if a.stage:
        st = Path(a.stage)
        for p in sorted(x for x in st.rglob("*") if x.is_file() and "__pycache__" not in x.parts and x.suffix != ".pyc"):
            rel = p.relative_to(st).as_posix()
            copies.append((p, ROOT / rel))
            paths.append(rel)
    paths += list(a.extra)
    lock = ROOT / ".agents" / "merge.lock"
    with open(lock, "w") as lf:
        fcntl.flock(lf, fcntl.LOCK_EX)
        if a.tasks:
            new = json.loads(Path(a.tasks).read_text(encoding="utf-8"))
            text = TASKS.read_text(encoding="utf-8")
            data = json.loads(text)
            idx = {t["id"]: i for i, t in enumerate(data["tasks"])}
            for t in new:
                if t["id"] in idx:
                    data["tasks"][idx[t["id"]]] = t
                    print("replace", t["id"])
                else:
                    data["tasks"].append(t)
                    print("append ", t["id"])
            out = json.dumps(data, ensure_ascii=False, indent=1) + "\n"
            if not a.dry:
                TASKS.write_text(out, encoding="utf-8")
            paths.append("tools/agents/tasks.json")
        for rel, txt in a.append:
            add = Path(txt).read_text(encoding="utf-8")
            print("append ", rel, len(add.splitlines()), "lines")
            if not a.dry:
                cur = (ROOT / rel).read_text(encoding="utf-8")
                (ROOT / rel).write_text(cur + ("" if cur.endswith("\n") else "\n") + add, encoding="utf-8")
            paths.append(rel)
        for src, dst in copies:
            print("copy   ", dst.relative_to(ROOT))
            if not a.dry:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
        if a.dry:
            print("dry run; paths:", paths)
            return 0
        git("add", "--", *paths)
        p = git("commit", "-m", msg, "--", *paths, check=False)
        print((p.stdout + p.stderr).strip()[-600:])
        if p.returncode != 0:
            return p.returncode
        print("HEAD", git("rev-parse", "--short", "HEAD").stdout.strip())
    return 0


if __name__ == "__main__":
    sys.exit(main())
