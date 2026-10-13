# ENG-town2-explore-graph 报告 · 城镇探索 v2 · core 探索图与 A*（类型化数组图缓存、二叉堆、多目标、吸附）

## 1. 摘要（3–6 行）

- 已实现冻结 `RegionMap` 身份缓存的稠密类型化数组探索图、整数二叉最小堆、单／多目标 A* 与点空地吸附。
- 新边遍历与旧 `regionEdges()` 在静态／动态合成图、坡道／跨沟图及真实长白山洞图逐格完全相等。
- 300 张固定种子随机图与暴力 Dijkstra 对拍通过，深水连续格沿用旧路径成形后拒绝语义。
- 未接命令、逐 tick 行走或公开入口；留给 ENG-town2-explore-walk 装配。

## 2. 产出（文件、行数、主要章节）

- 新增源码：`graph.ts` 231 行、`heap.ts` 92 行、`astar.ts` 255 行、`snap.ts` 107 行（Prettier 排版后）。
- 新增测试：`graph.test.ts` 205 行、`astar.test.ts` 276 行、`snap.test.ts` 137 行（Prettier 排版后）。
- 新增夹具：`__fixtures__/maps.ts` 81 行多 chunk 合成图工厂、真实编译图 JSON、`README.md` 重出说明。
- 修改 `region-runtime.ts`：仅给 `query()`、`regionEdges()` 加 `export`，行为未改。
- `pnpm install --frozen-lockfile`：通过；lockfile 未改。
- `pnpm --filter @tianshu/core lint`：通过；定点 `prettier --check` 通过。
- `pnpm --filter @tianshu/core test`：58 文件、622 测试通过（9.14 秒）。
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`：复跑后 250 文件、2079 测试及类型、内容、构建、包体门全部通过；首次仅既有 dressup 测试在高负载下超时，单独复跑 156.34 秒通过。

## 3. 关键结论与数值

- 下标：`(r-rMin)*width+(q-qMin)`；高度／代价／坡道／建筑用 `Uint8Array`，地形用 `Uint16Array`。
- flags 位：0 有效、1 可站、2 窄、3 危险、4 不透视、5 blocked、6 沟、7 深水；无效槽和石壁不透视，blocked 透视。
- 缓存键为地图对象身份 + `qgTier/swim/dynamicRev`；动态格覆盖地形／高度，与旧 `query()` 同一有效语义：被覆盖的格可站性和不透视都只看新地形，静态 blocked 标记不再生效；未覆盖的静态 blocked 格不可站、可透视。
- 堆决胜为 f → h → r → q；`position:Int32Array` 保证节点仅一份，`pushOrDecrease` 从原位上浮，pop／clear 同步位置；邻居按 `HEX_DIRECTIONS`，仅严格更优 g 改父节点。
- 搜索工作区随图分配；seen／closed 用 uint32 代数计数复用，回绕时才清零。
- 多目标 h=`max(0,distance-range)`；终点还须可站、未占用、对锚点视线无石壁／无效槽。
- 吸附走环 0..4，环内 r → q；惰性缓存无向分量，最多检查 6 个可站候选。
- 一致处：普通步、坡道、高差、tier 宽度跨沟成本，以及动态地形／高度覆盖（含覆盖在静态 blocked 格上）均与旧实现一致。

## 4. 开放问题（附默认值）

- 默认 `dynamicRev` 由调用方保证单调且与动态格内容同步；相同 revision 不比较数组内容。
- 默认吸附候选数包括其他连通分量的可站格；第 7 个才连通也按规格拒绝。
- r2 审核后（协调者按 AR-110 接手）：动态覆盖按旧 `query()` 重算可站性与不透视。3×1 地图中央静态 blocked、动态覆盖为 `tr_pingdi` 时，新旧都从左格连到中央格、代价 1；覆盖成 `tr_shibi` 则不可站、不透视。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；本任务落实 tech/15 §4.1 与 AR-114，不需修改基准。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无文档修改；300 张随机图成本逐一等于 Dijkstra，返回路径逐边合法；审核给出的 8×8 decrease-key 反例 A*／Dijkstra 均为 23（修复前 A* 为 24）。
- 边集等价：合成平地、坡道／高差／跨沟、真实长白山洞及动态覆盖（含 blocked 格被覆盖）的每个有效格均与 `regionEdges()` 相等。
- 3 个定序 golden、缓存同一性、多目标视线、吸附六候选、源码整数禁令均通过。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ 图缓存／typed arrays／blocked 透视与石壁遮挡／动态覆盖均有命名测试。
- ✅ 二叉堆预分配、倍增、f → h → r → q 定序及堆内节点降键回归有测试。
- ✅ A* 占格、深水后检、范围 1／3 多目标及真实图 golden 通过。
- ✅ 吸附同分量、墙／水／异分量、六次失败均通过；源码无模板字符串键、原生除法或非确定性 API。
- ✅ ENG-town2-explore-walk：每次 `travelTo` 只调用一次 `findPath`／`findPathToAny`；活动 NPC 转节点集合传 `occupied`；地形／高度动态格增删改时 `dynamicRev + 1`。
- ✅ ENG-town2-perf-gates：复用 `fixtureMap()`／`rectangle()` 可得 7×5=35 chunks、35,040 格、最大 (218,159) 的 219×160 城。
