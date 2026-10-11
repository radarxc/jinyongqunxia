# 本任务：城镇探索 v2 · core 内核准备——探索 / 店铺命令与拒绝码定型、处理器桩、行走 tick 钩子、存档 schema 4、Worker 懒加载命令族

**第一个动作**：打开 `packages/core/src/command/index.ts`（`Command` 联合约 L44、`RejectReason` 约 L48）、`packages/core/src/command/bus.ts`（`HANDLERS` 表）、`apps/game/src/runtime/core-dispatch.ts`（`commandHandlers()` 的懒加载族写法）、`packages/core/src/state/migrations.ts`（`migrateBookSleepV2` 与迁移表约 L155），再读 `docs/tech/15-town-explore-v2-spec.md` §4.2、§4.4、§4.6、§4.7；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数、禁 `/`、禁墙钟与隐式随机；validate 只读；写入只经事务；协议变更要补固定向量）。

## 背景
作者 AR-114（2026-10-10）：城镇探索全面升级——点小地图自动寻路、采买在屋里经店主对话完成。core 要新增两组命令：探索行走（`world/travelTo | steer | stop | meditate`，按 10 Hz tick 推进）与店铺（`shop/buy | sell`）。本任务只做**内核接缝**：把类型、拒绝码、总线注册、tick 钩子、存档字段、Worker 懒加载族一次定型，并让桩处理器可被路由到；真正的规则由后续任务（`ENG-town2-shop-core`、`ENG-town2-explore-walk`、`ENG-town2-explore-facility`）填，它们只改各自的文件、不再碰这些共享文件。

## 要做的事
1. **类型定型**（按 tech/15 原样）：
   - `packages/core/src/world/explore/types.ts`：`Pace`、`TravelTarget`、`ExploreCommand`、`ExploreWalkState`、`HEX_STEP_MM = 1155`、`PACE_MM_PER_TICK = { walk: 135, run: 450 }`、`MAX_WALK_PATH = 512`、`SceneMemoryEntry`（`{ sceneId, entities, dynamicTiles }`，≤ 16 条，按 sceneId 排序）。
   - `packages/core/src/economy/shop-types.ts`：`ShopCommand`、`ShopView`、店铺拒绝码。
   - `Command` 联合加入 `ExploreCommand | ShopCommand`；`RejectReason` 加入 `SHOP_UNKNOWN | SHOP_NOT_HERE | SHOP_CLOSED | SHOP_ITEM_UNAVAILABLE | SHOP_STOCK_INSUFFICIENT | SHOP_MONEY_INSUFFICIENT | SHOP_PRICE_STALE | SHOP_INVENTORY_FULL | SHOP_BUSY | REGION_PATH_BLOCKED | REGION_PATH_UNREACHABLE | MAP_NODE_CLOSED`（已存在的不重复加；`REGION_INTERACTION_BUSY` 若已有就复用）。
2. **处理器桩**：`packages/core/src/command/shop-handler.ts`（validate 恒拒 `SHOP_UNKNOWN`）、`packages/core/src/command/explore-handler.ts`（`world/travelTo` 恒拒 `REGION_PATH_BLOCKED`、`world/steer` / `world/stop` 无行走时成功且零写入、`world/meditate` 恒拒 `REGION_PATH_BLOCKED`）；`bus.ts` 注册六个命令名；对话 / 战斗 / 待挂载期间这六个命令一律拒 `REGION_INTERACTION_BUSY`（这条现在就实现，后续任务沿用）。
3. **入口子路径**：`packages/core/src/entries/shop-command.ts`、`packages/core/src/entries/explore-command.ts`（后者再导出现有 `regionHandler`），`packages/core/package.json` 的 `exports` 加 `./shop-command`、`./explore-command`。
4. **行走 tick 钩子**：`packages/core/src/world/explore/tick-hook.ts` 提供 `registerExploreTick(fn)` / `exploreTickHook()`；`explore-command.ts` 入口在被 import 时注册（本任务注册一个空实现 `advanceExploreWalk` 桩，放 `world/explore/tick.ts`）；`worldTickHandler`（`command/handlers.ts`）在 `state.world.navigation.mountedRegion?.walk` 非空时调用钩子，钩子未注册则抛 `EXPLORE_TICK_UNAVAILABLE`（内部错误，不是玩家拒绝）。无行走时 `world/tick` 行为与改前逐字节一致（用现有 golden / 测试证明）。
5. **存档 schema 4**：`SAVE_SCHEMA` 3 → 4；`MountedRegionState` 加 `walk: ExploreWalkState | null`；`world` 加 `sceneMemory: SceneMemoryEntry[]`；`validate.ts` 严格校验新形状；迁移 3 → 4（`migrations.ts` 新增 `migrateExploreV3`：已挂载区域补 `walk: null`，`world.sceneMemory = []`）并加入迁移表；`createInitialGameState` 同步。`RULES_PROTOCOL` 不变。因版本号变化需要更新的 golden / 快照（`packages/core/src/**/*.golden.json`、`apps/game/src/{runtime,storage}/*.test.ts` 里的版本断言）一并更新，并在报告逐个列出改动与原因。
6. **对话上下文形状**：`packages/core/src/dialogue/context-validate.ts`——`GameState.dialogue.context?: { kind: 'facility'; sceneId; facilityKey; roleKey; shopKey: string | null }` 的形状校验（只校验，不写逻辑；对话中本就禁存档，无需迁移）。
7. **Worker 懒加载族**（`apps/game/src/runtime/core-dispatch.ts`）：`shop/*` → `@tianshu/core/shop-command`；`world/travelTo|steer|stop|meditate` → `@tianshu/core/explore-command`；`world/tick` 在当前状态 `mountedRegion.walk` 非空时先确保 explore 族已加载（钩子已注册）再派发；族名用于 `*_SUBSYSTEM_UNAVAILABLE` 错误码（`SHOP_`、`EXPLORE_`）。

## 测试（命名用例）
- 六个新命令都能路由到各自处理器；忙碌（对话 / 战斗 / 待挂载）时拒 `REGION_INTERACTION_BUSY`；桩拒绝码正确。
- 3 → 4 迁移：已挂载区域补 `walk: null`、`sceneMemory: []`；未挂载不变；迁移后 `assertCanonicalGameState` 通过；对 4 版状态再迁移是幂等的。
- 无行走时 `world/tick` 与改前同输入同输出（取现有 world-tick 用例的状态哈希对比）；有行走但钩子未注册时抛 `EXPLORE_TICK_UNAVAILABLE`；注册空钩子后 tick 成功。
- core-dispatch：`shop/buy` 首次派发才加载 shop 族（用现有懒加载测试的计数写法）；带行走的状态派发 `world/tick` 会先加载 explore 族。
- 现有 core / app / storage 测试在 schema 4 下全部通过。

## 约束
- 只写：`packages/core/src/command/{index,bus,handlers,shop-handler,explore-handler}.ts`、`packages/core/src/economy/shop-types.ts`、`packages/core/src/world/explore/{types,tick,tick-hook,walk-validate}.ts`、`packages/core/src/dialogue/context-validate.ts`、`packages/core/src/state/**`、`packages/core/src/entries/{shop-command,explore-command}.ts`、`packages/core/package.json`、`packages/core/src/**/*.golden.json`、`packages/core/src/**/*.test.ts`（只增改与本任务直接相关的用例）、`apps/game/src/runtime/core-dispatch.ts`、`apps/game/src/{runtime,storage}/*.test.ts` 与本任务报告。
- 不实现买卖、寻路、行走推进本身（后续任务）；不改 `packages/core/src/index.ts` 的导出布局；不新增依赖。
- core 只用整数（无 `/`，用 `floorDivInt` / `ceilDivInt`）、无墙钟与隐式随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `pnpm exec vitest run apps/game/src/runtime apps/game/src/storage --config vitest.config.ts --project node`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-kernel-prep.md`（≤ 70 行）：第 3 节列新增类型、拒绝码、钩子机制与 schema 4 字段；第 6 节列因版本号更新的 golden / 测试；第 7 节写给 shop-core、explore-walk、explore-facility 的交接——各自该替换哪个桩文件、钩子怎么注册。
