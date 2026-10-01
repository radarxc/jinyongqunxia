# ENG-12b-perf-gate 报告 · 游戏工程 · render rig CPU 门禁测试抗负载化（ENG-12 遗留，批量校验在高负载机器上随机失败）

## 1. 摘要（3–6 行）

- rig CPU 门禁改为预热后 best-of-3：每轮仍采 600 帧并算 P95，三轮最小值用于断言。
- 新增独立 `perf` project；普通测试结束后才以单 worker 串行运行性能文件，且收集清单互斥。
- 0.80 ms 与 16.67 ms、角色数、帧数和 P95 定义均未放宽；三次完整 `pnpm test` 连续通过。
- best-of-3 已足够抗负载，未启用跳过断言的负载护栏；`pnpm check` 与严格 ID 校验最终全绿。

## 2. 产出（文件、行数、主要章节）

- `packages/render/src/rig/performance.test.ts`：145 行；预热、三轮采样、best-of-3、负载诊断、失败上下文与资源释放。
- `vitest.config.ts`：45 行；`node/ui/perf` 三 project，默认排除项保留，性能文件只由 `perf` 收集。
- `packages/render/CLAUDE.md`：26 行；新增“rig CPU 性能门禁（ENG-12b）”及备用护栏约定。
- `packages/render/tsconfig.json`：12 行；为 Node-only 性能测试显式加载既有 `@types/node`。
- `tools/agents/reports/ENG-12b-perf-gate.md`：本报告；未改 rig 运行时、根 `package.json` 或锁文件。

## 3. 关键结论与数值

- 测法：120 帧预热 + `3 × 600` 帧；每轮 `floor(600×0.95)=570` 索引取 P95，门禁取三轮 P95 最小值。
- 连续第 1 次：20 人 `0.189/0.081/0.126 → 0.081 ms`；100 人 `0.714/0.597/0.992 → 0.597 ms`。
- 连续第 2 次：20 人 `0.104/0.075/0.075 → 0.075 ms`；100 人 `0.356/0.382/0.352 → 0.352 ms`。
- 连续第 3 次：20 人 `0.098/0.073/0.074 → 0.073 ms`；100 人 `0.382/0.377/0.374 → 0.374 ms`。
- project：`node` 排除性能文件；`perf` 为单文件、`fileParallelism:false`、`maxWorkers:1`、`sequence.concurrent:false`、`groupOrder:1`。
- 护栏未启用；备用条件冻结为 `os.loadavg()[0] > os.cpus().length × 1.5`，届时仅 100 人门禁警告并跳过，低负载仍断言。
- Vitest 5.0.3 本地类型与实际收集结果已核对；官方 `fileParallelism` / `groupOrder` 资料于 2026-10-01 访问：<https://main.vitest.dev/guide/improving-performance.html>、<https://vitest.dev/blog/vitest-3-2>。

## 4. 开放问题（附默认值）

- 备用负载护栏何时启用：默认不启用；仅在隔离 + best-of-3 后仍连续失败时再按 §3 条件启用并留证。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无；本任务只提高测量抗负载性，不修改 `tech/09` 的硬预算或设计事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- 无；测法已写入 `packages/render/CLAUDE.md`，`docs/tech/09-character-rig.md` 按任务要求保持不变。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

- ✅ best-of-N：N=3；预热一次、每轮独立 600 帧 P95、取最小值，角色数与分位定义不变。
- ✅ 诊断：每轮输出 P95、最终最小值、三档 `loadavg`、CPU 数；断言失败消息包含全部轮次与负载。
- ✅ project 隔离：静态清单确认 `node` 无该文件、`perf` 恰有该文件；`groupOrder:1` 避免跨 project 并行。
- ✅ 三次连续 `pnpm test`：均为 19 文件 / 69 测试通过；逐轮数据见 §3。
- ✅ 验收：`pnpm install --frozen-lockfile`、`pnpm check`、`python3 tools/lint/check_ids.py --strict` 均通过。
- ✅ 护栏：三次均通过，按“最后手段”要求未启用；条件已记录在代码协作约定与报告。
- ✅ 变更边界：仅改允许路径；未执行改变仓库状态的 git 命令，未修改 rig 运行时。
- ⚠️ 中间修复：初版 `exclude` 覆盖默认项导致误收 `node_modules`，已合并 `configDefaults.exclude`；首次 `pnpm check` 缺 Node 类型，已显式配置后重跑全绿。
