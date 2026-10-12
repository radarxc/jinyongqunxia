# 本任务：城镇 3D 古建 · 网格生成进 Worker——`buildgen.worker.ts`、客户端、形体模板缓存、时间切片；主线程 / Worker 哈希一致

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r9-layer.md` 第 3、7 节（建筑层调用哪个生成入口、CPU 副本怎么留、`generator: 'worker' | 'inline'`）与 `tools/agents/reports/ENG-buildgen-r0-core.md` 第 3 节（哈希算法与量化），再打开 `packages/render/src/buildgen/mesher/generate.ts`、`packages/render/src/buildgen/three/layer.ts`、现有 Worker 写法（`apps/game/src/runtime/worker-host.ts` 与 `packages/render/src/**` 里已有的 `new Worker(new URL(...))`，以仓库实际为准）与 `docs/tech/16-town-3d-spec.md` §6.6；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10）：城镇建筑由代码生成 3D 古建。整城生成（最坏西安 ch10 100 栋约 28.5 万三角）在桌面约 300 ms、手机估 1.2 s，放主线程会卡顿；所以网格器跑在 Worker 里，类型化数组转移不复制，主线程保留一份 CPU 副本供 WebGL 上下文恢复；Worker 失败时懒加载主线程网格器接替。很多建筑形体相同（同套件、同类型、同尺寸、同屋顶），按形体键缓存局部几何，合并时只套变换与每栋色偏，每城约 20–30 种。

## 要做的事（`packages/render/src/buildgen/`）
1. **`worker/buildgen.worker.ts`**：消息 `init(kit, lod)`、`cell(id, plans[])`、`interior(unit)`；回复 `CellPayload` / 室内 `MeshPayload`，全部类型化数组用 transfer 列表转移；异常回 `{ error }` 不让 Worker 崩。
2. **`worker/client.ts`**：`createBuildgenClient({ mode: 'worker' | 'inline' })`——`worker` 模式 `new Worker(new URL('./buildgen.worker.ts', import.meta.url), { type: 'module' })`；请求按格排队、由近到远；Worker 启动失败或运行中报错 → 懒加载主线程网格器接替并在 `stats` 里记一次回退；`dispose()` 终止 Worker（幂等）。
3. **`mesher/shape-cache.ts`**：形体键 = 哈希（套件、类型、局部 w / d、层数、屋顶元组、入口、部件、外部家具、`seed % variants`、LOD）；缓存局部坐标几何；合并时套四分之一转与平移、写每栋单元号与种子色偏；有无缓存产出哈希相同。
4. **时间切片**（inline 模式）：每帧生成预算 4 ms，超出则让出到下一帧（用调用方给的时钟，测试可注入）。
5. **接线**：`three/layer.ts` 的 `generator` 选项接到 client（只改创建 client 的那几行；缺省 `worker`，Node 测试环境用 `inline`）。

## 测试（`packages/render/src/buildgen/__tests__/worker-parity.test.ts` 等，node 项目）
命名用例：
- **对拍**：对 `testing/pilot-plans.json` 的每个格，主线程直接 `generateCells` 与"模拟通道"（同进程里用 `MessageChannel` 跑 worker 模块的消息处理函数，类型化数组经 `structuredClone` + transfer 语义）产出的哈希逐格相等。
- 形体缓存：吐鲁番 ch10 全城的不同形体数 ≤ 25；有缓存与无缓存（缓存关闭开关）哈希相同；缓存命中计数 > 0。
- 回退：模拟 Worker 构造抛错 → 自动走主线程且结果哈希相同、`stats.fallbacks = 1`。
- 时间切片：注入时钟让每格耗时 3 ms → 每帧最多 1 格（预算 4 ms），队列按距离由近到远。
- `dispose()` 终止 Worker 一次且幂等；转移后主线程 CPU 副本仍可用于 `restore()`。

## 约束
- 只写：`packages/render/src/buildgen/worker/**`、`packages/render/src/buildgen/mesher/shape-cache.ts`、`packages/render/src/buildgen/mesher/generate.ts`（**只许**接入形体缓存的调用）、`packages/render/src/buildgen/three/layer.ts`（**只许**改 client 创建处）、`packages/render/src/buildgen/__tests__/worker-parity.test.ts`（及本任务新增测试）与本任务报告。
- 不改配方、屋顶、部件、`core/**`；不改 `packages/render/package.json`、`apps/game/vite.config.ts`（Worker 块名与预算由 ENG-town2-chunks 管，发现块名不对写进报告）；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含 `pnpm size`：`render-buildgen-worker` 块 ≤ 24 KiB gzip）

## 报告
`tools/agents/reports/ENG-buildgen-r10-worker.md`（≤ 50 行）：第 3 节写消息协议、形体键、三座试点城的形体数与缓存命中率、Worker 块体积；第 7 节写给 r11（性能门要测的入口）与试点整合（区域场景创建建筑层时选 worker 模式的位置）的交接。
