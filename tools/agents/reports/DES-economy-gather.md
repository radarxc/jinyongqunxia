# DES-economy-gather 报告 · 设计补充 · 金钱与物品获得、采集与药材（AR-28：武馆教练 / 镖局坐镇、遗迹探索、采集点、≥60 味药材与分布表）

## 1. 摘要（3–6 行）

- 已完成武馆教练、镖局坐镇、十四界收入 / 支出配平，以及唯一 `economySource` 分账。
- 已完成 83 处普通遗迹预算、三类采集点、确定性刷新 / RNG、防刷和剧情战斗奖励接口。
- 药物名录原 32 个机器行未改，追加 64 味药材；逐味分布名录覆盖完整 76 味，并另列 14 类特殊物品。
- 本轮返修将职位薪酬统一为整数文 / bp 单次取整口径，并修正连城两项 15% 的 half-up 显示值。
- 已联网核对药典、香港中药材标准、iPlant 与保护政策资料；未逐篇核完的学名、物候和原著细节均保留（待核实）/（待考）。

## 2. 产出（文件、行数、主要章节）

| 文件 | 行数 | 主要产出 |
|---|---:|---|
| `docs/design/16-resources-and-estates.md` | 1,758 | §8 教练 / 坐镇；§12 来源分账、十四界收支与周游建议；schema、事件、测试 |
| `docs/design/11-open-world.md` | 1,745 | §4.3 采集点；§4.4 普通遗迹、掉落与剧情战奖励；schema、校验、测试 |
| `docs/design/10-items-and-equipment.md` | 2,597 | §2.4 `permStat` 投影；§8.7 药材—资源—炼丹接口；§14.2 登记 64 味药材 |
| `docs/design/catalog/items-medicine.md` | 106 | 96 个机器行，其中原 32 行不变、追加 64 味 |
| `docs/design/catalog/gather-herbs.md` | 240 | 76 味逐味分布、14 类特殊物品、依据、校验与待决事项 |
| `tools/agents/reports/DES-economy-gather.md` | 本报告 | 决策、数值、同步项与自检 |

## 3. 关键结论与数值

- 武馆教练复用 `job_jiaotou`，基础薪酬 2400 bp、月需 4 块；新增 `job_zuozhen`，基础薪酬 4500 bp、月需 8 块，并与客卿共用 `activeSeniorContractId`。`F/R/quality/outcome` 用整数 bp，职责用整数分数 `dutyDone/dutyNeed`；保持精确有理分子到最外层，只对合同 / 月约现金执行一次 `round10`。
- 坐镇预约块内不可快速旅行、书眠或兼任另一高阶月约；非预约时可逛城、交易、采集和做不离城任务，救援占真实旅行时间。
- 普通遗迹五类，目标 `max(4,ceil(openRegionCount×0.75))`；稳定 `ch01..ch14` 为 `7/6/7/7/6/6/6/6/5/5/5/6/6/5`，合计 83，计入既有秘境预算。
- 城镇 / 山野 / 遗迹采集点默认 1 / 3 / 5 日刷新；采集用 `world` RNG 键 `chapterId/poiId/refreshIndex`，遗迹掉落用 `loot` RNG；预览、拒绝、取消均不耗游标。
- 奖励分账：剧情固定奖励 `quest`、敌人现银 `cash`、普通战利品 `loot`、教练 / 坐镇 `business`、采集净新增 `resource`；同一实例只记一个来源。
- 新增 64 味按子类为草本 16、根茎 19、花果 9、菌藻 5、动物 11、矿物 4；按品阶为黄 26、玄 20、地 15、天 3，天级占 `3/64=4.6875%`。
- 十四界 `B=I×H` 依 AR-26 展示序为：白马 91.2、天龙 285、射雕 1,316、神雕 3,000、倚天 6,900、笑傲 1,128、侠客 940、碧血 462、鹿鼎 585、连城 171、鸳鸯 152、书剑 756、飞狐 462、雪山 378 两，合计 16,626.2 两。
- 收入为任务 / 战利品 / 现银 / 营生 / 资源点 / 门派 / 其他=`40/25/10/10/8/5/2%`；支出包络为 `30/20/15/20/15%`。连城两项 `171×15%=25.65` 均按 half-up 显示 25.7，独立显示合计 171.1；实现仍按精确比例与整数文预算合计 171。

## 4. 开放问题（附默认值）

| 问题 | 本版默认值 |
|---|---|
| 药材是否随季节真实缺货 | 活体野外点严格关闭；药铺、任务和遗迹储藏提供旧库存替代，主线不锁死 |
| 普通采集是否强制技能 | 常见黄阶可徒手得 1 份；完整根茎、稀有副产、毒材和矿脉才检定既有 `med/poi/antidote` 或工具 |
| 九层后周游世界如何带钱 | 暂按 `carriedWen×I(next)/I(current)` 折算，封顶 `3.5×I(next)×1000` 文；待 `DES-changsheng-core` 定案 |
| 精确物候、真实原型与原著奇药 | 无可靠依据不设精确时辰；未逐条核完者继续（待核实）/（待考），不编引文或回目号 |
| 受保护动物来源能否采集 | 只作历史旧藏或不可交易证据收据，不开放现实采集循环 |

## 5. 对基准的修改提案（编号 / 提案 / 理由）

| 编号 | 提案 | 理由 |
|---|---|---|
| P-B3-06 | §17 登记普通遗迹总计 83，属于既有秘境预算；普通采集点复用 `poi_*` | 防止重复计场景或另造前缀 |
| P-GH-01 | §18 明确采集 / 遗迹归 `design/11`、资源经营归 `design/16`、物品 / 炼丹归 `design/10` | 固化唯一归属 |
| P-GH-02 | 书序与时代表吸收 AR-26：`ch10_baima` ID 不改，显示为唐代第一本正式书 | 消除基准与作者新要求的时序差 |

## 6. 需同步到其他文档（文档 / 位置 / 改什么）

| 文档 | 位置 / 改什么 |
|---|---|
| `DES-changsheng-core` / `design/13` | 定案九层后跨界现钱折算、封顶与周游善款账 |
| `design/02`、`design/19` | 同步 AR-26 的白马唐代与首书展示序；保留稳定 `ch10_baima` |
| `design/12` | 消费 `job_zuozhen`、职责事件、遗迹 / 剧情战 `rewardSplit` 和唯一来源规则 |
| `design/14` | 展示十二时辰职位冲突、采集窗口反馈、遗迹首通 / 重访和来源拆账 |
| `tech/04` | 落 `GatherSpec`、遗迹掉落表、合同字段、64 味登记与闭集校验 |
| `tech/05` | 实现 `world/loot` RNG 分流、收据幂等、原子奖励和高阶合同并发锁 |
| `chapters/01`～`14` | 落 83 处遗迹、采集点、商店替代、奇物唯一收据及逐书原著考据 |

## 7. 自检（逐条对照本任务的验收标准：✅ / ⚠️ + 说明）

### 7.1 需作者确认（附默认）

- 药材是否随季节真实缺货（对应 §4 第 1 项）：默认活体野外点严格关闭，以药铺、任务、遗迹旧库存兜底主线。
- 普通采集是否强制技能（对应 §4 第 2 项）：默认常见黄阶可徒手得 1 份，完整根茎、稀有副产、毒材和矿脉才要求既有技艺或工具。
- 九层后周游世界如何带钱（对应 §4 第 3 项）：默认按购买力比例折算并封顶下一界 `3.5×I` 两，待 `DES-changsheng-core` 定案。
- 精确物候、真实原型与原著奇药（对应 §4 第 4 项）：默认无可靠依据不设精确时辰，未核完者保留（待核实）/（待考）。
- 受保护动物来源能否采集（对应 §4 第 5 项）：默认只作历史旧藏或不可交易证据收据，不进入循环采集。

### 7.2 交下游（ENG-*）字段清单

当前未有已确定的 ENG 编号，以下各项均为“ENG 编号待调度器分配”。

- 遗迹掉落：`tableId/chapterId/sitePoiRef/sourceKind/rolls/poolRef/gradeCap/fixedItems/uniqueGuards/economySource/repeatPolicy`，以及 `firstClearReceiptKey`、原子结算；下游为数据管线与玩法引擎（ENG 编号待调度器分配）。
- 采集刷新与 RNG：`gatherType/habitatTags/seasons/lunarMonths/phases/refresh/skill/requiredToolTags/yields/maxYield/rngStream/persistence`，稳定键 `chapterId/poiId/refreshIndex`；下游为数据管线与玩法引擎（ENG 编号待调度器分配）。
- `economySource` 分账：`sourceBucket/sourceId/transactionId/referenceValueWen/createdAtWorldTick/grossAcquiredValue/newEconomicValue` 及单实例唯一来源；下游为经济账本与存档任务（ENG 编号待调度器分配）。
- 职位收入：`jobRef/businessRef/requiredBlocks/completedBlocks/outcome/rewardBucket`，以及 `Iwen/basePayBp/Fbp/Rbp/dutyDone/dutyNeed/qualityBp/outcomeBp`、`activeSeniorContractId`；下游须使用加宽整数保留精确分子，只在合同现金最外层 `round10`（ENG 编号待调度器分配）。
- 跨界金钱：`carriedWen`、前后界 `I`、`3.5×I(next)×1000` 文封顶和只读“周游善款”；待 `DES-changsheng-core` 定案后交跨界存档任务（ENG 编号待调度器分配）。
- 药材内容：`itemRef/realPrototype/regionIds/habitatTags/seasons/lunarMonths/phases/chapterIds/gatherType/rarity/minYield/maxYield`；内容编译器还须将固定映射 `permStat={str:1,con:1}` 展开为两个既有 op；下游为内容编译与采集候选闭集校验任务（ENG 编号待调度器分配）。

### 7.3 验收结果

- ✅ 只改五个获准设计文件并新建本报告；未修改基准、决定文件、`TODO.md` 或其他文档。
- ✅ §8.5 已改为先校验 `requiredBlocks>0`，再令 `dutyNeed=requiredBlocks`；BIZ-T06 复算 4/4 块为 4,560 文、2/4 块为半薪 2,280 文，现金均仅在最外层一次 `round10`。
- ✅ 原 32 个药物机器行与 `HEAD` 逐字一致；追加 64 味，六子类齐全，天级 3 味且不超过 8%。
- ✅ `it_pusiqushedan` 已改用正式 `permStat={str:1,con:1}`；`design/10` 定义其展开为两个既有 `permStat` op，不再含未定义的 `perm.str` / `perm.con`。
- ✅ 76 味药材在物品名录与分布表集合完全一致；分布表逐味含原型、地区、生境、采期、书界、点型、稀有度、原著和真实依据。
- ✅ 不含现实剂量、处方或医疗建议；毒材明确限设定，受保护来源限历史旧藏 / 证据表现。
- ✅ 本轮复跑 `python3 tools/lint/check_item_catalog.py docs/design/catalog/items-medicine.md --min 92`：退出码 0，96 行通过。
- ✅ 本轮复跑 `python3 tools/lint/check_ids.py --strict`：退出码 0，新增严格错误 0；仅输出仓库基线已有的 `docs/README.md` 未定义引用提示。
- ✅ 自定义检查：76 / 76 ID 唯一且无差集，11 列药材表与 7 列特殊物品表无异常，30 个 `rg_*` 全合法。
- ✅ `git diff --check` 通过；五份文档代码围栏成对、无替换字符、无截断占位。
- ⚠️ NMPA / 卫健委部分官方页面直连返回 HTTP 412，仅能由官方搜索索引核标题；76 味现代专论未逐篇打开，不确定项已如实标注。
