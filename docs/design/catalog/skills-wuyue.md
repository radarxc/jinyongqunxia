# 门派武学图鉴 · 五岳剑派与日月神教（`skills-wuyue`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴。本文件唯一收录笑傲书界的五岳剑派（华山气宗/剑宗、嵩山、泰山、南衡山、北恒山）、日月神教及梅庄四友、福威镖局与林家、青城派、五仙教，以及桃谷六仙、田伯光、不戒和尚等散人传承。
> **上游**：`00-canon.md` §3–§5、§7、§9、§12–§13、§16、§20；`decisions/author-requirements.md` AR-01–AR-03、AR-07–AR-08；`decisions/author-decisions.md` P33；`decisions/rulings-v1.md` C14–C17、C22–C23 与 §3–§5。
> **引用而不重定义**：字段、层数、招式预算、内功贡献、代价型武学与“破 X”见 `design/05`；Buff 本体见 `design/06`；属性与技艺见 `design/03`；书界压制、残承与印证见 `design/02`；合击结算见 `design/09`；装备见 `design/10`；套装最终规则交 `design/07`。跨组只引用 `sk_yijinjing`、`sk_taijiquan`、`sk_taijijian`、`sk_dagou` 等 ID，不重复定义。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（原创扩展命名）** = 原著有其人其事、但本作新拟武学或招式名；**（待考）** = 须以三联/广州修订版逐字核对；**【建议值】** = 依赖下游定稿。

---

## 0. 阅读指引与统一记法

### 0.1 条目层级

| 品阶 | 写法 | 本文要求 |
|---|---|---|
| 天阶（10–12） | 完整条目卡 | 全部字段、层数、招式与逐招核算、被动、来源、套装；不得超出基准 §13 封闭名录 |
| 地阶（7–9） | 完整条目卡 | 同上；本组 12 门全部给出绝招与逐招核算 |
| 玄阶（4–6） | 紧凑卡 | 核心字段、结构化 `reqs`、招式名＋倍率＋一句效果；抽样核算不少于 30% |
| 黄阶（1–3） | 一行表格 | ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处、`setTags`；只作整体预算核对 |

- 所有 `grade` 均为绝对品阶，外来压制与残承来源品阶另按 `design/02` 结算。
- `nature` 取 `yin / yang / harmony / neutral`；每门内功只取前三者，非内功可为 `neutral`。阴阳归类是本作数值设计，不冒充原著术语。
- 招式附带写作 `bf_ID·承·概率·持续`；“承”即 `grade: inherit`。Buff 只取 `design/06` 已有目录或裁定已收录 ID。
- `sourceChapters: [ch05_xiaoao]` 是完整原生来源；紫霞神功在碧血仅有 8 品残承，记入来源说明而不把 `ch07_bixue` 写成完整原生书界。
- NPC、任务与秘籍 ID 尚归章节文档，本图鉴只写稳定的来源类型与人物/地点，不虚造最终任务 ID。

### 0.2 招式表列与核算

完整卡招式表统一为：`招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算`。

```text
power = AF(tpl) × (1 + Σadj) × K_delivery × K_parry − Σcost_buff − Σcost_disp
```

| 简写 | 数值 |
|---|---|
| 大阶耗内基准 | 黄 5% / 玄 6% / 地 7% / 天 8%；每偏离 1% 给 `adj ±0.05` |
| 冷却 | 每 1 回合 `adj +0.12` |
| 收招 | 相对 1000 每 ±100 给 `adj ±0.07` |
| 投送 / 招架 | `K_delivery`: 近身 1、远程 0.85、投射 0.92；不可招架 `K_parry=0.85` |
| 常见 / 罕见条件 | `adj +0.15 / +0.30` |
| 控制 / 封禁 / 数值减益 | 硬控 `0.25×率×回合`；封禁 `0.20×率×回合`；数值减益与 DOT `0.10×率` |
| 位移 | 击退每格 0.05；拉拽/突进/跳斩 0.10；绕背/换位 0.15 |
| 绝招 | `3.00 × AF × K_delivery × K_parry − cost`；气势 100、耗内为本阶基准 +2%、收招 1200 |

结果按 0.05 取整，允许误差 ±0.05；纯支援、架势、移动招式写 `power 0`，明确“不进入伤害倍率公式”。范围 `AF`、效果价值与结算顺序只引用 `design/05` §4.2–§4.11。

### 0.3 内功贡献与经脉预留

```text
IP = mpMaxPct + hpMaxPct + 2 × 属性点总和 + 5 × mpRegen
```

本文使用的预算锚点：黄下 19、黄中 24、黄上 30、玄下 41.5、玄中 48.5、玄上 57、地下 72、地上 94.5、天中 135.5。`stats` 不计 IP，但仍受相应大阶 `layerStats` 上限。

`design/15` 尚未存在，本文按 AR-03 预留以下专精经脉 ID；它们只表达“冲穴倾向”，不在本图鉴定义穴位与加成：`mer_renmai`（任脉）、`mer_dumai`（督脉）、`mer_chongmai`（冲脉）、`mer_daimai`（带脉）、`mer_shoutaiyin`（手太阴）、`mer_shoushaoyin`（手少阴）、`mer_zuyangming`（足阳明）、`mer_zushaoyang`（足少阳）、`mer_zutaiyin`（足太阴）、`mer_zujueyin`（足厥阴）。

### 0.4 门派职级与可学武学（五级建议）

`design/17-sects-compendium.md` 尚未存在，故先按裁定门派 ID 与 AR-07 抽象五级书写。展示层 `L1–L5` 直接对应数据层 `sect.rank:1–5`；这里只列“可学武学”，月钱、资源、贡献消耗全部留给 `design/16`。分支秘传仍须满足条目 `reqs`，达到职级不等于自动获得。

| 门派 | L1 外门弟子 | L2 入门弟子 | L3 亲传/闭门弟子 | L4 长老 | L5 掌门 |
|---|---|---|---|---|---|
| 华山 `sect_huashan` | 华山入门剑、基础拳、吐纳、行步 | 华山剑法、希夷剑法、玉女剑十九式 | 养吾剑、狂风快剑（剑宗支）、华山心法 | 太岳三青峰、紫霞神功（气宗支） | 门派全谱；独孤九剑仍只由风清扬奇遇授受 |
| 嵩山 `sect_songshan` | 嵩山入门剑、嵩阳入门掌、吐纳、步 | 嵩山剑法、嵩山桩功 | 大阴阳手、嵩阳心法 | 寒冰真气 | 门派全谱 |
| 泰山 `sect_taishan` | 泰山入门剑/拳、吐纳、石坂山步 | 泰山剑法、泰山拳 | 泰山十八盘、泰山心法 | 岱宗如何 | 门派全谱 |
| 衡山 `sect_hengshan_nan` | 衡山入门剑/掌、吐纳、云步 | 衡山心法 | 回风落雁剑、衡山五神剑 | 百变千幻衡山云雾十三式、衡山云雾步 | 门派全谱 |
| 恒山 `sect_hengshan_bei` | 恒山入门剑/拳、吐纳、步 | 恒山心法、恒山身法 | 恒山剑法、天长掌法 | 万花剑法 | 门派全谱 |
| 日月 `sect_riyue` | 黑木崖入门剑、基础拳、吐纳、神教步 | 日月剑法、日月心法；梅庄支按琴棋书画入门 | 石鼓打穴笔法、泼墨披麻剑法、玄天指、《笑傲江湖》曲谱 | 黑木崖剑法、七弦无形剑、吸星大法 | 教主秘库可见葵花宝典；取得仍由剧情与誓约限制 |
| 福威 `sect_fuwei` | 林家入门剑/拳、镖局心法、趟子步 | 林家剑法、林家手 | 翻天掌 | — | 辟邪剑法须取得袈裟真谱；职位不替代断尘之誓 |
| 青城 `sect_qingcheng` | 青城入门剑/拳、吐纳、山径步 | 青城心法 | 松风剑法 | 青城摧心掌 | 门派全谱 |
| 五仙 `sect_wuxian` | 五仙入门掌、苗寨毒法、五仙吐纳 | 五仙毒经 | 五仙毒掌 | 五仙百毒功 | 门派全谱 |

### 0.5 本组天级与数量口径

| ID | 名称 | 品阶 | 类别 | 门派/传承 | 原生书界 |
|---|---|---|---|---|---|
| `sk_dugu9` | 独孤九剑 | 12 天上 | 兵器/剑 | 独孤求败 → 风清扬 | 笑傲 |
| `sk_xixing` | 吸星大法 | 11 天中 | 内功 | 日月神教 | 笑傲 |
| `sk_kuihua` | 葵花宝典 | 11 天中 | 内功 | 日月神教 | 笑傲 |
| `sk_bixie` | 辟邪剑法 | 10 天下 | 兵器/剑 | 林远图（葵花残篇） | 笑傲 |

本组没有第 5 门天级。作者已在 P33 采用 AR-01，故以 4 门天级为基数：地 `4×3=12`、玄 `4×9=36`、黄 `4×9=36`，总数 `4+12+36+36=88`；四阶占比为 `4.55% / 13.64% / 40.91% / 40.91%`。

---

## 1. 本组门派与传承一览

### 1.1 组织、边界与风格

| 组织 / 传承 | ID / branch | 本文数量（天/地/玄/黄） | 风格与核心资源 | 加入边界 |
|---|---|---:|---|---|
| 华山派与独孤传承 | `sect_huashan`; `branch:qizong/jianzong`; 独孤 `sect:null` | 1/2/6/4 = 13 | 气宗蓄劲、剑宗快剑、思过崖破招 | 华山可加入；独孤九剑是风清扬奇遇，不因职级自动授予 |
| 嵩山派 | `sect_songshan` | 0/1/4/4 = 9 | 大开大阖、寒劲、五岳号令 | 可加入；寒冰真气须左冷禅线 |
| 泰山派 | `sect_taishan` | 0/1/4/4 = 9 | 山势、方位推演、稳进 | 可加入；岱宗如何为掌门秘传 |
| 衡山派（南岳） | `sect_hengshan_nan` | 0/2/4/4 = 10 | 云雾变化、琴韵与快剑、身法 | 可加入；与北恒山严格分 ID |
| 恒山派（北岳） | `sect_hengshan_bei` | 0/1/4/4 = 9 | 绵密守剑、慈悲救护、群战援护 | 可加入；职级称谓由 17 后续作尼俗双轨映射 |
| 日月神教与梅庄 | `sect_riyue`; `branch:meizhuang` | 2/2/5/4 = 13 | 吸内、极速、黑木崖剑路；琴棋书画入武 | 可走教众线；梅庄按四艺技艺检定，不另建门派 ID |
| 福威镖局与林家 | `sect_fuwei`; `lineage:林家` | 1/1/2/4 = 8 | 镖路实战、辟邪快剑 | 可入镖局；辟邪真本仍须袈裟与誓约 |
| 青城派 | `sect_qingcheng` | 0/1/2/4 = 7 | 松风轻疾、掌劲暗伤、山径步 | 可加入；与九阴 `sk_cuixinzhang` 不同物 |
| 五仙教 | `sect_wuxian` | 0/1/2/3 = 6 | 苗疆毒术、掌毒并用 | 可加入；不得与碧血 `sect_wudu` 合并 |
| 江湖异人 | `sect:null`，田伯光/桃谷六仙/不戒 | 0/0/3/1 = 4 | 逃命快刀、六人擒拿、刚猛粗拳 | 只经人物羁绊或观摩，不设虚构门派 |
| **合计** | 9 个组织 ID＋散人传承 | **4/12/36/36 = 88** | — | 敌人专用 0 门 |

### 1.2 进阶链与成套组合总览

| 门派 / 分支 | 黄 → 玄 → 地链（均为 AND 前置） | 可成套组合 |
|---|---|---|
| 华山气宗 | `sk_huashanrumenjian` 4重 → `sk_huashanjianfa` 5重 → `sk_taiyuesanqingfeng`；`sk_huashantuna` 5重 → `sk_huashanxinfa` 6重 → `sk_zixiashengong` | `set_huashan_qijian` |
| 华山剑宗 | `sk_huashanrumenjian` 5重 → `sk_kuangfengkuaijian` 6重 → `sk_taiyuesanqingfeng` | `set_huashan_qijian` |
| 嵩山 | `sk_songshanrumenjian` 4重 → `sk_songshanjianfa` 6重 → `sk_hanbingzhenqi`（另需 `sk_songyangxinfa` 6重） | `set_songshan_hanbing` |
| 泰山 | `sk_taishanrumenjian` 4重 → `sk_taishanjianfa` 6重 → `sk_daizongruhe` | `set_taishan_daizong` |
| 衡山（南） | `sk_hengshanrumenjian` 4重 → `sk_huifengluoyan` 6重 → `sk_baibianqianhuan` | `set_hengshan_yunwu` |
| 恒山（北） | `sk_hengshanbeirumenjian` 4重 → `sk_hengshanbeijianfa` 6重 → `sk_wanhuajianfa` | `set_hengshan_cibei` |
| 日月 / 梅庄 | `sk_heimuyarumenjian` 4重 → `sk_riyuejianfa` 6重 → `sk_heimuyajianfa`（另需 `sk_riyuexinfa` 6重）；梅庄以 `sk_heimutuna` 4重＋`music 50` → `sk_qixianwuxingjian` | `set_riyue_heimu`、`set_meizhuang_siyou` |
| 福威林家 | `sk_linjiarumenquan` 4重 → `sk_linjiashou` 6重 → `sk_fantianzhang`；辟邪剑法为剑路孤本旁支，不替代此链 | `set_linjia_bixie` |
| 青城 | `sk_qingchengrumenjian` 4重 → `sk_songfengjianfa` 6重 → `sk_qingchengcuixinzhang` | `set_qingcheng_songfeng` |
| 五仙 | `sk_wuxianrumenzhang` 4重 → `sk_wuxianduzhang` 6重 → `sk_wuxianbaidugong` | `set_wuxian_baidu` |

### 1.3 跨组引用与同名隔离

- 笑傲可印证 `sk_yijinjing`、`sk_taijiquan`、`sk_taijijian`，并可见丐帮 `sk_dagou`；定义仍在少林、道家、五绝图鉴。
- `sk_qingchengcuixinzhang` 是青城掌路；`sk_cuixinzhang` 是九阴真经系，名称相近但传承与 ID 均分立。
- `sect_hengshan_nan` 是南岳衡山，`sect_hengshan_bei` 是北岳恒山；任何存档、门派身份与套装不得用中文同音合并。
- 笑傲五仙教使用 `sect_wuxian`；碧血五毒教使用 `sect_wudu`。本文不宣称两者同源。
- 独孤九剑与神雕剑冢只共享 `set_dugu_jianzhong` 和传承主题；神雕剑冢不可直接习得 `sk_dugu9`。

---

## 2. 华山派、剑宗与独孤传承

### 2.1 门派简介与本组总表

华山在笑傲书界分气宗、剑宗；两派之争、岳不群与封不平等人物关系见《笑傲江湖》，具体旧事与参与者仍须逐回核对。思过崖后洞保存五岳剑招与破解图，风清扬在此授令狐冲独孤九剑。本文把“气宗蓄劲”和“剑宗先发”做成两套可交叉但不互斥的成长路径；分支是 `branch`，不另建两个 `sect_*`。

| 品阶 | 武学 |
|---|---|
| 天 | `sk_dugu9` 独孤九剑 |
| 地 | `sk_zixiashengong` 紫霞神功、`sk_taiyuesanqingfeng` 太岳三青峰 |
| 玄 | `sk_huashanjianfa`、`sk_yangwujian`、`sk_xiyijian`、`sk_yunvjian19`、`sk_huashanxinfa`、`sk_kuangfengkuaijian` |
| 黄 | `sk_huashanrumenjian`、`sk_huashanjichuquan`、`sk_huashantuna`、`sk_huashanxingbu` |

### 2.2 `sk_dugu9` 独孤九剑（12 天上 · 兵器/剑 · 独孤传承）

> `design/05` §13.2 是招式与“破 X”机制的权威定义；本卡完整登记目录字段、来源与套装，并逐招复核该示例，不另造第二套规则。

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·风清扬在华山思过崖传令狐冲；独孤求败为传承源头。九式逐字名目与传授细节见 05 K2，仍**（待考）** |
| origin / sect / lineage | `canon` / `null` / 独孤求败 → 风清扬 → 令狐冲 |
| sourceChapters | `[ch05_xiaoao]`；神雕剑冢仅见剑意，不可习得本条目 |
| nature · wOut/wIn · moveSlots | `neutral` · `0.80/0.20` · 5 |
| weaponReq | `{category:sword, altCategories:{unlockLayer:9,categories:[staff,exotic],mult:0.90}}` |
| reqs | `attrs:{wis:70}; aptitude:{apSword:50}; morality:{min:0}; hard:[morality]` |
| layerStats | `counter:[5,15], hit:[1,5]`，合计 20（天阶上限） |
| 层数要点 | 1 总诀/破剑/料敌 ｜ 2 破刀 ｜ 3 破枪/有进无退 ｜ 4 破鞭 ｜ 5 破索 ｜ 6 破掌 ｜ 7 破箭/绝招 ｜ 8 破气 ｜ 9 以物代剑 ｜ 10 无招大成 |
| setTags | `[set_dugu_jianzhong, set_huashan_qijian]`；前者补齐 `skills-daojia` 已列的跨组反向成员 |
| conflicts / special | `[]` / `{fusible:true, autoGroup:dugu_po}` |
| learnSources | `master`：风清扬，思过崖事件链，`maxLayer:10`；非华山身份可由令狐冲高羁绊引荐**（原创扩展）** |
| observable | `false` |
| 图鉴文本 | 以总诀统摄八种破法，不守成招，贵在料敌机先、有进无退。本作以破兵系列 Buff 与自动选式实现。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 总诀式 `mv_dugu9_zongjue` | 1 | 单体·1·近身 | 0.90 | 7%/0/900 | 自身 `bf_duguyi` 1层 | 可 | `1−0.05−0.07=0.88→0.90` |
| 破剑式 `mv_dugu9_pojian` | 1 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对剑；`bf_pozhao` 60% | 否 | `(1+0.12+0.15)×0.85−0.06=1.02→1.00` |
| 破刀式 `mv_dugu9_podao` | 2 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对刀；`bf_pozhao` 60% | 否 | 同破剑式 |
| 破枪式 `mv_dugu9_poqiang` | 3 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对枪棍；无视拒敌；`bf_pozhao` 60% | 否 | 同破剑式；无视拒敌是条件式的结构化钩子，不另折倍率 |
| 破鞭式 `mv_dugu9_pobian` | 4 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对奇门；`bf_pozhao` 60% | 否 | 同破剑式 |
| 破索式 `mv_dugu9_posuo` | 5 | 单体·1–2·近身 | 1.05 | 8%/1/1000 | 对鞭索；`bf_jiaoxie` 30% | 否 | `(1+0.12+0.15)×0.85−0.20×0.30=1.02→1.00`；沿 05 取 1.05，误差 +0.03 |
| 破掌式 `mv_dugu9_pozhang` | 6 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对空手；`bf_pozhao` 60% | 否 | 同破剑式 |
| 破箭式 `mv_dugu9_poanqi` | 7 | 单体·1·近身 | 1.00 | 8%/1/1000 | 对暗器；拨开投射，9重起反射 | 否 | 主动攻击同破剑式；拨开/反射按 05 触发钩子独立结算 |
| 破气式 `mv_dugu9_poqi` | 8 | 单体·1·近身 | 1.25 | 10%/2/1000 | 对地阶以上主运或护体；破内防 | 否 | `(1+0.24+0.10+0.15)×0.85−0.02=1.25` |
| **无招胜有招** `mv_dugu9_wuzhao` | 7 | 单体·1·近身·绝招 | 2.50 | 10%/—/1100 | 清 1 个 stance/guard；不可反击 | 否 | `3×0.85−0.07=2.48→2.50` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_dugu9_pojin` | 破尽天下 | 1 | 按层授予 `bf_pojian/podao/poqiang/pobian/posuo/pozhang/poanqi/poqi`；数值见 05 §9.4 |
| `ps_dugu9_liaodi` | 料敌机先 | 1 | 来袭类别已被破解时，15%→35% 在命中前以总诀式反击，每回合 1 次 |
| `ps_dugu9_youjin` | 有进无退 | 3 | 本武学不提供招架；反击后下一招收招 −50 |
| `ps_dugu9_yiwu` | 以物代剑 | 9 | 棍杖/奇门可代剑，倍率 ×0.90 |
| `ps_dugu9_wuzhao` | 无招 | 10 | 不受破 X 克制、不可被反击；绝招 ×1.20 |

> 核算追溯：破剑/刀/枪/鞭/掌的现有 05 示例显示 1.10，但按同节公式复算中心值为 1.02，故本图鉴取最近 0.05 档的 1.00；已在“对基准的修改提案”登记回写建议。

### 2.3 `sk_zixiashengong` 紫霞神功（9 地上 · 内功 · 华山气宗）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·岳不群所修华山内功；秘籍、运功表现与传授规矩逐回**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_huashan` / 华山气宗 |
| sourceChapters | `[ch05_xiaoao]`；碧血只给 8 品残承（基准 §13“残承再遇”，**（原创扩展）**） |
| nature / meridians | `yang` / `[mer_renmai, mer_dumai]`（本作冲穴专精） |
| wOut/wIn · moveSlots | `0/1` · 4 |
| reqs | `sect:{id:sect_huashan,rank:4}; prereq:[{skill:sk_huashanxinfa,layer:6}]; attrs:{con:50,wil:50}; aptitude:{apInner:50}; hard:[sect,prereq]` |
| inner.contribution | `mpMaxPct:34, hpMaxPct:20, attrs:{con:6,wil:5,wis:3}, mpRegen:2.5`；`34+20+2×14+5×2.5=94.5` |
| inner.stats | `resInjury:8, atkIn:7`，合计 15（地阶上限） |
| 层数要点 | 1 紫气 ｜ 3 朝阳吐纳 ｜ 5 紫霞护体 ｜ 7 霞映长空 ｜ 8 残承上限 ｜ 10 紫霞大成 |
| setTags / conflicts | `[set_huashan_qijian]` / 无 |
| special / observable | `{fusible:true}` / `false` |
| learnSources | 华山气宗 L4 由岳不群传授；掌门密室秘籍；碧血华山残承 `sourceGrade:8,maxLayer:8`（原创扩展） |
| 图鉴文本 | 华山气宗镇派内功，以绵厚内劲蓄而后发。阴阳与经脉分类、战斗效果均为本作扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 朝阳吐纳 `mv_zixiashengong_chaoyang`（原创扩展命名） | 3 | 自身·支援 | 0 | 6%/3/900 | `bf_huinei` 3 | — | 支援招，不进入倍率公式 |
| 紫霞贯日 `mv_zixiashengong_guangri`（原创扩展命名） | 5 | 单体·1–3·远程 | 1.10 | 8%/2/1000 | — | 可 | `(1+0.24+0.05)×0.85=1.10` |
| 紫霞护体 `mv_zixiashengong_huti`（原创扩展命名） | 5 | 自身·支援 | 0 | 7%/3/900 | `bf_hutizhenqi` 3 | — | 支援招；护体值按 06 |
| **霞映长空** `mv_zixiashengong_changkong`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 1.75 | 9%/—/1200 | 自身 `bf_neijin_sheng` 3 | 可 | `3×0.65−0.20=1.75` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_zixiashengong_xiaqi` | 霞气 | 1 | 主运时 `mpRegen` 随层由 +0.5% 增至 +2.5%，仍受 6% 总上限 |
| `ps_zixiashengong_houshi` | 后势 | 4 | 连续一回合未主动攻击，下一次内劲招式 Z3 +8%→15% |
| `ps_zixiashengong_dacheng` | 紫霞大成 | 10 | 回合开始内力 ≥80% 时获得 `bf_neijin_sheng` 1 回合 |

### 2.4 `sk_taiyuesanqingfeng` 太岳三青峰（8 地中 · 兵器/剑 · 华山）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·岳不群所使剑招；三剑次序与具体对手**（待考）**，以下招效为本作扩展 |
| origin / sect / lineage | `canonExpanded` / `sect_huashan` / 华山剑路 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `harmony` · `0.65/0.35` · 4 |
| weaponReq | `{category:sword}` |
| reqs | `sect:{id:sect_huashan,rank:4}; prereq:[{anyOf:[{skill:sk_huashanjianfa,layer:5},{skill:sk_kuangfengkuaijian,layer:6}]}]; attrs:{agi:45,wis:45}; aptitude:{apSword:45}; hard:[sect,prereq]` |
| layerStats | `hit:[3,9], crit:[2,6]`，合计 15 |
| 层数要点 | 1 第一青峰 ｜ 3 第二青峰 ｜ 5 第三青峰 ｜ 7 三峰相济 ｜ 8 剑气相连 ｜ 10 太岳圆成 |
| setTags / conflicts | `[set_huashan_qijian]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 华山 L4；岳不群指点；思过崖石壁只能观摩至 6 重 |
| 图鉴文本 | 三剑连进，一峰高过一峰；名称取原著，分式名与连击机制为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 第一青峰 `mv_taiyuesanqingfeng_yifeng` | 1 | 单体·1·近身 | 0.90 | 7%/0/1000 | 命中后自身 `bf_lianzhao` ×1 | 可 | `1−0.10=0.90` |
| 第二青峰 `mv_taiyuesanqingfeng_erfeng` | 3 | 单体·1·近身 | 1.20 | 8%/1/1000 | 仅第一青峰命中后可用 | 可 | `1+0.12+0.05+0.15=1.32→1.30`；消耗连招收益 −0.10 →1.20 |
| 第三青峰 `mv_taiyuesanqingfeng_sanfeng` | 5 | 单体·1·近身 | 1.40 | 9%/2/1000 | 仅第二青峰命中后可用；`bf_polu` 50% | 可 | `1+0.24+0.10+0.15−0.05=1.44→1.45`（取1.40，−0.04） |
| **三峰相济** `mv_taiyuesanqingfeng_sanfengheyi`（绝招） | 7 | 单体·1·近身·3段 | 2.90 | 9%/—/1200 | 最后一段 `bf_pojia` 100% | 可 | `3−0.10=2.90` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_taiyuesanqingfeng_cengfeng` | 层峰 | 1 | 三式按顺序命中时，后式暴击 +5/+10 |
| `ps_taiyuesanqingfeng_qijian` | 气剑相济 | 6 | 主运华山内功时三式内劲占比 +0.10，不改总伤害 |
| `ps_taiyuesanqingfeng_dacheng` | 太岳圆成 | 10 | 第三式命中后回复 5% 内力，每回合 1 次 |

### 2.5 华山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质·外/内 | `reqs`（结构化） | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_huashanjianfa` 华山剑法 | 6玄上·兵器/剑·harmony·0.75/0.25 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanrumenjian,layer:4}]; hard:[sect,prereq]` | 白云出岫 1.00；苍松迎客 0.90（`bf_shoushi` 2）；金雁横空 1.05（突进） | `set_huashan_qijian` | 《笑傲江湖》华山门人所习；分式出处**（待考）** |
| `sk_yangwujian` 养吾剑 | 6玄上·兵器/剑·yang·0.65/0.35 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashanjianfa,layer:5}]; hard:[sect,prereq]` | 养气 0（`bf_neijin_sheng`）；浩然一剑 1.15；守中 0.90（自身守势） | `set_huashan_qijian` | 《笑傲江湖》华山剑法名目；招效**（原创扩展）** |
| `sk_xiyijian` 希夷剑 | 5玄中·兵器/剑·harmony·0.80/0.20 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanrumenjian,layer:4}]; hard:[sect,prereq]` | 视之不见 1.05（命中后 `bf_polu` 30%）；听之不闻 0.90（不可反击） | — | 《笑傲江湖》华山剑招名目；细节**（待考）** |
| `sk_yunvjian19` 玉女剑十九式 | 5玄中·兵器/剑·yin·0.80/0.20 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanjianfa,layer:4}]; hard:[sect,prereq]` | 玉女投梭 1.05；弄玉吹箫 0.90（`bf_luanxin` 30%） | — | 《笑傲江湖》华山剑法；十九式与分式逐字**（待考）**，勿与古墓玉女剑混同 |
| `sk_huashanxinfa` 华山心法 | 6玄上·内功·`harmony`·0/1 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashantuna,layer:5}]; hard:[sect,prereq]` | 抱元 0（`bf_guben` 3）；气御剑 0（下一剑 `bf_ruiyi`） | `set_huashan_qijian` | **（原创扩展）**；`meridians:[mer_renmai]`；IP `20+12+2×8+5×1.8=57` |
| `sk_kuangfengkuaijian` 狂风快剑 | 6玄上·兵器/剑·neutral·0.90/0.10 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashanrumenjian,layer:5}]; hard:[sect,prereq]` | 狂风骤雨 0.95（3段）；一剑快似一剑 1.10（得 `bf_lianzhao`） | `set_huashan_qijian` | 《笑傲江湖》·剑宗封不平所使，招名与段数**（待考）** |

抽样核算（6/6 门，≥30%）：华山剑法·白云出岫 `1.00`；养吾剑·浩然一剑 `1+0.12=1.12→1.10`；希夷剑 `1+0.12−0.03=1.09→1.10`（表取1.05，−0.04）；玉女剑 `1+0.12−0.03=1.09→1.10`；华山心法两招为支援 `power 0`；狂风骤雨 `AF 0.85×(1+0.24)−0.10=0.95`。

### 2.6 华山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_huashanrumenjian` | 华山入门剑 | 华山 | 兵器/剑·3黄上 | 笑傲 | 标准刺 1.00、横削 0.85；剑资质教学 | 无 | **（原创扩展）** | `set_huashan_qijian` |
| `sk_huashanjichuquan` | 华山基础拳 | 华山 | 拳脚/拳·2黄中 | 笑傲 | 单体 1.00；招架后得 `bf_wenzhong` 1 | 无 | **（原创扩展）** | — |
| `sk_huashantuna` | 华山吐纳 | 华山 | 内功·3黄上·`harmony` | 笑傲 | 回内；`meridians:[mer_renmai]`；IP `10+6+2×4+5×1.2=30` | 无 | **（原创扩展）** | `set_huashan_qijian` |
| `sk_huashanxingbu` | 华山行步 | 华山 | 轻功·2黄中 | 笑傲 | 移动后闪避小增；`Q_skill=34`（03 §4.5） | 无 | **（原创扩展）** | — |

黄阶整体预算：标准单体、5%耗内、0冷却、1000收招为 `1.00`；4%耗内为 `1−0.05=0.95`；三格横扫带1冷却为 `0.75×1.12=0.84→0.85`。本节四门只使用这三种模板或 `power 0` 支援，全部在 ±0.05。

---

## 3. 嵩山派 `sect_songshan`

### 3.1 门派简介与总表

嵩山派以左冷禅统合五岳的政治野心为叙事核心；剑路开阔厚重，寒冰真气则是左冷禅用以反制吸星大法的关键手段。《笑傲江湖》中左冷禅、嵩山诸太保及围阻刘正风等事实可据人物确认，具体招式名与出场回目多处仍**（待考）**。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_hanbingzhenqi` 寒冰真气 |
| 玄 | `sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_songshanzhuangong` |
| 黄 | `sk_songshanrumenjian`、`sk_songyangrumenzhang`、`sk_songyangtuna`、`sk_songshanxingbu` |

### 3.2 `sk_hanbingzhenqi` 寒冰真气（9 地上 · 内功 · 嵩山）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·左冷禅以寒冰真气对任我行；少室山交手细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_songshan` / 左冷禅 |
| sourceChapters | `[ch05_xiaoao]` |
| nature / meridians | `yin` / `[mer_daimai, mer_zujueyin]`（本作冲穴专精） |
| wOut/wIn · moveSlots | `0/1` · 4 |
| reqs | `sect:{id:sect_songshan,rank:4}; prereq:[{skill:sk_songyangxinfa,layer:6},{skill:sk_songshanjianfa,layer:6}]; attrs:{con:50,wil:55}; aptitude:{apInner:50}; hard:[sect,prereq]` |
| inner.contribution | `mpMaxPct:34, hpMaxPct:20, attrs:{con:6,wil:6,wis:2}, mpRegen:2.5`；`34+20+2×14+5×2.5=94.5` |
| inner.stats | `resCold:10, effHit:5`，合计 15 |
| 层数要点 | 1 凝霜 ｜ 3 寒劲伏脉 ｜ 5 寒冰掌 ｜ 7 寒潮封岳 ｜ 8 寒冰护体 ｜ 10 冰心大成 |
| setTags / conflicts | `[set_songshan_hanbing]` / `{with:sk_xixing,type:counter}`，按 `design/06` `rx_hanbingxixing` 结算 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 左冷禅亲授或掌门密室；击败左冷禅只得 6 重残页**（原创扩展）** |
| 图鉴文本 | 阴寒真气伏于经脉，临敌骤发。原著用于反制吸星，本作把寒气叠层、冰冻与吸内反应数据化。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 凝霜劲 `mv_hanbingzhenqi_ningshuang`（原创扩展命名） | 1 | 单体·1–3·远程 | 1.05 | 8%/2/1000 | `bf_hanqi` 50%·1层 | 可 | `(1+0.24+0.05)×0.85−0.10×0.5=1.05` |
| 寒冰掌 `mv_hanbingzhenqi_hanbingzhang`（原创扩展命名） | 5 | 单体·1·近身 | 1.10 | 7%/2/1000 | `bf_hanqi` 100%·2层 | 可 | `1+0.24−0.05−0.10=1.09→1.10` |
| 冰封经脉 `mv_hanbingzhenqi_fengmai`（原创扩展命名） | 6 | 单体·1·近身 | 1.10 | 7%/2/1000 | `bf_fengnei` 50%·1 | 可 | `1+0.24−0.05−0.20×0.5=1.09→1.10` |
| **寒潮封岳** `mv_hanbingzhenqi_fengyue`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 1.75 | 9%/—/1200 | 敌方 `bf_hanqi` 100%·2层 | 可 | `3×0.65−0.20=1.75` |
| 寒冰护体 `mv_hanbingzhenqi_huti`（原创扩展命名） | 8 | 自身·支援 | 0 | 7%/3/900 | `bf_mian_han` 3；近身攻击者得寒气1层 | — | 支援招，反击强度由被动预算承担 |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_hanbingzhenqi_fuhan` | 伏寒 | 1 | 本武学造成寒气时，25% 额外 +1 层，每回合一次 |
| `ps_hanbingzhenqi_fanxi` | 寒冰反吸 | 4 | 持有 cold 护体，触发 `rx_hanbingxixing` |
| `ps_hanbingzhenqi_bingxin` | 冰心 | 10 | 自身寒气/冰冻免疫按本武学品阶参与品阶对抗 |

### 3.3 嵩山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_songshanjianfa` 嵩山剑法 | 6玄上·兵器/剑·yang | `sect:{id:sect_songshan,rank:2}; prereq:[{skill:sk_songshanrumenjian,layer:4}]; hard:[sect,prereq]` | 万岳朝宗 0.95（横扫）；开门见山 1.15（破甲40%） | `set_songshan_hanbing` | 《笑傲江湖》·嵩山太保；分式名**（原创扩展命名）** |
| `sk_songyangxinfa` 嵩阳心法 | 6玄上·内功·`yang` | `sect:{id:sect_songshan,rank:3}; prereq:[{skill:sk_songyangtuna,layer:5}]; hard:[sect,prereq]` | 嵩阳吐纳 0（回内）；峻岳护体 0（守势） | `set_songshan_hanbing` | **（原创扩展）**；`meridians:[mer_dumai]`；IP `20+12+2×8+5×1.8=57` |
| `sk_dayinyangshou` 大阴阳手 | 5玄中·拳脚/拳·harmony | `sect:{id:sect_songshan,rank:3}; prereq:[{skill:sk_songyangrumenzhang,layer:5}]; hard:[sect,prereq]` | 阴掌 1.10（寒气30%）；阳手 1.10（击退1） | `set_songshan_hanbing` | 《笑傲江湖》·乐厚号“大阴阳手”，武学是否正式具名**（待考）** |
| `sk_songshanzhuangong` 嵩山桩功 | 4玄下·拳脚/拳·yang | `sect:{id:sect_songshan,rank:2}; prereq:[{skill:sk_songyangrumenzhang,layer:4}]; hard:[sect,prereq]` | 立岳 0（`bf_wenzhong`）；撞山 1.05（击退1） | — | **（原创扩展）** |

抽样核算（4/4）：万岳朝宗 `0.75×(1+0.24+0.05)=0.97→0.95`；开门见山 `1+0.24−0.04=1.20`，取1.15（−0.05）；阴掌 `1+0.12−0.03=1.09→1.10`，正式取1.10；撞山 `1+0.12−0.05=1.07→1.05`。

### 3.4 嵩山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_songshanrumenjian` | 嵩山入门剑 | 嵩山 | 兵器/剑·3黄上 | 笑傲 | 单体1.00；横扫0.85 | 无 | **（原创扩展）** | `set_songshan_hanbing` |
| `sk_songyangrumenzhang` | 嵩阳入门掌 | 嵩山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展）** | — |
| `sk_songyangtuna` | 嵩阳吐纳 | 嵩山 | 内功·3黄上·`yang` | 笑傲 | 回内；`meridians:[mer_dumai]`；IP `10+6+8+6=30` | 无 | **（原创扩展）** | `set_songshan_hanbing` |
| `sk_songshanxingbu` | 嵩山行步 | 嵩山 | 轻功·2黄中 | 笑傲 | 上坡移动体力 −10%；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶预算同 §2.6：标准单体1.00；横扫带1冷却0.85；击退式 `1+0.12−0.05=1.07→1.05`；支援为0。

---

## 4. 泰山派 `sect_taishan`

### 4.1 门派简介与总表

泰山派以剑术、山势与方位推演见长。天门道人、玉玑子等卷入五岳并派；“岱宗如何”是本派辨位制胜的高阶剑术。人物、招名与招法解释须按《笑傲江湖》修订版复核，本文不编造回目号。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_daizongruhe` 岱宗如何 |
| 玄 | `sk_taishanjianfa`、`sk_taishan18pan`、`sk_taishanxinfa`、`sk_taishanquan` |
| 黄 | `sk_taishanrumenjian`、`sk_taishanrumenquan`、`sk_taishantuna`、`sk_shibanshanbu` |

### 4.2 `sk_daizongruhe` 岱宗如何（8 地中 · 兵器/剑 · 泰山）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·泰山派剑术“岱宗如何”，以左手推算方位、右剑制敌之意；人物与细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_taishan` / 泰山掌门秘传 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `harmony` · `0.60/0.40` · 4 |
| weaponReq | `{category:sword}` |
| reqs | `sect:{id:sect_taishan,rank:4}; prereq:[{skill:sk_taishanjianfa,layer:6}]; skills:{formation:50}; attrs:{wis:55,agi:45}; aptitude:{apSword:45}; hard:[sect,prereq]`（`formation` 为软门槛） |
| layerStats | `hit:[4,10], pierce:[1,5]`，合计 15 |
| 层数要点 | 1 望岳 ｜ 3 推位 ｜ 5 阴阳割昏晓 ｜ 7 造化钟神秀 ｜ 10 一算必中 |
| setTags / conflicts | `[set_taishan_daizong]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 泰山 L4 传授；五岳并派前护住掌门传承可得**（原创扩展）** |
| 图鉴文本 | 先推敌势与方位，再在唯一破绽落剑。诗句借名与战斗数值均为本作转译。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 岱宗夫如何 `mv_daizongruhe_dai` | 1 | 单体·1·近身 | 1.20 | 7%/2/1000 | 目标本回合已行动时可用；`bf_polu` 40% | 可 | `1+0.24+0.15−0.04=1.35`；“推算”需先用望岳标记，额外消耗收益0.15 →1.20 |
| 齐鲁青未了 `mv_daizongruhe_qilu`（原创扩展命名） | 3 | 直线2·近身 | 1.10 | 8%/2/1000 | — | 可 | `0.85×(1+0.24+0.05)=1.10` |
| 造化钟神秀 `mv_daizongruhe_zaohua`（原创扩展命名） | 5 | 自身·支援 | 0 | 6%/3/900 | `bf_jingzhun` 3 | — | 支援招 |
| **阴阳割昏晓** `mv_daizongruhe_yinyang`（绝招；诗句借名） | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_polu` 100%·2 | 可 | `3−0.10=2.90` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_daizongruhe_tuiwei` | 推位 | 1 | 待机或防御后，下一剑命中 +8→18 |
| `ps_daizongruhe_guanshi` | 观势 | 4 | 可查看敌下一行动的目标与范围预告 |
| `ps_daizongruhe_yisuan` | 一算必中 | 10 | 每战首次“岱宗夫如何”获得 `bf_bizhong` ×1 |

### 4.3 泰山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_taishanjianfa` 泰山剑法 | 6玄上·兵器/剑·harmony | `sect:{id:sect_taishan,rank:2}; prereq:[{skill:sk_taishanrumenjian,layer:4}]; hard:[sect,prereq]` | 石关回马1.00；东岳横云0.95（横扫） | `set_taishan_daizong` | 《笑傲江湖》泰山门人剑术；分式**（原创扩展命名）** |
| `sk_taishan18pan` 泰山十八盘 | 5玄中·轻功·neutral | `sect:{id:sect_taishan,rank:3}; prereq:[{skill:sk_shibanshanbu,layer:5}]; hard:[sect,prereq]` | 盘道0（连走3格得疾行）；回折0（换位） | `set_taishan_daizong` | 泰山地名借作身法，武学**（原创扩展）**；`Q_skill=62` |
| `sk_taishanxinfa` 泰山心法 | 5玄中·内功·`harmony` | `sect:{id:sect_taishan,rank:3}; prereq:[{skill:sk_taishantuna,layer:5}]; hard:[sect,prereq]` | 镇岳0（固本）；观日0（回内） | `set_taishan_daizong` | **（原创扩展）**；`meridians:[mer_zuyangming]`；IP `17+10+14+7.5=48.5` |
| `sk_taishanquan` 泰山拳 | 4玄下·拳脚/拳·yang | `sect:{id:sect_taishan,rank:2}; prereq:[{skill:sk_taishanrumenquan,layer:4}]; hard:[sect,prereq]` | 盘石1.00；落石1.05（击退1） | — | **（原创扩展）** |

抽样核算（4/4）：石关回马1.00；东岳横云 `.75×1.24=.93→.95`；两门支援0；盘石1.00；落石 `1+.12−.05=1.07→1.05`。

### 4.4 泰山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_taishanrumenjian` | 泰山入门剑 | 泰山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；横削0.85 | 无 | **（原创扩展）** | `set_taishan_daizong` |
| `sk_taishanrumenquan` | 泰山入门拳 | 泰山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；守势 | 无 | **（原创扩展）** | — |
| `sk_taishantuna` | 泰山吐纳 | 泰山 | 内功·3黄上·`harmony` | 笑傲 | 回内；`meridians:[mer_zuyangming]`；IP30 | 无 | **（原创扩展）** | `set_taishan_daizong` |
| `sk_shibanshanbu` | 石坂山步 | 泰山 | 轻功·2黄中 | 笑傲 | 山路移动体力−10%；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶整体采用标准单体1.00、横扫带1冷却0.85与支援0模板，预算误差均≤0.02。

---

## 5. 衡山派（南岳）`sect_hengshan_nan` 与琴箫传承

### 5.1 门派简介与总表

南岳衡山以刘正风、莫大先生为代表；剑法多取云雾变化，琴音亦与人物形象相连。刘正风与日月神教曲洋以音乐相知并合奏《笑傲江湖》曲，是跨阵营套装的叙事中心。具体曲谱来源、莫大招式和剑法名录仍**（待考）**。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_baibianqianhuan` 百变千幻衡山云雾十三式、`sk_hengshanyunwubu` 衡山云雾步 |
| 玄 | `sk_huifengluoyan`、`sk_hengshanwushenjian`、`sk_hengshanxinfa`、`sk_xiaoaojianghuqu` |
| 黄 | `sk_hengshanrumenjian`、`sk_hengshanrumenzhang`、`sk_hengshantuna`、`sk_hengshanqingbu` |

### 5.2 `sk_baibianqianhuan` 百变千幻衡山云雾十三式（8 地中 · 兵器/剑）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·衡山掌门莫大先生的剑术；全名、十三式与使用情节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_hengshan_nan` / 莫大先生 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.75/0.25` · 4 |
| weaponReq | `{category:sword}` |
| reqs | `sect:{id:sect_hengshan_nan,rank:4}; prereq:[{skill:sk_huifengluoyan,layer:6}]; attrs:{agi:50,wis:45}; aptitude:{apSword:45}; hard:[sect,prereq]` |
| layerStats | `eva:[3,9], crit:[2,6]`，合计15 |
| 层数要点 | 1 云起 ｜ 3 雾合 ｜ 5 百变 ｜ 7 云雾十三式 ｜ 10 曲尽剑藏 |
| setTags / conflicts | `[set_hengshan_yunwu, set_xiaoao_qinxiao]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 衡山 L4；莫大好感传授；刘正风遗谱支线至 8 重**（原创扩展）** |
| 图鉴文本 | 剑从琴声般悠忽起落，云遮雾绕、难辨来处。招式表现与数值为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 云起 `mv_baibianqianhuan_yunqi`（原创扩展命名） | 1 | 单体·1·近身 | 0.95 | 7%/1/900 | 命中后自身 `bf_piaohu` 2 | 可 | `1+0.12−0.07−0.10=0.95` |
| 雾合 `mv_baibianqianhuan_wuhe`（原创扩展命名） | 3 | 锥形2·近身 | 0.95 | 8%/2/1000 | `bf_polu` 40% | 可 | `.75×(1+.24+.05)−.04=.93→.95` |
| 百变 `mv_baibianqianhuan_baibian`（原创扩展命名） | 5 | 绕背·1–2 | 1.00 | 8%/2/1000 | 绕背；`bf_luanxin` 30% | 可 | `.90×1.29−.15−.03=.98→1.00` |
| **云雾十三式** `mv_baibianqianhuan_shisanshi`（绝招） | 7 | 乱击6·半径2 | 2.30 | 9%/—/1200 | 6段随机；自身 `bf_piaohu` 2 | 可 | `3×.85−.20=2.35` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_baibianqianhuan_yunying` | 云影 | 1 | 每回合首次移动≥2格，自身闪避+6→12至下回合 |
| `ps_baibianqianhuan_baibian` | 百变 | 5 | 连续使用不同范围模板时第二招 Z3+10% |
| `ps_baibianqianhuan_qujin` | 曲尽 | 10 | 绝招结束若未击倒目标，获得 `bf_dunzou` 1 |

### 5.3 `sk_xiaoaojianghuqu` 《笑傲江湖》曲谱（6 玄上 · 杂学/音律重点紧凑卡）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·刘正风与曲洋合奏并传下琴箫曲谱；曲谱形成过程和名称细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `null` / 刘正风 × 曲洋 → 令狐冲、任盈盈所持曲谱 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `harmony` · `0.20/0.80` · 3 |
| reqs | `skills:{music:50}; prereq:[{anyOf:[{skill:sk_hengshanxinfa,layer:5},{skill:sk_riyuexinfa,layer:5}]}]; attrs:{wil:45,cha:40}; hard:[prereq]`（music为软门槛） |
| layerStats | `resMind:[2,6], effHit:[1,4]`，合计10 |
| 层数要点 | 1 琴箫谱 ｜ 3 清音 ｜ 5 合奏 ｜ 7 天地同声 ｜ 10 笑傲江湖 |
| setTags / conflicts | `[set_xiaoao_qinxiao]` / 无 |
| special / observable | `{fusible:false, optionalCombo:true}` / `false` |
| learnSources | 金盆洗手改命线取得完整谱；原著线遗谱最多 8 重；任盈盈指点可补足**（原创扩展）** |
| 图鉴文本 | 一谱横跨正邪，琴箫各可独奏；两名角色合奏只追加节奏奖励，不是施放本武学的必要条件。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 清音 `mv_xiaoaojianghuqu_qingyin`（原创扩展命名） | 1 | 友方半径2·支援 | 0 | 6%/2/900 | `bf_dingxin` 3 | — | 支援招 |
| 沧海和声 `mv_xiaoaojianghuqu_he`（原创扩展命名） | 3 | 锥形2·远程音功 | 0.60 | 7%/2/1000 | `bf_dongyao` 50% | 否 | `.75×(1+.24)×.85×.85−.05=.62→.60`；音律技艺增幅另算 |
| 琴箫合奏 `mv_xiaoaojianghuqu_hezuo`（原创扩展命名） | 5 | 全体友方·支援 | 0 | 7%/3/1000 | `bf_ruiyi` 2、`bf_dingxin` 2；双人时持续+1 | — | 支援；双人只是可选强化 |
| **天地同声** `mv_xiaoaojianghuqu_tongsheng`（绝招，原创扩展命名） | 7 | 全场敌方·远程音功 | 0.60 | 9%/—/1200 | `bf_dongyao` 100%、`bf_luanxin` 40% | 否 | `3×.35×.85×.85−.10−.04=.62→.60` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_xiaoaojianghuqu_zhiyin` | 知音 | 1 | 3格内另一角色也装配本武学时，双方音律效果命中+10 |
| `ps_xiaoaojianghuqu_wenxin` | 问心 | 5 | 清音额外驱散1个 `mind` 减益 |
| `ps_xiaoaojianghuqu_xiaoao` | 笑傲 | 10 | 每战首次受控制时以本品阶进行一次自动驱散 |

### 5.4 `sk_hengshanyunwubu` 衡山云雾步（8 地中 · 轻功 · 衡山）

| 字段 | 值 |
|---|---|
| 出处 | 以衡山剑路的云雾意象与莫大轻灵身法扩展，武学名及招式均**（原创扩展命名）** |
| origin / sect / lineage | `expanded` / `sect_hengshan_nan` / 衡山掌门一脉 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `neutral` · `0.30/0.70` · 4 |
| reqs | `sect:{id:sect_hengshan_nan,rank:4}; prereq:[{skill:sk_hengshanqingbu,layer:5},{skill:sk_huifengluoyan,layer:5}]; attrs:{agi:50}; aptitude:{apLight:45}; hard:[sect,prereq]` |
| layerStats / Q_skill | `eva:[4,10], spd:[1,5]`，合计15；`Q_skill=96`（地中，符合笑傲最高原生轻功地中） |
| 层数要点 | 1 入雾 ｜ 3 回峰 ｜ 5 云隐 ｜ 7 雾锁千山 ｜ 10 云开 |
| setTags / conflicts | `[set_hengshan_yunwu]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 衡山 L4；莫大指点；金盆洗手改命线保住传承可得 |
| 图鉴文本 | （原创扩展）借山岚遮形、借回峰转步，是笑傲书界可习得的最高阶轻功。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 入雾 `mv_hengshanyunwubu_ruwu` | 1 | 自身·移动≤3 | 0 | 5%/2/800 | 移动后 `bf_piaohu` 2 | — | 移动/支援，不进伤害公式 |
| 回峰 `mv_hengshanyunwubu_huifeng` | 3 | 与2格内单位换位 | 0 | 7%/3/900 | 合法空位换位 | — | 位移招，不进伤害公式 |
| 云隐 `mv_hengshanyunwubu_yunying` | 5 | 自身·架势 | 0 | 7%/3/800 | `bf_yinshen` 1；主动攻击即解除 | — | 架势招 |
| **雾锁千山** `mv_hengshanyunwubu_wusuo`（绝招） | 7 | 友方半径2·支援 | 0 | 9%/—/1200 | 友方 `bf_piaohu` 2、`bf_dunzou` 1 | — | 轻功支援绝招，无伤害倍率 |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_hengshanyunwubu_yunxing` | 云行 | 1 | 每回合第一次转向不消耗移动点 |
| `ps_hengshanyunwubu_wuying` | 雾影 | 5 | 进入遮蔽地形后获得 `bf_piaohu` 1 |
| `ps_hengshanyunwubu_yunkai` | 云开 | 10 | 回峰后双方各获得 `bf_jixing` 1 |

### 5.5 衡山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_huifengluoyan` 回风落雁剑 | 6玄上·兵器/剑·yin | `sect:{id:sect_hengshan_nan,rank:3}; prereq:[{skill:sk_hengshanrumenjian,layer:4}]; hard:[sect,prereq]` | 回风0.95（绕背）；落雁1.25（目标低血时+条件） | `set_hengshan_yunwu` | 《笑傲江湖》·衡山剑法，招式细节**（待考）** |
| `sk_hengshanwushenjian` 衡山五神剑 | 5玄中·兵器/剑·harmony | `sect:{id:sect_hengshan_nan,rank:3}; prereq:[{skill:sk_hengshanrumenjian,layer:5}]; hard:[sect,prereq]` | 祝融剑1.00；芙蓉剑0.95（直线2） | `set_hengshan_yunwu` | 《笑傲江湖》衡山剑法名目；五式细目**（待考）** |
| `sk_hengshanxinfa` 衡山心法 | 5玄中·内功·`yin` | `sect:{id:sect_hengshan_nan,rank:2}; prereq:[{skill:sk_hengshantuna,layer:5}]; hard:[sect,prereq]` | 抚弦调息0（回内）；云心0（飘忽） | `set_hengshan_yunwu` | **（原创扩展）**；`meridians:[mer_shoushaoyin]`；IP48.5 |
抽样核算（4/4，含 §5.3 重点紧凑卡）：回风 `AF.90×(1+.24)−.15=.97→.95`；落雁 `1+.12+.15=1.27→1.25`（须目标低血）；祝融1.00；芙蓉 `.85×1.12=.95`；衡山心法为支援0；《笑傲江湖》曲谱的伤害招见 §5.3 逐招核算。

### 5.6 衡山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_hengshanrumenjian` | 衡山入门剑 | 南衡山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；回削0.95 | 无 | **（原创扩展）** | `set_hengshan_yunwu` |
| `sk_hengshanrumenzhang` | 衡山入门掌 | 南衡山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展）** | — |
| `sk_hengshantuna` | 衡山吐纳 | 南衡山 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_shoushaoyin]`；IP30 | 无 | **（原创扩展）** | `set_hengshan_yunwu` |
| `sk_hengshanqingbu` | 衡山轻步 | 南衡山 | 轻功·2黄中 | 笑傲 | 移动2格后闪避+3；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶均用标准单体、击退式或支援模板，整体预算误差≤0.03。

---

## 6. 恒山派（北岳）`sect_hengshan_bei`

### 6.1 门派简介与总表

北岳恒山派剑法绵密、重守护与慈悲；定闲、定静、定逸及仪琳等人物见《笑傲江湖》。本作允许玩家进入统一五级职级，但尼僧/俗家称谓映射留给 `design/17`，不在图鉴替其定宗教制度。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_wanhuajianfa` 万花剑法 |
| 玄 | `sk_hengshanbeijianfa`、`sk_tianchangzhangfa`、`sk_hengshanbeixinfa`、`sk_hengshanbeishenfa` |
| 黄 | `sk_hengshanbeirumenjian`、`sk_hengshanbeirumenquan`、`sk_hengshanbeituna`、`sk_hengshanbeibu` |

### 6.2 `sk_wanhuajianfa` 万花剑法（7 地下 · 兵器/剑 · 恒山）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·恒山派剑术；“万花”正式名称、使用者与招路**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_hengshan_bei` / 恒山掌门一脉 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.65/0.35` · 4 |
| weaponReq | `{category:sword}` |
| reqs | `sect:{id:sect_hengshan_bei,rank:4}; prereq:[{skill:sk_hengshanbeijianfa,layer:6}]; attrs:{agi:45,wil:45}; aptitude:{apSword:40}; morality:{min:10}; hard:[sect,prereq,morality]` |
| layerStats | `parry:[4,10], healRecv:[1,5]`，合计15 |
| 层数要点 | 1 花开 ｜ 3 护蕊 ｜ 5 落英 ｜ 7 万花护生 ｜ 10 剑阵如莲 |
| setTags / conflicts | `[set_hengshan_cibei]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 恒山 L4；救援定闲/定静支线；观摩上限6 |
| 图鉴文本 | 剑光层叠如花，先封门户、再护同伴。名称**（待考）**，护生机制为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 花开并蒂 `mv_wanhuajianfa_bingdi`（原创扩展命名） | 1 | 单体·1·2段 | 1.10 | 7%/1/1000 | — | 可 | `1+0.12=1.12→1.10` |
| 护蕊 `mv_wanhuajianfa_hurui`（原创扩展命名） | 3 | 相邻友方·支援 | 0 | 6%/2/900 | 友方 `bf_yuanhu` 2 | — | 支援招 |
| 落英 `mv_wanhuajianfa_luoying`（原创扩展命名） | 5 | 横扫·近身 | 0.95 | 8%/2/1000 | `bf_polu` 40% | 可 | `.75×(1+.24+.05)−.04=.93→.95` |
| **万花护生** `mv_wanhuajianfa_husheng`（绝招，原创扩展命名） | 7 | 周身·近身 | 1.80 | 9%/—/1200 | 友方 `bf_shoushi` 2 | 可 | `3×.65−.15=1.80` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_wanhuajianfa_cibei` | 慈悲 | 1 | 对气血低于30%的敌人不增伤；改为命中+10并允许“点到为止”非致命 |
| `ps_wanhuajianfa_huachi` | 护持 | 5 | 相邻友方受击后自身下一剑收招−100，每回合1次 |
| `ps_wanhuajianfa_lianxin` | 莲心 | 10 | 援护触发后自身获得 `bf_dingxin` 2 |

### 6.3 恒山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_hengshanbeijianfa` 恒山剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_hengshan_bei,rank:3}; prereq:[{skill:sk_hengshanbeirumenjian,layer:4}]; hard:[sect,prereq]` | 绵针1.00；守门户0.90（自身守势） | `set_hengshan_cibei` | 《笑傲江湖》恒山群尼剑术；分式**（原创扩展命名）** |
| `sk_tianchangzhangfa` 天长掌法 | 5玄中·拳脚/拳·harmony | `sect:{id:sect_hengshan_bei,rank:3}; prereq:[{skill:sk_hengshanbeirumenquan,layer:5}]; hard:[sect,prereq]` | 天长1.10；地久1.10（虚弱30%） | `set_hengshan_cibei` | 《笑傲江湖》恒山掌法名目**（待考）** |
| `sk_hengshanbeixinfa` 恒山心法 | 5玄中·内功·`harmony` | `sect:{id:sect_hengshan_bei,rank:2}; prereq:[{skill:sk_hengshanbeituna,layer:5}]; hard:[sect,prereq]` | 慈航0（回春）；守心0（定心） | `set_hengshan_cibei` | **（原创扩展）**；`meridians:[mer_shoutaiyin]`；IP48.5 |
| `sk_hengshanbeishenfa` 恒山身法 | 4玄下·轻功·neutral | `sect:{id:sect_hengshan_bei,rank:2}; prereq:[{skill:sk_hengshanbeibu,layer:5}]; hard:[sect,prereq]` | 回廊0（换位）；护阵0（友方援护） | — | **（原创扩展）**；`Q_skill=52` |

抽样核算（4/4）：绵针1.00；守门户为攻击 `1−0.10=0.90`；天长 `1+0.12=1.12→1.10`；地久 `1+0.12−.03=1.09→1.10`；内功与轻功支援为0。

### 6.4 恒山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_hengshanbeirumenjian` | 恒山入门剑 | 北恒山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；守式0.90 | 无 | **（原创扩展）** | `set_hengshan_cibei` |
| `sk_hengshanbeirumenquan` | 恒山入门拳 | 北恒山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；非致命收招 | 无 | **（原创扩展）** | — |
| `sk_hengshanbeituna` | 恒山吐纳 | 北恒山 | 内功·3黄上·`harmony` | 笑傲 | 回内；`meridians:[mer_shoutaiyin]`；IP30 | 无 | **（原创扩展）** | `set_hengshan_cibei` |
| `sk_hengshanbeibu` | 恒山步 | 北恒山 | 轻功·2黄中 | 笑傲 | 相邻友方多时闪避+3；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶整体预算沿 §2.6；守式按自身增益成本0.10由标准1.00降至0.90，其他攻击均为1.00，支援为0。

---

## 7. 日月神教 `sect_riyue` 与梅庄四友

### 7.1 门派简介与总表

日月神教以黑木崖为总坛，任我行、东方不败先后掌权；向问天、任盈盈及梅庄四友构成不同传承入口。本文不采纳“由明教直接演变而来”的推论；`design/02` 仅把相关残页作为彩蛋。梅庄四友仍是 `sect_riyue` 的 `branch:meizhuang`，琴棋书画只作技艺门槛。

| 大阶 | 条目 |
|---|---|
| 天 | `sk_xixing` 吸星大法、`sk_kuihua` 葵花宝典 |
| 地 | `sk_heimuyajianfa` 黑木崖剑法、`sk_qixianwuxingjian` 七弦无形剑 |
| 玄 | `sk_riyuejianfa`、`sk_riyuexinfa`、`sk_shigudaxuebi`、`sk_pomopimajian`、`sk_xuantianzhi` |
| 黄 | `sk_heimuyarumenjian`、`sk_riyuejichuquan`、`sk_heimutuna`、`sk_shenjiaobu` |

### 7.2 `sk_xixing` 吸星大法（11 天中 · 内功 · 日月神教）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·任我行、令狐冲；吸取异种真气而受反噬，方证提出以易筋经化解。具体来历与新版表述**（待考）** |
| origin / sect / lineage | `canon` / `sect_riyue` / 任我行 → 令狐冲 |
| sourceChapters | `[ch05_xiaoao]` |
| nature / meridians | `yin` / `[mer_chongmai, mer_daimai]`（本作冲穴专精） |
| wOut/wIn · moveSlots | `0/1` · 5 |
| reqs | `sect:{id:sect_riyue,rank:4}; attrs:{con:55,wil:60}; aptitude:{apInner:55}; prereq:[{skill:sk_riyuexinfa,layer:6}]; morality:{max:50}; hard:[sect,prereq]`；梅庄铁板来源以 `reqsOverride:{sect:null}` 删除门派身份，不删除前置 |
| inner.contribution | `mpMaxPct:48, hpMaxPct:29, attrs:{con:8,wil:8,wis:5}, mpRegen:3.3`；`48+29+2×21+5×3.3=135.5` |
| inner.stats | `effHit:10, resInjury:10`，合计20（天阶上限） |
| 层数要点 | 1 吸星真气 ｜ 3 吸星 ｜ 5 反吸 ｜ 7 万流归海 ｜ 8 异种化解 ｜ 10 任脉归流 |
| setTags / conflicts | `[set_riyue_heimu, set_renwoxing]` / `sk_yijinjing counter`；北冥主运为 `synergy`，见 05 §9.1.3 |
| special / observable | `{cost:yizhongZhenqi,fusible:false}` / `false` |
| learnSources | 梅庄湖底铁板刻文 `maxLayer:10, reqsOverride:{sect:null}`；任我行传授 `maxLayer:10`；仅偷看交战不得观摩 |
| 图鉴文本 | 夺取敌内力为己用，爆发强而异种真气渐积。反噬、易筋化解和北冥相生完全引用 `design/05` §9.1.3。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 吸星 `mv_xixing_xixing` | 3 | 单体·1·近身 | 1.10 | 8%/2/1000 | 吸内=伤害30%；装配时得 `bf_xixing` | 可 | `1+0.24−0.15=1.09→1.10` |
| 反吸 `mv_xixing_fanxi`（原创扩展命名） | 5 | 自身·架势 | 0 | 7%/2/900 | 2回合强化受击反吸；仍产生异种真气 | — | 架势，不进入伤害公式 |
| 散功 `mv_xixing_sangong`（原创扩展命名） | 6 | 单体·1·近身 | 1.05 | 8%/2/1000 | 吸内；`bf_xuruo` 50% | 可 | `1+0.24−0.15−0.05=1.04→1.05` |
| **万流归海** `mv_xixing_wanliu`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 1.80 | 10%/—/1200 | 每个命中目标各吸内，合计受单招上限 | 可 | `3×0.65−0.15=1.80` |
| 运功化解 `mv_xixing_huajie` | 8 | 自身·支援 | 0 | 10%/3/1000 | 移除3层 `bf_yizhongzhenqi` | — | 05 §9.1.3 固定行动 |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_xixing_duo` | 夺 | 1 | 主运/辅运时常驻 `bf_xixing`；辅运吸取量按 `auxRatio` |
| `ps_xixing_fanxi` | 反吸 | 5 | 被拳脚或内劲占比≥0.5的近身招式命中，吸取攻方3% mpMax |
| `ps_xixing_yizhong` | 异种真气 | 5 | 每累计吸取自身mpMax 5%，获得 `bf_yizhongzhenqi` 1层 |
| `ps_xixing_guiyuan` | 归流 | 10 | 主动化解额外移除2层；不取消阈值反噬 |

### 7.3 `sk_kuihua` 葵花宝典（11 天中 · 内功 · 日月神教）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·前朝太监所著，东方不败修习；华山所得残篇与林远图辟邪传承关系见原著。秘籍首句与年代**（待考）** |
| origin / sect / lineage | `canon` / `sect_riyue` / 前朝宫中传本 → 日月神教 → 东方不败 |
| sourceChapters | `[ch05_xiaoao]` |
| nature / meridians | `yin` / `[mer_chongmai, mer_dumai]`（本作冲穴专精） |
| wOut/wIn · moveSlots | `0/1` · 5 |
| reqs | `vow:vow_duanchen; attrs:{agi:65,wil:55}; aptitude:{apInner:55}; hard:[vow]` |
| inner.contribution | `mpMaxPct:48, hpMaxPct:29, attrs:{agi:10,wis:6,wil:5}, mpRegen:3.3`；`48+29+42+16.5=135.5` |
| inner.stats | `spd:12, eva:8`，合计20 |
| 层数要点 | 1 葵花真气 ｜ 3 飞针 ｜ 4 鬼魅 ｜ 6 刺目 ｜ 7 万针归宗 ｜ 9 针剑相通 ｜ 10 葵花极速 |
| setTags / conflicts | `[set_riyue_heimu, set_dongfang_kuihua, set_linjia_bixie]` / 与 `sk_bixie` 同源但不互斥，套装只计一个核心阈值 |
| special / observable | `{vowGate:vow_duanchen,fusible:false}` / `false` |
| learnSources | 黑木崖秘库；东方不败剧情路线只可在终盘取得；必须先完成 05 §9.1.4 的冷静期与二次确认 |
| 图鉴文本 | 以极快身法与飞针压制战场。永久代价、表现尺度与断尘之誓只引用 `design/05` §9.1.4。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 飞针 `mv_kuihua_feizhen` | 3 | 连锁3·1–5·投射 | 0.90/首跳 | 8%/2/1000 | `bf_shimang` 30%；后跳×0.8 | 可 | `.80×(1+.24)×.92−.03=.88→.90` |
| 鬼魅行 `mv_kuihua_guimei`（原创扩展命名） | 4 | 自身·位移 | 0 | 7%/3/800 | 移至6格内合法格；得 `bf_canying` 2层 | — | 位移/增益招，不计伤害 |
| 刺目 `mv_kuihua_cimu` | 6 | 单体·1·近身 | 1.30 | 8%/4/1000 | 目标无相邻友方时可用；`bf_shimang` 100%·2 | 否 | `(1+.48+.15)×.85−.10=1.29→1.30` |
| **万针归宗** `mv_kuihua_wanzhen`（绝招，原创扩展命名） | 7 | 连锁5·1–5·投射 | 2.15/首跳 | 10%/—/1200 | `bf_shimang` 30%、`bf_fengxue` 15%；后跳×0.8 | 可 | `3×.80×.92−.03−.03=2.15` |

> 东方不败 Boss 若需更高倍率，应由 `design/09` 的遭遇脚本定稿，不反写武学通用数据。

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_kuihua_guimei` | 鬼魅身法 | 1 | 每回合首次移动≥3格，获得 `bf_canying` 1层 |
| `ps_kuihua_lianzhen` | 连针 | 4 | 飞针首跳暴击后，下一跳不衰减一次 |
| `ps_kuihua_yizhen` | 以针代剑 | 9 | 持 `eq_xiuhuazhen` 时剑类招式可用，倍率×0.95（见 `design/10` §3.2） |
| `ps_kuihua_jisu` | 葵花极速 | 10 | 战斗开始获 `bf_xianji`；每战仅一次 |

### 7.4 `sk_heimuyajianfa` 黑木崖剑法（7 地下 · 兵器/剑 · 日月神教）

| 字段 | 值 |
|---|---|
| 出处 | **（原创扩展）**；以日月神教教众与黑木崖地形为创作依据，不声称原著有此武学名 |
| origin / sect / lineage | `expanded` / `sect_riyue` / 黑木崖教习 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.75/0.25` · 4 |
| weaponReq | `{category:sword}` |
| reqs | `sect:{id:sect_riyue,rank:4}; prereq:[{skill:sk_riyuejianfa,layer:6},{skill:sk_riyuexinfa,layer:6}]; attrs:{agi:45,wil:40}; aptitude:{apSword:40}; hard:[sect,prereq]` |
| layerStats | `hit:[3,9], eva:[2,6]`，合计15 |
| 层数要点 | 1 崖影 ｜ 3 令旗 ｜ 5 夜袭 ｜ 7 黑木凌空 ｜ 10 十丈崖风 |
| setTags / conflicts | `[set_riyue_heimu]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 日月 L4；黑木崖守卫统领；密道残页最多6重 |
| 图鉴文本 | （原创扩展）借索道、峭壁与令旗节奏形成的教中剑路，善突进与截断退路。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 崖影突 `mv_heimuyajianfa_yatu` | 1 | 突进3·近身 | 1.15 | 7%/2/1000 | 突进 | 可 | `1+0.24−0.10=1.14→1.15` |
| 令旗断路 `mv_heimuyajianfa_duanlu` | 3 | 直线2·近身 | 1.05 | 8%/2/1000 | `bf_chihuan` 50% | 可 | `.85×1.29−.05=1.05` |
| 夜袭黑木 `mv_heimuyajianfa_yexi` | 5 | 绕背·1–2 | 1.00 | 8%/2/1000 | 绕背 | 可 | `.90×1.29−.15=1.01→1.00` |
| **黑木凌空** `mv_heimuyajianfa_lingkong`（绝招） | 7 | 跳斩·1–4 | 2.50 | 9%/—/1200 | 跳斩；`bf_polu` 100% | 可 | `3×.90−.10−.10=2.50` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_heimuyajianfa_yashi` | 崖势 | 1 | 站在高于目标的格子，本武学 Z3+6→12% |
| `ps_heimuyajianfa_jiehou` | 截后 | 5 | 绕背命中附加 `bf_chihuan` |
| `ps_heimuyajianfa_lingkong` | 凌空 | 10 | 跳斩不触发控制区，落点获 `bf_piaohu` 1 |

### 7.5 `sk_qixianwuxingjian` 七弦无形剑（8 地中 · 杂学/音功 · 梅庄）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·梅庄黄钟公以琴音对敌；“七弦无形剑”为其武学，曲目与交手细节**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_riyue` (`branch:meizhuang`) / 黄钟公 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.20/0.80` · 4 |
| reqs | `skills:{music:60}; prereq:[{skill:sk_heimutuna,layer:4}]; attrs:{wil:50,wis:45}; hard:[prereq]`（music为软门槛） |
| layerStats | `effHit:[4,10], resMind:[1,5]`，合计15 |
| 层数要点 | 1 泛音 ｜ 3 乱弦 ｜ 5 无形剑气 ｜ 7 七弦齐鸣 ｜ 10 希声 |
| setTags / conflicts | `[set_meizhuang_siyou, set_xiaoao_qinxiao]` / 无 |
| special / observable | `{fusible:false, equipSynergy:eq_qixianqin}` / `true` |
| learnSources | 黄钟公以《广陵散》相易的支线；梅庄破关后高好感传授；观摩至6重 |
| 图鉴文本 | 琴音催发内劲，弦响而剑气无形。装备七弦琴时按 `design/10` 增强音律效果。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 泛音 `mv_qixianwuxingjian_fanyin`（原创扩展命名） | 1 | 直线3·远程音功 | 0.70 | 7%/2/1000 | — | 否 | `.80×(1+.24)×.85×.85=.72→.70` |
| 乱弦 `mv_qixianwuxingjian_luanxian`（原创扩展命名） | 3 | 锥形2·远程音功 | 0.65 | 8%/2/1000 | `bf_luanxin` 40% | 否 | `.75×1.29×.85×.85−.04=.66→.65` |
| 无形剑气 `mv_qixianwuxingjian_wuxing` | 5 | 单体·1–5·远程音功 | 0.95 | 8%/2/1000 | 无视视线外的软掩体，不穿墙 | 否 | `1×1.29×.85×.85=.93→.95` |
| **七弦齐鸣** `mv_qixianwuxingjian_qiming`（绝招，原创扩展命名） | 7 | 全场敌方·音功 | 0.65 | 9%/—/1200 | `bf_dongyao` 100% | 否 | `3×.35×.85×.85−.10=.66→.65` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_qixianwuxingjian_wuxing` | 无形 | 1 | 音功不受普通兵器招架；仍可被音功/护体反制 |
| `ps_qixianwuxingjian_zhiyin` | 知音 | 5 | `music≥70` 时效果命中+10 |
| `ps_qixianwuxingjian_xisheng` | 希声 | 10 | 每战首次音功被抵抗时返还50%内力并得 `bf_jingzhun` 2 |

### 7.6 日月 / 梅庄玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_riyuejianfa` 日月剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_riyue,rank:2}; prereq:[{skill:sk_heimuyarumenjian,layer:4}]; hard:[sect,prereq]` | 日升1.10；月落1.10（破绽40%） | `set_riyue_heimu` | **（原创扩展）** |
| `sk_riyuexinfa` 日月心法 | 6玄上·内功·`yin` | `sect:{id:sect_riyue,rank:2}; prereq:[{skill:sk_heimutuna,layer:5}]; hard:[sect,prereq]` | 黑木运气0（回内）；日月同辉0（内劲提升） | `[set_riyue_heimu, set_renwoxing]` | **（原创扩展）**；`meridians:[mer_chongmai]`；IP57 |
| `sk_shigudaxuebi` 石鼓打穴笔法 | 5玄中·兵器/奇门（笔）·harmony | `skills:{art:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 落笔1.00；石鼓文0.95（点穴30%） | `set_meizhuang_siyou` | 《笑傲江湖》·秃笔翁以书法入武；正式名与字帖细节**（待考）** |
| `sk_pomopimajian` 泼墨披麻剑法 | 5玄中·兵器/剑·neutral | `skills:{art:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 泼墨0.95（横扫）；披麻1.00（连招） | `set_meizhuang_siyou` | 《笑傲江湖》·丹青生剑法；招式细目**（待考）** |
| `sk_xuantianzhi` 玄天指 | 5玄中·拳脚/指·yin | `skills:{chess:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 落子1.00；封眼0.95（封穴30%） | `set_meizhuang_siyou` | 《笑傲江湖》·黑白子武学；正式名与交手细节**（待考）** |

抽样核算（5/5）：日升 `1+.12=1.12→1.10`；月落 `1+.12−.04=1.08→1.10`（正式取1.10）；心法支援0；落笔1.00；石鼓文 `1−.20×.3=.94→.95`；泼墨 `.75×1.24=.93→.95`；披麻 `1+.12−.10=1.02→1.00`；封眼 `.94→.95`。

### 7.7 日月黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_heimuyarumenjian` | 黑木崖入门剑 | 日月 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；追击式0.90 | 无 | **（原创扩展）** | `set_riyue_heimu` |
| `sk_riyuejichuquan` | 日月基础拳 | 日月 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；低血时命中+3 | 无 | **（原创扩展）** | — |
| `sk_heimutuna` | 黑木吐纳 | 日月 / 梅庄 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_chongmai]`；IP30 | 无 | **（原创扩展）** | `set_riyue_heimu`、`set_meizhuang_siyou` |
| `sk_shenjiaobu` | 神教步 | 日月 | 轻功·2黄中 | 笑傲 | 撤退成功率+5%；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶整体采用标准单体1.00、带自身小增益0.90和支援0模板，预算误差≤0.03。

---

## 8. 福威镖局、林家与辟邪传承 `sect_fuwei`

### 8.1 传承简介与总表

福威镖局林家以辟邪剑法扬名，林平之所学家传剑法只有形而未得真传；袈裟所载真谱引来青城等势力觊觎。本文将日常镖局武艺与辟邪孤本分开：加入镖局可以走黄→玄→地链，但不能靠职位绕过断尘之誓。

| 大阶 | 条目 |
|---|---|
| 天 | `sk_bixie` 辟邪剑法 |
| 地 | `sk_fantianzhang` 翻天掌 |
| 玄 | `sk_linjiajianfa`、`sk_linjiashou` |
| 黄 | `sk_linjiarumenjian`、`sk_linjiarumenquan`、`sk_biaojuxinfa`、`sk_tangzibu` |

### 8.2 `sk_bixie` 辟邪剑法（10 天下 · 兵器/剑 · 林家）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·林远图据葵花残篇创辟邪剑法，真谱写于袈裟；林平之、岳不群后修成。源流与引文逐字**（待考）** |
| origin / sect / lineage | `canon` / `sect_fuwei` / 渡元禅师（林远图）→ 林家；袈裟真谱 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.55/0.45` · 5 |
| weaponReq | `{category:sword}` |
| reqs | `vow:vow_duanchen; attrs:{agi:60,wil:50}; aptitude:{apSword:50}; prereq:[{skill:sk_linjiajianfa,layer:5}]; hard:[vow,prereq]`；无誓约仅按05“有形无实”降为5品/5重 |
| layerStats | `spd:[5,15], crit:[1,5]`，合计20 |
| 层数要点 | 1 流星赶月 ｜ 3 花开见佛 ｜ 5 飞燕穿柳 ｜ 7 群邪辟易 ｜ 9 鬼魅 ｜ 10 七十二路归一 |
| setTags / conflicts | `[set_linjia_bixie, set_dongfang_kuihua]` / 与 `sk_kuihua` 同源；不额外叠两份断尘代价 |
| special / observable | `{vowGate:{vow:vow_duanchen,without:{gradeOverride:5,layerCap:5}},fusible:false}` / `false` |
| learnSources | 林家老宅袈裟真谱；岳不群/林平之相关剧情仅在符合路线时取得；林家口传只解锁有形无实版 |
| 图鉴文本 | 七十二路快剑以诡速取胜。无誓约者只得招形，完整代价与表现边界见 `design/05` §9.1.4。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 流星赶月 `mv_bixie_liuxingganyue` | 1 | 突进3·近身 | 0.85 | 8%/1/900 | 突进；自身 `bf_lianzhao` ×1 | 可 | `1+.12−.07−.10−.10=.85` |
| 花开见佛 `mv_bixie_huakaijianfo` | 3 | 单体·1·3段 | 1.20 | 9%/2/900 | `bf_polu` 40% | 可 | `1+.24+.05−.07−.04=1.18→1.20` |
| 飞燕穿柳 `mv_bixie_feiyanchuanliu` | 5 | 直线3·近身 | 0.85 | 9%/2/900 | 穿过首个目标后停至空格 | 可 | `.80×1.29−.07−.10=.86→.85` |
| **群邪辟易** `mv_bixie_qunxie`（绝招） | 7 | 乱击6·半径2 | 2.10 | 10%/—/1200 | 自身 `bf_lianzhao` ×1 | 否 | `3×.85×.85−.10=2.07→2.10` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_bixie_guimei` | 鬼魅 | 1 | 每行动使用不同辟邪招式，下一招收招−50，最低800 |
| `ps_bixie_lianzhao` | 连环 | 4 | 消耗 `bf_lianzhao` 时追加段由0.5提高到0.6 |
| `ps_bixie_bixie` | 辟邪 | 9 | 本武学攻击持剑目标时命中+10、招架穿透+10% |
| `ps_bixie_dacheng` | 七十二路 | 10 | 每战首次连续命中三式，获得 `bf_xianji` |

### 8.3 `sk_fantianzhang` 翻天掌（7 地下 · 拳脚/拳 · 林家）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》林家家传武艺中是否明确有“翻天掌”及其使用者**（待考）**；若修订版无此名，则改标原创扩展命名而不改 ID |
| origin / sect / lineage | `canonExpanded` / `sect_fuwei` / 林家镖局传承 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yang` · `0.75/0.25` · 4 |
| reqs | `sect:{id:sect_fuwei,rank:3}; prereq:[{skill:sk_linjiashou,layer:6},{skill:sk_linjiarumenquan,layer:5}]; attrs:{str:45,con:40}; aptitude:{apFist:40}; hard:[sect,prereq]` |
| layerStats | `parry:[3,9], crit:[2,6]`，合计15 |
| 层数要点 | 1 托天 ｜ 3 翻掌 ｜ 5 掷碑 ｜ 7 翻天覆地 ｜ 10 镖路百战 |
| setTags / conflicts | `[set_linjia_bixie]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 福威 L3；林震南/镖师旧谱支线**（待考）** |
| 图鉴文本 | 镖局近身护货掌法，以托、翻、掷三劲抢回被围空间。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 托天 `mv_fantianzhang_tuotian`（原创扩展命名） | 1 | 单体·1 | 1.05 | 7%/1/1000 | 击退1 | 可 | `1+.12−.05=1.07→1.05` |
| 翻掌 `mv_fantianzhang_fanzhang`（原创扩展命名） | 3 | 横扫 | 0.95 | 8%/2/1000 | — | 可 | `.75×(1+.24+.05)=.97→.95` |
| 掷碑 `mv_fantianzhang_zhibei`（原创扩展命名） | 5 | 单体·1 | 1.25 | 8%/2/1000 | `bf_pojia` 50% | 可 | `1+.24+.05−.05=1.24→1.25` |
| **翻天覆地** `mv_fantianzhang_fudi`（绝招） | 7 | 周身 | 1.85 | 9%/—/1200 | 击退1、`bf_panshan` 50% | 可 | `3×.65−.05−.05=1.85` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_fantianzhang_huhuo` | 护货 | 1 | 相邻友方或任务货物受击后，本武学下一招Z3+8% |
| `ps_fantianzhang_baizhan` | 百战 | 6 | 每战首次被包围时获得 `bf_shoushi` 2 |
| `ps_fantianzhang_fantian` | 翻天 | 10 | 击退目标撞墙时额外施加 `bf_panshan` 1 |

### 8.4 福威玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_linjiajianfa` 林家剑法 | 5玄中·兵器/剑·neutral | `sect:{id:sect_fuwei,rank:2}; prereq:[{skill:sk_linjiarumenjian,layer:4}]; hard:[sect,prereq]` | 花开见佛0.95；流星赶月1.00（突进） | `set_linjia_bixie` | 《笑傲江湖》林家所传“辟邪剑法”招形；本文以此 ID 区分未得心法者 |
| `sk_linjiashou` 林家手 | 4玄下·拳脚/擒拿·yang | `sect:{id:sect_fuwei,rank:2}; prereq:[{skill:sk_linjiarumenquan,layer:4}]; hard:[sect,prereq]` | 扣腕0.95（缴械25%）；护镖1.00 | `set_linjia_bixie` | **（原创扩展命名）** |

抽样核算（2/2）：花开见佛 `1−.05=.95`；流星赶月 `1+.12−.10=1.02→1.00`；扣腕 `1−.20×.25=.95`；护镖1.00。

### 8.5 福威黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_linjiarumenjian` | 林家入门剑 | 福威镖局 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；突进式0.90 | 无 | **（原创扩展）** | `set_linjia_bixie` |
| `sk_linjiarumenquan` | 林家入门拳 | 福威镖局 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；护货时命中+3 | 无 | **（原创扩展）** | — |
| `sk_biaojuxinfa` | 镖局心法 | 福威镖局 | 内功·3黄上·`yang` | 笑傲 | 回内；`meridians:[mer_zuyangming]`；IP30 | 无 | **（原创扩展）** | `set_linjia_bixie` |
| `sk_tangzibu` | 趟子步 | 福威镖局 | 轻功·2黄中 | 笑傲 | 护送任务体力消耗−10%；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶整体用标准单体1.00、突进成本后0.90与支援0模板，预算误差≤0.02。

---

## 9. 青城派 `sect_qingcheng`

### 9.1 门派简介与总表

青城派由余沧海率众觊觎辟邪剑谱并灭福威镖局；其门人使用松风剑法，余沧海掌法与摧心掌名目需逐回核对。本文保留反派路线的可加入性，但不把门派身份自动等同恶行。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_qingchengcuixinzhang` 青城摧心掌 |
| 玄 | `sk_songfengjianfa`、`sk_qingchengxinfa` |
| 黄 | `sk_qingchengrumenjian`、`sk_qingchengrumenquan`、`sk_qingchengtuna`、`sk_qingchengshanjingbu` |

### 9.2 `sk_qingchengcuixinzhang` 青城摧心掌（7 地下 · 拳脚/拳 · 青城）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·余沧海一系掌功；“摧心掌”名称与受害者细节**（待考）**。与九阴 `sk_cuixinzhang` 分立 |
| origin / sect / lineage | `canonExpanded` / `sect_qingcheng` / 余沧海 |
| sourceChapters | `[ch05_xiaoao]` |
| nature · wOut/wIn · moveSlots | `yin` · `0.45/0.55` · 4 |
| reqs | `sect:{id:sect_qingcheng,rank:4}; prereq:[{skill:sk_songfengjianfa,layer:6},{skill:sk_qingchengxinfa,layer:5}]; attrs:{str:40,wil:45}; aptitude:{apFist:40}; morality:{max:20}; hard:[sect,prereq]` |
| layerStats | `crit:[3,9], effHit:[2,6]`，合计15 |
| 层数要点 | 1 透心 ｜ 3 震脉 ｜ 5 阴掌 ｜ 7 摧心断脉 ｜ 10 青城阴劲 |
| setTags / conflicts | `[set_qingcheng_songfeng]` / 无 |
| special / observable | `{fusible:false}` / `true` |
| learnSources | 青城 L4；余沧海支线；秘籍残页最多7重 |
| 图鉴文本 | 掌力透体伤及内息，定位为青城高阶阴掌；不得与九阴摧心掌共享来源或前置。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 透心掌 `mv_qingchengcuixinzhang_touxin`（原创扩展命名） | 1 | 单体·1 | 1.00 | 7%/1/1000 | `bf_neishang` 100% | 可 | `1+.12−.10=1.02→1.00` |
| 震脉 `mv_qingchengcuixinzhang_zhenmai`（原创扩展命名） | 3 | 单体·1 | 1.20 | 8%/2/1000 | `bf_fengnei` 40%·1 | 可 | `1+.24+.05−.20×.4=1.21→1.20` |
| 阴掌 `mv_qingchengcuixinzhang_yinzhang`（原创扩展命名） | 5 | 单体·1–2·远程 | 1.05 | 8%/2/1000 | `bf_xuruo` 50% | 可 | `1.29×.85−.05=1.05` |
| **摧心断脉** `mv_qingchengcuixinzhang_duanmai`（绝招） | 7 | 单体·1 | 2.80 | 9%/—/1200 | `bf_neishang` 100%；`bf_fengnei` 50%·1 | 可 | `3−.10−.20×.5=2.80` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_qingchengcuixinzhang_toujing` | 透劲 | 1 | 对有内伤目标，本武学Z3+6→12% |
| `ps_qingchengcuixinzhang_yinshou` | 阴手 | 5 | 从目标背后命中时效果命中+10 |
| `ps_qingchengcuixinzhang_duanmai` | 断脉 | 10 | 每战首次封内力失败，改施加 `bf_xuruo` 2 |

### 9.3 青城玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_songfengjianfa` 松风剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_qingcheng,rank:3}; prereq:[{skill:sk_qingchengrumenjian,layer:4}]; hard:[sect,prereq]` | 松涛1.00；风过青城1.00（突进） | `set_qingcheng_songfeng` | 《笑傲江湖》青城派剑法；分式**（原创扩展命名）** |
| `sk_qingchengxinfa` 青城心法 | 5玄中·内功·`yin` | `sect:{id:sect_qingcheng,rank:2}; prereq:[{skill:sk_qingchengtuna,layer:5}]; hard:[sect,prereq]` | 松息0（回内）；藏劲0（精准） | `set_qingcheng_songfeng` | **（原创扩展）**；`meridians:[mer_zujueyin]`；IP48.5 |

抽样核算（2/2）：松涛1.00；风过青城 `1+.12−.10=1.02→1.00`；心法支援0。

### 9.4 青城黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_qingchengrumenjian` | 青城入门剑 | 青城 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；回身0.95 | 无 | **（原创扩展）** | `set_qingcheng_songfeng` |
| `sk_qingchengrumenquan` | 青城入门拳 | 青城 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；破绽20% | 无 | **（原创扩展）** | — |
| `sk_qingchengtuna` | 青城吐纳 | 青城 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_zujueyin]`；IP30 | 无 | **（原创扩展）** | `set_qingcheng_songfeng` |
| `sk_qingchengshanjingbu` | 青城山径步 | 青城 | 轻功·2黄中 | 笑傲 | 林地/山路移动消耗−10%；`Q_skill=34` | 无 | **（原创扩展）** | — |

黄阶整体按标准单体或支援模板；入门拳附破绽20%的显示倍率取 `1−.02=.98→1.00`，均在容差内。

---

## 10. 五仙教 `sect_wuxian`

### 10.1 门派简介与总表

笑傲中的五仙教亦称五毒教，蓝凤凰为代表；为避免与碧血书界 `sect_wudu` 混淆，组织 ID 固定 `sect_wuxian`。原著确有用毒、毒物与苗疆背景；具体毒方和招式名多为本作扩展。

| 大阶 | 条目 |
|---|---|
| 地 | `sk_wuxianbaidugong` 五仙百毒功 |
| 玄 | `sk_wuxianduzhang`、`sk_wuxiandujing` |
| 黄 | `sk_wuxianrumenzhang`、`sk_miaozhaidufa`、`sk_wuxiantuna` |

### 10.2 `sk_wuxianbaidugong` 五仙百毒功（7 地下 · 内功 · 五仙）

| 字段 | 值 |
|---|---|
| 出处 | 原著有五仙教善用毒物；“五仙百毒功”及以下运功招式为**（原创扩展命名）** |
| origin / sect / lineage | `expanded` / `sect_wuxian` / 蓝凤凰与五仙教毒师 |
| sourceChapters | `[ch05_xiaoao]` |
| nature / meridians | `yin` / `[mer_zujueyin, mer_zushaoyang]` |
| wOut/wIn · moveSlots | `0/1` · 4 |
| reqs | `sect:{id:sect_wuxian,rank:4}; prereq:[{skill:sk_wuxiandujing,layer:6},{skill:sk_wuxianduzhang,layer:6}]; skills:{poi:55,antidote:40}; attrs:{con:45,wis:45}; hard:[sect,prereq,skills.poi]` |
| inner.contribution | `mpMaxPct:26, hpMaxPct:16, attrs:{con:4,wis:3,wil:3}, mpRegen:2.0`；`26+16+20+10=72` |
| inner.stats | `resPoison:10, effHit:5`，合计15 |
| 层数要点 | 1 辨毒 ｜ 3 以毒行气 ｜ 5 百毒护体 ｜ 7 万蛊朝宗 ｜ 10 毒中求生 |
| setTags / conflicts | `[set_wuxian_baidu]` / 无 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 五仙 L4；蓝凤凰高羁绊；毒典解谜 |
| 图鉴文本 | （原创扩展）以识毒、试毒和解毒为根基的阴性内功；不赋予无条件毒免。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 毒气催掌 `mv_wuxianbaidugong_cuizhang` | 1 | 单体·1–3·远程 | 0.85 | 7%/1/1000 | `bf_zhongdu` 100%·1层 | 可 | `(1+.12)×.85−.10=.85` |
| 百毒护体 `mv_wuxianbaidugong_huti` | 5 | 自身·支援 | 0 | 6%/3/900 | `bf_mian_du` 2 | — | 支援招 |
| 毒引 `mv_wuxianbaidugong_duyin` | 6 | 锥形2·远程 | 0.75 | 8%/2/1000 | `bf_kangxing_jiang(resPoison)` 100% | 可 | `.75×1.29×.85−.10=.72→.70；取.75（+0.03）` |
| **万蛊朝宗** `mv_wuxianbaidugong_wangu`（绝招，原创扩展命名） | 7 | 菱形2·远程 | 1.15 | 9%/—/1200 | `bf_judu` 100% | 可 | `3×.50×.85−.15=1.13→1.15` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_wuxianbaidugong_biandu` | 辨毒 | 1 | 毒类效果命中+5→12；解毒检定+10 |
| `ps_wuxianbaidugong_yidu` | 以毒行气 | 3 | 自身每被成功施加1层毒，回复1%内力，每回合最多3次 |
| `ps_wuxianbaidugong_duzhong` | 毒中求生 | 10 | 对品阶≤本武学的普通中毒免疫；剧毒仍按品阶对抗 |

### 10.3 五仙玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_wuxianduzhang` 五仙毒掌 | 6玄上·拳脚/拳·yin | `sect:{id:sect_wuxian,rank:3}; prereq:[{skill:sk_wuxianrumenzhang,layer:4}]; skills:{poi:35}; hard:[sect,prereq]` | 蛇影掌0.90（中毒100%）；回风毒雾0.70（锥形、中毒） | `set_wuxian_baidu` | **（原创扩展命名）**；据五仙教用毒传统 |
| `sk_wuxiandujing` 五仙毒经 | 5玄中·杂学/毒·yin | `sect:{id:sect_wuxian,rank:2}; prereq:[{skill:sk_miaozhaidufa,layer:5}]; skills:{poi:40,antidote:30}; hard:[sect,prereq]` | 辨毒0（精准）；施毒0（下次攻击附普通中毒） | `set_wuxian_baidu` | **（原创扩展）** |

抽样核算（2/2）：蛇影掌 `1−.10=.90`；毒雾 `.75×1.24×.85−.10=.69→.70`；毒经支援0。

### 10.4 五仙黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_wuxianrumenzhang` | 五仙入门掌 | 五仙 | 拳脚/拳·3黄上 | 笑傲 | 单体0.95；中毒30% | 无 | **（原创扩展）** | `set_wuxian_baidu` |
| `sk_miaozhaidufa` | 苗寨毒法 | 五仙 | 杂学/毒·2黄中 | 笑傲 | 识别常见毒物；下次攻击中毒20% | 无 | **（原创扩展）** | `set_wuxian_baidu` |
| `sk_wuxiantuna` | 五仙吐纳 | 五仙 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_zujueyin]`；IP30 | 无 | **（原创扩展）** | `set_wuxian_baidu` |

黄阶攻击以标准1.00扣普通中毒成本0.03，取0.95；毒法、吐纳为支援0，预算合法。五仙教缺独立黄阶剑，但已有黄阶入门拳，满足门派约束。

---

## 11. 江湖异人传承（桃谷六仙、田伯光、不戒和尚）

这些人物不构成可加入门派，统一 `sect:null + lineage`。其武学可以补本土类别池，但不承担组织职级链；因此 §0.4 不为其虚造掌门与长老。

### 11.1 玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_taoguliuxianshou` 桃谷六仙手 | 5玄中·拳脚/擒拿·neutral | `attrs:{str:35,agi:35}` | 六手齐拿1.05（缴械30%）；分筋1.10（骨伤30%） | `set_xiaoao_yiren` | 《笑傲江湖》桃谷六仙合力擒人与撕扯敌手；武学名**（原创扩展命名）**，表现弱化暴烈细节 |
| `sk_wanliduxing` 万里独行 | 6玄上·轻功·neutral | `attrs:{agi:45}; aptitude:{apLight:40}` | 远遁0（`bf_dunzou`2）；掠影0（移动≤4） | `set_xiaoao_yiren` | 田伯光绰号借作轻功名，**（原创扩展命名）**；`Q_skill=74`，与 `design/08` 对齐 |
| `sk_bujiezhang` 不戒掌 | 5玄中·拳脚/拳·yang | `attrs:{str:40,con:35}; prereq:[{skill:sk_bujiecuquan,layer:5}]; hard:[prereq]` | 破门1.05（击退1）；大喝0.95（震慑50%） | `set_xiaoao_yiren` | 《笑傲江湖》不戒和尚武力高强；武学名与招式均**（原创扩展命名）** |

抽样核算（3/3）：六手齐拿 `1+.12−.20×.30=1.06→1.05`；分筋 `1+.12−.03=1.09→1.10`；万里独行为支援0；破门 `1+.12−.05=1.07→1.05`；大喝 `1−.10×.5=.95`。

### 11.2 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_bujiecuquan` | 不戒粗拳 | 不戒和尚传承 | 拳脚/拳·3黄上 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展命名）** | `set_xiaoao_yiren` |

> 本节一门黄阶；其与九个组织条目合计恰为 36 门黄阶。桃谷六仙手直接由人物羁绊传授，不虚造一门原著未见的前置步法。

---

## 12. 套装候选（交 `design/07` 定稿）

本节只固定候选 ID、成员与主题，不定义件数阈值、属性奖励、触发概率或最终数值。套装计件、同源成员是否可同时计件、跨书界压制后的套装品阶均由 `design/07` 统一裁定。成员表与前文各武学的 `setTags` 按 C22 双向登记；若下游删改成员，须同步改两处。

| 候选套装 | ID | 成员（与前文 `setTags` 精确闭合） | 主题与建议玩法 | 边界 |
|---|---|---|---|---|
| 华山气剑 | `set_huashan_qijian` | `sk_huashanrumenjian`、`sk_huashantuna`、`sk_huashanjianfa`、`sk_yangwujian`、`sk_huashanxinfa`、`sk_kuangfengkuaijian`、`sk_taiyuesanqingfeng`、`sk_zixiashengong`、`sk_dugu9` | 以入门剑与吐纳起步，在气宗蓄势、剑宗连招和独孤破式之间混搭 | 不把气/剑宗做互斥门派；剧情立场与套装计件分开 |
| 嵩山寒岳 | `set_songshan_hanbing` | `sk_songshanrumenjian`、`sk_songyangtuna`、`sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_hanbingzhenqi` | 山势压迫、寒气控制、刚柔两手 | 吸星对寒冰的反制仍按 `rx_hanbingxixing`，套装不得覆盖 |
| 泰山岱宗 | `set_taishan_daizong` | `sk_taishanrumenjian`、`sk_taishantuna`、`sk_taishanjianfa`、`sk_taishan18pan`、`sk_taishanxinfa`、`sk_daizongruhe` | 走位观察、方位推演、抓破绽后一剑决胜 | `formation` 是软门槛，不能由套装无条件代替 |
| 南岳云雾 | `set_hengshan_yunwu` | `sk_hengshanrumenjian`、`sk_hengshantuna`、`sk_huifengluoyan`、`sk_hengshanwushenjian`、`sk_hengshanxinfa`、`sk_baibianqianhuan`、`sk_hengshanyunwubu` | 云雾位移、绕背与多变剑路 | 南衡山专属，不与北恒山套装合并 |
| 北岳慈悲 | `set_hengshan_cibei` | `sk_hengshanbeirumenjian`、`sk_hengshanbeituna`、`sk_hengshanbeijianfa`、`sk_tianchangzhangfa`、`sk_hengshanbeixinfa`、`sk_wanhuajianfa` | 守势、援护、定心与非致命压制 | 北恒山专属；尼俗身份差异交 `design/17` |
| 黑木日月 | `set_riyue_heimu` | `sk_heimuyarumenjian`、`sk_heimutuna`、`sk_riyuejianfa`、`sk_riyuexinfa`、`sk_heimuyajianfa`、`sk_xixing`、`sk_kuihua` | 黑木崖突进、内劲夺取与高速压制 | 葵花、吸星的专属代价与冲突不能被套装免除 |
| 梅庄四艺 | `set_meizhuang_siyou` | `sk_heimutuna`、`sk_qixianwuxingjian`、`sk_shigudaxuebi`、`sk_pomopimajian`、`sk_xuantianzhi` | 琴、书、画、棋入武；技艺软门槛形成不同养成入口 | 不要求四人同时在场，不定义必需多人合击 |
| 任我行 | `set_renwoxing` | `sk_riyuexinfa`、`sk_xixing` | 教主心法接续吸星，突出夺内与异种真气风险 | 套装只能强化风险—收益，不可删除 `bf_yizhongzhenqi` |
| 东方葵花 | `set_dongfang_kuihua` | `sk_kuihua`、`sk_bixie` | 葵花正本与林家残篇的同源快攻主题 | 同源核心的计件与重复收益由 `design/07` 限制；断尘之誓照常检查 |
| 林家辟邪 | `set_linjia_bixie` | `sk_linjiarumenjian`、`sk_biaojuxinfa`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_fantianzhang`、`sk_bixie`、`sk_kuihua` | 从镖局基础到袈裟真谱的传承纵深，兼顾护货与快剑 | `sk_kuihua` 只表达源流混搭；不能把葵花正本视为林家常规授业 |
| 青城松风 | `set_qingcheng_songfeng` | `sk_qingchengrumenjian`、`sk_qingchengtuna`、`sk_songfengjianfa`、`sk_qingchengxinfa`、`sk_qingchengcuixinzhang` | 山径快剑衔接暗劲伤脉 | 不与九阴系 `sk_cuixinzhang` 合并或互相计件 |
| 五仙百毒 | `set_wuxian_baidu` | `sk_wuxianrumenzhang`、`sk_miaozhaidufa`、`sk_wuxiantuna`、`sk_wuxianduzhang`、`sk_wuxiandujing`、`sk_wuxianbaidugong` | 识毒、施毒、抗毒三线相互支撑 | 不提供无条件毒免；与碧血 `sect_wudu` 套装分立 |
| 琴箫笑傲 | `set_xiaoao_qinxiao` | `sk_baibianqianhuan`、`sk_xiaoaojianghuqu`、`sk_qixianwuxingjian` | 衡山琴剑与梅庄琴功跨正邪相和，突出音律和心神控制 | 合奏是可选强化，不得把双人作为单人施放的硬条件 |
| 笑傲异人 | `set_xiaoao_yiren` | `sk_bujiecuquan`、`sk_bujiezhang`、`sk_taoguliuxianshou`、`sk_wanliduxing` | 非门派人物的刚猛、擒拿与脱战机动 | 只表示人物传承组合，不虚造组织身份 |
| 独孤剑冢（既有跨组） | `set_dugu_jianzhong` | 本文成员仅 `sk_dugu9`；完整成员表见 `catalog/skills-daojia` §7 | 无招破式与剑冢四境互证 | 本套不是本文新增；神雕剑冢不能据此直接传授独孤九剑 |

### 12.1 双向闭合与重叠原则

- 本文前文共出现 15 个唯一 `set_*`，上表逐一有且仅有一行；表中每个本文武学成员也都已在该武学的 `setTags` 登记。
- 一门武学可以属于多个候选，例如 `sk_kuihua` 同时属于黑木、东方、林家三种主题；这不表示一件武学可在同一套装中重复计数。
- `set_dugu_jianzhong` 的套装本体与其他成员已经在 `catalog/skills-daojia` 登记，本文件只完成 `sk_dugu9` 的反向标签。
- 本组候选暂不纳入装备，避免在 `design/10` 尚未同步 `setTags` 时制造单向成员。若 `design/07` 后续加入 `eq_xiuhuazhen`、`eq_qixianqin` 等装备，须同步更新装备定义。
- 套装效果不得绕过书界携带限制、武学前置、誓约、门派身份、有效层数与装备合法性。

---

## 13. 本组统计

统计口径是本文定义的 88 个唯一 `sk_*`；跨组引用不计，重点紧凑卡 `sk_xiaoaojianghuqu` 只计一次。敌人专用条目为 0，不混入分母。

### 13.1 门派 / 传承 × 12 品

| 门派 / 传承 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 华山 / 独孤 | 0 | 2 | 2 | 0 | 2 | 4 | 0 | 1 | 1 | 0 | 0 | 1 | **13** |
| 嵩山 | 0 | 2 | 2 | 1 | 1 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | **9** |
| 泰山 | 0 | 2 | 2 | 1 | 2 | 1 | 0 | 1 | 0 | 0 | 0 | 0 | **9** |
| 衡山（南） / 琴箫 | 0 | 2 | 2 | 0 | 2 | 2 | 0 | 2 | 0 | 0 | 0 | 0 | **10** |
| 恒山（北） | 0 | 2 | 2 | 1 | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | **9** |
| 日月 / 梅庄 | 0 | 2 | 2 | 0 | 3 | 2 | 1 | 1 | 0 | 0 | 2 | 0 | **13** |
| 福威 / 林家 | 0 | 2 | 2 | 1 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | **8** |
| 青城 | 0 | 2 | 2 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | **7** |
| 五仙 | 0 | 1 | 2 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | **6** |
| 江湖异人 | 0 | 0 | 1 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | **4** |
| **合计** | **0** | **17** | **19** | **4** | **17** | **15** | **5** | **5** | **2** | **1** | **2** | **1** | **88** |
| **大阶小计** |  | **黄 36（40.91%）** |  |  | **玄 36（40.91%）** |  |  | **地 12（13.64%）** |  |  | **天 4（4.55%）** |  | **88** |

AR-01 核算：`4 : 12 : 36 : 36 = 1 : 3 : 9 : 9`，精确命中目标而非仅落在 ±15% 容差内。天级恰为基准 §13 的独孤九剑、吸星大法、葵花宝典、辟邪剑法，无新增、无漏项、无品阶改动。

### 13.2 类别 × 大阶

| 大类 | 天 | 地 | 玄 | 黄 | 合计 | 本组代表 |
|---|---:|---:|---:|---:|---:|---|
| 内功 | 2 | 3 | 7 | 9 | **21** | 吸星、葵花、紫霞、寒冰及各派吐纳 |
| 拳脚 | 0 | 2 | 9 | 10 | **21** | 翻天掌、青城摧心掌、五仙毒掌 |
| 兵器 | 2 | 5 | 15 | 8 | **30** | 独孤、辟邪、五岳剑路、梅庄笔剑 |
| 轻功 | 0 | 1 | 3 | 8 | **12** | 衡山云雾步、泰山十八盘、万里独行 |
| 杂学 | 0 | 1 | 2 | 1 | **4** | 七弦无形剑、笑傲曲谱、毒经 / 毒法 |
| **合计** | **4** | **12** | **36** | **36** | **88** | — |

口径说明：`sk_qixianwuxingjian` 按 `misc/sonic` 计杂学，不因名称含“剑”计兵器；`sk_shigudaxuebi` 按兵器/奇门（笔）计；本组没有暗器类武学。全部 21 门内功均显式标注 `yin / yang / harmony`，没有 `neutral` 内功。

### 13.3 结构性约束

| 项 | 结果 | 核算 |
|---|---|---|
| 地阶代价 / 誓约型 | **0 / 12 = 0%** | 上限 `12×5%=0.6`，整数上限为 0；辟邪、葵花虽有断尘誓约，但均为天阶，不占地阶分母 |
| 地阶必需多人合击 | **0 / 12 = 0%** | 上限 `12×3%=0.36`，整数上限为 0；曲谱合奏是可选强化，且为玄阶 |
| 敌人专用 | **0** | 所有条目均有至少一个玩家可得来源；不另列敌用池 |
| 最高原生轻功 | **地中 8** | `sk_hengshanyunwubu` 为 8 品，符合 05 §14.6 #7 的笑傲上限；其余为玄上及以下 |
| 玄阶倍率核算覆盖 | **36 / 36 = 100%** | 各门派紧凑卡后均有抽样核算，超过“至少 30%”要求 |
| 黄阶倍率核算 | **36 / 36** | 各节用标准单体、范围、位移或 `power 0` 支援模板作整体预算，不逐招展开 |
| 门派进阶链 | **9 / 9** | §1.2 每个组织均有黄→玄→地链；散人传承非门派，不虚造组织链 |
| 门派入门拳或剑 | **9 / 9** | 华山、嵩山、泰山、南衡山、北恒山、日月、福威、青城、五仙均至少一门黄阶拳或剑 |
| 门派成套组合 | **9 / 9** | §1.2 与 §12 双向登记；散人另有 `set_xiaoao_yiren` |

### 13.4 原生书界与既定池差异

本文 88 门均以 `ch05_xiaoao` 为完整原生书界；紫霞在碧血的 8 品残承不重复计“首现”。因此本文首现分布就是 `4/12/36/36=88`。05 §14.4 的旧版笑傲首现目标为 `4/10/16/14=44`，已被作者 AR-01 的本图鉴比例要求覆盖；差额为地 `+2`、玄 `+20`、黄 `+22`。需要 `design/05` 汇总阶段按全部十册图鉴重算全局及书界表，不能继续用旧 519 门分母判断本文件。

---

## 14. 境界覆盖与装配可行性

### 14.1 笑傲本组本土池

| 书界 | 境界 | 天 / 地 / 玄 / 黄 | 内功 | 拳脚 | 兵器 | 轻功 | 暗器 | 杂学 | 合计 |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 笑傲 `ch05_xiaoao` | 中武 | 4 / 12 / 36 / 36 | **21** | **21** | **30** | **12** | 0 | **4** | **88** |

按基准 §20，中武入场只能携带内 / 拳脚 / 兵器各 2 门，而装配栏各有 3 格，所以每类至少要在本界补 1 门。本文单组就提供本土内功 21、拳脚 21、兵器 30，均远高于 05 §14.6 #4 的“各 ≥3 门”，即使玩家携带为 `0/0/0`，也能在笑傲本土填满三类核心栏；`2/2/2` 入场更无断档。

### 14.2 从零起步与三类可达链

| 装配类别 | 无门派身份的本土入口 | 门派内递进示例 | 可填满 3 格的证明 |
|---|---|---|---|
| 内功 | 梅庄铁板的吸星来源仍要求日月心法前置；更稳妥的无门派入口依赖少林、武当或丐帮跨图鉴本土来源 | 华山吐纳→华山心法→紫霞；嵩阳吐纳→嵩阳心法→寒冰；五仙吐纳→五仙百毒功 | 任取三个不同组织的黄 / 玄内功即可；本文有 9 黄＋7 玄＋3 地＋2 天 |
| 拳脚 | 桃谷六仙手可由人物羁绊取得；不戒粗拳是无门派黄阶入口，万里独行则不属于拳脚 | 各派黄阶入门拳/掌→玄阶拳掌→林家翻天 / 青城摧心 / 五仙百毒 | 本文有 10 黄＋9 玄＋2 地拳脚；至少三条互不依赖的门派路线 |
| 兵器 | 独孤九剑的奇遇不可当普遍入门；福威、五岳、日月均有门派入口 | 华山入门剑→华山剑法→太岳；南衡山入门剑→回风→百变；日月入门剑→日月剑→黑木崖剑 | 本文有 8 黄＋15 玄＋5 地＋2 天兵器；九个组织中八个提供本土兵器 |

“可填满”不等于“单门派可学尽”：门派身份冲突、剧情路线和来源门槛仍由 `design/12` / `chapters/05` 控制。系统只需保证玩家在笑傲可从门派、羁绊、秘籍、观摩等合法来源中补齐栏位，而不是允许同时拜入所有门派。

### 14.3 轻功、非核心栏与最高品阶

- 本组轻功 12 门：地中 1、玄上 1、玄中 1、玄下 1、黄中 8。最高为 `sk_hengshanyunwubu`（8 地中，`Q_skill=96`），不突破笑傲地中上限。
- 基准规定轻功、暗器、杂学不能跨书界携带；笑傲本土可重学 12 门轻功和 4 门杂学，足以填 1 个轻功栏与 2 个杂学栏。本组没有暗器武学，但 `catalog/skills-shaolin` 的笑傲池已有 2 门暗器，故跨图鉴可填暗器栏。
- 已完成图鉴的笑傲本土池至少还有：少林 36 门（内/拳/兵为 6/14/8）、道家 16 门（3/6/4）、五绝 10 门（1/3/3）。加本文后，已知池按 ID 尚未做跨文件去重的上界为 `88+36+16+10=150`；这一数字只用于证明装配可行，不作为最终全局可习得池统计。

### 14.4 中武携带示例与套装可达性

| 路线 | 入场携带（最多 2/2/2） | 笑傲本土补齐 | 结果 |
|---|---|---|---|
| 华山气剑 | 任意 2 内＋2 拳＋2 兵 | 华山吐纳/心法/紫霞、华山基础拳、华山入门剑/剑法/太岳 | 三类核心各能填 3 格，并可自然形成 `set_huashan_qijian` 多件 |
| 日月夺内 | 任意两门既有内功与两门核心攻击 | 黑木吐纳→日月心法→吸星；日月基础拳；入门剑→日月剑→黑木崖剑 | 不依赖外来非核心携带，主运与剑栏均有完整本土升级线 |
| 林家快剑 | 携带 2 内＋2 拳＋1 兵，保留一个兵器选择空间 | 镖局心法、林家入门拳→林家手→翻天掌、林家入门剑→林家剑法→辟邪 | `set_linjia_bixie` 可在本界积累；辟邪仍须真谱与断尘之誓 |
| 五仙毒路 | 携带常规兵器两门 | 五仙吐纳 / 百毒功、入门掌 / 毒掌、毒法 / 毒经；兵器第 3 格由其他本土门派补 | 能填满内功、拳脚与杂学；五仙本身不虚构一套剑法 |

### 14.5 品阶占比校核

本文本组池为天 4.55%、地 13.64%、玄 40.91%、黄 40.91%。对照 05 §14.4 中武目标（天 2%–6%、地 15%–20%、玄 33%–38%、黄 38%–45%）：天、黄命中，地低 1.36 个百分点，玄高 2.91 个百分点。该表是“全书界可习得池”指标，而非单图鉴硬配额；笑傲已有少林、武当/道家、丐帮等跨图鉴地阶，本组合并后地阶占比会上升。最终百分比须由总表按 ID 去重重算，本文不为追逐旧 44 门目标而擅自增加地阶或删除 AR-01 指定的玄黄数量。

---

## 15. 本文新增术语与 ID

### 15.1 武学、招式与被动

| 类别 | 数量 | 登记 |
|---|---:|---|
| 本文定义武学 `sk_*` | **88** | 天 4、地 12、玄 36、黄 36；完整清单以 §2–§11 的标题卡与条目表为准 |
| 其中沿用已登记武学 ID | **6** | 基准 §13：`sk_dugu9`、`sk_xixing`、`sk_kuihua`、`sk_bixie`；其他文档已有建议/引用：`sk_wanliduxing`、`sk_xiaoaojianghuqu` |
| 本文首次定义的武学 ID | **82** | 除上列 6 个外，§2–§11 的全部武学 ID；入库前仍由全局构建器作最终唯一性检查 |
| 跨组只引用、不定义 | **5** | `sk_yijinjing`、`sk_taijiquan`、`sk_taijijian`、`sk_dagou`、`sk_cuixinzhang` |
| 本文登记招式 `mv_*` | **76**（首次新增 64；沿用 12） | 天 / 地完整卡及曲谱重点卡的招式；均以所属武学 ID 为前缀 |
| 本文登记被动 `ps_*` | **56**（首次新增 51；沿用 5） | 天 / 地完整卡及曲谱重点卡的被动；均以所属武学 ID 为前缀 |

首次定义的 82 个 `sk_*` 按组织汇总如下，避免正文再复制一份 82 行主数据：

| 范围 | 首次定义 ID |
|---|---|
| 华山 / 独孤（除 `sk_dugu9`） | `sk_zixiashengong`、`sk_taiyuesanqingfeng`、`sk_huashanjianfa`、`sk_yangwujian`、`sk_xiyijian`、`sk_yunvjian19`、`sk_huashanxinfa`、`sk_kuangfengkuaijian`、`sk_huashanrumenjian`、`sk_huashanjichuquan`、`sk_huashantuna`、`sk_huashanxingbu` |
| 嵩山 | `sk_hanbingzhenqi`、`sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_songshanzhuangong`、`sk_songshanrumenjian`、`sk_songyangrumenzhang`、`sk_songyangtuna`、`sk_songshanxingbu` |
| 泰山 | `sk_daizongruhe`、`sk_taishanjianfa`、`sk_taishan18pan`、`sk_taishanxinfa`、`sk_taishanquan`、`sk_taishanrumenjian`、`sk_taishanrumenquan`、`sk_taishantuna`、`sk_shibanshanbu` |
| 南衡山（除 `sk_xiaoaojianghuqu`） | `sk_baibianqianhuan`、`sk_hengshanyunwubu`、`sk_huifengluoyan`、`sk_hengshanwushenjian`、`sk_hengshanxinfa`、`sk_hengshanrumenjian`、`sk_hengshanrumenzhang`、`sk_hengshantuna`、`sk_hengshanqingbu` |
| 北恒山 | `sk_wanhuajianfa`、`sk_hengshanbeijianfa`、`sk_tianchangzhangfa`、`sk_hengshanbeixinfa`、`sk_hengshanbeishenfa`、`sk_hengshanbeirumenjian`、`sk_hengshanbeirumenquan`、`sk_hengshanbeituna`、`sk_hengshanbeibu` |
| 日月 / 梅庄（除 `sk_xixing`、`sk_kuihua`） | `sk_heimuyajianfa`、`sk_qixianwuxingjian`、`sk_riyuejianfa`、`sk_riyuexinfa`、`sk_shigudaxuebi`、`sk_pomopimajian`、`sk_xuantianzhi`、`sk_heimuyarumenjian`、`sk_riyuejichuquan`、`sk_heimutuna`、`sk_shenjiaobu` |
| 福威 / 林家（除 `sk_bixie`） | `sk_fantianzhang`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_linjiarumenjian`、`sk_linjiarumenquan`、`sk_biaojuxinfa`、`sk_tangzibu` |
| 青城 | `sk_qingchengcuixinzhang`、`sk_songfengjianfa`、`sk_qingchengxinfa`、`sk_qingchengrumenjian`、`sk_qingchengrumenquan`、`sk_qingchengtuna`、`sk_qingchengshanjingbu` |
| 五仙 | `sk_wuxianbaidugong`、`sk_wuxianduzhang`、`sk_wuxiandujing`、`sk_wuxianrumenzhang`、`sk_miaozhaidufa`、`sk_wuxiantuna` |
| 江湖异人（除 `sk_wanliduxing`） | `sk_taoguliuxianshou`、`sk_bujiezhang`、`sk_bujiecuquan` |

### 15.2 套装、门派与经脉预留

| 类别 | 数量 | ID | 状态 |
|---|---:|---|---|
| 新套装候选 | 14 | `set_huashan_qijian`、`set_songshan_hanbing`、`set_taishan_daizong`、`set_hengshan_yunwu`、`set_hengshan_cibei`、`set_riyue_heimu`、`set_meizhuang_siyou`、`set_renwoxing`、`set_dongfang_kuihua`、`set_linjia_bixie`、`set_qingcheng_songfeng`、`set_wuxian_baidu`、`set_xiaoao_qinxiao`、`set_xiaoao_yiren` | 本体交 `design/07`；本文已登记武学侧 `setTags` |
| 跨组既有套装 | 1 | `set_dugu_jianzhong` | 定义见 `catalog/skills-daojia` §7；本文补 `sk_dugu9` 反向标签 |
| 门派 ID | 9 | `sect_huashan`、`sect_songshan`、`sect_taishan`、`sect_hengshan_nan`、`sect_hengshan_bei`、`sect_riyue`、`sect_fuwei`、`sect_qingcheng`、`sect_wuxian` | 全部沿用 `rulings-v1` §3；非本文新增，待 `design/17` 复核称谓与开放条件 |
| 经脉预留 ID | 10 | `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_shoutaiyin`、`mer_shoushaoyin`、`mer_zuyangming`、`mer_zushaoyang`、`mer_zutaiyin`、`mer_zujueyin` | `design/15` 缺失，按 AR-03 临时预留 |
| 新 Buff | **0** | — | 正文引用 41 个唯一 `bf_*`，均已在 `design/06` 或 `rulings-v1` A5 登记 |

### 15.3 既有系统 ID 与语义钩子

- `vow_duanchen`、`autoGroup:dugu_po`、`rx_hanbingxixing` 均为既有 ID / 约定，不计本文新增。
- `special.optionalCombo` 表示《笑傲江湖》曲谱可单人使用、双人合奏只获强化；`special.equipSynergy` 表示七弦无形剑读取 `eq_qixianqin` 的既有装备联动；`special.cost:yizhongZhenqi` 是对 05 §9.1.3 吸星代价的简写。三者需要技术 schema 用现有扩展字段承载，若 schema 不接受对象键，应迁移为 `effects` / `conditions`，不得静默丢失语义。

---

## 16. 数据校验规则与测试用例

### 16.1 构建期校验

| # | 规则 | 期望 |
|---|---|---|
| WU-V01 | 提取定义位的 `sk_*` 并按 ID 去重 | 恰 88；天/地/玄/黄恰为 4/12/36/36 |
| WU-V02 | `grade>=10` 与基准 §13 集合、品阶、原生书界比对 | 只允许 `sk_dugu9:12`、`sk_xixing:11`、`sk_kuihua:11`、`sk_bixie:10`，均为 `ch05_xiaoao` |
| WU-V03 | `category/subType/nature/origin` 枚举检查 | 内功 `nature` 只能 `yin/yang/harmony`；非内功可 `neutral`；不得出现中文枚举值 |
| WU-V04 | `reqs` schema 检查 | `sect:{id,rank}`；技艺键仅限 C17 白名单；`prereq` 外层 AND、`anyOf` 内层 OR；`hard` 路径必须存在 |
| WU-V05 | 前置图做拓扑与来源可达性检查 | 禁止自依赖、空 OR、无入口闭环；§1.2 九条黄→玄→地链均可达 |
| WU-V06 | 完整卡的 `wOut+wIn`、`layerStats`、绝招层数 | 和为1；地≤15、天≤20；地/天都有绝招，核心首绝招≤7重 |
| WU-V07 | 招式预算复算 | 每个完整卡招式与公式差≤0.05；玄阶抽样覆盖≥30%；黄阶按节模板复核 |
| WU-V08 | 内功贡献 | 21 门均有 `nature`；完整卡有 `inner.contribution` 且 IP 在品阶预算±5%；紧凑卡写 IP 核算值 |
| WU-V09 | Buff 外键 | 正文每个 `bf_*` 必须存在于 06 或 A5，施加品阶默认 `inherit` |
| WU-V10 | 套装双向闭合 | §12 每个成员在武学卡有同名 `setTags`，反向亦然；跨组 `set_dugu_jianzhong` 特判到道家图鉴 |
| WU-V11 | 组织最低内容 | 九个组织各有黄阶入门拳或剑、黄→玄→地链和套装候选 |
| WU-V12 | 书界装配池 | 笑傲本土内/拳/兵分别≥3；最高原生轻功≤8；地阶代价/誓约≤5%、必需合击≤3% |
| WU-V13 | 敌人专用隔离 | `enemyOnly:true` 不进入 88 门统计；本文期望为 0 |
| WU-V14 | ID 全局唯一 | 首次定义的 82 个 `sk_*` 不得在其他文件再次定义；引用不误报定义冲突 |
| WU-V15 | Markdown 完整性 | 表头列数一致，围栏成对，目录标题连续，无截断句和占位词 |

### 16.2 金标准测试用例

| # | 场景 | 输入 | 期望 |
|---|---|---|---|
| WU-T01 | 太岳二选一前置 | 华山身份 rank4；华山剑法5重，狂风快剑0重 | `anyOf` 通过；若两门都不足则失败，不能误作 AND |
| WU-T02 | 技艺软门槛 | 岱宗如何其他条件满足，`formation=40<50` | 可学但计1个软缺项；修炼倍率 `0.7`，不是硬拒绝 |
| WU-T03 | 技艺硬门槛 | 五仙百毒功其他条件满足，`poi=54<55` | 因 `hard:[...,skills.poi]` 拒绝；`antidote=39` 只产生软缺项 |
| WU-T04 | 断尘门槛 | 未立 `vow_duanchen`，取得葵花 / 辟邪真谱 | 葵花不可完整修炼；辟邪按 05 降为5品且 `layerCap=5`，不得因套装绕过 |
| WU-T05 | 吸星反噬 | 连续吸取累计达到自身 `mpMax` 的5% | 增加1层 `bf_yizhongzhenqi`；化解与阈值反噬完全按 05 §9.1.3 |
| WU-T06 | 寒冰反制吸星 | 吸星攻击带 cold 护体的寒冰真气使用者 | 触发 `rx_hanbingxixing`：吸取量−50%，吸取方得寒气3层 |
| WU-T07 | 独孤自动选式 | 目标持剑 / 刀 / 枪棍 / 奇门 / 鞭索 / 空手 / 暗器 / 高阶内功 | `autoGroup:dugu_po` 各解析到正确破式；UI 只占1格 |
| WU-T08 | 曲谱单人与合奏 | 仅一人装曲谱；两名角色各装曲谱且相距≤3 | 两种都可施放；双人仅追加知音与持续强化，不要求多人才能发动 |
| WU-T09 | 套装双重归属 | 同时装配葵花、辟邪与林家剑法 | 每个武学实例对每个套装最多计1件；同源核心是否互计按07，不重复计算同一实例 |
| WU-T10 | 中武补栏 | 入场携带2内/2拳/2兵，在笑傲学习任一合法本土入门路线 | 每类都能补至3格；轻功可本土重学，非核心不可从上界携带 |
| WU-T11 | 最高轻功边界 | 衡山云雾步10重，笑傲本土 | 有效品阶8、`Q_skill=96`；本组不存在9品以上原生轻功 |
| WU-T12 | 北南同音隔离 | 查询“衡山”与“恒山”身份 | 分别解析 `sect_hengshan_nan` / `sect_hengshan_bei`，存档与套装不串线 |
| WU-T13 | 五仙 / 五毒隔离 | 笑傲五仙与碧血五毒同名别称 | 分别解析 `sect_wuxian` / `sect_wudu`，不共享门派身份 |
| WU-T14 | 梅庄来源覆写 | 以梅庄铁板学习吸星，应用 `{sect:null}` 来源覆写 | 仅移除门派身份条件，仍保留日月心法6重前置与显式 `hard:[prereq]` |
| WU-T15 | 地阶比例 | 扫描12门地阶的 `vow/cost/requiredCombo/enemyOnly` | 代价/誓约0，必需合击0，敌用0；均满足上限 |

---

## 17. 待决事项 / 依赖

### 17.1 替下游给出的建议值

| # | 下游 | 建议值 / 处理 |
|---|---|---|
| WU-D01 | `design/07` | 采纳 §12 的 14 个新套装候选；先只定成员与主题，奖励数值按套装成员有效品阶另行标定 |
| WU-D02 | `design/17` | 采用 §0.4 的五级抽象职级；普通门派暂称“外门弟子 / 入门弟子 / 亲传闭门弟子 / 长老 / 掌门”，日月、福威、五仙按 AR-08 映射为教派 / 世家模板 |
| WU-D03 | `chapters/05` | 每派至少安排一个不与主线死锁的黄阶入口；梅庄铁板来源只豁免门派身份，不豁免日月心法前置 |
| WU-D04 | `design/15` | 优先登记本文 10 个 `mer_*` 预留 ID；暂按“专精经脉只影响冲穴倾向，不直接增伤”实现 |
| WU-D05 | `design/07` | 葵花与辟邪属于同源核心：默认可分别参加不同套装，但同一套装内核心阈值只计一次，防止两本秘典双重抬档 |

### 17.2 本文依赖的上游事实

| 依赖 | 本文采用内容 |
|---|---|
| `00-canon` §3、§13、§20 | 笑傲中武、2/2/2 携带、装配栏、四门天阶与紫霞/寒冰锚点 |
| `design/03` §4.5 | `Q_skill` 与轻功门禁；笑傲最高原生轻功地中 |
| `design/05` §2、§4.2、§5.5、§9、§14.6 | schema、招式预算、内功 IP、独孤/吸星/葵花/辟邪专属规则、图鉴约束 |
| `design/06` 与 `rulings-v1` A5 | 正文引用的 41 个 Buff 与寒冰反制反应 |
| `design/09`、`design/10` | 曲谱合奏流程；绣花针、七弦琴装备联动 |
| `rulings-v1` C14–C17、C22–C23、§3–§5 | 图鉴边界、门派 ID、结构化前置、双持字段边界、套装闭合与 Buff 名录 |
| `author-requirements` AR-01–03、AR-07–08 | 4/12/36/36、内功性质、经脉预留、五级职级、门派总表对齐 |

### 17.3 对基准的修改提案

| 编号 | 位置 | 提案 | 理由 |
|---|---|---|---|
| WU-P01 | `design/05` §13.2 独孤九剑示例 | 将破剑、破刀、破枪、破鞭、破掌、破箭的 `power` 从1.10改为1.00，或补足能推出1.10的预算项；破索仍保留1.05 | 按当前公式 `(1+0.12+0.15)×0.85−0.06=1.0195→1.00`，1.10超出±0.05；本文先按公式取1.00 |
| WU-P02 | `design/05` §14.1–§14.5 | 依据 AR-01 和十册新图鉴重算全局总量、品阶及笑傲首现 / 可习得池；旧 519 门、笑傲 44 门只能作为历史规划 | P33 已明确被 AR-01 覆盖；本文依硬要求扩为88门，继续沿用旧分母会产生伪冲突 |
| WU-P03 | `design/05` §2 / 技术 schema | 确认 `special.optionalCombo`、`special.equipSynergy`、`special.cost` 的承载方式；若不接受自由键，提供等价 `effects/conditions` 结构 | 本文需表达可选合奏、既有装备协同与吸星既有代价，但不应另造 Buff |

### 17.4 原著考据待办

| # | 书名与核对对象 |
|---|---|
| WU-K01 | 《笑傲江湖》华山：太岳三青峰、养吾剑、希夷剑、玉女剑十九式、狂风快剑的正式名称、使用者、分式与思过崖壁刻内容 |
| WU-K02 | 《笑傲江湖》嵩山 / 泰山：大阴阳手是否正式武学名；寒冰真气反制吸星的交手细节；岱宗如何口诀、运指推算与传承状态 |
| WU-K03 | 《笑傲江湖》南衡山：回风落雁剑、衡山五神剑、百变千幻衡山云雾十三式的逐字名称与使用情节；刘正风、曲洋琴箫曲谱的形成与流传 |
| WU-K04 | 《笑傲江湖》北恒山：万花剑法、天长掌法是否为修订版正式名；恒山剑阵、救护与“不伤人”表现的原文边界 |
| WU-K05 | 《笑傲江湖》日月 / 梅庄：吸星来历与反噬、葵花传承关系、七弦无形剑、玄天指、石鼓打穴笔法、泼墨披麻剑法的正式名及四友对应关系 |
| WU-K06 | 《笑傲江湖》林家 / 青城：辟邪七十二路的具体招名、林家是否确有翻天掌、青城摧心掌名称与受害情节；不得与九阴摧心掌混同 |
| WU-K07 | 《笑傲江湖》五仙 / 异人：五仙 / 五毒称谓、蓝凤凰用毒方式；桃谷六仙擒拿、田伯光身法、不戒和尚武功描写，确认哪些只有人物表现而无武学名 |

### 17.5 开放问题（附默认值）

| # | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| WU-O01 | `design/17` 完成后，九个组织的正式名称、时代开放与职级称谓是否调整？ | 保留裁定 §3 的九个 `sect_*`；先用 AR-07 抽象五级，日月 / 五仙 / 福威仅在 UI 映射称谓 | 只改职级展示与来源 rank，不改武学 ID |
| WU-O02 | 梅庄四友是否应有黑白子的棋诀、丹青生之外的画诀作为独立杂学？ | 不扩容；以玄天指、笔法、剑法、七弦无形剑四门对应四艺 | 避免突破精确 88 门与重复技能 |
| WU-O03 | 福威翻天掌若修订版无明确名目如何处理？ | 保留 `sk_fantianzhang` 与玩法，改为**（原创扩展命名）** | 不改数量、品阶与前置链 |
| WU-O04 | `sk_xiaoaojianghuqu` 由谁定义、是否算衡山条目？ | 本文唯一完整定义并计入南衡山 / 琴箫分组；`design/09` 只引用合奏流程 | 防止重复定义和跨文件重复计数 |
| WU-O05 | 套装是否纳入绣花针、七弦琴等装备？ | 当前不纳入；待 07 能与 10 双向同步后再加 | 保持 C22 当前闭合 |
| WU-O06 | 五仙是否补独立兵器路线？ | 不补；以拳、毒、内功为门派特色，兵器栏从其他笑傲本土组织补齐 | 保持原著辨识度与 1:3:9:9 数量 |

### 17.6 需下游同步

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `design/05` | §13.2、§14.1–§14.5 | 独孤破式倍率按 WU-P01 收敛；按 AR-01 重算全局与笑傲池 |
| `design/07` | 套装目录 | 评审 §12 的14个新候选，并与武学 / 装备 `setTags` 双向生成校验 |
| `design/09` | 曲谱合奏 | 继续只引用 `sk_xiaoaojianghuqu`；确认 optional combo 不被实现成必需多人合击 |
| `design/10` | 绣花针、七弦琴 | 保留 `eq_xiuhuazhen` / `eq_qixianqin` 联动；若进套装再补装备侧标签 |
| `design/15` | 经脉 ID 表 | 收录 §15.2 的10个 `mer_*` 预留，并决定专精与冲穴倍率 |
| `design/17` | 五岳 / 日月等门派页 | 对齐九个 `sect_*`、分支、时代开放、五级称谓与 §0.4 可学表 |
| `chapters/05` | 门派、梅庄、黑木崖、林家与五仙节点 | 为所有 `learnSources` 落实际任务 / NPC / 秘籍 ID；保证九条入门链可达 |
| `chapters/07` | 华山残承 | 紫霞神功只引用同一 `sk_zixiashengong`，来源品阶8，不另建武学 |



