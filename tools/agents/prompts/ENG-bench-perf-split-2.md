# 本任务：游戏工程 · 小修：core/bench 剩余两条计时用例挪到 `pnpm check:perf`（事务总线 2000 步 ≤ 2000 ms、单次 ≤ 20 ms），日常 `pnpm check` 不再跑；断言不改

本任务改测试的归属与脚本，不改业务代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。不要调用任何技能。

## 为什么做

- `packages/core/bench/combat.test.ts` 里还剩两条计时用例：
  - 「commits 2000 actions through the transaction bus within 2000 ms」；
  - 单次 ≤ 20 ms 的那条。
- 负载 25 以上时，它们会超过 5 秒默认超时，或越过阈值，集成分支的 prod_check 和各任务的 finish 校验都随机变红（10-03 21:58、22:07）。
- 协调者按作者「计时测试挪出去」（AR-64）与 AR-33 先例裁定（10-03 22:08）：挪到 `pnpm check:perf`。**断言与阈值一字不改，不加任何「高负载跳过 / 放宽」逻辑。**

## 要做的事

1. 照 ENG-bench-perf-split 的做法（报告 `tools/agents/reports/ENG-bench-perf-split.md`），把这两条原样挪进性能测试文件。可以并进 `packages/core/bench/battle-session.performance.test.ts`，或另建同类文件。原文件删掉这两条。原文件若只剩夹具或空了，按需整理。
2. 脚本：
   - 根 `package.json` 的 `test` 继续排除性能文件；
   - `test:perf` 包含它们，保持 `--no-file-parallelism`。
3. 文档：`tools/perf/README.md`、根 `CLAUDE.md`「性能规则」那一句，同步列上这两条门禁。
4. 验证：
   - `pnpm test` 不再跑这两条，给出佐证；
   - 跑一次 `pnpm check:perf`，记录负载与结果。高负载下失败不要改断言，如实报告。

## 约束

- 写集：
  - `packages/core/bench/**`；
  - 根 `package.json`：只改 scripts 的 `test` / `test:perf`；
  - 根 `vitest.config.ts`：只在必须时改；
  - `tools/perf/README.md`；
  - 根 `CLAUDE.md`：只改「性能规则」那一句。
- 不改阈值与断言；不改 `tools/perf/budgets.json`；不加依赖。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 25 行，写清：
- 挪到哪个文件；
- 脚本与文档改动；
- 佐证；
- `check:perf` 的实跑数据。
