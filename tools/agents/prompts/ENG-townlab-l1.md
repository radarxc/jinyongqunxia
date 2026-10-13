# 本任务：城镇 3D 古建 · 实验页 `/town-lab`（仅开发构建）——目录模式（人台 + 标尺）、城市模式、手绘对照、HUD、`window.__townLab` 脚本 API、serve 插件

**第一个动作**：读 `tools/agents/reports/ENG-buildgen-r9-layer.md`（`createBuildingLayer`、`measure` / `stats`、`LayerTextureSource`）、`ENG-buildgen-p4-invariants.md`（试点方案夹具与实时生成）、`TOOL-buildgen-t1-placeholders.md`（占位贴图条带路径与层顺序）、`ENG-town2-chunks.md`（`./buildgen` 子路径与 `render-buildgen` 块）的第 3、7 节，再打开 `docs/tech/16-town-3d-spec.md` §10、§11（全部）、`apps/game/src/main.ts`（路由与开发页的懒加载写法）、`apps/game/vite.config.ts`、`apps/game/scripts/check-dev-chunks.mjs`、`apps/game/src/rig-demo.ts` 与 `main.ts` 里 `/rig-demo`、`/character-3d` 的开发页写法（`apps/game/src/dev/` 目录目前不存在，本任务新建），以及手绘图清单：大理套件在 `assets/default/baseline/building-map/manifest.yaml`（图在同目录，`bld_kit_song_dali_*.png`），其他套件在 `assets/default/building-map/<kit>/manifest.yaml`（字段 `anchor_px`、`logical_footprint_polygon_px`）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`（开发页不得进生产包；不把图片 import 进 JS bundle）。

## 背景
作者 AR-114（2026-10-10，逐字）：「小地图探索中，人物大小和建筑不匹配」。代码生成的 3D 古建在闸门 A 要由作者逐类型、逐套件看体量与比例（客栈比手绘高 28%、寺殿高 19%、城墙压到 6 m、千寻塔压到约 30 m 等都要作者定）。实验页把每种建筑放在 24 m 场地上，门旁站四个真实身高的人台（1.76 / 1.86 男、1.58 / 1.66 女）和 2.4 m 标尺，能与已审的手绘 45° 图并排或叠加对照，并给出机器可读的测量数字，供截图工具（t3）一条命令出联系表。

## 要做的事
1. **页面** `apps/game/src/dev/town-lab/**`（Vue，仅开发构建）：
   - URL 参数：`mode=catalog|city|walkin`（`walkin` 本任务只留占位，l2 实现）、`kits`、`types`、`scene`、`yaw=45|135|225|315`、`zoom=48..112`、`tex=placeholder|painted`、`sprite=off|side|onion`、`time`、`tier`、`cut`、`perf`。
   - **目录模式**：每套件一行、每类型一块 24 m 场地（方案由 dev 插件按合成占地实时 `planBuilding`）；每扇门旁四个人台（程序化胶囊 + 头，按身高精确缩放，不用 GLB）+ 2.4 m 标尺（0.5 m 刻度）；标签写门净高、檐高、脊高与门 / 人比。
   - **城市模式**：大理 ch01、大理 ch10、吐鲁番 ch10 的全部方案铺在布局地面格栅上（地面用简单格栅着色，不跑区域引擎）。
   - **手绘对照**：只在 yaw 45、zoom 64（手绘图原生 45.25 px/m）可用；手绘 PNG 由 dev 插件从仓库 `assets/default/baseline/building-map/`（song_dali）或 `assets/default/building-map/<kit>/`（其他套件）读取并按 `anchor_px` 对齐到投影的占地中心，`side` 并排、`onion` 50% 叠加。
   - **键**：Q/E 转、+/− 缩放、1–4 档位、T 贴图组、S 手绘对照、C 剖切（循环 0/1/2）、L 时辰、P 性能 HUD。
   - **HUD**（`perf=1` 或 P）：`renderer.info`、滚动 300 帧 P50 / P95、`BuildingLayer.stats`、字节账。
2. **脚本 API** `window.__townLab = { ready, set, capture, measure, stats, bench, errors }`（类型照 tech/16 §11.1）：`measure()` 返回每栋的门净高 / 宽、檐高、脊高（来自 `BuildingLayer.measure`）、四个人台在当前缩放下的屏幕像素高、占地轮廓在屏幕上的像素多边形；`bench({ frames, warmup })` 返回帧时间 P50 / P95 与 draw / 三角；`errors()` 收集控制台错误与未处理异常。
3. **serve 插件** `apps/game/build/town-lab-plugin.ts`（`apply: 'serve'`）：提供 `/__town-lab/plans?…`、`/__town-lab/kits`、`/__town-lab/handdrawn/<kit>/<file>` 三个端点，在 Node 里跑 `planBuilding` / `compileKit` 与读手绘清单；只读仓库文件，不写任何文件。
4. **INT 三处**（只加行，不改其他逻辑）：`apps/game/src/main.ts` 加 `/town-lab` 路由（`import.meta.env.DEV` 守卫 + 动态 import）；`apps/game/vite.config.ts` 注册插件一行；`apps/game/scripts/check-dev-chunks.mjs` 加 `town-lab` 规则（生产构建产物里出现 `town-lab` / `__townLab` / 插件端点字符串即失败）。

## 测试（`apps/game/src/dev/town-lab/*.test.ts`、`apps/game/build/town-lab-plugin.test.ts`，node 项目；需要 DOM 的文件首行 `// @vitest-environment happy-dom`）
命名用例：
- 插件端点：`/__town-lab/plans?kit=song_dali&types=shop,house` 返回与直接调用 `planBuilding` 相同的方案 JSON；手绘端点只允许 `assets/default/baseline/building-map/**` 与 `assets/default/building-map/**` 下的文件（路径穿越请求返回 403）。
- `measure()`：在模拟相机下，1.76 m 人台在 zoom 80 / 64 / 96 的像素高分别为 86 / 69 / 103 ±2 px；门净高与方案 ±10 mm。
- URL 参数解析与非法值回退（yaw 只取四个值、zoom 夹到 48..112）。
- **生产构建无残留**：`pnpm check` 里的 `check-dev-chunks.mjs` 通过，且新加的 `town-lab` 规则对一个故意含 `__townLab` 的假产物会失败（规则自身的单测）。

## 约束
- 只写：`apps/game/src/dev/town-lab/**`、`apps/game/build/town-lab-plugin.ts`（+ 测试）、`apps/game/src/main.ts` / `apps/game/vite.config.ts` / `apps/game/scripts/check-dev-chunks.mjs`（各只加与本任务直接相关的行）与本任务报告。
- 不改 `packages/**`（发现 render / data 接口不够用时写进报告第 7 节，不自行改）、`assets/**`、`App.vue`、`session*.ts`；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run apps/game/src/dev apps/game/build --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`（含生产构建与 `check-dev-chunks.mjs`）

## 报告
`tools/agents/reports/ENG-townlab-l1.md`（≤ 60 行）：第 3 节写 URL 参数、键位、`__townLab` 各方法返回结构、插件端点；第 6 节写人台像素高与门净高的实测；第 7 节写给 t3（截图工具怎么驱动页面、等什么就绪信号）、l2（`walkin` 模式的接入点）与协调者（本地怎么打开：`pnpm --filter ./apps/game dev` 后访问 `/town-lab?mode=catalog`）的交接。
