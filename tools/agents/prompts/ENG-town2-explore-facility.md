# 本任务：城镇探索 v2 · core 设施 / 出口 / 打坐 / 进出城——店员交互走设施对话、出口离城 + 场景记忆、`world/meditate` 移植、v2 入城挂载到城门出生点、ShopLocator v2、`thenInteract`

**第一个动作**：读 `tools/agents/reports/ENG-town2-explore-walk.md`、`ENG-town2-shop-core.md`、`ENG-town2-dialogue-facility.md` 的第 3、7 节（交互与进格流程的挂点、`startFacilityDialogue`、ShopLocator 分派入口），再打开 `packages/core/src/command/handlers.ts`（`worldmap/enter` 遇城镇约 L84–95、`createTownState()` 忽略 gate 与 spawn 的问题）、`packages/core/src/world/worldmap-runtime.ts`（`worldmap/enter | leave` 约 L122）、`packages/core/src/world/town-runtime.ts`（`resolveTownMeditation` 与其测试 `town-runtime.test.ts` 约 L168–231）、`packages/core/src/economy/shop-locator.ts`，以及 `docs/tech/15-town-explore-v2-spec.md` §4.3、§2.1；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数、禁 `/`、禁墙钟与隐式随机；validate 只读；写入只经事务；RNG 消费量是协议）。

## 背景
作者 AR-114（2026-10-10，逐字）：「采买这些都在建筑里进行（搭配NPC对话）。」v2 城镇里：店员是区域对象 `FacilityNpc`（站在柜台后，交互距离 2，隔柜台说话），交互即进入设施对话；城门是 `Exit` 对象，离城时把场景里已消耗的触发器 / 打开的宝箱 / 动态格存进场景记忆，再入城时恢复；从大地图进城要落在对应城门内侧的出生点 `spawn_<gateId>`（现在 `createTownState()` 忽略了 gate 与 spawn）；打坐只在客栈房间、寺庙、僻静院落的 `MeditationSpot`，风险结算与 v1 完全相同。

## 要做的事
1. **店员交互** `world/explore/facility.ts`：交互 `FacilityNpc`（距离 ≤ `interactRange`、有视线、`blocked` 柜台可透视）→ 调 `startFacilityDialogue(tx, { sceneId, facilityKey, roleKey })`；`travelTo { kind: 'anchor', anchorId, thenInteract: true }` 到店员时到达即同一事务启动对话。
2. **出口** `world/explore/exit.ts`：交互 `Exit`，或站在出口格时 `worldmap/leave` → `leaveSceneTx`：把场景实体状态（`entities`）与动态格存进 `world.sceneMemory`（≤ 16 条，按 `sceneId` 排序；超出时淘汰最久未访问的一条，规则写清并测试）→ 卸载区域 → 位置回到城节点。
3. **入城**（`world/worldmap-runtime.ts` + `command/handlers.ts` 的 `worldmap/enter` 分支）：大地图节点 `entry.scene` 存在且会话已预载其区域内容 → 原子挂载到 `spawn_<entry.gateId>`（缺省主城门），恢复 `sceneMemory` 里该场景的实体与动态格；`entry.scene === null` → 拒绝 `MAP_NODE_CLOSED`；v1 城（无 `entry.scene`、有 v1 城镇内容）行为不变。
4. **打坐** `world/explore/meditation.ts`：`world/meditate { anchorId, plannedTicks: 600 }` 在 `MeditationSpot` 上（距离 0）把 `resolveTownMeditation` 的风险与伏击事务移植过来——**同一风险公式、同一世界 RNG 消费顺序与次数**、`riskBaseBp` 取对象字段（客栈 100、寺庙 250）；与 v1 夹具对拍：同种子同状态下 v1 与 v2 的结果（资源、事件、是否伏击、RNG 状态）逐字段相同。
5. **ShopLocator v2**（`economy/shop-locator.ts` 的引擎分派入口里加 v2 分支）：玩家在设施所属建筑内（`insideBuildingId` 对应 `facility.buildingId`），或在其任一 `serviceCell` 2 格内。

## 测试（`packages/core/src/world/explore/{facility,exit,meditation}.test.ts` 等，命名用例）
- 入城挂载在 `spawn_south_gate`（夹具：带三座城门的小城）；`entry.gateId = west_gate` 时在西门内；`entry.scene = null` → `MAP_NODE_CLOSED`。
- 出城回节点；**再入城保留已消耗的一次性触发器**（触发过的不再触发）与打开的宝箱；`sceneMemory` 超 16 条的淘汰规则。
- 店员：距离 2 隔柜台可交互、距离 3 不可；`thenInteract` 到达即启动设施对话（`dialogue/started` 事件与上下文）。
- 打坐：与 v1 夹具对拍逐字段一致（含被伏击的分支）；不在打坐点 → 拒绝。
- ShopLocator v2：屋内可买、服务格 2 格内可买、3 格外 `SHOP_NOT_HERE`。
- 确定性：完整脚本（入城 → 走到药铺 → 交谈 → 出城 → 再入城）跑两次状态哈希相同。

## 约束
- 只写：`packages/core/src/world/explore/{facility,exit,meditation}.ts`（+ 测试）、`packages/core/src/command/{explore-handler,handlers}.ts`、`packages/core/src/command/*.test.ts`（只增改与本任务直接相关的用例）、`packages/core/src/world/worldmap-runtime.ts`、`packages/core/src/world/worldmap.test.ts`、`packages/core/src/economy/shop-locator.ts`（+ 测试）与本任务报告。
- 不改 v1 `town-runtime.ts` 的行为（只读其导出做对拍）；不改 `command/{index,bus}.ts`、`state/**`（`sceneMemory` 形状 kernel-prep 已定）；不改 `packages/core/src/index.ts` 导出布局；不新增依赖。
- core 只用整数（无 `/`）、无墙钟与隐式随机、排序带比较器；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-explore-facility.md`（≤ 60 行）：第 3 节写入城挂载规则、场景记忆格式与淘汰、打坐对拍结果、ShopLocator v2 判定；第 7 节写给 ENG-town2-session-v2（入城前要预载哪些内容、`MAP_NODE_CLOSED` 的界面提示）与 ENG-town2-explore-page（交互条动词与对象类型的对应）的交接。
