# 门派武学图鉴 · 射雕五绝体系（`skills-wujue`）

版本：v1.2（AR-01 受控扩充，2026-09-26）

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴之一。本文覆盖：丐帮（全书界）、桃花岛、白驼山、大理段氏与天龙寺、周伯通、九阴真经系、铁掌帮、江南七怪、杨家枪与将门、蒙古（射雕/神雕，金轮法王除外）。
> **上游**：`decisions/author-decisions.md`、`decisions/author-requirements.md`、`00-canon.md` v1.1（§4 品阶、§6 属性 ID、§7 分类、§12 ID、§13 天级总表、§16 改编原则、§20 装配栏）与 `decisions/rulings-v1.md`（C14/C17/C22/C23）。
> **引用而不重定义**：武功数据结构、层数、招式预算与特殊规则 → `design/05`；六角格范围模板与战斗落点语义 → `design/09`（AR-12，待 K1 重构）；Buff 定义 → `design/06`；属性与轻功值公式 → `design/03`；书界、境界、印证、残篇 → `design/02`；套装本体 → `design/07`（本文只登记候选成员和反向 `setTags`）；门派职级 → `design/12`，称谓与时代状态数据源 → `design/17`；冲穴 → `design/15`；资源、月钱与营生 → `design/16`；统一大地图与时代图层 → `design/11`，地图数据与图面 → `design/19`；NPC / 同伴 → `design/18`；正邪主线与选择节点 → `design/story/`。
> **标注约定**：**（原创扩展）** = 原著没有的武学/招名/设定；**（待考）** = 原著事实需以三联/广州修订版逐字核对；**（原创扩展命名）** = 原著有其人其兵其事而无武学名，本作命名。
> **跨界人物**（金轮法王、全真七子、杨过、小龙女等）的武学只引用其 ID，由对应图鉴定义。

---

## 0. 读法与统一约定

### 0.1 条目格式

| 品阶 | 格式 | 内容 |
|---|---|---|
| 天阶（10–12） | **完整条目卡** | 字段表（出处、origin、sourceChapters、nature、wOut/wIn、reqs、layerStats、层数要点、setTags、conflicts、special、获取、图鉴文本）＋招式表＋被动表 |
| 地阶（7–9） | **完整条目卡**（同上，字段略紧凑） | 同上 |
| 玄阶（4–6） | **紧凑卡** | 字段行＋招式与被动；新增 43 门中至少 30% 逐招展示预算核算 |
| 黄阶（1–3） | **一行表格条目** | 固定八列：ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处或标注；旧 19 张展开卡保留，并另收入统一索引表 |

- 降龙十八掌的**权威定义在 `design/05` §13.1**，本文不重复其 YAML，只补充获取、残本、套装与跨书界说明；九阴白骨爪、左右互搏的代价/机制规则以 05 §9.1.2、§9.3.2 为准，本文补齐其招式与被动。
- 所有 `grade` 为**绝对品阶**；武学施加的 Buff 品阶一律 `grade: inherit`（= 来源武学 `effGrade`，05 §2.6）。
- 字段取值、枚举与 05 §2 一致；`learnSources` 中的任务/NPC ID 为占位（`q_0N_*_9x`、`npc_*`）：任务由 `design/story/` 与 `chapters/` 登记，NPC 由 `design/18` 登记，图鉴只保留习得接口（AR-09/AR-10）。地点文字只是来源说明，正式地图锚点由 `design/19` / `design/11` 提供（AR-04/AR-11）。

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
| Buff 代价 | 硬控（定身/眩晕/缠绕/昏睡/迷惑/移魂）0.25×施加率；封穴/封内/封经脉/封绝/缴械/麻痹 0.20×施加率；数值减益、DOT（中毒/蛇毒/流血/内伤/破甲/减速/破绽/虚弱/易伤/动摇/乱心等）0.10×施加率；嘲讽 0.15×施加率；自身增益 0.10–0.20。**均不乘持续回合**（现行 `design/05` §4.2；CN-01） |
| 位移代价 | 击退 0.05/格；拉拽 0.10；突进/跳斩 0.10；绕背/换位 0.15 |
| 绝招 | `power = 3.00 × AF × Kd × Kp − Σcost`；耗气势 100、耗内 = 大阶基准 +2%、收招 1200、无冷却；核心武学首个绝招 ≤ 7 重（05 §4.8、V9） |
| 支援招式 | `power 0`；标准单体治疗 = 目标 `hpMax` 18%（cd 2），护体真气按治疗量 ×1.2 等价（05 §4.2） |
| `aoe_zone` | 倍率为"每跳"；`aoe_chain` 每跳 ×0.8 递减；`aoe_leap` 溅射 ×0.5；`aoe_boomerang` 为"每程" |
| 省略写法 | 表中"单体"= `aoe_single`，"自身"= `aoe_self`；"近身/远程/投射"= `delivery: melee / ranged / projectile`；"架"列 = `parryable`；"n 段"= `hits: n` |

> AR-12 已把战斗改为六角格，并把点/环/面/扇形的最终范围语义交 `design/09`。本文保留现有 `aoe_*` 作为待迁移的逻辑模板 ID，只用 05 §4.2 的面积因子参与本轮倍率复算；`aoe_sq*`、`aoe_diamond*` 等旧方格名称不得直接解释为六角格坐标或最终覆盖格数，须由 K1/R05 统一映射并重算后再落实现。

### 0.3 内功贡献（05 §5.5）

`IP = mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen`，第 10 重主运值；须在大阶预算 ±5% 内（黄下/中/上 19/24/30，玄下/中/上 41.5/48.5/57，地下/中/上 72/83/94.5，天下/中/上 118/135.5/156），`stats` 另计且 ≤ 大阶 `layerStats` 上限（黄 6 / 玄 10 / 地 15 / 天 20）。

AR-02 审校结果：扩充前 10 门与本轮新增 19 门内功均显式填写 `nature`，且只取 `yin / yang / harmony`；这是本作玩法分类，不冒充原著阴阳术语。

| 性质 | 内功（10/10） |
|---|---|
| `yang` | `sk_canfengyinlugong` 餐风饮露功、`sk_hama` 蛤蟆功、`sk_tiannanxinfa` 天南心法、`sk_tongshihenglian` 铜尸横练、`sk_tiezhangxinfa` 铁掌心法 |
| `yin` | `sk_nizhuanjingmai` 逆转经脉 |
| `harmony` | `sk_bitaoxuangong` 碧涛玄功、`sk_kurongchangong` 枯荣禅功、`sk_jiuyin` 九阴真经、`sk_yijinduangupian` 易筋锻骨篇 |

新增内功的性质、经脉与 IP 均在对应紧凑卡或黄阶表列出；汇总如下。经脉 ID 只引用 `design/15` 正式长名。

| 性质 | 新增内功（19 门） |
|---|---|
| `yang` | `sk_gaibangtunajue`、`sk_gaibanghuxinfa`、`sk_jiudaixingong`、`sk_tiezhangtunajue`、`sk_tiebifangshen`、`sk_jiangmenzhuang`、`sk_tuobozhuang`、`sk_wangfutunaxi`、`sk_tiezhangzhuang`、`sk_xiaomituozhuang`、`sk_caoyuantunaxi` |
| `yin` | `sk_baituotunadu`、`sk_dumaihuqigong`、`sk_shexingtunaxi` |
| `harmony` | `sk_taohuatunaxi`、`sk_duanshiyangshenggong`、`sk_jiuyintiaoxipian`、`sk_biguqipian`、`sk_yaoputunaxi` |

### 0.4 门派职级（AR-07/AR-08 接口；主定义见 `design/12`、称谓数据源见 `design/17`）

`reqs.sect.rank` 统一为五级整数 `1..5`：L1 外门、L2 入门、L3 亲传/闭门、L4 长老级分支、L5 掌门级。紧凑卡中的正式写法为 `reqs:{sect:{id:<sectId>,rank:<1..5>},...}`；丐帮袋数写进同一 `sect` 对象的 `bagCount` 附加字段。本文只用此接口决定目录访问；贡献、晋升、月钱与资源分别由 `design/12`、`design/16` 定义。

| 门派 / 组织 | `design/17` 模板 | L1 → L5 的本文称谓 |
|---|---|---|
| 丐帮 `sect_gaibang` | T05A | 一至二袋弟子 → 三至四袋弟子 → 五至六袋头目/亲传 → 七至九袋长老/龙头 → 帮主；袋数另存 `bagCount: 1..9`，不得再把袋数写成 `rank 6..11` |
| 桃花岛 `sect_taohuadao` | T04 | 岛仆/外客 → 入门弟子 → 关门弟子 → 岛务家老 → 岛主 |
| 白驼山 `sect_baituoshan` | T04/T07 | 蛇奴/外客 → 庄客 → 亲传 → 总管 → 庄主 |
| 大理段氏 `sect_dali` | T04/T08 | 王府护卫/门客 → 外姓/本家子弟 → 亲传/护国供奉 → 宗室家老 → 家主 |
| 天龙寺 `sect_tianlongsi` | T01 | 俗家弟子/沙弥 → 剃度弟子/入室僧 → 亲传弟子/闭关僧（段氏护法国师可映射 L3）→ 首座/长老 → 方丈/住持 |
| 铁掌帮 `sect_tiezhangbang` | T05B 山寨变体 | 帮众 → 香主 → 堂主 → 长老 → 帮主 |
| 江南七怪 `sect_jiangnanqiguai` | T03 小队变体 | 受业者 → 弟子 → 七怪亲传 → 七怪席位 → 盟主/师父代表（数据兼容称谓，不创“掌门”） |
| 蒙古 `sect_menggu` | T08/T07 | 部众/军士 → 队正 → 亲随/百户 → 将领/万户 → 大汗幕府统领；政治身份不由武学晋升取得 |

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
| `sect_gaibang` | 丐帮 | 原著：天龙、射雕、神雕、倚天、笑傲；原创扩展：碧血、鹿鼎等书界的分舵 | 正 | 各地分舵（天龙洛阳/无锡杏子林、射雕君山大会、神雕襄阳）；总舵与分舵的时代地图锚点由 `design/11` 定义 | 萧峰、洪七公、黄蓉、鲁有脚、耶律齐、史火龙、解风 | 至刚掌法＋奇巧棒法＋群战阵法 | 阳 | 可（袋位制；帮主为剧情位） | 41 |
| `sect_taohuadao` | 桃花岛 | 射雕、神雕 | 亦正亦邪 | 东海桃花岛 | 黄药师、黄蓉、陆乘风、程英；梅超风/陈玄风（叛出） | 奇门五行、指掌轻灵、音律、阵法、医药 | 调和 | 有限（拜黄药师门槛极高；黄蓉/程英羁绊线） | 25 |
| `sect_baituoshan` | 白驼山 | 射雕、神雕 | 邪 | 西域白驼山 | 欧阳锋、欧阳克 | 蛇毒、蓄劲刚猛、杖法、驭蛇 | 阳（蛤蟆功）；阴（逆转经脉） | 可（射雕邪派路线） | 18 |
| `sect_dali` | 大理段氏 | 原著：天龙（段氏）、射雕/神雕（一灯与渔樵耕读）；倚天（朱武连环庄为朱子柳、武三通后人，原著；其武学传承为原创扩展） | 正 | 大理国镇南王府；射雕/神雕为一灯与弟子的隐居山谷（具体地图锚点见 `design/11`） | 段正明、段正淳、段誉、段延庆、一灯、朱子柳、武三通 | 指力点穴、剑法、书法入武 | 阳（一阳） | 可（天龙王府护卫/客卿；射雕/神雕入一灯门下） | 21 |
| `sect_tianlongsi` | 天龙寺 | 天龙 | 正 | 大理天龙寺 | 枯荣、本因、本观、本相、本参、本尘（保定帝） | 禅功、六脉剑气 | 调和 | 有限（护法居士，天龙；入门武学借用大理段氏） | 2 |
| —（传承 `lineage: 周伯通`） | 周伯通 | 射雕、神雕 | 正 | 终南山、桃花岛石洞、百花谷 | 周伯通、郭靖、小龙女 | 以柔克刚、一心二用 | 调和倾向 | 否（羁绊传授） | 4 |
| —（传承 `lineage: 九阴真经`） | 九阴真经系 | 射雕、神雕、倚天 | 正法/邪练 | —（秘籍） | 黄裳（著）、周伯通、郭靖、黄蓉、梅超风、陈玄风、欧阳锋、周芷若 | 百家兼收：内功、爪、掌、拳、鞭、身法、心神 | 调和（总纲） | 否（秘籍/奇遇） | 14 |
| `sect_tiezhangbang` | 铁掌帮 | 射雕（神雕余绪：裘千尺、慈恩） | 邪（射雕时通金） | 湖南铁掌峰 | 上官剑南（前帮主）、裘千仞、裘千尺、裘千丈 | 刚猛掌力、踏水轻功 | 阳 | 可（射雕邪派/卧底线） | 12 |
| `sect_jiangnanqiguai` | 江南七怪 | 射雕（神雕余绪：柯镇恶） | 正 | 嘉兴 | 柯镇恶、朱聪、韩宝驹、南希仁、张阿生、全金发、韩小莹 | 各擅兵刃、杂而不精，重合斗 | 阳/中性 | 可（射雕前期拜师线） | 16 |
| —（传承 `lineage: 杨家将`） | 杨家枪与将门 | 原著：射雕（杨铁心）、射雕/神雕/倚天（武穆遗书）；原创扩展：明清军伍通行枪法 | 正 | 临安牛家村等 | 杨铁心、穆念慈、郭靖 | 枪法、兵法 | 阳 | 否（传承/秘籍） | 11 |
| `sect_menggu` | 蒙古诸部 / 幕府 | 原著：射雕、神雕；倚天（元廷时代背景）；原创扩展：鹿鼎（葛尔丹部） | 射雕中立 / 神雕敌对 | 漠北草原；忽必烈大营 | 成吉思汗、哲别、拖雷、霍都、达尔巴、潇湘子 | 骑射、摔跤、奇门兵器 | 阳 | 可（射雕部族身份；神雕敌对路线） | 18 |
| **合计** | | | | | | | | | **182**（天 13 / 地 23 / 玄 71 / 黄 75） |

> 霍都、达尔巴为金轮法王弟子，按分工收在"蒙古"；其师门武学（龙象般若功 `sk_longxiang` 等）与达尔巴金杵武学 `sk_jingangxiangmochu` 归逍遥/吐蕃组图鉴，本文只引用。周伯通名义属全真，但空明拳、左右互搏为其自创，故单列传承；全真武学引用全真图鉴 ID。

---

## 2. 丐帮 `sect_gaibang`

### 2.1 门派简介

- **时代变迁**：北宋时已号"天下第一大帮"（天龙：乔峰为帮主，杏子林叛乱、聚贤庄之后乔峰去帮）；南宋射雕时北丐洪七公为五绝之一，传帮主位于黄蓉（君山大会，净衣/污衣两派之争）；神雕时黄蓉传鲁有脚、后耶律齐，丐帮随郭靖守襄阳，最为鼎盛；倚天时降龙十八掌已残缺，帮主史火龙久不理事，丐帮一度为陈友谅/成昆所乘；笑傲时帮主解风与少林、武当并列正派领袖。明末清初的丐帮分舵为**（原创扩展）**，只提供黄/玄阶通行武学，填补中武/低武书界的装配栏。
- **各书界强弱**：天龙 强（乔峰）／射雕 强（洪七公）／神雕 极强（郭黄、襄阳）／倚天 中（残本）／笑傲 中（解风）／碧血、鹿鼎 弱（原创扩展分舵，仅黄玄）。
- **加入与晋升**：按 T05A 五级制（§0.4）；袋数另存 `bagCount`。门规“不得欺压良善、不得依附官府”为**（原创扩展）**概括；帮主 L5 的实际可达性与剧情时点由 `design/12` 定义，本文不另设第六级。
- **进阶链**：拳掌 穷家拳（黄中）→ 莲花掌（玄中）→ 铁钵功（地下，另需餐风饮露功）；棍 赶狗棍法（黄下）→ 打狗阵（地下）。降龙十八掌、打狗棒法不设门派前置（原著郭靖、杨过均非循序而得）。

### 2.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_xianglong18` | 降龙十八掌 | 拳脚/拳掌 | 12 天上 | 阳 | 0.45/0.55 | 天龙、射雕、神雕（倚天残本） | 萧峰羁绊；洪七公"美食换武功"；郭靖襄阳线；倚天残本秘籍 | 原著（数据见 05 §13.1） |
| `sk_dagou` | 打狗棒法 | 兵器/棍杖 | 11 天中 | 中性 | 0.70/0.30 | 天龙、射雕、神雕、倚天 | 帮主传承；洪七公授招＋黄蓉授诀；倚天残谱与本土复原支线 | 原著（八字诀原著；招效及倚天完本途径原创扩展） |
| `sk_tiebogong` | 铁钵功 | 兵器/奇门（钵） | 7 地下 | 阳 | 0.55/0.45 | 笑傲、碧血 | 丐帮长老拜师（八袋）；碧血残谱 | 原创扩展（"掌钵龙头"职名为倚天原著） |
| `sk_dagouzhen` | 打狗阵 | 杂学/阵法 | 7 地下 | 中性 | 0.60/0.40 | 天龙、射雕、神雕、笑傲 | 长老传授（六袋）；射雕君山破阵事件 | 原著（射雕君山）；他书界为原创扩展延续 |
| `sk_suohouqinnashou` | 锁喉擒拿手 | 拳脚/擒拿 | 6 玄上 | 阳 | 0.70/0.30 | 天龙、射雕、神雕、笑傲、碧血 | 天龙：马大元遗谱/白世镜；后世丐帮传承（五袋） | 原著（天龙·马大元成名绝技）；后世传承原创扩展 |
| `sk_xiaoyaoyou` | 逍遥游 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.65/0.35 | 射雕、神雕 | 洪七公/黄蓉羁绊传授 | 原著（射雕·洪七公授黄蓉）；招名原创扩展 |
| `sk_shexinshu` | 摄心术 | 杂学/心神 | 6 玄上 | 中性 | 0.20/0.80 | 射雕、神雕 | 击败彭长老得其心法；神雕丐帮长老 | 原著人物与术法；正式术名见 §2.5 考据项 |
| `sk_lianhuazhang` | 莲花掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.70/0.30 | 射雕、神雕、倚天、笑傲、碧血、鹿鼎 | 四袋弟子 | 暂用名，原著依据见 §2.5 考据项；招式为原创扩展 |
| `sk_guitoudaofa` | 鬼头刀法 | 兵器/刀 | 5 玄中 | 阳 | 0.80/0.20 | 天龙、射雕、神雕、倚天、笑傲、碧血、鹿鼎 | 三袋弟子；天龙吴长风指点 | 原创扩展命名（《天龙八部》中吴长风以鬼头刀为兵器） |
| `sk_canfengyinlugong` | 餐风饮露功 | 内功 | 4 玄下 | 阳 | 0/1 | 天龙—笑傲、碧血、鹿鼎 | 二袋弟子 | 原创扩展 |
| `sk_yunyoubu` | 云游步 | 轻功 | 3 黄上 | 中性 | — | 天龙—笑傲、碧血、鹿鼎 | 一袋弟子 | 原创扩展 |
| `sk_qiongjiaquan` | 穷家拳 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；观摩 | 原创扩展 |
| `sk_lianhualuo` | 莲花落 | 杂学/音律 | 2 黄中 | 中性 | — | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；街市乞儿 | **（原创扩展）**借民间曲艺“莲花落”构造的丐帮音律杂学，不宣称为原著武学 |
| `sk_gangougunfa` | 赶狗棍法 | 兵器/棍杖 | 1 黄下 | 中性 | 0.90/0.10 | 天龙—笑傲、碧血、鹿鼎 | 入帮即授；观摩 | 原创扩展 |

> "天龙—笑傲"= `ch01_tianlong`–`ch05_xiaoao` 五部；碧血 `ch07_bixue`、鹿鼎 `ch08_luding` 为原创扩展分舵，若 `chapters/07`、`chapters/08` 不设丐帮分舵，则删去对应 `sourceChapters`。
> 倚天的五绝旧图鉴可习得投放以 `rulings-v1` §3.4 白名单为准：本节只保留降龙残承、打狗棒法、莲花掌、鬼头刀法、餐风饮露功、云游步、穷家拳、莲花落、赶狗棍法；铁钵功、打狗阵、锁喉擒拿手在倚天仍可供 NPC 表现或图鉴见闻，但没有玩家学习来源。

### 2.3 天阶条目卡

#### `sk_xianglong18` 降龙十八掌（12 天上 · 拳脚/拳掌 · 丐帮）——补充说明

**权威定义见 `design/05` §13.1**（十八掌招式、被动、层数、倍率、`learnSources`）。本文只作以下补充，均不改动 05 的数值：

| 项 | 补充 |
|---|---|
| 倚天残本 | 05 以 `it_miji_xianglong18_can`（`maxLayer 6`）实现。按 05 §13.1 的层数表，前 6 重恰好解锁 12 掌（亢龙有悔 … 时乘六龙），与“倚天丐帮所存降龙掌数不全”的原著背景相合；《倚天屠龙记》中史火龙实际练成的掌数与残传描述（待考，05 K1）。残本不含第 7 重起的密云不雨、损则有孚与绝招。 |
| 残本与完本 | 外来者带入倚天的完本仍为 10 重；倚天高武无品阶压制，残本只作为未习得者的补充途径。笑傲及以后无原生途径（不设印证）。 |
| 获取预算 | 天龙"丐帮系"与打狗棒法二选一（02 §2.9）；射雕洪七公线为五绝拜师之一；神雕郭靖线计入"郭家与丐帮系"。 |
| setTags | `set_gaibang_bangzhu`、`set_guojing_xiazhe`、`set_qidan_xiaofeng`；后两项是 C22 要求的跨组反向登记，`design/05` §13.1 须同步。 |
| 相生 | 与餐风饮露功（阳）同装：主运阳 → 降龙阳招 Z5 +12%（05 §5.3 相性矩阵，非额外加成）。 |

#### `sk_dagou` 打狗棒法（11 天中 · 兵器/棍杖 · 丐帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕（洪七公传黄蓉；君山大会）、神雕（黄蓉传鲁有脚；杨过得洪七公授招、偷听口诀）；“绊、劈、缠、戳、挑、引、封、转”八字诀为原著；各招名分别由《射雕英雄传》《神雕侠侣》中洪七公、黄蓉或杨过使用的具体场景（待考） |
| origin / lineage | `canon` / 丐帮历代帮主（汪剑通 → 乔峰 … 洪七公 → 黄蓉 → 鲁有脚 → 耶律齐 …） |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `neutral`（招意在巧不在力）· 0.70/0.30 · 5 |
| weaponReq | `{category: staff}`（持打狗棒 `eq_dagoubang` 的加成走套装，§12） |
| reqs | `attrs {agi 55, wis 55}`；`aptitude {apStaff 55}`；`morality {min 0}`；`sect {id: sect_gaibang, rank: 5}`；`hard [sect, morality]`（非帮主途径以 `reqsOverride {sect: null}` 放开，见获取） |
| layerStats | `parry [4, 12]`、`pierce [2, 8]`（合计 20） |
| 层数要点 | 1：棒打双犬、绊字诀、八字真诀 ｜ 2：缠字诀 ｜ 3：拨狗朝天、以巧破力 ｜ 4：恶狗拦路 ｜ 5：斜打狗背、棒影 ｜ 6：引字诀 ｜ **7：绝招 天下无狗** ｜ 8：獒口夺杖、反截狗臀 ｜ 9：压肩狗背、巧打 ｜ 10：八诀归一 |
| setTags | `[set_gaibang_bangzhu]` |
| conflicts | 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | ① 天龙 `qiyu` `q_01_faction_91`（丐帮变乱后护帮有功，传功长老代传，原创扩展；与降龙二选一）`maxLayer 8`；② 射雕 `master npc_hongqigong` `maxLayer 6`（"有招无诀"，`reqsOverride {sect: null}`）＋ `master npc_huangrong` `maxLayer 10`（羁绊 ≥ 4 或入帮至九袋）；③ 神雕 `qiyu q_03_qiyu_92`（华山绝顶观洪七公与欧阳锋拆招，致敬杨过）`maxLayer 6` ＋ `master npc_huangrong` `maxLayer 10`；④ 倚天 `manual it_miji_dagou_can` `maxLayer 6`，并设 `qiyu q_04_faction_9x`（寻回旧谱、由本土丐帮传功者补全口诀，**原创扩展**）`maxLayer 10`；完本途径 `reqsOverride {sect: null}`，仍计本章五绝系天级取得预算 |
| 图鉴文本 | 丐帮镇帮绝学，历代只传帮主。以绊、劈、缠、戳、挑、引、封、转八字诀为纲，轻灵奇巧、以巧破力；"天下无狗"一出，四面八方尽是棒影。招式效果为本作原创设计。 |

| 招式（ID）· 诀 | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 棒打双犬 `mv_dagou_bangdashuangquan` · 劈 | 1 | `aoe_chain n1` · 1–2 · 近身 | 0.90（跳段 ×0.8） | 8%/1/1000 | — | 可 | 0.80×(1+0.12) |
| 绊字诀 `mv_dagou_ban` · 绊 | 1 | 单体 · 1–2 · 近身 | 0.75 | 7%/1/900 | `bf_dingshen` 60% 1；`bf_chihuan` 100% | 可 | (1+0.12−0.05−0.07)−0.15−0.10 |
| 缠字诀 `mv_dagou_chan` · 缠 | 2 | 单体 · 1–2 · 近身 | 1.05 | 8%/2/1000 | `bf_chanrao` 70% 2 | 可 | 1.24−0.25×0.70 = 1.065 |
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
| sourceChapters | `ch05_xiaoao` `ch07_bixue` |
| nature · wOut/wIn · moveSlots | `yang` · 0.55/0.45 · 4 |
| weaponReq | `{category: exotic, kinds: [misc]}`（钵；建议 design/10 增设细类 `bowl`，待决 W-04） |
| reqs | `attrs {str 40, con 40}`；`aptitude {apExotic 40}`；`prereq [{skill: sk_lianhuazhang, layer: 5}, {skill: sk_canfengyinlugong, layer: 5}]`；`sect {id: sect_gaibang, rank: 4, bagCount: 8}`；`hard [sect, prereq]` |
| layerStats | `parry [3, 9]`、`defOut [1, 6]`（合计 15） |
| 层数要点 | 1：钵盂叩击、托钵化缘、化缘 ｜ 3：飞钵回旋 ｜ 4：钵挡 ｜ 5：钵底藏锋 ｜ **7：绝招 钵震八方** ｜ 8：扣钵 ｜ 9：回旋 ｜ 10：钵纳百川 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 笑傲 `master npc_gaibang_zhanglao` `maxLayer 10`；碧血 `manual it_miji_tiebogong_can` `maxLayer 7`；`observe` 6。倚天掌钵龙头仅作出处原型与 NPC 见闻，不产生可拼完整秘籍的残页 |
| 图鉴文本 | （原创扩展）丐帮掌钵龙头一脉的奇门功夫，以精铁钵盂为兵：托钵可挡刀剑暗器，飞钵回旋伤人。"掌钵龙头"为倚天原著中的丐帮职名，本作据此衍出其武学。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 钵盂叩击 `mv_tiebogong_kouji` | 1 | 单体 · 1 · 近身 | 0.95 | 7%/0/1000 | `bf_zhenshe` 25% | 可 | 1−0.025 |
| 托钵化缘 `mv_tiebogong_tuobo` | 1 | 自身架势 | 0 | 5%/2/800 | 自身 `bf_shoushi` 2、`bf_fanzhen` 2 | — | 架势招式 |
| 飞钵回旋 `mv_tiebogong_feibo` | 3 | `aoe_boomerang n3` · 投射 | 0.90/程 | 8%/2/1000 | — | 可 | 0.75×(1+0.24+0.05)×0.92 |
| 钵底藏锋 `mv_tiebogong_bodi` | 5 | 单体 · 1 · 近身 | 1.05 | 7%/1/1000 | `bf_pojia` 50% | 可 | 1.12−0.05 |
| **钵震八方** `mv_tiebogong_zhenbafang`（绝招） | 7 | `aoe_around` · 自身 | 1.80 | 9%/—/1200 | `bf_zhenshe` 100%；击退 1 | 可 | 3.00×0.65−0.10−0.05 |
| 扣钵 `mv_tiebogong_koubo` | 8 | 单体 · 1 · 近身 | 1.25 | 8%/3/1000 | `bf_dingshen` 60% 2 | 可 | (1+0.36+0.05)−0.25×0.60 = 1.26 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_tiebogong_huayuan` | 化缘 | 1 | trigger | settle | [0.01, 0.03] | `onParry`（每回合 1 次）：回复 {v} `mpMax` |
| `ps_tiebogong_bodang` | 钵挡 | 4 | stat | Z4 | [0.05, 0.10] | 主手持钵时，受到 `projectile` 招式与暗器伤害 −{v} |
| `ps_tiebogong_huixuan` | 回旋 | 9 | trigger | — | 1.0 | 飞钵回旋回程命中时附加 `bf_chihuan` |
| `ps_tiebogong_dacheng` | 钵纳百川 | 10 | mechanic | settle | — | 主手持钵时，战斗开始获得常驻 `bf_fanzhen`（`dur 99`，品阶 inherit） |

#### `sk_dagouzhen` 打狗阵（7 地下 · 杂学/阵法 · 丐帮）

| 字段 | 值 |
|---|---|
| 出处 | 射雕君山丐帮大会，群丐围困郭靖、黄蓉；该阵势在《射雕英雄传》中是否正式称“打狗阵”及其走位细节（待考）。天龙、神雕、倚天、笑傲的延续为**（原创扩展）**；倚天只作 NPC 阵势表现，不开放玩家学习 |
| origin / lineage | `canonExpanded` / 丐帮长老与龙头统率 |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` `ch05_xiaoao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0.60/0.40 · 4 |
| reqs | `attrs {wis 40, cha 30}`；`skills {formation: 40}`；`prereq [{skill: sk_gangougunfa, layer: 5}]`；`sect {id: sect_gaibang, rank: 3, bagCount: 6}`；`hard [sect, prereq]`（`formation` 为软门槛，C17） |
| layerStats | `effHit [3, 9]`、`parry [1, 6]`（合计 15） |
| 层数要点 | 1：围阵、群丐合围、阵势 ｜ 4：阵转 ｜ 5：诱敌入阵、围而不攻 ｜ **7：绝招 收网** ｜ 8：截道 ｜ 10：阵成 |
| setTags / conflicts | `set_gaibang_bangzhu` / 无 |
| special / observable | `{fusible: false}`（阵法） / `true` |
| 获取 | 射雕 `master npc_luyoujiao` `maxLayer 10`、`qiyu q_02_main_9x`（君山破阵后领悟，`maxLayer 6`）；天龙 `master npc_gaibang_chuangong` `maxLayer 8`（原创扩展）；神雕/笑傲 `master` 丐帮长老 `maxLayer 10` |
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

**`sk_suohouqinnashou` 锁喉擒拿手**（6 玄上 · 拳脚/擒拿 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 30, agi 30}`、`aptitude {apGrapple 30}`、`sect {id: sect_gaibang, rank: 3, bagCount: 5}`（硬）｜layerStats：`seal [2,6]`、`crit [1,4]`｜获取：天龙 `manual it_miji_suohouqinnashou`（马大元遗物，原创扩展）/ `master npc_baishijing`（执法长老，事败前）；射雕、神雕、笑傲、碧血丐帮五袋 `master`；`observe` 6｜出处：天龙·马大元成名绝技，白世镜以之害马大元并嫁祸（原著）；倚天不设玩家学习来源

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 锁喉 `mv_suohouqinnashou_suohou` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengnei` 35% 1 | 可 | 1.12−0.07 |
| 扣腕 `mv_suohouqinnashou_kouwan` | 2 | 单体·1 | 0.85 | 6%/0/900 | `bf_jiaoxie` 35%（targetArmed） | 可 | 0.93−0.07 |
| 折臂 `mv_suohouqinnashou_zhebi` | 4 | 单体·1 | 1.25 | 7%/2/1000 | `bf_gushang` 40% | 可 | 1.29−0.04 |
| 锁喉擒龙 `mv_suohouqinnashou_qinlong` | 7 | 单体·1 | 1.15 | 7%/3/1000 | `bf_dingshen` 60% 1；`bf_fengnei` 60% 1 | 可 | 1.41−0.15−0.12 |

被动：`ps_suohouqinnashou_nahou` 拿喉（1，stat Z0：本武学招式暴击 +[3, 8]）；`ps_suohouqinnashou_suoguan` 锁关（5，trigger `onHit` 15%：`bf_fengjingmai`〔封拳脚〕1 回合）；`ps_suohouqinnashou_dacheng` 擒拿圆熟（10，stat Z3：对带 `seal` 标签效果的目标 +15%）。

**`sk_xiaoyaoyou` 逍遥游**（6 玄上 · 拳脚/拳掌 · 阳 · 0.65/0.35 · 栏 3）｜reqs：`attrs {agi 30}`、`aptitude {apFist 30}`（无门派门槛）｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_hongqigong`（羁绊 ≥ 2）/ `master npc_huangrong`；神雕 `master npc_huangrong`；`observe` 6｜出处：洪七公把少年时所练的逍遥游拳法传给黄蓉（《射雕英雄传》）；本作各招效果为原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 鲲化为鹏 `mv_xiaoyaoyou_kunhua` | 1 | `aoe_dash n3`·1–3 | 1.00 | 6%/1/1000 | 突进 | 可 | 1.12−0.10 |
| 扶摇直上 `mv_xiaoyaoyou_fuyao` | 3 | `aoe_leap`·1–3 | 1.05 | 7%/2/1000 | 跳斩；`leapHeightExtra {n: 1}` | 可 | 0.90×1.29−0.10 |
| 水击三千 `mv_xiaoyaoyou_shuiji` | 5 | `aoe_line n3`·1–3·远程 | 0.90 | 7%/2/1000 | — | 可 | 0.80×1.29×0.85 |
| 抟风九万 `mv_xiaoyaoyou_tuanfeng` | 7 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |

被动：`ps_xiaoyaoyou_youwuqiong` 游无穷（1，stat Z3：本回合移动 ≥ 3 格后本武学招式 +[5%, 10%]）；`ps_xiaoyaoyou_wusuodai` 无所待（5，effect：闪避成功后自身下一招收招 −100）；`ps_xiaoyaoyou_wuji` 无己（10，mechanic：免疫品阶 ≤ 自身的 `bf_dingshen`）。

**`sk_shexinshu` 摄心术**（6 玄上 · 杂学/心神 · 中性 · 0.20/0.80 · 栏 3）｜reqs：`attrs {wil 35, wis 30}`｜layerStats：`effHit [2,6]`、`resMind [1,4]`｜conflicts：`{with: sk_yihun, type: counter}`——移魂大法持有者（品阶 ≥ 本武学）免疫本武学，施术失败时施术者 50% 反受 `bf_luanxin` 1 回合；《射雕英雄传》中黄蓉反制彭长老迷魂术的过程与双方术名（待考）｜获取：射雕 `qiyu q_02_side_9x`（击败彭长老得其心法，原创扩展）`maxLayer 10`；神雕 `manual it_miji_shexinshu`（彭长老遗谱，原创扩展）｜出处：彭长老确有以言语、眼神迷惑黄蓉的情节；“摄心术”为暂用名

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 摄心 `mv_shexinshu_shexin` | 1 | 单体·1–3·远程 | 0 | 6%/2/1000 | `bf_hunshui` 40% 2 | — | 纯控制 |
| 慑魂 `mv_shexinshu_shehun` | 4 | `aoe_cone n2`·远程 | 0 | 6%/3/1000 | `bf_dongyao` 100%；`bf_luanxin` 30% | — | 纯控制 |
| 迷魂 `mv_shexinshu_mihun` | 7 | 单体·1–3·远程 | 0 | 8%/4/1000 | `bf_mihuo` 50% 1 | — | 纯控制 |

被动：`ps_shexinshu_xinyan` 心眼（1，stat：本武学效果命中 `effHit` +[3%, 8%]）；`ps_shexinshu_rumeng` 入梦（10，mechanic：本武学施加的 `bf_hunshui` 持续 +1，对 Boss 无效）。

**`sk_lianhuazhang` 莲花掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 25, con 25}`、`aptitude {apFist 25}`、`prereq [{skill: sk_qiongjiaquan, layer: 4}]`、`sect {id: sect_gaibang, rank: 2, bagCount: 4}`（硬：sect、prereq）｜layerStats：`parry [1,5]`、`defOut [1,5]`｜setTags：`[]`｜获取：丐帮四袋 `master`（射雕—笑傲、碧血、鹿鼎）；`pages it_canye_lianhuazhang`（4 页）；`observe` 6｜出处：《射雕英雄传》中丐帮是否有“莲花掌”正式名、由何人使用及所在情节（待考）；现招式和后世传承均为原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 并蒂莲开 `mv_lianhuazhang_bingdi` | 1 | 单体·1（2 段） | 1.10 | 6%/1/1000 | — | 可 | 1.12 |
| 莲叶田田 `mv_lianhuazhang_lianye` | 3 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 出水芙蓉 `mv_lianhuazhang_chushui` | 5 | 单体·1 | 1.05 | 6%/1/1000 | 击退 1 | 可 | 1.12−0.05 |
| 莲心藏刺 `mv_lianhuazhang_lianxin` | 7 | 单体·1 | 1.25 | 7%/2/1000 | `bf_pojia` 50% | 可 | 1.29−0.05 |

被动：`ps_lianhuazhang_lianjin` 莲劲（1，stat Z2：本武学无视目标外功防御 [3%, 8%]）；`ps_lianhuazhang_buran` 出淤不染（5，stat：`resPoison` +[4, 10] pp）；`ps_lianhuazhang_liantai` 莲台（10，stat Z3：连续两次行动命中同一目标时本武学 +10%）。

**`sk_guitoudaofa` 鬼头刀法**（5 玄中 · 兵器/刀 · 阳 · 0.80/0.20 · 栏 3）｜reqs：`attrs {str 30}`、`aptitude {apBlade 30}`、`sect {id: sect_gaibang, rank: 2, bagCount: 3}`（硬）｜layerStats：`hit [1,4]`、`crit [1,6]`｜获取：天龙 `master npc_wuchangfeng`（吴长风羁绊）`maxLayer 10`；射雕起丐帮三袋 `master`；`pages`；`observe` 6｜出处：《天龙八部》中吴长风以鬼头刀为兵器；刀法名、招名及后世传承为**（原创扩展命名）**

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 鬼头开路 `mv_guitoudaofa_kailu` | 1 | 单体·1 | 0.95 | 6%/0/1000 | `bf_liuxue` 30% | 可 | 1−0.03 |
| 阎罗点卯 `mv_guitoudaofa_dianmao` | 3 | `aoe_line n2` | 0.95 | 6%/1/1000 | — | 可 | 0.85×1.12 |
| 夜叉探海 `mv_guitoudaofa_tanhai` | 5 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 无常索命 `mv_guitoudaofa_suoming` | 7 | 单体·1 | 1.25 | 7%/2/1000 | `bf_liuxue` 60% | 可 | 1.29−0.06 |

被动：`ps_guitoudaofa_daochen` 刀沉（1，stat Z6：本武学暴击伤害 +[5, 12] pp）；`ps_guitoudaofa_shaqi` 煞气（5，trigger `onKill`：自身 `bf_zhanyi` +1 层）；`ps_guitoudaofa_dacheng` 索命（10，stat Z3：对带 `bleed` 标签效果的目标 +8%）。

**`sk_canfengyinlugong` 餐风饮露功**（4 玄下 · 内功 · `nature: yang` · 0/1 · 栏 3）｜**（原创扩展）**丐帮弟子耐饥寒、走江湖的根基心法｜reqs：`attrs {con 25}`、`sect {id: sect_gaibang, rank: 1, bagCount: 2}`（硬）｜contribution：`mpMaxPct 12, hpMaxPct 10, attrs {con 6}, mpRegen 1.5, stats {resCold 5, resPoison 5}`（IP = 12+10+2×6+5×1.5 = **41.5**）｜setTags：`[set_gaibang_bangzhu]`｜获取：丐帮二袋 `master`（全部丐帮书界）；碧血/鹿鼎 `manual it_miji_canfengyinlugong`；`pages`

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 吐纳 `mv_canfengyinlugong_tuna` | 3 | 自身 | 0 | 5%/3/900 | 自身 `bf_huinei` 3 | — | 支援 |
| 忍饥耐寒 `mv_canfengyinlugong_renji` | 6 | 自身 | 0 | 6%/3/1000 | 驱散自身 `cold`/`poison` 1 个（≤ 品阶）；回复 10% `hpMax` | — | 支援（低于标准治疗） |

被动：`ps_canfengyinlugong_canfeng` 餐风（1，stat：`hpRegen` +[0.5, 1.5]，`auxMode scaled`）；`ps_canfengyinlugong_yinlu` 饮露（5，mechanic：战斗外体力消耗 −10%，`bf_shouhan` 持续减半，`auxMode full`）；`ps_canfengyinlugong_bainao` 百折不挠（10，stat Z4：气血 < 30% 时受到伤害 −8%）。

**`sk_yunyoubu` 云游步**（3 黄上 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**｜reqs：`sect {id: sect_gaibang, rank: 1, bagCount: 1}`（硬）｜轻功值 `Q_skill` 按 03 §4.5 `QS(3) = 45`｜layerStats：`eva [1,4]`、`tough [1,2]`｜获取：丐帮一袋 `master`；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 游方 `mv_yunyoubu_youfang` | 1 | 自身 | 0 | 3%/2/800 | 自身 `bf_jixing` 2 | — | 支援 |
| 千里行乞 `mv_yunyoubu_qianli` | 5 | 自身 | 0 | 4%/3/900 | 自身 `bf_dunzou` 2 | — | 支援 |

被动：`ps_yunyoubu_yunyou` 云游（1，mechanic：探索中体力消耗 −[5%, 15%]）；`ps_yunyoubu_yuanman` 走遍天下（10，mechanic：大地图旅行耗时 −10%，design/11 接口）。

**`sk_qiongjiaquan` 穷家拳**（2 黄中 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**丐帮入门拳｜reqs：无（入帮即授）｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`[]`｜获取：丐帮 `master`（入帮）；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 叫化开门 `mv_qiongjiaquan_kaimen` | 1 | 单体·1 | 0.90 | 4%/0/950 | — | 可 | 1−0.05−0.035 |
| 讨饭连环 `mv_qiongjiaquan_lianhuan` | 4 | 单体·1（2 段） | 1.10 | 5%/1/1000 | — | 可 | 1.12 |
| 滚地十八跌 `mv_qiongjiaquan_gundi` | 7 | `aoe_sweep` | 0.80 | 5%/1/1000 | `bf_panshan` 50% | 可 | 0.75×1.12−0.05 |

被动：`ps_qiongjiaquan_picao` 皮糙肉厚（5，stat：`resCC` +[5, 10] pp）；`ps_qiongjiaquan_yuanman` 入帮圆满（10，mechanic：首次练满 `apFist` +1（全游戏一次）；此后丐帮拳脚武学资质软门槛 −10）。

**`sk_lianhualuo` 莲花落**（2 黄中 · 杂学/音律 · 中性 · 栏 3）｜**（原创扩展）**乞者唱曲，丐帮以之鼓劲、传讯｜reqs：无｜强度技艺 `music`（05 §2.3）｜layerStats：`effHit [1,3]`、`resMind [1,3]`｜setTags：`[]`｜获取：丐帮入帮；街市乞儿事件（design/11）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 数来宝 `mv_lianhualuo_shulaibao` | 1 | `aoe_allies r2` | 0 | 4%/3/1000 | 友方 `bf_juqi` 2 | — | 支援 |
| 讨赏 `mv_lianhualuo_taoshang` | 4 | `aoe_cone n2`（敌） | 0 | 4%/2/1000 | `bf_xieqi` 40% | — | 纯控制 |
| 群丐应和 `mv_lianhualuo_yinghe` | 7 | `aoe_allies r3` | 0 | 5%/4/1000 | 友方 `bf_ruiyi` 1 | — | 支援 |

被动：`ps_lianhualuo_anhao` 暗号（1，mechanic：探索中可用莲花落与丐帮弟子互通消息，解锁丐帮情报对话，design/12 接口）；`ps_lianhualuo_yuanman` 圆满（10，stat：本武学施加的增益持续 +1）。

**`sk_gangougunfa` 赶狗棍法**（1 黄下 · 兵器/棍杖 · 中性 · 0.90/0.10 · 栏 3）｜**（原创扩展）**乞儿防身的竹棒法，打狗阵之基｜reqs：无｜layerStats：`parry [1,4]`、`hit [1,2]`｜setTags：`[]`｜获取：丐帮入帮；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 当头棒喝 `mv_gangougunfa_banghe` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 拨草寻蛇 `mv_gangougunfa_bocao` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 棒打落水 `mv_gangougunfa_luoshui` | 7 | 单体·1–2 | 1.05 | 5%/1/1000 | `bf_chihuan` 50% | 可 | 1.12−0.05 |

被动：`ps_gangougunfa_ganggou` 赶狗（1，stat Z3：对带 `beast` 标签的敌人（野兽，design/09 敌人标签）+[10%, 20%]）；`ps_gangougunfa_yuanman` 圆满（10，mechanic：首次练满 `apStaff` +1；学习打狗阵、打狗棒法时棍杖资质软门槛 −10）。

### 2.6 AR-01 新增玄阶紧凑卡（14 门）

> 本节 14 门均为**（原创扩展）**；“丐帮分舵/龙头职掌”只作为玩法分支，不冒充原著具名武学。`sourceChapters` 默认遵守 §2.2 的时代边界；其中倚天仅保留裁定白名单，故新增门派艺只投放天龙、射雕、神雕、笑傲、碧血、鹿鼎。

#### `sk_gaibangtunajue` 丐帮吐纳诀（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{sect:{id:sect_gaibang,rank:1,bagCount:1},hard:[sect]}`；`inner.contribution:{mpMaxPct:14,hpMaxPct:8,attrs:{con:4,str:2},mpRegen:1.5,stats:{resCold:5,resPoison:5}}`，`IP=14+8+2×6+5×1.5=41.5`；`inner.meridians:[mer_dumai]`；`setTags:[]`。

- 招式：沿街调息 `mv_gaibangtunajue_tiaoxi`（L1，自身，5%/3，`bf_huinei`2，`power:0`）；护腹运气 `mv_gaibangtunajue_hufu`（L4，自身，6%/3，`bf_jiangu`2，`power:0`）。
- 被动：耐饥 `ps_gaibangtunajue_naiji`（体力消耗 −5%→12%）；行乞根基 `ps_gaibangtunajue_genji`（丐帮玄阶修炼 +10%）。获取：L1 传功；后世分舵来源均明确标原创。

#### `sk_liuyunbu` 流云步（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.55/0.45`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`Q_skill=QS(4)=56`；`reqs:{attrs:{agi:25},aptitude:{apLight:22},sect:{id:sect_gaibang,rank:1},hard:[sect]}`；`layerStats:{eva:[1,5],tough:[1,5]}`；`setTags:[]`。

- 招式：穿巷 `mv_liuyunbu_chuanxiang`（L1，自身，5%/3，`bf_jixing`2）；借墙 `mv_liuyunbu_jieqiang`（L4，移至 2 格内可达空位，5%/2，`power:0`）。
- 被动：识路 `ps_liuyunbu_shilu`（城镇探索耗时 −10%）；云脚 `ps_liuyunbu_yunjiao`（移动 ≥3 格后 eva +3→8）。获取：丐帮 L1；`observe maxLayer:6`。

#### `sk_duanbangshou` 短棒手（4 玄下 · 兵器/棍杖）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:staff}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{aptitude:{apStaff:22},prereq:[{skill:sk_gangougunfa,layer:4}],sect:{id:sect_gaibang,rank:1},hard:[sect,prereq]}`；`layerStats:{hit:[1,5],parry:[1,5]}`；`setTags:[]`。

- 招式：横棒 `mv_duanbangshou_hengbang`（L1，`aoe_cone r1/120°`，**0.85**，6%/1/1000；`.75×1.12=.84≈.85`）；点膝 `mv_duanbangshou_dianxi`（L3，单体，**1.10**，6%/1，`bf_jiansu`30%；`1×1.12−.10×.30=1.09≈1.10`）；贴身架 `mv_duanbangshou_tieshen`（L6，单体，**1.15**，7%/1，击退1；`1×(1+.12+.05)−.05=1.12≈1.15`）。
- 被动：短兵 `ps_duanbangshou_duanbing`（贴身 hit +3→8）；护手 `ps_duanbangshou_hushou`（parry +2→5）。获取：丐帮 L1，`observe maxLayer:6`。

#### `sk_gaibanghuxinfa` 丐帮护心法（5 玄中 · 内功）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{prereq:[{skill:sk_gaibangtunajue,layer:5}],sect:{id:sect_gaibang,rank:2,bagCount:3},hard:[sect,prereq]}`；`inner.contribution:{mpMaxPct:17,hpMaxPct:10,attrs:{con:4,str:3},mpRegen:1.5,stats:{resMind:5,resCC:5}}`，`IP=17+10+2×7+5×1.5=48.5`；`inner.meridians:[mer_dumai,mer_renmai]`；`setTags:[]`。

- 招式：护心 `mv_gaibanghuxinfa_huxin`（L3，自身，6%/3，`bf_dingxin`2）；行义 `mv_gaibanghuxinfa_xingyi`（L6，自身与相邻友方，7%/4，`bf_jiangu`2）；均 `power:0`。
- 被动：同袍 `ps_gaibanghuxinfa_tongpao`（相邻友方存在时 resMind +4→10）；百折 `ps_gaibanghuxinfa_baizhe`（气血低于 35% 时 Z4 +6%）。获取：丐帮 L2。

#### `sk_fengyuzhang` 风雨掌（5 玄中 · 拳脚/拳掌）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{attrs:{str:28},aptitude:{apFist:25},prereq:[{skill:sk_qiongjiaquan,layer:4}],sect:{id:sect_gaibang,rank:2},hard:[sect,prereq]}`；`layerStats:{hit:[1,5],parry:[1,5]}`；`setTags:[]`。

- 招式：风掌 `mv_fengyuzhang_fengzhang`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；雨打 `mv_fengyuzhang_yuda`（L3，单体三段，**1.30**，7%/2；`1×(1+.24+.05)=1.29≈1.30`）；扫街 `mv_fengyuzhang_saojie`（L6，`aoe_cone r1/120°`，**0.95**，7%/2；`.75×(1+.24+.05)=.97≈.95`）。
- 被动：风紧 `ps_fengyuzhang_fengjin`（移动后本武学 Z3 +4%→10%）；雨密 `ps_fengyuzhang_yumi`（多段招式 hit +5）。获取：丐帮 L2。

#### `sk_bocaogunfa` 拨草棍法（5 玄中 · 兵器/棍杖）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:staff}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{aptitude:{apStaff:28},prereq:[{skill:sk_duanbangshou,layer:4}],sect:{id:sect_gaibang,rank:2},hard:[sect,prereq]}`；`layerStats:{hit:[1,5],parry:[1,5]}`；`setTags:[]`。

- 招式：拨草 `mv_bocaogunfa_bocao`（L1，横扫，**0.85**，6%/1；`.75×1.12=.84≈.85`）；寻路 `mv_bocaogunfa_xunlu`（L3，直线2格，**1.00**，7%/1；`.85×(1+.12+.05)=.9945≈1.00`）；惊蛇 `mv_bocaogunfa_jingshe`（L6，单体，**1.20**，7%/2，`bf_dongyao`40%；`1×(1+.24+.05)−.10×.40=1.25≈1.20`）。被动：开路 `ps_bocaogunfa_kailu`（命中后友方穿越目标邻格不加耗）；棒花 `ps_bocaogunfa_banghua`（parry +3→8）。获取：丐帮 L2。

#### `sk_xingshidao` 行市刀（5 玄中 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:blade}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{aptitude:{apBlade:26},prereq:[{skill:sk_gaibangduandao,layer:4}],sect:{id:sect_gaibang,rank:2},hard:[sect,prereq]}`；`layerStats:{crit:[1,5],hit:[1,5]}`；`setTags:[]`。

- 招式：开市 `mv_xingshidao_kaishi`（L1，单体，1.00，6%/0）；收摊 `mv_xingshidao_shoutan`（L3，横扫，0.90，7%/1）；断路 `mv_xingshidao_duanlu`（L6，单体，1.20，7%/2，击退1）。被动：市眼 `ps_xingshidao_shiyan`（巷道 hit +3→8）；藏锋 `ps_xingshidao_cangfeng`（本回合首次刀招 crit +4→10）。获取：丐帮 L2。

#### `sk_jiefengbu` 接风步（5 玄中 · 轻功）——核算抽样（功能式）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.60/0.40`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`Q_skill=QS(5)=65`；`reqs:{attrs:{agi:30},aptitude:{apLight:28},prereq:[{skill:sk_liuyunbu,layer:4}],sect:{id:sect_gaibang,rank:2},hard:[sect,prereq]}`；`layerStats:{eva:[1,6],tough:[1,4]}`；`setTags:[]`。

- 招式：接风 `mv_jiefengbu_jiefeng`（L1，自身，5%/3/900，`bf_piaohu`2，`power:0`）；换巷 `mv_jiefengbu_huanxiang`（L3，位移至 3 格内可达空位，6%/2，`power:0`）；回身 `mv_jiefengbu_huishen`（L6，后撤2格并获 `bf_shoushi`1，6%/3，`power:0`）。三式为支援/位移，不走伤害预算。
- 被动：迎风 `ps_jiefengbu_yingfeng`（位移后 eva +3→8）；接力 `ps_jiefengbu_jieli`（相邻友方受击后下一次移动 +1，每回合1次）。获取：丐帮 L2。

#### `sk_gaibangqilingshu` 丐帮信令术（5 玄中 · 杂学/阵法）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.30/0.70`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao,ch07_bixue,ch08_luding]`；`reqs:{attrs:{cha:28,wis:25},skills:{formation:25},prereq:[{skill:sk_yanjiehao,layer:4}],sect:{id:sect_gaibang,rank:2},hard:[sect,prereq]}`；`layerStats:{effHit:[1,5],resMind:[1,5]}`；`setTags:[]`。

- 招式：鸣竹 `mv_gaibangqilingshu_mingzhu`（L1，友方 r2，`bf_juqi`2）；换哨 `mv_gaibangqilingshu_huanshao`（L3，友方 r2，`bf_jixing`1）；收声 `mv_gaibangqilingshu_shousheng`（L6，驱散友方一个 `mind`）；均为 `power:0`。
- 被动：暗号 `ps_gaibangqilingshu_anhao`（丐帮情报检定 +5→12）；应和 `ps_gaibangqilingshu_yinghe`（2 格内友方 ≥2 时 resMind +8）。获取：丐帮 L2。

#### `sk_jiudaixingong` 九袋行功（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao]`；`reqs:{attrs:{con:35,wil:30},aptitude:{apInner:32},prereq:[{skill:sk_gaibanghuxinfa,layer:6}],sect:{id:sect_gaibang,rank:4,bagCount:9},hard:[sect,prereq]}`；`inner.contribution:{mpMaxPct:20,hpMaxPct:12,attrs:{con:4,str:2,wil:2},mpRegen:1.8,stats:{resCC:5,tough:5}}`，`IP=20+12+2×8+5×1.8=57`；`inner.meridians:[mer_dumai,mer_chongmai]`；`setTags:[]`。

- 招式：聚众运气 `mv_jiudaixingong_juzhong`（L3，自身及相邻友方，7%/4，`bf_juqi`2）；护帮 `mv_jiudaixingong_hubang`（L6，自身，8%/3，`bf_hutizhenqi`2）；均 `power:0`。被动：九袋 `ps_jiudaixingong_jiudai`（丐帮武学耗内 −4%→10%）；护帮 `ps_jiudaixingong_hubang`（友方倒地时自身获 `bf_ruiyi`2，每战一次）。获取：丐帮 L4；不替代掌门专属绝学。

#### `sk_fengyulianshou` 风雨连手（6 玄上 · 拳脚/拳掌）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0.65/0.35`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao]`；`reqs:{attrs:{str:35,agi:30},aptitude:{apFist:34},prereq:[{skill:sk_fengyuzhang,layer:6}],sect:{id:sect_gaibang,rank:3},hard:[sect,prereq]}`；`layerStats:{hit:[2,6],crit:[1,4]}`；`setTags:[]`。

- 招式：风催 `mv_fengyulianshou_fengcui`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；雨骤 `mv_fengyulianshou_yuzhou`（L3，单体三段，**1.30**，7%/2；`1×1.29=1.29≈1.30`）；连手扫巷 `mv_fengyulianshou_saoxiang`（L6，`aoe_cone r1/120°`，**1.00**，8%/2；`.75×(1+.24+.10)=1.005≈1.00`）。
- 被动：连手 `ps_fengyulianshou_lianshou`（不同招式连续命中时 Z3 +4%→10%）；群丐 `ps_fengyulianshou_qungai`（相邻友方存在时 hit +6）。获取：丐帮 L3。

#### `sk_zhengoubang` 镇狗棒（6 玄上 · 兵器/棍杖）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.75/0.25`；`weaponReq:{category:staff}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao]`；`reqs:{aptitude:{apStaff:35},prereq:[{skill:sk_bocaogunfa,layer:6}],sect:{id:sect_gaibang,rank:3},hard:[sect,prereq]}`；`layerStats:{parry:[2,6],hit:[1,4]}`；`setTags:[]`。

- 招式：镇路 `mv_zhengoubang_zhenlu`（L1，单体，1.05，6%/1，`bf_dongyao`50%）；压棒 `mv_zhengoubang_yabang`（L3，线2格，1.00，7%/2）；回栏 `mv_zhengoubang_huilan`（L6，周身，0.85，8%/3，击退1）。被动：镇场 `ps_zhengoubang_zhenchang`（对 `beast`/`summon` 目标 Z3 +8%→15%）；棒门 `ps_zhengoubang_bangmen`（parry +3→8）。获取：丐帮 L3。

#### `sk_pojunguitoudao` 破军鬼头刀（6 玄上 · 兵器/刀）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:blade}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao]`；`reqs:{attrs:{str:38},aptitude:{apBlade:35},prereq:[{skill:sk_xingshidao,layer:6}],sect:{id:sect_gaibang,rank:3},hard:[sect,prereq]}`；`layerStats:{crit:[2,6],hit:[1,4]}`；`setTags:[]`。

- 招式：破门 `mv_pojunguitoudao_pomen`（L1，单体，1.10，6%/1）；断阵 `mv_pojunguitoudao_duanzhen`（L3，线3格，0.95，7%/2）；回首斩 `mv_pojunguitoudao_huishou`（L6，绕背，1.05，8%/2）。被动：军威 `ps_pojunguitoudao_junwei`（击杀后获 `bf_zhanyi`1）；重刃 `ps_pojunguitoudao_zhongren`（crit +3→8）。获取：丐帮 L3。

#### `sk_gaibangchuansheng` 丐帮传声（6 玄上 · 杂学/音律）——核算抽样（功能式）

**字段**｜`origin:expanded`；`sect:sect_gaibang`；`nature:neutral`；`wOut/wIn:0.10/0.90`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch05_xiaoao]`；`reqs:{attrs:{cha:35,wil:30},skills:{music:35},prereq:[{skill:sk_gaibangqilingshu,layer:6}],sect:{id:sect_gaibang,rank:3},hard:[sect,prereq]}`；`layerStats:{effHit:[2,6],resMind:[1,4]}`；`setTags:[]`。

- 招式：长啸传信 `mv_gaibangchuansheng_changxiao`（L1，友方 r3，7%/3，`bf_juqi`2）；群声相应 `mv_gaibangchuansheng_yinghe`（L3，友方 r2，7%/4，`bf_ruiyi`1）；喝止 `mv_gaibangchuansheng_hezhi`（L6，敌方锥2，8%/3，`bf_dongyao`60%）；均 `power:0`，功能式不走伤害预算。
- 被动：耳目 `ps_gaibangchuansheng_ermu`（情报检定 +5→12）；众声 `ps_gaibangchuansheng_zhongsheng`（每命中一名友方回复自身1%内力，至多3%）。获取：丐帮 L3。

### 2.7 黄阶总表（17 门；含既有 4 门索引、新增 13 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_gangougunfa` | 赶狗棍法（1 黄下） | 丐帮 | 兵器/棍杖 | 天龙—笑傲、碧血、鹿鼎 | 竹棒防身、打狗阵前置；`[]` | 无；入帮 | **（原创扩展）**；详细卡见 §2.5 |
| `sk_zhuzhangrumen` | 竹杖入门（1 黄下） | 丐帮 | 兵器/棍杖 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 单体基线 1.00、基础招架；`[]` | 无；L1 | **（原创扩展）** |
| `sk_qiongjiaquan` | 穷家拳（2 黄中） | 丐帮 | 拳脚/拳掌 | 天龙—笑傲、碧血、鹿鼎 | 入门拳、滚地控位；`[]` | 无；入帮 | **（原创扩展）**；详细卡见 §2.5 |
| `sk_lianhualuo` | 莲花落（2 黄中） | 丐帮 | 杂学/音律 | 天龙—笑傲、碧血、鹿鼎 | 鼓劲传讯；`[]` | 无；入帮 | 民间曲艺借用，武学化**（原创扩展）**；详细卡见 §2.5 |
| `sk_tuobozhuang` | 托钵桩（2 黄中） | 丐帮 | 内功 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | `nature:yang`；`IP=8+5+2×3+5×1=24`；`mer_dumai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_gaibangduanquan` | 丐帮短拳（2 黄中） | 丐帮 | 拳脚/拳掌 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 贴身连打、单体基线 1.00；`[]` | 无；L1 | **（原创扩展）** |
| `sk_hujiaobang` | 护脚棒（2 黄中） | 丐帮 | 兵器/棍杖 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 横扫基线 .85、护持下盘；`[]` | 竹杖入门 3 重 | **（原创扩展）** |
| `sk_bailingbu` | 百灵步（2 黄中） | 丐帮 | 轻功 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | `QS(2)=38`，巷道转向；`[]` | 无；L1 | **（原创扩展）** |
| `sk_jietouyanwu` | 街头演武（2 黄中） | 丐帮 | 杂学/阵法 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 相邻友军 `bf_juqi`1；`formation:10`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_xunxiangshou` | 寻香手（2 黄中） | 丐帮 | 杂学/医 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 采集与低阶解毒；`med:10`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_yunyoubu` | 云游步（3 黄上） | 丐帮 | 轻功 | 天龙—笑傲、碧血、鹿鼎 | `QS(3)=45`；旅行耗时；`set_gaibang_bangzhu` | L1 | **（原创扩展）**；详细卡见 §2.5 |
| `sk_fengdizhang` | 风地掌（3 黄上） | 丐帮 | 拳脚/拳掌 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 横扫 .90、命中后稳身；`[]` | 丐帮短拳 4 重 | **（原创扩展）** |
| `sk_shuangjiebang` | 双节棒路（3 黄上） | 丐帮 | 兵器/棍杖 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 两段合计 1.10、招架成长；`[]` | 护脚棒 4 重 | **（原创扩展）** |
| `sk_gaibangduandao` | 丐帮短刀（3 黄上） | 丐帮 | 兵器/刀 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 单体 1.00、流血 20% 时倍率 .95；`[]` | 无；L1 | **（原创扩展）** |
| `sk_gaibangfenshou` | 丐帮分手（3 黄上） | 丐帮 | 拳脚/擒拿 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 扣腕，封经 20% 时倍率 .95；`[]` | 丐帮短拳 4 重 | **（原创扩展）** |
| `sk_shichengbu` | 石城步（3 黄上） | 丐帮 | 轻功 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | `QS(3)=45`，守城时 `bf_wenzhong`1；`[]` | 百灵步 4 重 | **（原创扩展）** |
| `sk_yanjiehao` | 沿街号（3 黄上） | 丐帮 | 杂学/音律 | 天龙、射雕、神雕、笑傲、碧血、鹿鼎 | 友方 `bf_juqi`2，敌方 `bf_dongyao`低概率；`[]` | 街头演武 4 重 | **（原创扩展）** |

**黄阶整体预算核对**：本节 13 门新增条目中，伤害招按黄阶 5% 耗内、cd0、收招1000的单体基线 `1.00` 配置；横扫基线 `.75`，加 cd1 后 `.75×1.12=.84≈.85`；封经/流血 20% 各扣 `.20×.20=.04` / `.10×.20=.02`，倍率取 `.95` 均在 ±.05。两门轻功精确用 `QS(2)=38`、`QS(3)=45`；托钵桩精确命中黄中 IP 24；`layerStats` 合计均不超过 6。

---

## 3. 桃花岛 `sect_taohuadao`

### 3.1 门派简介

- **时代**：射雕时黄药师为“东邪”，五绝之一；门下陈玄风、梅超风盗《九阴真经》下卷叛出，黄药师迁怒打断其余弟子（曲灵风、陆乘风、武眠风、冯默风）腿筋逐出岛外；后将可恢复腿力的旋风扫叶腿修习法交给陆乘风（原著）。神雕时黄药师晚年收程英为关门弟子，桃花岛武学由黄蓉、程英承传，郭靖黄蓉一度居岛。倚天以后原著不再出现桃花岛一脉（黄衫女子等传承归他组）。
- **强弱**：射雕 极强（黄药师一人一岛）／神雕 强（黄药师、黄蓉、程英）。不在中武/低武书界出现——其武学只能经书眠携带（拳脚、内功、兵器）或化为残篇（碧海潮生曲、桃花阵、轻功等非核心武学）。
- **风格**：奇门五行、指掌轻灵、兼通音律医卜；内力调和；武学多取意于桃花岛门前对联；《射雕英雄传》中“桃花影落飞神剑，碧海潮生按玉箫”的字序与标点（待考）。
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
| `sk_xuanfengsaoyetui` | 旋风扫叶腿 | 拳脚/腿法 | 6 玄上 | 阳 | 0.70/0.30 | 射雕、神雕 | 归云庄陆乘风、陆冠英；黄药师赠谱 | 原著（黄药师交陆乘风恢复腿力的修习法）；战斗招式原创扩展 |
| `sk_pikongzhang` | 劈空掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.50/0.50 | 射雕、神雕 | 陆乘风；神雕冯默风 | 桃花岛归属与传承见 §3.5 考据项 |
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
| reqs | `attrs {wis 55, agi 50}`；`aptitude {apFinger 55}`；`sect {id: sect_taohuadao, rank: 3}`；`hard [sect]`（羁绊途径以 `reqsOverride {sect: null}` 放开） |
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
| 出处 | 射雕：黄药师以玉箫吹奏，与欧阳锋铁筝、洪七公长啸于桃花岛斗曲；乐声以内力催动，听者心神摇荡、随乐起舞（原著）；神雕沿用此曲，具体对手与场景（待考） |
| origin / lineage | `canon` / 黄药师 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.10/0.90 · 5 |
| reqs | `attrs {wis 60, wil 50}`；`skills {music: 50}`；`prereq [{skill: sk_bitaoxuangong, layer: 5}]`；`sect {id: sect_taohuadao, rank: 3}`；`hard [sect, prereq]`（`music` 为软门槛，C17） |
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
| 出处 | 射雕、神雕：黄药师、黄蓉的点穴擒拿手法，出手如拈兰拂花（原著）；各招名与战斗效果为原创扩展 |
| origin / lineage | `canon` / 黄药师 → 黄蓉、程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.40/0.60 · 4 |
| reqs | `attrs {agi 45, wis 45}`；`aptitude {apGrapple 45}`；`sect {id: sect_taohuadao, rank: 2}`；`hard [sect]` |
| layerStats | `seal [3, 10]`、`eva [1, 5]`（合计 15） |
| 层数要点 | 1：拂穴、兰指轻拈、认穴 ｜ 3：幽兰吐芳 ｜ 4：轻灵 ｜ 5：空谷幽兰 ｜ **7：绝招 九畹兰香** ｜ 8：拈花擒拿、冲穴 ｜ 10：兰花大成 |
| setTags / conflicts | `[set_taohuadao]` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_huangrong` `maxLayer 8`（羁绊 ≥ 3）；神雕 `master npc_huangrong` `maxLayer 10`、`master npc_chengying` `maxLayer 8`；`observe` 6 |
| 图鉴文本 | 桃花岛点穴擒拿手法，出手如拈兰拂花，姿态闲雅而认穴奇准，专拂敌人要穴。黄药师、黄蓉父女皆擅（原著）；招名为原创扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 拂穴 `mv_lanhuafuxueshou_fuxue` | 1 | 单体 · 1 · 近身 | 1.00 | 7%/1/900 | `bf_fengxue` 30% 1 | 可 | (1+0.12−0.07)−0.06 |
| 兰指轻拈 `mv_lanhuafuxueshou_nian` | 1 | 单体 · 1 · 近身 | 0.85 | 7%/0/800 | — | 可 | 1−0.14 |
| 幽兰吐芳 `mv_lanhuafuxueshou_tufang` | 3 | `aoe_sweep` | 0.80 | 7%/1/1000 | `bf_fengxue` 20% 1 | 可 | 0.75×1.12−0.04 |
| 空谷幽兰 `mv_lanhuafuxueshou_konggu` | 5 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 0.9, expires: nextOwnAction, applyBuff: bf_fengxue 40%}` | — | 架势招式 |
| **九畹兰香** `mv_lanhuafuxueshou_jiuwan`（绝招，原创扩展命名，取《离骚》"滋兰之九畹"） | 7 | 单体 · 1（5 段） | 2.70 | 9%/—/1200 | `bf_fengxue` 100% 2；`bf_fengnei` 50% 1 | 可 | 3.00−0.20×1.00−0.20×0.50 = 2.70 |
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
| 出处 | 射雕、神雕：黄药师以玉箫为剑（原著）；程英持玉箫，但《神雕侠侣》中她是否明确施展玉箫剑法（待考）；各招名与效果为原创扩展 |
| origin / lineage | `canon` / 黄药师 → 程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| weaponReq | `{category: exotic, kinds: [flute], altCategories: {unlockLayer: 1, categories: [sword], mult: 0.9}}`（以剑代箫 ×0.9） |
| reqs | `attrs {agi 45, wis 50}`；`aptitude {apExotic 45}`；`prereq [{skill: sk_bitaoxuangong, layer: 3}]`；`sect {id: sect_taohuadao, rank: 3}`；`hard [sect, prereq]` |
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
| 出处 | 射雕：桃花岛掌法，黄药师所创，黄蓉少时即已修习（原著）；《神雕侠侣》中程英是否明确施展此掌（待考）；各招名与效果为原创扩展 |
| origin / lineage | `canon` / 黄药师 → 黄蓉、程英 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apFist 40}`；`prereq [{skill: sk_pikongzhang, layer: 4}]`；`sect {id: sect_taohuadao, rank: 2}`；`hard [sect, prereq]`（黄蓉/程英羁绊途径 `reqsOverride {sect: null, prereq: []}`） |
| layerStats | `eva [2, 8]`、`hit [1, 7]`（合计 15） |
| 层数要点 | 1：落英缤纷、花落无声、虚幻 ｜ 3：飞花拂柳 ｜ 5：虚实变幻、飘零 ｜ **7：绝招 神剑落英** ｜ 8：桃花满地、落英成阵 ｜ 10：落英大成 |
| setTags / conflicts | `[set_taohuadao]` / 无 |
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
| inner | `contribution {mpMaxPct 28, hpMaxPct 14, attrs {wis 6, agi 5}, mpRegen 2.0, stats {effHit 8, resMind 7}}`（IP = 28+14+2×(6+5)+5×2.0 = **74**，预算 72 ±5%） |
| reqs | `attrs {wis 45, wil 40}`；`aptitude {apInner 40}`；`sect {id: sect_taohuadao, rank: 2}`；`hard [sect]` |
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
| 出处 | 射雕：桃花岛桃林依奇门五行布置，外人入岛即迷失；神雕：黄蓉以乱石布阵阻敌，襄阳大战时黄药师依二十八宿布阵（原著）。“桃花阵”为本作统称 |
| origin / lineage | `canonExpanded` / 黄药师 → 黄蓉 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0.50/0.50 · 4 |
| reqs | `attrs {wis 50}`；`skills {formation: 40}`；`sect {id: sect_taohuadao, rank: 2}`；`hard [sect]`（`formation` 为软门槛，C17） |
| layerStats | `effHit [3, 9]`、`eva [1, 6]`（合计 15） |
| 层数要点 | 1：布桃林阵、奇门遁形、迷林 ｜ 4：五行生克 ｜ 5：移步换景、识阵 ｜ **7：绝招 二十八宿** ｜ 8：困龙 ｜ 10：奇门大成 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible: false}` / `true` |
| 获取 | 射雕 `master npc_huangyaoshi` `maxLayer 10`、`master npc_huangrong` `maxLayer 8`、`puzzle`（破解桃花岛桃林阵，design/11）`maxLayer 5`；神雕 `master npc_huangrong` `maxLayer 10` |
| 图鉴文本 | 桃花岛依奇门五行布置桃林，外人入岛即迷失路径（原著）；本作将其化为战场阵法：布阵、遁形、移步换景，困敌于五行生克之中。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 布桃林阵 `mv_taohuazhen_taolin` | 1 | `aoe_zone sq3, t 3` · 1–3 | 0.20/跳 | 8%/2/1000 | 区内敌 `bf_muxuan` 100%（每跳刷新） | 可 | 0.25×(1+0.24+0.05)−0.10 |
| 奇门遁形 `mv_taohuazhen_dunxing` | 1 | 自身 | 0 | 7%/4/900 | 自身 `bf_yinshen` 1 | — | 支援 |
| 五行生克 `mv_taohuazhen_shengke` | 4 | `aoe_allies r2` | 0 | 6%/3/900 | 友方 `bf_piaohu` 2 | — | 支援 |
| 移步换景 `mv_taohuazhen_huanjing` | 5 | `aoe_swap` · 1–4 | 0 | 7%/3/1000 | 与目标换位（须过效果命中） | — | 功能招式 |
| **二十八宿** `mv_taohuazhen_ershibaxiu`（绝招，名取《神雕侠侣》襄阳布阵） | 7 | `aoe_zone diamond2, t 3` · 1–4 | 0.60/跳 | 9%/—/1200 | 区内每跳 `bf_luanxin` 50%、`bf_panshan` 100% | 可 | 3.00×0.25−0.05−0.10 |
| 困龙 `mv_taohuazhen_kunlong` | 8 | 单体 · 1–4 | 0 | 8%/4/1000 | `bf_dingshen` 60% 2；`bf_fengqinggong` 60% 2 | — | 纯控制 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_taohuazhen_milin` | 迷林 | 1 | mechanic | — | +1 | 敌方在自身布下的阵区内每移动 1 格多耗 1 点移动力；其技艺 `formation` ≥ 自身时无效 |
| `ps_taohuazhen_shizhen` | 识阵 | 5 | mechanic | — | 50% | 敌方阵法类区域（`aoe_zone` 且带 `formation` 标签）对自身的效果减半（品阶 ≤ 自身） |
| `ps_taohuazhen_dacheng` | 奇门大成 | 10 | mechanic | — | +1 | 可同时存在的自布阵区 +1；阵区持续 +1 跳 |

### 3.5 玄/黄阶紧凑卡

**`sk_xuanfengsaoyetui` 旋风扫叶腿**（6 玄上 · 拳脚/腿法 · 阳 · 0.70/0.30 · 栏 3）｜reqs：`attrs {agi 30, str 25}`、`aptitude {apLeg 30}`｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_luchengfeng`（归云庄）`maxLayer 8`、`master npc_luguanying` `maxLayer 6`、`manual it_miji_xuanfengsaoyetui`（黄药师所赠谱，归云庄事件后）`maxLayer 10`；神雕 `master npc_huangrong`；`observe` 6｜出处：黄药师将可恢复腿力的旋风扫叶腿修习法交陆乘风（《射雕英雄传》）；本作将其展开成战斗腿法，各招名与效果为原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 秋风扫叶 `mv_xuanfengsaoyetui_saoye` | 1 | `aoe_sweep` | 0.80 | 6%/1/1000 | `bf_panshan` 30% | 可 | 0.75×1.12−0.03 |
| 旋风连踢 `mv_xuanfengsaoyetui_lianti` | 3 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 回旋扫腿 `mv_xuanfengsaoyetui_huixuan` | 5 | `aoe_around` | 0.85 | 7%/2/1000 | — | 可 | 0.65×1.29 |
| 风卷残叶 `mv_xuanfengsaoyetui_canye` | 7 | `aoe_knock n2`·1 | 1.15 | 7%/2/1000 | 击退 2 | 可 | 0.95×1.29−0.10 |

被动：`ps_xuanfengsaoyetui_xuanfeng` 旋风（1，effect：本武学招式命中后，自身本回合剩余移动力 +1）；`ps_xuanfengsaoyetui_xujin` 腿中蓄劲（5，stat Z3：对带 `cc` 标签效果的目标 +8%）；`ps_xuanfengsaoyetui_huangu` 活骨（10，mechanic：装配时免疫品阶 ≤ 自身的 `bf_gushang`——致敬黄药师以腿法内功助陆乘风复原，原创扩展）。

**`sk_pikongzhang` 劈空掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.50/0.50 · 栏 3）｜reqs：`attrs {str 25, wis 25}`、`aptitude {apFist 25}`、`prereq [{skill: sk_bibozhang, layer: 4}]`（硬）｜layerStats：`hit [1,5]`、`pierce [1,5]`｜setTags：—｜获取：射雕 `master npc_luchengfeng` `maxLayer 10`（`reqsOverride {prereq: []}`）；神雕 `master npc_fengmofeng`（冯默风）`maxLayer 8`；`observe` 6｜出处：《射雕英雄传》《神雕侠侣》中“劈空掌”是否明确归属桃花岛，以及陆乘风、冯默风是否实际施展（待考）；各招名与效果为原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 劈空 `mv_pikongzhang_pikong` | 1 | 单体·1–3·远程 | 0.85 | 6%/0/1000 | — | 可 | 1×0.85 |
| 隔山 `mv_pikongzhang_geshan` | 3 | `aoe_pierce`·1–3·远程 | 0.90 | 7%/1/1000 | — | 可 | 0.90×1.17×0.85 |
| 掌风扫烛 `mv_pikongzhang_saozhu` | 5 | `aoe_wave d1, w3`·远程 | 0.75 | 7%/2/1000 | — | 可 | 0.70×1.29×0.85 |
| 裂空 `mv_pikongzhang_liekong` | 7 | 单体·1–3·远程 | 1.10 | 8%/2/1000 | `bf_neishang` 50% | 可 | 1.34×0.85−0.05 |

被动：`ps_pikongzhang_zhangfeng` 掌风（1，stat Z2：本武学无视内劲防御 [2%, 6%]）；`ps_pikongzhang_yuanjin` 远劲（5，effect：本武学远程招式射程 +1）；`ps_pikongzhang_dacheng` 裂空圆熟（10，stat Z3：对 3 格外目标 +8%）。

**`sk_taohuayingluo` 桃花影落**（5 玄中 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**名取桃花岛意象｜reqs：`attrs {agi 30}`、`aptitude {apLight 25}`、`sect {id: sect_taohuadao, rank: 1}`（硬）｜轻功值 `QS(5) = 65`（03 §4.5）｜layerStats：`eva [1,5]`、`tough [1,5]`｜获取：射雕/神雕 `master`（桃花岛弟子、黄蓉）；`observe` 6

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

### 3.6 AR-01 新增玄阶紧凑卡（5 门）

#### `sk_taohuatunaxi` 桃花吐纳息（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_taohuadao`；`nature:harmony`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{wis:28},sect:{id:sect_taohuadao,rank:1},hard:[sect]}`；`inner.contribution:{mpMaxPct:12,hpMaxPct:10,attrs:{agi:3,wis:3},mpRegen:1.5,stats:{resMind:5,effHit:5}}`，`IP=12+10+2×6+5×1.5=41.5`；`inner.meridians:[mer_renmai,mer_daimai]`；`setTags:[]`；**（原创扩展）**。

- 招式：听潮 `mv_taohuatunaxi_tingchao`（L1，自身 `bf_dingxin`2）；理息 `mv_taohuatunaxi_lixi`（L4，自身 `bf_huinei`2）；均 5%/3、`power:0`。被动：潮息 `ps_taohuatunaxi_chaoxi`（水域 mpRegen +.2→.5pp）；桃根 `ps_taohuatunaxi_taogen`（桃花岛玄阶修炼 +10%）。获取：桃花岛 L1。

#### `sk_taohuaduanjian` 桃花短剑（5 玄中 · 兵器/剑）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_taohuadao`；`nature:harmony`；`wOut/wIn:0.60/0.40`；`weaponReq:{category:sword}`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{agi:30},aptitude:{apSword:28},prereq:[{skill:sk_taohuajianru,layer:4}],sect:{id:sect_taohuadao,rank:2},hard:[sect,prereq]}`；`layerStats:{hit:[1,5],eva:[1,5]}`；`setTags:[]`；**（原创扩展）**。

- 招式：花枝刺 `mv_taohuaduanjian_huazhi`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；落瓣回锋 `mv_taohuaduanjian_huifeng`（L3，横扫，**0.90**，7%/1；`.75×1.17=.8775≈.90`）；疏影穿枝 `mv_taohuaduanjian_chuanzhi`（L6，线3格，**0.90**，7%/2；`.80×1.29=1.032`，再扣穿障**【建议值】**.10，取 .90）。
- 被动：花影 `ps_taohuaduanjian_huaying`（移动后 hit +3→8）；回锋 `ps_taohuaduanjian_huifeng`（招架后下一剑 Z3 +6%）。获取：桃花岛 L2；招名均原创。

#### `sk_chaoyinbu` 潮音步（5 玄中 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_taohuadao`；`nature:harmony`；`wOut/wIn:0.40/0.60`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`Q_skill=QS(5)=65`；`reqs:{attrs:{agi:32,wis:25},aptitude:{apLight:28},prereq:[{skill:sk_huajianbu,layer:4}],sect:{id:sect_taohuadao,rank:2},hard:[sect,prereq]}`；`layerStats:{eva:[1,6],tough:[1,4]}`；`setTags:[]`；**（原创扩展）**。

- 招式：听潮换位 `mv_chaoyinbu_huanwei`（L1，2 格换位，6%/3，`power:0`）；逐浪 `mv_chaoyinbu_zhulang`（L4，自身 `bf_jixing`2）；回汀 `mv_chaoyinbu_huiting`（L6，后撤2格，获 `bf_piaohu`1）。被动：潮准 `ps_chaoyinbu_chaozhun`（水边 eva +3→8）；步合五行 `ps_chaoyinbu_wuxing`（自布阵区内移动耗力 −1）。获取：桃花岛 L2。

#### `sk_biluofengyan` 碧落风烟（6 玄上 · 杂学/音律）——核算抽样（功能式）

**字段**｜`origin:expanded`；`sect:sect_taohuadao`；`nature:harmony`；`wOut/wIn:0.15/0.85`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{wis:38,wil:32},skills:{music:35},prereq:[{skill:sk_qimenyinlu,layer:5}],sect:{id:sect_taohuadao,rank:3},hard:[sect,prereq]}`；`layerStats:{effHit:[2,6],resMind:[1,4]}`；`setTags:[]`；**（原创扩展）**。

- 招式：风烟起 `mv_biluofengyan_fengyan`（L1，敌方锥2，`bf_dongyao`50%，7%/3，`power:0`）；碧落引 `mv_biluofengyan_biluoyin`（L3，友方 r2，`bf_ningshen`2，7%/3，`power:0`）；烟波散 `mv_biluofengyan_yanbosan`（L6，驱散敌方一个 `stance`，8%/4，`power:0`）。均属功能式，不走伤害预算。
- 被动：余韵 `ps_biluofengyan_yuyun`（心神效果命中 +4→10）；清商 `ps_biluofengyan_qingshang`（支援友方后自身 resMind +8 一回合）。获取：桃花岛 L3。

#### `sk_qimenfushou` 奇门拂手（6 玄上 · 拳脚/擒拿）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_taohuadao`；`nature:harmony`；`wOut/wIn:0.45/0.55`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{agi:38,wis:35},aptitude:{apGrapple:35},prereq:[{skill:sk_luoyingduanquan,layer:5}],sect:{id:sect_taohuadao,rank:3},hard:[sect,prereq]}`；`layerStats:{seal:[2,6],eva:[1,4]}`；`setTags:[]`；**（原创扩展）**。

- 招式：拂袖 `mv_qimenfushou_fuxiu`（L1，单体，**1.00**，6%/1，`bf_fengxue`50%；`1×1.12−.20×.50=1.02≈1.00`）；引花 `mv_qimenfushou_yinhua`（L3，拉拽1格，**1.05**，7%/2；`1×1.29−.10=1.19`，再扣封位**【建议值】**.15，取1.05）；错步拿腕 `mv_qimenfushou_nawan`（L6，绕背，**1.00**，8%/2，`bf_jiaoxie`30%；`.90×1.34−.15−.20×.30=1.00`）。
- 被动：奇门 `ps_qimenfushou_qimen`（自布阵区内 seal +4→10）；拂穴 `ps_qimenfushou_fuxue`（对带 `seal` 标签目标 Z3 +8%）。获取：桃花岛 L3。

### 3.7 黄阶总表（9 门；含既有 2 门索引、新增 7 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_bibozhang` | 碧波掌（2 黄中） | 桃花岛 | 拳脚/拳掌 | 射雕、神雕 | 单体基线、击退；桃花拳掌链起点 | 无；入门 | **（原创扩展）**；详细卡见 §3.5 |
| `sk_taohuajianru` | 桃花剑入（2 黄中） | 桃花岛 | 兵器/剑 | 射雕、神雕 | 单体 1.00、基础回锋；`[]` | 无；L1 | **（原创扩展）** |
| `sk_yaoputunaxi` | 药圃吐纳息（2 黄中） | 桃花岛药圃 | 内功 | 射雕、神雕 | `nature:harmony`；`IP=8+5+2×3+5×1=24`；`mer_renmai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_huajianbu` | 花间步（2 黄中） | 桃花岛 | 轻功 | 射雕、神雕 | `QS(2)=38`，花林转向；`[]` | 无；L1 | **（原创扩展）** |
| `sk_luoyingduanquan` | 落英短拳（2 黄中） | 桃花岛 | 拳脚/拳掌 | 射雕、神雕 | 两段合计1.10，拳掌链起点；`[]` | 碧波掌 3 重 | **（原创扩展）** |
| `sk_feishishou` | 飞石手（3 黄上） | 桃花岛 | 暗器 | 射雕、神雕 | 投射 .90、弹指前置 | 无；入门 | **（原创扩展）**；详细卡见 §3.5 |
| `sk_qimenyinlu` | 奇门音律（3 黄上） | 桃花岛 | 杂学/音律 | 射雕、神雕 | 友方 `bf_ningshen`1；`music:20`；`[]` | 药圃吐纳息 3 重 | **（原创扩展）** |
| `sk_yuxiaoduanji` | 玉箫短击（3 黄上） | 桃花岛 | 兵器/奇门 | 射雕、神雕 | `exotic/flute`，点穴20%时倍率 .95；`[]` | 奇门音律 3 重 | 黄药师以箫为兵据原著；套路**（原创扩展）** |
| `sk_feihuachen` | 飞花尘（3 黄上） | 桃花岛 | 暗器 | 射雕、神雕 | 投射花瓣、减速20%时倍率 .90；`[]` | 飞石手 4 重 | **（原创扩展）** |

**黄阶整体预算核对**：新增 7 门中攻击基线为单体 1.00；投射基线 `.92≈.90`，封穴 20% 扣 `.20×.20=.04`、减速20%扣 `.10×.20=.02`，均在允许误差内。花间步用 `QS(2)=38`；药圃吐纳息精确命中黄中 IP 24；所有 `layerStats≤6`。

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
| `sk_lingshezhangfa` | 灵蛇杖法 | 兵器/棍杖 | 9 地上 | 阳 | 0.65/0.35 | 射雕、神雕 | 欧阳锋亲传（四级） | 原著蛇杖；正式武学名与构造见 §4.4 考据项 |
| `sk_lingshequan` | 灵蛇拳 | 拳脚/拳掌 | 8 地中 | 调和 | 0.55/0.45 | 射雕、神雕 | 欧阳锋亲传（三级） | 原著 |
| `sk_nizhuanjingmai` | 逆转经脉 | 内功 | 7 地下 | 阴 | 0/1 | 射雕、神雕 | 神雕义父羁绊；射雕观欧阳锋倒立行功 | 原著（欧阳锋逆练九阴、杨过以逆行经脉解穴）；数值原创扩展 |
| `sk_shentuoxueshanzhang` | 神驼雪山掌 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.60/0.40 | 射雕、神雕 | 欧阳克；白驼山庄遗谱 | 正式掌法名与使用场景见 §4.5 考据项 |
| `sk_yushe` | 驭蛇术 | 杂学/驭兽 | 6 玄上 | 中性 | 0.40/0.60 | 射雕 | 白驼山蛇奴头目 | 原著（蛇奴驱蛇、蛇阵） |
| `sk_baituodujing` | 白驼毒经 | 杂学/毒 | 5 玄中 | 中性 | 0.30/0.70 | 射雕、神雕 | 白驼山二级；神雕遗谱 | 原创扩展（"西毒"之名为原著） |
| `sk_shexingdiaoshou` | 蛇形刁手 | 拳脚/擒拿 | 3 黄上 | 中性 | 0.80/0.20 | 射雕、神雕 | 入门 | **（原创扩展命名）**据白驼山蛇形武学风格构造，不宣称为原著武学 |
| `sk_tashaxing` | 踏沙行 | 轻功 | 2 黄中 | 中性 | — | 射雕、神雕 | 入门 | 原创扩展 |

### 4.3 天阶条目卡

#### `sk_hama` 蛤蟆功（10 天下 · 内功 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：欧阳锋蹲身如蛤蟆、口中咕咕作声，蓄劲而发，以静制动；王重阳曾以一阳指破之。神雕：欧阳锋传杨过（均为原著） |
| origin / lineage | `canon` / 欧阳锋 → 杨过 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0/1（攻击招式覆写 0.20/0.80）· 5 |
| inner | `contribution {mpMaxPct 38, hpMaxPct 30, attrs {str 8, con 8}, mpRegen 3.6, stats {resCC 10, resPoison 10}}`（IP = 38+30+2×(8+8)+5×3.6 = **118**，预算 118）；`auxUsableMoves [mv_hama_xujin]` |
| reqs | `attrs {str 50, con 55}`；`aptitude {apInner 55}`；`sect {id: sect_baituoshan, rank: 3}`；`hard [sect]`（神雕义父线 `reqsOverride {sect: null}`） |
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
| 出处 | 欧阳锋以盘蛇怪杖为兵器；《射雕英雄传》《神雕侠侣》中杖上毒蛇、暗器机括的具体构造与“灵蛇杖法”是否为正式名（待考）。本文武学名、招名及机括战斗效果均按**（原创扩展）**处理 |
| origin / lineage | `canonExpanded` / 欧阳锋 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.65/0.35 · 4 |
| weaponReq | `{category: staff, tags: [shezhang]}`（非蛇杖可用，但失去蛇毒与机括，见被动"蛇杖"；装备 `eq_baituoshezhang` 见 design/10，地上） |
| reqs | `attrs {str 50, con 45}`；`aptitude {apStaff 50}`；`morality {max: −20}`（软）；`sect {id: sect_baituoshan, rank: 4}`；`hard [sect]` |
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
| 杖缠 `mv_lingshezhangfa_chan` | 8 | 单体 · 1–2 · 近身 | 1.25 | 8%/3/1000 | `bf_chanrao` 60% 2 | 可 | (1+0.36+0.05)−0.25×0.60 = 1.26 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_lingshezhangfa_shezhang` | 蛇杖 | 1 | mechanic | — | — | 主手带 `shezhang` 标签时本武学所附 `bf_shedu` 生效、杖头机括可用；否则不附蛇毒 |
| `ps_lingshezhangfa_dushangjiadu` | 毒上加毒 | 4 | stat | Z3 | [0.06, 0.12] | 对带 `poison` 标签效果的目标，本武学伤害 +{v} |
| `ps_lingshezhangfa_lingshe` | 灵蛇 | 8 | trigger | — | 0.40 | `onParry`（每回合 1 次）：40% 以杖尾反击 ×0.6，附 `bf_shedu`（需蛇杖） |
| `ps_lingshezhangfa_dacheng` | 西毒大成 | 10 | mechanic | — | — | 本武学使目标 `bf_shedu` 达 3 层时，额外施加 `bf_mabi` 1 回合（100%） |

#### `sk_lingshequan` 灵蛇拳（8 地中 · 拳脚/拳掌 · 白驼山）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：灵蛇拳以手臂忽然弯曲、从意外方位出拳见长；《射雕英雄传》中欧阳锋创制动机及实际使用者、对手（待考）。招名与效果为原创扩展 |
| origin / lineage | `canon` / 欧阳锋 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.55/0.45 · 4 |
| reqs | `attrs {agi 45, str 40}`；`aptitude {apFist 45}`；`prereq [{skill: sk_shexingdiaoshou, layer: 5}]`；`sect {id: sect_baituoshan, rank: 3}`；`hard [sect, prereq]` |
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
| 出处 | 射雕末：欧阳锋逆练被篡改的《九阴真经》，经脉倒转，点穴竟不能制；神雕：欧阳锋以逆行经脉之法传杨过，使其能自解穴道（原著）。独立成“逆转经脉”内功及其数值为原创扩展 |
| origin / lineage | `canonExpanded` / 欧阳锋 → 杨过 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0/1（攻击招式覆写 0.20/0.80）· 4 |
| inner | `contribution {mpMaxPct 26, hpMaxPct 18, attrs {con 6, wil 4}, mpRegen 1.8, stats {resSeal 15}}`（IP = 26+18+2×(6+4)+5×1.8 = **73**，预算 72 ±5%） |
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

**`sk_shentuoxueshanzhang` 神驼雪山掌**（6 玄上 · 拳脚/拳掌 · 阳 · 0.60/0.40 · 栏 3）｜reqs：`attrs {str 30, agi 30}`、`aptitude {apFist 30}`、`sect {id: sect_baituoshan, rank: 2}`（硬）｜layerStats：`parry [1,5]`、`hit [1,5]`｜获取：射雕 `master npc_ouyangke` `maxLayer 10`；神雕 `manual it_miji_shentuoxueshanzhang`（白驼山庄遗谱，原创扩展）`maxLayer 8`；`observe` 6｜出处：《射雕英雄传》中欧阳克所使掌法的正式名称与场景（待考）；招名为**（原创扩展）**

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 驼峰叠掌 `mv_shentuoxueshanzhang_tuofeng` | 1 | 单体·1（2 段） | 1.10 | 6%/1/1000 | — | 可 | 1.12 |
| 雪崩式 `mv_shentuoxueshanzhang_xuebeng` | 3 | `aoe_cone n2` | 0.95 | 7%/2/1000 | `bf_hanqi` 30% | 可 | 0.75×1.29−0.03 |
| 大漠孤烟 `mv_shentuoxueshanzhang_guyan` | 5 | 单体·1–3·远程 | 1.00 | 7%/1/1000 | — | 可 | 1.17×0.85 |
| 神驼负重 `mv_shentuoxueshanzhang_fuzhong` | 7 | 单体·1 | 1.25 | 8%/2/1000 | 击退 1；`bf_xuanyun` 20% 1 | 可 | 1.34−0.05−0.05 |

被动：`ps_shentuoxueshanzhang_naihan` 耐寒（1，stat：`resCold` +[4, 10] pp）；`ps_shentuoxueshanzhang_tuobu` 驼步（5，stat：`tough` +[2%, 5%]）；`ps_shentuoxueshanzhang_dacheng` 雪山（10，stat Z3：对带 `cold` 标签效果的目标 +8%）。

**`sk_yushe` 驭蛇术**（6 玄上 · 杂学/驭兽 · 中性 · 0.40/0.60 · 栏 3）｜reqs：`attrs {cha 30}`、`sect {id: sect_baituoshan, rank: 1}`（硬）｜强度属性 `cha`（05 §2.3）｜layerStats：`effHit [2,6]`、`resPoison [1,4]`｜获取：射雕 `master npc_baituo_shenutou`（蛇奴头目）`maxLayer 10`｜出处：《射雕英雄传》中白驼山蛇奴以哨音驱使蛇群；将其抽象成可学杂学及战斗区域效果为原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 召蛇 `mv_yushe_zhaoshe` | 1 | `aoe_zone sq3, t 3`·1–3 | 0.30/跳 | 8%/2/1000 | 区内每跳 `bf_shedu` 50% | 可 | 0.25×(1+0.24+0.10)−0.05 |
| 蛇阵 `mv_yushe_shezhen` | 4 | `aoe_zone line, t 2`·1–3 | 0.20/跳 | 6%/3/1000 | 入区敌 `bf_panshan` 100%、`bf_shedu` 30% | 可 | 0.25×1.36−0.10−0.03 |
| 驱蛇噬敌 `mv_yushe_shidi` | 7 | `aoe_bolt`·1–4·投射 | 1.10 | 7%/2/1000 | `bf_shedu` 80% | 可 | (1+0.24+0.05)×0.92−0.08 |

被动：`ps_yushe_shexiao` 蛇哨（1，mechanic：野外遭遇蛇类敌人时可"驱散"免战或"收服"为战斗召唤，design/11 驭兽接口）；`ps_yushe_bishe` 避蛇（5，stat：`resPoison` +[5, 10] pp）；`ps_yushe_dacheng` 万蛇（10，mechanic：召蛇区域持续 +1 跳）。

**`sk_baituodujing` 白驼毒经**（5 玄中 · 杂学/毒 · 中性 · 0.30/0.70 · 栏 3）｜**（原创扩展）**；“西毒”欧阳锋与白驼山用毒、驱蛇为原著事实｜reqs：`attrs {wis 30}`、`morality {max: 0}`（软）、`sect {id: sect_baituoshan, rank: 2}`（硬：sect）｜强度技艺 `poi`（C17 仅迁移既有明确数值，本文不臆造门槛）｜layerStats：`effHit [2,6]`、`resPoison [1,4]`｜获取：射雕 `master npc_ouyangke` `maxLayer 10`；神雕 `manual it_miji_baituodujing` `maxLayer 8`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 淬毒 `mv_baituodujing_cuidu` | 1 | 自身 | 0 | 5%/3/900 | 本武学外的下 3 次命中附 `bf_zhongdu` 30%（新钩子 `weaponCoat`，待决 W-05） | — | 支援 |
| 毒雾 `mv_baituodujing_duwu` | 4 | `aoe_zone sq3, t 2`·1–3·友伤 `all` | 0.30/跳 | 8%/2/1000 | 区内每跳 `bf_zhongdu` 60% | — | 0.25×1.34−0.06（友伤补偿按 §3.3 注） |
| 以毒攻毒 `mv_baituodujing_gongdu` | 7 | 单体友方·0–1 | 0 | 6%/3/1000 | 驱散 `poison` 2 个（≤ 品阶）；回复 8% `hpMax` | — | 支援 |

被动：`ps_baituodujing_baidu` 百毒（1，stat：`resPoison` +[5, 12] pp）；`ps_baituodujing_duyin` 毒引（5，stat：对带 `poison` 标签效果的目标，自身效果命中 +5%）；`ps_baituodujing_dacheng` 毒经大成（10，mechanic：解锁白驼山毒药配方，design/10 接口）。

**`sk_shexingdiaoshou` 蛇形刁手**（3 黄上 · 拳脚/擒拿 · 中性 · 0.80/0.20 · 栏 3）｜reqs：无｜layerStats：`seal [1,3]`、`hit [1,3]`｜获取：白驼山入门；`observe` 6｜出处：**（原创扩展命名）**据白驼山蛇形武学风格构造，不宣称为原著中欧阳克的具名武学

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

### 4.6 AR-01 新增玄阶紧凑卡（4 门）

> 本节均为**（原创扩展）**，只从白驼山既有的蛇毒、驼队与逆脉风格外推，不宣称原著有这些具名武学；来源限射雕、神雕。

#### `sk_baituotunadu` 白驼吐纳术（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_baituoshan`；`nature:yin`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:25,wil:22},sect:{id:sect_baituoshan,rank:1},hard:[sect]}`；`inner.contribution:{mpMaxPct:14,hpMaxPct:8,attrs:{con:3,wil:3},mpRegen:1.5,stats:{resPoison:6,resCC:4}}`，`IP=14+8+2×6+5×1.5=41.5`；`inner.meridians:[mer_chongmai]`；`setTags:[]`。

- 招式：伏息 `mv_baituotunadu_fuxi`（L1，自身，5%/3，`bf_tiaoxi`2）；闭毒 `mv_baituotunadu_bidu`（L4，自身，6%/3，`bf_bidu`2）；均 `power:0`。
- 被动：蛇奴根基 `ps_baituotunadu_genji`（毒类效果抗性 +4→10）；耐渴 `ps_baituotunadu_naike`（沙地探索体力消耗 −5%→12%）。获取：白驼山 L1；神雕白驼遗谱 `maxLayer:8`。

#### `sk_lingsheduanci` 灵蛇短刺（5 玄中 · 兵器/棍杖）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_baituoshan`；`nature:yin`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:staff}`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{agi:30},aptitude:{apStaff:28},prereq:[{skill:sk_baituoduanbang,layer:4}],sect:{id:sect_baituoshan,rank:2},hard:[sect,prereq]}`；`layerStats:{hit:[1,6],crit:[1,4]}`；`setTags:[]`。

- 招式：蛇信刺 `mv_lingsheduanci_shexin`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；盘杖 `mv_lingsheduanci_panzhang`（L3，单体，**1.15**，7%/1，`bf_shedu`20%；`1×(1+.12+.05)−.10×.20=1.15`）；回蛇扫 `mv_lingsheduanci_huishe`（L6，横扫，**1.00**，8%/2；`.75×(1+.24+.10)=1.005≈1.00`）。
- 被动：藏蛇 `ps_lingsheduanci_cangshe`（持蛇杖时 `effHit` +3→8）；回腕 `ps_lingsheduanci_huiwan`（招架后下一招 hit +5）。获取：白驼山 L2；`observe maxLayer:6`。

#### `sk_lingshebu` 灵蛇步（6 玄上 · 轻功）——核算抽样（功能式）

**字段**｜`origin:expanded`；`sect:sect_baituoshan`；`nature:neutral`；`wOut/wIn:0.55/0.45`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`Q_skill=QS(6)=74`；`reqs:{attrs:{agi:35,wil:28},aptitude:{apLight:32},prereq:[{skill:sk_tashaxing,layer:6}],sect:{id:sect_baituoshan,rank:3},hard:[sect,prereq]}`；`layerStats:{eva:[2,6],tough:[1,4]}`；`setTags:[]`。

- 招式：蛇游 `mv_lingshebu_sheyou`（L1，自身移 2 格，6%/2，`power:0`）；折身 `mv_lingshebu_zhesheng`（L3，换至相邻敌侧后空格，7%/3，`power:0`）；脱壳 `mv_lingshebu_tuoqiao`（L6，自身，8%/4，驱散一个 `seal` 并获 `bf_piaohu`1，`power:0`）。三式均为位移/支援，不伪造伤害倍率。
- 被动：曲行 `ps_lingshebu_quxing`（连续两次移动方向不同时 eva +4→10）；避沙 `ps_lingshebu_bisha`（沙地移动不受减速）。获取：白驼山 L3；神雕欧阳锋羁绊 `maxLayer:8`。

#### `sk_dumaihuqigong` 毒脉护气功（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:sect_baituoshan`；`nature:yin`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:35,wil:35},aptitude:{apInner:32},prereq:[{skill:sk_baituotunadu,layer:6}],sect:{id:sect_baituoshan,rank:3},hard:[sect,prereq]}`；`inner.contribution:{mpMaxPct:20,hpMaxPct:12,attrs:{con:4,wil:4},mpRegen:1.8,stats:{resPoison:6,resSeal:4}}`，`IP=20+12+2×8+5×1.8=57`；`inner.meridians:[mer_chongmai,mer_yinwei]`；`setTags:[]`。

- 招式：护毒 `mv_dumaihuqigong_hudu`（L2，自身，6%/3，`bf_bidu`3）；引毒归脉 `mv_dumaihuqigong_guidu`（L6，自身，8%/4，驱散一个 `poison` 并获 `bf_qinei`2）；均 `power:0`。
- 被动：毒脉 `ps_dumaihuqigong_dumai`（主运时 `resPoison` +6→15）；借毒 `ps_dumaihuqigong_jiedu`（驱散自身中毒后回复 3% 内力，每回合至多一次）。获取：白驼山 L3；神雕遗谱 `maxLayer:8`。

### 4.7 黄阶总表（7 门；含既有 2 门索引、新增 5 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_tashaxing` | 踏沙行（2 黄中） | 白驼山 | 轻功 | 射雕、神雕 | `QS(2)=38`，沙地移动；`set_baituoshan` | 无；入门 | **（原创扩展）**；详细卡见 §4.5 |
| `sk_shexingtunaxi` | 蛇形吐纳息（2 黄中） | 白驼山 | 内功 | 射雕、神雕 | `nature:yin`；`IP=8+5+2×3+5×1=24`；`mer_chongmai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_baituoduanbang` | 白驼短棒（2 黄中） | 白驼山 | 兵器/棍杖 | 射雕、神雕 | 单体 1.10，短杖点刺；`[]` | 无；L1 | **（原创扩展）** |
| `sk_shanbushequan` | 山步蛇拳（2 黄中） | 白驼山 | 拳脚/拳掌 | 射雕、神雕 | 单体 1.05，侧移后 hit +3；`[]` | 无；L1 | **（原创扩展）** |
| `sk_shexingdiaoshou` | 蛇形刁手（3 黄上） | 白驼山 | 拳脚/擒拿 | 射雕、神雕 | 刁腕、缴械；`set_baituoshan` | 无；入门 | **（原创扩展命名）**；详细卡见 §4.5 |
| `sk_duwushou` | 毒雾手（3 黄上） | 白驼山 | 拳脚/擒拿 | 射雕、神雕 | 单体 .95，`bf_zhongdu`30%；`[]` | 蛇形吐纳息 3 重 | **（原创扩展）** |
| `sk_shamozhang` | 沙漠掌（3 黄上） | 白驼山 | 拳脚/拳掌 | 射雕、神雕 | 横扫 .85，沙地获得 `bf_wenzhong`1；`[]` | 山步蛇拳 4 重 | **（原创扩展）** |

**黄阶整体预算核对**：新增 5 门中，白驼短棒以单体、cd1 配 `1×1.12=1.12≈1.10`；山步蛇拳单体 1.05 为收招 1100 的 `1+.07=1.07≈1.05`；毒雾手按单体 1.00 扣中毒 `.10×.30=.03` 得 `.97≈.95`；沙漠掌横扫、cd1 为 `.75×1.12=.84≈.85`。蛇形吐纳息精确命中黄中 IP 24；所有 `layerStats≤6`。

---

## 5. 大理段氏 `sect_dali` 与天龙寺 `sect_tianlongsi`

### 5.1 门派简介

- **时代**：天龙时大理保定帝段正明、镇南王段正淳当国，段氏武学以一阳指为本；天龙寺为段氏皇族出家之所，枯荣大师与本因、本观、本相、本参诸僧及出家后的保定帝（法名本尘）守护六脉神剑谱；段誉以北冥内力学成六脉，初时时灵时不灵；"延庆太子"段延庆身残，以钢杖施段家武学（原著）。射雕/神雕时南帝段智兴出家为一灯大师，门下渔樵耕读四弟子（点苍渔隐、樵夫、农夫武三通、书生朱子柳），一灯以一阳指为黄蓉疗伤而大耗功力，王重阳曾以先天功交换一阳指（原著）。倚天时朱武连环庄的朱长龄、武烈自称朱子柳、武三通之后；其所用一阳指仅作后人残传叙述，不据此增设玩家来源。
- **强弱**：天龙 强（段氏皇族＋天龙寺）／射雕 强（一灯一脉）／神雕 中（一灯、武三通、朱子柳）；倚天的朱武连环庄后人只作时代叙述与 NPC 表现，本轮按 `rulings-v1` §3.4 不投放本组大理武学的玩家学习来源。
- **风格**：指力点穴、剑气，书法入武；一阳一脉为阳（`lg_yiyang` 同源组：一阳指、六脉神剑、先天功，02 §5.4），天龙寺禅功调和。
- **加入**：天龙：镇南王府护卫/客卿（`rank` 1–3），立大功后经保定帝特许学一阳指（原著称段家武功不传外人，本作以"特许"处理，原创扩展）；天龙寺"护法居士"（`rank` 3）。射雕/神雕：过渔樵耕读四关、入一灯门下（原著四关情节）。
- **进阶链**：天南心法（黄上）→ 五罗轻烟掌（玄中）→ 一阳指（天中）；春秋笔法（黄上）→ 一阳书指（地中）；天南心法（黄上）→ 段家剑法（地下；5 重起可以杖代剑，致敬段延庆）；镇南棍法（黄中）为王府护卫入门兵器。

### 5.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_liumai` | 六脉神剑 | 拳脚/指法 | 12 天上 | 调和 | 0.15/0.85 | 天龙 | 天龙寺观谱（奇遇）；天龙寺诸僧；段誉羁绊 | 原著 |
| `sk_yiyangzhi` | 一阳指 | 拳脚/指法 | 11 天中 | 阳 | 0.30/0.70 | 天龙、射雕、神雕 | 段氏特许；天龙寺护法；一灯；武三通 | 原著 |
| `sk_kurongchangong` | 枯荣禅功 | 内功 | 9 地上 | 调和 | 0/1 | 天龙 | 天龙寺护法；枯荣大师 | 原著（天龙寺枯荣大师） |
| `sk_yiyangshuzhi` | 一阳书指 | 兵器/奇门（笔） | 8 地中 | 阳 | 0.35/0.65 | 神雕 | 朱子柳 | 原著（神雕·朱子柳） |
| `sk_duanjiajianfa` | 段家剑法 | 兵器/剑 | 7 地下 | 阳 | 0.60/0.40 | 天龙、射雕、神雕 | 段氏特许；渔樵耕读 | 原著（天龙·段氏）；射雕后延续为原创扩展 |
| `sk_wuluoqingyanzhang` | 五罗轻烟掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.60/0.40 | 天龙 | 段正淳 | 正式名、归属与使用场景见 §5.5 考据项 |
| `sk_cangshanfeidu` | 苍山飞渡 | 轻功 | 4 玄下 | 中性 | — | 天龙、射雕、神雕 | 巴天石；大理护卫 | 原创扩展（巴天石善轻功为原著） |
| `sk_tiannanxinfa` | 天南心法 | 内功 | 3 黄上 | 阳 | 0/1 | 天龙、射雕、神雕 | 王府护卫入门 | 原创扩展 |
| `sk_chunqiubifa` | 春秋笔法 | 兵器/奇门（笔） | 3 黄上 | 阳 | 0.60/0.40 | 天龙、射雕、神雕 | 朱丹臣（天龙）；朱子柳（射雕/神雕） | **（原创扩展命名）**据朱丹臣的判官笔与朱子柳书法入武构造 |
| `sk_kaishanfufa` | 开山斧法 | 兵器/奇门（斧） | 3 黄上 | 阳 | 0.85/0.15 | 天龙、射雕、神雕 | 古笃诚（天龙）；樵子（射雕） | **（原创扩展命名）**据古笃诚板斧与一灯弟子樵子构造 |
| `sk_zhennangunfa` | 镇南棍法 | 兵器/棍杖 | 2 黄中 | 阳 | 0.85/0.15 | 天龙、射雕、神雕 | 傅思归（天龙）；王府护卫 | **（原创扩展命名）**据傅思归熟铜棍构造 |

> 天龙寺（`sect_tianlongsi`）只有六脉神剑、枯荣禅功两门本寺武学；入门与中坚武学借用大理段氏（护法居士同时计为镇南王府客卿）。

### 5.3 天阶条目卡

#### `sk_liumai` 六脉神剑（12 天上 · 拳脚/指法 · 天龙寺）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：以一阳指内力化为剑气，自少商、商阳、中冲、关冲、少冲、少泽六脉射出；天龙寺御鸠摩智、段誉少室山败慕容复；段誉初学时时灵时不灵（原著）。六剑剑意据原著描写；上述六脉对应的形容词与次序须逐字核对《天龙八部》剑谱解说（待考） |
| origin / lineage | `canon` / 大理段氏 · 天龙寺（枯荣、本因、本观、本相、本参、本尘）→ 段誉 |
| sourceChapters | `ch01_tianlong` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.15/0.85 · 5 |
| reqs | `attrs {wis 60, con 55}`；`aptitude {apFinger 60}`；`prereq [{anyOf: [{skill: sk_yiyangzhi, layer: 5}, {skill: sk_beiming, layer: 5}]}]`；`hard [prereq]`（外层 AND、组内 OR；C17） |
| layerStats | `hit [3, 10]`、`pierce [3, 10]`（合计 20） |
| 层数要点 | 1：少商剑、商阳剑、剑气、时灵时不灵 ｜ 2：中冲剑 ｜ 3：关冲剑、无形 ｜ 4：少冲剑 ｜ 5：少泽剑、剑随心转 ｜ **7：绝招 六脉齐发** ｜ 9：剑气纵横 ｜ 10：六脉大成 |
| setTags / conflicts | `set_dali_yiyang` / 无 |
| special / observable | `{fusible: true}` / `false` |
| 获取 | 天龙 `qiyu q_01_qiyu_9x`（天龙寺牟尼堂观剑谱，须天龙寺护法 `rank 3` 且一阳指 ≥ 5；《天龙八部》中剑谱遭毁的先后时点及毁谱者动作待核对〔待考〕）`maxLayer 10`；`master` 天龙寺诸僧之一 `maxLayer 6`（该僧所精之脉为“本脉”，本脉招式 +10%，原创扩展）；`master npc_duanyu` `maxLayer 8`（羁绊 ≥ 4；段誉教法随性，1–6 重“时灵时不灵”概率 ×1.5，原创扩展） |
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
| 出处 | 天龙：段氏家传，段正明、段正淳、天龙寺诸僧皆擅，段延庆以钢杖施之；射雕：一灯以一阳指为黄蓉疗伤而大耗功力，王重阳以先天功交换一阳指并以之破欧阳锋蛤蟆功；神雕：一灯、武三通、朱子柳（原著）。“一阳指分九品、以一品为最高”的说法是否见于三联/广州修订版及出现情节（待考） |
| origin / lineage | `canon` / 大理段氏 → 一灯 → 渔樵耕读 |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.30/0.70 · 5 |
| reqs | `attrs {wis 55, con 50}`；`aptitude {apFinger 55}`；`morality {min 10}`；`sect {id: sect_dali, rank: 3}`；`hard [sect, morality]`（一灯门下与天龙寺护法视为满足 `sect`） |
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
| **乾阳一指** `mv_yiyangzhi_qianyang`（绝招，原创扩展命名） | 7 | 单体 · 1–3 · 远程 | 2.35 | 10%/—/1200 | `bf_fengxue` 100% 2 | 可 | 3.00×0.85−0.20×1.00 = 2.35 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_yiyangzhi_renxue` | 一阳认穴 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_renxue`（`dur 99`，品阶 inherit） |
| `ps_yiyangzhi_jiupin` | 九品 | 1 | mechanic | — | +2pp/品 | 界面以“第 n 重 = 第 (10−n) 品”显示（九品最低，10 重为“一品圆满”）；每晋一品本武学封穴施加率 +2 个百分点。九品名称为版本敏感文案，原著依据见本卡“出处”的考据项；机制本身为原创扩展 |
| `ps_yiyangzhi_chunyang` | 纯阳 | 4 | stat | Z3 | 0.10 | 对带 `cold` 标签效果的目标 +10%，命中时驱散其 1 个 `cold` 效果（≤ 品阶） |
| `ps_yiyangzhi_yizhang` | 以杖代指 | 8 | mechanic | — | — | 持棍杖时本武学 `Mod_armed = 1.0`（05 §6.3），近身招式射程 +1——致敬段延庆以钢杖施一阳指（原著） |
| `ps_yiyangzhi_dacheng` | 一品圆满 | 10 | mechanic | — | — | 一阳疗伤不再使自身虚弱；本武学封穴类效果对 Boss 的控制递减减半（06 §11.4） |

### 5.4 地阶条目卡

#### `sk_kurongchangong` 枯荣禅功（9 地上 · 内功 · 天龙寺）

| 字段 | 值 |
|---|---|
| 出处 | 天龙：天龙寺枯荣大师面容一半红润、一半枯槁，久修枯荣禅功；三联/广州修订版对其入定年数与功法原句（待考）。枯式/荣式架势为原创扩展 |
| origin / lineage | `canonExpanded` / 枯荣大师 |
| sourceChapters | `ch01_tianlong` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1 · 4 |
| inner | `contribution {mpMaxPct 32, hpMaxPct 22, attrs {wil 8, con 6}, mpRegen 2.5, stats {resMind 10, resInjury 5}}`（IP = 32+22+2×(8+6)+5×2.5 = **94.5**，预算 94.5） |
| reqs | `attrs {wil 55, con 45}`；`aptitude {apInner 45}`；`morality {min 10}`；`sect {id: sect_tianlongsi, rank: 3}`；`hard [sect, morality]` |
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
| 出处 | 神雕大胜关英雄大会：朱子柳以一阳指力融入书法、以笔为兵对霍都；所书次序及帖名须核对《神雕侠侣》该场比武（待考：褚遂良《房玄龄碑》、怀素《自叙帖》或版本异文、石鼓文）。倚天朱武连环庄后人可作 NPC 传承叙述，但按白名单不提供玩家学习 |
| origin / lineage | `canon` / 一灯 → 朱子柳 →（朱长龄一系，残） |
| sourceChapters | `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.35/0.65 · 4 |
| weaponReq | `{category: exotic, kinds: [brush]}` |
| reqs | `attrs {wis 50, agi 40}`；`aptitude {apExotic 45}`；`skills {art: 40}`；`prereq [{skill: sk_chunqiubifa, layer: 5}]`；`sect {id: sect_dali, rank: 3}`；`hard [sect, prereq]`（`art` 为软门槛，C17） |
| layerStats | `seal [3, 9]`、`hit [1, 6]`（合计 15） |
| 层数要点 | 1：房玄龄碑、点画、书法入武 ｜ 3：自言帖 ｜ 4：一阳笔力 ｜ 5：石鼓文 ｜ 6：一阳透纸 ｜ **7：绝招 满纸云烟** ｜ 8：笔势 ｜ 9：笔走龙蛇 ｜ 10：书指大成 |
| setTags / conflicts | `set_dali_yiyang` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 神雕 `master npc_zhuziliu` `maxLayer 10`（一灯门下或羁绊 ≥ 3）；`observe` 6。倚天朱武连环庄 NPC 可使用残式，但不掉落可拼完整秘籍的残页 |
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
| 出处 | 天龙：大理段氏家传剑法；段延庆身残后以钢杖代剑施展段家武学（原著）。射雕后的传承、各招名与效果为原创扩展（取大理风物） |
| origin / lineage | `canonExpanded` / 大理段氏 → 一灯门下 → 朱武连环庄后人（倚天仅作 NPC 残传叙述） |
| sourceChapters | `ch01_tianlong` `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.60/0.40 · 4 |
| weaponReq | `{category: sword, altCategories: {unlockLayer: 5, categories: [staff], mult: 0.9}}`（5 重起以杖代剑） |
| reqs | `attrs {agi 40, str 35}`；`aptitude {apSword 40}`；`prereq [{skill: sk_tiannanxinfa, layer: 4}]`；`sect {id: sect_dali, rank: 3}`；`hard [sect, prereq]` |
| layerStats | `parry [2, 8]`、`hit [1, 7]`（合计 15） |
| 层数要点 | 1：苍山云起、洱海月明、正气 ｜ 3：三塔倒影 ｜ 5：剑指一阳、剑中藏指、以杖代剑 ｜ **7：绝招 南诏风云** ｜ 8：蝴蝶泉 ｜ 10：段家大成 |
| setTags / conflicts | `set_dali_yiyang` / `{with: sk_yiyangzhi, type: synergy}`（见被动"剑中藏指"） |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 天龙 `master npc_duanzhengchun` `maxLayer 10`（客卿 `rank 3`）；射雕/神雕 `master npc_diancangyuyin`（点苍渔隐，原创扩展）`maxLayer 8`；`observe` 6。倚天段氏余脉只作 NPC 表现，不提供玩家学习来源 |
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

**`sk_wuluoqingyanzhang` 五罗轻烟掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.60/0.40 · 栏 3）｜reqs：`attrs {agi 30, wis 25}`、`aptitude {apFist 25}`、`prereq [{skill: sk_tiannanxinfa, layer: 3}]`、`sect {id: sect_dali, rank: 2}`（硬：sect、prereq）｜layerStats：`eva [1,5]`、`hit [1,5]`｜获取：天龙 `master npc_duanzhengchun` `maxLayer 10`；`observe` 6｜出处：段正淳在《天龙八部》中是否明确使用五罗轻烟掌及其场景（待考）；招名原创扩展

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 轻烟掠影 `mv_wuluoqingyanzhang_lueying` | 1 | 单体·1 | 0.95 | 6%/0/900 | — | 可 | 1−0.07 |
| 五罗连掌 `mv_wuluoqingyanzhang_lianzhang` | 3 | 单体·1（5 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 烟笼寒水 `mv_wuluoqingyanzhang_yanlong` | 5 | `aoe_cone n2` | 0.90 | 7%/2/1000 | `bf_muxuan` 50% | 可 | 0.75×1.29−0.05 |
| 轻烟散尽 `mv_wuluoqingyanzhang_sanjin` | 7 | `aoe_behind`·1–2 | 1.00 | 7%/2/1000 | 绕背 | 可 | 0.90×1.29−0.15 |

被动：`ps_wuluoqingyanzhang_qingyan` 轻烟（1，stat：`eva` +[2%, 5%]）；`ps_wuluoqingyanzhang_liudong` 流动（5，stat Z3：本回合移动 ≥ 2 格时本武学 +6%）；`ps_wuluoqingyanzhang_dacheng` 五罗（10，stat Z0：本武学多段招式每段暴击 +2）。

**`sk_cangshanfeidu` 苍山飞渡**（4 玄下 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**巴天石一脉的山地轻功（巴天石善轻功为原著）｜reqs：`attrs {agi 25}`、`aptitude {apLight 20}`｜轻功值 `QS(4) = 56`｜layerStats：`eva [1,5]`、`tough [1,5]`｜获取：天龙 `master npc_batianshi` `maxLayer 10`；射雕/神雕大理护卫 `master` `maxLayer 8`；`observe` 6

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 云岭飞渡 `mv_cangshanfeidu_feidu` | 1 | 自身 | 0 | 4%/2/800 | 自身 `bf_tengyue` 2 | — | 支援 |
| 十九峰 `mv_cangshanfeidu_shijiufeng` | 5 | 自身 | 0 | 5%/3/900 | 自身 `bf_jixing` 2、`bf_piaohu` 2 | — | 支援 |

被动：`ps_cangshanfeidu_panyan` 攀岩（1，mechanic：攀爬崖壁地形体力消耗 −[10%, 25%]，design/08 接口）；`ps_cangshanfeidu_yuanman` 圆满（10，stat：`jump` +1）。

**`sk_tiannanxinfa` 天南心法**（3 黄上 · 内功 · `nature: yang` · 0/1 · 栏 3）｜**（原创扩展）**大理王府护卫与段氏子弟的入门心法｜reqs：`sect {id: sect_dali, rank: 1}`（硬）｜contribution：`mpMaxPct 10, hpMaxPct 6, attrs {wis 2, con 2}, mpRegen 1.2, stats {seal 3, effHit 3}`（IP = 10+6+2×4+5×1.2 = **30**）｜setTags：`set_dali_yiyang`｜获取：天龙/射雕/神雕大理一脉 `master`；`pages`（3 页）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 调息 `mv_tiannanxinfa_tiaoxi` | 3 | 自身 | 0 | 4%/3/900 | 自身 `bf_huinei` 2 | — | 支援 |
| 纯阳护脉 `mv_tiannanxinfa_humai` | 6 | 自身 | 0 | 4%/3/900 | 自身 `bf_huxue` 2 | — | 支援 |

被动：`ps_tiannanxinfa_yangqi` 一阳之气（1，stat：`seal` +[1, 3]，`auxMode scaled`）；`ps_tiannanxinfa_yuanman` 圆满（10，mechanic：首次练满 `apInner` +1；学习一阳指、段家剑法时资质软门槛 −10）。

**`sk_chunqiubifa` 春秋笔法**（3 黄上 · 兵器/奇门（笔）· 阳 · 0.60/0.40 · 栏 3）｜**（原创扩展命名）**据《天龙八部》中朱丹臣使用判官笔及《神雕侠侣》中朱子柳书法入武构造｜weaponReq：`{category: exotic, kinds: [brush]}`｜reqs：`attrs {wis 20}`｜layerStats：`seal [1,3]`、`hit [1,3]`｜获取：天龙 `master npc_zhudanchen` `maxLayer 10`；射雕/神雕 `master npc_zhuziliu` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铁笔点睛 `mv_chunqiubifa_dianjing` | 1 | 单体·1 | 0.95 | 5%/0/1000 | `bf_fengxue` 15% 1 | 可 | 1−0.03 |
| 微言大义 `mv_chunqiubifa_weiyan` | 4 | 单体·1 | 1.05 | 5%/1/1000 | `bf_dongyao` 50% | 可 | 1.12−0.05 |
| 一字褒贬 `mv_chunqiubifa_baobian` | 7 | `aoe_pierce` | 1.15 | 6%/2/1000 | — | 可 | 0.90×1.29 |

被动：`ps_chunqiubifa_bimo` 笔墨（5，stat：技艺 `art` 每 10 点 `seal` +1，至多 +4）；`ps_chunqiubifa_yuanman` 圆满（10，mechanic：首次练满 `apExotic` +1；一阳书指资质软门槛 −10）。

**`sk_kaishanfufa` 开山斧法**（3 黄上 · 兵器/奇门（斧）· 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展命名）**据《天龙八部》中古笃诚使用板斧与《射雕英雄传》中一灯弟子樵子持斧构造｜weaponReq：`{category: exotic, kinds: [axe]}`｜reqs：`attrs {str 20}`｜layerStats：`crit [1,3]`、`hit [1,3]`｜获取：天龙 `master npc_guducheng` `maxLayer 10`；射雕 `master npc_qiaozi` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 力劈华山 `mv_kaishanfufa_lipi` | 1 | 单体·1 | 1.20 | 5%/1/1100 | — | 可 | 1+0.12+0.07 |
| 樵斧断木 `mv_kaishanfufa_duanmu` | 4 | 单体·1 | 1.25 | 6%/2/1000 | `bf_pojia` 60% | 可 | 1.29−0.06 |
| 横斧拦腰 `mv_kaishanfufa_lanyao` | 7 | `aoe_sweep` | 0.95 | 6%/2/1000 | — | 可 | 0.75×1.29 |

被动：`ps_kaishanfufa_liqi` 蛮力（5，stat Z6：暴击伤害 +[5, 10] pp）；`ps_kaishanfufa_yuanman` 圆满（10，mechanic：伐木、开路等探索交互效率 +20%，design/11 接口）。

**`sk_zhennangunfa` 镇南棍法**（2 黄中 · 兵器/棍杖 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展命名）**据《天龙八部》中镇南王府护卫傅思归使用熟铜棍构造｜reqs：无｜layerStats：`parry [1,4]`、`hit [1,2]`｜获取：天龙 `master npc_fusigui` `maxLayer 10`；射雕/神雕大理护卫 `master`；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铜棍开道 `mv_zhennangunfa_kaidao` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 横扫千钧 `mv_zhennangunfa_hengsao` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 镇岳 `mv_zhennangunfa_zhenyue` | 7 | 单体·1–2 | 1.10 | 5%/1/1000 | `bf_xuanyun` 15% 1 | 可 | 1.12−0.0375 |

被动：`ps_zhennangunfa_huwei` 护卫（5，stat：与友方相邻时 `parry` +[2%, 4%]）；`ps_zhennangunfa_yuanman` 圆满（10，mechanic：首次练满 `apStaff` +1）。

### 5.6 AR-01 新增玄阶紧凑卡（5 门）

> 本节均为**（原创扩展）**；大理王府护卫与天龙寺禅步只是玩法补链，不把原著人物所用普通兵刃扩写成具名绝学。

#### `sk_dalishenfa` 大理身法（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_dali`；`nature:neutral`；`wOut/wIn:0.60/0.40`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]`；`Q_skill=QS(4)=56`；`reqs:{attrs:{agi:25},aptitude:{apLight:22},sect:{id:sect_dali,rank:1},hard:[sect]}`；`layerStats:{eva:[1,5],tough:[1,5]}`；`setTags:[]`。

- 招式：绕塔 `mv_dalishenfa_raota`（L1，自身移2格，5%/2）；渡溪 `mv_dalishenfa_duxi`（L4，自身，6%/3，`bf_shenqing`1）；均 `power:0`。
- 被动：山路 `ps_dalishenfa_shanlu`（山地移动耗力 −5%→12%）；护驾 `ps_dalishenfa_hujia`（相邻友方存在时 eva +3→8）。获取：大理 L1；天龙寺护法居士可学。

#### `sk_huweidaofa` 护卫刀法（5 玄中 · 兵器/刀）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_dali`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:blade}`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{str:30},aptitude:{apBlade:28},prereq:[{skill:sk_dalichangdao,layer:4}],sect:{id:sect_dali,rank:2},hard:[sect,prereq]}`；`layerStats:{parry:[1,6],hit:[1,4]}`；`setTags:[]`。

- 招式：护门 `mv_huweidaofa_humen`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；横刀 `mv_huweidaofa_hengdao`（L3，横扫，**0.95**，7%/2；`.75×1.29=.9675≈.95`）；援主 `mv_huweidaofa_yuanzhu`（L6，单体，**1.20**，7%/2，击退1；`1×1.29−.05=1.24≈1.20`）。
- 被动：守门 `ps_huweidaofa_shoumen`（与友方相邻时 parry +3→8）；忠勇 `ps_huweidaofa_zhongyong`（援护后获 `bf_ruiyi`1）。获取：大理 L2；神雕一灯门下护卫遗谱。

#### `sk_cangshanzhang` 苍山掌（5 玄中 · 拳脚/拳掌）

**字段**｜`origin:expanded`；`sect:sect_dali`；`nature:yang`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{str:28,con:25},aptitude:{apFist:28},prereq:[{skill:sk_huweiduanquan,layer:4}],sect:{id:sect_dali,rank:2},hard:[sect,prereq]}`；`layerStats:{tough:[1,5],hit:[1,5]}`；`setTags:[]`。

- 招式：苍山横云 `mv_cangshanzhang_hengyun`（L1，横扫，.85，6%/1）；十九峰叠掌 `mv_cangshanzhang_diezhan`（L3，单体三段，1.30，7%/2）；洱海推澜 `mv_cangshanzhang_tuilan`（L6，线2，1.00，8%/2，击退1）。
- 被动：山沉 `ps_cangshanzhang_shanchen`（未移动时 tough +3→8）；云开 `ps_cangshanzhang_yunkai`（击退目标后 hit +5）。获取：大理 L2；招名、规则均为原创扩展。

#### `sk_duanshiyangshenggong` 段氏养生功（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:sect_dali`；`nature:harmony`；`wOut/wIn:0/1`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:35,wis:32},aptitude:{apInner:32},prereq:[{skill:sk_wangfutunaxi,layer:6}],sect:{id:sect_dali,rank:3},hard:[sect,prereq]}`；`inner.contribution:{mpMaxPct:20,hpMaxPct:12,attrs:{con:3,wis:3,wil:2},mpRegen:1.8,stats:{resInjury:5,resSeal:5}}`，`IP=20+12+2×8+5×1.8=57`；`inner.meridians:[mer_renmai,mer_chongmai]`；`setTags:[]`。

- 招式：养息 `mv_duanshiyangshenggong_yangxi`（L2，自身，6%/3，`bf_yangsheng`3）；护脉 `mv_duanshiyangshenggong_humai`（L6，单体友方，8%/4，`bf_huoluo`2、`bf_huxue`2）；均 `power:0`。
- 被动：王府养生 `ps_duanshiyangshenggong_yangsheng`（休息恢复 +5%→12%）；正脉 `ps_duanshiyangshenggong_zhengmai`（主运时 `resSeal` +5→12）。获取：大理 L3；一灯羁绊线 `maxLayer:8`。

#### `sk_tianlongchanbu` 天龙禅步（6 玄上 · 轻功）——核算抽样（功能式）

**字段**｜`origin:expanded`；`sect:sect_tianlongsi`；`nature:harmony`；`wOut/wIn:0.35/0.65`；`sourceChapters:[ch01_tianlong]`；`Q_skill=QS(6)=74`；`reqs:{attrs:{agi:35,wil:35},aptitude:{apLight:32},sect:{id:sect_tianlongsi,rank:2},hard:[sect]}`；`layerStats:{eva:[2,5],resMind:[1,5]}`；`setTags:[]`。

- 招式：绕殿 `mv_tianlongchanbu_raodian`（L1，自身移2格，6%/2，`power:0`）；定步 `mv_tianlongchanbu_dingbu`（L3，自身，7%/3，`bf_wenzhong`2，`power:0`）；退礼 `mv_tianlongchanbu_tuili`（L6，后撤2格并获 `bf_ningshen`1，8%/3，`power:0`）。
- 被动：禅行 `ps_tianlongchanbu_chanxing`（本回合未攻击时 resMind +4→10）；不争 `ps_tianlongchanbu_buzheng`（后撤后下次受击 Z4 −5%）。获取：天龙寺 L2；仅天龙。

### 5.7 黄阶总表（11 门；含既有 4 门索引、新增 7 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_zhennangunfa` | 镇南棍法（2 黄中） | 大理王府 | 兵器/棍杖 | 天龙、射雕、神雕 | 单体 1.00、横扫 .85；护卫招架 | 无；L1 | **（原创扩展命名）**；详细卡见 §5.5 |
| `sk_wangfutunaxi` | 王府吐纳息（2 黄中） | 大理王府 | 内功 | 天龙、射雕、神雕 | `nature:yang`；`IP=8+5+2×3+5×1=24`；`mer_renmai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_dalirumenjian` | 大理入门剑（2 黄中） | 大理段氏 | 兵器/剑 | 天龙、射雕、神雕 | 单体 1.10、基础招架；`[]` | 无；L1 | **（原创扩展）** |
| `sk_huweiduanquan` | 护卫短拳（2 黄中） | 大理王府 | 拳脚/拳掌 | 天龙、射雕、神雕 | 单体 1.10，援护相邻友方；`[]` | 无；L1 | **（原创扩展）** |
| `sk_dianchibu` | 滇池步（2 黄中） | 大理段氏 | 轻功 | 天龙、射雕、神雕 | `QS(2)=38`，浅水移动；`[]` | 无；L1 | **（原创扩展）** |
| `sk_tiannanxinfa` | 天南心法（3 黄上） | 大理段氏 | 内功 | 天龙、射雕、神雕 | `nature:yang`；`IP=10+6+2×4+5×1.2=30`；`set_dali_yiyang` | L1 | **（原创扩展）**；详细卡见 §5.5 |
| `sk_chunqiubifa` | 春秋笔法（3 黄上） | 大理段氏 | 兵器/奇门 | 天龙、射雕、神雕 | 单体 .95、封穴15% | 无 | **（原创扩展命名）**；详细卡见 §5.5 |
| `sk_kaishanfufa` | 开山斧法（3 黄上） | 大理段氏 | 兵器/奇门 | 天龙、射雕、神雕 | 单体 1.20，破甲60%招式 1.25 | 无 | **（原创扩展命名）**；详细卡见 §5.5 |
| `sk_dalichangdao` | 大理长刀（3 黄上） | 大理王府 | 兵器/刀 | 天龙、射雕、神雕 | 单体 1.10、线2 .95；`[]` | 王府吐纳息 3 重 | **（原创扩展）** |
| `sk_yuyincha` | 渔隐叉（3 黄上） | 一灯门下渔隐 | 兵器/奇门 | 射雕、神雕 | `exotic/misc`，线2 .95、拉拽式 1.00；`[]` | 滇池步 3 重 | 点苍渔隐持兵器的具体形制（待考）；套路**（原创扩展命名）** |
| `sk_tianlongmuzhang` | 天龙木杖（3 黄上） | 天龙寺 | 兵器/棍杖 | 天龙 | 单体 1.10、守势 `bf_shoushi`1；`[]` | 天龙寺 L1 | **（原创扩展）** |

**黄阶整体预算核对**：新增攻击招按黄阶基准配置：单体 cd1 `1×1.12=1.12≈1.10`，线2 cd1 `.85×1.12=.952≈.95`；渔隐叉拉拽式按单体 cd1 后扣拉拽 `.10` 得 `1.02≈1.00`。滇池步用 `QS(2)=38`；王府吐纳息精确命中黄中 IP 24；所有 `layerStats≤6`。

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
| `sk_zuoyouhubo` | 左右互搏 | 杂学/心神（`misc/mind`，C16 已定） | 10 天下 | 中性 | — | 射雕、神雕 | 周伯通羁绊；神雕小龙女（原创扩展途径） | 原著 |
| `sk_wantongmizong` | 顽童迷踪 | 轻功 | 5 玄中 | 中性 | — | 射雕、神雕 | 周伯通羁绊 | 原创扩展 |

### 6.3 天阶条目卡

#### `sk_kongming` 空明拳（10 天下 · 拳脚/拳掌 · 周伯通）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：周伯通于桃花岛石洞所创七十二路空明拳，本于“以空明柔弱胜刚强”，以“空碗盛饭”为喻授郭靖（原著）；《射雕英雄传》中周伯通传郭靖的十六字拳诀之字序与版本异文（待考），本作暂取“空朦洞松、风通容梦、冲穷中弄、童庸弓虫”为招名 |
| origin / lineage | `canon` / 周伯通 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony` · 0.40/0.60 · 5 |
| reqs | `attrs {wil 55, wis 45}`；`aptitude {apFist 55}`；`hard []`（仅羁绊途径可得） |
| layerStats | `parry [4, 12]`、`counter [2, 8]`（合计 20） |
| 层数要点 | 1：空朦、洞松、空碗盛饭 ｜ 2：风通 ｜ 3：容梦、以柔克刚 ｜ 4：冲穷 ｜ 5：中弄、转劲 ｜ 6：童庸 ｜ **7：绝招 七十二路空明拳** ｜ 8：弓虫（触发）、空明 ｜ 10：空明大成 |
| setTags / conflicts | `[set_guojing_xiazhe]` / `{with: sk_zuoyouhubo, type: synergy}`（见被动"空明大成"） |
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
| category / subType / nature | `misc` / `mind`（C16 已定，不新增 `dual`）/ `neutral` |
| reqs | `attrsMax {wis 85}`；`attrs {wil 50}`；`hard [attrsMax]` |
| layerStats | `effHit [2, 8]`、`resMind [4, 12]`（合计 20） |
| 层数要点 | 1：分心二用、左手画方右手画圆 ｜ 4：一心二用 ｜ 6：双手互援 ｜ **7：绝招 双手全力** ｜ 8：心思纯一 ｜ 10：互搏大成 |
| setTags / conflicts | `[set_guojing_xiazhe]` / 无 |
| special / observable | `{fusible: false, trainMult: pureMult}` / `false` |
| 获取 | 射雕 `master npc_zhoubotong` `maxLayer 10`（桃花岛石洞）；神雕 `master npc_zhoubotong` `maxLayer 10`、`master npc_xiaolongnv` `maxLayer 8`（羁绊 ≥ 4，原创扩展途径） |
| 图鉴文本 | 周伯通所创"一心二用"之术，左手画方、右手画圆，双手各使一门武功。心思纯一者易学，聪明伶俐者反难领会——郭靖、小龙女学成，黄蓉不能（原著）。 |

| 招式（ID） | 重 | 范围 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 分心二用 `mv_zuoyouhubo_fenxin` | 1 | 依所选两招 | 各招 × `Mod_special` | 两招之和/各自冷却/较大者 + 150 | — | 依原招 | 05 §9.3.2 |
| **双手全力** `mv_zuoyouhubo_quanli`（绝招，原创扩展命名） | 7 | 依所选两招 | 各招 ×1.00 | 两招之和 + 10%/—/较大者 | — | 依原招 | 以气势 100 换取"去除 `Mod_special` 折算与 +150 收招"；两招仍须为非绝招 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_zuoyouhubo_fangyuan` | 左手画方右手画圆 | 1 | mechanic | — | — | 解锁行动“分心二用”；`dualWield: int[0,10]`，未装配可用的左右互搏时为 0，否则等于本武学当前有效层数（C16） |
| `ps_zuoyouhubo_yixin` | 一心二用 | 4 | stat | Z0 | [0.03, 0.06] | 分心二用时两招效果命中 +{v} |
| `ps_zuoyouhubo_huyuan` | 双手互援 | 6 | stat | Z3 | 0.08 | 分心二用的两招命中同一目标时，第二招 +8% |
| `ps_zuoyouhubo_chunyi` | 心思纯一 | 8 | mechanic | — | — | 免疫品阶 ≤ 自身的 `bf_luanxin`；所受 `mind` 标签减益持续 −1（最低 1） |
| `ps_zuoyouhubo_dacheng` | 互搏大成 | 10 | mechanic | — | +50 | 分心二用的收招附加值由 +150 降为 +50 |

### 6.4 玄阶紧凑卡

**`sk_wantongmizong` 顽童迷踪**（5 玄中 · 轻功 · 中性 · 栏 3）｜**（原创扩展）**老顽童嬉戏逃遁的身法｜reqs：`attrs {agi 30}`（仅周伯通羁绊途径）｜轻功值 `QS(5) = 65`｜layerStats：`eva [1,6]`、`tough [1,4]`｜setTags：`[]`｜获取：射雕/神雕 `master npc_zhoubotong` `maxLayer 10`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 捉迷藏 `mv_wantongmizong_zhuomicang` | 1 | 自身 | 0 | 5%/4/900 | 自身 `bf_yinshen` 1 | — | 支援 |
| 溜之大吉 `mv_wantongmizong_liuzhidaji` | 4 | 自身 | 0 | 5%/3/800 | 自身 `bf_dunzou` 2 | — | 支援 |
| 戏弄 `mv_wantongmizong_xinong` | 7 | 单体·1–3 | 0 | 5%/3/900 | `bf_chaofeng` 100% 1 | — | 纯控制 |

被动：`ps_wantongmizong_tongxin` 童心（1，stat：`resMind` +[3, 8] pp）；`ps_wantongmizong_yuanman` 跑得快（10，mechanic：撤退行动成功率 +20%，design/09 接口）。

### 6.5 AR-01 新增玄阶紧凑卡（1 门）

#### `sk_wantongshuangxi` 顽童双戏（6 玄上 · 拳脚/拳掌）——核算抽样

**字段**｜`origin:expanded`；`sect:null`；`lineage:周伯通`；`nature:harmony`；`wOut/wIn:0.45/0.55`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{agi:35,wil:30},aptitude:{apFist:32},prereq:[{skill:sk_kongming,layer:3}],hard:[prereq]}`；`layerStats:{parry:[2,6],counter:[1,4]}`；`setTags:[]`；**（原创扩展）**，只取周伯通嬉戏与一心二用的原著形象，不宣称有此具名拳法。

- 招式：逗你一拳 `mv_wantongshuangxi_douquan`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；忽左忽右 `mv_wantongshuangxi_huzuohuyou`（L3，绕背，**1.10**，7%/2；`1×1.29−.15=1.14≈1.10`）；双戏连环 `mv_wantongshuangxi_lianhuan`（L6，单体四段，**1.35**，8%/2；`1×(1+.24+.10)=1.34≈1.35`）。
- 被动：童心 `ps_wantongshuangxi_tongxin`（首回合 crit +4→10）；戏耍 `ps_wantongshuangxi_xishua`（招架后下一式 hit +5）。获取：周伯通羁绊 ≥2；`observe maxLayer:6`。

---

## 7. 九阴真经系（传承 · `lineage: 九阴真经`）

### 7.1 简介

- **源流**：北宋黄裳校刊《万寿道藏》而悟武学，著《九阴真经》，上卷偏内功根基、下卷载多种招式；总纲的书写方式、语言来源及一灯译解过程须核对《射雕英雄传》相关叙述（待考）。射雕时真经为天下争夺之物：周伯通背熟全经并诱郭靖记诵；黑风双煞盗得下卷，误读而练成九阴白骨爪、摧心掌；欧阳锋得郭靖篡改之伪经，逆练成狂；一灯译出总纲（原著）。神雕时王重阳在古墓石壁刻有真经要旨，小龙女、杨过习之（原著，古墓武学归古墓图鉴）。倚天时郭靖、黄蓉将真经藏于倚天剑中，周芷若得之速成（原著）。
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
| `sk_dafumoquan` | 大伏魔拳 | 拳脚/拳掌 | 9 地上 | 阳 | 0.60/0.40 | 射雕、神雕 | 真经下卷；神雕郭靖 | 原著名目；本文招式与效果为原创扩展 |
| `sk_yijinduangupian` | 易筋锻骨篇 | 内功 | 8 地中 | 调和 | 0/1 | 射雕、神雕 | 真经上卷；古墓石刻；郭靖 | 原著名目；本文独立内功数值为原创扩展 |
| `sk_shexinglifan` | 蛇行狸翻 | 轻功 | 7 地下 | 中性 | — | 射雕、神雕 | 真经下卷；郭靖 | 原著名目；本文招式与探索特技为原创扩展 |
| `sk_baimangbianfa` | 白蟒鞭法 | 兵器/鞭索 | 7 地下 | 阴 | 0.60/0.40 | 射雕、倚天 | 梅超风；倚天藏经速成篇 | 正式名与跨书传承见 §7.4 考据项 |
| `sk_jiuyinliaoshangpian` | 九阴疗伤篇 | 杂学/医 | 6 玄上 | 中性 | — | 射雕、神雕 | 牛家村密室事件；郭靖/黄蓉 | 原著（牛家村密室七日七夜疗伤） |
| `sk_tongshihenglian` | 铜尸横练 | 内功 | 6 玄上 | 阳 | 0/1 | 射雕 | 黑风双煞遗物 | 原创扩展命名（"铜尸"陈玄风横练、罩门在脐为原著） |

### 7.3 天阶条目卡

#### `sk_jiuyin` 九阴真经（12 天上 · 内功 · 黄裳）

| 字段 | 值 |
|---|---|
| 出处 | 射雕、神雕、倚天（见 §7.1）；《射雕英雄传》中九阴总纲开篇句的字序与版本异文（待考）。本文不把暂录文句当校勘引文，只取“天之道、损有余、补不足”之意命名原创运功招式 |
| origin / lineage | `canon` / 黄裳 → 周伯通、郭靖、黄蓉 →（古墓石刻）→（倚天剑）周芷若 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1（损有余覆写 0.20/0.80）· 5 |
| inner | `contribution {mpMaxPct 58, hpMaxPct 34, attrs {wis 8, agi 6, con 6, wil 4}, mpRegen 3.2, stats {resSeal 10, resMind 10}}`（IP = 58+34+2×(8+6+6+4)+5×3.2 = **156**，预算 156）；`auxUsableMoves [mv_jiuyin_jiexue]` |
| reqs | `attrs {wis 60, wil 55}`；`aptitude {apInner 55}`；`hard []`（经书/奇遇途径，受 02 §2.9 进度门槛约束） |
| 层数要点 | 1：损有余、总纲 ｜ 3：补不足、虚胜实（被动） ｜ 5：虚实相生（架势）、不足胜有余 ｜ 6：九阴解穴 ｜ **7：绝招 天之道**、解穴秘诀 ｜ 8：九阴收功、正本清源 ｜ 10：九阴大成 |
| setTags / conflicts | `[set_jiuyin_zhengzong, set_guojing_xiazhe]` / 无 |
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
| 出处 | 《九阴真经》下卷爪法正解，主旨为五指发劲、攻敌要害；黑风双煞把经义误作插入人头骨而练邪。爪法经文逐字、正法在三联/广州修订版究竟称“九阴神爪”还是“摧坚神爪”（待考，见 05 K6） |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.50/0.50 · 5 |
| reqs | `attrs {agi 50, str 45}`；`aptitude {apGrapple 55}`；`prereq [{skill: sk_jiuyin, layer: 3}]`；`morality {min 0}`；`hard [prereq, morality]` |
| layerStats | `pierce [4, 12]`、`crit [2, 8]`（合计 20） |
| 层数要点 | 1：摧坚、九阴锁、正法 ｜ 3：如穿腐土、无坚不破 ｜ 4：摧敌首脑 ｜ 5：五指发劲、要害 ｜ **7：绝招 无坚不摧** ｜ 8：擒拿要害、腐土 ｜ 10：神爪大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / `{with: sk_jiuyinbaigu, type: exclusive}`（05 §9.2） |
| special / observable | `{fusible: true, reformFrom: sk_jiuyinbaigu}`（改修：`layerReal = floor(0.6 × 原层)`，05 §9.1.2）/ `false` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷正解，与总纲同组，02 §2.9）`maxLayer 10`、`master npc_zhoubotong` `maxLayer 8`；神雕 `master npc_guojing` `maxLayer 10` |
| 图鉴文本 | 《九阴真经》下卷所载爪法正解，以五指发劲而攻敌要害；黑风双煞误读经义，练成阴毒的九阴白骨爪。本条按正法实现，未使用未经校勘的逐字引文。 |

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
| 出处 | 射雕：《九阴真经》载有摄魂心术，黄蓉以此反制彭长老对她施展的迷魂术（原著）；双方术名的版本文字见 §2.5 考据项 |
| origin / lineage | `canon` / 九阴真经 → 黄蓉 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `neutral` · 0/1 · 5 |
| reqs | `attrs {wis 60, wil 60}`；`prereq [{skill: sk_jiuyin, layer: 3}]`；`hard [prereq]`（黄蓉途径 `reqsOverride {prereq: []}`） |
| layerStats | `effHit [4, 12]`、`resMind [2, 8]`（合计 20） |
| 层数要点 | 1：摄魂、定心、摄目 ｜ 3：反照、心镜 ｜ 5：惑心、克摄心 ｜ **7：绝招 移魂大法** ｜ 8：催眠 ｜ 10：移魂大成 |
| setTags / conflicts | `set_jiuyin_zhengzong` / `{with: sk_shexinshu, type: counter}`（见摄心术条目） |
| special / observable | `{fusible: false}` / `false` |
| 获取 | 射雕 `qiyu q_02_main_9x`（真经下卷，与总纲同组）`maxLayer 10`；`master npc_huangrong` `maxLayer 8`（羁绊 ≥ 4，原创扩展） |
| 图鉴文本 | 《九阴真经》所载的摄魂心术，以目光、言语影响对手心神；黄蓉曾用它反制彭长老（原著）。控制概率与“移魂大法”技能结构为原创扩展。 |

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
| setTags / conflicts | `[]` / `{with: sk_jiuyinshenzhao, type: exclusive}` |
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
| 出处 | 射雕：黑风双煞所使阴毒掌力，中掌者外表不见伤痕而内里心脉受创（原著）；各招名与效果为原创扩展 |
| origin / lineage | `canon` / 陈玄风、梅超风 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `yin` · 0.35/0.65 · 4 |
| reqs | `attrs {str 45, con 45}`；`aptitude {apFist 50}`；`morality {max: −20}`（软，05 §7.3 邪派地阶）；`hard []` |
| layerStats | `crit [2, 7]`、`pierce [2, 8]`（合计 15） |
| 层数要点 | 1：摧心、阴劲透体、外表无伤 ｜ 3：碎脉 ｜ 4：心脉受创 ｜ 5：断魂掌 ｜ **7：绝招 摧心裂脉** ｜ 8：无痕、阴劲 ｜ 10：摧心大成 |
| setTags / conflicts | `[]` / 无 |
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
| 出处 | 《九阴真经》下卷所载大伏魔拳（原著名目）；本文不绑定未经核实的具体交手，各招名与效果为原创扩展 |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.60/0.40 · 4 |
| reqs | `attrs {str 50, con 45}`；`aptitude {apFist 50}`；`prereq [{skill: sk_jiuyin, layer: 3}]`；`morality {min 10}`；`hard [prereq, morality]` |
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
| 出处 | 《九阴真经》所载易筋锻骨之法，郭靖依经修习（原著名目）；本文将其独立成内功，黄蓉可作为同经传承者授予。与少林《易筋经》（`sk_yijinjing`）名近而实异，内功数值为原创扩展 |
| origin / lineage | `canonExpanded` / 九阴真经 → 郭靖、黄蓉 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature · wOut/wIn · moveSlots | `harmony`（自动桥接）· 0/1 · 4 |
| inner | `contribution {mpMaxPct 24, hpMaxPct 22, attrs {con 7, agi 5, str 3}, mpRegen 1.6, stats {resInjury 10, tough 5}}`（IP = 24+22+2×(7+5+3)+5×1.6 = **84**，预算 83 ±5%） |
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
| 出处 | 《九阴真经》所载近身腾挪之术“蛇行狸翻”（原著名目）；本文各招名与探索特技为原创扩展 |
| origin / lineage | `canon` / 九阴真经 → 郭靖 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature / moveSlots | `neutral` / 4；轻功值 `QS(7) = 92`（03 §4.5） |
| reqs | `attrs {agi 45}`；`aptitude {apLight 40}`；`prereq [{skill: sk_jiuyin, layer: 2}]`；`hard [prereq]` |
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
| 出处 | 射雕：梅超风双目失明后以长鞭与九阴白骨爪相济，听风辨位；倚天：周芷若亦曾使长鞭。两书是否把该鞭法正式称为“白蟒鞭法”、以及周芷若所得是否明确同源（待考）。招名与效果为原创扩展 |
| origin / lineage | `canonExpanded` / 梅超风；周芷若（倚天） |
| sourceChapters | `ch02_shediao` `ch04_yitian` |
| nature · wOut/wIn · moveSlots | `yin` · 0.60/0.40 · 4 |
| weaponReq | `{category: whip}` |
| reqs | `attrs {agi 40, str 35}`；`aptitude {apWhip 40}`；`hard []` |
| layerStats | `hit [2, 8]`、`parry [1, 7]`（合计 15） |
| 层数要点 | 1：白蟒出洞、长鞭卷地、听风 ｜ 3：缠身 ｜ 5：回鞭、蟒缠 ｜ **7：绝招 白蟒翻江** ｜ 8：鞭爪相济 ｜ 10：白蟒大成 |
| setTags / conflicts | `[]` / `{with: sk_jiuyinbaigu, type: synergy}`（见"鞭爪相济"） |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_meichaofeng` `maxLayer 10`；倚天 `manual it_miji_baimangbianfa_su`（藏经速成篇，原创扩展推定）`maxLayer 8`；`observe` 6 |
| 图鉴文本 | 梅超风所使长鞭功夫，与九阴白骨爪相济，远则鞭缠、近则爪取；倚天周芷若亦有长鞭表现。正式鞭法名与同源关系见本卡“出处”的考据项，招名与效果为原创扩展。 |

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 白蟒出洞 `mv_baimangbianfa_chudong` | 1 | 单体 · 1–3 · 近身 | 1.00 | 7%/0/1000 | — | 可 | 1.00 |
| 长鞭卷地 `mv_baimangbianfa_juandi` | 1 | `aoe_sweep` | 0.80 | 7%/1/1000 | `bf_panshan` 50% | 可 | 0.75×1.12−0.05 |
| 缠身 `mv_baimangbianfa_chanshen` | 3 | 单体 · 1–3 | 1.15 | 8%/2/1000 | `bf_chanrao` 60% 2 | 可 | 1.29−0.25×0.60 = 1.14 |
| 回鞭 `mv_baimangbianfa_huibian` | 5 | `aoe_pull n2` · 1–3 | 1.15 | 8%/2/1000 | 拉拽 2 | 可 | 0.95×1.29−0.10 |
| **白蟒翻江** `mv_baimangbianfa_fanjiang`（绝招，原创扩展命名） | 7 | `aoe_line n4` · 1–4 | 2.15 | 9%/—/1200 | `bf_chanrao` 50% 1 | 可 | 3.00×0.75−0.125 |
| 鞭爪相济 `mv_baimangbianfa_bianzhao` | 8 | 单体 · 1–3；`condition {equipped: sk_jiuyinbaigu}` | 1.40 | 8%/2/1000 | `bf_liuxue` 50% | 可 | (1+0.24+0.05+0.15)−0.05 |

| 被动 ID | 名称 | 重 | 类 | 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|---|
| `ps_baimangbianfa_tingfeng` | 听风 | 1 | trigger | — | — | `battleStart`：自身获得 `bf_tingfeng`（`dur 99`，品阶 inherit）——梅超风目盲后听风辨位（原著） |
| `ps_baimangbianfa_manchan` | 蟒缠 | 5 | stat | Z3 | 0.10 | 对带 `cc.bind`（缠绕）的目标，本武学 +10% |
| `ps_baimangbianfa_dacheng` | 白蟒大成 | 10 | trigger | — | — | 本武学缠绕的目标被本方其他单位命中时（每回合 1 次），自身获得 `bf_zhuiji` 1 回合 |

### 7.5 玄阶紧凑卡

**`sk_jiuyinliaoshangpian` 九阴疗伤篇**（6 玄上 · 杂学/医 · 中性 · 栏 3）｜原著：郭靖受伤后与黄蓉在牛家村密室依《九阴真经》疗伤；需核对《射雕英雄传》中闭关起止、七日七夜的准确日数及禁忌条件（待考）｜reqs：`attrs {wis 40, wil 35}`、`prereq [{skill: sk_jiuyin, layer: 1}]`（硬：prereq）｜强度技艺 `med`（C17 仅迁移既有明确数值，本文不臆造门槛）｜layerStats：`healPower [2,6]`、`resInjury [1,4]`｜setTags：`set_jiuyin_zhengzong`｜获取：射雕 `qiyu q_02_main_9x`（牛家村密室事件）`maxLayer 10`；神雕 `master npc_guojing` / `npc_huangrong` `maxLayer 8`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 导气疗伤 `mv_jiuyinliaoshangpian_daoqi` | 1 | 单体友方·0–1 | 0 | 7%/2/1000 | 回复 18% `hpMax`；驱散 `injury` 1 个 | — | 标准治疗 |
| 掌心相抵 `mv_jiuyinliaoshangpian_xiangdi` | 4 | 单体友方·1 | 0 | 8%/3/1000 | 目标 `bf_huichun` 3、`bf_huoluo` 2 | — | 支援 |
| 闭气护脉 `mv_jiuyinliaoshangpian_biqi` | 7 | 单体友方·0–1 | 0 | 7%/3/1000 | 目标 `bf_guben` 3；驱散 `poison` 1 个 | — | 支援 |

被动：`ps_jiuyinliaoshangpian_qiri` 七日七夜（1，mechanic：战斗外疗伤时内伤、骨伤、走火 2 级的治愈天数 −50%；有羁绊 ≥ 2 的同伴相助再 −25%，design/11 接口）；`ps_jiuyinliaoshangpian_dacheng` 疗伤大成（10，mechanic：导气疗伤额外施加 `bf_mian_shang` 1 回合——06 已登记"九阴真经·疗伤篇大成"为其来源）。

**`sk_tongshihenglian` 铜尸横练**（6 玄上 · 内功 · `nature: yang` · 0/1 · 栏 3）｜**（原创扩展命名）**陈玄风号“铜尸”，周身坚硬、罩门在脐，郭靖幼时以匕首刺中其罩门（射雕，原著）｜reqs：`attrs {con 35, str 30}`、`morality {max: −10}`（软）｜contribution：`mpMaxPct 14, hpMaxPct 15, attrs {con 10}, mpRegen 1.6, stats {defOut 6, tough 4}`（IP = 14+15+2×10+5×1.6 = **57**）｜setTags：`[]`｜获取：射雕 `manual it_miji_tongshihenglian`（黑风双煞遗物）`maxLayer 10`；`pages`（4 页）

| 招式 | 重 | 范围 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铜皮 `mv_tongshihenglian_tongpi` | 3 | 自身 | 0 | 6%/3/900 | 自身 `bf_waifang_sheng` 3 | — | 支援 |
| 硬桥硬马 `mv_tongshihenglian_yingqiao` | 6 | 自身 | 0 | 7%/3/900 | 自身 `bf_wenzhong` 2、`bf_fanzhen` 2 | — | 支援 |

被动：`ps_tongshihenglian_tongshi` 铜尸（1，mechanic：主运时获得伴生的 `bf_zhaomen`（罩门，06 §8.9），同时受到外功伤害 −[5%, 12%]（Z4，`auxMode scaled`））；`ps_tongshihenglian_dacheng` 铜尸大成（10，mechanic：罩门被击中时的 Z3 +50% 降为 +25%）。

### 7.6 AR-01 新增玄阶紧凑卡（3 门）

> 三门均为对《九阴真经》“百家兼收”玩法的**（原创扩展）**篇目，不冒充原著篇名；只沿射雕、神雕真经事件链投放。

#### `sk_jiuyintiaoxipian` 九阴调息篇（5 玄中 · 内功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:九阴真经`；`nature:harmony`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:30,wil:28},aptitude:{apInner:28},prereq:[{skill:sk_jiuyin,layer:1}],hard:[prereq]}`；`inner.contribution:{mpMaxPct:17,hpMaxPct:10,attrs:{con:3,wil:2,wis:2},mpRegen:1.5,stats:{resInjury:5,resMind:5}}`，`IP=17+10+2×7+5×1.5=48.5`；`inner.meridians:[mer_renmai,mer_chongmai]`；`setTags:[set_jiuyin_zhengzong]`。

- 招式：调息归元 `mv_jiuyintiaoxipian_guiyuan`（L2，自身，6%/3，`bf_tiaoxi`3）；守一 `mv_jiuyintiaoxipian_shouyi`（L6，自身，7%/4，`bf_ningshen`2、`bf_jiangu`1）；均 `power:0`。
- 被动：绵息 `ps_jiuyintiaoxipian_mianxi`（内力恢复 +4%→10%）；归经 `ps_jiuyintiaoxipian_guijing`（走火持续 −1，最低1）。获取：真经总纲解读事件；郭靖或黄蓉羁绊。

#### `sk_shoujinpian` 收筋篇（6 玄上 · 拳脚/擒拿）——核算抽样

**字段**｜`origin:expanded`；`sect:null`；`lineage:九阴真经`；`nature:yin`；`wOut/wIn:0.45/0.55`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{agi:35,wis:35},aptitude:{apGrapple:32},prereq:[{skill:sk_jiuyin,layer:2}],hard:[prereq]}`；`layerStats:{seal:[2,6],hit:[1,4]}`；`setTags:[set_jiuyin_zhengzong]`；**（原创扩展）**。

- 招式：收腕 `mv_shoujinpian_shouwan`（L1，单体，**1.05**，6%/1，`bf_fengjingmai`30%；`1×1.12−.20×.30=1.06≈1.05`）；牵筋 `mv_shoujinpian_qianjin`（L3，单体，**1.10**，7%/2/900，拉拽1；`1×1.29−.10−.07=1.12≈1.10`，其中收招 900 扣 `.07`）；锁脉 `mv_shoujinpian_suomai`（L6，单体不可招架，**1.05**，8%/2，`bf_fengjingmai`40%；`1×1.34×.85−.20×.40=1.059≈1.05`）。
- 被动：识筋 `ps_shoujinpian_shijin`（对带 `seal` 标签目标 Z3 +4%→10%）；收放 `ps_shoujinpian_shoufang`（成功封经后自身获 `bf_youshi`1）。获取：真经下卷残页；郭靖羁绊。

#### `sk_biguqipian` 辟谷气篇（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:九阴真经`；`nature:harmony`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:35,wil:35},aptitude:{apInner:32},prereq:[{skill:sk_jiuyintiaoxipian,layer:6}],hard:[prereq]}`；`inner.contribution:{mpMaxPct:20,hpMaxPct:12,attrs:{con:3,wil:3,wis:2},mpRegen:1.8,stats:{resCold:5,resPoison:5}}`，`IP=20+12+2×8+5×1.8=57`；`inner.meridians:[mer_renmai,mer_yinwei]`；`setTags:[set_jiuyin_zhengzong]`。

- 招式：闭谷 `mv_biguqipian_bigu`（L2，自身，6%/4，`bf_bigu`3）；龟息 `mv_biguqipian_guixi`（L6，自身，8%/4，`bf_ningshen`2、`bf_huinei`2）；均 `power:0`。
- 被动：耐饥 `ps_biguqipian_naiji`（食物消耗 −8%→20%）；绵长 `ps_biguqipian_mianchang`（主运时内力低于30%获 `bf_tiaoxi`1，每战一次）。获取：真经上卷旁注；神雕古墓石刻仅 `maxLayer:6`。

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
| 出处 | 射雕：铁掌帮镇帮绝学，裘千仞凭铁掌与轻功号“铁掌水上飘”；黄蓉中其掌后身受重伤，须一灯以一阳指救治（原著）。各招名与效果为原创扩展 |
| origin / lineage | `canon` / 上官剑南 → 裘千仞 |
| sourceChapters | `ch02_shediao` |
| nature · wOut/wIn · moveSlots | `yang` · 0.55/0.45 · 5 |
| reqs | `attrs {str 55, con 50}`；`aptitude {apFist 55}`；`prereq [{skill: sk_tiezhangxinfa, layer: 5}]`；`sect {id: sect_tiezhangbang, rank: 4}`；`hard [sect, prereq]` |
| layerStats | `crit [4, 12]`、`pierce [2, 8]`（合计 20） |
| 层数要点 | 1：铁掌开山、排云推月、铁掌 ｜ 2：掌断金石 ｜ 3：掌力雄浑 ｜ 4：铁掌震岳 ｜ 5：掌劲透骨、掌伤 ｜ **7：绝招 铁掌擎天** ｜ 8：铁掌护身、刚猛 ｜ 9：铁掌连环 ｜ 10：铁掌大成 |
| setTags / conflicts | `[]` / 无 |
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
| 出处 | 射雕：裘千仞以轻功与铁掌并称“铁掌水上飘”；其兄裘千丈冒名，借预置水下木桩骗人（原著）。《神雕侠侣》中法号慈恩的裘千仞是否再次明确展示踏水轻功（待考）。招式效果为原创设计 |
| origin / lineage | `canon` / 裘千仞 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` |
| nature / moveSlots | `neutral` / 4；轻功值 `QS(9) = 120`——射雕/神雕最高原生轻功（地上）候选，满足 03 D-03 / 05 §14.6 第 7 条的假设 |
| reqs | `attrs {agi 50}`；`aptitude {apLight 45}`；`sect {id: sect_tiezhangbang, rank: 4}`；`hard [sect]` |
| layerStats | `eva [2, 8]`、`tough [1, 7]`（合计 15） |
| 层数要点 | 1：踏浪、踏水 ｜ 3：浪里穿行 ｜ 4：身轻 ｜ 5：水上飘身 ｜ 6：真假水上飘 ｜ **7：绝招 踏水无痕** ｜ 8：借力回旋 ｜ 10：水上飘大成 |
| setTags / conflicts | `[]` / 无 |
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

**`sk_tiezhangxinfa` 铁掌心法**（5 玄中 · 内功 · `nature: yang` · 0/1 · 栏 3）｜**（原创扩展）**铁掌帮练掌前的运劲心法｜reqs：`attrs {str 30, con 30}`、`aptitude {apInner 25}`、`prereq [{skill: sk_heishazhang, layer: 4}]`、`sect {id: sect_tiezhangbang, rank: 2}`（硬：sect、prereq）｜contribution：`mpMaxPct 18, hpMaxPct 10, attrs {str 7}, mpRegen 1.4, stats {resInjury 5, resCC 5}`（IP = 18+10+2×7+5×1.4 = **49**）｜setTags：`[]`｜获取：射雕 `master`（铁掌帮长老）`maxLayer 10`；神雕 `manual it_miji_tiezhangxinfa` `maxLayer 8`

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

**`sk_heishazhang` 黑砂掌**（2 黄中 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**铁掌帮入门掌法（与少林铁砂掌 `sk_tieshazhang` 无涉）｜reqs：无（入帮）｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`[]`｜获取：铁掌帮入帮；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 黑砂掌 `mv_heishazhang_zhang` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 砂掌连击 `mv_heishazhang_lianji` | 4 | 单体·1（2 段） | 1.10 | 5%/1/1000 | — | 可 | 1.12 |
| 掌印 `mv_heishazhang_zhangyin` | 7 | 单体·1 | 1.25 | 6%/2/1000 | `bf_neishang` 30% | 可 | 1.29−0.03 |

被动：`ps_heishazhang_shazhang` 砂掌（5，stat Z2：无视外功防御 [2%, 4%]）；`ps_heishazhang_yuanman` 圆满（10，mechanic：首次练满 `apFist` +1；铁掌功资质软门槛 −10）。

### 8.6 AR-01 新增玄阶紧凑卡（3 门）

> 本节均为铁掌帮山寨训练体系的**（原创扩展）**，不借“铁掌”之名声称原著存在同名谱册。

#### `sk_tiezhangtunajue` 铁掌吐纳诀（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:sect_tiezhangbang`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:25,str:22},sect:{id:sect_tiezhangbang,rank:1},hard:[sect]}`；`inner.contribution:{mpMaxPct:14,hpMaxPct:8,attrs:{con:3,str:3},mpRegen:1.5,stats:{resInjury:5,defOut:5}}`，`IP=14+8+2×6+5×1.5=41.5`；`inner.meridians:[mer_dumai]`；`setTags:[]`。

- 招式：温掌 `mv_tiezhangtunajue_wenzhang`（L1，自身，5%/3，`bf_renjin`2）；护臂 `mv_tiezhangtunajue_hubi`（L4，自身，6%/3，`bf_tiebi`2）；均 `power:0`。
- 被动：练砂 `ps_tiezhangtunajue_liansha`（拳掌修炼 +5%→12%）；山寨根基 `ps_tiezhangtunajue_genji`（山地探索体力 −5%）。获取：铁掌帮 L1；神雕慈恩传承仅 `maxLayer:6`。

#### `sk_tiesuobu` 铁索步（5 玄中 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_tiezhangbang`；`nature:neutral`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`Q_skill=QS(5)=65`；`reqs:{attrs:{agi:30,con:28},aptitude:{apLight:28},prereq:[{skill:sk_shanlubu,layer:4}],sect:{id:sect_tiezhangbang,rank:2},hard:[sect,prereq]}`；`layerStats:{eva:[1,5],tough:[1,5]}`；`setTags:[]`。

- 招式：踏索 `mv_tiesuobu_tasuo`（L1，自身移2格，5%/2）；折返 `mv_tiesuobu_zhefan`（L4，后撤2格并获 `bf_wenzhong`1，6%/3）；均 `power:0`。
- 被动：险径 `ps_tiesuobu_xianjing`（桥索地形移动耗力 −10%→25%）；稳足 `ps_tiesuobu_wenzu`（被击退距离 −1）。获取：铁掌帮 L2；铁掌峰索道事件。

#### `sk_duanfengzhang` 断峰掌（6 玄上 · 拳脚/拳掌）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_tiezhangbang`；`nature:yang`；`wOut/wIn:0.65/0.35`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{str:36,con:32},aptitude:{apFist:34},prereq:[{skill:sk_heishazhang,layer:6}],sect:{id:sect_tiezhangbang,rank:3},hard:[sect,prereq]}`；`layerStats:{crit:[2,6],tough:[1,4]}`；`setTags:[]`。

- 招式：劈岩 `mv_duanfengzhang_piyan`（L1，单体，**1.10**，6%/1；`1×1.12=1.12≈1.10`）；断梁 `mv_duanfengzhang_duanliang`（L3，线2，**1.10**，7%/2；`.85×1.29=1.0965≈1.10`）；震峰 `mv_duanfengzhang_zhenfeng`（L6，锥2，**0.95**，8%/2，击退1；`.75×1.34−.05=.955≈.95`）。
- 被动：刚掌 `ps_duanfengzhang_gangzhang`（本武学 Z2 穿透 +4%→10%）；断势 `ps_duanfengzhang_duanshi`（击退后目标获 `bf_shiheng`，每回合一次）。获取：铁掌帮 L3；神雕慈恩羁绊 `maxLayer:8`。

### 8.7 黄阶总表（6 门；含既有 2 门索引、新增 4 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_heishazhang` | 黑砂掌（2 黄中） | 铁掌帮 | 拳脚/拳掌 | 射雕 | 单体 1.00、内伤30%；`[]` | 无；入帮 | **（原创扩展）**；详细卡见 §8.5 |
| `sk_tiezhangzhuang` | 铁掌桩（2 黄中） | 铁掌帮 | 内功 | 射雕、神雕 | `nature:yang`；`IP=8+5+2×3+5×1=24`；`mer_dumai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_bangzhongduandao` | 帮中短刀（2 黄中） | 铁掌帮 | 兵器/刀 | 射雕 | 单体 1.10；`[]` | 无；L1 | **（原创扩展）** |
| `sk_tiebishou` | 铁臂手（2 黄中） | 铁掌帮 | 拳脚/擒拿 | 射雕 | 单体 1.05、封经20%；`[]` | 铁掌桩 3 重 | **（原创扩展）** |
| `sk_tiezhangdaofa` | 铁掌刀法（3 黄上） | 铁掌帮 | 兵器/刀 | 射雕 | 连刀 1.30、横扫 .90 | 无；入帮 | **（原创扩展）**；详细卡见 §8.5 |
| `sk_shanlubu` | 山路步（3 黄上） | 铁掌帮 | 轻功 | 射雕、神雕 | `QS(3)=45`，陡坡稳足；`[]` | 无；L1 | **（原创扩展）** |

**黄阶整体预算核对**：帮中短刀用单体 cd1 `1.12≈1.10`；铁臂手按单体 cd1 扣封经 `.20×.20=.04` 得 `1.08≈1.05`。山路步用 `QS(3)=45`，铁掌桩精确命中黄中 IP 24；所有 `layerStats≤6`。

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
| `sk_tingshengzhangfa` | 听声杖法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.75/0.25 | 射雕、神雕 | 柯镇恶 | **（原创扩展命名）**柯镇恶目盲、以铁杖为兵器为原著；按 `rulings-v1` §2 避开少林 `sk_fumozhangfa` 的“伏魔杖法”名 |
| `sk_fenjincuogushou` | 分筋错骨手 | 拳脚/擒拿 | 5 玄中 | 阳 | 0.75/0.25 | 射雕、神雕 | 朱聪；神雕郭靖 | 原著（朱聪授郭靖） |
| `sk_yuenvjian02` | 越女剑法（韩小莹） | 兵器/剑 | 4 玄下 | 中性 | 0.80/0.20 | 射雕 | 韩小莹 | 原著；与序章 `sk_yuenvjian` 同名，依基准 §12 加书界序号 |
| `sk_jinlongbianfa` | 金龙鞭法 | 兵器/鞭索 | 4 玄下 | 阳 | 0.80/0.20 | 射雕 | 韩宝驹 | 原著（韩宝驹的金龙鞭法） |
| `sk_duling` | 毒菱 | 暗器 | 4 玄下 | 中性 | 0.80/0.20 | 射雕、神雕 | 柯镇恶 | 原著（柯镇恶的毒菱） |
| `sk_nanshanzhangfa` | 南山掌法 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.85/0.15 | 射雕 | 南希仁 | 原著（南希仁所授掌法） |
| `sk_chengchuidafa` | 秤锤打法 | 兵器/奇门 | 2 黄中 | 阳 | 0.85/0.15 | 射雕 | 全金发 | **（原创扩展命名）**据全金发以大秤为兵器构造 |

**`sk_tingshengzhangfa` 听声杖法**（5 玄中 · 棍杖 · 栏 3）｜配柯镇恶铁杖 `eq_kezhenezhang`（design/10）｜reqs：`attrs {str 30, wil 25}`、`aptitude {apStaff 25}`、`prereq [{skill: sk_chengchuidafa, layer: 4}]`、`sect {id: sect_jiangnanqiguai, rank: 2}`（硬：sect；prereq 为软——七怪互授，原创扩展）｜layerStats：`parry [1,5]`、`hit [1,5]`｜setTags：`[]`｜获取：射雕/神雕 `master npc_kezhene` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 铁杖击 `mv_tingshengzhangfa_zhangji` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 铁杖横扫 `mv_tingshengzhangfa_hengsao` | 3 | `aoe_sweep` | 0.90 | 7%/1/1000 | — | 可 | 0.75×1.17 |
| 盲杖辨位 `mv_tingshengzhangfa_tingsheng` | 5 | 自身架势 | 0 | 6%/2/850 | `stanceCounter {counterPower 1.0, expires: nextOwnAction}` | — | 架势招式 |
| 铁杖镇魔 `mv_tingshengzhangfa_zhenmo` | 7 | 单体·1–2 | 1.25 | 7%/2/1000 | `bf_xuanyun` 20% 1 | 可 | 1.29−0.05 |

被动：`ps_tingshengzhangfa_tingfeng` 听风辨器（1，trigger `battleStart`：自身 `bf_tingfeng`〔`dur 99`〕——柯镇恶目盲而以耳代目，原著）；`ps_tingshengzhangfa_gangzhi` 刚直（5，stat：`resMind` +[4, 8] pp）；`ps_tingshengzhangfa_dacheng` 大成（10，stat Z3：对带 `veil` 标签效果（隐身/残影）的目标 +10%）。

**`sk_fenjincuogushou` 分筋错骨手**（5 玄中 · 擒拿 · 栏 3）｜reqs：`attrs {agi 25, wis 25}`、`aptitude {apGrapple 25}`、`prereq [{skill: sk_nanshanzhangfa, layer: 4}]`（软）、`sect {id: sect_jiangnanqiguai, rank: 2}`（硬）｜layerStats：`seal [1,5]`、`crit [1,5]`｜setTags：`[]`｜获取：射雕 `master npc_zhucong` `maxLayer 10`；神雕 `master npc_guojing` `maxLayer 8`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 分筋 `mv_fenjincuogushou_fenjin` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengjingmai` 30% 1 | 可 | 1.12−0.06 |
| 错骨 `mv_fenjincuogushou_cuogu` | 3 | 单体·1 | 1.25 | 7%/2/1000 | `bf_gushang` 40% | 可 | 1.29−0.04 |
| 反关节 `mv_fenjincuogushou_fanguan` | 5 | 单体·1 | 1.05 | 6%/1/1000 | `bf_jiaoxie` 30%（targetArmed） | 可 | 1.12−0.06 |
| 卸骨 `mv_fenjincuogushou_xiegu` | 7 | 单体·1 | 1.25 | 7%/3/1000 | `bf_waigong_jiang` 100%；`bf_dingshen` 30% 1 | 可 | 1.41−0.10−0.075 |

被动：`ps_fenjincuogushou_rujie` 入节（1，stat：`seal` +[2, 5]）；`ps_fenjincuogushou_miaoshou` 妙手空空（5，mechanic：缴械成功时 30% 将目标兵器收入行囊（战后归还或缴获，design/10）——致敬朱聪，原创扩展）；`ps_fenjincuogushou_dacheng` 大成（10，stat Z3：对带 `bf_gushang` 的目标 +10%）。

**`sk_yuenvjian02` 越女剑法（韩小莹）**（4 玄下 · 剑 · 栏 3）｜reqs：`attrs {agi 30}`、`aptitude {apSword 25}`、`sect {id: sect_jiangnanqiguai, rank: 1}`（硬）｜layerStats：`hit [1,5]`、`eva [1,5]`｜setTags：`[]`｜获取：射雕 `master npc_hanxiaoying` `maxLayer 10`；`observe` 6｜说明：序章阿青教学版 `sk_yuenvjian` 已定地上 9，离开序章强制化残篇；本条仍为玄下 4，两 ID 分立（基准 V11-29、作者决定 P35）。二者“剑源余韵”联系为**（原创扩展）**解读

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 越女穿林 `mv_yuenvjian02_chuanlin` | 1 | 单体·1 | 0.90 | 5%/0/900 | — | 可 | 1−0.05−0.07 |
| 快剑连刺 `mv_yuenvjian02_lianci` | 3 | 单体·1（3 段） | 1.30 | 7%/2/1000 | — | 可 | 1.29 |
| 回身刺 `mv_yuenvjian02_huishen` | 5 | `aoe_behind`·1–2 | 0.95 | 6%/2/1000 | 绕背 | 可 | 0.90×1.24−0.15 |
| 剑影飘香 `mv_yuenvjian02_piaoxiang` | 7 | `aoe_sweep` | 0.85 | 6%/1/1000 | — | 可 | 0.75×1.12 |

被动：`ps_yuenvjian02_kuaijian` 快剑（1，stat：`combo` +[2, 5] pp）；`ps_yuenvjian02_jianyuan` 剑源余韵（5，mechanic：拥有 `sk_yuenvjian` 残篇时，本武学修炼 +20%、招式收招 −50，02 §5.4"剑源"的延伸，原创扩展）；`ps_yuenvjian02_dacheng` 大成（10，stat Z0：本武学暴击 +5）。

**`sk_jinlongbianfa` 金龙鞭法**（4 玄下 · 鞭索 · 栏 3）｜reqs：`attrs {agi 25, str 25}`、`aptitude {apWhip 25}`、`sect {id: sect_jiangnanqiguai, rank: 1}`（硬）｜layerStats：`hit [1,5]`、`parry [1,5]`｜setTags：`[]`｜获取：射雕 `master npc_hanbaoju` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 金龙出海 `mv_jinlongbianfa_chuhai` | 1 | 单体·1–3 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 卷鞭 `mv_jinlongbianfa_juan` | 3 | `aoe_pull n1`·1–3 | 0.95 | 6%/1/1000 | 拉拽 1 | 可 | 0.95×1.12−0.10 |
| 马上鞭 `mv_jinlongbianfa_mashang` | 5 | `aoe_dash n3, through`·1–3 | 0.95 | 7%/2/1000 | 突进（穿过） | 可 | 0.80×1.29−0.10 |
| 金龙缠腰 `mv_jinlongbianfa_chanyao` | 7 | 单体·1–3 | 1.30 | 7%/3/1000 | `bf_chanrao` 50% 1 | 可 | 1.41−0.125 |

被动：`ps_jinlongbianfa_mawang` 马王神（1，mechanic：探索中骑马移动速度 +10%，design/11 接口）；`ps_jinlongbianfa_changbian` 长鞭（5，stat Z3：对 3 格外目标 +6%）；`ps_jinlongbianfa_dacheng` 大成（10，stat：`hit` +5%）。

**`sk_duling` 毒菱**（4 玄下 · 暗器 · 栏 3）｜reqs：`attrs {agi 25}`、`aptitude {apHidden 25}`、`sect {id: sect_jiangnanqiguai, rank: 2}`（硬）｜弹药：淬毒铁菱（design/10）｜layerStats：`hit [1,5]`、`effHit [1,5]`｜setTags：`[]`｜获取：射雕/神雕 `master npc_kezhene` `maxLayer 10`

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 飞菱 `mv_duling_feiling` | 1 | `aoe_bolt`·1–5·投射 | 0.90 | 6%/0/1000 | `bf_zhongdu` 30% | 可 | 0.92−0.03 |
| 连环毒菱 `mv_duling_lianhuan` | 4 | `aoe_bolt`·1–5（2 段） | 1.15 | 7%/2/1000 | `bf_zhongdu` 50% | 可 | 1.29×0.92−0.05 |
| 满天菱雨 `mv_duling_lingyu` | 7 | `aoe_multi n4, r1`·1–5 | 1.15（4 段） | 7%/3/1000 | `bf_zhongdu` 40% | 可 | 0.85×1.41−0.04 |

被动：`ps_duling_cuidu` 淬毒（1，stat：本武学所附 `bf_zhongdu` 施加率 +[0, 10] pp）；`ps_duling_tingsheng` 听声发菱（5，mechanic：攻击隐身或残影持有者时命中不受其影响（仅本武学））；`ps_duling_dacheng` 大成（10，mechanic：本武学命中已中毒目标时 `bf_zhongdu` +1 层）。

**`sk_nanshanzhangfa` 南山掌法**（2 黄中 · 拳掌 · 栏 3）｜reqs：无｜layerStats：`parry [1,3]`、`hit [1,3]`｜setTags：`[]`｜获取：射雕 `master npc_nanxiren` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 樵夫担柴 `mv_nanshanzhangfa_danchai` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 南山推石 `mv_nanshanzhangfa_tuishi` | 4 | 单体·1 | 1.05 | 5%/1/1000 | 击退 1 | 可 | 1.12−0.05 |
| 沉稳三掌 `mv_nanshanzhangfa_sanzhang` | 7 | 单体·1（3 段） | 1.30 | 6%/2/1000 | — | 可 | 1.29 |

被动：`ps_nanshanzhangfa_chenwen` 沉稳（5，stat：`tough` +[2%, 4%]）；`ps_nanshanzhangfa_yuanman` 圆满（10，mechanic：首次练满 `apFist` +1）。

**`sk_chengchuidafa` 秤锤打法**（2 黄中 · 奇门 · 栏 3）｜weaponReq：`{category: exotic, kinds: [misc]}`（秤）｜reqs：无｜layerStats：`hit [1,3]`、`parry [1,3]`｜setTags：`[]`｜获取：射雕 `master npc_quanjinfa` `maxLayer 10`；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 秤锤飞击 `mv_chengchuidafa_feiji` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 秤杆点穴 `mv_chengchuidafa_dianxue` | 4 | 单体·1 | 1.10 | 5%/1/1000 | `bf_fengxue` 20% 1 | 可 | 1.12−0.04 |
| 锤杆并施 `mv_chengchuidafa_bingshi` | 7 | 单体·1（2 段） | 1.30 | 6%/2/1000 | — | 可 | 1.29 |

被动：`ps_chengchuidafa_jingsuan` 精打细算（5，stat cost：本武学耗内 −10%）；`ps_chengchuidafa_yuanman` 圆满（10，mechanic：首次练满 `apExotic` +1；交易议价 +3%，design/12 接口——闹市侠隐，原创扩展）。

### 9.3 AR-01 新增玄阶紧凑卡（3 门）

> 本节均为将七怪合斗与各自体貌转成玩法的**（原创扩展）**；不把这些名称当作原著具名武学。

#### `sk_qiguaihebushu` 七怪合步术（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_jiangnanqiguai`；`nature:neutral`；`wOut/wIn:0.65/0.35`；`sourceChapters:[ch02_shediao]`；`Q_skill=QS(4)=56`；`reqs:{attrs:{agi:25},aptitude:{apLight:22},sect:{id:sect_jiangnanqiguai,rank:1},hard:[sect]}`；`layerStats:{eva:[1,5],tough:[1,5]}`；`setTags:[]`。

- 招式：错肩 `mv_qiguaihebushu_cuojian`（L1，与相邻友方换位，5%/2，`power:0`）；补位 `mv_qiguaihebushu_buwei`（L4，移至友方相邻空格并获 `bf_yuanhu`1，6%/3，`power:0`）。
- 被动：七位 `ps_qiguaihebushu_qiwei`（每名相邻友方 eva +2，上限8）；合斗 `ps_qiguaihebushu_hedou`（相邻友方受击后下一步移动耗力 −10%）。获取：七怪任意三人共同传授；神雕柯镇恶仅 `maxLayer:6`。

#### `sk_lingyangbu` 羚羊步（5 玄中 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_jiangnanqiguai`；`nature:neutral`；`wOut/wIn:0.75/0.25`；`sourceChapters:[ch02_shediao]`；`Q_skill=QS(5)=65`；`reqs:{attrs:{agi:30},aptitude:{apLight:28},prereq:[{skill:sk_qiguaihebushu,layer:4}],sect:{id:sect_jiangnanqiguai,rank:2},hard:[sect,prereq]}`；`layerStats:{eva:[1,6],spd:[1,4]}`；`setTags:[]`。

- 招式：跃沟 `mv_lingyangbu_yuegou`（L1，自身移3格，5%/3，`power:0`）；折角 `mv_lingyangbu_zhejiao`（L4，移至敌侧后空格，6%/3，`power:0`）。
- 被动：山行 `ps_lingyangbu_shanxing`（坡地移动耗力 −8%→20%）；灵足 `ps_lingyangbu_lingzu`（移动 ≥3 格后 eva +4→10）。获取：七怪 L2；以韩宝驹“马王神”与大漠训练形象扩展。

#### `sk_tiebifangshen` 铁臂防身（6 玄上 · 内功）

**字段**｜`origin:expanded`；`sect:sect_jiangnanqiguai`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao]`；`reqs:{attrs:{con:35,str:32},aptitude:{apInner:32},prereq:[{skill:sk_xiaomituozhuang,layer:4}],sect:{id:sect_jiangnanqiguai,rank:3},hard:[sect,prereq]}`；`inner.contribution:{mpMaxPct:20,hpMaxPct:12,attrs:{con:5,str:3},mpRegen:1.8,stats:{defOut:5,resInjury:5}}`，`IP=20+12+2×8+5×1.8=57`；`inner.meridians:[mer_dumai,mer_shouyangming]`；`setTags:[]`。

- 招式：架臂 `mv_tiebifangshen_jiabi`（L2，自身，6%/3，`bf_tiebi`2）；舍身 `mv_tiebifangshen_sheshen`（L6，自身，7%/4，`bf_yuanhu`2、`bf_jiangu`1）；均 `power:0`。
- 被动：笑弥陀 `ps_tiebifangshen_xiaomituo`（外功减伤 +4%→10%）；护徒 `ps_tiebifangshen_hutu`（相邻友方低血时自身 tough +5）。获取：张阿生传授窗口；神雕柯镇恶整理遗法 `maxLayer:6`。

### 9.4 黄阶总表（8 门；含既有 2 门索引、新增 6 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_nanshanzhangfa` | 南山掌法（2 黄中） | 江南七怪 / 南希仁 | 拳脚/拳掌 | 射雕 | 单体 1.00、击退；`[]` | 无 | 原著；详细卡见 §9.2 |
| `sk_chengchuidafa` | 秤锤打法（2 黄中） | 江南七怪 / 全金发 | 兵器/奇门 | 射雕 | 单体 1.00、点穴20%；`[]` | 无 | **（原创扩展命名）**；详细卡见 §9.2 |
| `sk_shizhangrumen` | 铁杖入门（2 黄中） | 江南七怪 / 柯镇恶 | 兵器/棍杖 | 射雕、神雕 | 单体 1.10，听声杖法前置；`[]` | 无；L1 | 柯镇恶持铁杖为原著；套路**（原创扩展）** |
| `sk_duanbianrumen` | 短鞭入门（2 黄中） | 江南七怪 / 韩宝驹 | 兵器/鞭索 | 射雕 | 单体 1.05，拉拽式 1.00；`[]` | 无；L1 | 韩宝驹持金龙鞭为原著；套路**（原创扩展）** |
| `sk_miaoshoubianji` | 妙手辨机（2 黄中） | 江南七怪 / 朱聪 | 杂学/书画 | 射雕 | `art:10`；拆陷阱、战斗获 `bf_dongxi`1；`[]` | 无；L1 | 朱聪“妙手书生”为原著；技能**（原创扩展）** |
| `sk_hengjiangbian` | 横江鞭（3 黄上） | 江南七怪 / 韩宝驹 | 兵器/鞭索 | 射雕 | 横扫 .85、拉拽式 1.00；`[]` | 短鞭入门 4 重 | **（原创扩展）** |
| `sk_xiaoyingduanjian` | 小莹短剑（3 黄上） | 江南七怪 / 韩小莹 | 兵器/剑 | 射雕 | 单体 1.10、回身招架；`[]` | 无；L1 | 韩小莹使剑为原著；套路**（原创扩展命名）** |
| `sk_xiaomituozhuang` | 笑弥陀桩（3 黄上） | 江南七怪 / 张阿生 | 内功 | 射雕 | `nature:yang`；`IP=10+6+2×4+5×1.2=30`；`mer_dumai`；`[]` | 无；L1 | 张阿生外号与体魄为原著；心法**（原创扩展命名）** |

**黄阶整体预算核对**：铁杖、短剑单体 cd1 均为 `1.12≈1.10`；短鞭拉拽式以单体 cd1 扣 `.10` 得 `1.02≈1.00`；横江鞭横扫 cd1 为 `.75×1.12=.84≈.85`，拉拽式同前。笑弥陀桩精确命中黄上 IP 30；所有 `layerStats≤6`。

---

## 10. 杨家枪与将门（传承 · `lineage: 杨家将`）

### 10.1 简介

- **源流**：射雕开篇，临安牛家村杨铁心是抗金名将杨再兴之后，以家传枪法与丘处机过招；后化名穆易，携义女穆念慈比武招亲（原著）。原著只建立杨铁心—杨再兴的家世，不把这套枪法直接等同后世传说中的“杨家将枪法”；本文“杨家将”分组是**（原创扩展）**。岳飞遗著《武穆遗书》几经辗转：上官剑南藏于铁掌峰，郭靖得之；倚天时郭靖、黄蓉将其藏入屠龙刀中，张无忌取出后交给徐达（原著）。
- **扩展**：南宋杨妙真以梨花枪著称；《宋史·李全传》中相关评价的准确字句、明代枪书如何追述其谱系（待考）。本作不宣称她与杨再兴同族，而以**（原创扩展）**将两门枪法并入“将门”玩法组并延续到碧血军伍。六合枪同样作为跨时代军伍、镖局的原创通行枪法。
- **定位**：`sect: null`；本组唯一以"枪"为主的传承，并以《武穆遗书》承担"兵法/军阵"杂学。
- **进阶链**：六合枪（黄上）→ 杨家枪法（玄上）→ 梨花枪（地下）。

### 10.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_wumuyishu` | 武穆遗书 | 杂学/阵法（兵法） | 8 地中 | 中性 | — | 射雕、神雕、倚天 | 铁掌峰中指峰事件；郭靖襄阳线；屠龙刀藏书 | 原著 |
| `sk_lihuaqiang` | 梨花枪 | 兵器/枪 | 7 地下 | 阳 | 0.70/0.30 | 射雕、神雕、碧血 | 杨妙真（史实人物，原创扩展 NPC）；残谱；碧血明军旧部 | **（原创扩展）**据杨妙真梨花枪史料设计；史料原句与后世谱系见 §10.1 考据项 |
| `sk_yangjiaqiangfa` | 杨家枪法 | 兵器/枪 | 6 玄上 | 阳 | 0.75/0.25 | 射雕、神雕、碧血 | 杨铁心、穆念慈；杨铁心遗谱；碧血明军旧部 | 原著（射雕·杨铁心）；碧血延续为原创扩展 |
| `sk_liuheqiang` | 六合枪 | 兵器/枪 | 3 黄上 | 阳 | 0.85/0.15 | 射雕、神雕、倚天、碧血、鹿鼎、鸳鸯、书剑、飞狐 | 军营/镖局教头；残页 | 原创扩展（通行枪法） |

### 10.3 地阶条目卡

#### `sk_wumuyishu` 武穆遗书（8 地中 · 杂学/阵法 · 将门）

| 字段 | 值 |
|---|---|
| 出处 | 射雕：岳飞遗下兵法，完颜洪烈一行谋取，上官剑南将其藏于铁掌峰，终为郭靖所得；神雕中郭靖以兵法守襄阳；倚天时秘籍藏于屠龙刀中，张无忌取出后交给徐达（原著）。战斗效果为原创扩展 |
| origin / lineage | `canonExpanded` / 岳飞 → 上官剑南（藏）→ 郭靖 →（屠龙刀）→ 徐达 |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch04_yitian` |
| nature / moveSlots | `neutral` / 4 |
| reqs | `attrs {wis 55, cha 40}`；`hard []`（剧情途径；强度参考技艺 `formation`） |
| layerStats | `effHit [3, 9]`、`parry [1, 6]`（合计 15） |
| 层数要点 | 1：运筹、鱼鳞阵、兵法 ｜ 3：奇正相生 ｜ 4：阵法娴熟 ｜ 5：背嵬冲阵 ｜ **7：绝招 撼山易** ｜ 8：以逸待劳、精忠 ｜ 10：武穆大成 |
| setTags / conflicts | `[set_guojing_xiazhe]` / 无 |
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
| 出处 | **（原创扩展）**据杨妙真以梨花枪著称的史料形象设计；《宋史·李全传》中相关评价的准确字句（常见转引为“二十年梨花枪，天下无敌手”）待校勘。将火药喷筒附于枪上及“喷雪”一式均为本作玩法设定，不作史实断言 |
| origin / lineage | `expanded` / 杨妙真（南宋山东红袄军，史实人物） |
| sourceChapters | `ch02_shediao` `ch03_shendiao` `ch07_bixue`（明末袁崇焕旧部军中传习，原创扩展） |
| nature · wOut/wIn · moveSlots | `yang` · 0.70/0.30 · 4 |
| weaponReq | `{category: spear}` |
| reqs | `attrs {str 45, agi 40}`；`aptitude {apSpear 45}`；`prereq [{skill: sk_yangjiaqiangfa, layer: 5}]`；`hard [prereq]` |
| layerStats | `hit [2, 8]`、`crit [1, 7]`（合计 15） |
| 层数要点 | 1：梨花点点、直刺、一寸长一寸强 ｜ 3：梨花喷雪、火药 ｜ 5：二十年 ｜ **7：绝招 天下无敌手** ｜ 8：拒马、无敌手 ｜ 10：梨花大成 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible: true}` / `true` |
| 获取 | 射雕 `master npc_yangmiaozhen` `maxLayer 10`（山东支线，原创扩展）；神雕 `manual it_miji_lihuaqiang` `maxLayer 8`；碧血 `master npc_ming_jiaotou`（袁崇焕旧部教头，原创扩展）`maxLayer 9`；`observe` 6 |
| 图鉴文本 | **（原创扩展）**取意南宋杨妙真以梨花枪著称的史料形象；史料原句仍待校勘，火药喷筒是玩法嫁接。本作将其列入“将门”玩法组，不宣称与杨再兴同一血缘或谱系。 |

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

**`sk_yangjiaqiangfa` 杨家枪法**（6 玄上 · 枪 · 阳 · 0.75/0.25 · 栏 3）｜reqs：`attrs {str 30, agi 25}`、`aptitude {apSpear 30}`、`prereq [{skill: sk_liuheqiang, layer: 4}]`（软，杨家后人线免除）｜layerStats：`hit [1,5]`、`parry [1,5]`｜setTags：`[]`｜获取：射雕 `master npc_yangtiexin` `maxLayer 10`（牛家村/比武招亲线）、`master npc_munianci` `maxLayer 8`；神雕 `manual it_miji_yangjiaqiangfa`（杨铁心遗谱）`maxLayer 10`；碧血 `master npc_ming_jiaotou`（明军旧部，原创扩展）`maxLayer 9`；`observe` 6｜出处：杨铁心在《射雕英雄传》中施展家传枪法；“拦、拿、扎”为通用枪术语，“回马枪”在此作为**（原创扩展）**招式，不宣称为小说具名招法

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 拦 `mv_yangjiaqiangfa_lan` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | — | 可 | 1.00 |
| 拿 `mv_yangjiaqiangfa_na` | 1 | 单体·1–2 | 1.10 | 6%/1/1000 | `bf_jiaoxie` 20%（targetArmed） | 可 | 1.12−0.04 |
| 扎 `mv_yangjiaqiangfa_zha` | 3 | `aoe_pierce`·1–2 | 1.05 | 7%/1/1000 | — | 可 | 0.90×1.17 |
| 回马枪 `mv_yangjiaqiangfa_huima` | 5 | 自身架势 | 0 | 6%/2/800 | 后撤 1；`stanceCounter {counterPower 1.3, expires: nextOwnAction}` | — | 架势招式 |
| 枪挑 `mv_yangjiaqiangfa_tiao` | 7 | 单体·1–2 | 1.20 | 7%/2/1000 | 击退 2 | 可 | 1.29−0.10 |

被动：`ps_yangjiaqiangfa_jiafeng` 忠烈家风（1，stat：`resMind` +[3, 8] pp）；`ps_yangjiaqiangfa_huima` 回马（5，stat Z3：回马枪反击 +10%）；`ps_yangjiaqiangfa_dacheng` 大成（10，stat Z3：对以突进（`aoe_dash`）接近自身的敌人，本回合反击与攻击 +10%）。

**`sk_liuheqiang` 六合枪**（3 黄上 · 枪 · 阳 · 0.85/0.15 · 栏 3）｜**（原创扩展）**自宋至清军伍、镖局通行枪法，"中平枪，枪中王"为民间枪谚｜reqs：无｜layerStats：`hit [1,3]`、`parry [1,3]`｜setTags：`[]`｜获取仅限 `ch02_shediao`、`ch03_shendiao`、`ch04_yitian`、`ch07_bixue`、`ch08_luding`、`ch11_yuanyang`、`ch12_shujian`、`ch13_feihu` 的军营/镖局教头 `master`（如 `npc_generic_jiaotou`）`maxLayer 10`；`pages`（3 页）；`observe` 6

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 中平枪 `mv_liuheqiang_zhongping` | 1 | 单体·1–2 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 拦拿扎 `mv_liuheqiang_lannazha` | 4 | 单体·1–2（3 段） | 1.30 | 6%/2/1000 | — | 可 | 1+0.24+0.05 |
| 横扫 `mv_liuheqiang_hengsao` | 7 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |

被动：`ps_liuheqiang_liuhe` 六合（5，stat：`parry` +[2%, 4%]）；`ps_liuheqiang_yuanman` 圆满（10，mechanic：首次练满 `apSpear` +1；杨家枪法资质软门槛 −10）。

### 10.5 AR-01 新增玄阶紧凑卡（2 门）

> 本节是将门军伍的**（原创扩展）**补链；“杨家将”仍只是玩法分组，不扩写原著血缘。

#### `sk_jiangmenzhuang` 将门桩（4 玄下 · 内功）

**字段**｜`origin:expanded`；`sect:null`；`lineage:杨家将门军伍`；`nature:yang`；`wOut/wIn:0/1`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch07_bixue]`；`reqs:{attrs:{con:25,str:25},hard:[]}`；`inner.contribution:{mpMaxPct:14,hpMaxPct:8,attrs:{con:3,str:3},mpRegen:1.5,stats:{defOut:5,resCC:5}}`，`IP=14+8+2×6+5×1.5=41.5`；`inner.meridians:[mer_dumai]`；`setTags:[]`。

- 招式：立枪桩 `mv_jiangmenzhuang_liqiang`（L1，自身，5%/3，`bf_wenzhong`2）；振军 `mv_jiangmenzhuang_zhenjun`（L4，自身，6%/3，`bf_renjin`2）；均 `power:0`。
- 被动：军姿 `ps_jiangmenzhuang_junzi`（未移动时 tough +3→8）；耐阵 `ps_jiangmenzhuang_naizhen`（军阵战体力消耗 −5%→12%）。获取：杨铁心或明军旧部；均明确为原创扩展传授。

#### `sk_hujunqiang` 护军枪（5 玄中 · 兵器/枪）——核算抽样

**字段**｜`origin:expanded`；`sect:null`；`lineage:杨家将门军伍`；`nature:yang`；`wOut/wIn:0.80/0.20`；`weaponReq:{category:spear}`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch07_bixue]`；`reqs:{attrs:{str:30,con:28},aptitude:{apSpear:28},prereq:[{skill:sk_bubingqiang,layer:4}],hard:[prereq]}`；`layerStats:{parry:[1,6],hit:[1,4]}`；`setTags:[]`。

- 招式：拒骑 `mv_hujunqiang_juqi`（L1，线2，**0.95**，6%/1；`.85×1.12=.952≈.95`）；护阵 `mv_hujunqiang_huzhen`（L3，单体，**1.15**，7%/1；`1×(1+.12+.05)=1.17≈1.15`）；挑落 `mv_hujunqiang_tiaoluo`（L6，单体，**1.20**，7%/2，击退1；`1×1.29−.05=1.24≈1.20`）。
- 被动：长兵 `ps_hujunqiang_changbing`（距离2时 Z3 +4%→10%）；护军 `ps_hujunqiang_hujun`（相邻友方每人 parry +2，上限8）。获取：射雕郭靖军阵线；碧血明军教头。

### 10.6 黄阶总表（6 门；含既有 1 门索引、新增 5 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_bubingqiang` | 步兵枪（2 黄中） | 将门 / 军伍 | 兵器/枪 | 射雕、神雕、碧血 | 线2 .95、基础拒马；`[]` | 无 | **（原创扩展）** |
| `sk_jiangmenchangquan` | 将门长拳（2 黄中） | 将门 / 军伍 | 拳脚/拳掌 | 射雕、神雕、碧血 | 单体 1.10、稳步；`[]` | 无 | **（原创扩展）** |
| `sk_junzhubu` | 军阵步（2 黄中） | 将门 / 军伍 | 轻功 | 射雕、神雕、碧血 | `QS(2)=38`，相邻友方移动耗力降低；`[]` | 无 | **（原创扩展）** |
| `sk_lanmaqian` | 拦马钳（2 黄中） | 将门 / 军伍 | 兵器/奇门 | 射雕、神雕、碧血 | `exotic/misc`，拉拽式 1.00；`[]` | 步兵枪 3 重 | **（原创扩展）** |
| `sk_huweidao` | 护卫刀（2 黄中） | 将门 / 军伍 | 兵器/刀 | 射雕、神雕、碧血 | 单体 1.10、友军相邻时 parry +2；`[]` | 无 | **（原创扩展）** |
| `sk_liuheqiang` | 六合枪（3 黄上） | 将门 / 各地军伍镖局 | 兵器/枪 | 射雕、神雕、倚天、碧血、鹿鼎、鸳鸯、书剑、飞狐 | 单体1.00、三段1.30；`[]` | 无 | **（原创扩展）**；详细卡见 §10.4 |

**黄阶整体预算核对**：步兵枪按线2 cd1 `.85×1.12=.952≈.95`；将门长拳、护卫刀按单体 cd1 `1.12≈1.10`；拦马钳按单体 cd1 扣拉拽 `.10` 得 `1.02≈1.00`。军阵步用 `QS(2)=38`；所有 `layerStats≤6`。

---

## 11. 蒙古诸部 / 幕府 `sect_menggu`（射雕/神雕；金轮法王除外）

### 11.1 简介

- **时代**：射雕时铁木真统一蒙古、称成吉思汗，郭靖在大漠长大，从哲别学箭、与拖雷摔跤，一箭射落双雕而得金刀（原著）。神雕时蒙古攻宋，忽必烈幕府聚集金轮法王及其弟子达尔巴、霍都，另有潇湘子、尹克西、尼摩星、马光佐等西域/江湖高手（原著）；神雕末潇湘子、尹克西盗走藏有《九阳真经》的《楞伽经》（原著，九阳归明教/倚天组）。倚天为元代，元廷、汝阳王府武士（含"神箭八雄"）以骑射为长（原著）；鹿鼎中葛尔丹为蒙古（准噶尔）王子（原著），清宫"布库"摔跤源出蒙古搏克（史实），本作以此延续蒙古骑射与摔跤（原创扩展）。
- **定位**：射雕为中立的"部族身份"开局（可加入）；神雕为敌对势力（幕府高手为 Boss/精英，其武学经观摩、残谱或"敌对路线"取得）。霍都、达尔巴的师门武学（龙象般若功等）归逍遥/吐蕃组图鉴。
- **风格**：骑射、摔跤、马刀；幕府高手的奇门兵器（扇、哭丧棒；达尔巴之杵归逍遥/吐蕃组）。
- **进阶链**：蒙古弯刀（黄中）/ 蒙古摔跤（黄上）→ 蒙古骑射（玄中）→ 哲别箭术（地下）。

### 11.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_zhebiejianshu` | 哲别箭术 | 暗器（弓箭） | 7 地下 | 阳 | 0.85/0.15 | 射雕、神雕 | 哲别亲传（部族身份）；郭靖 | 原著（哲别授郭靖箭术；一箭双雕） |
| `sk_huodushanfa` | 霍都扇法 | 兵器/奇门（扇） | 6 玄上 | 阴 | 0.60/0.40 | 神雕 | 霍都（敌对路线）；观摩 | **（原创扩展命名）**霍都使折扇为原著；藏针与毒效为本作设计 |
| `sk_kusangbangfa` | 哭丧棒法 | 兵器/棍杖 | 6 玄上 | 阴 | 0.70/0.30 | 神雕 | 潇湘子（敌对路线）；观摩 | **（原创扩展命名）**潇湘子使哭丧棒、形貌如僵尸为原著；毒砂与技能效果为本作设计 |
| `sk_mengguqishe` | 蒙古骑射 | 暗器（弓箭） | 5 玄中 | 阳 | 0.85/0.15 | 射雕、神雕、鹿鼎 | 部族/军营教头；葛尔丹部残谱 | 原著（蒙古骑射）；鹿鼎延续为原创扩展 |
| `sk_menggushuaijiao` | 蒙古摔跤 | 拳脚/擒拿 | 3 黄上 | 阳 | 0.90/0.10 | 射雕、神雕、鹿鼎 | 拖雷羁绊；部族；鹿鼎布库房 | 原著（郭靖与拖雷摔跤；鹿鼎布库）；传承关联为原创扩展 |
| `sk_mengguwandao` | 蒙古弯刀 | 兵器/刀 | 2 黄中 | 阳 | 0.90/0.10 | 射雕、神雕、鹿鼎 | 部族/军营 | 原创扩展 |

> 按 C16，弓箭武学固定为 `category:hidden, subType:hidden`，使用 `apHidden`、占暗器栏并消耗箭类弹药；弓具的持用条件另见 `design/10`。它们是不可跨书眠携带的非核心武学，不再保留 `bow` 兵器分类提案。
>
> 达尔巴金杵的武学由逍遥/吐蕃组定义为 `sk_jingangxiangmochu`（金刚降魔杵，玄上，应其"蒙古组若另定请并入此 ID"之约，本文不再另立；兵器为 design/10 `eq_jinchu`）。本节只保留霍都、潇湘子与蒙古本部武学。
> 倚天元军与汝阳王府武士仍可使用骑射、摔跤、弯刀表现时代风貌，但按 `rulings-v1` §3.4，这三门不进入倚天玩家可习得池，也不得掉落可拼完整秘籍的残页。

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
| setTags / conflicts | `[set_guojing_xiazhe]` / 无 |
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

**`sk_huodushanfa` 霍都扇法**（6 玄上 · 奇门（扇）· 阴 · 0.60/0.40 · 栏 3）｜weaponReq：`{category: exotic, kinds: [fan]}`（配霍都折扇 `eq_huoduzheshan`，design/10）｜reqs：`attrs {agi 30, wis 25}`、`aptitude {apExotic 30}`、`morality {max: −10}`（软）｜layerStats：`hit [1,5]`、`eva [1,5]`｜setTags：`[]`｜获取：神雕 `master npc_huodu`（敌对路线）`maxLayer 10`；`observe` 6｜出处：霍都王子使折扇，大胜关败于朱子柳，后化名混入丐帮并害死鲁有脚（《神雕侠侣》）；“霍都扇法”、扇底藏针和毒效均为**（原创扩展）**

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 折扇点穴 `mv_huodushanfa_dianxue` | 1 | 单体·1 | 1.05 | 6%/1/1000 | `bf_fengxue` 25% 1 | 可 | 1.12−0.05 |
| 扇底藏针 `mv_huodushanfa_cangzhen` | 3 | `aoe_bolt`·1–4·投射 | 1.15 | 7%/2/1000 | `bf_zhongdu` 50% | 可 | 1.29×0.92−0.05 |
| 扇风迷眼 `mv_huodushanfa_shanfeng` | 5 | `aoe_cone n2`·远程 | 0.65 | 6%/1/1000 | `bf_muxuan` 50% | 可 | 0.75×1.12×0.85−0.05 |
| 暗算 `mv_huodushanfa_ansuan` | 7 | 单体·1；`condition {fromBehind: true}` | 1.60 | 7%/2/1000 | — | 可 | 1+0.24+0.05+0.30 |

被动：`ps_huodushanfa_yinxian` 阴险（1，stat Z0：战斗首回合本武学暴击 +[5, 10]）；`ps_huodushanfa_wangzi` 王子骄横（5，stat Z3：对气血 < 50% 的目标 +8%）；`ps_huodushanfa_dacheng` 大成（10，mechanic：扇底藏针所附 `bf_zhongdu` 改为 `bf_judu`）。

**`sk_kusangbangfa` 哭丧棒法**（6 玄上 · 棍杖 · 阴 · 0.70/0.30 · 栏 3）｜reqs：`attrs {str 30, wil 25}`、`aptitude {apStaff 30}`、`morality {max: −10}`（软）｜layerStats：`hit [1,5]`、`tough [1,5]`｜setTags：`[]`｜获取：神雕 `master npc_xiaoxiangzi`（敌对路线）`maxLayer 10`；`observe` 6｜出处：湘西潇湘子使哭丧棒，形貌如僵尸（《神雕侠侣》）；棒中毒砂、“僵尸功”及其战斗效果均为**（原创扩展）**

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 哭丧 `mv_kusangbangfa_kusang` | 1 | 单体·1–2 | 1.00 | 6%/0/1000 | `bf_zhenshe` 20% | 可 | 1−0.02 |
| 毒砂 `mv_kusangbangfa_dusha` | 3 | `aoe_cone n2`·远程 | 0.80 | 7%/3/1000 | `bf_zhongdu` 60%；`bf_shimang` 20% 1 | 可 | 0.75×1.41×0.85−0.06−0.02 |
| 僵尸跳 `mv_kusangbangfa_jiangshi` | 5 | `aoe_leap`·1–3 | 1.05 | 7%/2/1000 | 跳斩 | 可 | 0.90×1.29−0.10 |
| 招魂 `mv_kusangbangfa_zhaohun` | 7 | 单体·1–2 | 1.25 | 7%/2/1000 | `bf_kongju` 20% 1 | 可 | 1.29−0.05 |

被动：`ps_kusangbangfa_jiangshi` 僵直（1，stat：`resCC` +[4, 10] pp）；`ps_kusangbangfa_yinqi` 阴气（5，stat Z3：对气血 < 30% 的目标 +10%）；`ps_kusangbangfa_dacheng` 诈尸（10，trigger `battleStart`：自身获得 `bf_zhasi` ×1）。

**`sk_mengguqishe` 蒙古骑射**（5 玄中 · 暗器（弓箭）· 阳 · 0.85/0.15 · 栏 3）｜reqs：`attrs {str 25, agi 25}`、`aptitude {apHidden 25}`｜弹药：箭｜layerStats：`hit [1,6]`、`crit [1,4]`｜setTags：`[]`｜获取：射雕/神雕部族或军营教头 `master` `maxLayer 10`；鹿鼎葛尔丹部 `pages`（4 页，原创扩展）；`observe` 6。倚天元军仅为 NPC 使用

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 走马射 `mv_mengguqishe_zouma` | 1 | `aoe_bolt`·1–6·投射 | 0.95 | 6%/1/1000 | 射后后撤 1 | 可 | 1.12×0.92−0.10 |
| 连射 `mv_mengguqishe_lianshe` | 3 | `aoe_bolt`·1–6（2 段） | 1.20 | 7%/2/1000 | — | 可 | 1.29×0.92 |
| 箭雨 `mv_mengguqishe_jianyu` | 5 | `aoe_sq3`·2–6·远程（抛射） | 0.75 | 8%/3/1000 | — | 可 | 0.60×1.46×0.85 |
| 回身射 `mv_mengguqishe_huishen`（触发） | 7 | 自身 | 0 | 4%/—/— | `trigger {on: enemyEnterAdjacent, chance 0.5, perRound 1, counterPower 0.8}`，射后后撤 1 | — | 触发招式 |

被动：`ps_mengguqishe_mashang` 马上（1，mechanic：探索中骑马移动速度 +5%；骑乘战斗若由 design/09 支持，本武学射程 +1）；`ps_mengguqishe_caoyuan` 草原（5，stat Z3：身处平原/草地地形时本武学 +8%）；`ps_mengguqishe_dacheng` 大成（10，stat：`hit` +5%）。

**`sk_menggushuaijiao` 蒙古摔跤**（3 黄上 · 擒拿 · 阳 · 0.90/0.10 · 栏 3）｜reqs：无｜layerStats：`tough [1,3]`、`hit [1,3]`｜setTags：`[]`｜获取：射雕 `master npc_tuolei`（拖雷羁绊）`maxLayer 10`；神雕蒙古军营 `master`；鹿鼎布库房（若 `chapters/08` 另立"布库"武学，则本条作为其残篇印证来源）；`observe` 6。倚天蒙古军 NPC 可用但不可传授

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 抱摔 `mv_menggushuaijiao_baoshuai` | 1 | 单体·1 | 1.05 | 5%/1/1000 | `bf_dingshen` 20% 1 | 可 | 1.12−0.05 |
| 绊摔 `mv_menggushuaijiao_banshuai` | 4 | 单体·1 | 1.05 | 5%/1/1000 | `bf_panshan` 60% | 可 | 1.12−0.06 |
| 过肩摔 `mv_menggushuaijiao_guojian` | 7 | `aoe_knock n2`·1 | 1.15 | 6%/2/1000 | 击退 2 | 可 | 0.95×1.29−0.10 |

被动：`ps_menggushuaijiao_zhuangshi` 壮实（5，stat：`resCC` +[4, 8] pp）；`ps_menggushuaijiao_yuanman` 圆满（10，mechanic：首次练满 `apGrapple` +1；鹿鼎"布库"相关事件可直接以本武学应对，chapters/08 接口）。

**`sk_mengguwandao` 蒙古弯刀**（2 黄中 · 刀 · 阳 · 0.90/0.10 · 栏 3）｜**（原创扩展）**草原马刀｜reqs：无｜layerStats：`hit [1,3]`、`crit [1,3]`｜setTags：`[]`｜获取：射雕/神雕部族或军营 `master`；鹿鼎葛尔丹部 `pages`（3 页，原创扩展）；`observe` 6。倚天元军仅为 NPC 使用

| 招式 | 重 | 范围·射程 | 倍率 | 耗内/cd/收 | 附带 | 架 | 核算 |
|---|---|---|---|---|---|---|---|
| 马刀劈 `mv_mengguwandao_pi` | 1 | 单体·1 | 1.00 | 5%/0/1000 | — | 可 | 1.00 |
| 旋刀 `mv_mengguwandao_xuan` | 4 | `aoe_sweep` | 0.85 | 5%/1/1000 | — | 可 | 0.75×1.12 |
| 冲锋斩 `mv_mengguwandao_chongfeng` | 7 | `aoe_dash n3`·1–3 | 1.05 | 6%/1/1000 | 突进 | 可 | 1+0.12+0.05−0.10 |

被动：`ps_mengguwandao_hanfeng` 悍风（5，stat Z3：本回合移动 ≥ 3 格后本武学 +6%）；`ps_mengguwandao_yuanman` 圆满（10，mechanic：首次练满 `apBlade` +1）。

### 11.5 AR-01 新增玄阶紧凑卡（3 门）

> 本节与下表均为草原部族训练的**（原创扩展）**；射雕、神雕的蒙古时代背景为原著，鹿鼎葛尔丹部投放是玩法延续，不把条目名冒充小说具名武学。

#### `sk_caoyuanbufa` 草原步法（4 玄下 · 轻功）

**字段**｜`origin:expanded`；`sect:sect_menggu`；`nature:neutral`；`wOut/wIn:0.75/0.25`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch08_luding]`；`Q_skill=QS(4)=56`；`reqs:{attrs:{agi:25,con:22},aptitude:{apLight:22},sect:{id:sect_menggu,rank:1},hard:[sect]}`；`layerStats:{spd:[1,5],eva:[1,5]}`；`setTags:[]`。

- 招式：逐草 `mv_caoyuanbufa_zhucao`（L1，自身移2格，5%/2）；踏雪 `mv_caoyuanbufa_taxue`（L4，自身，6%/3，`bf_shenqing`1）；均 `power:0`。
- 被动：识途 `ps_caoyuanbufa_shitu`（草原旅行耗时 −5%→12%）；长行 `ps_caoyuanbufa_changxing`（连续移动后 spd +2→5）。获取：蒙古 L1；鹿鼎葛尔丹部来源为原创扩展。

#### `sk_qimawandaofa` 骑马弯刀法（5 玄中 · 兵器/刀）——核算抽样

**字段**｜`origin:expanded`；`sect:sect_menggu`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:blade}`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch08_luding]`；`reqs:{attrs:{str:30,agi:28},aptitude:{apBlade:28},prereq:[{skill:sk_mengguchangdao,layer:4}],sect:{id:sect_menggu,rank:2},hard:[sect,prereq]}`；`layerStats:{crit:[1,6],hit:[1,4]}`；`setTags:[]`。

- 招式：走马劈 `mv_qimawandaofa_zoumapi`（L1，突进2格后单体，**1.00**，6%/1；`1×1.12−.10=1.02≈1.00`）；回骑斩 `mv_qimawandaofa_huiqi`（L3，横扫，**0.95**，7%/2；`.75×1.29=.9675≈.95`）；追风刀 `mv_qimawandaofa_zhuifeng`（L6，单体，**1.30**，8%/2；`1×(1+.24+.10)−.05=1.29≈1.30`，其中后撤 1 格扣 `.05`）。
- 被动：马上刀 `ps_qimawandaofa_mashang`（骑乘表现开放时 Z3 +4%→10%，否则无效）；回锋 `ps_qimawandaofa_huifeng`（横扫命中两人以上获 `bf_ruiyi`1）。获取：蒙古 L2；鹿鼎葛尔丹部残谱。

#### `sk_mengguduanmao` 蒙古短矛（5 玄中 · 兵器/枪）

**字段**｜`origin:expanded`；`sect:sect_menggu`；`nature:yang`；`wOut/wIn:0.85/0.15`；`weaponReq:{category:spear}`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch08_luding]`；`reqs:{attrs:{str:28,agi:28},aptitude:{apSpear:28},prereq:[{skill:sk_mengguchangmao,layer:4}],sect:{id:sect_menggu,rank:2},hard:[sect,prereq]}`；`layerStats:{hit:[1,6],parry:[1,4]}`；`setTags:[]`。

- 招式：短矛刺 `mv_mengguduanmao_cishou`（L1，单体1–2，1.10，6%/1）；投矛 `mv_mengguduanmao_toumao`（L3，投射1–4，1.10，7%/2）；拦骑 `mv_mengguduanmao_lanqi`（L6，线2，1.05，8%/2，击退1）。
- 被动：短兵长用 `ps_mengguduanmao_changyong`（距离2时 hit +3→8）；备矛 `ps_mengguduanmao_beimao`（每战首次投矛不耗弹药）。获取：蒙古 L2；鹿鼎葛尔丹部来源为原创扩展。

### 11.6 黄阶总表（11 门；含既有 2 门索引、新增 9 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_mengguwandao` | 蒙古弯刀（2 黄中） | 蒙古诸部 | 兵器/刀 | 射雕、神雕、鹿鼎 | 单体1.00、横扫.85；`[]` | 无 | **（原创扩展）**；详细卡见 §11.4 |
| `sk_caoyuanshuai` | 草原摔（2 黄中） | 蒙古诸部 | 拳脚/擒拿 | 射雕、神雕、鹿鼎 | 单体1.05、绊倒20%；`[]` | 无；L1 | **（原创扩展）** |
| `sk_menggushuaijiao` | 蒙古摔跤（3 黄上） | 蒙古诸部 | 拳脚/擒拿 | 射雕、神雕、鹿鼎 | 抱摔、过肩摔；`[]` | 无 | 原著背景；详细卡见 §11.4 |
| `sk_buzuqiang` | 部族枪（3 黄上） | 蒙古诸部 | 兵器/枪 | 射雕、神雕、鹿鼎 | 线2 .95、基础拒骑；`[]` | 无；L1 | **（原创扩展）** |
| `sk_qipaobu` | 骑跑步（3 黄上） | 蒙古诸部 | 轻功 | 射雕、神雕、鹿鼎 | `QS(3)=45`，骑行转位；`[]` | 草原摔 3 重 | **（原创扩展）** |
| `sk_junzhanghao` | 军帐号（3 黄上） | 蒙古军帐 | 杂学/音律 | 射雕、神雕、鹿鼎 | 友方 `bf_juqi`1；`music:15`；`[]` | 无 | **（原创扩展）** |
| `sk_caoyuantunaxi` | 草原吐纳息（3 黄上） | 蒙古诸部 | 内功 | 射雕、神雕、鹿鼎 | `nature:yang`；`IP=10+6+2×4+5×1.2=30`；`mer_dumai`；`[]` | 无；L1 | **（原创扩展）** |
| `sk_mengguchangdao` | 蒙古长刀（3 黄上） | 蒙古军伍 | 兵器/刀 | 射雕、神雕、鹿鼎 | 单体1.10、横扫.85；`[]` | 蒙古弯刀 3 重 | **（原创扩展）** |
| `sk_mengguchangmao` | 蒙古长矛（3 黄上） | 蒙古军伍 | 兵器/枪 | 射雕、神雕、鹿鼎 | 线2 .95、距离2命中；`[]` | 无；L1 | **（原创扩展）** |
| `sk_taomasuo` | 套马索（3 黄上） | 蒙古牧民 | 兵器/鞭索 | 射雕、神雕、鹿鼎 | 投射拉拽式 .95；`[]` | 草原摔 3 重 | **（原创扩展）** |
| `sk_qizhenhaoling` | 骑阵号令（3 黄上） | 蒙古军帐 | 杂学/阵法 | 射雕、神雕、鹿鼎 | 相邻友军 `bf_jixing`1；`formation:15`；`[]` | 军帐号 3 重 | **（原创扩展）** |

**黄阶整体预算核对**：草原摔按单体 cd1 扣硬控 `.25×.20=.05` 得 `1.07≈1.05`；部族枪、蒙古长矛按线2 cd1 `.85×1.12=.952≈.95`；蒙古长刀单体 cd1 `1.12≈1.10`、横扫 cd1 `.84≈.85`；套马索投射拉拽按 `1×1.12×.92−.10=.930≈.95`。骑跑步用 `QS(3)=45`，草原吐纳息精确命中黄上 IP 30；所有 `layerStats≤6`。

---

## 12. 套装候选（已由 `design/07` 收敛）

> **C2 定稿索引**：计件、品阶、效果、可达性及正式成员唯一见 `design/07` §10；实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 | 跨组成员 |
|---|---|---|---|
| 丐帮帮主 | `set_gaibang_bangzhu` | `sk_xianglong18`、`sk_dagou`、`sk_dagouzhen`、`sk_canfengyinlugong`、`sk_yunyoubu` | 无 |
| 桃花岛主 | `set_taohuadao` | `sk_tanzhi`、`sk_bihai`、`sk_lanhuafuxueshou`、`sk_yuxiaojianfa`、`sk_luoyingshenjianzhang`、`sk_bitaoxuangong` | 无 |
| 白驼山主 | `set_baituoshan` | `sk_hama`、`sk_lingshezhangfa`、`sk_lingshequan`、`sk_nizhuanjingmai`、`sk_tashaxing`、`sk_shexingdiaoshou` | 无 |
| 一阳 | `set_dali_yiyang` | `sk_yiyangzhi`、`sk_liumai`、`sk_kurongchangong`、`sk_yiyangshuzhi`、`sk_duanjiajianfa`、`sk_tiannanxinfa` | 无 |
| 九阴正宗 | `set_jiuyin_zhengzong` | `sk_jiuyin`、`sk_jiuyinshenzhao`、`sk_yihun`、`sk_dafumoquan`、`sk_yijinduangupian`、`sk_shexinglifan`、`sk_jiuyinliaoshangpian`、`sk_jiuyintiaoxipian`、`sk_shoujinpian`、`sk_biguqipian` | 无 |
| 侠之大者 | `set_guojing_xiazhe` | `sk_jiuyin`、`sk_kongming`、`sk_zuoyouhubo`、`sk_zhebiejianshu`、`sk_wumuyishu` | `sk_xianglong18`（`design/05` 权威定义，须下游同步） |

未采用的沿门托钵、女诸葛、黑风双煞、老顽童、铁掌水上飘、江南七怪、满门忠烈、弯弓射雕、幕府群雄，以及五组 AR-01 门派底座套装，均已从实际标签移除；原因与合并去向见 `design/07` §19。装备草案不计入 v1 成员。


## 13. 境界覆盖与装配可行性

### 13.1 各书界本组原生武学（全部路线可习得池）

本表按 `design/05` §14.4 的口径对本文 182 个唯一武学 ID 求并集：同一书界同一 ID 只计一次；包含正邪互斥路线并集和可新学残承，不含只见闻、仅外界携带或敌人专用项。类别顺序固定为“内功/拳脚/兵器/轻功/暗器/杂学”。

| 书界 | 境界 | 本组原生数（天/地/玄/黄） | 类别数（内/拳/兵/轻/暗/杂） | 本组内/拳/兵是否各 ≥3 | 跨图鉴装配结论 |
|---|---|---|---|---|---|
| 天龙 | 高 | 58（4/3/24/27） | 9/13/20/9/0/7 | 通过（9/13/20） | `skills-general` 的 `ALL14` 同类剑链另保底；章节仍须验证来源非互斥 |
| 射雕 | 高 | 173（12/20/67/74） | 28/43/52/23/5/22 | 通过（28/43/52） | 本组主场；跨图鉴合并后仍按唯一 ID 去重 |
| 神雕 | 高 | 154（10/18/63/63） | 26/37/46/21/5/19 | 通过（26/37/46） | 射雕体系延续；本组即可填满三类装配栏 |
| 倚天 | 高 | **14（3/3/3/5）** | **2/4/5/1/0/2** | 内功 2，单看本组不足 | 精确白名单不变；`ALL14` 至少再供 3 内功、3 拳脚和同类剑 3 门 |
| 笑傲 | 中 | 37（0/2/18/17） | 5/8/12/5/0/7 | 通过（5/8/12） | 丐帮本土链已满足数量；`ALL14` 同类剑链保证三兵器可轮换 |
| 碧血 | 中 | 41（0/2/16/23） | 5/8/17/6/0/5 | 通过（5/8/17） | 丐帮分舵、明末军伍为原创扩展；通行剑链提供非门派旁路 |
| 鹿鼎 | 低 | 45（0/0/16/29） | 5/8/17/7/1/7 | 通过（5/8/17） | 丐帮分舵、葛尔丹部为原创扩展；低武 1/1/1 携带后仍可本土补栏 |
| 侠客 | 中 | 0 | 0/0/0/0/0/0 | 单看本组不足 | 完全依赖 `skills-general` 的 `ALL14` 底座及侠客专门图鉴 |
| 连城 | 低 | 0 | 0/0/0/0/0/0 | 单看本组不足 | 完全依赖 `skills-general` 的 `ALL14` 底座及连城专门图鉴 |
| 白马 | 低 | 0 | 0/0/0/0/0/0 | 单看本组不足 | 完全依赖 `skills-general` 的 `ALL14` 底座及白马专门图鉴 |
| 鸳鸯 | 低 | 1（0/0/0/1） | 0/0/1/0/0/0 | 单看本组不足 | `ALL14` 提供 3 内功、3 拳脚、同类剑 3 门；本文六合枪只是额外兵器 |
| 书剑 | 中 | 1（0/0/0/1） | 0/0/1/0/0/0 | 单看本组不足 | `ALL14` 提供 3 内功、3 拳脚、同类剑 3 门；本文六合枪只是额外兵器 |
| 飞狐 | 中 | 1（0/0/0/1） | 0/0/1/0/0/0 | 单看本组不足 | `ALL14` 提供 3 内功、3 拳脚、同类剑 3 门；本文六合枪只是额外兵器 |
| 雪山 | 中 | 0 | 0/0/0/0/0/0 | 单看本组不足 | 完全依赖 `skills-general` 的 `ALL14` 底座及雪山专门图鉴 |

- 与扩充前相比，本轮池增量按磁盘条目的 `sourceChapters` 实算：天龙 +38、射雕 +97、神雕 +88、笑傲 +27、碧血 +29、鹿鼎 +34；倚天 +0。丐帮新增玄上只投放至笑傲，未把碧血/鹿鼎数量按旧推测虚增。
- `ALL14` 的最低证明引用 `skills-general` §11.1：军旅吐纳/武馆心法/江湖吐纳三内功，通背劲/弹腿（通行）/短打手三拳脚，江湖入门剑→清风剑→江湖百战剑三门同类剑。目录层面十四书界均满足 3/3/3；章节还必须落实同周目非互斥、前两幕或支线入口可达和前置闭包。
- 丐帮碧血/鹿鼎分舵、鹿鼎葛尔丹部、明末军伍均已标**（原创扩展）**。若章节拒绝这些落点，不能静默删来源：须由 F2/章节以其他合法本土来源重配并重算全目录池。

### 13.2 本组天级带入中武/低武后的有效品阶（02 §2.3）

| 绝对品阶 | 本组武学 | 中武（−2） | 低武（−4） | 在低武中的对照 |
|---|---|---|---|---|
| 12 天上 | 降龙十八掌、六脉神剑、九阴真经 | 10 天下 | 8 地中 | 高于低武普通敌人主力上限 7，低于鹿鼎原生天下（凝血神爪） |
| 11 天中 | 一阳指、打狗棒法 | 9 地上 | 7 地下 | 与低武精英持平 |
| 10 天下 | 蛤蟆功、弹指神通、空明拳、九阴神爪、铁掌功（核心）；碧海潮生曲、左右互搏、移魂大法（非核心，不可携带） | 8 地中 | 6 玄上 | 核心类仍可用；非核心类化为残篇，留下感悟（02 §5.5） |

**推荐携带（本组视角，仅示例）**：
- 进入中武（2/2/2）：内功九阴真经＋蛤蟆功或碧涛玄功；拳脚降龙十八掌＋一阳指/弹指神通；兵器打狗棒法＋玉箫剑法或段家剑法。进入笑傲后，本土丐帮链已有 5 内功、8 拳脚、12 兵器，足以重建装配。
- 进入低武（1/1/1）：九阴真经＋降龙十八掌＋打狗棒法；鹿鼎若采用原创丐帮分舵，可再从 5 内功、8 拳脚、17 兵器中重修，或走“沿门托钵”“丐帮行艺”“弯弓射雕”等玄黄套。

### 13.3 本组池占比校核（05 §14.4）

| 书界 | 本组池占比（天/地/玄/黄） | 05 §14.4 对应区间 | 结论 |
|---|---|---|---|
| 天龙 | 6.90% / 5.17% / 41.38% / 46.55% | 高武 10–15 / 20–25 / 30–35 / 30–35% | 本组子池不命中；不得把子池当全目录验收 |
| 射雕 | 6.94% / 11.56% / 38.73% / 42.77% | 高武同上 | 同上 |
| 神雕 | 6.49% / 11.69% / 40.91% / 40.91% | 高武同上 | 同上 |
| 倚天 | 21.43% / 21.43% / 21.43% / 35.71% | 高武同上 | 白名单小池偏天；保持裁定，不为比例扩源 |
| 笑傲 | 0 / 5.41% / 48.65% / 45.95% | 中武 2–6 / 15–20 / 33–38 / 38–45% | 本组子池偏玄、缺地；交全目录合并 |
| 碧血 | 0 / 4.88% / 39.02% / 56.10% | 中武同上 | 本组子池偏黄、缺天地；交全目录合并 |
| 鹿鼎 | 0 / 0 / 35.56% / 64.44% | 低武 0–5 / 8–12 / 33–38 / 48–55% | 玄命中，黄偏高、地缺；交全目录合并 |
| 侠客 | —（本组池为 0） | 中武同上 | 无本组样本；交 `ALL14`、专门图鉴与全目录合并 |
| 连城 | —（本组池为 0） | 低武同上 | 无本组样本；交 `ALL14`、专门图鉴与全目录合并 |
| 白马 | —（本组池为 0） | 低武同上 | 无本组样本；交 `ALL14`、专门图鉴与全目录合并 |
| 鸳鸯 | 0 / 0 / 0 / 100% | 低武同上 | 仅一门六合枪，子池不具比例代表性；交全目录合并 |
| 书剑 | 0 / 0 / 0 / 100% | 中武同上 | 仅一门六合枪，子池不具比例代表性；交全目录合并 |
| 飞狐 | 0 / 0 / 0 / 100% | 中武同上 | 仅一门六合枪，子池不具比例代表性；交全目录合并 |
| 雪山 | —（本组池为 0） | 中武同上 | 无本组样本；交 `ALL14`、专门图鉴与全目录合并 |

这里的失败是**本图鉴子池诊断**，不等价于全目录失败或成功。`design/05` §14.4 要求 F2/章节把全部图鉴的最终来源按唯一 ID 合并后，以未舍入分数重新验收；CXw 不能越权改其他图鉴或章节来源。

---

## 14. 本组统计

### 14.1 门派 × 品阶（12 级）

| 门派/传承 | 黄下 | 黄中 | 黄上 | 玄下 | 玄中 | 玄上 | 地下 | 地中 | 地上 | 天下 | 天中 | 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 丐帮 | 2 | 8 | 7 | 4 | 8 | 8 | 2 | 0 | 0 | 0 | 1 | 1 | **41** |
| 桃花岛 | 0 | 5 | 4 | 2 | 4 | 3 | 3 | 2 | 0 | 2 | 0 | 0 | **25** |
| 白驼山 | 0 | 4 | 3 | 1 | 2 | 4 | 1 | 1 | 1 | 1 | 0 | 0 | **18** |
| 大理段氏/天龙寺 | 0 | 5 | 6 | 2 | 3 | 2 | 1 | 1 | 1 | 0 | 1 | 1 | **23** |
| 周伯通 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 2 | 0 | 0 | **4** |
| 九阴真经系 | 0 | 0 | 0 | 0 | 1 | 4 | 2 | 1 | 3 | 2 | 0 | 1 | **14** |
| 铁掌帮 | 0 | 4 | 2 | 1 | 2 | 1 | 0 | 0 | 1 | 1 | 0 | 0 | **12** |
| 江南七怪 | 0 | 5 | 3 | 4 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **16** |
| 杨家枪与将门 | 0 | 5 | 1 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | **11** |
| 蒙古 | 0 | 2 | 9 | 1 | 3 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | **18** |
| **合计** | **2** | **38** | **35** | **16** | **28** | **27** | **11** | **6** | **6** | **8** | **2** | **3** | **182** |
| **大阶小计** |  | **黄 75（41.21%）** |  |  | **玄 71（39.01%）** |  |  | **地 23（12.64%）** |  |  | **天 13（7.14%）** |  | |

调整前/受控目标/调整后分别为 `13/23/28/19`、`13/23/71/75`、`13/23/71/75`（天/地/玄/黄），新增 `0/0/43/56`。受控目标偏差为 0；未新增天阶或地阶。

### 14.2 类别 × 大阶

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---:|---:|---:|---:|---:|
| 内功 | 心法 | 2 | 4 | 15 | 8 | **29** |
| 拳脚 | 拳掌 | 3 | 4 | 10 | 11 | 28 |
|  | 指法 | 3 | 0 | 0 | 0 | 3 |
|  | 腿法 | 0 | 0 | 1 | 0 | 1 |
|  | 擒拿/爪 | 1 | 2 | 4 | 6 | 13 |
|  | **小计** | **7** | **6** | **15** | **17** | **45** |
| 兵器 | 剑 | 0 | 1 | 2 | 3 | 6 |
|  | 刀 | 0 | 0 | 5 | 7 | 12 |
|  | 棍杖 | 1 | 1 | 6 | 8 | 16 |
|  | 枪 | 0 | 1 | 3 | 4 | 8 |
|  | 鞭索 | 0 | 1 | 1 | 3 | 5 |
|  | 奇门 | 0 | 3 | 1 | 6 | 10 |
|  | **小计** | **1** | **7** | **18** | **31** | **57** |
| 轻功 |  | 0 | 2 | 13 | 9 | **24** |
| 暗器 | 含弓箭 | 0 | 1 | 2 | 2 | **5** |
| 杂学 | 阵法 6、音律 7、心神 2、医 3、书画 1、驭兽 1、毒 1、机制 1 | 3 | 3 | 8 | 8 | **22** |
| **合计** |  | **13** | **23** | **71** | **75** | **182** |

内功共 29 门，`nature` 分布为 `yang 16 / yin 4 / harmony 9`；新增 19 门的性质、正式经脉 ID 与 IP 算式见 §0.3 及各卡。

### 14.3 原生书界

| 书界 | 首现（天/地/玄/黄） | 首现合计 | 全部路线可习得池（天/地/玄/黄） | 池合计 |
|---|---|---|---|---|
| 天龙 | 4/3/24/27 | 58 | 4/3/24/27 | 58 |
| 射雕 | 9/18/45/48 | 120 | 12/20/67/74 | 173 |
| 神雕 | 0/1/2/0 | 3 | 10/18/63/63 | 154 |
| 倚天 | 0/1/0/0 | 1 | **3/3/3/5** | **14** |
| 笑傲 | — | 0 | 0/2/18/17 | 37 |
| 碧血 | — | 0 | 0/2/16/23 | 41 |
| 鹿鼎 | — | 0 | 0/0/16/29 | 45 |
| 鸳鸯 / 书剑 / 飞狐 | — | 0 | 各 0/0/0/1 | 各 1 |
| 侠客 / 连城 / 白马 / 雪山 | — | 0 | 0/0/0/0 | 0 |
| **唯一 ID 合计** | **13/23/71/75** | **182** |  |  |

首现归属规则是取每个 ID 最早的 `sourceChapters`，因此新增 99 门首现为天龙 38、射雕 61，和既有 83 门合并后得到天龙 58、射雕 120；神雕/倚天的既有首现 3/1 不变。池统计不能横向求和，因为同一 ID 可在多个书界复现。

### 14.4 预算口径说明（CN-01）

本轮新增条目一律按现行 `design/05` §4.2 计算：Buff 成本按“成本 × 施加率”扣除，**不乘持续回合**。对扩充前 83 门中可明确定位、原先因旧口径失真的六式同步重算如下；此清单不声称替 F2 穷举重算全部旧条目。

| 招式 ID | 旧值 → 现值 | 现行核算 |
|---|---:|---|
| `mv_dagou_chan` | 0.90 → **1.05** | `1.24−.25×.70=1.065≈1.05` |
| `mv_tiebogong_koubo` | 1.10 → **1.25** | `1.41−.25×.60=1.26≈1.25` |
| `mv_lanhuafuxueshou_jiuwan` | 2.50 → **2.70** | `3−.20−.10=2.70` |
| `mv_lingshezhangfa_chan` | 1.10 → **1.25** | `1.41−.25×.60=1.26≈1.25` |
| `mv_yiyangzhi_qianyang` | 2.15 → **2.35** | `3×.85−.20=2.35` |
| `mv_baimangbianfa_chanshen` | 1.00 → **1.15** | `1.29−.25×.60=1.14≈1.15` |

F2 应以当前 §0.2 口径对扩充前其余招式再做全量机械复算；若发现新差异，只改显示倍率/核算式，不改变本轮 182 门配额与 ID 集合。

---

## 15. 本文新增术语与 ID

计数只统计具体 ID，不把 `sk_*`、`q_0N_*_9x` 等模式文字计作实例；“本文定义”按完整/紧凑卡标题与黄阶八列表去重，跨图鉴引用不计入。

| 类别 | 数量 | 登记 / 唯一归属 |
|---|---:|---|
| 武学 `sk_*`（本文定义） | **182** | 天/地/玄/黄 = **13/23/71/75**；其中 `sk_xianglong18` 的完整数据唯一归 `design/05` §13.1，本文为补充卡；全文另有跨组引用，不计入 182 |
| 本轮新增武学 `sk_*` | **99** | 玄 43、黄 56；按分组登记见下表；相对扩充前无删除 ID |
| 招式 `mv_*` | **475** 个全文具体 ID | 本轮新增 111；降龙十八掌的 19 招仍唯一归 `design/05`，本文不重复定义 |
| 被动 `ps_*` | **350** 个全文具体 ID | 本轮新增 86；`ps_` 前缀及命名规则已由基准 v1.1 V11-04 接纳 |
| 套装 `set_*`（候选） | **20** 个本文候选 | 本轮新增 5；套装本体、阈值和最终数值唯一归 `design/07`。全文另引用 `set_qidan_xiaofeng`，故可见具体 `set_*` 共 21 个 |
| 门派 `sect_*` | **8** 个本文组内 ID | `sect_gaibang`、`sect_taohuadao`、`sect_baituoshan`、`sect_dali`、`sect_tianlongsi`、`sect_tiezhangbang`、`sect_jiangnanqiguai`、`sect_menggu`；另引用 `sect_quanzhen`。名称和时代状态以 `design/17` 为准 |
| 装备 `eq_*` | 0 新增，引用 **10** | 含 9 件套装/配装装备及 `eq_duling` 名器引用；定义均归 `design/10` |
| 物品 `it_*` | **20** 个具体 ID | 秘籍 16、残页 2、建议弹药 `it_huoyaotong` 1、引用药品 `it_jiuhuayulu` 1；`it_miji_` / `it_canye_` 命名已由 v1.1 V11-04 接纳 |
| NPC / 章节任务占位 | **50 / 10** | 具体 `npc_*` 50 个、具体 `q_0N_*` 10 个；均由相应 `chapters/` 替换或登记，不在图鉴建立 NPC/任务本体 |
| Buff `bf_*` | **0 定义，引用 99 个具体 ID** | 本轮条目新增 8 个具体引用，均已在 `design/06` 存在；本文不定义 Buff 本体 |
| 效果钩子（接口候选） | 4 | `weaponCoat`、`followupMove`、`equalizeHp`、`reflectMind`；唯一归 `design/05` §4.11 / `tech/05` |
| 招式/被动条件（接口候选） | 7 | `differentTagThanLast`、`firstHitOnTarget`、`targetHeightAboveSelf`、`selfNotHitThisBattle`、`targetMoralityMax`、`mainHandTag`、`equipped`；唯一归 `design/05` / `tech/05` |
| 其他局部接口 | 4 组 | `special.instrument`、`special.reformTo/reformFrom`、`special.trainMult`、奇门钵暂用 `weaponReq.kinds:[misc]`；不得据本文单独扩充公共 schema |

已采纳的登记不再作为新提案：`ps_*`、`it_miji_*`、`it_canye_*` 见 v1.1 V11-04；序章 `sk_yuenvjian` 与韩小莹 `sk_yuenvjian02` 分立见 v1.1 V11-29 及作者决定 P35。

### 15.1 本轮新增武学 ID（99）

| 分组 | 数量 | 新增 ID |
|---|---:|---|
| 丐帮 | 27 | `sk_gaibangtunajue`、`sk_liuyunbu`、`sk_duanbangshou`、`sk_gaibanghuxinfa`、`sk_fengyuzhang`、`sk_bocaogunfa`、`sk_xingshidao`、`sk_jiefengbu`、`sk_gaibangqilingshu`、`sk_jiudaixingong`、`sk_fengyulianshou`、`sk_zhengoubang`、`sk_pojunguitoudao`、`sk_gaibangchuansheng`、`sk_zhuzhangrumen`、`sk_tuobozhuang`、`sk_gaibangduanquan`、`sk_hujiaobang`、`sk_bailingbu`、`sk_jietouyanwu`、`sk_xunxiangshou`、`sk_fengdizhang`、`sk_shuangjiebang`、`sk_gaibangduandao`、`sk_gaibangfenshou`、`sk_shichengbu`、`sk_yanjiehao` |
| 桃花岛 | 12 | `sk_taohuatunaxi`、`sk_taohuaduanjian`、`sk_chaoyinbu`、`sk_biluofengyan`、`sk_qimenfushou`、`sk_taohuajianru`、`sk_yaoputunaxi`、`sk_huajianbu`、`sk_luoyingduanquan`、`sk_qimenyinlu`、`sk_yuxiaoduanji`、`sk_feihuachen` |
| 白驼山 | 9 | `sk_baituotunadu`、`sk_lingsheduanci`、`sk_lingshebu`、`sk_dumaihuqigong`、`sk_shexingtunaxi`、`sk_baituoduanbang`、`sk_shanbushequan`、`sk_duwushou`、`sk_shamozhang` |
| 大理段氏/天龙寺 | 12 | `sk_dalishenfa`、`sk_huweidaofa`、`sk_cangshanzhang`、`sk_duanshiyangshenggong`、`sk_tianlongchanbu`、`sk_wangfutunaxi`、`sk_dalirumenjian`、`sk_huweiduanquan`、`sk_dianchibu`、`sk_dalichangdao`、`sk_yuyincha`、`sk_tianlongmuzhang` |
| 周伯通 | 1 | `sk_wantongshuangxi` |
| 九阴真经系 | 3 | `sk_jiuyintiaoxipian`、`sk_shoujinpian`、`sk_biguqipian` |
| 铁掌帮 | 7 | `sk_tiezhangtunajue`、`sk_tiesuobu`、`sk_duanfengzhang`、`sk_tiezhangzhuang`、`sk_bangzhongduandao`、`sk_tiebishou`、`sk_shanlubu` |
| 江南七怪 | 9 | `sk_qiguaihebushu`、`sk_lingyangbu`、`sk_tiebifangshen`、`sk_shizhangrumen`、`sk_duanbianrumen`、`sk_miaoshoubianji`、`sk_hengjiangbian`、`sk_xiaoyingduanjian`、`sk_xiaomituozhuang` |
| 杨家枪与将门 | 7 | `sk_jiangmenzhuang`、`sk_hujunqiang`、`sk_bubingqiang`、`sk_jiangmenchangquan`、`sk_junzhubu`、`sk_lanmaqian`、`sk_huweidao` |
| 蒙古 | 12 | `sk_caoyuanbufa`、`sk_qimawandaofa`、`sk_mengguduanmao`、`sk_caoyuanshuai`、`sk_buzuqiang`、`sk_qipaobu`、`sk_junzhanghao`、`sk_caoyuantunaxi`、`sk_mengguchangdao`、`sk_mengguchangmao`、`sk_taomasuo`、`sk_qizhenhaoling` |
| **合计** | **99** | 玄阶 43＋黄阶 56 |

### 15.2 本轮新增套装候选 ID（5）

`set_gaibang_xingyi`、`set_taohua_qimen`、`set_baituo_shenu`、`set_dali_huwei`、`set_tiezhang_shanzhai`；成员与反向 `setTags` 见 §12。

---

## 16. 数据校验规则与测试用例

本节是本文的静态验收口径。数值取 `design/05` §4.2、§5.5；±0.05 是招式显示值允许误差，不用于放宽 ID、枚举或集合闭合。

### 16.1 代表性数值复算

| # | 对象 | 复算 | 文中值 / 结果 |
|---|---|---|---|
| V-W01 | 棒打双犬 | `0.80×1.12 = 0.896` | 0.90，✅ |
| V-W02 | 引字诀 | `0.95×1.12×0.85−0.10−0.15 = 0.6544` | 0.65，✅ |
| V-W03 | 天下无狗 | `3×0.65×0.85−0.25−0.10 = 1.3075` | 1.30，✅ |
| V-W04 | 钵震八方 | `3×0.65−0.10−0.05 = 1.80` | 1.80，✅ |
| V-W05 | 收网 | `3×0.45×0.85−0.10−0.10 = 0.9475` | 0.95，✅ |
| V-W06 | 天花乱坠 | `3×0.50×0.85−0.10 = 1.175` | 1.15，✅（差 0.025） |
| V-W07 | 蛤蟆功·全劲 | `3×0.65−0.10−0.075 = 1.775` | 1.80，✅（差 0.025） |
| V-W08 | 六脉齐发 | `3×0.65×0.85 = 1.6575` | 1.65，✅ |
| V-W09 | 乾阳一指 | `3×0.85−0.20×1.00 = 2.35` | 2.35，✅ |
| V-W10 | 一箭双雕 | `3×0.80×0.92 = 2.208` | 2.20，✅ |
| V-I01 | 碧涛玄功 | `28+14+2×(6+5)+5×2.0 = 74` | 地下预算 72 的 +2.78%，✅ |
| V-I02 | 蛤蟆功 | `38+30+2×(8+8)+5×3.6 = 118` | 天下预算 118，✅ |
| V-I03 | 逆转经脉 | `26+18+2×(6+4)+5×1.8 = 73` | 地下预算 72 的 +1.39%，✅ |
| V-I04 | 枯荣禅功 | `32+22+2×(8+6)+5×2.5 = 94.5` | 地上预算 94.5，✅ |
| V-I05 | 九阴真经 | `58+34+2×(8+6+6+4)+5×3.2 = 156` | 天上预算 156，✅ |
| V-I06 | 易筋锻骨篇 | `24+22+2×(7+5+3)+5×1.6 = 84` | 地中预算 83 的 +1.20%，✅ |
| V-N01 | 短棒手·横棒 | `.75×1.12=.84` | 0.85，✅（玄阶抽样） |
| V-N02 | 风雨掌·雨打 | `1×(1+.24+.05)=1.29` | 1.30，✅（玄阶抽样） |
| V-N03 | 奇门拂手·拂袖 | `1×1.12−.20×.50=1.02` | 1.00，✅（玄阶抽样） |
| V-N04 | 骑马弯刀法·追风刀 | `1×(1+.24+.10)−.05=1.29` | 1.30，✅（玄阶抽样） |
| V-NI01 | 丐帮吐纳诀 | `14+8+2×6+5×1.5=41.5` | 玄下预算 41.5，✅ |
| V-NI02 | 九阴调息篇 | `17+10+2×7+5×1.5=48.5` | 玄中预算 48.5，✅ |
| V-NI03 | 辟谷气篇 | `20+12+2×8+5×1.8=57` | 玄上预算 57，✅ |
| V-Y01 | 黄阶单体 / 横扫 / 投射基线 | `1.00` / `.75×1.12=.84` / `1×.92=.92` | 1.00 / 0.85 / 0.90，✅ |
| V-YI01 | 黄下/中/上内功 | `6+4+2×2+5×1=19`；`8+5+2×3+5×1=24`；`10+6+2×4+5×1.2=30` | 精确命中 19/24/30，✅ |

扩充前 364 个招式的旧机械复算结果保留为历史基线；本轮另新增 111 个 `mv_*`。43 门新增玄阶中 18 门逐招写出核算或功能式说明，覆盖率 `18÷43=41.86%≥30%`；其中 13 门伤害卡逐招展示倍率算式，单独覆盖率 `13÷43=30.23%≥30%`，另有 5 门纯支援/位移卡逐招说明不走伤害预算。56 门新增黄阶按各门派黄阶表末尾的“整体预算核对”验收。CN-01 六式重算见 §14.4。

### 16.2 结构与集合校验

| 编号 | 输入 / 检查 | 必须结果 |
|---|---|---|
| V-S01 | 182 门定义按 ID 去重并汇总品阶 | 十二品 `2/38/35/16/28/27/11/6/6/8/2/3`；大阶 `13+23+71+75=182`；与 C3 受控目标偏差 0 |
| V-S02 | 29 门 `category:inner` 条目 | 每门都有 `nature ∈ {yin,yang,harmony}`；分布阳 16、阴 4、调和 9；每门 IP 在同阶预算 ±5% |
| V-S03 | 六脉前置 | `prereq` 只有一个 `anyOf` 组：一阳指 5 或北冥神功 5；数组外层 AND、组内 OR；不存在活跃 `special.altPrereq` |
| V-S04 | `reqs.skills` | `music/formation/art` 使用 `design/03` 十项技艺 ID，数值为整数 0–100；无旧字段 `skillReq`，无嵌套/空 `anyOf` |
| V-S05 | C16 分类与属性 | 左右互搏为 `misc/mind`、`dualWield:int[0,10]`；哲别箭术与蒙古骑射为 `hidden/hidden`、使用 `apHidden`、占暗器栏；没有活跃 `bow`/`dual` 枚举 |
| V-S06 | §12 的 20 个候选套装 | 本文定义的成员均反向含对应 `setTags`；本轮五套成员闭合；跨文档成员列入 §17.1 同步清单 |
| V-S07 | Buff 集合 | 全文 99 个具体 `bf_*` 引用全部能在 `design/06` 找到；未知引用和本文重复定义均为 0 |
| V-S08 | 射雕天级取得账本 | 五绝 12 门最多取 5，道家最多 2，少林易筋 1 与两组共用总账：`min(7,5+2+1)=7` |
| V-S09 | 倚天本组玩家池 | 精确白名单 `3/3/3/5=14`；降龙是其中 1 门 10 品残承，NPC 表现不得暗增玩家来源 |
| V-S10 | ID / Markdown | 本文定义 `sk_*` 182 个且无重复；全文具体 `mv_*` 475、`ps_*` 350；75 门黄阶均进入八列表；表格列数一致、代码围栏成对，无未完成占位 |
| V-S11 | 新增 ID 差集 | 相对扩充前新增 `sk_*` 99、`mv_*` 111、`ps_*` 86、`set_*` 5；旧具体 ID 删除数均为 0 |
| V-S12 | 书界装配 | §13.1 逐界列本组内/拳/兵计数；不足界引用 `skills-general` §11.1 的 `ALL14` 三内、三拳、三门同类剑底座 |

---

## 17. 待决事项 / 依赖

### 17.1 替下游给出的建议值

| 追溯 | 默认 / 当前状态 | 接收方 |
|---|---|---|
| W-01 | 本文已给 `sk_xianglong18` 补充卡登记 `set_guojing_xiazhe`、`set_qidan_xiaofeng`；`design/05` §13.1 仍须补同样的反向 `setTags` | `design/05`、`design/07` |
| W-02 | 7 个条件接口按 §15 名单与各招式语义实现；在公共 schema 合入前均为**【建议值】**，不得只解析说明文字 | `design/05`、`tech/05` |
| W-04 | 铁钵功暂用已登记的奇门 `kinds:[misc]`；如以后确需 `bowl`，由 `design/05` 与 `design/10` 同步新增，不在本文先造枚举 | `design/05`、`design/10` |
| W-05 | 4 个效果钩子按 §15 名单与条目参数实现；公共 hook schema 和时序未落盘前为**【建议值】** | `design/05`、`tech/05` |
| W-08 | `lg_jiuyin` 建议纳入易筋锻骨篇、蛇行狸翻、大伏魔拳、九阴疗伤篇、摧心掌、白蟒鞭法；`lg_yiyang` 建议纳入一阳书指 | `design/02` §5.4 |
| W-12 | 已解决（目录层面）：本轮后笑傲/碧血/鹿鼎本组各有 5 门内功、8 门拳脚、12/17/17 门兵器；其余书界由 `skills-general` §11.1 的 `ALL14` 三内、三拳、三门同类剑补足。章节仍须验证同周目非互斥与前置闭包（见 §13.1） | 相关 catalog、chapters/* |
| W-13 | 已解决：六合枪唯一归本文，通行图鉴只引用；来源收敛为 §10.4 所列 8 个书界（见 `rulings-v1` §2、§3.4） | `skills-general` |
| W-14 | 已解决：射雕五绝组最多取得 5 门天级，全章天级共用上限 7；计算见 §16.2 V-S08，事件须用同一传承名额账本 | `chapters/02`、`design/02` |
| W-15 | **【建议值】**保留丐帮碧血/鹿鼎分舵、葛尔丹部与明末军伍等已标原创扩展落点；倚天大理只保留朱武连环庄 NPC 残传叙述，不另设“元代大理段氏余脉”玩家线 | `chapters/04/07/08` |
| W-16 | 本文 20 个具体 `it_*` 中仅 `it_jiuhuayulu` 已见 `design/10`；其余 16 本秘籍、2 份残页和 `it_huoyaotong` 均须在该文登记。箭、石子、枣核的弹药项也需统一；`eq_duling` 是装备，`sk_duling` 是武学，同名不同类型须交叉引用 | `design/10` |
| W-17 | 已解决：套装用双向闭合，`g_set=floor(median(effGrade))`，外来成员按压制后品阶；本文 §12 已执行并新增五个玄黄门派套，最终本体仍归 `design/07`（见 C22） | `design/07` |
| W-18 | “九品”显示、六脉不灵概率、铁掌驱散难度 +1 是条目局部覆写；公共结构与 UI 呈现仍需归属文档确认 | `design/05`、`design/06`、`tech/05` |
| W-20 | 已解决：本文按裁定分工收录 182 门，旧拆分文件名不再使用；`design/05` §14.5 已登记同一受控规模 | `design/05` §14 |
| W-21 | 已解决（本文范围）：旧 661 门口径已被 AR-01/C3 覆盖；本轮按最终来源重算本图鉴首现与各书界池，见 §14.3。全目录池仍交 F2 合并 | `design/05`、F2 |
| W-22 | 已解决：C3 受控配额取代旧名义单册目标；本文由 13/23/28/19 补为 13/23/71/75，新增 0/0/43/56，偏差 0 | CXw |
| CN-01 | 已解决（本轮边界）：§0.2 改用现行 Buff 成本口径，新增条目全按该口径；§14.4 列六式旧条目重算清单。其余旧招由 F2 全量机械复算 | F2 |
| C22 外部闭合 | `sk_zaoheding` 补 `set_tiezhang_shuishangpiao`；`sk_jingangxiangmochu` 补 `set_menggu_mufu`；套装中的 8 个装备 ID 补齐 9 条反向标签关系（`eq_ruanweijia` 属两套） | `skills-daojia`、`skills-xiaoyao`、`design/10` |

### 17.2 本文依赖的上游事实

| 追溯 | 已解决 / 依赖 |
|---|---|
| W-03 / C17 | 已解决：本文已把既有明确数值迁入 `reqs.skills`（`music`、`formation`、`art`），医毒仅有自然语言而无旧数值者不臆造；接口见 `rulings-v1` §4，归属仍待 `design/05` 合入 |
| W-06 / C17 | 已解决：六脉使用 `prereq[].anyOf`，删除活跃 `special.altPrereq`；见 §5.3、§16.2 V-S03 |
| W-07 / C16 | 已解决：左右互搏为 `misc/mind`，`dualWield` 为派生整数 0–10；不新增 `dual`，见 §6.3 |
| W-09 / C16 | 已解决：弓箭为 `hidden/hidden`、使用 `apHidden`、占暗器栏且不可书眠携带；不新增 `bow`，见 §11.2 |
| W-10 | 已解决：倚天降龙沿用 `sk_xianglong18`，来源物品 `it_miji_xianglong18_can` 限 6 重；来源上限不因书眠/现影自动补全（见基准 v1.1、P38） |
| W-11 | 已解决：序章 `sk_yuenvjian` 地上 9 与韩小莹 `sk_yuenvjian02` 玄下 4 分立；序章结束强制化残篇（见基准 v1.1 V11-29、P35） |
| W-19 | 已解决：白骨爪道德门槛按 `design/05` §9.1.2；其余条目按 `design/05` §7.3 的硬/软规则解释，不另造图鉴级规则 |
| W-23 | 已解决：重命名与跨组去重均按 `rulings-v1` §2 执行；本文采用 `sk_shuishangpiao`、`sk_tingshengzhangfa`、`sk_huodushanfa`，并只引用 `sk_jingangxiangmochu`、`sk_zaoheding`、`sk_yanqingzhang` |
| 系统依赖 | 招式/IP/门槛归 `design/05`；Buff 归 `design/06`；套装归 `design/07`；地形、六角格战斗/范围、装备分别归 `design/08`–`10`；门派、冲穴、资源营生、称谓资料归 `design/12`、`15`–`17`。其中下游实现与数据定稿尚未全部落盘，本文以作者需求和既有接口为边界 |
| 内容依赖 | `design/18` 登记 50 个 NPC 与招募/跨界状态，`design/story/` 与 `chapters/01`–`08` 等登记 10 个任务占位并落实正邪路线、来源互斥、身份、时代图层、重逢与传承名额；`design/19` / `design/11` 提供正式地图锚点。本文不定义这些系统 |

### 17.3 对基准的修改提案

| 编号 | 状态 / 提案 | 理由 |
|---|---|---|
| WJ-P01 | **已采纳（v1.1，V11-04）**：登记 `ps_*`、`it_miji_*`、`it_canye_*` | 本文 ID 现在直接遵循基准 §12 |
| WJ-P02 | **已采纳（v1.1，V11-29；作者决定 P35）**：两门同名越女剑分立 | 避免教学版品阶和韩小莹传承互相覆盖 |
| X0-P01 | 建议 v1.2 把基准 §6 的 `dualWield（布尔/等级）` 明写为 `int[0,10]` 派生值 | 当前已按 C16 执行，基准文字仍宽泛 |
| X0-P02 | 建议 v1.2 在基准 §7 明写左右互搏归杂学·心神、弓箭归暗器且非核心/不可书眠携带 | 防止后续图鉴再次引入 `dual` 或 `bow` 平行枚举 |

### 17.4 原著考据待办

除本句与文首标注约定外，正文现有“待考”27 次；全文合计 29 次，其中 2 次仅用于说明计数。27 次均归入下列未决事实。剩余标记不作为硬规则依据；涉及招名、传承或投放者先按“原创扩展/默认值”运行，核对后再改文案或来源。

| 类别 | 编号 | 需核对的三联/广州修订版对象 | 当前默认 |
|---|---|---|---|
| 影响规则/来源 | K-R01 | 《倚天屠龙记》史火龙实际练成的降龙掌数及残传描述 | 同 ID 的 `maxLayer 6` 残本不变；掌数不作规则依据 |
| 影响规则/来源 | K-R02 | 《射雕英雄传》君山群丐阵势是否正式称“打狗阵”；彭长老迷魂术与黄蓉反制术的正式名称；“莲花掌”是否为丐帮具名武学及使用者 | 当前 ID 暂保留；无正式名则统一改为原创扩展命名，不改变数值 |
| 影响规则/来源 | K-R03 | 《射雕英雄传》《神雕侠侣》劈空掌的桃花岛归属与陆乘风、冯默风使用场景；程英是否明确施展玉箫剑法、落英神剑掌 | 来源上限暂保留；未证实的传授者移除，武学本身不删 |
| 影响规则/来源 | K-R04 | 《射雕英雄传》《神雕侠侣》“灵蛇杖法”“神驼雪山掌”的正式名与使用者；盘蛇杖毒蛇/机括构造；灵蛇拳的创制动机、使用者与交手 | 蛇杖和人物事实保留；未证实名称按原创扩展命名，机括玩法按原创扩展 |
| 影响规则/来源 | K-R05 | 《天龙八部》六脉剑谱遭毁时点与动作；一阳指“九品”说、枯荣禅功原句、五罗轻烟掌归属及段正淳使用场景 | 不新增传承者；“九品”只作 UI 玩法覆写；未证实武学名改原创扩展 |
| 影响规则/来源 | K-R06 | 《射雕英雄传》九阴总纲语言与译解、正法爪名/经文、白蟒鞭正式名与来源、牛家村疗伤日数及禁忌；《倚天屠龙记》周芷若长鞭是否同源 | 现 ID 暂保留；不以未校勘引文定规则，疗伤和倚天速成的推定部分视为原创扩展 |
| 影响规则/来源 | K-R07 | 《神雕侠侣》中法号慈恩的裘千仞是否再次明确展示踏水轻功 | 慈恩传授来源暂保留，核对失败则改为其铁掌传承的原创扩展来源 |
| 仅影响文本 | K-T01 | 《射雕英雄传》《神雕侠侣》打狗棒各招的施展者与场景，以及空明拳十六字诀的准确字序 | 规则不变；核对前不作逐字引文宣传 |
| 仅影响文本 | K-T02 | 《射雕英雄传》桃花岛门前对联的字序、标点；《神雕侠侣》碧海潮生曲再次使用的对手与场景 | 规则不变，核对后只校正文案 |
| 仅影响文本 | K-T03 | 《天龙八部》六脉六剑剑意的形容词与次序；《神雕侠侣》朱子柳对霍都所书碑帖名目和次序 | 规则与 ID 不变；不把暂录措辞当作校勘引文 |
| 仅影响文本 | K-T04 | 《宋史·李全传》中杨妙真梨花枪评价的准确字句，以及明代枪书追述的谱系 | 梨花枪、火药招式和“将门”串联均视为原创扩展，不宣称与杨再兴同一血缘或谱系 |

### 17.5 开放问题（附默认值）

| # | 问题 | 默认值（无人回复也可继续） |
|---|---|---|
| O-01 | 已解决：CXw 应采用哪个 AR-01 配额？ | 采用 C3 受控配额而非旧 203 门名义缺口；已新增玄 43、黄 56，最终 13/23/71/75=182 |
| O-02 | §12 的 20 套候选是否全部进入正式套装目录？ | 全部保留为候选；`design/07` 可调阈值/奖励但不得单边改成员，跨文档 `setTags` 同步后方可入库 |
| O-03 | 4 个钩子与 7 个条件尚未进入公共 schema 时如何处理？ | 数据构建报显式未实现错误，不静默忽略；原型阶段可关闭对应招式/被动的特殊部分，基础伤害仍按表 |
| O-04 | `it_huoyaotong` 与奇门铁钵如何落库？ | 火药筒先作为 `design/10` 的弹药候选；铁钵继续用 `exotic + kinds:[misc]`，不新造 `bowl` |
| O-05 | 原创分舵、军伍、葛尔丹部来源是否保留？ | 保留并显式标原创扩展；若章节删去，须由通行图鉴补等量合法本土来源，不能只删投放 |
| O-06 | 本轮新增五套的 2/4/7 阈值是否正式采用？ | 保留为**【建议值】**；`design/07` 可调效果和阈值，但成员变更必须同步各武学反向 `setTags` |
