# 本任务：工具 · 运维自动化：supervise 返修前先挪基点重校验；ops_dispatch 守护进程按 OPS_RUNBOOK 自动处置可脚本化的事件，判断不了的写进收件箱；决策逻辑有单测

本任务写 `tools/agents` 下的调度工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

先读：
- `tools/agents/OPS_RUNBOOK.md`（**必读**）：开发监督 10-03 的处置规则。本任务把其中能脚本化的部分做成程序。
- 代码：
  - `tools/agents/supervise.py`：状态机，RUNNING / READY / MERGED / HOLD-*，以及 `--from start/validate/review`；
  - `tools/agents/step.py`：start / wait / finish / merge / pool，池位优先级与等待登记；
  - `tools/agents/run.py`：校验与防截断；
  - `.agents/coord/_handoff/` 下的脚本：`rebase_task.py`、`after_merge_revalidate.py`、`merge_when_clean.py`、`detach_launch.py`、`prod_check.sh`、`codex_session.py`。它们不在写集，只调用、不修改。
- `.agents/coord/executor_override.json`：AR-65，执行器与审核统一走 Codex gpt-6.1-sol。

## 为什么做

作者 AR-65：除 Gemini 画图与 Tripo 驱动外，其他任务都交 GPT 6.1 Sol，Claude 只给目标、判最终结果。开发监督这几天手工做的大量处置，以后要由程序和 GPT 处置会话接手：
- 合入冲突；
- 基点早于已合入的修复时，挪基点重新校验；
- 计时门、体积门挂等待器；
- 停滞记录；
- 合入后跑 prod_check。

## 要做的事

### (a) supervise.py：返修前先挪基点重校验一次

- 校验（`finish --no-commit`）失败、准备起返修之前，先判断任务基点是否落后于集成分支 HEAD。
- 落后，而且挪基点不会冲突（用 `git merge-tree --write-tree --merge-base` 预演），就：
  1. 调 `rebase_task.py <ID>` 挪基点；
  2. 把这次做法写进 supervise.log；
  3. 再跑一次校验；
  4. 还失败才起返修。
- 每次校验失败最多挪一次，不得循环。执行器在跑时不挪。
- 预演有冲突时不挪，照原逻辑起返修，并在 supervise.log 写明冲突文件。
- 这一步只决定「先挪基点再校验」，校验命令、门禁、阈值一概不改。

### (b) `tools/agents/ops_dispatch.py` 守护进程

1. **盯**：
   - 各任务的 `.agents/coord/<ID>/supervise.status.json`；
   - `supervise.log` / `supervise.out` 的新行，用 offset 文件记位置；
   - 集成分支 HEAD 的新合入（`Agent-Task:` 尾注）。
2. **处置**：严格按 OPS_RUNBOOK §2。决策写成纯函数，比如 `classify(event) -> Action`；执行层与决策层分开。至少覆盖：
   - READY「auto-merge 未成功」：
     - 窗口期 → 调 `merge_when_clean.py`；
     - cherry-pick 冲突 → 用 `git merge-tree` 预演，把冲突文件与冲突块交给 (c) 的分类。
       - 机械冲突（import / 导出并集、登记表追加），用 `codex_session.py` 起一个短的 gpt-6.1-sol 处置会话，按 OPS_RUNBOOK §2.1 合并并 `--from validate`；
       - 其余写「【请判断】」。
   - 校验失败栽在已合入的修复上（OPS_RUNBOOK §2.2）：交给 (a)。若修复尚未合入，挂 `after_merge_revalidate.py` 等待器。已修问题清单用配置文件维护，不写死在代码里。
   - `wait: STALLED`：按最后写日志的时间（日志 mtime）记一行到 `_inbox/ops.md`，带模型与最后一行。同一时段多件挂住，写「【请判断】是否降池上限」，附默认做法。不自己改池上限。
   - 新合入：等 1 分钟负载均值 < 25，跑 `prod_check.sh`，把结果写进 `_inbox/ops.md`：entry、render、webgl、首次会话合计及涨幅，红的话附失败摘要。
3. **安全**：
   - 只调用现有脚本和 supervise / step，不直接改别的任务的工作区，只有处置会话按 RUNBOOK 改；
   - 不停任何进程；
   - 不碰出图线任务（ART- / TOWN- / VFX- / CITY- 等）和 Gemini / Tripo 进程；
   - 不放宽任何门禁；
   - 磁盘可用 < 2.5 GiB 时只写收件箱，不再起新会话。
4. **运行**：
   - 支持 `--once`（跑一轮就退出）和 `--dry-run`（只打印将做的动作，不执行）；
   - 正常模式每 30–60 秒一轮；
   - 用 `detach_launch.py` 起；
   - 日志写 `.agents/coord/_ops/ops_dispatch.log`，状态写 `.agents/coord/_ops/state.json`。

### (c) 单测

- 决策逻辑全部有单测：`tools/agents/test_ops_dispatch.py`，夹具放 `tools/agents/fixtures/ops/**`。至少覆盖：
  - 窗口期与真冲突的区分；
  - 机械冲突与语义冲突的分类；
  - 已修问题的识别：5 秒超时、HOST_DISPOSED、计时断言；
  - 停滞按日志 mtime 判断、同时段聚集；
  - prod_check 输出解析；
  - 不碰出图线任务。
- supervise.py 的「返修前挪基点」也要有单测：`tools/agents/test_supervise_rebase.py`，用临时 git 仓库，写法参照 `tools/agents/test_run_sparse_baseline.py`。测试里不得真起 codex 或 traex。

## 约束

- 写集：
  - `tools/agents/supervise.py`：只加 (a) 的逻辑；
  - `tools/agents/ops_dispatch.py`；
  - `tools/agents/test_ops_dispatch.py`、`tools/agents/test_supervise_rebase.py`、`tools/agents/fixtures/ops/**`；
  - `tools/agents/OPS_RUNBOOK.md`：只在末尾加一节「自动化对照」，写清哪些条目已由程序接管；
  - 写集外的改动在提交时会被丢弃。
- 不改 `step.py`、`run.py`、`tasks.json`、`.agents/coord/_handoff/**`，也不改任何门禁或阈值。
- 不加第三方依赖，只用标准库；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.agents.test_ops_dispatch tools.agents.test_supervise_rebase tools.agents.test_step_pool_priority tools.agents.test_step_traex_args tools.agents.test_run_sparse_baseline`
- `python3 tools/agents/ops_dispatch.py --once --dry-run`：在当前仓库状态下正常退出，打印将做的动作
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 50 行，写清：
- (a) 的判定与边界；
- 守护进程的事件清单与对应动作；
- 哪些事件写「【请判断】」；
- 单测覆盖；
- 起停方式；
- `--once --dry-run` 在当前仓库的输出摘要。
