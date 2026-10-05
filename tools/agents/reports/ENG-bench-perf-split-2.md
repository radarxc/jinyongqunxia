# ENG-bench-perf-split-2 报告 · 游戏工程 · 小修：core/bench 剩余两条计时用例（事务总线 2000 步 ≤ 2000 ms、单次 ≤ 20 ms）挪到 check:perf（AR-64 / AR-33；断言不改）
## 1. 摘要（3–6 行）
- 将 `combat.test.ts` 的两条计时用例原样迁至 `combat.performance.test.ts`，原文件删除。
- 日常 `pnpm test` 显式排除新文件；`pnpm check:perf` 以既有串行参数收集该文件。
- 预热、采样、测试名称、`≤20 ms` 与 `≤2000 ms` 断言均未改，也未增加负载跳过或放宽逻辑。
## 2. 产出（文件、行数、主要章节）
- `combat.performance.test.ts` 27 行；删除 `combat.test.ts` 27 行；`package.json` 45 行、`vitest.config.ts` 54 行同步测试归属。
- `tools/perf/README.md` 19 行、`CLAUDE.md` 41 行：性能规则列明新增两条独立门禁。
## 3. 关键结论与数值
- 旧文件与新文件逐字比较 `cmp=0`；日常收集清单中目标文件及两条名称匹配数为 0。
- `check:perf` 启动负载 26.56/22.02/23.67、12 CPU；3 文件 / 6 测试通过，总耗时 6.72 s。
## 4. 开放问题（附默认值）
- 无；默认继续在低负载时单独运行，任何高负载失败均不改断言。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；本任务只调整测试归属、脚本与说明。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`、`pnpm test`（148 文件 / 1100 测试）与 `check:perf` 均退出 0。
- ✅ 严格 ID：已知未定义 1、冲突 0、新增失败 0；内容校验 1176 文件及 `pnpm size` 均通过。
- ✅ `git diff --check` 通过；只改允许路径，未改依赖、业务代码或 `tools/perf/budgets.json`。
- ⚠️ 原 `pnpm check` 在 lint、typecheck、1100 测试通过后因沙箱禁止 `tsx` IPC 退出 1；同脚本以 `node --import tsx` 运行通过，后续原 `pnpm size` 通过。
