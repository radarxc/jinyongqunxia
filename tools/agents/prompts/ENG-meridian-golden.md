# 本任务：游戏工程 · 经脉 runner 黄金对拍与零副作用 preview

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- ENG-03 报告 `tools/agents/reports/ENG-03-qi-runtime.md`、ENG-00b 报告 `tools/agents/reports/ENG-00b-rng-int.md`（其中 O2 一条）。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.5「经脉黄金」闸门要求：
- TypeScript runner 消费与 Python 同一份 `fixtureVersion=2` 黄金工件；
- `inputs` 与全部 `outputs` 逐字段相等。比对范围包括：路线 trace / 质量 / CT、四单位隔离、三段 `battleRng`、攻防护体、速度 / 控制 / 调息、归一化和五档 TTK；
- 只比最终伤害不算通过；CI 禁止自动 `--write-golden`。

M1 / M2 都不可延后。现状：
- `tools/balance/meridian_flow_golden.json` 只有 `tools/balance/meridian_flow_sim.py` 在读，没有任何 TS 测试消费；
- `packages/core/src/battle/meridian-flow/runtime.ts` 的 `MeridianFlowRuntime` 没有零副作用 preview。

## 规格

`docs/design/21-meridian-flow-and-moves.md`（经脉的归属文档）：
- §1.5 设计不变量：preview 不改状态、不消费 RNG；
- §11.5 对外接口语义：preview 默认 `roll=9999`，返回 `stateVersion`、每段 `jamChanceBp` 与整数累计到达概率；
- §11.7 确定性细则：preview 前后断言 RNG state 与节点 hash 不变；fixture 版本号任一变化都要逐项评审后才能更新 golden；
- §11.8 性能预算：单路线 preview 走 0 次 RNG，≤ 0.15 ms【建议值】；
- §12.3 TypeScript 契约：`PreviewOptions`、快照 `meridian-flow-state.v2`；
- §17。

两处已有裁定（协调者 10-01）：
- **快照名**：保持 `meridian-flow-state.v2`。design/21 v2.0 是归属文档；tech/08 与 tech/09 里写的 v1 是旧文。不要改名，在报告「需协调者同步」里列出这些旧文位置。
- **golden 的 rngProtocol**：golden 文件标的是 `rngProtocol:1`，但它只用 `nextU32()%10000`，不依赖 `intInclusive`（ENG-00b O2），sfc32 原始输出在协议 2 下没变。所以直接拿来对拍，**不要重录**。

## 要做的事

1. **TS 黄金对拍测试**（`packages/core/src/battle/meridian-flow/` 下新建 `*.golden.test.ts`）：
   - 读 `tools/balance/meridian_flow_golden.json`，先校验 `vectorSha256` 与 `masterSeed`；
   - 对每个输入向量跑 TS runner，`outputs` **逐字段**比对，失败时打印首个差异的路径与两边值。
2. **处理不一致**：TS 与 golden 不一致时，按 design/21 判定谁对。
   - TS 偏离 design/21：修 TS runner。
   - golden / Python 偏离 design/21：**不改 golden JSON**。在报告里逐条写出差异、design/21 依据和建议，交协调者裁定；对应用例在测试里标为已知差异并附条目号，不准静默跳过。
3. **零副作用 preview**：
   - 在 runtime 上实现 §11.5 的 `preview(route, options?: PreviewOptions)`；
   - 测试断言调用前后 RNG state、实例 `stateVersion` 与节点 hash 都不变；
   - 预分配 scratch，不在热路径上分配内存；
   - 写一条性能测试，单路线 preview 中位数要在预算内（只报告，不阻断）。
4. **确定性门禁**：把对拍测试纳入 `pnpm --filter @tianshu/core test`；仓库里不能有任何自动写 golden 的路径。若 Python 脚本里有 `--write-golden`，确认 CI / 脚本没有调用它。

约束：
- core 只用整数（ESLint 会拦浮点），不得引用 render / platform / DOM；
- 不改战斗主循环接线（`battle/action`），那是后续「战斗补全」任务的事；
- 不改 `tools/balance/meridian_flow_golden.json`；
- 每次写入 ≤ 150 行。

检查：以下命令必须全部通过。
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 对拍覆盖的字段清单与向量数；
- 一致 / 不一致统计；
- 每个不一致项的判定与依据；
- preview 接口与不变量测试；
- 性能数据；
- 「需协调者同步」：tech/08、tech/09 里的旧快照名，以及 golden 的协议标注。

报告 ≤ 100 行。
