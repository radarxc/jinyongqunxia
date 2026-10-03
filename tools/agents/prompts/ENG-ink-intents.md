# 本任务：游戏工程 · Ink 标签动作（DialogueIntent）真正执行：对话推进时解码 `#ts:` 标签并经共享动作执行器落到 core 状态（发放 / 收取物品、旗标、任务推进、开入口、自动存档、配点、题卡……）

本任务写 core 规则代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`：core 只做确定性规则；
- `docs/tech/04-data-pipeline.md` §7.1–7.2：`DialogueIntent`、`decodeTag`、`commit` 在当下快照重验；
- `docs/design/12-quests-npc-factions.md` 第 237 行一带：`#ts:<opcode> key=value` 格式；
- 工程报告：
  - `ENG-event-executor.md`：本任务依赖它，复用它的动作执行器与共享 OPCODES 登记；
  - `ENG-17a-newrun-dialogue.md`；
  - `ENG-content-validate-inkmeta.md`；
- 代码：
  - `packages/data/src/build/ink.ts`：`OPCODES`、`decodeInkTag`；
  - `packages/core/src/dialogue/**`：`state.ts` 里的 `pendingIntents`、`consumedTagKeys` 字段已有，但现在没有任何代码填写或执行它们；
- 审核意见 `.agents/reviews/CONTENT-ch00a-data.r1.md` 第 5 条：Ink 动作执行的阻塞交接。

## 为什么做

- 构建期已把 Ink 标签按 `OPCODES` 校验并编译，例如 `party/giveItem`、`party/takeItem`、`flag/set`、`quest/advance`、`world/openEntrance`、`story/requestTransmission`、`ui/openAllocation`、`ui/showTitleCard`、`save/autosave`、`tutorial/mark`、`battle/start`、`dialogue/speaker`。
- 但运行时对话推进时，这些标签**没有被执行**：`pendingIntents` / `consumedTagKeys` 只是状态里的空字段。
- 后果：
  - 序章 C01 / C03 的竹棒、桃、清茶，投桃，传功，配点，题卡这些由 Ink 驱动的动作都不会真实发生；
  - CONTENT-ch00a / ch10 的审核只能把它列为阻塞。

协调者裁定（10-03 14:31 / 14:34）：查清 Ink 动作执行的归属。ENG-event-executor 只覆盖 EventDef 动作，所以另登记本任务，接在它之后，复用同一个执行器。

## 要做的事

1. **解码**：
   - 对话推进到带标签的行或选项时，在 core 里把标签解成 `DialogueIntent`，复用 `ink.ts` 的 `decodeInkTag` / `OPCODES`，同一份登记，不另写一套解析；
   - 解出的 intent 进 `pendingIntents`；
   - 用 `consumedTagKeys` 保证同一标签只执行一次，读档、回放都不重复。
2. **执行**：
   - 经 ENG-event-executor 的共享动作执行器，在**当下快照**重验后执行（tech/04 §7.2）：库存、任务阶段、权限不满足时拒绝并给 reason，不半途改状态；
   - 演出类动作（题卡、配点界面、过场）发领域事件交界面，与 event-executor 的演出事件一致；
   - `battle/start` 发战斗请求事件，交 ENG-26 / 16c 的入口，不在本任务里建战斗。
3. **确定性**：
   - 同一输入跑 100 次，hash 一致；
   - core golden 不改期望值；若受影响，写清原因。
4. **测试**：
   - 每类状态动作至少一例：发物品、收物品、旗标、任务推进、开入口、自动存档；
   - 重验失败的拒绝路径；
   - 同一标签只执行一次；
   - 读档后不重复；
   - 用夹具 Ink 串起「对话中发物品 → 开入口 → 自动存档」。

## 约束

- 写集：
  - `packages/core/src/dialogue/**`、`packages/core/src/command/**`、`packages/core/src/event/**`（只复用、扩展执行器入口）
  - `packages/core/src/api/**`（只在需要导出事件类型时）、`packages/core/src/**/*.test.ts`
  - `packages/data/src/build/ink.ts`（只导出，不改 OPCODES 内容）
  - `apps/game/src/runtime/**`（最小改动，仅在会话需要转发新事件时）
  - 写集外的改动在提交时会被丢弃。
- 不改 `content/**`、`docs/**`、`apps/game/src/flow/**`、`packages/ui/**`、`tools/perf/**`。界面消费归 ENG-19e-m1-order。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 解码时机；
- 执行与重验规则；
- 一次性保证；
- 演出事件结构；
- 测试覆盖。

第 7 节写交接：
- 交 CONTENT-ch00a / ch10：Ink 标签哪些现在会真实生效；
- 交 ENG-19e：要消费的演出事件。

报告 ≤ 50 行。
