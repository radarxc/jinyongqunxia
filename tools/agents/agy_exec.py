#!/usr/bin/env python3
"""agy 执行器适配层：让 tools/agents/step.py / supervise.py 用 agy（Antigravity CLI）代替 traex 执行任务。

step.py 以 traex 的参数形式调用执行器（见 step.build_argv）：
    <bin> exec -m <model> -s workspace-write --skip-git-repo-check -C <工作区> -o <最后消息文件> [-c …] … -
提示词从标准输入传入。本适配层只取 -C（工作目录）与 -o（最后消息文件），其余参数忽略，
改为调用：
    agy --model <AGY_MODEL> --dangerously-skip-permissions --print-timeout 0 -p=<提示词>
作者 AR-108（2026-10-08）：agy 沙箱外运行、每个任务独立 git 工作区；审核仍由 GPT（traex）把门。

环境变量：
    AGY_BIN    agy 可执行文件（默认 ~/.local/bin/agy）
    AGY_MODEL  模型（默认 gemini-3.1-pro-high；带档位后缀的模型名不能再加 --effort）
    AGY_PYTHON 优先放进 PATH 的 Python 目录（默认 /Library/Frameworks/Python.framework/Versions/3.11/bin，含 numpy / scipy）
用法：supervise.py <任务ID> --bin tools/agents/agy_exec.py …（或在 .agents/coord/executor_override.json 里按任务 ID 匹配）。
"""
from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

DEFAULT_PY = "/Library/Frameworks/Python.framework/Versions/3.11/bin"
PREAMBLE = (
    "【执行器说明】你是在本仓库任务工作区里无人值守运行的执行代理（agy）。"
    "必须把任务做完、跑完检查再结束，不要只输出计划；不要停下来提问；"
    "只改任务说明列出的文件；不执行改变仓库状态的 git 命令（commit / push / reset / checkout 分支等）；"
    "需要 Python 时用 `python3`（已含 numpy / scipy）；对外请求不得带作者邮箱等个人标识。"
    "写集外的文件（包括任何测试）一律不改，任何测试断言、阈值、超时都不得放宽或跳过；"
    "检查里出现与本任务无关的失败，重跑一次，仍失败就在报告里写明用例名与输出摘要后结束，由协调者处理。"
    "调试脚本、日志等临时文件放系统临时目录，结束前工作区里只能留下写集内的文件。"
    "测试必须真实调用被测代码并用断言判定结果；只打印不断言、空测试、写死期望去迎合输出，一律视为伪造，直接判不合格。"
    "报告里的数字必须来自本次实跑的输出，不得估计或编造。\n\n"
)


def parse(argv: list[str]) -> tuple[Path, Path | None]:
    cwd, last = Path.cwd(), None
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "-C" and i + 1 < len(argv):
            cwd = Path(argv[i + 1]); i += 2; continue
        if a == "-o" and i + 1 < len(argv):
            last = Path(argv[i + 1]); i += 2; continue
        i += 1
    return cwd, last


def main(argv: list[str]) -> int:
    cwd, last = parse(argv[1:])
    prompt = sys.stdin.read()
    if not prompt.strip():
        print("agy_exec: 标准输入里没有提示词", file=sys.stderr)
        return 2
    agy = os.environ.get("AGY_BIN") or str(Path.home() / ".local/bin/agy")
    model = os.environ.get("AGY_MODEL", "gemini-3.1-pro-high")
    env = dict(os.environ)
    py = os.environ.get("AGY_PYTHON", DEFAULT_PY)
    if Path(py).is_dir():
        env["PATH"] = py + os.pathsep + env.get("PATH", "")
    cmd = [agy, "--model", model, "--dangerously-skip-permissions", "--print-timeout", "0", f"-p={PREAMBLE}{prompt}"]
    proc = subprocess.run(cmd, cwd=str(cwd), env=env, stdin=subprocess.DEVNULL, capture_output=True, text=True,
                          encoding="utf-8", errors="replace")
    out = proc.stdout or ""
    sys.stdout.write(out)
    if proc.stderr:
        sys.stderr.write(proc.stderr)
    if last is not None:
        try:
            last.parent.mkdir(parents=True, exist_ok=True)
            last.write_text(out.strip()[-20000:] + "\n", encoding="utf-8")
        except OSError as exc:
            print(f"agy_exec: 写最后消息失败：{exc}", file=sys.stderr)
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main(sys.argv))
