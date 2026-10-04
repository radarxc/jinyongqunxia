# 本任务：游戏工程 · 领域事件触发的 EventDef：core 发出领域事件时（先接 `chapter/woke`），在同一事务里按 `condition.sourceEvent` 匹配并执行 EventDef，复用 event-executor 的执行器，演出动作照样发 `world/eventPresented`

本任务写 core 规则代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`：core 只做确定性规则，禁止 DOM、墙钟、非确定性 API；
- 工程报告：
  - `tools/agents/reports/ENG-event-executor.md`：执行顺序与回滚、receipt、`world/eventPresented` 的结构；本任务依赖它；
  - `tools/agents/reports/ENG-17-booksleep-m1.md`：书眠与 `chapter/woke` 的发出；
- 代码：
  - `packages/core/src/event/event-executor.ts`：`conditionMatches()` 遇到 `sourceEvent` 直接返回 false（第 80 行一带），这是 Trigger 路径的现有语义；
  - `packages/core/src/command/chapter-handler.ts`：`chapter/woke` 的发出点（第 85 行一带）；
  - `packages/data/src/schemas/world.ts`、`event-actions.ts`：EventDef 的 `condition`（sceneId、anchorId、sourceEvent、chapterId、gate）与动作词表；
- 内容：`content/chapters/ch10_baima/events/ev_10_cold_entry_arrival.yaml`（只读）。

## 为什么做

- `ev_10_cold_entry_arrival` 的条件是 `{sourceEvent: chapter/woke, chapterId: ch10_baima}`，动作是：
  - `dialogue/start` westward_journey（54 秒西行过场）；
  - `ui/revealText` 年号；
  - `world/loadScene` sc_10_fengshi_feiyi。
- event-executor 只执行「Trigger 被走到或互动、且带 eventId」的 EventDef。所以书眠醒来后，这条开场永远不会生效，也不会发 `world/eventPresented`。
- ENG-19e 的八步流程里，「过场 → 场景载入」两步就没有 core 领域事件可以消费。

协调者裁定（10-03 18:58）：分开登记本任务，依赖 ENG-event-executor，排在 ENG-19e 之前，并加进 19e 的依赖。

## 要做的事

1. **通用接法**：
   - core 事务发出领域事件 `t` 时，在同一事务里查当前章节已装载的 EventDef 中 `condition.sourceEvent === t` 的那些；
   - 先接 `chapter/woke`，接法写成通用的，以后加别的事件只需登记事件名；
   - 匹配到多条时按 EventDef ID 排序，保证确定性。
2. **执行**：
   - 复用 event-executor 的执行器：照常校验 once 与其余条件（chapterId、gate；写了 sceneId、anchorId 的，按当下状态比对）；
   - 状态动作原序执行，receipt 照常写；演出动作聚合为 `world/eventPresented {eventId, steps[]}`；
   - 失败的回滚口径与 event-executor 一致，给可读的 reason code。整笔回滚是否连带回滚发出源事件的那笔事务，在报告里写清默认做法与理由。
3. **不连锁**：由 sourceEvent EventDef 的动作再发出的领域事件，不再触发别的 sourceEvent EventDef（深度 1），写进报告。
4. **不改 event-executor 已有的 Trigger 路径语义**：Trigger 带 eventId 的流程、receipt、reason code 原样保留。sourceEvent 的匹配走新入口，不改 `conditionMatches()` 现有的返回值口径。
5. **测试**：
   - `chapter/woke` 触发 arrival：断言 `world/eventPresented` 的 steps 依原序为 `dialogue/start`、`ui/revealText`、`world/loadScene`；
   - once 跨读档不重复；条件不满足不执行；失败回滚；不连锁；
   - 同一输入跑 100 次，hash 一致；
   - core golden 不改期望值，若受影响写清原因。

## 约束

- 写集：
  - `packages/core/src/event/**`、`packages/core/src/command/**`
  - `packages/core/src/api/**`（只在需要导出事件类型时）、`packages/core/src/**/*.test.ts`
  - `apps/game/src/runtime/**`（只在醒来时装载 EventDef 必须改动时动，改动最小）
  - 写集外的改动在提交时会被丢弃。
- 界面层不自己判规则：不改 `apps/game/src/flow/**`、`packages/ui/**`。19e 只消费 core 发出的事件。
- 不改 `content/**`、`packages/data/**`、`tools/perf/**`。
- 体积：首次会话闭包不得超过 110 KiB；报告写 `pnpm size` 三层数字。
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
- 接法与匹配规则；
- 多条匹配时的顺序；
- 不连锁规则；
- 回滚口径；
- 事件结构；
- 测试覆盖；
- `pnpm size` 三层数字。

第 7 节写交接：
- 交 ENG-19e：醒来后的开场演出怎样从 `world/eventPresented` 消费，即过场 → 年号 → 载入场景；
- 交 CONTENT 任务：以后写 sourceEvent EventDef 的约定。

报告 ≤ 50 行。
