# 本任务：3D 纸娃娃换装 · 阶段 B1b · 换装运行时独立懒加载块、体积预算、构建期发布接线与性能门（AR-102）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/render/CLAUDE.md`、`docs/tech/11-paper-doll-3d-impl-spec.md` §7（进包）、§8（运行时 API）、§9（分块与预算，**本任务规格**）、§11 禁区，`docs/tech/10-paper-doll-3d.md` §3.2"分块"与"性能"两条，B1a 报告 `tools/agents/reports/ENG-dressup-b1a-runtime.md` 第 7 节、A5 报告第 7 节（`publishDressupAssets` 签名与调用位置）。参考现有做法：`apps/game/build/content-plugin.ts` 的 `battleModelLazyChunk` / `configureBattleModelChunks` 与其测试、`tools/perf/check_size.mjs` 的 `appendRenderLazyRecord('render-model3d', …)`、`apps/game/vite.config.ts` 的 PWA `globIgnores`、`packages/render/src/rig/performance.test.ts` 的性能测试写法。

## 作者要求
**AR-102**：换装运行时进独立懒加载块，不碰 render 主块；`pnpm check` 是完成定义。根 `CLAUDE.md`：`tools/perf/budgets.json` 是可执行门禁；性能门不进 `pnpm check`，由 `pnpm check:perf` 单独跑，**禁止任何"高负载跳过 / 放宽"逻辑**。

## 要做的事
1. **分块**（`apps/game/build/content-plugin.ts` + `content-plugin.test.ts`）：新增 `dressupLazyChunk(id)`，把 `packages/render/src/dressup/**` 分到 `render-dressup`；接进 `configureBattleModelChunks` 的 `codeSplitting.groups` 名字函数（`battleModelLazyChunk(id) ?? dressupLazyChunk(id) ?? manualChunks(id)`，保持 `includeDependenciesRecursively: false`）；`GLTFLoader` / `SkeletonUtils` 仍归 `battle-model3d`，允许 `render-dressup` 静态依赖它；若 dressup 用到其他 `three/examples/jsm/**` 附件要逐个点名进 `render-dressup`。补测试断言。
2. **构建期发布**：在 `content-plugin.ts` 调用 `publishVfxRuntime` 的同一处，调用 A5 的 `publishDressupAssets(root, copy, copied, references)`（`apps/game/build/dressup-assets.ts`，不改它）；补集成断言（manifest 里 non-rejected 的 file / fit / report 被复制，rejected 跳过）。
3. **入口与导出**：`packages/render/package.json` 的 `exports` 加 `"./dressup": "./src/dressup/runtime.ts"`；`packages/render/src/index.ts` 只加 `export type`（不得静态 re-export 运行时值）；dressup 运行时只能经 `import('@tianshu/render/dressup')` 动态引入。
4. **体积门**：`tools/perf/budgets.json` 加 `"render-dressup": 24`；`tools/perf/check_size.mjs` 加 `appendRenderLazyRecord('render-dressup', findManifestChunk('render-dressup', { sources: ['packages/render/src/dressup/runtime.ts'], manifestNames: ['render-dressup'] }))`，扣除 render 主块与 battle-model3d 已计闭包避免双计；`tools/perf/check_size.test.mjs` 加"缺块即失败"与"超预算即失败"夹具。render 主块 180 KiB 门不动——每次 `pnpm size` 前后对比 render 行，主块不得增长（换装运行时只用主块已有的 three 核心 API）。
5. **PWA**：`apps/game/vite.config.ts` 的 `globIgnores` 加 `'**/assets/render-dressup-*.js'`（不让 Service Worker 首装预缓存）。
6. **性能门**：新增 `packages/render/src/dressup/performance.test.ts`：100 个 actor × 平均 4 件装备（合成网格，不加载真实 GLB），测 `update(dt)`（含 skeleton.update 与插槽更新）的 P95；方法同 `rig/performance.test.ts`（预热、多轮取最好）；上限先定 P95 < 2.0 ms（报告写实测与 loadavg，协调者据实再定）。把它加进 `vitest.config.ts` 的 `perf` 项目 include、从 `node` 项目 exclude，并在根 `package.json` 的 `test` 脚本排除列表与 `test:perf` 列表里同步登记（**不进 `pnpm check`**）。在负载低时实际跑一次 `pnpm check:perf` 里的这一项，报告写结果。

## 约束
- 只写 `apps/game/build/content-plugin.ts`、`apps/game/build/content-plugin.test.ts`、`apps/game/vite.config.ts`、`packages/render/package.json`、`packages/render/src/index.ts`、`packages/render/src/dressup/performance.test.ts`、`packages/render/CLAUDE.md`（补一段 dressup API 与懒加载规则）、`tools/perf/budgets.json`、`tools/perf/check_size.mjs`、`tools/perf/check_size.test.mjs`、`vitest.config.ts`、根 `package.json`（只改 test / test:perf 两个脚本）与本任务报告。
- 不改 `packages/render/src/dressup/` 下 B1a 的源文件（发现 bug 写进报告第 4 节）；不改既有门禁阈值；不加依赖。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm check`（含 `pnpm size`：输出里必须出现 `render-dressup` 且 ≤ 24 KiB，render 主块不增长）
- `pnpm --filter ./apps/game build`

## 报告
第 3 节写 `pnpm size` 前后各块体积（render、render-dressup、battle-model3d）、分块断言、发布接线测试、性能门实测 P95 与 loadavg；第 7 节写给 B2（预览页动态引入写法）与 C1 的接口。报告 ≤ 60 行。
