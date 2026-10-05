# 本任务：游戏工程 · 小修：存储层两条「1 MiB 快照 50 ms 内」计时断言挪到 `pnpm check:perf`（照 ENG-bench-perf-split 先例），日常 `pnpm check` 只留功能断言；断言与阈值不改

本任务改测试的归属与脚本，不改业务代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- `packages/platform/src/storage/storage.test.ts` 有两条用例带墙钟计时断言：
  - 「loads a 1 MiB snapshot within the 50 ms fake-indexeddb budget」；
  - 「stores a 1 MiB snapshot within the 50 ms fake-indexeddb budget」。
- 机器负载 40 左右时，store 那条实测 133 ms，集成分支 prod_check 变红（10-04 00:42，TOOL-ingest-cropframe 合入后）。各任务的 finish 校验也会随机栽在这里。
- 先例：ENG-bench-perf-split、ENG-bench-perf-split-2，协调者按 AR-64「计时测试挪出去」与 AR-33 裁定：挪到 `pnpm check:perf`，**断言与阈值一字不改，不加任何「高负载跳过 / 放宽」逻辑**。

## 要做的事

1. 拆分两条用例：
   - 计时断言（`toBeLessThan(50)`）原样挪进性能测试文件，例如 `packages/platform/src/storage/storage.performance.test.ts`；
   - 功能断言（1 MiB 快照能存、能读回、字节数一致）留在 `storage.test.ts`，去掉计时部分，日常 `pnpm check` 照样覆盖。
2. 脚本：根 `package.json` 的 `test` 排除新的性能文件，`test:perf` 包含它，保持 `--no-file-parallelism`。
3. 文档：`tools/perf/README.md`、根 `CLAUDE.md`「性能规则」那一句，同步列上这两条门禁。
4. 验证：
   - `pnpm test` 不再跑这两条计时断言，给出佐证；
   - 跑一次 `pnpm check:perf`，记录负载与结果。高负载下失败不要改断言，如实报告。

## 约束

- 写集：`packages/platform/src/storage/storage.test.ts`、`packages/platform/src/storage/*.performance.test.ts`、根 `package.json`（只改 scripts 的 `test` / `test:perf`）、`tools/perf/README.md`、根 `CLAUDE.md`（只改「性能规则」那一句）。写集外的改动在提交时会被丢弃。
- 不改阈值与断言；不改 `tools/perf/budgets.json`；不加依赖。每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 15 行，写清：挪了哪两条、功能断言留在哪、脚本怎么改、`check:perf` 实跑结果（注明负载）。
