# 本任务：城镇 3D 古建 · 建筑层 `BuildingLayer`——分格合批、`static-lit` 自写材质、状态纹理、屋顶淡出与剖切三态、透视圈、门扇、招牌、室内 LRU、暗角、拾取、统计、上下文恢复 / 释放

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r0-core.md`、`ENG-buildgen-r1-hall-body.md`、`ENG-buildgen-r2-roof-a.md` 的第 3、7 节（`MeshPayload / CellPayload` 字段、36 B 顶点格式、立面掩码位、单元号约定、`generateCells`），再读 `docs/tech/16-town-3d-spec.md` §6（全部）与 §7，打开 `packages/render/src/buildgen/{types,index}.ts`、`packages/render/src/buildgen/three/layer.ts`（r0 的桩）、`packages/render/src/region/objects.ts`（现有 Bayer 抖动淡出写法）、`packages/render/src/core/context-guard.ts`（上下文丢失 / 恢复）、`packages/render/src/lighting/time-of-day.ts` 与 `packages/render/src/quality/tiers.ts`（`RenderQualitySource`）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（render 不算玩法：剖切态由 core 投影决定，render 不判"在屋内"；热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10，逐字）：「希望用threejs做一个能进入建筑的游戏体验。」作者拍板：建筑由代码生成 3D 古建，原地走进屋（不切地图），镜头 Q/E 四向旋转；走进店里时屋顶和朝镜头的墙剖开、屋外变暗，能看见柜台和掌柜。网格器（r0–r8，纯 TS）已能产出每格的外壳 / 屋顶类型化数组；本任务把它们变成 three 对象，并实现全部"看得见的状态"：屋顶淡出、剖墙、透视圈、门扇开合、招牌、室内显隐、暗角。

## 要做的事
1. **`static-lit` 材质**（`packages/render/src/materials/static-lit/**`，tech/02 §8.5 模块 #2）：自写 `ShaderMaterial` + 自己的 `#include` 片段（`lighting`：半球光 + 太阳的平滑 Lambert，toon 阈值关；`dither`：4×4 Bayer；`packing`：36 B 顶点属性解包）；结构性 define 只有 `ROOF_FADE`、`ALPHA_TEST`、`DEPTH_ONLY`；**不用 `onBeforeCompile`**、运行中不设 `needsUpdate`（档位切换除外）；共享 IsoLit uniform 对象（太阳方向 / 颜色、半球天色 / 地色 #6b5a45、时辰），由 `setTimeOfDay` 类接口一次更新、所有建筑材质共用。
   - 顶点属性：`aMat`（层、AO、标志、立面掩码）、`aUnit`（单元号、局部高 cm）、`aTint`（色偏 / 灯光）；`uv` 为米，乘各层 `repeatM`；贴图层用一张 `DataArrayTexture`（层数一次分配到最终值），贴图未到时用纯色占位（`LayerTextureSource` 接口，缺省 = 占位色表）。
   - 状态纹理采样：`256 × ceil(units/256)` RGBA8 `DataTexture`；R 屋顶淡出、G 剖墙进度、B 室内可见 / 窗光、A 高亮。
   - 剖墙（外壳着色器）：片元若 `aMat.flags` 含"可剖候选"且其立面掩码与 `cutFacadeMask` 相交、且 `dot(立面法向, 相机后向 XZ) > 0.2`、且局部高度 > 剖切高度（随 G 从正脊降到 1.0 m）→ discard；背面画成平的顶面色（墙体截面看起来是实心）。
   - 屋顶（`ROOF_FADE`）：按 R 做 Bayer 抖动淡出；淡出时**仍写阴影**（深度材质不淡出）。
2. **`cutFacadeMask(yawDeg)`**（替换 r0 的桩，放 `three/cutaway.ts` 并由 `types.ts` 的声明指向）：45 → S|E、135 → S|W、225 → N|W、315 → N|E；跨 90° 平滑（转镜头 350 ms 过程中按着色器同一判据给出相同结果）。
3. **`createBuildingLayer(input)`**（替换 `three/layer.ts` 的桩，实现 tech/16 §6.7 的 `BuildingLayer` 全部方法）：
   - 分格：调用 `generateCells(plans, kit, lod, cellSizeM)`（本任务用主线程 `generator: 'inline'`；Worker 是 r10）；每格 2 个 `Mesh`（外壳、屋顶），由近到远、**每帧最多上传 1 格**；按包围盒剔除；LOD 与格尺寸按档位（低 / 中 16 m + LOD1，高 / 极致 32 m + LOD0）。
   - `setCutaway(index, mode)`：0 关；1 屋顶与上层 250 ms 抖动淡到 0、显出室内；2 在 1 的基础上剖墙到 1.0 m、隐藏被剖立面上的门扇与招牌、开暗角（屋外暗 30%、羽化 24 px）；减少动效时瞬切。
   - `setCameraYaw(deg)`、`setFocusOcclusion(focus, radiusM)`（其他楼挡住主角时局部透视圈）、`update(dt, reducedMotion)`（推进状态纹理动画、门扇开合：玩家 1.8 m 内绕铰链开）、`pick(raycaster) → 单元号 | −1`（按占地 × 基底到正脊的包围盒）、`occludes(p)`、`measure(index)`。
   - 门扇：实例化（≤ 3 种）；招牌：实例化四边形 + 图集 UV（`signAtlas` 缺省时用纯色牌）；室内：每个打开的建筑 1 个批，LRU 4（低档 2），本任务室内几何可为空批（家具是 i1 / r8），但 LRU 与显隐逻辑要实现。
   - `restore()`：上下文恢复后用主线程保留的 CPU 副本重建 GPU 资源；`dispose()` 幂等。
   - `stats`：drawCalls、triangles、cells、visibleCells、units、interiors、pendingCells、geometryBytes、textureBytes、lastCellMs。
4. **`BatchStrategy` / `PickStrategy` / `LayerTextureSource` / `SignTextSource`** 只定义接口与缺省实现（合并几何 / 包围盒 / 占位色 / 纯色牌），不引入 BatchedMesh、three-mesh-bvh 或任何新依赖。

## 测试（`packages/render/src/buildgen/three/*.test.ts`、`packages/render/src/materials/static-lit/*.test.ts`，node 项目，模拟渲染器）
命名用例：
- 每个可见格恰 2 draw（外壳 + 屋顶）；屋顶顶点的单元号属性与方案一致。
- 态 2：模拟时钟推进 250 ms 后该单元 R → 0（屋顶淡尽）、G → 1（剖墙到 1.0 m）；减少动效时一帧内到位；态回 0 时反向恢复。
- `cutFacadeMask`：45 → S|E、135 → S|W、225 → N|W、315 → N|E；从 45 连续转到 135 的过程中，任一中间角度下着色器判据（JS 镜像函数）与掩码一致。
- 室内 LRU：依次打开 5 栋 → 只保留最近 4 个批（低档 2）；被淘汰的批 `dispose` 一次。
- 每帧最多上传 1 格：首次加载 N 格需 N 帧完成，`pendingCells` 递减。
- **预热后 `update()` 零分配**（`node:inspector/promises` HeapProfiler 采样，照 `packages/render/src/dressup/actor-runtime.test.ts` 的写法）。
- `dispose()` 幂等（调两次不抛、GPU 资源各释放一次）；`restore()` 后几何与状态纹理内容与丢失前一致。
- 程序缓存键固定：同档位下创建两个层，材质程序键相同（不会因建筑数变化重编译）。
- 源码断言：`buildgen/three/**` 与 `materials/static-lit/**` 不含 `onBeforeCompile`、`BatchedMesh`、`needsUpdate = true`（档位切换函数除外，需在注释标明）。

## 约束
- 只写：`packages/render/src/buildgen/three/**`、`packages/render/src/materials/static-lit/**`（含测试）、`packages/render/src/buildgen/types.ts`（只许把 `cutFacadeMask` 声明改为从 `three/cutaway.ts` 再导出，或新增可选字段）与本任务报告。
- 不改网格器（`mesher/**`）、不改 `region/**`（接入区域场景是 ENG-town2-render-ports / 试点整合）、不改 `packages/render/package.json`、`apps/game/**`、`tools/perf/**`；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。包级 render 测试含 rig CPU 性能门，负载高时失败要如实报告负载，不得放宽或跳过（本任务定向命令不含性能门）。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/buildgen packages/render/src/materials --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-buildgen-r9-layer.md`（≤ 80 行）：第 3 节写材质 define 与 uniform 表、状态纹理通道、剖墙判据、每格 draw 与三角实测（6 个迷你方案 + 可用的试点方案）、零分配采样；第 7 节写给 r10（Worker 接哪个生成入口、CPU 副本怎么留）、ENG-town2-render-ports（区域场景如何创建层、`setCutaway` 与 `insideBuildingId` 的对应）、l1（`/town-lab` 要用的 `measure` / `stats`）与美术线（`LayerTextureSource` 的层顺序与尺寸）的交接。
