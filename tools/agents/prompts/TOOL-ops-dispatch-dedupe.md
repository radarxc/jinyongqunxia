# 本任务：工具 · 小修：ops_dispatch 的 HOLD / ERROR / READY / 校验失败事件按「任务 + 状态 + 失败摘要」去重，只有状态或失败摘要变了才再报（协调者 10-04 01:3x）

本任务改调度工具。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- 守护进程在 01:20、01:21、01:24 把 CONTENT-apparel-data 的同一条 HOLD-VALIDATE 报了三遍。
- 原因：`collect()` 里事件键是 `digest([tid, status, self.config])`，HOLD-VALIDATE 还套了 `head`：
  - status 整个字典含 `updated` 时间戳，驱动一写状态，键就变；
  - 集成分支 HEAD 一有新提交（素材线随时在提交），键也变；
  - 所以同一状态、同一失败摘要被当成新事件反复报。

## 要做的事

1. 事件键只用稳定字段：
   - HOLD-* / ERROR：任务 ID、state、detail；
   - HOLD-VALIDATE：任务 ID、state、`last_failure.md` 尾段的摘要；
   - READY（auto-merge 未成功）：任务 ID、state、冲突文件集合或失败首行。
   - 不含 `updated` 时间戳和集成 HEAD。
2. 已报过的键记在 `state.json`。状态离开后又回来，或摘要变了，才再报一次。
3. 不改 `classify()` 的决策、不改执行层与安全边界；其余事件（stall、merge、prod_check）的去重保持原样。
4. 单测，加在 `tools/agents/test_ops_dispatch.py`：
   - 同一 HOLD-VALIDATE 在 HEAD 前进、`updated` 变化时不重报；
   - 失败摘要变了重报；
   - 状态离开再回来重报。

## 约束

- 写集：`tools/agents/ops_dispatch.py`、`tools/agents/test_ops_dispatch.py`、`tools/agents/fixtures/ops/**`。写集外的改动在提交时会被丢弃。
- 只用标准库；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `python3 -m unittest tools.agents.test_ops_dispatch tools.agents.test_supervise_rebase tools.agents.test_step_pool_priority`
- `python3 tools/agents/ops_dispatch.py --once --dry-run`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清：新的键由哪些字段组成，什么情况会重报，单测覆盖。
