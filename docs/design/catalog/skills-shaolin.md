# 门派武学图鉴 · 少林（skills-shaolin）

> **版本**：v1.1（审校修订，2026-09-26）。
> **归属（基准 §18）**：`design/catalog/skills-*.md`——门派武学图鉴。本文定义少林派（嵩山少林）、南少林及其旁支武学；门派制度、Buff、阵法、套装与书界投放只登记接口。
> **上游**：`docs/decisions/author-requirements.md` AR-01/02/07/08；`docs/decisions/author-decisions.md` P06/P09/P32/P47/P49；`docs/00-canon.md` v1.1（§2–§4、§6–§7、§12–§13、§16、§18、§20）；`docs/decisions/rulings-v1.md` C12/C14/C17/C22/C23；`design/03`、`design/05`。
> **引用而不重定义**：属性与技艺 ID 见 `design/03`；武学字段、招式预算、层数、内功与学习门槛见 `design/05`；Buff 目录见 `design/06`；套装规则与最终效果见 `design/07`；阵法与合击见 `design/09`；门派制度见 `design/12` 与 `design/17`；冲穴见 `design/15`；资源、月钱与营生见 `design/16`；时代地图见 `design/11`。`sk_yijinjing`、`sk_longzhaoshou`、`sk_luohanquan`、`sk_tieshazhang` 的完整数据以 `design/05` 为准，本文只给摘要与需同步接口。
> **标注约定**：**（原创扩展）**＝原著没有；**（待考）**＝须按三联／广州修订版逐字核对且写明书名、人物或情节；**（待核实）**＝版本、API 等技术事实尚未确认；**（待实测）**＝须真机或真账号验证；**【建议值】**＝依赖归属文档、本文先给可用值并在 §8 登记。

---

## 0. 阅读指引与速查

| 章节 | 内容 |
|---|---|
| §0.1 | 本组门派与传承一览 |
| §0.2 | `reqs`、职级与来源写法 |
| §0.3 | 内功 `nature` 速查 |
| §0.4 | T01 五级职级接口 |
| §1 | 少林派 `sect_shaolin`：简介、职级、门派特殊规则、武学总表、天级卡、地阶卡、玄/黄紧凑表 |
| §2 | 南少林 `sect_nanshaolin`（书剑） |
| §3 | 旁支：西域金刚门、叛僧成昆（幻阴指）、五台山清凉寺；敌人专用武学 |
| §4 | 套装候选（门派套装 ×7、人物传承套装 ×4；含用户示例 `set_shaolin_jingang`） |
| §5 | 统计（门派 × 12 品阶、类别、原生书界） |
| §6 | 本文新增术语与 ID |
| §7 | 数据校验规则与测试用例 |
| §8 | 待决事项 / 依赖 |

**配表通用约定**（下文各表不再重复）：

| 项 | 约定 |
|---|---|
| 耗内基准（× `MPREF`） | 黄 5% / 玄 6% / 地 7% / 天 8%；绝招 = 基准 + 2%（05 §4.8） |
| 招式预算 | `power = AF × (1+Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp`；核算列写法：`AF×(1+adj)×K − 代价`，如 `1+0.12(cd1)+0.05(耗内+1%)−0.03(破甲30%)` |
| Buff 代价 | 眩晕/定身 0.25×率；点穴/封内/封经脉/缴械 0.20–0.25×率；内伤/破甲/流血/减速/灼烧/寒气/骨伤/蹒跚 0.10×率；自身增益 0.10–0.20（05 §4.2 建议值） |
| 附带 Buff | 一律 `grade: inherit`（= 本武学 `effGrade`，06 §3.1）；"率"为基础施加率，最终还要过效果命中/抵抗（04） |
| 收招 | 未写即 1000；架势类 800–850 |
| 招式栏 | 黄/玄 3、地 4、天 5（05 §4.9） |
| 被动 ID | `ps_<武学拼音>_<拼音>`；层数按 `layerEff` 判定 |
| 同源组 | 七十二绝技一律 `lineageGroups: [lg_shaolin72]`（02 §5.4）；少林九阳功另入 `lg_jiuyang` |
| 学习途径 ID | 秘籍 `it_miji_<拼音>`、残页 `it_canye_<拼音>`（05 P-4 建议规则）；NPC 与任务为占位 ID（`q_NN_*_8x`），由书界文档替换 |
| 天级观摩 | 按作者决定 P09 默认 `observable: false`；例外须逐门登记依据，本文三门天级均无观摩学习例外 |

### 0.1 本组门派与传承一览

| 门派 / 传承 ID | 名称 | 出现书界 | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 |
|---|---|---|---|---|---|---|---|---|
| `sect_shaolin` | 少林派（嵩山少林寺） | 天龙、射雕、神雕、倚天（含楔子）、笑傲、侠客、鹿鼎、书剑；其他书界状态见 `design/17` §3.1 | 正 | 河南登封嵩山少室山；五台山清凉寺仅作关联传授点（原创扩展），不并作独立门派 | 天龙：玄慈、玄寂、玄难、玄悲、玄苦、扫地僧；倚天楔子：天鸣、无色、无相、觉远；倚天：空闻、空智、空性、空见、渡厄/渡劫/渡难；笑傲：方证、方生；侠客：妙谛；鹿鼎：晦聪、澄观；书剑人物接口见 `design/17` §5.1 | 外门刚猛硬功＋七十二绝技＋佛门内功；长于守御、拿穴、护体与慈悲制服 | 外门偏阳；上乘内修含 `harmony` | 可；书剑为 `O`，但该书界实际授艺主要由组织分立的 `sect_nanshaolin` 承载；俗家与剃度两轨见 §0.4 |
| `sect_nanshaolin` | 南少林 | 书剑；其他时代状态见 `design/17` §3.1 | 正（书剑反清线） | 福建泉州／莆田定位仍待 `design/11` 地理考据，不在本文定址 | 天虹禅师、于万亭相关人物关系（待考 K-03：核《书剑恩仇录》南少林追查身世段落中的称谓、关系与寺址） | 短打、棍术与南派拳种；本文多数条目为历史武术借鉴后的原创扩展 | 阳 | 可；T01 五级，L4 可走“洪门护法”俗家支路 |
| —（`lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`） | 西域金刚门旁支 | 倚天 | 邪（汝阳王府一方） | 西域（待考 K-09：核《倚天屠龙记》赵敏部属叙述中的具体地域与传承层级） | 阿二、阿三；火工头陀一脉 | 少林外门指力旁出，以大力金刚指为代表 | 阳 | 否；裁定禁用 `sect_jingangmen`，只用自由文本 `lineage` 表达旁支 |
| —（`lineage: 成昆（圆真）`） | 成昆（圆真）叛支 | 倚天 | 邪 | 少林寺内潜伏 | 成昆（混元霹雳手） | 阴毒指力：幻阴指 | 阴 | 否；幻阴指可经邪道奇遇习得（§3.2） |

### 0.2 `reqs`、职级与来源写法

- 正式门派条件写作 `sect {id: sect_shaolin, rank: 1..5}`；文中 `L1..L5` 是展示称谓，数据字段仍存整数 `rank`。
- 正式武学前置写作 `prereq: [{skill: sk_xxx, layer: N}]`；二选一写作 `prereq: [{anyOf: [{skill: sk_a, layer: N}, {skill: sk_b, layer: M}]}]`。外层为 AND、`anyOf` 内为 OR（`rulings-v1` §4）。
- 技艺门槛只写入 `reqs.skills`，合法键为 `med/poi/antidote/forge/alchemy/formation/music/art/chess/speech`。来源的 `reqsOverride` 按顶层字段替换；`null` 删除字段，`[]` 清空前置；未出现字段继承基础值。基础若显式列 `hard`，删除某条件时同步剔除对应硬路径，替换同名顶层条件则继续沿用该硬路径（`rulings-v1` §4.3）。
- 总表“拜(Ln)”表示该来源要求 T01 的 Ln 授艺资格；奇遇、秘籍、观摩仍以各卡 `learnSources` 的覆写为准。

### 0.3 内功 `nature` 速查（AR-02）

| `nature` | 本文内功（12 门） | 玩法接口 |
|---|---|---|
| `harmony` | 易筋经、洗髓经、达摩心经 | 无阴阳相性惩罚、相性增益减半；完整规则见 `design/05` §5 |
| `yang` | 金刚不坏体、金钟罩、少林九阳功、铁布衫、铜人横练、童子功、少林心法、少林桩功、铁线功 | 阳性内功；冲穴速率与经脉适性仅由 `design/15` 计算 |
| `yin` | 无 | 本文当前没有阴性内功，不为配额虚构条目 |

> 本表只登记 `nature` 接口，不定义穴道、经脉、周天或九转收益；这些内容见 `design/15`。

### 0.4 T01 五级职级接口（AR-07/08）

`sect_shaolin` 与 `sect_nanshaolin` 均采用 `design/17` §1.2 的 T01 禅宗模板；少林俗家、剃度两轨在 L3 汇合，南少林另允许 L4“洪门护法”俗家支路。月钱与资源档位只引用 `design/16` 的 `stipendTier/resourceTier = 1..5`，本文不定义金额或产出。

| 级 | T01 称谓 | 本文授艺边界 |
|---|---|---|
| L1 | 俗家弟子 / 沙弥 | 黄阶基础拳棍、心法与步法 |
| L2 | 剃度弟子 / 入室僧 | 黄阶全开、玄下禅功与兵器 |
| L3 | 亲传弟子 / 闭关僧 | 玄阶全开、地下绝技候选 |
| L4 | 首座 / 长老 | 地阶与院堂秘传；天级只开放专属任务资格 |
| L5 | 方丈 / 住持 | 镇寺目录访问权；仍须满足属性、前置、剧情等条件 |

> **库存边界（AR-01 / C14）**：本轮保留现有 70 个唯一武学 ID，不扩充、不删减、不为追比例重定级。当前天／地／玄／黄为 `3/26/27/14`；按 3 门天级折算的 AR-01 近似目标是 `3/9/27/27`。这是一份 CXs 扩充前基线，不是 AR-01 已完成声明。

## 1. 少林派 `sect_shaolin`

### 1.1 门派简介：时代变迁与各书界强弱

少林是跨越多个书界的持续性门派之一（时代开放矩阵见 `design/17` §3.1），并非全作唯一。本文用“各时代实际投放的七十二绝技数量递减”表现传承与玩法供给变化；这只是本作的投放曲线（原创扩展），不把它写成原著对寺藏总量的断言。至康熙朝，般若堂首座澄观熟知多门少林武功的法门，却欠缺临敌经验；韦小宝正是借其不谙实战而周旋（原著《鹿鼎记》）。

| 书界 | 境界 | 少林状况（原著/改编） | 本书界少林可学武学（门数：天/地/玄/黄；其中七十二绝技） | 关键人物 · 事件钩子 |
|---|---|---|---|---|
| 天龙（约 1093–1094） | 高 | 鼎盛：玄字辈诸高僧；藏经阁七十二绝技为萧远山、慕容博、鸠摩智觊觎；扫地僧论绝技须以佛法化解（原著） | 44（1/19/13/11）；绝技 19 | 玄慈、扫地僧、虚竹；聚贤庄、少室山大会；鸠摩智以小无相功冒用绝技 |
| 射雕（约 1217–1227；楔子 1199；待考 K-02：核《射雕英雄传》郭啸天、杨铁心开篇及主线年序） | 高 | 背景存在：嵩山在金国治下，少林不入主线（原创扩展：可探索区域） | 9（1/0/1/7）；绝技 0 | 依基准保留易筋经完整学习线；来源由 `chapters/02` 配置并标原创扩展 |
| 神雕（1237–1259） | 高 | 背景存在；无色禅师在小说末段与杨过、张君宝等相逢 | 9（0/0/2/7）；绝技 0 | 只开放有限入门，不新增易筋经完整学习线；华山之巅衔接倚天楔子 |
| 倚天（楔子 1262；1336–1363） | 高 | 楔子：觉远诵九阳真经，无色记得一部分成少林九阳功；正篇：空见以金刚不坏体受谢逊十三拳而殁；成昆化名圆真潜伏；屠狮大会、金刚伏魔圈 | **23（3/6/8/6）**；绝技 3；按 C14 白名单收敛 | 空闻、空智、空性（龙爪手）、渡厄三僧、谢逊（狮子吼） |
| 笑傲（明中叶，年代不详） | 中 | 方证为武林泰斗；少林三战（方证千手如来掌对任我行）；方证欲以易筋经为令狐冲化解异种真气 | 36（1/7/17/11）；绝技 7 | 方证、方生；易筋经本土印证（02 E5） |
| 侠客（明，年代不详） | 中 | 少林掌门妙谛应邀赴侠客岛；本文不由此推断寺中“无大宗师” | 22（0/5/9/8）；绝技 4 | 洗髓经首现（原创扩展定级） |
| 鹿鼎（1669–1690） | 低 | 晦聪方丈、般若堂澄观；十八罗汉护送韦小宝；清凉寺行痴（顺治）出家 | 36（0/5/20/11）；绝技 4 | 澄观"纸上谈兵"（原创扩展解读）；韦小宝出家少林、任清凉寺住持（原著） |
| 书剑（1753–1759） | 中 | `sect_shaolin` 按 `design/17` §3.1 为 `O`；组织仍开放，实际授艺池主要由独立的南少林承载 | 23（0/3/11/9）；绝技 2 | 天虹禅师与南少林线；嵩山／南少林不可合并为同一门派 |

> 各书界可学池只统计本文少林武学；书界整体武学池由各书界文档汇总（05 §14.4）。按作者决定 P49，射雕、神雕均以背景与有限入门为主；射雕依基准保留易筋经完整学习线，神雕不新增该完整学习线。

### 1.2 门派职级与身份规则

本派采用 §0.4 的 T01 L1–L5；香客、挂单僧只是非门派访问状态，不占 `rank`。具体贡献阈值、晋升任务、叛出、月钱和资源分别归 `design/12`、`design/16`；本文只把职级作为授艺门槛。

- **出家与俗家**（原创扩展，作者决定 P32）：从 L2 起可选剃度；出家者少林武学修炼 `+10%`（计入 `bonusMult`），关闭情缘线；可还俗，还俗后移除该 `+10%`。俗家、剃度两轨在 L3 汇合，是否出家不替代武学自身门槛。
- **书眠**：门派身份不跨书界（基准 §3）；“少林残篇 ≥ 3 门”只提供下一少林书界的入门任务加速（原创扩展），不能直接授予 L1 或跳过时代开放、入门任务。

### 1.3 门派特殊规则

#### 1.3.1 七十二绝技·戾气（原著设定，数值化为原创扩展）

原著依据：《天龙八部》少室山藏经阁中，扫地僧说明少林绝技凌厉、须以慈悲佛法化解，萧远山与慕容博偷学多门绝技后内伤难愈即其例。本文不引用未经逐字核定的原句或回目号。

| 规则 | 值 |
|---|---|
| 计数 | 装配中带 `special.liqi: true` 的武学（本文 21 门七十二绝技）数 N |
| 佛法根基 | 装配任一：易筋经、洗髓经、达摩心经、少林九阳功（内功，任意栏位）或 般若心经（杂学）；或套装 `set_shaolin_banruo` 3 件 / `set_saodiseng` 2 件 |
| 戾气判定 | N ≥ 3 且无佛法根基：每场战斗开始判定一次，`p = 0.04 × (N − 2) × (1 − wil/150)`，命中获得 `bf_neixiwenluan`（走火 1 级，品阶取所装绝技 `effGrade` 最高者） |
| 修炼 | 同条件下闭关修炼任一绝技，心魔概率 ×1.5（05 §8.3） |
| 性质 | 这是**装配组合规则**（与 05 §5.4 阴阳相冲同类），不是单门武学的代价，故不计入 05 §14.6"代价型 ≤ 5%" |
| 归属 | 走火触发源表属 05 §10.2，本条以提案形式登记（§8.3 BP-4） |

#### 1.3.2 慈悲：制服而不杀（原创扩展）

带被动"慈悲/戒杀"的少林武学（般若掌、千手如来掌、戒刀法、慈悲刀、大慈大悲千叶手）击倒**非 Boss、非野兽**目标时改为"制服"：目标不死、退出战斗，可在战后劝降、盘问或放走（结果与品德、声望的关系归 design/12）。玩家可在设置中对单场关闭；关闭后恢复通常击倒/击杀结算，品德后果仍由 `design/12` 判定。

#### 1.3.3 横练与罩门

铜人横练、铁布衫、金钟罩为"内功·护体"类横练（理由见 §1.6.1 注）。铁布衫、金钟罩装配即伴生 `bf_zhaomen`（06 §8.9，罩门），铜人横练伴生玄阶罩门；**金刚不坏体**无罩门，并能压制同装配横练的罩门（§1.5.2）。这是"横练越深越怕被识破"的武侠通行设定（原创扩展）。

### 1.4 少林武学总表（嵩山少林，62 门；南少林见 §2，旁支幻阴指见 §3）

> "获取"缩写：拜=拜师（`master`，括号内为职级 L1–L5）、籍=秘籍（`manual`）、页=残页（`pages`）、观=观摩（`observe`，上限 6 重）、遇=奇遇（`qiyu`）、谜=解谜、合=合击领悟。"绝"=七十二绝技（`lg_shaolin72`，`special.liqi`）。

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_yijinjing` | 易筋经 | 内功/心法 | 12 天上 | `harmony` | 0/1 | 天龙、射雕、倚天、笑傲 | 拜(L5)；遇（天龙“无心插柳”）；笑傲方证传经=印证 | 原著（05 §13.3） |
| `sk_jingangbuhuai` | 金刚不坏体 | 内功/心法（护体） | 10 天下 | `yang` | 0/1 | 倚天 | 拜(L5)渡厄；遇“空见遗泽” | 原著 |
| `sk_shizihou` | 狮子吼 | 杂学/音功 | 10 天下 | 阳 | 0/1 | 倚天 | 拜(L5)；谢逊版由倚天组配置 | 原著 |
| `sk_xisuijing` | 洗髓经 | 内功/心法 | 9 地上 | `harmony` | 0/1 | 侠客、鹿鼎 | 拜(L4)；籍（鹿鼎藏经阁） | 民间传说名目；本作原创纳入并定级 |
| `sk_jinzhongzhao` | 金钟罩 | 内功/心法（横练） | 8 地中 | `yang` | 0/1 | 天龙、笑傲 | 拜(L4)罗汉堂；籍（笑傲） | 绝；民间名目，原创纳入 |
| `sk_shaolinjiuyang` | 少林九阳功 | 内功/心法 | 8 地中 | `yang` | 0/1 | 倚天 | 拜(L4)；遇（楔子闻经） | 原著（无色所记九阳真经） |
| `sk_tiebushan` | 铁布衫 | 内功/心法（横练） | 7 地下 | `yang` | 0/1 | 天龙、鹿鼎、书剑 | 拜(L4)；籍（鹿鼎） | 绝；民间名目，原创纳入 |
| `sk_tongrenhenglian` | 铜人横练 | 内功/心法（横练） | 6 玄上 | `yang` | 0/1 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)＋“铜人巷”事件 | 原创扩展（用户示例套装成员） |
| `sk_damoxinjing` | 达摩心经 | 内功/心法 | 5 玄中 | `harmony` | 0/1 | 天龙、神雕、侠客 | 拜(L3)达摩院；籍 | 原创扩展 |
| `sk_tongzigong` | 童子功 | 内功/心法 | 4 玄下 | `yang` | 0/1 | 笑傲、鹿鼎、书剑 | 拜(L2)；籍 | 民间名目，原创纳入 |
| `sk_shaolinxinfa` | 少林心法 | 内功/心法 | 2 黄中 | `yang` | 0/1 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L1)；籍 | 原创扩展（入门） |
| `sk_shaolinzhuanggong` | 少林桩功 | 内功/心法 | 1 黄下 | `yang` | 0/1 | 同上 | 拜(L1)；观 | 原创扩展（入门） |
| `sk_xumishanzhang` | 须弥山掌 | 拳脚/拳掌 | 9 地上 | 阳 | 0.50/0.50 | 天龙 | 拜(L5)；遇（藏经阁） | 绝（待考 K-01：核《天龙八部》是否出现该名目及施用人物） |
| `sk_qianshourulaizhang` | 千手如来掌 | 拳脚/拳掌 | 9 地上 | 调和 | 0.40/0.60 | 笑傲 | 拜(L5)方证；观（三战） | 原著（方证） |
| `sk_boruozhang` | 般若掌 | 拳脚/拳掌 | 8 地中 | 调和 | 0.45/0.55 | 天龙、倚天、鹿鼎 | 拜(L4)般若堂；鹿鼎澄观 | 绝（原著） |
| `sk_weituochu` | 韦陀杵 | 拳脚/拳掌 | 8 地中 | 阳 | 0.60/0.40 | 天龙 | 拜(L4)戒律院 | 绝（原著：玄悲“大韦陀杵”） |
| `sk_dajingangquan` | 大金刚拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.65/0.35 | 天龙 | 拜(L4)；页 | 绝（待考 K-01：核《天龙八部》少林绝技名录） |
| `sk_dajingangzhang` | 大金刚掌 | 拳脚/拳掌 | 7 地下 | 阳 | 0.55/0.45 | 天龙、笑傲、侠客 | 拜(L4)；籍（侠客） | 绝（待考 K-01：核《天龙八部》是否作“大金刚掌”或“大力金刚掌”，并核施用人物） |
| `sk_dacidabeiqianyeshou` | 大慈大悲千叶手 | 拳脚/拳掌 | 6 玄上 | 调和 | 0.60/0.40 | 鹿鼎 | 拜：海大富（宫中）／罗汉堂(L3) | 原著《鹿鼎记》（待考 K-07：核用名与少林归属） |
| `sk_xinyiba` | 心意把 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.70/0.30 | 笑傲、侠客、鹿鼎 | 拜(L3)；籍 | 民间嵩山少林名目，原创纳入 |
| `sk_tieshazhang` | 铁砂掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.75/0.25 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)；籍；页；观 | 原创扩展（05 §2.8） |
| `sk_shuaibeishou` | 摔碑手 | 拳脚/拳掌 | 4 玄下 | 阳 | 0.75/0.25 | 天龙、笑傲、侠客、鹿鼎 | 拜(L2)；页 | 民间名目，原创纳入 |
| `sk_fuhuquan` | 伏虎拳 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕、侠客、鹿鼎 | 拜(L1)；籍；观 | 原创扩展（同名传统拳术不作小说事实） |
| `sk_weituozhang` | 韦陀掌 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.75/0.25 | 天龙、射雕、笑傲、侠客、鹿鼎 | 拜(L1)；观 | 原著入门功夫（待考 K-06：核《天龙八部》虚竹所习名目） |
| `sk_luohanquan` | 罗汉拳 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.90/0.10 | 天龙、神雕、倚天、笑傲、鹿鼎 | 拜(L1)；籍；页；观 | 05 §13.8 |
| `sk_nianhuazhi` | 拈花指 | 拳脚/指法 | 9 地上 | 调和 | 0.30/0.70 | 天龙、鹿鼎 | 拜(L5)；鹿鼎澄观(L4) | 绝（原著） |
| `sk_wuxiangjiezhi` | 无相劫指 | 拳脚/指法 | 9 地上 | 调和 | 0.25/0.75 | 天龙 | 拜(L5)；观（鸠摩智） | 绝（原著） |
| `sk_dalijingangzhi` | 大力金刚指 | 拳脚/指法 | 8 地中 | 阳 | 0.65/0.35 | 天龙、倚天 | 拜(L4)达摩院；观（阿三） | 绝（原著《倚天屠龙记》） |
| `sk_yizhichan` | 一指禅 | 拳脚/指法 | 8 地中 | 调和 | 0.30/0.70 | 天龙、笑傲、侠客、书剑 | 拜(L4)；书剑南少林 | 绝（待考 K-01：核《天龙八部》《侠客行》《书剑恩仇录》是否出现该名目及施用人物） |
| `sk_mohezhi` | 摩诃指 | 拳脚/指法 | 7 地下 | 阳 | 0.50/0.50 | 天龙、侠客 | 拜(L4)达摩院 | 绝（待考 K-01：核《天龙八部》少林绝技名录） |
| `sk_duoluoyezhi` | 多罗叶指 | 拳脚/指法 | 7 地下 | 调和 | 0.40/0.60 | 天龙 | 拜(L4)达摩院 | 绝（原著） |
| `sk_jingangzhi` | 金刚指 | 拳脚/指法 | 4 玄下 | 阳 | 0.60/0.40 | 天龙、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L2)；籍 | 原创扩展（指力入门） |
| `sk_ruyingsuixingtui` | 如影随形腿 | 拳脚/腿法 | 7 地下 | 阳 | 0.70/0.30 | 天龙、笑傲、侠客 | 拜(L4)；籍（侠客） | 绝（待考 K-01：核《天龙八部》《笑傲江湖》《侠客行》是否出现该名目及施用人物） |
| `sk_tiesaozhou` | 铁扫帚 | 拳脚/腿法 | 5 玄中 | 阳 | 0.80/0.20 | 天龙、鹿鼎、书剑 | 拜(L3)；页 | 民间七十二艺名目，原创纳入 |
| `sk_tantui` | 少林弹腿 | 拳脚/腿法 | 2 黄中 | 中性 | 0.90/0.10 | 笑傲、侠客、鹿鼎、书剑 | 拜(L1)；观 | 民间名目，原创纳入 |
| `sk_longzhaoshou` | 龙爪手（金刚龙爪手） | 拳脚/擒拿 | 8 地中 | 阳 | 0.70/0.30 | 天龙、倚天、笑傲 | 拜(L4)般若堂；观（空性）；籍 | 绝（原著《倚天屠龙记》；05 §13.7） |
| `sk_yingzhuagong` | 鹰爪功 | 拳脚/擒拿 | 5 玄中 | 阳 | 0.75/0.25 | 倚天、笑傲、鹿鼎、书剑 | 拜(L3)；页 | 民间名目，原创纳入 |
| `sk_shaolinqinna` | 少林擒拿手 | 拳脚/擒拿 | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎 | 拜(L1)；籍 | 原创扩展（05 引用为龙爪手前置） |
| `sk_fumozhangfa` | 伏魔杖法 | 兵器/棍杖 | 8 地中 | 阳 | 0.60/0.40 | 天龙、鹿鼎 | 拜(L4)；鹿鼎十八罗汉 | 绝（待考 K-01：核《天龙八部》《鹿鼎记》是否出现该名目及施用人物） |
| `sk_yachagun` | 夜叉棍法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.75/0.25 | 天龙、鹿鼎 | 拜(L3)；页 | 民间少林大小夜叉棍，原创纳入 |
| `sk_yinshougun` | 阴手棍 | 兵器/棍杖 | 4 玄下 | 中性 | 0.80/0.20 | 笑傲、侠客、鹿鼎 | 拜(L2)；籍 | 史实名目（明·程宗猷《少林棍法阐宗》），原创纳入 |
| `sk_shaolingunfa` | 少林棍法 | 兵器/棍杖 | 2 黄中 | 中性 | 0.85/0.15 | 天龙、射雕、神雕、倚天、笑傲、侠客、鹿鼎、书剑 | 拜(L1)；籍；观 | 原创扩展（入门） |
| `sk_ranmudaofa` | 燃木刀法 | 兵器/刀 | 9 地上 | 阳 | 0.40/0.60 | 天龙 | 拜(L5)；观（鸠摩智） | 绝（原著） |
| `sk_cibeidao` | 慈悲刀 | 兵器/刀 | 6 玄上 | 调和 | 0.60/0.40 | 天龙、笑傲、侠客 | 拜(L3) | 原创扩展 |
| `sk_jiedaofa` | 戒刀法 | 兵器/刀 | 3 黄上 | 中性 | 0.85/0.15 | 天龙、笑傲、鹿鼎、书剑 | 拜(L1)；观 | 原创扩展 |
| `sk_damojianfa` | 达摩剑法 | 兵器/剑 | 7 地下 | 调和 | 0.55/0.45 | 笑傲 | 拜(L4)达摩院 | 绝（待考 K-01：核《笑傲江湖》是否出现该名目及施用人物） |
| `sk_fumojian` | 伏魔剑法 | 兵器/剑 | 5 玄中 | 阳 | 0.70/0.30 | 笑傲、侠客 | 拜(L3)；页 | 原创扩展（同名传统剑法不作小说事实） |
| `sk_luohanjian` | 罗汉剑法 | 兵器/剑 | 3 黄上 | 中性 | 0.85/0.15 | 天龙、笑傲 | 拜(L1) | 原创扩展 |
| `sk_jiashafumogong` | 袈裟伏魔功 | 兵器/奇门（袈裟） | 8 地中 | 调和 | 0.40/0.60 | 天龙 | 拜(L4)；观（鸠摩智） | 绝（原著） |
| `sk_xiangmochu` | 韦陀降魔杵 | 兵器/奇门（杵） | 6 玄上 | 阳 | 0.75/0.25 | 天龙、鹿鼎 | 拜(L3) | 原创扩展 |
| `sk_fumosuofa` | 伏魔索法 | 兵器/鞭索 | 6 玄上 | 阳 | 0.60/0.40 | 倚天、笑傲、鹿鼎 | 拜(L3)；倚天渡厄三僧 | 原创扩展（取三渡黑索之意） |
| `sk_yiweidujiang` | 一苇渡江 | 轻功 | 9 地上 | 中性 | — | 天龙 | 遇（达摩洞面壁）；拜(L5) | 绝；典出达摩渡江传说，原创扩展定级 |
| `sk_bihuyouqiang` | 壁虎游墙功 | 轻功 | 5 玄中 | 中性 | — | 天龙、倚天、笑傲、鹿鼎 | 拜(L3)；籍 | 民间七十二艺名目，原创纳入 |
| `sk_meihuazhuang` | 梅花桩 | 轻功 | 4 玄下 | 中性 | — | 笑傲、侠客、鹿鼎、书剑 | 拜(L2) | 民间名目，原创纳入 |
| `sk_luohanbu` | 罗汉步 | 轻功 | 2 黄中 | 中性 | — | 全部少林书界＋书剑 | 拜(L1) | 原创扩展（入门） |
| `sk_jingangnianzhu` | 金刚念珠 | 暗器 | 6 玄上 | 中性 | 0.85/0.15 | 笑傲、鹿鼎 | 拜(L3) | 原创扩展 |
| `sk_putizi` | 菩提子 | 暗器 | 3 黄上 | 中性 | 0.90/0.10 | 天龙、笑傲、鹿鼎、书剑 | 拜(L1)；观 | 原创扩展 |
| `sk_jingangfumoquan` | 金刚伏魔圈 | 杂学/阵法（合击） | 9 地上 | 阳 | 0.30/0.70 | 倚天 | 拜(L5)渡厄；合 | 原著（渡厄三僧） |
| `sk_luohanzhen` | 罗汉阵 | 杂学/阵法（合击） | 6 玄上 | 阳 | 0.60/0.40 | 天龙、鹿鼎 | 拜(L3)；合 | 原创扩展（待考 K-11：核《天龙八部》《鹿鼎记》是否出现同名阵法） |
| `sk_jingangnuhou` | 金刚怒吼 | 杂学/音功 | 6 玄上 | 阳 | 0/1 | 天龙、倚天、笑傲、鹿鼎 | 拜(L3) | 原创扩展（06 已引用） |
| `sk_shaolinshangke` | 少林伤科 | 杂学/医 | 5 玄中 | — | — | 笑傲、鹿鼎、书剑 | 拜(L3)药局；籍 | 原创扩展（少林伤科传统） |
| `sk_boruoxinjing` | 般若心经 | 杂学/心神 | 4 玄下 | — | — | 全部少林书界＋书剑 | 拜(L2)；籍 | 原创扩展（佛法根基） |

### 1.5 天级条目卡（3 门，与基准 §13 完全一致）

#### 1.5.1 易筋经 `sk_yijinjing`（天上 12 · 内功 · 天龙/射雕/倚天/笑傲）——摘要卡，定义以 05 §13.3 为准

- **简述**：少林至高内功，达摩所传（原著）。天龙中游坦之误打误撞以梵文经书练成；笑傲中方证欲以之为令狐冲化解异种真气（原著）。原著没有射雕、倚天玩家受授情节；本文相应学习途径均为原创扩展。
- **基本**：`harmony`；wOut/wIn 0/1；`inner.contribution {mpMaxPct 56, hpMaxPct 40, attrs {con 10, str 4, wil 8}, mpRegen 3.0, stats {resInjury 20}}`（IP 155）；`bridge: true`；`seclusionCap: 10`；moveSlots 5。
- **reqs**：`attrs {wil 70}`、`morality {min 20}`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, morality]`。
- **层数要点**：1 易筋｜3 洗髓、伐毛洗髓｜5 韦陀献杵、化异种真气｜6 倒拽九牛尾｜7 金刚不坏之基｜8 百病不侵｜10 易筋换骨（绝招）、易筋大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 |
|---|---|---|---|---|---|---|---|---|---|---|
| 洗髓 | `mv_yijinjing_xisui` | 3 | `aoe_self` | 0 | — | 10% | 4 | 900 | 驱散自身 poison/injury/seal/cold/heat 全部（≤本品阶）；回复 10% 气血；可移除走火 1–2 级 | — |
| 韦陀献杵 | `mv_yijinjing_weituo` | 5 | `aoe_self` | 0 | — | 8% | 3 | 800 | `bf_weituo` 2 回合（Z4 +25%、resCC +30） | — |
| 倒拽九牛尾 | `mv_yijinjing_daozhuai` | 6 | `aoe_pull` n2 | 1–3 | 1.10 | 9% | 2 | 1000 | 拉拽 2 格 | 可 |
| 易筋换骨（绝） | `mv_yijinjing_huangu` | 10 | `aoe_allies` r2 | 0 | — | 0 | — | 1000 | 自身驱散全部减益、回复 35% 气血与 50% 内力、`bf_wudi` 1 回合；友方各驱散 2 个减益 | — |

- **被动**：`ps_yijinjing_yijin`（1，resInjury +10→30pp）、`_famao`（3，每回合驱散 1 个 ≤ 品阶−2 的中毒/内伤）、`_huayi`（5，每回合 `bf_yizhongzhenqi` −2→−5 层，`auxMode: full`）、`_jingang`（7，气血 < 30% 时 `bf_hutizhenqi` 15%，每战 1 次）、`_baibing`（8，免疫 ≤ 品阶的 `bf_neixiwenluan`/`bf_jingmainixing`，resMind +20）、`_dacheng`（10，修炼 +15%、辅运比例 +0.10）。
- **本文补充（待 05 同步，§8.3）**：
  1. `learnSources` 补足原生书界：射雕 `{type: master, chapter: ch02_shediao, ref: npc_shaolin_fangzhang, maxLayer: 10, note: "金国治下嵩山少林完整线（原创扩展；须 T01 L5）"}`；倚天 `{type: master, chapter: ch04_yitian, ref: npc_kongwen, maxLayer: 10, note: "屠狮大会后空闻方丈（原创扩展；须 T01 L5）"}`。05 现仅列天龙×2、笑傲×1。
  2. 按 C22，正式 `setTags` 应为 `[set_shaolin_jingang, set_shaolin_damo, set_saodiseng, set_fangzheng]`；05 现仅列第一项，须同步。
  3. 作为本文"七十二绝技·戾气"的**佛法根基**（§1.3.1）。
- **conflicts**：`sk_xixing` counter（化异种真气）；`sk_qishangquan` counter（≥ 5 重不伤己）；`sk_xisuijing` synergy（§1.6.4）。

#### 1.5.2 金刚不坏体 `sk_jingangbuhuai`（天下 10 · 内功（护体） · 倚天）

- **简述**：《倚天屠龙记》中空见神僧以金刚不坏体承受谢逊七伤拳、意在劝其止杀；最后因开口应答而护体有隙，受拳圆寂（原著）。本作定位：**护体终点**——横练一脉（铜人横练→铁布衫→金钟罩）之极，无罩门。
- **基本**：`yang`；wOut/wIn 0/1（撼山招式覆写）；`inner.contribution {mpMaxPct 30, hpMaxPct 32, attrs {con 12, str 5, wil 5}, mpRegen 2.4, stats {defOut 10, resCC 10}}`（IP 30+32+44+12 = 118 ✓；mp −29%、hp +28%、属性 +22%、回内 −20%，均在 ±30% 内）；`seclusionCap 8`；`auxUsableMoves [mv_jingangbuhuai_hushen]`；moveSlots 5（内功例外：普通招式 4）。
- **reqs**：`attrs {con 60, wil 55}`、`aptitude {apInner 55}`、`morality {min 20}`、`prereq [{skill: sk_jinzhongzhao, layer: 7}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq, morality]`。
- **层数要点**：1 金刚守势、金刚身｜3 受拳不还｜4 不坏｜5 金刚护身｜6 金刚撼山、无罩门｜7 不坏金身（绝招）｜8 金疮不染｜10 金刚大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金刚守势 | `mv_jingangbuhuai_shoushi` | 1 | `aoe_self` | 0 | — | 6% | 2 | 800 | `bf_shoushi` 3（自身；06 所列"少林金刚守势"） | — | 架势 |
| 受拳不还 | `mv_jingangbuhuai_shouquan` | 3 | `aoe_self` | 0 | — | 7% | 3 | 800 | `bf_xieli` 1 + `bf_fanzhen` 1（自身）；本回合放弃攻击 | — | 架势（原著"十三拳不还手"致敬） |
| 金刚护身 | `mv_jingangbuhuai_hushen` | 5 | `aoe_self` | 0 | — | 10% | 4 | 900 | `bf_hutizhenqi`（`shieldPctHpMax 0.20`）3；驱散自身 1 个 `cc` | — | 护盾 ≈ 治疗 18%×1.2 ≈ 21.6%，取 20% |
| 金刚撼山 | `mv_jingangbuhuai_hanshan` | 6 | `aoe_single` | 1 | 1.15 | 9% | 2 | 1000 | 击退 1；`bf_xuanyun` 30% 1 | 可 | 1+0.24+0.05−0.05−0.075；wOut/wIn 覆写 0.60/0.40 |
| 不坏金身（绝） | `mv_jingangbuhuai_jinshen` | 7 | `aoe_around`（嘲讽） | 0 | — | 10% | — | 1200 | 自身 `bf_wudi` 1 + `bf_mian_kong` 2；周身八格敌人 `bf_chaofeng` 1 | — | 06 所列"金刚不坏体绝招"来源 |

- **被动**：
  - `ps_jingangbuhuai_jingangshen` 金刚身（1，stat，Z4 +4%→+12%，`scope: unit`，`auxMode: scaled`）
  - `ps_jingangbuhuai_buhuai` 不坏（4，mechanic，主运时常驻 `bf_jingang`：单次伤害 ≤ hpMax × 20%（天下），`auxMode: none`）
  - `ps_jingangbuhuai_wuzhaomen` 无罩门（6，mechanic，同装配的横练内功不产生 `bf_zhaomen`，`auxMode: full`）
  - `ps_jingangbuhuai_jinchuang` 金疮不染（8，trigger `battleStart`，`bf_mian_liuxue` 全场）
  - `ps_jingangbuhuai_dacheng` 金刚大成（10，mechanic，`bf_jingang` 上限按天中 18% 计；免疫 ≤ 品阶的 `cc.knock`）
- **setTags**：`[set_shaolin_henglian]`。**conflicts**：`{with: sk_shizihou, type: clash, note: 开口泄气}`。
- **特殊规则·开口泄气**（原著情节的机制化，原创扩展）：施放任何 `sonic` 标签招式（狮子吼、金刚怒吼）后，"不坏"（`bf_jingang`）失效至自身下次行动开始。
- **获取**：`{master, ch04_yitian, npc_duee, maxLayer 10, note: 闯过金刚伏魔圈后渡厄授（原创扩展）}`；`{qiyu, ch04_yitian, q_04_qiyu_81, maxLayer 8, reqsOverride {sect: null}, note: "空见遗泽"——空见圆寂处遗留心法（原创扩展）}`。`observable: false`。

#### 1.5.3 狮子吼 `sk_shizihou`（天下 10 · 杂学·音功 · 倚天；少林版，谢逊版同 ID）

- **简述**：倚天中谢逊于王盘山岛以狮子吼震倒群豪，事先令张翠山、殷素素塞耳（原著）。基准 §13 记为少林/谢逊；本条为少林传承，**谢逊途径由倚天组 `skills-yitian.md` 与 `chapters/04` 以同一 ID 配置**，本文只登记接口。
- **基本**：`yang`；wOut/wIn 0/1；资质 `apInner`（05 §2.3），强度辅以 `music`；`layerStats {effHit [3,10], resMind [2,10]}`（20）；moveSlots 5；所有招式 `tags [sonic]`、`hTol 99`、`delivery ranged`、不可招架。
- **reqs**：`attrs {con 55, wil 60}`、`aptitude {apInner 55}`、`prereq [{skill: sk_jingangnuhou, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 狮吼震、音劲｜3 慑魂｜4 收发由心｜5 破阵吼｜6 当头棒喝、狮王神威｜7 狮子吼（绝招）｜8 聚音成线、震散护体｜10 狮吼大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 友伤 | 附带 Buff | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 狮吼震 | `mv_shizihou_zhenhou` | 1 | `aoe_around` | 0 | 0.55 | 10% | 2 | all | `bf_zhenshe` 50% 1；`bf_xieqi` 30% 2 | 0.65×(1+0.24+0.10)×0.85×0.85−0.05−0.03 |
| 慑魂 | `mv_shizihou_shehun` | 3 | `aoe_ring` r2 | 0 | 0.52 | 10% | 3 | all | `bf_kongju` 25% 1 | 0.55×1.46×0.7225−0.0625 |
| 破阵吼 | `mv_shizihou_pozhen` | 5 | `aoe_cone` n3 | 1 | 0.56 | 9% | 3 | all | 驱散目标 1 个 `stance`（06 §8.8） | 0.65×1.41×0.7225−0.10 |
| 当头棒喝 | `mv_shizihou_hexing` | 6 | `aoe_allies` r3 | 0 | — | 8% | 3 | allies | 友方各驱散 1 个 `mind`（≤ 品阶；原创扩展） | 支援 |
| 聚音成线 | `mv_shizihou_juyin` | 8 | `aoe_single` | 1–5 | 0.87 | 10% | 2 | none | `bf_zhenshe` 100% 1 | 1×1.34×0.7225−0.10 |
| 狮子吼（绝） | `mv_shizihou_shizihou` | 7 | `aoe_field` side all | — | 0.50 | 10% | — | all | `bf_xieqi` 100% 2；`bf_zhenshe` 100% 1；`bf_kongju` 30% 1 | 3.0×0.35×0.7225−0.10−0.10−0.075 |

- **被动**：`ps_shizihou_yinjin` 音劲（1，stat，Z2 无视内劲防御 5%→15%）；`ps_shizihou_shoufa` 收发由心（4，mechanic，友方受本武学伤害与减益 ×(1 − 0.30→1.00)，10 重时不伤同伴）；`ps_shizihou_shenwei` 狮王神威（6，trigger `battleStart`，3 格内敌人 `bf_chihuan`，每战 1 次）；`ps_shizihou_zhensan` 震散护体（8，effect，本武学对护体真气伤害 ×1.5）；`ps_shizihou_dacheng` 狮吼大成（10，mechanic，无视"塞耳"类防护，design/10）。
- **conflicts**：`{with: sk_jingangbuhuai, type: clash, note: 开口泄气}`。**setTags**：`[set_mingjiao_sida_fawang]`；该标签仅在 `npc_xiexun` 来源计入“四大法王”主题，少林授艺来源不计该主题（C22；套装定义见 `skills-yitian` §7）。
- **获取**：`{master, ch04_yitian, npc_kongzhi, maxLayer 10, note: 屠狮大会后（原创扩展）}`；`{master, ch04_yitian, npc_xiexun, reqsOverride {sect: null, prereq: [], hard: []}, note: 由倚天组/chapters/04 配置}`。`observable: false`。
- **反制**："塞耳"物品/定力 ≥ 80 免疫附带的心神类（05 §4.6；数值归 06/10）。

### 1.6 地阶条目卡（嵩山少林 24 门）

> 卡片字段：简述｜基本（性质、比例、`layerStats` 或内功贡献、招式栏）｜reqs｜层数要点｜招式表｜被动｜setTags / conflicts / 特殊｜获取。凡七十二绝技均带 `lineageGroups [lg_shaolin72]`、`special.liqi: true`、`special.fusible: true`、`observable: true`（观摩上限 6 重），不再逐卡重复。地阶耗内基准 7%。卡内未写的项取默认：收招 1000（架势 800）、附带 Buff `grade: inherit`、`conflicts: []`、`setTags: []`、`weaponReq: null`（拳脚/内功/杂学）。

#### 1.6.1 横练与佛门内功（4 门）

> **横练为何归"内功·护体"**：① 基准 §13 已把金刚不坏体定为"内功（护体）"，横练一脉与之同源；② 横练是"运气"功夫（硬气功），靠内息贯注皮肉筋骨，数值上以气血、根骨、外防为主，适合走 05 §5.5 内功贡献（IP 预算内把 `mpMaxPct` 压低 30%、`hpMaxPct` 抬高 30%）；③ 归内功才计入核心携带类别（基准 §3 规则 1），用户示例"金刚套装"在 1/1/1 的低武书界才有讨论意义。代价：横练会挤占内功栏（主运 1 + 辅运 2），与易筋经等主修心法形成取舍。

##### 铁布衫 `sk_tiebushan`（地下 7 · 内功·横练 · 天龙/鹿鼎/书剑 · 七十二绝技，原创纳入）

- **简述**：外门横练，以气贯皮、周身如披铁衫，刀剑难入而有罩门（民间名目；06 已列为"少林横练"，本文定级地下）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 18.5, hpMaxPct 20.5, attrs {con 7, str 5}, mpRegen 1.8, stats {defOut 8, tough 7}}`（IP 18.5+20.5+24+9 = 72 ✓）；moveSlots 4。
- **reqs**：`attrs {con 40, str 35}`、`aptitude {apInner 35}`、`prereq [{skill: sk_tongrenhenglian, layer: 5}]`、`sect {id: sect_shaolin, rank: 3}`、`hard: [sect, prereq]`。
- **层数要点**：1 硬接、铁背靠、布衫、罩门｜4 千斤坠｜5 韧劲｜6 铁牛冲｜7 罡气护身（绝）｜10 布衫大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 硬接 | `mv_tiebushan_yingjie` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_waifang_sheng` 2（自身） | — | 架势 |
| 铁背靠 | `mv_tiebushan_tiebei` | 1 | `aoe_single` | 1 | 1.05 | 7% | 1 | 1000 | 击退 1 | 可 | 1+0.12−0.05；wOut/wIn 覆写 0.80/0.20 |
| 千斤坠 | `mv_tiebushan_qianjinzhui` | 4 | `aoe_self` | 0 | — | 5% | 3 | 800 | `bf_wenzhong` 3（自身；06 所列"千斤坠"） | — | 架势 |
| 铁牛冲 | `mv_tiebushan_tieniu` | 6 | `aoe_dash` n2 | 1–2 | 1.20 | 8% | 2 | 1000 | — | 可 | 1+0.24+0.05−0.10 |
| 罡气护身（绝） | `mv_tiebushan_gangqi` | 7 | `aoe_self` | 0 | — | 9% | — | 1200 | `bf_hutizhenqi`（0.20）3 + `bf_fanzhen` 3 + `bf_mian_liuxue` 3 | — | 自身绝招 |

- **被动**：`ps_tiebushan_bushan` 布衫（1，stat，Z4：近战来袭 −3%→−8%，`auxMode: scaled`）；`ps_tiebushan_zhaomen` 罩门（1，mechanic，装配即伴生 `bf_zhaomen`）；`ps_tiebushan_renjin` 韧劲（5，trigger `onHurt` 近战，`bf_renjin` 2，每回合 1 次）；`ps_tiebushan_dacheng` 布衫大成（10，mechanic，罩门固定于背后，识破需 `lore ≥ 70`）。
- **setTags**：`[set_shaolin_henglian]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{manual, ch08_luding, it_miji_tiebushan, 10}`；`{master, ch12_shujian, npc_nanshaolin_luohantang, 10, reqsOverride {sect: {id: sect_nanshaolin, rank: 4}, prereq: [{skill: sk_tiexiangong, layer: 5}]}}`（书剑无铜人横练传承，改以铁线功为前置）。倚天来源按 C14 撤下，只保留 NPC 见闻，不形成可学记录。

##### 金钟罩 `sk_jinzhongzhao`（地中 8 · 内功·横练 · 天龙/笑傲 · 七十二绝技，原创纳入）

- **简述**：横练中乘，罡气外罩如钟，受击发声反震（民间名目；06 列为反震 `bf_fanzhen` 来源之一）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 21, hpMaxPct 23, attrs {con 8, str 4, wil 2}, mpRegen 2.2, stats {defOut 10, defIn 5}}`（IP 21+23+28+11 = 83 ✓）；moveSlots 4。
- **reqs**：`attrs {con 45, str 40, wil 40}`、`aptitude {apInner 45}`、`prereq [{skill: sk_tiebushan, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 金钟护体、钟鸣、罩、罩门｜4 金钟反震｜5 钟声回响｜6 洪钟大吕｜7 金钟不破（绝）｜10 金钟大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金钟护体 | `mv_jinzhongzhao_huti` | 1 | `aoe_self` | 0 | — | 9% | 3 | 900 | `bf_hutizhenqi`（0.15）3 | — | 护盾 |
| 钟鸣 | `mv_jinzhongzhao_zhongming` | 1 | `aoe_around` | 0 | 0.80 | 8% | 2 | 1000 | `bf_xuanyun` 15% 1 | 可 | 0.65×(1+0.24+0.05)−0.0375；wOut/wIn 覆写 0.30/0.70 |
| 金钟反震 | `mv_jinzhongzhao_fanzhen` | 4 | `aoe_self` | 0 | — | 7% | 3 | 800 | `bf_fanzhen` 2（自身） | — | 架势 |
| 洪钟大吕 | `mv_jinzhongzhao_hongzhong` | 6 | `aoe_wave` d1 w3 | 1 | 0.75 | 9% | 2 | 1000 | 击退 1 | 可 | 0.70×1.34×0.85(ranged)−0.05 |
| 金钟不破（绝） | `mv_jinzhongzhao_bupo` | 7 | `aoe_allies` r1 | 0 | — | 9% | — | 1200 | 自身 `bf_hutizhenqi`（0.25）3 + `bf_mian_kong` 1；相邻友方 `bf_hutizhenqi`（`shieldPctCasterHpMax 0.10`）3 | — | 自身/友方绝招 |

- **被动**：`ps_jinzhongzhao_zhao` 罩（1，stat，Z4 −4%→−10%，`scaled`）；`ps_jinzhongzhao_zhaomen` 罩门（1，伴生 `bf_zhaomen`）；`ps_jinzhongzhao_huixiang` 钟声回响（5，trigger `onHurt` 近战 20%，`bf_fanzhen` 1，每回合 1 次）；`ps_jinzhongzhao_dacheng` 金钟大成（10，mechanic，罩门受击加成 +50% → +25%；`shieldMax` +5% hpMax）。
- **setTags**：`[set_shaolin_henglian, set_fangzheng]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{manual, ch05_xiaoao, it_miji_jinzhongzhao, 10, reqsOverride {prereq: [{skill: sk_tongrenhenglian, layer: 7}]}, note: 笑傲无铁布衫传承，改以铜人横练为前置}`。倚天不列可学来源（C14）。

##### 少林九阳功 `sk_shaolinjiuyang`（地中 8 · 内功 · 倚天 · 原著）

- **简述**：《倚天屠龙记》楔子中，觉远临终背诵九阳经文，张君宝、郭襄、无色禅师各有所记，后来形成武当、峨眉、少林三派九阳功（原著）。同源组 `lg_jiuyang`（02 §5.4）。
- **基本**：`yang`；`inner.contribution {mpMaxPct 32, hpMaxPct 18, attrs {con 5, str 3, wil 3}, mpRegen 2.2, stats {resCold 10, resInjury 5}}`（IP 32+18+22+11 = 83 ✓）；`auxUsableMoves [mv_shaolinjiuyang_liaoshang]`；moveSlots 4。
- **reqs**：`attrs {con 45}`、`aptitude {apInner 45}`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect]`。
- **层数要点**：1 九阳护体、他强由他强（残）｜3 纯阳劲｜5 九阳疗伤、寒毒难侵｜7 九阳周天（绝）｜8 三派同源｜10 九阳余绪。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 九阳护体 | `mv_shaolinjiuyang_huti` | 1 | `aoe_self` | 0 | — | 10% | 3 | 900 | `bf_hutizhenqi`（0.12）3；驱散自身 1 个 `cold` | — | 护盾 |
| 纯阳劲 | `mv_shaolinjiuyang_chunyang` | 3 | `aoe_single` | 1–2 | 1.10 | 8% | 2 | 1000 | — | 可 | (1+0.24+0.05)×0.85 |
| 九阳疗伤 | `mv_shaolinjiuyang_liaoshang` | 5 | `aoe_single`（友） | 0–1 | — | 7% | 2 | 1000 | 回复 18% 气血；驱散 1 个 `injury`/`cold` | — | 标准治疗 |
| 九阳周天（绝） | `mv_shaolinjiuyang_zhoutian` | 7 | `aoe_self` | 0 | — | 9% | — | 1200 | 回复 25% 气血；`bf_huichun` 3；驱散全部 `cold` | — | 自身绝招 |

- **被动**：`ps_shaolinjiuyang_taqiang` 他强由他强（残）（1，stat，Z4 −3%→−8%，攻方攻击合计高于自身时）；`ps_shaolinjiuyang_hannan` 寒毒难侵（5，mechanic，免疫品阶 ≤ 本功 `effGrade`−2 的 `cold`，`auxMode: full`）；`ps_shaolinjiuyang_tongyuan` 三派同源（8，mechanic，同装配任一 `lg_jiuyang` 成员时 `mpRegen` +0.5pp，属 05 §9.2 synergy ≤ 8%）；`ps_shaolinjiuyang_dacheng` 九阳余绪（10，mechanic，七伤拳自伤叠加减半）。
- **setTags**：`[set_sandu]`。**conflicts**：`{with: sk_qishangquan, type: counter, note: 10 重起七伤减半}`。
- **获取**：`{master, ch04_yitian, npc_kongwen, 10}`；`{qiyu, ch04_yitian, q_04_qiyu_82, maxLayer 5, reqsOverride {sect: null}, note: 楔子 1262 随郭襄游少林、闻觉远诵经（原创扩展：玩家在场）}`。

##### 洗髓经 `sk_xisuijing`（地上 9 · 内功 · 侠客/鹿鼎 · 原创扩展定级）

- **简述**：民间传说常把《易筋》《洗髓》二经并称；本作据此原创扩展为易筋经的姊妹篇，重“伐毛洗髓、澄心定性”，但不把它写成金庸原著事实。本作定为**明清少林的最高内功**（非天级：基准 §13 未收，不得升天），满足 02 §2.8“鹿鼎原生最高内功为地阶（catalog 定）”。
- **基本**：`harmony`（≥ 7，自动桥接）；`inner.contribution {mpMaxPct 34, hpMaxPct 22, attrs {con 5, wis 4, wil 4}, mpRegen 2.5, stats {resMind 8, resInjury 7}}`（IP 34+22+26+12.5 = 94.5 ✓）；moveSlots 4。
- **reqs**：`attrs {wil 50, wis 45}`、`aptitude {apInner 45}`、`morality {min 10}`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, morality]`。
- **层数要点**：1 伐毛、清净｜3 澄心｜4 化异｜5 换脉｜6 化戾｜7 洗髓还原（绝）｜10 洗髓大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 |
|---|---|---|---|---|---|---|---|---|---|---|
| 伐毛 | `mv_xisuijing_famao` | 1 | `aoe_self` | 0 | — | 8% | 3 | 900 | 驱散自身 2 个 `poison`/`injury`（≤ 品阶） | — |
| 澄心 | `mv_xisuijing_chengxin` | 3 | `aoe_allies` r2 | 0 | — | 9% | 3 | 1000 | 友方各驱散 1 个 `mind`；`bf_dingxin` 3 | — |
| 换脉 | `mv_xisuijing_huanmai` | 5 | `aoe_self` | 0 | — | 10% | 5 | 1000 | 移除 ≤ 品阶的走火 1–2 级；回复 10% 气血 | — |
| 洗髓还原（绝） | `mv_xisuijing_huanyuan` | 7 | `aoe_allies` r2 | 0 | — | 9% | — | 1200 | 友方各驱散 2 个减益并回复 15% 气血；自身 `bf_mian_xin` 2 | — |

- **被动**：`ps_xisuijing_qingjing` 清净（1，effect，回合开始回复 hpMax 0.5%→1.5%，`scaled`）；`ps_xisuijing_huayi` 化异（4，effect，每回合 `bf_yizhongzhenqi` −1→−3 层，`auxMode: full`）；`ps_xisuijing_huali` 化戾（6，mechanic，视为佛法根基；七十二绝技修炼 +10%）；`ps_xisuijing_dacheng` 洗髓大成（10，mechanic，免疫 ≤ 品阶的 `bf_neixiwenluan`；顿悟概率 +0.5%）。
- **setTags**：`[set_shaolin_damo, set_chengguan]`。**conflicts**：`{with: sk_yijinjing, type: synergy, note: 易洗双修，同装配时二者辅运比例 +0.05}`。
- **获取**：`{master, ch06_xiake, npc_shaolin_fangzhang, 10, note: 妙谛赴侠客岛后代掌寺务的长老（原创扩展）}`；`{master, ch08_luding, npc_huicong, 10}`；`{manual, ch08_luding, it_miji_xisuijing, 8, note: 藏经阁；韦小宝线可"借阅"（原创扩展）}`。`observable: false`（内功心法不可观摩）。

#### 1.6.2 拳掌·七十二绝技（6 门）

##### 大金刚拳 `sk_dajingangquan`（地下 7 · 拳脚·拳 · 天龙）

- **简述**：少林外门拳法之刚猛者，拳如金刚捣杵；本作将传统少林名目纳入七十二绝技，招名与玩法均为原创扩展。
- **基本**：`yang` · 0.65/0.35 · `layerStats {parry [2,6], defOut [2,9]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, con 35, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_fuhuquan, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 金刚开山、金刚镇魔、刚劲｜3 怒目金刚｜4 怒目（被动）｜5 金刚捣杵｜7 金刚一怒（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金刚开山 | `mv_dajingangquan_kaishan` | 1 | `aoe_single` | 1 | 1.14 | 8% | 1 | 1000 | `bf_pojia` 30% 2 | 可 | 1+0.12+0.05−0.03 |
| 金刚镇魔 | `mv_dajingangquan_zhenmo` | 1 | `aoe_single` | 1 | 0.95 | 7% | 0 | 1000 | 击退 1 | 可 | 1−0.05 |
| 怒目金刚 | `mv_dajingangquan_numu` | 3 | `aoe_sweep` | 1 | 0.95 | 8% | 2 | 1000 | — | 可 | 0.75×1.29=0.97（手调 −0.02） |
| 金刚捣杵 | `mv_dajingangquan_daochu` | 5 | `aoe_single` | 1 | 1.36 | 9% | 2 | 1100 | `bf_xuanyun` 20% 1 | 可 | 1+0.24+0.10+0.07−0.05 |
| 金刚一怒（绝） | `mv_dajingangquan_yinu` | 7 | `aoe_cone` n2 | 1 | 2.15（3 段） | 9% | — | 1200 | `bf_xuanyun` 30% 1 | 可 | 3.0×0.75−0.075 |

- **被动**：`ps_dajingangquan_gangjin` 刚劲（1，Z2 无视外防 4%→12%）；`ps_dajingangquan_numu` 怒目（4，trigger `onHurt`，`bf_waigong_sheng` 2，每回合 1 次）；`ps_dajingangquan_dacheng` 大成（10，Z3 本武学 +8%）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{pages, it_canye_dajingangquan, pagesTotal 6}`。倚天不掉落可拼成完整秘籍的残页（C14）。

##### 大金刚掌 `sk_dajingangzhang`（地下 7 · 拳脚·掌 · 天龙/笑傲/侠客；别名"大力金刚掌"）

- **简述**：掌力沉雄、专震内腑；“大金刚掌／大力金刚掌”的小说用名仍待 K-01 核定，06 以“大力金刚掌”列为内伤来源，本文暂以 `sk_dajingangzhang` 收录。**拳掌进阶链**：罗汉拳（黄下）→ 铁砂掌（玄中）→ 大金刚掌（地下）→ 须弥山掌 / 千手如来掌（地上）。
- **基本**：`yang` · 0.55/0.45 · `layerStats {defOut [2,8], crit [1,6]}`（14）· moveSlots 4。
- **reqs**：`attrs {str 40, con 40, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_tieshazhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 托天式、摩云掌、掌力沉雄｜4 裂石｜5 震伤｜6 大力摧山｜7 大力金刚（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 托天式 | `mv_dajingangzhang_tuotian` | 1 | `aoe_single` | 1 | 0.97 | 7% | 0 | 1000 | `bf_neishang` 25% 1 层 | 可 | 1−0.025 |
| 摩云掌 | `mv_dajingangzhang_moyun` | 1 | `aoe_single` | 1–2 | 0.99 | 8% | 1 | 1000 | — | 可 | 1.17×0.85（掌风，ranged） |
| 裂石 | `mv_dajingangzhang_lieshi` | 4 | `aoe_single` | 1 | 1.36 | 9% | 2 | 1100 | `bf_pojia` 50% 2 | 可 | 1.41−0.05 |
| 大力摧山 | `mv_dajingangzhang_cuishan` | 6 | `aoe_line` n2 | 1–2 | 1.05 | 8% | 2 | 1000 | 击退 1 | 可 | 0.85×1.29−0.05 |
| 大力金刚（绝） | `mv_dajingangzhang_dali` | 7 | `aoe_single` | 1 | 2.80 | 9% | — | 1200 | `bf_neishang` 100% 2 层；`bf_xuanyun` 30% 1 | 可 | 3.0−0.10−0.075 |

- **被动**：`ps_dajingangzhang_chenxiong` 掌力沉雄（1，Z2 4%→10%）；`ps_dajingangzhang_zhenshang` 震伤（5，trigger `onHit` 20%，`bf_neishang` 1 层）；`ps_dajingangzhang_dacheng` 大成（10，对带 `bf_neishang` 的目标 Z3 +8%）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{master, ch05_xiaoao, npc_shaolin_luohantang, 10}`；`{manual, ch06_xiake, it_miji_dajingangzhang, 10}`。

##### 般若掌 `sk_boruozhang`（地中 8 · 拳脚·掌 · 天龙/倚天/鹿鼎 · 原著）

- **简述**：少林七十二绝技之一；《天龙八部》有般若掌名目，《鹿鼎记》澄观为般若堂首座。本文“般若智光、破执去妄”的掌意及疗愈效果均为原创扩展，定位为**攻守兼修、能疗能制服**的佛门掌法。
- **基本**：`harmony` · 0.45/0.55 · `layerStats {parry [3,9], defIn [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, wis 45}`、`aptitude {apFist 45}`、`prereq [{skill: sk_weituozhang, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。倚天本土来源按 C17 使用 `reqsOverride {prereq: [{skill: sk_tieshazhang, layer: 5}]}`，避免依赖该书界白名单外的韦陀掌。
- **层数要点**：1 如是、空相、无住｜4 照见五蕴｜5 慈悲｜6 度一切苦厄｜7 般若波罗蜜（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 如是 | `mv_boruozhang_rushi` | 1 | `aoe_single` | 1 | 1.00 | 7% | 0 | 1000 | — | 可 | 基准 |
| 空相 | `mv_boruozhang_kongxiang` | 1 | `aoe_line` n3 | 1–3 | 0.80 | 8% | 1 | 1000 | — | 可 | 0.80×1.17×0.85 |
| 照见五蕴 | `mv_boruozhang_zhaojian` | 4 | `aoe_single` | 1 | 1.20 | 9% | 2 | 1000 | `bf_sangong` 40% 2；驱散目标 1 个 `guard` | 可 | 1.34−0.04−0.10 |
| 度一切苦厄 | `mv_boruozhang_duyi` | 6 | `aoe_single`（友） | 0–1 | — | 7% | 2 | 1000 | 回复 18% 气血；驱散 1 个 `injury` | — | 标准治疗 |
| 般若波罗蜜（绝） | `mv_boruozhang_boluomi` | 7 | `aoe_sq3` | 1–3 | 1.50 | 9% | — | 1200 | `bf_sangong` 50% 2 | 可 | 3.0×0.60×0.85−0.05=1.48（手调 +0.02） |

- **被动**：`ps_boruozhang_wuzhu` 无住（1，trigger `onParry`，`bf_xieli` 1，每回合 1 次）；`ps_boruozhang_cibei` 慈悲（5，mechanic，击倒改"制服"，§1.3.2）；`ps_boruozhang_dacheng` 大成（10，本武学治疗 +20%，伤害 Z3 +6%）。
- **setTags**：`[set_shaolin_banruo, set_chengguan]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_banruotang, 10}`；`{master, ch04_yitian, npc_shaolin_banruotang, 10, reqsOverride {prereq: [{skill: sk_tieshazhang, layer: 5}]}}`；`{master, ch08_luding, npc_chengguan, 10}`。

##### 韦陀杵 `sk_weituochu`（地中 8 · 拳脚·拳 · 天龙 · 原著；别名"大韦陀杵"）

- **简述**：《天龙八部》中“大韦陀杵”是玄悲大师的成名绝技；玄悲遇害后，少林因“以彼之道，还施彼身”而疑姑苏慕容，后知乃慕容博所为（原著）。
- **基本**：`yang` · 0.60/0.40 · `layerStats {defOut [2,7], crit [2,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, con 40, wis 40}`、`aptitude {apFist 45}`、`prereq [{skill: sk_weituozhang, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 降魔杵、护法、金刚力｜4 镇岳｜5 护法（被动）｜6 大韦陀杵｜7 韦陀伏魔（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 降魔杵 | `mv_weituochu_xiangmo` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | 1000 | `bf_neishang` 20% 1 层 | 可 | 1.17−0.02 |
| 护法 | `mv_weituochu_hufa` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_shoushi` 2 | — | 架势 |
| 镇岳 | `mv_weituochu_zhenyue` | 4 | `aoe_leap` splash none | 1–3 | 1.10 | 9% | 2 | 1000 | — | 可 | 0.90×1.34−0.10 |
| 大韦陀杵 | `mv_weituochu_dachu` | 6 | `aoe_single` | 1 | 1.50 | 10% | 3 | 1100 | `bf_neishang` 50% 2 层 | 可 | 1+0.36+0.15+0.07−0.10=1.48（+0.02） |
| 韦陀伏魔（绝） | `mv_weituochu_fumo` | 7 | `aoe_leap` splash sq3 | 1–3 | 2.60（溅射 ×0.5） | 9% | — | 1200 | `bf_xuanyun` 30% 1 | 可 | 3.0×0.90−0.075 |

- **被动**：`ps_weituochu_jingangli` 金刚力（1，Z2 5%→12%）；`ps_weituochu_hufa` 护法（5，trigger `onKill`，`bf_ruiyi` 2）；`ps_weituochu_dacheng` 大成（10，大韦陀杵冷却 −1）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_jielvyuan, 10, note: 戒律院（玄悲一脉）}`。倚天不列可学来源（C14）。

##### 须弥山掌 `sk_xumishanzhang`（地上 9 · 拳脚·掌 · 天龙）

- **简述**：掌势如须弥压顶，少林掌法中最沉重者；名目是否见《天龙八部》及其施用人物待 K-01 核定，本文效果为原创扩展。只在天龙藏经阁鼎盛时可学。
- **基本**：`yang` · 0.50/0.50 · `layerStats {defOut [2,7], resCC [2,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 50, con 45, wis 45}`、`aptitude {apFist 50}`、`prereq [{skill: sk_dajingangzhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 压山、沉掌、沉重｜4 八风不动｜5 如山｜6 芥子纳须弥｜7 须弥压顶（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 压山 | `mv_xumishanzhang_yashan` | 1 | `aoe_sq3` | 1 | 0.80 | 9% | 2 | 1000 | — | 可 | 0.60×1.34 |
| 沉掌 | `mv_xumishanzhang_chenzhang` | 1 | `aoe_single` | 1 | 1.20 | 8% | 1 | 1100 | `bf_chihuan` 50% | 可 | 1+0.12+0.05+0.07−0.05=1.19 |
| 八风不动 | `mv_xumishanzhang_bafeng` | 4 | `aoe_self` | 0 | — | 6% | 3 | 800 | `bf_wenzhong` 2 + `bf_jiangu` 2 | — | 架势 |
| 芥子纳须弥 | `mv_xumishanzhang_jiezi` | 6 | `aoe_single` | 1 | 1.40 | 10% | 3 | 1000 | `bf_dingshen` 40% 1 | 可 | 1+0.36+0.15−0.10=1.41 |
| 须弥压顶（绝） | `mv_xumishanzhang_yading` | 7 | `aoe_sq3` | 1–2 | 1.70 | 9% | — | 1200 | `bf_xuanyun` 40% 1 | 可 | 3.0×0.60−0.10 |

- **被动**：`ps_xumishanzhang_chenzhong` 沉重（1，Z2 5%→14%）；`ps_xumishanzhang_rushan` 如山（5，mechanic，装配时免疫 ≤ 品阶的 `cc.knock`）；`ps_xumishanzhang_dacheng` 大成（10，对定身/眩晕目标 Z3 +15%）。
- **setTags**：`[set_saodiseng]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_fangzhang, 10, note: 玄慈许可}`；`{qiyu, ch01_tianlong, q_01_qiyu_81, 10, note: 少室山大会后藏经阁扫地僧指点（原创扩展）}`。

##### 千手如来掌 `sk_qianshourulaizhang`（地上 9 · 拳脚·掌 · 笑傲 · 原著）

- **简述**：《笑傲江湖》少林三战中，方证大师以千手如来掌对任我行，掌影繁复、守中有攻（原著）。这是笑傲书界唯一的少林地上拳掌。
- **基本**：`harmony` · 0.40/0.60 · `layerStats {combo [2,8], parry [2,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 45, wis 50}`、`aptitude {apFist 50}`、`morality {min 20}`、`prereq [{skill: sk_dajingangzhang, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq, morality]`。
- **层数要点**：1 千手、掌影、千变｜4 接引｜5 慈悲｜6 如来｜7 万佛朝宗（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 千手 | `mv_qianshourulaizhang_qianshou` | 1 | `aoe_multi` n6 r1 | 1 | 1.00（6 段） | 8% | 1 | 1000 | — | 可 | 0.85×1.17 |
| 掌影 | `mv_qianshourulaizhang_zhangying` | 1 | `aoe_single` | 1 | 1.05 | 7% | 0 | 900 | `bf_polu` 30% 2 | 可 | 1+0.07−0.03 |
| 接引 | `mv_qianshourulaizhang_jieyin` | 4 | `aoe_pull` n2 | 1–3 | 0.90 | 7% | 2 | 1000 | 拉拽 2 | 可 | 0.95×1.24×0.85−0.10 |
| 如来 | `mv_qianshourulaizhang_rulai` | 6 | `aoe_self` | 0 | — | 6% | 3 | 800 | `bf_houfa` 2 | — | 架势 |
| 万佛朝宗（绝） | `mv_qianshourulaizhang_wanfo` | 7 | `aoe_cone` n3 | 1 | 1.85（9 段） | 9% | — | 1200 | `bf_polu` 100% 2 | 可 | 3.0×0.65−0.10 |

- **被动**：`ps_qianshourulaizhang_qianbian` 千变（1，trigger：连续两次使用本武学不同招式，第二招 Z3 +5%）；`ps_qianshourulaizhang_cibei` 慈悲（5，制服）；`ps_qianshourulaizhang_dacheng` 大成（10，"千手"段数 +2（总倍率不变），全招冷却 −1）。
- **setTags**：`[set_fangzheng]`。
- **获取**：`{master, ch05_xiaoao, npc_fangzheng, 10}`；`{observe, ch05_xiaoao, npc_fangzheng, maxLayer 6, reqsOverride {sect: null}, note: 少林三战观战，该战观摩 ×10（剧情事件）}`。

#### 1.6.3 指法·七十二绝技（6 门）

> 指法进阶链：金刚指（玄下）→ 摩诃指 / 多罗叶指 / 大力金刚指（地下–地中）→ 一指禅（地中）→ 拈花指 / 无相劫指（地上）。指力远程招式按 `ranged`（×0.85）计价；"点穴"一律为 06 的 `bf_fengxue`（`seal.point`，硬控组）。

##### 摩诃指 `sk_mohezhi`（地下 7 · 拳脚·指 · 天龙/侠客）

- **简述**：少林指法之大开大阖者；“摩诃指”是否见《天龙八部》及施用人物待 K-01 核定，招名与效果为原创扩展。
- **基本**：`yang` · 0.50/0.50 · `layerStats {seal [2,8], hit [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 35, wis 40}`、`aptitude {apFinger 40}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 摩诃大指、点穴、指力｜4 摩诃破气、认穴｜6 连指｜7 摩诃无量（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 摩诃大指 | `mv_mohezhi_dazhi` | 1 | `aoe_single` | 1–3 | 0.99 | 8% | 1 | — | 可 | 1.17×0.85 |
| 点穴 | `mv_mohezhi_dianxue` | 1 | `aoe_single` | 1 | 1.10 | 8% | 1 | `bf_fengxue` 30% 1 | 可 | 1.17−0.06 |
| 摩诃破气 | `mv_mohezhi_poqi` | 4 | `aoe_single` | 1–3 | 1.10 | 9% | 2 | `bf_sangong` 40% 2 | 可 | 1.34×0.85−0.04 |
| 连指 | `mv_mohezhi_lianzhi` | 6 | `aoe_single` | 1 | 1.30（3 段） | 9% | 2 | `bf_fengxue` 20% 1 | 可 | 1.34−0.04 |
| 摩诃无量（绝） | `mv_mohezhi_wuliang` | 7 | `aoe_chain` n3 | 1–3 | 1.95 | 9% | — | `bf_fengxue` 50% 1 | 可 | 3.0×0.80×0.85−0.10=1.94 |

- **被动**：`ps_mohezhi_zhili` 指力（1，Z0 破招 +3→+9）；`ps_mohezhi_renxue` 认穴（4，trigger `battleStart`，`bf_renxue` 3）；`ps_mohezhi_dacheng` 大成（10，本武学点穴持续 +1）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_damoyuan, 10}`；`{master, ch06_xiake, npc_shaolin_damoyuan, 10}`。

##### 多罗叶指 `sk_duoluoyezhi`（地下 7 · 拳脚·指 · 天龙 · 原著）

- **简述**：天龙所列少林绝技（鸠摩智曾冒用，原著）。"多罗"即贝多罗叶（写经之叶），指力如落叶纷飞，擅长群点（效果原创扩展）。
- **基本**：`harmony` · 0.40/0.60 · `layerStats {hit [2,8], seal [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 40, wis 40}`、`aptitude {apFinger 40}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 叶落、贝叶、叶脉｜4 经叶、精准｜6 乱叶｜7 漫天贝叶（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 叶落 | `mv_duoluoyezhi_yeluo` | 1 | `aoe_multi` n3 r1 | 1–3 | 1.00（3 段） | 8% | 1 | — | 可 | 0.85×1.17（乱击已含远程） |
| 贝叶 | `mv_duoluoyezhi_beiye` | 1 | `aoe_single` | 1–3 | 0.82 | 7% | 0 | `bf_fengxue` 15% 1 | 可 | 0.85−0.03 |
| 经叶 | `mv_duoluoyezhi_jingye` | 4 | `aoe_x` r1 | 1–3 | 0.68 | 8% | 2 | `bf_fengxue` 15% 1 | 可 | 0.65×1.29×0.85−0.03 |
| 乱叶 | `mv_duoluoyezhi_luanye` | 6 | `aoe_chain` n3 | 1–3 | 0.90 | 9% | 2 | — | 可 | 0.80×1.34×0.85 |
| 漫天贝叶（绝） | `mv_duoluoyezhi_mantian` | 7 | `aoe_diamond` r2 | 1–3 | 1.20 | 9% | — | `bf_fengxue` 30% 1 | 可 | 3.0×0.50×0.85−0.06 |

- **被动**：`ps_duoluoyezhi_yemai` 叶脉（1，同一目标被本武学多段/多招命中时，第二段起点穴率 +10%）；`ps_duoluoyezhi_jingzhun` 精准（4，trigger `battleStart`，`bf_jingzhun` 3）；`ps_duoluoyezhi_dacheng` 大成（10，本武学射程 +1）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_damoyuan, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

##### 大力金刚指 `sk_dalijingangzhi`（地中 8 · 拳脚·指 · 天龙/倚天 · 原著）

- **简述**：《倚天屠龙记》中西域金刚门阿三以大力金刚指重创俞岱岩四肢，张三丰等由伤势认出少林金刚指力一路；金刚门源自火工头陀一脉（原著）。具体师承层级统一留在 K-09 核对。06 `bf_gushang`（骨伤）即以此为典。
- **基本**：`yang` · 0.65/0.35 · `layerStats {seal [2,8], crit [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, agi 35, wis 40}`、`aptitude {apFinger 45}`、`prereq [{skill: sk_jingangzhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 捏骨、扎穴、刚指｜4 错骨｜5 伤筋｜6 金指穿石｜7 金刚碎骨（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 捏骨 | `mv_dalijingangzhi_niegu` | 1 | `aoe_single` | 1 | 1.14 | 8% | 1 | `bf_gushang` 30% | 可 | 1.17−0.03 |
| 扎穴 | `mv_dalijingangzhi_zhaxue` | 1 | `aoe_single` | 1 | 0.95 | 7% | 0 | `bf_fengxue` 20% 1 | 可 | 1−0.04 |
| 错骨 | `mv_dalijingangzhi_cuogu` | 4 | `aoe_single` | 1 | 1.20 | 9% | 2 | `bf_gushang` 60%；`bf_jiaoxie` 25%（目标持械） | 可 | 1.34−0.06−0.0625=1.22（−0.02） |
| 金指穿石 | `mv_dalijingangzhi_chuanshi` | 6 | `aoe_pierce` | 1–2 | 1.00 | 9% | 2 | — | 可 | 0.90×1.34×0.85=1.03（−0.03） |
| 金刚碎骨（绝） | `mv_dalijingangzhi_suigu` | 7 | `aoe_single` | 1 | 2.80 | 9% | — | `bf_gushang` 100%；`bf_fengxue` 50% 1 | 可 | 3.0−0.10−0.10 |

- **被动**：`ps_dalijingangzhi_gangzhi` 刚指（1，Z2 4%→12%）；`ps_dalijingangzhi_shangjin` 伤筋（5，trigger `onHit` 15%，`bf_gushang`）；`ps_dalijingangzhi_dacheng` 大成（10，对带 `bf_gushang` 的目标 Z3 +12%）。
- **特殊**：倚天剧情钩子（原创扩展）——在武当派 NPC 面前施展会触发"俞三侠旧伤"对白，武当好感 −10（design/12）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_damoyuan, 10}`；`{master, ch04_yitian, npc_shaolin_damoyuan, 10}`；`{observe, ch04_yitian, npc_asan, 6, reqsOverride {sect: null, prereq: []}, note: 与金刚门阿三交手}`。

##### 一指禅 `sk_yizhichan`（地中 8 · 拳脚·指 · 天龙/笑傲/侠客/书剑）

- **简述**：以一指贯注周身功力，少林指法的根本功夫；是否见于相关金庸小说及施用人物待 K-01 核定。南少林亦传是本作原创扩展。
- **基本**：`harmony` · 0.30/0.70 · `layerStats {seal [3,10], pierce [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 45, wil 40}`、`aptitude {apFinger 45}`、`prereq [{skill: sk_jingangzhi, layer: 7}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 一指、禅定、贯注｜4 灌顶｜5 解穴｜6 指力外放｜7 一指定乾坤（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 一指 | `mv_yizhichan_yizhi` | 1 | `aoe_single` | 1–3 | 0.95 | 8% | 1 | `bf_fengxue` 20% 1 | 可 | 1.17×0.85−0.04 |
| 禅定 | `mv_yizhichan_chanding` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jingzhun` 3（自身） | — | 架势（收招 800） |
| 灌顶 | `mv_yizhichan_guanding` | 4 | `aoe_single` | 1 | 1.33 | 10% | 2 | `bf_fengnei` 30% 2 | 可 | 1+0.24+0.15−0.06 |
| 解穴 | `mv_yizhichan_jiexue` | 5 | `aoe_single`（友） | 0–1 | — | 6% | 2 | 驱散目标全部 `seal`（06 §7.1"解穴"） | — | 支援 |
| 一指定乾坤（绝） | `mv_yizhichan_qiankun` | 7 | `aoe_single` | 1–3 | 2.35 | 9% | — | `bf_fengxue` 100% 2 | 可 | 3.0×0.85−0.20 |

- **被动**：`ps_yizhichan_guanzhu` 贯注（1，单体招式 Z3 +3%→+9%）；`ps_yizhichan_waifang` 指力外放（6，本武学远程招式射程 +1）；`ps_yizhichan_dacheng` 大成（10，"一指"冷却 0）。
- **setTags**：`[set_shaolin_banruo, set_fangzheng]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_damoyuan, 10}`；`{master, ch05_xiaoao, npc_fangsheng, 10}`；`{manual, ch06_xiake, it_miji_yizhichan, 8}`；`{master, ch12_shujian, npc_tianhong, 10, reqsOverride {sect: {id: sect_nanshaolin, rank: 4}}}`。

##### 拈花指 `sk_nianhuazhi`（地上 9 · 拳脚·指 · 天龙/鹿鼎 · 原著）

- **简述**：取“世尊拈花、迦叶微笑”之意，指力阴柔无形；《天龙八部》中拈花指是少林绝技之一。扫地僧相关论述的逐字表述，以及《鹿鼎记》澄观是否明确通晓此技，留待 K-05 核定。
- **基本**：`harmony` · 0.30/0.70 · `layerStats {seal [3,10], crit [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 50, agi 45}`、`aptitude {apFinger 50}`、`prereq [{skill: sk_yizhichan, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 拈花、微笑、无相｜4 无形、阴柔｜6 散花｜7 迦叶一笑（绝）、禅机｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 拈花 | `mv_nianhuazhi_nianhua` | 1 | `aoe_single` | 1–3 | 0.95 | 8% | 1 | `bf_fengxue` 25% 1 | 可 | 1.17×0.85−0.05 |
| 微笑 | `mv_nianhuazhi_weixiao` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_yuanzhuan` 2（自身） | — | 架势（收招 800） |
| 无形 | `mv_nianhuazhi_wuxing` | 4 | `aoe_single` | 1–3 | 0.93 | 8% | 2 | — | **否** | 1.29×0.85×0.85 |
| 散花 | `mv_nianhuazhi_sanhua` | 6 | `aoe_cross` r1 | 1–3 | 0.70 | 9% | 2 | `bf_fengxue` 20% 1 | 可 | 0.65×1.34×0.85−0.04 |
| 迦叶一笑（绝） | `mv_nianhuazhi_jiaye` | 7 | `aoe_single` | 1–3 | 1.95 | 9% | — | `bf_fengxue` 100% 1 | **否** | 3.0×0.85×0.85−0.20=1.97 |

- **被动**：`ps_nianhuazhi_wuxiang` 无相（1，stat，效果命中 +3→+10）；`ps_nianhuazhi_yinrou` 阴柔（4，Z2 无视内劲防御 4%→10%）；`ps_nianhuazhi_chanji` 禅机（7，trigger `onCrit`，`bf_fengxue` 1，每回合 1 次）；`ps_nianhuazhi_dacheng` 大成（10，"拈花"冷却 0）。
- **setTags**：`[set_shaolin_banruo, set_saodiseng, set_chengguan]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_fangzhang, 10}`；`{master, ch08_luding, npc_chengguan, 10, reqsOverride {sect: {id: sect_shaolin, rank: 4}, prereq: [{skill: sk_jingangzhi, layer: 7}]}, note: 澄观"纸上谈兵"式传授，须先与之喂招 1 场（原创扩展）}`。

##### 无相劫指 `sk_wuxiangjiezhi`（地上 9 · 拳脚·指 · 天龙 · 原著）

- **简述**：指力无形无相、发时不见其势。《天龙八部》中鸠摩智以小无相功为根基，施展包括无相劫指在内的少林绝技（原著）。
- **基本**：`harmony` · 0.25/0.75 · `layerStats {pierce [3,10], crit [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 50, wil 45}`、`aptitude {apFinger 50}`、`prereq [{skill: sk_mohezhi, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 无相、劫火、无迹｜4 空劫｜5 劫｜6 无相劫｜7 劫尽（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 无相 | `mv_wuxiangjiezhi_wuxiang` | 1 | `aoe_single` | 1–4 | 0.85 | 8% | 1 | — | **否** | 1.17×0.85×0.85 |
| 劫火 | `mv_wuxiangjiezhi_jiehuo` | 1 | `aoe_single` | 1–3 | 1.10 | 9% | 2 | `bf_neishang` 30% 1 层 | 可 | 1.34×0.85−0.03 |
| 空劫 | `mv_wuxiangjiezhi_kongjie` | 4 | `aoe_line` n4 | 1–4 | 0.85 | 9% | 2 | — | 可 | 0.75×1.34×0.85 |
| 无相劫 | `mv_wuxiangjiezhi_wuxiangjie` | 6 | `aoe_single` | 1–3 | 1.05 | 10% | 3 | `bf_sangong` 50% 2 | **否** | 1.51×0.7225−0.05 |
| 劫尽（绝） | `mv_wuxiangjiezhi_jiejin` | 7 | `aoe_sq3` | 1–3 | 1.20 | 9% | — | `bf_sangong` 100% 2 | **否** | 3.0×0.60×0.7225−0.10 |

- **被动**：`ps_wuxiangjiezhi_wuji` 无迹（1，mechanic，本武学招式不显示范围预警，05 §11.1"见识"亦不生效）；`ps_wuxiangjiezhi_jie` 劫（5，Z2 无视内劲防御 5%→12%）；`ps_wuxiangjiezhi_dacheng` 大成（10，每战首次出手获得 `bf_bizhong` ×1）。
- **特殊·小无相功催动**（原著鸠摩智）：主运 `sk_xiaowuxiang` 时，本武学不计入"戾气"计数，且观摩习得上限由 6 重提高到 8 重。
- **setTags**：`[set_shaolin_banruo, set_mizong_mingwang]`（后者为鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_fangzhang, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6（主运小无相功时 8）, reqsOverride {sect: null, prereq: []}}`。

#### 1.6.4 腿法·擒拿（2 门）

##### 如影随形腿 `sk_ruyingsuixingtui`（地下 7 · 拳脚·腿 · 天龙/笑傲/侠客）

- **简述**：腿影如随形之影，敌退我进、紧缠不舍；该名目是否见于相关金庸小说及施用人物待 K-01 核定，效果为原创扩展。腿法持械不降效（05 §6.3），是棍僧、刀僧的副手拳脚首选。
- **基本**：`yang` · 0.70/0.30 · `layerStats {eva [2,8], counter [1,7]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 45, str 35, wis 40}`、`aptitude {apLeg 40}`、`prereq [{skill: sk_tiesaozhou, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 如影、随形、追影｜4 连环踢、追击｜6 绕影｜7 影踪无定（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 如影 | `mv_ruyingsuixingtui_ruying` | 1 | `aoe_dash` n3 | 1–3 | 1.05 | 8% | 1 | — | 可 | 1.17−0.10=1.07 |
| 随形 | `mv_ruyingsuixingtui_suixing` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jieji` 2（自身） | — | 架势（收招 800） |
| 连环踢 | `mv_ruyingsuixingtui_lianhuan` | 4 | `aoe_single` | 1 | 1.30（3 段） | 9% | 2 | `bf_panshan` 30% 2 | 可 | 1.34−0.03 |
| 绕影 | `mv_ruyingsuixingtui_raoying` | 6 | `aoe_behind` r2 | 1–2 | 1.00 | 8% | 2 | — | 可 | 0.90×1.29−0.15 |
| 影踪无定（绝） | `mv_ruyingsuixingtui_yingzong` | 7 | `aoe_single` | 1 | 2.85（5 段） | 9% | — | `bf_panshan` 100% 2；`bf_xuanyun` 20% 1 | 可 | 3.0−0.10−0.05 |

- **被动**：`ps_ruyingsuixingtui_zhuiying` 追影（1，mechanic，被本武学命中的目标离开相邻格时自身立即跟进 1 格，每回合 1 次）；`ps_ruyingsuixingtui_zhuiji` 追击（4，trigger `battleStart`，`bf_zhuiji` 3）；`ps_ruyingsuixingtui_dacheng` 大成（10，出招后可用完剩余移动力）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{master, ch05_xiaoao, npc_shaolin_luohantang, 10, reqsOverride {prereq: [{skill: sk_tantui, layer: 7}]}}`；`{manual, ch06_xiake, it_miji_ruyingsuixingtui, 8, reqsOverride {prereq: [{skill: sk_tantui, layer: 7}]}}`（笑傲/侠客无铁扫帚传承，改以少林弹腿为前置）。

##### 龙爪手 `sk_longzhaoshou`（地中 8 · 拳脚·擒拿 · 天龙/倚天/笑傲；别名"金刚龙爪手"）——摘要卡，定义以 05 §13.7 为准

- **简述**：少林七十二绝技；倚天光明顶空性以龙爪手对张无忌，张无忌观而学之、以同一路龙爪手胜之（原著）。**即用户示例"少林金刚套装"中的"金刚龙爪手"——同一武学，`alias` 已收"金刚龙爪手"，不另立 ID。**
- **基本**：`yang` · 0.70/0.30 · `layerStats {seal [3,10], crit [1,5]}` · reqs：`attrs {str 45}`、`aptitude {apGrapple 45}`、`prereq [{skill: sk_shaolinqinna, layer: 5}]`（本文 §1.7 定义）、`sect {id: sect_shaolin, rank: 4}`。
- **招式**（原著定数 8 式，超出地阶 4–7 招规范，按原著例外）：捕风式（1，0.95，点穴 20%）、捉影式（2，拉拽 1，0.95）、抚琴式（3，1.10×2 段，缴械 25%）、鼓瑟式（4，横扫 0.85，点穴 15%）、批亢式（5，1.20，暴击 +15）、捣虚式（6，1.15，驱散架势、无视 20% 外防）、**龙爪三十六路**（7，绝招 2.70×6 段，点穴 100% 2 + 缴械 50%）、抱残式（8，架势反击并定身）、守缺式（9，架势，引用 `bf_shouque`）。
- **被动**：拿穴（1）、分筋错骨（5）、金刚指力（8）、龙爪大成（10，对被封穴目标不可招架）。
- **本文登记**：① 守缺式所用 `bf_shouque` 已由 06 §8.11 收录（数值以 05 为准）；② 擒拿进阶链：少林擒拿手（黄上）→ 鹰爪功（玄中，可选）→ 龙爪手（地中）；③ `setTags [set_shaolin_jingang]`（05 原定），本文不增补。

#### 1.6.5 兵器（4 门）

##### 伏魔杖法 `sk_fumozhangfa`（地中 8 · 兵器·棍杖 · 天龙/鹿鼎）

- **简述**：禅杖、齐眉棍皆可施展的少林镇寺杖法；该名目是否见于《天龙八部》《鹿鼎记》及施用人物待 K-01 核定，招名与效果为原创扩展。**棍杖进阶链**：少林棍法（黄中）→ 阴手棍（玄下）/ 夜叉棍法（玄中）→ 伏魔杖法（地中）。
- **基本**：`yang` · 0.60/0.40 · `weaponReq {category: staff}` · `layerStats {parry [3,10], defOut [1,5]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 45, con 40, wis 40}`、`aptitude {apStaff 45}`、`prereq [{skill: sk_yachagun, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 伏魔、横扫群魔、拒敌｜4 镇杖、拆招｜6 举鼎｜7 降魔禅杖（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 伏魔 | `mv_fumozhangfa_fumo` | 1 | `aoe_single` | 1–2 | 1.25 | 8% | 1 | 1100 | — | 可 | 1+0.12+0.05+0.07=1.24 |
| 横扫群魔 | `mv_fumozhangfa_hengsao` | 1 | `aoe_sweep` | 1 | 0.83 | 8% | 1 | 1000 | 击退 1 | 可 | 0.75×1.17−0.05 |
| 镇杖 | `mv_fumozhangfa_zhenzhang` | 4 | `aoe_around` | 0 | 0.84 | 9% | 2 | 1000 | `bf_chihuan` 30% | 可 | 0.65×1.34−0.03 |
| 举鼎 | `mv_fumozhangfa_juding` | 6 | `aoe_leap` splash sq3 | 1–3 | 1.10 | 9% | 2 | 1000 | — | 可 | 0.90×1.34−0.10 |
| 降魔禅杖（绝） | `mv_fumozhangfa_xiangmo` | 7 | `aoe_cone` n3 | 1–2 | 1.85（3 段） | 9% | — | 1200 | `bf_xuanyun` 30% 1 | 可 | 3.0×0.65−0.075=1.875 |

- **被动**：`ps_fumozhangfa_judi` 拒敌（1，trigger `enemyEnterAdjacent` 20%→40%，以"伏魔"×0.5 截击，每回合 1 次）；`ps_fumozhangfa_chaizhao` 拆招（4，装配时常驻 `bf_pogun`，单项来源 ×0.6；06 §8.6"少林棍僧拆招心得"）；`ps_fumozhangfa_dacheng` 大成（10，"伏魔"冷却 0）。
- **setTags**：`[set_shaolin_gunseng]`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_luohantang, 10}`；`{master, ch08_luding, npc_shaolin_shibaluohan, 10}`。倚天不列可学来源（C14）。

##### 燃木刀法 `sk_ranmudaofa`（地上 9 · 兵器·刀 · 天龙 · 原著）

- **简述**：《天龙八部》中鸠摩智以小无相功为根基冒用燃木刀法，展示刀锋未及木材而木先焦燃的功力（原著；不作逐字引文）。本作把它机制化为刀带灼热内劲。**刀法进阶链**：戒刀法（黄上）→ 慈悲刀（玄上）→ 燃木刀法（地上）。
- **基本**：`yang` · 0.40/0.60 · `weaponReq {category: blade}` · `layerStats {crit [2,8], hit [1,7]}`（15）· moveSlots 4；招式 `tags [fire]`。
- **reqs**：`attrs {str 45, wis 50}`、`aptitude {apBlade 50}`、`prereq [{skill: sk_cibeidao, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。
- **层数要点**：1 燃木、离焰、炽热｜4 焚香、刀劲｜6 刀气燎原｜7 业火燃木（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 燃木 | `mv_ranmudaofa_ranmu` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | `bf_zhuoshao` 30% 2 | 可 | 1.17−0.03 |
| 离焰 | `mv_ranmudaofa_liyan` | 1 | `aoe_sweep` | 1 | 0.85 | 8% | 1 | `bf_zhuoshao` 20% 2 | 可 | 0.75×1.17−0.02 |
| 焚香 | `mv_ranmudaofa_fenxiang` | 4 | `aoe_line` n3 | 1–3 | 0.88 | 9% | 2 | `bf_zhuoshao` 30% 2 | 可 | 0.80×1.34×0.85−0.03 |
| 刀气燎原 | `mv_ranmudaofa_liaoyuan` | 6 | `aoe_cone` n3 | 1 | 0.90 | 9% | 3 | `bf_zhuoshao` 40% 2；`terrainFx` 点燃草地（08） | 可 | 0.65×1.46−0.04=0.91 |
| 业火燃木（绝） | `mv_ranmudaofa_yehuo` | 7 | `aoe_single` | 1 | 2.90 | 9% | — | `bf_zhuoshao` 100% 2 | 可 | 3.0−0.10 |

- **被动**：`ps_ranmudaofa_chire` 炽热（1，对带 `bf_zhuoshao` 的目标 Z3 +4%→+10%）；`ps_ranmudaofa_daojin` 刀劲（4，Z2 4%→10%）；`ps_ranmudaofa_dacheng` 大成（10，本武学灼烧持续 +1）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **conflicts**：`{with: sk_huoyandao, type: synergy, note: 以火焰刀内劲催动（天龙鸠摩智）——同装配时本武学 Z3 +5%}`。
- **获取**：`{master, ch01_tianlong, npc_shaolin_fangzhang, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

##### 达摩剑法 `sk_damojianfa`（地下 7 · 兵器·剑 · 笑傲）

- **简述**：达摩院所传剑法，剑意取“面壁”“一苇”“只履西归”诸典；“达摩剑法”是否见于《笑傲江湖》及施用人物待 K-01 核定，招名与效果为原创扩展。少林非剑派，此为寺中唯一地阶剑法。**剑法进阶链**：罗汉剑法（黄上）→ 伏魔剑法（玄中）→ 达摩剑法（地下）。
- **基本**：`harmony` · 0.55/0.45 · `weaponReq {category: sword}` · `layerStats {parry [3,9], hit [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {agi 40, wis 40}`、`aptitude {apSword 40}`、`prereq [{skill: sk_fumojian, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 面壁、直指人心、禅剑｜4 一苇、静中生慧｜6 只履西归｜7 见性成佛（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 位移 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 面壁 | `mv_damojianfa_mianbi` | 1 | `aoe_self` | 0 | — | 5% | 2 | `bf_jingshi`（自身，静势） | — | 架势（收招 800） |
| 直指人心 | `mv_damojianfa_zhizhi` | 1 | `aoe_single` | 1 | 1.15 | 8% | 1 | `bf_polu` 20% 2 | 可 | 1.17−0.02 |
| 一苇 | `mv_damojianfa_yiwei` | 4 | `aoe_dash` n4 | 1–4 | 1.20 | 8% | 2 | 突进 | 可 | 1.29−0.10=1.19 |
| 只履西归 | `mv_damojianfa_zhilv` | 6 | `aoe_single` | 1 | 1.20 | 8% | 2 | 出招后后撤 2 | 可 | 1.29−0.10=1.19 |
| 见性成佛（绝） | `mv_damojianfa_jianxing` | 7 | `aoe_line` n4 | 1–4 | 2.15 | 9% | — | `bf_polu` 100% 2 | 可 | 3.0×0.75−0.10 |

- **被动**：`ps_damojianfa_chanjian` 禅剑（1，trigger `onParry`，`bf_xieli` 1）；`ps_damojianfa_jingzhong` 静中生慧（4，静势 ≥ 2 层时本武学 Z3 +8%）；`ps_damojianfa_dacheng` 大成（10，"面壁"冷却 0）。
- **setTags**：`[set_shaolin_damo]`。
- **获取**：`{master, ch05_xiaoao, npc_shaolin_damoyuan, 10}`。倚天不列可学来源（C14）。

##### 袈裟伏魔功 `sk_jiashafumogong`（地中 8 · 兵器·奇门（袈裟） · 天龙 · 原著）

- **简述**：《天龙八部》中袈裟伏魔功列入少林绝技，鸠摩智亦以小无相功为根基施展（原著）；本文将其配成可持袈裟类奇门兵器的卷缠与护身体系。
- **基本**：`harmony` · 0.40/0.60 · `weaponReq {category: exotic, kinds: [misc], tags: [jiasha]}`（袈裟类奇门兵器 `eq_jiasha_*` 由 design/10 定义；缺 `jiasha` 标签时"卷""罩"失去附带效果，05 §6.2）· `layerStats {parry [3,9], eva [1,6]}`（15）· moveSlots 4。
- **reqs**：`attrs {wis 45, agi 40}`、`aptitude {apExotic 45}`、`prereq [{skill: sk_damoxinjing, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 卷、拂、柔中带刚｜4 罩、袖里乾坤｜5 拂暗器｜7 袈裟伏魔（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 卷 | `mv_jiashafumogong_juan` | 1 | `aoe_pull` n1 | 1–2 | 0.95 | 8% | 1 | `bf_chanrao` 20% 2 | 可 | 0.95×1.17−0.10−0.05 |
| 拂 | `mv_jiashafumogong_fu` | 1 | `aoe_sweep` | 1 | 0.85 | 8% | 1 | — | 可 | 0.75×1.17=0.88（−0.03） |
| 罩 | `mv_jiashafumogong_zhao` | 4 | `aoe_sq3` | 1–2 | 0.77 | 9% | 2 | `bf_muxuan` 30% 2 | 可 | 0.60×1.34−0.03 |
| 拂暗器 | `mv_jiashafumogong_fuqi` | 5 | `aoe_self` | 0 | — | 6% | 3 | `bf_poanqi` 2（06 已收录） | — | 架势 |
| 袈裟伏魔（绝） | `mv_jiashafumogong_fumo` | 7 | `aoe_around` | 0 | 1.80 | 9% | — | `bf_chanrao` 50% 2 | 可 | 3.0×0.65−0.125 |

- **被动**：`ps_jiashafumogong_rougang` 柔中带刚（1，Z2 4%→10%）；`ps_jiashafumogong_xiuli` 袖里乾坤（4，trigger 来袭 `projectile` 20%→40% 拂落，每回合 1 次）；`ps_jiashafumogong_dacheng` 大成（10，"卷"对持械目标附带 `bf_jiaoxie` 20%）。
- **setTags**：`[set_mizong_mingwang]`（鸠摩智跨组人物套装，C22）。
- **获取**：`{master, ch01_tianlong, npc_shaolin_damoyuan, 10}`；`{observe, ch01_tianlong, npc_jiumozhi, 6, reqsOverride {sect: null, prereq: []}}`。

#### 1.6.6 轻功与阵法（2 门）

##### 一苇渡江 `sk_yiweidujiang`（地上 9 · 轻功 · 天龙 · 原创扩展定级）

- **简述**：典出达摩折苇渡江的传说；基准 §11 以"一苇渡江"描述五阶·凌虚轻功。本作将其定为少林最高轻功（地上），列入七十二绝技（原创纳入）。只在高武书界原生，与 03 §4.5.2"中武最高原生轻功地中"的假设一致。
- **基本**：`neutral`；`QS(9) = 120`（10 重时 `Q_skill` 120，03 §4.5）；`layerStats {eva [3,10], tough [1,5]}`（15）；轻功非核心、不可携带。
- **reqs**：`attrs {agi 50, wil 45}`、`aptitude {apLight 50}`、`prereq [{skill: sk_bihuyouqiang, layer: 5}]`、`sect {id: sect_shaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 一苇、身轻｜4 踏苇｜5 踏水｜6 随波｜7 飞渡（绝）｜10 大成。

| 招式 | ID | 层 | 类型 | 耗内 | 冷却 | 效果 |
|---|---|---|---|---|---|---|
| 一苇 | `mv_yiweidujiang_yiwei` | 1 | utility `aoe_self` | 5% | 2 | 本回合移动可越过深水 `tr_shenshui` ≤ 2 格（4 重 3、7 重 4）；`bf_jixing` 1 |
| 踏苇 | `mv_yiweidujiang_tawei` | 4 | utility（自身 `leap` r3，无伤害） | 6% | 3 | 跃至 3 格内合法落点；`bf_piaohu` 2 |
| 随波 | `mv_yiweidujiang_suibo` | 6 | stance | 5% | 3 | `bf_youshi` 3 |
| 飞渡（绝） | `mv_yiweidujiang_feidu` | 7 | utility，`rageCost 100` | 7% | — | `bf_zaidong` ×1（立即再行动一次；"一苇渡江，瞬息千里"） |

- **被动**：`ps_yiweidujiang_shenqing` 身轻（1，按 QS 提供轻功值）；`ps_yiweidujiang_tashui` 踏水（5，mechanic，战斗中可在深水格停留 1 回合，第 2 回合须离开）；`ps_yiweidujiang_dacheng` 大成（10，`qinggong` flat +10；专精角色可达 qg5，03 §4.5.2 倚天行）。
- **获取**：`{qiyu, ch01_tianlong, q_01_qiyu_82, 10, reqsOverride {sect: null}, note: 少室山达摩洞面壁（原创扩展，需 wil ≥ 60）}`。`setTags [set_shaolin_damo]`；倚天不列可学来源（C14）。

##### 金刚伏魔圈 `sk_jingangfumoquan`（地上 9 · 杂学·阵法（合击） · 倚天 · 原著）

- **简述**：《倚天屠龙记》后段，渡厄、渡劫、渡难三僧坐于少室山后峰三株古松间，各持长索结“金刚伏魔圈”守护囚禁谢逊之处；张无忌曾与杨逍、周芷若等分别配合闯圈（原著）。
- **阵法规则以 09 §6.8.3 为准**（`special.formation`）：三角三点阵型、三名成员**坐关**（不能移动，免疫击退/牵引/换位）、圈域 = 三角凸包、“伏魔”（圈域内敌人每回合 `bf_fengqinggong`）、“索网”（持长索时圈域内皆在射程）、“三力一心”（受伤 50% 平分给另两人）及专属破法。正式 ID 为 `sk_jingangfumoquan`；C12 已解决旧名迁移，09 当前生产引用也已使用正式 ID。本卡只补武学本体：层数、招式、被动、学习。
- **基本**：`yang` · 0.30/0.70（持鞭索时"黑索锁拿"改 0.60/0.40）· 强度技艺 `formation`（05 §2.3；09 §6.8.0 强度 ×(1 + formation/200)）· `layerStats {parry [3,10], resCC [1,5]}`（15）· `fusible: false`。
- **reqs**：`attrs {wil 50, wis 45}`、`skills {formation: 50}` **【建议值】**、`prereq [{skill: sk_fumosuofa, layer: 5}]`、`sect {id: sect_shaolin, rank: 5}`、`hard: [sect, prereq]`。`formation` 是软门槛；罗汉阵不再作为倚天本土硬前置，可作为阵法修炼加速项由 `design/09` 配置。
- **层数要点**：1 布圈、黑索锁拿、古松之定｜4 禅心坚定｜5 一心补隙｜7 松间伏魔（绝）｜10 二僧成圈。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 / 效果 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 布圈 | `mv_jingangfumoquan_buquan` | 1 | 阵位（坐关） | — | — | 8% | 5 | 就位坐关；三人到位即成阵（09 §6.8.0 检查时机） | — | 阵法行动 |
| 黑索锁拿 | `mv_jingangfumoquan_suona` | 1 | `aoe_single` | 1–3（阵成且持长索：圈域内任意） | 0.90 | 8% | 1 | `bf_chanrao` 30% 2 | 可 | 1.17×0.85−0.075 |
| 禅心坚定 | `mv_jingangfumoquan_chanxin` | 4 | 阵员 | — | — | 7% | 4 | 阵员各驱散 1 个 `cc` 或 `mind`（≤ 品阶），用于化解 09"阵滞" | — | 支援 |
| 松间伏魔（绝） | `mv_jingangfumoquan_fumo` | 7 | 圈域内全部敌人 | — | 1.30 | 9% | — | `bf_dingshen` 100% 1；合璧：其余阵员集气 −300 同时出手（09） | 可 | 3.0×0.60×0.85−0.25=1.28 |

- **被动**：`ps_jingangfumoquan_songxin` 古松之定（1，阵员 Z4 +4%→+10%）；`ps_jingangfumoquan_buxi` 一心补隙（5，09“一心之隙”使三力一心失效的时间由 2 轮减为 1 轮）；`ps_jingangfumoquan_dacheng` 二僧成圈（10，2 人亦可成阵，阵域改为两人连线两侧各 1 格，效果 ×0.75；09 已提供 `minMembers` 接口）。
- **特殊**：合击类地阶（05 §14.6 地阶合击 ≤ 3%，本文仅此 1 门）。敌方三渡版见 §3.3。
- **setTags**：`[set_sandu]`。
- **获取**：`{master, ch04_yitian, npc_duee, 10, note: 闯圈事件后渡厄相授（原创扩展）}`；队友经 `combo`（05 §7.7：羁绊 ≥ 3、合击 5 次）领悟。

### 1.7 玄阶·黄阶紧凑表（嵩山少林 35 门）

> 记法：招式格 `名 mv_后缀 (层) 范围·射程·倍率·耗内·冷却[·附带]`；未写射程 = 1、未写收招 = 1000、架势收招 800。所有倍率按 05 §4.2 核算（玄耗内基准 6%、黄 5%），手调幅度 ≤ 0.05。`layerStats` 合计：黄 ≤ 6、玄 ≤ 10。招式与被动的完整 ID = `mv_<武学拼音>` / `ps_<武学拼音>` ＋ 表中后缀（如少林桩功"扎马 `_zhama`" = `mv_shaolinzhuanggong_zhama`）。

#### 1.7.1 铜人横练 `sk_tongrenhenglian`（玄上 6 · 内功·横练 · 天龙/倚天/笑傲/鹿鼎 · 原创扩展）——用户示例套装成员

- **简述**：罗汉堂外门横练，弟子须"闯铜人巷"方得传授（民间"少林十八铜人"传说的化用，原创扩展）。横练链起点：铜人横练 → 铁布衫 → 金钟罩 → 金刚不坏体。
- **基本**：`yang`；`inner.contribution {mpMaxPct 14, hpMaxPct 15.5, attrs {con 6, str 4}, mpRegen 1.5, stats {defOut 6, resCC 4}}`（IP 14+15.5+20+7.5 = 57 ✓；mp −30%、hp +29%、属性 +25%、回内 −17%）；moveSlots 3。
- **reqs**：`attrs {con 30, str 30}`、`aptitude {apInner 25}`、`prereq [{skill: sk_shaolinzhuanggong, layer: 4}]`、`sect {id: sect_shaolin, rank: 3}`、`hard: [sect, prereq]`。
- **招式**：铜身 `mv_tongrenhenglian_tongshen`（1）架势·`bf_waifang_sheng` 2·5%·cd2｜铜臂撞 `mv_tongrenhenglian_tongbi`（1）单体·0.95·6%·cd0·击退 1（1−0.05；wOut/wIn 覆写 0.80/0.20）｜千斤坠 `mv_tongrenhenglian_qianjin`（4）架势·`bf_wenzhong` 3·5%·cd3｜铜人巷 `mv_tongrenhenglian_tongrenxiang`（7）`aoe_around`·0.80·7%·cd2·击退 1（0.65×1.29−0.05=0.79）。
- **被动**：`ps_tongrenhenglian_henglian` 横练（1，Z4 近战来袭 −2%→−6%，`scaled`）；`ps_tongrenhenglian_zhaomen` 罩门（1，伴生 `bf_zhaomen`，品阶 = 本功）；`ps_tongrenhenglian_tongpi` 铜皮（5，trigger `onHurt` 近战，`bf_renjin` 1，每回合 1 次）；`ps_tongrenhenglian_dacheng` 横练大成（10，常驻 `bf_mian_liuxue`，06 所列"横练大成"）。
- **setTags**：`[set_shaolin_jingang, set_shaolin_henglian]`。
- **获取**：`{master, ch01_tianlong / ch04_yitian / ch05_xiaoao / ch08_luding, npc_shaolin_luohantang, 10, note: 须完成"闯铜人巷"事件 q_NN_faction_81（原创扩展）}`。

#### 1.7.2 内功与拳脚（玄/黄，表内 15 门；罗汉拳见表后注）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 获取要点 |
|---|---|---|---|---|
| `sk_shaolinzhuanggong` 少林桩功 · 黄下 1 | 阳 · 0/1 · 贡献 `{mp 6, hp 4, con 1, str 1, mpRegen 1.0}`（IP 19）· stats `{resCC 3, parry 3}` | `sect {id: sect_shaolin, rank: 1}` | 扎马 `_zhama`（1）架势·`bf_wenzhong` 2·4%·cd3 | `_zhuangwen` 桩稳（1，resCC +2→+6）；`_yuanman`（10，首次练满 `con` +1，全游戏一次）。入寺第一课 |
| `sk_shaolinxinfa` 少林心法 · 黄中 2 | 阳 · 0/1 · 贡献 `{mp 8, hp 5, con 2, str 1, mpRegen 1.0}`（IP 24）· stats `{resInjury 3, defOut 3}` | `sect {id: sect_shaolin, rank: 1}` | 调息 `_tiaoxi`（1）自身·`bf_huinei` 3·0%·cd4·收招 900 | `_zhengzong` 少林正宗（1，主运时少林拳脚招式 Z3 +1%→+4%，`auxMode: none`）；`_yuanman`（10，少林武学修炼 +5%） |
| `sk_tongzigong` 童子功 · 玄下 4 | 阳 · 0/1 · 贡献 `{mp 13, hp 9.5, con 4, str 2, mpRegen 1.4}`（IP 41.5）· stats `{resInjury 5, tough 5}` | `attrs {con 30}`；`sect {id: sect_shaolin, rank: 2}` | 童子拜佛 `_baifo`（1）自身·`bf_jiangu` 2·5%·cd3｜元阳劲 `_yuanyang`（4）单体·1.15·7%·cd1（1.17；wOut/wIn 覆写 0.60/0.40） | `_zaolian` 早练（1，习得时显示等级 ≤ 20 则本功修炼 +30%）；`_guben` 固本（5，`battleStart` → `bf_guben` 3）。清代民间名目，原创纳入；书剑经南少林习得 |
| `sk_damoxinjing` 达摩心经 · 玄中 5 | 调和 · 0/1 · 贡献 `{mp 18, hp 9, wis 3, wil 4, mpRegen 1.5}`（IP 48.5）· stats `{resMind 5, effRes 5}` | `attrs {wis 30, wil 30}`；`sect {id: sect_shaolin, rank: 3}` | 面壁观心 `_mianbi`（1）自身·驱散 1 个 `mind`＋`bf_dingxin` 3·6%·cd3｜静坐 `_jingzuo`（4）架势·`bf_yangshi` 3·4%·cd3｜禅力 `_chanli`（7）友方 r1·`bf_shouyi` 3·6%·cd3 | `_fofa` 佛法根基（1，mechanic，§1.3.1）；`_dacheng`（10，同装配少林内功辅运比例 +0.05）。袈裟伏魔功前置 |
| `sk_weituozhang` 韦陀掌 · 黄中 2 | 阳 · 0.75/0.25 · `{parry [1,3], defOut [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 韦陀护法 `_hufa`（1）单体·1.00·5%·cd0｜捧杵 `_pengchu`（4）单体·1.10·6%·cd1·击退 1（1.17−0.05）｜分山 `_fenshan`（7）`aoe_sweep`·0.85·6%·cd1 | `_duanning` 端凝（5，parry +2）；`_yuanman`（10，学般若掌/韦陀杵/降魔杵资质软门槛 −10）。虚竹是否明确习过此名目待 K-06 核定 |
| `sk_fuhuquan` 伏虎拳 · 黄上 3 | 阳 · 0.85/0.15 · `{hit [1,3], crit [1,3]}` | `prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 1}`。射雕/侠客来源：`reqsOverride {prereq: [{skill: sk_weituozhang, layer: 4}]}` | 伏虎 `_fuhu`（1）单体·1.15·6%·cd1｜擒虎 `_qinhu`（4）`aoe_pull` n1·1–2·1.00·6%·cd1｜饿虎扑食 `_pushi`（7）`aoe_dash` n3·1.20·6%·cd2（1.29−0.10） | `_huwei` 虎威（5，`onKill` → `bf_waigong_sheng` 2）；`_dacheng`（10，对拳脚类敌人 Z3 +5%）。大金刚拳前置 |
| `sk_shuaibeishou` 摔碑手 · 玄下 4 | 阳 · 0.75/0.25 · `{defOut [1,5], parry [1,5]}` | `attrs {str 25}`；`prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 2}`。侠客来源：`reqsOverride {prereq: [{skill: sk_weituozhang, layer: 4}]}` | 摔碑 `_shuaibei`（1）单体·1.15·7%·cd1·`bf_pojia` 30%（1.17−0.03）｜劈石 `_pishi`（3）单体·1.35·8%·cd2·收招 1100·击退 1（1.41−0.05）｜推碑 `_tuibei`（6）`aoe_line` n2·0.95·7%·cd1·击退 1 | `_shouli` 手力（1，Z2 3%→8%）；`_xiaocheng`（5，对 `bf_pojia` 目标 Z3 +6%）；`_dacheng`（10，劈石冷却 −1）。心意把前置 |
| `sk_tieshazhang` 铁砂掌 · 玄中 5 | 以 05 §2.8 为准：阳 · 0.75/0.25 · `{defOut [1,6]}` | `attrs {str 35, con 30}`；`prereq [{skill: sk_luohanquan, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}` | 开碑手（1）1.05·破甲 25%｜推山掌（4）`aoe_line` n2·1.00·击退｜砂掌连环（7）1.45×3｜金刚掌印（10，绝）3.00·内伤 60% | 砂掌/铁臂（`bf_tiebi`）/铁砂大成；`setTags [set_shaolin_jingang]`；`conflicts` 绵掌 `sk_mianzhang`（武当，道家组）clash。大金刚掌前置 |
| `sk_xinyiba` 心意把 · 玄上 6 | 阳 · 0.70/0.30 · `{hit [1,5], crit [1,5]}` | `attrs {str 30, agi 30}`；`aptitude {apFist 30}`；`prereq [{skill: sk_shuaibeishou, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 把子 `_bazi`（1）单体·1.05·6%·cd0·收招 900｜龙身 `_longshen`（3）`aoe_dash` n2·1.05·7%·cd1｜熊膀 `_xiongbang`（5）单体·1.25·7%·cd2·击退 1｜虎抱头 `_hubaotou`（7）单体·1.15·7%·cd1·`bf_pojia` 30%｜**心意合一（绝）** `_heyi`（10）单体·3.50·8%·`bf_xuanyun` 30%（3.0×1.2−0.075） | `_liuhe` 六合（1，连续两回合使用本武学 → `bf_ruiyi` 1）；`_xiaocheng`（5，本武学破招 +5）。民间嵩山少林"心意把"，原创纳入 |
| `sk_dacidabeiqianyeshou` 大慈大悲千叶手 · 玄上 6 | 调和 · 0.60/0.40 · `{combo [1,5], parry [1,5]}` | `attrs {agi 30, wis 30}`；`aptitude {apFist 30}`；`sect {id: sect_shaolin, rank: 3}`。海大富来源：`reqsOverride {sect: null}` | 千叶 `_qianye`（1）`aoe_multi` n4 r1·1.00（4 段）·7%·cd1｜慈悲 `_cibei`（1）架势·`bf_yuanzhuan` 2·5%·cd2｜佛海 `_fohai`（4）单体·1.25·7%·cd2·`bf_chizhi` 30%｜渡厄 `_due`（7）`aoe_pull` n2·1–3·1.13·7%·cd2 | `_qianshou` 千手千眼（1，本武学被招架时 30% 追加一段 ×0.5，每回合 1 次）；`_cibei` 慈悲（5，制服）。《鹿鼎记》中海大富传韦小宝、韦小宝再与康熙过招；其招名和少林归属待 K-07 核定 |
| `sk_jingangzhi` 金刚指 · 玄下 4 | 阳 · 0.60/0.40 · `{seal [2,6], hit [1,4]}` | `attrs {agi 25}`；`sect {id: sect_shaolin, rank: 2}` | 指力 `_zhili`（1）单体·1–2·1.00·7%·cd1（1.17×0.85）｜点穴 `_dianxue`（3）单体·1.10·7%·cd1·`bf_fengxue` 25%｜穿石 `_chuanshi`（6）`aoe_pierce`·1.15·7%·cd2 | `_xiaocheng`（5，本武学点穴持续 +1）；`_dacheng`（10，学一指禅/摩诃指/多罗叶指/大力金刚指资质软门槛 −10）。指法链起点 |
| `sk_tantui` 少林弹腿 · 黄中 2 | 中性 · 0.90/0.10 · `{eva [1,3], hit [1,3]}` | 无 | 弹腿 `_tantui`（1）单体·1.00·4%·cd0·收招 900｜扫堂 `_saotang`（4）`aoe_sweep`·0.80·5%·cd1·`bf_panshan` 30%｜连环弹踢 `_lianti`（7）单体·1.10（2 段）·5%·cd1 | `_shilu` 十路（5，命中后 `bf_jixing` 1，每回合 1 次）；`_yuanman`（10）。民间"少林弹腿/十路弹腿"（亦有教门弹腿之说），原创纳入；持械不降效 |
| `sk_tiesaozhou` 铁扫帚 · 玄中 5 | 阳 · 0.80/0.20 · `{hit [1,5], parry [1,5]}` | `prereq [{skill: sk_tantui, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。天龙来源：`reqsOverride {prereq: [{skill: sk_luohanquan, layer: 4}]}` | 铁扫帚 `_saozhou`（1）`aoe_sweep`·0.85·7%·cd1·`bf_panshan` 40%｜勾腿 `_goutui`（3）单体·1.10·7%·cd1·`bf_dingshen` 20%｜旋风扫 `_xuanfeng`（6）`aoe_around`·0.85·8%·cd2·`bf_panshan` 30% | `_tietui` 铁腿（1，Z2 3%→8%）；`_xiaocheng`（5，对 `bf_panshan` 目标 Z3 +8%）。民间七十二艺，原创纳入；如影随形腿前置 |
| `sk_shaolinqinna` 少林擒拿手 · 黄上 3 | 阳 · 0.85/0.15 · `{seal [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 拿腕 `_nawan`（1）单体·1.10·6%·cd1·`bf_jiaoxie` 20%（持械）｜错骨 `_cuogu`（4）单体·1.10·6%·cd1·`bf_fengjingmai` 20%｜锁肩 `_suojian`（7）`aoe_pull` n1·1.00·6%·cd1 | `_naxue` 拿穴（5，命中 10% `bf_fengxue`）；`_yuanman`（10，学龙爪手资质软门槛 −10）。05 龙爪手前置（≥ 5 重） |
| `sk_yingzhuagong` 鹰爪功 · 玄中 5 | 阳 · 0.75/0.25 · `{seal [1,5], crit [1,5]}` | `prereq [{skill: sk_shaolinqinna, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。书剑来源：`reqsOverride {sect: {id: sect_nanshaolin, rank: 3}, prereq: [{skill: sk_hongquan, layer: 4}]}` | 鹰爪 `_yingzhua`（1）单体·1.15·7%·cd1·`bf_liuxue` 30%｜鹰击长空 `_yingji`（3）`aoe_leap`·1–3·1.05·7%·cd2｜分筋 `_fenjin`（6）单体·1.23·7%·cd2·`bf_fengjingmai` 30% | `_zhuali` 爪力（1，Z2 3%→8%）；`_dacheng`（10，对 `bf_fengjingmai` 目标 Z3 +8%）。民间"鹰爪力"，原创纳入 |

> `sk_luohanquan` 罗汉拳（黄下 1）以 05 §13.8 为准：罗汉拜佛（1，0.90）、罗汉撞钟（4，1.05，击退）、罗汉推山（7，`aoe_line` n2，0.95）；被动拳架扎实、入门圆满；`setTags [set_shaolin_luohan]`。

#### 1.7.3 兵器、轻功、暗器、杂学（玄/黄，18 门）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 获取要点 |
|---|---|---|---|---|
| `sk_shaolingunfa` 少林棍法 · 黄中 2 | 中性 · 0.85/0.15 · `weaponReq staff` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 横扫 `_hengsao`（1）`aoe_sweep`·0.85·5%·cd1｜挑刺 `_tiaoci`（1）单体·1–2·0.95·5%·cd0（射程 2 手调 −0.05）｜劈棍 `_pigun`（4）单体·1.25·6%·cd1·收招 1100 | `_shisan` 十三棍僧（5，每名装配少林棍法的相邻队友使自身 parry +2，≤ +6；"十三棍僧救唐王"民间传说，原创扩展）；`_yuanman`（10）。棍杖链起点；书剑经南少林习得 |
| `sk_yinshougun` 阴手棍 · 玄下 4 | 中性 · 0.80/0.20 · `staff` · `{parry [1,5], hit [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 4}]`；`sect {id: sect_shaolin, rank: 2}` | 阴手 `_yinshou`（1）单体·1–2·1.15·7%·cd1｜封门 `_fengmen`（3）架势·`bf_jieji` 2·5%·cd2｜连枝 `_lianzhi`（6）单体·1.30（2 段）·7%·cd2 | `_changbing` 长兵之利（1，敌人进入相邻格后本武学下一招 Z3 +5%）；`_dacheng`（10）。明·程宗猷《少林棍法阐宗》所记“阴手”持法（史实名目），原创纳入；明代书界（笑傲/侠客）与鹿鼎 |
| `sk_yachagun` 夜叉棍法 · 玄中 5 | 阳 · 0.75/0.25 · `staff` · `{crit [1,5], defOut [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 夜叉探海 `_tanhai`（1）单体·1–2·1.15·7%·cd1｜夜叉分水 `_fenshui`（3）`aoe_sweep`·0.85·8%·cd1·击退 1｜夜叉劈山 `_pishan`（6）单体·1.35·8%·cd2·收招 1100·`bf_chihuan` 30%｜**罗刹乱舞（绝）** `_luosha`（10）`aoe_around`·2.30·8%·击退 1（3.0×1.2×0.65−0.05） | `_xiongmeng` 凶猛（1，Z2 3%→8%）；`_xiaocheng`（5，横扫类招式击退 +1）。民间少林大小夜叉棍，原创纳入；伏魔杖法前置 |
| `sk_jiedaofa` 戒刀法 · 黄上 3 | 中性 · 0.85/0.15 · `blade` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 戒刀 `_jiedao`（1）单体·1.00·5%·cd0｜横劈 `_hengpi`（3）`aoe_sweep`·0.85·6%·cd1｜戒杀 `_jiesha`（7）单体·1.30·6%·cd2 | `_jiesha` 戒杀（5，mechanic，制服）。刀法链起点 |
| `sk_cibeidao` 慈悲刀 · 玄上 6 | 调和 · 0.60/0.40 · `blade` · `{parry [2,6], defIn [1,4]}` | `prereq [{skill: sk_jiedaofa, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}`。侠客来源：`reqsOverride {sect: {id: sect_shaolin, rank: 4}, prereq: []}` | 慈悲 `_cibei`（1）单体·1.15·7%·cd1｜息事 `_xishi`（3）单体·1.10·7%·cd1·`bf_waigong_jiang` 50%｜回刀 `_huidao`（5）架势·`bf_houfa` 2·5%·cd3｜渡化 `_duhua`（8）`aoe_cone` n2·0.95·8%·cd2·`bf_waigong_jiang` 30% | `_buren` 不忍（1，制服）；`_daoyi` 刀意（5，`onParry` → `bf_xieli` 1）；`_dacheng`（10，Z3 +6%）。燃木刀法前置 |
| `sk_luohanjian` 罗汉剑法 · 黄上 3 | 中性 · 0.85/0.15 · `sword` · `{parry [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 罗汉刺 `_ci`（1）单体·1.00·5%·cd0｜横剑 `_hengjian`（3）`aoe_sweep`·0.85·6%·cd1｜护法剑 `_hufa`（7）架势·`bf_yuanzhuan` 2·5%·cd2 | `_yuanman`（10）。剑法链起点 |
| `sk_fumojian` 伏魔剑法 · 玄中 5 | 阳 · 0.70/0.30 · `sword` · `{parry [1,5], crit [1,5]}` | `prereq [{skill: sk_luohanjian, layer: 4}]`；`sect {id: sect_shaolin, rank: 3}`。侠客来源：`reqsOverride {sect: {id: sect_shaolin, rank: 4}, prereq: []}` | 伏魔 `_fumo`（1）单体·1.15·7%·cd1｜斩妖 `_zhanyao`（3）单体·1.50·8%·cd2·条件：目标品德 ≤ −20（常见条件 +0.15）｜剑阵 `_jianzhen`（6）`aoe_line` n3·1.05·8%·cd2 | `_zhengqi` 正气（1，对邪派目标 Z3 +3%→+8%）；`_dacheng`（10）。传统同名不足以证明小说出处，按原创扩展处理；达摩剑法前置 |
| `sk_xiangmochu` 韦陀降魔杵 · 玄上 6 | 阳 · 0.75/0.25 · `weaponReq {exotic, kinds [pestle]}` · `{defOut [1,5], crit [1,5]}` | `prereq [{skill: sk_weituozhang, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 降魔 `_xiangmo`（1）单体·1.25·7%·cd1·收招 1100｜镇魔 `_zhenmo`（3）`aoe_around`·0.85·8%·cd2·`bf_chihuan` 30%｜破甲 `_pojia`（6）单体·1.23·7%·cd2·`bf_pojia` 60% | `_zhongbing` 重兵（1，Z2 4%→10%）；`_dacheng`（10）。韦陀菩萨持杵之像，原创扩展（10 奇门 `pestle` 为双手 `heavy`） |
| `sk_fumosuofa` 伏魔索法 · 玄上 6 | 阳 · 0.60/0.40 · `whip` · `{hit [1,5], parry [1,5]}` | `sect {id: sect_shaolin, rank: 3}` | 黑索 `_suo`（1）单体·1–3·1.10·7%·cd1·`bf_chanrao` 20%｜盘索 `_pansuo`（3）`aoe_pull` n2·1–3·1.10·7%·cd2｜环圆 `_huanyuan`（6）`aoe_ring` r2·0.75·8%·cd2 | `_suoxin` 索心（1，Z2 3%→8%）；`_fumo` 伏魔（5，与金刚伏魔圈同装配且阵成时，"索网"外本武学射程 +1）。取三渡长索之意，原创扩展 |
| `sk_luohanbu` 罗汉步 · 黄中 2 | 轻功 · `QS 38` · `{eva [1,3], hit [1,3]}` | `sect {id: sect_shaolin, rank: 1}`；书剑来源 `reqsOverride {sect: {id: sect_nanshaolin, rank: 1}}` | 换步 `_huanbu`（1）自身·`bf_jixing` 1·3%·cd2 | `_wenbu` 步稳（5，resCC +3）。全部少林书界＋书剑 |
| `sk_meihuazhuang` 梅花桩 · 玄下 4 | 轻功 · `QS 56` · `{eva [1,5], resCC [1,5]}` | `sect {id: sect_shaolin, rank: 2}` | 桩步 `_zhuangbu`（1）架势·`bf_wenzhong` 2·4%·cd2｜跳桩 `_tiaozhuang`（4）自身 `leap` r3＋`bf_tengyue` 2·4%·cd3 | `_zhuanggong` 桩功（5，立于比相邻敌人高 ≥ 1 级的格上时 parry +5）。民间名目，原创纳入 |
| `sk_bihuyouqiang` 壁虎游墙功 · 玄中 5 | 轻功 · `QS 65` · `{eva [1,5], hit [1,5]}` | `sect {id: sect_shaolin, rank: 3}` | 游墙 `_youqiang`（1）本回合可沿墙体/崖壁攀移 ≤ 3 级高差（08）·4%·cd2｜贴壁 `_tiebi`（4）架势·`bf_piaohu` 2·4%·cd3 | `_panya` 攀崖（5，探索攀爬体力消耗 −30%，08）。民间七十二艺，原创纳入；一苇渡江前置 |
| `sk_putizi` 菩提子 · 黄上 3 | 暗器 · 0.90/0.10 · `{hit [1,3], seal [1,3]}` | `sect {id: sect_shaolin, rank: 1}` | 弹子 `_tanzi`（1）`aoe_bolt` 投射·2–5·1.00·5%·cd1（0.92×1.12，手调 −0.03）｜打穴 `_daxue`（4）投射·2–5·0.95·5%·cd1·`bf_fengxue` 20% | `_putixin` 菩提心（5，不淬毒时效果命中 +5）。以念珠菩提子为弹，原创扩展 |
| `sk_jingangnianzhu` 金刚念珠 · 玄上 6 | 暗器 · 0.85/0.15 · `{hit [1,5], seal [1,5]}` | `prereq [{skill: sk_putizi, layer: 5}]`；`sect {id: sect_shaolin, rank: 3}` | 连珠 `_lianzhu`（1）`aoe_chain` n3 投射·2–5·0.85·7%·cd1｜定穴 `_dingxue`（3）`aoe_bolt`·2–5·1.13·7%·cd2·`bf_fengxue` 30%｜回旋 `_huixuan`（6）`aoe_boomerang` n3·0.90·8%·cd2 | `_foli` 佛力（1，Z2 3%→8%）；`_dacheng`（10）。原创扩展 |
| `sk_boruoxinjing` 般若心经 · 玄下 4 | 杂学·心神 · 资质按 `wil`（05 §2.3）· `{resMind [1,5], effRes [1,5]}` | `attrs {wil 25}`；`sect {id: sect_shaolin, rank: 2}`；书剑来源 `reqsOverride {sect: {id: sect_nanshaolin, rank: 2}}` | 诵经 `_songjing`（1）`aoe_allies` r2·友方各驱散 1 个 `mind`＋`bf_dingxin` 3·6%·cd3｜观自在 `_guanzizai`（4）自身·`bf_mian_xin` 1·6%·cd5 | `_fofa` 佛法根基（1，mechanic，§1.3.1）；`_wuguai` 心无挂碍（5，resMind +3→+8）。杂学不可携带：每个少林书界都要重新习得；`setTags [set_shaolin_banruo, set_saodiseng, set_sandu, set_chengguan]` |
| `sk_shaolinshangke` 少林伤科 · 玄中 5 | 杂学·医 · 强度按 `med` · `{healPower [2,6], resInjury [1,4]}` | `attrs {wis 30}`；`skills {med: 30}` **【建议值】**；`sect {id: sect_shaolin, rank: 3}` | 接骨 `_jiegu`（1）友方 r1·驱散 `injury.bone`（`bf_gushang`）＋回复 12%·5%·cd2｜推拿 `_tuina`（3）友方 r1·`bf_huoluo` 3＋回复 10%·6%·cd2｜正骨 `_zhenggu`（6）友方 r1·驱散 2 个 `injury`/`bleed`＋回复 18%·7%·cd3 | `_yizhe` 医者（1，解锁战斗外疗伤服务，见 `design/12`）；`_dahuan` 大还丹方（7，`unlockReqs {skills: {alchemy: 40}}` 时解锁 `it_dahuandan` 配方；物品与配方归 `design/10`；待考 K-10：核金庸小说中是否出现“少林大还丹”名目及使用情节）。专解大力金刚指之骨伤 |
| `sk_luohanzhen` 罗汉阵 · 玄上 6 | 杂学·阵法（合击） · 0.60/0.40 · `{parry [1,5], resCC [1,5]}` | `skills {formation: 30}` **【建议值】**；`sect {id: sect_shaolin, rank: 3}` | 布阵 `_buzhen`（1）与 ≥ 2 名装配本武学的友方相邻成阵：阵员 `bf_yuanhu` 2＋`bf_jiangu` 3·6%·cd5｜罗汉合击 `_heji`（3）单体·1.15·6%·cd2（目标须与 ≥ 2 名阵员相邻；命中后其余阵员各追加基础招式 ×0.4；1.24−0.10）｜十八罗汉 `_shibaluohan`（6）`aoe_allies` r2·`bf_zhuiji` 2·6%·cd4 | `_zhenshi` 阵势（1，每名相邻阵员 parry +2，≤ +10）。本作玩家版阵法为原创扩展；待考 K-11：核《天龙八部》《鹿鼎记》是否出现同名“罗汉阵”及其人数。阵法通用规则见 `design/09` §6.8.0（3–6 人、无固定阵眼）；18 人完整大阵为 NPC 机制（§3.3） |
| `sk_jingangnuhou` 金刚怒吼 · 玄上 6 | 杂学·音功 · 阳 · 0/1 · `{effHit [1,5], resMind [1,5]}` | `attrs {con 30, wil 30}`；`sect {id: sect_shaolin, rank: 3}` | 怒吼 `_nuhou`（1）`aoe_around`·0.58·7%·cd2·`bf_zhenshe` 30%·**只伤敌**（原创扩展：内敛之吼）｜震慑 `_zhenshe`（4）`aoe_cone` n3·0.60·7%·cd3·`bf_xieqi` 40%（0.65×1.41×0.7225−0.04，手调 −0.02） | `_weimeng` 威猛（1，`battleStart` 气势 +5）；`_dacheng`（10，本武学附带减益效果命中 +10）。06 已列为 `bf_zhenshe` 来源；狮子吼前置（≥ 5 重） |

---

## 2. 南少林 `sect_nanshaolin`（书剑）

### 2.1 简介

《书剑恩仇录》写有福建南少林传承；其现实寺址究属泉州还是莆田，以及小说所写人物关系与考较细节，须按三联版相关南少林段落逐字核对（待考 K-03）。民间关于寺毁与南派拳种流衍的说法不作史实定论；本作若采用“寺火”改命支线，只能标为原创扩展并由 `chapters/12` 决定。地图位置只接 `design/11` 的 `rg_minnan_nanshaolin` 建议 ID。

- **境界**：书剑为中武（携带 2/2/2、压制 −2）。南少林是书剑唯一的少林系传承，原生最高为地阶（虎鹤双形拳、铁布衫、一指禅），天级只有书剑原生的百花错拳、庖丁解牛掌（不属本组）。
- **与嵩山的关系**：同出少林一脉；是否互计“同门残篇”仍由 `design/02` §5.4 裁定，本文不重定义。嵩山 IDs 在书剑经南少林习得时一律 `reqsOverride {sect: {id: sect_nanshaolin, rank: Ln}}`。
- **职级**：与 `design/17` §5.2 对齐，采用 §0.4 的 T01 L1–L5；L4 可改走“洪门护法”俗家支路（原创扩展），不另建第六级。

### 2.2 南少林武学总表（专属 7 门＋书剑可学的嵩山武学 16 门）

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_huheshuangxingquan` | 虎鹤双形拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.65/0.35 | 书剑 | 拜(L4)罗汉堂 | 民间南派名目，原创纳入 |
| `sk_wulangbaguagun` | 五郎八卦棍 | 兵器/棍杖 | 6 玄上 | 阳 | 0.75/0.25 | 书剑 | 拜(L3) | 民间南派名棍，原创纳入 |
| `sk_tiexiangong` | 铁线功 | 内功/心法（横练） | 5 玄中 | `yang` | 0/1 | 书剑 | 拜(L3) | 民间"铁线拳"之内功化，原创扩展 |
| `sk_wuxingquan` | 五形拳 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.75/0.25 | 书剑 | 拜(L3)；页 | 民间名目，原创纳入 |
| `sk_bazhandao` | 八斩刀 | 兵器/刀（双刀） | 5 玄中 | 中性 | 0.85/0.15 | 书剑 | 拜(L3) | 民间南派双刀，原创纳入 |
| `sk_hongquan` | 洪拳 | 拳脚/拳掌 | 3 黄上 | 阳 | 0.85/0.15 | 书剑 | 拜(L1)；观 | 民间南派名目，原创纳入 |
| `sk_luohanshibashou` | 罗汉十八手 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.90/0.10 | 书剑 | 拜(L1) | 原创扩展（入门） |
| 嵩山共享 | 少林桩功、少林心法、童子功、**铁布衫**、**一指禅**、金刚指、少林弹腿、铁扫帚、鹰爪功、少林棍法、戒刀法、罗汉步、梅花桩、菩提子、般若心经、少林伤科 | — | 地 **2** / 玄 **7** / 黄 **7** | — | — | 书剑（经南少林） | 同 §1.4；各来源以正式 `reqsOverride {sect: {id: sect_nanshaolin, rank: Ln}, ...}` 覆写 | 见 §1 |

### 2.3 地阶条目卡

##### 虎鹤双形拳 `sk_huheshuangxingquan`（地下 7 · 拳脚·拳 · 书剑 · 原创纳入）

- **简述**：南派少林拳术，虎形练力、鹤形练精，刚柔并济（民间南拳名目；本作纳入南少林，为书剑少林系拳法顶点）。南派拳链：罗汉十八手（黄下）→ 洪拳（黄上）→ 五形拳（玄中）→ 虎鹤双形拳（地下）。
- **基本**：`yang` · 0.65/0.35 · `layerStats {parry [2,7], eva [1,8]}`（15）· moveSlots 4。
- **reqs**：`attrs {str 40, agi 40, wis 40}`、`aptitude {apFist 40}`、`prereq [{skill: sk_wuxingquan, layer: 5}]`、`sect {id: sect_nanshaolin, rank: 4}`、`hard: [sect, prereq]`。
- **层数要点**：1 猛虎出林、白鹤亮翅、虎骨｜4 虎抱头、鹤步｜6 鹤嘴啄｜7 虎鹤双形（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 猛虎出林 | `mv_huheshuangxingquan_hu` | 1 | `aoe_dash` n2 | 1–2 | 1.05 | 8% | 1 | 1000 | — | 可 | 1.17−0.10=1.07 |
| 白鹤亮翅 | `mv_huheshuangxingquan_he` | 1 | `aoe_self` | 0 | — | 5% | 2 | 800 | `bf_yuanzhuan` 2（自身） | — | 架势 |
| 虎抱头 | `mv_huheshuangxingquan_hubao` | 4 | `aoe_single` | 1 | 1.35 | 9% | 2 | 1100 | `bf_xuanyun` 20% 1 | 可 | 1+0.24+0.10+0.07−0.05=1.36 |
| 鹤嘴啄 | `mv_huheshuangxingquan_hezui` | 6 | `aoe_single` | 1 | 1.15（2 段） | 8% | 1 | 1000 | `bf_fengxue` 15% 1 | 可 | 1.17−0.03=1.14 |
| 虎鹤双形（绝） | `mv_huheshuangxingquan_shuangxing` | 7 | `aoe_single` | 1 | 2.85（4 段） | 9% | — | 1200 | `bf_xuanyun` 30% 1；`bf_fengxue` 30% 1 | 可 | 3.0−0.075−0.06=2.87 |

- **被动**：`ps_huheshuangxingquan_hugu` 虎骨（1，Z2 3%→10%）；`ps_huheshuangxingquan_hebu` 鹤步（4，施展"白鹤亮翅"后下一"虎"招 Z3 +10%）；`ps_huheshuangxingquan_dacheng` 大成（10，虎、鹤两类招式交替使用时，下一招冷却 −1）。
- **setTags**：`[set_nanshaolin_hongmen]`。
- **获取**：`{master, ch12_shujian, npc_nanshaolin_luohantang, 10}`。

### 2.4 玄阶·黄阶紧凑表（南少林专属 6 门）

| ID · 名称 · 品阶 | 性质 · 比例 · 成长 | reqs | 招式 | 被动 · 要点 |
|---|---|---|---|---|
| `sk_tiexiangong` 铁线功 · 玄中 5 | 阳 · 0/1 · 贡献 `{mp 12, hp 13, con 5, str 4, mpRegen 1.1}`（IP 12+13+18+5.5 = 48.5 ✓，横练式分配）· stats `{defOut 5, parry 5}` | `attrs {con 30, str 30}`；`sect {id: sect_nanshaolin, rank: 3}` | 铁线 `_tiexian`（1）架势·`bf_jiangu` 2·5%·cd2｜硬桥 `_yingqiao`（4）单体·1.15·7%·cd1（wOut/wIn 覆写 0.70/0.30）｜气沉 `_qichen`（7）自身·回复 10% 气血＋`bf_wenzhong` 2·7%·cd4 | `_yingma` 硬桥硬马（1，resCC +3→+10）；`_dacheng`（10，南少林拳法 Z3 +5%）。`setTags [set_nanshaolin_hongmen]` |
| `sk_luohanshibashou` 罗汉十八手 · 黄下 1 | 阳 · 0.90/0.10 · `{parry [1,3], hit [1,3]}` | 无 | 起手 `_qishou`（1）单体·0.90·4%·cd0·收招 950｜连手 `_lianshou`（4）单体·1.10（2 段）·5%·cd1 | `_yuanman`（10，学洪拳资质软门槛 −10） |
| `sk_hongquan` 洪拳 · 黄上 3 | 阳 · 0.85/0.15 · `{defOut [1,3], hit [1,3]}` | `sect {id: sect_nanshaolin, rank: 1}` | 工字伏虎 `_gongzi`（1）单体·1.15·6%·cd1｜桥手 `_qiaoshou`（4）架势·`bf_shoushi` 2·5%·cd2｜洪家冲拳 `_chongquan`（7）单体·1.30·6%·cd2 | `_mabu` 马步（5，resCC +3）。`setTags [set_nanshaolin_hongmen]` |
| `sk_wuxingquan` 五形拳 · 玄中 5 | 阳 · 0.75/0.25 · `{eva [1,5], parry [1,5]}` | `prereq [{skill: sk_hongquan, layer: 4}]`；`sect {id: sect_nanshaolin, rank: 3}` | 虎形 `_hu`（1）单体·1.15·7%·cd1｜鹤形 `_he`（2）架势·`bf_youshi` 2·5%·cd2｜豹形 `_bao`（4）`aoe_dash` n3·1.05·7%·cd1｜蛇形 `_she`（6）单体·1.13·7%·cd1·`bf_fengxue` 20%｜龙形 `_long`（8）`aoe_sweep`·0.95·8%·cd2 | `_lunzhuan` 五形轮转（1，连续使用不同"形"时第二招 Z3 +5%）；`_dacheng`（10，Z3 +5%）。`setTags [set_nanshaolin_hongmen]` |
| `sk_wulangbaguagun` 五郎八卦棍 · 玄上 6 | 阳 · 0.75/0.25 · `weaponReq {staff, altCategories {spear ×0.9}}` · `{parry [1,5], hit [1,5]}` | `prereq [{skill: sk_shaolingunfa, layer: 4}]`；`sect {id: sect_nanshaolin, rank: 3}` | 八卦 `_bagua`（1）`aoe_around`·0.85·8%·cd2｜点戳 `_dianchuo`（1）单体·1–2·1.15·7%·cd1｜封门 `_fengmen`（4）架势·`bf_jieji` 2·5%·cd2｜五郎破阵 `_pozhen`（7）`aoe_line` n3·1.00·8%·cd2·击退 1 | `_qianggun` 枪棍合一（1，可持枪施展，×0.9）；`_dacheng`（10）。民间传说杨五郎出家所创（传说，非金庸原著）。`setTags [set_nanshaolin_hongmen, set_shaolin_gunseng]` |
| `sk_bazhandao` 八斩刀 · 玄中 5 | 中性 · 0.85/0.15 · `weaponReq {blade, dual: true}` · `{combo [1,5], parry [1,5]}` | `sect {id: sect_nanshaolin, rank: 3}` | 斩 `_zhan`（1）单体·1.00（2 段）·6%·cd0｜滚手 `_gunshou`（3）架势·`bf_yuanzhuan` 2·5%·cd2｜八斩连环 `_lianhuan`（6）`aoe_multi` n8 r1·1.15（8 段）·8%·cd2 | `_shuangdao` 双刀（1，副手持刀时 combo +3）；`_dacheng`（10）。`setTags [set_nanshaolin_hongmen]` |

---

## 3. 旁支、叛僧与敌人专用

### 3.1 西域金刚门（倚天，敌对）

《倚天屠龙记》中少林火工头陀叛寺后远赴西域，其后传人阿二、阿三为汝阳王府效力，阿三以大力金刚指重创俞岱岩四肢（原著；具体地域与师承层级待考 K-09）。本组不另立武学：金刚门 NPC 使用 `sk_dalijingangzhi`（地中），玩家可在交手中观摩（§1.6.3）。按 C14／`design/17` §3.3，**不启用** `sect_jingangmen`；武学数据以自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三` 表达传承，不创建伪 ID。

### 3.2 叛僧成昆（圆真）：幻阴指

##### 幻阴指 `sk_huanyinzhi`（地中 8 · 拳脚·指 · 倚天 · 原著）

- **简述**：《倚天屠龙记》中成昆化名圆真潜伏少林，于光明顶以幻阴指暗袭明教众人，中指者受阴寒指力所制，后由张无忌以九阳神功化解（原著）。被袭者名单与先后次序待考 K-08；本作据其阴毒偷袭定位设置邪派门槛。
- **基本**：`sect: null`、`lineage: 叛僧成昆（圆真）`（少林旁出，不属少林门派传承）· `yin` · 0.20/0.80 · `layerStats {crit [2,8], seal [1,7]}`（15）· moveSlots 4；招式 `tags [cold]`；`observable: false`。
- **reqs**：`attrs {wis 45, agi 40}`、`aptitude {apFinger 45}`、`morality {max -20}`、`hard: [morality]`。**不属七十二绝技**（无 `liqi`）。
- **层数要点**：1 幻阴、暗袭、阴寒｜4 寒劲入脉、潜形｜6 幻影｜7 幻阴无相（绝）｜10 大成。

| 招式 | ID | 层 | 范围 | 射程 | 倍率 | 耗内 | 冷却 | 附带 Buff | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 幻阴 | `mv_huanyinzhi_huanyin` | 1 | `aoe_single` | 1 | 1.10 | 8% | 1 | `bf_hanqi` 50% 1 层 | 可 | 1.17−0.05=1.12 |
| 暗袭 | `mv_huanyinzhi_anxi` | 1 | `aoe_behind` r3 | 1–3 | 0.95 | 8% | 2 | `bf_fengxue` 30% 1 | 可 | 0.90×1.29−0.15−0.06=0.95 |
| 寒劲入脉 | `mv_huanyinzhi_hanjin` | 4 | `aoe_single` | 1 | 1.15 | 9% | 2 | `bf_hanqi` 100% 2 层；`bf_mabi` 30% 2 | 可 | 1.34−0.10−0.075=1.165 |
| 幻影 | `mv_huanyinzhi_huanying` | 6 | `aoe_self` | 0 | — | 7% | 4 | `bf_yinshen` 1（自身） | — | 支援（`kind: support`） |
| 幻阴无相（绝） | `mv_huanyinzhi_wuxiang` | 7 | `aoe_single` | 1 | 2.65 | 9% | — | `bf_mabi` 100% 2；`bf_hanqi` 100% 3 层 | 可 | 3.0−0.25−0.10 |

- **被动**：`ps_huanyinzhi_yinhan` 阴寒（1，Z2 无视内劲防御 4%→10%）；`ps_huanyinzhi_qianxing` 潜形（4，trigger `battleStart`，`bf_xianji`）；`ps_huanyinzhi_dacheng` 大成（10，对 `bf_hanqi` ≥ 3 层的目标 Z3 +12%）。
- **conflicts**：`{with: sk_jiuyang, type: counter, note: 九阳寒毒不侵}`、`{with: sk_shaolinjiuyang, type: counter, note: 寒毒难侵（半效）}`。**setTags**：`[]`。
- **获取**：`{qiyu, ch04_yitian, q_04_qiyu_83, 10, note: "圆真遗册"——成昆伏诛后于少林后山所得（原创扩展）；习得 morality −10}`。成昆本人为 Boss；混元霹雳手只作为其江湖称号与 Boss 表现接口，不在本文新增同名武学。

### 3.3 敌人专用与 Boss 版（不计入 70 门）

| ID / 用法 | 名称 | 使用者 | 规则要点 |
|---|---|---|---|
| `sk_shibaluohanzhen`（`enemyOnly: true`） | 十八罗汉大阵 | 天龙少林罗汉堂、鹿鼎护送韦小宝的十八罗汉 | 18 人整阵为 Boss 机制（09）：阵眼轮换、合击、阵破则群体失衡；玩家可学的缩小版为 `sk_luohanzhen`（3–6 人） |
| `sk_jingangfumoquan` Boss 配置 | 金刚伏魔圈（三渡版） | 倚天渡厄、渡劫、渡难 | 同 ID，Boss 画像（06 §11.4）：阵员位置固定于三松，圈内持续缠绕；以"闯圈"作为金刚不坏体与本武学的学习事件 |

### 3.4 五台山清凉寺（少林下院）

《天龙八部》中神山上人为五台山清凉寺方丈，其与少林的论武关系及具体武学待考 K-12；《鹿鼎记》中顺治出家后法名行痴，韦小宝以少林法名“晦明”任清凉寺住持（原著）。本作把清凉寺作为鹿鼎少林武学的**第二传授点**（伏魔杖法、韦陀降魔杵、罗汉阵、铁布衫），并承载护送行痴的战斗事件（原创扩展，归 `chapters/08`）。

---

## 4. 套装候选（建议；规则与最终数值归 design/07）

### 4.0 共通约定

| 项 | 约定 |
|---|---|
| 计件 | 05 §6.5：装配中的武学（含辅运内功、不可用的兵器栏武学）＋穿戴装备；每门武学对每个套装计 1 件 |
| 数值写法 | 与 06 同式"基准 × G(g_set)"，括号内给出 g_set = 8（地中，G 2.2）的示例值；**作用位置**（属性层 / 乘区）逐条标注 |
| 套装品阶 `g_set`（C22） | `floor(median(已计件成员 effGrade))`；先应用书界天道压制，偶数件取中间两项均值再向下取整。只统计已装配武学与已穿戴装备，不按图鉴绝对品阶，也不让未计件候选参与 |
| 混搭 | 所有套装都允许天/地/玄/黄成员混搭；件数只看成员身份，不看品阶 |
| 携带评估 | 按基准 §3：高武 3/3/3、中武 2/2/2、低武 1/1/1；杂学与轻功不可携带（须本书界重学）；"本土"= 该书界原生 |

### 4.1 门派套装（7 个）

#### `set_shaolin_jingang` 少林金刚（用户示例，正式候选）

| 项 | 内容 |
|---|---|
| 成员（4） | `sk_longzhaoshou` 龙爪手（即"金刚龙爪手"，地中 8，拳脚·擒拿）＋`sk_yijinjing` 易筋经（天上 12，内功）＋`sk_tieshazhang` 铁砂掌（玄中 5，拳脚·掌）＋`sk_tongrenhenglian` 铜人横练（玄上 6，内功·横练） |
| 2 件 | 拿穴 `attr:seal pp +5×G`（+11pp）【属性层，03 §4.6】 |
| 3 件 | 招架 `attr:parry pct +4%×G`（+8.8%）【属性层·RAT】 |
| 4 件 | 伤害 `Z3 +5%×G`（拳脚招式，+11%）【Z3】；拿穴、招架各再 ×1.5（合计 +16.5pp / +13.2%）；机制"金刚拿云"：本套装持有者以拳脚招式施加的 `bf_fengxue`，目标冲穴概率 −15pp（06 §7.1） |
| 混搭说明 | 天上＋地中＋玄上＋玄中排序为 `[5,6,8,12]`，故 `g_set=floor((6+8)/2)=7`（地下）；这是 C22 的跨品阶中位数样板 |
| 携带与可达成 | 高武：4 件全可携带（内 2、拳脚 2）。中武：同样恰好 4 件全带（占满内功 2、拳脚 2 槽）。**低武（1/1/1）**：最多带 2 件（推荐易筋经＋龙爪手）；鹿鼎本土铁砂掌、铜人横练与两门携带武学的 `effGrade` 排序为 `[4,5,6,8]`，故 `g_set=floor((5+6)/2)=5`；连城/白马/鸳鸯无少林传承，至多 2 件（仅“拿穴”生效） |

#### `set_shaolin_luohan` 少林罗汉（入门；05 §13.8 已建议 ID）

| 项 | 内容 |
|---|---|
| 成员（5） | 罗汉拳（黄下）、少林桩功（黄下）、少林心法（黄中）、少林棍法（黄中）、罗汉步（黄中，轻功） |
| 2 / 3 / 4 件 | 2：`attr:parry pct +3%×G`｜3：`attr:resCC pp +4×G`，少林武学修炼 +10%（计入 `bonusMult`）｜4：少林武学 `Z3 +3%×G`；"罗汉护法"：每名相邻的少林武学装配者使自身 parry +2%（≤ +6%） |
| 携带与可达成 | 全员黄阶、各少林书界原生，**任何少林书界不携带即可 4 件**；黄下下限使其不受天道压制影响——低武书界的保底套 |

#### `set_shaolin_henglian` 少林横练

| 项 | 内容 |
|---|---|
| 成员（5，内功栏仅 3 格 → 至多装 3） | 铜人横练（玄上）、铁布衫（地下）、金钟罩（地中）、金刚不坏体（天下）、铁线功（玄中，南少林） |
| 2 / 3 件 | 2：`attr:defOut pct +5%×G`、`attr:tough pct +3%×G`｜3：近战来袭 `Z4 +4%×G`；"罩门自闭"：`bf_zhaomen` 的受击加成减半（与金刚不坏体"无罩门"不叠加） |
| 取舍 | 3 件须占满内功栏——放弃易筋经等主修心法；以易筋经主运＋两门横练辅运只能 2 件 |
| 携带与可达成 | 高武 3 件全带；中武带 2＋本土 1（笑傲本土铜人横练、金钟罩）；低武带 1＋鹿鼎本土铜人横练、铁布衫 → 3 件；书剑本土铁线功、铁布衫＋带 1 → 3 件 |

#### `set_shaolin_banruo` 般若（拈花一脉）

| 项 | 内容 |
|---|---|
| 成员（5） | 般若掌（地中）、拈花指（地上）、无相劫指（地上）、一指禅（地中）、般若心经（玄下，杂学） |
| 2 / 3 / 4 件 | 2：`attr:effHit pct +4%×G`｜3：`attr:seal pp +4×G`，且视为"佛法根基"（§1.3.1）｜4：指/掌招式 `Z3 +4%×G`；"拈花微笑"：施加 `bf_fengxue` 成功时回复 2% 内力（每回合 1 次） |
| 携带与可达成 | 拳脚栏 3 格 → 至多 3 门拳脚＋心经 = 4 件。天龙全本土；鹿鼎本土般若掌、拈花指、般若心经＋携带 1 门拳脚（一指禅或无相劫指）→ 4 件；笑傲/侠客本土一指禅＋心经，其余须携带（中武 2 拳脚）→ 4 件 |

#### `set_shaolin_gunseng` 少林棍僧

| 项 | 内容 |
|---|---|
| 成员（6） | 少林棍法（黄中）、阴手棍（玄下）、夜叉棍法（玄中）、伏魔杖法（地中）、五郎八卦棍（玄上，南少林）、梅花桩（玄下，轻功） |
| 2 / 3 / 4 件 | 2：`attr:parry pct +4%×G`｜3：常驻 `bf_pogun`（单项来源 ×0.6，品阶 = g_set；06 §8.6）｜4：棍杖招式 `Z3 +4%×G`；横扫/周身类招式击退 +1 |
| 携带与可达成 | 兵器栏 3 格 → 3 棍＋梅花桩 = 4 件。**鹿鼎本土即有 4 棍＋梅花桩：低武书界"不带一件也能成套"的样板**；书剑本土少林棍法、五郎八卦棍＋梅花桩＋携带 1 棍 → 4 件 |

#### `set_shaolin_damo` 达摩遗风

| 项 | 内容 |
|---|---|
| 成员（5） | 易筋经（天上）、洗髓经（地上）、达摩心经（玄中）、达摩剑法（地下）、一苇渡江（地上，轻功） |
| 2 / 3 / 4 件 | 2：`attr:resMind pp +4×G`，全部武学修炼 +10%｜3：内功辅运比例 +0.05（仍受 0.60 上限）｜4：全部内功 `stat`/`effect` 被动数值 ×1.10；`Z3 +3%×G` |
| 携带与可达成 | C14 后倚天本土仅易筋经，不能本土成套；侠客本土洗髓经、达摩心经＋携带易筋经、达摩剑法 → 4 件；鹿鼎本土洗髓经＋携带易筋经（内 1）＋达摩剑法（兵 1）→ 3 件 |

#### `set_nanshaolin_hongmen` 南少林·洪门

| 项 | 内容 |
|---|---|
| 成员（6） | 洪拳（黄上）、五形拳（玄中）、虎鹤双形拳（地下）、铁线功（玄中，内功）、五郎八卦棍（玄上）、八斩刀（玄中） |
| 2 / 3 / 4 / 5 件 | 2：`attr:resCC pp +4×G`｜3：`attr:parry pct +3%×G`｜4：南少林拳法 `Z3 +4%×G`｜5："硬桥硬马"——免疫 ≤ g_set 的 `cc.knock`；书剑中红花会好感 +10（design/12） |
| 携带与可达成 | 书剑本土全部（内 1＋拳 3＋兵 2 = 6 件可装配）；携出书剑后，中武仅能带 2/2/2、低武 1/1/1 且他处无南少林传承 → 定位为"书剑限定套装" |

### 4.2 人物传承套装（4 个）

#### `set_saodiseng` 扫地僧·藏经阁（天龙）

| 项 | 内容 |
|---|---|
| 成员（4） | 易筋经（天上）、般若心经（玄下，杂学）、须弥山掌（地上）、拈花指（地上） |
| 2 / 3 / 4 件 | 2：七十二绝技"戾气"不再判定（等同佛法根基）；`attr:resMind pp +4×G`｜3：七十二绝技招式 `Z3 +3%×G`｜4："无为"——战斗开始获得 `bf_mian_xin` 2 回合；全部少林武学修炼 +15% |
| 叙事 | 扫地僧以佛法化解萧远山、慕容博之戾气（天龙原著）；本套装是"多修绝技而不入魔"的正解（原创扩展数值化） |
| 携带与可达成 | 天龙本土 4 件；鹿鼎本土拈花指、般若心经＋携带易筋经（内）、须弥山掌（拳脚）→ 4 件；其余书界视本土心经与携带情况 2–3 件 |

#### `set_fangzheng` 方证·少林三战（笑傲）

| 项 | 内容 |
|---|---|
| 成员（4） | 易筋经（天上）、千手如来掌（地上）、一指禅（地中）、金钟罩（地中） |
| 2 / 3 / 4 件 | 2：`attr:parry pct +4%×G`｜3：`attr:counter pp +2×G`｜4：对日月神教（`sect_riyue`）敌人 `Z3 +4%×G`；易筋经"化异种真气"每回合额外 −2 层 |
| 携带与可达成 | 笑傲本土 4 件（易筋经可本土印证，02 E5）；中武后续书界可全带（内 2：易筋经、金钟罩；拳脚 2：千手如来掌、一指禅）；低武至多 2 件 |

#### `set_sandu` 渡厄三僧·金刚伏魔（倚天）

| 项 | 内容 |
|---|---|
| 成员（4） | 金刚伏魔圈（地上，杂学）、伏魔索法（玄上，鞭索）、少林九阳功（地中，内功）、般若心经（玄下，杂学） |
| 2 / 3 / 4 件 | 2：阵中 `Z4 +3%×G`｜3：金刚伏魔圈 2 人即可成阵（×0.75，未满 10 重时亦可）｜4：阵成时每回合回复 2% 内力；`bf_chanrao` 施加率 +10% |
| 携带与可达成 | 倚天本土 4 件；两门杂学不可携带 → 离开倚天后至多 2 件（伏魔索法＋少林九阳功）——"只在屠狮大会的少林成立"的书界限定套装 |

#### `set_chengguan` 澄观·般若堂（鹿鼎）

| 项 | 内容 |
|---|---|
| 成员（4） | 般若掌（地中）、拈花指（地上）、洗髓经（地上）、般若心经（玄下，杂学） |
| 2 / 3 / 4 件 | 2：`lore` +5，观摩领悟 +20%｜3：七十二绝技修炼 +15%｜4："纸上得来"——对本场首次交手的每名敌人，首次施展七十二绝技招式时 `bf_bizhong` ×1、暴击 +10（原创扩展：致敬澄观精研典籍而少实战） |
| 携带与可达成 | **鹿鼎本土即可 4 件**（低武书界本土成套样板 #2）；天龙可凑 3 件（无洗髓经） |

### 4.3 成员 → 套装对照（`setTags` 以本表为准，玄/黄紧凑表未逐行列出者按此补）

| 武学 | setTags |
|---|---|
| `sk_yijinjing` | `set_shaolin_jingang`（05 已有）＋ `set_shaolin_damo`、`set_saodiseng`、`set_fangzheng`（C22 已裁定；05 权威卡待同步，见 §8.2 D-2） |
| `sk_longzhaoshou` / `sk_tieshazhang` | `set_shaolin_jingang`（05 已有） |
| `sk_tongrenhenglian` | `set_shaolin_jingang`、`set_shaolin_henglian` |
| `sk_tiebushan` / `sk_jingangbuhuai` | `set_shaolin_henglian` |
| `sk_jinzhongzhao` | `set_shaolin_henglian`、`set_fangzheng` |
| `sk_tiexiangong` | `set_shaolin_henglian`、`set_nanshaolin_hongmen` |
| `sk_luohanquan`（05 已有）/ `sk_shaolinzhuanggong` / `sk_shaolinxinfa` / `sk_luohanbu` | `set_shaolin_luohan` |
| `sk_shaolingunfa` | `set_shaolin_luohan`、`set_shaolin_gunseng` |
| `sk_yinshougun` / `sk_yachagun` / `sk_fumozhangfa` / `sk_meihuazhuang` | `set_shaolin_gunseng` |
| `sk_wulangbaguagun` | `set_shaolin_gunseng`、`set_nanshaolin_hongmen` |
| `sk_boruozhang` | `set_shaolin_banruo`、`set_chengguan` |
| `sk_nianhuazhi` | `set_shaolin_banruo`、`set_saodiseng`、`set_chengguan` |
| `sk_wuxiangjiezhi` | `set_shaolin_banruo`、`set_mizong_mingwang` |
| `sk_duoluoyezhi` / `sk_ranmudaofa` / `sk_jiashafumogong` | `set_mizong_mingwang` |
| `sk_yizhichan` | `set_shaolin_banruo`、`set_fangzheng` |
| `sk_boruoxinjing` | `set_shaolin_banruo`、`set_saodiseng`、`set_sandu`、`set_chengguan` |
| `sk_xisuijing` | `set_shaolin_damo`、`set_chengguan` |
| `sk_damoxinjing` / `sk_damojianfa` / `sk_yiweidujiang` | `set_shaolin_damo` |
| `sk_xumishanzhang` | `set_saodiseng` |
| `sk_qianshourulaizhang` | `set_fangzheng` |
| `sk_jingangfumoquan` / `sk_fumosuofa` / `sk_shaolinjiuyang` | `set_sandu` |
| `sk_shizihou` | `set_mingjiao_sida_fawang`（仅谢逊来源计主题） |
| `sk_hongquan` / `sk_wuxingquan` / `sk_huheshuangxingquan` / `sk_bazhandao` | `set_nanshaolin_hongmen` |
| 本表未列的本文武学 | `[]`；不得覆盖其他图鉴已经登记的跨组成员 |

> 套装总览：门派 7（金刚、罗汉、横练、般若、棍僧、达摩、洪门）＋人物 4（扫地僧、方证、三渡、澄观）= 11 个候选；其中**不携带即可在低武本土成套**的有 3 个（罗汉、棍僧、澄观），保证低武书界的少林玩家不依赖外来武学也有完整套装体验。

---

## 5. 本组统计（合计 70 门；另敌人专用 1 门不计）

### 5.1 门派 × 品阶（12 级）

| 门派 | 黄下1 | 黄中2 | 黄上3 | 玄下4 | 玄中5 | 玄上6 | 地下7 | 地中8 | 地上9 | 天下10 | 天中11 | 天上12 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 少林（嵩山） | 2 | 5 | 5 | 6 | 8 | 9 | 7 | 9 | 8 | 2 | 0 | 1 | **62** |
| 旁支（叛僧成昆：幻阴指） | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | **1** |
| 南少林 | 1 | 0 | 1 | 0 | 3 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | **7** |
| **合计** | 3 | 5 | 6 | 6 | 11 | 10 | 8 | 10 | 8 | 2 | 0 | 1 | **70** |
| 大阶小计 | 黄 **14**（20%） | | | 玄 **27**（39%） | | | 地 **26**（37%） | | | 天 **3**（4%） | | | |

> 天级 3 门与基准 §13 完全一致（易筋经天上、金刚不坏体天下、狮子吼天下）；其余 67 门均为地/玄/黄（“主要扩展地玄黄”）。本文地阶 `26/70≈37.1%`，高于 C14 全库目标 `141/661≈21.3%`，原因是基准锚定“少林七十二绝技为地下–地上”；七十二绝技本组收 **21 门**。AR-01 的近似目标 `3/9/27/27` 留给后续 CXs 通过增补玄黄解决，本轮不删现有 ID。

### 5.2 按类别（大类/子类 × 大阶：天/地/玄/黄）

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---|---|---|---|---|
| 内功 | 心法（含横练 4 门） | 2 | 4 | 4 | 2 | **12** |
| 拳脚 | 拳掌 | 0 | 7 | 5 | 5 | 17 |
| | 指法 | 0 | 7 | 1 | 0 | 8 |
| | 腿法 | 0 | 1 | 1 | 1 | 3 |
| | 擒拿/爪 | 0 | 1 | 1 | 1 | 3 |
| | 小计 | 0 | 16 | 8 | 7 | **31** |
| 兵器 | 棍杖 | 0 | 1 | 3 | 1 | 5 |
| | 刀 | 0 | 1 | 2 | 1 | 4 |
| | 剑 | 0 | 1 | 1 | 1 | 3 |
| | 奇门（袈裟、杵） | 0 | 1 | 1 | 0 | 2 |
| | 鞭索 | 0 | 0 | 1 | 0 | 1 |
| | 小计 | 0 | 4 | 8 | 3 | **15** |
| 轻功 | | 0 | 1 | 2 | 1 | **4** |
| 暗器 | | 0 | 0 | 1 | 1 | **2** |
| 杂学 | 音功 2、阵法 2、医 1、心神 1 | 1 | 1 | 4 | 0 | **6** |
| **合计** | | **3** | **26** | **27** | **14** | **70** |

### 5.3 按原生书界（可学池 = 该书界原生的本组武学；一门可属多书界）

| 书界 | 境界 | 可学池 | 天/地/玄/黄 | 内功/拳脚/兵器/轻功/暗器/杂学 | 同类兵器最多 | 七十二绝技 | 首现 |
|---|---|---|---|---|---|---|---|
| 天龙 | 高 | 44 | 1/19/13/11 | 7/21/9/3/1/3 | 棍 3、刀 3 | 19 | 44 |
| 射雕 | 高 | 9 | 1/0/1/7 | 3/3/1/1/0/1 | 棍 1 | 0 | 0 |
| 神雕 | 高 | 9 | 0/0/2/7 | 3/3/1/1/0/1 | 棍 1 | 0 | 0 |
| 倚天 | 高 | **23** | **3/6/8/6** | **6/9/2/2/0/4** | 棍 1、鞭索 1 | **3** | 12 |
| 笑傲 | 中 | 36 | 1/7/17/11 | 6/14/8/3/2/3 | 剑 3 | 7 | 5 |
| 侠客 | 中 | 22 | 0/5/9/8 | 4/11/4/2/0/1 | 棍 2 | 4 | 1 |
| 鹿鼎 | 低 | 36 | 0/5/20/11 | 6/14/7/3/2/4 | **棍 4** | 4 | 1 |
| 书剑（南少林） | 中 | 23 | 0/3/11/9 | 5/9/4/2/1/2 | 棍 2、刀 2 | 2 | 7 |

- **装配栏可填性**（05 §14.6-4、基准 §20）：C14 收敛后，倚天少林白名单本身不能提供 3 门同类兵器或暗器，须由倚天新图鉴／通行池补位；天龙、笑傲、鹿鼎的少林本土武学仍可独立覆盖主要装配栏。侠客、书剑兵器同类只有 2 门，需携带 1 门或借他派补齐。低武鹿鼎在“1/1/1 携带”下仍可凭本土武学满配，且有 3 个可本土成套的套装（§4.3 注）。
- **七十二绝技逐代投放**（02 §5.7）：天龙 19 → 倚天 **3**（般若掌、大力金刚指、龙爪手）→ 笑傲 7 → 侠客 4 → 鹿鼎 4 → 书剑 2（南少林）；射雕/神雕为“背景存在”不开放绝技。倚天下降来自 C14 白名单，不表示寺藏在原著世界中只余三门。
- 射雕/神雕刻意只放有限入门内容（避免与五绝体系争夺主线资源）；按 P49，只有射雕另保留易筋经完整学习线，神雕不新增该线；两书界的少林玩家以携带为主。

---

## 6. 本文新增术语与 ID

| 类别 | 数量 | ID |
|---|---|---|
| 门派 / 传承 | 1 个门派、2 个引用 | 新增 `sect_nanshaolin`；引用基准 `sect_shaolin`；西域金刚门只用自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`，禁止创建 `sect_jingangmen` |
| 武学（本文定义） | **64** | 内功：`sk_shaolinzhuanggong` `sk_shaolinxinfa` `sk_tongzigong` `sk_damoxinjing` `sk_tiexiangong` `sk_tongrenhenglian` `sk_tiebushan` `sk_jinzhongzhao` `sk_shaolinjiuyang` `sk_xisuijing`；拳掌：`sk_luohanshibashou` `sk_weituozhang` `sk_fuhuquan` `sk_hongquan` `sk_shuaibeishou` `sk_wuxingquan` `sk_xinyiba` `sk_dacidabeiqianyeshou` `sk_dajingangquan` `sk_dajingangzhang` `sk_huheshuangxingquan` `sk_boruozhang` `sk_weituochu` `sk_xumishanzhang` `sk_qianshourulaizhang`；指：`sk_jingangzhi` `sk_mohezhi` `sk_duoluoyezhi` `sk_dalijingangzhi` `sk_yizhichan` `sk_huanyinzhi` `sk_nianhuazhi` `sk_wuxiangjiezhi`；腿：`sk_tantui` `sk_tiesaozhou` `sk_ruyingsuixingtui`；擒拿：`sk_shaolinqinna`（05 已引用）`sk_yingzhuagong`；棍：`sk_shaolingunfa` `sk_yinshougun` `sk_yachagun` `sk_wulangbaguagun` `sk_fumozhangfa`；刀：`sk_jiedaofa` `sk_bazhandao` `sk_cibeidao` `sk_ranmudaofa`；剑：`sk_luohanjian` `sk_fumojian` `sk_damojianfa`；奇门/鞭：`sk_xiangmochu` `sk_jiashafumogong` `sk_fumosuofa`；轻功：`sk_luohanbu` `sk_meihuazhuang` `sk_bihuyouqiang` `sk_yiweidujiang`；暗器：`sk_putizi` `sk_jingangnianzhu`；杂学：`sk_boruoxinjing` `sk_shaolinshangke` `sk_luohanzhen` `sk_jingangnuhou` `sk_jingangfumoquan` |
| 武学（收录但非本文新增） | 6 | 基准 §13：`sk_yijinjing` `sk_jingangbuhuai` `sk_shizihou`；05 已定义：`sk_longzhaoshou` `sk_luohanquan` `sk_tieshazhang` |
| 敌人专用（不计数） | 1 | `sk_shibaluohanzhen`（`enemyOnly: true`） |
| 七十二绝技清单（`lg_shaolin72`，`special.liqi`；供逍遥组"小无相功 × 七十二绝技 synergy"逐条登记） | 21 | `sk_tiebushan` `sk_jinzhongzhao` `sk_dajingangquan` `sk_dajingangzhang` `sk_boruozhang` `sk_weituochu` `sk_xumishanzhang` `sk_qianshourulaizhang` `sk_mohezhi` `sk_duoluoyezhi` `sk_dalijingangzhi` `sk_yizhichan` `sk_nianhuazhi` `sk_wuxiangjiezhi` `sk_ruyingsuixingtui` `sk_longzhaoshou` `sk_fumozhangfa` `sk_ranmudaofa` `sk_damojianfa` `sk_jiashafumogong` `sk_yiweidujiang` |
| 招式 `mv_*` | ≈ 245 | 天/地卡 132 条（全 ID 已列于卡内）＋玄/黄表 113 条（`mv_<武学拼音>_<表中后缀>`）；不含 05 已定义的易筋经、龙爪手、罗汉拳、铁砂掌招式 |
| 被动 `ps_*` | ≈ 163 | 天/地卡 90 条＋玄/黄表 73 条（同上规则） |
| 套装候选 `set_*` | 11（新增 9） | 新增：`set_shaolin_henglian` `set_shaolin_banruo` `set_shaolin_gunseng` `set_shaolin_damo` `set_nanshaolin_hongmen` `set_saodiseng` `set_fangzheng` `set_sandu` `set_chengguan`；沿用：`set_shaolin_jingang`（基准）、`set_shaolin_luohan`（05 建议） |
| 特殊规则 / 字段 | 3 | `special.liqi`（七十二绝技·戾气，§1.3.1）；"制服"（慈悲，§1.3.2）；"开口泄气"（金刚不坏体 × 音功，§1.5.2） |
| Buff | **0** | 本文不新增 Buff；引用的 73 个 `bf_*` 已逐一核对存在于 06 目录（含 06 §8.11 已收录的 `bf_shouque`） |
| NPC（命名接口） | 新增占位 13；跨组引用 2；沿用 6 | 新增占位：`npc_kongwen` `npc_kongzhi` `npc_duee` `npc_asan` `npc_fangsheng` `npc_huicong` `npc_chengguan` `npc_haidafu` `npc_tianhong` `npc_nanshaolin_luohantang` `npc_shaolin_damoyuan` `npc_shaolin_jielvyuan` `npc_shaolin_shibaluohan`；跨组引用：`npc_jiumozhi`、`npc_xiexun`；沿用 05：`npc_shaolin_fangzhang` `npc_shaolin_banruotang` `npc_shaolin_luohantang` `npc_shaolin_wuseng` `npc_fangzheng` `npc_kongxing` |
| 任务（占位） | 6 | `q_01_qiyu_81`（藏经阁扫地僧指点）`q_01_qiyu_82`（达摩洞面壁）`q_04_qiyu_81`（空见遗泽）`q_04_qiyu_82`（楔子闻经）`q_04_qiyu_83`（圆真遗册）`q_NN_faction_81`（闯铜人巷，各少林书界） |
| 物品 / 装备（建议接口） | 具体条目未定义 | 秘籍 `it_miji_tiebushan` `it_miji_jinzhongzhao` `it_miji_xisuijing` `it_miji_dajingangzhang` `it_miji_yizhichan` `it_miji_ruyingsuixingtui`；残页 `it_canye_dajingangquan`；袈裟类奇门兵器 `eq_jiasha_*`（`kinds: misc`、标签 `jiasha`）。这些只符合 10 的命名/变体规则，仍须由 10 建实体；`it_dahuandan` 已在 10 定义 |

---

## 7. 数据校验规则与测试用例

### 7.1 静态校验

| 编号 | 规则 | 通过条件 | 本次结果 |
|---|---|---|---|
| V-SL-01 | 数量与品阶 | 70 个唯一 `sk_*`；12 级为 `3/5/6/6/11/10/8/10/8/2/0/1`，天/地/玄/黄为 `3/26/27/14` | ✅；这是 AR-01 扩充前基线，不冒充终态 |
| V-SL-02 | 天级封闭集合 | 恰为 `sk_yijinjing`、`sk_jingangbuhuai`、`sk_shizihou` | ✅；与基准 §13 一致 |
| V-SL-03 | ID 与重命名 | 武学 ID 唯一；生产字段只接受正式 ID `sk_jingangfumoquan`，迁移别名不得入库 | ✅；C12 已解决 |
| V-SL-04 | 内功性质 | §0.3 的 12 门内功均有且仅有 `yin/yang/harmony` 之一 | ✅；`yang` 9、`harmony` 3、`yin` 0 |
| V-SL-05 | `reqs` 结构 | 技艺只进 `reqs.skills`；前置均为 `{skill, layer}` 或 `{anyOf: [...]}`；硬门槛进 `hard` | ✅；伤科 `med:30`、罗汉阵 `formation:30`、伏魔圈 `formation:50` 为【建议值】 |
| V-SL-06 | Buff 闭包 | 全文引用的 73 个唯一 `bf_*` 均存在于 `design/06` | ✅；缺失 0，C23 已解决 |
| V-SL-07 | 套装闭包 | `SetDef.members ↔ SkillDef.setTags` 双向一致；跨组四技与狮子吼不得被空数组覆盖 | ✅；按 C22 登记；易筋经权威卡仍待 05 同步 |
| V-SL-08 | 倚天白名单 | 与下列 23 项显式集合完全相等；天/地/玄/黄 `3/6/8/6`，类别 `6/9/2/2/0/4`，七十二绝技 3 | ✅；按 C14 收敛 |
| V-SL-09 | 门派与职级 | 只启用 `sect_shaolin`、`sect_nanshaolin`；T01 用 L1–L5；禁用 `sect_jingangmen` | ✅；与 `design/17` 一致 |
| V-SL-10 | 作者决定 | 三天级均 `observable:false`；P32、P47、P49 的默认决定可在正文定位 | ✅ |
| V-SL-11 | 七十二绝技 | 21 门均列入 `lg_shaolin72` 且需落 `special.liqi:true`；紧凑表可据 §6 清单展开 | ✅（文档级）；数据导入时再做字段级断言 |
| V-SL-12 | 标注与占位 | 每个剩余“待考”均指向 K 编号；不得遗留未完成占位语或截断句 | ✅ |

**V-SL-08 期望集合（构建器按 ID 集合等值断言，不从“同上”“全部少林书界”等展示短语猜测）：**

| 品阶 | 倚天保留 ID |
|---|---|
| 天（3） | `sk_yijinjing`、`sk_jingangbuhuai`、`sk_shizihou` |
| 地（6） | `sk_shaolinjiuyang`、`sk_jingangfumoquan`、`sk_longzhaoshou`、`sk_dalijingangzhi`、`sk_boruozhang`、`sk_huanyinzhi` |
| 玄（8） | `sk_tongrenhenglian`、`sk_jingangzhi`、`sk_tieshazhang`、`sk_yingzhuagong`、`sk_fumosuofa`、`sk_jingangnuhou`、`sk_bihuyouqiang`、`sk_boruoxinjing` |
| 黄（6） | `sk_shaolinxinfa`、`sk_shaolinzhuanggong`、`sk_luohanquan`、`sk_shaolinqinna`、`sk_shaolingunfa`、`sk_luohanbu` |

### 7.2 招式预算抽查（05 §4.2）

允许显示值相对公式结果手调不超过 `±0.05`；下表按未四舍五入结果复算。

| 招式 | 复算 | 表值 | 偏差 | 结论 |
|---|---:|---:|---:|---|
| 狮吼震 | `0.65×1.34×0.85×0.85−0.05−0.03=0.5493` | 0.55 | +0.0007 | ✅ |
| 慑魂 | `0.55×1.46×0.85×0.85−0.0625=0.5177` | 0.52 | +0.0023 | ✅ |
| 破阵吼 | `0.65×1.41×0.85×0.85−0.10=0.5622` | 0.56 | −0.0022 | ✅ |
| 聚音成线 | `1×1.34×0.85×0.85−0.10=0.8682` | 0.87 | +0.0018 | ✅ |
| 狮子吼（绝） | `3×0.35×0.85×0.85−0.10−0.10−0.075=0.4836` | 0.50 | +0.0164 | ✅ |
| 钟鸣 | `0.65×1.29−0.0375=0.8010` | 0.80 | −0.0010 | ✅ |
| 洪钟大吕 | `0.70×1.34×0.85−0.05=0.7473` | 0.75 | +0.0027 | ✅ |
| 般若波罗蜜 | `3×0.60×0.85−0.05=1.48` | 1.50 | +0.02 | ✅ |
| 摩诃无量 | `3×0.80×0.85−0.10=1.94` | 1.95 | +0.01 | ✅ |
| 漫天贝叶 | `3×0.50×0.85−0.06=1.215` | 1.20 | −0.015 | ✅ |
| 一指定乾坤 | `3×0.85−0.20=2.35` | 2.35 | 0 | ✅ |
| 幻阴指·暗袭 | `0.90×1.29−0.15−0.06=0.951` | 0.95 | −0.001 | ✅ |

### 7.3 最小行为测试

1. **书界池**：载入倚天，只能从 §1.1/C14 的 23 门创建本土学习来源；`sk_tiebushan`、`sk_jinzhongzhao`、`sk_dajingangquan`、`sk_weituochu`、`sk_fumozhangfa`、`sk_damojianfa`、`sk_yiweidujiang` 均不得生成倚天学习来源。
2. **观摩**：尝试观摩三门天级武学均失败；地阶 `observe` 来源仍按各自 `maxLayer` 生效。
3. **前置**：倚天般若掌以铁砂掌 5 重满足局部 `reqsOverride`；默认来源仍要求韦陀掌 7 重。少林伤科只有 `med≥30` 可学，大还丹配方另在 7 重检查 `alchemy≥40`。
4. **职级**：L3 能学玄阶但不能直接领取地阶；L4 可授地阶；L5 只取得天级任务资格，仍须满足武学自身 `reqs`。南少林 L4“洪门护法”不得产生第六级。
5. **套装**：少林金刚四件有效品阶 `[5,6,8,12]` 得 `g_set=floor((6+8)/2)=7`；鹿鼎压制后 `[4,5,6,8]` 得 5。卸下一件后重新取中位数，不以固定图鉴平均代替。
6. **跨组标签**：无相劫指、多罗叶指、燃木刀法、袈裟伏魔功均命中 `set_mizong_mingwang`；谢逊来源的狮子吼命中 `set_mingjiao_sida_fawang`，少林来源不计该人物主题。
7. **制服**：普通人形敌人默认重伤退场；Boss、野兽不触发；单场关闭后恢复通常击倒结果。
8. **阵法**：三名合格阵员正常成金刚伏魔圈；10 重被动或 `set_sandu` 三件允许二人成圈且效果 ×0.75；人数不足时不得成阵。
9. **剃度状态**：剃度后少林武学修炼倍率增加 10% 且情缘关闭；还俗同时移除增益并恢复情缘资格，历史门派贡献不在本文重算。
10. **考据门禁**：标 K-01～K-12 的内容只影响命名、来源叙述或章节落点；未经核定不得据此新增规则数值。

---

## 8. 待决事项 / 依赖

### 8.1 替下游给出的建议值

| # | 接收文档 | 建议值 / 接口 | 默认处理 |
|---|---|---|---|
| S-1 | `design/05` | `sk_shaolinshangke.reqs.skills.med = 30`；七重配方 `unlockReqs.skills.alchemy = 40` | 保持；前者是整门武学软门槛，后者只控制大还丹方 |
| S-2 | `design/05`、`design/09` | 罗汉阵 `formation = 30`；金刚伏魔圈 `formation = 50` | 保持；均为软门槛，阵法强度公式仍归 09 |
| S-3 | `design/07` | 本文 11 套装的阈值与效果数值 | 保持为候选；`g_set=floor(median(effGrade))` 已由 C22 定案，不再是建议 |

### 8.2 本文依赖的上游事实

| # | 上游 | 状态 / 事项 |
|---|---|---|
| D-1 | `design/06` | 已解决：73 个唯一 `bf_*` 全部存在（C23）。仍需归属文档确认 `bf_zhaomen` 的玄阶参数、金刚不坏体压制罩门钩子与 `bf_mian_liuxue` 常驻用法 |
| D-2 | `design/07` | 采纳 11 套装的最终成员、阈值、数值；实现 C22 的成员与 `setTags` 双向校验 |
| D-3 | `design/09` | 已解决：金刚伏魔圈、二僧成圈、罗汉阵、十八罗汉 Boss、制服和合璧 CT 均已有接口；实现时以其正式结构为准 |
| D-4 | `design/10` | 建立 §6 所列秘籍、残页、袈裟奇门和“塞耳”物品实体；`it_dahuandan` 已存在，只需挂接配方解锁 |
| D-5 | `design/12`、`design/16` | 已解决职级：均采用 T01 L1–L5（AR-07/08）。仍需承接贡献、还俗后果、制服后的劝降/盘问、武当/红花会好感，以及月钱资源档位 |
| D-6 | `design/03` | 校准金钟大成 `shieldMax +5%` 与一苇渡江大成 `qinggong flat +10` 是否满足上限 |
| D-7 | `chapters/01/02/03/04/05/06/08/12` | 替换占位 NPC/任务；落实射雕易筋经、铜人巷、金刚伏魔圈、少林三战、清凉寺等事件。金刚门不独立已解决，不再作为章节选择题 |
| D-8 | `skills-yitian.md` | 以同一 `sk_shizihou` 配置谢逊来源，并仅对该来源计 `set_mingjiao_sida_fawang` |
| D-9 | `skills-xiaoyao.md` | 保持小无相功观摩上限 8；校验四门少林绝技的 `set_mizong_mingwang` 双向标签与 `npc_jiumozhi` 引用 |
| D-10 | 西域/吐蕃归属图鉴 | 补 `sk_huoyandao × sk_ranmudaofa` synergy 的反向登记 |

### 8.3 对基准的修改提案

| # | 提案 | 状态与理由 |
|---|---|---|
| BP-1 | 原提案“05 §14.5 少林 48→70、通行 116→94，总量仍 661” | **被 AR-01 覆盖**：当前 70 门仅作扩充前基线；后续 CXs 按全库约 1,100–1,150 与约 `1:3:9:9` 扩充，不再回写旧 661 分配 |
| BP-2 | 武学/招式/被动/秘籍/残页前缀登记 | **已采纳（v1.1）**：基准 §12 已登记 `sk_`、`mv_`、`ps_`、`it_miji_`、`it_canye_`；本文已按该命名执行 |
| BP-3 | 洗髓经保持地上 9，不新增天级 | **已采纳（v1.1）**：基准 §13 天级封闭集合不含洗髓经，本文不得越权升阶 |
| BP-4 | 七十二绝技“戾气”列入 05 §10.2 走火触发源 | **仍提案**：这是组合装配规则，不计单门代价型配额；公式见 §1.3.1 |
| BP-5 | 铁布衫、金钟罩、一苇渡江以原创纳入方式计入 `lg_shaolin72` | **仍提案**：影响同源加速及戾气计数；在基准未收录前保持“原创扩展”，不宣称原著定数 |

### 8.4 原著考据待办

剩余正文“待考”均归下列 12 项；K-01、K-05～K-12 影响武学名目、来源或事件文本，**不改变本轮规则数值**。K-02、K-03 影响年代/地图或人物文本，亦不在本文越权定案。

| # | 影响 | 需核内容（三联／广州修订版基线） |
|---|---|---|
| K-01 | 规则来源标签 | 《天龙八部》《笑傲江湖》《侠客行》《书剑恩仇录》：须弥山掌、大金刚拳/掌、摩诃指、一指禅、如影随形腿、伏魔杖法、达摩剑法是否出现、用名及施用人物 |
| K-02 | 仅时代文本 | 《射雕英雄传》郭啸天、杨铁心开篇与主线年序；在 `design/02`／基准年表确认前沿用现值 |
| K-03 | 地图与人物文本 | 《书剑恩仇录》南少林段落：天虹、于万亭关系、诸殿考较与寺址表述；最终地图位置归 `design/11` |
| K-04 | 仅文本 | 《天龙八部》藏经阁：扫地僧论绝技与佛法的逐字措辞；本文只保留稳妥大意 |
| K-05 | 来源文本 | 《天龙八部》《鹿鼎记》：拈花指相关论述及澄观是否明确通晓 |
| K-06 | 来源文本 | 《天龙八部》虚竹所习入门功夫中是否明确有韦陀掌 |
| K-07 | 来源标签 | 《鹿鼎记》海大富传韦小宝、韦小宝与康熙过招段落：大慈大悲千叶手用名及少林归属 |
| K-08 | 仅事件文本 | 《倚天屠龙记》光明顶：成昆以幻阴指暗袭者名单与先后次序 |
| K-09 | 地图与传承文本 | 《倚天屠龙记》火工头陀、西域金刚门、阿二阿三的地域和师承层级 |
| K-10 | 来源标签 | 金庸作品中是否出现“少林大还丹”名目及使用情节；物品实体以 `design/10` 为准 |
| K-11 | 来源标签 | 《天龙八部》《鹿鼎记》是否有同名“罗汉阵”及人数；玩家版始终标原创扩展 |
| K-12 | 仅人物文本 | 《天龙八部》神山上人与五台山清凉寺、少林的论武关系及其武功 |

### 8.5 开放问题（附默认值）

| # | 事项 | 当前默认 / 追溯 |
|---|---|---|
| O-1 | 剃度是否关闭情缘线换修炼收益 | **已解决**：采用、修炼 `+10%`、可还俗（作者决定 P32；见 §1.2） |
| O-2 | 幻阴指归属 | **已解决**：收在本文 §3.2，`sect:null`（`rulings-v1` 图鉴分工表） |
| O-3 | 西域金刚门是否独立为 `sect_jingangmen` | **已解决**：不独立，只用自由文本 `lineage: 火工头陀 → 西域金刚门 → 阿二、阿三`（C14；见 §3.1） |
| O-4 | 慈悲武学是否默认“制服” | **已解决**：默认开启、可单场关闭，Boss/野兽例外（作者决定 P47；见 §1.3.2） |
| O-5 | 射雕、神雕少林投放 | **已解决**：均以背景与有限入门为主；只有射雕保留易筋经完整线（作者决定 P49；见 §1.1） |
| O-6 | 易筋经 `nature` 与天级观摩 | **已解决**：`harmony`（P06）；三门天级默认均不可观摩（P09；见 §0.3、§0 通用约定） |
| O-7 | 三项技艺门槛建议值 | 默认采用 S-1/S-2；待 05/09 配表时校准，未拍板前不改变武学品阶或来源 |
