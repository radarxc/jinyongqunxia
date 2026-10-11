# 本任务：城镇探索 v2 · core 设施对话——对话上下文、`facility/openShop` 呈现步、说话人 `interlocutor`、v1 `town/interact` 改走设施对话

**第一个动作**：读 `tools/agents/reports/ENG-town2-kernel-prep.md` 第 3、7 节（`dialogue/context-validate.ts` 定的上下文形状、忙碌拒绝码）与 `tools/agents/reports/ENG-town2-shop-schema.md` 第 3、7 节（`facility/openShop` 动作、`interlocutor` 说话人、`town-facilities.v1` / `facility-dialogue.v1` 字段），再打开 `packages/core/src/command/story-handlers.ts`（`dialogueHandler`，约 L78–140）、`packages/core/src/dialogue/index.ts`（Ink 桥与说话人解析约 L136–145）、`packages/core/src/command/handlers.ts`（城镇处理器 `applyTown` 发 `town/shopRequested` 约 L166）、`packages/core/src/world/town-runtime.ts`（`town/interact` 约 L168–182），以及 `docs/tech/15-town-explore-v2-spec.md` §4.5；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（validate 只读；写入只经事务；对话推进先核对 `storyHash`）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」流程：进店 → 点店主 → 设施对话（Ink）→「看看货」→ 店铺界面。现在 v1 城镇点店铺建筑直接发 `town/shopRequested`，页面弹出写死的模拟店；本任务把它改成：在设施建筑内交互 → 按设施对话表启动 Ink 对话（带上下文）→ Ink 里 `#ts:facility/openShop` 产生呈现步 `{ op: 'shop/open', shopKey }` → 界面据此打开店铺（界面是 ENG-town2-shop-wire）。买卖结算是 ENG-town2-shop-core。

## 要做的事
1. **对话上下文**：`GameState.dialogue.context?: { kind: 'facility'; sceneId; facilityKey; roleKey; shopKey: string | null }`（形状校验 kernel-prep 已加）。新增内部入口 `startFacilityDialogue(tx, { sceneId, facilityKey, roleKey })`：按（章节、设施类 `kind`、子类 `sub`、`roleKey`）查 `facility-dialogue.v1` 得 `{ storyId, entryKey }`，复用 `dialogueHandler` 的启动路径（同一 `tx.rng('world').nextU32()` 播种、同一 `dialogue/started` 事件，载荷新增 `context`），并把上下文写进 `dialogue.context`；找不到绑定 → 内部错误 `FACILITY_DIALOGUE_MISSING`（内容错误，不伪装成玩家拒绝）。
2. **说话人 `interlocutor`**：`#ts:dialogue/speaker speaker=interlocutor` 在有设施上下文时投影为该设施的店员（投影里给 `speakerId: 'interlocutor'` + `interlocutor: { facilityKey, roleKey, nameKey }`，名字由界面按 `nameKey` 取）；无上下文时遇到 `interlocutor` → 内部错误 `DIALOGUE_INTERLOCUTOR_CONTEXT`。
3. **`facility/openShop` 动作**：在 `event/event-executor.ts`（或对话意图提交处，以现有动作分派位置为准）实现：从 `dialogue.context.shopKey` 解析店铺，产生呈现步 `{ op: 'shop/open', shopKey }`（进对话投影的呈现步列表，界面消费后关闭对话并打开店铺）；上下文缺失或 `shopKey === null` → `DIALOGUE_INTENT_REFERENCE`（沿用现有意图引用错误码）。同一 Ink 标签重复执行按现有 `consumedTagKeys` 机制只产生一次。
4. **v1 过渡**（`world/town-runtime.ts` + `command/handlers.ts` 的城镇分支）：`town/interact` 在设施建筑内（设施文件把（布局 `townId`, `buildingId`）映射到某设施）→ 改为调用 `startFacilityDialogue`，不再发 `town/shopRequested`（该事件删除；`businessRef` 只指营生，不再当店铺键）；不在设施建筑内的交互行为保持不变。
5. **对话中拒绝城镇命令**：v1 的 `town/move | interact | meditate | enter | leave` 在 `state.dialogue !== null` 时拒 `REGION_INTERACTION_BUSY`（或 kernel-prep 定的忙碌码，以报告为准）——修掉 v1 对话中仍可移动的问题。

## 测试（命名用例；core 项目）
- 设施对话启动：上下文字段齐全写入 `dialogue.context`；`dialogue/started` 载荷含上下文；世界 RNG 恰消费一次。
- `interlocutor` 说话人投影带 `facilityKey / roleKey / nameKey`；无上下文时报内部错误。
- `openShop`：呈现步 `{ op: 'shop/open', shopKey }` 的 `shopKey` 等于设施绑定的店；`shopKey: null`（如客栈）时报 `DIALOGUE_INTENT_REFERENCE`；同一标签不重复产生。
- v1：在药铺内 `town/interact` → `dialogue/started`（不再有 `town/shopRequested`）；在非设施建筑 / 街上的交互行为与改前一致（用现有 `handlers.test.ts` 用例证明）。
- 对话中 `town/move` 等被拒；对话结束后恢复可用。
- 对话中存档仍被拒（`DIALOGUE_SAVE_UNAVAILABLE` 行为不变）。

## 约束
- 只写：`packages/core/src/dialogue/**`、`packages/core/src/event/event-executor.ts`、`packages/core/src/command/{story-handlers,handlers}.ts`、`packages/core/src/world/town-runtime.ts`、上述文件对应的 `*.test.ts` 与本任务报告。
- 不改 `command/{index,bus}.ts`、`shop-handler.ts`、`economy/**`（shop-core 并行在写）；不改 `packages/core/src/index.ts` 导出布局；不改 `content/**`（测试夹具写在测试里）；不新增依赖。
- core 只用整数（无 `/`）、无墙钟与隐式随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。
- 现有 `handlers.test.ts` 里断言 `town/shopRequested` 的用例按新行为改写，并在报告逐条列出（只改与本任务直接相关的断言）。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-dialogue-facility.md`（≤ 60 行）：第 3 节写上下文形状、设施对话查表键、`shop/open` 呈现步形状与新内部错误码；第 6 节列改写的既有测试；第 7 节写给 ENG-town2-shop-wire（界面在哪个投影字段收到 `shop/open`、`interlocutor` 名字从哪取）与 ENG-town2-explore-facility（v2 店员交互如何复用 `startFacilityDialogue`）的交接。
