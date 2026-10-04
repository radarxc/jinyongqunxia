# ENG-content-plugin-timeout 报告 · 游戏工程 · 小修：content-plugin「town integration」集成用例加显式超时 60 秒（断言功能不是速度；高负载下默认 5 秒超时误报）
## 1. 摘要（3–6 行）
- `town integration` 用例显式设为 `60_000` ms，并注明它构建完整作者内容、不是性能断言。
- 原有断言全部保留；未改其他测试、Vitest 全局配置或性能门。
- 同文件另一条仅编译单个 Ink fixture，不是同类完整内容构建用例，故未改。
## 2. 产出（文件、行数、主要章节）
- `apps/game/build/content-plugin.test.ts`：50 行；目标用例注释与第三参数。本文：20 行。
## 3. 关键结论与数值
- 仅改 `emits authored NPC presence and event-anchor registries with town data`；超时为 60 秒。
- 本机定点实跑：Vitest 用例耗时 1,199 ms；前/后 loadavg 为 13.89/13.11/15.19、12.89/12.92/15.10（12 CPU）。
## 4. 开放问题（附默认值）
- 无；默认继续把该用例视为功能集成测试，不作速度门。
## 5. 对基准的修改提案（编号 / 提案 / 理由）
- 无。
## 6. 需同步到其他文档（文档 / 位置 / 改什么）
- 无。
## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）
- ✅ `pnpm install --frozen-lockfile`、game typecheck 均通过。
- ✅ game test：32 文件/109 用例；严格 ID：新增失败 0。
- ✅ 断言零改动；未改全局超时、其他测试及 `packages/core/bench/**`；写集符合约束。
