# .agents/coord 基础设施存档（2026-10-04）

本地协调目录 `.agents/coord`（被 .gitignore 忽略，约 18 GB，大部分是日志、会话记录、出图原图）已清理。
这里只存 AGENTS.md / TODO.md 启动命令用到的脚本、审查清单、执行器路由、任务说明。

恢复到本地（在仓库根目录）：

    git fetch origin archive/local-20261004
    git checkout origin/archive/local-20261004 -- .agents/coord
    git reset -q .agents/coord   # 只要文件，不进暂存区（.agents 本来就被忽略）

注意：`executor_override.json` 里的执行器路径是本机路径；`_handoff/gem/codex_w*/runner.py` 是出图 worker。
