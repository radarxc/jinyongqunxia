# 本任务：工具 · 校验并发闸：step.py 的 finish 校验与守护进程的 prod_check 统一走文件锁信号量（同一时刻最多 2 个），校验里的 vitest 固定 maxWorkers；补单测，写进 OPS_RUNBOOK

本任务改调度工具与校验运行方式。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能；不改 node_modules。**直接动手改代码并跑测试，不要只写计划就结束。**

## 为什么做

- 负载一高，功能用例就超时，一轮轮白耗校验。10-04 05:49 两件同时栽在超时上：
  - battle-modules-lazy 挂在 `encounter-loading.test.ts`（默认 5 秒）和 `item-content.test.ts` 的 ch10 真产物用例（15 秒）；
  - size-render-measure 也挂在 ch10 那条。
  - 当时 1 分钟负载 35–40。
- 根因多半是：几个工作区的 `pnpm check` 同时开跑，每个 vitest 都按核数起 worker，负载叠了起来。
- 协调者（10-04 05:5x）：校验统一限流，vitest 设固定的资源上限。这不算放宽测试，也不加按负载判断的分支。

## 要做的事

1. **信号量**：新建 `tools/agents/check_semaphore.py`，用文件锁做计数信号量，槽位文件放 `.agents/slots/check/`，默认 2 个槽，可由环境变量覆盖。提供两种用法：
   - 库函数：`with check_slot(root): ...`；
   - 命令行包装：`python3 tools/agents/check_semaphore.py -- <命令 ...>`，拿到槽再执行，退出时释放。拿不到就排队等，每分钟打一行「在等校验槽」。持槽进程死了，槽自动释放（靠文件锁）。
2. **接入**：
   - `step.py finish` 跑校验命令（`run.py` 的 validate 一段，含 `pnpm check`）时，整段持一个槽；
   - `ops_dispatch.py` 起 prod_check 时，用命令行包装去起 `prod_check.sh`。`.agents/coord/_handoff/**` 不在写集，不改那个脚本本身；
   - supervise 的「返修前挪基点重校验」走同一个 finish，自然受限。
3. **vitest 资源上限**：在上面这些校验里，给 vitest 设固定的 `maxWorkers`，取核数的一半，向下取整、至少 1。用环境变量（如 `TIANSHU_VITEST_MAX_WORKERS`）传给根 vitest 配置；不设这个变量时，本地开发行为不变。不改任何用例、超时与断言。
4. **单测**：`tools/agents/test_check_semaphore.py`：
   - 两个槽时第三个进程排队；持槽进程被杀后槽释放；
   - 命令行包装的退出码透传；
   - step finish 的接入用打桩验证持槽；
   - 不得真起 codex 或 traex。
5. **文档**：`tools/agents/OPS_RUNBOOK.md` 末尾「自动化对照」加一行，写清信号量和 maxWorkers 的口径。

## 约束

- 写集：`tools/agents/check_semaphore.py`、`tools/agents/test_check_semaphore.py`、`tools/agents/step.py`、`tools/agents/run.py`、`tools/agents/ops_dispatch.py`、`tools/agents/OPS_RUNBOOK.md`、根 `vitest.config.ts` / `vitest.workspace.ts`（只为读 maxWorkers 环境变量）。写集外的改动在提交时会被丢弃。
- 不改门禁、阈值、用例与断言；只用标准库；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.agents.test_check_semaphore tools.agents.test_step_pool_priority tools.agents.test_step_traex_args tools.agents.test_run_sparse_baseline tools.agents.test_ops_dispatch tools.agents.test_supervise_rebase tools.agents.test_supervise_singleton`
- `python3 tools/agents/ops_dispatch.py --once --dry-run`
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 20 行，写清：信号量的位置与语义、接入点、maxWorkers 的取值与传递方式、单测覆盖、对本地开发的影响。
