# 06 · Buff 体系（Buff System）

> **归属**（基准 §18）：Buff 规则与完整目录——数据结构、品阶强度与品阶对抗、叠加与冲突、持续与结算时机、触发器与效果原语（DSL 语义）、驱散与免疫、蛊毒专章、UI 表现规则、平衡约束。
> **上游**：`00-canon.md`（§4 品阶、§6 属性 ID、§7 兵器类别、§8 战斗模型与"回合"定义、§9 乘区、§10 Buff 基础规则、§12 ID 规范、§13 天级武学、§14 神兵）。
> **引用而不重定义**：属性形态与修饰种类（`flat`/`flatLv`/`pct`/`mult`/`pp`）→ `design/03-attributes.md`；伤害、治疗、命中/招架/暴击、效果命中公式 → `design/04-damage-formula.md`；武功被动、招式 `buffs` 字段、层数系数、辅运比例、走火入魔触发条件、"破 X"的获取 → `design/05-martial-arts-system.md`；套装 → `design/07-set-system.md`；地形与轻功 → `design/08-terrain-and-qinggong.md`；集气/反击/合击/AI/Boss 阶段 → `design/09-combat-system.md`；物品与丹药 → `design/10-items-and-equipment.md`；时辰/昼夜/节令 → `design/11-open-world.md`；NPC 与任务 → `design/12-quests-npc-factions.md`；天书之力、难度模式 → `design/13-progression-and-endings.md`；DSL 解释器实现 → `tech/05`（玩法引擎）。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需以三联/广州修订版逐字核对；**【建议值】** = 依赖他文档、本文先给出可用数值并在 §15 登记。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标、核心概念、三大类的判别规则 | 全体 |
| §2 | 数据结构：`BuffDef` 字段表、`BuffInstance`、表达式语言、3 个完整 YAML 示例 | 程序、配表 |
| §3 | 品阶体系：来源品阶、强度系数、大阶特性、12 档速查表、**品阶对抗公式** | 数值、程序 |
| §4 | 叠加与冲突：四种叠加规则的精确语义、同族合并、增减益抵消、元素反应、乘区对照 | 数值、程序 |
| §5 | 持续与时机：持续类型、回合结算顺序、伤害结算插入点、战斗外持续、永久被动 | 程序、战斗 |
| §6 | 触发器与效果原语：事件钩子全集、条件、目标选择器、原语全集、防循环 | 程序（tech/05） |
| §7 | 驱散与免疫：驱散类型、免疫/抵抗/驱散/无敌的区别、标签体系 | 数值、策划 |
| §8 | **Buff 目录**（数值类、效果类、破兵系列、控制、架势、机制类、杂项、武学专属，共 198 条；连同 §9 蛊类 10 条合计 208 条） | 配表、策划 |
| §9 | **蛊毒专章**（蛊的生命周期、跨战斗、周期发作、解法，含 10 条蛊类 Buff） | 策划、数值 |
| §10 | UI 表现规则：图标边框、极性、叠层、剩余回合、说明模板、飘字、战斗日志 | UI、程序 |
| §11 | 平衡约束：数值上限、数量上限、机制类冷却、Boss 豁免 | 数值 |
| §12 | 与其他系统的接口（武功/套装/地形/物品/AI/天书之力/书眠） | 全体 |
| §13 | 数据校验规则与测试用例 | 程序 |
| §14 | 本文新增术语与 ID | 全体 |
| §15 | 待决事项 / 依赖 | 全体 |

---

## 1. 设计目标与核心概念

### 1.1 设计目标

| # | 目标 | 落地手段 |
|---|---|---|
| B1 | **一眼可读**：任何 Buff 一句话说得清，玩家能预判后果 | 说明文本模板化并代入实数（§10.4）；同一效果只有一种写法；机制类数量受限（§11.2） |
| B2 | **品阶有意义**：天阶的毒不是黄阶的毒 ×3.5 那么简单 | 数值随品阶系数 G 放大（§3.2）＋ 大阶解锁质变特性（§3.3）＋ 品阶对抗让低阶免疫/驱散"挡不全"高阶效果（§3.5） |
| B3 | **反制有路**：任何强减益都至少有 2 条解法 | 驱散类型 8 种（§7.1）；目录"驱散"列强制非空（蛊/受制类为"专"，§9） |
| B4 | **开放世界有牵挂**：中毒、内伤、中蛊会跟着你走出战斗 | 跨战斗持续（§5.4）＋ 战斗外恢复路径（客栈、医者、解药、任务） |
| B5 | **原著感**：北冥、吸星、化功三种"吸内"手感不同；独孤九剑"破尽天下招式" | 每个标志性武学对应一条有独立规则的 Buff（§8） |
| B6 | **完全数据驱动** | 事件钩子 × 条件 × 原语构成 DSL（§6），代码只实现解释器（tech/05） |
| B7 | **确定性** | 结算顺序全序（§5.2、§5.3）；随机只走战斗种子 RNG；同优先级按施加序号 |

### 1.2 核心概念

| 术语 | ID / 英文 | 定义 |
|---|---|---|
| Buff 定义 | `BuffDef` | 数据表中的一条 Buff 模板（本文 §2.1），以 `bf_<拼音>` 命名（基准 §12）。 |
| Buff 实例 | `BuffInstance` | 挂在某个单位身上的一份运行时状态（§2.2）。 |
| 持有者 | `holder` | 身上挂着该实例的单位。 |
| 施加者 | `source` | 施加该实例的单位（可为空：地形、剧情、物品自用时为 holder 本人）。 |
| 来源物 | `origin` | 产生该实例的武功 / 招式 / 物品 / 套装 / 地形 / 天书之力 / 系统。 |
| 有效品阶 | `g`（`gEff`） | 实例当前的品阶（1–12），经天道压制、削品后的值（§3.1）。 |
| 品阶系数 | `G` | `G(g)`，直接使用基准 §4 的武功威力系数（§3.2）。 |
| 大阶 | `tier` | `huang`（1–3）/ `xuan`（4–6）/ `di`（7–9）/ `tian`（10–12）。 |
| 层数系数（Buff） | `Lb` | 来源武功有效层数对 Buff 数值的修正：`Lb = 0.70 + 0.03 × layerEff`（§3.2）。 |
| 叠加键 | `stackKey` | 决定"两次施加是否视为同一个 Buff"的键（§4.2）。 |
| 族 | `family` | `fam_<名>`：作用于同一属性/同一机制的一组 Buff，共享族上限（§4.3）。 |
| 互斥组 | `exclusive` | `exg_<名>`：同组只能存在一个（如架势）。 |
| 标签 / 子标签 | `tags` / `subTags` | 用于免疫、抵抗、驱散匹配（基准 §10 的 12 个主标签 + 本文 4 个提案主标签 + 点号子标签，§7.4）。 |
| 品阶对抗 | `gradeContest` | 免疫/抵抗/驱散与效果之间按品阶差 Δ 计算穿透（§3.5）。 |
| 穿透系数 | `ρ(Δ)` | 高品阶效果穿透低品阶免疫/抵抗/防护的比例（§3.5）。 |
| 削品 | `gradeErode` | 驱散方品阶不足时，不移除效果而是降低其品阶（§3.5.3）。 |
| 永久被动 | `passive` | 来源于内功/套装/装备/天书之力、随来源存在的常驻实例（§5.5）。 |
| 跨战斗 | `persist` | 战斗结束后仍保留、在世界时间中继续演化的实例（§5.4）。 |

### 1.3 三大类的判别规则（基准 §10）

一条 Buff 属于且只属于一类。判别按下表**从上到下**，命中即止：

| 顺序 | 判据 | 类别 | 例 |
|---|---|---|---|
| 1 | 改变**规则**本身：免疫、无敌、锁血、复活、额外行动、改变目标合法性、伤害转移/反弹整招、阵营/控制权改变、死亡流程 | `mechanic` 机制类 | 免疫中毒、无敌、再动、挪移、斗转、受制 |
| 2 | 有**触发器产生动作**（伤害、治疗、资源转移、施加/移除 Buff、位移、行动限制），或**条件性**改写判定 | `effect` 效果类 | 中毒、回血、吸内、反震、破剑、点穴、架势 |
| 3 | 只对属性或乘区做**常驻数值修饰**（可叠层，可带"获得层数"的简单触发） | `stat` 数值类 | 攻击 +X%、减伤 +X%、龙象之力 |

> 控制类（定身、眩晕、点穴、迷惑……）按判据 2 归入效果类——它们限制行动但不改写"规则"；"移魂"改变控制权，但为与迷惑并列管理仍归效果类（`mind` 标签），这是唯一的例外，已在 §8.7 注明。

### 1.4 极性

| 值 | 含义 | 规则 |
|---|---|---|
| `buff` | 增益 | 只能被 `purge`（破功）类驱散（§7.1）；不受免疫阻挡 |
| `debuff` | 减益 | 受免疫、抵抗、驱散影响；计入减益数量上限 |

混合效果（如狂势：增伤但降防；醉意：会心升而命中降）按**获得方式与净效果**判定极性：主动获得的取舍型状态为 `buff`（可被 `purge`），被动承受的为 `debuff`（如走火入魔）。极性决定 UI 边框形状（§10.2）与驱散归属，不决定数值正负。

---

## 2. 数据结构

### 2.1 `BuffDef` 字段表

| 字段 | 类型 | 必填 | 说明 / 取值 | 例 |
|---|---|---|---|---|
| `id` | string | ✅ | `bf_<拼音>`（基准 §12）；同音冲突以语义后缀区分（如破箭 `bf_poanqi`） | `bf_zhongdu` |
| `name` | string | ✅ | 中文名，≤ 4 字为佳（图标下显示） | 中毒 |
| `nameByTier` | map | | 按大阶改名（"中毒各档"） | `{huang: 轻毒, xuan: 中毒, di: 深毒, tian: 奇毒}` |
| `category` | enum | ✅ | `stat` / `effect` / `mechanic`（§1.3） | `effect` |
| `polarity` | enum | ✅ | `buff` / `debuff`（§1.4） | `debuff` |
| `grade` | `inherit` \| 1–12 | ✅ | `inherit`：取来源物有效品阶（§3.1）；定值用于系统/剧情 Buff | `inherit` |
| `gradeRange` | [int, int] | ✅ | 允许的**原生**品阶区间；数据中配置的施加品阶越界时构建期报错（§13）。运行时因外来压制低于下限属正常，不钳制 | `[1, 10]` |
| `tags` | tagId[] | ✅ | 主标签（基准 §10 的 12 个 + §7.4 提案 4 个）；**纯数值增/减益也必须打 `boost`/`weaken`** | `[poison]` |
| `subTags` | string[] | | 点号子标签（§7.4），免疫可精确到子标签 | `[poison.common]` |
| `family` | famId | | 族（§4.3）；数值类必填 | `fam_dot_poison` |
| `exclusive` | exgId | | 互斥组（§4.4） | `exg_stance` |
| `resistAttr` | attrId \| null | | 抵抗与 DOT 减免所用抗性（基准 §6 抗性 ID）；`null` 表示只用 `effRes` | `resPoison` |
| `duration` | Duration | ✅ | 见 §2.1.1 | `{type: turns, value: 3}` |
| `stack` | StackSpec | ✅ | 见 §2.1.2 | `{rule: stack, max: 5}` |
| `dispel` | DispelSpec | ✅ | 见 §2.1.3 | |
| `priority` | int 0–999 | ✅ | 同一钩子内的结算顺序，小者先（§5.2 分段） | `210` |
| `params` | map<string, expr> | | 数值参数，可写品阶公式（§2.3） | `{tickPct: "0.008*G"}` |
| `mods` | Mod[] | | 常驻修饰（数值类主体）：`modStat` / `modZone` / `modJudge` / `modCost`（§6.4），可带 `when` 条件 | |
| `triggers` | Trigger[] | | 事件触发（§6.1–§6.3）：`{on, when, chance, limitPerTurn, cooldown, ops[]}` | |
| `onApply` / `onRemove` | Op[] | | 施加/移除时执行的原语（移除含到期、驱散、死亡） | |
| `tierTraits` | map | | 大阶质变特性开关（§3.3），按 `xuan`/`di`/`tian` 追加 `mods`/`triggers` | |
| `reactions` | Reaction[] | | 与其他标签的反应（§4.6） | |
| `persist` | PersistSpec | | 跨战斗配置（§5.4）；缺省＝战斗结束即移除 | |
| `bossProfile` | map | | Boss/精英的覆写（§11.4）：`pctFactor`、`ccDR`、`immune` 等 | `{pctFactor: 0.25}` |
| `limits` | map | | 机制类约束：`cooldown`、`perBattle`、`maxDuration`（§11.3） | `{perBattle: 2}` |
| `hidden` | bool | | 持有方不可见（七心海棠潜伏期、蛊潜伏期），需"识破"（§9.3） | `false` |
| `ui` | UiSpec | ✅ | `icon`、`frame: auto`、`showStacks`、`showTimer`、`sortGroup`、`hudPin` | |
| `vfx` / `sfx` | map | | `onApply` / `loop` / `onTrigger` / `onTick` / `onExpire` 特效与音效键（素材清单归 tech/06） | |
| `text` | TextSpec | ✅ | `desc`（说明模板）、`short`（≤ 12 字）、`log`（日志模板）、`lore`（图鉴文案），语法见 §10.4 | |
| `aiValue` | expr | | AI 估值（09 使用）：正数表示"对持有者有利" | `"-2*stacks*G"` |
| `origin` | enum | ✅ | `canon` / `expanded` / `canonExpanded`（与 05 一致） | `canon` |
| `canonRef` | string | | 原著出处；不确定写"（待考）" | 天龙·莽牯朱蛤 |

#### 2.1.1 `Duration`

| 字段 | 取值 | 说明 |
|---|---|---|
| `type` | `turns` | 以**持有者自身行动**计（基准 §8）。递减时机见 §5.2 E2。 |
| | `permanent` | 永久；只随来源移除（永久被动，§5.5）。 |
| | `charges` | 触发次数计；`value` 为次数，每次触发消耗 1。可与 `turns` 组合（`maxTurns`）。 |
| | `battle` | 本场战斗结束时移除。 |
| | `world` | 世界时间计，单位 `shichen`（时辰，1 日 = 12 时辰，时间系统归 11）；只用于战斗外 Buff。 |
| | `untilCured` | 直到被指定方式解除（蛊、受制、情花毒、寒毒）。 |
| | `aura` | 光环：持有者处于光源 `r` 格内时存在，离开即移除（阵法、狮子吼持续吼声、地形场）。 |
| | `instant` | 瞬时：`onApply` 执行后立即移除（击退、牵引、迟缓），仍走免疫与抵抗。 |
| `value` | int | 回合数 / 次数 / 时辰数 |
| `tierBonus` | map | 按大阶加值，默认 `{di: +1, tian: +1}`（地阶 +1，天阶在地阶基础上**不再**额外叠加，即天阶同为 +1）；`mechanic` 类默认无加值 |
| `fresh` | `skipFirst`（默认）/ `countNow` | `skipFirst`：若在持有者**自身行动中**施加，则该次行动结束时不递减（自我 Buff "3 回合"= 此后 3 次行动）。 |
| `maxTurns` | int | `charges` 组合型的回合上限 |

#### 2.1.2 `StackSpec`

| 字段 | 取值 | 说明 |
|---|---|---|
| `rule` | `refresh` / `stack` / `independent` / `highest` | 精确语义见 §4.1 |
| `key` | `def`（默认）/ `defSource` / `defParam` | 叠加键（§4.2） |
| `max` | int | `stack` 的层数上限 / `independent` 的实例上限 |
| `add` | int | 每次施加增加的层数（默认 1；招式 `BuffApply.stacks` 可覆写） |
| `durationOnStack` | `max`（默认）/ `reset` / `keep` | 叠层时持续时间的处理 |
| `expire` | `all`（默认）/ `one` | 到期时全部移除 / 只减 1 层并重置持续 |
| `snapshotMerge` | `max`（默认）/ `latest` | 多源叠层时快照合并方式（§4.2） |
| `onMax` | Op[] | 叠满时执行（如寒气满 5 层转冰冻） |

#### 2.1.3 `DispelSpec`

| 字段 | 取值 | 说明 |
|---|---|---|
| `dispellable` | bool | `false`＝任何常规驱散都无效（永久被动、Boss 狂暴） |
| `types` | dispelType[] | 允许的驱散类型（§7.1）：`circulate` `acupoint` `medicine` `antidote` `skill` `purge` `special` `rest`；`bookSleep` 对所有非永久 Buff 默认生效，不必列出 |
| `stacksPerDispel` | int | 一次成功驱散移除的层数（默认全部） |
| `difficulty` | int | 被驱散时的品阶加值（天阶特性默认 +1，§3.3） |
| `specialCures` | ref[] | `special` 类型的具体解法：物品 `it_*`、NPC `npc_*`、任务 `q_*`、武功 `sk_*`（附最低品阶） |

#### 2.1.4 `PersistSpec`（跨战斗，§5.4）

| 字段 | 取值 | 说明 |
|---|---|---|
| `minTier` | `huang`/`xuan`/`di`/`tian` | 达到该大阶才跨战斗（如中毒地阶起才带出战斗）；缺省 `huang` |
| `battleEnd` | `keep` / `convert` | `keep`：原样保留层数与剩余回合；`convert`：按 `worldDuration` 换算为世界时间 |
| `worldDuration` | expr（时辰） | 战斗外持续；`untilCured` 用 `-1` |
| `worldTick` | `{every, ops[]}` | 每 `every` 时辰执行一次（掉血不致死、属性惩罚、发作） |
| `worldDecay` | `{every, stacks}` | 自然消退：每 `every` 时辰减 `stacks` 层 |
| `rest` | `{clearIfGradeLE, stacks}` | 客栈/营地休息一次（11）的效果：品阶 ≤ 值则清除，否则减层 |
| `battleStart` | `{duration, stacks}` | 下一场战斗开始时如何重新挂载（默认：层数不变，持续取定义默认值） |
| `explorePenalty` | Mod[] | 探索中的额外惩罚（体力上限、奔跑、轻功门禁） |

### 2.2 `BuffInstance`（运行时实例，随存档序列化）

| 字段 | 类型 | 说明 |
|---|---|---|
| `iid` | int | 战斗内单调递增的施加序号；同优先级结算以 `iid` 升序（确定性） |
| `def` | buffId | 定义 ID |
| `holder` / `source` | unitId / unitId \| null | 持有者 / 施加者 |
| `origin` | `{type, id}` | `type` ∈ `skill` `move` `item` `equip` `set` `terrain` `tsp` `system` `story` `aura` |
| `g0` / `g` | int | 施加时品阶 / 当前有效品阶（削品后 `g < g0`） |
| `stacks` | int | 层数（非叠层型恒为 1） |
| `turnsLeft` / `charges` | int | 剩余回合 / 剩余次数；`-1` 表示不适用 |
| `fresh` | bool | 本次行动内施加、行动结束时不递减的标记 |
| `snap` | map | 施加时快照：`Lb`、`level`（施加者显示等级）、`side`，以及 `def.snapshot` 声明的施加者属性（如 `atkIn`、`poi`） |
| `pen` | number 0–1 | 数值穿透系数：`1` 表示未被削弱；被低阶免疫部分阻挡时 < 1（§3.5.1），每次结算按当前免疫**实时重算** |
| `dormant` | bool | `highest` 规则下被压制的非激活实例 |
| `triggerState` | map | 每个触发器的 `cooldownLeft`、`usedThisTurn`、`usedThisBattle` |
| `phase` | enum | 蛊/受制类的阶段：`latent` 潜伏 / `active` 发作期 / `terminal` 危殆（§9.2） |
| `worldClock` | `{appliedAt, nextTickAt, nextFlareAt}` | 世界时间戳（时辰） |
| `revealed` | sideId[] | `hidden` 实例已被哪一方识破 |

### 2.3 表达式语言（`expr`）

`params`、`amount`、`when`、`chance` 等字段均为表达式字符串，**构建期**解析为 AST 并校验变量白名单，运行时不执行任意脚本（tech/05）。

| 类别 | 可用符号 | 说明 |
|---|---|---|
| 品阶 | `g`、`G`、`tier`（可比较：`tier >= di`）、`g0` | `G = G_TABLE[g]`（基准 §4） |
| 层与叠层 | `Lb`（=`snap.Lb`）、`Ls`（=来源武学 05 的层数系数 `L = 0.5 + 0.1 × layerEff`，快照）、`n`（来源武学有效层数）、`stacks`、`maxStacks`、`turnsLeft`、`charges`、`pen` | `Ls`/`n` 仅供 05 已规定数值的 Buff（破 X）使用 |
| 参数 | `p.<name>` | 本定义 `params` 的值（先求值） |
| 持有者 | `holder.<attr>`、`holder.hpPct`、`holder.lostHp`、`holder.isBoss`、`holder.isElite` | 实时值；属性 ID 同基准 §6 |
| 施加者 | `src.<attr>`（快照）、`srcLive.<attr>`（实时，施加者已死亡时为 0） | 默认用快照 |
| 事件上下文 | `ctx.damage`、`ctx.hpDamage`（实际扣血）、`ctx.shieldDamage`、`ctx.move.{id,category,subType,cat,grade,delivery,wIn,wOut,ultimate,range}`（`category`/`subType` 同 05；`cat` = 基准 §7 兵器类别：兵器招式取其子类，拳脚招式为 `unarmed`，暗器为 `hidden`）、`ctx.dist`、`ctx.direction`（`front`/`side`/`back`）、`ctx.isCrit`、`ctx.attacker`、`ctx.defender`、`ctx.buff`、`ctx.tile.{terrain,h}`、`ctx.steps` | 可用字段由钩子决定（§6.1 表"上下文"列） |
| 世界 | `world.shichen`、`world.day`、`world.festival`、`world.weather`、`world.region`、`world.chapterTier` | 只在战斗外钩子与 `when` 中可用 |
| 函数 | `min` `max` `clamp` `floor` `ceil` `round` `abs` `has(u, tagOrId)` `stacksOf(u, id)` `count(selector)` `dist(a, b)` `mainCat(u)` `poMatch(cat, u, move?)` `isBoss(u)` `sameSide(a, b)` `rho(delta)` | `rho` 即 §3.5 的 ρ(Δ)；`mainCat` = 主武器类别（空手为 `unarmed`）；`poMatch` 见 §8.6.1 |

约束：表达式无副作用、无循环；比较大阶用枚举序 `huang < xuan < di < tian`；百分数一律写小数（`0.08` = 8%）；百分点写"pp"数值（`3` = 3pp）并在字段名上以 `Pp` 结尾（如 `parryPp`）。

### 2.4 完整 YAML 示例

#### 示例 A：中毒（效果类 · DOT · 叠层 · 跨战斗）

```yaml
- id: bf_zhongdu
  name: 中毒
  nameByTier: { huang: 轻毒, xuan: 中毒, di: 深毒, tian: 奇毒 }
  category: effect
  polarity: debuff
  grade: inherit
  gradeRange: [1, 10]
  tags: [poison]
  subTags: [poison.common]
  family: fam_dot_poison
  resistAttr: resPoison
  origin: canonExpanded
  duration: { type: turns, value: 3, tierBonus: { di: 1, tian: 1 }, fresh: skipFirst }
  stack:
    rule: stack
    key: def                     # 不同施加者的中毒进入同一层池
    max: 5
    add: 1
    durationOnStack: max
    expire: all
    snapshotMerge: max
  dispel:
    dispellable: true
    types: [circulate, medicine, antidote, skill, rest]
    stacksPerDispel: 3
    difficulty: 0
  priority: 210                  # DOT 段（§5.2 S2）
  params:
    tickPct: "0.008 * G"         # 每层每回合损失气血上限的比例
    healCut: "tier >= xuan ? 0.10 : 0"
  mods:
    - { op: modStat, stat: healRecv, kind: pp, value: "-100 * p.healCut" }
  triggers:
    - on: onTurnStart
      ops:
        - op: dealDamage
          target: holder
          dmgType: dot
          element: poison
          amount: "holder.hpMax * p.tickPct * stacks * Lb * pen"
          bypassShield: true      # 毒走经脉，护体真气不挡（§5.3）
  reactions:
    - { with: bleed, effect: { tickMul: 1.25 } }      # 毒入血脉（§4.6）
  persist:
    minTier: di                  # 黄/玄阶毒战后自行消散
    battleEnd: convert
    worldDuration: "stacks * 4"  # 每层 4 时辰
    worldTick: { every: 1, ops: [ { op: dealDamage, amount: "holder.hpMax * 0.005 * G * stacks", canKill: false } ] }
    worldDecay: { every: 4, stacks: 1 }
    rest: { clearIfGradeLE: 8, stacks: 3 }
    battleStart: { stacks: keep, duration: default }
  bossProfile: { pctFactor: 0.25 }
  ui: { icon: buff/zhongdu, frame: auto, showStacks: true, showTimer: true, sortGroup: dot }
  vfx: { onApply: fx_poison_hit, loop: fx_poison_aura, onTick: fx_poison_tick }
  sfx: { onTick: sfx_poison_bubble }
  text:
    short: "每回合失血"
    desc: "回合开始损失 {calc:tick} 点气血（{stacks}/{maxStacks} 层）{if tier>=xuan}，受疗效果 −{p.healCut:%}{/if}。{if persist}离开战斗后仍会发作。{/if}"
    log: "{holder} 毒发（{name}×{stacks}），损失 {amount} 气血"
  aiValue: "-1.5 * stacks * G"
  canonRef: 通用（五毒掌、毒针、玉蜂针等施加）
```

#### 示例 B：破剑（效果类 · 破兵系列 · 分阶质变）

```yaml
- id: bf_pojian
  name: 破剑
  category: effect
  polarity: buff
  grade: inherit
  gradeRange: [1, 12]
  tags: [weaponBreak]
  subTags: [weaponBreak.sword]
  family: fam_pobing_sword
  origin: canon
  canonRef: 笑傲·独孤九剑"破剑式"（风清扬传剑，回目待考）
  duration: { type: permanent }            # 独孤九剑被动；招式临时授予版用 {type: turns, value: 3}
  stack: { rule: highest, key: defSource }  # highest 强制按来源分实例（§4.1、V12）
  dispel: { dispellable: false }           # 被动不可驱散；临时版 types: [purge]
  priority: 150
  params:
    cat: sword                             # 基准 §7 兵器类别
    dmgUp: "(0.05 + 0.02 * g) * Ls / 1.5"  # Z5 相性；数值由 05 §9.4 poBonus 规定（天上 10 重 29%）
    parryMult: "1 - 0.30 - 0.03 * (n - 1)" # 05 §9.4 poParry：匹配目标对持有者攻击的招架率乘数
    parryUpPct: "0.04 * G"                 # 本文：玄阶起，招架来袭 X 类招式时招架评级 +%
    negateChance: "tier == tian ? 0.10 + 0.05 * (g - 10) : 0"
  mods:
    - { op: modZone, zone: Z5, value: "p.dmgUp", when: "poMatch(p.cat, ctx.defender)" }
    - { op: modJudge, key: targetParryMult, value: "p.parryMult", when: "poMatch(p.cat, ctx.defender)" }   # 04 接口，§15
  tierTraits:
    xuan:
      mods:
        - { op: modStat, stat: parry, kind: pct, value: "p.parryUpPct", when: "ctx.move.cat == p.cat" }
    di:
      triggers:
        - on: onBeforeCrit                  # X 类招式对持有者不能暴击
          when: "ctx.move.cat == p.cat"
          ops: [ { op: setFlag, flag: noCrit } ]
        - on: onParry
          when: "ctx.move.cat == p.cat"
          chance: 0.5
          limitPerTurn: 1
          ops: [ { op: triggerMove, move: basic, powerMul: 0.5, target: attacker, tag: counter } ]
    tian:
      mods:
        - { op: modJudge, key: skipParry, value: true, when: "poMatch(p.cat, ctx.defender)" }   # 主动攻击 X 类目标时无视其招架
      triggers:
        - on: onBeforeHit                   # 命中判定后、招架判定前（§5.3 P3）
          when: "ctx.move.cat == p.cat && (!ctx.move.ultimate || ctx.move.grade <= g)"   # 高品阶绝招不可被破
          chance: "p.negateChance"
          limitPerTurn: 1
          ops:
            - { op: negateAttack, as: parried }                 # 视为招架成功且伤害为 0
            - { op: applyBuff, id: bf_pozhao, target: attacker, grade: g, duration: 1 }             # 破招（§8.6）
            - { op: applyBuff, id: bf_shiheng, target: attacker, grade: g, duration: 1 }
  ui: { icon: buff/pojian, frame: auto, sortGroup: passive }
  text:
    short: "克制剑法"
    desc: "对用剑者伤害 +{p.dmgUp:%}（相性），其招架你的概率 ×{p.parryMult}。{if tier>=xuan}招架剑招时招架 +{p.parryUpPct:%}。{/if}{if tier>=di}剑招对你不能暴击；招架剑招后 50% 反击。{/if}{if tier==tian}受剑招攻击时 {p.negateChance:%} 破其招式（无伤并令其破招、失衡）；攻击用剑者时无视其招架。{/if}"
    log: "{holder} 以【破剑】破去 {attacker} 的〈{move}〉"
  aiValue: "0.8 * G"
```

#### 示例 C：挪移（机制类 · 伤害转移 · 品阶对抗）

```yaml
- id: bf_nuoyi
  name: 挪移
  category: mechanic
  polarity: buff
  grade: inherit
  gradeRange: [7, 12]
  tags: [guard]
  subTags: [guard.redirect]
  family: fam_redirect
  origin: canon
  canonRef: 倚天·乾坤大挪移（光明顶一战，牵引他人之力）
  duration: { type: turns, value: 3 }
  stack: { rule: refresh, key: def }
  dispel: { dispellable: true, types: [purge], difficulty: 0 }
  priority: 120                            # onBeforeHurt 机制防护段
  limits: { cooldown: 4, perBattle: 3 }
  params:
    pct: "min(0.50, 0.10 * G)"             # 天中（G=3.10）→ 31%
    radius: 2
  triggers:
    - on: onBeforeHurt
      when: "ctx.damage > 0 && !ctx.flags.redirected && ctx.dmgType != 'dot'"
      ops:
        - op: redirect
          pct: "p.pct * (1 - rho(ctx.move.grade - g))"     # 招式品阶高于本 Buff 时按 ρ 穿透
          to: "nearestEnemy(holder, p.radius, exclude: ctx.attacker) ?? ctx.attacker"
          as: { dmgType: redirect, applyZones: [Z4], canCrit: false, flags: [redirected] }
  ui: { icon: buff/nuoyi, frame: auto, showTimer: true, sortGroup: mechanic }
  vfx: { onApply: fx_qiankun_ring, onTrigger: fx_qiankun_swirl }
  text:
    short: "转移伤害"
    desc: "受到伤害时，将其中 {p.pct:%} 挪移给 {p.radius} 格内另一名敌人（优先非攻击者，无则还给攻击者）。招式品阶高于本效果时，转移比例按品阶差递减。"
    log: "{holder} 施展挪移，将 {amount} 点伤害转嫁给 {target}"
  aiValue: "1.2 * G"
```

> 示例中的 `bf_pozhao`（破招）、`bf_shiheng`（失衡）见 §8.6、§8.7；`poMatch()` 的定义见 §8.6.1；`rho()` 见 §3.5。破 X 的 Z5 增伤与招架乘数由 05 §9.4 规定，本文只定义 Buff 结构与大阶质变。

### 2.5 与 05 `BuffApply` / `CleanseSpec` 的对接

| 05 字段 | 本文语义 |
|---|---|
| `BuffApply{id, chance, dur, stacks, max, grade, to, cond}` | = 原语 `applyBuff`：`dur` 覆写 `duration.value`（仍加 `tierBonus`，除非写 `durFixed: true`）；`stacks`/`max` 覆写本次叠层数与上限；`grade: inherit` 取来源 `effGrade`；`to` ∈ `self`/`target`/`allies`/`enemies` 映射到 §6.3 选择器 |
| `BuffApply.value` / `PassiveDef.value` | **覆写 `params` 中同名参数**（如 `bf_hutizhenqi` 的 `shieldPctHpMax`）。05 已给出具体数值的，以 05 为准；本文目录中的公式是未覆写时的默认值 |
| `CleanseSpec{side, tags, count, maxGrade}` | = 原语 `dispel`：`type: skill`、`strength = maxGrade`（`inherit` 取招式 `effGrade`）、`tags` 按 §7.4 匹配主/子标签、`count` 为处理效果数（`all` 不限）；品阶高于 `strength` 的效果按 §3.5.3 削品 |
| `PassiveDef.trigger.on` | 见 §6.1 末"对应"段 |
| `PassiveDef.kind` 为 `mechanic` 的免疫值（如 `immuneTags`、`immune: [bf_…]`） | = 原语 `immune`（按标签或按 Buff ID），品阶 = `maxGrade` |


---

## 3. 品阶体系

### 3.1 Buff 品阶从哪里来

| 来源 `origin.type` | 品阶 | 说明 |
|---|---|---|
| `skill` / `move`（武功被动、招式附带） | 来源武功的 `effGrade`（05 §2.6，已含外来压制） | 基准 §10"通常继承来源武功品阶"；外来武学在中武/低武书界产生的 Buff 同样被压 2/4 小品 |
| `item`（丹药、暗器弹药、毒药、解药） | 物品有效品阶（10；外来物品同受压制） | |
| `equip`（装备常驻/触发） | 装备有效品阶（10） | 神兵的"断兵""刀枪不入"等 |
| `set`（套装加成） | 套装当前档位的品阶（07） | |
| `terrain` / `aura` | 地形/阵法定义给出（08/09）；缺省 = 区域敌人等级带对应品阶【建议值：`clamp(1, 12, ⌈Ld/6⌉)`】 | 毒沼、火场、雪原 |
| `tsp`（天书之力） | 固定 12，**不受外来压制**【建议值，待 13 确认】 | 天书之力是书界之外的力量 |
| `system` / `story` | 定义中的定值 | 书灵护佑、Boss 首领常驻 |
| NPC / 敌人 | 与玩家同规则（本书界原生武学不受压制） | |

**有效品阶**：`g = clamp(1, 12, g0 − erode)`，其中 `erode` 为被削品的累计值（§3.5.3）。品阶在实例存续期间只会因削品下降，不会因施加者后续状态变化而改变。

### 3.2 强度系数与层数修正

Buff 数值统一写成 **"基准值 × G × Lb"**：

```
value = base × G(g) × Lb          G(g) 直接取基准 §4 的武功威力系数
Lb    = 0.70 + 0.03 × layerEff    （仅 origin 为 skill/move 时；其余来源 Lb = 1.00）
```

| 层数 `layerEff` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| `Lb` | 0.73 | 0.76 | 0.79 | 0.82 | 0.85 | 0.88 | 0.91 | 0.94 | 0.97 | 1.00 |

设计理由：
- 复用基准 G，数值表只需维护一套"基准值"；天上品（G=3.50）为黄下品的 3.5 倍，与武功威力同比例，玩家对"品阶差多少"有一致直觉。
- `Lb` 比 05 的招式层数系数 `L = 0.5 + 0.1×layer`（0.6–1.5）平缓得多：Buff 多为百分比且有上限（§11.1），层数只做 ±27% 的微调，**品阶才是 Buff 强度的主轴**。
- 中武/低武书界层数上限 9/8 重（基准 §3），外来内功的被动 Buff 因此最多只有 `Lb` 0.97/0.94——与品阶压制共同构成"武林衰败、主角武功降低"的体感。

**取整**：遵循 03 §0.3——内部浮点，写入结算时取整（气血/内力取 `⌊⌋`），UI 百分数显示 1 位小数、百分点显示 1 位小数。

### 3.3 大阶质变特性（`tierTraits` 的全局默认）

数值随 G 连续增长；**跨大阶时**还会解锁质变，让"地阶的毒"与"玄阶的毒"不只是数字差别：

| 大阶 | 通用质变（默认施加于所有条目，条目可覆写） | 条目级质变示例 |
|---|---|---|
| 黄 `huang`（1–3） | 纯数值 | 轻毒：只掉血 |
| 玄 `xuan`（4–6） | 可附带 1 项次要效果（条目中"玄+"注明） | 中毒：受疗 −10%；破 X：解锁招架加成 |
| 地 `di`（7–9） | 持续 `tierBonus` +1（非机制类）；标注"界地"的减益从此阶起跨战斗 | 深毒：跨战斗；破 X：X 类招式对持有者不能暴击 |
| 天 `tian`（10–12） | 被驱散时 `difficulty +1`（视为品阶 +1，最高按 13 计）；解锁条目"天"特性 | 奇毒：附带内力流失；破 X：破招（令 X 类招式失效） |

### 3.4 品阶数值速查表（配表用）

| 基准值（写法） | g1 黄下 | g2 | g3 | g4 玄下 | g5 | g6 | g7 地下 | g8 | g9 | g10 天下 | g11 | g12 天上 | 典型用途 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| G | 1.00 | 1.10 | 1.20 | 1.40 | 1.55 | 1.70 | 2.00 | 2.20 | 2.40 | 2.80 | 3.10 | 3.50 | — |
| 3%×G | 3.0 | 3.3 | 3.6 | 4.2 | 4.7 | 5.1 | 6.0 | 6.6 | 7.2 | 8.4 | 9.3 | 10.5 | 速度、判定评级减益 |
| 4%×G | 4.0 | 4.4 | 4.8 | 5.6 | 6.2 | 6.8 | 8.0 | 8.8 | 9.6 | 11.2 | 12.4 | 14.0 | 判定评级增减、抗性 pp（写作 `4×G`） |
| 5%×G | 5.0 | 5.5 | 6.0 | 7.0 | 7.8 | 8.5 | 10.0 | 11.0 | 12.0 | 14.0 | 15.5 | 17.5 | Z3/Z4、攻击减益、效果命中/抵抗 |
| 6%×G | 6.0 | 6.6 | 7.2 | 8.4 | 9.3 | 10.2 | 12.0 | 13.2 | 14.4 | 16.8 | 18.6 | 21.0 | 攻击增益 |
| 8%×G | 8.0 | 8.8 | 9.6 | 11.2 | 12.4 | 13.6 | 16.0 | 17.6 | 19.2 | 22.4 | 24.8 | 28.0 | 防御增益、禁疗 pp（减益） |
| 10%×G | 10 | 11 | 12 | 14 | 15.5 | 17 | 20 | 22 | 24 | 28 | 31 | 35 | 暴伤 pp、挪移比例 |
| 0.8%×G（DOT/层） | 0.80 | 0.88 | 0.96 | 1.12 | 1.24 | 1.36 | 1.60 | 1.76 | 1.92 | 2.24 | 2.48 | 2.80 | 中毒每层 |
| 1%×G（HOT/DOT） | 1.00 | 1.10 | 1.20 | 1.40 | 1.55 | 1.70 | 2.00 | 2.20 | 2.40 | 2.80 | 3.10 | 3.50 | 回春、流血、寒毒 |
| 2%×G（重 DOT） | 2.0 | 2.2 | 2.4 | 2.8 | 3.1 | 3.4 | 4.0 | 4.4 | 4.8 | 5.6 | 6.2 | 7.0 | 剧毒 |

> 单位：除"G"行外均为百分数或百分点；DOT/HOT 行为"占持有者 `hpMax` 的百分比 / 回合"。所有值还需乘 `Lb`（武功来源时）。

### 3.5 品阶对抗公式（基准 §10：高品阶效果可部分穿透）

#### 3.5.0 穿透系数 ρ(Δ)

设效果品阶 `ge`、对抗方（免疫 / 抵抗 / 驱散 / 机制防护）品阶 `gc`，`Δ = ge − gc`：

```
ρ(Δ) = 0                              当 Δ ≤ 0         （对抗方完全生效）
ρ(Δ) = min(0.90, 0.15 + 0.15 × Δ)     当 Δ ≥ 1
```

| Δ | ≤0 | 1 | 2 | 3（跨一个大阶） | 4 | ≥5 |
|---|---|---|---|---|---|---|
| ρ | 0 | 0.30 | 0.45 | 0.60 | 0.75 | 0.90 |

- ρ 封顶 0.90：**任何免疫/防护面对再高品阶的效果，也至少挡下 10%**——黄阶的辟毒丹仍然有用，只是有限。
- ρ 永远作用于"效果对对抗方的穿透部分"，同一公式用于下表五种场合：

| 场合 | 对抗方品阶 `gc` | Δ ≤ 0 | Δ ≥ 1 |
|---|---|---|---|
| ① 免疫 vs 减益（§3.5.1） | 免疫实例品阶 | 完全阻挡，日志"免疫" | 数值型：数值 × ρ；控制/机制型：以概率 ρ 生效且持续 −1（最少 1） |
| ② 抵抗 vs 减益（§3.5.2） | `resGrade(tag)` | 抗性全额参与 04 的效果命中与 DOT 减免 | 有效抗性 = 抗性 × (1 − ρ) |
| ③ 驱散 vs 减益/增益（§3.5.3） | 驱散强度品阶 | 移除（或移除 N 层） | 削品：Δ=1 削 2 品、Δ=2 削 1 品；Δ≥3 无效 |
| ④ 机制防护 vs 招式（§3.5.4） | 防护 Buff 品阶（无敌/金刚/挪移/斗转/锁血） | 防护完全生效 | 防护效果 × (1 − ρ)，或以概率 ρ 失效 |
| ⑤ 新获免疫 vs 已存在减益（§3.5.5） | 新免疫品阶 | 立即移除（"免疫净化"） | 不移除，其 `pen` 降为 ρ（即按 ① 削弱） |

#### 3.5.1 免疫的部分穿透

```
若 holder 存在免疫实例 I，且 I 的标签覆盖效果 E 的任一主标签/子标签：
    Δ = E.g − I.g
    Δ ≤ 0  → 阻挡；触发 holder.onImmuneBlocked
    Δ ≥ 1  → 数值型 E（stat / DOT / 属性修饰）：E.pen = ρ(Δ)，所有数值 × pen，持续不变
             控制/机制型 E：以概率 ρ(Δ) 生效；生效时 turnsLeft = max(1, turnsLeft − 1)
    多个免疫同时覆盖 → 取品阶最高者计算（不连乘）
```

`pen` 的应用：引擎**自动**把 `pen` 乘到该实例 `mods` 的全部数值上；触发器原语中的数量须在表达式中**显式**乘 `pen`（见示例 A 的 `amount`），这样少数不应被削弱的量（如定身的回合、层数上限）可以不乘。

**例 1（用户示例）："玄上免疫中毒"面对"地中剧毒"**

| 步骤 | 计算 | 结果 |
|---|---|---|
| 施加 | 百毒不侵 `g=6`（玄上）；剧毒 `bf_judu` `g=8`（地中）；Δ = 2 | ρ = 0.45 |
| 剧毒数值 | 2%×G(8) = 4.4% `hpMax`/回合 → × 0.45 | **1.98% `hpMax`/回合**（Lv35 主角 hpMax≈5,000 → 99 点/回合，原本 220） |
| 附带受疗 −20pp（地阶 −30pp） | −30pp × 0.45 | **受疗 −13.5pp** |
| 持续 | 3 + 地阶 1 = 4 回合，不因免疫缩短 | 4 回合 |
| UI | 图标右上角显示"压"字角标，Tooltip：`被〈百毒不侵·玄上〉压制，穿透 45%` | |
| 后续：运功逼毒（主运内功玄上，`gc=6`） | Δ = 2 → 削 1 品：剧毒降为地下（g=7）；此时对免疫 Δ=1 → ρ=0.30 | 每回合 4.0%×0.30 = 1.2% |
| 再次运功逼毒 | Δ = 1 → 削 2 品：g=5（玄中） ≤ 免疫品阶 6 → **免疫净化**立即移除 | 解毒完成（两次行动） |

**例 2：天中 移魂（`bf_yihun`，g=11）对 地上 心如止水（`bf_mian_xin`，g=9）**：Δ=2 → 45% 概率生效；若生效，持续 1 回合（天阶本为 2，−1）。

#### 3.5.2 抵抗的部分穿透与 `resGrade`

抗性（`resPoison` 等，03 §1.3.4，PCT −50%–75%）本身没有品阶。本文规定每个标签有一个**抵抗品阶**：

```
resGrade(tag) = max( 主运内功 effGrade − 3,                      // 内功护体的底子
                     所有为该标签提供抗性或免疫的装备/Buff/套装/被动 的品阶 ,
                     1 )
Δr            = E.g − resGrade(E.resistTag)
resEff        = res × (1 − ρ(Δr))          （res < 0 时不削减：负抗性对任何品阶都全额生效）
```

`resEff` 替代 `res` 进入 04 的效果命中公式与 DOT 减免（§5.3.2）。**`resGrade` 的正式定义以 03 §6.3 为准**（与上式兼容，另规定贡献 < 5pp 的零碎来源不抬高抵抗品阶；解毒技艺项的品阶按 03 §8.1 换算）。

例：主运地下内功（g7 → 底子 4）＋ 玄中辟毒香囊（g5，抗毒 +12pp），抗毒合计 40%，`resGrade(poison)=5`。遭地中剧毒（g8）：Δr=3 → ρ=0.60 → `resEff = 40% × 0.40 = 16%`。

#### 3.5.3 驱散的削品

```
驱散强度 gd（§7.1 各类型给出），目标效果 E 的对抗品阶 ge' = E.g + E.dispel.difficulty（天阶 +1）
Δ = ge' − gd
Δ ≤ 0 → 移除 E（叠层型移除 stacksPerDispel 层；为 0 层时整体移除）
Δ = 1 → 不移除；E.g −= 2（削 2 品）；叠层型另移除 1 层（剩 1 层时不移除）
Δ = 2 → 不移除；E.g −= 1（削 1 品）；叠层型另移除 1 层（同上）
Δ ≥ 3 → 无效；日志"毒性太烈，非你此刻功力所能化解"，UI 提示所需最低品阶（ge' − 2）
```

- 削品后数值按新品阶**立即**重算；削品不改变剩余回合。
- 削品后若 `E.g ≤` 持有者身上任一覆盖其标签的免疫品阶 → 立即按 §3.5.5 免疫净化移除。
- `special` 驱散（蛊、受制）不走本公式，按条目 `specialCures` 的品阶门槛判定（§9.4）。
- 同一效果在同一回合内最多被削品 1 次（防止多名队友连续低阶驱散"磨掉"天阶效果）。

#### 3.5.4 机制防护 vs 高品阶招式

以招式的 `effGrade`（05）为 `ge`、防护 Buff 品阶为 `gc`：

| 防护 | Δ ≥ 1 时 |
|---|---|
| 无敌 `bf_wudi` | 该次伤害 × ρ 生效（无敌"被打穿"），新减益按 ① 处理 |
| 金刚不坏 `bf_jingang` | 单击上限 `cap' = cap + (1 − cap) × ρ` |
| 挪移 `bf_nuoyi` / 援护 `bf_yuanhu` | 转移比例 × (1 − ρ) |
| 斗转 `bf_douzhuan` | 反弹概率 × (1 − ρ) |
| 锁血 `bf_suoxue` | 以概率 ρ 失效（该次致死伤害正常结算） |
| 残影 `bf_canying` | 以概率 ρ 该击不消耗残影而直接命中 |

#### 3.5.5 新获免疫对已有减益

获得免疫实例（主动或被动）的瞬间，对持有者身上所有被其标签覆盖的减益执行一次"免疫净化"：`E.g ≤ I.g` 者移除；更高者 `pen = ρ(Δ)`。例外：只能由 `special` 解法移除的效果（`dispel.types` 中除 `special` 外只有"压制"类用法者：蛊、受制、生死符、情花毒、寒毒的根治等）不会被免疫净化移除——对蛊与受制只**压制发作**（§9.3），对情花毒只按 ρ 削弱其发作伤害。

---

## 4. 叠加与冲突

### 4.1 四种叠加规则的精确语义（基准 §10）

施加流程先走免疫（§3.5.1）→ 效果命中/抵抗（04，含 §3.5.2）→ Boss 规则（§11.4），**通过后**才进入叠加判定。例外：`origin.type = story`（剧情强制施加，如被迫服下三尸脑神丹）**跳过免疫与抵抗判定**，但施加后免疫仍按 §3.5.5 / §9.3 压制其数值或发作。设新施加为 `N`（品阶 `gN`、层数 `nN`、持续 `dN`），已存在同叠加键实例为 `E`：

| 规则 | 无 `E` | 有 `E` 时的精确行为 | 典型 |
|---|---|---|---|
| `refresh` 刷新 | 新建 | ① `E.turnsLeft = max(E.turnsLeft, dN)`；② 若 `gN > E.g`：`E.g = gN`、`E.source = N.source`、`E.snap = N.snap`（数值随之升级）；③ 若 `gN ≤ E.g`：只做 ① ；④ 不新增实例、不触发 `onApply`，触发 `onRefresh` | 大多数数值类、控制类 |
| `stack` 叠层 | 新建（层数 `nN`） | ① `E.stacks = min(max, E.stacks + nN)`；② 持续按 `durationOnStack`（默认 `max`）；③ `E.g = max(E.g, gN)`（**整池升品**）；④ 快照按 `snapshotMerge`（默认取两者中数值较大者）；⑤ 若本次达到 `max` 触发 `onMax`/`onStackMax` | 中毒、流血、寒气、内伤、龙象之力 |
| `independent` 独立 | 新建 | 总是新建实例，各自计时、各自结算；同定义实例数 > `max` 时移除**剩余回合最少**者（相同则 `iid` 最小者） | 护体真气（各自到期）、生死符（每符一实例） |
| `highest` 取高 | 新建 | 各来源实例并存（`key` 强制按 `defSource`），但**只有一个激活**：按 数值 → 品阶 → 剩余回合 → `iid` 降序 取第一；其余 `dormant = true`，计时照走、不结算；激活者消失后下一名立即接替 | 剧毒、灼烧、光环、各"破 X" |

伪代码（tech/05 以此为准）：

```ts
function apply(def: BuffDef, n: ApplyReq, holder: Unit): ApplyResult {
  const forced = n.origin.type === 'story';              // 剧情强制：跳过免疫与抵抗
  const pen = forced ? suppressOnly(def, n.g, holder)    // 仍按免疫计算压制系数（§9.3）
                     : immunityCheck(def, n.g, holder);  // §3.5.1：0 = 阻挡；(0,1) = 部分；1 = 无免疫
  if (!forced && pen === 0) return log('IMMUNE');
  if (!forced && !effectHitRoll(def, n, holder)) return log('RESIST');   // 04，含 resEff
  const req = bossAdjust(def, n, holder);               // §11.4：控制递减、持续压缩、豁免
  if (!req) return log('BOSS_IMMUNE');
  const key = stackKey(def, n);                          // §4.2
  const e = holder.buffs.find(b => b.key === key && !b.removed);
  switch (def.stack.rule) {
    case 'refresh':     return e ? refresh(e, req)  : create(def, req, pen);
    case 'stack':       return e ? addStack(e, req) : create(def, req, pen);
    case 'independent': return createWithEvict(def, req, pen);
    case 'highest':     return createAndReelect(def, req, pen);
  }
}
// create() 之后：数量上限检查（§11.2）→ onApply → holder.onBuffApplied → source.onBuffApply → 属性缓存置脏
```

### 4.2 叠加键：同类不同源如何合并

| `stack.key` | 键 | 语义 | 适用 |
|---|---|---|---|
| `def`（默认） | `defId` | **不同施加者合并为一个实例**：两个毒师的中毒进入同一个 5 层池；两名队友的"外攻提升"只刷新不翻倍 | 绝大多数 |
| `defSource` | `defId + sourceId` | 每个施加者一个实例，彼此独立结算 | `highest` 强制使用；"锁定"（天罡北斗阵，每名施加者各一标记） |
| `defParam` | `defId + 关键参数` | 同定义不同参数视为不同 Buff | 抗性削弱（按标签）、封经脉（封拳脚 / 封兵器） |

**多源叠层的快照合并**（`stack` 规则 + `key: def`）：层池只有一份快照，取 `snapshotMerge`：
- `max`（默认）：比较两份快照按当前层数算出的单跳数值，取大者整份替换。低阶毒师无法"稀释"高阶毒师的毒。
- `latest`：直接用最新施加者的快照（用于强调"最后一击"的效果，如战意）。

**同类不同源的击杀归属**：DOT 击杀记给快照所属施加者；其余合并实例记给最近一次施加者（09 用于击杀奖励与气势）。

### 4.3 族（`family`）与加法合并

- **不同定义、同一族**的数值类 Buff **加法合并**，再受**族上限**约束（§11.1）。例：`bf_waigong_sheng`（外攻 +12%）＋ 套装"少林金刚"常驻（外攻 +8%）＋ 队友鼓舞（外攻 +6%）→ 族 `fam_atk` 合计 +26%。
- **同一定义**按其 `stack.rule` 处理，不会与自己相加。
- 族上限按**极性分别**计算（增益合计上限、减益合计下限），然后再做 §4.5 的净值。
- 族清单：

| 族 ID | 覆盖 | 族 ID | 覆盖 |
|---|---|---|---|
| `fam_atk` | `atkOut`/`atkIn` 的 pct | `fam_def` | `defOut`/`defIn` 的 pct |
| `fam_rat_<stat>` | 每个 RAT 评级（hit/eva/parry/pierce/crit/tough/effHit/effRes）各一族 | `fam_spd` | `spd` pct |
| `fam_move` | `mov`/`jump`/`qinggong` | `fam_res_<tag>` | 每个抗性各一族 |
| `fam_pct_<stat>` | PCT 类（critDmg/counter/combo/seal/healPower/healRecv/rageGain） | `fam_z3` / `fam_z4` | 增伤 / 减伤 |
| `fam_z2` | 防御穿透 | `fam_z5_<cat>` | 破 X（按兵器类别） |
| `fam_dot_<tag>` | 每种 DOT 标签 | `fam_hot` | 回血/回损/回内 |
| `fam_shield` | 护体真气 | `fam_reflect` / `fam_redirect` | 反震 / 挪移、援护 |
| `fam_drain` | 吸血、吸内 | `fam_cost` | 内力消耗 |

### 4.4 互斥组（`exclusive`）

| 组 | 成员 | 规则 |
|---|---|---|
| `exg_stance` 架势 | 守势、攻势、蓄势、游势、静势、狂势 | 同组只能存在 1 个；新架势**替换**旧架势（无论品阶）；被 `purge(stance)` 驱散后进入"乱架"（1 回合不能再起架势） |
| `exg_control_hard` 硬控 | 眩晕、冰冻、昏睡、点穴 | 同时只结算 1 个：新硬控到来时，若旧硬控剩余 ≥ 新硬控持续则新者丢弃，否则替换（**硬控不叠加时间**） |
| `exg_mind` 心神 | 迷惑、移魂、恐惧、嘲讽 | 新者替换旧者；移魂 > 迷惑 > 恐惧 > 嘲讽，低者不能替换高者 |
| `exg_ai_override` | 走火入魔的"敌我不分"与迷惑 | 同上，取迷惑 |
| `exg_zouhuo` 走火 | 内息紊乱、经脉逆行、走火入魔（1–3 级） | 同组只存一个；按 05 §10.1 升级：已处于 k 级时再触发 ≤ k 级 → 升为 k+1 级（上限 3），触发更高级 → 直接替换 |
| `exg_speed_state` | 疾速（spd+）与减速（spd−） | **不互斥**，走 §4.5 净值；列出仅为说明 |

### 4.5 增益与减益互相抵消

数值类增益与减益**同时存在、分别计算上限、最后取净值**；两者都保留图标、各自计时、各自可被驱散：

```
posSum = min(capPos(fam), Σ 增益值)            // 例：攻击 pct 增益上限 +80%
negSum = max(capNeg(fam), Σ 减益值)            // 例：攻击 pct 减益下限 −60%
net    = posSum + negSum                       // 进入 03 §11 的修饰汇总
```

| 例 | 增益 | 减益 | 净值 | 说明 |
|---|---|---|---|---|
| 用户示例 | 外攻 +20% | 外攻 −15% | **+5%** | 驱散掉减益后回到 +20% |
| 上限先截 | 外攻 +50%、+45%（合 95% → 截 80%） | −30% | **+50%** | 先截后抵，避免"堆满增益无视减益" |
| 判定评级 | 招架 +14% | 破绽 −10.2% | +3.8% | 同为 `pct`，与 03 §0.2 形态一致 |
| 跨层不抵消 | 攻击 +20%（属性 pct） | 虚弱：伤害 −15%（Z3） | 两者都生效 | **不同作用层不互相抵消**，各自进入自己的层 |

### 4.6 元素反应（标签间的固定交互）

| 反应 ID | 条件 | 结果 | 原著依据 |
|---|---|---|---|
| `rx_binghuo` 冰火相激 | 冰冻/寒气持有者受到 `heat` 伤害或被施加灼烧 | 冰冻立即解除（寒气每次抵消 2 层），同时施加者一方造成额外 `hpMax×2%×G` 伤害，持有者获得内伤 1 层；灼烧本次不挂载 | （原创扩展） |
| `rx_duruxue` 毒入血脉 | 流血持有者身上的 `poison` DOT | 毒伤 ×1.25 | （原创扩展） |
| `rx_hanbingxixing` 寒冰反制 | 对 `cold` 护体者（寒冰真气类被动）执行吸内（北冥/吸星） | 吸取方获得寒气 3 层（同防守方品阶），吸取量 −50% | 笑傲·少室山，左冷禅以寒冰真气反制任我行吸星大法（细节待考） |
| `rx_yiduigongdu` 以毒攻毒 | 情花毒持有者服下断肠草（物品） | 情花毒移除，但获得剧毒（地下）2 回合 | 神雕·杨过以断肠草解情花毒（"以毒攻毒"之理，细节待考） |

### 4.7 作用层与乘区对照（数值类 Buff 必须标注）

目录中每条数值型效果的"数值"列以下列记法开头，**不得省略**：

| 记法 | 作用位置 | 含义与合并方式 | 例 |
|---|---|---|---|
| `attr:<id> pct` | 属性层（03 §11，MAG/RAT 的百分比修饰） | 同族加法 → 属性 × (1 + Σ) | `attr:atkOut pct +6%×G` |
| `attr:<id> flat` | 属性层固定值 | 加到基础值 | `attr:mov flat +1` |
| `attr:<id> pp` | 属性层百分点（PCT 形态） | 直接加减 | `attr:resPoison pp +4×G` |
| `attr:<id> mult` | 属性层独立乘数 | 连乘 | **Buff 一般不用**：03 §11.2 限定 `mult` 只用于天书之力特殊项与敌人模板，玩家侧每属性 ≤ 2 个 |
| `attr:<id> override` | 属性覆写（03 §11.2 步骤⑧） | 最后生效，多个取最新施加者 | 点穴 `eva`/`parry` 视为 0；封轻功 `qinggong` 视为 0 |
| `Z0:<flag>` | 判定层开关 | `mustHit` / `mustCrit` / `skipParry` / `noCrit` | 必中、必暴、无视招架 |
| `Z2` | 防御减免层 | 防御穿透比例，加法合并 | 透劲 `Z2 +5%×G` |
| `Z3` | 增伤（攻方） | 加法合并；减益为负值（虚弱） | 锐意 `Z3 +5%×G` |
| `Z4` | 减伤（守方） | 加法合并，上限 75%（基准 §9）；易伤为负值 | 卸力 `Z4 +5%×G` |
| `Z5:<cat>` | 相性（兵器克制"破 X"） | 只对 X 类目标；同类取高不叠加 | 破剑 `Z5:sword +poBonus`（数值归 05 §9.4） |
| `Z6` | 暴击倍率 | 以 `attr:critDmg pp` 实现（03 中 critDmg 为 PCT） | 势沉 `attr:critDmg pp +10×G` |
| `Z7` | 方位与地形 | 视为背击 / 视为高处 | 隐身解除一击"视为背击" |
| `Z9` | 招架减免 | 招架成功时的减免比例 pp | 圆转（玄+）`Z9 +1×G pp` |
| `settle` | 结算段 | 护体、吸血、吸内、反震、附加 Buff | 嗜血 `settle 吸血 3%×G` |
| `cost` | 招式消耗 | 内力消耗倍率 | 节内 `cost −4%×G` |
| `ct` | 集气时间轴（09） | 立即增减集气值 | 迟缓 `ct −100×G` |

---

## 5. 持续与时机

### 5.1 持续的计数规则

| 规则 | 说明 |
|---|---|
| 计数单位 | `turns` 型以**持有者自身行动**计（基准 §8）。施加者是谁、施加于谁的回合，都不影响计数主体。 |
| 递减时机 | 持有者每次行动的**回合结束段 E2**（§5.2）递减 1。 |
| 新挂载 | `fresh: skipFirst`（默认）：在持有者**自己的行动中**被施加（自我增益、反震回来的减益）→ 本次 E2 不递减。在别人行动中被施加 → 持有者下次行动结束时正常递减。 |
| 被跳过的行动 | 因眩晕/冰冻/点穴/昏睡跳过行动**仍然算一次行动**：照常执行 E 段并递减。故"眩晕 1 回合"= 恰好失去下一次行动。 |
| 额外行动 | "再动"获得的额外行动**不执行** S 段与 E2 递减（§8.9 `bf_zaidong`）；防止额外行动把持续与冷却变相减半。（左右互搏的"分心二用"是一次行动内出两招，05 §9.3.2，本就只算一次行动） |
| `charges` | 满足触发条件并**实际生效**时消耗 1 次（被免疫/未命中不消耗）；`maxTurns` 到期则提前移除。 |
| 死亡 | 持有者倒地时移除全部非 `persist` 实例；`persist` 实例保留（战后仍带着内伤醒来）。复活不恢复已移除的增益。 |
| 施加者死亡 | 默认**不影响**已施加实例（毒不会因毒师死去而消失）；`aura` 与"受制""蛊"另有规则（§9.2）。 |
| 快慢单位 | 持续以行动计，意味着对**极快**单位（每轮行动 2 次）的减益在"墙钟时间"上消失得更快。这是有意设计（快即是强），但硬控对 Boss 另有递减规则（§11.4）。 |

### 5.2 一次行动内的结算顺序

```
集气满 1000（09）
│
├─ S 段：回合开始（onTurnStart），按 priority 升序、同值按 iid 升序
│   S1  [0–99]    周期发作：生死符、蛊、受制、情花毒、三尸脑神丹
│   S2  [200–299] DOT：中毒 210 → 剧毒 220 → 蛇毒 225 → 流血 230 → 灼烧 240 → 寒毒 250 → 化骨 255 → 内伤 260
│   S3  死亡判定：若 hp ≤ 0 → onDeath 链（锁血 → 诈死 → 复活 → 倒地），倒地则跳到 E 段后结束
│   S4  [300–399] HOT：回春 310 → 续命 320 → 回内 330 → 养势 340；03 的 hpRegen/mpRegen 在 S4 最前结算
│   S5  [400–449] 自动驱散：内功被动的自动逼毒（如九阳驱寒）、冲穴判定（§7.1）
│   S6  [450–499] 控制判定：
│         硬控（眩晕/冰冻/昏睡/点穴）存在 → 本次行动跳过（直接进入 E 段）
│         麻痹 → 掷骰，失败则跳过
│         移魂/迷惑/恐惧/嘲讽/走火入魔 → 本次行动交由对应 AI 模式（09）
│         定身/封轻功/封内力/封经脉/缴械 → 生成本次行动的禁用清单
│   S7  [500–899] 其他 onTurnStart 触发（龙象之力加层、静势检查……）
│
├─ A 段：行动（移动与行动顺序自由，基准 §8）
│   onMove（每走一格）/ onTerrainEnter / onMoveEnd / onSkillCast / 攻击管线（§5.3）/ onHeal / onItemUse
│
└─ E 段：回合结束（onTurnEnd）
    E1  [任意] onTurnEnd 触发（流血"移动加伤"、静势叠层、蓄势检查）
    E2  持续递减（跳过 fresh 与额外行动）
    E3  到期移除 → onExpire / onRemove（到期即结算的效果在此执行）
    E4  叠层衰减（expire: one 的实例）
    E5  "再动"检查 → 若有，立即开始额外行动（仅 S6 控制判定 + A 段 + E1）
    E6  收招扣减集气（09）
```

### 5.3 攻击管线中的 Buff 插入点

与基准 §9 乘区一一对应（伤害公式本体归 04）：

| 步 | 插入点（钩子） | 执行的 Buff 效果（按 priority） | 对应乘区 |
|---|---|---|---|
| P1 | `onTargeted`（守方）/ 目标合法性检查 | 隐身（非法目标）、嘲讽（强制目标）、援护（改换目标为援护者）、诈死（非法目标） | — |
| P2 | `onBeforeAttack`（攻方） | 必中/必暴/无视招架/无视防御设旗标；蓄势、铁臂等"下一击"类消耗；缴械/封经脉校验 | Z0 旗标 |
| P3a | 命中判定 → `onBeforeHit` | 残影（消耗 1 层完全闪避）；必中跳过闪避；未命中 → `onMiss`/`onDodge` | Z0 |
| P3b | `onBeforeHit`（命中后） | 斗转（整招反弹）；破 X 天阶"破招"（整招作废） | Z0 |
| P3c | 招架判定 → `onParry`/`onParried` | 破 X 招架评级加成；无视招架跳过 | Z0 / Z9 |
| P3d | 暴击判定 → `onBeforeCrit` | 破 X 地阶"不能暴击"、必暴 | Z0 / Z6 |
| P4 | 伤害计算 Z1–Z10 | 数值类 Buff 已并入属性与乘区（§4.7） | Z1–Z10 |
| P5 | `onBeforeHurt`（守方，结算前） | 无敌 100 → 挪移 120 → 金刚 140 → 刀枪不入（已在 Z4）→ **护体真气吸收** → 以气御伤（内力代扣）→ 扣气血 | settle |
| P6 | `onDeath`（若 hp ≤ 0） | 锁血 → 诈死 → 复活 → 倒地 | settle |
| P7 | `onHit`（攻方）/ `onHurt`（守方）/ `onCrit` / `onKill` | 吸血、吸内、反震、猬刺、附加 Buff 施加（招式 `buffs`）、战意、北冥受击吸内；**本次攻击若被护体真气完全吸收，其附带的 `injury`、`bleed` 标签效果不施加**（采纳 03 §5.5 建议），其余标签照常判定 | settle |
| P8 | `onAfterAttack` | 连招、追击、反击（`counter`，流程归 09）排入**反应队列** | — |

#### 5.3.1 反应队列与防循环

- P8 产生的追加攻击进入 FIFO 反应队列，当前攻击完全结算后依次执行；**队列深度 ≤ 3**（反击的反击的反击到此为止）。
- 由 `reflect`（反震）、`redirect`（挪移/援护）、`mirror`（斗转）、`counter`（反击）产生的伤害分别带旗标 `reflected` / `redirected` / `mirrored` / `countered`：**带旗标的伤害不能再被同类原语处理**（反震伤害不会被反震，挪移过来的伤害不会被再挪移，斗转回去的招式不会被斗转回来）。
- 同一实例的同一触发器在同一事件中至多执行 1 次；`limitPerTurn` 以持有者回合为周期重置。

#### 5.3.2 DOT 与 HOT 的结算管线

DOT 不走完整的 Z0–Z10（不判定命中、不暴击、不浮动），只经过以下项：

```
raw      = 条目 amount 表达式的值（多为 holder.hpMax × 比例 × stacks × Lb × pen，已含 pen）
resPart  = 1 − clamp(resEff(tag), −0.50, 0.75)                      // §3.5.2；负抗性使 DOT 增加
z4Part   = 1 − min(0.75, 0.5 × Z4通用 + Z4持续)                       // 通用减伤只吃一半；"持续伤害减免"类全额
DOT      = ⌊ raw × resPart × z4Part × Z8(snap.level, holder.Ld) × bossF ⌋
bossF    = 以 hpMax 比例为 raw 时：Boss 0.25 / 精英 0.50 / 普通 1.00（§11.4）
```

| 规则 | 说明 |
|---|---|
| 护体真气 | `bypassShield: true` 的 DOT（毒、蛊、内伤、寒毒）直接扣气血；流血、灼烧先扣护体 |
| 致死 | 战斗内 DOT 可致死（`canKill` 默认 true），走 P6 链；战斗外 `worldTick` 一律 `canKill: false`（最低留 1 点气血） |
| 合计上限 | 同一持有者每回合 DOT 合计 ≤ 12% `hpMax`（§11.1），超出部分按 priority 从后往前削减 |
| HOT | `heal = ⌊ raw × (holder.healRecv / 100) × 施加者治疗系数 ⌋`（施加者治疗系数：医术/招式来源取快照 `healPower/100`，自身内功被动取 1），走 04 治疗公式；合计 ≤ 8% `hpMax`/回合 |

### 5.4 战斗外持续（跨战斗 Buff）

#### 5.4.1 生命周期

```
战斗中挂载 ──战斗结束──► persist? ──否──► 移除
                            │是（且 tier ≥ minTier）
                            ▼
                     世界态（world）：按时辰 worldTick / worldDecay；休息、运功疗伤、医者、解药可处理
                            │
             下一场战斗开始 ▼（battleStart：层数保留，持续取定义默认）
                     战斗态（turns） …… 循环
                            │
                        书眠 ▼  → 书眠净化：全部非永久实例移除（§12.7）
```

#### 5.4.2 跨战斗 Buff 一览与恢复方式

| Buff | 何时跨战斗 | 战斗外表现（每时辰） | 自然消退 | 客栈/营地休息 | 运功疗伤（2 时辰，品阶=主运内功） | 医者（`med`→品阶，§7.1） | 解药/丹药 | 专属解法 |
|---|---|---|---|---|---|---|---|---|
| 中毒 `bf_zhongdu` | 地阶起 | −0.5%×G×层 气血（不致死） | 每 4 时辰 −1 层 | 品阶 ≤ 8 清除，否则 −3 层 | 驱散（§3.5.3） | 驱散 | 解毒丹（品阶） | — |
| 剧毒 `bf_judu` | 全部 | −1%×G 气血；不能奔跑 | 无 | −1 品（削品） | 驱散（难度同战斗） | 驱散 | 对应解药 | 施毒者本人 |
| 内伤 `bf_neishang` | 玄阶起 | 体力上限 −3%/层；每 5 层轻功值 −10 | 每 12 时辰 −1 层 | −3 层 | −2 层/次 | 品阶足够则全清 | 九花玉露丸、天香断续胶等 | 一阳指疗伤、九阴真经疗伤篇 |
| 寒毒 `bf_handu` | 全部 | 夜间/雪原 −1%×G 气血；阳性内功主运时不掉血 | 无 | 无效 | 仅阳性内功：压制 12 时辰 | 压制 24 时辰 | 暖阳丹（原创扩展，压制） | 九阳神功（天上）根治 |
| 化骨 `bf_huagu` | 全部 | 外功防御 −3%×G/层（持续） | 无 | −1 层 | 无效 | 地阶以上医者 −2 层 | 黑玉断续膏 | — |
| 异种真气 `bf_yizhongzhenqi` | 全部 | 不能闭关修炼内功；层数 ≥ 10 时每日按 05 §9.1.3 反噬判定（战斗外表现为昏沉 2 时辰） | 每日 −1 层（05） | 无 | 行动"运功化解"−3 层（05） | 无效 | 无 | 易筋经 ≥ 5 重（每回合 −2 层，05）；北冥作主运（05）；少林方丈任务 |
| 走火入魔 1–3 级 `bf_neixiwenluan` / `bf_jingmainixing` / `bf_zouhuorumo` | 全部 | 按 05 §10.1：闭关收益 −50% / 不能闭关与冲关 / 不能使用内功招式 | 1 级 1 日；2 级 5 日后每日自愈判定；3 级不自愈（05） | 无 | 无效 | 品阶足够则降 1 级 | 定神丹（原创扩展，降 1 级） | 易筋经·洗髓（05：移除 ≤ 自身品阶的 1–2 级） |
| 骨伤 `bf_gushang` | 全部 | 移动速度 −20%；不能使用 qg2 以上轻功门禁 | 7 日 | 缩短 1 日 | 无效 | 缩短 2 日 | 黑玉断续膏（立愈） | — |
| 情花毒 / 蛊 / 受制 / 生死符 / 三尸脑神丹 | 全部 | 见 §8.5、§8.9、§9 | 无 | 无 | 无效（至多压制） | 至多压制 | 仅专属解药 | 见条目 |

> 运功疗伤、休息、医者服务的**时间与费用**归 11/12；本表只定义它们对 Buff 的效果。

#### 5.4.3 重新进入战斗

- 层数保留；`turnsLeft` 取定义默认持续（含 `tierBonus`）；快照保留原施加者的快照。
- `untilCured` 型实例的 `phase` 保留（潜伏中的蛊仍在潜伏）。
- 若战斗外被削品，进入战斗时以削品后的品阶挂载。

### 5.5 永久被动

| 项 | 规则 |
|---|---|
| 来源 | 内功（主运/辅运）、拳脚/兵器/轻功被动（05 `PassiveDef` 中 `kind` 为 stat/effect/mechanic 且引用 Buff 者）、穿戴装备、套装档位（07）、天书之力（13）、天赋（03 `tal_*`）、门派身份（12，若有） |
| 实例化 | 来源生效时创建 `duration: permanent` 实例，`key = defSource`（来源即 source），`origin` 记录来源物；来源失效（卸下、辅运改主运、书眠压制）时移除或重算 |
| 主运/辅运 | 主运 100%；辅运按 05 的 `auxMode`：`scaled` 时数值 × 辅运比例（05 定义），`none` 时不生成实例；**mechanic 类默认只在主运生效** |
| 数值合并 | 被动的数值**计入**族上限（§11.1），与临时 Buff 一起合并 |
| 数量上限 | **不计入**同时存在数量上限（§11.2），UI 收纳到"常驻"栏 |
| 驱散 | `dispellable: false`；但可被**暂停**：持有者处于 `seal.mp`（封内力、十香软筋散）时，**来源为内功**的 effect/mechanic 被动暂停（图标置灰），stat 被动保留——"内力提不起来，护体神功也就失灵了" |
| 压制 | 外来武学的被动按有效品阶（05 §2.6）重新生成实例；书眠后在新书界重算 |
| 天书之力 | `origin.type = tsp`，品阶 12，不受外来压制，不可暂停【建议值，待 13 确认】 |

---

## 6. 触发器与效果原语（Buff DSL）

> 本节定义 DSL 的**语义**；解析、编译与执行器由 `tech/05` 实现。DSL = **事件钩子**（何时）× **条件 `when`**（是否）× **目标选择器**（对谁）× **原语 `op`**（做什么）。`mods` 是常驻修饰（每次属性重算时求值），`triggers` 是事件驱动的原语序列。

### 6.1 事件钩子全集

| 钩子 | 触发时机 | 触发主体 | 主要上下文 `ctx` | 可改写 | 典型 Buff |
|---|---|---|---|---|---|
| **战斗生命周期** | | | | | |
| `onBattleStart` | 入场、被动实例化之后，首个 CT tick 之前 | 每个单位 | `battle` | 初始 CT、初始气势 | 先机、龙象（首层）、狂暴计时、跨战斗 Buff 挂载 |
| `onBattleEnd` | 胜负判定后、奖励结算前 | 每个单位 | `result` | — | 跨战斗转换（§5.4）、战意清除 |
| **回合** | | | | | |
| `onTurnStart` | S 段（§5.2） | 持有者 | — | — | DOT、HOT、发作、控制判定 |
| `onTurnEnd` | E1 段 | 持有者 | `moved` `steps` `acted` `usedCats` | — | 流血移动加伤、静势叠层 |
| `onExtraAction` | E5 额外行动开始 | 持有者 | `prevCat` | 可限制可用武学大类 | 再动的附加限制（如"须换一类武学"） |
| **移动与地形** | | | | | |
| `onMove` | 每移动 1 格后 | 移动者 | `from` `to` `steps` `tile` | 可中止剩余移动 | 流血、缠绕距离检查 |
| `onMoveEnd` | 移动结束 | 移动者 | `steps` `path` | — | 残影补充（≥3 格） |
| `onTerrainEnter` | 进入与前一格地形不同的格 | 进入者 | `tile.terrain` `tile.h` | — | 毒沼→中毒、火场→灼烧、入水→解灼烧（08） |
| `onTerrainStay` | S 段开始时所在格 | 持有者 | `tile` | — | 雪原→寒气、瘴林→中毒 |
| `onDisplaced` | 被击退/牵引结算后 | 被移动者 | `dist` `collided` `fall` | — | 撞击眩晕、坠落伤害（08） |
| `onEnemyEnterAdjacent` | 敌方单位移动进入相邻格 | 持有者 | `mover` | 可中止其移动 | 截击 |
| **攻击管线（§5.3）** | | | | | |
| `onTargeted` | P1 被选为目标 | 守方 | `attacker` `move` | 改换目标 / 判为非法目标 | 援护、隐身、诈死、嘲讽 |
| `onAllyTargeted` | P1 相邻友方被选为目标 | 相邻友方 | `attacker` `move` `ally` | 改换目标为自己 | 援护 |
| `onBeforeAttack` | P2 | 攻方 | `move` `target` | `flags`、`powerMul` | 必中、必暴、蓄势、铁臂 |
| `onBeforeHit` | P3 命中判定前后 | 攻守双方 | `hitRoll` `move` | 作废攻击 / 改判闪避 | 残影、斗转、破招 |
| `onDodge` / `onMiss` | 闪避成功 | 守方 / 攻方 | `move` | — | 游势、飘忽 |
| `onParry` / `onParried` | 招架成功 | 守方 / 攻方 | `move` | — | 破 X 反击、铁臂（05） |
| `onBeforeCrit` | P3d 暴击判定 | 攻守双方 | `move` | `noCrit` / `mustCrit` | 破 X（地）、必暴 |
| `onCrit` / `onCritted` | 暴击发生 | 攻方 / 守方 | `damage` | — | 战意、露怯 |
| `onAttacked` | P3 结束（无论命中/招架/闪避） | 守方 | `result` `move` `dist` | — | 以静制动（后发制人） |
| `onBeforeHurt` | P5 伤害已算出、扣除之前 | 守方 | `damage`（可写）`dmgType` `move` `flags` | **伤害数值** | 无敌、挪移、金刚不坏、以气御伤 |
| `onHit` | P7 攻击造成伤害后 | 攻方 | `damage` `hpDamage` `shieldDamage` `target` | — | 吸血、吸内、附加 Buff |
| `onHurt` | P7 受到伤害后 | 守方 | 同上 + `attacker` `direction` | — | 反震、猬刺、北冥受击吸内 |
| `onShieldBroken` | 护体真气被打空 | 守方 | `overflow` | — | 金钟罩破罩 |
| `onKill` | 击杀 | 攻方 | `victim` | — | 战意 |
| `onDeath` | P6 hp ≤ 0 | 守方 | `killer` `damage` | **取消死亡** | 锁血、诈死、复活 |
| `onAllyDeath` | 友方倒地 | 同阵营单位 | `ally` `killer` | — | 黯然、情丝蛊 |
| `onAllyHit` | 友方命中敌人 | 同阵营单位 | `attacker` `target` `dist` | — | 追击 |
| `onAllyHurt` | 友方受伤 | 同阵营单位 | `ally` `damage` | — | 情花毒（动情）、情丝蛊 |
| `onAfterAttack` | P8 | 攻方 | `hits` `targets` | 排入反应队列 | 连招、追击 |
| **资源与行动** | | | | | |
| `onSkillCast` | 施放任一招式（扣消耗后） | 施放者 | `move` | — | 七伤拳自伤、异种真气 |
| `onUltimate` | 施放绝招 | 施放者 | `move` | — | 黯然、合璧 |
| `onHeal` / `onHealed` | 施治 / 受治 | 施治者 / 受治者 | `amount`（`onHealed` 可写） | 治疗量 | 血蛊（截取治疗） |
| `onMpSpent` | 消耗内力 | 消耗者 | `mp` | 消耗量 | 内伤加耗 |
| `onMpDrained` | 被吸内/化功 | 被吸者 | `amount` `drainer` `mode` | — | 寒冰反制 |
| `onRageFull` | 气势达到 100 | 持有者 | — | — | 势满（Boss 提示） |
| `onItemUse` | 使用物品 | 使用者 | `item` | — | 断肠草、解药 |
| `onHpBelow` | 气血**首次**跌破阈值（参数 `pct`，边沿触发，每战一次） | 持有者 | `pct` | — | 狂暴、背水 |
| **Buff 事件** | | | | | |
| `onApply` / `onRefresh` | 本实例新建 / 被刷新 | 持有者 | `by` | — | 一次性效果 |
| `onStack` / `onStackMax` | 层数变化 / 叠满 | 持有者 | `delta` | — | 寒气满层→冰冻、异种真气满层→真气逆行 |
| `onRemove` / `onExpire` / `onDispelled` | 移除（任何原因）/ 到期 / 被驱散 | 持有者 | `reason` | — | 蓄势落空、诈死起身 |
| `onBuffApplied` | 持有者获得任意 Buff | 持有者 | `buff` | 可拒绝（免疫） | 坚毅、蛊王 |
| `onBuffApply` | 持有者向他人施加 Buff | 施加者 | `buff` `target` | — | 蛊王催蛊 |
| `onImmuneBlocked` / `onResisted` | 免疫挡下 / 抵抗成功 | 持有者 | `buff` `delta` | — | 反噬类（原创扩展） |
| **战斗外（世界）** | | | | | |
| `onWorldTick` | 每经过 1 时辰（11） | 持有者 | `world` | — | 中毒、寒毒、蛊 |
| `onRest` | 完成一次休息 | 持有者 | `restType` | — | 内伤减层 |
| `onAreaEnter` | 进入区域 `rg_*` | 持有者 | `world.region` `world.weather` | — | 寒毒于雪原加剧 |
| `onCalendar` | 到达节令/日期（11） | 持有者 | `world.festival` `world.day` | — | 三尸脑神丹（端午） |
| `onTalk` | 与 NPC 对话开始（12） | 持有者 | `npc` | 追加/锁定对话选项 | 迷心蛊、易容识破 |
| `onBookSleep` | 书眠开始 | 持有者 | `nextChapter` | — | 书眠净化 |

**与 05 `PassiveDef.trigger.on` 的对应**（05 的简写在构建期展开为本表钩子）：`battleStart`→`onBattleStart`；`turnStart`→`onTurnStart`；`turnEnd`→`onTurnEnd`；`onHit`/`onHurt`/`onKill`/`onParry`/`onCrit` 同名；`hpBelow`→`onHpBelow`；`backAttacked`→`onHurt` + `when: ctx.direction == 'back'`；`meleeAttacked`→`onAttacked` + `when: ctx.move.delivery == 'melee'`；`allyAdjacent`→`onTurnStart` + `when: count(allies(holder, 1)) > 0`；`skillUsed`→`onSkillCast`。05 的 `perRound` 等价于本文 `limitPerTurn`。

### 6.2 触发器字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `on` | hookId | §6.1 |
| `when` | expr → bool | 条件；缺省为真 |
| `chance` | expr → 0–1 | 触发概率，走战斗种子 RNG（战斗外走世界种子） |
| `limitPerTurn` | int | 每个持有者回合最多触发次数（默认不限，反应类默认 1） |
| `limitPerBattle` | int | 每战上限 |
| `cooldown` | int | 触发后需经过的持有者回合数 |
| `consumeCharge` | bool | 触发后消耗 1 次 `charges`（`charges` 型默认 true） |
| `ops` | Op[] | 顺序执行；任一原语因目标无效失败时，其后原语照常执行（除非 `stopOnFail: true`） |

### 6.3 目标选择器

| 选择器 | 含义 |
|---|---|
| `holder` / `source` | 持有者 / 施加者（施加者已倒地则为空，原语跳过） |
| `attacker` / `defender` / `ctx.target` | 当前攻击管线中的攻/守方 |
| `allies(u, r)` / `enemies(u, r)` | 与 u 同阵营 / 敌对、距离 ≤ r 的单位（含/不含 u 由 `includeSelf` 指定） |
| `adjacentEnemies(u)` / `adjacentAllies(u)` | 距离 1 |
| `nearestEnemy(u, r, exclude)` | 最近敌人；同距按当前气血比例升序、再按单位 ID |
| `lowestHpAlly(u, r)` / `highestThreat(u, r)` | 气血比例最低的友方 / AI 威胁值最高的敌人（09） |
| `tiles(shape)` | 地块集合（用于地形型效果，形状模板归 05 §4 范围模板） |
| `all` | 战场全部单位 |

### 6.4 效果原语全集

| 原语 | 关键参数 | 语义 | 作用层 / 结算位置 | 备注（旗标、限制） | 典型 |
|---|---|---|---|---|---|
| **常驻修饰（只用于 `mods`）** | | | | | |
| `modStat` | `stat` `kind`(`flat`/`flatLv`/`pct`/`mult`/`pp`/`override`) `value` `when` | 修饰属性，进入 03 §11 汇总 | 属性层 | `kind` 必须符合 03 §0.2 的形态约束；`mult` 仅限天书之力等（03 §11.2） | 各数值类 |
| `modZone` | `zone`(Z2/Z3/Z4/Z5/Z7/Z9) `value` `filter`(`cat` `delivery` `element` `dmgType`) | 修饰乘区加法项 | 对应乘区 | Z4 合计 ≤ 75% | 锐意、卸力、破 X、刀枪不入 |
| `modJudge` | `key`：开关型 `mustHit` `mustCrit` `skipParry` `noCrit` `ignoreDef` `asBack` `asHigh`；数值型 `targetParryMult` `value` `when` | 判定层开关 / 乘数 | Z0 / Z2 / Z7 | 开关多来源 OR 合并；乘数取最小者 | 必中、无视招架、破 X 招架乘数 |
| `modCost` | `res`(`mp`/`rage`/`hp`) `pct` `filter` | 招式消耗倍率 | cost | 下限 −50% | 节内、耗内 |
| `modRange` | `delta` `filter` | 招式射程增减 | 05 招式射程 | 最小 1 | 真气外放、失明 |
| **伤害与恢复** | | | | | |
| `dealDamage` | `target` `amount` `dmgType`(`direct`/`dot`/`true`/`reflect`/`redirect`/`mirror`) `element` `bypassShield` `canKill` `applyZones` | 造成伤害 | settle；`dot` 走 §5.3.2 | `reflect`/`redirect`/`mirror` 自动带旗标 | DOT、反震、撞击 |
| `heal` | `target` `amount` | 治疗 | 04 治疗公式 | 受 `healRecv` | 回春 |
| `healLostPct` | `target` `pct` | 回复已损失气血的 x% | 同上 | 与 `heal` 同受 HOT 合计上限 | 续命 |
| `restoreMp` / `burnMp` | `target` `amount` | 回内 / 焚毁内力（不归自己） | settle | | 回内、化功 |
| `drainHp` | `pctOfDamage` | 按本次气血伤害回血 | settle | 合计 ≤ 25% | 嗜血 |
| `drainMp` | `mode`(`absorb` 北冥 / `seize` 吸星 / `dissolve` 化功) `amount` `overflow`(`shield`/`tempMax`/`none`) `backlash` | 吸取目标内力 | settle | 三种模式规则见 §8.3 | 北冥、吸星、化功 |
| `modRage` | `target` `value` | 增减气势 | — | 0–100 | 养势、泄气 |
| `shield` | `amount` `duration` | 增加护体真气（进入 03 `shield` 池） | settle 前 | 池上限 `shieldMax`（03，≤ 50% hpMax） | 护体真气 |
| `mpGuard` | `pct` `ratio` | 伤害的 pct 由内力按 ratio 代扣 | P5 护体之后 | 内力不足部分照扣气血 | 以气御伤 |
| **Buff 管理** | | | | | |
| `applyBuff` | `id` `target` `grade` `stacks` `duration` `chance` `params` | 施加 Buff（走完整 §4.1 流程） | — | 与 05 `BuffApply` 字段同构 | 各附加效果 |
| `removeBuff` | `target` `id`/`tags`/`polarity` `count` | 无条件移除（**不走品阶对抗**，仅限规则/剧情用） | — | 数据校验：只允许 `origin: system/story` 或自身移除 | 诈死起身、架势替换 |
| `dispel` | `target` `type` `strength` `tags` `polarity` `count` `stacks` | 驱散（走 §3.5.3 品阶对抗） | — | 见 §7.1 | 运功逼毒、医术、破功 |
| `erodeGrade` | `target` `id` `by` | 削品 | — | 同回合一次 | 由 `dispel` 内部调用 |
| `immune` | `tags` `subTags` `grade` | 声明免疫（实例存续期间有效） | 施加前 | 覆盖子标签 | 百毒不侵 |
| `reveal` | `target` `scope`(`hidden`/`veil`) | 识破隐藏实例/隐匿 | — | | 听风辨器、易容识破 |
| **机制防护** | | | | | |
| `invulnerable` | — | 伤害归零、阻挡新减益（均走 §3.5.4） | P5 最前 | | 无敌 |
| `damageCap` | `pctHpMax` | 单次伤害上限 | P5 | | 金刚不坏 |
| `lockHp` | `min`(默认 1) | 气血不低于 min | P6 | 每战 1 次 | 锁血 |
| `revive` | `hpPct` `mpPct` `cleanse` | 取消死亡并复活 | P6 | 每战 1 次；非 Boss | 复活 |
| `redirect` | `pct` `to` `as` | 按比例转移伤害 | P5 | 转移部分带 `redirected` | 挪移、援护 |
| `reflect` | `pct` `filter` | 按实受伤害反弹给攻击者 | P7 | 带 `reflected` | 反震 |
| `mirror` | `chance` `powerMul` `maxRange` | 整招反弹：守方免伤，攻方吃自己这招 | P3b | 带 `mirrored`；不能反弹高品阶绝招 | 斗转 |
| `guard` | `selector` `pct` | 代替友方承受攻击 | P1 | 每回合 1 次 | 援护 |
| `negateAttack` | `as`(`parried`/`dodged`) | 本次攻击作废 | P3b | | 破招 |
| **行动经济与控制** | | | | | |
| `extraAction` | `count`(=1) `constraints` | 本次行动后立即再行动 | E5 | 不可连锁；§11.3 | 再动 |
| `ctShift` | `target` `value` | 立即增减集气值（09） | ct | 结果钳制 0–999 | 迟缓、先机、震慑 |
| `skipAction` | `target` | 跳过本次行动 | S6 | 由硬控使用 | 眩晕、冰冻 |
| `disableAction` | `types`(`move` `attack` `item` `meditate` `ultimate` `inner` `jump`) | 禁用某类行动 | S6 清单 | | 定身、封内力 |
| `disableSkillType` | `cats`(基准 §7 大类/子类) | 禁用某类武学 | S6 清单 | | 封经脉、缴械 |
| `forceTarget` | `target` | 单体行动必须以其为目标 | P1 | 无法到达时向其移动 | 嘲讽 |
| `aiOverride` | `mode`(`charm` `control` `fear` `confuse` `berserk` `obey`) `controller` `chance` | 本次行动交由指定 AI 模式（09） | S6 | 玩家角色同样被接管 | 迷惑、移魂、受制 |
| `triggerMove` | `move`(`basic`/`current`/moveId) `powerMul` `target` `tag` | 立即施放一次招式（不消耗行动，消耗照付/可免） | 反应队列 | `tag` ∈ `counter` `combo` `followup` | 反击、连招、追击 |
| **位移与隐匿** | | | | | |
| `displace` | `mode`(`knock`/`pull`/`swap`) `dist` `collideDmg` | 位移 | 瞬时 | 高差/坠落交 08 | 击退、牵引 |
| `stealth` | `breakOn`(`attack` `hurt` `aoe`) | 隐身 | P1 | | 隐身 |
| `summon` | `unit` `count` `hp` `duration` | 召唤单位（Boss 分身、蛇群） | — | 召唤物 ≤ 3 | Boss 专用 |
| **兵器** | | | | | |
| `weaponBreak` | `mode`(`disarm` 缴械 / `break` 断兵) `cat` `grade` | 缴械：武器类武学与武器属性失效 N 回合；断兵：主武器攻击 −X% 直至修复（10） | settle | 天阶神兵对更低品阶免疫（`bf_mian_pobing`） | 缴械、断兵 |
| **杂项** | | | | | |
| `setFlag` / `clearFlag` | `flag` `scope`(`attack`/`turn`/`battle`) | 设置临时旗标 | — | | 各处 |
| `setPhase` | `phase` | 切换蛊/受制阶段 | — | | 蛊 |
| `convertDamage` | `from`(`out`) `to`(`in`) `pct` | 外劲伤害部分转为内劲 | Z1 前 | | 转劲 |
| `modTerrain` | `terrain` `costMul` `passable` | 持有者对某地形的通行规则（08） | 寻路 | | 踏雪无痕类 |
| `log` / `vfx` / `sfx` | `template` / `key` | 表现 | 表现层事件 | 不影响逻辑 | 全部 |

### 6.5 TypeScript 类型（`packages/data` Zod 同构，tech/05 实现）

```ts
export type BuffCategory = 'stat' | 'effect' | 'mechanic';
export type Polarity = 'buff' | 'debuff';
export type Tier = 'huang' | 'xuan' | 'di' | 'tian';
export type StackRule = 'refresh' | 'stack' | 'independent' | 'highest';
export type DispelType = 'circulate' | 'acupoint' | 'medicine' | 'antidote' | 'skill' | 'purge' | 'special' | 'rest';
export type Expr = string;                               // 构建期编译为 AST

export interface BuffDef {
  id: `bf_${string}`; name: string; nameByTier?: Partial<Record<Tier, string>>;
  category: BuffCategory; polarity: Polarity;
  grade: 'inherit' | Grade; gradeRange: [Grade, Grade];
  tags: TagId[]; subTags?: string[]; family?: `fam_${string}`; exclusive?: `exg_${string}`;
  resistAttr?: ResistId | null;
  duration: { type: 'turns'|'permanent'|'charges'|'battle'|'world'|'untilCured'|'aura'|'instant';
              value?: number; tierBonus?: Partial<Record<Tier, number>>; fresh?: 'skipFirst'|'countNow'; maxTurns?: number; radius?: number };
  stack: { rule: StackRule; key?: 'def'|'defSource'|'defParam'; max?: number; add?: number;
           durationOnStack?: 'max'|'reset'|'keep'; expire?: 'all'|'one'; snapshotMerge?: 'max'|'latest'; onMax?: Op[] };
  dispel: { dispellable: boolean; types?: DispelType[]; stacksPerDispel?: number; difficulty?: number; specialCures?: CureRef[] };
  priority: number; params?: Record<string, Expr>; snapshot?: AttrId[];
  mods?: Mod[]; triggers?: Trigger[]; onApply?: Op[]; onRemove?: Op[];
  tierTraits?: Partial<Record<Tier, { mods?: Mod[]; triggers?: Trigger[] }>>;
  reactions?: Reaction[]; persist?: PersistSpec; bossProfile?: BossProfile;
  limits?: { cooldown?: number; perBattle?: number; maxDuration?: number };
  hidden?: boolean; ui: UiSpec; vfx?: Record<string, string>; sfx?: Record<string, string>;
  text: { desc: string; short: string; log: string; lore?: string };
  aiValue?: Expr; origin: 'canon'|'expanded'|'canonExpanded'; canonRef?: string;
}
```

---

## 7. 驱散与免疫

### 7.1 驱散类型

| ID | 名称 | 施行方式 | 强度品阶 `gd` | 可处理的标签（主/子） | 每次处理量 | 代价 | 场合 |
|---|---|---|---|---|---|---|---|
| `circulate` | 运功逼毒 / 运功疗伤 | 行动"运功调息"的逼毒分支（09）；只对自身 | 主运内功 `effGrade` | `poison`、`injury`、`heat`、`cold.chill`、`seal.qg`、`seal.meridian`、`mind.confuse`；**寒毒**只有主运为阳性/调和内功时可"压制"（暂停 2 回合，不移除） | 1 个效果；叠层型 3 层 | 本次行动 + 内力 8% `mpMax` | 战斗内/外（外：2 时辰） |
| `acupoint` | 冲穴 / 解穴 | **冲穴**：S5 段自动判定（被点穴者）；**解穴**：队友行动，需相邻且装配带 `seal` 标签招式的指法/擒拿武学 | 冲穴：主运内功 `effGrade`；解穴：该武学 `effGrade` | `seal`（全部子标签） | 冲穴：仅 `seal.point`；解穴：全部 `seal` | 冲穴无；解穴消耗该队友本次行动 | 战斗内 |
| `medicine` | 医术 | 杂学·医的招式（05）或医者 NPC 服务（12） | `medGrade(med)`（下表） | `poison`、`injury`、`bleed`、`cold`、`heat`、`mind`、`weaken`、`cc.slow`、`cc.paralyze`；`seal` 以难度 +1 处理（金针渡穴）；`gu` 只能**压制** | 2 个效果；叠层全部 | 本次行动 + 药材（10） | 内/外 |
| `antidote` | 解药 / 丹药 | 使用物品 | 物品有效品阶 | 物品配置的标签（例：九花玉露丸 `injury`；辟毒丹 `poison`） | 物品配置 | 物品 | 内/外 |
| `skill` | 特定武功 | 武功被动（自动）或招式 | 该武功 `effGrade` | 武功配置（下表） | 武功配置 | 武功配置 | 内/外 |
| `purge` | 破功（驱散增益） | 敌方招式附带 | 招式 `effGrade` | 增益的 `boost`、`guard`、`stance`、`veil`、`weaponBreak`（破 X 临时版） | 1 个（按 priority 高者先） | — | 战斗内 |
| `special` | 专属解法 | 条目 `specialCures` 列出的物品/NPC/任务/武功 | 解法要求的最低品阶 | `gu`、`bind`、`poison.qinghua`、`cold.poison`（根治） | 条目定义 | 条目定义 | 多为战斗外 |
| `rest` | 休息 | 客栈/营地（11） | —（按 `persist.rest` 配置） | 跨战斗减益 | 条目定义 | 时间、银两 | 战斗外 |
| `bookSleep` | 书眠净化 | 书眠流程（02） | 无视品阶 | 全部非永久实例（含蛊与受制） | 全部 | — | 书眠 |

**`medGrade`：技艺值 → 驱散品阶**（`antidote` 解毒技艺同表，处理 `poison`/`gu` 时取 `max(medGrade(med), medGrade(antidote))`）：

| 技艺值 | 0–8 | 9–17 | 18–26 | 27–35 | 36–44 | 45–53 | 54–62 | 63–71 | 72–80 | 81–89 | 90–98 | 99–100 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 品阶 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |

公式：`medGrade(v) = min(12, 1 + ⌊v / 9⌋)`。原著名医参考（NPC 技艺由 12 定级）：薛慕华（天龙）、胡青牛（倚天）、平一指（笑傲）、程灵素（飞狐）。

**冲穴概率**（被 `seal.point` 点穴者在 S5 段自动判定，成功则本次行动正常进行）：

```
P冲穴 = clamp(5%, 95%, 25% + 15% × (g主运内功 − g点穴) + 0.3% × (con − 50))
```

另：点穴期间每次受到伤害，有 20% 概率"撞开穴道"（天阶点穴 10%）。

**`skill` 型驱散（特定武功，节选；完整配置随图鉴）**：

| 武功 | 处理 | 规则 | 原著依据 |
|---|---|---|---|
| 九阳神功 `sk_jiuyang` | `cold`（含寒毒根治） | 主运时 S5 段自动 `circulate`，对 `cold` 标签难度 −1；寒毒只有九阳可根治 | 倚天·张无忌以九阳神功驱尽玄冥寒毒 |
| 易筋经 `sk_yijinjing` | `injury.qi`（异种真气、走火入魔）、`poison`、`injury`、`mind` | 以 05 §13 为准：被动"伐毛洗髓"每回合驱散 1 个中毒/内伤；"化异种真气"每回合 −2 层（10 重 −5）；招式"洗髓"驱散多类减益并可移除走火 1–2 级 | 笑傲·方证欲以易筋经为令狐冲化解异种真气 |
| 一阳指 `sk_yiyangzhi` | `injury`、`seal` | 解穴与疗伤；以一阳指疗伤时施术者获得虚弱（Z3 −5%×G）3 回合并损内力 30% | 射雕·一灯大师以一阳指救黄蓉，功力大损 |
| 九阴真经·疗伤篇（`sk_jiuyin` 附属被动） | `injury` | 战斗外：两人同在 6 时辰，清除一方全部内伤 | 射雕·郭靖黄蓉牛家村密室疗伤七日七夜 |
| 天山六阳掌 `sk_liuyangzhang` | `bind.shengsi` | 唯一可拔除生死符的武学（品阶 ≥ 符品阶） | 天龙·虚竹以天山六阳掌为群豪拔除生死符 |
| 清心普善咒（杂学·音律，地中，原创扩展定级） | `mind` | 音律招式：半径 3 内友方每回合 `medicine` 等效驱散 1 个 `mind` 效果 | 笑傲·任盈盈抚琴为令狐冲调理内息 |
| 北冥神功 `sk_beiming` | `injury.qi` | 北冥作主运时，异种真气每层转化为 2% 当前内力并移除，不反噬（05 §9.1.3，原创设定） | 二者渊源原著未明言（待考） |

### 7.2 免疫、抵抗、驱散、无敌、净化的区别

| 机制 | 何时起作用 | 对象 | 品阶对抗 | 对**新**效果 | 对**已有**效果 | 能否部分生效 | 例 |
|---|---|---|---|---|---|---|---|
| **免疫** `immune` | 施加前 | 按标签匹配的减益 | ✅ 免疫品阶 vs 效果品阶（§3.5.1） | 阻挡；高品阶部分穿透 | 获得瞬间"免疫净化"（§3.5.5）；蛊/受制只压制 | 是（数值 × ρ / 概率 ρ） | 百毒不侵 |
| **抵抗** `resist` | 施加时掷骰 + DOT 每跳 | 带 `resistAttr` 的减益 | ✅ `resGrade` vs 效果品阶（§3.5.2） | 降低命中概率（04） | DOT 每跳按抗性减免 | 天然是概率/比例 | 抗毒 40% |
| **驱散** `dispel` | 主动行动或自动触发 | 按类型与标签匹配的已有效果 | ✅ 驱散品阶 vs 效果品阶（§3.5.3） | 无 | 移除 / 削品 | 削品 | 运功逼毒 |
| **无敌** `invulnerable` | P5 与施加前 | 一切伤害与一切减益 | ✅ 对招式品阶（§3.5.4） | 阻挡（高品阶按 ρ 穿透） | 不影响已有减益（DOT 仍按 0 伤害结算：无敌期间 DOT 伤害归零） | 是 | 金刚不坏体绝招 |
| **书眠净化** | 书眠 | 全部非永久 | ✗ | — | 全部移除 | 否 | — |

一句话：**免疫是"门"，抵抗是"墙"，驱散是"药"，无敌是"罩"**。门按标签整类拦截但怕更高品阶的撞击；墙按百分比挡一部分且品阶不够会变薄；药治已经发生的事；罩什么都挡但时间极短、次数受限。

### 7.3 免疫的实现规则

| 规则 | 说明 |
|---|---|
| 免疫本身是 Buff | `category: mechanic`、`tags: [guard]`、`subTags: [guard.immune]`，带品阶，可被 `purge`（临时版）或 `dispellable: false`（永久被动版） |
| 覆盖范围 | 免疫主标签覆盖其全部子标签；免疫子标签只覆盖该子标签。效果有多个标签时，**任一标签被覆盖即判定免疫**（例：寒毒 `[cold, injury]` 可被"免疫寒"或"免疫内伤"阻挡） |
| 只挡减益 | 免疫从不阻挡增益；不减少直接伤害（刀枪不入这类减伤属于 Z4，不是免疫） |
| 多重免疫 | 取覆盖该效果的最高品阶免疫计算 Δ，不连乘 |
| 与抵抗的关系 | 免疫判定在前；被部分穿透的效果**仍需**再过抵抗判定（先门后墙）。但部分穿透后的效果不再二次削减数值（`pen` 已含免疫削减，抵抗只影响命中概率与 DOT 的 `resPart`） |
| 系统免疫 | Boss 的心神/受制免疫、坚毅（硬控后短暂免疫）由系统 Buff 实现（§8.9、§11.4），同样有品阶（= Boss 最高武学品阶 / 12） |

### 7.4 标签体系

**主标签**：基准 §10 的 12 个 + 本文提案 4 个（`bind`、`veil`、`boost`、`weaken`，见 §15 提案 P1）。子标签用点号，免疫/驱散可精确到子标签。

| 主标签 | 名称 | 子标签 | 抵抗属性 | 常用驱散 |
|---|---|---|---|---|
| `poison` | 毒 | `poison.common` 中毒、`poison.severe` 剧毒、`poison.snake` 蛇毒、`poison.numb` 麻药、`poison.gas` 迷烟毒雾、`poison.huagong` 化功、`poison.qixin` 七心海棠、`poison.qinghua` 情花毒 | `resPoison` | 运/医/药/武 |
| `gu` | 蛊 | `gu.jincan` `gu.bican` `gu.sanshi` `gu.wuxian`（五仙教诸蛊） | `resGu` | 专（医只压制） |
| `seal` | 穴 | `seal.point` 点穴、`seal.mp` 封内力、`seal.qg` 封轻功、`seal.meridian` 封经脉、`seal.ult` 封绝（不能施放绝招） | `resSeal` | 穴/医/武 |
| `injury` | 内伤 | `injury.internal` 内伤、`injury.bone` 骨伤/化骨、`injury.qi` 异种真气/走火、`injury.blood` 凝血 | `resInjury` | 运/医/药/武/休 |
| `bleed` | 流血 | `bleed` | `resInjury`（×0.5，建议） | 医/药/休 |
| `cold` | 寒 | `cold.chill` 寒气、`cold.freeze` 冰冻、`cold.poison` 寒毒 | `resCold` | 运/医/武；寒毒专 |
| `heat` | 热 | `heat.burn` 灼烧 | `resHeat` | 运/医/入水 |
| `cc` | 控制 | `cc.stun` 眩晕、`cc.root` 定身、`cc.knock` 击退、`cc.pull` 牵引、`cc.freeze` 冰冻、`cc.sleep` 昏睡、`cc.slow` 减速、`cc.paralyze` 麻痹、`cc.stagger` 失衡、`cc.delay` 迟缓、`cc.bind` 缠绕 | `resCC` | 医（软控）/ 时间 |
| `guard` | 护体（增益） | `guard.shield` `guard.reflect` `guard.invuln` `guard.lock` `guard.cap` `guard.redirect` `guard.mirror` `guard.immune` `guard.revive` | — | 破 |
| `mind` | 心神 | `mind.charm` 迷惑、`mind.control` 移魂、`mind.taunt` 嘲讽、`mind.fear` 恐惧、`mind.confuse` 乱心、`mind.awe` 震慑 | `resMind` | 医/武 |
| `weaponBreak` | 破兵 | 增益：`weaponBreak.<cat>`（破 X，cat ∈ 基准 §7 八类 + `inner`）；减益：`weaponBreak.disarm` 缴械、`weaponBreak.broken` 断兵、`weaponBreak.exposed` 破招（门户洞开） | —（`effRes`） | 破（增益）/ 时间、修复（减益） |
| `stance` | 架势 | `stance.def` `stance.atk` `stance.charge` `stance.mobile` `stance.still` `stance.wild` | — | 破 |
| `bind` ★ | 受制 | `bind.baotai` 豹胎易筋丸、`bind.shengsi` 生死符、`bind.sanshi` 三尸脑神丹、`bind.gu` 蛊主之制 | —（`effRes`） | 专 |
| `veil` ★ | 隐匿 | `veil.stealth` 隐身、`veil.afterimage` 残影、`veil.disguise` 易容、`veil.feign` 诈死 | — | 破、识破 |
| `boost` ★ | 强化 | `boost.<stat>`、`boost.regen`、`boost.tempo`（再动）、`boost.berserk`（狂暴） | — | 破 |
| `weaken` ★ | 削弱 | `weaken.<stat>`、`weaken.mark`（锁定/易伤）、`weaken.sight`（失明） | —（`effRes`） | 运/医/药 |

> ★ = 本文提案的新主标签（基准 §10 未列，见 §15 P1）。构建期标签白名单暂含这 4 个；若基准不采纳，回退方案为：`bind` 并入 `gu`/`poison` 的子标签（`gu.bind`、`poison.bind`），`veil` 并入 `guard.veil`，`boost`/`weaken` 取消（纯数值增减益不打主标签，只按极性驱散）。

---

## 8. Buff 目录

### 8.0 读表约定

| 列 | 记法 |
|---|---|
| 类极 | `S+` 数值增益 / `S−` 数值减益 / `E+` 效果增益 / `E−` 效果减益 / `M+` 机制增益 / `M−` 机制减益 |
| 品阶 | 允许的 `gradeRange`（**原生**品阶区间）；"系统"= 定值。经外来压制（基准 §3）降低的实例可以低于下限，校验只针对数据表中的原生值 |
| 数值 | **先写作用位置**（§4.7 记法），再写按品阶公式；`G` 见 §3.4；武功来源另乘 `Lb`（§3.2）；"玄+/地+/天"为大阶质变 |
| 持续 | `3` = 3 回合；`3⁺` = 地/天阶 +1；`∞` 永久（被动/装备）；`战` 本场战斗；`×n` 次数；`瞬` 瞬时；`治` 直到解除；`光r` 光环半径 r；`世n` 世界时间 n 时辰；后缀 `·界` 跨战斗，`·界地`/`·界玄` 指该大阶起跨战斗 |
| 叠加 | `R` 刷新 / `S5` 叠 5 层 / `I3` 独立至多 3 个 / `H` 取高；括号内为 `key` 非默认时的说明 |
| 驱散 | `运` circulate / `穴` acupoint / `医` medicine / `药` antidote / `武` skill / `破` purge / `专` special / `休` rest / `✗` 不可驱散（书眠净化对所有非永久实例恒有效，不再列出） |
| 来源 | 典型武功/物品/地形；原著出处与"（原创扩展）""（待考）"标注 |

### 8.1 数值类 · 增益（41 条）

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_waigong_sheng` | 外攻提升 | S+ | 1–12 | `attr:atkOut pct +6%×G` | 3⁺ | R | boost.atk | 破 | 大力丸（原创扩展）；少林罗汉拳"怒目"（招名原创扩展） |
| `bf_neijin_sheng` | 内劲提升 | S+ | 1–12 | `attr:atkIn pct +6%×G` | 3⁺ | R | boost.atk | 破 | 紫霞神功运功（笑傲·华山，地上）；九转丹（原创扩展） |
| `bf_quanli` | 全力 | S+ | 1–12 | `attr:atkOut pct +4%×G`、`attr:atkIn pct +4%×G` | 2⁺ | R | boost.atk | 破 | 运功蓄力类招式；战鼓（原创扩展） |
| `bf_waifang_sheng` | 外防提升 | S+ | 1–12 | `attr:defOut pct +8%×G` | 3⁺ | R | boost.def | 破 | 铁布衫、金钟罩（少林横练，地下–地中） |
| `bf_neifang_sheng` | 内防提升 | S+ | 1–12 | `attr:defIn pct +8%×G` | 3⁺ | R | boost.def | 破 | 峨眉"佛光护体"、武当"真武守一"（均原创扩展） |
| `bf_jiangu` | 坚固 | S+ | 1–12 | `attr:defOut pct +5%×G`、`attr:defIn pct +5%×G` | 3⁺ | R | boost.def | 破 | 防御行动（09，品阶=主运内功）；龟甲丹（原创扩展） |
| `bf_ningshen` | 凝神 | S+ | 1–12 | `attr:hit pct +4%×G` | 3⁺ | R | boost.hit | 破 | 弹指神通瞄势（射雕·桃花岛）；鹰目散（原创扩展） |
| `bf_piaohu` | 飘忽 | S+ | 1–12 | `attr:eva pct +4%×G` | 3⁺ | R | boost.eva | 破 | 各派轻功招式（梯云纵、踏雪无痕等） |
| `bf_yuanzhuan` | 圆转 | S+ | 1–12 | `attr:parry pct +4%×G`；玄+：`Z9 +1×G pp` | 3⁺ | R | boost.parry | 破 | 太极剑剑意（倚天·武当；招名原创扩展） |
| `bf_dongxi` | 洞隙 | S+ | 1–12 | `attr:pierce pct +4%×G` | 3⁺ | R | boost.pierce | 破 | 独孤九剑总诀式（被动）；庖丁解牛掌（书剑·陈家洛） |
| `bf_huixin` | 会心 | S+ | 1–12 | `attr:crit pct +4%×G` | 3⁺ | R | boost.crit | 破 | 悟性类心法；醉意（`bf_zuiyi`） |
| `bf_shichen` | 势沉 | S+ | 1–12 | `attr:critDmg pp +10×G`（即 Z6 倍率） | 3⁺ | R | boost.critDmg | 破 | 降龙十八掌蓄劲（射雕）；胡家刀法（飞狐） |
| `bf_renjin` | 韧劲 | S+ | 1–12 | `attr:tough pct +4%×G` | 3⁺ | R | boost.tough | 破 | 横练类被动 |
| `bf_jisu` | 疾速 | S+ | 1–12 | `attr:spd pct +3%×G`；天：施加时额外 `ct +100` | 3⁺ | R | boost.spd | 破 | 辟邪剑法、葵花宝典（笑傲）；神行丹（原创扩展） |
| `bf_jixing` | 疾行 | S+ | 1–12 | `attr:mov flat +1`（1–6）/ `+2`（7–12） | 3 | R | boost.mov | 破 | 轻功招式 |
| `bf_tengyue` | 腾跃 | S+ | 1–12 | `attr:jump flat +1`（1–6）/ `+2`（7–12） | 3 | R | boost.mov | 破 | 轻功招式；八步赶蝉（原创扩展） |
| `bf_shenqing` | 身轻如燕 | S+ | 1–12 | `attr:qinggong flat +10×G`（可临时达到更高轻功境界，跨越地形门禁，基准 §11） | 战斗 3；探索 世6 | R | boost.mov | 破 | 梯云纵（倚天·武当）；轻身丹（原创扩展） |
| `bf_jingzhun` | 精准 | S+ | 1–12 | `attr:effHit pct +5%×G` | 3⁺ | R | boost.effHit | 破 | 毒术、点穴类心法 |
| `bf_shouyi` | 守一 | S+ | 1–12 | `attr:effRes pct +5%×G` | 3⁺ | R | boost.effRes | 破 | 道家心法；定心丸（原创扩展） |
| `bf_bidu` | 辟毒 | S+ | 1–12 | `attr:resPoison pp +4×G` | 3⁺；装备 ∞ | R | boost.res | 破 | 辟毒丹、雄黄（原创扩展） |
| `bf_bigu` | 辟蛊 | S+ | 1–12 | `attr:resGu pp +4×G` | 同上 | R | boost.res | 破 | 五仙教秘药（原创扩展） |
| `bf_huxue` | 护穴 | S+ | 1–12 | `attr:resSeal pp +4×G` | 同上 | R | boost.res | 破 | 闭穴功（原创扩展） |
| `bf_guben` | 固本 | S+ | 1–12 | `attr:resInjury pp +4×G` | 同上 | R | boost.res | 破 | 内功护体被动 |
| `bf_yuhan` | 御寒 | S+ | 1–12 | `attr:resCold pp +4×G` | 同上 | R | boost.res | 破 | 烈酒、狐裘（10） |
| `bf_bihuo` | 避火 | S+ | 1–12 | `attr:resHeat pp +4×G` | 同上 | R | boost.res | 破 | 冰蚕衣（原创扩展） |
| `bf_dingxin` | 定心 | S+ | 1–12 | `attr:resMind pp +4×G` | 同上 | R | boost.res | 破 | 清心普善咒（笑傲）；佛门心法 |
| `bf_wenzhong` | 稳重 | S+ | 1–12 | `attr:resCC pp +4×G` | 同上 | R | boost.res | 破 | 千斤坠（通用武侠，原创扩展） |
| `bf_miaoshou` | 妙手 | S+ | 1–12 | `attr:healPower pp +5×G` | 3⁺ | R | boost.heal | 破 | 医术杂学被动 |
| `bf_huoluo` | 活络 | S+ | 1–12 | `attr:healRecv pp +6×G` | 3⁺ | R | boost.heal | 破 | 推宫过血（原创扩展）；天香断续胶（笑傲·恒山） |
| `bf_ruiyi` | 锐意 | S+ | 1–12 | `Z3 +5%×G` | 3⁺ | R | boost.dmg | 破 | 鼓舞类（原创扩展）；天书之力（13） |
| `bf_xieli` | 卸力 | S+ | 1–12 | `Z4 +5%×G` | 3⁺ | R | boost.dmgDown | 破 | 太极拳"卸劲"（倚天）；防御行动 |
| `bf_toujin` | 透劲 | S+ | 1–12 | `Z2 防御穿透 +5%×G` | 3⁺ | R | boost.pierceDef | 破 | 隔山打牛（原创扩展） |
| `bf_sici` | 伺机 | S+ | 1–12 | `attr:counter pp +2×G` | 3⁺ | R | boost.counter | 破 | 后发类武学被动 |
| `bf_lianhuan` | 连环 | S+ | 1–12 | `attr:combo pp +2×G` | 3⁺ | R | boost.combo | 破 | 快剑快刀类（辟邪剑法等） |
| `bf_renxue` | 认穴 | S+ | 1–12 | `attr:seal pp +3×G` | 3⁺ | R | boost.seal | 破 | 一阳指（天龙/射雕）、兰花拂穴手（射雕·桃花岛） |
| `bf_juqi` | 聚气 | S+ | 1–12 | `attr:rageGain pp +10×G`；施加时 `rage +5` | 3 | R | boost.rage | 破 | 呐喊（原创扩展） |
| `bf_jienei` | 节内 | S+ | 1–12 | `cost mp −4%×G` | 3⁺ | R | boost.cost | 破 | 内功圆融类被动 |
| `bf_tiebi` | 铁臂 | S+ | 1–12 | 下一次**拳掌**招式 `Z3 +10%×G`（玄中 ≈ 15%） | ×1（至多 2 回合） | R | boost.dmg | 破 | 铁砂掌·铁臂（05 §2.8 示例，招架后触发） |
| `bf_longxiang` | 龙象之力 | S+ | 7–11 | 每层 `attr:atkOut pct +1%×G`、`attr:atkIn pct +1%×G`；主运时每回合开始 +1 层；层数上限 = 龙象般若功有效层数 | 战 | S10 | boost.atk | ✗（被动） | 龙象般若功（神雕·金轮法王，天中）："每层一龙一象之力"（数值化为原创扩展） |
| `bf_zhanyi` | 战意 | S+ | 1–12 | 每层 `Z3 +2%×G`；击杀或暴击时 +1 层 | 3 | S5（latest） | boost.dmg | 破 | 胡家刀法（飞狐/雪山，解释为原创扩展） |
| `bf_anran` | 黯然 | S+ | 10–11 | `Z3 +8%×G × (1 − hpPct)`；本方羁绊队友倒地或未上阵时 ×1.5 | ∞（装配时） | H | boost.dmg | ✗ | 黯然销魂掌（神雕·杨过）：心有所感方显威力（原著设定意涵；数值原创扩展） |

### 8.2 数值类 · 减益（22 条）

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_waigong_jiang` | 脱力 | S− | 1–12 | `attr:atkOut pct −5%×G` | 2⁺ | R | weaken.atk | 运医药 | 太极拳借力卸劲；擒拿卸劲 |
| `bf_neijin_jiang` | 气散 | S− | 1–12 | `attr:atkIn pct −5%×G` | 2⁺ | R | weaken.atk | 运医药 | 化功大法、独孤九剑破气式（附带） |
| `bf_pojia` | 破甲 | S− | 1–12 | `attr:defOut pct −6%×G` | 2⁺ | R | weaken.def | 医药 | 铁砂掌·开碑手（05 §2.8）；重兵器 |
| `bf_sangong` | 散功 | S− | 1–12 | `attr:defIn pct −6%×G` | 2⁺ | R | weaken.def | 运医药 | 破气式；化功大法 |
| `bf_muxuan` | 目眩 | S− | 1–9 | `attr:hit pct −4%×G` | 2 | R | weaken.hit | 医药 | 强光、烟尘（原创扩展） |
| `bf_chizhi` | 迟滞 | S− | 1–12 | `attr:eva pct −4%×G` | 2⁺ | R | weaken.eva | 运医 | 缠丝劲（原创扩展）；泥沼地形 |
| `bf_polu` | 破绽 | S− | 1–12 | `attr:parry pct −4%×G` | 2⁺ | R | weaken.parry | 医 | 打狗棒法"挑字诀"（射雕）；料敌机先（原创扩展） |
| `bf_qinei` | 气馁 | S− | 1–12 | `attr:crit pct −4%×G` | 2⁺ | R | weaken.crit | 医 | 震慑附带 |
| `bf_luqie` | 露怯 | S− | 1–12 | `attr:tough pct −4%×G` | 2⁺ | R | weaken.tough | 医 | 被暴击后（原创扩展） |
| `bf_panshan` | 蹒跚 | S− | 1–12 | `attr:mov flat −1`（1–6）/ `−2`（7–12），最低 1 | 2 | R | weaken.mov | 医药 | 扫堂腿；绊马索（10） |
| `bf_dongyao` | 动摇 | S− | 1–12 | `attr:effRes pct −5%×G` | 2⁺ | R | weaken.effRes | 医 | 碧海潮生曲前奏（射雕·黄药师）；摄心术（原创扩展） |
| `bf_kangxing_jiang` | 抗性削弱 | S− | 1–12 | `attr:res<tag> pp −4×G`（参数 `tag`） | 3⁺ | R（defParam） | weaken.res | 医药 | 五毒教"毒引"（原创扩展）；寒冰真气削 `resCold` |
| `bf_nanyu` | 创口难愈 | S− | 1–12 | `attr:healRecv pp −8×G` | 3⁺ | R | weaken.heal | 医药 | 血刀（连城·血刀老祖）；剧毒附带 |
| `bf_yishang` | 易伤 | S− | 1–12 | `Z4 −5%×G`（受到伤害增加） | 2⁺ | R | weaken.mark | 医 | 罩门暴露；合围（09） |
| `bf_xuruo` | 虚弱 | S− | 1–12 | `Z3 −5%×G` | 2⁺ | R | weaken.dmg | 运医药 | 一阳指疗伤的代价；十香软筋散附带 |
| `bf_xieqi` | 泄气 | S− | 1–12 | 施加时 `rage −10×G`（取整，最低 0）；`attr:rageGain pp −30` | 2 | R | weaken.rage | 医 | 狮子吼附带；辱骂（口才，原创扩展） |
| `bf_haonei` | 耗内 | S− | 1–12 | `cost mp +5%×G` | 3⁺ | R | weaken.cost | 运医 | 化功侵体、内伤附带 |
| `bf_shimang` | 失明 | S− | 1–6 | `attr:hit pct −8%×G`；`range −2`（最低 1）；不能选择 3 格外目标 | 1⁺ | R | weaken.sight | 医药；入水格解除 | 石灰粉（鹿鼎·韦小宝惯用下三滥手段，细节待考）；毒粉 |
| `bf_poyin` | 破隐 | S− | 1–12 | 不能获得 `veil` 类增益；`attr:eva pct −2%×G` | 3 | R | weaken | 医 | 听风辨器附带；火把、洒灰（原创扩展） |
| `bf_suoding` | 锁定 | S− | 1–12 | 受到**施加者阵营**的伤害 `Z4 −3%×G`；每个施加者一个实例 | 2⁺ | R（defSource） | weaken.mark | 医 | 天罡北斗阵合围（射雕·全真；合击细则 09） |
| `bf_zhongchuang` | 重创 | S− | 系统 | `attr:hpMax pct −20%` | 战 | R | weaken | ✗ | 复活、锁血、诈死生效后的系统代价（§8.9） |
| `bf_gushang` | 骨伤 | S− | 4–12 | `attr:mov flat −1`、`attr:atkOut pct −4%×G`、不能跃上 ≥ 2 级高差 | 5·界 | R | injury.bone | 医药休 | 大力金刚指（倚天·俞岱岩所受之伤，细节待考）；坠落（08） |

### 8.3 效果类 · 恢复与吸取（12 条）

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_huichun` | 回春 | E+ | 1–12 | S4：回复 `hpMax × 1%×G`（"每回合回血 X 点"：施加时即算出 X 并显示） | 3⁺；被动 ∞ | R | boost.regen | 破 | 医者"回春术"（原创扩展）；九阳神功常驻（天上：生生不息，数值原创扩展） |
| `bf_xuming` | 续命 | E+ | 1–12 | S4：回复**已损失**气血的 `3%×G`（`healLostPct`；天上 10.5%） | 3⁺ | R | boost.regen | 破 | 九花玉露丸（射雕·桃花岛）；大还丹（少林，品阶由 10 定） |
| `bf_huinei` | 回内 | E+ | 1–12 | S4：回复 `mpMax × 1.5%×G` | 3⁺ | R | boost.regen | 破 | 运功调息的延续；玉蜂浆（神雕·古墓，功效细节待考） |
| `bf_yangshi` | 养势 | E+ | 1–12 | S4：`rage +3×G` | 3 | R | boost.rage | 破 | 静坐守势（原创扩展） |
| `bf_tiaoxi` | 调息 | E+ | 1–12 | 行动"运功调息"后获得：下一回合 S4 回复 `mpMax × 3%×G`；期间 `attr:defOut/defIn pct +10%` | 1 | R | boost.regen | 破 | 行动"运功调息"（09），品阶 = 主运内功 |
| `bf_qingxin` | 清心 | E+ | 1–12 | S5：对自身执行等效 `medicine`（品阶 = 本 Buff）驱散 1 个 `mind` 效果；S4 回复 `mpMax × 1%×G` | 3 | R | boost.regen | 破 | 清心普善咒（笑傲·任盈盈；音律，原创定级地中） |
| `bf_shixue` | 嗜血 | E+ | 1–12 | settle：回复本次**气血伤害**的 `3%×G`（`drainHp`，合计 ≤ 25%） | 3⁺ | R | boost.drain | 破 | 血刀经（连城·血刀门）；嗜血魔功（原创扩展） |
| `bf_beiming` | 北冥真气 | E+ | 7–12 | 吸内·**纳**（`drainMp mode: absorb`），规则见下表 | ∞（北冥主运/辅运） | H | boost.drain | ✗ | 北冥神功（天龙·逍遥派，天上） |
| `bf_xixing` | 吸星 | E+ | 7–11 | 吸内·**夺**（`mode: seize`），规则见下表 | ∞（吸星主运/辅运） | H | boost.drain | ✗ | 吸星大法（笑傲·日月神教·任我行，天中） |
| `bf_huagong` | 化功 | E+ | 4–9 | 吸内·**化**（`mode: dissolve`），规则见下表 | ∞（化功大法装配时） | H | boost.drain | ✗ | 化功大法（天龙·星宿派·丁春秋，地上） |
| `bf_huagong_qin` | 化功侵体 | E− | 4–9 | 每层：S4 前内力再生 −20%、`attr:mpMax pct −2%×G`；满 5 层 → 封内力 1 回合并降为 3 层 | 3⁺ | S5 | poison.huagong | 运医药 | 被化功命中 |
| `bf_yizhongzhenqi` | 异种真气 | E− | 7–11 | 每层 `attr:mpMax pct −1%`；获得规则（每吸取量达自身 mpMax 5% +1 层）、反噬判定（≥10/15/20 层 → 走火 1/2/3 级，概率 10/20/30%）、化解以 05 §9.1.3 为准；反噬发作时同时触发 `bf_nixing` | 治·界（战斗外每日 −1 层） | S20 | injury.qi | 武（易筋经、北冥）；行动"运功化解"（05） | 吸星大法反噬（笑傲·任我行、令狐冲为此所苦） |

**三种吸内的区别**（原著：北冥神功吸人内力尽为己用；吸星大法所吸各家真气驳杂、难以融合而成大患；化功大法只化散对方内力、不为己用，星宿派以毒为引。三者渊源原著未明言，本作设定为"一纳、一夺、一化"）：

| 项 | 北冥 `absorb`（纳） | 吸星 `seize`（夺） | 化功 `dissolve`（化） |
|---|---|---|---|
| 触发 | `onHit`：本方**拳脚**招式命中（接触）；`onHurt`：被敌方拳脚近战命中（对方打在你身上）——两者各每回合 1 次 | 招式"吸星"命中（05）；被动"反吸"：被拳脚或 `wIn ≥ 0.5` 的近身招式命中（05） | `onHit`：拳脚或兵器近战命中 |
| 吸取量 | `min(目标当前内力, 目标 mpMax × 1.5%×G)` | 以 05 §9.1.3 为准：招式 = 伤害 × 30%（不超过目标当前内力）；反吸 = 攻方 3% mpMax | 焚毁目标内力 `mpMax × 2.5%×G`，**自己不得** |
| 去向 | 加入自身内力；溢出上限部分的 50% 转为护体真气（受 `shieldMax`） | 加入自身内力；溢出部分转为**本战临时内力上限**（`attr:mpMax flat`，至多 +30%） | 目标获得"化功侵体"1 层（同品阶） |
| 代价 | 无 | 异种真气（`bf_yizhongzhenqi`，数值见 05 §9.1.3）；北冥作主运时不产生 | 无；但化功大法本身标签含毒，**百毒不侵**者对其"化功侵体"按 §3.5.1 免疫 |
| 被反制 | 目标有寒冰真气类 `cold` 护体 → 反应 `rx_hanbingxixing`（§4.6） | 同左 | 不受寒冰反制 |
| 对 Boss | 吸取量 ×0.5 | 吸取量 ×0.5 | 焚毁量 ×0.5 |
| 手感定位 | 越打越稳（内力与护体） | 爆发高、需管理反噬 | 专克内功高手，削弱敌人续航 |

### 8.4 效果类 · 攻防反制（11 条）

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_fanzhen` | 反震 | E+ | 1–12 | P7：受到近战（距离 1）伤害后，攻击者受 `实受伤害 × 8%×G`（上限 40%）内劲伤害（`reflect`：不可闪避/招架，计攻击者 Z4） | 3⁺；被动 ∞ | H | guard.reflect | 破 | 九阳神功（倚天：受击时真气自然反震）；金钟罩（外功近战） |
| `bf_weici` | 猬刺 | E+ | 10 | P7：被**拳脚**类招式命中时，攻击者受 `攻击者 hpMax × 1%×G` 伤害 + 流血 1 层（同品阶） | ∞（装备） | R | guard.reflect | ✗ | 软猬甲（射雕/神雕·黄蓉，天下） |
| `bf_houfa` | 后发制人 | E+ | 4–12 | `onAttacked`：受近战攻击后（命中、招架、闪避均可）以当前装配基础招式反击 ×0.6（`counter`，每回合 1 次） | 2⁺ | R | boost.counter | 破 | 太极拳"以静制动、后发先至"（倚天·武当；招名原创扩展） |
| `bf_lianzhao` | 连招 | E+ | 1–12 | 下一次单体攻击命中后追加一段 ×0.5（地+ ×0.6；天阶追加两段） | ×1（天 ×2） | R | boost.combo | 破 | 快剑快刀；辟邪剑法 |
| `bf_hutizhenqi` | 护体真气 | E+ | 1–12 | 施加时获得护体 `hpMax × 5%×G`（默认；05 以 `value: {shieldPctHpMax}` / `{shieldPctCasterHpMax}` 覆写，如九阳护体 15%），进入 `shield` 池（上限 `shieldMax`，03）；到期时剩余护体消散 | 3⁺ | I3 | guard.shield | 破 | 九阳护体、九阳真气（05）；易筋经"金刚不坏之基"（05）；运功护体行动（09） |
| `bf_yiqiyushang` | 以气御伤 | E+ | 4–12 | P5（护体之后）：伤害的 25%（玄）/ 30%（地）/ 35%（天）改由内力代扣，1 内力抵 2 气血；内力不足部分照扣气血 | 3⁺；被动 ∞ | H | guard | 破 | 九阳神功、易筋经、混元功（地上）被动 |
| `bf_zhuiji` | 追击 | E+ | 1–12 | `onAllyHit`：友方命中距持有者 ≤ 2 格的敌人后，持有者对其追加一次基础招式 ×0.4（`followup`，每回合 1 次） | 3⁺ | R | boost | 破 | 天罡北斗阵（射雕·全真；合击细则 09）；双剑合璧 |
| `bf_jieji` | 截击 | E+ | 1–12 | `onEnemyEnterAdjacent`：敌方进入相邻格即终止其移动，并受一次基础招式 ×0.5（每回合 1 次） | 2⁺ | R | boost | 破 | 打狗棒法"封字诀"（射雕/神雕·丐帮）；长枪拒马（原创扩展） |
| `bf_xianji` | 先机 | E+ | 1–12 | `onBattleStart`：`ct +100×G`（天上 +350） | ∞（被动） | H | boost.tempo | ✗ | 独孤九剑"料敌机先"；神行百变（数值原创扩展） |
| `bf_zhenqiwaifang` | 真气外放 | E+ | 7–12 | 拳脚/兵器招式射程 +1（天阶 +2）；以延伸射程命中时该击 `Z3 −10%` | 3⁺；被动 ∞ | R | boost | 破 | 六脉神剑（天龙·段誉，常驻）；剑气（原创扩展） |
| `bf_zhuanjin` | 转劲 | E+ | 4–12 | Z1 前：招式外劲部分的 `5%×G` 转为内劲（`convertDamage`），用于破高外防目标 | 3 | R | boost | 破 | 空明拳"以柔克刚"（射雕·周伯通；机制解释为原创扩展） |

### 8.5 效果类 · 持续伤害与毒（14 条）

> 所有 DOT 走 §5.3.2 管线（抗性、半额通用减伤、境界差、Boss 系数 0.25）；每回合 DOT 合计 ≤ 12% `hpMax`。

| ID | 名称 | 类极 | 品阶 | 数值（每回合 S2 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_zhongdu` | 中毒（黄"轻毒"/玄"中毒"/地"深毒"/天"奇毒"） | E− | 1–10 | 每层 `hpMax × 0.8%×G`（绕过护体）；玄+：受疗 −10pp | 3⁺·界地 | S5 | poison.common | 运医药武休 | 五毒掌；千蛛万毒手（倚天·殷离）；玉蜂针（神雕·古墓，附麻痹）；毒沼地形 |
| `bf_judu` | 剧毒 | E− | 4–12 | `hpMax × 2%×G`（绕过护体）；受疗 −20pp（地+ −30pp）；天：另损内力 `mpMax × 1%×G` | 3⁺·界 | H | poison.severe | 运医药武 | 冰魄银针、赤练神掌（神雕·李莫愁）；淬毒兵刃（雪山·田归农淬毒于苗人凤之剑，待考） |
| `bf_shedu` | 蛇毒 | E− | 2–9 | 每层 `hpMax × 1%×G`、`attr:spd pct −2%`；满 3 层时每回合开始 30% 失去行动 | 3⁺·界地 | S3 | poison.snake | 运医药 | 白驼山蛇杖（射雕·欧阳锋）；毒蛇（野外，驭兽） |
| `bf_huagu` | 化骨 | E− | 7–10 | 每层 `hpMax × 0.5%×G`（绕过护体）；每层 `attr:defOut pct −3%×G` | 5⁺·界 | S5 | injury.bone | 医药武 | 化骨绵掌（鹿鼎·海大富，地上；中者骨骼渐软，细节待考） |
| `bf_liuxue` | 流血 | E− | 1–12 | 每层 `hpMax × 1%×G`（护体先吸收）；E1：本回合移动 ≥ 1 格，再结算 50% | 3⁺ | S3 | bleed | 医药休 | 刀法、爪法；血刀（连城）；九阴白骨爪（射雕·梅超风，附内伤） |
| `bf_zhuoshao` | 灼烧 | E− | 1–12 | `hpMax × 1.2%×G`（护体先吸收）；地+：受疗 −15pp；进入水格立即解除 | 2⁺ | H | heat.burn | 运医；入水 | 火焰刀（天龙·鸠摩智，天下）；五行旗烈火旗（倚天·明教，数值原创扩展）；火场地形 |
| `bf_hanqi` | 寒气 | E− | 1–12 | 每层 `attr:spd pct −1.5%×G`；满 5 层 → 冰冻 1 回合并清空（`onMax`） | 3 | S5 | cold.chill | 运医；灼烧抵消 2 层 | 寒冰真气（笑傲·左冷禅，地上）；雪原、冰窟地形 |
| `bf_handu` | 寒毒 | E− | 7–11 | `hpMax × 1%×G`（绕过护体）+ 内力 `mpMax × 1%×G`；受疗 −20pp；S6：15% "寒战"（本回合不能移动） | 治·界 | H | cold.poison, injury | 运（阳性/调和主运内功：压制 2 回合）；医（压制）；专：九阳神功根治 | 玄冥神掌（倚天·玄冥二老，天下）——张无忌幼年所中 |
| `bf_neishang` | 内伤 | E− | 1–12 | 每层 `hpMax × 0.4%×G`（绕过护体）；每层内力消耗 +2%；满 10 层另 `attr:atkIn pct −10%` | 4⁺·界玄 | S10 | injury.internal | 运医药武休 | 铁掌（射雕·裘千仞）、摧心掌、大力金刚掌；铁砂掌·金刚掌印（05）（七伤拳的自伤另用 `bf_qishang`，§8.11） |
| `bf_qinghuadu` | 情花毒 | E− | 8–9 | 平时无伤；**动情**时（本方羁绊 ≥ 3 级的队友受伤/倒地，或自身施放合璧/双人招式）立即受 `hpMax × 3%×G` 并定身 1 回合（每回合至多 1 次） | 治·界 | R | poison.qinghua | 专：绝情丹、断肠草；医：压制 3 日 | 情花（神雕·绝情谷：动情则痛，原著设定） |
| `bf_beisu` | 悲酥清风 | E− | 5–8 | `attr:atkOut/atkIn pct −6%×G`、`attr:spd pct −4%×G`、不能施放绝招 | 3⁺·界（战斗外 世8） | R | poison.gas | 药（悲酥清风解药）、医 | 西夏一品堂（天龙·赫连铁树；中者泪下如雨、四肢酸软，细节待考） |
| `bf_shixiang` | 十香软筋散 | E− | 7–9 | 内力无法调用（等同 `seal.mp`，并暂停内功 effect/mechanic 被动，§5.5）；`attr:atkIn pct −50%` | 3⁺·界（战斗外 3 日） | R | poison.gas, seal.mp | 药（专属解药）；医（难度 +1） | 倚天·赵敏以之擒六大派高手囚于万安寺 |
| `bf_qixin` | 七心海棠 | E− | 8–10 | **隐藏**潜伏 2 回合（持有方不可见，队伍中 `med` 或 `poi` ≥ 60 者自动识破）；潜伏结束转为同品阶剧毒 + 失明 1 回合 | 2 → 转化 | R | poison.qixin | 识破后：医药 | 飞狐·程灵素（七心海棠，无色无味） |
| `bf_ningxue` | 凝血 | E− | 10 | `hpMax × 1%×G`；每回合 `attr:spd pct −5%`（累计至 −40%）；受疗 −50pp | 5·界（战斗外 3 日未治 → 获得重创直至治愈） | R | injury.blood | 医（天下+）；专（原创扩展：天地会秘传解法） | 凝血神爪（鹿鼎·陈近南，天下；"凝血"效果细节待考） |

> **情花毒是毒，不是蛊**：它是植物之毒（`poison` 标签），**免疫中毒**按品阶可阻挡新的感染，但已中者只能用专属解药根治（医术只能压制；§3.5.5 的"免疫净化"不作用于"只能由 `special` 解法移除"的效果）。与蛊的系统区别见 §9.1。

### 8.6 效果类 · 破兵系列（14 条）

"破 X"是**持有者身上**的效果类增益：对使用 X 类武学者更强，并让 X 类招式在持有者面前"露出破绽"。数值分工：**Z5 增伤与招架乘数由 05 §9.4 规定**（`poBonus`、`poParry`，随来源武学品阶 g 与层数 n）；**大阶质变、守方效果、Buff 结构由本文规定**。

#### 8.6.1 匹配函数 `poMatch(cat, u, move)`（与 05 §9.4 匹配条件一致）

| Buff | 所破（原著大意，逐字待考） | 攻：目标 u 匹配条件 | 守：来袭招式匹配条件 |
|---|---|---|---|
| `bf_pojian` 破剑 | 各门各派剑法 | `mainCat(u) == sword` | `move.cat == sword` |
| `bf_podao` 破刀 | 单刀、双刀、柳叶刀、鬼头刀、大砍刀、斩马刀等 | `blade` | `blade` |
| `bf_poqiang` 破枪 | 长枪、大戟、蛇矛、齐眉棍、狼牙棒、白蜡杆、禅杖、方便铲等**长兵刃** | `spear` 或 `staff` | `spear` 或 `staff` |
| `bf_pogun` 破棍 | （单项来源用；独孤九剑的破枪式已含棍杖） | `staff` | `staff` |
| `bf_pobian` 破鞭 | 钢鞭、铁锏、点穴橛、拐子、蛾眉刺、匕首、板斧、铁牌、八角槌、铁椎等**短兵刃**（硬鞭，非软鞭） | `exotic` | `exotic` |
| `bf_posuo` 破索 | 长索、软鞭、三节棍、链子枪、铁链、渔网、飞锤流星等**软兵刃** | `whip` | `whip` |
| `bf_pozhang` 破掌 | 拳脚指掌上的功夫 | u 空手或 `mainCat(u) == unarmed` | `move.cat == unarmed` |
| `bf_poanqi` 破箭 | 诸般暗器 | u 装配暗器武学 | `move.delivery == projectile` 或 `move.cat == hidden` |
| `bf_poqi` 破气 | 身具上乘内功者 | u 主运内功 `effGrade ≥ 7`，或 `u.shield > 0` | `move.wIn ≥ 0.6` |

> 用户需求中的"破鞭"与"破索"按原著区分：原著破鞭式所破为**硬鞭一类短兵**，软鞭归破索式；故"破鞭"映射到基准 §7 的 `exotic`（奇门短兵），"破索"映射到 `whip`（鞭索）。"破棍"在原著中并入破枪式，本作保留独立 ID 供其他武学单项授予。

#### 8.6.2 分阶效果（所有破 X 通用）

| 大阶 | 攻（对匹配目标） | 守（受匹配招式攻击） | 质变 |
|---|---|---|---|
| 黄（1–3） | `Z5:X +poBonus`；目标招架持有者的概率 × `poParry`（05） | — | — |
| 玄（4–6） | 同上 | `attr:parry pct +4%×G`（仅对匹配招式） | — |
| 地（7–9） | 同上 | 同上 + 匹配招式对持有者**不能暴击** | 招架匹配招式成功后 50% 以基础招式 ×0.5 反击（每回合 1 次） |
| 天（10–12） | 同上 + 攻击匹配目标时**无视其招架**（Z0 `skipParry`） | 同上 | **破招**：受匹配招式攻击时，以 10% / 15% / 20%（天下/天中/天上）概率令其**失效**（视为招架成功、伤害 0），攻击者获得`破招` 1 回合 + `失衡` 1 回合；品阶高于本 Buff 的绝招不可被破 |

- 单项来源（独孤九剑以外的武学授予单项破 X）且品阶 ≤ 地上时，`poBonus` × 0.6（05 §9.4）。
- 目标有品阶 ≥ 破 X 品阶的"无破绽"（`bf_wupozhan`）时，破 X 对其**完全无效**（`poMatch` 恒为假）。
- 多个破 X 同时匹配同一目标（如破枪与破棍都匹配 `staff`）：取 `poBonus` 高者，不叠加（同族 `fam_z5_<cat>` 取高）。

#### 8.6.3 目录

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_pojian` | 破剑 | E+ | 1–12 | `Z5:sword +poBonus`；招架乘数 `poParry`；分阶效果 §8.6.2 | ∞（被动）；临时版 3 | H | weaponBreak.sword | ✗（被动）/ 破（临时） | 独孤九剑·破剑式（笑傲·风清扬传剑） |
| `bf_podao` | 破刀 | E+ | 1–12 | `Z5:blade`，同上 | 同上 | H | weaponBreak.blade | 同上 | 独孤九剑·破刀式 |
| `bf_poqiang` | 破枪 | E+ | 1–12 | `Z5:spear/staff`，同上 | 同上 | H | weaponBreak.spear | 同上 | 独孤九剑·破枪式（兼破棍杖） |
| `bf_pogun` | 破棍 | E+ | 1–12 | `Z5:staff`，同上（单项 ×0.6） | 同上 | H | weaponBreak.staff | 同上 | 少林棍僧拆招心得（原创扩展）；太极棍意（原创扩展） |
| `bf_pobian` | 破鞭 | E+ | 1–12 | `Z5:exotic`，同上 | 同上 | H | weaponBreak.exotic | 同上 | 独孤九剑·破鞭式 |
| `bf_posuo` | 破索 | E+ | 1–12 | `Z5:whip`，同上 | 同上 | H | weaponBreak.whip | 同上 | 独孤九剑·破索式 |
| `bf_pozhang` | 破掌 | E+ | 1–12 | `Z5:unarmed`，同上；天：另免疫由拳脚招式附带、品阶 ≤ 本 Buff 的 `seal` 效果 | 同上 | H | weaponBreak.unarmed | 同上 | 独孤九剑·破掌式 |
| `bf_poanqi` | 破箭 | E+ | 1–12 | `Z5:hidden`，同上；守方以 `attr:eva pct +4%×G` 代替招架加成（暗器不可招架时）；天阶破招时将暗器以 50% 伤害反射回施放者 | 同上 | H | weaponBreak.hidden | 同上 | 独孤九剑·破箭式（05：被动拨开暗器 35%→60%，9 重起反射） |
| `bf_poqi` | 破气 | E+ | 1–12 | `Z5:inner`，同上；攻击匹配目标时无视其护体真气 30%（地）/ 60%（天）；天：命中时对目标执行 1 次 `purge(guard)`（品阶 = 本 Buff） | 同上 | H | weaponBreak.inner | 同上 | 独孤九剑·破气式（05：对护体真气伤害 ×2） |
| `bf_duguyi` | 剑意 | S+ | 10–12 | 每层本武学（独孤九剑）招式 `attr:crit flat +2`（05） | 战（05：dur 99） | S9 | boost.crit | ✗ | 独孤九剑·总诀式（05 §13.2） |
| `bf_pozhao` | 破招 | E− | 1–12 | 招式被破、门户洞开：不能招架（Z0 跳过招架）、`attr:counter` 视为 0、不能施放蓄招 | 1 | R | weaponBreak.exposed | ✗（1 回合自然消退） | 独孤九剑破 X 式命中（05：60%）；破 X 天阶"破招" |
| `bf_jiaoxie` | 缴械 | E− | 1–12 | 主手兵器落到随机相邻格（05 §6），强制空手：兵器类武学禁用、主武器属性失效；移动到该格并花费行动"拾回"即解除；持有天阶神兵且神兵品阶 ≥ 效果品阶时免疫 | 至拾回（战斗结束自动拾回） | R | weaponBreak.disarm | ✗（拾回） | 天山折梅手（天龙，天下）；独孤九剑破索式（05：30%）；空手入白刃（原创扩展） |
| `bf_duanbing` | 断兵 | E− | 7–12 | 主武器提供的攻击加成 −30%（地）/ −50%（天下、天中）/ −70%（天上）；神兵品阶 ≥ 效果品阶时免疫 | 界（至铁匠修复，10） | R | weaponBreak.broken | ✗（修复） | 倚天剑、屠龙刀、韦小宝匕首（原著"削铁如泥"） |
| `bf_wupozhan` | 无破绽 | M+ | 1–12 | 品阶 ≤ 本 Buff 的一切破 X 对持有者无效 | ∞（被动） | H | guard.immune | ✗ | 太祖长拳 4 重被动（05 §9.4）；独孤九剑"无招"（05） |

### 8.7 效果类 · 控制（23 条）

> 硬控（眩晕、冰冻、昏睡、点穴）同属互斥组 `exg_control_hard`，时间不叠加（§4.4）；心神类同属 `exg_mind`。所有硬控结束时自动获得"坚毅"（§8.9 `bf_jianyi`）。Boss 的控制递减见 §11.4。

| ID | 名称 | 类极 | 品阶 | 数值 / 规则 | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_dingshen` | 定身 | E− | 1–12 | `disableAction [move, jump]`；可出招、用物品；不能借轻功跨越地形 | 1（地+ 2） | R | cc.root | 医；时间 | 羝羊触藩（05：60%）；天罗地网势（神雕·古墓）；打狗棒法"绊字诀" |
| `bf_xuanyun` | 眩晕 | E− | 1–12 | S6 `skipAction` | 1 | R（硬控组） | cc.stun | 医（品阶 ≥ 效果） | 震惊百里（05：30%）；击退撞墙；重击 |
| `bf_jitui` | 击退 | E− | 1–12 | `displace knock`：1 格（1–6）/ 2（7–9）/ 3（10–12）；撞墙/单位/高差 ≥ 2 → `hpMax × 2%×G` 撞击伤害 + 眩晕 1；坠落伤害归 08。05 招式 `displacement: knock` 在结算时视为施加本 Buff（先过免疫与抵抗，被免疫则不位移） | 瞬 | — | cc.knock | — | 见龙在田、龙战于野（05）；七伤拳"吐劲"（05） |
| `bf_fengxue` | 点穴（封穴） | E− | 1–12 | S6 `skipAction`；`eva`/`parry` 视为 0；每次受伤 20%（天阶 10%）撞开穴道；S5 冲穴判定（§7.1） | 1（天 2） | R（硬控组） | seal.point | 穴医武 | 一阳指、弹指神通、兰花拂穴手；七伤拳"闭劲"（05） |
| `bf_fengnei` | 封内力（沉默） | E− | 1–12 | `disableAction [inner]`：不能施放 `mpCost > 0` 的招式与绝招、不能运功调息；内力不再生；来源为内功的 effect/mechanic 被动暂停（§5.5） | 2⁺ | R | seal.mp | 穴医武 | 点"气海穴"（原创扩展招名）；十香软筋散（附带） |
| `bf_fengqinggong` | 封轻功 | E− | 1–12 | `attr:qinggong` 视为 0、`attr:jump` 视为 0、`attr:mov flat −2`（最低 1）、`attr:eva pct −3%×G` | 2⁺ | R | seal.qg | 穴医 | 点"环跳穴"（原创扩展招名）；绊索、渔网（10） |
| `bf_fengjingmai` | 封经脉 | E− | 1–12 | `disableSkillType [param: unarmed 或 weapon]` | 2 | R（defParam） | seal.meridian | 穴医武 | 擒拿手法；天山折梅手 |
| `bf_miyun` | 封绝 | E− | 1–12 | 不能施放绝招；施加时目标 `rage −30`（05） | 2 | R | seal.ult | 穴医 | 降龙十八掌·密云不雨（05） |
| `bf_mabi` | 麻痹 | E− | 1–12 | S6：25%（黄）/ 30%（玄）/ 35%（地）/ 40%（天）失去行动；`attr:spd pct −10%` | 2⁺ | R | cc.paralyze, poison.numb | 运医药 | 麻药；玉蜂针（神雕·古墓）；蛇毒满层 |
| `bf_mihuo` | 迷惑 | E− | 1–12 | `aiOverride charm`：每次行动目标随机（含友军），不能施放绝招 | 1（天 2） | R（心神组） | mind.charm | 医武 | 迷香（原创扩展）；圣火令武功之诡变（倚天，机制解释原创扩展） |
| `bf_yihun` | 移魂 | E− | 1–12 | `aiOverride control`：视为施加者阵营，由其 AI 操控，不能以施加者为目标；受到伤害时 30% 解除。（改变控制权，按 §1.3 例外归效果类） | 1（天 2） | R（心神组） | mind.control | 医武（易筋经、清心普善咒） | 移魂大法（射雕·九阴真经，天下） |
| `bf_chaofeng` | 嘲讽 | E− | 1–12 | `forceTarget source`：单体行动必须以施加者为目标，够不到则向其移动 | 1（地+ 2） | R（心神组） | mind.taunt | 医 | 打狗棒法"引字诀"；援护类招式 |
| `bf_kongju` | 恐惧 | E− | 1–12 | `aiOverride fear`：移向远离施加者的最远可达格；不能攻击；可用物品、运功 | 1 | R（心神组） | mind.fear | 医武 | 狮子吼（倚天·谢逊于王盘山岛；少林）；魔头威压（Boss） |
| `bf_luanxin` | 乱心 | E− | 1–12 | `attr:hit pct −3%×G`；每次行动 20% 目标改为随机；内力消耗 +20% | 2⁺ | R | mind.confuse | 运医武 | 碧海潮生曲（射雕·黄药师，天下）；玉箫剑法配合（原创扩展） |
| `bf_zhenshe` | 震慑 | E− | 1–12 | 施加时 `ct −100×G`；`attr:hit pct −2%×G` | 1 | R | mind.awe | 医 | 狮子吼附带；金刚怒吼（原创扩展） |
| `bf_bingdong` | 冰冻 | E− | 1–12 | S6 `skipAction`；`attr:defOut pct +30%`（冰壳）；受 `heat` 伤害立即解除并触发 `rx_binghuo`；受其他伤害 30% 解除 | 1 | R（硬控组） | cc.freeze, cold.freeze | 运医；灼烧 | 寒气满 5 层；寒冰真气（笑傲）；冰窟地形 |
| `bf_jiansu` | 减速 | E− | 1–12 | `attr:spd pct −4%×G`；施加时 `ct −50` | 2⁺ | R | cc.slow | 运医药 | 七伤拳"柔劲"（05）；泥沼地形 |
| `bf_lvshuang` | 履霜 | E− | 7–12 | 每层 `attr:spd pct −5%`；满 4 层"冰至"：清空层数，追加一段 0.8 倍伤害并定身 1 回合（05） | 3 | S4 | cc.slow, cold.chill | 运医 | 降龙十八掌·履霜冰至（05） |
| `bf_hunshui` | 昏睡 | E− | 1–9 | S6 `skipAction`，直至受到任何伤害或持续结束 | 2 | R（硬控组） | cc.sleep | 医药；受伤即醒 | 蒙汗药、迷香（江湖通用，数值原创扩展） |
| `bf_chanrao` | 缠绕 | E− | 1–12 | 定身 + `attr:parry pct −4%×G`；施加者与持有者距离超过施加招式射程时解除；持有者可花费行动"挣脱"（成功率 `50% + (str − 施加者 str) × 1%`，5%–95%） | 2 | R | cc.bind | 医；挣脱 | 打狗棒法"缠字诀"；软鞭、长索 |
| `bf_shiheng` | 失衡 | E− | 1–12 | `attr:hit pct −2%×G`、`attr:parry pct −4%×G`；下一招收招 +20%（09） | 1 | R | cc.stagger | —（时间） | 太极拳"四两拨千斤"（倚天）；破 X 天阶破招 |
| `bf_qianyin` | 牵引 | E− | 1–12 | `displace pull`：1 / 2 / 3 格（1–6 / 7–9 / 10–12）；05 招式 `displacement: pull` 同义 | 瞬 | — | cc.pull | — | 擒龙功（天龙·萧峰）；倒拽九牛尾（05） |
| `bf_chihuan` | 迟缓 | E− | 1–12 | `ct −100×G`（推迟集气） | 瞬 | — | cc.delay | — | 打狗棒法"绊字诀"；重兵器砸击 |

### 8.8 效果类 · 架势（6 条）

> 同属互斥组 `exg_stance`，同时只能有一个（§4.4）；架势可被 `purge(stance)` 打散（如狮子吼、独孤九剑"无招胜有招"，05），打散后 1 回合不能再起架势。

| ID | 名称 | 类极 | 品阶 | 数值（作用位置 · 按品阶） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_shoushi` | 守势 | E+ | 1–12 | `attr:defOut/defIn pct +8%×G`、`attr:parry pct +4%×G`、`attr:spd pct −10%` | 3 或至切换 | R | stance.def | 破 | 防御行动（09）；少林"金刚守势"（原创扩展） |
| `bf_gongshi` | 攻势 | E+ | 1–12 | `Z3 +6%×G`、`attr:crit pct +4%×G`；`attr:defOut/defIn pct −8%` | 3 | R | stance.atk | 破 | 快攻剑法、刀法 |
| `bf_xushi` | 蓄势 | E+ | 1–12 | 本回合不攻击则进入：下一次攻击 `Z3 +12%×G`（上限 45%）、击退距离 +1；蓄势期间 `attr:defOut pct −10%`；被硬控则丢失 | 至下一次攻击（至多 2 回合） | R | stance.charge | 破 | 蛤蟆功（射雕·欧阳锋：蹲身蓄劲、一发即至，天下） |
| `bf_youshi` | 游势 | E+ | 1–12 | `attr:eva pct +4%×G`、`attr:mov flat +1`；攻击后可继续用完剩余移动力；`Z3 −10%` | 3 | R | stance.mobile | 破 | 古墓派轻灵身法（原创扩展） |
| `bf_jingshi` | 静势 | E+ | 1–12 | 未移动的回合结束时 +1 层（上限 3）：每层 `attr:counter pp +5`、`Z9 +2 pp`；移动即清空 | 战（随架势） | S3 | stance.still | 破 | 太极拳、太极剑"以静制动"（倚天·武当） |
| `bf_kuangshi` | 狂势 | E+ | 1–12 | `Z3 +10%×G`、`attr:hit pct −5%`、`attr:defOut/defIn pct −15%`、免疫 `mind.fear`（≤ 本品阶） | 3 | R | stance.wild | 破 | 醉拳、疯魔杖法（原创扩展） |

### 8.9 机制类（43 条）

> 机制类受 §11.3 的冷却/每战次数/Boss 规则约束；"防护型"机制（无敌、锁血、金刚、挪移、斗转、残影、援护）面对更高品阶招式按 §3.5.4 部分失效。

| ID | 名称 | 类极 | 品阶 | 数值 / 规则 | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_mian_du` | 百毒不侵（免疫中毒） | M+ | 1–12 | `immune [poison]`，品阶 g（§3.5.1 对更高品阶部分穿透） | 临时 2⁺；永久 ∞ | H | guard.immune | 破（临时）/ ✗（永久） | 莽牯朱蛤（天龙·段誉吞食后百毒不侵；永久被动，建议天下）；辟毒丹（临时，原创扩展） |
| `bf_mian_gu` | 蛊毒不侵（免疫中蛊） | M+ | 1–12 | `immune [gu]`；对**已中**之蛊不移除，品阶 ≥ 蛊时压制其发作（§9.3） | 同上 | H | guard.immune | 同上 | 蛊王护身（五仙教，原创扩展）；雄黄药酒（临时，原创扩展） |
| `bf_mian_kong` | 不动如山（免疫控制） | M+ | 1–12 | `immune [cc]` | 1（地+ 2）；Boss 常驻 ∞ | H | guard.immune | 破 | 千斤坠大成（原创扩展）；金刚不坏体绝招附带 |
| `bf_mian_xin` | 心如止水（免疫心神） | M+ | 1–12 | `immune [mind]` | 2⁺；被动 ∞ | H | guard.immune | 破 | 清心普善咒（高阶，原创定级）；佛门禅定（原创扩展） |
| `bf_mian_xue` | 闭穴（免疫穴道） | M+ | 1–12 | `immune [seal]` | 2⁺；被动 ∞ | H | guard.immune | 破 | 逆转经脉（射雕/神雕·欧阳锋，传于杨过；点穴难制，细节待考）；移穴换位（原创扩展） |
| `bf_mian_shang` | 百脉畅通（免疫内伤） | M+ | 1–12 | `immune [injury]` | 2⁺ | H | guard.immune | 破 | 大还丹（临时）；九阴真经·疗伤篇大成（原创扩展） |
| `bf_mian_han` | 寒毒不侵（免疫寒） | M+ | 1–12 | `immune [cold]`（含寒毒、冰冻、寒气） | ∞（被动） | H | guard.immune | ✗ | 九阳神功 6 重"寒毒不侵"（05） |
| `bf_mian_re` | 烈火不侵（免疫热） | M+ | 1–12 | `immune [heat]` | 2⁺；装备 ∞ | H | guard.immune | 破 | 火浣衣（原创扩展） |
| `bf_mian_liuxue` | 金疮不染（免疫流血） | M+ | 1–12 | `immune [bleed]` | 3⁺ | H | guard.immune | 破 | 金创药（临时）；横练大成（原创扩展） |
| `bf_mian_pobing` | 神兵护主（免疫破兵） | M+ | 10–12 | `immune [weaponBreak.disarm, weaponBreak.broken]`，品阶 = 神兵品阶 | ∞（装备） | H | guard.immune | ✗ | 天阶神兵常驻（基准 §14） |
| `bf_mian_jianyi` | 万法不侵（免疫一切减益） | M+ | 10–12 | 对所有减益标签 `immune`；已有减益不移除 | 1 | R | guard.immune | 破（≥ 品阶） | 天书之力（13）；Boss 阶段转换（09） |
| `bf_wudi` | 无敌 | M+ | 1–12 | `invulnerable`：伤害归零、阻挡新减益；已有 DOT 伤害归零；更高品阶招式按 ρ 穿透（§3.5.4） | 1（天上 2） | R | guard.invuln | 破（≥ 品阶） | 易筋经·易筋换骨（05：1 回合）；金刚不坏体绝招；Boss 阶段转换（09） |
| `bf_suoxue` | 锁血（不死） | M+ | 1–12 | `lockHp min 1`：气血不会降至 1 以下；挡下致死伤害后获得"重创" | 2 或 ×1（先到者） | R | guard.lock | ✗ | 神照经（连城·狄云；原著"死而复生"之说细节待考）；护心丹（原创扩展）；Boss 阶段（09） |
| `bf_fuhuo` | 复活 | M+ | 1–12 | `revive`：倒地时立即以 `hpMax × min(50%, 10%×G)` 复活，内力回复 20%，清除全部可驱散减益（`special` 类除外），获得"重创" | ×1 | — | guard.revive | ✗ | 九转还魂丹（原创扩展）；书灵（剧情/难度模式，13） |
| `bf_nuoyi` | 挪移 | M+ | 7–12 | `redirect`：受到伤害的 `min(50%, 10%×G)` 转移给 2 格内另一敌人（优先非攻击者，按最近），无则转给攻击者；见 §2.4 示例 C | 3 | R | guard.redirect | 破 | 乾坤大挪移（倚天·明教，天中） |
| `bf_douzhuan` | 斗转 | M+ | 7–12 | `mirror`：被距离 ≤ 3 的招式命中时，以 `min(30%, 6%×G)` 概率整招奉还——持有者免伤，攻击者承受以其自身属性计算的该招 ×0.8；招式品阶高于本 Buff 时概率 × (1 − ρ)；不能奉还品阶高于本 Buff 的绝招；每回合至多 1 次 | ∞（主运）；主动 3 | H | guard.mirror | ✗ / 破 | 斗转星移（天龙·姑苏慕容"以彼之道，还施彼身"，天下） |
| `bf_bizhong` | 必中 | M+ | 1–12 | `modJudge mustHit`：跳过闪避判定，无视残影与隐身（不无视无敌） | ×1（黄玄）/ ×2（地）/ ×3（天） | R | boost | 破 | 百花错拳（书剑·袁士霄：拳招错杂难料，机制解释原创扩展）；弹指神通 |
| `bf_bibao` | 必暴 | M+ | 1–12 | `modJudge mustCrit`：下一次攻击必定暴击（韧性对暴伤的削减仍按 04） | ×1（天 ×2） | R | boost | 破 | 胡家刀法绝招（原创扩展）；蓄势满 |
| `bf_wushi_zhaojia` | 无视招架 | M+ | 1–12 | `modJudge skipParry`：攻击不经招架判定（Z0 招架与 Z9 均不生效） | 2⁺ | R | boost | 破 | 玄铁剑法（神雕：重剑无锋，大巧不工）；金蛇剑法（碧血：奇诡难架） |
| `bf_wushi_fangyu` | 无视防御 | M+ | 1–12 | `modJudge ignoreDef`：下一次攻击 Z2 视目标防御为 0 | ×1（天 ×2） | R | boost | 破 | 庖丁解牛掌（书剑·陈家洛，天下）；破甲锥（原创扩展） |
| `bf_zaidong` | 再动 | M+ | 1–12 | `extraAction`：本次行动结束后立即再行动一次（移动 + 行动）；额外行动不触发 S 段、不递减持续；不可连锁 | ×1 | — | boost.tempo | 破 | 奇遇丹药（原创扩展）；Boss 连动（09）。**左右互搏**的"一回合两次出手"由 05 §9.3.2 行动"分心二用"实现，不经本 Buff |
| `bf_yinshen` | 隐身 | M+ | 1–12 | `stealth`：不能被单体招式/暗器选为目标（范围招式仍可命中）；主动攻击或受伤后解除，解除的那一击视为背击（Z7） | 2 | R | veil.stealth | 破；听风辨器 | 夜行衣 + 暗处地形（原创扩展） |
| `bf_canying` | 残影 | M+ | 4–12 | 残影层（玄 1 / 地 2 / 天 3）：每层完全闪避一次单体攻击（必中、范围招式除外）；一次移动 ≥ 3 格则回合末 +1 层（不超上限） | 战（凌波主运时常驻）；主动 3 | S3 | veil.afterimage | 破 | 凌波微步（天龙·逍遥派，天中） |
| `bf_yuanhu` | 援护 | M+ | 1–12 | `guard`：相邻友方被单体攻击选为目标时代为承受（按持有者防御结算，另 `Z4 +5%×G`）；每回合 1 次 | 2⁺ | R | guard.redirect | 破 | 护主招式（原创扩展）；天罡北斗阵（09） |
| `bf_nixing` | 真气逆行 | M− | 7–11 | 异种真气反噬发作的即时效果：立即损失内力 `mpMax × 10% × 走火级`、眩晕 1 回合，并施加对应级走火（反噬概率与级别见 05 §9.1.3） | 瞬 | — | injury.qi | — | 吸星大法反噬（笑傲·任我行、令狐冲） |
| `bf_neixiwenluan` | 内息紊乱（走火 1 级） | M− | 1–12 | 内力再生 −50%；招式耗内 +20%；战斗外闭关收益 −50%（05 §10.1） | 3（战斗外 1 日） | 升级（`exg_zouhuo`） | injury.qi | 运医武 | 阴阳相冲、闭关心魔等（05 §10.2） |
| `bf_jingmainixing` | 经脉逆行（走火 2 级） | M− | 1–12 | 所有内功有效层数 −2（最低 1）；`attr:hpMax pct −10%`；S6 5% 僵直（失去本次行动）；战斗外不能闭关、强行冲关（05） | 治·界（5 日后每日 `20% + wil/500` 自愈） | 升级 | injury.qi | 医（地+）；武（易筋经·洗髓） | 强行冲关失败、七伤满层等（05） |
| `bf_zouhuorumo` | 走火入魔（3 级） | M− | 1–12 | 全部 MAG/RAT 战斗属性 `pct −20%`；S6 以 `25% × (1 − resMind)` 失控（`aiOverride berserk`：攻击最近单位、敌我不分，09）；战斗外不能使用内功招式、不能闭关；15 日未治 → 永久后遗症并降为 2 级（05） | 治·界 | 升级 | injury.qi, mind | 医（难度 +1）；武（易筋经） | 异种真气 20 层反噬等（05） |
| `bf_yirong` | 易容 | M+ | 1–12 | 探索：敌对势力 NPC 不主动识别，可进入受限区域；识破判定 `NPC wis + lore ≥ 12 × g + art / 2`（对话归 12）。战斗：开场敌方威胁评估最低；首次攻击视为背击且必暴；首次攻击或被识破即解除 | 世12 | R | veil.disguise | 识破 | 杂学·易容；阿朱（天龙，易容名家）的传授（原创扩展任务） |
| `bf_zhasi` | 诈死 | M+ | 1–12 | ×1：受致死伤害时改为气血 1 并"假死"：不可被选为目标、敌方 AI 视为倒地、照常集气；任何主动行动即"诈尸"解除且该击必暴；至多 2 回合后自动起身；生效后获得"重创" | ×1 | — | veil.feign | ✗ | 龟息功（原创扩展）；鹿鼎式装死求生的致敬（原创扩展） |
| `bf_kuangbao` | 狂暴 | M+ | 系统 | Boss 专用：`Z3 +30%`（地阶及以下 Boss）/ `+50%`（天阶 Boss）、`attr:spd pct +20%`、`immune [cc]`（品阶 = Boss 最高武学品阶）；触发：气血 ≤ 30% 或经过 20 个 Boss 回合 | 战 | — | boost.berserk | ✗ | Boss 通用（09） |
| `bf_shouzhi` | 受制 | M− | 7–11 | 施控者 C（或其势力首领）在场时：不能以 C 为目标；S6 30% 由 C 方 AI 操控（`aiOverride obey`）；免疫恐惧、不能撤退。战斗外：每 N 日须服 C 方解药（神龙教 N = 365【建议】），逾期发作：每日 `hpMax −5%`（至 −30%）、随机一项先天属性临时 −10；逾期 30 日 → 该项永久 −5（每书界至多 1 次） | 治·界 | — | bind.baotai, poison | 专：解药（重置期限）；根治 = 任务 | 豹胎易筋丸（鹿鼎·神龙教洪安通以之控制教众；逾期不服解药则筋骨异变，人物细节待考） |
| `bf_shengsifu` | 生死符 | M− | 7–10 | 每符一实例（至多 3）：战斗中每 4 个持有者回合发作——受 `hpMax × 2%×G`（绕过护体）+ 奇痒（`attr:hit pct −10%` 1 回合）+ 本回合 50% 失去行动；战斗外定期发作（建议 30 日），未服施符者所赐镇痛药则 3 日内每日 `hpMax −5%`（可恢复） | 治·界 | I3 | bind.shengsi, cold | 专：天山六阳掌（品阶 ≥ 符）、施符者本人 | 生死符（天龙·灵鹫宫·天山童姥，天下；虚竹以天山六阳掌为群豪拔除；发作周期待考） |
| `bf_jingang` | 金刚不坏 | M+ | 1–12 | `damageCap`：单次伤害 ≤ `hpMax × cap`，cap = 黄 40% / 玄 32% / 地 25% / 天下 20% / 天中 18% / 天上 16%；更高品阶招式按 §3.5.4 放宽 | ∞（主运）；主动 2 | H | guard.cap | ✗ / 破 | 金刚不坏体（倚天·少林，天下） |
| `bf_zhaomen` | 罩门 | M− | 1–12 | 与横练类增益伴生：战斗开始随机设定罩门方位（正面/左/右/背后）；来自该方位或以指法（`finger`）命中时，本击无视持有者全部 `guard` 与外防增益且 `Z3 +50%`；`lore ≥ 50` 的角色观察持有者 1 回合即可识破并在 UI 标出 | 伴随来源 | — | weaken.mark | ✗ | 金钟罩、铁布衫（"罩门"为武侠通用设定，原创扩展） |
| `bf_daoqiang` | 刀枪不入 | M+ | 10–12 | 受到 `sword/blade/spear/exotic/hidden` 类招式伤害中的**外劲部分** `Z4 +8%×G`（条件减伤）；`immune [bleed]`（≤ 本品阶） | ∞（装备） | H | guard | ✗ | 乌蚕衣（连城，天下）；护身宝衣（鹿鼎，天下） |
| `bf_dunzou` | 遁走 | M+ | 1–12 | `attr:mov flat +2`；无视截击与控制区；撤退行动必定成功；`attr:eva pct +4%×G` | 2 | R | boost | 破 | 神行百变（碧血/鹿鼎：韦小宝只学了逃命的本事，天下） |
| `bf_tingfeng` | 听风辨器 | M+ | 1–12 | 可选中隐身单位；攻击残影持有者时 50% 不消耗残影直接命中；对暗器 `attr:eva pct +4%×G`；被其选中的隐匿者获得"破隐" | 3⁺；被动 ∞ | R | boost | 破 | 听风辨器（原著称破箭式须先练此法，待考）；盲眼高手（原创扩展） |
| `bf_jianyi` | 坚毅 | M+ | 系统 | 硬控结束时自动获得：1 回合内免疫同子标签的硬控（品阶 12） | 1 | R | guard.immune | ✗ | 系统（§11.3） |
| `bf_shouling` | 首领 | M+ | 系统 | Boss 常驻：控制递减、百分比伤害系数 0.25、`immune [mind.charm, mind.control, bind]`（品阶 = Boss 最高武学品阶） | ∞ | — | guard.immune | ✗ | 系统（§11.4） |
| `bf_shuling_huyou` | 书灵护佑 | M+ | 系统 | 本战首次受致死伤害时改为回复 30% 气血；序章、剧情战与低难度模式（13）使用 | 战 | — | guard.lock | ✗ | 书灵（01/13） |
| `bf_xielian` | 邪气 | M− | 系统 | 装配时 `attr:resMind pp −15`；正派 NPC 初见好感 −10（12） | ∞（装配） | — | weaken | ✗ | 九阴白骨爪（05 §9.1.2） |
| `bf_duanchen` | 心性偏执 | M− | 系统 | `attr:resMind pp −15`、`attr:healRecv pp −10`、受 `mind` 类减益持续 +1；**跨书界永久**（`permanent`，书眠不净化） | ∞ | — | weaken | ✗ | 断尘之誓（05 §9.1.4，葵花宝典/辟邪剑法） |

### 8.10 战斗外与杂项状态（4 条）

| ID | 名称 | 类极 | 品阶 | 数值 / 规则 | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_zuiyi` | 醉意 | S+ | 1–6 | 每层 `attr:crit pct +4%×G`、`attr:hit pct −3%×G`、`attr:resMind pp +5`；叠满 3 层后再饮 → 醉倒（昏睡 2 回合 / 战斗外 2 时辰） | 战斗 3；探索 世4 | S3 | boost.crit | 药（醒酒汤）；休 | 美酒（笑傲多有嗜酒论酒情节；数值原创扩展）；醉拳 |
| `bf_pibei` | 疲惫 | S− | 系统 | 体力为 0 时获得：`attr:spd pct −10%`、不能通过轻功门禁；以此状态进入战斗时 `ct −200` | 至体力恢复 50% | R | weaken | 休 | 探索（11） |
| `bf_shouhan` | 受寒 | E− | 1–6 | 雪原/寒夜且无御寒装备：体力上限 −20%，每时辰 −1% 气血（不致死）；进入战斗时转为寒气 1 层 | 离开寒区 2 时辰后消退 | R | cold.chill | 休药 | 天气与区域（11） |
| `bf_yangsheng` | 养生 | E+ | 系统 | 战斗外：自然恢复 +50%、体力消耗 −20% | 世12 | R | boost.regen | ✗ | 药膳、客栈上房（原创扩展） |

### 8.11 武学专属 Buff（05 引用，数值以 05 为准，8 条）

| ID | 名称 | 类极 | 品阶 | 数值 / 规则 | 持续 | 叠加 | 标签 | 驱散 | 来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_xuli` | 蓄力 | S+ | 1–12 | 下一次来源武学招式 `Z3 +p.pct`（05 潜龙勿用：40%） | 至下一次该武学招式（至多 1 回合） | R | boost.dmg | 破 | 降龙十八掌·潜龙勿用（05） |
| `bf_qianlong` | 潜龙 | S+ | 1–12 | 至下次行动前 `Z4 +15%`（05） | 1 | R | boost.dmgDown | 破 | 降龙十八掌·潜龙勿用（05） |
| `bf_liuli` | 留力 | S+ | 1–12 | 下一次降龙招式 `Z3 +15%`（05："亢龙有悔"之"悔"——留有余力） | 1 | R | boost.dmg | 破 | 降龙十八掌·亢龙有悔未击杀时（05） |
| `bf_longyin` | 龙吟 | S+ | 1–12 | 每层降龙招式 `Z3 +4%`，上限 5 层（05） | 2 | S5 | boost.dmg | 破 | 降龙十八掌被动"龙吟"（05） |
| `bf_weituo` | 韦陀 | S+ | 1–12 | `Z4 +25%`、`attr:resCC pp +30`（05） | 2 | R | boost.dmgDown | 破 | 易筋经·韦陀献杵（05） |
| `bf_jianshi` | 剑势 | S+ | 1–12 | `attr:crit flat +10`（05） | 2 | R | boost.crit | 破 | 全真剑法·三清朝元（05 §13.6，招名原创扩展） |
| `bf_shouque` | 守缺 | E+ | 1–12 | `attr:parry flat +20`、`Z4 +15%`、`immune [seal.point]`（品阶 ≤ 本 Buff）（05）；属架势互斥组 `exg_stance` | 2 | R | stance.def | 破 | 龙爪手·守缺式（05 §13.7，少林七十二绝技） |
| `bf_qishang` | 七伤 | S− | 1–12 | 每层 `attr:hpMax pct −2%`，上限 7 层；满 7 层 → 走火 2 级并降为 3 层；战斗外每日 −1 层（05 §9.1.1） | 界 | S7 | injury.internal | 医药；武（九阳/易筋经 ≥ 5 重时不叠加，05） | 七伤拳（倚天·崆峒派"先伤己后伤人"） |

---

## 9. 蛊毒专章

### 9.1 蛊、毒、情花毒、受制：系统区别

| 维度 | 毒（`poison`） | 情花毒（`poison.qinghua`） | 蛊（`gu`） | 受制（`bind`：豹胎易筋丸、生死符） |
|---|---|---|---|---|
| 本质 | 物质之毒 | 植物之毒，但与情绪相连 | **活物**，寄生、可被催动 | 施控者以药/符拿捏，定期需"续命" |
| 获得 | 招式、暗器、地形、饮食 | 被情花刺伤（剧情/地形） | 杂学·蛊招式、下毒事件、剧情强制 | 剧情强制、战败被擒 |
| 持续 | 回合；地阶起跨战斗；可自然消退 | 直到解除 | 直到解除；**有阶段**（潜伏→发作→危殆） | 直到解除；按期发作 |
| 触发 | 每回合 | "动情"条件 | 时间、蛊主催动、特定事件 | 时间（期限）、施控者在场 |
| 与施加者关系 | 无（施毒者死亡不影响） | 无 | **蛊主关联**：蛊主在场可催蛊；蛊主死亡按条目规则 | 施控者关联：在场时可能被操控 |
| 免疫 | 免疫中毒按品阶阻挡、净化 | 免疫中毒可按品阶阻挡**新**感染；已中者不被净化 | 免疫中蛊阻挡新感染；已中者**只压制不移除**（§9.3） | 无专门免疫；按附带标签处理（豹胎易筋丸含 `poison`，百毒不侵者可压制其发作）；Boss 常驻免疫 |
| 抵抗 | `resPoison` | `resPoison` | `resGu` | 仅 `effRes` |
| 驱散 | 运/医/药/武/休 | 仅专属解药；医只压制 | 仅专属解法；医只压制 | 仅专属解法 |
| 书眠 | 净化 | 净化 | 净化 | 净化 |

> 设计意图：**毒是战斗问题，蛊是开放世界问题**。毒靠战斗中的逼毒、医术、解药解决；蛊与受制把玩家推向 NPC、任务与抉择（找谁解、拿什么换、是否与施蛊者翻脸），成为书界支线的钩子。

### 9.2 蛊的生命周期

```
            感染（招式命中 / 下毒事件 / 剧情）
                 │ 免疫中蛊与 resGu 判定（§9.3）
                 ▼
   ┌────── 潜伏 latent ──────┐   hidden: true（未识破时不可见）
   │ 无战斗效果；计时 latentFor │   识破：队伍中 med/poi/antidote ≥ 50，或医者 NPC 诊断
   └───────────┬─────────────┘
     到期 / 蛊主催动 / 触发事件（节令、情境）
               ▼
   ┌────── 发作 active ──────┐   战斗中：每 flareTurns 回合（或每回合）S1 段发作
   │ 周期发作；战斗外按时辰  │   战斗外：每 flareEvery 时辰发作（掉血不致死、属性惩罚）
   └───────────┬─────────────┘
     发作期累计 terminalAfter 日未解
               ▼
   ┌────── 危殆 terminal ─────┐   条目定义的重惩罚（上限大减、心神失控……），直到解除
   └──────────────────────────┘
   任一阶段：专属解法 → 移除；医术 → 压制（冻结计时）；书眠 → 净化
```

| 通用字段（`params`） | 说明 |
|---|---|
| `latentFor` | 潜伏时长（时辰）；`-1` = 只由触发器结束潜伏 |
| `flareTurns` | 战斗中发作间隔（持有者回合；1 = 每回合） |
| `flareEvery` | 战斗外发作间隔（时辰） |
| `terminalAfter` | 发作期多少日后进入危殆 |
| `onMasterDeath` | 蛊主死亡时：`die` 蛊随主亡（移除）/ `wild` 失控（发作间隔减半）/ `none` 无影响 |
| `cuiDong` | 蛊主在场时可否以行动"催蛊"（`bf_gu_cuidong`）令其立即发作 |

**压制**（医术、免疫中蛊、蛊王）：冻结 `phase` 与所有计时；压制期间不发作。医术压制时长：`medGrade ≥ 蛊品阶 − 2` 时可压制 `3 × (medGrade − 蛊品阶 + 3)` 日（例：医者品阶 8 对地上蛊 9 → 6 日）。

### 9.3 与"免疫中蛊"的关系

| 情形 | 规则 |
|---|---|
| 新感染 vs 免疫中蛊（`bf_mian_gu`、蛊王护身） | Δ = 蛊品阶 − 免疫品阶。Δ ≤ 0 完全阻挡；Δ ≥ 1 以概率 ρ(Δ) 感染（蛊是活物，**不存在"半只蛊"**，故只按概率，不削数值） |
| 已中蛊后获得免疫 | **不移除**（免疫净化对 `special` 类无效）；免疫品阶 ≥ 蛊品阶 → 完全压制（冻结阶段与计时）；更低 → 发作伤害 × ρ(Δ)、发作附带的概率效果按概率 ρ(Δ) |
| 免疫失效（到期/被驱散/卸下装备） | 压制解除，计时从冻结处继续 |
| `resGu` | 降低感染概率（04 效果命中，按 §3.5.2 的 `resEff`）；发作伤害按 §5.3.2 的 `resPart` 减免 |
| 蛊王以蛊制蛊 | 蛊王护身持有者的行动"以蛊制蛊"对相邻单位执行 `special` 驱散（品阶 ≤ 蛊王） |

### 9.4 解法

| 解法 | 适用 | 规则 |
|---|---|---|
| 蛊主解蛊 | 全部蛊 | 说服/交易/胁迫蛊主（12：口才、声望、任务）；蛊主亲解必定成功 |
| 专属解药 | 条目指定 | 物品 `it_*`（10）；品阶 ≥ 蛊品阶时移除，否则只压制 30 日 |
| 以蛊制蛊 | 蛊王品阶 ≥ 蛊品阶 | 移除；对金蚕蛊等天阶蛊需蛊王天阶 |
| 名医 + 奇药 | 条目指定的任务链 | 例：寻访名医并取得奇药（任务由书界文档设计） |
| 万毒之王 | 金蚕蛊、碧蚕毒蛊（原创扩展） | 莽牯朱蛤（天龙）持有者/服食者的血可解一次（原创扩展设定；原著只载段誉服后百毒不侵） |
| 书眠 | 全部 | 书眠净化（§12.7） |

### 9.5 蛊类目录（10 条）

| ID | 名称 | 类极 | 品阶 | 数值 / 规则（阶段参数） | 持续 | 叠加 | 标签 | 驱散 | 典型来源 |
|---|---|---|---|---|---|---|---|---|---|
| `bf_gu_jincan` | 金蚕蛊 | E− | 10–11 | 潜伏 36 时辰；发作：战斗中每回合 S1 `hpMax × 1.5%×G`（绕过护体）并 30% 剧痛失去行动；战斗外每时辰 −1% 气血（不致死）、休息不回血；发作 7 日 → 危殆：`attr:hpMax pct −50%`；`onMasterDeath: wild` | 治·界 | I1 | gu.jincan | 专：蛊主、金蚕解药（原创扩展）、天阶蛊王、万毒之王 | "金蚕蛊毒"为原著所载的天下奇毒之一（出处与细节待考）；施蛊者由书界设计 |
| `bf_gu_bican` | 碧蚕毒蛊 | E− | 8–9 | 随饮食入体（探索下毒事件）；潜伏 12 时辰；发作：每回合 `hpMax × 1.2%×G`、受疗 −30pp；战斗外每 6 时辰 −3% 气血；发作 5 日 → 危殆：不能施放绝招、`attr:spd pct −20%` | 治·界 | I1 | gu.bican | 专：蛊主、解药、蛊王（≥ 9）、万毒之王 | 原著所载毒蛊之名（出处待考）；本作归入西南用蛊一脉（原创扩展） |
| `bf_gu_sanshi` | 三尸脑神丹 | E− | 9 | 丹中尸虫平时蛰伏（潜伏，无效果）；`onCalendar` 端午节（待考）前未服解药 → 发作：战斗中 S6 25% 迷惑、`attr:wis/wil flat −20`；发作 10 日 → 危殆：每回合 50% 失控（`aiOverride berserk`）；施药者在场可催动：本回合移魂。见示例 D | 治·界 | I1 | gu.sanshi, bind.sanshi | 专：施药者的年度解药（重置期限）；根治 = 任务（原创扩展） | 笑傲·日月神教以之控制部众 |
| `bf_gu_shixin` | 噬心蛊 | E− | 6–8 | 无潜伏；蛊主在场时每回合 S1 发作：`hpMax × 1%×G` + `rage −10`；战斗外每 3 日发作一次（−10% 气血，不致死）；`onMasterDeath: die` | 治·界 | I1 | gu.wuxian | 专：蛊主、五仙教解药、蛊王 | 五仙教（笑傲·蓝凤凰一脉，蛊名原创扩展） |
| `bf_gu_qingsi` | 情丝蛊 | E− | 7–9 | **成对**种于两名角色（母蛊/子蛊，互为 `source`）：一方受到伤害时另一方承受其 20%（`redirect`，不减少原伤害）；一方倒地时另一方 `hp −50%`（不致死）；战斗外两人分处不同区域超过 3 日 → 双方每日 −5% `hpMax`（可恢复） | 治·界 | I1 | gu.wuxian | 专：两人同时服解药、蛊王 | 五仙教（原创扩展）——与情花毒对照：情花毒是**毒**、因"动情"而发；情丝蛊是**活蛊**、以伤害与距离把两人绑在一起 |
| `bf_gu_shigu` | 蚀骨蛊 | E− | 4–8 | 发作期每次持有者行动后 `attr:defOut pct −2%×G`（累计至 −30%，战斗外保留）；潜伏 24 时辰 | 治·界 | S15（内部计数） | gu.wuxian | 专：解药、蛊王；医：压制 | 五仙教（原创扩展） |
| `bf_gu_mixin` | 迷心蛊 | E− | 7–10 | 蛊主可在战斗中花费一次行动令持有者移魂 1 回合（冷却 3）；战斗外与蛊主对话时强制出现"服从"选项（12）；`onMasterDeath: die`（蛊主死后 30 日自行消亡） | 治·界 | I1 | gu.wuxian, mind | 专：蛊主、蛊王 | 五仙教（原创扩展） |
| `bf_gu_xue` | 血蛊 | E− | 5–9 | 持有者受到的治疗 30% 被截留（`onHealed` 改写），蛊主在场时转给蛊主，否则流失；战斗外休息回复 −30% | 治·界 | I1 | gu.wuxian | 专：解药、蛊王；医：压制 | 五仙教（原创扩展） |
| `bf_gu_wang` | 蛊王护身 | M+ | 8–11 | `immune [gu]`（品阶 = 本 Buff）；行动"以蛊制蛊"：对相邻单位执行 `special` 驱散 `gu`（品阶 ≤ 本 Buff）；持有者施加的蛊类效果命中 `attr:effHit pct +20%` | ∞（被动） | H | guard.immune | ✗ | 五仙教教主（笑傲·蓝凤凰；"蛊王"设定为原创扩展） |
| `bf_gu_cuidong` | 催蛊 | E− | 5–11 | 瞬时：目标身上所有**来自施加者**的蛊立即发作一次；潜伏中的蛊提前进入发作期 | 瞬 | — | gu | — | 杂学·蛊的招式（05 杂学 `gu` 子类） |

### 9.6 完整 YAML 示例 D：三尸脑神丹

```yaml
- id: bf_gu_sanshi
  name: 三尸脑神丹
  category: effect
  polarity: debuff
  grade: 9
  gradeRange: [9, 9]
  tags: [gu, bind]
  subTags: [gu.sanshi, bind.sanshi]
  family: fam_gu
  resistAttr: resGu
  origin: canonExpanded
  canonRef: 笑傲·日月神教以三尸脑神丹控制部众；逾期不服解药，尸虫入脑（节令细节待考）
  hidden: false                          # 服丹者心知肚明，不隐藏
  duration: { type: untilCured }
  stack: { rule: independent, key: defSource, max: 1 }
  dispel:
    dispellable: true
    types: [special]
    specialCures:
      - { item: it_sanshi_jieyao, effect: resetDeadline }          # 年度解药：重置期限（10）
      - { quest: q_05_side_sanshi, effect: remove }                 # 根治任务（原创扩展，chapters/05 设计）
  priority: 20                            # S1 周期发作段
  params:
    deadline: "world.festival('duanwu')"  # 期限：下一个端午
    charmChance: 0.25
    terminalAfter: 10                     # 日
    onMasterDeath: none
  onApply:
    - { op: setPhase, phase: latent }
  triggers:
    - on: onCalendar
      when: "phase == 'latent' && world.now >= p.deadline && !has(holder, 'flag.sanshi_antidote_this_year')"
      ops:
        - { op: setPhase, phase: active }
        - { op: log, template: "{holder} 脑中如有万虫攒动——三尸脑神丹发作了！" }
    - on: onWorldTick
      when: "phase == 'active' && world.daysSince('phase') >= p.terminalAfter"
      ops: [ { op: setPhase, phase: terminal } ]
    - on: onTurnStart
      when: "phase == 'active'"
      chance: "p.charmChance * pen"
      ops: [ { op: aiOverride, mode: charm } ]
    - on: onTurnStart
      when: "phase == 'terminal'"
      chance: "0.5 * pen"
      ops: [ { op: aiOverride, mode: berserk } ]
  mods:
    - { op: modStat, stat: wis, kind: flat, value: -20, when: "phase != 'latent'" }
    - { op: modStat, stat: wil, kind: flat, value: -20, when: "phase != 'latent'" }
  persist: { minTier: huang, battleEnd: keep, worldDuration: -1 }
  ui: { icon: buff/gu_sanshi, frame: auto, showTimer: true, sortGroup: bind, hudPin: true }
  text:
    short: "端午需服解药"
    desc: "{if phase=='latent'}尸虫蛰伏。须在 {p.deadline:date} 前服下解药。{/if}{if phase=='active'}尸虫发作：悟性、定力 −20；每回合 {p.charmChance:%} 迷失心智。{/if}{if phase=='terminal'}神智将失：每回合 50% 狂乱。{/if}"
    log: "{holder} 的三尸脑神丹 {phaseName}"
  aiValue: "phase == 'latent' ? -1 : -6"
```

### 9.7 开放世界中的用法（交给书界文档）

| 书界 | 蛊/受制钩子 | 玩法（由 chapters/*.md 细化） |
|---|---|---|
| 天龙 | 生死符 | 灵鹫宫支线：主角或队友被种生死符 → 投靠/反抗童姥 → 学天山六阳掌自解并为群豪拔符（致敬虚竹） |
| 神雕 | 情花毒 | 绝情谷支线：中情花毒后，与羁绊队友同行即掉血，迫使玩家在"带不带她/他上阵"之间取舍，直至取得断肠草 |
| 笑傲 | 三尸脑神丹、五仙教诸蛊 | 日月神教线：以服丹换取入教身份；年度解药驱动一条贯穿全书界的任务线；五仙教（蓝凤凰）可结交以得蛊王相助 |
| 鹿鼎 | 豹胎易筋丸 | 神龙教线：被迫服丸 → 为洪教主办事 → 取解药或反戈（洪安通 Boss 战前的最大压迫源） |
| 飞狐 | 七心海棠、碧蚕毒蛊 | 药王谷一脉支线：识毒、辨蛊的医毒技艺检定（致敬程灵素） |

---

## 10. UI 表现规则

> 手机端布局、字号、交互手势的总规范归 `design/14-ui-ux-mobile.md`；本节只规定 Buff 相关的视觉语义，供 14 与 tech/06 素材规格引用。

### 10.1 图标构成

```
 ┌──────────────┐  ① 外框形状 = 极性/类别（§10.2）
 │▣           压│  ② 外框颜色 = 品阶大阶（基准 §4 主色）
 │              │  ③ 框底小点 = 小品：下 ● / 中 ●● / 上 ●●●
 │    （图案）   │  ④ 右下角 = 叠层数（≥2 才显示）
 │⑤3         ×5│  ⑤ 左下角 = 剩余回合（环形倒计时 + 数字）；∞ 不显示；×n 显示次数
 └───●●●────────┘  ⑥ 左上 ▣ = 跨战斗标记（灯笼）；右上"压" = 被免疫部分压制（pen < 1）
```

| 元素 | 规则 |
|---|---|
| 外框颜色 | 黄 `#B8955A`、玄 `#3E5C76`、地 `#8E3B2F`、天 `#D4AF37`（基准 §4）；天阶外框附加缓慢流光（仅在 HUD 详情面板播放，头顶小图标静态，省电） |
| 小品点 | 下品 1 点、中品 2 点、上品 3 点，颜色同外框 |
| 被削品 | 外框颜色按当前品阶；详情中显示"原品阶 → 当前品阶" |
| 隐藏实例 | 未识破时持有方完全不显示；识破后显示并在左上加"识"字角标 |
| 图案 | 按标签取统一图形母题：毒=葫芦/蛇、蛊=虫、穴=指点、内伤=经脉裂纹、流血=血滴、寒=冰棱、热=火焰、控制=锁链、心神=漩涡、护体=金钟、破兵=断剑、架势=拳架剪影；同母题内以纹样区分具体 Buff（素材规格归 tech/06） |

### 10.2 极性与类别的区分（不只靠颜色）

| 类型 | 外框形状 | 底色 | 飘字颜色 |
|---|---|---|---|
| 增益（stat/effect） | 圆形 | 宣纸浅色 | 翠绿 |
| 减益（stat/effect） | 菱形（方形旋转 45°） | 暗朱底纹 | 朱红 |
| 机制类增益 | 六角形 | 宣纸浅色 + 金线 | 金 |
| 机制类减益（受制、走火、蛊） | 六角形 | 暗朱底纹 + 黑线 | 暗紫 |
| 永久被动 | 方形篆印（无框） | 朱印 | 不飘字 |

形状区分保证红绿色弱玩家可辨认；"色弱模式"（14）下增益/减益额外加 ▲/▼ 角标。

### 10.3 排布与交互

| 位置 | 显示内容 | 数量 | 排序 |
|---|---|---|---|
| 单位头顶（战场） | 最重要的实例 | ≤ 4 个 + "+n" | 硬控 > 机制减益 > 蛊/受制 > DOT > 机制增益 > 其他（同组按剩余回合升序） |
| 行动条头像旁（CT 时间轴） | 仅硬控图标 | 1 | — |
| 选中单位的状态栏 | 全部实例：常驻被动（折叠为一行"常驻 ×n"）/ 增益 / 减益 三行 | 全部 | `ui.sortGroup` → 品阶降序 → 剩余回合升序 |
| 探索 HUD（战斗外） | 跨战斗减益 | ≤ 3 + "+n" | 蛊/受制 > 内伤 > 毒 > 其他 |

- 触控：长按图标 300ms 弹出详情卡（§10.4）；状态栏内单击即弹出。PC：悬停 250ms。
- 头顶图标 18×18 CSS px，状态栏 28×28，详情卡图标 48×48（手机横屏基准，14 可调）。
- 新施加的实例图标在头顶闪现 0.6 秒（免疫/抵抗时以灰色图标闪现并打叉）。

### 10.4 说明文本模板

**占位符语法**（`text.desc`/`short`/`log` 通用）：

| 语法 | 含义 | 例 |
|---|---|---|
| `{name}` / `{gradeName}` | 名称（含 `nameByTier`）/ 品阶名 | 深毒 / 地中 |
| `{p.x}` / `{p.x:%}` / `{p.x:pp}` | 参数值 / 百分数 / 百分点 | 14.4% |
| `{calc:key}` | 以持有者当前属性代入后的**实数** | 每回合 186 点 |
| `{stacks}` `{maxStacks}` `{dur}` `{charges}` | 层数、上限、剩余回合、剩余次数 | 3/5 |
| `{src}` `{origin}` | 施加者、来源物 | 五毒教弟子 · 五毒掌 |
| `{if 条件}…{/if}` | 条件文本（条件语法同 §2.3） | `{if tier>=xuan}…{/if}` |
| `[+]…[/+]` `[-]…[/-]` `[g]…[/g]` | 增益色、减益色、当前品阶色 | |

**规则**：战斗内一律显示代入后的实数（"每回合损失 186 点气血"），不显示公式；图鉴（武学/Buff 图鉴，05 §11）显示 12 档品阶的数值表。说明第一句必须是"做什么"，第二句才是"条件/附带"。

**详情卡模板**：

```
〈深毒 · 地中〉  效果类 · 减益                         [48px 图标]
来源：五毒教长老 · 五毒神掌（地中 · 第 7 重）
每回合开始损失 186 点气血（3/5 层），受疗效果 −10%。
剩余 3 回合 · 离开战斗后仍会发作（每时辰损失约 1%）
被〈辟毒香囊 · 玄中〉压制：穿透 45%
可解：运功逼毒（主运内功 ≥ 玄上可削品，≥ 地中可化解）· 医术 ≥ 63 · 解毒丹（地中及以上）
标签：毒 · 中毒
```

### 10.5 飘字

| 事件 | 飘字 | 颜色 |
|---|---|---|
| 施加增益 / 减益 | `+〈名〉` | 翠绿 / 朱红 |
| 免疫挡下 | `免疫` | 金 |
| 部分穿透 | `穿透 45%` | 橙 |
| 抵抗 | `抵抗` | 灰 |
| 驱散 / 削品 | `化解〈名〉` / `〈剧毒〉地中→地下` | 青 |
| DOT 跳伤 | 数字，按标签着色：毒 翠绿、流血 朱红、灼烧 橙、寒 冰蓝、内伤 紫、蛊 墨绿 | — |
| 机制触发 | `挪移` `斗转` `锁血` `复活` `破招` 等两字大字 | 金（增益）/ 暗紫（减益） |

同一单位同时最多 3 条飘字，其余合并为"+n 个状态"。

### 10.6 战斗日志

每条日志 = 一条结构化记录（用于回放、调试、AI 复盘）+ 一行中文文本。

```ts
interface BuffLog {
  t: number;              // 全局行动序号
  kind: 'APPLY'|'REFRESH'|'STACK'|'IMMUNE'|'PENETRATE'|'RESIST'|'TICK'|'TRIGGER'|'DISPEL'|'ERODE'|'EXPIRE'|'REMOVE'|'PHASE';
  buff: string; g: number; holder: string; source?: string;
  stacks?: number; value?: number; pen?: number; by?: string;   // by = 免疫/驱散实例 ID 或来源招式
}
```

| kind | 文本模板（简） | 例 |
|---|---|---|
| APPLY | `{src}〔{move}〕→ {holder}：〈{name}·{gradeName}〉{stacks}（{dur}）` | 李莫愁〔冰魄银针〕→ 主角：〈剧毒·地中〉（4 回合） |
| IMMUNE | `{holder} 的〈{by}〉挡下〈{name}〉` | 段誉 的〈百毒不侵·天下〉挡下〈剧毒〉 |
| PENETRATE | `〈{name}·{gradeName}〉穿透〈{by}〉，以 {pen:%} 之力生效` | 〈剧毒·地中〉穿透〈百毒不侵·玄上〉，以 45% 之力生效 |
| RESIST | `{holder} 抵抗了〈{name}〉` | |
| TICK | `{holder} {verb}（〈{name}〉×{stacks}），{valueText}` | 主角 毒发（〈深毒〉×3），损失 186 气血 |
| TRIGGER | `{holder}【{name}】：{effectText}` | 张无忌【挪移】：将 412 点伤害转嫁给 鹤笔翁 |
| DISPEL / ERODE | `{by} 化解〈{name}〉` / `{by} 逼退毒性：〈{name}〉{g0Name}→{gName}` | 主角 运功逼毒：〈剧毒〉地中→地下 |
| EXPIRE | `〈{name}〉自 {holder} 身上消散` | |
| PHASE | `{holder} 的〈{name}〉{phaseName}` | 主角 的〈三尸脑神丹〉发作 |

日志分"简"（默认，只记施加、免疫、驱散、机制触发、阶段变化）与"详"（含每跳 DOT/HOT 与公式分解，设置中开启）；详细模式的公式分解格式：`186 = 5000 × 1.76% × 3 × 0.94(Lb) × 0.75(抗) × 1.0(境界)`。

---

## 11. 平衡约束

### 11.1 数值上限（来自 Buff 的合计，含永久被动与套装）

| 族 / 项 | 增益合计上限 | 减益合计下限 | 说明 |
|---|---|---|---|
| `fam_atk`（`atkOut`/`atkIn` pct，各自计） | +80% | −60% | |
| `fam_def`（`defOut`/`defIn` pct，各自计） | +100% | −60% | |
| `fam_rat_*`（每项 RAT 的 pct） | +50% | −50% | 评级与对手做差（03），过高会让判定失去悬念 |
| `fam_spd` | +40% | −50% | 速度是最强属性，上限最紧 |
| `fam_move`（`mov`/`jump` flat） | +3 | −3（`mov` 最低 1，定身除外） | `qinggong` flat ≤ +40 |
| `fam_res_*`（抗性 pp） | +40pp | −40pp | 最终抗性仍受 03 的 −50%–75% 钳制 |
| `fam_pct_*`（critDmg pp） | +100pp | −50pp | |
| `fam_pct_*`（counter/combo pp） | +25pp | −25pp | 最终值另受 09 的上限 |
| `fam_pct_*`（healPower/healRecv pp） | +60pp | −80pp | 禁疗可以很重，但不为 0 |
| `fam_z2`（防御穿透） | 60% | — | "无视防御"机制除外 |
| `fam_z3` | +100% | −50% | |
| `fam_z4` | +75%（基准 §9 硬上限） | −50%（易伤） | |
| `fam_z5_<cat>`（破 X） | 取最高者，不叠加 | — | 05 的 `poBonus` 最高 29% |
| `fam_drain`（吸血） | 25% | — | 吸内另受各自规则 |
| `fam_reflect` | 40% | — | 反震不能反震 |
| `fam_redirect` | 50% | — | |
| `fam_shield` | `shieldMax`（03，≤ 50% `hpMax`） | — | |
| DOT 合计 / 回合 | 12% `hpMax`（Boss 另 × 0.25） | — | §5.3.2 |
| HOT 合计 / 回合 | 8% `hpMax` | — | 含回损、03 的 `hpRegen` |
| `cost` | −50% | +100% | |

**单条 Buff 设计红线**（数据校验，§13）：
1. 数值类单条在天上品时不得超过所在族上限的 40%（例：攻击单条 ≤ 32%、抗性单条 ≤ 16pp、受疗单条 ≤ 24pp）；整数型（`mov`/`jump`）与 05 已定值的武学专属 Buff 除外。
2. 满层 DOT ≤ 同级普通敌人单击伤害的 1.2 倍（≈ 10–12% `hpMax`，基准 §5 节奏：敌人 8–12 击杀主角）。
3. 任何硬控单次持续 ≤ 2 回合；控制链条受 §11.3 坚毅约束。
4. 任何增益的 `aiValue` 与其实际收益偏差由模拟器校验（tech/05 批量对战）：单 Buff 对标准战斗 TTK 的影响 ≤ ±25%，机制类除外（逐条评审）。

### 11.2 同时存在数量上限（每单位）

| 类别 | 上限 | 超出时 |
|---|---|---|
| 非永久增益 | 10 | 新实例挤掉"评分最低"者：`评分 = g × 10 + turnsLeft`（机制类 +50）；若新实例评分更低则**新实例被拒绝**（日志"状态已满"） |
| 非永久减益 | 10 | 同上（减益被挤掉对持有者有利，故减益按"最早施加者先出"更公平：挤掉 `iid` 最小者） |
| 其中机制类（增益 + 减益合计） | 4 | 新机制类挤掉同极性最早者 |
| 永久被动 | 不限（通常 10–25 个） | 不计入上述上限，UI 折叠 |
| 同一定义 `independent` 实例 | 按条目 `max`（默认 3） | §4.1 |
| 全战场实例总数 | 360（20 单位 × 18） | 超出时拒绝新的非机制类实例并告警（性能保护，tech/05） |

### 11.3 机制类的持续、冷却与次数

"冷却"以持有者行动计，自 Buff **结束**时开始计算；"每战次数"按单位计。

| 机制 | 单次持续上限 | 冷却 | 每战次数 | 玩家方 | 普通/精英敌人 | Boss |
|---|---|---|---|---|---|---|
| 无敌 `bf_wudi` | 1（天上 2） | 6 | 2 | ✅ | ✅ | 仅阶段转换脚本（09） |
| 万法不侵 `bf_mian_jianyi` | 1 | 8 | 1 | ✅ | ❌ | 仅阶段脚本 |
| 锁血 `bf_suoxue` | 2 或 ×1 | — | 1 | ✅ | 精英 ✅ | 阶段脚本（转阶段时锁血） |
| 复活 `bf_fuhuo` | ×1 | — | 1 | ✅ | ❌ | ❌（以阶段转换代替） |
| 诈死 `bf_zhasi` | 2 | — | 1 | ✅ | ✅ | ❌ |
| 再动 `bf_zaidong` | 1 次额外行动 | 3 | 3 | ✅ | ❌ | 以 09 的"连动"机制代替 |
| 挪移 `bf_nuoyi` | 3 | 4 | 3 | ✅ | ✅ | ✅ |
| 斗转 `bf_douzhuan` | 被动 | 每回合至多 1 次 | — | ✅ | ✅ | ✅（对玩家绝招概率减半） |
| 残影 `bf_canying` | 层数 ≤ 3 | — | — | ✅ | ✅ | ✅ |
| 隐身 `bf_yinshen` | 2 | 5 | 2 | ✅ | ✅ | ❌ |
| 必中 / 必暴 / 无视防御 | 次数型 | 3 | — | ✅ | ✅ | ✅ |
| 援护 `bf_yuanhu` | 2 | 3 | — | ✅ | ✅ | ✅ |
| 金刚不坏 `bf_jingang` | 被动 / 2 | 主动 5 | — | ✅ | ✅ | ✅（cap 下限 16%） |
| 硬控（眩晕/冰冻/昏睡/点穴） | 2 | — | — | 受"坚毅"约束 | 同左 | 受控制递减（§11.4） |

**坚毅（反连控）**：任一硬控结束时，持有者获得 `bf_jianyi` 1 回合：期间免疫**同子标签**的硬控（不同子标签仍可生效，给"换一种控法"留空间）。玩家与敌人一视同仁。

### 11.4 Boss 与精英豁免

| 项 | 普通 | 精英 | Boss | 终局"天书守卷人"（13） |
|---|---|---|---|---|
| `hpMax` 比例型伤害（DOT、猬刺、撞击等）系数 `pctFactor` | 1.00 | 0.50 | 0.25 | 0.15 |
| 硬控 | 正常 | 持续 −1（最低 1） | **控制递减**（下） | 免疫 |
| 心神类（迷惑/移魂/恐惧） | 正常 | 移魂无效，其余持续 −1 | 免疫迷惑、移魂；恐惧/嘲讽至多 1 回合 | 免疫 |
| 受制 / 蛊（新施加） | 正常 | 正常 | 免疫（剧情另定） | 免疫 |
| 缴械 / 断兵 | 正常 | 概率 × 0.5 | 概率 × 0.5；神兵按 `bf_mian_pobing` | 免疫 |
| 吸内 | 正常 | ×0.75 | ×0.5 | ×0.25 |
| 驱散其增益（`purge`） | 正常 | 正常 | 阶段 Buff（狂暴等）不可驱散 | 同左 |
| 数值类减益 | 正常 | 正常 | 正常（**这是对付 Boss 的主力**） | 效果 × 0.5 |

**Boss 控制递减**：Boss 维护计数器 `ccCount`（每次成功施加硬控 +1，Boss 连续 6 个自身回合未被硬控则清零）：

| `ccCount`（本次施加前） | 本次硬控 |
|---|---|
| 0 | 正常生效，持续上限 1 |
| 1 | 生效概率 × 0.5，持续 1 |
| ≥ 2 | 无效；Boss 获得 3 回合"不动如山"（`bf_mian_kong`，品阶 = Boss 最高武学品阶），计数清零 |

软控（减速、定身、缠绕、失衡）对 Boss：持续 −1（最低 1），不计入 `ccCount`。

**个例（示意，数值归 chapters/08）**：鹿鼎记洪安通（基准 §2：书界难度峰值 8）——其麾下受豹胎易筋丸所制的教众带 `bf_shouzhi`（免疫恐惧、不可撤退、死战不退）；洪安通本人在低武书界拥有地上品护体与全书界唯一的"阶段转换无敌"，以此形成"武运最低、Boss 最陡"的体验。

### 11.5 平衡自检清单（每新增一条 Buff 必答）

| # | 问题 | 不通过的处理 |
|---|---|---|
| 1 | 它属于哪一类、作用在哪一层（§4.7）？ | 退回补标注 |
| 2 | 天上品的数值是否超过族上限的 40%？ | 下调基准值 |
| 3 | 是否至少有 2 种解法（减益）或 1 种反制（增益：破功/机制克制）？ | 补驱散类型 |
| 4 | 对 Boss 是否会失衡（比例伤害、控制、吸取）？ | 配 `bossProfile` |
| 5 | 跨战斗吗？战斗外有无恢复路径？ | 补 `persist.rest` 或专属解法 |
| 6 | 原著依据是否标注清楚（原著 / 原创扩展 / 待考）？ | 退回补标注 |

---

## 12. 与其他系统的接口

| # | 系统 | 本文提供 | 本文需要 |
|---|---|---|---|
| 12.1 | 武学（05） | Buff 定义、`applyBuff`/`dispel`/`immune` 语义、§2.5 字段对接、破 X 的 Buff 结构与大阶质变、走火三级的 Buff 本体 | 招式 `buffs` 概率与持续、被动 `value` 覆写值、`effGrade`、有效层数、辅运比例 `auxMode`、破 X 的 `poBonus`/`poParry`、走火触发条件 |
| 12.2 | 伤害公式（04） | 数值类 Buff 的作用层（§4.7）；DOT/HOT 管线（§5.3.2）；机制防护插入点（§5.3） | Z0 旗标接口：`mustHit` `mustCrit` `skipParry` `noCrit` `ignoreDef` `asBack` `asHigh`；判定乘数接口 `targetParryMult`；效果命中公式采纳 `resEff`（03 §6.3 建议式）；治疗公式；Z8 境界差函数供 DOT 调用 |
| 12.3 | 属性（03） | 修饰器（`flat`/`flatLv`/`pct`/`pp`/`override`）及族上限 | 叠加管线 §11.2、`floor_S = 0.2`、`resGrade`（§6.3）、`shieldMax`、`hpRegen`/`mpRegen`/`rageGain` 次级属性 |
| 12.4 | 套装（07） | 套装加成以 `origin: set` 的永久被动 Buff 实现；品阶 = 套装当前档位品阶；数值同样计入族上限。例（用户示例"少林金刚"）："拿穴 +XX%" → `attr:seal pp`；"伤害 +XX%" → `Z3`；"招架 +YY%" → `attr:parry pct` | 套装档位与数值 |
| 12.5 | 地形与轻功（08） | `onTerrainEnter`/`onTerrainStay` 挂载地形 Buff（毒沼→中毒、火场→灼烧、雪原→寒气、入水→解除灼烧/失明）；`bf_shenqing` 临时抬高轻功值可跨门禁；`bf_fengqinggong` 使门禁判定按 `qinggong = 0`；击退/牵引的坠落与撞击 | 地形目录与地形 Buff 品阶；坠落伤害公式 |
| 12.6 | 战斗（09） | `ctShift`、`skipAction`、`aiOverride` 各模式、反应队列深度 3、`extraAction` 规则、Boss 豁免与控制递减（§11.4） | 行动"运功调息/运功护体/运功逼毒/运功化解/拾回兵器/挣脱"的本体；AI 各接管模式的行为；Boss 阶段脚本；合击（天罡北斗阵）挂载锁定/追击 |
| 12.7 | 书眠与多周目（02/13） | **书眠净化**：书眠时移除全部非 `permanent` 实例（含蛊、受制、生死符、跨战斗内伤）；`permanent` 实例随来源在新书界按有效品阶重算；`bf_duanchen` 等跨书界永久代价保留；天书之力以 `origin: tsp` 永久被动实现 | 书眠流程的叙事表现；天书之力效果目录（13） |
| 12.8 | 开放世界（11） | `onWorldTick`/`onRest`/`onAreaEnter`/`onCalendar` 钩子；跨战斗 Buff 的世界态规则（§5.4） | 时辰与日历、节令（端午等）、休息与闭关的时间成本、天气/区域寒热 |
| 12.9 | 物品（10） | 解药/丹药的驱散语义（`antidote` 类型，按物品品阶与标签）；神兵免疫（`bf_mian_pobing`）；断兵的修复入口 | 丹药/解药目录与品阶；锻造修复 |
| 12.10 | NPC/任务（12） | `special` 解法中的 NPC 与任务引用；`onTalk` 钩子（迷心蛊、易容识破） | 名医 NPC 技艺值；解蛊/解受制任务链 |
| 12.11 | UI（14） | §10 全部视觉语义 | 手机布局与字号总规范、色弱模式开关 |
| 12.12 | 玩法引擎（tech/05） | DSL 语义、结算全序、伪代码（§4.1）、TS 类型（§6.5）、日志结构（§10.6） | 解释器实现；构建期表达式编译；属性缓存"脏标记"重算；存档序列化 `BuffInstance`；批量对战模拟器（§11.1 红线 4） |

**实现要点（给 tech/05 的约束）**：
- **确定性**：所有随机（触发概率、麻痹、撞开穴道）走战斗种子 RNG；同优先级按 `iid` 升序；集合遍历一律用数组而非对象键序。
- **性能预算**：单次行动内 Buff 结算 ≤ 0.5 ms（中端手机）；实现"钩子 → 实例列表"倒排索引，避免每事件遍历全部实例；数值类修饰仅在属性"脏"时重算（03 §11.4 重算时机）。
- **数据打包**：Buff 定义为跨书界公共数据（`data/common/buffs/*.yaml`，tech/01 §目录约定），构建期编译表达式并做 §13 校验。
- **存档**：只存 `BuffInstance`（§2.2）；定义变更后读档按 `def` 重新绑定，`params` 以新定义为准、`snap` 保留旧值。

---

## 13. 数据校验规则与测试用例

### 13.1 构建期校验（Zod + 自定义规则）

| # | 规则 | 级别 |
|---|---|---|
| V1 | `id` 匹配 `^bf_[a-z0-9_]+$` 且全局唯一 | 错误 |
| V2 | `category`/`polarity`/`tags` 必填；`tags` 的主标签 ∈ 基准 §10 的 12 个 + 本文提案 4 个（§7.4） | 错误 |
| V3 | `category: stat` 的每条 `mods` 必须写明作用位置（§4.7 记法之一）；`modStat.kind` 必须符合 03 §0.2 的形态约束 | 错误 |
| V4 | `polarity: debuff` 的条目 `dispel.types` 非空，或 `dispellable: false` 时 `specialCures` 非空（"反制有路"，§1.1 B3）；系统类豁免需显式 `systemExempt: true` | 错误 |
| V5 | 所有表达式只引用 §2.3 白名单符号；`ctx.*` 字段必须属于该钩子的上下文（§6.1） | 错误 |
| V6 | 按 g=12、`Lb=1` 计算的数值不超过族上限的 40%（§11.1 红线 1） | 警告 |
| V7 | 满层 DOT 在 g=12 时 ≤ 12% `hpMax`/回合 | 警告 |
| V8 | `mechanic` 类必须有 `limits` 或在 §11.3 表中有默认值 | 错误 |
| V9 | `persist` 存在时必须给出至少一种战斗外解除方式（`worldDecay`/`rest`/`specialCures`） | 错误 |
| V10 | 05 引用的 Buff ID（招式 `buffs`、被动 `buff`、`immune`）必须存在于本目录 | 错误 |
| V11 | `origin: canon`/`canonExpanded` 必须有 `canonRef`；含"待考"的条目进入考据清单 | 警告 |
| V12 | `stack.rule: highest` 时 `key` 强制为 `defSource` | 错误 |

### 13.2 测试用例（玩法核心单元测试，期望值精确）

| # | 场景 | 输入 | 期望 |
|---|---|---|---|
| T1 | 免疫部分穿透 | 持有者 hpMax 5000，`bf_mian_du` g6；施加 `bf_judu` g8、`Lb = 1` | 实例 `pen = 0.45`；S2 伤害 `⌊5000 × 0.044 × 0.45⌋ = 99`（无抗性、同级） |
| T2 | 削品链 | T1 后主运内功 g6 运功逼毒两次 | 第 1 次：g8→7，`pen` 变 0.30；第 2 次：g7→5 ≤ 6 → 免疫净化移除 |
| T3 | 刷新 | 持有者有 `bf_waigong_sheng` g5 剩 1 回合；再施加 g4 持续 3 | 品阶仍 5、剩余 3 |
| T4 | 叠层整池升品 | `bf_zhongdu` g3 ×2 层；另一施加者施加 g6 ×1 | 3 层、g6、持续取 max、快照取单跳较大者 |
| T5 | 取高接替 | 两个 `bf_judu`（g8 剩 1、g6 剩 3） | 前 1 回合 g8 激活；其到期后 g6 立即激活并剩 2 |
| T6 | 增减益抵消 | 外攻 +20%（pct）与外攻 −15%（pct） | 净 +5%；驱散减益后 +20% |
| T7 | fresh | 持有者在自己行动中给自己施加 3 回合增益 | 本次行动结束不递减；之后第 3 次行动结束时移除 |
| T8 | 眩晕计数 | 他人回合对持有者施加眩晕 1 回合 | 持有者下一次行动被跳过，E2 递减后移除，并获得坚毅 1 回合 |
| T9 | 再动不递减 | 持有者带 2 回合增益，触发再动 | 额外行动不执行 S 段、不递减；增益仍剩 1 回合（仅主行动递减 1） |
| T10 | 防乒乓 | A 带斗转、B 带斗转，A 攻击 B 且 B 触发斗转 | 招式反弹给 A，带 `mirrored` 旗标，A 的斗转不再触发 |
| T11 | DOT 上限 | 持有者身上中毒、剧毒、流血、灼烧合计 15% hpMax | 实扣 12%；按 priority 从后往前削（灼烧先被削） |
| T12 | Boss 控制递减 | 对 Boss 连续三次施加眩晕（均判定成功） | 第 1 次生效 1 回合；第 2 次 50% 生效；第 3 次无效，Boss 获不动如山 3 回合 |
| T13 | 蛊与免疫 | 已中 `bf_gu_bican` g9（发作期）；获得 `bf_mian_gu` g9 | 不移除；阶段与计时冻结；免疫消失后从冻结处继续 |
| T14 | 跨战斗换算 | 战斗结束时有 `bf_zhongdu` g8 ×3 层 | 转世界态：持续 12 时辰；每时辰掉 `hpMax × 0.5% × 2.2 × 3 = 3.3%`（不致死）；每 4 时辰 −1 层 |
| T15 | 破招不破高阶绝招 | 持有者 `bf_pojian` g11；受到 g12 剑法绝招 | 破招触发条件为假（绝招品阶 > 本 Buff），不作废；其余破剑效果正常 |
| T16 | 封内力暂停被动 | 主运九阳（`bf_mian_han` 被动）被施加 `bf_fengnei` | `bf_mian_han` 暂停（图标置灰），此时可被施加寒气；封内力解除后恢复并对寒气执行免疫净化 |
| T17 | 护体完全吸收 | 护体 800，受 600 伤害的攻击附带内伤与破甲 | 内伤不施加，破甲照常判定 |

---

## 14. 本文新增术语与 ID

### 14.1 术语与规则名

| 术语 | ID / 英文 | 定义位置 |
|---|---|---|
| 持有者 / 施加者 / 来源物 | `holder` / `source` / `origin` | §1.2 |
| 大阶 | `tier`：`huang` `xuan` `di` `tian` | §1.2、§3.3 |
| 层数系数（Buff） | `Lb = 0.70 + 0.03 × layerEff` | §3.2 |
| 穿透系数 | `ρ(Δ) = min(0.90, 0.15 + 0.15Δ)`（Δ ≥ 1） | §3.5.0 |
| 削品 | `gradeErode` | §3.5.3 |
| 免疫净化 | `immunePurify` | §3.5.5 |
| 抵抗品阶 / 有效抗性 | `resGrade` / `resEff`（正式定义归 03 §6.3） | §3.5.2 |
| 叠加键 | `stackKey`：`def` / `defSource` / `defParam` | §4.2 |
| 族 / 族上限 | `fam_*` | §4.3、§11.1 |
| 互斥组 | `exg_*`：`exg_stance` `exg_control_hard` `exg_mind` `exg_ai_override` `exg_zouhuo` | §4.4 |
| 元素反应 | `rx_*`：`rx_binghuo` `rx_duruxue` `rx_hanbingxixing` `rx_yiduigongdu` | §4.6 |
| 作用位置记法 | `attr:<id> flat/pct/pp/mult/override`、`Z0:<flag>`、`Z2`–`Z9`、`settle`、`cost`、`ct` | §4.7 |
| 结算段 | S1–S7、A、E1–E6（行动内）；P1–P8（攻击管线） | §5.2、§5.3 |
| 反应队列 | 深度 ≤ 3；旗标 `reflected` `redirected` `mirrored` `countered` | §5.3.1 |
| 跨战斗 / 世界态 | `persist`；时间单位 `shichen`（时辰） | §2.1.4、§5.4 |
| 永久被动 | `passive`（`duration: permanent`） | §5.5 |
| 暂停（被动） | 持有者处于 `seal.mp` 时内功来源的 effect/mechanic 被动暂停 | §5.5 |
| 驱散类型 | `circulate` `acupoint` `medicine` `antidote` `skill` `purge` `special` `rest` `bookSleep` | §7.1 |
| 医术品阶 | `medGrade(v) = min(12, 1 + ⌊v/9⌋)` | §7.1 |
| 冲穴概率 | `P冲穴 = clamp(5%, 95%, 25% + 15%×Δg + 0.3%×(con−50))` | §7.1 |
| 破 X 匹配 | `poMatch(cat, u, move)`、`mainCat(u)` | §8.6.1 |
| 蛊阶段 | `phase`：`latent` 潜伏 / `active` 发作 / `terminal` 危殆；参数 `latentFor` `flareTurns` `flareEvery` `terminalAfter` `onMasterDeath` `cuiDong` | §9.2 |
| 蛊主 | 施蛊者（`source`），可"催蛊" | §9.2 |
| 书眠净化 | 书眠时移除全部非永久实例 | §5.4.1、§12.7 |
| 坚毅 | 硬控结束后 1 回合同子标签硬控免疫 | §11.3 |
| 控制递减 | Boss 计数器 `ccCount` | §11.4 |
| 比例伤害系数 | `pctFactor`：普通 1.00 / 精英 0.50 / Boss 0.25 / 终局 0.15 | §11.4 |

### 14.2 数据结构、字段与枚举

| 类别 | 名称 |
|---|---|
| 类型 | `BuffDef` `BuffInstance` `Duration` `StackSpec` `DispelSpec` `PersistSpec` `Trigger` `Op` `Mod` `BuffLog` |
| `BuffDef` 字段 | `id` `name` `nameByTier` `category` `polarity` `grade` `gradeRange` `tags` `subTags` `family` `exclusive` `resistAttr` `duration` `stack` `dispel` `priority` `params` `snapshot` `mods` `triggers` `onApply` `onRemove` `tierTraits` `reactions` `persist` `bossProfile` `limits` `hidden` `ui` `vfx` `sfx` `text` `aiValue` `origin` `canonRef` |
| 持续类型 | `turns` `permanent` `charges` `battle` `world` `untilCured` `aura` `instant` |
| 叠加字段 | `rule` `key` `max` `add` `durationOnStack` `expire` `snapshotMerge` `onMax` |
| 事件钩子（59 个） | `onBattleStart` `onBattleEnd` `onTurnStart` `onTurnEnd` `onExtraAction` `onMove` `onMoveEnd` `onTerrainEnter` `onTerrainStay` `onDisplaced` `onEnemyEnterAdjacent` `onTargeted` `onAllyTargeted` `onBeforeAttack` `onBeforeHit` `onDodge` `onMiss` `onParry` `onParried` `onBeforeCrit` `onCrit` `onCritted` `onAttacked` `onBeforeHurt` `onHit` `onHurt` `onShieldBroken` `onKill` `onDeath` `onAllyDeath` `onAllyHit` `onAllyHurt` `onAfterAttack` `onSkillCast` `onUltimate` `onHeal` `onHealed` `onMpSpent` `onMpDrained` `onRageFull` `onItemUse` `onHpBelow` `onApply` `onRefresh` `onStack` `onStackMax` `onRemove` `onExpire` `onDispelled` `onBuffApplied` `onBuffApply` `onImmuneBlocked` `onResisted` `onWorldTick` `onRest` `onAreaEnter` `onCalendar` `onTalk` `onBookSleep` |
| 效果原语 | `modStat` `modZone` `modJudge` `modCost` `modRange` `dealDamage` `heal` `healLostPct` `restoreMp` `burnMp` `drainHp` `drainMp` `modRage` `shield` `mpGuard` `applyBuff` `removeBuff` `dispel` `erodeGrade` `immune` `reveal` `invulnerable` `damageCap` `lockHp` `revive` `redirect` `reflect` `mirror` `guard` `negateAttack` `extraAction` `ctShift` `skipAction` `disableAction` `disableSkillType` `forceTarget` `aiOverride` `triggerMove` `displace` `stealth` `summon` `weaponBreak` `setFlag` `clearFlag` `setPhase` `convertDamage` `modTerrain` `log` `vfx` `sfx` |
| Z0 旗标 / 判定乘数 | `mustHit` `mustCrit` `skipParry` `noCrit` `ignoreDef` `asBack` `asHigh` / `targetParryMult` |
| `aiOverride` 模式 | `charm` `control` `fear` `confuse` `berserk` `obey` |
| `drainMp` 模式 | `absorb`（北冥·纳）`seize`（吸星·夺）`dissolve`（化功·化） |
| 表达式符号 | `g` `G` `tier` `g0` `Lb` `Ls` `n` `stacks` `maxStacks` `turnsLeft` `charges` `pen` `p.*` `holder.*` `src.*` `srcLive.*` `ctx.*` `world.*`；函数 `has` `stacksOf` `count` `dist` `mainCat` `poMatch` `isBoss` `sameSide` `rho` |

### 14.3 标签（主标签提案 + 子标签）

| 类别 | ID |
|---|---|
| 提案新主标签（§15 P1） | `bind` 受制、`veil` 隐匿、`boost` 强化、`weaken` 削弱 |
| 子标签 | `poison.{common,severe,snake,numb,gas,huagong,qixin,qinghua}`；`gu.{jincan,bican,sanshi,wuxian}`；`seal.{point,mp,qg,meridian,ult}`；`injury.{internal,bone,qi,blood}`；`cold.{chill,freeze,poison}`；`heat.burn`；`cc.{stun,root,knock,pull,freeze,sleep,slow,paralyze,stagger,delay,bind}`；`guard.{shield,reflect,invuln,lock,cap,redirect,mirror,immune,revive}`；`mind.{charm,control,taunt,fear,confuse,awe}`；`weaponBreak.{sword,blade,spear,staff,whip,exotic,hidden,unarmed,inner,disarm,broken,exposed}`；`stance.{def,atk,charge,mobile,still,wild}`；`bind.{baotai,shengsi,sanshi,gu}`；`veil.{stealth,afterimage,disguise,feign}`；`boost.<stat>` `boost.{regen,tempo,berserk,drain,res,dmg,dmgDown}`；`weaken.<stat>` `weaken.{mark,sight,res}` |

### 14.4 Buff ID（208 个，§8–§9）

| 分组 | ID |
|---|---|
| 8.1 数值·增益（41） | `bf_waigong_sheng` `bf_neijin_sheng` `bf_quanli` `bf_waifang_sheng` `bf_neifang_sheng` `bf_jiangu` `bf_ningshen` `bf_piaohu` `bf_yuanzhuan` `bf_dongxi` `bf_huixin` `bf_shichen` `bf_renjin` `bf_jisu` `bf_jixing` `bf_tengyue` `bf_shenqing` `bf_jingzhun` `bf_shouyi` `bf_bidu` `bf_bigu` `bf_huxue` `bf_guben` `bf_yuhan` `bf_bihuo` `bf_dingxin` `bf_wenzhong` `bf_miaoshou` `bf_huoluo` `bf_ruiyi` `bf_xieli` `bf_toujin` `bf_sici` `bf_lianhuan` `bf_renxue` `bf_juqi` `bf_jienei` `bf_tiebi` `bf_longxiang` `bf_zhanyi` `bf_anran` |
| 8.2 数值·减益（22） | `bf_waigong_jiang` `bf_neijin_jiang` `bf_pojia` `bf_sangong` `bf_muxuan` `bf_chizhi` `bf_polu` `bf_qinei` `bf_luqie` `bf_panshan` `bf_dongyao` `bf_kangxing_jiang` `bf_nanyu` `bf_yishang` `bf_xuruo` `bf_xieqi` `bf_haonei` `bf_shimang` `bf_poyin` `bf_suoding` `bf_zhongchuang` `bf_gushang` |
| 8.3 恢复与吸取（12） | `bf_huichun` `bf_xuming` `bf_huinei` `bf_yangshi` `bf_tiaoxi` `bf_qingxin` `bf_shixue` `bf_beiming` `bf_xixing` `bf_huagong` `bf_huagong_qin` `bf_yizhongzhenqi` |
| 8.4 攻防反制（11） | `bf_fanzhen` `bf_weici` `bf_houfa` `bf_lianzhao` `bf_hutizhenqi` `bf_yiqiyushang` `bf_zhuiji` `bf_jieji` `bf_xianji` `bf_zhenqiwaifang` `bf_zhuanjin` |
| 8.5 持续伤害与毒（14） | `bf_zhongdu` `bf_judu` `bf_shedu` `bf_huagu` `bf_liuxue` `bf_zhuoshao` `bf_hanqi` `bf_handu` `bf_neishang` `bf_qinghuadu` `bf_beisu` `bf_shixiang` `bf_qixin` `bf_ningxue` |
| 8.6 破兵（14） | `bf_pojian` `bf_podao` `bf_poqiang` `bf_pogun` `bf_pobian` `bf_posuo` `bf_pozhang` `bf_poanqi` `bf_poqi` `bf_duguyi` `bf_pozhao` `bf_jiaoxie` `bf_duanbing` `bf_wupozhan` |
| 8.7 控制（23） | `bf_dingshen` `bf_xuanyun` `bf_jitui` `bf_fengxue` `bf_fengnei` `bf_fengqinggong` `bf_fengjingmai` `bf_miyun` `bf_mabi` `bf_mihuo` `bf_yihun` `bf_chaofeng` `bf_kongju` `bf_luanxin` `bf_zhenshe` `bf_bingdong` `bf_jiansu` `bf_lvshuang` `bf_hunshui` `bf_chanrao` `bf_shiheng` `bf_qianyin` `bf_chihuan` |
| 8.8 架势（6） | `bf_shoushi` `bf_gongshi` `bf_xushi` `bf_youshi` `bf_jingshi` `bf_kuangshi` |
| 8.9 机制（43） | `bf_mian_du` `bf_mian_gu` `bf_mian_kong` `bf_mian_xin` `bf_mian_xue` `bf_mian_shang` `bf_mian_han` `bf_mian_re` `bf_mian_liuxue` `bf_mian_pobing` `bf_mian_jianyi` `bf_wudi`（基准已有） `bf_suoxue` `bf_fuhuo` `bf_nuoyi` `bf_douzhuan` `bf_bizhong` `bf_bibao` `bf_wushi_zhaojia` `bf_wushi_fangyu` `bf_zaidong` `bf_yinshen` `bf_canying` `bf_yuanhu` `bf_nixing` `bf_neixiwenluan` `bf_jingmainixing` `bf_zouhuorumo` `bf_yirong` `bf_zhasi` `bf_kuangbao` `bf_shouzhi` `bf_shengsifu` `bf_jingang` `bf_zhaomen` `bf_daoqiang` `bf_dunzou` `bf_tingfeng` `bf_jianyi` `bf_shouling` `bf_shuling_huyou` `bf_xielian` `bf_duanchen` |
| 8.10 杂项（4） | `bf_zuiyi` `bf_pibei` `bf_shouhan` `bf_yangsheng` |
| 8.11 武学专属（8） | `bf_xuli` `bf_qianlong` `bf_liuli` `bf_longyin` `bf_weituo` `bf_jianshi` `bf_shouque` `bf_qishang` |
| 9.5 蛊（10） | `bf_gu_jincan` `bf_gu_bican` `bf_gu_sanshi` `bf_gu_shixin` `bf_gu_qingsi` `bf_gu_shigu` `bf_gu_mixin` `bf_gu_xue` `bf_gu_wang` `bf_gu_cuidong` |

> `bf_zhongdu`、`bf_wudi` 为基准 §12 的示例 ID，本文沿用；其余 206 个为本文新增（其中 38 个由 05 以"建议 ID"先行引用，本文按 05 的数值定义）。

### 14.5 引用的物品/任务建议 ID（定义归 10/12/chapters）

`it_sanshi_jieyao`（三尸脑神丹年度解药）、`q_05_side_sanshi`（三尸脑神丹根治任务，原创扩展）。其余解药与丹药（辟毒丹、解毒丹、九花玉露丸、大还丹、黑玉断续膏、天香断续胶、绝情丹、断肠草、玉蜂浆、悲酥清风解药、十香软筋散解药、金蚕解药、醒酒汤、定神丹、暖阳丹、护心丹、九转还魂丹、火浣衣、冰蚕衣、夜行衣）只列名称，ID 与品阶由 10 统一分配。

---

## 15. 待决事项 / 依赖

### 15.1 对基准（00-canon）的修改提案

| # | 提案 | 理由 | 影响 |
|---|---|---|---|
| P1 | §10 标签表增补 4 个主标签：`bind` 受制、`veil` 隐匿、`boost` 强化、`weaken` 削弱；并写明"子标签用点号，免疫/驱散可精确到子标签" | 生死符/豹胎易筋丸/三尸脑神丹需要独立于毒与蛊的驱散归类；隐身/残影/易容需要可被"破隐"整类处理；纯数值增减益需要可被 `purge`/驱散按类选择。现有 12 个主标签无法无歧义地承载这些 | 03（抗性不变）、05（`cleanse.tags` 可用新标签）、09（AI 估值） |
| P2 | §10"持续"增补类型：`battle`（本场战斗）、`world`（世界时间·时辰）、`untilCured`（直到解除）、`aura`（光环）、`instant`（瞬时） | 跨战斗的中毒/内伤/中蛊（用户需求）与地形光环、击退类瞬时效果无法用"行动次数 / 永久 / 触发次数"三种表达 | 11（时辰）、08（地形光环） |
| P3 | §9 在 Z0 说明中注明"判定旗标 `mustHit` `mustCrit` `skipParry` `noCrit` `ignoreDef` `asBack` 与判定乘数（如 `targetParryMult`）在 Z0 生效" | 必中、必暴、无视招架、破 X 的招架乘数均需要一个明确的挂载点，避免 04 与 06 各写一套 | 04 |
| P4 | §10"品阶对抗"一句后补："公式：ρ(Δ) = min(0.90, 0.15 + 0.15Δ)（Δ ≥ 1）" | 03、05、02 已开始引用该式，写进基准可防止漂移 | 全体 |

### 15.2 依赖他文档的事项

| # | 对象 | 事项 | 本文当前做法 |
|---|---|---|---|
| D1 | 04 伤害公式 | ① 实现 Z0 旗标与 `targetParryMult`；② 效果命中公式采纳 `resEff`（03 §6.3 的建议式）；③ 提供 Z8 境界差函数供 DOT 管线调用；④ 确认 DOT"通用减伤只吃一半"（§5.3.2）；⑤ 治疗公式与 `healPower` 快照 | 按本文 §4.7、§5.3.2 的建议值实现 |
| D2 | 03 属性 | 03 §5.6"客栈休息移除品阶 ≤ 3 的 injury/poison""战后移除所有持续回合类减益"与本文 §5.4.2 的逐条规则不一致；建议 03 §5.6 的"减益"列改为"见 06 §5.4.2"，且"持续回合类"明确为"非 `persist` 实例" | 本文以 §5.4.2 为准 |
| D3 | 05 武学 | ① 破 X：Z5 数值与招架乘数以 05 §9.4 为准，本文大阶质变（地：不能暴击；天：破招、无视招架）为追加规则，请 05 确认不冲突；② `bf_pozhao` 语义由本文定义（不能招架、反击归零、不能蓄招）；③ 05 §4.11 招式效果钩子（`rageDrain`、`ignoreDef` 等）建议由 tech/05 以本文原语实现（`modRage`、`modJudge`/`Z2`）；④ 左右互搏由 05 行动"分心二用"实现，不经 `bf_zaidong` | 已按 05 数值录入 38 个 05 引用 ID |
| D4 | 02 时间线 | ① 书眠净化规则（§12.7）请在书眠流程中确认；② 02 §E1 称外来九阳"对毒/内伤完全免疫"，而 05 九阳只给 `bf_mian_han`（免疫寒）与"中毒持续 ×0.5"，请 02/05 统一口径 | 本文按 05 |
| D5 | 09 战斗 | 行动"运功逼毒/运功护体/运功化解/拾回兵器/挣脱"本体；`aiOverride` 各模式行为；Boss 阶段脚本（无敌/锁血/狂暴时机）；"连动"；合击挂载锁定/追击 | 本文只定义 Buff 侧语义 |
| D6 | 10 物品 | §14.5 列出的解药、丹药、宝衣的 ID 与品阶；断兵的修复费用；神兵的 `bf_mian_pobing` 品阶 | 名称占位 |
| D7 | 11 开放世界 | 时辰单位与日历（端午等节令）、休息/运功疗伤/闭关的时间成本、战斗消耗的世界时间、寒区判定 | 按"1 日 = 12 时辰"建议 |
| D8 | 12 NPC/任务 | 名医 NPC 的技艺值；解蛊/解受制/根治三尸脑神丹的任务链；`onTalk` 的强制选项表现 | 引用占位 |
| D9 | 13 成长/结局 | ① 天书之力 Buff 品阶固定 12 且不受外来压制（建议）；② `bf_shuling_huyou` 在各难度模式的启用；③ 终局"天书守卷人"的豁免表（§11.4 最右列） | 建议值 |
| D10 | 14 UI | 图标尺寸、色弱模式、详情卡布局的最终规范 | §10 给出语义 |
| D11 | tech/05、tech/06 | DSL 解释器、表达式编译、倒排索引与性能预算（§12）；Buff 图标母题与纹样素材规格（§10.1） | — |
| D12 | chapters/* | 各书界的蛊/受制钩子（§9.7）与洪安通等 Boss 的 `bossProfile` | 只给示意 |

### 15.3 本文建议值登记（下游定稿后以下游为准）

| 值 | 建议 | 位置 |
|---|---|---|
| 地形/光环 Buff 缺省品阶 | `clamp(1, 12, ⌈Ld/6⌉)` | §3.1 |
| 天书之力 Buff 品阶 | 12，不受压制，不可暂停 | §3.1、§5.5 |
| DOT / HOT 每回合合计上限 | 12% / 8% `hpMax` | §5.3.2、§11.1 |
| Boss / 精英 / 终局 比例伤害系数 | 0.25 / 0.50 / 0.15 | §11.4 |
| 冲穴概率 | `25% + 15%×Δg + 0.3%×(con−50)` | §7.1 |
| `medGrade` | `1 + ⌊v/9⌋` | §7.1 |
| 神龙教解药周期 | 365 日 | §8.9 `bf_shouzhi` |
| 生死符战斗外发作周期 | 30 日 | §8.9 `bf_shengsifu` |
| 医术压制蛊的时长 | `3 × (medGrade − 蛊品阶 + 3)` 日 | §9.2 |
| 数量上限 | 增益 10 / 减益 10 / 机制 4 | §11.2 |

### 15.4 考据清单（标注"待考"的原著事实，须以三联/广州修订版核对）

| # | 事项 | 所在条目 |
|---|---|---|
| K1 | 独孤九剑九式所破兵刃的原文列举与回目（笑傲"传剑"一回） | §8.6.1、示例 B |
| K2 | 石灰粉为韦小宝惯用手段的具体情节 | `bf_shimang` |
| K3 | 悲酥清风"泪下如雨、四肢酸软"的原文与解药形态 | `bf_beisu` |
| K4 | 化骨绵掌的中掌症状 | `bf_huagu` |
| K5 | 凝血神爪的效果描写 | `bf_ningxue` |
| K6 | "金蚕蛊毒""碧蚕毒蛊"的出处书目与描写 | `bf_gu_jincan`、`bf_gu_bican` |
| K7 | 三尸脑神丹的服解药节令（端午） | `bf_gu_sanshi` |
| K8 | 生死符的发作周期与童姥赐药方式 | `bf_shengsifu` |
| K9 | 欧阳锋/杨过逆转经脉使点穴难以奏效的情节 | `bf_mian_xue` |
| K10 | 神照经"死而复生"之说 | `bf_suoxue` |
| K11 | 豹胎易筋丸逾期异变的具体人物 | `bf_shouzhi` |
| K12 | "破箭式须先练听风辨器"是否为原著说法 | `bf_tingfeng`、`bf_poanqi` |
| K13 | 少室山左冷禅以寒冰真气反制任我行吸星大法的细节 | `rx_hanbingxixing` |
| K14 | 杨过以断肠草解情花毒的"以毒攻毒"原文 | `rx_yiduigongdu` |
| K15 | 田归农淬毒于苗人凤剑上致胡一刀身亡的细节 | `bf_judu` |
| K16 | 玉蜂浆的功效（解玉蜂针毒 / 补益） | `bf_huinei` |
| K17 | 俞岱岩为大力金刚指所伤的细节 | `bf_gushang` |
