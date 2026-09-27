# 门派武学图鉴 · 侠客行 / 碧血剑（`skills-xiake-bixue`）

> **版本**：v1.2（审校 C1b.R；全局审计，2026-09-27）。

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴之一。本文唯一定义《侠客行》《碧血剑》分工内的武学、招式、被动与套装成员反向标签。
> **上游**：`decisions/author-requirements.md` AR-01–AR-03、AR-07–AR-08；`00-canon.md` §3–§7、§9、§12–§13、§16、§20；`decisions/rulings-v1.md` C14–C17、C22–C23 与 §3.2–§4。
> **引用而不重定义**：字段、层数、招式与内功预算见 `design/05`；Buff 定义见 `design/06`；轻功值、经脉与套装规则分别归 `design/03`、`design/15`、`design/07`；门派 ID、名称、时代与职级称谓归 `design/17`，加入/晋升规则与月钱资源分别归 `design/12`、`design/16`，本文只列职级可学武学。
> **标注约定**：原著没有的武学、招名或玩法写 **（原创扩展）**；原著有其人其事而无武学名、本作补名写 **（原创扩展命名）**；版本原文未逐字核对写 **（待考）**；数值依赖未完成下游时写 **【建议值】**。
> **修订记录**：审校 C1b.R（2026-09-26）：复核招式与内功预算，按现行 `design/17` 校正门派职级/传承边界，并补强原著考据标注。

---

## 0. 阅读指引与统一记法

### 0.1 数量、边界与条目格式

- 作者 AR-01 高于旧分工表的 55 门目标。本图鉴分得 4 门天阶，因此采用精确比例 `天:地:玄:黄 = 4:12:36:36 = 1:3:9:9`，共 **88 门**；《侠客行》《碧血剑》各 44 门，均为 `2/6/18/18`。
- 天阶仅收基准 §13 的 `sk_taixuan`、`sk_luohanfumo`、`sk_jinshejian`、`sk_shenxing`；品阶、ID、类型与原生书界不改，不扩大全局 51 门天阶名录。
- 天、地阶使用完整条目卡；玄阶使用紧凑卡，36 门中 12 门给逐招核算，抽样率 `12/36 = 33.3% ≥ 30%`；黄阶只用一行表格，集中核对大阶预算。
- 本文采用 12 个配额组，每组恰有 1 门地阶、3 门玄阶、3 门黄阶；人物或小支传承夹在相关门派节中。`design/17` 已将金乌派 `sect_jinwupai` 与雪山派分立，本文只收史小翠个人线的一门金乌刀法，不把它扩成独立配额组，也不把它计入雪山职级开放。金龙帮、青竹帮作为《碧血剑》地方帮会来源收录，不另扩成需要七门配额的组。
- 所有品阶均为绝对品阶；武学施加 Buff 的品阶均为 `inherit`。任务/NPC 的运行 ID 交剧情与 `design/18` 定稿，本文只写人物或事件来源，不抢占其 ID。

| 大阶 | 本文写法 | 必写内容 |
|---|---|---|
| 天 10–12 | 完整卡 | 全字段、层数要点、全部招式逐招核算、被动、获取、套装 |
| 地 7–9 | 完整卡 | 同上；每门有 7 重绝招，首个绝招不晚于 7 重 |
| 玄 4–6 | 紧凑卡 | 核心字段、前置、招式名/倍率/一句效果；至少三分之一逐招核算 |
| 黄 1–3 | 一行表格 | ID、名称、门派/来源、类别、原生书界、核心效果、前置、出处；不逐招展开 |

### 0.2 招式表列与核算

完整卡招式列为“招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算”。核算沿用 `design/05` §4.2：

    power = AF × (1 + Σadj) × Kd × Kp − Σcost

- 耗内基准：黄 5%、玄 6%、地 7%、天 8%；每偏离 1% 计 ±0.05。
- 每 1 回合冷却 +0.12；收招每偏离 1000 的 100 点计 ±0.07；常见/罕见条件为 +0.15/+0.30。
- `ranged` 为 0.85，`projectile` 为 0.92，不可招架为 0.85；Buff、位移代价依 05 §4.2 扣除。
- 绝招先算 `3.00 × AF × Kd × Kp` 再扣效果代价；气势 100、耗内为大阶基准 +2%、收招 1200。
- 功能式、架势和纯位移的倍率为 0，表内写“功能式，不走伤害预算”，不伪造伤害核算。
- `design/05` 尚未统一定价的跨兵器适配、弹药回收/覆盖、多段触发封顶、动态聚伤、阵位封路、路线适配与情境收益，只在对应招式中写条目级 **【建议值】**；本文不把这些折价扩写成全局价表，待 05 后续统一。

### 0.3 内功贡献、经脉与轻功

内功第 10 重主运贡献用 `IP = mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen`。本文采用 05 §5.5 的精确预算：黄下/中/上 `19/24/30`，玄下/中/上 `41.5/48.5/57`，地下/中/上 `72/83/94.5`，天下/中/上 `118/135.5/156`；`stats` 另计且不超过对应大阶层数预算。

每门内功均标 `nature: yin/yang/harmony`。因 `design/15` 尚不存在，`meridians` 先用 AR-03 约定的 `mer_<拼音>` 预留；它只表示冲穴专精，不在本文定义穴位、内劲速度或周天加成。轻功 `QS(g)` 直接引用 `design/03` §4.5，不在本文重复公式。

### 0.4 本组五级职级建议（只列可学武学）

职级称谓对齐 `design/17` §1 及各门派条目；下表为**新增开放项**，括号层数是该职级门内传授上限。称谓只作 L1–L5 显示映射，加入、晋升、月钱与资源不在本文定义。

| 门派（`design/17` 模板） | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|
| 侠客岛 `sect_xiakedao`（T07/T09） | 岛仆：`sk_xiakedaoquanji`、`sk_xiakedaozhoufa`、`sk_xiakedaojianji` | 岛众：`sk_xiakedaoshangshanshou`（6） | 岛使：`sk_xiakedaozhangfa`（7） | 护法/左右岛主：同左（9） | 轮值总岛主：同左（10）；太玄石壁仍走解谜 |
| 雪山派 `sect_xueshan`（T03） | 外门：`sk_xueshanquan`、`sk_lingxiaotuna`、`sk_lingxiaorumenjian` | 内门弟子：`sk_xueshanjianfa`（6） | 亲传/闭门弟子：`sk_wuwangshengong`（8） | 气寒堂长老：`sk_taxuewuhen`（9） | 掌门：同左（10） |
| 长乐帮 `sect_changlebang`（T05B） | 帮众：`sk_changlequan`、`sk_changletuna`、`sk_changlegun` | 香主副手：`sk_changlezhang`、`sk_changlexinfa`、`sk_changleqinna`（6） | 香主：`sk_wuxingliuhezhang`（7） | 总管/长老：同左（9） | 帮主：同左（10） |
| 玄素庄 `sect_xuansuzhuang`（T04） | 庄客：`sk_xuansuquan`、`sk_xuansuzhuanggong`、`sk_xuansurumenjian` | 家臣：`sk_heibaijianshi`、`sk_xuansuxinfa`（6） | 亲传：`sk_xuansushenfa`（8） | 总管：`sk_heibaijianfa`（9） | 庄主：同左（10） |
| 金刀寨 `sect_jindaozhai`（T04/T05B） | 寨丁：`sk_jindaoquan`、`sk_jindaozhuanggong`、`sk_jindaorumen` | 好手：`sk_jindaokuaidao`、`sk_jindaoxinfa`（6） | 头领：`sk_jindaobu`（8） | 副寨主：`sk_piguadao`（9） | 寨主：同左（10） |
| 上清观 `sect_shangqingguan`（T02） | 记名弟子/道童：`sk_shangqingquan06`、`sk_shangqingtuna06`、`sk_shangqingrujian06` | 入门道士：`sk_shangqingqingjian06`、`sk_shangqingxinfa06`（6） | 亲传弟子：`sk_shangqingyunbu06`（8） | 监院/长老：`sk_shangqingjianfa06`（9） | 观主：同左（10） |
| 华山·碧血支 `sect_huashan`（T03） | 外门：`sk_huashanquan07`、`sk_huashantuna07`、`sk_huashanrujian07` | 内门弟子：`sk_tiezhijue`、`sk_poyuquan`、`sk_hunyuanzhang`（6） | 亲传/闭门弟子：同左（8） | 长老/教习：`sk_hunyuangong`（9） | 掌门：同左（10） |
| 铁剑门 `sect_tiejian`（T02） | 记名弟子/道童：`sk_tiejianquan`、`sk_tiejantuna`、`sk_tiejianrujian` | 入门道士：`sk_tiejianqipanjian`、`sk_tiejianxinfa`（6） | 亲传弟子：`sk_mantianhuayu`（8） | 护剑道人：`sk_tiejianjianfa`（9） | 掌门：同左（10）；神行百变另走木桑私传 |
| 石梁温家 `sect_shiliang`（T04） | 家仆/门客：`sk_shiliangquan`、`sk_wenjiagong`、`sk_shilianggun` | 本家子弟：`sk_shiliangwuxingzhang`（6） | 亲传：`sk_wenjiawuxingzhen`（8） | 温家五老/族老：同左（9） | 族议代表：同左（10） |
| 五毒教 `sect_wudu`（T06） | 教众：`sk_wuduquan`、`sk_wudutuna`、`sk_wuduruobian` | 毒使：`sk_hanshasheying`、`sk_wuduxinfa`（6） | 堂主：`sk_ruanhongzhusuo`（8） | 护法：`sk_xieweibian`（9） | 教主：同左（10） |
| 仙都派 `sect_xiandu`（T02/T03） | 记名/外门：`sk_xianduquan`、`sk_xiandutuna`、`sk_xiandurumenjian` | 入门弟子：`sk_lingbaoquan`、`sk_xianduxinfa`、`sk_liangyijianfa07`（6） | 亲传弟子：同左（8） | 长老/教习：`sk_shangqingjianfa07`（9） | 掌门：同左（10） |
| 闯王军 `sect_chuangwangjun`（T08） | 军士：`sk_chuangwangchangquan`、`sk_chuangwangtuna`、`sk_chuangwangqiangji` | 队正：`sk_shanzongquanfa`、`sk_shanzongxinfa`（6） | 亲兵：`sk_shuangqiangqiangfa`（8） | 将领：`sk_fuhuzhang`（9） | 闯王军统领：同左（10） |

谢烟客、罗汉伏魔泥人、金蛇郎君、金龙帮与青竹帮均按人物/地方传承取得，不因玩家门派职级自动开放；金乌刀法按史小翠个人线/`sect_jinwupai` 来源取得，也不随雪山职级开放。`sk_taixuan` 仍要求石壁解谜，`sk_luohanfumo` 仍要求泥人图修习，`sk_jinshejian` 仍要求金蛇秘笈传承，`sk_shenxing` 仍走木桑道人或九难授艺。

### 0.5 本组天级锚点

| ID | 名称 | 品阶 | 类型 | 门派/传承 | 原生书界 |
|---|---|---:|---|---|---|
| `sk_taixuan` | 太玄经 | 12 天上 | 内功（统摄拳剑轻功） | 侠客岛石壁 | 侠客 |
| `sk_luohanfumo` | 罗汉伏魔神功 | 10 天下 | 内功 | 泥人经脉图 | 侠客 |
| `sk_jinshejian` | 金蛇剑法 | 10 天下 | 兵器/剑 | 金蛇郎君夏雪宜 | 碧血 |
| `sk_shenxing` | 神行百变 | 10 天下 | 轻功 | 铁剑门（木桑道人/九难） | 碧血、鹿鼎 |

## 1. 本组门派与传承一览

| 节 | 门派/传承 | ID/组织边界 | 书界 | 风格 | 本文计数（天/地/玄/黄） |
|---:|---|---|---|---|---:|
| 2 | 侠客岛；谢烟客、泥人经脉图 | `sect_xiakedao`；后两者 `sect:null` | 侠客 | 石壁会意、刚柔互济、擒纵气劲 | 2/1/3/3 = 9 |
| 3 | 雪山派；史小翠金乌传承 | `sect_xueshan`；金乌刀法按个人/`sect_jinwupai` 来源 | 侠客 | 梅雪剑势、寒地身法、金乌破剑 | 0/1/3/3 = 7 |
| 4 | 长乐帮 | `sect_changlebang` | 侠客 | 掌力、擒拿、堂口群战 | 0/1/3/3 = 7 |
| 5 | 玄素庄 | `sect_xuansuzhuang` | 侠客 | 黑白双剑、夫妇策应 | 0/1/3/3 = 7 |
| 6 | 金刀寨 | `sect_jindaozhai` | 侠客 | 劈卦刀、寨战步法 | 0/1/3/3 = 7 |
| 7 | 上清观 | `sect_shangqingguan` | 侠客 | 道门心法、上清剑路 | 0/1/3/3 = 7 |
| 8 | 华山·穆人清一脉 | `sect_huashan`，仅碧血支 | 碧血 | 由外入内、拳掌养气 | 0/1/3/3 = 7 |
| 9 | 铁剑门 | `sect_tiejian` | 碧血；神行在鹿鼎复现 | 剑、棋子暗器、百变身法 | 1/1/3/3 = 8 |
| 10 | 石梁派温家；金蛇郎君 | `sect_shiliang`；金蛇 `sect:null` | 碧血 | 五行阵势、奇诡蛇形 | 1/1/3/3 = 8 |
| 11 | 五毒教 | `sect_wudu`；与笑傲五仙教分立 | 碧血 | 毒、鞭索、机关暗器 | 0/1/3/3 = 7 |
| 12 | 仙都派 | `sect_xiandu` | 碧血 | 轻灵上清剑、双人两仪 | 0/1/3/3 = 7 |
| 13 | 闯王军与江湖盟友 | `sect_chuangwangjun`；金龙/青竹为来源 | 碧血 | 军阵拳枪、山宗伏虎、地方帮会 | 0/1/3/3 = 7 |
| **合计** | 12 配额组＋人物/小支传承 | 按 ID 唯一计数 | 侠客、碧血 | — | **4/12/36/36 = 88** |

同名边界：`sk_shangqingjianfa06` 是《侠客行》上清观传承；`sk_shangqingjianfa07` 是《碧血剑》仙都派上清剑法。两者原著组织、技路不同，依基准 §12 追加书界号，不互作前置。华山紫霞神功只引用五岳图鉴的 `sk_zixiashengong`，在碧血仅作来源品阶 8 的残承，不在本文重定义或计入 88 门。

## 2. 侠客岛、谢烟客与罗汉伏魔传承

### 2.1 传承简介与总表（9 门）

侠客岛石室刻有《侠客行》诗句与图谱，群豪拘于字义而石破天由图形、经脉意象悟得绝学；龙、木二岛主长期参研石壁。罗汉伏魔神功来自泥人所绘经脉图；谢烟客以玄铁令承诺和摩天崖授艺串起石破天早期经历。上述情节据《侠客行》，具体回目、石室数量与图文对应仍**（待考）**。本作把岛上非太玄基础课程补成可加入体系，均标原创扩展。

| ID | 名称 | 类别 | 品阶 | nature | 来源 | 前置 | setTags |
|---|---|---|---:|---|---|---|---|
| `sk_taixuan` | 太玄经 | 内功 | 12 天上 | harmony | 侠客岛石壁 | 石壁会意解谜 | `[]` |
| `sk_luohanfumo` | 罗汉伏魔神功 | 内功 | 10 天下 | harmony | 泥人经脉图 | 泥人图解谜 | `[]` |
| `sk_xiakedaozhangfa` | 侠客岛掌法 | 拳脚/拳掌 | 8 地中 | harmony | 侠客岛（原创扩展） | `sk_xiakedaoshangshanshou` 6 | `[]` |
| `sk_xiakedaoshangshanshou` | 赏善罚恶手 | 拳脚/擒拿 | 5 玄中 | harmony | 侠客岛（原创扩展命名） | `sk_xiakedaoquanji` 4 | `[]` |
| `sk_bizhenqingzhang` | 碧针清掌 | 拳脚/拳掌 | 6 玄上 | yin | 谢烟客 | 无 | `[]` |
| `sk_konghegong` | 控鹤功 | 拳脚/指法 | 5 玄中 | harmony | 谢烟客 | `sk_xiakedaoquanji` 4 或 `sk_shangqingquan06` 4 | `[]` |
| `sk_xiakedaoquanji` | 岛上拳基 | 拳脚/拳掌 | 2 黄中 | neutral | 侠客岛（原创扩展） | 无 | `[]` |
| `sk_xiakedaozhoufa` | 赏罚令杖法 | 兵器/奇门（令牌） | 3 黄上 | neutral | 侠客岛（原创扩展命名） | 无 | `[]` |
| `sk_xiakedaojianji` | 石室剑基 | 兵器/剑 | 2 黄中 | neutral | 侠客岛（原创扩展） | 无 | — |

进阶链：`岛上拳基（黄中）→4 重→赏善罚恶手（玄中）→6 重→侠客岛掌法（地中）`。套装组合由三者与太玄经构成；太玄经不是入门链的硬前置，避免把门派地阶课程锁到唯一天下奇遇之后。

### 2.2 天阶完整条目卡

#### `sk_taixuan` 太玄经（12 天上 · 内功 · 侠客岛石壁）

> **出处**：《侠客行》侠客岛石室参悟情节；“图谱统摄内功、拳法、剑法与轻功”的具体分层为本作整理**（原创扩展）**，诗句、穴位对应和回目须依修订版逐字核对**（待考）**。

| 项 | 内容 |
|---|---|
| origin / sect / lineage | `canonExpanded` / `null` / 侠客岛石壁 |
| sourceChapters | `[ch06_xiake]`（与基准 §13 一致） |
| nature · wOut/wIn | `harmony` · `0.35/0.65`；内功运劲招式 |
| reqs | `attrs {wil:55, agi:45}`；`aptitude {apInner:55}`；`lore {max:40}`；`hard [lore.max]`。高武学常识者可由石壁事件先完成“忘文见图”，以 `reqsOverride {lore:null, hard:[]}` 进入，不把先天成长永久锁死**（原创扩展）** |
| inner.contribution | `mpMaxPct 56, hpMaxPct 34, attrs {con:6, agi:6, wil:6, wis:6}, mpRegen 3.6` → `IP=56+34+2×24+5×3.6=156`，等于天上预算；`stats {effRes:10, resMind:10}`（20） |
| meridians | `[mer_renmai, mer_dumai, mer_chongmai]`（预留；任、督、冲脉专精，定义归 `design/15`） |
| 层数要点 | 1 重观图行气；3 重图意入招；5 重拳剑互证；6 重身随意转；**7 重绝招太玄归一**；8 重忘文见图；10 重百脉自运 |
| 获取 | 侠客岛石壁 `puzzle`；先完成石室会意节点（按二十四室建模，室数**（待考）**；节点化为**（原创扩展）**），完整路径 `maxLayer 10`。只读字句路线最多提供见闻，不产秘籍；天阶不可观摩 |
| setTags / conflicts | `[]`；无 |
| special | `fusible:false, observable:false, seclusionCap:7`；拳、剑招按当前持械状态切换，仍只占内功栏，不额外占拳脚/兵器栏 |
| 图鉴文本 | 石壁图文所藏绝学，不拘一类招法；忘去名相，方见经脉与身法自成一体。玩法拆招与层数效果为原创扩展。 |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 石壁图意（原创扩展命名） | `mv_taixuan_tuyi` | 1 | 单体·1·近身 | 0.90 | 8%/0/1000 | 空手为掌，持剑为剑；拳掌/剑取较高资质 | 可 | `1.00−0.10（跨兵器适配【建议值】）=0.90` |
| 十步一杀式（原创扩展命名） | `mv_taixuan_shibu` | 3 | `aoe_dash n3`·1–3·近身 | 0.95 | 9%/1/1000 | 突进；击杀后可后撤 1 格 | 可 | `1×(1+0.12+0.05)−0.10（突进）−0.10（击杀后撤【建议值】）=0.97≈0.95` |
| 飒沓流星式（原创扩展命名） | `mv_taixuan_sada` | 5 | `aoe_cone {r:2,angle:60,dirCount:6}`·近身 | 1.10 | 10%/2/1100 | `bf_dongxi`·承·30%·2 | 可 | N=4、AF=0.80；`0.80×(1+0.24+0.10+0.07)−0.03=1.098≈1.10` |
| 五岳倒轻式（原创扩展命名） | `mv_taixuan_wuyue` | 6 | `aoe_line n3`·1–3·远程 | 1.00 | 10%/2/1100 | — | 可 | N=3、AF=0.85；`0.85×(1+0.24+0.10+0.07)×0.85=1.02≈1.00` |
| 太玄归一（绝招；原创扩展命名） | `mv_taixuan_guiyi` | 7 | 单体·1–2·远程 | 2.65 | 10%/—/1200 | 仅自身至少有 2 个可驱散减益时可用；驱散其中 2 个并获 `bf_yuanzhuan`·承·3 | 可 | `3×0.85−0.20（驱散）+0.30（罕见使用条件）=2.65` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 图意无碍 | `ps_taixuan_tuyi` | 1 | 拳掌与剑资质取两者较高值判定本功招式；不复制装备栏 |
| 拳剑互证 | `ps_taixuan_huzheng` | 5 | 本功上一次用掌、下一次用剑（或反之）时，下一招 Z3 +8%；同形连续不触发 |
| 身随意转 | `ps_taixuan_shensui` | 6 | 本功攻击后移动 1 格不触发截击，每自身行动 1 次 |
| 忘文见图 | `ps_taixuan_wangwen` | 8 | 心神类减益效果命中率对自身 ×0.75；这是抵抗修饰，不是免疫 |
| 百脉自运 | `ps_taixuan_baimai` | 10 | 主运时每行动回复内力仍受全角色 `mpRegen≤6%` 上限；本功招式耗内 −10% |

#### `sk_luohanfumo` 罗汉伏魔神功（10 天下 · 内功 · 泥人经脉图）

> **出处**：《侠客行》中石破天从泥人所示经脉图修习内功的情节；泥人数量、图中文字与习得顺序**（待考）**。阴阳调和、招式名和护体数值为本作玩法化**（原创扩展）**。

| 项 | 内容 |
|---|---|
| origin / sect / lineage | `canonExpanded` / `null` / 罗汉泥人经脉图 |
| sourceChapters | `[ch06_xiake]`（与基准 §13 一致） |
| nature · wOut/wIn | `harmony` · `0/1` |
| reqs | `attrs {con:45, wil:50}`；`aptitude {apInner:45}`；`prereq [{skill:sk_xiakedaoquanji,layer:3}]`；`hard []`。泥人原途径以 `reqsOverride {prereq:[]}` 清除前置 |
| inner.contribution | `mpMaxPct 42, hpMaxPct 25, attrs {con:7, wil:6, wis:5}, mpRegen 3.0` → `IP=42+25+2×18+5×3=118`，等于天下预算；`stats {resInjury:10, effRes:10}`（20） |
| meridians | `[mer_renmai, mer_dumai]`（预留；任督并修，定义归 `design/15`） |
| 层数要点 | 1 重罗汉行气；3 重伏魔真气；4 重泥人周流；5 重罗汉护体；**7 重绝招诸相伏魔**；8 重内息自净；10 重伏魔圆满 |
| 获取 | 泥人图谱 `puzzle maxLayer 10`；剧情失散后可收齐图谱残片恢复 `sourceCap`，不能靠观摩习得 |
| setTags / conflicts | `[]`；无 |
| special | `fusible:true, observable:false, seclusionCap:8, bridge:true` |
| 图鉴文本 | 泥人以经脉行气示意的调和内功，重在澄心护体、化解内伤；系统招式与数值为原创扩展。 |

**招式**（天阶耗内基准 8%）

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 伏魔真气（原创扩展命名） | `mv_luohanfumo_zhenqi` | 3 | 单体·1–3·远程 | 1.05 | 10%/2/1000 | `bf_zhenshe`·承·30%·1 | 可 | `1×(1+0.24+0.10)×0.85−0.045=1.09≈1.05` |
| 泥人周流（原创扩展命名） | `mv_luohanfumo_zhouliu` | 4 | 自身 | 0 | 8%/3/900 | 驱散自身 1 个 `injury` 或 `seal`，获 `bf_huinei`·承·2 | — | 功能式；驱散与回内由 cd 3、耗内 8% 支付 |
| 罗汉护体（原创扩展命名） | `mv_luohanfumo_huti` | 5 | 自身 | 0 | 10%/4/900 | `bf_hutizhenqi`·承·3，护体量为自身 hpMax 15% | — | 支援式：15% 护盾约等价 12.5% 治疗，低于单体治疗 18%，以可预防伤害补足 |
| 诸相伏魔（绝招；原创扩展命名） | `mv_luohanfumo_zhuxiang` | 7 | `aoe_around`·近身 | 2.10 | 10%/—/1200 | `bf_neishang`·承·50%·3；自身 `bf_jingang`·承·2 | 可 | N=6、AF=0.75；`3×0.75−0.05−0.10=2.10` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 澄心 | `ps_luohanfumo_chengxin` | 1 | `resMind +4→+10` |
| 伏魔 | `ps_luohanfumo_fumo` | 4 | 对带 `mind` 或 `evil` 战斗标签目标，本功招式 Z3 +8% |
| 内息自净 | `ps_luohanfumo_zijing` | 8 | 每战首次获得内伤时，使其层数 −1；不能清除战后伤势 |
| 罗汉圆满 | `ps_luohanfumo_yuanman` | 10 | 主运时受到的内劲伤害 Z4 −10% |

### 2.3 地阶完整条目卡

#### `sk_xiakedaozhangfa` 侠客岛掌法（8 地中 · 拳脚/拳掌 · 侠客岛）**（原创扩展）**

| 项 | 内容 |
|---|---|
| origin / source / nature | `expanded` / `[ch06_xiake]` / `harmony`，`wOut/wIn 0.45/0.55` |
| reqs | `attrs {str:35, wil:40}`；`aptitude {apFist:35}`；`sect {id:sect_xiakedao,rank:3}`；`prereq [{skill:sk_xiakedaoshangshanshou,layer:6}]`；`hard [sect,prereq]` |
| layerStats | `hit [2,7], parry [2,8]`，10 重合计 `7+8=15` |
| 层数要点 | 1 重赏罚分明；3 重令出掌随；5 重刚柔互换；**7 重绝招双使合印**；8 重化执；10 重岛主印证 |
| 获取 / 套装 | 龙、木二岛主传授**（原创扩展）**，掌门级 `maxLayer 10`；`setTags []`；`fusible:true` |
| 图鉴文本 | 侠客岛使者与岛主掌势的游戏化归纳，刚掌负责逼位，柔掌负责锁势；原著未立此武学总名。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 赏善掌 | `mv_xiakedaozhangfa_shangshan` | 1 | 单体·1·近身 | 1.10 | 8%/0/1000 | 目标带增益时才可用；命中驱散 1 个增益 | 可 | `1×(1+0.05+0.15)−0.10=1.10` |
| 罚恶掌 | `mv_xiakedaozhangfa_fae` | 1 | 单体·1·近身 | 1.10 | 8%/1/1000 | 仅目标带减益时可击退 1 | 可 | `1×(1+0.12+0.05)−0.05=1.12≈1.10` |
| 令出掌随（原创扩展命名） | `mv_xiakedaozhangfa_lingsui` | 3 | `aoe_pierce`·1–2·近身 | 1.05 | 8%/1/1000 | — | 可 | `0.90×(1+0.12+0.05)=1.05` |
| 刚柔互换 | `mv_xiakedaozhangfa_gangrou` | 5 | 自身架势 | 0 | 6%/2/850 | 在 `bf_gongshi` 与 `bf_shoushi` 中选择其一，承·2 | — | 功能式；低耗内以收招 850 抵消 |
| 双使合印（绝招；原创扩展命名） | `mv_xiakedaozhangfa_heyin` | 7 | `aoe_pierce`·1–2·近身 | 2.60 | 9%/—/1200 | `bf_fengxue`·承·40%·2 | 可 | `3×0.90−0.08=2.62≈2.60` |

被动：`ps_xiakedaozhangfa_shangfa` 赏罚（1，目标有正向/负向状态时本功命中 +5）；`ps_xiakedaozhangfa_huanzhuan` 换转（5，每行动首次切换刚柔架势不耗行动）；`ps_xiakedaozhangfa_huazhi` 化执（8，心神减益持续 −1，最低 1）；`ps_xiakedaozhangfa_dacheng` 岛主印证（10，本功 Z3 +10%）。

### 2.4 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_xiakedaoshangshanshou` 赏善罚恶手**（5 玄中 · 拳脚/擒拿 · harmony · `0.60/0.40` · **原创扩展命名**）｜`reqs: sect {id:sect_xiakedao,rank:2}; prereq [{skill:sk_xiakedaoquanji,layer:4}]; hard [sect,prereq]`｜`layerStats seal 6 + hit 4 =10`｜获取：岛使传授；`setTags []`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 扣令 `mv_xiakedaoshangshanshou_kouling` | 1 | 单体·1 | 0.95 | `bf_fengxue`·承·20%·2 | `1−0.04=0.96≈0.95` |
| 问过 `mv_xiakedaoshangshanshou_wenguo` | 3 | 单体·1 | 1.10 | cd 1；目标带减益时命中 +10 | `1×(1+0.12)=1.12≈1.10` |
| 夺令 `mv_xiakedaoshangshanshou_duoling` | 5 | 单体·1 | 1.05 | cd 1；`bf_jiaoxie`·承·30%·1 | `1×1.12−0.06=1.06≈1.05` |

被动：`ps_xiakedaoshangshanshou_shan` 赏（对无减益目标效果命中 +5）；`ps_xiakedaoshangshanshou_e` 罚（对有减益目标 Z3 +6%）；`ps_xiakedaoshangshanshou_dacheng` 分明（10，封穴成功后自身获 `bf_dingxin` 1）。

**`sk_bizhenqingzhang` 碧针清掌**（6 玄上 · 拳脚/拳掌 · yin · `0.45/0.55`）｜谢烟客绝技；《侠客行》谢烟客演练此掌、须摒绝外扰的情节，回目**（待考）**｜`reqs attrs {wil:35}; aptitude {apFist:25}; hard []`｜招式：碧针 `mv_bizhenqingzhang_bizhen`（1.00，单体）、清掌 `mv_bizhenqingzhang_qingzhang`（0.95，远程，30% `bf_neishang`）、凝神一线 `mv_bizhenqingzhang_yixian`（1.35，需本行动未移动）｜被动：心无旁骛（未移动时命中 +10）、清气如针（内劲穿透 +8%）、大成（Z3 +8%）｜`setTags []`。

**`sk_konghegong` 控鹤功**（5 玄中 · 拳脚/指法 · harmony · `0.20/0.80`）｜谢烟客曾以此功较技的原著情节，人物与地点细节**（待考）**｜`reqs attrs {wil:30}; aptitude {apFinger:25}; prereq [{anyOf:[{skill:sk_xiakedaoquanji,layer:4},{skill:sk_shangqingquan06,layer:4}]}]; hard []`｜招式：摄物 `mv_konghegong_shewu`（0，拉取场景物 2 格）、控鹤 `mv_konghegong_konghe`（0.85，远程，拉敌 1）、文丞武尉 `mv_konghegong_wenchengwuwei`（1.20，把相邻轻型单位/物体投向目标，**原创扩展命名**）｜被动：隔空运劲、借物、圆满｜`setTags []`。

### 2.5 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_xiakedaoquanji` | 岛上拳基 | 侠客岛 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；10 重命中 +3；黄中层数预算 `hit 3+parry 3=6`；`setTags []` | 无 | **（原创扩展）** |
| `sk_xiakedaozhoufa` | 赏罚令杖法 | 侠客岛 | 兵器/奇门·令牌（neutral） | 侠客 | 六向横扫 0.90、击退 1；黄上层数预算 6；`setTags []` | 无 | 原著有赏善罚恶令；武学名与招式**（原创扩展命名）** |
| `sk_xiakedaojianji` | 石室剑基 | 侠客岛 | 兵器/剑（neutral） | 侠客 | 单体 1.00、直线 0.80；黄中层数预算 6 | 无 | **（原创扩展）** |

黄阶整体预算核对：三门耗内均以 5% 为基准；单体无附带 = 1.00，直线2 `AF 0.90×(1+cd1 0.12)=1.008≈1.00` 或在无 cd 时取 0.90，六向横扫 `0.85×1.12−击退0.05=0.902≈0.90`；每门 `layerStats≤6`，无绝招。

## 3. 雪山派 `sect_xueshan`

### 3.1 简介、总表与进阶链（7 门）

凌霄城雪山派以七十二路雪山剑法著称，白自在号“威德先生”；史小翠另创金乌刀法，逐招克制雪山剑法。《侠客行》对白自在、白万剑、史小翠、阿绣等人的师承与交锋有明确描写；七十二路全招名、无妄神功传授层级仍**（待考）**。本作以“寒梅剑、金乌刀、无妄内功”形成三角，但不把金乌刀写成雪山正统公传。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_taxuewuhen` | 踏雪无痕 | 轻功 | 8 地中 | yin | 武侠通称；归雪山派**（原创扩展）** | `set_xueshan_jinwu` |
| `sk_xueshanjianfa` | 雪山剑法 | 兵器/剑 | 6 玄上 | yin | 《侠客行》雪山派七十二路剑法 | `set_xueshan_jinwu` |
| `sk_wuwangshengong` | 无妄神功 | 内功 | 6 玄上 | yang | 《侠客行》雪山派内功，细节**（待考）** | `set_xueshan_jinwu` |
| `sk_jinwudaofa` | 金乌刀法 | 兵器/刀 | 6 玄上 | yang | 《侠客行》史小翠所创 | `set_xueshan_jinwu` |
| `sk_xueshanquan` | 雪山入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_lingxiaotuna` | 凌霄吐纳 | 内功 | 2 黄中 | yang | **（原创扩展）** | — |
| `sk_lingxiaorumenjian` | 凌霄入门剑 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`凌霄入门剑（黄上）→4 重→雪山剑法（玄上）→8 重→踏雪无痕（地中）`。这是一条门派综合进阶链，末段由剑术身法转入镇派轻功；金乌刀法、雪山剑法、无妄神功与踏雪无痕均登记 `set_xueshan_jinwu`。

### 3.2 地阶完整条目卡

#### `sk_taxuewuhen` 踏雪无痕（8 地中 · 轻功 · 雪山派）**（原创扩展）**

| 项 | 内容 |
|---|---|
| origin / source / nature | `expanded` / `[ch06_xiake,ch12_shujian,ch13_feihu,ch14_xueshan]` / `yin`，`wOut/wIn 0.30/0.70`；`QS(8)=104`。四界同名流传见 `design/08` §4.6；只有侠客来源属于雪山派职级，后世同名流传不表示雪山派开放 |
| reqs | `attrs {agi:35,con:30}`；`aptitude {apLight:35}`；`sect {id:sect_xueshan,rank:4}`；`prereq [{skill:sk_xueshanjianfa,layer:8}]`；`hard [sect,prereq]` |
| layerStats | `eva [2,8], resCold [2,7]`，合计 15；轻功无 `weaponReq` |
| 层数要点 | 1 重雪上轻；3 重冰不滑；4 重无痕；5 重逐风；**7 重绝招踏雪凌霄**；8 重寒地如常；10 重一羽无痕 |
| 获取 / 套装 | 雪山派 L4 传授；史小翠支线可 `reqsOverride {sect:null}`，仍保留剑法前置；`setTags [set_xueshan_jinwu]` |
| special | `fusible:true`；雪、冰、沙、沼的 `trackless +40` 只改变情境动作，不提高 `qgTier`（见 `design/08` §4.6） |
| 图鉴文本 | 武侠“踏雪无痕”意象在本作归入雪山派，作为侠客书界最高原生轻功；归属与全部招式为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 雪上轻（原创扩展命名） | `mv_taxuewuhen_xueshang` | 1 | 自身 | 0 | 6%/3/800 | `bf_shenqing`·承·2 | — | 功能式，不走伤害预算 |
| 冰不滑（原创扩展命名） | `mv_taxuewuhen_bingbu` | 3 | 自身 | 0 | 5%/2/800 | `bf_wenzhong`·承·2；本次移动免冰面滑行 | — | 功能式 |
| 无痕（原创扩展命名） | `mv_taxuewuhen_wuhen` | 4 | 自身 | 0 | 6%/2/800 | 移动 2 格；本行动不留下足迹 | — | 功能式，不走伤害预算 |
| 逐风（原创扩展命名） | `mv_taxuewuhen_zhufeng` | 5 | `aoe_dash n4` | 0 | 7%/3/900 | 最多移动4格，不穿单位 | — | 功能式 |
| 踏雪凌霄（绝招；原创扩展命名） | `mv_taxuewuhen_lingxiao` | 7 | `aoe_leap r4` | 2.55 | 9%/—/1200 | 跳斩；落点在雪/冰时自身 `bf_piaohu`·承·2 | 可 | `3×0.90−0.10（跳斩）−0.05（条件自益）=2.55` |

被动：`ps_taxuewuhen_wuhen` 无痕（1，雪沙冰沼不留足迹）；`ps_taxuewuhen_naishuang` 耐霜（4，resCold +8）；`ps_taxuewuhen_hanru` 寒地如常（8，上述地表移动成本最低1）；`ps_taxuewuhen_yiyu` 一羽无痕（10，`safeDrop +1`）。

**`sk_xueshanjianfa` 雪山剑法**（6 玄上 · 兵器/剑 · 雪山派；代表武学加详）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch06_xiake]` / `yin`，`wOut/wIn 0.60/0.40` |
| reqs | `attrs {agi:30,wil:30}`；`aptitude {apSword:25}`；`sect {id:sect_xueshan,rank:2}`；`prereq [{skill:sk_lingxiaorumenjian,layer:4}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `hit [1,5], parry [1,5]`，合计 10；`{category:sword}` |
| 层数要点 | 1 重梅枝初绽；3 重老枝横斜；4 重明驼西来；5 重朔风卷雪；**7 重绝招凌霄飞雪**；8 重七十二路会通；10 重雪岭无隙 |
| 获取 / 套装 | 白自在或白万剑门派线，L3 `maxLayer 8`、L4 9、L5 10；`setTags [set_xueshan_jinwu]` |
| special | `fusible:true`；与 `sk_jinwudaofa` 为 `counter`，仅招式克制，不让任一方凭空增阶 |
| 图鉴文本 | 七十二路剑法取梅枝、雪势与塞外景象，古朴与迅捷相间；本作只选代表动作做战斗按钮。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 梅枝初绽（原创扩展命名） | `mv_xueshanjianfa_meizhi` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 老枝横斜**（待考）** | `mv_xueshanjianfa_laozhi` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.00 | 8%/1/1000 | — | 可 | N=3、AF=0.85；`0.85×(1+0.12+0.05)=0.99≈1.00` |
| 明驼西来**（待考）** | `mv_xueshanjianfa_mingtuo` | 4 | `aoe_dash n3`·1–3 | 1.05 | 8%/1/1000 | 突进 | 可 | `1×(1+0.12+0.05)−0.10=1.07≈1.05` |
| 朔风卷雪（原创扩展命名） | `mv_xueshanjianfa_shuofeng` | 5 | `aoe_cone {r:2,angle:60,dirCount:6}` | 1.00 | 9%/2/1100 | `bf_hanqi`·承·30%·2 | 可 | N=4、AF=0.80；`0.80×(1+0.24+0.10+0.07)−0.03=1.098`，再扣寒地不衰减的情境价值 **【建议值】0.08** → **1.02≈1.00** |
| 凌霄飞雪（绝招；原创扩展命名） | `mv_xueshanjianfa_feixue` | 7 | `aoe_around` | 2.20 | 9%/—/1200 | `bf_jiansu`·承·50%·2 | 可 | N=6、AF=0.75；`3×0.75−0.05=2.20` |

被动：`ps_xueshanjianfa_hanmei` 寒梅（1，雪/冰地形命中 +5）；`ps_xueshanjianfa_bianzhi` 枝变（4，招架成功后下招收招 −100）；`ps_xueshanjianfa_qishier` 七十二路（8，同一目标连续使用不同招式时 Z3 +6%）；`ps_xueshanjianfa_wuxi` 雪岭无隙（10，parry +8）。

### 3.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_wuwangshengong` 无妄神功**（6 玄上 · 内功 · yang）｜`reqs attrs {con:30,wil:30}; aptitude {apInner:25}; sect {id:sect_xueshan,rank:3}; prereq [{skill:sk_lingxiaotuna,layer:5}]; hard [sect,prereq]`｜贡献 `mpMaxPct20+hpMaxPct12+2×8+5×1.8=57`；`stats resCold 6+resInjury 4=10`；`meridians [mer_dumai,mer_yangqiao]`（预留）｜招式：无妄守中（0，`bf_shouyi` 2）、雪岭运气（0，自身清 1 个 cold）、威德震掌（1.00，单体）｜被动：无妄、耐寒、圆满｜`setTags [set_xueshan_jinwu]`。

**`sk_jinwudaofa` 金乌刀法**（6 玄上 · 兵器/刀 · yang）｜史小翠为克制雪山剑法而创；按个人/`sect_jinwupai` 来源取得，不随雪山派职级开放；招数总数与逐名需复核修订版**（待考）**｜`reqs attrs {str:30,agi:30}; aptitude {apBlade:25}; prereq [{skill:sk_lingxiaorumenjian,layer:4}]; hard [prereq]`｜`layerStats hit5+pierce5=10`｜`setTags [set_xueshan_jinwu]`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 开门揖盗**（待考）** `mv_jinwudaofa_kaimen` | 1 | 单体·1 | 1.10 | 目标用剑时才可用；破招架率 ×0.85 | `1+0.15−0.05=1.10` |
| 梅雪逢夏**（待考）** `mv_jinwudaofa_meixue` | 3 | 单体·1·2 段 | 1.20 | cd2、耗内8%；每段均分 | `1+0.24+0.10=1.34`，扣多段触发封顶成本 **【建议值】0.15** → **1.20** |
| 长者折枝**（待考）** `mv_jinwudaofa_zhezhi` | 5 | 单体·1 | 1.25 | cd1；仅反制“老枝横斜”或剑类横扫后使用 | `1+0.12+0.15=1.27≈1.25` |
| 金乌融雪（原创扩展命名） `mv_jinwudaofa_rongxue` | 7 | `aoe_cone {angle:120,r:1,dirCount:6}` | 2.55 | 玄阶可选绝招；气势100、耗内8% | N=3、AF=0.85；`3×0.85=2.55` |

被动：`ps_jinwudaofa_kexue` 克雪（对剑招 Z3 +8%）；`ps_jinwudaofa_rilie` 日烈（命中带 cold 目标时清其 1 层正向寒势）；`ps_jinwudaofa_dacheng` 七十三变（10，不同招式连用命中 +6；招数说法**待考**）。

### 3.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_xueshanquan` | 雪山入门拳 | 雪山派 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；寒地站稳 | 无 | **（原创扩展）** |
| `sk_lingxiaotuna` | 凌霄吐纳 | 雪山派 | 内功（yang） | 侠客 | 贡献 `8+5+2×3+5×1=24`；`meridians [mer_dumai]` 预留 | 无 | **（原创扩展）** |
| `sk_lingxiaorumenjian` | 凌霄入门剑 | 雪山派 | 兵器/剑（neutral） | 侠客 | 单体 1.00、六向横扫 0.90；层数预算 6 | 无 | **（原创扩展）** |

黄阶预算：拳/剑 5% 耗内、单体 1.00；六向横扫 `0.85×1.12−0.05=0.902≈0.90`；内功 IP 精确 24；三门无绝招、`layerStats≤6`。

## 4. 长乐帮 `sect_changlebang`

### 4.1 简介、总表与进阶链（7 门）

长乐帮由贝海石等主持，石破天因相貌被误认作帮主；贝海石擅五行六合掌。帮会组织与人物行动据《侠客行》，普通帮众武学均为本作补位。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_wuxingliuhezhang` | 五行六合掌 | 拳脚/拳掌 | 7 地下 | harmony | 《侠客行》贝海石 | `[]` |
| `sk_changlezhang` | 长乐掌 | 拳脚/拳掌 | 4 玄下 | neutral | **（原创扩展）** | `[]` |
| `sk_changlexinfa` | 长乐心法 | 内功 | 5 玄中 | harmony | **（原创扩展）** | `[]` |
| `sk_changleqinna` | 堂口擒拿 | 拳脚/擒拿 | 4 玄下 | neutral | **（原创扩展）** | — |
| `sk_changlequan` | 长乐入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_changletuna` | 长乐吐纳 | 内功 | 1 黄下 | harmony | **（原创扩展）** | — |
| `sk_changlegun` | 堂口短棍 | 兵器/棍 | 2 黄中 | neutral | **（原创扩展）** | — |

进阶链：`长乐入门拳（黄中）→4 重→长乐掌（玄下）→6 重→五行六合掌（地下）`。长乐心法、长乐掌、五行六合掌组成 `legacy-set:changle_wuxing`。

### 4.2 地阶完整条目卡

#### `sk_wuxingliuhezhang` 五行六合掌（7 地下 · 拳脚/拳掌 · 长乐帮）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch06_xiake]` / `harmony`，`wOut/wIn 0.50/0.50` |
| reqs | `attrs {str:30,wil:35,wis:35}`；`aptitude {apFist:30}`；`sect {id:sect_changlebang,rank:3}`；`prereq [{skill:sk_changlezhang,layer:6}]`；`hard [sect,prereq]` |
| layerStats | `hit [2,8], parry [1,7]`，合计 15 |
| 层数要点 | 1 重五行起手；3 重相生；4 重相克；5 重六合；**7 重绝招五行归环**；9 重错位借势；10 重六合无隙 |
| 获取 / 套装 | 贝海石传授或长乐帮清算支线秘籍；`setTags []`；`fusible:true` |
| 图鉴文本 | 贝海石所擅掌法，以五行换势、六合封路；具体招式名与战棋轮转机制为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 金生水（原创扩展命名） | `mv_wuxingliuhezhang_jinshui` | 1 | 单体·1 | 1.00 | 7%/0/1000 | 命中后切换下一行势 | 可 | `1.00` |
| 木克土（原创扩展命名） | `mv_wuxingliuhezhang_mutu` | 3 | `aoe_pierce`·1–2 | 1.05 | 8%/1/1000 | `bf_pojia`·承·30%·2 | 可 | `0.90×1.17−0.03=1.02≈1.05` |
| 水火相济（原创扩展命名） | `mv_wuxingliuhezhang_shuihuo` | 4 | 单体·1 | 1.20 | 9%/2/1000 | 上一招与本招性质不同才可用 | 可 | `1+0.24+0.10+0.15=1.49`，扣转换收益 **【建议值】0.30** → **1.20** |
| 六合封门（原创扩展命名） | `mv_wuxingliuhezhang_fengmen` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.05 | 8%/2/1000 | `bf_suoding`·承·30%·1 | 可 | N=3、AF=0.85；`0.85×1.29−0.045=1.05` |
| 五行归环（绝招；原创扩展命名） | `mv_wuxingliuhezhang_guihuan` | 7 | `aoe_around` | 2.15 | 9%/—/1200 | 每命中一种不同状态目标，自身获 1 层 `bf_lianzhao`，最多 3 | 可 | N=6、AF=0.75；`3×0.75−0.10=2.15` |

被动：`ps_wuxingliuhezhang_xiangsheng` 相生（1，不同招式连用 Z3 +4%）；`ps_wuxingliuhezhang_xiangke` 相克（4，对带姿态目标效果命中 +8）；`ps_wuxingliuhezhang_liuhe` 六合（7，周围每有 1 名敌人 parry +2，最多 +6）；`ps_wuxingliuhezhang_dacheng` 无隙（10，行势循环满五次后回内 2%，仍受 6% 总上限）。

### 4.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_changlezhang` 长乐掌**（4 玄下 · 拳脚/拳掌 · neutral · **原创扩展**）｜前置 `sk_changlequan 4`，长乐帮 L2｜招式：迎客（1.00）、送客（1.05，击退1）、满堂乐（0.85横扫）｜被动：堂口声势、圆满｜`setTags []`。

**`sk_changlexinfa` 长乐心法**（5 玄中 · 内功 · harmony · **原创扩展**）｜前置 `sk_changletuna 5`｜贡献 `17+10+2×7+5×1.5=48.5`；`stats effRes5+resMind5=10`；`meridians [mer_renmai,mer_daimai]` 预留｜招式：调息（0，`bf_huinei` 2）、和气生财（0，`bf_dingxin` 2）｜被动：和气、帮众呼应、圆满｜`setTags []`。

**`sk_changleqinna` 堂口擒拿**（4 玄下 · 拳脚/擒拿 · neutral · **原创扩展**）｜`reqs aptitude {apGrapple:15}; sect {id:sect_changlebang,rank:2}; hard [sect]`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 拿腕 `mv_changleqinna_nawan` | 1 | 单体·1 | 0.95 | `bf_fengjingmai`·承·20%·1 | `1−0.04=0.96≈0.95` |
| 扣肩 `mv_changleqinna_koujian` | 3 | 单体·1 | 1.05 | cd1；`bf_waigong_jiang`·承·30%·2 | `1.12−0.03=1.09≈1.05` |
| 拖入堂口 `mv_changleqinna_tuoru` | 5 | 单体·1 | 1.10 | cd2；拉拽1 | `1.24−0.10=1.14≈1.10` |

被动：`ps_changleqinna_zhongren` 众人围拿（目标相邻己方≥2时命中+8）；`ps_changleqinna_dacheng` 手熟（10，擒拿效果命中+6）。

### 4.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_changlequan` | 长乐入门拳 | 长乐帮 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；堂口相邻命中 +3 | 无 | **（原创扩展）** |
| `sk_changletuna` | 长乐吐纳 | 长乐帮 | 内功（harmony） | 侠客 | `IP=6+4+2×2+5×1=19`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_changlegun` | 堂口短棍 | 长乐帮 | 兵器/棍（neutral） | 侠客 | 单体 1.00、六向横扫 0.95 | 无 | **（原创扩展）** |

黄阶预算：黄下内功 IP=19；两门外功基准式同 §3.4，层数预算均不超过 6，无绝招。

## 5. 玄素庄 `sect_xuansuzhuang`

### 5.1 简介、总表与进阶链（7 门）

石清、闵柔夫妇号“黑白双剑”，同出上清观，后居玄素庄；其夫妇并肩剑斗与江湖声名见《侠客行》，合璧武学总名为本作归纳**（原创扩展命名）**。本组不重复上清观公传剑法，而把夫妇长期配合发展为庄中支系。

| ID | 名称 | 类别 | 品阶 | nature | 标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_heibaijianfa` | 黑白双剑法 | 兵器/剑 | 8 地中 | harmony | **（原创扩展命名）** | `[]` |
| `sk_heibaijianshi` | 黑白剑势 | 兵器/剑 | 5 玄中 | harmony | **（原创扩展）** | `[]` |
| `sk_xuansuxinfa` | 玄素心法 | 内功 | 4 玄下 | harmony | **（原创扩展）** | `[]` |
| `sk_xuansushenfa` | 玄素身法 | 轻功 | 5 玄中 | harmony | **（原创扩展）** | `[]` |
| `sk_xuansuquan` | 玄素护庄拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_xuansuzhuanggong` | 玄素桩功 | 内功 | 2 黄中 | harmony | **（原创扩展）** | — |
| `sk_xuansurumenjian` | 玄素入门剑 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`玄素入门剑（黄上）→4 重→黑白剑势（玄中）→6 重→黑白双剑法（地中）`。四件本门武学与装备 `eq_xuansushuangjian` 共同候选 `legacy-set:xuansu_shuangjian`。

### 5.2 地阶完整条目卡

#### `sk_heibaijianfa` 黑白双剑法（8 地中 · 兵器/剑 · 玄素庄）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| origin / source / nature | `expanded` / `[ch06_xiake]` / `harmony`，`wOut/wIn 0.60/0.40` |
| reqs | `attrs {agi:35,wil:35}`；`aptitude {apSword:35}`；`sect {id:sect_xuansuzhuang,rank:4}`；`prereq [{skill:sk_heibaijianshi,layer:6}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `parry [2,8], hit [2,7]`，10 重合计 `8+7=15`；`{category:sword}` |
| 层数要点 | 1 重玄剑；2 重素剑；4 重黑白相济；5 重夫妻照应；**7 重绝招双剑合光**；8 重留手；10 重同心 |
| 获取 / 套装 | 石清、闵柔羁绊与玄素庄 L4；单人可完整施展，队友配剑只提供奖励；`setTags []` |
| special | `fusible:true`；不是“必须多人”的地阶合击类，故不计合击配额 |
| 图鉴文本 | 由石清、闵柔并肩用剑的原著表现归纳；单剑自成，双人相应时更善招架与追击。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 玄剑守墨（原创扩展命名） | `mv_heibaijianfa_xuan` | 1 | 单体·1 | 0.90 | 7%/0/1000 | 下次受击招架 +8 | 可 | `1−0.10（自益）=0.90` |
| 素剑留白（原创扩展命名） | `mv_heibaijianfa_su` | 2 | 单体·1 | 1.10 | 8%/1/1000 | 命中后撤 1 格 | 可 | `1+0.12+0.05−0.05（后撤【建议值】）=1.12≈1.10` |
| 黑白相济（原创扩展命名） | `mv_heibaijianfa_xiangji` | 4 | `aoe_pierce`·1–2 | 1.10 | 8%/1/1000 | 仅相邻配剑友军在场时获 `bf_xieli`·承·2 | 可 | `0.90×(1+0.12+0.05+0.15)−0.10=1.09≈1.10` |
| 夫妻照应（原创扩展命名） | `mv_heibaijianfa_zhaoying` | 5 | 自身架势 | 0 | 6%/2/850 | `bf_yuanhu`·承·2 | — | 功能式 |
| 双剑合光（绝招；原创扩展命名） | `mv_heibaijianfa_heguang` | 7 | `aoe_line n3` | 2.45 | 9%/—/1200 | 相邻配剑友军可追加 0.5 倍普攻；无友军照常释放 | 可 | N=3、AF=0.85；`3×0.85−0.10（可选追击价值【建议值】）=2.45` |

被动：`ps_heibaijianfa_heibai` 黑白（1，两式交替 Z3 +5%）；`ps_heibaijianfa_xiangshou` 相守（5，相邻友军被近战命中时每轮一次援护）；`ps_heibaijianfa_liushou` 留手（8，攻击剧情非死敌时可选择“制服”）；`ps_heibaijianfa_tongxin` 同心（10，有配剑友军时 parry +8，否则 hit +5）。

### 5.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_heibaijianshi` 黑白剑势**（5 玄中 · 兵器/剑 · harmony · **原创扩展**）｜前置 `sk_xuansurumenjian 4`｜招式：墨守（1.00）、留白（1.10，后撤1；后撤成本 **【建议值】**）、双锋（1.15两段）｜被动：交替用式 Z3 +5%、大成 parry +5｜`setTags []`。

**`sk_xuansuxinfa` 玄素心法**（4 玄下 · 内功 · harmony · **原创扩展**）｜前置 `sk_xuansuzhuanggong 5`｜贡献 `14+8+2×6+5×1.5=41.5`；`stats resMind5+effRes5=10`；`meridians [mer_renmai,mer_dumai]` 预留｜招式：玄素相济（0，`bf_dingxin`2）｜被动：夫妇相护、圆满｜`setTags []`。

**`sk_xuansushenfa` 玄素身法**（5 玄中 · 轻功 · harmony · **原创扩展**）｜`QS(5)=65`｜招式与核算：

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 错步 `mv_xuansushenfa_cuobu` | 1 | 自身 | 0 | 后撤1，不触发截击 | 功能式 |
| 双影 `mv_xuansushenfa_shuangying` | 4 | 自身 | 0 | `bf_piaohu`·承·2；相邻友军也得1回合 | 功能式；耗内7%、cd3 |
| 回身一剑 `mv_xuansushenfa_huishen` | 7 | 单体·1 | 1.05 | 仅本行动移动≥2格可用 | `1+0.15−0.10（身法接招）=1.05` |

被动：`ps_xuansushenfa_bingjian` 并肩（相邻友军时 eva +5）；`ps_xuansushenfa_dacheng` 双行（10，移动后首次招架 +8）。`setTags []`。

### 5.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_xuansuquan` | 玄素护庄拳 | 玄素庄 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；邻友时 parry +3 | 无 | **（原创扩展）** |
| `sk_xuansuzhuanggong` | 玄素桩功 | 玄素庄 | 内功（harmony） | 侠客 | `IP=8+5+2×3+5×1=24`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_xuansurumenjian` | 玄素入门剑 | 玄素庄 | 兵器/剑（neutral） | 侠客 | 单体 1.00；先守后攻 | 无 | 无专名，依夫妇剑术**（原创扩展命名）** |

黄阶预算：内功 IP 24；外功均 5% 基准、单体 1.00，`layerStats≤6`，无绝招。

## 6. 金刀寨 `sect_jindaozhai`

### 6.1 简介、总表与进阶链（7 门）

本作暂以金刀寨安奉日及七十二路劈卦刀为传承锚；安奉日与石清交手、刀法名称以及“招中藏套、套中含式”的原文字样均须逐字复核**（待考）**。其余寨中基础武学为本作补位。这里的“金刀”是寨号与兵器风格，不等同《碧血剑》金蛇剑。

| ID | 名称 | 类别 | 品阶 | nature | 标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_piguadao` | 七十二路劈卦刀 | 兵器/刀 | 7 地下 | neutral | 《侠客行》安奉日，名目与交手细节**（待考）** | `[]` |
| `sk_jindaokuaidao` | 金刀快刀 | 兵器/刀 | 5 玄中 | neutral | **（原创扩展）** | `[]` |
| `sk_jindaoxinfa` | 金刀心法 | 内功 | 4 玄下 | yang | **（原创扩展）** | `[]` |
| `sk_jindaobu` | 金刀寨步 | 轻功 | 4 玄下 | neutral | **（原创扩展）** | — |
| `sk_jindaoquan` | 金刀寨拳 | 拳脚/拳掌 | 1 黄下 | neutral | **（原创扩展）** | — |
| `sk_jindaozhuanggong` | 金刀桩功 | 内功 | 2 黄中 | yang | **（原创扩展）** | — |
| `sk_jindaorumen` | 金刀入门刀 | 兵器/刀 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`金刀入门刀（黄上）→4 重→金刀快刀（玄中）→6 重→七十二路劈卦刀（地下）`。心法、快刀、劈卦刀登记 `legacy-set:jindao_pigua`。

### 6.2 地阶完整条目卡

#### `sk_piguadao` 七十二路劈卦刀（7 地下 · 兵器/刀 · 金刀寨）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch06_xiake]` / `neutral`，`wOut/wIn 0.80/0.20` |
| reqs | `attrs {str:35,agi:30}`；`aptitude {apBlade:30}`；`sect {id:sect_jindaozhai,rank:4}`；`prereq [{skill:sk_jindaokuaidao,layer:6}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `hit [2,8], crit [1,7]`，15；`{category:blade}` |
| 层数要点 | 1 重劈挂；3 重套中含式；4 重转背刀；5 重连环三路；**7 重绝招七十二路归刀**；9 重藏套；10 重刀势不绝 |
| 获取 / 套装 | 安奉日传授或寨中刀谱；`setTags []`；`fusible:true` |
| 图鉴文本 | 本作按“招中藏套、套中含式”的待考线索整理七十二路劈卦刀，并把长套路压缩为“起套—转套—收套”的战棋节奏；原文字样与归属仍须核对。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 开扇劈挂（原创扩展命名） | `mv_piguadao_kaishan` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 套中含式（原创扩展命名） | `mv_piguadao_hanshi` | 3 | 单体·1·2段 | 1.20 | 8%/1/1000 | 第二段仅首段命中才出 | 可 | `1+0.12+0.05=1.17≈1.20` |
| 转背回刀（原创扩展命名） | `mv_piguadao_huidao` | 4 | `aoe_around` | 0.95 | 8%/2/1000 | — | 可 | N=6、AF=0.75；`0.75×1.29=0.9675≈0.95` |
| 连环三路（原创扩展命名） | `mv_piguadao_lianhuan` | 5 | `aoe_line n3` | 1.05 | 9%/2/1100 | 命中目标越少，每少1人倍率 +0.05（最多 +0.10） | 可 | N=3、AF=0.85；`0.85×1.41=1.20`，扣动态聚伤 **【建议值】0.15** → **1.05** |
| 七十二路归刀（绝招；原创扩展命名） | `mv_piguadao_guidao` | 7 | `aoe_cone {r:2,angle:60,dirCount:6}` | 2.30 | 9%/—/1200 | 命中后 `bf_lianzhao`·承·2 | 可 | N=4、AF=0.80；`3×0.80−0.10=2.30` |

被动：`ps_piguadao_cangtao` 藏套（1，每使用不同招式命中 +2，最多 +6）；`ps_piguadao_zhuanshi` 转式（4，横扫命中≥2时收招 −100）；`ps_piguadao_qishier` 七十二路（9，招式重复前一次则不吃藏套）；`ps_piguadao_dacheng` 刀势不绝（10，三招不同后下一招 Z3 +10%）。

### 6.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_jindaokuaidao` 金刀快刀**（5 玄中 · 兵器/刀 · neutral · **原创扩展**）｜前置 `sk_jindaorumen 4`｜招式：抢刀（1.00）、连劈（1.15两段）、压寨横扫（0.90）｜被动：先手 hit +5、连式、大成｜`setTags []`。

**`sk_jindaoxinfa` 金刀心法**（4 玄下 · 内功 · yang · **原创扩展**）｜前置 `sk_jindaozhuanggong 5`｜贡献 `14+8+2×6+5×1.5=41.5`；`stats resInjury5+defOut5=10`；`meridians [mer_dumai,mer_yangwei]` 预留｜招式：提刀运劲（0，`bf_waigong_sheng` 2）｜被动：刀沉气稳、圆满｜`setTags []`。

**`sk_jindaobu` 金刀寨步**（4 玄下 · 轻功 · neutral · **原创扩展**）｜`QS(4)=56`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 抢坡 `mv_jindaobu_qiangpo` | 1 | 自身 | 0 | 前移2，须落在较高或同高格 | 功能式 |
| 绕寨 `mv_jindaobu_raozhai` | 4 | 自身 | 0 | `bf_jixing`·承·2 | 功能式；耗内7%、cd3 |
| 追刀 `mv_jindaobu_zhuidao` | 7 | 单体·1 | 1.05 | 本行动移动≥3格才可用 | `1+0.15−0.10=1.05` |

被动：山路移动成本 −1（最低1）；高打低命中 +5；10 重疾行体力 −15%。

### 6.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_jindaoquan` | 金刀寨拳 | 金刀寨 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；近刀队友时命中 +2 | 无 | **（原创扩展）** |
| `sk_jindaozhuanggong` | 金刀桩功 | 金刀寨 | 内功（yang） | 侠客 | `IP=8+5+2×3+5×1=24`；`meridians [mer_dumai]` 预留 | 无 | **（原创扩展）** |
| `sk_jindaorumen` | 金刀入门刀 | 金刀寨 | 兵器/刀（neutral） | 侠客 | 单体 1.00、两段合计1.10（cd1） | 无 | **（原创扩展）** |

黄阶预算：内功 IP 24；入门外功以 5% 耗内核算，二段 `1+cd1 0.12=1.12≈1.10`；层数预算≤6，无绝招。

## 7. 上清观 `sect_shangqingguan`

### 7.1 简介、总表与进阶链（7 门）

石清、闵柔师出上清观；其剑术传承见《侠客行》，正式武学名与层级须复核**（待考）**。为避免与《碧血剑》仙都派的“上清剑法”混淆，本文运行 ID 加书界号 `06`，显示名保留“上清剑法”。

| ID | 名称 | 类别 | 品阶 | nature | 标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_shangqingjianfa06` | 上清剑法·侠客 | 兵器/剑 | 7 地下 | harmony | 《侠客行》上清观传承，名称**（待考）** | `[]` |
| `sk_shangqingqingjian06` | 上清轻剑 | 兵器/剑 | 5 玄中 | harmony | **（原创扩展命名）** | `[]` |
| `sk_shangqingxinfa06` | 上清心法·侠客 | 内功 | 5 玄中 | harmony | **（原创扩展命名）** | `[]` |
| `sk_shangqingyunbu06` | 上清云步 | 轻功 | 4 玄下 | harmony | **（原创扩展命名）** | — |
| `sk_shangqingquan06` | 上清入门拳·侠客 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_shangqingtuna06` | 上清吐纳·侠客 | 内功 | 2 黄中 | harmony | **（原创扩展）** | — |
| `sk_shangqingrujian06` | 上清入门剑·侠客 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`上清入门剑·侠客（黄上）→4 重→上清轻剑（玄中）→6 重→上清剑法·侠客（地下）`。上清剑法、上清轻剑与上清心法组成 `legacy-set:shangqing_xuansu`；玄素庄的师承联系只作叙事，不跨套。

### 7.2 地阶完整条目卡

#### `sk_shangqingjianfa06` 上清剑法·侠客（7 地下 · 兵器/剑 · 上清观）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch06_xiake]` / `harmony`，`wOut/wIn 0.65/0.35` |
| reqs | `attrs {agi:30,wil:35}`；`aptitude {apSword:30}`；`sect {id:sect_shangqingguan,rank:4}`；`prereq [{skill:sk_shangqingqingjian06,layer:6}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `parry [2,8], hit [2,7]`，15；`{category:sword}` |
| 层数要点 | 1 重清举；3 重云开；4 重玄白互见；5 重剑守灵台；**7 重绝招上清归真**；9 重双剑互证；10 重清静无碍 |
| 获取 / 套装 | 上清观 L4–L5；石清/闵柔羁绊来源可 `reqsOverride {sect:null}`，其余前置保留；`setTags []` |
| 图鉴文本 | 上清观剑术在本作的系统化版本，以轻灵、守中和回剑为主；招式命名均为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 清举式（原创扩展命名） | `mv_shangqingjianfa06_qingju` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 云开式（原创扩展命名） | `mv_shangqingjianfa06_yunkai` | 3 | `aoe_line n2` | 1.05 | 8%/1/1000 | — | 可 | N=2、AF=0.90；`0.90×1.17=1.053≈1.05` |
| 回剑守心（原创扩展命名） | `mv_shangqingjianfa06_shouxin` | 5 | 自身架势 | 0 | 6%/2/850 | `bf_shoushi`·承·2；受近战后 0.8 倍反击 | — | 功能式 |
| 玄素互见（原创扩展命名） | `mv_shangqingjianfa06_xuansu` | 6 | `aoe_pierce`·1–2 | 1.00 | 9%/2/1000 | 装配黑白剑势时 hit +8 | 可 | `0.90×(1+0.24+0.10)=1.21`，扣跨武学命中收益 **【建议值】0.20** → `1.01≈1.00` |
| 上清归真（绝招；原创扩展命名） | `mv_shangqingjianfa06_guizhen` | 7 | 单体·1 | 2.90 | 9%/—/1200 | 驱散自身 1 个 mind 减益 | 可 | `3−0.10=2.90` |

被动：`ps_shangqingjianfa06_qingjing` 清静（1，resMind +5）；`ps_shangqingjianfa06_huijian` 回剑（5，招架后 hit +6）；`ps_shangqingjianfa06_huzheng` 玄素互证（9，装配本套其他成员时 parry +6）；`ps_shangqingjianfa06_dacheng` 无碍（10，本功耗内 −10%）。

### 7.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_shangqingqingjian06` 上清轻剑**（5 玄中 · 兵器/剑 · harmony · **原创扩展命名**）｜前置 `sk_shangqingrujian06 4`｜招式：清风（1.00）、云过（0.95直线2）、回峰（1.10后撤1）｜被动：轻剑 parry +4、圆满｜`setTags []`。

**`sk_shangqingxinfa06` 上清心法·侠客**（5 玄中 · 内功 · harmony · **原创扩展命名**）｜前置 `sk_shangqingtuna06 5`｜贡献 `17+10+2×7+5×1.5=48.5`；`stats resMind5+effRes5=10`；`meridians [mer_renmai,mer_dumai]` 预留｜招式：清心（0，驱散1个mind）、守一（0，`bf_shouyi`2）｜被动：桥接（仅10重触发 `inner.bridge:true`）、圆满｜`setTags []`。

**`sk_shangqingyunbu06` 上清云步**（4 玄下 · 轻功 · harmony · **原创扩展命名**）｜`QS(4)=56`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 云步 `mv_shangqingyunbu06_yunbu` | 1 | 自身 | 0 | `bf_shenqing`·承·2 | 功能式；耗内6%、cd3 |
| 清风回廊 `mv_shangqingyunbu06_huilang` | 4 | 自身 | 0 | 后撤2，不触发截击 | 功能式；耗内5%、cd2 |
| 云外递剑 `mv_shangqingyunbu06_dijian` | 7 | 单体·1 | 1.05 | 移动≥2格后才可用 | `1+0.15−0.10=1.05` |

被动：屋顶移动成本 −1；移动后 parry +4；10 重 `safeDrop +1`。

### 7.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_shangqingquan06` | 上清入门拳·侠客 | 上清观 | 拳脚/拳掌（neutral） | 侠客 | 单体 1.00；守势时 parry +2 | 无 | **（原创扩展）** |
| `sk_shangqingtuna06` | 上清吐纳·侠客 | 上清观 | 内功（harmony） | 侠客 | `IP=8+5+2×3+5×1=24`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_shangqingrujian06` | 上清入门剑·侠客 | 上清观 | 兵器/剑（neutral） | 侠客 | 单体 1.00、直线2为0.95（cd1） | 无 | **（原创扩展）** |

黄阶预算：内功 IP 24；直线 `0.85×1.12=0.952≈0.95`，其余基准 1.00；层数预算≤6，无绝招。

## 8. 华山·穆人清一脉 `sect_huashan`

### 8.1 简介、总表与进阶链（7 门）

本节只定义《碧血剑》中穆人清—袁承志一脉的华山传承。跨书界同名华山门派仍复用 `sect_huashan`，但《笑傲江湖》的剑宗、气宗与独孤九剑由五岳图鉴定义；碧血可得的紫霞残承只引用 `sk_zixiashengong`，品阶 8，既不计入本节也不作为混元功必修前置。混元功、混元掌以及袁承志所学拳掌的名称与修炼关系见《碧血剑》，逐项授艺次序仍须核对修订版**（待考）**。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_hunyuangong` | 混元功 | 内功 | 9 地上 | yang | 《碧血剑》华山穆人清一脉 | `set_huashan_hunyuan` |
| `sk_hunyuanzhang` | 混元掌 | 拳脚/拳掌 | 6 玄上 | yang | 《碧血剑》，练掌养气的细节**（待考）** | `set_huashan_hunyuan` |
| `sk_tiezhijue` | 铁指诀 | 拳脚/指法 | 5 玄中 | yang | 《碧血剑》华山武学，使用者与回目**（待考）** | `set_huashan_hunyuan` |
| `sk_poyuquan` | 破玉拳 | 拳脚/拳掌 | 5 玄中 | yang | 《碧血剑》华山武学，名称与传授细节**（待考）** | `set_huashan_hunyuan` |
| `sk_huashanquan07` | 华山入门拳·碧血 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_huashantuna07` | 华山吐纳·碧血 | 内功 | 2 黄中 | yang | **（原创扩展）** | — |
| `sk_huashanrujian07` | 华山入门剑·碧血 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`华山吐纳·碧血（黄中）→5 重→混元掌（玄上）→8 重→混元功（地上）`。它把“由外而内”的练法落实为数据前置；破玉拳、铁指诀、混元掌与混元功共同登记 `set_huashan_hunyuan`。

### 8.2 地阶完整条目卡

#### `sk_hunyuangong` 混元功（9 地上 · 内功 · 华山·碧血支）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `yang`，`wOut/wIn 0.10/0.90` |
| reqs | `attrs {con:40,wil:40}`；`aptitude {apInner:35}`；`sect {id:sect_huashan,rank:4}`；`prereq [{skill:sk_hunyuanzhang,layer:8}]`；`hard [sect,prereq]` |
| inner.contribution | `mpMaxPct 36 + hpMaxPct 20 + 2×attrs 13 + 5×mpRegen 2.5 = 94.5`，恰等于地上预算；`attrs {con:6,str:4,wil:3}`；`stats {defOut:8,resInjury:7}`（15） |
| meridians | `[mer_renmai,mer_dumai]`（预留；任督并行） |
| 层数要点 | 1 重混元吐纳；3 重掌中养气；4 重内外相济；5 重抱元守一；**7 重绝招混元一气**；8 重由外入内；10 重混元圆满 |
| 获取 / 套装 | 穆人清门派线 L4；袁承志羁绊可 `reqsOverride {sect:null}`，仍保留混元掌前置；`setTags [set_huashan_hunyuan]` |
| special | `fusible:true, bridge:false`；不得把碧血紫霞残承当作本功满层材料 |
| 图鉴文本 | 华山一脉由掌势反复磨炼内息的上乘功法，内外渐合而劲力绵长；招式化与具体数值为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 混元吐纳（原创扩展命名） | `mv_hunyuangong_tuna` | 1 | 自身 | 0 | 7%/3/900 | `bf_guben`·承·2 | — | 功能式，不走伤害预算 |
| 掌中养气（原创扩展命名） | `mv_hunyuangong_yangqi` | 3 | 单体·1–3·远程 | 1.00 | 8%/1/1000 | — | 可 | `1×(1+0.12+0.05)×0.85=0.99≈1.00` |
| 抱元守一（原创扩展命名） | `mv_hunyuangong_shouyi` | 5 | 自身 | 0 | 7%/3/900 | `bf_shouyi`·承·3 | — | 功能式 |
| 混元一气（绝招；原创扩展命名） | `mv_hunyuangong_yiqi` | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_neishang`·承·50%·2 | 可 | `3−0.10=2.90` |

被动：`ps_hunyuangong_yangzhang` 养掌（1，混元掌与本功招式耗内 −5%）；`ps_hunyuangong_neiwai` 内外相济（4，外劲与内劲防御各 +5）；`ps_hunyuangong_youruwai` 由外入内（8，使用拳掌后下一次本功远程招式 Z3 +8%）；`ps_hunyuangong_dacheng` 混元圆满（10，每战首次内力低于 30% 时获 `bf_huinei`·承·2）。

### 8.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_hunyuanzhang` 混元掌**（6 玄上 · 拳脚/拳掌 · yang）｜`reqs attrs {str:30,con:30}; aptitude {apFist:25}; sect {id:sect_huashan,rank:2}; prereq [{skill:sk_huashantuna07,layer:5}]; hard [sect,prereq]`｜`layerStats hit5+defOut5=10`｜`setTags [set_huashan_hunyuan]`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 推山 `mv_hunyuanzhang_tuishan` | 1 | 单体·1 | 1.00 | 朴实掌击 | `1.00` |
| 混元双推 `mv_hunyuanzhang_shuangtui` | 3 | `aoe_pierce`·1–2 | 1.00 | cd1，贯穿两格 | `0.90×1.12=1.01≈1.00` |
| 内外合掌 `mv_hunyuanzhang_hezhang` | 5 | 单体·1 | 1.15 | 耗内7%，30% `bf_neishang`·2；须先用不同掌式 | `1+0.05−0.06+0.15=1.14≈1.15` |

被动：掌中养气（拳掌命中为混元功本回合回内 +0.5%，每回合 1 次）、沉稳（parry +4）、大成（连续命中同一目标时 hit +6）；招式命名均**（原创扩展命名）**。

**`sk_tiezhijue` 铁指诀**（5 玄中 · 拳脚/指法 · yang）｜出处《碧血剑》，具体使用者**（待考）**｜前置 `sk_huashanquan07 4`，门派 L2 硬门槛｜招式：铁指（1.00）、扣脉（0.95，`bf_fengxue` 30%·1）、弹刃（1.10，目标持械才可用，cd1）｜被动：指力、辨隙、大成｜`setTags [set_huashan_hunyuan]`。

**`sk_poyuquan` 破玉拳**（5 玄中 · 拳脚/拳掌 · yang）｜出处《碧血剑》，名称与拳路**（待考）**｜前置 `sk_huashanquan07 4`｜招式：试玉（1.00）、断纹（1.10，目标有护体时才可用）、碎玉（1.20，cd2）｜被动：对护盾 Z2 +8%、刚劲、大成｜`setTags [set_huashan_hunyuan]`。

### 8.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_huashanquan07` | 华山入门拳·碧血 | 华山·穆人清一脉 | 拳脚/拳掌（neutral） | 碧血 | 单体 1.00；高地命中 +2 | 无 | **（原创扩展）** |
| `sk_huashantuna07` | 华山吐纳·碧血 | 华山·穆人清一脉 | 内功（yang） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_dumai]` 预留 | 无 | **（原创扩展）** |
| `sk_huashanrujian07` | 华山入门剑·碧血 | 华山·穆人清一脉 | 兵器/剑（neutral） | 碧血 | 单体 1.00、突进 0.90（cd1） | 无 | **（原创扩展）** |

黄阶预算：入门拳、剑均按耗内 5%；突进式 `1×1.12−0.10=1.02`，考虑上坡不衰减的情境价值 **【建议值】0.10** 后取 0.90；吐纳 IP 精确 24；三门 `layerStats≤6`、无绝招。

## 9. 铁剑门 `sect_tiejian`

### 9.1 简介、总表与进阶链（8 门）

铁剑门在《碧血剑》中以木桑道人一脉出现，神行百变为其代表轻功；棋子暗器与漫天花雨手法同木桑形象关联，确切武学名和授受细节须逐回核对**（待考）**。本文保留一条正式剑法链，避免把“铁剑门”只做成轻功标签；其剑法总名为本作补名。神行百变在《鹿鼎记》复现时仍引用同一 ID，不另建九难版本。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_shenxing` | 神行百变 | 轻功 | 10 天下 | harmony | 《碧血剑》木桑道人；《鹿鼎记》九难传授 | `set_tiejian_musang` |
| `sk_tiejianjianfa` | 铁剑门剑法 | 兵器/剑 | 8 地中 | neutral | **（原创扩展命名）** | `set_tiejian_musang` |
| `sk_mantianhuayu` | 漫天花雨 | 暗器 | 6 玄上 | yin | 《碧血剑》暗器手法，名称与使用者**（待考）** | `set_tiejian_musang` |
| `sk_tiejianqipanjian` | 棋盘剑式 | 兵器/剑 | 5 玄中 | neutral | 木桑好弈意象**（原创扩展）** | `set_tiejian_musang` |
| `sk_tiejianxinfa` | 铁剑心法 | 内功 | 5 玄中 | harmony | **（原创扩展）** | `set_tiejian_musang` |
| `sk_tiejianquan` | 铁剑入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_tiejantuna` | 铁剑吐纳 | 内功 | 2 黄中 | harmony | **（原创扩展）** | — |
| `sk_tiejianrujian` | 铁剑入门剑 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`铁剑入门剑（黄上）→4 重→棋盘剑式（玄中）→6 重→铁剑门剑法（地中）`。棋盘剑式、铁剑门剑法、漫天花雨与神行百变均登记 `set_tiejian_musang`；铁剑心法也列为候选成员，使内功栏可参与成套。

### 9.2 天阶完整条目卡

#### `sk_shenxing` 神行百变（10 天下 · 轻功 · 铁剑门）

> **出处**：《碧血剑》木桑道人传袁承志身法，《鹿鼎记》九难传韦小宝相关逃命本领；传授层数与招式拆分**（待考）**，战斗按钮和数值为原创扩展。

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue,ch08_luding]` / `harmony`，`wOut/wIn 0.20/0.80`；`QS(10)=136` |
| reqs | `attrs {agi:50,wil:35}`；`aptitude {apLight:50}`；`prereq [{anyOf:[{skill:sk_tiejianqipanjian,layer:5},{skill:sk_tiejianxinfa,layer:5}]}]`；`hard [prereq]` |
| layerStats | `eva [3,12], hit [1,8]`，10 重合计 20；无 `weaponReq` |
| 层数要点 | 1 重移形；3 重百变；4 重踏隙；5 重趋避；6 重借隙疾行；**7 重绝招遁影百变**；8 重先机；10 重神行圆满 |
| 获取 | 碧血：木桑道人羁绊 `maxLayer 10`；鹿鼎：九难授艺 `maxLayer 5`（建议，细节待考），可由后续印证恢复；天阶不可观摩 |
| setTags / special | `[set_tiejian_musang]`；`fusible:false, observable:false`；`movement {staMul:{sprint:0.6},speedMul:{sprint:1.3},actionBonus:{leap:[8,20]}}`，与 `design/08` §4.6 一致 |
| 图鉴文本 | 身形忽前忽后、变化无方的上乘轻功，善于抢先、脱围与长途疾行；招式名称及战斗数值为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 移形（原创扩展命名） | `mv_shenxing_yixing` | 1 | 自身 | 0 | 8%/2/800 | 移动 3 格，不穿单位 | — | 功能式，不走伤害预算 |
| 百变（原创扩展命名） | `mv_shenxing_baibian` | 3 | 自身 | 0 | 8%/3/850 | `bf_canying`·承·1 | — | 功能式 |
| 踏隙（原创扩展命名） | `mv_shenxing_taxi` | 4 | 单体·1 | 1.05 | 9%/1/900 | 须本行动移动≥3格；绕背 | 可 | `1×(1+0.12+0.05−0.07+0.15)−0.15=1.10≈1.05` |
| 趋避（原创扩展命名） | `mv_shenxing_qubi` | 5 | 自身 | 0 | 10%/3/850 | `bf_piaohu`·承·2 | — | 功能式 |
| 借隙疾行（原创扩展命名） | `mv_shenxing_jiexi` | 6 | 自身 | 0 | 10%/3/850 | `bf_jisu`·承·2 | — | 功能式 |
| 遁影百变（绝招；原创扩展命名） | `mv_shenxing_dunying` | 7 | `aoe_dash n5` | 2.75 | 10%/—/1200 | 穿越敌人但不停留；仅攻击路径首敌；自身 `bf_dunzou`·承·2 | 可 | 路径首敌为单体攻击，`3×1.00−0.10（突进）−0.15（遁走）=2.75` |

被动：`ps_shenxing_bian` 百变（1，每回合首次被近战指定时 eva +8）；`ps_shenxing_jixing` 疾行（3，探索速度 ×1.3、疾行体力 ×0.6）；`ps_shenxing_xianji` 先机（8，开战获 `bf_xianji`·承·2）；`ps_shenxing_dacheng` 神行圆满（10，移动后第一次受击 eva +10，每行动 1 次）。

### 9.3 地阶完整条目卡

#### `sk_tiejianjianfa` 铁剑门剑法（8 地中 · 兵器/剑 · 铁剑门）**（原创扩展命名）**

| 项 | 内容 |
|---|---|
| origin / source / nature | `expanded` / `[ch07_bixue]` / `neutral`，`wOut/wIn 0.70/0.30` |
| reqs | `attrs {agi:35,wil:35}`；`aptitude {apSword:35}`；`sect {id:sect_tiejian,rank:4}`；`prereq [{skill:sk_tiejianqipanjian,layer:6}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `hit [2,7], parry [2,8]`，10 重合计 `7+8=15`；`{category:sword}` |
| 层数要点 | 1 重落子；3 重连星；4 重封路；5 重弃子；**7 重绝招满盘皆活**；8 重局外一步；10 重铁剑无隙 |
| 获取 / 套装 | 木桑道人 L4 传授；袁承志羁绊 `reqsOverride {sect:null}`；`setTags [set_tiejian_musang]` |
| 图鉴文本 | 本作依据木桑道人铁剑门身份与弈棋习性补出的门派剑路，以封路、腾挪和弃子争先为核心。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 落子式（原创扩展命名） | `mv_tiejianjianfa_luozi` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 连星式（原创扩展命名） | `mv_tiejianjianfa_lianxing` | 3 | `aoe_pierce`·1–2 | 1.00 | 7%/1/1000 | — | 可 | `0.90×1.12=1.01≈1.00` |
| 封路式（原创扩展命名） | `mv_tiejianjianfa_fenglu` | 4 | 单体·1 | 1.10 | 8%/1/1000 | `bf_jiansu`·承·50%·2 | 可 | `1+0.12+0.05−0.05=1.12≈1.10` |
| 弃子争先（原创扩展命名） | `mv_tiejianjianfa_qizi` | 5 | 单体·1 | 1.05 | 8%/1/1000 | 命中获 `bf_jisu`·承·2 | 可 | `1+0.12+0.05−0.10（自身增益）=1.07≈1.05` |
| 满盘皆活（绝招；原创扩展命名） | `mv_tiejianjianfa_manpan` | 7 | `aoe_chain`·1–3 | 2.30 | 9%/—/1200 | 最多弹射3敌，每跳 ×0.8；首目标 `bf_fengxue`·承·40%·1 | 可 | `3×0.80−0.08=2.32≈2.30` |

被动：`ps_tiejianjianfa_guanlu` 观路（1，未移动时 hit +5）；`ps_tiejianjianfa_qianhou` 前后手（4，移动后 parry +5）；`ps_tiejianjianfa_juciwuyi` 局外一步（8，击败目标可移动1格）；`ps_tiejianjianfa_dacheng` 铁剑无隙（10，连续使用不同招式时 Z3 +8%）。

### 9.4 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_mantianhuayu` 漫天花雨**（6 玄上 · 暗器 · yin）｜《碧血剑》暗器手法，木桑一脉归属**（待考）**｜`reqs attrs {agi:35}; aptitude {apHidden:30}; prereq [{skill:sk_tiejianqipanjian,layer:4}]; hard []`｜`layerStats hit6+crit4=10`｜`setTags [set_tiejian_musang]`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 一子 `mv_mantianhuayu_yizi` | 1 | 单体·2–5·投射 | 0.85 | 1 枚棋子 | `1×0.92=0.92`，扣弹药可回收优势 **【建议值】0.05** → **0.85** |
| 星罗 `mv_mantianhuayu_xingluo` | 3 | `aoe_cone {r:2,angle:60,dirCount:6}`·2–4·投射 | 0.65 | 3 枚棋子 | N=4、AF=0.80；`0.80×1.12×0.92=0.82`，扣多目标弹药覆盖价值 **【建议值】0.15** → **0.67≈0.65** |
| 满天花雨 `mv_mantianhuayu_huayu` | 5 | `aoe_around`·投射 | 0.75 | cd2；3 枚棋子；30% `bf_jiansu`·1 | N=6、AF=0.75；`0.75×1.24×0.92−0.03−0.05（无贴身限制）=0.776≈0.75` |

被动：拾子（战后返还一半未命中弹药）、听风（对投射 eva +6）、大成（首枚暗器 hit +8）。

**`sk_tiejianqipanjian` 棋盘剑式**（5 玄中 · 兵器/剑 · neutral · **原创扩展**）｜前置 `sk_tiejianrujian 4`｜招式：点目（1.00）、断线（0.95直线2）、劫争（1.15，cd1，目标刚行动后可用）｜被动：观局、争先、大成｜`setTags [set_tiejian_musang]`。

**`sk_tiejianxinfa` 铁剑心法**（5 玄中 · 内功 · harmony · **原创扩展**）｜前置 `sk_tiejantuna 5`｜贡献 `18+10+2×6+5×1.7=48.5`；`attrs {agi:3,wil:3}`；`stats eva5+resMind5=10`；`meridians [mer_renmai,mer_yangwei]` 预留｜招式：静局（0，`bf_dingxin`·2）、抢先（0，`bf_jisu`·2）｜被动：调息、定局、大成｜`setTags [set_tiejian_musang]`。

### 9.5 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_tiejianquan` | 铁剑入门拳 | 铁剑门 | 拳脚/拳掌（neutral） | 碧血 | 单体 1.00；移动后 hit +2 | 无 | **（原创扩展）** |
| `sk_tiejantuna` | 铁剑吐纳 | 铁剑门 | 内功（harmony） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_tiejianrujian` | 铁剑入门剑 | 铁剑门 | 兵器/剑（neutral） | 碧血 | 单体1.00、直线2为0.95（cd1） | 无 | **（原创扩展）** |

黄阶预算：拳剑基准 1.00；直线 `0.85×1.12=0.952≈0.95`；吐纳 IP 24；层数预算均≤6，无绝招。

## 10. 石梁派温家与金蛇郎君

### 10.1 传承简介、总表与进阶链（8 门）

石梁派温家五老以五行阵围攻金蛇郎君，温仪旧事与袁承志取得金蛇遗物构成《碧血剑》的复仇主线。本节把石梁派与其宿敌金蛇郎君并置，但两者不是同一门派：温家条目用 `sect_shiliang`，金蛇条目用 `sect:null, lineage:夏雪宜`。金蛇剑法和神行百变是本书界仅有两门天阶，不能互相转授；温家五行阵设计为一人可用的阵步掌法，多人同阵只获加成，不属于强制合击。

| ID | 名称 | 类别 | 品阶 | nature | 门派/来源 | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|---|
| `sk_jinshejian` | 金蛇剑法 | 兵器/剑 | 10 天下 | yin | 金蛇郎君夏雪宜 | 《碧血剑》金蛇秘笈 | `[]` |
| `sk_wenjiawuxingzhen` | 温家五行阵 | 杂学/阵法 | 8 地中 | harmony | 石梁派温家 | 五老围攻情节；阵式名**（待考）** | `[]` |
| `sk_jinsheyouzhang` | 金蛇游身掌 | 拳脚/拳掌 | 6 玄上 | yin | 金蛇郎君 | 名称据既有装备套装建议，原著是否有正式名**（待考）** | `[]` |
| `sk_jinshezhui` | 金蛇锥法 | 暗器 | 6 玄上 | yin | 金蛇郎君 | 原著有金蛇锥；“锥法”总名**（原创扩展命名）** | `[]` |
| `sk_shiliangwuxingzhang` | 石梁五行掌 | 拳脚/拳掌 | 5 玄中 | harmony | 石梁派温家 | **（原创扩展命名）** | `[]` |
| `sk_shiliangquan` | 石梁入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | 石梁派 | **（原创扩展）** | — |
| `sk_wenjiagong` | 温家桩功 | 内功 | 2 黄中 | yang | 石梁派 | **（原创扩展）** | — |
| `sk_shilianggun` | 石梁护院棍 | 兵器/棍杖 | 3 黄上 | neutral | 石梁派 | **（原创扩展）** | `[]` |

进阶链：`石梁入门拳（黄中）→4 重→石梁五行掌（玄中）→6 重→温家五行阵（地中）`。五行阵、五行掌与护院棍登记 `legacy-set:shiliang_wuxing`；金蛇剑法、金蛇游身掌、金蛇锥法登记既有候选 `legacy-set:jinshe_sanbao`，装备成员 `eq_jinshejian/eq_jinshezhui` 由 `design/10` 已登记。

### 10.2 天阶完整条目卡

#### `sk_jinshejian` 金蛇剑法（10 天下 · 兵器/剑 · 金蛇郎君）

> **出处**：《碧血剑》中夏雪宜所留金蛇秘笈与袁承志所得金蛇剑；具体招名、秘笈取得机关和剑式次序**（待考）**。本文所有招式名均按意象扩展；“金蛇吐信”也未完成修订版逐字核对，标作**（待考）**，不伪作已确认原文。

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `yin`，`wOut/wIn 0.55/0.45` |
| reqs | `attrs {agi:50,wil:40}`；`aptitude {apSword:50}`；`prereq [{anyOf:[{skill:sk_jinsheyouzhang,layer:6},{skill:sk_jinshezhui,layer:6}]}]`；`hard [prereq]` |
| layerStats / weaponReq | `hit [3,10], crit [2,10]`，合计 20；`{category:sword}` |
| 层数要点 | 1 重蛇行；3 重吐信；4 重盘身；5 重锥剑互证；**7 重绝招金蛇狂舞**；8 重奇诡难架；10 重金蛇化境 |
| 获取 | 华山金蛇洞 `puzzle maxLayer 10`；金蛇秘笈与金蛇剑共同解锁完整路线，失去剑不失传承但失装备联动；天阶不可观摩 |
| setTags / special | `[]`；`fusible:false, observable:false`；配 `eq_jinshejian` 的无视招架由其唯一特效 `ue_jinshejian_2` 施加 `bf_wushi_zhaojia`，武学本体不重复常驻 |
| 图鉴文本 | 路数盘旋奇诡、剑锋吞吐如蛇，配异形金蛇剑更难招架；具体招式和数值为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 蛇行入隙（原创扩展命名） | `mv_jinshejian_shexing` | 1 | 单体·1 | 1.00 | 8%/0/1000 | — | 可 | `1.00` |
| 金蛇吐信**（待考）** | `mv_jinshejian_tuxin` | 3 | `aoe_pierce`·1–2 | 1.10 | 9%/2/1000 | 30% `bf_jiaoxie`·1 | 可 | `0.90×(1+0.24+0.05)−0.06=1.10` |
| 盘身反噬（原创扩展命名） | `mv_jinshejian_panshen` | 4 | 自身架势 | 0 | 8%/2/850 | 受近战后以 0.9 倍反击并后撤1 | — | 功能式 |
| 锥剑同鸣（原创扩展命名） | `mv_jinshejian_zhuijian` | 5 | 单体·2–4·投射 | 0.90 | 8%/2/1000 | 需副手金蛇锥弹药；命中后下次剑招 hit +8 | 可 | `1×(1+0.24)×0.92−0.24（套装铺垫【建议值】）=0.90` |
| 逆鳞回锋（原创扩展命名） | `mv_jinshejian_nilinhui` | 6 | 单体·1 | 1.20 | 10%/2/1100 | 仅被招架后可用；绕背 | 可 | `1×(1+0.24+0.10+0.07+0.15)−0.15（绕背）−0.20（奇形剑路线适配【建议值】）=1.21≈1.20` |
| 金蛇狂舞（绝招；原创扩展命名） | `mv_jinshejian_kuangwu` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1.95 | 10%/—/1200 | 50% `bf_jiaoxie`·1；侧后目标视作 `asBack` | 可 | N=7、AF=0.70；`3×0.70−0.10（缴械）−0.05（方位）=1.95` |

被动：`ps_jinshejian_sheying` 蛇影（1，移动后 hit +5）；`ps_jinshejian_qigui` 奇诡（4，目标招架率 ×0.9）；`ps_jinshejian_zhuihe` 锥剑互证（5，副手金蛇锥时 crit +5）；`ps_jinshejian_nanjia` 难架（8，每 3 回合首次剑招获 `bf_wushi_zhaojia`·承·1，装备同效时不叠加）；`ps_jinshejian_huajing` 金蛇化境（10，从侧后命中后获 `bf_canying`·承·1）。

### 10.3 地阶完整条目卡

#### `sk_wenjiawuxingzhen` 温家五行阵（8 地中 · 杂学/阵法 · 石梁派）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `harmony`，`wOut/wIn 0.60/0.40` |
| reqs | `attrs {wil:35}`；`skills {formation:45}`；`sect {id:sect_shiliang,rank:3}`；`prereq [{skill:sk_shiliangwuxingzhang,layer:6}]`；`hard [sect,prereq]`；技艺为软门槛 |
| layerStats | `hit [2,7], parry [2,7]`，另 `effRes 1`，合计 15；阵法无 `weaponReq` |
| 层数要点 | 1 重守位；3 重相生；4 重补缺；5 重转位；**7 重绝招五行轮转**；8 重一人成阵；10 重五老合围 |
| 获取 / 套装 | 温家门派线、旧案和解路线；玩家一人即可使用全部招式；`setTags []` |
| special | `formation {minUnits:1,maxUnits:5}`；友军使用本套武学时每人仅令阵法招式 hit +2（最多 +8），不生成额外攻击，不标 `jointAttack` |
| 图鉴文本 | 温家五老合围之势的数据化：独行者以步位自转模拟五方，同伴到位只增强封路，绝不要求多人才能施展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 土守中宫（原创扩展命名） | `mv_wenjiawuxingzhen_tushou` | 1 | 自身架势 | 0 | 7%/2/850 | `bf_shoushi`·承·2 | — | 功能式 |
| 木行牵枝（原创扩展命名） | `mv_wenjiawuxingzhen_muxing` | 3 | 单体·1 | 1.05 | 7%/1/1000 | `bf_qianyin`·承·30%·1 | 可 | `1×1.12−0.03=1.09≈1.05` |
| 金位封锋（原创扩展命名） | `mv_wenjiawuxingzhen_jinwei` | 4 | `aoe_line n2` | 0.95 | 8%/1/1000 | 30% `bf_polu`·2 | 可 | N=2、AF=0.90；`0.90×(1+0.12+0.05)−0.03=1.023`，扣阵位封路价值 **【建议值】0.05** → **0.97≈0.95** |
| 水火换位（原创扩展命名） | `mv_wenjiawuxingzhen_shuihuo` | 5 | 自身 | 0 | 7%/2/850 | 与2格内友军换位；无友军时移动2格 | — | 功能式 |
| 五行轮转（绝招；原创扩展命名） | `mv_wenjiawuxingzhen_lunzhuan` | 7 | `aoe_around` | 2.25 | 9%/—/1200 | 每名相邻友军只令 hit +2；无友军照常施展 | 可 | N=6、AF=0.75；`3×0.75=2.25` |

被动：`ps_wenjiawuxingzhen_buwei` 步位（1，相邻友军每人 parry +2，最多 +6）；`ps_wenjiawuxingzhen_shengke` 生克（4，连续用不同五行式时 Z3 +5%）；`ps_wenjiawuxingzhen_yiren` 一人成阵（8，无相邻友军时 hit/parry 各 +4）；`ps_wenjiawuxingzhen_wulao` 五老合围（10，阵法范围内敌人移动成本 +1）。

### 10.4 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_jinsheyouzhang` 金蛇游身掌**（6 玄上 · 拳脚/拳掌 · yin）｜金蛇郎君意象；正式武学名**（待考）**｜前置 `sk_shiliangquan 4` 或金蛇秘笈来源覆写清空前置｜招式：游身（1.00）、吐信掌（1.05，后撤1）、缠身（0.95，30% `bf_jiansu`·2）｜被动：移动后 eva +5、侧击 Z3 +6%、大成残影｜`setTags []`。

**`sk_jinshezhui` 金蛇锥法**（6 玄上 · 暗器 · yin · **原创扩展命名**）｜原著有金蛇锥遗物，件数与手法细节**（待考）**｜`reqs attrs {agi:35,luk:30}; aptitude {apHidden:30}; skills {forge:25}; prereq [{skill:sk_jinsheyouzhang,layer:4}]; hard [prereq]`｜`layerStats hit5+crit5=10`｜`setTags []`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 蛇锥 `mv_jinshezhui_shezhui` | 1 | 单体·2–5·投射 | 0.90 | 单发 | `1×0.92=0.92≈0.90` |
| 三星吐信 `mv_jinshezhui_sanxing` | 3 | `aoe_cone {r:2,angle:60,dirCount:6}`·2–4·投射 | 0.75 | cd1，3枚均分 | N=4、AF=0.80；`0.80×1.12×0.92−0.05（弹药覆盖【建议值】）=0.77≈0.75` |
| 回锥 `mv_jinshezhui_huizhui` | 5 | 单体·2–5·投射 | 1.00 | cd2；若未命中返还弹药 | `1×1.24×0.92−0.15（返还弹药【建议值】）=0.99≈1.00` |

被动：认锥（战后回收50%）、蛇眼（侧后 hit +6）、大成（对带 `bf_polu` 目标 crit +6）。

**`sk_shiliangwuxingzhang` 石梁五行掌**（5 玄中 · 拳脚/拳掌 · harmony · **原创扩展命名**）｜前置 `sk_shiliangquan 4`｜招式：金劈（1.00）、水引（0.95拉1）、火进（1.10突进）、土守（0，`bf_shoushi`·2）、木缠（0.90横扫）｜被动：五式轮替、阵位、大成｜`setTags []`。

### 10.5 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_shiliangquan` | 石梁入门拳 | 石梁派温家 | 拳脚/拳掌（neutral） | 碧血 | 单体1.00；站定时 parry +2 | 无 | **（原创扩展）** |
| `sk_wenjiagong` | 温家桩功 | 石梁派温家 | 内功（yang） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_dumai]` 预留 | 无 | **（原创扩展）** |
| `sk_shilianggun` | 石梁护院棍 | 石梁派温家 | 兵器/棍杖（neutral） | 碧血 | 单体1.00、六向横扫0.90；`setTags []` | 无 | **（原创扩展）** |

黄阶预算：单体基准 1.00；六向棍横扫 `0.85×1.12−0.05=0.902≈0.90`；桩功 IP 24；三门层数预算≤6、无绝招。

## 11. 五毒教 `sect_wudu`

### 11.1 简介、总表与进阶链（7 门）

本节的五毒教是《碧血剑》何铁手一系，依裁定与《笑傲江湖》的五仙教 `sect_wuxian` 分立，也不与李莫愁的 `sk_wudumichuan` 合并。何铁手的钩、毒与软兵器形象见原著，蝎尾鞭、软红蛛索等正式名目及招式归属仍须以修订版核对**（待考）**。所有毒只引用 `design/06` 既有 Buff；淬毒依 C23 复用 `design/10` 的 `poisonCoat`，不保留旧提案 ID。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_xieweibian` | 蝎尾鞭 | 兵器/鞭索 | 8 地中 | yin | 《碧血剑》五毒教武学，正式名**（待考）** | `[]` |
| `sk_ruanhongzhusuo` | 软红蛛索 | 兵器/鞭索 | 6 玄上 | yin | 五毒教软索意象**（原创扩展命名）** | `[]` |
| `sk_wuduxinfa` | 五毒心法·碧血 | 内功 | 6 玄上 | yin | **（原创扩展命名）** | `[]` |
| `sk_hanshasheying` | 含沙射影 | 暗器 | 5 玄中 | yin | 《碧血剑》是否属何铁手一脉**（待考）** | `[]` |
| `sk_wuduquan` | 五毒入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_wudutuna` | 五毒吐纳·碧血 | 内功 | 2 黄中 | yin | **（原创扩展）** | — |
| `sk_wuduruobian` | 五毒入门软鞭 | 兵器/鞭索 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`五毒入门软鞭（黄上）→4 重→软红蛛索（玄上）→6 重→蝎尾鞭（地中）`。蝎尾鞭、软红蛛索、五毒心法和含沙射影共同登记 `legacy-set:wudu_tieshou`；何铁手毒钩 `eq_hetieshougou` 已由 `design/10` 登记为装备候选成员。

### 11.2 地阶完整条目卡

#### `sk_xieweibian` 蝎尾鞭（8 地中 · 兵器/鞭索 · 五毒教）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `yin`，`wOut/wIn 0.55/0.45` |
| reqs | `attrs {agi:35,wil:35}`；`aptitude {apWhip:35}`；`skills {poi:45}`；`sect {id:sect_wudu,rank:4}`；`prereq [{skill:sk_ruanhongzhusuo,layer:6}]`；`hard [sect,prereq]`，毒术为软门槛 |
| layerStats / weaponReq | `hit [2,8], effHit [2,7]`，合计 15；`{category:whip}` |
| 层数要点 | 1 重蝎针；3 重倒钩；4 重卷兵；5 重游丝；**7 重绝招百足蝎尾**；8 重毒随鞭走；10 重铁手无情 |
| 获取 / 套装 | 五毒教 L4；何铁手羁绊可 `reqsOverride {sect:null}`，其余前置保留；`setTags []` |
| special | `fusible:true`；未给武器淬毒时仍仅由招式明确施加毒，不凭门派身份常驻中毒 |
| 图鉴文本 | 软鞭如蝎尾回钩，兼以毒劲牵制；武学名和具体招式尚待原著核对，玩法效果为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 蝎针（原创扩展命名） | `mv_xieweibian_xiezhen` | 1 | 单体·1–2 | 0.95 | 7%/0/1000 | `bf_zhongdu`·承·50%·2 | 可 | `1−0.05=0.95` |
| 倒钩（原创扩展命名） | `mv_xieweibian_daogou` | 3 | 单体·1–2 | 1.10 | 7%/1/1000 | `bf_liuxue`·承·40%·2 | 可 | `1+0.12−0.10×0.40=1.08≈1.10` |
| 卷兵（原创扩展命名） | `mv_xieweibian_juanbing` | 4 | 单体·1–2 | 1.15 | 7%/2/1000 | `bf_jiaoxie`·承·40%·1 | 可 | `1+0.24−0.08=1.16≈1.15` |
| 游丝（原创扩展命名） | `mv_xieweibian_yousi` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.00 | 7%/2/1000 | `bf_zhongdu`·承·40%·1 | 可 | N=3、AF=0.85；`0.85×1.24−0.04=1.01≈1.00` |
| 百足蝎尾（绝招；原创扩展命名） | `mv_xieweibian_baizu` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 1.90 | 9%/—/1200 | `bf_judu`·承·50%·2；末格目标拉近1格 | 可 | N=7、AF=0.70；`3×0.70−0.10（剧毒按普通中毒双倍价值，条目级【建议值】）−0.10（拉拽）=1.90` |

被动：`ps_xieweibian_biandu` 鞭毒（1，毒术仅提高效果命中/强度，公式见 `design/03`）；`ps_xieweibian_huanshou` 换手（4，近身与隔格攻击均无贴身惩罚）；`ps_xieweibian_suidu` 毒随鞭走（8，对中毒目标 Z3 +8%）；`ps_xieweibian_dacheng` 铁手无情（10，每战首次缴械成功获 `bf_ruiyi`·承·1）。

### 11.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_ruanhongzhusuo` 软红蛛索**（6 玄上 · 兵器/鞭索 · yin · **原创扩展命名**）｜前置 `sk_wuduruobian 4`｜招式：蛛丝（0.95，减速30%）、牵蛛（0.90，拉1）、罗网（0.80，30% `bf_chanrao`·1）｜被动：软索射程2、毒蛛纹、大成｜`setTags []`。

**`sk_wuduxinfa` 五毒心法·碧血**（6 玄上 · 内功 · yin · **原创扩展命名**）｜`reqs attrs {con:30,wil:30}; aptitude {apInner:30}; skills {poi:35}; prereq [{skill:sk_wudutuna,layer:5}]; hard [prereq]`｜贡献 `21+12+2×8+5×1.6=57`；`attrs {con:4,agi:2,wil:2}`；`stats resPoison6+effRes4=10`；`meridians [mer_renmai,mer_daimai]` 预留｜招式：运毒（0，自身 `bf_bidu`·2）、毒引（0，目标 `bf_kangxing_jiang`·承·2，参数 poison）｜被动：识毒、毒劲、大成｜`setTags []`。

**`sk_hanshasheying` 含沙射影**（5 玄中 · 暗器 · yin）｜武学名与归属《碧血剑》五毒教**（待考）**｜`reqs attrs {agi:30}; aptitude {apHidden:25}; skills {poi:30}; hard []`｜`layerStats hit5+effHit5=10`｜`setTags []`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 喷筒 `mv_hanshasheying_pentong` | 1 | `aoe_cone {r:2,angle:60,dirCount:6}`·1–3·投射 | 0.65 | 3枚细针 | N=4、AF=0.80；`0.80×0.92−0.10（多目标弹药覆盖【建议值】）=0.636≈0.65` |
| 影中沙 `mv_hanshasheying_yingzhong` | 3 | 单体·2–4·投射 | 0.95 | cd1；30% `bf_zhongdu`·2 | `1×1.12×0.92−0.06=0.97≈0.95` |
| 迎面雨 `mv_hanshasheying_yingmian` | 5 | `aoe_line n3`·1–3·投射 | 0.85 | cd2；20% `bf_shimang`·1 | N=3、AF=0.85；`0.85×1.24×0.92−0.04−0.10（隐蔽起手【建议值】）=0.829≈0.85` |

被动：藏筒（首击效果命中 +8）、毒砂（淬毒弹药毒效 +10%）、大成（未被识破时 hit +6）。

### 11.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_wuduquan` | 五毒入门拳 | 五毒教·碧血 | 拳脚/拳掌（neutral） | 碧血 | 单体1.00；对中毒目标 hit +2 | 无 | **（原创扩展）** |
| `sk_wudutuna` | 五毒吐纳·碧血 | 五毒教·碧血 | 内功（yin） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_wuduruobian` | 五毒入门软鞭 | 五毒教·碧血 | 兵器/鞭索（neutral） | 碧血 | 单体1.00、隔格0.90；不自带毒 | 无 | **（原创扩展）** |

黄阶预算：拳与贴身鞭 1.00；隔格式因射程优势 −0.10 取 0.90；吐纳 IP 24；三门层数预算≤6、无绝招。

## 12. 仙都派 `sect_xiandu`

### 12.1 简介、总表与进阶链（7 门）

《碧血剑》仙都派以道门剑术见称；“上清剑法”及“两仪剑法”与仙都派的具体称谓、人物和出场回目须以修订版逐字核对**（待考）**。本节用书界号 `07` 与《侠客行》上清观条目分开。两仪剑法允许单人按阴阳两路交替完整施展，同伴持另一式只获得条件加成，故不标强制合击。

| ID | 名称 | 类别 | 品阶 | nature | 出处/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_shangqingjianfa07` | 上清剑法·碧血 | 兵器/剑 | 7 地下 | harmony | 《碧血剑》仙都派，名称与回目**（待考）** | `[]` |
| `sk_liangyijianfa07` | 两仪剑法·仙都 | 兵器/剑 | 6 玄上 | harmony | 《碧血剑》仙都派，正式名**（待考）** | `[]` |
| `sk_xianduxinfa` | 仙都心法 | 内功 | 5 玄中 | harmony | **（原创扩展）** | `[]` |
| `sk_lingbaoquan` | 灵宝拳 | 拳脚/拳掌 | 4 玄下 | yang | 仙都派武学名**（待考）** | `[]` |
| `sk_xianduquan` | 仙都入门拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_xiandutuna` | 仙都吐纳 | 内功 | 2 黄中 | harmony | **（原创扩展）** | — |
| `sk_xiandurumenjian` | 仙都入门剑 | 兵器/剑 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`仙都入门剑（黄上）→4 重→两仪剑法·仙都（玄上）→6 重→上清剑法·碧血（地下）`。上清剑法、两仪剑法、仙都心法与灵宝拳登记 `legacy-set:xiandu_shangqing`；显示名中的“上清”不构成跨书界同物。

### 12.2 地阶完整条目卡

#### `sk_shangqingjianfa07` 上清剑法·碧血（7 地下 · 兵器/剑 · 仙都派）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `harmony`，`wOut/wIn 0.65/0.35` |
| reqs | `attrs {agi:35,wil:30}`；`aptitude {apSword:30}`；`sect {id:sect_xiandu,rank:4}`；`prereq [{skill:sk_liangyijianfa07,layer:6}]`；`hard [sect,prereq]` |
| layerStats / weaponReq | `hit [2,8], parry [2,7]`，合计 15；`{category:sword}` |
| 层数要点 | 1 重清光；3 重上清；4 重两仪归一；5 重灵宝护身；**7 重绝招仙都云开**；8 重一剑两仪；10 重上清圆满 |
| 获取 / 套装 | 仙都派 L4；门派和解支线可得秘籍 `maxLayer 8`；`setTags []` |
| special | `fusible:true`；与 `sk_shangqingjianfa06` 无同源加速、无相互替代 |
| 图鉴文本 | 仙都派清正轻灵的上乘剑路，以阴阳换势、回锋守中为要；招式拆分和数值为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 清光式（原创扩展命名） | `mv_shangqingjianfa07_qingguang` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 上清回锋（原创扩展命名） | `mv_shangqingjianfa07_huifeng` | 3 | 单体·1 | 1.05 | 7%/1/1000 | 后撤1格 | 可 | `1+0.12−0.05（后撤【建议值】）=1.07≈1.05` |
| 两仪归一（原创扩展命名） | `mv_shangqingjianfa07_guiyi` | 4 | `aoe_pierce`·1–2 | 1.10 | 8%/2/1000 | 前招与本招阴阳路不同才可用 | 可 | `0.90×(1+0.24+0.05+0.15)−0.20=1.10` |
| 灵宝护身（原创扩展命名） | `mv_shangqingjianfa07_hushen` | 5 | 自身架势 | 0 | 7%/2/850 | `bf_shoushi`·承·2 | — | 功能式 |
| 仙都云开（绝招；原创扩展命名） | `mv_shangqingjianfa07_yunkai` | 7 | `aoe_line n3` | 2.50 | 9%/—/1200 | 命中首敌后自身 `bf_yuanzhuan`·承·2 | 可 | N=3、AF=0.85；`3×0.85−0.05（自益）=2.50` |

被动：`ps_shangqingjianfa07_qingguang` 清光（1，首招 hit +5）；`ps_shangqingjianfa07_liangyi` 两仪（4，阳路后阴路或反之 Z3 +6%）；`ps_shangqingjianfa07_yijian` 一剑两仪（8，无同伴也可触发全部换路效果）；`ps_shangqingjianfa07_dacheng` 上清圆满（10，招架后下一招收招 −100）。

### 12.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_liangyijianfa07` 两仪剑法·仙都**（6 玄上 · 兵器/剑 · harmony）｜仙都派传承名**（待考）**｜`reqs attrs {agi:30,wil:30}; aptitude {apSword:25}; sect {id:sect_xiandu,rank:2}; prereq [{skill:sk_xiandurumenjian,layer:4}]; hard [sect,prereq]`｜`layerStats hit5+parry5=10`｜`setTags []`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 阳仪进剑 `mv_liangyijianfa07_yangyi` | 1 | 单体·1 | 1.00 | 标记上一式为阳路 | `1.00` |
| 阴仪回剑 `mv_liangyijianfa07_yinyi` | 3 | 单体·1 | 1.05 | 后撤1；标记阴路 | `1+0.12−0.05（后撤【建议值】）=1.07≈1.05` |
| 两仪环转 `mv_liangyijianfa07_huanzhuan` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.05 | cd2；前式异路时 hit +8 | N=3、AF=0.85；`0.85×1.24=1.05` |

被动：两路（交替用式 Z3 +5%）、并肩（2格内友军用剑时 hit +3，非必要条件）、大成（交替成功后 parry +5）。单人可完整运转，不标 `jointAttack`。

**`sk_xianduxinfa` 仙都心法**（5 玄中 · 内功 · harmony · **原创扩展**）｜前置 `sk_xiandutuna 5`｜贡献 `17+10+2×7+5×1.5=48.5`；`attrs {agi:3,wil:4}`；`stats parry5+resMind5=10`；`meridians [mer_renmai,mer_dumai]` 预留｜招式：清心（0，驱散自身1个mind）、抱元（0，`bf_shouyi`·2）｜被动：阴阳桥接仅10重、清静、大成｜`setTags []`。

**`sk_lingbaoquan` 灵宝拳**（4 玄下 · 拳脚/拳掌 · yang）｜仙都派武学名与人物**（待考）**｜前置 `sk_xianduquan 4`｜招式：灵台（1.00）、宝印（1.10，cd1）、护法（0，`bf_shoushi`·2）｜被动：守中、拳剑相济、大成｜`setTags []`。

### 12.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_xianduquan` | 仙都入门拳 | 仙都派 | 拳脚/拳掌（neutral） | 碧血 | 单体1.00；守势 parry +2 | 无 | **（原创扩展）** |
| `sk_xiandutuna` | 仙都吐纳 | 仙都派 | 内功（harmony） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_renmai]` 预留 | 无 | **（原创扩展）** |
| `sk_xiandurumenjian` | 仙都入门剑 | 仙都派 | 兵器/剑（neutral） | 碧血 | 单体1.00、回锋1.05（cd1、后撤1） | 无 | **（原创扩展）** |

黄阶预算：单体 1.00；回锋 `1+0.12−0.05（后撤【建议值】）=1.07≈1.05`；吐纳 IP 24；三门层数预算≤6、无绝招。

## 13. 闯王军、山宗与江湖盟友 `sect_chuangwangjun`

### 13.1 简介、总表与进阶链（7 门）

本组收纳《碧血剑》闯王军中人物及金龙帮、青竹帮等地方盟友。焦公礼、青青等人物与帮会活动有原著依据，但“山宗拳法”“伏虎掌”“双枪枪法”的正式名称、传承边界与人物对应需逐项核对**（待考）**；为避免臆造，本文将不确定总名标为原创扩展命名。玩家加入的是叙事抽象 `sect_chuangwangjun`，金龙帮、青竹帮只作学习来源，不另造门派 ID。

| ID | 名称 | 类别 | 品阶 | nature | 来源/标注 | setTags |
|---|---|---|---:|---|---|---|
| `sk_fuhuzhang` | 伏虎掌 | 拳脚/拳掌 | 7 地下 | yang | 山宗/江湖人物，正式归属**（待考）** | `[]` |
| `sk_shuangqiangqiangfa` | 双枪枪法 | 兵器/枪 | 6 玄上 | neutral | 闯军人物用枪意象**（原创扩展命名）** | `[]` |
| `sk_shanzongquanfa` | 山宗拳法 | 拳脚/拳掌 | 5 玄中 | yang | 山宗人物传承**（原创扩展命名）** | `[]` |
| `sk_shanzongxinfa` | 山宗心法 | 内功 | 5 玄中 | yang | **（原创扩展命名）** | `[]` |
| `sk_chuangwangchangquan` | 闯军长拳 | 拳脚/拳掌 | 2 黄中 | neutral | **（原创扩展）** | — |
| `sk_chuangwangtuna` | 闯军吐纳 | 内功 | 2 黄中 | yang | **（原创扩展）** | — |
| `sk_chuangwangqiangji` | 闯军枪基 | 兵器/枪 | 3 黄上 | neutral | **（原创扩展）** | — |

进阶链：`闯军长拳（黄中）→4 重→山宗拳法（玄中）→6 重→伏虎掌（地下）`。伏虎掌、山宗拳法、山宗心法与双枪枪法登记 `legacy-set:chuangwang_shanzong`；金龙帮、青竹帮支线只提供其中一门玄阶的 `learnSource`，不改变成员 ID。

### 13.2 地阶完整条目卡

#### `sk_fuhuzhang` 伏虎掌（7 地下 · 拳脚/拳掌 · 山宗/闯王军）

| 项 | 内容 |
|---|---|
| origin / source / nature | `canonExpanded` / `[ch07_bixue]` / `yang`，`wOut/wIn 0.70/0.30`；武学名与人物归属**（待考）** |
| reqs | `attrs {str:35,con:30}`；`aptitude {apFist:30}`；`prereq [{skill:sk_shanzongquanfa,layer:6}]`；`hard [prereq]` |
| layerStats | `hit [2,8], pierce [2,7]`，合计 15；空手，无 `weaponReq` |
| 层数要点 | 1 重按虎；3 重伏身；4 重震胆；5 重开山；**7 重绝招伏虎镇关**；8 重军阵不退；10 重山宗大成 |
| 获取 / 套装 | 山宗人物羁绊、闯王军 L4；金龙帮调停支线只给 `maxLayer 7`；`setTags []` |
| special | `fusible:true`；无誓约、无耗血；门派来源与江湖来源共用同一武学 |
| 图鉴文本 | 劲路沉雄、重在压住正面与守住关口的掌法；其总名和具体招式待考，战斗机制为原创扩展。 |

| 招式 | ID | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---|---:|---|---:|---|---|---|---|
| 按虎（原创扩展命名） | `mv_fuhuzhang_anhu` | 1 | 单体·1 | 1.00 | 7%/0/1000 | — | 可 | `1.00` |
| 伏身进掌（原创扩展命名） | `mv_fuhuzhang_fushen` | 3 | 单体·1 | 1.05 | 7%/1/1000 | 突进1格 | 可 | `1+0.12−0.10=1.02≈1.05` |
| 震胆（原创扩展命名） | `mv_fuhuzhang_zhendan` | 4 | `aoe_cone {r:2,angle:60,dirCount:6}` | 0.90 | 6%/2/1000 | `bf_zhenshe`·承·30%·1 | 可 | N=4、AF=0.80；`0.80×(1+0.24−0.05)−0.045=0.91≈0.90` |
| 开山（原创扩展命名） | `mv_fuhuzhang_kaishan` | 5 | 单体·1 | 1.20 | 7%/2/1000 | 击退1 | 可 | `1+0.24−0.05=1.19≈1.20` |
| 伏虎镇关（绝招；原创扩展命名） | `mv_fuhuzhang_zhenguan` | 7 | `aoe_cone {r:3,angle:60,dirCount:6}` | 2.05 | 9%/—/1200 | `bf_dongyao`·承·40%·2 | 可 | N=7、AF=0.70；`3×0.70−0.10×0.40=2.06≈2.05` |

被动：`ps_fuhuzhang_jinghu` 惊虎（1，对 beast 标签目标 hit +5）；`ps_fuhuzhang_shouguan` 守关（4，身后有友军时 parry +5）；`ps_fuhuzhang_butui` 不退（8，本行动未移动则 Z4 +6%）；`ps_fuhuzhang_dacheng` 山宗大成（10，击退撞墙额外造成一次 0.15 倍撞击）。

### 13.3 玄阶紧凑卡（3 门；抽样 1 门）

**`sk_shuangqiangqiangfa` 双枪枪法**（6 玄上 · 兵器/枪 · neutral · **原创扩展命名**）｜闯军人物/青竹帮支线来源，原著人物用枪细节**（待考）**｜`reqs attrs {str:30,agi:30}; aptitude {apSpear:30}; prereq [{skill:sk_chuangwangqiangji,layer:4}]; hard [prereq]`｜`layerStats hit5+pierce5=10`｜`setTags []`。

| 招式 | 重 | 范围 | 倍率 | 一句效果 | 核算 |
|---|---:|---|---:|---|---|
| 一枪开路 `mv_shuangqiangqiangfa_kailu` | 1 | 单体·1–2 | 1.00 | 长兵拒敌 | `1.00` |
| 双枪并进 `mv_shuangqiangqiangfa_bingjin` | 3 | `aoe_pierce`·1–2 | 1.00 | cd1，两段均分 | `0.90×1.12=1.01≈1.00` |
| 回马双锋 `mv_shuangqiangqiangfa_huima` | 5 | 单体·1–2 | 1.20 | cd2；目标刚追击过才可用；两段均分 | `1+0.24+0.15−0.20（长兵反击与双段触发【建议值】）=1.19≈1.20` |

被动：并进（相邻持枪友军只加 hit +3，非必要条件）、拒马（首次近战受击 parry +6）、大成（直线招式 pierce +5）。

**`sk_shanzongquanfa` 山宗拳法**（5 玄中 · 拳脚/拳掌 · yang · **原创扩展命名**）｜前置 `sk_chuangwangchangquan 4`｜招式：立寨（1.00）、破门（1.10，cd1）、合围（0.85横扫）｜被动：军阵相邻 hit +3、守线、大成｜`setTags []`。

**`sk_shanzongxinfa` 山宗心法**（5 玄中 · 内功 · yang · **原创扩展命名**）｜前置 `sk_chuangwangtuna 5`｜贡献 `17+10+2×7+5×1.5=48.5`；`attrs {str:3,con:4}`；`stats defOut6+resInjury4=10`；`meridians [mer_dumai,mer_yangwei]` 预留｜招式：整队（0，自身 `bf_wenzhong`·2）、军心（0，相邻友军 `bf_dingxin`·1）｜被动：耐战、守阵、大成｜`setTags []`。

### 13.4 黄阶一行条目（3 门）

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_chuangwangchangquan` | 闯军长拳 | 闯王军/金龙帮 | 拳脚/拳掌（neutral） | 碧血 | 单体1.00；相邻友军时 hit +2 | 无 | **（原创扩展）** |
| `sk_chuangwangtuna` | 闯军吐纳 | 闯王军/青竹帮 | 内功（yang） | 碧血 | `IP=8+5+2×3+5×1=24`；`meridians [mer_dumai]` 预留 | 无 | **（原创扩展）** |
| `sk_chuangwangqiangji` | 闯军枪基 | 闯王军 | 兵器/枪（neutral） | 碧血 | 单体1.00、直线2为0.95（cd1） | 无 | **（原创扩展）** |

黄阶预算：拳/枪单体 1.00；枪直线 `0.85×1.12=0.952≈0.95`；吐纳 IP 24；三门层数预算≤6、无绝招。

## 14. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与逐书界路径唯一见 `design/07` §15.1～§15.3；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 雪山金乌 | `set_xueshan_jinwu` | `sk_taxuewuhen`、`sk_xueshanjianfa`、`sk_wuwangshengong`、`sk_jinwudaofa` |
| 华山混元 | `set_huashan_hunyuan` | `sk_hunyuangong`、`sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan` |
| 铁剑木桑 | `set_tiejian_musang` | `sk_shenxing`、`sk_tiejianjianfa`、`sk_mantianhuayu`、`sk_tiejianqipanjian`、`sk_tiejianxinfa` |

侠客岛、摩天、长乐、玄素、金刀、上清、金蛇、石梁、五毒、仙都与闯王山宗候选均已移除实际标签；装备草案也未进入 v1 成员。完整去向见 `design/07` §19。

## 15. 本组统计

### 15.1 门派 / 传承 × 大阶

| 门派 / 传承 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 侠客岛、谢烟客、罗汉伏魔 | 2 | 1 | 3 | 3 | 9 |
| 雪山派、金乌个人传承 | 0 | 1 | 3 | 3 | 7 |
| 长乐帮 | 0 | 1 | 3 | 3 | 7 |
| 玄素庄 | 0 | 1 | 3 | 3 | 7 |
| 金刀寨 | 0 | 1 | 3 | 3 | 7 |
| 上清观 | 0 | 1 | 3 | 3 | 7 |
| 华山·碧血支 | 0 | 1 | 3 | 3 | 7 |
| 铁剑门 | 1 | 1 | 3 | 3 | 8 |
| 石梁派、金蛇郎君 | 1 | 1 | 3 | 3 | 8 |
| 五毒教 | 0 | 1 | 3 | 3 | 7 |
| 仙都派 | 0 | 1 | 3 | 3 | 7 |
| 闯王军、山宗与盟友 | 0 | 1 | 3 | 3 | 7 |
| **合计** | **4** | **12** | **36** | **36** | **88** |

比例核对：`4:12:36:36 = 1:3:9:9`，精确满足 AR-01；天阶仅占 `4/88=4.55%`，保持最稀有。逐书界均为 `2/6/18/18=44`，故本文新增池的大阶占比均为 `4.55%/13.64%/40.91%/40.91%`。中武可习得池目标为“天 2%–6%、地 15%–20%、玄 33%–38%、黄 38%–45%”；本文新增池的地阶为 13.64%、玄阶为 40.91%，单文件不单独落入全部区间，必须与通用/跨界复现池合并后按 `rulings-v1.md` §3.6 校核，本文不重定义全局总池。

### 15.2 类别 × 大阶

| 大类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 2 | 1 | 9 | 11 | 23 |
| 拳脚 | 0 | 3 | 12 | 12 | 27 |
| 兵器 | 1 | 6 | 9 | 13 | 29 |
| 轻功 | 1 | 1 | 3 | 0 | 5 |
| 暗器 | 0 | 0 | 3 | 0 | 3 |
| 杂学/阵法 | 0 | 1 | 0 | 0 | 1 |
| **合计** | **4** | **12** | **36** | **36** | **88** |

兵器细分为剑 17、刀 4、棍/棍杖 2、鞭索 3、枪 2、奇门 1，合计 `17+4+2+3+2+1=29`。太玄经仍按内功计，不因可切换剑式重复计数；“赏罚令杖法”只计奇门 1 门。

### 15.3 天地阶限制与抽样

| 检查 | 算式 | 结果 |
|---|---|---|
| 玄阶逐招核算抽样 | 每节 1 门，共 12 门；`12/36=33.3%` | ≥30%，通过 |
| 地阶代价/誓约型 | 0/12 | 0%≤5%，通过 |
| 地阶强制合击类 | 0/12 | 0%≤3%，通过 |
| 地阶首个绝招 | 12/12 均在 7 重 | 通过 |
| 敌人专用 | 0 门 | 无需另表；88 门全部至少有一条玩家来源 |
| 内功 nature | 23/23 为 yin、yang 或 harmony | 无 neutral，通过 |
| 天阶白名单 | 4/4 对应基准 §13 | 无新增，通过 |

温家五行阵、黑白双剑法、两仪剑法和双枪枪法均可由单人完整施展；相邻队友只提高命中、招架或追加受限追击，因此不属于 `special.jointAttack`。本组也没有耗血、永久属性损失或誓约硬锁的地阶条目。

## 16. 境界覆盖与装配可行性

### 16.1 《侠客行》本土池

《侠客行》本文原生池为 44 门（2 天 / 6 地 / 18 玄 / 18 黄），其装配补齐不依赖携带武学：

| 装配类 | 至少三门本土可习得武学 | 同类装配说明 |
|---|---|---|
| 内功 | `sk_luohanfumo`、`sk_wuwangshengong`、`sk_changlexinfa`、`sk_xuansuxinfa`、`sk_jindaoxinfa`、`sk_shangqingxinfa06`，另有 6 门黄阶内功 | 远超内功 3 栏所需；入门来源分属六派，非互斥总池由散人/羁绊来源补齐 |
| 拳脚 | `sk_xiakedaozhangfa`、`sk_xiakedaoshangshanshou`、`sk_bizhenqingzhang`、`sk_konghegong`、`sk_wuxingliuhezhang`、`sk_changlezhang` 等 | 拳脚 3 栏可由侠客岛/谢烟客/长乐线补齐；至少三门不要求持械 |
| 兵器 | 剑：`sk_xiakedaojianji`、`sk_lingxiaorumenjian`、`sk_xueshanjianfa`、`sk_xuansurumenjian`、`sk_heibaijianshi`、`sk_heibaijianfa`、`sk_shangqingrujian06` 等 | 同类剑法至少 7 门，足够同时装配 3 个兵器栏，不以剑/刀/棍各一门凑数 |

为证明“数量存在”同时也是“单周目可取得”，下列三条基础访学来源构成章节投放契约。三条均在前两幕（前段/中前）或同时开放的支线入口出现，彼此不设阵营排斥、入门誓约或路线锁；同一角色可依次完成三条。教学事件与秘籍物品 ID 由《侠客行》章节文档分配，本文不越权新建。

| 非互斥入口（均为原创扩展） | 一次开放的本土三联（内功 / 拳脚 / 剑） | `LearnSource` 门槛契约 | 装配证明 |
|---|---|---|---|
| 凌霄城山道救援与外门试教（中前） | `sk_lingxiaotuna` / `sk_xueshanquan` / `sk_lingxiaorumenjian` | 门派玩家走 L1 `master`；散人完成救援后走 `master` 或 `manual`，若实现时基础条目增加门派/前置硬门槛，该来源必须顶层覆写 `reqsOverride {sect:null, prereq:[]}` | 提供第 1 门内功、拳脚与剑 |
| 玄素庄护送与庄客答谢（前段支线） | `sk_xuansuzhuanggong` / `sk_xuansuquan` / `sk_xuansurumenjian` | 不要求加入玄素庄；羁绊只影响报酬，不影响三门基础武学，必要时同样覆写 `sect/prereq` | 提供第 2 门内功、拳脚与剑 |
| 上清观山门调停与道童共修（中前支线） | `sk_shangqingtuna06` / `sk_shangqingquan06` / `sk_shangqingrujian06` | 不要求加入上清观，也不与雪山/长乐立场互斥；完成调停即可取得三门 `maxLayer≥4` 的来源，必要时同样覆写 `sect/prereq` | 提供第 3 门内功、拳脚与剑 |

因此，完全不计侠客岛后段、掌门羁绊或跨界携带，同一周目也已有三门黄阶内功、三门黄阶拳脚和三门黄阶剑法可达；三门兵器统一使用剑类主武器。即使玩家只带入 2/2/2，也可在本界补至 3/3/3；若只带 1/1/1，至少各再补两门。最高原生轻功是 `sk_taxuewuhen` 地中 8，另有玄素身法、金刀寨步、上清云步，严格不超过 `design/05` §14.6 #7 的地中上限。

### 16.2 《碧血剑》本土池

《碧血剑》本文原生池同为 44 门（2 天 / 6 地 / 18 玄 / 18 黄）：

| 装配类 | 至少三门本土可习得武学 | 同类装配说明 |
|---|---|---|
| 内功 | `sk_hunyuangong`、`sk_tiejianxinfa`、`sk_wuduxinfa`、`sk_xianduxinfa`、`sk_shanzongxinfa`，另有 6 门黄阶内功 | 本文独立提供≥11门；不依赖仅引用的紫霞残承 |
| 拳脚 | `sk_hunyuanzhang`、`sk_tiezhijue`、`sk_poyuquan`、`sk_jinsheyouzhang`、`sk_shiliangwuxingzhang`、`sk_lingbaoquan`、`sk_fuhuzhang` 等 | 拳脚 3 栏可从华山主线及地方支线补齐 |
| 兵器 | 剑：`sk_huashanrujian07`、`sk_tiejianrujian`、`sk_tiejianqipanjian`、`sk_tiejianjianfa`、`sk_jinshejian`、`sk_xiandurumenjian`、`sk_liangyijianfa07`、`sk_shangqingjianfa07` | 同类剑法至少 8 门，足够 3 个兵器栏；另有棍、鞭、枪与暗器路线 |

同样以三条可并行基础访学来源锁定单周目下限；它们均在前两幕或支线入口可达，不要求加入华山、铁剑门或仙都派，也不因主线阵营选择彼此关闭。教学事件与秘籍物品 ID 由《碧血剑》章节文档分配。

| 非互斥入口（均为原创扩展） | 一次开放的本土三联（内功 / 拳脚 / 剑） | `LearnSource` 门槛契约 | 装配证明 |
|---|---|---|---|
| 华山山脚运药与外门旁听（前段） | `sk_huashantuna07` / `sk_huashanquan07` / `sk_huashanrujian07` | 门派玩家走 L1 `master`；散人完成运药后由教习开放 `master` 或 `manual`，若基础条目增加门派/前置硬门槛，必须顶层覆写 `reqsOverride {sect:null, prereq:[]}` | 提供第 1 门内功、拳脚与剑 |
| 木桑棋局跑腿与铁剑门试教（前段支线） | `sk_tiejantuna` / `sk_tiejianquan` / `sk_tiejianrujian` | 不要求拜入铁剑门；棋局胜负只影响额外报酬，三门基础武学不互斥，必要时同样覆写 `sect/prereq` | 提供第 2 门内功、拳脚与剑 |
| 仙都派山道解围与抄谱（中前支线） | `sk_xiandutuna` / `sk_xianduquan` / `sk_xiandurumenjian` | 不要求加入仙都派，也不与华山/铁剑来源互斥；完成解围即可取得三门 `maxLayer≥4` 的来源，必要时同样覆写 `sect/prereq` | 提供第 3 门内功、拳脚与剑 |

故不计后段金蛇遗藏、门派高阶线或跨界携带，同一周目即可取得三门黄阶内功、三门黄阶拳脚和三门黄阶剑法；三门兵器统一使用剑类主武器。最高原生轻功仅 `sk_shenxing` 天下 10，完全匹配 `design/03` D-03 / `design/08`；它让专精路线到 qg5，而普通路线仍止于 qg4。本文为碧血登记两门本土天阶，仍满足基准 §13 的中武完整原生池 1–5 门范围；单周目实际高阶取得数由 `design/02` 投放与互斥定稿，但不得回收上述基础三联保底。

### 16.3 每门派硬约束矩阵

| 门派 | 黄阶入门拳/剑 | 黄→玄→地链 | 可成套组合 |
|---|---|---|---|
| 侠客岛 | 岛上拳基 | 岛上拳基→赏善罚恶手→侠客岛掌法 | 侠客岛石壁 |
| 雪山派 | 雪山入门拳、凌霄入门剑 | 凌霄入门剑→雪山剑法→踏雪无痕 | 雪山金乌 |
| 长乐帮 | 长乐入门拳 | 长乐入门拳→长乐掌→五行六合掌 | 长乐五行 |
| 玄素庄 | 玄素护庄拳、玄素入门剑 | 玄素入门剑→黑白剑势→黑白双剑法 | 玄素双剑 |
| 金刀寨 | 金刀寨拳 | 金刀入门刀→金刀快刀→七十二路劈卦刀 | 金刀劈卦 |
| 上清观 | 上清入门拳、上清入门剑 | 上清入门剑→上清轻剑→上清剑法·侠客 | 上清玄素 |
| 华山·碧血支 | 华山入门拳、华山入门剑 | 华山吐纳→混元掌→混元功 | 华山混元 |
| 铁剑门 | 铁剑入门拳、铁剑入门剑 | 铁剑入门剑→棋盘剑式→铁剑门剑法 | 铁剑木桑 |
| 石梁派 | 石梁入门拳 | 石梁入门拳→石梁五行掌→温家五行阵 | 石梁五行 |
| 五毒教 | 五毒入门拳 | 五毒入门软鞭→软红蛛索→蝎尾鞭 | 五毒铁手 |
| 仙都派 | 仙都入门拳、仙都入门剑 | 仙都入门剑→两仪剑法→上清剑法·碧血 | 仙都上清 |
| 闯王军 | 闯军长拳 | 闯军长拳→山宗拳法→伏虎掌 | 闯王山宗 |

“黄→玄→地”只要求可达前置链，不要求三门同一类别；雪山链末段转轻功、华山链末段转内功、石梁链末段转阵法，分别表达门派综合修行。每个地阶前置均在同书界可得，不形成闭环。

## 17. 本文新增术语与 ID

| 类别 | 数量 | 新增或引用说明 |
|---|---:|---|
| 武学 `sk_*` | 88 门定义 | 4 天、12 地、36 玄、36 黄；除基准四天阶与跨文档 `sk_zixiashengong`、`sk_wudumichuan` 引用外，本文表首定义均为本图鉴唯一归属 |
| 招式 `mv_*` | 以条目表为准 | 天/地全部逐招列出；12 门玄阶抽样逐招列出；其余玄阶紧凑列名，黄阶不分配逐招 ID |
| 被动 `ps_*` | 以条目表为准 | 天/地全部给 ID；玄阶抽样给 ID 或明确名称，黄阶以核心效果概括 |
| 套装候选 `set_*` | 15 | §14 列出；其中 `legacy-set:jinshe_sanbao` 沿用 `design/10`，其余交 `design/07` 判断是否收录 |
| 门派 `sect_*` | 0 个新增定义 | 本文引用现行 `design/17` 已定义的 12 个组织 ID，并按其名称、时代开放与职级称谓对齐；`sect_jinwupai` 仅作金乌刀法来源，不另计配额组 |
| 经脉 `mer_*` | 6 个预留引用 | `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_yangqiao`、`mer_yangwei`；定义归未来 `design/15` |
| Buff `bf_*` | 0 个新增 | 全部运行引用来自 `design/06` 当前目录；本文不提新增 Buff |
| 装备引用 | 5 | `eq_jinshejian`、`eq_jinshezhui`、`eq_hetieshougou`、`eq_jinsibeixin`、`eq_xuansushuangjian` 均已见 `design/10`；装备侧套装反向标签仍待 07/10 同步 |

本文出现的 `ch06_xiake`、`ch07_bixue`、`ch08_luding`、`ch12_shujian`、`ch13_feihu`、`ch14_xueshan` 均为基准既有书界 ID。招式/被动前缀遵循所属武学 ID；同名异传承的上清剑法追加 `06/07` 号。

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_xueshanjianfa` | `set_xueshan_jinwu` |
| `sk_zixiashengong` | `set_huashan_qijian` |

## 18. 数据校验规则与测试用例

### 18.1 构建期规则

| # | 校验 | 预期 |
|---|---|---|
| C1 | 从各节总表按 ID 去重计数 | `88 = 4/12/36/36`；侠客、碧血各 44 |
| C2 | `grade≥10` 对照基准 §13 | 只允许四个锚点，ID、品阶、类别与 `sourceChapters` 完全一致 |
| C3 | ID 与前缀 | `sk_<拼音>` 全仓唯一；完整卡的 `mv_/ps_` 以前缀关联所属武学；同名上清用 `06/07` |
| C4 | 外功字段 | `wOut+wIn=1`；兵器有合法 `weaponReq`；地阶 `layerStats≤15`、天阶≤20 |
| C5 | 内功字段 | 每门有非 neutral `nature`、贡献字段与 `meridians`；IP 在预算 ±5% |
| C6 | 前置 | 外层 `prereq` 为 AND，`anyOf` 至少两项、无嵌套/重复/自依赖；来源覆写按顶层替换 |
| C7 | 招式 | 天/地逐招有核算；公式误差≤0.05；核心天地阶首绝招≤7重 |
| C8 | Buff | 每个 `bf_*` 都在 `design/06` 目录，施加品阶为 `inherit` |
| C9 | 套装 | §14 成员与武学/装备的 `setTags` 双向闭合；跨文档装备缺口在依赖表报告 |
| C10 | 门派链 | 12/12 门派均有黄阶入门拳或剑、黄→玄→地链、至少一套组合 |
| C11 | 边界 | 敌专=0；地阶代价/誓约=0；强制合击=0；侠客最高轻功8、碧血最高轻功10 |
| C12 | 格式 | 无占位词、无断表/断句、代码围栏成对；黄阶仅一行表，玄阶抽样率≥30% |

### 18.2 最小测试用例

| 用例 | 输入 | 预期 |
|---|---|---|
| T1 配额 | 解析 12 张总表 | 得 88 个唯一 ID；天/地/玄/黄恰为 4/12/36/36 |
| T2 天阶负例 | 把任一玄阶临时改为 grade 10 | 构建失败：不在基准 §13 |
| T3 OR 前置 | 神行百变仅满足棋盘剑式5重 | 通过；两项均不满足时失败且只计一个缺项 |
| T4 技艺软门槛 | 蝎尾鞭满足门派与前置、但 `poi=40<45` | 可学，修炼倍率 ×0.7；不会被错误判为硬失败 |
| T5 单人阵 | 温家五行阵使用者无相邻友军 | 可施展五行轮转，并触发“一人成阵”；不等待合击单位 |
| T6 内功预算 | 混元功计算 | `36+20+2×13+5×2.5=94.5`，等于地上目标 |
| T7 轻功上界 | 过滤 `ch06_xiake/ch07_bixue` 的 movement | 最大品阶分别为8/10 |
| T8 套装闭合 | 遍历 §14 成员 | 本文武学全部反向含对应 `setTags`；装备缺口只报跨文档待同步 |
| T9 Buff 白名单 | 提取本文全部 `bf_*` 与 06 §14.4 做差集 | 差集为空 |
| T10 装配补齐 | 每书界过滤可学的 inner/unarmed/同一 weapon subType | 各至少3门；同类兵器不得用不同武器类别拼数 |

## 19. 待决事项 / 依赖

### 19.1 替下游给出的建议值

| # | 下游 | 建议值 | 本文当前处理 |
|---|---|---|---|
| D-1 | `design/07` | 收录 §14 的 15 个套装候选；最终阈值和奖励按 C22 及套装中位数规则计算 | 只登记成员与主题，不定义奖励 |
| D-2 | `design/10` | 已有 `eq_xuansushuangjian`（地中 8，成对剑）；建议补 `legacy-set:xuansu_shuangjian` 反向标签 | 本文只引用该装备，不计 88 门 |
| D-3 | `design/12/16` | 接入 §0.4 的五级武学开放清单；称谓已按现行 `design/17` 对齐 | 本文不给加入/晋升、月钱或资源规则 |
| D-4 | `design/15` | 收录六个预留经脉 ID，并确认每门内功的专精组合 | 只标专精，不定义经脉效果 |
| D-5 | `design/17` | 将相关组织条目中的旧候选武学 ID、品阶与分类反向同步为本文定稿清单 | 本文服从 17 的组织 ID、名称、时代和称谓；武学定义仍以本文为准 |
| D-6 | `design/01/02` 的《侠客行》《碧血剑》章节文档 | 落实 §16 的六条基础访学入口：两书界各三条、前两幕或同时开放支线可达、彼此不互斥，并分配教学事件与秘籍物品 ID | 本文只锁定可取得武学组合与非互斥契约，不越权定义章节事件或物品 |

### 19.2 本文依赖的上游事实

| # | 上游事实 | 状态 |
|---|---|---|
| U-1 | 基准 §13 四门天阶锚点与原生书界 | 已落实，不新增天阶 |
| U-2 | `design/05` 招式预算、内功 IP、层数节奏与装配字段 | 已按现行公式核算 |
| U-3 | `rulings-v1.md` C17 的 `reqs.skills/anyOf` 与 C22 套装闭合 | 已使用；待 R05/R07 合入唯一归属文档 |
| U-4 | `design/06` Buff 目录 | 已解决：本文 44 个唯一 Buff ID 全在现行目录，集合差集为空（见 §18 C8/T9） |

### 19.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| P-C1b-01 | 无新增基准修改提案 | AR-01、现行基准和裁定足以完成本图鉴；数量变化属于 `design/05` 图鉴总账同步，不改角色/武学上限等基准事实 |

### 19.4 原著考据待办

| # | 书名与待核内容 |
|---|---|
| K-1 | 《侠客行》：侠客岛石室数量、诗句与图谱关系；泥人数量及罗汉伏魔神功习得次序 |
| K-2 | 《侠客行》：雪山剑法七十二路逐招名、无妄神功传授层级、金乌刀法招数；金刀寨劈卦刀原文 |
| K-3 | 《侠客行》：谢烟客碧针清掌、控鹤功的出场与用法；上清观剑术正式名 |
| K-4 | 《碧血剑》：混元功、混元掌、铁指诀、破玉拳的授艺次序与具体使用者 |
| K-5 | 《碧血剑》：木桑道人棋子暗器、漫天花雨与神行百变的授艺层次；鹿鼎九难版本上限 |
| K-6 | 《碧血剑》：金蛇剑法与金蛇锥招名、件数、秘笈机关；“金蛇游身掌”是否为正式武学名 |
| K-7 | 《碧血剑》：温家五老阵势正式名称及站位；五毒教鞭索、含沙射影的正式归属 |
| K-8 | 《碧血剑》：仙都派上清剑法、两仪剑法、灵宝拳的正式名称、人物和回目 |
| K-9 | 《碧血剑》：伏虎掌、山宗拳法、双枪枪法的名称与人物；金龙帮、青竹帮可授武学边界 |

### 19.5 开放问题（附默认值）

| # | 问题 | 默认值（本文已据此完成） |
|---|---|---|
| O-1 | **已解决：**门派 ID、名称、时代开放与五级称谓以现行 `design/17` 为准（见 §0.4、§17）；其旧候选武学清单另列 D-5 反向同步 | 本文已按 17 的正式组织边界与称谓完成；武学 ID、品阶不倒退采用其“待收录”候选 |
| O-2 | 两套“上清剑法”是否合并？ | 不合并；原著组织不同，ID 用书界号 `06/07`，不互作前置 |
| O-3 | 温家五行阵、黑白双剑与两仪剑是否算合击？ | 均按单人完整可用、多人才加成；强制合击计数为0 |
| O-4 | 鹿鼎的神行百变是否另建武学？ | 不另建；同 ID 复现，九难来源建议 `maxLayer 5`，后续可印证 |
| O-5 | 套装候选是否全收录？ | 本文先全量登记成员；07 可删候选，但须同步移除所有成员反向 `setTags` |
| O-6 | `eq_xuansushuangjian` 是否保持一件成对装备？ | 默认沿用 `design/10` 已定的地中 8 成对剑；若后续拆成两件，07 与本文成员表同步替换 |

已有待决追溯：旧分工 55 门已由 AR-01 **解决**为 88 门（见 §0.1、§15.1）；C17 字段冲突已由裁定 **解决**（见 §18 C6）；C22 双向闭合口径已由裁定 **解决**，跨文档装备反向标签仍列为 D-1/D-2。
