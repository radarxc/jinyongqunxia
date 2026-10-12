# 本任务：城镇探索 v2 · 引擎侧性能门——寻路、行走 tick、区域场景帧更新三个门注册进 perf 项目；把误放在普通测试里的 `world-tick` 计时测试挪进 perf

**第一个动作**：读 `tools/agents/reports/ENG-town2-explore-graph.md`、`ENG-town2-explore-walk.md`、`ENG-town2-render-core.md` 的第 7 节（合成城夹具、tick 夹具、帧更新夹具怎么复用），再打开 `vitest.config.ts`（`node` 项目的 `exclude` 与 `perf` 项目的 `include`）、根 `package.json` 的 `test:perf` / `check:perf`、`packages/core/bench/{battle-session,combat}.performance.test.ts`（三轮最优 P95、打印 loadavg 的写法）与 `packages/core/bench/world-tick.test.ts`，以及 `docs/tech/15-town-explore-v2-spec.md` §10（三个门的夹具与阈值）；读完直接动手，不要先写计划。

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。先读根 `CLAUDE.md`：性能门**不在** `pnpm check` 里，由 `pnpm check:perf` 在机器负载低时单独跑（作者 AR-33 / AR-64）；禁止在任何测试里加「高负载跳过 / 放宽」逻辑；失败一律按真实退化处理。

## 背景
作者 AR-114（2026-10-10，逐字）：「点击小地图可以自动寻路。」城镇并入区域引擎后，一座城最大约 219×160 槽、约 2 万可站格、100 栋建筑；寻路、逐 tick 行走与区域场景每帧更新都要有可执行的性能门，防止以后退化。阈值来自 tech/15 §10，不得自行改动。

## 要做的事
1. **`packages/core/bench/explore-path.performance.test.ts`**：确定性合成城 219×160 槽（约 2.05 万可站格含室内、100 栋，夹具生成器放 `packages/core/bench/explore-city.fixture.ts`，固定种子 mulberry32）；门：建图 P95 ≤ 25 ms；200 对随机寻路 P95 ≤ 3 ms、最大 ≤ 10 ms；对角线寻路 P95 ≤ 5 ms；多目标与吸附 P95 ≤ 3 ms。三轮最优 P95，打印 loadavg 与 CPU 数。
2. **`packages/core/bench/explore-tick.performance.test.ts`**：同一城一条横穿全城的行走，`world/tick`（含动态投影）P95 ≤ 1.0 ms / 2000 tick；并断言步进期间 A* 调用 0 次（用 explore-walk 加的计数器）。
3. **`packages/render/src/region/explore.performance.test.ts`**：35 chunk、100 占位建筑、40 占位人物（用 render-ports 的占位端口）；帧更新 CPU P95 < 0.6 ms；预热后 600 帧堆增长 < 64 KiB。
4. **挪走旧计时测试**：`packages/core/bench/world-tick.test.ts` 改名为 `world-tick.performance.test.ts`（内容与阈值不变），从 `node` 项目移出、加入 `perf` 项目。
5. **注册**：`vitest.config.ts` 的 `node.exclude` 加上述四个文件、`perf.include` 加上它们；根 `package.json` 的 `test:perf` 文件列表同步加入。不改任何已有门的阈值。

## 测试 / 验证
- 结构断言（进 `pnpm check` 的普通测试，`packages/core/bench/perf-registration.test.ts` 或放在现有配置测试里）：四个性能文件不在 `node` 项目匹配内、在 `perf` 项目与 `test:perf` 脚本里（读配置文本断言）。
- 本任务的校验**不跑** `pnpm check:perf`（机器负载高时不稳定）；在报告里写出你在本机跑一次 `pnpm check:perf` 的结果与当时 loadavg（若负载高导致失败，如实写，协调者会在负载低时复跑）。

## 约束
- 只写：`packages/core/bench/explore-*.ts`、`packages/core/bench/world-tick*.ts`、`packages/core/bench/perf-registration.test.ts`、`packages/render/src/region/explore.performance.test.ts`、`vitest.config.ts`、根 `package.json`（只改 `test:perf` 的文件列表）与本任务报告。
- 不改被测代码（发现性能不达标时写进报告第 4 节，不要改实现、不要放宽阈值）；不新增依赖。
- 工具链以根 `package.json` 为准（pnpm 9.15.9、Node ≥ 22.12），`_code.md` 的 Node 24 / pnpm 12 / fast-check 不适用。

检查：
- `pnpm install --frozen-lockfile`
- `pnpm exec vitest run packages/core/bench/perf-registration.test.ts --config vitest.config.ts --project node`
- `env TIANSHU_VITEST_MAX_WORKERS=2 pnpm check`

## 报告
`tools/agents/reports/ENG-town2-perf-gates.md`（≤ 50 行）：第 3 节列三个门的夹具参数与阈值；第 6 节列本机一次 `check:perf` 的实测（P50 / P95 / 最大、loadavg、CPU 数）；第 4 节列不达标项（若有）；第 7 节写给协调者（何时复跑、看哪几行）。
