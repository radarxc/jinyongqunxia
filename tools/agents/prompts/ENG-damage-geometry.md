# 本任务：游戏工程 · 战斗补全 D：伤害链接入几何（方位 / 高差 / 地形 / 遮蔽 / LOS 命中修正；代码审计 H1）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-16a-battle-geometry.md`（几何 API、朝向、LOS）、`ENG-16b-battle-actions.md`（第 7 节交给本任务的接口）；
- 审计报告 `tools/agents/reports/AUDIT-code-20261002.md` §3.2 H1。

## 为什么做

ENG-16a 已经提供格网、站位、朝向、`directionBetween` 与 LOS，但伤害链一个都没读。结果是绕背、侧击、居高临下、遮蔽这些六角战术全部不生效，战斗结果与设计不符。以后再补的话，所有战斗 golden 都得重录，所以趁早做。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/core/src/battle/action/index.ts`（约 74–83 行）：
  - `direction: move.direction ?? 'front'` 取的是招式上的静态字段；
  - 没有传 `heightAddBp`、`terrainAddBp`、`evadeRatingDelta`；
  - `hitEff` 只有 `hit + hitMod`。
- `packages/core/src/hex/line.ts:105` 算出了 `hitPenalty`，但没有人用。

## 规格（照这些写，不自创）

- `docs/design/04-damage-formula.md`：
  - §3.1 第 133 行：`hit_eff = hit + move.hitMod + heightHit + cover.hit + LOS.hitPenalty`，守方 `eva_eff = eva + evadeRatingDelta`；
  - 高差命中每级 ±4 点、封顶 ±12；
  - §4.7 Z7 · 方位与地形：Z7 = 方向 × 高差 × 地形；
  - §6.1 结算总序；§7.5 群体与批次结算。
- `docs/design/09-combat-system.md`：
  - §4.5 朝向与方位：由「目标格 → 来源格」的方向与守方朝向离散判定 front / side / back；
  - §5.2 射程与高差；§5.5 视线怎么用。
- `docs/design/08-terrain-and-qinggong.md`：§3 地形表（遮蔽、冠层、烟雾）；§5.5 高低差对命中、伤害、射程的修正（Z7 正式接口）；§5.6 视线与遮挡；§7.3 地形效果的挂载。
- `docs/design/21` §4.9：`evadeRatingDelta` 只接纯经脉项，钳在 −35…+35。ENG-16b 若已给出这个投影就接上，否则留 0，并在报告里说明。

## 要做的事

1. 在 `settleTarget`（或等价处）里：
   - 由来源格与目标格按 §4.5 算出方位；
   - 高差命中修正、高差与地形的 Z7 乘区、遮蔽与 LOS 的命中修正都接进 Z0 / Z7；
   - 范围招式对每个目标单独判定。
2. 方位、高差、地形、遮蔽的计算写成 core 里的纯函数，范围预测和界面都调同一个（tech/05 §6.5 末段：render 不得再算几何）。
3. 设计文档之间的冲突（审计 L3）：design/04 §7.5 的目标结算顺序（按 unitIndex）与 design/09 第 1096 行（先按距离）不一致。代码维持 09 的做法，报告登记，交文档同步。
4. **测试**：
   - 方位 × 高差的向量表：front / side / back × Δh = −3…+3，命中与伤害逐项期望值；
   - 遮蔽、冠层、LOS 部分遮挡的命中修正；地形加值；
   - 范围招式各目标独立判定；
   - 规范 hash 确定性；拒绝路径不变。
   - 战斗 golden 与回放 hash 会变：逐项说明原因，不许直接重录。

约束：
- 写集：`packages/core/src/battle/**`（不含 `meridian-flow/**`）、`packages/core/src/hex/**`、`packages/core/src/testing/**`、`packages/core/src/replay/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`、`apps/game/src/battle/*.ts`（只做展示用的方位字段适配）。写集外的改动在提交时会被丢弃。
- **不改**：
  - `packages/core/src/battle/meridian-flow/**`（ENG-14b）、`packages/core/src/battle/timeline/**`（ENG-04b 刚改）；
  - `packages/core/src/{command,api,state,world,economy}/**`（ENG-15）；
  - `apps/game/src/battle/components/**`、`packages/render/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 接线点与公式对照（规格条目 → 代码位置）；
- 向量测试表摘要；
- golden 差异说明；
- 文档冲突登记；
- 交给 ENG-16c / 16e（预测与界面用的方位、命中修正查询接口）。

报告 ≤ 80 行。
