# 本任务：游戏工程 · 小修：`build-shell.test.ts` 不得依赖上一次构建留下的 dist（「生产包不含 rig-demo」改到构建之后检查）

本任务写测试与构建脚本。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`apps/game/CLAUDE.md`、报告 `tools/agents/reports/ENG-19a-ui-shell.md`。

## 为什么做

ENG-19a（ed8898d6）新增 `apps/game/src/build-shell.test.ts`，读 `apps/game/dist/assets`，断言生产包里没有 `rig-demo-*` 块。它有两个毛病：
- `pnpm check` 的顺序是 lint → typecheck → test → content:validate → size（构建）。测试跑时，dist 还是**上一次**构建留下的。10-03 04:33 集成分支就因此报红：读到 02:44 的旧 dist（含 rig-demo），刷新构建后才转绿。
- 没有 dist 时它 `catch(() => [])` 直接空过，什么也没验证。

协调者裁定（10-03 04:36）：
- 不能依赖上一次的 dist；
- 两种做法二选一：测试自己把构建产物输出到临时目录再断言；或者把「无 rig-demo 块」的检查挪到 size 步骤里、构建之后；
- dist 缺失不得空过。

## 要做的事

1. 优先做法：新增构建后检查脚本 `apps/game/scripts/check-dev-chunks.mjs`。
   - 读本次 `pnpm build` 产出的 `apps/game/dist/assets` 与 `.vite/manifest.json`；
   - 断言生产包不含 `rig-demo` 块，也没有任何只供开发用的入口；
   - dist 或 manifest 缺失时报错退出，不得空过。
   
   把它接到根 `package.json` 的 `size` 脚本里、构建之后，例如 `pnpm build && node tools/perf/check_size.mjs && node apps/game/scripts/check-dev-chunks.mjs`。只改这一条脚本，`check_size.mjs` 与预算不动。
2. `apps/game/src/build-shell.test.ts`：
   - 保留源码层断言：`main.ts` 用 `import.meta.env.DEV &&` 守住 rig-demo 的动态导入；
   - 删除读 dist 的部分，或改成纯函数测试：对检查脚本导出的判定函数，用合成的文件清单测合法和非法两种情况。
3. 如果选另一种做法（测试内构建到临时目录）：单次构建耗时必须写进报告，并给用例设固定超时、注明原因；不得按负载放宽（作者 AR-33）。

## 约束

- 写集：`apps/game/src/build-shell.test.ts`、`apps/game/scripts/check-dev-chunks.mjs`、`apps/game/scripts/check-dev-chunks.test.*`、`package.json`（只改 `size` 脚本那一行）。写集外的改动在提交时会被丢弃。
- 不改 `tools/perf/**`（预算与体积脚本）、`apps/game/src/main.ts`、`apps/game/vite.config.ts`。
- 不加依赖；每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 选了哪种做法；
- dist 缺失、旧 dist 含 rig-demo、正常这三种情况下检查各给出什么结果，需要实测；
- `pnpm check` 总耗时变化。

报告 ≤ 30 行。
