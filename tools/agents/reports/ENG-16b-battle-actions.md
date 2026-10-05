# ENG-16b-battle-actions 报告 · 游戏工程 · 战斗补全 B（防御 / 战斗内道具 / 急性聚气 / 逐单位经脉 / 奖励结算）

## 1. 摘要（3–6 行）

- 已把 `BattleAction` 扩为武学、道具、防御、急性聚气、等待五类，并保持校验失败时状态与 battle RNG 均不变。
- 已接入逐单位经脉 v2 快照、批量 CT tick、F3 路线先提交、零副作用 preview/查询与单一 battle RNG。
- 已实现无路线防御、战斗背包消耗、确定性奖励事实、`battle/rewards` 事件、AI 聚气和应用层奖励适配。
- 防御路线、调息、速度投影及世界写回按任务边界保留为下游接口；没有人物经验结算。
- 本轮只解决挪基点后的两处冲突及失效导入，并按集成分支当前测试规模重跑全部指定门禁。

## 2. 产出（文件、行数、主要章节）

| 文件组                          |                      规模 | 主要产出                                                                |
| ------------------------------- | ------------------------: | ----------------------------------------------------------------------- |
| `battle/action`                 |              672 + 649 行 | 五类行动、事务、道具/防御/聚气、T28/T40/T71 与拒绝测试                  |
| `battle/meridian-flow`          |    6 个改动文件，1,617 行 | v2 快照、查询/提交、批量 tick、逐单位恢复；保留无双账本的聚气门面       |
| `battle/rewards`                |          新增 50 + 103 行 | `computeBattleRewards`、幂等事件及 loot 测试                            |
| 其余 core / bench               |                 16 个文件 | setup、伤害判定、Buff、AI、回放、夹具与性能门禁                         |
| `apps/game/src/battle` / CLAUDE |          6 个文件，544 行 | 演示输入、独立 loot RNG、奖励载荷与契约                                 |
| 总计（不含本报告）              | 32 个路径，+2,191/-347 行 | 旧 `GatherState` 已移除；`gather` 文件改为 runtime 薄门面并保留回归测试 |

## 3. 关键结论与数值

- 道具总次数为 `3 + floor(medical / 40)`：医术 0/40/80 对应 3/4/5；同 ID 在 k 使用后禁 k+1、k+2，k+3 可用。
- 道具收招：consume/apply=800、throw/dose=900、load=1000；天级丹药及 `uniqueUse` 按全场所有单位合计只允许一次。
- 无路线防御收招 700，施加 `bf_jiangu`、`bf_xieli`，招架 +20 并在近战来袭时面向攻击者；带路线请求拒绝。
- 急性聚气收招 1000、计一次自身行动、禁止 `walkTo`、只接受已打通攻击路线且消耗 0 RNG；满载且已周天返回 `QI_CARRY_FULL`。
- AI 仅在有几何战斗中于收益 ≥1500 bp 且承受未来两击后的生存估计 ≥5000 bp 时聚气；抽象模拟保持不聚气、不移动。
- 奖励只返回使用事实（普通 1、绝招 3）、移动至少 3 次、周天次数及 setup 声明掉落；仅随机掉落池抽取使用 `loot` 流。

## 4. 开放问题（附默认值）

1. 防御路线缺少提交 API；默认 `guard.routeRef` 返回 `MERIDIAN_ROUTE_BLOCKED`，无路线防御继续可用。
2. 调息与速度投影未接行动/时间线；默认不改变当前基础速度，外层字段保持 `null`。
3. `BattleSetup.rules.mode` 无 `arena`；默认 `noItems=true` 或 `mode='spar'` 禁道具，不推断演武。
4. 奖励 setup 未表达胜/负/撤退分支；默认 core 只算事实与已声明掉落，由 finalize 按 outcome 过滤。
5. 战斗 `battleUses` 与世界 `usage.battleUses` 尚无合并契约；默认战中仅更新 battle 副本。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- ENG-16b-P01：将 `design/09` §13.1 的 `meridianByUnit` Record 改为按 `unitIndex` 升序数组；与 `tech/05` §3.3、§14.3 及确定性序列化一致。
- ENG-16b-P02：为演武新增明确 mode 或 `noItems` 投影规则；当前类型无法无歧义识别演武。
- ENG-16b-P03：为奖励 setup 定义 outcome 适用策略；避免 core 与 finalize 分别猜测败北、撤退和剧情分支掉落。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/design/09-combat-system.md` §13.1：按 P01 把 Record 统一成稳定数组，并引用 v2 外层防御/移动/护体字段。
- `docs/design/09-combat-system.md` §4.8.3 / `docs/tech/05-gameplay-engine.md` setup：补演武可机器判定字段及奖励 outcome 策略。
- ENG-16c：命令总线调用 `queryBattleAction`；按钮接 `previewBattleRoute` / `queryBattleQi`；`battle/finalize` 原子写回 `state.inventory` 消耗与 `computeBattleRewards` 结果。
- ENG-15：明确 battle 副本的 `itemState.battleUses` 与世界 `usage.battleUses` 在入场、结束、重试时的投影/合并规则。
- 属性改造任务：把移动力与经脉速度投影输入接到单位属性；当前 movementProjection 仅保存协议字段，不参与 CT。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

| 行动            | 行动专属拒绝码（另有通用 actor/回合/路径码）                                             |
| --------------- | ---------------------------------------------------------------------------------------- |
| `skill`         | `UNKNOWN_MOVE`、`MP_NOT_ENOUGH`、`INVALID_TARGET`、`MERIDIAN_ROUTE_BLOCKED` 及几何拒绝码 |
| `item`          | `DISABLED_BY_STATUS`、`LIMIT_REACHED`、`ON_COOLDOWN`、`ILLEGAL_TARGET`、`NO_LOS`         |
| `guard`         | 带 `routeRef` 时 `MERIDIAN_ROUTE_BLOCKED`                                                |
| `acuteQiGather` | `QI_ROUTE_UNAVAILABLE`、`QI_CARRY_FULL`、`DISABLED_BY_STATUS`                            |
| `wait`          | 无行动专属码                                                                             |

| 项目                         | 结果                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 行动类型与拒绝码             | ✅ 五类行动如上；六个新增事务码均有状态/RNG 不变测试。                                                                                                                                                                                                                                                                                                      |
| `meridianByUnit` / tech 字段 | ✅ `unitIndex` 升序数组；每项为 `unitId/unitIndex + flow(v2) + activeDefense + movementProjection + innerGuard`。flow 含 schema/protocol/身份、tick/version、丹田/路线/节点、擒拿/异种气/点穴/转移气；cache 可丢弃重建。与 design/09 Record 的差异见 P01。                                                                                                  |
| 经脉提交与 RNG 顺序          | ✅ F3 `commitMove` 后才进入 F6 `settleTarget`；向量 `[0,0,0,9999]` 的首两次 bp 为 `[9999,0]`，测试证明路线不堵且随后命中，并验证 `qi.moveResolved` 早于伤害事件。                                                                                                                                                                                           |
| 防御 / 道具 / 聚气           | ✅ 防御 Buff、+20 招架、转向与 700；道具上限、全场唯一、冷却、LOS、禁用、800/900/1000 与副本扣减；聚气限制、满载查询、0 RNG、1000；恢复 `gather` 门面与 7 条专测但不恢复双账本。⚠️ 防御路线、调息、速度投影未做。                                                                                                                                           |
| 奖励载荷                     | ✅ 样例：`{drops:[],martial:null,cycles:9,martialUses:[enemy_0:4,hero:5],movementTrained:[],fullCirculations:[enemy_0:4,hero:5]}`；core 发一次 `battle/rewards`，不写世界。                                                                                                                                                                                 |
| T28 / T40 / T71 / 确定性     | ✅ 覆盖防御、双单位隔离、batch=逐 tick、0/1/100 preview、checkpoint restore、奖励确定与无池 0 RNG；新基点 core 39 文件/404 测试通过。                                                                                                                                                                                                                       |
| 性能                         | ✅ `test:performance` 4 文件/6 测试通过；经脉 1,000 tick≤5ms、百万稳定 tick≤5ms、12 路 preview≤2ms，均 best-of-N，未改阈值。AR-33 的整仓 rig 门禁不在本任务指定命令内，本轮未另跑。                                                                                                                                                                         |
| 回放 golden                  | ✅ 新 hash `e3e334…b26e3`；删除 setup 的 `meridianInputs/inventory/itemDefs/rewards`、battle 的 `meridianByUnit/inventory/rewardStats`、unit 的物品/医术/经脉瞬态字段及 move 的 `skillId` 后恢复 ENG-16a `13dd4a…f9a7`。                                                                                                                                    |
| 下游接口                     | ✅ ENG-16c 从 `battle/action` 使用 `queryBattleAction/previewBattleRoute/queryBattleQi/resolveBattleAction`，从 `battle/rewards` 使用 `computeBattleRewards/emitBattleRewards`，以 action/rewards/runtime 三组测试验收按钮、总线和 finalize；ENG-15 对齐 `BattleUnit.itemState`；属性任务接 `BattleMeridianUnitState.movementProjection` 并补 CT 等价测试。 |
| 完整门禁                     | ✅ 挪基点后 `pnpm check` 全部通过：111 文件/736 测试，内容、构建和体积均通过；install、core test/performance、game build、ID strict、diff check 亦通过。ID 检查仅有既有基线 `sk_babuganchan`，新增失败为 0。未改 `command/api/state/world/economy`。                                                                                                           |
