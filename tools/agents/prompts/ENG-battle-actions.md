# 本任务：游戏工程 · 战斗补全 B（防御 / 道具 / 急性聚气 / 逐单位经脉 / 奖励结算）

本任务写代码。"只改负责的文件""不执行改变仓库状态的 git 命令""不要停下来提问""报告如实"照常适用。沙箱已放开网络与 pnpm store 写入。

先读：
- 根 `CLAUDE.md`、`packages/core/CLAUDE.md`、`apps/game/CLAUDE.md`；
- 报告 `tools/agents/reports/ENG-16a-battle-geometry.md`：第 6、7 节交给本任务的接口必须照做。行动类型从 `BattleAction` / `resolveBattleAction` 扩展，事务测试沿用 `battle/action/index.test.ts`。
- 报告 `ENG-04-combat-core.md`、`ENG-14-meridian-golden.md`。

## 为什么做

路线图 `docs/tech/09-roadmap.md` §3.3：
- core 行要「CT、Z0–Z10、Buff 必需子集」；
- 经脉行要「逐单位实例、Core 注入单一 battle RNG、零副作用 preview」。

序章遭遇要用防御、道具、急性聚气（`docs/design/chapters/00-yuenv.md` §5.1–§5.4）。

战斗补全分三步：ENG-16a（几何与移动，已合入）→ **本任务 B** → ENG-16c（命令总线、界面按钮与高亮、`battle/finalize` 把奖励与消耗写回世界）。

现状（集成分支实测；开工先自己核对一遍，以实际代码为准）：
- 行动类型只有 `skill` 与 `wait`。界面的移动 / 防御 / 物品 / 聚气按钮由 ENG-16c 接，本任务只做 core 与应用层最小适配。
- 逐单位经脉：
  - 全仓没有 `meridianByUnit`；
  - `battle/action/index.ts` 用静态 `move.meridianAttackBp ?? 10_000`；
  - `battle/meridian-flow/runtime.ts` 已有零副作用 `preview`（返回复用的 scratch，存之前要复制）、`resolveMove`（提交，按段消费 battle RNG）、v2 snapshot / restore；
  - 缺：防御路线提交、调息、速度投影、满载查询。
- 急性聚气：`timeline/index.ts` 的 `acuteQiGather` 是另一套 `GatherState` CT 适配，双重记账。
- Buff 子集写死，没有 `bf_jiangu`、`bf_xieli`。
- `economy/consumables.ts` 的 `useConsumable(context:'battle')` 已管单场次数与冷却，但不管全场道具总上限。
- 奖励载荷为 `{null, null, null}`（`apps/game/src/battle/runtime.ts`）。

## 规格（照这些写，不自创）

- `docs/design/09-combat-system.md`：
  - §1.4.1 经脉实例生命周期；§3.4.1 满槽选择与急性聚气；
  - §4.8.3 物品：`itemUsesMax = 3 + floor(med/40)`，同 ID 冷却两次本方行动，收招 800 / 900 / 1000，演武 / 切磋禁用，校验通过后才扣；
  - §4.8.5 防御：`bf_jiangu` + `bf_xieli`、招架 +20、转向攻击者、收招 700 + flowCt；
  - §5.1 施放流程；§8.12 AI 聚气阈值；
  - §11.1–§11.4 奖励：结算顺序；使用次数普通 1、绝招 3；掉落用 `loot` 流；按 AR-19 没有人物经验；
  - §13.1 战斗状态；§13.2 行动与命令；§13.5 领域事件；§15.2 测试 T28、T40、T71。
- `docs/design/21-meridian-flow-and-moves.md` §11.4–§11.7：每次出手的固定流程；**路线判定（F3）在 Z0–Z10 判定（F6）之前**；确定性细则。
- `docs/tech/05-gameplay-engine.md`：
  - §3.3 L440 `meridianByUnit` 按 `unitIndex` 升序的数组；design/09 §13.1 写成 Record，以 tech/05 为准，在报告里登记这处差异；
  - §3.5 命令事务；§7.1 第 6 步：每个单位一份经脉实例，同模板只共享只读基底；
  - §7.2 事件驱动 CT：批量 tick 必须与逐 tick 等价；§7.7 倒地与战斗结束；
  - §11.2 战斗经脉模块：preview 只读、不用 RNG，提交只在命令事务里用 `battle` 流；
  - §14.3 L2162 v2 snapshot 必存字段。
- `docs/design/05-martial-arts-system.md` §8.2 实战经验按使用分配。

## 要做的事

1. **逐单位经脉**：
   - `BattleState.meridianByUnit[]` 按 tech/05 §3.3 / §14.3 存 v2 snapshot 与 `activeDefense` / `movementProjection` / `innerGuard`；
   - 运行时 cache 只是可重建的索引；
   - CT 跳跃时批量 tick，与逐 tick 结果相同；
   - 有路线的招式在 Z0–Z10 之前提交路线，`meridianAttackBp` 与 flowCt 取实际值，周天暴击事件照发；
   - 不要在路线掷骰之前先掷命中：把暴击事件的构造拆出来。
2. **急性聚气**：
   - `action: { t: 'acuteQiGather', routeRef }`，不能带 `walkTo`；路线必须是已打通的攻击路线；
   - 满载未周天仍推进；满载且已周天拒绝，原因码 `QI_CARRY_FULL`；0 RNG；收招 1000；算一次本方行动；
   - 去掉 `GatherState` 双重记账；补只读的满载 / 聚气状态查询。
3. **防御**：
   - 按 §4.8.5 加 `bf_jiangu`、`bf_xieli`，转向攻击者，收招 700 + flowCt；
   - 防御路线需要的提交接口目前缺失，带 `routeRef` 的防御先拒绝，报告列出缺口。
4. **道具（只在战斗内）**：
   - 战斗背包副本与道具定义由 `BattleSetup` 带入；
   - 总上限 `itemUsesMax`、同 ID 冷却、收招、演武禁用都在 core 判；
   - 消耗只记在 battle 状态里，写回世界背包由 ENG-16c 的 `battle/finalize` 做；
   - 不改 `packages/core/src/economy/**`：ENG-15 会改使用次数的归属，需要的接口写进报告。
5. **奖励**：
   - 纯函数 `computeBattleRewards`：武学使用次数（普通 1、绝招 3）、移动 ≥ 3 次、周天次数、`BattleSetup` 声明的掉落；
   - 只有给了掉落池才用 `loot` 流；
   - 发 `battle/rewards` 事件；
   - 不写世界状态。
6. **AI**：按 §8.12 阈值让 AI 会聚气；无几何的模拟自动战斗不动。
7. **应用层最小适配**（`apps/game/src/battle/*.ts`）：
   - 演示夹具补经脉输入与战斗背包；
   - `runtime.ts` 把奖励载荷换成 core 结果；
   - `components/*.vue` 不改（ENG-16c）。
8. **测试**：
   - T28、T40、T71、防御；
   - 两个同模板单位的经脉互不影响；
   - 批量 tick 等于逐 tick；
   - 提交前做 0 / 1 / 100 次 preview，RNG 与终局 hash 都相同；
   - 用固定 RNG 向量证明路线判定先于命中判定；
   - 战斗中途 snapshot → restore，终局 hash 相同；
   - 奖励确定、无掉落池时不用 RNG；
   - 每个新拒绝码一条测试，拒绝后状态与 RNG 不变；
   - 回放 golden 的变化逐项说明，不许直接重录。

约束：
- 写集：
  - `packages/core/src/battle/**`（含 `meridian-flow/**`）、`packages/core/src/buff/**`、`packages/core/src/ai/**`、`packages/core/src/replay/**`、`packages/core/src/testing/**`、`packages/core/bench/**`、`packages/core/CLAUDE.md`；
  - `apps/game/src/battle/*.ts`、`apps/game/CLAUDE.md`。
  - 写集外的改动在提交时会被丢弃，所以不要改写集外的文件。
- **不改**：
  - `packages/core/src/{command,api,state,world,economy}/**`（ENG-15）；
  - `apps/game/src/battle/components/**`、`packages/render/**`（ENG-16c / ENG-21）；
  - `apps/game/src/runtime/**`、`packages/data/**`、`apps/game/build/**`。
  - 确实需要改这些才能完成的，在报告里写明需要什么，不要改。
- 分层：规则只进 core；core 禁浮点、禁 DOM、禁墙钟、禁 `Math.random`。
- 每次写入 ≤ 150 行；不加新依赖；新导出走子目录 index。
- 不得放宽、跳过或改写任何门禁测试。rig 100 角色性能门禁已移出 `pnpm check`（作者 AR-33），改由 `pnpm check:perf` 在负载低时单独跑；不得在测试里加任何「高负载跳过」逻辑，不得改阈值。

性能是作者硬要求（AR-21「性能要最好」）：经脉 tick 与 preview 热路径零分配；新增性能断言照 `combat.test.ts` 用 best-of-N。

检查：以下命令必须全部通过。
- `pnpm install --frozen-lockfile`
- `pnpm check`（apps/game 的测试由根 `pnpm check` 覆盖）
- `pnpm --filter @tianshu/core test`
- `pnpm --filter @tianshu/core test:performance`
- `pnpm --filter ./apps/game build`
- `python3 tools/lint/check_ids.py --strict`

## 报告

第 7 节写：
- 行动类型与拒绝码表；
- `meridianByUnit` 结构与 tech/05 字段对照，以及与 design/09 §13.1 的差异；
- 经脉提交与 Z0–Z10 的先后，附 RNG 向量证据；
- 道具规则；奖励载荷样例；
- 测试与性能；golden 差异说明；
- 未做项：防御路线、调息、速度投影；
- 交给下游的接口（放哪、怎么测、接口名）：ENG-16c（命令总线、按钮可用性查询、`battle/finalize` 要写回的奖励与消耗）、ENG-15（战斗内使用次数与 `usage.battleUses` 的关系）、属性改造任务（移动 / 速度输入）。

报告 ≤ 100 行。
