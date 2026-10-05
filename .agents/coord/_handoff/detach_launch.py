#!/usr/bin/env python3
"""脱离启动：子进程开新会话（新 pgid），本进程立即退出，子进程过继给 launchd（ppid=1），
不受工具后台 2 小时时限、也不受调用方进程树 / 进程组的终止影响。
用法：detach_launch.py <日志文件> <工作目录> -- <命令> [参数 ...]
"""
import subprocess
import sys

log, cwd = sys.argv[1], sys.argv[2]
argv = sys.argv[sys.argv.index("--") + 1:]
import os
os.makedirs(os.path.dirname(os.path.join(cwd, log)) or ".", exist_ok=True)
out = open(os.path.join(cwd, log), "a", encoding="utf-8")
p = subprocess.Popen(argv, cwd=cwd, stdin=subprocess.DEVNULL, stdout=out, stderr=subprocess.STDOUT,
                     start_new_session=True)
print(p.pid)
