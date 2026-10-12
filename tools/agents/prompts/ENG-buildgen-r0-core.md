# 本任务：城镇 3D 古建 · 网格器骨架 `packages/render/src/buildgen`（类型、网格构建器、图元、墙体开洞、几何检查、哈希、配方注册与桩）

**第一个动作**：打开 `docs/tech/16-town-3d-spec.md` §1、§5、§6.2、§6.7、§13.1（本任务那一行），再看 `packages/render/src/region/objects.ts`（现有占位盒子建筑与 Bayer 抖动淡出写法），读完直接动手；不要先写计划，写完一个文件就跑它的测试。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（render 不算玩法规则；热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10）：城镇建筑改为**代码生成的 3D 古建**，门窗柱檐按真实尺寸，进屋时屋顶与朝镜头的墙剖开、原地走进室内；镜头可 Q/E 四向旋转。生成分三层：规划器（`packages/data/src/build/town-plan`，整数、定可走性，另一任务）→ **网格器**（本任务起骨架，纯 TS、不 import three，在 Worker 里跑）→ 建筑层（three 适配，后续任务 r9）。本任务把网格器的地基打好，让后续配方 / 屋顶任务（r1–r8）只往各自的桩文件里填实现，互不冲突。

## 要做的事
1. **类型** `packages/render/src/buildgen/types.ts`：照 tech/16 §6.7 写出 `BuildingPlanView`（与 tech/15 §2.3 `TownBuildingPlan` 字段一一对应的结构镜像——render 不得 import `@tianshu/data`）、`BuildKitView`、`CityWallView`、`MeshPayload`、`CellPayload`、`Recipe`、`RecipeSink`、`BuildingLayerInput`、`BuildingLayer`、`BuildingLayerStats`、`BuildingMeasure`，以及 `cutFacadeMask(yawDeg)` 的声明（实现放 r9，这里先导出桩：抛 `BUILDGEN_NOT_IMPLEMENTED`）。`packages/render/src/buildgen/index.ts` 只导出类型与 `generateCells`（见 5）。
2. **网格构建器** `mesher/core/buffer.ts`：按 tech/16 §6.2 的 36 B 顶点格式（`position` f32×3、`normal` i8×4 归一化、`uv` f32×2（沿表面米数）、`aMat` u8×4（层、AO、标志、立面掩码）、`aUnit` u16×2（单元号、局部高度 cm）、`aTint` u8×4）分别写入外壳 / 屋顶两套可增长的类型化数组；`finish()` 产出 `MeshPayload`（只含类型化数组，可 `postMessage` 转移）；顶点数 > 65535 时自动用 `Uint32Array` 索引；包围盒写进 `bounds`。
3. **图元** `mesher/core/prims.ts`：带局部 → 世界矩阵（四分之一转 yaw 0..3 按 tech/16 §4.1 表，单测四种情况）的 `box`、`prism`（n 边柱，柱子用）、`quad`、`extrudeAlong(polyline, profile)`（屋脊 / 城墙用）；法线向外；UV 按米。
4. **墙体开洞** `mesher/core/openings.ts`：输入墙矩形 `[0, L] × [y0, y1]`、厚 t、洞口列表 `{ x0, x1, y0, y1 }[]`；按竖条分解成带内外面的盒子，只在洞口边与墙端出侧面；**不用布尔运算**；面积守恒（墙 − 洞 ±0.1%）、洞内 0 三角。
5. **生成入口** `mesher/generate.ts`：`generateCells(plans, kit, lod, cellSizeM): CellPayload[]`——按占地中心把方案分到世界对齐格，逐栋查 `recipes/index.ts` 的配方注册表（`hall`、`storeyed`、`stall`、`adobe`、`compound`、`pagoda_dense`、`pagoda_oct`、`citywall`、`gate`），本任务每个配方是桩：画一个与占地等大、高 = `roof.eaveMm` 的盒子壳 + 一个脊高的屋顶盒（屋顶顶点进屋顶缓冲），并写正确的单元号与立面掩码——让下游可以先把整条链跑通。`mesher/roof/index.ts` 先放屋顶式样分派的桩。
6. **几何检查** `mesher/core/inspect.ts`：实现 tech/16 §5.4 的 INV-1（包含）、INV-3（门洞盒内无三角）、INV-5（单元号与立面位一致）三个检查函数，输入 `MeshPayload` + 方案，返回诊断列表；INV-2 / INV-4 / INV-6 先导出桩（r1 实现）。
7. **哈希** `mesher/core/hash.ts`：对位置量化到 0.1 mm 后的全部属性做稳定哈希（FNV-1a 32 或 64 皆可，写明），用于确定性与主线程 / Worker 对拍。**rng** `mesher/core/rng.ts`：splitmix32 / mulberry32，与 tech/16 §4.1 的子流约定一致。
8. **迷你方案** `buildgen/testing/mini-plans.ts`：手写 6 个方案（6×5 店铺 yaw 0、6×5 民居 yaw 1、10×8 客栈 yaw 2、3×2 摊位 yaw 3、12×10 寺殿 yaw 0、西域民居 yaw 1），字段齐全、单位 mm，供本任务与后续任务测试用。
9. **建筑层桩** `buildgen/three/layer.ts`：导出 `createBuildingLayer(input)`，本任务只返回抛 `BUILDGEN_NOT_IMPLEMENTED` 的桩（r9 实现）。

## 测试（`packages/render/src/buildgen/**/*.test.ts`，node 项目）
命名用例至少：`mesher/**` 下没有 `three` 的 import（读源码文本断言）；四分之一转 4 种情况的点与法线映射；`openings` 面积守恒 ±0.1% 与洞内 0 三角（含两洞相邻、洞贴墙端两种边界）；外法向点积 > 0.99；顶点步长 = 36 B；`MeshPayload` 所有字段都是类型化数组；6 个迷你方案经 `generateCells` 后 INV-1 / INV-3 / INV-5 无诊断；同输入两次哈希相同、改一个顶点哈希不同；> 65535 顶点切到 Uint32 索引。

## 约束
- 只写：`packages/render/src/buildgen/{index,types}.ts`、`packages/render/src/buildgen/mesher/core/**`、`packages/render/src/buildgen/mesher/recipes/**`、`packages/render/src/buildgen/mesher/roof/index.ts`、`packages/render/src/buildgen/mesher/generate.ts`、`packages/render/src/buildgen/three/layer.ts`、`packages/render/src/buildgen/testing/mini-plans.ts`、对应 `*.test.ts` 与本任务报告。
- **不改** `packages/render/package.json`（`./buildgen` 子路径导出由 ENG-town2-chunks 统一加）、`apps/game/**`、`tools/perf/**`。
- 网格器不 import three；不新增依赖；不用浮点随机；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用，随机用例用测试内固定种子 mulberry32。
- 包级 `pnpm --filter @tianshu/render test` 会带上 rig CPU 性能门（只在负载低时稳定），若因负载失败如实报告负载，不得放宽或跳过。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r0-core.md`（≤ 70 行）：第 3 节写顶点格式、立面掩码位、四分之一转矩阵、哈希算法与量化规则；第 7 节写给 r1–r9 的交接：每个配方 / 屋顶式样的桩文件名、`RecipeSink` 用法、检查函数怎么调。
