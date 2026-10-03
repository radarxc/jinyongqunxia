# @tianshu/core

同步、纯 TypeScript、无 DOM 的唯一玩法权威。依赖只允许 `shared` 与 `data` 的公开边界；禁止平台 / UI / render / Node import，禁止墙钟、隐式随机、近似数学、无比较器排序与非整数规则状态。RNG 消费量、命令事务、事件顺序和规范序列化都是协议，变更必须补固定向量或 golden。各后续任务只改对应子目录，不再改根 `src/index.ts`。

## `GameState` 根结构

| 根 | 生命周期 / 内容 |
|---|---|
| `meta` | `saveSchema/rulesProtocol/rngProtocol/coreBuild/contentHash`、周目 seed、状态版本、世界 tick、事件序号与五路 RNG |
| `profile` | 跨书界长期人物：主角、创角身份、难度 / 规则日志与同伴 |
| `chapter` | 当前书界：定年 / 日历、剧情线、序章模式 / 回执、世界物品、店铺、NPC 运行态与章节道具用量 |
| `party` | 当前队伍：背包、十一装备槽、金钱 |
| `world` | `navigation` 位置事实与 `pendingTimeAdvance` |
| `dialogue` | Ink 对话临时态；非对话时为 `null` |
| `battle` | 战斗临时态入口；完整命令总线接入由 ENG-16c 扩展 |

所有规则状态必须是可规范 JSON 序列化的安全整数 / 字符串 / 布尔 / null / 稠密数组 / 普通对象。Core 源码禁止原生 `/`、`/=`；整数除法使用 `@tianshu/shared` 的 `floorDivInt()` / `ceilDivInt()`。

## 状态、推导与时间入口

- 边界：`createInitialGameState()`、`parseGameState()`、`assertCanonicalGameState()`、`cloneGameState()`；`Core.serialize()` / `canonicalStateJson()` 负责规范输出。
- 版本：当前 `SAVE_SCHEMA=2`、`RULES_PROTOCOL=3`、`RNG_PROTOCOL=2`；调用方必须从 core 导出读取。`contentHash` 在内容管线接入前为 64 个零。
- 深拷贝：core 内只使用 `cloneJsonValue()` 处理 JSON 状态；命令热路径禁止 `structuredClone()` 和整树复制。
- 人物：`deriveCharacterStats()` 是 `hpMax/mpMax` 唯一推导入口；`createCharacterState()` 初始化资源，`withDerivedCharacterStats()` 重算并保持资源比例。
- 容器：`addInventoryItem()`、`createEmptyEquipment()`、`createWorldItems()`、`createShopState()`、`createStoryState()`。
- 时间：`createGameClock()`、`advanceGameClock()`；显式入口为 `advanceInnRest()`、`advanceMeditation()`、`advanceTravel()`、`advanceBattle()`。

## 命令总线与事务

- 非战斗写入口统一为 `Core.dispatch(Command)`：world tick、大地图、城镇 / 打坐和装备 / 使用物品都按 `t` 查唯一 handler。成功返回 `{ ok:true,stateVersion,events }`；合法拒绝返回稳定代码 `{ ok:false,reason,at? }`。
- handler 的 `validate` 只读且不得取 RNG；`apply` 只经 `CoreTransaction.set/splice/rng/emit/abort` 写入。journal 仅登记每个 owner/key 的首次旧值，五流 RNG 与事件均先暂存。
- 提交前验证事件 JSON、安全整数及整棵 `GameState`；成功后才推进版本、命令序和事件序。异常或 abort 逆序回滚状态并丢弃 RNG / 事件。`TypeError`、溢出和不变量错误必须上抛，不得伪装成玩法拒绝。
- 规范事件为 `{ t,seq,stateVersion,causeId,parentSeq,payload }`；同命令 `causeId=stateVersion:commandOrdinal`，首事件无父项，其余默认指向首事件。战斗旧事件形状只保留至 ENG-16c。
- `migrateUiSessionV1()` 是 schema 1→2 的纯 JSON 迁移：旧 known / chapterUses / itemTargets / location 归入正式状态；非空 battleUses 明确报错，绝不静默丢弃。
- `createNewGameState()` / `createNewGameCore()` 是 ch00 唯一新档工厂；宿主注入 uint32
  `masterSeed`。创角只落身份与 `luk/cha=50`，六项战斗底子留给初眠。
- `rules/setDifficulty` 仅接江湖 / 侠客 / 宗师，战斗中返回 `RULES_BATTLE_ACTIVE`；
  成功追加 `difficultyLog` 并发 `rules/changed`。

## 经脉运气与养成入口

- 战斗入口：`battle/meridian-flow` 导出 `createMeridianFlowRuntime()`；`tick()`、`preview()`、
  `queryGatherStatus()`、`commitMove()`、`resolveMove()` 与 v2 `snapshot()/restore()` 共用同一份经脉状态。
  旧 `GatherState` / `acuteQiGather()` CT 适配器已删除，聚气只通过战斗行动推进，避免双重记账。
- 战斗事件：`qi.flowAdvanced`、`qi.moveResolved`、`qi.fullCycleCrit`。后者是 Core 内部事实名；
  ENG-04 在战斗聚合边界包装成
  `battle/fullCirculationCritResolved`，不得重掷暴击或改写 `releasedQi/circulationBp`。
- 战斗态以 `unitIndex` 升序保存 `meridianByUnit[]`；同模板单位只共享只读输入，每单位独立恢复
  runtime。预览零 RNG 且只读，提交路线 F3 先于命中 F6，并以唯一 `battle` SFC32 流消费随机。
- `snapshot(transient)` 同步保存异种气、点穴占用、借力气和到期行动；外层单位槽另存
  `activeDefense/movementProjection/innerGuard`。runtime cache 只能重建，不进入状态。
- 养成入口：`progression` 导出 `advanceInnerPractice()`、`advanceMartialArtProgress()`、
  `applyMeridianBoost()`、`interruptMeditation()` 与 `dispatchProgressionCommand()`；药材效果直接复用
  `ItemDef.use.meridianTemper`，不维护第二份数据结构。
- ENG-09：保存 `cycleTicks/carriedTicks` 并用 `progression/practiceInner` 结算完整周天；受击时发
  `progression/interruptMeditation`。返回的 `bf_chaqi` 仅是效果描述，具体 Buff 实例由 ENG-04 接入。
- 回放：运气状态用 `meridian-flow-state.v2` 快照；恢复先完整校验后原子提交。所有规则量为整数，
  每 tick 热路径复用预分配 typed arrays；性能门禁为 `pnpm --filter @tianshu/core test:performance`。
- 黄金：`meridian_flow_golden_v3.json`（fixture 3 / rules 3 / RNG 2）必须由测试直接驱动
  `MeridianFlowRuntime` 及生产纯函数；SHA 在测试中硬锁。`legacy-protocol2-replay.ts` 只回放
  `meridian_flow_golden.json` 的迁移前协议 2 录像，不得作为当前生产闸门证据。黄金只能经人工
  `meridian_flow_sim.py --write-golden` 重录，CI 仅执行 `--check`。
- 当前显式缺口：runtime 尚无 `regulateBreath`，防守 / 移动路线也没有提交结算入口；v3 工件保留
  调息参考向量并标 `supportedByProductionRuntime=false`，接入前不得在测试中静默视为已支持。
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
- Core 总线接收 `dialogue/start/continue/choose`；根 `dialogue` 非空即暂停世界。说话人标签
  为 `#ts:dialogue/speaker speaker=<npcId|player|narrator|book_spirit>`，缺省 `narrator`。
  对话推进先核对 `storyHash`；结构变化是内部错误，不降格为玩家拒绝。
- `quest/choose` 对 `dc_00_01` 分两阶段：缺省 `phase:select` 只锁定模式与入口节点；内容到达
  对应 `n_*_complete` 后提交 `phase:settle + completionNodeId`，原子写路径回执和共同
  `first_sleep_to_baima` 出口回执；重放不重复产生效果。
- `StoryRuntime` 所有公开推进在快照与 deadline heap 副本上执行；成功后才发布 quest
  port 的单次原子 `commit(effects[])`；任意异常回滚 snapshot、deadline 与整个副作用批次。
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
  战外命令总线把 `chapterUses` 写入 chapter；`battleUses` 仅属于活动战斗并由 ENG-16c 接入。
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
  `BattleCommand` 给 `resolveBattleAction()`。`battle/act` 原子提交
  `walkTo? + skill|item|guard|acuteQiGather|wait + facing?`；`battle/wait` 是原地待机别名。
  提交时重算路径、射程、LOS、目标、道具次数 / 冷却与经脉状态，不接受预览结果。
- 行动：防御写入 `bf_jiangu/bf_xieli`；聚气只能选已打通攻击路线且不带移动；战斗物品只改
  setup 背包副本。带防御路线暂以 `MERIDIAN_ROUTE_BLOCKED` 拒绝，直到防御路线提交接口落地。
- 奖励：`computeBattleRewards()` 纯计算武学使用、移动训练、周天和 setup 掉落；仅随机掉落池
  消费独立 `loot` 流。`emitBattleRewards()` 幂等发 `battle/rewards`，core 不写世界状态。
- 查询：`queryReachable()` / `queryPath()` / `queryMoveAt()` / `queryLegalTargets()` 是只读棋盘规则入口，
  `isBattleUnitVisible()` 统一 LOS、遮蔽与隐匿可见性；`queryDamageGeometry()` 是结算、预测与展示
  共用的方位 / 高差 / 地形 / 遮蔽 / LOS 纯查询，render 不得重算；
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

- 2026-10-02：ENG-17a 接入 ch00 新档、三档难度切换、core-owned Ink 对话与
  `dc_00_01`；StoryRuntime 改为快照 / deadline / quest port 原子提交。
- 2026-10-02：ENG-15 统一非战斗命令总线与 mutation journal；GameState 升至 schema 2 / rules protocol 3，移除 `ui-session.v1` 边车与 `transient` 根。
- 2026-10-01：`rngProtocol` 升至 2；`intInclusive()` 改为 16 位半字乘加的 32×32→64 位乘积高 32 位映射，保持每次公开抽样恰消费一个 `nextU32()`。协议 1 的浮点缩放结果不得作为协议 2 golden；package-local ESLint 同时禁用 `/` 与 `/=`。
- 2026-10-01：时钟与状态校验改用 shared 的 BigInt 整数除法；根 `pnpm check` 显式执行 package-local ESLint。
