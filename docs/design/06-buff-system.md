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
| §8 | **Buff 目录**（数值类、效果类、破兵系列、控制、架势、机制类，共 178 条） | 配表、策划 |
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

混合效果（如走火入魔：攻击提升但持续掉血、敌我不分）按**净效果**判定极性，走火入魔为 `debuff`。极性决定 UI 边框形状（§10.2）与驱散归属，不决定数值正负。

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
| `gradeRange` | [int, int] | ✅ | 允许的品阶区间；施加品阶越界时钳制并告警（校验，§13） | `[1, 10]` |
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
| 层与叠层 | `Lb`（=`snap.Lb`）、`stacks`、`maxStacks`、`turnsLeft`、`charges`、`pen` | |
| 参数 | `p.<name>` | 本定义 `params` 的值（先求值） |
| 持有者 | `holder.<attr>`、`holder.hpPct`、`holder.lostHp`、`holder.isBoss`、`holder.isElite` | 实时值；属性 ID 同基准 §6 |
| 施加者 | `src.<attr>`（快照）、`srcLive.<attr>`（实时，施加者已死亡时为 0） | 默认用快照 |
| 事件上下文 | `ctx.damage`、`ctx.hpDamage`（实际扣血）、`ctx.shieldDamage`、`ctx.move.{id,cat,subType,grade,delivery,wIn,wOut,ultimate,range}`、`ctx.dist`、`ctx.direction`（`front`/`side`/`back`）、`ctx.isCrit`、`ctx.attacker`、`ctx.defender`、`ctx.buff`、`ctx.tile.{terrain,h}`、`ctx.steps` | 可用字段由钩子决定（§6.1 表"上下文"列） |
| 世界 | `world.shichen`、`world.day`、`world.festival`、`world.weather`、`world.region`、`world.chapterTier` | 只在战斗外钩子与 `when` 中可用 |
| 函数 | `min` `max` `clamp` `floor` `ceil` `round` `abs` `has(u, tagOrId)` `stacksOf(u, id)` `count(selector)` `dist(a, b)` `stanceCat(u)` `isBoss(u)` `sameSide(a, b)` `rho(delta)` | `rho` 即 §3.5 的 ρ(Δ) |

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
  stack: { rule: highest, key: def }
  dispel: { dispellable: false }           # 被动不可驱散；临时版 types: [purge]
  priority: 150
  params:
    cat: sword                             # 基准 §7 兵器类别
    dmgUp: "0.04 * G"                      # Z5 相性
    parryUpPct: "0.04 * G"                 # 对 X 类招式时招架评级 +%
    negateChance: "tier == tian ? 0.10 + 0.05 * (g - 10) : 0"
  mods:
    - { op: modZone, zone: Z5, value: "p.dmgUp", when: "stanceCat(ctx.defender) == p.cat" }
    - { op: modStat, stat: parry, kind: pct, value: "p.parryUpPct", when: "ctx.move.cat == p.cat" }
  tierTraits:
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
        - { op: modJudge, key: skipParry, value: true, when: "stanceCat(ctx.defender) == p.cat" }   # 主动攻击 X 类目标时无视其招架
      triggers:
        - on: onBeforeHit                   # 命中判定后、招架判定前（§5.3 P3）
          when: "ctx.move.cat == p.cat && (!ctx.move.ultimate || ctx.move.grade <= g)"   # 高品阶绝招不可被破
          chance: "p.negateChance"
          limitPerTurn: 1
          ops:
            - { op: negateAttack, as: parried }                 # 视为招架成功且伤害为 0
            - { op: applyBuff, id: bf_bingpo, target: attacker, grade: g, duration: 2, params: { cat: sword } }
            - { op: applyBuff, id: bf_shiheng, target: attacker, grade: g, duration: 1 }
  ui: { icon: buff/pojian, frame: auto, sortGroup: passive }
  text:
    short: "克制剑法"
    desc: "对用剑者伤害 +{p.dmgUp:%}（相性）；招架剑招时招架 +{p.parryUpPct:%}。{if tier>=di}剑招对你不能暴击；招架剑招后 50% 反击。{/if}{if tier==tian}受剑招攻击时 {p.negateChance:%} 破其招式（无伤并令其兵破、失衡）；攻击用剑者时无视其招架。{/if}"
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

> 示例中的 `bf_bingpo`（兵破）、`bf_shiheng`（失衡）见 §8.6、§8.7；`stanceCat()` 的定义见 §8.6.1；`rho()` 见 §3.5。

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
| 4%×G | 4.0 | 4.4 | 4.8 | 5.6 | 6.2 | 6.8 | 8.0 | 8.8 | 9.6 | 11.2 | 12.4 | 14.0 | 判定评级增益、Z5 破 X |
| 5%×G | 5.0 | 5.5 | 6.0 | 7.0 | 7.8 | 8.5 | 10.0 | 11.0 | 12.0 | 14.0 | 15.5 | 17.5 | Z3/Z4、攻击减益、抗性 pp |
| 6%×G | 6.0 | 6.6 | 7.2 | 8.4 | 9.3 | 10.2 | 12.0 | 13.2 | 14.4 | 16.8 | 18.6 | 21.0 | 攻击增益 |
| 8%×G | 8.0 | 8.8 | 9.6 | 11.2 | 12.4 | 13.6 | 16.0 | 17.6 | 19.2 | 22.4 | 24.8 | 28.0 | 防御增益、受疗 pp |
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

**例 1（用户示例）："玄上免疫中毒"面对"地中剧毒"**

| 步骤 | 计算 | 结果 |
|---|---|---|
| 施加 | 百毒不侵 `g=6`（玄上）；剧毒 `bf_judu` `g=8`（地中）；Δ = 2 | ρ = 0.45 |
| 剧毒数值 | 2%×G(8) = 4.4% `hpMax`/回合 → × 0.45 | **1.98% `hpMax`/回合**（Lv35 主角 hpMax≈5,000 → 99 点/回合，原本 220） |
| 附带受疗 −20%（地阶 −30%） | −30% × 0.45 | **受疗 −13.5%** |
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

`resEff` 替代 `res` 进入 04 的效果命中公式与 DOT 减免（§5.3.2）。【若 03 §6 另行定义 `resGrade`，以 03 为准；本式为建议值】

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

获得免疫实例（主动或被动）的瞬间，对持有者身上所有被其标签覆盖的减益执行一次"免疫净化"：`E.g ≤ I.g` 者移除；更高者 `pen = ρ(Δ)`。蛊与受制类（`untilCured`）例外：只**压制发作**（§9.3），不移除。

---

## 4. 叠加与冲突

### 4.1 四种叠加规则的精确语义（基准 §10）

施加流程先走免疫（§3.5.1）→ 效果命中/抵抗（04，含 §3.5.2）→ Boss 规则（§11.4），**通过后**才进入叠加判定。设新施加为 `N`（品阶 `gN`、层数 `nN`、持续 `dN`），已存在同叠加键实例为 `E`：

| 规则 | 无 `E` | 有 `E` 时的精确行为 | 典型 |
|---|---|---|---|
| `refresh` 刷新 | 新建 | ① `E.turnsLeft = max(E.turnsLeft, dN)`；② 若 `gN > E.g`：`E.g = gN`、`E.source = N.source`、`E.snap = N.snap`（数值随之升级）；③ 若 `gN ≤ E.g`：只做 ① ；④ 不新增实例、不触发 `onApply`，触发 `onRefresh` | 大多数数值类、控制类 |
| `stack` 叠层 | 新建（层数 `nN`） | ① `E.stacks = min(max, E.stacks + nN)`；② 持续按 `durationOnStack`（默认 `max`）；③ `E.g = max(E.g, gN)`（**整池升品**）；④ 快照按 `snapshotMerge`（默认取两者中数值较大者）；⑤ 若本次达到 `max` 触发 `onMax`/`onStackMax` | 中毒、流血、寒气、内伤、龙象之力 |
| `independent` 独立 | 新建 | 总是新建实例，各自计时、各自结算；同定义实例数 > `max` 时移除**剩余回合最少**者（相同则 `iid` 最小者） | 护体真气（各自到期）、生死符（每符一实例） |
| `highest` 取高 | 新建 | 各来源实例并存（`key` 强制按 `defSource`），但**只有一个激活**：按 数值 → 品阶 → 剩余回合 → `iid` 降序 取第一；其余 `dormant = true`，计时照走、不结算；激活者消失后下一名立即接替 | 剧毒、灼烧、光环、各"破 X" |

伪代码（tech/05 以此为准）：

```ts
function apply(def: BuffDef, n: ApplyReq, holder: Unit): ApplyResult {
  const pen = immunityCheck(def, n.g, holder);          // §3.5.1：0 = 阻挡；(0,1) = 部分；1 = 无免疫
  if (pen === 0) return log('IMMUNE');
  if (!effectHitRoll(def, n, holder)) return log('RESIST');   // 04，含 resEff
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
| `defParam` | `defId + 关键参数` | 同定义不同参数视为不同 Buff | 抗性削弱（按标签）、封经脉（封拳脚 / 封兵器）、兵破（按兵器类别） |

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
| `attr:<id> pp` | 属性层百分点（PCT 形态） | 直接加减 | `attr:resPoison pp +5×G` |
| `attr:<id> mult` | 属性层最终乘数（仅 MAG，极少用） | 连乘 | 走火入魔 `attr:atkOut mult ×1.15` |
| `Z0:<flag>` | 判定层开关 | `mustHit` / `mustCrit` / `skipParry` / `noCrit` | 必中、必暴、无视招架 |
| `Z2` | 防御减免层 | 防御穿透比例，加法合并 | 透劲 `Z2 +5%×G` |
| `Z3` | 增伤（攻方） | 加法合并；减益为负值（虚弱） | 锐意 `Z3 +5%×G` |
| `Z4` | 减伤（守方） | 加法合并，上限 75%（基准 §9）；易伤为负值 | 卸力 `Z4 +5%×G` |
| `Z5:<cat>` | 相性（兵器克制"破 X"） | 只对 X 类目标 | 破剑 `Z5:sword +4%×G` |
| `Z6` | 暴击倍率 | 以 `attr:critDmg pp` 实现（03 中 critDmg 为 PCT） | 势沉 `attr:critDmg pp +10×G` |
| `Z7` | 方位与地形 | 视为背击 / 视为高处 | 隐身解除一击"视为背击" |
| `Z9` | 招架减免 | 招架成功时的减免比例 pp | 圆转 `Z9 +2×G pp` |
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
| 额外行动 | "再动"获得的额外行动**不执行** S 段与 E2 递减（§8.9 `bf_zaidong`）；防止左右互搏把持续减半。 |
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
| P7 | `onHit`（攻方）/ `onHurt`（守方）/ `onCrit` / `onKill` | 吸血、吸内、反震、猬刺、附加 Buff 施加（招式 `buffs`）、战意、北冥受击吸内 | settle |
| P8 | `onAfterAttack` | 连招、追击、反击（`counter`，流程归 09）排入**反应队列** | — |

#### 5.3.1 反应队列与防循环

- P8 产生的追加攻击进入 FIFO 反应队列，当前攻击完全结算后依次执行；**队列深度 ≤ 3**（反击的反击的反击到此为止）。
- 由 `reflect`（反震）、`redirect`（挪移/援护）、`mirror`（斗转）、`counter`（反击）产生的伤害分别带旗标 `reflected` / `redirected` / `mirrored` / `countered`：**带旗标的伤害不能再被同类原语处理**（反震伤害不会被反震，挪移过来的伤害不会被再挪移，斗转回去的招式不会被斗转回来）。
- 同一实例的同一触发器在同一事件中至多执行 1 次；`limitPerTurn` 以持有者回合为周期重置。

#### 5.3.2 DOT 与 HOT 的结算管线

DOT 不走完整的 Z0–Z10（不判定命中、不暴击、不浮动），只经过以下项：

```
raw      = 条目公式（多为 holder.hpMax × 比例 × stacks × Lb）
resPart  = 1 − clamp(resEff(tag), −0.50, 0.75)                      // §3.5.2；负抗性使 DOT 增加
z4Part   = 1 − min(0.75, 0.5 × Z4通用 + Z4持续)                       // 通用减伤只吃一半；"持续伤害减免"类全额
DOT      = ⌊ raw × pen × resPart × z4Part × Z8(snap.level, holder.Ld) × bossF ⌋
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
| 寒毒 `bf_handu` | 全部 | 夜间/雪原 −1%×G 气血；阳性内功主运时不掉血 | 无 | 无效 | 仅阳性内功：压制 12 时辰 | 压制 24 时辰 | 暖阳丹（压制） | 九阳神功（天上）根治 |
| 化骨 `bf_huagu` | 全部 | 外功防御 −3%×G/层（持续） | 无 | −1 层 | 无效 | 地阶以上医者 −2 层 | 黑玉断续膏 | — |
| 异种真气 `bf_yizhong` | 全部 | 不能闭关修炼内功；每日 10% 真气逆行（战斗外为"晕眩 2 时辰"） | 无 | 无 | 易筋经：−3 层/次 | 无效 | 无 | 易筋经、少林方丈任务 |
| 走火入魔（经脉紊乱） | 全部 | 不能修炼；内力上限 −10% | 3 日后消退 | 缩短 1 日 | 无效 | 地阶以上医者清除 | 定神丹（原创扩展） | 易筋经 |
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
| `onExtraAction` | E5 额外行动开始 | 持有者 | `prevCat` | 可限制可用武学大类 | 左右互搏"须换一类武学" |
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
| `onParry` / `onParried` | 招架成功 | 守方 / 攻方 | `move` | — | 破 X 反击、铁臂、兵破 |
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
| `modStat` | `stat` `kind`(`flat`/`flatLv`/`pct`/`mult`/`pp`) `value` `when` | 修饰属性，进入 03 §11 汇总 | 属性层 | `kind` 必须符合 03 §0.2 的形态约束 | 各数值类 |
| `modZone` | `zone`(Z2/Z3/Z4/Z5/Z7/Z9) `value` `filter`(`cat` `delivery` `element` `dmgType`) | 修饰乘区加法项 | 对应乘区 | Z4 合计 ≤ 75% | 锐意、卸力、破 X、刀枪不入 |
| `modJudge` | `key`(`mustHit` `mustCrit` `skipParry` `noCrit` `ignoreDef` `asBack` `asHigh`) `value` `when` | 判定层开关 | Z0 / Z2 / Z7 | 多来源 OR 合并 | 必中、无视招架 |
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
| 易筋经 `sk_yijinjing` | `injury.qi`（异种真气、走火入魔）、`mind` | 运功疗伤时额外处理 1 个上述效果；异种真气 −3 层/次 | 笑傲·方证欲以易筋经为令狐冲化解异种真气 |
| 一阳指 `sk_yiyangzhi` | `injury`、`seal` | 解穴与疗伤；以一阳指疗伤时施术者获得虚弱（Z3 −5%×G）3 回合并损内力 30% | 射雕·一灯大师以一阳指救黄蓉，功力大损 |
| 九阴真经·疗伤篇（`sk_jiuyin` 附属被动） | `injury` | 战斗外：两人同在 6 时辰，清除一方全部内伤 | 射雕·郭靖黄蓉牛家村密室疗伤七日七夜 |
| 天山六阳掌 `sk_liuyangzhang` | `bind.shengsi` | 唯一可拔除生死符的武学（品阶 ≥ 符品阶） | 天龙·虚竹以天山六阳掌为群豪拔除生死符 |
| 清心普善咒（杂学·音律，地中，原创扩展定级） | `mind` | 音律招式：半径 3 内友方每回合 `medicine` 等效驱散 1 个 `mind` 效果 | 笑傲·任盈盈抚琴为令狐冲调理内息 |
| 北冥神功 `sk_beiming` | `injury.qi` | 北冥主运时异种真气不会产生（吸来的内力皆为己用） | 天龙·北冥神功与吸星大法之别（原创扩展数值化） |

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
| `seal` | 穴 | `seal.point` 点穴、`seal.mp` 封内力、`seal.qg` 封轻功、`seal.meridian` 封经脉 | `resSeal` | 穴/医/武 |
| `injury` | 内伤 | `injury.internal` 内伤、`injury.bone` 骨伤/化骨、`injury.qi` 异种真气/走火、`injury.blood` 凝血 | `resInjury` | 运/医/药/武/休 |
| `bleed` | 流血 | `bleed` | `resInjury`（×0.5，建议） | 医/药/休 |
| `cold` | 寒 | `cold.chill` 寒气、`cold.freeze` 冰冻、`cold.poison` 寒毒 | `resCold` | 运/医/武；寒毒专 |
| `heat` | 热 | `heat.burn` 灼烧 | `resHeat` | 运/医/入水 |
| `cc` | 控制 | `cc.stun` 眩晕、`cc.root` 定身、`cc.knock` 击退、`cc.pull` 牵引、`cc.freeze` 冰冻、`cc.sleep` 昏睡、`cc.slow` 减速、`cc.paralyze` 麻痹、`cc.stagger` 失衡、`cc.delay` 迟缓、`cc.bind` 缠绕 | `resCC` | 医（软控）/ 时间 |
| `guard` | 护体（增益） | `guard.shield` `guard.reflect` `guard.invuln` `guard.lock` `guard.cap` `guard.redirect` `guard.mirror` `guard.immune` `guard.revive` | — | 破 |
| `mind` | 心神 | `mind.charm` 迷惑、`mind.control` 移魂、`mind.taunt` 嘲讽、`mind.fear` 恐惧、`mind.confuse` 乱心、`mind.awe` 震慑 | `resMind` | 医/武 |
| `weaponBreak` | 破兵 | 增益：`weaponBreak.<cat>`（破 X，cat ∈ 基准 §7 八类 + `inner`）；减益：`weaponBreak.disarm` 缴械、`weaponBreak.broken` 断兵、`weaponBreak.exposed` 兵破 | —（`effRes`） | 破（增益）/ 时间、修复（减益） |
| `stance` | 架势 | `stance.def` `stance.atk` `stance.charge` `stance.mobile` `stance.still` `stance.wild` | — | 破 |
| `bind` ★ | 受制 | `bind.baotai` 豹胎易筋丸、`bind.shengsi` 生死符、`bind.sanshi` 三尸脑神丹、`bind.gu` 蛊主之制 | —（`effRes`） | 专 |
| `veil` ★ | 隐匿 | `veil.stealth` 隐身、`veil.afterimage` 残影、`veil.disguise` 易容、`veil.feign` 诈死 | — | 破、识破 |
| `boost` ★ | 强化 | `boost.<stat>`、`boost.regen`、`boost.tempo`（再动）、`boost.berserk`（狂暴） | — | 破 |
| `weaken` ★ | 削弱 | `weaken.<stat>`、`weaken.mark`（锁定/易伤）、`weaken.sight`（失明） | —（`effRes`） | 运/医/药 |

> ★ = 本文提案的新主标签（基准 §10 未列，见 §15 P1）。在基准采纳前，数据层以子标签形式挂在 `guard`/`mind` 等之下不可行，故先在本文使用并登记。
