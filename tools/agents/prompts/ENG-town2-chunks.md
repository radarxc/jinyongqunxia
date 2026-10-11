# 本任务：城镇探索 v2 · 分块与预算——城镇 / 区域 / 3D 古建 / 3D 人物 / meshopt 拆成独立懒加载块并各有预算；perf 测试按文件名注册；新素材目录进包

**第一个动作**：打开 `apps/game/build/content-plugin.ts` 的 `battleModelLazyChunk` / `dressupLazyChunk` / `configureBattleModelChunks`（约 L88–125，Rolldown `codeSplitting.groups` 的写法——它的分组名函数最后回退调用 `vite.config.ts` 的 `manualChunks`），再打开 `apps/game/vite.config.ts` 的 `manualChunks`（约 L95–108）、`tools/perf/check_size.mjs` 与 `tools/perf/budgets.json`，然后读 `docs/tech/15-town-explore-v2-spec.md` §10；读完直接动手，不要先写计划。

本任务写构建配置与门禁。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（`tools/perf/budgets.json` 是可执行门禁；render 保持独立懒加载 chunk；门禁不放宽）。

## 背景
作者 AR-114（2026-10-10）城镇探索全面升级会新增大量渲染代码（区域场景扩展、3D 古建生成器与其 Worker、3D 人物端口、meshopt 解码器）和界面代码。现在 `vite.config.ts` 把所有 `/packages/render/` 与 `/three/` 都归进 `render` 块（门 180 KiB，已用约 164），新代码一进来就会撑破；作者硬要求「性能要最好」（AR-21）。本任务先把块拆好、每块有预算，后续任务只往各自的块里写。

## 要做的事
1. **新懒加载块**：规则写成新文件 `apps/game/build/town-chunks.ts` 的导出函数 `townLazyChunk(id)`（照 `dressupLazyChunk` 的写法，单测），在 `apps/game/vite.config.ts` 的 `manualChunks` 里、`/three/` 与 `/packages/render/` 两条之前调用它——`content-plugin.ts` 的分组名函数会回退到 `manualChunks`，所以**不要改 `content-plugin.ts`**（主检出里该文件有别人未提交的改动，改了会挡住并主干）：
   - `render-explore`：`/packages/render/src/region/`（含后续 `region/ports/`）。
   - `render-town-legacy`：`/packages/render/src/town/`（v1 退役时整块删除）。
   - `render-buildgen`：`/packages/render/src/buildgen/`（Worker 入口 `buildgen/worker/buildgen.worker.ts` 由 Vite 作为独立 worker 产物输出，记为 `render-buildgen-worker`）。
   - `render-actor3d`：`/packages/render/src/actor3d/`。
   - `render-meshopt`：`three/examples/jsm/libs/meshopt_decoder.module.js`（城镇减面人物要用；放进 `battle-model3d` 会超它的 24 KiB 门）。
   - 保证这些块只被动态 import 引用：`render` 主闭包不得静态包含它们（在 `check_size.mjs` 里加断言）。目录暂不存在也不报错（buildgen / actor3d 由别的任务建）。
2. **预算**（`tools/perf/budgets.json`，单位 KiB gzip）：`render-explore` 32、`render-town-legacy` 14、`render-buildgen` 40、`render-buildgen-worker` 24、`render-actor3d` 16、`render-meshopt` 8；尺寸组 `explore-ui` 45（`apps/game/src/explore/**`、`apps/game/src/pages/ExplorePage.vue`、`apps/game/src/pages/ShopLayer.vue`、`packages/ui/src/components/explore/**`，用 `apps/game/build/size-groups-plugin.ts` 现有尺寸组机制；文件尚不存在时该组记 0 并 PASS）；Worker 懒加载 `core-explore` 24、`core-shop` 8（对应 `@tianshu/core/explore-command`、`@tianshu/core/shop-command` 入口，入口尚不存在时记 0）；路由 `webglExploreRoute` 420（entry + render + render-rig + render-explore + render-buildgen + render-actor3d + render-meshopt + render-dressup）。**`render` 的门**：拆分后实测若 ≤ 168 KiB，把门值收紧到 170；否则保持 180 并在报告写明实测值——**任何既有门值都不得放宽**。
3. **`session` 断言**：`check_size.mjs` 增加断言——`session` 静态闭包里不得出现 `world/explore/` 与 `economy/shop-` 模块（后续 core 任务新增的代码必须走懒加载族）。
4. **render 子路径**：`packages/render/package.json` 的 `exports` 加 `"./buildgen": "./src/buildgen/index.ts"`、`"./actor3d": "./src/actor3d/index.ts"`（目录由别的任务建；若此时 `src/buildgen/index.ts` 已存在则 typecheck 要能过）。
5. **perf 测试注册改为按文件名**：`vitest.config.ts` 的 `node` 项目改为排除 `**/*.performance.test.ts`、`perf` 项目改为收集 `packages/**/*.performance.test.ts`（与现有显式列表完全等价：现有 5 个 perf 文件都以 `.performance.test.ts` 结尾——逐个核对）；根 `package.json` 的 `test` 脚本把 5 条 `! -path` 换成 `! -name '*.performance.test.ts'`，`test:perf` 换成按同一模式查找文件（`find packages -name '*.performance.test.ts'`）。后续新增的 perf 测试（城镇寻路 / tick / 区域帧 / 生成器 / 人物）只要按此命名就自动进 perf 项目、不进 `pnpm check`。
6. **新素材目录进包**（新文件 `apps/game/build/town-assets.ts` + 同名 `.test.ts`，作为 Vite 插件在 `vite.config.ts` 的 plugins 里登记；**不要改 `asset-manifest.ts`**——大地图线正在改它）：构建期按 manifest 把 `assets/default/buildkit/**`（占位与正式贴图条带、招牌图集）与 `assets/default/model3d/*/town/**`（城镇减面人物）中 `status` 不为 `rejected` 的条目复制到 `apps/game/public/assets/default/...`（保持相对路径），参照 `apps/game/build/asset-manifest.ts` 现有类别的写法（只读参考，不改它）；目录不存在时安静跳过；PWA 预缓存不包含这两类（按需加载）。
7. **类型契约测试** `apps/game/src/town-contract.test.ts`（ENG-buildgen-p1-kits 已建此文件并放了 `CompiledBuildKit → BuildKitView` 断言、已在 `packages/render/package.json` 加 `./buildgen` 导出；在其基础上补，不要删）：编译期断言 data 侧 `TownBuildingPlan`（`@tianshu/data/town-plan`）与 render 侧 `BuildingPlanView`（`@tianshu/render/buildgen` 的类型）结构一致（双向可赋值），字段多一个少一个都编译失败。另断言 data 侧 `CompiledBuildKit` 可赋值给 render 侧 `BuildKitView`（单向：编译后套件可以多字段，不能少字段或类型不符），`TownWall` 与 `CityWallView` 双向可赋值。运行期再断言 render 的 `ROOF_STYLE` 常量（`packages/render/src/buildgen/types.ts`）与 data 的 `RoofStyle` 枚举逐项同名同值。
8. 测试：新增的分块函数单测（每个块给 2–3 个模块 id 断言归属，含 three 主体不得被拉进懒块）；`check_size.test.mjs` 增加新块、尺寸组、路由与 session 断言的用例。

## 约束
- 只写：`apps/game/vite.config.ts`、`apps/game/build/{town-chunks,town-assets,size-groups-plugin}.ts`（及其同名 `.test.ts`）、`tools/perf/{budgets.json,check_size.mjs,check_size.test.mjs,README.md}`、`packages/render/package.json`、`vitest.config.ts`、根 `package.json`（只改 `test` / `test:perf` 两条脚本）、`apps/game/src/town-contract.test.ts` 与本任务报告。
- 不改 `apps/game/build/content-plugin.ts`、`apps/game/build/asset-manifest.ts`（及其测试）；不改任何既有预算的数值（除 `render` 按第 2 条收紧）；不加"高负载跳过"；不新增依赖；工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/build tools/perf --config vitest.config.ts --project node`
- `pnpm check`

## 报告
`tools/agents/reports/ENG-town2-chunks.md`（≤ 60 行）：第 3 节给拆分前后各块实测 KiB 表（render、新块、路由）、`render` 门是否收紧及依据；第 7 节写给后续任务的规则：哪些目录进哪个块、perf 测试命名约定、新素材目录怎么登记 manifest。
