# 门派武学图鉴 · 射雕五绝体系（`skills-wujue`）

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴之一。本文覆盖：丐帮（全书界）、桃花岛、白驼山、大理段氏与天龙寺、周伯通、九阴真经系、铁掌帮、江南七怪、杨家枪与将门、蒙古（射雕/神雕，金轮法王除外）。
> **上游**：`00-canon.md`（§4 品阶、§6 属性 ID、§7 分类、§12 ID、§13 天级总表、§16 改编原则、§20 装配栏）。
> **引用而不重定义**：武功数据结构、层数、招式预算、范围模板、特殊规则 → `design/05`；Buff 定义 → `design/06`（本文只引用其 §8–§9 目录中已有的 `bf_*`）；属性与轻功值公式 → `design/03`；书界、境界、印证、残篇 → `design/02`；套装本体 → `design/07`（本文只提"套装候选"）；门派职级 → `design/12`。
> **标注约定**：**（原创扩展）** = 原著没有的武学/招名/设定；**（待考）** = 原著事实需以三联/广州修订版逐字核对；**（原创扩展命名）** = 原著有其人其兵其事而无武学名，本作命名。
> **跨界人物**（金轮法王、全真七子、杨过、小龙女等）的武学只引用其 ID，由对应图鉴定义。

---

## 0. 读法与统一约定

### 0.1 条目格式

| 品阶 | 格式 | 内容 |
|---|---|---|
| 天阶（10–12） | **完整条目卡** | 字段表（出处、origin、sourceChapters、nature、wOut/wIn、reqs、layerStats、层数要点、setTags、conflicts、special、获取、图鉴文本）＋招式表＋被动表 |
| 地阶（7–9） | **完整条目卡**（同上，字段略紧凑） | 同上 |
| 玄/黄阶（1–6） | **紧凑卡** | 一行字段＋招式表（全部招式与关键数值）＋一行被动 |

- 降龙十八掌的**权威定义在 `design/05` §13.1**，本文不重复其 YAML，只补充获取、残本、套装与跨书界说明；九阴白骨爪、左右互搏的代价/机制规则以 05 §9.1.2、§9.3.2 为准，本文补齐其招式与被动。
- 所有 `grade` 为**绝对品阶**；武学施加的 Buff 品阶一律 `grade: inherit`（= 来源武学 `effGrade`，05 §2.6）。
- 字段取值、枚举与 05 §2 一致；`learnSources` 中的任务/NPC ID 为占位（`q_0N_*_9x`、`npc_*`），由 `chapters/` 文档替换（同 05 §17.2 D15）。

### 0.2 招式表列与核算记法（05 §4.2 预算公式）

招式表列：`招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带（Buff·位移·钩子）｜架｜核算`。

| 记号 | 含义（05 §4.2） |
|---|---|
| 核算式 | `AF × (1+Σadj) × Kd × Kp − Σcost`，结果按 0.05 取整（允许 ±0.05） |
| `cd+` | 冷却每 1 回合 +0.12 |
| `内±` | 耗内相对大阶基准（黄 5% / 玄 6% / 地 7% / 天 8%）每 ±1% → ±0.05 |
| `收±` | 收招每比 1000 多/少 100 → ±0.07 |
| `条+` | 常见条件 +0.15；罕见条件 +0.30 |
| `Kd` / `Kp` | 远程气劲 `ranged` 0.85、投射 `projectile` 0.92；不可招架 0.85 |
| Buff 代价 | 硬控（定身/眩晕/缠绕/昏睡/迷惑/移魂）0.25×率×回合；封穴/封内/封经脉/封绝/缴械/麻痹 0.20×率×回合；数值减益、DOT（中毒/蛇毒/流血/内伤/破甲/减速/破绽/虚弱/易伤/动摇/乱心等）0.10×率；嘲讽 0.15×率；自身增益 0.10–0.20 |
| 位移代价 | 击退 0.05/格；拉拽 0.10；突进/跳斩 0.10；绕背/换位 0.15 |
| 绝招 | `power = 3.00 × AF × Kd × Kp − Σcost`；耗气势 100、耗内 = 大阶基准 +2%、收招 1200、无冷却；核心武学首个绝招 ≤ 7 重（05 §4.8、V9） |
| 支援招式 | `power 0`；标准单体治疗 = 目标 `hpMax` 18%（cd 2），护体真气按治疗量 ×1.2 等价（05 §4.2） |
| `aoe_zone` | 倍率为"每跳"；`aoe_chain` 每跳 ×0.8 递减；`aoe_leap` 溅射 ×0.5；`aoe_boomerang` 为"每程" |
| 省略写法 | 表中"单体"= `aoe_single`，"自身"= `aoe_self`；"近身/远程/投射"= `delivery: melee / ranged / projectile`；"架"列 = `parryable`；"n 段"= `hits: n` |

### 0.3 内功贡献（05 §5.5）

`IP = mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen`，第 10 重主运值；须在大阶预算 ±5% 内（黄上 30 / 玄下 41.5 / 玄中 48.5 / 玄上 57 / 地下 72 / 地中 83 / 地上 94.5 / 天下 118 / 天上 156），`stats` 另计且 ≤ 大阶 `layerStats` 上限（黄 6 / 玄 10 / 地 15 / 天 20）。

### 0.4 门派职级（建议，职级表归 `design/12`）

| 门派 | `rank` 建议映射 |
|---|---|
| 丐帮 | `rank` = 袋数（一袋 1 … 九袋 9）；长老/龙头 10；帮主 11（剧情位） |
| 其余门派 | 1 记名/外门 · 2 入门弟子 · 3 亲传/护卫 · 4 执事/高足 · 5 长老/掌门级 |

### 0.5 本组天级（与基准 §13 逐条一致，不新增）

| 武学 | ID | 品阶 | 类型 | 门派/传承 | 原生书界 |
|---|---|---|---|---|---|
| 降龙十八掌 | `sk_xianglong18` | 12 天上 | 拳脚·掌 | 丐帮 | 天龙、射雕、神雕（倚天仅残本） |
| 六脉神剑 | `sk_liumai` | 12 天上 | 拳脚·指 | 大理天龙寺 | 天龙 |
| 九阴真经（总纲·内功） | `sk_jiuyin` | 12 天上 | 内功 | 黄裳 | 射雕、神雕、倚天 |
| 一阳指 | `sk_yiyangzhi` | 11 天中 | 拳脚·指 | 大理段氏 | 天龙、射雕、神雕 |
| 打狗棒法 | `sk_dagou` | 11 天中 | 兵器·棍 | 丐帮 | 天龙、射雕、神雕、倚天 |
| 蛤蟆功 | `sk_hama` | 10 天下 | 内功 | 白驼山 | 射雕、神雕 |
| 弹指神通 | `sk_tanzhi` | 10 天下 | 拳脚·指 | 桃花岛 | 射雕、神雕 |
| 碧海潮生曲 | `sk_bihai` | 10 天下 | 杂学·音律 | 桃花岛 | 射雕、神雕 |
| 左右互搏 | `sk_zuoyouhubo` | 10 天下 | 杂学（机制） | 周伯通 | 射雕、神雕 |
| 空明拳 | `sk_kongming` | 10 天下 | 拳脚·拳 | 周伯通 | 射雕、神雕 |
| 移魂大法 | `sk_yihun` | 10 天下 | 杂学·心神 | 九阴真经 | 射雕 |
| 九阴神爪（正法） | `sk_jiuyinshenzhao` | 10 天下 | 拳脚·擒拿 | 九阴真经 | 射雕、神雕 |
| 铁掌功 | `sk_tiezhang` | 10 天下 | 拳脚·掌 | 铁掌帮 | 射雕 |

> 基准 §13 地阶锚点中属本组者：九阴白骨爪（地上，邪练）、摧心掌（地上）、大伏魔拳（地上）——均按地上 9 收录。

---

## 1. 本组门派一览

| 门派 ID | 名称 | 出现书界（原著 / 原创扩展） | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 | 本文武学数 |
|---|---|---|---|---|---|---|---|---|---|
| `sect_gaibang` | 丐帮 | 原著：天龙、射雕、神雕、倚天、笑傲；原创扩展：碧血、鹿鼎等书界的分舵 | 正 | 各地分舵（天龙洛阳/无锡杏子林、射雕君山大会、神雕襄阳；总舵随代迁移，待考） | 萧峰、洪七公、黄蓉、鲁有脚、耶律齐、史火龙、解风 | 至刚掌法＋奇巧棒法＋群战阵法 | 阳 | 可（袋位制；帮主为剧情位） | 14 |
| `sect_taohuadao` | 桃花岛 | 射雕、神雕 | 亦正亦邪 | 东海桃花岛 | 黄药师、黄蓉、陆乘风、程英；梅超风/陈玄风（叛出） | 奇门五行、指掌轻灵、音律、阵法、医药 | 调和 | 有限（拜黄药师门槛极高；黄蓉/程英羁绊线） | 13 |
| `sect_baituoshan` | 白驼山 | 射雕、神雕 | 邪 | 西域白驼山 | 欧阳锋、欧阳克 | 蛇毒、蓄劲刚猛、杖法、驭蛇 | 阳（蛤蟆功）；阴（逆转经脉） | 可（射雕邪派路线） | 9 |
| `sect_dali` | 大理段氏 | 原著：天龙（段氏）、射雕/神雕（一灯与渔樵耕读）；倚天（朱武连环庄为朱子柳、武三通后人，原著；其武学传承为原创扩展） | 正 | 大理国镇南王府；射雕/神雕一灯隐居湖广桃源山中（待考） | 段正明、段正淳、段誉、段延庆、一灯、朱子柳、武三通 | 指力点穴、剑法、书法入武 | 阳（一阳） | 可（天龙王府护卫/客卿；射雕/神雕入一灯门下） | 9 |
| `sect_tianlongsi` | 天龙寺 | 天龙 | 正 | 大理天龙寺 | 枯荣、本因、本观、本相、本参、本尘（保定帝） | 禅功、六脉剑气 | 调和 | 有限（护法居士，天龙；入门武学借用大理段氏） | 2 |
| —（传承 `lineage: 周伯通`） | 周伯通 | 射雕、神雕 | 正 | 终南山、桃花岛石洞、百花谷 | 周伯通、郭靖、小龙女 | 以柔克刚、一心二用 | 调和倾向 | 否（羁绊传授） | 3 |
| —（传承 `lineage: 九阴真经`） | 九阴真经系 | 射雕、神雕、倚天 | 正法/邪练 | —（秘籍） | 黄裳（著）、周伯通、郭靖、黄蓉、梅超风、陈玄风、欧阳锋、周芷若 | 百家兼收：内功、爪、掌、拳、鞭、身法、心神 | 调和（总纲） | 否（秘籍/奇遇） | 11 |
| `sect_tiezhangbang` | 铁掌帮 | 射雕（神雕余绪：裘千尺、慈恩） | 邪（射雕时通金） | 湖南铁掌峰 | 上官剑南（前帮主）、裘千仞、裘千尺、裘千丈 | 刚猛掌力、踏水轻功 | 阳 | 可（射雕邪派/卧底线） | 5 |
| `sect_jiangnanqiguai` | 江南七怪 | 射雕（神雕余绪：柯镇恶） | 正 | 嘉兴 | 柯镇恶、朱聪、韩宝驹、南希仁、张阿生、全金发、韩小莹 | 各擅兵刃、杂而不精，重合斗 | 阳/中性 | 可（射雕前期拜师线） | 7 |
| —（传承 `lineage: 杨家将`） | 杨家枪与将门 | 原著：射雕（杨铁心）、射雕/神雕/倚天（武穆遗书）；原创扩展：明清军伍通行枪法 | 正 | 临安牛家村等 | 杨铁心、穆念慈、郭靖 | 枪法、兵法 | 阳 | 否（传承/秘籍） | 4 |
| `sect_menggu` | 蒙古（含忽必烈幕府） | 原著：射雕、神雕；倚天（元廷、汝阳王府神箭八雄）；原创扩展：鹿鼎（葛尔丹部） | 射雕中立 / 神雕敌对 | 漠北草原；忽必烈大营 | 成吉思汗、哲别、拖雷、霍都、达尔巴、潇湘子 | 骑射、摔跤、奇门兵器 | 阳 | 可（射雕部族身份；神雕敌对路线） | 6 |
| **合计** | | | | | | | | | **83**（天 13 / 地 23 / 玄 28 / 黄 19） |

> 霍都、达尔巴为金轮法王弟子，按分工收在"蒙古"；其师门武学（龙象般若功 `sk_longxiang` 等）与达尔巴金杵武学 `sk_jingangxiangmochu` 归逍遥/吐蕃组图鉴，本文只引用。周伯通名义属全真，但空明拳、左右互搏为其自创，故单列传承；全真武学引用全真图鉴 ID。

---

## 2. 丐帮 `sect_gaibang`

### 2.1 门派简介

- **时代变迁**：北宋时已号"天下第一大帮"（天龙：乔峰为帮主，杏子林叛乱、聚贤庄之后乔峰去帮）；南宋射雕时北丐洪七公为五绝之一，传帮主位于黄蓉（君山大会，净衣/污衣两派之争）；神雕时黄蓉传鲁有脚、后耶律齐，丐帮随郭靖守襄阳，最为鼎盛；倚天时降龙十八掌已残缺，帮主史火龙久不理事，丐帮一度为陈友谅/成昆所乘；笑傲时帮主解风与少林、武当并列正派领袖。明末清初的丐帮分舵为**（原创扩展）**，只提供黄/玄阶通行武学，填补中武/低武书界的装配栏。
- **各书界强弱**：天龙 强（乔峰）／射雕 强（洪七公）／神雕 极强（郭黄、襄阳）／倚天 中（残本）／笑傲 中（解风）／碧血、鹿鼎 弱（原创扩展分舵，仅黄玄）。
- **加入与晋升**：袋位制（§0.4）；门规"不得欺压良善、不得依附官府"（原创扩展概括）；帮主身份为剧情位（射雕由黄蓉承接，玩家不顶替，只可获"护帮长老"荣衔，原创扩展）。
- **进阶链**：拳掌 穷家拳（黄中）→ 莲花掌（玄中）→ 铁钵功（地下，另需餐风饮露功）；棍 赶狗棍法（黄下）→ 打狗阵（地下）。降龙十八掌、打狗棒法不设门派前置（原著郭靖、杨过均非循序而得）。

### 2.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_xianglong18` | 降龙十八掌 | 拳脚/拳掌 | 12 天上 | 阳 | 0.45/0.55 | 天龙、射雕、神雕（倚天残本） | 萧峰羁绊；洪七公"美食换武功"；郭靖襄阳线；倚天残本秘籍 | 原著（数据见 05 §13.1） |
| `sk_dagou` | 打狗棒法 | 兵器/棍杖 | 11 天中 | 中性 | 0.70/0.30 | 天龙、射雕、神雕、倚天 | 帮主传承；洪七公授招＋黄蓉授诀；倚天残本 | 原著（八字诀原著；招效原创） |
| `sk_tiebogong` | 铁钵功 | 兵器/奇门（钵） | 7 地下 | 阳 | 0.55/0.45 | 倚天、笑傲、碧血 | 掌钵龙头/长老拜师（八袋）；碧血残谱 | 原创扩展（"掌钵龙头"职名为倚天原著） |
| `sk_dagouzhen` | 打狗阵 | 杂学/阵法 | 7 地下 | 中性 | 0.60/0.40 | 天龙、射雕、神雕、倚天、笑傲 | 长老传授（六袋）；射雕君山破阵事件 | 原著（射雕君山）；他书界为原创扩展延续 |
| `sk_suohouqinnashou` | 锁喉擒拿手 | 拳脚/擒拿 | 6 玄上 | 阳 | 0.70/0.30 | 天龙、射雕、神雕、倚天、笑傲、碧血 | 天龙：马大元遗谱/白世镜；后世丐帮传承（五袋） | 原著（天龙·马大元成名绝技）；后世传承原创扩展 |
| `sk_xiaoyaoyou` | 逍遥游 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.65/0.35 | 射雕、神雕 | 洪七公/黄蓉羁绊传授 | 原著（射雕·洪七公授黄蓉）；招名原创扩展 |
| `sk_shexinshu` | 摄心术 | 杂学/心神 | 6 玄上 | 中性 | 0.20/0.80 | 射雕、神雕 | 击败彭长老得其心法；神雕丐帮长老 | 原著（射雕·彭长老，术名待考） |
| `sk_lianhuazhang` | 莲花掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.70/0.30 | 射雕、神雕、倚天、笑傲、碧血、鹿鼎 | 四袋弟子 | 原著（丐帮掌法，出处待考）；招名原创扩展 |
| `sk_guitoudaofa` | 鬼头刀法 | 兵器/刀 | 5 玄中 | 阳 | 0.80/0.20 | 天龙、射雕、神雕、倚天、笑傲、碧血、鹿鼎 | 三袋弟子；天龙吴长风指点 | 原创扩展命名（天龙·吴长风使鬼头刀，待考） |
| `sk_canfengyinlugong` | 餐风饮露功 | 内功 | 4 玄下 | 阳 | 0/1 | 天龙—笑傲、碧血、鹿鼎 | 二袋弟子 | 原创扩展 |
| `sk_yunyoubu` | 云游步 | 轻功 | 3 黄上 | 中性 | — | 天龙—笑傲、碧血、鹿鼎 | 一袋弟子 | 原创扩展 |
| `sk_qiongjiaquan` | 穷家拳 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；观摩 | 原创扩展 |
| `sk_lianhualuo` | 莲花落 | 杂学/音律 | 2 黄中 | 中性 | — | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；街市乞儿 | 原创扩展（莲花落为宋元以来乞者所唱的民间曲艺，史实；原著中出现与否待考） |
| `sk_gangougunfa` | 赶狗棍法 | 兵器/棍杖 | 1 黄下 | 中性 | 0.90/0.10 | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；观摩 | 原创扩展 |

> "天龙—笑傲"= `ch01_tianlong`–`ch05_xiaoao` 五部；碧血 `ch07_bixue`、鹿鼎 `ch08_luding` 为原创扩展分舵，若 `chapters/07`、`chapters/08` 不设丐帮分舵，则删去对应 `sourceChapters`。

### 2.3 天阶条目卡

#### `sk_xianglong18` 降龙十八掌（12 天上 · 拳脚/拳掌 · 丐帮）——补充说明

**权威定义见 `design/05` §13.1**（十八掌招式、被动、层数、倍率、`learnSources`）。本文只作以下补充，均不改动 05 的数值：

| 项 | 补充 |
|---|---|
| 倚天残本 | 05 以 `it_miji_xianglong18_can`（`maxLayer 6`）实现。按 05 §13.1 的层数表，前 6 重恰好解锁 12 掌（亢龙有悔 … 时乘六龙），与"倚天丐帮所存降龙掌数不全"的原著背景相合（**掌数待考**，05 K1）；残本不含第 7 重起的密云不雨、损则有孚与绝招。 |
| 残本与完本 | 外来者带入倚天的完本仍为 10 重；倚天高武无品阶压制，残本只作为未习得者的补充途径。笑傲及以后无原生途径（不设印证）。 |
| 获取预算 | 天龙"丐帮系"与打狗棒法二选一（02 §2.9）；射雕洪七公线为五绝拜师之一；神雕郭靖线计入"郭家与丐帮系"。 |
| setTags 提案 | 05 已列 `set_gaibang_bangzhu`；本文另提 `set_guojing_xiazhe`（§12），**需 05 §13.1 同步增补**，见待决 W-01。 |
| 相生 | 与餐风饮露功（阳）同装：主运阳 → 降龙阳招 Z5 +12%（05 §5.3 相性矩阵，非额外加成）。 |

#### `sk_dagou` 打狗棒法（11 天中 · 兵器/棍杖 · 丐帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕（洪七公传黄蓉；君山大会）、神雕（黄蓉传鲁有脚；杨过得洪七公授招、偷听口诀）；"绊、劈、缠、戳、挑、引、封、转"八字诀为原著；招名多见于射雕/神雕，**逐式出处待考** |
| origin / lineage | `canon` / 丐帮历代帮主（汪剑通 → 乔峰 … 洪七公 → 黄蓉 → 鲁有脚 → 耶律齐 …） |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `neutral`（招意在巧不在力）· 0.70/0.30 · 5 |
| weaponReq | `{category: staff}`（持打狗棒 `eq_dagoubang` 的加成走套装，§12） |
| reqs | `attrs {agi 55, wis 55}`；`aptitude {apStaff 55}`；`morality {min 0}`；`sect {sect_gaibang, rank 11}`；`hard [sect, morality]`（非帮主途径以 `reqsOverride {sect: null}` 放开，见获取） |
| layerStats | `parry [4, 12]`、`pierce [2, 8]`（合计 20） |
| 层数要点 | 1：棒打双犬、绊字诀、八字真诀 ｜ 2：缠字诀 ｜ 3：拨狗朝天、以巧破力 ｜ 4：恶狗拦路 ｜ 5：斜打狗背、棒影 ｜ 6：引字诀 ｜ **7：绝招 天下无狗** ｜ 8：獒口夺杖、反截狗臀 ｜ 9：压肩狗背、巧打 ｜ 10：八诀归一 |
| setTags | `set_gaibang_bangzhu`、`set_huangrong_nvzhuge` |
| conflicts | 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | ① 天龙 `qiyu` `q_01_faction_91`（丐帮变乱后护帮有功，传功长老代传，原创扩展；与降龙二选一）`maxLayer 8`；② 射雕 `master npc_hongqigong` `maxLayer 6`（"有招无诀"，`reqsOverride {sect: null}`）＋ `master npc_huangrong` `maxLayer 10`（羁绊 ≥ 4 或入帮至九袋）；③ 神雕 `qiyu q_03_qiyu_92`（华山绝顶观洪七公与欧阳锋拆招，致敬杨过）`maxLayer 6` ＋ `master npc_huangrong` `maxLayer 10`；④ 倚天 `manual it_miji_dagou_can` `maxLayer 6`（倚天丐帮是否仍传全套待考） |
| 图鉴文本 | 丐帮镇帮绝学，历代只传帮主。以绊、劈、缠、戳、挑、引、封、转八字诀为纲，轻灵奇巧、以巧破力；"天下无狗"一出，四面八方尽是棒影。招式效果为本作原创设计。 |

| 招式（ID）· 诀 | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 棒打双犬 `mv_dagou_bangdashuangquan` · 劈 | 1 | `aoe_chain n1` · 1–2 · 近身 | 0.90（跳段 ×0.8） | 8%/1/1000 | — | 可 | 0.80×(1+0.12) |
| 绊字诀 `mv_dagou_ban` · 绊 | 1 | 单体 · 1–2 · 近身 | 0.75 | 7%/1/900 | `bf_dingshen` 60% 1；`bf_chihuan` 100% | 可 | (1+0.12−0.05−0.07)−0.15−0.10 |
| 缠字诀 `mv_dagou_chan` · 缠 | 2 | 单体 · 1–2 · 近身 | 0.90 | 8%/2/1000 | `bf_chanrao` 70% 2 | 可 | 1.24−0.35 |
| 拨狗朝天 `mv_dagou_bogouchaotian` · 挑 | 3 | 单体 · 1–2 · 近身 | 0.95 | 8%/1/1000 | `bf_polu` 100% 2；`bf_jiaoxie` 25%（`cond: targetArmed`） | 可 | 1.12−0.10−0.05 |
| 恶狗拦路 `mv_dagou_egoulanlu` · 封 | 4 | 自身架势 | 0 | 5%/2/800 | 自身 `bf_jieji` 2（敌入相邻即截击） | — | 架势招式 |
| 斜打狗背 `mv_dagou_xiedagoubei` · 戳 | 5 | 单体 · 1–2 · 近身 | 1.15 | 8%/2/1000 | `bf_fengxue` 40% 1 | 可 | 1.24−0.08 |
| 引字诀 `mv_dagou_yin` · 引 | 6 | `aoe_pull n2` · 1–3 · 远程 | 0.65 | 8%/1/1000 | 拉拽 2；`bf_chaofeng` 100% 1 | 可 | 0.95×1.12×0.85−0.10−0.15 |
| **天下无狗** `mv_dagou_tianxiawugou`（绝招） | 7 | `aoe_around` · 自身 · 近身 | 1.30（3 段） | 10%/—/1200 | `bf_dingshen` 100% 1；`bf_polu` 100% 2 | 不可 | 3.00×0.65×0.85−0.25−0.10 |
| 獒口夺杖 `mv_dagou_aokouduozhang` · 挑 | 8 | 单体 · 1 · 近身；`condition {targetArmed}` | 1.40 | 8%/3/1000 | `bf_jiaoxie` 60% | 可 | (1+0.36+0.15)−0.12 |
| 反截狗臀 `mv_dagou_fanjiegoutun` · 转 | 8 | `aoe_behind` · 1–2 | 0.95 | 8%/2/1000 | 绕背（Z7 背击） | 可 | 0.90×1.24−0.15 |
| 压肩狗背 `mv_dagou_yajiangoubei` · 劈 | 9 | 单体 · 1–2 · 近身 | 1.05 | 9%/2/1000 | `bf_dingshen` 50% 1；`bf_xuruo` 100% | 可 | (1+0.24+0.05)−0.125−0.10 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_dagou_bazi` | 八字真诀 | 1 | stat | Z3 | [0.06, 0.12] | 本招之"诀"（招式 `tags: [jue_*]`）与本武学上一招不同时，本招伤害 +{v}；条件 `differentTagThanLast: jue`（新条件，待决 W-02） |
| `ps_dagou_yiqiao` | 以巧破力 | 3 | stat | Z3 | 0.10 | 目标 `atkOut` 高于自身时，本武学招式伤害 +10% |
| `ps_dagou_bangying` | 棒影 | 5 | trigger | — | [0.30, 0.60] | `onParry`（每回合 1 次）：以 {v} 概率令来招者获得 `bf_polu` 1 回合 |
| `ps_dagou_qiaoda` | 巧打 | 9 | stat | Z3 | 0.05/项 | 目标每带 1 个 `cc` 标签效果，本武学招式 +5%，至多 +15% |
| `ps_dagou_dacheng` | 八诀归一 | 10 | mechanic | Z0 | — | 连续两招使用不同诀后，第三招获得 `bf_bizhong`（×1）；本武学招式 `counterable: false` |

### 2.4 地阶条目卡

#### `sk_tiebogong` 铁钵功（7 地下 · 兵器/奇门 · 丐帮）

| 字段 | 值 |
|---|---|
| 出处 | **（原创扩展）**；倚天丐帮有"掌钵龙头"之职（原著），本作据此衍出"以钵为兵"的一脉 |
| origin / lineage | `expanded` / 丐帮掌钵龙头历代相传 |
| sourceChapters | `ch04_yitian` `ch05_xiaoao` `ch07_bixue` |
| nature · wOut/wIn · moveSlots | `yang` · 0.55/0.45 · 4 |
| weaponReq | `{category: exotic, kinds: [misc]}`（钵；建议 design/10 增设细类 `bowl`，待决 W-04） |
| reqs | `attrs {str 40, con 40}`；`aptitude {apExotic 40}`；`prereq [{sk_lianhuazhang, 5}, {sk_canfengyinlugong, 5}]`；`sect {sect_gaibang, rank 8}`；`hard [sect, prereq]` |
| layerStats | `parry [3, 9]`、`defOut [1, 6]`（合计 15） |
| 层数要点 | 1：钵盂叩击、托钵化缘、化缘 ｜ 3：飞钵回旋 ｜ 4：钵挡 ｜ 5：钵底藏锋 ｜ **7：绝招 钵震八方** ｜ 8：扣钵 ｜ 9：回旋 ｜ 10：钵纳百川 |
| setTags / conflicts | `set_gaibang_tuobo` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 倚天 `master npc_gaibang_zhangbolongtou` `maxLayer 10`；笑傲 `master npc_gaibang_zhanglao` `maxLayer 10`；碧血 `manual it_miji_tiebogong_can` `maxLayer 7`；`observe` 6 |
| 图鉴文本 | （原创扩展）丐帮掌钵龙头一脉的奇门功夫，以精铁钵盂为兵：托钵可挡刀剑暗器，飞钵回旋伤人。"掌钵龙头"为倚天原著中的丐帮职名，本作据此衍出其武学。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 钵盂叩击 `mv_tiebogong_kouji` | 1 | 单体 · 1 · 近身 | 0.95 | 7%/0/1000 | `bf_zhenshe` 25% | 可 | 1−0.025 |
| 托钵化缘 `mv_tiebogong_tuobo` | 1 | 自身架势 | 0 | 5%/2/800 | 自身 `bf_shoushi` 2、`bf_fanzhen` 2 | — | 架势招式 |
| 飞钵回旋 `mv_tiebogong_feibo` | 3 | `aoe_boomerang n3` · 投射 | 0.90/程 | 8%/2/1000 | — | 可 | 0.75×(1+0.24+0.05)×0.92 |
| 钵底藏锋 `mv_tiebogong_bodi` | 5 | 单体 · 1 · 近身 | 1.05 | 7%/1/1000 | `bf_pojia` 50% | 可 | 1.12−0.05 |
| **钵震八方** `mv_tiebogong_zhenbafang`（绝招） | 7 | `aoe_around` · 自身 | 1.80 | 9%/—/1200 | `bf_zhenshe` 100%；击退 1 | 可 | 3.00×0.65−0.10−0.05 |
| 扣钵 `mv_tiebogong_koubo` | 8 | 单体 · 1 · 近身 | 1.10 | 8%/3/1000 | `bf_dingshen` 60% 2 | 可 | (1+0.36+0.05)−0.25×0.6×2 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_tiebogong_huayuan` | 化缘 | 1 | trigger | settle | [0.01, 0.03] | `onParry`（每回合 1 次）：回复 {v} `mpMax` |
| `ps_tiebogong_bodang` | 钵挡 | 4 | stat | Z4 | [0.05, 0.10] | 主手持钵时，受到 `projectile` 招式与暗器伤害 −{v} |
| `ps_tiebogong_huixuan` | 回旋 | 9 | trigger | — | 1.0 | 飞钵回旋回程命中时附加 `bf_chihuan` |
| `ps_tiebogong_dacheng` | 钵纳百川 | 10 | mechanic | settle | — | 主手持钵时，战斗开始获得常驻 `bf_fanzhen`（`dur 99`，品阶 inherit） |

#### `sk_dagouzhen` 打狗阵（7 地下 · 杂学/阵法 · 丐帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕君山丐帮大会，群丐以打狗阵围困郭靖、黄蓉（原著，阵法细节待考）；天龙、神雕、倚天、笑傲的延续为**（原创扩展）** |
| origin / lineage | `canonExpanded` / 丐帮长老与龙头统率 |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` `ch04_yitian` `ch05_xiaoao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0.60/0.40 · 4 |
| reqs | `attrs {wis 40, cha 30}`；`prereq [{sk_gangougunfa, 5}]`；`sect {sect_gaibang, rank 6}`；`hard [sect, prereq]`（阵法强度随技艺 `formation`，05 §2.3） |
| layerStats | `effHit [3, 9]`、`parry [1, 6]`（合计 15） |
| 层数要点 | 1：围阵、群丐合围、阵势 ｜ 4：阵转 ｜ 5：诱敌入阵、围而不攻 ｜ **7：绝招 收网** ｜ 8：截道 ｜ 10：阵成 |
| setTags / conflicts | `set_gaibang_bangzhu` / 无 |
| special / observable | `{fusible: false}`（阵法） / `true` |
| 获取 | 射雕 `master npc_luyoujiao` `maxLayer 10`、`qiyu q_02_main_9x`（君山破阵后领悟，`maxLayer 6`）；天龙 `master npc_gaibang_chuangong` `maxLayer 8`（原创扩展）；神雕/倚天/笑傲 `master` 丐帮长老 `maxLayer 10` |
| 图鉴文本 | 丐帮弟子结阵合围之术。射雕君山大会，群丐以打狗阵围困郭靖、黄蓉（原著）；阵中进退呼应、截道围困，群丐如一。数值与他书界延续为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 围阵 `mv_dagouzhen_weizhen` | 1 | `aoe_zone sq3, t 3` · 1–3 | 0.25/跳 | 8%/3/1000 | 区内敌 `bf_yishang` 100%（每跳刷新） | 可 | 0.25×(1+0.36+0.05)−0.10 |
| 群丐合围 `mv_dagouzhen_hewei` | 1 | `aoe_allies r2` | 0 | 6%/3/900 | 友方 `bf_zhuiji` 2 | — | 支援 |
| 阵转 `mv_dagouzhen_zhenzhuan` | 4 | `aoe_allies r2` | 0 | 5%/2/800 | 友方 `bf_jixing` 2 | — | 支援 |
| 诱敌入阵 `mv_dagouzhen_youdi` | 5 | `aoe_pull n2` · 1–3 · 远程 | 0.80 | 7%/1/1000 | 拉拽 2 | 可 | 0.95×1.12×0.85−0.10 |
| **收网** `mv_dagouzhen_shouwang`（绝招，原创扩展命名） | 7 | `aoe_sq5` · 1–4 · 远程 | 0.95 | 9%/—/1200 | `bf_panshan` 100%；`bf_chihuan` 100% | 可 | 3.00×0.45×0.85−0.10−0.10 |
| 截道 `mv_dagouzhen_jiedao` | 8 | `aoe_allies r1` | 0 | 7%/3/900 | 自身与相邻友方 `bf_jieji` 2 | — | 支援 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_dagouzhen_zhenshi` | 阵势 | 1 | trigger | — | — | `turnStart`：自身 2 格内友方 ≥ 2 时，自身与这些友方获得 `bf_zhuiji` 1 回合 |
| `ps_dagouzhen_weierbugong` | 围而不攻 | 5 | stat | Z3 | [0.05, 0.10] | 自身对"与本方 ≥ 2 名单位相邻"的敌人伤害 +{v} |
| `ps_dagouzhen_zhencheng` | 阵成 | 10 | mechanic | Z4 | 0.05 | 围阵持续 +1 跳，区内敌方每跳另获 `bf_panshan` 1 回合；站在围阵区域内的友方受到伤害 −5% |

### 2.5 玄/黄阶紧凑卡

**`sk_suohouqinnashou` 锁喉擒拿手**（6 玄上 · 拳脚/擒拿 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 30, agi 30}`、`aptitude {apGrapple 30}`、`sect {sect_gaibang, rank 5}`（硬）｜layerStats：`seal [2,6]`、`crit [1,4]`｜获取：天龙 `manual it_miji_suohouqinnashou`（马大元遗物，原创扩展）/ `master npc_baishijing`（执法长老，事败前）；射雕起丐帮五袋 `master`；`observe` 6｜出处：天龙·马大元成名绝技，白世镜以之害马大元并嫁祸（原著）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 锁喉 `mv_suohouqinnashou_suohou` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengnei` 35% 1 | 可 | 1.12−0.07 |
| 扣腕 `mv_suohouqinnashou_kouwan` | 2 | 单体·1 | 0.85 | 6%/0/900 | `bf_jiaoxie` 35%（targetArmed） | 可 | 0.93−0.07 |
| 折臂 `mv_suohouqinnashou_zhebi` | 4 | 单体·1 | 1.25 | 7%/2/1000 | `bf_gushang` 40% | 可 | 1.29−0.04 |
| 锁喉擒龙 `mv_suohouqinnashou_qinlong` | 7 | 单体·1 | 1.15 | 7%/3/1000 | `bf_dingshen` 60% 1；`bf_fengnei` 60% 1 | 可 | 1.41−0.15−0.12 |

被动：`ps_suohouqinnashou_nahou` 拿喉（1，stat Z0：本武学招式暴击 +[3, 8]）；`ps_suohouqinnashou_suoguan` 锁关（5，trigger `onHit` 15%：`bf_fengjingmai`〔封拳脚〕1 回合）；`ps_suohouqinnashou_dacheng` 擒拿圆熟（10，stat Z3：对带 `seal` 标签效果的目标 +15%）。

**`sk_xiaoyaoyou` 逍遥游**（6 玄上 · 拳脚/拳掌 · 阳 · 0.65/0.35 · 栏 3）｜reqs：`attrs {agi 30}`、`aptitude {apFist 30}`（无门派门槛）｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_hongqigong`（羁绊 ≥ 2）/ `master npc_huangrong`；神雕 `master npc_huangrong`；`observe` 6｜出处：射雕·洪七公少年时所练拳法，授黄蓉（原著，路数待考）；招名取《庄子·逍遥游》（原创扩展）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 鲲化为鹏 `mv_xiaoyaoyou_kunhua` | 1 | `aoe_dash n3`·1–3 | 1.00 | 6%/1/1000 | 突进 | 可 | 1.12−0.10 |
| 扶摇直上 `mv_xiaoyaoyou_fuyao` | 3 | `aoe_leap`·1–3 | 1.05 | 7%/2/1000 | 跳斩；`leapHeightExtra {n: 1}` | 可 | 0.90×1.29−0.10 |
| 水击三千 `mv_xiaoyaoyou_shuiji` | 5 | `aoe_line n3`·1–3·远程 | 0.90 | 7%/2/1000 | — | 可 | 0.80×1.29×0.85 |
| 抟风九万 `mv_xiaoyaoyou_tuanfeng` | 7 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |

被动：`ps_xiaoyaoyou_youwuqiong` 游无穷（1，stat Z3：本回合移动 ≥ 3 格后本武学招式 +[5%, 10%]）；`ps_xiaoyaoyou_wusuodai` 无所待（5，effect：闪避成功后自身下一招收招 −100）；`ps_xiaoyaoyou_wuji` 无己（10，mechanic：免疫品阶 ≤ 自身的 `bf_dingshen`）。

**`sk_shexinshu` 摄心术**（6 玄上 · 杂学/心神 · 中性 · 0.20/0.80 · 栏 3）｜reqs：`attrs {wil 35, wis 30}`｜layerStats：`effHit [2,6]`、`resMind [1,4]`｜conflicts：`{with: sk_yihun, type: counter}`——移魂大法持有者（品阶 ≥ 本武学）免疫本武学，施术失败时施术者 50% 反受 `bf_luanxin` 1 回合（原著黄蓉以九阴所载之法反制彭长老，情节细节待考）｜获取：射雕 `qiyu q_02_side_9x`（击败彭长老得其心法，原创扩展）`maxLayer 10`；神雕 `manual it_miji_shexinshu`（彭长老遗谱，原创扩展）｜出处：射雕·丐帮净衣派彭长老的摄魂之术（原著，术名待考）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 摄心 `mv_shexinshu_shexin` | 1 | 单体·1–3·远程 | 0 | 6%/2/1000 | `bf_hunshui` 40% 2 | — | 纯控制 |
| 慑魂 `mv_shexinshu_shehun` | 4 | `aoe_cone n2`·远程 | 0 | 6%/3/1000 | `bf_dongyao` 100%；`bf_luanxin` 30% | — | 纯控制 |
| 迷魂 `mv_shexinshu_mihun` | 7 | 单体·1–3·远程 | 0 | 8%/4/1000 | `bf_mihuo` 50% 1 | — | 纯控制 |

被动：`ps_shexinshu_xinyan` 心眼（1，stat：本武学效果命中 `effHit` +[3%, 8%]）；`ps_shexinshu_rumeng` 入梦（10，mechanic：本武学施加的 `bf_hunshui` 持续 +1，对 Boss 无效）。

**`sk_lianhuazhang` 莲花掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 25, con 25}`、`aptitude {apFist 25}`、`prereq [{sk_qiongjiaquan, 4}]`、`sect {sect_gaibang, rank 4}`（硬：sect、prereq）｜layerStats：`parry [1,5]`、`defOut [1,5]`｜setTags：`set_gaibang_tuobo`｜获取：丐帮四袋 `master`（射雕—笑傲、碧血、鹿鼎）；`pages it_canye_lianhuazhang`（4 页）；`observe` 6｜出处：丐帮掌法（出处待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 并蒂莲开 `mv_lianhuazhang_bingdi` | 1 | 单体·1（2 段） | 1.10 | 6%/1/1000 | — | 可 | 1.12 |
| 莲叶田田 `mv_lianhuazhang_lianye` | 3 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 出水芙蓉 `mv_lianhuazhang_chushui` | 5 | 单体·1 | 1.05 | 6%/1/1000 | 击退 1 | 可 | 1.12−0.05 |
| 莲心藏刺 `mv_lianhuazhang_lianxin` | 7 | 单体·1 | 1.25 | 7%/2/1000 | `bf_pojia` 50% | 可 | 1.29−0.05 |

被动：`ps_lianhuazhang_lianjin` 莲劲（1，stat Z2：本武学无视目标外功防御 [3%, 8%]）；`ps_lianhuazhang_buran` 出淤不染（5，stat：`resPoison` +[4, 10] pp）；`ps_lianhuazhang_liantai` 莲台（10，stat Z3：连续两次行动命中同一目标时本武学 +10%）。

**`sk_guitoudaofa` 鬼头刀法**（5 玄中 · 兵器/刀 · 阳 · 0.80/0.20 · 栏 3）｜reqs：`attrs {str 30}`、`aptitude {apBlade 30}`、`sect {sect_gaibang, rank 3}`（硬）｜layerStats：`hit [1,4]`、`crit [1,6]`｜获取：天龙 `master npc_wuchangfeng`（吴长风羁绊）`maxLayer 10`；射雕起丐帮三袋 `master`；`pages`；`observe` 6｜出处：天龙丐帮吴长老（吴长风）使鬼头刀（原著，待考）；刀法名与招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 鬼头开路 `mv_guitoudaofa_kailu` | 1 | 单体·1 | 0.95 | 6%/0/1000 | `bf_liuxue` 30% | 可 | 1−0.03 |
| 阎罗点卯 `mv_guitoudaofa_dianmao` | 3 | `aoe_line n2` | 0.95 | 6%/1/1000 | — | 可 | 0.85×1.12 |
| 夜叉探海 `mv_guitoudaofa_tanhai` | 5 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 无常索命 `mv_guitoudaofa_suoming` | 7 | 单体·1 | 1.25 | 7%/2/1000 | `bf_liuxue` 60% | 可 | 1.29−0.06 |

被动：`ps_guitoudaofa_daochen` 刀沉（1，stat Z6：本武学暴击伤害 +[5, 12] pp）；`ps_guitoudaofa_shaqi` 煞气（5，trigger `onKill`：自身 `bf_zhanyi` +1 层）；`ps_guitoudaofa_dacheng` 索命（10，stat Z3：对带 `bleed` 标签效果的目标 +8%）。

**`sk_canfengyinlugong` 餐风饮露功**（4 玄下 · 内功 · 阳 · 0/1 · 栏 3）｜**（原创扩展）**丐帮弟子耐饥寒、走江湖的根基心法｜reqs：`attrs {con 25}`、`sect {sect_gaibang, rank 2}`（硬）｜contribution：`mpMaxPct 12, hpMaxPct 10, attrs {con 6}, mpRegen 1.5, stats {resCold 5, resPoison 5}`（IP 41.5）｜setTags：`set_gaibang_bangzhu`、`set_gaibang_tuobo`｜获取：丐帮二袋 `master`（全部丐帮书界）；碧血/鹿鼎 `manual it_miji_canfengyinlugong`；`pages`

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 吐纳 `mv_canfengyinlugong_tuna` | 3 | 自身 | 0 | 5%/3/900 | 自身 `bf_huinei` 3 | — | 支援 |
| 忍饥耐寒 `mv_canfengyinlugong_renji` | 6 | 自身 | 0 | 6%/3/1000 | 驱散自身 `cold`/`poison` 1 个（≤ 品阶）；回复 10% `hpMax` | — | 支援（低于标准治疗） |

被动：`ps_canfengyinlugong_canfeng` 餐风（1，stat：`hpRegen` +[0.5, 1.5]，`auxMode scaled`）；`ps_canfengyinlugong_yinlu` 饮露（5，mechanic：战斗外体力消耗 −10%，`bf_shouhan` 持续减半，`auxMode full`）；`ps_canfengyinlugong_bainao` 百折不挠（10，stat Z4：气血 < 30% 时受到伤害 −8%）。

**`sk_yunyoubu` 云游步**（3 黄上 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**｜reqs：`sect {sect_gaibang, rank 1}`（硬）｜轻功值 `Q_skill` 按 03 §4.5 `QS(3) = 45`｜layerStats：`eva [1,4]`、`tough [1,2]`｜获取：丐帮一袋 `master`；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 游方 `mv_yunyoubu_youfang` | 1 | 自身 | 0 | 3%/2/800 | 自身 `bf_jixing` 2 | — | 支援 |
| 千里行乞 `mv_yunyoubu_qianli` | 5 | 自身 | 0 | 4%/3/900 | 自身 `bf_dunzou` 2 | — | 支援 |

被动：`ps_yunyoubu_yunyou` 云游（1，mechanic：探索中体力消耗 −[5%, 15%]）；`ps_yunyoubu_yuanman` 走遍天下（10，mechanic：大地图旅行耗时 −10%，design/11 接口）。

**`sk_qiongjiaquan` 穷家拳**（2 黄中 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**丐帮入门拳｜reqs：无（入帮即授）｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`set_gaibang_tuobo`｜获取：丐帮 `master`（入帮）；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 叫化开门 `mv_qiongjiaquan_kaimen` | 1 | 单体·1 | 0.90 | 4%/0/950 | — | 可 | 1−0.05−0.035 |
| 讨饭连环 `mv_qiongjiaquan_lianhuan` | 4 | 单体·1（2 段） | 1.10 | 5%/1/1000 | — | 可 | 1.12 |
| 滚地十八跌 `mv_qiongjiaquan_gundi` | 7 | `aoe_sweep` | 0.80 | 5%/1/1000 | `bf_panshan` 50% | 可 | 0.75×1.12−0.05 |

被动：`ps_qiongjiaquan_picao` 皮糙肉厚（5，stat：`resCC` +[5, 10] pp）；`ps_qiongjiaquan_yuanman` 入帮圆满（10，mechanic：首次练满 `apFist` +1（全游戏一次）；此后丐帮拳脚武学资质软门槛 −10）。

**`sk_lianhualuo` 莲花落**（2 黄中 · 杂学/音律 · 中性 · 栏 3）｜**（原创扩展）**乞者唱曲，丐帮以之鼓劲、传讯｜reqs：无｜强度技艺 `music`（05 §2.3）｜layerStats：`effHit [1,3]`、`resMind [1,3]`｜setTags：`set_gaibang_tuobo`｜获取：丐帮入帮；街市乞儿事件（design/11）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 数来宝 `mv_lianhualuo_shulaibao` | 1 | `aoe_allies r2` | 0 | 4%/3/1000 | 友方 `bf_juqi` 2 | — | 支援 |
| 讨赏 `mv_lianhualuo_taoshang` | 4 | `aoe_cone n2`（敌） | 0 | 4%/2/1000 | `bf_xieqi` 40% | — | 纯控制 |
| 群丐应和 `mv_lianhualuo_yinghe` | 7 | `aoe_allies r3` | 0 | 5%/4/1000 | 友方 `bf_ruiyi` 1 | — | 支援 |

被动：`ps_lianhualuo_anhao` 暗号（1，mechanic：探索中可用莲花落与丐帮弟子互通消息，解锁丐帮情报对话，design/12 接口）；`ps_lianhualuo_yuanman` 圆满（10，stat：本武学施加的增益持续 +1）。

**`sk_gangougunfa` 赶狗棍法**（1 黄下 · 兵器/棍杖 · 中性 · 0.90/0.10 · 栏 3）｜**（原创扩展）**乞儿防身的竹棒法，打狗阵之基｜reqs：无｜layerStats：`parry [1,4]`、`hit [1,2]`｜setTags：`set_gaibang_tuobo`｜获取：丐帮入帮；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 当头棒喝 `mv_gangougunfa_banghe` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 拨草寻蛇 `mv_gangougunfa_bocao` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 棒打落水 `mv_gangougunfa_luoshui` | 7 | 单体·1–2 | 1.05 | 5%/1/1000 | `bf_chihuan` 50% | 可 | 1.12−0.05 |

被动：`ps_gangougunfa_ganggou` 赶狗（1，stat Z3：对带 `beast` 标签的敌人（野兽，design/09 敌人标签）+[10%, 20%]）；`ps_gangougunfa_yuanman` 圆满（10，mechanic：首次练满 `apStaff` +1；学习打狗阵、打狗棒法时棍杖资质软门槛 −10）。

---

## 3. 桃花岛 `sect_taohuadao`

### 3.1 门派简介

- **时代**：射雕时黄药师为"东邪"，五绝之一；门下陈玄风、梅超风盗《九阴真经》下卷叛出，黄药师迁怒打断其余弟子（曲灵风、陆乘风、武眠风、冯默风）腿筋逐出岛外；后以旋风扫叶腿法与内功赠陆乘风（原著，细节待考）。神雕时黄药师晚年收程英为关门弟子，桃花岛武学由黄蓉、程英承传，郭靖黄蓉一度居岛。倚天以后原著不再出现桃花岛一脉（黄衫女子等传承归他组）。
- **强弱**：射雕 极强（黄药师一人一岛）／神雕 强（黄药师、黄蓉、程英）。不在中武/低武书界出现——其武学只能经书眠携带（拳脚、内功、兵器）或化为残篇（碧海潮生曲、桃花阵、轻功等非核心武学）。
- **风格**：奇门五行、指掌轻灵、兼通音律医卜；内力调和；武学多取意于岛上对联"桃花影落飞神剑，碧海潮生按玉箫"（原著对联，待考逐字）。
- **加入**：黄药师收徒门槛极高（`wis ≥ 70`，且须通过"琴棋书画、医卜星相"之试，原创扩展）；替代路线为黄蓉（射雕）、程英（神雕）羁绊传授入门与中坚武学。
- **进阶链**：拳掌 碧波掌（黄中）→ 劈空掌（玄中）→ 落英神剑掌（地下）；指/暗器 飞石手（黄上）→ 弹指神通（天下）；内功 碧涛玄功（地下）为碧海潮生曲、玉箫剑法的前置。

### 3.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_tanzhi` | 弹指神通 | 拳脚/指法 | 10 天下 | 调和 | 0.35/0.65 | 射雕、神雕 | 黄药师亲传（亲传弟子或羁绊）；黄蓉授粗浅 | 原著 |
| `sk_bihai` | 碧海潮生曲 | 杂学/音律 | 10 天下 | 调和 | 0.10/0.90 | 射雕、神雕 | 黄药师亲传；神雕程英授箫艺（残） | 原著 |
| `sk_lanhuafuxueshou` | 兰花拂穴手 | 拳脚/擒拿 | 8 地中 | 阴 | 0.40/0.60 | 射雕、神雕 | 黄药师/黄蓉 | 原著 |
| `sk_yuxiaojianfa` | 玉箫剑法 | 兵器/奇门（箫） | 8 地中 | 调和 | 0.55/0.45 | 射雕、神雕 | 黄药师；神雕程英 | 原著 |
| `sk_luoyingshenjianzhang` | 落英神剑掌 | 拳脚/拳掌 | 7 地下 | 调和 | 0.55/0.45 | 射雕、神雕 | 入门弟子；黄蓉/程英羁绊 | 原著 |
| `sk_bitaoxuangong` | 碧涛玄功 | 内功 | 7 地下 | 调和 | 0/1 | 射雕、神雕 | 黄药师亲传；试剑亭石匣（奇遇） | 原创扩展 |
| `sk_taohuazhen` | 桃花阵 | 杂学/阵法 | 7 地下 | 中性 | 0.50/0.50 | 射雕、神雕 | 黄药师/黄蓉；解桃花岛阵谜 | 原著（岛上桃林依奇门五行布置）；"桃花阵"为本作统称 |
| `sk_xuanfengsaoyetui` | 旋风扫叶腿 | 拳脚/腿法 | 6 玄上 | 阳 | 0.70/0.30 | 射雕、神雕 | 归云庄陆乘风、陆冠英；黄药师赠谱 | 原著（归云庄，细节待考） |
| `sk_pikongzhang` | 劈空掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.50/0.50 | 射雕、神雕 | 陆乘风；神雕冯默风 | 原著（桃花岛掌法，待考） |
| `sk_taohuayingluo` | 桃花影落 | 轻功 | 5 玄中 | 中性 | — | 射雕、神雕 | 入门弟子；黄蓉 | 原创扩展（取岛上对联意） |
| `sk_taohuayaoli` | 桃花药理 | 杂学/医 | 4 玄下 | 中性 | — | 射雕、神雕 | 黄蓉/程英；岛上药圃 | 原创扩展（九花玉露丸为原著） |
| `sk_feishishou` | 飞石手 | 暗器 | 3 黄上 | 中性 | 0.80/0.20 | 射雕、神雕 | 入门 | 原创扩展 |
| `sk_bibozhang` | 碧波掌 | 拳脚/拳掌 | 2 黄中 | 调和 | 0.70/0.30 | 射雕、神雕 | 入门 | 原创扩展 |

### 3.3 天阶条目卡

#### `sk_tanzhi` 弹指神通（10 天下 · 拳脚/指法 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕：黄药师以指力弹出石子、暗器，破空有声，隔空伤人点穴（原著）；招名为原创扩展 |
| origin / lineage | `canon` / 黄药师 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.35/0.65 · 5 |
| reqs | `attrs {wis 55, agi 50}`；`aptitude {apFinger 55}`；`sect {sect_taohuadao, rank 3}`；`hard [sect]`（羁绊途径以 `reqsOverride {sect: null}` 放开） |
| layerStats | `hit [3, 10]`、`crit [2, 10]`（合计 20） |
| 层数要点 | 1：弹指、神通点穴、指力 ｜ 2：瞄势 ｜ 3：连珠弹、破空 ｜ 4：弹指穿石 ｜ 5：截脉、神准 ｜ **7：绝招 天花乱坠** ｜ 8：弹甲 ｜ 9：隔空 ｜ 10：弹指大成 |
| setTags / conflicts | `set_taohuadao` / 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`（亲传或羁绊 ≥ 5）、`master npc_huangrong` `maxLayer 6`（得其粗浅，原创扩展）；神雕 `master npc_huangyaoshi` `maxLayer 10` |
| 图鉴文本 | 东邪黄药师的指上绝技，以指力弹出石子、暗器，破空有声，可隔空点穴、伤人于数丈之外。本作以远程指力与封穴实现，招名多为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 弹指 `mv_tanzhi_tanzhi` | 1 | 单体 · 1–5 · 远程 | 0.85 | 8%/0/1000 | — | 可 | 1×0.85 |
| 神通点穴 `mv_tanzhi_dianxue` | 1 | 单体 · 1–4 · 远程 | 0.85 | 8%/1/1000 | `bf_fengxue` 50% 1 | 可 | 1.12×0.85−0.10 |
| 瞄势 `mv_tanzhi_miaoshi` | 2 | 自身 | 0 | 4%/2/800 | 自身 `bf_ningshen` 2 | — | 支援 |
| 连珠弹 `mv_tanzhi_lianzhu` | 3 | `aoe_multi n3, r1` · 1–5 | 1.10（3 段） | 9%/2/1000 | — | 可 | 0.85×1.29（乱击 AF 已含远程） |
| 弹指穿石 `mv_tanzhi_chuanshi` | 4 | `aoe_pierce` · 1–5 · 远程 | 0.80 | 8%/1/1000 | `ignoreDef {out: 0.15}` | 可 | 0.90×1.12×0.85−0.05 |
| 截脉 `mv_tanzhi_jiemai` | 5 | 单体 · 1–4 · 远程 | 0.95 | 8%/2/1000 | `bf_fengnei` 50% 1 | 可 | 1.24×0.85−0.10 |
| **天花乱坠** `mv_tanzhi_tianhua`（绝招，原创扩展命名） | 7 | `aoe_diamond r2` · 1–5 · 远程 | 1.15 | 10%/—/1200 | `bf_fengxue` 50% 1 | 可 | 3.00×0.50×0.85−0.10 |
| 弹甲 `mv_tanzhi_tanjia`（触发） | 8 | 自身 | 0 | 3%/—/— | `trigger {on: projectileIncoming, perRound 2}`；`deflectProjectile {chance: [0.25, 0.45]}` | — | 触发招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_tanzhi_zhili` | 指力 | 1 | trigger | — | [0.10, 0.25] | `onHit`：{v} 概率施加 `bf_fengxue` 1 回合（本武学招式） |
| `ps_tanzhi_pokong` | 破空 | 3 | effect | — | +1 / +2 | 本武学远程招式射程 +1（9 重起 +2） |
| `ps_tanzhi_shenzhun` | 神准 | 5 | trigger | Z0 | — | 处于 `bf_ningshen` 时，下一次本武学招式获得 `bf_bizhong` ×1 |
| `ps_tanzhi_gekong` | 隔空 | 9 | stat | Z2 | 0.15 | 本武学招式无视目标 15% 内劲防御 |
| `ps_tanzhi_dacheng` | 弹指大成 | 10 | mechanic | — | — | 本武学施加的 `bf_fengxue` 持续 +1；弹甲拨开率 +10% |

#### `sk_bihai` 碧海潮生曲（10 天下 · 杂学/音律 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：黄药师以玉箫吹奏，与欧阳锋铁筝、洪七公长啸于桃花岛斗曲；乐声以内力催动，听者心神摇荡、随乐起舞（原著）；神雕：黄药师仍以此曲御敌（细节待考） |
| origin / lineage | `canon` / 黄药师 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.10/0.90 · 5 |
| reqs | `attrs {wis 60, wil 50}`；`prereq [{sk_bitaoxuangong, 5}]`；`sect {sect_taohuadao, rank 3}`；`hard [sect, prereq]`；强度技艺 `music`（软门槛建议 ≥ 50，Reqs 扩展字段见待决 W-03） |
| layerStats | `effHit [4, 12]`、`resMind [2, 8]`（合计 20） |
| 层数要点 | 1：潮起、定神、箫引 ｜ 3：潮涌、心猿 ｜ 5：惊涛、内力催音 ｜ 6：心随音动 ｜ **7：绝招 碧海潮生** ｜ 8：余音、斗曲 ｜ 10：潮生不息 |
| setTags / conflicts | `set_taohuadao` / 无 |
| special / observable | `{fusible: false, instrument: flute}`（持箫全额，否则倍率与施加率 ×0.7）/ `false` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`（羁绊 ≥ 5 且 `music ≥ 50`）；神雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_chengying` `maxLayer 6`（程英箫艺，原创扩展） |
| 图鉴文本 | 黄药师以玉箫奏出的音功，内力催动乐声如潮水层层涌来，听者心旌摇动、随之起舞，定力稍差者内息大乱；敌我皆受其扰。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 潮起 `mv_bihai_chaoqi` | 1 | `aoe_ring r2` · 远程 · 友伤 `all` | 0.35 | 8%/0/1000 | `bf_dongyao` 100% | 不适用（音功） | 0.55×0.85−0.10 |
| 定神 `mv_bihai_dingshen` | 1 | `aoe_allies r3` | 0 | 5%/3/900 | 友方 `bf_dingxin` 2 | — | 支援 |
| 潮涌 `mv_bihai_chaoyong` | 3 | `aoe_wave d1, w5` · 远程 · `all` | 0.55 | 9%/1/1000 | `bf_luanxin` 40% | — | 0.60×1.17×0.85−0.04 |
| 惊涛 `mv_bihai_jingtao` | 5 | `aoe_ring r3` · 远程 · `all` | 0.45 | 10%/2/1000 | `bf_luanxin` 60%；`bf_xieqi` 50% | — | 0.50×1.34×0.85−0.06−0.05 |
| 心随音动 `mv_bihai_xinsui` | 6 | 单体 · 1–5 · 远程 | 0 | 9%/3/1000 | `bf_mihuo` 50% 1 | — | 纯控制 |
| **碧海潮生** `mv_bihai_chaosheng`（绝招） | 7 | `aoe_field side all` | 0.70 | 10%/—/1200 | `bf_luanxin` 100%；`bf_dongyao` 100% | — | 3.00×0.35×0.85−0.10−0.10 |
| 余音 `mv_bihai_yuyin` | 8 | `aoe_zone diamond2, t 3` · 1–4 · `all` | 0.30/跳 | 8%/2/1000 | 区内每跳 `bf_luanxin` 30% | — | 0.25×1.24−0.03 |

> 音功核算约定：音律/音功攻击招式不可招架（Kp 0.85），但敌我皆伤（`friendlyFire: all`），按"罕见条件"补 +0.15（0.85 × 1.15 ≈ 0.98），两项相抵，核算中一并略去；只作用敌方的音律招式（如心随音动）不享受此补偿。

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_bihai_xiaoyin` | 箫引 | 1 | mechanic | — | — | 本武学招式带 `sonic` 标签、`hTol 99`、无视单位与地形阻挡（05 §4.4）；须持 `kinds: flute` 兵器方为全额 |
| `ps_bihai_xinyuan` | 心猿 | 3 | stat | Z0 | [0.05, 0.12] | 对定力 `wil` 低于自身的目标，本武学效果命中 +{v} |
| `ps_bihai_neiyin` | 内力催音 | 5 | stat | Z3 | 0.10 | 主运内功为调和时，本武学招式伤害 +10%、效果命中 +5% |
| `ps_bihai_douqu` | 斗曲 | 8 | mechanic | — | — | 敌方施放 `sonic` 招式时（每回合 1 次），抵消该招对己方的附带效果（品阶 ≤ 自身）；原著桃花岛三人斗曲 |
| `ps_bihai_dacheng` | 潮生不息 | 10 | mechanic | — | 0.5 | 碧海潮生命中后，区内敌方下回合开始再判定一次 `bf_luanxin`（50%）；本方全体自动获得 `bf_dingxin` 1 回合 |

### 3.4 地阶条目卡

#### `sk_lanhuafuxueshou` 兰花拂穴手（8 地中 · 拳脚/擒拿 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕：黄药师、黄蓉的点穴擒拿手法，出手如拈兰拂花（原著，交手细节待考）；招名原创扩展 |
| origin / lineage | `canon` / 黄药师 → 黄蓉、程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.40/0.60 · 4 |
| reqs | `attrs {agi 45, wis 45}`；`aptitude {apGrapple 45}`；`sect {sect_taohuadao, rank 2}`；`hard [sect]` |
| layerStats | `seal [3, 10]`、`eva [1, 5]`（合计 15） |
| 层数要点 | 1：拂穴、兰指轻拈、认穴 ｜ 3：幽兰吐芳 ｜ 4：轻灵 ｜ 5：空谷幽兰 ｜ **7：绝招 九畹兰香** ｜ 8：拈花擒拿、冲穴 ｜ 10：兰花大成 |
| setTags / conflicts | `set_taohuadao`、`set_huangrong_nvzhuge` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_huangrong` `maxLayer 8`（羁绊 ≥ 3）；神雕 `master npc_huangrong` `maxLayer 10`、`master npc_chengying` `maxLayer 8`；`observe` 6 |
| 图鉴文本 | 桃花岛点穴擒拿手法，出手如拈兰拂花，姿态闲雅而认穴奇准，专拂敌人要穴。黄药师、黄蓉父女皆擅（原著）；招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 拂穴 `mv_lanhuafuxueshou_fuxue` | 1 | 单体 · 1 · 近身 | 1.00 | 7%/1/900 | `bf_fengxue` 30% 1 | 可 | (1+0.12−0.07)−0.06 |
| 兰指轻拈 `mv_lanhuafuxueshou_nian` | 1 | 单体 · 1 · 近身 | 0.85 | 7%/0/800 | — | 可 | 1−0.14 |
| 幽兰吐芳 `mv_lanhuafuxueshou_tufang` | 3 | `aoe_sweep` | 0.80 | 7%/1/1000 | `bf_fengxue` 20% 1 | 可 | 0.75×1.12−0.04 |
| 空谷幽兰 `mv_lanhuafuxueshou_konggu` | 5 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 0.9, expires: nextOwnAction, applyBuff: bf_fengxue 40%}` | — | 架势招式 |
| **九畹兰香** `mv_lanhuafuxueshou_jiuwan`（绝招，原创扩展命名，取《离骚》"滋兰之九畹"） | 7 | 单体 · 1（5 段） | 2.50 | 9%/—/1200 | `bf_fengxue` 100% 2；`bf_fengnei` 50% 1 | 可 | 3.00−0.40−0.10 |
| 拈花擒拿 `mv_lanhuafuxueshou_qinna` | 8 | 单体 · 1 · 近身 | 1.15 | 8%/2/1000 | `bf_jiaoxie` 40%（targetArmed）；`bf_fengjingmai` 40% 1 | 可 | (1+0.24+0.05)−0.08−0.08 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_lanhuafuxueshou_renxue` | 认穴 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_renxue`（`dur 99`，品阶 inherit） |
| `ps_lanhuafuxueshou_qingling` | 轻灵 | 4 | trigger | — | 0.5 | `onHit`（每回合 1 次）：50% 自身获得 `bf_piaohu` 1 回合 |
| `ps_lanhuafuxueshou_chongxue` | 冲穴 | 8 | mechanic | — | +20% | 自身被 `seal` 标签效果所制时，S5 冲穴判定成功率 +20%（06 §7.1） |
| `ps_lanhuafuxueshou_dacheng` | 兰花大成 | 10 | mechanic | Z0 | — | 对已被封穴的目标，本武学招式不可被招架，且所附 `bf_fengxue` 持续 +1 |

#### `sk_yuxiaojianfa` 玉箫剑法（8 地中 · 兵器/奇门（箫）· 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕：黄药师以玉箫为剑（原著）；神雕程英亦持玉箫（原著，剑法传承细节待考）；招名原创扩展 |
| origin / lineage | `canon` / 黄药师 → 程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| weaponReq | `{category: exotic, kinds: [flute], altCategories: {unlockLayer: 1, categories: [sword], mult: 0.9}}`（以剑代箫 ×0.9） |
| reqs | `attrs {agi 45, wis 50}`；`aptitude {apExotic 45}`；`prereq [{sk_bitaoxuangong, 3}]`；`sect {sect_taohuadao, rank 3}`；`hard [sect, prereq]` |
| layerStats | `hit [2, 7]`、`parry [2, 8]`（合计 15） |
| 层数要点 | 1：箫点梅花、玉箫横吹、箫剑同源 ｜ 3：影落飞神 ｜ 4：以乐入剑 ｜ 5：碧海按箫 ｜ 6：箫中剑气 ｜ **7：绝招 桃花影落飞神剑** ｜ 8：箫剑合鸣 ｜ 9：箫声剑影 ｜ 10：箫剑大成 |
| setTags / conflicts | `set_taohuadao` / `{with: sk_bihai, type: synergy}`（见被动"箫剑合鸣"，≤ +8% 的相生） |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`；神雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_chengying` `maxLayer 8`；`observe` 6 |
| 图鉴文本 | 黄药师以玉箫为剑的剑法，箫中藏剑、剑中带音，出招飘逸，兼以乐声扰敌心神。岛上对联"桃花影落飞神剑，碧海潮生按玉箫"即言此。招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 箫点梅花 `mv_yuxiaojianfa_meihua` | 1 | 单体 · 1–2 · 近身 | 0.95 | 7%/0/1000 | `bf_fengxue` 15% 1 | 可 | 1−0.03 |
| 玉箫横吹 `mv_yuxiaojianfa_hengchui` | 1 | `aoe_sweep` | 0.85 | 7%/1/1000 | — | 可 | 0.75×1.12 |
| 影落飞神 `mv_yuxiaojianfa_feishen` | 3 | `aoe_dash n3` · 1–3 | 1.05 | 8%/1/1000 | 突进 | 可 | (1+0.12+0.05)−0.10 |
| 碧海按箫 `mv_yuxiaojianfa_anxiao` | 5 | 单体 · 1–2 · 近身 | 1.25 | 8%/2/1000 | `bf_luanxin` 40% | 可 | 1.29−0.04 |
| 箫中剑气 `mv_yuxiaojianfa_jianqi` | 6 | `aoe_line n3` · 1–3 · 远程 | 0.90 | 8%/2/1000 | — | 可 | 0.80×1.29×0.85 |
| **桃花影落飞神剑** `mv_yuxiaojianfa_feishenjian`（绝招） | 7 | `aoe_cone n3`（3 段） | 1.85 | 9%/—/1200 | `bf_luanxin` 100% | 可 | 3.00×0.65−0.10 |
| 箫声剑影 `mv_yuxiaojianfa_jianying` | 9 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 1.0, applyBuff: bf_polu}` | — | 架势招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yuxiaojianfa_xiaojian` | 箫剑同源 | 1 | stat | Z3 | [0.05, 0.10] | 持 `flute` 时本武学招式伤害 +{v}（以剑代箫时无此项） |
| `ps_yuxiaojianfa_yinlv` | 以乐入剑 | 4 | stat | Z0 | ≤ 0.08 | 技艺 `music` 每 10 点，本武学效果命中 +1%，至多 +8% |
| `ps_yuxiaojianfa_heming` | 箫剑合鸣 | 8 | stat | — | +20pp | 同时装配碧海潮生曲时，本武学所附 `bf_luanxin` 施加率 +20 个百分点（相生，05 §9.2） |
| `ps_yuxiaojianfa_dacheng` | 箫剑大成 | 10 | mechanic | Z0 | — | 对带 `mind` 标签效果的目标，本武学招式无视招架（`skipParry`） |

#### `sk_luoyingshenjianzhang` 落英神剑掌（7 地下 · 拳脚/拳掌 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：桃花岛掌法，黄药师所创，黄蓉少时即以之行走江湖（原著，交手细节待考）；神雕程英亦习（待考）；招名原创扩展 |
| origin / lineage | `canon` / 黄药师 → 黄蓉、程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apFist 40}`；`prereq [{sk_pikongzhang, 4}]`；`sect {sect_taohuadao, rank 2}`；`hard [sect, prereq]`（黄蓉/程英羁绊途径 `reqsOverride {sect: null, prereq: []}`） |
| layerStats | `eva [2, 8]`、`hit [1, 7]`（合计 15） |
| 层数要点 | 1：落英缤纷、花落无声、虚幻 ｜ 3：飞花拂柳 ｜ 5：虚实变幻、飘零 ｜ **7：绝招 神剑落英** ｜ 8：桃花满地、落英成阵 ｜ 10：落英大成 |
| setTags / conflicts | `set_taohuadao`、`set_huangrong_nvzhuge` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_huangrong` `maxLayer 10`（羁绊 ≥ 2）、`master npc_huangyaoshi` `maxLayer 10`；神雕 `master npc_huangrong` / `npc_chengying` `maxLayer 10`；`pages it_canye_luoyingshenjianzhang`（6 页）；`observe` 6 |
| 图鉴文本 | 桃花岛掌法，掌影缤纷如桃花飘落，虚实相生、令人目眩。黄药师所创，黄蓉少时即以之行走江湖（原著）；招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 落英缤纷 `mv_luoyingshenjianzhang_binfen` | 1 | `aoe_multi n4, r1` · 1 | 0.95（4 段） | 7%/1/1000 | — | 可 | 0.85×1.12 |
| 花落无声 `mv_luoyingshenjianzhang_wusheng` | 1 | 单体 · 1 · 近身 | 0.90 | 6%/0/900 | — | 可 | 1−0.05−0.07 |
| 飞花拂柳 `mv_luoyingshenjianzhang_fuliu` | 3 | `aoe_behind` · 1–2 | 0.95 | 7%/2/1000 | 绕背 | 可 | 0.90×1.24−0.15 |
| 虚实变幻 `mv_luoyingshenjianzhang_xushi` | 5 | 单体 · 1（2 段） | 1.25 | 8%/2/1000 | `bf_polu` 50% | 可 | 1.29−0.05 |
| **神剑落英** `mv_luoyingshenjianzhang_shenjian`（绝招） | 7 | `aoe_multi n8, r2` · 1–2 | 2.45（8 段） | 9%/—/1200 | `bf_polu` 100% | 可 | 3.00×0.85−0.10 |
| 桃花满地 `mv_luoyingshenjianzhang_mandi` | 8 | `aoe_around` | 0.85 | 8%/2/1000 | — | 可 | 0.65×1.29 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_luoyingshenjianzhang_xuhuan` | 虚幻 | 1 | effect | Z0 | [0.30, 0.50] | 本武学多段招式某段被闪避时，{v} 概率改为擦中（该段 ×0.5） |
| `ps_luoyingshenjianzhang_piaoling` | 飘零 | 5 | trigger | — | — | 本武学招式命中后（每回合 1 次）自身获得 `bf_piaohu` 1 回合 |
| `ps_luoyingshenjianzhang_chengzhen` | 落英成阵 | 8 | stat | Z3 | 0.02/段 | 同一招式中每命中一段，后续段 +2%，至多 +16% |
| `ps_luoyingshenjianzhang_dacheng` | 落英大成 | 10 | mechanic | — | — | 神剑落英段数 +2，且每段独立 10% 施加 `bf_fengxue` 1 回合 |

#### `sk_bitaoxuangong` 碧涛玄功（7 地下 · 内功 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | **（原创扩展）**原著未载黄药师内功之名；本作取东海潮汐往复、五行流转之意拟之 |
| origin / lineage | `expanded` / 黄药师 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony`（地阶调和，自动桥接，05 §5.4）· 0/1 · 4 |
| inner | `contribution {mpMaxPct 28, hpMaxPct 14, attrs {wis 6, agi 5}, mpRegen 2.0, stats {effHit 8, resMind 7}}`（IP 74，预算 72 ±5%） |
| reqs | `attrs {wis 45, wil 40}`；`aptitude {apInner 40}`；`sect {sect_taohuadao, rank 2}`；`hard [sect]` |
| 层数要点 | 1：五行流转 ｜ 3：潮汐吐纳 ｜ 4：潮信 ｜ 5：碧涛护体 ｜ **7：绝招 潮生万里**、奇门通达 ｜ 8：以音导气 ｜ 10：碧涛大成 |
| setTags / conflicts | `set_taohuadao` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`、`qiyu q_02_qiyu_9x`（试剑亭石匣，原创扩展）`maxLayer 7`；神雕 `master npc_huangrong` / `npc_chengying` `maxLayer 8` |
| 图鉴文本 | （原创扩展）桃花岛内功心法，取东海潮汐往复之理，五行流转、阴阳相济，为碧海潮生曲与玉箫剑法的根基。原著未载黄药师内功之名，本作拟之。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 潮汐吐纳 `mv_bitaoxuangong_chaoxi` | 3 | 自身 | 0 | 6%/3/900 | 自身 `bf_huinei` 3、`bf_dingxin` 2 | — | 支援 |
| 碧涛护体 `mv_bitaoxuangong_huti` | 5 | 自身 | 0 | 9%/3/900 | 自身 `bf_hutizhenqi {shieldPctHpMax: 0.12}` 3 | — | 护盾 12%（< 标准 21.6%） |
| **潮生万里** `mv_bitaoxuangong_wanli`（绝招） | 7 | `aoe_allies r2` | 0 | 9%/—/1200 | 友方 `bf_dingxin` 2、`bf_huinei` 3；自身 `bf_hutizhenqi {shieldPctHpMax: 0.15}` 3 | — | 支援绝招 |
| 以音导气 `mv_bitaoxuangong_daoqi` | 8 | 自身 | 0 | 6%/3/900 | 驱散自身 `mind` 2 个（≤ 品阶）；下一次音律招式耗内 −50% | — | 支援 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_bitaoxuangong_wuxing` | 五行流转 | 1 | stat | Z0 | [0.03, 0.08] | 效果命中 +{v}（`auxMode scaled`） |
| `ps_bitaoxuangong_chaoxin` | 潮信 | 4 | effect | — | [0.03, 0.06] | 每第 3 次行动开始回复 {v} `mpMax`（`auxMode scaled`） |
| `ps_bitaoxuangong_qimen` | 奇门通达 | 7 | mechanic | cost | −15% | 桃花岛杂学（碧海潮生曲、桃花阵、桃花药理）耗内 −15%（`auxMode full`） |
| `ps_bitaoxuangong_dacheng` | 碧涛大成 | 10 | mechanic | — | −1 | 作主运时，自身所受 `mind` 标签减益持续 −1（最低 1） |

#### `sk_taohuazhen` 桃花阵（7 地下 · 杂学/阵法 · 桃花岛）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：桃花岛桃林依奇门五行布置，外人入岛即迷失（原著）；神雕黄蓉以乱石布阵阻敌、黄药师于襄阳布"二十八宿大阵"（**待考**）。"桃花阵"为本作统称 |
| origin / lineage | `canonExpanded` / 黄药师 → 黄蓉 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0.50/0.50 · 4 |
| reqs | `attrs {wis 50}`；`sect {sect_taohuadao, rank 2}`；`hard [sect]`；强度技艺 `formation`（软门槛建议 ≥ 40，W-03） |
| layerStats | `effHit [3, 9]`、`eva [1, 6]`（合计 15） |
| 层数要点 | 1：布桃林阵、奇门遁形、迷林 ｜ 4：五行生克 ｜ 5：移步换景、识阵 ｜ **7：绝招 二十八宿** ｜ 8：困龙 ｜ 10：奇门大成 |
| setTags / conflicts | `set_huangrong_nvzhuge` / 无 |
| special / observable | `{fusible: false}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_huangrong` `maxLayer 8`、`puzzle`（破解桃花岛桃林阵，design/11）`maxLayer 5`；神雕 `master npc_huangrong` `maxLayer 10` |
| 图鉴文本 | 桃花岛依奇门五行布置桃林，外人入岛即迷失路径（原著）；本作将其化为战场阵法：布阵、遁形、移步换景，困敌于五行生克之中。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 布桃林阵 `mv_taohuazhen_taolin` | 1 | `aoe_zone sq3, t 3` · 1–3 | 0.20/跳 | 8%/2/1000 | 区内敌 `bf_muxuan` 100%（每跳刷新） | 可 | 0.25×(1+0.24+0.05)−0.10 |
| 奇门遁形 `mv_taohuazhen_dunxing` | 1 | 自身 | 0 | 7%/4/900 | 自身 `bf_yinshen` 1 | — | 支援 |
| 五行生克 `mv_taohuazhen_shengke` | 4 | `aoe_allies r2` | 0 | 6%/3/900 | 友方 `bf_piaohu` 2 | — | 支援 |
| 移步换景 `mv_taohuazhen_huanjing` | 5 | `aoe_swap` · 1–4 | 0 | 7%/3/1000 | 与目标换位（须过效果命中） | — | 功能招式 |
| **二十八宿** `mv_taohuazhen_ershibaxiu`（绝招，名取神雕大阵，待考） | 7 | `aoe_zone diamond2, t 3` · 1–4 | 0.60/跳 | 9%/—/1200 | 区内每跳 `bf_luanxin` 50%、`bf_panshan` 100% | 可 | 3.00×0.25−0.05−0.10 |
| 困龙 `mv_taohuazhen_kunlong` | 8 | 单体 · 1–4 | 0 | 8%/4/1000 | `bf_dingshen` 60% 2；`bf_fengqinggong` 60% 2 | — | 纯控制 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_taohuazhen_milin` | 迷林 | 1 | mechanic | — | +1 | 敌方在自身布下的阵区内每移动 1 格多耗 1 点移动力；其技艺 `formation` ≥ 自身时无效 |
| `ps_taohuazhen_shizhen` | 识阵 | 5 | mechanic | — | 50% | 敌方阵法类区域（`aoe_zone` 且带 `formation` 标签）对自身的效果减半（品阶 ≤ 自身） |
| `ps_taohuazhen_dacheng` | 奇门大成 | 10 | mechanic | — | +1 | 可同时存在的自布阵区 +1；阵区持续 +1 跳 |

### 3.5 玄/黄阶紧凑卡

**`sk_xuanfengsaoyetui` 旋风扫叶腿**（6 玄上 · 拳脚/腿法 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {agi 30, str 25}`、`aptitude {apLeg 30}`｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_luchengfeng`（归云庄）`maxLayer 8`、`master npc_luguanying` `maxLayer 6`、`manual it_miji_xuanfengsaoyetui`（黄药师所赠谱，归云庄事件后）`maxLayer 10`；神雕 `master npc_huangrong`；`observe` 6｜出处：射雕·黄药师以此腿法及其内功口诀赠陆乘风（原著，细节待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 秋风扫叶 `mv_xuanfengsaoyetui_saoye` | 1 | `aoe_sweep` | 0.80 | 6%/1/1000 | `bf_panshan` 30% | 可 | 0.75×1.12−0.03 |
| 旋风连踢 `mv_xuanfengsaoyetui_lianti` | 3 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 回旋扫腿 `mv_xuanfengsaoyetui_huixuan` | 5 | `aoe_around` | 0.85 | 7%/2/1000 | — | 可 | 0.65×1.29 |
| 风卷残叶 `mv_xuanfengsaoyetui_canye` | 7 | `aoe_knock n2`·1 | 1.15 | 7%/2/1000 | 击退 2 | 可 | 0.95×1.29−0.10 |

被动：`ps_xuanfengsaoyetui_xuanfeng` 旋风（1，effect：本武学招式命中后，自身本回合剩余移动力 +1）；`ps_xuanfengsaoyetui_xujin` 腿中蓄劲（5，stat Z3：对带 `cc` 标签效果的目标 +8%）；`ps_xuanfengsaoyetui_huangu` 活骨（10，mechanic：装配时免疫品阶 ≤ 自身的 `bf_gushang`——致敬黄药师以腿法内功助陆乘风复原，原创扩展）。

**`sk_pikongzhang` 劈空掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.50/0.50 · 栏 3）｜reqs：`attrs {str 25, wis 25}`、`aptitude {apFist 25}`、`prereq [{sk_bibozhang, 4}]`（硬）｜layerStats：`hit [1,5]`、`pierce [1,5]`｜setTags：—｜获取：射雕 `master npc_luchengfeng` `maxLayer 10`（`reqsOverride {prereq: []}`）；神雕 `master npc_fengmofeng`（冯默风）`maxLayer 8`；`observe` 6｜出处：桃花岛弟子所习掌力（射雕，待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 劈空 `mv_pikongzhang_pikong` | 1 | 单体·1–3·远程 | 0.85 | 6%/0/1000 | — | 可 | 1×0.85 |
| 隔山 `mv_pikongzhang_geshan` | 3 | `aoe_pierce`·1–3·远程 | 0.90 | 7%/1/1000 | — | 可 | 0.90×1.17×0.85 |
| 掌风扫烛 `mv_pikongzhang_saozhu` | 5 | `aoe_wave d1, w3`·远程 | 0.75 | 7%/2/1000 | — | 可 | 0.70×1.29×0.85 |
| 裂空 `mv_pikongzhang_liekong` | 7 | 单体·1–3·远程 | 1.10 | 8%/2/1000 | `bf_neishang` 50% | 可 | 1.34×0.85−0.05 |

被动：`ps_pikongzhang_zhangfeng` 掌风（1，stat Z2：本武学无视内劲防御 [2%, 6%]）；`ps_pikongzhang_yuanjin` 远劲（5，effect：本武学远程招式射程 +1）；`ps_pikongzhang_dacheng` 裂空圆熟（10，stat Z3：对 3 格外目标 +8%）。

**`sk_taohuayingluo` 桃花影落**（5 玄中 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**名取岛上对联｜reqs：`attrs {agi 30}`、`aptitude {apLight 25}`、`sect {sect_taohuadao, rank 1}`（硬）｜轻功值 `QS(5) = 65`（03 §4.5）｜layerStats：`eva [1,5]`、`tough [1,5]`｜获取：射雕/神雕 `master`（桃花岛弟子、黄蓉）；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 落英随风 `mv_taohuayingluo_suifeng` | 1 | 自身 | 0 | 4%/2/800 | 自身 `bf_piaohu` 2 | — | 支援 |
| 影落无踪 `mv_taohuayingluo_wuzong` | 5 | 自身 | 0 | 6%/4/900 | 自身 `bf_yinshen` 1 | — | 支援 |
| 飞花渡水 `mv_taohuayingluo_dushui` | 7 | 自身 | 0 | 5%/3/900 | 自身 `bf_shenqing` 1 | — | 支援 |

被动：`ps_taohuayingluo_wuxingbu` 五行步（1，stat：`eva` +[2%, 6%]）；`ps_taohuayingluo_taolin` 桃林熟径（5，mechanic：在阵法区域内移动不受该区域减益影响）；`ps_taohuayingluo_yuanman` 圆满（10，stat：`jump` +1）。

**`sk_taohuayaoli` 桃花药理**（4 玄下 · 杂学/医 · 中性 · 栏 3）｜**（原创扩展）**黄药师医卜之学的入门；九花玉露丸（`it_jiuhuayulu`）为原著｜reqs：`attrs {wis 35}`｜强度技艺 `med`｜layerStats：`healPower [2,6]`、`effRes [1,4]`｜获取：射雕 `master npc_huangrong` `maxLayer 8`（羁绊 ≥ 2）；神雕 `master npc_chengying` `maxLayer 10`；桃花岛药圃 `manual it_miji_taohuayaoli`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 金针渡穴 `mv_taohuayaoli_jinzhen` | 1 | 单体友方·0–1 | 0 | 6%/2/1000 | 回复 15% `hpMax`；驱散 `seal` 1 个 | — | 治疗 15%（< 标准 18%，含驱散） |
| 九花玉露 `mv_taohuayaoli_yulu` | 4 | 单体友方·0–1 | 0 | 7%/3/1000 | 目标 `bf_xuming` 3 | — | 支援 |
| 解毒 `mv_taohuayaoli_jiedu` | 7 | 单体友方·0–1 | 0 | 6%/3/1000 | 驱散 `poison` 2 个（≤ 品阶） | — | 支援 |

被动：`ps_taohuayaoli_yaopu` 药圃（1，mechanic：解锁九花玉露丸炼制配方，配方品阶 ≤ 本武学有效品阶，design/10 接口）；`ps_taohuayaoli_miaoshou` 妙手（6，stat：`healPower` +[5, 10] pp）。

**`sk_feishishou` 飞石手**（3 黄上 · 暗器 · 中性 · 0.80/0.20 · 栏 3）｜**（原创扩展）**桃花岛弟子以石子为暗器，弹指神通之基｜reqs：`attrs {agi 20}`｜弹药：石子（可就地拾取，design/10）｜layerStats：`hit [1,4]`、`crit [1,2]`｜获取：桃花岛入门；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 飞石 `mv_feishishou_feishi` | 1 | `aoe_bolt`·1–5·投射 | 0.90 | 5%/0/1000 | — | 可 | 1×0.92 |
| 连环飞石 `mv_feishishou_lianhuan` | 4 | `aoe_bolt`·1–5（2 段） | 1.05 | 5%/1/1000 | — | 可 | 1.12×0.92 |
| 石打穴道 `mv_feishishou_daxue` | 7 | `aoe_bolt`·1–5 | 1.15 | 6%/2/1000 | `bf_fengxue` 20% 1 | 可 | 1.29×0.92−0.04 |

被动：`ps_feishishou_zhunxing` 准星（1，stat：本武学命中 +[2%, 5%]）；`ps_feishishou_yuanman` 圆满（10，mechanic：学习弹指神通时指法资质软门槛 −10，弹指神通 1–3 重修炼 +20%）。

**`sk_bibozhang` 碧波掌**（2 黄中 · 拳脚/拳掌 · 调和 · 0.70/0.30 · 栏 3）｜**（原创扩展）**桃花岛入门掌法｜reqs：无｜layerStats：`parry [1,3]`、`eva [1,3]`｜获取：桃花岛入门；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 碧波荡漾 `mv_bibozhang_dangyang` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 层波叠浪 `mv_bibozhang_dielang` | 4 | 单体·1（2 段） | 1.10 | 5%/1/1000 | — | 可 | 1.12 |
| 回潮 `mv_bibozhang_huichao` | 7 | 单体·1 | 1.05 | 5%/1/1000 | 击退 1 | 可 | 1.12−0.05 |

被动：`ps_bibozhang_rourun` 柔润（5，stat：`parry` +[2%, 4%]）；`ps_bibozhang_yuanman` 圆满（10，mechanic：首次练满 `apFist` +1；桃花岛拳掌软门槛 −10）。

---

## 4. 白驼山 `sect_baituoshan`

### 4.1 门派简介

- **时代**：射雕时"西毒"欧阳锋为五绝之一，侄（实为其子，原著）欧阳克为少主，率姬妾弟子与蛇奴行走中原；欧阳克死于杨康之手，欧阳锋因篡改的《九阴真经》逆练而神智错乱（射雕末）。神雕时欧阳锋疯癫，收杨过为义子，传蛤蟆功与逆转经脉，终与洪七公在华山绝顶相拥而逝（原著）。其后白驼山一脉在原著中断绝。
- **强弱**：射雕 极强（欧阳锋）／神雕 仅欧阳锋一人（传杨过）。不在中武/低武书界出现。
- **风格**：蛇毒与蓄劲；以静制动的内功（蛤蟆功，阳）与逆行经脉（逆转经脉，阴）两种截然相反的路子并存。
- **加入**：射雕"邪派路线"（投效欧阳克/欧阳锋，`morality ≤ −20` 软门槛）；神雕以欧阳锋"义子/义女"羁绊线传蛤蟆功与逆转经脉（致敬杨过，原创扩展的玩家路线）。
- **进阶链**：踏沙行（黄中，轻功）／蛇形刁手（黄上）→ 神驼雪山掌（玄上）→ 灵蛇拳（地中，前置蛇形刁手）；白驼毒经（玄中）→ 灵蛇杖法（地上，毒效相生）。

### 4.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_hama` | 蛤蟆功 | 内功 | 10 天下 | 阳 | 0/1（发劲招 0.20/0.80） | 射雕、神雕 | 欧阳锋亲传；神雕义父羁绊 | 原著 |
| `sk_lingshezhangfa` | 灵蛇杖法 | 兵器/棍杖 | 9 地上 | 阳 | 0.65/0.35 | 射雕、神雕 | 欧阳锋亲传（四级） | 原著（蛇杖）；杖法名待考 |
| `sk_lingshequan` | 灵蛇拳 | 拳脚/拳掌 | 8 地中 | 调和 | 0.55/0.45 | 射雕、神雕 | 欧阳锋亲传（三级） | 原著 |
| `sk_nizhuanjingmai` | 逆转经脉 | 内功 | 7 地下 | 阴 | 0/1 | 射雕、神雕 | 神雕义父羁绊；射雕观欧阳锋倒立行功 | 原著（射雕末逆练；神雕传杨过，细节待考）；数值原创扩展 |
| `sk_shentuoxueshanzhang` | 神驼雪山掌 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.60/0.40 | 射雕、神雕 | 欧阳克；白驼山庄遗谱 | 原著（欧阳克，细节待考） |
| `sk_yushe` | 驭蛇术 | 杂学/驭兽 | 6 玄上 | 中性 | 0.40/0.60 | 射雕 | 白驼山蛇奴头目 | 原著（蛇奴驱蛇、蛇阵） |
| `sk_baituodujing` | 白驼毒经 | 杂学/毒 | 5 玄中 | 中性 | 0.30/0.70 | 射雕、神雕 | 白驼山二级；神雕遗谱 | 原创扩展（"西毒"之名为原著） |
| `sk_shexingdiaoshou` | 蛇形刁手 | 拳脚/擒拿 | 3 黄上 | 中性 | 0.80/0.20 | 射雕、神雕 | 入门 | 原著（欧阳克，名称待考；若无则为原创扩展命名） |
| `sk_tashaxing` | 踏沙行 | 轻功 | 2 黄中 | 中性 | — | 射雕、神雕 | 入门 | 原创扩展 |

### 4.3 天阶条目卡

#### `sk_hama` 蛤蟆功（10 天下 · 内功 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：欧阳锋蹲身如蛤蟆、口中咕咕作声，蓄劲而发，以静制动；王重阳曾以一阳指破之（原著，情节细节待考）。神雕：欧阳锋传杨过（原著） |
| origin / lineage | `canon` / 欧阳锋 → 杨过 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0/1（攻击招式覆写 0.20/0.80）· 5 |
| inner | `contribution {mpMaxPct 38, hpMaxPct 30, attrs {str 8, con 8}, mpRegen 3.6, stats {resCC 10, resPoison 10}}`（IP 118，预算 118）；`auxUsableMoves [mv_hama_xujin]` |
| reqs | `attrs {str 50, con 55}`；`aptitude {apInner 55}`；`sect {sect_baituoshan, rank 3}`；`hard [sect]`（神雕义父线 `reqsOverride {sect: null}`） |
| 层数要点 | 1：蛤蟆蓄劲、蛤蟆发劲 ｜ 2：以静制动（被动） ｜ 3：咕呼 ｜ 4：铜皮 ｜ 5：静候（架势） ｜ 6：蛤蟆跃、反劲 ｜ **7：绝招 蛤蟆功·全劲** ｜ 8：西毒之体 ｜ 10：蛤蟆大成 |
| setTags | `set_baituoshan` |
| conflicts | `{with: sk_yiyangzhi, type: counter}`：一阳指（品阶 ≥ 本武学有效品阶）命中处于 `bf_xushi` 的持有者时，驱散其蓄势并施加 `bf_fengxue` 1 回合（原著王重阳以一阳指破蛤蟆功） |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 射雕 `master npc_ouyangfeng` `maxLayer 10`；神雕 `master npc_ouyangfeng` `maxLayer 10`（义父羁绊 ≥ 3，致敬杨过，原创扩展路线） |
| 图鉴文本 | 白驼山欧阳锋的看家内功，蹲身蓄势如蛤蟆，口中咕咕作声，一发则劲力排山倒海，最擅以静制动。王重阳曾以一阳指破之（原著）。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 蛤蟆蓄劲 `mv_hama_xujin` | 1 | 自身 | 0 | 4%/2/800 | 自身 `bf_xushi`（至下一次攻击） | — | 架势招式 |
| 蛤蟆发劲 `mv_hama_fajin` | 1 | `aoe_knock n2` · 1 · 近身 | 1.05 | 8%/1/1100 | 击退 2 | 可 | 0.95×(1+0.12+0.07)−0.10 |
| 咕呼 `mv_hama_guhu` | 3 | `aoe_cone n2` · 远程 | 0.80 | 9%/2/1000 | `bf_zhenshe` 30% | 可 | 0.75×1.29×0.85−0.03 |
| 静候 `mv_hama_jinghou` | 5 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 1.2, expires: nextOwnAction}`＋击退 1 | — | 架势招式 |
| 蛤蟆跃 `mv_hama_tiaoyue` | 6 | `aoe_leap splash sq3` · 1–3 | 1.25（溅射 ×0.5） | 9%/3/1100 | 跳斩 | 可 | 0.90×(1+0.36+0.05+0.07)−0.10 |
| **蛤蟆功·全劲** `mv_hama_quanjin`（绝招，原创扩展命名） | 7 | `aoe_cone n3` | 1.80 | 10%/—/1200 | 击退 2；`bf_xuanyun` 30% 1 | 可 | 3.00×0.65−0.10−0.075 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_hama_jingzhi` | 以静制动 | 2 | stat | Z3 | [0.08, 0.16] | 本回合未移动时，本武学攻击招式伤害 +{v}（`auxMode none`） |
| `ps_hama_tongpi` | 铜皮 | 4 | stat | Z4 | [0.04, 0.10] | 受到拳脚招式伤害 −{v}（`auxMode scaled`） |
| `ps_hama_fanjin` | 反劲 | 6 | trigger | — | 0.30 | 受近战攻击后（每回合 1 次）30% 自身获得 `bf_xushi` |
| `ps_hama_xidu` | 西毒之体 | 8 | stat | — | [10, 20] pp | `resPoison` +{v}（`auxMode scaled`） |
| `ps_hama_dacheng` | 蛤蟆大成 | 10 | mechanic | Z3 | 0.60 | 蓄势上限由 45% 提至 60%（覆写 `bf_xushi` 参数）；蓄势中被硬控时 50% 不丢失蓄势 |

### 4.4 地阶条目卡

#### `sk_lingshezhangfa` 灵蛇杖法（9 地上 · 兵器/棍杖 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕：欧阳锋蛇杖，杖头盘两条毒蛇，杖中藏机括可发喂毒暗器（原著，细节待考）；"灵蛇杖法"之名与招名为本作拟定 |
| origin / lineage | `canonExpanded` / 欧阳锋 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.65/0.35 · 4 |
| weaponReq | `{category: staff, tags: [shezhang]}`（非蛇杖可用，但失去蛇毒与机括，见被动"蛇杖"；装备 `eq_baituoshezhang` 见 design/10，地上） |
| reqs | `attrs {str 50, con 45}`；`aptitude {apStaff 50}`；`morality {max: −20}`（软）；`sect {sect_baituoshan, rank 4}`；`hard [sect]` |
| layerStats | `crit [2, 8]`、`resPoison [1, 7]`（合计 15） |
| 层数要点 | 1：灵蛇出洞、杖扫千军、蛇杖 ｜ 3：双蛇噬 ｜ 4：毒上加毒 ｜ 5：杖头机括 ｜ **7：绝招 群蛇乱舞** ｜ 8：杖缠、灵蛇 ｜ 10：西毒大成 |
| setTags / conflicts | `set_baituoshan` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_ouyangfeng` `maxLayer 10`；神雕 `master npc_ouyangfeng` `maxLayer 8`（疯癫时断续传授，原创扩展）；`observe` 6 |
| 图鉴文本 | 欧阳锋的蛇杖功夫。杖头盘着两条毒蛇，杖中藏有机括可发喂毒暗器，杖法变幻如灵蛇吐信（原著）。杖法名与招名为本作拟定。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 灵蛇出洞 `mv_lingshezhangfa_chudong` | 1 | 单体 · 1–2 · 近身 | 0.95 | 7%/0/1000 | `bf_shedu` 30%（需蛇杖） | 可 | 1−0.03 |
| 杖扫千军 `mv_lingshezhangfa_saojun` | 1 | `aoe_sweep` | 0.85 | 7%/1/1000 | — | 可 | 0.75×1.12 |
| 双蛇噬 `mv_lingshezhangfa_shuangshe` | 3 | 单体 · 1–2（2 段） | 1.25 | 8%/2/1000 | `bf_shedu` 60%（需蛇杖） | 可 | 1.29−0.06 |
| 杖头机括 `mv_lingshezhangfa_jikuo` | 5 | `aoe_bolt` · 1–5 · 投射；`condition {mainHandTag: shezhang}` | 1.35 | 7%/3/1000 | `bf_zhongdu` 50% | 可 | (1+0.36+0.15)×0.92−0.05 |
| **群蛇乱舞** `mv_lingshezhangfa_qunshe`（绝招，原创扩展命名） | 7 | `aoe_around`（2 段） | 1.80 | 9%/—/1200 | `bf_shedu` 100%；`bf_mabi` 30% 1 | 可 | 3.00×0.65−0.10−0.06 |
| 杖缠 `mv_lingshezhangfa_chan` | 8 | 单体 · 1–2 · 近身 | 1.10 | 8%/3/1000 | `bf_chanrao` 60% 2 | 可 | (1+0.36+0.05)−0.30 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_lingshezhangfa_shezhang` | 蛇杖 | 1 | mechanic | — | — | 主手带 `shezhang` 标签时本武学所附 `bf_shedu` 生效、杖头机括可用；否则不附蛇毒 |
| `ps_lingshezhangfa_dushangjiadu` | 毒上加毒 | 4 | stat | Z3 | [0.06, 0.12] | 对带 `poison` 标签效果的目标，本武学伤害 +{v} |
| `ps_lingshezhangfa_lingshe` | 灵蛇 | 8 | trigger | — | 0.40 | `onParry`（每回合 1 次）：40% 以杖尾反击 ×0.6，附 `bf_shedu`（需蛇杖） |
| `ps_lingshezhangfa_dacheng` | 西毒大成 | 10 | mechanic | — | — | 本武学使目标 `bf_shedu` 达 3 层时，额外施加 `bf_mabi` 1 回合（100%） |

#### `sk_lingshequan` 灵蛇拳（8 地中 · 拳脚/拳掌 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：欧阳锋为胜洪七公而暗中苦练的拳法，出拳时手臂如灵蛇般忽然弯曲，从意想不到的方位击到（原著，交手场景待考）；招名原创扩展 |
| origin / lineage | `canon` / 欧阳锋 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| reqs | `attrs {agi 45, str 40}`；`aptitude {apFist 45}`；`prereq [{sk_shexingdiaoshou, 5}]`；`sect {sect_baituoshan, rank 3}`；`hard [sect, prereq]` |
| layerStats | `pierce [3, 10]`、`crit [1, 5]`（合计 15） |
| 层数要点 | 1：灵蛇吐信、曲臂回击、臂曲如蛇 ｜ 3：蛇缠臂 ｜ 5：蛇行绕击、出奇 ｜ **7：绝招 灵蛇千变** ｜ 8：反手蛇击（触发） ｜ 10：灵蛇大成 |
| setTags / conflicts | `set_baituoshan` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_ouyangfeng` `maxLayer 10`；神雕 `master npc_ouyangfeng` `maxLayer 8`；`observe` 6 |
| 图鉴文本 | 欧阳锋为胜洪七公而暗中苦练的拳法，出拳时手臂如灵蛇般忽然弯曲，从意想不到的方位击到（原著）。招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 灵蛇吐信 `mv_lingshequan_tuxin` | 1 | 单体 · 1 · 近身 | 0.95 | 7%/0/900 | — | 可 | 1−0.07 |
| 曲臂回击 `mv_lingshequan_qubi` | 1 | 单体 · 1 · 近身 | 1.00 | 8%/1/1000 | — | 不可 | (1+0.12+0.05)×0.85 |
| 蛇缠臂 `mv_lingshequan_chanbi` | 3 | 单体 · 1 · 近身 | 1.15 | 7%/2/1000 | `bf_chanrao` 40% 1 | 可 | 1.24−0.10 |
| 蛇行绕击 `mv_lingshequan_raoji` | 5 | `aoe_behind` · 1–2 | 0.95 | 7%/2/1000 | 绕背 | 可 | 0.90×1.24−0.15 |
| **灵蛇千变** `mv_lingshequan_qianbian`（绝招，原创扩展命名） | 7 | 单体 · 1（4 段） | 2.45 | 9%/—/1200 | `bf_polu` 100% 2 | 不可 | 3.00×0.85−0.10 |
| 反手蛇击 `mv_lingshequan_fanshou`（触发） | 8 | 自身 | 0 | 5%/—/— | `trigger {on: backAttacked, chance 0.5, perRound 1, counterPower 1.0}` | — | 触发招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_lingshequan_quzhe` | 臂曲如蛇 | 1 | stat | Z0 | ×[0.85, 0.70] | 目标招架本武学招式的概率乘以 {v} |
| `ps_lingshequan_chuqi` | 出奇 | 5 | stat | Z0 | +15 | 对本场尚未被本武学攻击过的目标，本招暴击 +15（条件 `firstHitOnTarget`，待决 W-02） |
| `ps_lingshequan_dacheng` | 灵蛇大成 | 10 | mechanic | Z7 | +10% | 本武学招式一律按侧击结算方位（Z7）；背击时另 +10% |

#### `sk_nizhuanjingmai` 逆转经脉（7 地下 · 内功 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕末：欧阳锋逆练被篡改的《九阴真经》，经脉倒转，点穴竟不能制（原著，细节待考）；神雕：欧阳锋以逆转经脉之法传杨过，使其能自解穴道（原著，细节待考）。内功数值为原创扩展 |
| origin / lineage | `canonExpanded` / 欧阳锋 → 杨过 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0/1（攻击招式覆写 0.20/0.80）· 4 |
| inner | `contribution {mpMaxPct 26, hpMaxPct 18, attrs {con 6, wil 4}, mpRegen 1.8, stats {resSeal 15}}`（IP 73，预算 72 ±5%） |
| reqs | `attrs {con 45, wil 40}`；`aptitude {apInner 40}`；`hard []` |
| 层数要点 | 1：逆冲穴道、逆冲 ｜ 3：倒立行功 ｜ 4：乱脉 ｜ 5：逆脉反冲 ｜ **7：绝招 经脉倒转** ｜ 8：闭穴 ｜ 10：倒行逆施 |
| setTags / conflicts | `set_baituoshan` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 神雕 `master npc_ouyangfeng` `maxLayer 10`（义父羁绊 ≥ 2）；射雕 `qiyu q_02_qiyu_9x`（华山二次论剑后观欧阳锋倒立行功，原创扩展）`maxLayer 6` |
| 图鉴文本 | 欧阳锋逆练九阴，全身经脉倒转，点穴竟不能制（射雕）；神雕中以此法传杨过，使其能自解穴道（原著）。内功数值为原创扩展。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 逆冲穴道 `mv_nizhuanjingmai_chongxue` | 1 | 自身 | 0 | 6%/2/800 | 驱散自身全部 `seal`（≤ 品阶） | — | 支援 |
| 倒立行功 `mv_nizhuanjingmai_daoli` | 3 | 自身 | 0 | 7%/3/900 | 自身 `bf_mian_xue` 2、`bf_jiangu` 2 | — | 支援 |
| 逆脉反冲 `mv_nizhuanjingmai_fanchong` | 5 | 单体 · 1 · 近身 | 1.25 | 8%/2/1000 | `bf_neishang` 50% | 可 | 1.29−0.05 |
| **经脉倒转** `mv_nizhuanjingmai_daozhuan`（绝招，原创扩展命名） | 7 | 自身 | 0 | 9%/—/1200 | 驱散自身全部 `seal`、`cc`（≤ 品阶）；回复 20% `hpMax`；自身 `bf_mian_xue` 3、`bf_mian_kong` 1 | — | 支援绝招 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_nizhuanjingmai_nichong` | 逆冲 | 1 | mechanic | — | [+20%, +40%] | 被 `seal` 所制时 S5 冲穴判定成功率 +{v}（`auxMode full`） |
| `ps_nizhuanjingmai_luanmai` | 乱脉 | 4 | stat | — | ×0.7 | 敌方对自身施加 `seal` 类效果的施加率 ×0.7（`auxMode scaled`） |
| `ps_nizhuanjingmai_bixue` | 闭穴 | 8 | trigger | — | — | `battleStart`：自身获得 `bf_mian_xue`（`dur 99`，品阶 inherit；仅主运） |
| `ps_nizhuanjingmai_dacheng` | 倒行逆施 | 10 | mechanic | — | — | 作辅运时视为桥接内功（`inner.bridge`，消除阴阳相冲，05 §5.4）；`bf_jingmainixing` 的"内功有效层数 −2"对自身改为 −1 |

### 4.5 玄/黄阶紧凑卡

**`sk_shentuoxueshanzhang` 神驼雪山掌**（6 玄上 · 拳脚/拳掌 · 阳 · 0.60/0.40 · 栏 3）｜reqs：`attrs {str 30, agi 30}`、`aptitude {apFist 30}`、`sect {sect_baituoshan, rank 2}`（硬）｜layerStats：`parry [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_ouyangke` `maxLayer 10`；神雕 `manual it_miji_shentuoxueshanzhang`（白驼山庄遗谱，原创扩展）`maxLayer 8`；`observe` 6｜出处：射雕·欧阳克所使掌法（原著，名称与细节待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 驼峰叠掌 `mv_shentuoxueshanzhang_tuofeng` | 1 | 单体·1（2 段） | 1.10 | 6%/1/1000 | — | 可 | 1.12 |
| 雪崩式 `mv_shentuoxueshanzhang_xuebeng` | 3 | `aoe_cone n2` | 0.95 | 7%/2/1000 | `bf_hanqi` 30% | 可 | 0.75×1.29−0.03 |
| 大漠孤烟 `mv_shentuoxueshanzhang_guyan` | 5 | 单体·1–3·远程 | 1.00 | 7%/1/1000 | — | 可 | 1.17×0.85 |
| 神驼负重 `mv_shentuoxueshanzhang_fuzhong` | 7 | 单体·1 | 1.25 | 8%/2/1000 | 击退 1；`bf_xuanyun` 20% 1 | 可 | 1.34−0.05−0.05 |

被动：`ps_shentuoxueshanzhang_naihan` 耐寒（1，stat：`resCold` +[4, 10] pp）；`ps_shentuoxueshanzhang_tuobu` 驼步（5，stat：`tough` +[2%, 5%]）；`ps_shentuoxueshanzhang_dacheng` 雪山（10，stat Z3：对带 `cold` 标签效果的目标 +8%）。

**`sk_yushe` 驭蛇术**（6 玄上 · 杂学/驭兽 · 中性 · 0.40/0.60 · 栏 3）｜reqs：`attrs {cha 30}`、`sect {sect_baituoshan, rank 1}`（硬）｜强度属性 `cha`（05 §2.3）｜layerStats：`effHit [2,6]`、`resPoison [1,4]`｜获取：射雕 `master npc_baituo_shenutou`（蛇奴头目）`maxLayer 10`｜出处：射雕·白驼山蛇奴以木哨驱赶蛇群，欧阳锋曾驱蛇阵上桃花岛（原著，细节待考）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 召蛇 `mv_yushe_zhaoshe` | 1 | `aoe_zone sq3, t 3`·1–3 | 0.30/跳 | 8%/2/1000 | 区内每跳 `bf_shedu` 50% | 可 | 0.25×(1+0.24+0.10)−0.05 |
| 蛇阵 `mv_yushe_shezhen` | 4 | `aoe_zone line, t 2`·1–3 | 0.20/跳 | 6%/3/1000 | 入区敌 `bf_panshan` 100%、`bf_shedu` 30% | 可 | 0.25×1.36−0.10−0.03 |
| 驱蛇噬敌 `mv_yushe_shidi` | 7 | `aoe_bolt`·1–4·投射 | 1.10 | 7%/2/1000 | `bf_shedu` 80% | 可 | (1+0.24+0.05)×0.92−0.08 |

被动：`ps_yushe_shexiao` 蛇哨（1，mechanic：野外遭遇蛇类敌人时可"驱散"免战或"收服"为战斗召唤，design/11 驭兽接口）；`ps_yushe_bishe` 避蛇（5，stat：`resPoison` +[5, 10] pp）；`ps_yushe_dacheng` 万蛇（10，mechanic：召蛇区域持续 +1 跳）。

**`sk_baituodujing` 白驼毒经**（5 玄中 · 杂学/毒 · 中性 · 0.30/0.70 · 栏 3）｜**（原创扩展）**"西毒"欧阳锋与白驼山以蛇毒闻名为原著｜reqs：`attrs {wis 30}`、`morality {max: 0}`（软）、`sect {sect_baituoshan, rank 2}`（硬）｜强度技艺 `poi`｜layerStats：`effHit [2,6]`、`resPoison [1,4]`｜获取：射雕 `master npc_ouyangke` `maxLayer 10`；神雕 `manual it_miji_baituodujing` `maxLayer 8`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 淬毒 `mv_baituodujing_cuidu` | 1 | 自身 | 0 | 5%/3/900 | 本武学外的下 3 次命中附 `bf_zhongdu` 30%（新钩子 `weaponCoat`，待决 W-05） | — | 支援 |
| 毒雾 `mv_baituodujing_duwu` | 4 | `aoe_zone sq3, t 2`·1–3·友伤 `all` | 0.30/跳 | 8%/2/1000 | 区内每跳 `bf_zhongdu` 60% | — | 0.25×1.34−0.06（友伤补偿按 §3.3 注） |
| 以毒攻毒 `mv_baituodujing_gongdu` | 7 | 单体友方·0–1 | 0 | 6%/3/1000 | 驱散 `poison` 2 个（≤ 品阶）；回复 8% `hpMax` | — | 支援 |

被动：`ps_baituodujing_baidu` 百毒（1，stat：`resPoison` +[5, 12] pp）；`ps_baituodujing_duyin` 毒引（5，stat：对带 `poison` 标签效果的目标，自身效果命中 +5%）；`ps_baituodujing_dacheng` 毒经大成（10，mechanic：解锁白驼山毒药配方，design/10 接口）。

**`sk_shexingdiaoshou` 蛇形刁手**（3 黄上 · 拳脚/擒拿 · 中性 · 0.80/0.20 · 栏 3）｜reqs：无｜layerStats：`seal [1,3]`、`hit [1,3]`｜获取：白驼山入门；`observe` 6｜出处：射雕·欧阳克擒拿手法（名称待考；修订版无此名则视为原创扩展命名）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 蛇形刁腕 `mv_shexingdiaoshou_diaowan` | 1 | 单体·1 | 0.95 | 5%/0/950 | — | 可 | 1−0.035 |
| 蛇缠 `mv_shexingdiaoshou_shechan` | 4 | 单体·1 | 1.05 | 5%/1/1000 | `bf_chizhi` 50% | 可 | 1.12−0.05 |
| 蛇口夺兵 `mv_shexingdiaoshou_duobing` | 7 | 单体·1 | 1.25 | 6%/2/1000 | `bf_jiaoxie` 30%（targetArmed） | 可 | 1.29−0.06 |

被动：`ps_shexingdiaoshou_ruanjin` 软筋（5，stat：`seal` +[2, 4]）；`ps_shexingdiaoshou_yuanman` 圆满（10，mechanic：首次练满 `apGrapple` +1；灵蛇拳资质软门槛 −10）。

**`sk_tashaxing` 踏沙行**（2 黄中 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**西域沙碛中行走的步法｜reqs：无｜轻功值 `QS(2) = 38`｜layerStats：`eva [1,3]`、`tough [1,3]`｜获取：白驼山入门；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 驼铃步 `mv_tashaxing_tuoling` | 1 | 自身 | 0 | 3%/2/800 | 自身 `bf_jixing` 2 | — | 支援 |
| 流沙无痕 `mv_tashaxing_wuhen` | 5 | 自身 | 0 | 4%/3/900 | 自身 `bf_shenqing` 1 | — | 支援 |

被动：`ps_tashaxing_shadi` 沙地（1，mechanic：在沙地/戈壁地形移动不减速，地形 ID 由 design/08 定）；`ps_tashaxing_yuanman` 圆满（10，stat：`staRegen` +2）。

---

## 5. 大理段氏 `sect_dali` 与天龙寺 `sect_tianlongsi`

### 5.1 门派简介

- **时代**：天龙时大理保定帝段正明、镇南王段正淳当国，段氏武学以一阳指为本；天龙寺为段氏皇族出家之所，枯荣大师与本因、本观、本相、本参诸僧及出家后的保定帝（法名本尘）守护六脉神剑谱；段誉以北冥内力学成六脉，初时时灵时不灵；"延庆太子"段延庆身残，以钢杖施段家武学（原著）。射雕/神雕时南帝段智兴出家为一灯大师，门下渔樵耕读四弟子（点苍渔隐、樵子、农夫、书生朱子柳；农夫即神雕中的武三通，待考），一灯以一阳指为黄蓉疗伤而大耗功力，王重阳曾以先天功交换一阳指（原著）。倚天时朱武连环庄的朱长龄、武烈为朱子柳、武三通之后（原著），其一阳指家学已残（待考）；元代大理总管段氏为史实，本作据此设段氏余脉（原创扩展）。
- **强弱**：天龙 强（段氏皇族＋天龙寺）／射雕 强（一灯一脉）／神雕 中（一灯、武三通、朱子柳）／倚天 弱（原创扩展余脉，仅地下及以下）。
- **风格**：指力点穴、剑气，书法入武；一阳一脉为阳（`lg_yiyang` 同源组：一阳指、六脉神剑、先天功，02 §5.4），天龙寺禅功调和。
- **加入**：天龙：镇南王府护卫/客卿（`rank` 1–3），立大功后经保定帝特许学一阳指（原著称段家武功不传外人，本作以"特许"处理，原创扩展）；天龙寺"护法居士"（`rank` 3）。射雕/神雕：过渔樵耕读四关、入一灯门下（原著四关情节）。
- **进阶链**：天南心法（黄上）→ 五罗轻烟掌（玄中）→ 一阳指（天中）；春秋笔法（黄上）→ 一阳书指（地中）；天南心法（黄上）→ 段家剑法（地下；5 重起可以杖代剑，致敬段延庆）；镇南棍法（黄中）为王府护卫入门兵器。

### 5.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_liumai` | 六脉神剑 | 拳脚/指法 | 12 天上 | 调和 | 0.15/0.85 | 天龙 | 天龙寺观谱（奇遇）；天龙寺诸僧；段誉羁绊 | 原著 |
| `sk_yiyangzhi` | 一阳指 | 拳脚/指法 | 11 天中 | 阳 | 0.30/0.70 | 天龙、射雕、神雕 | 段氏特许；天龙寺护法；一灯；武三通 | 原著 |
| `sk_kurongchangong` | 枯荣禅功 | 内功 | 9 地上 | 调和 | 0/1 | 天龙 | 天龙寺护法；枯荣大师 | 原著（天龙寺枯荣大师） |
| `sk_yiyangshuzhi` | 一阳书指 | 兵器/奇门（笔） | 8 地中 | 阳 | 0.35/0.65 | 神雕、倚天 | 朱子柳；倚天朱武连环庄（残） | 原著（神雕·朱子柳）；倚天传承原创扩展 |
| `sk_duanjiajianfa` | 段家剑法 | 兵器/剑 | 7 地下 | 阳 | 0.60/0.40 | 天龙、射雕、神雕、倚天 | 段氏特许；渔樵耕读；倚天段氏余脉 | 原著（天龙·段氏）；射雕后延续为原创扩展 |
| `sk_wuluoqingyanzhang` | 五罗轻烟掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.60/0.40 | 天龙 | 段正淳 | 原著（天龙·段正淳，细节待考） |
| `sk_cangshanfeidu` | 苍山飞渡 | 轻功 | 4 玄下 | 中性 | — | 天龙、射雕、神雕、倚天 | 巴天石；大理护卫 | 原创扩展（巴天石善轻功为原著） |
| `sk_tiannanxinfa` | 天南心法 | 内功 | 3 黄上 | 阳 | 0/1 | 天龙、射雕、神雕、倚天 | 王府护卫入门 | 原创扩展 |
| `sk_chunqiubifa` | 春秋笔法 | 兵器/奇门（笔） | 3 黄上 | 阳 | 0.60/0.40 | 天龙、射雕、神雕 | 朱丹臣（天龙）；朱子柳（射雕/神雕） | 原创扩展命名（朱丹臣使判官笔，待考） |
| `sk_kaishanfufa` | 开山斧法 | 兵器/奇门（斧） | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕 | 古笃诚（天龙）；樵子（射雕） | 原创扩展命名（古笃诚板斧、樵子之斧，待考） |
| `sk_zhennangunfa` | 镇南棍法 | 兵器/棍杖 | 2 黄中 | 阳 | 0.85/0.15 | 天龙、射雕、神雕、倚天 | 傅思归（天龙）；王府护卫 | 原创扩展命名（傅思归使铜棍，待考） |

> 天龙寺（`sect_tianlongsi`）只有六脉神剑、枯荣禅功两门本寺武学；入门与中坚武学借用大理段氏（护法居士同时计为镇南王府客卿）。

### 5.3 天阶条目卡

#### `sk_liumai` 六脉神剑（12 天上 · 拳脚/指法 · 天龙寺）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：以一阳指内力化为剑气，自少商、商阳、中冲、关冲、少冲、少泽六脉射出；天龙寺御鸠摩智、段誉少室山败慕容复；段誉初学时时灵时不灵（原著）。六剑剑意据原著描写（少商雄劲、商阳灵巧、中冲大开大阖、关冲拙滞古朴、少冲轻灵、少泽忽来忽去，**逐字待考**） |
| origin / lineage | `canon` / 大理段氏 · 天龙寺（枯荣、本因、本观、本相、本参、本尘）→ 段誉 |
| sourceChapters | `ch01_tianlong` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.15/0.85 · 5 |
| reqs | `attrs {wis 60, con 55}`；`aptitude {apFinger 60}`；`prereq [{sk_yiyangzhi, 5}]`；`hard [prereq]`；`special.altPrereq [{sk_beiming, 5}]`（北冥内力可代替一阳指根基——段誉路线，新字段见待决 W-06） |
| layerStats | `hit [3, 10]`、`pierce [3, 10]`（合计 20） |
| 层数要点 | 1：少商剑、商阳剑、剑气、时灵时不灵 ｜ 2：中冲剑 ｜ 3：关冲剑、无形 ｜ 4：少冲剑 ｜ 5：少泽剑、剑随心转 ｜ **7：绝招 六脉齐发** ｜ 9：剑气纵横 ｜ 10：六脉大成 |
| setTags / conflicts | `set_dali_yiyang` / 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 天龙 `qiyu q_01_qiyu_9x`（天龙寺牟尼堂观剑谱，须天龙寺护法 `rank 3` 且一阳指 ≥ 5，原著剑谱后遭焚毁，时点待考）`maxLayer 10`；`master` 天龙寺诸僧之一 `maxLayer 6`（该僧所精之脉为"本脉"，本脉招式 +10%，原创扩展）；`master npc_duanyu` `maxLayer 8`（羁绊 ≥ 4；段誉教法随性，1–6 重"时灵时不灵"概率 ×1.5，原创扩展） |
| 图鉴文本 | 大理段氏最高武学，藏于天龙寺。以深厚内力自六指六脉激发剑气，无形有质，远胜利剑。段誉初学时时灵时不灵（原著）。招式效果为本作原创设计。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 少商剑 `mv_liumai_shaoshang`（拇指·雄劲） | 1 | 单体 · 1–5 · 远程 | 1.15 | 10%/2/1100 | 击退 1 | 可 | (1+0.24+0.10+0.07)×0.85−0.05 |
| 商阳剑 `mv_liumai_shangyang`（食指·灵巧） | 1 | 单体 · 1–5 · 远程 | 0.70 | 7%/0/850 | — | 可 | (1−0.05−0.105)×0.85 |
| 中冲剑 `mv_liumai_zhongchong`（中指·大开大阖） | 2 | `aoe_wave d1, w5` · 远程 | 0.70 | 10%/2/1000 | — | 可 | 0.60×1.34×0.85 |
| 关冲剑 `mv_liumai_guanchong`（无名指·拙滞古朴） | 3 | `aoe_pierce` · 1–4 · 远程 | 1.00 | 9%/2/1150 | `bf_pojia` 50% | 可 | 0.90×(1+0.24+0.05+0.105)×0.85−0.05 |
| 少冲剑 `mv_liumai_shaochong`（小指·轻灵） | 4 | `aoe_multi n3, r1` · 1–5 | 0.90（3 段） | 8%/1/900 | — | 可 | 0.85×(1+0.12−0.07) |
| 少泽剑 `mv_liumai_shaoze`（小指·忽来忽去） | 5 | `aoe_chain n3` · 1–5 · 远程 | 0.90（每跳 ×0.8） | 9%/2/1000 | — | 可 | 0.80×1.29×0.85 |
| **六脉齐发** `mv_liumai_liumaiqifa`（绝招，原创扩展命名） | 7 | `aoe_cone n3` · 远程（6 段） | 1.65 | 10%/—/1200 | — | 可 | 3.00×0.65×0.85 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_liumai_jianqi` | 剑气 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_zhenqiwaifang`（`dur 99`，品阶 inherit） |
| `ps_liumai_shiling` | 时灵时不灵 | 1 | mechanic | — | 20%→0% | 有效层数 1–6 重时，本武学招式分别有 20/16/12/8/4/0% 概率"不灵"（剑气不发，耗内照扣，收招 −300）；7 重起消失（原著段誉之事） |
| `ps_liumai_wuxing` | 无形 | 3 | stat | Z0 | ×[0.90, 0.70] | 目标招架本武学招式的概率乘以 {v} |
| `ps_liumai_suixin` | 剑随心转 | 5 | effect | cost | — | 本武学招式收招 −50；每回合第一招耗内 −20% |
| `ps_liumai_zongheng` | 剑气纵横 | 9 | stat | Z3 | 0.10 | 对 4 格及以外的目标，本武学伤害 +10% |
| `ps_liumai_dacheng` | 六脉大成 | 10 | mechanic | — | ×0.6 | 施放任一六脉招式后，本回合可追加一次商阳剑（×0.6，耗内照常，不占行动；每回合 1 次；新钩子 `followupMove`，待决 W-05） |

#### `sk_yiyangzhi` 一阳指（11 天中 · 拳脚/指法 · 大理段氏）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：段氏家传，段正明、段正淳、天龙寺诸僧皆擅，段延庆以钢杖施之（原著）；射雕：一灯以一阳指为黄蓉疗伤而大耗功力，王重阳以先天功交换一阳指并以之破欧阳锋蛤蟆功（原著，细节待考）；神雕：一灯、武三通、朱子柳。"一阳指分九品"之说**待考** |
| origin / lineage | `canon` / 大理段氏 → 一灯 → 渔樵耕读 |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.30/0.70 · 5 |
| reqs | `attrs {wis 55, con 50}`；`aptitude {apFinger 55}`；`morality {min 10}`；`sect {sect_dali, rank 3}`；`hard [sect, morality]`（一灯门下与天龙寺护法视为满足 `sect`） |
| layerStats | `seal [4, 12]`、`hit [2, 8]`（合计 20） |
| 层数要点 | 1：一阳点穴、纯阳指力、一阳认穴、九品 ｜ 3：一阳疗伤 ｜ 4：指贯三焦、纯阳 ｜ 5：封穴截脉 ｜ **7：绝招 乾阳一指** ｜ 8：以杖代指 ｜ 10：一品圆满 |
| setTags | `set_dali_yiyang` |
| conflicts | `{with: sk_hama, type: counter}`（与蛤蟆功条目互为镜像：一阳指命中蓄势中的蛤蟆功持有者，驱散其蓄势并封穴 1 回合） |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 天龙 `master npc_duanzhengming` `maxLayer 8`（客卿立大功后特许，原创扩展）、`master npc_benyin` `maxLayer 10`（天龙寺护法）；射雕 `master npc_yideng` `maxLayer 10`（过渔樵耕读四关，羁绊 ≥ 3）；神雕 `master npc_yideng` `maxLayer 10`、`master npc_wusantong` `maxLayer 6` |
| 图鉴文本 | 大理段氏家传绝学，以纯阳指力隔空点穴，亦能疗伤续命——一灯大师曾以之救黄蓉，为此大耗功力（射雕）。王重阳以先天功与之交换（原著）。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 一阳点穴 `mv_yiyangzhi_dianxue` | 1 | 单体 · 1–3 · 远程 | 0.85 | 8%/1/1000 | `bf_fengxue` 50% 1 | 可 | 1.12×0.85−0.10 |
| 纯阳指力 `mv_yiyangzhi_chunyang` | 1 | 单体 · 1–4 · 远程 | 0.85 | 8%/0/1000 | — | 可 | 1×0.85 |
| 一阳疗伤 `mv_yiyangzhi_liaoshang` | 3 | 单体友方 · 0–1 | 0 | 14%/4/1100 | 回复 25% `hpMax`；驱散 `injury`/`seal`/`poison` 共 2 个（≤ 品阶）；**代价**：自身 `bf_xuruo` 3 | — | 高于标准 18%，以高耗内、长冷却与自身虚弱抵偿 |
| 指贯三焦 `mv_yiyangzhi_sanjiao` | 4 | `aoe_pierce` · 1–4 · 远程 | 0.90 | 9%/1/1000 | — | 可 | 0.90×1.17×0.85 |
| 封穴截脉 `mv_yiyangzhi_jiemai` | 5 | 单体 · 1–3 · 远程 | 0.90 | 9%/2/1000 | `bf_fengxue` 60% 1；`bf_fengnei` 40% 1 | 可 | 1.29×0.85−0.12−0.08 |
| **乾阳一指** `mv_yiyangzhi_qianyang`（绝招，原创扩展命名） | 7 | 单体 · 1–3 · 远程 | 2.15 | 10%/—/1200 | `bf_fengxue` 100% 2 | 可 | 3.00×0.85−0.40 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yiyangzhi_renxue` | 一阳认穴 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_renxue`（`dur 99`，品阶 inherit） |
| `ps_yiyangzhi_jiupin` | 九品 | 1 | mechanic | — | +2pp/品 | 界面以"第 n 重 = 第 (10−n) 品"显示（九品最低，10 重为"一品圆满"）；每晋一品本武学封穴施加率 +2 个百分点（"九品"之说待考） |
| `ps_yiyangzhi_chunyang` | 纯阳 | 4 | stat | Z3 | 0.10 | 对带 `cold` 标签效果的目标 +10%，命中时驱散其 1 个 `cold` 效果（≤ 品阶） |
| `ps_yiyangzhi_yizhang` | 以杖代指 | 8 | mechanic | — | — | 持棍杖时本武学 `Mod_armed = 1.0`（05 §6.3），近身招式射程 +1——致敬段延庆以钢杖施一阳指（原著） |
| `ps_yiyangzhi_dacheng` | 一品圆满 | 10 | mechanic | — | — | 一阳疗伤不再使自身虚弱；本武学封穴类效果对 Boss 的控制递减减半（06 §11.4） |

### 5.4 地阶条目卡

#### `sk_kurongchangong` 枯荣禅功（9 地上 · 内功 · 天龙寺）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：天龙寺枯荣大师半面枯槁、半面丰润，入定数十年（原著；功名与修法细节待考）；枯式/荣式架势为原创扩展 |
| origin / lineage | `canonExpanded` / 枯荣大师 |
| sourceChapters | `ch01_tianlong` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1 · 4 |
| inner | `contribution {mpMaxPct 32, hpMaxPct 22, attrs {wil 8, con 6}, mpRegen 2.5, stats {resMind 10, resInjury 5}}`（IP 94.5，预算 94.5） |
| reqs | `attrs {wil 55, con 45}`；`aptitude {apInner 45}`；`morality {min 10}`；`sect {sect_tianlongsi, rank 3}`；`hard [sect, morality]` |
| 层数要点 | 1：枯式、荣式、半枯 ｜ 4：枯木逢春、半荣 ｜ 5：禅定 ｜ **7：绝招 非枯非荣**、入定 ｜ 10：枯荣大成 |
| setTags / conflicts | `set_dali_yiyang` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 天龙 `master npc_kurong` `maxLayer 10`（护法居士且羁绊 ≥ 3）、`master npc_benyin` `maxLayer 8` |
| 图鉴文本 | 天龙寺枯荣大师所修禅功，半身枯槁、半身丰润，寓荣枯无常之理（原著）。本作以枯式守、荣式攻两种架势实现，内功数值为原创扩展。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 枯式 `mv_kurongchangong_kushi` | 1 | 自身架势 | 0 | 5%/1/800 | 自身 `bf_shoushi` 3 | — | 架势招式 |
| 荣式 `mv_kurongchangong_rongshi` | 1 | 自身架势 | 0 | 5%/1/800 | 自身 `bf_gongshi` 3 | — | 架势招式 |
| 枯木逢春 `mv_kurongchangong_fengchun` | 4 | 自身 | 0 | 8%/3/1000 | 回复 15% `hpMax`；驱散 `injury` 1 个 | — | 支援 |
| 禅定 `mv_kurongchangong_chanding` | 5 | 自身 | 0 | 7%/4/900 | 自身 `bf_mian_xin` 2 | — | 支援 |
| **非枯非荣** `mv_kurongchangong_feikufeirong`（绝招，原创扩展命名） | 7 | `aoe_allies r2` | 0 | 9%/—/1200 | 自身 `bf_wudi` 1、回复 20% `hpMax`；友方 `bf_dingxin` 2 | — | 支援绝招 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_kurongchangong_banku` | 半枯 | 1 | stat | Z4 | [0.04, 0.08] | 气血 ≥ 50% 时受到伤害 −{v}（`auxMode scaled`） |
| `ps_kurongchangong_banrong` | 半荣 | 4 | stat | Z3 | [0.04, 0.10] | 气血 < 50% 时自身全部招式伤害 +{v}（`auxMode scaled`） |
| `ps_kurongchangong_ruding` | 入定 | 7 | trigger | — | — | 主运时 `battleStart` 获得 `bf_mian_xin` 3 回合（`auxMode none`） |
| `ps_kurongchangong_dacheng` | 枯荣大成 | 10 | mechanic | — | — | 枯式/荣式互换改为附加动作（不占行动，每回合 1 次） |

#### `sk_yiyangshuzhi` 一阳书指（8 地中 · 兵器/奇门（笔）· 大理段氏）

| 字段 | 值 |
|---|---|
| 出处 | 神雕大胜关英雄大会：朱子柳以一阳指力融入书法、以笔为兵对霍都，先楷后草，终书石鼓篆文，霍都不识而败（原著，所书碑帖名目待考：褚遂良《房玄龄碑》、怀素《自言帖》、石鼓文）。倚天朱武连环庄残传为原创扩展 |
| origin / lineage | `canon` / 一灯 → 朱子柳 →（朱长龄一系，残） |
| sourceChapters | `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `yang` · 0.35/0.65 · 4 |
| weaponReq | `{category: exotic, kinds: [brush]}` |
| reqs | `attrs {wis 50, agi 40}`；`aptitude {apExotic 45}`；`prereq [{sk_chunqiubifa, 5}]`；`sect {sect_dali, rank 3}`；`hard [sect, prereq]`；强度参考技艺 `art`（软门槛建议 ≥ 40，W-03） |
| layerStats | `seal [3, 9]`、`hit [1, 6]`（合计 15） |
| 层数要点 | 1：房玄龄碑、点画、书法入武 ｜ 3：自言帖 ｜ 4：一阳笔力 ｜ 5：石鼓文 ｜ 6：一阳透纸 ｜ **7：绝招 满纸云烟** ｜ 8：笔势 ｜ 9：笔走龙蛇 ｜ 10：书指大成 |
| setTags / conflicts | `set_dali_yiyang` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 神雕 `master npc_zhuziliu` `maxLayer 10`（一灯门下或羁绊 ≥ 3）；倚天 `manual it_miji_yiyangshuzhi_can`（朱武连环庄，原创扩展）`maxLayer 6`；`observe` 6 |
| 图鉴文本 | 朱子柳以一阳指力融入书法，以笔为兵：先楷后草，终以石鼓篆文，笔意古奥，不识者无从拆解（神雕，原著）。招式效果为本作原创设计。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 房玄龄碑（楷）`mv_yiyangshuzhi_kaishu` | 1 | 单体 · 1–2 · 近身 | 0.95 | 7%/0/1000 | `bf_fengxue` 25% 1 | 可 | 1−0.05 |
| 点画 `mv_yiyangshuzhi_dianhua` | 1 | 单体 · 1–2 · 近身 | 0.90 | 6%/0/900 | — | 可 | 1−0.05−0.07 |
| 自言帖（草）`mv_yiyangshuzhi_caoshu` | 3 | `aoe_multi n4, r1` · 1–2 | 1.10（4 段） | 8%/2/1000 | — | 可 | 0.85×1.29 |
| 石鼓文（篆）`mv_yiyangshuzhi_shiguwen` | 5 | 单体 · 1–2 · 近身 | 1.20 | 8%/2/1000 | `bf_luanxin` 60%；目标 `lore` 低于自身时另附 `bf_polu` 100% | 可 | 1.29−0.06−0.10×0.5（条件按半数计） |
| 一阳透纸 `mv_yiyangshuzhi_touzhi` | 6 | `aoe_pierce` · 1–2 · 近身 | 1.05 | 8%/1/1000 | — | 可 | 0.90×1.17 |
| **满纸云烟** `mv_yiyangshuzhi_yunyan`（绝招，原创扩展命名） | 7 | `aoe_cone n2`（4 段） | 2.15 | 9%/—/1200 | `bf_fengxue` 60% 1 | 可 | 3.00×0.75−0.12 |
| 笔走龙蛇 `mv_yiyangshuzhi_longshe` | 9 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 1.0, applyBuff: bf_fengxue 30%}` | — | 架势招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yiyangshuzhi_shufa` | 书法入武 | 1 | stat | — | ≤ +8 | 技艺 `art` 每 10 点，本武学 `seal` +1，至多 +8 |
| `ps_yiyangshuzhi_biliu` | 一阳笔力 | 4 | stat | Z2 | [0.05, 0.10] | 本武学无视目标内劲防御 {v} |
| `ps_yiyangshuzhi_bishi` | 笔势 | 8 | stat | Z3 | 0.10 / 0.20 | 按"楷→草→篆"顺序连续施放时，第二式 +10%、第三式 +20% |
| `ps_yiyangshuzhi_dacheng` | 书指大成 | 10 | mechanic | Z0 | — | 对 `lore < 20` 且 `art < 10` 的目标（不通文墨者），本场首次本武学招式获得 `bf_bizhong` ×1（原著霍都不识篆文） |

#### `sk_duanjiajianfa` 段家剑法（7 地下 · 兵器/剑 · 大理段氏）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：大理段氏家传剑法；段延庆身残后以钢杖施段家武学（原著，交手细节待考）；射雕后的传承与招名为原创扩展（取大理风物） |
| origin / lineage | `canonExpanded` / 大理段氏 → 一灯门下 →（元代大理总管段氏，原创扩展） |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `yang` · 0.60/0.40 · 4 |
| weaponReq | `{category: sword, altCategories: {unlockLayer: 5, categories: [staff], mult: 0.9}}`（5 重起以杖代剑） |
| reqs | `attrs {agi 40, str 35}`；`aptitude {apSword 40}`；`prereq [{sk_tiannanxinfa, 4}]`；`sect {sect_dali, rank 3}`；`hard [sect, prereq]` |
| layerStats | `parry [2, 8]`、`hit [1, 7]`（合计 15） |
| 层数要点 | 1：苍山云起、洱海月明、正气 ｜ 3：三塔倒影 ｜ 5：剑指一阳、剑中藏指、以杖代剑 ｜ **7：绝招 南诏风云** ｜ 8：蝴蝶泉 ｜ 10：段家大成 |
| setTags / conflicts | `set_dali_yiyang` / `{with: sk_yiyangzhi, type: synergy}`（见被动"剑中藏指"） |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 天龙 `master npc_duanzhengchun` `maxLayer 10`（客卿 `rank 3`）；射雕/神雕 `master npc_diancangyuyin`（点苍渔隐，原创扩展）`maxLayer 8`；倚天 `manual it_miji_duanjiajianfa`（大理段氏余脉，原创扩展）`maxLayer 7`；`observe` 6 |
| 图鉴文本 | 大理段氏家传剑法，剑势端凝，剑尖可吐一阳指力；段延庆身残后以钢杖施展段家武学（原著）。招名取大理风物，为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 苍山云起 `mv_duanjiajianfa_yunqi` | 1 | 单体 · 1 · 近身 | 1.00 | 7%/0/1000 | — | 可 | 1.00 |
| 洱海月明 `mv_duanjiajianfa_yueming` | 1 | `aoe_line n2` | 0.95 | 7%/1/1000 | — | 可 | 0.85×1.12 |
| 三塔倒影 `mv_duanjiajianfa_daoying` | 3 | 单体 · 1（3 段） | 1.30 | 8%/2/1000 | — | 可 | 1.29 |
| 剑指一阳 `mv_duanjiajianfa_yiyang` | 5 | 单体 · 1–2 · 近身 | 1.20 | 8%/2/1000 | `bf_fengxue` 40% 1 | 可 | 1.29−0.08 |
| **南诏风云** `mv_duanjiajianfa_nanzhao`（绝招，原创扩展命名） | 7 | `aoe_cone n2` | 2.15 | 9%/—/1200 | `bf_polu` 100% 2 | 可 | 3.00×0.75−0.10 |
| 蝴蝶泉 `mv_duanjiajianfa_hudie` | 8 | `aoe_dash n3, through` · 1–3 | 0.90 | 7%/2/1000 | 突进（穿过） | 可 | 0.80×1.24−0.10 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_duanjiajianfa_zhengqi` | 正气 | 1 | stat | — | [3, 8] pp | `resMind` +{v}（皇族气度） |
| `ps_duanjiajianfa_cangzhi` | 剑中藏指 | 5 | stat | — | +15pp | 同时装配一阳指时，本武学所附 `bf_fengxue` 施加率 +15 个百分点（相生） |
| `ps_duanjiajianfa_dacheng` | 段家大成 | 10 | stat | Z3 | 0.12 | 对被封穴的目标，本武学伤害 +12% |

### 5.5 玄/黄阶紧凑卡

**`sk_wuluoqingyanzhang` 五罗轻烟掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.60/0.40 · 栏 3）｜reqs：`attrs {agi 30, wis 25}`、`aptitude {apFist 25}`、`prereq [{sk_tiannanxinfa, 3}]`、`sect {sect_dali, rank 2}`（硬：sect、prereq）｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：天龙 `master npc_duanzhengchun` `maxLayer 10`；`observe` 6｜出处：天龙·段正淳所擅掌法（原著，细节待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 轻烟掠影 `mv_wuluoqingyanzhang_lueying` | 1 | 单体·1 | 0.95 | 6%/0/900 | — | 可 | 1−0.07 |
| 五罗连掌 `mv_wuluoqingyanzhang_lianzhang` | 3 | 单体·1（5 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 烟笼寒水 `mv_wuluoqingyanzhang_yanlong` | 5 | `aoe_cone n2` | 0.90 | 7%/2/1000 | `bf_muxuan` 50% | 可 | 0.75×1.29−0.05 |
| 轻烟散尽 `mv_wuluoqingyanzhang_sanjin` | 7 | `aoe_behind`·1–2 | 1.00 | 7%/2/1000 | 绕背 | 可 | 0.90×1.29−0.15 |

被动：`ps_wuluoqingyanzhang_qingyan` 轻烟（1，stat：`eva` +[2%, 5%]）；`ps_wuluoqingyanzhang_liudong` 流动（5，stat Z3：本回合移动 ≥ 2 格时本武学 +6%）；`ps_wuluoqingyanzhang_dacheng` 五罗（10，stat Z0：本武学多段招式每段暴击 +2）。

**`sk_cangshanfeidu` 苍山飞渡**（4 玄下 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**巴天石一脉的山地轻功（巴天石善轻功为原著）｜reqs：`attrs {agi 25}`、`aptitude {apLight 20}`｜轻功值 `QS(4) = 56`｜layerStats：`eva [1,5]`、`tough [1,5]`｜获取：天龙 `master npc_batianshi` `maxLayer 10`；射雕—倚天大理护卫 `master` `maxLayer 8`；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 云岭飞渡 `mv_cangshanfeidu_feidu` | 1 | 自身 | 0 | 4%/2/800 | 自身 `bf_tengyue` 2 | — | 支援 |
| 十九峰 `mv_cangshanfeidu_shijiufeng` | 5 | 自身 | 0 | 5%/3/900 | 自身 `bf_jixing` 2、`bf_piaohu` 2 | — | 支援 |

被动：`ps_cangshanfeidu_panyan` 攀岩（1，mechanic：攀爬崖壁地形体力消耗 −[10%, 25%]，design/08 接口）；`ps_cangshanfeidu_yuanman` 圆满（10，stat：`jump` +1）。

**`sk_tiannanxinfa` 天南心法**（3 黄上 · 内功 · 阳 · 0/1 · 栏 3）｜**（原创扩展）**大理王府护卫与段氏子弟的入门心法｜reqs：`sect {sect_dali, rank 1}`（硬）｜contribution：`mpMaxPct 10, hpMaxPct 6, attrs {wis 2, con 2}, mpRegen 1.2, stats {seal 3, effHit 3}`（IP 30）｜setTags：`set_dali_yiyang`｜获取：大理各书界 `master`；`pages`（3 页）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 调息 `mv_tiannanxinfa_tiaoxi` | 3 | 自身 | 0 | 4%/3/900 | 自身 `bf_huinei` 2 | — | 支援 |
| 纯阳护脉 `mv_tiannanxinfa_humai` | 6 | 自身 | 0 | 4%/3/900 | 自身 `bf_huxue` 2 | — | 支援 |

被动：`ps_tiannanxinfa_yangqi` 一阳之气（1，stat：`seal` +[1, 3]，`auxMode scaled`）；`ps_tiannanxinfa_yuanman` 圆满（10，mechanic：首次练满 `apInner` +1；学习一阳指、段家剑法时资质软门槛 −10）。

**`sk_chunqiubifa` 春秋笔法**（3 黄上 · 兵器/奇门（笔）· 阳 · 0.60/0.40 · 栏 3）｜**（原创扩展命名）**朱丹臣使判官笔（天龙，待考）｜weaponReq：`{category: exotic, kinds: [brush]}`｜reqs：`attrs {wis 20}`｜layerStats：`seal [1,3]`、`hit [1,3]`｜获取：天龙 `master npc_zhudanchen` `maxLayer 10`；射雕/神雕 `master npc_zhuziliu` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铁笔点睛 `mv_chunqiubifa_dianjing` | 1 | 单体·1 | 0.95 | 5%/0/1000 | `bf_fengxue` 15% 1 | 可 | 1−0.03 |
| 微言大义 `mv_chunqiubifa_weiyan` | 4 | 单体·1 | 1.05 | 5%/1/1000 | `bf_dongyao` 50% | 可 | 1.12−0.05 |
| 一字褒贬 `mv_chunqiubifa_baobian` | 7 | `aoe_pierce` | 1.15 | 6%/2/1000 | — | 可 | 0.90×1.29 |

被动：`ps_chunqiubifa_bimo` 笔墨（5，stat：技艺 `art` 每 10 点 `seal` +1，至多 +4）；`ps_chunqiubifa_yuanman` 圆满（10，mechanic：首次练满 `apExotic` +1；一阳书指资质软门槛 −10）。

**`sk_kaishanfufa` 开山斧法**（3 黄上 · 兵器/奇门（斧）· 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展命名）**古笃诚使板斧（天龙）、一灯弟子樵子（射雕），待考｜weaponReq：`{category: exotic, kinds: [axe]}`｜reqs：`attrs {str 20}`｜layerStats：`crit [1,3]`、`hit [1,3]`｜获取：天龙 `master npc_guducheng` `maxLayer 10`；射雕 `master npc_qiaozi` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 力劈华山 `mv_kaishanfufa_lipi` | 1 | 单体·1 | 1.20 | 5%/1/1100 | — | 可 | 1+0.12+0.07 |
| 樵斧断木 `mv_kaishanfufa_duanmu` | 4 | 单体·1 | 1.25 | 6%/2/1000 | `bf_pojia` 60% | 可 | 1.29−0.06 |
| 横斧拦腰 `mv_kaishanfufa_lanyao` | 7 | `aoe_sweep` | 0.95 | 6%/2/1000 | — | 可 | 0.75×1.29 |

被动：`ps_kaishanfufa_liqi` 蛮力（5，stat Z6：暴击伤害 +[5, 10] pp）；`ps_kaishanfufa_yuanman` 圆满（10，mechanic：伐木、开路等探索交互效率 +20%，design/11 接口）。

**`sk_zhennangunfa` 镇南棍法**（2 黄中 · 兵器/棍杖 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展命名）**镇南王府护卫傅思归使熟铜棍（天龙，待考）｜reqs：无｜layerStats：`parry [1,4]`、`hit [1,2]`｜获取：天龙 `master npc_fusigui` `maxLayer 10`；射雕—倚天大理护卫 `master`；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铜棍开道 `mv_zhennangunfa_kaidao` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 横扫千钧 `mv_zhennangunfa_hengsao` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 镇岳 `mv_zhennangunfa_zhenyue` | 7 | 单体·1–2 | 1.10 | 5%/1/1000 | `bf_xuanyun` 15% 1 | 可 | 1.12−0.0375 |

被动：`ps_zhennangunfa_huwei` 护卫（5，stat：与友方相邻时 `parry` +[2%, 4%]）；`ps_zhennangunfa_yuanman` 圆满（10，mechanic：首次练满 `apStaff` +1）。

---

## 6. 周伯通（传承 · `lineage: 周伯通`）

### 6.1 简介

- **时代**：射雕时周伯通被黄药师困于桃花岛石洞十五年，其间自创七十二路空明拳与左右互搏之术，传于郭靖，并诱郭靖背熟《九阴真经》（原著）。神雕时周伯通隐居百花谷，与瑛姑、一灯为伴，小龙女亦从他学会左右互搏（原著）。
- **定位**：名义属全真教（王重阳师弟），但本组两门天级为其自创，故单列传承（`sect: null`，`lineage: 周伯通`），不设门派入门武学；入门武学借全真图鉴（`sect_quanzhen`）。
- **学习**：只经羁绊传授（射雕桃花岛石洞、神雕百花谷）；左右互搏以"心思纯一"为门槛（`wis ≤ 85` 硬门槛，05 §9.3.2）。
- **组合**：空明拳 ＋ 左右互搏 为郭靖原著打法（"双手分使降龙、空明"），见套装 `set_zhoubotong_wantong`、`set_guojing_xiazhe`（§12）。

### 6.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_kongming` | 空明拳 | 拳脚/拳掌 | 10 天下 | 调和 | 0.40/0.60 | 射雕、神雕 | 周伯通羁绊（桃花岛石洞/百花谷） | 原著 |
| `sk_zuoyouhubo` | 左右互搏 | 杂学（机制；子类暂归 `mind`，W-07） | 10 天下 | 中性 | — | 射雕、神雕 | 周伯通羁绊；神雕小龙女（原创扩展途径） | 原著 |
| `sk_wantongmizong` | 顽童迷踪 | 轻功 | 5 玄中 | 中性 | — | 射雕、神雕 | 周伯通羁绊 | 原创扩展 |

### 6.3 天阶条目卡

#### `sk_kongming` 空明拳（10 天下 · 拳脚/拳掌 · 周伯通）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：周伯通于桃花岛石洞所创七十二路空明拳，本于"以空明柔弱胜刚强"，以"空碗盛饭"为喻授郭靖（原著）；拳诀"空朦洞松、风通容梦、冲穷中弄、童庸弓虫"（**逐字待考**），本作取诀字为招名 |
| origin / lineage | `canon` / 周伯通 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.40/0.60 · 5 |
| reqs | `attrs {wil 55, wis 45}`；`aptitude {apFist 55}`；`hard []`（仅羁绊途径可得） |
| layerStats | `parry [4, 12]`、`counter [2, 8]`（合计 20） |
| 层数要点 | 1：空朦、洞松、空碗盛饭 ｜ 2：风通 ｜ 3：容梦、以柔克刚 ｜ 4：冲穷 ｜ 5：中弄、转劲 ｜ 6：童庸 ｜ **7：绝招 七十二路空明拳** ｜ 8：弓虫（触发）、空明 ｜ 10：空明大成 |
| setTags / conflicts | `set_zhoubotong_wantong`、`set_guojing_xiazhe` / `{with: sk_zuoyouhubo, type: synergy}`（见被动"空明大成"） |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 射雕 `master npc_zhoubotong` `maxLayer 10`（桃花岛石洞事件，羁绊 ≥ 3）；神雕 `master npc_zhoubotong` `maxLayer 10`（百花谷） |
| 图鉴文本 | 周伯通在桃花岛石洞中所创的七十二路拳法，本于"以空明柔弱胜刚强"之理，如空碗方能盛饭，以柔化刚（原著）。招名取其口诀，招式效果为原创设计。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 空朦 `mv_kongming_kongmeng` | 1 | 单体 · 1 · 近身 | 0.90 | 7%/0/900 | — | 可 | 1−0.05−0.07 |
| 洞松 `mv_kongming_dongsong` | 1 | 自身架势 | 0 | 5%/2/800 | 自身 `bf_xieli` 2；`stanceCounter {counterPower 0.8, expires: nextOwnAction}` | — | 架势招式 |
| 风通 `mv_kongming_fengtong` | 2 | `aoe_sweep` | 0.75 | 8%/1/1000 | 自身 `bf_zhuanjin` 2 | 可 | 0.75×1.12−0.10 |
| 容梦 `mv_kongming_rongmeng` | 3 | 单体 · 1 · 近身 | 1.20 | 8%/2/1000 | `bf_waigong_jiang` 60% | 可 | 1.24−0.06 |
| 冲穷 `mv_kongming_chongqiong` | 4 | `aoe_knock n2` · 1 | 1.15 | 9%/2/1000 | 击退 2 | 可 | 0.95×1.29−0.10 |
| 中弄 `mv_kongming_zhongnong` | 5 | 单体 · 1（3 段） | 1.30 | 9%/2/1000 | — | 可 | 1.29 |
| 童庸 `mv_kongming_tongyong` | 6 | `aoe_swap` · 1–2 | 0.80 | 8%/2/1000 | 换位；`bf_shiheng` 100% | 可 | 0.85×1.24−0.15−0.10 |
| **七十二路空明拳** `mv_kongming_qishier`（绝招） | 7 | 单体 · 1（6 段） | 2.80 | 10%/—/1200 | `bf_waigong_jiang` 100%；`bf_shiheng` 100% | 可 | 3.00−0.10−0.10 |
| 弓虫 `mv_kongming_gongchong`（触发） | 8 | 自身 | 0 | 4%/—/— | `trigger {on: meleeAttacked, chance 0.3, perRound 1, counterPower 1.0}` | — | 触发招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_kongming_kongwan` | 空碗盛饭 | 1 | stat | Z4 | [0.05, 0.12] | 受到 `wOut ≥ 0.6` 的招式伤害 −{v}（以空纳实） |
| `ps_kongming_yirou` | 以柔克刚 | 3 | stat | Z3 | [0.06, 0.12] | 对外功攻击 `atkOut` 高于自身的目标，本武学伤害 +{v} |
| `ps_kongming_zhuanjin` | 转劲 | 5 | trigger | — | — | `onParry`（每回合 1 次）：自身获得 `bf_zhuanjin` 2 回合 |
| `ps_kongming_kongming` | 空明 | 8 | mechanic | Z0 | 0.25 | 被暴击时 25% 化为普通命中 |
| `ps_kongming_dacheng` | 空明大成 | 10 | mechanic | — | +0.05 | 左右互搏"分心二用"中，本武学招式的 `Mod_special` +0.05（原著郭靖以双手分使空明拳与降龙掌） |

#### `sk_zuoyouhubo` 左右互搏（10 天下 · 杂学（机制）· 周伯通）

**核心规则以 `design/05` §9.3.2 为准**（占 1 个杂学栏；行动"分心二用"：两门不同武学的两个非绝招招式、每招 `Mod_special = 0.55 + 0.03 × 层`、耗内为两招之和、收招 = 较大者 + 150；硬门槛 `wis ≤ 85`、软门槛 `wil ≥ 50`；以"纯一系数"`pureMult` 代替悟性系数修炼；玉女素心剑法一人合璧 ×0.8 见 05 §9.3.1）。本文补齐图鉴字段、层数、被动与绝招：

| 字段 | 值 |
|---|---|
| 出处 | 射雕：周伯通于石洞中自创，"左手画方、右手画圆"为入门之法；郭靖学成，黄蓉聪明反不能学（原著）；神雕：小龙女亦学成（原著） |
| origin / lineage | `canon` / 周伯通 → 郭靖、小龙女 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| category / subType / nature | `misc` / `mind`（暂归，待决 W-07）/ `neutral` |
| reqs | `attrsMax {wis 85}`；`attrs {wil 50}`；`hard [attrsMax]` |
| layerStats | `effHit [2, 8]`、`resMind [4, 12]`（合计 20） |
| 层数要点 | 1：分心二用、左手画方右手画圆 ｜ 4：一心二用 ｜ 6：双手互援 ｜ **7：绝招 双手全力** ｜ 8：心思纯一 ｜ 10：互搏大成 |
| setTags / conflicts | `set_zhoubotong_wantong`、`set_guojing_xiazhe` / 无 |
| special / observable | `{fusible: false, trainMult: pureMult}` / `false` |
| 获取 | 射雕 `master npc_zhoubotong` `maxLayer 10`（桃花岛石洞）；神雕 `master npc_zhoubotong` `maxLayer 10`、`master npc_xiaolongnv` `maxLayer 8`（羁绊 ≥ 4，原创扩展途径） |
| 图鉴文本 | 周伯通所创"一心二用"之术，左手画方、右手画圆，双手各使一门武功。心思纯一者易学，聪明伶俐者反难领会——郭靖、小龙女学成，黄蓉不能（原著）。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 分心二用 `mv_zuoyouhubo_fenxin` | 1 | 依所选两招 | 各招 × `Mod_special` | 两招之和/各自冷却/较大者 + 150 | — | 依原招 | 05 §9.3.2 |
| **双手全力** `mv_zuoyouhubo_quanli`（绝招，原创扩展命名） | 7 | 依所选两招 | 各招 ×1.00 | 两招之和 + 10%/—/较大者 | — | 依原招 | 以气势 100 换取"去除 `Mod_special` 折算与 +150 收招"；两招仍须为非绝招 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_zuoyouhubo_fangyuan` | 左手画方右手画圆 | 1 | mechanic | — | — | 解锁行动"分心二用"；角色 `dualWield` 取本武学有效层数（与 design/03 的 0–3 级定义不一致，W-07） |
| `ps_zuoyouhubo_yixin` | 一心二用 | 4 | stat | Z0 | [0.03, 0.06] | 分心二用时两招效果命中 +{v} |
| `ps_zuoyouhubo_huyuan` | 双手互援 | 6 | stat | Z3 | 0.08 | 分心二用的两招命中同一目标时，第二招 +8% |
| `ps_zuoyouhubo_chunyi` | 心思纯一 | 8 | mechanic | — | — | 免疫品阶 ≤ 自身的 `bf_luanxin`；所受 `mind` 标签减益持续 −1（最低 1） |
| `ps_zuoyouhubo_dacheng` | 互搏大成 | 10 | mechanic | — | +50 | 分心二用的收招附加值由 +150 降为 +50 |

### 6.4 玄阶紧凑卡

**`sk_wantongmizong` 顽童迷踪**（5 玄中 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**老顽童嬉戏逃遁的身法｜reqs：`attrs {agi 30}`（仅周伯通羁绊途径）｜轻功值 `QS(5) = 65`｜layerStats：`eva [1,6]`、`tough [1,4]`｜setTags：`set_zhoubotong_wantong`｜获取：射雕/神雕 `master npc_zhoubotong` `maxLayer 10`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 捉迷藏 `mv_wantongmizong_zhuomicang` | 1 | 自身 | 0 | 5%/4/900 | 自身 `bf_yinshen` 1 | — | 支援 |
| 溜之大吉 `mv_wantongmizong_liuzhidaji` | 4 | 自身 | 0 | 5%/3/800 | 自身 `bf_dunzou` 2 | — | 支援 |
| 戏弄 `mv_wantongmizong_xinong` | 7 | 单体·1–3 | 0 | 5%/3/900 | `bf_chaofeng` 100% 1 | — | 纯控制 |

被动：`ps_wantongmizong_tongxin` 童心（1，stat：`resMind` +[3, 8] pp）；`ps_wantongmizong_yuanman` 跑得快（10，mechanic：撤退行动成功率 +20%，design/09 接口）。

---

## 7. 九阴真经系（传承 · `lineage: 九阴真经`）

### 7.1 简介

- **源流**：北宋黄裳校刊《万寿道藏》而悟武学，著《九阴真经》，上卷为内功根基，下卷为招式，总纲以梵文音译写成（原著，细节待考）。射雕时真经为天下争夺之物：周伯通背熟全经并诱郭靖记诵；黑风双煞盗得下卷，误读而练成九阴白骨爪、摧心掌；欧阳锋得郭靖篡改之伪经，逆练成狂；一灯译出总纲（原著）。神雕时王重阳在古墓石壁刻有真经要旨，小龙女、杨过习之（原著，古墓武学归古墓图鉴）。倚天时郭靖、黄蓉将真经藏于倚天剑中，周芷若得之速成（原著）。
- **定位**：非门派，`sect: null`；属同源组 `lg_jiuyin`（02 §5.4：九阴真经、九阴神爪、移魂大法、九阴白骨爪）。本文将易筋锻骨篇、蛇行狸翻、大伏魔拳、九阴疗伤篇、白蟒鞭法、摧心掌、铜尸横练亦归本系，**建议 02 把前四者并入 `lg_jiuyin`**（待决 W-08）。
- **正邪双线**：正法（九阴真经→神爪/大伏魔拳/易筋锻骨/蛇行狸翻）与邪练（白骨爪/摧心掌/白蟒鞭/铜尸横练，套装 `set_heifeng_shuangsha`）；白骨爪可经"正本清源"改修为神爪（05 §9.1.2），二者互斥。
- **获取结构**：射雕"九阴真经总纲与九阴神爪/移魂大法同组"为通用终盘线（02 §2.9）；其余本系武学随真经事件链分批解锁（`chapters/02` 定节点）。
- **入门**：本系无黄阶武学（秘籍传承，非门派）；入门需求由全真、桃花岛、丐帮等图鉴满足。

### 7.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_jiuyin` | 九阴真经（总纲·内功） | 内功 | 12 天上 | 调和 | 0/1 | 射雕、神雕、倚天 | 周伯通授经；古墓石刻；倚天剑藏经 | 原著 |
| `sk_jiuyinshenzhao` | 九阴神爪（正法） | 拳脚/擒拿 | 10 天下 | 阴 | 0.50/0.50 | 射雕、神雕 | 真经下卷正解；郭靖；白骨爪改修 | 原著 |
| `sk_yihun` | 移魂大法 | 杂学/心神 | 10 天下 | 中性 | 0/1 | 射雕 | 真经下卷；黄蓉羁绊 | 原著 |
| `sk_jiuyinbaigu` | 九阴白骨爪 | 拳脚/擒拿 | 9 地上 | 阴 | 0.55/0.45 | 射雕、倚天 | 梅超风；奇遇"误读真经"；倚天藏经速成篇 | 原著（规则见 05 §9.1.2） |
| `sk_cuixinzhang` | 摧心掌 | 拳脚/拳掌 | 9 地上 | 阴 | 0.35/0.65 | 射雕 | 梅超风；误读真经 | 原著 |
| `sk_dafumoquan` | 大伏魔拳 | 拳脚/拳掌 | 9 地上 | 阳 | 0.60/0.40 | 射雕、神雕 | 真经下卷；神雕郭靖 | 原著（名目；招式细节待考） |
| `sk_yijinduangupian` | 易筋锻骨篇 | 内功 | 8 地中 | 调和 | 0/1 | 射雕、神雕 | 真经上卷；古墓石刻；郭靖 | 原著（名目待考） |
| `sk_shexinglifan` | 蛇行狸翻 | 轻功 | 7 地下 | 中性 | — | 射雕、神雕 | 真经下卷；郭靖 | 原著（名目待考） |
| `sk_baimangbianfa` | 白蟒鞭法 | 兵器/鞭索 | 7 地下 | 阴 | 0.60/0.40 | 射雕、倚天 | 梅超风；倚天藏经速成篇 | 原著（梅超风、周芷若使长鞭；鞭名待考） |
| `sk_jiuyinliaoshangpian` | 九阴疗伤篇 | 杂学/医 | 6 玄上 | 中性 | — | 射雕、神雕 | 牛家村密室事件；郭靖/黄蓉 | 原著（牛家村密室七日七夜疗伤） |
| `sk_tongshihenglian` | 铜尸横练 | 内功 | 6 玄上 | 阳 | 0/1 | 射雕 | 黑风双煞遗物 | 原创扩展命名（"铜尸"陈玄风横练、罩门在脐为原著） |

### 7.3 天阶条目卡

#### `sk_jiuyin` 九阴真经（12 天上 · 内功 · 黄裳）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕、倚天（见 §7.1）；总纲首句"天之道，损有余而补不足，是故虚胜实，不足胜有余"（**逐字待考**），本作运功招式据此命名（原创扩展） |
| origin / lineage | `canon` / 黄裳 → 周伯通、郭靖、黄蓉 →（古墓石刻）→（倚天剑）周芷若 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1（损有余覆写 0.20/0.80）· 5 |
| inner | `contribution {mpMaxPct 58, hpMaxPct 34, attrs {wis 8, agi 6, con 6, wil 4}, mpRegen 3.2, stats {resSeal 10, resMind 10}}`（IP 156，预算 156）；`auxUsableMoves [mv_jiuyin_jiexue]` |
| reqs | `attrs {wis 60, wil 55}`；`aptitude {apInner 55}`；`hard []`（经书/奇遇途径，受 02 §2.9 进度门槛约束） |
| 层数要点 | 1：损有余、总纲 ｜ 3：补不足、虚胜实（被动） ｜ 5：虚实相生（架势）、不足胜有余 ｜ 6：九阴解穴 ｜ **7：绝招 天之道**、解穴秘诀 ｜ 8：九阴收功、正本清源 ｜ 10：九阴大成 |
| setTags / conflicts | `set_jiuyin_zhengzong`、`set_guojing_xiazhe`、`set_zhoubotong_wantong` / 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 射雕 `master npc_zhoubotong` `maxLayer 10`（桃花岛石洞授经，羁绊 ≥ 4；总纲另需一灯译解事件，未完成前 `maxLayer 7`，原创扩展节奏）；神雕 `qiyu q_03_qiyu_9x`（古墓王重阳石刻）`maxLayer 8`；倚天 `qiyu q_04_qiyu_9x`（倚天剑藏经）`maxLayer 10` |
| 图鉴文本 | 黄裳所著武学总纲，上卷内功、下卷招式，总纲以梵文音译写成（原著）。"天之道，损有余而补不足"——本作以资源再平衡、以弱胜强实现其意。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 损有余 `mv_jiuyin_sunyouyu` | 1 | 单体 · 1–2 · 近身 | 1.00 | 8%/1/1000 | `rageDrain {value: 15}` | 可 | 1.12−0.10（夺气势） |
| 补不足 `mv_jiuyin_buzu` | 3 | 自身 | 0 | 10%/3/1000 | 回复 18% `hpMax`；气血 < 50% 时另回复 10% `mpMax` | — | 标准治疗 |
| 虚实相生 `mv_jiuyin_xushi` | 5 | 自身架势 | 0 | 6%/3/800 | 自身 `bf_piaohu` 2、`bf_xieli` 2 | — | 架势招式 |
| 九阴解穴 `mv_jiuyin_jiexue` | 6 | 单体友方 · 0–2 | 0 | 8%/3/1000 | 驱散全部 `seal` 与 1 个 `cc`（≤ 品阶） | — | 支援（辅运可用） |
| **天之道** `mv_jiuyin_tianzhidao`（绝招，原创扩展命名） | 7 | `aoe_allies r2` | 0 | 10%/—/1200 | 本方范围内气血百分比向平均值拉平（高于均值者匀出，至多各 20%；新钩子 `equalizeHp`，W-05）；友方 `bf_jiangu` 2；自身 `bf_hutizhenqi {shieldPctHpMax: 0.15}` 3 | — | 支援绝招 |
| 九阴收功 `mv_jiuyin_shougong` | 8 | 自身 | 0 | 6%/4/900 | `cleanseZouhuo {maxLevel: 1}`；驱散自身 `injury` 1 个 | — | 支援 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_jiuyin_zonggang` | 总纲 | 1 | stat | — | [0.10, 0.25] | 九阴系武学（§7.2 全部）修炼速度 +{v}（计入 `bonusMult`，`auxMode full`） |
| `ps_jiuyin_xusheng` | 虚胜实 | 3 | stat | Z4 | [0.05, 0.12] | 受到暴击时伤害 −{v}（`auxMode scaled`） |
| `ps_jiuyin_buzu` | 不足胜有余 | 5 | stat | Z3 | [0.05, 0.12] | 自身气血百分比低于目标时，全部招式伤害 +{v}（`auxMode scaled`） |
| `ps_jiuyin_jiexuemijue` | 解穴秘诀 | 7 | mechanic | — | +30% | 被 `seal` 所制时 S5 冲穴 +30%；免疫品阶 ≤ 自身的 `bf_fengnei`（`auxMode full`） |
| `ps_jiuyin_zhengben` | 正本清源 | 8 | mechanic | — | ×0.5 | 装配本功时，九阴白骨爪升层走火概率减半（05 §9.1.2 改修的前置之一为本功 ≥ 3 重） |
| `ps_jiuyin_dacheng` | 九阴大成 | 10 | mechanic | — | −1 | 主运时自身所受 `injury`、`poison` 标签减益持续 −1（最低 1） |

#### `sk_jiuyinshenzhao` 九阴神爪（10 天下 · 拳脚/擒拿 · 九阴真经）

| 字段 | 值 |
|---|---|
| 出处 | 《九阴真经》下卷爪法正解，经文言"五指发劲，无坚不破，摧敌首脑，如穿腐土"（**引文待考**，05 K6）；黑风双煞误读为插人头骨，正法所摧者乃敌之要害。别名"摧坚神爪"（待考） |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.50/0.50 · 5 |
| reqs | `attrs {agi 50, str 45}`；`aptitude {apGrapple 55}`；`prereq [{sk_jiuyin, 3}]`；`morality {min 0}`；`hard [prereq, morality]` |
| layerStats | `pierce [4, 12]`、`crit [2, 8]`（合计 20） |
| 层数要点 | 1：摧坚、九阴锁、正法 ｜ 3：如穿腐土、无坚不破 ｜ 4：摧敌首脑 ｜ 5：五指发劲、要害 ｜ **7：绝招 无坚不摧** ｜ 8：擒拿要害、腐土 ｜ 10：神爪大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / `{with: sk_jiuyinbaigu, type: exclusive}`（05 §9.2） |
| special / observable | `{fusible: true, reformFrom: sk_jiuyinbaigu}`（改修：`layerReal = floor(0.6 × 原层)`，05 §9.1.2）/ `false` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷正解，与总纲同组，02 §2.9）`maxLayer 10`、`master npc_zhoubotong` `maxLayer 8`；神雕 `master npc_guojing` `maxLayer 10` |
| 图鉴文本 | 《九阴真经》下卷所载爪法正解：五指发劲，无坚不破，所摧者乃敌之要害（原著引文待考）。黑风双煞误读此段而练成九阴白骨爪；本条为正法。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 摧坚 `mv_jiuyinshenzhao_cuijian` | 1 | 单体 · 1 | 1.05 | 8%/1/1000 | `ignoreDef {out: 0.15}` | 可 | 1.12−0.05 |
| 九阴锁 `mv_jiuyinshenzhao_suo` | 1 | 单体 · 1 | 1.05 | 8%/1/1000 | `bf_fengjingmai` 40% 1 | 可 | 1.12−0.08 |
| 如穿腐土 `mv_jiuyinshenzhao_futu` | 3 | `aoe_pierce` | 1.15 | 9%/2/1000 | — | 可 | 0.90×1.29 |
| 摧敌首脑 `mv_jiuyinshenzhao_shounao` | 4 | 单体 · 1；`condition {targetHasTag: [seal, cc]}` | 1.50 | 9%/3/1000 | `bf_xuanyun` 30% 1 | 可 | (1+0.36+0.05+0.15)−0.075 |
| 五指发劲 `mv_jiuyinshenzhao_wuzhi` | 5 | 单体 · 1（5 段） | 1.25 | 9%/2/1000 | `bf_liuxue` 50% | 可 | 1.29−0.05 |
| **无坚不摧** `mv_jiuyinshenzhao_wujian`（绝招，原创扩展命名） | 7 | 单体 · 1 | 2.40 | 10%/—/1200 | `bf_pojia` 100%；驱散目标 `guard` 1 个 | 不可 | 3.00×0.85−0.10−0.05 |
| 擒拿要害 `mv_jiuyinshenzhao_qinna` | 8 | `aoe_pull n1` · 1–2 | 1.00 | 8%/2/1000 | 拉拽 1；`bf_dingshen` 30% 1 | 可 | 0.95×1.24−0.10−0.075 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_jiuyinshenzhao_zhengfa` | 正法 | 1 | mechanic | — | — | 本武学不产生邪气；与九阴白骨爪互斥 |
| `ps_jiuyinshenzhao_wujian` | 无坚不破 | 3 | stat | Z2 | [0.10, 0.25] | 本武学无视目标外功防御 {v} |
| `ps_jiuyinshenzhao_yaohai` | 要害 | 5 | stat | Z0 | +10 | 对带 `seal`/`cc` 标签效果的目标，本武学暴击 +10 |
| `ps_jiuyinshenzhao_futu` | 腐土 | 8 | trigger | — | — | `onCrit`：目标获得 `bf_pojia` 2 回合 |
| `ps_jiuyinshenzhao_dacheng` | 神爪大成 | 10 | mechanic | — | ×1.5 | 本武学对护体真气伤害 ×1.5（`shieldDmgMult`） |

#### `sk_yihun` 移魂大法（10 天下 · 杂学/心神 · 九阴真经）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：《九阴真经》所载摄魂心术，黄蓉习之，曾以之反制丐帮彭长老的摄心之术（原著，施术场景待考） |
| origin / lineage | `canon` / 九阴真经 → 黄蓉 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0/1 · 5 |
| reqs | `attrs {wis 60, wil 60}`；`prereq [{sk_jiuyin, 3}]`；`hard [prereq]`（黄蓉途径 `reqsOverride {prereq: []}`） |
| layerStats | `effHit [4, 12]`、`resMind [2, 8]`（合计 20） |
| 层数要点 | 1：摄魂、定心、摄目 ｜ 3：反照、心镜 ｜ 5：惑心、克摄心 ｜ **7：绝招 移魂大法** ｜ 8：催眠 ｜ 10：移魂大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / `{with: sk_shexinshu, type: counter}`（见摄心术条目） |
| special / observable | `{fusible: false}` / `false` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷，与总纲同组）`maxLayer 10`；`master npc_huangrong` `maxLayer 8`（羁绊 ≥ 4，原创扩展） |
| 图鉴文本 | 《九阴真经》所载的摄魂心术，以目光语声引人入彀，令对手神智迷失、反为己用（原著，施术场景待考）。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 摄魂 `mv_yihun_shehun` | 1 | 单体 · 1–3 | 0 | 8%/3/1000 | `bf_mihuo` 40% 1 | — | 纯控制 |
| 定心 `mv_yihun_dingxin` | 1 | `aoe_allies r2` | 0 | 6%/3/900 | 友方 `bf_dingxin` 2；驱散 `mind` 1 个 | — | 支援 |
| 反照 `mv_yihun_fanzhao` | 3 | 自身架势 | 0 | 7%/3/800 | 至下次行动：受 `mind` 招式时 60% 反施于施术者（新钩子 `reflectMind`，W-05） | — | 架势招式 |
| 惑心 `mv_yihun_huoxin` | 5 | `aoe_cone n2` · 远程 | 0 | 8%/3/1000 | `bf_luanxin` 60%；`bf_dongyao` 100% | — | 纯控制 |
| **移魂大法** `mv_yihun_yihun`（绝招） | 7 | 单体 · 1–4 | 0 | 10%/—/1200 | `bf_yihun` 100% 2 | — | 纯控制绝招（Boss 受 `bf_shouling` 免疫） |
| 催眠 `mv_yihun_cuimian` | 8 | 单体 · 1–3 | 0 | 8%/3/1000 | `bf_hunshui` 60% 2 | — | 纯控制 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yihun_shemu` | 摄目 | 1 | stat | Z0 | [0.04, 0.10] | 对定力 `wil` 低于自身的目标，本武学效果命中 +{v} |
| `ps_yihun_xinjing` | 心镜 | 3 | mechanic | — | — | 免疫品阶 ≤ 自身的 `bf_mihuo`、`bf_hunshui` |
| `ps_yihun_kezhi` | 克摄心 | 5 | stat | Z0 | +10% | 对装配心神类杂学的敌人，本武学效果命中 +10% |
| `ps_yihun_dacheng` | 移魂大成 | 10 | mechanic | — | 30%→15% | 本武学施加的 `bf_yihun` 受伤解除概率由 30% 降为 15% |

### 7.4 地阶条目卡

#### `sk_jiuyinbaigu` 九阴白骨爪（9 地上 · 拳脚/擒拿 · 九阴真经·邪练）

**代价与改修规则以 `design/05` §9.1.2 为准**（硬门槛 `morality ≤ −20` 或奇遇"误读真经"；邪练 `sxp ×1.5`、每升 1 重 `morality −5`、升层走火 8%；装配即持 `bf_xielian`；本武学无视外防 15%→30%、对 `hp < 50%` 目标暴击 +15；改修为九阴神爪）。本文补齐招式与图鉴字段；表现上不渲染血腥（05 同条）。

| 字段 | 值 |
|---|---|
| 出处 | 射雕：黑风双煞误读真经而练成，梅超风以之成名，杨康亦从其习（原著）；倚天：周芷若以藏经速成之法习之（原著） |
| origin / lineage | `canon` / 陈玄风、梅超风 → 杨康；周芷若（倚天） |
| sourceChapters | `ch02_shediao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `yin` · 0.55/0.45 · 4 |
| reqs | `attrs {agi 45, str 40}`；`aptitude {apGrapple 45}`；`morality {max: −20}`；`hard [morality]`（奇遇途径以 `reqsOverride {morality: null}` 放开，习得即扣 `morality −10`） |
| layerStats | `crit [3, 9]`、`hit [1, 6]`（合计 15） |
| 层数要点 | 1：阴风爪、鬼影抓、邪练、邪气、穿骨 ｜ 3：五指锁魂 ｜ 5：白骨阴风、夺命 ｜ **7：绝招 索命** ｜ 8：鬼魅绕身 ｜ 10：白骨大成 |
| setTags / conflicts | `set_heifeng_shuangsha` / `{with: sk_jiuyinshenzhao, type: exclusive}` |
| special / observable | `{evilTraining: {sxpMult: 1.5, moralityPerLayer: −5, zouhuoOnLayerUp: {chance: 0.08, level: 1}}, reformTo: sk_jiuyinshenzhao, fusible: false}`（05 §9.1.2）/ `true` |
| 获取 | 射雕 `master npc_meichaofeng` `maxLayer 10`（投其门下）、`qiyu q_02_side_9x`（"误读真经"，原创扩展）`maxLayer 8`；倚天 `manual it_miji_jiuyinbaigu_su`（倚天剑藏经速成篇，周芷若线）`maxLayer 10`；`observe` 6 |
| 图鉴文本 | 黑风双煞误读《九阴真经》而练成的阴毒爪功，出手迅捷狠辣（射雕）；倚天中周芷若亦以速成之法习之（原著）。本作以"邪练"代价实现，不渲染血腥。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 阴风爪 `mv_jiuyinbaigu_yinfeng` | 1 | 单体 · 1 | 0.95 | 7%/0/1000 | `bf_liuxue` 40% | 可 | 1−0.04 |
| 鬼影抓 `mv_jiuyinbaigu_guiying` | 1 | `aoe_dash n3` · 1–3 | 1.00 | 7%/1/1000 | 突进 | 可 | 1.12−0.10 |
| 五指锁魂 `mv_jiuyinbaigu_suohun` | 3 | 单体 · 1（5 段） | 1.20 | 8%/2/1000 | `bf_liuxue` 60%；`bf_neishang` 40% | 可 | 1.29−0.06−0.04 |
| 白骨阴风 `mv_jiuyinbaigu_yinfengsao` | 5 | `aoe_sweep` | 0.95 | 8%/2/1000 | `bf_hanqi` 40% | 可 | 0.75×1.29−0.04 |
| **索命** `mv_jiuyinbaigu_suoming`（绝招，原创扩展命名） | 7 | 单体 · 1（5 段） | 2.80 | 9%/—/1200 | `bf_liuxue` 100%；`bf_neishang` 100% | 可 | 3.00−0.10−0.10 |
| 鬼魅绕身 `mv_jiuyinbaigu_guimei` | 8 | `aoe_behind` · 1–2 | 1.00 | 8%/2/1000 | 绕背 | 可 | 0.90×1.29−0.15 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_jiuyinbaigu_xielian` | 邪练 | 1 | mechanic | — | — | 05 §9.1.2 邪练规则（见 `special.evilTraining`） |
| `ps_jiuyinbaigu_xieqi` | 邪气 | 1 | mechanic | — | — | 装配即持 `bf_xielian`（06 §8.9），卸下即消失 |
| `ps_jiuyinbaigu_chuangu` | 穿骨 | 1 | stat | Z2 | [0.15, 0.30] | 本武学无视目标外功防御 {v}（05 收益） |
| `ps_jiuyinbaigu_duoming` | 夺命 | 5 | stat | Z0 | +15 | 对气血 < 50% 的目标，本武学暴击 +15（05 收益） |
| `ps_jiuyinbaigu_dacheng` | 白骨大成 | 10 | trigger | — | 0.30 | 本武学命中带 `bleed` 标签效果的目标时，30% 施加 `bf_kongju` 1 回合 |

#### `sk_cuixinzhang` 摧心掌（9 地上 · 拳脚/拳掌 · 九阴真经·邪练）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：黑风双煞所使阴毒掌力，中掌者外表不见伤痕而内里心脉已碎（原著，细节待考）；招名原创扩展 |
| origin / lineage | `canon` / 陈玄风、梅超风 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.35/0.65 · 4 |
| reqs | `attrs {str 45, con 45}`；`aptitude {apFist 50}`；`morality {max: −20}`（软，05 §7.3 邪派地阶）；`hard []` |
| layerStats | `crit [2, 7]`、`pierce [2, 8]`（合计 15） |
| 层数要点 | 1：摧心、阴劲透体、外表无伤 ｜ 3：碎脉 ｜ 4：心脉受创 ｜ 5：断魂掌 ｜ **7：绝招 摧心裂脉** ｜ 8：无痕、阴劲 ｜ 10：摧心大成 |
| setTags / conflicts | `set_heifeng_shuangsha` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_meichaofeng` `maxLayer 10`；`qiyu q_02_side_9x`（误读真经）`maxLayer 8`；`observe` 6 |
| 图鉴文本 | 黑风双煞所使阴毒掌力，中掌者外表不见伤痕，内里心脉已碎（原著）。本作以内伤层数实现其"摧心"之意。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 摧心 `mv_cuixinzhang_cuixin` | 1 | 单体 · 1 | 1.05 | 7%/1/1000 | `bf_neishang` 60% | 可 | 1.12−0.06 |
| 阴劲透体 `mv_cuixinzhang_touti` | 1 | 单体 · 1 | 0.95 | 7%/0/1000 | `ignoreDef {in: 0.20}` | 可 | 1−0.05 |
| 碎脉 `mv_cuixinzhang_suimai` | 3 | 单体 · 1 | 1.10 | 8%/2/1000 | `bf_neishang` 100%（2 层） | 可 | 1.29−0.20 |
| 断魂掌 `mv_cuixinzhang_duanhun` | 5 | `aoe_line n2` | 1.05 | 8%/2/1000 | `bf_neishang` 50% | 可 | 0.85×1.29−0.05 |
| **摧心裂脉** `mv_cuixinzhang_liemai`（绝招，原创扩展命名） | 7 | 单体 · 1 | 2.60 | 9%/—/1200 | `bf_neishang` 100%（3 层）；`bf_nanyu` 100% | 可 | 3.00−0.30−0.10 |
| 无痕 `mv_cuixinzhang_wuhen` | 8 | 单体 · 1；`condition {targetHpBelow: 0.3}` | 1.70 | 8%/3/1000 | — | 可 | 1+0.36+0.05+0.30 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_cuixinzhang_wushang` | 外表无伤 | 1 | stat | settle | [0.20, 0.40] | 本武学伤害中 {v} 无视护体真气 |
| `ps_cuixinzhang_xinmai` | 心脉受创 | 4 | stat | Z3 | [0.06, 0.12] | 对带 `injury` 标签效果的目标 +{v} |
| `ps_cuixinzhang_yinjin` | 阴劲 | 8 | effect | — | +1 层 | 本武学每次施加 `bf_neishang` 额外 +1 层 |
| `ps_cuixinzhang_dacheng` | 摧心大成 | 10 | trigger | — | — | 目标 `bf_neishang` 达 10 层时，自身获得 `bf_bibao` ×1 |

#### `sk_dafumoquan` 大伏魔拳（9 地上 · 拳脚/拳掌 · 九阴真经）

| 字段 | 值 |
|---|---|
| 出处 | 《九阴真经》下卷所载拳法，郭靖习之（原著载其名，交手细节待考）；招名与效果为原创扩展 |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.60/0.40 · 4 |
| reqs | `attrs {str 50, con 45}`；`aptitude {apFist 50}`；`prereq [{sk_jiuyin, 3}]`；`morality {min 10}`；`hard [prereq, morality]` |
| layerStats | `parry [2, 8]`、`tough [2, 7]`（合计 15） |
| 层数要点 | 1：镇魔拳、伏虎式、正气 ｜ 3：破邪 ｜ 4：刚猛 ｜ 5：伏魔连环 ｜ **7：绝招 大伏魔** ｜ 8：降魔护法、伏魔 ｜ 10：伏魔大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷）`maxLayer 10`；神雕 `master npc_guojing` `maxLayer 10`；`observe` 6 |
| 图鉴文本 | 《九阴真经》下卷所载的刚猛拳法，拳势堂皇，专克邪魔（原著载其名）。招名与效果为原创扩展。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 镇魔拳 `mv_dafumoquan_zhenmo` | 1 | 单体 · 1 | 1.00 | 7%/0/1000 | `bf_zhenshe` 20% | 可 | 1−0.02 |
| 伏虎式 `mv_dafumoquan_fuhu` | 1 | 单体 · 1 | 1.05 | 7%/1/1000 | 击退 1 | 可 | 1.12−0.05 |
| 破邪 `mv_dafumoquan_poxie` | 3 | 单体 · 1；`condition {targetMoralityMax: −20}` | 1.40 | 8%/2/1000 | `bf_xuruo` 50% | 可 | (1+0.24+0.05+0.15)−0.05 |
| 伏魔连环 `mv_dafumoquan_lianhuan` | 5 | 单体 · 1（3 段） | 1.30 | 8%/2/1000 | — | 可 | 1.29 |
| **大伏魔** `mv_dafumoquan_dafumo`（绝招） | 7 | `aoe_around` | 1.80 | 9%/—/1200 | `bf_zhenshe` 100%；击退 1 | 可 | 3.00×0.65−0.10−0.05 |
| 降魔护法 `mv_dafumoquan_hufa` | 8 | 自身架势 | 0 | 6%/3/850 | 自身 `bf_shoushi` 2、`bf_fanzhen` 2 | — | 架势招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_dafumoquan_zhengqi` | 正气 | 1 | stat | Z3 | [0.05, 0.12] | 对 `morality ≤ −20` 的目标 +{v} |
| `ps_dafumoquan_gangmeng` | 刚猛 | 4 | stat | Z2 | [0.05, 0.10] | 本武学无视目标外功防御 {v} |
| `ps_dafumoquan_fumo` | 伏魔 | 8 | mechanic | — | — | 免疫品阶 ≤ 自身的 `bf_kongju` |
| `ps_dafumoquan_dacheng` | 伏魔大成 | 10 | trigger | — | 0.10 | `onKill`：自身回复 10% `hpMax` |

#### `sk_yijinduangupian` 易筋锻骨篇（8 地中 · 内功 · 九阴真经）

| 字段 | 值 |
|---|---|
| 出处 | 《九阴真经》所载锻炼筋骨之篇，郭靖、黄蓉曾依之修习（原著名目，细节待考）；与少林《易筋经》（`sk_yijinjing`）名近而实异。内功数值为原创扩展 |
| origin / lineage | `canonExpanded` / 九阴真经 → 郭靖、黄蓉 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1 · 4 |
| inner | `contribution {mpMaxPct 24, hpMaxPct 22, attrs {con 7, agi 5, str 3}, mpRegen 1.6, stats {resInjury 10, tough 5}}`（IP 84，预算 83 ±5%） |
| reqs | `attrs {con 45, wil 40}`；`aptitude {apInner 45}`；`hard []` |
| 层数要点 | 1：筋骨 ｜ 3：伐骨 ｜ 4：锻体 ｜ 5：易筋 ｜ **7：绝招 脱胎换骨**、换形 ｜ 8：缩骨 ｜ 10：锻骨大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经上卷）`maxLayer 10`；神雕 `qiyu q_03_qiyu_9x`（古墓石刻）`maxLayer 8`、`master npc_guojing` `maxLayer 10` |
| 图鉴文本 | 《九阴真经》所载锻炼筋骨之法，易筋伐髓，使身躯坚韧、身法轻捷（原著名目）。与少林易筋经名近而实异；内功数值为原创扩展。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 伐骨 `mv_yijinduangupian_fagu` | 3 | 自身 | 0 | 6%/3/900 | 自身 `bf_renjin` 3、`bf_jiangu` 2 | — | 支援 |
| 易筋 `mv_yijinduangupian_yijin` | 5 | 自身 | 0 | 8%/3/1000 | 驱散自身 `injury` 2 个；回复 12% `hpMax` | — | 支援 |
| **脱胎换骨** `mv_yijinduangupian_tuotai`（绝招，原创扩展命名） | 7 | 自身 | 0 | 9%/—/1200 | 自身 `bf_mian_shang` 2、`bf_mian_kong` 1；回复 25% `hpMax` | — | 支援绝招 |
| 缩骨 `mv_yijinduangupian_suogu` | 8 | 自身 | 0 | 6%/3/800 | 驱散自身 `cc.bind`、`cc.root` 各 1 个；自身 `bf_jixing` 1 | — | 支援 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yijinduangupian_jingu` | 筋骨 | 1 | stat | — | [4, 10] pp | `resCC` +{v}（`auxMode scaled`） |
| `ps_yijinduangupian_duanti` | 锻体 | 4 | mechanic | — | ≤ +5 | 4 重起每升 1 重，先天 `con` 或 `agi`（交替）永久 +1，全游戏合计至多 +5（受 120 上限） |
| `ps_yijinduangupian_huanxing` | 换形 | 7 | stat | — | [0.03, 0.06] | `spd` pct +{v}（`auxMode scaled`） |
| `ps_yijinduangupian_dacheng` | 锻骨大成 | 10 | mechanic | — | ×0.5 | 主运时自身所受 `bf_gushang`、`bf_huagu` 持续减半 |

#### `sk_shexinglifan` 蛇行狸翻（7 地下 · 轻功 · 九阴真经）

| 字段 | 值 |
|---|---|
| 出处 | 《九阴真经》所载近身腾挪之术，如蛇之游、如狸之翻（原著名目，使用场景待考）；招名原创扩展 |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature / moveSlots | `neutral` / 4；轻功值 `QS(7) = 92`（03 §4.5） |
| reqs | `attrs {agi 45}`；`aptitude {apLight 40}`；`prereq [{sk_jiuyin, 2}]`；`hard [prereq]` |
| layerStats | `eva [2, 8]`、`tough [1, 7]`（合计 15） |
| 层数要点 | 1：蛇行、软骨 ｜ 3：狸翻 ｜ 4：近身腾挪 ｜ 5：贴地游身 ｜ **7：绝招 蛇行百变** ｜ 10：百变 |
| setTags / conflicts | `set_jiuyin_zhengzong` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷）`maxLayer 10`；神雕 `master npc_guojing` `maxLayer 8`；`observe` 6 |
| 图鉴文本 | 《九阴真经》所载近身腾挪之术，游身如蛇、翻身如狸，贴着敌人转折闪避（原著名目）。招式效果为原创设计。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 蛇行 `mv_shexinglifan_shexing` | 1 | 自身架势 | 0 | 5%/2/800 | 自身 `bf_youshi` 3 | — | 架势招式 |
| 狸翻 `mv_shexinglifan_lifan` | 3 | 相邻敌人身后格 · 1 | 0 | 5%/2/800 | 自身位移至目标身后（`displacement: behind`，不出招） | — | 功能招式 |
| 贴地游身 `mv_shexinglifan_tiedi` | 5 | 自身 | 0 | 6%/3/900 | 自身 `bf_piaohu` 2、`bf_shenqing` 1 | — | 支援 |
| **蛇行百变** `mv_shexinglifan_baibian`（绝招，原创扩展命名） | 7 | 自身 | 0 | 9%/—/1200 | 自身 `bf_canying` 2 层、`bf_jixing` 2 | — | 支援绝招 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_shexinglifan_ruangu` | 软骨 | 1 | stat | — | [0.03, 0.08] | `eva` +{v} |
| `ps_shexinglifan_tengnuo` | 近身腾挪 | 4 | mechanic | — | — | 与敌相邻时移动不触发对方 `bf_jieji` 截击 |
| `ps_shexinglifan_dacheng` | 百变 | 10 | mechanic | Z7 | — | 每次闪避成功后，自身下一招按侧击结算方位 |

#### `sk_baimangbianfa` 白蟒鞭法（7 地下 · 兵器/鞭索 · 九阴真经·邪练）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：梅超风双目失明后以长鞭与九阴白骨爪相济，听风辨位（原著；"白蟒鞭"之名**待考**）；倚天：周芷若亦使长鞭（待考）。招名与效果为原创扩展 |
| origin / lineage | `canonExpanded` / 梅超风；周芷若（倚天） |
| sourceChapters | `ch02_shediao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `yin` · 0.60/0.40 · 4 |
| weaponReq | `{category: whip}` |
| reqs | `attrs {agi 40, str 35}`；`aptitude {apWhip 40}`；`hard []` |
| layerStats | `hit [2, 8]`、`parry [1, 7]`（合计 15） |
| 层数要点 | 1：白蟒出洞、长鞭卷地、听风 ｜ 3：缠身 ｜ 5：回鞭、蟒缠 ｜ **7：绝招 白蟒翻江** ｜ 8：鞭爪相济 ｜ 10：白蟒大成 |
| setTags / conflicts | `set_heifeng_shuangsha` / `{with: sk_jiuyinbaigu, type: synergy}`（见"鞭爪相济"） |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_meichaofeng` `maxLayer 10`；倚天 `manual it_miji_baimangbianfa_su`（藏经速成篇，原创扩展推定）`maxLayer 8`；`observe` 6 |
| 图鉴文本 | 梅超风所使长鞭功夫，鞭长丈余，与九阴白骨爪相济，远则鞭缠、近则爪取（射雕，鞭名待考）；倚天周芷若亦使长鞭。招名与效果为原创扩展。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 白蟒出洞 `mv_baimangbianfa_chudong` | 1 | 单体 · 1–3 · 近身 | 1.00 | 7%/0/1000 | — | 可 | 1.00 |
| 长鞭卷地 `mv_baimangbianfa_juandi` | 1 | `aoe_sweep` | 0.80 | 7%/1/1000 | `bf_panshan` 50% | 可 | 0.75×1.12−0.05 |
| 缠身 `mv_baimangbianfa_chanshen` | 3 | 单体 · 1–3 | 1.00 | 8%/2/1000 | `bf_chanrao` 60% 2 | 可 | 1.29−0.30 |
| 回鞭 `mv_baimangbianfa_huibian` | 5 | `aoe_pull n2` · 1–3 | 1.15 | 8%/2/1000 | 拉拽 2 | 可 | 0.95×1.29−0.10 |
| **白蟒翻江** `mv_baimangbianfa_fanjiang`（绝招，原创扩展命名） | 7 | `aoe_line n4` · 1–4 | 2.15 | 9%/—/1200 | `bf_chanrao` 50% 1 | 可 | 3.00×0.75−0.125 |
| 鞭爪相济 `mv_baimangbianfa_bianzhao` | 8 | 单体 · 1–3；`condition {equipped: sk_jiuyinbaigu}` | 1.40 | 8%/2/1000 | `bf_liuxue` 50% | 可 | (1+0.24+0.05+0.15)−0.05 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_baimangbianfa_tingfeng` | 听风 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_tingfeng`（`dur 99`，品阶 inherit）——梅超风目盲后听风辨位（原著） |
| `ps_baimangbianfa_manchan` | 蟒缠 | 5 | stat | Z3 | 0.10 | 对带 `cc.bind`（缠绕）的目标，本武学 +10% |
| `ps_baimangbianfa_dacheng` | 白蟒大成 | 10 | trigger | — | — | 本武学缠绕的目标被本方其他单位命中时（每回合 1 次），自身获得 `bf_zhuiji` 1 回合 |

### 7.5 玄阶紧凑卡

**`sk_jiuyinliaoshangpian` 九阴疗伤篇**（6 玄上 · 杂学/医 · 中性 · 栏 3）｜原著：郭靖受伤后与黄蓉在牛家村密室依《九阴真经》所载之法疗伤七日七夜（射雕，细节待考）｜reqs：`attrs {wis 40, wil 35}`、`prereq [{sk_jiuyin, 1}]`（硬）｜强度技艺 `med`｜layerStats：`healPower [2,6]`、`resInjury [1,4]`｜setTags：`set_jiuyin_zhengzong`｜获取：射雕 `qiyu q_02_main_9x`（牛家村密室事件）`maxLayer 10`；神雕 `master npc_guojing` / `npc_huangrong` `maxLayer 8`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 导气疗伤 `mv_jiuyinliaoshangpian_daoqi` | 1 | 单体友方·0–1 | 0 | 7%/2/1000 | 回复 18% `hpMax`；驱散 `injury` 1 个 | — | 标准治疗 |
| 掌心相抵 `mv_jiuyinliaoshangpian_xiangdi` | 4 | 单体友方·1 | 0 | 8%/3/1000 | 目标 `bf_huichun` 3、`bf_huoluo` 2 | — | 支援 |
| 闭气护脉 `mv_jiuyinliaoshangpian_biqi` | 7 | 单体友方·0–1 | 0 | 7%/3/1000 | 目标 `bf_guben` 3；驱散 `poison` 1 个 | — | 支援 |

被动：`ps_jiuyinliaoshangpian_qiri` 七日七夜（1，mechanic：战斗外疗伤时内伤、骨伤、走火 2 级的治愈天数 −50%；有羁绊 ≥ 2 的同伴相助再 −25%，design/11 接口）；`ps_jiuyinliaoshangpian_dacheng` 疗伤大成（10，mechanic：导气疗伤额外施加 `bf_mian_shang` 1 回合——06 已登记"九阴真经·疗伤篇大成"为其来源）。

**`sk_tongshihenglian` 铜尸横练**（6 玄上 · 内功 · 阳 · 0/1 · 栏 3）｜**（原创扩展命名）**陈玄风号"铜尸"，周身坚硬、罩门在脐，郭靖幼时以匕首刺中其罩门（射雕，原著）｜reqs：`attrs {con 35, str 30}`、`morality {max: −10}`（软）｜contribution：`mpMaxPct 14, hpMaxPct 15, attrs {con 10}, mpRegen 1.6, stats {defOut 6, tough 4}`（IP 57）｜setTags：`set_heifeng_shuangsha`｜获取：射雕 `manual it_miji_tongshihenglian`（黑风双煞遗物）`maxLayer 10`；`pages`（4 页）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铜皮 `mv_tongshihenglian_tongpi` | 3 | 自身 | 0 | 6%/3/900 | 自身 `bf_waifang_sheng` 3 | — | 支援 |
| 硬桥硬马 `mv_tongshihenglian_yingqiao` | 6 | 自身 | 0 | 7%/3/900 | 自身 `bf_wenzhong` 2、`bf_fanzhen` 2 | — | 支援 |

被动：`ps_tongshihenglian_tongshi` 铜尸（1，mechanic：主运时获得伴生的 `bf_zhaomen`（罩门，06 §8.9），同时受到外功伤害 −[5%, 12%]（Z4，`auxMode scaled`））；`ps_tongshihenglian_dacheng` 铜尸大成（10，mechanic：罩门被击中时的 Z3 +50% 降为 +25%）。

---

## 8. 铁掌帮 `sect_tiezhangbang`

### 8.1 门派简介

- **时代**：射雕时湖南铁掌峰铁掌帮原为上官剑南统领的抗金义旅，上官剑南将《武穆遗书》秘藏于峰上；至裘千仞继任帮主，帮众渐与金国勾结（原著）。裘千仞铁掌与轻功并称"铁掌水上飘"，其孪生兄裘千丈冒名招摇，妹裘千尺嫁绝情谷公孙止（原著）。神雕时裘千仞悔悟出家，为一灯弟子，法名慈恩；裘千尺困居绝情谷地底，以口吐枣核为暗器（原著；其武学 `sk_zaoheding` 归道家/绝情谷图鉴）。
- **强弱**：射雕 强（裘千仞近乎五绝）／神雕 残存（慈恩、裘千尺）。不在中武/低武书界出现。
- **风格**：刚猛掌力、踏水轻功；阳。
- **加入**：射雕"邪派/卧底线"（投效裘千仞，或受丐帮/郭黄之托潜入铁掌峰，原创扩展路线），`rank` 1–4。
- **进阶链**：黑砂掌（黄中）→ 铁掌心法（玄中）→ 铁掌功（天下）；铁掌刀法（黄上）为帮众兵器入门。与杨家枪/将门组的《武穆遗书》同在铁掌峰事件链（§10）。

### 8.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_tiezhang` | 铁掌功 | 拳脚/拳掌 | 10 天下 | 阳 | 0.55/0.45 | 射雕 | 裘千仞（四级）；中指峰遗谱 | 原著 |
| `sk_shuishangpiao` | 水上飘 | 轻功 | 9 地上 | 中性 | — | 射雕、神雕 | 裘千仞；神雕慈恩 | 原著（"铁掌水上飘"） |
| `sk_tiezhangxinfa` | 铁掌心法 | 内功 | 5 玄中 | 阳 | 0/1 | 射雕、神雕 | 铁掌帮二级；神雕遗谱 | 原创扩展 |
| `sk_tiezhangdaofa` | 铁掌刀法 | 兵器/刀 | 3 黄上 | 阳 | 0.85/0.15 | 射雕 | 入帮 | 原创扩展 |
| `sk_heishazhang` | 黑砂掌 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 射雕 | 入帮 | 原创扩展 |

> 裘千尺的枣核钉由道家与神雕诸派图鉴（绝情谷）定义为 `sk_zaoheding`（玄上，暗器），本文不再另立，只作为铁掌套装的跨图鉴成员引用。

### 8.3 天阶条目卡

#### `sk_tiezhang` 铁掌功（10 天下 · 拳脚/拳掌 · 铁掌帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：铁掌帮镇帮绝学，裘千仞凭之号"铁掌水上飘"，掌力雄浑、中者内伤极重，黄蓉中其掌后须一灯以一阳指救治（原著，细节待考）；招名原创扩展 |
| origin / lineage | `canon` / 上官剑南 → 裘千仞 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.55/0.45 · 5 |
| reqs | `attrs {str 55, con 50}`；`aptitude {apFist 55}`；`prereq [{sk_tiezhangxinfa, 5}]`；`sect {sect_tiezhangbang, rank 4}`；`hard [sect, prereq]` |
| layerStats | `crit [4, 12]`、`pierce [2, 8]`（合计 20） |
| 层数要点 | 1：铁掌开山、排云推月、铁掌 ｜ 2：掌断金石 ｜ 3：掌力雄浑 ｜ 4：铁掌震岳 ｜ 5：掌劲透骨、掌伤 ｜ **7：绝招 铁掌擎天** ｜ 8：铁掌护身、刚猛 ｜ 9：铁掌连环 ｜ 10：铁掌大成 |
| setTags / conflicts | `set_tiezhang_shuishangpiao` / 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 射雕 `master npc_qiuqianren` `maxLayer 10`（帮中四级或卧底线）；`qiyu q_02_side_9x`（中指峰上官剑南遗谱，原创扩展）`maxLayer 8` |
| 图鉴文本 | 铁掌帮镇帮绝学，裘千仞凭之号"铁掌水上飘"，掌力雄浑，中者内伤极重——黄蓉中掌后须一灯以一阳指救治（射雕，原著）。招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铁掌开山 `mv_tiezhang_kaishan` | 1 | 单体 · 1 | 1.15 | 8%/1/1100 | `bf_neishang` 50% | 可 | (1+0.12+0.07)−0.05 |
| 排云推月 `mv_tiezhang_paiyun` | 1 | `aoe_line n2` | 0.90 | 8%/1/1000 | 击退 1 | 可 | 0.85×1.12−0.05 |
| 掌断金石 `mv_tiezhang_duanjin` | 2 | 单体 · 1；`condition {targetHasTag: [guard, stance]}` | 1.35 | 9%/2/1000 | `bf_pojia` 100% | 可 | (1+0.24+0.05+0.15)−0.10 |
| 铁掌震岳 `mv_tiezhang_zhenyue` | 4 | `aoe_around` | 0.90 | 10%/3/1000 | `bf_zhenshe` 50% | 可 | 0.65×1.46−0.05 |
| 掌劲透骨 `mv_tiezhang_tougu` | 5 | 单体 · 1 | 1.20 | 9%/2/1000 | `ignoreDef {out: 0.20}`；`bf_gushang` 30% | 可 | 1.29−0.05−0.03 |
| **铁掌擎天** `mv_tiezhang_qingtian`（绝招，原创扩展命名） | 7 | 单体 · 1 | 2.70 | 10%/—/1200 | 击退 2；`bf_neishang` 100%（2 层） | 可 | 3.00−0.10−0.20 |
| 铁掌护身 `mv_tiezhang_hushen` | 8 | 自身架势 | 0 | 6%/2/850 | 自身 `bf_shoushi` 2；`stanceCounter {counterPower 1.0, applyBuff: bf_neishang}` | — | 架势招式 |
| 铁掌连环 `mv_tiezhang_lianhuan` | 9 | 单体 · 1（3 段） | 1.35 | 10%/2/1000 | — | 可 | 1+0.24+0.10 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_tiezhang_tiezhang` | 铁掌 | 1 | stat | Z2 | [0.08, 0.18] | 本武学无视目标外功防御 {v} |
| `ps_tiezhang_zhangli` | 掌力雄浑 | 3 | stat | Z6 | [10, 25] pp | 本武学暴击伤害 +{v} |
| `ps_tiezhang_zhangshang` | 掌伤 | 5 | trigger | — | 0.20 | `onHit`：20% 使目标 `bf_neishang` 额外 +1 层 |
| `ps_tiezhang_gangmeng` | 刚猛 | 8 | stat | Z3 | 0.10 | 对带 `injury` 标签效果的目标 +10% |
| `ps_tiezhang_dacheng` | 铁掌大成 | 10 | mechanic | — | +1 | 本武学所致 `bf_neishang` 被"运/医/药"驱散时难度 +1（视为品阶 +1）——致敬黄蓉中掌须一灯亲治 |

### 8.4 地阶条目卡

#### `sk_shuishangpiao` 水上飘（9 地上 · 轻功 · 铁掌帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：裘千仞绝顶轻功，能踏水而行，与铁掌并称"铁掌水上飘"；其兄裘千丈冒名，暗置木桩于水中欺人（原著）。神雕慈恩仍有此能（待考）。招式效果为原创设计 |
| origin / lineage | `canon` / 裘千仞 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature / moveSlots | `neutral` / 4；轻功值 `QS(9) = 120`——射雕/神雕最高原生轻功（地上）候选，满足 03 D-03 / 05 §14.6 第 7 条的假设 |
| reqs | `attrs {agi 50}`；`aptitude {apLight 45}`；`sect {sect_tiezhangbang, rank 4}`；`hard [sect]` |
| layerStats | `eva [2, 8]`、`tough [1, 7]`（合计 15） |
| 层数要点 | 1：踏浪、踏水 ｜ 3：浪里穿行 ｜ 4：身轻 ｜ 5：水上飘身 ｜ 6：真假水上飘 ｜ **7：绝招 踏水无痕** ｜ 8：借力回旋 ｜ 10：水上飘大成 |
| setTags / conflicts | `set_tiezhang_shuishangpiao` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_qiuqianren` `maxLayer 10`；神雕 `master npc_cien`（慈恩，一灯门下）`maxLayer 8`；`observe` 6 |
| 图鉴文本 | 裘千仞绝顶轻功，能踏水而行，与铁掌并称"铁掌水上飘"（原著）；其兄裘千丈冒名招摇，暗置木桩于水中欺人（原著）。招式效果为原创设计。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 踏浪 `mv_shuishangpiao_talang` | 1 | 自身 | 0 | 6%/3/900 | 自身 `bf_shenqing` 2、`bf_jixing` 2 | — | 支援 |
| 浪里穿行 `mv_shuishangpiao_chuanxing` | 3 | `aoe_dash n5, through` · 1–5 | 0.95 | 8%/2/1000 | 突进（可越水面） | 可 | 0.80×1.29−0.10 |
| 水上飘身 `mv_shuishangpiao_piaoshen` | 5 | 自身 | 0 | 5%/2/800 | 自身 `bf_piaohu` 3 | — | 支援 |
| **踏水无痕** `mv_shuishangpiao_wuhen`（绝招，原创扩展命名） | 7 | 自身 | 0 | 9%/—/1200 | 自身 `bf_canying` 2 层、`bf_dunzou` 2 | — | 支援绝招 |
| 借力回旋 `mv_shuishangpiao_jieli` | 8 | 单体 · 1 · 近身 | 1.00 | 7%/1/1000 | 出招后后撤 2（`displacement: retreat`） | 可 | 1.12−0.10 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_shuishangpiao_tashui` | 踏水 | 1 | mechanic | — | — | 战斗中浅水/深水格视为平地（不落水、不减速）；探索门禁仍按 `qinggong`（design/08） |
| `ps_shuishangpiao_shenqing` | 身轻 | 4 | stat | — | +1 | `jump` +1 |
| `ps_shuishangpiao_zhenjia` | 真假水上飘 | 6 | mechanic | — | — | 自动识破水域中的伪装地形与陷阱（致敬裘千丈木桩之事，原创扩展） |
| `ps_shuishangpiao_dacheng` | 水上飘大成 | 10 | mechanic | Z7 | — | 身处水域地形时 `eva` +10%，自身招式按"高处"结算方位 |

### 8.5 玄/黄阶紧凑卡

**`sk_tiezhangxinfa` 铁掌心法**（5 玄中 · 内功 · 阳 · 0/1 · 栏 3）｜**（原创扩展）**铁掌帮练掌前的运劲心法｜reqs：`attrs {str 30, con 30}`、`aptitude {apInner 25}`、`prereq [{sk_heishazhang, 4}]`、`sect {sect_tiezhangbang, rank 2}`（硬：sect、prereq）｜contribution：`mpMaxPct 18, hpMaxPct 10, attrs {str 7}, mpRegen 1.4, stats {resInjury 5, resCC 5}`（IP 49）｜setTags：`set_tiezhang_shuishangpiao`｜获取：射雕 `master`（铁掌帮长老）`maxLayer 10`；神雕 `manual it_miji_tiezhangxinfa` `maxLayer 8`

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 运掌 `mv_tiezhangxinfa_yunzhang` | 3 | 自身 | 0 | 6%/3/900 | 自身 `bf_waigong_sheng` 2 | — | 支援 |
| 铁骨 `mv_tiezhangxinfa_tiegu` | 6 | 自身 | 0 | 6%/3/900 | 自身 `bf_waifang_sheng` 2、`bf_guben` 2 | — | 支援 |

被动：`ps_tiezhangxinfa_yunjin` 运劲（1，stat Z3：拳掌类招式 +[2%, 5%]，`scope: category:unarmed`，`auxMode scaled`）；`ps_tiezhangxinfa_zhangshou` 掌收（5，effect：拳掌招式命中后回复 1% `mpMax`，每回合 1 次）；`ps_tiezhangxinfa_dacheng` 大成（10，mechanic：铁掌功修炼 +15%）。

**`sk_tiezhangdaofa` 铁掌刀法**（3 黄上 · 兵器/刀 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**铁掌帮帮众通行刀法｜reqs：无（入帮）｜layerStats：`hit [1,3]`、`crit [1,3]`｜获取：铁掌帮入帮；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 劈刀 `mv_tiezhangdaofa_pi` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 连环三刀 `mv_tiezhangdaofa_sandao` | 4 | 单体·1（3 段） | 1.30 | 6%/2/1000 | — | 可 | 1+0.24+0.05 |
| 横刀截江 `mv_tiezhangdaofa_jiejiang` | 7 | `aoe_sweep` | 0.90 | 6%/1/1000 | — | 可 | 0.75×1.17 |

被动：`ps_tiezhangdaofa_hanqi` 悍气（5，stat：`crit` +[2%, 4%]）；`ps_tiezhangdaofa_yuanman` 圆满（10，mechanic：首次练满 `apBlade` +1）。

**`sk_heishazhang` 黑砂掌**（2 黄中 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**铁掌帮入门掌法（与少林铁砂掌 `sk_tieshazhang` 无涉）｜reqs：无（入帮）｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`set_tiezhang_shuishangpiao`｜获取：铁掌帮入帮；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 黑砂掌 `mv_heishazhang_zhang` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 砂掌连击 `mv_heishazhang_lianji` | 4 | 单体·1（2 段） | 1.10 | 5%/1/1000 | — | 可 | 1.12 |
| 掌印 `mv_heishazhang_zhangyin` | 7 | 单体·1 | 1.25 | 6%/2/1000 | `bf_neishang` 30% | 可 | 1.29−0.03 |

被动：`ps_heishazhang_shazhang` 砂掌（5，stat Z2：无视外功防御 [2%, 4%]）；`ps_heishazhang_yuanman` 圆满（10，mechanic：首次练满 `apFist` +1；铁掌功资质软门槛 −10）。

---

## 9. 江南七怪 `sect_jiangnanqiguai`

### 9.1 简介

- **时代**：射雕开篇，江南七怪（飞天蝙蝠柯镇恶、妙手书生朱聪、马王神韩宝驹、南山樵子南希仁、笑弥陀张阿生、闹市侠隐全金发、越女剑韩小莹）在嘉兴醉仙楼与丘处机立约，各授一徒，十八年后比武；七怪远赴大漠授郭靖武艺，张阿生死于大漠荒山；后桃花岛惨案中朱聪、韩宝驹、南希仁、全金发、韩小莹遇害（欧阳锋、杨康所为而嫁祸黄药师），唯柯镇恶生还，神雕时随郭靖一家（原著）。
- **定位**：射雕前期的"入门师门"——武功杂而不精、各擅兵刃，全部为黄/玄阶，给新入射雕的玩家（从天龙带来 3/3/3 之外）一套可快速补齐装配栏的中坚武学；七人合斗（原著屡以多打少）体现为套装 `set_jiangnan_qiguai`。
- **加入**：射雕前期"拜七怪为师"开局或支线（`rank` 1–3）；桃花岛惨案后门派只余柯镇恶一人（`chapters/02` 处理传授窗口）。
- **进阶链**：南山掌法（黄中）→ 分筋错骨手（玄中）；秤锤打法（黄中）→ 听声杖法（玄中）；（地阶承接交由丐帮降龙、九阴系等郭靖路线）。

### 9.2 武学总表与紧凑卡

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_tingshengzhangfa` | 听声杖法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.75/0.25 | 射雕、神雕 | 柯镇恶 | 原创扩展命名（柯镇恶目盲、以铁杖为兵器为原著；杖法原名待考。"伏魔杖法"之名已由少林图鉴使用，故不取） |
| `sk_fenjincuogushou` | 分筋错骨手 | 拳脚/擒拿 | 5 玄中 | 阳 | 0.75/0.25 | 射雕、神雕 | 朱聪；神雕郭靖 | 原著（朱聪授郭靖） |
| `sk_yuenvjian02` | 越女剑法（韩小莹） | 兵器/剑 | 4 玄下 | 中性 | 0.80/0.20 | 射雕 | 韩小莹 | 原著；与序章 `sk_yuenvjian` 同名，依基准 §12 加书界序号 |
| `sk_jinlongbianfa` | 金龙鞭法 | 兵器/鞭索 | 4 玄下 | 阳 | 0.80/0.20 | 射雕 | 韩宝驹 | 原著（韩宝驹使金龙鞭；鞭法名待考） |
| `sk_duling` | 毒菱 | 暗器 | 4 玄下 | 中性 | 0.80/0.20 | 射雕、神雕 | 柯镇恶 | 原著（柯镇恶的毒菱） |
| `sk_nanshanzhangfa` | 南山掌法 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 射雕 | 南希仁 | 掌法名待考（原著无此名则为原创扩展命名） |
| `sk_chengchuidafa` | 秤锤打法 | 兵器/奇门 | 2 黄中 | 阳 | 0.85/0.15 | 射雕 | 全金发 | 原创扩展命名（全金发以秤为兵器，待考） |

**`sk_tingshengzhangfa` 听声杖法**（5 玄中 · 棍杖 · 栏 3）｜配柯镇恶铁杖 `eq_kezhenezhang`（design/10）｜reqs：`attrs {str 30, wil 25}`、`aptitude {apStaff 25}`、`prereq [{sk_chengchuidafa, 4}]`、`sect {sect_jiangnanqiguai, rank 2}`（硬：sect；prereq 为软——七怪互授，原创扩展）｜layerStats：`parry [1,5]`、`hit [1,5]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕/神雕 `master npc_kezhene` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铁杖击 `mv_tingshengzhangfa_zhangji` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 铁杖横扫 `mv_tingshengzhangfa_hengsao` | 3 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 盲杖辨位 `mv_tingshengzhangfa_tingsheng` | 5 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 1.0, expires: nextOwnAction}` | — | 架势招式 |
| 铁杖镇魔 `mv_tingshengzhangfa_zhenmo` | 7 | 单体·1–2 | 1.25 | 7%/2/1000 | `bf_xuanyun` 20% 1 | 可 | 1.29−0.05 |

被动：`ps_tingshengzhangfa_tingfeng` 听风辨器（1，trigger `battleStart`：自身 `bf_tingfeng`〔`dur 99`〕——柯镇恶目盲而以耳代目，原著）；`ps_tingshengzhangfa_gangzhi` 刚直（5，stat：`resMind` +[4, 8] pp）；`ps_tingshengzhangfa_dacheng` 大成（10，stat Z3：对带 `veil` 标签效果（隐身/残影）的目标 +10%）。

**`sk_fenjincuogushou` 分筋错骨手**（5 玄中 · 擒拿 · 栏 3）｜reqs：`attrs {agi 25, wis 25}`、`aptitude {apGrapple 25}`、`prereq [{sk_nanshanzhangfa, 4}]`（软）、`sect {sect_jiangnanqiguai, rank 2}`（硬）｜layerStats：`seal [1,5]`、`crit [1,5]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕 `master npc_zhucong` `maxLayer 10`；神雕 `master npc_guojing` `maxLayer 8`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 分筋 `mv_fenjincuogushou_fenjin` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengjingmai` 30% 1 | 可 | 1.12−0.06 |
| 错骨 `mv_fenjincuogushou_cuogu` | 3 | 单体·1 | 1.25 | 7%/2/1000 | `bf_gushang` 40% | 可 | 1.29−0.04 |
| 反关节 `mv_fenjincuogushou_fanguan` | 5 | 单体·1 | 1.05 | 6%/1/1000 | `bf_jiaoxie` 30%（targetArmed） | 可 | 1.12−0.06 |
| 卸骨 `mv_fenjincuogushou_xiegu` | 7 | 单体·1 | 1.25 | 7%/3/1000 | `bf_waigong_jiang` 100%；`bf_dingshen` 30% 1 | 可 | 1.41−0.10−0.075 |

被动：`ps_fenjincuogushou_rujie` 入节（1，stat：`seal` +[2, 5]）；`ps_fenjincuogushou_miaoshou` 妙手空空（5，mechanic：缴械成功时 30% 将目标兵器收入行囊（战后归还或缴获，design/10）——致敬朱聪，原创扩展）；`ps_fenjincuogushou_dacheng` 大成（10，stat Z3：对带 `bf_gushang` 的目标 +10%）。

**`sk_yuenvjian02` 越女剑法（韩小莹）**（4 玄下 · 剑 · 栏 3）｜reqs：`attrs {agi 30}`、`aptitude {apSword 25}`、`sect {sect_jiangnanqiguai, rank 1}`（硬）｜layerStats：`hit [1,5]`、`eva [1,5]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕 `master npc_hanxiaoying` `maxLayer 10`；`observe` 6｜说明：序章阿青之越女剑法 `sk_yuenvjian`（02 §1.2，暂定地上 9）为"剑源"；本条为射雕时代流传的残式，二者传承关系为原创扩展解读

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 越女穿林 `mv_yuenvjian02_chuanlin` | 1 | 单体·1 | 0.90 | 5%/0/900 | — | 可 | 1−0.05−0.07 |
| 快剑连刺 `mv_yuenvjian02_lianci` | 3 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 回身刺 `mv_yuenvjian02_huishen` | 5 | `aoe_behind`·1–2 | 0.95 | 6%/2/1000 | 绕背 | 可 | 0.90×1.24−0.15 |
| 剑影飘香 `mv_yuenvjian02_piaoxiang` | 7 | `aoe_sweep` | 0.85 | 6%/1/1000 | — | 可 | 0.75×1.12 |

被动：`ps_yuenvjian02_kuaijian` 快剑（1，stat：`combo` +[2, 5] pp）；`ps_yuenvjian02_jianyuan` 剑源余韵（5，mechanic：拥有 `sk_yuenvjian` 残篇时，本武学修炼 +20%、招式收招 −50，02 §5.4"剑源"的延伸，原创扩展）；`ps_yuenvjian02_dacheng` 大成（10，stat Z0：本武学暴击 +5）。

**`sk_jinlongbianfa` 金龙鞭法**（4 玄下 · 鞭索 · 栏 3）｜reqs：`attrs {agi 25, str 25}`、`aptitude {apWhip 25}`、`sect {sect_jiangnanqiguai, rank 1}`（硬）｜layerStats：`hit [1,5]`、`parry [1,5]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕 `master npc_hanbaoju` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 金龙出海 `mv_jinlongbianfa_chuhai` | 1 | 单体·1–3 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 卷鞭 `mv_jinlongbianfa_juan` | 3 | `aoe_pull n1`·1–3 | 0.95 | 6%/1/1000 | 拉拽 1 | 可 | 0.95×1.12−0.10 |
| 马上鞭 `mv_jinlongbianfa_mashang` | 5 | `aoe_dash n3, through`·1–3 | 0.95 | 7%/2/1000 | 突进（穿过） | 可 | 0.80×1.29−0.10 |
| 金龙缠腰 `mv_jinlongbianfa_chanyao` | 7 | 单体·1–3 | 1.30 | 7%/3/1000 | `bf_chanrao` 50% 1 | 可 | 1.41−0.125 |

被动：`ps_jinlongbianfa_mawang` 马王神（1，mechanic：探索中骑马移动速度 +10%，design/11 接口）；`ps_jinlongbianfa_changbian` 长鞭（5，stat Z3：对 3 格外目标 +6%）；`ps_jinlongbianfa_dacheng` 大成（10，stat：`hit` +5%）。

**`sk_duling` 毒菱**（4 玄下 · 暗器 · 栏 3）｜reqs：`attrs {agi 25}`、`aptitude {apHidden 25}`、`sect {sect_jiangnanqiguai, rank 2}`（硬）｜弹药：淬毒铁菱（design/10）｜layerStats：`hit [1,5]`、`effHit [1,5]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕/神雕 `master npc_kezhene` `maxLayer 10`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 飞菱 `mv_duling_feiling` | 1 | `aoe_bolt`·1–5·投射 | 0.90 | 6%/0/1000 | `bf_zhongdu` 30% | 可 | 0.92−0.03 |
| 连环毒菱 `mv_duling_lianhuan` | 4 | `aoe_bolt`·1–5（2 段） | 1.15 | 7%/2/1000 | `bf_zhongdu` 50% | 可 | 1.29×0.92−0.05 |
| 满天菱雨 `mv_duling_lingyu` | 7 | `aoe_multi n4, r1`·1–5 | 1.15（4 段） | 7%/3/1000 | `bf_zhongdu` 40% | 可 | 0.85×1.41−0.04 |

被动：`ps_duling_cuidu` 淬毒（1，stat：本武学所附 `bf_zhongdu` 施加率 +[0, 10] pp）；`ps_duling_tingsheng` 听声发菱（5，mechanic：攻击隐身或残影持有者时命中不受其影响（仅本武学））；`ps_duling_dacheng` 大成（10，mechanic：本武学命中已中毒目标时 `bf_zhongdu` +1 层）。

**`sk_nanshanzhangfa` 南山掌法**（2 黄中 · 拳掌 · 栏 3）｜reqs：无｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕 `master npc_nanxiren` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 樵夫担柴 `mv_nanshanzhangfa_danchai` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 南山推石 `mv_nanshanzhangfa_tuishi` | 4 | 单体·1 | 1.05 | 5%/1/1000 | 击退 1 | 可 | 1.12−0.05 |
| 沉稳三掌 `mv_nanshanzhangfa_sanzhang` | 7 | 单体·1（3 段） | 1.30 | 6%/2/1000 | — | 可 | 1.29 |

被动：`ps_nanshanzhangfa_chenwen` 沉稳（5，stat：`tough` +[2%, 4%]）；`ps_nanshanzhangfa_yuanman` 圆满（10，mechanic：首次练满 `apFist` +1）。

**`sk_chengchuidafa` 秤锤打法**（2 黄中 · 奇门 · 栏 3）｜weaponReq：`{category: exotic, kinds: [misc]}`（秤）｜reqs：无｜layerStats：`hit [1,3]`、`parry [1,3]`｜setTags：`set_jiangnan_qiguai`｜获取：射雕 `master npc_quanjinfa` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 秤锤飞击 `mv_chengchuidafa_feiji` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 秤杆点穴 `mv_chengchuidafa_dianxue` | 4 | 单体·1 | 1.10 | 5%/1/1000 | `bf_fengxue` 20% 1 | 可 | 1.12−0.04 |
| 锤杆并施 `mv_chengchuidafa_bingshi` | 7 | 单体·1（2 段） | 1.30 | 6%/2/1000 | — | 可 | 1.29 |

被动：`ps_chengchuidafa_jingsuan` 精打细算（5，stat cost：本武学耗内 −10%）；`ps_chengchuidafa_yuanman` 圆满（10，mechanic：首次练满 `apExotic` +1；交易议价 +3%，design/12 接口——闹市侠隐，原创扩展）。

---

## 10. 杨家枪与将门（传承 · `lineage: 杨家将`）

### 10.1 简介

- **源流**：射雕开篇，临安牛家村杨铁心为抗金名将杨再兴之后，以家传杨家枪法与丘处机过招（原著；"杨家枪传自杨家将"之说待考）；杨铁心化名穆易，携义女穆念慈比武招亲（原著）。岳飞遗著《武穆遗书》几经辗转：上官剑南藏于铁掌峰，郭靖得之，西征、守襄阳皆用其法；倚天时郭靖、黄蓉将其藏入屠龙刀中，张无忌取出赠与徐达（原著）。
- **扩展**：南宋杨妙真"二十年梨花枪，天下无敌手"为《宋史·李全传》所载史实，本作据此设梨花枪（原创扩展；杨妙真与杨家将并无血缘，明代兵书中的"杨家枪"多指杨妙真一脉的梨花枪（待考），本作借此把两门枪法并入"将门"一组，并让它们在碧血（明末军伍）延续）；六合枪为自宋至清军伍、镖局通行的枪法（原创扩展），承担中武/低武书界的枪法入门。
- **定位**：`sect: null`；本组唯一以"枪"为主的传承，并以《武穆遗书》承担"兵法/军阵"杂学。
- **进阶链**：六合枪（黄上）→ 杨家枪法（玄上）→ 梨花枪（地下）。

### 10.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_wumuyishu` | 武穆遗书 | 杂学/阵法（兵法） | 8 地中 | 中性 | — | 射雕、神雕、倚天 | 铁掌峰中指峰事件；郭靖襄阳线；屠龙刀藏书 | 原著 |
| `sk_lihuaqiang` | 梨花枪 | 兵器/枪 | 7 地下 | 阳 | 0.70/0.30 | 射雕、神雕、碧血 | 杨妙真（史实人物，原创扩展 NPC）；残谱；碧血明军旧部 | 原创扩展（据《宋史·李全传》；明代兵书以"杨家枪"称其枪法，待考） |
| `sk_yangjiaqiangfa` | 杨家枪法 | 兵器/枪 | 6 玄上 | 阳 | 0.75/0.25 | 射雕、神雕、碧血 | 杨铁心、穆念慈；杨铁心遗谱；碧血明军旧部 | 原著（射雕·杨铁心）；碧血延续为原创扩展 |
| `sk_liuheqiang` | 六合枪 | 兵器/枪 | 3 黄上 | 阳 | 0.85/0.15 | 射雕、神雕、倚天、碧血、鹿鼎、鸳鸯、书剑、飞狐 | 军营/镖局教头；残页 | 原创扩展（通行枪法） |

### 10.3 地阶条目卡

#### `sk_wumuyishu` 武穆遗书（8 地中 · 杂学/阵法 · 将门）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：岳飞遗下兵法，完颜洪烈觊觎，上官剑南藏于铁掌峰，终为郭靖所得；神雕：郭靖以之守襄阳；倚天：藏于屠龙刀中，张无忌取出赠徐达（原著，细节待考）。战斗效果为原创扩展 |
| origin / lineage | `canonExpanded` / 岳飞 → 上官剑南（藏）→ 郭靖 →（屠龙刀）→ 徐达 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature / moveSlots | `neutral` / 4 |
| reqs | `attrs {wis 55, cha 40}`；`hard []`（剧情途径；强度参考技艺 `formation`） |
| layerStats | `effHit [3, 9]`、`parry [1, 6]`（合计 15） |
| 层数要点 | 1：运筹、鱼鳞阵、兵法 ｜ 3：奇正相生 ｜ 4：阵法娴熟 ｜ 5：背嵬冲阵 ｜ **7：绝招 撼山易** ｜ 8：以逸待劳、精忠 ｜ 10：武穆大成 |
| setTags / conflicts | `set_guojing_xiazhe`、`set_yangjia_jiangmen` / 无 |
| special / observable | `{fusible: false}` / `false` |
| 获取 | 射雕 `qiyu q_02_main_9x`（铁掌峰中指峰，与郭靖共读，原创扩展）`maxLayer 10`；神雕 `master npc_guojing` `maxLayer 10`（襄阳守城线）；倚天 `qiyu q_04_main_9x`（屠龙刀藏书）`maxLayer 10` |
| 图鉴文本 | 岳飞遗下的兵法韬略，射雕中几经辗转为郭靖所得，后郭靖以之守襄阳；倚天时藏于屠龙刀中（原著）。本作以统兵布阵的队伍增益实现。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 运筹 `mv_wumuyishu_yunchou` | 1 | `aoe_allies r3` | 0 | 6%/3/1000 | 友方 `bf_ningshen` 2 | — | 支援 |
| 鱼鳞阵 `mv_wumuyishu_yulin` | 1 | `aoe_allies r2` | 0 | 7%/3/1000 | 友方 `bf_jiangu` 2 | — | 支援 |
| 奇正相生 `mv_wumuyishu_qizheng` | 3 | `aoe_allies r2` | 0 | 7%/3/1000 | 友方 `bf_zhuiji` 2 | — | 支援 |
| 背嵬冲阵 `mv_wumuyishu_beiwei`（"背嵬军"为岳家军精锐，史实） | 5 | `aoe_allies r2` | 0 | 8%/4/1000 | 友方 `bf_ruiyi` 2、`bf_jixing` 1 | — | 支援 |
| **撼山易** `mv_wumuyishu_hanshan`（绝招，取"撼山易，撼岳家军难"，史实语） | 7 | `aoe_ally_all` | 0 | 9%/—/1200 | 本方全体 `bf_mian_kong` 1、`bf_jiangu` 2、`bf_juqi` 2 | — | 支援绝招 |
| 以逸待劳 `mv_wumuyishu_yiyi` | 8 | `aoe_field side enemy` | 0 | 9%/5/1000 | 敌方全体 `bf_chihuan` 100% | — | 纯控制 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_wumuyishu_bingfa` | 兵法 | 1 | mechanic | — | — | 解锁"军阵战"指挥指令（design/09 大规模战斗接口，如襄阳守城）；武学常识 `lore` +5（一次性） |
| `ps_wumuyishu_zhenfa` | 阵法娴熟 | 4 | stat | Z4 | [0.02, 0.05] | 自身与相邻友方受到伤害 −{v}（光环 r1） |
| `ps_wumuyishu_jingzhong` | 精忠 | 8 | mechanic | — | +20pp | 免疫品阶 ≤ 自身的 `bf_kongju`；2 格内友方 `resMind` +20 pp |
| `ps_wumuyishu_dacheng` | 武穆大成 | 10 | mechanic | ct | — | 战斗开始时本方全体各获一次"先机"集气（等效 `bf_xianji` 的 `ct +100×G`，品阶 inherit） |

#### `sk_lihuaqiang` 梨花枪（7 地下 · 兵器/枪 · 将门）

| 字段 | 值 |
|---|---|
| 出处 | **（原创扩展）**据《宋史·李全传》杨妙真"二十年梨花枪，天下无敌手"（史实）；一说梨花枪附火药喷筒（待考），本作据此设"喷雪"一式 |
| origin / lineage | `expanded` / 杨妙真（南宋山东红袄军，史实人物） |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch07_bixue`（明末袁崇焕旧部军中传习，原创扩展） |
| nature · wOut/wIn · moveSlots | `yang` · 0.70/0.30 · 4 |
| weaponReq | `{category: spear}` |
| reqs | `attrs {str 45, agi 40}`；`aptitude {apSpear 45}`；`prereq [{sk_yangjiaqiangfa, 5}]`；`hard [prereq]` |
| layerStats | `hit [2, 8]`、`crit [1, 7]`（合计 15） |
| 层数要点 | 1：梨花点点、直刺、一寸长一寸强 ｜ 3：梨花喷雪、火药 ｜ 5：二十年 ｜ **7：绝招 天下无敌手** ｜ 8：拒马、无敌手 ｜ 10：梨花大成 |
| setTags / conflicts | `set_yangjia_jiangmen` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_yangmiaozhen` `maxLayer 10`（山东支线，原创扩展）；神雕 `manual it_miji_lihuaqiang` `maxLayer 8`；碧血 `master npc_ming_jiaotou`（袁崇焕旧部教头，原创扩展）`maxLayer 9`；`observe` 6 |
| 图鉴文本 | （原创扩展）南宋杨妙真枪法，史称"二十年梨花枪，天下无敌手"（《宋史·李全传》）；一说附有火药喷筒（待考）。本作列入将门枪法。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 梨花点点 `mv_lihuaqiang_diandian` | 1 | `aoe_multi n3, r1` · 1–2 | 0.95（3 段） | 7%/1/1000 | — | 可 | 0.85×1.12 |
| 直刺 `mv_lihuaqiang_zhici` | 1 | `aoe_pierce` · 1–2 | 0.90 | 7%/0/1000 | — | 可 | 0.90 |
| 梨花喷雪 `mv_lihuaqiang_penxue` | 3 | `aoe_cone n2` · 远程 | 0.85 | 8%/3/1000 | `bf_zhuoshao` 60%；`terrainFx {ignite: [tr_caodi]}` | 可 | 0.75×1.41×0.85−0.06 |
| 二十年 `mv_lihuaqiang_ershinian` | 5 | 单体 · 1–2；`condition {selfNotHitThisBattle: true}` | 1.60 | 8%/2/1000 | — | 可 | 1+0.24+0.05+0.30 |
| **天下无敌手** `mv_lihuaqiang_wudishou`（绝招，原创扩展命名） | 7 | `aoe_line n4` · 1–4 | 2.15 | 9%/—/1200 | `bf_zhuoshao` 100% | 可 | 3.00×0.75−0.10 |
| 拒马 `mv_lihuaqiang_juma` | 8 | 自身架势 | 0 | 6%/2/850 | 自身 `bf_jieji` 2（06：长枪拒马） | — | 架势招式 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_lihuaqiang_changbing` | 一寸长一寸强 | 1 | stat | Z3 | [0.05, 0.10] | 对相距恰为 2 格的目标 +{v} |
| `ps_lihuaqiang_huoyao` | 火药 | 3 | mechanic | — | — | 梨花喷雪需携火药筒弹药（design/10 建议 `it_huoyaotong`），无则该式不可用 |
| `ps_lihuaqiang_wudi` | 无敌手 | 8 | stat | Z0 | +10 | 目标 2 格内没有其他敌人时，本武学暴击 +10 |
| `ps_lihuaqiang_dacheng` | 梨花大成 | 10 | mechanic | — | +2 | 梨花点点段数 +2 |

### 10.4 玄/黄阶紧凑卡

**`sk_yangjiaqiangfa` 杨家枪法**（6 玄上 · 枪 · 阳 · 0.75/0.25 · 栏 3）｜reqs：`attrs {str 30, agi 25}`、`aptitude {apSpear 30}`、`prereq [{sk_liuheqiang, 4}]`（软，杨家后人线免除）｜layerStats：`hit [1,5]`、`parry [1,5]`｜setTags：`set_yangjia_jiangmen`｜获取：射雕 `master npc_yangtiexin` `maxLayer 10`（牛家村/比武招亲线）、`master npc_munianci` `maxLayer 8`；神雕 `manual it_miji_yangjiaqiangfa`（杨铁心遗谱）`maxLayer 10`；碧血 `master npc_ming_jiaotou`（明军旧部，原创扩展）`maxLayer 9`；`observe` 6｜出处：射雕·杨铁心家传枪法（原著）；"拦、拿、扎"为传统枪法术语，"回马枪"为杨家枪故事中的名招（在修订版中是否出现待考）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 拦 `mv_yangjiaqiangfa_lan` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 拿 `mv_yangjiaqiangfa_na` | 1 | 单体·1–2 | 1.10 | 6%/1/1000 | `bf_jiaoxie` 20%（targetArmed） | 可 | 1.12−0.04 |
| 扎 `mv_yangjiaqiangfa_zha` | 3 | `aoe_pierce`·1–2 | 1.05 | 7%/1/1000 | — | 可 | 0.90×1.17 |
| 回马枪 `mv_yangjiaqiangfa_huima` | 5 | 自身架势 | 0 | 6%/2/800 | 后撤 1；`stanceCounter {counterPower 1.3, expires: nextOwnAction}` | — | 架势招式 |
| 枪挑 `mv_yangjiaqiangfa_tiao` | 7 | 单体·1–2 | 1.20 | 7%/2/1000 | 击退 2 | 可 | 1.29−0.10 |

被动：`ps_yangjiaqiangfa_jiafeng` 忠烈家风（1，stat：`resMind` +[3, 8] pp）；`ps_yangjiaqiangfa_huima` 回马（5，stat Z3：回马枪反击 +10%）；`ps_yangjiaqiangfa_dacheng` 大成（10，stat Z3：对以突进（`aoe_dash`）接近自身的敌人，本回合反击与攻击 +10%）。

**`sk_liuheqiang` 六合枪**（3 黄上 · 枪 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**自宋至清军伍、镖局通行枪法，"中平枪，枪中王"为民间枪谚｜reqs：无｜layerStats：`hit [1,3]`、`parry [1,3]`｜setTags：`set_yangjia_jiangmen`｜获取：各书界军营/镖局教头 `master`（如 `npc_generic_jiaotou`）`maxLayer 10`；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 中平枪 `mv_liuheqiang_zhongping` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 拦拿扎 `mv_liuheqiang_lannazha` | 4 | 单体·1–2（3 段） | 1.30 | 6%/2/1000 | — | 可 | 1+0.24+0.05 |
| 横扫 `mv_liuheqiang_hengsao` | 7 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |

被动：`ps_liuheqiang_liuhe` 六合（5，stat：`parry` +[2%, 4%]）；`ps_liuheqiang_yuanman` 圆满（10，mechanic：首次练满 `apSpear` +1；杨家枪法资质软门槛 −10）。

---

## 11. 蒙古 `sect_menggu`（射雕/神雕；金轮法王除外）

### 11.1 简介

- **时代**：射雕时铁木真统一蒙古、称成吉思汗，郭靖在大漠长大，从哲别学箭、与拖雷摔跤，一箭射落双雕而得金刀（原著）。神雕时蒙古攻宋，忽必烈幕府聚集金轮法王及其弟子达尔巴、霍都，另有潇湘子、尹克西、尼摩星、马光佐等西域/江湖高手（原著）；神雕末潇湘子、尹克西盗走藏有《九阳真经》的《楞伽经》（原著，九阳归明教/倚天组）。倚天为元代，元廷、汝阳王府武士（含"神箭八雄"）以骑射为长（原著）；鹿鼎中葛尔丹为蒙古（准噶尔）王子（原著），清宫"布库"摔跤源出蒙古搏克（史实），本作以此延续蒙古骑射与摔跤（原创扩展）。
- **定位**：射雕为中立的"部族身份"开局（可加入）；神雕为敌对势力（幕府高手为 Boss/精英，其武学经观摩、残谱或"敌对路线"取得）。霍都、达尔巴的师门武学（龙象般若功等）归逍遥/吐蕃组图鉴。
- **风格**：骑射、摔跤、马刀；幕府高手的奇门兵器（扇、哭丧棒；达尔巴之杵归逍遥/吐蕃组）。
- **进阶链**：蒙古弯刀（黄中）/ 蒙古摔跤（黄上）→ 蒙古骑射（玄中）→ 哲别箭术（地下）。

### 11.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_zhebiejianshu` | 哲别箭术 | 暗器（弓箭） | 7 地下 | 阳 | 0.85/0.15 | 射雕、神雕 | 哲别亲传（部族身份）；郭靖 | 原著（哲别授郭靖箭术；一箭双雕） |
| `sk_huodushanfa` | 霍都扇法 | 兵器/奇门（扇） | 6 玄上 | 阴 | 0.60/0.40 | 神雕 | 霍都（敌对路线）；观摩 | 原创扩展命名（霍都使折扇为原著；扇中藏暗器待考） |
| `sk_kusangbangfa` | 哭丧棒法 | 兵器/棍杖 | 6 玄上 | 阴 | 0.70/0.30 | 神雕 | 潇湘子（敌对路线）；观摩 | 原创扩展命名（潇湘子使哭丧棒为原著，棒中毒砂待考） |
| `sk_mengguqishe` | 蒙古骑射 | 暗器（弓箭） | 5 玄中 | 阳 | 0.85/0.15 | 射雕、神雕、倚天、鹿鼎 | 部族/军营教头；元军与葛尔丹部残谱 | 原著（蒙古骑射）；倚天、鹿鼎延续为原创扩展 |
| `sk_menggushuaijiao` | 蒙古摔跤 | 拳脚/擒拿 | 3 黄上 | 阳 | 0.90/0.10 | 射雕、神雕、倚天、鹿鼎 | 拖雷羁绊；部族；鹿鼎布库房 | 原著（郭靖与拖雷摔跤；鹿鼎布库）；传承关联为原创扩展 |
| `sk_mengguwandao` | 蒙古弯刀 | 兵器/刀 | 2 黄中 | 阳 | 0.90/0.10 | 射雕、神雕、倚天、鹿鼎 | 部族/军营 | 原创扩展 |

> 弓箭暂归暗器栏（`hidden`，弹药为箭，design/10）；若 design/05 增设奇门细类 `bow` 并允许弓箭进兵器栏，哲别箭术可改为兵器，见待决 W-09。
>
> 达尔巴金杵的武学由逍遥/吐蕃组定义为 `sk_jingangxiangmochu`（金刚降魔杵，玄上，应其"蒙古组若另定请并入此 ID"之约，本文不再另立；兵器为 design/10 `eq_jinchu`）。本节只保留霍都、潇湘子与蒙古本部武学。

### 11.3 地阶条目卡

#### `sk_zhebiejianshu` 哲别箭术（7 地下 · 暗器 · 蒙古）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：蒙古神箭手哲别教郭靖射箭，郭靖一箭射落双雕，成吉思汗赐以金刀（原著）；招名除"一箭双雕"外为原创扩展 |
| origin / lineage | `canon` / 哲别 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.85/0.15 · 4 |
| reqs | `attrs {str 45, agi 40}`；`aptitude {apHidden 45}`；`hard []` |
| layerStats | `hit [3, 9]`、`crit [1, 6]`（合计 15） |
| 层数要点 | 1：开弓、连珠箭、神箭 ｜ 3：穿杨、屏息 ｜ 5：射雕手 ｜ 6：力透 ｜ **7：绝招 一箭双雕** ｜ 8：骑射 ｜ 10：箭神 |
| setTags / conflicts | `set_menggu_shediao`、`set_guojing_xiazhe` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_zhebie` `maxLayer 10`（蒙古部族身份或郭靖羁绊）、`master npc_guojing` `maxLayer 6`；神雕 `master npc_guojing` `maxLayer 10`；`observe` 6 |
| 图鉴文本 | 蒙古神箭手哲别的箭术，郭靖少年时得其亲传，曾一箭射落双雕，得成吉思汗赐金刀（射雕，原著）。本作以暗器栏的弓箭实现。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 开弓 `mv_zhebiejianshu_kaigong` | 1 | `aoe_bolt` · 1–7 · 投射 | 0.90 | 7%/0/1000 | — | 可 | 1×0.92 |
| 连珠箭 `mv_zhebiejianshu_lianzhu` | 1 | `aoe_bolt` · 1–7（3 段） | 1.20 | 8%/2/1000 | — | 可 | 1.29×0.92 |
| 穿杨 `mv_zhebiejianshu_chuanyang` | 3 | `aoe_pierce` · 1–7 · 投射 | 0.95 | 7%/1/1000 | — | 可 | 0.90×1.12×0.92 |
| 射雕手 `mv_zhebiejianshu_shediao` | 5 | `aoe_bolt` · 1–8；`condition {targetHeightAboveSelf: 2}` | 1.45 | 8%/2/1000 | — | 可 | (1+0.24+0.05+0.30)×0.92 |
| **一箭双雕** `mv_zhebiejianshu_yijianshuangdiao`（绝招） | 7 | `aoe_chain n1` · 1–8 · 投射 | 2.20（跳段 ×0.8） | 9%/—/1200 | — | 可 | 3.00×0.80×0.92 |
| 骑射 `mv_zhebiejianshu_qishe` | 8 | `aoe_bolt` · 1–6 | 1.10 | 8%/2/1000 | 射后后撤 2 | 可 | 1.29×0.92−0.10 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_zhebiejianshu_shenjian` | 神箭 | 1 | effect | — | +1 / +2 | 本武学射程 +1（6 重起 +2） |
| `ps_zhebiejianshu_pingxi` | 屏息 | 3 | stat | Z0 | +10 | 本回合未移动时，本武学暴击 +10 |
| `ps_zhebiejianshu_litou` | 力透 | 6 | stat | Z2 | [0.05, 0.12] | 本武学无视目标外功防御 {v} |
| `ps_zhebiejianshu_dacheng` | 箭神 | 10 | mechanic | — | +1 | 一箭双雕跳数 +1 |

### 11.4 玄/黄阶紧凑卡

**`sk_huodushanfa` 霍都扇法**（6 玄上 · 奇门（扇）· 阴 · 0.60/0.40 · 栏 3）｜weaponReq：`{category: exotic, kinds: [fan]}`（配霍都折扇 `eq_huoduzheshan`，design/10）｜reqs：`attrs {agi 30, wis 25}`、`aptitude {apExotic 30}`、`morality {max: −10}`（软）｜layerStats：`hit [1,5]`、`eva [1,5]`｜setTags：`set_menggu_mufu`｜获取：神雕 `master npc_huodu`（敌对路线）`maxLayer 10`；`observe` 6｜出处：神雕·霍都王子使折扇，大胜关败于朱子柳，后化名混入丐帮害死鲁有脚（原著）；扇中藏暗器之说待考

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 折扇点穴 `mv_huodushanfa_dianxue` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengxue` 25% 1 | 可 | 1.12−0.05 |
| 扇底藏针 `mv_huodushanfa_cangzhen` | 3 | `aoe_bolt`·1–4·投射 | 1.15 | 7%/2/1000 | `bf_zhongdu` 50% | 可 | 1.29×0.92−0.05 |
| 扇风迷眼 `mv_huodushanfa_shanfeng` | 5 | `aoe_cone n2`·远程 | 0.65 | 6%/1/1000 | `bf_muxuan` 50% | 可 | 0.75×1.12×0.85−0.05 |
| 暗算 `mv_huodushanfa_ansuan` | 7 | 单体·1；`condition {fromBehind: true}` | 1.60 | 7%/2/1000 | — | 可 | 1+0.24+0.05+0.30 |

被动：`ps_huodushanfa_yinxian` 阴险（1，stat Z0：战斗首回合本武学暴击 +[5, 10]）；`ps_huodushanfa_wangzi` 王子骄横（5，stat Z3：对气血 < 50% 的目标 +8%）；`ps_huodushanfa_dacheng` 大成（10，mechanic：扇底藏针所附 `bf_zhongdu` 改为 `bf_judu`）。

**`sk_kusangbangfa` 哭丧棒法**（6 玄上 · 棍杖 · 阴 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 30, wil 25}`、`aptitude {apStaff 30}`、`morality {max: −10}`（软）｜layerStats：`hit [1,5]`、`tough [1,5]`｜setTags：`set_menggu_mufu`｜获取：神雕 `master npc_xiaoxiangzi`（敌对路线）`maxLayer 10`；`observe` 6｜出处：神雕·湘西潇湘子使哭丧棒，形貌如僵尸（原著；棒中毒砂与"僵尸功"之名待考）

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 哭丧 `mv_kusangbangfa_kusang` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | `bf_zhenshe` 20% | 可 | 1−0.02 |
| 毒砂 `mv_kusangbangfa_dusha` | 3 | `aoe_cone n2`·远程 | 0.80 | 7%/3/1000 | `bf_zhongdu` 60%；`bf_shimang` 20% 1 | 可 | 0.75×1.41×0.85−0.06−0.02 |
| 僵尸跳 `mv_kusangbangfa_jiangshi` | 5 | `aoe_leap`·1–3 | 1.05 | 7%/2/1000 | 跳斩 | 可 | 0.90×1.29−0.10 |
| 招魂 `mv_kusangbangfa_zhaohun` | 7 | 单体·1–2 | 1.25 | 7%/2/1000 | `bf_kongju` 20% 1 | 可 | 1.29−0.05 |

被动：`ps_kusangbangfa_jiangshi` 僵直（1，stat：`resCC` +[4, 10] pp）；`ps_kusangbangfa_yinqi` 阴气（5，stat Z3：对气血 < 30% 的目标 +10%）；`ps_kusangbangfa_dacheng` 诈尸（10，trigger `battleStart`：自身获得 `bf_zhasi` ×1）。

**`sk_mengguqishe` 蒙古骑射**（5 玄中 · 暗器（弓箭）· 阳 · 0.85/0.15 · 栏 3）｜reqs：`attrs {str 25, agi 25}`、`aptitude {apHidden 25}`｜弹药：箭｜layerStats：`hit [1,6]`、`crit [1,4]`｜setTags：`set_menggu_shediao`｜获取：射雕/神雕部族或军营教头 `master` `maxLayer 10`；倚天元军、鹿鼎葛尔丹部 `pages`（4 页，原创扩展）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 走马射 `mv_mengguqishe_zouma` | 1 | `aoe_bolt`·1–6·投射 | 0.95 | 6%/1/1000 | 射后后撤 1 | 可 | 1.12×0.92−0.10 |
| 连射 `mv_mengguqishe_lianshe` | 3 | `aoe_bolt`·1–6（2 段） | 1.20 | 7%/2/1000 | — | 可 | 1.29×0.92 |
| 箭雨 `mv_mengguqishe_jianyu` | 5 | `aoe_sq3`·2–6·远程（抛射） | 0.75 | 8%/3/1000 | — | 可 | 0.60×1.46×0.85 |
| 回身射 `mv_mengguqishe_huishen`（触发） | 7 | 自身 | 0 | 4%/—/— | `trigger {on: enemyEnterAdjacent, chance 0.5, perRound 1, counterPower 0.8}`，射后后撤 1 | — | 触发招式 |

被动：`ps_mengguqishe_mashang` 马上（1，mechanic：探索中骑马移动速度 +5%；骑乘战斗若由 design/09 支持，本武学射程 +1）；`ps_mengguqishe_caoyuan` 草原（5，stat Z3：身处平原/草地地形时本武学 +8%）；`ps_mengguqishe_dacheng` 大成（10，stat：`hit` +5%）。

**`sk_menggushuaijiao` 蒙古摔跤**（3 黄上 · 擒拿 · 阳 · 0.90/0.10 · 栏 3）｜reqs：无｜layerStats：`tough [1,3]`、`hit [1,3]`｜setTags：`set_menggu_shediao`｜获取：射雕 `master npc_tuolei`（拖雷羁绊）`maxLayer 10`；神雕/倚天蒙古军营 `master`；鹿鼎布库房（若 `chapters/08` 另立"布库"武学，则本条作为其残篇印证来源）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 抱摔 `mv_menggushuaijiao_baoshuai` | 1 | 单体·1 | 1.05 | 5%/1/1000 | `bf_dingshen` 20% 1 | 可 | 1.12−0.05 |
| 绊摔 `mv_menggushuaijiao_banshuai` | 4 | 单体·1 | 1.05 | 5%/1/1000 | `bf_panshan` 60% | 可 | 1.12−0.06 |
| 过肩摔 `mv_menggushuaijiao_guojian` | 7 | `aoe_knock n2`·1 | 1.15 | 6%/2/1000 | 击退 2 | 可 | 0.95×1.29−0.10 |

被动：`ps_menggushuaijiao_zhuangshi` 壮实（5，stat：`resCC` +[4, 8] pp）；`ps_menggushuaijiao_yuanman` 圆满（10，mechanic：首次练满 `apGrapple` +1；鹿鼎"布库"相关事件可直接以本武学应对，chapters/08 接口）。

**`sk_mengguwandao` 蒙古弯刀**（2 黄中 · 刀 · 阳 · 0.90/0.10 · 栏 3）｜**（原创扩展）**草原马刀｜reqs：无｜layerStats：`hit [1,3]`、`crit [1,3]`｜setTags：`set_menggu_shediao`、`set_menggu_mufu`｜获取：部族/军营 `master`；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 马刀劈 `mv_mengguwandao_pi` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 旋刀 `mv_mengguwandao_xuan` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 冲锋斩 `mv_mengguwandao_chongfeng` | 7 | `aoe_dash n3`·1–3 | 1.05 | 6%/1/1000 | 突进 | 可 | 1+0.12+0.05−0.10 |

被动：`ps_mengguwandao_hanfeng` 悍风（5，stat Z3：本回合移动 ≥ 3 格后本武学 +6%）；`ps_mengguwandao_yuanman` 圆满（10，mechanic：首次练满 `apBlade` +1）。

---

## 12. 套装候选（最终规则由 `design/07` 定稿）

### 12.1 约定（建议，供 07 采纳或改写）

| 项 | 建议 |
|---|---|
| 计件 | 按 05 §6.5：装配中的武学（含辅运内功、兵器栏暂不可用的兵器武学）＋穿戴中的装备；每门武学对其 `setTags` 中每个套装各计 1 件 |
| 套装品阶 `g_set` | 取**已计件成员有效品阶的中位数**（向下取整）；外来成员按压制后的有效品阶计入——套装随天道压制自然衰减 |
| 数值写法 | "基准值 × G(g_set)"（G 取基准 §4），与 06 §3.2 同尺度；**必须标注作用层**（`attr:` 属性层 / `Z3` 增伤 / `Z4` 减伤 / `Z0` 判定 / `cost` / 机制） |
| 上限 | 套装与 Buff、被动合并计入 06 §11.1 的族上限 |
| 跨品阶混搭 | 允许天地玄黄任意混搭（用户示例：少林金刚＝地中龙爪手＋天上易筋经＋玄中铁砂掌＋铜人横练）；低阶成员拉低中位数，是"凑件"与"质量"的取舍 |
| 低武可达成性 | 低武书界只能携带内/拳/兵各 1 门＋6 件装备；轻功、暗器、杂学成员不可携带。表中"低武上限"= 携带核心成员 ＋ 可带装备成员 ＋ 该书界原生（可重新习得）成员的最大件数 |

### 12.2 候选总表

| set ID | 名称 | 类型 | 成员（件） | 品阶跨度 | 中武上限 | 低武上限 |
|---|---|---|---|---|---|---|
| `set_gaibang_bangzhu` | 丐帮帮主 | 门派 | 降龙十八掌、打狗棒法、打狗阵、餐风饮露功、`eq_dagoubang`、`eq_jiuhulu`（6；洪七公酒葫芦见 design/10） | 天上—玄下 | 6（笑傲本土重修餐风饮露功、打狗阵） | 5（降龙＋打狗携带、餐风饮露功于鹿鼎分舵重修、打狗棒与酒葫芦装备） |
| `set_gaibang_tuobo` | 沿门托钵 | 门派 | 穷家拳、莲花掌、赶狗棍法、餐风饮露功、铁钵功、莲花落（6） | 地下—黄中 | 6（笑傲全部原生） | 5（鹿鼎分舵：除铁钵功外全部原生） |
| `set_taohuadao` | 桃花岛主（东邪） | 门派/人物 | 弹指神通、碧海潮生曲、兰花拂穴手、玉箫剑法、落英神剑掌、碧涛玄功、`eq_yuxiao`、`eq_ruanweijia`（8；与 design/10 §5.6 同 ID 合并） | 天下—地下 | 6 | 5 |
| `set_huangrong_nvzhuge` | 女诸葛 | 人物传承 | 打狗棒法、兰花拂穴手、落英神剑掌、桃花阵、`eq_ruanweijia`（5） | 天中—地下 | 4 | 3 |
| `set_baituoshan` | 白驼山主（西毒） | 门派/人物 | 蛤蟆功、灵蛇杖法、灵蛇拳、逆转经脉、`eq_baituoshezhang`（5；与 design/10 §5.6 同 ID 合并） | 天下—地下 | 5 | 4 |
| `set_dali_yiyang` | 一阳 | 门派 | 一阳指、六脉神剑、枯荣禅功、一阳书指、段家剑法、天南心法（6） | 天上—黄上 | 4 | 3 |
| `set_jiuyin_zhengzong` | 九阴正宗 | 传承 | 九阴真经、九阴神爪、移魂大法、大伏魔拳、易筋锻骨篇、蛇行狸翻、九阴疗伤篇（7） | 天上—玄上 | 4 | 2 |
| `set_heifeng_shuangsha` | 黑风双煞 | 人物（邪） | 九阴白骨爪、摧心掌、白蟒鞭法、铜尸横练（4） | 地上—玄上 | 4 | 3 |
| `set_guojing_xiazhe` | 侠之大者 | 人物传承 | 降龙十八掌、九阴真经、空明拳、左右互搏、哲别箭术、武穆遗书（6） | 天上—地中 | 4 | 2 |
| `set_zhoubotong_wantong` | 老顽童 | 人物传承 | 空明拳、左右互搏、九阴真经、顽童迷踪（4） | 天上—玄中 | 3 | 2 |
| `set_tiezhang_shuishangpiao` | 铁掌水上飘 | 门派/人物 | 铁掌功、水上飘、`sk_zaoheding`（道家组）、铁掌心法、黑砂掌（5） | 天下—黄中 | 3 | 2 |
| `set_jiangnan_qiguai` | 江南七怪 | 门派 | 听声杖法、分筋错骨手、越女剑法（韩小莹）、金龙鞭法、毒菱、南山掌法、秤锤打法（7） | 玄中—黄中 | 4 | 2 |
| `set_yangjia_jiangmen` | 满门忠烈 | 传承 | 杨家枪法、梨花枪、六合枪、武穆遗书（4） | 地中—黄上 | 3（碧血三门枪法皆可本土重修） | 2（鹿鼎/鸳鸯可重修六合枪，另携带 1 门枪法） |
| `set_menggu_shediao` | 弯弓射雕 | 门派 | 哲别箭术、蒙古骑射、蒙古摔跤、蒙古弯刀、`eq_jindao`（5；成吉思汗金刀见 design/10） | 地下—黄中 | 3（弯刀携带＋金刀＋摔跤携带） | 4（鹿鼎葛尔丹部：骑射、摔跤、弯刀原生，原创扩展；另穿金刀） |
| `set_menggu_mufu` | 幕府群雄 | 势力 | `sk_jingangxiangmochu`（逍遥/吐蕃组）、霍都扇法、哭丧棒法、蒙古弯刀、`eq_jinchu`、`eq_huoduzheshan`（6；可选 `sk_longxiang`，由 07 与逍遥/吐蕃组协调） | 玄上—黄中 | 3 | 3（携带扇/杵/棒之一＋鹿鼎重修弯刀＋兵器装备） |

### 12.3 阈值效果（建议值；`G` = G(g_set)）

**`set_gaibang_bangzhu` 丐帮帮主**（天上降龙＋天中打狗棒法＋地下打狗阵＋玄下餐风饮露功＋天中打狗棒；典型 g_set = 11，G 3.10）
- 2 件：拳掌与棍杖招式伤害 `Z3 +3%×G`（≈ +9.3%）。
- 3 件：`attr:parry pct +3%×G`；降龙/打狗招式击杀时返还 15% 耗内（`cost`）。
- 4 件：打狗棒法控制类附带效果命中 `Z0 effHit +10%`；降龙招式无视外防 `Z2 +5%`。
- 5 件（机制）：每场首次施放绝招后，2 格内友方获得 `bf_juqi` 2 回合；战斗外丐帮 NPC 好感 +（design/12）。
- 混搭：玄下的餐风饮露功把中位数压低有限（5 件时中位 11）；只凑降龙＋打狗＋打狗棒 3 件也可拿到 3 件档；洪七公酒葫芦 `eq_jiuhulu`（design/10）为可选第 6 件，"6 选 5"。低武：见总表，5 件档可达。

**`set_gaibang_tuobo` 沿门托钵**（全黄玄＋地下铁钵功；g_set ≈ 2–4）
- 2 件：`attr:hpMax pct +2%×G`。 3 件：拳掌/棍杖 `Z3 +3%×G`。 4 件：`attr:resCold pp +4×G`、`attr:resPoison pp +4×G`。 5 件（机制）：自身与 ≥ 1 名友方相邻时 `Z4 +3%×G`（群丐互保）。
- 定位：**中武/低武的保底套装**——本组唯一在鹿鼎（原创扩展分舵）即可凑满 5 件的套装，数值低但完全不受外来压制。

**`set_taohuadao` 桃花岛主（东邪）**（天下弹指/碧海＋地中兰花/玉箫＋地下落英/碧涛＋装备玉箫 `eq_yuxiao`〔design/10，地上〕、软猬甲 `eq_ruanweijia`；与 design/10 §5.6 建议同 ID，合并其成员）
- 2 件：`attr:effHit pct +3%×G`。 3 件：`attr:seal pp +2×G`；指法/擒拿所附封穴施加率 +10pp。 4 件：调和性质招式 `Z3 +4%×G`；桃花岛杂学耗内 −10%（`cost`）。 5 件（机制）：战斗开始时 30% 令随机 1 名敌人获得 `bf_luanxin` 1 回合；自身免疫品阶 ≤ g_set 的 `mind` 减益。
- 低武：碧海潮生曲（杂学）不可携带 → 最多 碧涛＋一门拳脚＋玉箫剑法＋玉箫＋软猬甲 = 5 件（5 件档可达）。

**`set_huangrong_nvzhuge` 女诸葛**（打狗棒法＋兰花＋落英＋桃花阵＋软猬甲 `eq_ruanweijia`）
- 2 件：`attr:eva pct +3%×G`。 3 件：本套成员招式的控制类附带施加率 +8pp。 4 件：穿戴软猬甲时 `bf_weici` 反伤 ×1.5（`settle`）。 5 件（机制）：战斗开始时本方全体获得 `bf_ningshen` 2 回合（运筹）。
- 低武：桃花阵不可携带；打狗棒法（兵器）＋一门桃花岛拳脚＋软猬甲 = 3 件。

**`set_baituoshan` 白驼山主（西毒）**（蛤蟆功＋灵蛇杖法＋灵蛇拳＋逆转经脉＋白驼蛇杖 `eq_baituoshezhang`〔design/10，地上〕；与 design/10 §5.6 建议同 ID）
- 2 件：`attr:resPoison pp +5×G`。 3 件：自身施加的 `poison` 标签 DOT 每跳伤害 ×1.10（`settle`）。 4 件：获得 `bf_xushi` 时额外 `Z3 +5%`（至下一次攻击）。 5 件（机制）：自身施加的 `bf_shedu` 满层失去行动率 30% → 40%。
- 注意：蛤蟆功（阳）与逆转经脉（阴）同装会阴阳相冲（05 §5.4）；逆转经脉 10 重"倒行逆施"作辅运时视为桥接，是本套的内部解法。

**`set_dali_yiyang` 一阳**（天上六脉＋天中一阳指＋地上枯荣＋地中一阳书指＋地下段家剑法＋黄上天南心法）
- 2 件：`attr:seal pp +2×G`。 3 件：指法招式 `Z3 +3%×G`；一阳疗伤治疗量 +10%。 4 件：本套成员所附 `bf_fengxue` 施加率 +10pp。 5 件（机制）：一阳疗伤冷却 −1；六脉神剑"时灵时不灵"概率减半。
- 混搭：天南心法（黄上）作为便宜的第 6 件，会把中位数从 9 拉到 8——鼓励"宁缺毋滥"的取舍。低武：一内一拳一兵 = 3 件。

**`set_jiuyin_zhengzong` 九阴正宗**
- 2 件：`attr:atkIn pct +3%×G`。 3 件：`attr:resSeal pp +3×G`；九阴系武学修炼 +10%。 4 件：九阴系招式 `Z3 +4%×G`。 5 件（机制）：被 `seal`/`cc` 所制时，每回合开始 20% 自行驱散 1 个（品阶 ≤ g_set）。
- 低武：本套无兵器成员，杂学、轻功不可携带 → 2 件；**这是有意的**：九阴正宗是高武终盘套，下半程只剩"九阴真经＋神爪"的 2 件档。

**`set_heifeng_shuangsha` 黑风双煞**（邪练套）
- 2 件：`attr:crit pct +3%×G`。 3 件：对带 `bleed`/`injury` 标签效果的目标 `Z3 +4%×G`。 4 件（机制）：`bf_xielian` 的 `resMind −15` 减半；夜间战斗（design/11 昼夜）`Z3 +5%`。
- 与九阴正宗互斥（白骨爪 × 神爪互斥，05 §9.2），二者只能择一。

**`set_guojing_xiazhe` 侠之大者**（郭靖传承：降龙、九阴真经、空明拳、左右互搏、哲别箭术、武穆遗书）
- 2 件：`attr:hpMax pct +2%×G`。 3 件：`Z4 +3%×G`。 4 件（机制）：每场 1 次，相邻友方受致命伤害时由自身代受（等效 `bf_yuanhu` ×1）。 5 件：`Z3 +4%×G`。 6 件（机制）：本方有单位倒地时，自身获得 `bf_ruiyi` 与 `bf_jiangu` 各 2 回合（每场 1 次）。
- 说明：降龙十八掌的 `setTags` 需在 05 §13.1 增补本套（W-01）。低武：左右互搏、哲别、武穆均不可携带 → 2 件。

**`set_zhoubotong_wantong` 老顽童**
- 2 件：`attr:resMind pp +4×G`。 3 件：左右互搏"分心二用"中两招 `Mod_special` +0.05。 4 件（机制）：每场首次受致死伤害时获得 `bf_zhasi` 效果（装死，致敬老顽童），每场 1 次。

**`set_tiezhang_shuishangpiao` 铁掌水上飘**
- 2 件：`attr:atkOut pct +3%×G`。 3 件：拳掌招式 `Z2 +3%×G`。 4 件：水域地形中 `attr:eva pct +4%×G`。 5 件（机制）：每场首次踏水（使用水上飘招式）后，下一次拳掌攻击获得 `bf_bibao` ×1。

**`set_jiangnan_qiguai` 江南七怪**（射雕前期补位套）
- 2 件：`attr:hit pct +3%×G`。 3 件：与友方攻击同一目标时 `Z3 +3%×G`（合斗）。 4 件（机制）：每名相邻友方使自身 `Z4 +2%`（至多 +6%）。 7 件（彩蛋）：战斗开始时本方全体获得 `bf_juqi` 2 回合。
- 定位：全玄黄，g_set 仅 3–5，但射雕开局即可凑 4 件，覆盖"新书界装配栏空缺"的阵痛期。

**`set_yangjia_jiangmen` 满门忠烈**
- 2 件：`attr:parry pct +3%×G`。 3 件：枪法招式 `Z3 +4%×G`，回马枪反击 +10%。 4 件（机制）：免疫品阶 ≤ g_set 的 `bf_kongju`；气血 < 30% 时 `Z3 +5%×G`。

**`set_menggu_shediao` 弯弓射雕**
- 2 件：`attr:hit pct +3%×G`。 3 件：暗器（弓箭）招式 `Z3 +4%×G`；平原/草地地形 `attr:mov flat +1`。 4 件（机制）：战斗开始 `ct +100×G`（等效一次 `bf_xianji`）。
- 成吉思汗金刀 `eq_jindao`（design/10）计 1 件。低武：鹿鼎葛尔丹部可本土重修骑射、摔跤、弯刀（原创扩展），再穿金刀 → 4 件档可达。

**`set_menggu_mufu` 幕府群雄**（达尔巴金杵武学 `sk_jingangxiangmochu` 由逍遥/吐蕃组定义；`eq_jinchu`、`eq_huoduzheshan` 见 design/10）
- 2 件：`attr:atkOut pct +3%×G`。 3 件：奇门兵器招式 `Z3 +4%×G`。 4 件（机制）：对宋军/丐帮/全真势力标签的敌人 `Z3 +5%`（势力标签归 design/12）。

---

## 13. 境界覆盖与装配可行性

### 13.1 各书界本组原生武学（可习得池）

| 书界 | 境界 | 本组原生数（天/地/玄/黄） | 内功 | 拳脚 | 兵器 | 轻/暗/杂 | 说明 |
|---|---|---|---|---|---|---|---|
| 天龙 | 高 | 20（4/3/5/8） | 3 | 6 | 7 | 2/0/2 | 丐帮（乔峰时代）＋大理段氏/天龙寺 |
| 射雕 | 高 | 76（12/20/25/19） | 9 | 25 | 19 | 7/4/12 | 本组主场：五绝体系全部登场 |
| 神雕 | 高 | 66（10/18/23/15） | 8 | 20 | 17 | 7/4/10 | 射雕体系延续＋忽必烈幕府（霍都、潇湘子） |
| 倚天 | 高 | 25（3/7/6/9） | 3 | 6 | 10 | 2/1/3 | 丐帮（残本）、九阴（倚天剑藏经）、元军、段氏余脉（原创扩展） |
| 笑傲 | 中 | 10（0/2/4/4） | 1 | 3 | 3 | 1/0/2 | 仅丐帮（解风为帮主，原著）；可凑齐一套 1/1/1 本土核心＋轻功杂学 |
| 碧血 | 中 | 12（0/2/5/5） | 1 | 3 | 6 | 1/0/1 | 丐帮分舵（原创扩展）＋将门三枪（明末军伍，原创扩展） |
| 鹿鼎 | 低 | 11（0/0/4/7） | 1 | 3 | 4 | 1/1/1 | 丐帮分舵（原创扩展）＋葛尔丹部骑射摔跤（原创扩展）＋六合枪 |
| 鸳鸯、书剑、飞狐 | 低/中 | 各 1（六合枪） | — | — | 1 | — | 通行枪法 |
| 侠客、连城、白马、雪山 | 中/低 | 0 | — | — | — | — | 本组无原生，依赖 `skills-ming-qing.md`、`skills-common.md`（05 §14.5） |

- 05 §14.6 第 4 条要求"每个境界书界本土内功、拳脚、兵器各 ≥ 3 门"，这是**跨图鉴**的合计约束。本组能保证：笑傲、碧血、鹿鼎的拳脚与兵器各 ≥ 3，内功只有餐风饮露功 1 门——三书界的其余本土内功须由 `skills-wuyue.md`、`skills-riyue.md`、`skills-ming-qing.md`、`skills-common.md` 补足（待决 W-12）。
- 丐帮分舵（碧血、鹿鼎）与葛尔丹部骑射（鹿鼎）为**原创扩展落点**，若 `chapters/07`、`chapters/08` 不采用，本组在该书界的原生数分别降为 3（将门枪法）与 1（六合枪）。

### 13.2 本组天级带入中武/低武后的有效品阶（02 §2.3）

| 绝对品阶 | 本组武学 | 中武（−2） | 低武（−4） | 在低武中的对照 |
|---|---|---|---|---|
| 12 天上 | 降龙十八掌、六脉神剑、九阴真经 | 10 天下 | 8 地中 | 高于低武普通敌人主力上限 7，低于鹿鼎原生天下（凝血神爪） |
| 11 天中 | 一阳指、打狗棒法 | 9 地上 | 7 地下 | 与低武精英持平 |
| 10 天下 | 蛤蟆功、弹指神通、空明拳、九阴神爪、铁掌功（核心）；碧海潮生曲、左右互搏、移魂大法（非核心，不可携带） | 8 地中 | 6 玄上 | 核心类仍可用；非核心类化为残篇，留下感悟（02 §5.5） |

**推荐携带（本组视角，仅示例）**：
- 进入中武（2/2/2）：内功 九阴真经（调和，可桥接）＋蛤蟆功或碧涛玄功；拳脚 降龙十八掌＋一阳指/弹指神通；兵器 打狗棒法＋玉箫剑法或段家剑法；装备带 `eq_dagoubang`、`eq_ruanweijia`。在笑傲以丐帮身份重修餐风饮露功即可凑出帮主套 4 件。
- 进入低武（1/1/1）：九阴真经（被压至地中仍是低武顶尖内功）＋降龙十八掌＋打狗棒法＋`eq_dagoubang`；鹿鼎若设丐帮分舵，再以本土身份重修餐风饮露功 → 帮主套 4 件，或改走"沿门托钵"本土 5 件套。

---

## 14. 本组统计

### 14.1 门派 × 品阶（12 级）

| 门派/传承 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 丐帮 | 1 | 2 | 1 | 1 | 2 | 3 | 2 | 0 | 0 | 0 | 1 | 1 | **14** |
| 桃花岛 | 0 | 1 | 1 | 1 | 2 | 1 | 3 | 2 | 0 | 2 | 0 | 0 | **13** |
| 白驼山 | 0 | 1 | 1 | 0 | 1 | 2 | 1 | 1 | 1 | 1 | 0 | 0 | **9** |
| 大理段氏/天龙寺 | 0 | 1 | 3 | 1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 | **11** |
| 周伯通 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 2 | 0 | 0 | **3** |
| 九阴真经系 | 0 | 0 | 0 | 0 | 0 | 2 | 2 | 1 | 3 | 2 | 0 | 1 | **11** |
| 铁掌帮 | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | **5** |
| 江南七怪 | 0 | 2 | 0 | 3 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **7** |
| 杨家枪与将门 | 0 | 0 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | **4** |
| 蒙古 | 0 | 1 | 1 | 0 | 1 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | **6** |
| **合计** | **1** | **9** | **9** | **6** | **11** | **11** | **11** | **6** | **6** | **8** | **2** | **3** | **83** |
| 大阶小计 | | 黄 19（23%） | | | 玄 28（34%） | | | 地 23（28%） | | | 天 13（16%） | | |

### 14.2 类别 × 大阶

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---|---|---|---|---|
| 内功 | 心法 | 2 | 4 | 3 | 1 | **10** |
| 拳脚 | 拳掌 | 3 | 4 | 5 | 4 | 16 |
| | 指法 | 3 | 0 | 0 | 0 | 3 |
| | 腿法 | 0 | 0 | 1 | 0 | 1 |
| | 擒拿/爪 | 1 | 2 | 2 | 2 | 7 |
| | 小计 | 7 | 6 | 8 | 6 | **27** |
| 兵器 | 剑 | 0 | 1 | 1 | 0 | 2 |
| | 刀 | 0 | 0 | 1 | 2 | 3 |
| | 棍杖 | 1 | 1 | 2 | 2 | 6 |
| | 枪 | 0 | 1 | 1 | 1 | 3 |
| | 鞭索 | 0 | 1 | 1 | 0 | 2 |
| | 奇门（笔/箫/扇/斧/钵/秤） | 0 | 3 | 1 | 3 | 7 |
| | 小计 | 1 | 7 | 7 | 8 | **23** |
| 轻功 | | 0 | 2 | 3 | 2 | **7** |
| 暗器 | （含弓箭） | 0 | 1 | 2 | 1 | **4** |
| 杂学 | 阵法 3、音律 2、心神 2、医 2、驭兽 1、毒 1、机制 1 | 3 | 3 | 5 | 1 | **12** |
| **合计** | | **13** | **23** | **28** | **19** | **83** |

### 14.3 原生书界

| 书界 | 首现（天/地/玄/黄） | 首现合计 | 可习得池（天/地/玄/黄） | 池合计 |
|---|---|---|---|---|
| 天龙 | 4/3/5/8 | 20 | 4/3/5/8 | 20 |
| 射雕 | 9/18/21/11 | 59 | 12/20/25/19 | 76 |
| 神雕 | 0/1/2/0 | 3 | 10/18/23/15 | 66 |
| 倚天 | 0/1/0/0 | 1 | 3/7/6/9 | 25 |
| 笑傲 | — | 0 | 0/2/4/4 | 10 |
| 碧血 | — | 0 | 0/2/5/5 | 12 |
| 鹿鼎 | — | 0 | 0/0/4/7 | 11 |
| 鸳鸯 / 书剑 / 飞狐 | — | 0 | 0/0/0/1 | 各 1 |
| 侠客 / 连城 / 白马 / 雪山 | — | 0 | — | 0 |
| **合计** | **13/23/28/19** | **83** | | |

> 与 05 §14 的对照：① 本组在射雕的首现 59 门，加上全真组的射雕首现后将略超 05 §14.4 射雕首现目标（65）约 5%–10%；② 本组地阶占比 28% 高于全局目标 21%，原因是高武巅峰书界的敌人主力品阶集中在地阶（02 §2.11 表 D/E），需由通行/明清图鉴的黄阶补足全局比例。见待决 W-21、W-22。

---

## 15. 本文新增 ID（汇总计数）

| 类别 | 数量 | 说明 |
|---|---|---|
| 武学 `sk_*`（本文定义） | **83** | 其中 13 门天级沿用基准 §13 的 ID；`sk_xianglong18` 权威定义在 05 §13.1（本文只补充）；`sk_jiuyinbaigu` 的 ID 与代价规则登记于 05（本文补齐招式）；**本文新增武学 ID 69 门**（含同名加序号的 `sk_yuenvjian02`）；达尔巴金杵并入逍遥/吐蕃组 `sk_jingangxiangmochu`、裘千尺枣核钉并入道家组 `sk_zaoheding`，均不另立 |
| 招式 `mv_*` | **364** | 全部为本文新增（降龙十八掌 19 招见 05，不重复） |
| 被动 `ps_*` | **264** | 全部为本文新增 |
| 套装 `set_*`（候选） | **15** | `set_gaibang_bangzhu` 为 05 §16.2 的建议 ID，`set_taohuadao`、`set_baituoshan` 与 design/10 §5.6 的建议同 ID 合并成员；其余 12 个为本文新增，本体交 design/07 |
| 门派 `sect_*` | **7** 新增 | `sect_taohuadao` `sect_baituoshan` `sect_dali` `sect_tianlongsi` `sect_tiezhangbang` `sect_jiangnanqiguai` `sect_menggu`；另引用 `sect_gaibang`（05）、`sect_quanzhen` |
| 装备 `eq_*` | 0 新增，引用 9 | 基准 §14：`eq_dagoubang`、`eq_ruanweijia`；design/10 名器：`eq_yuxiao`、`eq_baituoshezhang`、`eq_kezhenezhang`、`eq_huoduzheshan`、`eq_jinchu`、`eq_jindao`、`eq_jiuhulu` |
| 物品 `it_*` | 22 | 秘籍 `it_miji_*`（含残本 `_can`、速成篇 `_su`）18、残页 `it_canye_*` 2、弹药 `it_huoyaotong` 1、引用 `it_jiuhuayulu` 1（命名规则按 05 §16.2 建议） |
| NPC / 任务占位 | 52 / 9 | `npc_*` 与 `q_0N_*_9x` 为占位，由 `chapters/` 替换（05 §17.2 D15） |
| **Buff `bf_*`** | **0 新增** | 引用 design/06 已有 Buff 共 91 个，全部通过存在性校验；需要新机制处以效果钩子/条件提案代替（W-02、W-05） |
| 效果钩子（提案） | 4 | `weaponCoat`（淬毒）、`followupMove`（六脉追加商阳剑）、`equalizeHp`（天之道）、`reflectMind`（反照） |
| 招式/被动条件（提案） | 7 | `differentTagThanLast`、`firstHitOnTarget`、`targetHeightAboveSelf`、`selfNotHitThisBattle`、`targetMoralityMax`、`mainHandTag`、`equipped` |
| 字段（提案） | 5 | `reqs.skills`（技艺门槛）、`special.altPrereq`（或前置）、`special.instrument`（乐器）、`special.reformTo/reformFrom`（改修）、`special.trainMult`（修炼系数覆写） |
| 奇门细类（提案） | 2 | `bowl`（钵）、`bow`（弓） |

---

## 16. 待决事项 / 依赖

### 16.1 待决（W 编号供各文档引用）

| # | 事项 | 本文当前处理 | 需谁拍板 |
|---|---|---|---|
| W-01 | 降龙十八掌 `setTags` 增补 `set_guojing_xiazhe` | 本文已在套装表列入；05 §13.1 未改 | design/05、design/07 |
| W-02 | 新增招式/被动条件 7 个（见 §15） | 已在条目中使用，语义写在说明列 | design/05 §4.1、tech/05 |
| W-03 | `Reqs` 增加技艺门槛 `skills: {music, formation, art, med, poi}`（软门槛） | 碧海潮生曲、桃花阵、一阳书指等只在说明中写"建议 ≥ X" | design/05 §2.4 |
| W-04 | 奇门细类增设 `bowl`（钵），铁钵功现暂用 `misc` | `kinds: [misc]` | design/05 §6.2、design/10 |
| W-05 | 新增效果钩子 4 个（见 §15） | 已在条目中使用 | design/05 §4.11、tech/05 |
| W-06 | `special.altPrereq`：六脉神剑"一阳指 ≥ 5 **或** 北冥神功 ≥ 5" | 以 `hard [prereq]`＋`altPrereq` 表述 | design/05 §2.4 |
| W-07 | 左右互搏的杂学子类（05 未指定，本文暂归 `mind`，建议新增 `dual`）；`dualWield` 在 03 为 0–3 级、在 05/本文为有效层数，需统一 | 暂归 `mind`；`dualWield = 有效层数` | design/03、design/05 |
| W-08 | 同源组 `lg_jiuyin` 扩充：易筋锻骨篇、蛇行狸翻、大伏魔拳、九阴疗伤篇、摧心掌、白蟒鞭法；`lg_yiyang` 增补一阳书指 | 未写入 02 | design/02 §5.4 |
| W-09 | 弓箭归属：暗器栏（现行）或兵器栏奇门 `bow` | 哲别箭术、蒙古骑射暂为暗器 | design/05、design/10 |
| W-10 | 倚天"残本降龙"是否拆为独立 ID（02 `lg_xianglong` 注"含各代残本"） | 沿用 05：同 ID ＋ `it_miji_xianglong18_can`（`maxLayer 6`，恰为前 12 掌） | design/02、design/05 |
| W-11 | 越女剑法：序章 `sk_yuenvjian`（阿青）与射雕韩小莹是否为同一武学 | 分立为 `sk_yuenvjian02`（玄下），以"剑源余韵"被动相连 | design/02 P5 |
| W-12 | 中武/低武本土内功不足：本组在笑傲、碧血、鹿鼎各只有餐风饮露功 1 门 | 依赖五岳、日月、明清、通行图鉴补足（05 §14.6 第 4 条为跨图鉴合计） | 各 catalog、chapters/05/07/08 |
| W-13 | 六合枪可能与 `skills-common.md` 的通行枪法重复 | 本文定义；若 common 另有定义则以其为准，本文改为前置引用 | skills-common 作者 |
| W-14 | 射雕原生天级：本组占 12 门（另全真 3 门），超出单周目预算 7——须由 chapters/02 以互斥组实现（02 §2.9 R4） | `learnSources` 均为固定节点，未进入任何随机池（02 R1） | chapters/02 |
| W-15 | 原创扩展落点：丐帮碧血/鹿鼎分舵、葛尔丹部骑射摔跤、将门碧血军伍、元代大理段氏余脉、杨妙真 NPC | 条目中均标"原创扩展"；不采用则删去对应 `sourceChapters` | chapters/04/07/08、chapters/02 |
| W-16 | 装备与弹药：`eq_yuxiao`、`eq_baituoshezhang`（design/10 已定地上）、`eq_kezhenezhang`、`eq_huoduzheshan`、`eq_jinchu`、`eq_jindao`、`eq_jiuhulu` 已由 design/10 定义，本文只作套装成员引用；弹药 箭、石子、枣核、火药筒 `it_huoyaotong` 待 10 补列；10 的名门暗器 `eq_duling`（毒菱）与本文暗器武学 `sk_duling` 同名不同物，建议 10 在说明中注明对应武学 | 仅引用 | design/10 |
| W-17 | 套装规则：`g_set` 取中位数、外来成员按压制后品阶计、低武可达件数口径 | §12.1 建议 | design/07 |
| W-18 | 一阳指"九品"显示、六脉"时灵时不灵"、铁掌大成"驱散难度 +1"均为对 06 规则的局部覆写 | 写在被动中 | design/06 确认 |
| W-19 | 邪派武学门槛口径：白骨爪 `morality ≤ −20` 硬门槛（05），摧心掌/灵蛇杖法/白驼毒经为软门槛 | 按 05 §7.3 地阶邪派软门槛处理，白骨爪从 05 | design/05、design/12 |
| W-20 | 05 §14.5 的图鉴拆分建议（gaibang/taohua/west/quanzhen-gumu/dali-murong）与本次分工不同 | 本文件按分工合并为 `skills-wujue.md`（85 门）；请 05 §14.5 更新文件表 | design/05 |
| W-21 | 射雕首现：本组 59 门，加全真组后约超 05 §14.4 目标（65）5%–10% | 暂不删减（射雕为本组主场，且多为原著武学） | design/05 §14.4 |
| W-22 | 本组地阶占比 28%（全局目标 21%） | 高武巅峰书界敌人主力在地阶（02 §2.11），由通行/明清图鉴的黄阶平衡全局 | design/05 §14.2 |
| W-23 | 跨图鉴去重（已按先定义者为准处理）：达尔巴金杵 → 逍遥/吐蕃组 `sk_jingangxiangmochu`；裘千尺枣核钉 → 道家组 `sk_zaoheding`；柯镇恶杖法因少林已用"伏魔杖法"`sk_fumozhangfa`，改名听声杖法 `sk_tingshengzhangfa`；段延庆杖上功夫见逍遥组 `sk_yanqingzhang`（本文一阳指"以杖代指"、段家剑法"以杖代剑"仅为致敬性被动）；逍遥组所称"蒙古扇法"即本文 `sk_huodushanfa` | 已在本文执行；请相关图鉴更新引用 | 逍遥/吐蕃组、道家组、少林组 |

### 16.2 依赖

| 依赖文档 | 事项 |
|---|---|
| design/05 | 招式预算、`effects` 钩子、`conditions`、`weaponReq.kinds`、左右互搏与白骨爪规则（§9）、降龙完整定义（§13.1） |
| design/06 | 本文引用的 91 个 `bf_*`（均已存在）；破 X、架势、硬控互斥组、Boss 豁免（`bf_shouling`）对移魂/控制类招式的影响 |
| design/07 | 15 个套装候选的定稿与计件、压制规则 |
| design/02 | 同源组扩充（W-08）、残篇与"剑源"、原生天级预算与互斥组、再遇/印证表（本组天级在倚天、笑傲的残承） |
| design/03 | `hpRegen`、`staRegen`、`dualWield` 定义；轻功值 `QS(g)` |
| design/08/09/10/11/12 | 水域/沙地/崖壁地形 ID；骑乘战斗与军阵战；装备与弹药；昼夜；门派职级、势力标签、议价 |
| chapters/01–04、05、07、08 | 获取节点（`q_*`、`npc_*` 占位）、原创扩展落点取舍（W-15）、天级互斥组（W-14） |

### 16.3 原著考据待办（"待考"汇总）

| # | 事项 |
|---|---|
| K-01 | 打狗棒法诸招名（棒打双犬、拨狗朝天、恶狗拦路、斜打狗背、獒口夺杖、反截狗臀、压肩狗背、天下无狗）的修订版出处；倚天丐帮是否仍传全套打狗棒法与降龙掌数 |
| K-02 | 逍遥游路数；莲花掌是否为丐帮原著武功；彭长老摄心术之名与黄蓉反制情节；吴长风是否使鬼头刀 |
| K-03 | 桃花岛对联逐字；旋风扫叶腿与内功口诀赠陆乘风的细节；劈空掌归属；程英所习；"二十八宿大阵"出处；黄蓉乱石阵 |
| K-04 | 灵蛇杖法之名、蛇杖机括；神驼雪山掌、蛇形刁手是否为欧阳克原著武功；王重阳以一阳指破蛤蟆功情节；逆转经脉在射雕/神雕中的表述 |
| K-05 | 六脉六剑描写逐字；天龙寺诸僧各精之脉；剑谱焚毁时点；一阳指"九品"；枯荣禅功之名；五罗轻烟掌；段延庆以杖施段家剑法/一阳指的回目；朱子柳所书碑帖；四护卫与渔樵的兵器 |
| K-06 | 空明拳十六字诀；小龙女学左右互搏的回目 |
| K-07 | 九阴真经总纲首句与下卷爪法经文逐字（同 05 K6）；易筋锻骨篇、蛇行狸翻、大伏魔拳的修订版出现位置；移魂大法施术对象；牛家村密室疗伤；白蟒鞭之名与周芷若用鞭 |
| K-08 | 铁掌招名、中指峰遗物；裘千尺枣核钉与伤公孙止之事；慈恩与水上飘 |
| K-09 | 七怪兵器与武功名（柯镇恶杖法与毒菱、南希仁掌法、全金发之秤、朱聪分筋错骨手） |
| K-10 | 杨铁心与杨再兴、杨家将的关系表述；"回马枪"是否见于修订版；明代兵书"杨家枪"与杨妙真梨花枪的关系；梨花枪火药喷筒 |
| K-11 | 霍都扇中暗器；潇湘子哭丧棒毒砂与"僵尸"之称；神箭八雄；葛尔丹部族归属；布库源流 |
