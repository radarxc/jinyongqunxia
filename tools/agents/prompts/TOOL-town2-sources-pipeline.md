# 本任务：城镇探索 v2 · 城镇源文件与构建管线——三座试点城的 `content/world/towns/*.yaml` + `buildContent()` 发现并编成区域场景叶子（带缓存）

**第一个动作**：读 `tools/agents/reports/TOOL-town2-compiler-core.md`、`tools/agents/reports/DES-town2-pilot-content.md`、`tools/agents/reports/ENG-buildgen-p1-kits.md` 的第 3、7 节（编译入口签名与输入、试点设施文件、`city-kits.yaml` 与套件编译），再打开 `docs/design/town/city_dali__ch01.yaml`、`docs/design/town/city_turpan__ch10.yaml`（城市规格：`display_name`、`historical_year`、`wall.polygon`、`gates`、`runtime_partition`）、`packages/data/src/build/{pipeline,discover,types}.ts`（现有内容构建怎样发现源、编叶子、算哈希与缓存）与 `docs/tech/15-town-explore-v2-spec.md` §3.1、§2.1；读完直接动手，不要先写计划。

本任务写代码与内容。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（数据驱动；生产构建不读 design 文档）。

## 背景
作者 AR-114（2026-10-10）：城镇并入区域引擎，每城一个区域场景 `sc_<NN>_town_<city>`。编译器核心（compiler-core）是纯函数；本任务给它喂真实输入并接进内容构建：生产构建**不读** `docs/design/**`，所以先用一次性工具把城市规格里运行时要用的部分抄进 `content/world/towns/<city>__chNN.yaml`，构建时只读这些源文件 + 布局 + 设施文件 + 套件。

## 要做的事
1. **一次性抄录工具**：纯逻辑放 `packages/data/src/build/town-sources.ts`（可测），命令行包装放 `packages/data/scripts/town-sources.ts`（`pnpm exec tsx packages/data/scripts/town-sources.ts` 可跑；tech/15 §3.1 写的 `tools/content/town_sources.ts` 改到这里，因为根 vitest 的 node 项目不收 `tools/content/*.test.ts`）：读 `docs/design/town/<city>__chNN.yaml` 与 `docs/design/town/cities.yaml`，输出 `content/world/towns/<city>__chNN.yaml`（新 schema 版本串 `town-source.v1`，schema 定义写在本任务的 data 构建类型里，字段：`cityId`、`layoutKey`、`chapter`、`sceneId`（按 tech/15 §0 规则算）、`displayNameKey`（同时在 `content/locales/zh-Hans/town-facilities.yaml` 已有的文本表之外，新建 `content/locales/zh-Hans/towns.yaml` 写显示名）、`historicalYear`、`visualKit`（取 `content/town/buildkits/city-kits.yaml`，吐鲁番 ch10 → `xiyu:tang_buddhist`，**不用**规格里的 `era_kit`）、`wall { points, closed, heightMm, thicknessMm, gates[{ id, seg, offsetMm, widthMm, kind }] }`（由规格的规划格坐标换算成 mm，城墙高 6000、厚 4000）、`facilitiesRef`、`layout { path, sha256 }`）。本任务只抄三座试点城：大理 ch01（布局在 `assets/default/baseline/town/town_dali__ch01.layout.yaml`）、大理 ch10、吐鲁番 ch10。
2. **构建发现**（`packages/data/src/build/discover.ts`）：发现 `content/world/towns/*.yaml`，按 `town-source.v1` 校验；布局 sha256 与实际文件不符时构建失败（提示重跑抄录工具）。
3. **管线**（`packages/data/src/build/pipeline.ts`、`types.ts`）：对每个城镇源调用 `compileTownScene`（compiler-core），产出区域场景叶子，与现有 Tiled 区域叶子同一出口（同一 manifest / 懒加载方式，按 `regionId = rg_town_<city>`、`sceneId`）；按输入哈希（源文件 + 布局 + 设施文件 + 套件编译结果 + 编译器版本常量）缓存到 `.cache/content-build`，第二次构建命中缓存。套件编译结果 `buildkit-runtime.v1` 每套件只出一份叶子，场景用 `kitRef` 引用。
4. **脚本**（`packages/data/scripts/**`，如需要）：`pnpm content:build` 现有入口能带上城镇编译；不新增根 `package.json` 脚本。

## 测试（命名用例）
- `packages/data/src/build/town-sources.test.ts`：三城抄录结果字段齐全；吐鲁番 `visualKit = xiyu:tang_buddhist`；城门换算 mm 与规格格坐标一致（±1 mm）；同输入两次输出逐字节相同。
- `packages/data/src/build/*.test.ts`：`buildContent()` 产出含 `sc_01_town_dali`、`sc_10_town_dali`、`sc_10_town_turpan` 三个场景叶子与 `song_dali`、`xiyu` 两个套件叶子；布局 sha 不符时报错且信息含重跑命令；第二次构建命中缓存（计时不作断言，用缓存命中计数）；现有 Tiled 区域叶子不变（哈希对比）。
- 应用侧（`apps/game` 现有构建测试里能读到叶子清单的话）：清单含三个城镇场景条目；若需改 `apps/game/build/content-plugin.ts` 才能发布，**不要改**，写进报告第 7 节交给 ENG-town2-session-v2 / chunks 的维护者。

## 约束
- 只写：`packages/data/src/build/town-sources.ts`（+ `town-sources.test.ts`）、`content/world/towns/**`、`content/locales/zh-Hans/towns.yaml`、`packages/data/src/build/{pipeline,discover,types}.ts`、`packages/data/src/build/*.test.ts`（只增改与本任务直接相关的用例）、`packages/data/scripts/**` 与本任务报告。
- 不改 `packages/data/src/build/town/**`（编译器核心）、`town-plan/**`、schema 文件（`packages/data/src/schemas/**`）、`apps/game/**`、`assets/**`、`docs/**`；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。沙箱里 `pnpm content:*` 若因 tsx socket 被拒跑不了，照实写进报告，交校验阶段跑；不要改 `node_modules`。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/data/src/build --config vitest.config.ts --project node`
- `pnpm content:build`
- `pnpm content:validate`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/TOOL-town2-sources-pipeline.md`（≤ 60 行）：第 3 节列三城源文件要点（场景 ID、套件、城门数、布局 sha 前 12 位）与叶子大小、缓存键组成；第 7 节写给 TOOL-town2-worldmap-pilot（大地图节点 `entry.scene / gateId` 用什么值）、ENG-town2-session-v2（叶子怎么预载）与 P3 量产（抄录工具如何批量跑其余 197 份布局）的交接。
