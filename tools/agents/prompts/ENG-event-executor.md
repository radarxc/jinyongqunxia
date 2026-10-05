# 本任务：游戏工程 · EventDef 动作执行器：区域 Trigger 触发的一次性事件真正生效（旗标、发放物品、基础补给、自动存档、开入口），演出类动作发给界面

本任务写 core 规则与数据管线代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。

先读：
- 根 `CLAUDE.md`：core 只做确定性规则，禁止 DOM、墙钟、非确定性 API；`packages/data/CLAUDE.md`；
- 工程报告：
  - `tools/agents/reports/ENG-20a-region-core.md` 第 7.4 节：Trigger 只发 `world/triggered`，「剧情所有者校验并执行」；
  - `tools/agents/reports/ENG-17a-newrun-dialogue.md`、`ENG-17-booksleep-m1.md`：对话、旗标、存档的现有命令；
  - `tools/agents/reports/ENG-tiled-trigger-strict.md`：Trigger 的 action 白名单，来自 Ink OPCODES；
- 代码：
  - `packages/core/src/command/region-handler.ts`：`world/triggered` 的发出点；
  - `packages/core/src/command/story-handlers.ts`、`handlers.ts`；
  - `packages/data/src/schemas/world.ts`：`EventDefSchema`，现在 `actions` 是松散的 `record[]`；
  - `packages/data/src/build/ink.ts`：`OPCODES`；
- 审核意见 `.agents/reviews/CONTENT-ch10-cold-entry.r1.md` 第 2–4 条；ch10 工作区 `.agents/wt/CONTENT-ch10-cold-entry/content/chapters/ch10_baima/events/*.yaml`（只读，看现有 7 个事件用了哪些动作）。

## 为什么做

- 区域里的 Trigger 只发 `world/triggered { anchorId, eventId, action }`，然后就没有下文了：EventDef 里写的动作没人执行。
- CONTENT-ch10 r1 因此 FAIL：
  - 火盆的一次性补给、自动存档不会真实发生；
  - 首谈只能靠一个没人消费的事件声明。
- ch00 后面也会撞上同样的问题。

协调者裁定（10-03 13:26）：登记 EventDef 动作执行器，负责一次性事件。依赖 ENG-20a（已合入）。与 ENG-26 若都改 core 的 world / events，按合入顺序挪基点。

## 要做的事

1. **动作词表**：给 EventDef 的 `actions` 定一份严格的动作联合类型。
   - 写在 `packages/data/src/schemas/world.ts`，或新文件 `event-actions.ts`。
   - 命名与 Ink OPCODES 对齐、共用一处登记，做法同 ENG-tiled-trigger-strict：`flag/set`、`party/giveItem`、`party/takeItem`、`save/autosave`、`world/openEntrance`、`quest/advance` 等，参数一致。
   - 需要新增的状态类动作，例如基础补给 `party/restore`，按同一命名风格补进登记。
   - **演出类动作**（显示文字、揭示题字、开始一段 Ink、载入场景、仅观察）也用命名空间形式登记，例如 `ui/showText`、`dialogue/start`、`world/loadScene`。
   - 对 ch10 已写的 `startStory`、`showText`、`revealText`、`loadScene`、`restoreBasicSurvival`、`observeOnly`：
     - 给出新旧名对照；
     - 若它们已经合入集成分支，就在写集内按对照把 `content/chapters/*/events/**` 改成新名字（只改 op 名和参数名，不改内容含义），保证合入后 `content:validate` 仍然全绿；
     - 若还没合入，就在报告第 7 节交 CONTENT-ch10 照改。
2. **执行器**（core）：
   - 区域里 Trigger 被走到或互动、带 `eventId` 时，在同一事务里查对应 EventDef，依次检查 `once`、`condition`；条件结构复用 `RegionGateExpr` 或现有条件求值。
   - 依次执行状态类动作：沿用现有命令的规则与校验，例如存档沿用 `emitCheckpoint` 的口径。
   - 演出类动作不在 core 里执行，只作为一个领域事件交给界面，例如 `world/eventPresented { eventId, steps[] }`。
   - `once` 的事件执行后记入状态：读档后不重复；会话 hash 确定。
   - 动作失败（引用不存在、条件不满足）整笔回滚，给可读的 reason code。
   - **不改** core golden 的期望值：现有 golden 场景不含这类事件，若确实受影响，在报告写清原因。
3. **数据进 core**：EventDef 编进对应章节的规则包，区域子系统按需加载时一并装载，入口同 ENG-entry-split 与 ENG-region-gates-data。
   - 改 `apps/game/src/runtime/**` 时只动最少几处：ENG-16c、ENG-session-base-diet、ENG-region-gates-data 也在改这里。
4. **测试**：
   - 动作词表的 schema 正反例；
   - 执行器：once、条件不满足、状态类动作生效、演出事件发出、失败回滚；
   - 同一输入跑 100 次，hash 一致；
   - content:validate 拒绝未登记动作。

## 约束

- 写集：
  - `packages/core/src/event/**`、`packages/core/src/command/**`、`packages/core/src/world/region-types.ts`、`packages/core/src/world/region-runtime.ts`
  - `packages/core/src/api/**`（只在需要导出事件类型时）、`packages/core/src/**/*.test.ts`
  - `packages/data/src/schemas/world.ts`、`packages/data/src/schemas/event-actions.ts`、`packages/data/src/schemas/index.ts`
  - `packages/data/src/build/**`、`packages/data/src/content-index.ts`、`packages/data/src/**/*.test.ts`
  - `apps/game/src/runtime/**`（最小改动）
  - `content/chapters/*/events/**`（只做动作改名迁移）
  - 写集外的改动在提交时会被丢弃。
- 不改界面（`apps/game/src/flow/**`、`packages/ui/**`）：演出事件由 ENG-19e-m1-order 消费。也不改 `tools/perf/**`。
- 体积：执行器在区域子系统里，不进标题页 entry；报告写 `pnpm size` 三层数字，首次会话闭包不得超过 110。
- 不加依赖；每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm content:build`
- `pnpm content:validate`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/data test`
- `pnpm --filter ./apps/game test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 动作词表，分状态类和演出类，含参数；
- 新旧名对照；
- 执行顺序与回滚规则；
- 演出事件的结构；
- `pnpm size` 三层数字。

第 7 节写交接：
- 交 ENG-19e-m1-order：演出事件怎么消费；
- 交 CONTENT-ch10 / ch00：事件怎么写、改名清单。

报告 ≤ 60 行。
