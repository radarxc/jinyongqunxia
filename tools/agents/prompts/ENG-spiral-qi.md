# 本任务：游戏工程 · 《长生诀》运行时（二）：第九层螺旋内力 `Z0-CS`（1 点化解 20 点承诺内力、多段共用一次、经脉伤害只计螺旋新增部分的 100%）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- 设计报告 `tools/agents/reports/DES-changsheng-core.md`：§3、§4 开放问题（「经脉伤害 100%」的默认解释）、§7 字段清单 `ENG-CS-07`～`ENG-CS-09`；
- 工程报告第 7 节交给本任务的接口（都在 `tools/agents/reports/`）：
  - `ENG-27b-attr-v2-combat.md`：Z0 之后、护体之前的插入点、承诺内力字段、protocol 分派；
  - `ENG-28a-booksleep-general.md`：`changshengLayer` 读取；
  - `ENG-16c-battle-session.md`：BattleSession、实战 = 回放。

## 为什么做

作者 AR-26：《长生诀》第九层的「螺旋内力：1 点化解对方 20 点内力」。规格在 `docs/design/25-changshengjue.md` §3，均为【建议值】；默认解释待作者确认，见 design/25 §13.5 与 `TODO.md` §8.2。

战斗管线（protocol 4）由 ENG-27b 做完，层数由 ENG-28a 做完。本任务只把 `Z0-CS` 接进伤害链。

## 规格（照这些写，不自创）

**数值来源**：只引用已合入、经审核的设计文档 design/04、21、25（DES-changsheng-core 7fbc0c78），不自创数值。核心机制以作者原话（AR-26）为准：「螺旋内力（消解率1:20，经脉伤害100%）」，作者补答「化解对方内力」，即每 1 点螺旋内力化解对方 20 点内力。

「经脉伤害 100%」的默认解释（只计螺旋新增的实际伤害）是 design/25 §3.3 的【建议值】，待作者确认。照文档实现，并把它做成一处可替换的规则常量。文档与原话看似冲突时，不自行改数，在报告第 7 节登记。

- `docs/design/25-changshengjue.md`：
  - §3.1：`cancelMp = min(opponentMpCommitted, 20 × spiralSpent)`，最低投入 `ceil(M/20)`，余量不结转；
  - §3.2 `Z0-CS`：在 Z0 合法性 / 资源锁定之后、护体真气与护体内劲之前执行。按对象处理：内劲攻击 / 外放、护体真气、护体内劲、纯外功、持续伤害；同一伤害事件只执行一次，多段招共用；
  - §3.3：经脉伤害只加 `spiralDamageDealt × 100%`；
  - §12：CS-V10、CS-V11；金标准 CS-T04～T06。
- `docs/design/04-damage-formula.md`（DES-sync-design-b b6fc912d 已同步）：
  - §2 区序；
  - §3.5 `Z0-CS`：`SPIRAL_CANCEL_BP=200000`，`cancelCapacity=floor(spiralSpent×200000/10000)`；
  - §6.1～§6.2：结算总序、护体与影子 trace 做法、`spiralMeridianDamage`；
  - 校验 V30–V31，测试 T47–T49。
- `docs/design/21-meridian-flow-and-moves.md`（同上已同步）：
  - §4.4：时序为「资源锁定 → Z0 → Z0-CS → Z1…Z10」；
  - §4.8 护体预算：`guardBudgetBp=floor(remainMp×10000/opponentMpCommitted)`；
  - §4.8.1：经脉伤害节点分配；P7 前冻结 `eligibleNodes`，无合格穴记 `unallocated`；
  - §12 接口：`SpiralCancelSnapshot` 序列化，按 `causeId` 幂等。

## 要做的事

1. **行动字段**：战斗行动可带 `spiralSpent`。
   - 只在 `changshengLayer == 9` 时允许；不超过当前 `mp`；
   - 提交时原子扣费；
   - 预览不扣费、不耗 RNG。
2. **`Z0-CS`**：位置在 Z0 合法性 / 资源锁定之后、护体之前，每个伤害事件执行一次。
   - 攻方内劲攻击 / 外放：从本次承诺内力扣 `cancelMp`，按剩余内力重算内力贡献；硬功部分不被抹去；
   - 守方护体真气 / 护体内劲：先扣本次承诺给护体的内力，再按剩余量走既有结算；
   - 纯外功（承诺内力为 0）：不可化解；持续伤害与已生成的场地不追溯；
   - 多段招整个事件共用一次（CS-T05）。
3. **经脉伤害**：`spiralDamageDealt` 取「有螺旋」与「同一已决 trace 把 `cancelMp` 置 0 的影子 trace」之差，口径照 04 §6.2 的影子 trace 做法。只把这个差值的 100% 计入经脉伤害（CS-T06），部位分配与上限走 21 的既有路径。
4. **预览**：显示双方承诺内力、最低螺旋投入、剩余内力、预计伤害区间。
5. **AI**：只给接口，默认不让敌人使用。
6. **测试**：
   - CS-T04：投入 18 / 19，分别化解 360 剩 17、化解 377 剩 0；
   - CS-T05：三段招共用承诺内力 600、投入 10，整个事件只化解 200；
   - CS-T06：螺旋新增 135、整招最终 900，经脉伤害加 135；
   - CS-V10、CS-V11；04 的 V30–V31、T47–T49；
   - 21 §4.8 算例：承诺 300、剩余 75 得 2500 bp，`rawOutwardQi` 1200→300，抵消 250、剩余 750；
   - 135 对三穴稳定分为 45 / 45 / 45；
   - 非九层拒绝；预览零 RNG、零写；
   - protocol ≤ 3 回放零漂移；规范 hash 确定性。

## 约束

- 写集：`packages/core/src/battle/**`、`packages/core/src/replay/**`、`packages/core/src/testing/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`、`apps/game/src/battle/*.ts`（只做显示字段适配）。写集外的改动在提交时会被丢弃。
- **不改**：`packages/core/src/{progression,state,command,api,world}/**`（ENG-28a；缺接口就在报告提出）、`tools/balance/**`、`docs/**`、`content/**`、`packages/render/**`、`packages/ui/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试，不得为通过测试改 golden。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `python3 tools/balance/damage_sim.py --check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- `Z0-CS` 插入点与逐对象处理对照表；
- 向量测试表；
- 交给界面任务（战斗 HUD 螺旋投入与预览）的查询与命令；
- 待作者确认的默认解释（经脉伤害 100%、1:20）在代码里的开关位置；
- 文档漂移清单。

报告 ≤ 60 行。
