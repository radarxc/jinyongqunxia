# 本任务：游戏工程 · 战斗补全 C：战斗规则收回 core（BattleSession / 命令总线 / 世界流派生种子 / 实战与回放一致；代码审计 S3、M3、L4）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-15-core-bus.md`（命令总线、`CoreTransaction`、world 流取种子的接口）、`ENG-16a-battle-geometry.md`、`ENG-16b-battle-actions.md`、`ENG-16d-damage-geometry.md`、`ENG-14b-meridian-golden-v3.md`，各第 7 节交给本任务的接口必须照做；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §2、§3.1 S3、§3.3 M3、§3.4 L4。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.5：「确定性」与「命令摘要兼容」两项闸门要求相同初始快照加相同命令在任何宿主上得到同一终局 hash。审计探针发现这一点现在做不到：同一份实战 transcript 交给 `runBattleReplay`，RNG 与胜负一致，但事件数 30 对 15。原因是战斗规则一半在 app 层：
- `apps/game/src/battle/runtime.ts` 持有战斗 RNG（约第 38 行）；
- 自动出手事件与终局判断在约第 142–149 行；
- 行动上限判平 `defaultMaxActions` 在约第 151 行；
- `apps/game/src/battle/demo.ts:12` 写死种子 20261001；
- `core/src/replay/index.ts:86-100` 建了 `aiRng` 却从没用过。

另外两项：
- M3：每次行动深拷贝两次整个 `BattleState`，`events` / `acceptedCommands` 越长越慢；app 又拷一次，还对每个单位做 `JSON.stringify` 判变化。
- L4：`ai/index.ts:96` 的 `simulateAbstractBattle` 自己用 `setup.seed` 重新播种，战斗中途调用会重放开局随机数。

## 规格（照这些写，不自创）

- `docs/design/09-combat-system.md`：
  - §2.11 胜负判定；§2.12 按进入情况生成 `BattleSetup`，种子在创建时由世界 RNG 给出（约第 479 行）；
  - 约第 2708 行：重试种子用 `hash(seed, retryCount)`；
  - §10.1 棋盘自动战斗；§13.1–§13.2、§13.5 状态、命令与领域事件。
- `docs/tech/05-gameplay-engine.md`：
  - §3.5 命令事务；§7.1 战斗状态机与初始化；§7.7 战斗结束；
  - §11.6 Core 与战斗循环挂接；
  - §14.3–§14.4 录像命令（act / deploy / order / free / setAuto / concede / retry / undo）、经脉快照进 hash、被拒命令不进前缀；
  - 第 1387 行一带：世界侧奖励只能经幂等的 `battle/finalize` 写入，回执为 battleId + outcomeSeq。
- `docs/tech/01-architecture.md` §3.6。

## 要做的事

1. **core `BattleSession`**：统一负责 battle RNG 的持有、自动步进、行动上限判平、自动出手事件与录像记录。app 只转发命令、消费投影。
2. **战斗命令进总线**，在 ENG-15 的 handler 注册表里加：
   - `battle/enter`：从遭遇或进入情况创建，在同一事务里从 world 流抽种子并推进 world 流；
   - `battle/act`（含 ENG-16b 的行动类型）、`battle/setAuto`、`battle/retry`（种子 `hash(seed, retryCount)`）、`battle/leave`；
   - `battle/finalize`：幂等，回执为 battleId + outcomeSeq；把奖励（武学使用次数、掉落、周天等）与战斗内消耗写回世界状态。
3. **app 变薄**：
   - `apps/game/src/runtime/session.ts` 的战斗分支改成 `core.dispatch`；
   - `apps/game/src/battle/runtime.ts` 去掉 RNG、判平与自动事件；
   - `demo.ts` 的种子改由世界流派生。
4. **实战与回放一致**：回放器能复现自动事件。加回归测试：app transcript 与 `runBattleReplay` 的会话 hash 必须相等。
5. **M3**：
   - 候选状态只克隆单位；事件进追加缓冲，提交时再拼接，避免大数组展开参数；
   - app 去掉第二次克隆；单位变化改用版本号判断。
6. **L4**：`simulateAbstractBattle` 改为接收调用方的 RNG。
7. **测试**：
   - 每个战斗命令一条成功、一条拒绝路径；第 k 步写入后抛错时，状态、RNG、版本全部回滚；
   - `battle/finalize` 执行两次只生效一次；
   - 战斗中 `world/tick` 返回 `WORLD_PAUSED`；
   - 世界流派生的种子确定，重试种子公式正确；
   - 实战 = 回放的 hash 回归；
   - 长战斗（行动上限）在实战与回放中结果一致；
   - 性能：2000 次行动的战斗不再 O(n²)，写进 `packages/core/bench/*.test.ts`，照 `combat.test.ts` 用 best-of-N；
   - 回放 golden 与应用层命令序列测试的变化逐项说明，不许直接重录。

约束：
- 写集：
  - core：`packages/core/src/{battle,ai,replay,testing,command,api,state}/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`；
  - 应用：`apps/game/src/battle/*.ts`、`apps/game/src/runtime/**`、`apps/game/CLAUDE.md`。
  - 写集外的改动在提交时会被丢弃。
- **不改**：
  - `apps/game/src/battle/components/**`、`packages/render/**`、`packages/ui/**`：按钮与高亮由 ENG-16e 做；
  - `packages/core/src/battle/meridian-flow/**`：除非对拍发现必须改，届时在报告说明；
  - `packages/data/**`、`apps/game/build/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。若只因机器负载挂在 rig 门禁，在报告写明负载与数值即可。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `pnpm --filter ./apps/game test`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 战斗命令表（命令 → handler → 拒绝码 → 事件）；
- `BattleSession` 的职责与状态；种子派生与重试公式；
- 实战 = 回放的证据（两边 hash）；
- 性能前后对比；golden 差异说明；
- 交给 ENG-16e（按钮可用性、可达 / 路径 / 方位查询、奖励投影）、ENG-22（整局录像）的接口。

报告 ≤ 100 行。
