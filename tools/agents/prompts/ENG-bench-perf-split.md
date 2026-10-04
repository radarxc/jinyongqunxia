# 本任务：游戏工程 · 小修：core/bench 的 BattleSession 线性断言（2000 步 ≤ 1000 步 × 3）挪到 `pnpm check:perf`，日常 `pnpm check` 不再跑；断言本身不放宽

本任务改测试的归属与脚本，不改业务代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开 pnpm store 写入。不要调用任何 Trae 技能。

## 为什么做

- `packages/core/bench/combat.test.ts` 的用例「keeps a 2000-action BattleSession linear enough for the action cap」断言 `fullMs ≤ 2000` 且 `fullMs ≤ halfMs × 3`（ENG-16c 加的）。
- 机器负载 30–50 时它偶发失败。例如 10-03 18:37 实测 269.6 ms，上限是 75.4 × 3 = 226.2 ms；单独重跑又能过。
- 各任务的 `pnpm check` 和集成分支的 prod_check 都因此随机变红。
- 协调者按 AR-33 先例裁定（10-03 19:31，AR-64 同批），rig 门禁就是这么处理的：这条断言挪到 `pnpm check:perf`，只在机器负载低时单独跑。日常 `pnpm check` 不再跑它。**断言与阈值一字不改，不加任何「高负载跳过 / 放宽」逻辑。**

## 要做的事

1. 把这条用例原样挪进单独的性能测试文件，命名照 rig 的先例，例如 `packages/core/bench/battle-session.performance.test.ts`：
   - 预热、best-of 采样次数、两条 expect 都不改；
   - 用到的 fixture 照常 import；
   - 原文件删掉这条用例，其余用例保留不动。
2. 脚本：
   - 根 `package.json` 的 `test` 用 `--exclude` 排除新文件，写法同 rig 的 `performance.test.ts`；
   - `test:perf` 把新文件加进去，保持 `--no-file-parallelism`；
   - `check:perf` 照旧先打印负载再跑 `test:perf`。
3. 文档：
   - `tools/perf/README.md` 补一句：`check:perf` 包含哪两项门禁、为何不在 `pnpm check` 里；
   - 根 `CLAUDE.md`「性能规则」里讲 rig 门禁的那一句，补上 BattleSession 线性门禁同样由 `pnpm check:perf` 在低负载时单独跑。只改这一句的内容，禁止加跳过或放宽的措辞保留不动。
4. 同文件里另外两条计时用例（单次 ≤ 20 ms、事务总线 2000 步 ≤ 2000 ms）**不动**。若你观察到它们也受负载影响，在报告里写出数据，交协调者另定。
5. 验证：
   - `pnpm test` 不再跑新文件，可用 vitest 的 list 输出或日志佐证；
   - 在本工作区跑一次 `pnpm check:perf`，记录负载与结果。高负载下失败不要改断言，如实写进报告。

## 约束

- 写集：
  - `packages/core/bench/**`
  - 根 `package.json`：只改 scripts 的 `test`、`test:perf`
  - 根 `vitest.config.ts`：只在排除或包含必须改配置时动
  - `tools/perf/README.md`
  - 根 `CLAUDE.md`：只改「性能规则」那一句
  - 写集外的改动在提交时会被丢弃。
- 不改阈值、采样方式与断言；不改 `tools/perf/budgets.json`；不加依赖。
- 每次写入 ≤ 150 行；不得在 `/private/tmp` 做整仓检出（_common 规则 12）。

检查：以下命令必须全部通过。`check:perf` 受负载影响，不放在自动校验里，由你跑一次并报告。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `python3 tools/lint/check_ids.py --strict`

## 报告

≤ 30 行，写清：
- 新文件名；
- 脚本与文档改动；
- `pnpm test` 不再包含该文件的佐证；
- `check:perf` 实跑的负载与数值。
