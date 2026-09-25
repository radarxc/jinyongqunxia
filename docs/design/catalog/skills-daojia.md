# 门派武学图鉴 · 道家与神雕诸派（`skills-daojia`）

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴。本文件覆盖：**全真教、古墓派（含李莫愁一系）、杨过自创与传承（含独孤求败剑冢剑意）、武当派（倚天 → 笑傲 → 侠客 → 书剑 → 飞狐）、绝情谷**。
> **上游**：`00-canon.md`（§4 品阶、§6 属性、§7 分类、§12 ID、§13 天级总表、§16 改编原则、§20 装配栏）。数据结构、层数节奏、招式预算、范围模板、特殊武学规则以 `design/05` 为准；附带效果只引用 `design/06` 目录中已有的 `bf_` ID；属性与资质 ID 见 `design/03`；书界、境界、残篇、再遇、印证见 `design/02`；合击与阵法流程归 `design/09`；兵器与名器归 `design/10`；套装本体归 `design/07`。
> **跨组引用（只引用 ID，不在本文定义）**：九阴真经系 `sk_jiuyin`；周伯通 `sk_zuoyouhubo`、`sk_kongming`；独孤九剑 `sk_dugu9`（五岳组）；一阳指 `sk_yiyangzhi`（大理组）；蛤蟆功 `sk_hama`、铁掌功 `sk_tiezhang`（西域组）；铁砂掌 `sk_tieshazhang`（05）；玄冥神掌 `sk_xuanming`；**武当九阳功**（倚天组定义，本文暂记 `sk_wudangjiuyang`，以倚天组 ID 为准）。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（待考）** = 原著事实尚需以三联/广州修订版逐字核对；**★** = 该书界原著未见本门派或本武学，可习得属原创扩展（门派存续推定），须由 `chapters/` 采纳；**【建议】** = 依赖他文档的建议值。所有数值为建议值，招式倍率按 05 §4.2 预算公式核算（允许 ±0.05）。

---

## 0. 阅读指引与记法

| 章节 | 内容 |
|---|---|
| §1 | 本组门派一览、书界分布与装配栏覆盖速查 |
| §2 | 全真教 `sect_quanzhen` |
| §3 | 古墓派 `sect_gumu`（含李莫愁一系） |
| §4 | 杨过自创与传承、独孤求败剑冢剑意 |
| §5 | 武当派 `sect_wudang` |
| §6 | 绝情谷 `sect_jueqinggu` |
| §7 | 套装候选（交 design/07 定稿） |
| §8 | 本组统计（门派 × 品阶、类别、原生书界） |
| §9 | 本文新增 ID |
| §10 | 待决事项 / 依赖 |

**记法**

- 品阶写作"数字＋名称"，如 `8 地中`；G 值见基准 §4。
- 招式表"附带"列写作 `bf_ID·承·概率·持续`："承" = `grade: inherit`（= 本武学有效品阶，05 §2.6）；持续以持有者回合计（06 §5.1）。
- "核算"列：`AF × (1 + Σadj) × K_delivery × K_parry − Σcost`（05 §4.2）。adj 简写：cd 冷却每回合 +0.12；mp 耗内每高 1% +0.05；rec 收招每多 100 +0.07；hp 自损每 1% +0.06；条件 常见 +0.15 / 罕见 +0.30。
- 耗内按大阶基准：黄 5% / 玄 6% / 地 7% / 天 8%（× `MPREF`）；绝招 = 基准 + 2%。收招默认 1000（绝招 1200）。"招架"列 ✓ = `parryable: true`。
- 被动 ID 前缀 `ps_<武功拼音>_`（05 §16 P-4）。内功贡献按 05 §5.5：`IP = mpMaxPct + hpMaxPct + 2 × 属性点 + 5 × mpRegen`。
- 轻功的 `Q_skill` 统一按 03 §4.5：`QS(g) × (0.40 + 0.06 × 层)`，本文不再逐条重复。
- 门派职级（`sect.rank`）暂按 0 入门 / 1 正式弟子 / 2 真传 / 3 执事·长老门下 / 4 掌门亲传书写，职级表归 design/12。
- NPC、任务、物品 ID 为占位（任务统一用本文件保留号段 `_71`–`_99`，见 §10 D-9）。

**`cost_buff` 取值**（05 §4.2 已定者照用；其余为本文建议，登记于 §10 D-2，待 06 给出 Buff 价值后替换）

| Buff | cost（× 施加率，按 06 条目默认持续） | 来源 |
|---|---|---|
| 眩晕 `bf_xuanyun`、定身 `bf_dingshen` | 0.25 | 05 |
| 点穴 `bf_fengxue` | 0.20 | 05 |
| 内伤 `bf_neishang`、破甲 `bf_pojia`、流血 `bf_liuxue`、减速 `bf_jiansu` | 0.10 | 05 |
| 自身增益 | 0.10–0.20 | 05 |
| 缴械 `bf_jiaoxie`、恐惧 `bf_kongju`、迷惑 `bf_mihuo` | 0.25 | 本文建议 |
| 麻痹 `bf_mabi`、缠绕 `bf_chanrao`、封内力 `bf_fengnei` | 0.20 | 本文建议 |
| 剧毒 `bf_judu`、乱心 `bf_luanxin`、封经脉 `bf_fengjingmai` | 0.15 | 本文建议 |
| 中毒/寒气（每层）、封轻功、失衡、迟缓、震慑、泄气、脱力、散功、迟滞、蹒跚、创口难愈、失明 | 0.10 | 本文建议 |
| 锁定 `bf_suoding` | 0.05 | 本文建议 |
| 持续超出 06 默认值 | 每多 1 回合 ×1.5 | 本文建议 |

---

## 1. 本组门派一览

### 1.1 门派一览表

| 门派 | ID | 出现书界 | 正邪 | 驻地 | 代表人物 | 武学风格 | 内力性质倾向 | 可否加入 |
|---|---|---|---|---|---|---|---|---|
| 全真教 | `sect_quanzhen` | 射雕、神雕（鹿鼎★：北京白云观为全真龙门派祖庭，史实；原著鹿鼎未写） | 正 | 终南山重阳宫 | 王重阳（已故）、周伯通、全真七子（马钰、谭处端、刘处玄、丘处机、王处一、郝大通、孙不二）、尹志平、赵志敬 | 玄门正宗；剑阵合击；攻守端凝 | 阳（镇派内功金关玉锁为调和） | 可：射雕为七子门下弟子；神雕为三代弟子门下；鹿鼎★白云观只传入门 |
| 古墓派 | `sect_gumu` | 神雕（倚天★：终南山黄衫女子一脉，杨过后人之说待考） | 正（李莫愁叛出，行邪） | 终南山活死人墓 | 林朝英（已故）、小龙女、杨过、孙婆婆、李莫愁、洪凌波 | 轻灵阴柔、专克全真；毒针、金铃、驭蜂 | 阴 | 限：需小龙女或孙婆婆好感并完成"古墓门规"任务（原创扩展）；李莫愁一系可"投师"（邪路线，原创扩展） |
| 杨过传承 | —（`sect: null`，`lineage` 杨过 / 独孤求败） | 神雕 | 正 | 剑冢、绝情谷底、襄阳 | 杨过、神雕、（遗迹）独孤求败 | 以情入武；重剑无锋 | 阴 / 中性 | 羁绊传承（非门派）；剑冢为奇遇 |
| 武当派 | `sect_wudang` | 倚天（开派）、笑傲、侠客、书剑、飞狐（连城★、鸳鸯★：游方武当道人） | 正（书剑张召重投清廷） | 武当山真武殿 | 张三丰；宋远桥、俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷；冲虚（笑傲）；愚茶（侠客，待考）；陆菲青、张召重、马真（书剑，马真待考）；无青子（飞狐，待考） | 以柔克刚、圆转连绵、后发制人；七人结阵 | 调和 / 阳 | 可：倚天为七侠门下；其余书界为当代弟子 |
| 绝情谷 | `sect_jueqinggu` | 神雕 | 中立（谷主公孙止阴鸷行邪） | 绝情谷（情花丛、鳄鱼潭、剑室） | 公孙止、裘千尺、公孙绿萼、樊一翁 | 刀剑互易、阴阳倒乱；闭穴；渔网合围 | 阴 / 调和 | 可：以公孙止弟子入谷；裘千尺线（谷底石窟）得其独门（原创扩展） |

### 1.2 书界分布与装配栏覆盖速查

| 书界 | 境界 | 内 | 拳脚 | 兵器 | 轻 | 暗 | 杂 | 合计 | 本组本土最高（内 / 拳脚 / 兵器） | 说明 |
|---|---|---|---|---|---|---|---|---|---|---|
| 射雕 `ch02` | 高 | 4 | 5 | 3 | 1 | 0 | 1 | 14 | 11 天中 / 6 玄上 / 7 地下 | 全真主场；全真拳脚上限玄上（原著亦无全真地阶拳掌），以剑阵为长 |
| 神雕 `ch03` | 高 | 8 | 10 | 12 | 3 | 3 | 9 | 45 | 10 天下 / 11 天中 / 11 天中 | 本组主场：全真三代、古墓、杨过、绝情谷 |
| 倚天 `ch04` | 高 | 3＋1★ | 6＋2★ | 5＋1★ | 2＋1★ | 0 | 1 | 17＋5★ | 8 地中（另有武当九阳功，倚天组）/ 11 天中 / 11 天中 | 武当开派；★为黄衫女子所传古墓武学 |
| 笑傲 `ch05` | 中 | 3 | 6 | 4 | 2 | 0 | 1 | 16 | 8 地中 / 7 地下 / 7 地下 | 另有太极拳、太极剑残承（`lineageGrade 10`，02 §5.7） |
| 侠客 `ch06` | 中 | 3 | 6 | 3 | 2 | 0 | 1 | 15 | 8 地中 / 7 地下 / 7 地下 | 武当掌门赴侠客岛不归（02 C7） |
| 书剑 `ch12` | 中 | 3 | 5 | 3 | 2 | 1 | 0 | 14 | 8 地中 / 7 地下 / 7 地下 | 陆菲青、张召重一代 |
| 飞狐 `ch13` | 中 | 2 | 3 | 2 | 2 | 1 | 0 | 10 | 5 玄中 / 6 玄上 / 7 地下 | 仅掌门人大会一线（原创扩展延伸） |
| 鹿鼎 `ch08`★ | 低 | 2 | 1 | 1 | 0 | 0 | 0 | 4 | 5 玄中 / 2 黄中 / 3 黄上 | 北京白云观全真入门（原创扩展） |
| 连城 `ch09`★、鸳鸯 `ch11`★ | 低 | 1 | 2 | 1 | 1 | 0 | 0 | 5 | 2 黄中 / 5 玄中 / 3 黄上 | 游方武当道人（原创扩展；连城故事主要发生在湖北荆州一带，与武当山同省，鸳鸯"太岳四侠"之"太岳"为武当山古称，作彩蛋） |
| 天龙、碧血、白马、雪山 | — | — | — | — | — | — | — | 0 | — | 本组无原生武学（只能携带） |

> 高武书界装配栏由本组即可填满；中武书界本组提供 2/2/2 以上的本土补位（武当）；低武书界本组只提供★入门级补位，主力须携带或学习他组本土武学。天级获取受 02 §2.9 预算与进度门槛约束（神雕：古墓系、杨过系等至多深入 2 系）。

---

## 2. 全真教 `sect_quanzhen`

### 2.1 门派简介

- **射雕（约 1217–1227）**：王重阳已逝，全真教为天下第一大教，七子分掌教务，天罡北斗阵为镇教阵法（射雕中曾以此阵困敌，细节待考）。王重阳生前以先天功并一阳指制西毒蛤蟆功，并赴大理以先天功与段智兴（一灯）互换一阳指（一灯追述，待考）；马钰曾在蒙古悬崖夜授郭靖全真内功（原著）。**强**：七子皆一流，门下弟子众多。
- **神雕（1237–1259）**：三代弟子（尹志平、赵志敬、甄志丙等；新修版人物改动见 §10 K-2）当家，重阳宫以七七四十九人的北斗大阵迎战郭靖（原著）；杨过拜入全真后叛投古墓；重阳宫之变后全真渐衰（细节待考）。**中**：普通弟子武功平庸，以阵势取胜。
- **倚天以后**：原著不再出场。元明以降全真龙门派存续为史实；本作只在鹿鼎北京白云观设入门彩蛋（★，原创扩展）。
- **敌人配置建议**（02 §2.11）：射雕全真道士普通玄中、精英地下（持天罡北斗阵）；神雕三代普通玄上、精英地下—地中（持北斗大阵）。

### 2.2 武学总表（15 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_quanzhentunajue` | 全真吐纳诀 | 内功/心法 | 2 黄中 | 阳 | 0/1 | 射雕、神雕、鹿鼎★ | 拜师（职级 0）；鹿鼎★白云观道长 | 原创扩展 |
| `sk_quanzhenxinfa` | 全真心法 | 内功/心法 | 5 玄中 | 阳 | 0/1 | 射雕、神雕、鹿鼎★ | 拜师（职级 1）；射雕"马钰夜授"羁绊线；秘籍 | 原著扩展（原著泛称全真内功） |
| `sk_jinguanyusuo` | 金关玉锁二十四诀 | 内功/心法 | 8 地中 | 调和 | 0/1 | 射雕、神雕 | 拜师（职级 3）；神雕古墓石室·全真篇解谜 | 原著名目（内容待考） |
| `sk_xiantiangong` | 先天功 | 内功/心法 | 11 天中 | 阳 | 0/1 | 射雕 | 一灯大师羁绊传功；重阳遗刻奇遇（原创扩展） | 原著（基准 §13） |
| `sk_sanqingzhang` | 三清掌 | 拳脚/拳掌 | 2 黄中 | 阳 | 0.70/0.30 | 射雕、神雕、鹿鼎★ | 拜师（职级 0） | 原创扩展 |
| `sk_yuyangtui` | 玉阳腿 | 拳脚/腿法 | 3 黄上 | 阳 | 0.80/0.20 | 射雕、神雕 | 拜师（王处一一系，职级 1）；残页 | 原创扩展（致敬王处一） |
| `sk_changchunqinna` | 长春擒拿手 | 拳脚/擒拿 | 4 玄下 | 阳 | 0.75/0.25 | 射雕、神雕 | 拜师（丘处机一系，职级 1）；秘籍 | 原创扩展（致敬丘处机） |
| `sk_haotianzhang` | 昊天掌 | 拳脚/拳掌 | 5 玄中 | 阳 | 0.55/0.45 | 射雕、神雕 | 拜师（职级 1）；秘籍；残页 | 原著（使用者待考） |
| `sk_sanhuajudingzhang` | 三花聚顶掌 | 拳脚/拳掌 | 6 玄上 | 阳 | 0.40/0.60 | 射雕、神雕 | 拜师（郝大通一系，职级 2） | 原著 |
| `sk_zhongnanjian` | 终南剑法 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 射雕、神雕、鹿鼎★ | 拜师（职级 0） | 原创扩展 |
| `sk_quanzhenjian` | 全真剑法 | 兵器/剑 | 5 玄中 | 阳 | 0.60/0.40 | 射雕、神雕 | 见 05 §13.6 | 原著扩展（05 定义） |
| `sk_tongguijian` | 同归剑法 | 兵器/剑 | 7 地下 | 阳 | 0.60/0.40 | 射雕、神雕 | 拜师（职级 3）；门派任务"西毒将至"（原创扩展） | 原著（细节待考） |
| `sk_jinyangong` | 金雁功 | 轻功 | 6 玄上 | 阳 | 0.80/0.20 | 射雕、神雕 | 拜师（职级 1）；"马钰夜授" | 原著 |
| `sk_tiangang` | 天罡北斗阵 | 杂学/阵法（合击） | 10 天下 | 阳 | 0.55/0.45 | 射雕、神雕 | 门派任务链"七星聚义"（原创扩展）；合击领悟 | 原著（基准 §13） |
| `sk_dabeidouzhen` | 北斗大阵 | 杂学/阵法（合击） | 5 玄中 | 阳 | 0.60/0.40 | 神雕 | 拜师（三代弟子，职级 2）；观摩 | 原著（名称待考） |

### 2.3 天级条目卡

#### `sk_xiantiangong` 先天功（11 天中 · 内功 · 全真 / 王重阳）

> **原著**：王重阳独门内功。王重阳以先天功并一阳指破欧阳锋蛤蟆功；曾赴大理以先天功与段智兴互换一阳指，意在身后仍有人能制西毒；又曾"诈死"诱欧阳锋现身（射雕，一灯大师追述，回目与细节待考）。招式、被动效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 运功招式 wOut 0 / wIn 1 |
| 原生书界 | 射雕（基准 §13；神雕起只能携带） |
| reqs | `attrs {con 50, wil 55, wis 50}`；`aptitude {apInner 55}`；`morality {min 10}`；`prereq [sk_jinguanyusuo ≥ 5]`；`hard [morality, prereq]` |
| 内功贡献（10 重主运） | `mpMaxPct 52, hpMaxPct 26, attrs {con 6, wil 8, wis 6}, mpRegen 3.5` → IP 135.5（= 天中预算）；`stats {effRes 10, resInjury 10}`（合计 20） |
| InnerDef | `bridge: false`；`seclusionCap: 8`；`auxUsableMoves: [mv_xiantiangong_gangqi]` |
| 层数要点 | 1 重"先天一炁"；3 重先天罡气；4 重"以正克邪"；5 重一炁贯虹；6 重"返本还元"；**7 重绝招五气朝元**；8 重"龟息"；10 重"先天大成" |
| 获取 | ① `master`：一灯大师 `npc_yideng`（羁绊 ≥ 4，完成"南帝疗伤"一线后，占位 `q_02_bond_75`；`reqsOverride {prereq: []}`，原创扩展：一灯以先天功回赠），maxLayer 10；② `qiyu`：重阳宫后殿"重阳遗刻"（全真职级 4 且天罡北斗阵 ≥ 3，占位 `q_02_qiyu_74`，原创扩展），maxLayer 8。进度门槛：射雕主线第 4 幕后（02 §2.9 R3）；随机池不产出 |
| setTags | `[set_quanzhen_beidou]` |
| conflicts | `{with: sk_yiyangzhi, type: synergy}`：同时装配时一阳指招式 Z3 +8%（02 同源 `lg_yiyang`）；`{with: sk_hama, type: counter}`：见 4 重"以正克邪" |
| special | `fusible: true`；`observable: false` |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 先天罡气（原创扩展命名） | `mv_xiantiangong_gangqi` | 3 | `aoe_self` | 0 | 12% | 4 | 900 | `bf_hutizhenqi`·承·100%·3（护体 = 自身 hpMax 15%）；`bf_fanzhen`·承·100%·3 | — | 支援：护体 15% ≈ 治疗 12.5% 当量（05 §4.2 ×1.2 折算）＋反震；以高耗内与 4 回合冷却抵偿 |
| 一炁贯虹（原创扩展命名） | `mv_xiantiangong_yiqi` | 5 | `aoe_line n3` · 1–3（`ranged`） | 0.80 | 10% | 2 | 1000 | 驱散目标 1 个 `stance` 增益（purge，品阶承） | ✓ | 0.80 ×(1+0.24+0.10)× 0.85 = 0.91，−0.10（驱散）≈ 0.80 |
| 五气朝元（绝招；原创扩展命名，取道家内丹语） | `mv_xiantiangong_wuqi` | 7 | 对敌 `aoe_around`；对己 `aoe_self` | 1.50 | 10% | — | 1200 | 自身驱散 2 个减益；`bf_neijin_sheng`·承·100%·3 | ✓ | 3.0 × 0.65 = 1.95，−0.45（自身驱散与增益）= 1.50（对照 05 九阳普照） |

**被动**

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 先天一炁 | `ps_xiantiangong_xiantian` | 1 | stat · 属性层 | `attr:atkIn pct +4% → +12%` | `auxMode: scaled` |
| 以正克邪 | `ps_xiantiangong_kexie` | 4 | trigger · Z3 | +15% | 攻击处于 `stance.charge`（蓄势 `bf_xushi`，如蛤蟆功）的目标时本方招式 Z3 +15%，且 50% 打散其架势（purge `stance`，品阶承）；致敬王重阳制西毒。`auxMode: none` |
| 返本还元 | `ps_xiantiangong_huanyuan` | 6 | mechanic | — | 免疫品阶 ≤ 本功有效品阶的 `bf_neixiwenluan`（走火 1 级）；`auxMode: full` |
| 龟息 | `ps_xiantiangong_guixi` | 8 | trigger | ×1/战 | 首次受致死伤害时获得 `bf_zhasi`（诈死，06 §8.9；每战 1 次，06 §11.3）；致敬王重阳诈死诱敌 |
| 先天大成 | `ps_xiantiangong_dacheng` | 10 | stat · Z4 | 内劲伤害 −10% | 主运时受到伤害的内劲部分 Z4 +10%；全真门派武学修炼 +10%（计入 `bonusMult`） |

#### `sk_tiangang` 天罡北斗阵（10 天下 · 杂学/阵法（合击）· 全真）

> **原著**：全真教镇教阵法，七人按北斗七星（天枢、天璇、天玑、天权、玉衡、开阳、摇光）列阵，攻其一则余者齐至，射雕中曾困强敌（七子座次与交战细节待考）。神雕三代弟子另以七阵合成四十九人大阵（见 `sk_dabeidouzhen`）。下列"成阵人数"改编与招式为原创扩展，阵法流程以 design/09 §6.8 定稿为准。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · wOut 0.55 / wIn 0.45（阵中合击招式） |
| 原生书界 | 射雕、神雕（杂学不可携带；02 §5.7 神雕为 `recall`） |
| reqs | `attrs {wis 45, wil 45}`；`sect {sect_quanzhen, rank 3}`；`prereq [sk_quanzhenjian ≥ 5]`；`hard [sect, prereq]`；阵法强度用技艺 `formation`（05 §2.3） |
| layerStats | `{parry [3, 10], hit [2, 10]}`（合计 20；仅阵中生效） |
| 层数要点 | 1 重布阵、七星合围、"北斗"；3 重斗柄回旋；5 重"牵一发而动全身"；6 重天枢镇守；**7 重绝招天罡归一**；8 重"七星连珠"；10 重"天权兼领" |
| 获取 | ① 门派任务链"七星聚义"（射雕，占位 `q_02_faction_73`，原创扩展）完成后由马钰 `npc_mayu` / 丘处机 `npc_qiuchuji` 传授，maxLayer 10；② `combo` 合击领悟（05 §7.7：与 ≥ 3 名装配全真剑法的队友合击 5 次）；③ 神雕：残篇忆起 / 三代掌教传授，maxLayer 8 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无 |
| special | `formation`（下表）；`fusible: false`（合击）；`observable: false` |

**阵法规则 `special.formation`**（原创扩展改编；与 design/09 §6.8 对接）

| 规则 | 值 |
|---|---|
| 阵员 | 同阵营、装配本武学的单位（敌方 NPC 同规则） |
| 成阵 | 施放"布阵"时，阵主 3 格内阵员 ≥ 4（含阵主），且每名阵员 2 格内至少另有 1 名阵员 |
| 七星位 | 阵主居"天权"，其余按与阵主距离依次为天枢、天璇、天玑、玉衡、开阳、摇光（只影响 UI 与 AI 站位） |
| 七人之数 | 原著七人成阵；基准 §8 上场 ≤ 6，故 6 人即"近满阵"；10 重"天权兼领"令阵主一人占两星，6 人视为七星俱全 |
| 阵中光环 | 阵员常驻 `bf_zhuiji`（追击）；相邻阵员互得 `bf_yuanhu`（援护，每回合 1 次）；与 ≥ 2 名阵员相邻的敌人获得 `bf_suoding`（锁定，每名相邻阵员一实例，06 `defSource`） |
| 阵散 | 阵员 < 3、阵主倒地或受硬控 → 阵散，1 回合内不可再布阵 |
| 敌方用法 | 射雕全真七子 Boss 组可 7 人成阵（敌方上场规模归 09） |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 布阵 | `mv_tiangang_buzhen` | 1 | `aoe_allies r3` | 0 | 6% | 5 | 900 | 成阵 3 回合（上表光环） | — | 功能招式 |
| 七星合围 | `mv_tiangang_hewei` | 1 | `aoe_single` · 1 | 1.20 | 8% | 1 | 1000 | `bf_suoding`·承·100%·2 | ✓ | 条件"目标与 ≥ 2 名阵员相邻"：1+0.12+0.15 = 1.27，−0.05 ≈ 1.20 |
| 斗柄回旋 | `mv_tiangang_doubing` | 3 | `aoe_allies r3` | 0 | 6% | 3 | 800 | 全体阵员各自移动 ≤ 1 格（不触发截击），或阵主与 1 名阵员换位 | — | 功能招式 |
| 天枢镇守 | `mv_tiangang_tianshu` | 6 | `aoe_self` | 0 | 8% | 4 | 800 | 自身 `bf_shoushi`·承·2；全体阵员 `bf_yuanhu`·承·2 | — | 架势 |
| 天罡归一（绝招，原创扩展命名） | `mv_tiangang_guiyi` | 7 | `aoe_single` · 1–2 | 2.60 | 10% | — | 1200 | `bf_shiheng`·承·100%·1；距目标 ≤ 2 的其余阵员各追加一击（基础招式 ×0.5，`followup`） | ✓ | 3.0 −0.10（失衡）−0.30（阵员追击价值）= 2.60 |

**被动**

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 北斗 | `ps_tiangang_beidou` | 1 | stat · 属性层 | `attr:parry pct`、`attr:hit pct` 各 +4% → +10% | 仅阵中；与 layerStats 叠加 |
| 牵一发而动全身 | `ps_tiangang_qianyifa` | 5 | trigger | ×0.6 | 阵员被近战攻击后，距其 ≤ 2 的另一阵员（优先阵主）以基础招式 ×0.6 反击攻击者（每阵每回合 1 次，`counter`） |
| 七星连珠 | `ps_tiangang_lianzhu` | 8 | effect | 气势 −10 | 阵员 ≥ 5 时，阵中敌人每回合开始气势 −10（效果钩子 `rageDrain`，05 §4.11） |
| 天权兼领（原创扩展） | `ps_tiangang_tianquan` | 10 | mechanic | — | 阵主计为 2 名阵员；七星俱全时阵员 Z3 +10% |

### 2.4 地阶条目卡

#### `sk_jinguanyusuo` 金关玉锁二十四诀（8 地中 · 内功 · 全真）

> **原著**：原著有"金关玉锁二十四诀"之名，为全真派上乘内功口诀（出处回目与内容**待考**）。本作定为全真镇派内功：金关属阳、玉锁属阴，锁住阴阳而归于调和。招式与被动为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0/1 |
| 原生书界 | 射雕、神雕 |
| reqs | `attrs {wil 45, wis 40}`；`aptitude {apInner 45}`；`sect {sect_quanzhen, rank 3}`；`prereq [sk_quanzhenxinfa ≥ 6]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 30, hpMaxPct 18, attrs {con 4, wil 5, wis 3}, mpRegen 2.2` → IP 83（= 地中预算）；`stats {resSeal 8, resMind 7}`（15） |
| InnerDef | 调和且品阶 ≥ 7 → 自动桥接（05 §5.4，辅运亦然）；`auxUsableMoves: [mv_jinguanyusuo_kaiguan]` |
| 层数要点 | 1 重"金关"；3 重锁窍；4 重"玉锁"；5 重开关；**7 重绝招周天**；8 重"二十四诀"；10 重"阴阳互济" |
| 获取 | 射雕：拜师丘处机 / 马钰（职级 3），maxLayer 10；神雕：`puzzle` 古墓石室·全真篇（原著杨过、小龙女据石刻修习全真武功，占位 `q_03_side_76`；`reqsOverride {sect: null}`），maxLayer 8 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无（作为桥接内功，可令全真心法、先天功与古墓玉女心经同装而不相冲） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 锁窍（原创扩展命名） | `mv_jinguanyusuo_suoqiao` | 3 | `aoe_self` | 0 | 7% | 4 | 800 | `bf_mian_xue`·承·100%·2（免疫穴道） | — | 支援 |
| 开关（原创扩展命名） | `mv_jinguanyusuo_kaiguan` | 5 | `aoe_single` · 0–1（友方） | 0 | 8% | 3 | 1000 | 驱散目标 2 个 `seal` / `mind` 减益（品阶承）；`bf_huinei`·承·100%·2 | — | 支援；可作辅运使用 |
| 周天（绝招，原创扩展命名） | `mv_jinguanyusuo_zhoutian` | 7 | `aoe_allies r2` | 0 | 9% | — | 1200 | 友方各驱散 2 个减益；`bf_hutizhenqi`·承·100%·3（护体 = 施招者 hpMax 15%）；自身回复 20% 内力 | — | 内功绝招以友方效果为主（05 §4.8） |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 金关 | `ps_jinguanyusuo_jinguan` | 1 | stat · 属性层 | `attr:resSeal pp +4 → +10` | `auxMode: scaled` |
| 玉锁 | `ps_jinguanyusuo_yusuo` | 4 | trigger | 30% | 被施加 `seal` / `mind` 减益时 30% 当即运功冲开（等效 `acupoint` / `circulate`，品阶承；每回合 1 次）；`auxMode: full` |
| 二十四诀 | `ps_jinguanyusuo_ershisi` | 8 | mechanic | +0.05 | 装配时，阴阳相冲组合的辅运比例在桥接值 0.40 上再 +0.05；`auxMode: full` |
| 阴阳互济 | `ps_jinguanyusuo_huji` | 10 | stat · Z5 | +4% | 主运时阳招、阴招相性加成由 +4% 提至 +8%（05 §5.3 调和主运行） |

#### `sk_tongguijian` 同归剑法（7 地下 · 兵器/剑 · 全真）

> **原著**：全真派为对付武功远胜己方的强敌所备的剑法，招招与敌同归于尽（相传为防西毒而设；创制者与出场回目**待考**）。本作归入代价型武学（05 §9.1）：以自损换伤害，代价在习得前完整展示。招式名与效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.60/0.40 |
| 原生书界 | 射雕、神雕 |
| reqs | `attrs {con 40, wil 40, wis 40}`；`aptitude {apSword 40}`；`sect {sect_quanzhen, rank 3}`；`prereq [sk_quanzhenjian ≥ 6]`；`hard [sect, prereq]` |
| layerStats | `{crit [1, 6], pierce [2, 9]}`（15） |
| weaponReq | `{category: sword}` |
| 层数要点 | 1 重以命搏命、"置之死地"；3 重玉石俱焚；4 重两败俱伤；5 重破釜沉舟、"舍身"；**7 重绝招同归于尽**；8 重"同归不死"；9 重不共戴天；10 重"生死一线" |
| 获取 | 射雕：拜师丘处机（职级 3，门派任务"西毒将至"后，占位 `q_02_faction_77`），maxLayer 10；神雕：拜师郝大通或三代掌教，maxLayer 9；秘籍 `it_miji_tongguijian`（神雕重阳宫之变后散出，原创扩展），maxLayer 7 |
| setTags · conflicts | `[set_quanzhen_beidou]`；无 |
| special | `cost: {hpCostMoves: true}`（代价型，计入 05 §14.6"地阶代价型 ≤ 5%"）；`fusible: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 以命搏命 | `mv_tongguijian_boming` | 1 | `aoe_single` · 1 | 1.20 | 7% | 0 | 1000 | 自损 3% hpMax | ✓ | 1 + 0.18（hp）= 1.18 ≈ 1.20 |
| 玉石俱焚 | `mv_tongguijian_yushi` | 3 | `aoe_around` | 1.05 | 8% | 2 | 1000 | 自损 5% hpMax | ✓ | 0.65 ×(1+0.24+0.05+0.30)= 1.03 ≈ 1.05 |
| 两败俱伤 | `mv_tongguijian_liangbai` | 4 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 至下次行动前被近战攻击：以 1.10 倍反击（反击时自损 2%） | — | 触发型（05 §4.10） |
| 破釜沉舟 | `mv_tongguijian_pofu` | 5 | `aoe_self` | 0 | 5% | 3 | 800 | `bf_gongshi`·承·100%·3（攻势） | — | 架势 |
| 同归于尽（绝招） | `mv_tongguijian_tonggui` | 7 | `aoe_single` · 1 | 4.45 | 9% | — | 1200 | 自损 8% hpMax | ✓ | 3.0 ×(1+0.48)= 4.44 ≈ 4.45 |
| 不共戴天 | `mv_tongguijian_bugong` | 9 | `aoe_single` · 1 | 1.40 | 7% | 1 | 1000 | 条件：目标当前气血比例高于自身 | ✓ | 1 + 0.12 + 0.30（罕见条件）= 1.42 ≈ 1.40 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 置之死地 | `ps_tongguijian_sidi` | 1 | stat · Z3 | +6% → +15% | 自身气血 < 50% 时本武学招式伤害 |
| 舍身 | `ps_tongguijian_sheshen` | 5 | effect | — | 本武学自损招式击杀目标时返还所损气血（效果钩子 `refundHpCostOnKill`，05 §4.11） |
| 同归不死 | `ps_tongguijian_busi` | 8 | trigger | ×1/战 | 气血 ≤ 20% 后首次受致死伤害：获得 `bf_suoxue`（锁血，06；每战 1 次） |
| 生死一线 | `ps_tongguijian_dacheng` | 10 | mechanic | −30% | 本武学招式 `hpCost` −30% |

### 2.5 玄阶 · 黄阶（紧凑表）

**`sk_quanzhentunajue` 全真吐纳诀**（2 黄中 · 内功 · 阳 · 原创扩展）
- 内功贡献：`mpMaxPct 8, hpMaxPct 5, attrs {con 1, wil 2}, mpRegen 1.0`（IP 24）；`stats {resInjury 3, effRes 3}`；无招式。
- reqs：`sect {sect_quanzhen, rank 0}`；`hard [sect]`。获取：全真知客道人 `npc_quanzhen_sandai`（射雕、神雕）；鹿鼎★北京白云观道长 `npc_baiyunguan_daozhang`（maxLayer 8）。
- 被动：`ps_quanzhentunajue_tiaoxi` 调息有法（1 重，运功调息回内 +5% → +10%）；`ps_quanzhentunajue_zhoutian` 小周天（5 重，闭关修炼全真武学 +10%）；`ps_quanzhentunajue_yuanman` 入门圆满（10 重，学习全真心法软门槛 −10）。

**`sk_quanzhenxinfa` 全真心法**（5 玄中 · 内功 · 阳 · 原著扩展）
- 原著：马钰于蒙古悬崖夜授郭靖全真派内功，教以呼吸吐纳并每夜攀崖（射雕，回目待考）；全真弟子通习之内功（原著泛称）。
- 内功贡献：`mpMaxPct 18, hpMaxPct 10, attrs {con 3, wil 2, agi 2}, mpRegen 1.3`（IP 48.5）；`stats {resInjury 5, effRes 5}`。
- reqs：`attrs {wil 25}`；`aptitude {apInner 25}`；`sect {sect_quanzhen, rank 1}`；`prereq [sk_quanzhentunajue ≥ 4]`；`hard [sect]`（"马钰夜授"免 sect 与 prereq）。
- 获取：射雕 `npc_mayu` 羁绊线"马钰夜授"（占位 `q_02_bond_72`，maxLayer 10）；射雕、神雕全真拜师；秘籍 `it_miji_quanzhenxinfa`（maxLayer 8）；鹿鼎★白云观（maxLayer 6）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 归元（原创扩展命名） | `mv_quanzhenxinfa_guiyuan` | 3 | `aoe_self` | 0 | 5% | 3 | 900 | 驱散自身 1 个 `injury` / `poison`（品阶承）；`bf_huinei`·承·100%·2 | — |

- 被动：`ps_quanzhenxinfa_shangya` 夜攀悬崖（4 重，`attr:qinggong flat +4 → +10`；探索攀崖体力 −15%，08）；`ps_quanzhenxinfa_shouyi` 守一（7 重，战斗开始获得 `bf_shouyi` 2 回合）；`ps_quanzhenxinfa_yuanrong` 心法圆融（10 重，全真武学修炼 +10%）。

**`sk_sanqingzhang` 三清掌**（2 黄中 · 拳脚/拳掌 · 阳 · 0.70/0.30 · 原创扩展）
- reqs：`sect {sect_quanzhen, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；鹿鼎★白云观。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 玉清掌 | `mv_sanqingzhang_yuqing` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 上清掌 | `mv_sanqingzhang_shangqing` | 4 | `aoe_line n2` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 太清掌 | `mv_sanqingzhang_taiqing` | 7 | `aoe_single` · 1 | 1.25 | 6% | 2 | 1000 | 击退 1 | ✓ |

- 核算：上清掌 0.85 × 1.12 = 0.95；太清掌 1 + 0.24 + 0.05 − 0.05 = 1.24。被动：`ps_sanqingzhang_qingjing` 清静（5 重，`attr:resMind pp +5`）；`ps_sanqingzhang_yuanman` 入门圆满（10 重，全真拳脚软门槛 −10）。

**`sk_yuyangtui` 玉阳腿**（3 黄上 · 拳脚/腿法 · 阳 · 0.80/0.20 · 原创扩展）
- 依据：王处一道号玉阳子、绰号"铁脚仙"，曾独足跂立崖边震慑群豪（射雕，情节细节待考）。腿法持械不降效（05 §6.3）。
- reqs：`aptitude {apLeg 10}`；`sect {sect_quanzhen, rank 1}`；`hard [sect]`。layerStats `{hit [1, 3], resCC [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 铁脚 | `mv_yuyangtui_tiejiao` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 跂立千仞 | `mv_yuyangtui_qili` | 4 | `aoe_self`（架势） | 0 | 4% | 2 | 850 | `bf_wenzhong`·承·100%·2；至下次行动前被近战攻击以 0.8 倍反击 | — |
| 扫岳腿 | `mv_yuyangtui_saoyue` | 7 | `aoe_sweep` | 0.85 | 6% | 1 | 1000 | `bf_panshan`·承·30%·2 | ✓ |

- 核算：扫岳腿 0.75 × 1.17 = 0.88，−0.03 = 0.85。被动：`ps_yuyangtui_pinggao` 凭高（5 重，自身所在格高于目标时本武学 Z7 按高一级计）；`ps_yuyangtui_yuanman` 圆满（10 重，`attr:jump flat +1`）。

**`sk_changchunqinna` 长春擒拿手**（4 玄下 · 拳脚/擒拿 · 阳 · 0.75/0.25 · 原创扩展）
- 依据：丘处机道号长春子，性烈而膂力过人（射雕醉仙楼托举铜缸一节，细节待考）。
- reqs：`attrs {str 25}`；`aptitude {apGrapple 25}`；`sect {sect_quanzhen, rank 1}`；`prereq [sk_sanqingzhang ≥ 4]`；`hard [sect]`。layerStats `{seal [1, 6], parry [1, 4]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 扣腕 | `mv_changchunqinna_kouwan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_fengjingmai`（参数 weapon）·承·20%·2 | ✓ |
| 折肩 | `mv_changchunqinna_zhejian` | 1 | `aoe_single` · 1 | 1.10 | 6% | 1 | 1000 | `bf_waigong_jiang`·承·30%·2 | ✓ |
| 长春回手 | `mv_changchunqinna_huishou` | 4 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击以 0.9 倍反击，并 30% 施加 `bf_fengjingmai` | — |
| 托缸式 | `mv_changchunqinna_tuogang` | 7 | `aoe_single` · 1 | 1.20 | 7% | 2 | 1000 | 击退 2 | ✓ |

- 核算：扣腕 1 − 0.03；折肩 1.12 − 0.03；托缸式 1.29 − 0.10。被动：`ps_changchunqinna_nawan` 拿人先拿腕（5 重，对持兵器目标 Z3 +8%）；`ps_changchunqinna_dacheng` 大成（10 重，`attr:seal pp +5`）。

**`sk_haotianzhang` 昊天掌**（5 玄中 · 拳脚/拳掌 · 阳 · 0.55/0.45 · 原著（使用者待考））
- 原著：全真派掌法之名；招式命名为原创扩展。
- reqs：`attrs {str 25}`；`aptitude {apFist 25}`；`sect {sect_quanzhen, rank 1}`；`prereq [sk_sanqingzhang ≥ 4]`；`hard [sect, prereq]`。layerStats `{defIn [1, 5], hit [1, 5]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 昊天正气 | `mv_haotianzhang_zhengqi` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 云行雨施 | `mv_haotianzhang_yunxing` | 2 | `aoe_cross r1` · 1–2（`ranged`） | 0.70 | 7% | 2 | 1000 | — | ✓ |
| 紫气东来 | `mv_haotianzhang_ziqi` | 4 | `aoe_single` · 1 | 1.25 | 7% | 2 | 1000 | `bf_sangong`·承·40%·2 | ✓ |
| 昊天罔极（玄阶可选绝招） | `mv_haotianzhang_wangji` | 7 | `aoe_single` · 1 | 2.95 | 8% | — | 1200 | 击退 1 | ✓ |

- 核算：云行雨施 0.65 × 1.29 × 0.85 = 0.71；紫气东来 1.29 − 0.04；昊天罔极 3.0 − 0.05。被动：`ps_haotianzhang_zhengqi` 正气（5 重，对 `morality ≤ −20` 的目标 Z3 +8%）；`ps_haotianzhang_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_sanhuajudingzhang` 三花聚顶掌**（6 玄上 · 拳脚/拳掌 · 阳 · 0.40/0.60 · 原著）
- 原著：全真派掌法，神雕中郝大通以此掌误伤古墓孙婆婆致死（回目与细节待考）；"三花聚顶"为道家内丹语（精、气、神三花）。
- reqs：`aptitude {apFist 30, apInner 25}`；`sect {sect_quanzhen, rank 2}`；`prereq [sk_haotianzhang ≥ 5]`；`hard [sect, prereq]`。layerStats `{crit [1, 4], pierce [1, 6]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 精化气 | `mv_sanhuajudingzhang_jing` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 气化神 | `mv_sanhuajudingzhang_qi` | 3 | `aoe_single` · 1 | 1.15 | 7% | 1 | 1000 | `bf_neishang`·承·30%·4 | ✓ |
| 神还虚 | `mv_sanhuajudingzhang_shen` | 5 | `aoe_single` · 1–3（`ranged`） | 1.15 | 8% | 2 | 1000 | — | ✓ |
| 三花聚顶（绝招） | `mv_sanhuajudingzhang_juding` | 7 | `aoe_single` · 1 | 2.90 | 8% | — | 1200 | `bf_neishang`·承·100%·4 | ✓ |

- 核算：气化神 1.17 − 0.03；神还虚 1.34 × 0.85 = 1.14；三花聚顶 3.0 − 0.10。被动：`ps_sanhuajudingzhang_sanhua` 三花（1 重，对带 `injury` 标签目标 Z3 +4% → +10%）；`ps_sanhuajudingzhang_juding` 聚顶（6 重，本武学内劲部分无视内防 8% → 15%，Z2）；`ps_sanhuajudingzhang_dacheng` 大成（10 重，本武学 `crit flat +8`）。

**`sk_zhongnanjian` 终南剑法**（3 黄上 · 兵器/剑 · 阳 · 0.75/0.25 · 原创扩展）
- reqs：`sect {sect_quanzhen, rank 0}`；`hard [sect]`。layerStats `{parry [1, 3], hit [1, 3]}`。获取：拜师；鹿鼎★白云观。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 樵山问路 | `mv_zhongnanjian_wenlu` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 松涛 | `mv_zhongnanjian_songtao` | 4 | `aoe_sweep` | 0.85 | 5% | 1 | 1000 | — | ✓ |
| 白云出岫 | `mv_zhongnanjian_chuxiu` | 7 | `aoe_dash n3` · 1–3 | 1.20 | 6% | 2 | 1000 | — | ✓ |

- 核算：松涛 0.75 × 1.12 = 0.84；白云出岫 1.29 − 0.10。被动：`ps_zhongnanjian_zhonggong` 剑守中宫（5 重，`attr:parry pct +3%`）；`ps_zhongnanjian_yuanman` 入门圆满（10 重，学习全真剑法软门槛 −10）。

**`sk_quanzhenjian` 全真剑法**（5 玄中 · 兵器/剑 · 阳 · 0.60/0.40）——**完整定义见 05 §13.6**，本文不重述数值。
- 招式：定阳针 `mv_quanzhenjian_dingyang`（1 重，1.00）、七星聚会 `mv_quanzhenjian_qixing`（4 重，`aoe_multi` 7 段，1.10）、三清朝元 `mv_quanzhenjian_sanqing`（6 重，`aoe_line n3`，0.95，自身 `bf_jianshi`）、重阳遗意 `mv_quanzhenjian_chongyang`（7 重绝招，3.00）；被动玄门正宗 / 剑随身走 / 同气连枝 / 大成。`setTags: [set_quanzhen_beidou]`。
- 本文对它的依赖：同归剑法、天罡北斗阵以其为前置；玉女素心剑法"全真位"前置（05 §9.3.1）。建议 05 增补前置 `sk_zhongnanjian ≥ 4`（可选，§10 D-5），以构成"黄 → 玄 → 地"剑法链。

**`sk_jinyangong` 金雁功**（6 玄上 · 轻功 · 阳 · 0.80/0.20 · 原著）
- 原著：全真派轻功之名（射雕、神雕，传授细节待考）。`Q_skill = QS(6) = 74` 满层。
- reqs：`attrs {agi 30}`；`aptitude {apLight 25}`；`sect {sect_quanzhen, rank 1}`；`hard [sect]`。获取：拜师；射雕"马钰夜授"（maxLayer 8）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 雁翔 | `mv_jinyangong_yanxiang` | 1 | `aoe_self` | 0 | 5% | 3 | 800 | `bf_jixing`·承·100%·3 | — |
| 雁回（原创扩展命名） | `mv_jinyangong_yanhui` | 4 | `aoe_self` | 0 | 4% | 2 | 800 | 自身后撤 2 格（`retreat`，不触发截击）；`bf_piaohu`·承·100%·2 | — |

- 被动：`ps_jinyangong_qingshen` 身轻（1 重，`attr:eva pct +2% → +6%`）；`ps_jinyangong_panya` 攀崖（5 重，探索攀崖体力 −20%，战斗中攀越高差不额外耗移动力，08）；`ps_jinyangong_dacheng` 大成（10 重，`attr:jump flat +1`）。

**`sk_dabeidouzhen` 北斗大阵**（5 玄中 · 杂学/阵法（合击）· 阳 · 0.60/0.40 · 原著（名称待考））
- 原著：神雕重阳宫一役，全真三代弟子以七个天罡北斗阵合成七七四十九人的大阵迎战郭靖（回目待考）。本作改为 3–6 人可成的"小阵"（原创扩展），供三代弟子与玩家早期使用。
- reqs：`sect {sect_quanzhen, rank 2}`；`prereq [sk_quanzhenjian ≥ 3]`；`hard [sect]`。`special.formation`：同天罡北斗阵，成阵人数 ≥ 3；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 列阵 | `mv_dabeidouzhen_liezhen` | 1 | `aoe_allies r3` | 0 | 5% | 5 | 900 | 阵员 ≥ 3 成阵 3 回合：阵员常驻 `bf_zhuiji`；与 ≥ 2 名阵员相邻的敌人获得 `bf_suoding` | — |
| 合围 | `mv_dabeidouzhen_hewei` | 1 | `aoe_single` · 1 | 1.20 | 6% | 1 | 1000 | `bf_suoding`·承·60%·2 | ✓ |
| 换位 | `mv_dabeidouzhen_huanwei` | 4 | `aoe_swap`（友方）· 1–3 | 0 | 4% | 2 | 800 | 与 3 格内阵员换位 | — |

- 核算：合围 1 + 0.12 + 0.15（条件：目标与 ≥ 2 阵员相邻）− 0.03 = 1.24 ≈ 1.20。被动：`ps_dabeidouzhen_zhenzhong` 阵中（1 重，阵员 `attr:parry pct +3% → +6%`）；`ps_dabeidouzhen_xianghu` 相护（5 重，阵员被攻击后相邻阵员获得 `bf_yuanhu` 1 回合，每阵每回合 1 次）；`ps_dabeidouzhen_dacheng` 大成（10 重，装配本阵者可为天罡北斗阵补足阵员人数）。

### 2.6 进阶链与门派内搭配

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 地 → 天） | 全真吐纳诀（黄中）→ 4 重 → 全真心法（玄中）→ 6 重 → 金关玉锁二十四诀（地中）→ 5 重 → 先天功（天中） |
| 剑（黄 → 玄 → 地 / 天） | 终南剑法（黄上）→（建议 4 重）→ 全真剑法（玄中）→ 6 重 → 同归剑法（地下）；→ 5 重 → 天罡北斗阵（天下）；→ 5 重 → 玉女素心剑法全真位（天中） |
| 拳脚 | 三清掌（黄中）→ 4 重 → 昊天掌 / 长春擒拿手（玄）→ 5 重 → 三花聚顶掌（玄上）。**全真无地阶拳脚**（原著亦无），为有意保留的门派短板 |
| 阵法 | 北斗大阵（玄中，3 人）→ 天罡北斗阵（天下，4–6 人） |

- **推荐装配（射雕中期）**：主运全真心法＋辅运全真吐纳诀｜三花聚顶掌、长春擒拿手｜全真剑法、同归剑法｜金雁功｜天罡北斗阵。
- **阴阳搭配**：金关玉锁为调和桥接，可让先天功（阳）与玉女心经（阴）同装不相冲——对应原著"全真、古墓双修方成素心剑"。

---

## 3. 古墓派 `sect_gumu`

### 3.1 门派简介

- **来历**：林朝英所创。林朝英与王重阳相争，于终南山活死人墓中创玉女心经，专克全真武功（神雕追述）。门规严苛：弟子须终身居墓、不涉情爱（"有男子甘愿为她而死"方可下山之约，细节待考）。
- **神雕（1237–1259）**：小龙女为掌门，孙婆婆随侍；师姊李莫愁被逐后以"赤练仙子"之名横行，盗去《五毒秘传》（待考），以赤练神掌、冰魄银针、拂尘绝招著称；杨过拜入古墓，与小龙女合练玉女心经，终成玉女素心剑法（见 §4）。**强**：人少而精，轻功冠绝一时。
- **倚天**：原著不再有古墓门人现身，唯少林屠狮大会上黄衫女子自称来自终南山，识得九阴真经正宗（杨过后人之说，02 C9，待考）。本作以黄衫女子羁绊线传授部分古墓入门/中坚武学（★，原创扩展，maxLayer ≤ 8）。
- **敌人配置建议**：李莫愁（神雕具名 Boss，主力赤练神掌 / 冰魄银针 / 三无三不手，地下—地中）；洪凌波（精英，玄上）。

### 3.2 武学总表（16 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_gumuxinfa` | 古墓心法 | 内功/心法 | 3 黄上 | 阴 | 0/1 | 神雕、倚天★ | 拜师（职级 0）；寒玉床修习；倚天★黄衫女子 | 原著扩展 |
| `sk_hanyuxinjue` | 寒玉心诀 | 内功/心法 | 6 玄上 | 阴 | 0/1 | 神雕 | 拜师（职级 1）；寒玉床闭关顿悟 | 原创扩展 |
| `sk_yunvxinjing` | 玉女心经 | 内功/心法 | 10 天下 | 阴 | 0/1 | 神雕 | 小龙女传授（职级 2）；古墓石室解谜 | 原著（基准 §13） |
| `sk_tianluodiwang` | 天罗地网势 | 拳脚/拳掌 | 2 黄中 | 阴 | 0.70/0.30 | 神雕、倚天★ | 拜师（职级 0）；捕雀修炼 | 原著 |
| `sk_meinvquan` | 美女拳法 | 拳脚/拳掌 | 4 玄下 | 阴 | 0.70/0.30 | 神雕、倚天★ | 拜师（职级 1） | 原著 |
| `sk_chilianshenzhang` | 赤练神掌 | 拳脚/拳掌 | 7 地下 | 阴 | 0.45/0.55 | 神雕 | 李莫愁投师（邪）；秘籍；观摩 | 原著 |
| `sk_hantanjian` | 寒潭剑法 | 兵器/剑 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 拜师（职级 0） | 原创扩展 |
| `sk_yunvjian` | 玉女剑法 | 兵器/剑 | 6 玄上 | 阴 | 0.60/0.40 | 神雕、倚天★ | 拜师（职级 1）；古墓石室 | 原著 |
| `sk_jinlingsuo` | 金铃索法 | 兵器/鞭索 | 7 地下 | 阴 | 0.50/0.50 | 神雕 | 小龙女传授（职级 2） | 原著（兵刃名待考） |
| `sk_sanwusanbushou` | 三无三不手 | 兵器/鞭索（拂尘） | 6 玄上 | 阴 | 0.55/0.45 | 神雕 | 李莫愁投师（邪）；观摩 | 原著（"三不"招名待考） |
| `sk_buquegong` | 捕雀功 | 轻功 | 3 黄上 | 阴 | 0.80/0.20 | 神雕 | 拜师（职级 0）；古墓大厅捕雀修炼 | 原著扩展 |
| `sk_gumuqinggong` | 古墓轻功 | 轻功 | 9 地上 | 阴 | 0.80/0.20 | 神雕、倚天★ | 拜师（职级 2） | 原著扩展 |
| `sk_yufengzhen` | 玉蜂针 | 暗器 | 5 玄中 | 阴 | 0.70/0.30 | 神雕 | 拜师（职级 1）；需蜂针弹药 | 原著 |
| `sk_bingpoyinzhen` | 冰魄银针 | 暗器 | 7 地下 | 阴 | 0.70/0.30 | 神雕 | 李莫愁投师（邪）；五毒秘传附录 | 原著 |
| `sk_yufengshu` | 驭蜂术 | 杂学/驭兽 | 6 玄上 | 阴 | 0.50/0.50 | 神雕 | 小龙女传授（职级 1）；周伯通亦可转授 | 原著扩展（名称原创） |
| `sk_wudumichuan` | 五毒秘传 | 杂学/毒 | 6 玄上 | 阴 | 0.50/0.50 | 神雕 | 夺回秘本（李莫愁线）；孙婆婆口授残本 | 原著（内容待考） |

### 3.3 天级条目卡

#### `sk_yunvxinjing` 玉女心经（10 天下 · 内功 · 古墓）

> **原著**：林朝英所创，专克全真武功；练功时周身热气须外散、须有人护法，小龙女与杨过于古墓外花丛中合练，因旁人窥扰致小龙女受伤（神雕；窥扰者新修版有改动，见 §10 K-2）。古墓另有"十二少、十二多"养生要诀（神雕，出处待考）。心经末章即玉女素心剑法（见 §4）。招式与被动效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0/1 |
| 原生书界 | 神雕（基准 §13） |
| reqs | `attrs {agi 50, wil 55, wis 50}`；`aptitude {apInner 55}`；`sect {sect_gumu, rank 2}`；`prereq [sk_gumuxinfa ≥ 6 或 sk_hanyuxinjue ≥ 3]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 44, hpMaxPct 23, attrs {agi 8, wil 8, wis 2}, mpRegen 3.0` → IP 118（= 天下预算）；`stats {resMind 10, resHeat 10}`（20） |
| InnerDef | `seclusionCap: 8`；`auxUsableMoves: [mv_yunvxinjing_hufa]` |
| 层数要点 | 1 重"克全真"；2 重"清灵"；3 重散热；4 重"少思寡欲"；5 重护法；6 重"寒玉相济"；**7 重绝招冰心玉壶**；8 重"双修"；10 重"玉女大成" |
| 获取 | ① `master`：小龙女 `npc_xiaolongnv`（古墓职级 2，神雕主线第 3 幕后，02 §2.9 R3），maxLayer 10；② `puzzle`：古墓石室顶玉女心经石刻（林朝英所刻，原著），需古墓身份或小龙女同行（占位 `q_03_side_79`），maxLayer 10 |
| setTags | `[set_gumu_yunv, set_shendiao_xialv]` |
| conflicts | `{with: sk_zuoyouhubo, type: synergy}`：装配本功时左右互搏"纯一系数"+0.2（原著小龙女心无杂念、一学即会，05 §9.3.2）；与阳性主运的阴阳相冲按 05 §5.4（金关玉锁可桥接） |
| special | **修炼规则（原创扩展规则化）**：闭关修炼本功须"同修护法"（羁绊 ≥ 3 的队友同处闭关点）或在古墓寒玉床，否则每日心魔概率 ×2；闭关被伏击打断 → 走火 2 级（致敬小龙女练功被扰受伤）。`fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 散热（原创扩展命名） | `mv_yunvxinjing_sanre` | 3 | `aoe_self` | 0 | 8% | 3 | 900 | 驱散自身 2 个 `heat` / `injury` / `mind` 减益（品阶承）；回复 8% 气血 | — | 支援 |
| 护法（原创扩展命名） | `mv_yunvxinjing_hufa` | 5 | `aoe_single` · 1（友方） | 0 | 9% | 4 | 1000 | 目标 `bf_mian_xin`·承·100%·2、`bf_huinei`·承·100%·2；目标为羁绊 ≥ 3 者时自身同得 | — | 支援；可作辅运使用 |
| 冰心玉壶（绝招，原创扩展命名，取王昌龄诗） | `mv_yunvxinjing_bingxin` | 7 | `aoe_allies r2` | 0 | 10% | — | 1200 | 友方驱散全部 `mind` 减益；自身 `bf_jienei`·承·100%·3、`bf_piaohu`·承·100%·3 | — | 内功绝招以友方效果为主 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 克全真 | `ps_yunvxinjing_kequanzhen` | 1 | stat · Z5 | +6% → +15% | 对"主运内功或所用招式属 `sect_quanzhen`"的目标，本方招式 Z5 加算；与玉女剑法同类被动不叠加（取高）；`auxMode: scaled` |
| 清灵 | `ps_yunvxinjing_qingling` | 2 | stat · 属性层 | `attr:eva pct +3% → +8%`、`attr:spd pct +2% → +5%` | `auxMode: scaled` |
| 少思寡欲（十二少） | `ps_yunvxinjing_shiershao` | 4 | effect | −1 回合 | 心神类减益对自身持续 −1（最低 1）；`auxMode: full` |
| 寒玉相济 | `ps_yunvxinjing_hanyu` | 6 | mechanic | ×1.5 | 主运时于古墓寒玉床闭关，本功及古墓武学修炼 ×1.5（寒玉床功效之说待考；灵地系数另计，05 §8.3） |
| 双修 | `ps_yunvxinjing_shuangxiu` | 8 | effect · 属性层 / Z4 | `attr:atkIn pct +8%`、Z4 +5% | 与羁绊 ≥ 3、装配玉女心经 / 全真心法 / 金关玉锁的友方相距 ≤ 2 时双方获得；`auxMode: none` |
| 玉女大成 | `ps_yunvxinjing_dacheng` | 10 | mechanic | — | 玉女素心剑法独练系数 0.5 → 0.6（05 §9.3.1 `soloMult`）；`attr:spd pct +6%` |

### 3.4 地阶条目卡

#### `sk_chilianshenzhang` 赤练神掌（7 地下 · 拳脚/拳掌 · 古墓·李莫愁一系）

> **原著**：李莫愁"赤练仙子"的招牌毒掌，中者掌印殷红、毒发难救（神雕；"五毒神掌"是否为同一掌法之别名待考）。李莫愁临死于情花丛火中犹吟"问世间，情是何物，直教生死相许"（元好问词，神雕）。招式名除"五毒神掌"外为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.45/0.55 |
| 原生书界 | 神雕 |
| reqs | `attrs {agi 40, wil 35, wis 40}`；`aptitude {apFist 40}`；`morality {max −20}`（软，05 §7.3 邪派武学）；`prereq [sk_wudumichuan ≥ 3]`；`hard [prereq]` |
| layerStats | `{crit [1, 5], effHit [2, 10]}`（15） |
| 层数要点 | 1 重赤练吐信、"毒掌"；2 重朱砂掌印；3 重"赤印"；4 重赤练缠身；5 重翻鳞掌；6 重"邪心"；**7 重绝招生死相许**；9 重五毒神掌；10 重"赤练大成" |
| 获取 | ① `master`：李莫愁 `npc_limochou`（"投师"邪路线，占位 `q_03_faction_80`，原创扩展），maxLayer 10；② `manual`：击败李莫愁后于其行囊得残本 `it_miji_chilianshenzhang_can`（原创扩展），maxLayer 7；③ `observe`，maxLayer 6 |
| setTags · conflicts | `[set_chilian_xianzi]`；无 |
| special | 装配时持有 `bf_xielian`（邪气，06 §8.9：`resMind` −15pp、正派 NPC 初见好感 −10）；`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 赤练吐信 | `mv_chilianshenzhang_tuxin` | 1 | `aoe_single` · 1 | 0.85 | 6% | 0 | 900 | `bf_zhongdu`·承·30%·3 | ✓ | 1 −0.05（mp）−0.07（rec）−0.03 = 0.85 |
| 朱砂掌印 | `mv_chilianshenzhang_zhangyin` | 2 | `aoe_single` · 1 | 0.95 | 8% | 1 | 1000 | `bf_zhongdu`·承·100%·3（2 层） | ✓ | 1.17 −0.20 = 0.97 |
| 赤练缠身 | `mv_chilianshenzhang_chanshen` | 4 | `aoe_single` · 1 | 1.15 | 8% | 2 | 1000 | `bf_chanrao`·承·60%·2 | ✓ | 1.29 −0.12 = 1.17 |
| 翻鳞掌 | `mv_chilianshenzhang_fanlin` | 5 | `aoe_sweep` | 0.90 | 8% | 2 | 1000 | `bf_zhongdu`·承·50%·3 | ✓ | 0.75 × 1.29 = 0.97，−0.05 = 0.92 |
| 生死相许（绝招，原创扩展命名） | `mv_chilianshenzhang_xiangxu` | 7 | `aoe_single` · 1 | 2.85 | 9% | — | 1200 | `bf_judu`·承·100%·3 | ✓ | 3.0 −0.15 |
| 五毒神掌 | `mv_chilianshenzhang_wudu` | 9 | `aoe_cone n2` | 0.95 | 9% | 3 | 1000 | `bf_zhongdu`·承·70%·3（2 层） | ✓ | 0.75 × 1.46 = 1.10，−0.14 = 0.96 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 毒掌 | `ps_chilianshenzhang_duzhang` | 1 | stat · Z3 | +5% → +12% | 对带 `poison` 标签的目标 |
| 赤印 | `ps_chilianshenzhang_chiyin` | 3 | trigger | 30% | 命中已中毒 ≥ 3 层的目标时 30% 追加 `bf_judu` 2 回合（品阶承） |
| 邪心 | `ps_chilianshenzhang_xiexin` | 6 | stat | `attr:crit flat +8` | 自身 `morality ≤ −20` 时 |
| 赤练大成 | `ps_chilianshenzhang_dacheng` | 10 | effect | +1 层 | 本武学施加中毒时每次额外 +1 层（受 06 层数上限） |

#### `sk_jinlingsuo` 金铃索法（7 地下 · 兵器/鞭索 · 古墓）

> **原著**：小龙女所使古墓独门兵刃——白绸带端系金球、球中藏铃，以金球打穴、铃声扰敌（神雕；兵刃正式名称与出场回目待考）。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.50/0.50 |
| 原生书界 | 神雕 |
| weaponReq | `{category: whip}`；持古墓金铃索 `eq_jinlingsuo`（建议 ID，design/10 定级）时 8 重"铃声示警"生效 |
| reqs | `attrs {agi 45, wis 40}`；`aptitude {apWhip 40}`；`sect {sect_gumu, rank 2}`；`prereq [sk_tianluodiwang ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{seal [3, 10], hit [1, 5]}`（15） |
| 层数要点 | 1 重金铃点穴、铃音乱心、"打穴"；3 重白练缠腕；4 重"长索制敌"；5 重云袖回风；**7 重绝招金铃摄魄**；8 重灵蛇出洞、"铃声示警"；10 重"金铃大成" |
| 获取 | `master`：小龙女（古墓职级 2），maxLayer 10；杨过羁绊转授，maxLayer 8 |
| setTags · conflicts | `[set_gumu_yunv]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 金铃点穴 | `mv_jinlingsuo_dianxue` | 1 | `aoe_single` · 1–2 | 0.90 | 7% | 0 | 1000 | `bf_fengxue`·承·25%·1 | ✓ | 1 −0.05（射程 2 折算，本文约定）−0.05 = 0.90 |
| 铃音乱心 | `mv_jinlingsuo_lingyin` | 1 | `aoe_single` · 1–3（`ranged`） | 1.00 | 7% | 2 | 1000 | `bf_luanxin`·承·40%·2 | ✓ | 1.24 × 0.85 = 1.05，−0.06 = 0.99 |
| 白练缠腕 | `mv_jinlingsuo_chanwan` | 3 | `aoe_single` · 1–2 | 1.10 | 8% | 2 | 1000 | `bf_chanrao`·承·50%·2；`bf_jiaoxie`·承·20% | ✓ | 1.29 −0.05（射程）−0.10 −0.05 = 1.09 |
| 云袖回风 | `mv_jinlingsuo_huifeng` | 5 | `aoe_sweep` | 0.80 | 7% | 1 | 1000 | 击退 1 | ✓ | 0.75 × 1.12 = 0.84，−0.05 = 0.79 |
| 金铃摄魄（绝招） | `mv_jinlingsuo_shepo` | 7 | `aoe_chain n3` · 1–2 | 2.25 | 9% | — | 1200 | `bf_fengxue`·承·60%·1（每跳） | ✓ | 3.0 × 0.80 = 2.40，−0.12 = 2.28 |
| 灵蛇出洞 | `mv_jinlingsuo_lingshe` | 8 | `aoe_pull n2` · 1–3 | 1.00 | 8% | 1 | 1000 | — | ✓ | 0.95 × 1.17 = 1.11，−0.10 = 1.01 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 打穴 | `ps_jinlingsuo_daxue` | 1 | trigger | 8% → 20% | 本武学命中时施加 `bf_fengxue` 1 回合 |
| 长索制敌 | `ps_jinlingsuo_changsuo` | 4 | stat · Z3 | +8% | 对距离恰为 2 的目标 |
| 铃声示警（原创扩展） | `ps_jinlingsuo_lingsheng` | 8 | mechanic | — | 持金铃索时自身不被背击（背击按侧击计，Z7） |
| 金铃大成 | `ps_jinlingsuo_dacheng` | 10 | effect | +1 回合 | 本武学施加的 `bf_fengxue` 持续 +1（上限 2 回合，06 §11.1 红线 3） |

#### `sk_bingpoyinzhen` 冰魄银针（7 地下 · 暗器 · 古墓·李莫愁一系）

> **原著**：李莫愁独门暗器，针上淬有剧毒，解药为其独有；杨过幼时曾误触此针中毒（神雕开篇，细节待考）。招式名为原创扩展。
> **暗器预算约定（本文，§10 D-3）**：暗器招式为 `projectile`（×0.92）且不可招架（×0.85，只能闪避或以破箭 / 听风辨器应对），弹药成本不计入倍率（归 design/10 §8）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.70/0.30 |
| 原生书界 | 神雕 |
| 弹药 | 冰魄银针 `it_bingpoyinzhen`（建议 ID，design/10）；每次施放耗 1 份（多段计 1 份） |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apHidden 40}`；`morality {max −20}`（软）；`prereq [sk_wudumichuan ≥ 3]`；`hard [prereq]` |
| layerStats | `{effHit [2, 10], hit [1, 5]}`（15） |
| 层数要点 | 1 重单针、"淬毒"；2 重三针连发；4 重冰魄漫天；5 重"冰魄"；**7 重绝招冰魄摄魂**；8 重"独门解药"；10 重"冰魄大成" |
| 获取 | ① `master`：李莫愁（邪路线，同赤练神掌），maxLayer 10；② `manual`：五毒秘传附录 `it_miji_bingpoyinzhen`（原创扩展），maxLayer 8；③ `observe`，maxLayer 6 |
| setTags · conflicts | `[set_chilian_xianzi]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 单针 | `mv_bingpoyinzhen_danzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 7% | 0 | 1000 | `bf_judu`·承·30%·3 | ✗ | 0.92 × 0.85 = 0.78，−0.045 = 0.74 |
| 三针连发 | `mv_bingpoyinzhen_sanzhen` | 2 | `aoe_multi n3 r1` · 1–4 | 0.75 | 8% | 1 | 1000 | `bf_judu`·承·20%·3（每段） | ✗ | 0.85 × 1.17 × 0.78 = 0.78，−0.03 = 0.75 |
| 冰魄漫天 | `mv_bingpoyinzhen_mantian` | 4 | `aoe_cone n3` | 0.70 | 9% | 3 | 1000 | `bf_hanqi`·承·50%·3 | ✗ | 0.65 × 1.46 × 0.78 = 0.74，−0.05 = 0.69 |
| 冰魄摄魂（绝招，原创扩展命名） | `mv_bingpoyinzhen_shehun` | 7 | `aoe_bolt` · 1–5 | 2.00 | 9% | — | 1200 | `bf_judu`·承·100%·3；`bf_hanqi`·承·100%·3（2 层） | ✗ | 3.0 × 0.78 = 2.35，−0.15 −0.20 = 2.00 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 淬毒 | `ps_bingpoyinzhen_cuidu` | 1 | stat · Z3 | +5% → +12% | 对已中 `bf_judu` 的目标 |
| 冰魄 | `ps_bingpoyinzhen_hanpo` | 5 | trigger | 30% | 命中时附加 `bf_hanqi` 1 层（品阶承） |
| 独门解药 | `ps_bingpoyinzhen_jieyao` | 8 | mechanic | 每战 2 次 | 可以行动为相邻友方驱散 1 个 `poison` 减益（`antidote` 等效，品阶承）；原著冰魄银针解药唯李莫愁所有（待考） |
| 冰魄大成 | `ps_bingpoyinzhen_dacheng` | 10 | stat · cost | −15% | 本武学耗内 −15% |

#### `sk_gumuqinggong` 古墓轻功（9 地上 · 轻功 · 古墓）

> **原著扩展**：古墓一派以轻功见长，小龙女、杨过、李莫愁皆身法绝伦（神雕；"天下第一"之类评语待考）；入门由捕雀而来（见 `sk_buquegong`）。按 05 §14.6 #7，神雕本书界最高原生轻功为地上，本功即其一。招式为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.80/0.20 |
| 原生书界 | 神雕、倚天★（黄衫女子） |
| 轻功数值 | `Q_skill = QS(9) = 120`（10 重），按 03 §4.5 |
| reqs | `attrs {agi 50, wis 40}`；`aptitude {apLight 45}`；`sect {sect_gumu, rank 2}`；`prereq [sk_buquegong ≥ 6]`；`hard [sect, prereq]` |
| 层数要点 | 1 重绝迹、"身轻"；3 重踏壁；4 重"暗室"；5 重游身；**7 重绝招捕雀分影**；8 重"踏雪无痕"；10 重"身轻如絮" |
| 获取 | `master`：小龙女 / 孙婆婆（古墓职级 2），maxLayer 10；倚天★黄衫女子（羁绊 ≥ 4，占位 `q_04_bond_85`），maxLayer 8 |
| setTags · conflicts | `[set_gumu_yunv, set_chilian_xianzi]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绝迹（原创扩展命名） | `mv_gumuqinggong_jueji` | 1 | `aoe_self` | 0 | 5% | 2 | 800 | 本次行动移动力 +2；`bf_piaohu`·承·100%·2 | — |
| 踏壁（原创扩展命名） | `mv_gumuqinggong_tabi` | 3 | `aoe_self` | 0 | 5% | 2 | 800 | 本次移动可沿墙壁 / 崖壁直上 ≤ `jump + 2` 级（08） | — |
| 游身 | `mv_gumuqinggong_youshen` | 5 | `aoe_self` | 0 | 6% | 3 | 800 | `bf_youshi`·承·100%·3（游势；06 §8.8 典型来源即古墓身法） | — |
| 捕雀分影（绝招，原创扩展命名） | `mv_gumuqinggong_fenying` | 7 | `aoe_self` | 0 | 9% | — | 1000 | `bf_canying`·承·100%（2 层）；本次行动移动力 +3，移动后仍可出招 | — |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 身轻 | `ps_gumuqinggong_shenqing` | 1 | stat · 属性层 | `attr:eva pct +4% → +10%`、`attr:spd pct +2% → +6%` | |
| 暗室 | `ps_gumuqinggong_anshi` | 4 | stat · 属性层 | `attr:eva pct +10%` | 夜间、室内或昏暗地形中（光照归 08/11；古墓无光处修成，原创扩展） |
| 踏雪无痕 | `ps_gumuqinggong_taxue` | 8 | mechanic | — | 雪/沙/冰/沼不减速、不留痕、不触发陷阱（等同基准 §11 qg4 的地形能力，不改变 `qinggong` 值） |
| 身轻如絮 | `ps_gumuqinggong_dacheng` | 10 | trigger | ×1/战 | 战斗开始获得 `bf_canying` 1 层 |

### 3.5 玄阶 · 黄阶（紧凑表）

**`sk_gumuxinfa` 古墓心法**（3 黄上 · 内功 · 阴 · 原著扩展）
- 原著：古墓本门内功，小龙女授杨过并令其睡寒玉床修习（神雕；寒玉床助功之说待考）。
- 内功贡献：`mpMaxPct 10, hpMaxPct 5, attrs {agi 2, wil 2}, mpRegen 1.4`（IP 30）；`stats {resHeat 3, resMind 3}`；无招式。
- reqs：`sect {sect_gumu, rank 0}`；`hard [sect]`。获取：拜师小龙女 / 孙婆婆；倚天★黄衫女子（maxLayer 8）。
- 被动：`ps_gumuxinfa_qingxin` 清心寡欲（1 重，`attr:resMind pp +2 → +5`）；`ps_gumuxinfa_hanyuchuang` 寒玉床（4 重，于古墓寒玉床闭关时古墓武学修炼 ×1.3）；`ps_gumuxinfa_yuanman` 圆满（10 重，玉女心经软门槛 −10）。

**`sk_hanyuxinjue` 寒玉心诀**（6 玄上 · 内功 · 阴 · 原创扩展）
- 依据：寒玉床为古墓至宝（原著）；本作以"寒玉心诀"作借寒玉床修炼的中阶心法，填补古墓玄阶内功（原创扩展）。
- 内功贡献：`mpMaxPct 20, hpMaxPct 10, attrs {wil 4, agi 3, con 1}, mpRegen 2.2`（IP 57）；`stats {resHeat 5, resInjury 5}`。
- reqs：`attrs {wil 30}`；`aptitude {apInner 30}`；`sect {sect_gumu, rank 1}`；`prereq [sk_gumuxinfa ≥ 5]`；`hard [sect, prereq]`。获取：拜师；寒玉床闭关顿悟（占位 `q_03_qiyu_81`，maxLayer 8）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 寒玉真气（原创扩展命名） | `mv_hanyuxinjue_hanqi` | 3 | `aoe_self` | 0 | 6% | 3 | 900 | `bf_hutizhenqi`·承·100%·3（护体 = hpMax 10%）；驱散自身 1 个 `heat` 减益 | — |

- 被动：`ps_hanyuxinjue_hanyu` 寒玉（1 重，`attr:resHeat pp +3 → +8`）；`ps_hanyuxinjue_bingji` 冰肌（5 重，自身所受 `bf_zhuoshao` 持续 −1）；`ps_hanyuxinjue_jingxin` 静心（8 重，闭关心魔概率 −50%）；`ps_hanyuxinjue_dacheng` 寒玉大成（10 重，玉女心经修炼 +15%）。

**`sk_tianluodiwang` 天罗地网势**（2 黄中 · 拳脚/拳掌 · 阴 · 0.70/0.30 · 原著）
- 原著：古墓入门掌法，小龙女令杨过在大厅中以掌力拦截群雀、使之飞不出掌圈（神雕；雀数待考）。06 §8.7 定身之典型来源。
- reqs：`sect {sect_gumu, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；倚天★黄衫女子。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 罗网 | `mv_tianluodiwang_luowang` | 1 | `aoe_single` · 1 | 0.95 | 5% | 0 | 1000 | `bf_dingshen`·承·20%·1 | ✓ |
| 天罗 | `mv_tianluodiwang_tianluo` | 4 | `aoe_around` | 0.80 | 6% | 2 | 1000 | `bf_dingshen`·承·15%·1 | ✓ |
| 地网 | `mv_tianluodiwang_diwang` | 7 | `aoe_self`（架势） | 0 | 5% | 3 | 900 | `bf_jieji`·承·100%·2（截击） | — |

- 核算：罗网 1 − 0.05；天罗 0.65 × 1.29 = 0.84，−0.04。被动：`ps_tianluodiwang_buque` 捕雀（5 重，相邻敌人离开相邻格时 15% 获得 `bf_dingshen` 1 回合）；`ps_tianluodiwang_yuanman` 圆满（10 重，美女拳法、金铃索法软门槛 −10）。

**`sk_meinvquan` 美女拳法**（4 玄下 · 拳脚/拳掌 · 阴 · 0.70/0.30 · 原著）
- 原著：林朝英所创，每招摹拟一位古代美女情态（神雕，小龙女授杨过；另有"绿珠坠楼""文姬归汉""丽华梳妆""萍姬针神""曹令割鼻""则天垂帘""红拂夜奔"等招名，逐字与总数待考）。招式效果为原创扩展。
- reqs：`attrs {agi 25}`；`aptitude {apFist 25}`；`sect {sect_gumu, rank 1}`；`prereq [sk_tianluodiwang ≥ 4]`；`hard [sect]`。layerStats `{eva [1, 5], hit [1, 5]}`。获取：拜师；倚天★黄衫女子。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 貂蝉拜月 | `mv_meinvquan_diaochan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_mihuo`·承·10%·1 | ✓ |
| 西施捧心 | `mv_meinvquan_xishi` | 1 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | `bf_xieli`·承·100%·1；被近战攻击以 0.9 倍反击 | — |
| 昭君出塞 | `mv_meinvquan_zhaojun` | 3 | `aoe_dash n3` · 1–3 | 1.00 | 6% | 1 | 1000 | — | ✓ |
| 木兰弯弓 | `mv_meinvquan_mulan` | 5 | `aoe_single` · 1–3（`ranged`） | 1.00 | 7% | 1 | 1000 | — | ✓ |
| 红玉击鼓 | `mv_meinvquan_hongyu` | 7 | `aoe_single` · 1（3 段） | 1.30 | 7% | 2 | 1000 | — | ✓ |

- 核算：貂蝉拜月 1 − 0.025；昭君出塞 1.12 − 0.10；木兰弯弓 1.17 × 0.85 = 0.99；红玉击鼓 1 + 0.24 + 0.05。被动：`ps_meinvquan_enuo` 婀娜（4 重，`attr:eva pct +2% → +5%`）；`ps_meinvquan_qingcheng` 倾城（8 重，本武学附带心神类效果的效果命中 +5%）；`ps_meinvquan_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_hantanjian` 寒潭剑法**（3 黄上 · 兵器/剑 · 阴 · 0.70/0.30 · 原创扩展）
- 依据：古墓地下暗河寒潭通往墓外，杨过、小龙女曾由此出墓（原著，细节待考）。作古墓入门剑法与玉女剑法前置。
- reqs：`sect {sect_gumu, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 寒光 | `mv_hantanjian_hanguang` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 潜流 | `mv_hantanjian_qianliu` | 4 | `aoe_behind r2` | 0.85 | 5% | 1 | 1000 | 绕至目标身后出招（背击 Z7） | ✓ |
| 凝冰 | `mv_hantanjian_ningbing` | 7 | `aoe_single` · 1 | 1.10 | 6% | 1 | 1000 | `bf_hanqi`·承·60%·3 | ✓ |

- 核算：潜流 0.90 × 1.12 = 1.01，−0.15；凝冰 1.17 − 0.06。被动：`ps_hantanjian_lengfeng` 冷锋（5 重，对带 `cold` 标签目标 Z3 +6%）；`ps_hantanjian_yuanman` 圆满（10 重，玉女剑法软门槛 −10）。

**`sk_yunvjian` 玉女剑法**（6 玄上 · 兵器/剑 · 阴 · 0.60/0.40 · 原著）
- 原著：林朝英所创，招招克制全真剑法；与全真剑法二人分使、心意相通时合为玉女素心剑法（神雕）。原著未列本剑法招名（待考），下列招名为原创扩展。
- reqs：`attrs {agi 30}`；`aptitude {apSword 30}`；`sect {sect_gumu, rank 1}`；`prereq [sk_hantanjian ≥ 4]`；`hard [sect]`。layerStats `{eva [1, 5], hit [1, 5]}`。获取：拜师；古墓石室 `puzzle`（maxLayer 8）；倚天★黄衫女子（maxLayer 8）。`setTags: [set_gumu_yunv, set_shendiao_xialv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 素手摘星 | `mv_yunvjian_zhaixing` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 冷月窥人 | `mv_yunvjian_lengyue` | 2 | `aoe_single` · 1–2（`ranged` 剑气） | 1.00 | 7% | 1 | 1000 | — | ✓ |
| 素衣回风 | `mv_yunvjian_huifeng` | 4 | `aoe_sweep` | 0.90 | 7% | 1 | 1000 | — | ✓ |
| 破玄式 | `mv_yunvjian_poxuan` | 6 | `aoe_single` · 1 | 1.30 | 7% | 1 | 1000 | 条件：目标主运或所用招式属全真 | ✓ |
| 玉女投梭（绝招，典出谢鲲邻女投梭） | `mv_yunvjian_tousuo` | 7 | `aoe_single` · 1 | 3.00 | 8% | — | 1200 | — | ✓ |

- 核算：冷月窥人 1.17 × 0.85 = 0.99；素衣回风 0.75 × 1.17 = 0.88；破玄式 1 + 0.12 + 0.05 + 0.15 = 1.32。被动：`ps_yunvjian_kequanzhen` 克全真（2 重，对使用全真武学的目标 Z5 +4% → +10%，与玉女心经同类被动取高）；`ps_yunvjian_qingling` 轻灵（5 重，`attr:eva pct +3%`）；`ps_yunvjian_suxin` 素心前篇（8 重，与装配全真剑法的羁绊队友相距 ≤ 2 时双方 `attr:hit flat +5`）；`ps_yunvjian_dacheng` 大成（10 重，本武学 Z3 +6%）。

**`sk_sanwusanbushou` 三无三不手**（6 玄上 · 兵器/鞭索（拂尘）· 阴 · 0.55/0.45 · 原著）
- 原著：李莫愁以拂尘使出的狠辣绝招。"三无"为无孔不入、无所不至、无所不为；"三不"招名待考（神雕）。拂尘按软兵归 `whip`（建议 design/10 将拂尘列为鞭索细项）。
- reqs：`aptitude {apWhip 30}`；`morality {max −20}`（软）；`hard []`。layerStats `{effHit [2, 6], hit [1, 4]}`。获取：李莫愁投师（邪）；观摩（maxLayer 6）。`setTags: [set_chilian_xianzi]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 无孔不入 | `mv_sanwusanbushou_wukong` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_fengxue`·承·20%·1 | ✓ |
| 无所不至 | `mv_sanwusanbushou_wusuo` | 3 | `aoe_chain n2` · 1–2 | 1.00 | 7% | 2 | 1000 | — | ✓ |
| 无所不为 | `mv_sanwusanbushou_wusuowei` | 5 | `aoe_single` · 1 | 1.10 | 7% | 2 | 1000 | `bf_zhongdu`·承·60%·3（2 层）；`bf_chanrao`·承·30%·2 | ✓ |
| 三不手（玄阶可选绝招，招名待考） | `mv_sanwusanbushou_sanbu` | 7 | `aoe_single` · 1 | 2.90 | 8% | — | 1200 | `bf_judu`·承·50%·3 | ✓ |

- 核算：无孔不入 1 − 0.04；无所不至 0.80 × 1.29 = 1.03，−0.05（射程）；无所不为 1.29 − 0.12 − 0.06；三不手 3.0 − 0.075。被动：`ps_sanwusanbushou_fuchen` 拂尘卷（1 重，命中时 10% → 20% 施加 `bf_chanrao` 1 回合）；`ps_sanwusanbushou_duchen` 毒尘（5 重，对中毒目标 Z3 +6%）；`ps_sanwusanbushou_dacheng` 大成（10 重，`attr:effHit pct +5%`）。

**`sk_buquegong` 捕雀功**（3 黄上 · 轻功 · 阴 · 原著扩展）
- 原著：小龙女令杨过在古墓大厅中捕捉麻雀以练身法（神雕）。`Q_skill = QS(3) = 45` 满层。
- reqs：`sect {sect_gumu, rank 0}`；`hard [sect]`。获取：拜师。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 捕雀 | `mv_buquegong_buque` | 1 | `aoe_self` | 0 | 4% | 3 | 800 | `bf_piaohu`·承·100%·2；本次行动移动力 +1 | — |

- 被动：`ps_buquegong_lingqiao` 灵巧（4 重，`attr:eva pct +2% → +5%`）；`ps_buquegong_yuanman` 圆满（10 重，古墓轻功软门槛 −10）。

**`sk_yufengzhen` 玉蜂针**（5 玄中 · 暗器 · 阴 · 0.70/0.30 · 原著）
- 原著：以古墓玉蜂尾针炼成的暗器，中者麻痒难当，解药为玉蜂蜜浆（神雕；06 §8.7 麻痹之典型来源；解药细节待考）。弹药 `it_yufengzhen`（建议 ID）。预算按 §3.4 暗器约定（×0.92×0.85）。
- reqs：`aptitude {apHidden 25}`；`sect {sect_gumu, rank 1}`；`hard [sect]`。layerStats `{hit [1, 5], effHit [1, 5]}`。`setTags: [set_gumu_yunv]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 蜂针 | `mv_yufengzhen_fengzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 6% | 0 | 1000 | `bf_mabi`·承·20%·2 | ✗ |
| 群蜂 | `mv_yufengzhen_qunfeng` | 3 | `aoe_sq3` · 1–4 | 0.55 | 7% | 2 | 1000 | `bf_zhongdu`·承·30%·3 | ✗ |
| 麻痒难当 | `mv_yufengzhen_mayang` | 5 | `aoe_bolt` · 1–4 | 0.90 | 7% | 2 | 1000 | `bf_mabi`·承·60%·2 | ✗ |

- 核算：蜂针 0.78 − 0.04；群蜂 0.60 × 1.29 × 0.78 = 0.60，−0.03；麻痒难当 1.29 × 0.78 = 1.01，−0.12。被动：`ps_yufengzhen_fengdu` 蜂毒（1 重，命中时 15% → 30% 附加 `bf_zhongdu` 1 层）；`ps_yufengzhen_fengjiang` 蜂浆解药（5 重，可以行动为相邻友方驱散 1 个 `bf_mabi` 或 `poison` 减益，`antidote` 等效、品阶承）；`ps_yufengzhen_dacheng` 大成（10 重，本武学耗内 −10%）。

**`sk_yufengshu` 驭蜂术**（6 玄上 · 杂学/驭兽 · 阴 · 原著扩展）
- 原著：小龙女以玉蜂浆与手势驱使玉蜂，周伯通后亦学得（神雕；"驭蜂术"之名为原创扩展）。强度用魅力 `cha`（05 §2.3 驭兽）。
- reqs：`attrs {cha 30, wis 25}`；`sect {sect_gumu, rank 1}`；`hard [sect]`。获取：小龙女传授；周伯通 `npc_zhouboting` 转授（羁绊 ≥ 3，`reqsOverride {sect: null}`，maxLayer 8）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 玉蜂群 | `mv_yufengshu_fengqun` | 1 | `aoe_zone sq3 t3` · 1–4 | 0.25/跳 | 7% | 4 | 1000 | 每跳 `bf_zhongdu`·承·30%·3；遇火（灼烧 / 火把 / 火场地形）蜂群即散 | ✗ |
| 蜂阵护主 | `mv_yufengshu_fengzhen` | 4 | `aoe_zone sq3 t2`（以自身为心） | 0.25/跳 | 7% | 4 | 1000 | 区内敌方每跳 `bf_mabi`·承·15%·2 | ✗ |
| 蜂语 | `mv_yufengshu_fengyu` | 7 | `aoe_self` | 0 | 5% | 5 | 800 | `bf_tingfeng`·承·100%·3（可选中隐身者）；探索中侦察 6 格内伏兵与陷阱 | — |

- 核算：区域招式每跳 AF 0.25（05 §4.3）。被动：`ps_yufengshu_niangjiang` 酿浆（1 重，战斗外每日产出玉蜂浆 `it_yufengjiang` 1 份，回内与解麻痒，design/10）；`ps_yufengshu_fengzhong` 蜂众（5 重，蜂群区域持续 +1）；`ps_yufengshu_dacheng` 大成（10 重，蜂群每跳另附 `bf_mabi` 10%）。

**`sk_wudumichuan` 五毒秘传**（6 玄上 · 杂学/毒 · 阴 · 原著（内容待考））
- 原著：古墓所藏毒术秘本，为李莫愁盗去（神雕；书名、来历与内容细节待考）。强度用 `poi`（05 §2.3）。兵器淬毒的持久版归 design/10 §6.5 `poisonCoat`，本武学为战斗中的毒术。
- reqs：`attrs {wis 30}`；`hard []`。获取：李莫愁线（夺回或受赠，占位 `q_03_faction_80`），maxLayer 10；孙婆婆口授残篇（古墓职级 1），maxLayer 6。`setTags: [set_chilian_xianzi]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 淬毒 | `mv_wudumichuan_cuidu` | 1 | `aoe_self` | 0 | 5% | 4 | 900 | `bf_jingzhun`·承·100%·3（效果命中 +，配合被动"毒刃"） | — |
| 毒雾 | `mv_wudumichuan_duwu` | 3 | `aoe_zone sq3 t2` · 1–3 | 0.25/跳 | 7% | 4 | 1000 | 每跳 `bf_zhongdu`·承·40%·3；`friendlyFire: all`（05 §4.6 毒雾敌我皆中） | ✗ |
| 解毒 | `mv_wudumichuan_jiedu` | 5 | `aoe_single` · 1（友方） | 0 | 6% | 2 | 1000 | 驱散目标 2 个 `poison` 减益（`antidote` 等效，品阶承） | — |

- 被动：`ps_wudumichuan_duren` 毒刃（1 重，装配时本方兵器 / 暗器招式命中 10% → 20% 附加 `bf_zhongdu` 1 层）；`ps_wudumichuan_shidu` 识毒（4 重，`attr:resPoison pp +5 → +10`）；`ps_wudumichuan_baidu` 百毒谱（8 重，本方施加的中毒持续 +1）；`ps_wudumichuan_dacheng` 大成（10 重，赤练神掌、冰魄银针修炼 +20%）。

### 3.6 进阶链与门派内搭配

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 天） | 古墓心法（黄上）→ 5 重 → 寒玉心诀（玄上）→ 3 重 → 玉女心经（天下）；古墓心法 6 重亦可直入 |
| 剑（黄 → 玄 → 天） | 寒潭剑法（黄上）→ 4 重 → 玉女剑法（玄上）→ 5 重 → 玉女素心剑法古墓位（天中，§4） |
| 拳脚 / 鞭 | 天罗地网势（黄中）→ 4 重 → 美女拳法（玄下）；天罗地网势 5 重 → 金铃索法（地下） |
| 轻功 | 捕雀功（黄上）→ 6 重 → 古墓轻功（地上） |
| 李莫愁一系（邪，`morality ≤ −20` 软门槛） | 五毒秘传（玄上）→ 3 重 → 赤练神掌 / 冰魄银针（地下）；三无三不手（玄上） |

- **推荐装配（神雕中后期，古墓正宗）**：主运玉女心经＋辅运寒玉心诀、金关玉锁（桥接，便于兼修全真）｜美女拳法、天罗地网势｜玉女剑法、玉女素心剑法（或金铃索法，须换主手鞭索）｜古墓轻功｜玉蜂针｜驭蜂术、五毒秘传。
- **正邪分野**：赤练神掌装配即带 `bf_xielian`，与玉女心经同装不禁止，但正派 NPC 好感受影响（12）；这是"古墓同源、正邪殊途"的数据表达。

---

## 4. 杨过自创与传承、独孤求败剑冢剑意（`sect: null`）

### 4.1 传承简介

- **杨过（神雕）**：杨康之子，先后受学于欧阳锋（蛤蟆功、逆转经脉）、全真（全真武功）、古墓（古墓武学、玉女心经）、洪七公与黄药师（打狗棒法招式、弹指神通、玉箫剑法），又于古墓石室习九阴真经要旨（以上他组武学只引用 ID）。断臂后由神雕引至独孤求败剑冢，得玄铁重剑，在山洪、海潮中练剑而成玄铁剑法；与小龙女合使玉女素心剑法；十六年相思中自创黯然销魂掌；襄阳城下击毙蒙哥（原著）。
- **独孤求败剑冢（神雕）**：剑冢石刻与四柄剑（利剑、已弃之紫薇软剑、玄铁重剑、木剑）下的碑文记独孤求败一生剑道（碑文逐字待考）。按基准 §13，独孤九剑本体只在笑傲可学；神雕只得"剑冢剑意"。本作把四段碑文做成四门"剑意"杂学（原创扩展），离开神雕后化为残篇，建议并入同源组 `lg_dugu`，在笑傲加速独孤九剑（§10 D-7）。
- **获取结构**：天级三门受 02 §2.9 R3/R4 约束（神雕第 4 幕后；与古墓系合计至多深入 2 系）。

### 4.2 武学总表（7 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_anran` | 黯然销魂掌 | 拳脚/拳掌 | 11 天中 | 阴 | 0.35/0.65 | 神雕 | 杨过羁绊传授（须经"别离"） | 原著（基准 §13） |
| `sk_xuantie` | 玄铁剑法 | 兵器/剑 | 11 天中 | 中性 | 0.55/0.45 | 神雕 | 剑冢奇遇；山洪、海潮练剑；杨过羁绊 | 原著（基准 §13） |
| `sk_suxin` | 玉女素心剑法 | 兵器/剑（双人合璧） | 11 天中 | 调和 | 0.60/0.40 | 神雕 | 合击领悟；古墓石室心经末章 | 原著（基准 §13；规则见 05 §9.3.1） |
| `sk_lijianyi` | 利剑意 | 杂学/心神 | 6 玄上 | 中性 | 0.50/0.50 | 神雕 | 剑冢第一碑 | 原创扩展（碑文原著） |
| `sk_ruanjianyi` | 软剑意 | 杂学/心神 | 6 玄上 | 中性 | 0.50/0.50 | 神雕 | 剑冢第二碑（紫薇软剑已弃） | 原创扩展（碑文原著） |
| `sk_zhongjianyi` | 重剑意 | 杂学/心神 | 8 地中 | 中性 | 0.60/0.40 | 神雕 | 剑冢第三碑（玄铁重剑处） | 原创扩展（碑文原著） |
| `sk_mujianyi` | 木剑意 | 杂学/心神 | 9 地上 | 中性 | 0.60/0.40 | 神雕 | 剑冢第四碑（木剑处） | 原创扩展（碑文原著） |

### 4.3 天级条目卡

#### `sk_anran` 黯然销魂掌（11 天中 · 拳脚/拳掌 · 杨过）

> **原著**：杨过与小龙女分别十六年间所创，取江淹《别赋》"黯然销魂者，唯别而已矣"之意，共十七招，心有所感方显威力（神雕，与周伯通切磋一节述招名；心境与掌力关系之情节待考）。十七招名：心惊肉跳、杞人忧天、无中生有、拖泥带水、徘徊空谷、力不从心、行尸走肉、庸人自扰、倒行逆施、废寝忘食、孤形只影、饮恨吞声、六神不安、穷途末路、面无人色、想入非非、呆若木鸡（逐字与次序待考）。招式效果为原创扩展。原著定数 17 招，超出"天阶 5–10 招"规范，按原著例外（05 §3.5）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0.35/0.65 |
| 原生书界 | 神雕 |
| reqs | `attrs {con 50, wil 55, wis 50}`；`aptitude {apFist 55, apInner 50}`；`morality {min 0}`；`hard [morality]` |
| layerStats | `{counter [3, 8], resMind [2, 12]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重心惊肉跳、拖泥带水、"黯然"；3 重"袖里乾坤"；5 重"心有所感"；**7 重绝招黯然销魂**；8 重"别赋"；10 重呆若木鸡、"黯然大成" |
| 获取 | `master`：杨过 `npc_yangguo`（羁绊 ≥ 4；神雕"十六年之约"一幕之后，02 §2.9 R3；主角本书界须经历"别离"——羁绊 ≥ 3 的同伴离队或倒下，记 `flag anran_bieli`，原创扩展门槛；占位 `q_03_bond_82`），maxLayer 10 |
| setTags · conflicts | `[set_shendiao_xialv]`；无 |
| special | `fusible: false`（以情入武，不可熔铸，原创规则）；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 心惊肉跳 | `mv_anran_xinjing` | 1 | `aoe_single` · 1 | 1.10 | 9% | 1 | 1000 | `bf_zhenshe`·承·50%·1 | ✓ | 1.17 −0.05 |
| 拖泥带水 | `mv_anran_tuoni` | 1 | `aoe_single` · 1（袖卷、掌拍 2 段） | 1.20 | 9% | 1 | 1100 | `bf_jiansu`·承·60%·2 | ✓ | 1.24 −0.06 |
| 杞人忧天 | `mv_anran_qiren` | 2 | `aoe_leap` · 1–3 | 0.95 | 9% | 1 | 1000 | 仰攻不受低打高惩罚（`noLowGroundPenalty`） | ✓ | 0.90 × 1.17 = 1.05，−0.10 |
| 无中生有 | `mv_anran_wuzhong` | 2 | `aoe_single` · 1 | 0.95 | 8% | 1 | 1000 | 不可反击 | ✗ | 1.12 × 0.85 |
| 徘徊空谷 | `mv_anran_paihuai` | 3 | `aoe_dash n3` · 1–3 | 1.15 | 9% | 2 | 1000 | 出招后后撤 1 格 | ✓ | 1.29 −0.10 −0.05 |
| 力不从心 | `mv_anran_libucongxin` | 3 | `aoe_self`（架势） | 0 | 5% | 2 | 800 | `bf_qianlong`·承·100%·1（至下次行动前 Z4 +15%）；被近战攻击以 1.20 倍反击 | — | 触发型 |
| 行尸走肉 | `mv_anran_xingshi` | 4 | `aoe_single` · 1（3 段） | 1.20 | 9% | 2 | 1000 | 自身 `bf_wenzhong`·承·100%·2 | ✓ | 1.29 −0.10 |
| 庸人自扰 | `mv_anran_yongren` | 4 | `aoe_single` · 1 | 1.15 | 8% | 2 | 1000 | `bf_luanxin`·承·50%·2 | ✓ | 1.24 −0.075 |
| 倒行逆施 | `mv_anran_daoxing` | 5 | `aoe_behind r2` | 1.00 | 9% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ | 0.90 × 1.29 = 1.16，−0.15 |
| 废寝忘食 | `mv_anran_feiqin` | 5 | `aoe_single` · 1 | 0.85 | 6% | 0 | 900 | —（无冷却连击用） | ✓ | 1 −0.10 −0.07 |
| 孤形只影 | `mv_anran_guxing` | 6 | `aoe_single` · 1 | 1.25 | 8% | 1 | 1000 | 条件：自身 2 格内无友方 | ✓ | 1 +0.12 +0.15 |
| 饮恨吞声 | `mv_anran_yinhen` | 6 | `aoe_self` | 0 | 8% | 3 | 800 | `bf_hutizhenqi`·承·100%·2（hpMax 12%）；`bf_xuli`·承·100%（下一本武学招式 Z3 +20%） | — | 蓄力类 |
| 六神不安 | `mv_anran_liushen` | 7 | `aoe_around` | 0.90 | 10% | 3 | 1000 | `bf_luanxin`·承·30%·2 | ✓ | 0.65 × 1.46 = 0.95，−0.045 |
| 穷途末路 | `mv_anran_qiongtu` | 7 | `aoe_single` · 1 | 1.60 | 9% | 2 | 1000 | 条件：自身气血 < 40% | ✓ | 1 +0.24 +0.05 +0.30 |
| 黯然销魂（绝招；原创扩展命名：十七招一气使完） | `mv_anran_xiaohun` | 7 | `aoe_single` · 1 | 2.45 | 10% | — | 1200 | `bf_zhenshe`·承·100%·1 | ✗ | 3.0 × 0.85 = 2.55，−0.10 |
| 面无人色 | `mv_anran_mianwu` | 8 | `aoe_single` · 1 | 1.30 | 9% | 3 | 1000 | `bf_kongju`·承·40%·1 | ✓ | 1.41 −0.10 |
| 想入非非 | `mv_anran_xiangru` | 9 | `aoe_multi n5 r2` · 1–2 | 1.25 | 10% | 3 | 1000 | 5 段随机落点 | ✓ | 0.85 × 1.46 = 1.24 |
| 呆若木鸡 | `mv_anran_daimu` | 10 | `aoe_single` · 1 | 1.35 | 9% | 3 | 1100 | `bf_xuanyun`·承·50%·1 | ✓ | 1.48 −0.125 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 黯然 | `ps_anran_anran` | 1 | stat · Z3 | 见 06 | 装配时常驻 `bf_anran`（06 §8.1：`Z3 +8%×G×(1 − hpPct)`；羁绊队友倒地或未上阵时 ×1.5） |
| 袖里乾坤（原创扩展） | `ps_anran_xiuli` | 3 | stat · 属性层 | `attr:parry flat +5 → +12` | 空手且副手亦空时（独臂以袖代手） |
| 心有所感 | `ps_anran_xinsuo` | 5 | effect | 暴击 +15 / Z3 −10% | 本场羁绊 ≥ 3 的队友倒地后本武学 `crit flat +15`；全队气血均 ≥ 90%（心境平和）时本武学 Z3 −10%（原著心情欢愉时掌力大减之意，情节待考） |
| 别赋 | `ps_anran_biefu` | 8 | trigger | 30% | 命中后使目标获得 `bf_xieqi`（泄气）1 回合 |
| 黯然大成 | `ps_anran_dacheng` | 10 | mechanic | — | 招式栏 +1；本武学全部招式冷却 −1（最低 0） |

#### `sk_xuantie` 玄铁剑法（11 天中 · 兵器/剑 · 独孤求败剑意 / 杨过）

> **原著**：独孤求败剑冢碑文"重剑无锋，大巧不工"；杨过得玄铁重剑，随神雕于山洪、海潮中练剑，剑法返璞归真、以拙胜巧（神雕，碑文逐字与练剑地点待考）。原著未列招名，下列招名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.55/0.45 |
| 原生书界 | 神雕 |
| weaponReq | `{category: sword, tags: [heavy]}`：不持重剑仍可用，但失去 1 重"重剑"与 5 重"神力"（05 §6.2）；本命兵器玄铁重剑 `eq_xuantiejian`（基准 §14，天中），负重 `Q_load 15`（03 §4.5） |
| reqs | `attrs {str 55, con 50, wis 50}`；`aptitude {apSword 55}`；`hard []` |
| layerStats | `{pierce [3, 10], resCC [2, 10]}`（20） |
| 层数要点 | 1 重重剑无锋、大巧不工、"重剑"；2 重山洪倒卷；3 重"以拙胜巧"；4 重海潮叠浪；5 重雕翼扫、"神力"；6 重剑冢葬锋；**7 重绝招玄铁千钧**；8 重"不滞于物"；9 重草木为剑；10 重"大巧不工" |
| 获取 | ① `qiyu`：剑冢（神雕引路，占位 `q_03_qiyu_83`），maxLayer 7；② 修炼奇遇"山洪练剑"→ `sourceCap 9`、"海潮练剑"→ 10（原著情节，占位 `q_03_qiyu_84`）；③ `master`：杨过（羁绊 ≥ 4），maxLayer 10。进度门槛：神雕第 4 幕后 |
| setTags · conflicts | `[set_dugu_jianzhong, set_shendiao_xialv]`；`{with: sk_dugu9, type: synergy}`：同时装配两者招式 Z3 +5%（02 同源 `lg_dugu`，笑傲起方可同装） |
| special | `fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 重剑无锋 | `mv_xuantie_wufeng` | 1 | `aoe_single` · 1 | 1.10 | 9% | 0 | 1100 | — | ✓ | 1 +0.05 +0.07 |
| 大巧不工 | `mv_xuantie_daqiao` | 1 | `aoe_single` · 1 | 1.20 | 9% | 1 | 1100 | 击退 1 | ✓ | 1.24 −0.05 |
| 山洪倒卷 | `mv_xuantie_shanhong` | 2 | `aoe_line n3` | 1.10 | 10% | 2 | 1100 | 每目标击退 1 | ✓ | 0.80 × 1.41 = 1.13，−0.05 |
| 海潮叠浪 | `mv_xuantie_haichao` | 4 | `aoe_single` · 1（3 段） | 1.35 | 10% | 2 | 1100 | `bf_chihuan`·承·50% | ✓ | 1.41 −0.05 |
| 雕翼扫（原创扩展，致敬神雕以翅助练） | `mv_xuantie_diaoyi` | 5 | `aoe_sweep` | 0.95 | 9% | 1 | 1100 | — | ✓ | 0.75 × 1.24 = 0.93 |
| 剑冢葬锋 | `mv_xuantie_zangfeng` | 6 | `aoe_self`（架势） | 0 | 6% | 3 | 800 | `bf_shoushi`·承·100%·2；被近战攻击以 1.0 倍反击并击退 1 | — | 架势 |
| 玄铁千钧（绝招） | `mv_xuantie_qianjun` | 7 | `aoe_single` · 1 | 2.35 | 10% | — | 1200 | 击退 2；`bf_xuanyun`·承·50%·1 | ✗ | 3.0 × 0.85 = 2.55，−0.10 −0.125 |
| 草木为剑（碑文"草木竹石均可为剑"） | `mv_xuantie_caomu` | 9 | `aoe_single` · 1–2（`ranged` 剑气） | 1.10 | 9% | 2 | 1000 | 可持任意兵器或空手施放（×0.9） | ✓ | 1.29 × 0.85 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 重剑 | `ps_xuantie_zhongjian` | 1 | stat · Z2 / Z9 | 无视外防 10% → 25%；被招架时招架减免 −50% | 仅持 `heavy` 剑 |
| 以拙胜巧 | `ps_xuantie_zhuo` | 3 | stat · Z3 | +6% → +12% | 目标 `combo > 0` 或 `spd` 高于自身时 |
| 神力 | `ps_xuantie_shenli` | 5 | stat / effect / mechanic | `attr:resCC pp +10`；击退 +1 格；战斗开始获得 `bf_wushi_zhaojia` 2 回合 | 仅持 `heavy` 剑（06 §8.9 无视招架之典型来源即玄铁剑法） |
| 不滞于物 | `ps_xuantie_buzhi` | 8 | mechanic | ×0.9 | 可持棍杖、奇门兵器或空手施展本武学（`weaponReq.altCategories`，同 05 独孤九剑 9 重规则） |
| 大巧不工（大成） | `ps_xuantie_dacheng` | 10 | mechanic | 收招 −100 | 本武学全部招式收招 −100 |

#### `sk_suxin` 玉女素心剑法（11 天中 · 兵器/剑（双人合璧）· 古墓 × 全真）

> **原著**：玉女心经末章所载，一人使全真剑法、一人使玉女剑法，两剑招招相补、心意相通方显威力；杨过、小龙女以之败金轮法王等强敌（神雕）。招名取琴棋书画、闲情雅事：浪迹天涯（全真）、花前月下（古墓）、清饮小酌、抚琴按箫、松下对弈、池边调鹤、扫雪烹茶等（逐字与全部数目待考；"举案齐眉"尤待考）。合璧规则以 05 §9.3.1 为准，本卡只补招式与被动。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和（全真阳 × 古墓阴）· 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {agi 50, wis 50}`；`aptitude {apSword 55}`；角色位前置（05 §9.3.1）：全真位 `sk_quanzhenjian ≥ 5` / 古墓位 `sk_yunvjian ≥ 5`；`hard [prereq]` |
| layerStats | `{hit [3, 10], eva [2, 10]}`（20） |
| 层数要点 | 1 重浪迹天涯、花前月下、"合璧"；2 重清饮小酌；3 重抚琴按箫、"相克相济"；4 重松下对弈；5 重池边调鹤；6 重扫雪烹茶、"素心"；**7 重绝招双剑合璧**；8 重举案齐眉；9 重"同心"；10 重"素心大成" |
| 获取 | ① `combo` 合击领悟（05 §7.7：主角与羁绊 ≥ 4 的队友各占一位，合击 5 次 + 羁绊事件，占位 `q_03_bond_86`），maxLayer 10；② `puzzle` 古墓石室·玉女心经末章（须搭档同行），maxLayer 10。进度门槛：神雕第 4 幕后 |
| setTags | `[set_shendiao_xialv, set_gumu_yunv]` |
| special | 05 §9.3.1 全部规则（合璧状态、独练 ×0.5、情缘 Z3 +10%、左右互搏一人合璧 ×0.8、断尘之誓失去情缘加成）；**情花毒联动**：身中 `bf_qinghuadu` 者施放本武学招式即"动情"发作（06 §8.5；原著杨过中情花毒后与小龙女合使剑法时痛楚难当，情节待考）；`fusible: false`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 浪迹天涯（全真剑意） | `mv_suxin_langji` | 1 | `aoe_dash n3` · 1–3 | 1.05 | 9% | 1 | 1000 | — | ✓ | 1.17 −0.10 |
| 花前月下（古墓剑意） | `mv_suxin_huaqian` | 1 | `aoe_single` · 1（3 段） | 1.05 | 9% | 1 | 1000 | 自身 `bf_piaohu`·承·100%·2 | ✓ | 1.17 −0.10 |
| 清饮小酌 | `mv_suxin_qingyin` | 2 | `aoe_allies r2`（自身与搭档） | 0 | 8% | 3 | 900 | 回复 10% 气血；`bf_huinei`·承·100%·2 | — | 支援 |
| 抚琴按箫 | `mv_suxin_fuqin` | 3 | `aoe_single` · 1–3（`ranged`，2 段） | 1.10 | 9% | 2 | 1000 | — | ✓ | 1.29 × 0.85 |
| 松下对弈 | `mv_suxin_songxia` | 4 | `aoe_self`（架势） | 0 | 7% | 2 | 850 | `bf_ningshen`·承·100%·2；被近战攻击以 1.1 倍反击 | — | 触发型 |
| 池边调鹤 | `mv_suxin_chibian` | 5 | `aoe_pull n2` · 1–3 | 1.10 | 9% | 2 | 1000 | — | ✓ | 0.95 × 1.29 = 1.23，−0.10 |
| 扫雪烹茶 | `mv_suxin_saoxue` | 6 | `aoe_sweep` | 0.80 | 8% | 1 | 1000 | `bf_hanqi`·承·30%·3 | ✓ | 0.75 × 1.12 = 0.84，−0.03 |
| 双剑合璧（绝招，05 §9.3.1） | `mv_suxin_hebi` | 7 | `aoe_single` · 1 | 3.00 | 10% | — | 1200 | 搭档集气 −300 同时出招（其本武学最高普通招式 ×1.0，流程归 09）；情缘 Z3 +10% | ✓ | 3.0 基准 |
| 举案齐眉（招名待考） | `mv_suxin_juan` | 8 | `aoe_allies r2`（自身与搭档） | 0 | 9% | 4 | 900 | `bf_ruiyi`·承·100%·2；`bf_xieli`·承·100%·2 | — | 支援 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 合璧 | `ps_suxin_hebi` | 1 | mechanic | — | 05 §9.3.1：合璧状态全额；独练 ×0.5（玉女心经 10 重 0.6） |
| 相克相济 | `ps_suxin_xiangji` | 3 | trigger | ×1 | 合璧时一人招式被招架，另一人下一次本武学招式获得 `bf_bizhong`（必中 ×1） |
| 素心 | `ps_suxin_suxin` | 6 | effect | −1 回合 | 合璧时双方所受心神类减益持续 −1 |
| 同心 | `ps_suxin_tongxin` | 9 | trigger | 每战 2 次 | 合璧中搭档气血 < 30% 且相邻时，自身获得 `bf_yuanhu` 1 回合 |
| 素心大成 | `ps_suxin_dacheng` | 10 | mechanic | — | 左右互搏一人合璧系数 0.8 → 0.9；招式栏 +1 |

### 4.4 地阶条目卡（剑冢剑意）

> **剑冢四意共通规则（原创扩展）**：四意均为 `misc/mind`（杂学·心神），不可携带；按"持何种剑"触发——利剑意对应普通剑、软剑意对应软剑（`soft`）与鞭索、重剑意对应重剑（`heavy`）、木剑意对应木剑（`wooden`）或无剑。兵器标签由 design/10 标注。四意品阶随独孤求败年岁递进，获取须依次拜读剑冢四碑（占位 `q_03_qiyu_83` 分四段；重、木二意在神雕第 4 幕后）。

#### `sk_zhongjianyi` 重剑意（8 地中 · 杂学/心神 · 独孤求败剑冢）

> 碑文（原著，逐字待考）："重剑无锋，大巧不工。四十岁前恃之横行天下。"

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {str 45, wis 40}`；`aptitude {apSword 45}`；`prereq [sk_lijianyi ≥ 3]`；`hard [prereq]` |
| layerStats | `{pierce [2, 8], resCC [2, 7]}`（15） |
| 层数要点 | 1 重负剑、"重剑之意"；4 重沉剑、"沉雄"；**7 重绝招横行天下**；8 重"同源"；10 重"大成" |
| 获取 | 剑冢第三碑（玄铁重剑处），maxLayer 10 |
| setTags · conflicts | `[set_dugu_jianzhong]`；无 |
| special | `fusible: false`；残篇化后建议入同源组 `lg_dugu`（§10 D-7） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 负剑（原创扩展命名） | `mv_zhongjianyi_fujian` | 1 | `aoe_self` | 0 | 6% | 4 | 800 | `bf_shichen`·承·100%·3（势沉：暴伤 +） | — |
| 沉剑（原创扩展命名） | `mv_zhongjianyi_chenjian` | 4 | `aoe_self`（架势） | 0 | 6% | 3 | 800 | `bf_xushi`·承·100%（蓄势：下一击 Z3 +12%×G、击退 +1） | — |
| 横行天下（绝招，取碑文） | `mv_zhongjianyi_hengxing` | 7 | `aoe_self` | 0 | 9% | — | 1000 | `bf_wushi_zhaojia`·承·100%·2；`bf_mian_kong`·承·100%·1 | — |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 重剑之意 | `ps_zhongjianyi_zhongjian` | 1 | stat · Z3 | +6% → +14% | 持重剑时剑法招式；代价：剑法招式收招 +50 |
| 沉雄 | `ps_zhongjianyi_chenxiong` | 4 | effect | +1 格 | 持重剑时剑法招式击退距离 +1 |
| 同源 | `ps_zhongjianyi_tongyuan` | 8 | stat · Z3 | +5% | 与玄铁剑法同时装配（相生 ≤ +8%，05 §9.2） |
| 大成 | `ps_zhongjianyi_dacheng` | 10 | stat · Z9 | −30% | 持重剑时剑法招式被招架的招架减免 −30% |

#### `sk_mujianyi` 木剑意（9 地上 · 杂学/心神 · 独孤求败剑冢）

> 碑文（原著，逐字待考）："四十岁后，不滞于物，草木竹石均可为剑。自此精修，渐进于无剑胜有剑之境。"

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 中性 · 0.60/0.40 |
| 原生书界 | 神雕 |
| reqs | `attrs {wis 55, wil 45}`；`aptitude {apSword 50}`；`prereq [sk_zhongjianyi ≥ 5, sk_xuantie ≥ 5]`；`hard [prereq]` |
| layerStats | `{parry [2, 8], hit [2, 7]}`（15） |
| 层数要点 | 1 重折枝为剑、"不滞于物"；4 重草木竹石、"以木胜铁"；**7 重绝招万物为锋**；8 重"剑意无形"；10 重"渐近无剑" |
| 获取 | 剑冢第四碑（木剑处），maxLayer 10 |
| setTags · conflicts | `[set_dugu_jianzhong]`；无 |
| special | `fusible: false`；残篇化后建议入同源组 `lg_dugu`（§10 D-7） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 折枝为剑（原创扩展命名） | `mv_mujianyi_zhezhi` | 1 | `aoe_self` | 0 | 6% | 3 | 800 | 本回合可以空手或任意兵器施展已装配的剑法招式（×0.8） | — | 功能 |
| 草木竹石 | `mv_mujianyi_caomu` | 4 | `aoe_self` | 0 | 6% | 4 | 800 | `bf_yuanzhuan`·承·100%·3 | — | 增益 |
| 万物为锋（绝招，原创扩展命名） | `mv_mujianyi_wanwu` | 7 | `aoe_wave d1 w5`（`ranged`） | 1.55 | 9% | — | 1200 | 立于草地 / 竹林 / 树林地形时本招 Z3 +20%（08） | ✓ | 3.0 × 0.60 × 0.85 = 1.53 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 不滞于物 | `ps_mujianyi_buzhi` | 1 | mechanic | ×0.7 → ×0.9 | 持棍杖、奇门或空手时可施展剑法武学（`weaponReq.altCategories` 全局放宽） |
| 以木胜铁 | `ps_mujianyi_yimu` | 4 | mechanic | — | 持木剑时免疫品阶 ≤ 本意的 `bf_duanbing`、`bf_jiaoxie` |
| 剑意无形 | `ps_mujianyi_wuxing` | 8 | stat · Z5 | ×0.7 | 敌方 `bf_pojian`（破剑）对自身的 Z5 加成与招架乘数效果 ×0.7 |
| 渐近无剑 | `ps_mujianyi_dacheng` | 10 | stat · Z3 | +6% | 装配时剑法招式伤害 +6% |

### 4.5 玄阶（紧凑表）

**`sk_lijianyi` 利剑意**（6 玄上 · 杂学/心神 · 中性 · 原创扩展）——碑文："凌厉刚猛，无坚不摧，弱冠前以之与河朔群雄争锋。"（逐字待考）
- reqs：`attrs {wis 35}`；`aptitude {apSword 30}`；`hard []`。获取：剑冢第一碑（神雕第 3 幕后），maxLayer 10。`setTags: [set_dugu_jianzhong]`；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 争锋 | `mv_lijianyi_zhengfeng` | 1 | `aoe_self` | 0 | 5% | 4 | 800 | `bf_gongshi`·承·100%·3（攻势） | — |

- 被动：`ps_lijianyi_lingli` 凌厉（1 重，持普通剑——无 `heavy`/`soft`/`wooden` 标签——时剑法招式无视外防 4% → 10%，Z2）；`ps_lijianyi_wujian` 无坚不摧（5 重，剑法招式对带 `guard` 类增益的目标 Z3 +8%）；`ps_lijianyi_dacheng` 大成（10 重，剑法 `attr:crit flat +5`）。

**`sk_ruanjianyi` 软剑意**（6 玄上 · 杂学/心神 · 中性 · 原创扩展）——碑文："紫薇软剑，三十岁前所用，误伤义士不祥，乃弃之深谷。"（逐字待考；软剑原物已弃，冢中只余碑）
- reqs：`attrs {wis 35, agi 30}`；`hard []`。获取：剑冢第二碑（神雕第 3 幕后），maxLayer 10。`setTags: [set_dugu_jianzhong]`；`fusible: false`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绕剑 | `mv_ruanjianyi_raojian` | 1 | `aoe_self` | 0 | 5% | 4 | 800 | `bf_wushi_zhaojia`·承·100%·1（下一次剑法 / 鞭法招式不经招架） | — |

- 被动：`ps_ruanjianyi_rouren` 柔韧（1 重，持软剑或鞭索时 `attr:combo pp +2 → +6`）；`ps_ruanjianyi_qijian` 弃剑之诫（5 重，本方范围剑招不误伤友方；击杀 `morality ≥ 20` 的目标后本场剑法 Z3 −10%——碑文"误伤义士不祥"之诫，原创扩展规则化）；`ps_ruanjianyi_dacheng` 大成（10 重，剑法 `attr:hit flat +5`）。

### 4.6 进阶链

| 链 | 前置关系 |
|---|---|
| 剑冢 | 利剑意（玄上）→ 3 重 → 重剑意（地中）→ 5 重 ＋ 玄铁剑法 5 重 → 木剑意（地上）；软剑意独立（第二碑） |
| 合璧 | 全真剑法 5 重（全真位）/ 玉女剑法 5 重（古墓位）→ 玉女素心剑法 |
| 情 | 黯然销魂掌：羁绊传授，须经"别离"（无前置武学） |

- **推荐装配（神雕终盘，杨过路线）**：主运玉女心经＋辅运金关玉锁（桥接）、寒玉心诀｜黯然销魂掌、美女拳法｜玄铁剑法、玉女素心剑法（持玄铁重剑时素心仍可用，05 §6.2 只看类别）｜古墓轻功｜玉蜂针｜重剑意、木剑意。

---

## 5. 武当派 `sect_wudang`

### 5.1 门派简介

- **神雕末（伏笔）**：少年张君宝随觉远在少林，与郭襄相识（神雕末回；02 C7"神雕中与张君宝结缘"回响）。武当尚未开派。
- **倚天（约 1336–1363）**：张三丰开派，门下宋远桥、俞莲舟、俞岱岩、张松溪、张翠山、殷梨亭、莫声谷七侠。俞岱岩重伤后张三丰以"武林至尊…"二十四字创倚天屠龙功，传张翠山；为七弟子创真武七截阵；晚年当众创传太极拳、太极剑（原著）。**强**：六大派之一，张三丰为当世第一人。
- **笑傲（明中叶）**：冲虚道长为武林泰斗，以太极剑与令狐冲对剑（原著）。太极一脉已残，按 02 §5.7 为残承 `lineageGrade 10`。**中**：大派，高手凋零。
- **侠客（明）**：武当掌门赴侠客岛不归（02 C7；掌门名"愚茶"待考）。**弱**：掌门空缺。
- **书剑（1753–1759）**：陆菲青（"绵里针"）、马真（待考）、张召重（"火手判官"，投身清廷）同出武当；陆菲青传李沅芷（原著）。**中**：张召重为书界一流高手。
- **飞狐（约 1766–1771）**：福康安"天下掌门人大会"上有武当掌门（名号待考）。本作只提供入门—中坚武学（原创扩展延伸）。
- **低武★**：原著鹿鼎、连城、白马、鸳鸯未见武当；本作在连城（湖北荆州一带，与武当山同省）与鸳鸯（"太岳四侠"之"太岳"为武当山古称，作彩蛋）设"游方武当道人"传授入门武学（原创扩展，须 chapters/09、11 采纳），供 1/1/1 携带书界补位。
- **敌人配置建议**：倚天武当弟子普通地下、七侠为具名（地中—天中）；书剑张召重为具名 Boss（主力无极玄功拳 / 柔云剑术，地下，配凝碧剑）。

### 5.2 武学总表（20 门，另引用武当九阳功）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_taihegong` | 太和功 | 内功/心法 | 2 黄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（职级 0）；游方道人★ | 原创扩展 |
| `sk_liangyixinfa` | 两仪心法 | 内功/心法 | 5 玄中 | 调和 | 0/1 | 倚天、笑傲、侠客、书剑、飞狐 | 拜师（职级 1）；秘籍 | 原创扩展 |
| `sk_chunyangwuji` | 纯阳无极功 | 内功/心法 | 8 地中 | 阳 | 0/1 | 倚天、笑傲★、侠客★、书剑★ | 拜师（职级 2） | 原著（细节待考） |
| `sk_wudangjiuyang` | 武当九阳功 | 内功/心法 | 地阶（倚天组定） | 阳 | — | 倚天 | 倚天组定义，本文只引用 | 原著 |
| `sk_wudangchangquan` | 武当长拳 | 拳脚/拳掌 | 1 黄下 | 阳 | 0.85/0.15 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（职级 0）；游方道人★ | 原著 |
| `sk_mianzhang` | 绵掌 | 拳脚/拳掌 | 5 玄中 | 调和 | 0.45/0.55 | 倚天、笑傲★、侠客★、书剑、飞狐★、连城★、鸳鸯★ | 拜师（职级 1）；书剑陆菲青 | 原著（细节待考） |
| `sk_wudangjiemaishou` | 武当截脉手 | 拳脚/指法 | 5 玄中 | 阳 | 0.40/0.60 | 倚天、笑傲、侠客、书剑 | 拜师（职级 1） | 原创扩展 |
| `sk_taijituishou` | 太极推手 | 拳脚/擒拿 | 6 玄上 | 调和 | 0.40/0.60 | 倚天、笑傲、侠客、书剑、飞狐 | 拜师（职级 2） | 原创扩展（拳理原著） |
| `sk_huzhaojuehushou` | 虎爪绝户手（虎爪手） | 拳脚/擒拿 | 7 地下 | 阳 | 0.75/0.25 | 倚天、笑傲★、侠客★ | 拜师（职级 3，俞莲舟一系） | 原著（细节待考） |
| `sk_wujixuangongquan` | 无极玄功拳 | 拳脚/拳掌 | 7 地下 | 阳 | 0.55/0.45 | 书剑、笑傲★、侠客★ | 拜师（职级 3）；击败张召重得拳谱 | 原著（细节待考） |
| `sk_taijiquan` | 太极拳 | 拳脚/拳掌 | 11 天中 | 调和 | 0.40/0.60 | 倚天（笑傲残承 10） | 张三丰传授；"太极初传"主线奇遇 | 原著（基准 §13） |
| `sk_zhenwujian` | 真武剑法 | 兵器/剑 | 3 黄上 | 阳 | 0.75/0.25 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（职级 0）；游方道人★ | 原创扩展 |
| `sk_rouyunjian` | 柔云剑术 | 兵器/剑 | 7 地下 | 调和 | 0.60/0.40 | 书剑、笑傲★、侠客★、飞狐★ | 陆菲青传授；拜师（职级 2） | 原著 |
| `sk_raozhirou` | 绕指柔剑 | 兵器/剑 | 6 玄上 | 阴 | 0.45/0.55 | 倚天、笑傲★ | 拜师（职级 2，殷梨亭一系，待考） | 原著（细节待考） |
| `sk_shenmen13` | 神门十三剑 | 兵器/剑 | 7 地下 | 阳 | 0.70/0.30 | 倚天、笑傲★、侠客★、书剑★ | 拜师（职级 3） | 原著（细节待考） |
| `sk_yitiantulonggong` | 倚天屠龙功 | 兵器/奇门（笔·钩） | 8 地中 | 调和 | 0.55/0.45 | 倚天 | 张翠山羁绊；王盘山石壁拓字奇遇 | 原著 |
| `sk_taijijian` | 太极剑 | 兵器/剑 | 11 天中 | 调和 | 0.50/0.50 | 倚天（笑傲残承 10） | 张三丰传授；"太极剑传"主线奇遇 | 原著（基准 §13） |
| `sk_wudangyunbu` | 武当云步 | 轻功 | 3 黄上 | 阳 | 0.80/0.20 | 倚天、笑傲、侠客、书剑、飞狐、连城★、鸳鸯★ | 拜师（职级 0）；游方道人★ | 原创扩展 |
| `sk_tiyunzong` | 梯云纵 | 轻功 | 8 地中 | 阳 | 0.80/0.20 | 倚天、笑傲★、侠客★、书剑★、飞狐★ | 拜师（职级 2） | 原著 |
| `sk_furongjinzhen` | 芙蓉金针 | 暗器 | 6 玄上 | 阳 | 0.70/0.30 | 书剑、飞狐★ | 陆菲青 / 李沅芷传授 | 原著 |
| `sk_zhenwuqijie` | 真武七截阵 | 杂学/阵法（合击） | 8 地中 | 阳 | 0.55/0.45 | 倚天、笑傲★、侠客★ | 武当门派任务链"真武七截"（原创扩展）；合击领悟 | 原著 |

> 注：`sk_wudangjiuyang` 行只作引用，不计入本组 66 门。内力性质取向：太极一系调和（配调和主运得 +12% 相性），纯阳 / 九阳一系阳；绕指柔剑取阴（"百炼钢化为绕指柔"）。

### 5.3 天级条目卡

#### `sk_taijiquan` 太极拳（11 天中 · 拳脚/拳掌 · 武当）

> **原著**：张三丰于武当山当众演示新创太极拳，张无忌现学现用，以之败阿三（刚相）；拳理"以慢打快、以静制动、后发制人、用意不用力"；招名揽雀尾、单鞭、提手上势、白鹤亮翅、搂膝拗步、手挥琵琶、进步搬拦捶、如封似闭、十字手、抱虎归山等见该回（倚天；逐字、次序及"云手""合太极"是否出现待考）。招式效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.40/0.60 |
| 原生书界 | 倚天（笑傲：残承 `partial`、`lineageGrade 10`，02 §5.7 / E9，待基准 P4） |
| reqs | `attrs {wis 55, wil 50}`；`aptitude {apFist 55}`；`morality {min 10}`；`sect {sect_wudang, rank 3}`；`hard [sect, morality]` |
| layerStats | `{parry [3, 10], counter [2, 10]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重揽雀尾、单鞭、"借力打力"；2 重白鹤亮翅；3 重搂膝拗步、"后发制人"；4 重手挥琵琶；5 重进步搬拦捶、"四两拨千斤"；6 重如封似闭；**7 重十字手、绝招抱虎归山**；8 重"以慢打快"；9 重云手；10 重"合太极" |
| 获取 | ① `master`：张三丰 `npc_zhangsanfeng`（武当职级 3），maxLayer 10；② `qiyu`"太极初传"（倚天主线：张三丰当众演拳，主角在场即可习得，原著；占位 `q_04_main_87`；`reqsOverride {sect: null}`），maxLayer 10；③ 笑傲印证（残承）：冲虚道长 `npc_chongxu`。进度门槛：倚天第 4 幕后 |
| setTags · conflicts | `[set_wudang_taiji]`；`{with: sk_taijijian, type: synergy}`（见 10 重） |
| special | `fusible: true`；`observable: false`（"当众传拳"以剧情奇遇实现，不开放常规观摩） |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 揽雀尾 | `mv_taijiquan_lanque` | 1 | `aoe_single` · 1 | 0.95 | 8% | 0 | 1000 | `bf_shiheng`·承·50%·1 | ✓ | 1 −0.05 |
| 单鞭 | `mv_taijiquan_danbian` | 1 | `aoe_single` · 1 | 1.05 | 8% | 1 | 1000 | 击退 1 | ✓ | 1.12 −0.05 |
| 白鹤亮翅 | `mv_taijiquan_baihe` | 2 | `aoe_self`（架势） | 0 | 5% | 2 | 800 | `bf_jingshi`·承·100%；被近战攻击以 1.0 倍反击 | — | 触发型 |
| 搂膝拗步 | `mv_taijiquan_louxi` | 3 | `aoe_sweep` | 0.85 | 8% | 1 | 1000 | — | ✓ | 0.75 × 1.12 |
| 手挥琵琶 | `mv_taijiquan_shouhui` | 4 | `aoe_single` · 1 | 1.05 | 8% | 1 | 1000 | `bf_waigong_jiang`·承·60%·2 | ✓ | 1.12 −0.06 |
| 进步搬拦捶 | `mv_taijiquan_banlan` | 5 | `aoe_dash n2` · 1–2 | 1.20 | 9% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 如封似闭 | `mv_taijiquan_rufeng` | 6 | `aoe_self` | 0 | 8% | 3 | 800 | `bf_shoushi`·承·100%·2；`bf_xieli`·承·100%·2 | — | 架势 |
| 十字手 | `mv_taijiquan_shizi` | 7 | `aoe_single` · 1（2 段） | 1.05 | 8% | 1 | 1000 | `bf_fengjingmai`（参数 unarmed）·承·30%·2 | ✓ | 1.12 −0.045 |
| 抱虎归山（绝招） | `mv_taijiquan_baohu` | 7 | `aoe_single` · 1 | 2.75 | 10% | — | 1200 | 借力摔投：与目标换位（`swap`）；`bf_xuanyun`·承·40%·1 | ✓ | 3.0 −0.15 −0.10 |
| 云手（招名待考） | `mv_taijiquan_yunshou` | 9 | `aoe_around` | 0.80 | 9% | 2 | 1000 | `bf_shiheng`·承·40%·1 | ✓ | 0.65 × 1.29 = 0.84，−0.04 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 借力打力 | `ps_taijiquan_jieli` | 1 | stat · Z3 | +6% → +15% | 对 `atkOut` 高于自身的目标（以条件增伤实现；"按对方攻击计算"的精确钩子见 §10 D-6） |
| 后发制人 | `ps_taijiquan_houfa` | 3 | effect | 见 06 | 装配时常驻 `bf_houfa`（06 §8.4：受近战攻击后以基础招式 ×0.6 反击，每回合 1 次；典型来源即太极拳） |
| 四两拨千斤 | `ps_taijiquan_siliang` | 5 | trigger · Z9 | +10pp | 招架成功时攻击者获得 `bf_shiheng` 1 回合（06 典型来源即太极拳），本次招架减免 +10pp |
| 以慢打快 | `ps_taijiquan_yiman` | 8 | stat | 暴击 +10；速度 −5% | 目标 `spd` 高于自身时本武学 `crit flat +10`；装配时自身 `attr:spd pct −5%` |
| 合太极 | `ps_taijiquan_hetaiji` | 10 | mechanic | — | 招式栏 +1；与太极剑同时装配时双方招式 Z3 +8%（`lg_taiji` 相生，05 §9.2 上限） |

#### `sk_taijijian` 太极剑（11 天中 · 兵器/剑 · 武当）

> **原著**：张三丰当众传授太极剑，张无忌将招式"忘得干干净净"后，以木剑应对八臂神剑方东白所持倚天剑（倚天；剑招三环套月、大魁星、燕子抄水、左拦扫、右拦扫等名逐字待考）；笑傲中冲虚道长以太极剑与令狐冲对剑，剑招连环成圈（笑傲）。招式效果为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.50/0.50 |
| 原生书界 | 倚天（笑傲：残承 `partial`、`lineageGrade 10`） |
| reqs | `attrs {wis 55, agi 50}`；`aptitude {apSword 55}`；`morality {min 10}`；`sect {sect_wudang, rank 3}`；`hard [sect, morality]` |
| layerStats | `{parry [4, 12], hit [2, 8]}`（20） |
| moveSlots | 5（10 重 6） |
| 层数要点 | 1 重三环套月、大魁星、"剑意不在招"；2 重燕子抄水；3 重左右拦扫、"圆转"；4 重小魁星；5 重剑圈、"以钝克锐"；6 重黏剑卸兵；**7 重绝招太极生两仪**；8 重"以静制动"；10 重"忘招" |
| 获取 | ① `master`：张三丰（职级 3），maxLayer 10；② `qiyu`"太极剑传"（倚天主线：张三丰当众授剑，须完成"忘招"——闭关 1 日、期间不装配其他剑法，原创扩展仪式；占位 `q_04_main_88`），maxLayer 10；③ 笑傲印证（残承）：冲虚道长。进度门槛：倚天第 4 幕后 |
| setTags · conflicts | `[set_wudang_taiji]`；`{with: sk_taijiquan, type: synergy}`；受独孤九剑克制（笑傲令狐冲以独孤九剑寻得冲虚剑圈破绽，故本武学只削弱破剑、不免疫） |
| special | `fusible: true`；`observable: false` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 三环套月 | `mv_taijijian_sanhuan` | 1 | `aoe_single` · 1（3 段） | 1.15 | 9% | 1 | 1000 | — | ✓ | 1.17 |
| 大魁星 | `mv_taijijian_dakuixing` | 1 | `aoe_single` · 1 | 0.90 | 8% | 0 | 1000 | 自身 `bf_yuanzhuan`·承·100%·2 | ✓ | 1 −0.10 |
| 燕子抄水 | `mv_taijijian_yanzi` | 2 | `aoe_dash n3` · 1–3 | 1.20 | 9% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 左右拦扫 | `mv_taijijian_lansao` | 3 | `aoe_sweep`（左右 2 段） | 0.90 | 9% | 1 | 1000 | — | ✓ | 0.75 × 1.17 = 0.88 |
| 小魁星（招名待考） | `mv_taijijian_xiaokuixing` | 4 | `aoe_self`（架势） | 0 | 6% | 2 | 850 | `bf_jingshi`·承·100%；被近战攻击以 1.1 倍反击 | — | 触发型 |
| 剑圈（原创扩展命名，笑傲"剑圈"之说） | `mv_taijijian_jianquan` | 5 | `aoe_around` | 0.80 | 9% | 2 | 1000 | `bf_chizhi`·承·50%·2 | ✓ | 0.65 × 1.29 = 0.84，−0.05 |
| 黏剑卸兵（原创扩展命名） | `mv_taijijian_zhanjian` | 6 | `aoe_single` · 1 | 1.35 | 9% | 2 | 1000 | 条件：目标持兵器；`bf_jiaoxie`·承·40% | ✓ | 1.44 −0.10 |
| 太极生两仪（绝招，原创扩展命名） | `mv_taijijian_liangyi` | 7 | `aoe_single` · 1 | 2.90 | 10% | — | 1200 | 目标周身八格内敌人 `bf_shiheng`·承·100%·1 | ✓ | 3.0 −0.10 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 剑意不在招 | `ps_taijijian_jianyi` | 1 | mechanic | ×0.7 | 本武学招式不可被观摩；敌方 `bf_pojian` 对本武学的 Z5 加成与招架乘数 ×0.7 |
| 圆转 | `ps_taijijian_yuanzhuan` | 3 | stat | 见 06 | 装配时常驻 `bf_yuanzhuan`（06 §8.1 典型来源即太极剑剑意） |
| 以钝克锐 | `ps_taijijian_yidun` | 5 | stat · Z3 / mechanic | +10% | 持木剑（`wooden`）时本武学 Z3 +10%，且免疫品阶 ≤ 本武学的 `bf_duanbing`（原著张无忌以木剑对倚天剑） |
| 以静制动 | `ps_taijijian_jingzhi` | 8 | trigger | — | 战斗开始获得 `bf_jingshi`（静势；06 §8.8 典型来源即太极剑，移动即清空） |
| 忘招（大成） | `ps_taijijian_wangzhao` | 10 | trigger · Z3 | 见 06 | 招式栏 +1；每使用一个本场尚未用过的本武学招式后获得 `bf_ruiyi` 1 回合（"忘得干干净净"——不拘成招） |

### 5.4 地阶条目卡

#### `sk_chunyangwuji` 纯阳无极功（8 地中 · 内功 · 武当）

> **原著**：武当本门内功之名（倚天；张三丰以本门内功为幼年张无忌疗玄冥寒毒而不能尽除，所用功法名目与细节待考）。招式与被动为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0/1 |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★ |
| reqs | `attrs {con 45, wil 40, wis 40}`；`aptitude {apInner 45}`；`sect {sect_wudang, rank 2}`；`prereq [sk_liangyixinfa ≥ 5 或 sk_taihegong ≥ 7]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 32, hpMaxPct 18, attrs {con 5, str 3, wil 4}, mpRegen 1.8` → IP 83（= 地中预算）；`stats {resCold 10, resInjury 5}`（15） |
| InnerDef | `auxUsableMoves: [mv_chunyangwuji_quhan]` |
| 层数要点 | 1 重"纯阳"；2 重纯阳驱寒；4 重无极归一；5 重"寒邪难侵"；**7 重绝招纯阳真火**；8 重"无极"；10 重"纯阳大成" |
| 获取 | `master`：倚天宋远桥 `npc_songyuanqiao` / 俞莲舟 `npc_yulianzhou`，书剑陆菲青（武当职级 2），maxLayer 10；`manual` `it_miji_chunyangwuji`（笑傲★、侠客★武当藏经），maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；`{with: sk_xuanming, type: counter}`：纯阳驱寒对玄冥寒毒 `bf_handu` 只能压制、不能根治（06 §8.5 寒毒唯九阳根治）；与武当九阳功同为阳，可成三运同源（05 §5.3） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 纯阳驱寒 | `mv_chunyangwuji_quhan` | 2 | `aoe_single` · 0–1（友方） | 0 | 9% | 3 | 1000 | 驱散目标 2 个 `cold` 减益（品阶承；`bf_handu` 仅压制 2 回合）；回复 12% 气血 | — | 支援；可作辅运使用 |
| 无极归一（原创扩展命名） | `mv_chunyangwuji_guiyi` | 4 | `aoe_self` | 0 | 9% | 4 | 900 | `bf_hutizhenqi`·承·100%·3（hpMax 12%）；`bf_neijin_sheng`·承·100%·2 | — | 支援 |
| 纯阳真火（绝招，原创扩展命名） | `mv_chunyangwuji_zhenhuo` | 7 | 对敌 `aoe_around`；对友 `aoe_allies r2` | 1.20 | 9% | — | 1200 | 友方各驱散 2 个 `cold` 减益，`bf_yuhan`·承·100%·3 | ✓ | 3.0 × 0.65 = 1.95，−0.75（友方驱散与增益）= 1.20 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 纯阳 | `ps_chunyangwuji_chunyang` | 1 | stat · 属性层 | `attr:resCold pp +3 → +10` | `auxMode: scaled` |
| 寒邪难侵 | `ps_chunyangwuji_hanxie` | 5 | effect | 每回合 −1 层 | 每回合开始驱散自身 1 层 `bf_hanqi`（`circulate` 等效，品阶承）；`auxMode: full` |
| 无极 | `ps_chunyangwuji_wuji` | 8 | stat · cost | −8% | 装配时武当门派武学招式耗内 −8% |
| 纯阳大成 | `ps_chunyangwuji_dacheng` | 10 | stat · 属性层 | `attr:atkIn pct +8%` | 仅主运 |

#### `sk_huzhaojuehushou` 虎爪绝户手（7 地下 · 拳脚/擒拿 · 武当）

> **原著**：张三丰早年所创、专拿要害的狠辣擒拿，后以其过于阴损而严禁门下轻用；俞莲舟曾以之授张无忌（倚天；授受情节与招名待考）。招式名为原创扩展；"绝户"之效本作抽象为"伤及根本"（创口难愈与内伤），不作具体描写。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.75/0.25 |
| 原生书界 | 倚天、笑傲★、侠客★ |
| reqs | `attrs {str 45, wis 40}`；`aptitude {apGrapple 45}`；`sect {sect_wudang, rank 3}`；`prereq [sk_wudangchangquan ≥ 6]`；`hard [sect, prereq]` |
| layerStats | `{seal [3, 10], crit [1, 5]}`（15） |
| 层数要点 | 1 重虎爪、拿腰眼、"虎威"；3 重猛虎扑食；4 重"扣腕夺兵"；5 重分筋断脉；**7 重绝招绝户一爪**；8 重"拿穴"；10 重"虎爪大成" |
| 获取 | `master`：俞莲舟（职级 3），maxLayer 10；`manual` `it_miji_huzhaojuehushou`（笑傲★武当藏经），maxLayer 7 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | **门规代价**：对 `morality > −20` 的目标使用本武学招式，本场结束品德 −3（每场至多 1 次；原著张三丰禁门下轻用，原创扩展规则化）；`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 虎爪 | `mv_huzhaojuehushou_huzhao` | 1 | `aoe_single` · 1 | 0.95 | 7% | 0 | 1000 | `bf_fengjingmai`（参数 unarmed）·承·25%·2 | ✓ | 1 −0.04 |
| 拿腰眼（原创扩展命名） | `mv_huzhaojuehushou_yaoyan` | 1 | `aoe_single` · 1 | 1.05 | 7% | 1 | 1000 | `bf_neishang`·承·50%·4 | ✓ | 1.12 −0.05 |
| 猛虎扑食 | `mv_huzhaojuehushou_pushi` | 3 | `aoe_dash n3` · 1–3 | 1.20 | 8% | 2 | 1000 | — | ✓ | 1.29 −0.10 |
| 分筋断脉 | `mv_huzhaojuehushou_fenjin` | 5 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_fengjingmai`（参数取目标主手类别）·承·60%·2 | ✓ | 1.29 −0.09 |
| 绝户一爪（绝招） | `mv_huzhaojuehushou_juehu` | 7 | `aoe_single` · 1 | 2.80 | 9% | — | 1200 | `bf_nanyu`·承·100%·3；`bf_neishang`·承·100%·4（2 层） | ✓ | 3.0 −0.10 −0.10 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 虎威 | `ps_huzhaojuehushou_huwei` | 1 | stat · Z3 | +5% → +12% | 对气血 < 50% 的目标 |
| 扣腕夺兵 | `ps_huzhaojuehushou_kouwan` | 4 | trigger | 10% | 命中持兵器目标时施加 `bf_jiaoxie` |
| 拿穴 | `ps_huzhaojuehushou_naxue` | 8 | trigger | 10% → 20% | 命中时施加 `bf_fengxue` 1 回合 |
| 虎爪大成 | `ps_huzhaojuehushou_dacheng` | 10 | mechanic | — | 对身带 `bf_fengjingmai` 的目标，本武学招式不可被招架 |

#### `sk_wujixuangongquan` 无极玄功拳（7 地下 · 拳脚/拳掌 · 武当·书剑）

> **原著**：书剑中张召重所使武当拳法（与红花会群雄交手时所用；招名与细节待考）。招式名为原创扩展；"火手判官"为张召重绰号。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.55/0.45 |
| 原生书界 | 书剑、笑傲★、侠客★ |
| reqs | `attrs {str 40, con 40, wis 40}`；`aptitude {apFist 45}`；`sect {sect_wudang, rank 3}`；`prereq [sk_mianzhang ≥ 5]`；`hard [prereq]` |
| layerStats | `{crit [1, 5], pierce [2, 10]}`（15） |
| 层数要点 | 1 重无极起手、玄功贯拳、"刚柔"；3 重连环三拳；5 重震山、"连击"；**7 重绝招火手判官**；10 重"大成" |
| 获取 | ① `master`：书剑武当长辈（职级 3，陆菲青不传此拳；马真一系，待考），maxLayer 10；② `manual`：击败张召重得其拳谱 `it_miji_wujixuangongquan`（原创扩展），maxLayer 8；③ 投靠清廷线：张召重 `npc_zhangzhaozhong` 亲授（品德下降，原创扩展，占位 `q_12_faction_89`），maxLayer 10 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 无极起手（原创扩展命名） | `mv_wujixuangongquan_qishou` | 1 | `aoe_single` · 1 | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 玄功贯拳 | `mv_wujixuangongquan_guanquan` | 1 | `aoe_single` · 1 | 1.15 | 8% | 1 | 1000 | `bf_neishang`·承·30%·4 | ✓ | 1.17 −0.03 |
| 连环三拳 | `mv_wujixuangongquan_lianhuan` | 3 | `aoe_single` · 1（3 段） | 1.30 | 8% | 2 | 1000 | — | ✓ | 1.29 |
| 震山 | `mv_wujixuangongquan_zhenshan` | 5 | `aoe_cone n2` | 0.90 | 8% | 2 | 1000 | 击退 1 | ✓ | 0.75 × 1.29 = 0.97，−0.05 |
| 火手判官（绝招，取张召重绰号） | `mv_wujixuangongquan_huoshou` | 7 | `aoe_single` · 1 | 2.90 | 9% | — | 1200 | `bf_zhuoshao`·承·100%·2 | ✓ | 3.0 −0.10 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 刚柔 | `ps_wujixuangongquan_gangrou` | 1 | stat · Z2 | 5% → 12% | 本武学内劲部分无视内防 |
| 连击 | `ps_wujixuangongquan_lianji` | 5 | stat · 属性层 | `attr:combo pp +5` | |
| 大成 | `ps_wujixuangongquan_dacheng` | 10 | stat · Z6 | `attr:critDmg pp +15` | 仅本武学 |

#### `sk_rouyunjian` 柔云剑术（7 地下 · 兵器/剑 · 武当·书剑）

> **原著**：书剑中陆菲青所传武当剑法，李沅芷习之（张召重是否亦使此剑待考）。招式名为原创扩展（取"云"字诗意）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.60/0.40 |
| 原生书界 | 书剑、笑傲★、侠客★、飞狐★ |
| weaponReq | `{category: sword}` |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apSword 45}`；`sect {sect_wudang, rank 2}`（陆菲青羁绊线免）；`prereq [sk_zhenwujian ≥ 5]`；`hard [prereq]` |
| layerStats | `{parry [2, 8], hit [1, 7]}`（15） |
| 层数要点 | 1 重流云、云出无心、"以柔克刚"；3 重缠云；5 重云深不知处、"绵绵"；**7 重绝招柔云万里**；10 重"柔云大成" |
| 获取 | `master`：陆菲青 `npc_lufeiqing`（书剑，羁绊 ≥ 3 或武当职级 2，占位 `q_12_bond_90`），maxLayer 10；李沅芷 `npc_liyuanzhi` 转授，maxLayer 7；笑傲★/侠客★/飞狐★武当拜师，maxLayer 9 |
| setTags · conflicts | `[set_shujian_mianlizhen]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 流云 | `mv_rouyunjian_liuyun` | 1 | `aoe_single` · 1 | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 云出无心（取陶渊明"云无心以出岫"） | `mv_rouyunjian_chuxiu` | 1 | `aoe_line n2` | 0.95 | 7% | 1 | 1000 | — | ✓ | 0.85 × 1.12 |
| 缠云 | `mv_rouyunjian_chanyun` | 3 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_chanrao`·承·40%·2 | ✓ | 1.29 −0.08 |
| 云深不知处（取贾岛诗） | `mv_rouyunjian_yunshen` | 5 | `aoe_behind r2` | 1.00 | 8% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ | 0.90 × 1.29 = 1.16，−0.15 |
| 柔云万里（绝招） | `mv_rouyunjian_wanli` | 7 | `aoe_cone n3` | 1.90 | 9% | — | 1200 | `bf_chizhi`·承·50%·2 | ✓ | 3.0 × 0.65 = 1.95，−0.05 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 以柔克刚 | `ps_rouyunjian_rougang` | 1 | stat · Z3 | +5% → +12% | 对主手为刀、棍杖、枪的目标 |
| 绵绵 | `ps_rouyunjian_mianmian` | 5 | stat · 属性层 | `attr:combo pp +5` | |
| 柔云大成 | `ps_rouyunjian_dacheng` | 10 | trigger | 30% | 本武学招式被招架时追加一击 ×0.5（`followup`） |

#### `sk_shenmen13` 神门十三剑（7 地下 · 兵器/剑 · 武当）

> **原著**：张三丰所创剑法，十三招皆刺敌手腕"神门穴"（倚天；使用者与回目待考）。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.70/0.30 |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★ |
| reqs | `attrs {agi 40, wis 40}`；`aptitude {apSword 45}`；`sect {sect_wudang, rank 3}`；`prereq [sk_zhenwujian ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{hit [2, 8], crit [1, 7]}`（15） |
| 层数要点 | 1 重刺神门、连刺、"神门"；3 重封腕；5 重夺兵、"十三式"；**7 重绝招十三剑连环**；10 重"大成" |
| 获取 | `master`：武当（职级 3），maxLayer 10；`manual` `it_miji_shenmen13`，maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 刺神门 | `mv_shenmen13_cixue` | 1 | `aoe_single` · 1 | 0.95 | 7% | 0 | 1000 | `bf_jiaoxie`·承·10%（仅持兵器目标） | ✓ | 1 −0.025 |
| 连刺 | `mv_shenmen13_lianci` | 1 | `aoe_single` · 1（2 段） | 1.10 | 7% | 1 | 1000 | — | ✓ | 1.12 |
| 封腕 | `mv_shenmen13_fengwan` | 3 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_fengjingmai`（参数 weapon）·承·50%·2 | ✓ | 1.29 −0.075 |
| 夺兵 | `mv_shenmen13_duobing` | 5 | `aoe_single` · 1 | 1.35 | 8% | 2 | 1000 | 条件：目标持兵器；`bf_jiaoxie`·承·40% | ✓ | 1.44 −0.10 |
| 十三剑连环（绝招，原创扩展命名） | `mv_shenmen13_shisan` | 7 | `aoe_single` · 1（13 段） | 2.85 | 9% | — | 1200 | `bf_jiaoxie`·承·60% | ✓ | 3.0 −0.15 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 神门 | `ps_shenmen13_shenmen` | 1 | stat · 属性层 | `attr:hit flat +4 → +10` | 对持兵器目标 |
| 十三式 | `ps_shenmen13_shisan` | 5 | stat · Z3 | +15% | 对已被缴械（`bf_jiaoxie`）的目标 |
| 大成 | `ps_shenmen13_dacheng` | 10 | effect | +10% | 本武学施加 `bf_jiaoxie` 的概率 +10% |

#### `sk_yitiantulonggong` 倚天屠龙功（8 地中 · 兵器/奇门（判官笔 · 钩）· 武当·张三丰 → 张翠山）

> **原著**：俞岱岩重伤后，张三丰夜间以"武林至尊，宝刀屠龙，号令天下，莫敢不从。倚天不出，谁与争锋"二十四字创出一路书法武功，张翠山在旁看得入神而得其传；后张翠山于王盘山岛以银钩铁划在石壁上书此二十四字，震慑群豪（倚天前数回；张翠山兵刃"烂银虎头钩""镔铁判官笔"之名待考）。招式按二十四字分六句（原创扩展结构）。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.55/0.45 |
| 原生书界 | 倚天 |
| weaponReq | `{category: exotic, kinds: [brush, hook]}`；副手持另一件（钩 / 笔）时 1 重被动生效（双兵，design/10） |
| reqs | `attrs {wis 45, str 40}`；`aptitude {apExotic 45}`；`sect {sect_wudang, rank 3}`（张翠山羁绊线免）；`hard [sect]`；书画技艺 `art ≥ 40` 为建议门槛（05 `Reqs` 暂无技艺字段，§10 D-4） |
| layerStats | `{crit [2, 7], hit [2, 8]}`（15） |
| 层数要点 | 1 重武林至尊、宝刀屠龙、"银钩铁划"；2 重号令天下；4 重莫敢不从、"书法入武"；5 重倚天不出；**7 重绝招谁与争锋**、"题壁"；10 重"大成" |
| 获取 | ① `master`：张翠山 `npc_zhangcuishan`（倚天前段在世时，羁绊 ≥ 3，占位 `q_04_bond_91`；锚点事件后窗口关闭），maxLayer 10；② `puzzle`：王盘山岛石壁拓字（`art ≥ 40`，占位 `q_04_qiyu_92`），maxLayer 8；③ `master`：张三丰（武当职级 3），maxLayer 10 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 武林至尊 | `mv_yitiantulonggong_wulin` | 1 | `aoe_single` · 1（4 段） | 1.00 | 7% | 0 | 1000 | — | ✓ | 基准 |
| 宝刀屠龙 | `mv_yitiantulonggong_tulong` | 1 | `aoe_single` · 1 | 1.10 | 8% | 1 | 1000 | `bf_pojia`·承·50%·2 | ✓ | 1.17 −0.05 |
| 号令天下 | `mv_yitiantulonggong_haoling` | 2 | `aoe_cone n2` | 0.95 | 8% | 2 | 1000 | `bf_zhenshe`·承·30%·1 | ✓ | 0.75 × 1.29 = 0.97，−0.03 |
| 莫敢不从 | `mv_yitiantulonggong_mogan` | 4 | `aoe_single` · 1 | 1.20 | 8% | 2 | 1000 | `bf_kongju`·承·30%·1 | ✓ | 1.29 −0.075 |
| 倚天不出 | `mv_yitiantulonggong_yitian` | 5 | `aoe_self`（架势） | 0 | 7% | 3 | 850 | `bf_shoushi`·承·100%·2；被近战攻击以 1.0 倍反击 | — | 架势 |
| 谁与争锋（绝招，二十四字一气呵成） | `mv_yitiantulonggong_zhengfeng` | 7 | `aoe_line n4` | 2.20 | 9% | — | 1200 | `bf_zhenshe`·承·50%·1 | ✓ | 3.0 × 0.75 = 2.25，−0.05 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 银钩铁划 | `ps_yitiantulonggong_yingou` | 1 | stat · Z3 | +5% → +12% | 主手钩 / 笔、副手持另一件时 |
| 书法入武 | `ps_yitiantulonggong_shufa` | 4 | stat · 属性层 | 每 10 点 `art` → `crit flat +1`（上限 +10） | 书画技艺入武 |
| 题壁 | `ps_yitiantulonggong_tibi` | 7 | mechanic | — | 近身招式可借相邻墙体 / 崖壁跃击高处目标（高差 ≤ `jump + 2`），不受低打高惩罚（致敬王盘山石壁书字） |
| 大成 | `ps_yitiantulonggong_dacheng` | 10 | effect | +10% | 本武学附带心神类效果（震慑、恐惧）的概率 +10% |

#### `sk_tiyunzong` 梯云纵（8 地中 · 轻功 · 武当）

> **原著**：武当轻功，身子拔起后可凌空借势再纵（倚天；张翠山于王盘山岛腾身上石壁书字等情节细节待考）。招式名为原创扩展。按 05 §14.6 #7，笑傲 / 侠客 / 书剑 / 飞狐本书界最高原生轻功为地中，本功即其一。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.80/0.20 |
| 原生书界 | 倚天、笑傲★、侠客★、书剑★、飞狐★ |
| 轻功数值 | `Q_skill = QS(8) = 104`（10 重） |
| reqs | `attrs {agi 45, wis 40}`；`aptitude {apLight 40}`；`sect {sect_wudang, rank 2}`；`prereq [sk_wudangyunbu ≥ 5]`；`hard [sect, prereq]` |
| 层数要点 | 1 重拔身、"凌空"；3 重梯云；4 重"借劲再纵"；5 重纵跃击；**7 重绝招扶摇直上**；8 重"居高"；10 重"大成" |
| 获取 | `master`：武当（职级 2），maxLayer 10 |
| setTags · conflicts | `[set_wudang_taiji, set_shujian_mianlizhen]`；无 |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 拔身（原创扩展命名） | `mv_tiyunzong_bashen` | 1 | `aoe_self` | 0 | 5% | 2 | 800 | `bf_tengyue`·承·100%·3；本次行动移动力 +1 | — | 功能 |
| 梯云 | `mv_tiyunzong_tiyun` | 3 | `aoe_self`（跃至 4 格内落点，越过单位） | 0 | 6% | 3 | 800 | 落点高差 ≤ `jump + 3` | — | 位移 |
| 纵跃击 | `mv_tiyunzong_zongyue` | 5 | `aoe_leap` · 1–3 | 1.05 | 8% | 2 | 1000 | — | ✓ | 0.90 × 1.29 = 1.16，−0.10 |
| 扶摇直上（绝招，取《逍遥游》） | `mv_tiyunzong_fuyao` | 7 | `aoe_self` | 0 | 9% | — | 1000 | `bf_shenqing`·承·100%·3；`bf_piaohu`·承·100%·3；本次行动额外移动 4 格（可越障） | — | 功能 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 凌空 | `ps_tiyunzong_lingkong` | 1 | stat · 属性层 | `attr:jump flat +1`（7 重起 +2） | |
| 借劲再纵 | `ps_tiyunzong_jiejin` | 4 | mechanic | −25% | 探索攀崖 / 跨沟体力 −25%；战斗中跃上高差不额外耗移动力（08） |
| 居高 | `ps_tiyunzong_jugao` | 8 | stat · 属性层 | `attr:eva pct +8%` | 所在格高于目标 ≥ 2 级时 |
| 大成 | `ps_tiyunzong_dacheng` | 10 | stat · 属性层 | `attr:mov flat +1` | |

#### `sk_zhenwuqijie` 真武七截阵（8 地中 · 杂学/阵法（合击）· 武当）

> **原著**：张三丰观龟蛇二山之势，为七名弟子创真武七截阵，七人合使威力倍增（倚天；阵法原理与实战场景待考）。与天罡北斗阵同受"上场 ≤ 6"约束，改编见 special（原创扩展），流程以 design/09 §6.8 定稿为准。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阳 · 0.55/0.45 |
| 原生书界 | 倚天、笑傲★、侠客★ |
| reqs | `attrs {wis 40, wil 40}`；`sect {sect_wudang, rank 3}`；`prereq [任一武当拳脚或兵器武学 ≥ 5]`；`hard [sect, prereq]`；阵法强度用技艺 `formation` |
| layerStats | `{parry [2, 7], resCC [2, 8]}`（15；仅阵中） |
| 层数要点 | 1 重结阵、龟蛇合击、"倍增"；4 重玄龟守；5 重灵蛇进、"龟蛇相济"；**7 重绝招七截归真**；10 重"真武坐镇" |
| 获取 | 武当门派任务链"真武七截"（倚天，原创扩展，占位 `q_04_faction_93`），maxLayer 10；`combo` 合击领悟（与 ≥ 3 名武当同门合击 5 次）；笑傲★、侠客★武当长老传授，maxLayer 8 |
| setTags · conflicts | `[set_wudang_zhenwu]`；无 |
| special | `formation`：成阵 ≥ 3（阵员每增 1 人倍增一级）；阵中光环：阵员常驻 `bf_zhuiji`，相邻阵员互得 `bf_yuanhu`；10 重阵主计 2 人；`fusible: false`；计入 05 §14.6"地阶合击类 ≤ 3%" |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 结阵 | `mv_zhenwuqijie_jiezhen` | 1 | `aoe_allies r3` | 0 | 6% | 5 | 900 | 成阵 3 回合 | — | 功能 |
| 龟蛇合击 | `mv_zhenwuqijie_guishe` | 1 | `aoe_single` · 1 | 1.25 | 7% | 1 | 1000 | 条件：目标与 ≥ 2 名阵员相邻；`bf_suoding`·承·50%·2 | ✓ | 1 +0.12 +0.15 −0.025 |
| 玄龟守（原创扩展命名） | `mv_zhenwuqijie_guishou` | 4 | `aoe_self`（架势） | 0 | 7% | 3 | 800 | 自身 `bf_shoushi`·承·100%·2；全体阵员 `bf_yuanhu`·承·100%·2 | — | 架势 |
| 灵蛇进（原创扩展命名） | `mv_zhenwuqijie_shejin` | 5 | `aoe_dash n3`（`through`） | 0.95 | 8% | 2 | 1000 | 穿过并伤及路径上全部敌人 | ✓ | 0.80 × 1.29 = 1.03，−0.10 |
| 七截归真（绝招，原创扩展命名） | `mv_zhenwuqijie_guizhen` | 7 | `aoe_single` · 1–2 | 2.70 | 9% | — | 1200 | 距目标 ≤ 2 的其余阵员各追加一击（基础招式 ×0.4，`followup`） | ✓ | 3.0 −0.30（阵员追击价值） |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 倍增 | `ps_zhenwuqijie_beizeng` | 1 | stat · Z3 | 每名阵员 +3% → +5%（按阵员数 − 1 计，上限 25%） | 仅阵中 |
| 龟蛇相济 | `ps_zhenwuqijie_xiangji` | 5 | trigger | ×0.6 | 阵员被攻击后相邻阵员以基础招式 ×0.6 反击（每阵每回合 1 次） |
| 真武坐镇 | `ps_zhenwuqijie_zuozhen` | 10 | mechanic | — | 阵主计为 2 名阵员 |

### 5.5 玄阶 · 黄阶（紧凑表）

**`sk_taihegong` 太和功**（2 黄中 · 内功 · 调和 · 原创扩展；武当山古称太和山）
- 内功贡献：`mpMaxPct 8, hpMaxPct 5, attrs {wil 2, con 1}, mpRegen 1.0`（IP 24）；`stats {effRes 3, resInjury 3}`；无招式。
- reqs：`sect {sect_wudang, rank 0}`；`hard [sect]`。获取：武当拜师；连城★ / 鸳鸯★游方武当道人 `npc_wudang_youfang`（maxLayer 8）。
- 被动：`ps_taihegong_taihe` 太和（1 重，运功调息回内 +5% → +10%）；`ps_taihegong_chonghe` 冲和（5 重，阴阳相冲的"内息相冲"判定概率 −50%，05 §5.4）；`ps_taihegong_yuanman` 圆满（10 重，两仪心法软门槛 −10）。

**`sk_liangyixinfa` 两仪心法**（5 玄中 · 内功 · 调和 · 原创扩展；取"太极生两仪"）
- 内功贡献：`mpMaxPct 17, hpMaxPct 10, attrs {wil 3, wis 2, con 2}, mpRegen 1.5`（IP 48.5）；`stats {parry 5, effRes 5}`。
- reqs：`attrs {wil 25}`；`aptitude {apInner 25}`；`sect {sect_wudang, rank 1}`；`prereq [sk_taihegong ≥ 4]`；`hard [sect]`。获取：拜师；秘籍 `it_miji_liangyixinfa`（maxLayer 8）。`setTags: [set_wudang_taiji]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 两仪化劲 | `mv_liangyixinfa_huajin` | 3 | `aoe_self` | 0 | 6% | 3 | 800 | `bf_xieli`·承·100%·2 | — |

- 被动：`ps_liangyixinfa_xiangsheng` 两仪相生（1 重，主运时阳招、阴招相性各 +2%，Z5）；`ps_liangyixinfa_yuanzhuan` 化圆（5 重，招架成功时 20% 获得 `bf_yuanzhuan` 1 回合）；`ps_liangyixinfa_yuanman` 圆满（10 重，太极拳、太极剑修炼 +10%）。

**`sk_wudangchangquan` 武当长拳**（1 黄下 · 拳脚/拳掌 · 阳 · 0.85/0.15 · 原著）
- 原著：武当入门拳法（倚天，张无忌幼时所学之说，出处待考）；招式名为原创扩展。
- reqs：`sect {sect_wudang, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 冲拳 | `mv_wudangchangquan_chongquan` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 穿掌劈拳 | `mv_wudangchangquan_piquan` | 4 | `aoe_line n2` | 0.95 | 5% | 1 | 1000 | — | ✓ |
| 翻身劈 | `mv_wudangchangquan_fanshen` | 7 | `aoe_single` · 1 | 1.25 | 5% | 2 | 1000 | — | ✓ |

- 核算：穿掌劈拳 0.85 × 1.12；翻身劈 1 + 0.24。被动：`ps_wudangchangquan_quanjia` 拳架（5 重，`attr:resCC pp +5`）；`ps_wudangchangquan_yuanman` 入门圆满（10 重，首次练满拳掌资质永久 +1——全游戏一次，与 05 罗汉拳同类奖励不叠加；武当拳脚软门槛 −10）。

**`sk_mianzhang` 绵掌**（5 玄中 · 拳脚/拳掌 · 调和 · 0.45/0.55 · 原著（细节待考））
- 原著：武当绵掌之名（倚天武当弟子所使，细节待考）；书剑陆菲青号"绵里针"，与其绵掌、芙蓉金针相应之说待考。05 §9.2 已定：与铁砂掌刚柔相冲。
- reqs：`attrs {con 25}`；`aptitude {apFist 25}`；`sect {sect_wudang, rank 1}`；`prereq [sk_wudangchangquan ≥ 4]`；`hard [sect]`。layerStats `{defIn [1, 5], parry [1, 5]}`。获取：拜师；书剑陆菲青；连城★ / 鸳鸯★。`setTags: [set_shujian_mianlizhen, set_wudang_taiji]`；`conflicts: {with: sk_tieshazhang, type: clash}`（双方招式 −10%，05 §9.2）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绵里藏针 | `mv_mianzhang_mianli` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | `bf_neishang`·承·20%·4 | ✓ |
| 连绵 | `mv_mianzhang_lianmian` | 3 | `aoe_single` · 1（3 段） | 1.15 | 7% | 1 | 1000 | — | ✓ |
| 柔掌卸劲 | `mv_mianzhang_xiejin` | 5 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击以 0.9 倍反击并施加 `bf_waigong_jiang` 1 回合 | — |
| 绵绵不绝 | `mv_mianzhang_mianmian` | 7 | `aoe_single` · 1 | 1.15 | 7% | 2 | 1000 | `bf_neishang`·承·70%·4（2 层） | ✓ |

- 核算：绵里藏针 1 − 0.02；连绵 1.17；绵绵不绝 1.29 − 0.14。被动：`ps_mianzhang_mianjin` 绵劲（4 重，本武学内劲部分无视内防 4% → 10%，Z2）；`ps_mianzhang_anjin` 暗劲（8 重，对带 `injury` 标签目标 Z3 +8%）；`ps_mianzhang_dacheng` 大成（10 重，`attr:combo pp +5`）。

**`sk_wudangjiemaishou` 武当截脉手**（5 玄中 · 拳脚/指法 · 阳 · 0.40/0.60 · 原创扩展）
- 依据：武当点穴截脉之术（原创扩展命名）；06 §8.7 封内力、封轻功条目中"点气海穴""点环跳穴"两个原创招名即出于本武学。
- reqs：`attrs {wis 25}`；`aptitude {apFinger 25}`；`sect {sect_wudang, rank 1}`；`prereq [sk_wudangchangquan ≥ 4]`；`hard [sect]`。layerStats `{seal [2, 6], hit [1, 4]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 截脉 | `mv_wudangjiemaishou_jiemai` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_fengxue`·承·25%·1 | ✓ |
| 点气海 | `mv_wudangjiemaishou_qihai` | 3 | `aoe_single` · 1 | 1.20 | 7% | 2 | 1000 | `bf_fengnei`·承·40%·2 | ✓ |
| 点环跳 | `mv_wudangjiemaishou_huantiao` | 5 | `aoe_single` · 1–2（`ranged` 指风） | 0.95 | 7% | 1 | 1000 | `bf_fengqinggong`·承·50%·2 | ✓ |
| 解穴 | `mv_wudangjiemaishou_jiexue` | 7 | `aoe_single` · 1（友方） | 0 | 5% | 2 | 1000 | 驱散目标全部 `seal` 减益（`acupoint` 解穴，品阶承；06 §7.1） | — |

- 核算：截脉 1 − 0.05；点气海 1.29 − 0.08；点环跳 1.17 × 0.85 = 0.99，−0.05。被动：`ps_wudangjiemaishou_renxue` 认穴（1 重，`attr:seal pp +2 → +6`）；`ps_wudangjiemaishou_jiemai` 截脉（5 重，对被点穴目标 Z3 +8%）；`ps_wudangjiemaishou_dacheng` 大成（10 重，本武学施加的 `bf_fengxue` 持续 +1，上限 2）。

**`sk_taijituishou` 太极推手**（6 玄上 · 拳脚/擒拿 · 调和 · 0.40/0.60 · 原创扩展）
- 依据：太极拳理"以柔克刚、借力打力"（倚天太极拳一节）；"推手""沾连黏随""引进落空"为后世太极拳术语，原创扩展引入作太极拳的中阶练法。
- reqs：`attrs {wis 30}`；`aptitude {apGrapple 30}`；`sect {sect_wudang, rank 2}`；`prereq [sk_mianzhang ≥ 4]`；`hard [sect]`。layerStats `{parry [2, 6], counter [1, 4]}`。`setTags: [set_wudang_taiji]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 沾粘 | `mv_taijituishou_zhan` | 1 | `aoe_single` · 1 | 0.95 | 6% | 0 | 1000 | `bf_chizhi`·承·40%·2 | ✓ |
| 引进落空 | `mv_taijituishou_yinjin` | 3 | `aoe_self`（架势） | 0 | 5% | 2 | 850 | 被近战攻击：攻击者 `bf_shiheng`·承·100%·1，并以 0.8 倍反击 | — |
| 推 | `mv_taijituishou_tui` | 5 | `aoe_knock n2` | 0.95 | 6% | 1 | 1000 | 击退 2 | ✓ |
| 化劲摔 | `mv_taijituishou_shuai` | 7 | `aoe_swap` · 1 | 0.85 | 6% | 2 | 1000 | 与目标换位；`bf_shiheng`·承·50%·1 | ✓ |

- 核算：沾粘 1 − 0.04；推 0.95 × 1.12 = 1.06，−0.10；化劲摔 0.85 × 1.24 = 1.05，−0.15 −0.05。被动：`ps_taijituishou_zhanlian` 沾连黏随（1 重，`attr:parry pct +2% → +6%`）；`ps_taijituishou_luokong` 落空（5 重，招架成功时 30% 使攻击者获得 `bf_waigong_jiang` 1 回合）；`ps_taijituishou_yuanman` 圆满（10 重，太极拳软门槛 −10、修炼 +10%）。

**`sk_zhenwujian` 真武剑法**（3 黄上 · 兵器/剑 · 阳 · 0.75/0.25 · 原创扩展）
- reqs：`sect {sect_wudang, rank 0}`；`hard [sect]`。layerStats `{parry [1, 3], hit [1, 3]}`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 真武起手 | `mv_zhenwujian_qishou` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 龟蛇盘 | `mv_zhenwujian_guishe` | 4 | `aoe_self`（架势） | 0 | 4% | 2 | 850 | 被近战攻击以 0.8 倍反击 | — |
| 真武荡魔 | `mv_zhenwujian_dangmo` | 7 | `aoe_line n2` | 1.00 | 6% | 1 | 1000 | — | ✓ |

- 核算：真武荡魔 0.85 × 1.17 = 0.99。被动：`ps_zhenwujian_jianshou` 剑守（5 重，`attr:parry pct +3%`）；`ps_zhenwujian_yuanman` 入门圆满（10 重，武当剑法软门槛 −10）。

**`sk_raozhirou` 绕指柔剑**（6 玄上 · 兵器/剑 · 阴 · 0.45/0.55 · 原著（细节待考））
- 原著：武当剑法，取"百炼钢化为绕指柔"之意，以内力运剑、剑刃弯转绕过招架（倚天；使用者与回目待考）。
- reqs：`attrs {agi 30}`；`aptitude {apSword 30, apInner 25}`；`sect {sect_wudang, rank 2}`；`prereq [sk_zhenwujian ≥ 5]`；`hard [sect]`。layerStats `{hit [1, 5], pierce [1, 5]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 绕指 | `mv_raozhirou_raozhi` | 1 | `aoe_single` · 1 | 0.95 | 6% | 1 | 1000 | — | ✗ |
| 百炼 | `mv_raozhirou_bailian` | 3 | `aoe_single` · 1（2 段） | 1.15 | 7% | 1 | 1000 | — | ✓ |
| 绕背刺 | `mv_raozhirou_raobei` | 5 | `aoe_behind r1` | 1.00 | 7% | 2 | 1000 | 绕背出招（背击 Z7） | ✓ |
| 化刚为柔 | `mv_raozhirou_huagang` | 7 | `aoe_self`（架势） | 0 | 6% | 3 | 850 | `bf_yuanzhuan`·承·100%·2；被近战攻击以 0.8 倍反击 | — |

- 核算：绕指 1.12 × 0.85 = 0.95；百炼 1.17；绕背刺 0.90 × 1.29 = 1.16，−0.15。被动：`ps_raozhirou_rou` 柔剑（1 重，对处于守势 `stance.def` 的目标 Z3 +5% → +10%）；`ps_raozhirou_tongyi` 同意（5 重，与软剑意同时装配时 `attr:combo pp +5`，相生）；`ps_raozhirou_dacheng` 大成（10 重，本武学招式被招架时招架减免 −50%，Z9）。

**`sk_wudangyunbu` 武当云步**（3 黄上 · 轻功 · 阳 · 原创扩展）——`Q_skill = QS(3) = 45` 满层。
- reqs：`sect {sect_wudang, rank 0}`；`hard [sect]`。获取：拜师；连城★ / 鸳鸯★。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 云步 | `mv_wudangyunbu_yunbu` | 1 | `aoe_self` | 0 | 4% | 3 | 800 | `bf_piaohu`·承·100%·2；本次行动移动力 +1 | — |

- 被动：`ps_wudangyunbu_qingling` 轻灵（4 重，`attr:eva pct +2% → +4%`）；`ps_wudangyunbu_yuanman` 圆满（10 重，梯云纵软门槛 −10）。

**`sk_furongjinzhen` 芙蓉金针**（6 玄上 · 暗器 · 阳 · 0.70/0.30 · 原著）
- 原著：陆菲青独门暗器，李沅芷亦得传（书剑；针形与细节待考）。弹药 `it_furongjinzhen`（建议 ID）。预算按 §3.4 暗器约定。
- reqs：`aptitude {apHidden 30}`；`sect {sect_wudang, rank 1}`（陆菲青羁绊线免）；`hard []`。layerStats `{hit [1, 5], seal [1, 5]}`。获取：陆菲青 / 李沅芷传授（书剑），maxLayer 10；飞狐★武当，maxLayer 8。`setTags: [set_shujian_mianlizhen]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 金针 | `mv_furongjinzhen_jinzhen` | 1 | `aoe_bolt` · 1–5 | 0.75 | 6% | 0 | 1000 | `bf_fengxue`·承·15%·1 | ✗ |
| 芙蓉满枝 | `mv_furongjinzhen_manzhi` | 3 | `aoe_multi n4 r1` · 1–4 | 0.85 | 7% | 2 | 1000 | — | ✗ |
| 打穴金针 | `mv_furongjinzhen_daxue` | 5 | `aoe_bolt` · 1–4 | 0.90 | 7% | 2 | 1000 | `bf_fengxue`·承·50%·1 | ✗ |
| 绵里藏针（原创扩展，呼应"绵里针"） | `mv_furongjinzhen_mianli` | 7 | `aoe_single` · 1（近身，掌中藏针） | 1.40 | 7% | 2 | 1000 | 条件：装配绵掌；`bf_fengxue`·承·30%·1 | ✓ |

- 核算：金针 0.78 − 0.03；芙蓉满枝 0.85 × 1.29 × 0.78 = 0.86；打穴金针 1.29 × 0.78 = 1.01，−0.10；绵里藏针（近身、可招架）1 + 0.24 + 0.05 + 0.15 − 0.06 = 1.38。被动：`ps_furongjinzhen_renxue` 认穴（1 重，`attr:seal pp +2`）；`ps_furongjinzhen_zhenxue` 针穴（5 重，对被点穴目标本武学 Z3 +8%）；`ps_furongjinzhen_dacheng` 大成（10 重，本武学耗内 −10%）。

### 5.6 进阶链与跨书界说明

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 玄 → 地） | 太和功（黄中）→ 4 重 → 两仪心法（玄中）→ 5 重 → 纯阳无极功（地中）；太和功 7 重亦可直入 |
| 剑（黄 → 玄 / 地） | 真武剑法（黄上）→ 5 重 → 绕指柔剑（玄上）/ 柔云剑术（地下）/ 神门十三剑（地下）；太极剑（天中）张三丰直传 |
| 拳脚 | 武当长拳（黄下）→ 4 重 → 绵掌 / 截脉手（玄中）；绵掌 4 重 → 太极推手（玄上）；绵掌 5 重 → 无极玄功拳（地下）；武当长拳 6 重 → 虎爪绝户手（地下）；太极拳（天中）张三丰直传（推手圆满降软门槛） |
| 轻功 | 武当云步（黄上）→ 5 重 → 梯云纵（地中） |

- **全池与衰减**：倚天是武当唯一的"全池"书界；笑傲、侠客尚有 15–16 门（多为★延续），书剑 14 门（张召重、陆菲青一代），飞狐只余 10 门入门—中坚——武当池随时代收窄，与"武林衰败"曲线一致（基准 §2）。
- **太极残承**：太极拳、太极剑在笑傲为 `partial`、`lineageGrade 10`（02 §5.7、E9）：携带者经冲虚道长印证可恢复到天下；侠客、书剑、飞狐无再遇。
- **中武装配示例（书剑，2/2/2 携带）**：携带太极拳、太极剑（外来压制后 11 → 9 地上）与主运内功各 1 门；本土补齐纯阳无极功、无极玄功拳、柔云剑术；本土再学梯云纵、芙蓉金针。
- **低武★补位（连城 / 鸳鸯）**：太和功、武当长拳、绵掌、真武剑法、武当云步 5 门（黄下—玄中），只作 1/1/1 携带后的补位；须 chapters/09、11 采纳。

---

## 6. 绝情谷 `sect_jueqinggu`

### 6.1 门派简介

- **神雕（1237–1259）**：谷主公孙止，家传武学以刀剑互易的阴阳倒乱刃法与闭穴功见长；谷中遍生情花，中刺者动情则痛，唯绝情丹可解（原著）。公孙止之妻裘千尺（铁掌帮裘千仞之妹）被其挑断手足筋脉、囚于谷底石窟，以口喷枣核钉为武；女儿公孙绿萼为救杨过而死；大弟子樊一翁以长须、钢杖对敌；谷中弟子以渔网围捕闯谷之人。终局公孙止与裘千尺同坠深渊；十六年后杨过、小龙女于谷底重逢（原著；情节细节待考）。
- **谷规**：谷中人断绝情欲、茹素不饮之说待考；本作以"绝情"为谷中入门心法的主题（原创扩展）。
- **强弱**：人少，谷主一人独强（具名 Boss，地中—地上）；弟子多为玄阶，以渔网阵取胜。
- **情花**：情花毒 `bf_qinghuadu`（06 §8.5，品阶 8–9）由情花丛地形或情花刺物品施加（design/08、10），不由本组武学直接施加；解法绝情丹 `it_jueqingdan`、断肠草 `it_duanchangcao`（06 §4.6 `rx_yiduigongdu`）。

### 6.2 武学总表（8 门）

| ID | 名称 | 大类/子类 | 品阶 | 内力性质 | wOut/wIn | 原生书界 | 获取方式 | 出处 |
|---|---|---|---|---|---|---|---|---|
| `sk_jueqingxinjue` | 绝情心诀 | 内功/心法 | 3 黄上 | 阴 | 0/1 | 神雕 | 拜师（职级 0） | 原创扩展 |
| `sk_bixuegong` | 闭穴功 | 内功/心法 | 7 地下 | 阴 | 0/1 | 神雕 | 公孙止传授（职级 3）；裘千尺口授（原创扩展） | 原著 |
| `sk_zhezhishou` | 折枝手 | 拳脚/擒拿 | 1 黄下 | 阴 | 0.80/0.20 | 神雕 | 拜师（职级 0） | 原创扩展 |
| `sk_jueqingjian` | 绝情剑法 | 兵器/剑 | 3 黄上 | 阴 | 0.70/0.30 | 神雕 | 拜师（职级 0） | 原创扩展 |
| `sk_changxuzhang` | 长须杖法 | 兵器/棍杖 | 5 玄中 | 阳 | 0.80/0.20 | 神雕 | 樊一翁传授（职级 1） | 原创扩展命名（原著樊一翁须杖对敌） |
| `sk_yinyangdaoluan` | 阴阳倒乱刃法 | 兵器/刀（刀剑互易） | 8 地中 | 调和 | 0.65/0.35 | 神雕 | 公孙止传授（职级 3）；剑室奇遇 | 原著 |
| `sk_zaoheding` | 枣核钉 | 暗器 | 6 玄上 | 阴 | 0.60/0.40 | 神雕 | 裘千尺传授（谷底石窟线） | 原著 |
| `sk_yuwangzhen` | 渔网阵 | 杂学/阵法（合击） | 5 玄中 | 阳 | 0.60/0.40 | 神雕 | 拜师（职级 1） | 原著 |

### 6.3 地阶条目卡

#### `sk_bixuegong` 闭穴功（7 地下 · 内功 · 绝情谷）

> **原著**：公孙止练有闭穴功，能自行封闭周身穴道，点穴对其无效（神雕；功法来历与破解之法待考）。本作以"罩门"作其代价——闭穴者必有一穴不能闭（原创扩展）。招式为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 阴 · 0/1 |
| 原生书界 | 神雕 |
| reqs | `attrs {wil 40, con 40, wis 40}`；`aptitude {apInner 40}`；`sect {sect_jueqinggu, rank 3}`；`prereq [sk_jueqingxinjue ≥ 5]`；`hard [sect, prereq]` |
| 内功贡献 | `mpMaxPct 24, hpMaxPct 16, attrs {con 4, wil 4, agi 2}, mpRegen 2.4` → IP 72（= 地下预算）；`stats {resSeal 15}`（15） |
| InnerDef | `auxUsableMoves: [mv_bixuegong_chongxue]` |
| 层数要点 | 1 重闭穴、"自闭"；4 重冲穴、"护穴"；**7 重绝招锁元**；8 重"闭穴成"；10 重"大成" |
| 获取 | ① `master`：公孙止 `npc_gongsunzhi`（绝情谷职级 3，占位 `q_03_faction_94`），maxLayer 10；② `master`：裘千尺 `npc_qiuqianchi` 口授（谷底石窟线，原创扩展，占位 `q_03_side_95`），maxLayer 8 |
| setTags · conflicts | `[set_jueqing_gongsun]`；无 |
| special | **代价**：主运时持有 `bf_zhaomen`（罩门，06 §8.9：战斗开始随机设定罩门方位；自该方位或以指法命中时，本击无视持有者全部 `guard` 与外防增益且 Z3 +50%；`lore ≥ 50` 者观察 1 回合可识破）；10 重起罩门方位由玩家战前指定，指法命中不再触发。`fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 闭穴 | `mv_bixuegong_bixue` | 1 | `aoe_self` | 0 | 8% | 4 | 800 | `bf_mian_xue`·承·100%·2（免疫穴道） | — |
| 冲穴 | `mv_bixuegong_chongxue` | 4 | `aoe_self` | 0 | 6% | 3 | 800 | 驱散自身全部 `seal` 减益（冲穴等效，品阶承）；回复 5% 内力 | — |
| 锁元（绝招，原创扩展命名） | `mv_bixuegong_suoyuan` | 7 | `aoe_self` | 0 | 9% | — | 1000 | `bf_mian_xue`·承·100%·3；`bf_mian_kong`·承·100%·1；`bf_hutizhenqi`·承·100%·3（hpMax 15%） | — |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 自闭 | `ps_bixuegong_zibi` | 1 | trigger | 20% → 45% | 被施加 `seal.point`（点穴）时当即自解（等效冲穴，品阶承）；`auxMode: full` |
| 护穴 | `ps_bixuegong_huxue` | 4 | trigger | — | 被点穴后获得 `bf_huxue`（护穴）2 回合 |
| 闭穴成 | `ps_bixuegong_cheng` | 8 | stat · 属性层 | `attr:resSeal pp +10` | `auxMode: scaled` |
| 大成 | `ps_bixuegong_dacheng` | 10 | mechanic | — | 罩门方位战前自定；指法命中不再触发罩门 |

#### `sk_yinyangdaoluan` 阴阳倒乱刃法（8 地中 · 兵器/刀（刀剑互易）· 绝情谷）

> **原著**：公孙止一手金刀、一手黑剑（"锯齿金刀"之名待考），刀走剑路、剑作刀使，阴阳倒乱，令对手无从拆解；杨过、小龙女与之对敌方悟其理（神雕）。公孙止曾将杨过等推入情花丛（原著，细节待考）。招式名为原创扩展。

| 项 | 内容 |
|---|---|
| 性质 · 内外 | 调和 · 0.65/0.35 |
| 原生书界 | 神雕 |
| weaponReq | `{category: blade}` ＋ 副手剑（或主手剑、副手刀，视同）；单持刀或剑可用，但失去 1 重"倒乱"——需 05 §6.2 增补"异类双持" `dualMixed: [blade, sword]`（§10 D-8）；配锯齿金刀 `eq_juchijindao`、黑剑 `eq_heijian`（建议 ID，design/10 定级） |
| reqs | `attrs {agi 45, str 40, wis 45}`；`aptitude {apBlade 45, apSword 40}`；`sect {sect_jueqinggu, rank 3}`；`prereq [sk_jueqingjian ≥ 5]`；`hard [sect, prereq]` |
| layerStats | `{pierce [3, 9], hit [1, 6]}`（15） |
| 层数要点 | 1 重刀剑互易、黑剑穿心、"倒乱"；3 重金刀锯骨；4 重阴阳倒乱、"刀剑换手"；5 重推入情花；**7 重绝招两仪倒转**；8 重"黑剑柔韧"；10 重"大成" |
| 获取 | ① `master`：公孙止（绝情谷职级 3），maxLayer 10；② `qiyu`：绝情谷剑室（原著谷中藏剑之室，君子剑、淑女剑出于此）得刀剑与刀谱残篇（原创扩展，占位 `q_03_qiyu_96`），maxLayer 7 |
| setTags · conflicts | `[set_jueqing_gongsun]`；无（与玉女素心剑法的克制关系见 1 重"倒乱"） |
| special | `fusible: true` |

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 | 核算 |
|---|---|---|---|---|---|---|---|---|---|---|
| 刀剑互易（原创扩展命名） | `mv_yinyangdaoluan_huyi` | 1 | `aoe_single` · 1（刀一剑一 2 段） | 1.00 | 7% | 0 | 1000 | 两段分别按刀 / 剑类别判定招架与破 X | ✓ | 基准 |
| 黑剑穿心 | `mv_yinyangdaoluan_heijian` | 1 | `aoe_pierce` | 1.05 | 8% | 1 | 1000 | — | ✓ | 0.90 × 1.17 |
| 金刀锯骨 | `mv_yinyangdaoluan_jindao` | 3 | `aoe_single` · 1 | 1.15 | 8% | 2 | 1000 | `bf_liuxue`·承·60%·3（2 层） | ✓ | 1.29 −0.12 |
| 阴阳倒乱 | `mv_yinyangdaoluan_daoluan` | 4 | `aoe_single` · 1 | 1.10 | 8% | 2 | 1000 | — | ✗ | 1.29 × 0.85 |
| 推入情花（原创扩展命名） | `mv_yinyangdaoluan_qinghua` | 5 | `aoe_knock n2` | 1.10 | 8% | 2 | 1000 | 击退 2；落点为情花丛地形（design/08，建议 `tr_qinghuacong`）时由地形施加 `bf_qinghuadu` | ✓ | 0.95 × 1.29 = 1.23，−0.10 |
| 两仪倒转（绝招，原创扩展命名） | `mv_yinyangdaoluan_liangyi` | 7 | `aoe_around`（2 段） | 1.90 | 9% | — | 1200 | `bf_shiheng`·承·50%·1 | ✓ | 3.0 × 0.65 = 1.95，−0.05 |

| 被动 | ID | 层 | 类 · 乘区 | 数值 | 说明 |
|---|---|---|---|---|---|
| 倒乱 | `ps_yinyangdaoluan_daoluan` | 1 | mechanic / 判定 | ×0.5；`pierce +4 → +10` | 敌方 `bf_podao`、`bf_pojian` 对本武学的效果 ×0.5（刀剑难辨）；本武学 `attr:pierce flat +4 → +10`；对处于玉女素心剑法合璧状态的目标无效（原著杨、龙合使双剑应对公孙止之意，待考） |
| 刀剑换手 | `ps_yinyangdaoluan_huanshou` | 4 | mechanic / Z3 | +8% | 主副手互换不增加收招（05 §6.4 的 +150 → 0）；换手后下一招 Z3 +8% |
| 黑剑柔韧 | `ps_yinyangdaoluan_rouren` | 8 | trigger | 30% | 本武学招式被招架时 30% 视为未被招架 |
| 大成 | `ps_yinyangdaoluan_dacheng` | 10 | stat · 属性层 | `attr:crit flat +10` | 仅本武学 |

### 6.4 玄阶 · 黄阶（紧凑表）

**`sk_jueqingxinjue` 绝情心诀**（3 黄上 · 内功 · 阴 · 原创扩展）
- 内功贡献：`mpMaxPct 10, hpMaxPct 6, attrs {wil 3, con 1}, mpRegen 1.2`（IP 30）；`stats {resMind 3, resPoison 3}`；无招式。
- reqs：`sect {sect_jueqinggu, rank 0}`；`hard [sect]`。获取：拜师。
- 被动：`ps_jueqingxinjue_jueqing` 绝情（1 重，`bf_mihuo` 对自身持续 −1，最低 1）；`ps_jueqingxinjue_duanqing` 断情（5 重，自身 `bf_qinghuadu` 的"动情"发作伤害 −30%，原创扩展）；`ps_jueqingxinjue_yuanman` 圆满（10 重，闭穴功软门槛 −10）。

**`sk_zhezhishou` 折枝手**（1 黄下 · 拳脚/擒拿 · 阴 · 0.80/0.20 · 原创扩展）
- 依据：谷中遍植情花，花枝有刺，弟子习以折枝避刺之手法（原创扩展）。
- reqs：`sect {sect_jueqinggu, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 折枝 | `mv_zhezhishou_zhezhi` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 拂刺 | `mv_zhezhishou_fuci` | 4 | `aoe_single` · 1 | 1.10 | 5% | 1 | 1000 | `bf_fengjingmai`（参数 unarmed）·承·20%·2 | ✓ |
| 攀枝锁臂 | `mv_zhezhishou_panzhi` | 7 | `aoe_single` · 1 | 1.20 | 5% | 2 | 1000 | `bf_chanrao`·承·30%·2 | ✓ |

- 核算：拂刺 1.12 − 0.03；攀枝锁臂 1.24 − 0.06。被动：`ps_zhezhishou_bici` 避刺（5 重，情花丛地形对自身的伤害与施加率 −50%，08）；`ps_zhezhishou_yuanman` 圆满（10 重，绝情谷拳脚、兵器软门槛 −10）。

**`sk_jueqingjian` 绝情剑法**（3 黄上 · 兵器/剑 · 阴 · 0.70/0.30 · 原创扩展）
- reqs：`sect {sect_jueqinggu, rank 0}`；`hard [sect]`。layerStats `{hit [1, 3], parry [1, 3]}`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 断情 | `mv_jueqingjian_duanqing` | 1 | `aoe_single` · 1 | 1.00 | 5% | 0 | 1000 | — | ✓ |
| 忘忧 | `mv_jueqingjian_wangyou` | 4 | `aoe_sweep` | 0.85 | 5% | 1 | 1000 | — | ✓ |
| 肠断（呼应断肠草） | `mv_jueqingjian_changduan` | 7 | `aoe_single` · 1 | 1.25 | 6% | 2 | 1000 | `bf_nanyu`·承·30%·3 | ✓ |

- 核算：忘忧 0.75 × 1.12；肠断 1.29 − 0.03。被动：`ps_jueqingjian_lengfeng` 冷锋（5 重，本武学 `attr:crit flat +3`）；`ps_jueqingjian_yuanman` 圆满（10 重，阴阳倒乱刃法软门槛 −10）。

**`sk_changxuzhang` 长须杖法**（5 玄中 · 兵器/棍杖 · 阳 · 0.80/0.20 · 原创扩展命名）
- 原著：公孙止大弟子樊一翁身材矮小、长须拖地，以长须作鞭、钢杖为兵（神雕；兵刃细节待考）。
- `weaponReq {category: staff}`。reqs：`attrs {str 25}`；`aptitude {apStaff 25}`；`sect {sect_jueqinggu, rank 1}`；`hard [sect]`。layerStats `{parry [1, 5], resCC [1, 5]}`。获取：樊一翁 `npc_fanyiweng` 传授（maxLayer 10）。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 钢杖 | `mv_changxuzhang_gangzhang` | 1 | `aoe_single` · 1 | 1.00 | 6% | 0 | 1000 | — | ✓ |
| 长须卷 | `mv_changxuzhang_changxu` | 1 | `aoe_pull n1` · 1–2 | 0.90 | 6% | 1 | 1000 | `bf_chanrao`·承·20%·2 | ✓ |
| 横扫千军 | `mv_changxuzhang_hengsao` | 4 | `aoe_sweep` | 0.85 | 7% | 1 | 1000 | 击退 1 | ✓ |
| 须杖齐施 | `mv_changxuzhang_qishi` | 7 | `aoe_single` · 1（2 段） | 1.30 | 7% | 2 | 1000 | — | ✓ |

- 核算：长须卷 0.95 × 1.12 = 1.06，−0.10 −0.04；横扫千军 0.75 × 1.17 = 0.88，−0.05；须杖齐施 1.29。被动：`ps_changxuzhang_changxu` 长须（1 重，本武学射程 2 的招式 `attr:hit flat +5`）；`ps_changxuzhang_lishan` 杖立如山（5 重，`attr:resCC pp +8`）；`ps_changxuzhang_dacheng` 大成（10 重，本武学 Z3 +6%）。

**`sk_zaoheding` 枣核钉**（6 玄上 · 暗器 · 阴 · 0.60/0.40 · 原著）
- 原著：裘千尺手足筋脉被挑断、囚于谷底石窟，以口喷射枣核钉伤人（神雕；伤公孙止之目等细节待考）。本作保留"口喷"——不需双手（原创规则化）。弹药枣核 `it_zaoheding`（建议 ID）。预算按 §3.4 暗器约定。
- reqs：`attrs {wil 30}`；`aptitude {apHidden 30}`；`hard []`。layerStats `{hit [1, 5], crit [1, 5]}`。获取：裘千尺（谷底石窟线，羁绊 ≥ 3，占位 `q_03_side_95`），maxLayer 10。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 喷核 | `mv_zaoheding_penhe` | 1 | `aoe_bolt` · 1–4 | 0.80 | 6% | 0 | 1000 | — | ✗ |
| 打眼 | `mv_zaoheding_dayan` | 3 | `aoe_bolt` · 1–3 | 0.95 | 7% | 2 | 1000 | `bf_shimang`·承·40%·1 | ✗ |
| 连珠核 | `mv_zaoheding_lianzhu` | 5 | `aoe_multi n3 r1` · 1–4 | 0.75 | 7% | 1 | 1000 | — | ✗ |

- 核算：喷核 0.78；打眼 1.29 × 0.78 = 1.01，−0.04；连珠核 0.85 × 1.17 × 0.78 = 0.78。被动：`ps_zaoheding_koupen` 口喷（1 重，本武学不受 `bf_jiaoxie`、`bf_fengjingmai`、`bf_chanrao` 影响，仍受 `bf_fengnei` 影响）；`ps_zaoheding_yuandu` 怨毒（5 重，对气血比例高于自身的目标 Z3 +8%）；`ps_zaoheding_dacheng` 大成（10 重，本武学 `attr:hit flat +8`）。

**`sk_yuwangzhen` 渔网阵**（5 玄中 · 杂学/阵法（合击）· 阳 · 0.60/0.40 · 原著）
- 原著：绝情谷弟子以渔网围捕闯谷之人（神雕，杨过、周伯通等曾遇此阵；网上缀刃等细节待考）。06 §8.7 封轻功的典型来源之一即"渔网"。
- reqs：`sect {sect_jueqinggu, rank 1}`；`hard [sect]`。`special.formation`：成阵 ≥ 2（二人张网）；`fusible: false`。`setTags: [set_jueqing_gongsun]`。

| 招式 | ID | 层 | 范围 · 射程 | 倍率 | 耗内 | 冷却 | 收招 | 附带 | 招架 |
|---|---|---|---|---|---|---|---|---|---|
| 撒网 | `mv_yuwangzhen_sawang` | 1 | `aoe_sq3` · 1–3 | 0.80 | 7% | 3 | 1000 | 条件：另 1 名阵员距目标格 ≤ 3；`bf_chanrao`·承·50%·2；`bf_fengqinggong`·承·50%·2 | ✓ |
| 收网 | `mv_yuwangzhen_shouwang` | 4 | `aoe_pull n1` · 1–3 | 1.25 | 7% | 2 | 1000 | 条件：目标缠绕中 | ✓ |
| 刀网绞杀 | `mv_yuwangzhen_jiaosha` | 7 | `aoe_single` · 1–2 | 1.25 | 7% | 2 | 1000 | 条件：目标缠绕中；`bf_liuxue`·承·100%·3（2 层） | ✓ |

- 核算：撒网 0.60 ×(1+0.36+0.05+0.15)= 0.94，−0.10 −0.05；收网 0.95 ×(1+0.24+0.05+0.15)= 1.37，−0.10；刀网绞杀 1.44 − 0.20。被动：`ps_yuwangzhen_wangmi` 网密（1 重，网中敌人"挣脱"缠绕成功率 −10% → −25%）；`ps_yuwangzhen_zhangwang` 张网（5 重，成阵时阵员获得 `bf_jieji` 2 回合）；`ps_yuwangzhen_dacheng` 大成（10 重，撒网冷却 −1）。

### 6.5 进阶链

| 链 | 前置关系 |
|---|---|
| 内功（黄 → 地） | 绝情心诀（黄上）→ 5 重 → 闭穴功（地下） |
| 刀剑（黄 → 地） | 绝情剑法（黄上）→ 5 重 → 阴阳倒乱刃法（地中）；长须杖法（玄中）独立 |
| 拳脚 | 折枝手（黄下）为谷中唯一拳脚（原著公孙一系以刀剑、闭穴为主） |
| 裘千尺线 | 枣核钉（玄上）；闭穴功口授（maxLayer 8） |

- **推荐装配（神雕中期，绝情谷线）**：主运闭穴功（注意罩门）＋辅运绝情心诀｜折枝手｜阴阳倒乱刃法（主手锯齿金刀、副手黑剑）、长须杖法（换杖时用）｜枣核钉｜渔网阵。

---

## 7. 套装候选（交 design/07 定稿）

> **计件**按 05 §6.5：装配中的武学（辅运内功计件；兵器栏不可用仍计件；外来武学照常计件）＋穿戴中的装备。**档位品阶**建议取"已计件成员有效品阶的中位数（向下取整）"，下表数值按"地中（8）档"标定，由 07 按 06 §3.2 的 ×G 规则缩放。**低武可达成性**按基准 §3：内 / 拳脚 / 兵器各携带 1 门、装备携带 6 件；轻功、暗器、杂学不可携带，须本书界重学。每个套装都放入至少一件装备或一门可携带的核心武学，保证低武书界仍能凑出 2–3 件以上。

| 套装 | ID | 构成件（大阶·类别） | 2 件 | 3 件 | 4 件 | 5 件 | 跨品阶混搭示例 | 低武（1/1/1）可达成性 |
|---|---|---|---|---|---|---|---|---|
| 全真·北斗（ID 沿用 05 §13.6） | `set_quanzhen_beidou` | `sk_xiantiangong`（天·内）、`sk_jinguanyusuo`（地·内）、`sk_quanzhenxinfa`（玄·内）、`sk_quanzhenjian`（玄·剑）、`sk_tongguijian`（地·剑）、`sk_tiangang`（天·杂）、`sk_dabeidouzhen`（玄·杂）、`eq_chongyangdaopao` 重阳道袍（原创扩展，建议地下·衣） | `attr:hit pct +5%`、`attr:parry pct +5%`（属性层） | 全真门派武学招式 Z3 +8% | 阵法成阵人数 −1（最低 3），阵中阵员 Z4 +6%；未装配阵法时改为 `attr:parry pct +5%` | 每场开始获得 `bf_hutizhenqi`（hpMax 8%）；`bf_suoding` 施加率 +20% | 射雕中期：先天功（天中）＋全真心法（玄中）＋全真剑法（玄中）＋同归剑法（地下）= 4 件 | 携带先天功＋同归剑法＋道袍 = 3 件；鹿鼎★另可本土学全真心法 → 4 件 |
| 古墓·玉女 | `set_gumu_yunv` | `sk_yunvxinjing`（天·内）、`sk_hanyuxinjue`（玄·内）、`sk_yunvjian`（玄·剑）、`sk_suxin`（天·剑）、`sk_meinvquan`（玄·拳）、`sk_jinlingsuo`（地·鞭）、`sk_gumuqinggong`（地·轻）、`sk_yufengzhen`（玄·暗）、`eq_jinlingsuo` 金铃索（建议地下·鞭） | `attr:eva pct +6%`、`attr:spd pct +3%` | 阴性招式 Z3 +6%；对使用全真武学的目标 Z5 +4%（与"克全真"被动取高） | 每场开始获得 `bf_youshi`（游势）2 回合 | 每 3 回合获得 `bf_canying` 1 层（上限 1） | 玉女心经（天下）＋玉女剑法（玄上）＋美女拳法（玄下）＋古墓轻功（地上）= 4 件 | 携带玉女心经＋美女拳法＋金铃索法＋金铃索装备 = 4 件（金铃索法须主手鞭） |
| 神雕侠侣（杨过 × 小龙女） | `set_shendiao_xialv` | `sk_suxin`（天·剑）、`sk_anran`（天·掌）、`sk_xuantie`（天·剑）、`sk_yunvxinjing`（天·内）、`sk_yunvjian`（玄·剑）、`sk_quanzhenjian`（玄·剑）、`eq_junzijian` 君子剑、`eq_shunvjian` 淑女剑（绝情谷剑室所出，原著；建议地中·剑） | 与羁绊 ≥ 3 的队友相距 ≤ 2 时双方招式 Z3 +6% | 素心独练系数 +0.1；自身情花毒"动情"发作伤害 −30% | 本方羁绊队友倒地时自身获得 `bf_ruiyi` 3 回合、气势 +30 | （须含君子剑或淑女剑）合璧状态下双方 Z4 +10% | 三门天中＋天下内功＋地中双剑：天、地两阶混搭 | **低武可满 5 件**：携带玉女心经＋黯然销魂掌＋玉女素心剑法（或玄铁剑法）＋君子剑＋淑女剑——本组最"低武友好"的套装 |
| 独孤剑冢 | `set_dugu_jianzhong` | `sk_xuantie`（天·剑）、`sk_lijianyi` / `sk_ruanjianyi`（玄·杂）、`sk_zhongjianyi`（地·杂）、`sk_mujianyi`（地·杂）、`eq_xuantiejian`（天中·剑，基准 §14）、`sk_dugu9`（天上·剑，五岳组，需其 `setTags` 同步） | 剑法招式 Z2 防御穿透 +6% | 剑法 `attr:crit flat +8`；持重剑时击退 +1 | 剑法招式被招架时 Z9 招架减免 −30% | 剑法招式 Z3 +10%；独孤九剑 `bf_duguyi` 战斗开始即有 2 层（笑傲起） | 神雕：玄铁剑法（天中）＋玄铁重剑（天中装备）＋重剑意（地中）＋木剑意（地上）＋利剑意（玄上）= 5 件 | 剑意为神雕杂学、不可携带：神雕外至多 3 件；低武只有 1 个兵器携带位 → 玄铁剑法（或独孤九剑）＋玄铁重剑 = **2 件**；笑傲（2/2/2）可 3 件 |
| 武当·太极 | `set_wudang_taiji` | `sk_taijiquan`（天·拳）、`sk_taijijian`（天·剑）、`sk_liangyixinfa`（玄·内）、`sk_taijituishou`（玄·擒拿）、`sk_mianzhang`（玄·掌）、`sk_tiyunzong`（地·轻） | `attr:parry pct +6%` | 调和招式 Z5 +4%；`attr:counter pp +5` | 招架成功时 30% 使攻击者获得 `bf_shiheng`（与太极拳被动取高）；Z4 +6% | 每场开始获得 `bf_jingshi` 1 层与 `bf_yuanzhuan` 3 回合 | 太极拳 / 太极剑（天中）＋两仪心法（玄中）＋太极推手（玄上）＋梯云纵（地中） | 中武：笑傲残承或携带＋本土两仪、推手、绵掌 → 5 件；低武：携带太极拳＋太极剑＋两仪心法 = 3 件，连城★/鸳鸯★本土绵掌 → 4 件 |
| 武当·真武（七侠） | `set_wudang_zhenwu` | `sk_chunyangwuji`（地·内）、`sk_wudangjiuyang`（地·内，倚天组，需其 `setTags` 同步）、`sk_huzhaojuehushou`（地·擒拿）、`sk_wujixuangongquan`（地·拳）、`sk_shenmen13`（地·剑）、`sk_yitiantulonggong`（地·奇门）、`sk_zhenwuqijie`（地·杂） | 武当武学招式 `attr:hit pct +5%` | 阳性招式 Z3 +6% | 真武七截阵阵员计数 +1；未装配阵法时改为 Z4 +5% | 每场开始获得 `bf_hutizhenqi`（hpMax 10%）；本方施加 `bf_jiaoxie` 概率 +10% | 纯地阶套装（地中 ×4、地下 ×3），用作中武书界的"本土主力" | 中武：笑傲★/侠客★本土可学除倚天屠龙功、九阳功外全部 → 5 件；低武：携带纯阳无极功＋虎爪绝户手＋神门十三剑 = 3 件 |
| 绵里针（陆菲青 · 书剑） | `set_shujian_mianlizhen` | `sk_mianzhang`（玄·掌）、`sk_furongjinzhen`（玄·暗）、`sk_rouyunjian`（地·剑）、`sk_tiyunzong`（地·轻） | `attr:seal pp +5` | 拳掌招式命中后，下一次暗器招式获得 `bf_bizhong`（必中 ×1；每 3 回合 1 次） | 剑法与暗器对被点穴目标 Z3 +10% | — | 玄中＋玄上＋地下＋地中：玄、地混搭的中武套装 | 书剑本土全员 → 4 件；低武：携带绵掌＋柔云剑术 = 2 件（暗器、轻功不可携带且无低武原生） |
| 赤练仙子（李莫愁） | `set_chilian_xianzi` | `sk_chilianshenzhang`（地·掌）、`sk_bingpoyinzhen`（地·暗）、`sk_sanwusanbushou`（玄·拂尘）、`sk_wudumichuan`（玄·毒）、`sk_gumuqinggong`（地·轻）、`eq_chilianfuchen` 赤练拂尘（原创扩展命名，建议地下·鞭） | 毒类与心神类效果 `attr:effHit pct +6%` | 对中毒目标 Z3 +8% | 本方施加中毒时每次额外 +1 层；`morality ≤ −20` 时 `attr:crit flat +5` | — | 地下 ×2＋玄上 ×2＋地上：邪派玄地混搭 | 携带赤练神掌＋三无三不手＋赤练拂尘 = 3 件（毒术、暗器、轻功不可携带） |
| 绝情谷·公孙 | `set_jueqing_gongsun` | `sk_yinyangdaoluan`（地·刀）、`sk_bixuegong`（地·内）、`sk_jueqingxinjue`（黄·内）、`sk_yuwangzhen`（玄·阵）、`eq_juchijindao` 锯齿金刀、`eq_heijian` 黑剑（建议地中·刀 / 剑，名称待考） | `attr:resSeal pp +8` | 主副手互换后下一招获得 `bf_bizhong`（每 3 回合 1 次） | （须含金刀或黑剑）敌方破 X 对自身效果 ×0.5（与"倒乱"取高不叠加）；Z3 +8% | — | 地中＋地下＋黄上＋装备：黄、地跨阶 | **低武可满 4 件**：携带闭穴功＋阴阳倒乱刃法＋锯齿金刀＋黑剑 |

**设计要点**

- **跨品阶混搭**：九个候选中七个同时含天/地与玄/黄成员（用户示例"少林金刚"式混搭）；天级成员提供门槛，低阶成员负责"凑件"，因此套装不是天级玩家的专利。
- **携带取舍**：神雕侠侣、绝情谷·公孙以装备承载件数，低武仍可满档；独孤剑冢、绵里针依赖不可携带的杂学/暗器/轻功，出原生书界即掉档——这是有意的差异化（"带什么走"的抉择点）。
- **跨组成员**：`set_dugu_jianzhong` 含五岳组 `sk_dugu9`，`set_wudang_zhenwu` 含倚天组武当九阳功，须由 07 与相应图鉴双向校验（05 §15 V11）。

---

## 8. 本组统计

> 统计口径：本组 **66 门**（含 05 §13.6 已定义的全真剑法 1 门；本文新定义 65 门）；武当九阳功为倚天组定义，只引用、不计。

### 8.1 门派 × 品阶（12 级）

| 门派 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 | 合计 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 全真教 | 0 | 2 | 2 | 1 | 4 | 2 | 1 | 1 | 0 | 1 | 1 | 0 | **15** |
| 古墓派 | 0 | 1 | 3 | 1 | 1 | 5 | 3 | 0 | 1 | 1 | 0 | 0 | **16** |
| 杨过传承 · 剑冢 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 1 | 1 | 0 | 3 | 0 | **7** |
| 武当派 | 1 | 1 | 2 | 0 | 3 | 3 | 4 | 4 | 0 | 0 | 2 | 0 | **20** |
| 绝情谷 | 1 | 0 | 2 | 0 | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | **8** |
| **合计** | **2** | **4** | **9** | **2** | **10** | **13** | **9** | **7** | **2** | **2** | **6** | **0** | **66** |
| 大阶小计 | | 黄 15（22.7%） | | | 玄 25（37.9%） | | | 地 18（27.3%） | | | 天 8（12.1%） | | |

- 天级 8 门与基准 §13 逐条一致：先天功（天中）、天罡北斗阵（天下）、玉女心经（天下）、黯然销魂掌 / 玄铁剑法 / 玉女素心剑法（天中）、太极拳 / 太极剑（天中）；**未新增天级**。
- 对照 05 §14.4 高武"可习得池"目标（天 10–15%、地 20–25%、玄 30–35%、黄 30–35%）：本组地、玄偏高，黄偏低——本组门派多在高武巅峰书界（神雕、倚天敌人中位数已到地下），黄阶主要承担入门、前置与套装凑件；全局黄阶由 `skills-common` 等补足（§10 D-11）。

### 8.2 按类别 × 大阶

| 大类 | 子类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---|---|---|---|---|---|
| 内功 | 心法 | 2 | 3 | 3 | 4 | **12** |
| 拳脚 | 拳掌 | 2 | 2 | 4 | 3 | 11 |
| | 指法 | 0 | 0 | 1 | 0 | 1 |
| | 腿法 | 0 | 0 | 0 | 1 | 1 |
| | 擒拿 | 0 | 1 | 2 | 1 | 4 |
| | 小计 | 2 | 3 | 7 | 5 | **17** |
| 兵器 | 剑 | 3 | 3 | 3 | 4 | 13 |
| | 刀 | 0 | 1 | 0 | 0 | 1 |
| | 棍杖 | 0 | 0 | 1 | 0 | 1 |
| | 枪 | 0 | 0 | 0 | 0 | 0 |
| | 鞭索 | 0 | 1 | 1 | 0 | 2 |
| | 奇门 | 0 | 1 | 0 | 0 | 1 |
| | 小计 | 3 | 6 | 5 | 4 | **18** |
| 轻功 | | 0 | 2 | 1 | 2 | **5** |
| 暗器 | | 0 | 1 | 3 | 0 | **4** |
| 杂学 | 阵法 4、心神 4、驭兽 1、毒 1 | 1 | 3 | 6 | 0 | **10** |
| **合计** | | **8** | **18** | **25** | **15** | **66** |

> 注：拳掌——天：黯然销魂掌、太极拳；地：赤练神掌、无极玄功拳；玄：昊天掌、三花聚顶掌、美女拳法、绵掌；黄：三清掌、天罗地网势、武当长拳。剑——天：玄铁剑法、玉女素心剑法、太极剑；地：同归剑法、柔云剑术、神门十三剑；玄：全真剑法、玉女剑法、绕指柔剑；黄：终南剑法、寒潭剑法、真武剑法、绝情剑法。阴阳倒乱刃法记在刀；金铃索法（地）、三无三不手（玄）记在鞭索；倚天屠龙功记在奇门。

### 8.3 按原生书界

**首现书界**（该武学第一个原生书界）

| 书界 | 境界 | 天 | 地 | 玄 | 黄 | 首现合计 | 对照 05 §14.4 该书界首现目标（全组合计） |
|---|---|---|---|---|---|---|---|
| 射雕 `ch02` | 高 | 2 | 2 | 6 | 4 | 14 | 天 11 / 地 16 / 玄 20 / 黄 18 = 65 |
| 神雕 `ch03` | 高 | 4 | 8 | 13 | 7 | 32 | 天 5 / 地 14 / 玄 16 / 黄 12 = 47（**玄阶余量紧张**，§10 D-11） |
| 倚天 `ch04` | 高 | 2 | 6 | 5 | 4 | 17 | 天 8 / 地 16 / 玄 18 / 黄 14 = 56 |
| 书剑 `ch12` | 中 | 0 | 2 | 1 | 0 | 3 | 天 2 / 地 6 / 玄 10 / 黄 12 = 30 |
| **合计** | | **8** | **18** | **25** | **15** | **66** | |

**可习得池**（含跨书界复现；★为原创扩展延伸，须 chapters/ 采纳）

| 书界 | 境界 | 内 | 拳脚 | 兵器 | 轻 | 暗 | 杂 | 合计 | 其中天 / 地 / 玄 / 黄 |
|---|---|---|---|---|---|---|---|---|---|
| 射雕 | 高 | 4 | 5 | 3 | 1 | 0 | 1 | 14 | 2 / 2 / 6 / 4 |
| 神雕 | 高 | 8 | 10 | 12 | 3 | 3 | 9 | 45 | 5 / 10 / 19 / 11 |
| 倚天 | 高 | 3 ＋1★ | 6 ＋2★ | 5 ＋1★ | 2 ＋1★ | 0 | 1 | 17 ＋5★ | 2 / 6 / 5 / 4；★：地 1、玄 2、黄 2 |
| 笑傲 | 中 | 3 | 6 | 4 | 2 | 0 | 1 | 16（＋太极拳 / 剑残承） | 0 / 7 / 5 / 4 |
| 侠客 | 中 | 3 | 6 | 3 | 2 | 0 | 1 | 15 | 0 / 7 / 4 / 4 |
| 书剑 | 中 | 3 | 5 | 3 | 2 | 1 | 0 | 14 | 0 / 5 / 5 / 4 |
| 飞狐 | 中 | 2 | 3 | 2 | 2 | 1 | 0 | 10 | 0 / 2 / 4 / 4 |
| 鹿鼎★ | 低 | 2 | 1 | 1 | 0 | 0 | 0 | 4 | 0 / 0 / 1 / 3 |
| 连城★、鸳鸯★（各） | 低 | 1 | 2 | 1 | 1 | 0 | 0 | 5 | 0 / 0 / 1 / 4 |

> 神雕行"天 5"含天罡北斗阵（神雕为 `recall`，02 §5.7；不计则为 4）；"地 10"含重剑意、木剑意。

### 8.4 其他自检

| 项 | 结果 |
|---|---|
| 招式 | 本文新定义 250 个（另引用全真剑法 4 个）；绝招 30 个：天级 8、地阶 18 门全部配有绝招，玄阶 4 门配可选绝招，黄阶无绝招（05 §15 V9）；核心武学首个绝招均在第 7 重（02 P11） |
| 被动 | 本文新定义 215 个（`ps_` 前缀）；黄阶内功无招式，以 3 个被动补偿（05 §3.5 V7 预期告警 4 条：吐纳诀、古墓心法、太和功、绝情心诀；玄阶 3 条多 1 被动：寒玉心诀、玉女剑法、五毒秘传） |
| Buff 引用 | 招式与被动共引用 81 个 `bf_` ID，全部为 06 目录已有条目（06 §8.1–§8.11，逐一核对）；未自定义 Buff |
| 内功贡献 | 12 门内功 IP 全部等于 05 §5.5 对应品阶预算，单项偏差 ≤ ±30% |
| layerStats | 按大阶上限（黄 6 / 玄 10 / 地 15 / 天 20）逐条校验 |
| 代价 / 合击 | 地阶代价型 1（同归剑法）；另有轻代价 2（闭穴功罩门、虎爪绝户手门规）；地阶合击 1（真武七截阵）——均在 05 §14.6 全局上限内 |
| 原创扩展 | 原创扩展武学 17 门（全真 5、古墓 2、武当 6、绝情谷 4，入库时 `description` 须含"原创扩展"，05 §15 V17）＋剑冢四意 4 门（碑文原著、机制原创）；原著武学中招名为原创者均逐条标注 |

---

## 9. 本文新增 ID

| 类别 | 数量 | 说明 |
|---|---|---|
| 武学 `sk_` | **65** | 全真 14（除 05 已定义的 `sk_quanzhenjian`）、古墓 16、杨过传承 7、武当 20、绝情谷 8；另引用 `sk_quanzhenjian`（05）、`sk_wudangjiuyang`（倚天组）等跨组 ID 不计 |
| 招式 `mv_` | **250** | 其中绝招 30；原著定数例外：黯然销魂掌 18（17 招＋绝招） |
| 被动 `ps_` | **215** | 前缀按 05 §16 P-4 |
| 套装候选 `set_` | **9**（新 8 ＋沿用 1） | 新：`set_gumu_yunv` `set_shendiao_xialv` `set_dugu_jianzhong` `set_wudang_taiji` `set_wudang_zhenwu` `set_shujian_mianlizhen` `set_chilian_xianzi` `set_jueqing_gongsun`；沿用 05：`set_quanzhen_beidou` |
| 新提议 Buff | **0（正式）＋2（可选提案）** | 本文未使用任何 06 目录外的 Buff；可选提案见 §10 D-13：`bf_zhenshi`（阵势，UI 光环）、`bf_cuidu`（战斗内淬毒） |
| 装备（建议 ID，design/10 定级） | 7 | `eq_chongyangdaopao` 重阳道袍（原创扩展）、`eq_jinlingsuo` 金铃索、`eq_junzijian` 君子剑、`eq_shunvjian` 淑女剑、`eq_chilianfuchen` 赤练拂尘（原创扩展命名）、`eq_juchijindao` 锯齿金刀（名待考）、`eq_heijian` 黑剑；引用基准 §14 `eq_xuantiejian` |
| 物品（建议 ID，design/10） | 15 | 秘籍 `it_miji_quanzhenxinfa` `it_miji_tongguijian` `it_miji_chilianshenzhang_can` `it_miji_bingpoyinzhen` `it_miji_liangyixinfa` `it_miji_chunyangwuji` `it_miji_huzhaojuehushou` `it_miji_wujixuangongquan` `it_miji_shenmen13`；暗器弹药 `it_bingpoyinzhen` `it_yufengzhen` `it_furongjinzhen` `it_zaoheding`；`it_yufengjiang` 玉蜂浆；引用 `it_jueqingdan` `it_duanchangcao` |
| NPC（占位） | 21 | `npc_mayu` `npc_qiuchuji` `npc_yideng` `npc_quanzhen_sandai` `npc_baiyunguan_daozhang` `npc_xiaolongnv` `npc_limochou` `npc_zhouboting` `npc_yangguo` `npc_zhangsanfeng` `npc_songyuanqiao` `npc_yulianzhou` `npc_zhangcuishan` `npc_chongxu` `npc_lufeiqing` `npc_liyuanzhi` `npc_zhangzhaozhong` `npc_wudang_youfang` `npc_gongsunzhi` `npc_qiuqianchi` `npc_fanyiweng` |
| 任务（占位，本文件号段 `_71`–`_96`） | 24 | `q_02_bond_72` `q_02_faction_73` `q_02_qiyu_74` `q_02_bond_75` `q_02_faction_77` `q_03_side_76` `q_03_side_79` `q_03_faction_80` `q_03_qiyu_81` `q_03_bond_82` `q_03_qiyu_83` `q_03_qiyu_84` `q_03_bond_86` `q_03_faction_94` `q_03_side_95` `q_03_qiyu_96` `q_04_bond_85` `q_04_main_87` `q_04_main_88` `q_04_bond_91` `q_04_qiyu_92` `q_04_faction_93` `q_12_faction_89` `q_12_bond_90` |
| 其他 | 2 | 存档旗标 `anran_bieli`（黯然"别离"门槛）；地形建议 `tr_qinghuacong` 情花丛（design/08） |

---

## 10. 待决事项 / 依赖

### 10.1 依赖他文档（本文先给建议值，待对方确认）

| # | 依赖文档 | 事项 | 本文当前处理 |
|---|---|---|---|
| D-1 | 05 §7.7、09 §6.8、基准 §8 | **七人阵与"上场 ≤ 6"冲突**：天罡北斗阵、真武七截阵原著七人成阵；05 §7.7 写"需 7 人" | 改编为 4 人（北斗大阵 3、渔网阵 2）起阵，6 人近满阵，10 重"阵主一人双星"补足七星；请 05 修订 §7.7 措辞、09 定稿阵法流程（09 P-09-1 剧情友军另计亦可凑七人） |
| D-2 | 06、05 §4.2 | `cost_buff` 补充映射（缴械、恐惧、迷惑、麻痹、缠绕、剧毒等，见 §0 表） | 按本文建议值核算；06 给出 Buff 价值后统一重算（误差 ±0.05 以内可不改） |
| D-3 | 05 §4.7、06 §8.6 | **暗器预算约定**：`projectile`（×0.92）且默认不可招架（×0.85），弹药成本不计入倍率 | 本组 4 门暗器按此核算；请 05 在 §4.2 / §4.7 明确暗器 `parryable` 默认值 |
| D-4 | 05 §2.4 | `Reqs` 缺"技艺门槛"字段 | 倚天屠龙功（`art ≥ 40`）、五毒秘传（`poi`）、天罡北斗阵（`formation`）暂以说明文字表示；建议新增 `reqs.skills: {art: 40}` |
| D-5 | 05 §13.6 | 全真剑法可增补前置 `sk_zhongnanjian ≥ 4`，构成"黄 → 玄 → 地"剑法链 | 可选；未改 05 |
| D-6 | 05 §4.11 | 太极拳"借力打力"的精确实现需效果钩子 `borrowForce{pct}`（部分伤害按目标外功攻击计算） | 暂以"对外攻高于自身者 Z3 +6%→15%"代替 |
| D-7 | 02 §5.4 | 同源组：建议 `lg_dugu` 并入剑冢四意（`sk_lijianyi` `sk_ruanjianyi` `sk_zhongjianyi` `sk_mujianyi`），使其残篇在笑傲加速独孤九剑；`lg_taiji` 可并入太极推手、两仪心法 | 未改 02 |
| D-8 | 05 §6.2、10 §3 | `weaponReq` 增补"异类双持" `dualMixed: [blade, sword]`（阴阳倒乱刃法）；拂尘归 `whip` 细项；剑的 `heavy` / `soft` / `wooden` 标签；判官笔 / 钩双兵 | 条目内已按建议书写 |
| D-9 | chapters/02、03、04、12 | 占位任务号段 `_71`–`_96` 与 21 个 NPC 占位 ID 的正式编号；羁绊等级门槛（12） | §9 列表 |
| D-10 | chapters/04、08、09、11；02 §6.6 | ★延伸需采纳：倚天黄衫女子传古墓武学（5 门）；鹿鼎北京白云观全真入门（4 门）；连城 / 鸳鸯游方武当道人（5 门）；`rs_wudang` 存在书界可增补连城★ / 鸳鸯★ | 条目中已标★；不采纳时从 `sourceChapters` 删除即可，不影响高 / 中武 |
| D-11 | 05 §14.4–14.5 | **数量与拆分**：05 §14.5 建议 `skills-wudang` 20 门、`skills-quanzhen-gumu` 32 门（含九阴系、周伯通），未列绝情谷；本文件按编排合并为"道家与神雕诸派" 66 门（武当 20 ✓；全真 · 古墓 · 杨过 38；绝情谷 8）。另：本组神雕首现玄阶 13 门，占 05 §14.4 神雕首现玄阶目标 16 的 81%，他组（丐帮、桃花、蒙古诸王、密宗等）余量仅 3 | 请 05 更新 §14.5 文件表，并上调神雕首现玄阶目标（建议 16 → 22）或由本组合并利剑意 / 软剑意、降北斗大阵为黄上以腾挪 |
| D-12 | 07 | 9 个套装候选的成员、阈值、档位品阶取法（建议中位数）；`set_dugu_jianzhong` 须五岳组给 `sk_dugu9` 加 `setTags`；`set_wudang_zhenwu` 须倚天组给武当九阳功加 `setTags` | §7 |
| D-13 | 06 | 可选 Buff 提案：① `bf_zhenshi` 阵势（光环型，仅供 UI 显示"阵中"，数值仍由 `bf_zhuiji` `bf_yuanhu` `bf_suoding` 承担）；② `bf_cuidu` 淬毒（战斗内 N 次命中附带中毒；现由五毒秘传被动"毒刃"＋10 §6.5 `poisonCoat` 实现） | 均未在条目中使用 |
| D-14 | 06 §8.9、§8.11 | 本文对 06 既有 Buff 的**来源扩展**：`bf_zhaomen`（罩门，原为横练伴生）用作闭穴功代价；`bf_xielian`（邪气，原为九阴白骨爪）用于赤练神掌；`bf_qianlong`、`bf_xuli`（降龙专属）被黯然销魂掌"力不从心""饮恨吞声"复用 | 请 06 在"典型来源"列补登，或指定替代 ID |
| D-15 | 03 待决 D-03 | 各书界最高原生轻功：神雕地上由古墓轻功满足；笑傲 / 侠客 / 书剑 / 飞狐地中由梯云纵满足；射雕地上本组不提供（金雁功玄上） | 已对齐 05 §14.6 #7 |
| D-16 | 08、10 | 情花丛地形 `tr_qinghuacong` 与情花刺物品作为 `bf_qinghuadu`（品阶 8–9）的施加源；寒玉床、剑冢、古墓暗河寒潭、王盘山石壁作为闭关灵地 / 解谜场景 | 条目中以说明引用 |
| D-17 | 09 §6.7 | 玉女素心剑法"双剑合璧"搭档集气 −300、合击演出与情花毒"动情"时序 | 按 05 §9.3.1 书写 |

### 10.2 原著考据待办（"待考"汇总）

| # | 事项 |
|---|---|
| K-1 | "金关玉锁二十四诀"的出处回目与内容（是否为全真内功口诀） |
| K-2 | 新修版改动：神雕中窥扰小龙女练功者的人物改动（尹志平 / 甄志丙）等；本作以修订版为基线（基准 §16-6） |
| K-3 | 天罡北斗阵七子座次；神雕重阳宫"北斗大阵"的正式名称与人数 |
| K-4 | 同归剑法的创制者、出场回目；昊天掌使用者；郝大通以三花聚顶掌误伤孙婆婆的回目 |
| K-5 | 金雁功的传授细节；马钰蒙古悬崖夜授郭靖的回目 |
| K-6 | 美女拳法全部招名与总数；天罗地网势的雀数 |
| K-7 | 小龙女"金铃索"的正式名称；寒玉床"睡一年抵十年"之说 |
| K-8 | 三无三不手的"三不"招名；赤练神掌与"五毒神掌"是否同一；《五毒秘传》书名与来历；冰魄银针解药 |
| K-9 | 独孤求败剑冢四段碑文逐字；紫薇软剑的下落 |
| K-10 | 黯然销魂掌十七招名的逐字与次序；"心境欢愉掌力大减"的具体情节 |
| K-11 | 玉女素心剑法招名全表（"举案齐眉"等）；杨过身中情花毒后合使剑法的情节 |
| K-12 | 太极拳招名（"云手""合太极"是否出现）、太极剑招名（"小魁星"等）；笑傲冲虚"剑圈"原文 |
| K-13 | 纯阳无极功、绕指柔剑、神门十三剑、虎爪绝户手在倚天中的使用者与情节 |
| K-14 | 张翠山兵刃"烂银虎头钩""镔铁判官笔"之名；王盘山题壁所用轻功 |
| K-15 | 书剑：柔云剑术是否张召重亦使；无极玄功拳出场；芙蓉金针；马真身份与结局；陆菲青"绵里针"之号来由 |
| K-16 | 侠客武当掌门"愚茶"、飞狐武当掌门之名 |
| K-17 | 绝情谷：锯齿金刀与黑剑；闭穴功的破法；渔网阵是否缀刃；樊一翁兵刃；裘千尺以枣核钉伤公孙止一节；谷中茹素之规 |

### 10.3 开放问题（需作者拍板）

| # | 问题 | 本文默认 |
|---|---|---|
| O-1 | 剑冢四意做成 4 门杂学（本文），还是合并为 1 门分四段解锁 | 4 门：杂学栏仅 2 格，玩家须按持剑类型取舍，契合"剑随年岁"的原著意涵 |
| O-2 | 低武★补位（鹿鼎全真、连城 / 鸳鸯武当）是否保留 | 保留为候选；删除不影响其他书界 |
| O-3 | 黯然销魂掌的"别离"门槛（本书界内有羁绊 ≥ 3 同伴离队或倒下）是否过于严苛 | 保留；备选：完成神雕"十六年之约"主线即可 |
| O-4 | 虎爪绝户手"门规代价"（对非邪派目标使用扣品德）是否保留 | 保留，作为武当"正派约束"的数据表达 |
