# 本任务：游戏工程 · entry 闭包拆分：core Worker 子系统按需加载，主线程非首屏懒加载（体积预算不放宽，目标 entry ≤ 155 KiB）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`apps/game/CLAUDE.md`、`packages/core/CLAUDE.md`（若有）；
- `tools/perf/check_size.mjs` 的 entry 闭包口径：Worker 文件属于入口的 assets，算在 entry 闭包里。只读，不改；
- 工程报告 `tools/agents/reports/ENG-items-leaf.md`（ENG-18d：物品移出 entry 的做法）、`ENG-20a-region-core.md`、`ENG-19b-ui-m1-flow.md`（若已合入）、`ENG-17-booksleep-m1.md`。

## 为什么做

- ENG-20a（d105c0b0）合入后，集成分支 `pnpm size` 的 entry 是 **166.34 / 170 KiB gzip**，比合入前涨了 6.17 KiB。
- entry 闭包构成：entry.js 约 51.4 KiB，core-worker 约 95.8 KiB（ENG-20a 的区域核心、ENG-17 的书眠、对话 / Ink 都静态打进了 Worker），其余约 19 KiB。
- ENG-19b 在它自己的工作区实测 entry 162.90（相对基点 +2.73），与 20a 叠加后约 169 KiB。后续 ENG-20b、16c、26、27a/b、28a/b、23a、CONTENT-* 都会继续往 entry 加东西。

这些任务现在都已暂停，等本任务合入、集成分支转绿后再放行。

协调者裁定（10-03 07:27）：
- 预算一字不放宽；
- 目标 entry ≤ 155 KiB，给后续任务留出余量；
- core Worker 里的区域、战斗、Ink 对话等子系统改为按需 `import()`，Worker 首包只留协议、会话骨架、存档；
- 主线程 entry 里非首屏的部分也改懒加载；
- 不改 `tools/perf/**`，不改 `check_size.mjs` 的闭包口径；
- 报告写合入前后各块的 gzip 数字，以及会话 hash 对拍不变的证据。

## 要做的事

1. **先量**：在本工作区跑 `pnpm size`，记下 entry、render、webgl total，以及 entry 闭包内各块的 gzip 大小（entry.js、core-worker、其他静态依赖）。可用 `rollup-plugin-visualizer` 之类只做本地分析，**不加依赖**、不提交分析产物；也可以用 vite 的 `build.rollupOptions.output.manualChunks` 临时观察。
2. **core 的子路径入口**（`packages/core/package.json` 的 `exports`）：
   - 为需要按需加载的子系统加子路径导出，例如 `"./region": "./src/world/index.ts"`、`"./battle": "./src/battle/index.ts"`、`"./dialogue": "./src/dialogue/index.ts"`，指向已有的子目录 `index.ts`；
   - 根 `"."` 导出保持不变，不改根 `src/index.ts` 的导出布局（根 CLAUDE.md）；
   - 必要时可新增只做再导出的入口文件 `packages/core/src/entries/*.ts`，不放规则代码；
   - 改了 `exports` 后，`apps/game` 的 tsconfig / vite 解析要能找到子路径，typecheck 要过。
3. **Worker 按需加载**（`apps/game/src/core-worker.ts`、`apps/game/src/runtime/**`）：
   - Worker 首包只留：`exposeProjectionCore` 协议、会话骨架与命令分发、存档读写；
   - 区域、战斗、对话 / Ink、城镇（`virtual:tianshu-towns`）等子系统，在会话第一次需要时 `await import(...)`，加载失败给可恢复的错误码，不静默降级；
   - 读档、新游戏、书眠都走同一个预载入口，不能出现「先发命令后加载」的竞态；
   - 主线程回退（不开 Worker）同样按需加载，行为一致。
4. **主线程**（`apps/game/src/main.ts`、`apps/game/src/core-host.ts`）：非首屏的页面与模块改懒加载。首屏指标题、设置、读档列表。
5. **测试**：
   - 新游戏 → 序章 → 初眠 → 白马冷入口，以及读档恢复，用现有 golden / 会话测试证明拆分前后同一输入得到**同一规范 state hash**。不得改 golden 期望值；
   - 子系统首次加载失败时的错误码路径；
   - 不得放宽、跳过或改写任何门禁测试，不加「高负载跳过」（作者 AR-33）。
6. **验收硬条件**：
   - 本工作区 `pnpm check` 全绿，`pnpm size` 的 entry ≤ 155 KiB（做不到就写清各块大小与原因，交开发监督另开任务，但至少要明显低于 170）；
   - render、webgl total 不得变大超过 1 KiB。

## 约束

- 写集：
  - `apps/game/src/core-worker.ts`、`apps/game/src/core-host.ts`、`apps/game/src/main.ts`
  - `apps/game/src/runtime/**`
  - `packages/core/package.json`（只改 `exports`）、`packages/core/src/entries/**`（只做再导出）
  - 写集外的改动在提交时会被丢弃。
- **不改**：`tools/perf/**`、`packages/core/src/**` 的规则代码（含根 `index.ts`）、`packages/render/**`、`packages/ui/**`、`packages/data/**`、`apps/game/build/**`、`content/**`、`docs/**`。
- 不加依赖；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 合入前 / 后 entry 闭包各块 gzip 表，以及 render、webgl total；
- 按需加载的子系统清单与各自 chunk 大小、首次加载时机；
- 会话 hash 对拍结果。

第 7 节写交接：
- 交 ENG-20b、16c、26、27a/b、28a/b、23a、CONTENT-*：新子系统应接到哪个按需入口，什么不能再静态进 Worker 首包。

报告 ≤ 60 行。
