# 本任务：游戏工程 · 属性 v2（二）：rules protocol 4 战斗链——硬功 / 外放两支攻击、硬防与静态内劲抵抗、唯一速度 `spd`、Z4M 只乘一次、Z5M 恒等（AR-27）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`；
- 设计报告 `tools/agents/reports/DES-attr-v2.md`：§3（攻击、防御、速度、运转的算式与核算例）、§7「工程交接清单」的 `ENG-DMG-01`、`ENG-MER-01`、`ENG-GOLD-01`；
- 工程报告第 7 节交给本任务的接口（都在 `tools/agents/reports/`）：`ENG-27a-attr-v2-data.md`（八属性快照、`mpMax` 链）、`ENG-16c-battle-session.md`（BattleSession、实战 = 回放）、`ENG-16d-damage-geometry.md`（伤害链接几何）、`ENG-14b-meridian-golden-v3.md`（经脉协议 3 黄金与生产 runtime 对拍）。

## 为什么做

作者 AR-27：攻击 = 臂力 × 硬功 + 外放 × 经脉系数；速度 = 身法 × 轻功系数。DES-attr-v2 把它定为 **rules protocol 4**（design/04 v1.6、design/21、design/03、design/08）：
- 攻击分硬功、外放两支，经脉运转只进 Z1 外放支；
- 防御分硬防与静态内劲抵抗，防守经脉只在 Z4M 乘一次；
- Z5M 恒为 10000；
- 战斗速度只算一次。

现在 core 仍是 protocol ≤ 3：经脉合成值在 Z5M 消费，速度另乘 `meridianSpeedBp` / `evadeRatingDelta`。

本任务新增 protocol 4，并保留 protocol ≤ 3 回放。现有 golden 与回放 hash 必须零漂移。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- `packages/core/src/state/initial.ts`：`RULES_PROTOCOL = 3`；
- 伤害链在 `packages/core/src/battle/damage/**`，经脉在 `packages/core/src/battle/meridian-flow/**`，CT 与速度在 `packages/core/src/battle/timeline/**`，攻防面板（`atkOut/defOut/defIn`）在 `packages/core/src/economy/equipment.ts`；
- Python 参考 `tools/balance/damage_sim.py`、`projection_sim.py` 只覆盖 protocol ≤ 3。

## 规格（照这些写，不自创）

**数值来源**：只引用 design/03、04、05、21（DES-attr-v2 4e9daeb2 已合入，经审核），不自创数值、不改阈值。作者原话（AR-27）：
- 「速度是 身法 * 轻功系数（轻功基本系数 * 对应经脉强度带来的增幅）」；
- 「攻击是臂力 * 武功硬功 + 武功外放 * 对应经脉运转计算出的系数」；
- 「硬功防御（根骨）和内劲抵抗机制」。

文档算式是这几句的落地，照文档实现。文档与原话看似冲突时，不自行改数，在报告第 7 节登记。

- `docs/design/04-damage-formula.md`：
  - §1.3 取整点；§2 总公式与 §2.1 单段输入输出契约；
  - §3.1 / §3.4：protocol 4 守方 `eva_eff = eva`；`evadeRatingDelta` 只给 protocol ≤ 3 回放；
  - §4.1 Z1：`Aref=ATK_LV(Ce)`、`hardAttack`、`outwardAttack`、`D1h + D1o`；模板敌人先由八属性与路线档生成两支攻击；
  - §4.2 Z2：硬防与内劲抵抗分别穿透、各用对应攻击作 K，再相加；`ignoreDef` 同时置 0；
  - §4.4.1 Z4M：`meridianDefenseBp` 只乘一次；§4.5.1 Z5M：protocol 4 恒 10000；
  - §6.2：`neutralQiD10` 影子 trace，protocol 4 只把 `operationBp` 置 10000；
  - §8.8–§8.10 三个金标准算例；§10 / §11 测试表 T41–T44、T46。
- `docs/design/21-meridian-flow-and-moves.md`：
  - §3.5、§4.4、§4.4.4 经脉运转系数：普通 / 外放曲线二选一得 `baseOperationBp`，`circulationDamageBp`（完整周天 13500），`operationBp = clamp(…, 6500, 22000)`；
  - §4.8 外放抵消；
  - 「AR-27 覆盖声明」（约第 966 行）：逐脉 `progressH/gateH` 从已提交的 `MeridianProgress` 只读补齐，不写回投影，不改永久进度；
  - §14.12–§14.13；§17 MF-I16、MF-T34。
- `docs/design/03-attributes.md`：§4.1 攻防四项（硬防 `floor(Dref×con/50)`、内防 `floor(Dref×bre/50)`，各走统一静态管线 flat → pct → mult）；§4.3 `spd`（`qgBaseBp=clamp(7000+180g+120n,7000,10360)`，`spd=floor(agi×qgBaseBp×correspondingStrengthAmpBp/10000²)`，早 / 中 / 后例 `36/65/104`）；§9.1 重算清单。
- `docs/design/08-terrain-and-qinggong.md`：AR-27 战斗速度一节与 §末校验表——`spd` 唯一含经脉增幅；禁止旧 `meridianSpeedBp` / `moveDelta` 二次叠加；探索 `qinggong` / `qgTier` / `jump` 不受影响。
- `docs/design/09-combat-system.md`：首轮、CT、`mov` 只读最终 `spd`。
- 文档之间不一致时，以 design/04 v1.6 与 design/21 的 AR-27 条文为准，在报告里登记。

## 要做的事

1. **协议**：`RULES_PROTOCOL` 升到 4，沿用 ENG-15 的 `rulesProtocol` / `coreBuild` 机制。
   - 新开局用 4；读档与回放按记录里的协议号走对应 runner；
   - protocol ≤ 3 的全部 golden、回放 hash、`damage_sim.py --check` 结果一字不变。
2. **Z1 / Z2**：
   - Z1 两支攻击；
   - Z2 硬防与静态内劲抵抗，`innerDefense` 不得读路线或在途气；
   - Z4M 只乘一次 `meridianDefenseBp`，禁止在 Z2 或面板预乘；
   - Z5M 在 protocol 4 恒 10000；
   - `neutralQiD10` 影子 trace 按 §6.2。
3. **经脉运转**：
   - protocol 4 输出 `baseOperationBp`、`circulationDamageBp`、`operationBp`，只进 Z1 外放支；
   - 同时出现 `operationBp` 与非中性 `meridianAttackBp` 时拒绝（构建期校验 + 运行期断言，T44）；
   - 对应经脉强度按 21 的 AR-27 覆盖声明只读补齐 `progressH/gateH`。
4. **速度**：
   - 战斗 `spd` 按 03 §4.3 只算一次；首轮、CT、`mov` 只读它；
   - protocol 4 不再叠 `evadeRatingDelta`、`meridianSpeedBp`、`moveDelta`；
   - 探索侧的 `qinggong` 不动。
5. **模板敌人**：按 04 §4.1 末段，先由模板八属性与路线档生成两支攻击，再用 `P_actual = P_ref × tmplPower`。
6. **数据字段**：protocol 4 若缺招式 / 敌人模板字段（如 `wOutBp/wInBp` 的来源），只在 `packages/data/src/schemas/**` 做最小增补，并在报告列出。
7. **测试**：用字面向量，逐个中间值断言：
   - 04 §8.8–§8.10 三例：金钟罩高根骨 795、外放高手 5304、轻灵剑客 1190；
   - T41：12053 / 16271、13581 / 18334，四例 Z5M 都为 10000；
   - T42：硬功 540，外放 1109 / 821，总攻击 1649 / 1361；
   - T43；T44（双乘拒绝）；T46（`innerDefense=1100` 时 Z4M 得 1000 / 800）；
   - 21 MF-I16（含 `c=9999`）、MF-T34（四脉 → `spd=59`）；03 §4.3 早 / 中 / 后例 `36/65/104`；
   - protocol ≤ 3 回归零漂移；规范 hash 确定性；主线程宿主与 Worker 宿主结果一致。
8. **不在本任务**：十四书 42 格节奏锁（T45）与 Python protocol 4 参考 runner，由后续 ENG-27c 做。报告第 7 节写清 27c 需要的输入与接口。

## 约束

- 写集：
  - core：`packages/core/src/battle/**`（含 `meridian-flow/**`、`timeline/**`、`damage/**`）、`packages/core/src/economy/equipment.ts` 与 `packages/core/src/economy/types.ts`（攻防面板派生在这里，只改硬防 / 内防与两支攻击的面板）、`packages/core/src/progression/**`（只在属性派生读取需要时）、`packages/core/src/state/initial.ts`（只改协议号）、`packages/core/src/replay/**`、`packages/core/src/testing/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`；
  - data：`packages/data/src/schemas/**`（只做第 6 条的最小增补）；
  - 应用：`apps/game/src/battle/*.ts`（只做显示字段适配）。
  - 写集外的改动在提交时会被丢弃。
- **不改**：
  - `tools/balance/**`：现有 Python 参考与 golden 是 protocol ≤ 3 的回归基准；
  - `docs/**`、`content/**`、`packages/render/**`、`packages/ui/**`、`apps/game/src/battle/components/**`。
- core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`；每次写入 ≤ 150 行；不加依赖。
- 不得放宽、跳过或改写任何门禁测试，不得为通过测试改 golden。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `python3 tools/balance/damage_sim.py --check`
- `python3 tools/balance/meridian_flow_sim.py --check`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 规格条目 → 代码位置对照表（Z1、Z2、Z4M、Z5M、`spd`、运转）；
- protocol 分派与读档 / 回放规则；
- 向量测试表摘要；protocol ≤ 3 零漂移的证据；
- 交给 ENG-27c 的输入：42 格所需的模板、逐书 / N-E-B 的 `durabilityBp` / `attackBudgetBp` 读取点；
- 交给 ENG-28b 的接口：Z0 之后、护体之前的插入点，承诺内力字段；
- 文档漂移清单。

报告 ≤ 80 行。
