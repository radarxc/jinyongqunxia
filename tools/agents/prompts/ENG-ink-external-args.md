# 本任务：游戏工程 · 小修：Ink 文本抽取不得改写 EXTERNAL 调用的字符串实参（get_flag / has_item / quest_stage / affinity 保持原始 ID），补回归测试

本任务写数据管线代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/data/CLAUDE.md`；
- 代码：`packages/data/src/build/ink.ts`：
  - `extractStoryText()`（第 93 行一带）；
  - `EXTERNALS`（第 42 行一带）：`get_flag`、`quest_stage`、`has_item`、`affinity`；
- 工程报告 `tools/agents/reports/ENG-17a-newrun-dialogue.md`、`ENG-content-validate-inkmeta.md`：Ink 文本抽取与 inkmeta 校验；
- 审核意见 `.agents/reviews/CONTENT-ch00a-data.r4.md` 第 1、4 条：实测编译产物。

## 为什么做

- `extractStoryText()` 遍历编译后的 Ink JSON 时，把 `str … /str` 块一律当成可本地化文本，换成 `ink.<storyId>.text.NNNN` 文本键。
- 但 EXTERNAL 调用的字符串实参也编译成 `str` 块，于是也被换掉了。CONTENT-ch00a 序章源文件写的是：
  - `get_flag("fl_00_zhulin_loss_streak3")`；
  - `has_item("it_tao")`。
- 编译后传进去的却是 `ink.story_ch00_main.text.0019` / `.0024` / `.0026`。
- 后果：所有带字符串实参的 external 查询都查错，序章的书灵示范永远不出现，投桃永远走「无桃」分支。

## 要做的事

1. 修 `extractStoryText()`：
   - 只本地化真正输出给玩家的文本，即正文行和选项文本；
   - 求值上下文里的字符串原样保留，包括 EXTERNAL 调用的实参、比较或赋值里的字符串常量；
   - 判别规则写进代码注释和报告第 3 节。
   - 若同一字符串既是输出又是实参，各按所在位置处理。
2. 回归测试：
   - 用夹具 Ink 覆盖四个 external，各至少一例：`get_flag("fl_…")`、`has_item("it_…")`、`quest_stage("q_…")`、`affinity("npc_…")`，外加 `not has_item(...)`；
   - 断言编译产物里实参严格等于原始 ID；
   - 断言正文与选项文本仍被抽取成文本键，文本表内容不变；
   - 现有 Ink 测试的期望值不改；确实受影响的话，在报告写清原因。
3. 实测仓库里已有的 Ink，至少包括 ch10，ch00 已合入的话也算：
   - 重新编译，确认 external 实参都是原始 ID；
   - `storyHash` 变化属正常，在报告第 3 节列出前后值。

## 约束

- 写集：
  - `packages/data/src/build/ink.ts`
  - `packages/data/src/build/*.test.ts`、`packages/data/src/**/__fixtures__/**`
  - 写集外的改动在提交时会被丢弃。
- 不改 `OPCODES` 与 `EXTERNALS` 的内容，不改 `content/**`、`packages/core/**`、`apps/**`。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/data test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 抽取的判别规则；
- 测试覆盖；
- 已有 Ink 的实测结果，含 `storyHash` 前后值。

第 7 节写交接：
- 交 CONTENT-ch00a / 验收：重编译后怎么确认三处调用严格为 `get_flag("fl_00_zhulin_loss_streak3")`、`has_item("it_tao")`、`not has_item("it_tao")`；
- 交 ENG-ink-intents：运行时 external 绑定直接拿到原始 ID。

报告 ≤ 40 行。
