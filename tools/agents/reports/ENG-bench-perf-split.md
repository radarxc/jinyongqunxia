# ENG-bench-perf-split 报告 · 游戏工程 · 小修：core/bench 的 BattleSession 线性断言挪到 pnpm check:perf（AR-33 先例；断言与阈值不改，不加高负载跳过）
## 1. 摘要（3–6 行）
- 新建 `packages/core/bench/battle-session.performance.test.ts`，从 `combat.test.ts` 原样迁移 BattleSession 线性用例。
- 日常 `pnpm test` 排除该文件；`pnpm check:perf` 串行运行 rig 与 BattleSession 两项性能门禁。
- 预热、best-of-5、`≤2000 ms` 与 `≤halfMs×3` 均未改；未加负载跳过或放宽逻辑。
## 2. 产出（文件、行数、主要章节）
- 新文件 20 行；`combat.test.ts` 27 行；`package.json` 45 行；`vitest.config.ts` 52 行：拆分与收集归属。
- `tools/perf/README.md` 19 行、`CLAUDE.md` 41 行：两项独立门禁及 AR-33 / AR-64 口径。
## 3. 关键结论与数值
- `pnpm test` 相关项仅列 `combat.test.ts` 的 20 ms 与事务总线 2000 ms 两例；未列新文件或 rig 文件。
- `check:perf` 启动负载 41.61/41.53/31.28、12 CPU；2 文件 / 4 测试通过，rig 最小 P95 为 0.078/0.473/0.317 ms。
- 同 fixture 诊断：负载 38.79/40.54/31.59；1000 步 65.504 ms，2000 步 116.624 ms，1.780×。
## 4. 开放问题（附默认值）
- 无；默认继续只在低负载时单独跑 `pnpm check:perf`，高负载失败不得跳过或放宽。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无；仅调整测试归属与脚本。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ 原用例逐行迁移；另外两条计时用例未改；无依赖、业务代码、预算或阈值改动。
- ✅ `pnpm install --frozen-lockfile`、严格 ID（新增失败 0）、`check:perf` 均退出 0。
- ✅ `pnpm check`：lint/typecheck、149 文件 1092 测试、内容 1176 文件、构建/体积均通过。
- ⚠️ 沙箱禁止 `tsx` CLI 建 IPC socket；完整 `check` 以临时无 IPC shim 执行同一脚本，未改仓库。
