# 本任务：游戏工程 · 工程脚手架（pnpm workspace、包边界、性能预算进 `pnpm check`）

本任务写代码与工程配置。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务沙箱已放开网络（`pnpm install` 需要）与 `~/Library/pnpm`、`~/Library/Caches/pnpm` 的写入；若 pnpm 仍因沙箱无法写全局 store，在根 `.npmrc` 设 `store-dir=.pnpm-store` 并把 `.pnpm-store/` 加进 `.gitignore`，报告里写明。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19**：游戏工程分几个部分分别完成——存储层（web IndexedDB）、数据层（人物 / 物品 / 剧情 / 事件 / 时间建模）、交互层（高性能 web 2.5D 游戏引擎：控制面板、人物卡片、物品栏、大地图、小地图 / 城镇 three.js、战斗六角战旗与自动战斗、动效层）。**AR-21（2026-10-01）作者：「那就Vue/Vite吧。性能要最好」**——维持 tech/01 基线，性能是硬要求。本任务只搭骨架，让后续任务能并行往各包里填。

## 技术基线（必须遵守）

- `docs/tech/01-architecture.md`：Three.js r186（`three@0.186.1`）+ Vue 3.5 DOM 覆盖层 + 纯 TypeScript 确定性玩法核心 + Vite 8 + pnpm workspace；§4 包表：`packages/shared`、`packages/data`、`packages/core`、`packages/render`、`packages/ui`（Vue 组件与 UI 投影）、`packages/platform`、`apps/game`（Vite + PWA 的可发布游戏）、`services/api`（占位）；§5 UI 投影（选择器生成投影写入 Pinia `shallowRef`，Vue 只对投影做响应式）、CoreHost（core 跑在 Web Worker，`new Worker(new URL(...), { type: 'module' })` + Comlink；主线程回退）；§6 工具链表（Vite ^8、`@vitejs/plugin-vue`、`vue-tsc`、Vitest、ESLint 9 flat + `eslint-plugin-vue`、Prettier）；§7 chunk 预算（`entry` ≤ 170 KB gzip 等，整表照抄进预算文件）。
- `docs/tech/05-gameplay-engine.md` §1.3 依赖方向、§2 `packages/core` 目录划分、§4.4 禁用 API 与 lint（core 不得用 `Math.random` / `Date.now` / 浮点运算等，按文档列表写 eslint 规则）；`docs/tech/04-data-pipeline.md` §2.1 `content/` 目录树、§3 `packages/data` 与 Zod；`docs/tech/03-mobile-performance.md` 的帧率 / 首屏 / 内存指标。
- 本机：Node 22、pnpm 9。

## 要做的事

1. 根 `package.json`（private、脚本 `check` / `lint` / `typecheck` / `test` / `content:validate` / `build` / `size` / `dev`）、`pnpm-workspace.yaml`、`tsconfig.base.json`（strict、ES2022、moduleResolution bundler）、`.npmrc`、`.gitignore` 补 `node_modules` / `dist` / `coverage`、`eslint.config.js`（flat；core 包确定性禁用规则）、`vitest.workspace.ts`、`.editorconfig`、Prettier 配置。
2. 包骨架（每包 `package.json`、`tsconfig.json`、`src/index.ts`、至少 1 个单测、`CLAUDE.md` 写职责与禁止项；内部包 `exports` 直指 `./src/index.ts`，不单独构建）：
   - `packages/shared`：ID 类型（`SkillId`、`NpcId`、`ItemId`…字符串字面量模板）、bp 整数工具、稳定 JSON 规范序列化（tech/05 §4.5）；
   - `packages/data`：Zod schema 入口、content 加载器占位、`content/` 目录（按 tech/04 §2.1 建空目录与 README）；
   - `packages/core`：§2.1 目录（每个子目录一个 `index.ts` 占位；根 `src/index.ts` 预先 `export *` 全部子模块，后续任务只改各自子目录、不再碰根 index，避免并行冲突）、`createCore()` 骨架、`GameState` 根类型占位、确定性 RNG（PCG32，tech/05 §4.2 测试向量作单测）、命令 / 事件通道的类型；
   - `packages/platform`：存储 / 输入 / 音频接口定义（实现由 ENG-01 等后续任务做）、`CoreHost`（Worker 版 + 主线程版，Comlink）；
   - `packages/render`：three r186 依赖、`createRenderer(canvas)` 占位、帧统计（draw call / 帧时间）接口；
   - `packages/ui`：Vue 3.5 + Pinia：根组件、`useUiStore()`（`shallowRef` 投影）、`uiBus`（命令意图）、水墨风基础组件占位 `Tx*`；
   - `apps/game`：Vite 8 + Vue 应用：标题画面（显示"天书录"与 core 版本）+ 一个场景占位页（three 画旋转占位物件，core 在 Worker 里跑 1 个 tick 并回传），`pnpm --filter ./apps/game dev` 可起、`build` 成功；`vite.config.ts` 的 `manualChunks` 按 tech/01 §7 分 chunk（entry / three / core / 书界内容按需）；
   - `services/api`：README 占位。
3. **性能预算进自检**：`tools/perf/budgets.json`（照抄 tech/01 §7 各 chunk 的 gzip 上限）+ `tools/perf/check_size.mjs`（读 `apps/game/dist` 各 chunk 的 gzip 大小，超预算退出非零，打印表格）；`pnpm size` = build + 检查；`pnpm check` = lint + typecheck + test + content:validate + size。当前骨架的实际大小写进报告。
4. `pnpm install` 后 `pnpm check` 全绿；锁文件 `pnpm-lock.yaml` 入库。
5. 根 `CLAUDE.md` 写：分层与依赖方向、"数据驱动优先、schema 即文档、一条命令自检、小步提交"、各包禁止项、性能规矩（预算表、core 在 Worker、热路径零分配、渲染实例化 / 图集）、`pnpm check` 为完成定义、后续任务放哪 / 怎么测。

约束：依赖版本按 tech/01 §6 表（three 固定 0.186.1，其余取 npm 最新稳定版并写进报告）；不引入 tech/01 未列出的框架；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：目录树；各包职责一句话；依赖版本表（实际安装）；`pnpm check` 输出摘要与当前 chunk 大小表；交后续 ENG 任务的约定（放哪、怎么测、性能规矩）。报告 ≤ 100 行。
