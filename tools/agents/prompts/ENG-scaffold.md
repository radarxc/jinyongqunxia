# 本任务：游戏工程 · 工程脚手架（pnpm workspace + Next.js 应用壳 + 包边界 + 一条命令自检）

本任务写代码与工程配置。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务沙箱已放开网络（`pnpm install` 需要）与 `~/Library/pnpm`、`~/Library/Caches/pnpm` 的写入；若 pnpm 仍因沙箱无法写全局 store，在根 `.npmrc` 设 `store-dir=.pnpm-store` 并把 `.pnpm-store/` 加进 `.gitignore`，报告里写明。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19**：游戏工程分几个部分分别完成——存储层（web IndexedDB）、数据层（人物 / 物品 / 剧情 / 事件 / 时间建模）、交互层（高性能 web 2.5D 游戏引擎：控制面板、人物卡片、物品栏、大地图、小地图 / 城镇 three.js、战斗六角战旗与自动战斗、动效层）。**AR-21（2026-10-01）：「整个app用nextjs来做」**——应用壳用 Next.js，UI 用 React；游戏本体是纯客户端路由。本任务只搭骨架，让后续任务能并行往各包里填。

## 技术基线（必须遵守；与 `docs/tech/01-architecture.md` 冲突处以本节为准，文档正在同步）

- 应用：**Next.js 最新稳定版（16.x，App Router，Turbopack）+ React 19 + TypeScript strict**，放 `apps/web`（包名 `@tianshu/web`）。首页（`/`）服务端可渲染：显示"天书录"与 core 版本号；游戏路由 `/play` 为纯客户端：`'use client'` 组件经 `next/dynamic(..., { ssr: false })` 加载 Three.js 场景与 core（任何用到 `window` / IndexedDB / WebGL 的代码都不得在服务端执行）。`next.config.ts` 用 `transpilePackages` 消费工作区包的 TS 源码；不用 `next/font/google` 等需联网的构建特性；`NEXT_TELEMETRY_DISABLED=1` 写进 `.env`。
- 包（`docs/tech/01-architecture.md` §4 的分层与依赖方向不变，只把 UI 框架换成 React）：`packages/shared`、`packages/data`、`packages/core`、`packages/render`（three `0.186.1`）、`packages/ui`（React 组件库与 UI 投影，替代文档里的 Vue 组件）、`packages/platform`、`apps/web`、`services/api`（占位）。依赖方向：core 不依赖 render / platform / ui / DOM / React；platform 不含玩法规则；ui 只消费 core 的只读投影与命令接口。
- `docs/tech/05-gameplay-engine.md` §1.3 依赖方向、§2 `packages/core` 目录划分、§4.4 禁用 API 与 lint（core 不得用 `Math.random` / `Date.now` / 浮点运算等，按文档列表写 eslint 规则）；`docs/tech/04-data-pipeline.md` §2.1 `content/` 目录树、§3 `packages/data` 与 Zod。
- 工具链：pnpm workspace、TypeScript 5.x、ESLint 9 flat config（`eslint-config-next` + `typescript-eslint` + core 包确定性禁用规则）、Prettier、Vitest（各包 node 环境；`packages/ui` 与 `apps/web` 组件测试用 React Testing Library + happy-dom 或 jsdom）。`pnpm check` = lint + typecheck（`tsc --noEmit`；Next 应用用 `next typegen` 或 `tsc`）+ test + content:validate；`pnpm build` 单独跑 `next build`。本机：Node 22、pnpm 9。

## 要做的事

1. 根 `package.json`（private、脚本 `check` / `lint` / `typecheck` / `test` / `content:validate` / `dev` / `build`）、`pnpm-workspace.yaml`、`tsconfig.base.json`（strict、ES2022、moduleResolution bundler）、`.npmrc`、`.gitignore` 补 `node_modules` / `.next` / `dist` / `coverage`、`eslint.config.js`、`vitest.workspace.ts`、`.editorconfig`、`.env`。
2. 包骨架（每包 `package.json`、`tsconfig.json`、`src/index.ts`、至少 1 个单测、`CLAUDE.md` 写职责与禁止项）：
   - `packages/shared`：ID 类型（`SkillId`、`NpcId`、`ItemId`…字符串字面量模板）、bp 整数工具、稳定 JSON 规范序列化（tech/05 §4.5）；
   - `packages/data`：Zod schema 入口、content 加载器占位、`content/` 目录（按 tech/04 §2.1 建空目录与 README）；
   - `packages/core`：§2.1 目录（每个子目录一个 `index.ts` 占位；根 `src/index.ts` 预先 `export *` 全部子模块，后续任务只改各自子目录、不再碰根 index，避免并行冲突）、`createCore()` 骨架、`GameState` 根类型占位、确定性 RNG（PCG32，tech/05 §4.2 测试向量作单测）；
   - `packages/platform`：存储 / 输入 / 音频接口定义（实现由 ENG-01 等后续任务做）；
   - `packages/render`：three r186 依赖、`createRenderer(canvas)` 占位（只在客户端调用）；
   - `packages/ui`：React 基础组件占位（按钮 / 面板 / 水墨风主题 token）、UI 投影 store 骨架（`useSyncExternalStore` 订阅 core 事件后的只读投影，不把 core 对象塞进 React 状态）；
   - `apps/web`：Next.js 应用：`/` 与 `/play`（客户端加载 render + core，画一个旋转占位物件证明 three 在 Next 里可用）、`pnpm --filter ./apps/web dev` 可起、`pnpm --filter ./apps/web build` 成功；
   - `services/api`：README 占位（云存档等后续）。
3. `pnpm install` 后 `pnpm check` 全绿；`pnpm --filter ./apps/web build` 成功；锁文件 `pnpm-lock.yaml` 入库。
4. 根 `CLAUDE.md` 写：分层与依赖方向（含 Next.js 服务端 / 客户端边界规则）、"数据驱动优先、schema 即文档、一条命令自检、小步提交"、各包禁止项、`pnpm check` 为完成定义、后续任务放哪 / 怎么测。

约束：依赖版本取 npm 上最新稳定版（three 固定 0.186.1），实际版本写进报告；不要引入本节与 tech/01 都未列出的框架（状态管理先用 React 内建 + `useSyncExternalStore`，需要时后续任务再加 zustand）；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/web build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：目录树；各包职责一句话；依赖版本表（实际安装）；`pnpm check` 与 `next build` 输出摘要；Next 服务端 / 客户端边界规则；交后续 ENG 任务的约定（放哪、怎么测）。报告 ≤ 100 行。
