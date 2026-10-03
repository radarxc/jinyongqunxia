# 本任务：游戏工程 · 小修：`build.test.ts` 的真实内容构建用例在全量测试并行时超时（5 s 默认值）

本任务写测试代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。先读根 `CLAUDE.md`、`packages/data/CLAUDE.md`。

## 为什么做

ENG-18d（4f801d3f）合入后，集成分支 `pnpm check` 在 10-03 01:14 只挂一项：
- 失败用例：`packages/data/src/build/build.test.ts` 的 `publishes item rules and text as independent logical leaves`；
- 现象：`Test timed out in 5000ms`；
- 原因：该用例对**仓库真实内容**跑 `buildContent({ rootDir: <repo>, chapter: 'ch01_tianlong' })`。TOOL-items-catalog 合入后物品从 361 个增到 889 个，构建变慢；在 `pnpm test` 全量并行、机器负载 15–20 时就会超过 vitest 默认的 5 s；
- 单独跑这个文件时，26 个用例全过，用时 7.6 s。

体积门禁已转绿：entry 129.51 / 170，webgl 292.53 / 350。这个超时是剩下唯一的红项，所有新任务的 `pnpm check` 都会被它随机打红。

## 要做的事

二选一，优先第 1 种：
1. 改成用小型夹具内容根做构建，例如 `packages/data/src/build/__fixtures__/` 下几件物品和一章最小内容。断言不变：物品规则 / 文本是独立逻辑叶片、命名、分叶、hash。这样用例与仓库内容规模脱钩，并且是确定的。
2. 必须用真实内容时，给这个用例显式设置固定超时，例如 `it(..., 60_000)`，并在用例旁注释原因：真实内容的全量构建、I/O 密集、不是性能门禁。

不许做的：
- 按负载动态跳过或放宽（作者 AR-33）；
- 改全局 `testTimeout`；
- 改其他用例；
- 改 `tools/perf/**`。

## 约束

- 写集：`packages/data/src/build/build.test.ts`、`packages/data/src/build/__fixtures__/**`。写集外的改动在提交时会被丢弃。
- 不改 `packages/data/src/build/*.ts` 的实现、`content/**`、`docs/**`。
- 每次写入 ≤ 150 行；不加依赖。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/data test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 3 节写：
- 选了哪种做法；
- 该用例改前与改后单独运行的耗时；
- 全量 `pnpm test` 中该用例的耗时。

报告 ≤ 30 行。
