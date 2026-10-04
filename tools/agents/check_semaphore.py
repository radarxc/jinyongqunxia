#!/usr/bin/env python3
"""跨工作区校验信号量；槽由 ``flock`` 持有，进程退出即自动释放。

库用法：``with check_slot(root): ...``。命令行用法：
``python3 tools/agents/check_semaphore.py -- <命令 ...>``。
"""
from __future__ import annotations

import argparse
import contextlib
import fcntl
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Iterator, Mapping, Optional, TextIO

SLOTS_ENV = "TIANSHU_CHECK_SLOTS"
VITEST_WORKERS_ENV = "TIANSHU_VITEST_MAX_WORKERS"
DEFAULT_SLOTS = 2
SLOT_DIR = Path(".agents/slots/check")


def slot_count(environ: Optional[Mapping[str, str]] = None) -> int:
    """返回校验槽数；显式配置必须是正整数。"""
    value = (os.environ if environ is None else environ).get(SLOTS_ENV)
    try:
        count = DEFAULT_SLOTS if value is None else int(value)
    except ValueError as exc:
        raise ValueError(f"{SLOTS_ENV} 必须是正整数，实际为 {value!r}") from exc
    if count < 1:
        raise ValueError(f"{SLOTS_ENV} 必须是正整数，实际为 {count}")
    return count


def vitest_max_workers(cpu_count: Optional[int] = None) -> int:
    """受管校验固定使用一半逻辑核，向下取整且至少一个 worker。"""
    cpus = os.cpu_count() if cpu_count is None else cpu_count
    return max(1, (cpus or 1) // 2)


def check_environment(environ: Optional[Mapping[str, str]] = None,
                      cpu_count: Optional[int] = None) -> dict[str, str]:
    """复制环境并加入仅供受管校验使用的 Vitest worker 上限。"""
    env = dict(os.environ if environ is None else environ)
    env[VITEST_WORKERS_ENV] = str(vitest_max_workers(cpu_count))
    return env


@contextlib.contextmanager
def check_slot(root: Path, *, slots: Optional[int] = None, poll_seconds: float = 0.25,
               notice_seconds: float = 60.0) -> Iterator[TextIO]:
    """等待并持有一个校验槽；等待期间每 ``notice_seconds`` 秒报告一次。"""
    count = slot_count() if slots is None else slots
    if count < 1:
        raise ValueError("校验槽数必须至少为 1")
    directory = Path(root) / SLOT_DIR
    directory.mkdir(parents=True, exist_ok=True)
    started = last_notice = time.monotonic()
    handle = None
    while handle is None:
        for index in range(count):
            candidate_path = directory / f"slot-{index}.lock"
            candidate = candidate_path.open("a+", encoding="utf-8")
            try:
                fcntl.flock(candidate.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError:
                candidate.close()
            except BaseException:
                candidate.close()
                raise
            else:
                handle = candidate
                break
        if handle is not None:
            break
        now = time.monotonic()
        if now - last_notice >= notice_seconds:
            minutes = max(1, int((now - started) // 60))
            print(f"… 在等校验槽（最多 {count} 个，已等 {minutes} 分钟）", flush=True)
            last_notice = now
        time.sleep(poll_seconds)
    try:
        yield handle
    finally:
        fcntl.flock(handle.fileno(), fcntl.LOCK_UN)
        handle.close()


def find_root(start: Path) -> Path:
    """从当前目录向上找最近的 git 工作区；找不到时原样返回。"""
    current = start.resolve()
    for candidate in (current, *current.parents):
        if (candidate / ".git").exists():
            return candidate
    return current


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="拿到共享校验槽后运行命令")
    parser.add_argument("--root", type=Path, help="共享 .agents/slots/check 的仓库根")
    parser.add_argument("command", nargs=argparse.REMAINDER, help="-- 后的命令与参数")
    args = parser.parse_args(argv)
    command = list(args.command)
    if command[:1] == ["--"]:
        command.pop(0)
    if not command:
        parser.error("缺少要运行的命令（用 -- 分隔）")
    root = args.root.resolve() if args.root else find_root(Path.cwd())
    try:
        with check_slot(root):
            return subprocess.run(command, env=check_environment()).returncode
    except FileNotFoundError as exc:
        print(f"无法运行校验命令：{exc}", file=sys.stderr)
        return 127
    except ValueError as exc:
        parser.error(str(exc))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
