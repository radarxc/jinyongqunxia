# 12 · 任务、人物接口、门派、经济与生活技能（Quests, NPC Interfaces, Factions, Economy & Life Skills）

> 归属（基准 §18）：任务结构与任务 DSL、门派加入 / 门规 / 贡献 / 晋升 / 叛出、品德与声望的事件口径、书界经济循环、生活技能玩法。
> 上游：`docs/00-canon.md` v1.2；作者新增需求与已采用决定见 `docs/decisions/author-requirements.md`、`docs/decisions/author-decisions.md`；跨文档裁定见 `docs/decisions/rulings-v1.md`。
> 引用而不重定义：NPC、同伴、招募难度、生卒、好感 / 羁绊、书眠与重逢 → `design/18-npc-and-companions.md`；NPC 的区域时代层地点日程与 `ScheduleBlock` → `design/11-open-world.md` §6.3；门派史、时代状态、驻地、人物、称谓模板、武学索引与原著依据 → `design/17-sects-compendium.md`；地图 → `design/11-open-world.md`；武学传授 → `design/05-martial-arts-system.md`；战斗队伍与合击 → `design/09-combat-system.md`；物品、配方、丹药、菜肴、锻造和价格基值 → `design/10-items-and-equipment.md`；成长与结局 → `design/13-progression-and-endings.md`；冲穴与打坐 → `design/15-meridians-and-acupoints.md`；资源、家丁与城市营生 → `design/16-resources-and-estates.md`；跨年代传承源、残本、信物、机会收据、缓存与校合 → `design/20-legacy-inheritance.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档，先给可用数值并在文末登记。
> 版本：v1.2（跨文档同步，2026-09-26）；全局审计（2026-09-26）。

---

## 0. 结论先行与范围

1. 任务是确定性状态机，不是脚本任意改状态的入口。YAML 条件编译成白名单 AST，动作先生成命令，再由 core 在提交时重验；Ink 和可选 AI 都不能绕过这条边界。
2. 五类任务固定为 `main / side / faction / bond / qiyu`。十四书界主线使用带路线码的 `q_<NN>_main_<c|z|x>_<nn>`，其余任务使用 `q_<NN>_<类型>_<nn>`；终局另保留 `q_15_main_<nn>` 容器。任务允许阶段、分支、软失败、硬失败和时限，但主线不得因隐藏倒计时永久锁档。
3. 人物资料与同伴状态机已由 AR-09 移交 `design/18`。本文只定义任务如何查询、改变、监听人物状态，以及门派 NPC 如何从 `design/17` / `design/18` 取得当代职级。旧“队友绝不跨书界”已被跨书重逢规则覆盖。
4. 门派资料唯一源是 `design/17` 的 99 个规范组织与 1,386 个时代状态单元。本文固定 L1–L5 晋升机制，并把“正式弟子”“客卿 / 盟友”“敌对”分开；每书界至多担任一个组织的 L5。
5. 经济以 `design/10` §13 的物品价值为锚，并以 `design/16` §12 的七类收入桶和十四界预算为正式口径。货币与门派身份在书眠时清零；经营、资源、家丁和营生的产出、成本与结算归 `design/16`，本文只定义任务与门派侧消费接口。
6. 十项基准技艺沿用 `design/03` 的 0–100 曲线。烹饪是生活技能玩法，但当前不新增第十一项 `cook` 属性；菜谱熟练度独立存储，数值提案见 §10.4。

### 0.1 章节导航

| 章节 | 内容 | 主要消费者 |
|---|---|---|
| §1–§3 | 任务分类、生命周期、DSL 与完整夹具 | 章节策划、`tech/04`、`tech/05` |
| §4 | 奖励预算、日志、追踪与时间 | 数值、UI |
| §5 | NPC / 同伴交互接口 | `design/18`、Ink、AI 适配器 |
| §6–§7 | 门派身份、职级、任务链、兼容与门派总表 | 章节策划、图鉴 |
| §8 | 品德与声望 | 任务、门派、结局 |
| §9 | 货币、价格、收入支出、商店与防通胀 | `design/10`、`design/16` |
| §10 | 十一类生活玩法及制作接口 | `design/03`、`design/10` |
| §11 | YAML 数据结构 | 内容管线、玩法 core |
| §12–§14 | 术语、校验与待决事项 | 全体 |

### 0.2 唯一归属边界

| 概念 | 唯一归属 | 本文只做什么 |
|---|---|---|
| 人物名录、生卒、时代出现、武学画像 | `design/18` | 查询接口和任务动作 |
| NPC 区域时代层地点日程、`ScheduleBlock` 与时间门禁 | `design/11` §6.3 | 查询当前地点、下一开放时段和任务覆写 |
| 好感、信任、芥蒂、羁绊等级、招募 D1–D5 | `design/18` | 门槛表达、增量动作、事件监听 |
| 活动编组 ≤6、战斗合击效果与 AI | `design/09`、`design/18` | 任务解锁合击 / 编组许可，不定义效果 |
| 门派历史、驻地、时代开放、称谓模板、人物 | `design/17` | 规则与 99 行汇总视图 |
| 武学本体、`reqs`、师父与来源层数上限 | `design/05`、各图鉴 | 职级只开放候选目录，不自动授予 |
| 物品估值、配方、成品与制作结算 | `design/10` | 商业修正、技能玩法与任务投放 |
| 资源点、家丁、行脚 / 教头 / 客卿 / 赌场 | `design/16` | DSL 原语、任务模板和收入汇总接口 |
| 经脉、穴位、打坐地点加速 | `design/15` | 任务解锁地点 / 师父指点许可 |
| 传承源、缓存、残本、信物、机会收据与校合 | `design/20` | 只读事实与受控 intent 的任务侧适配 |

---

## 1. 任务系统总则

### 1.1 五类任务与 ID

| 类型 | ID 片段 | 责任 | 允许永久失败 | 默认追踪 | 典型奖励 |
|---|---|---|---:|---:|---|
| 主线 | `main` | 幕推进、锚点事件、取得天书 | 否；只能转替代阶段 | 是 | `main_step`、`main_act`、`anchor`、`fate` |
| 支线 | `side` | 地方故事、案件、营生、设施与普通人物 | 是，但不得切断主线 | 接取后是 | `side_small` 或链式 `side_stage/side_chain` |
| 门派 | `faction` | 入门、门规、贡献、晋升、叛出、掌门线 | 是；逐出后可转救赎 / 对抗 | 是 | `faction_rank`、贡献、传授资格 |
| 羁绊 | `bond` | 与 `design/18` 人物关系和招募 / 重逢交互 | 是；命定节点按改命规则处理 | 同伴在队时是 | `bond_stage`、好感 / 羁绊、合击许可 |
| 奇遇 | `qiyu` | 由地点、时辰、福缘、行为组合触发 | 是 | 否，发现后可开 | `qiyu`、特殊来源、见闻 |

规范是三个不相交的闭集：十四书界主线 `^q_(0[1-9]|1[0-4])_main_[czx]_[0-9]{2}$`；序章与十四书界非主线 `^q_(0[0-9]|1[0-4])_(side|faction|bond|qiyu)_[0-9]{2}$`；终局容器例外 `^q_15_main_[0-9]{2}$`。`c/z/x` 分别表示共有 / 正 / 邪路线，属于正式稳定 ID；`00` 为序章，`01`–`14` 为十四书界，`15` 不是第十五书界。两位序号在“书界 × 类型 × 路线（如有）”内局部编号；新建前全仓搜索，已发布 ID 永不换义。示例夹具占用本文 §3 的 90/91 号段，但发布内容应移入测试目录并排除正式任务注册表。

### 1.2 任务状态与阶段状态

```text
locked ──offer──► available ──accept──► active ──advance──► active
   │                    │                  ├──complete──► completed
   │                    └──expire──► expired             │
   └──────────────不可见 / 只显线索          ├──fail─────► failed
                                              └──suspend──► suspended ──resume──► active
```

| 状态 | 含义 | 是否终态 | 可否转回 |
|---|---|---:|---:|
| `locked` | 前置未满足；通常不显示 | 否 | 条件满足自动重评 |
| `available` | 可接取；尚未创建运行实例 | 否 | 可过期或被分支关闭 |
| `active` | 正在执行 | 否 | 可推进、挂起、失败、完成 |
| `suspended` | 当前时代层 / NPC / 地点暂不可用 | 否 | 条件恢复后继续 |
| `completed` | 成功终态 | 是 | 不回退；新分支另开任务 |
| `failed` | 硬失败终态 | 是 | 不回退；可激活补救任务 |
| `expired` | 未在窗口内接取或推进 | 是 | 不回退；主线禁止以此锁死 |

每个阶段有稳定 `stageId`、`entry`、`objectives[]`、`transitions[]` 与可选 `deadline`。运行时只保存 `questId + schemaVersion + state + stageId + counters + acceptedAt + deadlineAt + branchPath + appliedEffectIds`；显示文案从当前内容包读取。阶段迁移必须有唯一入口，允许多个终态，不允许无出口且未标 `terminal` 的节点。

### 1.3 条件、分支与可见性

条件分四层评估：

1. `offerWhen`：是否生成可接任务；失败时不创建实例。
2. `showWhen`：是否在日志 / 地图显示；只能收窄展示，不能放宽接取。
3. `transition.when`：阶段出口；同一事件可有多个候选，但必须按 `priority` 降序并命中首个。
4. `action.guard`：提交动作前最后防线；即使 Ink 或 UI 发出 intent，也必须重验。

分支记录稳定 `branchKey`，不只记录目的阶段。互斥出口必须含兜底或经校验能证明穷尽；选择造成不可逆后果前显示影响类别，例如“门派关系将改变”，但隐藏数值和未发现结局名。原著锚点不可被普通支线条件绕开；改命分支须走 `design/13` 的改命资格与代价。

### 1.4 失败、超时和回退

| 失败模式 | 规则 | 示例 |
|---|---|---|
| `soft` | 进入替代阶段，少奖励或改变关系，任务仍可收束 | 护送货损但人未亡 |
| `hard` | 任务 `failed`，可开启补救 / 敌对任务 | 叛门后原晋升链关闭 |
| `branch` | 失败是合法剧情出口 | 战败后由原著人物救场，锚点继续 |
| `retry` | 恢复到战前检查点；不重复一次性奖励 | 必须胜利的教学战 |
| `suspend` | NPC 暂离、时代入口关闭；不判失败 | 同伴驻留别处 |

时限统一用世界内时间：`gameMinute`、绝对 `worldDay` 或时代 `year`，禁止墙钟。`deadline` 可设 `fromAccept`、`absolute`、`stageLocal`；暂停菜单不走时，旅行 / 休息按 `design/11` 推进。主线倒计时必须在接受前明示，并至少保留一个不依赖该时限的锚点出口。书眠事务先结算到期任务，再记录书契 / 人物快照，最后清理本书界实例。

### 1.5 稳定事件与幂等

任务只消费稳定领域事件，不监听 UI 文案或临时动画：

| 事件族 | 最小载荷 | 常见消费者 |
|---|---|---|
| `quest/advanced`、`quest/succeeded`、`quest/failed` | `questId, oldStatus, newStatus, stageKey, source`；任务定义的 `stageId` 在运行时映射为 `stageKey` | 日志、成就、后继任务；命名与载荷服从 `tech/05` §10.2 |
| `battle/ended` | 载荷只读 `design/09` §2.11、§13.5 / `tech/05` 的 `BattleOutcome`；`outcome=win/lose/retreat/draw` | 战斗目标、品德事件；世界奖励在 `battle/finalize` 才提交 |
| `inventory/changed` **【建议值】** | `itemId, delta, sourceRef` | 收集 / 交付目标；待 `tech/05` 冻结正式名与载荷 |
| `world/locationEntered` **【建议值】** | `chapterId, regionId, cityId?, placeKey?, eraLayer` | 探索、奇遇；待 `tech/05` 冻结正式名与载荷 |
| `world/timeAdvanced` **【建议值】** | `fromMinute, toMinute` | 日程、期限；待 `tech/05` 冻结正式名与载荷 |
| `sect/joined`、`sect/promoted`、`sect/left` **【建议值】** | `sectId, oldStatus, newStatus, oldRank?, newRank?` | 门派链、商店；与 `tech/05` §11.3 当前建议族对接 |
| `companion*` | 见 `design/18` §7.4 | 招募、离队、死亡、重逢 |
| `businessContractCompleted` / `teachingMonthCompleted` / `keqingDutyResolved` / `businessContractBreached` / `casinoIncidentResolved` | 仅消费 `design/16` §15.3 已登记名称；载荷逐字段服从 `tech/05` 的注册 schema，本文不另造事件名或字段 | 营生任务、关系、品德与声望 |

每个持久效果须声明稳定且不可换义的局部 `effects[].id`，再派生 `effectId=<questId>/<stageId>/<effectLocalId>`；禁止用数组下标生成，以免插入效果后破坏幂等。`appliedEffectIds` 去重。战斗结算、奖励、事件发布处于同一事务：全部成功才提交，否则整体回滚。读档重放同一效果不得重复发钱、道具、贡献或关系值。

---

## 2. 任务 DSL

### 2.1 设计原则

- YAML 是数据，不是代码；禁止任意 JavaScript、`eval`、函数声明、循环、动态属性索引、正则和运行时文件 / 网络访问。
- 条件是无副作用表达式；动作是白名单命令。构建期编译成带类型 AST，运行时不解析字符串表达式。
- 所有引用必须解析到注册表；数值有 schema 范围；未知字段在 strict schema 下报错。
- 条件求值只读同一提交快照；动作按列表顺序生成命令，但最终以一个事务提交。
- 随机只允许显式 `check`，使用 `world` RNG、固定 `rollId` 并写命令日志；不得在 `when` 中暗抽随机数。

### 2.2 条件语法

```yaml
# 每个序列元素都是独立的 ConditionExpr；单个 map 恰有一个操作符。
conditionExamples:
  - all:
      - { flag: { id: fl_fixture_juxian_help, is: true } }
      - { not: { quest: { id: q_01_main_c_90, state: failed } } }
  - any:
      - { compare: { left: { stat: morality }, op: ge, right: 40 } }
      - { hasItem: { id: it_xuantieling, count: 1 } }
  - { quest: { id: q_01_main_c_90, state: active, stage: st_help } }
  - { sect: { id: sect_shaolin, status: member, rankAtLeast: 2, contributionAtLeast: 300 } }
  - { npc: { id: npc_xuzhu, state: alive, affinityAtLeast: 20, bondAtLeast: 40 } }
  - { companion: { id: npc_xuzhu, station: active, everRecruited: true } }
  - { time: { yearMin: 1093, yearMax: 1094, period: night } }
  - { location: { regionId: rg_dali_cangshan, cityId: city_dali, eraLayer: ch01 } }
  - { estate: { kind: job_active, jobRef: job_xingjiao, businessRef: biz_fixture_08_escort_01 } }
  - { estate: { kind: resource_point_state, pointRef: rp_fixture_mine_07, ownership: owned } }
  - { estate: { kind: servant_available, servantRef: sv_fixture_guard_07, minLoyalty: 40 } }
  - { event: { name: companionRejoined, npcId: npc_zhaobanshan } }
```

`compare.left` 白名单为 `level`、`morality`、`fame`、`fameTotal`、十项 `art.<id>`、`sectContribution.<sectId>`、NPC 关系查询和已注册计数器；仅在对应 `onEvent` 处理器内，还可读取该事件 schema 已登记的 `{ eventField: <name> }`。`companion.everRecruited` 与快照来源是 `design/18` 的持久状态查询，不能拿历史事件队列充当数据库。`estate` 的载荷必须逐字段匹配 `design/16` §14.4 `EstateCondition` 判别联合。传承域只开放两类只读事实：`{ legacy: { sourceId, field, op, value } }` 的 `field` 仅为 `status/fragmentCount/hasKeystone/localMisses`，以及 `{ legacyCache: { cacheId, field, op, value } }` 的 `field` 仅为 `state/progress`；字段含义、状态枚举与生命周期只读 `design/20` §2、§6、§12。`op` 仅 `eq/ne/lt/le/gt/ge`。缺失引用不是 `false`，而是构建失败；运行时缺失存档字段经 schema migration 补默认值后才求值。

### 2.3 动作语法

| 动作 `op` | 关键参数 | 约束 / 结果 |
|---|---|---|
| `flag/set`、`flag/clear` | `flagId` | 旗标必须预登记；临时旗标带作用域 |
| `quest/advance` | `questId, toStage` | 出口须存在；当前阶段匹配 |
| `quest/complete`、`quest/fail` | `questId, endingKey` | 只能到声明终态 |
| `reward/exp` | `expKind, levelRef, multiplier?` | 调用 `design/13`，不直接填任意经验数 |
| `reward/money` | `budgetShare, sourceBucket, sourceId` | 由 §4 / §9 预算器求值；`sourceBucket` 通常为 `quest`，经营结算不得使用本动作二次发钱 |
| `reward/item` | `itemId, count` | 物品存在、可发放、背包有回退 |
| `reward/fame`、`reward/morality` | `delta, reasonCode` | 分别钳制到 0–9999、−100–100 |
| `sect/contribution` | `sectId, delta, reasonCode` | 当前时代组织可消费；可为负 |
| `npc/affinity`、`npc/bond` | `npcId, delta, reasonCode` | 刻度与状态归 `design/18`；core 钳制 |
| `companion/recruit` | `npcId, difficulty, station` | 走 R0–R6；不绕过 D1–D5 门槛 |
| `companion/station`、`companion/depart`、`companion/betray` | `npcId, ...` | 发布 `design/18` 稳定事件 |
| `companion/confirmDeath`、`companion/fateRescue`、`companion/rejoin` | `npcId, ...` | 走生死 / 改命 / U0–U5 重逢事务 |
| `sect/join`、`sect/claimRank`、`sect/discipline`、`sect/expel` | `sectId, ...` | 走 §6 状态机；`claimRank` 只申请当前下一职级，任务内容不能传目标级或直接写存档 rank |
| `battle/start` | `encounterId, allyControl?` | 交 `design/09`；剧情友军默认 AI |
| `world/openEntrance` | `entranceId` | 入口和时代层必须匹配 `design/11` |
| `dialogue/start` | `storyId, knot` | 启动 Ink；Ink 回传 intent 后再校验 |
| `event/emit` | `name, payload` | 仅稳定事件白名单 |
| `estate/<kind>` | 与 `design/16` §14.5 同名的 payload 字段 | 去掉 `estate/` 前缀后必须恰为 `EstateAction.kind`；同事务调用 16 的领域 helper |
| `meridian/unlockPracticeSite` | `locationId, meditationQuality` | `meditationQuality=0/1/2`；转交 `design/15`，不直接加冲穴进度 |
| `meridian/grantMasterGuidance` | `teacherNpcId, meridianId, charges, guidance` | `guidance` 采用 `MeridianGuidance`；资格与额度归本文，冲穴计算归 `design/15` |
| `legacy/revealCache` | `cacheId` | 映射 `legacy_reveal_cache`；只显露已由 20 调度的缓存 |
| `legacy/advanceCache` | `cacheId, work, receiptKey` | 映射 `legacy_advance_cache`；工作量与合法推进由 20 / 16 重验 |
| `legacy/resolveOpportunity` | `sourceId, opportunityId` | 映射 `legacy_resolve_opportunity`；唯一消费机会收据与 `qiyu` RNG |
| `legacy/grantFragment` | `fragmentId, receiptKey` | 映射 `legacy_grant_fragment`；卷位、重复与传承匣容量由 20 重验 |
| `legacy/grantKeystone` | `itemId` | 映射 `legacy_grant_keystone`；唯一物转移而非复制 |
| `legacy/completeSynthesis` | `recipeId` | 映射 `legacy_complete_synthesis`；门槛、代价、形态与产物由 20 结算 |

技能学习不设通用 `skill/grant`。任务只能发 `learnSource/unlock` 或启动 `master/instruct`，随后由 `design/05` 的 `reqs`、来源品阶、层数上限、师父状态再次校验；天阶观摩默认不可，只有图鉴逐条 `observable=true` 才能走观摩。

经营域不再接受旧 `livelihood/*`、`resource/*`、`household/*` 通配命令。YAML 适配层只做一次机械变换：`op: estate/start_job_contract` 转为 `{kind:'start_job_contract', ...payload}`；条件则原样把 `estate:` 的 map 交给 `EstateCondition`。未知 `kind`、多余字段，或在 `grant_resource` 这类会创造经济价值的动作中缺少 `economySource/sourceId`，均在构建期失败；不创造价值的 `consume/set/assign/start/end/reserve/settle/record` 动作只校验其各自必填字段，不能被错误要求携带这两个字段，也不能降级为任意事件或金额为 0。

传承动作同样只做命名空间适配，不在任务层复制传承算法：六个 `legacy/*` opcode 一一映射上表对应的 `LegacyQuestIntent.kind`。任务 core 在进入传承 helper 前重验当前任务 / 阶段、引用和 payload；阶段推进、物品或武学变化、机会 / 校合收据、RNG 状态与 `effectId` 在同一事务提交，任一动作失败则全回滚。任务效果幂等键仍为 `<questId>/<stageId>/<effectLocalId>`，传承域 `receiptKey` 另按 `design/20` §10.2 校验；二者缺一不可，禁止任务脚本直接写 `fragments[]`、`sourceGrade`、缓存进度或 RNG。

### 2.4 检定原语

```yaml
check:
  id: chk_<quest>_<stage>_<nn>
  mode: probability       # probability | hard
  value: { art: speech }  # 或 attr / composite 已登记来源
  dc: 55
  onSuccess: st_persuade
  onFailure: st_fight
```

- `probability` 使用 `P=clamp(0.50+0.025×(value−DC),0.05,0.95)`（`design/03` §8.1）；同一 `check.id` 在同一任务实例只掷一次并保存结果。
- `hard` 使用 `value ≥ DC`，不消耗 RNG；关键可规划路线优先硬门槛。
- 复合检定必须在 schema 中列明权重且合计 1；不得在内容里写算式字符串。
- 失败路线原则上仍给等价经验：非战斗路线用 `wb_skip=该战斗期望 battleExp/bexp(Lq)`，使两路经验差为 0，至少满足 `design/02` 的 ±10% 要求。

### 2.5 Ink 桥接

Ink 只读查询 `get_flag`、`quest_stage`、`has_item`、`affinity` 等白名单；写操作只输出声明式 intent：

```ink
=== juxian_choice ===
群雄的目光都落在你身上。
* [相助萧峰]
  #ts:flag/set flagId=fl_fixture_juxian_help
* [与群雄同列]
  #ts:flag/set flagId=fl_fixture_juxian_oppose
```

桥接层按 `tech/04` 的 `#ts:<opcode> key=value` 格式把标签解析为候选 intent；自由 JSON、重复参数和未知 opcode 均拒绝。core 复核当前故事、任务、阶段和条件后才提交。已有 `tech/04` 最小 opcode `quest/advance`、`party/giveItem`、`battle/start` 必须兼容；示例使用的 `flag/set` 及本文其他新增 opcode 须先加入同一注册表。Ink 不得直接写 `GameState`，不得把未翻译文本差异变成分支差异。

### 2.6 十四篇剧情草稿迁移契约

`design/story/01`～`14` 的路线图、选择表与 YAML 是正式任务的**策划输入**，不是可直接装载的第二套任务 schema。各篇曾使用 `schemaVersion: 0`、`story_act.v0`、`story-draft-v1`、`quest.provisional.v1` 等不同草稿结构；生产构建只接受本文 `quest.v1`。迁移者须为每章提交显式 manifest，逐项记录“来源标签 → 正式任务 / 阶段 / 出口 / 效果”的映射和原始文档锚点，禁止靠字符串裁剪或数组位置猜测。

| 剧情稿表达 | 迁入 `quest.v1` | 作用域与约束 |
|---|---|---|
| `q_NN_main_c_nn` | 保持为正式共有线任务 ID，补齐 `quest.v1` 阶段、出口与效果 | `c` 表示 common；不得去掉路线码或并入同号正 / 邪任务 |
| `q_NN_main_z_nn` / `q_NN_main_x_nn` | 保持为正式正 / 邪线任务 ID，补齐 `quest.v1` 阶段、出口与效果 | `z/x` 是稳定路线码，不是永久阵营；换线通过 `dc_*` 出口显式连接 |
| `dc_NN_nn` | 保持为稳定选择节点 ID，并映射到唯一父任务、`stageId` 与各选项 `branchKey` | `dc_*` 全局登记、章内编号；不是任务 ID，也不得降格为私有 `st_dc_*` |
| 旧简式 `q_NN_main_nn` | 通过 `aliases[]` 显式 remap 到一个带 `c/z/x` 的正式主线任务 | 只作迁移源；禁止字符串猜路线；`q_15_main_<nn>` 终局例外不在此列 |
| 草稿 `nextByChoice` / `fromChoice` / `choices` | `stages[].transitions[]` | 每个选项生成稳定 `edge_*`、`branchKey`、优先级与明确兜底；目标必须可达 |
| 草稿 `route` / `routeTone` | 正式任务的 `routeTone` 与稳定 `branchKey` | 只描述当前路径；换线仍由剧情稿已审校的门槛与代价决定 |
| 草稿 `conditions` / `prerequisites` | `offerWhen`、`showWhen` 或 `transition.when` | 按发生时点显式拆分为单操作符 AST，不能把自由文本当可执行条件 |
| 草稿 `effects` / 选项后果 | 白名单动作与稳定 `fx_*` | 未能映射的叙事后果保留为文案，不得静默写任意状态；持久效果必须可幂等重放 |
| 草稿检定 | §2.4 的 `chk_*` | 固定 `rollId`、成功 / 失败出口与结果持久化；不得在条件中隐式掷骰 |

各章立场量（包括 `stance03`、`bx_stance`、`stance_11`、`stance12` 及连城诀的 `stancePoints/stanceScore`）均是**所属书界 / 任务局部状态**：manifest 必须保留该章经审校的公式、阈值、累加序列及 `priorSwitches`、`routeReady`、`routeIntent`、`routeOverride` 等换线语义，不能用一个通用公式重算，也不能覆盖全局 `morality`。书眠时只可把最终路线与关键选择写入历史摘要，运行中的局部计数清零。

迁移 manifest 的最小字段为 `chapterId`、`sourceRef`、`sourceSchema`、`aliases[]`、`decisionNodes[]`、`stateMappings[]`、`formulaNotes[]` 和 `unmapped[]`；`unmapped` 在发布构建中必须为空。每个 `aliases[]` 项至少给出 `sourceAlias`、`questId`、`stageIds[]`，每个 `decisionNodes[]` 项至少给出 `decisionId`、`questId`、`stageId`、`choiceToBranchKey`。`story/08` 现有 `q_08_main_01`～`q_08_main_18` 是旧简式迁移源，必须逐项映射到带路线码的正式 ID；其 `dc_08_01`～`dc_08_10` 保持稳定选择节点 ID，并补齐父任务、阶段、出口、效果与严格字段。

以下任一情形都阻断构建：草稿 schema 被生产发现器直接装载；别名自动去掉 `c/z/x` 后生成 ID；未知字段或 opcode；悬空阶段 / 出口；局部 `st_/edge_/fx_/chk_` 或立场键跨任务引用；选择缺少失败 / 中立兜底；持久效果缺稳定局部 ID；迁移丢失剧情稿原有公式、换线代价或不可逆警告。迁移只改变数据表达，不改写各篇已审校的剧情结论。

---

## 3. 七个完整任务夹具

> 以下均是 **schema / 测试夹具（原创扩展）**，用于 `tech/04`、`tech/05` 验证结构，不是十四书界正式剧情承诺；人物、物品和门派 ID 均复用现有注册项。

### 3.1 主线分支：聚贤庄立场

```yaml
schemaVersion: quest.v1
fixture: true
id: q_01_main_c_90
kind: main
titleKey: quest.fixture.juxian.title
chapterId: ch01_tianlong
subjectNpcIds: [npc_xiaofeng]
recommendedLevel: 24
routeTone: mixed
offerWhen:
  all:
    - location: { cityId: city_luoyang, eraLayer: ch01 }
    - npc: { id: npc_xiaofeng, state: alive }
stages:
  - id: st_choose
    objectiveKeys: [quest.fixture.juxian.objective.choose_side]
    entry:
      - { op: dialogue/start, storyId: ink_fixture_juxian, knot: choose_side }
    transitions:
      - id: edge_help
        priority: 20
        when: { flag: { id: fl_fixture_juxian_help, is: true } }
        to: st_help
        branchKey: help_xiaofeng
      - id: edge_oppose
        priority: 10
        when: { flag: { id: fl_fixture_juxian_oppose, is: true } }
        to: st_oppose
        branchKey: oppose_xiaofeng
  - id: st_help
    objectiveKeys: [quest.fixture.juxian.objective.help_xiaofeng]
    entry:
      - { op: battle/start, encounterId: enc_01_juxianzhuang, allyControl: ai }
    onEvent:
      "battle/ended":
        successWhen: { compare: { left: { eventField: outcome }, op: eq, right: win } }
        failureMode: branch
        successTo: st_close
        failureTo: st_close
  - id: st_oppose
    objectiveKeys: [quest.fixture.juxian.objective.oppose_xiaofeng]
    entry:
      - { op: battle/start, encounterId: enc_01_juxianzhuang, allyControl: ai }
    onEvent:
      "battle/ended": { successTo: st_close, failureTo: st_close, failureMode: branch }
  - id: st_close
    terminal: completed
    endingKey: anchor_preserved
    effects:
      - { id: fx_close_exp, op: reward/exp, expKind: anchor, levelRef: recommended }
      - { id: fx_close_fame, op: reward/fame, delta: 120, reasonCode: witnessed_anchor }
tracking:
  defaultTracked: true
  targetRef: npc_xiaofeng
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

无论胜负与立场，原著锚点继续；“倒戈帮助萧峰”可选且黑衣人救走萧峰的结果不被任务普通出口抹除（P42）。剧情友军默认 AI，若章节显式授权玩家控制，则计入六人上限（P46）。

### 3.2 门派晋升：武当 L2 考核

```yaml
schemaVersion: quest.v1
fixture: true
id: q_04_faction_90
kind: faction
chapterId: ch04_yitian
titleKey: quest.fixture.wudang_rank2.title
recommendedLevel: 64
ownerSectId: sect_wudang
subjectNpcIds: [npc_zhangsanfeng]
routeTone: righteous
offerWhen:
  all:
    - sect: { id: sect_wudang, status: member, rankAtLeast: 1, contributionAtLeast: 300 }
    - compare: { left: { stat: morality }, op: ge, right: 20 }
    - compare: { left: { stat: fame }, op: ge, right: 100 }
showWhen:
  sect: { id: sect_wudang, status: member }
stages:
  - id: st_exam
    objectiveKeys:
      - quest.fixture.wudang_rank2.objective.spar
      - quest.fixture.wudang_rank2.objective.rules
    objectives:
      - { type: spar, targetRef: npc_zhangsanfeng, nonLethal: true }
      - { type: dialogue, storyId: ink_fixture_wudang_exam, knot: recite_rules }
    transitions:
      - id: edge_pass
        priority: 10
        when:
          all:
            - flag: { id: fl_fixture_wudang_sparred, is: true }
            - flag: { id: fl_fixture_wudang_rules, is: true }
        to: st_promote
        branchKey: passed_both
  - id: st_promote
    terminal: completed
    endingKey: promoted
    effects:
      - { id: fx_rank, op: sect/claimRank, sectId: sect_wudang }
      - { id: fx_exp, op: reward/exp, expKind: faction_rank, levelRef: recommended }
      - { id: fx_fame, op: reward/fame, delta: 20, reasonCode: rank_up_l2 }
      - { id: fx_source, op: learnSource/unlock, sourceRef: src_fixture_wudang_l2 }
tracking:
  defaultTracked: true
  targetRef: npc_zhangsanfeng
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

`sect/claimRank` 只提交晋级意图；core 根据当前 L1、任务收据与其余门槛算出下一职级 L2，调用方不能传 `toRank`。晋级只开放 L2 候选目录，具体武学仍逐门检查图鉴 `reqs`。示例 NPC 是否适合作为实际考官由章节稿决定，夹具不据此新增剧情事实。

### 3.3 D4 招募：同伴责任链

```yaml
schemaVersion: quest.v1
fixture: true
id: q_05_bond_90
kind: bond
chapterId: ch05_xiaoao
titleKey: quest.fixture.linghuchong_responsibility.title
recommendedLevel: 48
subjectNpcIds: [npc_linghuchong]
routeTone: righteous
offerWhen:
  all:
    - npc: { id: npc_linghuchong, state: alive, affinityAtLeast: 20 }
    - compare: { left: { stat: morality }, op: ge, right: 10 }
stages:
  - id: st_responsibility
    objectiveKeys:
      - quest.fixture.linghuchong_responsibility.objective.promises
      - quest.fixture.linghuchong_responsibility.objective.responsibility
    objectives:
      - { type: keepPromise, counterId: cnt_fixture_promises, target: 2 }
      - { type: confirmFlag, flagId: fl_fixture_d4_responsibility_done, is: true }
    transitions:
      - id: edge_ready
        priority: 10
        when:
          all:
            - npc: { id: npc_linghuchong, state: alive, affinityAtLeast: 40, bondAtLeast: 20 }
            - flag: { id: fl_fixture_d4_responsibility_done, is: true }
        to: st_invite
        branchKey: responsibility_proven
  - id: st_invite
    terminal: completed
    endingKey: recruited
    effects:
      - { id: fx_recruit, op: companion/recruit, npcId: npc_linghuchong, difficulty: D4, station: reserve }
      - { id: fx_bond, op: npc/bond, npcId: npc_linghuchong, delta: 10, reasonCode: fulfilled_responsibility }
      - { id: fx_exp, op: reward/exp, expKind: bond_stage, levelRef: recommended }
tracking:
  defaultTracked: true
  targetRef: npc_linghuchong
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

任务动作进入 `design/18` R0–R6 招募状态机；若同伴容量、时代出现或人物状态不合法，事务拒绝，不会仅因任务完成强塞入队。

### 3.4 跨书重逢：赵半山

```yaml
schemaVersion: quest.v1
fixture: true
id: q_13_bond_91
kind: bond
chapterId: ch13_feihu
titleKey: quest.fixture.zhaobanshan_reunion.title
recommendedLevel: 52
subjectNpcIds: [npc_zhaobanshan]
routeTone: righteous
offerWhen:
  all:
    - companion: { id: npc_zhaobanshan, everRecruited: true }
    - npc: { id: npc_zhaobanshan, state: alive }
    - flag: { id: fl_fixture_zhaobanshan_rejoined_ch13, is: false }
stages:
  - id: st_recognize
    objectiveKeys: [quest.fixture.zhaobanshan_reunion.objective.recognize]
    entry:
      - { op: dialogue/start, storyId: ink_fixture_zhaobanshan_reunion, knot: old_friend }
    transitions:
      - id: edge_confirm
        priority: 10
        when: { flag: { id: fl_fixture_zhaobanshan_reunion_confirmed, is: true } }
        to: st_rejoin
        branchKey: identity_confirmed
  - id: st_rejoin
    terminal: completed
    endingKey: rejoined
    effects:
      - { id: fx_rejoin, op: companion/rejoin, npcId: npc_zhaobanshan, fromChapterId: ch12_shujian, station: reserve }
      - { id: fx_mark_rejoined, op: flag/set, flagId: fl_fixture_zhaobanshan_rejoined_ch13 }
      - { id: fx_exp, op: reward/exp, expKind: bond_stage, levelRef: recommended }
tracking:
  defaultTracked: true
  targetRef: npc_zhaobanshan
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

`companion/rejoin` 必须执行 `design/18` U0–U5：检查生命线 / 改命事实、载入能力快照、合并当代成长、发布 `companionRejoined`，任一步失败整体回滚。`offerWhen` 查询 `everRecruited` 与持久旗标，不把可能被裁剪、归档或重复投递的历史事件流当作状态数据库。书眠清空活动编组不等于抹除关系。

### 3.5 城市营生：走镖 / 护院

```yaml
schemaVersion: quest.v1
fixture: true
id: q_08_side_90
kind: side
chapterId: ch08_luding
titleKey: quest.fixture.escort_guard.title
recommendedLevel: 38
routeTone: mixed
tags: [livelihood, escort, guard]
offerWhen:
  estate: { kind: job_active, jobRef: job_xingjiao, businessRef: biz_fixture_08_escort_01 }
stages:
  - id: st_execute
    objectiveKeys: [quest.fixture.escort_guard.objective.complete_contract]
    deadline: { mode: fromAccept, gameHours: 24 }
    objectives:
      - { type: livelihoodOutcome, contractRef: contract_fixture_08_90, result: success }
    onDeadline: { mode: soft, to: st_partial }
    transitions:
      - id: edge_success
        priority: 10
        when: { estate: { kind: job_duty_ratio_at_least, contractId: contract_fixture_08_90, ratio: 1 } }
        to: st_success
  - id: st_success
    terminal: completed
    endingKey: contract_completed
    effects:
      - { id: fx_income, op: estate/settle_job_contract, contractId: contract_fixture_08_90 }
      - { id: fx_exp, op: reward/exp, expKind: side_small, levelRef: recommended }
  - id: st_partial
    terminal: completed
    endingKey: contract_partially_completed
    effects:
      - { id: fx_partial, op: estate/settle_job_contract, contractId: contract_fixture_08_90 }
tracking:
  defaultTracked: true
  targetRef: biz_fixture_08_escort_01
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

测试前置先由 `design/16` fixture 建立 `biz_fixture_08_escort_01`、已占用正确日程块的活动合同 `contract_fixture_08_90`；任务不把测试日硬编码成 `worldDay=1`，只承载合同目标并调用正式 `EstateCondition/EstateAction`。结算动作本身生成收入账簿，因此不再追加一次 `reward/money`。标题中的走镖与临时护院都映射 `job_xingjiao`；镖局职位、山庄护院轮值、风险、收益和月结只读 `design/16` §8.2、§8.6。

### 3.6 资源点争夺与家丁事件

```yaml
schemaVersion: quest.v1
fixture: true
id: q_07_faction_91
kind: faction
chapterId: ch07_bixue
titleKey: quest.fixture.resource_defense.title
recommendedLevel: 50
routeTone: mixed
tags: [resource, household]
offerWhen:
  all:
    - estate: { kind: resource_point_state, pointRef: rp_fixture_mine_07, ownership: disputed }
    - estate: { kind: servant_available, servantRef: sv_fixture_guard_07, minLoyalty: 40 }
stages:
  - id: st_choose
    objectiveKeys: [quest.fixture.resource_defense.objective.choose_response]
    transitions:
      - { id: edge_defend, priority: 20, when: { flag: { id: fl_fixture_defend_node, is: true } }, to: st_defend, branchKey: defend }
      - { id: edge_evacuate, priority: 10, when: { flag: { id: fl_fixture_evacuate_staff, is: true } }, to: st_evacuate, branchKey: evacuate }
  - id: st_defend
    objectiveKeys: [quest.fixture.resource_defense.objective.defend]
    entry:
      - { op: battle/start, encounterId: enc_fixture_mine_defense_07, allyControl: ai } # 测试样例注册表对象
    onEvent:
      "battle/ended":
        successWhen: { compare: { left: { eventField: outcome }, op: eq, right: win } }
        successTo: st_secure
        failureTo: st_evacuate
        failureMode: branch
  - id: st_secure
    terminal: completed
    endingKey: resource_secured
    effects:
      - { id: fx_secure, op: estate/set_resource_point_ownership, pointRef: rp_fixture_mine_07, state: owned }
      - { id: fx_exp, op: reward/exp, expKind: side_stage, levelRef: recommended }
  - id: st_evacuate
    objectiveKeys: [quest.fixture.resource_defense.objective.evacuate]
    entry:
      - { op: battle/start, encounterId: enc_fixture_servant_escape_07, allyControl: ai } # 测试样例注册表对象
    onEvent:
      "battle/ended": { successTo: st_evacuated, failureTo: st_lost, failureMode: branch }
  - id: st_evacuated
    terminal: completed
    endingKey: servants_evacuated
    effects:
      - { id: fx_exp, op: reward/exp, expKind: side_stage, levelRef: recommended }
  - id: st_lost
    terminal: failed
    endingKey: resource_and_servants_lost
tracking:
  defaultTracked: true
  targetRef: rp_fixture_mine_07
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

`rp_fixture_mine_07` 与 `sv_fixture_guard_07` 都由 `design/16` 的测试注册表提供，不登记为正式内容对象。争夺和撤离过程使用任务 / 战斗原语；只有胜利后的持久经营权通过正式 `estate/set_resource_point_ownership` 写入。资源品级、产量、家丁伤病与库存结算均由 `design/16` 负责，任务不能用一个自造 `household/evacuate` 动作跳过其状态机。

### 3.7 限时奇遇：夜间棋局

```yaml
schemaVersion: quest.v1
fixture: true
id: q_06_qiyu_90
kind: qiyu
chapterId: ch06_xiake
titleKey: quest.fixture.night_chess.title
recommendedLevel: 52
routeTone: mixed
offerWhen:
  all:
    - location: { regionId: rg_jiangnan_taihu, eraLayer: ch06 }
    - time: { period: night }
    - compare: { left: { art: chess }, op: ge, right: 40 }
stages:
  - id: st_board
    objectiveKeys: [quest.fixture.night_chess.objective.solve_board]
    deadline: { mode: stageLocal, gameHours: 4 }
    checks:
      - id: chk_q_06_qiyu_90_board
        mode: probability
        value: { art: chess }
        dc: 55
        onSuccess: st_insight
        onFailure: st_departed
    onDeadline: { mode: hard, endingKey: missed_night_window }
  - id: st_insight
    terminal: completed
    endingKey: insight_gained
    effects:
      - { id: fx_exp, op: reward/exp, expKind: qiyu, levelRef: recommended }
      - { id: fx_lore, op: reward/exp, expKind: lore_event, levelRef: recommended }
  - id: st_departed
    terminal: failed
    endingKey: opponent_departed
tracking:
  defaultTracked: false
  targetRef: rg_jiangnan_taihu
  revealPolicy: known_only
source: { origin: expanded, note: schema fixture; not production story }
```

这是一项原创结构示例，不声称对应原著棋局。随机结果首次生成后固化；重新读档不得重掷。

---

## 4. 奖励预算、任务日志与追踪

### 4.1 经验奖励：唯一公式

任务不保存任意经验常数，只保存 `expKind`、`levelRef` 和可选的合法倍率。结算调用 `design/13` §2.4.2：

```text
expVal(L) = 10 + 5L
bexp(L) = 3.5 × expVal(L)
questExp = wb × bexp(Lq) × expScale(ch)
```

`Lq` 取任务推荐等级并钳制到书界上限；`expScale(ch)` 由章节经验预算校准，合法范围 0.85–1.20。core 使用 `EXP_SCALE=100` 的整数定点，只在所有系数合并后做一次 `roundHalfUp`。

| `expKind` | `wb` | 投放点 | 防重复规则 |
|---|---:|---|---|
| `main_act` | 4.0 | 主线幕终章 | 每幕一次 |
| `main_step` | 0.5 | 有实质玩法的主线步骤 | 同阶段一次 |
| `anchor` | 3.0 | 亲历锚点事件 | 每锚点一次 |
| `fate` | 10.0 | 改命成功 | 每书界至多一次 |
| `side_small` | 1.5 | 单段支线 | 每任务一次 |
| `side_stage` / `side_chain` | 1.0 / 4.0 | 三段链阶段 / 终章 | 阶段与终章分开发 |
| `faction_rank` | 3.0 | L2–L5 晋升 | 每门派每级一次 |
| `bond_stage` | 1.0 | 人物关系关键阶段 | 同一关系节点一次 |
| `qiyu` | 2.0 | 奇遇收束 | 每奇遇一次 |
| `puzzle` | 4.0 | 书界级谜题 | 低武书界为 5.0 |
| `dungeon_clear` / `discover` | 3.0 / 0.3 | 秘境首通 / 区域首达 | 首次标记 |
| `boss_story` | 2.0 | 具名 Boss 首胜剧情奖励 | 与战斗经验分开 |
| `lore_event` | 0.5 | 研读、琴棋书画事件 | 内容节点一次 |

核算例：`Lq=20`、`expScale=1` 的三段支线链，`expVal=10+5×20=110`，`bexp=3.5×110=385`；两次阶段和终章总经验为 `(1+1+4)×385=2,310`。若一条路线含期望战斗经验 770，另一条免战，则免战路线追加 `wb_skip=770/385=2.0`，两路经验精确等价。

### 4.2 金钱奖励预算

先由 `design/10` §13 得每小时净收入锚点：

```text
I(ch) = 2 × P(mainWeapon, g_mode(ch)) × chapterIncomeMul(ch)
directCashBudget = I(ch) × expectedHours × cashShare(kind)
```

`P` 使用 §9.2 同一价格表，`g_mode` 使用 `design/10` §4.4 的普通池众数。`cashShare` 是**任务桶内部**直接发钱占该任务段预算的比例，不是全书界现金份额。任务发放的现金、可售任务物和指定奖励合计计入 `design/16` §12.1 的“任务 40%”桶；普通战斗掉落、敌人现银以及已由营生 / 资源点 / 门派结算的报酬分别进入自身桶。

| 类型 | `cashShare` | 说明 |
|---|---:|---|
| `main` | 0.45 | 另有固定剧情物、战斗掉落；避免主线堆满银两 |
| `side` | 0.70 | 普通委托和营生是主要现金入口 |
| `faction` | 0.35 | 另有贡献、目录许可与 `design/16` 配给 |
| `bond` | 0.15 | 价值主要在关系、招募与合击许可 |
| `qiyu` | 0.20 | 价值主要在独特见闻 / 来源；并非必然给钱 |

全书界总收入必须回到 `design/16` §12.1 的正式七桶：任务 40%、战利品出售 25%、敌人现银 10%、城市营生 10%、资源点 8%、门派 5%、赌场 / 其他 2%；相邻来源可调 ±5 个百分点，但总和必须 100%。例：笑傲 `g_mode=5`，主武器 `P=47 两`，故 `I=2×47×1=94 两/时`；若预计 30 分钟的普通支线将整段价值计入任务桶，直接现金上限为 `94×0.5×0.70=32.9`，配表取 33 两。若同段另发可售任务物，其参考值须从这 47 两任务段预算及对应 `cashShare` 中扣除；普通战斗掉落记战利品桶，不可再算作任务奖励。

### 4.3 物品与武学奖励按品阶

| 内容规模 | 常规物品上限 | 稀有固定物 | 武学 / 来源 | 额外校验 |
|---|---|---|---|---|
| 一个目标 / 小事件 | 区域主流品阶 `g` 的材料或消耗品 | 无 | 黄阶基础来源 | 价值计入现金预算 |
| 单段支线 | `g` 成品或 `g+1` 材料 | 至多一件 `g+1` | 黄上 / 玄下来源 | 不超商店供货上限 |
| 三段支线 / 门派 L2–L3 | `g+1`；固定配方 | 一件 `g+1` 名器候选 | 玄阶；地下仅候选目录 | 同书界获取预算校验 |
| 门派 L4 / 重要羁绊 | 地阶候选、专属信物 | 一件固定名器或丹方 | 地阶来源；需师父 / 任务 / `reqs` | 不能因职级自动学会 |
| 主线幕 / 锚点 / 改命 | 按章节固定表 | 神兵、天材只走其唯一节点 | 天级只开放图鉴已登记的唯一来源 | 基准 §13 闭集与单周目预算 |

品阶相加只作候选上限，最终还受书界普通池、固定产出上限和 `design/10` §13.4 供货上限约束。神兵、任务物品、信物、天材不可折成钱；名器只能按 §9.5 典当。任务给秘籍时发 `it_miji_*` / `it_canye_*` 或来源许可，不用 `skill/grant` 越过学习校验。

### 4.4 任务日志

日志按“当前书界 / 余韵 / 已结 / 失之交臂”四页展示。每条包括：标题、类型色、当前目标、所在区域、关联人物 / 门派、期限、最近一条因果记录、可见奖励类别。隐藏条件永不显示精确数值；已满足的公开条件可显示勾选。失败条目保留失败原因和补救入口，不从历史中消失。

| 功能 | 规则 |
|---|---|
| 主追踪 | 同时 1 条；HUD 只显示当前一步和距离 / 时辰 |
| 地图钉选 | 最多 3 条辅助钉选**【建议值】**；只画已知地点 |
| 自动切换 | 当前目标完成时切到同任务下一目标；不自动改到另一任务 |
| 多解提示 | 显示“尚有其他办法”，不暴露未发现路线或检定 DC |
| 期限 | 明示剩余游戏时辰 / 日；最后 20% 时间变色，不用现实推送 |
| 不可达 | 说明是时代层、门派门禁、NPC 日程还是路线关闭；能导航到替代线索时给入口 |
| 完成记录 | 记 `branchKey`、关键选择和奖励摘要，供后日谈与重逢读取 |

地图追踪只提交 `targetRef` 给 `design/11`：城市目标指向 `city_*`，区域目标指向 `rg_*`，无城市的小说地点用 `placeKey`；任务系统不复制坐标。隐世门派 `H` 在未发现前只显示传闻范围，不能因追踪直接揭露入口。

---

## 5. NPC、对话与同伴的任务接口

### 5.1 AR-09 后的职责划分

NPC 与同伴的身份、appearance、生卒、好感、羁绊、招募难度、离队、生死、能力快照和跨书重逢见 `design/18`；区域时代层中的地点日程与时间门禁见 `design/11` §6.3。本文不再维护第二份名录、刻度或日程表，只约束任务系统如何消费这些事实。

| 需要 | 查询 | 动作 / 事件 |
|---|---|---|
| 找到当代 NPC | `design/18` 的 `appearance(npcId, chapterId, year)`，再由 `design/11` 的日程解析器查询当前地点 | `dialogue/start`；不改人物或地点日程定义 |
| 关系门槛 | `affinity` −100..100、`bond` 0..100、信任 / 芥蒂旗标 | `npc/affinity`、`npc/bond`，写原因码 |
| 招募 | D1–D5、R0–R6 当前节点、生命与责任状态 | `companion/recruit` → `companionRecruited` |
| 编组 | `station=active/reserve/location`、冲突与容量 | `companion/station` → `companionStationChanged` |
| 离队 / 背叛 | 状态机原因、可恢复性 | `companion/depart` / `companion/betray` → 对应稳定事件 |
| 生死 / 改命 | `lifeState`、命定节点、改命资格 | `companion/confirmDeath` / `companion/fateRescue` |
| 跨书重逢 | `everRecruited`、生存结果、重逢任务映射 | `companion/rejoin` → `companionRejoined` |

### 5.2 时代图层与日程接入

任务查询 NPC 时必须带 `chapterId + year + eraLayer`：先由 `design/18` 选择当代 `appearance` 并确认时空可用性，再由 `design/11` §6.3 在对应区域时代层解析 `ScheduleBlock`。任务目标可指定 `npcId`，但不得把某一时辰坐标硬写成唯一方案。

| 情况 | 任务行为 |
|---|---|
| NPC 在常规日程 | 追踪显示当前已知活动地点和下一次开放时段 |
| NPC 因剧情换位 | 由 `design/11` 的日程解析器按 `quest override > emergency > personal > fallback` 合并；日志刷新，不重开任务 |
| NPC 离队 / 留守 | 可导航到留守点，或走信使 / 代理交付 |
| NPC 暂不可见 | 任务 `suspended`，至少提供等待或替代线索 |
| NPC 死亡且不可改命 | 进入声明的继承 / 失败出口，不生成替身同名 NPC |
| 跨时代只有资料引用 | `presenceMode=reference` 不可被任务当活人交互 |

门派 NPC 的 `sectId`、当代职级与称谓来自 `design/17` / `catalog/npcs-sects.md`；任务只引用 `npcId` 和当代 `rank`，不得由旧时代同一 `sectId` 推断掌门仍是同一人。

### 5.3 好感、羁绊与事件

关系刻度沿用 `design/18`：`affinity∈[-100,100]`；`bond∈[0,100]`，羁绊等级为 0–19→0、20–39→1、40–59→2、60–79→3、80–89→4、90–100→5。本文的任务奖励只给离散、可解释的增量：

| 事件 | 好感 | 羁绊 | 约束 |
|---|---:|---:|---|
| 礼貌回应 / 小帮助 | +1～+3 | 0 | 同一可重复节点每日只计首次 |
| 完成 R2 试事 | +5～+10 | +5 | 不能以送礼替代 |
| R3 价值取舍一致 | +5～+15 | +10 | 相反选择可为负；写 `reasonCode` |
| R4 共患 / 改命协力 | +10～+20 | +10～+20 | 每个危机一次 |
| 背信、伤害亲友 | −10～−40 | −10～−30 | 可触发最后通牒或背叛 |
| 日常赠礼 | +1～+5 | 0 | 每 NPC 每游戏日好感收益 ≤5**【建议值】** |

增量必须钳制并记录来源；章节可在范围内选值。任何用同一对话循环刷关系的节点在首次后只播放文本，不再结算。羁绊事件只负责打开 `design/09` 合击候选：通常 `bond≥40` 进入候选，通用战斗示例最低要求羁绊等级 3，即 `bond≥60`；具体合击仍检查双方武学、站位、CT 和组合定义。

作者决定 P24 的“当书界羁绊 ≥3 的同伴离队或倒下”按统一刻度解释为 `bond≥60`。任务接到已确认的 `companionDeparted` 或战斗倒下事件后，设置预登记旗标 `anran_bieli`；仅换留守位置、未入队人物离开或伪造事件不得触发。该旗标只是黯然销魂掌来源条件之一，仍由 `skills-daojia` 与 `design/05` 复核其他学习条件。

### 5.4 招募、编组、成长与装备接口

- D1–D3 可缩短 R0–R6，D4 / D5 不得跳过 R3 取舍和 R4 共患；完整规则见 `design/18` §2。
- 活动战斗编组为主角 1 + 同伴 0–5，总计 ≤6；剧情可控友军占名额，默认 AI 剧情友军不占（P46，见 `design/09` §2.10）。招募时编组满仍可去留守点。
- 同伴等级、武学画像、时代合并与装备许可由 `design/18`；装备物本体由 `design/10`。任务动作不能覆盖 NPC 固有武学，也不能把装备绑定成不可卸，除非物品本体声明剧情锁。
- 任务可以发 `trainingOpportunity`、`equipmentGift`、`comboEligibility`，但分别交 `design/05`、`design/10`、`design/09` 结算。
- 离队必须带 `reason` 和 `recoverable`；可恢复离队给重试时机 / 去向，不可恢复离队必须是已预告的剧情或玩家选择。背叛按 `design/18` 的阈值与最后通牒执行。

### 5.5 书眠与重逢

书眠仍清空 `activeCompanions`，但 AR-09 已明确覆盖旧“队友不跨书界”的绝对说法：曾招募、好感、羁绊、信任、芥蒂、生死 / 改命事实和能力快照保留。健在且有当代 appearance 的人物可经 U0–U5 重逢链重新加入；无生命交集者只留回响 / 书影，不伪造长生。长生诀及其他长生例外也由 `design/18` 的生命轴与人物状态判定。

书眠前 UI 仍展示“活动编组留在此界”，但不得文案成“永不再见”。任务实例按书界归档；跨书只携带稳定事件与允许的关系事实，不携带旧任务的临时计数器。

### 5.6 NPC 武学配置

任务遭遇只引用 `npcId + appearanceId + combatProfileRef`。core 依次从 `design/18` 取得当代画像、从图鉴解析 `sk_*`、按书界显示等级 / 天道压制算有效层数，再由 `design/09` 装配战斗 AI。任务 YAML 可以选已登记画像变体（如切磋、重伤、伪装），不可内嵌一套新的武学数值。

师父指点分两路：武学修炼调用 `design/05` §8.4；冲穴加速发 `meridian/grantMasterGuidance`，其 payload 使用 `design/15` §5.6 的 `MeridianGuidance`（默认 `rateBp=1500`、`successBp=800`、`costReduceBp=500`；该默认值在上游仍标 **【建议值】**）。门派打坐地点发 `meditationQuality=0/1/2`：普通 0/0、清静处速率 / 成功 `+500/+300bp`、名门静室 `+1000/+600bp`（上游仍标 **【建议值】**）。本文只判师父资格、关系、指导额度与地点开放；加算、封顶、穴道和周天仍由 `design/15` 结算。

### 5.7 Ink 与可选 AI 对话边界

主线、任务选择和具有玩法后果的对白必须预写 Ink；每个 NPC 至少有普通、网络失败、内容拒绝三类回退台词**【建议值】**。可选 AI 对话默认关闭，只能作标有“即兴闲谈”的旁路：

| 边界 | 规则 |
|---|---|
| 唯一工具 | `propose_effects`，每次最多 3 项 |
| 好感建议 | `affinity_delta` 每项 −1..+1；每段累计绝对值 ≤3**【建议值】** |
| 旗标建议 | 仅 `set_allowed_flag`，且旗标已由当前节点预登记 |
| core 复核 | NPC / 节点、理由码、白名单、封顶、`proposalId` 幂等全部重验 |
| 永远禁止 | 物品、金钱、经验、武学、贡献、羁绊、招募、生死、任务推进或战斗结果 |
| 失败回退 | 丢弃 proposal，保留或替换文本；不得阻断主线 |

好感由 AI 建议后仍写成普通确定性命令；回放只记录接受后的命令，不记录模型推理。地区、模型、成本、隐私和 SSE 契约见 `tech/08` §9。

`NpcAiCard` 的技术字段形状也只读 `tech/08` §9.5；其 `npcId`、语气 / 价值观摘要、分幕目标与已知事实必须从 `design/18` 的人物定义和对应 `design/story/*` 投影生成，禁区、敏感主题回退与节点效果白名单由内容作者显式审核。本文只冻结上述任务侧效果封顶和三类回退要求，不维护第二份人物人设卡。

---

## 6. 门派规则

### 6.1 身份状态机

```text
outsider ──结识──► associate / ally / guest
    └──入门任务──► member(L1) ──晋升──► L2 ─► L3 ─► L4 ─► L5
                         │                         │      │
                         ├──自请离门──► resigned ─┘      │
                         ├──叛出──────► defected          │
                         └──逐出──────► expelled ◄────────┘
```

`associate`（关联）、`ally`（盟友）、`guest`（客卿）都不是正式弟子，不取得完整武学目录和月钱。朝廷、军队、部族、临时集团也复用这套关系接口，但其 L5 可以是“总教头 / 首领权限”而非皇位；本文的 `SectProgressionPolicy.rank5Policy.playableMode` 依据 `design/17` 的称谓与政治边界取 `playable / storyConfigured / nonPlayable`，不可取得的政治首领位必须为 `nonPlayable`。

### 6.2 加入条件

每个正式加入节点至少检查：

1. `design/17` 当代状态为 `O`，或 `H` 已被任务揭露；`P/N/D/M` 不能以当前组织名常规加入。
2. 已完成入门任务并由一个合法 `npcId` / 组织议事节点授予。
3. 品德、声望、性别 / 出家 / 血缘等门槛来自条目策略，不从“正派 / 邪派”标签自动推断所有细节。
4. 与现有正式身份逐对检查 `sectRelation`；冲突时允许先离门、转客卿或走特殊调停，不能静默覆盖。
5. 通过武学 `reqs` 只代表可学，不反向代表已经入门。

正派常规入口要求 `morality≥10`，邪派任务可从 `morality≤−10` 接触、正式入门通常要求 `morality≤−40`，中立 / 多线组织不设通用值；具体条目可收紧或显式例外。`morality≥80` 的“大侠”只免正派基础品行试问，不免剧情、身份、武学或师承条件；`fame≥100` 才开放常规入门考验。隐世收徒和落难投门可显式覆写声望门槛。

已采用的例外：女性主角可走灵鹫宫正式入宫线，男性走虚竹客卿线（P30）；少林剃度提供修炼效率 +10%、关闭情缘线，可经还俗任务恢复（P32）；性别分支必须同时适配作者已定男女主角可选（P05）。

### 6.3 贡献

贡献 `sectContribution[sectId]` 为本书界、该组织的整数账本，范围 0–9,999；书眠随身份清零。正贡献不自动晋级，负向事件先扣贡献，再按门规计违纪。

| 行为 | 贡献 | 说明 |
|---|---:|---|
| 日常差事 / 轮值 | +20～40 | 同模板每日前 2 次有效 |
| 门派小任务 | +60～120 | 约 10–20 分钟 |
| 三段任务阶段 | +150 | 每阶段一次 |
| 护门 / 救援 / 重要外交 | +300～600 | 按风险与结果 |
| 教授低阶弟子 / 捐献所需物资 | +40～100 | 每周封顶 200，防刷钱换贡献 |
| 违背轻戒 | −100 | 同时记 1 级违纪 |
| 私传 / 伤害同门 | −500～−1,500 | 3–4 级违纪 |
| 背叛核心目标 | 清零 | 进入叛出 / 逐出状态 |

贡献没有跨组织兑换，也不能买卖。任务失败只按已声明的事实扣除；不能因玩家拒接任务被动扣贡献。

### 6.4 统一五级晋升表

下表是所有 `design/17` 称谓模板背后的机械层。门派可提高门槛或把 L5 锁为不可玩，但不能降低武学 `reqs`。`主修达标` 指本派图鉴中该级以下已合法习得武学，不包括偷看、临时 NPC 技能或外来同名技。

| 级 | 抽象称谓 | 最低贡献 | 主修达标 | 任务 | 声望 / 年资 | 可接触武学 | 职责 | 月钱 / 资源 |
|---|---|---:|---|---|---|---|---|---|
| L1 | 外门弟子 | 0 | 入门基本功通过考核 | 入门链 | `fame≥100` 或条目豁免；0 日 | 黄阶基础 | 杂役、巡山、随队 | `stipendTier=1` / `resourceTier=1` |
| L2 | 入门（内门）弟子 | 300 | 1 门黄上达到 5 重，或本派最高黄阶 | 小考 / 守规任务 | `fame≥100`；3 个游戏日 | 黄阶全开、玄下候选 | 轮值、护送、基层教习 | 2 / 2 |
| L3 | 亲传 / 闭门弟子 | 900 | 1 门玄下达到 6 重；低武小派可用目录最高项 | 师承取舍 + 专属试炼 | `fame≥300`；10 日 | 玄阶全开、地下候选 | 领小队、代师办事 | 3 / 3 |
| L4 | 长老级 | 2,400 | 1 门玄上达到 8 重或地下达到 6 重 | 门派危机 / 授徒考核 | `fame≥800`；30 日 | 地阶、分支秘传、镇派候选 | 授徒、堂务、门规裁断 | 4 / 4 |
| L5 | 掌门级 | 6,000 | 1 门地阶达到 8 重；若本派无地阶则目录最高项满合法层 | 继承信物 + 组织认可 + 掌门链 | `fame≥1,600`；90 日 | 最高目录访问权 | 治派、外交、继承与资源决策 | 5 / 5 |

贡献按任务结算后再检查门槛，不能同一效果先晋级再用新级领取重复奖励。“目录访问”不是赠送武学：师父可用性、来源、属性 / 资质 / 技艺、品德、前置武学和层数上限仍按 `design/05`。L5 天级同样只开放任务线；天阶默认不能观摩偷学（P09）。

月钱与资源在本文只存相对 `Tier=1..5`。绝对结算已由 `design/16` §10 定稿：现金 / 资源小时当量依次为 `0.03/0.02`、`0.06/0.04`、`0.10/0.07`、`0.16/0.10`、`0.22/0.15` 倍 `I(ch)`，再乘职责完成率；每月职责块默认 2/3/4/5/6 **【建议值】**。配给品阶、发放周期、库存和断供也只读 16；兼任同派堂职不叠领，非 `primarySectId` 的正式身份不领。

### 6.5 十三种称谓模板的晋升侧重

| 模板 | L1→L5 称谓来源 | 晋升额外侧重 | L5 可达性 |
|---|---|---|---|
| T01 禅宗寺院 | 俗家 / 沙弥→入室僧→亲传→首座 / 长老→方丈 | 戒律、佛学、院堂护持；剃度与俗家双轨 | 方丈常需众议 / 传法，条目可锁 |
| T02 道门宫观 | 道童→入门道士→亲传→监院 / 长老→掌教 | 静功、法脉、宫观事务 | 掌教需法统 |
| T03 世俗剑派 / 武馆 | 外门→内门→亲传→长老 / 教习→掌门 | 比试、专精、授徒 | 通常可走继承 / 众议 |
| T04 世家 / 山庄 | 门客→子弟→亲传 / 近卫→家老→家主 | 忠诚、家业、血缘 / 收养替代线 | 血缘锁须有推举或客卿终点 |
| T05A 丐帮 | 一二袋→三四袋→五六袋→七至九袋长老→帮主 | 济困、消息网、分舵、打狗棒传承 | 帮议 + 信物 |
| T05B 香堂 / 帮会 / 镖局 | 会众 / 趟子手→骨干 / 镖师→香主 / 镖头→堂主 / 总镖头→总舵主 / 总号主 | 保密、护运、经营、跨城协调 | 组织推举 |
| T06 教派 | 教众→旗弟子→堂主→法王 / 使者→教主 | 护教、教务、圣物、派系平衡 | 剧情继承 |
| T07 异域 / 海外 | 外客→门徒 / 部众→亲随→护法 / 岛使→首领 | 礼俗、语言、远行、外交 | 部族 / 岛议认可 |
| T08 朝廷 / 军中 | 军士 / 学员→队正 / 侍卫→都头 / 亲随→将军 / 供奉→总教头级 | 军功、轮值、护驾、身份审查 | 不等于帝位；政治首领通常锁 |
| T09 古龙宫谷 | 宫侍 / 谷客→门人→亲传→护法 / 宫使→宫主 | 禁地、守密、生存试炼 | 跨作品投放均为原创扩展 |
| T10 古龙楼会 | 眼线→执事→舵主→龙头 / 总护法→大龙头 | 情报、匿名网、节点审计 | 身份揭示须独立任务 |
| T11 古龙山庄世家 | 门客→家臣→少主 / 亲传→家老→庄主 | 家业、决斗、名器保管 | 宗族 / 推举 |
| T12 古龙武门堂口 | 外门→入室→嫡传→护法 / 长老→门主 | 兵器专精、生死试炼、守门 | 信物 / 门议 |

精确称谓、组织归类和例外只读 `design/17` §1 及各条目；这里不维护第二张称谓表。

### 6.6 门规与违规后果

每派定义 `rules[]`，每条含 `ruleId`、适用身份、严重度 1–5、证据事件、宽免条件和后果。不能用 NPC 一时敌对自动判定其为邪派目标。

| 严重度 | 典型行为 | 默认后果 |
|---:|---|---|
| 1 | 缺勤、失礼、轻微私斗 | 警告，贡献 −100；重复 3 次升 2 级 |
| 2 | 擅入禁地、公开违令 | 停月钱 1 期、贡献 −300、门派任务暂停 |
| 3 | 私传玄阶以上、重伤同门 | 降 1 级、贡献 −800、开启问责任务 |
| 4 | 盗取镇派物、投敌造成伤亡 | 降至 L1 或逐出；敌对声望显著上升 |
| 5 | 主动背叛核心目标、杀害掌门 / 同门 | 逐出或叛出，贡献清零，追捕链 |

特殊决定：虎爪绝户手攻击“非邪派目标”时，每场首次命中使品德 −3，并记武当 2 级违纪；不能靠把 NPC 临时设为敌方规避（P26）。生死符用于非敌对 NPC 的“驭人”每次品德 −10，并写具体受害者事件（P31）。少林慈悲武学对倒地敌人默认“制服”，玩家显式关闭或选择“了断”才走击杀后果（P43、P47）。

处罚必须可解释、可申辩。证据不足只产生调查任务；不可因 AI 闲聊文本自动定罪。赎罪任务可以恢复 `associate` 或 L1，但不会抹去品德、死亡、背叛等全局事实。

### 6.7 传授与师父指点

| 职级 | 权限 | 仍须满足 |
|---|---|---|
| L1 | 黄阶基础目录 | 师父 / 教习在场、武学 `reqs` |
| L2 | 黄阶全开、玄下候选 | 来源任务、属性资质 |
| L3 | 玄阶全开、地下候选 | 亲传关系、专属试炼 |
| L4 | 地阶与分支秘传 | 门派危机、传承信物、品德等 |
| L5 | 最高目录访问权 | 每门武学的唯一来源；天阶不自动取得 |

“师父指点”调用 `design/05`：喂招、修炼倍率和层数上限由武学来源定义。若指点同时改善冲穴，`meridian/grantMasterGuidance` 必填 `teacherNpcId + meridianId + charges + guidance`；`guidance` 默认取 `design/15` §5.6 的 `+1500/+800/+500bp`，每次绑定一条经脉并消耗一次额度。打坐地点以 `meridian/unlockPracticeSite(locationId, meditationQuality)` 接入：清静处为 1，名门静室为 2。相同来源每槽取最高、不同来源加算及总上限全部由 `design/15` 执行，本文不得预写冲穴进度。

门派状态对武学经验只输出一个稳定字段 `sectTrainingMult`，由本文合并，`design/05` §8.1 在最终经验式中恰好乘一次。调用方提供当前人物、书界与该武学已解析的 `skillSectId`；不得靠名称、图鉴章节或 `setTags` 猜门派。合并规则固定为：

```text
eligible = 当前书界、当前正式身份中 active=true 且 skillSectId 过滤命中的效果
deltaBp = Σ eligible 中按 sourceKey 去重后的 deltaBp
sectTrainingMult = (10000 + deltaBp) / 10000
```

同一 `sourceKey` 重放只计一次；互斥状态同时存在、重复键不同值或输出小于 0 均为存档 / 内容错误，不以数组顺序择一。消费者不得再乘每项效果。当前注册表只有 `sect.shaolin.tonsured`：须为未冻结的 `sect_shaolin` 正式成员、处于剃度状态，且 `skillSectId=sect_shaolin` 时 `deltaBp=1000`，故 `sectTrainingMult=1.10`；其他情况均为 1.00。还俗、离门、逐出、叛出、身份冻结或书眠清理该 active 效果，同时恢复情缘资格；再次入门不自动恢复剃度状态。

### 6.8 叛出、逐出与兼并

| 退出方式 | 主动性 | 状态 | 回归 |
|---|---|---|---|
| 自请离门 | 玩家主动、无重大违纪 | `resigned` | 通常可经一条归门任务 |
| 叛出 | 玩家投敌 / 带走机密 | `defected` | 仅特殊赎罪；原敌对方可开放 |
| 逐出 | 门派裁决 | `expelled` | 依罪级；5 级默认不可恢复正式身份 |
| 兼并 / 解散 | 剧情改变组织 | `absorbed/dissolved` | 旧身份冻结或映射到继承组织 |

已习武学不会被删除，但门派提供的修炼、师父、月钱、兑换和秘境权限关闭；借出的任务物按物品规则归还。明教吸收天鹰教等兼并情形只映射一次身份与贡献，不允许双领月钱。星宿“大师兄”等夺位强者线、少林剃度 / 还俗、恒山掌门剧情特例、政治首领不可晋升等均须在组织条目设置例外，而不是改五级骨架。

### 6.9 同时加入多个组织

玩家可同时拥有多个 `associate/ally/guest`，正式 `member` 也可并存，但必须满足以下全部规则：

1. 任意两项正式身份在 `sectRelations` 中均显式 `dualFormal=allow`；字段缺失按拒绝，避免靠未配数据钻空子。
2. 敌对组织不能同时保持正式弟子身份；新投一方前必须离门、接受潜伏任务，或把旧身份降为已声明的秘密 / 冻结状态。
3. 只有一个 `primarySectId` 领取月钱、资源并推进常规晋升；切换主派须在非战斗、无门派期限任务时进行，下一次月结才生效。
4. 达到 L5 时，该书界其余正式身份冻结在原等级且不领配给；默认每书界至多担任一个掌门（AR-07a）。
5. 同源兼并、客卿、朝廷官职与营生分别走映射 / 非正式关系 / 职务 / `design/16`，不能以改名重复领取。
6. 跨书界同 ID（华山、少林、武当、丐帮等）仍是新的当代身份；旧身份书眠清零，不能凭同 ID 自动继任。

### 6.10 门派任务链模板

| 链阶段 | 任务类型 | 目标 | 常见结果 |
|---|---|---|---|
| F0 闻名 | `side/qiyu` | 得知门派与当代状态 | `associate`、入口线索 |
| F1 投帖 | `faction` | 引荐、品行 / 立场核验 | L1 或客卿 / 盟友 |
| F2 立足 | `faction` | 三项基层差事，至少一项非战斗 | 贡献、L2 考核 |
| F3 择师 | `faction/bond` | 师父与分支选择 | L3、来源目录 |
| F4 任事 | `faction` | 跨区护门、外交、危机 | L4、授徒 / 堂职 |
| F5 承统 | `faction/main` | 信物、门议、挑战或继承 | L5 或“辅佐掌门”终点 |
| F6 治派 | 循环事件 | 门规裁断、资源、外交 | 门派状态 / 后日谈 |

每条链至少一个非战斗解法、一个拒绝但能继续主线的出口、一个违规 / 赎罪回路。L5 不可玩组织以“辅佐、总教头、护法或盟主”作为等价终点，奖励预算不因此缩水。

### 6.11 掌门玩法概要

掌门不是无限资源开关，而是每月一次“门议”：在有限行动点中选择传艺、救济、巡防、外交、整顿和资源申请。门议产生任务与组织状态，不直接修改全国势力。

| 决策 | 即时收益 | 代价 / 后果 | 下游接口 |
|---|---|---|---|
| 广收门徒 | 新弟子 / 声望 | 资源消耗、门规事件增加 | `design/16` 人口 / 配给 |
| 精研武学 | 指点槽、修炼机会 | 外务减少 | `design/05`、`design/15` |
| 济困 | 品德 / 地方关系 | 银钱与物资 | `design/16` 库存 |
| 强征 / 扩张 | 控制力 | 品德下降、敌对升级 | `design/11` 事件、§8 |
| 结盟 / 休战 | 兼容身份、商路 | 对立派系不满 | `sectRelations` |
| 整肃 | 降低违纪 | 好感与派系裂痕 | `design/18` 人物事件 |

默认每游戏月 2 点门议行动**【建议值】**，未使用不累积；绝对资源成本由 `design/16`。取得天书进入余韵后仍可完成一轮收束门议，书眠时掌门身份归档并清除。

---

## 7. 全书界门派与势力汇总

### 7.1 口径

本节是 `design/17` 与地图数据的机械汇总，不是第二份门派史。组织 ID、分类、时代六态、称谓模板、武学索引和原著 / 史实依据以 `design/17` 为唯一源；主驻地城市来自 `map/sects.yaml`，所在区域来自 `design/11` §2.4。下表恰含 99 个规范 `sect_*`。

- 书界缩写依次为 TL 天龙、SD 射雕、SHD 神雕、YT 倚天、XA 笑傲、XK 侠客、BX 碧血、LD 鹿鼎、LC 连城、BM 白马、YY 鸳鸯、SJ 书剑、FH 飞狐、XS 雪山。表内只展开可发生玩法的 `O` / `H`；`P/N/D/M` 必须从 `design/17` §3 的完整矩阵读取，不能由空白猜测。
- “正邪”是本作任务入口的**叙事倾向**，不是人物本性，也不直接增减品德；“多线”表示存在可辩护的正、邪或派系路线。“不定”用于族群 / 政权，禁止把现实群体整体道德化。
- “正式”指可取得 L1–L5 身份；“条件正式”指须满足剧情、人物、性别、品德或分支条件；“客盟 / 传承 / 任职”不等于拜师。`O` 仍须通过 §6.2，`H` 还须先发现；`P/N/D/M` 不可用当前组织名常规加入。
- “敌对”表示至少有一条敌对任务线，不代表全员必杀。敌对首领是否可招募只读 `design/18`；组织加入不会自动招募人物。
- 图鉴列只给唯一归属或待收录索引，不在本文复述招式。单派跨书有多个图鉴时按当代 `EraProfile` 取交集。

### 7.2 九十九组织总表

| 组织 ID / 名称 | 投放书界（O / H） | 正邪倾向 | 可加入 / 对抗 | 武学所在图鉴 | 主驻地城市 / 区域 | 原著依据 |
|---|---|---|---|---|---|---|
| `sect_shaolin` 少林 | O:TL/SD/SHD/YT/XA/XK/LD/SJ；H:BX/LC/BM/YY/FH/XS | 正 | 条件正式 | `skills-shaolin` | `city_dengfeng` / `rg_zhongyuan` | 金庸多书；`design/17` §5.1 |
| `sect_nanshaolin` 南少林 | O:SJ；H:XA/XK/BX/LD/LC/BM/YY/FH/XS | 正 | 条件正式 | `skills-shaolin` | `city_putian` / `rg_fujian` | 《书剑恩仇录》；`design/17` §5.2 |
| `sect_tianlongsi` 天龙寺 | O:TL；H:SD/SHD/YT/XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 客盟/条件正式 | `skills-wujue` | `city_dali` / `rg_dali_cangshan` | 《天龙八部》；`design/17` §5.3 |
| `sect_quanzhen` 全真教 | O:SD/SHD；H:YT/XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 正式 | `skills-daojia` | `city_xian` / `rg_guanzhong` | 《射雕英雄传》《神雕侠侣》；`design/17` §5.4 |
| `sect_wudang` 武当派 | O:YT/XA/XK/SJ/FH；H:BX/LD/LC/BM/YY/XS | 正 | 正式 | `skills-daojia`；`skills-yitian` 补支 | `city_shiyan` / `rg_jingxiang` | 《倚天屠龙记》等；`design/17` §5.5 |
| `sect_shangqingguan` 上清观 | O:XK；H:— | 中 | 正式 | `skills-xiake-bixue` | `city_luoyang` / `rg_zhongyuan` | 《侠客行》；`design/17` §5.6 |
| `sect_tiejian` 铁剑门 | O:BX/LD；H:LC/BM/YY/SJ/FH/XS | 正 | 正式 | `skills-xiake-bixue` | `city_beijing` / `rg_yanjing_zhili` | 《碧血剑》《鹿鼎记》；`design/17` §5.7 |
| `sect_huashan` 华山派 | O:YT/XA/BX/FH；H:XK/LD/LC/BM/YY/SJ/XS | 多线 | 正式 | `skills-yitian` / `skills-wuyue` / `skills-xiake-bixue` | `city_huayin` / `rg_guanzhong` | 《倚天》《笑傲》《碧血》《飞狐》；`design/17` §6.1 |
| `sect_emei` 峨眉派 | O:YT；H:XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 正式 | `skills-yitian` | `city_leshan` / `rg_bashu` | 《倚天屠龙记》；`design/17` §6.2 |
| `sect_kunlun` 昆仑派 | O:YT；H:XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 正式 | `skills-yitian` | `city_khotan_kunlun` / `rg_xiyu_nanjiang` | 《倚天屠龙记》；`design/17` §6.3 |
| `sect_kongtong` 崆峒派 | O:YT；H:XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 正式 | `skills-yitian` | `city_pingliang` / `rg_hexilongyou` | 《倚天屠龙记》；`design/17` §6.4 |
| `sect_qingcheng` 青城派 | O:TL/XA/FH；H:SD/SHD/YT/XK/BX/LD/LC/BM/YY/SJ/XS | 多线 | 条件正式 | `skills-wuyue` | `city_dujiangyan` / `rg_bashu` | 《天龙》《笑傲》《飞狐》；`design/17` §6.5 |
| `sect_songshan` 嵩山派 | O:XA；H:— | 邪/多线 | 条件正式/敌对 | `skills-wuyue` | `city_dengfeng` / `rg_zhongyuan` | 《笑傲江湖》；`design/17` §6.6 |
| `sect_taishan` 泰山派 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正/多线 | 正式 | `skills-wuyue` | `city_taian` / `rg_qilu` | 《笑傲江湖》；`design/17` §6.6 |
| `sect_hengshan_nan` 衡山派 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正/多线 | 正式 | `skills-wuyue` | `city_hengyang` / `rg_huxiang` | 《笑傲江湖》；`design/17` §6.6 |
| `sect_hengshan_bei` 恒山派 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 条件正式 | `skills-wuyue` | `city_datong` / `rg_hedong_jinzhong` | 《笑傲江湖》；`design/17` §6.6 |
| `sect_xueshan` 雪山派 | O:XK；H:— | 多线 | 正式 | `skills-xiake-bixue` | `city_shigatse` / `rg_qingzang` | 《侠客行》；`design/17` §6.7 |
| `sect_wuliang` 无量剑派 | O:TL；H:— | 中 | 正式 | `skills-xiaoyao` | `city_dali` / `rg_dali_cangshan` | 《天龙八部》；`design/17` §6.7 |
| `sect_xiandu` 仙都派 | O:BX；H:LD/LC/BM/YY/SJ/FH/XS | 正 | 正式 | `skills-xiake-bixue` | `city_wenzhou` / `rg_zhedong` | 《碧血剑》；`design/17` §6.7 |
| `sect_taijimen` 太极门 | O:SJ/FH；H:XS | 正 | 正式 | `skills-qianlong` | `city_beijing` / `rg_yanjing_zhili` | 《书剑》《飞狐》；`design/17` §6.8 |
| `sect_baguamen` 八卦门 | O:SJ/FH/XS；H:— | 多线 | 正式 | `skills-qianlong` | `city_baoding` / `rg_yanjing_zhili` | 《书剑》《飞狐》《雪山飞狐》；`design/17` §6.8 |
| `sect_tianlongmen` 天龙门 | O:FH/XS；H:SJ | 邪/多线 | 条件正式/敌对 | `skills-qianlong` | `city_cangzhou` / `rg_yanjing_zhili` | 《飞狐外传》《雪山飞狐》；`design/17` §6.8 |
| `sect_fuwei` 福威镖局 | O:XA；H:— | 正 | 正式 | `skills-wuyue` | `city_fuzhou` / `rg_fujian` | 《笑傲江湖》；`design/17` §6.8 |
| `sect_penglai` 蓬莱派 | O:TL；H:— | 中 | 正式 | `skills-general` | `city_penglai` / `rg_qilu` | 《天龙八部》；`design/17` §6.8 |
| `sect_jinwupai` 金乌派 | O:XK；H:— | 正 | 正式 | `skills-xiake-bixue` | `city_shigatse` / `rg_qingzang` | 《侠客行》；`design/17` §6.7 |
| `sect_taibai` 太白三英 | O:BX；H:— | 中 | 正式 | `skills-xiake-bixue（待收录索引）` | `city_xian` / `rg_guanzhong` | 《碧血剑》；`design/17` §6.8 |
| `sect_weituomen` 韦陀门 | O:FH；H:SJ/XS | 中 | 正式 | `skills-qianlong` | `city_cangzhou` / `rg_yanjing_zhili` | 《飞狐外传》；`design/17` §6.8 |
| `sect_baxianjian` 八仙剑 | O:FH；H:SJ/XS | 中 | 正式 | `skills-qianlong` | `city_foshan` / `rg_lingnan` | 《飞狐外传》；`design/17` §6.8 |
| `sect_bajiquan` 八极拳 | O:FH；H:SJ/XS | 中 | 正式 | `skills-qianlong` | `city_cangzhou` / `rg_yanjing_zhili` | 《飞狐外传》；`design/17` §6.8 |
| `sect_dali` 大理段氏 | O:TL/SD/SHD；H:— | 正 | 客盟/条件正式 | `skills-wujue` | `city_dali` / `rg_dali_cangshan` | 《天龙》《射雕》《神雕》；`design/17` §7.1 |
| `sect_murong` 姑苏慕容 | O:TL；H:— | 邪/多线 | 条件正式 | `skills-xiaoyao` | `city_suzhou` / `rg_jiangnan_taihu` | 《天龙八部》；`design/17` §7.2 |
| `sect_gumu` 古墓派 | O:SHD；H:YT/XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正/中 | 条件正式 | `skills-daojia` | `city_xian` / `rg_guanzhong` | 《神雕侠侣》；`design/17` §7.3 |
| `sect_taohuadao` 桃花岛 | O:SD/SHD；H:YT/XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 中/正 | 条件正式 | `skills-wujue` | `city_taohuadao` / `rg_donghai_islands` | 《射雕》《神雕》；`design/17` §7.4 |
| `sect_baituoshan` 白驼山 | O:SD/SHD；H:— | 邪 | 条件正式/敌对 | `skills-wujue` | `city_kashgar` / `rg_xiyu_nanjiang` | 《射雕》《神雕》；`design/17` §7.5 |
| `sect_jueqinggu` 绝情谷 | O:SHD；H:— | 邪/多线 | 条件正式/敌对 | `skills-daojia` | `city_xian` / `rg_guanzhong` | 《神雕侠侣》；`design/17` §7.6 |
| `sect_xuansuzhuang` 玄素庄 | O:XK；H:— | 正 | 客盟/条件正式 | `skills-xiake-bixue` | `city_luoyang` / `rg_zhongyuan` | 《侠客行》；`design/17` §7.7 |
| `sect_shiliang` 石梁温家 | O:BX；H:— | 多线 | 客盟/条件正式 | `skills-xiake-bixue` | 衢州府一带；当前邻近挂 `city_jinhua` / `rg_zhedong` **（待考）** | 《碧血剑》；`design/17` §7.8、`design/19` §5.2 |
| `sect_hujia` 辽东胡家 | O:FH/XS；H:YY/SJ | 正 | 客盟/传承 | `skills-qianlong` | `city_shenyang` / `rg_liaodong` | 《飞狐外传》《雪山飞狐》；`design/17` §7.9 |
| `sect_miaojia` 苗家 | O:FH/XS；H:YY/SJ | 正 | 客盟/传承 | `skills-qianlong` | `city_shenyang` / `rg_liaodong` | 《飞狐外传》《雪山飞狐》；`design/17` §7.10 |
| `sect_shangjiabao` 商家堡 | O:FH；H:SJ | 邪/多线 | 条件正式/敌对 | `skills-qianlong` | `city_baoding` / `rg_yanjing_zhili` | 《飞狐外传》；`design/17` §7.11 |
| `sect_jindaozhai` 金刀寨 | O:XK；H:— | 中 | 正式 | `skills-xiake-bixue` | `city_luoyang` / `rg_zhongyuan` | 《侠客行》；`design/17` §7.12 |
| `sect_qinjiazhai` 秦家寨 | O:TL；H:— | 中/敌对 | 条件正式/敌对 | `design/17` 待收录索引 | `city_datong` / `rg_hedong_jinzhong` | 《天龙八部》；`design/17` §7.13 |
| `sect_zhuwulianhuanzhuang` 朱武连环庄 | O:YT；H:— | 邪/多线 | 条件正式/敌对 | `skills-wujue + yitian` | `city_khotan_kunlun` / `rg_xiyu_nanjiang` | 《倚天屠龙记》；`design/17` §7.14 |
| `sect_wanjia` 万家门 | O:LC；H:— | 邪/多线 | 条件正式/敌对 | `skills-kangxi` | `city_jingzhou` / `rg_jingxiang` | 《连城诀》；`design/17` §7.15 |
| `sect_jiangnanqiguai` 江南七怪 | O:SD；H:— | 正 | 客盟/传承 | `skills-wujue` | `city_jiaxing` / `rg_jiangnan_taihu` | 《射雕英雄传》；`design/17` §7.16 |
| `sect_yaowangmen` 药王门 | O:FH/XS；H:YY/SJ | 正/中 | 正式 | `skills-qianlong` | `city_wuhan` / `rg_jingxiang` | 《飞狐外传》《雪山飞狐》；`design/17` §7.17 |
| `sect_gaochang` 高昌遗脉 | O:BM；H:— | 中 | 客盟/传承 | `skills-kangxi` | `city_turpan` / `rg_xiyu_beijiang` | 《白马啸西风》；`design/17` §7.18 |
| `sect_hasake` 哈萨克部族 | O:BM；H:TL/SD/SHD/YT/XA/XK/BX/LD/LC/YY/SJ/FH/XS | 不定（族群） | 结盟，不作师门 | `skills-kangxi` | `city_yining` / `rg_xiyu_beijiang` | 《白马啸西风》；`design/17` §7.19 |
| `sect_huibu` 回部 | O:SJ/FH/XS；H:YY | 不定（共同体） | 结盟，不作师门 | `skills-qianlong` | `city_kashgar` / `rg_xiyu_nanjiang` | 《书剑恩仇录》等；`design/17` §7.20 |
| `sect_bohai` 渤海派 | O:BX；H:— | 中 | 正式 | `skills-xiake-bixue（待收录索引）` | `city_ningan` / `rg_dongbei` | 《碧血剑》；`design/17` §6.8/7.21 |
| `sect_jiulongbian` 九龙鞭 | O:FH；H:SJ/XS | 中 | 正式 | `skills-qianlong` | `city_beijing` / `rg_yanjing_zhili` | 《飞狐外传》；`design/17` §6.8/7.21 |
| `sect_gaibang` 丐帮 | O:TL/SD/SHD/YT/XA/BX/LD；H:XK/LC/BM/YY/SJ/FH/XS | 正/多线 | 正式 | `skills-wujue` | `city_luoyang` / `rg_zhongyuan` | 金庸多书；`design/17` §8.1 |
| `sect_tiezhangbang` 铁掌帮 | O:SD；H:— | 邪/多线 | 条件正式/敌对 | `skills-wujue` | `city_chenzhou_yuanling` / `rg_huxiang` | 《射雕英雄传》；`design/17` §8.2 |
| `sect_changlebang` 长乐帮 | O:XK；H:— | 多线 | 条件正式 | `skills-xiake-bixue` | `city_zhenjiang` / `rg_jianghuai`；城内确址**（待考）** | 《侠客行》；`design/17` §8.3、`design/19` §5.2 |
| `sect_honghuahui` 红花会 | O:SJ；H:FH/XS | 正 | 正式 | `skills-qianlong` | `city_hangzhou` / `rg_jiangnan_taihu` | 《书剑恩仇录》；`design/17` §8.4 |
| `sect_tiandihui` 天地会 | O:LD/FH/XS；H:LC/BM/YY/SJ | 正/多线 | 正式 | `skills-kangxi` | `city_beijing` / `rg_yanjing_zhili` | 《鹿鼎记》；`design/17` §8.5 |
| `sect_wangwu` 王屋派 | O:LD；H:— | 正/多线 | 正式 | `skills-kangxi` | `city_jiaozuo` / `rg_zhongyuan` | 《鹿鼎记》；`design/17` §8.6 |
| `sect_haisha` 海沙派 | O:YT；H:— | 邪/中 | 条件正式/敌对 | `skills-yitian` | `city_ningbo` / `rg_zhedong` | 《倚天屠龙记》；`design/17` §8.7 |
| `sect_jujing` 巨鲸帮 | O:YT；H:— | 邪/中 | 条件正式/敌对 | `skills-yitian` | `city_ningbo` / `rg_zhedong` | 《倚天屠龙记》；`design/17` §8.7 |
| `sect_shenquan` 神拳门 | O:YT；H:— | 中 | 正式 | `skills-yitian` | `city_nanjing` / `rg_jianghuai` | 《倚天屠龙记》；`design/17` §8.7 |
| `sect_weixinbiaoju` 威信镖局 | O:YY/SJ；H:FH/XS | 中 | 正式 | `skills-kangxi` | `city_taiyuan` / `rg_hedong_jinzhong` | 《鸳鸯刀》；`design/17` §8.8 |
| `sect_jinlongbang` 金龙帮 | O:BX；H:— | 正/中 | 正式 | `skills-xiake-bixue（待收录索引）` | `city_nanjing` / `rg_jianghuai` | 《碧血剑》；`design/17` §8.9 |
| `sect_xiaoyao` 逍遥派 | O:TL；H:— | 中 | 条件正式 | `skills-xiaoyao` | `city_luoyang` / `rg_zhongyuan` | 《天龙八部》；`design/17` §9.1 |
| `sect_lingjiu` 灵鹫宫 | O:TL；H:SD/SHD/YT/XA/XK/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 女性正式/男性客卿 | `skills-xiaoyao` | `city_yining` / `rg_xiyu_beijiang` | 《天龙八部》；`design/17` §9.2 |
| `sect_xingxiu` 星宿派 | O:TL；H:— | 邪 | 条件正式/敌对 | `skills-xiaoyao` | `city_xining` / `rg_hexilongyou` | 《天龙八部》；`design/17` §9.3 |
| `sect_mingjiao` 明教 | O:YT；H:— | 正/多线 | 正式 | `skills-yitian` | `city_khotan_kunlun` / `rg_xiyu_nanjiang` | 《倚天屠龙记》；`design/17` §9.4 |
| `sect_tianyingjiao` 天鹰教 | O:YT；H:— | 多线 | 正式 | `skills-yitian` | `city_ningbo` / `rg_zhedong` | 《倚天屠龙记》；`design/17` §9.5 |
| `sect_riyue` 日月神教 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 邪/多线 | 条件正式/敌对 | `skills-wuyue` | `—` / `rg_hedong_jinzhong` | 《笑傲江湖》；`design/17` §9.6 |
| `sect_wudu` 五毒教 | O:BX；H:— | 邪/多线 | 条件正式 | `skills-xiake-bixue` | `city_kunming` / `rg_yundian_qianzhong` | 《碧血剑》；`design/17` §9.7 |
| `sect_wuxian` 五仙教 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 中/多线 | 正式 | `skills-wuyue` | `city_kunming` / `rg_yundian_qianzhong` | 《笑傲江湖》；`design/17` §9.7 |
| `sect_shenlongjiao` 神龙教 | O:LD；H:— | 邪 | 条件正式/敌对 | `skills-kangxi` | `city_shenlongdao` / `rg_donghai_islands` | 《鹿鼎记》；`design/17` §9.8 |
| `sect_xuedaomen` 血刀门 | O:LC；H:LD | 邪 | 条件正式/敌对 | `skills-kangxi` | `city_qamdo` / `rg_qingzang` | 《连城诀》；`design/17` §9.9 |
| `sect_shennong` 神农帮 | O:TL；H:— | 邪/多线 | 条件正式/敌对 | `skills-xiaoyao` | `city_dali` / `rg_dali_cangshan` | 《天龙八部》；`design/17` §9.10 |
| `sect_mizong` 吐蕃密宗 | O:TL/SHD/YT/LD；H:SD/XA/XK/BX/LC/BM/YY/SJ/FH/XS | 多线 | 条件正式 | `skills-xiaoyao` | `city_lhasa` / `rg_qingzang` | 《天龙》《神雕》《倚天》《鹿鼎》；`design/17` §10.1 |
| `sect_xiakedao` 侠客岛 | O:XK；H:— | 中/多线 | 客盟/条件正式 | `skills-xiake-bixue` | `city_xiakedao` / `rg_nanhai_islands` | 《侠客行》；`design/17` §9.11 |
| `sect_yipintang` 西夏一品堂 | O:TL；H:— | 邪/政权 | 条件任职/敌对 | `skills-xiaoyao` | `city_yinchuan` / `rg_xixia_helan` | 《天龙八部》；`design/17` §10.2 |
| `sect_qidan` 契丹（辽） | O:TL；H:— | 不定（政权/族群） | 结盟/任职，不作师门 | `skills-xiaoyao` | `city_liaoshangjing` / `rg_monan` | 《天龙八部》；`design/17` §10.3 |
| `sect_menggu` 蒙古诸部 / 幕府 | O:SD/SHD/YT/LD；H:TL/XA/XK/BX/LC/BM/YY/SJ/FH/XS | 不定（政权/族群） | 结盟/任职，不作师门 | `skills-wujue` | `city_karakorum` / `rg_mobei` | 《射雕》《神雕》《倚天》等；`design/17` §10.4 |
| `sect_ruyangwangfu` 汝阳王府 | O:YT；H:— | 邪/政权 | 条件任职/敌对 | `skills-yitian` | `city_beijing` / `rg_yanjing_zhili` | 《倚天屠龙记》；`design/17` §10.5 |
| `sect_qinggong` 清宫 | O:LD/YY/SJ/FH/XS；H:LC/BM | 多线（政权） | 条件任职/敌对 | `skills-kangxi` | `city_beijing` / `rg_yanjing_zhili` | 清代四书界；`design/17` §10.6 |
| `sect_muwangfu` 沐王府 | O:LD；H:— | 正/多线 | 客盟/条件任职 | `skills-kangxi` | `city_kunming` / `rg_yundian_qianzhong` | 《鹿鼎记》；`design/17` §10.7 |
| `sect_chuangwangjun` 闯王军 | O:BX；H:LC/BM/YY/SJ/FH/XS | 正/多线 | 结盟/条件任职 | `skills-xiake-bixue` | `city_yanan` / `rg_guanzhong` | 《碧血剑》；`design/17` §10.8 |
| `sect_sidaeren` 四大恶人 | O:TL；H:— | 邪 | 临时结盟/敌对 | `skills-xiaoyao` | `city_dali` / `rg_dali_cangshan` | 《天龙八部》；`design/17` §10.9 |
| `sect_juxianzhuang` 聚贤庄 | O:TL；H:— | 多线 | 临时结盟/敌对 | `skills-xiaoyao` | `city_luoyang` / `rg_zhongyuan` | 《天龙八部》；`design/17` §10.10 |
| `sect_yihuagong` 移花宫 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 邪/多线 | 条件正式/敌对 | `skills-gulong` | `city_xian` / `rg_guanzhong` | 古龙《绝代双骄》；`design/17` §11.1 |
| `sect_erengu` 恶人谷 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 条件住民/敌对 | `skills-gulong` | `city_khotan_kunlun` / `rg_xiyu_nanjiang` | 古龙《绝代双骄》；`design/17` §11.2 |
| `sect_daqimen` 大旗门 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 正式 | `skills-gulong` | `city_jiuquan` / `rg_hexilongyou` | 古龙《大旗英雄传》；`design/17` §11.3 |
| `sect_shenshuigong` 神水宫 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 邪/多线 | 条件正式/敌对 | `skills-gulong` | `city_wuhan` / `rg_jingxiang` | 古龙《楚留香传奇·画眉鸟》；`design/17` §11.4 |
| `sect_wuzhengshanzhuang` 无争山庄 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 客盟/条件正式 | `skills-gulong` | `city_ningbo` / `rg_zhedong` | 古龙《楚留香新传·蝙蝠传奇》；`design/17` §11.5 |
| `sect_qinglonghui` 青龙会 | O:BX/LD/LC/BM/YY/SJ/FH/XS；H:XK | 邪/多线 | 条件正式/敌对 | `skills-gulong` | `city_nanjing` / `rg_jianghuai` | 古龙《七种武器》等；`design/17` §11.6 |
| `sect_kuaihuowangfu` 快活王一系 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 邪 | 条件任职/敌对 | `skills-gulong` | `city_dunhuang` / `rg_hexilongyou` | 古龙《武林外史》；`design/17` §11.7 |
| `sect_xueyumen` 血雨门 | O:LD；H:BX/LC/BM/YY/SJ/FH/XS | 邪 | 条件正式/敌对 | `skills-gulong` | `city_hangzhou` / `rg_jiangnan_taihu` | 古龙《剑·花·烟雨江南》；`design/17` §11.8 |
| `sect_tangmen` 蜀中唐门 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 多线 | 条件正式 | `skills-gulong` | `city_chengdu` / `rg_bashu` | 古龙《白玉老虎》；`design/17` §11.9 |
| `sect_kongqueshanzhuang` 孔雀山庄 | O:BX/LD；H:XK/LC/BM/YY/SJ/FH/XS | 正/多线 | 客盟/条件正式 | `skills-gulong` | `city_nanjing` / `rg_jianghuai` | 古龙《七种武器·孔雀翎》；`design/17` §11.10 |
| `sect_jinqianbang` 金钱帮 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 邪 | 条件正式/敌对 | `skills-gulong` | `city_luoyang` / `rg_zhongyuan` | 古龙《多情剑客无情剑》；`design/17` §11.11 |
| `sect_shenjianshanzhuang` 神剑山庄 | O:XK；H:XA/BX/LD/LC/BM/YY/SJ/FH/XS | 中/多线 | 客盟/条件正式 | `skills-gulong` | `city_hangzhou` / `rg_jiangnan_taihu` | 古龙《三少爷的剑》；`design/17` §11.12 |
| `sect_wanmeishanzhuang` 万梅山庄 | O:BX；H:XK/LD/LC/BM/YY/SJ/FH/XS | 正/中 | 客盟/传承 | `skills-gulong` | `city_xian` / `rg_guanzhong` | 古龙《陆小凤传奇》；`design/17` §11.13 |
| `sect_baiyuncheng` 白云城 | O:BX；H:XK/LD/LC/BM/YY/SJ/FH/XS | 多线 | 客盟/传承 | `skills-gulong` | `city_baiyuncheng` / `rg_nanhai_islands` | 古龙《陆小凤传奇》；`design/17` §11.14 |
| `sect_renyizhuang` 仁义庄 | O:XA；H:XK/BX/LD/LC/BM/YY/SJ/FH/XS | 正 | 正式/结盟 | `skills-gulong` | `city_kaifeng` / `rg_zhongyuan` | 古龙《武林外史》；`design/17` §11.15 |

### 7.3 十四书界覆盖核算

下表对 `design/17` §3 的 1,386 个状态单元逐列计数。每行满足 `O+H+P+N+D+M=99`；全表满足 `99×14=1,386`。它是构建期回归基线，不用于推断加入资格。

| 书界 | O | H | P | N | D | M | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|
| TL | 18 | 2 | 2 | 77 | 0 | 0 | 99 |
| SD | 9 | 5 | 2 | 72 | 11 | 0 | 99 |
| SHD | 10 | 4 | 5 | 67 | 11 | 2 | 99 |
| YT | 16 | 7 | 1 | 59 | 15 | 1 | 99 |
| XA | 15 | 19 | 1 | 41 | 23 | 0 | 99 |
| XK | 16 | 27 | 1 | 30 | 25 | 0 | 99 |
| BX | 14 | 31 | 2 | 20 | 32 | 0 | 99 |
| LD | 13 | 32 | 1 | 15 | 37 | 1 | 99 |
| LC | 3 | 41 | 1 | 14 | 40 | 0 | 99 |
| BM | 3 | 40 | 1 | 13 | 42 | 0 | 99 |
| YY | 3 | 44 | 1 | 8 | 43 | 0 | 99 |
| SJ | 10 | 46 | 0 | 0 | 43 | 0 | 99 |
| FH | 18 | 38 | 0 | 0 | 43 | 0 | 99 |
| XS | 9 | 46 | 0 | 0 | 44 | 0 | 99 |

发布时还须验证每个 `O/H` 驻地所在城市在该时代可达；若城市关闭，必须补野外入口 / 专线或回修上游状态，不能静默隐藏。`sect_riyue` 黑木崖没有可靠 `city_*`，依 `design/11` §2.4 落入 `rg_hedong_jinzhong`，城市栏保持“—”并继续标 **（待考）**。

---

## 8. 正邪、品德与声望

### 8.1 三个维度不可混用

| 维度 | 范围 / 作用域 | 回答的问题 | 不代表什么 |
|---|---|---|---|
| 任务路线 `routeTone` | `righteous / shadow / mixed`，每任务实例 | 此刻选择与哪一方同行 | 不是永久阵营，也不强制结局 |
| 品德 `morality` | −100～100，主角、跨书界 | 玩家一贯如何行事 | 不等于某门派标签或眼前敌我 |
| 声望 `fame` | 0～9,999，本书界 | 当代江湖有多少人听过主角 | 不等于敬爱；恶名仍可能提高声望 |

正邪双线由各 `design/story/*` 写具体事件，本文只规定统一计量。任务不得仅因玩家接过“邪线”就整段扣品德，而应对背信、杀伤、救援等可观察行为逐项结算。同样，击败被标为敌人的 NPC 不足以证明对方是邪派首恶。

### 8.2 品德事件与幅度

所有品德动作必须携带 `reasonCode`、对象、任务 / 战斗来源和幂等 `effectId`。一次原子事件的净变化钳制在 −15～+15；同一行为不能由任务、战斗与对白重复计分。

| 行为类 | 默认变化 | 边界 |
|---|---:|---|
| 日常善举：施药、护送弱者、归还小额失物 | +1～+2 | 同模板每日累计至多 +3**【建议值】** |
| 冒险救人、制止欺凌、兑现困难承诺 | +3～+5 | 需承担可见成本或风险 |
| 救下一群平民、阻止大规模伤亡、重大牺牲 | +8～+15 | 章节级，一事件只结一次 |
| 小骗、失信、勒索、偷窃生活物资 | −1～−3 | 被迫且立即补偿可减轻，不自动归零 |
| 出卖同伴、嫁祸无辜、残害俘虏 | −5～−10 | 同时触发人物 / 门派后果 |
| 屠戮平民、主动造成大规模伤亡 | −12～−15 | 不靠付钱或刷善举即时洗净 |
| 劝降成功 / 放生倒地精英或头目 | +1 / +1 | 采用 `design/09` §11.5 |
| 了断倒地精英或头目 | −3 | 对经剧情认证的邪派首恶为 0；必须显式选择（P43） |
| 误伤平民 / 以众凌寡正派单人 | −5 / −1 | 每名 / 每场；另有声望 −5 / −2 |
| 生死符驭使非敌对 NPC | −10 | 每次、每个受害者都写事件（P31） |
| 虎爪绝户手攻击非邪派目标 | −3 | 每场至多一次，按图鉴定稿；并记武当违纪（P26） |

虎爪数值与 `skills-daojia` 定稿统一为 −3；实现不得保留旧草案的 −2。`morality` 结算后钳制到 `[−100,100]`，但审计日志保留 unclamped delta，以便解释“为何没有再增加”。

### 8.3 品德阈值及玩法门槛

阈值完全沿用 `design/03` §8.3：`≥80` 大侠、40～79 侠义、10～39 良善、−9～9 中立、−10～−39 乖张、−40～−79 邪道、`≤−80` 魔头。任务条件应引用数值而非中文称号。

- 正派常规入门 `morality≥10`；高门槛绝学可按图鉴要求 `≥60`。`≥80` 只免基础品行试问。
- 邪派任务可从 `≤−10` 开放，邪派正式入门通常要求 `≤−40`；具体图鉴已有更宽门槛时取图鉴，不在本文覆盖。
- 正邪主线允许中途换边，但背叛、救人和补偿分别结算；禁止设置“一键洗白”。
- 执卷选项为 `morality≤−60`，或持断尘之誓且 `morality≤−30`；无字真结局要求 `morality≥20`，均引用 `design/13` §7.10。
- 品德跨书界完整保留；只在新周目按 `design/13` §6.2 重置，不随书眠重置。

### 8.4 声望来源、门槛与书眠

| 来源 | 默认 `fame` | 说明 |
|---|---:|---|
| 普通任务 / 支线收束 | +10～+30 | 隐秘完成可为 0 |
| 门派晋升 L2 / L3 / L4 / L5 | +20 / +50 / +100 / +200 | 同门派每级一次 |
| 具名 Boss 首胜 | +20～+100 | 按其当代名望，不按数值难度重复发 |
| 擂台每胜 / 夺魁 | +10 / +50～+300 | 与 `design/09` §3.4、§11.5 一致 |
| 以弱胜强 / 切磋名家 | +10 / +5～+20 | 同一战只取最高适用名望项**【建议值】** |
| 改命 / 主线幕收束 | +200～+500 | 重大结果可为恶名；品德另算 |
| 公开败逃、误伤平民、造假败露 | −5～−100 | `fame` 不低于 0；隐秘事件通常不改 |

阈值引用 `design/03` §8.4：100 开门派入门考验，300 名家指点与买价 −2%，800 名动一方与买价 −4%，1,600 威震江湖与买价 −6%，3,000 天下闻名与买价 −8%。§6 晋升取 100 / 300 / 800 / 1,600 四档。招募门槛由 `design/18` 给出，本任务只读 `fameAtLeast`。

书眠结算必须按以下顺序原子执行：冻结任务奖励 → `fameTotal = fameTotal + fame` → 记录当界峰值 / 结算摘要 → `fame = 0`。崩溃重试不得重复累加。`fameTotal≥20,000` 的“名满天下”结局修饰仍为 `design/13` §7.10 的**【建议值】**；本文不把它改成单界门槛。

### 8.5 事件冲突与展示

一项行为可以同时改变品德、声望、人物好感和门派关系，但必须拆为同一事务内的独立效果。例如公开放走被冤枉者可 `morality +3`、`fame +20`、某官府关系 −10；后两项不反推第一项。UI 先显示叙事结果，再逐项显示数字与理由；隐藏身份导致的后果只显示“有人记下了此事”，直到来源揭露。

---

## 9. 经济循环

### 9.1 货币与账本

本作两种展示货币为银两与铜钱：`1 枚铜钱 = 1 文`，`1 两银 = 1,000 文`。统一记账单位为文，运行态只使用整数 `moneyWen`，不存浮点“两”；结算以文四舍五入。银票、珠宝、外币若出现均是 `it_*` 物品，兑换后才进入现金账本。

金钱是本书界资源：书眠前允许消费、捐献或典当赎回，书眠提交后清零；不得通过藏史、同伴背包、家丁库存、未领月钱或挂单交易跨界。天书 / 书契不能直接兑换银钱。

### 9.2 统一物价与买卖

估值完全引用 `design/10` §13：

```text
P(cat,g) = P0(cat) × 2.2^(g−1)       # 两，显示取两位有效数字
buy  = V × (1.15−0.003×cha) × (1−0.001×speech) × shopMul × chapterPriceMul
sell = V × (0.35+0.0015×cha) × outlet
```

| 黄下 `P0` | 主武器 | 衣 | 副手 / 佩饰 | 头手腰鞋 | 疗伤丹 | 增益丹 | 暗器 | 材料 | 秘籍 | 菜肴 | 坐骑 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 价值 | 2 两 | 1.5 两 | 1 两 | 0.8 两 | 200 文 | 300 文 | 20 文 | 100 文 | 5 两 | 50 文 | 15 两 |

例：玄中主武器为 `2×2.2^4=46.8512` 两，按两位有效数字显示 47 两。魅力 50、口才 40、`shopMul=chapterPriceMul=1` 时买价倍率为 `(1.15−0.15)×(1−0.04)=0.96`，即约 45 两；普通专营店卖出倍率为 `0.35+0.075=0.425`，即约 20 两。所有 UI 金额最终转文取整。

| 店型 | `shopMul`**【建议值】** | `outlet` | 库存 / 特例 |
|---|---:|---:|---|
| 城市专营店 | 1.00 | 1.00 | 按 `design/10` §13.4 普通供货上限 |
| 杂货铺 | 1.05 | 0.80 | 类目广、每类库存低 |
| 门派兑换 / 内库 | 0.90 | 不收普通赃物 | 需身份、贡献和当月配额；贡献不是货币 |
| 黑市 | 1.25 | 0.80 | 毒物 / 赃物；可能触发事件 |
| 当铺 | 1.10 | 0.80 | 名器只可典当，得 `V×0.30`；本界原价赎回 |

声望价格减免已包含在 `shopMul` 的生成过程：300 / 800 / 1,600 / 3,000 对应再减 2% / 4% / 6% / 8%，不得在最终公式外重复乘一次。天级物品只估值不出售；神兵、任务物、信物、天材不可买卖。

### 9.3 每书界收支曲线

```text
I(ch) = 2 × P(mainWeapon, g_mode(ch)) × chapterIncomeMul(ch)
startMoney(ch) = 4 × P(mainWeapon, g_mode(ch)) = 2 × I(ch) / chapterIncomeMul(ch)
targetIncome(ch) = I(ch) × expectedPlayableHours(ch)
targetSpend(ch) = targetIncome(ch) × [0.60, 0.80]
```

`g_mode` 与 `chapterIncomeMul` 源自 `design/10` §4.4、§13.5；`design/16` §12 已据此按章节内容量定稿 `I` 与 `expectedPlayableHours`，故不再用统一 11.5 小时替代。下表直接投影其正式逐界预算；天龙的普通池众数为 `P=9.5 两`，故 `I=2×9.5×1=19 两/时`。开局银两仍按 `design/10` §13.5 的 `4×P` 显示价锚，不受 `chapterIncomeMul` 放大。

| 书界 | `I` 两/h | `H` h | 总净值 `B=I×H` | 开局银两 | 支出目标 `60%–80%×B` |
|---|---:|---:|---:|---:|---:|
| 天龙 | 19 | 15 | 285 | 38 | 171–228 |
| 射雕 | 94 | 14 | 1,316 | 188 | 789.6–1,052.8 |
| 神雕 | 200 | 15 | 3,000 | 400 | 1,800–2,400 |
| 倚天 | 460 | 15 | 6,900 | 920 | 4,140–5,520 |
| 笑傲 | 94 | 12 | 1,128 | 188 | 676.8–902.4 |
| 侠客 | 94 | 10 | 940 | 188 | 564–752 |
| 碧血 | 42 | 11 | 462 | 84 | 277.2–369.6 |
| 鹿鼎 | 45 | 13 | 585 | 18 | 351–468 |
| 连城 | 19 | 9 | 171 | 38 | 102.6–136.8 |
| 白马 | 11.4 | 8 | 91.2 | 38 | 54.72–72.96 |
| 鸳鸯 | 19 | 8 | 152 | 38 | 91.2–121.6 |
| 书剑 | 63 | 12 | 756 | 84 | 453.6–604.8 |
| 飞狐 | 42 | 11 | 462 | 84 | 277.2–369.6 |
| 雪山 | 42 | 9 | 378 | 84 | 226.8–302.4 |
| **合计** | — | **162** | **16,626.2** | — | **9,975.72–13,300.96** |

十四界基础 `chapterPriceMul` 均为 1.00；时代物价差已由当界 `g_mode` 和供货池表达。灾荒、围城、黑市等剧情波动只能作为带起止事件与类目白名单的局部修正，不能永久改写全界基价。

“每小时建议支出”取净收入的 60%–80%，用于消耗品、旅行 / 食宿、修理强化、情报 / 娱乐与经营维护；保留 20%–40% 购买装备或处理意外。每书界总预算由 `expectedPlayableHours` 相乘得出，章节若调整时长只改时长，不改物价公式。标准玩家在中点的可动现金目标为 2–4 小时收入、结局前为 3–6 小时收入**【建议值】**；超上沿触发钱库和高价服务分析，不直接没收。

收入结构以 `design/16` §12.1 为正式目标：任务 40%、战利品出售 25%、敌人现银 10%、城市营生 10%、资源点 8%、门派 5%、赌场 / 其他 2%。十四界合计 `B=16,626.2` 两，对应七桶为 6,650.5 / 4,156.6 / 1,662.6 / 1,662.6 / 1,330.1 / 831.3 / 332.5 两（显示到 0.1 两）；显示值相加仍为 16,626.2 两，各桶原始值按 40/25/10/10/8/5/2 精确分完 100%，资产转仓、加工或买回不重复创造价值。

### 9.4 商店、刷新与交易

- 商店库存由 `chapterId + cityId + shopId + periodIndex` 决定性生成；普通店每 3 个游戏日、门派内库每月结时刷新**【建议值】**，读档不重掷。
- 供货上限：高武普通 / 名店为玄上 6 / 地下 7；中武玄中 5 / 玄上 6；低武玄下 4 / 玄中 5。黑市上限分别地下 7 / 地下 7 / 玄上 6，且仍受区域等级限制。
- 普通商品允许买卖、有限库存和回购；任务物与信物没有出售按钮。偷窃、赃物与黑市由任务动作处理，不通过负价格模拟。
- 玩家之间不存在联网交易。与 NPC 以物易物时，双方物品按 V 估值，剧情折让写 `barterMul`，不得改变物品全局基价。
- 防套利约束：任意合法 `buy→sell` 环路收益必须 `≤0`；同一物品不能同时吃门派折扣、任务报销和回购溢价。

### 9.5 防通胀与跨系统接口

| 控制点 | 规则 |
|---|---|
| 收入闸 | 全书界模拟后，实际总收入应在 `targetIncome` 的 90%–110% |
| 现金闸 | 单任务现金由 §4.2 预算；随机掉钱受 `design/16` §12.1 的敌人现银 10% 桶钳制 |
| 战利品闸 | 卖价计入任务段落总收益；具名签名武器不得刷取 |
| 库存闸 | 高品阶受供货上限、固定来源和每期库存共同约束 |
| 消耗闸 | 修理 / 强化、旅行、食宿、制作与经营维护形成持续支出 |
| 重复闸 | 月钱只领 `primarySectId`；客卿全局唯一；教头 / 行脚受日程冲突 |
| 书眠闸 | 清现金、店铺、典当、资源库存、职位与应收账；只保留上游白名单 |

`design/16` 的 `EconomyLot` / 结算收据记录 `sourceBucket`、`sourceId`、`transactionId`、参考价值、数量、时点与 `isNewEconomicValue`。走镖、护院、赌场、资源点争夺和家丁事件通过 §2 的 `estate/<kind>` 适配层调用 `EstateAction`；`settle_*` 自己完成结算与账簿写入，任务不得再追加 `reward/money`。职位工资、资源产量、家丁成长、强制成本和预算钳制全部只读 `design/16`。

---

## 10. 生活技能

### 10.1 共通成长曲线

基准只有十项技艺：`med / poi / antidote / forge / alchemy / formation / music / art / chess / speech`。其值均为 0–100、跨书界保留且不受天道压制；烹饪是第十一类生活玩法，但不新增 `cook` 属性。

```text
处理品阶门槛 T(g) = 8g − 4
原始反算 gMaxRaw(a) = floor((a + 4) / 8)
实际品阶上限 gMax(a) = min(12, gMaxRaw(a))
制作成功率 Pcraft = clamp(0.60 + 0.04 × (a − T(g)), 0, 1)
社交成功率 Psocial = clamp(0.50 + 0.025 × (value − DC), 0.05, 0.95)
升 a → a+1 所需成功使用 = 5 + floor(a/5)
拜师一次提升到 min(师父值 − 10, 当前值 + 20)
```

| 技艺值到达 | 累计成功使用（从 0 算） | 可处理最高品阶 | 定位 |
|---:|---:|---:|---|
| 4 | 20 | 黄下 1 | 入门，可处理有品阶对象 |
| 20 | 130 | 黄上 3 | 熟手 |
| 40 | 340 | 玄中 5 | 行家 |
| 60 | 630 | 地中 8 | 名家门槛附近 |
| 80 | 1,000 | 天下 10 | 宗师 |
| 92 | 1,261 | 天上 12 | 全品阶门槛 |
| 100 | 1,450 | 天上 12（封顶） | 数值上限；原始反算 13 必须钳到 12 |

累计值由五点一档直接求和：例如 0→20 为 `5×(5+6+7+8)=130`；60→80 为 `5×(17+18+19+20)=370`。一次完整、有成本且结果成功的操作至多计 1 次成功使用；批量制作按“批”而非件数计。相同 `practiceKey` 每游戏日从第 4 次起不再给技艺经验**【建议值】**，但仍正常产物，防止用免费低阶动作刷满。失败不给技艺经验，仍保留材料 / 时间后果。

获取方式只有三类：实际使用、师父指点、典籍研读。典籍按 `design/03` 提升 +3～+10 且不得越过典籍门槛；装备临时技艺加值可以参与门槛和成功率，但不计入拜师目标、成长费用或永久值。所有随机检定生成 `checkId` 并固化结果，重载不能重掷。

### 10.2 医、毒与解毒

| 玩法 | 获取与教师 | 检定 / 小游戏 | 产出 | 上限与 `design/10` 接口 |
|---|---|---|---|---|
| 医术 `med` | 医馆问诊、救治任务、医书；名医关系达到 `design/18` 门槛后可拜师 | 先辨伤型，再在有限诊疗行动中排序止血、正骨、调息；玩法选择生成修正，最终仍按公式结算 | 战斗外医治、辨药、祛 `injury/bleed`、医疗任务许可 | 可处理 `gMax(med)`；治疗公式与战斗中用药次数 / 射程只读 `design/03` §8.2、`design/10` §8.1 |
| 毒术 `poi` | 毒经、采毒、毒门师父、识毒任务 | 从已知毒材中选择载体、剂量档和施用时机；目标识破走一次有 ID 的对抗检定 | 配毒、淬毒、毒效命中与强度修正、毒物辨识 | 毒材 / 毒药 ID、淬毒 `gc`、三场持续与失败损耗见 `design/10` §6.5、§8.4、§8.7；自制最高地上 9，天阶毒只走固定节点 |
| 解毒 `antidote` | 药铺辨毒、解救中毒者、解方、医毒师父 | 识别毒类 → 选解法 → 决定先压制还是根治；专属毒没有通用“高数值强解” | 解毒 / 解蛊、配解药、抗毒 / 抗蛊被动 | 只解除配方与 Buff 明示允许的标签；品阶 ≤ `gMax(antidote)`，专属解药及材料见 `design/10` §8.2、§8.7 |

医术、毒术、解毒分别成长，不互相替代。治疗已知外伤可只用 `med`；不明中毒先用 `antidote` 诊断，制解方再消耗配方材料。配毒成功本身不扣品德；对非敌对 NPC 下药、强制服毒或造成伤亡时，按 §8 对行为结算。安全呈现只使用虚构配方名和抽象材料，不提供现实毒物制作步骤。

### 10.3 锻造

锻造 `forge` 从铁匠劳作、图谱、拆解与师父获得。核心玩法为“选基底 → 配材 → 加热 / 锻打 / 淬火三个离散决策 → 是否定向词条”；不是依赖毫秒反应的节奏游戏。每步只给有限选项，辅助模式可直接按推荐方案完成，最终成功率仍由 `forge` 和品阶统一计算。

| 操作 | 输入 | 结果 / 上限 | 接口 |
|---|---|---|---|
| 打造 | `rc_*` 图谱、主材 1、低一大阶同族辅材 2、`2×go` 时辰 | `go=min(gm, 图谱上限, gMax(forge),9)`；失败返一半材料 | `design/10` §6.6 |
| 强化 | 装备、同族材料与费用 | 成功率、保底、+1～+10 与天材成本全由 `design/10` §6.2 | 不在任务 DSL 直接改 `refine` |
| 开锋 / 加衬 / 琢磨 | 同族同大阶材料 2、10% 基价 | 每件一工艺槽；品质按上游公式 | `design/10` §6.3 |
| 重铸 / 精修 / 修复 | 材料、5%～10% 基价 | 重掷或取高；天级只能修复不能自造 | `design/10` §6.6 |
| 拆解 | 可拆普通装备 | 返 `1+floor(absGrade/3)` 份低一阶材料 | 名器 / 天级不可拆 |

任务只能发图谱学识、材料、作坊访问权或工匠委托，实际成品必须进入 `design/10` 的制作事务。资源点只提供 `resourceRef`，天地玄黄九品到装备 1–12 品的换算由 `design/16` 定稿。

### 10.4 炼丹与烹饪

炼丹 `alchemy` 通过丹房差事、丹经、丹方与师父成长。小游戏为“核对药性 → 选择主药 / 辅药 / 药引 → 控制三段火候”；选项可提高或降低有效值，但不改变配方硬门槛。

| 炼丹项 | 规则 |
|---|---|
| 门槛 / 成功 | `alchemy≥T(g)`；用 `Pcraft` |
| 产量 | `1+floor((alchemy−T(g))/25)` |
| 材料 | 主药 1（≥g）+ 辅药 2（≥g−2）+ 配方药引 |
| 耗时 / 失败 | `g` 时辰；失败返一半药材 |
| 上限 | 自制常规丹最高地上 9；天级须固定丹方、天材且 `alchemy≥76` |
| 输出 | `design/10` §8 的丹药、配毒 / 解药分别改读 `poi` / `antidote` |

烹饪不读取 `alchemy`，也不新增全局 `cook`。每个已学菜谱保存 `recipeMastery[rc_*]∈[0,10]` **（原创扩展）**，是该菜谱的学识熟练度：

```text
cookValue(rc) = 10 × recipeMastery(rc)
gCook = min(recipe.maxGrade, mainIngredientGrade + 1, floor((cookValue + 4)/8))
Pcook = clamp(0.60 + 0.04 × (cookValue − T(gCook)), 0, 1)
masteryXpToNext(m) = 2 + m             # m=1..9；每次成功一批 +1
```

初学菜谱为 1 级熟练（`cookValue=10`）；到 10 级共需 `3+4+…+11=63` 批成功烹饪。小游戏为选材、刀工、火候三步；遗漏必要食材会在提交前失败，不消耗 RNG。成功产出 `design/10` §9 的 `dish/soup/snack`；失败产出黄下“家常饭”并消耗食材；营地最多玄阶，厨房 / 御膳房等场所上限由物品表读取。菜谱解锁与熟练度作为 `knowledge` 跨书界保留**【建议值】**，原材料与成品不跨界。黄蓉等名厨代做只解锁成品或教学事件，不自动把玩家熟练度置满。

### 10.5 奇门遁甲、音律、书画与棋道

| 技艺 | 获取 / 成长场景 | 玩法与检定 | 产出 | 上限 / 接口 |
|---|---|---|---|---|
| 奇门遁甲 `formation` | 阵图、门派阵法课、迷阵与机关拆解 | 在有限步内旋转阵眼、连通生门；可选择硬门槛或一次概率检定 | 识陷阱、开捷径、阵法杂学倍率、机关材料 | 识破半径 `1+floor(formation/25)` 格；强度 `×(1+formation/200)`；地图 / 战斗分别交 `design/08` / `09` |
| 音律 `music` | 曲谱、合奏事件、乐师指点 | 回合制复现音型、辨调或协同演奏；无障碍模式用符号 / 振动而非只靠听音 | 曲谱学识、羁绊节点、音功与心神效果修正 | 强度 `×(1+music/200)`、效果命中 `+0.2×music`；乐器与曲谱物品见 `design/10` |
| 书画 `art` | 临帖、鉴画、书院 / 文房、书画人物事件 | 比较章法线索、拼卷、辨伪；不要求真实手写 | 鉴价、发现藏谱、收藏学识、铭文 `ins_*` | 估价误差 `±(100−art)/2%`；铭刻品阶 `min(gUse,gMax(art))`，每件一条，见 `design/10` §6.4 |
| 棋道 `chess` | 棋谱、对局、残局奇遇、棋士指点 | 离散回合残局，在行动数内达成目标；可用提示换少量奖励而非卡死主线 | 棋谱学识、羁绊 / 奇遇分支、战斗预判 UI | 30 显示后 3 个行动者，60 显示敌方意图目标，85 显示 Boss 下一招名；棋局 DC 由任务定 |

文化小游戏必须提供跳过 / 硬检定路径；跳过可以少收藏或声望，但不能阻断主线。原著中石破天“不识字”仍能越过文字表层领悟石壁武学，故书画 / `lore` 不得成为该悟武事件唯一硬门槛；具体条件引用 `design/05` §7.6。

### 10.6 口才

口才 `speech` 从说服、盘问、调停、讲学、商谈和人物指点增长。对话玩法先收集证词 / 利益 / 忌讳三个线索标签，再选择“讲理 / 交情 / 利诱 / 威慑”等策略；NPC 的性格与关系来自 `design/18`，任务只给 `DC` 与失败出口。

| 场景 | 判定 | 成功 | 失败边界 |
|---|---|---|---|
| 议价 | 买价直接乘 `(1−0.001×speech)` | 降价，最多 −10% | 维持原价，不得靠重开重掷 |
| 劝降 | `design/09` 的士气 / 伤势 DC，再走一次固化检定 | 非致死离场、品德 / 声望按 §8 | 目标锐意，3 行动内不可重试 |
| 免战 / 调停 | `Psocial` 或明确硬门槛 | 转非战斗阶段并补等价经验 | 转战斗 / 赔偿 / 另寻证据，不锁主线 |
| 套话 / 盘问 | 线索每命中一项使 DC −5**【建议值】**，累计最多降低 15 | 得情报旗标 | 得模糊线索或关系下降 |
| 招募 / 门派外交 | 只作为 `design/18` / §6 的一项条件 | 发候选 intent | 不能绕过 D4/D5 专属链、掌门许可或时代状态 |

口才满值仍受 `Psocial≤0.95` 限制；剧情硬拒绝、誓言、死亡和事实边界不能被随机说服。威慑成功不天然等于善行，后续品德由行为结果计算。

### 10.7 生活技能产出与接口总表

| 玩法 | 永久状态 | 当界产出 | 核心消费者 |
|---|---|---|---|
| 医 / 毒 / 解毒 | 十项技艺值、配方学识 | 治疗、毒 / 解药、事件结果 | `design/06`、`10`、任务 |
| 锻造 | `forge`、图谱 / 铭文学识 | 装备、工艺、维修 | `design/10`、`16` |
| 炼丹 | `alchemy`、丹方 | 丹药 | `design/10` §8 |
| 烹饪 | 菜谱及熟练度**【建议值】** | 菜肴、膳食 | `design/10` §9、`16` |
| 奇门 | `formation`、阵图学识 | 门禁、阵法、机关结果 | `design/08`、`09` |
| 音律 / 书画 / 棋道 | 对应技艺、收藏学识 | 演奏、铭文、鉴宝、预判 | `design/05`、`09`、`10` |
| 口才 | `speech` | 价格修正、任务 / 招募分支 | 本文 §2、§5、§9 |

跨书界只保留技艺永久值和已学学识；材料、成品、作坊、商店、资源点、家丁、临时加值与未完成批次清除。书眠中的制作必须先结算或取消并按配方失败规则退款，不能带一个“进行中任务”穿越时代。

---

## 11. 数据结构与 JSON-compatible YAML 示例

本节定义玩法语义；目录、Zod、编译顺序与 strict schema 实现仍归 `tech/04`。正式 YAML 禁止 anchor、alias、merge key、多文档流、重复键和隐式日期；未知字段报错。下面的 `fixture: true` 对象只供测试，不进入生产扫描。

### 11.1 `QuestDef` 与任务实例

`QuestDef` 是不可变内容；`QuestInstance` 是存档状态。标题、目标与结果使用本地化 key，不能把译文当状态键。下例是 §3.2 同一个 `q_04_faction_90` 夹具按 `quest.v1` 完整字段重述，用来展示持久结构，不是第二个定义；实现测试应只装载一份源文件。

```yaml
schemaVersion: quest.v1
fixture: true
id: q_04_faction_90
kind: faction
chapterId: ch04_yitian
titleKey: quest.fixture.wudang_rank2.title
ownerSectId: sect_wudang
subjectNpcIds: [npc_zhangsanfeng]
recommendedLevel: 64
routeTone: righteous
offerWhen:
  all:
    - sect: { id: sect_wudang, status: member, rankAtLeast: 1, contributionAtLeast: 300 }
    - compare: { left: { stat: morality }, op: ge, right: 20 }
    - compare: { left: { stat: fame }, op: ge, right: 100 }
showWhen:
  sect: { id: sect_wudang, status: member }
stages:
  - id: st_exam
    objectiveKeys:
      - quest.fixture.wudang_rank2.objective.spar
      - quest.fixture.wudang_rank2.objective.rules
    objectives:
      - { type: spar, targetRef: npc_zhangsanfeng, nonLethal: true }
      - { type: dialogue, storyId: ink_fixture_wudang_exam, knot: recite_rules }
    transitions:
      - id: edge_pass
        priority: 10
        when:
          all:
            - flag: { id: fl_fixture_wudang_sparred, is: true }
            - flag: { id: fl_fixture_wudang_rules, is: true }
        to: st_promote
        branchKey: passed_both
  - id: st_promote
    terminal: completed
    endingKey: promoted
    effects:
      - { id: fx_rank, op: sect/claimRank, sectId: sect_wudang }
      - { id: fx_exp, op: reward/exp, expKind: faction_rank, levelRef: recommended }
      - { id: fx_fame, op: reward/fame, delta: 20, reasonCode: rank_up_l2 }
      - { id: fx_source, op: learnSource/unlock, sourceRef: src_fixture_wudang_l2 }
tracking:
  defaultTracked: true
  targetRef: npc_zhangsanfeng
  revealPolicy: known_only
source:
  origin: expanded
  note: schema fixture; not production story
```

对应的运行态只保存状态差量：

```yaml
schemaVersion: quest-instance.v1
questId: q_04_faction_90
contentVersion: 1
state: active
stageId: st_exam
acceptedAt: 48240
deadlineAt: null
counters: {}
branchPath: []
checkResults: {}
appliedEffectIds: []
tracked: true
```

`contentVersion` 升级时必须有显式迁移；阶段被删除时只可映射到语义等价阶段或声明的 `obsolete` 终态。不得凭数组序号恢复阶段、转移、检定或效果。

### 11.2 任务侧 `NpcInteractionBinding`

完整 `NpcDef`、appearance、生卒、武学画像和招募规格见 `design/18` §7；地点日程结构与优先级见 `design/11` §6.3。本文只保存任务对人物及日程解析策略的绑定，不复制姓名、出生年、武学或 `ScheduleBlock`：

```yaml
schemaVersion: quest-npc-binding.v1
fixture: true
npcId: npc_zhangsanfeng
appearanceQuery:
  chapterId: ch04_yitian
  year: 1336
  eraLayer: ch04
  requirePresenceMode: living
schedulePolicy:
  mode: resolveWorldSchedule
  source: design/11#6.3
  unavailable: suspend_or_offer_alternate
dialogue:
  storyId: ink_fixture_wudang_exam
  startKnot: recite_rules
  fallbackKeys:
    normal: npc.fixture.wudang.fallback.normal
    networkFailure: npc.fixture.wudang.fallback.network
    contentRefusal: npc.fixture.wudang.fallback.refusal
relationGate:
  affinityAtLeast: 20
  bondAtLeast: 0
recruitment:
  authority: design/18
  action: companion/recruit
  difficultyMustMatchAppearance: true
combat:
  profileSource: npcAppearance
  allowedVariant: spar
aiDialogue:
  defaultEnabled: false
  tool: propose_effects
  maxEffectsPerCall: 3
  allowedEffects: [affinity_delta, set_allowed_flag]
```

绑定解析顺序固定为 `npcId → 当代 appearance → 区域时代层 ScheduleBlock → 任务日程覆写`。找不到活体 appearance 时不得回退到其他时代画像；应进入任务声明的挂起、继承或失败出口。`allowedVariant` 必须是 `design/18` 已登记的画像变体，任务不能内嵌新属性。

### 11.3 `SectProgressionPolicy` 与当界身份状态

组织名称、分类、历史、驻地、十四界状态、称谓和武学索引只读 `design/17`。本文对象只为一个规范 `sect_*` 追加流程规则：

```yaml
schemaVersion: sect-progression.v1
fixture: true
sectId: sect_wudang
definitionRef: design/17#sect_wudang
rankTemplateRef: T02
joinPolicy:
  normalAvailability: [O]
  hiddenAvailability: H
  hiddenRequiresDiscovery: true
  moralityMin: 10
  fameMin: 100
  entryQuestRequired: true
  grantorNpcId: npc_zhangsanfeng
promotionQuestRefs:
  L2: q_04_faction_90
membershipPolicy:
  primaryForStipendRequired: true
  dualFormalDefault: deny
  maxRank5PerChapter: 1
membershipEffects: []
ranks:
  - level: L1
    contributionMin: 0
    fameMin: 100
    tenureDaysMin: 0
    taskGate: entry
    skillScope: [yellow_basic]
    duties: [chores, patrol]
    stipendTier: 1
    resourceTier: 1
  - level: L2
    contributionMin: 300
    fameMin: 100
    tenureDaysMin: 3
    taskGate: minor_exam
    skillScope: [yellow_all, mystic_low_candidate]
    duties: [rotation, escort, junior_instruction]
    stipendTier: 2
    resourceTier: 2
  - level: L3
    contributionMin: 900
    fameMin: 300
    tenureDaysMin: 10
    taskGate: lineage_trial
    skillScope: [mystic_all, earth_low_candidate]
    duties: [lead_small_team, master_errand]
    stipendTier: 3
    resourceTier: 3
  - level: L4
    contributionMin: 2400
    fameMin: 800
    tenureDaysMin: 30
    taskGate: crisis_and_teaching
    skillScope: [earth_all, branch_secret_candidate]
    duties: [teach, adjudicate, administer]
    stipendTier: 4
    resourceTier: 4
  - level: L5
    contributionMin: 6000
    fameMin: 1600
    tenureDaysMin: 90
    taskGate: succession
    skillScope: [highest_catalog_access]
    duties: [govern, diplomacy, succession]
    stipendTier: 5
    resourceTier: 5
disciplineRules:
  - key: huzhao_against_non_evil
    severity: 2
    evidenceEvent: "battle/ended"
    effects:
      - { op: reward/morality, delta: -3, reasonCode: huzhao_non_evil }
      - { op: sect/discipline, sectId: sect_wudang, severity: 2 }
rank5Policy:
  playableMode: storyConfigured
  councilActionsPerMonth: 2
  carryUnusedActions: false
```

该 fixture 只登记 §3.2 的 L2 考核，因此不虚造一个未定义的 F1 入门任务；生产策略须另填可解析的 `joinPolicy.entryQuestRef`，`entryQuestRequired: true` 不能代替该引用。示例中的武当 L5 可达性仍须由当代故事配置；`storyConfigured` 不是承诺玩家必然取代张三丰。`skillScope` 是目录访问标签，不是 `sk_*` 列表；实际候选由 `design/17` 的当代武学索引、各图鉴 §0.4 与每门武学 `reqs` 求交。

当界身份存档示例：

```yaml
schemaVersion: sect-membership-state.v1
chapterId: ch04_yitian
primarySectId: sect_wudang
rank5SectId: null
memberships:
  sect_wudang:
    status: member
    rank: L2
    contribution: 360
    joinedAtDay: 8
    lastPromotionDay: 12
    disciplineStrikes: []
    stipendPeriodClaimed: null
    resourcePeriodClaimed: null
    frozen: false
modifierStates: {}
```

书眠归档该对象后，新书界创建空的 `memberships`、`primarySectId` 与 `rank5SectId`；旧身份只进历史摘要，不能自动领当代月钱或越过当代入门任务。

### 11.4 任务与外部系统的引用契约

| 引用 | 强度 | 构建期要求 | 运行时失败策略 |
|---|---|---|---|
| `q_*`、阶段、出口、`effectId` | 强 | 本任务图内存在且可达 | 拒绝命令，保留旧阶段 |
| `npc_*` / appearance | 强 | 存在于 `design/18`；书界 / 年份相交 | 挂起或走已声明替代出口 |
| `sect_*` / `T01..T12` | 强 | 存在于 `design/17`；状态与当代相符 | 拒绝入门 / 晋升 |
| `sk_*` / `it_*` / `rc_*` | 强 | 存在于图鉴 / `design/10` | 奖励事务整体回滚 |
| `city_*` / `rg_*` / 入口 | 强 | 存在于地图且当代可达 | 隐藏目标并报告内容错误 |
| `res_*` / `rp_*` / `biz_*` / `sv_*` / `job_*` | 强 | 存在于 `design/16`，地图位置和时代开放闭合 | 不结算经营收益 |
| 合同、月钱与经营结算 | 强运行态引用 | payload 匹配 `design/16` §14，合同 / 周期存在 | 不以 0 值静默通过 |
| 经脉地点 / 指点许可 | 强 | payload 符合 `design/15` §5.6；师父、经脉与地点引用存在 | 不增加冲穴进度，记录可修复内容错误 |
| `lgs_*` / `cache_*` / `frag_*` 与传承 intent | 强 | 引用与 payload 符合 `design/20` §10、§12；任务 effect 与传承收据键均唯一 | 整个阶段 / 物品 / 收据 / RNG 事务回滚 |
| Ink story / knot | 强 | 编译成功、结构同构、opcode 白名单 | 播放预写回退，不改状态 |
| AI 人设卡 | 可选 | 存在时符合 `tech/08` §9 | 关闭 AI，继续本地 Ink |

`design/15`、`design/16` 已落盘，相关引用必须通过它们的正式 schema 解析；本文 `fixture:true` 示例使用测试注册表中的对象，生产任务不得借 `optional`、旧别名或默认 0 绕过缺失依赖。`tech/05` §10 当前仍把任务结构标作 provisional，运行时对齐事项见 §14.2。

---

## 12. 本文新增术语与 ID

### 12.1 术语与运行时约定

| 术语 / 字段 | 定义 | 归属 / 用途 |
|---|---|---|
| `QuestDef` | 不可变任务定义：条件、阶段、出口、效果、追踪和来源 | 本文 §1–§3、§11.1 |
| `QuestInstance` | 某存档中的任务状态差量 | 本文 §1.2、§11.1 |
| `ConditionExpr` | 每个节点恰有一个操作符的无副作用条件 AST | 本文 §2.2；`tech/04/05` 实现 |
| 动作 intent | Ink / UI 提交、尚未生效的声明式动作请求 | 本文 §2.3、§2.5 |
| `effectId` | 由不可换义的 `<questId>/<stageId>/<effectLocalId>` 生成；不得使用数组下标 | 奖励与事件去重 |
| `branchKey` | 玩家走过的语义分支键；独立于目标阶段 ID | 后日谈、重逢与日志 |
| `routeTone` | `righteous/shadow/mixed`，描述当前任务路线而非永久阵营 | 本文 §8.1 |
| `SectProgressionPolicy` | 在 `design/17` 的组织资料之上追加加入、晋升、纪律、状态效果与 L5 策略 | 本文 §6、§11.3 |
| `sectTrainingMult` | 本文从当前门派状态效果按 `sourceKey` 去重合并后，输出给 `design/05` 的单一武学经验倍率；默认 1.00，少林剃度且修炼少林武学时 1.10 | 本文 §6.7、§11.3 |
| L1–L5 | 外门 → 入门 / 内门 → 亲传 / 闭门 → 长老级 → 掌门级 | AR-07；显示称谓只读 `design/17` |
| `primarySectId` | 当前唯一领取月钱 / 配给并常规晋升的正式身份 | 本文 §6.9 |
| `rank5SectId` | 本书界唯一掌门级身份；空值表示尚未到达 L5 | 本文 §6.9、§11.3 |
| 门议 | L5 每月以有限行动选择传艺、救济、巡防、外交等事务 | 本文 §6.11 **（原创扩展）** |
| `NpcInteractionBinding` | 任务对 `design/18` 人物 / 关系 / 招募 / 画像及 `design/11` 地点日程的引用层 | 本文 §5、§11.2 |
| 主线路线码 | `q_NN_main_<c\|z\|x>_nn` 中的 `c/z/x`；分别表示共有 / 正 / 邪路线 | 本文 §1.1、§2.6；属于十四书界正式任务 ID |
| 稳定选择节点 | `dc_NN_nn`；映射到唯一父任务、阶段与选项 `branchKey` | 本文 §2.6；全局登记但不是任务 ID |
| 剧情迁移 manifest | 逐章保存来源别名、正式任务 / 阶段、选择分支、局部状态公式和未映射项的构建输入 | 本文 §2.6；内容管线消费 |
| `LegacyQuestFact` / `LegacyQuestIntent` | `design/20` 领域状态的只读查询与六项受控动作；任务层只收口 AST / opcode、事务和幂等适配 | 本文 §2.2–§2.3、§11.4；领域语义见 `design/20` §10 |
| `moneyWen` | 当界现金的整数文账本；`1 两=1,000 文` | 本文 §9.1 |
| `recipeMastery` | 每张已学菜谱 1–10 的独立熟练度，不是第十一项技艺 | 本文 §10.4 **（原创扩展）** |
| `practiceKey` | 生活技能一次可计成长操作的稳定去重键 | 本文 §10.1 |

`NpcDef`、招募难度、羁绊等级、同伴状态与重逢不是本文新增术语，均引用 `design/18`。`SectDef`、时代状态码和 T01–T12 也不在本文重定义，均引用 `design/17`。

### 12.2 ID、局部键与夹具登记

| 对象 | 规范 | 本文状态 |
|---|---|---|
| 任务 | 十四书界主线 `q_<NN>_main_<c\|z\|x>_<nn>`；其余 `q_<NN>_<side\|faction\|bond\|qiyu>_<nn>`；终局例外 `q_15_main_<nn>` | §3 七项均为 `90/91` 测试夹具，不进入生产注册表 |
| 旧简式主线 / 选择节点 | 迁移源 `q_NN_main_nn` / 正式 `dc_NN_nn` | 前者须显式映射到带路线码任务且不得进入生产注册表；后者登记并映射父任务、阶段与 `branchKey` |
| 阶段 / 转移 / 效果 / 检定 | `st_*` / `edge_*` / `fx_*` / `chk_*` | 只在所属任务内唯一；不是全局游戏对象 ID；转移不用已归地形的全局前缀 `tr_*` |
| 旗标 / 计数器 | `fl_*` / `cnt_*` | 本文 DSL 局部命名约定；必须由所属任务预登记 |
| 门规 | 文本键 `rule.<sect>.<name>` 或所属策略局部 `key` | 不新增全局 `rule_*` 开关 |
| 经营引用 | 已定 `rp_*` / `biz_*` / `sv_*`；其余用带命名空间的局部 ref | ID 本体归 `design/11/16` |
| NPC / 门派 / 城市 / 区域 | `npc_*` / `sect_*` / `city_*` / `rg_*` | 全部引用 18 / 17 / 11，不由本文登记 |
| 菜谱 | `rc_*` | 引用 `design/10`；`recipeMastery` 以菜谱 ID 为键 |

本文占用但不发布的任务夹具为：

```text
q_01_main_c_90    q_04_faction_90   q_05_bond_90
q_13_bond_91      q_08_side_90      q_07_faction_91
q_06_qiyu_90
```

正式章节不得复用上述 fixture 含义；若确需同号，须先把夹具迁至测试命名空间，并保证生产扫描排除。`anran_bieli` 是 `skills-daojia` 已登记的存档旗标，本文只规定其可靠写入条件，不另建同义 ID。

`q_04_bond_97`“八臂旧号”的唯一内容定义见 `chapters/04-yitian` §6.2；按基准 §18，书界支线归章节文档，本文只提供任务 DSL、迁移 manifest 与校验契约，不再登记第二份任务定义。其阶段、条件、失败保底与奖励事务仍须由倚天迁移 manifest 按 §2.6 导入 `quest.v1`，不得从本引用反向生成完整任务。

---

## 13. 数据校验规则与测试用例

### 13.1 构建期强校验

| ID | 级别 | 校验规则 |
|---|---|---|
| QST-V01 | error | `schemaVersion` 恰为 `quest.v1`，根对象含 `titleKey`，人物集合使用 `subjectNpcIds`；拒绝旧数值版和 `ownerSect` / `subjectNpc` 别名；正式任务 ID 匹配 §1.1 正则、全仓唯一；`chapterId` 与两位书界号一致；fixture 被生产发现器排除 |
| QST-V02 | error | `kind` 仅五类；至少一阶段、一个入口和一个终态；所有阶段从入口可达，除显式等待外无闭合死环 |
| QST-V03 | error | 每阶段 ID、转移 ID、检定 ID 和效果 ID 在其作用域唯一；转移目标、失败目标、恢复目标都存在；可追踪阶段有 `objectiveKeys`，终态有 `endingKey` |
| QST-V04 | error | 同一阶段同优先级出口不得条件重叠；非穷尽分支必须有兜底；`branchKey` 稳定且同任务唯一 |
| QST-V05 | error | 条件节点恰有一个操作符；字段、比较运算、动作均属白名单；禁脚本、动态属性、运行时文件 / 网络和隐式 RNG |
| QST-V06 | error | `check.id` 唯一；概率钳在 0–1；第一次结果持久化；`when` 内不得随机 |
| QST-V07 | error | 每项持久效果声明唯一且不可换义的局部 `id`，派生稳定 `effectId` 时不得使用数组下标；完成、奖励与事件同事务；同一 effect 重放不改变第二次状态 |
| QST-V08 | error | 主线无永久不可恢复的 `expired/failed` 死路；任何期限都用世界时间且接受前明示 |
| QST-V09 | error | 任务经验只用 `design/13` 已登记 `expKind`、合法 `levelRef` 与倍率；非战斗旁路和战斗路线经验差在 ±10% 内 |
| QST-V10 | error | 金钱 / 可售物写唯一 `sourceBucket`；每书界实际总收入在目标 90%–110%，七桶总和 100%，相邻来源调剂不超过 ±5pp；资产换形不得重复计新价值 |
| QST-V11 | error | `npc_*` 存在于 `design/18`，当代活体 appearance 与年份相交；D4/D5 招募不得跳过其任务、价值与窗口门槛 |
| QST-V12 | error | `sect_*` 恰来自 `design/17`；加入时状态为 `O`，或 `H` 且已发现；`P/N/D/M` 不得常规加入 |
| QST-V13 | error | 门派策略恰有 L1–L5，贡献 / 声望 / 年资非递减，`stipendTier/resourceTier` 逐级 1–5；L5 不自动授予天级武学 |
| QST-V14 | error | 同一书界 `rank5SectId` 最多一个；同一周期只可从 `primarySectId` 领取一次月钱和配给 |
| QST-V15 | error | 正式 `city_*` / `rg_*` / `res_*` / `rp_*` / `biz_*` / `sv_*` / `job_*` 引用存在且时代可用；`estate` 条件 / 动作逐字段匹配 `design/16` §14；黑木崖等无城地点允许 `cityId:null + placeKey` |
| QST-V16 | error | 品德动作单项在 −15～+15；虎爪 −3、生死符 −10；`morality` / `fame` 分别钳到 −100～100 / 0～9,999 |
| QST-V17 | error | 书眠事务只把当界 `fame` 累加 `fameTotal` 一次，随后归零；现金、门派身份和当界经营状态清零 |
| QST-V18 | error | 技艺 ID 恰为十项闭集，值在 0–100；未达 `T(g)` 禁止尝试；`gMax` 钳在 12；烹饪不得读 `alchemy` 或新增 `cook` |
| QST-V19 | error | AI 提案每次 ≤3 项；好感单项 −1..+1、每段累计绝对值 ≤3；旗标已登记；禁止其他持久效果 |
| QST-V20 | error | 所有 YAML 可无损转 JSON；禁止 anchor、alias、merge、多文档、重复键、未知键、NaN / Infinity 与隐式日期 |
| QST-V21 | error | 99 个规范 `sect_*` 与 `design/17` 集合相等；每个有 14 个状态；计数矩阵逐格、逐列等于 §7.3 |
| QST-V22 | warning→发布 error | 原创、待考和建议值有规范标注；正式内容不得含 fixture 名、占位依赖、未完成标记或省略正文的占位语 |
| QST-V23 | error | 十四篇剧情稿各有显式迁移 manifest；所有正式 `q_NN_main_<c\|z\|x>_nn` 与 `dc_NN_nn` 均唯一并相互可解析，旧简式 `q_NN_main_nn` 均显式 remap，`unmapped=[]`；旧简式本身不进入生产注册表 |
| QST-V24 | error | 迁移后保留所属章的立场公式、阈值、换线次数 / 意图 / 覆写、不可逆警告与失败兜底；局部立场键和 `st_/edge_/fx_/chk_` 不得跨任务引用，且不得覆盖全局 `morality` |
| QST-V25 | error | 传承条件只读两类六字段白名单；六个 `legacy/*` opcode 与 `design/20` §10 一一对应；effect / receipt 双幂等键、阶段、物品、收据与 RNG 必须同事务，禁止直接写领域数组或进度 |
| QST-V26 | error | `sectTrainingMult` 只由本文从当前 `modifierStates` 与策略 `membershipEffects` 派生；同一 `sourceKey` 只计一次，消费者不得逐效果复乘；当前仅允许 `sect.shaolin.tonsured=+1000bp` 且只命中 `sect_shaolin` 武学 |

`error` 阻断内容构建。`warning` 只能在策划复核后带负责人、原因和期限豁免；发布候选不接受无期限豁免。`design/15/16` 引用必须按正式判别联合校验；只有 `fixture:true` 可解析测试注册表对象，正式任务引用 fixture 或旧 provisional opcode 一律触发 QST-V15 / V20。

### 13.2 任务图、事务与界面测试

| ID | 输入 / 操作 | 精确期望 |
|---|---|---|
| QST-T01 | 加载 §3 七个任务夹具 | 七个 `q_*` 唯一、YAML 解析成功、所有阶段 / 出口可解析、生产发现器结果为 0 个 fixture |
| QST-T02 | 给同一阶段两个 `priority:10` 且都恒真的出口 | QST-V04 失败，不能依 YAML 数组顺序偷偷选路 |
| QST-T03 | `q_01_main_c_90` 战斗胜 / 负各走一次 | 都抵达 `st_close`；只生成一次经验与 `fame +120`；原著锚点不中断 |
| QST-T04 | 在奖励事务提交后，以相同 `effectId` 重放三次 | 经验、金钱、物品、贡献和关系值均不再增加 |
| QST-T05 | 概率检定失败后存档重载 20 次 | `checkResults[checkId]` 不变，始终进入相同失败出口 |
| QST-T06 | 主线阶段在期限前未完成 | 只能转预先声明的替代阶段；不存在永久锁死且无锚点出口的存档 |
| QST-T07 | 追踪隐世门派 `H`，尚未发现入口 | 只显示传闻区域；不显示精确坐标，不自动把状态改为 `O` |
| QST-T08 | 当前目标 NPC 因剧情换位 / 死亡 | 前者由 `design/11` 日程解析器按任务覆写优先级更新；后者走继承 / 失败出口，不生成同名替身 |
| QST-T09 | AI 提案含 `affinity_delta:+2`、发物品或未登记旗标 | 三者分别因超单项、禁用类型、旗标越权被拒；预写 Ink 仍可继续 |
| QST-T10 | `bond=59/60` 的当界同伴离队 | 59 不写；60 写一次 `anran_bieli`；转留守位置不写 |
| QST-T10A | 将 `q_12_main_z_09` 按字符串去掉 `z` 自动编号 | QST-V23 失败；带路线码 ID 必须原样保留，阶段只在该正式任务内迁移 |
| QST-T10B | 将 `dc_08_08` 注册为任务，或让 `stance12` 写入 `morality` | 分别因对象类型错误、局部状态越权触发 QST-V23 / V24；正确结果为 `dc_08_08` 指向唯一父任务 / 阶段 / `branchKey`，立场保持章内状态 |
| QST-T10C | `story/08` 输入旧简式 `q_08_main_01`～`18` | 十八项都须显式映射到唯一带 `c/z/x` 的正式任务；十个 `dc_*` 保持稳定 ID 并逐项登记父任务、出口、效果和公式，且 `unmapped=[]` |
| QST-T10D | 同一 `legacy/resolveOpportunity` 在奖励提交后以相同 effect / receipt 重放，或在发卷后故障回滚 | 重放不再消费 RNG / 发卷；故障时阶段、卷、机会收据和 RNG 全部恢复到提交前 |

### 13.3 门派、声望与书眠测试

| ID | 输入 / 操作 | 精确期望 |
|---|---|---|
| QST-T11 | `sect_wudang` L1、贡献 299 / 300，其他 L2 条件均满足 | 299 不可晋升；300 可进入考核，不直接晋级 |
| QST-T12 | 贡献 6,000、地阶 8 重、声望 1,600、年资 89 / 90 日 | 89 日不可进入 L5；90 日只开放继承任务，完成且当界无其他 L5 才晋级 |
| QST-T13 | 已为甲派 L5，乙派处于 L4 时调用 `sect/claimRank` | 事务拒绝；乙派可冻结于 L4 或走故事指定非 L5 终点 |
| QST-T14 | 同时有两派正式身份，同一月分别领月钱 | 仅 `primarySectId` 可领；第二次及非主派请求均拒绝 |
| QST-T15 | 对 `P/N/D/M` 状态组织执行常规加入；对未发现 `H` 执行加入 | 全部拒绝；`H` 发现后仍须通过入门条件 |
| QST-T16 | 对临时敌对但非邪派目标首次 / 再次用虎爪绝户手 | 首次品德 −3 并记武当 2 级违纪；同场后续不重复扣 |
| QST-T17 | 对两个非敌对 NPC 各施一次生死符，再对第一人重复一次 | 三次各品德 −10，三条受害者事件均保留；总计 −30 后钳制 |
| QST-T18 | `fameTotal=900, fame=250`，同一书眠事务因崩溃重试 | 首次结果 `fameTotal=1,150, fame=0`；重试仍为 1,150 / 0 |
| QST-T19 | 聚合 §7.3 十四行 | 每行合计 99；总单元 `99×14=1,386`；O/H/P/N/D/M 六列总和也为 1,386 |
| QST-T19A | 同一角色修炼少林 / 非少林武学；依次处于俗家、剃度、冻结、还俗与书眠后状态，并重放相同 `sourceKey` | 只有“剃度 + 未冻结正式少林成员 + `skillSectId=sect_shaolin`”输出 1.10；其余均为 1.00，重放不变成 1.20 |

### 13.4 经济与生活技能金标准

| ID | 输入 / 算式 | 精确期望 |
|---|---|---|
| QST-T20 | 玄中主武器 `P0=2 两,g=5` | `2×2.2^4=46.8512 两`，UI 两位有效数字 47 两 |
| QST-T21 | 上项，`cha=50,speech=40`，两项 shop 倍率均 1 | 买价 `46.8512×1.00×0.96=44.977152 两`；最终以文取整为 44,977 文 |
| QST-T22 | 上项普通专营店出售 | 倍率 `0.35+0.0015×50=0.425`；`46.8512×0.425=19.91176 两`，19,912 文 |
| QST-T23 | 笑傲主流品阶 5、30 分钟支线 | `I≈2×47=94 两/时`；任务段预算 47 两，现金上限 `94×0.5×0.70=32.9 两`，配表 33 两；任务物价值从同段余额扣 |
| QST-T24 | 同一物品经任意合法买入、折扣、回购、卖出环路 | 最终现金变化 ≤0；任务报销不可再次覆盖买入价 |
| QST-T25 | 技艺 35 尝试玄中 5 / 玄上 6 | `T(5)=36`，两者都不可尝试；技艺 36 时 5 品成功率 60%，仍不能做 6 品 |
| QST-T26 | 技艺 60 处理地中 8 | `T(8)=60`，成功率 60%；技艺 70 时同品成功率 100% |
| QST-T27 | 从技艺 0 升到 20 / 60 / 100 | 分别需 130 / 630 / 1,450 次成功使用 |
| QST-T28 | 菜谱熟练 1 升 10 | 成功批数 `3+4+…+11=63`；不改变十项技艺中的 `alchemy` |
| QST-T29 | 菜谱熟练 6，主材 6 品，配方上限 9 | `cookValue=60`；`gCook=min(9,7,8)=7`；`T(7)=52`，成功率 92% |
| QST-T30 | 书眠时有现金、材料、成品、资源点、家丁、菜谱熟练 | 现金、材料、成品、资源点和家丁五类当界状态清除；菜谱知识与 `recipeMastery` 按建议值保留 |
| QST-T31 | 汇总十四界 `I×H` | `H=162`，总净值 `B=16,626.2 两`；七桶显示为 6,650.5 / 4,156.6 / 1,662.6 / 1,662.6 / 1,330.1 / 831.3 / 332.5 两，总份额 100% |
| QST-T32 | 天龙 `I=19,H=15`；倚天 `I=460,H=15` | 总值分别 285 / 6,900 两；新增营生 + 资源点 + 门派 + 其他分别为 71.25 / 1,725 两，均等于总值的 25% |
| QST-T33 | L3 月钱，天龙 `I=19`，完成职责 3/4 | 现金 `round10(19×0.10×0.75×1000)=1.43 两`；资源额度 `floor(19×0.07×0.75×1000)=997 文`；总值至多 2.427 两 |
| QST-T34 | 师父指点与名门静室同时生效 | 前者 `+1500/+800/+500bp`，后者速率 / 成功 `+1000/+600bp`；不同来源加算后交 `design/15` 各槽上限钳制，不相乘 |

### 13.5 人工审校清单

1. 每条主线 / 羁绊 / 门派任务逐幕核对 `design/story/*` 的锚点、不可逆警告、正邪路线与 NPC 生死窗口；不得用测试夹具替代正式剧情。
2. 所有原著组织、人物、招式与事件按三联 / 广州修订版逐字核对；没有把握的条目保留 **（待考）**，不得补造引文、回目号、人物或招名。
3. 每个正式门派逐时代人工复核 `O/H/P/N/D/M` 与地点可达性，尤其是合并、改名、前身、族群 / 政权和古龙跨作品投放。
4. 每条任务至少演练成功、拒绝、失败 / 超时、NPC 不可用、背包满和读档重放；主线另测改命与原著锚点回流。
5. 每书界跑全经济模拟，分别记录任务、战利品、敌人现银、城市营生、资源点、门派、赌场 / 其他七桶与主要回收口；总份额必须 100%，不得只看现金总额。

---

## 14. 待决事项 / 依赖

### 14.1 替下游给出的建议值

以下建议值是当前可实现默认，不取代归属文档定稿；下游落盘或完成实测后，应保留条目并改写为“已解决：……（见 X §Y）”。

| 编号 | 下游 | 本文给出的建议值 / 接口 | 本文落点 |
|---|---|---|---|
| Q12-D01 | `design/14` | 日志同屏 1 条主追踪 + 至多 3 条地图辅助钉选；只显示已知位置，期限最后 20% 变色 | §4.4 |
| Q12-D02 | `design/18` | 同一可重复赠礼来源每 NPC 每游戏日好感收益至多 +5；AI 好感每项 −1..+1、每段累计绝对值 ≤3 | §5.3、§5.7 |
| Q12-D03 | `tech/08` / 内容制作 | 每个启用 AI 闲聊的 NPC 至少有普通、网络失败、内容拒绝三类预写回退；模型只能调用 `propose_effects` | §5.7 |
| Q12-D04 | `design/16` | **已解决：**L1–L5 传 `stipendTier/resourceTier=1..5`；绝对月钱、配给品阶、职责比例、周期和断供已由 `design/16` §10 定稿，同派兼职、非主派与同周期重复请求不叠领 | §6.4、§6.9、§9.5 |
| Q12-D05 | `design/16` | **部分解决：**营生、资源点、门派与赌场等已纳入 `design/16` §12 的 40/25/10/10/8/5/2 七桶；掌门每游戏月 2 点门议行动、未用不累积仍是本文建议值，待玩法实测 | §6.11、§9.5 |
| Q12-D06 | `design/13` | 同模板善举每日品德累计至多 +3；同一战只取最高一项战斗名望；继续沿用 `fameTotal≥20,000` 的“名满天下”修饰 | §8.2、§8.4 |
| Q12-D07 | `design/14` / `design/10` | 城市专营 / 杂货 / 门派内库 / 黑市 / 当铺的 `shopMul` 为 1.00 / 1.05 / 0.90 / 1.25 / 1.10；库存按普通店 3 日、内库月结刷新 | §9.2、§9.4 |
| Q12-D08 | 章节经济表 / `design/16` | 标准玩家中点可动现金为 2–4 小时收入、结局前 3–6 小时；偏离时先查来源结构与消耗，不直接没收 | §9.3 |
| Q12-D09 | `tech/05` | 同一 `practiceKey` 每游戏日前 3 次成功操作可增长技艺，第 4 次起只给产物；口才每命中一项线索使 DC −5，最多 −15 | §10.1、§10.6 |
| Q12-D10 | `design/10` / `13` / 存档 | 菜谱熟练 1–10，1→10 需 63 批成功；菜谱解锁与 `recipeMastery` 作为学识跨书界保留，材料与成品不保留 | §10.4、§10.7 |
| Q12-D11 | `tech/05` | `inventory/changed`、`world/locationEntered`、`world/timeAdvanced` 与 `sect/joined` / `sect/promoted` / `sect/left` 暂按“域/过去式”使用；正式事件名、载荷和任务接取事件仍待运行时 schema 冻结 | §1.5 |
| Q12-D12 | `design/05` / `tech/05` | **已解决：**本文输出合并后的单一 `sectTrainingMult`；默认 1.00，少林剃度且修炼少林武学时 1.10；消费者恰乘一次 | §6.7、§11.3、§13.3 |

### 14.2 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| 作者 AR-04 / `design/11` / 地图 YAML | **已解决：**使用一张全局地图与时代图层；99 个组织以全局 `city_*` / `rg_*` 表示驻地，NPC 查询携带 `chapterId + year + eraLayer` |
| 作者 AR-07 / AR-08 / `design/17` | **已解决：**99 个规范组织、14 界六态矩阵、12 个模板族 / 13 个具体称谓模板为资料源；本文只定义 L1–L5 机械晋升和任务规则 |
| 作者 AR-09 / `design/18` | **已解决：**人物本体、D1–D5、R0–R6、生卒、编组、成长、离队与 U0–U5 重逢归 18；活动编组清空不等于关系与能力快照消失 |
| `design/03` | **已解决：**十项技艺均为 0–100；品德为 −100～100，声望为当界数值；制作 / 社交检定公式沿用 §8 |
| `design/05` 与各武学图鉴 | **已解决：**职级只开放目录，学习仍逐条检查 `reqs`、师父、来源品阶和层数上限；虎爪绝户手的品德代价为 −3；本文按 §6.7 输出唯一 `sectTrainingMult` |
| `design/09` | **已解决：**主角 + 同伴上场总数 ≤6；合击效果、站位和战斗 AI 不由任务文档重定义 |
| `design/10` | **已解决：**`1 两=1,000 文`、品阶价格、供货上限、丹药 / 菜肴 / 锻造事务和来源物品为经济与制作锚点 |
| `design/13` | **已解决：**任务经验种类 / 权重、改命与结局品德条件、书眠成长规则为奖励与结局上游 |
| `tech/04` | **已解决：**内容采用 strict schema、JSON-compatible YAML、Ink 仅提交受控 opcode；本文补充任务 AST 与命令白名单 |
| `tech/08` §9 | **已解决：**AI NPC 默认关闭，唯一工具是 `propose_effects`；任何提案都须由 core 二次校验后才写状态 |
| `design/15` | **已解决：**本文发 `meridian/grantMasterGuidance` / `meridian/unlockPracticeSite`，payload 使用其 §5.6 的 `MeridianGuidance` 与 `meditationQuality`；冲穴、穴位和周天仍只由 15 计算 |
| `design/16` | **已解决：**经营条件 / 动作使用其 §14 判别联合；月钱读取 §10，七桶与十四界预算读取 §12；本文不重定义工资、产量、职位或家丁成长 |
| `design/20` | **已解决：**§2.2–§2.3 已正式收口两类传承只读事实、六项 `LegacyQuestIntent` 的任务 opcode、双幂等键与原子回滚；源生命周期、概率、卷位、缓存和校合仍只由 20 定义 |
| `tech/05` | **已落盘但待同步：**§10 已实现 provisional 任务状态、事务、稳定 RNG 与 Ink 桥，且已冻结 `quest/advanced`、`quest/succeeded` / `quest/failed`；需改为消费本文正式 `QuestDef`、`effectId`、优先级出口和 `estate/<kind>` 适配层，并冻结 Q12-D11 的其余事件 schema |
| `design/story/*` / `chapters/*` | **已接收迁移接口：**§2.6 已冻结正式路线码、`dc_*`、章内立场值与旧字段迁入 `quest.v1` 的规则；仍须逐章产出显式 manifest 与正式任务文件，并把旧简式主线逐项 remap。本文七个 `90/91` 号对象仅为 schema 夹具，不得冒充正式剧情任务 |

### 14.3 对基准的修改提案

> 只登记提案，不修改 `docs/00-canon.md`；已由高优先级作者需求解决的冲突仍保留追溯。

| 编号 | 提案 | 理由 / 建议落点 |
|---|---|---|
| Q12-P01 | **已解决：**把基准 §3“队友不随书眠跨界”解释为活动编组、当界装备与当前位置不直接跨界；招募史、关系与能力快照保留，健在者可依 AR-09 重逢再入队（见 `design/18` §6） | AR-09 已明确覆盖绝对禁跨界旧句；事实源应消除歧义，避免下游继续写“永别” |
| Q12-P02 | 基准 §18 增补：门派历史 / 时代开放 / 驻地 / 称谓唯一归 `design/17`，NPC / 同伴唯一归 `design/18`，任务与门派流程 / 经济 / 生活技能仍归本文 | AR-08 / AR-09 已建立新资料域，需消除当前 §18 的旧总括归属 |
| Q12-P03 | 基准 §12 将区域示例从书界局部 `rg_<书界号>_*` 改为全局 `rg_<拼音>`，并登记任务 DSL 局部键、事件和运行实例不属于全局内容 ID | AR-04 已采用统一大地图；旧示例会诱使章节重新建立十四套区域 ID |
| Q12-P04 | 基准 §6 / §18 明示烹饪不读取 `alchemy`；若不增 `cook`，采用按 `rc_*` 保存的菜谱熟练度作为独立学识 | 当前基准只说“不新增 cook”，而 `design/10` 仍遗留“alchemy 代行”旧句；需给实现唯一输入且不污染炼丹 |

### 14.4 原著考据待办

| 编号 | 范围 | 待核事项 | 未确认时的安全处理 |
|---|---|---|---|
| Q12-K01 | 99 个组织 | 按三联 / 广州修订版逐条复核金庸组织名称、性质、驻地、人物关系与书内出现位置；古龙 15 组织另以正式出版文本复核 | 继续以 `design/17` 为唯一源，保留其 **（待考）**，本文不补造引文或回目号 |
| Q12-K02 | 跨时代门派 | 华山、少林、武当、丐帮、峨眉、昆仑、崆峒、青城等是否有文本证据证明连续世系 | 复用组织 ID 只代表玩法归并；不据此断言师承 / 血缘连续 |
| Q12-K03 | 小派与敌对线 | 太白三英、秦家寨、渤海派、金龙帮及清代掌门大会小派的准确称谓、成员、兵刃和关系 | 只引用 `design/17` 概述；任务人物 / 招名未核前标 **（待考）** 或 **（原创扩展）** |
| Q12-K04 | NPC 招募与重逢 | 每个 D4 / D5 人物的专属链、时机、生死与改命事实是否符合指定版本 | 正式任务未逐字核完不得解除 `design/18` 的窗口 / 后果门槛 |
| Q12-K05 | 行为后果 | 原著情节中哪些目标可确认为“邪派首恶”、哪些离队 / 倒下满足黯然销魂掌触发语义 | 默认从严：临时敌对不等于邪派；只有已确认事件可写 `anran_bieli` |
| Q12-K06 | 聚贤庄夹具 | §3.1 的人物、救场结果与介入边界需在《天龙八部》对应情节逐字校订 | 夹具保持 **（原创扩展）** 的结构用途，不作为正式剧情事实源 |

### 14.5 开放问题（附默认值）

| 编号 | 需作者拍板 / 待归属文档冻结 | 本版默认值 / 理由 |
|---|---|---|
| Q12-O01 | 同时加入多个正式门派应一律禁止，还是允许逐对兼容 | 默认允许，但任意两派都必须显式 `dualFormal=allow`；缺字段按拒绝，且只有 `primarySectId` 晋升和领配给 |
| Q12-O02 | 每书界可担任几个掌门级职位 | **已解决：AR-07a 为至多一个。** 第二派冻结 L4 或走非 L5 故事终点 |
| Q12-O03 | 99 个组织是否都必须提供可玩的 L5 | 默认否；本文门派策略依据 `design/17` 的称谓与政治边界设置 `rank5Policy.playableMode=nonPlayable`，但章节须给辅佐、护法、总教头或盟主等不缩水终点 |
| Q12-O04 | AI 闲聊是否可直接影响任务 / 招募 / 羁绊 | 默认绝不允许；仅可提议微量好感或当前节点预登记旗标，core 可拒绝且预写 Ink 必须独立可通关 |
| Q12-O05 | 烹饪是否新增第十一项 `cook` | 默认不新增；采用 §10.4 的 `recipeMastery[rc_*]`，并明确 `alchemy` 只用于炼丹 |
| Q12-O06 | 菜谱熟练是否跨书界保留 | 默认作为已学学识保留；食材、成品、厨房和进行中批次清除 |
| Q12-O07 | 图鉴索引未完整落地的组织如何处理 | 默认继续引用 `design/17` 的待收录索引，不让生产任务直接授予尚无 literal `sect_*` / `sk_*` 绑定的候选武学；明确待补的是 `sect_taibai`、`sect_qinjiazhai`、`sect_bohai`、`sect_jinlongbang`。`sect_zhuwulianhuanzhuang` 的候选武学已在 `skills-wujue` 建档，但图鉴明确仅供 NPC 残传、不给玩家来源，故不计作“完全缺失”，正式授艺仍禁止 |
| Q12-O08 | 正式任务遇到依赖缺失或旧 provisional opcode 能否降级上线 | **已解决：不能。** `design/15/16` 已落盘；仅 `fixture:true` 可引用测试注册表，生产构建遇缺失引用、旧 `livelihood/resource/household` opcode 或默认 0 结算直接失败 |

至此，本文发现的旧待决事项均未静默删除：已由 AR-07 / AR-09 等解决者保留“已解决”追溯，其余均带默认值继续设计。
