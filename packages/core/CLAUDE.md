# @tianshu/core

| 项 | 内容 |
|---|---|
| 归属 | tech/01、tech/05 的纯规则内核与命令事务实现；玩法定义引用对应 design 文档 |
| 上游 | canon §18–19；作者已定需求；ENG-15、ENG-16a/b/d、ENG-14b |
| 当前战斗入口 | `Core.dispatch()` → `battleHandler` → `BattleSession`；应用只消费投影 |

## 结论先行（TL;DR）

同步、纯 TypeScript、无 DOM 的唯一玩法权威。依赖只允许 `shared` 与 `data` 的公开边界；禁止平台 / UI / render / Node import，禁止墙钟、隐式随机、近似数学、无比较器排序与非整数规则状态。RNG 消费量、命令事务、事件顺序和规范序列化都是协议，变更必须补固定向量或 golden。各后续任务只改对应子目录，不再改根 `src/index.ts`。

## `GameState` 根结构

| 根 | 生命周期 / 内容 |
|---|---|
| `meta` | `saveSchema/rulesProtocol/rngProtocol/coreBuild/contentHash`、周目 seed、状态版本、世界 tick、事件序号与五路 RNG |
| `profile` | 跨书界长期人物：主角、创角身份、难度 / 规则日志与同伴 |
| `chapter` | 当前书界：定年 / 日历、剧情线、序章模式 / 回执、世界物品、店铺、NPC 运行态与章节道具用量 |
| `party` | 当前队伍：背包、十一装备槽、金钱 |
| `world` | `navigation` 位置事实、`pendingTimeAdvance` 与按需创建的 `battleReceipts` |
| `dialogue` | Ink 对话临时态；非对话时为 `null` |
| `battle` | `battle-session.v1`，包含战况、两流 RNG、冻结入场快照与命令历史；非战斗为 null |

所有规则状态必须是可规范 JSON 序列化的安全整数 / 字符串 / 布尔 / null / 稠密数组 / 普通对象。Core 源码禁止原生 `/`、`/=`；整数除法使用 `@tianshu/shared` 的 `floorDivInt()` / `ceilDivInt()`。

## 状态、推导与时间入口

- 边界：`createInitialGameState()`、`parseGameState()`、`assertCanonicalGameState()`、`cloneGameState()`；`Core.serialize()` / `canonicalStateJson()` 负责规范输出。
- 版本：当前 `SAVE_SCHEMA=3`、`RULES_PROTOCOL=3`、`RNG_PROTOCOL=2`；调用方必须从 core 导出读取。`contentHash` 在内容管线接入前为 64 个零。
- 深拷贝：core 内只使用 `cloneJsonValue()` 处理 JSON 状态；命令热路径禁止 `structuredClone()` 和整树复制。
- 人物：`deriveCharacterStats()` 是 `hpMax/mpMax` 唯一推导入口；`createCharacterState()` 初始化资源，`withDerivedCharacterStats()` 重算并保持资源比例。
- 容器：`addInventoryItem()`、`createEmptyEquipment()`、`createWorldItems()`、`createShopState()`、`createStoryState()`。
- 时间：`createGameClock()`、`advanceGameClock()`；显式入口为 `advanceInnRest()`、`advanceMeditation()`、`advanceTravel()`、`advanceBattle()`。

## 命令总线与事务

- 写入口统一为 `Core.dispatch(Command)`：世界、剧情、背包与六个战斗命令都按 `t` 查唯一 handler。成功返回 `{ ok:true,stateVersion,events }`；合法拒绝返回稳定代码 `{ ok:false,reason,at? }`。
- handler 的 `validate` 只读且不得取 RNG；`apply` 只经 `CoreTransaction.set/splice/rng/emit/abort` 写入。journal 仅登记每个 owner/key 的首次旧值，五流 RNG 与事件均先暂存。
- 提交前验证事件 JSON、安全整数及整棵 `GameState`；成功后才推进版本、命令序和事件序。异常或 abort 逆序回滚状态并丢弃 RNG / 事件。`TypeError`、溢出和不变量错误必须上抛，不得伪装成玩法拒绝。
- 规范事件为 `{ t,seq,stateVersion,causeId,parentSeq,payload }`；同命令 `causeId=stateVersion:commandOrdinal`，首事件无父项，其余默认指向首事件。战斗本地事实保留在会话中，提交时包装成同一运输信封。
- `migrateUiSessionV1()` 是 schema 1→2 的纯 JSON 迁移：旧 known / chapterUses / itemTargets / location 归入正式状态；
  `migrateBookSleepV2()` 再做 schema 2→3 并补中性 `mountedRegion:null`。非空 battleUses 明确报错，绝不静默丢弃。
- `createNewGameState()` / `createNewGameCore()` 是 ch00 唯一新档工厂；宿主注入 uint32
  `masterSeed`。创角只落身份与 `luk/cha=50`，六项战斗底子留给初眠。
- `rules/setDifficulty` 仅接江湖 / 侠客 / 宗师，战斗中返回 `RULES_BATTLE_ACTIVE`；
  成功追加 `difficultyLog` 并发 `rules/changed`。

### 区域探索（ENG-20a）

- 宿主先预载并按 `RegionMapSchema` 校验区域包，再提交
  `world/mountRegion {regionId,sceneId,spawnId}`；core 不联网、不读文件。状态只保存
  `mountedRegion={regionId,spawnId,playerHex,facing,dynamicTiles,entities}`，静态格网留在内容层。
- `world/walkTo {hex}` 与 `queryRegionPath()` 共用确定性搜索；提交始终重算，不信任预览。
  六邻、高差、坡道、动态格、占用、轻功地形与 H4 直线跨沟均在 core 判定。
- `world/interact {anchorId}` 统一校验距离、视线、消耗态与 `GateExpr`。NPC 启动 Ink；
  Trigger 发剧情 intent；Chest 原子入包；Door / QinggongGate 写 `pendingMount`；
  BattleArena 只发 `world/battleRequested`，由战斗宿主接续。
- 安全锚和自动存档点只发 `world/safeAnchorReached` / `world/autosaveRequested`；core 不写存储，
  对话、书眠待挂载与其他交互事务中抑制。静态投影 `RegionStaticProjection` 仅挂载时发送，
  步进投影 `RegionDynamicProjection` 只含玩家、可交互锚、门状态和 `pendingMount`。

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
  战外命令总线把 `chapterUses` 写入 chapter；`battleUses` 仅属于活动战斗。战斗冻结章节限用账本，finalize 原子写回，重试恢复入场账本。
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
  `battle/enter`。同事务由 `tx.rng('world').nextU32()` 覆盖 seed，冻结世界背包 / 章节用量并创建
  `BattleSession`；实例 ID 为 `setupId:nextRuntimeOrdinal`，重复遭遇不会共用结算回执。
- 推进：`BattleSession` 持有 battle / ai 流并统一 CT、胜负、自动事件与命令日志；总线的
  `battle/act` 原子提交
  `walkTo? + skill|item|guard|acuteQiGather|wait + facing?`；`battle/wait` 是原地待机别名。
  提交时重算路径、射程、LOS、目标、道具次数 / 冷却与经脉状态，不接受预览结果。
- 行动：防御写入 `bf_jiangu/bf_xieli`；聚气只能选已打通攻击路线且不带移动；战斗物品只改
  setup 背包副本。带防御路线暂以 `MERIDIAN_ROUTE_BLOCKED` 拒绝，直到防御路线提交接口落地。
- 奖励：`projectBattleRewards()` 零 RNG 展示已知奖励；随机掉落只在 `battle/finalize` 消费
  世界 `loot` 流。背包、章节限用、资源、`profile.battleTraining` 与 `battleId+outcomeSeq` 回执
  同事务写入后清 battle；重复 finalize 零写入，`battle/leave` 复用 finalize。
- 查询：`queryReachable()` / `queryPath()` / `queryMoveAt()` / `queryLegalTargets()` 是只读棋盘规则入口，
  `isBattleUnitVisible()` 统一 LOS、遮蔽与隐匿可见性；`queryDamageGeometry()` 是结算、预测与展示
  共用的方位 / 高差 / 地形 / 遮蔽 / LOS 纯查询，render 不得重算；
  `resolveAreaCells()` 返回六角范围格，`matchFormation()` 校验六向阵形。可达集、路径与 open set 不入状态。
- 自动：棋盘 `chooseAutoCommand()` 通过上述查询在射程外先接近；无站位
  `simulateAbstractBattle(state, policies, rng, maxActions?)` 接受调用方当前 RNG，不重新播种；
  抽象模式不读取坐标、LOS、ZOC 或高差，`noAuto` 会拒绝。
- 重试：`battle/retry` 从入场 seed 与累计 retryCount 经 `deriveRetrySeed()` 混合，重置两流，
  保留命令 / 事件历史；固定向量 `(0x12345678,1) → 0x48c69a09`。上限为 `min(2000,max(60,N×40))` 次行动。
- 回放：`runBattleReplay()` 经同一会话执行 act / setAuto / retry；自动命令录具体行动和 aiSeed，
  回放只验证该种子并推进 ai 流。拒绝命令不进前缀或推进 RNG；SHA-256 仍由宿主注入。
- 性能：候选只复制可变单位与小账本，三个历史数组用追加缓冲；提交用逐项 push，避免历史展开。
  `assertCanonicalGameState(state)` 在存档边界完整扫描；事务内部才复用已冻结历史前缀的校验。
  journal 覆写 / 回滚使缓存失效；投影依赖单位 revision，不依赖整单位 JSON 比较。
  原地路径直接返回零步结果且保留占格 / 越界拒绝；无可用路线或招式时 AI 不做无用视线查询。

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
- `BattleEvent` 是同步战斗内核的本地事实；总线已包装规范运输信封。完整录像文件、setupHash、
  命令摘要兼容和跨浏览器对拍交 ENG-22；运输事件序号不回传影响本地战斗 hash。

## 验证命令

- 包内：`pnpm --filter @tianshu/core lint`、`pnpm --filter @tianshu/core test`、`pnpm --filter @tianshu/core typecheck`。
- `lint` 必须走包内配置以执行整数规则；交付前再运行 `pnpm check`。

## 变更记录

- 2026-10-03：ENG-16c 收回战斗会话、六命令事务、世界流种子、幂等奖励回执与实战 / 回放对拍；
  移除历史整树克隆，抽象战斗改为调用方传 RNG。旧 schema 3 不补空 receipts，保留原 golden。
- 2026-10-03：ENG-20a 接入 RegionMap 挂载、确定性场景行走与跨沟、交互锚、门禁、
  出口、安全锚 / 自动存档事件及静态 / 动态区域投影；GameState schema 3 保存 mountedRegion。
- 2026-10-02：ENG-17a 接入 ch00 新档、三档难度切换、core-owned Ink 对话与
  `dc_00_01`；StoryRuntime 改为快照 / deadline / quest port 原子提交。
- 2026-10-02：ENG-15 统一非战斗命令总线与 mutation journal；GameState 升至 schema 2 / rules protocol 3，移除 `ui-session.v1` 边车与 `transient` 根。
- 2026-10-01：`rngProtocol` 升至 2；`intInclusive()` 改为 16 位半字乘加的 32×32→64 位乘积高 32 位映射，保持每次公开抽样恰消费一个 `nextU32()`。协议 1 的浮点缩放结果不得作为协议 2 golden；package-local ESLint 同时禁用 `/` 与 `/=`。
- 2026-10-01：时钟与状态校验改用 shared 的 BigInt 整数除法；根 `pnpm check` 显式执行 package-local ESLint。

## 参考资料

- [Math.imul](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul)：32 位整数乘法；MDN 列为广泛支持，访问 2026-10-03。
- [Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)：只冻结当前层，历史缓存前递归冻结且完整校验 JSON，访问 2026-10-03。
- 行为契约见 design/09 §2.11–2.12、tech/05 §7.7、§14.3–14.4；无新增依赖、付费 API 或远程配额。

## 本文新增术语/约定

- `battle-session.v1`：core 持有的战斗状态与重放边界；`revision` 是投影失效标记，不是第二份规则。
- `battleReceipts`：结算实例与结局序号；`battleTraining`：已结算的武学使用、移动、周天事实。

## 待决事项 / 依赖

- 已解决：ENG-16c 战斗命令总线、独立 battleUses、世界流种子、回滚与幂等结算，见上述入口。
- ENG-16e 接 `queryBattleAction/previewBattleRoute/queryBattleQi`、可达 / 路径 / 方位查询与奖励投影；按钮与高亮默认维持现有可用性。
- ENG-22 接入场快照、两流、命令前缀与会话 hash；deploy/order/free/concede/undo 完整指令仍待其对应规则实现。
- SXP / 永久穴脉换算、伤势 / 调息和地形 / 任务结算依赖完整养成与场景输入；当前保存精确次数，默认不猜转换系数。
- 浏览器 / 真机确定性与性能仍为（待实测）；Node 对拍和 best-of-N 不代替移动端验收。
- 对基准修改提案：无；不新增原著事实或玩法 ID。
