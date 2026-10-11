# 本任务：城镇探索 v2 · render 区域场景扩展——px 缩放、弹簧跟随镜头、按 tick 航位推算行走、路线带与终点、镜头基向量与视野四边形、地面层占位色

**第一个动作**：打开 `packages/render/src/region/scene.ts`（`clampZoom` 约 L22、`placeCamera()` 约 L199、指数插值移动 `lerp` 约 L301、`setZoom` 约 L371）、`packages/render/src/region/types.ts`（`RegionScene` 接口约 L92）、`packages/render/src/camera/iso-camera.ts`（`IsoCameraRotation`），再读 `docs/tech/15-town-explore-v2-spec.md` §5、§4.7（动态投影里 `walk` 的字段）与 `tools/agents/reports/ENG-town2-heights.md`、`tools/agents/reports/ENG-town2-regionmap-ext.md`、`tools/agents/reports/ENG-town2-chunks.md` 的第 7 节；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md` 与 `packages/render/CLAUDE.md`（render 不算玩法：不寻路、不判可达、不判"在屋内"；热路径不分配；GPU 资源有主并可重复 dispose）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配……右上方应该提供小地图，点击小地图可以自动寻路。缩放要支持键盘快捷键」。城镇并入区域引擎后由 `packages/render/src/region` 渲染；core 按 10 Hz tick 推进行走（每 tick 推进 `mmPerTick`），render 要在两 tick 之间**匀速**插值（现在是指数插值，脚底打滑、终点拖尾），镜头要平滑跟随，并给小地图提供镜头基向量与视野四边形。3D 古建与 3D 人物的正式实现（tech/16）走端口，占位端口是下一个任务 ENG-town2-render-ports。

## 要做的事（`packages/render/src/region/**`）
1. **缩放**：`setZoomPx(px, animate?)`（单位：屏幕 px / 米，夹到 40–112；`animate` 时 200 ms 缓动，减少动效时瞬切）；保留旧 `setZoom(scale)` 作为 `setZoomPx(80 × scale)` 的别名（`RegionPage.vue` 还在用）。CameraHint 的 `zoom` 仍按相对 80 换算。
2. **镜头跟随**（tech/02 §1.8）：临界阻尼弹簧 ω = 10（`x'' = −2ωx' − ω²(x − target)`，半隐式欧拉，**固定 dt 下可复现**）；屏幕中央 20% 死区；沿移动方向前瞻 0.8 m；地图边界内缩 3 m 夹取；Q/E 转镜头时目标不跳。
3. **航位推算行走** `setWalk(walk: ExploreWalkView | null, worldTickAtMs: number)`：`ExploreWalkView` 是 render 自有的结构镜像（不 import core）：`{ path: readonly RegionHexPoint[] /* 前 64 格，path[0] 为当前格 */, progressMm, stepMm, mmPerTick, destination }`。帧间位置 = 沿折线从 `progressMm` 起按 `mmPerTick × 已过 tick 分数` 匀速推进（`HEX_STEP_MM = 1155` 对应 1 格），不越过 path 末端；朝向沿当前段方向、转身 ≤ 540°/s；`walk = null` 时停在当前格心。**删除**指数插值（`lerp(…, dt × 14)`）。
4. **路线带与终点**：`setPreviewPath(path)`（悬停预览，虚线淡色）与 `setDestination(hex | null)`（终点旗 / 圈）；路线带用一条预分配容量的带状几何（≤ 512 格），更新只改缓冲内容。旧 `setPath` 保留为 `setPreviewPath` 别名。
5. **给小地图的几何**：`getCameraBasis(out: Float32Array)` 写 `[rightX, rightZ, upX, upZ]`（屏幕右 / 屏幕上在地面 XZ 上的单位向量，x 东、z 南）；`getViewGroundQuad(out: Float32Array)` 写视野四角在地面上的 8 个数（左上、右上、右下、左下）。两者零分配。
6. **室内态接口**：`setInsideBuilding(index: number | null)`——本任务只保存状态并转给（后续的）建筑层端口，屋顶 / 墙的剖切由端口实现；render 不自己判断在不在屋内。
7. **拾取**：`pickActor(clientX, clientY, bounds)`、`pickBuilding(…)` 先实现为按占位包围盒 / 胶囊体的射线拾取（返回 id 或 null），端口到位后改由端口提供。
8. **地面层占位色**：chunk 有 `surface` 层时按地面类型给地形着色（街石、土路、室内木地板、院子砖地四种占位色，常量表写在 `terrain.ts`），无该层时行为不变。

## 测试（`packages/render/src/region/*.test.ts`，node 项目；用现有 `test-fixture.ts` 与模拟渲染器写法）
- 弹簧：固定 dt = 1/60 下 120 帧轨迹两次逐值相同；阶跃后无超调（临界阻尼）；死区内目标移动镜头不动；边界内缩 3 m。
- 航位推算：`mmPerTick = 135`、两 tick 间 10 个采样点间距相等（±0.5 mm）；跨格拐角沿折线；不越过末端；`walk = null` 停在格心；转身速率 ≤ 540°/s。
- 4 个偏航（45 / 135 / 225 / 315）的 `getCameraBasis` 与 `getViewGroundQuad`：基向量单位长、互相正交；视野四边形的地面尺寸与按 `scene.ts` 现有口径（`metresPerCssPixel = SQRT2 / zoom`、30° 俯仰）手算的值一致（±1%，写出 1280×720 视口在 zoom 80 下的实测与手算值）。
- `setZoomPx` 夹取与 `setZoom` 别名；CameraHint 缩放仍生效。
- **稳态零分配**：预热后连续 600 帧 `render()` + `setWalk` 推进，用 `node:inspector/promises` HeapProfiler 采样（照 `packages/render/src/dressup/actor-runtime.test.ts` 的写法：预热后连续窗口采样字节不增长）。
- 源码断言：`region/scene.ts` 不再含 `lerp(`、`3.4`。

## 约束
- 只写：`packages/render/src/region/**`（含测试）与本任务报告。不建 `region/ports/**`（下一个任务）；不改 `apps/game/**`、`packages/render/src/town/**`、`packages/render/package.json`、`tools/perf/**`；不新增依赖。
- 公开类型只新增、不删改既有字段（`RegionPage.vue` 必须继续通过 typecheck 与测试）；`render-explore` 分块预算由 ENG-town2-chunks 定，本任务不得让 `pnpm size` 失败。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。包级 render 测试含 rig CPU 性能门，负载高时失败要如实报告负载，不得放宽或跳过（本任务的定向命令不含性能门）。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/render/src/region --config vitest.config.ts --project node`
- `pnpm --filter @tianshu/render typecheck`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-render-core.md`（≤ 60 行）：第 3 节写弹簧参数与离散化、航位推算公式、基向量与视野四边形定义（含 4 偏航实测值）、零分配采样结果；第 7 节写给 ENG-town2-render-ports（`setInsideBuilding` 怎么转给建筑层端口、拾取怎么换成端口）、页面装配任务（`setWalk` 的 `worldTickAtMs` 从哪来、小地图怎么取基向量）与 ENG-town2-perf-gates（帧更新计时夹具）的交接。
