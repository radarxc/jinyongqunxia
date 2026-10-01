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

## 验证命令

- 包内：`pnpm --filter @tianshu/core lint`、`pnpm --filter @tianshu/core test`、`pnpm --filter @tianshu/core typecheck`。
- `lint` 必须走包内配置以执行整数规则；交付前再运行 `pnpm check`。

## 变更记录

- 2026-10-01：`rngProtocol` 升至 2；`intInclusive()` 改为 16 位半字乘加的 32×32→64 位乘积高 32 位映射，保持每次公开抽样恰消费一个 `nextU32()`。协议 1 的浮点缩放结果不得作为协议 2 golden；package-local ESLint 同时禁用 `/` 与 `/=`。
- 2026-10-01：时钟与状态校验改用 shared 的 BigInt 整数除法；根 `pnpm check` 显式执行 package-local ESLint。
