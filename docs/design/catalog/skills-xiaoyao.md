# 门派武学图鉴 · 天龙八部诸派与吐蕃密宗（skills-xiaoyao）

> 归属（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴。
> 上游：`00-canon.md`（§4 品阶、§6 属性 ID、§7 分类、§12 ID、§13 天级总表、§16 改编原则、§20 装配栏）；`design/05-martial-arts-system.md`（SkillDef、层数、招式预算、`aoe_*`、相性、特殊规则、§14 分布约束）；`design/06-buff-system.md`（Buff 目录，本文只引用其中已有 `bf_` ID）；`design/03-attributes.md`（属性、资质、内功贡献、轻功值）；`design/02-timeline-and-world-tiers.md`（书界、境界、天级稀有度 §2.9、同源组 §5.4）。
> 覆盖：逍遥派、灵鹫宫、星宿派、姑苏慕容、吐蕃密宗（大轮寺·金轮一脉·后世番僧）、西夏一品堂、四大恶人、无量剑派、契丹（辽）、聚贤庄、神农帮。其余门派由同事图鉴负责，本文只引用其 ID。
> 标注：**（原创扩展）** = 原著没有；**（待考）** = 原著事实待以三联/广州修订版逐字核对；`origin` 取 `canon` / `expanded` / `canonExpanded`（05 §2.1）。

---

## 0. 本文约定

| 项 | 约定 |
|---|---|
| 招式倍率 | 全部按 05 §4.2：`power = AF × (1+Σadj) × K_delivery × K_parry − Σcost`，允许 ±0.05 手调。"核算"列简写：`cd1 +.12`、`内+1% +.05`、`收+100 +.07`、`远 ×.85`、`投 ×.92`、`不架 ×.85`、`条件常 +.15 / 罕 +.30`、`控 −.25×率`、`封 −.20×率`、`伤类 −.10×率`、`自益 −.10~.20`、`退 −.05/格`、`拉/突/跳 −.10`、`绕/换 −.15` |
| 绝招 | `3.00 × AF × K − Σcost`；耗内 = 大阶基准 + 2%、收招 1200 为默认，不再计 adj（05 §4.8 与 §13 示例的算法）；核心武学首个绝招 ≤ 第 7 重（05 §3.5 硬规则） |
| 本文建议计价 | 06 尚未给 Buff 价值，以下三项先按建议值计价并登记于 §16：剧毒 `bf_judu`、寒毒 `bf_handu` 按 DOT 1.5 倍（0.15×率）；受制类 `bf_shengsifu` 按控制 2 倍（0.50×率） |
| 耗内 | 比例 × `MPREF(显示等级)`（05 §4.1）；大阶基准 黄 5% / 玄 6% / 地 7% / 天 8% |
| 附带 Buff | 品阶一律 `inherit`（= 本武学有效品阶，05 §2.6）；持续后缀 `⁺` = 地/天阶 +1（06 §2.1.1）；只引用 06 已有 `bf_` ID |
| 层数 | 按有效层数解锁；"大成"指第 10 重被动；"绝招 +20%"= 10 重大成被动在 Z1 招式倍率上乘算（05 §4.8） |
| 招式数量 | 按 05 §3.5 数量规范（普通招式 黄 2–3 / 玄 3–5 / 地 4–7 / 天 5–10，被动 黄 1–2 / 玄 2–4 / 地 3–4 / 天 4–7）；内功只配 1–4 个运功招式（05 §3.5 注）；轻功与杂学按 05 §2.1 `moves`"可为空"放宽下限，暗器仍守下限；黄阶第 10 重"圆满"以 `layerStats` 满值体现，不另设被动 |
| 内功贡献 | 第 10 重主运值；IP = `mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen`，须在品阶预算 ±5% 内（05 §5.5） |
| 轻功贡献 | `Q_skill = QS(g) × (0.40 + 0.06×层)`（03 §4.5），本文只写 10 重值 QS |
| ID | 基准 §13 与上游已用 ID 一律沿用（如 `sk_huagong`）；新 ID 取武学名全拼，以"剑法/刀法/掌力/大法/术/阵"等通名收尾且去掉后仍 ≥ 3 字者省略通名（沿用 05 `sk_quanzhenjian` 之例）；招式 `mv_<武学拼音>_<招式拼音>`；被动 `ps_<武学拼音>_<拼音>`（05 P-4） |
| 占位 | 任务 `q_NN_<类>_7x`、NPC `npc_*`、物品 `it_*`/`eq_*` 为建议 ID，由 chapters/、design/10、design/12 定稿 |
| 跨组引用 | `sk_yijinjing`（少林）、`sk_xianglong18`（丐帮）、`sk_taizuchangquan`（通用）、`sk_yiyangzhi`/`sk_liumai`（大理）、少林七十二绝技（`lg_shaolin72`，ID 由少林图鉴定）只引用，不定义 |

---

## 1. 本组门派一览

| 门派 ID | 门派 | 出现书界 | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 |
|---|---|---|---|---|---|---|---|---|
| `sect_xiaoyao` | 逍遥派 | 天龙 | 超然（正邪之间） | 无量山琅嬛福地、擂鼓山、西夏皇宫（李秋水） | 无崖子、天山童姥、李秋水、苏星河、虚竹、函谷八友 | 轻灵飘逸，以内功为本，化用百家 | 三老三性：北冥阴、小无相调和、童姥一系阳 | 可：擂鼓山棋会后拜苏星河/函谷八友入门（原创扩展）；掌门为虚竹（锚点，不可顶替） |
| `sect_lingjiu` | 灵鹫宫 | 天龙 | 偏邪 → 虚竹接掌后转正 | 天山缥缈峰 | 天山童姥、虚竹、梅兰竹菊四剑、九天九部首领、三十六洞七十二岛（属下） | 剑阵、暗器、以生死符驭众 | 阳 | 女性主角可入宫；男性主角经虚竹线为"灵鹫宫客卿"受艺（原创扩展） |
| `sect_xingxiu` | 星宿派 | 天龙 | 邪 | 西域星宿海 | 丁春秋、摘星子、狮吼子、阿紫 | 用毒、化功、门人吹捧成风 | 阴 | 可：星宿弟子（`morality ≤ −10`） |
| `sect_murong` | 姑苏慕容 | 天龙 | 正邪之间（复国之志） | 姑苏燕子坞（参合庄、还施水阁、听香水榭、琴韵小筑）；曼陀山庄 | 慕容博、慕容复、邓百川、公冶乾、包不同、风波恶、阿朱、阿碧、王语嫣 | 以彼之道，还施彼身；博通百家 | 调和（斗转随辅运） | 可：燕子坞门客/家臣（原创扩展） |
| `sect_mizong` | 吐蕃密宗 | 天龙、神雕、倚天、鹿鼎 | 多为敌对 | 大雪山大轮寺（天龙）；蒙古国师帐下（神雕）；元廷番僧寺院（倚天，待考）；西藏（鹿鼎） | 鸠摩智、金轮法王、达尔巴、霍都、桑结 | 刚猛火劲、法器、咒音 | 阳 | 可：大轮寺俗家护法（天龙，原创扩展）/ 金轮法王门下（神雕，敌对路线）/ 番僧（倚天、鹿鼎） |
| `sect_yipintang` | 西夏一品堂 | 天龙 | 敌对（西夏官署） | 西夏兴庆府 | 赫连铁树、努儿海、（化名李延宗之）慕容复 | 军阵、毒烟 | 阳 | 可：应一品堂招贤（西夏线，原创扩展） |
| `sect_sidaeren` | 四大恶人 | 天龙 | 邪 | 无定所（大理、万劫谷一带） | 段延庆、叶二娘、岳老三（南海鳄神）、云中鹤 | 各行其是：杖指、薄刀、鳄剪、轻功 | 阳/阴不一 | 否（非门派）；仅"岳老三收徒"（南海派）与段延庆邪派路线可受艺 |
| `sect_wuliang` | 无量剑派 | 天龙 | 正（小派） | 大理无量山剑湖宫 | 左子穆（东宗）、辛双清（西宗） | 剑法；世代观摩玉壁剑影 | 调和 | 可：东宗/西宗弟子（天龙开局可选） |
| `sect_qidan` | 契丹（辽） | 天龙 | 中立（国家势力） | 辽上京、南京（析津府）、辽东 | 萧峰、萧远山、耶律洪基 | 搏兽、骑射、长枪、擒拿 | 阳 | 可：辽国军职（萧峰南院大王线） |
| `sect_juxianzhuang` | 聚贤庄 | 天龙 | 正 | 聚贤庄（所在地待考） | 游骥、游驹（游氏双雄）、游坦之 | 盾刀、合围；冰蚕寒毒 | 阳（游坦之一脉阴） | 可：庄客（英雄大会锚点之前） |
| `sect_shennong` | 神农帮 | 天龙 | 偏邪（受灵鹫宫生死符挟制） | 澜沧江畔、无量山 | 司空玄 | 药锄、毒药、药理 | 调和 | 可：帮众 |

本组合计 **72 门**（天 10 / 地 18 / 玄 22 / 黄 22），分布于天龙（69 门可习得）、神雕（7）、倚天（4）、鹿鼎（4）。统计见 §14。

---

## 2. 逍遥派 `sect_xiaoyao`

### 2.1 门派简介

- **来历**：以《庄子·逍遥游》为宗旨的隐世门派，祖师逍遥子事迹不详（待考）。无崖子、天山童姥、李秋水同门三人因情生怨，门派分崩：无崖子遭弟子丁春秋暗算致残，隐于擂鼓山三十年，由大弟子苏星河装聋作哑守护，设"珍珑棋局"择传人；虚竹误打误撞解开珍珑，得无崖子七十余年功力与七宝指环，继为掌门。丁春秋叛出另立星宿派（§4）。函谷八友为苏星河弟子，各精琴棋书画医工等杂学。童姥、李秋水于西夏皇宫冰窖同归于尽（锚点）。
- **时代变迁与强弱**：只在天龙（1093–1094）活跃，是本书界天级武学最密集的一系（北冥、小无相、凌波、六阳、折梅）；此后原著未载传人，本作不在后续书界复现（02 §5.7"只在原生书界出现一次"），携带与残篇是唯一延续方式。
- **稀有度**：受 02 §2.9 R4"逍遥系（北冥/小无相/八荒/六阳/折梅/生死符/凌波）单周目至多取 3"约束；无量山玉洞为天龙唯一 `earlyException`（第 3 幕前修炼经验 ×0.5）。
- **玩家入口（原创扩展）**：①无量山玉洞奇遇（北冥残卷、凌波）；②擂鼓山棋会后拜苏星河/函谷八友入门（rank 1–2）；③随虚竹上缥缈峰后，由虚竹以掌门身份授艺（rank 3–4）。
- **同源组**：北冥神功属 `lg_beiming`（与化功大法、吸星大法，02 §5.4）。

### 2.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_beiming` | 北冥神功 | 内功/心法 | 12 天上 | 阴 | 0/1 | 天龙 | 奇遇（玉洞帛卷，残至 6 重）；拜师虚竹（10 重） | 原著 |
| `sk_xiaowuxiang` | 小无相功 | 内功/心法 | 11 天中 | 调和 | 0/1 | 天龙 | 拜师李秋水；奇遇（鸠摩智枯井后赠诀，至 8 重） | 原著 |
| `sk_lingbo` | 凌波微步 | 轻功 | 11 天中 | — | — | 天龙 | 奇遇（玉洞帛卷） | 原著 |
| `sk_liuyangzhang` | 天山六阳掌 | 拳脚/拳掌 | 11 天中 | 阳 | 0.35/0.65 | 天龙 | 拜师童姥/虚竹；解谜（灵鹫宫石壁，至 8 重） | 原著 |
| `sk_zhemei` | 天山折梅手 | 拳脚/擒拿 | 10 天下 | 调和 | 0.5/0.5 | 天龙 | 拜师童姥/虚竹；解谜（灵鹫宫石壁，至 8 重） | 原著 |
| `sk_baihongzhang` | 白虹掌力 | 拳脚/拳掌 | 9 地上 | 阴 | 0.3/0.7 | 天龙 | 拜师李秋水；秘籍（曼陀山庄琅嬛玉洞，至 7 重） | 原著（招式原创扩展） |
| `sk_langhuanjian` | 琅嬛剑法 | 兵器/剑 | 7 地下 | 调和 | 0.6/0.4 | 天龙 | 解谜（无量玉壁剑影 7 重；琅嬛福地石室 10 重） | 原创扩展（本于玉壁剑影） |
| `sk_chuanyinsouhun` | 传音搜魂大法 | 杂学/音功 | 6 玄上 | 阴 | 0/1 | 天龙 | 拜师李秋水 | 原著（效果原创扩展） |
| `sk_zuowangxinfa` | 坐忘心法 | 内功/心法 | 5 玄中 | 调和 | 0/1 | 天龙 | 拜师苏星河/函谷八友（rank 1） | 原创扩展 |
| `sk_fuyaotui` | 扶摇腿 | 拳脚/腿法 | 3 黄上 | 中性 | 0.8/0.2 | 天龙 | 拜师函谷八友（rank 1）；秘籍 | 原创扩展 |
| `sk_xiaoyaobu` | 逍遥步 | 轻功 | 2 黄中 | — | — | 天龙 | 拜师苏星河（rank 1） | 原创扩展 |

### 2.3 天级与地阶条目卡

#### `sk_beiming` 北冥神功（天阶上品 · 内功 · 阴）

- **简述**：段誉于无量山琅嬛福地玉洞得帛卷，卷首引《庄子·逍遥游》"北冥"之喻，以吸人内力为己用，"百川汇海"（天龙；帛卷原文逐字待考）。无崖子以之传功虚竹。性质定"阴"为游戏化判断（北方冥海属水）。
- **字段**：`origin canon` · `sect sect_xiaoyao` · `lineage 逍遥子（待考）→ 无崖子 → 段誉（帛卷）/ 虚竹（传功）` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · 同源 `lg_beiming`
- **reqs**：`attrs {wis: 55, con: 50}`、`aptitude {apInner: 55}`；硬门槛随途径（拜师须 `sect_xiaoyao` rank 3）
- **内功贡献**：`mpMaxPct 72 · hpMaxPct 26 · attrs {wil 8, wis 6, con 4} · mpRegen 4.4` → IP 72+26+36+22 = **156**（天上 156）；`stats {resInjury 10, defIn 10}`
- **层数**：1 北冥真气｜3 鲲吞｜4 百川归海｜5 传功、反客为主｜**7 绝招·天池纳川**｜8 海纳百川｜10 北冥归元

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 鲲吞（原创扩展命名） | `mv_beiming_kuntun` | 3 | 攻 | `aoe_single` 近 1 | 0.85 | 6% | 1 | 1000 | `effects: drainMp{pctOfDamage: 0.25}` | ✅ | 1+.12−.10=1.02；吸内自益 −.15 → .87 |
| 传功（原著无崖子传功之意） | `mv_beiming_chuangong` | 5 | 援 | `aoe_single` 友 1 | — | 12% | 3 | 900 | 目标回复施者 mpMax 15% 内力；驱散 `injury.qi` 1 | — | 支援：以 12% 换 15%，另给 1 次驱散 |
| 天池纳川（绝招，原创扩展命名） | `mv_beiming_tianchi` | 7 | 攻·绝 | `aoe_around` | 1.80 | 10% | — | 1200 | `drainMp{pctOfDamage: 0.5}`；溢出入护体（由北冥真气结算） | ✅ | 3.00×.65=1.95；自益 −.15 |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 北冥真气 | `ps_beiming_zhenqi` | 1 | effect | 装配即得 `bf_beiming`（吸内·纳，06 §8.3） | scaled（吸取量 × auxRatio） |
| 百川归海 | `ps_beiming_baichuan` | 4 | mechanic | 北冥吸取溢出上限的内力，转护体比例 50% → 100%（仍受 `shieldMax`） | none |
| 反客为主 | `ps_beiming_fanke` | 5 | effect | 被擒拿/爪类招式命中时，受击吸内量 ×2 且不占每回合次数（原著：枯井中鸠摩智擒段誉，内力反被吸尽） | full |
| 海纳百川 | `ps_beiming_haina` | 8 | mechanic | 免疫品阶 ≤ 自身的 `bf_huagong_qin`（化功侵体） | full |
| 北冥归元（大成） | `ps_beiming_guiyuan` | 10 | mechanic | 主运时战斗结束回复 30% 内力；单场累计吸取 ≥ 自身 mpMax 50% → 永久 mpMax +0.2%（每书界 ≤ +3%，计入 03 §5.1 永久 mpMax 共享上限） | none |

- **setTags**：`[set_xiaoyao_xiaoyaoyou, set_xiaoyao_xuzhu]`
- **conflicts**：`{with: sk_huagong, type: exclusive}`（05 §9.2 已定）；`{with: sk_xixing, type: synergy}`（北冥主运时吸星不生异种真气，05 §9.2、06 §8.3）
- **learnSources**：`qiyu ch01 q_01_qiyu_71`（无量山玉洞帛卷，maxLayer 6，`earlyException`；帛卷嘱"磕首千遍"作为触发互动，致敬原著）；`master ch01 npc_xuzhu`（珍珑锚点后，逍遥派/灵鹫宫 rank 3 且虚竹羁绊 ≥ 3，maxLayer 10）
- **特殊**：无代价；"越吸越厚"以大成被动的小额永久成长体现，数额受 03 共享上限约束。

#### `sk_xiaowuxiang` 小无相功（天阶中品 · 内功 · 调和）

- **简述**：李秋水一系内功，"无相"者不着形迹，可借以催动他派武功而不露本来面目；吐蕃国师鸠摩智亦习此功，并以之催动少林七十二绝技，终被识破为逍遥派功夫（天龙；识破者与回目待考）。
- **字段**：`origin canon` · `sect sect_xiaoyao` · `lineage 逍遥派 → 李秋水；（旁支）鸠摩智` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · `inner.auxOverride 0.50`（05 §5.2 原创扩展设定）· 调和且品阶 ≥ 7，天然为**桥接**内功（05 §5.4）
- **reqs**：`attrs {wis: 60, agi: 50}`、`aptitude {apInner: 55}`；硬门槛：`sect_xiaoyao` rank 3 或李秋水好感 ≥ 60
- **内功贡献**：`mpMaxPct 46 · hpMaxPct 28 · attrs {wis 8, wil 7, agi 6} · mpRegen 3.9` → IP 46+28+42+19.5 = **135.5**（天中 135.5）；`stats {resMind 10, effRes 10}`
- **层数**：1 无相｜3 拟形｜4 隐迹｜5 无相劲｜6 化生百家｜**7 绝招·无相无我**｜8 小无相护体｜10 无相大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 拟形（原创扩展命名） | `mv_xiaowuxiang_nixing` | 3 | 架势 | `aoe_self` | — | 6% | 3 | 800 | `bf_wupozhan` 2；`bf_ruiyi` 2 | — | 自身增益 |
| 无相劲（原创扩展命名） | `mv_xiaowuxiang_wuxiangjin` | 5 | 攻 | `aoe_single` 远 1–3 | 0.93 | 9% | 2 | 1000 | — | ❌ | 1+.24+.05=1.29 ×.85 ×.85 = .93 |
| 无相无我（绝招，原创扩展命名） | `mv_xiaowuxiang_wuwo` | 7 | 援·绝 | `aoe_self` | — | 10% | — | 1200 | 驱散自身减益 2（≤ 本品阶）；`bf_wupozhan` 3；`bf_mian_xin` 2；`restoreMp{pct: 0.2, selfOnly: true}` | — | 内功绝招以自身效果为主（05 §4.8） |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 无相 | `ps_xiaowuxiang_wuxiang` | 1 | stat（Z5） | 主运时：阳/阴招式相性 +4% → +8%，中性招式 +2% → +8%（调和招式维持 +12%，05 §5.3） | none |
| 隐迹 | `ps_xiaowuxiang_yinji` | 4 | mechanic | 敌方对你的观摩领悟 −50%；敌方图鉴"见识"你的招式时只显示"无相" | full |
| 化生百家 | `ps_xiaowuxiang_baijia` | 6 | mechanic | 你的观摩领悟 ×1.5；观摩习得武学的 sourceCap 6 → 8（原著鸠摩智"以小无相功催动诸般绝技"之意） | full |
| 小无相护体 | `ps_xiaowuxiang_huti` | 8 | trigger | `battleStart` → `bf_hutizhenqi {shieldPctHpMax: 0.06→0.12}`（按层插值） | none |
| 无相大成 | `ps_xiaowuxiang_dacheng` | 10 | mechanic | 主运时两门辅运比例各 +0.05（上限 0.60）；作辅运时固定比例 0.50 → 0.55 | full |

- **setTags**：`[set_xiaoyao_xuzhu, set_mizong_mingwang]`
- **conflicts**：无定稿条目。与少林七十二绝技的关系以 `skills-shaolin` §1.3.1"戾气"规则为准（该文已定：主运小无相功时鸠摩智冒用的无相劫指 `sk_wuxiangjiezhi` 不计戾气、观摩上限 8 重），本文不另设增伤，避免双重加成
- **learnSources**：`master ch01 npc_liqiushui`（西夏线，冰窖锚点前，maxLayer 10）；`qiyu ch01 q_01_qiyu_73`（鸠摩智枯井大彻大悟后以口诀相赠，原创扩展，maxLayer 8）；`master ch01 npc_xuzhu`（maxLayer 8，**待考**：虚竹经无崖子传功是否兼通小无相功，若原著无据则删去此途径）

#### `sk_lingbo` 凌波微步（天阶中品 · 轻功）

- **简述**：玉洞帛卷所载步法，名出曹植《洛神赋》"凌波微步，罗袜生尘"，依伏羲六十四卦方位行走；段誉屡以此脱身（天龙）。起步卦位与"行步即运转内息"之说逐字待考。
- **字段**：`origin canon` · `sect sect_xiaoyao` · `lineage 无崖子一系 → 段誉（帛卷）` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · 轻功贡献 **QS 152**（03 §4.5：天龙唯一可达 qg5 的原生轻功，05 §14.6-7"天龙最高天中"）
- **reqs**：`attrs {agi: 55, wis: 50}`、`aptitude {apLight: 55}`；无硬门槛（奇遇途径）
- **层数**：1 残影、体迅飞凫｜3 六十四卦｜4 飘忽若神｜5 罗袜生尘｜7 将飞未翔、逃命要诀｜10 凌波大成（非核心武学，不受"绝招 ≤ 7 重"约束，本武学无绝招）

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 体迅飞凫（洛神赋句） | `mv_lingbo_feifu` | 1 | 位移 | 自身移动 ≤ mov+2 格，可穿越敌方控制区 | — | 4% | 2 | 800 | 单次移动 ≥ 3 格则残影 +1 | — | 非攻击 |
| 飘忽若神（洛神赋句） | `mv_lingbo_piaohu` | 4 | 架势 | `aoe_self` | — | 5% | 3 | 800 | `bf_youshi` 3 | — | — |
| 将飞未翔（洛神赋"若将飞而未翔"） | `mv_lingbo_jiangfei` | 7 | 位移 | 跃至 4 格内空格，高差 ≤ jump+3 | — | 5% | 3 | 900 | 落地 `bf_piaohu` 2 | — | — |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 残影 | `ps_lingbo_canying` | 1 | mechanic | 装配时常驻 `bf_canying`（06 §8.9：天阶上限 3 层；单次移动 ≥ 3 格回合末 +1 层） |
| 六十四卦 | `ps_lingbo_guabu` | 3 | mechanic | 移动可穿越敌方单位所在格（不可停留）；不触发 `bf_jieji`（截击）与控制区 |
| 罗袜生尘 | `ps_lingbo_luowa` | 5 | effect | 每移动 1 格回复 0.5% mpMax（每回合 ≤ 3%） |
| 逃命要诀 | `ps_lingbo_taoming` | 7 | trigger | 气血首次 < 30% → `bf_dunzou` 2（每战 1 次） |
| 凌波大成 | `ps_lingbo_dacheng` | 10 | mechanic | 残影上限 +1（4 层）；可在深水格停留 1 回合（与 03 §4.5 的 qg5 门禁一致） |

- **setTags**：`[set_xiaoyao_xiaoyaoyou]`；**conflicts**：无
- **learnSources**：`qiyu ch01 q_01_qiyu_71`（玉洞帛卷，maxLayer 10；`earlyException`，第 3 幕前修炼 ×0.5）
- **特殊**：非核心，不可携带（基准 §3 规则 1），书眠后转为残篇。

#### `sk_liuyangzhang` 天山六阳掌（天阶中品 · 拳脚·掌 · 阳）

- **简述**：天山童姥绝学，纯阳掌力；生死符即以此掌力"化水为冰"而成，故唯六阳掌能拔除生死符——虚竹在灵鹫宫为群豪逐一拔符（天龙）。"阳歌天钧""阳关三叠"见于虚竹对敌诸回（待考），其余招名为原创扩展，统一以"阳"字起首。
- **字段**：`origin canon` · `sect sect_xiaoyao`（灵鹫宫同传）· `lineage 逍遥派 → 天山童姥 → 虚竹` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · `layerStats {parry: [2, 8], resCold: [2, 12]}`（合计 20）
- **reqs**：`attrs {con: 55, wis: 50}`、`aptitude {apFist: 60}`、`sect {sect_lingjiu 或 sect_xiaoyao, rank: 3}`；`hard: [sect]`
- **层数**：1 阳歌天钧、阳关三叠、纯阳｜2 阳春白雪｜4 阳和启蛰、化冰｜5 拔符、知符｜6 阳燧｜**7 绝招·六阳归一**｜8 天钧｜10 六阳大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 阳歌天钧（原著，待考） | `mv_liuyangzhang_yangge` | 1 | 攻 | `aoe_single` 近 1 | 1.00×2 段 | 8% | 0 | 1000 | — | ✅ | 基准 1.00 |
| 阳关三叠（原著，待考） | `mv_liuyangzhang_yangguan` | 1 | 攻 | `aoe_single` 近 1 | 1.15×3 段 | 9% | 1 | 1000 | — | ✅ | 1+.12+.05=1.17 |
| 阳春白雪 | `mv_liuyangzhang_yangchun` | 2 | 援 | `aoe_single` 友 0–1 | — | 8% | 2 | 1000 | 驱散 `cold` 2（≤ 本品阶）；治疗目标 hpMax 10% | — | 标准治疗 18% 折去 2 次驱散 |
| 阳和启蛰 | `mv_liuyangzhang_qizhe` | 4 | 攻 | `aoe_cone n2` | 0.95 | 10% | 2 | 1000 | 击退 1 | ✅ | .75×(1+.24+.10)=1.005 −.05 |
| 拔符 | `mv_liuyangzhang_bafu` | 5 | 援 | `aoe_single` 友 1 | — | 12% | 3 | 1000 | `special` 驱散 `bind.shengsi` 1（≤ 本品阶） | — | 唯一拔符招式（06 §7.1） |
| 阳燧 | `mv_liuyangzhang_yangsui` | 6 | 攻 | `aoe_single` 远 1–3 | 0.95 | 9% | 1 | 1000 | `bf_zhuoshao` 30%·2⁺ | ✅ | 1.17×.85=.995 −.03 |
| 六阳归一（绝招，原创扩展命名） | `mv_liuyangzhang_liuyang` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.85×6 段 | 10% | — | 1200 | `bf_xuanyun` 50%·1 | ✅ | 3.00 − .25×.5 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 纯阳 | `ps_liuyangzhang_chunyang` | 1 | stat（Z3） | 对持有 `cold` 标签效果或寒类护体的目标，本武学伤害 +8% → +20%（冰火相克） |
| 化冰 | `ps_liuyangzhang_huabing` | 4 | effect | 每回合 S5 自动驱散自身 1 个 `cold` 标签减益（`skill` 型，品阶 inherit） |
| 知符 | `ps_liuyangzhang_zhifu` | 5 | mechanic | 自身所中 `bf_shengsifu` 发作伤害 −50%；战斗外可为他人拔符（服务，须品阶 ≥ 符） |
| 天钧 | `ps_liuyangzhang_tianjun` | 8 | stat | 主运为阳时本武学暴击 +10（`attr:crit flat`） |
| 六阳大成 | `ps_liuyangzhang_dacheng` | 10 | mechanic | 绝招 +20%；本武学命中时 25% 破除目标 1 个 `guard` 增益（`purge`，品阶 inherit） |

- **setTags**：`[set_xiaoyao_xuzhu]`
- **conflicts**：`{with: sk_shengsifu, type: counter, note: 唯一可拔除生死符（06 §7.1）}`
- **learnSources**：`master ch01 npc_tonglao`（童姥线，冰窖同归锚点前，童姥好感 ≥ 60，maxLayer 10）；`master ch01 npc_xuzhu`（maxLayer 10）；`puzzle ch01 q_01_side_72`（灵鹫宫石壁图谱，maxLayer 8）

#### `sk_zhemei` 天山折梅手（天阶下品 · 拳脚·擒拿 · 调和）

- **简述**：童姥于逃避追杀途中传虚竹的逍遥派高深武功，掌法与擒拿合一，共分六路，诸般兵刃绝招尽可化在其中；内功越深、见识越广，越练越强（天龙；传授地点与口诀原文待考）。六路招名为原创扩展，取"折梅"意象。
- **字段**：`origin canon` · `sect sect_xiaoyao`（灵鹫宫同传）· `lineage 逍遥派 → 天山童姥 → 虚竹` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · `layerStats {seal: [2, 10], parry: [2, 10]}`（20）
- **reqs**：`attrs {agi: 50, wis: 55}`、`aptitude {apGrapple: 55}`、`sect {sect_lingjiu 或 sect_xiaoyao, rank: 2}`；`hard: [sect]`
- **层数**：1 折梅式、探梅夺刃、化用百家｜2 踏雪寻梅｜3 空手入白刃｜4 疏影横斜｜5 暗香浮动｜6 六路圆转｜**7 绝招·梅开六出**｜10 折梅大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 折梅式 | `mv_zhemei_zhemei` | 1 | 攻 | `aoe_single` 近 1 | 0.95 | 8% | 0 | 1000 | `bf_fengjingmai` 25%·2（封目标主用大类） | ✅ | 1.00 − .20×.25 |
| 探梅夺刃 | `mv_zhemei_tanmei` | 1 | 攻 | `aoe_single` 近 1；`condition {targetArmed}` | 1.30 | 9% | 2 | 1000 | `bf_jiaoxie` 60% | ✅ | 1+.15+.24+.05=1.44 −.25×.6 |
| 踏雪寻梅 | `mv_zhemei_xunmei` | 2 | 架势 | `aoe_self`；`trigger meleeAttacked` | 反击 0.90 | 5% | 2 | 900 | 反击附 `bf_waigong_jiang` 50%·2⁺；`effects: stanceCounter{counterPower: 0.9, expires: nextOwnAction}` | — | 同 05"或跃在渊"模式 |
| 疏影横斜 | `mv_zhemei_shuying` | 4 | 攻 | `aoe_single` 近 1 | 1.05 | 8% | 1 | 1000 | `bf_fengxue` 35%·1 | ✅ | 1.12 − .20×.35 |
| 暗香浮动 | `mv_zhemei_anxiang` | 5 | 攻 | `aoe_sweep` | 1.00 | 10% | 2 | 1000 | — | ✅ | .75×1.34=1.005 |
| 梅开六出（绝招） | `mv_zhemei_liuchu` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.80×6 段 | 10% | — | 1200 | `bf_fengjingmai` 100%·2 | ✅ | 3.00 − .20 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 化用百家 | `ps_zhemei_huayong` | 1 | stat（Z3） | 图鉴中已"见识"的武学子类（基准 §7，共 24 个子类）每 1 类 +1%，上限 4% → 12%（按层插值；原著"天下武功皆可化入折梅手"） |
| 空手入白刃 | `ps_zhemei_kongshou` | 3 | effect（Z0） | 攻击持兵器目标时其招架率 ×0.85；自身被缴械时本武学不受影响 |
| 六路圆转 | `ps_zhemei_liulu` | 6 | stat（Z3） | 连续两次以**不同**折梅招式命中同一目标，第二招 +15% |
| 折梅大成 | `ps_zhemei_dacheng` | 10 | mechanic | 绝招 +20%；招式栏 +1；每场首次被施加 `bf_jiaoxie` / `bf_fengjingmai` 时立即解除 |

- **setTags**：`[set_xiaoyao_xiaoyaoyou, set_xiaoyao_xuzhu]`；**conflicts**：无
- **learnSources**：`master ch01 npc_tonglao`（maxLayer 10）；`master ch01 npc_xuzhu`（maxLayer 10）；`puzzle ch01 q_01_side_72`（灵鹫宫石壁，maxLayer 8）

#### `sk_baihongzhang` 白虹掌力（地阶上品 · 拳脚·掌 · 阴）

- **简述**：李秋水的掌力，能曲能直、绕物伤人，西夏皇宫冰窖中与童姥相搏时所用（天龙；"曲直如意"原文待考）。招式效果为原创扩展。
- **字段**：`origin canon` · `sect sect_xiaoyao` · `lineage 李秋水` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `layerStats {hit: [1, 8], crit: [1, 7]}`（15）
- **reqs**：`attrs {agi: 45, wis: 45}`、`aptitude {apFist: 45}`、`sect {sect_xiaoyao, rank: 3}` 或李秋水羁绊 ≥ 3；`hard: [sect]`
- **层数**：1 白虹贯日、曲直如意（招）、曲直如意（被动）｜2 寒虹｜4 虹贯背心、秋水寒虹｜5 冰窖寒掌｜**7 绝招·白虹万道**｜8 秋水无痕｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 白虹贯日 | `mv_baihongzhang_guanri` | 1 | 攻 | `aoe_single` 远 1–4 | 0.85 | 7% | 0 | 1000 | — | ✅ | 1.00×.85 |
| 曲直如意 | `mv_baihongzhang_quzhi` | 1 | 攻 | `aoe_chain n2` 远 1–3 | 0.80 | 8% | 1 | 1000 | — | ✅ | .80×1.17×.85=.796 |
| 寒虹 | `mv_baihongzhang_hanhong` | 2 | 攻 | `aoe_single` 远 1–3 | 0.90 | 7% | 1 | 1000 | `bf_hanqi` 60%·2 层 | ✅ | 1.12×.85=.952 −.06 |
| 虹贯背心 | `mv_baihongzhang_guanbei` | 4 | 攻 | `aoe_single` 远 1–3；判定视为背击（06 `modJudge asBack`） | 0.95 | 8% | 2 | 1000 | — | ✅ | 1.29×.85=1.097 − 绕背等价 .15 |
| 冰窖寒掌 | `mv_baihongzhang_bingjiao` | 5 | 攻 | `aoe_cross r1`（目标点远 1–3） | 0.70 | 9% | 2 | 1000 | `bf_hanqi` 50% | ✅ | .65×1.34×.85=.740 −.05 |
| 白虹万道（绝招，原创扩展命名） | `mv_baihongzhang_wandao` | 7 | 攻·绝 | `aoe_multi n6 r2`（目标点远 1–4） | 2.15×6 段 | 9% | — | 1200 | — | ✅ | 3.00×.85×.85=2.17 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 曲直如意 | `ps_baihongzhang_quzhi` | 1 | mechanic | 本武学 `ranged` 招式可绕过墙体与单位（不受视线阻挡，射程不变）；需新增效果钩子 `curveLos`（§16 D-1） |
| 秋水寒虹 | `ps_baihongzhang_hanhong` | 4 | stat（Z3） | 对持有 `cold` 标签效果的目标 +5% → +12% |
| 秋水无痕 | `ps_baihongzhang_qiushui` | 8 | stat | 主运为阴时本武学暴击 +8 |
| 白虹大成 | `ps_baihongzhang_dacheng` | 10 | mechanic | 绝招 +20%；本武学 `ranged` 招式射程 +1 |

- **setTags**：`[set_xiaoyao_xiaoyaoyou]`；**conflicts**：无
- **learnSources**：`master ch01 npc_liqiushui`（maxLayer 10）；`manual ch01 it_miji_baihongzhang`（曼陀山庄琅嬛玉洞藏本，原创扩展，maxLayer 7）

#### `sk_langhuanjian` 琅嬛剑法（地阶下品 · 兵器·剑 · 调和）（原创扩展）

- **简述**：无量山剑湖后山玉壁上，月夜映出一男一女舞剑之影——实为无崖子与李秋水当年在此对剑所留（天龙；玉壁显影的成因与时辰待考）。无量剑派数十年观壁不得其要；本作将二人所使之剑定名"琅嬛剑法"（原创扩展），以解谜方式取得。
- **字段**：`origin expanded` · `sect sect_xiaoyao` · `lineage 无崖子、李秋水（玉壁剑影）` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: sword}` · `layerStats {eva: [1, 7], hit: [1, 8]}`（15）
- **reqs**：`attrs {agi: 45, wis: 45}`、`aptitude {apSword: 45}`；无硬门槛（解谜途径）
- **层数**：1 仙影、双影、剑随影动｜3 洞天｜4 对影成双｜5 玉像回眸｜**7 绝招·凌虚御剑**｜8 仙影无踪｜10 琅嬛大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 仙影 | `mv_langhuanjian_xianying` | 1 | 攻 | `aoe_single` 近 1 | 1.00 | 7% | 0 | 1000 | — | ✅ | 基准 |
| 双影 | `mv_langhuanjian_shuangying` | 1 | 攻 | `aoe_single` 近 1；出招后后撤 1 格 | 1.00×2 段 | 7% | 1 | 1000 | — | ✅ | 1.12 − 自身位移 .10 |
| 洞天 | `mv_langhuanjian_dongtian` | 3 | 攻 | `aoe_sweep` | 0.90 | 8% | 1 | 1000 | — | ✅ | .75×1.17=.878 |
| 玉像回眸 | `mv_langhuanjian_huimou` | 5 | 架势 | `aoe_self`；`trigger meleeAttacked` | 反击 1.00 | 5% | 2 | 900 | 反击附 `bf_mihuo` 15%·1；`stanceCounter{counterPower: 1.0, expires: nextOwnAction}` | — | 反击型 |
| 凌虚御剑（绝招） | `mv_langhuanjian_lingxu` | 7 | 攻·绝 | `aoe_dash n4 through` | 2.30 | 9% | — | 1200 | — | ✅ | 3.00×.80 − .10 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 剑随影动 | `ps_langhuanjian_suiying` | 1 | stat（Z3） | 本回合已移动 ≥ 2 格时 +4% → +10% |
| 对影成双 | `ps_langhuanjian_duiying` | 4 | stat（Z3） | 2 格内有装配本武学或玉壁剑法（`sk_yubijian`）的友方时 +8%（不叠加） |
| 仙影无踪 | `ps_langhuanjian_wuzong` | 8 | trigger | 闪避成功后，下一次本武学招式暴击 +15 |
| 琅嬛大成 | `ps_langhuanjian_dacheng` | 10 | mechanic | 绝招 +20%；每场首次施放绝招后获得 `bf_canying` 1 层（装配凌波微步时 2 层） |

- **setTags**：`[set_xiaoyao_xiaoyaoyou]`；**conflicts**：无
- **learnSources**：`puzzle ch01 q_01_side_71`（无量玉壁剑影：月夜观壁，`wis ≥ 50`，maxLayer 7）；`puzzle ch01 q_01_qiyu_71`（琅嬛福地石室，maxLayer 10）

### 2.4 玄阶 / 黄阶（紧凑）

> 黄阶被动按 05 §3.5 数量规范取 2 条（第 1、7 重），第 10 重"圆满"以 `layerStats` 满值体现；玄阶取 2–3 条。

**`sk_chuanyinsouhun` 传音搜魂大法**（6 玄上 · 杂学·音功 · 阴 · 0/1）——李秋水在西夏皇宫以此搜寻藏匿的童姥，声传宫苑、摄人心神（天龙；名目原著，细节待考；效果原创扩展）。
- 招式：`mv_chuanyinsouhun_souhun` 搜魂（L1·控·6 格内敌方·耗 6%/冷 3）：识破隐匿（`veil`）并挂 `bf_poyin` 2；`mv_chuanyinsouhun_duohun` 夺魂（L4·攻·`aoe_diamond r2` 以自身格为目标点·音功 `hTol 99`·**0.45**·7%/2·`bf_luanxin` 30%·2⁺；核算 .50×1.29×远.85×不架.85=.466 −.03）；`mv_chuanyinsouhun_shixin` 失心（L7·攻·单体远 1–5·**0.90**·6%/3·`bf_kongju` 40%·1；1.36×.85×.85=.98 −.10）
- 被动：L1 千里传音（本武学可对 6 格内友方"传音"：其下一次行动命中 +10）；L5 音入心脉（本武学 `mind` 类效果命中 +10%）；L10 大成（搜魂范围扩至全场）
- 门槛/获取：`attrs {wil: 30}`、`aptitude {apInner: 30}`、`music ≥ 20`；`master npc_liqiushui`（西夏线）｜setTags：—

**`sk_zuowangxinfa` 坐忘心法**（5 玄中 · 内功 · 调和 · 0/1 · 原创扩展，名出《庄子·大宗师》"坐忘"）——逍遥派入门至中乘的正宗内功。
- 贡献：`mpMaxPct 18 · hpMaxPct 9 · attrs {wis 4, wil 3} · mpRegen 1.5` → IP 48.5；`stats {resMind 6, effRes 4}`
- 招式：`mv_zuowangxinfa_zuowang` 坐忘（L4·援·`aoe_self`·6%/3）：驱散自身 `mind` 1（≤ 本品阶）＋`bf_dingxin` 3
- 被动：L1 心斋（逍遥派武学修炼 +10%，计入 `bonusMult`）；L6 同于大通（运功调息额外回复 5% mpMax）；L10 大成（作辅运时比例 +0.05，上限 0.60）
- 门槛/获取：`attrs {wis: 30}`、`sect_xiaoyao` rank 1；`master npc_suxinghe` / 函谷八友｜setTags：`[set_xiaoyao_xiaoyaoyou]`

**`sk_fuyaotui` 扶摇腿**（3 黄上 · 拳脚·腿 · 中性 · 0.8/0.2 · 原创扩展，名出《逍遥游》"抟扶摇而上者九万里"）——逍遥派入门腿法，以跃击见长。
- `layerStats {eva: [1, 3], hit: [1, 3]}`（6）
- 招式：`mv_fuyaotui_fuyao` 扶摇（L1·`aoe_leap` 远 1–2 无溅射·**0.90**·5%/1；.90×1.12 −.10）；`mv_fuyaotui_xuanfeng` 旋风（L1·`aoe_around`·**0.85**·6%/2；.65×1.29=.839）；`mv_fuyaotui_jiuwanli` 九万里（L5·单体·**1.00**·5%/1·击退 2；1.12 −.10）
- 被动：L1 腾挪（本武学跳跃类招式高差容差 +1）；L7 逍遥（本回合移动 ≥ 3 格时本武学 Z3 +6%）
- 门槛/获取：`sect_xiaoyao` rank 1；`master` 函谷八友｜setTags：`[set_xiaoyao_xiaoyaoyou]`

**`sk_xiaoyaobu` 逍遥步**（2 黄中 · 轻功 · 原创扩展）——苏星河一系入门步法，轻功贡献 QS 38。
- 招式：`mv_xiaoyaobu_youyou` 悠游（L1·架势·`aoe_self`·3%/2·`bf_piaohu` 2）
- 被动：L1 逍遥（单次移动 ≥ 3 格的回合末获得 `bf_piaohu` 1）；L7 引路（学习凌波微步的 `agi` 软门槛 −10）
- 门槛/获取：无；`master npc_suxinghe`（rank 1）｜setTags：—

### 2.5 代表人物配置（建议，供 chapters/01 与 design/09）

| 人物 | 内功（主 / 辅） | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 虚竹（任宫主后） | 北冥神功（主）/ 八荒六合、小无相功（待考） | 天山六阳掌、天山折梅手 | — | 生死符 | 三性内功由小无相功桥接，不触发相冲（05 §5.4）——"三老合一" |
| 天山童姥（Boss） | 八荒六合（主） | 天山六阳掌、天山折梅手 | — | 生死符 | 返老还童期间战力分阶段（chapters/01 定） |
| 李秋水（Boss） | 小无相功（主） | 白虹掌力 | — | 传音搜魂大法 | 冰窖一战双 Boss 互斗可介入 |
| 苏星河 | 坐忘心法（主） | 扶摇腿 | — | 逍遥步；杂学·棋（通用杂学，03 `chess`） | 珍珑棋局守局人 |
| 段誉（大理图鉴人物） | 北冥神功（帛卷残卷） | 六脉神剑 `sk_liumai`（引用） | — | 凌波微步 | 天龙主角之一 |

---

## 3. 灵鹫宫 `sect_lingjiu`

### 3.1 门派简介

- **来历**：天山童姥所建，居天山缥缈峰，宫中皆女子，分九天九部（钧天、昊天、朱天、阳天、玄天、幽天、苍天、赤天、鸾天——部名逐字待考），梅兰竹菊四剑随侍。童姥以生死符统御三十六洞七十二岛群豪，群豪不堪其苦而有"万仙大会"之叛（天龙）。无量剑派、神农帮等亦受其挟制（无量剑被收服改称"无量洞"，待考）。
- **时代变迁与强弱**：天龙中段由"邪"转"正"——童姥死于西夏冰窖后，虚竹继为宫主，以天山六阳掌为群豪拔除生死符。灵鹫宫只在天龙出现；八荒六合、生死符两门天下品为其镇宫绝学，其余多为本作扩展的部众武学。
- **玩家入口**：女性主角可入宫为部众（rank 1–4）；男性主角经虚竹线以"客卿"受艺（原创扩展）。宫中石室四壁刻有逍遥派武功图谱（原著虚竹于此参研，细节待考），作为本宫与逍遥派武学的**解谜途径**（`q_01_side_72`）。

### 3.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_bahuang` | 八荒六合唯我独尊功 | 内功/心法 | 10 天下 | 阳 | 0/1 | 天龙 | 拜师童姥/虚竹（rank 4）；解谜（石壁，至 7 重） | 原著 |
| `sk_shengsifu` | 生死符 | 暗器 | 10 天下 | 阴 | 0.3/0.7 | 天龙 | 拜师童姥/虚竹（rank 3，前置六阳掌或八荒 4 重） | 原著 |
| `sk_piaomiaojian` | 缥缈剑法 | 兵器/剑 | 7 地下 | 阳 | 0.65/0.35 | 天龙 | 拜师梅兰竹菊四剑（rank 2）；解谜（石壁，至 7 重） | 原创扩展 |
| `sk_jiutianjiubu` | 九天九部阵 | 杂学/阵法 | 6 玄上 | — | — | 天龙 | 拜师九部首领（rank 3） | 原创扩展（本于九天九部） |
| `sk_zhenshenfeizhen` | 针神飞针 | 暗器 | 4 玄下 | — | 0.8/0.2 | 天龙 | 拜师符敏仪（rank 2） | 原创扩展（本于"针神"之号） |
| `sk_lingjiuxinfa` | 灵鹫心法 | 内功/心法 | 3 黄上 | 阳 | 0/1 | 天龙 | 入宫即授（rank 1） | 原创扩展 |
| `sk_piaomiaobu` | 缥缈步 | 轻功 | 2 黄中 | — | — | 天龙 | 入宫即授（rank 1） | 原创扩展 |
| （跨表）`sk_liuyangzhang`、`sk_zhemei` | 天山六阳掌、天山折梅手 | — | — | — | — | — | 见 §2（灵鹫宫为其第二传承途径，不重复计数） | — |

### 3.3 天级与地阶条目卡

#### `sk_bahuang` 八荒六合唯我独尊功（天阶下品 · 内功 · 阳）

- **简述**：童姥独门内功，威猛绝伦；修习者每三十年须"返老还童"一次，功力散而复聚、逐日回复，练功时须饮生血（天龙；周期、回复速度与饮血细节待考）。童姥幼年练功时受李秋水惊扰走火，身形从此停留于童子之躯（待考）。
- **字段**：`origin canon` · `sect sect_lingjiu` · `lineage 逍遥派 → 天山童姥 → 虚竹（待考）` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}`
- **reqs**：`attrs {con: 55, wil: 50}`、`aptitude {apInner: 55}`、`sect {sect_lingjiu, rank: 4}`；`hard: [sect]`
- **内功贡献**：`mpMaxPct 44 · hpMaxPct 22 · attrs {con 6, str 6, wil 6} · mpRegen 3.2` → IP 44+22+36+16 = **118**（天下 118）；`stats {tough 10, resCC 10}`
- **层数**：1 八荒护体｜3 八荒劲｜4 唯我独尊｜5 独尊势｜6 饮血｜**7 绝招·返老还童**｜8 阳极生阴｜10 八荒大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 八荒劲（原创扩展命名） | `mv_bahuang_bahuangjin` | 3 | 攻 | `aoe_around`（wIn 1） | 0.90 | 10% | 3 | 1000 | 击退 1 | ✅ | .65×(1+.36+.10)=.949 −.05 |
| 独尊势（原创扩展命名） | `mv_bahuang_duzun` | 5 | 架势 | `aoe_self` | — | 6% | 3 | 800 | `bf_gongshi` 3；`bf_juqi` 2 | — | 自身增益 |
| 返老还童（绝招） | `mv_bahuang_fanlao` | 7 | 援·绝 | `aoe_self` | — | 10% | — | 1200 | 驱散自身全部减益（≤ 本品阶）；回复 35% hpMax；`bf_wudi` 1；随后自身 `bf_xuruo` 2（功力未复之代价） | — | 同易筋换骨量级，附代价 |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 八荒护体 | `ps_bahuang_hushen` | 1 | trigger | `battleStart` → `bf_hutizhenqi {shieldPctHpMax: 0.06→0.15}` | none |
| 唯我独尊 | `ps_bahuang_duzun` | 4 | stat（Z3） | 对显示等级低于自身的敌人 +5% → +12% | scaled |
| 饮血 | `ps_bahuang_yinxue` | 6 | trigger | 击杀时获得 `bf_shixue` 3 | none |
| 阳极生阴 | `ps_bahuang_zhuanyin` | 8 | mechanic | 装配本功时，生死符（`sk_shengsifu`）效果命中 +20%，施加的 `bf_shengsifu` 品阶 +1（上限 12）——生死符以阳刚内力化水成冰 | full |
| 八荒大成 | `ps_bahuang_dacheng` | 10 | effect | 主运时常驻 `bf_huichun`（每回合回复 hpMax × 1%×G） | none |

- **setTags**：`[set_xiaoyao_xuzhu, set_lingjiu_jiutian]`
- **conflicts**：无直接条目；与阴性主运（北冥神功）同装时按 05 §5.4 相冲，可由小无相功桥接
- **learnSources**：`master ch01 npc_tonglao`（童姥好感 ≥ 60，maxLayer 10）；`master ch01 npc_xuzhu`（rank 4，maxLayer 10）；`puzzle ch01 q_01_side_72`（石壁，maxLayer 7）
- **特殊规则（代价型·轻度）**：①**散功重聚**：书眠后进入新书界的前 3 个游戏日，本功内功贡献 ×0.5（UI"功力逐日回复"，致敬返老还童）；②**饮生血**：闭关修炼本功需消耗"生血"（`it_shengxue`，建议 ID，狩猎所得），缺则闭关收益 ×0.5。

#### `sk_shengsifu` 生死符（天阶下品 · 暗器 · 阴）

- **简述**：童姥以天山六阳掌的阳刚内力"化水为冰"，将薄冰打入人身穴道；中符者按期发作、痛痒难当，须仰赖灵鹫宫赐药镇痛，唯天山六阳掌可拔除。童姥借此驭使三十六洞七十二岛；虚竹于少室山以之制服丁春秋（天龙；发作周期与赐药方式待考，06 K8）。
- **字段**：`origin canon` · `sect sect_lingjiu` · `lineage 天山童姥 → 虚竹` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: false}`（非核心）· `layerStats {effHit: [2, 10], hit: [2, 10]}`（20）
- **reqs**：`attrs {agi: 50, wis: 55}`、`aptitude {apHidden: 55}`、`prereq [{sk_liuyangzhang, 4} 或 {sk_bahuang, 4}]`、`sect {sect_lingjiu, rank: 3}`；`hard: [sect, prereq]`
- **层数**：1 种符、化水为冰｜2 寒冰符｜3 认穴｜4 催符｜5 符封穴、畏符｜6 赐药｜**7 绝招·符雨**｜8 寒入骨髓｜10 生死符大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 种符 | `mv_shengsifu_zhongfu` | 1 | 攻 | `aoe_bolt` 投射 2–5 | 0.95 | 10% | 2 | 1000 | `bf_shengsifu` 50%（治·界，每符一实例） | ✅ | 1.34×.92=1.233 − 受制 .50×.5 |
| 寒冰符（原创扩展命名） | `mv_shengsifu_hanfu` | 2 | 攻 | `aoe_chain n2` 投射 2–4 | 0.75 | 8% | 1 | 1000 | `bf_hanqi` 60%·2 层 | ✅ | .80×1.12×.92=.824 −.06 |
| 催符 | `mv_shengsifu_cuifu` | 4 | 攻 | `aoe_bolt` 投射 2–5；`condition {targetHasTag: bind.shengsi}` | 1.55 | 9% | 3 | 1000 | — | ✅ | (1+.36+.30+.05)×.92=1.573 |
| 符封穴（原创扩展命名） | `mv_shengsifu_fengxue` | 5 | 攻 | `aoe_bolt` 投射 2–4 | 1.05 | 8% | 2 | 1000 | `bf_fengxue` 40%·1 | ✅ | 1.24×.92=1.141 − .20×.4 |
| 赐药 | `mv_shengsifu_ciyao` | 6 | 援 | `aoe_single` 任意单位 1–3 | — | 5% | 2 | 900 | 施符者本人压制目标身上**自己所种**生死符 3 回合；战斗外可"解符"（06 `bf_shengsifu` 专属解法"施符者本人"） | — | 非攻击 |
| 符雨（绝招，原创扩展命名） | `mv_shengsifu_fuyu` | 7 | 攻·绝 | `aoe_sq3` 投射，目标点 2–5 | 1.35 | 10% | — | 1200 | `bf_shengsifu` 60% | ✅ | 3.00×.60×.92=1.656 − .50×.6 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 化水为冰 | `ps_shengsifu_huashui` | 1 | mechanic | 本武学无需暗器弹药：相邻格为水、冰、雪地形（`tr_qianshui` `tr_shenshui` `tr_bingmian` `tr_xuedi` `tr_shenxue`，design/08），或行囊中有清水、酒即可凝符；每场可凝 3 + ⌊层/2⌋ 枚 |
| 认穴 | `ps_shengsifu_renxue` | 3 | stat | 已并入 `layerStats.effHit`；另：对被点穴目标种符率 +10pp |
| 畏符 | `ps_shengsifu_weifu` | 5 | effect | 身中你所种生死符的敌人攻击你时，其伤害 Z3 −10% → −20% |
| 寒入骨髓 | `ps_shengsifu_hanru` | 8 | effect | 本武学命中附加 `bf_hanqi` 1 层（100%） |
| 生死符大成 | `ps_shengsifu_dacheng` | 10 | trigger | 每场首次击杀身中生死符的敌人后，对 5 格内全部敌人各种符一枚（效果命中照常） |

- **setTags**：`[set_xiaoyao_xuzhu]`；**conflicts**：`{with: sk_liuyangzhang, type: counter}`（被其拔除）
- **learnSources**：`master ch01 npc_tonglao`（maxLayer 10）；`master ch01 npc_xuzhu`（maxLayer 10）
- **特殊规则**：战斗外对非敌对 NPC 施符以"驭人"（原著童姥之术）视为邪行：每次 `morality −10`，并触发 design/12 的势力关系变化；Boss 常驻 `bf_shouling` 免疫 `bind`，故生死符对 Boss 只造成伤害部分。

#### `sk_piaomiaojian` 缥缈剑法（地阶下品 · 兵器·剑 · 阳）（原创扩展）

- **简述**：灵鹫宫梅兰竹菊四剑随侍童姥、虚竹，皆以剑为名（原著）；其所使剑法原著未命名，本作以缥缈峰定名，四式各取梅兰竹菊之意，绝招为四剑合使的剑阵（原创扩展）。
- **字段**：`origin expanded` · `sect sect_lingjiu` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: sword}` · `layerStats {parry: [1, 8], hit: [1, 7]}`（15）
- **reqs**：`attrs {agi: 40, wis: 40}`、`aptitude {apSword: 40}`、`sect {sect_lingjiu, rank: 2}`；`hard: [sect]`
- **层数**：1 梅影、兰心、四剑同心｜3 竹节｜4 天山雪｜5 菊寒｜**7 绝招·四季剑阵**｜8 护驾｜10 缥缈大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 梅影 | `mv_piaomiaojian_meiying` | 1 | 攻 | `aoe_single` 近 1 | 1.00 | 7% | 0 | 1000 | — | ✅ | 基准 |
| 兰心 | `mv_piaomiaojian_lanxin` | 1 | 攻 | `aoe_single` 近 1 | 1.05 | 7% | 1 | 1000 | `bf_polu` 50%·2⁺ | ✅ | 1.12 − .05 |
| 竹节 | `mv_piaomiaojian_zhujie` | 3 | 攻 | `aoe_single` 近 1 | 1.15×3 段 | 8% | 1 | 1000 | — | ✅ | 1.17 |
| 菊寒 | `mv_piaomiaojian_juhan` | 5 | 攻 | `aoe_cone n2` | 0.95 | 9% | 2 | 1000 | `bf_hanqi` 30% | ✅ | .75×1.34=1.005 −.03 |
| 四季剑阵（绝招） | `mv_piaomiaojian_siji` | 7 | 攻·绝 | `aoe_cross r1`（目标点近 1） | 1.95 | 9% | — | 1200 | — | ✅ | 3.00×.65 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 四剑同心 | `ps_piaomiaojian_tongxin` | 1 | stat（Z3） | 2 格内每有一名装配本武学的友方 +2% → +3%（上限 8%） |
| 天山雪 | `ps_piaomiaojian_tianshan` | 4 | effect | 本武学命中 20% 附加 `bf_hanqi` 1 层 |
| 护驾 | `ps_piaomiaojian_hujia` | 8 | trigger | 相邻友方被单体攻击选为目标时，20% 获得 `bf_yuanhu` 1（代受此击） |
| 缥缈大成 | `ps_piaomiaojian_dacheng` | 10 | mechanic | 绝招 +20%；四剑同心上限 8% → 12%（仅限灵鹫宫部众同阵时） |

- **setTags**：`[set_lingjiu_jiutian]`；**conflicts**：无
- **learnSources**：`master ch01 npc_meijian`（梅兰竹菊四剑，maxLayer 10）；`puzzle ch01 q_01_side_72`（石壁，maxLayer 7）

### 3.4 玄阶 / 黄阶（紧凑）

**`sk_jiutianjiubu` 九天九部阵**（6 玄上 · 杂学·阵法 · 原创扩展，本于灵鹫宫九天九部建制）
- 招式：`mv_jiutianjiubu_buzhen` 布阵（L1·援·`aoe_allies r2`·6%/3·友方 `bf_jiangu` 2）；`mv_jiutianjiubu_juntian` 钧天号令（L4·控·单体远 1–4·6%/2·目标 `bf_suoding` 70%·2⁺）；`mv_jiutianjiubu_jiutian` 九天合击（L7·援·`aoe_allies r3`·8%/4·友方 `bf_zhuiji` 2⁺）
- 被动：L1 九部（每有一名装配灵鹫宫武学的友方在场，布阵半径 +1，上限 4）；L6 同袍（阵中友方 `effRes` +5%）；L10 大成（布阵同时驱散每名友方 1 个 `mind`）
- 门槛/获取：`formation ≥ 30`、`sect_lingjiu` rank 3；`master npc_lingjiu_shouling`（九部首领，占位）｜setTags：`[set_lingjiu_jiutian]`

**`sk_zhenshenfeizhen` 针神飞针**（4 玄下 · 暗器 · 0.8/0.2 · 原创扩展，本于阳天部首领符敏仪"针神"之号——原著以针黹神速著称，待考）
- `layerStats {crit: [1, 5], hit: [1, 5]}`（10）；弹药：梅花针 `it_meihuazhen` / 毒针 `it_duzhen`（design/10 §8.6）
- 招式：`mv_zhenshenfeizhen_feizhen` 飞针（L1·`aoe_bolt` 投射 2–5·**0.90**·6%/0·`bf_fengxue` 15%·1；.92 −.03）；`mv_zhenshenfeizhen_mizhen` 密针（L3·`aoe_multi n4 r1` 目标点 2–4·**0.95**·6%/2；.85×1.24×.92=.970）；`mv_zhenshenfeizhen_chuanxian` 穿针引线（L6·单体投射 2–4·**1.05**·6%/2·`bf_chanrao` 40%·2；1.24×.92=1.141 −.10）
- 被动：L1 针神（本武学 `critDmg` +10pp）；L5 认穴引针（本武学点穴率 +10pp）；L8 千针（密针段数 +1）
- 门槛/获取：`aptitude {apHidden: 30}`、`attrs {agi: 30}`、rank 2；`master npc_fuminyi`｜setTags：`[set_lingjiu_jiutian]`

**`sk_lingjiuxinfa` 灵鹫心法**（3 黄上 · 内功 · 阳 · 0/1 · 原创扩展）——入宫即授的根基心法，八荒六合的软门槛铺垫。
- 贡献：`mpMaxPct 10 · hpMaxPct 6 · attrs {con 2, wil 2} · mpRegen 1.2` → IP 30；`stats {resCold 6}`
- 招式：`mv_lingjiuxinfa_yangqi` 养气（L4·援·`aoe_self`·3%/4·`bf_huinei` 2）
- 被动：L1 天山寒气（不受品阶 ≤ 本功的 `bf_shouhan`）；L7 灵鹫门风（灵鹫宫武学修炼 +10%）
- 门槛/获取：`sect_lingjiu` rank 1｜setTags：`[set_lingjiu_jiutian]`

**`sk_piaomiaobu` 缥缈步**（2 黄中 · 轻功 · 原创扩展）——QS 38。
- 招式：`mv_piaomiaobu_tayun` 踏云（L1·位移·自身移动 ≤ mov+1，雪/冰地形不减速·3%/2）
- 被动：L1 雪地无痕（`tr_xuedi` `tr_shenxue` `tr_bingmian` 移动不减速；只解速度，不解 qg4"踏雪"探索门禁，design/08）；L7 天山（`jump` +1）
- 门槛/获取：rank 1｜setTags：`[set_lingjiu_jiutian]`

### 3.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 梅兰竹菊四剑 | 灵鹫心法 | — | 缥缈剑法 | 缥缈步 | 四人同阵：四剑同心 +8%，绝招"四季剑阵" |
| 九部首领 / 符敏仪 | 灵鹫心法 | 天山折梅手（仅具名首领可用天级，02 §2.9 R6） | — | 九天九部阵 / 针神飞针 | 精英 |
| 三十六洞七十二岛群豪 | 通用武学（skills-common） | 通用 | 通用 | — | 身中生死符（剧情状态），万仙大会群战；本文不单列 |

---

## 4. 星宿派 `sect_xingxiu`

### 4.1 门派简介

- **来历**：丁春秋本为无崖子弟子，暗算师父、叛出逍遥派，于西域星宿海自立门户，号"星宿老仙"；以化功大法与诸般毒术横行，门人谄媚成风，出行必以锣鼓丝竹颂扬"星宿老仙"（天龙）。大弟子摘星子等以强弱排定尊卑；阿紫盗走神木王鼎出走。丁春秋在擂鼓山棋会、少室山英雄大会屡屡作恶，终被虚竹以生死符制服，押归少林（锚点）。
- **时代变迁与强弱**：只在天龙；丁春秋被擒后门人星散。邪派一流，以地阶为顶（化功大法 地上），没有原生天级。
- **玩家入口**：星宿弟子（`morality ≤ −10`）；门内"排行之争"事件链 `q_01_faction_72`（原著星宿门下以强者为尊，细节待考）决定能否接触化功大法。
- **同源组**：化功大法属 `lg_beiming`（与北冥神功互斥，05 §9.2）。

### 4.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_huagong` | 化功大法 | 内功/心法 | 9 地上 | 阴 | 0/1 | 天龙 | 拜师丁春秋（rank 4）；奇遇（少林囚禁后换诺，至 8 重） | 原著 |
| `sk_chousuizhang` | 抽髓掌 | 拳脚/拳掌 | 8 地中 | 阴 | 0.4/0.6 | 天龙 | 拜师丁春秋（rank 3）；残页（6 页） | 原著（招式原创扩展） |
| `sk_sanxiaoxiaoyaosan` | 三笑逍遥散 | 杂学/毒 | 7 地下 | 阴 | 0.2/0.8 | 天龙 | 拜师丁春秋（rank 3） | 原著（机制原创扩展） |
| `sk_fushidu` | 腐尸毒 | 杂学/毒 | 6 玄上 | 阴 | 0.5/0.5 | 天龙 | 拜师丁春秋（rank 2） | 原著（机制原创扩展） |
| `sk_chanhunwang` | 缠魂网 | 兵器/鞭索 | 5 玄中 | 中性 | 0.75/0.25 | 天龙 | 阿紫羁绊线；残页 | 原创扩展（本于阿紫渔网） |
| `sk_bilinzhang` | 碧磷掌 | 拳脚/拳掌 | 4 玄下 | 阴 | 0.5/0.5 | 天龙 | 拜师摘星子（rank 1） | 原创扩展 |
| `sk_xingxiudugong` | 星宿毒功 | 内功/心法 | 3 黄上 | 阴 | 0/1 | 天龙 | 入门即授 | 原创扩展 |
| `sk_songxianqu` | 颂仙曲 | 杂学/音律 | 1 黄下 | — | — | 天龙 | 入门即授 | 原创扩展（本于门人颂扬之原著情节） |

### 4.3 地阶条目卡

#### `sk_huagong` 化功大法（地阶上品 · 内功 · 阴）

- **简述**：丁春秋独门，与人接触即化散对方内力，中者功力尽失（天龙）；修习者须常以毒物为养，神木王鼎即为聚毒之器，缺毒则毒质反噬（原著说法与细节待考）。与北冥神功同出逍遥一脉而路数相反（05 §9.2）。
- **字段**：`origin canon` · `sect sect_xingxiu` · `lineage 丁春秋` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable false`（门派秘传）· `special {fusible: false, cost: 见下}` · 同源 `lg_beiming`
- **reqs**：`attrs {wil: 45, con: 45, wis: 40}`、`aptitude {apInner: 45}`、`morality {max: −20}`、`sect {sect_xingxiu, rank: 4}`；`hard: [morality, sect]`
- **内功贡献**：`mpMaxPct 34 · hpMaxPct 18 · attrs {wil 6, con 4, wis 4} · mpRegen 2.8` → IP 34+18+28+14 = **94**（地上 94.5，−0.5%）；`stats {resPoison 15}`
- **层数**：1 化功｜3 化功掌、以毒养功｜5 毒雾、毒手｜**7 绝招·化尽百川**｜8 化尽｜10 化功大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 化功掌（原创扩展命名） | `mv_huagong_huagongzhang` | 3 | 攻 | `aoe_single` 近 1（wIn 1） | 1.05 | 8% | 1 | 1000 | `bf_huagong_qin` 100% +1 层（另于被动触发） | ✅ | 1+.12+.05=1.17 −.10 |
| 毒雾（原创扩展命名） | `mv_huagong_duwu` | 5 | 攻 | `aoe_sq3` 目标点远 1–2；`friendlyFire: all` | 0.70 | 9% | 3 | 1000 | `bf_zhongdu` 60%·1 层 | ✅ | .60×1.46×.85=.745 −.06 |
| 化尽百川（绝招，原创扩展命名） | `mv_huagong_huajin` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.80 | 9% | — | 1200 | `bf_huagong_qin` 100%·3 层 | ✅ | 3.00 − .10 − .10 |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 化功 | `ps_huagong_huagong` | 1 | effect | 装配即得 `bf_huagong`（吸内·化：近战命中焚毁目标内力并施加化功侵体，06 §8.3） | full |
| 以毒养功 | `ps_huagong_yangdu` | 3 | effect | 自身持有 `poison` 标签效果时，`mpRegen` +1pp，化功焚毁量 +20% | scaled |
| 毒手 | `ps_huagong_dushou` | 5 | trigger | 本方拳脚招式命中时 15% 附加 `bf_zhongdu` 1 层 | none |
| 化尽 | `ps_huagong_huajin` | 8 | effect | 目标内力 ≤ 10% 时，化功改为施加 `bf_sangong` 2（散功） | none |
| 化功大成 | `ps_huagong_dacheng` | 10 | mechanic | 绝招 +20%；化功对 Boss 焚毁量 ×0.5 → ×0.75 | none |

- **setTags**：`[set_xingxiu_laoxian]`
- **conflicts**：`{with: sk_beiming, type: exclusive}`（05 §9.2）
- **learnSources**：`master ch01 npc_dingchunqiu`（排行之争胜出，maxLayer 10）；`qiyu ch01 q_01_qiyu_74`（丁春秋囚于少林后，以"助其脱困"之诺换化功秘要，原创扩展，`morality −15`，maxLayer 8）
- **特殊规则（代价型）**：**毒质反噬**——每场战斗结束时，若本场自身既未施加也未承受任何 `poison` 标签效果，获得 `bf_zhongdu` 2 层（品阶 = 本功有效品阶，跨战斗按 06 §5.4）；闭关修炼本功须消耗毒物（`it_duwu`，建议）或持有奇物神木王鼎（`it_shenmuwangding`，design/10 §11.3"可随身配毒"），缺则闭关收益 ×0.5。代价在习得前完整展示（05 §9.1）。

#### `sk_chousuizhang` 抽髓掌（地阶中品 · 拳脚·掌 · 阴）

- **简述**：丁春秋的阴毒掌法（天龙；对敌场合待考）。名如其效：掌力透骨，伤人内腑。招名与效果为原创扩展。
- **字段**：`origin canon` · `sect sect_xingxiu` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `layerStats {effHit: [1, 8], crit: [1, 7]}`（15）
- **reqs**：`attrs {wil: 45, str: 40, wis: 40}`、`aptitude {apFist: 45}`、`morality {max: −10}`（软）、`sect {sect_xingxiu, rank: 3}`；`hard: [sect]`
- **层数**：1 抽髓、枯骨、阴毒｜3 阴风｜4 入骨｜5 吸髓｜**7 绝招·抽髓断魂**｜8 蚀心｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 抽髓 | `mv_chousuizhang_chousui` | 1 | 攻 | `aoe_single` 近 1 | 1.05 | 7% | 1 | 1000 | `bf_neishang` 50%·2 层 | ✅ | 1.12 − .05 |
| 枯骨 | `mv_chousuizhang_kugu` | 1 | 攻 | `aoe_single` 近 1 | 0.95 | 7% | 0 | 1000 | `bf_zhongdu` 60%·1 层 | ✅ | 1.00 − .06 |
| 阴风 | `mv_chousuizhang_yinfeng` | 3 | 攻 | `aoe_cone n2` | 0.95 | 9% | 2 | 1000 | `bf_zhongdu` 30% | ✅ | .75×1.34 −.03 |
| 吸髓 | `mv_chousuizhang_xisui` | 5 | 攻 | `aoe_single` 近 1 | 1.15 | 8% | 2 | 1000 | 自身 `bf_shixue` 100%·2 | ✅ | 1.29 − 自益 .15 |
| 抽髓断魂（绝招） | `mv_chousuizhang_duanhun` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.85 | 9% | — | 1200 | `bf_neishang` 100%·3 层；`bf_gushang` 50% | ✅ | 3.00 − .10 − .05 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 阴毒 | `ps_chousuizhang_yindu` | 1 | stat（Z3） | 对中毒目标 +5% → +12% |
| 入骨 | `ps_chousuizhang_rugu` | 4 | effect | 本武学施加内伤时层数 +1 |
| 蚀心 | `ps_chousuizhang_shixin` | 8 | effect | 命中持有 `bf_huagong_qin` 的目标时，额外焚毁其 3% mpMax |
| 抽髓大成 | `ps_chousuizhang_dacheng` | 10 | mechanic | 绝招 +20%；内伤满 10 层的目标受本武学伤害 +10%（Z3） |

- **setTags**：`[set_xingxiu_laoxian]`；**conflicts**：无
- **learnSources**：`master ch01 npc_dingchunqiu`（maxLayer 10）；`pages ch01 it_canye_chousuizhang`（星宿门人掉落，地阶 6 页，05 §7.5）

#### `sk_sanxiaoxiaoyaosan` 三笑逍遥散（地阶下品 · 杂学·毒 · 阴）

- **简述**：丁春秋的奇毒，以指甲轻弹即可施放，中者脸现诡笑、笑声三响而亡（天龙；受害者与回目待考）。杂学主动招式，强度走毒术 `poi`（03 §7.4 `artFactor`）。
- **字段**：`origin canon` · `sect sect_xingxiu` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable false` · `special {fusible: false}`
- **reqs**：`attrs {wis: 40}`、`poi ≥ 45`、`morality {max: −20}`、`sect {sect_xingxiu, rank: 3}`；`hard: [morality, sect]`
- **层数**：1 弹甲、无色无味｜4 逍遥毒粉｜5 毒心｜7 绝招·三笑逍遥｜10 逍遥大成（非核心，绝招层不受 ≤ 7 约束，仍置于 7）

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 弹甲（原著"弹指施毒"之意） | `mv_sanxiaoxiaoyaosan_tanjia` | 1 | 攻 | `aoe_bolt` 投射 1–3 | 1.10 | 8% | 2 | 1000 | `bf_judu` 50%·3⁺ | ✅ | 1.29×.92=1.187 − 剧毒 .15×.5 |
| 逍遥毒粉 | `mv_sanxiaoxiaoyaosan_dufen` | 4 | 攻 | `aoe_sq3` 投射目标点 2–3；`friendlyFire: all` | 0.75 | 9% | 3 | 1000 | `bf_judu` 30% | ✅ | .60×1.46×.92=.806 −.045 |
| 三笑逍遥（绝招） | `mv_sanxiaoxiaoyaosan_sanxiao` | 7 | 攻·绝 | `aoe_bolt` 投射 1–3 | 2.50 | 9% | — | 1200 | `bf_judu` 100%·持续 +1；**提案** `bf_sanxiao`（§16 B-1）定稿后改挂之 | ✅ | 3.00×.92=2.76 − .15 − 三笑附加 .10 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 无色无味 | `ps_sanxiaoxiaoyaosan_wuse` | 1 | mechanic | 本武学施毒不显示范围预警（敌方 AI 不据此回避）；给兵器淬毒时品阶 +1（03 §8.2 毒术③） |
| 毒心 | `ps_sanxiaoxiaoyaosan_duxin` | 5 | stat | 对中毒目标效果命中 +10% |
| 逍遥大成 | `ps_sanxiaoxiaoyaosan_dacheng` | 10 | mechanic | 绝招 +20%；本武学施加的剧毒持续 +1 |

- **setTags**：`[set_xingxiu_laoxian]`；**conflicts**：无
- **learnSources**：`master ch01 npc_dingchunqiu`（maxLayer 10）
- **对抗**：`bf_mian_du`（百毒不侵，如段誉服莽牯朱蛤）按品阶对抗阻挡（06 §3.5.1）。

### 4.4 玄阶 / 黄阶（紧凑）

**`sk_fushidu` 腐尸毒**（6 玄上 · 杂学·毒 · 阴 · 0.5/0.5 · 原著名目，丁春秋以沾毒尸身掷人——细节待考；机制原创扩展）。表现以毒雾、残衣代替尸身特写（沿 05 §9.1.2 表现原则）。
- 招式：`mv_fushidu_zhishi` 掷尸（L1·攻·`aoe_sq3` 投射目标点 2–4·`condition {adjacentFallenUnit}`（罕 +.30）·**0.80**·7%/2·`bf_zhongdu` 80%·2 层·敌我皆中；.60×(1+.30+.24+.05)×.92=.878 −.08）；`mv_fushidu_shidu` 尸毒弥漫（L4·`aoe_zone sq3 t=3` 目标点 2–4·每跳 0.25·6%/3·每跳 `bf_zhongdu` 50%）
- 被动：L1 腐骨（本武学施加的中毒品阶 +1，上限为本武学品阶 +1）；L5 尸毒入血（对流血目标，本武学中毒层数 +1，06 `rx_duruxue` 另行生效）；L10 大成（掷尸无需相邻倒地单位，改掷毒囊，倍率 ×0.8）
- 门槛/获取：`poi ≥ 30`、`morality {max: −20}`（硬）、`sect_xingxiu` rank 2；`master npc_dingchunqiu`｜setTags：`[set_xingxiu_laoxian]`

**`sk_chanhunwang` 缠魂网**（5 玄中 · 兵器·鞭索 · 中性 · 0.75/0.25 · 原创扩展命名，本于阿紫以渔网困杀褚万里之原著情节）
- `weaponReq {category: whip}`（渔网属软兵刃，06 §8.6"破索"）；`layerStats {hit: [1, 5], effHit: [1, 5]}`（10）
- 招式：`mv_chanhunwang_sawang` 撒网（L1·`aoe_cross r1` 投射目标点 2–3·**0.65**·7%/2·`bf_chanrao` 40%·2；.65×1.29×.92=.771 −.10）；`mv_chanhunwang_shouwang` 收网（L3·`aoe_pull n2` 近 1–3·`condition {targetHasTag: cc.bind}`（常 +.15）·**1.10**·6%/1；.95×1.27=1.207 −.10）；`mv_chanhunwang_jiaosha` 绞杀（L5·单体·同条件·**1.20**·6%/1·`bf_liuxue` 50%；1.27 −.05）；`mv_chanhunwang_luowang` 罗网（L7·**绝招**·`aoe_sq3` 投射目标点 2–3·**1.45**·8%·`bf_chanrao` 80%；3.00×.60×.92=1.656 −.20）
- 被动：L1 缠丝（本武学施加的缠绕，挣脱成功率 −10%）；L4 网中之鱼（对缠绕目标 Z3 +8%）；L8 收放自如（撒网后 2 回合内未收网，网自动回手）
- 门槛/获取：`aptitude {apWhip: 30}`、`attrs {agi: 30}`、`sect_xingxiu` rank 2；`master npc_azi`（阿紫羁绊线，原创扩展）/ 残页｜setTags：`[set_xingxiu_laoxian]`

**`sk_bilinzhang` 碧磷掌**（4 玄下 · 拳脚·掌 · 阴 · 0.5/0.5 · 原创扩展）——星宿门下中阶毒掌，掌缘泛碧磷之色。
- `layerStats {effHit: [1, 5], crit: [1, 5]}`（10）
- 招式：`mv_bilinzhang_bilin` 碧磷（L1·单体·**0.95**·6%/0·`bf_zhongdu` 60%；1.00 −.06）；`mv_bilinzhang_linhuo` 磷火（L2·单体远 1–2·**0.90**·6%/1·`bf_zhuoshao` 30%；1.12×.85 −.03）；`mv_bilinzhang_lianhuan` 毒掌连环（L5·单体·**1.10**×2 段·7%/1·`bf_zhongdu` 50%；1.17 −.05）
- 被动：L1 毒掌（对中毒目标 Z3 +3% → +8%）；L5 磷毒（本武学施加的中毒持续 +1）；L8 炼毒有成（`resPoison` +5pp）
- 门槛/获取：`aptitude {apFist: 25}`、`poi ≥ 20`、`sect_xingxiu` rank 1；`master npc_zhaixingzi`（摘星子）｜setTags：`[set_xingxiu_laoxian]`

**`sk_xingxiudugong` 星宿毒功**（3 黄上 · 内功 · 阴 · 0/1 · 原创扩展）——以毒养功的入门心法，化功大法的软门槛铺垫。
- 贡献：`mpMaxPct 11 · hpMaxPct 5 · attrs {wil 2, con 2} · mpRegen 1.2` → IP 30；`stats {resPoison 6}`
- 招式：`mv_xingxiudugong_bidu` 逼毒（L4·援·`aoe_self`·5%/3·驱散自身 `poison` 1，≤ 本品阶）
- 被动：L1 饲毒（每场首次中毒时回复 3% mpMax）；L7 毒功（本方毒类效果命中 +5%）
- 门槛/获取：`sect_xingxiu` rank 1｜setTags：`[set_xingxiu_laoxian]`

**`sk_songxianqu` 颂仙曲**（1 黄下 · 杂学·音律 · 原创扩展，本于星宿门人锣鼓丝竹颂扬"星宿老仙"之原著情节）
- 招式：`mv_songxianqu_songxian` 颂仙（L1·援·`aoe_allies r3`·3%/3·友方 `bf_juqi` 2）；`mv_songxianqu_luogu` 锣鼓喧天（L4·控·`aoe_diamond r2` 目标点远 1–3·4%/3·`bf_dongyao` 40%·2⁺）
- 被动：L1 阿谀（颂仙时，场上友方中显示等级最高者额外获得 `bf_ruiyi` 1——星宿派 NPC 队伍中受益者必为丁春秋）；L7 脸皮（自身 `resMind` +5pp）
- 门槛/获取：`music ≥ 5`；星宿派 rank 1 入门即授｜setTags：—

### 4.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 丁春秋（Boss） | 化功大法（主）、星宿毒功 | 抽髓掌、碧磷掌 | —（原著手持羽扇，是否作兵刃待考） | 三笑逍遥散、腐尸毒、颂仙曲（门人代奏） | 少室山被生死符所制（锚点） |
| 摘星子（精英） | 星宿毒功 | 碧磷掌 | — | 腐尸毒 | 原著以内力催动火焰与阿紫相斗（待考）：可用磷火 |
| 阿紫（可招募，chapters/01 定） | 星宿毒功 | 碧磷掌 | 缠魂网 | 通用毒针暗器 | 盗神木王鼎（奇物 `it_shenmuwangding`） |
| 星宿门人（普通） | 星宿毒功 | 碧磷掌 | — | 颂仙曲 | 成群出现，颂仙叠气势 |

---

## 5. 姑苏慕容 `sect_murong`

### 5.1 门派简介

- **来历**：鲜卑慕容氏后裔（前燕、后燕皇族），世居姑苏燕子坞，念念不忘兴复大燕。家传"斗转星移"，以"以彼之道，还施彼身"名震江湖；还施水阁广藏天下武学典籍。慕容博诈死潜入少林藏经阁三十年，与萧远山同为扫地僧点化（锚点）；慕容复化名李延宗投身西夏一品堂，终因复国无望而心智失常（天龙）。四大家臣邓百川、公冶乾、包不同、风波恶，侍婢阿朱精易容、阿碧善琴；表妹王语嫣出身曼陀山庄，博识天下武学。
- **时代变迁与强弱**：只在天龙；慕容复疯癫后家业烟消。家传绝学斗转星移为天下品；其余以"博采百家"为特色——大量武学会授予单项"破 X"（05 §9.4）。
- **玩家入口（原创扩展）**：燕子坞门客/家臣（rank 1–4）；还施水阁可"偷阅"秘籍（被发现则慕容家好感大降）。

### 5.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_douzhuan` | 斗转星移 | 内功/心法 | 10 天下 | 调和（随辅运） | 0/1 | 天龙 | 拜师慕容复（8 重）/ 慕容博（10 重）；秘籍（还施水阁偷阅，6 重） | 原著 |
| `sk_canhezhi` | 参合指 | 拳脚/指法 | 8 地中 | 调和 | 0.3/0.7 | 天龙 | 拜师慕容复（rank 3）；秘籍（还施水阁，7 重） | 原著名目（招式原创扩展） |
| `sk_baijiadao` | 百家刀法 | 兵器/刀 | 7 地下 | 中性 | 0.75/0.25 | 天龙 | 拜师慕容复（rank 2）；观摩（磨坊李延宗一战） | 原创扩展命名（本于李延宗连使各派刀法） |
| `sk_murongjian` | 慕容剑法 | 兵器/剑 | 6 玄上 | 中性 | 0.7/0.3 | 天龙 | 拜师慕容复（rank 2） | 原著（剑法名目待考，招式原创扩展） |
| `sk_yirongshu` | 易容术 | 杂学/易容 | 6 玄上 | — | — | 天龙 | 阿朱羁绊（小镜湖锚点前） | 原著 |
| `sk_longchengxinfa` | 龙城心法 | 内功/心法 | 5 玄中 | 调和 | 0/1 | 天龙 | 拜师邓百川（rank 1） | 原创扩展 |
| `sk_yizhenfengdao` | 一阵风刀法 | 兵器/刀 | 3 黄上 | 阳 | 0.8/0.2 | 天龙 | 拜师风波恶（rank 1） | 原创扩展 |
| `sk_feiyefeiye` | 非也非也 | 杂学/心神 | 2 黄中 | — | — | 天龙 | 包不同授（rank 1） | 原创扩展（取包不同口头禅） |

### 5.3 天级与地阶条目卡

#### `sk_douzhuan` 斗转星移（天阶下品 · 内功 · 调和/随辅运）

- **简述**：姑苏慕容家传绝技，借力打力，将对手攻来之招转移方向、还击其身，"以彼之道，还施彼身"（天龙）。慕容博以此名震江湖，少林玄悲等人之死一度被归于此（原著，细节待考）。
- **字段**：`origin canon` · `sect sect_murong` · `lineage 慕容氏家传 → 慕容博 → 慕容复` · `sourceChapters [ch01_tianlong]` · `nature harmony`（`inner.natureFollowAux: true`：主运时取品阶最高辅运之性质，05 §5.7）· 作辅运时为调和且品阶 ≥ 7 → 桥接 · `moveSlots 5` · `observable false`（05 O4 的答复：斗转为家传秘技，不开放观摩）· `special {fusible: true}`
- **reqs**：`attrs {wis: 60, agi: 50}`、`aptitude {apInner: 55}`、`sect {sect_murong, rank: 3}`；`hard: [sect]`
- **内功贡献**：`mpMaxPct 36 · hpMaxPct 22 · attrs {wis 8, agi 6, str 6} · mpRegen 3.8` → IP 36+22+40+19 = **117**（天下 118，−0.8%）；`stats {counter 10, parry 10}`
- **层数**：1 斗转｜3 还施彼身、以彼之道｜5 星移斗转、卸力｜**7 绝招·星河倒转**｜8 博闻强识｜10 斗转大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 还施彼身 | `mv_douzhuan_huanshi` | 3 | 攻 | `aoe_single` 近 1；`condition {attackedByTargetSinceLastAction}`；招式级 `wOut/wIn 0.5/0.5` | 1.40 | 8% | 2 | 1000 | — | ✅ | 1+.24+.15=1.39 |
| 星移斗转 | `mv_douzhuan_xingyi` | 5 | 架势 | `aoe_self` | — | 6% | 3 | 800 | `bf_douzhuan`（主动版）1，`value {chancePlus: 0.30}`：至下次行动前斗转概率 +30pp（上限 60%） | — | 自身增益 |
| 星河倒转（绝招，原创扩展命名） | `mv_douzhuan_xinghe` | 7 | 援·绝 | `aoe_self` | — | 10% | — | 1200 | `bf_douzhuan` 2，`value {chancePlus: 0.40, mirrorMult: 1.0}`；`bf_xieli` 2 | — | 内功绝招以自身效果为主 |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 斗转 | `ps_douzhuan_douzhuan` | 1 | mechanic | 主运时常驻 `bf_douzhuan`（06 §8.9：概率 min(30%, 6%×G)，距离 ≤ 3，奉还 ×0.8） | none |
| 以彼之道 | `ps_douzhuan_bizhi` | 3 | stat（Z3） | 被敌方招式命中后，你的下一招若与来袭招式同大类，+5% → +15% | scaled |
| 卸力 | `ps_douzhuan_xieli` | 5 | stat（Z4） | 受到近战伤害 −4% → −10% | scaled |
| 博闻强识 | `ps_douzhuan_boxue` | 8 | mechanic | 观摩领悟 +50%；对图鉴中已"见识"的敌方招式，斗转概率 +5pp（还施水阁藏尽天下武学） | full |
| 斗转大成 | `ps_douzhuan_dacheng` | 10 | mechanic | 斗转奉还倍率 ×0.8 → ×1.0；奉还距离 3 → 5（可奉还 `ranged` 气劲） | none |

- **setTags**：`[set_murong_huanshi]`
- **conflicts**：无定稿条目；与乾坤大挪移同为"运使之法"（`natureFollowAux`），是否互斥列为开放问题（§16 O-2）
- **learnSources**：`master ch01 npc_murongfu`（家臣线，maxLayer 8：慕容复斗转未臻化境——原创扩展判断）；`master ch01 npc_murongbo`（藏经阁锚点、慕容博出家后传授，maxLayer 10）；`manual ch01 it_miji_douzhuan`（还施水阁偷阅，maxLayer 6，事发则慕容家好感 −30）

#### `sk_canhezhi` 参合指（地阶中品 · 拳脚·指 · 调和）

- **简述**：慕容氏家传指法，以燕子坞"参合庄"为名（参合陂为后燕兵败之地，寓不忘国耻）；慕容复用以对敌（天龙；对敌场合与招名待考）。招式为原创扩展。
- **字段**：`origin canonExpanded` · `sect sect_murong` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `layerStats {seal: [2, 10], hit: [1, 5]}`（15）
- **reqs**：`attrs {wis: 45, agi: 40}`、`aptitude {apFinger: 45}`、`sect {sect_murong, rank: 3}`；`hard: [sect]`
- **层数**：1 参合、连点、指力透穴｜3 燕回｜4 以指还指｜5 龙城一指｜**7 绝招·参合归一**｜8 斗转相济｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 参合 | `mv_canhezhi_canhe` | 1 | 攻 | `aoe_single` 远 1–3 | 0.80 | 7% | 0 | 1000 | `bf_fengxue` 25%·1 | ✅ | .85 − .05 |
| 连点 | `mv_canhezhi_liandian` | 1 | 攻 | `aoe_single` 近 1 | 1.15×3 段 | 8% | 1 | 1000 | `bf_fengxue` 20% | ✅ | 1.17 − .04 |
| 燕回 | `mv_canhezhi_yanhui` | 3 | 攻 | `aoe_single` 远 1–3；出招后后撤 1 格 | 0.85 | 7% | 1 | 1000 | — | ✅ | 1.12×.85=.952 −.10 |
| 龙城一指 | `mv_canhezhi_longcheng` | 5 | 攻 | `aoe_pierce` 远 1–2 | 1.00 | 9% | 2 | 1000 | — | ✅ | .90×1.34×.85=1.025 |
| 参合归一（绝招） | `mv_canhezhi_guiyi` | 7 | 攻·绝 | `aoe_single` 远 1–4 | 2.45 | 9% | — | 1200 | `bf_fengxue` 60%·1 | ✅ | 3.00×.85 − .12 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 指力透穴 | `ps_canhezhi_touxue` | 1 | effect | 本武学对护体真气伤害 ×1.2（`shieldDmgMult`） |
| 以指还指 | `ps_canhezhi_huanzhi` | 4 | stat（Z3） | 被敌方指法命中后，下一次本武学招式 +15% |
| 斗转相济 | `ps_canhezhi_douzhuan` | 8 | trigger | `bf_douzhuan` 奉还成功后，立即以"参合"式追击 ×0.5（`followup`，每回合 1 次） |
| 参合大成 | `ps_canhezhi_dacheng` | 10 | mechanic | 绝招 +20%；本武学施加的点穴持续 +1 |

- **setTags**：`[set_murong_huanshi]`；**conflicts**：无
- **learnSources**：`master ch01 npc_murongfu`（maxLayer 10）；`manual ch01 it_miji_canhezhi`（还施水阁偷阅，maxLayer 7）

#### `sk_baijiadao` 百家刀法（地阶下品 · 兵器·刀 · 中性）

- **简述**：慕容复化名"李延宗"投身西夏一品堂时，于磨坊中接连施展各派刀法对敌，王语嫣在旁一一道破其来历（天龙；所列门派与招名待考）。本作将这种"百家刀法"整理为一门以拆解、借用他派刀招为核心的武学（原创扩展命名）。
- **字段**：`origin canonExpanded` · `sect sect_murong` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: blade}` · `layerStats {parry: [1, 7], counter: [1, 8]}`（15）
- **reqs**：`attrs {agi: 40, wis: 45}`、`aptitude {apBlade: 45}`、`sect {sect_murong, rank: 2}`；`hard: [sect]`
- **层数**：1 借刀、百家连环、博采众家｜3 偷梁换柱｜4 化名｜5 见招拆招｜**7 绝招·百家归一**｜8 拆招｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 借刀 | `mv_baijiadao_jiedao` | 1 | 攻 | `aoe_single` 近 1 | 1.00 | 7% | 0 | 1000 | — | ✅ | 基准 |
| 百家连环 | `mv_baijiadao_lianhuan` | 1 | 攻 | `aoe_single` 近 1 | 1.15×3 段 | 8% | 1 | 1000 | — | ✅ | 1.17 |
| 偷梁换柱 | `mv_baijiadao_huanzhu` | 3 | 攻 | `aoe_swap` 近 1 | 0.95 | 8% | 2 | 1000 | 与目标换位 | ✅ | .85×1.29=1.097 − .15 |
| 见招拆招 | `mv_baijiadao_chaizhao` | 5 | 架势 | `aoe_self`；`trigger meleeAttacked` | 反击 1.00 | 5% | 2 | 900 | 来招为刀法时反击附 `bf_pozhao` 30%·1；`stanceCounter{counterPower: 1.0, expires: nextOwnAction}` | — | 反击型 |
| 百家归一（绝招） | `mv_baijiadao_guiyi` | 7 | 攻·绝 | `aoe_single` 近 1 | 3.00 | 9% | — | 1200 | — | ✅ | 3.00 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 博采众家 | `ps_baijiadao_bocai` | 1 | effect | 授予单项 `bf_podao`（破刀；单项来源 `poBonus` ×0.6，05 §9.4） |
| 化名 | `ps_baijiadao_huaming` | 4 | mechanic | 使用本武学时，敌方图鉴"见识"随机显示为他派刀法（原著慕容复以各派刀法掩饰来历） |
| 拆招 | `ps_baijiadao_chai` | 8 | stat | `counter` +5pp；来袭为刀法时再 +5pp |
| 百家大成 | `ps_baijiadao_dacheng` | 10 | mechanic | 绝招 +20% |

- **setTags**：`[set_murong_huanshi]`；**conflicts**：无
- **learnSources**：`master ch01 npc_murongfu`（maxLayer 10）；`observe`（磨坊一战观摩"李延宗"出刀，原著情节致敬，maxLayer 6）

### 5.4 玄阶 / 黄阶（紧凑）

**`sk_murongjian` 慕容剑法**（6 玄上 · 兵器·剑 · 中性 · 0.7/0.3 · 原著慕容复以剑术对敌，剑法名目与招名待考；招式原创扩展）
- `weaponReq {category: sword}`；`layerStats {parry: [1, 5], hit: [1, 5]}`（10）
- 招式：`mv_murongjian_yanjian` 燕剪（L1·单体·**1.00**×2 段·6%/0）；`mv_murongjian_huanshi` 还施（L1·单体·`condition {targetLastMoveCat: sword}`（常 +.15）·**1.10**·6%/1·自身临时 `bf_pojian` 1；1+.15+.12 − 自益 .15）；`mv_murongjian_yanbo` 太湖烟波（L4·`aoe_sweep`·**0.90**·7%/1；.75×1.17=.878）；`mv_murongjian_zhongxing` 中兴大燕（L7·**绝招**·单体·**3.00**·8%）
- 被动：L1 通晓百家（授予单项 `bf_pojian`，×0.6）；L4 表妹指点（羁绊队友王语嫣在场时本武学暴击 +10——原著王语嫣临阵指点）；L8 中兴之志（气血 < 50% 时 Z3 +8%）
- 门槛/获取：`aptitude {apSword: 30}`、`attrs {agi: 30}`、`sect_murong` rank 2；`master npc_murongfu`｜setTags：`[set_murong_huanshi]`

**`sk_yirongshu` 易容术**（6 玄上 · 杂学·易容 · 原著：阿朱精于易容与学人声口，曾假扮多人——具体对象与回目待考）
- 招式：`mv_yirongshu_yirong` 易容（L1·援·`aoe_self`·战斗外随时；战斗内 5%/5·自身 `bf_yirong`）；`mv_yirongshu_xuesheng` 学声（L4·控·单体远 1–3·6%/3·`bf_mihuo` 30%·1）；`mv_yirongshu_huanrong` 换容（L7·援·相邻友方·8%/5·友方 `bf_yirong`）
- 被动：L1 千人千面（本武学施加的 `bf_yirong` 识破阈值 +10）；L5 察言观色（识破他人易容的判定 +20）
- 门槛/获取：`art ≥ 30`、`cha ≥ 30`；硬门槛：阿朱羁绊 ≥ 3（`q_01_bond_72`，须在小镜湖锚点前）｜setTags：—

**`sk_longchengxinfa` 龙城心法**（5 玄中 · 内功 · 调和 · 0/1 · 原创扩展，以前燕旧都龙城为名，寓复国之志）
- 贡献：`mpMaxPct 16 · hpMaxPct 11 · attrs {str 3, wis 3, agi 2} · mpRegen 1.4` → IP 50（玄中 48.5，+3%）；`stats {counter 5, parry 5}`
- 招式：`mv_longchengxinfa_fuyan` 复燕（L4·援·`aoe_self`·6%/3·`bf_ruiyi` 3）
- 被动：L1 燕国遗绪（慕容派武学修炼 +10%）；L6 中兴（气血 < 50% 时 Z3 +6%）；L10 大成（学习斗转星移的 `wis` 软门槛 −10）
- 门槛/获取：`sect_murong` rank 1；`master npc_dengbaichuan`｜setTags：`[set_murong_huanshi]`

**`sk_yizhenfengdao` 一阵风刀法**（3 黄上 · 兵器·刀 · 阳 · 0.8/0.2 · 原创扩展，取风波恶"江南一阵风"之号）
- `layerStats {hit: [1, 3], counter: [1, 3]}`（6）
- 招式：`mv_yizhenfengdao_kuaidao` 快刀（L1·单体·**0.95**·5%/0·收招 900；1.00 −.07）；`mv_yizhenfengdao_tuxi` 突袭（L1·`aoe_dash n3`·**1.00**·5%/1；1.12 −.10）；`mv_yizhenfengdao_fengjuan` 风卷残云（L5·`aoe_sweep`·**0.95**·5%/2；.75×1.24=.93）
- 被动：L1 好斗（本场首次出手暴击 +10）；L7 一阵风（本武学命中后 30% 获得 `bf_jixing` 1）
- 门槛/获取：`sect_murong` rank 1；`master npc_fengboe`｜setTags：`[set_murong_huanshi]`

**`sk_feiyefeiye` 非也非也**（2 黄中 · 杂学·心神 · 原创扩展，取包不同口头禅）
- 招式：`mv_feiyefeiye_feiye` 非也（L1·控·单体远 1–4·4%/2·`bf_chaofeng` 50%·1）；`mv_feiyefeiye_taigang` 抬杠（L4·控·单体远 1–4·4%/3·`bf_xieqi` 50%·2）
- 被动：L1 强词夺理（技艺 `speech` +5，影响对话检定，design/12）；L7 我行我素（免疫品阶 ≤ 本武学的 `bf_chaofeng`）
- 门槛/获取：`speech ≥ 15`；`master npc_baobutong`｜setTags：—

### 5.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 慕容复（Boss） | 斗转星移（主，8 重）、龙城心法 | 参合指 | 慕容剑法、百家刀法 | 易容（化名李延宗时） | 王语嫣同行时"表妹指点"生效 |
| 慕容博（Boss，藏经阁） | 斗转星移（主，10 重） | 参合指；少林七十二绝技（引用） | — | — | 与萧远山同场，扫地僧锚点 |
| 四大家臣 | 龙城心法 | —（邓百川/公冶乾以通用掌法配置） | 一阵风刀法（风波恶） | 非也非也（包不同） | 精英 |
| 阿朱（可招募） | 龙城心法 | — | — | 易容术 | 小镜湖锚点前羁绊线 |

---

## 6. 吐蕃密宗 `sect_mizong`

### 6.1 门派简介（跨四书界）

| 书界 | 代表 | 原著事实 | 本作定位 |
|---|---|---|---|
| 天龙（1093） | 大轮明王鸠摩智；吐蕃武士（随宗赞王子赴西夏招亲） | 鸠摩智出身大雪山大轮寺，以火焰刀名动中原；兼习小无相功并以之催动少林七十二绝技；枯井中内力为段誉北冥神功吸尽，大彻大悟（锚点） | 火焰刀（天下）首现；密宗低阶武学首现 |
| 神雕（1250s） | 金轮法王；弟子达尔巴、霍都 | 金轮法王为蒙古国师，练成龙象般若功第十层（02 已定），以金银铜铁铅五轮为兵刃；欲收郭襄为徒 | 巅峰：龙象（天中）、五轮大转（地上）、降魔杵（玄上）首现 |
| 倚天（1330s–60s） | 元廷番僧 | 元廷寺院有番僧把守（万安寺一带，待考） | 衰落：仅低阶武学可习（原创扩展定位） |
| 鹿鼎（1670s–80s） | 西藏大喇嘛桑结及其门下 | 桑结与葛尔丹等曾附从吴三桂，后为韦小宝所算、与之结拜（原著；细节与武功名目待考） | 低武书界的密宗原生来源，恰供内功/拳脚/兵器各 1 门（拙火功/大手印/金刚橛法），满足 1/1/1 补齐（05 §14.6-4） |

- **强弱曲线**：天龙（天下）→ 神雕（天中，巅峰）→ 倚天（番僧，玄/黄）→ 鹿鼎（地中为顶，在低武书界已属上乘）。
- **弟子定位说明**：
  - **达尔巴**（神雕）：金轮大弟子，力大、使金杵（原著）。代表武学金刚降魔杵（玄上）；定位"重兵器护法"精英，常与金轮同场援护。
  - **霍都**（神雕）：金轮二弟子、蒙古王子，使折扇（扇中是否藏暗器待考）。扇法属蒙古一系，由射雕/神雕图鉴负责；本组配置时以拙火功、金刚橛法打底。
  - **吐蕃武士 / 大轮寺僧**（天龙）、**番僧**（倚天）、**桑结门下喇嘛**（鹿鼎）：拙火功、大手印、金刚橛法、大明咒四门"密宗通传"武学在四书界均为原生，是本组唯一跨时代复现的武学群。
- **玩家入口**：天龙——大轮寺俗家护法（经鸠摩智或宗赞王子线，原创扩展）；神雕——金轮法王门下（敌对路线，02 §2.9"密宗系（龙象，敌对路线）"）；倚天、鹿鼎——向番僧/喇嘛以交易、切磋习得通传武学。

### 6.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_longxiang` | 龙象般若功 | 内功/心法 | 11 天中 | 阳 | 0/1 | 神雕 | 拜师金轮法王（敌对路线，rank 4） | 原著 |
| `sk_huoyandao` | 火焰刀 | 拳脚/拳掌（刀气） | 10 天下 | 阳 | 0.3/0.7 | 天龙 | 拜师鸠摩智（交易至 8 重；枯井锚点后 10 重） | 原著 |
| `sk_wulundazhuan` | 五轮大转 | 兵器/奇门（轮） | 9 地上 | 阳 | 0.6/0.4 | 神雕 | 拜师金轮法王（rank 4）；观摩（6 重） | 原著（"五轮大转"为金轮绝招；其余招名原创扩展） |
| `sk_dashouyin` | 大手印 | 拳脚/拳掌 | 8 地中 | 阳 | 0.5/0.5 | 天龙、神雕、倚天、鹿鼎 | 各书界番僧/喇嘛（rank 2）；残页 | 原创扩展（借藏传"大手印"之名） |
| `sk_jingangxiangmochu` | 金刚降魔杵 | 兵器/奇门（杵） | 6 玄上 | 阳 | 0.7/0.3 | 神雕 | 拜师达尔巴（rank 2） | 原著兵刃（达尔巴金杵），武学原创扩展 |
| `sk_zhuohuogong` | 拙火功 | 内功/心法 | 4 玄下 | 阳 | 0/1 | 天龙、神雕、倚天、鹿鼎 | 各书界番僧/喇嘛（rank 1） | 原创扩展（借藏传"拙火"之名） |
| `sk_jingangjue` | 金刚橛法 | 兵器/奇门（短兵） | 3 黄上 | 中性 | 0.8/0.2 | 天龙、神雕、倚天、鹿鼎 | 各书界番僧/喇嘛（rank 1）；残页 | 原创扩展（金刚橛为密宗法器） |
| `sk_damingzhou` | 大明咒 | 杂学/音功 | 2 黄中 | 阳 | 0/1 | 天龙、神雕、倚天、鹿鼎 | 各书界番僧/喇嘛 | 原创扩展（六字大明咒） |

### 6.3 天级与地阶条目卡

#### `sk_huoyandao` 火焰刀（天阶下品 · 拳脚·掌（刀气）· 阳）

- **简述**：鸠摩智以掌力化作无形刀气，隔空劈斩；于大理天龙寺曾以之凌空削断燃着的藏香以示其能，又与天龙寺诸僧的六脉神剑相抗（天龙；香数与细节待考）。
- **字段**：`origin canon` · `sect sect_mizong` · `lineage 大雪山大轮寺 → 鸠摩智` · `sourceChapters [ch01_tianlong]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · 招式 `tags [qigong, fire]` · `layerStats {pierce: [2, 10], hit: [2, 10]}`（20）
- **reqs**：`attrs {str: 50, wil: 55}`、`aptitude {apFist: 55, apInner: 50}`、`sect {sect_mizong, rank: 3}` 或鸠摩智羁绊 ≥ 3；`hard: [sect]`
- **层数**：1 刀气劈空、断香、无形刀气｜2 燎原｜3 星火｜4 焚心｜5 火轮、刀气纵横｜6 明王护法｜**7 绝招·大轮焚天**｜8 断香之准｜10 火焰刀大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 刀气劈空 | `mv_huoyandao_pikong` | 1 | 攻 | `aoe_single` 远 1–3 | 0.85 | 8% | 0 | 1000 | `bf_zhuoshao` 20%·2⁺ | ✅ | .85 − .02 |
| 断香 | `mv_huoyandao_duanxiang` | 1 | 攻 | `aoe_single` 远 2–5；`effects: critBonus{value: 15}` | 0.90 | 9% | 1 | 1000 | — | ✅ | 1.17×.85=.995 − 暴击自益 .10 |
| 燎原 | `mv_huoyandao_liaoyuan` | 2 | 攻 | `aoe_line n4` 远；`terrainFx {ignite: [tr_caodi]}` | 0.80 | 10% | 2 | 1000 | `bf_zhuoshao` 50% | ✅ | .75×1.34×.85=.854 −.05 |
| 焚心 | `mv_huoyandao_fenxin` | 4 | 攻 | `aoe_single` 近 1 | 1.25 | 10% | 2 | 1000 | `bf_zhuoshao` 100% | ✅ | 1.34 − .10 |
| 火轮 | `mv_huoyandao_huolun` | 5 | 攻 | `aoe_sweep` | 0.80 | 8% | 1 | 1000 | `bf_zhuoshao` 30% | ✅ | .75×1.12 −.03 |
| 明王护法 | `mv_huoyandao_hufa` | 6 | 架势 | `aoe_self`；`trigger meleeAttacked` | 反击 0.80 | 5% | 2 | 900 | 反击附 `bf_zhuoshao` 50%；`stanceCounter{counterPower: 0.8, expires: nextOwnAction}` | — | 反击型 |
| 大轮焚天（绝招，原创扩展命名） | `mv_huoyandao_fentian` | 7 | 攻·绝 | `aoe_wave d2 w5` 远；点燃草地 | 1.45 | 10% | — | 1200 | `bf_zhuoshao` 100% | ✅ | 3.00×.60×.85=1.53 −.10 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 无形刀气 | `ps_huoyandao_wuxing` | 1 | effect | 本武学对护体真气伤害 ×1.3（`shieldDmgMult`） |
| 星火 | `ps_huoyandao_xinghuo` | 3 | stat | 本武学灼烧施加率 +10pp |
| 刀气纵横 | `ps_huoyandao_zongheng` | 5 | mechanic | 本武学 `ranged` 招式射程 +1 |
| 断香之准 | `ps_huoyandao_zhun` | 8 | stat | 对 3 格以外目标暴击 +10 |
| 火焰刀大成 | `ps_huoyandao_dacheng` | 10 | mechanic | 绝招 +20%；本武学施加的灼烧品阶 +1（上限 12） |

- **setTags**：`[set_mizong_mingwang]`；**conflicts**：无（与六脉神剑的对抗为剧情演出，不设规则）
- **learnSources**：`master ch01 npc_jiumozhi`（交易：以一门地阶以上秘籍相换——致敬原著鸠摩智欲以七十二绝技换六脉神剑谱，原创扩展；maxLayer 8）；`master ch01 npc_jiumozhi`（枯井锚点后大彻大悟，倾囊相授，maxLayer 10）

#### `sk_longxiang` 龙象般若功（天阶中品 · 内功 · 阳）（神雕）

- **简述**：密宗护法神功，每练成一层即增一龙一象之力；共十三层，越往后每层所需功夫成倍递增，金轮法王以数十年苦功练至第十层（神雕；层数与"成倍递增"原文待考）。本作第 10 重对应原著第十层，第十一至十三层不实装。
- **字段**：`origin canon` · `sect sect_mizong` · `lineage 密宗 → 金轮法王` · `sourceChapters [ch03_shendiao]` · `moveSlots 5` · `observable false` · `special {fusible: true}` · `inner.seclusionCap 10`
- **reqs**：`attrs {con: 60, str: 55}`、`aptitude {apInner: 55}`、`sect {sect_mizong, rank: 4}`；`hard: [sect]`
- **内功贡献**：`mpMaxPct 44 · hpMaxPct 34 · attrs {str 10, con 8, wil 3} · mpRegen 3.1` → IP 44+34+42+15.5 = **135.5**（天中 135.5）；`stats {resCC 10, tough 10}`
- **层数**：1 龙象之力｜3 龙象冲、金刚身｜5 般若护身、龙象满盈｜**7 绝招·十龙十象**｜8 龙象大力｜10 十层龙象

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 龙象冲（原创扩展命名） | `mv_longxiang_chong` | 3 | 攻 | `aoe_single` 近 1；招式级 `wOut/wIn 0.4/0.6` | 1.30 | 10% | 2 | 1100 | 击退 2 | ✅ | 1+.24+.10+.07=1.41 −.10 |
| 般若护身（原创扩展命名） | `mv_longxiang_banruo` | 5 | 援 | `aoe_self` | — | 8% | 3 | 900 | `bf_jiangu` 3；`bf_wenzhong` 3 | — | 自身增益 |
| 十龙十象（绝招，原创扩展命名） | `mv_longxiang_shilong` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.80 | 10% | — | 1200 | 击退 3；`bf_xuanyun` 30%·1 | ✅ | 3.00 − .15 − .075 |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 龙象之力 | `ps_longxiang_longxiang` | 1 | stat | 主运时每回合开始 `bf_longxiang` +1 层（上限 = 本功有效层数，06 §8.1） | none |
| 金刚身 | `ps_longxiang_jingang` | 3 | mechanic | 受到 `cc` 标签效果持续 −1（最少 1） | full |
| 龙象满盈 | `ps_longxiang_manying` | 5 | effect | `bf_longxiang` 达上限时：本方拳脚/兵器招式击退距离 +1，`resCC` +20pp | none |
| 龙象大力 | `ps_longxiang_dali` | 8 | stat（Z3） | `bf_longxiang` 达上限时 +10% | none |
| 十层龙象 | `ps_longxiang_shiceng` | 10 | mechanic | 开场即获得 `bf_longxiang` 5 层（原著金轮十层之境） | none |

- **setTags**：`[set_mizong_jinlun]`；**conflicts**：无
- **learnSources**：`master ch03 npc_jinlunfawang`（金轮收徒线——原著金轮欲收郭襄为徒；主角代为"金轮传人"属敌对路线，原创扩展；maxLayer 10）
- **特殊规则**：**成倍递增**——第 5 重起本功武学经验需求 ×1.25（原著之意，数值原创扩展）；配合 `seclusionCap 10`，是"闭关苦修"取向的内功。

#### `sk_wulundazhuan` 五轮大转（地阶上品 · 兵器·奇门（轮）· 阳）（神雕）

- **简述**：金轮法王以金、银、铜、铁、铅五轮为兵刃，飞掷回旋、收发自如，"五轮大转"为其五轮齐出的绝招（神雕）。其余四式以各轮之质定名（原创扩展）。
- **字段**：`origin canonExpanded` · `sect sect_mizong` · `lineage 金轮法王` · `sourceChapters [ch03_shendiao]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: exotic, kinds: [wheel]}`（配 `eq_jinlun` 金轮，design/10 定级，基准 §14 注"以地阶为主"）· `layerStats {hit: [1, 8], parry: [1, 7]}`（15）
- **reqs**：`attrs {str: 50, con: 45, wis: 40}`、`aptitude {apExotic: 50}`、`sect {sect_mizong, rank: 4}`；`hard: [sect]`
- **层数**：1 金轮、银轮、轮鸣｜3 铜轮｜4 铁轮、收发自如｜5 铅轮｜**7 绝招·五轮大转**｜8 五轮连环｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 金轮 | `mv_wulundazhuan_jinlun` | 1 | 攻 | `aoe_boomerang n3` 投射 | 0.70/程 | 7% | 0 | 1000 | — | ✅ | .75×.92=.69 |
| 银轮 | `mv_wulundazhuan_yinlun` | 1 | 攻 | `aoe_chain n2` 投射 | 0.85 | 8% | 1 | 1000 | — | ✅ | .80×1.17×.92=.861 |
| 铜轮 | `mv_wulundazhuan_tonglun` | 3 | 攻 | `aoe_single` 近 1 | 1.20 | 8% | 1 | 1100 | 击退 1 | ✅ | 1+.12+.05+.07=1.24 −.05 |
| 铁轮 | `mv_wulundazhuan_tielun` | 4 | 架势 | `aoe_self` | — | 5% | 2 | 900 | `bf_shoushi` 3（以轮为盾） | — | 自身增益 |
| 铅轮 | `mv_wulundazhuan_qianlun` | 5 | 攻 | `aoe_bolt` 投射 2–4 | 1.20 | 9% | 2 | 1100 | `bf_chihuan` 100%（瞬） | ✅ | (1+.24+.10+.07)×.92=1.297 −.10 |
| 五轮大转（绝招，原著） | `mv_wulundazhuan_dazhuan` | 7 | 攻·绝 | `aoe_multi n5 r2` 投射，目标点 1–4 | 2.35×5 段 | 9% | — | 1200 | — | ✅ | 3.00×.85×.92=2.346 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 轮鸣 | `ps_wulundazhuan_lunming` | 1 | effect | 本武学命中 15% 施加 `bf_luanxin` 1（飞轮嗡鸣扰人心神——原著描写待考） |
| 收发自如 | `ps_wulundazhuan_shoufa` | 4 | mechanic | 投掷招式后轮自动飞回，不脱手、不需拾取 |
| 五轮连环 | `ps_wulundazhuan_lianhuan` | 8 | stat（Z3） | 连续两次以**不同**轮招命中同一目标，第二招 +12%（龙象联动由 `eq_jinlun` 专属特效提供，design/10，不在此重复） |
| 五轮大成 | `ps_wulundazhuan_dacheng` | 10 | mechanic | 绝招 +20% |

- **setTags**：`[set_mizong_jinlun]`；**conflicts**：无
- **learnSources**：`master ch03 npc_jinlunfawang`（maxLayer 10）；`observe`（maxLayer 6）

#### `sk_dashouyin` 大手印（地阶中品 · 拳脚·掌 · 阳）（原创扩展）

- **简述**：借藏传佛教"大手印"之名，以诸般手印（降魔、施无畏、定、转法轮）为招的密宗掌法（原创扩展）；鹿鼎记西藏喇嘛桑结一系所使武功名目待考，本作以大手印作为其代表武学。
- **字段**：`origin expanded` · `sect sect_mizong` · `lineage 大轮寺 → 金轮一脉 → 元廷番僧 → 桑结一系` · `sourceChapters [ch01_tianlong, ch03_shendiao, ch04_yitian, ch08_luding]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `layerStats {defOut: [1, 8], resCC: [1, 7]}`（15）
- **reqs**：`attrs {str: 45, wil: 40, wis: 40}`、`aptitude {apFist: 45}`、`sect {sect_mizong, rank: 2}`；`hard: [sect]`
- **层数**：1 降魔印、施无畏印、金刚掌力｜3 定印｜4 法相｜5 转法轮印｜**7 绝招·大手印**｜8 密乘相应｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 降魔印 | `mv_dashouyin_xiangmo` | 1 | 攻 | `aoe_knock n2` 近 1 | 1.00 | 8% | 1 | 1000 | 击退 2 | ✅ | .95×1.17=1.112 −.10 |
| 施无畏印 | `mv_dashouyin_wuwei` | 1 | 援 | `aoe_single` 友 1–2 | — | 6% | 2 | 900 | 驱散 `mind` 1（≤ 本品阶）；`bf_dingxin` 2 | — | 支援 |
| 定印 | `mv_dashouyin_dingyin` | 3 | 攻 | `aoe_single` 近 1 | 1.20 | 9% | 2 | 1000 | `bf_dingshen` 50%·1⁺ | ✅ | 1.34 − .25×.5 |
| 转法轮印 | `mv_dashouyin_falun` | 5 | 攻 | `aoe_around` | 0.85 | 9% | 2 | 1000 | — | ✅ | .65×1.34=.871 |
| 大手印（绝招） | `mv_dashouyin_dashouyin` | 7 | 攻·绝 | `aoe_leap splash sq3`，目标点 1–3 | 2.60（溅射 ×0.5） | 9% | — | 1200 | — | ✅ | 3.00×.90 − .10 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 金刚掌力 | `ps_dashouyin_jingang` | 1 | effect | 本武学对护体真气伤害 ×1.2（`shieldDmgMult`） |
| 法相 | `ps_dashouyin_faxiang` | 4 | stat（Z3） | 气势 ≥ 50 时 +8% |
| 密乘相应 | `ps_dashouyin_xiangying` | 8 | stat（Z3） | 主运为本派内功（拙火功、龙象般若功）时 +8% |
| 大手印大成 | `ps_dashouyin_dacheng` | 10 | mechanic | 绝招 +20%（低武书界层数上限 8，此被动在鹿鼎不可得） |

- **setTags**：`[set_mizong_mingwang, set_mizong_jinlun]`；**conflicts**：无
- **learnSources**：`master ch01 npc_mizong_lama`（吐蕃武士教头/大轮寺僧，maxLayer 10）；`master ch03 npc_daerba`（金轮门下，maxLayer 10）；`master ch04 npc_mizong_lama`（元廷番僧，待考，maxLayer 10）；`master ch08 npc_sangjie`（鹿鼎，受书界层数上限 8）；`pages it_canye_dashouyin`（番僧掉落，6 页）

### 6.4 玄阶 / 黄阶（紧凑）

**`sk_jingangxiangmochu` 金刚降魔杵**（6 玄上 · 兵器·奇门（杵）· 阳 · 0.7/0.3 · 原著兵刃：达尔巴所使金杵；武学原创扩展）
- `weaponReq {category: exotic, kinds: [pestle]}`（配达尔巴金杵 `eq_jinchu`，design/10 §5.4，`heavy` 双手）；`layerStats {defOut: [1, 6], resCC: [1, 4]}`（10）
- 招式：`mv_jingangxiangmochu_xiangmo` 降魔（L1·单体·收招 1100·**1.05**·7%/0·击退 1；1+.07+.05 −.05）；`mv_jingangxiangmochu_qianjun` 杵落千钧（L3·`aoe_leap` 目标点 1–3 溅射 sq3·**1.00**（溅射 ×0.5）·6%/2；.90×1.24 −.10）；`mv_jingangxiangmochu_hufa` 护法（L5·架势·`aoe_self`·5%/2·`bf_shoushi` 3）；`mv_jingangxiangmochu_fumo` 金刚伏魔（L7·**绝招**·`aoe_around`·**1.90**·8%·`bf_xuanyun` 30%；3.00×.65 −.075）
- 被动：L1 伏魔（本武学命中 20% 施加 `bf_zhenshe` 1；击退 +1 由 `eq_jinchu` 专属特效"降魔杵"提供，不重复）；L4 护法（相邻友方被攻击时 15% 获得 `bf_yuanhu` 1）；L8 大力（`str ≥ 60` 时 Z3 +6%）
- 门槛/获取：`attrs {str: 35}`、`aptitude {apExotic: 30}`、`sect_mizong` rank 2；`master ch03 npc_daerba`｜setTags：`[set_mizong_jinlun]`

**`sk_zhuohuogong` 拙火功**（4 玄下 · 内功 · 阳 · 0/1 · 原创扩展，借藏传"拙火"修法之名）——密宗通传根基内功，火焰刀、龙象般若功的软门槛铺垫；天龙/神雕/倚天/鹿鼎四书界原生。
- 贡献：`mpMaxPct 12 · hpMaxPct 10 · attrs {con 3, str 3} · mpRegen 1.6` → IP 42（玄下 41.5，+1.2%）；`stats {resCold 6, resHeat 4}`
- 招式：`mv_zhuohuogong_zhuohuo` 拙火（L4·援·`aoe_self`·6%/3·驱散自身 `cold` 1＋`bf_quanli` 2）
- 被动：L1 内火（不受品阶 ≤ 本功的 `bf_shouhan`）；L5 火种（本派 `fire` 标签招式灼烧施加率 +10pp）；L10 大成（学习火焰刀、龙象般若功的 `con` 软门槛 −10）
- 门槛/获取：`sect_mizong` rank 1；各书界 `npc_mizong_lama` / 鹿鼎 `npc_sangjie`｜setTags：`[set_mizong_mingwang, set_mizong_jinlun]`

**`sk_jingangjue` 金刚橛法**（3 黄上 · 兵器·奇门（短兵）· 中性 · 0.8/0.2 · 原创扩展，金刚橛为密宗法器）
- `weaponReq {category: exotic, kinds: [dagger]}`；`layerStats {hit: [1, 3], crit: [1, 3]}`（6）
- 招式：`mv_jingangjue_ci` 刺（L1·单体·收招 900·**0.95**·5%/0；1.00 −.07）；`mv_jingangjue_ding` 钉（L1·单体·**1.05**·5%/1·`bf_dingshen` 25%·1；1.12 −.0625）；`mv_jingangjue_zhenmo` 镇魔（L5·单体·**1.15**×2 段·6%/1；1+.12+.05）
- 被动：L1 伏魔（对 `morality ≤ −30` 的敌人 Z3 +5%，敌方品德由 design/12 提供）；L7 法器相应（同时装配大明咒时本武学暴击 +5）
- 门槛/获取：`sect_mizong` rank 1；各书界番僧/喇嘛；残页｜setTags：`[set_mizong_mingwang]`

**`sk_damingzhou` 大明咒**（2 黄中 · 杂学·音功 · 阳 · 0/1 · 原创扩展，六字大明咒）
- 招式：`mv_damingzhou_songzhou` 诵咒（L1·援·`aoe_allies r2`·4%/3·友方 `bf_dingxin` 2）；`mv_damingzhou_hezhou` 喝咒（L4·攻·`aoe_around`·音功远程 `hTol 99`·不可招架·**0.55**·5%/2·`bf_zhenshe` 20%；.65×1.24×.85×.85=.582 −.02）
- 被动：L1 持咒（自身 `resMind` +3pp）；L7 咒力（本武学 `mind` 效果命中 +5%）
- 门槛/获取：无；各书界番僧/喇嘛｜setTags：—

### 6.5 代表人物配置（建议）

| 人物 | 书界 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|---|
| 鸠摩智（Boss） | 天龙 | 小无相功（主）、拙火功 | 火焰刀、大手印；无相劫指 `sk_wuxiangjiezhi`、多罗叶指 `sk_duoluoyezhi`（少林图鉴，引用） | 燃木刀法 `sk_ranmudaofa`（少林图鉴；以火焰刀内劲冒充，待考） | 大明咒 | `set_mizong_mingwang` 4 件；枯井锚点后退场 |
| 金轮法王（Boss） | 神雕 | 龙象般若功（主，10 重）、拙火功 | 大手印 | 五轮大转（`eq_jinlun`） | 大明咒 | `set_mizong_jinlun` 5 件 |
| 达尔巴（精英） | 神雕 | 拙火功 | 大手印 | 金刚降魔杵 | — | 护法援护 |
| 霍都（精英） | 神雕 | 拙火功 | — | 蒙古扇法（射雕/神雕图鉴引用）；金刚橛法 | — | 定位说明见 §6.1 |
| 桑结（Boss） | 鹿鼎 | 拙火功（主） | 大手印（8 重） | 金刚橛法 | 大明咒 | 低武书界本土武学不受品阶压制 |
| 番僧 / 吐蕃武士 | 天龙/倚天/鹿鼎 | 拙火功 | 大手印（精英）/— | 金刚橛法 | 大明咒 | 普通/精英敌人池 |

---

## 7. 西夏一品堂 `sect_yipintang`

### 7.1 门派简介

- **来历**：西夏国招揽天下武学好手的官署，征东大将军赫连铁树统领，努儿海等为其属下（天龙）。一品堂曾以"悲酥清风"迷倒丐帮群雄加以擒押，段誉因吞食莽牯朱蛤百毒不侵而得免（原著；时地待考）。慕容复化名"李延宗"任一品堂军官（原著）。
- **时代变迁与强弱**：只在天龙；西夏于射雕年代亡于蒙古，一品堂不复存在。个人武学中等（以玄阶为主），胜在军阵与毒烟；唯一地阶为悲酥清风。
- **史实元素（原创扩展取材）**：西夏重甲骑兵"铁鹞子"、以旋风砲抛石的"泼喜军"、屏障贺兰山、党项角力之俗——均为史载名目，化为本堂的扩展武学。
- **玩家入口**：应一品堂"招贤"（西夏线，rank 1–3；原著一品堂以招揽天下好手著称）。

### 7.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_beisuqingfeng` | 悲酥清风 | 杂学/毒 | 8 地中 | — | — | 天龙 | 拜师赫连铁树（rank 3） | 原著（机制原创扩展） |
| `sk_tieyaozidao` | 铁鹞子刀法 | 兵器/刀 | 5 玄中 | 阳 | 0.8/0.2 | 天龙 | 一品堂教头（rank 1） | 原创扩展（取西夏"铁鹞子"） |
| `sk_helanxinfa` | 贺兰心法 | 内功/心法 | 4 玄下 | 阳 | 0/1 | 天龙 | 一品堂教头（rank 1） | 原创扩展 |
| `sk_poxifeishi` | 泼喜飞石 | 暗器 | 2 黄中 | — | 1/0 | 天龙 | 一品堂教头 | 原创扩展（取西夏"泼喜军"） |
| `sk_dangxiangshuaijiao` | 党项摔角 | 拳脚/擒拿 | 1 黄下 | 中性 | 0.9/0.1 | 天龙 | 西夏武士 | 原创扩展 |

### 7.3 地阶条目卡

#### `sk_beisuqingfeng` 悲酥清风（地阶中品 · 杂学·毒）

- **简述**：西夏秘制的无色无味毒气，中者泪下如雨（悲）、四肢酸软（酥），状如清风拂面（天龙；症状原文与解药形态待考，06 K3）。本武学为"施放毒烟之法"，毒性效果即 06 `bf_beisu`。
- **字段**：`origin canon` · `sect sect_yipintang` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable false` · `special {fusible: false}` · 无伤害招式（`power 0`，不走倍率预算，以冷却与耗内约束）
- **reqs**：`poi ≥ 40`、`attrs {wis: 40}`、`sect {sect_yipintang, rank: 3}`；`hard: [sect]`
- **层数**：1 清风拂面、解药随身｜3 酥骨烟｜4 无色无味｜7 绝招·悲酥满堂｜8 一品堂秘制｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 清风拂面 | `mv_beisuqingfeng_fumian` | 1 | 控 | `aoe_cone n3` 远；`friendlyFire: all` | 0 | 8% | 3 | 1000 | `bf_beisu` 60%·3⁺ | — | 纯控制；以冷却 3 与敌我皆中为代价 |
| 酥骨烟 | `mv_beisuqingfeng_sugu` | 3 | 控 | `aoe_zone sq3 t=3`，目标点 2–4 | 0 | 9% | 4 | 1000 | 每跳 `bf_beisu` 40% | — | 地面区域 |
| 悲酥满堂（绝招，原创扩展命名） | `mv_beisuqingfeng_mantang` | 7 | 控·绝 | `aoe_field`（敌方） | 0 | 10% | — | 1200 | `bf_beisu` 50% | — | 气势 100 换全场控制 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 解药随身 | `ps_beisuqingfeng_jieyao` | 1 | mechanic | 施放者本人不受本武学的 `bf_beisu`；同队持有悲酥清风解药 `it_beisuqingfeng_jieyao`（design/10 §8）者亦免 |
| 无色无味 | `ps_beisuqingfeng_wuse` | 4 | mechanic | 本武学施放前不显示范围预警（敌方 AI 不据此回避） |
| 一品堂秘制 | `ps_beisuqingfeng_mizhi` | 8 | stat | 本武学效果命中 +10% |
| 悲酥大成 | `ps_beisuqingfeng_dacheng` | 10 | mechanic | 本武学施加的 `bf_beisu` 持续 +1 |

- **setTags**：—；**conflicts**：无；**对抗**：`bf_mian_du`（百毒不侵）按品阶阻挡（段誉即此例）
- **learnSources**：`master ch01 npc_heliantieshu`（maxLayer 10）

### 7.4 玄阶 / 黄阶（紧凑）

**`sk_tieyaozidao` 铁鹞子刀法**（5 玄中 · 兵器·刀 · 阳 · 0.8/0.2 · 原创扩展，取西夏重甲骑兵"铁鹞子"之名）
- `weaponReq {category: blade}`；`layerStats {defOut: [1, 5], hit: [1, 5]}`（10）
- 招式：`mv_tieyaozidao_chongzhen` 冲阵（L1·`aoe_dash n4`·**1.15**·6%/2；1.24 −.10）；`mv_tieyaozidao_pikan` 劈砍（L1·单体·收招 1100·**1.10**·7%/0；1+.07+.05）；`mv_tieyaozidao_hengsao` 横扫（L4·`aoe_sweep`·**0.85**·6%/1；.75×1.12）；`mv_tieyaozidao_tieyao` 铁鹞穿阵（L7·`aoe_dash n4 through`·**1.00**·7%/3；.80×1.41 −.10）
- 被动：L1 骑战（`aoe_dash` 类招式 Z3 +4% → +8%）；L5 披甲（着重甲时 `mov` −1 惩罚被抵消，design/10）；L8 鹞击（对本回合被击退或拉拽过的目标暴击 +10）
- 门槛/获取：`attrs {str: 30}`、`aptitude {apBlade: 30}`、`sect_yipintang` rank 1；`master npc_xixia_jiaotou`｜setTags：—

**`sk_helanxinfa` 贺兰心法**（4 玄下 · 内功 · 阳 · 0/1 · 原创扩展，以西夏屏障贺兰山为名）
- 贡献：`mpMaxPct 14 · hpMaxPct 9 · attrs {con 3, str 3} · mpRegen 1.3` → IP 41.5；`stats {resCC 5, tough 5}`
- 招式：`mv_helanxinfa_zhenqi` 振气（L4·援·`aoe_self`·5%/3·`bf_wenzhong` 2）
- 被动：L1 朔风（`resCold` +5pp）；L6 边塞（`tr_shadi` 沙地移动不减速，design/08）；L10 大成（一品堂武学修炼 +10%）
- 门槛/获取：`sect_yipintang` rank 1；`master npc_xixia_jiaotou`｜setTags：—

**`sk_poxifeishi` 泼喜飞石**（2 黄中 · 暗器 · 1/0 · 原创扩展，取西夏"泼喜军"以旋风砲抛石之史载）
- 弹药：飞蝗石 `it_feihuangshi`（design/10 §8.6）
- 招式：`mv_poxifeishi_feihuang` 飞蝗石（L1·`aoe_bolt` 投射 2–5·**0.90**·5%/0；.92）；`mv_poxifeishi_paoshi` 抛石（L1·`aoe_sq3` 目标点 3–5·弧线越过单位·**0.65**·5%/2·`bf_xuanyun` 10%；.60×1.24×.92=.684 −.025）
- 被动：L1 抛物（本武学投射物走弧线，不被首个单位阻挡）；L7 连发（飞蝗石 20% 追加一枚 ×0.5）
- 门槛/获取：无；`master npc_xixia_jiaotou`｜setTags：—

**`sk_dangxiangshuaijiao` 党项摔角**（1 黄下 · 拳脚·擒拿 · 中性 · 0.9/0.1 · 原创扩展）
- `layerStats {parry: [1, 3], resCC: [1, 3]}`（6）
- 招式：`mv_dangxiangshuaijiao_baoshuai` 抱摔（L1·`aoe_knock n1`·**0.90**·5%/0；.95 −.05）；`mv_dangxiangshuaijiao_banjiao` 绊脚（L1·单体·**0.95**·5%/0·`bf_panshan` 50%；1.00 −.05）；`mv_dangxiangshuaijiao_guojian` 过肩摔（L5·`aoe_swap`·**0.80**·5%/1；.85×1.12 −.15）
- 被动：L1 角力（对被缠绕/定身目标 Z3 +5%）；L7 下盘（`resCC` +3pp）
- 门槛/获取：无；`master npc_xixia_wushi`｜setTags：—

### 7.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 赫连铁树（Boss） | 贺兰心法 | 党项摔角 | 铁鹞子刀法 | 悲酥清风 | 开场放烟，群战型 |
| 努儿海（精英） | 贺兰心法 | 党项摔角 | 铁鹞子刀法 | 泼喜飞石 | — |
| 一品堂武士 | 贺兰心法 | 党项摔角 | 铁鹞子刀法 | 泼喜飞石 | 普通敌人池 |
| 李延宗（慕容复化名） | 见 §5.5 | — | 百家刀法 | 易容术 | 磨坊一战 |

---

## 8. 四大恶人 `sect_sidaeren`

### 8.1 简介（非门派，势力集团）

- **段延庆**（恶贯满盈）：大理延庆太子，遭逆臣所害，双腿残废、喉咙受伤，以腹语说话、以双杖代足；精一阳指等段家武功，以钢杖代指点穴。珍珑棋会上以传音入密指点虚竹（天龙）。
- **叶二娘**（无恶不作）：颊有血痕，轻功与刀法俱佳；原著"偷婴"设定在游戏中**仅以旁白提及，不形成任何可操作内容**。
- **岳老三 / 南海鳄神**（凶神恶煞）：执意自称"岳老二"；兵刃鳄嘴剪、鳄尾鞭，惯于扭断人颈；欲收段誉为徒，阴差阳错反拜段誉为师，后为段延庆所杀（天龙）。
- **云中鹤**（穷凶极恶）：四恶中轻功最佳（原著；兵刃与结局待考）。
- **时代与强弱**：只在天龙；天龙中段的地阶 Boss 群。延庆杖法为本组地阶顶点之一（地上）。
- **玩家入口**：非门派，不可"加入"。①邪派路线与段延庆结交（`morality ≤ −20`、羁绊 ≥ 3）；②"岳老三收徒"事件：`con ≥ 60`（原著岳老三看中段誉后脑骨似己）→ 南海派身份；③击败云中鹤后逼问轻功（原创扩展）。叶二娘刀法仅邪派路线可得。

### 8.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_yanqingzhang` | 延庆杖法 | 兵器/棍杖 | 9 地上 | 阳 | 0.4/0.6 | 天龙 | 段延庆（邪派路线）；观摩（6 重） | 原著（以杖使一阳指），武学名原创扩展 |
| `sk_xuehendao` | 血痕刀法 | 兵器/刀 | 7 地下 | 阴 | 0.7/0.3 | 天龙 | 叶二娘（邪派路线） | 原创扩展（叶二娘兵刃待考） |
| `sk_hexiangbu` | 鹤翔步 | 轻功 | 7 地下 | — | — | 天龙 | 击败云中鹤后逼问；观摩（6 重） | 原著（云中鹤轻功），名目原创扩展 |
| `sk_ezuijian` | 鳄嘴剪 | 兵器/奇门（剪） | 6 玄上 | 阳 | 0.8/0.2 | 天龙 | 岳老三收徒 | 原著兵刃，武学原创扩展 |
| `sk_fuyushu` | 腹语术 | 杂学/心神 | 5 玄中 | — | — | 天龙 | 段延庆（邪派路线）；观摩 | 原著 |
| `sk_eweibian` | 鳄尾鞭 | 兵器/鞭索 | 3 黄上 | 阳 | 0.8/0.2 | 天龙 | 岳老三 / 南海派弟子 | 原著兵刃，武学原创扩展 |
| `sk_niujingshou` | 扭颈手 | 拳脚/擒拿 | 2 黄中 | 阳 | 0.85/0.15 | 天龙 | 岳老三收徒 | 原创扩展 |

### 8.3 地阶条目卡

#### `sk_yanqingzhang` 延庆杖法（地阶上品 · 兵器·棍杖 · 阳）

- **简述**：段延庆以两根细钢杖代足行走，杖尖点出即是一阳指劲力（天龙；与段家剑法的关系待考）。本作将其杖上功夫定名为"延庆杖法"（原创扩展命名），一阳指本身由大理图鉴定义（`sk_yiyangzhi`，仅引用）。
- **字段**：`origin canonExpanded` · `sect sect_sidaeren` · `lineage 段延庆` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: staff}`（配段延庆钢杖 `eq_duanyanqingzhang`，design/10 §5.4 成对；其"杖代指力"让一阳指持杖不降效） · `layerStats {seal: [1, 8], parry: [1, 7]}`（15）
- **reqs**：`attrs {wis: 45, wil: 45}`、`aptitude {apStaff: 50}`、`morality {max: −20}`；`hard: [morality]`＋段延庆羁绊 ≥ 3
- **层数**：1 杖指、双杖、一阳劲｜3 以杖代足｜4 残躯（被动）｜5 杖扫千军｜**7 绝招·杖底一阳**｜8 恶贯满盈｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 杖指 | `mv_yanqingzhang_zhangzhi` | 1 | 攻 | `aoe_single` 近 1–2（杖长） | 0.95 | 7% | 0 | 1000 | `bf_fengxue` 30%·1 | ✅ | 1.00 − .06 |
| 双杖 | `mv_yanqingzhang_shuangzhang` | 1 | 攻 | `aoe_single` 近 1 | 1.10×2 段 | 7% | 1 | 1000 | — | ✅ | 1.12 |
| 以杖代足 | `mv_yanqingzhang_daizu` | 3 | 攻 | `aoe_leap` 目标点 1–4，无溅射 | 0.90 | 7% | 1 | 1000 | — | ✅ | .90×1.12 − .10 |
| 杖扫千军 | `mv_yanqingzhang_saoqian` | 5 | 攻 | `aoe_sweep` | 0.95 | 8% | 2 | 1000 | — | ✅ | .75×1.29=.968 |
| 杖底一阳（绝招，原创扩展命名） | `mv_yanqingzhang_yiyang` | 7 | 攻·绝 | `aoe_single` 近 1–2 | 2.90 | 9% | — | 1200 | `bf_fengxue` 60%·1 | ✅ | 3.00 − .12 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 一阳劲 | `ps_yanqingzhang_yiyangjin` | 1 | effect | 同时装配一阳指（`sk_yiyangzhi`）时，本武学点穴率 +15pp |
| 残躯 | `ps_yanqingzhang_canqu` | 4 | mechanic | 主手持杖时 `tr_nizhao`（泥沼）、`tr_qianshui`（浅水）移动不减速（与 `eq_duanyanqingzhang`"以杖代足"的免蹒跚互补，不重复） |
| 恶贯满盈 | `ps_yanqingzhang_eguan` | 8 | trigger | 击杀时 2 格内敌人 30% 获得 `bf_kongju` 1 |
| 延庆大成 | `ps_yanqingzhang_dacheng` | 10 | mechanic | 绝招 +20% |

- **setTags**：—（备选 `set_sidaeren`，§13.9）；**conflicts**：无
- **learnSources**：`master ch01 npc_duanyanqing`（邪派路线，maxLayer 10）；`observe`（maxLayer 6）

#### `sk_xuehendao` 血痕刀法（地阶下品 · 兵器·刀 · 阴）（原创扩展）

- **简述**：叶二娘轻功卓绝、出手狠辣；其兵刃原著所载待考，本作以薄刃短刀定其刀法，名取其颊上血痕（原创扩展）。
- **字段**：`origin expanded` · `sect sect_sidaeren` · `lineage 叶二娘` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: blade}` · `layerStats {crit: [1, 8], eva: [1, 7]}`（15）
- **reqs**：`attrs {agi: 45, wis: 40}`、`aptitude {apBlade: 45}`、`morality {max: −30}`；`hard: [morality]`
- **层数**：1 薄刃、三痕、嗜血｜3 鬼影｜4 身法诡谲｜5 无恶不作｜**7 绝招·血痕**｜8 夜行｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 薄刃 | `mv_xuehendao_boren` | 1 | 攻 | `aoe_single` 近 1 | 0.95 | 7% | 0 | 1000 | `bf_liuxue` 40%·3⁺ | ✅ | 1.00 − .04 |
| 三痕 | `mv_xuehendao_sanhen` | 1 | 攻 | `aoe_single` 近 1 | 1.15×3 段 | 8% | 1 | 1000 | `bf_liuxue` 30% | ✅ | 1.17 − .03 |
| 鬼影 | `mv_xuehendao_guiying` | 3 | 攻 | `aoe_behind` | 0.85 | 7% | 1 | 1000 | 绕至身后（背击 Z7） | ✅ | .90×1.12 − .15 |
| 无恶不作 | `mv_xuehendao_wue` | 5 | 攻 | `aoe_sweep` | 0.90 | 8% | 2 | 1000 | `bf_liuxue` 50% | ✅ | .75×1.29 − .05 |
| 血痕（绝招） | `mv_xuehendao_xuehen` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.90 | 9% | — | 1200 | `bf_liuxue` 100%·2 层 | ✅ | 3.00 − .10 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 嗜血 | `ps_xuehendao_shixue` | 1 | stat（Z3） | 对流血目标 +5% → +12% |
| 身法诡谲 | `ps_xuehendao_guijue` | 4 | trigger | 命中后 30% 获得 `bf_piaohu` 1 |
| 夜行 | `ps_xuehendao_yexing` | 8 | stat（Z3） | 夜间战斗 +8%（昼夜归 design/11） |
| 血痕大成 | `ps_xuehendao_dacheng` | 10 | mechanic | 绝招 +20% |

- **setTags**：—（备选 `set_sidaeren`）；**conflicts**：无
- **learnSources**：`master ch01 npc_yeerniang`（邪派路线，maxLayer 10）

#### `sk_hexiangbu` 鹤翔步（地阶下品 · 轻功）

- **简述**：云中鹤身形高瘦、轻功为四大恶人之首，追人逃命皆快（天龙）。步法原著未名，本作名"鹤翔步"（原创扩展命名）。轻功贡献 **QS 92**（03 §4.5）。
- **字段**：`origin canonExpanded` · `sect sect_sidaeren` · `lineage 云中鹤` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true`
- **reqs**：`attrs {agi: 45}`、`aptitude {apLight: 45}`；无硬门槛
- **层数**：1 云鹤冲霄、鹤翔｜3 来去如风｜5 鹤唳｜7 穷追不舍｜10 大成（非核心，无绝招）

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 云鹤冲霄 | `mv_hexiangbu_chongxiao` | 1 | 位移 | 跃至 4 格内空格，高差 ≤ jump+3 | — | 4% | 2 | 800 | — | — | 非攻击 |
| 鹤唳 | `mv_hexiangbu_heli` | 5 | 位移 | 本回合已攻击后仍可再移动 ≤ 4 格，无视截击 | — | 4% | 2 | 800 | `bf_piaohu` 1 | — | 打了就跑 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 鹤翔 | `ps_hexiangbu_hexiang` | 1 | stat | `jump` +1 |
| 来去如风 | `ps_hexiangbu_rufeng` | 3 | mechanic | 撤退行动必定成功（同 `bf_dunzou` 的撤退部分） |
| 穷追不舍 | `ps_hexiangbu_zhuiji` | 7 | stat | 追击本回合移动过的敌人时 `mov` +2 |
| 鹤翔大成 | `ps_hexiangbu_dacheng` | 10 | effect | 装配时常驻 `bf_jixing`（地阶 `mov` +2） |

- **setTags**：—（备选 `set_sidaeren`）；**learnSources**：`master ch01 npc_yunzhonghe`（击败后逼问，原创扩展，maxLayer 10）；`observe`（maxLayer 6）

### 8.4 玄阶 / 黄阶（紧凑）

**`sk_ezuijian` 鳄嘴剪**（6 玄上 · 兵器·奇门（剪）· 阳 · 0.8/0.2 · 原著南海鳄神兵刃；武学原创扩展）
- `weaponReq {category: exotic, kinds: [misc]}`（配鳄嘴剪 `eq_ezuijian`，design/10 §5.4；其"主剪副鞭 `critDmg` +10pp"为物品特效，下列被动不重复）；`layerStats {crit: [1, 5], parry: [1, 5]}`（10）
- 招式：`mv_ezuijian_jian` 剪（L1·单体·**0.95**·6%/0·`bf_liuxue` 40%；1.00 −.04）；`mv_ezuijian_jiaojian` 绞剪（L1·单体·**1.25**·7%/2·`bf_jiaoxie` 25%；1+.24+.05 −.0625）；`mv_ezuijian_fanshen` 鳄鱼翻身（L4·`aoe_around`·**0.80**·6%/2；.65×1.24=.806）；`mv_ezuijian_duanjing` 喀喇断颈（L7·**绝招**·单体·**2.90**·8%·`bf_xuanyun` 20%·`effects: critBonus{value: 30}` 仅对气血 < 30% 目标；3.00 −.05 − 条件暴击自益 .05）。表现以剪影与音效处理，不作特写。
- 被动：L1 凶神恶煞（对气血 < 50% 目标 Z3 +4% → +10%）；L4 鳄尾相应（同时装配鳄尾鞭时主副手互换不加收招）；L8 老二不服（原著岳老三执意自称"老二"：被暴击后下一招 Z3 +10%）
- 门槛/获取：`attrs {str: 35}`、`aptitude {apExotic: 30}`；`master npc_yuelaosan`（收徒线 `con ≥ 60`）｜setTags：—（备选 `set_sidaeren`）

**`sk_fuyushu` 腹语术**（5 玄中 · 杂学·心神 · 原著：段延庆喉伤后以腹语说话，并以传音入密指点虚竹破珍珑；效果原创扩展）
- 招式：`mv_fuyushu_huodi` 腹语惑敌（L1·控·单体远 1–4·5%/2·`bf_luanxin` 40%·2⁺）；`mv_fuyushu_chuanyin` 传音入密（L4·援·友方远 1–6·5%/3·友方 `bf_ningshen` 2＋`bf_huixin` 2）；`mv_fuyushu_huanting` 幻听（L7·控·`aoe_diamond r2` 目标点远 1–4·7%/4·`bf_mihuo` 20%·1）
- 被动：L1 腹中之语（被 `bf_fengnei` 封内力时仍可施放本武学）；L6 传音千里（传音入密射程 +2）
- 门槛/获取：`attrs {wil: 30, wis: 30}`；`master npc_duanyanqing`（邪派路线）/ 观摩｜setTags：—（备选 `set_sidaeren`）

**`sk_eweibian` 鳄尾鞭**（3 黄上 · 兵器·鞭索 · 阳 · 0.8/0.2 · 原著南海鳄神副兵刃；武学原创扩展）
- `weaponReq {category: whip}`；`layerStats {hit: [1, 3], parry: [1, 3]}`（6）
- 招式：`mv_eweibian_saowei` 扫尾（L1·`aoe_sweep`·**0.85**·5%/1；.75×1.12）；`mv_eweibian_chou` 抽（L1·单体近 1–2·**0.95**·5%/0·`bf_liuxue` 30%；1.00 −.03）；`mv_eweibian_chan` 缠（L5·单体·**1.05**·5%/1·`bf_chanrao` 30%·2；1.12 −.075）
- 被动：L1 长鞭（"抽"射程 2）；L7 近水（与 `tr_qianshui`/`tr_shenshui` 相邻时本武学 Z3 +6%）
- 门槛/获取：`master npc_yuelaosan` / 南海派弟子｜setTags：—

**`sk_niujingshou` 扭颈手**（2 黄中 · 拳脚·擒拿 · 阳 · 0.85/0.15 · 原创扩展，本于岳老三惯于"喀喇"扭断人颈之原著描写）
- `layerStats {hit: [1, 3], crit: [1, 3]}`（6）
- 招式：`mv_niujingshou_qinjing` 擒颈（L1·单体·**0.95**·5%/0·`bf_dingshen` 20%；1.00 −.05）；`mv_niujingshou_niuduan` 扭断（L1·单体·`condition {targetHpBelow: 0.3}`（罕 +.30）·**1.55**·5%/2；1+.30+.24）
- 被动：L1 蛮力（`str ≥ 50` 时本武学 Z3 +5%）；L7 狠辣（击杀后 `rage` +10）
- 门槛/获取：`master npc_yuelaosan`（收徒线）｜setTags：—

### 8.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 段延庆（Boss） | 大理系内功（引用） | 一阳指 `sk_yiyangzhi`（引用） | 延庆杖法 | 腹语术 | 一阳劲联动 |
| 叶二娘（Boss） | 通用内功 | — | 血痕刀法 | 通用轻功 | 结局锚点（自尽）不可改 |
| 岳老三（Boss） | 通用内功 | 扭颈手 | 鳄嘴剪 / 鳄尾鞭 | — | 收徒事件；被段延庆所杀为锚点 |
| 云中鹤（Boss） | 通用内功 | — | 通用奇门（钢抓，待考） | 鹤翔步 | 逃跑型 Boss，击败后逼问 |

---

## 9. 无量剑派 `sect_wuliang`

### 9.1 门派简介

- **来历**：大理无量山剑湖宫，分东、西二宗（北宗早年迁往山西，待考）；东宗掌门左子穆、西宗掌门辛双清。两宗每五年比剑一次，胜者入住剑湖宫五年，得观后山禁地（天龙）。后山玉壁月夜映出舞剑人影，无量剑派数十年观摩，以为仙人示剑——实为无崖子与李秋水当年对剑之影。其后无量剑为灵鹫宫所收服，改称"无量洞"（待考）。
- **时代与强弱**：只在天龙；天龙开局区域（段誉出场地）的入门门派，本派原生最高为地下（玉壁剑法）。
- **玩家入口**：开局身份可选"无量剑弟子"（chapters/01 定）；比剑事件链 `q_01_faction_71` 胜出者得观玉壁，即获玉壁剑法全本；进一步可凭玉壁解谜接触逍遥派的琅嬛剑法（§2），形成"黄→玄→地（本派）→地（逍遥）"的进阶链（05 §14.6-3）。

### 9.2 门派武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_yubijian` | 玉壁剑法 | 兵器/剑 | 7 地下 | 调和 | 0.6/0.4 | 天龙 | 比剑胜出（10 重）；解谜（玉壁，7 重） | 原创扩展（本于观玉壁剑影之原著情节） |
| `sk_wuliangxinfa` | 无量心法 | 内功/心法 | 4 玄下 | 调和 | 0/1 | 天龙 | 拜师左子穆/辛双清（rank 2） | 原创扩展 |
| `sk_wuliangjian` | 无量剑法 | 兵器/剑 | 3 黄上 | 中性 | 0.8/0.2 | 天龙 | 入门即授 | 原著名目，招式原创扩展 |
| `sk_jianhubu` | 剑湖步 | 轻功 | 1 黄下 | — | — | 天龙 | 入门即授 | 原创扩展 |

### 9.3 地阶条目卡

#### `sk_yubijian` 玉壁剑法（地阶下品 · 兵器·剑 · 调和）（原创扩展）

- **简述**：无量剑派数十年观摩玉壁剑影所得，得其形而未尽其神（原创扩展，本于原著观壁情节）。与逍遥派琅嬛剑法同源，二者同阵时互有加成。
- **字段**：`origin expanded` · `sect sect_wuliang` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `weaponReq {category: sword}` · `layerStats {hit: [1, 8], parry: [1, 7]}`（15）
- **reqs**：`attrs {agi: 40, wis: 40}`、`aptitude {apSword: 40}`、`sect {sect_wuliang, rank: 3}`；`hard: [sect]`（解谜途径免 `sect`）
- **层数**：1 壁影、月照、观壁｜3 湖光｜4 东西合宗｜5 瀑落｜**7 绝招·玉壁仙踪**｜8 剑湖｜10 玉壁悟真

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 壁影 | `mv_yubijian_biying` | 1 | 攻 | `aoe_single` 近 1 | 1.00 | 7% | 0 | 1000 | — | ✅ | 基准 |
| 月照 | `mv_yubijian_yuezhao` | 1 | 攻 | `aoe_single` 近 1；`condition {night 或 moonlitTile}` | 1.25 | 7% | 1 | 1000 | — | ✅ | 1+.12+.15=1.27 |
| 湖光 | `mv_yubijian_huguang` | 3 | 攻 | `aoe_sweep` | 0.90 | 8% | 1 | 1000 | — | ✅ | .75×1.17=.878 |
| 瀑落 | `mv_yubijian_puluo` | 5 | 攻 | `aoe_leap` 目标点 1–3，无溅射；`effects: heightBonusMult{mult: 1.5}` | 1.05 | 8% | 2 | 1000 | — | ✅ | .90×1.29 − .10 |
| 玉壁仙踪（绝招） | `mv_yubijian_xianzong` | 7 | 攻·绝 | `aoe_pierce` | 2.70 | 9% | — | 1200 | — | ✅ | 3.00×.90 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 观壁 | `ps_yubijian_guanbi` | 1 | stat（Z3） | 夜间 +4% → +10% |
| 东西合宗 | `ps_yubijian_hezong` | 4 | stat（Z3） | 2 格内有装配本武学或无量剑法的友方时 +6% |
| 剑湖 | `ps_yubijian_jianhu` | 8 | stat | 站在与水格相邻的格时 `eva` +10 |
| 玉壁悟真 | `ps_yubijian_wuzhen` | 10 | mechanic | 绝招 +20%；学习琅嬛剑法的 `wis` 软门槛 −10、其修炼 +20% |

- **setTags**：—；**conflicts**：无
- **learnSources**：`master ch01 npc_zuozimu / npc_xinshuangqing`（比剑胜出 `q_01_faction_71` 后入剑湖宫后山，maxLayer 10）；`puzzle ch01 q_01_side_71`（非门人私观玉壁，maxLayer 7）

### 9.4 玄阶 / 黄阶（紧凑）

**`sk_wuliangxinfa` 无量心法**（4 玄下 · 内功 · 调和 · 0/1 · 原创扩展）
- 贡献：`mpMaxPct 15 · hpMaxPct 8 · attrs {agi 3, wis 3} · mpRegen 1.4` → IP 42（玄下 41.5，+1.2%）；`stats {hit 5, parry 5}`
- 招式：`mv_wuliangxinfa_guanbi` 观壁静心（L4·援·`aoe_self`·5%/3·`bf_ningshen` 3）
- 被动：L1 剑湖（无量派剑法修炼 +10%）；L6 静观（夜间 `wis` +3，利于玉壁解谜）；L10 大成（学习玉壁剑法的 `wis` 软门槛 −5）
- 门槛/获取：`sect_wuliang` rank 2；`master npc_zuozimu` / `npc_xinshuangqing`｜setTags：—

**`sk_wuliangjian` 无量剑法**（3 黄上 · 兵器·剑 · 中性 · 0.8/0.2 · 原著无量剑派本门剑法，招名原创扩展）
- `weaponReq {category: sword}`；`layerStats {hit: [1, 3], parry: [1, 3]}`（6）
- 招式：`mv_wuliangjian_wuliang` 无量（L1·单体·**1.00**·5%/0）；`mv_wuliangjian_lianhuan` 连环（L1·单体·**1.10**×2 段·5%/1；1.12）；`mv_wuliangjian_jianhu` 剑湖（L5·`aoe_line n2`·**0.95**·5%/1；.85×1.12=.952）
- 被动：L1 两宗（相邻友方装配本武学时命中 +5）；L7 比剑（对同样装配剑法的敌人暴击 +5）
- 门槛/获取：`sect_wuliang` rank 1；`master npc_wuliang_dizi`｜setTags：—

**`sk_jianhubu` 剑湖步**（1 黄下 · 轻功 · 原创扩展）——QS 32。
- 招式：`mv_jianhubu_panya` 攀崖（L1·位移·本次移动可跃上高差 +1·3%/2）
- 被动：L1 山径（`tr_suishi` 碎石地形移动不减速，design/08）；L7 惊鸿（气血首次 < 50% 时 `bf_jixing` 1）
- 门槛/获取：`sect_wuliang` rank 1｜setTags：—

---

## 10. 契丹（辽）`sect_qidan`

### 10.1 简介

- **萧峰**：契丹人，自幼为乔三槐夫妇收养，少林玄苦授艺、汪剑通传降龙十八掌并立为丐帮帮主；聚贤庄一役以太祖长拳等力战天下群雄；身世揭穿后北上，与辽帝耶律洪基结义、任南院大王；雁门关自尽（锚点）。天龙第二十六、二十七回回目"赤手屠熊搏虎""金戈荡寇鏖兵"即写其辽东猎兽与平定楚王之乱（回序待核）。
- **萧远山**：萧峰生父，原为辽国属珊军总教头（待考）；三十年前于雁门关外遭中原群豪伏击、妻亡跳崖未死，此后潜入少林藏经阁偷学武功三十年，终为扫地僧点化（锚点）。
- **时代与强弱**：天龙；辽亡于 1125 年，后世契丹后裔耶律齐等见于神雕，其武功属全真/周伯通一系，不在本组。本组契丹武学以地上品擒龙功为顶，其余为军中与搏兽武学（原创扩展）。
- **玩家入口**：萧峰南院大王线的辽国军职（rank 1–3）；与萧峰结义（`q_01_bond_71`）习擒龙功；藏经阁夜影事件（`q_01_side_73`）后可向萧远山求艺。
- **跨组引用**：降龙十八掌 `sk_xianglong18`（丐帮）、太祖长拳 `sk_taizuchangquan`（通用）、少林七十二绝技（少林）只引用；萧峰人物套装 `set_qidan_xiaofeng` 横跨三组（§13.8）。

### 10.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_qinlonggong` | 擒龙功 | 拳脚/擒拿 | 9 地上 | 阳 | 0.4/0.6 | 天龙 | 萧峰结义羁绊 | 原著名目（萧峰隔空擒物），招式原创扩展 |
| `sk_jingedangkouqiang` | 金戈荡寇枪 | 兵器/枪 | 6 玄上 | 阳 | 0.8/0.2 | 天龙 | 辽军教头（rank 2）；南院大王时的萧峰 | 原创扩展（取回目） |
| `sk_heiyiqianzong` | 黑衣潜踪 | 轻功 | 6 玄上 | — | — | 天龙 | 藏经阁夜影事件后萧远山/慕容博 | 原创扩展（本于二人潜伏藏经阁三十年） |
| `sk_tuxiongbohuquan` | 屠熊搏虎拳 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.8/0.2 | 天龙 | 辽东猎户；萧峰 | 原创扩展（取回目） |
| `sk_qidanlianzhujian` | 契丹连珠箭 | 暗器 | 3 黄上 | — | 1/0 | 天龙 | 契丹武士 | 原创扩展 |
| `sk_banmatui` | 绊马腿 | 拳脚/腿法 | 1 黄下 | 中性 | 0.9/0.1 | 天龙 | 契丹武士 | 原创扩展 |

### 10.3 地阶条目卡

#### `sk_qinlonggong` 擒龙功（地阶上品 · 拳脚·擒拿 · 阳）

- **简述**：萧峰以雄浑内力隔空擒拿，远处之人与兵刃应手而至（天龙；施展场合待考）。06 已将其列为"牵引"`bf_qianyin` 的典型来源。招式为原创扩展。
- **字段**：`origin canonExpanded` · `sect sect_qidan` · `lineage 萧峰` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}` · `layerStats {seal: [1, 6], hit: [1, 9]}`（15）
- **reqs**：`attrs {str: 50, con: 45, wis: 40}`、`aptitude {apGrapple: 45}`、`morality {min: 0}`；`hard: [morality]`＋萧峰羁绊 ≥ 3
- **层数**：1 擒龙、隔空取物、隔空（被动）｜3 锁喉｜4 契丹神力｜5 摔掷｜**7 绝招·擒龙伏虎**｜8 擒龙降龙｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 擒龙 | `mv_qinlonggong_qinlong` | 1 | 攻 | `aoe_pull n3` 远 2–4 | 0.85 | 8% | 1 | 1000 | 牵引 3 格（`bf_qianyin`） | ✅ | .95×1.17×.85=.945 −.10 |
| 隔空取物 | `mv_qinlonggong_gekong` | 1 | 攻 | `aoe_single` 远 1–3 | 1.00 | 9% | 2 | 1000 | `bf_jiaoxie` 50% | ✅ | 1.34×.85=1.139 −.125 |
| 锁喉 | `mv_qinlonggong_suohou` | 3 | 攻 | `aoe_single` 近 1 | 1.05 | 7% | 1 | 1000 | `bf_fengnei` 30%·2⁺ | ✅ | 1.12 − .06 |
| 摔掷 | `mv_qinlonggong_shuaizhi` | 5 | 攻 | `aoe_knock n2` 近 1；`collideDmg 0.3` | 1.15 | 9% | 2 | 1000 | 击退 2（撞击他人则双伤） | ✅ | .95×1.34=1.273 −.10 |
| 擒龙伏虎（绝招，原创扩展命名） | `mv_qinlonggong_fuhu` | 7 | 攻·绝 | `aoe_pull n3` 远 2–4 | 2.20 | 9% | — | 1200 | `bf_xuanyun` 50%·1 | ✅ | 3.00×.95×.85 −.10 −.125 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 隔空 | `ps_qinlonggong_gekong` | 1 | stat | 本武学对距离 ≥ 3 的目标命中 +10 |
| 契丹神力 | `ps_qinlonggong_shenli` | 4 | stat（Z3） | `str ≥ 70` 时 +8% |
| 擒龙降龙 | `ps_qinlonggong_xianglong` | 8 | stat（Z3） | 与降龙十八掌（`sk_xianglong18`）同装配：本武学拉拽命中后，本回合内下一次降龙招式 +8%（≤ 05 §9.2 相生上限） |
| 擒龙大成 | `ps_qinlonggong_dacheng` | 10 | mechanic | 绝招 +20%；拉拽距离 +1 |

- **setTags**：`[set_qidan_xiaofeng]`；**conflicts**：无
- **learnSources**：`master ch01 npc_xiaofeng`（结义羁绊 `q_01_bond_71`，雁门关锚点前，maxLayer 10）

### 10.4 玄阶 / 黄阶（紧凑）

**`sk_jingedangkouqiang` 金戈荡寇枪**（6 玄上 · 兵器·枪 · 阳 · 0.8/0.2 · 原创扩展，取天龙回目"金戈荡寇鏖兵"；辽军马上枪术）
- `weaponReq {category: spear}`（`twoHanded`）；`layerStats {hit: [1, 5], parry: [1, 5]}`（10）
- 招式：`mv_jingedangkouqiang_tuci` 突刺（L1·`aoe_pierce`·**0.95**·7%/0；.90×1.05）；`mv_jingedangkouqiang_hengsao` 横扫千军（L1·`aoe_sweep`·**0.85**·6%/1；.75×1.12）；`mv_jingedangkouqiang_chongfeng` 荡寇冲锋（L4·`aoe_dash n4 through`·**0.90**·6%/2；.80×1.24 −.10）；`mv_jingedangkouqiang_aobing` 鏖兵（L7·**绝招**·`aoe_line n4`·**2.20**·8%·击退 1；3.00×.75 −.05）
- 被动：L1 长兵拒敌（开场获得 `bf_jieji` 2——06 列"长枪拒马"为截击来源）；L4 冲阵（冲锋类招式 Z3 +8%）；L8 鏖战（连续 3 次行动都出手攻击后 Z3 +6%）
- 门槛/获取：`attrs {str: 30}`、`aptitude {apSpear: 30}`、`sect_qidan` rank 2；`master npc_liao_jiaotou` / `npc_xiaofeng`（南院大王时）｜setTags：`[set_qidan_xiaofeng]`

**`sk_heiyiqianzong` 黑衣潜踪**（6 玄上 · 轻功 · 原创扩展，本于萧远山、慕容博各自潜伏少林藏经阁三十年而无人察觉之原著情节）——QS 74。
- 招式：`mv_heiyiqianzong_qianzong` 潜踪（L1·位移·`aoe_self`·5%/5·`bf_yinshen` 2）；`mv_heiyiqianzong_yexing` 夜行（L5·位移·自身移动 ≤ mov+2；终点在敌人身后格时下一击视为背击·5%/3）
- 被动：L1 屏息（探索潜行时被发现距离 −2 格，design/11）；L4 暗室（夜间或 `tr_shinei` 室内开场获得 `bf_yinshen` 1）；L10 大成（隐身解除的一击暴击 +15）
- 门槛/获取：`attrs {agi: 30}`、`aptitude {apLight: 30}`；硬门槛：藏经阁夜影事件 `q_01_side_73`；`master npc_xiaoyuanshan` / `npc_murongbo`｜setTags：—

**`sk_tuxiongbohuquan` 屠熊搏虎拳**（5 玄中 · 拳脚·拳 · 阳 · 0.8/0.2 · 原创扩展，取天龙回目"赤手屠熊搏虎"；辽东猎户与契丹勇士的搏兽拳）
- `layerStats {defOut: [1, 5], hit: [1, 5]}`（10）
- 招式：`mv_tuxiongbohuquan_tuxiong` 屠熊（L1·单体·收招 1100·**1.10**·7%/0；1+.07+.05）；`mv_tuxiongbohuquan_bohu` 搏虎（L1·单体·**1.05**·6%/1·`bf_dingshen` 25%；1.12 −.0625）；`mv_tuxiongbohuquan_chongzhuang` 猛兽冲撞（L4·`aoe_dash n3`·**0.95**·6%/1·击退 1；1.12 −.10 −.05）；`mv_tuxiongbohuquan_chishou` 赤手（L7·**绝招**·单体·**2.90**·8%·`bf_xuanyun` 30%；3.00 −.075）
- 被动：L1 搏兽（对野兽类敌人——design/09 `beast` 标签——Z3 +8% → +15%）；L4 蛮勇（气血 < 50% 时 `resCC` +10pp）；L8 契丹勇士（击杀后 `rage` +10）
- 门槛/获取：`attrs {str: 30}`、`aptitude {apFist: 25}`；`master npc_liao_lieren`（辽东猎户，原创扩展）/ `npc_xiaofeng`｜setTags：`[set_qidan_xiaofeng]`

**`sk_qidanlianzhujian` 契丹连珠箭**（3 黄上 · 暗器 · 1/0 · 原创扩展，契丹骑射之俗）
- 弹药：箭（`it_jian`，建议 design/10 §8.6 增补弓箭类弹药；未增补前以袖箭 `it_xiujian` 代用）
- 招式：`mv_qidanlianzhujian_she` 射（L1·`aoe_bolt` 投射 2–6·**0.90**·5%/0；.92）；`mv_qidanlianzhujian_lianzhu` 连珠（L1·单体投射 2–5·**1.05**×3 段·6%/1；1.17×.92=1.076）；`mv_qidanlianzhujian_chuanyun` 穿云（L5·`aoe_line n3` 远 2–6·**0.85**·5%/2；.80×1.24×.85）
- 被动：L1 骑射（本回合移动后射击不受移动命中惩罚，design/09）；L7 鹰眼（对 4 格以外目标命中 +10）
- 门槛/获取：无；`master npc_liao_wushi`｜setTags：—

**`sk_banmatui` 绊马腿**（1 黄下 · 拳脚·腿 · 中性 · 0.9/0.1 · 原创扩展，辽宋边军步卒绊马之术）
- `layerStats {parry: [1, 3], hit: [1, 3]}`（6）
- 招式：`mv_banmatui_banma` 绊马（L1·单体·**0.95**·5%/0·`bf_panshan` 60%；1.00 −.06）；`mv_banmatui_saotang` 扫堂（L1·`aoe_around`·**0.80**·5%/2·`bf_panshan` 30%；.65×1.24 −.03）
- 被动：L1 下盘（`resCC` +3pp）；L7 断蹄（对骑乘单位 Z3 +10%，骑乘规则归 design/09）
- 门槛/获取：无；`master npc_liao_wushi`｜setTags：—

### 10.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 萧峰（可结义同行） | 少林/通用内功（引用） | 降龙十八掌（引用）、擒龙功、太祖长拳（引用）、屠熊搏虎拳 | 金戈荡寇枪（辽国时期） | — | `set_qidan_xiaofeng` 5 件（辽国时期；须 §13.8 跨组 `setTags` 同步，否则 3 件） |
| 萧远山（Boss，藏经阁） | 少林内功（引用） | 少林七十二绝技（引用）、屠熊搏虎拳 | — | 黑衣潜踪 | 与慕容博同场 |
| 耶律洪基 / 辽军将领 | 通用 | 屠熊搏虎拳 | 金戈荡寇枪 | 契丹连珠箭 | 楚王之乱战役 |
| 辽军 / 契丹武士 | 通用 | 绊马腿 | 金戈荡寇枪（精英） | 契丹连珠箭 | 普通/精英池 |

---

## 11. 聚贤庄 `sect_juxianzhuang`

### 11.1 简介

- **来历**：游骥、游驹兄弟（游氏双雄）为聚贤庄庄主，广交天下英雄；萧峰身世揭穿后，二人召集英雄大会欲诛萧峰，萧峰为救阿朱独闯聚贤庄力战群雄，游氏兄弟死于此役（锚点；庄址与二人兵刃、死因细节待考）。游骥之子游坦之家破后流落辽地，为阿紫所役，误练易筋经又遭冰蚕所噬，得一身阴寒剧毒的奇功；后化名庄聚贤、任丐帮帮主并依附丁春秋（天龙；冰蚕来历与细节待考）。
- **时代与强弱**：只在天龙；庄中武学以玄阶为主，游坦之一脉的冰蚕毒掌为本庄唯一地阶。
- **玩家入口**：英雄大会锚点前可为庄客（rank 1–2）；冰蚕奇遇 `q_01_qiyu_72`。
- **跨组引用**：易筋经 `sk_yijinjing`（少林）；游坦之的丐帮帮主身份由丐帮图鉴与 chapters/01 处理。

### 11.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_bingcanduzhang` | 冰蚕毒掌 | 拳脚/拳掌 | 8 地中 | 阴 | 0.4/0.6 | 天龙 | 冰蚕奇遇（10 重）；游坦之（邪派，8 重） | 原著（游坦之冰蚕寒毒），武学名原创扩展 |
| `sk_shuangxiongdundao` | 双雄盾刀 | 兵器/刀 | 5 玄中 | 阳 | 0.8/0.2 | 天龙 | 游氏双雄（rank 2，锚点前） | 原著人物，兵刃与武学待考/原创扩展 |
| `sk_heweizhen` | 合围阵 | 杂学/阵法 | 3 黄上 | — | — | 天龙 | 庄客（rank 1） | 原创扩展（本于英雄大会群雄合围） |
| `sk_youjiadao` | 游家刀法 | 兵器/刀 | 2 黄中 | 中性 | 0.8/0.2 | 天龙 | 庄客（rank 1） | 原创扩展 |

### 11.3 地阶条目卡

#### `sk_bingcanduzhang` 冰蚕毒掌（地阶中品 · 拳脚·掌 · 阴）

- **简述**：游坦之为冰蚕所噬后，掌力奇寒带毒，中者如坠冰窖；其功以易筋经为根基（天龙；冰蚕来历与中掌症状待考）。武学名为原创扩展。
- **字段**：`origin canonExpanded` · `sect sect_juxianzhuang` · `lineage 游坦之` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true, cost: 见下}` · 招式 `tags [cold, poison]` · `layerStats {effHit: [1, 8], resCold: [1, 7]}`（15）
- **reqs**：`attrs {con: 50, wil: 40, wis: 40}`、`aptitude {apFist: 45}`；无硬门槛（奇遇途径）
- **层数**：1 寒蚕、冰魄、冰蚕寒体｜3 凝霜｜4 寒毒入体｜5 寒绝｜**7 绝招·冰蚕噬心**｜8 易筋根基｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 寒蚕 | `mv_bingcanduzhang_hancan` | 1 | 攻 | `aoe_single` 近 1 | 0.95 | 7% | 0 | 1000 | `bf_hanqi` 60%·2 层 | ✅ | 1.00 − .06 |
| 冰魄 | `mv_bingcanduzhang_bingpo` | 1 | 攻 | `aoe_cone n2` | 0.85 | 8% | 1 | 1000 | `bf_hanqi` 50% | ✅ | .75×1.17=.878 −.05 |
| 凝霜 | `mv_bingcanduzhang_ningshuang` | 3 | 架势 | `aoe_self`；`trigger meleeAttacked` | 反击 0.80 | 5% | 2 | 900 | 反击附 `bf_hanqi` 100%·2 层；`stanceCounter{counterPower: 0.8, expires: nextOwnAction}` | — | 反击型 |
| 寒绝 | `mv_bingcanduzhang_hanjue` | 5 | 攻 | `aoe_single` 近 1 | 1.30 | 9% | 2 | 1000 | `bf_bingdong` 25%·1 | ✅ | 1.34 − .25×.25 |
| 冰蚕噬心（绝招，原创扩展命名） | `mv_bingcanduzhang_shixin` | 7 | 攻·绝 | `aoe_single` 近 1 | 2.90 | 9% | — | 1200 | `bf_handu` 50% | ✅ | 3.00 − 寒毒 .15×.5 |

| 被动 | ID | 层 | 类 | 效果 |
|---|---|---|---|---|
| 冰蚕寒体 | `ps_bingcanduzhang_hanti` | 1 | mechanic | 免疫品阶 ≤ 本武学的 `bf_hanqi`、`bf_bingdong` |
| 寒毒入体 | `ps_bingcanduzhang_rushi` | 4 | effect | 本武学施加寒气时 +1 层 |
| 易筋根基 | `ps_bingcanduzhang_yijin` | 8 | stat（Z3） | 同时装配易筋经（`sk_yijinjing`）时 +8%（原著游坦之以易筋经为根基） |
| 冰蚕大成 | `ps_bingcanduzhang_dacheng` | 10 | mechanic | 绝招 +20% |

- **setTags**：—；**conflicts**：无
- **learnSources**：`qiyu ch01 q_01_qiyu_72`（冰蚕奇遇：须已习易筋经或 `con ≥ 60` 硬扛寒毒，原创扩展，maxLayer 10）；`master ch01 npc_youtanzhi`（邪派路线，maxLayer 8）
- **特殊规则（代价型·轻度）**：**冰蚕反噬**——主运内功不是阳性或调和时，每场开场自身获得 `bf_hanqi` 1 层（原著游坦之受寒毒所苦，细节待考）。

### 11.4 玄阶 / 黄阶（紧凑）

**`sk_shuangxiongdundao` 双雄盾刀**（5 玄中 · 兵器·刀 · 阳 · 0.8/0.2 · 游氏双雄以盾、刀并用之说待考；武学原创扩展）
- `weaponReq {category: blade}`；副手持盾（design/10）时被动全额生效——需新字段 `weaponReq.offHand`（§16 D-3）；`layerStats {parry: [1, 6], defOut: [1, 4]}`（10）
- 招式：`mv_shuangxiongdundao_dunji` 盾击（L1·单体·**0.90**·6%/0·击退 1·`bf_xuanyun` 20%；1.00 −.05 −.05）；`mv_shuangxiongdundao_duanci` 短刺（L1·单体·收招 900·**0.95**·6%/0；1.00 −.07）；`mv_shuangxiongdundao_dunqiang` 盾墙（L4·架势·`aoe_self`·5%/2·`bf_shoushi` 3）；`mv_shuangxiongdundao_heji` 双雄合击（L7·单体·`condition {allyAdjacentToTarget}`（常 +.15）·**1.40**·6%/2；1+.15+.24）
- 被动：L1 持盾（副手持盾时受到的正面攻击伤害 −4% → −8%，Z4）；L5 兄弟同心（相邻友方装配本武学时 `parry` +5）；L8 聚贤（在聚贤庄区域作战 Z3 +8%）
- 门槛/获取：`attrs {str: 30, con: 30}`、`aptitude {apBlade: 30}`、`sect_juxianzhuang` rank 2；`master npc_youji` / `npc_youju`（锚点前）｜setTags：—

**`sk_heweizhen` 合围阵**（3 黄上 · 杂学·阵法 · 原创扩展，本于英雄大会群雄合围萧峰之原著情节）
- 招式：`mv_heweizhen_hewei` 合围（L1·控·单体远 1–4·4%/2·目标 `bf_suoding` 60%·2）；`mv_heweizhen_dujie` 堵截（L4·援·`aoe_allies r2`·5%/3·友方 `bf_jieji` 2）
- 被动：L1 人多势众（每有一名友方与目标相邻，本方对其 Z3 +2%，上限 +6%）；L7 群雄（队伍中具名 NPC 友方 ≥ 2 时，合围冷却 −1）
- 门槛/获取：`formation ≥ 10`；`master npc_youji`（庄客）｜setTags：—

**`sk_youjiadao` 游家刀法**（2 黄中 · 兵器·刀 · 中性 · 0.8/0.2 · 原创扩展）
- `weaponReq {category: blade}`；`layerStats {hit: [1, 3], parry: [1, 3]}`（6）
- 招式：`mv_youjiadao_pidao` 劈刀（L1·单体·**1.00**·5%/0）；`mv_youjiadao_lianzhan` 连斩（L1·单体·**1.10**×2 段·5%/1；1.12）；`mv_youjiadao_huixuan` 回旋斩（L5·`aoe_sweep`·**0.85**·5%/1；.75×1.12）
- 被动：L1 家传（聚贤庄武学修炼 +10%）；L7 刀盾（副手持盾时 `parry` +5）
- 门槛/获取：`sect_juxianzhuang` rank 1；`master npc_juxian_zhuangding`｜setTags：—

### 11.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 游骥 / 游驹（Boss 群战） | 通用 | — | 双雄盾刀 | 合围阵 | 聚贤庄英雄大会（锚点） |
| 游坦之（Boss / 可交涉） | 易筋经（引用） | 冰蚕毒掌 | — | — | 与阿紫、丁春秋、丐帮线交织 |
| 英雄大会群豪 | 通用 | 通用 | 通用 | 合围阵 | 群战配置由 chapters/01 定 |

---

## 12. 神农帮 `sect_shennong`

### 12.1 简介

- **来历**：帮主司空玄，帮众以采药为业，携药锄药篓；与无量剑派争夺无量山，曾逼段誉服下"断肠散"（天龙；药性与发作时日待考）。帮中人亦身中灵鹫宫生死符，受其驱策；司空玄终因生死符之苦投澜沧江（待考）。
- **时代与强弱**：只在天龙；弱小帮派。本作扩展其"药理"特色：以尝百草功为镇帮地阶（原创扩展），成为天龙前期"毒/医"路线的入口。
- **玩家入口**：帮众（rank 1–3）；"生死符之困"支线 `q_01_side_74`（为司空玄求灵鹫宫赐药或请虚竹拔符，原创扩展）可改变其结局（非锚点）。

### 12.2 武学总表

| ID | 名称 | 大类/子类 | 品阶 | 性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_changbaicaogong` | 尝百草功 | 内功/心法 | 7 地下 | 调和 | 0/1 | 天龙 | 拜师司空玄（rank 3） | 原创扩展 |
| `sk_duanchangsan` | 断肠散 | 杂学/毒 | 4 玄下 | — | 0.3/0.7 | 天龙 | 拜师司空玄（rank 2） | 原著名目，机制原创扩展 |
| `sk_shennongyaochu` | 神农药锄 | 兵器/奇门（锄） | 3 黄上 | 中性 | 0.85/0.15 | 天龙 | 入帮即授 | 原创扩展（本于帮众携药锄） |
| `sk_baicaobianyao` | 百草辨药术 | 杂学/医 | 2 黄中 | — | — | 天龙 | 入帮即授 | 原创扩展 |

### 12.3 地阶条目卡

#### `sk_changbaicaogong` 尝百草功（地阶下品 · 内功 · 调和）（原创扩展）

- **简述**：取"神农尝百草"之意，以身试药、渐成抗毒之体的内功（原创扩展）；调和且品阶 7，天然为桥接内功（05 §5.4），适合毒/医路线作辅运。
- **字段**：`origin expanded` · `sect sect_shennong` · `lineage 司空玄` · `sourceChapters [ch01_tianlong]` · `moveSlots 4` · `observable true` · `special {fusible: true}`
- **reqs**：`attrs {con: 40, wis: 40}`、`aptitude {apInner: 40}`、`med ≥ 30` 或 `poi ≥ 30`、`sect {sect_shennong, rank: 3}`；`hard: [sect]`
- **内功贡献**：`mpMaxPct 22 · hpMaxPct 18 · attrs {con 6, wis 4} · mpRegen 2.4` → IP 22+18+20+12 = **72**（地下 72）；`stats {resPoison 10, healPower 5}`
- **层数**：1 药性｜3 辨药调息、百草抗毒｜5 药气渡人｜6 以毒攻毒｜**7 绝招·百草回春**｜10 大成

| 招式 | ID | 层 | 类 | 模板·射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 可架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 辨药调息 | `mv_changbaicaogong_tiaoxi` | 3 | 援 | `aoe_self` | — | 6% | 3 | 900 | 驱散自身 `poison` 1（≤ 本品阶）；治疗 8% hpMax | — | 支援 |
| 药气渡人 | `mv_changbaicaogong_duren` | 5 | 援 | `aoe_single` 友 1 | — | 7% | 3 | 1000 | 驱散目标 `poison` 1；`bf_bidu` 3 | — | 支援 |
| 百草回春（绝招） | `mv_changbaicaogong_huichun` | 7 | 援·绝 | `aoe_allies r2` | — | 9% | — | 1200 | 治疗 20% 目标 hpMax；驱散 `poison` 2 | — | 群体治疗按 AF 折算（05 §4.2 支援预算） |

| 被动 | ID | 层 | 类 | 效果 | 辅运 |
|---|---|---|---|---|---|
| 药性 | `ps_changbaicaogong_yaoxing` | 1 | effect | 使用丹药/药物的效果 +10% → +25% | scaled |
| 百草抗毒 | `ps_changbaicaogong_kangdu` | 3 | stat | 本场每承受一种新的 `poison` 子标签效果，`resPoison` +3pp（本战上限 +15pp） | scaled |
| 以毒攻毒 | `ps_changbaicaogong_yidu` | 6 | stat | 自身中毒时本方毒类效果命中 +10% | scaled |
| 尝百草大成 | `ps_changbaicaogong_dacheng` | 10 | mechanic | 战斗外采药产量 +50%（design/11）；百草回春治疗量 +20% | none |

- **setTags**：—；**conflicts**：无
- **learnSources**：`master ch01 npc_sikongxuan`（maxLayer 10）

### 12.4 玄阶 / 黄阶（紧凑）

**`sk_duanchangsan` 断肠散**（4 玄下 · 杂学·毒 · 0.3/0.7 · 原著名目：神农帮逼段誉服下；机制原创扩展）
- 招式：`mv_duanchangsan_xiadu` 下毒（L1·攻·单体投射 1–3·**1.05**·6%/2·`bf_zhongdu` 70%·2 层；1.24×.92=1.141 −.07）；`mv_duanchangsan_duanchang` 断肠（L4·攻·单体投射 1–3·**1.20**·6%/3·`bf_judu` 40%；1.36×.92=1.251 −.06）；战斗外可在饮食中下毒（事件接口归 design/11、12）
- 被动：L1 药引（对已中毒目标效果命中 +10%）；L6 解药在我（施毒者本人免疫本武学之毒；战斗外可为他人解断肠散）
- 门槛/获取：`poi ≥ 25`、`sect_shennong` rank 2；`master npc_sikongxuan`｜setTags：—

**`sk_shennongyaochu` 神农药锄**（3 黄上 · 兵器·奇门（锄）· 中性 · 0.85/0.15 · 原创扩展，本于帮众携药锄之原著描写）
- `weaponReq {category: exotic, kinds: [misc]}`；`layerStats {hit: [1, 3], parry: [1, 3]}`（6）
- 招式：`mv_shennongyaochu_chu` 锄（L1·单体·**1.00**·5%/0）；`mv_shennongyaochu_gou` 勾（L1·`aoe_pull n1`·**0.95**·5%/1；.95×1.12 −.10）；`mv_shennongyaochu_fantu` 翻土（L5·`aoe_sweep`·**0.85**·5%/1；.75×1.12）
- 被动：L1 采药（战斗外采集药草产量 +10%，design/11）；L7 药锄护身（持药锄时 `resPoison` +5pp）
- 门槛/获取：`sect_shennong` rank 1｜setTags：—

**`sk_baicaobianyao` 百草辨药术**（2 黄中 · 杂学·医 · 原创扩展）
- 招式：`mv_baicaobianyao_fuyao` 敷药（L1·援·友方 0–1·5%/2·治疗目标 hpMax 12%＋驱散 `poison` 1，≤ 本品阶）
- 被动：L1 辨药（探索中可辨识未知药材与毒物，design/10、11）；L7 药理（`healPower` +5pp）
- 门槛/获取：`med ≥ 10`、`sect_shennong` rank 1｜setTags：—

### 12.5 代表人物配置（建议）

| 人物 | 内功 | 拳脚 | 兵器 | 非核心 | 备注 |
|---|---|---|---|---|---|
| 司空玄（精英） | 尝百草功 | 通用掌法 | 神农药锄 | 断肠散 | 身中生死符（剧情状态） |
| 神农帮众 | 通用 | — | 神农药锄 | 百草辨药术 | 敌方医者：会给同伴敷药 |

---

## 13. 套装候选（交 design/07 定稿）

### 13.0 通则（建议）

| 项 | 建议 |
|---|---|
| 计件 | 按 05 §6.5：装配中的武学 + 穿戴中的装备；辅运内功计件；兵器栏"不可用"仍计件；一门武学对同一套装只计 1 件 |
| 数值口径 | 下表数值为**套装品阶 = 地中（G 2.2）**的参考值；建议 design/07 以 `参考值 × G(套装品阶) / 2.2` 缩放；套装品阶建议取已计件成员**有效品阶**的中位数（向下取整），外来压制因此自然传导 |
| 记法 | 沿用 06 §4.7：`attr:<id> pct/pp/flat`（属性层）、`Z3`/`Z4`（增伤/减伤乘区）、`settle`（结算层）、机制类注明 |
| 携带约束 | 核心武学携带 高 3/3/3、中 2/2/2、低 1/1/1；轻功/暗器/杂学**不可携带**；装备可携带 6 件（任意品阶）。"可达成性"按"携带件 + 该书界本土件 + 携带装备"计算 |

### 13.1 `set_xiaoyao_xiaoyaoyou` 逍遥游（门派套装·逍遥派）

- **构成（8 候选）**：`sk_beiming`（天上·内）、`sk_lingbo`（天中·轻）、`sk_zhemei`（天下·擒）、`sk_baihongzhang`（地上·掌）、`sk_langhuanjian`（地下·剑）、`sk_zuowangxinfa`（玄中·内）、`sk_fuyaotui`（黄上·腿）、`eq_qibaozhihuan`（七宝指环，逍遥派掌门信物，原著；**建议** design/10 按峨眉铁指环 `eq_tiezhihuan` 的"掌门信物"模式增设为佩饰）

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | `attr:qinggong flat +15`；`attr:eva pct +4%` | 属性层 |
| 3 | 本回合移动 ≥ 3 格后，所有招式 +8% | Z3 |
| 4 | 开场获得 `bf_canying` 1 层；辅运内功比例 +0.05（上限 0.60） | 机制 / 05 §5.2 |
| 5 | 北冥吸内量 +30%；吸内时回复等量 50% 的气血（每回合 ≤ 3% hpMax） | settle |

- **跨品阶混搭**：天上北冥 + 天下折梅 + 地下琅嬛 + 黄上扶摇即成 4 件；黄上/玄中两件使入门弟子在北冥受 `earlyException` 限速的第 3 幕前也能凑 2–3 件。
- **低武（1/1/1）**：北冥（内）+ 折梅或白虹（拳脚）+ 琅嬛（兵器）= 3 件，加七宝指环（待 design/10 增设）= **4 件**；5 件需凌波（非核心不可带）或第二门内功/拳脚，低武不可达；中武（2/2/2）可达 5 件。

### 13.2 `set_xiaoyao_xuzhu` 虚竹子（人物传承套装）

- **构成（7 候选）**：`sk_beiming`、`sk_bahuang`、`sk_xiaowuxiang`、`sk_liuyangzhang`、`sk_zhemei`、`sk_shengsifu`、`eq_qibaozhihuan`
- **阈值只设 2/3/4**：成员全为逍遥系天级，而 02 §2.9 R4 规定逍遥系单周目至多取 3，故上限为"3 门 + 七宝指环 = 4 件"。

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | 本套装的阴、阳两门内功同装配时视同桥接，不触发内息相冲（05 §5.4）；`attr:hpMax pct +5%` | 机制 / 属性层 |
| 3 | 天山六阳掌、天山折梅手招式 +8%；`attr:seal pp +8` | Z3 / 属性层 |
| 4 | 三老合一：生死符效果命中 +15%、"拔符"冷却 −1；三门逍遥内功同装配时两门辅运比例固定 0.60 | 属性层 / 机制 |

- **跨品阶混搭**：全员天阶（天上/天中/天下），是本组"天级浓度"最高、但件数最受限的套装——用"取哪 3 门"制造取舍。
- **低武**：北冥（内）+ 六阳或折梅（拳脚）= 2 件，加七宝指环（待 design/10 增设）= **3 件**（本套无兵器件）。

### 13.3 `set_lingjiu_jiutian` 九天九部（门派套装·灵鹫宫）

- **构成（6 候选）**：`sk_bahuang`（天下·内）、`sk_piaomiaojian`（地下·剑）、`sk_jiutianjiubu`（玄上·阵）、`sk_zhenshenfeizhen`（玄下·暗）、`sk_lingjiuxinfa`（黄上·内）、`sk_piaomiaobu`（黄中·轻）

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | `attr:parry pct +4%`；2 格内每名装配灵鹫宫武学的友方使你 `attr:effRes pct +2%`（上限 +8%） | 属性层 |
| 3 | 缥缈剑法、针神飞针招式 +8%；暗器弹药消耗 −1（每场 3 次） | Z3 / 机制 |
| 4 | 九天九部阵半径 +1；阵中友方受到伤害 −5% | 机制 / Z4 |
| 5 | 天山号令：开场 `rage +20`；击杀后获得 `bf_juqi` 2 | 机制 |

- **跨品阶混搭**：入宫即授的黄上心法 + 黄中缥缈步即成 2 件，是本组最平滑的"黄→天"门派套装。
- **低武**：八荒（或心法）+ 缥缈剑法 = **2 件**（本套无拳脚件）；中武 3 件。如实标注：本套为"天龙本地套装"，跨书界价值低。

### 13.4 `set_xingxiu_laoxian` 星宿老仙（门派套装·星宿派）

- **构成（8 候选）**：`sk_huagong`（地上·内）、`sk_chousuizhang`（地中·掌）、`sk_sanxiaoxiaoyaosan`（地下·毒）、`sk_fushidu`（玄上·毒）、`sk_chanhunwang`（玄中·鞭）、`sk_bilinzhang`（玄下·掌）、`sk_xingxiudugong`（黄上·内）；〔条件候选〕神木王鼎——design/10 现列为奇物 `it_shenmuwangding`，按 05 §6.5 不计件；**建议** design/10 增设可佩戴版 `eq_shenmuwangding`（佩饰），采纳后为第 8 件

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | 施加 `poison` 标签效果时效果命中 +10% | 属性层（条件） |
| 3 | 对中毒目标 +8% | Z3 |
| 4 | 本方施加的 `poison` 效果持续 +1 | 机制 |
| 5 | 星宿老仙：获得永久 `bf_mian_du`，品阶 = 套装品阶 −2（06 §3.5 品阶对抗照常） | 机制 |

- **跨品阶混搭**：地上化功 + 地中抽髓 + 玄中缠魂网 + 地下三笑 = 4 件；黄上毒功 + 玄下碧磷掌让入门弟子即可凑 2–3 件。
- **低武**：化功（内）+ 抽髓（拳脚）+ 缠魂网（兵器）= **3 件**；若可佩戴的神木王鼎被采纳则 4 件；5 件需毒类杂学（不可带），不可达。

### 13.5 `set_murong_huanshi` 以彼之道（门派/人物套装·姑苏慕容）

- **构成（6 候选）**：`sk_douzhuan`（天下·内）、`sk_canhezhi`（地中·指）、`sk_baijiadao`（地下·刀）、`sk_murongjian`（玄上·剑）、`sk_longchengxinfa`（玄中·内）、`sk_yizhenfengdao`（黄上·刀）

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | `bf_douzhuan` 概率 +3pp；`attr:counter pp +5` | 机制 / 属性层 |
| 3 | 被敌方招式命中后，下一招与来袭招式同大类时 +10% | Z3 |
| 4 | 斗转奉还倍率 +0.1（与"斗转大成"相加，至多 ×1.1）；观摩领悟 +30% | 机制 |
| 5 | 还施彼身：每场首次被敌方绝招命中时，若该绝招品阶 ≤ 套装品阶，则必定奉还（仍受 `bf_douzhuan` 距离限制；每战 1 次） | 机制 |

- **跨品阶混搭**：一条完整的黄→玄→地→天链（一阵风刀 → 龙城/慕容剑 → 百家刀/参合 → 斗转）；刀、剑两门兵器同装配时只有一门可用，但两门都计件（05 §6.5-3）。
- **低武**：斗转 + 参合 + 百家刀（或慕容剑）= **3 件**；中武（2/2/2）可达 5 件。

### 13.6 `set_mizong_mingwang` 大轮明王（人物套装·鸠摩智，跨门派）

- **构成（5 候选 + 待补）**：`sk_huoyandao`（天下·掌）、`sk_xiaowuxiang`（天中·内，逍遥派）、`sk_dashouyin`（地中·掌）、`sk_zhuohuogong`（玄下·内）、`sk_jingangjue`（黄上·奇门）；〔跨组候选，待 `skills-shaolin` 同步 `setTags`〕鸠摩智冒用或施展过的七十二绝技：无相劫指 `sk_wuxiangjiezhi`（地上·指）、多罗叶指 `sk_duoluoyezhi`（地下·指）、燃木刀法 `sk_ranmudaofa`（地上·刀）、袈裟伏魔功 `sk_jiashafumogong`（地中·奇门）——"以小无相功催动七十二绝技"。

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | `fire` 标签招式 +5%；灼烧施加率 +10pp | Z3 / 属性层 |
| 3 | `attr:rageGain pp +15` | 属性层 |
| 4 | 火焰刀 `ranged` 招式射程 +1；本方对护体真气伤害 ×1.2 | 机制 / settle |
| 5 | 吐蕃国师：本战首次施放绝招后，火焰刀招式冷却 −1 | 机制 |

- **跨品阶混搭**：天中小无相 + 天下火焰刀 + 地中大手印 + 玄下拙火 + 黄上金刚橛，跨两门派五个品阶，体现鸠摩智"偷学他派"。
- **低武**：**鹿鼎可达 5 件**——携带小无相（内）、火焰刀（拳脚）、金刚橛（兵器）＋鹿鼎本土习得拙火功（第 2 内功栏）、大手印（第 2 拳脚栏）；本土件不受携带数与品阶压制限制。连城/白马/鸳鸯只有携带的 3 件。

### 13.7 `set_mizong_jinlun` 龙象金轮（人物套装·金轮法王）

- **构成（6 候选）**：`sk_longxiang`（天中·内）、`sk_wulundazhuan`（地上·奇门）、`sk_dashouyin`（地中·掌）、`sk_jingangxiangmochu`（玄上·奇门）、`sk_zhuohuogong`（玄下·内）、`eq_jinlun`（金轮，基准 §14 注"以地阶为主"，design/10 定）

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | `attr:resCC pp +10`；本方击退类招式距离 +1 | 属性层 / 机制 |
| 3 | 开场获得 `bf_longxiang` 2 层 | 机制 |
| 4 | 投射（`projectile`）招式 +10% | Z3 |
| 5 | 国师威仪：五轮大转段数 +1、倍率 ×1.1（与 `eq_jinlun`"五轮齐飞"特效并存） | 机制（改写招式段数与倍率） |

- **跨品阶混搭**：天中龙象 + 地上五轮 + 地中大手印 + 玄上降魔杵 + 玄下拙火 + 金轮。
- **低武**：**鹿鼎可达 5 件**——携带龙象（内）、五轮大转（兵器）、金轮（装备）＋鹿鼎本土大手印、拙火功。降魔杵为神雕独有，不影响 5 件达成。

### 13.8 `set_qidan_xiaofeng` 契丹英雄（人物套装·萧峰，跨门派）

- **构成（5 候选）**：`sk_xianglong18`（天上·掌，丐帮图鉴）、`sk_qinlonggong`（地上·擒）、`sk_jingedangkouqiang`（玄上·枪）、`sk_tuxiongbohuquan`（玄中·拳）、`sk_taizuchangquan`（黄上·拳，通用图鉴）

| 件数 | 效果（参考值） | 作用层 |
|---|---|---|
| 2 | 拳脚招式 `attr:pierce pct +8%` | 属性层 |
| 3 | 聚贤庄：相邻敌人 ≥ 3 时 +10% 伤害、受到伤害 −10% | Z3 / Z4 |
| 4 | 击杀后 `rage +15`；`attr:tough pct +8%` | 机制 / 属性层 |
| 5 | 雁门：气血首次 < 30% 时获得 `bf_kuangshi` 3 与 `bf_mian_kong` 1 | 机制 |

- **跨品阶混搭**：与 05 D7 的 `set_shaolin_jingang`（少林金刚）同构——天上降龙 + 地上擒龙 + 玄中搏虎 + 黄上太祖长拳，四个大阶各一件即成 4 件。
- **低武**：拳脚栏只能带 1 门（降龙）、兵器带金戈荡寇枪 → **2 件**；太祖长拳的原生书界只到倚天（05 §13.5），低武无本土途径。中武（2/2/2）3 件。若希望萧峰套装在低武可用，建议将"天下通行"的太祖长拳本土书界扩至中/低武（§16 D-6）。
- **跨组同步**：`sk_xianglong18`（现 `setTags [set_gaibang_bangzhu]`）与 `sk_taizuchangquan` 需追加 `set_qidan_xiaofeng`，否则构建期双向校验失败（05 §6.5-6）。

### 13.9 备选（未展开，交 design/07 取舍）

| 套装 | 构成 | 定位 |
|---|---|---|
| `set_sidaeren` 四大恶人 | 延庆杖法、血痕刀法、鳄嘴剪、鹤翔步、腹语术、鳄尾鞭、扭颈手 | 邪派路线趣味套装；建议 2 件"恶名"（击杀时 2 格内敌人 20% `bf_kongju`）、3 件对气血 < 50% 目标 Z3 +10%、4 件开场对 3 格内敌人施 `bf_zhenshe` |
| `set_yipintang_tieyao` 铁鹞子 | 铁鹞子刀法、贺兰心法、泼喜飞石、党项摔角、悲酥清风 | 西夏军阵低阶套装；2 件冲锋 Z3 +5%、3 件着重甲无移动惩罚 |

---

## 14. 本组统计

### 14.1 门派 × 品阶（12 级）

| 门派 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 | 黄 | 玄 | 地 | 天 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 逍遥派 | — | 1 | 1 | — | 1 | 1 | 1 | — | 1 | 1 | 3 | 1 | 2 | 2 | 2 | 5 | **11** |
| 灵鹫宫 | — | 1 | 1 | 1 | — | 1 | 1 | — | — | 2 | — | — | 2 | 2 | 1 | 2 | **7** |
| 星宿派 | 1 | — | 1 | 1 | 1 | 1 | 1 | 1 | 1 | — | — | — | 2 | 3 | 3 | 0 | **8** |
| 姑苏慕容 | — | 1 | 1 | — | 1 | 2 | 1 | 1 | — | 1 | — | — | 2 | 3 | 2 | 1 | **8** |
| 吐蕃密宗 | — | 1 | 1 | 1 | — | 1 | — | 1 | 1 | 1 | 1 | — | 2 | 2 | 2 | 2 | **8** |
| 西夏一品堂 | 1 | 1 | — | 1 | 1 | — | — | 1 | — | — | — | — | 2 | 2 | 1 | 0 | **5** |
| 四大恶人 | — | 1 | 1 | — | 1 | 1 | 2 | — | 1 | — | — | — | 2 | 2 | 3 | 0 | **7** |
| 无量剑派 | 1 | — | 1 | 1 | — | — | 1 | — | — | — | — | — | 2 | 1 | 1 | 0 | **4** |
| 契丹（辽） | 1 | — | 1 | — | 1 | 2 | — | — | 1 | — | — | — | 2 | 3 | 1 | 0 | **6** |
| 聚贤庄 | — | 1 | 1 | — | 1 | — | — | 1 | — | — | — | — | 2 | 1 | 1 | 0 | **4** |
| 神农帮 | — | 1 | 1 | 1 | — | — | 1 | — | — | — | — | — | 2 | 1 | 1 | 0 | **4** |
| **合计** | **4** | **8** | **10** | **6** | **7** | **9** | **8** | **5** | **5** | **5** | **4** | **1** | **22** | **22** | **18** | **10** | **72** |

- 大阶占比：天 13.9% / 地 25.0% / 玄 30.6% / 黄 30.6%，落在 05 §14.4 高武目标（天 10–15、地 20–25、玄 30–35、黄 30–35）之内（地阶贴上限）。
- 天级 10 门与基准 §13 逐条一致：天上 北冥；天中 小无相、凌波、六阳、龙象；天下 折梅、八荒、生死符、斗转、火焰刀。未新增天级。

### 14.2 类别 × 大阶

| 类别 | 天 | 地 | 玄 | 黄 | 合计 | 所属 |
|---|---|---|---|---|---|---|
| 内功·心法 | 5 | 2 | 5 | 2 | 14 | 北冥、小无相、八荒、斗转、龙象 / 化功、尝百草功 / 坐忘、龙城、拙火、贺兰、无量心法 / 灵鹫心法、星宿毒功 |
| 拳脚·拳掌 | 2 | 4 | 2 | 0 | 8 | 六阳、火焰刀 / 白虹、抽髓、大手印、冰蚕 / 碧磷、屠熊搏虎 |
| 拳脚·指法 | 0 | 1 | 0 | 0 | 1 | 参合指 |
| 拳脚·腿法 | 0 | 0 | 0 | 2 | 2 | 扶摇腿、绊马腿 |
| 拳脚·擒拿 | 1 | 1 | 0 | 2 | 4 | 折梅 / 擒龙 / 扭颈手、党项摔角 |
| 兵器·剑 | 0 | 3 | 1 | 1 | 5 | 琅嬛、缥缈、玉壁 / 慕容剑 / 无量剑 |
| 兵器·刀 | 0 | 2 | 2 | 2 | 6 | 百家刀、血痕刀 / 铁鹞子、双雄盾刀 / 一阵风刀、游家刀 |
| 兵器·棍杖 | 0 | 1 | 0 | 0 | 1 | 延庆杖法 |
| 兵器·枪 | 0 | 0 | 1 | 0 | 1 | 金戈荡寇枪 |
| 兵器·鞭索 | 0 | 0 | 1 | 1 | 2 | 缠魂网 / 鳄尾鞭 |
| 兵器·奇门 | 0 | 1 | 2 | 2 | 5 | 五轮大转 / 降魔杵、鳄嘴剪 / 金刚橛、神农药锄 |
| 轻功 | 1 | 1 | 1 | 3 | 6 | 凌波 / 鹤翔步 / 黑衣潜踪 / 逍遥步、缥缈步、剑湖步 |
| 暗器 | 1 | 0 | 1 | 2 | 4 | 生死符 / 针神飞针 / 泼喜飞石、契丹连珠箭 |
| 杂学 | 0 | 2 | 6 | 5 | 13 | 悲酥清风、三笑 / 传音搜魂、九天九部阵、腐尸毒、易容术、腹语术、断肠散 / 颂仙曲、非也非也、大明咒、合围阵、百草辨药术 |
| **合计** | **10** | **18** | **22** | **22** | **72** | 核心（内/拳脚/兵器）49、非核心 23 |

### 14.3 按原生书界

| 书界 | 境界 | 可习得（本组） | 天 | 地 | 玄 | 黄 | 其中首现 | 本土核心（内/拳脚/兵器） | 说明 |
|---|---|---|---|---|---|---|---|---|---|
| 01 天龙 | 高 | 69 | 9 | 17 | 21 | 22 | 69 | 13 / 15 / 18 | 本组主场；天级 9 门占基准 §13 天龙 14 门中的 9 门 |
| 03 神雕 | 高 | 7 | 1 | 2 | 2 | 2 | 3（龙象、五轮、降魔杵） | 2 / 1 / 3 | 金轮一脉 + 密宗通传 4 门 |
| 04 倚天 | 高 | 4 | 0 | 1 | 1 | 2 | 0 | 1 / 1 / 1 | 番僧（密宗通传） |
| 08 鹿鼎 | 低 | 4 | 0 | 1 | 1 | 2 | 0 | 1 / 1 / 1 | 桑结一系：拙火功 / 大手印 / 金刚橛法，恰补 1/1/1（05 §14.6-4） |

> 其余书界本组无原生武学（逍遥、灵鹫、星宿、慕容、一品堂、四大恶人、无量、契丹、聚贤庄、神农帮均止于天龙）。本组对中武书界没有原生贡献，中武"填满装配栏"依赖其他图鉴；本组以携带与套装设计（§13）回应跨书界价值：5 个套装在低武可达 ≥ 3 件（若 design/10 增设七宝指环则为 6 个；可佩戴神木王鼎另使星宿老仙升至 4 件）；大轮明王、龙象金轮在鹿鼎可达 5 件。

---

## 15. 本文新增 ID

| 类别 | 数量 | 说明 |
|---|---|---|
| 门派 | 11 | `sect_xiaoyao` `sect_lingjiu` `sect_xingxiu` `sect_murong` `sect_mizong` `sect_yipintang` `sect_sidaeren`（势力集团，非门派） `sect_wuliang` `sect_qidan` `sect_juxianzhuang` `sect_shennong`（职级表归 design/12） |
| 武学 | 72 | 天级 10 为基准 §13 既有 ID；`sk_huagong` 沿用 05 已引用 ID；**新增 61**（清单见下） |
| 招式 | 233 | `mv_<武学拼音>_<招式拼音>`，全部挂在上列 72 门之下 |
| 被动（带 ID） | 121 | 天/地条目卡的 `ps_*`；玄/黄紧凑卡被动只给名称与解锁层，配表时按 `ps_<武学拼音>_<拼音>` 生成（约 58 条） |
| 套装候选 | 8 + 备选 2 | `set_xiaoyao_xiaoyaoyou` `set_xiaoyao_xuzhu` `set_lingjiu_jiutian` `set_xingxiu_laoxian` `set_murong_huanshi` `set_mizong_mingwang` `set_mizong_jinlun` `set_qidan_xiaofeng`；备选 `set_sidaeren` `set_yipintang_tieyao` |
| Buff 提案 | 1 | `bf_sanxiao`（§16.2 B-1）；其余附带效果全部引用 06 目录已有 ID（共 76 个） |
| 效果钩子 / 字段提案 | 1 + 7 | 钩子 `curveLos`；`condition` 键 `adjacentFallenUnit` `attackedByTargetSinceLastAction` `targetLastMoveCat` `allyAdjacentToTarget` `targetHpBelow` `night`/`moonlitTile` `targetHasTag`；`weaponReq.offHand`（§16.3） |
| 任务占位 | 12 | `q_01_qiyu_71`（无量山玉洞）`q_01_qiyu_72`（冰蚕）`q_01_qiyu_73`（鸠摩智赠诀）`q_01_qiyu_74`（丁春秋换诺）`q_01_side_71`（玉壁剑影）`q_01_side_72`（灵鹫宫石壁）`q_01_side_73`（藏经阁夜影）`q_01_side_74`（神农帮生死符之困）`q_01_faction_71`（无量剑比剑）`q_01_faction_72`（星宿排行之争）`q_01_bond_71`（萧峰结义）`q_01_bond_72`（阿朱） |
| NPC 占位 | 40 | 具名 31（`npc_suxinghe` `npc_xuzhu` `npc_tonglao` `npc_liqiushui` `npc_meijian` `npc_fuminyi` `npc_dingchunqiu` `npc_zhaixingzi` `npc_azi` `npc_murongfu` `npc_murongbo` `npc_dengbaichuan` `npc_fengboe` `npc_baobutong` `npc_jiumozhi` `npc_jinlunfawang` `npc_daerba` `npc_sangjie` `npc_heliantieshu` `npc_duanyanqing` `npc_yeerniang` `npc_yuelaosan` `npc_yunzhonghe` `npc_zuozimu` `npc_xinshuangqing` `npc_xiaofeng`（基准已有） `npc_xiaoyuanshan` `npc_youji` `npc_youju` `npc_youtanzhi` `npc_sikongxuan`）；通用 9（`npc_mizong_lama` `npc_lingjiu_shouling` `npc_xixia_jiaotou` `npc_xixia_wushi` `npc_liao_jiaotou` `npc_liao_lieren` `npc_liao_wushi` `npc_wuliang_dizi` `npc_juxian_zhuangding`） |
| 物品（建议） | 10 | `eq_qibaozhihuan`（七宝指环）、`eq_shenmuwangding`（可佩戴版神木王鼎）、`it_shengxue`（生血）、`it_duwu`（毒物）、`it_jian`（箭）、`it_miji_baihongzhang` `it_miji_canhezhi` `it_miji_douzhuan`、`it_canye_chousuizhang` `it_canye_dashouyin`（按 design/10 已确认的秘籍/残页命名规则） |
| 物品（引用 design/10 已有） | — | `eq_jinlun` `eq_jinchu` `eq_duanyanqingzhang` `eq_ezuijian` `eq_eweibian` `it_shenmuwangding` `it_beisuqingfeng` `it_beisuqingfeng_jieyao` `it_meihuazhen` `it_duzhen` `it_xiujian` `it_feihuangshi`；另以峨眉铁指环 `eq_tiezhihuan` 为七宝指环的参照模式 |

**新增武学 ID 清单（61）**：

```
逍遥派  sk_baihongzhang sk_langhuanjian sk_chuanyinsouhun sk_zuowangxinfa sk_fuyaotui sk_xiaoyaobu
灵鹫宫  sk_piaomiaojian sk_jiutianjiubu sk_zhenshenfeizhen sk_lingjiuxinfa sk_piaomiaobu
星宿派  sk_chousuizhang sk_sanxiaoxiaoyaosan sk_fushidu sk_chanhunwang sk_bilinzhang sk_xingxiudugong sk_songxianqu
姑苏慕容 sk_canhezhi sk_baijiadao sk_murongjian sk_yirongshu sk_longchengxinfa sk_yizhenfengdao sk_feiyefeiye
吐蕃密宗 sk_wulundazhuan sk_dashouyin sk_jingangxiangmochu sk_zhuohuogong sk_jingangjue sk_damingzhou
西夏一品堂 sk_beisuqingfeng sk_tieyaozidao sk_helanxinfa sk_poxifeishi sk_dangxiangshuaijiao
四大恶人 sk_yanqingzhang sk_xuehendao sk_hexiangbu sk_ezuijian sk_fuyushu sk_eweibian sk_niujingshou
无量剑派 sk_yubijian sk_wuliangxinfa sk_wuliangjian sk_jianhubu
契丹（辽） sk_qinlonggong sk_jingedangkouqiang sk_heiyiqianzong sk_tuxiongbohuquan sk_qidanlianzhujian sk_banmatui
聚贤庄  sk_bingcanduzhang sk_shuangxiongdundao sk_heweizhen sk_youjiadao
神农帮  sk_changbaicaogong sk_duanchangsan sk_shennongyaochu sk_baicaobianyao
（沿用）sk_huagong；（基准 §13）sk_beiming sk_xiaowuxiang sk_lingbo sk_liuyangzhang sk_zhemei sk_bahuang sk_shengsifu sk_douzhuan sk_huoyandao sk_longxiang
```

---

## 16. 待决事项 / 依赖

### 16.1 对基准（`00-canon.md`）

无修改提案。本组天级 10 门的 ID、品阶、类型、原生书界与基准 §13 逐条一致；化功大法按 §13 注"地阶锚点"定为地上。

### 16.2 Buff 提案（交 design/06）

| # | 提案 | 建议定义 | 当前做法 |
|---|---|---|---|
| B-1 | 新增 `bf_sanxiao` 三笑逍遥散 | E− · 品阶 7–9 · 子标签 `poison.sanxiao`（新）；可见（中者面现诡笑）；3 回合内每回合开始"一笑"：`hpMax × 1%×G`（绕过护体）并 30% 失去本次行动；第三笑后转为同品阶 `bf_judu` 3⁺；Boss：不失去行动、伤害按 06 §11.4 系数；驱散：运医药武；`bf_mian_du` 按品阶对抗 | 三笑逍遥散各招暂挂 `bf_judu`，采纳后改挂 |
| B-2 | Buff 价值计价（06 §15 未给） | 本文先用：剧毒、寒毒 0.15×率（DOT 1.5 倍）；受制 `bf_shengsifu` 0.50×率（控制 2 倍） | §0 登记；06 定价后按 05 §4.2 重算相关招式 |
| B-3 | 被动覆写 Buff 参数所需的参数名 | `bf_douzhuan {chancePlus, mirrorMult, maxRange}`（星移斗转、星河倒转、斗转大成）；`bf_beiming {overflowToShield, hurtDrainPerTurn}`（百川归海、反客为主）；`bf_canying {max}`（凌波大成）；`bf_shengsifu` 施加品阶加值（阳极生阴）；`bf_bingdong`/`bf_hanqi` 的"层数 +1"（寒毒入体） | 以文字描述，待 06 公布参数名后改写为 `value {…}` |

### 16.3 对 design/05

| # | 事项 | 本文当前做法 |
|---|---|---|
| D-1 | 新效果钩子 `curveLos`：`ranged` 招式不受墙体/单位阻挡（白虹掌力"曲直如意"） | 写在被动，待 05 §4.11 登记 |
| D-2 | `condition` 键登记：`adjacentFallenUnit`（腐尸毒）、`attackedByTargetSinceLastAction`（还施彼身）、`targetLastMoveCat`（慕容剑法·还施）、`allyAdjacentToTarget`（双雄合击）、`targetHpBelow`（扭断；05 仅有 `selfHpBelow`）、`night`/`moonlitTile`（玉壁剑法·月照，昼夜归 design/11）、`targetHasTag`（催符、收网） | 按"常见 +0.15 / 罕见 +0.30"计价 |
| D-3 | `weaponReq.offHand`：要求副手为盾（双雄盾刀、游家刀法·刀盾） | 被动写"副手持盾时"，待 05 §6.2 / design/10 确认 |
| D-4 | 05 §14.5 文件拆分与本文实际覆盖不一致：本文 = 建议的 `skills-xiaoyao`（逍遥/灵鹫/星宿）+ `skills-dali-murong` 的慕容部分 + `skills-west` 的大轮寺/密宗部分 + 天龙其余势力（一品堂、四大恶人、无量、契丹、聚贤庄、神农帮） | 请 05 §14.5 同步（本文件 26 → 72 门；dali-murong、west 相应扣减） |
| D-5 | 05 §14.4 天龙首现目标 86 门（天 14/地 18/玄 24/黄 30）：本组天龙首现即 69（9/17/21/22），加上少林、丐帮、大理、通用必然超出 | 品阶**占比**合规（§14.1）；建议 05 上调天龙首现目标，或把本组部分黄阶登记为"通用武学复用" |
| D-6 | 太祖长拳（`sk_taizuchangquan`）本土书界目前止于倚天；若扩至中/低武（"天下通行"之拳），萧峰套装在低武可达 3 件 | 通用组与 05 §13.5 决定 |
| D-7 | 05 §3.5 被动数量：表格写"黄 1–2"，层节奏表却在 7 重、10 重各放一条黄阶被动 | 本文取 2 条（1 重 + 7 重），10 重"圆满"以 `layerStats` 满值体现（§0） |

### 16.4 对 design/07（套装）

| # | 事项 |
|---|---|
| S-1 | §13 的 8 个候选（+2 备选）成员、阈值与效果定稿；"套装品阶 = 已计件成员有效品阶中位数、数值按 G 缩放"的建议是否采纳 |
| S-2 | `set_xiaoyao_xuzhu` 受 02 §2.9 R4"逍遥系至多取 3"限制，只设 2/3/4 阈值 |
| S-3 | 跨组 `setTags` 双向校验（05 §6.5-6）：`sk_xianglong18`（丐帮，现 `[set_gaibang_bangzhu]`）与 `sk_taizuchangquan`（通用）需追加 `set_qidan_xiaofeng`；`sk_wuxiangjiezhi` `sk_duoluoyezhi` `sk_ranmudaofa` `sk_jiashafumogong`（少林）若采纳为 `set_mizong_mingwang` 成员需追加 |

### 16.5 对 design/10（物品）

| # | 事项 |
|---|---|
| I-1 | 增设 `eq_qibaozhihuan` 七宝指环（逍遥派掌门信物，佩饰，参照 `eq_tiezhihuan`"掌门信物"模式）——逍遥游、虚竹子两个套装的装备件 |
| I-2 | 神木王鼎：现为奇物 `it_shenmuwangding`（不计套装件）；建议增设可佩戴版 `eq_shenmuwangding`，或维持奇物（则星宿套装为 7 候选） |
| I-3 | 弓箭弹药 `it_jian`（契丹连珠箭）；"生血" `it_shengxue`（八荒饮血）；"毒物" `it_duwu`（化功养毒） |
| I-4 | 已对齐：`eq_jinlun`（"五轮齐飞"含龙象联动，本文五轮大转不再重复）、`eq_jinchu`（击退 +1，本文降魔杵不再重复）、`eq_duanyanqingzhang`（以杖代足免蹒跚，本文残躯只管地形）、`eq_ezuijian`（"主剪副鞭"暴伤由物品提供，本文鳄嘴剪被动不重复）/`eq_eweibian`、`it_beisuqingfeng`（物品版毒气；本武学为施放之法）与 `it_beisuqingfeng_jieyao`（解药随身被动引用）、暗器弹药 `it_meihuazhen` `it_duzhen` `it_feihuangshi` `it_xiujian`（§8.6） |

### 16.6 对 design/02、design/12、chapters/

| # | 对象 | 事项 |
|---|---|---|
| C-1 | 02 | 无量山玉洞为天龙唯一 `earlyException`，一次事件授北冥（残卷 6 重）与凌波两门——请确认"一个例外事件可含两门武学"；逍遥系"至多取 3"计入北冥残卷 |
| C-2 | 02 | 密宗通传四门（大手印、拙火功、金刚橛法、大明咒）在倚天、鹿鼎为原生，请纳入 02 §2.11 敌人武学池（番僧、桑结门下） |
| C-3 | 12 | 门派职级（本文 rank 1–4）；灵鹫宫性别规则（女性入宫/男性客卿）；还施水阁偷阅的败露惩罚；生死符"驭人"的品德与势力后果；邪派路线（段延庆、叶二娘）与"岳老三收徒"（`con ≥ 60`） |
| C-4 | chapters/01 | 锚点前置的学习窗口：童姥/李秋水（西夏冰窖）、阿朱（小镜湖）、游氏双雄（聚贤庄）、鸠摩智（枯井）、丁春秋（少室山）、萧远山/慕容博（藏经阁）、萧峰（雁门关）；12 个任务占位与 31 名具名 NPC 的正式编号 |
| C-5 | chapters/03、04、08 | 金轮收徒敌对路线（神雕）；元廷番僧（倚天，待考）；桑结一系（鹿鼎）的出场与可习得节点 |
| C-6 | 08、09、11 | 地形 ID（`tr_caodi` `tr_qianshui` `tr_shenshui` `tr_nizhao` `tr_shadi` `tr_xuedi` `tr_shenxue` `tr_bingmian` `tr_suishi` `tr_shinei`）；09 的 `beast` 标签（屠熊搏虎拳）、骑乘（绊马腿、连珠箭）、撤退；11 的昼夜/月夜（玉壁剑法、血痕刀法）与采药产量 |

### 16.7 与同事图鉴的协调

| 图鉴 | 事项 | 本文处理 |
|---|---|---|
| `skills-wujue` | 达尔巴、霍都作为人物收在 `sect_menggu`，其师门武学归本文；霍都折扇（design/10 已列）属蒙古组 | 本文只定义达尔巴金杵武学 `sk_jingangxiangmochu`；若蒙古组另定达尔巴兵器武学，请并入此 ID |
| `skills-wujue` | 段延庆列为大理人物；一阳指、段家剑法由其定义 | 本文只定义延庆杖法（杖上功夫），以"一阳劲"被动与一阳指联动 |
| `skills-shaolin` | 七十二绝技"戾气"规则；鸠摩智冒用的无相劫指已定"小无相功催动"特例；萧远山、慕容博偷练绝技 | 小无相功不再另设增伤；人物配置直接引用少林 ID |

### 16.8 原著考据待办（"待考"汇总）

| # | 事项 | # | 事项 |
|---|---|---|---|
| K1 | 北冥帛卷原文、"磕首千遍"、段誉所练经脉 | K17 | 阿朱易容所扮对象 |
| K2 | 鸠摩智小无相功来历；识破者与回目；虚竹是否兼通；燃木刀法是否以火焰刀内劲冒充 | K18 | 天龙寺鸠摩智以火焰刀削香的香数与细节 |
| K3 | 凌波微步起步卦位；"行步运气"之说 | K19 | 龙象般若功"十三层、成倍递增"原文；金轮练至几层 |
| K4 | 天山六阳掌招名"阳歌天钧""阳关三叠" | K20 | 金轮飞轮鸣响；霍都扇中暗器 |
| K5 | 天山折梅手传授地点、口诀、"六路"细节 | K21 | 元廷番僧寺院（万安寺一带）；桑结武功名目 |
| K6 | 八荒六合返老还童周期、回复速度、饮血；是否传虚竹 | K22 | 悲酥清风症状与解药；擒丐帮时地（06 K3） |
| K7 | 生死符发作周期、赐药（06 K8）；是否以酒化冰 | K23 | 叶二娘兵刃；云中鹤兵刃与结局 |
| K8 | 白虹掌力"曲直如意"原文 | K24 | 无量剑北宗；"无量洞"；玉壁显影成因与时辰 |
| K9 | 传音搜魂大法场景 | K25 | 萧远山"属珊军总教头"；回目回序；擒龙功施展场合 |
| K10 | 化功大法"以毒为养、缺毒反噬"；神木王鼎用途 | K26 | 游氏双雄兵刃（盾）与死因；聚贤庄所在地 |
| K11 | 抽髓掌对敌场合 | K27 | 冰蚕来历；游坦之依附丁春秋的经过 |
| K12 | 三笑逍遥散受害者与回目 | K28 | 断肠散药性与发作时日；司空玄结局 |
| K13 | 腐尸毒施放方式 | K29 | 九天九部部名；符敏仪"针神"之号 |
| K14 | 参合指对敌场合 | K30 | 灵鹫宫石室武功图谱 |
| K15 | 磨坊"李延宗"所使刀法清单 | K31 | 丁春秋羽扇；摘星子以内力催火斗阿紫 |
| K16 | 慕容复剑法名目 | | |

### 16.9 开放问题（需作者拍板）

| # | 问题 | 本文默认 |
|---|---|---|
| O-1 | 大手印等"密宗通传"四门跨天龙/神雕/倚天/鹿鼎复现（原创扩展成分较多）是否接受 | 接受：它是本组唯一能为低武（鹿鼎）补齐 1/1/1 的武学群 |
| O-2 | 斗转星移与乾坤大挪移同为 `natureFollowAux`，是否设互斥 | 不设；两者不在同一书界原生 |
| O-3 | 小无相功"隐迹"令敌方图鉴只显示"无相"，是否影响玩家识读 | 仅对敌方单位（AI 观摩）生效，玩家图鉴不受影响 |
| O-4 | 灵鹫宫只收女子的原著设定如何处理 | 女性主角入宫；男性主角经虚竹线为客卿 |
| O-5 | 生死符对非敌对 NPC"驭人"是否开放 | 开放但计为邪行（`morality −10`/次） |
| O-6 | 本组合计 72 门，高于任务估计的约 65 门 | 为使 11 个势力各具"黄 ×2 + 玄 + 地"最低覆盖而多出；如需压缩，优先合并一品堂与契丹的黄阶（摔角/腿法），或将颂仙曲、非也非也降为纯剧情技能 |
