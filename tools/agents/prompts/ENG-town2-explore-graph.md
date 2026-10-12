# 本任务：城镇探索 v2 · core 探索图与 A*——类型化数组图缓存、二叉堆 A*、多目标搜索、点空地吸附（纯函数）

**第一个动作**：打开 `packages/core/src/world/region-runtime.ts`（`query()` 约 L60、`regionEdges()` 约 L96、旧搜索 `regionPath()` 约 L120、`previewRegionPath()` 的深水连续格后检约 L150、视线 `hexLineBetween` 约 L214）、`packages/core/src/world/region-codec.ts`（`decodeRegionMap`）、`packages/core/src/hex/`（`HEX_DIRECTIONS`、`evaluateStep`、`hexDistance`），再读 `docs/tech/15-town-explore-v2-spec.md` §4.1 与 `tools/agents/reports/ENG-town2-regionmap-ext.md` 第 3、7 节（chunk 新增 `surface / blocked / building` 层的解码结果）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/core/CLAUDE.md`（core 只用整数、禁 `/`、禁墙钟与隐式随机、排序必须带比较器）。

## 背景
作者 AR-114（2026-10-10，逐字）：「点击小地图可以自动寻路。」城镇并入区域引擎后，一座城一个区域场景（最大约 219×160 槽、约 2 万可站格）。现有区域寻路每次查询都整图解码、每个命令跑两遍、开放表每轮整体排序，城镇规模下不可用。本任务只做**纯函数**的图与搜索；逐 tick 行走、命令处理器、交互列表是后续任务 ENG-town2-explore-walk。

## 要做的事（`packages/core/src/world/explore/`）
1. **`graph.ts`** `getExploreGraph(map, qgTier, swim, dynamicTiles, dynamicRev)`：
   - 以冻结的 `RegionMap` 对象为键的 `WeakMap` 缓存（同一地图对象 + 同一 `qgTier / swim / dynamicRev` 返回同一图实例）；不进存档。
   - 稠密下标 `index = (r − rMin) × width + (q − qMin)`；类型化数组：高度、地形下标、标志位（可站 / 窄 / 危险 / 不透视 / `blocked` / 有效槽）、移动代价、坡道位（6 位）、建筑序号（`building` 层，0 = 室外）。
   - `blocked` 格：不可站、**可透视**；`tr_shibi` 与无效槽：不可透视。动态格覆盖地形与高度（与 `query()` 的覆盖规则一致）。
   - 只用整数；构建时一次解码，之后零字符串键。
2. **`heap.ts`**：存 `Int32` 节点号的二叉最小堆；比较键依次为 f → h → r → q（全部整数）；预分配并按需一次性加倍扩容。
3. **`astar.ts`**：
   - 邻居按 `HEX_DIRECTIONS` 顺序展开；**边集必须与 `regionEdges()` 完全一致**（普通步、坡道、高差、轻功跨沟的落点与代价），被占格（活动 NPC）不可进入、目标永不是被占格。
   - g / parent / closed 数组随图分配，用**代数计数**复用（每次搜索代数 +1，不清零）；严格更优才替换父节点；h = `hexDistance(n, goal)`（每格代价 ≥ 1，可采纳）。
   - 深水后检与旧语义相同：找到路径后检查连续 `tr_shenshui` 格数（qgTier 3 > 3、tier 4 > 6 即无路）。
   - `findPath(graph, start, goal, occupied) → { path: Int32Array 节点序列, cost } | null`。
   - 多目标 `findPathToAny(graph, start, anchorHex, range, occupied)`：`h = max(0, hexDistance(n, anchor) − range)`；目标集 = 距锚点 ≤ range、可站、从该格到锚点视线不被挡（`blocked` 可透视）。
4. **`snap.ts`** 点空地吸附：围绕目标走环 0..4，环内按 (r, q) 序取第一个可站且与起点同一无向连通分量的格（连通分量标号随图缓存，按需惰性计算一次）；最多试 6 个候选，否则返回 `REGION_PATH_BLOCKED`（拒绝码由 kernel-prep 已加）。
5. **测试夹具** `packages/core/src/world/explore/__fixtures__/`：用测试内构造的合成图（写法照 `packages/core/src/command/region-handler.test.ts` 的 `scene()`）+ 至少 1 张由 `packages/data/src/build/tiled.ts` 的 `compileTiledMap` 从 `content/world/regions/**/*.tmj` 编出的真实区域图（编译结果存成 JSON 夹具，附一行重出说明）。

## 测试（`packages/core/src/world/explore/*.test.ts`，命名用例）
- **最优性**：300 张固定种子随机图（mulberry32，含坡道、高差、轻功跨沟、被占格、深水）上，`findPath` 的代价与暴力 Dijkstra 相同，路径逐步合法。
- **边集等价**：在合成图与真实图的每个格上，新图的出边（目标格 + 代价）与 `regionEdges()` 完全相同（允许为测试在 `region-runtime.ts` 给 `regionEdges` / `query` 加 `export`，不得改其行为）。
- **定序金样**：3 个夹具上的路径逐格锁定（等价最优路径时按 f → h → r → q 决胜）。
- **缓存同一性**：同参数返回同一实例；`dynamicRev` 变化重建；不同 `qgTier` 不共享。
- **多目标**：到 NPC 交互范围 1、到设施店员范围 3 的终点满足距离与视线；`blocked` 柜台不挡视线、石壁挡。
- **吸附**：点在墙里 / 水里 / 另一连通分量 → 取最近同分量格；6 次失败 → `REGION_PATH_BLOCKED`。
- **零字符串键**：构建与搜索热路径源码里没有模板字符串键（读源码文本断言 `graph.ts` / `astar.ts` 无 `` `${`` ）。
- 禁用运算：`world/explore/**` 源码无 `/`、`Math.random`、`Date`、浮点字面量参与代价（读源码断言）。

## 协调者裁定（2026-10-12，r2 审核后；审核以此为准）
- **动态覆盖语义与旧 `query()` 一致**：被动态格覆盖的格，可站性按新地形 `terrainStandable()`，不透视按新地形；静态 `blocked` 标记对被覆盖格不再生效，图中清掉 `EXPLORE_BLOCKED`。窄、危险两个标记沿用静态解码。未被覆盖的静态 blocked 格仍是不可站、可透视（tech/15「可通视不可站」）。
- **格式**：本任务新建的 `explore/**` 文件须通过 `prettier --check`。`region-runtime.ts` 的基点本身没按 Prettier 排版，本任务只加两处导出，保持最小 diff，不整文件重排。

## 约束
- 只写：`packages/core/src/world/explore/{graph,heap,astar,snap}.ts`、`packages/core/src/world/explore/__fixtures__/**`、`packages/core/src/world/explore/*.test.ts`、`packages/core/src/world/region-runtime.ts`（**只许**给 `regionEdges` 与上下文构建函数加 `export`）与本任务报告。
- 不改 `world/explore/types.ts`（kernel-prep 定型；图相关类型放 `graph.ts`）；不接命令、不改 `world/walkTo` 与旧 A*（退役前回放不变）；不改 `packages/core/src/index.ts` 导出布局；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用；随机用例用测试内固定种子 mulberry32。
- 计时门（219×160 合成城的建图 / 寻路 P95）是 ENG-town2-perf-gates 的事，本任务不加计时断言。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm --filter @tianshu/core lint`
- `pnpm --filter @tianshu/core test`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-explore-graph.md`（≤ 60 行）：第 3 节写下标与标志位布局、决胜规则、代数复用、吸附规则；第 6 节写 300 张随机图对拍与边集等价的结果；第 7 节写给 ENG-town2-explore-walk（`travelTo` 每次只调一次 `findPath / findPathToAny`、如何传占位、`dynamicRev` 何时 +1）与 ENG-town2-perf-gates（合成城夹具怎么复用）的交接。
