# 本任务：游戏工程 · 工程脚手架（pnpm workspace、包边界、一条命令自检）

本任务写代码与工程配置。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。本任务沙箱已放开网络（`pnpm install` 需要）。

## 作者要求

`docs/decisions/author-requirements.md` **AR-19**：游戏工程分几个部分分别完成——存储层（web IndexedDB）、数据层（人物 / 物品 / 剧情 / 事件 / 时间建模）、交互层（高性能 web 2.5D 游戏引擎：控制面板、人物卡片、物品栏、大地图、小地图 / 城镇 three.js、战斗六角战旗与自动战斗、动效层）。本任务只搭骨架，让后续任务能并行往各包里填。

## 技术基线（必须遵守）

- `docs/tech/01-architecture.md`：Three.js r186（`three@0.186.1`）+ Vue 3.5 + 纯 TypeScript 确定性玩法核心 + Vite 8 + pnpm workspace；包：`packages/shared`、`packages/data`、`packages/core`、`packages/render`、`packages/platform`、`apps/web`、`services/api`（本任务只建占位）；`pnpm check` = lint + typecheck + test + content-validate；根目录与每个包各有 `CLAUDE.md`。
- `docs/tech/05-gameplay-engine.md` §1.3 依赖方向、§2 `packages/core` 目录划分、§4.4 禁用 API 与 lint（core 不得用 `Math.random` / `Date.now` / 浮点运算等，按文档列表写 eslint 规则）。
- `docs/tech/04-data-pipeline.md` §2.1 `content/` 目录树、§3 `packages/data` 与 Zod。
- 本机：Node 22、pnpm 9。

## 要做的事

1. 根 `package.json`（private、pnpm workspace、脚本 `check` / `lint` / `typecheck` / `test` / `dev` / `build`）、`pnpm-workspace.yaml`、`tsconfig.base.json`（strict、ES2022、moduleResolution bundler）、`.npmrc`、`.gitignore` 补 `node_modules` / `dist`、`eslint.config.js`（flat config；core 包的确定性禁用规则）、`vitest.workspace.ts`。
2. 包骨架（每包 `package.json`、`tsconfig.json`、`src/index.ts`、至少 1 个单测、`CLAUDE.md` 写职责与禁止项）：
   - `packages/shared`：ID 类型（`SkillId`、`NpcId`、`ItemId`…字符串字面量模板）、bp 整数工具、稳定 JSON 规范序列化（tech/05 §4.5）；
   - `packages/data`：Zod schema 入口、content 加载器占位、`content/` 目录（按 tech/04 §2.1 建空目录与 README）；
   - `packages/core`：§2.1 目录（每个子目录一个 `index.ts` 占位）、`createCore()` 骨架、`GameState` 根类型占位、确定性 RNG（PCG32，tech/05 §4.2 测试向量作单测）；
   - `packages/platform`：存储 / 输入 / 音频接口定义（实现由 ENG-storage 等后续任务做）；
   - `packages/render`：three r186 依赖、`createRenderer()` 占位；
   - `apps/web`：Vite 8 + Vue 3.5 最小页面（显示"天书录"与 core 版本），`pnpm --filter ./apps/web dev` 可起；
   - `services/api`：README 占位。
3. `pnpm install` 后 `pnpm check` 全绿（沙箱已放开对 `~/Library/pnpm` 与 `~/Library/Caches/pnpm` 的写入；若 pnpm 仍因沙箱无法写全局 store，在根 `.npmrc` 设 `store-dir=.pnpm-store` 并把 `.pnpm-store/` 加进 `.gitignore`，报告里写明）；`pnpm --filter web build` 成功。锁文件 `pnpm-lock.yaml` 入库。
4. 根 `CLAUDE.md` 写：分层与依赖方向、"数据驱动优先、schema 即文档、一条命令自检、小步提交"、各包禁止项、`pnpm check` 为完成定义。

约束：依赖版本按 tech/01 §2 表（three 0.186.1、vue 3.5、vite 8、vitest、eslint 9、typescript 5.x），拿不到的版本写报告并用最接近的；不要引入 tech/01 未列出的框架；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/web build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：目录树；各包职责一句话；依赖版本表（实际安装）；`pnpm check` 输出摘要；交后续 ENG 任务的约定（放哪、怎么测）。报告 ≤ 100 行。
