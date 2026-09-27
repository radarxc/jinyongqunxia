# 05 · 武学体系（Martial Arts System）

> 归属（基准 §18）：武功数据结构、层数、招式预算、内功接口、修炼、装配栏规则、武学图鉴。
> 上游：`00-canon.md` v1.1（唯一事实来源）；作者新增需求与已采用决定见 `decisions/author-requirements.md`、`decisions/author-decisions.md`；跨文档裁定见 `decisions/rulings-v1.md`。
> 引用而不重定义：携带、外来压制、残篇/残承 → `design/02-timeline-and-world-tiers.md`；属性公式、`MPREF` 与技艺 ID → `design/03-attributes.md`；伤害公式与乘区 → `design/04-damage-formula.md`；Buff 定义与目录 → `design/06-buff-system.md`；套装定义 → `design/07-set-system.md`；地形/轻功阈值 → `design/08-terrain-and-qinggong.md`；六角范围模板、集气、运劲、合击、反击流程与 AI → `design/09-combat-system.md`；物品/丹药/兵器属性 → `design/10-items-and-equipment.md`；统一大地图与时代图层 → `design/11-open-world.md`；任务、关系与门派玩法 → `design/12-quests-npc-factions.md`；角色经验与等级 → `design/13-progression-and-endings.md`；穴道、经脉、冲穴与周天 → `design/15-meridians-and-acupoints.md`；资源与营生 → `design/16-resources-and-estates.md`；门派名录、历史与时代开放 → `design/17-sects-compendium.md`；NPC 身份、同伴与生卒 → `design/18-npc-and-companions.md`；地图节点、坐标与时代地图资产 → `design/19-world-map.md`；后人、宝藏、跨年代残本与合成 → 未来 `design/20-legacy-inheritance.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、先给出可用数值并在文末登记。
> 版本：v1.2（跨文档同步，2026-09-26）。
> 变更记录：v1.2 接收 `design/15` 的 20 个正式经脉 ID、专精倍率与校验边界，补齐 `design/17`–`20` 的唯一归属引用，明确 `recalled` 仅为基础图鉴状态上的“再续朱印”，并将已落盘的跨文档待决项改为已解决。C14 图鉴实数重定与 CN-05 独孤六式预算结论保持不变。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标与约束 | 全体 |
| §2 | 武功数据结构（字段表、枚举、完整 YAML、TS 类型、运行时状态、派生管线） | 程序、配表 |
| §3 | 层数：层数系数 L(n)、经验曲线、修为门槛、有效层数、每层解锁规范 | 数值、程序 |
| §4 | 招式：字段、预算公式、六角范围接口、位移、友伤、绝招、招式栏 | 数值、程序、战斗 |
| §5 | 内功：主运/辅运、性质与相性（Z5）、贡献、内劲/经脉与运劲接口 | 数值、程序 |
| §6 | 装配规则：栏位、兵器匹配、空手/持械、切换武器、套装计件 | 程序、战斗 |
| §7 | 学习：途径、门槛、秘籍、观摩偷学、残页、解谜、合击领悟、印证挂接 | 策划、程序 |
| §8 | 修炼：实战经验分配、闭关、师父指点、丹药、顿悟 | 数值、程序 |
| §9 | 特殊武学规则：代价型、互斥与相克、组合武学、"破 X" | 策划、数值 |
| §10 | 走火入魔 | 策划、数值 |
| §11 | 武学图鉴 | 策划、UI |
| §12 | 融会贯通（原创扩展） | 策划、数值 |
| §13 | 完整示例武学（9 门） | 配表参照 |
| §14 | 数量与品阶分布规划（catalog 约束） | 图鉴撰写者 |
| §15 | 本文新增术语与 ID | 全体 |
| §16 | 数据校验规则与测试用例 | 程序 |
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
| `sect` | string \| null | ✅ | `sect_<拼音>`；正式组织 ID、历史与时代开放唯一见 design/17，身份/晋升玩法见 design/12；无门派的传承写 `null` 并填 `lineage` | `sect_gaibang` |
| `lineage` | string | | 传承说明（人物链） | 独孤求败 → 风清扬 |
| `sourceChapters` | chapterId[] | ✅ | **原生书界**（可在该书界被习得）；与基准 §13 一致 | `[ch01_tianlong, ch02_shediao, ch03_shendiao]` |
| `canonRef` | string | | 原著出处（书名/人物/情节）；回目未核对时写清待核范围 | 《射雕英雄传》·洪七公传授郭靖降龙掌 |
| `nature` | enum | ✅ | `yang` 阳 / `yin` 阴 / `harmony` 调和 / `neutral` 中性；**内功不得为 `neutral`**（基准 §6 `mpNature` 只有三值） | `yang` |
| `wOut` / `wIn` | number | ✅ | 外/内比例，步长 0.05，`wOut + wIn = 1`；内功的运功招式默认 `0/1`；交 design/04 Z1 攻击合成 | `0.45 / 0.55` |
| `aptitude` | enum | 自动 | 由 `subType` 推导的资质 ID（§2.3），可覆写 | `apFist` |
| `reqs` | Reqs | ✅ | 学习门槛（§2.4、§7.3） | |
| `maxLayer` | int | | 默认 10；特殊武学可更低 | `10` |
| `layerStats` | map | | 装配时按层线性成长的数值（§3.6）：`{stat: [第1重值, 第10重值]}` | `{parry: [2, 10]}` |
| `inner` | InnerDef | 内功必填 | 内功专属：贡献预算、辅运模式、性质跟随等（§5） | |
| `layers` | LayerDef[] | ✅ | 1–10 重每重解锁（招式/被动/绝招/里程碑），见 §3.5；无解锁的层可省略 | |
| `moves` | MoveDef[] | ✅ | 招式列表（§4）；轻功/部分杂学可为空 | |
| `moveSlots` | int | 自动 | 战斗中可同时装配的普通招式数（§4.9），黄/玄 3、地 4、天 5 | `5` |
| `passives` | PassiveDef[] | | 被动（§2.5） | |
| `setTags` | setId[] | | 所属套装 ID（`set_<拼音>`）；套装本体归 design/07，构建时双向校验 | `[set_shaolin_jingang]` |
| `conflicts` | Conflict[] | | 互斥/相冲/相克/相生（§9.2） | |
| `weaponReq` | WeaponReq | 兵器必填 | 主武器类别、奇门细类与特殊兼容装备（§6.2）；暗器类不用此字段，改填 `hiddenKind` | `{category: sword}` |
| `hiddenKind` | enum | 暗器必填 | 复用 design/10 的 `HiddenKind`：`needle/dart/ball/awl/bolt/powder/gun/bow`；弓箭与火器仍是 `hidden/hidden` | `bow` |
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

分类硬规则（C16）：左右互搏固定为 `misc/mind`。弓箭武学固定为 `hidden/hidden`，占暗器栏、使用 `apHidden` 与箭类弹药；弓具本身的持用条件归 `design/10`。火铳等火器同属暗器/弹药体系（作者决定 P19），不另建兵器武学类别。

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
| `skills` | `{artId: min}` | 技艺下限；`artId` 复用 design/03 的十项技艺 ID，整数 0–100 |
| `morality` | `{min?, max?}` | 品德区间（−100…+100） |
| `sect` | `{id, rank?}` | 门派身份与最低抽象职级（L1–L5 规则归 design/12；门派称谓与时代开放归 design/17） |
| `prereq` | `PrereqClause[]` | 外层数组为 AND；元素可为 `{skill, layer}`，或二选一/多选一的 `{anyOf: [{skill, layer}, ...]}` |
| `level` | int | 最低**显示等级** |
| `lore` | `{min?, max?}` | 武学常识区间（太玄经要求"不执着文字"用 `max`） |
| `vow` | vowId | 必须已立下的誓约（§9.1.4） |
| `hard` | string[] | 列出哪些条目是**硬门槛**；其余为**软门槛**（§7.3） |

默认硬/软规则：省略 `hard` 时，`sect`、`prereq`、`vow`、`morality`、`attrsMax`、`lore.max` 默认为硬门槛；`attrs`、`aptitude`、`skills`、`level`、`lore.min` 默认为软门槛。显式 `hard` 是完整的硬条件列表，`hard: []` 表示本组全为软；可写顶层键或 `skills.med`、`prereq.0` 等条件路径。单个 OR 组只计一个条件，不按失败分支数重复计软缺项。

`anyOf` 禁止空组、嵌套组、重复分支与自依赖；前置层数为 1–10。来源的 `reqsOverride` 按顶层字段整体替换，`null` 删除该字段；替换带 `prereq.N` 的数组时必须同时替换 `hard`。旧 `special.altPrereq` 必须迁为 `anyOf`，不得在生产数据中继续出现。

当 `reqsOverride` 删除一个条件字段而没有覆写 `hard` 时，对应顶层键及其子路径从继承的 `hard` 中一并删除；若覆写 `prereq` 且 `hard` 使用 `prereq.N` 路径，则必须同时覆写 `hard`，避免数组换序偷换硬条件。

```yaml
# 二选一前置的规范写法：外层 AND，anyOf 内 OR
reqs:
  skills: { art: 40 }
  prereq:
    - anyOf:
        - { skill: sk_yiyangzhi, layer: 5 }
        - { skill: sk_beiming, layer: 5 }
  hard: [prereq]
```

### 2.5 被动 `PassiveDef`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | `ps_<武功拼音>_<拼音>`（本文新增前缀，§15） |
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
| `trueLayer` | int 1–10 | **真实层数**，只增不减（被融会贯通消耗除外） |
| `sxp` | int | 当前层内已积累武学经验 |
| `sourceCap` | int | 当前可达的最高层（取所有已获学习途径的最大 `maxLayer`，§7.1） |
| `learnedIn` | chapterId | 首次习得书界 |
| `nativeTo` | chapterId | 本土归属（design/02 §2.2）；`≠ 当前书界` 即外来 |
| `attunedGrade` / `attunedIn` | int / chapterId | 残承印证写入的品阶与书界（design/02 §2.2） |
| `sourceGrade` | int 1–12 | 习得记录的来源品阶；完整来源等于绝对品阶，残承为 `lineageGrade`，跨书界保留且不被现影/终局自动补全 |
| `latentExp` | int | 积蕴：达到书界层数上限后继续获得的经验按 50% 存入（design/02 §2.4） |
| `movesEquipped` | moveId[] | 招式栏中选择的招式（≤ `moveSlots`） |
| `insight` | int | 观摩领悟进度（未习得时使用，§7.4） |
| `pages` | int[] | 已收集残页序号（§7.5） |
| `flags` | string[] | `evil`（邪练）、`fused`（已融入）、`vowed` 等 |

**派生值（每次装配变化/书界切换/升级时重算，不存档）**：

```
effGrade  = min( effGradeByTier(inst, chapter, suppressionContext),          // design/02 §2.3（来源品阶、压制、抵消、印证）
                 special.vowGate 未满足时的 gradeOverride ?? 12 )           // §9.1.4
effLayer  = min(trueLayer, tierCap(worldTier), gateCap(grade, displayLevel), special.layerCap ?? 10)
G         = G_TABLE[effGrade]                                                // 基准 §4
L         = 0.5 + 0.1 × effLayer                                            // §3.1
```

- `effGradeByTier` 唯一实现见 design/02 §2.3：先以 `sourceGrade` 限制残承来源，再处理本土/外来、残承印证、天书抵消、自创武学半额压制与限时现影。本文不得退化成单一 `grade − S`；`tierCap` 的普通值为 10 / 9 / 8，例外同样由 design/02 / 13 提供。
- `gateCap`：修为门槛允许的最高层（§3.3）。
- 解锁判定（招式、被动、绝招）一律使用 `effLayer`。真实层数高于有效层数时，超出部分的招式在 UI 上显示为"天道封印"（书灵解释），战斗中不可用。
- 武学施加的 Buff 品阶 = `effGrade`（基准 §10"通常继承来源武功品阶"）。
- **修炼消耗与修为门槛使用绝对 `grade`**（防止"在低武书界便宜地修高阶外来武学"）。

### 2.7 招式威力管线（交给 design/04 Z1）

```
P_actual = G(effGrade) × L(effLayer) × move.power × Mod_armed × Mod_special
```

| 项 | 来源 | 说明 |
|---|---|---|
| `G` | 基准 §4 | 太祖长拳等"人强则强"武学以 `special.gOverride` 计算 `G_eff`（§13.5） |
| `L` | §3.1 | |
| `move.power` | §4.2 招式预算 | |
| `Mod_armed` | §6.3 | 持械使用拳脚的系数（0.8 / 0.9 / 1.0） |
| `Mod_special` | 个别武学 | 如独孤九剑"以物代剑" 0.9、玉女素心单人 0.5 |

`P_actual` 是绝对武学威力，不在本文归一。它只在 design/04 的 Z1 中除一次攻方参考威力：

```text
D1 = floor(ATK_mix × 1.24 × P_actual / P_ref(Ld_attacker, tier))
```

`ATK_mix = wOut × atkOut + wIn × atkIn`，`P_ref` 引用 design/03 §3.5；Z2–Z10 不再除 `P_ref`，也不得用本次 `P_actual` 充当分母（C01）。

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
  attrs: { str: 30, con: 25 }
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
  - { n: 6,  unlock: [mv_tieshazhang_lianhuan] }
  - { n: 7,  unlock: [mv_tieshazhang_jingang], stage: 炉火纯青 }
  - { n: 8 }
  - { n: 9 }
  - { n: 10, unlock: [ps_tieshazhang_dacheng], stage: 登峰造极 }
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
    displacement: { type: knock, n: 1 }
    friendlyFire: none
    tags: [palm]
  - id: mv_tieshazhang_lianhuan
    name: 砂掌连环
    unlock: 6
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
    unlock: 7
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

以下只声明本文拥有的武学侧结构。`HexShape`、`YunjinMode` 从 design/09 的共享战斗类型导入；`ArtId`、`AptitudeId`、`InnateAttrId`、`StatId`、`InnerContribution` 与 `ChapterId` 复用 design/03 及项目共享 schema，不在本文另造枚举。

```ts
export type Grade = 1|2|3|4|5|6|7|8|9|10|11|12;
export type Nature = 'yang'|'yin'|'harmony'|'neutral';
export type MeridianId = import('./meridian/types').MeridianId; // 唯一目录与运行时白名单见 design/15 §2、§11.4
export type Category = 'inner'|'unarmed'|'weapon'|'movement'|'hidden'|'misc';
export type Zone = 'Z0'|'Z1'|'Z2'|'Z3'|'Z4'|'Z5'|'Z6'|'Z7'|'Z8'|'Z9'|'Z10'|'settle'|'none';
export type HexShape = import('./battle/types').HexShape;     // 唯一判别联合见 design/09 §13.1
export type YunjinMode = import('./battle/types').YunjinMode; // 唯一枚举见 design/09 §4.8.4
export type SkillPrereq = { skill: `sk_${string}`; layer: number };
export type PrereqClause = SkillPrereq | { anyOf: SkillPrereq[] };
export type SkillSpecial = Record<string, unknown>;           // 逐门扩展载荷；正式键由对应规则节约束
export interface MoveCondition {
  targetWeapon?: (WeaponCategory|'unarmed')[]; targetHasSkill?: Category[];
  targetMainInnerEffGradeGte?: Grade; targetShieldGt?: number;
  fromBehind?: boolean; selfHpBelow?: number; targetArmed?: boolean; targetHasTag?: string;
  adjacentFallenUnit?: boolean; attackedByTargetSinceLastAction?: boolean;
  targetLastMoveCat?: Category|string; allyAdjacentToTarget?: boolean; targetHpBelow?: number;
  night?: boolean; moonlitTile?: boolean; any?: MoveCondition[];
}
export type WeaponCategory = 'sword'|'blade'|'staff'|'spear'|'whip'|'exotic';
export type ExoticKind = 'brush'|'fan'|'wheel'|'hook'|'pestle'|'qin'|'flute'|'dagger'|'hammer'|'axe'|'token'|'misc';
export type HiddenKind = 'needle'|'dart'|'ball'|'awl'|'bolt'|'powder'|'gun'|'bow'; // 唯一枚举见 design/10
export interface WeaponReq {
  category: WeaponCategory; kinds?: ExoticKind[]; tags?: string[]; dual?: boolean;
  altCategories?: { unlockLayer: number; categories: WeaponCategory[]; mult: number };
  offHand?: { kind: 'weapon'|'shield'; category?: WeaponCategory; tags?: string[] };
  altItems?: `eq_${string}`[];
}

export interface Reqs {
  attrs?: Partial<Record<InnateAttrId, number>>;
  attrsMax?: Partial<Record<InnateAttrId, number>>;
  aptitude?: Partial<Record<AptitudeId, number>>;
  skills?: Partial<Record<ArtId, number>>;
  morality?: { min?: number; max?: number };
  sect?: { id: `sect_${string}`; rank?: number };
  prereq?: PrereqClause[];
  level?: number; lore?: { min?: number; max?: number }; vow?: `vow_${string}`;
  hard?: string[];
}

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
  weaponReq?: WeaponReq | null; hiddenKind?: HiddenKind; learnSources: LearnSource[];
  special?: SkillSpecial; observable?: boolean; hiddenMoves?: string[];
  description: string; assets?: Record<string, string>;
}

export interface MoveDef {
  id: `mv_${string}`; name: string; unlock: number;
  kind: 'attack'|'support'|'stance'|'utility';
  ultimate?: boolean; rageCost?: 100;
  target: 'enemy'|'ally'|'self'|'tile'|'any';
  range: { min: number; max: number }; aoe: HexShape; // 类型唯一归 design/09 §13.1
  delivery: 'melee'|'ranged'|'projectile'|'self';
  mpCost: number;               // 比例，× MPREF(displayLevel)
  hpCost?: number;              // 比例，× 自身 hpMax
  cd: number; recovery: number; charge?: 0|1;
  power: number; hits?: number;
  wOut?: number; wIn?: number; nature?: Nature;       // 覆写武学级设置
  parryable: boolean; counterable?: boolean;
  friendlyFire: 'none'|'allies'|'all';
  displacement?: { type: 'knock'|'pull'|'dash'|'leap'|'swap'|'behind'|'retreat'; n: number };
  buffs?: BuffApply[]; heal?: HealSpec; cleanse?: CleanseSpec;
  trigger?: TriggerSpec;         // 被动触发型招式（反击、摆尾）
  condition?: MoveCondition;     // 如"目标主武器为 blade"
  autoGroup?: string;            // 自动选式组（独孤九剑"破招"）
  yunjinMode?: YunjinMode;       // 专属招式覆写对应通用运劲分支
  effects?: EffectHook[]; note?: string;
  tags?: string[]; anim?: AnimRef; ai?: AiHint;
}

export interface InnerDef {
  contribution: InnerContribution;
  meridians: MeridianId[];
  yunjin?: YunjinMode[];
  auxYunjin?: YunjinMode[];
  bridge?: boolean; natureFollowAux?: boolean; auxOverride?: number;
  auxUsableMoves?: `mv_${string}`[]; seclusionCap?: number;
}

export interface SkillState {
  skillId: string; trueLayer: number; sxp: number; sourceCap: number;
  learnedIn: ChapterId; nativeTo: ChapterId; sourceGrade: Grade;
  attunedGrade?: Grade; attunedIn?: ChapterId;
  latentExp: number; movesEquipped: string[];
  insight?: number; pages?: number[]; flags?: string[];
}
```

---

## 3. 层数（重）

### 3.1 层数系数 L(n)（交 design/04 Z1）

**公式**：`L(n) = 0.5 + 0.1 × n`，n = 有效层数 `effLayer`（1–10）。

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
| 鹿鼎 | 44（封顶） | 100 | ≈ 22,300 | ≈ 12,400 | 本土地阶武学练至 8 重上限；满 8 重后的经验 50% 转为积蕴（design/02 §2.4） |

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
- 只被 `maxLayer`、`sourceCap` 或 `gateCap` 卡住、尚未达到当前生效的书界层数上限时，进入**修为/来源瓶颈**：`sxp` 继续累积但封顶为 1 × `ExpToNext(g, 当前层)`；门槛解除后立即突破，多余 `sxp` 结转，不提前转积蕴。
- **书界层数上限**（规则归 design/02 §2.4）：只有 `trueLayer` 已达到当前生效的 `tierCap` 后，新增经验才按 50% 存入**积蕴** `latentExp`；进入更高上限书界时依 02 注入。已带入的更高真实层数保留，仅有效层数截断。天龙 Lv35 的天阶 8 重是修为瓶颈而非高武 10 重上限，后续经验仍留在 `sxp`（基准 V11-R01）。
- **强行冲关**（主动操作，闭关中可选）：无视修为门槛突破 1 重（仅对下一重有效），成功率 `p = clamp(0.35 + (wil − 50)/200 + (luk − 50)/400 − 0.05 × 缺少的等级数, 0.05, 0.8)`；失败触发走火入魔（§10），等级 2 起步。每门武学每书界限 1 次。

### 3.4 有效层数与书界上限（汇总公式与边界）

```
effLayer = min(trueLayer, effectiveTierCap(context), gateCap(grade, displayLevel), special.layerCap ?? 10)
```

| 情形 | 例 | 结果 |
|---|---|---|
| 外来武学进入中武书界 | 降龙 10 重带入笑傲（显示 Lv 60） | `effGrade` 12→10（天下，G 2.8）；`effLayer` = min(10, 9, 10) = 9；威力系数 2.8 × 1.4 = 3.92（原 5.25，−25%） |
| 外来武学进入低武书界 | 同上带入鹿鼎（Lv 44） | `effGrade` 8（地中，G 2.2）；`effLayer` = min(10, 8, 9) = 8；2.2 × 1.3 = 2.86（−46%） |
| 本土武学在低武书界 | 鹿鼎习得凝血神爪（天下，本土） | `effGrade` 10 不压制；`effLayer` ≤ 8 |
| 外来武学印证后 | 易筋经带入笑傲，完成"方证传经"印证事件（§7.8） | `nativeTo := ch05`，本书界不再品阶压制，层数仍截断为 9 |
| 黄阶外来武学 | 罗汉拳（黄下）带入低武 | `effGrade` = max(1, 1−4) = 1（下限黄下） |
| 真实层数 < 已解锁招式要求 | 书眠后 `effLayer` 从 10 截到 8 | 第 9、10 重解锁的招式/被动/绝招"天道封印" |
| 本命 / 微光 / 现影 | 低武真实 10 重、Lv44 天阶 | 本命只令层数上限 8→9，仍受 `gateCap=9`；微光仍为 8；现影临时令层数上限 10，但仍受 `gateCap=9`，故均不得绕过修为门槛 |
| 终局"天书守卷人"决战 | 不受天道压制（基准 §3） | `tierCap = 10`、`suppression = 0`，但 `sourceGrade/sourceCap` 等残承来源限制仍保留；`gateCap` 按终局显示等级计算 |

`effectiveTierCap(context)` 的本命、现影、微光、封印松动、终局与无天道沙盒分支唯一归基准 §3、design/13。限时解除压制不会补全残承，也不改变显示等级、真实层数、来源限制或修为门槛（作者决定 P38–P41）。

### 3.5 每层解锁规范（配表模板）

每门武学的 `layers` 必须满足下列节奏（数据校验见 §16）：

| 层 | 黄阶 | 玄阶 | 地阶 | 天阶 |
|---|---|---|---|---|
| 1 | 招式 ×1–2 + 核心被动（弱） | 招式 ×1–2 + 核心被动 | 招式 ×2 + 核心被动 | 招式 ×2 + 核心被动 |
| 2–3 | （可空） | 招式 ×1 | 招式 ×1 | 招式 ×1–2 |
| 4–6 | 招式 ×1 或被动 ×1 | 招式 ×1 + 被动 ×1（"小成"） | 招式 ×1–2 + 被动 ×1 | 招式 ×1–2 + 被动 ×1–2 |
| 7 | 被动 ×1 | 招式 ×1 或**绝招**（可选） | **绝招** | **绝招** |
| 8–9 | — | 被动 ×1 | 进阶招/被动 | 进阶招/被动 |
| 10 | "圆满"被动（小） | "大成"被动 | "大成"机制被动（可含"绝招 +20%"） | "大成"机制被动（可含"绝招 +20%"）；可另设第二绝招 |

**绝招解锁层硬规则**：核心武学（内功/拳脚/兵器）的**第一个绝招解锁层 ≤ 7**——低武书界层数上限为 8，绝招若放在 9、10 重，带入中/低武书界后将被天道封印（design/02 §2.4 的要求）。第 9、10 重只放"满重终式"：大成被动、绝招强化、天阶可选的第二绝招。非核心武学（轻功/暗器/杂学）不受此限。

| 数量规范 | 黄 | 玄 | 地 | 天 |
|---|---|---|---|---|
| 普通招式总数 | 2–3 | 3–5 | 4–7 | 5–10 |
| 绝招 | 0 | 0–1 | 1 | 1–2 |
| 被动 | 1–2 | 2–4 | 3–4 | 4–7 |
| 招式栏 `moveSlots` | 3 | 3 | 4 | 5 |

原著给出定数招名的武学（降龙十八掌 18 掌、独孤九剑 9 式、龙爪手 8 式等）可突破“普通招式总数”，但招式栏数不变。内功以贡献与被动为主，运功招式 1–4 个即可，不受"普通招式总数"下限约束。

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
| `unlock` | int | 1 | 解锁层（按 `effLayer`） |
| `kind` | enum | `attack` | `attack` 攻击 / `support` 治疗·增益·驱散 / `stance` 架势（持续到自己下次行动或被触发） / `utility` 位移·换位·控场 |
| `ultimate` | bool | false | 绝招（§4.8） |
| `target` | enum | `enemy` | `enemy` / `ally` / `self` / `tile`（对地） / `any` |
| `range` | `{min,max}` | `{1,1}` | 六角距离射程；`min > 1` 表示贴身不可用，距离与瞄准规则见 design/09 §2、§5.3 |
| `aoe` | `HexShape` | `aoe_single` | 六角范围引用（§4.3；类型与几何唯一归 design/09 §5.3、§13.1） |
| `delivery` | enum | `melee` | `melee` 近身 / `ranged` 远程气劲（剑气、掌风、指力；越过单位，被墙体阻挡） / `projectile` 投射物（需视线，被第一个单位阻挡） / `self` |
| `hTol` | int | melee 2 / ranged 4 | 高度容差：受影响格与原点高度差 > hTol 则不受影响；音功等可设 `99` |
| `mpCost` | number | 按大阶 | × `MPREF(显示等级)`；`MPREF=STD.mpMax`，唯一数值表见 design/03 §3.5。结算 `max(1, round(mpCost × MPREF × 耗内修饰))`，显式 0 成本保持 0（C02） |
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
| `condition` | `MoveCondition` | — | 使用条件，如 `{targetWeapon: [blade]}`、`{fromBehind: true}`、`{selfHpBelow: 0.3}`；正式键见 §4.11 |
| `autoGroup` | string | — | 自动选式组：UI 只显示一个按钮，按目标自动解析为组内合法招式 |
| `yunjinMode` | enum | — | 此内功专属招式覆写的运劲分支；枚举引用 design/09 §4.8.4，不与通用运劲重复叠加 |
| `tags` | string[] | — | 表现与判定标签：`palm` `finger` `qigong`（气劲） `sonic` `fire` `cold` `poison` `hard` `soft` … |
| `anim` | object | — | `{clip, vfx, sfx, cutin?}` 素材键（素材规范归 `tech/06`） |
| `ai` | object | — | `{weight, prefer: opener\|finisher\|aoe\|control\|heal}` 供 design/09 AI 使用 |
| `terrainFx` | object | — | 对地形的附带效果，如 `{ignite: [tr_caodi]}`、`{freeze: [tr_qianshui]}`（地形 ID 与状态归 design/08） |
| `effects` | EffectHook[] | — | 结构化字段表达不了的规则，用效果钩子声明（§4.11） |
| `note` | string | — | 策划说明/UI 文案；不被程序解析 |

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
| `adj` 条件 | 常见条件（如目标处于一种常见状态）+0.15；罕见条件（如**目标正持招式指定的一类兵器／处于指定徒手类**、背后、目标残血 < 30%）+0.30。同一招式只按实际满足的一档计一次 |
| `K_delivery` | melee 1.00 / ranged 0.85 / projectile 0.92 |
| `K_parry` | 可招架 1.00 / 不可招架 0.85 |
| `cost_buff` | 建议值（design/06 定义 Buff 价值后替换）：控制（定身/眩晕 1 回合）0.25 × 施加率；封穴 0.20 × 率；内伤/破甲/流血/减速 0.10 × 率；自身增益 0.10–0.20 |
| `cost_disp` | 击退每格 0.05；拉拽 0.10；突进/跳斩（自身位移）0.10；换位/绕背 0.15 |
| AF | 按最大可命中六角格数 `Nmax` 计算，见 §4.3（唯一公式归 design/09 §5.3.3） |

**例**：降龙十八掌·震惊百里：六角 `aoe_around` 命中 6 格，AF 0.75；`cd 3` 为 +0.36，天阶基准 8%、实际 10% 为 +0.10，眩晕 30% 扣 `0.25×0.30=0.075`，故 `0.75×(1+0.36+0.10)−0.075=1.020`，取 **1.00**（在 ±0.05 手调范围内）。

**支援类预算**（治疗与护盾，公式归 design/04）：标准单体治疗 = 目标 `hpMax` 的 18%（大阶基准耗内、`cd 2`）；护体真气（`shield`）按治疗量 × 1.2 等价；群体治疗按 AF 折算。

### 4.3 六角范围模板接口（唯一归属：design/09 §5.3）

本文只消费 `HexShape` 与最大命中格数，不再定义几何。基础族为点 / 环 / 面 / 扇形；生产 ID、精确枚举、六向/十二向吸附、预览、高度过滤与行为模板全部见 design/09 §5.3、§13.1。常用预算摘录如下，便于配招复算：

```text
rawAF(N) = 1 / sqrt(1 + 0.18 × (N − 1))
AF(N) = clamp(floor(rawAF(N) × 20 + 0.5) / 20, 0.35, 1.00)
```

`N` 是模板所有允许瞄准方向中的最大可命中格数 `Nmax`；正数按 half-up 舍入到 0.05。运行时不重算平方根，构建时写入派生 AF；战场边界令实际命中减少时不回升 `power`。

| `Nmax` | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 13 | 15 | 19 | 25 | 37+ |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `AF` | 1.00 | 0.90 | 0.85 | 0.80 | 0.75 | 0.75 | 0.70 | 0.65 | 0.65 | 0.60 | 0.55 | 0.55 | 0.50 | 0.45 | 0.35 |

| 本文常用引用 | 六角格数 / 预算口径 |
|---|---|
| `aoe_single` / `aoe_self` | 1 格；伤害 AF 1.00 |
| `aoe_around` | `ring r=1` 的生产别名，周身 6 格、不含自身；AF 0.75 |
| `aoe_disk r=1/2/3` | 7 / 19 / 37 格；AF 0.70 / 0.50 / 0.35 |
| `aoe_ring r` | `6r` 格；r1/r2/r3 为 6/12/18 格 |
| `aoe_line n` | 六向直线、不含自身，N=n |
| `aoe_spokes r` | 含中心的六芒射线，N=`6r+1` |
| `aoe_cone` | 必填 `r`、`angle: 60\|120`、`dirCount: 6\|12`；格数查 design/09 §5.3.1 |
| `aoe_zone` | `{inner: HexZoneInner, duration}`，内层仅 disk/ring/line/cone |
| 行为/组合 | `aoe_wave/pierce/leap/dash/pull/knock/chain/multi/behind/swap/boomerang/sequence` 的字段契约见 design/09 §13.1 |

旧方格 ID `aoe_sq3/sq5/diamond/cross/x/sweep` 和旧参数 `cone.n`、`zone.shape/t`、`leap.splash: sq3|none` 仅供迁移器读取，新数据禁止使用。迁移分别为 disk r1/r2、spokes、`cone {r:1,angle:120,dirCount:6}`、`cone.n→r`、结构化 zone，以及 `splash:{tpl:aoe_disk,r:1}` / 省略 splash。多段范围只用非空 `aoe_sequence.steps[]`。

### 4.4 高度、视线、地形

| 规则 | 内容 |
|---|---|
| 近身高差 | `melee` 招式要求施招者与目标 `abs(Δh) ≤ hTol`（默认 2）；跳斩类用 `jump + 2` |
| 视线 | `projectile` 需要视线（被单位与 `blocksLos` 地形阻挡）；`ranged` 越过单位但被 `blocksLos` 地形与 `Δh ≥ 3` 的墙体阻挡；`sonic` 标签无视阻挡 |
| 范围与高度 | 范围内每格若与原点 `abs(Δh) > hTol` 则不受影响（高台上的敌人不会被平地横扫扫到） |
| 地形交互 | 招式可带 `terrainFx`：如火系点燃 `tr_caodi`（草地）、寒系冻结浅水（地形目录与状态归 design/08） |
| 方位与高低加成 | 背击/侧击、高打低属于 Z7，数值归 design/04 |

### 4.5 位移规则（`displacement`）

| 类型 | 规则 | 边界情况 |
|---|---|---|
| `knock` 击退 | 沿"施招者→目标"方向推 n 格 | 被单位/障碍/上坡高差 > 1 阻挡时停下并结算一次撞击；推下高差 ≥ 3 的崖、推入深水分别转 design/08 的坠落/落水规则 |
| `pull` 拉拽 | 目标朝施招者移动 n 格，最多至相邻 | 路径被阻挡则停在阻挡前；免疫控制（`resCC` 判定/机制免疫）则无效但伤害照常 |
| `dash` 突进 | 自身直线移动至多 n 格，停在首个单位前并出招 | 路径必须可通行，受轻功门禁约束（如踏水需 `qg3`，design/08）；`through: true` 可穿过并伤及路径全部敌人 |
| `leap` 跳斩 | 跳到目标相邻的空格再出招 | 落点高差 ≤ `jump + 2`；越过中间单位；落点被占则选最近合法格，无合法格则招式不可选 |
| `swap` 换位 | 与目标交换位置 | 对敌方须通过效果命中；Boss 可机制免疫 |
| `behind` 绕背 | 移动到目标身后格并出招 | 身后格不可达则退化为普通近身攻击，失去背击 |
| `retreat` 后撤 | 出招后自身后退 n 格 | 被阻挡则尽量后退 |

位移结算顺序：伤害判定 → 得到触发位移那一段尚未扣护盾的结算伤害 `D_hit` → 位移 → 撞击或坠落 → 触发地形效果。撞障碍者受 `floor(0.2 × D_hit)`，若撞到另一单位，该单位受 `floor(0.1 × D_hit)`；每次位移最多结算一次，正常扣护盾，不重跑 Z0–Z10，不触发暴击、招架、反击或再次击退，也不免费附送眩晕。免疫击退则无位移、无撞击；无伤害位移令 `D_hit=0`（C11）。坠落另走 design/08，同次位移不重复补撞击。

体力联动同 C11：`sta=0` 时获得 `bf_pibei`，恢复到 `sta ≥ ceil(0.20 × staMax)` 即移除；疲惫效果与禁用动作引用 design/03 §5.3、design/06，不在武学条目另设 50% 阈值或免费硬控。

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
| 预算基准 | `power` 基准 3.00（单体），其余同 §4.2；核心武学第一绝招解锁层 ≤ 7（§3.5）；第 10 重大成被动可给绝招 `power` +20%（在 Z1 招式倍率上乘算） |
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

### 4.11 效果钩子（`effects`）

结构化字段无法表达的招式/被动规则，用 `effects: [{hook, ...params}]` 声明；钩子由玩法核心（`tech/05`）统一实现、单元测试覆盖。`note` 字段只作策划说明与 UI 文案，**凡 `note` 中描述的规则，入库时必须落到结构化字段或钩子**（§16 校验）。

| 钩子 | 参数 | 时机 | 示例 |
|---|---|---|---|
| `refundMpOnKill` | `pct` | 结算后 | 亢龙有悔 |
| `refundHpCostOnKill` | — | 结算后 | 损则有孚 |
| `firstActionBonus` | `crit` / `dmg` | Z0 前 | 突如其来 |
| `critBonus` | `value` | Z0/Z6 | 批亢式 |
| `ignoreDef` | `out` / `in`（比例） | Z2 | 捣虚式、破气式 |
| `shieldDmgMult` | `mult` | 结算（护体） | 破气式 |
| `heightBonusMult` | `mult` | Z7 | 飞龙在天 |
| `noLowGroundPenalty` | — | Z7 | 鱼跃于渊 |
| `leapHeightExtra` | `n` | 选目标 | 鱼跃于渊 |
| `terrainNoFalloff` | `tags` | 范围计算 | 利涉大川 |
| `ignoreReach` | — | 判定 | 破枪式（无视长兵"拒敌"类效果，design/06） |
| `splashMult` | `mult` | 结算 | 飞龙在天 |
| `sequenceStage` | `index`、`damageMult?` | `aoe_sequence` 指定阶段结算前 | 千里横行（二段横扫伤害沿用主段） |
| `secondaryAoe` | `tpl`、`target`、`power`、`wIn` | 同一行动追加 | 九阳普照 |
| `stanceCounter` | `counterPower`、`expires`、`applyBuff?` | 触发 | 或跃在渊、抱残式 |
| `deflectProjectile` | `chance`、`reflectFromLayer`、`reflectPct` | 触发 | 破箭式 |
| `stackDetonate` | `buff`、`at`、`extraPower`、`applyBuff`、`dur` | 结算后 | 履霜冰至 |
| `rageDrain` | `value` | 结算后 | 密云不雨 |
| `drainMp` | `pctOfDamage` | 结算 | 吸星大法 |
| `restoreMp` | `pct`、`selfOnly` | 结算后 | 易筋换骨 |
| `cleanseZouhuo` | `maxLevel` | 结算后 | 洗髓 |
| `curveLos` | — | 选目标 / 视线 | 白虹掌力：射程不变，允许弹道绕过墙体与单位 |

`MoveCondition` 的正式键除类型示例已用的 `targetWeapon`、`targetHasSkill`、`targetMainInnerEffGradeGte`、`targetShieldGt`、`fromBehind`、`selfHpBelow`、`targetArmed`、`targetHasTag`、`any` 外，还包括图鉴已经提出的 `adjacentFallenUnit`、`attackedByTargetSinceLastAction`、`targetLastMoveCat`、`allyAdjacentToTarget`、`targetHpBelow`、`night`、`moonlitTile`。`night` 读取 design/11 的世界时段，`moonlitTile` 读取战场构建时写入的只读场景标签；本文只登记条件键，不重定义时钟或地图事实。未知键必须构建失败，不得静默忽略。

`buffs[].cond` 取值：`notKill`、`onKill`、`onCrit`、`targetArmed`（目标主手持兵器）、`targetHasTag:<tag>`。

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

每门 `category: inner` 的武学都必须显式填写 `nature: yang|yin|harmony`；`neutral` 只允许外功。该分类属于本作规则化判断，原著未给出统一三分法处均按**（原创扩展）**处理（AR-02）。

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
| 调和 | +6% | +6% | +12% | +2% |
| 未装配内功 | 0 | 0 | 0 | 0 |

- **三运同源**：主运与两门辅运性质全部为阳（或全部为阴）时，同性质招式额外 +4%（Z5）。
- **调和规则（AR-02）**：调和主运没有阴/阳相性惩罚；与阳招或阴招匹配时，取得同性质峰值 `+12%` 的一半，即 `+6%`。调和招仍为 +12%，中性招 +2%。此作者需求已同步至 design/04 §4.5。
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
InnerTotal = Σ_{内功栏 i} contribution_i × innerScale(effLayer_i) × ratio_i
innerScale(n) = 0.30 + 0.07 × n          // 1 重 0.37，5 重 0.65，10 重 1.00
ratio_i = 1（主运）或 auxRatio（辅运）
```

| 字段 | 含义 | 在 design/03 中的作用（建议） |
|---|---|---|
| `mpMaxPct` | 内力上限 +% | 乘在 mpMax 基础曲线上 |
| `hpMaxPct` | 气血上限 +% | 乘在 hpMax 基础曲线上 |
| `attrs` | 先天属性加点 `{con, str, agi, wis, wil}` | 加在先天属性上（可突破 100，受 120 上限） |
| `mpRegen` | 每回合内力恢复（% mpMax） | 每次自身行动开始恢复，字段名与上限已由基准 §6、design/03 确认 |
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

**回内结算（C03）**：

```text
mpRegen = clamp(1 + Σ(内功回内贡献 × innerScale × 主辅比例)
                  + 其他百分点修饰, 0, 6)
restore = floor(真实 mpMax × mpRegen / 100)
```

基础回内为 1 个百分点，所有来源合计上限 6%；每次自身行动开始回复且不超过资源上限。封内力等暂停规则见 design/06。耗内以 `MPREF` 计价、回内以角色真实 `mpMax` 计量，二者不能直接相减；5% 基准招式可能被 6% 回内覆盖，不作“所有招式必然净耗内”的保证。

**例**：主运易筋经 10 重（天上预算 IP 156；本条目实际 IP 155）＋辅运九阳神功 8 重（天上，阳；调和主运 → 辅运比例 0.40）：
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
| `meridians` | `MeridianId[]` | 冲穴专精经脉；只允许 `design/15` §2 的 20 个正式 ID，空数组表示无专精而非全专精 |
| `yunjin` | YunjinMode[] | 此内功开放的通用运劲分支；枚举唯一归 design/09 §4.8.4 |
| `auxYunjin` | YunjinMode[] | 作辅运时仍可作为来源的运劲分支；省略即辅运不能驱动通用运劲 |
| `bridge` | bool | 视为桥接（§5.4） |
| `natureFollowAux` | bool | 作主运时 `mpNature` 取品阶最高的辅运性质（无辅运时为调和）；用于乾坤大挪移、斗转星移这类"运使之法"（**原创设定**） |
| `auxOverride` | number | 固定辅运比例 |
| `auxUsableMoves` | moveId[] | 作辅运时仍可用的招式 |
| `seclusionCap` | int | 覆写闭关可达层数（默认内功 8，§8.3） |

### 5.8 内劲与冲穴接口（AR-03）

**内劲**是内功为战斗外冲穴提供的成长速率输入，不是 `mp`、不在战斗中储存，也不等于 design/09 的“运劲”行动。本文只输出每门内功的数据，不定义穴道、经脉贯通、周天或九转规则。

冲穴系统读取：主运与允许计入的辅运之有效品阶 `g_i`、有效层数 `n_i`、角色真实面板 `mpMax`、主运性质、`inner.meridians` 专精列表以及本文已经结算的 `auxRatio`。本文只提供这些快照，不在此重算冲穴。完整速率、经脉性质、关隘、失败、周天、九转与跨书界进度唯一归 `design/15-meridians-and-acupoints.md` §4–§9。

`design/15` §4.2 已定：单门内功对其专精经脉的**自身内劲贡献**乘 `1.20`，不得把整个内劲池乘 `1.20`；主运全额计入，辅运只乘一次本文输出的 `auxRatio`，不得再以“辅运”为名重复折算。`inner.meridians: []` 是无专精；未知或重复的 `mer_*` 均构建失败。

### 5.9 运劲接口（AR-12）

运劲是内功驱动的战斗行动。行动时序、消耗、强度公式、Buff 与七个子类 `tiaoxi|huti|xuli|bidu|liaoshang|cuiqinggong|huajie` 唯一归 design/09 §4.8.4。主运默认只可使用该内功 `inner.yunjin` 列出的分支；辅运还必须列入 `inner.auxYunjin`。内功专属招式若填 `move.yunjinMode`，代表覆写同子类通用运劲，不得同次叠加。运劲不推进冲穴进度。

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

通用约束：同一武学不能占两个栏位；融会贯通所得自创武学占一个对应栏位；装配变更只能在非战斗状态进行（战斗中仅允许"易运"与换兵，§5.6、§6.4）。剑冢利剑、软剑、重剑、木剑之意按作者决定 P23 保留为 **4 门独立 `misc/mind` 杂学**，各占 1 个杂学栏；其定义、品阶和获取归 `design/catalog/skills-daojia.md`，本文只执行栏位语义。

### 6.2 兵器武学与主武器匹配（`weaponReq`）

| 字段 | 说明 | 例 |
|---|---|---|
| `category` | 必须等于主武器类别（基准 §7 兵器类别） | `sword` |
| `kinds` | 仅 `exotic`：奇门细类白名单 | `[brush]`（判官笔法） |
| `tags` | 可选：武器需带有的标签；**不满足时仍可用，但失去标注的加成** | 玄铁剑法 `heavy`（重剑） |
| `dual` | 双持武学：副手须为同类兵器，或主手为成对兵器 | 鸳鸯刀法（配 `eq_yuanyangdao`） |
| `altCategories` | 特例：额外允许的类别与系数 | 独孤九剑 9 重起 `[staff, exotic] × 0.9` |
| `offHand` | 需要指定副手种类、类别或标签；只控制该武学/被动的可用性 | 盾刀要求副手 `kind: shield` |
| `altItems` | 允许具名装备 ID 作为兼容例外；ID 必须已由 design/10 登记 | 特定武学允许一件原著兵器代用 |

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

暗器武学不复用只属于兵器栏的 `weaponReq.kinds`。`category/subType=hidden/hidden` 时必须另填顶层 `hiddenKind`，并与 design/10 §2.6 的名门暗器或所装弹药一致；例如弓术填 `hiddenKind: bow`，火器填 `hiddenKind: gun`。`hands` 与装备是否为成对兵器由 design/10 判定；本文的 `dual/offHand/altItems` 只声明武学适配条件，不重定义装备结构。

### 6.3 空手与持械

| 主手状态 | 兵器栏 | 拳掌/指/擒拿 `Mod_armed` | 腿法 `Mod_armed` |
|---|---|---|---|
| 空手（主手为空或 `unarmed` 类护手兵器，如拳套/指虎） | **不可用** | 1.00 | 1.00 |
| 单手兵器 | 匹配的兵器武学可用 | 0.90 | 1.00 |
| 双手兵器（design/10 标注 `hands: 2`：多数棍、枪、重剑） | 同上 | 0.80 | 1.00 |

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
6. 构建管线校验：design/07 的成员清单与武学 `setTags` 必须一致，不一致则构建失败（§16）。

---

## 7. 学习

### 7.1 学习途径（`learnSources[].type`）

| type | 途径 | 获得层 | 默认 `maxLayer`（`sourceCap`） | 可学品阶 | 说明 |
|---|---|---|---|---|---|
| `master` | 拜师/传授 | 1 | 10（NPC 所知不全时按条目） | 全部 | 需门派身份或羁绊任务；任务/身份规则见 design/12，NPC/好感/羁绊事实见 design/18；可“喂招”（§8.4） |
| `manual` | 秘籍 | 1 | 全本 10；残本按条目 | 全部 | 物品 `it_miji_<武功拼音>`（**建议 ID 规则**，design/10 确认）；需阅读时间（§7.4） |
| `observe` | 观摩/偷学 | 1 | **6**（"有形无神"） | 仅 `observable: true`（天阶默认否） | §7.4；偷学门派武学有被发现风险（design/12） |
| `qiyu` | 奇遇 | 按事件 | 按事件 | 全部 | 奇遇池归 design/11 与各书界文档 |
| `puzzle` | 石壁/图谱/棋局解谜 | 1 | 按事件 | 全部 | §7.6 |
| `combo` | 合击领悟 | 1 | 10 | 合击类 | §7.7 |
| `pages` | 敌人掉落残页 | 1 | 随页数（§7.5） | 黄–地（天阶仅特例） | 物品 `it_canye_<武功拼音>`（**建议**） |
| `fragment` | 残篇重修 | 1 | 10 | 曾习得者 | 残篇规则归 design/02；本文只给加速接口（§7.9） |
| `fused` | 融会贯通自创 | 5 | 10 | ≤ 地上 | §12；作者决定 P37 |
| `inherit` | 传功 | 按事件 | — | 内功 | 只提升已有内功层数/内力（§8.4） |

**`LearnSource` 字段**：

| 字段 | 说明 |
|---|---|
| `type` | 上表之一 |
| `chapter` | 书界 ID（`observe`/`pages` 可省略，表示任何有该武学使用者/掉落的书界） |
| `ref` | NPC / 物品 / 任务 ID；静态 NPC 必须存在于 design/18 名录，泛化教头、院堂等无名职能应引用设施或组织的 role slot，不得伪造 `npc_*`；任务 ID 由各书界文档分配，本文中的占位仍待迁移 |
| `maxLayer` | 该学习途径可达最高层，整数 1–10；纯图鉴“听闻”或剧情标记不属于 `LearnSource`，由剧情事件直接写图鉴/标记（九阳示例见 §13.4） |
| `lineageGrade` | 残承途径的来源品阶；新学时写入 `SkillState.sourceGrade`，完整来源省略并取绝对品阶 |
| `pagesTotal` | 仅 `pages` |
| `cost` | 门派贡献、银两、物品等；门派贡献与身份门槛归 design/12，银两与资源定价归 design/16 |
| `reqsOverride` | 该途径下覆写的门槛（如奇遇绕过门派身份） |
| `note` | 说明 |

**已习得武学再次获得途径**：不重复"习得"，按 design/02 提升 `sourceCap/sourceGrade`；只有完整来源可把 `sourceGrade` 补到绝对品阶。若为本书界原生途径且武学为外来，可作为印证事件载体（§7.8）。射雕/神雕少林以背景与有限入门为主；射雕保留易筋经完整线，神雕不提供易筋经完整新学（作者决定 P49）。低武全真/武当候选来源和密宗四门跨书复现均可采用，但具体获取必须标**（原创扩展）**并由各图鉴/书界定义（P25、P28）。

### 7.2 学习流程

```
发现（图鉴"听闻/见识"）→ 满足硬门槛？──否→ 不可学（UI 显示缺少条件）
                         └是→ 软门槛不足？──是→ 弹出风险提示（§7.3），玩家确认
                                           └否→ 习得：trueLayer=1, sxp=0, sourceCap=途径上限，
                                                sourceGrade=完整绝对品阶或途径 lineageGrade
                                                → 自动加入图鉴"习得"→ 若装配栏有空位，提示装配
```

### 7.3 门槛：硬门槛与软门槛

- **硬门槛**不满足 → 不可学（门派身份、前置武功/OR 组、誓约、品德区间、属性上限等）。
- **软门槛**不满足 → 可学，但每缺一项：
  - 该武学修炼速度 × 0.7（多项连乘，下限 × 0.3）；
  - 每次升层时判定走火入魔：`p = 0.05 × 缺项数 × (1 − wil/150)`，缺 1 项触发 1 级、≥ 2 项触发 2 级（§10）。
  - 软门槛后来被满足（属性成长、资质提升）→ 惩罚立即解除。

判定 `prereq` 时，数组外层逐项 AND；`anyOf` 内只需一支满足。`skills` 每个实际键是一个条件原子；整个失败 OR 组只算一个缺项。全局 `sourceCap/sourceGrade`、书界层数上限、修为门槛和专属誓约解锁不属于可软化的 `Reqs`，即使 `hard: []` 也不能绕过。

**配表指引：标准门槛**（资质门槛采用 design/03 §7.5 建议 `X = 5 × g − 5`，catalog 可在 ±10 内浮动；属性门槛同值）：

| 大阶 | 对应资质 | 关键先天属性 | 悟性 `wis` | 身份 / 品德 |
|---|---|---|---|---|
| 黄（1–3） | 0 / 5 / 10 | 同左 | — | 多数无；门派入门拳剑需入门 |
| 玄（4–6） | 15 / 20 / 25 | 同左 | — | 门派武学需入门弟子 |
| 地（7–9） | 30 / 35 / 40 | 同左 | ≥ 40 | 门派核心武学需职级；邪派武学 `morality ≤ −20`（软） |
| 天（10–12） | 45 / 50 / 55 | 同左 | ≥ 50 | 多为硬门槛：传承、誓约、奇遇、特定品德 |

"标志性门槛"可超出 ±10 范围，但须在 `note` 中写明原著依据（如易筋经定力 70、独孤九剑悟性 70）。

### 7.4 秘籍阅读与观摩偷学

**秘籍阅读**（在安全点进行，可分次）：

```
阅读天数 = ceil( 2 × GF(g) × 100 / (wis + 30) )
```

| 悟性 | 黄下 | 玄中 | 地上 | 天上 |
|---|---|---|---|---|
| 30 | 4 天 | 7 天 | 13 天 | 20 天 |
| 50 | 3 天 | 6 天 | 10 天 | 15 天 |
| 80 | 2 天 | 4 天 | 7 天 | 11 天 |
| 100 | 2 天 | 4 天 | 6 天 | 10 天 |

**观摩偷学**（战斗内，含敌方与友方施招）：

| 规则 | 值 |
|---|---|
| 条件 | 武学 `observable: true`；施招者在六角距离 5 内且可见；观摩者未习得该武学。天阶默认不可观摩，只有逐门明确登记的例外才可（作者决定 P09） |
| 每次观摩领悟 | `Δinsight = round( wis/10 × (1 + lore/100) × (1.5 若已装配同子类且 ≥ 5 重的武学，否则 1) )` |
| 每场上限 | 同一武学每场计 3 次 |
| 习得阈值 | `insight ≥ 100 × GF(g)` → 以第 1 重习得，`sourceCap = 6` |
| 非战斗观摩 | 切磋、观战事件（design/12）每次计 3 次观摩 |
| 风险 | 偷学同行门派 NPC 的门派武学：每场 30% 被察觉 → 门派关系惩罚（design/12） |
| 原著例 | 《倚天屠龙记》光明顶之战中，张无忌观空性施展龙爪手后仿使其招式；本作据此设剧情事件：该战观摩领悟 ×10 |

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

- 条件：主角与某队友羁绊 ≥ 3 级（羁绊等级归 design/12；个别合击武学可要求更高，如玉女素心剑法 4 级），双方满足该合击武学的前置（如玉女素心剑法：一人全真剑法 ≥ 5 重、一人玉女剑法 ≥ 5 重）。
- 触发：两人在战斗中执行合击（流程归 design/09）累计 5 次，再完成一次羁绊事件 → 双方同时习得。
- 代表：玉女素心剑法（天中）、夫妻刀法（地中）、天罡北斗阵（天下）。天罡北斗阵由阵主与至少 3 名合格同伴合击累计 5 次后领悟；四人起阵为**（原创扩展）**的队伍适配，原著七星阵人数与源流仍由图鉴标注考据（C13）。

### 7.8 印证（外来 → 本土，规则归 design/02 §2.2）

- 印证 `attune` 的条件、完整传承/残承两种类型、离开书界后的回退，均由 design/02 §2.2 定义；本文只规定它在武学数据侧的挂接方式。
- 数据挂接：武学的 `learnSources` 中，`chapter` 为当前书界的 `master`/`manual`/`qiyu`/`puzzle` 条目，可被书界文档指定为"印证事件"；外来武学完成完整传承 → `nativeTo := 当前书界` 且 `sourceGrade := absGrade`；残承只写入 `attunedGrade/attunedIn`，不改变 `nativeTo/sourceGrade`。
- 印证不改变 `trueLayer`、`sxp`、`latentExp`；残承限制不会因书眠、天书现影或终局自动补全（作者决定 P38）。
- 例：易筋经带入笑傲（中武，压制 −2），完成"方证传经"→ 本书界恢复天上品（仍截断为 9 重）。

### 7.9 残篇重修（接口）

- 残篇的产生、记录与展示归 design/02。
- 本文接口：重修（忆起）某残篇武学时，在有效层数回到 `min(残篇记录层数, 书界层数上限)` 之前，所有来源的 `sxp` × 2（与 design/02 §5.3 一致）；学习门槛视为已满足软门槛（曾练过）。

---

## 8. 修炼

### 8.1 武学经验来源总览

| 来源 | 占比预期（高武书界） | 可突破闭关上限 | 可突破修为门槛 | 主要消耗 |
|---|---|---|---|---|
| 实战（§8.2） | 55%–65% | ✅ | ❌ | 战斗；速战所得再 ×0.5 |
| 闭关（§8.3） | 20%–30% | ❌（外功 7 重 / 内功 8 重） | ❌ | 游戏内时间、体力、盘缠 |
| 师父指点（§8.4） | 10%–15% | ✅ | ❌ | 门派贡献/好感、冷却 7 天 |
| 丹药（§8.5） | 5%–10% | 视物品 | ❌ | 物品 |
| 顿悟（§8.6） | 随机 | ✅ | "破障"结果可 | — |
| 强行冲关（§3.3） | — | — | ✅（1 重，有风险） | 走火入魔风险 |

**通用倍率**（作用于所有来源，丹药"固定值"除外）：

```
trainMul = (0.5 + 0.01 × ap) × trainWis   // design/03 §7.5；ap 为该武学对应资质（§2.2–2.3）
trainWis = 0.6 + 0.008 × wis              // 悟性 50 → 1.0；100 → 1.4；120 → 1.56
bonusMult = 1 + Σ加成（图鉴、残篇重修 +100%、易筋经大成 +15%、九阳触类旁通 +25% …），上限 3.0
softPenalty = 0.7^缺项数（下限 0.3）       // §7.3
sectTrainingMult = design/12 提供的门派状态倍率，默认 1.0
```

`sectTrainingMult` 只作为门派系统输入接入最终武学经验。作者决定 P32 的少林剃度状态生效时，仅对 `sect: sect_shaolin` 的武学取 **1.10**；还俗后恢复 1.00。剃度/还俗状态、情缘线关闭与恢复、门派职级均由 design/12 主定义，本文不复制状态机。多项门派倍率若未来出现，先在 design/12 合并为一个值再传入，避免 05 与 12 双重相乘。

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

单门武学所得：`gain = 份额 × trainMul × bonusMult × softPenalty × sectTrainingMult`，且**单场上限 = 1 × 该武学当前 `ExpToNext`**（一场战斗最多升 1 重；顿悟除外）。未装配的武学不获得实战经验。

速战按 design/09 §10.7 模拟出的使用次数照常分配武学经验，结算总量再 ×0.5（作者决定 P45）；角色经验的 ×0.8 归 design/13，两者不得混用。

**例**：天龙中期，主角显示 Lv 30，悟性 60（`trainWis` 1.08）、拳掌资质 70（1.20），击败 4 名 Lv 30 敌人（P = 436）。本场降龙十八掌用了 3 次、太祖长拳 1 次、绝招 0 次：攻击池 = 436 × 59% = 257 → 降龙 3/4 = 193 → × 1.08 × 1.20 = **250 sxp**。降龙在第 3 重（升 4 重需 1,320）约需 5–6 场。

### 8.3 闭关

| 规则 | 值 |
|---|---|
| 地点 | 客栈/门派居所 1.0；洞府/寺观 1.2；灵地（瀑布、雪峰、古墓等）1.5；地点身份与坐标引用 design/11 的 `poi_*` / design/19 地图数据，修炼倍率由章节在事件载荷中显式给出，旧 `seclusionSpot` 仅作迁移名 |
| 每日收益 | `C(L) × trainMul × 地点系数`，`C(L) = 60 + 6 × 显示等级`（Lv 30 → 240/日） |
| 目标 | 主修 1 门（100%）＋可选兼修 1 门（50%）；内功作主修时 × 1.3 |
| 消耗 | 每日 1 天游戏时间、体力 `sta` −40（体力不足须休息）、盘缠；门派贡献归 design/12，银两、食宿与资源定价归 design/16 |
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
- 例（以 design/10 §8.3 已定物品为准）：少林大还丹 `it_dahuandan` 静服 → `mainInner, pctNext 0.35`；一般补气丹 `it_buqidan` → `sxpBuff 1.15 × 5 场`。两者是武侠游戏化扩展名物，不作为金庸原著专名。

### 8.6 顿悟（悟性触发）

**触发**：每场战斗结束，对每门本场使用过的武学判定：

```
p = 0.5% + max(0, wis − 50) × 0.04% + lore × 0.005%
特殊情境 × 5：以弱胜强（敌方平均等级 ≥ 我方 + 5）、濒死得胜（结束时 hp < 10%）、首次击败某 Boss、在 `kind:vista` 的 `poi_*` 所在场景作战（POI 归 design/11，坐标归 design/19）
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

原著依据：《倚天屠龙记》中七伤拳一拳含七股不同劲力；谢逊因内功根基不足而练伤脏腑，张无忌以深厚九阳根基施展则无碍。下列七劲名称与等概率游戏效果为**（原创扩展）**，不冒充原著逐项招名。

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

原著依据：黑风双煞误解《九阴真经》中"五指发劲，无坚不破，摧敌首脑，如穿腐土"等语而走上邪路；倚天中周芷若亦使此功。正法为九阴神爪（`sk_jiuyinshenzhao`，天下，基准 §13）。引文须**（待考：《射雕英雄传》黑风双煞误读真经段落，核对逐字）**。

| 规则 | 值 |
|---|---|
| 习得 | 硬门槛 `morality ≤ −20`，或触发射雕奇遇"误读真经"（**原创扩展**，由 chapters/02 设计） |
| 邪练 | 所有来源 `sxp` × 1.5；每升 1 重 `morality −5`；每次升层走火判定 8%（1 级） |
| 邪气 | 装配时持有 `bf_xielian`（机制类，装配即生效，卸下即消失）：`resMind −15%`；正派 NPC 初见好感 −10（design/12） |
| 收益 | 本武学招式无视外功防御 15% → 30%（Z2）；对 hp < 50% 的目标暴击 +15（Z0/Z6 判定归 design/04） |
| 改修正法 | 前置：九阴真经（`sk_jiuyin`）≥ 3 重、`wis ≥ 60`、完成"正本清源"事件（**原创扩展**）→ 九阴白骨爪转为九阴神爪，`trueLayer = floor(0.6 × 原层)`，清除邪气，`morality +10`；此后二者互斥 |
| 表现 | 游戏化处理为"以邪法速成的阴毒爪功"，不渲染骷髅练功等血腥画面 |

#### 9.1.3 吸星大法 `sk_xixing`（天中，日月神教，笑傲）——异种真气反噬

原著依据：《笑傲江湖》中吸星大法可吸取他人内力，令狐冲体内异种真气冲突而受苦，少林方证提出以易筋经化解。吸星大法的创制者、与北冥神功/化功大法的渊源在版本间可能有差异，仍**（待考：《笑傲江湖》任我行讲述吸星来历及方证论疗法段落）**。

| 规则 | 值 |
|---|---|
| 吸取 | 招式"吸星"：近身，伤害 + 吸取目标内力（= 伤害 × 30%，不超过目标当前内力）；被动"反吸"：被拳脚或 `wIn ≥ 0.5` 的近身招式命中时吸取攻方 3% mpMax |
| 异种真气 | 每吸取量达自身 mpMax 的 5% → `bf_yizhongzhenqi` +1 层（上限 20）；战后保留，战斗外每日自然消退 1 层 |
| 反噬（自身回合开始判定） | ≥ 10 层：10% 走火 1 级；≥ 15 层：20% 走火 2 级；20 层：30% 走火 3 级 |
| 化解 | 易筋经 ≥ 5 重（辅运亦可，`auxMode: full`）：每回合 −2 层（10 重 −5 层）；北冥神功作主运：每层转化为 2% 当前内力并移除，不反噬（**原创设定**）；行动"运功化解"：−3 层、耗内 10%；闭关 1 日 −5 层 |
| 品德 | 习得时 `morality −10`；正派门派对持有者警惕（design/12） |

#### 9.1.4 葵花宝典 `sk_kuihua` / 辟邪剑法 `sk_bixie`——"断尘之誓"

原著依据：葵花宝典、辟邪剑谱都以自宫为修炼前提；具体首句及分别归属仍**（待考：《笑傲江湖》东方不败、岳不群、林平之相关段落，核对三联/广州修订版逐字）**。东方不败、岳不群、林平之均因修炼相关武功而走向重大性格与人生变化；本文不把未经核对的流行句式当原文。

**处理原则**：以"一个不可逆的重大抉择 + 永久代价"呈现；画面、文字均不描写身体伤害，只以原著引文 + 水墨淡出 + 书灵独白暗示；UI 中该抉择统一称为 **"断尘之誓"**（`vow_duanchen`，**原创扩展**命名，意为斩断尘缘）。

| 步骤 | 内容 |
|---|---|
| 1. 得书 | 获得葵花宝典（笑傲主线/支线）或辟邪剑谱（袈裟） |
| 2. 阅卷 | 显示经三联/广州修订版逐字核对后的首页引文；核对完成前只用“秘籍要求先行自宫”的释义。书灵现身劝阻，说明全部永久代价 |
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
| 北冥神功 `sk_beiming` | 化功大法 `sk_huagong` | `exclusive` | 一纳一化，经脉走向相反 | **原创扩展**；**（待考：《天龙八部》星宿/逍遥武学渊源段落）** |
| 北冥神功 | 吸星大法 | `synergy` + 化解 | 北冥作主运时吸星不产生反噬（§9.1.3） | **原创扩展**；**（待考：《笑傲江湖》任我行讲述吸星来历段落的版本差异）** |
| 九阳神功 | 玄冥神掌寒毒 | `counter` | 九阳 6 重起免疫品阶 ≤ 自身的 `cold` Buff | 张无忌以九阳真气驱除玄冥寒毒（倚天） |
| 易筋经 | 吸星大法 | `counter` | 化解异种真气 | 《笑傲江湖》中方证提出以易筋经化解令狐冲体内异种真气 |
| 斗转星移 | 乾坤大挪移 | — | **不互斥**；同一伤害事件仍只允许一次转移/镜返，防止循环 | 作者决定 P27；反应时序归 design/06、09 |
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
| 左右互搏 | 装配左右互搏 ≥ 5 重者可一人合璧，`Mod_special = 0.8`。《神雕侠侣》中小龙女以左右互搏分使全真剑法与玉女剑法，独自运成玉女素心剑法 |
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

#### 9.3.2 左右互搏 `sk_zuoyouhubo`（天下，`misc/mind`）

原著依据：周伯通所创，一心二用、双手各使一门武功；郭靖、小龙女心思纯一而学会，黄蓉聪明反不能学（射雕/神雕）。

| 规则 | 值 |
|---|---|
| 装配 | 占 1 个杂学栏；`dualWield: int[0,10]` 为运行时派生值：未装配或当前不可用时为 0，否则等于本武学 `effLayer`；副手装备本身不能授予互搏 |
| 行动"分心二用" | 选择来自**两门不同武学**的两个非绝招招式（拳脚＋拳脚，或兵器＋拳脚；兵器＋兵器须副手持同类兵器），可指向不同目标（各自射程以当前位置计算）；依次结算 |
| 倍率 | 每招 `Mod_special = 0.55 + 0.03 × 层`（1 重 0.58 → 10 重 0.85） |
| 消耗 | 行动开始先检查两招总内力；内力 = 两招之和，收招 = `max(R1,R2)+150`，两招各自进入冷却；不能靠第一招吸内补第二招入场成本 |
| 限制 | 两招分别按当前位置检查射程和合法目标；不可含蓄招、绝招，不可在两招之间易运。兵器＋兵器必须有合法同类副手/成对装备并分别满足 `weaponReq` |
| 学习门槛 | 硬门槛 `wis ≤ 85`（`attrsMax`）；软门槛 `wil ≥ 50` |
| 修炼倍率 | 本武学以"纯一系数"代替 `trainWis`：`pureMult = clamp(0.4 + (wil − 0.5 × wis)/50, 0.2, 1.8)`（定力 80、悟性 40 → 1.6；定力 50、悟性 95 → 0.45） |

### 9.4 "破 X" 克制

**通用规则**（"破 X"是持有者身上的效果类 Buff，定义归 design/06；本文规定其数据来源与数值）：

| 项 | 规则 |
|---|---|
| 来源 | 武学被动授予（独孤九剑为主要来源；catalog 中其他武学也可授予单项破 X，品阶 ≤ 地上时单项数值 × 0.6） |
| 匹配 | 按**目标**的主武器类别或**来袭招式**的性质判定（下表） |
| 增伤 | 对匹配目标 Z5 +`poBonus(g, n) = (5 + 2g)% × L(n) / 1.5`（天上 10 重 29%，地上 10 重 23%，玄中 10 重 15%） |
| 破招架 | 匹配目标对持有者攻击的招架率 × `(1 − 0.30 − 0.03 × (n − 1))`（10 重 × 0.43；招架判定归 design/04） |
| 品阶对抗 | 目标带有品阶 ≥ 破 X 品阶的"无破绽"类效果（如太祖长拳 4 重被动）时，该破 X 对其无效（基准 §10） |

**独孤九剑九式与匹配条件**（原著所列兵刃仅作大意；**待考：《笑傲江湖》风清扬传剑段落的完整逐字清单**）：

| 式 | 招式 ID | 原著所破 | 游戏匹配条件 | 破 X Buff（建议 ID） |
|---|---|---|---|---|
| 总诀式 | `mv_dugu9_zongjue` | 总纲口诀，诸式变化之本 | — | — |
| 破剑式 | `mv_dugu9_pojian` | 天下各门各派剑法 | 目标主手 `sword` | `bf_pojian` |
| 破刀式 | `mv_dugu9_podao` | 单刀、双刀、柳叶刀、鬼头刀、大砍刀、斩马刀等 | `blade` | `bf_podao` |
| 破枪式 | `mv_dugu9_poqiang` | 长枪、大戟、蛇矛、齐眉棍、狼牙棒、白蜡杆、禅杖、方便铲等长兵刃 | `spear` 或 `staff` | `bf_poqiang` |
| 破鞭式 | `mv_dugu9_pobian` | 钢鞭、铁锏、点穴橛、拐子、蛾眉刺、匕首、板斧、铁牌、八角槌、铁椎等短兵刃 | `exotic` | `bf_pobian` |
| 破索式 | `mv_dugu9_posuo` | 长索、软鞭、三节棍、链子枪、铁链、渔网、飞锤流星等软兵刃 | `whip` | `bf_posuo` |
| 破掌式 | `mv_dugu9_pozhang` | 拳脚指掌上的功夫 | 目标空手/`unarmed`，或来袭招式为拳脚 | `bf_pozhang` |
| 破箭式 | `mv_dugu9_poanqi` | 诸般暗器；**（待考：《笑傲江湖》风清扬传破箭式段落，核对“听风辨器”说法）** | 来袭为 `projectile` 或 `hidden` 招式 | `bf_poanqi` |
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
- `recalled` 引用 `design/02` §5.6，表示曾成残篇后又重新习得的历史标记；它在当前基础状态卡片上叠加显示“再续朱印”与残篇历史折叠栏，**不替换** `unknown/heard/seen/learned/mastered/fragment`，也不形成第二套互斥状态机。具体视觉归 `design/14` §4.6。

### 11.2 收集奖励（合计上限：图鉴对 `bonusMult` 的贡献 ≤ +20%）

| 里程碑 | 奖励 |
|---|---|
| 见识 30 / 80 / 150 / 250 / 400 门 | 武学常识 `lore` +2 / +3 / +4 / +5 / +6（合计 +20） |
| 习得 20 / 50 / 100 / 150 门 | 观摩领悟 +10% / +10% / +15% / +15% |
| 门派谱：习得某门派图鉴中全部黄/玄/地武学 | 称号；该门派武学修炼 +10%（计入 `bonusMult`）；门派好感（design/12） |
| 天阶习得 5 / 10 / 20 / 30 门 | 5：天阶条目显示可习得书界；10：残篇重修加速额外 +25%；20：书眠携带界面标注"下一书界可印证"的武学；30：称号"天下武学" |
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
| 外来压制 | 自创武学压制基数为原始 `S` 的半额向上取整 `ceil(S/2)`：中武 1、低武 2；与天书抵消共同服从同一个 `ceil(S/2)` 下限，不会永久归零（基准 §3 规则 9；作者决定 P37） |

### 12.4 数量与风险

- 全游戏至多 3 门自创武学，每个大类（内功/拳脚/兵器）至多 1 门；每书界至多进行 1 次融会贯通（替换旧自创者，旧者转为残篇）。
- 完成时走火判定 `0.15 × (1 − wil/120)`（2 级），武学照常生成。
- **平衡检验**：独孤九剑（天上）＋玄铁剑法（天中）→ 地上（9）剑法，5 重起步；进入普通低武时自创武学半额压制 2，成为地下（7），而普通外来降龙十八掌压制 4 后为地中（8）。一个兵器携带位承载两门精华，但品阶和招式仍受产物上限与 0.95 折损。降龙十八掌＋太祖长拳 → 黄中（2），低武半额压制后钳至黄下（1），系统仍惩罚“凑数”。

---

## 13. 完整示例武学

> 9 门示例覆盖：天上掌法（降龙十八掌）、天上剑法（独孤九剑）、天上内功 ×2（易筋经、九阳神功）、黄上"人强则强"（太祖长拳）、玄阶（全真剑法）、地阶（龙爪手）、黄阶入门（罗汉拳），以及 §2.8 的铁砂掌（玄中）。
> 招式效果设计为**原创扩展**（原著只给招名与意象）；招名出处有疑者标"待考"。所有 `power` 已按 §4.2 预算公式核算，核算过程写在行尾注释。

### 13.1 降龙十八掌 `sk_xianglong18`（天上 · 拳脚·掌 · 丐帮）

**招名核对**：十八掌名采用通行列表：亢龙有悔、飞龙在天、见龙在田、鸿渐于陆、潜龙勿用、利涉大川、突如其来、震惊百里、或跃在渊、双龙取水、鱼跃于渊、时乘六龙、密云不雨、损则有孚、龙战于野、履霜冰至、羝羊触藩、神龙摆尾。多数名目见于《射雕》洪七公授郭靖诸回，名目多取自《易经》卦爻辞；**（待考：《射雕英雄传》洪七公传授郭靖降龙掌诸段，核对逐字出处与传授顺序，尤其“鱼跃于渊”“双龙取水”“突如其来”）**。另：新修版《天龙》有"降龙廿八掌"删繁为十八掌之说，本作以修订版为基线，不采用。

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
canonRef: 天龙（萧峰）；射雕（洪七公授郭靖）；神雕；倚天（待考：核对丐帮残传段落）
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
  - { n: 7,  unlock: [mv_xianglong18_miyun, mv_xianglong18_sunze, mv_xianglong18_lianhuan] }
  - { n: 8,  unlock: [mv_xianglong18_longzhan, mv_xianglong18_lvshuang, ps_xianglong18_zhigang] }
  - { n: 9,  unlock: [mv_xianglong18_diyang, mv_xianglong18_shenlong] }
  - { n: 10, unlock: [ps_xianglong18_dacheng] }
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
  - { id: mv_xianglong18_zhenjing,  name: 震惊百里, unlock: 4, kind: attack, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_around}, delivery: melee, mpCost: 0.10, cd: 3, recovery: 1000, power: 1.00, parryable: true,
      buffs: [ {id: bf_xuanyun, chance: 0.3, dur: 1, grade: inherit, to: target} ] }      # 0.75×1.46−0.075=1.020→1.00（六角6格）
  - { id: mv_xianglong18_huoyue,    name: 或跃在渊, unlock: 4, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.05, cd: 2, recovery: 900, power: 0,
      displacement: {type: retreat, n: 2},
      trigger: {on: meleeAttacked, chance: 1.0, perRound: 1, counterPower: 1.00, expires: nextOwnAction} }
  - { id: mv_xianglong18_shuanglong, name: 双龙取水, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.30, hits: 2, parryable: true }  # 1+0.24+0.05
  - { id: mv_xianglong18_yuyue,     name: 鱼跃于渊, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.00, parryable: true,
      note: "跃起高差上限 jump+3；仰攻不受 Z7 低打高惩罚" }                               # 0.9×1.24 −0.10
  - { id: mv_xianglong18_feilong,   name: 飞龙在天, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap, splash: {tpl: aoe_disk, r: 1}}, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1050, power: 1.25, parryable: true,
      note: "主目标 1.25；六角圆盘 r1 的其余 6 格溅射 ×0.5；自高处下击时 Z7 高低差加成 ×2" } # 主目标按无溅射 leap 0.9×1.51−0.10=1.259→1.25；溅射另乘0.5
  - { id: mv_xianglong18_shicheng,  name: 时乘六龙, unlock: 6, kind: attack, target: tile, range: {min: 1, max: 2}, aoe: {tpl: aoe_multi, n: 6, r: 2}, delivery: ranged, mpCost: 0.12, cd: 3, recovery: 1050, power: 1.30, hits: 6, parryable: true }  # 0.85×1.56（远程已含于乱击 AF）
  - { id: mv_xianglong18_miyun,     name: 密云不雨, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 3, recovery: 1000, power: 0.80, parryable: true,
      buffs: [ {id: bf_miyun, chance: 1.0, dur: 2, grade: inherit, to: target} ],
      note: "封绝：2 回合不能施放绝招；目标气势 −30" }                                   # 1.41 −0.40 −0.20
  - { id: mv_xianglong18_sunze,     name: 损则有孚, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, hpCost: 0.08, cd: 2, recovery: 1000, power: 1.70, parryable: true,
      note: "有孚：击杀目标时返还所损气血" }                                               # 1+0.48+0.24
  - { id: mv_xianglong18_longzhan,  name: 龙战于野, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1100, power: 1.05, parryable: true,
      displacement: {type: knock, n: 1} }                                                  # 六角7格 AF0.70×1.58−0.05=1.056→1.05
  - { id: mv_xianglong18_lvshuang,  name: 履霜冰至, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1000, power: 0.90, parryable: true,
      buffs: [ {id: bf_lvshuang, chance: 1.0, dur: 3, stacks: 1, grade: inherit, to: target} ],
      note: "履霜：每层速度 −5%（上限 4 层）；满 4 层时'冰至'：清空层数，追加一段 0.8 倍伤害并定身 1 回合" }
  - { id: mv_xianglong18_diyang,    name: 羝羊触藩, unlock: 9, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3}, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.05, parryable: true,
      buffs: [ {id: bf_dingshen, chance: 0.6, dur: 1, grade: inherit, to: target} ] }      # 1.29 −0.10 −0.15
  - { id: mv_xianglong18_shenlong,  name: 神龙摆尾, unlock: 9, kind: attack, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 0.95, parryable: true,
      trigger: {on: backAttacked, chance: 0.5, perRound: 1, counterPower: 1.20},
      note: "主动：以自身当前朝向的反方向为 aim，横扫身后三格；被动：遭背击时 50% 反身一掌" } # 六角120° r1为3格，0.85×1.12=0.952→0.95
  - { id: mv_xianglong18_lianhuan,  name: 十八掌连环, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.00, hits: 6, parryable: true,
      displacement: {type: knock, n: 2}, anim: {cutin: cutin/xianglong18},
      note: "（原创扩展命名）十八掌一气呵成：演出依次打出十八掌意象；10 重大成后 ×1.2" }     # 六角7格 AF0.70：3.0×0.70−0.10=2.00
passives:
  - { id: ps_xianglong18_gangmeng, name: 刚猛, unlock: 1, kind: stat, zone: Z2, value: [0.08, 0.20], scope: self, text: "降龙招式无视目标 {v} 外功防御" }
  - { id: ps_xianglong18_longyin,  name: 龙吟, unlock: 3, kind: trigger, trigger: {on: skillUsed, cond: differentMoveThanLast}, buff: {id: bf_longyin, stacks: 1, max: 5, grade: inherit, dur: 2}, zone: Z3, value: 0.04, scope: self,
      text: "连续使用不同的降龙掌：每层降龙招式伤害 +4%，至多 5 层" }
  - { id: ps_xianglong18_youyu,    name: 有余不尽, unlock: 5, kind: effect, value: {mpCostMult: 0.9, killRefund: 0.3}, scope: self, text: "降龙招式耗内 −10%；击杀时返还 30% 耗内（亢龙有悔为 50%）" }
  - { id: ps_xianglong18_zhigang,  name: 至刚至阳, unlock: 8, kind: stat, zone: Z0, value: 15, scope: self, cond: {mainInnerNature: yang}, text: "主运为阳时，降龙招式破招 +15" }
  - { id: ps_xianglong18_dacheng,  name: 降龙大成, unlock: 10, kind: mechanic, value: {cdMinus: 1, moveSlotsPlus: 1, ultPowerMult: 1.2}, scope: self, text: "所有降龙招式冷却 −1（最低 0）；招式栏 +1；十八掌连环威力 ×1.2" }
setTags: [set_gaibang_bangzhu, set_guojing_xiazhe, set_qidan_xiaofeng]  # C22；套装本体归 design/07
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong,  ref: npc_xiaofeng,     maxLayer: 10, note: "与萧峰结义后的羁绊传授（原创扩展）" }
  - { type: master, chapter: ch02_shediao,   ref: npc_hongqigong,   maxLayer: 10, note: "以美食换武功（原著洪七公授郭靖情节的致敬）" }
  - { type: master, chapter: ch03_shendiao,  ref: npc_guojing,      maxLayer: 10, note: "襄阳线（原创扩展）" }
  - { type: manual, chapter: ch04_yitian,    ref: it_miji_xianglong18_can, maxLayer: 6, note: "丐帮残本：前十二掌（待考：《倚天屠龙记》丐帮残传段落的实际掌数；不参与层数计算）" }
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
  - { n: 7,  unlock: [mv_dugu9_poanqi, mv_dugu9_wuzhao] }
  - { n: 8,  unlock: [mv_dugu9_poqi] }
  - { n: 9,  unlock: [ps_dugu9_yiwu] }
  - { n: 10, unlock: [ps_dugu9_wuzhao] }
moves:
  - { id: mv_dugu9_zongjue, name: 总诀式, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 0, recovery: 900, power: 0.90, parryable: true,
      buffs: [ {id: bf_duguyi, chance: 1.0, stacks: 1, max: 9, dur: 99, grade: inherit, to: self} ],
      note: "剑意：每层本武学暴击 +2，战斗内保留" }                                         # 1−0.05−0.07≈0.88
  # 破招组：UI 只显示一个"破招"按钮，按目标自动解析；条件不满足的式不可选。
  # 破剑/刀/枪/鞭/掌/箭六式的“目标类别精确匹配”按 §4.2 罕见条件 +0.30：
  # (1+0.12+0.30)×0.85−0.10×0.60=1.147；配置 1.10 的差值为 −0.047，在 ±0.05 容差内。
  - { id: mv_dugu9_pojian,  name: 破剑式, unlock: 1, autoGroup: dugu_po, condition: {targetWeapon: [sword]},          kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, parryable: false,
      buffs: [ {id: bf_pozhao, chance: 0.6, dur: 1, grade: inherit, to: target} ] }
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
  - { id: mv_dugu9_wuzhao,  name: 无招胜有招, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1100, power: 2.50, parryable: false, counterable: false,
      cleanse: {side: target, tags: [stance, guard], count: 1, maxGrade: inherit}, anim: {cutin: cutin/dugu9} }   # 3.0×0.85 −0.07 ≈2.48
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
      value: { immuneToPoX: true, uncounterable: true, ultPowerMult: 1.2 }, text: "本武学招式不受敌方任何破 X 克制、不可被反击；无招胜有招威力 ×1.2" }
setTags: [set_dugu_jianzhong]             # C22；套装本体归 design/07
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
canonRef: 天龙（游坦之由梵文经书误打误撞练成）；笑傲（方证欲传令狐冲）；射雕/倚天投放为本作传承扩展
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
  meridians: [mer_renmai, mer_dumai]                    # 【建议值】专精接口；正式效应归 design/15
  yunjin: [tiaoxi, huti, liaoshang, huajie]
  auxYunjin: [liaoshang, huajie]
  bridge: true
  seclusionCap: 10
  auxUsableMoves: []
moveSlots: 5
layers:
  - { n: 1,  unlock: [ps_yijinjing_yijin] }
  - { n: 3,  unlock: [mv_yijinjing_xisui, ps_yijinjing_famao] }
  - { n: 5,  unlock: [mv_yijinjing_weituo, ps_yijinjing_huayi] }
  - { n: 6,  unlock: [mv_yijinjing_daozhuai] }
  - { n: 7,  unlock: [ps_yijinjing_jingang, mv_yijinjing_huangu] }
  - { n: 8,  unlock: [ps_yijinjing_baibing] }
  - { n: 10, unlock: [ps_yijinjing_dacheng] }
moves:
  - { id: mv_yijinjing_xisui,   name: 洗髓, unlock: 3, kind: support, yunjinMode: huajie, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.10, cd: 4, recovery: 900, power: 0,
      cleanse: {side: self, tags: [poison, injury, seal, cold, heat], count: all, maxGrade: inherit}, heal: {base: targetHpMax, pct: 0.10},
      note: "亦可移除品阶 ≤ 自身的走火入魔 1–2 级" }
  - { id: mv_yijinjing_weituo,  name: 韦陀献杵, unlock: 5, kind: stance, yunjinMode: huti, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.08, cd: 3, recovery: 800, power: 0,
      buffs: [ {id: bf_weituo, dur: 2, grade: inherit, to: self} ], note: "受到伤害 −25%（Z4），控制抗性 resCC +30" }
  - { id: mv_yijinjing_daozhuai, name: 倒拽九牛尾, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_pull, n: 2}, delivery: ranged, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.10, parryable: true, nature: harmony }   # 0.95×1.29 −0.10（气劲拉拽视作近身接触判定）
  - { id: mv_yijinjing_huangu,  name: 易筋换骨, unlock: 7, kind: support, yunjinMode: liaoshang, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 2}, delivery: self, mpCost: 0, cd: 0, recovery: 1000, power: 0,
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
setTags: [set_shaolin_jingang, set_shaolin_damo, set_saodiseng, set_fangzheng]  # C22；套装本体归 design/07
conflicts:
  - { with: sk_xixing, type: counter, note: 化解异种真气 }
  - { with: sk_qishangquan, type: counter, note: 七伤拳不伤己（≥ 5 重） }
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_shaolin_fangzhang, maxLayer: 10, note: "少林职级 4（执事）以上，方丈许可" }
  - { type: qiyu,   chapter: ch01_tianlong, ref: q_01_qiyu_91, maxLayer: 8, reqsOverride: { sect: null },
      note: "无心插柳：不求武功者偶得梵文经书（致敬游坦之情节，原创扩展）；仍须 wil ≥ 70，且从未主动询问易筋经" }
  - { type: master, chapter: ch02_shediao, ref: npc_shaolin_fangzhang, maxLayer: 10, note: "金国治下嵩山少林完整线（原创扩展；须满足少林授艺资格）" }
  - { type: master, chapter: ch04_yitian, ref: npc_kongwen, maxLayer: 10, note: "屠狮大会后空闻方丈传授（原创扩展；须满足少林授艺资格）" }
  - { type: master, chapter: ch05_xiaoao,   ref: npc_fangzheng, maxLayer: 10, note: "笑傲印证事件载体（§7.8，design/02 §2.2）" }
special: { fusible: true }
observable: false
description: >-
  少林至高内功，易筋锻骨、洗髓伐毛，内力浑厚绵长，能化解各路异种真气与内伤。修习者须心无挂碍，
  求之愈切，得之愈难。
```

### 13.4 九阳神功 `sk_jiuyang`（天上 · 内功 · 阳）

设计要点："他强由他强，清风拂山岗；他横由他横，明月照大江"（原著九阳真经口诀）→ 对强敌减伤与反震；寒毒克星；"触类旁通"加速其他武学（原著张无忌凭九阳根基速成乾坤大挪移与太极；**待考：《倚天屠龙记》相关练功段落的速度描写**）。

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
  meridians: [mer_renmai, mer_dumai]                    # 【建议值】与倚天图鉴接口一致；正式效应归 design/15
  yunjin: [tiaoxi, huti, bidu, liaoshang, cuiqinggong]
  auxYunjin: [liaoshang]
  seclusionCap: 8
  auxUsableMoves: [mv_jiuyang_liaoshang]
moveSlots: 5
layers:
  - { n: 2,  unlock: [ps_jiuyang_taqiang] }
  - { n: 3,  unlock: [mv_jiuyang_huti] }
  - { n: 4,  unlock: [ps_jiuyang_taheng] }
  - { n: 5,  unlock: [mv_jiuyang_liaoshang, ps_jiuyang_hutizhenqi] }
  - { n: 6,  unlock: [ps_jiuyang_hanbuqin] }
  - { n: 7,  unlock: [ps_jiuyang_shengsheng, mv_jiuyang_puzhao] }
  - { n: 8,  unlock: [ps_jiuyang_chulei] }
  - { n: 10, unlock: [ps_jiuyang_dacheng] }
moves:
  - { id: mv_jiuyang_huti, name: 九阳护体, unlock: 3, kind: support, yunjinMode: huti, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.12, cd: 3, recovery: 900, power: 0,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctHpMax: 0.15}, dur: 3, grade: inherit, to: self} ], cleanse: {side: self, tags: [cold], count: 1, maxGrade: inherit} }
  - { id: mv_jiuyang_liaoshang, name: 九阳疗伤, unlock: 5, kind: support, yunjinMode: liaoshang, target: ally, range: {min: 0, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.14, cd: 3, recovery: 1000, power: 0,
      heal: {base: targetHpMax, pct: 0.18}, cleanse: {side: target, tags: [injury, cold], count: 2, maxGrade: inherit} }     # 标准治疗 18%；可作辅运使用
  - { id: mv_jiuyang_puzhao, name: 九阳普照, unlock: 7, kind: support, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 3}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 1.50,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctCasterHpMax: 0.20}, dur: 3, grade: inherit, to: allies} ], cleanse: {side: allies, tags: [cold, poison], count: 2, maxGrade: inherit},
      note: "（原创扩展命名）友方护盾与驱散；同时对周身六格敌人造成 1.5 倍内劲伤害（aoe_around，wIn 1）" }
passives:
  - { id: ps_jiuyang_taqiang,     name: 他强由他强, unlock: 2, kind: stat, zone: Z4, value: [0.08, 0.20], cond: {attackerAtkSumGtSelf: true}, scope: unit, auxMode: scaled }
  - { id: ps_jiuyang_taheng,      name: 他横由他横, unlock: 4, kind: effect, zone: settle, value: {reflectMeleePct: [0.05, 0.12], asInner: true}, scope: unit, auxMode: scaled }
  - { id: ps_jiuyang_hutizhenqi,  name: 九阳真气, unlock: 5, kind: trigger, trigger: {on: battleStart}, buff: {id: bf_hutizhenqi, value: {shieldPctHpMax: [0.08, 0.20]}, grade: inherit, dur: 99}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_hanbuqin,    name: 寒毒不侵, unlock: 6, kind: mechanic, value: {buff: bf_mian_han, immuneTags: [cold], maxGrade: inherit}, scope: unit, auxMode: full,
      text: "仅免疫品阶不高于本功有效品阶的 cold 类新效果；不赋予毒免或内伤免疫" }
  - { id: ps_jiuyang_shengsheng,  name: 生生不息, unlock: 7, kind: effect, value: {mpRegenMultWhenBelow: {mpPct: 0.20, mult: 2}}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_chulei,      name: 触类旁通, unlock: 8, kind: mechanic, value: {sxpBonus: {categories: [inner, unarmed, weapon], value: 0.25}, expCostMult: {skill: sk_qiankun, mult: 0.2}}, scope: unit, auxMode: none }
  - { id: ps_jiuyang_dacheng,     name: 九阳大成, unlock: 10, kind: stat, zone: Z4, value: {innerDmgTaken: -0.10, poisonDurMult: 0.5}, scope: unit, auxMode: scaled,
      text: "本被动当前可用时内劲伤害承受 −10%、普通中毒持续减半；不等于毒免、内伤免疫或根治特殊毒" }
setTags: []
conflicts:
  - { with: sk_xuanming, type: counter, note: 6 重起免疫玄冥寒毒（品阶 ≤ 自身） }
  - { with: sk_qishangquan, type: counter, note: 七伤拳不伤己（≥ 5 重） }
learnSources:
  - { type: qiyu, chapter: ch04_yitian,   ref: q_04_qiyu_91,     maxLayer: 10, note: "昆仑山谷白猿腹中经书（原著）" }
special: { fusible: true }
observable: false
description: >-
  《九阳真经》所载内功，至刚至阳，内力生生不息，百脉通畅，寒毒不侵。"他强由他强，清风拂山岗"——
  对手越强，越难撼动其根基。
```

神雕末尾的闻经仅由 chapters/03 写入图鉴 `heard` 状态和剧情标记 `jiuyang_echo`，**不是** `LearnSource`，不增加 `sourceCap/sourceGrade`、不授予层数或修炼倍率；九阳只可在倚天完整习得（作者决定 P10）。具体“神雕末尾 / 倚天开篇”的文本分界仍列 §17.4 考据。

### 13.5 太祖长拳 `sk_taizuchangquan`（黄上 · 拳脚·拳 · 通行）——"招式平凡，人强则强"

原著依据：《天龙八部》聚贤庄一役中，萧峰以太祖长拳应对群雄，以平常拳路发挥极强威力；具体交手对象与原文仍**（待考：《天龙八部》聚贤庄群战段落）**。下列“冲阵斩将”“千里横行”“长拳贯日”均为**（原创扩展命名）**，不作为原著招名。

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
sourceChapters: [ch01_tianlong, ch02_shediao, ch03_shendiao, ch04_yitian, ch05_xiaoao, ch06_xiake, ch07_bixue, ch08_luding, ch09_liancheng, ch10_baima, ch11_yuanyang, ch12_shujian, ch13_feihu, ch14_xueshan]
canonRef: 天龙·聚贤庄（萧峰）；三招名均为原创扩展
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
      note: "（原创扩展命名）" }                                                             # 1+0.12=1.12→1.10
  - { id: mv_taizuchangquan_qianli,    name: 千里横行, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_sequence, steps: [{tpl: aoe_dash, n: 3}, {tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}]}, delivery: melee, mpCost: 0.06, cd: 2, recovery: 1000, power: 1.00, parryable: true,
      effects: [{hook: sequenceStage, index: 1, damageMult: 0}, {hook: sequenceStage, index: 2, damageMult: 1.0}],
      note: "（原创扩展命名）第一段只突进、不结算伤害与 Buff；到达后按同次行动 aim 横扫前方三格，第二段使用本招全部 power" } # 伤害段Nmax=3，AF0.85×1.29−0.10=0.997→1.00
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
setTags: [set_jianghu_baijia, set_qidan_xiaofeng]       # C22；通行图鉴与人物套装双向闭合
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: npc_generic_jiaotou, maxLayer: 10, note: "各书界军中教头、镖师或武馆师父复用此来源模板；除《天龙八部》聚贤庄关联外，后世获取均为原创扩展" }
  - { type: manual, chapter: ch02_shediao,  ref: it_miji_taizuchangquan, maxLayer: 10, note: "此条为模板实例；落库时由各书界配置同 ID 本土来源" }
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
  - { n: 6,  unlock: [mv_quanzhenjian_sanqing] }
  - { n: 7,  unlock: [mv_quanzhenjian_chongyang] }
  - { n: 8,  unlock: [ps_quanzhenjian_tongqi] }
  - { n: 10, unlock: [ps_quanzhenjian_dacheng] }
moves:   # 玄阶耗内基准 6%
  - { id: mv_quanzhenjian_dingyang, name: 定阳针, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.06, cd: 0, recovery: 1000, power: 1.00, parryable: true,
      note: "（原创扩展命名）未把未经核对的通行招名当作原著" }
  - { id: mv_quanzhenjian_qixing,   name: 七星聚会, unlock: 4, kind: attack, target: tile, range: {min: 1, max: 1}, aoe: {tpl: aoe_multi, n: 7, r: 1}, delivery: melee, mpCost: 0.07, cd: 2, recovery: 1000, power: 1.10, hits: 7, parryable: true,
      note: "（原创扩展命名）" }                                                             # 0.85×1.29
  - { id: mv_quanzhenjian_sanqing,  name: 三清朝元, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_line, n: 3}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 0.95, parryable: true,
      buffs: [ {id: bf_jianshi, dur: 2, grade: inherit, to: self} ], note: "（原创扩展命名）剑势：自身暴击 +10，2 回合" }   # 0.8×1.34 −0.10
  - { id: mv_quanzhenjian_chongyang, name: 重阳遗意, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1200, power: 3.00, parryable: true,
      note: "（原创扩展命名）" }
passives:
  - { id: ps_quanzhenjian_xuanmen, name: 玄门正宗, unlock: 2, kind: stat, zone: Z3, value: 0.08, cond: {mainInnerSect: sect_quanzhen}, scope: self }
  - { id: ps_quanzhenjian_jiansui, name: 剑随身走, unlock: 5, kind: trigger, trigger: {on: turnStart, cond: movedTilesGte2ThisAction}, value: {hit: 10}, scope: self,
      text: "本次行动已移动 ≥ 2 格时，本武学招式命中 +10" }
  - { id: ps_quanzhenjian_tongqi,  name: 同气连枝, unlock: 8, kind: stat, value: {parryPerAdjacentAlly: 3, max: 9, allyCond: {hasSkillOfSect: sect_quanzhen}}, scope: unit }
  - { id: ps_quanzhenjian_dacheng, name: 全真剑法大成, unlock: 10, kind: stat, zone: Z3, value: 0.06, scope: self, text: "本武学招式伤害 +6%" }
setTags: [set_quanzhen_beidou, set_shendiao_xialv]      # C22；套装本体归 design/07
conflicts: []
learnSources:
  - { type: master, chapter: ch02_shediao,  ref: npc_quanzhen_sandai, maxLayer: 10 }
  - { type: master, chapter: ch03_shendiao, ref: npc_quanzhen_sandai, maxLayer: 10 }
  - { type: puzzle, chapter: ch03_shendiao, ref: q_03_side_91, maxLayer: 10, reqsOverride: { sect: null },
      note: "古墓石室所刻全真武功；据《神雕侠侣》杨过、小龙女研习全真与玉女武功的情节，本作据此配置完整学习来源（原创扩展）" }
  - { type: observe, maxLayer: 6 }
special: { fusible: true }
observable: true
description: >-
  全真派入门至中乘的剑法，端凝正大、攻守兼备。与古墓玉女剑法招招相克，二人分使则合为玉女素心剑法。
  招式效果与大部分招名为本作原创扩展。
```

### 13.7 龙爪手 `sk_longzhaoshou`（地中 · 拳脚·擒拿 · 少林七十二绝技）

原著依据：少林七十二绝技之一；倚天光明顶一役，空性神僧以龙爪手对张无忌，张无忌观而学之、以同一路龙爪手胜之。通行资料列“捕风、捉影、抚琴、鼓瑟、批亢、捣虚、抱残、守缺”诸式，并称全套三十六招；**（待考：《倚天屠龙记》光明顶空性与张无忌交手段落，核对八式逐字及是否明言三十六招）**。本武学即用户所举"少林金刚套装"中的"金刚龙爪手"。

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
canonRef: 倚天·光明顶（空性 vs 张无忌；待考：核对八式逐字）
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
  - { id: mv_longzhaoshou_guse,    name: 鼓瑟式, unlock: 4, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 0.95, parryable: true,
      buffs: [ {id: bf_fengxue, chance: 0.15, dur: 1, grade: inherit, to: target} ] }      # 六角3格 AF0.85×1.17−0.03=0.965→0.95
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
  - { type: observe, chapter: ch04_yitian,   ref: npc_kongxing, maxLayer: 6, reqsOverride: { sect: null, prereq: [], hard: [] },
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
canonRef: 少林入门拳法（跨书投放为本作汇总）；本文三招名均为原创扩展
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

### 13.9 示例招式的效果钩子对照（note → `effects`）

§13 示例中 `note` 描述的机制，入库时以 §4.11 的效果钩子表达：

| 招式 | effects |
|---|---|
| 亢龙有悔 | `refundMpOnKill{pct:0.5}`；`buffs[bf_liuli].cond = notKill` |
| 利涉大川 | `terrainNoFalloff{tags:[water]}` |
| 突如其来 | `firstActionBonus{crit:20}` |
| 或跃在渊 / 抱残式 | `stanceCounter{counterPower:1.0, expires:nextOwnAction, applyBuff?}` |
| 鱼跃于渊 | `leapHeightExtra{n:1}`、`noLowGroundPenalty{}` |
| 飞龙在天 | `heightBonusMult{mult:2}`、`splashMult{mult:0.5}` |
| 密云不雨 | `rageDrain{value:30}` |
| 损则有孚 | `refundHpCostOnKill{}` |
| 履霜冰至 | `stackDetonate{buff:bf_lvshuang, at:4, extraPower:0.8, applyBuff:bf_dingshen, dur:1}` |
| 神龙摆尾 | `aoe.facing = back`；`trigger{on:backAttacked}` |
| 总诀式 | `buffs[bf_duguyi]`（剑意叠层，效果由 Buff 定义） |
| 破枪式 | `ignoreReach{}` |
| 破箭式 | `deflectProjectile{chance:[0.35,0.60], reflectFromLayer:9, reflectPct:0.5}` |
| 破气式 | `shieldDmgMult{mult:2}`、`ignoreDef{in:0.2}` |
| 洗髓 | `cleanseZouhuo{maxLevel:2}` |
| 易筋换骨 | `restoreMp{pct:0.5, selfOnly:true}` |
| 九阳普照 | `secondaryAoe{tpl:aoe_around, target:enemy, power:1.5, wIn:1}` |
| 千里横行 | `aoe_sequence.steps = [aoe_dash, aoe_cone]`；`sequenceStage{index:1,damageMult:0}`；`sequenceStage{index:2,damageMult:1}` |
| 批亢式 | `critBonus{value:15}` |
| 捣虚式 | `ignoreDef{out:0.2}` |

**10 重主力招式威力自检**（`P = G × L(10) × power`，本土、无压制）：

| 武学 | 招式 | P | 备注 |
|---|---|---|---|
| 降龙十八掌 | 亢龙有悔 / 双龙取水 / 十八掌连环 | 6.30 / 6.83 / 12.60（锥形每目标，含大成 ×1.2） | `3.5×1.5×1.20=6.30`；`3.5×1.5×1.30=6.825`；绝招 `3.5×1.5×2.00×1.20=12.60`。7 重尚无大成：`3.5×1.2×2.00=8.40` |
| 独孤九剑 | 总诀式 / 破 X 式 / 无招胜有招 | 4.73 / 5.78（另有 Z5 +29%、破招架） / 15.75（含大成 ×1.2） | 六个 `power:1.10` 的类别匹配式预算为 `(1+0.12+0.30)×0.85−0.06=1.147`，与配置差 `−0.047`；实战值 `3.5×1.5×1.10=5.775≈5.78`。依赖克制，打无匹配目标时弱于降龙 |
| 太祖长拳（Lv 70） | 冲阵斩将 / 长拳贯日 | 3.41 / 4.02 | ≈ 地下 10 重水准 |
| 龙爪手 | 批亢式 / 三十六路 | 3.96 / 8.91 | 控制强 |
| 全真剑法 | 定阳针 / 重阳遗意 | 2.33 / 6.98 | |
| 铁砂掌 | 开碑手 | 2.44 | |
| 罗汉拳 | 罗汉撞钟 | 1.58 | |

---

## 14. 武学数量与品阶分布规划（`design/catalog/` 的约束）

> 本节统计快照为 2026-09-26。计数单位是图鉴中唯一归属、玩家可习得的 `sk_*` 定义；不计 `sk_basic`、玩家自创武学与 `enemyOnly: true` 条目。序章教学武学计入定义库。古龙图鉴是 AR-08 的补充图鉴，纳入全局规模与类别统计，但不是十册金庸核心图鉴之一。

### 14.1 总量

| 口径 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 当前实际 | 51 | 169 | 368 | 332 | **920** |
| AR-01 名义锚点 | 51 | 约 153 | 约 459 | 约 459 | **约 1,122** |
| 本轮受控目标 | 51 | 169 | 459 | 459 | **1,138** |
| 尚缺（目标−实际） | 0 | 0 | 91 | 127 | **218** |

- 作者需求 AR-01 要求天:地:玄:黄约 `1:3:9:9`、合计 1,100–1,150。天阶 51 门仍是基准 §13 的封闭集合（天下 28、天中 15、天上 8），不得为凑比例新增第 52 门。
- 现有地阶已经有 169 门，且 CXs/CXw/CXd/CXx 的边界是“只增不减”。因此不删除 16 门地阶，采用可执行目标 **51/169/459/459=1,138**：地/天为 `169÷51=3.31`，相对 3 偏差 `10.46%`，仍在 AR-01 单册比例的 ±15% 容差内；玄、黄各为天阶的 9 倍。
- 后续扩充只补玄 91、黄 127；不得用升降现有品阶、删除既有 ID 或新增天阶制造表面达标。十册金庸核心图鉴当前 852 门（51/159/339/303），AR-08 古龙补充图鉴 68 门（0/10/29/29）。

### 14.2 按品阶

十二品目标在各大阶内按当前构成用最大余数法分配；大阶目标仍以 §14.1 为准。

**实际图鉴 × 十二品**（单元格为“实际/受控目标”；列序均为黄下、黄中、黄上、玄下、玄中、玄上、地下、地中、地上、天下、天中、天上）：

| 实际文件 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `skills-shaolin.md` | 3/3 | 5/6 | 6/9 | 6/6 | 11/11 | 10/10 | 8/8 | 10/10 | 8/8 | 2/2 | 0/0 | 1/1 | 70/74 |
| `skills-wujue.md` | 1/2 | 9/38 | 9/35 | 6/16 | 11/28 | 11/27 | 11/11 | 6/6 | 6/6 | 8/8 | 2/2 | 3/3 | 83/182 |
| `skills-daojia.md` | 2/5 | 4/13 | 9/28 | 2/5 | 10/17 | 13/22 | 9/9 | 7/7 | 2/2 | 2/2 | 6/6 | 0/0 | 66/116 |
| `skills-xiaoyao.md` | 4/9 | 8/22 | 10/27 | 6/13 | 7/16 | 13/26 | 5/5 | 4/4 | 5/5 | 5/5 | 4/4 | 1/1 | 72/137 |
| `skills-yitian.md` | 0/0 | 16/16 | 20/20 | 7/7 | 13/13 | 16/16 | 4/4 | 4/4 | 4/4 | 2/2 | 1/1 | 1/1 | 88/88 |
| `skills-xiake-bixue.md` | 2/2 | 23/23 | 11/11 | 7/7 | 17/17 | 12/12 | 5/5 | 6/6 | 1/1 | 3/3 | 0/0 | 1/1 | 88/88 |
| `skills-wuyue.md` | 0/0 | 17/17 | 19/19 | 4/4 | 17/17 | 15/15 | 5/5 | 5/5 | 2/2 | 1/1 | 2/2 | 1/1 | 88/88 |
| `skills-kangxi.md` | 1/1 | 16/16 | 20/20 | 14/14 | 14/14 | 9/9 | 5/5 | 5/5 | 4/4 | 2/2 | 0/0 | 0/0 | 90/90 |
| `skills-qianlong.md` | 0/0 | 11/11 | 19/19 | 9/9 | 11/11 | 10/10 | 5/5 | 3/3 | 1/1 | 3/3 | 0/0 | 0/0 | 72/72 |
| `skills-general.md` | 11/11 | 25/25 | 22/22 | 19/19 | 22/22 | 17/17 | 8/8 | 9/9 | 2/2 | 0/0 | 0/0 | 0/0 | 135/135 |
| `skills-gulong.md`（补充） | 0/0 | 5/5 | 24/24 | 1/1 | 2/2 | 26/26 | 1/1 | 1/1 | 8/8 | 0/0 | 0/0 | 0/0 | 68/68 |
| **合计** | **24/33** | **139/192** | **169/234** | **81/101** | **135/168** | **152/190** | **66/66** | **60/60** | **43/43** | **28/28** | **15/15** | **8/8** | **920/1,138** |

实际列直接采用各图鉴审校后的统计表；对未单列十二品汇总的图鉴，按其唯一归属条目的绝对 `grade` 逐 ID 归并。目标列先锁定 §14.5 的逐册大阶配额与下表的全局十二品目标，再以当前细阶构成为权重做双约束最大余数分配；因此每册、每个细阶和全局总量同时闭合。它是 CX 的配额护栏，允许在不改变逐册大阶配额和全局十二品目标的前提下互换新增条目的细阶。

四个 CX 的**十二品新增量**依次为：少林 `0/1/3/0/0/0/0/0/0/0/0/0`；五绝 `1/29/26/10/17/16/0/0/0/0/0/0`；道家 `3/9/19/3/7/9/0/0/0/0/0/0`；逍遥 `5/14/17/7/9/13/0/0/0/0/0/0`。逐列合计为 `9/53/65/20/33/38/0/0/0/0/0/0=218`。

| 品阶 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 实际 | 24 | 139 | 169 | 81 | 135 | 152 | 66 | 60 | 43 | 28 | 15 | 8 | **920** |
| 目标 | 33 | 192 | 234 | 101 | 168 | 190 | 66 | 60 | 43 | 28 | 15 | 8 | **1,138** |
| 尚缺 | 9 | 53 | 65 | 20 | 33 | 38 | 0 | 0 | 0 | 0 | 0 | 0 | **218** |
| 大阶实际 / 目标 | | 黄 **332 / 459** | | | 玄 **368 / 459** | | | 地 **169 / 169** | | | 天 **51 / 51** | | |

目标分摊核算示例：玄下 `459×81÷368=101.09→101`，黄下 `459×24÷332=33.18→33`；其余余数按小数部分由大到小补齐，使玄、黄各恰为 459。此分摊只控制库存结构，不取代各图鉴 §14.5 的扩充配额。

### 14.3 按类别 × 大阶

类别目标保持天、地现状不动，把玄 91、黄 127 按各类别当前玄/黄构成分别用最大余数法分配；它是扩充的结构护栏，不要求每个类别内部也机械达到 `1:3:9:9`。

| 大类 | 天 实际/目标 | 地 实际/目标 | 玄 实际/目标 | 黄 实际/目标 | 合计 实际/目标 | 尚缺（天/地/玄/黄） |
|---|---:|---:|---:|---:|---:|---:|
| 内功 | 13/13 | 26/26 | 56/70 | 65/90 | 160/199 | 0/0/14/25 |
| 拳脚 | 18/18 | 39/39 | 87/109 | 98/136 | 242/302 | 0/0/22/38 |
| 兵器 | 7/7 | 50/50 | 104/130 | 119/164 | 280/351 | 0/0/26/45 |
| 轻功 | 2/2 | 11/11 | 34/42 | 39/54 | 86/109 | 0/0/8/15 |
| 暗器 | 1/1 | 7/7 | 25/31 | 3/4 | 36/43 | 0/0/6/1 |
| 杂学 | 10/10 | 36/36 | 62/77 | 8/11 | 116/134 | 0/0/15/3 |
| **合计** | **51/51** | **169/169** | **368/459** | **332/459** | **920/1,138** | **0/0/91/127** |

现状最显著的结构偏斜是黄阶暗器只有 3 门、黄阶杂学只有 8 门；CX 扩充至少应补到表中 4 / 11 门，但在不突破各图鉴总配额的前提下，优先让新增内容形成可验证的门派入门链和同类兵器路径。

### 14.4 按书界（首现与全部路线可习得池）

统计口径：

- **首现**：一个唯一武学 ID 的最早原生 `sourceChapters`；同一 ID 后世复现不重复计数。`skills-general.md` 的“明清各界 / 清代各界 / 后世武馆”按该图鉴语义展开后取最早书界。
- **全部路线可习得池**：同一书界、同一 ID 去重，取玩家在任一合法路线可取得的最高来源品阶；包含正邪互斥路线并集和可新学残承，不含只见闻、仅由外界携带、敌人专用与玩家自创。它不等于单周目取得数。
- 受控目标新增的 218 门尚未写入图鉴，故首现目标仅按现有首现比例给出玄/黄分配参考；章节与 F2 最终仍须以扩充后的 `sourceChapters` 重算，不得为了命中表格虚构来源。

| 书界 | 境界 | 首现实际 天/地/玄/黄 | 首现合计 | 首现受控目标 天/地/玄/黄 | 目标合计 |
|---|---|---:|---:|---:|---:|
| 序章 越女剑 | 教学 | 0/1/3/6 | 10 | 0/1/4/8 | 13 |
| 01 天龙 | 高 | 14/45/88/93 | 240 | 14/45/110/129 | 298 |
| 02 射雕 | 高 | 11/24/29/15 | 79 | 11/24/36/21 | 92 |
| 03 神雕 | 高 | 5/11/17/7 | 40 | 5/11/21/10 | 47 |
| 04 倚天 | 高 | 8/22/43/40 | 113 | 8/22/54/55 | 139 |
| 05 笑傲 | 中 | 4/17/56/42 | 119 | 4/17/70/58 | 149 |
| 06 侠客 | 中 | 2/12/30/29 | 73 | 2/12/37/40 | 91 |
| 07 碧血 | 中 | 2/10/26/29 | 67 | 2/10/32/40 | 84 |
| 08 鹿鼎 | 低 | 1/7/14/13 | 35 | 1/7/18/18 | 44 |
| 09 连城 | 低 | 1/4/10/9 | 24 | 1/4/13/13 | 31 |
| 10 白马 | 低 | 0/2/8/8 | 18 | 0/2/10/11 | 23 |
| 11 鸳鸯 | 低 | 0/2/9/9 | 20 | 0/2/11/12 | 25 |
| 12 书剑 | 中 | 2/7/18/14 | 41 | 2/7/22/19 | 50 |
| 13 飞狐 | 中 | 1/5/17/18 | 41 | 1/5/21/25 | 52 |
| 14 雪山 | 中 | 0/0/0/0 | 0 | 0/0/0/0 | 0 |
| **合计** | | **51/169/368/332** | **920** | **51/169/459/459** | **1,138** |

雪山首现为 0 不表示无可学武学，而表示其池均为早期 ID 的复现。少林图鉴 §5.3 的“首现”汇总列与逐条最早来源不能闭合；上表按逐条来源归并，详见 §14.7。

**当前全部路线可习得池实际值 / 目标区间**（序章 0/1/3/6=10 为固定教学池，不套正式书界占比）：

| 书界 | 境界 | 实际 天/地/玄/黄 = 合计 | 实际占比（天/地/玄/黄） | 目标占比 | 结论 |
|---|---|---:|---:|---:|---|
| 天龙 | 高 | 14/45/88/93 = 240 | 5.83/18.75/36.67/38.75% | 10–15/20–25/30–35/30–35% | 未通过 |
| 射雕 | 高 | 15/32/74/79 = 200 | 7.50/16.00/37.00/39.50% | 同上 | 未通过 |
| 神雕 | 高 | 16/38/90/84 = 228 | 7.02/16.67/39.47/36.84% | 同上 | 未通过 |
| 倚天 | 高 | 12/39/98/104 = 253 | 4.74/15.42/38.74/41.11% | 同上 | 未通过 |
| 笑傲 | 中 | 5/41/116/112 = 274 | 1.82/14.96/42.34/40.88% | 2–6/15–20/33–38/38–45% | 未通过 |
| 侠客 | 中 | 2/28/89/90 = 209 | 0.96/13.40/42.58/43.06% | 同上 | 未通过 |
| 碧血 | 中 | 2/26/79/84 = 191 | 1.05/13.61/41.36/43.98% | 同上 | 未通过 |
| 鹿鼎 | 低 | 1/24/93/93 = 211 | 0.47/11.37/44.08/44.08% | 0–5/8–12/33–38/48–55% | 未通过 |
| 连城 | 低 | 1/15/62/68 = 146 | 0.68/10.27/42.47/46.58% | 同上 | 未通过 |
| 白马 | 低 | 0/9/59/63 = 131 | 0/6.87/45.04/48.09% | 同上 | 未通过 |
| 鸳鸯 | 低 | 0/11/61/69 = 141 | 0/7.80/43.26/48.94% | 同上 | 未通过 |
| 书剑 | 中 | 2/26/82/81 = 191 | 1.05/13.61/42.93/42.41% | 2–6/15–20/33–38/38–45% | 未通过 |
| 飞狐 | 中 | 1/24/82/87 = 194 | 0.52/12.37/42.27/44.85% | 同上 | 未通过 |
| 雪山 | 中 | 1/18/65/69 = 153 | 0.65/11.76/42.48/45.10% | 同上 | 未通过 |

现阶段十四个正式书界均未完整命中目标区间。扩充会同时改变分子与分母，F2 / 章节任务应优先裁剪或补充 `sourceChapters`、补齐前置闭包并重算唯一 ID 并集；不得新增天阶、删除 ID，也不得排除互斥路线来缩小“全部路线池”。

**C14 / C15 的天阶与神雕处理规则**：

- 射雕池有 15 门天阶不表示单周目可全部取得。五绝组单周目最多 5、道家最多 2、少林易筋线最多 1，且共享章节预算 7，所以取得上限为 `min(7, 5+2+1)=7`；章节投放必须保留路线互斥和获取成本。
- 神雕完整天阶池固定 16（基准已允许高武上限 16），不新增、不删除。当前神雕首现玄阶为 17；AR-01 已覆盖旧 16 门目标，故不再以旧表判“超标”，保留现有 ID 与品阶，只在扩充后为命中全池比例调整来源投放。
- 倚天池的 12 门天阶含降龙十八掌 10 品残承 1 门，完整天阶为 11；笑傲池另含太极拳、太极剑各 10 品残承。残承按来源品阶计入全池大阶，不得冒充完整天阶或被书眠/现影自动补全。

### 14.5 按实际图鉴文件

下表前十行为金庸核心图鉴；古龙是 AR-08 补充图鉴，单列但纳入全局。目标不是逐册机械补成严格 1:3:9:9：若四册旧图鉴都以各自天阶为基数补足，会把全局推至约 1,394 门，超过 AR-01 上限。故采用“保留天/地、把 218 门玄黄缺口集中给四个 CX 任务”的受控配额。

| 实际文件 | 覆盖 | 实际 天/地/玄/黄 = 合计 | 受控目标 天/地/玄/黄 = 合计 | 尚缺 天/地/玄/黄 | 后续 |
|---|---|---:|---:|---:|---|
| `skills-shaolin.md` | 少林、南少林、西域金刚门传承 | 3/26/27/14 = 70 | 3/26/27/18 = 74 | 0/0/0/4 | CXs |
| `skills-wujue.md` | 丐帮、五绝诸脉、大理、九阴、蒙古等 | 13/23/28/19 = 83 | 13/23/71/75 = 182 | 0/0/43/56 | CXw |
| `skills-daojia.md` | 全真、古墓、剑冢、武当、绝情谷 | 8/18/25/15 = 66 | 8/18/44/46 = 116 | 0/0/19/31 | CXd |
| `skills-xiaoyao.md` | 逍遥、灵鹫、星宿、慕容、密宗等 | 10/14/26/22 = 72 | 10/14/55/58 = 137 | 0/0/29/36 | CXx |
| `skills-yitian.md` | 倚天四派及相关组织 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-xiake-bixue.md` | 侠客、碧血诸派与传承 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-wuyue.md` | 五岳、日月、五仙、福威、青城等 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-kangxi.md` | 鹿鼎、连城、白马、鸳鸯诸派 | 2/14/37/37 = 90 | 2/14/37/37 = 90 | 0/0/0/0 | 已按受控配额起草 |
| `skills-qianlong.md` | 书剑、飞狐、雪山诸派 | 3/9/30/30 = 72 | 3/9/30/30 = 72 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-general.md` | 序章、军中、镖局、武馆、散人、杂学 | 0/19/58/58 = 135 | 0/19/58/58 = 135 | 0/0/0/0 | 已按 0–1 天阶规则起草 |
| **金庸核心小计** | 十册 | **51/159/339/303 = 852** | **51/159/430/430 = 1,070** | **0/0/91/127** | |
| `skills-gulong.md` | AR-08 古龙经典门派补充 | 0/10/29/29 = 68 | 0/10/29/29 = 68 | 0/0/0/0 | 已按 0–1 天阶规则起草 |
| **全目录** | 十册核心＋一册补充 | **51/169/368/332 = 920** | **51/169/459/459 = 1,138** | **0/0/91/127** | |

十册核心的受控目标 51/159/430/430 与古龙补充图鉴 0/10/29/29 相加，恰为全目录 51/169/459/459。CX 执行时以**全目录总闸 1,138 和总缺口 91/127 为最高约束**；§14.5 四个 CX 行就是直接工作配额，不得各自再向单册名义比例外扩。

### 14.6 catalog 撰写约束清单

1. 每门武学使用 §2 字段，招式倍率按 §4.2 公式配出（允许 ±0.05）。
2. 原著有名的招式/武学注明出处；原创扩展写明“（原创扩展）”。
3. 每个正式门派在其归属图鉴至少包含：1 门黄阶入门拳或剑、1 条“黄→玄→地”的进阶链（前置关系）、1 个可成套的组合（`setTags`，套装本体交 design/07）。
4. 每个正式书界至少提供可同时获得、前置闭合且非互斥的本土内功、拳脚、兵器各 ≥3 门；兵器三门必须存在至少一组同一兵器子类。此项用于在携带 1/1/1 后重新补满，不得只以目录总数或“剑/刀/枪各一门”判通过。
5. 以全目录**玩家可习得地阶唯一 ID**为分母：代价型与誓约型合计 ≤5%；必须多人才能施放的合击类 ≤3%。本体可单人施展、多人只提供可选加成者不计强制合击。
6. 敌人专用武学（`learnSources` 为空、`enemyOnly: true`）不计入 §14.1 的 1,138 门目标，必须单独列表；当前只有少林 `sk_shibaluohanzhen` 1 门。
7. 各书界最高原生轻功品阶不得超过：天龙天中 11；射雕/神雕/倚天地上 9；笑傲/侠客/书剑/飞狐/雪山地中 8；碧血/鹿鼎天下 10；连城/白马地下 7；鸳鸯玄上 6。
8. 每个图鉴与全局按 AR-01 核对大阶比例；若受既有高阶库存与只增不减边界影响不能在 ±15% 内命中，必须同时列名义偏差和受控配额，不能靠改阶或删 ID 隐去。
9. 黄阶采用 AR-01 的一行条目：至少含 ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处或“（原创扩展）”；各图鉴必须有可计数的黄阶一行表。
10. 每次变更 `sourceChapters`、`learnSources`、来源品阶或残承后，必须按 §14.4 的唯一 ID 并集重算十四书界全部路线池，并以未舍入分数验收占比。

### 14.7 现状核对

#### 14.7.1 逐项结论

| §14.6 约束 | 现状 | 结论与后续 |
|---|---|---|
| #1 字段与招式预算 | 十一册均经各自审校；CN-05 的独孤六式已按 §4.2 罕见条件复算为 1.147，配置 1.10 差 −0.047 | 本文侧已通过；`skills-wuyue.md` 旧核算式待同步 |
| #2 出处与原创标注 | 图鉴审校均保留原著待考清单与原创标注 | 有条件通过；逐字考据仍按各图鉴待办 |
| #3 门派入门/进阶/套装 | 十一册审校均报告已建立入门、进阶链和套装候选；九阴等“传承而非门派”不强制自带黄阶 | 目录契约通过；套装最终成员与奖励仍由 design/07 定稿 |
| #4 每界本土三类各 ≥3 | `skills-general.md` 的 `ALL14` 底座在目录层面为十四界提供 ≥3 内功、≥3 拳脚及同类剑法 ≥3 | 目录层面通过；章节尚须逐界验证同一周目非互斥、前两幕可达与前置闭包 |
| #5 地阶代价/誓约与合击 | 按“明确以伤身、反噬或异常状态换取收益”的宽口径，代价型共 7 门：七伤拳、九阴白骨爪、同归剑法、碧血神功、虎爪绝户手、化功大法、冰蚕毒掌；誓约型 0 门，合计 `7÷169=4.14%≤5%`。强制多人合击 2 门：金刚伏魔圈、真武七截阵，`2÷169=1.18%≤3%` | 通过；夫妻刀等本体可单人施展者不计 |
| #6 敌人专用分表 | 全目录可习得 920 门之外，少林另有 `sk_shibaluohanzhen` 1 门敌专 | 通过；不得混入 1,138 目标 |
| #7 原生轻功上限 | 实际最高依次为天龙11、射雕9、神雕9、倚天9、笑傲8、侠客8、碧血10、鹿鼎10、连城7、白马7、鸳鸯6、书剑8、飞狐8、雪山8 | 全部通过 |
| #8 图鉴与全局比例 | 全局实际 51/169/368/332，缺 0/0/91/127；四旧图鉴偏玄黄，七册新/补充图鉴已按各自适用规则起草 | 未通过；按 §14.5 受控配额扩充 |
| #9 黄阶一行条目 | 332 门黄阶均可计数；新七册倚天36、侠碧36、五岳36、康熙37、乾隆30、通行58、古龙29，共 262 门符合八字段一行表。旧四册少林14、五绝19、道家15、逍遥22，共 70 门仍以玄/黄混排紧凑卡或展开卡呈现 | **未通过**；由 CXs/CXw/CXd/CXx 转写格式 |
| #10 书界池占比 | §14.4 的十四界均至少一项越界 | 未通过；F2 / 章节按扩充后来源重配 |

#### 14.7.2 各图鉴比例偏差与扩充输入

“名义比例”以 AR-01 的单册规则核对：有多门天阶者看 `地/天、玄/天、黄/天` 相对 `3/9/9`；新图鉴按起草时适用的 AR-01 或受控配额核对，其中零天阶图鉴按 `地:玄:黄≈1:3:3`。受控缺口以 §14.5 为准。

| 文件 | 实际 天/地/玄/黄 | 名义比例诊断 | 受控缺口 天/地/玄/黄 | 状态 |
|---|---:|---|---:|---|
| `skills-shaolin.md` | 3/26/27/14 | 对名义 3/9/27/27：地 +188.89%、玄 0、黄 −48.15% | 0/0/0/4 | CXs 补黄；仍保留既有地阶 |
| `skills-wujue.md` | 13/23/28/19 | 对名义 13/39/117/117：地 −41.03%、玄 −76.07%、黄 −83.76% | 0/0/43/56 | CXw 主扩充 |
| `skills-daojia.md` | 8/18/25/15 | 对名义 8/24/72/72：地 −25.00%、玄 −65.28%、黄 −79.17% | 0/0/19/31 | CXd 主扩充 |
| `skills-xiaoyao.md` | 10/14/26/22 | 对名义 10/30/90/90：地 −53.33%、玄 −71.11%、黄 −75.56% | 0/0/29/36 | CXx 主扩充 |
| `skills-yitian.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-xiake-bixue.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-wuyue.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-kangxi.md` | 2/14/37/37 | 对名义 2/6/18/18：地 +133.33%、玄/黄各 +105.56%；两门天阶均属封闭名录 | 0/0/0/0 | 单册比例未通过；全局受控配额冻结 |
| `skills-qianlong.md` | 3/9/30/30 | 对名义 3/9/27/27：地 0、玄/黄各 +11.11% | 0/0/0/0 | 通过 |
| `skills-general.md` | 0/19/58/58 | 零天阶规则下地:玄:黄=`1:3.05:3.05`，玄/黄相对 3 各 +1.75% | 0/0/0/0 | 通过 |
| `skills-gulong.md`（补充） | 0/10/29/29 | 零天阶规则下地:玄:黄=`1:2.90:2.90`，玄/黄相对 3 各 −3.33% | 0/0/0/0 | 通过 |
| **全目录** | **51/169/368/332** | 对受控目标 51/169/459/459：天/地 0，玄 −19.83%、黄 −27.67%；地/天=3.31，相对名义 3 为 +10.46% | **0/0/91/127** | 未通过 |

#### 14.7.3 未满足项与修正建议

| 文件 | 武学 / 范围 | 问题 | 建议 |
|---|---|---|---|
| `skills-shaolin.md` | §5.3 首现汇总 | “首现”列与逐条最早 `sourceChapters` 不闭合；按逐条来源应为天龙 1/19/13/11、倚天 2/3/2/0、笑傲 0/2/7/1、侠客 0/1/0/0、鹿鼎 0/0/1/0、书剑 0/1/4/2 | F2 修正汇总列；不改条目来源来迎合旧表 |
| `skills-shaolin.md` | 黄阶 14 门 | 与玄阶混排为紧凑卡，缺少 AR-01 要求的八字段一行表 | CXs 扩充时将既有 14 门逐门转写为一行，并补齐 4 门黄阶 |
| `skills-wujue.md` | 全册 | 13/23/28/19 离单册名义 1:3:9:9 较远 | CXw 在全局总闸内补玄 43、黄 56，并以 §14.5 配额校准最终批次 |
| `skills-wujue.md` | 黄阶 19 门 | 采用展开紧凑卡，未形成 AR-01 八字段一行表 | CXw 将既有 19 门逐门转写，并与新增 56 门黄阶合并为统一一行表 |
| `skills-daojia.md` | 全册 | 8/18/25/15 的玄黄不足 | CXd 补玄 19、黄 31，不删现有地阶或四剑意 |
| `skills-daojia.md` | 黄阶 15 门 | 与玄阶混排为紧凑卡，未形成 AR-01 八字段一行表 | CXd 将既有 15 门逐门转写，并与新增 31 门黄阶合并为统一一行表 |
| `skills-xiaoyao.md` | 全册 | 10/14/26/22 的玄黄不足 | CXx 补玄 29、黄 36；保留 C14 已裁定的四门玄上 |
| `skills-xiaoyao.md` | 黄阶 22 门 | 采用展开紧凑卡，未形成 AR-01 八字段一行表 | CXx 将既有 22 门逐门转写，并与新增 36 门黄阶合并为统一一行表 |
| `skills-shaolin.md` | 全册 | 3/26/27/14 的黄阶不足，地阶库存已高 | CXs 只补黄 4；不要再增地阶 |
| `skills-kangxi.md` | 全册 | 2/14/37/37 相对单册名义 2/6/18/18 偏高，无法在只增不减且总量 1,100–1,150 的边界内单册校正 | 保留现有 90 门与两门封闭天阶，不删 ID、不降阶；以 §14.5 全局受控配额冻结，F2 仅复核来源投放 |
| 全部图鉴 / chapters | 十四书界全部路线池 | 当前十四界均未完整命中 §14.4 区间，且新增条目会再次改变分母 | CX 写来源时同步维护池；F2 / 章节按唯一 ID 并集重配 `sourceChapters`，不得新增天阶或排除互斥路线 |
| `skills-general.md` / chapters | `ALL14` 三类底座 | 目录可证明数量，但“明清各界”等简写与章节实际非互斥、前期可达尚未逐事件落盘 | 导出时显式展开 14 个章节 ID；章节为每界验证至少 3/3/3 及同类兵器路径 |
| `skills-wuyue.md` | 独孤九剑破剑/刀/枪/鞭/掌/箭六式 | 图鉴仍可能引用旧常见条件 +0.15 核算，与本文 §4.2 / §13.2 新口径不一致 | 同步为罕见条件 +0.30，预算 1.147，保留 `power:1.10` |

黄阶数量已经齐备，但旧四册的 70 门尚未转为八字段一行表；天阶封闭集合、地阶特殊类型比例和轻功上限均通过。上述失败项不在本任务修改图鉴，交给 CX、F2 与章节任务处理。

---

## 15. 本文新增术语与 ID

### 15.1 术语

| 术语 | ID / 字段 | 定义 | 章节 |
|---|---|---|---|
| 武学经验 | `sxp` | 单门武学的修炼进度（区别于角色经验 `exp`） | §3.2 |
| 真实层数 / 有效层数 | `trueLayer` / `effLayer`（与 design/02 同名） | 修为所达层数 / 书界上限、修为门槛、途径上限截断后的可用层数 | §2.6、§3.4 |
| 来源品阶 / 有效品阶 | `sourceGrade` / `effGrade` | 习得途径保存的传承上限 / 再经书界压制、抵消与誓约覆写后的品阶；残承不会被现影或终局自动补全 | §2.6、§7.1 |
| 层数系数 | `L(n)` | `0.5 + 0.1n`，交 design/04 Z1 | §3.1 |
| 品阶/层耗费系数 | `GF(g)` / `LF(n)` | 经验曲线系数 | §3.2 |
| 修为门槛 | `gateCap` | 按显示等级限制高阶武学深层 | §3.3 |
| 瓶颈 / 强行冲关 | — | 门槛前的经验封顶 / 无视门槛突破 1 重的冒险操作 | §3.3 |
| 阶段名 | — | 初窥门径 / 登堂入室 / 炉火纯青 / 登峰造极 | §3.1 |
| 招式预算 | — | 招式倍率配表公式 | §4.2 |
| 范围系数 | `AF` | 范围模板对倍率的折算 | §4.3 |
| 六角范围 | `HexShape` | 引用 design/09 的点、环、面、扇形及行为/组合判别联合；05 只消费模板和格数 | §4.1、§4.3 |
| 高度容差 | `hTol` | 范围与近身判定的高差上限 | §4.1 |
| 蓄招 | `charge` | 下次行动释放的预警招式 | §4.1 |
| 招式栏 | `moveSlots` | 每门武学战斗中可暴露的普通招式数 | §4.9 |
| 自动选式组 | `autoGroup` | 一个按钮按目标自动解析的招式组 | §4.1 |
| 效果钩子 | `effects` | 结构化字段外的规则声明 | §4.11 |
| 普攻 | `sk_basic` / `mv_basic_strike` | 隐藏的基本功与普通一击 | §4.10 |
| 标准内力 | `MPREF(L)` | design/03 §3.5 STD 的 `mpMax`，耗内的计价基准 | §4.1 |
| 辅运比例 | `auxRatio` | 辅运内功生效比例 0.25–0.60 | §5.2 |
| 内力性质 | `nature` | 内功必填 `yang` / `yin` / `harmony`；外功还可为 `neutral` | §5.3 |
| 阴阳相冲 / 桥接 / 三运同源 | — | 内功组合规则；调和主运无相性惩罚 | §5.3、§5.4 |
| 内功点 | `IP` | 内功贡献预算单位 | §5.5 |
| 内功成长系数 | `innerScale(n)` | `0.30 + 0.07n` | §5.5 |
| 内劲 | — | 05 输出给冲穴系统的速率输入；不是战斗资源 `mp`，公式归 design/15 | §5.8 |
| 专精经脉 | `inner.meridians` / `MeridianId` | 内功向冲穴系统声明的经脉 ID 列表；只允许 design/15 §2 的 20 个正式 ID，单门专精只令自身内劲贡献 ×1.20 | §5.7–§5.8 |
| 运劲分支 | `inner.yunjin` / `inner.auxYunjin` / `move.yunjinMode` | 内功开放的通用运劲、辅运许可及专属招式覆写；枚举与行动归 design/09 | §5.7、§5.9 |
| 易运 | — | 战斗中切换主运 | §5.6 |
| 持械系数 | `Mod_armed` | 持兵器使用拳脚的折算 | §6.3 |
| 奇门细类 | `kinds` | brush/fan/wheel/hook/pestle/qin/flute/dagger/hammer/axe/token/misc | §6.2 |
| 暗器介质 | `hiddenKind` / `HiddenKind` | 暗器武学所需介质，复用 design/10 的八值枚举；不占用奇门 `kinds` | §2.1、§6.2 |
| 副手 / 特殊装备适配 | `weaponReq.offHand` / `weaponReq.altItems` | 武学侧可用条件；装备的槽位、`hands`、标签与 ID 定义仍归 design/10 | §6.2 |
| 技艺门槛 | `reqs.skills` | 复用 design/03 十项 `ArtId` 的 0–100 整数下限 | §2.4、§7.3 |
| 二选一/多选一前置 | `reqs.prereq[].anyOf` | 外层 AND、组内 OR；整组失败只计一个缺项 | §2.4、§7.3 |
| 硬门槛 / 软门槛 | `reqs.hard` | 不可学 / 可学但有惩罚；路径规则见 §2.4 | §7.3 |
| 观摩领悟 | `insight` | 偷学进度 | §7.4 |
| 残页 | `pages` | 掉落的秘籍散页，按页数决定途径上限 | §7.5 |
| 印证挂接 | `attune`（术语归 design/02） | 书界原生学习途径作为印证事件载体 | §7.8 |
| 实战经验池 | `P`、`sxpVal(L)` | 按使用分配的战斗武学经验 | §8.2 |
| 闭关上限 / 实战印证 | `seclusionCap` | 闭关可达层数；更高须实战 | §8.3 |
| 顿悟 | — | 悟性触发的随机突破 | §8.6 |
| 七伤 / 邪练 / 异种真气 | `bf_qishang` / `bf_xielian` / `bf_yizhongzhenqi` | 代价型武学的代价载体 | §9.1 |
| 断尘之誓 | `vow_duanchen` | 葵花宝典/辟邪剑法的永久抉择 | §9.1.4 |
| 合璧 / 分心二用 | — | 玉女素心剑法双人合击 / 左右互搏一次行动两招 | §9.3 |
| 左右互搏值 | `dualWield` | 运行时整数 0–10；未装配/不可用为 0，否则等于左右互搏有效层数 | §9.3.2 |
| 门派修炼倍率 | `sectTrainingMult` | design/12 输出给经验结算的单一倍率；少林剃度状态为 1.10 | §8.1 |
| 破 X 增伤 / 破招架 | `poBonus` / `poParry` | 破 X 的数值 | §9.4 |
| 走火入魔 1–3 级 | 内息紊乱 / 经脉逆行 / 走火入魔 | | §10 |
| 图鉴基础状态 / 再续标记 | `unknown` `heard` `seen` `learned` `mastered` `fragment` / `recalled` | 前六项为互斥基础状态；`recalled` 是 design/02 的叠加历史标记，UI 显示“再续朱印” | §11 |
| 融会贯通 / 自创武学 | `sk_zichuang01`–`03` | 两门满层武学熔铸（原创扩展） | §12 |
| 人强则强 | `special.gOverride`（`G_eff`） | 太祖长拳的品阶系数覆写 | §13.5 |

### 15.2 ID 清单与归属

| 类别 | ID | 备注 |
|---|---|---|
| **已入基准 v1.1 的前缀** | `ps_<武功拼音>_<拼音>` 被动；`aoe_<名>` 范围模板；`vow_<拼音>` 誓约 | 基准 V11-04；不是本轮新造前缀 |
| 范围模板（仅引用 design/09 的生产 ID） | 基础：`aoe_single` `aoe_self` `aoe_ring` `aoe_around` `aoe_disk` `aoe_line` `aoe_bolt` `aoe_spokes` `aoe_cone` `aoe_zone` `aoe_allies` `aoe_field` `aoe_ally_all`；行为/组合：`aoe_wave` `aoe_pierce` `aoe_leap` `aoe_dash` `aoe_pull` `aoe_knock` `aoe_chain` `aoe_multi` `aoe_behind` `aoe_swap` `aoe_boomerang` `aoe_sequence` | §4.3；旧方格 ID 仅为迁移别名，不列生产清单 |
| 武学（本文新增，非基准 §13） | `sk_basic` `sk_tieshazhang` `sk_taizuchangquan` `sk_quanzhenjian` `sk_longzhaoshou` `sk_luohanquan` `sk_qishangquan` `sk_jiuyinbaigu` `sk_zichuang01`–`03` | 完整定义于本文 |
| 武学（仅引用，待 catalog 定义） | `sk_mianzhang` 绵掌、`sk_yunvjian` 玉女剑法、`sk_shaolinqinna` 少林擒拿手、`sk_huagong` 化功大法 | catalog |
| 招式·降龙十八掌 | `mv_xianglong18_` + `kanglong` `jianlong` `qianlong` `hongjian` `lishe` `turu` `zhenjing` `huoyue` `shuanglong` `yuyue` `feilong` `shicheng` `miyun` `sunze` `longzhan` `lvshuang` `diyang` `shenlong` `lianhuan` | §13.1 |
| 招式·独孤九剑 | `mv_dugu9_` + `zongjue` `pojian` `podao` `poqiang` `pobian` `posuo` `pozhang` `poanqi`（破箭式；"箭"与"剑"同拼音，以"暗器"区分） `poqi` `wuzhao` | §13.2 |
| 招式·易筋经 / 九阳神功 | `mv_yijinjing_` + `xisui` `weituo` `daozhuai` `huangu`；`mv_jiuyang_` + `huti` `liaoshang` `puzhao` | §13.3–13.4 |
| 招式·其余示例 | `mv_taizuchangquan_` + `chongzhen` `qianli` `guanri`；`mv_quanzhenjian_` + `dingyang` `qixing` `sanqing` `chongyang`；`mv_longzhaoshou_` + `bufeng` `zhuoying` `fuqin` `guse` `pikang` `daoxu` `sanshiliu` `baocan` `shouque`；`mv_luohanquan_` + `baifo` `zhuangzhong` `tuishan`；`mv_tieshazhang_` + `kaibei` `tuishan` `lianhuan` `jingang`；`mv_basic_strike` | §13、§2.8 |
| 被动 | `ps_xianglong18_{gangmeng,longyin,youyu,zhigang,dacheng}`；`ps_dugu9_{pojin,liaodi,youjin,yiwu,wuzhao}`；`ps_yijinjing_{yijin,famao,huayi,jingang,baibing,dacheng}`；`ps_jiuyang_{taqiang,taheng,hutizhenqi,hanbuqin,shengsheng,chulei,dacheng}`；`ps_taizuchangquan_{tangtang,fanpu}`；`ps_quanzhenjian_{xuanmen,jiansui,tongqi,dacheng}`；`ps_longzhaoshou_{naxue,fenjin,zhili,dacheng}`；`ps_luohanquan_{quanjia,yuanman}`；`ps_tieshazhang_{shazhang,tiebi,dacheng}` | |
| Buff（只引用，正式定义归 design/06） | `bf_liuli` `bf_xuli` `bf_qianlong` `bf_longyin` `bf_miyun` `bf_lvshuang` `bf_duguyi` `bf_pozhao` `bf_pojian` `bf_podao` `bf_poqiang` `bf_pobian` `bf_posuo` `bf_pozhang` `bf_poanqi` `bf_poqi` `bf_weituo` `bf_jianshi` `bf_shouque` `bf_tiebi` `bf_qishang` `bf_xielian` `bf_yizhongzhenqi` `bf_duanchen` `bf_neixiwenluan` `bf_jingmainixing` `bf_zouhuorumo`；通用：`bf_pojia` `bf_neishang` `bf_xuanyun` `bf_dingshen` `bf_fengxue` `bf_jiaoxie` `bf_hutizhenqi` `bf_jiansu` `bf_hanqi` `bf_zhuoshao` `bf_mian_han` `bf_pibei`；基准已有：`bf_wudi` | 已逐项对照 06；05 不重复定义 Buff |
| 套装（**建议 ID**，定义归 design/07） | `set_gaibang_bangzhu` `set_quanzhen_beidou` `set_shaolin_luohan`；基准已有：`set_shaolin_jingang` | |
| 物品（**建议命名规则**，design/10 确认） | `it_miji_<武功拼音>` 秘籍（残本加 `_can`）；`it_canye_<武功拼音>` 残页 | |
| 誓约 / 标记 | `vow_duanchen`；存档标记 `jiuyang_echo`、`scar_qishang` | |
| 门派（引用） | `sect_gaibang` `sect_quanzhen` `sect_kongtong` `sect_riyue` | 正式 ID、历史与时代开放归 design/17；身份玩法归 design/12 |
| NPC（引用/占位） | 具名引用：`npc_hongqigong` `npc_guojing` `npc_fengqingyang` `npc_fangzheng` `npc_kongxing` `npc_kongwen` `npc_xiaofeng`；待迁移占位：`npc_shaolin_fangzhang` `npc_shaolin_banruotang` `npc_shaolin_luohantang` `npc_shaolin_wuseng` `npc_quanzhen_sandai` `npc_generic_jiaotou` | 静态身份归 design/18；无名职能迁为组织/设施 role slot，见 D15 |
| 任务（占位编号 91） | `q_01_qiyu_91` `q_04_qiyu_91` `q_03_side_91` | 由对应书界文档替换；神雕九阳闻经不再冒充学习来源 |
| 效果钩子 | `refundMpOnKill` `refundHpCostOnKill` `firstActionBonus` `critBonus` `ignoreDef` `shieldDmgMult` `heightBonusMult` `noLowGroundPenalty` `leapHeightExtra` `terrainNoFalloff` `ignoreReach` `splashMult` `sequenceStage` `secondaryAoe` `stanceCounter` `deflectProjectile` `stackDetonate` `rageDrain` `drainMp` `restoreMp` `cleanseZouhuo` `curveLos` | §4.11；旧 `thenAoe` 不得进入新数据 |
| 招式条件键 | `targetWeapon` `targetHasSkill` `targetMainInnerEffGradeGte` `targetShieldGt` `fromBehind` `selfHpBelow` `targetArmed` `targetHasTag` `adjacentFallenUnit` `attackedByTargetSinceLastAction` `targetLastMoveCat` `allyAdjacentToTarget` `targetHpBelow` `night` `moonlitTile` `any` | §2.9、§4.1、§4.11；未知键构建失败 |

---

## 16. 数据校验规则与测试用例

### 16.1 构建期校验（Zod schema + 自定义 lint）

失败项阻断构建；警告项进入内容审校报告。几何枚举、行动时序与 Buff 本体分别调用 design/09、06 的校验器，本文不复制其实现。

| # | 规则 | 级别 |
|---|---|---|
| V1 | `id` 符合 `sk_<拼音>` 且全局唯一；招式 `mv_<武功拼音>_*`、被动 `ps_<武功拼音>_*` 与所属武学同前缀；迁移别名不得作为第二定义 | 失败 |
| V2 | `grade` 为整数 1–12；`grade ≥ 10` 的 ID、绝对品阶和原生书界与基准 §13 一致；残承另填 `lineageGrade`，不得改写绝对品阶 | 失败 |
| V3 | `category/subType` 组合合法；`weapon` 必须有匹配的 `weaponReq` 且不得填 `hiddenKind`；`hidden` 必须填 design/10 合法 `hiddenKind` 且不得填 `weaponReq`；左右互搏只能是 `misc/mind`，弓箭/火器只能是 `hidden/hidden` 且分别用 `bow/gun`；`offHand/altItems` 引用的类别、标签与装备 ID 必须可解析 | 失败 |
| V4 | 每门内功显式填 `nature: yang\|yin\|harmony`、`inner.contribution` 与 `inner.meridians`；`meridians` 只含 design/15 §2 的 20 个正式 `MeridianId`、不得重复，空数组合法且表示无专精；外功才允许 `neutral`；IP 偏离 §5.5 预算超过 ±5% 报警 | 失败 / IP 为警告 |
| V5 | `wOut + wIn = 1` 且二者是 0.05 的倍数；招式覆写亦同 | 失败 |
| V6 | `layers[].n`、招式/被动 `unlock` 为整数 1–10；每个解锁对象恰好出现一次且不超过 `maxLayer` | 失败 |
| V7 | 按 §3.5 检查解锁节奏、普通招式/被动数量和 `moveSlots`；原著有定数的招式只豁免数量上限，不豁免栏位 | 警告 |
| V8 | 普通招式 `power` 与 §4.2 预算差值 ≤ 0.05；AF 必须由 design/09 的 `HexShape` 最大格数计算；显式特例须有说明 | 警告 |
| V9 | 绝招 `rageCost=100`，每门 ≤2，黄阶不得有；核心武学第一绝招 `unlock≤7`；地、天阶核心武学至少一项 | 失败 |
| V10 | `layerStats` 第 10 重合计不超过 §3.6 大阶上限；内功 `stats` 与 `layerStats` 不重复计同一增益 | 警告 |
| V11 | `setTags` 与 design/07 成员清单双向一致；自创武学至多继承一个套装 | 失败 |
| V12 | 引用的 `bf_*` 存在于 design/06；武学来源默认 `grade: inherit`；不得在 05 重定义同 ID 的 Buff 本体 | 失败 |
| V13 | 非 `enemyOnly` 武学至少有一个 `LearnSource`；其 `maxLayer` 为整数 1–10，`lineageGrade` 为 1–绝对品阶；纯听闻不得伪装成 `maxLayer:0` 来源 | 失败 |
| V14 | `master/manual/qiyu/puzzle` 的 `chapter` 必须属于可达来源；天阶默认 `observable:false`，例外须逐门写依据与上限 | 失败 / 例外说明为警告 |
| V15 | `reqs.skills` 键只能是 design/03 的十项 `ArtId`，值为整数 0–100；`prereq` 层数为 1–10，引用已注册且可达的武学 | 失败 |
| V16 | `anyOf` 至少两个不同分支；禁止嵌套、重复、自依赖和空组；外层 AND、组内 OR；`hard` 只接受 §2.4 的合法条件路径 | 失败 |
| V17 | `reqsOverride` 只按顶层字段整体替换，`null` 才删除；若替换 `prereq` 且 `hard` 使用条件路径，须同步给出合法 `hard` | 失败 |
| V18 | `inner.yunjin/auxYunjin` 与 `move.yunjinMode` 只能使用 design/09 七项枚举；辅运许可必须是该内功 `yunjin` 的子集；同次行动不叠通用与专属运劲 | 失败 |
| V19 | `HexShape` 通过 design/09 §13.1 判别联合；多段只用非空 `aoe_sequence.steps[]`；拒绝 `then`、旧方格模板和旧 `cone.n/zone.shape` | 失败 |
| V20 | `dualWield` 为运行时整数 0–10且只来自可用的左右互搏 `effLayer`；两招耗内相加、收招 `max(R1,R2)+150` | 失败 |
| V21 | `mpRegen` 聚合后钳在 0–6；耗内引用 `MPREF`，回内引用角色真实 `mpMax`；显式零耗内不得被最小 1 点规则改写 | 失败 |
| V22 | `conflicts.exclusive` 自动镜像；斗转星移与乾坤大挪移不得互斥，同一伤害事件只允许一次转移/镜返 | 自动修正 / 失败 |
| V23 | `note` 含击杀、返还、无视、追加、驱散、反射等机制词却没有结构化字段或 `effects`；`origin:expanded` 的描述未含“原创扩展” | 警告 / 后者失败 |
| V24 | `sourceGrade/sourceCap` 不得被书眠、现影、微光或终局自动抬到完整来源；九阳神雕闻经只写图鉴 `heard` 与 `jiuyang_echo` | 失败 |
| V25 | `displacement` 不得声明旧字段 `collideDmg`；撞击固定按 §4.5 的 `0.20/0.10 × D_hit` 结算且每次位移至多一次 | 失败 |
| V26 | `MoveCondition` 与 `EffectHook` 只能使用 §2.9/§4.11 登记键；`any` 必须非空且禁止未知嵌套键；`night`/`moonlitTile` 只读上游世界与场景事实 | 失败 |

### 16.2 金标准测试用例

| # | 输入 | 期望 |
|---|---|---|
| T1 | 降龙十八掌真实 10 重、完整天上来源，外来进入普通鹿鼎，显示 Lv44 | `effGrade=8`、`effLayer=8`、绝对威力因子 `G×L=2.2×1.3=2.86`；Z1 仅再除一次 `P_ref` |
| T2 | 天阶武学在天龙，显示 Lv35；另令现影生效 | 常态和现影均受 `gateCap=8`，现影不绕过修为门槛 |
| T3 | `ExpToNext(12,9)`、`ExpToNext(1,1)`、`ExpToNext(8,5)` | `7,200 / 100 / 1,360` |
| T4 | 主运调和＋辅运阳；主运阳＋辅运阴无桥接；再装易筋经桥接 | `auxRatio=0.40 / 0.25 / 0.40` |
| T5 | 主运阳/阴/调和分别用阳招；调和用调和招与中性招 | Z5 `+12% / −12% / +6% / +12% / +2%` |
| T6 | `MPREF` 查 Lv1/Lv35/Lv70；`mpCost=0.08`、无修饰 | 引用 design/03 得 `213/4,697/28,887`；Lv35 耗内 `round(0.08×4697)=376` |
| T7 | 真实 `mpMax=5,123`、聚合 `mpRegen=7.4`；另为 −0.5 | 分别钳为 6%/0%，回复 `floor(5123×0.06)=307` / `0` |
| T8 | 六角范围 `aoe_around` 的 `N=6`、`aoe_disk r1` 的 `N=7` | `AF=0.75 / 0.70`，分别由公式 half-up 得到 |
| T9 | `reqs.prereq=[{anyOf:[一阳指5,北冥5]}]`：一阳4、北冥5；两者4 | 前者通过；后者整个 OR 组只算 1 个失败条件 |
| T10 | 软技艺缺 2 项、`wil=50`；把 `skills.med` 放入 `hard` 后仍不满足 | 前者 `softPenalty=0.7²=0.49`、升层走火 `0.10×(1−50/150)=6.67%`；后者不可学 |
| T11 | 左右互搏真实 10 重，在中/低武通常有效 9/8；另未装配 | `dualWield=9/8/0`，每招倍率 `0.82/0.79`；两招同一行动依次结算 |
| T12 | 位移伤害段 `D_hit=1,000`，目标撞墙；或撞到另一单位 | 撞者受 `200`；被撞者受 `100`；只算一次、不免费眩晕 |
| T13 | `staMax=101`，疲惫后恢复体力 | `ceil(0.20×101)=21` 时移除；20 时仍保留 |
| T14 | 九阳有效 6/9/10 重，遭同品寒、普通毒与内伤 | 6 重起仅有 `bf_mian_han`；9 重无毒缩时；10 重普通中毒持续 ×0.5；从不自动免疫毒或内伤 |
| T15 | 易筋经 IP；九阳 IP | `56+40+2×22+5×3.0=155`、`60+36+2×20+5×3.6=154`，均在天上预算 156 的 ±5% 内 |
| T16 | §8.2：`P=436`，降龙 3 次、太祖 1 次，悟性60、拳掌70 | `round(436×0.59×3/4×1.08×1.20)=250 sxp` |
| T17 | 太祖长拳显示 Lv35/Lv70/Lv5 | `G_eff=1.56/2.064/1.20`（表中展示值按两位小数为 1.56/2.06/1.20） |
| T18 | 降龙绝招：天上 10 重并有大成；天上 7 重无大成 | `3.5×1.5×2.00×1.20=12.60`；`3.5×1.2×2.00=8.40` |
| T19 | 地阶残页 4/6 页 | `sourceCap=ceil(10×4/6)=7` |
| T20 | 天上＋天中武学融会贯通，随后进入普通低武 | 产物 `grade=9`、`trueLayer=5`；半额压制 `ceil(4/2)=2` 后 `effGrade=7` |
| T21 | 九阳神雕闻经事件；倚天取得完整来源 | 前者仅图鉴 `heard`＋`jiuyang_echo`，无 `SkillState`；后者才创建可学习来源 |
| T22 | 解析内功缺 `nature`、空 `meridians`、含非法 `mer_x`、重复同一正式经脉、辅运分支不在主清单 | 缺性质失败；空专精合法且不代表全专精；非法或重复经脉失败；非法辅运子集失败 |
| T23 | 解析 `curveLos`、七个图鉴条件键及未知 `condition.foo` | 正式钩子/条件全部通过；未知键构建失败；`night`/`moonlitTile` 不允许内容侧改写时钟或场景标签 |

---

## 17. 待决事项 / 依赖

### 17.1 替下游给出的建议值

本节保留旧 D 编号以便追溯。已经成为正式接口的条目写“已解决”；尚待归属文档落盘或同步的条目继续保留，不把建议冒充为对方已实现。

| # | 下游文档 | 本文输出 / 建议值 | 状态与落点 |
|---|---|---|---|
| D3 | design/04 | `P_actual = G × L(n) × move.power × Mod_armed × Mod_special` 是绝对威力；只在 Z1 除一次 `P_ref`；`wOut/wIn` 合成攻击 | **已解决**：04 §4.1 已采用；本文见 §2.7（C01） |
| D4 | design/04 | Z5：阳/阴主运同性质 `+12%`、异性质 `−12%`；调和主运对阳/阴 `+6%`、调和 `+12%`、中性 `+2%`；破 X 用 `poBonus/poParry` | **已解决**：04 §4.5 已同步调和 `+6%`；本文见 §5.3 |
| D5 | design/04 | 多段逐段判定；绝招被招架时按 04 的 Z9；撞墙 `floor(0.20×D_hit)`、被撞单位 `floor(0.10×D_hit)`，每次位移至多一次且不免费眩晕 | **已解决**：04 §7.4 已采用 C11；本文见 §4.5、§4.8 |
| D6 | design/06 | 武学只引用 `bf_*`，Buff 本体归 06；`bf_jianshi`、`bf_shouque` 已正式存在，不是缺口；招式预算的 `cost_buff` 在 06 给出价值表后再校准 | **部分已解决**：目录已闭合；06 的 `bf_jitui` 仍须改用 `D_hit` 撞击且删自动眩晕，`bf_pibei` 须改为 20% 阈值及 C11 效果 |
| D7 | design/07 | 建立 `set_gaibang_bangzhu`、`set_quanzhen_beidou`、`set_shaolin_luohan` 等唯一成员表，并与本文/图鉴 `setTags` 双向闭合；有效品阶按 C22 取已计件成员中位数 | **待下游落盘**：`design/07-set-system.md` 尚不存在；本文见 §6.5、§13 |
| D15 | chapters/*、design/18 | 把示例中的 `q_0N_*_91` 与占位 NPC 引用替换为各书界正式任务、静态 NPC 或组织/设施 role slot；神雕九阳只写图鉴 `heard` 与 `jiuyang_echo` | **待下游落盘**：占位项见 §13；无名教头、院堂与“三代弟子”不得继续伪装成静态 `npc_*`，应按 18 §10 与 `catalog/npcs-facilities.md` 的角色槽实例化 |
| D16 | tech/05 | 实现 §4.11 的效果钩子、共享 `HexShape/YunjinMode`、`Reqs.skills/anyOf`、§16 的 Zod/lint 与 T1–T23 金标准 | **部分已解决**：tech/05 已定共享战斗类型和玩法 core 边界；内容 schema、完整效果钩子与本文全部金标准仍待实现，旧“§15 lint”引用已更正为 §16 |
| D17 | design/03、catalog | `dualWield:int[0,10]` 只取可用左右互搏的 `effLayer`；左右互搏为 `misc/mind`；弓箭、火器武学为 `hidden/hidden` | **本文已定稿，下游部分待同步**：03 仍有 0–3 档；图鉴不得由副手装备赋值，弓箭/火器须迁入 `hiddenKind: bow/gun`（C16；§2.2、§6.2、§9.3.2） |
| D18 | catalog | `Reqs` 使用 `skills` 与 `prereq[].anyOf`；外层 AND、组内 OR，来源覆写按顶层字段整体替换 | **本文已定稿，图鉴迁移继续**：结构与 lint 见 §2.4、§7.3、§16（C17） |
| D19 | design/15 | `inner.meridians` 的 `mer_renmai/mer_dumai` 是易筋经、九阳示例的专精映射；冲穴读取有效品阶、有效层数、真实 `mpMax`、主运性质与辅运折算 | **已解决**：15 §2、§4 已冻结 20 个正式 ID 和单门自身贡献 ×1.20；05 已收口 `MeridianId` 与 V4/T22，示例映射保持 **【建议值】**，见 §5.7–§5.8、§13.3–§13.4 |
| D20 | design/20（未来） | 后人、宝藏/遗迹、上中下残本、关键信物与合成全本只可生成或升级 `LearnSource/sourceGrade/sourceCap`，不得与本文 `fragment`（书眠残篇）或 design/02 `partial`（残承）合并 | **待上游落盘**：AR-13 已指定唯一归属但文件尚不存在；暂不把新来源类型写入生产枚举，后续由 20 给出事件载荷与合成结果后再迁移 §7 |
| D21 | design/10、catalog | `WeaponReq` 消费 `hands`/成对/副手规则，暗器改用 `hiddenKind`，特殊装备兼容用 `offHand/altItems`；丹药 `sxpGrant.pctNext` 黄/玄/地/天为 `0.10/0.20/0.35/0.50` | **已解决（接口）**：10 §2–§3、§8.2 已定枚举和档位，05 已补 schema/§6.2/V3；具体图鉴条目仍须逐项迁移并解析装备 ID |

### 17.2 本文依赖的上游事实

| # | 上游文档 | 本文消费的事实 | 状态与本文位置 |
|---|---|---|---|
| D1 | design/03 | `MPREF(Ld)=STD(Ld).mpMax`；当前 Lv1/Lv35/Lv70 锚点为 `213/4,697/28,887` | **已解决**：耗内始终查 03，不再保存旧 4,559；§4.1、§16 T6（C02） |
| D2 | design/03 | `InnerContribution` 按 `innerScale(n)=0.30+0.07n` 与主/辅比例合成；技艺采用十项 `ArtId`；杂学修炼以 `wis` 为速度资质 | **已解决**：03 已确认；§2.3、§5.5、§8.1 |
| D8 | design/08 | `jump`、高差/视线标签、坠落/落水、六角地形与突进路径门禁 | **已解决**：本文只引用；§4.4–§4.5 |
| D9 | design/09 | pointy-top 六角距离、`HexShape`、AF、CT/收招、反击/合击时序、运劲与 AI；“双剑合璧”搭档 CT −300 | **已解决**：按 09 v2.0 消费，不再使用曼哈顿距离；§4、§5.9、§9.3 |
| D10 | design/10 | 奇门 `kinds`、双手/成对兵器、暗器与箭药、丹药 `sxpGrant/sxpBuff`、秘籍/残页命名 | **已解决**：大还丹 `pctNext=0.35`、补气丹 `×1.15×5 场`；§6.2、§8.5 |
| D11 | design/12、design/16、design/17、design/18 | 12 输出任务与门派玩法，17 输出门派名录/时代/称谓，18 输出 NPC/好感/羁绊/师徒事实，16 输出贡献以外的银两/资源成本、月钱与营生 | **部分已解决**：四份归属文档均已落盘；本文只消费接口，`sectTrainingMult` 的统一 DTO 仍未在 12 登记。闭关“盘缠”不得由 05 定价；§7–§9 |
| D12 | design/13 | `dm_sxp`、角色经验与武学经验分账、终局 Lv70 `gateCap`、断尘/自创结局修饰 | **已解决**：§3.4、§8.1–§8.2、§9.1.4、§12 |
| D13 | design/02 | `sourceGrade/sourceCap`、`trueLayer/effLayer`、`nativeTo`、积蕴、印证、残篇忆起 ×2 及自创半额压制 | **已解决**：02 已改用 `L(n)=0.5+0.1n`，天级 GF 相对地上约 `1.21/1.37/1.58`，不另乘 ×2；§2.6、§3、§7.8–§7.9、§12.3 |
| D14 | design/11、design/19 | 安全点、观景点、解谜场景、时代图层、地图坐标与奖励挂点 | **已解决（接口）**：11 已定 `safePoint/vista/inspect` 等 POI、休整和时代层，19 已定权威坐标/地图资产；05 只消费事件与地点引用，闭关倍率由章节事件载荷显式给出，不再要求不存在的 `seclusionSpot` 字段。见 §7.6、§8.3、§8.6 |

既有跨文档评审记录继续有效：design/02 的“核心武学第一绝招 `unlock≤7`”已采纳（§3.5、§4.8、V9）；其旧 `L(n)=0.5+0.05n` 与“天级经验统一为地上 ×2”均未采纳，02 当前正文已同步。design/03 的 `trainMul`、学习门槛 `5g−5`、`MPREF` 与 `mpRegen` 接口已采纳；其旧 `dualWield` 0–3 仍须按本文 §9.3.2 同步。调和相性已由 design/04 §4.5 接收。

### 17.3 对基准的修改提案

| # | 提案 | 状态 / 理由 |
|---|---|---|
| P-1 | 高武完整原生天级池由每书界 6–15 改为 6–16 | **已采纳（v1.1 V11-17；G1 采用默认）**：神雕既有 16 门完整传承不删；§14.4 已按现行口径分列完整池与残承 |
| P-2 | §6 登记 `mpRegen`，所有来源合计上限 6% | **已采纳（v1.1 V11-19）**：§5.5 按真实 `mpMax` 回复 |
| P-3 | 自创武学最高地上 9，外来压制基数取 `ceil(S/2)` 且与天书共用下限 | **已采纳（v1.1 V11-30；作者决定 P37）**：§12.3 已执行；不再写全额压制 |
| P-4 | §12 登记 `ps_`、`aoe_`、`vow_`、`it_miji_`、`it_canye_` | **已采纳（v1.1 V11-04）**：§15.2 只登记本文实际使用项 |
| P-5 | 有效层数截断、真实层数保留；达到书界层数上限后的新增经验转积蕴 | **已采纳（v1.1 V11-10、V11-R01）**：§3.3–§3.4 已区分修为/来源瓶颈 |
| P-6 | §6 把 `dualWield（布尔/等级）` 收敛为整数 0–10：未装配可用左右互搏为 0，否则等于其 `effLayer` | **建议 v1.2 合入（rulings X0-P01）**：消除 03 旧 0–3 档歧义；当前按 C16 执行 |
| P-7 | §7 明写左右互搏为杂学·心神；弓箭与火器武学为暗器、非核心且不可书眠携带，装备持用另查 10 | **建议 v1.2 合入（rulings X0-P02）**：避免 `dual`/`bow` 平行分类；§2.2 已执行 |
| P-8 | §0、§8 把“斜 45° 等距网格战棋”改为“六角格战棋；斜 45° 仅指相机观感”，§18 将六角范围模板唯一归属由 05 移至 09 | **建议 v1.2 合入（AR-12）**：基准旧方格措辞和旧归属仍与 09 v2.0 冲突；§4.3 已按六角格引用 09 |
| P-9 | §6/§9 增补：每门内功必须显式 `mpNature/nature`；调和主运无惩罚，对阳/阴 `+6%`、调和 `+12%`、中性 `+2%` | **建议 v1.2 合入（AR-02）**：让作者需求进入跨文档硬约束；§5.3 已执行 |
| P-10 | §18 增登记 design/15 的穴道/经脉/冲穴/周天、design/16 的资源/家业/营生归属，并把相关经济定义从 12 分流到 16 | **建议 v1.2 合入（AR-03、AR-05～AR-07）**：本文仅保留 §5.8 和修炼成本接口 |
| P-11 | 在基准数量约束登记 AR-01：天阶封闭 51 门，全目录目标 1,100–1,150，品阶约 1:3:9:9 | **建议 v1.2 合入**：§14 已按当前只增不减边界采用 51/169/459/459=1,138；替代旧总量口径 |

AR-01 的 C3 同步已完成：§14 以 920 门实际快照为起点，采用 1,138 门受控目标，并把四个 CX 扩充缺口与十四书界池审计分别列明。

### 17.4 原著考据待办

以下均以三联/广州修订版逐字核对；核对前不据通行网文改机制。

**影响招式名、来源或配表的项目**

| # | 核对范围 | 当前保守口径 |
|---|---|---|
| K1 | 《射雕英雄传》洪七公传掌段落与《倚天屠龙记》丐帮相关段落：十八掌名、传授顺序、后世残存掌数 | §13.1 暂用通行十八名；倚天来源只按残承 `maxLayer:6`，文案“前十二掌”不参与层数计算 |
| K2 | 《笑傲江湖》风清扬传剑段落：独孤九剑逐式所破兵刃、破箭式练法与破气式传授边界 | §9.4/§13.2 只按九式大类做 `po*` 匹配，不把列举兵刃当完整原文 |
| K3 | 《倚天屠龙记》光明顶空性与张无忌交手段落：龙爪手是否明言三十六招、八个式名逐字 | §13.7 保留八式映射；未经核对的完整路数不再外推新招 |

**仅影响出处、引文或叙事文本的项目**

| # | 核对范围 | 当前保守口径 |
|---|---|---|
| K4 | 《射雕英雄传》黑风双煞研习真经及《倚天屠龙记》周芷若用爪段落：九阴爪法引文逐字 | 规则不依赖引文；§9.1.2 仅保留情节释义 |
| K5 | 《笑傲江湖》东方不败、岳不群、林平之相关段落：葵花/辟邪首句与归属 | 作者决定 P07 已定呈现边界；核对前 UI 只用“秘籍要求先行自宫”的释义 |
| K6 | 《笑傲江湖》任我行讲述吸星来历及方证论疗法、《天龙八部》逍遥/星宿武学渊源：北冥、化功、吸星关系 | §9.1.3、§9.2 的化解/互斥/相生明确标原创扩展，不冒充谱系原文 |
| K7 | 《神雕侠侣》末尾觉远诵经与《倚天屠龙记》开篇承接、张无忌练九阳及速成乾坤/太极段落 | P10 已定神雕只 `heard`；速度细节与章节边界不改变习得规则 |
| K8 | 《天龙八部》聚贤庄群战：萧峰使用太祖长拳的交手对象与描写 | §13.5 三个招名均标原创扩展，不当作原著名 |

### 17.5 开放问题（附默认值）

作者决定 G1 已规定空白项采用默认值；本轮没有仍待作者拍板的武学机制。原 O1–O5 不删除，改为已解决追溯：

| # | 原问题 | 已采用决定 | 状态与落点 |
|---|---|---|---|
| O1 / P06 | 易筋经内力性质 | **调和**；本作分类为原创扩展 | **已解决**：§13.3、AR-02 |
| O2 / P07 | 断尘之誓呈现尺度 | 保留经修订版核对后的首句，不作身体画面描写；核对前只用释义 | **已解决**：§9.1.4；逐字核对留 K5 |
| O3 / P08 | 融会贯通开放时点与数量 | 倚天结束后开放，全游戏至多 3 门 | **已解决**：§12.1、§12.4 |
| O4 / P09 | 天阶武学能否观摩偷学 | 默认不可；只有 catalog 逐门 `observable:true` 的有据例外 | **已解决**：§7.1、§7.4、V14 |
| O5 / P10 | 九阳能否在神雕完整学习 | 不能；神雕只作 `heard` 伏笔，倚天才创建学习来源 | **已解决**：§13.4、V24、T21；文本边界留 K7 |

其余与本文直接相关的作者决定也已落实：

| 决定 | 已采用内容 | 本文位置 |
|---|---|---|
| P19 | 罗刹短铳保留为暗器/火器武学，仍用弹药规则 | §2.2（具体条目归康熙图鉴/10） |
| P23 | 剑冢利/软/重/木四意为四门独立 `misc/mind`，各占一格 | §6.1 |
| P25、P28 | 低武全真/武当候选与密宗四门跨书复现可用；获取均标原创扩展、复用同 ID | §7.1 |
| P27 | 斗转星移与乾坤大挪移不互斥；同一伤害事件不得循环转移 | §9.2、V22 |
| P32 | 少林剃度使少林武学修炼 ×1.10；状态、情缘关闭与还俗归 12 | §8.1 |
| P37 | 自创最高地上 9，半额压制取 `ceil(S/2)` | §12.3 |
| P38、P39 | 残承来源限制不自动补全；抵消、现影、微光仍检查来源/修为边界 | §2.6、§3.4、§7.8 |
| P45 | 速战武学经验 ×0.5，与角色经验 ×0.8 分账 | §8.2 |
| P49 | 射雕/神雕少林以背景和有限入门为主；射雕保留易筋完整线，神雕不新增易筋完整来源 | §7.1、§13.3 |

