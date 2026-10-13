# 本任务：城镇探索 v2 · render 两个端口的占位实现——`BuildingLayerPort`（盒子壳 + 剖切三态）与 `ActorPort`（试点 GLB、真实身高），接进区域场景

**第一个动作**：读 `tools/agents/reports/ENG-town2-render-core.md` 第 3、7 节（`setInsideBuilding` 的转发点、拾取、`setWalk`）与 `tools/agents/reports/ENG-town2-heights.md` 第 7 节，再打开 `docs/tech/15-town-explore-v2-spec.md` §5（端口接口块）、`docs/tech/16-town-3d-spec.md` §6.4（剖切三态与"朝镜头"立面表）、§6.7、§9.1，以及 `packages/render/src/region/{scene,objects,types}.ts`（现有占位盒子建筑与 Bayer 抖动淡出）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`（render 不判"在屋内"：剖切态由 core 投影 `insideBuildingId` 决定；热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10，逐字）：「希望用threejs做一个能进入建筑的游戏体验。」正式的 3D 古建（tech/16 生成器 + 建筑层）与 3D 人物（actor3d）还在别的任务里做；为了让 core、页面装配、小地图先端到端跑通，区域场景通过两个**端口**接建筑与人物，本任务给出与正式实现**同接口**的占位实现：建筑 = 按方案占地画的盒子壳（墙 + 屋顶两层、门洞留空），能按剖切三态淡出屋顶、把朝镜头的墙降为 1 m 矮墙；人物 = 试点 GLB 按数据身高缩放、沿路线匀速走。正式实现到位后只换端口实例，场景与页面代码不动。

## 要做的事（`packages/render/src/region/ports/**` + `region/scene.ts` 接线）
1. **端口接口**（`ports/types.ts`）：照 tech/15 §5 原样声明 `BuildingLayerPort { create(input): Promise<BuildingLayer> }` 与 `ActorPort`（`spawn / despawn / setPose / setEquipment / update / pick / restore / dispose / stats`）；`BuildingLayer`、`BuildingLayerInput` 类型从 `../../buildgen/types`（r0 已定）再导出，不另写一份。
2. **占位建筑层** `ports/placeholder-buildings.ts`：每栋按方案 `footprint / yaw / roof[1]（檐高）/ roof[2]（脊高）/ entrances` 画外壳盒（四面墙，入口处按 `[side, offsetMm, widthMm]` 留门洞，门洞高 2100）+ 屋顶盒（独立 mesh 或独立 group，便于淡出）；`setCutaway(index, mode)`：0 关、1 屋顶 250 ms 淡到 0（Bayer 抖动，复用 `objects.ts` 的写法）、2 再把朝镜头的立面（`cutFacadeMask(yawDeg)` 的结果，与 tech/16 §6.4 表一致：45 → S|E、135 → S|W、225 → N|W、315 → N|E）在 250 ms 内降到 1.0 m 并开屋外暗角（暗 30%）；减少动效时瞬切；`setCameraYaw`、`pick`（占地包围盒）、`occludes`、`measure`、`restore`、`dispose`（幂等）。所有建筑合成每格 ≤ 2 draw（外壳一批、屋顶一批，用顶点属性带单元号 + 小型状态纹理，不要每栋一个 mesh）。
3. **占位人物端口** `ports/placeholder-actors.ts`：主角用试点 GLB（`npc_zhujue__ch00_m/f`，按性别），NPC 用 `npc_generic_m/f`；**每个 URL 只解析一次**，克隆用 `SkeletonUtils.clone` 共享几何 / 材质；按 `heightM` 用头顶骨骼缩放（heights 任务的 `stature: 'headTop'`）；`setPose(id, x, y, z, yawRad, motion, speedMps)` 只设目标，`update(dt)` 内匀速插值与转身限速（≤ 540°/s），动画播放率 = 速度 ÷（原生速度 × 身高），夹 0.80–1.45（原生速度用 `battle/model-stage.ts` 的常量）；圆斑影子 1 draw（实例化）；`pick` 用胶囊体（半径 0.35、高 = heightM）。
4. **接线**（`region/scene.ts`）：`createRegionScene` 的选项新增可选 `buildingPort?`、`actorPort?`（缺省用占位实现）；`setInsideBuilding(index)` → `buildingLayer.setCutaway(index, 2)`（离开时把上一栋设回 0）；`pickBuilding / pickActor` 改由端口提供；转镜头时调 `setCameraYaw`。旧的占位盒子建筑（`objects.ts` 里的）在端口模式下不再创建。

## 测试（`packages/render/src/region/ports/*.test.ts`、`packages/render/src/region/*.test.ts`，node 项目，模拟渲染器）
命名用例：
- 剖切三态随 `setInsideBuilding` 与偏航变化：态 2 下 4 个偏航各自降下的立面集合与 tech/16 §6.4 表一致；离开建筑恢复态 0。
- 250 ms 动画：模拟时钟推进后屋顶透明度 → 0、剖墙高度 → 1.0 m；减少动效时一帧到位。
- 门洞：盒子壳在入口位置留出 ≥ 1200 × 2100 的空洞（射线从门洞中心穿过不命中外壳）。
- draw：N 栋建筑在同一格内外壳 + 屋顶恰 2 draw。
- 人物：同一 URL 生成 5 个 NPC 只解析一次（加载器计数）；`heightM = 1.66` 时头顶骨骼世界高 1.66 ±0.005 m；`setPose` 后 `update` 匀速（相邻帧位移相等 ±1%）；转身 ≤ 540°/s。
- 端口可替换：传入自定义假端口时场景调用其方法（调用记录断言），占位实现不被创建。
- `dispose()` 两次不抛、资源各释放一次；预热后 `update()` 零分配（HeapProfiler 采样，照 `packages/render/src/dressup/actor-runtime.test.ts`）。

## 约束
- 只写：`packages/render/src/region/ports/**`、`packages/render/src/region/scene.ts`、`packages/render/src/region/types.ts`（只新增可选字段）、`packages/render/src/region/*.test.ts`（只增改与本任务直接相关的用例）与本任务报告。
- 不改 `buildgen/**`、`actor3d/**`、`dressup/**`、`battle/**`、`apps/game/**`、`packages/render/package.json`；不新增依赖（`SkeletonUtils` 用 three 自带的 `three/examples/jsm/utils/SkeletonUtils.js`，确认它只进懒加载块、不进 render 主闭包）。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。包级 render 测试含 rig CPU 性能门，负载高时失败要如实报告负载，不得放宽或跳过（本任务定向命令不含性能门）。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/region --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-render-ports.md`（≤ 60 行）：第 3 节写两个端口的方法表与占位实现的取舍（每格 draw、状态纹理格式、人物缓存）、四偏航剖切实测；第 7 节写给试点整合（换正式 `createBuildingLayer` / `createActorPort` 时改哪一行）与 ENG-town2-explore-page（页面怎么把 `insideBuildingId` 交给场景）的交接。
