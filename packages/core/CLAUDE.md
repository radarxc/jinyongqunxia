# @tianshu/core

同步、纯 TypeScript、无 DOM 的唯一玩法权威。依赖只允许 `shared` 与 `data` 的公开边界；禁止平台 / UI / render / Node import，禁止墙钟、隐式随机、近似数学、无比较器排序与非整数规则状态。RNG 消费量、命令事务、事件顺序和规范序列化都是协议，变更必须补固定向量或 golden。各后续任务只改对应子目录，不再改根 `src/index.ts`。

## `GameState` 根结构

| 根 | 生命周期 / 内容 |
|---|---|
| `meta` | 协议、状态版本、世界 tick、事件序号与五路 RNG |
| `profile` | 跨书界长期人物：主角与同伴 |
| `chapter` | 当前书界：定年 / 日历、剧情线、世界物品、店铺 |
| `party` | 当前队伍：背包、十一装备槽、金钱 |
| `transient` | 临时推进、对话与战斗占位；不得当作长期事实源 |
| `battle` | 战斗临时态入口；ENG-02 保持 `null`，由战斗任务扩展 |

所有规则状态必须是可规范 JSON 序列化的安全整数 / 字符串 / 布尔 / null / 稠密数组 / 普通对象。Core 源码禁止原生 `/`、`/=`；整数除法使用 `@tianshu/shared` 的 `floorDivInt()` / `ceilDivInt()`。

## 状态、推导与时间入口

- 边界：`createInitialGameState()`、`parseGameState()`、`assertCanonicalGameState()`、`cloneGameState()`；`Core.serialize()` / `canonicalStateJson()` 负责规范输出。
- 人物：`deriveCharacterStats()` 是 `hpMax/mpMax` 唯一推导入口；`createCharacterState()` 初始化资源，`withDerivedCharacterStats()` 重算并保持资源比例。
- 容器：`addInventoryItem()`、`createEmptyEquipment()`、`createWorldItems()`、`createShopState()`、`createStoryState()`。
- 时间：`createGameClock()`、`advanceGameClock()`；显式入口为 `advanceInnRest()`、`advanceMeditation()`、`advanceTravel()`、`advanceBattle()`。

## 经脉运气与养成入口

- 战斗入口：`battle/meridian-flow` 导出 `createMeridianFlowRuntime()`、`createGatherState()` 与
  `dispatchMeridianFlowCommand()`；业务层通过 `qi.tick/selectRoute/acuteGather/resolveMove` 命令推进，
  不直接复制产气、旅行 tick、节点通量或周天倍率公式。
- 战斗事件：`qi.flowAdvanced`、`qi.gatherAdvanced`、`qi.routeSelected`、`qi.acuteGathered`、
  `qi.moveResolved`、`qi.fullCycleCrit`。后者是 Core 内部事实名；ENG-04 在战斗聚合边界包装成
  `battle/fullCirculationCritResolved`，不得重掷暴击或改写 `releasedQi/circulationBp`。
- ENG-04：以唯一 `battle` SFC32 流调用 `qi.resolveMove`；消费 `meridianAttackBp`、`flowCt`、
  `releasedQi` 和 trace 接续命中 / 伤害 / Buff，不在本模块计算攻防伤害。失败命令不产生事件。
- 养成入口：`progression` 导出 `advanceInnerPractice()`、`advanceMartialArtProgress()`、
  `applyMeridianBoost()`、`interruptMeditation()` 与 `dispatchProgressionCommand()`；药材效果直接复用
  `ItemDef.use.meridianTemper`，不维护第二份数据结构。
- ENG-09：保存 `cycleTicks/carriedTicks` 并用 `progression/practiceInner` 结算完整周天；受击时发
  `progression/interruptMeditation`。返回的 `bf_chaqi` 仅是效果描述，具体 Buff 实例由 ENG-04 接入。
- 回放：运气状态用 `meridian-flow-state.v2` 快照；恢复先完整校验后原子提交。所有规则量为整数，
  每 tick 热路径复用预分配 typed arrays；性能门禁为 `pnpm --filter @tianshu/core test:performance`。
## 剧情、时间与地图交接接口（ENG-05）

- 剧情命令：构造 `StoryRuntime(lines, options)` 后用 `start()`、`activateLine(lineId)`、
  `chooseDialogue(choiceKey)`、`completeDialogue()`、`completeQuest/failQuest(questId)`、
  `choose(choiceKey)` 与 `advanceTo(worldTick)`。
  所有入口返回 `{ snapshot, events }`；持久化 `snapshot()`，读档用
  `restoreStoryRuntime(lines, snapshot, ports, { epochId, epochYear })`；非 1093 时代必须传
  epoch 配置，且不得缓存第三方 Ink 对象。
- 对话：内联节点由 `startDialogue()` 直接投影；生产 Ink 使用
  `new InkJsDialogueBridge(loadCompiledStory)`，loader 返回构建期产出的 story JSON。
  `StubInkDialogueBridge` 会以 `INK_ADAPTER_REQUIRED` 快速失败。
- 事件：消费 `StoryEvent` 的 `chapterId/lineId/nodeId/causeId/receiptId/payload`；
  稳定类型含 `story/lineAvailable`、`nodeEntered`、`nodeCompleted`、
  `choiceCommitted`、`nodeExpired`、`lineCompleted`。事件按 `receiptId` 幂等。
- 条件：`compileCondition()` 在加载期编译 `design/12` §2.2 全部只读操作符；
  host 将角色、背包、门派、同伴、地点、经营、事件与传承投影为 `ConditionFacts`，
  缺少已引用事实时抛 `CONDITION_FACT_MISSING`，不得静默当作 `false`。
  `time.year/period` 由运行时按 epoch 与当前 tick 重算；经营 `job.dutyRatioBp`
  用 0..10000，DSL 的 `ratio` 仍用 0..1。
- 时间：高层入口为 `sleepAtInn()`、`meditateShichen()`、
  `travelByDistance()`、`travelByMinutes()`、`advanceBattleTicks()`；结果中的
  `world/timeBoundary` 依次结算时辰、日、月、年，再把最终 tick 交给剧情 `advanceTo()`。
- ENG-08 / ENG-09 查询：`EventAnchorRegistry.queryScene(sceneId)` 为场景整桶，
  `query(sceneId, trigger)` 按触发类型筛选，`match(probe)` 匹配 NPC 或半径内六角格；返回项携带 NPC 或六角格位置及关联
  `lineId/nodeId`。NPC 呈现查询用 `queryNpcPresence(state, npcId, eraLayer)`。
- UI 只读取 `StoryRuntimeSnapshot.wait` 及事件，不自行判条件或推进节点；地图触发后
  由 host 校验锚点与当前剧情前沿，再调用对应剧情命令。

## 物品、世界物与商店入口

- ENG-07 背包 UI：`economy` 导出 `InventoryRuntime`、`addInventory()`、`removeInventory()`；
  `count()` / `item()` 为 O(1)，`query({kind,minimumGrade,maximumGrade}, sort)` 支持分类、品阶与 ID
  稳定排序。提交状态只取 `snapshot()`，不得序列化内部 `Map` / `Set`。
- ENG-07 装备 UI：`equipItem()`、`unequipItem()` 以完整物品定义和 `EquipmentRule[]` 做原子换装；
  `deriveEquipmentPanel()` 从基础面板重算十一槽修饰。成对兵器占主副手，双手兵器仅与
  `offHandRole:hiddenCarrier` 共存。十一槽固定为 `mainHand/offHand/head/body/innerBody/hands/`
  `shoulder/cape/waist/feet/accessory`。
- ENG-07 使用物品：`useConsumable()` 返回新背包、目标、`ConsumableUseState`、`fieldTime` 与事件；
  永久经脉强化唯一调用 `progression.applyMeridianBoost()`，临时冲穴药效写入 `meridianAids`。
  UI / 战斗层负责持久化并在新战斗时清空 `battleUses`；章节结束时清空整份使用账本。
- ENG-08 探索与城镇：`WorldItemsRuntime` 按场景分桶，`get()` / `queryScene()` 应用于场景 ID、
  锚点、tick 窗口和旗标可见性，`pickup()` 原子返回背包与已取快照。`checkUniformExposure()`
  产生官甲六字段事件并返回执法状态；普通城门只调用 `canEnterNormalCityGate()`。
- ENG-09 战斗：物品行动调用 `useConsumable()`；未知效果保留在 `temporaryEffects` 供 Buff / 武学层
  解释，`economy` 不重定义效果。传入自身正常行动 `battleTurnToken` 以执行单品冷却；
  `BattleInventoryState` 另校验全场总次数，调用后持久化返回的单品账本。世界拾取继续复用
  `pickupWorldItem()`，不要直接改 `pickedUp`。
- 店铺：`ShopRuntime` 以 `GameClock.dayIndex` 补货；`offer()`、`buy()`、`sell()` 使用整型 bp，
  全部倍率合并后按 `round10(x)=10*floor((x+5)/10)` 取整。条件货单必须显式注入
  `ShopConditionEvaluator`；没有求值器时条件货不可供货。

## 战斗核心入口（ENG-04）

- 创建：遭遇、剧情、城镇打坐被袭分别调用 `createEncounterBattleSetup()`、
  `createStoryBattleSetup()`、`createMeditationAmbushBattleSetup()`，再以单位快照调用
  `createBattleState()`。`BattleSetup` 冻结参战者、阵营、胜负条件与特殊规则；战中不得扫描世界补人。
- 推进：`advanceBattleToReady()` 推进事件驱动 CT 与逐 tick 异种气；提交
  `BattleCommand` 给 `resolveBattleAction()`。`battle/act` 原子提交 `walkTo? + skill|wait + facing?`，
  `battle/wait` 是原地待机别名；提交时重算路径、射程、LOS 与目标，不接受预览结果。
  `acuteQiGather()` 是 ENG-03 经脉上下文适配器，完整聚合命令待 `meridianByUnit` 进入战斗态。
- 查询：`queryReachable()` / `queryPath()` / `queryMoveAt()` / `queryLegalTargets()` 是只读棋盘规则入口，
  `isBattleUnitVisible()` 统一 LOS、遮蔽与隐匿可见性；
  `resolveAreaCells()` 返回六角范围格，`matchFormation()` 校验六向阵形。可达集、路径与 open set 不入状态。
- 自动：棋盘 `chooseAutoCommand()` 通过上述查询在射程外先接近；无站位
  `simulateAbstractBattle()` 走独立抽象候选，不读取坐标、LOS、ZOC 或高差；`noAuto` 会拒绝。
- 回放：`runBattleReplay()` 仅记录已接受命令；`hashBattleReplay()` 接收宿主注入的 SHA-256，
  Core 不引入 Node / Web API。拒绝命令不得进入命令前缀或推进 RNG。

### 战斗事件与下游约定

- 结算事件：`battle/damageResolved`、`combat.qiRepel`（携带规范事实名
  `battle/outwardQiCancelled`）、`battle/foreignQiInjected`、`battle/foreignQiDigested`、
  `battle/acupointOccupied`、`battle/acupointDigested`、`battle/dantianDamaged`、
  `battle/reverseQiReleased`、`battle/unitDowned`、`battle/ended`。
- 自动事件：`battle/autoSimulationStarted`、`battle/autoExchangeResolved`、
  `battle/autoSimulationEnded`；ENG-10 可直接按 `actionNo` 播放日志，不得据表现重算结果。
- ENG-10：手动棋盘直接显示 `queryMoveAt()` 返回的格与目标，再提交 `walkTo? + action + facing?`；
  动画、倍速和提示不回写 Core。`combat.qiRepel.message` 可显示，业务判断使用其规范事实名。
- ENG-09：打坐被袭只传当时实际打坐者到 `meditationUnitRefs`；工厂会给这些单位创建
  `bf_chaqi` 三次自身行动并赋敌方先机，不会补入附近 NPC。
- 当前 `BattleEvent` 是同步战斗内核的精简事实；持久化的 `BattleEventV3` 信封、`setupHash`、
  完整 payload 和 protocol 3 切换由宿主 / 数据模型任务接入。

## 验证命令

- 包内：`pnpm --filter @tianshu/core lint`、`pnpm --filter @tianshu/core test`、`pnpm --filter @tianshu/core typecheck`。
- `lint` 必须走包内配置以执行整数规则；交付前再运行 `pnpm check`。

## 变更记录

- 2026-10-01：`rngProtocol` 升至 2；`intInclusive()` 改为 16 位半字乘加的 32×32→64 位乘积高 32 位映射，保持每次公开抽样恰消费一个 `nextU32()`。协议 1 的浮点缩放结果不得作为协议 2 golden；package-local ESLint 同时禁用 `/` 与 `/=`。
- 2026-10-01：时钟与状态校验改用 shared 的 BigInt 整数除法；根 `pnpm check` 显式执行 package-local ESLint。
