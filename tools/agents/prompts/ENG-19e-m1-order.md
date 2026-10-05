# 本任务：游戏工程 · M1 白马冷入口页面流：过场 → 场景载入 → 移动 → 首谈 → 东出口点亮 → 自动档 → 题卡 → 自由操作；演出事件上屏；说话人标签取自 NPC 内容

本任务写界面装配与流程代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`；
- 工程报告：`ENG-19b-ui-m1-flow.md`（M1 页面与懒加载约束）、`ENG-19d-m1-flow-test-race.md`、`ENG-event-executor.md`（演出事件结构，本任务依赖它）、`ENG-region-gates-data.md`（dialogue binding，本任务依赖它）、`ENG-entry-split.md`、`ENG-size-session-gate.md`；
- 代码：`apps/game/src/flow/stage.ts`、`presentation.ts`（`SPEAKERS` 现为写死的 4 项，其余 NPC 一律显示「江湖人物」）、`m1-flow.test.ts`、`apps/game/src/game-controller.ts`；
- 审核意见 `.agents/reviews/CONTENT-ch10-cold-entry.r1.md` 第 3、5 条。

## 为什么做

CONTENT-ch10 r1 指出 M1 的白马冷入口页面流顺序不对：现在是「西行卡 → 题卡 → game」，而设计是：

> 过场 → 场景载入 → 移动 → 首谈 → 东出口点亮 → 自动档 → 题卡 → 自由操作

另外，对话里的 NPC 说话人一律显示「江湖人物」，因为 `presentation.ts` 的说话人表是写死的。

协调者裁定（10-03 13:26）：登记 M1 页面装配顺序任务，依赖 ENG-region-gates-data（区域绑定）与 ENG-event-executor（事件执行器）。

## 要做的事

1. **页面流顺序**：在 `apps/game/src/flow/**` 与 `game-controller.ts` 里把白马冷入口改成上面的顺序：
   - 过场（西行，可跳过）；
   - 载入场景 `sc_10_fengshi_feiyi`；
   - 玩家可移动；
   - 走到或互动首谈锚点，经 dialogue binding 进入 `fengshi_first_talk`；
   - 首谈结束后东出口点亮，即门禁满足；
   - 自动存档；
   - 题卡；
   - 自由操作。
   每一步以 core 的领域事件为准推进，界面不自己判定规则。
2. **演出事件上屏**：消费 ENG-event-executor 的演出事件（显示文字、揭示题字、开始 Ink、载入场景），接到现有对话、题卡、提示组件上。组件一律懒加载，遵守 ENG-19b 的约束。
3. **说话人标签**：
   - 去掉写死的说话人表，改从 NPC 内容取显示名，经 content-text 或章节 NPC 数据；ENG-session-base-diet 若已合入，就从章节 NPC 叶片取；
   - 旁白、玩家、书灵保留；
   - 取不到时显示 NPC ID 对应的文本键缺失提示，不显示「江湖人物」；
   - 测试覆盖 ch10 的沈青禾、李文秀、无名驿卒。
4. **测试**：扩展 `m1-flow.test.ts`，或新增白马流程测试：
   - 用 fake IndexedDB 走完上面八步，断言顺序与自动档存在；
   - 等待写法遵守 ENG-19d 的做法：先等元素出现再交互；
   - 不加「高负载跳过」（AR-33）。

## 约束

- 写集：
  - `apps/game/src/flow/**`、`apps/game/src/game-controller.ts`、`apps/game/src/main.ts`（只在必须时）
  - `apps/game/src/runtime/**`（最小改动）
  - `packages/ui/src/**`（只在需要新组件或改现有组件时，且要懒加载）
  - 写集外的改动在提交时会被丢弃。
- 不改 `packages/core/**`、`packages/data/**`、`content/**`、`tools/perf/**`。
- 体积：标题页 entry、首次会话闭包都在预算内；报告写 `pnpm size` 三层数字。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 八步各由哪个领域事件推进；
- 说话人标签的数据来源；
- 测试覆盖；
- `pnpm size` 三层数字。

第 7 节写交接：交验收任务的浏览器走查步骤，从新游戏一路到白马冷入口自由操作。

报告 ≤ 50 行。
