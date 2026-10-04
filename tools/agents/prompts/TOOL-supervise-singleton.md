# 本任务：工具 · 小修：supervise.py 单例锁——同一任务已有活着的驱动时，新起的直接退出并记一行（协调者 10-04 00:5x）

本任务改调度脚本。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- 10-03 23:49，TOOL-ingest-cropframe 冒出两个驱动：supervise.out 里 23:49:02 和 23:49:09 各有一行 `phase=start`。两个执行器在同一工作区续作，第二个 finish 时工作区已删，报错停下。来源没查明。
- 现有防重只在非 `--worker` 模式生效：`main()` 里「已有驱动在跑就改为接入等待」的判断写的是 `if not a.worker and …`。而各处起驱动（launch 脚本、detach_launch、ops_dispatch、after_merge_revalidate）都带 `--worker`，所以拦不住。
- 协调者裁定：给 supervise.py 加单例锁，从根上防止同一任务两个驱动并存。

## 要做的事

1. **锁**：真正跑 `worker()` 的那个进程，在写第一条 STATE 之前，对 `.agents/coord/<ID>/supervise.lock` 加 fcntl 独占非阻塞锁。
   - 拿不到锁：打印并往 supervise.log 写一行「已有驱动 pid=N，本次退出」，N 从锁文件里读；退出码 3；不改状态文件；
   - 拿到锁：把 pid 和开始时间写进锁文件；锁随进程退出由系统释放，不靠清理；
   - `--detach` 的父进程不持锁，只有它起的 `--worker` 子进程持锁；
   - `--status`、`--attach` 一类只读用法不抢锁。
2. 不改状态机、校验、审核、合入与挪基点逻辑；不改 step.py、ops_dispatch.py 和 `.agents/coord/_handoff/**`。
3. **单测** `tools/agents/test_supervise_singleton.py`：用临时目录和子进程验证：
   - 第一个实例持锁期间，第二个实例退出码为 3，并写了那行日志；
   - 第一个退出后可以再起；
   - 只读用法不受影响。
   - 不得真起 codex 或 traex。

## 约束

- 写集：`tools/agents/supervise.py`（只加单例锁）、`tools/agents/test_supervise_singleton.py`。写集外的改动在提交时会被丢弃。
- 只用标准库；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.agents.test_supervise_singleton tools.agents.test_supervise_rebase tools.agents.test_ops_dispatch tools.agents.test_step_pool_priority`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 20 行，写清：锁的位置与语义、退出码、`--detach` 时谁持锁、单测覆盖。
