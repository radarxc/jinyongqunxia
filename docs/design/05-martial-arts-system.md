# 05 · 武学体系（Martial Arts System）

> 归属（基准 §18）：武功数据结构、层数、招式预算、内功接口、修炼、装配栏规则、武学图鉴。
> 上游：`00-canon.md` v1.8（唯一事实来源）；作者新增需求与已采用决定见 `decisions/author-requirements.md`、`decisions/author-decisions.md`；跨文档裁定见 `decisions/rulings-v1.md`。
> 引用而不重定义：携带、外来压制、残篇/残承 → `design/02-timeline-and-world-tiers.md`；属性公式、`MPREF` 与技艺 ID → `design/03-attributes.md`；伤害公式与乘区 → `design/04-damage-formula.md`；Buff 定义与目录 → `design/06-buff-system.md`；套装定义 → `design/07-set-system.md`；地形/轻功阈值 → `design/08-terrain-and-qinggong.md`；六角范围模板、集气、运劲、合击、反击流程与 AI → `design/09-combat-system.md`；物品/丹药/兵器属性 → `design/10-items-and-equipment.md`；统一大地图与时代图层 → `design/11-open-world.md`；任务、关系与门派玩法 → `design/12-quests-npc-factions.md`；旧角色经验 / 等级迁移、难度与结局 → `design/13-progression-and-endings.md`（AR-19 后不得作为生产成长真值）；穴道、经脉、冲穴与周天 → `design/15-meridians-and-acupoints.md`；资源与营生 → `design/16-resources-and-estates.md`；门派名录、历史与时代开放 → `design/17-sects-compendium.md`；NPC 身份、同伴与生卒 → `design/18-npc-and-companions.md`；地图节点、坐标与时代地图资产 → `design/19-world-map.md`；后人、宝藏、跨年代残本、信物、配方与投放 → `design/20-legacy-inheritance.md`；战斗经脉运行、攻防/轻功路线、绝招补充、护体内劲、擒拿/点穴、调息与逐单位模拟 → `design/21-meridian-flow-and-moves.md`。
> 标注约定：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需逐字核对；**（待核实）** = 技术事实尚未联网确认；**（待实测）** = 需要真机或真账号验证；**【建议值】** = 依赖其他文档、先给出可用数值并在文末登记。
> 版本：v2.0（AR-19 命中区、透劲、打穴、消化与斗转字段，2026-10-01）；v1.9（AR-19 内功产气 / 速度 / 通量锻炼与 1–9 资源熟练，2026-10-01）；v1.8 经脉落地终审（2026-09-30）；阴阳性质同步 AR-18（2026-09-30）；v1.7.1（AR-18 内功性质审计返修，2026-09-29）；v1.7（AR-18 内功阴阳按主修经脉，2026-09-29）；v1.6（经脉落地终审，2026-09-29）；v1.5（AR-16 外放加持与绝招数量作者决定同步，2026-09-28）；v1.4（绝招与经脉规则同步，2026-09-27）；v1.3（AR-14 绝招数量追加；M4，2026-09-27）；v1.2（跨文档同步；全局审计，2026-09-27）。
> 变更记录：v1.2 接收 `design/15` 的 20 个正式经脉 ID、专精倍率与校验边界，补齐 `design/17`–`20` 的唯一归属引用，明确 `recalled` 仅为基础图鉴状态上的“再续朱印”，并将已落盘的跨文档待决项改为已解决。C14 图鉴实数重定与 CN-05 独孤六式预算结论保持不变。
> 变更记录（2026-09-27，经脉系统落地）：接收 `design/21` v2.0 的武学侧接口：招式引用攻/防/轻功路线，内功引用调息档案并声明护体内劲能力，轻功提供常驻速度路线；路线段时间只计 `flowCt`，经脉攻防乘区独立于 `power` 预算；§14 数量与品阶总账不变。
> 变更记录（2026-09-27，AR-14 追加）：绝招数量按十二品改为天阶 2–3、地阶 1–2、仅玄上 1；默认第一 / 第二 / 第三绝招在 7 / 9 / 10 重解锁，增加共享气势、武学级绝招冷却、连续重复限制与天上三绝招完整示例。
> 变更记录 v1.4：接入 Canon V13-C01、V14-01～02；同步 11 册图鉴的独孤九剑、易筋经、九阳神功、龙爪手实例；补齐 12 门无主动招轻功的局部基础移动招构建契约；旧封穴引用迁移为 `bf_xueweishoufeng` 参数化实例；普通招式推荐下限暂按普通招式与绝招合计，待作者确认。
> 变更记录 v1.5：按作者 2026-09-27 决定确认“九品玄”按玄上执行，并引用统一绝招数量裁定表；接入 AR-16 的逐招 `projection`、三档范围模板和外放判定接口，算法与数值唯一引用 `design/21`。
> 变更记录 v1.6（经脉落地终审，2026-09-29）：按作者决定将降龙十八掌除纯蓄力“潜龙勿用”外的 18 个伤人招全部闭合为外放，补齐三档范围、伤害类别与路线引用；冻结外放反击架势“只扩大反击命中范围、不增加瞄准射程”；同步 Canon V16-01～04 的普通天阶 59 门、补录册正式定义源、音功 0 档兼容分支与大手印落点掌风边界。
> 变更记录 v1.7（AR-18，2026-09-29）：内功 `nature` 改按 `inner.meridians` 所列主修经脉投票；任 / 督分别计阴 / 阳，阴阳跷维随侧计票，冲 / 带不投票；初版审计曾登记 43 张明显不符卡，v1.7.1 已按正式卡归属纠正，实例修订仍交后续图鉴任务。
> 变更记录 v1.7.1（AR-18 返修，2026-09-29）：按正式武学卡归属重做全量审计；254 张唯一内功卡中 147 张可由主修经脉推导、107 张缺 `inner.meridians`，可审部分 56 张声明性质不符。
> 变更记录 v1.8 · 经脉落地终审（2026-09-30）：§4.8 冻结绝招条件的乘法预算、门槛型标注与取整 / 手调边界；§4.2.1 明确带伤害的位移招走 attack，§4.11 登记骑乘标签条件；复核龙爪手第二绝招已同步，收拢历史交办。图鉴逐卡改动交后续任务，§14 总账不在本轮改动。
> 变更记录 v1.9（AR-19，2026-10-01）：内功新增基础产气、基础运气速度、1–9 层曲线与通量锻炼参数；第 10 重继续承载既有圆满能力，但人物资源与运气熟练贡献钳至第 9 层。
> 变更记录 v2.0（AR-19，2026-10-01）：招式新增命中区、透劲与打穴静态字段，内功新增消化比例与斗转反引能力；AR-16 仍负责外放档，AR-19 只在其已激活结果上追加命中区、防护与入体后效。
> 全局审计：接入 `legacy_fragment` / `legacy_synthesis` 与 `legacy_complete` 形态；11 册门派图鉴 `51/169/459/459=1,138` 保留为 2026-09-27 基线，现行普通天阶另按 59 门执行，含补录的地 / 玄 / 黄与总量待 NXfixC 收口后由 NAu-final 重算；六角范围与正式套装闭合结果不变。

---

## 0. 本文范围与阅读指引

| 章节 | 内容 | 主要读者 |
|---|---|---|
| §1 | 设计目标与约束 | 全体 |
| §2 | 武功数据结构（字段表、枚举、完整 YAML、TS 类型、运行时状态、派生管线） | 程序、配表 |
| §3 | 层数：层数系数 L(n)、经验曲线、修为门槛、有效层数、每层解锁规范 | 数值、程序 |
| §4 | 招式：字段、预算公式、经脉路线接口、六角范围接口、位移、友伤、绝招、招式栏 | 数值、程序、战斗 |
| §5 | 内功：主运/辅运、性质与相性（Z5）、贡献、冲穴内劲、调息与护体内劲接口 | 数值、程序 |
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
| 既有乘区 Z0–Z10 名称与顺序 | §9 | 本文所有既有增伤标明乘区；AR-14 新增的 Z4M/Z5M 已由 Canon V13-02 采纳，只引用 design/21 §4.4，不在本文重定义 |

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
| `movementRouteRef` | `MeridianRouteId` | 轻功必填 | 轻功武学的常驻速度路线；必须引用 design/21 `purpose: movement` 的 `mfr_*`，主动轻功招式可由 `MoveDef.meridianRouteRef` 覆写 | `mfr_*` |
| `moveSlots` | int | 自动 | 战斗中可同时装配的普通招式数（§4.9），黄/玄 3、地 4、天 5 | `5` |
| `passives` | PassiveDef[] | | 被动（§2.5） | |
| `setTags` | setId[] | | 所属套装 ID（`set_<拼音>`）；套装本体归 design/07，构建时双向校验 | `[set_shaolin_jingang]` |
| `conflicts` | Conflict[] | | 互斥/相冲/相克/相生（§9.2） | |
| `weaponReq` | WeaponReq | 兵器必填 | 主武器类别、奇门细类与特殊兼容装备（§6.2）；暗器类不用此字段，改填 `hiddenKind` | `{category: sword}` |
| `hiddenKind` | enum | 暗器必填 | 复用 design/10 的 `HiddenKind`：`needle/dart/ball/awl/bolt/powder/gun/bow`；弓箭与火器仍是 `hidden/hidden` | `bow` |
| `learnSources` | LearnSource[] | ✅ | 学习途径与每个途径的层数上限（§7） | |
| `forms` | `{legacy_complete?: SkillFormDef}` | | 同一武学的传承全本形态；当前只允许 `sk_yuenvjian@legacy_complete=10`，配方与投放唯一见 design/20 | |
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
| `cultivationBand` | int 1–70 | 最低派生修为档 `Ce`；不是人物等级 |
| `lore` | `{min?, max?}` | 武学常识区间（太玄经要求"不执着文字"用 `max`） |
| `vow` | vowId | 必须已立下的誓约（§9.1.4） |
| `hard` | string[] | 列出哪些条目是**硬门槛**；其余为**软门槛**（§7.3） |

默认硬/软规则：省略 `hard` 时，`sect`、`prereq`、`vow`、`morality`、`attrsMax`、`lore.max` 默认为硬门槛；`attrs`、`aptitude`、`skills`、`cultivationBand`、`lore.min` 默认为软门槛。显式 `hard` 是完整的硬条件列表，`hard: []` 表示本组全为软；可写顶层键或 `skills.med`、`prereq.0` 等条件路径。单个 OR 组只计一个条件，不按失败分支数重复计软缺项。旧 `reqs.level` 只由迁移器逐字改为 `cultivationBand`，生产 schema 禁写。

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
| `targetAcupoint` | `AcupointTarget` | 被动施加 `bf_xueweishoufeng` 时必填；与招式同样解析固定穴位或目标主要路线关键穴，失败则不施加 |
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
effLayer  = min(trueLayer, tierCap(worldTier), gateCap(grade, Ce), special.layerCap ?? 10)
G         = G_TABLE[effGrade]                                                // 基准 §4
L         = 0.5 + 0.1 × effLayer                                            // §3.1
```

- `effGradeByTier` 唯一实现见 design/02 §2.3：先以 `sourceGrade` 限制残承来源，再处理本土/外来、残承印证、天书抵消、自创武学半额压制与限时现影。本文不得退化成单一 `grade − S`；`tierCap` 的普通值为 10 / 9 / 8，例外同样由 design/02 / 13 提供。
- `gateCap`：修为门槛允许的最高层（§3.3）。
- 解锁判定（招式、被动、绝招）一律使用 `effLayer`。真实层数高于有效层数时，超出部分的招式在 UI 上显示为"天道封印"（书灵解释），战斗中不可用。
- 武学施加的 Buff 品阶 = `effGrade`（基准 §10"通常继承来源武功品阶"）。
- **修炼消耗与修为门槛使用绝对 `grade`**（防止"在低武书界便宜地修高阶外来武学"）。

每门已装配武学的绝招轮换使用下列**战斗临时态**，不写回持久 `SkillState`：`ultimateCooldown: 0|1` 与 `lastUltimateMoveId: moveId|null`。同门任一绝招在 F2 原子支付资源后置冷却 1，并记录其 `moveId`；设置冷却的当前行动不递减，紧接着的下一次自身行动全程禁止同门绝招，待该行动结束才清零。即便冷却已经归零，下一次绝招仍不得与 `lastUltimateMoveId` 相同；先成功结算同门另一绝招或任一同门非绝招后，才解除重复限制。完整行动时序由 `design/09` 接入。

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
D1 = floor(ATK_mix × 1.24 × P_actual / P_ref(Ce_attacker, tier))
```

`ATK_mix = wOut × atkOut + wIn × atkIn`，`P_ref` 引用 design/03 §3.5；Z2–Z10 不再除 `P_ref`，也不得用本次 `P_actual` 充当分母（C01）。

AR-14 的经脉路线不改变本式：`P_actual` 与 `move.power` 都不预乘路线收益。守方路线在 Z4 后由 design/21 §4.4 输出独立的 Z4M，攻方路线在 Z5 后输出独立的 Z5M；即 `…Z4 → floor(Z4×meridianDefenseBp/10000) → Z5 → floor(Z5×meridianAttackBp/10000) → Z6…`，两处各自向下取整，且标准对标准都是 10000 bp。本文只提供路线引用，不复制乘区曲线。

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
    mpCost: 0.07              # × MPREF(Ce)，玄阶基准 6%；Ce 不是人物等级
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
    target: enemy
    range: { min: 1, max: 1 }
    aoe: { tpl: aoe_single }
    delivery: melee
    mpCost: 0.10
    cd: 2
    recovery: 1200
    power: 1.50
    parryable: true
    buffs:
      - { id: bf_neishang, chance: 0.6, dur: 3, grade: inherit, to: target }
    friendlyFire: none           # 普通招：1+0.24+0.20+0.14−0.10×0.60=1.52→1.50
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
  - { type: master, chapter: ch01_tianlong, ref: "少林·罗汉堂授艺岗位槽", maxLayer: 10, cost: { contribution: 300 } }
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
export type HitZone = 'body'|'hand'|'leg';
export type MeridianRouteId = string; // Canon 已登记 mfr_*；schema / 算法 / 模板见 21，具体武学实例见图鉴
export type BreathProfileId = string; // Canon 已登记 txp_*；schema / 算法 / 模板见 21，具体武学实例见图鉴
export type AcupointTarget =
  | { mode: 'fixed'; acupointRef: `ap_${string}` }
  | { mode: 'targetPrimaryRouteKey' }; // 由目标当前主要路线确定关键穴；失败则本次效果不可施加
export type LocalMoveKey = 'basic_movement'; // 父 SkillDef 内局部键；不是全局 mv_* ID
export type LocalMoveRef = `sk_${string}#${LocalMoveKey}`;
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
  cultivationBand?: number; lore?: { min?: number; max?: number }; vow?: `vow_${string}`;
  hard?: string[];
}
export type LearnSourceType =
  | 'master'|'manual'|'observe'|'qiyu'|'puzzle'|'combo'|'pages'|'fragment'|'fused'|'inherit'
  | 'legacy_fragment'|'legacy_synthesis';
export interface LearnSource {
  type: LearnSourceType; chapter?: ChapterId; ref?: string; maxLayer?: number;
  lineageGrade?: Grade; pagesTotal?: number; cost?: Record<string, number|string>;
  reqsOverride?: Reqs; formId?: 'legacy_complete'; note?: string;
}
export interface SkillFormDef {
  formId: 'legacy_complete'; grade: Grade; sourceCap: 10;
  acquireOnlyBy: 'legacy_synthesis';
}
export interface PassiveDef {
  id: `ps_${string}`; name: string; unlock: number;
  kind: 'stat'|'effect'|'mechanic'|'trigger'; zone?: Zone; value?: unknown;
  buff?: BuffApply; trigger?: TriggerSpec; targetAcupoint?: AcupointTarget;
  scope?: 'self'|'all'|`category:${Category}`|'unit';
  auxMode?: 'scaled'|'full'|'none'; text?: string;
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
  generatedLocalMoves?: Partial<Record<LocalMoveKey, LocalMoveDef>>; // 仅 §5.11 构建产物
  movementRouteRef?: MeridianRouteId; // category=movement 必填；purpose 必须为 movement
  passives?: PassiveDef[]; setTags?: `set_${string}`[]; conflicts?: Conflict[];
  weaponReq?: WeaponReq | null; hiddenKind?: HiddenKind; learnSources: LearnSource[];
  forms?: { legacy_complete?: SkillFormDef };
  special?: SkillSpecial; observable?: boolean; hiddenMoves?: string[];
  description: string; assets?: Record<string, string>;
}

export interface MoveDef {
  id: `mv_${string}`; name: string; unlock: number;
  kind: 'attack'|'support'|'stance'|'utility';
  ultimate?: boolean; rageCost?: 100;
  target: 'enemy'|'ally'|'self'|'tile'|'any';
  range: { min: number; max: number }; aoe: HexShape; // 基础射程 / 范围；类型唯一归 design/09 §13.1
  projection?: boolean; // 逐招外放标记；只对明确离体真气伤害成立
  projectionSpreadSteps?: readonly [HexShape, HexShape, HexShape]; // 0/1/2 档；[0] 深等于 aoe
  hitZone?: HitZone; hitZoneReason?: string;
  targetAcupoints?: readonly AcupointTarget[];
  penetratingQi?: boolean;
  acupointStrike?: { level:1|2|3|4|5|6|7|8|9; occupyingQiBp?:number };
  voice?: boolean; // 默认 false；仅 tags 含 sonic 时有意义，人声发劲=true，持乐器=false
  delivery: 'melee'|'ranged'|'projectile'|'self';
  mpCost: number;               // 比例，× MPREF(Ce) 兼容计价；不等于真实 mpMax
  hpCost?: number;              // 比例，× 自身 hpMax
  cd: number; recovery: number; charge?: 0|1;
  power: number; hits?: number;
  wOut?: number; wIn?: number; nature?: Nature;       // 覆写武学级设置
  parryable: boolean; counterable?: boolean;
  friendlyFire: 'none'|'allies'|'all';
  displacement?: { type: 'knock'|'pull'|'dash'|'leap'|'swap'|'behind'|'retreat'; n: number };
  buffs?: BuffApply[]; heal?: HealSpec; cleanse?: CleanseSpec;
  targetAcupoint?: AcupointTarget; // 仅穴位受封；运行时解析为 06 MeridianBuffPayload.acupointRef
  trigger?: TriggerSpec;         // 被动触发型招式（反击、摆尾）
  condition?: MoveCondition;     // 如"目标主武器为 blade"
  autoGroup?: string;            // 自动选式组（独孤九剑"破招"）
  autoTargetCap?: 1|2|3|4;       // 仅无站位自动模拟；单体规范化为 1
  yunjinMode?: YunjinMode;       // 专属招式覆写对应通用运劲分支
  meridianRouteRef?: MeridianRouteId; // 一条主路线；attack/defense/movement 与招式用途一致
  routeOnTriggerRef?: MeridianRouteId; // 仅触发型防守/身法；purpose=defense|movement
  effects?: EffectHook[]; note?: string;
  tags?: string[]; anim?: AnimRef; ai?: AiHint;
}
export type LocalMoveDef = Omit<MoveDef, 'id'> & { localMoveKey: LocalMoveKey };

export interface InnerDef {
  contribution: InnerContribution;
  meridians: MeridianId[];
  breathProfileRef: BreathProfileId;
  innerGuard: { enabled: boolean; reflectBp?: number };
  baseQiPerTick: number;       // int 4..32；第 1 档曲线前基础产气
  baseQiSpeedBp: number;       // int 5000..16000
  layerCurveBp: readonly [number,number,number,number,number,number,number,number,number];
  fluxTrainBase: number;       // int 1..8
  fluxTrainHardCap: Readonly<{ acupoint: 64; meridian: 96 }>;
  digestRatioBp?: number;      // int 10000..100000；默认 10000
  reverseQi?: boolean;         // 默认 false；反引算法唯一见 design/21
  yunjin?: YunjinMode[];
  auxYunjin?: YunjinMode[];
  bridge?: boolean; natureFollowAux?: boolean; auxOverride?: number;
  auxUsableMoves?: `mv_${string}`[]; seclusionCap?: number;
}

export interface SkillState {
  skillId: string; trueLayer: number; sxp: number; sourceCap: number;
  learnedIn: ChapterId; nativeTo: ChapterId; sourceGrade: Grade;
  formId?: 'base'|'legacy_complete';
  attunedGrade?: Grade; attunedIn?: ChapterId;
  latentExp: number; movesEquipped: string[];
  insight?: number; pages?: number[]; flags?: string[];
}
```

---

## 3. 层数（重）

### 3.0 练习熟练层与第十重边界（AR-19）

武功原有 `trueLayer/effLayer=1..10` 不删除；招式解锁、被动、Z1 的 `L(n)` 与外来压制仍按既有规则。人物资源和运气模型另取：

```text
practiceLayer = clamp(min(trueLayer,effLayer,9),1,9)
resourceLayer = min(trueLayer,9)
```

`practiceLayer` 用于战斗产气 / 速度；`resourceLayer` 用于 03 `hpMax/mpMax`，不受临时书界压制倒扣永久资源。第 10 重代表圆满、绝招或机制突破，不再加基础资源，避免 AR-19 明定“练习熟练程度一到九层”与旧十重体系冲突。旧档不改层数，只在新公式入口钳制。

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

- 武学经验记为 `sxp`（skill experience）；生产只增长具体武功，不生成角色经验。旧 `exp` 仅由 design/13 的 v2 迁移 / 回放适配器读取。
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

| 书界 | `Ce` 校准带（非等级） | 约战斗数 | 主力攻击武学可得 sxp | 主运内功可得 sxp | 可达成的典型目标 |
|---|---|---|---|---|---|
| 天龙 | `Ce1–35` | 150 | ≈ 16,400 | ≈ 9,100 | 一门天中武学 1→8 重（12,210）或两门地阶练至 9 重 |
| 射雕 | `Ce35–50` | 160 | ≈ 35,300 | ≈ 19,600 | 一门天中练满（22,710）并把第二门推到 7 重 |
| 神雕 | `Ce50–62` | 160 | ≈ 45,400 | ≈ 25,200 | 天上练满（26,220）+ 另一门天阶过半 |
| 倚天 | `Ce62–70` | 160 | ≈ 52,800 | ≈ 29,400 | 两门天阶满层 |
| 鹿鼎 | `Ce≤44` | 100 | ≈ 22,300 | ≈ 12,400 | 本土地阶武学练至 8 重上限；满 8 重后的经验 50% 转为积蕴（design/02 §2.4） |

闭关（§8.3）与师父指点（§8.4）预计再提供战斗所得的 40%–60%。

### 3.3 修为门槛（`gateCap`）

高阶武学的深层需要相应修为（AR-19 后按 03 无状态派生的**有效修为档 `Ce`**、绝对品阶大阶判定）：

| 大阶 | 1–3 重 | 4–6 重 | 7–8 重 | 9 重 | 10 重 |
|---|---|---|---|---|---|
| 黄 | — | — | — | — | — |
| 玄 | — | — | `Ce ≥ 11`（三流） | `Ce ≥ 16` | `Ce ≥ 21`（二流） |
| 地 | — | `Ce ≥ 11`（三流） | `Ce ≥ 21`（二流） | `Ce ≥ 31`（一流） | `Ce ≥ 36` |
| 天 | — | `Ce ≥ 21`（二流） | `Ce ≥ 31`（一流） | `Ce ≥ 41`（绝顶） | `Ce ≥ 51`（宗师） |

`gateCap(grade, Ce)` = 满足门槛的最高层。旧档 `displayLevel` 只在迁移对拍中代入同名阈值；新档不存人物等级。与书界派生修为档上限（由 03 的 `chapterBandCap` 承接旧基准表）联动的结果：

| 书界 | `Ce` 上限 | 天阶可达 | 地阶可达 | 叙事含义 |
|---|---|---|---|---|
| 天龙 | 35 | 8 重 | 9 重 | 初入江湖，天级武学"得其形未得其神" |
| 射雕 | 50 | 9 重 | 10 重 | |
| 神雕/倚天 | 62/70 | 10 重 | 10 重 | 巅峰时代，天级武学可至化境 |
| 中武书界 | 52–60 | 9 重（境界上限） | 9 重（境界上限） | |
| 低武书界 | 44–48 | 8 重（境界上限） | 8 重（境界上限） | |

**瓶颈与溢出**：
- 只被 `maxLayer`、`sourceCap` 或 `gateCap` 卡住、尚未达到当前生效的书界层数上限时，进入**修为/来源瓶颈**：`sxp` 继续累积但封顶为 1 × `ExpToNext(g, 当前层)`；门槛解除后立即突破，多余 `sxp` 结转，不提前转积蕴。
- **书界层数上限**（规则归 design/02 §2.4）：只有 `trueLayer` 已达到当前生效的 `tierCap` 后，新增经验才按 50% 存入**积蕴** `latentExp`；进入更高上限书界时依 02 注入。已带入的更高真实层数保留，仅有效层数截断。天龙 `Ce35` 的天阶 8 重是修为瓶颈而非高武 10 重上限，后续经验仍留在 `sxp`（基准 V11-R01）。
- **强行冲关**（主动操作，闭关中可选）：无视修为门槛突破 1 重（仅对下一重有效），成功率 `p = clamp(0.35 + (wil − 50)/200 + (luk − 50)/400 − 0.05 × 缺少的 Ce 档数, 0.05, 0.8)`；失败触发走火入魔（§10），严重度 2 起步。每门武学每书界限 1 次。

### 3.4 有效层数与书界上限（汇总公式与边界）

```
effLayer = min(trueLayer, effectiveTierCap(context), gateCap(grade, Ce), special.layerCap ?? 10)
```

| 情形 | 例 | 结果 |
|---|---|---|
| 外来武学进入中武书界 | 降龙 10 重带入笑傲（`Ce60`） | `effGrade` 12→10（天下，G 2.8）；`effLayer` = min(10, 9, 10) = 9；威力系数 2.8 × 1.4 = 3.92（原 5.25，−25%） |
| 外来武学进入低武书界 | 同上带入鹿鼎（`Ce44`） | `effGrade` 8（地中，G 2.2）；`effLayer` = min(10, 8, 9) = 8；2.2 × 1.3 = 2.86（−46%） |
| 本土武学在低武书界 | 鹿鼎习得凝血神爪（天下，本土） | `effGrade` 10 不压制；`effLayer` ≤ 8 |
| 外来武学印证后 | 易筋经带入笑傲，完成"方证传经"印证事件（§7.8） | `nativeTo := ch05`，本书界不再品阶压制，层数仍截断为 9 |
| 黄阶外来武学 | 罗汉拳（黄下）带入低武 | `effGrade` = max(1, 1−4) = 1（下限黄下） |
| 真实层数 < 已解锁招式要求 | 书眠后 `effLayer` 从 10 截到 8 | 第 9、10 重解锁的招式/被动/绝招"天道封印" |
| 本命 / 微光 / 现影 | 低武真实 10 重、`Ce44` 天阶 | 本命只令层数上限 8→9，仍受 `gateCap=9`；微光仍为 8；现影临时令层数上限 10，但仍受 `gateCap=9`，故均不得绕过修为门槛 |
| 终局"天书守卷人"决战 | 不受天道压制（基准 §3） | `tierCap = 10`、`suppression = 0`，但 `sourceGrade/sourceCap` 等残承来源限制仍保留；`gateCap` 按终局 `Ce` 计算 |

`effectiveTierCap(context)` 的本命、现影、微光、封印松动、终局与无天道沙盒分支唯一归基准 §3、design/13。限时解除压制不会补全残承，也不改 `Ce` 的永久事实输入、真实层数、来源限制或修为门槛（作者决定 P38–P41）。

### 3.5 每层解锁规范（配表模板）

每门武学的 `layers` 必须满足下列节奏（数据校验见 §16）：

| 层 | 黄阶 | 玄下 / 玄中 | 玄上 | 地阶 | 天阶 |
|---|---|---|---|---|---|
| 1 | 招式 ×1–2 + 核心被动（弱） | 招式 ×1–2 + 核心被动 | 招式 ×1–2 + 核心被动 | 招式 ×2 + 核心被动 | 招式 ×2 + 核心被动 |
| 2–3 | （可空） | 招式 ×1 | 招式 ×1 | 招式 ×1 | 招式 ×1–2 |
| 4–6 | 招式 ×1 或被动 ×1 | 招式 ×1 + 被动 ×1（"小成"） | 招式 ×1 + 被动 ×1（"小成"） | 招式 ×1–2 + 被动 ×1 | 招式 ×1–2 + 被动 ×1–2 |
| 7 | 被动 ×1 | 招式或被动 | **第一绝招** | **第一绝招** | **第一绝招** |
| 8 | — | 被动 ×1 | 被动 ×1 | 进阶招 / 被动 | 进阶招 / 被动 |
| 9 | — | 被动 ×1 | 被动 ×1 | 配额为 2 时解锁**第二绝招** | **第二绝招** |
| 10 | "圆满"被动（小） | "大成"被动 | "大成"被动 | "大成"机制被动 | 配额为 3 时解锁**第三绝招**；另可有大成机制 |

**绝招解锁层硬规则**：核心武学（内功 / 拳脚 / 兵器）的**第一个绝招解锁层 ≤ 7**，默认正好在 7 重；第二、第三绝招默认在 9、10 重。这样低武层上限 8 时仍保有第一绝招，中武层上限 9 时可用第二绝招，第三绝招只在 10 重完整发挥。提前解锁第一绝招须写逐门理由；不得把第二 / 第三绝招前移来绕开轮换节奏。非核心武学不受“第一绝招 ≤ 7”的硬门槛，但仍建议使用 7 / 9 / 10。

| grade / 品阶 | 可施放招式总数（普通＋绝招） | 绝招数 | 被动 | `moveSlots` |
|---|---:|---:|---:|---:|
| 1–3 黄下 / 中 / 上 | 2–3 | 0 | 1–2 | 3 |
| 4 玄下 | 3–5 | 0 | 2–4 | 3 |
| 5 玄中 | 3–5 | 0 | 2–4 | 3 |
| 6 玄上 | 3–5 | 1 | 2–4 | 3 |
| 7 地下 | 4–7 | 1 | 3–4 | 4 |
| 8 地中 | 4–7 | 1–2 | 3–4 | 4 |
| 9 地上 | 4–7 | 2 | 3–4 | 4 |
| 10 天下 | 5–10 | 2 | 4–7 | 5 |
| 11 天中 | 5–10 | 2–3 | 4–7 | 5 |
| 12 天上 | 5–10 | 3 | 4–7 | 5 |

作者原文：“'九品玄'的理解：按'玄上'执行。”作者已确认（2026-09-27）：九品玄按玄阶最高一品玄上（grade 6）换算。

作者原文：“绝招取几记：天中两到三，取决于武功本身是否有名且是否有很多绝学（比如是招数精妙，还是浑厚），地中一到两个，四组图鉴要统一。”逐门数量、F/M/T 量化判据与四组图鉴统一结果以 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 为准；地中取 1–2、天中取 2–3，不在本文另建第二套裁定。

**推荐下限口径（待作者确认）**：上表第二列暂按 `count(moves)` 核对，即普通招式与 `ultimate:true` 的绝招合计；绝招由本门既有招式升格时，不因此要求另造一记普通招。完整卡若合计仍低于下限，必须在图鉴逐门登记数量豁免与理由，不得为凑数编造招名。普通招式仍指 `ultimate:false`，只是不再单独承担此表下限；绝招数量另按第三列严格校验。

原著给出定数招名的武学（降龙十八掌 18 掌、独孤九剑 9 式、龙爪手 8 式等）可突破招式总数上限，但招式栏数不变。内功以贡献与被动为主，运功招式 1–4 个即可，不受可施放招式总数下限约束。

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
| `range` | `{min,max}` | `{1,1}` | **基础**六角距离射程；`min > 1` 表示贴身不可用。外放只按 design/21 §4.4.1 给 `max` 加 0 / 2 / 4，`min` 不变；瞄准规则见 design/09 §2、§5.3 |
| `aoe` | `HexShape` | `aoe_single` | **基础**六角作用范围（§4.3；类型与几何唯一归 design/09 §5.3、§13.1）；外放 0 档必须使用此值 |
| `projection` | bool | false | 逐招外放标记：仅明确以真气催动离体劲力造成伤害的招式为 true；不得按整门武学或 `delivery` 批量推断。深厚内力驱动且能主动控制伤敌音波的音功可标 true，但 0 档仍是普通音波；大手印跃击只把落点掌风伤害段视为外放 |
| `voice` | bool | false | 仅当 `tags` 含 `sonic` 时有意义；吼、啸、诵咒、传音等人声发劲为 true，琴、箫、笛等持乐器音功为 false。运行时逐字投影为 `ProjectionInput.voice` |
| `projectionSpreadSteps` | `[HexShape, HexShape, HexShape]` | — | `projection:true` 必填且正好三项，依次为 0 / 1 / 2 档；第 0 项须与 `aoe` 深相等，后两项只可取经图鉴审核的六角模板。档位门槛、射程增量、额外耗内与音功 `projectionBoostActive` 分支唯一见 design/21 §4.4.1 |
| `hitZone` | `body|hand|leg` | 分类推导 | 招式绑定攻击位置；擒拿默认 `hand`，摔跤 / 腿法默认 `leg`，其余 `body`。位置抗性与区内在途气映射唯一见 design/09 §5.11 |
| `hitZoneReason` | string | — | 仅当覆写分类默认时必填；写可审计动作理由，不参与运行时解析 |
| `targetAcupoints` | `AcupointTarget[]` | — | 透劲 / 打穴可命中的有序穴位候选；去重，固定穴须属于 `hitZone`。运行时依 21 §9.2 稳定选首个合法穴 |
| `penetratingQi` | bool | false | AR-19 透劲入体候选；仅玄级及以上主运、`projection:true` 且运行时 `projectionBoostActive=true` 的伤害招可启用，触发比较与注入均归 21 §4.4.3 |
| `acupointStrike` | object | — | 内劲打穴 `{level:1..9, occupyingQiBp?:1..10000}`；普通命中后仍须过 21 §9.2 高精度二次检定。占穴量默认取本次 `releasedQi`；比例字段只可向下缩减 |
| `delivery` | enum | `melee` | `melee` 近身 / `ranged` 远程气劲（剑气、掌风、指力；越过单位，被墙体阻挡） / `projectile` 投射物（需视线，被第一个单位阻挡） / `self` |
| `hTol` | int | melee 2 / ranged 4 | 高度容差：受影响格与原点高度差 > hTol 则不受影响；音功等可设 `99` |
| `mpCost` | number | 按大阶 | × `MPREF(Ce)`；`MPREF(Ce)=STD(Ce).mpMax` 是 design/03 §3.5 的兼容计价函数，不等于真实 `mpMax`。结算 `max(1, round(mpCost × MPREF × 耗内修饰))`，显式 0 成本保持 0（C02） |
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
| `buffs` | BuffApply[] | — | `{id, chance, dur, stacks?, grade: inherit, to: target\|self\|area\|allies, value?}`；`bf_xueweishoufeng` 的 `value.level` 必须为 1–9，并与 `targetAcupoint` 一起生成 06 §2.2.1 的运行时载荷；最终施加率还要过效果命中/抵抗（design/04） |
| `targetAcupoint` | `AcupointTarget` | — | AR-14c 单穴兼容字段；构建期规范化为一项 `targetAcupoints`。仅施加 `bf_xueweishoufeng` 时可单独使用；新打穴 / 透劲内容统一写复数候选 |
| `heal` / `cleanse` | object | — | 治疗：`{base: targetHpMax\|casterMpMax, pct}`（公式归 design/04）；驱散：`{tags[], count, maxGrade: inherit}` |
| `trigger` | object | — | 被动触发型招式：`{on, chance, perRound}`（§4.10） |
| `condition` | `MoveCondition` | — | 使用条件，如 `{targetWeapon: [blade]}`、`{fromBehind: true}`、`{selfHpBelow: 0.3}`；正式键见 §4.11 |
| `autoGroup` | string | — | 自动选式组：UI 只显示一个按钮，按目标自动解析为组内合法招式 |
| `autoTargetCap` | int 1–4 | — | 无站位自动模拟的范围招目标上限；单体固定 1，其他模板缺省 2【建议值】。不改变 `aoe`、`AF` 或手动战场格集合 |
| `yunjinMode` | enum | — | 此内功专属招式覆写的运劲分支；枚举引用 design/09 §4.8.4，不与通用运劲重复叠加 |
| `meridianRouteRef` | `MeridianRouteId` | 需运气招式必填 | 主路线 `mfr_*`；普通伤害招必须引用 `purpose:attack`，防守 / 位移招分别引用 `defense` / `movement`。外放反击架势可沿唯一 `purpose:defense` 主路线结算触发伤害，但仍须命中合法外放端点，不为反击另造 attack 路线。步骤、`segmentCt`、`riskBp`、性质与模板唯一见 design/21 §4–§5、§12 |
| `routeOnTriggerRef` | `MeridianRouteId` | — | 触发式防守 / 身法的路线；仅允许 `purpose:defense\|movement`，如太极卸力被动。主动招式仍只用 `meridianRouteRef` |
| `flowCt` | 派生 int | — | 不写入内容；从所引路线实际尝试的 `steps[].segmentCt` 求和。预检硬封为 0，中途卡住仍计已尝试段；交 design/09 计入收招 |
| `tags` | string[] | — | 表现与判定标签：`palm` `finger` `qigong`（气劲） `sonic` `fire` `cold` `poison` `hard` `soft` … |
| `anim` | object | — | `{clip, vfx, sfx, cutin?}` 素材键（素材规范归 `tech/06`） |
| `ai` | object | — | `{weight, prefer: opener\|finisher\|aoe\|control\|heal}` 供 design/09 AI 使用 |
| `terrainFx` | object | — | 对地形的附带效果，如 `{ignite: [tr_caodi]}`、`{freeze: [tr_qianshui]}`（地形 ID 与状态归 design/08） |
| `effects` | EffectHook[] | — | 结构化字段表达不了的规则，用效果钩子声明（§4.11） |
| `note` | string | — | 策划说明/UI 文案；不被程序解析 |

### 4.2 招式预算公式（配表规则）

所有普通招式的 `power` 必须由下式算出，允许 ±0.05 的手调（超出需在 catalog 中写明理由）；绝招按 §4.8.1–§4.8.3 的专用基准和更严格边界核算，不沿用普通招的超额说明豁免：

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
| `adj` 条件 | 常见条件（如目标处于一种常见状态）+0.15；罕见条件（如**目标正持招式指定的一类兵器／处于指定徒手类**、背后、目标残血 < 30%）+0.30。同一招式只计一档；它是乘法括号中的无量纲调整，不是 `power` 的绝对加项。绝招的加成型 / 门槛型声明见 §4.8.2 |
| `K_delivery` | melee 1.00 / ranged 0.85 / projectile 0.92 |
| `K_parry` | 可招架 1.00 / 不可招架 0.85 |
| `cost_buff` | 建议值（design/06 定义 Buff 价值后替换）：控制（定身/眩晕 1 回合）0.25 × 施加率；封穴 0.20 × 率；内伤/破甲/流血/减速 0.10 × 率；自身增益 0.10–0.20 |
| `cost_disp` | 击退每格 0.05；拉拽 0.10；突进/跳斩（自身位移）0.10；换位/绕背 0.15 |
| AF | 按最大可命中六角格数 `Nmax` 计算，见 §4.3（唯一公式归 design/09 §5.3.3） |

**绝招例**：降龙十八掌·震惊百里现按 §4.8 的单体绝招基准 3.00 配表；六角 `aoe_around` 命中 6 格，`AF=0.75`，眩晕 30% 扣 `0.25×0.30=0.075`，故 `3.00×0.75−0.075=2.175`，取 **2.15**（在 ±0.05 手调范围内）。其 `recovery=1200`，另加 21 §12.1 的 9 段 × 85 CT 路线后为 `1200+765=1965≤2000`；路线 CT 不反写进 `power`。

**支援类预算**（治疗与护盾，公式归 design/04）：标准单体治疗 = 目标 `hpMax` 的 18%（大阶基准耗内、`cd 2`）；护体真气（`shield`）按治疗量 × 1.2 等价；群体治疗按 AF 折算。

**经脉乘区不进入本预算。** `power` 仍只由上式与绝招预算产生；不得把路线段数、`routeQualityBp`、攻方 `meridianAttackBp`、守方 `meridianDefenseBp`、护体内劲抵消量或 `meridianSpeedBp` 预乘进 `power`，也不得为“经脉强”额外增加 `adj`。战斗中先由逐单位经脉实例运行 `meridianRouteRef`，再按 design/21 §4.4 把 Z4M 放在 Z4 后、Z5M 放在 Z5 后，各向下取整一次；标准对标准两者均为 10000 bp，所以本节基准 `power=1.00` 不漂移。路线只通过实际尝试段的 `flowCt=ΣsegmentCt` 增加 09 收招，且必须满足：

```text
MoveDef.recovery + Σ route.steps[].segmentCt ≤ 2000
```

例如 `mv_xianglong18_lianhuan` 仍按范围、绝招和位移预算得 `power=2.00`；其 10 段路线每段 80 CT，只另得 `flowCt=10×80=800`，故完整收招为 `1200+800=2000`。经脉攻强时的额外伤害在 Z5M 独立兑现，不能反写成更高 `power`。公式、取整、卡住后只计已尝试段以及 `rec_eff∈[500,2000]` 的最终钳制见 design/21 §3.5；本文仅保存路线引用。

绝招沿用同一范围 / 效果扣费方式，只把单体基准从 1.00 换为 3.00。玄上默认单体绝招因此为 `power=3.00`；其耗内为 `玄阶 6%+2%=8% MPREF`、气势 100、收招 1200。推荐 6–8 段路线时，若每段 80–100 CT，则完整收招为 `1200+480..800=1680..2000`，正好落在硬上限内；范围、控制或位移仍须像普通招一样从 3.00 基准扣除，不能因玄上只配一招而超预算。

### 4.2.1 经脉路线用途与武学侧接口

| 武学侧内容 | 路线用途 | 配置规则 | 结算输出（只引用 21） |
|---|---|---|---|
| 伤害招式、普攻、反击 | `attack` | `MoveDef.meridianRouteRef`；同一整招一条主路线，多段 / 范围共享攻方提交结果 | Z5M `meridianAttackBp`；普攻迁移短路为 2 段 |
| 招架、格挡、卸力、护体 | `defense` | 主动防守填 `meridianRouteRef`；被动触发填 `routeOnTriggerRef` | Z4M `meridianDefenseBp`；护体路线可开启 §5.10 的护体内劲 |
| 无主动伤害的移动、跃起、追击、闪避身法 | `movement` | 主动招式填 `meridianRouteRef`；轻功武学另填顶层 `movementRouteRef` 作为常驻速度路线 | `meridianSpeedBp`、`openingQinggong`、`spd`、移动增量与纯经脉闪避评级差 |
| 治疗 / 驱散 | 依动作意图 | 需要运气时可挂路线，但不得把攻击乘区套给治疗量 | 只运行路线状态与 `flowCt`；效果强度仍归 04 / 06 |

- `MoveDef` 不内嵌 `steps` / `segmentCt` 数组，也不重复保存 `purpose`；二者由 `mfr_*` 路线对象唯一给出。一个招式至多一条主路线；触发路线只用于被动防守 / 身法，不能再给同一次主动动作叠第二条路线。
- **伤害优先判据**：突进、跃击、绕背或追击后在同次主动动作中造成伤害，主路线一律为 `attack`，位移只是该招效果，不因名称或 `displacement` 改为 `movement`。例如通行册陷阵 `mv_pojunqiangfa_xianzhen` 的突进后单体 `power=2.85`，所引 `mfr_pojunqiangfa_xianzhen` 应为 `attack`；实例修订归通行册。主动防守架势的延后 `stanceCounter` 仍适用 §4.10 的唯一 `defense` 路线例外。
- `meridianRouteRef` / `routeOnTriggerRef` 引用的是已展开的稳定路线对象；21 §5 的“短发 / 顺经 / 换脉 / 周流”等模板只是配表方法，不另设 `routeTemplateRef`，也不能把 A–G 排版别名写进 `MoveDef`。`segmentCt` 留在路线 `steps[]`，运行后时间只从 `FlowResult.flowCt` 进入 09。
- `ultimate` 仍是绝招唯一真值。路线对象可镜像 `ultimate` 作构建期一致性断言，但不得覆写招式；天 / 地 / 玄上的绝招数量继续由 §3.5、§4.8 控制。同门每个绝招各有唯一不同路线 ID，不能用一个路线对象承载多个绝招。
- 防守路线、轻功路线和攻击路线共享同一单位经脉实例；共用穴位的迟滞、点穴与胀损必须互相可见。实例粒度和调用接口见 design/21 §11，每个可独立施展武学的我方 / 敌方单位各一实例。
- 旧内容缺路线时只允许按 design/21 §4.6 的 2 段短路迁移；正式发布不得留下运行时默认路线。

### 4.2.2 外放字段与逐招判定（AR-16）

外放是 `MoveDef` 的逐招事实，不是 `SkillDef`、武学品阶或 `delivery` 的推导值。只有明确以真气催动离体指力、掌力、剑气、刀罡等伤害的招式，才可同时填写 `projection:true` 与三项 `projectionSpreadSteps`；实体暗器、弓弩、普通兵刃挥击、纯位移和纯护体均不自动获得外放。

音功按 Canon V16-03 / `design/21` v2.9 §4.4.1 使用唯一运行时分支。`tags:[sonic]` 是一般音功的表现 / 几何标签；只有同时满足“深厚内力驱动”与“能主动控制伤敌音波能量或方向”的伤害招，才可在 `sonic` 之外再标 `projection:true`。普通喊声、传讯、自然乐声及无伤害的纯支援 / 纯控制招不得标外放。静态伤害段仍为 `DamageKind='projected'`，但是否启用外放加持由所选档派生：

```text
sonic && projection && projectionStep == 0
  => projectionBoostActive=false
  => 普通 Z5M + 基础 range/aoe + projectionSpreadSteps[0] + 0 外放增耗
sonic && projection && projectionStep >= 1
  => projectionBoostActive=true
  => 外放 Z5M + 对应射程/范围扩张 + 200/400 bp MPREF 增耗
```

`projectionBoostActive` 是预览 / 命令的派生结果，不写入 `MoveDef` 或存档。音功 0 档保持普通 Z5M、基础范围与 0 增耗；静态 `projected` 不变，但 AR-19 外放抵消只按伤害段 `wIn/wOut` 设置内劲全额、外劲半额上限，不再使用旧 `projected=40%` 适用率。非音功外放不使用此兼容分支，其 0 档仍激活外放曲线。

`voice` 是静态出招方式事实，默认 false，且只允许与 `tags:[sonic]` 联用；吼、啸、诵咒、传音等人声发劲为 true，琴、箫、笛等持乐器音功为 false。`ProjectionInput.voice = (MoveDef.voice === true)`，并只在 `sonic && projection:true` 时消费；人声招可按 `design/21` §4.4.1.4 另取天突 / 廉泉，持乐器仍须取 13 个手 / 腕端点。`voice:true` 而无 `sonic` 必须构建失败；`voice` 不参与 `projectionBoostActive` 判定。

- `range` 与 `aoe` 永远保存 0 档基础值，不新建平行 `baseRange`；`range.min` 不随档位变化。
- `projectionSpreadSteps` 正好三项，依次对应 0 / 1 / 2 档；`[0]` 必须与 `aoe` 深相等。单体招可以三项相同，范围招只能使用 design/09 已登记且由图鉴逐招审核的模板。
- `projection:true` 的每个伤害段必须使用既有 `DamageKind='projected'`；反向不成立，旧 `projected` 伤害不得自动补 `projection:true`。
- 射程增量 `+0/+2/+4`、额外耗内 `0/2%/4% MPREF`、档位门槛、外放 Z5M 与路线端点白名单只引用 design/21 §4.4.1；这些运行值不写回招式静态数据。
- **外放反击架势**（如“明王护法”“或跃在渊”）的主动动作始终以自身为中心，保持 `target:self`、`range:{min:0,max:0}`；所选档随架势快照保存。触发时令 `s=projectionStep`，把 `projectionSpreadSteps[s]` **改以架势持有者所在格为原点**枚举反击命中格，三档都不产生远端锚点；`+0/+2/+4` 不加入 `range.max`，也不允许另选远处单位为反击目标。触发者在通过原触发条件后必为主目标；反应语义下的 `aoe_self` 规范化为“仅触发者”，不会打中持有者自己。其余格才是扩大档追加的次目标。故外放只可放大反击命中范围，不增加架势射程；若三项均为 `aoe_self`，三档都仍只反击触发者。具体格集合、遮挡、结算顺序与稳定排序见 design/09 §6.3。
- **大手印跃击** `mv_dashouyin_dashouyin` 分为非伤害跃迁与落点掌风两个语义步骤：跃迁只改变位置，不生成伤害段；落点掌风是该招唯一 `DamageKind='projected'` 外放伤害段，使用同一次 Z5M。不得因“跃击”再造位移伤害段、第二次 Z5M 或第二条攻击路线。具体静态实例由 `skills-xiaoyao.md` 唯一定义。
- 玩家、敌人和召唤物使用同一字段与判定。M5c 应逐招复核，不得按整门武学批量替换。

| 示例 | 可标的表现 | 不可批量推断的边界 | 0 / 1 / 2 档示例 |
|---|---|---|---|
| 弹指神通 | 离体指力、劲气 | 若伤害来自弹出的实体石子，则仍按暗器，不因远程而标 | 射程 5 / 7 / 9；单体 / 单体 / 单体 |
| 独孤九剑 | 明确的剑气招；剑气表现为**（原创扩展）** | 破剑、破刀等近身剑招不自动外放 | 射程 1 / 3 / 5；直线 n1 / n2 / n3 |
| 降龙十八掌 | 明确掌风离体的招式，如“利涉大川”示例 | 按作者整门锚点例外，所有伤害招均外放；唯一无伤害蓄力“潜龙勿用”不标，见 §13.1 | 射程 4 / 6 / 8；直线 n4 / n5 / n6 |
| 可控伤敌音功 | 深厚内力驱动且能主动控制能量 / 方向的伤害音波 | 0 档为普通音波；纯支援、纯控制、人声传讯及整门批量推断均不标 | 0 档基础范围；1 / 2 档才启用审核扩张 |
| 大手印跃击 | 落点掌风伤害段 | 跃迁位移不是伤害段，不另造第二段 | 三档由所属图鉴逐招审核 |

表内是 design/21 §4.4.1.5 冻结夹具，不替代图鉴正式条目。六角格枚举、形状档位、遮挡与选目标归 design/09；当前最高可用档及外放威力曲线归 design/21；逐招正式标记由 M5c 落盘。

#### 4.2.3 命中区、透劲与打穴字段（AR-19）

`hitZone` 是招式动作事实，不是玩家每击自由选择。构建期先按 `subType/tags` 得默认：擒拿或 `tags:[grapple]` 为 `hand`，摔跤 / 腿法或 `tags:[wrestle|leg]` 为 `leg`，其余为 `body`；显式覆写必须同时写 `hitZoneReason`。同一整招多段共享命中区，除非各伤害子段已是独立结构并逐段声明。位置抗性、命中区节点与默认穴唯一由 09 §5.11 定义。

`penetratingQi:true` 不保证注入，只开放候选。运行时须同时满足：伤害命中、`projectionBoostActive=true`、攻方主运 `g_eff≥4`、支付本招全部成本后的当前 `mp` 严格大于守方命中前当前 `mp`。满足后以本次外放 `releasedQi/qiSpeedBp` 原量原速注入；不从攻方再扣资源。来源内功的 `digestRatioBp` 决定守方消化成本。

`acupointStrike` 与 AR-14c 的 `bf_xueweishoufeng` 1–9 级**合并而非并列**：`level` 就是既有点穴严重度，字段额外声明本招可把内劲留在穴上。普通 Z0 命中后还要过 21 §9.2 的打穴准确度检定；成功后最多使用 `floor(releasedQi×occupyingQiBp/10000)`，默认 10000 bp。若放气为 0，仍可按旧 `buffs` 施加 1–9 级，但不创建占穴气。占穴气的消化效率为普通透劲 50%，所有经过该穴的路线受影响；算法与状态只见 21 §9。

旧卡迁移：单数 `targetAcupoint` 规范化为 `[targetAcupoint]`；旧 `seal` / `bf_xueweishoufeng` 只保留 1–9 生命周期，不据招名猜 `acupointStrike`；旧 `bf_toujin` 是 Z2 数值 Buff，也不得自动升级为 `penetratingQi`。本任务不修改 §11 武学图鉴，具体招式的逐项物化交后续图鉴任务。

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
| 消耗 | 共用角色气势槽 `rage 0..100`；每个绝招均耗 100（基准 §8），另加耗内 = 大阶基准 + 2%，即黄 / 玄 / 地 / 天为 7% / 8% / 9% / 10% `MPREF` |
| 预算基准 | 单体 `power` 基准 3.00，唯一算式见 §4.8.1；多绝招不平分也不叠加同一招的预算，每一招按自身范围、效果与代价独立核算。玄上默认绝招即 `power 3.00`、耗内 `0.08×MPREF`、气势 100、收招 1200；核心第一绝招 ≤7 重，第二 / 第三默认 9 / 10 重 |
| 冷却 / 轮换 | `MoveDef.cd` 仍用于招式自身冷却；此外同门绝招共享 1 次自身行动的武学级冷却。任一绝招在 F2 原子支付资源后，同门绝招全部锁住紧接着的下一次自身行动，且不在设置冷却的当前行动末递减；该行动结束归零后，仍不得连续两次选择同一绝招，须先成功结算同门另一绝招或任一同门非绝招 |
| 收招 | 默认 1200 |
| 招架 | 可设为可招架，但 Z9 招架减免减半（**建议**，design/04 确认） |
| 霸体 | 施放过程不可被打断（`charge` 不可用于绝招） |
| 封绝 | 受"封绝"类 Buff（如 `bf_miyun`）时不可施放 |
| 演出 | 立绘切入（`anim.cutin`），≤ 1.2 秒，可在设置中关闭 |
| 数量 | 按 §3.5 十二品表：天 2–3、地 1–2、玄上 1，玄中 / 玄下与黄阶 0；区间逐门取值引用 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 的统一裁定表；内功绝招以自身 / 友方效果为主 |

绝招与经脉路线是正交字段：`ultimate:true` 仍是绝招唯一真值；需要运气的每个绝招各自填写一个 `meridianRouteRef`，并遵守 §4.2.1。路线对象的 `ultimate` 只是与本字段相等的构建期断言。同门多个绝招不得共用路线 ID，且须区分攻 / 防 / 轻功职责或范围、目标与效果，避免只剩纸面伤害排序。长路线能够按 design/21 §3.5 更充分兑现攻守强度差，但逐段增加 `flowCt`，且卡住仍消耗已支付的内力 / 气势；预检已知未开通、胀损或 9 级点穴封路时则禁用且不扣资源、不启动共享冷却。不得用“绝招”绕过 `recovery+满路线 flowCt≤2000`，也不得再把路线收益算入 `power`。

#### 4.8.1 唯一预算算式与取整（原创扩展）

**执行默认：条件加成乘入 3.00 基准。** 已核对作者需求与作者决策单，未找到针对条件预算加法 / 乘法的作者决定；本节按 §4.2 的字面公式收敛为唯一算法，列 §17.5 O9 待作者确认。`power` 是配表期静态值，不在实战满足条件后再乘一次；它与 Z3、Z5、Z5M 的战斗加成不同。

```text
adjCondition = 加成型的 0.15 / 0.30，或门槛型的 0
adjOther     = 相对绝招默认值的冷却 / 耗内 / 收招 / 自损调整之和
rawPower     = 3.00 × AF × (1 + adjOther + adjCondition)
               × K_delivery × K_parry − Σcost_buff − Σcost_disp
roundedPower = floor(rawPower × 20 + 0.5) / 20
power        = roundedPower，或按 §4.8.3 登记的合法手调值
```

逐卡复算顺序如下，所有中间乘积保留精确十进制 / 有理数，不能逐项取整：

1. 仅对实际伤害预算使用 3.00；纯支援、防守、治疗及纯位移绝招继续 `power=0`，效果强度引用 §4.2 的支援预算与归属文档，不能凭条件生成伤害。混合支援 / 伤害招和反击架势按**伤害子效果**的基础范围、投送与招架字段核算，不能把友方支援范围或 `delivery:self` 套给伤害，也不能仅因 `kind:support` 将已有敌伤清零。尚未写明这些字段的卡须先补定义再签出预算。
2. 从基础 `aoe` 的最大命中格数取 §4.3 的 AF；不取外放扩大后的范围。`K_delivery`、`K_parry` 与效果 / 位移扣费沿用 §4.2，不得因绝招或外放自动免除。`delivery:self` 的纯支援不进入伤害公式。
3. **3.00 已含**气势 100、耗内“大阶基准 +2%”、`recovery=1200`、`cd=0` 的标准绝招代价。`adjOther` 只计相对这组默认值的偏差：耗内每 1 个百分点 ±0.05，收招每 100 CT ±0.07，额外自身冷却每次 +0.12（至多按 5 次），自损每 1% +0.06。共享 1 次自身行动冷却和轮换限制不再加价；`charge` 仍禁用。路线 `flowCt` 和外放扩大档增耗不参与此预算。
4. 按 §4.8.2 确定一档条件预算，再乘完 `3.00×AF×(1+Σadj)×Kd×Kp`，最后扣实际已配置的 Buff / 位移成本。Buff 成本按施加率计一次，不额外乘持续行动数；钩子特殊成本须逐项列效果和出处，未统一定价者标 **【建议值】**，不能以“条件折价”伪装效果成本。
5. 仅最终倍率按 0.05 步长十进制 half-up：例如 `2.8325→2.85`、恰好半格的 `2.175→2.20`。这只是配表取整；实战伤害仍在各乘区末按 `design/04` 向下取整，不得混用。

#### 4.8.2 加成型条件与门槛型条件

两类都先检查整招的真实施放条件，未满足不得施放 / 支付资源；差别只在配表时是否补偿施放机会。未来反击的触发条件仍在反击事件检查，不能提前当作架势施放的门槛。卡片须同时给出可执行的 `condition`（或已有钩子的结构化触发条件）与以下**预算栏文字**，不得只写“限某条件”。预算栏不是新增 `MoveDef` 或存档字段，运行时仍只读取静态 `power` 与结构化条件。

| 卡片标准标注 | `adjCondition` | 适用与限制 |
|---|---:|---|
| `条件预算：加成型（常见，adjCondition=0.15）` | 0.15 | 如夜间、目标常见状态、任意持械 `targetArmed:true`；写明条件字段及判定口径，任意持械不得冒充“指定一类兵器”计 +0.30 |
| `条件预算：加成型（罕见，adjCondition=0.30）` | 0.30 | 如指定兵器、背后、目标气血低于 30%；现有特殊阈值若按罕见计，须在卡上说明 |
| `条件预算：门槛型（adjCondition=0）` | 0 | **允许**；条件仅体现出招前提，不补偿倍率，公式括号中必须不含该条件值；仍扣实际效果成本 |
| `条件预算：无施放条件（adjCondition=0）` | 0 | 条件仅决定附带 Buff 是否生效时，不可当作整招门槛计价；按已配置概率与实际效果扣费 |

- 未显式声明门槛型的条件伤害绝招，默认按加成型复算；不能为保留旧值默认为门槛型。同一招只计一档，不按 `any` 分支、AND 条件数量或目标数量累加。OR 含常见分支时不得只挑罕见分支计 +0.30；混合条件必须在卡上给出统一档位与理由，否则构建审校不签出。
- 学习 / 解锁层、气势 / 内力足够、射程、路线开通、主运性质许可、本招所属武学已装配等通用合法性门禁都不产生 `adjCondition`；其定义与预检流程各归上游系统。额外装配另一门武学或指定额外主运的招式专属条件须另按卡片意图判价，不能与通用门禁混为一谈。
- 门槛型选择须按招式意图明确声明并复算，不能写“先奖励 +0.30，再扣条件收益 0.90”。乾隆册反常合道等已经明确“条件不抬倍率”的旧卡可按门槛型迁移；其余改成门槛型时须同步正文预算、卡上条件、复算说明与镜像。

#### 4.8.3 手调边界与旧卡迁移

**±0.05 是相对未取整 `rawPower` 的总偏差上限**：`abs(power−rawPower)≤0.05`，不是取整后再加一次 ±0.05，也不是每个成本 / 条件各有一次额度。配置值仍用 0.05 步长；选择非 `roundedPower` 时在卡上写出 `rawPower`、`power`、差值与具体平衡理由。既有震惊百里的 `2.175→2.15` 可保留，差值为 `−0.025`；不得把它当向下取整通则。

超界不能只写“手调 / 沿用旧版”放行。禁止无实际效果的扣项，禁止为维持旧倍率反求一笔恰好抵消条件收益的成本；一次迁移只有以下两条合法路径：

1. **保留加成型**：删去旧加法及反向抵扣，用完整乘法式重算，默认取 `roundedPower`，同步招式卡、预算注、威力示例和汇总镜像。
2. **明确改门槛型**：保留真实施放条件，明写 `adjCondition=0` 并从零重算。只有原值与新 `rawPower` 的总偏差仍 ≤0.05 时才可保留；不符则继续改倍率，不能以改名为门槛型绕过数值核验。

以下三例只演示本节算法，具体招式的正式实例仍由所属图鉴维护；默认绝招代价、`AF=Kd=Kp=1`，未列成本为 0：

| 类型 / 既有卡 | 原记法 / 声明 | 唯一复算 | 迁移结果 |
|---|---|---|---|
| 加法旧卡：古龙绝回 `mv_jingwumingkuaijian_juehui` | 现为 `3.00+0.30=3.30`；自气血≤40% 的既有罕见判价 **【建议值】** | `3.00×(1+0.30)=3.90` | 加成型应为 **3.90**；原 3.30 的差 `−0.60` 不属手调 |
| 乘法卡：康熙夜隙一闪 `mv_huahuijian_yexi` | 夜间常见 `+0.15`；现值 **3.45**（旧 3.15 已改） | `3.00×(1+0.15)=3.45` | 保留 **3.45**，补加成型标注即可 |
| 门槛型：乾隆反常合道 `mv_baihuacuo_fanchang` | 目标有姿态；门槛型 `adjCondition=0`，破招成本 0.10 | `3.00×(1+0)−0.10=2.90` | 保留 **2.90**，补标准门槛型标注；不能另加 0.15 |

### 4.9 招式栏（`moveSlots`）

- 每门装配中的武学，战斗中最多暴露 `moveSlots` 个普通招式（黄/玄 3、地 4、天 5）＋全部已解锁绝招。
- 玩家在"武学"界面为每门武学勾选招式；默认自动选择最新解锁的若干招。
- `autoGroup` 组（如独孤九剑的"破招"）只占 1 格。
- 触发型招式（§4.10）不占招式栏，但须在"触发"子栏勾选（每门武学 ≤ 1 个）。

### 4.10 触发型招式与普攻

- **触发型招式**：`trigger.on` ∈ `meleeAttacked`、`backAttacked`、`parrySuccess`、`allyAttacked`、`enemyEnterAdjacent`。触发时不占行动、不耗气势；照常耗内（不足则不触发）；每次来袭最多触发 1 个（按 `chance` 高者优先）；`perRound` 为每回合上限（此处"回合" = 持有者自身一次行动间隔）。独立攻击型触发招用 `purpose:attack` 的 `meridianRouteRef`；招架、卸力或闪避触发用 `routeOnTriggerRef` 且用途为 `defense` / `movement`。主动防守架势自带的 `stanceCounter`（如“或跃在渊”）沿用该招唯一的 `purpose:defense` 主路线，触发伤害段不再创建第二条 attack 路线。路线照常产生 `flowCt` 与共享节点伤势，不能因“不占行动”变成免费运气；外放反击架势按 §4.2.2 保持自身中心且不增加瞄准射程；反应额度、恢复债务与判定时序归 design/09。
- **普攻**：每个角色都有隐藏武学 `sk_basic`（基本功，grade 1，固定 5 重，L = 1.0，不计入图鉴、不参与携带），招式 `mv_basic_strike`（普通一击：单体、近身、`power 0.80`、耗内 0、`recovery 900`）。内力不足时仍可行动；它引用 design/21 §4.2 的 2 段 `purpose:attack` 短路线，单段 70 CT，故完整 `flowCt=2×70=140`、总收招 `900+140=1040≤2000`。普攻也参与 Z5M，但短路线只部分兑现强度差。

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

`targetHasTag` 的值始终是一个字符串；多标签 OR 写 `any:[{targetHasTag:seal},{targetHasTag:cc}]`，不得把字符串改成数组。**“目标骑乘”正式复用 `condition:{targetHasTag:mounted}`**，不新增 `targetMounted` 等同义键。`mounted` 只读取目标当前战场实例已登记的骑乘事实，不等于拥有马匹、曾骑乘或探索移速加成；普通战斗依 `design/10` §11.4 入场下马，默认无此标签，只有章节 / `design/09` 明确授权并投影的特殊骑乘场景可为真。通行册斩马 `mv_junzhongdao_zhanma` 据此编码，既有罕见判价按 §4.8 为 `3.00×1.30=3.90`；未授权骑乘场景不得为了让该招可用伪造标签。

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

每门 `category: inner` 的武学都必须显式填写 `nature: yang|yin|harmony`；`neutral` 只允许外功。`nature` 不是按招式刚柔、寒热表现或正逆周天猜测，而是按该卡 `inner.meridians` 所列**主修经脉**判定（AR-18）：

1. 督脉与手足三阳经投阳票，任脉与手足三阴经投阴票；阴跷 / 阴维投阴，阳跷 / 阳维投阳。每个主修经脉投一票，不因某脉穴位较多重复加权。
2. 阳票多即 `yang`，阴票多即 `yin`；两侧均有票且平票即 `harmony`。冲脉 / 带脉自身维持调和，默认不投票；若清单只有冲 / 带或为空，则性质取 `harmony`。冲 / 带是否应参加内功性质投票为 AR-18a **（待作者确认）**。
3. `inner.meridians: []` 仍表示无专精；它只按本条回退为 `harmony`，不获得任何全经脉专精。`natureFollowAux:true` 等运行时特例仍按字段说明结算，不反写卡片静态性质。
4. 正 / 逆周天只决定真气用途：正行偏养生、敛气入骨，逆行偏武击、逼气出体；不决定阴阳。阴、阳内功均可逆行发招。招式路线另按 `design/21` §2.4 的体段判定，劳宫等动作出口不反推内功性质。

该分类属于本作规则化判断，原著未给出统一三分法处均按**（原创扩展）**处理（AR-02、AR-18）。

性质定义：

| 性质 | ID | 特点 | 原著代表（本作设定，性质归属多为游戏化判断） |
|---|---|---|---|
| 阳 | `yang` | 主修督脉或手足三阳；可表现为刚猛、炽热、爆发 | 先天功、龙象般若功、蛤蟆功、葵花宝典 |
| 阴 | `yin` | 主修任脉或手足三阴；可表现为绵长、阴寒、柔韧 | 玉女心经、寒冰真气、峨眉九阳功 |
| 调和 | `harmony` | 阴阳主修票平衡，或只主修不投票的冲 / 带（含无专精回退） | 易筋经、九阴真经（总纲）、九阳神功、吸星大法、太玄经、小无相功 |
| 中性 | `neutral` | **仅外功**：招意不依内力性质 | 独孤九剑、太祖长拳、多数黄阶外功 |

表现词只用于叙事校验，不能压过主修经脉。例如阳刚掌势可经劳宫“气过阴门”，其动作出口属于“用”，不会把阳性内功改成阴；详见 `design/21` §2.4、§4.3.1。“阴阳交泰”可解释高阶阳刚掌在末端借阴经收敛导引、降低失控风险，但不新增 Z5、走火或减伤乘区。

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

#### 5.3.1 AR-18 图鉴静态性质审计（只读，不在本文改卡）

**NYY 历史基线（2026-09-29，保留追溯）**：当时以 `python3 tools/lint/check_skill_catalogs.py --delivery --details` 对 `design/catalog/skills-*.md` 做正式武学卡归属与唯一 `sk_*` 去重审计，识别 254 张内功卡（跨册无重复正式 ID），其中 147 张显式列出可解析的 `inner.meridians`，107 张缺该字段而不能按 AR-18 审计；可审部分按上文多数票重算，有 56 张的声明 `nature` 与主修经脉不符。下表“现值→应值”均指当时快照，不作为现行性质；NR4 完成值见本节后附“NR4 落地结果”。

| 正式定义册 | 内功卡 | 有主修经脉 | 缺 `inner.meridians` | 性质不符 |
|---|---:|---:|---:|---:|
| `skills-bulu-01-tianlong` / `02-shediao` / `03-shendiao` | 3 / 5 / 4 | 3 / 5 / 4 | 0 / 0 / 0 | 0 / 2 / 0 |
| `skills-bulu-04-yitian` / `05-xiaoao` / `06-xiake` | 7 / 5 / 4 | 7 / 5 / 4 | 0 / 0 / 0 | 3 / 1 / 1 |
| `skills-bulu-07-bixue` / `08-luding` / `09-liancheng` | 7 / 16 / 2 | 7 / 16 / 2 | 0 / 0 / 0 | 4 / 6 / 0 |
| `skills-bulu-10-baima` / `11-yuanyang` / `12-shujian` | 2 / 0 / 2 | 2 / 0 / 2 | 0 / 0 / 0 | 0 / 0 / 0 |
| `skills-bulu-13-feihu` / `14-xueshan` | 8 / 1 | 0 / 1 | 8 / 0 | 0 / 0 |
| `skills-daojia` / `general` / `gulong` | 23 / 8 / 9 | 4 / 7 / 6 | 19 / 1 / 3 | 2 / 3 / 2 |
| `skills-kangxi` / `qianlong` / `shaolin` | 16 / 11 / 12 | 9 / 5 / 0 | 7 / 6 / 12 | 3 / 2 / 0 |
| `skills-wujue` / `wuyue` | 29 / 21 | 12 / 21 | 17 / 0 | 6 / 12 |
| `skills-xiake-bixue` / `xiaoyao` / `yitian` | 23 / 23 / 13 | 12 / 0 / 13 | 11 / 23 / 0 | 2 / 0 / 7 |
| **合计** | **254** | **147** | **107** | **56** |

| 正式定义册 | 明显不符（`skillId 现值→应值`） | 数量 |
|---|---|---:|
| `skills-bulu-02-shediao` | `sk_quanzhenzhoutiangong yang→harmony`；`sk_taohuaguiyuanjue harmony→yin` | 2 |
| `skills-bulu-04-yitian` | `sk_bosishenghuoxuangong harmony→yang`；`sk_kongtongwuxingxinfa harmony→yin`；`sk_huashanliangyixinfa04 harmony→yang` | 3 |
| `skills-bulu-05-xiaoao` | `sk_jianzongxingqi harmony→yang` | 1 |
| `skills-bulu-06-xiake` | `sk_dingshixinfa harmony→yin` | 1 |
| `skills-bulu-07-bixue` | `sk_huashanqigong07 yang→harmony`；`sk_shiliangwuxinggong harmony→yin`；`sk_tiejianxuangong harmony→yang`；`sk_xianduyunqi harmony→yin` | 4 |
| `skills-bulu-08-luding` | `sk_bukuhutiaogong yang→harmony`；`sk_fansenghutigong yang→harmony`；`sk_luochabujunhuxi harmony→yin`；`sk_pingxixingqijue yang→yin`；`sk_wangwuzhenshanxinfa harmony→yin`；`sk_yanpingfanchaojue harmony→yin` | 6 |
| `skills-daojia` | `sk_beidouxinfa yang→harmony`；`sk_wudangyangshenggong harmony→yin` | 2 |
| `skills-general` | `sk_jianghutuna harmony→yin`；`sk_jindunxinfa yang→harmony`；`sk_wuguanxinfa harmony→yin` | 3 |
| `skills-gulong` | `sk_daqixinfa harmony→yin`；`sk_qinglongtuna harmony→yin` | 2 |
| `skills-kangxi` | `sk_linrenhexinfa harmony→yin`；`sk_meinianshengxinfa harmony→yin`；`sk_xuedaoxinfa yin→harmony` | 3 |
| `skills-qianlong` | `sk_guangpingxinfa harmony→yin`；`sk_miaojiaxinfa harmony→yin` | 2 |
| `skills-wujue` | `sk_baituotunadu yin→harmony`；`sk_biguqipian harmony→yin`；`sk_duanshiyangshenggong harmony→yin`；`sk_gaibanghuxinfa yang→harmony`；`sk_jiuyintiaoxipian harmony→yin`；`sk_taohuatunaxi harmony→yin` | 6 |
| `skills-wuyue` | `sk_xixing yin→harmony`；`sk_kuihua yin→yang`；`sk_zixiashengong yang→harmony`；`sk_huashanxinfa harmony→yin`；`sk_huashantuna harmony→yin`；`sk_taishanxinfa harmony→yang`；`sk_taishantuna harmony→yang`；`sk_hengshanbeixinfa harmony→yin`；`sk_hengshanbeituna harmony→yin`；`sk_riyuexinfa yin→harmony`；`sk_heimutuna yin→harmony`；`sk_wuxianbaidugong yin→harmony` | 12 |
| `skills-xiake-bixue` | `sk_changlexinfa harmony→yin`；`sk_hunyuangong yang→harmony` | 2 |
| `skills-yitian` | `sk_jiuyang yang→harmony`；`sk_emeijiuyang yang→yin`；`sk_shenghuoxinfa harmony→yang`；`sk_emeixinfa harmony→yin`；`sk_kunlunxinfa harmony→yang`；`sk_kongtongyangshenggong harmony→yin`；`sk_tieniuyaogong yang→harmony` | 7 |
| **合计** | 15 册、56 张唯一内功卡 | **56** |

三张紧凑格式卡已由脚本按卡归属核对且不列异常：`sk_aobaihengliangong=yang`（督脉＋手阳明）、`sk_hasakeyunqi=yang`（督脉＋阳维）、`sk_huahuixinfa=yin`（任脉＋阴维）。`sk_motianzhang`、`sk_dingshiqinnashou`、`sk_yunvjian19`、`sk_qixianwuxingjian` 虽出现 `meridians` 字样但属于外功路线说明，已排除，不能误改为内功。

历史快照中缺字段的 107 张当时须先由后续图鉴任务补主修经脉，不能仅凭旧 `nature` 倒推；集中于 `bulu-13-feihu` 8、`daojia` 19、`general` 1、`gulong` 3、`kangxi` 7、`qianlong` 6、`shaolin` 12、`wujue` 17、`xiake-bixue` 11、`xiaoyao` 23。尤其 `skills-shaolin.md` 的 12 张与 `skills-xiaoyao.md` 的 23 张内功当时全部缺字段，NYY 轮不列入“不符”而列为不可审计。**已解决：NR4 已补齐，见下文现值表。**

后续迁移须把同卡的 `nature`、`BreathProfile.nature`、`requiredNature`、护体档显示与引用处一并核对；若作者改变 AR-18a，先重跑本表再改卡。仅靠把 `nature` 改成推导值而保留相反的主修经脉或调息档，仍视为未闭合。

`requiredNature` 的主运准入与性质亲和的先后顺序、`allowOpposedNature` 的静态审计边界，统一见 `design/21` §4.6；本文不把亲和矩阵的非零值解释成路线准入许可。

##### NR4 落地结果（2026-09-30）

**已解决：十二个 NR4 单元、25 个图鉴文件现已落地。**重新运行 `python3 tools/lint/check_skill_catalogs.py --delivery --details` 与 `python3 tools/agents/check_nr4_unit.py docs/design/catalog/skills-*.md`，全库三项计数为：路线性质冲突 `0`、缺主修经脉 `0`、内功性质冲突 `0`；各册亦均为 `0 / 0 / 0`。脚本观测为 `inner_nature=254/254`，不能把此数直接当成全库内功卡总数。

一次性卡片扫描沿用检查器的正式卡归属、显式性质与主修经脉读取，再补识别“内功（品阶·性质）”黄阶一行格式：另得通用册 6 张、倚天册 5 张，故完整现值为 **265 = 254 + 6 + 5**，全部有主修经脉且与声明性质一致。独立以逐武学 `txp_*` 核对，也是 265 个，与内功 ID 同后缀一一对应。完整 ID / 中文名 / 现性质表与生成说明见 `tools/agents/reports/NR4S-rules.md` §7；检查器的漏识别交工具归属任务修复，不在本文改脚本。

| 正式定义册 | 内功卡（完整扫描） | 有主修经脉 | 性质不符 | 检查器识别卡数 |
|---|---:|---:|---:|---:|
| `skills-bulu-01-tianlong` | 3 | 3 | 0 | 3 |
| `skills-bulu-02-shediao` | 5 | 5 | 0 | 5 |
| `skills-bulu-03-shendiao` | 4 | 4 | 0 | 4 |
| `skills-bulu-04-yitian` | 7 | 7 | 0 | 7 |
| `skills-bulu-05-xiaoao` | 5 | 5 | 0 | 5 |
| `skills-bulu-06-xiake` | 4 | 4 | 0 | 4 |
| `skills-bulu-07-bixue` | 7 | 7 | 0 | 7 |
| `skills-bulu-08-luding` | 16 | 16 | 0 | 16 |
| `skills-bulu-09-liancheng` | 2 | 2 | 0 | 2 |
| `skills-bulu-10-baima` | 2 | 2 | 0 | 2 |
| `skills-bulu-11-yuanyang` | 0 | 0 | 0 | 0 |
| `skills-bulu-12-shujian` | 2 | 2 | 0 | 2 |
| `skills-bulu-13-feihu` | 8 | 8 | 0 | 8 |
| `skills-bulu-14-xueshan` | 1 | 1 | 0 | 1 |
| `skills-daojia` | 23 | 23 | 0 | 23 |
| `skills-general` | 14 | 14 | 0 | 8 |
| `skills-gulong` | 9 | 9 | 0 | 9 |
| `skills-kangxi` | 16 | 16 | 0 | 16 |
| `skills-qianlong` | 11 | 11 | 0 | 11 |
| `skills-shaolin` | 12 | 12 | 0 | 12 |
| `skills-wujue` | 29 | 29 | 0 | 29 |
| `skills-wuyue` | 21 | 21 | 0 | 21 |
| `skills-xiake-bixue` | 23 | 23 | 0 | 23 |
| `skills-xiaoyao` | 23 | 23 | 0 | 23 |
| `skills-yitian` | 18 | 18 | 0 | 13 |
| **合计** | **265** | **265** | **0** | **254** |

NR4 改性总清单由十二份报告 §7 的改性质记录取旧值、按 ID 去重，再逐卡核实新值；排除“性质不变”与外功补字段项，共 **80 = 基线 56 + 追加 24**。追加项包括原缺字段卡补齐后才可判定者，以及黄阶单行解析漏项；不能把原来 56 张历史清单当作全部改性。道家为 7 门（原 2＋追加 5），五绝为 9 门（原 6＋追加 3）；少林、逍遥内功改性均为 0。下表“基线”指上方 NYY 的 56 张，其他均标“追加”。

| 正式定义册 | 内功 ID / 中文名 | 改前 → 现值 | 清单来源 |
|---|---|---|---|
| `skills-bulu-02-shediao` | `sk_taohuaguiyuanjue` 桃花归元诀 | `harmony → yin` | 基线 |
| `skills-bulu-02-shediao` | `sk_quanzhenzhoutiangong` 全真周天功 | `yang → harmony` | 基线 |
| `skills-bulu-04-yitian` | `sk_bosishenghuoxuangong` 波斯圣火玄功 | `harmony → yang` | 基线 |
| `skills-bulu-04-yitian` | `sk_kongtongwuxingxinfa` 崆峒五行心法 | `harmony → yin` | 基线 |
| `skills-bulu-04-yitian` | `sk_huashanliangyixinfa04` 华山两仪心法 | `harmony → yang` | 基线 |
| `skills-bulu-05-xiaoao` | `sk_jianzongxingqi` 剑宗行气诀 | `harmony → yang` | 基线 |
| `skills-bulu-06-xiake` | `sk_dingshixinfa` 丁氏心法 | `harmony → yin` | 基线 |
| `skills-bulu-07-bixue` | `sk_shiliangwuxinggong` 石梁五行功 | `harmony → yin` | 基线 |
| `skills-bulu-07-bixue` | `sk_xianduyunqi` 仙都运气诀 | `harmony → yin` | 基线 |
| `skills-bulu-07-bixue` | `sk_huashanqigong07` 华山养气功 | `yang → harmony` | 基线 |
| `skills-bulu-07-bixue` | `sk_tiejianxuangong` 铁剑玄功 | `harmony → yang` | 基线 |
| `skills-bulu-08-luding` | `sk_bukuhutiaogong` 布库护腰功 | `yang → harmony` | 基线 |
| `skills-bulu-08-luding` | `sk_fansenghutigong` 番僧护体功 | `yang → harmony` | 基线 |
| `skills-bulu-08-luding` | `sk_wangwuzhenshanxinfa` 王屋镇山心法 | `harmony → yin` | 基线 |
| `skills-bulu-08-luding` | `sk_pingxixingqijue` 平西行气诀 | `yang → yin` | 基线 |
| `skills-bulu-08-luding` | `sk_yanpingfanchaojue` 延平泛潮诀 | `harmony → yin` | 基线 |
| `skills-bulu-08-luding` | `sk_luochabujunhuxi` 罗刹步军呼吸 | `harmony → yin` | 基线 |
| `skills-bulu-13-feihu` | `sk_huiwuguixin` 会武归心诀 | `harmony → yin` | 追加 |
| `skills-daojia` | `sk_quanzhentunajue` 全真吐纳诀 | `yang → yin` | 追加 |
| `skills-daojia` | `sk_baiyunguanxinfa` 白云观心法 | `harmony → yin` | 追加 |
| `skills-daojia` | `sk_beidouxinfa` 北斗心法 | `yang → harmony` | 基线 |
| `skills-daojia` | `sk_jianzhongtuna` 剑冢吐纳 | `harmony → yang` | 追加 |
| `skills-daojia` | `sk_taihegong` 太和功 | `harmony → yin` | 追加 |
| `skills-daojia` | `sk_wudangyangshenggong` 武当养生功 | `harmony → yin` | 基线 |
| `skills-daojia` | `sk_zhenwudaoyin` 真武导引 | `harmony → yin` | 追加 |
| `skills-general` | `sk_shanyetuna` 山野吐纳 | `harmony → yin` | 追加 |
| `skills-general` | `sk_jindunxinfa` 金盾心法 | `yang → harmony` | 基线 |
| `skills-general` | `sk_wuguanxinfa` 武馆心法 | `harmony → yin` | 基线 |
| `skills-general` | `sk_jianghutuna` 江湖吐纳 | `harmony → yin` | 基线 |
| `skills-general` | `sk_zhuangxingong` 壮行功 | `yang → yin` | 追加 |
| `skills-general` | `sk_tunaqianjue` 吐纳浅诀 | `harmony → yin` | 追加 |
| `skills-general` | `sk_huxixingqi` 呼吸行气 | `harmony → yin` | 追加 |
| `skills-gulong` | `sk_daqixinfa` 大旗吐纳 | `harmony → yin` | 基线 |
| `skills-gulong` | `sk_qinglongtuna` 青龙吐纳 | `harmony → yin` | 基线 |
| `skills-kangxi` | `sk_xuedaoxinfa` 血刀心法 | `yin → harmony` | 基线 |
| `skills-kangxi` | `sk_meinianshengxinfa` 梅门心法 | `harmony → yin` | 基线 |
| `skills-kangxi` | `sk_linrenhexinfa` 林任合心诀 | `harmony → yin` | 基线 |
| `skills-kangxi` | `sk_xiangxituna` 湘西吐纳 | `harmony → yin` | 追加 |
| `skills-kangxi` | `sk_pingxituna` 平西军吐纳 | `yang → yin` | 追加 |
| `skills-qianlong` | `sk_miaojiaxinfa` 苗家心法 | `harmony → yin` | 基线 |
| `skills-qianlong` | `sk_guangpingxinfa` 广平心法 | `harmony → yin` | 基线 |
| `skills-qianlong` | `sk_huibutunaxi` 回部吐纳 | `harmony → yin` | 追加 |
| `skills-qianlong` | `sk_miaojialianqi` 苗家炼气 | `harmony → yin` | 追加 |
| `skills-wujue` | `sk_gaibanghuxinfa` 丐帮护心法 | `yang → harmony` | 基线 |
| `skills-wujue` | `sk_taohuatunaxi` 桃花吐纳息 | `harmony → yin` | 基线 |
| `skills-wujue` | `sk_baituotunadu` 白驼吐纳术 | `yin → harmony` | 基线 |
| `skills-wujue` | `sk_duanshiyangshenggong` 段氏养生功 | `harmony → yin` | 基线 |
| `skills-wujue` | `sk_jiuyintiaoxipian` 九阴调息篇 | `harmony → yin` | 基线 |
| `skills-wujue` | `sk_biguqipian` 辟谷气篇 | `harmony → yin` | 基线 |
| `skills-wujue` | `sk_yaoputunaxi` 药圃吐纳息 | `harmony → yin` | 追加 |
| `skills-wujue` | `sk_shexingtunaxi` 蛇形吐纳息 | `yin → harmony` | 追加 |
| `skills-wujue` | `sk_wangfutunaxi` 王府吐纳息 | `yang → yin` | 追加 |
| `skills-wuyue` | `sk_xixing` 吸星大法 | `yin → harmony` | 基线 |
| `skills-wuyue` | `sk_kuihua` 葵花宝典 | `yin → yang` | 基线 |
| `skills-wuyue` | `sk_zixiashengong` 紫霞神功 | `yang → harmony` | 基线 |
| `skills-wuyue` | `sk_huashanxinfa` 华山心法 | `harmony → yin` | 基线 |
| `skills-wuyue` | `sk_huashantuna` 华山吐纳 | `harmony → yin` | 基线 |
| `skills-wuyue` | `sk_taishanxinfa` 泰山心法 | `harmony → yang` | 基线 |
| `skills-wuyue` | `sk_taishantuna` 泰山吐纳 | `harmony → yang` | 基线 |
| `skills-wuyue` | `sk_hengshanbeixinfa` 恒山心法 | `harmony → yin` | 基线 |
| `skills-wuyue` | `sk_hengshanbeituna` 恒山吐纳 | `harmony → yin` | 基线 |
| `skills-wuyue` | `sk_riyuexinfa` 日月心法 | `yin → harmony` | 基线 |
| `skills-wuyue` | `sk_heimutuna` 黑木吐纳 | `yin → harmony` | 基线 |
| `skills-wuyue` | `sk_wuxianbaidugong` 五仙百毒功 | `yin → harmony` | 基线 |
| `skills-xiake-bixue` | `sk_changlexinfa` 长乐心法 | `harmony → yin` | 基线 |
| `skills-xiake-bixue` | `sk_hunyuangong` 混元功 | `yang → harmony` | 基线 |
| `skills-xiake-bixue` | `sk_changletuna` 长乐吐纳 | `harmony → yin` | 追加 |
| `skills-xiake-bixue` | `sk_xuansuzhuanggong` 玄素桩功 | `harmony → yin` | 追加 |
| `skills-xiake-bixue` | `sk_shangqingtuna06` 上清吐纳·侠客 | `harmony → yin` | 追加 |
| `skills-xiake-bixue` | `sk_tiejantuna` 铁剑吐纳 | `harmony → yin` | 追加 |
| `skills-xiake-bixue` | `sk_xiandutuna` 仙都吐纳 | `harmony → yin` | 追加 |
| `skills-yitian` | `sk_jiuyang` 九阳神功 | `yang → harmony` | 基线 |
| `skills-yitian` | `sk_emeijiuyang` 峨眉九阳功 | `yang → yin` | 基线 |
| `skills-yitian` | `sk_shenghuoxinfa` 圣火心法 | `harmony → yang` | 基线 |
| `skills-yitian` | `sk_emeixinfa` 峨眉心法 | `harmony → yin` | 基线 |
| `skills-yitian` | `sk_kunlunxinfa` 昆仑心法 | `harmony → yang` | 基线 |
| `skills-yitian` | `sk_kongtongyangshenggong` 崆峒养生功 | `harmony → yin` | 基线 |
| `skills-yitian` | `sk_tieniuyaogong` 铁牛腰功 | `yang → harmony` | 基线 |
| `skills-yitian` | `sk_emeitunajue` 峨眉吐纳诀 | `harmony → yin` | 追加 |
| `skills-yitian` | `sk_kunluntunajue` 昆仑吐纳诀 | `harmony → yang` | 追加 |

### 5.4 阴阳相冲与桥接

- **相冲**：主运与任一辅运一阳一阴，且装配中没有桥接内功。
  - 该辅运比例降为 0.25（§5.2）。
  - 每场战斗开始时判定一次"内息相冲"：`p = 0.08 × (1 − wil/150)`，命中则获得 `bf_neixiwenluan`（走火入魔 1 级，§10），品阶取两门内功中较高者。
  - 闭关修炼相冲组合中的任一门时，心魔概率 ×2（§8.3）。
- **桥接**：任一内功栏装配了性质为 `harmony` 且品阶 ≥ 7 的内功，或内功标有 `inner.bridge: true`。桥接消除相冲判定。
- 特例（原著依据）：九阳神功与"玄冥神掌"寒毒之间是**相克**而非相冲——九阳第 6 重起免疫品阶 ≤ 自身的 `cold` 标签 Buff（§13.4）。

### 5.5 内功贡献接口（与 design/03 对接）

每门内功定义 `inner.contribution`（第 10 重、主运时的旧预算值）。AR-19 后 `mpMaxPct/hpMaxPct` 只供 v2 回放、图鉴预算审计与一次性迁移，**不得**进入生产 `hpMax/mpMax`；资源根值唯一见 03 §5.1。`attrs/mpRegen/stats` 仍按本节消费：

```
InnerTotal = Σ_{内功栏 i} contribution_i × innerScale(effLayer_i) × ratio_i
innerScale(n) = 0.30 + 0.07 × n          // 1 重 0.37，5 重 0.65，10 重 1.00
ratio_i = 1（主运）或 auxRatio（辅运）
```

| 字段 | 含义 | 在 design/03 中的作用（建议） |
|---|---|---|
| `mpMaxPct` | 旧内力上限预算 | 禁止新写入资源；迁移差额进 03 `legacyMpCredit` |
| `hpMaxPct` | 旧气血上限预算 | 禁止新写入资源；迁移差额进 03 `legacyHpCredit` |
| `attrs` | 先天属性加点 `{con, str, agi, wis, wil}` | 加在先天属性上（可突破 100，受 120 上限） |
| `mpRegen` | 每回合内力恢复（% mpMax） | 每次自身行动开始恢复，字段名与上限已由基准 §6、design/03 确认 |
| `stats` | 战斗属性（如 `defIn` +%、`resInjury` +） | 按 design/03 的合成规则 |

**兼容预算**（第 10 重主运；只审计存量卡 / v2 回放）：内功点 `IP` = `mpMaxPct` + `hpMaxPct` + 2 × 属性点 + 5 × `mpRegen`；单项可在标准值 ±30% 内调整，但 IP 总和须在 ±5% 内。新卡的永久资源贡献由 03 按品阶与 `resourceLayer` 统一计算，不能再用本表百分比调资源：

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

**兼容例（AR-18 历史回放；不得用于 AR-19 生产资源）**：主运易筋经 10 重（天上预算 IP 156；本条目实际 IP 155）＋辅运九阳神功 8 重（天上，调和）。两门均为调和，§5.2 基础辅运比例为 `0.50`；本例主运已解锁“易筋大成”，故实际 `auxRatio=min(0.60,0.50+0.10)=0.60`。九阳旧贡献比例为 `0.86×0.60=51.6%`，旧 `mpMaxPct=60` 曾得 `30.96%`；迁移器只据此前后资源差写一次 `legacyMpCredit`。新档直接按 03 §5.1 计九阳的品阶 × `resourceLayer`，不读该百分比。

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
| `meridians` | `MeridianId[]` | 主修兼冲穴专精经脉；只允许 `design/15` §2 的 20 个正式 ID，按 §5.3 推导静态 `nature`；空数组表示无专精并回退调和，而非全专精 |
| `breathProfileRef` | `BreathProfileId` | 必填；引用 design/21 §10、§12 的 `txp_*` 调息档案。档案持有品阶 / 层数投影、性质、触及节点数、1000 CT 与 0 额外内力成本；05 不复制其公式 |
| `innerGuard` | object | 必填；武学侧防守档 `{enabled, reflectBp?}`。`enabled` 表示主运可通过自然护体或 `purpose:defense` 护体路线启用护体内劲；`reflectBp` 只桥接已有固定反震语义，省略为 0，见 §5.10 |
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

#### 5.8.1 丹田产气、运气速度与通量锻炼（AR-19）

每门内功的 `InnerDef` 增加以下静态数值；均为**（原创扩展）**，逐门内容可按品阶在范围内配表，但运行公式唯一见 `design/21` §2.3、§2.5：

| 字段 | 范围 / 默认 | 含义 |
|---|---:|---|
| `baseQiPerTick` | 4–32，默认 `4+2×grade` 后钳制 | 第 1 档曲线前的丹田基础产气 |
| `baseQiSpeedBp` | 5000–16000，默认 `5500+750×grade` 后钳制 | 基础运气速度，10000 bp = 每 tick 1 长度单位 |
| `layerCurveBp[1..9]` | 每项 4000–14000；默认 `5000+625n` | 熟练层曲线，必须非递减 |
| `fluxTrainBase` | 1–8，默认 `1+floor(grade/2)` 后钳制 | 完整修炼周期的通量锻炼基数 |
| `fluxTrainHardCap` | 穴 64 / 脉 96 | 只能等于 15 的全局硬上限，不允许逐卡抬高 |
| `digestRatioBp` | 10000–100000，默认 10000 | 来源内功异种气每 1 点需守方多少内力消化：10000=1:1，100000=10:1；算法见 21 §4.4.3 |
| `reverseQi` | bool，默认 false | 可否以 1:2 反引异种气为一次反向输出；只开放能力，容量、伤害与临时气量规则见 21 §4.4.3.4 |

主运全额使用表中五项（其中硬上限对象含穴 / 脉两个固定值）；辅运不再并行产第二份气，只有明确被动可按既有预算修饰主运最终值。战斗取 `practiceLayer=min(effLayer,9)`，永久资源取 `resourceLayer=min(trueLayer,9)`；第 10 重不会重复提高产气或资源。完整修炼周期把实际跑通经脉 / 穴位交给 15 原子写入 `fluxCap`，战斗运劲 / 急性聚气不算修炼周期。

标准三档验算可配为低 `8/8000`、中 `16/10000`、高 `28/12500`（产气 / 速度，均已含当前层曲线）；它们与弱 / 标准 / 强脉宽度 6 / 16 / 32 的组合表唯一见 21 §14.12，本文不复制伤害值。

`digestRatioBp` 描述这门内功作为**异种气来源**时的凝练程度，不是持有者的消化能力加成，不乘层数或品阶。首版示例均为**（原创扩展）**且只作 schema / 平衡夹具：`sk_jiuyang`、化功大法、北冥神功取 10000；幻阴指来源取 100000。具体卡不在本文图鉴段改写，后续图鉴任务须确认正式 ID 与逐门值。`reverseQi:true` 首版仅建议给正式 `sk_douzhuan`；它与 06 `bf_douzhuan` 的整招镜返是不同分支，同一 cause 不可兼得。

### 5.9 运劲接口（AR-12）

运劲是内功驱动的战斗行动。行动时序、通用回内 / 防护、消耗与七个子类 `tiaoxi|huti|xuli|bidu|liaoshang|cuiqinggong|huajie` 归 design/09 §4.8.4；`tiaoxi` 对战斗经脉的理顺、卸积、修复和解穴参数归 design/21 §10。主运默认只可使用该内功 `inner.yunjin` 列出的分支；辅运还必须列入 `inner.auxYunjin`。内功专属招式若填 `move.yunjinMode`，代表覆写同子类通用运劲，不得同次叠加。运劲与战斗调息均不推进冲穴进度。

### 5.10 调息档案与外放抵消接口（AR-14 / AR-19）

每门内功必须引用一份 `inner.breathProfileRef: txp_*`。`txp_*` 定义、通用生成式、触及节点全序、解穴门槛及战内 / 战外倍率唯一见 design/21 §10、§12；本文只负责把内功映射到档案。未定制者也必须引用由 21 的内容构建步骤预先登记、且按有效品阶、有效层数和性质投影的稳定档案，不能在运行时用显示名临时拼 ID，也不能把性质不同的现有档案临时复用。调息继续使用 `{t:yunjin, mode:tiaoxi}`：基础 1000 CT、经脉处理不另耗内力；9 级点穴禁自行调息。

`inner.innerGuard` 是护体路线的兼容武学侧参数，不保存抵消公式：

| 字段 | 范围 / 默认 | 说明 |
|---|---|---|
| `enabled` | bool；无主运时 false | 主运内功能否在合法自然护体短路或护体防守路线下启用；仅有字段不能跳过路线封闭 / 胀损 |
| `reflectBp` | 可选 int 0–2000；默认 0 | 只承载已有的固定反震值；层数曲线 / Buff 值由 06 在当前有效层数结算后投影到运行时，不能在这里写上限值冒充全层固定值。护体内劲本身不自动赠送反震，且沿用 04 的防递归标记 |

完整顺序只引用 design/21 §4.8：既有护体真气之后 → AR-19 外放抵消 → `mpGuard` → 气血；命中区阈值、区内气消耗、内劲全抵 / 外劲半抵和负真气差半抵基础伤害均不进入 `InnerDef`。来袭侧破体 / 破气仍投影为 `OutwardQiInput.breakGuardBp`，取合格来源最高值并钳 0–8000 bp。协议 3 不直接花当前 MP，不产生击穿迟滞 / CT；AR-14f 旧字段只供协议 2 回放。同一角色的攻击、防守、轻功与调息必须命中同一个经脉实例；我方与每个敌方单位各自独立，不能共享节点状态。

### 5.11 轻功武学的速度路线

`category: movement` 的武学必须填顶层 `movementRouteRef`，引用 `purpose: movement` 的稳定 `mfr_*`，作为装配该轻功后的常驻移动、首轮、CT、追击与闪避投影。轻功主动招式若发力路线不同，可在招式级 `meridianRouteRef` 覆写；未覆写时继承武学顶层路线。

- `movementRouteRef` 不改变 03 的面板轻功与基础 `spd`，也不改变 08 的 20 / 50 / 90 / 140 / 200 门禁或逐格地形成本；它只把 21 §4.9 的 `meridianSpeedBp` 交给 09。
- `movementRouteRef` 与招式 `meridianRouteRef` 都只存引用，不保存 `routeQualityBp` 或速度结果；这些是战斗实例的动态输出。
- 点穴、迟滞或胀损封住该路线时，09 使用 21 输出的降速 / 禁用结果；不得静默回退为无惩罚基础速度。
- §14 统计武学门数而非路线数；新增这些字段不增加任何武学、招式或绝招配额。

五绝图鉴的 `sk_bailingbu`、`sk_shichengbu`、`sk_huajianbu`、`sk_dianchibu`、`sk_shanlubu`、`sk_junzhubu`、`sk_qipaobu`，以及逍遥图鉴的 `sk_xuelingbu`、`sk_fengshabu`、`sk_qinyunbu`、`sk_yeyingbu`、`sk_junxingbu` 没有主动招式。内容构建器必须为每门生成本门专用的局部基础移动招：

| 字段 | 固定值 / 生成规则 |
|---|---|
| 父对象局部键 | `generatedLocalMoves.basic_movement.localMoveKey: basic_movement`；局部对象没有 `id`，不登记新的全局 `mv_*`，不产生小说招名 |
| 稳定复合引用 | `{skillId}#basic_movement`，只供对应路线的 `moveRef` 与构建产物内部引用；不得跨武学复用 |
| `MoveDef` 基础字段 | `name: 基础移动`、`unlock:1`、`kind:utility`、`ultimate:false`、`target:tile`、`delivery:self`、`mpCost:0`、`cd:0`、`recovery:1000`、`power:0`、`parryable:false`、`friendlyFire:none` |
| 路线绑定 | 局部招的 `meridianRouteRef` 必须等于图鉴已登记的顶层 `movementRouteRef`；该 `mfr_*` 的 `moveRef` 必须等于上述复合引用，`purpose` 必须为 `movement` |

该对象只是让常驻速度路线拥有可校验的动作锚点，不作为玩家额外按钮，也不计 `moves` 数量、`moveSlots` 或绝招配额。缺少局部招、复合 `moveRef` 不闭合、路线用途不是 `movement`，或对 12 门之外的武学擅自生成时，一律拒绝构建；不得伪造全局招名，也不得静默回退到 `mv_basic_strike` 或无路线移动。

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
| `legacy_fragment` | 跨年代三卷残本 | 1（首次卷） | 1卷4／2卷7／3卷9 | design/20 登记目标 | `sourceGrade=fragmentGrade`；不是 `pages`，不写 `SkillState.pages` |
| `legacy_synthesis` | 三卷＋信物校合全本 | 不免费升层 | 10 | design/20 登记目标 | 升级既有来源；真实品阶与当界上限见基准 §3、design/20 §7 |

**`LearnSource` 字段**：

| 字段 | 说明 |
|---|---|
| `type` | 上表之一 |
| `chapter` | 书界 ID（`observe`/`pages` 可省略，表示任何有该武学使用者/掉落的书界） |
| `ref` | NPC / 物品 / 任务 ID；静态 NPC 必须存在于 design/18 名录，泛化教头、院堂等无名职能应引用设施或组织的 role slot，不得伪造 `npc_*`；任务 ID 由各书界文档分配，本文中的占位仍待迁移 |
| `maxLayer` | 该学习途径可达最高层，整数 1–10；纯图鉴“听闻”或剧情标记不属于 `LearnSource`，由剧情事件直接写图鉴/标记（九阳示例见 §13.4） |
| `lineageGrade` | 残承途径的来源品阶；新学时写入 `SkillState.sourceGrade`，完整来源省略并取绝对品阶 |
| `formId` | 仅 `legacy_synthesis` 可填 `legacy_complete`；当前只允许 `sk_yuenvjian`，解析后的绝对品阶为 10 |
| `pagesTotal` | 仅 `pages` |
| `cost` | 门派贡献、银两、物品等；门派贡献与身份门槛归 design/12，银两与资源定价归 design/16 |
| `reqsOverride` | 该途径下覆写的门槛（如奇遇绕过门派身份） |
| `note` | 说明 |

**已习得武学再次获得途径**：不重复"习得"，按 design/02 提升 `sourceCap/sourceGrade`；完整来源可把 `sourceGrade` 补到解析后的绝对品阶。`legacy_fragment` 的卷数、品阶和投放只由 design/20 决定，`legacy_synthesis` 成功后写 `sourceCap=10`、完整 `sourceGrade`，但不免费提高 `trueLayer`。若为本书界原生途径且武学为外来，可作为印证事件载体（§7.8）。射雕/神雕少林以背景与有限入门为主；射雕保留易筋经完整线，神雕不提供易筋经完整新学（作者决定 P49）。低武全真/武当候选来源和密宗四门跨书复现均可采用，但具体获取必须标**（原创扩展）**并由各图鉴/书界定义（P25、P28）。

### 7.2 学习流程

```
发现（图鉴"听闻/见识"）→ 满足硬门槛？──否→ 不可学（UI 显示缺少条件）
                         └是→ 软门槛不足？──是→ 弹出风险提示（§7.3），玩家确认
                                           └否→ 习得：trueLayer=1, sxp=0, sourceCap=途径上限，
                                                sourceGrade=解析后的完整绝对品阶或途径 lineageGrade，
                                                formId=legacy_synthesis 指定的形态（否则 base）
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

### 7.10 跨年代残本与校合（接口）

- `legacy_fragment` 只消费 design/20 提交的 `skillId/sourceGrade/sourceCap/sourceId`；同源不同卷数依次给 `sourceCap=4/7/9`，不会写入散页数组，也不与书眠残篇或残承共享计数。
- `legacy_synthesis` 只消费 design/20 已通过配方、信物、人物条件及原武学硬门槛校验的结果；成功将来源升级为 `sourceCap=10` 和解析后的完整品阶，保留当前 `trueLayer/sxp`。
- 合成当界先按基准 §3 的 `legacyWorldCap` 计算有效品阶；进入后续书界后按一般外来武学规则计算。动态投放不会回写 `SkillDef.sourceChapters`，也不计入 §14.4 的静态本土池。
- `formId` 默认为 `base`。当前唯一允许的覆写是 `sk_yuenvjian@legacy_complete`；若形态后来化为残篇，存档必须连同 `resolvedAbsGrade=10` 保留，避免忆起时退回 9 品。

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
P = Σ_敌 sxpVal(敌 Ce) × 类型系数 × 修为档差系数
sxpVal(Ce) = round(10 + 3.3 × Ce)
类型系数：普通 1 / 精英 3 / Boss 10
修为档差系数：敌 `Ce ≥` 我方 `Ce−10` → 1.0；低 11–20 档 → 0.3；低 >20 档 → 0
```

| 敌 `Ce` | 1 | 10 | 20 | 30 | 35 | 44 | 50 | 60 | 70 |
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

速战按 design/09 §10.7 模拟出的使用次数照常分配武学经验，结算总量再 ×0.5（作者决定 P45）；旧角色经验 ×0.8 只供 design/13 的 v2 回放迁移，不得在生产结算生成或混入 `sxp`。

**例**：天龙中期，主角 `Ce30`、悟性 60（`trainWis` 1.08）、拳掌资质 70（1.20），击败 4 名 `Ce30` 敌人（P = 436）。本场降龙十八掌用了 3 次、太祖长拳 1 次、绝招 0 次：攻击池 = 436 × 59% = 257 → 降龙 3/4 = 193 → × 1.08 × 1.20 = **250 sxp**。降龙在第 3 重（升 4 重需 1,320）约需 5–6 场。

### 8.3 闭关

| 规则 | 值 |
|---|---|
| 地点 | 客栈/门派居所 1.0；洞府/寺观 1.2；灵地（瀑布、雪峰、古墓等）1.5；地点身份与坐标引用 design/11 的 `poi_*` / design/19 地图数据，修炼倍率由章节在事件载荷中显式给出，旧 `seclusionSpot` 仅作迁移名 |
| 每日收益 | `C(Ce) × trainMul × 地点系数`，`C(Ce) = 60 + 6 × Ce`（`Ce30 → 240/日`）；`Ce` 由闭关开始快照冻结 |
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
| 传功（`inherit`） | 一次性剧情奇遇：主运内功真实层数 +1～+3（不超过修为门槛与 `sourceCap`）；若还要表现温养，只能另带 15 `MeridianTemperEffect`，不得直写永久 `mpMax`。原著例：无崖子以毕生功力传虚竹（天龙）。 |

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
# 永久温养字段不在本对象定义；物品另引用 design/15 MeridianTemperEffect
```

- `pctNext` 类不受单场上限，但同一武学同一书界内经丹药获得的层数 ≤ 2（防嗑药速成）。
- 例（以 design/10 §8.3 已定物品为准）：少林大还丹 `it_dahuandan` 静服 → `mainInner, pctNext 0.35`；一般补气丹 `it_buqidan` → `sxpBuff 1.15 × 5 场`。两者是武侠游戏化扩展名物，不作为金庸原著专名。
- AR-19 永久药材 / 丹药强化只接 15 的单目标 `MeridianTemperEffect {gradeUp,strengthXp,fluxFlat}`；本节 `sxpGrant/sxpBuff` 只改变武功熟练，不得同时直写永久 `hpMax/mpMax`。

### 8.6 顿悟（悟性触发）

**触发**：每场战斗结束，对每门本场使用过的武学判定：

```
p = 0.5% + max(0, wis − 50) × 0.04% + lore × 0.005%
特殊情境 × 5：以弱胜强（参战敌方平均 `Ce` ≥ 我方平均 `Ce` + 5）、濒死得胜（结束时 hp < 10%）、首次击败某 Boss、在 `kind:vista` 的 `poi_*` 所在场景作战（POI 归 design/11，坐标归 design/19）
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
| 闭劲 | `bf_xueweishoufeng` 穴位受封 9 级、剩余 1 次自身行动；目标取其主要路线关键穴 | 1/7 |

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
- 葵花宝典（天中内功，阳；现值见 `catalog/skills-wuyue.md` 葵花卡）：**硬门槛 `vow: vow_duanchen`**；内功贡献以 `agi` 与 `spd` 为主，特有"鬼魅身法"类被动；运功招式可以绣花针为投射物（原著东方不败以绣花针为兵刃）。
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
| 强行冲关失败 | `1 − 成功率` | 2（距所需 `Ce` 门槛 ≥ 10 档时 3） | §3.3 |
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

- Canon V16-04 所指的门派图鉴 `docs/design/catalog/skills-*.md` 与按书补录图鉴 `docs/design/catalog/skills-bulu-NN-*.md` 同为正式武学定义源；后者拥有其所列具体 `sk_*`、`mv_*`、`mfr_*`、`txp_*` 与来源实例，不是只供章节参考的附录。构建时两类文件进入同一注册、去重、引用与校验流程。
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
| 招式 | 从 A、B 的普通招式中选至多 `moveSlots` 个（每招 `power × 0.95`，其余字段保留）＋按产物品阶配绝招；产物上限地上 9，故地下 1、地中 1–2、地上 2，且每个绝招各有独立路线 |
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
> 招式效果设计为**原创扩展**（原著只给招名与意象）；招名出处有疑者标"待考"。`power` 按 §4.2 / §4.8 核验，已闭合项目的算式写在行尾注释；特殊效果未定价、混合伤害字段及存量普通招 AF 仍待校准的项目见 D30，不把示例收录视为预算验收通过。
> **实例同步边界**：本节镜像 11 册武学图鉴已经落盘的实例，不自造图鉴内容。降龙十八掌、独孤九剑、易筋经、九阳神功均按天上三绝招配置；龙爪手按地中两绝招配置，第一 / 第二 / 第三绝招分别在 7 / 9 / 10 重解锁。每记绝招各引一条由所属图鉴定义的 `mfr_*` 路线；本文只保留武学卡与接口示例。

### 13.1 降龙十八掌 `sk_xianglong18`（天上 · 拳脚·掌 · 丐帮）

**招名核对**：十八掌名采用通行列表：亢龙有悔、飞龙在天、见龙在田、鸿渐于陆、潜龙勿用、利涉大川、突如其来、震惊百里、或跃在渊、双龙取水、鱼跃于渊、时乘六龙、密云不雨、损则有孚、龙战于野、履霜冰至、羝羊触藩、神龙摆尾。多数名目见于《射雕》洪七公授郭靖诸回，名目多取自《易经》卦爻辞；**（待考：《射雕英雄传》洪七公传授郭靖降龙掌诸段，核对逐字出处与传授顺序，尤其“鱼跃于渊”“双龙取水”“突如其来”）**。另：新修版《天龙》有"降龙廿八掌"删繁为十八掌之说，本作以修订版为基线，不采用。

**外放与伤害段口径**：除纯蓄力“潜龙勿用”外，下列 18 个动作均以 `projection:true` 标记；这 18 个外放动作的**所有实际伤害段**统一使用既有 `DamageKind='projected'`，包括“飞龙在天”的溅射段、“履霜冰至”的“冰至”追加段及“时乘六龙”的各段。“或跃在渊”的主动架势本身不生成伤害段，只有触发反击段使用 `projected`。`DamageKind` 是结算伤害段类型，不是 `MoveDef` 顶层字段；构建器须按 tech/04 的展开规则生成并校验，避免向严格 `MoveDefSchema` 写入未登记键。

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
  - { n: 4,  unlock: [mv_xianglong18_huoyue] }
  - { n: 5,  unlock: [mv_xianglong18_shuanglong, mv_xianglong18_yuyue, ps_xianglong18_youyu] }
  - { n: 6,  unlock: [mv_xianglong18_feilong, mv_xianglong18_shicheng] }
  - { n: 7,  unlock: [mv_xianglong18_miyun, mv_xianglong18_sunze, mv_xianglong18_lianhuan] }
  - { n: 8,  unlock: [mv_xianglong18_longzhan, mv_xianglong18_lvshuang, ps_xianglong18_zhigang] }
  - { n: 9,  unlock: [mv_xianglong18_diyang, mv_xianglong18_shenlong] }
  - { n: 10, unlock: [mv_xianglong18_zhenjing, ps_xianglong18_dacheng] }
moves:   # 天阶耗内基准 8%
  - { id: mv_xianglong18_kanglong,  name: 亢龙有悔, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_kanglong, delivery: melee, mpCost: 0.10, cd: 1, recovery: 1100, power: 1.20, parryable: true,
      buffs: [ {id: bf_liuli, chance: 1.0, dur: 1, grade: inherit, to: self, cond: notKill} ],
      note: "有悔：击杀则返还 50% 耗内；未击杀则得'留力'（下一降龙招式 +15%，Z3）" }      # 1+0.12+0.10+0.07=1.29 −0.10(自增益)≈1.20
  - { id: mv_xianglong18_jianlong,  name: 见龙在田, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_line, n: 2}, projection: true, projectionSpreadSteps: [{tpl: aoe_line, n: 2}, {tpl: aoe_line, n: 3}, {tpl: aoe_line, n: 4}], meridianRouteRef: mfr_xianglong18_jianlong, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1000, power: 0.80, parryable: true,
      displacement: {type: knock, n: 1} }                                                  # Nmax=2，AF0.90−0.05=0.85；保留0.80，手调−0.05以压低首重线形控场收益
  - { id: mv_xianglong18_qianlong,  name: 潜龙勿用, unlock: 2, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.04, cd: 2, recovery: 700, power: 0,
      buffs: [ {id: bf_xuli, dur: 1, grade: inherit, to: self}, {id: bf_qianlong, dur: 1, grade: inherit, to: self} ],
      note: "蓄力：下一降龙招式 +40%（Z3）；至下次行动前受到伤害 −15%（Z4）" }
  - { id: mv_xianglong18_hongjian,  name: 鸿渐于陆, unlock: 2, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3}, projection: true, projectionSpreadSteps: [{tpl: aoe_dash, n: 3}, {tpl: aoe_dash, n: 3}, {tpl: aoe_dash, n: 3}], meridianRouteRef: mfr_xianglong18_hongjian, delivery: melee, mpCost: 0.09, cd: 1, recovery: 1000, power: 1.05, parryable: true }  # 1+0.12+0.05 −0.10
  - { id: mv_xianglong18_lishe,     name: 利涉大川, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 4}, aoe: {tpl: aoe_line, n: 4}, projection: true, projectionSpreadSteps: [{tpl: aoe_line, n: 4}, {tpl: aoe_line, n: 5}, {tpl: aoe_line, n: 6}], meridianRouteRef: mfr_xianglong18_lishe, delivery: ranged, mpCost: 0.09, cd: 1, recovery: 1000, power: 0.75, parryable: true,
      tags: [qigong], note: "掌风越过深水/浅水格不衰减" }                                   # Nmax=4，AF0.80×1.17×0.85=0.7956；保留0.75，手调−0.0456以限制长线覆盖收益
  - { id: mv_xianglong18_turu,      name: 突如其来, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_turu, delivery: melee, mpCost: 0.07, cd: 1, recovery: 750, power: 0.90, parryable: true,
      note: "若为本场自身首次出手：暴击 +20" }                                               # 1+0.12−0.05−0.175
  - { id: mv_xianglong18_zhenjing,  name: 震惊百里, unlock: 10, kind: attack, ultimate: true, rageCost: 100, meridianRouteRef: mfr_xianglong18_zhenjing, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_around}, projection: true, projectionSpreadSteps: [{tpl: aoe_around}, {tpl: aoe_disk, r: 2}, {tpl: aoe_disk, r: 3}], delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.15, parryable: true,
      buffs: [ {id: bf_xuanyun, chance: 0.3, dur: 1, grade: inherit, to: target} ], anim: {cutin: cutin/xianglong18_zhenjing} } # rawPower=3.00×AF(6=0.75)−0.25×0.30=2.175；roundedPower=2.20；power=2.15；power−rawPower=−0.025；手调理由：压低六邻格群伤与30%眩晕同时命中多目标时的爆发收益，保留群体控场定位（见§4.8.3）
  - { id: mv_xianglong18_huoyue,    name: 或跃在渊, unlock: 4, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, projection: true, projectionSpreadSteps: [{tpl: aoe_self}, {tpl: aoe_self}, {tpl: aoe_self}], meridianRouteRef: mfr_xianglong18_huoyue, delivery: self, mpCost: 0.05, cd: 2, recovery: 900, power: 0,
      displacement: {type: retreat, n: 2},
      trigger: {on: meleeAttacked, chance: 1.0, perRound: 1, counterPower: 1.00, expires: nextOwnAction} }
  - { id: mv_xianglong18_shuanglong, name: 双龙取水, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_shuanglong, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.30, hits: 2, parryable: true }  # 1+0.24+0.05
  - { id: mv_xianglong18_yuyue,     name: 鱼跃于渊, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap}, projection: true, projectionSpreadSteps: [{tpl: aoe_leap}, {tpl: aoe_leap}, {tpl: aoe_leap}], meridianRouteRef: mfr_xianglong18_yuyue, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.00, parryable: true,
      note: "跃起高差上限 jump+3；仰攻不受 Z7 低打高惩罚" }                               # 0.9×1.24 −0.10
  - { id: mv_xianglong18_feilong,   name: 飞龙在天, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_leap, splash: {tpl: aoe_disk, r: 1}}, projection: true, projectionSpreadSteps: [{tpl: aoe_leap, splash: {tpl: aoe_disk, r: 1}}, {tpl: aoe_leap, splash: {tpl: aoe_disk, r: 1}}, {tpl: aoe_leap, splash: {tpl: aoe_disk, r: 1}}], meridianRouteRef: mfr_xianglong18_feilong, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1050, power: 1.25, parryable: true,
      note: "主目标 1.25；六角圆盘 r1 的其余 6 格溅射 ×0.5；自高处下击时 Z7 高低差加成 ×2" } # 主目标按无溅射 leap 0.9×1.51−0.10=1.259→1.25；溅射另乘0.5
  - { id: mv_xianglong18_shicheng,  name: 时乘六龙, unlock: 6, kind: attack, target: tile, range: {min: 1, max: 2}, aoe: {tpl: aoe_multi, n: 6, r: 2}, projection: true, projectionSpreadSteps: [{tpl: aoe_multi, n: 6, r: 2}, {tpl: aoe_multi, n: 7, r: 3}, {tpl: aoe_multi, n: 8, r: 4}], meridianRouteRef: mfr_xianglong18_shicheng, delivery: ranged, mpCost: 0.12, cd: 3, recovery: 1050, power: 1.00, hits: 6, parryable: true }  # Nmax=6，AF0.75×(1+0.20+0.36+0.035)×Kd0.85=1.0168125→1.00
  - { id: mv_xianglong18_miyun,     name: 密云不雨, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_miyun, delivery: melee, mpCost: 0.09, cd: 3, recovery: 1000, power: 0.80, parryable: true,
      buffs: [ {id: bf_miyun, chance: 1.0, dur: 2, grade: inherit, to: target} ],
      note: "封绝：2 回合不能施放绝招；目标气势 −30" }                                   # 1.41 −0.40 −0.20
  - { id: mv_xianglong18_sunze,     name: 损则有孚, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_sunze, delivery: melee, mpCost: 0.08, hpCost: 0.08, cd: 2, recovery: 1000, power: 1.70, parryable: true,
      note: "有孚：击杀目标时返还所损气血" }                                               # 1+0.48+0.24
  - { id: mv_xianglong18_longzhan,  name: 龙战于野, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, projection: true, projectionSpreadSteps: [{tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, {tpl: aoe_cone, r: 4, angle: 60, dirCount: 6}, {tpl: aoe_cone, r: 5, angle: 60, dirCount: 6}], meridianRouteRef: mfr_xianglong18_longzhan, delivery: melee, mpCost: 0.11, cd: 3, recovery: 1100, power: 1.05, parryable: true,
      displacement: {type: knock, n: 1} }                                                  # 六角7格 AF0.70×1.58−0.05=1.056→1.05
  - { id: mv_xianglong18_lvshuang,  name: 履霜冰至, unlock: 8, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, projection: true, projectionSpreadSteps: [{tpl: aoe_single}, {tpl: aoe_single}, {tpl: aoe_single}], meridianRouteRef: mfr_xianglong18_lvshuang, delivery: melee, mpCost: 0.08, cd: 0, recovery: 1000, power: 0.90, parryable: true,
      buffs: [ {id: bf_lvshuang, chance: 1.0, dur: 3, stacks: 1, grade: inherit, to: target} ],
      note: "履霜：每层速度 −5%（上限 4 层）；满 4 层时'冰至'：清空层数，追加一段 0.8 倍伤害并定身 1 回合" }
  - { id: mv_xianglong18_diyang,    name: 羝羊触藩, unlock: 9, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_dash, n: 3}, projection: true, projectionSpreadSteps: [{tpl: aoe_dash, n: 3}, {tpl: aoe_dash, n: 3}, {tpl: aoe_dash, n: 3}], meridianRouteRef: mfr_xianglong18_diyang, delivery: melee, mpCost: 0.09, cd: 2, recovery: 1000, power: 1.05, parryable: true,
      buffs: [ {id: bf_dingshen, chance: 0.6, dur: 1, grade: inherit, to: target} ] }      # 1.29 −0.10 −0.15
  - { id: mv_xianglong18_shenlong,  name: 神龙摆尾, unlock: 9, kind: attack, ultimate: true, rageCost: 100, meridianRouteRef: mfr_xianglong18_shenlong, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}, projection: true, projectionSpreadSteps: [{tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}, {tpl: aoe_cone, r: 2, angle: 120, dirCount: 6}, {tpl: aoe_cone, r: 3, angle: 120, dirCount: 6}], delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.55, parryable: true,
      note: "主动绝招：以自身当前朝向的反方向为 aim，横扫身后三格；用于反制背后围攻，不再保留自动触发" } # 3.0×AF(3=0.85)=2.55
  - { id: mv_xianglong18_lianhuan,  name: 十八掌连环, unlock: 7, kind: attack, ultimate: true, rageCost: 100, meridianRouteRef: mfr_eighteen_palms_chain, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, projection: true, projectionSpreadSteps: [{tpl: aoe_cone, r: 3, angle: 60, dirCount: 6}, {tpl: aoe_cone, r: 4, angle: 60, dirCount: 6}, {tpl: aoe_cone, r: 5, angle: 60, dirCount: 6}], delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.00, hits: 6, parryable: true,
      displacement: {type: knock, n: 2}, anim: {cutin: cutin/xianglong18},
      note: "（原创扩展命名）十八掌一气呵成：演出依次打出十八掌意象；10 重大成后 ×1.2" }     # 六角7格 AF0.70：3.0×0.70−0.10=2.00
passives:
  - { id: ps_xianglong18_gangmeng, name: 刚猛, unlock: 1, kind: stat, zone: Z2, value: [0.08, 0.20], scope: self, text: "降龙招式无视目标 {v} 外功防御" }
  - { id: ps_xianglong18_longyin,  name: 龙吟, unlock: 3, kind: trigger, trigger: {on: skillUsed, cond: differentMoveThanLast}, buff: {id: bf_longyin, stacks: 1, max: 5, grade: inherit, dur: 2}, zone: Z3, value: 0.04, scope: self,
      text: "连续使用不同的降龙掌：每层降龙招式伤害 +4%，至多 5 层" }
  - { id: ps_xianglong18_youyu,    name: 有余不尽, unlock: 5, kind: effect, value: {mpCostMult: 0.9, killRefund: 0.3}, scope: self, text: "降龙招式耗内 −10%；击杀时返还 30% 耗内（亢龙有悔为 50%）" }
  - { id: ps_xianglong18_zhigang,  name: 至刚至阳, unlock: 8, kind: stat, zone: Z0, value: 15, scope: self, cond: {mainInnerNature: yang}, text: "主运为阳时，降龙招式破招 +15" }
  - { id: ps_xianglong18_dacheng,  name: 降龙大成, unlock: 10, kind: mechanic, value: {cdMinus: 1, moveSlotsPlus: 1, ultPowerMult: 1.2}, scope: self, text: "所有降龙招式自身冷却 −1（最低 0；不减武学级绝招共享冷却）；招式栏 +1；三记绝招威力 ×1.2" }
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
  - { n: 7,  unlock: [mv_dugu9_wuzhao] }
  - { n: 9,  unlock: [mv_dugu9_poanqi, ps_dugu9_yiwu] }
  - { n: 10, unlock: [mv_dugu9_poqi, ps_dugu9_wuzhao] }
moves:
  - { id: mv_dugu9_zongjue, name: 总诀式, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 0, recovery: 900, power: 0.90, parryable: true,
      buffs: [ {id: bf_duguyi, chance: 1.0, stacks: 1, max: 9, dur: 99, grade: inherit, to: self} ],
      note: "剑意：每层本武学暴击 +2，战斗内保留" }                                         # 1−0.05−0.07≈0.88
  # 破招组：UI 只显示一个"破招"按钮，按目标自动解析；条件不满足的式不可选。
  # 破剑/刀/枪/鞭/掌五个普通式的“目标类别精确匹配”按 §4.2 罕见条件 +0.30：
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
  - { id: mv_dugu9_poanqi,  name: 破箭式, unlock: 9, autoGroup: dugu_po, condition: {targetHasSkill: [hidden]},       kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.55, parryable: false, meridianRouteRef: mfr_dugu9_poanqi,
      trigger: {on: projectileIncoming, chance: [0.35, 0.60], perRound: 2, effect: deflect, reflectFromLayer: 9, reflectPct: 0.5},
      note: "主动：对装配暗器者；被动：拨开来袭暗器（35%→60%），9 重起反射 50% 伤害；条件预算：门槛型（adjCondition=0），主动伤害 3.00×0.85=2.55，拨开/反射按独立被动钩子结算" }
  - { id: mv_dugu9_poqi,    name: 破气式, unlock: 10, autoGroup: dugu_po, condition: {any: [{targetMainInnerEffGradeGte: 7}, {targetShieldGt: 0}]}, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_line, n: 1}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.55, parryable: false, meridianRouteRef: mfr_dugu9_poqi,
      projection: true, projectionSpreadSteps: [{tpl: aoe_line, n: 1}, {tpl: aoe_line, n: 2}, {tpl: aoe_line, n: 3}],
      note: "对护体真气伤害 ×2；无视目标 20% 内劲防御；条件预算：门槛型（adjCondition=0）；剑气表现（原创扩展），伤害段 projected" } # 3×0.85−0.02=2.53→2.55；0.02 为图鉴既有特殊效果成本【建议值】
  - { id: mv_dugu9_wuzhao,  name: 无招胜有招, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.50, parryable: false, counterable: false,
      meridianRouteRef: mfr_dugu9_wuzhao, cleanse: {side: target, tags: [stance, guard], count: 1, maxGrade: inherit}, anim: {cutin: cutin/dugu9} }   # 3×0.85−0.07=2.48→2.50；0.07 为清姿态/不可反击的图鉴既有成本【建议值】，不是收招调整
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
  breathProfileRef: txp_yijinjing                       # 少林图鉴定义的逐武学档案实例
  innerGuard: { enabled: true, reflectBp: 0 }
  yunjin: [tiaoxi, huti, liaoshang, huajie]
  auxYunjin: [liaoshang, huajie]
  bridge: true
  seclusionCap: 10
  auxUsableMoves: []
moveSlots: 5
layers:
  - { n: 1,  unlock: [ps_yijinjing_yijin] }
  - { n: 3,  unlock: [mv_yijinjing_xisui, ps_yijinjing_famao] }
  - { n: 5,  unlock: [ps_yijinjing_huayi] }
  - { n: 7,  unlock: [mv_yijinjing_daozhuai, ps_yijinjing_jingang] }
  - { n: 8,  unlock: [ps_yijinjing_baibing] }
  - { n: 9,  unlock: [mv_yijinjing_weituo] }
  - { n: 10, unlock: [mv_yijinjing_huangu, ps_yijinjing_dacheng] }
moves:
  - { id: mv_yijinjing_xisui,   name: 洗髓, unlock: 3, kind: support, yunjinMode: huajie, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.10, cd: 4, recovery: 900, power: 0,
      cleanse: {side: self, tags: [poison, injury, seal, cold, heat], count: all, maxGrade: inherit}, heal: {base: targetHpMax, pct: 0.10},
      note: "亦可移除品阶 ≤ 自身的走火入魔 1–2 级" }
  - { id: mv_yijinjing_weituo,  name: 韦陀献杵, unlock: 9, kind: stance, yunjinMode: huti, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 0, meridianRouteRef: mfr_yijinjing_weituo,
      buffs: [ {id: bf_weituo, dur: 2, grade: inherit, to: self} ], note: "受到伤害 −25%（Z4），控制抗性 resCC +30" }
  - { id: mv_yijinjing_daozhuai, name: 倒拽九牛尾, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_pull, n: 2}, delivery: ranged, mpCost: 0.10, cd: 0, recovery: 1200, power: 2.45, parryable: true, nature: harmony,
      meridianRouteRef: mfr_yijinjing_daozhuai }          # n2 是拉距，Nmax=1；3×1×0.85−0.10=2.45，旧2.20超手调边界；路线仍引用少林正式实例
  - { id: mv_yijinjing_huangu,  name: 易筋换骨, unlock: 10, kind: support, yunjinMode: liaoshang, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 2}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 0, meridianRouteRef: mfr_yijinjing_huangu,
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
  - { type: master, chapter: ch01_tianlong, ref: npc_xuanci, maxLayer: 10, note: "少林职级 4（执事）以上，方丈许可" }
  - { type: qiyu,   chapter: ch01_tianlong, ref: q_01_qiyu_91, maxLayer: 8, reqsOverride: { sect: null },
      note: "无心插柳：不求武功者偶得梵文经书（致敬游坦之情节，原创扩展）；仍须 wil ≥ 70，且从未主动询问易筋经" }
  - { type: master, chapter: ch02_shediao, ref: "少林·当代方丈岗位槽", maxLayer: 10, note: "金国治下嵩山少林完整线（原创扩展；须满足少林授艺资格）" }
  - { type: master, chapter: ch04_yitian, ref: npc_kongwen, maxLayer: 10, note: "屠狮大会后空闻方丈传授（原创扩展；须满足少林授艺资格）" }
  - { type: master, chapter: ch05_xiaoao,   ref: npc_fangzheng, maxLayer: 10, note: "笑傲印证事件载体（§7.8，design/02 §2.2）" }
special: { fusible: true }
observable: false
description: >-
  少林至高内功，易筋锻骨、洗髓伐毛，内力浑厚绵长，能化解各路异种真气与内伤。修习者须心无挂碍，
  求之愈切，得之愈难。
```

### 13.4 九阳神功 `sk_jiuyang`（天上 · 内功 · 调和）

设计要点："他强由他强，清风拂山岗；他横由他横，明月照大江"（原著九阳真经口诀）→ 对强敌减伤与反震；寒毒克星；"触类旁通"加速其他武学（原著张无忌凭九阳根基速成乾坤大挪移与太极；**待考：《倚天屠龙记》相关练功段落的速度描写**）。

> 经脉接线边界：本例镜像倚天图鉴定义的逐武学档案 `txp_jiuyang` 与三条独立路线；schema、算法和共享模板仍只见 `design/21`。**待作者确认**：该卡三记可施放招式全是绝招，故 1–6 重没有主动招式；默认保留图鉴现状，不另编招名。

AR-18 依赖展示：`catalog/skills-yitian.md` 九阳卡主修任脉、督脉，各计阴 / 阳一票，故本例静态 `nature`、主运 `mpNature` 与 `txp_jiuyang.nature` 均为 `harmony`；三条路线门槛读取该册现行 `[yin,yang,harmony]`。护体采用调和档；有效品阶 ≥7 时可按 §5.4 桥接，辅运比例按 §5.2 查表。调息值及护体公式只引用该册档案与 `design/21` §4.8、§10，“寒毒不侵”等特色仍按既有被动触发，不由性质推导。

九阳普照是混合招。倚天册给出的伤害算式为 `3×0.75−0.45=1.80`（敌方周身六格，群盾 / 群驱散成本 **【建议值】** 0.45），不是对友方圆盘 `r3` 计 AF；§13.9 以 `secondaryAoe` 承接敌伤。其伤害子效果仍缺明确的 `delivery/parryable`，现值只保留为待校准镜像，不能据 `delivery:self` 推定 `Kd=1` 或声称通过 §4.8；由倚天图鉴与技术 schema 补齐后统一复算，见 D30。

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
nature: harmony
wOut: 0
wIn: 1
reqs:
  attrs: { con: 50 }
  aptitude: { apInner: 55 }
  hard: []
inner:
  contribution: { mpMaxPct: 60, hpMaxPct: 36, attrs: { con: 8, str: 6, wil: 6 }, mpRegen: 3.6, stats: { resCold: 20 } }   # IP 154
  meridians: [mer_renmai, mer_dumai]                    # 【建议值】与倚天图鉴接口一致；正式效应归 design/15
  breathProfileRef: txp_jiuyang
  innerGuard: { enabled: true }                          # 反震由 ps_jiuyang_taheng 按当前有效层数投影（5%→12%），不写死 10 重的 1200 bp；见 §5.10
  yunjin: [tiaoxi, huti, bidu, liaoshang, cuiqinggong]
  auxYunjin: [liaoshang]
  seclusionCap: 8
  auxUsableMoves: [mv_jiuyang_liaoshang]
moveSlots: 5
layers:
  - { n: 2,  unlock: [ps_jiuyang_taqiang] }
  - { n: 4,  unlock: [ps_jiuyang_taheng] }
  - { n: 5,  unlock: [ps_jiuyang_hutizhenqi] }
  - { n: 6,  unlock: [ps_jiuyang_hanbuqin] }
  - { n: 7,  unlock: [ps_jiuyang_shengsheng, mv_jiuyang_puzhao] }
  - { n: 8,  unlock: [ps_jiuyang_chulei] }
  - { n: 9,  unlock: [mv_jiuyang_huti] }
  - { n: 10, unlock: [mv_jiuyang_liaoshang, ps_jiuyang_dacheng] }
moves:
  - { id: mv_jiuyang_huti, name: 九阳护体, unlock: 9, kind: support, yunjinMode: huti, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 0, meridianRouteRef: mfr_jiuyang_huti,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctHpMax: 0.15}, dur: 3, grade: inherit, to: self} ], cleanse: {side: self, tags: [cold], count: 1, maxGrade: inherit} }
  - { id: mv_jiuyang_liaoshang, name: 九阳疗伤, unlock: 10, kind: support, yunjinMode: liaoshang, ultimate: true, rageCost: 100, target: ally, range: {min: 0, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.10, cd: 0, recovery: 1200, power: 0, meridianRouteRef: mfr_jiuyang_liaoshang,
      heal: {base: targetHpMax, pct: 0.18}, cleanse: {side: target, tags: [injury, cold], count: 2, maxGrade: inherit} }     # 标准治疗 18%；可作辅运使用
  - { id: mv_jiuyang_puzhao, name: 九阳普照, unlock: 7, kind: support, ultimate: true, rageCost: 100, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_allies, r: 3}, delivery: self, mpCost: 0.10, cd: 0, recovery: 1200, power: 1.80, meridianRouteRef: mfr_jiuyang_puzhao,
      buffs: [ {id: bf_hutizhenqi, value: {shieldPctCasterHpMax: 0.20}, dur: 3, grade: inherit, to: allies} ], cleanse: {side: allies, tags: [cold, poison], count: 2, maxGrade: inherit},
      note: "（原创扩展命名）友方护盾与驱散；同时对周身六格敌人造成 1.8 倍内劲伤害（aoe_around，wIn 1）" }
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
  《九阳真经》所载内功，本作按任督并修归为调和；内力生生不息，百脉通畅，寒毒不侵。"他强由他强，清风拂山岗"——
  对手越强，越难撼动其根基。
```

神雕末尾的闻经仅由 chapters/03 写入图鉴 `heard` 状态和剧情标记 `jiuyang_echo`，**不是** `LearnSource`，不增加 `sourceCap/sourceGrade`、不授予层数或修炼倍率；九阳只可在倚天完整习得（作者决定 P10）。具体“神雕末尾 / 倚天开篇”的文本分界仍列 §17.4 考据。

### 13.5 太祖长拳 `sk_taizuchangquan`（黄上 · 拳脚·拳 · 通行）——"招式平凡，人强则强"

原著依据：《天龙八部》聚贤庄一役中，萧峰以太祖长拳应对群雄，以平常拳路发挥极强威力；具体交手对象与原文仍**（待考：《天龙八部》聚贤庄群战段落）**。下列“冲阵斩将”“千里横行”“长拳贯日”均为**（原创扩展命名）**，不作为原著招名。

**核心规则"人强则强"**：本武学的品阶系数不取固定 G，而取

```
G_eff = max( G(effGrade), min( 2.40, 1.20 × (1 + 0.012 × max(0, Ce − 10)) ) )
```

| 派生修为档 `Ce` | 10 | 20 | 30 | 35 | 44 | 50 | 60 | 70 |
|---|---|---|---|---|---|---|---|---|
| G_eff | 1.20（黄上） | 1.34 | 1.49 | 1.56（≈玄中） | 1.69 | 1.78（玄上+） | 1.92 | 2.06（≈地下） |

- 上限 2.40（地上），永远到不了天阶；不受外来品阶压制影响，但 `Ce` 受书界 `chapterBandCap` 截断——低武书界 `Ce44`、8 重时 `G_eff × L = 1.69 × 1.30 = 2.20`，约为"天上外来武学压成地中、8 重"（2.86）的 77%，而携带与修炼成本低得多，是衰败书界里可靠的"保底拳法"。
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
      text: "暴击 +10；对同样使用太祖长拳且派生修为档低于自己的对手伤害 +15%" }
special:
  gOverride: { formula: taizu, cap: 2.40, base: 1.20, perBand: 0.012, fromBand: 10 }
  fusible: true
setTags: [set_jianghu_baijia, set_qidan_xiaofeng]       # C22；通行图鉴与人物套装双向闭合
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: "军营/镖局/武馆·教头岗位槽", maxLayer: 10, note: "各书界按当地设施实例化；除《天龙八部》聚贤庄关联外，后世获取均为原创扩展" }
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
  - { id: mv_quanzhenjian_qixing,   name: 七星聚会, unlock: 4, kind: attack, target: tile, range: {min: 1, max: 1}, aoe: {tpl: aoe_multi, n: 7, r: 1}, delivery: melee, mpCost: 0.07, cd: 2, recovery: 1000, power: 0.90, hits: 7, parryable: true,
      note: "（原创扩展命名）" }                                                             # Nmax=7，AF0.70×(1+0.05+0.24)=0.903→0.90
  - { id: mv_quanzhenjian_sanqing,  name: 三清朝元, unlock: 6, kind: attack, target: enemy, range: {min: 1, max: 3}, aoe: {tpl: aoe_line, n: 3}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.05, parryable: true,
      buffs: [ {id: bf_jianshi, dur: 2, grade: inherit, to: self} ], note: "（原创扩展命名）剑势：自身暴击 +10，2 回合" }   # Nmax=3，AF0.85×1.34−0.10=1.039→1.05；增益不乘持续行动数
  - { id: mv_quanzhenjian_chongyang, name: 重阳遗意, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1200, power: 1.50, parryable: true,
      note: "（原创扩展命名）玄中普通进阶招，不是绝招" }                              # 1+0.10+0.24+0.14=1.48→1.50
passives:
  - { id: ps_quanzhenjian_xuanmen, name: 玄门正宗, unlock: 2, kind: stat, zone: Z3, value: 0.08, cond: {mainInnerSect: sect_quanzhen}, scope: self }
  - { id: ps_quanzhenjian_jiansui, name: 剑随身走, unlock: 5, kind: trigger, trigger: {on: turnStart, cond: movedTilesGte2ThisAction}, value: {hit: 10}, scope: self,
      text: "本次行动已移动 ≥ 2 格时，本武学招式命中 +10" }
  - { id: ps_quanzhenjian_tongqi,  name: 同气连枝, unlock: 8, kind: stat, value: {parryPerAdjacentAlly: 3, max: 9, allyCond: {hasSkillOfSect: sect_quanzhen}}, scope: unit }
  - { id: ps_quanzhenjian_dacheng, name: 全真剑法大成, unlock: 10, kind: stat, zone: Z3, value: 0.06, scope: self, text: "本武学招式伤害 +6%" }
setTags: [set_quanzhen_beidou, set_shendiao_xialv]      # C22；套装本体归 design/07
conflicts: []
learnSources:
  - { type: master, chapter: ch02_shediao,  ref: "全真教·三代弟子授艺岗位槽", maxLayer: 10 }
  - { type: master, chapter: ch03_shendiao, ref: "全真教·三代弟子授艺岗位槽", maxLayer: 10 }
  - { type: puzzle, chapter: ch03_shendiao, ref: q_03_qiyu_90, maxLayer: 10, reqsOverride: { sect: null },
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

按 `docs/decisions/ultimate-counts-tianzhong-dizhong.md`，龙爪手是地中上限 2 记：`mv_longzhaoshou_sanshiliu` 于 7 重解锁第一绝招，`mv_longzhaoshou_daoxu` 于 9 重解锁第二绝招；二者已有独立路线，不另造重复 ID。

**已解决：NXfixC / NU1 / NA2 的第二绝招交办**。本节与少林册现值已一致：捣虚式 `ultimate:true`、`rageCost:100`、耗内 9%、`recovery:1200`、`power:2.75=3.00−0.10（驱散）−0.15（无视外防）`，路线为 `mfr_longzhaoshou_daoxu`；不再保留“仅一记绝招 / 捣虚六重”的活动口径。

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
  - { n: 7,  unlock: [mv_longzhaoshou_sanshiliu] }
  - { n: 8,  unlock: [mv_longzhaoshou_baocan, ps_longzhaoshou_zhili] }
  - { n: 9,  unlock: [mv_longzhaoshou_daoxu, mv_longzhaoshou_shouque] }
  - { n: 10, unlock: [ps_longzhaoshou_dacheng] }
moves:   # 地阶耗内基准 7%；原著定数 8 式，超出"地阶 4–7 招"规范，按原著例外
  - { id: mv_longzhaoshou_bufeng,  name: 捕风式, unlock: 1, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.07, cd: 0, recovery: 1000, power: 0.95, parryable: true,
      targetAcupoint: {mode: targetPrimaryRouteKey}, buffs: [ {id: bf_xueweishoufeng, chance: 0.2, dur: 1, grade: inherit, to: target, value: {level: 9}} ] }       # 1 −0.20×0.20=0.96→0.95
  - { id: mv_longzhaoshou_zhuoying, name: 捉影式, unlock: 2, kind: attack, target: enemy, range: {min: 1, max: 2}, aoe: {tpl: aoe_pull, n: 1}, delivery: melee, mpCost: 0.07, cd: 1, recovery: 1000, power: 1.00, parryable: true }   # 单目标 AF1；n是拉距，1×1.12−0.10=1.02→1.00
  - { id: mv_longzhaoshou_fuqin,   name: 抚琴式, unlock: 3, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 1.10, hits: 2, parryable: true,
      buffs: [ {id: bf_jiaoxie, chance: 0.25, dur: 1, grade: inherit, to: target, cond: targetArmed} ] }   # 1.17 −0.06
  - { id: mv_longzhaoshou_guse,    name: 鼓瑟式, unlock: 4, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_cone, r: 1, angle: 120, dirCount: 6}, delivery: melee, mpCost: 0.08, cd: 1, recovery: 1000, power: 0.95, parryable: true,
      targetAcupoint: {mode: targetPrimaryRouteKey}, buffs: [ {id: bf_xueweishoufeng, chance: 0.15, dur: 1, grade: inherit, to: target, value: {level: 9}} ] }      # 六角3格 AF0.85×1.17−0.20×0.15=0.9645→0.95
  - { id: mv_longzhaoshou_pikang,  name: 批亢式, unlock: 5, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.08, cd: 2, recovery: 1000, power: 1.20, parryable: true,
      note: "攻其要害：本招暴击 +15" }                                                       # 1.29 −0.10
  - { id: mv_longzhaoshou_daoxu,   name: 捣虚式, unlock: 9, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 0, recovery: 1200, power: 2.75, parryable: true, meridianRouteRef: mfr_longzhaoshou_daoxu,
      cleanse: {side: target, tags: [stance], count: 1, maxGrade: inherit}, note: "无视目标 20% 外功防御（Z2）" }   # 3.00 −0.10（驱散）−0.15（无视外防）=2.75
  - { id: mv_longzhaoshou_sanshiliu, name: 龙爪三十六路, unlock: 7, kind: attack, ultimate: true, rageCost: 100, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_single}, delivery: melee, mpCost: 0.09, cd: 0, recovery: 1200, power: 2.70, hits: 6, parryable: true,
      meridianRouteRef: mfr_longzhaoshou_sanshiliu,       # 仅引用少林图鉴正式实例
      targetAcupoint: {mode: targetPrimaryRouteKey}, buffs: [ {id: bf_xueweishoufeng, chance: 1.0, dur: 1, durFixed: true, grade: inherit, to: target, value: {level: 9}}, {id: bf_jiaoxie, chance: 0.5, dur: 1, grade: inherit, to: target, cond: targetArmed} ],
      note: "（原创扩展命名）三十六爪连环" }   # 3.0 −0.20 −0.10
  - { id: mv_longzhaoshou_baocan,  name: 抱残式, unlock: 8, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.06, cd: 2, recovery: 850, power: 0,
      trigger: {on: meleeAttacked, chance: 1.0, perRound: 1, counterPower: 1.00, expires: nextOwnAction, applyBuff: {id: bf_dingshen, dur: 1}} }
  - { id: mv_longzhaoshou_shouque, name: 守缺式, unlock: 9, kind: stance, target: self, range: {min: 0, max: 0}, aoe: {tpl: aoe_self}, delivery: self, mpCost: 0.07, cd: 3, recovery: 800, power: 0,
      buffs: [ {id: bf_shouque, dur: 2, grade: inherit, to: self} ], note: "招架 +20、受到伤害 −15%（Z4）、免疫品阶 ≤ 自身的封穴，2 回合" }
passives:
  - { id: ps_longzhaoshou_naxue,  name: 拿穴, unlock: 1, kind: trigger, trigger: {on: onHit}, targetAcupoint: {mode: targetPrimaryRouteKey}, buff: {id: bf_xueweishoufeng, chance: [0.10, 0.25], dur: 1, grade: inherit, value: {level: 9}}, scope: self }
  - { id: ps_longzhaoshou_fenjin, name: 分筋错骨, unlock: 5, kind: stat, zone: Z3, value: 0.12, cond: {targetHasTag: seal}, scope: self }
  - { id: ps_longzhaoshou_zhili,  name: 金刚指力, unlock: 8, kind: stat, zone: Z0, value: {pierce: 10}, scope: self }
  - { id: ps_longzhaoshou_dacheng, name: 龙爪大成, unlock: 10, kind: mechanic, value: {unparryableVsTag: seal}, scope: self, text: "对被封穴的目标，龙爪招式不可招架" }
setTags: [set_shaolin_jingang]            # 用户示例：金刚龙爪手＋易筋经＋铁砂掌＋铜人横练（套装本体归 design/07）
conflicts: []
weaponReq: null
learnSources:
  - { type: master,  chapter: ch01_tianlong, ref: "少林·般若堂授艺岗位槽", maxLayer: 10, note: "少林般若堂（原创扩展）" }
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
  - { id: mv_luohanquan_tuishan,    name: 罗汉推山, unlock: 7, kind: attack, target: enemy, range: {min: 1, max: 1}, aoe: {tpl: aoe_line, n: 2}, delivery: melee, mpCost: 0.05, cd: 1, recovery: 1000, power: 1.00, parryable: true }  # Nmax=2，AF0.90×1.12=1.008→1.00
passives:
  - { id: ps_luohanquan_quanjia, name: 拳架扎实, unlock: 5, kind: stat, value: {resCC: 10}, scope: unit }
  - { id: ps_luohanquan_yuanman, name: 入门圆满, unlock: 10, kind: mechanic, value: {oneTimeAptitude: {apFist: 1}, softReqRelief: {sect: sect_shaolin, category: unarmed, aptitude: -10}},
      text: "首次练满时拳掌资质永久 +1（全游戏一次）；此后学习少林拳脚武学的资质软门槛 −10" }
setTags: [set_shaolin_luohan]             # 建议 ID（少林入门套），design/07
conflicts: []
weaponReq: null
learnSources:
  - { type: master, chapter: ch01_tianlong, ref: "少林·武僧授艺岗位槽", maxLayer: 10 }
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
| 神龙摆尾 | `aoe.facing = back`；主动绝招，不再配置 `trigger` |
| 总诀式 | `buffs[bf_duguyi]`（剑意叠层，效果由 Buff 定义） |
| 破枪式 | `ignoreReach{}` |
| 破箭式 | `deflectProjectile{chance:[0.35,0.60], reflectFromLayer:9, reflectPct:0.5}` |
| 破气式 | `shieldDmgMult{mult:2}`、`ignoreDef{in:0.2}` |
| 洗髓 | `cleanseZouhuo{maxLevel:2}` |
| 易筋换骨 | `restoreMp{pct:0.5, selfOnly:true}` |
| 九阳普照 | `secondaryAoe{tpl:aoe_around, target:enemy, power:1.8, wIn:1}` |
| 千里横行 | `aoe_sequence.steps = [aoe_dash, aoe_cone]`；`sequenceStage{index:1,damageMult:0}`；`sequenceStage{index:2,damageMult:1}` |
| 批亢式 | `critBonus{value:15}` |
| 捣虚式 | `ignoreDef{out:0.2}` |

**10 重主力招式威力自检**（`P = G × L(10) × power`，本土、无压制）：

| 武学 | 招式 | P | 备注 |
|---|---|---|---|
| 降龙十八掌 | 亢龙有悔 / 双龙取水 / 十八掌连环 / 神龙摆尾 / 震惊百里 | 6.30 / 6.83 / 12.60 / 16.07 / 13.55（后三者各目标，均含大成 ×1.2） | 普通招 `3.5×1.5×1.20=6.30`、`3.5×1.5×1.30=6.825`；三绝招依次为 `3.5×1.5×2.00×1.20=12.60`、`3.5×1.5×2.55×1.20=16.065`、`3.5×1.5×2.15×1.20=13.545`。7 重连环尚无大成：`3.5×1.2×2.00=8.40` |
| 独孤九剑 | 总诀式 / 普通破 X 式 / 无招胜有招 / 破箭式 / 破气式 | 4.73 / 5.78（另有 Z5 +29%、破招架） / 15.75 / 16.07 / 16.07（后三者含大成 ×1.2） | 五个 `power:1.10` 的早层类别匹配普通式预算为 `(1+0.12+0.30)×0.85−0.06=1.147`，与配置差 `−0.047`；普通式 `3.5×1.5×1.10=5.775≈5.78`；三绝招分别为 `3.5×1.5×2.50×1.20=15.75`、`3.5×1.5×2.55×1.20=16.065≈16.07`、同前；破箭式不再列入普通式计数 |
| 易筋经 | 倒拽九牛尾 | 12.86 | 三绝招中的伤害招；`3.5×1.5×2.45=12.8625≈12.86`。韦陀献杵与易筋换骨为无直接伤害的防守 / 支援绝招 |
| 九阳神功 | 九阳普照 | 9.45 | 三绝招中的伤害段；`3.5×1.5×1.80=9.45`。九阳护体与九阳疗伤为无直接伤害的支援绝招 |
| 太祖长拳（Lv 70） | 冲阵斩将 / 长拳贯日 | 3.41 / 4.02 | ≈ 地下 10 重水准 |
| 龙爪手 | 批亢式 / 龙爪三十六路 / 捣虚式 | 3.96 / 8.91 / 9.08 | `G=2.2`、`L(10)=1.5`：`2.2×1.5×1.20=3.96`、`2.2×1.5×2.70=8.91`、`2.2×1.5×2.75=9.075≈9.08`；后两项为独立路线的两记绝招 |
| 全真剑法 | 定阳针 / 重阳遗意 / 七星聚会 / 三清朝元 | 2.33 / 3.49 / 2.09 / 2.44 | 玄中按新规则无绝招；重阳为普通进阶招，`1.55×1.5×1.50=3.4875≈3.49`；后两招按正式 AF 复算后分别 `1.55×1.5×0.90=2.0925`、`1.55×1.5×1.05=2.44125` |
| 铁砂掌 | 开碑手 | 2.44 | |
| 罗汉拳 | 罗汉撞钟 / 罗汉推山 | 1.58 / 1.50 | 推山 `1.00×1.5×1.00=1.50`；两格线形 AF 为 0.90 |

---

## 14. 武学数量与品阶分布规划（`design/catalog/` 的约束）

> 本节旧统计表是 2026-09-27 的**门派图鉴 11 册基线**。计数单位是图鉴中唯一归属、玩家可习得的 `sk_*` 定义；不计 `sk_basic`、玩家自创武学、`enemyOnly: true` 条目，也不把 `sk_yuenvjian@legacy_complete` 形态重复算作新武学。序章教学武学计入定义库。古龙图鉴是 AR-08 的补充图鉴，纳入该基线，但不是十册金庸核心图鉴之一。
> Canon V16-04 已把十四册 `skills-bulu-NN-*.md` 提升为与门派册同级的正式武学定义源。作者决定扩容（2026-09-28）后，现行普通天阶名录为 59 门；补录册的地 / 玄 / 黄增量及含补录总量尚待 NXfixC 收口，由 NAu-final 机器重算。本节保留 11 册基线表供追溯，任何标为“基线”的 51 或 1,138 均不得再解释为现行全目录总数。
> 经脉系统落地不改变本节数量：`mfr_*` 路线与 `txp_*` 调息档案都是附着于既有 `sk_*` / `mv_*` 的配置对象，不计作武学、招式或新的绝招配额。

### 14.1 总量

| 门派图鉴 11 册基线（2026-09-27） | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 金庸十册核心 | 51 | 159 | 430 | 430 | **1,070** |
| AR-08 古龙补充 | 0 | 10 | 29 | 29 | **68** |
| **11 册基线小计** | **51** | **169** | **459** | **459** | **1,138** |

- AR-01 的方向性比例仍是天:地:玄:黄约 `1:3:9:9`。11 册基线 `51/169/459/459=1,138` 的历史核算为：地/天=`169÷51=3.31`，相对名义 3 偏差 `(3.31−3)÷3=10.46%≤15%`；玄/天与黄/天均为 `459÷51=9`。这只证明当时的 11 册基线闭合，不用于反推补录后的低三阶硬配额。
- **现行普通天阶名录：`59 = 天上 9 + 天中 18 + 天下 32`**（作者决定扩容，2026-09-28；Canon V16-01）。相对 11 册基线 `51 = 8+15+28`，补录净增 `59−51=8` 门，即天上 `+1`、天中 `+3`、天下 `+4`；名录仍受控，但不再以 51 门封闭。
- CXs/CXw/CXd/CXx 的历史扩充仍为 `0/0/91/127=218` 门，把更早的 `51/169/368/332=920` 补至 11 册基线；它与 NXT 的 8 门天阶补录是两次不同统计事件，不能相互抵销或据此猜测含补录总量。
- `legacy_fragment` / `legacy_synthesis` 是跨年代动态来源，不写入静态 `sourceChapters`；同一 `sk_*` 经校合形成的 `legacy_complete` 只是 `SkillFormDef`，三者均不增加本节唯一武学数。

### 14.2 按品阶

以下为门派图鉴 11 册基线实数；列序均为黄下、黄中、黄上、玄下、玄中、玄上、地下、地中、地上、天下、天中、天上。补录册不并入本表，现行天阶分布以 §14.1 的 59 门为准。

| 实际文件 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `skills-shaolin.md` | 3 | 6 | 9 | 6 | 11 | 10 | 8 | 10 | 8 | 2 | 0 | 1 | 74 |
| `skills-wujue.md` | 2 | 38 | 35 | 16 | 28 | 27 | 11 | 6 | 6 | 8 | 2 | 3 | 182 |
| `skills-daojia.md` | 5 | 13 | 28 | 5 | 17 | 22 | 9 | 7 | 2 | 2 | 6 | 0 | 116 |
| `skills-xiaoyao.md` | 9 | 22 | 27 | 13 | 16 | 26 | 5 | 4 | 5 | 5 | 4 | 1 | 137 |
| `skills-yitian.md` | 0 | 16 | 20 | 7 | 13 | 16 | 4 | 4 | 4 | 2 | 1 | 1 | 88 |
| `skills-xiake-bixue.md` | 2 | 23 | 11 | 7 | 17 | 12 | 5 | 6 | 1 | 3 | 0 | 1 | 88 |
| `skills-wuyue.md` | 0 | 17 | 19 | 4 | 17 | 15 | 5 | 5 | 2 | 1 | 2 | 1 | 88 |
| `skills-kangxi.md` | 1 | 16 | 20 | 14 | 14 | 9 | 5 | 5 | 4 | 2 | 0 | 0 | 90 |
| `skills-qianlong.md` | 0 | 11 | 19 | 9 | 11 | 10 | 5 | 3 | 1 | 3 | 0 | 0 | 72 |
| `skills-general.md` | 11 | 25 | 22 | 19 | 22 | 17 | 8 | 9 | 2 | 0 | 0 | 0 | 135 |
| `skills-gulong.md`（补充） | 0 | 5 | 24 | 1 | 2 | 26 | 1 | 1 | 8 | 0 | 0 | 0 | 68 |
| **合计** | **33** | **192** | **234** | **101** | **168** | **190** | **66** | **60** | **43** | **28** | **15** | **8** | **1,138** |

实际列直接采用 11 册图鉴审校后的基线统计表；对未单列十二品汇总的图鉴，按其唯一归属条目的绝对 `grade` 逐 ID 归并。该快照内部三层闭合，但已不是含补录的现行全目录；后续若调整单门细阶或合并补录册，必须同步重算，不得把此基线称为“最终实际”。

四个 CX 的**十二品新增量**依次为：少林 `0/1/3/0/0/0/0/0/0/0/0/0`；五绝 `1/29/26/10/17/16/0/0/0/0/0/0`；道家 `3/9/19/3/7/9/0/0/0/0/0/0`；逍遥 `5/14/17/7/9/13/0/0/0/0/0/0`。逐列合计为 `9/53/65/20/33/38/0/0/0/0/0/0=218`。

| 品阶 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 扩充前快照 | 24 | 139 | 169 | 81 | 135 | 152 | 66 | 60 | 43 | 28 | 15 | 8 | **920** |
| 11 册基线 | 33 | 192 | 234 | 101 | 168 | 190 | 66 | 60 | 43 | 28 | 15 | 8 | **1,138** |
| 本轮扩充 | 9 | 53 | 65 | 20 | 33 | 38 | 0 | 0 | 0 | 0 | 0 | 0 | **218** |
| 大阶扩充前 / 11 册基线 | | 黄 **332 / 459** | | | 玄 **368 / 459** | | | 地 **169 / 169** | | | 天 **51 / 51** | | |

原受控分摊核算示例：玄下 `459×81÷368=101.09→101`，黄下 `459×24÷332=33.18→33`；其余余数按小数部分由大到小补齐，使玄、黄各恰为 459。最终图鉴实数逐格命中该分摊。

### 14.3 按类别 × 大阶

下表按 11 册基线类别统计表逐册求和；类别服从实际装配栏，弓箭计暗器，阵法／医毒／音律等计杂学，不要求每个类别内部机械达到 `1:3:9:9`。

| 大类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 18 | 26 | 81 | 74 | 199 |
| 拳脚 | 17 | 45 | 99 | 126 | 287 |
| 兵器 | 8 | 59 | 137 | 151 | 355 |
| 轻功 | 2 | 9 | 55 | 57 | 123 |
| 暗器 | 1 | 7 | 19 | 13 | 40 |
| 杂学 | 5 | 23 | 68 | 38 | 134 |
| **合计** | **51** | **169** | **459** | **459** | **1,138** |

11 册基线结构以兵器 355、拳脚 287 为主，内功 199；非核心栏合计 `123+40+134=297`。这些类别数不含补录册，待 NXfixC 收口后由 NAu-final 重算现行结构；不得仅把天阶改成 59 而沿用旧类别分项。

### 14.4 按书界（首现与全部路线可习得池）

本节两张明细表同样是 11 册基线快照，尚未并入 `skills-bulu-NN-*.md`，不可作为 Canon v1.6 的现行书界天阶池。现行**完整原生天阶池**以 Canon V16-02 为准：天龙 17、射雕 16、神雕 18、倚天 13、笑傲 6；高武书界允许 6–18 门，中武允许 1–6 门，低武仍为 0–2 门。补录全部来源后的首现 / 可习得池由 NXfixC 收口后统一重算。

统计口径：

- **首现**：一个唯一武学 ID 的最早原生 `sourceChapters`；同一 ID 后世复现不重复计数。`skills-general.md` 的“明清各界 / 清代各界 / 后世武馆”按该图鉴语义展开后取最早书界。
- **全部路线可习得池**：同一书界、同一 ID 去重，取玩家在任一合法路线可取得的最高来源品阶；包含正邪互斥路线并集和可新学残承，不含只见闻、仅由外界携带、敌人专用与玩家自创。它不等于单周目取得数。
- 218 门扩充武学已全部写入四册图鉴；下表按其最终 `sourceChapters` 取唯一 ID 的最早书界。跨界复现只影响后续可习得池，不重复计入首现。

| 书界 | 境界 | 首现 天/地/玄/黄 | 首现合计 |
|---|---|---:|---:|
| 序章 越女剑 | 教学 | 0/1/3/6 | 10 |
| 01 天龙 | 高 | 14/45/134/148 | 341 |
| 02 射雕 | 高 | 11/24/58/57 | 150 |
| 03 神雕 | 高 | 5/11/27/21 | 64 |
| 04 倚天 | 高 | 8/22/49/50 | 129 |
| 05 笑傲 | 中 | 4/17/56/45 | 122 |
| 06 侠客 | 中 | 2/12/30/29 | 73 |
| 07 碧血 | 中 | 2/10/26/29 | 67 |
| 08 鹿鼎 | 低 | 1/7/14/15 | 37 |
| 09 连城 | 低 | 1/4/10/9 | 24 |
| 10 白马 | 低 | 0/2/8/8 | 18 |
| 11 鸳鸯 | 低 | 0/2/9/9 | 20 |
| 12 书剑 | 中 | 2/7/18/15 | 42 |
| 13 飞狐 | 中 | 1/5/17/18 | 41 |
| 14 雪山 | 中 | 0/0/0/0 | 0 |
| **合计** | | **51/169/459/459** | **1,138** |

雪山首现为 0 不表示无可学武学，而表示其池均为早期 ID 的复现。少林图鉴 §5.3 的“首现”汇总列与逐条最早来源不能闭合；上表按逐条来源归并，详见 §14.7。

**当前全部路线可习得池实际值 / 目标区间**（序章 0/1/3/6=10 为固定教学池，不套正式书界占比）：

| 书界 | 境界 | 实际 天/地/玄/黄 = 合计 | 实际占比（天/地/玄/黄） | 目标占比 | 结论 |
|---|---|---:|---:|---:|---|
| 天龙 | 高 | 14/45/134/148 = 341 | 4.11/13.20/39.30/43.40% | 10–15/20–25/30–35/30–35% | 未通过 |
| 射雕 | 高 | 15/32/121/139 = 307 | 4.89/10.42/39.41/45.28% | 同上 | 未通过 |
| 神雕 | 高 | 16/38/147/155 = 356 | 4.49/10.67/41.29/43.54% | 同上 | 未通过 |
| 倚天 | 高 | 12/40/106/118 = 276 | 4.35/14.49/38.41/42.75% | 同上 | 未通过 |
| 笑傲 | 中 | 7/41/136/135 = 319 | 2.19/12.85/42.63/42.32% | 2–6/15–20/33–38/38–45% | 未通过 |
| 侠客 | 中 | 2/28/95/100 = 225 | 0.89/12.44/42.22/44.44% | 同上 | 未通过 |
| 碧血 | 中 | 2/26/90/102 = 220 | 0.91/11.82/40.91/46.36% | 同上 | 未通过 |
| 鹿鼎 | 低 | 1/24/107/128 = 260 | 0.38/9.23/41.15/49.23% | 0–5/8–12/33–38/48–55% | 未通过 |
| 连城 | 低 | 1/15/62/69 = 147 | 0.68/10.20/42.18/46.94% | 同上 | 未通过 |
| 白马 | 低 | 0/9/59/63 = 131 | 0/6.87/45.04/48.09% | 同上 | 未通过 |
| 鸳鸯 | 低 | 0/11/61/70 = 142 | 0/7.75/42.96/49.30% | 同上 | 未通过 |
| 书剑 | 中 | 2/26/85/92 = 205 | 0.98/12.68/41.46/44.88% | 2–6/15–20/33–38/38–45% | 未通过 |
| 飞狐 | 中 | 1/24/83/92 = 200 | 0.50/12.00/41.50/46.00% | 同上 | 未通过 |
| 雪山 | 中 | 1/18/65/69 = 153 | 0.65/11.76/42.48/45.10% | 同上 | 未通过 |

扩充后十四个正式书界仍均未完整命中目标区间。后续应优先裁剪或补充 `sourceChapters`、补齐前置闭包并重算唯一 ID 并集；不得新增天阶、删除 ID，也不得排除互斥路线来缩小“全部路线池”。

**C14 / C15 的天阶与神雕处理规则**：

- 11 册基线快照中的射雕池为 15 门天阶；Canon V16-02 已由补录更新为 16。两者都不表示单周目可全部取得：五绝组单周目最多 5、道家最多 2、少林易筋线最多 1，且共享章节预算 7，所以取得上限仍为 `min(7, 5+2+1)=7`；章节投放必须保留路线互斥和获取成本。
- 旧快照中的神雕完整天阶池为 16；Canon V16-02 已由补录更新为 18，并把高武上限同步扩至 18。当前神雕首现玄阶 17 仍只属旧表，不能与现行完整池混算。
- 11 册基线快照中的倚天池为 12 门天阶，其中降龙十八掌 10 品残承 1 门、完整天阶为 11；Canon V16-02 已由补录更新为 13 门完整原生天阶。笑傲池另含太极拳、太极剑各 10 品残承。残承按来源品阶计入全池大阶，不得冒充完整天阶或被书眠/现影自动补全。

### 14.5 按实际图鉴文件

下表前十行为金庸核心门派图鉴；古龙是 AR-08 补充图鉴，单列但纳入 11 册基线。目标不是逐册机械补成严格 1:3:9:9：若四册旧图鉴都以各自天阶为基数补足，会把基线推至约 1,394 门，超过当时 AR-01 上限。故历史上采用“保留天/地、把 218 门玄黄缺口集中给四个 CX 任务”的受控配额；NXT 补录不改写这段历史核算。

| 实际文件 | 覆盖 | 扩充前 天/地/玄/黄 = 合计 | 最终实际 天/地/玄/黄 = 合计 | 本轮扩充 天/地/玄/黄 | 状态 |
|---|---|---:|---:|---:|---|
| `skills-shaolin.md` | 少林、南少林、西域金刚门传承 | 3/26/27/14 = 70 | 3/26/27/18 = 74 | 0/0/0/4 | 闭合 |
| `skills-wujue.md` | 丐帮、五绝诸脉、大理、九阴、蒙古等 | 13/23/28/19 = 83 | 13/23/71/75 = 182 | 0/0/43/56 | 闭合 |
| `skills-daojia.md` | 全真、古墓、剑冢、武当、绝情谷 | 8/18/25/15 = 66 | 8/18/44/46 = 116 | 0/0/19/31 | 闭合 |
| `skills-xiaoyao.md` | 逍遥、灵鹫、星宿、慕容、密宗等 | 10/14/26/22 = 72 | 10/14/55/58 = 137 | 0/0/29/36 | 闭合 |
| `skills-yitian.md` | 倚天四派及相关组织 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-xiake-bixue.md` | 侠客、碧血诸派与传承 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-wuyue.md` | 五岳、日月、五仙、福威、青城等 | 4/12/36/36 = 88 | 4/12/36/36 = 88 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-kangxi.md` | 鹿鼎、连城、白马、鸳鸯诸派 | 2/14/37/37 = 90 | 2/14/37/37 = 90 | 0/0/0/0 | 已按受控配额起草 |
| `skills-qianlong.md` | 书剑、飞狐、雪山诸派 | 3/9/30/30 = 72 | 3/9/30/30 = 72 | 0/0/0/0 | 已按 AR-01 起草 |
| `skills-general.md` | 序章、军中、镖局、武馆、散人、杂学 | 0/19/58/58 = 135 | 0/19/58/58 = 135 | 0/0/0/0 | 已按 0–1 天阶规则起草 |
| **金庸核心小计** | 十册 | **51/159/339/303 = 852** | **51/159/430/430 = 1,070** | **0/0/91/127** | **闭合** |
| `skills-gulong.md` | AR-08 古龙经典门派补充 | 0/10/29/29 = 68 | 0/10/29/29 = 68 | 0/0/0/0 | 已按 0–1 天阶规则起草 |
| **11 册基线** | 十册核心＋一册补充 | **51/169/368/332 = 920** | **51/169/459/459 = 1,138** | **0/0/91/127** | **基线闭合** |

十册核心基线 51/159/430/430 与古龙补充图鉴 0/10/29/29 相加，恰为 11 册基线 51/169/459/459。四个 CX 已按直接工作配额完成；补录册作为正式定义源另计，含补录低三阶总量不得由此表猜测。

### 14.6 catalog 撰写约束清单

1. 每门武学使用 §2 字段，招式倍率按 §4.2 公式配出（允许 ±0.05）。
2. 原著有名的招式/武学注明出处；原创扩展写明“（原创扩展）”。
3. 每个正式门派在其归属图鉴至少包含：1 门黄阶入门拳或剑、1 条“黄→玄→地”的进阶链（前置关系）、1 个可成套的组合（`setTags`，套装本体交 design/07）。
4. 每个正式书界至少提供可同时获得、前置闭合且非互斥的本土内功、拳脚、兵器各 ≥3 门；兵器三门必须存在至少一组同一兵器子类。此项用于在携带 1/1/1 后重新补满，不得只以目录总数或“剑/刀/枪各一门”判通过。
5. 代价型 / 誓约型与强制合击比例最终以两类正式定义源合并后的**玩家可习得地阶唯一 ID**为分母：前两者合计 ≤5%，后者 ≤3%。本体可单人施展、多人只提供可选加成者不计强制合击。NXfixC / NAu-final 完成全量重算前，11 册基线分母 169 只供历史对拍，不据此宣称现行全目录通过。
6. 敌人专用武学（`learnSources` 为空、`enemyOnly: true`）不计入 §14.1 的 11 册基线，必须单独列表；当前 11 册中只有少林 `sk_shibaluohanzhen` 1 门。
7. 各书界最高原生轻功品阶不得超过：天龙天中 11；射雕/神雕/倚天地上 9；笑傲/侠客/书剑/飞狐/雪山地中 8；碧血/鹿鼎天下 10；连城/白马地下 7；鸳鸯玄上 6。
8. 每个图鉴与全局按 AR-01 核对大阶比例；若受既有高阶库存与只增不减边界影响不能在 ±15% 内命中，必须同时列名义偏差和受控配额，不能靠改阶或删 ID 隐去。
9. 黄阶采用 AR-01 的一行条目：至少含 ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处或“（原创扩展）”；各图鉴必须有可计数的黄阶一行表。
10. 每次变更 `sourceChapters`、`learnSources`、来源品阶或残承后，必须按 §14.4 的唯一 ID 并集重算十四书界全部路线池，并以未舍入分数验收占比。

### 14.7 现状核对

#### 14.7.1 逐项结论

| §14.6 约束 | 现状 | 结论与后续 |
|---|---|---|
| #1 字段与招式预算 | 十一册审校与 CN-05“独孤六式 1.147→1.10”是历史快照；破箭现已转绝招，现行普通匹配式计五个 | 历史轮通过；本轮绝招仍须按 §4.8 逐卡迁移，特殊钩子与混合伤害未闭合项见 D30，不作为现行全库预算通过声明 |
| #2 出处与原创标注 | 图鉴审校均保留原著待考清单与原创标注 | 有条件通过；逐字考据仍按各图鉴待办 |
| #3 门派入门/进阶/套装 | 十一册均已建立入门、进阶链；图鉴实际 `setTags` 与 07 的 44 套、305 条成员关系双向闭合 | 通过；九阴等“传承而非门派”不强制自带黄阶 |
| #4 每界本土三类各 ≥3 | `skills-general.md` 的 `ALL14` 底座在目录层面为十四界提供 ≥3 内功、≥3 拳脚及同类剑法 ≥3 | 目录层面通过；章节尚须逐界验证同一周目非互斥、前两幕可达与前置闭包 |
| #5 地阶代价/誓约与合击 | 按“明确以伤身、反噬或异常状态换取收益”的宽口径，代价型共 7 门：七伤拳、九阴白骨爪、同归剑法、碧血神功、虎爪绝户手、化功大法、冰蚕毒掌；誓约型 0 门，合计 `7÷169=4.14%≤5%`。强制多人合击 2 门：金刚伏魔圈、真武七截阵，`2÷169=1.18%≤3%` | 通过；夫妻刀等本体可单人施展者不计 |
| #6 敌人专用分表 | 11 册基线玩家可习得 1,138 门之外，少林另有 `sk_shibaluohanzhen` 1 门敌专 | 通过；不得混入玩家可习得统计；含补录总量待重算 |
| #7 原生轻功上限 | 实际最高依次为天龙11、射雕9、神雕9、倚天9、笑傲8、侠客8、碧血10、鹿鼎10、连城7、白马7、鸳鸯6、书剑8、飞狐8、雪山8 | 全部通过 |
| #8 图鉴与全局比例 | 11 册基线 51/169/459/459；四个 CX 配额均为 0 缺口 | 基线通过受控配额；现行天阶为 59，含补录低三阶待重算 |
| #9 黄阶一行条目 | 459 门黄阶均可计数；四个 CX 已把旧四册转为八字段一行表并完成扩充 | 通过 |
| #10 书界池占比 | §14.4 已按扩充后来源重算，十四界仍至少一项越界 | 未通过；由章节重配来源，不再扩大全库 |

#### 14.7.2 各图鉴最终比例

“名义比例”以 AR-01 的单册规则核对；受既有天／地库存与全目录总闸影响的四册，以 §14.5 受控配额为验收口径。

| 文件 | 最终 天/地/玄/黄 | 名义比例诊断 | 受控缺口 | 状态 |
|---|---:|---|---:|---|
| `skills-shaolin.md` | 3/26/27/18 | 对名义 3/9/27/27：既有地阶偏高、黄阶偏低 | 0/0/0/0 | 受控配额通过 |
| `skills-wujue.md` | 13/23/71/75 | 对名义 13/39/117/117：受全局总闸约束 | 0/0/0/0 | 受控配额通过 |
| `skills-daojia.md` | 8/18/44/46 | 对名义 8/24/72/72：受全局总闸约束 | 0/0/0/0 | 受控配额通过 |
| `skills-xiaoyao.md` | 10/14/55/58 | 对名义 10/30/90/90：受全局总闸约束 | 0/0/0/0 | 受控配额通过 |
| `skills-yitian.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-xiake-bixue.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-wuyue.md` | 4/12/36/36 | 精确 1:3:9:9 | 0/0/0/0 | 通过 |
| `skills-kangxi.md` | 2/14/37/37 | 对名义 2/6/18/18：地 +133.33%、玄/黄各 +105.56%；两门天阶均属封闭名录 | 0/0/0/0 | 单册比例未通过；全局受控配额冻结 |
| `skills-qianlong.md` | 3/9/30/30 | 对名义 3/9/27/27：地 0、玄/黄各 +11.11% | 0/0/0/0 | 通过 |
| `skills-general.md` | 0/19/58/58 | 零天阶规则下地:玄:黄=`1:3.05:3.05`，玄/黄相对 3 各 +1.75% | 0/0/0/0 | 通过 |
| `skills-gulong.md`（补充） | 0/10/29/29 | 零天阶规则下地:玄:黄=`1:2.90:2.90`，玄/黄相对 3 各 −3.33% | 0/0/0/0 | 通过 |
| **11 册基线** | **51/169/459/459** | 地/天=3.31，相对名义 3 为 +10.46%；玄/天与黄/天均为 9 | **0/0/0/0** | 基线通过；补录后重算 |

#### 14.7.3 剩余跨文档项

| 文件 | 范围 | 问题 | 建议 |
|---|---|---|---|
| `skills-kangxi.md` | 全册 | 2/14/37/37 相对单册名义 2/6/18/18 偏高，无法在只增不减且 11 册基线总量 1,100–1,150 的边界内单册校正 | 保留现有 90 门与两门受控天阶，不删 ID、不降阶；以 §14.5 基线受控配额冻结，F2 仅复核来源投放 |
| 全部图鉴 / chapters | 十四书界全部路线池 | 最终十四界均未完整命中 §14.4 区间 | 章节按唯一 ID 并集重配 `sourceChapters`，不得新增天阶或排除互斥路线 |
| `skills-general.md` / chapters | `ALL14` 三类底座 | 目录可证明数量，但“明清各界”等简写与章节实际非互斥、前期可达尚未逐事件落盘 | 导出时显式展开 14 个章节 ID；章节为每界验证至少 3/3/3 及同类兵器路径 |

四个 CX 的数量与黄阶格式已在 11 册基线内闭合；地阶特殊类型比例和轻功上限通过。普通天阶现按作者决定扩容为 59 门受控名录；含补录总量、类别与逐界池尚须统一重算，不能再据旧 51 门结论宣称全目录闭合。

---

## 15. 本文新增术语与 ID

### 15.1 术语

| 术语 | ID / 字段 | 定义 | 章节 |
|---|---|---|---|
| 武学经验 | `sxp` | 单门武学的修炼进度；旧角色 `exp` 仅供迁移 / 回放 | §3.2 |
| 真实层数 / 有效层数 | `trueLayer` / `effLayer`（与 design/02 同名） | 修为所达层数 / 书界上限、修为门槛、途径上限截断后的可用层数 | §2.6、§3.4 |
| 来源品阶 / 有效品阶 | `sourceGrade` / `effGrade` | 习得途径保存的传承上限 / 再经书界压制、抵消与誓约覆写后的品阶；残承不会被现影或终局自动补全 | §2.6、§7.1 |
| 层数系数 | `L(n)` | `0.5 + 0.1n`，交 design/04 Z1 | §3.1 |
| 条件预算类型 | `adjCondition`（预算记号） | 加成型 +0.15 / +0.30，门槛型 0；配表说明，不新增运行字段或存档键 | §4.8.2 |
| 绝招预算原值 / 取整值 | `rawPower` / `roundedPower`（预算记号） | 全式计算后只取整一次；手调总偏差相对未取整原值检查 | §4.8.1–§4.8.3 |
| 骑乘条件标签 | `targetHasTag:mounted` | 复用字符串条件键，只读真实战场骑乘状态；普通下马战斗为 false | §4.11 |
| 品阶/层耗费系数 | `GF(g)` / `LF(n)` | 经验曲线系数 | §3.2 |
| 修为门槛 | `gateCap` | 按派生有效修为档 `Ce` 限制高阶武学深层 | §3.3 |
| 瓶颈 / 强行冲关 | — | 门槛前的经验封顶 / 无视门槛突破 1 重的冒险操作 | §3.3 |
| 阶段名 | — | 初窥门径 / 登堂入室 / 炉火纯青 / 登峰造极 | §3.1 |
| 招式预算 | — | 招式倍率配表公式 | §4.2 |
| 范围系数 | `AF` | 范围模板对倍率的折算 | §4.3 |
| 六角范围 | `HexShape` | 引用 design/09 的点、环、面、扇形及行为/组合判别联合；05 只消费模板和格数 | §4.1、§4.3 |
| 高度容差 | `hTol` | 范围与近身判定的高差上限 | §4.1 |
| 蓄招 | `charge` | 下次行动释放的预警招式 | §4.1 |
| 招式栏 | `moveSlots` | 每门武学战斗中可暴露的普通招式数 | §4.9 |
| 自动选式组 | `autoGroup` | 一个按钮按目标自动解析的招式组 | §4.1 |
| 自动模拟目标上限 | `autoTargetCap` | 无站位模拟中范围招最多命中的单位数；不参与手动六角几何与倍率预算 | §4.1；design/09 §8.12 |
| 效果钩子 | `effects` | 结构化字段外的规则声明 | §4.11 |
| 普攻 | `sk_basic` / `mv_basic_strike` | 隐藏的基本功与普通一击 | §4.10 |
| 标准内力 | `MPREF(Ce)` | design/03 §3.5 STD 的兼容 `mpMax` 列，耗内计价基准；不等于真实 `mpMax` | §4.1 |
| 辅运比例 | `auxRatio` | 辅运内功生效比例 0.25–0.60 | §5.2 |
| 内力性质 | `nature` | 内功必填 `yang` / `yin` / `harmony`；外功还可为 `neutral` | §5.3 |
| 阴阳相冲 / 桥接 / 三运同源 | — | 内功组合规则；调和主运无相性惩罚 | §5.3、§5.4 |
| 内功点 | `IP` | 内功贡献预算单位 | §5.5 |
| 内功成长系数 | `innerScale(n)` | `0.30 + 0.07n` | §5.5 |
| 内劲 | — | 05 输出给冲穴系统的速率输入；不是战斗资源 `mp`，公式归 design/15 | §5.8 |
| 战斗练习层 / 资源层 | `practiceLayer` / `resourceLayer` | 前者 `min(effLayer,9)` 驱动产气 / 速度，后者 `min(trueLayer,9)` 驱动 03 的永久资源；第 10 重均不再增加 | §3.0、§5.8.1 |
| 丹田基础产气 / 基础运气速度 | `baseQiPerTick` / `baseQiSpeedBp` | 主运内功的整数基础参数；逐 tick 最终值与旅行公式归 21 | §5.8.1 |
| 熟练层曲线 | `layerCurveBp[1..9]` | 1–9 层共用的非递减 bp 数组，同时缩放产气与速度 | §5.8.1 |
| 通量锻炼基数 / 硬上限 | `fluxTrainBase` / `fluxTrainHardCap` | 完整修炼周期的递减增量输入；穴 / 脉硬上限固定 64 / 96 | §5.8.1 |
| 命中区 | `hitZone` / `hitZoneReason` | 招式固定命中 `body/hand/leg`；覆写分类默认时必须留理由，抗性公式归 09 | §4.1、§4.2.3 |
| 穴位候选 / 打穴 | `targetAcupoints` / `acupointStrike` | 有序合法穴候选与 1–9 严重度 / 占穴比例；占穴算法归 21 | §4.1、§4.2.3 |
| 透劲入体 | `penetratingQi` | 玄级以上外放伤害招的候选标记；内力比较、注入、逆流归 21 | §4.2.3 |
| 消化比例 / 反引 | `digestRatioBp` / `reverseQi` | 来源异种气的消化成本 1:1–10:1；是否可用 1:2 斗转反引 | §5.8.1 |
| 专精经脉 | `inner.meridians` / `MeridianId` | 内功向冲穴系统声明的经脉 ID 列表；只允许 design/15 §2 的 20 个正式 ID，单门专精只令自身内劲贡献 ×1.20 | §5.7–§5.8 |
| 招式经脉路线 | `meridianRouteRef` / `routeOnTriggerRef` | 武学侧只保存对 `mfr_*` 主路线或触发路线的引用；用途、节点、段时间、风险和运行结果归 design/21 | §4.1–§4.2.1 |
| 轻功速度路线 | `movementRouteRef` | 轻功武学的常驻 `purpose:movement` 路线；输出经脉速度而不改基础轻功 / 门禁 | §2.1、§5.11 |
| 路线段时间 / 经脉收招 | `segmentCt` / `flowCt` | `segmentCt` 属于 21 路线步骤；05 校验招式 `recovery +` 满路线总 CT，运行时只消费派生 `flowCt` | §4.1–§4.2 |
| 外放招式 / 外放范围档 | `projection` / `projectionSpreadSteps` | 逐招声明离体真气伤害及三项预审六角范围；`range` / `aoe` 保存基础值，当前可用档与数值算法归 design/21 | §4.1、§4.2.2 |
| 调息档案 | `inner.breathProfileRef` / `txp_*` | 内功引用 21 的调息参数投影；理顺、修复与解穴公式不在 05 重定义 | §5.7、§5.10 |
| 外放抵消参数 | `inner.innerGuard` / `OutwardQiInput.breakGuardBp` | 内功声明护体路线启用与既有反震语义；来袭破气由招式 / Buff 投影，抵消公式和实例状态归 design/21 | §5.10 |
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
| 经脉运行（仅引用 Canon v1.3 已登记前缀） | `mfr_*` 招式路线；`txp_*` 调息档案；`qnl_*` 擒拿严重度；`dxl_*` 点穴严重度 | `design/21` 定义 schema、算法、共享模板、示例及 `qnl_*` / `dxl_*` 档案；各武学图鉴定义具体武学的 `mfr_*` / `txp_*` 实例；本文只保存引用 |
| 经脉运行示例（仅引用） | 21 示例：`mfr_xianglong18_zhenjing`、`mfr_eighteen_palms_chain`、`mfr_xianglong18_shenlong`、`txp_harmony_supreme`；图鉴实例：`mfr_dugu9_wuzhao`、`mfr_jiuyang_puzhao`、`mfr_yijinjing_daozhuai`、`mfr_longzhaoshou_sanshiliu`、`txp_yijinjing`、`txp_jiuyang` | 归属分别见 `design/21` §12 与对应武学图鉴经脉章节；05 不登记第二份对象 |
| 范围模板（仅引用 design/09 的生产 ID） | 基础：`aoe_single` `aoe_self` `aoe_ring` `aoe_around` `aoe_disk` `aoe_line` `aoe_bolt` `aoe_spokes` `aoe_cone` `aoe_zone` `aoe_allies` `aoe_field` `aoe_ally_all`；行为/组合：`aoe_wave` `aoe_pierce` `aoe_leap` `aoe_dash` `aoe_pull` `aoe_knock` `aoe_chain` `aoe_multi` `aoe_behind` `aoe_swap` `aoe_boomerang` `aoe_sequence` | §4.3；旧方格 ID 仅为迁移别名，不列生产清单 |
| 武学（本文新增，非基准 §13） | `sk_basic` `sk_tieshazhang` `sk_taizuchangquan` `sk_quanzhenjian` `sk_longzhaoshou` `sk_luohanquan` `sk_qishangquan` `sk_jiuyinbaigu` `sk_zichuang01`–`03` | 完整定义于本文 |
| 武学（仅引用，待 catalog 定义） | `sk_mianzhang` 绵掌、`sk_yunvjian` 玉女剑法、`sk_shaolinqinna` 少林擒拿手、`sk_huagong` 化功大法 | catalog |
| 招式·降龙十八掌 | `mv_xianglong18_` + `kanglong` `jianlong` `qianlong` `hongjian` `lishe` `turu` `zhenjing` `huoyue` `shuanglong` `yuyue` `feilong` `shicheng` `miyun` `sunze` `longzhan` `lvshuang` `diyang` `shenlong` `lianhuan` | §13.1 |
| 招式·独孤九剑 | `mv_dugu9_` + `zongjue` `pojian` `podao` `poqiang` `pobian` `posuo` `pozhang` `poanqi`（破箭式；"箭"与"剑"同拼音，以"暗器"区分） `poqi` `wuzhao` | §13.2 |
| 招式·易筋经 / 九阳神功 | `mv_yijinjing_` + `xisui` `weituo` `daozhuai` `huangu`；`mv_jiuyang_` + `huti` `liaoshang` `puzhao` | §13.3–13.4 |
| 招式·其余示例 | `mv_taizuchangquan_` + `chongzhen` `qianli` `guanri`；`mv_quanzhenjian_` + `dingyang` `qixing` `sanqing` `chongyang`；`mv_longzhaoshou_` + `bufeng` `zhuoying` `fuqin` `guse` `pikang` `daoxu` `sanshiliu` `baocan` `shouque`；`mv_luohanquan_` + `baifo` `zhuangzhong` `tuishan`；`mv_tieshazhang_` + `kaibei` `tuishan` `lianhuan` `jingang`；`mv_basic_strike` | §13、§2.8 |
| 被动 | `ps_xianglong18_{gangmeng,longyin,youyu,zhigang,dacheng}`；`ps_dugu9_{pojin,liaodi,youjin,yiwu,wuzhao}`；`ps_yijinjing_{yijin,famao,huayi,jingang,baibing,dacheng}`；`ps_jiuyang_{taqiang,taheng,hutizhenqi,hanbuqin,shengsheng,chulei,dacheng}`；`ps_taizuchangquan_{tangtang,fanpu}`；`ps_quanzhenjian_{xuanmen,jiansui,tongqi,dacheng}`；`ps_longzhaoshou_{naxue,fenjin,zhili,dacheng}`；`ps_luohanquan_{quanjia,yuanman}`；`ps_tieshazhang_{shazhang,tiebi,dacheng}` | |
| Buff（只引用，正式定义归 design/06） | `bf_liuli` `bf_xuli` `bf_qianlong` `bf_longyin` `bf_miyun` `bf_lvshuang` `bf_duguyi` `bf_pozhao` `bf_pojian` `bf_podao` `bf_poqiang` `bf_pobian` `bf_posuo` `bf_pozhang` `bf_poanqi` `bf_poqi` `bf_weituo` `bf_jianshi` `bf_shouque` `bf_tiebi` `bf_qishang` `bf_xielian` `bf_yizhongzhenqi` `bf_duanchen` `bf_neixiwenluan` `bf_jingmainixing` `bf_zouhuorumo`；经脉：`bf_shouqin` `bf_xueweishoufeng` `bf_jingqizhizhi` `bf_jingmaizhangsun` `bf_hutineijin`；通用：`bf_pojia` `bf_neishang` `bf_xuanyun` `bf_dingshen` `bf_jiaoxie` `bf_hutizhenqi` `bf_jiansu` `bf_hanqi` `bf_zhuoshao` `bf_mian_han` `bf_pibei`；基准已有：`bf_wudi` | 已逐项对照 06；05 不重复定义 Buff。旧四 ID 仅由 06 §8.14.3 迁移器读取，不是本文运行内容引用 |
| 套装（**建议 ID**，定义归 design/07） | `set_gaibang_bangzhu` `set_quanzhen_beidou` `set_shaolin_luohan`；基准已有：`set_shaolin_jingang` | |
| 物品（**建议命名规则**，design/10 确认） | `it_miji_<武功拼音>` 秘籍（残本加 `_can`）；`it_canye_<武功拼音>` 残页 | |
| 誓约 / 标记 | `vow_duanchen`；存档标记 `jiuyang_echo`、`scar_qishang` | |
| 门派（引用） | `sect_gaibang` `sect_quanzhen` `sect_kongtong` `sect_riyue` | 正式 ID、历史与时代开放归 design/17；身份玩法归 design/12 |
| NPC（引用/岗位槽） | 具名引用：`npc_hongqigong` `npc_guojing` `npc_fengqingyang` `npc_fangzheng` `npc_kongxing` `npc_kongwen` `npc_xiaofeng` `npc_xuanci`；岗位槽：少林罗汉堂/般若堂/武僧/当代方丈、全真三代弟子、军营/镖局/武馆教头 | 静态身份归 design/18；无名职能已改为组织/设施岗位槽文字，运行时按 D15 实例化 |
| 任务接口 | `q_01_qiyu_91` `q_04_qiyu_91` `q_03_qiyu_90` | 神雕全真剑法已接正式“石刻正解”来源；神雕九阳闻经不冒充学习来源 |
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
| V4 | 每门内功显式填 `nature: yang\|yin\|harmony`、`inner.contribution` 与 `inner.meridians`；`meridians` 只含 design/15 §2 的 20 个正式 `MeridianId`、不得重复，空数组合法且表示无专精；按 §5.3 主修经脉投票所得性质必须等于声明性质（冲 / 带默认不投票，平票 / 无票调和）；外功才允许 `neutral`；IP 偏离 §5.5 预算超过 ±5% 报警 | 失败 / IP 为警告 |
| V5 | `wOut + wIn = 1` 且二者是 0.05 的倍数；招式覆写亦同 | 失败 |
| V6 | `layers[].n`、招式/被动 `unlock` 为整数 1–10；每个解锁对象恰好出现一次且不超过 `maxLayer` | 失败 |
| V7 | 按 §3.5 检查解锁节奏、可施放招式总数 / 被动数量和 `moveSlots`；默认下限计普通招式＋绝招，完整卡不足时必须有逐卡豁免理由；原著有定数的招式只豁免数量上限，不豁免栏位 | 警告 |
| V8 | 普通招式 `power` 与 §4.2 预算差值 ≤ 0.05；AF 必须由 design/09 的 `HexShape` 最大格数计算；显式特例须有说明 | 警告 |
| V9 | `ultimate:true` 为唯一真值且每项 `rageCost=100`；按绝对 `grade` 校验绝招数：1–5 为 0、6 为 1、7 为 1、8 为 1–2、9 为 2、10 为 2、11 为 2–3、12 为 3；地中 / 天中逐门结果须与 `docs/decisions/ultimate-counts-tianzhong-dizhong.md` 一致；核心武学第一绝招 `unlock≤7`，第二 / 第三默认 9 / 10 | 失败 |
| V10 | `layerStats` 第 10 重合计不超过 §3.6 大阶上限；内功 `stats` 与 `layerStats` 不重复计同一增益 | 警告 |
| V11 | `setTags` 与 design/07 成员清单双向一致；自创武学至多继承一个套装 | 失败 |
| V12 | 引用的 `bf_*` 存在于 design/06；武学来源默认 `grade: inherit`；不得在 05 重定义同 ID 的 Buff 本体。新内容不得施加旧四 ID；`bf_shouqin` / `bf_xueweishoufeng` 必须生成 06 §2.2.1 合法载荷（等级 1–9、来源、剩余自身行动，后者另需合法穴位）；`remainingOwnActions=dur`。`bf_jingqizhizhi` / `bf_jingmaizhangsun` 只能由模块派生，不得 `applyBuff`；`bf_hutineijin` 必须有合法 `routeId`，`reflectBp` 缺省 0 | 失败 |
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
| V27 | 需运气的伤害 / 防守 / 轻功招式（含 §5.11 生成的局部基础移动招）必须引用已存在 `mfr_*`；路线 `moveRef` 回指本招或稳定复合引用、`purpose` 与 attack / defense / movement 用途一致；一招至多一条主路线，触发路线仅限 defense / movement；正式发布无默认迁移短路 | 失败 |
| V28 | 路线对象的 `ultimate` 必须等于 `MoveDef.ultimate ?? false`；绝招仍满足 V9，路线不得自立第二真值 | 失败 |
| V29 | 所引路线 1–18 段、穴位不重复、逐段 CT 40–120、风险 0–1200；凡由 `MoveDef` 引用者须满足 `recovery + ΣsegmentCt≤2000`。`segmentCt/steps/purpose` 只在 21 路线对象中定义，不得复制进 `MoveDef` | 失败 |
| V30 | 每门内功必须引用已存在且性质匹配的 `txp_*` 并填 `innerGuard`；`reflectBp` 为整数 0–2000，非零必须有原招 / Buff 反震语义；来袭 `breakGuardBp` 只能从招式 / Buff 来源投影且为整数 0–8000 | 失败 |
| V31 | `category:movement` 必须有 `movementRouteRef` 且路线用途为 movement；主动轻功覆写也必须为 movement；§5.11 的 12 门无主动招轻功还须生成本门 `basic_movement` 并以 `{skillId}#basic_movement` 与路线双向闭合，未生成即拒绝构建；经脉速度不得写回轻功面板、08 门禁或 `Q_skill` | 失败 |
| V32 | 每个绝招恰有一个独立 `mfr_*`，同门绝招不得共用路线 ID；任一绝招在 F2 原子支付资源后同门共享冷却置 1，且下一绝招 `moveId != lastUltimateMoveId`，直到成功结算同门另一绝招或非绝招 | 失败 |
| V33 | §5.11 所列 12 门无主动招轻功必须恰有 `generatedLocalMoves.basic_movement`；其复合引用为 `{skillId}#basic_movement`，与顶层 `movementRouteRef` 的 `moveRef` 双向闭合且路线用途为 movement；缺失、跨门复用、额外生成或回退为全局招式均失败 | 失败 |
| V34 | `projection` 只允许出现在 `MoveDef`；为 true 时 `projectionSpreadSteps` 必须恰有三项且 `[0]` 与 `aoe` 深相等，每项均通过 09 `HexShape` 校验；为 false / 缺省时不得保留该数组 | 失败 |
| V35 | `projection:true` 的每个伤害段必须为 `DamageKind='projected'`，反向不自动补标；档位只允许 0 / 1 / 2，对应射程增量 0 / 2 / 4 与额外耗内 0 / 200 / 400 bp MPREF | 失败 |
| V36 | `projection:true` 的 `meridianRouteRef` 至少经过 design/21 §4.4.1.4 的一个合法外放端点；不得在静态招式保存当前档、扩大后射程、外放 Z5M 或按整门武学生成标记 | 失败 |
| V37 | `sk_xianglong18` 除 `mv_xianglong18_qianlong` 外恰有 18 个 `projection:true` 招式且各有三项 `projectionSpreadSteps`；潜龙勿用不得带外放字段。三绝招的 `[0]` 必须与 `aoe` 深相等，并分别保持连环 60° 锥 `r3/r4/r5`、神龙 120° 锥 `r1/r2/r3`、震惊 `around/disk r2/disk r3` | 失败 |
| V38 | `sonic && projection:true` 的招式 0 档须派生 `projectionBoostActive=false`、基础范围、0 外放增耗与普通 Z5M；1 / 2 档须派生 true 并使用审核范围、200 / 400 bp MPREF 与外放 Z5M。三档静态伤害类别均保持 `projected`；AR-19 抵消按 `wIn/wOut`，不得再套旧 40% 适用率 | 失败 |
| V39 | 音功无伤害段、普通喊声 / 传讯不得标 `projection:true`；`mv_dashouyin_dashouyin` 仅落点掌风构成一个 `projected` 外放伤害段，跃迁位移不得生成第二伤害段、第二次 Z5M 或第二条攻击路线 | 失败 |
| V40 | 正式图鉴发现必须同时覆盖门派册与 `skills-bulu-NN-*.md`，并以全局 ID 去重；现行普通天阶唯一 ID 恰为 `59=9+18+32`，含补录低三阶及总量未由 NAu-final 重算前不得拿 11 册 `1,138` 基线冒充现行全目录 | 失败 |
| V41 | `voice:true` 只可与 `tags:[sonic]` 联用；人声外放路线可取天突 / 廉泉，`voice:false` 的持乐器音功仍须命中 13 个手 / 腕端点；`ProjectionInput.voice` 必须逐字投影 `MoveDef.voice===true` | 失败 |
| V42 | 条件伤害绝招按 §4.8.1–§4.8.3 唯一乘法式复算；必须有条件类型、档位、原始值、扣费依据及手调差值；配置为 0.05 步长且与未取整原值总差 ≤0.05；门槛型 `adjCondition=0`，禁止加法及无实际效果的反向抵扣 | 失败（配表审校契约；自动预算 lint 待接入） |
| V43 | `targetHasTag` 为字符串，骑乘条件只用 `mounted`；无战场骑乘事实不得为真；带主动伤害的突进 / 跃击路线必须 `attack`，不因位移字段判 `movement`，防守反击例外仍按 §4.10 | 失败 |
| V44 | 每门内功必须填 `baseQiPerTick 4..32`、`baseQiSpeedBp 5000..16000`、恰 9 项且非递减的 `layerCurveBp 4000..14000`、`fluxTrainBase 1..8`、固定 `{acupoint:64,meridian:96}`；全部为安全整数 | 失败 |
| V45 | 战斗只用 `practiceLayer=min(effLayer,9)`，03 资源只用 `resourceLayer=min(trueLayer,9)`；辅运不另产气，10 重与 9 重的 AR-19 基础投影相等 | 失败 |
| V46 | 每个 `MoveDef` 规范化后必须有 `hitZone`；擒拿默认 hand、摔跤 / 腿法默认 leg、其余 body；偏离默认必须有非空 `hitZoneReason`。固定 `targetAcupoints` 必须属于该区且去重 | 失败 |
| V47 | `penetratingQi:true` 只允许玄级及以上内功驱动、`projection:true` 且含伤害段的招式；不得与旧 `bf_toujin` 自动互转 | 失败 |
| V48 | `acupointStrike.level∈[1,9]`、`occupyingQiBp∈[1,10000]`；必须有合法穴位候选和内劲输出，既有 `bf_xueweishoufeng.value.level` 若并存必须相等 | 失败 |
| V49 | 内功 `digestRatioBp` 为 10000–100000 安全整数、缺省 10000；`reverseQi` 为 bool 且只允许内功，首版 `sk_douzhuan` 建议为 true；同 cause 不得同时走反引与整招镜返 | 失败 |
| V50 | `autoTargetCap` 只允许整数 1–4；`aoe_single` 必须规范化为 1，其他范围缺省 2；字段不得改变手动 `HexShape`、`AF` 或伤害倍率 | 失败 |

### 16.2 金标准测试用例

| # | 输入 | 期望 |
|---|---|---|
| T1 | 降龙十八掌真实 10 重、完整天上来源，外来进入普通鹿鼎，`Ce44` | `effGrade=8`、`effLayer=8`、绝对威力因子 `G×L=2.2×1.3=2.86`；Z1 仅再除一次 `P_ref` |
| T2 | 天阶武学在天龙，`Ce35`；另令现影生效 | 常态和现影均受 `gateCap=8`，现影不绕过修为门槛 |
| T3 | `ExpToNext(12,9)`、`ExpToNext(1,1)`、`ExpToNext(8,5)` | `7,200 / 100 / 1,360` |
| T4 | 主运调和＋辅运阳；主运阳＋辅运阴无桥接；再装易筋经桥接 | `auxRatio=0.40 / 0.25 / 0.40` |
| T5 | 主运阳/阴/调和分别用阳招；调和用调和招与中性招 | Z5 `+12% / −12% / +6% / +12% / +2%` |
| T6 | `MPREF` 查 `Ce1/Ce35/Ce70`；`mpCost=0.08`、无修饰 | 引用 design/03 得 `213/4,697/28,887`；`Ce35` 耗内 `round(0.08×4697)=376` |
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
| T17 | 太祖长拳 `Ce35/Ce70/Ce5` | `G_eff=1.56/2.064/1.20`（表中展示值按两位小数为 1.56/2.06/1.20） |
| T18 | 降龙绝招：天上 10 重并有大成；天上 7 重无大成 | `3.5×1.5×2.00×1.20=12.60`；`3.5×1.2×2.00=8.40` |
| T19 | 地阶残页 4/6 页 | `sourceCap=ceil(10×4/6)=7` |
| T20 | 天上＋天中武学融会贯通，随后进入普通低武 | 产物 `grade=9`、`trueLayer=5`；半额压制 `ceil(4/2)=2` 后 `effGrade=7` |
| T21 | 九阳神雕闻经事件；倚天取得完整来源 | 前者仅图鉴 `heard`＋`jiuyang_echo`，无 `SkillState`；后者才创建可学习来源 |
| T22 | 解析内功缺 `nature`、空 `meridians`、含非法 `mer_x`、重复同一正式经脉、辅运分支不在主清单 | 缺性质失败；空专精合法、回退调和且不代表全专精；非法或重复经脉失败；非法辅运子集失败 |
| T40 | 主修 `[督脉,手阳明]` 声明阳；`[任脉,手太阴]` 声明阴；`[任脉,督脉]`、`[冲脉,带脉]` 与空数组声明调和；另把前两项声明互换 | 前五项按 §5.3 推导为 `yang/yin/harmony/harmony/harmony` 并通过；互换的两项失败。正 / 逆周天字段变化不改变结果 |
| T23 | 解析 `curveLos`、七个图鉴条件键及未知 `condition.foo` | 正式钩子/条件全部通过；未知键构建失败；`night`/`moonlitTile` 不允许内容侧改写时钟或场景标签 |
| T24 | 十八掌连环 `recovery=1200`、路线 10 段且每段 80 CT；标准对标准；另把路线 `purpose` 改为 defense | `flowCt=800`、总收招 `2000`；`power` 仍为 2.00，Z4M/Z5M 都是 10000；错误用途构建失败 |
| T25 | 防守触发只填 `routeOnTriggerRef`；攻击招同时填第二条主路线；路线第 4 段卡住 | 前者合法且走 defense；第二种失败；卡住只计前 4 段 CT，不以完成段重算 `power` |
| T26 | 调和内功引用 `txp_harmony_supreme`，`innerGuard={enabled:true,reflectBp:0}`；阳内功误引该档；另填 `reflectBp=2001` | 第一种可解析且 `tiaoxi` 不另耗内；后两种失败；来袭 `breakGuardBp` 由事件输入，护体结果不写入 `SkillState` |
| T27 | 轻功武学缺 `movementRouteRef`、引用 attack 路线、引用 movement 路线；标准对标准 | 前两种失败；后一种合法且 `meridianSpeedBp=10000`，基础轻功值与门禁输入不变 |
| T28 | 依次校验 grade 1–12 的绝招数 `0/0/0/0/0/1/1/1–2/2/2/2–3/3`；再令玄中有 1 项、天上只有 2 项 | 前十二组通过；后两组均构建失败 |
| T29 | 降龙三绝招：7 重连环、9 重神龙、10 重震惊；连环在 F2 原子支付后检查冷却；下一次自身行动尝试神龙；该行动改用其他武学后再选连环；随后用同门普通掌再选连环 | F2 设置为 1 且当次 E2 后仍为 1；下一自身行动选神龙失败（共享冷却），该行动结束后清零；冷却后重复连环失败；成功结算同门普通掌清重复限制后连环合法；三招各解析不同路线 |
| T30 | 构建 `sk_bailingbu`：先不生成局部招，再生成 `basic_movement` 但路线 `moveRef` 指向别门，最后改为 `sk_bailingbu#basic_movement` 且用途 movement | 前两次拒绝构建；最后通过；局部招不进入按钮、招式总数、栏位或绝招配额 |
| T31 | 施加穴位受封 9 级：先缺 `targetAcupoint`，再取合法主要路线关键穴且 `dur=1`；另尝试直接施加迟滞视图 | 前者失败；合法项生成 `acupointSeal` 载荷，含实际 `source` 且 `remainingOwnActions=turnsLeft=1`；直接 `applyBuff(bf_jingqizhizhi)` 失败 |
| T32 | 九阳 1–6 重、7 / 9 / 10 重逐层检查可施放招式 | 1–6 重无主动招式并显示说明；7 重仅九阳普照，9 重再有九阳护体，10 重再有九阳疗伤；不自动生成补位招式 |
| T33 | 弹指外放招：`range.max=5`、三档均单体；合法强档；再删第三项、令 `[0]≠aoe`、将伤害段改为非 projected | 合法档只读得射程 5 / 7 / 9；后三种均构建失败，不在内容侧补默认 |
| T34 | 独孤同门含一记剑气外放与一记近身破剑；尝试按 `SkillDef` 或 `delivery:ranged` 批量补标 | 只显式剑气招为外放；近身招不变，批量推断构建失败；剑气表现保留“原创扩展”标注 |
| T35 | 降龙外放招路线命中 `ap_shoujueyin_laogong`；改成完全不含 21 端点白名单；敌方加载同一招 | 前者通过、后者失败；敌方与玩家得到同一静态字段和档位边界 |
| T36 | 构建降龙十八掌并统计逐招外放字段；再分别读取三绝招的 0 / 1 / 2 档范围 | 19 个具名动作中恰有 18 个外放，唯一例外为纯蓄力“潜龙勿用”；连环为 60° 锥 `r3/r4/r5`，神龙为 120° 锥 `r1/r2/r3`，震惊为 `around/disk r2/disk r3`，且三者 0 档均与基础 `aoe` 深相等 |
| T37 | 同一 `sonic && projection:true` 伤害招分别选 0 / 1 / 2 档 | 0 档 `projectionBoostActive=false`、普通 Z5M、基础范围、0 增耗；1 / 2 档为 true、使用外放 Z5M 与 200 / 400 bp MPREF 增耗；三档均按 `wIn/wOut` 进入 AR-19 抵消上限，不读旧 40% |
| T38 | 加载 `mv_dashouyin_dashouyin`，依次审计跃迁与落点掌风 | 跃迁只改位置且无伤害事件；落点只生成一个 `projected` 外放伤害段与一次 Z5M；不存在位移伤害段或第二条 attack 路线 |
| T39 | 同时扫描门派册和十四册补录册，并按唯一 `sk_*` 汇总普通天阶 | 任一漏册或重复定义失败；天上 / 天中 / 天下为 9 / 18 / 32，合计 `9+18+32=59`；低三阶总量在最终重算前只报告“未收口”而不回退到 1,138 |
| T41 | 绝回罕见条件、夜隙夜间条件、反常姿态门槛；均使用标准绝招代价 | 依 §4.8 三例分别为 `3.90 / 3.45 / 2.90`；不重复计默认 +2% 耗内、1200 CT 或共享冷却；旧加法 3.30 不能通过 |
| T42 | `rawPower=2.8325`、`2.175`；另以 `3.90` 原值配置 `3.30`，或增加“条件折价0.60” | 默认取 `2.85 / 2.20`；`2.175→2.15` 须登记手调 `−0.025`；后两种失败，不能先取整再叠手调额度 |
| T43 | 普通入场下马目标；合法特殊场景骑乘目标；陷阵以 `power=2.85` 带主动伤害突进 | `targetHasTag:mounted` 前两者为 false / true；陷阵主路线必须 `attack`，不另提交 movement 路线；单标签数组形式失败 |
| T44 | 默认 6 品内功：`baseQiPerTick=16,baseQiSpeedBp=10000`，曲线第 6 项 8750；有效 6 重 | 交 21 后 `productionPerTick=floor(16×8750/10000)=14`、`qiSpeedBp=8750` |
| T45 | 同一门内功 `trueLayer=10,effLayer=10`；分别与 9 重比较资源、产气、速度 | 两者 `resourceLayer/practiceLayer=9/9`，三类 AR-19 基础贡献逐项相同；圆满招式 / 被动仍按第 10 重 |
| T46 | 擒拿 / 腿法 / 普通掌法未填命中区；普通掌法显式改 hand 但无理由 | 前三者规范化为 hand / leg / body；无理由覆写失败 |
| T47 | 玄级外放伤害招标 `penetratingQi`；同招改黄级、非外放或纯支援 | 第一项通过；后三项均构建失败，运行时仍由 21 比较双方当前 MP |
| T48 | 6 级打穴、`occupyingQiBp=7500`、`releasedQi=40`；候选穴两个 | 占穴量 `floor(40×7500/10000)=30`；按显式候选顺序取首个合法穴，严重度仍为 `dxl_lv06` |
| T49 | 普通来源 / 幻阴指来源各注入 20 气；斗转反引 20 气 | 消化分别需 20 / 200 MP；反引消耗 20 MP 后仅得 `floor(20×5000/10000)=10` 临时反击气 |

---

## 17. 待决事项 / 依赖

### 17.1 替下游给出的建议值

本节保留旧 D 编号以便追溯。已经成为正式接口的条目写“已解决”；尚待归属文档落盘或同步的条目继续保留，不把建议冒充为对方已实现。

| # | 下游文档 | 本文输出 / 建议值 | 状态与落点 |
|---|---|---|---|
| D3 | design/04 | `P_actual = G × L(n) × move.power × Mod_armed × Mod_special` 是绝对威力；只在 Z1 除一次 `P_ref`；`wOut/wIn` 合成攻击 | **已解决**：04 §4.1 已采用；本文见 §2.7（C01） |
| D4 | design/04 | Z5：阳/阴主运同性质 `+12%`、异性质 `−12%`；调和主运对阳/阴 `+6%`、调和 `+12%`、中性 `+2%`；破 X 用 `poBonus/poParry` | **已解决**：04 §4.5 已同步调和 `+6%`；本文见 §5.3 |
| D5 | design/04 | 多段逐段判定；绝招被招架时按 04 的 Z9；撞墙 `floor(0.20×D_hit)`、被撞单位 `floor(0.10×D_hit)`，每次位移至多一次且不免费眩晕 | **已解决**：04 §7.4 已采用 C11；本文见 §4.5、§4.8 |
| D6 | design/06 | 武学只引用 `bf_*`，Buff 本体归 06；`bf_jianshi`、`bf_shouque` 已正式存在，不是缺口；招式预算的 `cost_buff` 在 06 给出价值表后再校准 | **已解决**：目录已闭合；06 的 `bf_jitui` 已改用 `D_hit` 且不自动眩晕，`bf_pibei` 已统一为 20% 恢复阈值（C11） |
| D7 | design/07 | 建立 `set_gaibang_bangzhu`、`set_quanzhen_beidou`、`set_shaolin_luohan` 等唯一成员表，并与本文/图鉴 `setTags` 双向闭合；有效品阶按 C22 取已计件成员中位数 | **已解决**：`design/07` 已冻结 44 套，正式关系为 305 条武学成员＋1 条装备成员；成员与图鉴 / 装备 `setTags` 双向不对称为 0 |
| D15 | chapters/*、design/18 | 把示例中的 `q_0N_*_91` 与占位 NPC 引用替换为各书界正式任务、静态 NPC 或组织/设施 role slot；神雕九阳只写图鉴 `heard` 与 `jiuyang_echo` | **已解决（规划数据）：**任务来源已替换为正式 ID；无名教头、院堂与“三代弟子”均按 18 §10 与 `catalog/npcs-facilities.md` 使用角色槽，不再伪装静态 `npc_*`；具体运行时实例仍由内容构建生成 |
| D16 | tech/05 | 实现 §4.11 的效果钩子、共享 `HexShape/YunjinMode`、`Reqs.skills/anyOf`、§16 的 Zod/lint 与 T1–T23 金标准 | **部分已解决**：tech/05 已定共享战斗类型和玩法 core 边界；内容 schema、完整效果钩子与本文全部金标准仍待实现，旧“§15 lint”引用已更正为 §16 |
| D17 | design/03、catalog | `dualWield:int[0,10]` 只取可用左右互搏的 `effLayer`；左右互搏为 `misc/mind`；弓箭、火器武学为 `hidden/hidden` | **已解决**：03 与图鉴已同步 0–10 整数、`misc/mind` 与 `hiddenKind: bow/gun`；不得由副手装备赋值（C16；§2.2、§6.2、§9.3.2） |
| D18 | catalog | `Reqs` 使用 `skills` 与 `prereq[].anyOf`；外层 AND、组内 OR，来源覆写按顶层字段整体替换 | **本文已定稿，图鉴迁移继续**：结构与 lint 见 §2.4、§7.3、§16（C17） |
| D19 | design/15 | `inner.meridians` 的 `mer_renmai/mer_dumai` 是易筋经、九阳示例的专精映射；冲穴读取有效品阶、有效层数、真实 `mpMax`、主运性质与辅运折算 | **已解决**：15 §2、§4 已冻结 20 个正式 ID 和单门自身贡献 ×1.20；05 已收口 `MeridianId` 与 V4/T22，示例映射保持 **【建议值】**，见 §5.7–§5.8、§13.3–§13.4 |
| D20 | design/20 | 后人、宝藏/遗迹、上中下残本、关键信物与合成全本只可生成或升级 `LearnSource/sourceGrade/sourceCap`，不得与本文 `fragment`（书眠残篇）或 design/02 `partial`（残承）合并 | **已解决**：20 已落盘并冻结三类传承来源、事件载荷与合成结果；本文 §7 已同步消费其接口 |
| D21 | design/10、catalog | `WeaponReq` 消费 `hands`/成对/副手规则，暗器改用 `hiddenKind`，特殊装备兼容用 `offHand/altItems`；丹药 `sxpGrant.pctNext` 黄/玄/地/天为 `0.10/0.20/0.35/0.50` | **已解决（接口）**：10 §2–§3、§8.2 已定枚举和档位，05 已补 schema/§6.2/V3；具体图鉴条目仍须逐项迁移并解析装备 ID |
| D22 | design/21、武学图鉴 | `MoveDef` 用 `meridianRouteRef` / `routeOnTriggerRef` 引用 attack / defense / movement 路线；绝招继续以 `ultimate` 为唯一真值；轻功武学用 `movementRouteRef` | **已解决（见 Canon v1.3 澄清、design/21 §4、§12）**：本文 §2.1、§2.9、§4.1–§4.2.1、§4.8–§4.10、V27–V33 已定；21 拥有 schema、算法、共享模板与示例，各图鉴拥有具体武学实例 |
| D23 | design/21、design/09、武学图鉴 | 内功 `breathProfileRef` 引用 `txp_*`；调息并入既有 `yunjin:tiaoxi`，基础 1000 CT 且经脉处理不另耗内；战斗调息不推进永久冲穴 | **已解决（见 Canon v1.3 澄清、design/21 §10、§12）**：本文 §5.7、§5.9–§5.10 已采用；共享档案 / 示例归 21，九阳、易筋等逐武学档案由所属图鉴定义，05 仅镜像引用 |
| D24 | design/21、design/04、design/06 | 内功通过 `innerGuard` 声明护体路线启用与既有反震；来袭侧以 `OutwardQiInput.breakGuardBp` 投影破气；settle 顺序为护体真气 → AR-19 外放抵消 → `mpGuard` → 气血 | **已解决并由 AR-19 修订（05 接口，见 design/21 §4.8）**：字段和边界见 §5.10；旧类别适用率、MP 换伤与击穿状态仅供协议 2，最终伤害链 / Buff 由 04 / 06 同步 |
| D25 | catalog/skills-yitian | 九阳旧 `innerGuard.reflectBp:1200` 是“他横由他横”10 重上限值，违反本文 §5.10；应改为 0 / 省略，由 `ps_jiuyang_taheng` 按当前有效层数投影，避免双算 | **已解决**：`catalog/skills-yitian` §10.6 已填 0 并明确按有效层数投影；本次复核 §13.4 继续省略固定反震值 |
| D26 | 全部武学图鉴、tech/04、lint | 绝招条件按 §4.8 唯一乘法式；任意持械常见 +0.15，指定兵器罕见 +0.30；门槛型必须明示 | **规则已解决，图鉴迁移 / 自动预算 lint 未完成**：重算表见 `tools/agents/reports/NAuF-rules.md` §7；绝回≤40%罕见档沿既有卡作 **【建议值】**，作者确认入口 O9 |
| D27 | 通行图鉴、design/09、chapters/10 | 斩马用 `targetHasTag:mounted`；陷阵伤害路线改 `attack` | **规则已解决，实例待同步**：§4.2.1、§4.11；不扩普通战斗的骑乘玩法，具体特殊场景须由归属文档授权 |
| D28 | 少林图鉴、design/09、design/10 | 伤科 `med=30`、七重配方 `alchemy=40`、罗汉阵 `formation=30`、伏魔圈 `formation=50` | **接口已解决，数值仍为【建议值】**：伤科技艺与两阵法的学习软门槛按既有 `Reqs` 处理；`alchemy=40` 只解锁七重配方，不变成整门学习硬门槛。战斗阵法与配方规则仍归 09 / 10，未做实玩校准，不冒充正式定价 |
| D29 | 五绝 / 少林等音功图鉴 | NR3 建议所有音功显式写 `voice` | **已解决（沿现行字段契约）**：§4.2.2 默认 false 不变；人声发劲必须显式 true，持乐器可显式 false，不引入第二判定字段；逐招标记与端点仍交图鉴核查 |
| D30 | 五岳 / 少林 / 倚天 / 五绝 / 道家图鉴、design/06、tech/04 | 特殊钩子成本、混合招伤害子效果与存量几何预算 | **部分已解决**：§13.2 无招收招同步 1200，破箭 / 破气按门槛型保留；破气 / 无招特殊成本 0.02 / 0.07、九阳普照群盾驱散成本 0.45 仍为图鉴既有 **【建议值】**，须由效果价值归属校准。倒拽按单目标远程拉拽改 2.45，少林镜像待同步；九阳普照敌伤投送 / 招架字段未定，当前 1.80 不签出为预算已验证。七星 / 三清 / 推山 / 捉影 / 时乘的明确旧 AF 已复算为 0.90 / 1.05 / 1.00 / 1.00 / 1.00，镜像待同步；鱼跃 / 飞龙的高差与溅射成本未闭合，不按旧 leap AF 签出 |
| D31 | design/03、15、21、tech/04、全部内功图鉴 | 输出 `practiceLayer/resourceLayer` 与 `InnerDef` 五类 AR-19 参数；默认曲线 `5000+625n`，穴 / 脉硬上限 64 / 96 | **已解决（规则 / schema）**：§3.0、§5.8.1、V44–V45；逐内功卡未填时按确定默认编译并报警，后续图鉴任务应物化字段 |
| D32 | design/21、09、06、tech/04、全部武学图鉴 | `MoveDef.hitZone/targetAcupoints/acupointStrike/penetratingQi` 与 `InnerDef.digestRatioBp/reverseQi` | **已解决（规则 / schema）**：§4.1、§4.2.3、§5.8.1、V46–V49；本任务不改图鉴，逐招 / 逐内功物化与正式示例值仍待后续图鉴任务 |

### 17.2 本文依赖的上游事实

| # | 上游文档 | 本文消费的事实 | 状态与本文位置 |
|---|---|---|---|
| D1 | design/03 | `MPREF(Ce)=STD(Ce).mpMax` 兼容列；当前 `Ce1/Ce35/Ce70` 锚点为 `213/4,697/28,887` | **已解决（AR-19 迁移）**：耗内始终查 03，不保存旧 4,559，也不把 `MPREF` 当真实资源；§4.1、§16 T6（C02） |
| D2 | design/03 | `InnerContribution` 按 `innerScale(n)=0.30+0.07n` 与主/辅比例合成；技艺采用十项 `ArtId`；杂学修炼以 `wis` 为速度资质 | **已解决**：03 已确认；§2.3、§5.5、§8.1 |
| D8 | design/08 | `jump`、高差/视线标签、坠落/落水、六角地形与突进路径门禁 | **已解决**：本文只引用；§4.4–§4.5 |
| D9 | design/09 | pointy-top 六角距离、`HexShape`、AF、CT/收招、反击/合击时序、运劲与 AI；“双剑合璧”搭档 CT −300 | **已解决**：按 09 v2.0 消费，不再使用曼哈顿距离；§4、§5.9、§9.3 |
| D10 | design/10 | 奇门 `kinds`、双手/成对兵器、暗器与箭药、丹药 `sxpGrant/sxpBuff`、秘籍/残页命名 | **已解决**：大还丹 `pctNext=0.35`、补气丹 `×1.15×5 场`；§6.2、§8.5 |
| D11 | design/12、design/16、design/17、design/18 | 12 输出任务与门派玩法，17 输出门派名录/时代/称谓，18 输出 NPC/好感/羁绊/师徒事实，16 输出贡献以外的银两/资源成本、月钱与营生 | **已解决**：四份归属文档均已落盘，12 §6.7 已登记按 `sourceKey` 去重合并的单一 `sectTrainingMult`；本文 §8.1 只乘一次，不复制门派状态机。闭关“盘缠”仍由经济归属文档定价 |
| D12 | design/13 | `dm_sxp`、旧角色经验迁移、武学经验分账、终局 `Ce70 gateCap`、断尘 / 自创结局修饰 | **已解决（本文侧）**：生产成长只写具体武学 / 经脉事实，§3.4、§8.1–§8.2、§9.1.4、§12；13 仍需同步删除角色经验真值 |
| D13 | design/02 | `sourceGrade/sourceCap`、`trueLayer/effLayer`、`nativeTo`、积蕴、印证、残篇忆起 ×2 及自创半额压制 | **已解决**：02 已改用 `L(n)=0.5+0.1n`，天级 GF 相对地上约 `1.21/1.37/1.58`，不另乘 ×2；§2.6、§3、§7.8–§7.9、§12.3 |
| D14 | design/11、design/19 | 安全点、观景点、解谜场景、时代图层、地图坐标与奖励挂点 | **已解决（接口）**：11 已定 `safePoint/vista/inspect` 等 POI、休整和时代层，19 已定权威坐标/地图资产；05 只消费事件与地点引用，闭关倍率由章节事件载荷显式给出，不再要求不存在的 `seclusionSpot` 字段。见 §7.6、§8.3、§8.6 |
| D22-U | design/21、武学图鉴 | 战斗动态河流、路线 schema / 算法 / 共享模板、攻防独立乘区、护体内劲、经脉速度、擒拿 / 点穴、调息参数与每单位实例；逐武学路线 / 调息实例 | **已解决（上游与内容归属已定）**：全文统一引用 21 v2.8.1 §2–§12；具体武学实例引用所属图鉴。05 不保存节点运行态、乘区曲线或模拟器 RNG |

既有跨文档评审记录继续有效：design/02 的“核心武学第一绝招 `unlock≤7`”已采纳（§3.5、§4.8、V9）；其旧 `L(n)=0.5+0.05n` 与“天级经验统一为地上 ×2”均未采纳，02 当前正文已同步。design/03 的 `trainMul`、学习门槛 `5g−5`、`MPREF` 与 `mpRegen` 接口已采纳；旧 `dualWield` 0–3 交办已解决，03 已按本文 §9.3.2 / Canon V12-06 使用 0–10。调和相性已由 design/04 §4.5 接收。

### 17.3 对基准的修改提案

| # | 提案 | 状态 / 理由 |
|---|---|---|
| P-1 | 高武完整原生天级池由每书界 6–15 改为 6–16 | **历史提案已采纳、后被 Canon v1.6 V16-02 覆盖**：v1.1 V11-17 曾放宽至 6–16；作者扩容后现行上限为 6–18，神雕完整原生池为 18。§14.4 已按现行口径分列完整池与残承 |
| P-2 | §6 登记 `mpRegen`，所有来源合计上限 6% | **已采纳（v1.1 V11-19）**：§5.5 按真实 `mpMax` 回复 |
| P-3 | 自创武学最高地上 9，外来压制基数取 `ceil(S/2)` 且与天书共用下限 | **已采纳（v1.1 V11-30；作者决定 P37）**：§12.3 已执行；不再写全额压制 |
| P-4 | §12 登记 `ps_`、`aoe_`、`vow_`、`it_miji_`、`it_canye_` | **已采纳（v1.1 V11-04）**：§15.2 只登记本文实际使用项 |
| P-5 | 有效层数截断、真实层数保留；达到书界层数上限后的新增经验转积蕴 | **已采纳（v1.1 V11-10、V11-R01）**：§3.3–§3.4 已区分修为/来源瓶颈 |
| P-6 | §6 把 `dualWield（布尔/等级）` 收敛为整数 0–10：未装配可用左右互搏为 0，否则等于其 `effLayer` | **已解决（Canon v1.2 V12-06）**：03 与本文均已按 0–10 执行，不再保留旧 0–3 活动口径 |
| P-7 | §7 明写左右互搏为杂学·心神；弓箭与火器武学为暗器、非核心且不可书眠携带，装备持用另查 10 | **已解决（Canon v1.2 V12-06、作者 P19）**：避免 `dual`/`bow` 平行分类；§2.2 已执行 |
| P-8 | §0、§8 把“斜 45° 等距网格战棋”改为“六角格战棋；斜 45° 仅指相机观感”，§18 将六角范围模板唯一归属由 05 移至 09 | **已解决（Canon v1.2 V12-07）**：§4.3 已按六角格引用 09，旧冲突保留为历史追溯 |
| P-9 | §6/§9 增补：每门内功必须显式 `mpNature/nature`；调和主运无惩罚，对阳/阴 `+6%`、调和 `+12%`、中性 `+2%` | **已解决（Canon v1.2 V12-06）**：§5.3 已执行；静态性质进一步服从 v1.8 AR-18 |
| P-10 | §18 增登记 design/15 的穴道/经脉/冲穴/周天、design/16 的资源/家业/营生归属，并把相关经济定义从 12 分流到 16 | **已解决（Canon v1.2 V12-11）**：本文仅保留 §5.8 和修炼成本接口 |
| P-11 | 在基准数量约束登记 AR-01：原为天阶封闭 51 门、全目录目标 1,100–1,150，品阶约 1:3:9:9 | **已被 Canon v1.6 V16-01 部分取代**：11 册 `51/169/459/459=1,138` 只保留为基线；现行天阶扩容为 59，低三阶与含补录总量待最终重算 |
| P-12 | Canon §12 登记 `mfr_* / qnl_* / dxl_* / txp_*`，§18 登记 21 对战斗经脉、攻防 / 轻功路线、护体内劲、控制与调息的唯一归属 | **已采纳（v1.3 V13-05～06、V13-C01）**：21 拥有 schema、算法、共享模板与示例；各武学图鉴拥有具体武学的 `mfr_*` / `txp_*` 实例 |
| P-13 | Canon §9 接受 Z4M / Z5M 与护体内劲插入点，§11 接受经脉速度接口，§19 接受一单位一实例 / 唯一 `battle` RNG / golden | **已采纳（v1.3 V13-02～04、V13-07）**：本文只消费全局结算顺序与确定性契约；具体数值仍由 21 唯一拥有 |
| P-14 | Canon §4 / §8 登记十二品绝招数量 `0/0/0/0/0/1/1/1–2/2/2/2–3/3`，以及多绝招共享气势、同门共享 1 次自身行动冷却、不得连续重复同一绝招 | **已采纳（v1.4 V14-01～02）**：05 §3.5、§4.8 与 V9 / V32 已执行；战斗候选、AI 与表现分别由 09 / 14 消费 |
| P-15 | Canon §8 / §9 / §18 登记 AR-16：逐招外放的 0 / 1 / 2 档固定为射程 `+0/+2/+4`、范围模板第 0 / 1 / 2 项、额外耗内 `0/2%/4% MPREF`；外放曲线在同一 Z5M 替代普通曲线 | **已采纳（v1.5 V15-02～04）**：字段与逐招判定见 §4.1、§4.2.2；算法、端点与曲线唯一见 design/21 §4.4.1，09 / 14 / tech/04 / tech/05 分别消费 |
| P-16 | Canon 登记天阶扩容、补录正式定义源及音功 / 大手印边界 | **已采纳（v1.6 V16-01～04）**：§11.1、§14、V38～V40 已同步；算法仍唯一见 `design/21` §4.4.1 |
| P-17 | Canon 登记 AR-18：内功阴阳按主修经脉判定，正逆周天不决定阴阳 | **已采纳（v1.8 V18-01～02）**：§5.3 已采用；体段 / 出口段与掌法动作穴唯一见 `design/21` §2.4、§4.3.1 |
| P-18 | Canon 登记 AR-19 的 1–9 资源 / 战斗熟练层、内功产气 / 速度 / 通量锻炼字段，第 10 重只保留圆满能力 | **待基准同步**：避免旧十重体系让资源与运气多算一层；规则已在 §3.0、§5.8.1 落盘 |
| P-19 | Canon §8 / §18 登记招式命中区、透劲 / 打穴候选字段，以及内功 `digestRatioBp/reverseQi` | **待基准同步**：字段所有权在 05，运行算法与动态真值在 21，避免图鉴靠招名推断或 Buff 重复保存 |

AR-01 的 C3 历史同步已完成：§14 以 920 门快照为起点形成 11 册 1,138 门基线，并把四个 CX 扩充缺口与十四书界池审计分别列明。AR-17 已按作者决定把普通天阶扩为 59；含补录的地 / 玄 / 黄与全目录总量待 NXfixC 收口后由 NAu-final 重算。
经脉路线 / 调息档案仍是依附既有武学的配置对象，不计作新武学；数量变化只来自已登记的补录武学定义。

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

作者决定 G1 已规定空白项采用默认值。原 O1–O5 不删除，改为已解决追溯；本轮新增的招式下限与九阳前六重体验问题先采用默认值继续落盘：

| # | 原问题 | 已采用决定 | 状态与落点 |
|---|---|---|---|
| O1 / P06 | 易筋经内力性质 | **调和**；本作分类为原创扩展 | **已解决**：§13.3、AR-02 |
| O2 / P07 | 断尘之誓呈现尺度 | 保留经修订版核对后的首句，不作身体画面描写；核对前只用释义 | **已解决**：§9.1.4；逐字核对留 K5 |
| O3 / P08 | 融会贯通开放时点与数量 | 倚天结束后开放，全游戏至多 3 门 | **已解决**：§12.1、§12.4 |
| O4 / P09 | 天阶武学能否观摩偷学 | 默认不可；只有 catalog 逐门 `observable:true` 的有据例外 | **已解决**：§7.1、§7.4、V14 |
| O5 / P10 | 九阳能否在神雕完整学习 | 不能；神雕只作 `heard` 伏笔，倚天才创建学习来源 | **已解决**：§13.4、V24、T21；文本边界留 K7 |
| O6 | 绝招由既有招式升格后，天 / 地阶非内功武学的“普通招式下限”是否仍按不含绝招计 | 默认按“普通招式＋绝招”的可施放招式总数计；完整卡仍不足时逐卡登记豁免，不为凑数编招 | **待作者确认**：§3.5、V7；若改为纯普通招式下限，须由各图鉴补豁免或有据招式并重跑全库校验 |
| O7 | 九阳神功是否允许 1–6 重没有主动招式 | 默认允许并保留图鉴三绝招现状；低层只提供被动 / 内功贡献，不自动生成主动招 | **待作者确认**：§13.4、T32；若否，须先确定有原著依据或明确标原创扩展的招式，不在本轮臆造 |
| O8 / AR-18a | 冲脉、带脉是否参加内功主修经脉性质投票 | 默认保持两脉 `harmony` 且不投票；只有冲 / 带或空专精时回退调和 | **待作者确认**：§5.3、§5.3.1；若改为逐脉参与，须先定阴阳归属并重跑完整 265 卡覆盖审计（当前检查器仅识别其中 254 卡，另 11 卡须补查） |
| O9 | 绝招条件是否统一乘法；是否保留显式门槛型 | **默认按 §4.8**：加成型 +0.15 / +0.30 进入 `3.00×AF×(1+Σadj)`；允许明示门槛型 0；终值 half-up 到 0.05，手调相对 raw 总偏差 ≤0.05；禁止反扣条件收益 | **需作者确认，先执行**：未找到专门作者决定；图鉴按 D26 / 本任务报告逐卡迁移，不以确认未到暂停；任意持械常见档，绝回≤40%暂沿既有罕见判价 |
| O10 | 尚无统一价表的特殊钩子 / 组合收益如何配表 | 默认保留逐效果 **【建议值】** 并逐卡列出处；不为填平旧倍率新造“高可达 / 条件预扣”成本；未知生产键继续失败 | **开放**：承接 F1n-26、C1b.R、RCx B-2/B-3；合奏、装备协同与特殊代价 schema 尚未统一，具体遗留见 D30 与报告 §6 / §7 |
| O11 | 无形剑气是否在 `sonic` 下另保留“不穿墙” | 默认沿 §4.4 的 `sonic` 无视阻挡，不新增视线例外字段 | **需作者确认**：承接五岳 WU-O09 / NXfix-wuyue；若作者保留不穿墙，由 09 / 技术 schema 先定义可执行例外再回填图鉴，不能仅改文案 |
| O12 | 逐门内功是否全部手配 AR-19 五类参数 | 默认先按 §5.8.1 的品阶公式确定性编译并报警；核心 / 天阶内功由后续图鉴任务物化后才可消警 | **开放但不阻塞规则**：本任务不改武学图鉴；缺字段不得退回 `mpMax` 或随机推导 |
| O13 | `digestRatioBp` 示例值与斗转反引标记是否直接写入图鉴 | 默认九阳 / 化功 / 北冥 10000、幻阴指 100000，`sk_douzhuan.reverseQi=true`，均为（原创扩展）且待逐卡确认 | **开放但不阻塞 schema**：本任务不改武学图鉴；构建器可用默认 10000，但反引不可按名称猜测 |
| O14 | 存量招式的 `hitZone` 是否全部物化 | 默认构建期按 §4.2.3 确定推导并报警；擒拿 hand、摔跤 / 腿法 leg、其余 body，覆写必须留理由 | **开放但不阻塞迁移**：后续图鉴任务逐卡物化；生产运行结果必须保存规范化值 |

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
| P45 | 速战武学经验 ×0.5；旧角色经验 ×0.8 仅作 v2 回放迁移 | §8.2 |
| P49 | 射雕/神雕少林以背景和有限入门为主；射雕保留易筋完整线，神雕不新增易筋完整来源 | §7.1、§13.3 |

AR-14 的开放项沿用 21 §18.5，不另起第二套决定：四个新前缀已按 Canon v1.3 登记；调息经脉处理默认不另耗内；9 级点穴默认不能自行调息解；战斗胀损默认战后深度调息清除；待机轻防路线默认 ≤3 段 / 240 CT；同场速度参考默认取可选敌方经脉强度中位数；护体内劲默认不反震。上述默认若被作者改动，05 只迁移引用 / 字段，不复制修改 21 的算法。

AR-14 数量口径的“九品玄”已解决：作者于 2026-09-27 确认按玄上（grade 6）执行，因此玄上 1 个、玄中 / 玄下 0 个（见 §3.5、V9 / T28）。图鉴逐门补足已由 NU1–NU4 完成，本文示例已同步其最终实例；另有 O6 / O7 两项体验口径待作者确认。
