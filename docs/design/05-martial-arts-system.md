# 05 · 武学体系（Martial Arts System）

> 归属（基准 §18）：武功数据结构、层数、招式、范围模板、修炼、装配栏规则、武学图鉴。
> 上游：`00-canon.md`（唯一事实来源）。
> 引用而不重定义：属性公式 → `design/03-attributes.md`；伤害公式与乘区 → `design/04-damage-formula.md`；Buff 定义与目录 → `design/06-buff-system.md`；套装定义 → `design/07-set-system.md`；地形/轻功阈值 → `design/08-terrain-and-qinggong.md`；集气/合击/反击流程/AI → `design/09-combat-system.md`；物品/丹药/兵器属性 → `design/10-items-and-equipment.md`；门派/羁绊/师徒 → `design/12-quests-npc-factions.md`；角色经验与等级 → `design/13-progression-and-endings.md`；携带、外来压制、残篇 → `design/02-timeline-and-world-tiers.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**建议值** = 依赖他文档、先给出可用数值并在文末登记。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标与约束 | 全体 |
| §2 | 武功数据结构（字段表、枚举、完整 YAML、TS 类型、运行时状态、派生管线） | 程序、配表 |
| §3 | 层数：层数系数 L(n)、经验曲线、修为门槛、有效层数、每层解锁规范 | 数值、程序 |
| §4 | 招式：字段、招式预算公式、范围模板库（27 种）、位移、友伤、绝招、招式栏 | 数值、程序、战斗 |
| §5 | 内功：主运/辅运、内力性质、相性矩阵（Z5）、阴阳冲突、内功贡献接口 | 数值、程序 |
| §6 | 装配规则：栏位、兵器匹配、空手/持械、切换武器、套装计件 | 程序、战斗 |
| §7 | 学习：途径、门槛、秘籍、观摩偷学、残页、解谜、合击领悟、本土印证 | 策划、程序 |
| §8 | 修炼：实战经验分配、闭关、师父指点、丹药、顿悟 | 数值、程序 |
| §9 | 特殊武学规则：代价型、互斥与相克、组合武学、"破 X" | 策划、数值 |
| §10 | 走火入魔 | 策划、数值 |
| §11 | 武学图鉴 | 策划、UI |
| §12 | 融会贯通（原创扩展） | 策划、数值 |
| §13 | 完整示例武学（9 门） | 配表参照 |
| §14 | 数量与品阶分布规划（catalog 约束） | 图鉴撰写者 |
| §15 | 数据校验规则与测试用例 | 程序 |
| §16 | 本文新增术语与 ID | 全体 |
| §17 | 待决事项 / 依赖 | 全体 |

---

## 1. 设计目标与约束

### 1.1 目标

| # | 目标 | 落地手段 |
|---|---|---|
| G1 | **原著感**：降龙十八掌就该有十八掌，独孤九剑就该"破尽天下招式" | 原著招式名准确；标志性机制（破 X、合璧、左右互搏、先伤己）以规则实现而非只写描述 |
| G2 | **多周目的"带什么走"是核心抉择** | 层数跨书界保留；天道压制截断"发挥"而不抹除"修为"（真实层数 vs 有效层数） |
| G3 | **品阶有意义但不绝对** | 品阶系数 G（基准 §4）× 层数系数 L(n)：高品低层 ≈ 低品满层的交叉区；"人强则强"的黄阶特例 |
| G4 | **可配表** | 所有招式按统一"招式预算公式"配出倍率；所有曲线给公式与查表 |
| G5 | **手机端可操作** | 每门武学战斗中最多暴露 3–5 个招式（招式栏），"破招"类自动选式 |
| G6 | **确定性** | 所有随机走战斗种子 RNG（基准 §19）；概率公式明确、可复现 |

### 1.2 硬约束（来自基准，不得违反）

| 约束 | 基准位置 | 本文落实 |
|---|---|---|
| 品阶 1–12，G 值固定 | §4 | §3.1 直接使用 G |
| 层数 1–10；高武 10 / 中武 9 / 低武 8 重上限 | §1、§3 | §3.4 有效层数公式 |
| 外来压制 0 / −2 / −4 小品，下限黄下 | §3 | §2.6 有效品阶 `effGrade` |
| 核心武功仅内功/拳脚/兵器 | §3 规则 1 | §6、§7 |
| 装配栏 内3（主1辅2）/拳3/兵3/轻1/暗1/杂2 | §20 | §6.1 |
| 绝招消耗气势 100 | §1、§8 | §4.8 |
| "回合" = 持有者自身一次行动 | §8 | 冷却、持续均以此计 |
| Buff 品阶对抗、标签 | §10 | 武学施加的 Buff 品阶 = 来源武学有效品阶 |
| 乘区 Z0–Z10 名称与顺序 | §9 | 本文所有增伤标明乘区 |

---

## 2. 武功数据结构

### 2.1 顶层字段表（`SkillDef`）

| 字段 | 类型 | 必填 | 说明 / 取值 | 例 |
|---|---|---|---|---|
| `id` | string | ✅ | `sk_<拼音>`（基准 §12）；同名冲突加书界序号 | `sk_xianglong18` |
| `name` | string | ✅ | 中文名 | 降龙十八掌 |
| `alias` | string[] | | 别名、俗称（用于搜索与图鉴） | `[金刚龙爪手]` |
| `category` | enum | ✅ | 基准 §7 大类：`inner` `unarmed` `weapon` `movement` `hidden` `misc` | `unarmed` |
| `subType` | enum | ✅ | 基准 §7 子类（见 §2.2） | `fist` |
| `grade` | int 1–12 | ✅ | **绝对品阶**（不含天道压制）；10–12 必须出现在基准 §13 | `12` |
| `origin` | enum | ✅ | `canon` 原著 / `expanded` 原创扩展 / `canonExpanded` 原著有名、细节扩展 | `canon` |
| `sect` | string \| null | ✅ | `sect_<拼音>`；无门派的传承写 `null` 并填 `lineage` | `sect_gaibang` |
| `lineage` | string | | 传承说明（人物链） | 独孤求败 → 风清扬 |
| `sourceChapters` | chapterId[] | ✅ | **原生书界**（可在该书界被习得）；与基准 §13 一致 | `[ch01_tianlong, ch02_shediao, ch03_shendiao]` |
| `canonRef` | string | | 原著出处（书名/回目大意）；不确定写"（待考）" | 射雕第十二回（待考） |
| `nature` | enum | ✅ | `yang` 阳 / `yin` 阴 / `harmony` 调和 / `neutral` 中性；**内功不得为 `neutral`**（基准 §6 `mpNature` 只有三值） | `yang` |
| `wOut` / `wIn` | number | ✅ | 外/内比例，步长 0.05，`wOut + wIn = 1`；内功的运功招式默认 `0/1`；交 design/04 Z1 攻击合成 | `0.45 / 0.55` |
| `aptitude` | enum | 自动 | 由 `subType` 推导的资质 ID（§2.3），可覆写 | `apFist` |
| `reqs` | Reqs | ✅ | 学习门槛（§2.4、§7.3） | |
| `maxLayer` | int | | 默认 10；特殊武学可更低 | `10` |
| `layerStats` | map | | 装配时按层线性成长的数值（§3.6）：`{stat: [第1重值, 第10重值]}` | `{parry: [2, 10]}` |
| `inner` | InnerDef | 内功必填 | 内功专属：贡献预算、辅运模式、性质跟随等（§5） | |
| `layers` | LayerDef[] | ✅ | 1–10 重每重解锁（招式/被动/绝招/里程碑），见 §3.5 | |
| `moves` | MoveDef[] | ✅ | 招式列表（§4）；轻功/部分杂学可为空 | |
| `moveSlots` | int | 自动 | 战斗中可同时装配的普通招式数（§4.9），黄/玄 3、地 4、天 5 | `5` |
| `passives` | PassiveDef[] | | 被动（§2.5） | |
| `setTags` | setId[] | | 所属套装 ID（`set_<拼音>`）；套装本体归 design/07，构建时双向校验 | `[set_shaolin_jingang]` |
| `conflicts` | Conflict[] | | 互斥/相冲/相克/相生（§9.2） | |
| `weaponReq` | WeaponReq | 兵器必填 | 主武器类别与奇门细类（§6.2） | `{category: sword}` |
| `learnSources` | LearnSource[] | ✅ | 学习途径与每个途径的层数上限（§7） | |
| `special` | map | | 特殊规则开关（代价、誓约、合璧、互搏、融合禁止等，§9） | `{fusible: false}` |
| `observable` | bool | | 可否被观摩偷学；天阶默认 `false`，其余默认 `true` | `false` |
| `hiddenMoves` | moveId[] | | 只能经顿悟（§8.6）解锁的隐藏招式 | |
| `description` | string | ✅ | 图鉴文本（≤ 120 字），原创扩展部分须写明 | |
| `assets` | map | | 图鉴插画、图标、招式特效键（素材清单归 `tech/06`） | `{icon: skill/xianglong18}` |

### 2.2 子类枚举与兵器类别映射

| category | subType | 中文 | 所需主武器类别（§6.2） | 默认资质 |
|---|---|---|---|---|
| `inner` | `inner` | 心法 | — | `apInner` |
| `unarmed` | `fist` | 拳掌 | 空手/`unarmed`（持械降效，§6.3） | `apFist` |
| `unarmed` | `finger` | 指法 | 同上 | `apFinger` |
| `unarmed` | `leg` | 腿法 | 同上（持械不降效） | `apLeg` |
| `unarmed` | `grapple` | 擒拿/爪 | 同上 | `apGrapple` |
| `weapon` | `sword` | 剑 | `sword` | `apSword` |
| `weapon` | `blade` | 刀 | `blade` | `apBlade` |
| `weapon` | `staff` | 棍杖 | `staff` | `apStaff` |
| `weapon` | `spear` | 枪 | `spear` | `apSpear` |
| `weapon` | `whip` | 鞭索 | `whip` | `apWhip` |
| `weapon` | `exotic` | 奇门 | `exotic` + 细类 `kinds`（§6.2） | `apExotic` |
| `movement` | `movement` | 轻功 | — | `apLight` |
| `hidden` | `hidden` | 暗器 | 暗器弹药（design/10） | `apHidden` |
| `misc` | `medicine` `poison` `gu` `formation` `music` `art` `chess` `disguise` `beast` `sonic` `mind` | 杂学 | 视具体（琴/笛等乐器为 `exotic` 装备） | 见 §2.3 |

### 2.3 杂学 → 资质/技艺映射（建议，design/03 确认）

| misc 子类 | 修炼速度所用"资质"位 | 效果强度所用技艺 |
|---|---|---|
| `medicine` 医 | `wis` 折算（`wis` 当资质） | `med` |
| `poison` 毒 / `gu` 蛊 | 同上 | `poi` |
| `formation` 阵法 | 同上 | `formation` |
| `music` 音律 | 同上 | `music` |
| `art` 书画 / `chess` 棋 | 同上 | `art` / `chess` |
| `disguise` 易容 | 同上 | `art` |
| `beast` 驭兽 | 同上 | `cha` |
| `sonic` 音功 | `apInner` | `music`（辅） |
| `mind` 心神 | `wil` 当资质 | `wil` |

### 2.4 学习门槛 `Reqs`

| 字段 | 类型 | 说明 |
|---|---|---|
| `attrs` | `{attrId: min}` | 先天属性下限（`con` `str` `agi` `wis` `wil` `luk` `cha`） |
| `attrsMax` | `{attrId: max}` | 先天属性**上限**（少见：左右互搏要求 `wis ≤ 85`） |
| `aptitude` | `{apX: min}` | 资质下限 |
| `morality` | `{min?, max?}` | 品德区间（−100…+100） |
| `sect` | `{id, rank?}` | 门派身份与最低职级（职级表归 design/12） |
| `prereq` | `[{skill, layer}]` | 前置武功与层数 |
| `level` | int | 最低**显示等级** |
| `lore` | `{min?, max?}` | 武学常识区间（太玄经要求"不执着文字"用 `max`） |
| `vow` | vowId | 必须已立下的誓约（§9.1.4） |
| `hard` | string[] | 列出哪些条目是**硬门槛**；其余为**软门槛**（§7.3） |

默认硬/软规则：`sect`、`prereq`、`vow`、`morality`、`attrsMax`、`lore.max` 默认为硬门槛；`attrs`、`aptitude`、`level`、`lore.min` 默认为软门槛。

### 2.5 被动 `PassiveDef`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `ps_<武功拼音>_<拼音>`（本文新增前缀，§16） |
| `name` | string | 中文名 |
| `unlock` | int 1–10 | 解锁层数（按**有效层数**判定） |
| `kind` | enum | `stat` 数值 / `effect` 效果 / `mechanic` 机制 / `trigger` 触发（与 Buff 三大类对齐，`trigger` 为"条件满足时施加 Buff/招式"） |
| `zone` | Z0–Z10 / `settle` / `none` | 若影响伤害，必须标明乘区（基准 §9） |
| `value` | number \| [v@unlock, v@10] | 数值；数组表示随层线性插值 |
| `buff` | `{id, grade: 'inherit', dur, stacks}` | 施加的 Buff（Buff 定义归 design/06） |
| `trigger` | `{on, cond, chance, perRound}` | `on` ∈ `battleStart` `turnStart` `turnEnd` `onHit` `onHurt` `onKill` `onParry` `onCrit` `hpBelow` `backAttacked` `meleeAttacked` `allyAdjacent` `skillUsed` |
| `scope` | enum | `self` 本武学招式 / `all` 所有招式 / `category:<cat>` / `unit` 角色本身 |
| `auxMode` | enum | 仅内功：`scaled`（按辅运比例）/ `full`（辅运也 100%）/ `none`（辅运不生效）；默认 `stat`、`effect` → `scaled`，`mechanic`、`trigger` → `none` |
| `text` | string | 图鉴/界面说明（数值用 `{v}` 占位） |

### 2.6 运行时状态 `SkillState`（存档中每角色每武学一条）

| 字段 | 类型 | 说明 |
|---|---|---|
| `skillId` | string | |
| `layerReal` | int 1–10 | **真实层数**，只增不减（被融会贯通消耗除外） |
| `sxp` | int | 当前层内已积累武学经验 |
| `sourceCap` | int | 当前可达的最高层（取所有已获学习途径的最大 `maxLayer`，§7.1） |
| `learnedIn` | chapterId | 首次习得书界 |
| `foreign` | bool | 是否为外来武学（经书眠带入且未"本土印证"，§7.8） |
| `movesEquipped` | moveId[] | 招式栏中选择的招式（≤ `moveSlots`） |
| `insight` | int | 观摩领悟进度（未习得时使用，§7.4） |
| `pages` | int[] | 已收集残页序号（§7.5） |
| `flags` | string[] | `evil`（邪练）、`fused`（已融入）、`vowed` 等 |

**派生值（每次装配变化/书界切换/升级时重算，不存档）**：

```
effGrade  = foreign ? max(1, grade − suppression(worldTier)) : grade        // 基准 §3 规则 3
layerEff  = min(layerReal, tierCap(worldTier), gateCap(grade, displayLevel), special.layerCap ?? 10)
G         = G_TABLE[effGrade]                                                // 基准 §4
L         = 0.5 + 0.1 × layerEff                                            // §3.1
```

- `suppression`：HIGH 0 / MID 2 / LOW 4（基准 §3）；`tierCap`：10 / 9 / 8。
- `gateCap`：修为门槛允许的最高层（§3.3）。
- 解锁判定（招式、被动、绝招）一律使用 `layerEff`。真实层数高于有效层数时，超出部分的招式在 UI 上显示为"天道封印"（书灵解释），战斗中不可用。
- 武学施加的 Buff 品阶 = `effGrade`（基准 §10"通常继承来源武功品阶"）。
- **修炼消耗与修为门槛使用绝对 `grade`**（防止"在低武书界便宜地修高阶外来武学"）。

### 2.7 招式威力管线（交给 design/04 Z1）

```
招式威力 P = G(effGrade) × L(layerEff) × move.power × Mod_armed × Mod_special
```

| 项 | 来源 | 说明 |
|---|---|---|
| `G` | 基准 §4 | 太祖长拳等"人强则强"武学可用 `G_eff` 覆写（§13.5） |
| `L` | §3.1 | |
| `move.power` | §4.2 招式预算 | |
| `Mod_armed` | §6.3 | 持械使用拳脚的系数（0.8 / 0.9 / 1.0） |
| `Mod_special` | 个别武学 | 如独孤九剑"以物代剑" 0.9、玉女素心单人 0.5 |

`P` 之后与攻击合成（`wOut × atkOut + wIn × atkIn`）相乘构成 Z1 基础伤害——该合成公式归 design/04。

### 2.8 完整 YAML 示例（字段全集演示：铁砂掌，玄中）

> 铁砂掌为民间通行的外门硬功之名，本作将其编入少林外门（**原创扩展**）；它是用户示例套装"少林金刚（龙爪手＋易筋经＋铁砂掌＋铜人横练）"的玄阶成员。

```yaml
id: sk_tieshazhang
name: 铁砂掌
alias: [少林铁砂掌]
category: unarmed
subType: fist
grade: 5                      # 玄中
origin: expanded              # （原创扩展）归入少林外门
sect: sect_shaolin
lineage: 少林外门·罗汉堂
sourceChapters: [ch01_tianlong, ch04_yitian, ch05_xiaoao, ch08_luding]
canonRef: 原著未载（原创扩展）
nature: yang
wOut: 0.75
wIn: 0.25
aptitude: apFist
reqs:
  attrs: { str: 35, con: 30 }
  aptitude: { apFist: 25 }
  prereq: [ { skill: sk_luohanquan, layer: 4 } ]
  sect: { id: sect_shaolin, rank: 2 }        # 职级表见 design/12
  hard: [sect, prereq]
maxLayer: 10
layerStats:
  defOut: [1, 6]              # 装配时外功防御 +1% → +6%（按层线性）
layers:
  - { n: 1,  unlock: [mv_tieshazhang_kaibei, ps_tieshazhang_shazhang] }
  - { n: 2 }
  - { n: 3 }
  - { n: 4,  unlock: [mv_tieshazhang_tuishan], stage: 登堂入室 }
  - { n: 5,  unlock: [ps_tieshazhang_tiebi] }
  - { n: 6 }
  - { n: 7,  unlock: [mv_tieshazhang_lianhuan], stage: 炉火纯青 }
  - { n: 8 }
  - { n: 9 }
  - { n: 10, unlock: [mv_tieshazhang_jingang, ps_tieshazhang_dacheng], stage: 登峰造极 }
moveSlots: 3
moves:
  - id: mv_tieshazhang_kaibei
    name: 开碑手
    unlock: 1
    kind: attack
    target: enemy
    range: { min: 1, max: 1 }
    aoe: { tpl: aoe_single }
    delivery: melee
    mpCost: 0.07              # × MPREF(显示等级)，玄阶基准 6%
    cd: 0
    recovery: 1000
    power: 1.05
    hits: 1
    parryable: true
    friendlyFire: none
    buffs:
      - { id: bf_pojia, chance: 0.25, dur: 2, grade: inherit, to: target }   # 破甲（design/06）
    tags: [palm, hard]
    anim: { clip: palm_heavy, vfx: fx_sand_burst, sfx: sfx_palm_hard }
    ai: { weight: 1.0, prefer: finisher }
  - id: mv_tieshazhang_tuishan
    name: 推山掌
    unlock: 4
    kind: attack
    target: enemy
    range: { min: 1, max: 1 }
    aoe: { tpl: aoe_line, n: 2 }
    delivery: melee
    mpCost: 0.08
    cd: 2
    recovery: 1050
    power: 1.00
    parryable: true
    displacement: { type: knock, n: 1, collideDmg: 0.2 }
    friendlyFire: none
    tags: [palm]
  - id: mv_tieshazhang_lianhuan
    name: 砂掌连环
    unlock: 7
    kind: attack
    target: enemy
    range: { min: 1, max: 1 }
    aoe: { tpl: aoe_single }
    delivery: melee
    mpCost: 0.09
    cd: 2
    recovery: 1100
    power: 1.45
    hits: 3
    parryable: true
    friendlyFire: none
  - id: mv_tieshazhang_jingang
    name: 金刚掌印
    unlock: 10
    kind: attack
    ultimate: true
    rageCost: 100
    target: enemy
    range: { min: 1, max: 1 }
    aoe: { tpl: aoe_single }
    delivery: melee
    mpCost: 0.10
    cd: 0
    recovery: 1200
    power: 3.00
    parryable: true
    buffs:
      - { id: bf_neishang, chance: 0.6, dur: 3, grade: inherit, to: target }
    friendlyFire: none
passives:
  - id: ps_tieshazhang_shazhang
    name: 砂掌
    unlock: 1
    kind: stat
    zone: Z2
    value: [0.04, 0.12]       # 本武学招式无视目标外功防御 4% → 12%
    scope: self
    text: 本武学招式无视目标 {v} 外功防御。
  - id: ps_tieshazhang_tiebi
    name: 铁臂
    unlock: 5
    kind: trigger
    trigger: { on: onParry, chance: 1.0, perRound: 1 }
    buff: { id: bf_tiebi, grade: inherit, dur: 1 }   # 下一次拳掌招式 +15% 伤害（Z3）
    scope: unit
  - id: ps_tieshazhang_dacheng
    name: 铁砂大成
    unlock: 10
    kind: stat
    zone: Z3
    value: 0.10
    scope: category:unarmed
    text: 所有拳脚招式伤害 +10%。
setTags: [set_shaolin_jingang]
conflicts:
  - { with: sk_mianzhang, type: clash, note: 刚柔相冲：同时装配时两者招式倍率 −10% }   # 绵掌（原创扩展，catalog 定）
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_shaolin_luohantang, maxLayer: 10, cost: { contribution: 300 } }
  - { type: manual, chapter: ch05_xiaoao, ref: it_miji_tieshazhang, maxLayer: 7 }
  - { type: pages,  chapter: ch08_luding, ref: it_canye_tieshazhang, pagesTotal: 4, maxLayer: 10 }
  - { type: observe, maxLayer: 6 }
special: { fusible: true }
observable: true
hiddenMoves: []
description: >-
  少林外门硬功，以铁砂熬炼掌缘，掌力沉猛、专破外家硬功。（原创扩展：原著未载其名，
  本作编入少林罗汉堂外门，作为"少林金刚"套装的玄阶成员。）
assets: { icon: skill/tieshazhang, art: illus/skill/tieshazhang }
```

### 2.9 TypeScript 类型（玩法核心 `packages/core`，Zod 校验同构）

```ts
export type Grade = 1|2|3|4|5|6|7|8|9|10|11|12;
export type Nature = 'yang'|'yin'|'harmony'|'neutral';
export type Category = 'inner'|'unarmed'|'weapon'|'movement'|'hidden'|'misc';
export type Zone = 'Z0'|'Z1'|'Z2'|'Z3'|'Z4'|'Z5'|'Z6'|'Z7'|'Z8'|'Z9'|'Z10'|'settle'|'none';

export interface SkillDef {
  id: `sk_${string}`; name: string; alias?: string[];
  category: Category; subType: string; grade: Grade;
  origin: 'canon'|'expanded'|'canonExpanded';
  sect: `sect_${string}` | null; lineage?: string;
  sourceChapters: ChapterId[]; canonRef?: string;
  nature: Nature; wOut: number; wIn: number; aptitude?: AptitudeId;
  reqs: Reqs; maxLayer?: number;
  layerStats?: Partial<Record<StatId, [number, number]>>;
  inner?: InnerDef; layers: LayerDef[]; moves: MoveDef[]; moveSlots?: number;
  passives?: PassiveDef[]; setTags?: `set_${string}`[]; conflicts?: Conflict[];
  weaponReq?: WeaponReq | null; learnSources: LearnSource[];
  special?: SkillSpecial; observable?: boolean; hiddenMoves?: string[];
  description: string; assets?: Record<string, string>;
}

export interface MoveDef {
  id: `mv_${string}`; name: string; unlock: number;
  kind: 'attack'|'support'|'stance'|'utility';
  ultimate?: boolean; rageCost?: 100;
  target: 'enemy'|'ally'|'self'|'tile'|'any';
  range: { min: number; max: number }; aoe: AoeRef;
  delivery: 'melee'|'ranged'|'projectile'|'self';
  mpCost: number;               // 比例，× MPREF(displayLevel)
  hpCost?: number;              // 比例，× 自身 hpMax
  cd: number; recovery: number; charge?: 0|1;
  power: number; hits?: number;
  wOut?: number; wIn?: number; nature?: Nature;       // 覆写武学级设置
  parryable: boolean; counterable?: boolean;
  friendlyFire: 'none'|'allies'|'all';
  displacement?: { type: 'knock'|'pull'|'dash'|'leap'|'swap'|'behind'|'retreat'; n: number; collideDmg?: number };
  buffs?: BuffApply[]; heal?: HealSpec; cleanse?: CleanseSpec;
  trigger?: TriggerSpec;         // 被动触发型招式（反击、摆尾）
  condition?: MoveCondition;     // 如"目标主武器为 blade"
  autoGroup?: string;            // 自动选式组（独孤九剑"破招"）
  tags?: string[]; anim?: AnimRef; ai?: AiHint;
}

export interface SkillState {
  skillId: string; layerReal: number; sxp: number; sourceCap: number;
  learnedIn: ChapterId; foreign: boolean; movesEquipped: string[];
  insight?: number; pages?: number[]; flags?: string[];
}
```

---

## 3. 层数（重）

### 3.1 层数系数 L(n)（交 design/04 Z1）

**公式**：`L(n) = 0.5 + 0.1 × n`，n = 有效层数 `layerEff`（1–10）。

| 层 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| L(n) | 0.60 | 0.70 | 0.80 | 0.90 | 1.00 | 1.10 | 1.20 | 1.30 | 1.40 | 1.50 |
| 阶段名（UI） | 初窥门径 | 初窥门径 | 初窥门径 | 登堂入室 | 登堂入室 | 登堂入室 | 炉火纯青 | 炉火纯青 | 炉火纯青 | 登峰造极 |

设计意图：第 10 重是第 1 重的 2.5 倍；中武（9 重上限）损失 1/15 ≈ 6.7%，低武（8 重上限）损失 13.3%，与外来品阶压制叠加后，主角在"武林衰败"书界的武功明显被压低（基准 §2 曲线说明）。

**品阶 × 层数威力矩阵 `G × L`**（配表参考；加粗为"交叉区"示例）：

| 品阶（G） | 1重 | 3重 | 5重 | 7重 | 8重 | 9重 | 10重 |
|---|---|---|---|---|---|---|---|
| 黄下（1.00） | 0.60 | 0.80 | 1.00 | 1.20 | 1.30 | 1.40 | 1.50 |
| 黄中（1.10） | 0.66 | 0.88 | 1.10 | 1.32 | 1.43 | 1.54 | 1.65 |
| 黄上（1.20） | 0.72 | 0.96 | 1.20 | 1.44 | 1.56 | 1.68 | 1.80 |
| 玄下（1.40） | 0.84 | 1.12 | 1.40 | 1.68 | 1.82 | 1.96 | 2.10 |
| 玄中（1.55） | 0.93 | 1.24 | 1.55 | 1.86 | 2.02 | 2.17 | 2.33 |
| 玄上（1.70） | 1.02 | 1.36 | 1.70 | 2.04 | 2.21 | 2.38 | 2.55 |
| 地下（2.00） | 1.20 | 1.60 | 2.00 | 2.40 | 2.60 | 2.80 | 3.00 |
| 地中（2.20） | 1.32 | 1.76 | 2.20 | 2.64 | 2.86 | 3.08 | 3.30 |
| 地上（2.40） | 1.44 | 1.92 | **2.40** | 2.88 | 3.12 | 3.36 | **3.60** |
| 天下（2.80） | 1.68 | 2.24 | **2.80** | 3.36 | **3.64** | 3.92 | 4.20 |
| 天中（3.10） | 1.86 | 2.48 | 3.10 | 3.72 | 4.03 | 4.34 | 4.65 |
| 天上（3.50） | 2.10 | 2.80 | 3.50 | 4.20 | 4.55 | 4.90 | 5.25 |

读法：地上 10 重（3.60）≈ 天下 8 重（3.64）；天下 5 重（2.80）仅比地上 5 重高 17%。新学天级武学并不能立刻取代练满的地阶武学——这给"带什么走"留出了真正的取舍。

### 3.2 武学经验曲线

- 武学经验记为 `sxp`（skill experience，与角色经验 `exp` 分开；角色经验归 design/13）。
- 习得即为第 1 重（`sxp = 0`）。从第 n 重升到第 n+1 重所需：

```
ExpToNext(g, n) = round10( 100 × GF(g) × LF(n) )          n = 1..9
```

| g | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 品阶 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 |
| GF(g) 品阶耗费系数 | 1.0 | 1.2 | 1.4 | 1.8 | 2.1 | 2.4 | 3.0 | 3.4 | 3.8 | 4.6 | 5.2 | 6.0 |

| n（升至 n+1） | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | 7→8 | 8→9 | 9→10 |
|---|---|---|---|---|---|---|---|---|---|
| LF(n) 层耗费系数 | 1.0 | 1.5 | 2.2 | 3.0 | 4.0 | 5.2 | 6.6 | 8.2 | 12.0 |

**查表：ExpToNext(g, n)**

| 品阶 | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | 7→8 | 8→9 | 9→10 | 累计至 7 重 | 累计至 8 重 | 累计至 9 重 | 累计至 10 重 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 黄下 | 100 | 150 | 220 | 300 | 400 | 520 | 660 | 820 | 1,200 | 1,690 | 2,350 | 3,170 | 4,370 |
| 黄中 | 120 | 180 | 260 | 360 | 480 | 620 | 790 | 980 | 1,440 | 2,020 | 2,810 | 3,790 | 5,230 |
| 黄上 | 140 | 210 | 310 | 420 | 560 | 730 | 920 | 1,150 | 1,680 | 2,370 | 3,290 | 4,440 | 6,120 |
| 玄下 | 180 | 270 | 400 | 540 | 720 | 940 | 1,190 | 1,480 | 2,160 | 3,050 | 4,240 | 5,720 | 7,880 |
| 玄中 | 210 | 320 | 460 | 630 | 840 | 1,090 | 1,390 | 1,720 | 2,520 | 3,550 | 4,940 | 6,660 | 9,180 |
| 玄上 | 240 | 360 | 530 | 720 | 960 | 1,250 | 1,580 | 1,970 | 2,880 | 4,060 | 5,640 | 7,610 | 10,490 |
| 地下 | 300 | 450 | 660 | 900 | 1,200 | 1,560 | 1,980 | 2,460 | 3,600 | 5,070 | 7,050 | 9,510 | 13,110 |
| 地中 | 340 | 510 | 750 | 1,020 | 1,360 | 1,770 | 2,240 | 2,790 | 4,080 | 5,750 | 7,990 | 10,780 | 14,860 |
| 地上 | 380 | 570 | 840 | 1,140 | 1,520 | 1,980 | 2,510 | 3,120 | 4,560 | 6,430 | 8,940 | 12,060 | 16,620 |
| 天下 | 460 | 690 | 1,010 | 1,380 | 1,840 | 2,390 | 3,040 | 3,770 | 5,520 | 7,770 | 10,810 | 14,580 | 20,100 |
| 天中 | 520 | 780 | 1,140 | 1,560 | 2,080 | 2,700 | 3,430 | 4,260 | 6,240 | 8,780 | 12,210 | 16,470 | 22,710 |
| 天上 | 600 | 900 | 1,320 | 1,800 | 2,400 | 3,120 | 3,960 | 4,920 | 7,200 | 10,140 | 14,100 | 19,020 | 26,220 |

**节奏校验**（配合 §8.2 的实战经验池，悟性/资质均为 50，只计战斗、不计闭关与师父）：

| 书界 | 等级带 | 约战斗数 | 主力攻击武学可得 sxp | 主运内功可得 sxp | 可达成的典型目标 |
|---|---|---|---|---|---|
| 天龙 | 1–35 | 150 | ≈ 16,400 | ≈ 9,100 | 一门天中武学 1→8 重（12,210）或两门地阶练至 9 重 |
| 射雕 | 35–50 | 160 | ≈ 35,300 | ≈ 19,600 | 一门天中练满（22,710）并把第二门推到 7 重 |
| 神雕 | 50–62 | 160 | ≈ 45,400 | ≈ 25,200 | 天上练满（26,220）+ 另一门天阶过半 |
| 倚天 | 62–70 | 160 | ≈ 52,800 | ≈ 29,400 | 两门天阶满层 |
| 鹿鼎 | 44（封顶） | 100 | ≈ 22,300 | ≈ 12,400 | 本土地阶武学练至 8 重上限，外来武学真实层数继续积累 |

闭关（§8.3）与师父指点（§8.4）预计再提供战斗所得的 40%–60%。

### 3.3 修为门槛（`gateCap`）

高阶武学的深层需要相应修为（按**显示等级**、**绝对品阶大阶**判定）：

| 大阶 | 1–3 重 | 4–6 重 | 7–8 重 | 9 重 | 10 重 |
|---|---|---|---|---|---|
| 黄 | — | — | — | — | — |
| 玄 | — | — | Lv ≥ 11（三流） | Lv ≥ 16 | Lv ≥ 21（二流） |
| 地 | — | Lv ≥ 11（三流） | Lv ≥ 21（二流） | Lv ≥ 31（一流） | Lv ≥ 36 |
| 天 | — | Lv ≥ 21（二流） | Lv ≥ 31（一流） | Lv ≥ 41（绝顶） | Lv ≥ 51（宗师） |

`gateCap(grade, displayLevel)` = 满足门槛的最高层。与书界等级上限（基准 §2）联动的结果：

| 书界 | 等级上限 | 天阶可达 | 地阶可达 | 叙事含义 |
|---|---|---|---|---|
| 天龙 | 35 | 8 重 | 9 重 | 初入江湖，天级武学"得其形未得其神" |
| 射雕 | 50 | 9 重 | 10 重 | |
| 神雕/倚天 | 62/70 | 10 重 | 10 重 | 巅峰时代，天级武学可至化境 |
| 中武书界 | 52–60 | 9 重（境界上限） | 9 重（境界上限） | |
| 低武书界 | 44–48 | 8 重（境界上限） | 8 重（境界上限） | |

**瓶颈与溢出**：
- 当 `layerReal` 已达 `min(maxLayer, sourceCap, gateCap)` 时，进入**瓶颈**：`sxp` 继续累积但封顶为 1 × `ExpToNext(g, 当前层)`；门槛解除（升级、获得更好的学习途径）后立即突破，多余 `sxp` 结转。
- **天道上限不是瓶颈**：`layerReal` 可以超过 `tierCap`（例如在低武书界把外来武学的真实层数练到 9 重），只是有效层数被截断；只有修为门槛与学习途径上限会阻止真实层数增长。这与基准 §3 规则 4"真实等级只增不减、显示等级截断"同构。
- **强行冲关**（主动操作，闭关中可选）：无视修为门槛突破 1 重（仅对下一重有效），成功率 `p = clamp(0.35 + (wil − 50)/200 + (luk − 50)/400 − 0.05 × 缺少的等级数, 0.05, 0.8)`；失败触发走火入魔（§10），等级 2 起步。每门武学每书界限 1 次。

### 3.4 有效层数与书界上限（汇总公式与边界）

```
layerEff = min( layerReal, tierCap, gateCap(grade, displayLevel), special.layerCap ?? 10 )
```

| 情形 | 例 | 结果 |
|---|---|---|
| 外来武学进入中武书界 | 降龙 10 重带入笑傲（显示 Lv 60） | `effGrade` 12→10（天下，G 2.8）；`layerEff` = min(10, 9, 10) = 9；威力系数 2.8 × 1.4 = 3.92（原 5.25，−25%） |
| 外来武学进入低武书界 | 同上带入鹿鼎（Lv 44） | `effGrade` 8（地中，G 2.2）；`layerEff` = min(10, 8, 9) = 8；2.2 × 1.3 = 2.86（−46%） |
| 本土武学在低武书界 | 鹿鼎习得凝血神爪（天下，本土） | `effGrade` 10 不压制；`layerEff` ≤ 8 |
| 外来武学"本土印证"后 | 易筋经带入笑傲，再由方证传授（§7.8） | `foreign = false`，本书界不再品阶压制 |
| 黄阶外来武学 | 罗汉拳（黄下）带入低武 | `effGrade` = max(1, 1−4) = 1（下限黄下） |
| 真实层数 < 已解锁招式要求 | 书眠后 `layerEff` 从 10 截到 8 | 第 9、10 重解锁的招式/被动/绝招"天道封印" |
| 终局"天书守卷人"决战 | 不受天道压制（基准 §2） | `tierCap = 10`、`suppression = 0`，`gateCap` 按真实等级计算（design/13 定义该战的等级规则） |

### 3.5 每层解锁规范（配表模板）

每门武学的 `layers` 必须满足下列节奏（数据校验见 §15）：

| 层 | 黄阶 | 玄阶 | 地阶 | 天阶 |
|---|---|---|---|---|
| 1 | 招式 ×1–2 + 核心被动（弱） | 招式 ×1–2 + 核心被动 | 招式 ×2 + 核心被动 | 招式 ×2 + 核心被动 |
| 2–3 | （可空） | 招式 ×1 | 招式 ×1 | 招式 ×1–2 |
| 4–6 | 招式 ×1 或被动 ×1 | 招式 ×1 + 被动 ×1（"小成"） | 招式 ×1–2 + 被动 ×1 | 招式 ×1–2 + 被动 ×1–2 |
| 7 | 被动 ×1 | 招式 ×1 | **绝招**（默认）或进阶招 | **绝招**（默认）或进阶招 |
| 8–9 | — | 被动 ×1 | 进阶招/被动 | 进阶招/被动 |
| 10 | "圆满"被动（小） | 绝招（可选）或"大成"被动 | "大成"机制被动 | "大成"机制被动；绝招若延后至此预算 +20% |

| 数量规范 | 黄 | 玄 | 地 | 天 |
|---|---|---|---|---|
| 普通招式总数 | 2–3 | 3–5 | 4–7 | 5–10（降龙十八掌、独孤九剑等原著定数者例外） |
| 绝招 | 0 | 0–1 | 1 | 1–2 |
| 被动 | 1–2 | 2–3 | 3–4 | 4–6 |
| 招式栏 `moveSlots` | 3 | 3 | 4 | 5 |

### 3.6 装配成长数值 `layerStats`

- 武学在**装配中**时提供的角色数值，按有效层数线性插值：`v(n) = v1 + (v10 − v1) × (n − 1)/9`。
- 预算（第 10 重的合计上限，按大阶；百分比类按 1% = 1 点，平铺类按表内单位）：

| 大阶 | 外功武学 `layerStats` 上限 | 典型分配 |
|---|---|---|
| 黄 | 6 点 | `parry` +3、`hit` +3 |
| 玄 | 10 点 | `defOut` +6%、`parry` +4 |
| 地 | 15 点 | `seal` +10、`crit` +5 |
| 天 | 20 点 | 视武学特色 |

- 内功的属性加成走 `inner.contribution`（§5.5），不使用 `layerStats`。
- 数值的属性合成方式（加法/乘法、上限）归 design/03。

---

## 4. 招式（`move`）

### 4.1 招式字段表

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `id` | string | — | `mv_<武功拼音>_<序号或拼音>`（基准 §12） |
| `name` | string | — | 原著招式名；原创须标注 |
| `unlock` | int | 1 | 解锁层（按 `layerEff`） |
| `kind` | enum | `attack` | `attack` 攻击 / `support` 治疗·增益·驱散 / `stance` 架势（持续到自己下次行动或被触发） / `utility` 位移·换位·控场 |
| `ultimate` | bool | false | 绝招（§4.8） |
| `target` | enum | `enemy` | `enemy` / `ally` / `self` / `tile`（对地） / `any` |
| `range` | `{min,max}` | `{1,1}` | 射程（格，曼哈顿距离，**建议**，以 design/09 为准）；`min > 1` 表示贴身不可用 |
| `aoe` | `{tpl, ...params}` | `aoe_single` | 范围模板（§4.3） |
| `delivery` | enum | `melee` | `melee` 近身 / `ranged` 远程气劲（剑气、掌风、指力；越过单位，被墙体阻挡） / `projectile` 投射物（需视线，被第一个单位阻挡） / `self` |
| `hTol` | int | melee 2 / ranged 4 | 高度容差：受影响格与原点高度差 > hTol 则不受影响；音功等可设 `99` |
| `mpCost` | number | 按大阶 | × `MPREF(显示等级)`（design/03 的标准内力曲线；锚点 Lv1≈200、Lv35≈3000、Lv70≈12000），取整，最低 1 |
| `hpCost` | number | 0 | × 自身 `hpMax`，代价型武学使用 |
| `cd` | int | 0 | 冷却（自身行动次数） |
| `recovery` | int | 1000 | 收招值：行动后集气扣减量（基准 §8；CT 规则归 design/09），范围 700–1500 |
| `charge` | 0/1 | 0 | 蓄招：本次行动起手并显示预警，下次行动开始时释放；期间被控制则打断、返还 50% 内力 |
| `power` | number | — | 招式倍率（§4.2 预算） |
| `hits` | int | 1 | 多段数；每段倍率 = `power / hits`，每段独立判定（判定细节归 design/04） |
| `wOut`/`wIn`/`nature` | | 继承武学 | 招式级覆写 |
| `parryable` | bool | true | 能否被招架（Z0/Z9） |
| `counterable` | bool | true | 能否被反击 |
| `friendlyFire` | enum | `none` | `none` 不伤友 / `allies` 仅作用友方 / `all` 敌我皆中 |
| `displacement` | object | — | 位移（§4.5） |
| `buffs` | BuffApply[] | — | `{id, chance, dur, stacks?, grade: inherit, to: target\|self\|area\|allies}`；最终施加率还要过效果命中/抵抗（design/04） |
| `heal` / `cleanse` | object | — | 治疗：`{base: targetHpMax\|casterMpMax, pct}`（公式归 design/04）；驱散：`{tags[], count, maxGrade: inherit}` |
| `trigger` | object | — | 被动触发型招式：`{on, chance, perRound}`（§4.10） |
| `condition` | object | — | 使用条件，如 `{targetWeapon: [blade]}`、`{fromBehind: true}`、`{selfHpBelow: 0.3}` |
| `autoGroup` | string | — | 自动选式组：UI 只显示一个按钮，按目标自动解析为组内合法招式 |
| `tags` | string[] | — | 表现与判定标签：`palm` `finger` `qigong`（气劲） `sonic` `fire` `cold` `poison` `hard` `soft` … |
| `anim` | object | — | `{clip, vfx, sfx, cutin?}` 素材键（素材规范归 `tech/06`） |
| `ai` | object | — | `{weight, prefer: opener\|finisher\|aoe\|control\|heal}` 供 design/09 AI 使用 |

### 4.2 招式预算公式（配表规则）

所有普通招式的 `power` 必须由下式算出，允许 ±0.05 的手调（超出需在 catalog 中写明理由）：

```
power = AF(tpl) × (1 + Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp
```

| 项 | 规则 |
|---|---|
| 基准 | 单体、近身、射程 1、`cd 0`、`recovery 1000`、耗内 = 大阶基准、可招架、无附带 → **power = 1.00** |
| 耗内大阶基准 | 黄 5% / 玄 6% / 地 7% / 天 8%（× MPREF） |
| `adj` 冷却 | 每 1 回合 +0.12（上限按 5 回合计） |
| `adj` 耗内 | 高于基准每 +1% → +0.05；低于基准每 −1% → −0.05（耗内下限 2%） |
| `adj` 收招 | 每比 1000 多 100 → +0.07；每少 100 → −0.07 |
| `adj` 自损 | 每 1% `hpCost` → +0.06 |
| `adj` 蓄招 | `charge: 1` → +0.30 |
| `adj` 条件 | 常见条件（如目标持某类兵器）+0.15；罕见条件（如背后、目标残血 < 30%）+0.30 |
| `K_delivery` | melee 1.00 / ranged 0.85 / projectile 0.92 |
| `K_parry` | 可招架 1.00 / 不可招架 0.85 |
| `cost_buff` | 建议值（design/06 定义 Buff 价值后替换）：控制（定身/眩晕 1 回合）0.25 × 施加率；封穴 0.20 × 率；内伤/破甲/流血/减速 0.10 × 率；自身增益 0.10–0.20 |
| `cost_disp` | 击退每格 0.05；拉拽 0.10；突进/跳斩（自身位移）0.10；换位/绕背 0.15 |
| AF | 范围系数，见 §4.3 |

**例**：降龙十八掌·震惊百里：`aoe_around`（AF 0.65）× (1 + 0.36 冷却 3 + 0.10 耗内 10%) × 1 × 1 − 0.25 × 0.3（眩晕 30%）= 0.65 × 1.46 − 0.075 ≈ **0.87** → 取 0.85。

**支援类预算**（治疗与护盾，公式归 design/04）：标准单体治疗 = 目标 `hpMax` 的 18%（大阶基准耗内、`cd 2`）；护体真气（`shield`）按治疗量 × 1.2 等价；群体治疗按 AF 折算。

### 4.3 范围模板库（`aoe_*`，28 种）

图例：`@` 施招者；`■` 受影响格；`T` 目标点（未受影响时）；`□` 路径/落点（不受影响）；`·` 空格。有方向的模板以施招者**面朝上方**绘制，实际按"施招者→目标点"方向旋转（8 方向取最近）。

| # | ID | 名称 | 原点 | 方向 | 参数 | 格数 | AF |
|---|---|---|---|---|---|---|---|
| 1 | `aoe_single` | 单体 | 目标 | — | — | 1 | 1.00 |
| 2 | `aoe_self` | 自身 | 自身 | — | — | 1 | — |
| 3 | `aoe_line` | 直线贯穿 | 自身 | ✅ | `n` 2–6 | n | n2 0.85 / n3 0.80 / n4 0.75 / n5–6 0.70 |
| 4 | `aoe_bolt` | 直线首中 | 自身 | ✅ | `r` | 1 | 1.00（配 `projectile`） |
| 5 | `aoe_pierce` | 穿透 | 目标 | ✅ | — | 2 | 0.90 |
| 6 | `aoe_sweep` | 横扫 | 自身 | ✅ | — | 3 | 0.75 |
| 7 | `aoe_cone` | 锥形 | 自身 | ✅ | `n` 2–3 | 4 / 9 | 0.75 / 0.65 |
| 8 | `aoe_wave` | 横排气墙 | 自身前方 d 格 | ✅ | `d` 1–3，`w` 3/5 | w | 0.70 / 0.60 |
| 9 | `aoe_cross` | 十字 | 目标 | — | `r` 1–2 | 5 / 9 | 0.65 / 0.55 |
| 10 | `aoe_x` | 斜十字 | 目标 | — | `r` 1–2 | 5 / 9 | 0.65 / 0.55 |
| 11 | `aoe_sq3` | 九宫 | 目标 | — | — | 9 | 0.60 |
| 12 | `aoe_sq5` | 大九宫 | 目标 | — | — | 25 | 0.45 |
| 13 | `aoe_diamond` | 菱形 | 目标 | — | `r` 2–3 | 13 / 25 | 0.50 / 0.42 |
| 14 | `aoe_around` | 周身八格 | 自身 | — | — | 8 | 0.65 |
| 15 | `aoe_ring` | 环形（空心） | 自身 | — | `r` 2–3 | 16 / 24 | 0.55 / 0.50 |
| 16 | `aoe_field` | 全场 | — | — | `side`: enemy/all | 全体 | 0.35 |
| 17 | `aoe_leap` | 跳斩 | 目标 | — | `r`，`splash`: none/sq3 | 1(+8) | 主 0.90，溅射 ×0.5 |
| 18 | `aoe_dash` | 突进 | 自身 | ✅ | `n` 2–5，`through` | 1 / 路径 | 1.00 / 0.80 |
| 19 | `aoe_pull` | 拉拽 | 目标 | ✅ | `n` 1–3 | 1 | 0.95 |
| 20 | `aoe_knock` | 击退 | 目标 | ✅ | `n` 1–3 | 1 | 0.95 |
| 21 | `aoe_chain` | 连锁弹射 | 目标 | — | `n` 跳数 2–5，跳距 2 | 1+n | 0.80（每跳 ×0.8 递减） |
| 22 | `aoe_multi` | 乱击 | 目标 | — | `n` 段，`r` | 随机 | 0.85 |
| 23 | `aoe_behind` | 绕背 | 目标 | — | `r` | 1 | 0.90（附带背击 Z7） |
| 24 | `aoe_swap` | 换位 | 目标 | — | `r` | 1 | 0.85（若带伤害） |
| 25 | `aoe_zone` | 地面区域 | 目标 | — | `shape`（sq3/diamond2/line），`t` 回合 | 按形状 | 每跳 0.25 |
| 26 | `aoe_boomerang` | 回旋 | 自身 | ✅ | `n` 3–5 | 2n（往返） | 每程 0.75 |
| 27 | `aoe_allies` | 友方范围 | 自身 | — | `r` | 菱形 r | —（支援） |
| 28 | `aoe_ally_all` | 全体友方 | — | — | — | 全体 | —（支援） |

**网格示意**：

```
[3] aoe_line n=3     [4] aoe_bolt        [5] aoe_pierce      [6] aoe_sweep
    ■                    ·                   ■ ← 身后一格        ■ ■ ■
    ■                    ■ ← 首个单位         ■ ← 目标              @
    ■                    □
    @                    □
                         @

[7] aoe_cone n=3                 [8] aoe_wave d=2,w=5         [9] aoe_cross r=2
    ■ ■ ■ ■ ■                        ■ ■ ■ ■ ■                        ■
      ■ ■ ■                              □                            ■
        ■                                @                        ■ ■ ■ ■ ■
        @                                                             ■
                                                                      ■

[10] aoe_x r=1    [11] aoe_sq3     [13] aoe_diamond r=2     [14] aoe_around   [15] aoe_ring r=2
     ■ · ■            ■ ■ ■                ■                     ■ ■ ■         ■ ■ ■ ■ ■
     · ■ ·            ■ ■ ■              ■ ■ ■                   ■ @ ■         ■ · · · ■
     ■ · ■            ■ ■ ■            ■ ■ ■ ■ ■                 ■ ■ ■         ■ · @ · ■
                                         ■ ■ ■                                 ■ · · · ■
                                           ■                                   ■ ■ ■ ■ ■

[17] aoe_leap splash=sq3     [18] aoe_dash n=3        [19] aoe_pull n=2     [20] aoe_knock n=2
     ■ ■ ■                        ■ ← 首个单位受击          T ─┐                   □ ← 终点
     ■ T ■  T=主目标                □                        □  │ 拉至              □
     ■ □ ■  □=落点                  □                        □ ←┘                  ■ ← 目标
       ⋮   （越过单位与 ≤jump+2 高差）  @                        @                      @

[21] aoe_chain n=3              [23] aoe_behind            [24] aoe_swap        [26] aoe_boomerang n=3
     ■ ─→ ■ ─→ ■ ─→ ■                □ ← 绕至身后并出招         @ ⇄ ■                 ■ ↑↓
     (每跳 ≤2 格，择最近未命中者)      ■ ← 目标                                       ■ ↑↓（往返各判定一次）
                                     @                                                ■ ↑↓
                                                                                      @
```

### 4.4 高度、视线、地形

| 规则 | 内容 |
|---|---|
| 近身高差 | `melee` 招式要求施招者与目标 `|Δh| ≤ hTol`（默认 2）；跳斩类用 `jump + 2` |
| 视线 | `projectile` 需要视线（被单位与 `blocksLos` 地形阻挡）；`ranged` 越过单位但被 `blocksLos` 地形与 `Δh ≥ 3` 的墙体阻挡；`sonic` 标签无视阻挡 |
| 范围与高度 | 范围内每格若与原点 `|Δh| > hTol` 则不受影响（高台上的敌人不会被平地横扫扫到） |
| 地形交互 | 招式可带 `terrainFx`：如火系点燃 `tr_caodi`（草地）、寒系冻结浅水（地形目录与状态归 design/08） |
| 方位与高低加成 | 背击/侧击、高打低属于 Z7，数值归 design/04 |

### 4.5 位移规则（`displacement`）

| 类型 | 规则 | 边界情况 |
|---|---|---|
| `knock` 击退 | 沿"施招者→目标"方向推 n 格 | 被单位/障碍/上坡高差 > 1 阻挡：停下，目标受**撞击伤害** = `collideDmg ×` 本招单段伤害（默认 0.2），被撞单位受其一半；推下高差 ≥ 3 的崖：坠落伤害与"坠落"状态（design/08）；推入深水 `tr_shenshui`：落水（design/08） |
| `pull` 拉拽 | 目标朝施招者移动 n 格，最多至相邻 | 路径被阻挡则停在阻挡前；免疫控制（`resCC` 判定/机制免疫）则无效但伤害照常 |
| `dash` 突进 | 自身直线移动至多 n 格，停在首个单位前并出招 | 路径必须可通行，受轻功门禁约束（如踏水需 `qg3`，design/08）；`through: true` 可穿过并伤及路径全部敌人 |
| `leap` 跳斩 | 跳到目标相邻的空格再出招 | 落点高差 ≤ `jump + 2`；越过中间单位；落点被占则选最近合法格，无合法格则招式不可选 |
| `swap` 换位 | 与目标交换位置 | 对敌方须通过效果命中；Boss 可机制免疫 |
| `behind` 绕背 | 移动到目标身后格并出招 | 身后格不可达则退化为普通近身攻击，失去背击 |
| `retreat` 后撤 | 出招后自身后退 n 格 | 被阻挡则尽量后退 |

位移结算顺序：伤害判定 → 伤害结算 → 位移 → 撞击/坠落 → 触发地形效果。位移不触发对方反击，但触发陷阱与区域（`aoe_zone`）。

### 4.6 友伤（`friendlyFire`）

| 值 | 用途 | 规则 |
|---|---|---|
| `none` | 绝大多数招式 | 范围内友方不受影响 |
| `allies` | 治疗、增益 | 只作用友方 |
| `all` | 音功（狮子吼、碧海潮生曲）、毒雾、火器、生死符式范围 | 敌我皆中；UI 预览把友方格标红；AI 以"友方损失 × 1.5"计入价值评估 |

音功类另有"塞耳"反制（杂学/物品），归 design/06 与 design/10。

### 4.7 远程与近身

| 类别 | 判定 | 招架 | 反击 |
|---|---|---|---|
| `melee` | 与 `hTol` 比较；受 Z7 方位 | 可（`parryable`） | 可（`counterable`） |
| `ranged` | 视线（墙体） | 可（剑气类可被"以气破气"招架，数值归 design/04） | 仅具"远程反击"被动者 |
| `projectile` | 视线（单位与墙体） | 可被"接暗器"被动/破箭式处理 | 否 |

### 4.8 绝招（`ultimate`）

| 规则 | 值 |
|---|---|
| 消耗 | 气势 `rage` 100（基准 §8），另加耗内 = 大阶基准 + 2% |
| 预算基准 | `power` 基准 3.00（单体），其余同 §4.2；延后至第 10 重解锁的绝招 +20% |
| 冷却 | 无（由气势限制） |
| 收招 | 默认 1200 |
| 招架 | 可设为可招架，但 Z9 招架减免减半（**建议**，design/04 确认） |
| 霸体 | 施放过程不可被打断（`charge` 不可用于绝招） |
| 封绝 | 受"封绝"类 Buff（如 `bf_miyun`）时不可施放 |
| 演出 | 立绘切入（`anim.cutin`），≤ 1.2 秒，可在设置中关闭 |
| 数量 | 每门武学 ≤ 2 个；内功绝招以自身/友方效果为主 |

### 4.9 招式栏（`moveSlots`）

- 每门装配中的武学，战斗中最多暴露 `moveSlots` 个普通招式（黄/玄 3、地 4、天 5）＋全部已解锁绝招。
- 玩家在"武学"界面为每门武学勾选招式；默认自动选择最新解锁的若干招。
- `autoGroup` 组（如独孤九剑的"破招"）只占 1 格。
- 触发型招式（§4.10）不占招式栏，但须在"触发"子栏勾选（每门武学 ≤ 1 个）。

### 4.10 触发型招式与普攻

- **触发型招式**：`trigger.on` ∈ `meleeAttacked`、`backAttacked`、`parrySuccess`、`allyAttacked`、`enemyEnterAdjacent`。触发时不占行动、不耗气势；照常耗内（不足则不触发）；每次来袭最多触发 1 个（按 `chance` 高者优先）；`perRound` 为每回合上限（此处"回合" = 持有者自身一次行动间隔）。反击的判定时序归 design/09。
- **普攻**：每个角色都有隐藏武学 `sk_basic`（基本功，grade 1，固定 5 重，L = 1.0，不计入图鉴、不参与携带），招式 `mv_basic_strike`（普通一击：单体、近身、`power 0.80`、耗内 0、`recovery 900`）。内力不足时仍可行动。

---

## 5. 内功

### 5.1 主运与辅运

| 项 | 主运（1 栏） | 辅运（2 栏） |
|---|---|---|
| 内力性质 `mpNature` | **由主运决定**（基准 §20） | 不影响 |
| 内功贡献（hpMax/mpMax/属性/回内，§5.5） | 100% | × 辅运比例 `auxRatio` |
| `stat` / `effect` 类被动 | 100% | × `auxRatio`（数值部分；持续、触发率不打折） |
| `mechanic` / `trigger` 类被动 | 100% | 默认不生效；被动标 `auxMode: full` 者 100% 生效 |
| 运功招式 | 可用 | 默认不可用；标 `auxUsableMoves` 者可用 |
| 武学经验（§8.2） | 实战池 20% | 每门 8% |
| 套装计件 | 计 | 计 |

### 5.2 辅运比例 `auxRatio`

按"主运性质 × 该辅运性质"查表：

| 主运＼辅运 | 阳 | 阴 | 调和 |
|---|---|---|---|
| 阳 | **0.50**（同源） | **0.25**（相冲，§5.4） | 0.40 |
| 阴 | 0.25（相冲） | 0.50（同源） | 0.40 |
| 调和 | 0.40 | 0.40 | 0.50（同源） |

修正：
- 装配中存在"桥接"内功（§5.4）→ 相冲格按 0.40 计且不触发相冲风险。
- 易筋经第 10 重"易筋大成"：所有辅运比例 +0.10（上限 0.60）。
- `inner.auxOverride` 可为个别内功指定固定比例（如小无相功"无相"：作辅运时固定 0.50，**原创扩展设定**）。

### 5.3 内力性质与外功相性矩阵（交 design/04 Z5）

性质定义：

| 性质 | ID | 特点 | 原著代表（本作设定，性质归属多为游戏化判断） |
|---|---|---|---|
| 阳 | `yang` | 刚猛、炽热，利于刚劲外功 | 九阳神功、先天功、龙象般若功、蛤蟆功 |
| 阴 | `yin` | 阴柔、寒凉，利于阴柔外功 | 玉女心经、吸星大法、葵花宝典、寒冰真气 |
| 调和 | `harmony` | 阴阳相济，全面但峰值较低 | 易筋经、九阴真经（总纲）、太玄经、小无相功 |
| 中性 | `neutral` | **仅外功**：招意不依内力性质 | 独孤九剑、太祖长拳、多数黄阶外功 |

**相性矩阵**（攻方**主运性质** × 所用**招式性质**，结果为 Z5 的加算项）：

| 主运＼招式 | 阳招 | 阴招 | 调和招 | 中性招 |
|---|---|---|---|---|
| 阳 | **+12%** | **−12%** | 0 | 0 |
| 阴 | −12% | +12% | 0 | 0 |
| 调和 | +4% | +4% | +12% | +2% |
| 未装配内功 | 0 | 0 | 0 | 0 |

- **三运同源**：主运与两门辅运性质全部为阳（或全部为阴）时，同性质招式额外 +4%（Z5）。
- 内功自身的运功招式按其 `nature` 与主运性质查同一张表（主运使用自己的招式时天然"同源"）。
- 寒/热类效果（`cold`/`heat` 标签的 Buff 与抗性）独立于本矩阵，归 design/06。

### 5.4 阴阳相冲与桥接

- **相冲**：主运与任一辅运一阳一阴，且装配中没有桥接内功。
  - 该辅运比例降为 0.25（§5.2）。
  - 每场战斗开始时判定一次"内息相冲"：`p = 0.08 × (1 − wil/150)`，命中则获得 `bf_neixiwenluan`（走火入魔 1 级，§10），品阶取两门内功中较高者。
  - 闭关修炼相冲组合中的任一门时，心魔概率 ×2（§8.3）。
- **桥接**：任一内功栏装配了性质为 `harmony` 且品阶 ≥ 7 的内功，或内功标有 `inner.bridge: true`。桥接消除相冲判定。
- 特例（原著依据）：九阳神功与"玄冥神掌"寒毒之间是**相克**而非相冲——九阳第 6 重起免疫品阶 ≤ 自身的 `cold` 标签 Buff（§13.4）。

### 5.5 内功贡献接口（与 design/03 对接）

每门内功定义 `inner.contribution`（第 10 重、主运时的值）。design/03 计算角色数值时读取：

```
InnerTotal = Σ_{内功栏 i} contribution_i × innerScale(layerEff_i) × ratio_i
innerScale(n) = 0.30 + 0.07 × n          // 1 重 0.37，5 重 0.65，10 重 1.00
ratio_i = 1（主运）或 auxRatio（辅运）
```

| 字段 | 含义 | 在 design/03 中的作用（建议） |
|---|---|---|
| `mpMaxPct` | 内力上限 +% | 乘在 mpMax 基础曲线上 |
| `hpMaxPct` | 气血上限 +% | 乘在 hpMax 基础曲线上 |
| `attrs` | 先天属性加点 `{con, str, agi, wis, wil}` | 加在先天属性上（可突破 100，受 120 上限） |
| `mpRegen` | 每回合内力恢复（% mpMax） | 回合开始时恢复；**新增字段，名称待 design/03 确认** |
| `stats` | 战斗属性（如 `defIn` +%、`resInjury` +） | 按 design/03 的合成规则 |

**标准预算**（第 10 重主运；内功点 `IP` = `mpMaxPct` + `hpMaxPct` + 2 × 属性点 + 5 × `mpRegen`；单项可在标准值 ±30% 内调整，但 IP 总和须在 ±5% 内）：

| 品阶 | mpMaxPct | hpMaxPct | 属性点 | mpRegen | IP 预算 |
|---|---|---|---|---|---|
| 黄下 | 6 | 4 | 2 | 1.0 | 19 |
| 黄中 | 8 | 5 | 3 | 1.0 | 24 |
| 黄上 | 10 | 6 | 4 | 1.2 | 30 |
| 玄下 | 14 | 8 | 6 | 1.5 | 41.5 |
| 玄中 | 17 | 10 | 7 | 1.5 | 48.5 |
| 玄上 | 20 | 12 | 8 | 1.8 | 57 |
| 地下 | 26 | 16 | 10 | 2.0 | 72 |
| 地中 | 30 | 18 | 12 | 2.2 | 83 |
| 地上 | 34 | 20 | 14 | 2.5 | 94.5 |
| 天下 | 42 | 25 | 18 | 3.0 | 118 |
| 天中 | 48 | 29 | 21 | 3.3 | 135.5 |
| 天上 | 56 | 34 | 24 | 3.6 | 156 |

`stats` 不计入 IP，受被动预算约束（每门内功 `stats` 合计 ≤ 大阶 `layerStats` 上限，§3.6）。外来压制时贡献按 `effGrade` 重新查表并保持该内功自己的分配比例（例：易筋经在低武书界按地中 IP 83 缩放）。

**例**：主运易筋经 10 重（天上，IP 156）＋辅运九阳神功 8 重（天上，阳；调和主运 → 辅运比例 0.40）：
九阳贡献 = 九阳 contribution × innerScale(8)=0.86 × 0.40 = 34.4%。若九阳 `mpMaxPct` 为 60，则提供 mpMax +20.6%。

### 5.6 易运（切换主运）

| 场景 | 规则 |
|---|---|
| 非战斗 | 装配与主/辅运自由调整，无消耗 |
| 战斗中 | 行动"易运"：把一门辅运与主运互换（不能装配新内功）；占用本次行动（仍可移动），收招 800；新 mpMax 立即生效，当前内力 = min(当前, 新上限)；新主运的 `battleStart` 被动不补触发；同一角色 3 回合内只能易运 1 次 |
| 被封穴 | 带 `seal` 标签且"封内"效果的 Buff 期间不能易运（Buff 定义归 design/06） |

### 5.7 内功专属字段 `InnerDef`

| 字段 | 类型 | 说明 |
|---|---|---|
| `contribution` | object | §5.5 |
| `bridge` | bool | 视为桥接（§5.4） |
| `natureFollowAux` | bool | 作主运时 `mpNature` 取品阶最高的辅运性质（无辅运时为调和）；用于乾坤大挪移、斗转星移这类"运使之法"（**原创设定**） |
| `auxOverride` | number | 固定辅运比例 |
| `auxUsableMoves` | moveId[] | 作辅运时仍可用的招式 |
| `seclusionCap` | int | 覆写闭关可达层数（默认内功 8，§8.3） |

---

## 6. 装配规则（基准 §20 细则）

### 6.1 栏位

| 栏位 | 数量 | 可放入 | 细则 |
|---|---|---|---|
| 内功 | 3（主运 1 + 辅运 2） | `inner` | §5 |
| 拳脚 | 3 | `unarmed` | 持械降效（§6.3） |
| 兵器 | 3 | `weapon` | 只有与当前主武器匹配者可用（§6.2）；空手时整栏不可用 |
| 轻功 | 1 | `movement` | 提供 `qinggong`、`mov`、`jump` 等（数值归 design/08） |
| 暗器 | 1 | `hidden` | 需要暗器弹药（design/10） |
| 杂学 | 2 | `misc`（含左右互搏） | 主动或被动 |

通用约束：同一武学不能占两个栏位；融会贯通所得自创武学占一个对应栏位；装配变更只能在非战斗状态进行（战斗中仅允许"易运"与换兵，§5.6、§6.4）。

### 6.2 兵器武学与主武器匹配（`weaponReq`）

| 字段 | 说明 | 例 |
|---|---|---|
| `category` | 必须等于主武器类别（基准 §7 兵器类别） | `sword` |
| `kinds` | 仅 `exotic`：奇门细类白名单 | `[brush]`（判官笔法） |
| `tags` | 可选：武器需带有的标签；**不满足时仍可用，但失去标注的加成** | 玄铁剑法 `heavy`（重剑） |
| `dual` | 双持武学：副手须为同类兵器，或主手为成对兵器 | 鸳鸯刀法（配 `eq_yuanyangdao`） |
| `altCategories` | 特例：额外允许的类别与系数 | 独孤九剑 9 重起 `[staff, exotic] × 0.9` |

**奇门细类 `kinds`**（新增枚举，装备侧由 design/10 为每件奇门兵器标注）：

| kind | 中文 | 原著例 |
|---|---|---|
| `brush` | 判官笔 | 朱子柳（一阳书指的笔法）、秃笔翁 |
| `fan` | 折扇 | |
| `wheel` | 轮 | 金轮法王 |
| `hook` | 钩 | |
| `pestle` | 杵 | 降魔杵 |
| `qin` | 琴 | 黄钟公 |
| `flute` | 笛/箫 | 黄药师玉箫 |
| `dagger` | 匕首/短兵 | 韦小宝匕首（`eq_bishou`） |
| `hammer` | 锤 | |
| `axe` | 斧 | |
| `token` | 令牌 | 圣火令（`eq_shenghuoling`） |
| `misc` | 其他（算盘、铁牌、渔网等） | |

### 6.3 空手与持械

| 主手状态 | 兵器栏 | 拳掌/指/擒拿 `Mod_armed` | 腿法 `Mod_armed` |
|---|---|---|---|
| 空手（主手为空或 `unarmed` 类护手兵器，如拳套/指虎） | **不可用** | 1.00 | 1.00 |
| 单手兵器 | 匹配的兵器武学可用 | 0.90 | 1.00 |
| 双手兵器（design/10 标注 `twoHanded`：多数棍、枪、重剑） | 同上 | 0.80 | 1.00 |

- 武学可标 `special.armedOK: true` 免除持械降效（如"左掌右剑"类原创扩展武学）。
- 兵器栏"不可用"时：该栏武学的 `layerStats` 与 `scope: unit` 被动也不生效（它们依托兵器）；**套装计件仍计**（§6.5）。
- 内功、轻功、暗器、杂学与主手状态无关。

### 6.4 切换武器的代价（战斗中）

| 操作 | 行动占用 | 收招 | 限制 |
|---|---|---|---|
| 主/副手互换（副手为兵器时） | 附加动作（不占行动） | +150 | 每次行动 1 次 |
| 收兵/弃兵转空手 | 附加动作 | +0 | 弃兵：兵器落于脚下格，可拾回 |
| 从行囊取出兵器装上 | 占用行动（仍可移动） | 800 | — |
| 拾取相邻格落地兵器 | 占用行动 | 800 | 敌人的兵器可拾取使用（战后归还/缴获由 design/10 定） |
| 被缴械（`weaponBreak` 标签 Buff，如 `bf_jiaoxie`） | — | — | 主手兵器落到随机相邻格，强制空手；免疫/抵抗按 Buff 品阶对抗 |

非战斗：自由切换，无代价。

### 6.5 套装件数统计（套装本体归 design/07）

1. 统计对象 = **装配中的武学** + **穿戴中的装备**（基准 §20）。
2. 每门武学对它 `setTags` 中列出的每个套装各计 1 件；同一武学不会对同一套装重复计件。
3. 辅运内功计件；兵器栏"不可用"的兵器武学**仍计件**（装配即计件，避免战斗中换兵时套装闪断）。
4. 外来武学照常计件；套装效果的品阶/数值如何受天道压制，由 design/07 定义。
5. 自创武学（§12）只继承 1 个 `setTags`。
6. 构建管线校验：design/07 的成员清单与武学 `setTags` 必须一致，不一致则构建失败（§15）。

---

## 7. 学习

### 7.1 学习途径（`learnSources[].type`）

| type | 途径 | 获得层 | 默认 `maxLayer`（`sourceCap`） | 可学品阶 | 说明 |
|---|---|---|---|---|---|
| `master` | 拜师/传授 | 1 | 10（NPC 所知不全时按条目） | 全部 | 需门派身份或羁绊任务（design/12）；可"喂招"（§8.4） |
| `manual` | 秘籍 | 1 | 全本 10；残本按条目 | 全部 | 物品 `it_miji_<武功拼音>`（**建议 ID 规则**，design/10 确认）；需阅读时间（§7.4） |
| `observe` | 观摩/偷学 | 1 | **6**（"有形无神"） | 仅 `observable: true`（天阶默认否） | §7.4；偷学门派武学有被发现风险（design/12） |
| `qiyu` | 奇遇 | 按事件 | 按事件 | 全部 | 奇遇池归 design/11 与各书界文档 |
| `puzzle` | 石壁/图谱/棋局解谜 | 1 | 按事件 | 全部 | §7.6 |
| `combo` | 合击领悟 | 1 | 10 | 合击类 | §7.7 |
| `pages` | 敌人掉落残页 | 1 | 随页数（§7.5） | 黄–地（天阶仅特例） | 物品 `it_canye_<武功拼音>`（**建议**） |
| `fragment` | 残篇重修 | 1 | 10 | 曾习得者 | 残篇规则归 design/02；本文只给加速接口（§7.9） |
| `fused` | 融会贯通自创 | 5 | 10 | ≤ 天中 | §12 |
| `inherit` | 传功 | 按事件 | — | 内功 | 只提升已有内功层数/内力（§8.4） |

**已习得武学再次获得途径**：不重复"习得"，只把 `sourceCap` 提升为各途径 `maxLayer` 的最大值；若为本书界原生途径且武学为外来，则触发本土印证（§7.8）。

### 7.2 学习流程

```
发现（图鉴"听闻/见识"）→ 满足硬门槛？──否→ 不可学（UI 显示缺少条件）
                         └是→ 软门槛不足？──是→ 弹出风险提示（§7.3），玩家确认
                                           └否→ 习得：layerReal=1, sxp=0, sourceCap=途径上限
                                                → 自动加入图鉴"习得"→ 若装配栏有空位，提示装配
```

### 7.3 门槛：硬门槛与软门槛

- **硬门槛**不满足 → 不可学（门派身份、前置武功、誓约、品德区间、属性上限）。
- **软门槛**不满足 → 可学，但每缺一项：
  - 该武学修炼速度 × 0.7（多项连乘，下限 × 0.3）；
  - 每次升层时判定走火入魔：`p = 0.05 × 缺项数 × (1 − wil/150)`，缺 1 项触发 1 级、≥ 2 项触发 2 级（§10）。
  - 软门槛后来被满足（属性成长、资质提升）→ 惩罚立即解除。

**配表指引：按大阶的标准门槛**（catalog 可在 ±10 内浮动）：

| 大阶 | 对应资质 | 关键先天属性 | 悟性 `wis` | 身份 / 品德 |
|---|---|---|---|---|
| 黄 | ≤ 20 | ≤ 20 | — | 多数无；门派入门拳剑需入门 |
| 玄 | 25–35 | 25–35 | — | 门派武学需入门弟子 |
| 地 | 40–50 | 40–50 | ≥ 40 | 门派核心武学需职级；邪派武学 `morality ≤ −20`（软） |
| 天 | 55–65 | 50–60 | ≥ 50 | 多为硬门槛：传承、誓约、奇遇、特定品德 |

### 7.4 秘籍阅读与观摩偷学

**秘籍阅读**（在安全点进行，可分次）：

```
阅读天数 = ceil( 2 × GF(g) × 80 / (wis + 30) )
```

| 悟性 | 黄下 | 玄中 | 地上 | 天上 |
|---|---|---|---|---|
| 30 | 3 天 | 6 天 | 11 天 | 16 天 |
| 50 | 2 天 | 5 天 | 8 天 | 12 天 |
| 80 | 2 天 | 4 天 | 6 天 | 9 天 |
| 100 | 2 天 | 3 天 | 5 天 | 8 天 |

**观摩偷学**（战斗内，含敌方与友方施招）：

| 规则 | 值 |
|---|---|
| 条件 | 武学 `observable: true`；施招者在 5 格内且可见；观摩者未习得该武学 |
| 每次观摩领悟 | `Δinsight = round( wis/10 × (1 + lore/100) × (1.5 若已装配同子类且 ≥ 5 重的武学，否则 1) )` |
| 每场上限 | 同一武学每场计 3 次 |
| 习得阈值 | `insight ≥ 100 × GF(g)` → 以第 1 重习得，`sourceCap = 6` |
| 非战斗观摩 | 切磋、观战事件（design/12）每次计 3 次观摩 |
| 风险 | 偷学同行门派 NPC 的门派武学：每场 30% 被察觉 → 门派关系惩罚（design/12） |
| 原著例 | 张无忌在光明顶观空性神僧使龙爪手而学会（倚天，待考细节）→ 作为剧情事件：该战观摩领悟 × 10 |

例：悟性 60、武学常识 30 → 每次 8 点；玄中（阈值 210）约 27 次 ≈ 9 场；地中（340）约 43 次。

### 7.5 残页（`pages`）

| 大阶 | 全套页数 k | 1 页 | 2 页 | 3 页 | 4 页 | 5 页 | 6 页 | 7 页 | 8 页 |
|---|---|---|---|---|---|---|---|---|---|
| 黄 | 3 | 4 重 | 7 重 | 10 重 | | | | | |
| 玄 | 4 | 3 重 | 5 重 | 8 重 | 10 重 | | | | |
| 地 | 6 | 2 重 | 4 重 | 5 重 | 7 重 | 9 重 | 10 重 | | |
| 天（特例） | 8 | 2 重 | 3 重 | 4 重 | 5 重 | 7 重 | 8 重 | 9 重 | 10 重 |

- `sourceCap = ceil(10 × 已集页数 / k)`；第 1 页即可习得。
- 掉落：对应门派/类型的敌人，概率由 design/13（掉落品阶分布随武运）与 design/10 定义。
- 重复残页：转化为该武学 `sxp` + 10% × 当前 `ExpToNext`（未习得时保留在包内）。

### 7.6 解谜类（`puzzle`）

| 谜题类型 | 机制 | 原著对应 | 特殊门槛 |
|---|---|---|---|
| `stroke` 观形 | 把石壁文字当作经脉走向描线（小游戏） | 侠客岛石壁·太玄经（侠客行）：石破天不识字反而悟通 | **硬门槛 `lore ≤ 20`**，或处于"忘文"状态（书灵引导的冥想，**原创扩展**）；阅读注解只会增加 `lore`，不增加领悟 |
| `order` 排图 | 把经脉图按运行顺序排列 | 泥人经脉图·罗汉伏魔神功（侠客行） | `apInner ≥ 40` |
| `poem` 诗谜 | 数字→诗句→字 | 连城诀（唐诗剑谱）（连城诀） | `lore ≥ 30` 或 `art ≥ 30` |
| `chess` 棋局 | 棋局残局求解 | 珍珑棋局（天龙）：虚竹误打误撞，一子自填死路反开生路 | `chess` 高者提示多；也存在"反常一手"的非常规解 |
| `text` 读经 | 从经典文字中悟武 | 庖丁解牛掌（书剑）：陈家洛于玉峰秘洞读《庄子》而悟 | `wis ≥ 60` |

谜题的场景、交互与奖励数量归 design/11 与各书界文档；本文只规定它作为学习途径时的门槛与 `maxLayer`。

### 7.7 合击领悟（`combo`）

- 条件：主角与某队友羁绊 ≥ 3 级（羁绊等级归 design/12），双方满足该合击武学的前置（如玉女素心剑法：一人全真剑法 ≥ 5 重、一人玉女剑法 ≥ 5 重）。
- 触发：两人在战斗中执行合击（流程归 design/09）累计 5 次，再完成一次羁绊事件 → 双方同时习得。
- 代表：玉女素心剑法（天中）、夫妻刀法（地中）、天罡北斗阵（天下，需 7 人，由全真门派任务链给出）。

### 7.8 本土印证（外来 → 本土）

- 外来武学（`foreign = true`）若在当前书界通过**原生途径**（`master`/`manual`/`qiyu`/`puzzle`，且该书界在武学 `sourceChapters` 中）再次获得 → 本书界内 `foreign = false`，不再受品阶压制。
- 书眠后重新成为外来武学（下一书界需再次印证）。
- 例：易筋经带入笑傲（中武，压制 −2），完成少林线让方证大师传授 → 本书界恢复天上品。
- 这是"本书界习得的武功不受品阶压制"（基准 §3 规则 3）的自然推论；细则与限制由 design/02 定稿（见 §17）。

### 7.9 残篇重修（接口）

- 残篇的产生、记录与展示归 design/02。
- 本文接口：重修某残篇武学时，在 `layerReal` 回到残篇记录层数之前，所有来源的 `sxp` × 2（**建议值**）；学习门槛视为已满足软门槛（曾练过）。

---

## 8. 修炼

### 8.1 武学经验来源总览

| 来源 | 占比预期（高武书界） | 可突破闭关上限 | 可突破修为门槛 | 主要消耗 |
|---|---|---|---|---|
| 实战（§8.2） | 55%–65% | ✅ | ❌ | 战斗 |
| 闭关（§8.3） | 20%–30% | ❌（外功 7 重 / 内功 8 重） | ❌ | 游戏内时间、体力、盘缠 |
| 师父指点（§8.4） | 10%–15% | ✅ | ❌ | 门派贡献/好感、冷却 7 天 |
| 丹药（§8.5） | 5%–10% | 视物品 | ❌ | 物品 |
| 顿悟（§8.6） | 随机 | ✅ | "破障"结果可 | — |
| 强行冲关（§3.3） | — | — | ✅（1 重，有风险） | 走火入魔风险 |

**通用倍率**（作用于所有来源，丹药"固定值"除外）：

```
wisMult  = 0.5 + wis/100                 // 悟性 50 → 1.0；100 → 1.5；120 → 1.7
aptMult  = 0.6 + 0.8 × ap/100            // 资质 50 → 1.0；100 → 1.4；0 → 0.6
bonusMult = 1 + Σ加成（图鉴、残篇重修 +100%、易筋经大成 +15%、九阳触类旁通 +25% …），上限 3.0
softPenalty = 0.7^缺项数（下限 0.3）       // §7.3
```

### 8.2 实战经验（按使用分配）

**经验池**：

```
P = Σ_敌 sxpVal(敌等级) × 类型系数 × 等级差系数
sxpVal(L) = round(10 + 3.3 × L)
类型系数：普通 1 / 精英 3 / Boss 10
等级差系数：敌等级 ≥ 我方显示等级 − 10 → 1.0；低 11–20 级 → 0.3；低 > 20 级 → 0
```

| 敌等级 | 1 | 10 | 20 | 30 | 35 | 44 | 50 | 60 | 70 |
|---|---|---|---|---|---|---|---|---|---|
| sxpVal | 13 | 43 | 76 | 109 | 126 | 155 | 175 | 208 | 241 |
| 4 名普通敌人的池 | 52 | 172 | 304 | 436 | 504 | 620 | 700 | 832 | 964 |

**分配**（每名我方单位各自获得一整份 P，用于其自己的武学，队友不分摊）：

| 份额 | 占 P | 条件 |
|---|---|---|
| 主运内功 | 20% | 装配即得 |
| 每门辅运内功 | 8% | 装配即得 |
| 轻功 | 5% | 本场移动 ≥ 3 次 |
| 攻击池 | 59% | 按"使用次数"在本场用过的武学间分配：普通招式 1 次、绝招 3 次、触发招式 0.5 次、暗器与杂学主动招式 1 次 |
| 未用份额 | — | 空栏/未触发份额并入攻击池；若本场没有任何攻击使用则并入主运 |

单门武学所得：`gain = 份额 × wisMult × aptMult × bonusMult × softPenalty`，且**单场上限 = 1 × 该武学当前 `ExpToNext`**（一场战斗最多升 1 重；顿悟除外）。未装配的武学不获得实战经验。

**例**：天龙中期，主角显示 Lv 30，悟性 60（1.1）、拳掌资质 70（1.16），击败 4 名 Lv 30 敌人（P = 436）。本场降龙十八掌用了 3 次、太祖长拳 1 次、绝招 0 次：攻击池 = 436 × 59% = 257 → 降龙 3/4 = 193 → × 1.1 × 1.16 = **246 sxp**。降龙在第 3 重（升 4 重需 1,320）约需 5–6 场。

### 8.3 闭关

| 规则 | 值 |
|---|---|
| 地点 | 客栈/门派居所 1.0；洞府/寺观 1.2；灵地（瀑布、雪峰、古墓等，design/11 标注 `seclusionSpot`）1.5 |
| 每日收益 | `C(L) × wisMult × aptMult × 地点系数`，`C(L) = 60 + 6 × 显示等级`（Lv 30 → 240/日） |
| 目标 | 主修 1 门（100%）＋可选兼修 1 门（50%）；内功作主修时 × 1.3 |
| 消耗 | 每日 1 天游戏时间、体力 `sta` −40（体力不足须休息）、盘缠（经济归 design/12） |
| 递减 | 单次闭关第 6 天起每日收益 × 0.8 |
| 上限 | 闭关只能把外功修到 7 重、内功修到 8 重（`inner.seclusionCap` 可覆写，如易筋经 10）；更高须"实战印证" |
| 心魔 | 每日 `p = 0.01 × (1 − wil/120)`（阴阳相冲组合 × 2）→ 走火入魔 1 级；被世界事件打断（伏击等，design/11）→ 立即出关，30% 走火入魔 2 级 |
| 顿悟 | 每日 `0.5% + max(0, wis − 50) × 0.02%` 触发 §8.6 |
| 开放世界代价 | 时间流逝会推进限时任务与昼夜天气（design/11/12），这是闭关的真正成本 |

### 8.4 师父指点与传功

| 项 | 规则 |
|---|---|
| 条件 | 师父 NPC 该武学层数 ≥ 你的真实层数 + 1（或为该派掌门级）；师徒关系或好感达标（design/12） |
| 收益 | `0.30 × ExpToNext(g, 当前层) × (1 + 好感/200)`（好感 0–100） |
| 冷却 | 每位师父 7 天（游戏内）一次 |
| 代价 | 门派贡献（门派内）或礼物/委托（门派外），数额归 design/12 |
| 喂招 | 与师父切磋战斗：该武学本场实战份额 × 2，且无视"单场上限"一次 |
| 突破 | 可突破闭关上限，不能突破修为门槛 |
| 传功（`inherit`） | 一次性剧情奇遇：主运内功真实层数 +1～+3（不超过修为门槛与 `sourceCap`），并给予永久 mpMax 加成（数值归 design/03）。原著例：无崖子以毕生功力传虚竹（天龙）。 |

### 8.5 丹药与物品接口（物品本体归 design/10）

```yaml
sxpGrant:
  target: mainInner | anyInner | equipped | category:unarmed | skill:sk_xxx
  mode: pctNext | flat          # pctNext = 当前 ExpToNext 的百分比
  value: 0.4
  breakSeclusionCap: false
sxpBuff:
  mult: 1.3                     # 计入 bonusMult
  duration: { battles: 10 }     # 或 { days: 3 }
```

- `pctNext` 类不受单场上限，但同一武学同一书界内经丹药获得的层数 ≤ 2（防嗑药速成）。
- 例（建议，design/10 定）：少林大还丹 → `mainInner, pctNext 0.4`（原著少林有"大还丹"，待考具体书目）；一般补气丹 → `sxpBuff 1.2 × 5 场`。

### 8.6 顿悟（悟性触发）

**触发**：每场战斗结束，对每门本场使用过的武学判定：

```
p = 0.5% + max(0, wis − 50) × 0.04% + lore × 0.005%
特殊情境 × 5：以弱胜强（敌方平均等级 ≥ 我方 + 5）、濒死得胜（结束时 hp < 10%）、首次击败某 Boss、在"观景点"作战（design/11 标注）
上限 10%
```

**结果**（加权随机）：

| 权重 | 结果 | 效果 |
|---|---|---|
| 55% | 豁然开朗 | 该武学 `sxp` + 50% × 当前 `ExpToNext`（无视单场上限，不破修为门槛） |
| 20% | 悟招 | 解锁该武学一个 `hiddenMoves`；没有则改判"豁然开朗" |
| 15% | 资质精进 | 该武学对应资质 +1（每门武学每书界限 1 次，资质上限 100） |
| 10% | 破障 | 下一次升层无视修为门槛一次（无走火风险） |

**剧情顿悟**：各书界文档可设计固定顿悟事件（如观瀑、观潮、观星），直接给出上表任一结果或专属隐藏招式；原著情节须注明出处，无出处者标"原创扩展"。

---

## 9. 特殊武学规则

### 9.1 代价型武学

代价型武学以 `special.cost` 声明代价，所有代价在习得前完整展示（图鉴与学习确认框），不存在"隐藏的坑"。

#### 9.1.1 七伤拳 `sk_qishangquan`（地上，崆峒派，倚天）——"先伤己，后伤人"

原著依据：崆峒派绝学，一拳之中蕴含七股不同劲力；内力不足者练之先伤自身脏腑（谢逊因此受损）；张无忌以九阳神功为根基则无碍（倚天，细节待考）。

| 规则 | 值 |
|---|---|
| 伤己 | 每次使用七伤拳招式，自身叠加 `bf_qishang`（七伤，`injury` 标签，每层 hpMax −2%，上限 7 层；战斗外每日消退 1 层） |
| 免伤条件 | 主运内功 `effGrade ≥ 10` → 不叠加；主运 7–9 → 50% 叠加；装配中有九阳神功或易筋经且 ≥ 5 重 → 不叠加 |
| 七伤满 | 达到 7 层 → 立即走火入魔 2 级（§10），七伤降为 3 层 |
| 修炼代价 | 主运品阶 < 10 时每升 1 重：永久 hpMax −1%（记为 `scar_qishang`，累计上限 −7%）；九阳神功或易筋经练到 10 重时自动痊愈 |
| 收益 | 招式预算按"自损"加成（§4.2）：每次伤己等效 `hpCost 2%` → +0.12；"七劲"：每段命中随机附带七种劲力效果之一 |

"七劲"效果表（劲力名为**原创扩展**，"七股劲力"本身为原著设定）：

| 劲 | 效果（Buff 归 design/06） | 概率 |
|---|---|---|
| 刚劲 | `bf_pojia` 破甲 2 回合 | 1/7 |
| 柔劲 | `bf_jiansu` 减速 2 回合 | 1/7 |
| 阴劲 | `bf_hanqi` 寒气（`cold`）2 回合 | 1/7 |
| 阳劲 | `bf_zhuoshao` 灼烧（`heat`）2 回合 | 1/7 |
| 吞劲 | 吸取目标 5% mpMax | 1/7 |
| 吐劲 | 击退 1 格 | 1/7 |
| 闭劲 | `bf_fengxue` 封穴 1 回合 | 1/7 |

```yaml
special:
  cost:
    selfBuff: { id: bf_qishang, perUse: 1, max: 7, onMax: { zouhuo: 2, resetTo: 3 } }
    immuneIf: [ { mainInnerEffGradeGte: 10 }, { equippedAny: [sk_jiuyang, sk_yijinjing], layerGte: 5 } ]
    halfIf: [ { mainInnerEffGradeGte: 7 } ]
    trainScar: { perLayer: { hpMaxPct: -1 }, cap: -7, healedBy: [ { skill: sk_jiuyang, layer: 10 }, { skill: sk_yijinjing, layer: 10 } ] }
  fusible: false
```

#### 9.1.2 九阴白骨爪 `sk_jiuyinbaigu`（地上，射雕/倚天）——邪练与改修

原著依据：黑风双煞误解《九阴真经》中"五指发劲，无坚不破，摧敌首脑，如穿腐土"等语而走上邪路（射雕，引文待考逐字）；倚天中周芷若亦使此功。正法为九阴神爪（`sk_jiuyinshenzhao`，天下，基准 §13）。

| 规则 | 值 |
|---|---|
| 习得 | 硬门槛 `morality ≤ −20`，或触发射雕奇遇"误读真经"（**原创扩展**，由 chapters/02 设计） |
| 邪练 | 所有来源 `sxp` × 1.5；每升 1 重 `morality −5`；每次升层走火判定 8%（1 级） |
| 邪气 | 装配时持有 `bf_xielian`（机制类，装配即生效，卸下即消失）：`resMind −15%`；正派 NPC 初见好感 −10（design/12） |
| 收益 | 本武学招式无视外功防御 15% → 30%（Z2）；对 hp < 50% 的目标暴击 +15（Z0/Z6 判定归 design/04） |
| 改修正法 | 前置：九阴真经（`sk_jiuyin`）≥ 3 重、`wis ≥ 60`、完成"正本清源"事件（**原创扩展**）→ 九阴白骨爪转为九阴神爪，`layerReal = floor(0.6 × 原层)`，清除邪气，`morality +10`；此后二者互斥 |
| 表现 | 游戏化处理为"以邪法速成的阴毒爪功"，不渲染骷髅练功等血腥画面 |

#### 9.1.3 吸星大法 `sk_xixing`（天中，日月神教，笑傲）——异种真气反噬

原著依据：任我行所创（或所传），吸取他人内力为己用，但所吸各家真气驳杂难以融合，终为大患；令狐冲亦深受其苦，少林方证欲以易筋经为其化解（笑傲，细节待考）。

| 规则 | 值 |
|---|---|
| 吸取 | 招式"吸星"：近身，伤害 + 吸取目标内力（= 伤害 × 30%，不超过目标当前内力）；被动"反吸"：被拳脚或 `wIn ≥ 0.5` 的近身招式命中时吸取攻方 3% mpMax |
| 异种真气 | 每吸取量达自身 mpMax 的 5% → `bf_yizhongzhenqi` +1 层（上限 20）；战后保留，战斗外每日自然消退 1 层 |
| 反噬（自身回合开始判定） | ≥ 10 层：10% 走火 1 级；≥ 15 层：20% 走火 2 级；20 层：30% 走火 3 级 |
| 化解 | 易筋经 ≥ 5 重（辅运亦可，`auxMode: full`）：每回合 −2 层（10 重 −5 层）；北冥神功作主运：每层转化为 2% 当前内力并移除，不反噬（**原创设定**）；行动"运功化解"：−3 层、耗内 10%；闭关 1 日 −5 层 |
| 品德 | 习得时 `morality −10`；正派门派对持有者警惕（design/12） |

#### 9.1.4 葵花宝典 `sk_kuihua` / 辟邪剑法 `sk_bixie`——"断尘之誓"

原著依据：两部秘籍首页皆以"自宫"为修练前提（葵花宝典"欲练神功，引刀自宫"、辟邪剑谱"武林称雄，挥剑自宫"，引文与归属待考逐字）；东方不败、岳不群、林平之皆因此性情大变。

**处理原则**：以"一个不可逆的重大抉择 + 永久代价"呈现；画面、文字均不描写身体伤害，只以原著引文 + 水墨淡出 + 书灵独白暗示；UI 中该抉择统一称为 **"断尘之誓"**（`vow_duanchen`，**原创扩展**命名，意为斩断尘缘）。

| 步骤 | 内容 |
|---|---|
| 1. 得书 | 获得葵花宝典（笑傲主线/支线）或辟邪剑谱（袈裟） |
| 2. 阅卷 | 显示原著首页引文；书灵现身劝阻，说明全部永久代价 |
| 3. 抉择 | 三选一：弃卷 / 思量 / 立誓；选"思量"进入 3 天（游戏内）冷静期，期间可随时放弃 |
| 4. 立誓 | 冷静期后才可立誓；二次确认界面逐条列出代价；确认后不可撤销（自动存档前，提示玩家另存） |

**永久代价**（全游戏、跨书界生效）：

| # | 代价 | 实现 |
|---|---|---|
| 1 | 情缘永绝 | 所有情缘/伴侣类羁绊线（design/12）永久关闭；已有伴侣转为"挚友"并触发告别事件；以情缘为条件的合击（design/09）不可用 |
| 2 | 心性偏执 | 永久 `bf_duanchen`（机制类，不可驱散）：`resMind −15%`、`healRecv −10%`、受心神类 Buff 持续 +1 |
| 3 | 叙事改变 | 书灵对白、后续书界部分 NPC 反应与结局文本变体（design/13） |

**收益**：
- 葵花宝典（天中内功，阴）：**硬门槛 `vow: vow_duanchen`**；内功贡献以 `agi` 与 `spd` 为主，特有"鬼魅身法"类被动；运功招式可以绣花针为投射物（原著东方不败以绣花针为兵刃）。
- 辟邪剑法（天下剑法）：立誓者为真本；**未立誓者只能得其形**——`effGrade` 按玄中（5）计算、`special.layerCap = 5`（原著中林家后人只传剑招，威力平平），不触发走火入魔。

```yaml
# 辟邪剑法 special 片段
special:
  vowGate:
    vow: vow_duanchen
    without: { gradeOverride: 5, layerCap: 5, note: 有形无实 }
  fusible: false
```

### 9.2 互斥、相冲、相克、相生（`conflicts`）

| type | 含义 | 规则 |
|---|---|---|
| `exclusive` 互斥 | 不能同时装配 | 已习得 A（≥ 3 重）再学 B：学习时走火判定 `p = 0.30 × (1 − wil/150)`，2 级 |
| `clash` 相冲 | 可同时装配但互相拖累 | 双方招式倍率 −10%（或条目指定）；内功间的阴阳相冲走 §5.4 |
| `counter` 相克 | 一方克制另一方的效果 | 免疫/增伤/化解，条目指定 |
| `synergy` 相生 | 同时装配有小幅加成 | 单条 ≤ +8%（更大的组合加成应做成套装，归 design/07） |

**已定条目**：

| A | B | type | 规则 | 依据 |
|---|---|---|---|---|
| 北冥神功 `sk_beiming` | 化功大法 `sk_huagong` | `exclusive` | 一纳一化，经脉走向相反 | 二者同出逍遥一脉而路数相反（原著渊源待考） |
| 北冥神功 | 吸星大法 | `synergy` + 化解 | 北冥作主运时吸星不产生反噬（§9.1.3） | **原创设定**（二者渊源待考） |
| 九阳神功 | 玄冥神掌寒毒 | `counter` | 九阳 6 重起免疫品阶 ≤ 自身的 `cold` Buff | 张无忌以九阳真气驱除玄冥寒毒（倚天） |
| 易筋经 | 吸星大法 | `counter` | 化解异种真气 | 方证欲以易筋经为令狐冲化解（笑傲，待考） |
| 易筋经 / 九阳神功 | 七伤拳 | `counter` | 七伤拳不伤己 | §9.1.1 |
| 九阴白骨爪 | 九阴神爪 | `exclusive` | 改修后互斥 | §9.1.2 |
| 任意阳性内功 | 任意阴性内功 | `clash`（内功间） | §5.4，可被桥接消除 | 本作设定 |
| 铁砂掌 `sk_tieshazhang` | 绵掌 `sk_mianzhang` | `clash` | 刚柔相冲，双方 −10% | **原创扩展**示例 |

### 9.3 组合武学

#### 9.3.1 双人合璧：玉女素心剑法 `sk_suxin`（天中）

原著依据：古墓派玉女剑法与全真剑法招招相克，二人分使、心意相通时合为玉女素心剑法（神雕）。

| 规则 | 值 |
|---|---|
| 角色 | 学习者按前置分为 `quanzhen` 位（全真剑法 ≥ 5 重）与 `yunv` 位（玉女剑法 ≥ 5 重）；两位缺一不可 |
| 学习 | 合击领悟（§7.7）：主角与队友羁绊 ≥ 4（任意类型），各占一位 |
| 合璧状态 | 两人都装配本武学、都持剑、相距 ≤ 2 格、都未被控制 → 本武学招式按全额威力；情缘类羁绊额外 +10%（Z3） |
| 独练 | 不满足合璧状态时 `Mod_special = 0.5` |
| 合璧绝招 | "双剑合璧"：发起者出招，搭档集气 −300 同时出招；合击伤害公式与时序归 design/09 |
| 左右互搏 | 装配左右互搏 ≥ 5 重者可一人合璧，`Mod_special = 0.8`（原著小龙女以左右互搏一人使出玉女素心剑法，神雕，对手待考） |
| 断尘之誓 | 立誓者失去情缘 +10%，其余不受影响 |

```yaml
special:
  combo:
    roles: { quanzhen: { prereq: sk_quanzhenjian, layer: 5 }, yunv: { prereq: sk_yunvjian, layer: 5 } }
    partnerSkill: sk_suxin
    bondMin: 4
    maxDistance: 2
    soloMult: 0.5
    romanceBonus: { zone: Z3, value: 0.10 }
    dualWieldSolo: { skill: sk_zuoyouhubo, layer: 5, mult: 0.8 }
  fusible: false
```

#### 9.3.2 左右互搏 `sk_zuoyouhubo`（天下，杂学·机制）

原著依据：周伯通所创，一心二用、双手各使一门武功；郭靖、小龙女心思纯一而学会，黄蓉聪明反不能学（射雕/神雕）。

| 规则 | 值 |
|---|---|
| 装配 | 占 1 个杂学栏；把角色属性 `dualWield` 设为本武学有效层数（基准 §6） |
| 行动"分心二用" | 选择来自**两门不同武学**的两个非绝招招式（拳脚＋拳脚，或兵器＋拳脚；兵器＋兵器须副手持同类兵器），可指向不同目标（各自射程以当前位置计算）；依次结算 |
| 倍率 | 每招 `Mod_special = 0.55 + 0.03 × 层`（1 重 0.58 → 10 重 0.85） |
| 消耗 | 内力 = 两招之和；收招 = 两招较大者 + 150；两招各自进入冷却 |
| 限制 | 不可含蓄招、绝招；不可与"易运"同一行动 |
| 学习门槛 | 硬门槛 `wis ≤ 85`（`attrsMax`）；软门槛 `wil ≥ 50` |
| 修炼倍率 | 本武学以"纯一系数"代替悟性系数：`pureMult = clamp(0.4 + (wil − 0.5 × wis)/50, 0.2, 1.8)`（定力 80、悟性 40 → 1.6；定力 50、悟性 95 → 0.45） |

### 9.4 "破 X" 克制

**通用规则**（"破 X"是持有者身上的效果类 Buff，定义归 design/06；本文规定其数据来源与数值）：

| 项 | 规则 |
|---|---|
| 来源 | 武学被动授予（独孤九剑为主要来源；catalog 中其他武学也可授予单项破 X，品阶 ≤ 地上时单项数值 × 0.6） |
| 匹配 | 按**目标**的主武器类别或**来袭招式**的性质判定（下表） |
| 增伤 | 对匹配目标 Z5 +`poBonus(g, n) = (5 + 2g)% × L(n) / 1.5`（天上 10 重 29%，地上 10 重 23%，玄中 10 重 15%） |
| 破招架 | 匹配目标对持有者攻击的招架率 × `(1 − 0.30 − 0.03 × (n − 1))`（10 重 × 0.43；招架判定归 design/04） |
| 品阶对抗 | 目标带有品阶 ≥ 破 X 品阶的"无破绽"类效果（如太祖长拳 4 重被动）时，该破 X 对其无效（基准 §10） |

**独孤九剑九式与匹配条件**（原著所列兵刃为大意，逐字待考）：

| 式 | 招式 ID | 原著所破 | 游戏匹配条件 | 破 X Buff（建议 ID） |
|---|---|---|---|---|
| 总诀式 | `mv_dugu9_zongjue` | 总纲口诀，诸式变化之本 | — | — |
| 破剑式 | `mv_dugu9_pojian` | 天下各门各派剑法 | 目标主手 `sword` | `bf_pojian` |
| 破刀式 | `mv_dugu9_podao` | 单刀、双刀、柳叶刀、鬼头刀、大砍刀、斩马刀等 | `blade` | `bf_podao` |
| 破枪式 | `mv_dugu9_poqiang` | 长枪、大戟、蛇矛、齐眉棍、狼牙棒、白蜡杆、禅杖、方便铲等长兵刃 | `spear` 或 `staff` | `bf_poqiang` |
| 破鞭式 | `mv_dugu9_pobian` | 钢鞭、铁锏、点穴橛、拐子、蛾眉刺、匕首、板斧、铁牌、八角槌、铁椎等短兵刃 | `exotic` | `bf_pobian` |
| 破索式 | `mv_dugu9_posuo` | 长索、软鞭、三节棍、链子枪、铁链、渔网、飞锤流星等软兵刃 | `whip` | `bf_posuo` |
| 破掌式 | `mv_dugu9_pozhang` | 拳脚指掌上的功夫 | 目标空手/`unarmed`，或来袭招式为拳脚 | `bf_pozhang` |
| 破箭式 | `mv_dugu9_poanqi` | 诸般暗器（须先练听风辨器，待考） | 来袭为 `projectile` 或 `hidden` 招式 | `bf_poanqi` |
| 破气式 | `mv_dugu9_poqi` | 对付身具上乘内功的敌人 | 目标主运内功 `effGrade ≥ 7`、或目标 `shield > 0`、或来袭招式 `wIn ≥ 0.6` | `bf_poqi` |

---

## 10. 走火入魔

### 10.1 等级与表现（Buff 本体归 design/06，以下为本文对其效果的要求）

| 级 | 名称 | Buff（建议 ID） | 战斗中 | 战斗外 | 持续 |
|---|---|---|---|---|---|
| 1 | 内息紊乱 | `bf_neixiwenluan` | 回内 −50%；招式耗内 +20% | 闭关收益 −50% | 战斗中 3 回合；战斗外 1 日 |
| 2 | 经脉逆行 | `bf_jingmainixing` | 所有内功有效层数 −2（最低 1）；hpMax −10%；每回合开始 5% 僵直（失去本次行动） | 不能闭关、不能强行冲关 | 直至治愈；5 日后每日 `20% + wil/500` 自愈 |
| 3 | 走火入魔 | `bf_zouhuorumo` | 全战斗属性 −20%；每回合开始 `25% × (1 − resMind)` 失控（由 AI 接管，攻击最近单位、敌我不分，归 design/09） | 不能使用内功招式、不能闭关 | 不自愈；15 日未治愈 → 永久后遗症（随机一项先天属性 −2，每书界至多 1 次）并降为 2 级 |

- **品阶**：走火 Buff 的品阶 = 触发来源武学的有效品阶（多来源取高）。免疫与驱散遵循基准 §10 品阶对抗。
- **升级**：已处于 k 级时再次触发 ≤ k 级的走火 → 升为 k+1 级（上限 3）。
- **表现**：角色头像经脉纹路泛红（1 级）/逆流动画（2 级）/水墨晕散（3 级）；书灵出言提醒（UI 归 design/14）。

### 10.2 触发条件汇总

| 来源 | 概率 | 级 | 章节 |
|---|---|---|---|
| 阴阳相冲（每场开始） | `0.08 × (1 − wil/150)` | 1 | §5.4 |
| 软门槛不足时升层 | `0.05 × 缺项数 × (1 − wil/150)` | 1（≥ 2 项为 2） | §7.3 |
| 学习互斥武学 | `0.30 × (1 − wil/150)` | 2 | §9.2 |
| 强行冲关失败 | `1 − 成功率` | 2（缺等级 ≥ 10 时 3） | §3.3 |
| 闭关心魔 | 每日 `0.01 × (1 − wil/120)` | 1 | §8.3 |
| 闭关被打断 | 30% | 2 | §8.3 |
| 七伤满 7 层 | 必然 | 2 | §9.1.1 |
| 邪练升层 | 8% | 1 | §9.1.2 |
| 异种真气反噬 | 10% / 20% / 30% | 1 / 2 / 3 | §9.1.3 |
| 融会贯通完成 | `0.15 × (1 − wil/120)` | 2 | §12 |
| 心神类攻击附带 | 由 Buff 定义 | 1 | design/06 |
| 剧情脚本（大悲大怒等） | 脚本 | 任意 | chapters/* |

### 10.3 恢复

| 方式 | 1 级 | 2 级 | 3 级 | 代价 |
|---|---|---|---|---|
| 自然消退 | ✅ | 5 日后每日判定 | ❌ | 时间 |
| 战斗行动"运功调息" | 立即移除 | ❌ | ❌ | 本次行动 |
| 战斗外自疗（每日） | — | `10% + wil/300` | ❌ | 1 日，不能旅行 |
| 丹药（design/10） | 普通疗伤丹 | 高级丹药（如少林大还丹，建议） | 只能暂缓 5 日 | 物品 |
| 易筋经"洗髓"招式 | ✅ | ✅（品阶 ≤ 自身） | ❌ | 耗内、冷却 |
| 高人疗伤（NPC 服务） | ✅ | ✅ | ✅（唯一途径） | 3–7 日 + 委托/人情 |

**高人名单**（原著依据；各书界文档落实为具体 NPC 服务）：一灯大师以一阳指疗伤（射雕，为救黄蓉耗损功力）、少林方丈以易筋经（天龙/倚天/笑傲）、张无忌以九阳真气与医术（倚天）、胡青牛（倚天）、平一指（笑傲）、薛慕华（天龙）。

---

## 11. 武学图鉴（Codex）

### 11.1 收录规则

- 收录全部 `SkillDef`（`sk_basic` 除外）与玩家自创武学；**跨书界永久保存**。
- 每条目按状态显示：

| 状态 | ID | 触发 | 显示内容 |
|---|---|---|---|
| 未知 | `unknown` | 默认 | 剪影 + 大阶色；若同门派已有条目则显示门派 |
| 听闻 | `heard` | NPC 对话、书籍、传闻；`lore ≥ 20` 时全部天阶自动听闻；`lore ≥ 40` 时当前书界全部地阶自动听闻 | 名称、门派、大阶、简介首句、习得线索（模糊） |
| 见识 | `seen` | 战斗中见过其任一招式 | + 已见招式名、范围模板、性质；战斗中该武学招式显示精确范围预警 |
| 习得 | `learned` | 习得 | 全字段、真实/有效层数、下一重解锁、天道封印说明 |
| 大成 | `mastered` | 真实层数 10 | 金框、大成插画 |
| 残篇 | `fragment` | 书眠遗忘（规则与样式归 design/02） | 残卷样式、记录层数、"再遇加速"提示 |

- 残篇条目仍计入"见识/习得"的累计里程碑（已发生过的事实不被书眠抹去）。

### 11.2 收集奖励（合计上限：图鉴对 `bonusMult` 的贡献 ≤ +20%）

| 里程碑 | 奖励 |
|---|---|
| 见识 30 / 80 / 150 / 250 / 400 门 | 武学常识 `lore` +2 / +3 / +4 / +5 / +6（合计 +20） |
| 习得 20 / 50 / 100 / 150 门 | 观摩领悟 +10% / +10% / +15% / +15% |
| 门派谱：习得某门派图鉴中全部黄/玄/地武学 | 称号；该门派武学修炼 +10%（计入 `bonusMult`）；门派好感（design/12） |
| 天阶习得 5 / 10 / 20 / 30 门 | 5：天阶条目显示可习得书界；10：残篇重修加速额外 +25%；20：书眠携带界面标注"下一书界可本土印证"的武学；30：称号"天下武学" |
| 大成 5 / 15 / 30 门 | 顿悟概率 +0.5% / +0.5% / +1% |

---

## 12. 融会贯通（原创扩展）

> 后期可选系统：把两门已满层的武学熔铸为一门自创武学。核心价值是**携带压缩**——中武/低武书界只能带 2/2/2、1/1/1，把两门武学合为一门就能多带一份心血。

### 12.1 开启条件

| 条件 | 值 |
|---|---|
| 进度 | 已取得第 4 本天书（倚天结束之后） |
| 属性 | 硬门槛 `wis ≥ 75`、`lore ≥ 60` |
| 场所 | 灵地闭关 7 日（§8.3 地点） |
| 材料 | 两门真实层数 = 10 的武学 A、B |

### 12.2 材料限制

| 限制 | 规则 |
|---|---|
| 同大类 | 内功＋内功、拳脚＋拳脚、兵器＋兵器（兵器须同一兵器类别） |
| 禁止 | `special.fusible: false`（代价型、合璧、左右互搏、誓约武学等）；自创武学不能再作材料 |
| 性质 | 相同 → 保留；一方中性 → 取另一方；一阳一阴 → 须主运为调和，结果为调和；一方调和一方阴/阳 → 玩家二选一 |

### 12.3 产物

| 项 | 规则 |
|---|---|
| 品阶 | `min(gA, gB) − 1`，**上限 9（地上）**（基准 §4：天级只收原著武学） |
| 初始层数 | 真实层数 5，`sourceCap 10`，经验曲线按产物品阶 × 1.2 |
| 招式 | 从 A、B 的普通招式中选至多 `moveSlots` 个（每招 `power × 0.95`，其余字段保留）＋至多 1 个绝招 |
| 被动 | 从 A、B 中选 2 个；机制类被动仅当 A、B 品阶均 ≥ 10 时可选 |
| 套装 | 只继承 1 个 `setTags` |
| 内外比例 | `wOut`/`wIn` 取平均（步长 0.05 取整） |
| 内功贡献 | 各字段取 A、B 较大值后，按产物品阶的 IP 预算整体缩放（§5.5） |
| 材料 | A、B 被消耗，转为残篇（标记"已融入 <自创名>"，design/02 展示）；日后可重新习得 |
| 命名 | 玩家命名（≤ 6 字）；ID `sk_zichuang01`–`sk_zichuang03` |
| 外来压制 | 按基准 §3 照常受压制（提案见 §17 P-3） |

### 12.4 数量与风险

- 全游戏至多 3 门自创武学，每个大类（内功/拳脚/兵器）至多 1 门；每书界至多进行 1 次融会贯通（替换旧自创者，旧者转为残篇）。
- 完成时走火判定 `0.15 × (1 − wil/120)`（2 级），武学照常生成。
- **平衡检验**：独孤九剑（天上）＋玄铁剑法（天中）→ 地上（9）剑法，5 重起步；在低武书界它与降龙十八掌同受 −4 压制，但一个兵器携带位承载了两门武学的精华招式。降龙十八掌＋太祖长拳 → 黄中（2），系统自然惩罚"凑数"。

---

## 13. 完整示例武学

> 9 门示例覆盖：天上掌法（降龙十八掌）、天上剑法（独孤九剑）、天上内功 ×2（易筋经、九阳神功）、黄上"人强则强"（太祖长拳）、玄阶（全真剑法）、地阶（龙爪手）、黄阶入门（罗汉拳），以及 §2.8 的铁砂掌（玄中）。
> 招式效果设计为**原创扩展**（原著只给招名与意象）；招名出处有疑者标"待考"。所有 `power` 已按 §4.2 预算公式核算，核算过程写在行尾注释。

### 13.1 降龙十八掌 `sk_xianglong18`（天上 · 拳脚·掌 · 丐帮）

**招名核对**：十八掌名采用通行列表：亢龙有悔、飞龙在天、见龙在田、鸿渐于陆、潜龙勿用、利涉大川、突如其来、震惊百里、或跃在渊、双龙取水、鱼跃于渊、时乘六龙、密云不雨、损则有孚、龙战于野、履霜冰至、羝羊触藩、神龙摆尾。多数名目见于《射雕》洪七公授郭靖诸回，名目多取自《易经》卦爻辞；**逐字出处与传授顺序待考**（尤其"鱼跃于渊""双龙取水""突如其来"三式在修订版正文中的出现位置）。另：新修版《天龙》有"降龙廿八掌"删繁为十八掌之说，本作以修订版为基线，不采用。

```yaml
id: sk_xianglong18
name: 降龙十八掌
category: unarmed
subType: fist
grade: 12
origin: canon
sect: sect_gaibang
lineage: 丐帮历代帮主（萧峰 … 洪七公 → 郭靖）
sourceChapters: [ch01_tianlong, ch02_shediao, ch03_shendiao, ch04_yitian]
canonRef: 天龙（萧峰）；射雕（洪七公授郭靖）；神雕；倚天（丐帮仅存残缺，待考）
nature: yang
wOut: 0.45
wIn: 0.55
reqs:
  attrs: { str: 55, con: 50 }
  aptitude: { apFist: 55 }
  morality: { min: 10 }
  hard: [morality]
layerStats: { defOut: [2, 8], resCC: [2, 12] }          # 合计 20（天阶上限）
moveSlots: 5                                             # 10 重"降龙大成"后 6
layers:
  - { n: 1,  unlock: [mv_xianglong18_kanglong, mv_xianglong18_jianlong, ps_xianglong18_gangmeng] }
  - { n: 2,  unlock: [mv_xianglong18_qianlong, mv_xianglong18_hongjian] }
  - { n: 3,  unlock: [mv_xianglong18_lishe, mv_xianglong18_turu, ps_xianglong18_longyin] }
  - { n: 4,  unlock: [mv_xianglong18_zhenjing, mv_xianglong18_huoyue] }
  - { n: 5,  unlock: [mv_xianglong18_shuanglong, mv_xianglong18_yuyue, ps_xianglong18_youyu] }
  - { n: 6,  unlock: [mv_xianglong18_feilong, mv_xianglong18_shicheng] }
  - { n: 7,  unlock: [mv_xianglong18_miyun, mv_xianglong18_sunze] }
  - { n: 8,  unlock: [mv_xianglong18_longzhan, mv_xianglong18_lvshuang, ps_xianglong18_zhigang] }
  - { n: 9,  unlock: [mv_xianglong18_diyang, mv_xianglong18_shenlong] }
  - { n: 10, unlock: [mv_xianglong18_lianhuan, ps_xianglong18_dacheng] }
moves:   # 天阶耗内基准 8%
  - { id: mv_xianglong18_kanglong,  name: 亢龙有悔, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 1, recovery: 1100, power: 1.20, parryable: true,
      buffs: [ {id: bf_liuli, chance: 1.0, dur: 1, grade: inherit, to: self, cond: notKill} ],
      note: "有悔：击杀则返还 50% 耗内；未击杀则得'留力'（下一降龙招式 +15%，Z3）" }      # 1+0.12+0.10+0.07=1.29 −0.10(自增益)≈1.20
  - { id: mv_xianglong18_jianlong,  name: 见龙在田, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_line, n: 2}, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1000, power: 0.80, parryable: true,
      displacement: {type: knock, n: 1} }                                                  # 0.85 −0.05
  - { id: mv_xianglong18_qianlong,  name: 潜龙勿用, unlock: 2, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.04, cd: 2, recovery: 700, power: 0,
      buffs: [ {id: bf_xuli, dur: 1, grade: inherit, to: self}, {id: bf_qianlong, dur: 1, grade: inherit, to: self} ],
      note: "蓄力：下一降龙招式 +40%（Z3）；至下次行动前受到伤害 −15%（Z4）" }
  - { id: mv_xianglong18_hongjian,  name: 鸿渐于陆, unlock: 2, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3}, delivery: melee, mpCost: 0.09, cd: 1, recovery: 1000, power: 1.05, parryable: true }  # 1+0.12+0.05 −0.10
  - { id: mv_xianglong18_lishe,     name: 利涉大川, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 4}, aoe: {tpl: aoe_line, n: 4}, delivery: ranged, mpCost: 0.09, cd: 1, recovery: 1000, power: 0.75, parryable: true,
      tags: [qigong], note: "掌风越过深水/浅水格不衰减" }                                   # 0.75×1.17×0.85
  - { id: mv_xianglong18_turu,      name: 突如其来, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 1, recovery: 750, power: 0.90, parryable: true,
      note: "若为本场自身首次出手：暴击 +20" }                                               # 1+0.12−0.05−0.175
  - { id: mv_xianglong18_zhenjing,  name: 震惊百里, unlock: 4, kind: attack, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_around}, delivery: melee, mpCost: 0.10, cd: 3, recovery: 1000, power: 0.85, parryable: true,
      buffs: [ {id: bf_xuanyun, chance: 0.3, dur: 1, grade: inherit, to: target} ] }      # §4.2 例
  - { id: mv_xianglong18_huoyue,    name: 或跃在渊, unlock: 4, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.05, cd: 2, recovery: 900, power: 0,
      displacement: {type: retreat, n: 2},
      trigger: {on: meleeAttacked, chance: 1.0, perRound: 1, counterPower: 1.00, expires: nextOwnAction} }
  - { id: mv_xianglong18_shuanglong, name: 双龙取水, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.30, hits: 2, parryable: true }  # 1+0.24+0.05
  - { id: mv_xianglong18_yuyue,     name: 鱼跃于渊, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap, splash: none}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.00, parryable: true,
      note: "跃起高差上限 jump+3；仰攻不受 Z7 低打高惩罚" }                               # 0.9×1.24 −0.10
  - { id: mv_xianglong18_feilong,   name: 飞龙在天, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap, splash: sq3}, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1050, power: 1.25, parryable: true,
      note: "主目标 1.25、溅射 ×0.5；自高处下击时 Z7 高低差加成 ×2" }                     # 0.9×1.51 −0.10 ≈1.26
  - { id: mv_xianglong18_shicheng,  name: 时乘六龙, unlock: 6, kind: attack, target: tile, range: {min: 1, max: 2}, aoe: {tpl: aoe_multi, n: 6, r: 2}, delivery: ranged, mpCost: 0.12, cd: 3, recovery: 1050, power: 1.30, hits: 6, parryable: true }  # 0.85×1.56（远程已含于乱击 AF）
  - { id: mv_xianglong18_miyun,     name: 密云不雨, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 3, recovery: 1000, power: 0.80, parryable: true,
      buffs: [ {id: bf_miyun, chance: 1.0, dur: 2, grade: inherit, to: target} ],
      note: "封绝：2 回合不能施放绝招；目标气势 −30" }                                   # 1.41 −0.40 −0.20
  - { id: mv_xianglong18_sunze,     name: 损则有孚, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, hpCost: 0.08, cd: 2, recovery: 1000, power: 1.70, parryable: true,
      note: "有孚：击杀目标时返还所损气血" }                                               # 1+0.48+0.24
  - { id: mv_xianglong18_longzhan,  name: 龙战于野, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, n: 3}, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1100, power: 0.90, parryable: true,
      displacement: {type: knock, n: 1} }                                                  # 0.65×1.58 −0.05
  - { id: mv_xianglong18_lvshuang,  name: 履霜冰至, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1000, power: 0.90, parryable: true,
      buffs: [ {id: bf_lvshuang, chance: 1.0, dur: 3, stacks: 1, grade: inherit, to: target} ],
      note: "履霜：每层速度 −5%（上限 4 层）；满 4 层时'冰至'：清空层数，追加一段 0.8 倍伤害并定身 1 回合" }
  - { id: mv_xianglong18_diyang,    name: 羝羊触藩, unlock: 9, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3}, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.05, parryable: true,
      buffs: [ {id: bf_dingshen, chance: 0.6, dur: 1, grade: inherit, to: target} ] }      # 1.29 −0.10 −0.15
  - { id: mv_xianglong18_shenlong,  name: 神龙摆尾, unlock: 9, kind: attack, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_sweep, facing: back}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 0.85, parryable: true,
      trigger: {on: backAttacked, chance: 0.5, perRound: 1, counterPower: 1.20},
      note: "主动：横扫身后三格；被动：遭背击时 50% 反身一掌" }                               # 0.75×1.12
  - { id: mv_xianglong18_lianhuan,  name: 十八掌连环, unlock: 10, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, n: 3}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.25, hits: 6, parryable: true,
      displacement: {type: knock, n: 2}, anim: {cutin: cutin/xianglong18},
      note: "（原创扩展命名）十八掌一气呵成：演出依次打出十八掌意象" }                     # 3.0×1.2×0.65 −0.10
passives:
  - { id: ps_xianglong18_gangmeng, name: 刚猛, unlock: 1, kind: stat, zone: Z2, value: [0.08, 0.20], scope: self, text: "降龙招式无视目标 {v} 外功防御" }
  - { id: ps_xianglong18_longyin,  name: 龙吟, unlock: 3, kind: trigger, trigger: {on: skillUsed, cond: differentMoveThanLast}, buff: {id: bf_longyin, stacks: 1, max: 5, grade: inherit, dur: 2}, zone: Z3, value: 0.04, scope: self,
      text: "连续使用不同的降龙掌：每层降龙招式伤害 +4%，至多 5 层" }
  - { id: ps_xianglong18_youyu,    name: 有余不尽, unlock: 5, kind: effect, value: {mpCostMult: 0.9, killRefund: 0.3}, scope: self, text: "降龙招式耗内 −10%；击杀时返还 30% 耗内（亢龙有悔为 50%）" }
  - { id: ps_xianglong18_zhigang,  name: 至刚至阳, unlock: 8, kind: stat, zone: Z0, value: 15, scope: self, cond: {mainInnerNature: yang}, text: "主运为阳时，降龙招式破招 +15" }
  - { id: ps_xianglong18_dacheng,  name: 降龙大成, unlock: 10, kind: mechanic, value: {cdMinus: 1, moveSlotsPlus: 1}, scope: self, text: "所有降龙招式冷却 −1（最低 0）；招式栏 +1" }
setTags: [set_gaibang_bangzhu]            # 建议 ID，套装本体归 design/07
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong,  ref: npc_xiaofeng,     maxLayer: 10, note: "与萧峰结义后的羁绊传授（原创扩展）" }
  - { type: master, chapter: ch02_shediao,   ref: npc_hongqigong,   maxLayer: 10, note: "以美食换武功（原著洪七公授郭靖情节的致敬）" }
  - { type: master, chapter: ch03_shendiao,  ref: npc_guojing,      maxLayer: 10, note: "襄阳线（原创扩展）" }
  - { type: manual, chapter: ch04_yitian,    ref: it_miji_xianglong18_can, maxLayer: 6, note: "丐帮残本：前十二掌（倚天丐帮帮主只会部分掌法，掌数待考）" }
special: { fusible: true }
observable: false
hiddenMoves: []
description: >-
  丐帮镇帮绝学，天下至刚至阳的掌法。十八掌名多出《易经》，发掌留有余力，"亢龙有悔"之"悔"字为
  全套精要。招式效果为本作原创设计。
```

### 13.2 独孤九剑 `sk_dugu9`（天上 · 兵器·剑 · 独孤求败→风清扬）

设计要点：九式中"破 X"八式由被动常驻（持有即得对应破 X），主动"破招"按钮自动解析为对应的破 X 式（`autoGroup`），手机上只占一个招式栏位。"有进无退"：本武学不提供招架，改为反击。

```yaml
id: sk_dugu9
name: 独孤九剑
category: weapon
subType: sword
grade: 12
origin: canon
sect: null
lineage: 独孤求败 → 风清扬 → 令狐冲
sourceChapters: [ch05_xiaoao]
canonRef: 笑傲（风清扬于华山思过崖授令狐冲）；神雕剑冢仅存剑意（不可习得本武学）
nature: neutral
wOut: 0.80
wIn: 0.20
reqs:
  attrs: { wis: 70 }
  aptitude: { apSword: 50 }
  morality: { min: 0 }
  hard: [morality]
layerStats: { counter: [5, 15], hit: [1, 5] }            # 合计 20
moveSlots: 5
weaponReq: { category: sword, altCategories: { unlockLayer: 9, categories: [staff, exotic], mult: 0.9 } }
layers:
  - { n: 1,  unlock: [mv_dugu9_zongjue, mv_dugu9_pojian, ps_dugu9_pojin, ps_dugu9_liaodi] }
  - { n: 2,  unlock: [mv_dugu9_podao] }
  - { n: 3,  unlock: [mv_dugu9_poqiang, ps_dugu9_youjin] }
  - { n: 4,  unlock: [mv_dugu9_pobian] }
  - { n: 5,  unlock: [mv_dugu9_posuo] }
  - { n: 6,  unlock: [mv_dugu9_pozhang] }
  - { n: 7,  unlock: [mv_dugu9_poanqi] }
  - { n: 8,  unlock: [mv_dugu9_poqi] }
  - { n: 9,  unlock: [ps_dugu9_yiwu] }
  - { n: 10, unlock: [mv_dugu9_wuzhao, ps_dugu9_wuzhao] }
moves:
  - { id: mv_dugu9_zongjue, name: 总诀式, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 0, recovery: 900, power: 0.90, parryable: true,
      buffs: [ {id: bf_duguyi, chance: 1.0, stacks: 1, max: 9, dur: 99, grade: inherit, to: self} ],
      note: "剑意：每层本武学暴击 +2，战斗内保留" }                                         # 1−0.05−0.07≈0.88
  # 破招组：UI 只显示一个"破招"按钮，按目标自动解析；条件不满足的式不可选
  - { id: mv_dugu9_pojian,  name: 破剑式, unlock: 1, autoGroup: dugu_po, condition: {targetWeapon: [sword]},          kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ] }        # (1+0.12+0.15)×0.85 −0.06
  - { id: mv_dugu9_podao,   name: 破刀式, unlock: 2, autoGroup: dugu_po, condition: {targetWeapon: [blade]},          kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ] }
  - { id: mv_dugu9_poqiang, name: 破枪式, unlock: 3, autoGroup: dugu_po, condition: {targetWeapon: [spear, staff]},   kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ], note: "近身贴打长兵：本招射程内无视长兵的'拒敌'效果" }
  - { id: mv_dugu9_pobian,  name: 破鞭式, unlock: 4, autoGroup: dugu_po, condition: {targetWeapon: [exotic]},         kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ] }
  - { id: mv_dugu9_posuo,   name: 破索式, unlock: 5, autoGroup: dugu_po, condition: {targetWeapon: [whip]},           kind: attack, target: enemy, range: {min: 1, max: 2}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.05, parryable: false,
      buffs: [ {id: bf_jiaoxie, chance: 0.3, dur: 1, grade: inherit, to: target} ] }       # 缴械替代破招
  - { id: mv_dugu9_pozhang, name: 破掌式, unlock: 6, autoGroup: dugu_po, condition: {targetWeapon: [unarmed]},        kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ] }
  - { id: mv_dugu9_poanqi,  name: 破箭式, unlock: 7, autoGroup: dugu_po, condition: {targetHasSkill: [hidden]},       kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      trigger: {on: projectileIncoming, chance: [0.35, 0.60], perRound: 2, effect: deflect, reflectFromLayer: 9, reflectPct: 0.5},
      note: "主动：对装配暗器者；被动：拨开来袭暗器（35%→60%），9 重起反射 50% 伤害" }
  - { id: mv_dugu9_poqi,    name: 破气式, unlock: 8, autoGroup: dugu_po, condition: {any: [{targetMainInnerEffGradeGte: 7}, {targetShieldGt: 0}]}, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 2, recovery: 1000, power: 1.25, parryable: false,
      note: "对护体真气伤害 ×2；无视目标 20% 内劲防御" }                                     # (1+0.24+0.10+0.15)×0.85 −0.02
  - { id: mv_dugu9_wuzhao,  name: 无招胜有招, unlock: 10, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1100, power: 3.00, parryable: false, counterable: false,
      cleanse: {side: target, tags: [stance, guard], count: 1, maxGrade: inherit}, anim: {cutin: cutin/dugu9} }   # 3.0×1.2×0.85 −0.07
passives:
  - { id: ps_dugu9_pojin,  name: 破尽天下, unlock: 1, kind: effect, zone: Z5, scope: unit,
      value: { grantsByLayer: {1: bf_pojian, 2: bf_podao, 3: bf_poqiang, 4: bf_pobian, 5: bf_posuo, 6: bf_pozhang, 7: bf_poanqi, 8: bf_poqi}, bonus: poBonus, parryMult: poParry },
      cond: { mainHandUsable: true },
      text: "持剑（9 重起含代剑之物）时获得已解锁的全部破 X（数值见 §9.4）" }
  - { id: ps_dugu9_liaodi, name: 料敌机先, unlock: 1, kind: trigger, trigger: {on: meleeAttacked, cond: attackerMatchesPoX, chance: [0.15, 0.35], perRound: 1, timing: beforeHit},
      text: "来袭者兵器为已破之类时，{v} 概率后发先至：在其命中前先行反击（总诀式 ×1.0）；反击致其死亡或受控则来招作废" }
  - { id: ps_dugu9_youjin, name: 有进无退, unlock: 3, kind: mechanic, scope: self,
      value: { parryFromSkill: 0, recoveryAfterCounter: -50 }, text: "本武学不提供招架；每次反击后本武学下一招收招 −50" }
  - { id: ps_dugu9_yiwu,   name: 以物代剑, unlock: 9, kind: mechanic, scope: self, text: "可持棍杖或奇门兵器施展本武学（威力 ×0.9）" }
  - { id: ps_dugu9_wuzhao, name: 无招, unlock: 10, kind: mechanic, scope: self,
      value: { immuneToPoX: true, uncounterable: true }, text: "本武学招式不受敌方任何破 X 克制、不可被反击" }
setTags: []
conflicts: []
learnSources:
  - { type: master, chapter: ch05_xiaoao, ref: npc_fengqingyang, maxLayer: 10, note: "思过崖事件链（与令狐冲同行或以华山弟子身份），chapters/05 定" }
special: { fusible: true }
observable: false
description: >-
  独孤求败所创、风清扬所传的剑法，"以无招胜有招"。总诀为本，八式分破剑、刀、枪、鞭、索、掌、箭、气，
  有进无退、后发先至。本作以"破 X"克制系统实现其精神。
```

### 13.3 易筋经 `sk_yijinjing`（天上 · 内功 · 少林）

设计要点：以"根基"定位——少攻击、强续航、化解一切"内伤与异气"，是其他武学（尤其代价型）的保险；辅运亦能化解异种真气。运功招式借用民间传统"易筋经十二势"之名（**原创扩展借名**，非金庸原著内容）。

```yaml
id: sk_yijinjing
name: 易筋经
category: inner
subType: inner
grade: 12
origin: canon
sect: sect_shaolin
lineage: 达摩祖师所传（少林）
sourceChapters: [ch01_tianlong, ch02_shediao, ch04_yitian, ch05_xiaoao]
canonRef: 天龙（游坦之误打误撞练成）；射雕/倚天（少林至宝，待考）；笑傲（方证欲传令狐冲）
nature: harmony
wOut: 0
wIn: 1
reqs:
  attrs: { wil: 70 }
  morality: { min: 20 }
  sect: { id: sect_shaolin, rank: 4 }
  hard: [sect, morality]
inner:
  contribution: { mpMaxPct: 56, hpMaxPct: 40, attrs: { con: 10, str: 4, wil: 8 }, mpRegen: 3.0, stats: { resInjury: 20 } }   # IP 155
  bridge: true
  seclusionCap: 10
  auxUsableMoves: []
moveSlots: 5
layers:
  - { n: 1,  unlock: [ps_yijinjing_yijin] }
  - { n: 3,  unlock: [mv_yijinjing_xisui, ps_yijinjing_famao] }
  - { n: 5,  unlock: [mv_yijinjing_weituo, ps_yijinjing_huayi] }
  - { n: 6,  unlock: [mv_yijinjing_daozhuai] }
  - { n: 7,  unlock: [ps_yijinjing_jingang] }
  - { n: 8,  unlock: [ps_yijinjing_baibing] }
  - { n: 10, unlock: [mv_yijinjing_huangu, ps_yijinjing_dacheng] }
moves:
  - { id: mv_yijinjing_xisui,   name: 洗髓, unlock: 3, kind: support, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.10, cd: 4, recovery: 900, power: 0,
      cleanse: {side: self, tags: [poison, injury, seal, cold, heat], count: all, maxGrade: inherit}, heal: {base: targetHpMax, pct: 0.10},
      note: "亦可移除品阶 ≤ 自身的走火入魔 1–2 级" }
  - { id: mv_yijinjing_weituo,  name: 韦陀献杵, unlock: 5, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.08, cd: 3, recovery: 800, power: 0,
      buffs: [ {id: bf_weituo, dur: 2, grade: inherit, to: self} ], note: "受到伤害 −25%（Z4），控制抗性 resCC +30" }
  - { id: mv_yijinjing_daozhuai, name: 倒拽九牛尾, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_pull, n: 2}, delivery: ranged, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.10, parryable: true, nature: harmony }   # 0.95×1.29 −0.10（气劲拉拽视作近身接触判定）
  - { id: mv_yijinjing_huangu,  name: 易筋换骨, unlock: 10, kind: support, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 2}, delivery: self, mpCost: 0, cd: 0, recovery: 1000, power: 0,
      cleanse: {side: allies, tags: all, count: 2, maxGrade: inherit, selfCount: all}, heal: {base: targetHpMax, pct: 0.35, selfOnly: true},
      buffs: [ {id: bf_wudi, dur: 1, grade: inherit, to: self} ],
      note: "（原创扩展命名）自身：驱散全部减益、回复 35% 气血与 50% 内力、无敌 1 回合；2 格内友方：各驱散 2 个减益" }
passives:
  - { id: ps_yijinjing_yijin,   name: 易筋, unlock: 1, kind: stat, value: {resInjury: [0.10, 0.30]}, scope: unit, auxMode: scaled }
  - { id: ps_yijinjing_famao,   name: 伐毛洗髓, unlock: 3, kind: effect, trigger: {on: turnStart}, value: {dispel: 1, tags: [poison, injury], maxGradeOffset: [-2, 0]}, scope: unit, auxMode: none,
      text: "每回合开始驱散 1 个品阶 ≤（本功有效品阶 −2，8 重起 −0）的中毒/内伤" }
  - { id: ps_yijinjing_huayi,   name: 化异种真气, unlock: 5, kind: effect, trigger: {on: turnStart}, value: {removeStacks: {buff: bf_yizhongzhenqi, n: [2, 5]}}, scope: unit, auxMode: full }
  - { id: ps_yijinjing_jingang, name: 金刚不坏之基, unlock: 7, kind: trigger, trigger: {on: hpBelow, cond: 0.30, perBattle: 1}, buff: {id: bf_hutizhenqi, value: {shieldPctHpMax: 0.15}, grade: inherit, dur: 3}, scope: unit, auxMode: none }
  - { id: ps_yijinjing_baibing,  name: 百病不侵, unlock: 8, kind: mechanic, value: {immune: [bf_neixiwenluan, bf_jingmainixing], maxGrade: inherit, resMind: 0.20}, scope: unit, auxMode: none }
  - { id: ps_yijinjing_dacheng, name: 易筋大成, unlock: 10, kind: mechanic, value: {sxpBonus: 0.15, auxRatioPlus: 0.10}, scope: unit, auxMode: none,
      text: "所有武学修炼 +15%；辅运比例 +0.10（上限 0.60）；闭关可至 10 重" }
setTags: [set_shaolin_jingang]
conflicts:
  - { with: sk_xixing, type: counter, note: 化解异种真气 }
  - { with: sk_qishangquan, type: counter, note: 七伤拳不伤己（≥ 5 重） }
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_shaolin_fangzhang, maxLayer: 10, note: "少林职级 4（执事）以上，方丈许可" }
  - { type: qiyu,   chapter: ch01_tianlong, ref: q_01_qiyu_yijin, maxLayer: 8, reqsOverride: { sect: null },
      note: "无心插柳：不求武功者偶得梵文经书（致敬游坦之情节，原创扩展）；需 wil ≥ 70 且从未主动询问易筋经" }
  - { type: master, chapter: ch05_xiaoao,   ref: npc_fangzheng, maxLayer: 10, note: "笑傲本土印证途径（§7.8）" }
special: { fusible: true }
observable: false
description: >-
  少林至高内功，易筋锻骨、洗髓伐毛，内力浑厚绵长，能化解各路异种真气与内伤。修习者须心无挂碍，
  求之愈切，得之愈难。
```

### 13.4 九阳神功 `sk_jiuyang`（天上 · 内功 · 阳）

设计要点："他强由他强，清风拂山岗；他横由他横，明月照大江"（原著九阳真经口诀）→ 对强敌减伤与反震；寒毒克星；"触类旁通"加速其他武学（原著张无忌凭九阳根基速成乾坤大挪移与太极，速度细节待考）。

```yaml
id: sk_jiuyang
name: 九阳神功
alias: [九阳真经]
category: inner
subType: inner
grade: 12
origin: canon
sect: null
lineage: 觉远 → 张三丰/郭襄/无色（各得部分）；张无忌得猿腹经书全本
sourceChapters: [ch04_yitian]
canonRef: 神雕末回觉远临终诵经（伏笔）；倚天张无忌于昆仑山谷白猿腹中得经
nature: yang
wOut: 0
wIn: 1
reqs:
  attrs: { con: 50 }
  aptitude: { apInner: 55 }
  hard: []
inner:
  contribution: { mpMaxPct: 60, hpMaxPct: 36, attrs: { con: 8, str: 6, wil: 6 }, mpRegen: 3.6, stats: { resCold: 20 } }   # IP 154
  seclusionCap: 8
  auxUsableMoves: [mv_jiuyang_liaoshang]
moveSlots: 5
layers:
  - { n: 2,  unlock: [ps_jiuyang_taqiang] }
  - { n: 3,  unlock: [mv_jiuyang_huti] }
  - { n: 4,  unlock: [ps_jiuyang_taheng] }
  - { n: 5,  unlock: [mv_jiuyang_liaoshang, ps_jiuyang_hutizhenqi] }
  - { n: 6,  unlock: [ps_jiuyang_hanbuqin] }
  - { n: 7,  unlock: [ps_jiuyang_shengsheng] }
  - { n: 8,  unlock: [ps_jiuyang_chulei] }
  - { n: 10, unlock: [mv_jiuyang_puzhao, ps_jiuyang_dacheng] }
moves:
  - { id: mv_jiuyang_huti, name: 九阳护体, unlock: 3, kind: support, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.12, cd: 3, recovery: 900, power: 0,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctHpMax: 0.15}, dur: 3, grade: inherit, to: self} ], cleanse: {side: self, tags: [cold], count: 1, maxGrade: inherit} }
  - { id: mv_jiuyang_liaoshang, name: 九阳疗伤, unlock: 5, kind: support, target: ally, range: {min: 0, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.14, cd: 3, recovery: 1000, power: 0,
      heal: {base: targetHpMax, pct: 0.18}, cleanse: {side: target, tags: [injury, cold], count: 2, maxGrade: inherit} }     # 标准治疗 18%；可作辅运使用
  - { id: mv_jiuyang_puzhao, name: 九阳普照, unlock: 10, kind: support, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 3}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 1.50,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctCasterHpMax: 0.20}, dur: 3, grade: inherit, to: allies} ], cleanse: {side: allies, tags: [cold, poison], count: 2, maxGrade: inherit},
      note: "（原创扩展命名）友方护盾与驱散；同时对周身八格敌人造成 1.5 倍内劲伤害（aoe_around，wIn 1）" }
passives:
  - { id: ps_jiuyang_taqiang,     name: 他强由他强, unlock: 2, kind: stat, zone: Z4, value: [0.08, 0.20], cond: {attackerAtkSumGtSelf: true}, scope: unit, auxMode: scaled }
  - { id: ps_jiuyang_taheng,      name: 他横由他横, unlock: 4, kind: effect, zone: settle, value: {reflectMeleePct: [0.05, 0.12], asInner: true}, scope: unit, auxMode: scaled }
  - { id: ps_jiuyang_hutizhenqi,  name: 九阳真气, unlock: 5, kind: trigger, trigger: {on: battleStart}, buff: {id: bf_hutizhenqi, value: {shieldPctHpMax: [0.08, 0.20]}, grade: inherit, dur: 99}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_hanbuqin,    name: 寒毒不侵, unlock: 6, kind: mechanic, value: {immuneTags: [cold], maxGrade: inherit}, scope: unit, auxMode: full }
  - { id: ps_jiuyang_shengsheng,  name: 生生不息, unlock: 7, kind: effect, value: {mpRegenMultWhenBelow: {mpPct: 0.20, mult: 2}}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_chulei,      name: 触类旁通, unlock: 8, kind: mechanic, value: {sxpBonus: {categories: [inner, unarmed, weapon], value: 0.25}, expCostMult: {skill: sk_qiankun, mult: 0.2}}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_dacheng,     name: 九阳大成, unlock: 10, kind: stat, zone: Z4, value: {innerDmgTaken: -0.10, poisonDurMult: 0.5}, scope: unit, auxMode: scaled }
setTags: []
conflicts:
  - { with: sk_xuanming, type: counter, note: 6 重起免疫玄冥寒毒（品阶 ≤ 自身） }
  - { with: sk_qishangquan, type: counter, note: 七伤拳不伤己（≥ 5 重） }
learnSources:
  - { type: qiyu, chapter: ch03_shendiao, ref: q_03_qiyu_jiuyangecho, maxLayer: 0, note: "闻经：图鉴'听闻'，并记 flag jiuyang_echo（倚天习得后 5 重前修炼 ×1.5，原创扩展）" }
  - { type: qiyu, chapter: ch04_yitian,   ref: q_04_qiyu_yuanfu,     maxLayer: 10, note: "昆仑山谷白猿腹中经书（原著）" }
special: { fusible: true }
observable: false
description: >-
  《九阳真经》所载内功，至刚至阳，内力生生不息，百脉通畅，寒毒不侵。"他强由他强，清风拂山岗"——
  对手越强，越难撼动其根基。
```

### 13.5 太祖长拳 `sk_taizuchangquan`（黄上 · 拳脚·拳 · 通行）——"招式平凡，人强则强"

原著依据：宋太祖所传、天下通行的寻常拳法；聚贤庄一役萧峰以太祖长拳应对群雄，平平无奇的招式在他手中威力无俦，群雄叹服（天龙，交手对象与招名细节待考）。

**核心规则"人强则强"**：本武学的品阶系数不取固定 G，而取

```
G_eff = max( G(effGrade), min( 2.40, 1.20 × (1 + 0.012 × max(0, 显示等级 − 10)) ) )
```

| 显示等级 | 10 | 20 | 30 | 35 | 44 | 50 | 60 | 70 |
|---|---|---|---|---|---|---|---|---|
| G_eff | 1.20（黄上） | 1.34 | 1.49 | 1.56（≈玄中） | 1.69 | 1.78（玄上+） | 1.92 | 2.06（≈地下） |

- 上限 2.40（地上），永远到不了天阶；不受外来压制影响（公式不依赖品阶），但显示等级本身被书界等级上限截断——低武书界 Lv 44、8 重时 `G_eff × L = 1.69 × 1.30 = 2.20`，约为"天上外来武学压成地中、8 重"（2.86）的 77%，而携带与修炼成本低得多，是衰败书界里可靠的"保底拳法"。
- 学习与修炼按黄上计价（便宜），10 重累计仅 6,120 sxp。

```yaml
id: sk_taizuchangquan
name: 太祖长拳
category: unarmed
subType: fist
grade: 3
origin: canonExpanded
sect: null
lineage: 宋太祖所传，军中与民间通行
sourceChapters: [ch01_tianlong, ch02_shediao, ch03_shendiao, ch04_yitian]
canonRef: 天龙·聚贤庄（萧峰），招名待考
nature: neutral
wOut: 0.80
wIn: 0.20
reqs: { hard: [] }
layerStats: { parry: [1, 3], hit: [1, 3] }                 # 合计 6（黄阶上限）
moveSlots: 3
layers:
  - { n: 1,  unlock: [mv_taizuchangquan_chongzhen] }
  - { n: 3,  unlock: [mv_taizuchangquan_qianli] }
  - { n: 4,  unlock: [ps_taizuchangquan_tangtang] }
  - { n: 6,  unlock: [mv_taizuchangquan_guanri] }
  - { n: 10, unlock: [ps_taizuchangquan_fanpu] }
moves:   # 黄阶耗内基准 5%
  - { id: mv_taizuchangquan_chongzhen, name: 冲阵斩将, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.05, cd: 1, recovery: 1000, power: 1.10, parryable: true,
      note: "招名待考" }                                                                     # 1+0.12
  - { id: mv_taizuchangquan_qianli,    name: 千里横行, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3, then: aoe_sweep}, delivery: melee, mpCost: 0.06, cd: 2, recovery: 1000, power: 0.85, parryable: true,
      note: "突进后横扫前方三格；招名待考" }                                                 # 0.75×1.29 −0.10 ≈0.87
  - { id: mv_taizuchangquan_guanri,    name: 长拳贯日, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.05, cd: 2, recovery: 1100, power: 1.30, parryable: true,
      note: "（原创扩展命名）" }                                                             # 1+0.24+0.07
passives:
  - { id: ps_taizuchangquan_tangtang, name: 堂堂正正, unlock: 4, kind: mechanic, value: {immuneToPoX: [bf_pozhang], parry: [5, 15]}, scope: self,
      text: "招式平正无破绽：本武学不受'破掌'克制（品阶对抗照常）；装配时招架 +{v}" }
  - { id: ps_taizuchangquan_fanpu,    name: 返璞归真, unlock: 10, kind: stat, value: {crit: 10, vsSameSkillLowerLevel: {zone: Z3, value: 0.15}}, scope: self,
      text: "暴击 +10；对同样使用太祖长拳且显示等级低于自己的对手伤害 +15%" }
special:
  gOverride: { formula: taizu, cap: 2.40, base: 1.20, perLevel: 0.012, fromLevel: 10 }
  fusible: true
setTags: []
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_generic_jiaotou, maxLayer: 10, note: "任一军中教头/镖师/武馆师父" }
  - { type: manual, chapter: ch02_shediao,  ref: it_miji_taizuchangquan, maxLayer: 10 }
  - { type: observe, maxLayer: 6 }
observable: true
description: >-
  宋太祖传下的长拳，天下习武之人人人会打。招式寻常，却因此毫无破绽；功力越深之人使来越是威猛——
  拳法不改，人已不同。
```

### 13.6 全真剑法 `sk_quanzhenjian`（玄中 · 兵器·剑 · 全真教）

```yaml
id: sk_quanzhenjian
name: 全真剑法
category: weapon
subType: sword
grade: 5
origin: canonExpanded
sect: sect_quanzhen
lineage: 王重阳 → 全真七子 → 三代弟子
sourceChapters: [ch02_shediao, ch03_shendiao]
canonRef: 射雕、神雕（全真派基本剑法；玉女素心剑法的一半）
nature: yang
wOut: 0.60
wIn: 0.40
reqs:
  aptitude: { apSword: 30 }
  sect: { id: sect_quanzhen, rank: 1 }
  hard: [sect]
layerStats: { parry: [1, 6], hit: [1, 4] }                 # 合计 10（玄阶上限）
moveSlots: 3
weaponReq: { category: sword }
layers:
  - { n: 1,  unlock: [mv_quanzhenjian_dingyang] }
  - { n: 2,  unlock: [ps_quanzhenjian_xuanmen] }
  - { n: 4,  unlock: [mv_quanzhenjian_qixing] }
  - { n: 5,  unlock: [ps_quanzhenjian_jiansui] }
  - { n: 7,  unlock: [mv_quanzhenjian_sanqing] }
  - { n: 8,  unlock: [ps_quanzhenjian_tongqi] }
  - { n: 10, unlock: [mv_quanzhenjian_chongyang] }
moves:   # 玄阶耗内基准 6%
  - { id: mv_quanzhenjian_dingyang, name: 定阳针, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.06, cd: 0, recovery: 1000, power: 1.00, parryable: true,
      note: "招名见于原著全真剑法（待考出处回目）" }
  - { id: mv_quanzhenjian_qixing,   name: 七星聚会, unlock: 4, kind: attack, target: tile, range: {min: 1, max: 1}, aoe: {tpl: aoe_multi, n: 7, r: 1}, delivery: melee, mpCost: 0.07, cd: 2, recovery: 1000, power: 1.10, hits: 7, parryable: true,
      note: "（原创扩展命名）" }                                                             # 0.85×1.29
  - { id: mv_quanzhenjian_sanqing,  name: 三清朝元, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_line, n: 3}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 0.95, parryable: true,
      buffs: [ {id: bf_jianshi, dur: 2, grade: inherit, to: self} ], note: "（原创扩展命名）剑势：自身暴击 +10，2 回合" }   # 0.8×1.34 −0.10
  - { id: mv_quanzhenjian_chongyang, name: 重阳遗意, unlock: 10, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1200, power: 3.00, parryable: true,
      note: "（原创扩展命名）" }
passives:
  - { id: ps_quanzhenjian_xuanmen, name: 玄门正宗, unlock: 2, kind: stat, zone: Z3, value: 0.08, cond: {mainInnerSect: sect_quanzhen}, scope: self }
  - { id: ps_quanzhenjian_jiansui, name: 剑随身走, unlock: 5, kind: trigger, trigger: {on: turnStart, cond: movedTilesGte2ThisAction}, value: {hit: 10}, scope: self,
      text: "本次行动已移动 ≥ 2 格时，本武学招式命中 +10" }
  - { id: ps_quanzhenjian_tongqi,  name: 同气连枝, unlock: 8, kind: stat, value: {parryPerAdjacentAlly: 3, max: 9, allyCond: {hasSkillOfSect: sect_quanzhen}}, scope: unit }
setTags: [set_quanzhen_beidou]            # 建议 ID（与天罡北斗阵、先天功等组套），design/07
conflicts: []
learnSources:
  - { type: master, chapter: ch02_shediao,  ref: npc_quanzhen_sandai, maxLayer: 10 }
  - { type: master, chapter: ch03_shendiao, ref: npc_quanzhen_sandai, maxLayer: 10 }
  - { type: puzzle, chapter: ch03_shendiao, ref: q_03_side_gumushike, maxLayer: 10, reqsOverride: { sect: null },
      note: "古墓石室所刻全真武功（原著杨过、小龙女据以修习，细节待考）" }
  - { type: observe, maxLayer: 6 }
special: { fusible: true }
observable: true
description: >-
  全真派入门至中乘的剑法，端凝正大、攻守兼备。与古墓玉女剑法招招相克，二人分使则合为玉女素心剑法。
  招式效果与大部分招名为本作原创扩展。
```

### 13.7 龙爪手 `sk_longzhaoshou`（地中 · 拳脚·擒拿 · 少林七十二绝技）

原著依据：少林七十二绝技之一；倚天光明顶一役，空性神僧以龙爪手对张无忌，张无忌观而学之、以同一路龙爪手胜之。招名"捕风、捉影、抚琴、鼓瑟、批亢、捣虚、抱残、守缺"诸式见于该回（**逐字与完整路数待考**；原著称龙爪手共三十六招，亦待考）。本武学即用户所举"少林金刚套装"中的"金刚龙爪手"。

```yaml
id: sk_longzhaoshou
name: 龙爪手
alias: [金刚龙爪手, 少林龙爪手]
category: unarmed
subType: grapple
grade: 8
origin: canon
sect: sect_shaolin
lineage: 少林七十二绝技
sourceChapters: [ch01_tianlong, ch04_yitian, ch05_xiaoao]
canonRef: 倚天·光明顶（空性 vs 张无忌），招名待考
nature: yang
wOut: 0.70
wIn: 0.30
reqs:
  attrs: { str: 45 }
  aptitude: { apGrapple: 45 }
  prereq: [ { skill: sk_shaolinqinna, layer: 5 } ]       # 少林擒拿手（catalog 定义）
  sect: { id: sect_shaolin, rank: 3 }
  hard: [sect, prereq]
layerStats: { seal: [3, 10], crit: [1, 5] }               # 合计 15（地阶上限）
moveSlots: 4
layers:
  - { n: 1,  unlock: [mv_longzhaoshou_bufeng, ps_longzhaoshou_naxue] }
  - { n: 2,  unlock: [mv_longzhaoshou_zhuoying] }
  - { n: 3,  unlock: [mv_longzhaoshou_fuqin] }
  - { n: 4,  unlock: [mv_longzhaoshou_guse] }
  - { n: 5,  unlock: [mv_longzhaoshou_pikang, ps_longzhaoshou_fenjin] }
  - { n: 6,  unlock: [mv_longzhaoshou_daoxu] }
  - { n: 7,  unlock: [mv_longzhaoshou_sanshiliu] }
  - { n: 8,  unlock: [mv_longzhaoshou_baocan, ps_longzhaoshou_zhili] }
  - { n: 9,  unlock: [mv_longzhaoshou_shouque] }
  - { n: 10, unlock: [ps_longzhaoshou_dacheng] }
moves:   # 地阶耗内基准 7%；原著定数 8 式，超出"地阶 4–7 招"规范，按原著例外
  - { id: mv_longzhaoshou_bufeng,  name: 捕风式, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 0, recovery: 1000, power: 0.95, parryable: true,
      buffs: [ {id: bf_fengxue, chance: 0.2, dur: 1, grade: inherit, to: target} ] }       # 1 −0.04
  - { id: mv_longzhaoshou_zhuoying, name: 捉影式, unlock: 2, kind: attack, target: enemy, range: {min: 1, max: 2}, aoe: {tpl: aoe_pull, n: 1}, delivery: melee, mpCost: 0.07, cd: 1, recovery: 1000, power: 0.95, parryable: true }   # 0.95×1.12 −0.10
  - { id: mv_longzhaoshou_fuqin,   name: 抚琴式, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, hits: 2, parryable: true,
      buffs: [ {id: bf_jiaoxie, chance: 0.25, dur: 1, grade: inherit, to: target, cond: targetArmed} ] }   # 1.17 −0.06
  - { id: mv_longzhaoshou_guse,    name: 鼓瑟式, unlock: 4, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_sweep}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 0.85, parryable: true,
      buffs: [ {id: bf_fengxue, chance: 0.15, dur: 1, grade: inherit, to: target} ] }      # 0.75×1.17 −0.03
  - { id: mv_longzhaoshou_pikang,  name: 批亢式, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.20, parryable: true,
      note: "攻其要害：本招暴击 +15" }                                                       # 1.29 −0.10
  - { id: mv_longzhaoshou_daoxu,   name: 捣虚式, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.15, parryable: true,
      cleanse: {side: target, tags: [stance], count: 1, maxGrade: inherit}, note: "无视目标 20% 外功防御（Z2）" }   # 1.29 −0.15
  - { id: mv_longzhaoshou_sanshiliu, name: 龙爪三十六路, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 0, recovery: 1200, power: 2.70, hits: 6, parryable: true,
      buffs: [ {id: bf_fengxue, chance: 1.0, dur: 2, grade: inherit, to: target}, {id: bf_jiaoxie, chance: 0.5, dur: 1, grade: inherit, to: target, cond: targetArmed} ],
      note: "（原创扩展命名）三十六爪连环" }                                                 # 3.0 −0.20 −0.10
  - { id: mv_longzhaoshou_baocan,  name: 抱残式, unlock: 8, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.06, cd: 2, recovery: 850, power: 0,
      trigger: {on: meleeAttacked, chance: 1.0, perRound: 1, counterPower: 1.00, expires: nextOwnAction, applyBuff: {id: bf_dingshen, dur: 1}} }
  - { id: mv_longzhaoshou_shouque, name: 守缺式, unlock: 9, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.07, cd: 3, recovery: 800, power: 0,
      buffs: [ {id: bf_shouque, dur: 2, grade: inherit, to: self} ], note: "招架 +20、受到伤害 −15%（Z4）、免疫品阶 ≤ 自身的封穴，2 回合" }
passives:
  - { id: ps_longzhaoshou_naxue,  name: 拿穴, unlock: 1, kind: trigger, trigger: {on: onHit}, buff: {id: bf_fengxue, chance: [0.10, 0.25], dur: 1, grade: inherit}, scope: self }
  - { id: ps_longzhaoshou_fenjin, name: 分筋错骨, unlock: 5, kind: stat, zone: Z3, value: 0.12, cond: {targetHasTag: seal}, scope: self }
  - { id: ps_longzhaoshou_zhili,  name: 金刚指力, unlock: 8, kind: stat, zone: Z0, value: {pierce: 10}, scope: self }
  - { id: ps_longzhaoshou_dacheng, name: 龙爪大成, unlock: 10, kind: mechanic, value: {unparryableVsTag: seal}, scope: self, text: "对被封穴的目标，龙爪招式不可招架" }
setTags: [set_shaolin_jingang]            # 用户示例：金刚龙爪手＋易筋经＋铁砂掌＋铜人横练（套装本体归 design/07）
conflicts: []
weaponReq: null
learnSources:
  - { type: master,  chapter: ch01_tianlong, ref: npc_shaolin_banruotang, maxLayer: 10, note: "少林般若堂（原创扩展）" }
  - { type: observe, chapter: ch04_yitian,   ref: npc_kongxing, maxLayer: 6, reqsOverride: { sect: null, prereq: [] },
      note: "光明顶观空性出手：该战观摩领悟 ×10（剧情事件）" }
  - { type: manual,  chapter: ch05_xiaoao,   ref: it_miji_longzhaoshou, maxLayer: 10, note: "少林藏经阁" }
special: { fusible: true }
observable: true
description: >-
  少林七十二绝技之一，爪势如龙，专拿关节穴道。一招一式皆有法度，攻守相连，"抱残守缺"两式守中带擒。
```

### 13.8 罗汉拳 `sk_luohanquan`（黄下 · 拳脚·拳 · 少林入门）

```yaml
id: sk_luohanquan
name: 罗汉拳
category: unarmed
subType: fist
grade: 1
origin: canonExpanded
sect: sect_shaolin
lineage: 少林入门拳法（俗家亦传）
sourceChapters: [ch01_tianlong, ch03_shendiao, ch04_yitian, ch05_xiaoao, ch08_luding]
canonRef: 少林入门拳法之名多见于原著（出处待考）；招名为原创扩展
nature: yang
wOut: 0.90
wIn: 0.10
reqs: { hard: [] }
layerStats: { parry: [1, 3], hit: [1, 3] }                 # 合计 6
moveSlots: 3
layers:
  - { n: 1,  unlock: [mv_luohanquan_baifo] }
  - { n: 4,  unlock: [mv_luohanquan_zhuangzhong] }
  - { n: 5,  unlock: [ps_luohanquan_quanjia] }
  - { n: 7,  unlock: [mv_luohanquan_tuishan] }
  - { n: 10, unlock: [ps_luohanquan_yuanman] }
moves:   # 黄阶耗内基准 5%
  - { id: mv_luohanquan_baifo,      name: 罗汉拜佛, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.04, cd: 0, recovery: 950, power: 0.90, parryable: true }   # 1 −0.05 −0.035
  - { id: mv_luohanquan_zhuangzhong, name: 罗汉撞钟, unlock: 4, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.05, cd: 1, recovery: 1000, power: 1.05, parryable: true,
      displacement: {type: knock, n: 1} }                                                    # 1.12 −0.05
  - { id: mv_luohanquan_tuishan,    name: 罗汉推山, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_line, n: 2}, delivery: melee, mpCost: 0.05, cd: 1, recovery: 1000, power: 0.95, parryable: true }  # 0.85×1.12
passives:
  - { id: ps_luohanquan_quanjia, name: 拳架扎实, unlock: 5, kind: stat, value: {resCC: 10}, scope: unit }
  - { id: ps_luohanquan_yuanman, name: 入门圆满, unlock: 10, kind: mechanic, value: {oneTimeAptitude: {apFist: 1}, softReqRelief: {sect: sect_shaolin, category: unarmed, aptitude: -10}},
      text: "首次练满时拳掌资质永久 +1（全游戏一次）；此后学习少林拳脚武学的资质软门槛 −10" }
setTags: [set_shaolin_luohan]             # 建议 ID（少林入门套），design/07
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_shaolin_wuseng, maxLayer: 10 }
  - { type: manual, chapter: ch08_luding,   ref: it_miji_luohanquan, maxLayer: 10 }
  - { type: pages,  ref: it_canye_luohanquan, pagesTotal: 3, maxLayer: 10 }
  - { type: observe, maxLayer: 6 }
special: { fusible: true }
observable: true
description: >-
  少林寺入门第一路拳法，架子端正、发力朴实。练到圆满，打下的是一辈子的根基。招名为本作原创扩展。
```

