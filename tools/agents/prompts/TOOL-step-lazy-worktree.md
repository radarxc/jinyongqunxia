# 本任务：工具 · 小修：step.py start 先排到池位、再建工作区（排队中的任务不占磁盘）

本任务改调度脚本。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- `tools/agents/step.py` 的 `cmd_start` 先 `git worktree add` 建工作区（第 501 行一带），再进池位等待循环（第 556 行起）。
- 代码池常年满，排队中的任务各占约 1–1.5 GB（检出加 node_modules）。10-04 02:00 有 6 件在排队，磁盘一度只剩约 6 GiB；协调者规定 5 GiB 以下不开新工作区。

## 要做的事

1. 调整 `cmd_start` 的顺序：
   - 登记「在等」、探测模型、按优先级拿池位，这几步照旧，而且都不依赖工作区；
   - 拿到池位之后，才新建工作区，或续用保留的工作区；
   - 新建失败要释放池位，不留下占位。
2. 已有工作区的续作（「在保留的工作区中续作」）不变；`--base`、稀疏检出、提示词渲染与写入的顺序，按新流程理顺，行为不变。
3. 单测：用临时 git 仓库，或打桩 `R.git`：
   - 排队期间不调用 `worktree add`；
   - 拿到池位后才建；
   - 建失败时池位被释放。
   - 不得真起 codex 或 traex。

## 约束

- 写集：`tools/agents/step.py`（只改 `cmd_start` 的先后顺序及必要的辅助函数）、`tools/agents/test_step_lazy_worktree.py`。写集外的改动在提交时会被丢弃。
- 不改池位优先级、`slot_pool_of`、执行器分流与探测逻辑；只用标准库；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.agents.test_step_lazy_worktree tools.agents.test_step_pool_priority tools.agents.test_step_traex_args tools.agents.test_run_sparse_baseline`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清：新的先后顺序，失败时怎样释放池位，单测覆盖。
