# 本任务：城镇探索 v2 · 会话层接线——`townEngine` 开关、进城前预载 v2 场景叶子、行走 tick 脏视图、`previewTravel` 查询、读档纠偏提示、正式 `exploreCommand`

**第一个动作**：读 `tools/agents/reports/ENG-town2-explore-facility.md`、`ENG-town2-explore-walk.md`、`TOOL-town2-sources-pipeline.md`、`TOOL-town2-worldmap-pilot.md` 的第 3、7 节，再打开 `apps/game/src/runtime/session.ts`（`preloadWorldMapTown` 约 L279、`preloadRegionMount` 约 L294、`contentForRegionState` 约 L310、`regionChanges` 约 L345、`restore` 约 L370）、`apps/game/src/runtime/{contracts,core-dispatch,worker-host,lazy-session}.ts`、`apps/game/src/game-controller.ts`、`apps/game/src/region/commands.ts`（把 `townCommand` 强转的旧写法）、`apps/game/src/runtime/transport-determinism.test.ts`（双宿主对拍写法），以及 `docs/tech/15-town-explore-v2-spec.md` §4.6、§4.7、§9；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（core 默认在 Worker 里跑、保留主线程回退；消息只传可序列化命令、事件与投影；apps/game 不得成为第二个规则层）。

## 背景
作者 AR-114（2026-10-10）：城镇并入区域引擎（v2），在开关后开发，闸门 C 通过后改为缺省。core 侧的行走、设施、出入城都已就绪；本任务让会话层能把 v2 城镇真正跑起来：从大地图进试点城前预载其场景叶子，行走时每个 tick 只发必要的脏视图，悬停时节流预览路线，读档时调用纠偏并给出"已把你挪到附近空地"之类提示。

## 要做的事（`apps/game/src/runtime/**`、`apps/game/src/game-controller.ts`）
1. **开关** `townEngine: 'v1' | 'v2'`：设置项（沿用现有设置存储）、开发面板、URL `?town=v1|v2`；闸门 C 前缺省 `v1`。它只决定 `worldmap/enter` 前预载哪份内容（v2 场景叶子或 v1 `content/town/*.json`）；core 按内容是否存在选择引擎，保持确定。**共存期存档**：在 v2 城里存的档，无论开关如何都按 v2 挂载（挂载中的区域内容总会加载）。
2. **预载**：`worldmap/enter` 目标节点有 `entry.scene` 且开关为 v2 → 预载该区域叶子（复用 `preloadRegion` 通道与 `mergeRegionContent`），然后派发；预载失败给出明确错误而非静默回退 v1。
3. **行走 tick 脏视图**：`world/tick` → `['hud']`，tick 前后存在行走时加 `'region'`；探索命令 → `['region']`；`shop/*` → `['hud', 'inventory']`（tech/15 §4.7）。动态投影只发 tech/15 §4.7 列的字段（`walk` 前 64 格等），静态投影每次挂载只发一次。
4. **只读查询** `world/previewTravel { target }`：会话级查询（与现有 `world/previewRegionPath` 同类），节流 8 Hz 由调用方做，会话保证 Worker / 主线程两种宿主结果相同。
5. **读档纠偏**：`restore()` 在校验后调用 core 的 `reconcileMountedScene`，`relocated = true` 时在投影里带一次性提示（文案放 `apps/game/src/runtime/session.strings.ts` 或现有提示机制），取代 `townRevision` 哈希检查——v2 城里存的档在城镇内容小改后仍能读出；v1 城保持现状。
6. **控制器**：正式的 `controller.exploreCommand(cmd)`（类型 = core 的 `ExploreCommand`），删掉 `apps/game/src/region/commands.ts` 里把 `townCommand` 强转的写法（只改该处调用，不重写区域页）。

## 测试（`apps/game/src/runtime/*.test.ts`，node 项目，需要 DOM 的文件首行 `// @vitest-environment happy-dom`）
命名用例：
- **双宿主一致**：同一城镇行走脚本（进大理 v2 → `travelTo` 药铺 → 120 个 tick → `steer` → `stop` → 交谈 → 出城）在 Worker 宿主与主线程宿主下最终状态哈希相同（照 `transport-determinism.test.ts`）。
- 开关：`?town=v2` 进试点城挂载 v2 场景；`v1` 仍走旧城镇；非试点城在 v2 下按 `entry.scene` 缺省处理（`MAP_NODE_CLOSED` 或 v1，按 core 行为断言）。
- 脏视图：纯 tick 无行走只有 `hud`；行走中加 `region`；`shop/buy` 为 `hud + inventory`。
- 读档纠偏：构造玩家站在被内容改成墙的格上的 v2 存档 → 读档成功、位置挪到最近可站格、投影里有一次性提示；再读一次（位置已合法）无提示。
- `previewTravel` 两宿主结果相同，不改状态（状态哈希前后一致）。
- session 静态闭包仍不含 `world/explore/**` 与 `economy/shop-*`（沿用现有断言）。

## 约束
- 只写：`apps/game/src/runtime/**`（不含 `session-projection.ts`——大地图线在用，只读调用）、`apps/game/src/game-controller.ts`、`apps/game/src/region/commands.ts`（只改强转那一处）与本任务报告。
- 不改 `packages/**`、页面（`*.vue`）、`App.vue`、`worldmap/**`；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src/runtime --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-session-v2.md`（≤ 60 行）：第 3 节写开关的三个入口与优先级、预载流程、脏视图表、纠偏提示；第 6 节写双宿主对拍哈希；第 7 节写给 ENG-town2-explore-page（页面从投影取哪些字段、怎么发 `exploreCommand` 与 `previewTravel`）的交接。
