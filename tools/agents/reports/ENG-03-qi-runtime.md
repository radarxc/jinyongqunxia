# ENG-03-qi-runtime 报告 · 游戏工程 · 经脉运气运行时（产气 / 运气推进 / 通量 / 行动槽 / 聚气 / 完整运气加成 / 周天锻炼 / 药材强化）

## 1. 摘要（3–6 行）

- 已完成整数确定性的经脉运气状态机：产气、逐 tick 管线、共享穴位承载、堵塞胀损、路线放气与快照恢复。
- 已完成 CT 行动槽、急性聚气、完整 / 不完整周天倍率及 `qi.fullCycleCrit` 六条提示。
- 已完成完整周天锻炼、武学熟练、药材强化与打坐中断岔气描述，并接入本地 command / event 通道。
- 18 行 DES-qi 表、失败原子性、回放哈希及 1000 tick × 12 路线性能门禁均由自动测试覆盖。

## 2. 产出（文件、行数、主要章节）

- `packages/core/src/battle/meridian-flow/`：8 文件、1,228 行；公式、typed-array 运行时、CT、命令事件及 35 项测试。
- `packages/core/src/progression/`：7 文件、475 行；周天、通量 / 强度、武学 SXP、药材、打坐及 8 项测试。
- `packages/core/bench/`：3 文件、46 行；普通 5 ms 门禁和 Vitest bench。
- `packages/core/CLAUDE.md`（51 行）与 `package.json`（18 行）：入口、协议、下游交接和性能命令。
- `pnpm-lock.yaml` 未变化；未引入依赖。

## 3. 关键结论与数值

- 产气 / 速度：`floor(base×layerCurveBp[n]/10000)`；累计段长求到达 tick，12 长路线在 8000/10000/12500 bp 下为 15/12/10 tick。
- 通量：穴位硬顶 64、经脉硬顶 96，节点承载 `fluxCap×lengthUnit`；单位、路线、共享节点三层容量均封顶。
- 放气：`min(available, carryCap, releaseRate×windowTicks)`，其中 `releaseRate=min(production, bottleneck, speedThroughput)`；卡住只释放卡点下游气。
- CT：`ct += spd×ticks`，范围 `[-1000,1299]`；1000 就绪，急性聚气扣 1000 并累计一次跳过行动。
- 周天：不完整曲线含 4666→7299、5000→7500，完整 10000→13500；完整暴击发稳定文案事件且不额外耗 RNG。
- 锻炼：`layerCurveBp=5000+625n`，余量公式逐周期结算，未满至少 +1；强度经验每周期 `max(1,floor(rateH/20))`。

## 4. 开放问题（附默认值）

- O1：武功的品阶门、剧情门与 `latentExp` 尚无统一调用契约；默认上游合并成 `layerCap` 传入，`latentExp` 原样保留。
- O2：`bf_chaqi` 具体 Buff 尚待 ENG-04；默认 3 次自身行动、产气 5000 bp、禁急性聚气。
- O3：根规则协议尚无统一常量；默认模块快照维持 `meridian-flow-state.v2`，由战斗 / 存档信封补规则协议。
- O4：任务文字写 PCG32，但仓库既定实现为 SFC32 协议 2；默认复用唯一 `battle` 流，不另建随机算法。

## 5. 对基准的修改提案（编号 / 提案 / 理由）

- 无。实现遵循 AR-19 / AR-21 与现有 design/09、design/21、tech/05，不新增玩法事实。

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

- `docs/tech/05-gameplay-engine.md` §3/§4：战斗聚合层接入 typed-array facade 的事务 journal，并在外层快照登记规则协议。
- `docs/design/09-combat-system.md` §3.4.1：ENG-04 将内部 `qi.acuteGathered` 映射为 `battle/acuteQiGathered`。
- `docs/design/21-meridian-flow-and-moves.md` §12.3：实现接口名与 `qi.*` 内部事件清单可在工程文档任务中同步。

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 函数 / 事件清单

- ✅ 战斗函数：`deriveQiParameters`、`segmentTravelTicks`、`createMeridianFlowRuntime`、`createGatherState`、`advanceGatherState`、`acuteGather`、`settleGatherAction`、`dispatchMeridianFlowCommand`。
- ✅ 养成函数：`advanceInnerPractice`、`advanceMartialArtProgress`、`applyMeridianBoost`、`createMeditationState`、`interruptMeditation`、`dispatchProgressionCommand`。
- ✅ 事件：`qi.flowAdvanced/gatherAdvanced/routeSelected/acuteGathered/moveResolved/fullCycleCrit`；`progression/innerPracticeCompleted/meridianBoostApplied/martialArtAdvanced/meditationInterrupted`。

### 与文档公式的对应（文档节号 → 函数）

- ✅ design/21 §2.5 → `deriveQiParameters`、`segmentTravelTicks`、`MeridianFlowRuntime.tick`；§3.1–3.3 → `effectiveNodeFlowBp`、`jamChanceBp`、`resolveMove`。
- ✅ design/21 §3.4–3.7 / §4.4.2 → `normalizeMeridianProfile`、`meridianStrengthBp`、`attackMeridianBp`、`circulationDamageBp`、`finalMeridianAttackBp`。
- ✅ design/09 §3 → `advanceGatherState`、`acuteGather`、`settleGatherAction`；design/21 §2.3 → `fluxTrainingGain`、`advanceInnerPractice`。

### 样例表、确定性与性能

- ✅ design/21 §14.12 三档内功 × 三档经脉 × 完整 / 不完整共 18 行逐行断言通过；放气依次为 28/60、56/120、56/120、36/72、96/192、96/192、30/60、80/160、140/280。
- ✅ 聚焦测试 4 文件 43 项通过；覆盖 CT 时序、硬顶、共享穴位、周天成长、拒绝零副作用、快照原子恢复、SHA-256 同种子回放一致。
- ✅ `test:performance` 与 `vitest bench` 通过 1000 tick × 12 路线 ≤5 ms；热路径复用预分配 typed arrays。

### 交下游接口与最终门禁

- ✅ ENG-04：只走 `dispatchMeridianFlowCommand`；消费 `qi.moveResolved` 的 `meridianAttackBp/flowCt/releasedQi/trace`，映射完整周天暴击，不重掷 RNG。
- ✅ ENG-09：保存 `carriedTicks`，调用 `progression/practiceInner`；受击调用 `progression/interruptMeditation`，把效果交 ENG-04 建 Buff。
- ✅ 纯整数、SFC32 `battle` 流、规范快照；无 DOM / 网络 / 墙钟 / 新依赖；未改禁止路径。
- ✅ `pnpm install --frozen-lockfile`、`pnpm check`、`check_ids.py --strict`、`git diff --check` 均通过。
- ⚠️ 覆盖率无项目阈值且执行来源为空，按强制单测流程 Step 6 跳过；Vitest bench 有 shared export getter 开销提示，不影响门禁通过。

