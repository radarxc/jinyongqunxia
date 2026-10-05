# DES-qi 报告 · 设计同步 · 经脉与运气模型按 AR-19 补全（宽度 / 长度 / 速度 / 通量、丹田产气、聚气、完整运气加成）

## 1. 摘要（3–6 行）

- 已在既有河流模型内补齐宽度、长度、速度、在途气、丹田产气与完整周期通量锻炼，全部采用整数 / bp 与确定性顺序。
- 已确立“人物无独立等级”的唯一资源根公式；武功 1–9 熟练层与脉穴品阶 / 强度决定 `hpMax/mpMax`，永久药效统一进入经脉强化接口。
- 已把同一 tick 的 CT 与运气、行动 / 急性聚气二选一、完整 / 不完整周天 Z5M、周天暴击事件及六条文案接入战斗契约。
- 已列出 schema、迁移和回放所需字段；本任务只完成策划 / 技术规划，正式 Zod、Core、golden 仍交 ENG-02 / ENG-03。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/21-meridian-flow-and-moves.md` | 2545 | §2–§3 河流状态与公式；§4.4.2 周天曲线 / 暴击；运行态、迁移、测试 |
| `docs/design/09-combat-system.md` | 3472 | §3 同 tick 调度、急性聚气；§13 命令 / 事件 / 拒绝；验证与交接 |
| `docs/design/03-attributes.md` | 1871 | §3.0 无等级兼容边界；§5.1 唯一资源根公式；永久药效迁移 |
| `docs/design/05-martial-arts-system.md` | 3324 | §3.0 1–9 层；§5.8.1 内功五类 AR-19 参数；校验 / 测试 |
| `docs/design/15-meridians-and-acupoints.md` | 1687 | §6.7 战斗投影；§11.5 `MeridianProgress v2` / 强化 / 迁移 |
| `docs/tech/04-data-pipeline.md` | 2107 | §3.6 静态字段；§3.8.4 人物 / 战斗字段；MF-V01～MF-V24 |
| `tools/agents/reports/DES-qi.md` | 105 | 七节交付摘要、提案、同步项、映射与工程交接 |

## 3. 关键结论与数值

1. `nodeFluxCap=min(meridianFluxCap,acupointFluxCap)`，`carryCapacity=nodeFluxCap×lengthUnit`；穴 / 脉通量硬顶为 64 / 96，长度 1–12，路线至多 18 段。
2. `productionPerTick=floor(baseQiPerTick×layerCurveBp[n]/10000)`；`qiSpeedBp=floor(baseQiSpeedBp×layerCurveBp[n]/10000)`；默认层曲线为 `5000+625n`（`n=1..9`）。
3. `releaseRate=min(productionPerTick,bottleneckFlux,floor(bottleneckFlux×qiSpeedBp/10000))`；`releasedQi=min(availableRouteQi,routeCarryCap,releaseRate×windowTicks)`，到承载上限即停止增量。
4. 通量周期增量为 `floor(fluxTrainBase×layerCurveBp×headroomBp/10^8)`；未达硬顶至少 +1，失败 / 中断 / 战斗调息不成长。
5. 资源复算例：`skillHp=270,innerHp=190,innerMp=290,opened=9,meridianScore=24,acupointScore=162`，故无修饰 `hpMax=1300,mpMax=1222`。
6. 不完整周天锚点为 `0/2500/5000/7500/9999 → 5000/6000/7500/9000/10000 bp`；完整 10000 跃迁 13500 bp，最终 Z5M 钳 6500–22000。
7. `unitQiHardCap=max(全部可用路线 routeCarryCap)≤13824`，不是路线承载求和；丹田 + 全路线、逐路线、逐节点均分别守恒。

## 4. 开放问题（附默认值）

| 问题 | 本次默认值 |
|---|---|
| 完整周天跃迁强度 | 13500 bp；仍受 Z5M 6500–22000 总钳制 |
| 临时换路的旧气 | 旧路线继续推进，新路线只接后续注入；共享 `unitQiHardCap` |
| 未手配内功 AR-19 参数 | 按品阶公式确定性编译并报警；核心 / 天阶后续物化 |
| 180 穴长度差异 | v1→v2 暂补 `lengthUnit=1`；后续在 1–12 内审校并重录 golden |
| 聚气 AI 阈值 | 完整后收益 ≥1500 bp 且两行动内生存概率 ≥50% |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| AR19-P01 | Canon §3–§5 改以 03 §5.1 为资源真值，人物无独立等级 | 落实 AR-19，消除等级与武功 / 经脉双成长 |
| AR19-P02 | Canon / 02 / 13 的等级、经验、补级改接武功 / 经脉或无状态 `Cb` | 旧字段只可迁移 / 选行 |
| AR19-P03 | 05 / 10 的永久资源百分比迁为 `MeridianTemperEffect` | 药材强化经脉 / 穴位且不双算资源 |
| P-18 | Canon 登记 1–9 资源 / 战斗熟练层与内功五类参数 | 第 10 重只保留圆满能力 |
| P-09-12 | Canon 登记共用 `battleTick` 与急性聚气 | 固定跳过行动、1000 收招及计数语义 |
| QI15-P01 | Canon/schema 登记脉穴品阶、强度、通量、长度与进度 v2 | 永久事实只归 15 |
| QI-P02 | Canon 登记宽 / 长 / 速 / 产气 / 在途气 / 聚气 / 周天曲线 | 形成唯一可回放规则 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `docs/00-canon.md` | §3–§5、§8–§9、§18–§19 | 接纳 §5 的七项提案，撤销生产人物等级 / 经验真值 |
| `docs/design/02-progression.md`、`13-tianshu.md` | 等级 / 经验 / 补级 | 改接具体武功、经脉或 `Cb`；旧值仅供迁移 |
| `docs/design/10-items-and-equipment.md` | §8 永久药材 / 丹药 | 改发单目标 `MeridianTemperEffect`，禁止同时直加永久资源百分比 |
| `docs/design/14-ui-ux.md` | 战斗 HUD / 提示 | 展示路线气、周天进度、承载上限与两项 Core 事实事件 |
| `docs/tech/01`、`05-gameplay-engine.md` | 命令、Core、存档、RNG、golden | 接 protocol 3、逐路线气包、急性聚气与完整周天暴击 |
| 武学图鉴 | 各内功卡 | 物化五类参数；本任务依约未修改图鉴 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 概念映射表

| 作者用语 | 字段 / 公式 | 状态 |
|---|---|---|
| 宽度 / 每脉穴通量 | `fluxCap`；节点取脉穴最小值，单位气 / tick | ✅ |
| 长度 | `lengthUnit`；`routeTravelTicks=ceil(totalLength×10000/qiSpeedBp)` | ✅ |
| 速度 | `qiSpeedBp=baseQiSpeedBp×layerCurveBp/10000` 向下取整 | ✅ |
| 数量 / 在途气 | `routeFlows[].packets[].amount`，聚合为 `inFlightQi` | ✅ |
| 丹田产气 / 单位时间 | `productionPerTick`；每 tick 先产气再推进 | ✅ |
| 周期跑通锻炼 | `rawGain` 余量递减公式，脉 / 穴硬顶 96 / 64 | ✅ |
| 人物速度 / 聚气 | `BattleUnit.ct`；满槽提交 `acuteQiGather` 或普通行动 | ✅ |
| 完整 / 不完整运气 | `circulationBp` → 唯一 `circulationDamageBp` → Z5M | ✅ |

### 7.2 与既有 AR 的冲突与裁定

| 冲突 | 裁定 / 迁移 |
|---|---|
| 旧 Canon 人物等级 / 经验 vs AR-19 无等级 | AR-19 优先；`Lr/Ld/ExpState` 仅旧回放，`Cb/Ce` 仅无状态兼容选行 |
| AR-14 `Q0/ΔQ` / 完成质量 vs AR-19 逐 tick 气 | AR-19 替换旧气量入口；AR-14 路线质量保留为基础 Z5M，不重复乘完成度 |
| AR-16 外放曲线 vs AR-19 周天 | 先得普通 / 外放唯一基础 Z5M，再在同一 Z5M 应用周天，不新增乘区 |
| AR-18 经脉性质 vs 本轮宽度 / 长度 | 性质判定保持不变；15 提供永久脉穴事实，21 只持战斗投影 |
| 旧第 10 重资源贡献 | 资源 / 运气钳到 9 层；第 10 重只保留既有圆满能力 |

### 7.3 数值样例：最终 Z5M（不完整 / 完整，bp）

| 内功\经脉 | 弱 | 标准 | 强 |
|---|---:|---:|---:|
| 低 | 6500 / 10377 | 6500 / 11931 | 6790 / 13047 |
| 中 | 6500 / 10795 | 6897 / 13500 | 7299 / 14663 |
| 高 | 6500 / 10795 | 6795 / 13136 | 8256 / 17680 |

### 7.4 ENG-02 / ENG-03 字段清单与校验

- ✅ ENG-02：`InnerDef(baseQiPerTick,baseQiSpeedBp,layerCurveBp[9],fluxTrainBase,fluxTrainHardCap)`；`AcupointDef.lengthUnit`；`MeridianProgress v2` 脉穴品阶 / 强度 / 经验 / `fluxCap`；`MeridianTemperEffect`；v1→v2 幂等迁移。
- ✅ ENG-03：`BattleMeridianQi(dantianQi,productionPerTick,qiSpeedBp,unitQiHardCap,activeInjectionRouteId,nextPacketSeq,routeFlows,packets)`；节点在途量；`ct/qiGatherState/circulationBp`；protocol 3 快照 / hash / 旧 runner。
- ✅ 命令 / 事件：`acuteQiGather`、`battle/acuteQiGathered`、`battle/fullCirculationCritResolved`；Core 发事实，UI 不重掷。
- ✅ 六份负责文档均写版本记录；公式全整数化；旧待决项保留并标解决 / 默认；未改图鉴、Buff、Canon 或项目任务总表。
- ✅ `python3 tools/lint/check_ids.py --strict` 无新增严格错误；`git diff --check` 通过；围栏均成对，未发现占位文本。
- ⚠️ 正式 Zod / Core / 跨语言 golden、逐穴长度配表和真机战斗平衡尚未实现或实测，已明确交 ENG-02 / ENG-03 与后续数值审校。
