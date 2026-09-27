# 门派武学图鉴 · 江湖通用武学与杂学总表（`skills-general`）

> **版本**：v1.2（审校 C1f.R；全局审计，2026-09-27）。

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴之一。本文唯一收录无门派通行武学、军中／镖局／武馆传承、序章《越女剑》教学武学、蓬莱派，以及不属于任何门派的医、毒、蛊、阵法、音律、书画、棋、易容、驭兽、音功与心神杂学。
> **上游**：`docs/decisions/author-requirements.md` AR-01～AR-03、AR-07～AR-08、AR-12～AR-13；`docs/decisions/author-decisions.md` P33、P35；`docs/00-canon.md` v1.2 §3～§7、§12～§13、§16、§20；`docs/decisions/rulings-v1.md` C12、C14～C17、C22～C23、§3～§5。
> **引用而不重定义**：字段、层数、招式与内功预算见 `design/05`；Buff 定义见 `design/06`；属性与技艺见 `design/03`；书界、压制、残篇与印证见 `design/02`；轻功门禁见 `design/08`；套装规则及最终数值交 `design/07`；门派历史、开放时代与职级称谓见 `design/17`；跨年代三卷、信物、配方、概率和投放见 `design/20`。门派内杂学仍归各门派图鉴，本文 §1.4 只作 ID 索引。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或投放；**（原创扩展命名）**为原著有其人其事而无正式武学名；**（待考）**为须以三联／广州修订版逐字核对的原著事实；【建议值】在 §14 登记。

---

## 0. 阅读指引与统一记法

### 0.1 数量、边界与书界缩写

- 本组没有基准 §13 天阶名录。AR-01 对“0～1 门天级”规定按旧目标 `90×1.5=135` 取整，并保持地／玄／黄约 `1:3:3`；本文固定为 **天 0／地 19／玄 58／黄 58，共 135 门**，即 `19:58:58≈1:3.05:3.05`。
- 地阶 19 门全部使用完整条目卡；玄阶 58 门使用紧凑卡，其中 21 门逐招展示核算，`21/58=36.21%≥30%`；黄阶 58 门按 AR-01 使用八列表格一行一门，并在各节给整体预算核对。
- `sk_yuenvjian@base` 是序章阿青／剑源教学形态，固定地上 9；与五绝图鉴的韩小莹版 `sk_yuenvjian02` 分立。正常序章来源上限为 3 重，跳过序章仅得 1 重残篇，轮回篇《越女剑·全本》来源上限为 6 重；离开序章均强制化残篇，不可直接携入天龙。后世三卷校合使用同一技能的 `legacy_complete` 形态（天下 10），不计普通第 52 门，且不等于轮回篇章。
- `sk_taizuchangquan` 的玩法权威定义在 `design/05` §13.5；本文只登记归属、全书界来源与套装候选。`sk_liuheqiang` 唯一定义归 `skills-wujue`，军中表只引用，不计入 135 门。
- `ALL14` 是本文排版别名，落库时展开为 `[ch01_tianlong,ch02_shediao,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch06_xiake,ch07_bixue,ch08_luding,ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`，不是新 ID。
- “首现”只用于唯一 ID 的统计归档；同一门通行武学在后世重新学习仍是本土来源，不重复计为新武学。军营、镖局、武馆是获取场景，均保持 `sect:null`；不可为了职级系统虚造“通用门派”。

### 0.2 完整卡字段、招式表与核算

完整卡字段服从 `design/05` §2：`category/subType/grade/origin/sect/lineage/sourceChapters/canonRef/nature/wOut/wIn/reqs/layerStats/inner/layers/moves/passives/setTags/conflicts/learnSources/special/description`。兵器卡另列 `weaponReq`。正文裸写 `bf_*` 是 `{id:bf_*,grade:inherit}` 的排版短写；落库时每个 Buff 实例都必须显式写 `grade:inherit`。完整卡若把“套装／获取”“特技／图鉴”合并成一行，斜线两侧仍分别对应 `setTags/learnSources` 与 `special/canonRef/description`；未另列的 `conflicts` 默认为空数组，不表示字段可省略。

招式表列固定为：`招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算`。

```text
power = AF × (1 + Σadj) × Kd × Kp − Σcost_buff − Σcost_disp
```

| 记号 | 本文用法（完整定义见 `design/05` §4.2） |
|---|---|
| `AF` | 按 `design/09` §5.3 的 `Nmax` 查表；常用：单体 1.00、线2 0.90、线3／六向横扫 0.85、六向锥2 0.80、周身 0.75；乱击等行为模板按其独立预算 |
| `cd+` | 每 1 回合 `+0.12` |
| `内±` | 相对大阶基准黄 5%／玄 6%／地 7%，每差 1pp 为 `±0.05` |
| `收±` | 相对 1000，每差 100 为 `±0.07` |
| `Kd/Kp` | 远程气劲 0.85、投射 0.92；不可招架 0.85 |
| 减益成本 | 硬控 `0.25×率×回合`；封穴／缴械 `0.20×率×回合`；数值减益、DOT `0.10×率` |
| 位移成本 | 击退 `0.05/格`；突进 0.10；绕背／换位 0.15 |
| 绝招 | `3.00×AF×Kd×Kp−成本`；气势100、耗内=大阶基准+2pp、收招1200 |

表内结果按 0.05 取整，允许误差 ±0.05。支援招 `power:0`，按标准单体治疗 18% `hpMax`、护体真气等价量或状态价值核对。玄阶未展示核算的条目仍采用同一模板，数据化时必须逐招跑 lint；黄阶整体核对见各节。

> AR-12 已把战斗改为六角格，并把点／环／面／扇形的最终范围语义交 `design/09`。本文的“横扫”统一落为 `aoe_cone {angle:120,r:1,dirCount:6}`，“锥2”统一落为 `aoe_cone {r:2,angle:60,dirCount:6}`；旧方格模板仅由迁移器读取，不得进入生产数据。

### 0.3 内功贡献与经脉预留

内功按 `design/05` §5.5：

```text
IP = mpMaxPct + hpMaxPct + 2×属性点 + 5×mpRegen
```

| 品阶 | IP 目标 | 本文标准配法 |
|---|---:|---|
| 3 黄上 | 30 | `10+6+2×4+5×1.2=30` |
| 4 玄下 | 41.5 | `14+8+2×6+5×1.5=41.5` |
| 5 玄中 | 48.5 | `17+10+2×7+5×1.5=48.5` |
| 6 玄上 | 57 | `20+12+2×8+5×1.8=57` |
| 7 地下 | 72 | `26+16+2×10+5×2.0=72` |
| 8 地中 | 83 | `30+18+2×12+5×2.2=83` |
| 9 地上 | 94.5 | `34+20+2×14+5×2.5=94.5` |

每门内功都显式标 `nature:yin/yang/harmony`。内功不使用 `layerStats`；完整卡显式写 `layerStats:null`，玄／黄紧凑卡未列该字段时同样按 `null` 展开，属性收益仅走 `inner.contribution.stats`。经脉只引用 `design/15` 的正式枚举；本文使用 `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_yinqiao`、`mer_yangqiao`、`mer_yinwei`、`mer_yangwei`，不定义穴位、周天或收益。

### 0.4 五级职级与授艺边界

本组唯一正式门派为蓬莱派 `sect_penglai`，其 ID、天龙开放状态与 T03 世俗门派模板服从已存在的 `design/17` §1.4、§3.1、§6.7。军中使用 T08，但那是官职／供奉关系，不是门派身份；镖局、武馆只是学习场景。月钱、禄米、器械和资源由 `design/16` 定义，本文不写。

| 级 | 蓬莱称谓（T03） | 本级新增可学 |
|---:|---|---|
| L1 | 外门弟子 | `sk_penglairumenquan`、`sk_haifengbu` |
| L2 | 入门弟子 | `sk_penglaiquan`、`sk_chaoyinxinfa` |
| L3 | 亲传／闭门弟子 | `sk_tianwangbuxin` |
| L4 | 长老／教习 | `sk_donghaichaoshengzhang` |
| L5 | 掌门 | 镇派目录访问权；不自动赠送已学层数 |

蓬莱硬前置链为 `sk_penglairumenquan` 4重（黄）→ `sk_penglaiquan` 5重（玄）→ `sk_donghaichaoshengzhang`（地），六门都登记 `set_penglai_chaosheng`。

### 0.5 `reqs`、来源与比例口径

- 技艺门槛仅用 C17 的 `reqs.skills` 十键：`med/poi/antidote/forge/alchemy/formation/music/art/chess/speech`；驭兽强度仍映射 `cha`，心神映射 `wil`，不虚造 `beast` 或 `mind` 技艺键。
- 二选一前置写作 `{anyOf:[{skill,layer},{skill,layer}]}`；外层各项为 AND。`hard` 只写存在的条件路径；来源豁免用 `reqsOverride` 顶层替换，不用旧 `special.altPrereq`。
- 地阶 19 门中代价型 0、誓约型 0、强制多人合击 0，均满足 5%／3% 上限；阵法可单人装配，多人站位只提供额外协同。本文无 `enemyOnly:true` 条目。
- 本文 0 门天阶；在各书界可习得池校核时，天阶仍只来自其他图鉴的基准封闭名录。新增 135 门不能直接叠加到 `rulings-v1` §3.6 的旧 90 门池而声称比例仍合格，整库重分配交 C3，见 §14.3。

---

## 1. 本组传承与数量一览

### 1.1 唯一归属与配额

| 分组 | 组织／来源 | 天 | 地 | 玄 | 黄 | 合计 | 主题 |
|---|---|---:|---:|---:|---:|---:|---|
| 序章剑源 | `sect:null`；`lineage: 阿青／越女剑源` | 0 | 1 | 3 | 6 | 10 | 教学、竹枝、越卒短兵 |
| 蓬莱派 | `sect_penglai` | 0 | 1 | 3 | 2 | 6 | 海潮吐纳、针、掌与身法 |
| 军中 | `sect:null`；军营／边镇教头 | 0 | 4 | 7 | 7 | 18 | 枪阵、骑射、军伍短兵 |
| 镖局 | `sect:null`；镖局／护院 | 0 | 2 | 6 | 6 | 14 | 护镖、解围、飞镖与脚程 |
| 武馆 | `sect:null`；市镇武馆 | 0 | 3 | 7 | 6 | 16 | 扎桩、拳腿、基础器械 |
| 江湖散人 | `sect:null`；散人／武师／秘笈 | 0 | 2 | 12 | 15 | 29 | 百家通行、全书界补位 |
| 无门派杂学 | `sect:null`；医家／艺人／方士／猎户 | 0 | 6 | 20 | 16 | 42 | 医毒蛊阵音书棋易容驭兽音功心神 |
| **合计** | ID 去重 | **0** | **19** | **58** | **58** | **135** | `19:58:58≈1:3.05:3.05` |

### 1.2 进阶链与套装候选速查

| 分组 | `黄 → 玄 → 地` 前置链 | 套装候选 |
|---|---|---|
| 序章剑源 | `sk_yuezu_duanjian` 4重 → `sk_zhuzhijianfa` 6重 → `sk_yuenvjian` | `legacy-set:yuenv_jianyuan` |
| 蓬莱 | `sk_penglairumenquan` 4重 → `sk_penglaiquan` 5重 → `sk_donghaichaoshengzhang` | `set_penglai_chaosheng` |
| 军中 | `sk_changqiangrumen` 4重 → `sk_duanzhenqiang` 5重 → `sk_pojunqiangfa` | `set_junwu_baizhan` |
| 镖局 | `sk_biaojurumen` 4重 → `sk_jiebiaodaofa` 5重 → `sk_sihaibiaodao` | `legacy-set:biaoju_sihai` |
| 武馆 | `sk_changquanrumen` 4重 → `sk_tongbeijin` 5重 → `sk_kaimenpiguaquan` | `legacy-set:wuguan_jiben` |
| 江湖散人 | `sk_jianghurumenjian` 4重 → `sk_qingfengjian` 5重 → `sk_jianghubaizhanjian` | `set_jianghu_baijia` |
| 医术 | `sk_caoyaozhi` 4重 → `sk_tuinaliaofa` 5重 → `sk_qihuangmifa` | `legacy-set:xinglin_qihuang` |
| 毒术 | `sk_biandufa` 4重 → `sk_baicaobiandu` 5重 → `sk_baidubianzheng` | `legacy-set:dujia_baicao` |
| 蛊术 | `sk_shiguchong` 4重 → `sk_biangufa` 5重 → `sk_baishouyujue` 不构成蛊链；蛊术最高止玄阶 | `legacy-set:guchong_mifa` |
| 阵法 | `sk_kanzhenfa` 4重 → `sk_xiaoqimen` 5重 → `sk_qimenbuzhen` | `legacy-set:qimen_jianghu` |
| 音律 | `sk_diqurumen` 4重 → `sk_qixianyin` 5重 → `sk_qingxinqupu` | `legacy-set:yayue_qingxin` |
| 易容 | `sk_gaizhuangfa` 4重 → `sk_suogugong` 5重 → `sk_huanyirongshu` | `legacy-set:huanyirong` |
| 驭兽 | `sk_xunquanshu` 4重 → `sk_yingshefa` 5重 → `sk_baishouyujue` | `legacy-set:baishou_xunyuan` |

蛊术没有硬凑地阶：无门派杂学总组已有多条黄→玄→地链，且 `sk_yanggujue`／`sk_biangufa` 作为通用蛊学只到玄阶，避免越权抢占五毒、五仙、白驼等门派高阶蛊毒。

### 1.3 跨组只引用清单

| 来源图鉴 | 只引用的 ID | 用途 |
|---|---|---|
| 五绝 | `sk_liuheqiang` | 射雕、神雕、倚天、碧血、鹿鼎、鸳鸯、书剑、飞狐军营可学；唯一归属仍为杨家将／五绝图鉴 |
| 五绝 | `sk_yuenvjian02` | 韩小莹版越女剑；与序章版分立，仅用 `legacy-set:yuenv_jianyuan` 候选关联 |
| 少林 | `sk_tieshazhang`、`sk_luohanquan` | 武馆教头可作演示或残承，不在本文重复定义 |
| 道家 | `sk_tiyunzong` | 中后期武馆／武当访学引用；最高轻功与来源仍由道家图鉴定义 |
| 其他新图鉴 | 各门派医毒阵音等 `sk_*` | §1.4 仅建立检索入口，定义与计数仍在所属图鉴 |

### 1.4 门派杂学索引边界

本文的“杂学总表”只定义无门派传承。桃花岛阵法／音律、星宿毒术、五仙蛊术、梅庄琴棋书画、药王门医毒、明教旗阵等均由所属图鉴维护；检索 UI 可按 `subType` 聚合显示，但数据不得复制。若同名通用技巧与门派秘传并存，必须使用不同 ID、明确品阶与来源，不以“民间粗浅版”偷渡原条目的招式或被动。

---

## 2. 序章《越女剑》教学传承（10 门）

### 2.1 `sk_yuenvjian` 越女剑法（9 地上 · 兵器／剑 · 调和）

> **原著**：《越女剑》中阿青以竹棒显出超凡剑理，并助越军习剑；具体传授规模、宫廷演武措辞与人物称谓须逐字核对**（待考）**。品阶、ID、序章残篇规则以基准 §13 与作者 P35 为准；招名除“越女剑”概括外均为**（原创扩展命名）**。

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:sword`；`grade:9`；`origin:canonExpanded`；`sect:null`；`lineage:阿青／剑源`；`sourceChapters:[ch00_yuenv]`；`forms:{legacy_complete:{formId:legacy_complete,grade:10,sourceCap:10,acquireOnlyBy:legacy_synthesis}}` |
| 性质／内外／兵器 | `nature:harmony`；`wOut/wIn:0.35/0.65`；`weaponReq:{category:sword}`；竹枝教学按剧情临时视作剑 |
| reqs | `attrs {agi:48,wis:45}`；`aptitude {apSword:50}`；`prereq:[{skill:sk_zhuzhijianfa,layer:6}]`；`hard:[prereq]`；阿青直授来源以 `reqsOverride {prereq:[],hard:[]}` 放开 |
| layerStats | `hit:[3,8]`、`eva:[3,7]`，第10重合计15；`base` 形态在正常序章最多3重、轮回篇最多6重，离章后残篇只保留真实已学层数；后世 `legacy_complete` 来源上限10重 |
| 层数要点 | 1重竹影；3重猿跃；5重一剑越甲；**7重绝招剑意无痕**（现行两种序章来源均不可达）；8～10重只作完整武学数据远景 |
| setTags／冲突 | `[]`；无冲突；与 `sk_yuenvjian02` 只是套装候选关联，不合并同源记录 |
| 获取 | `base`：正常序章随阿青观剑的主线节点【建议值：由 `chapters/00` 分配正式 `q_00_*`】，`maxLayer:3`；跳过序章直接得 `maxLayer:1` 残篇；轮回篇《越女剑·全本》按 `design/13` §6.4.3 最多6重，离章均转 `it_canye_yuenvjian`。后世：`legacy_fragment` 按1/2/3卷给 `sourceGrade:7,maxLayer:4/7/9`；`legacy_synthesis` 由 `lgs_yuenv_aqing` 校合为 `formId:legacy_complete,sourceGrade:10,maxLayer:10`，配方与投放唯一见 `design/20` §8 |
| special／图鉴 | `{fusible:false,prologueSeal:true}`；基础图鉴文案为“竹枝所指，剑理先于招名；这是玩家第一次看见地阶威力，也是不可带走的剑源一梦。”；取得后世全本时追加来源徽记“剑源归一”**（原创扩展）** |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 竹影点锋 `mv_yuenvjian_zhuying` | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | `bf_shiheng` 30%·1 | 可 | `1×(1+.12)−.10×.30=1.09≈1.10` |
| 白猿回枝 `mv_yuenvjian_huizhi` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | 击退1格 | 可 | N=3、AF=.85；`.85×(1+.24+.05)−.05=1.0465≈1.05` |
| 越甲一线 `mv_yuenvjian_yixian` | 5 | 线3·1–3·近身 | 1.20 | 9%/3/1000 | `bf_pojia` 40%·2 | 可 | N=3、AF=.85；`.85×(1+.36+.10)−.10×.40=1.20` |
| 剑意无痕 `mv_yuenvjian_wuhen` | 7 | 单体·1·绝招 | 2.50 | 9%/绝/1200 | 不可招架；`bf_dongyao` 50%·2 | 否 | `3×.85−.10×.50=2.50` |

| 被动 | ID | 重 | 类型／乘区 | 效果 |
|---|---|---:|---|---|
| 剑源 | `ps_yuenvjian_jianyuan` | 2 | mechanic | 以竹枝或剑均可施展；离章残篇只保留图鉴与忆起加速 |
| 目无成招 | `ps_yuenvjian_wuzhao` | 5 | stat·Z3 | 对本回合尚未行动者，本武学伤害 +5%→12% |
| 万甲辟易 | `ps_yuenvjian_wanjia` | 7 | trigger | 序章剧情演出可击退军阵；不作为常驻群体秒杀规则 |

> 序章演出强度只通过敌方抗性、场景编排与离章残篇规则实现，不改写招式倍率预算。
> `legacy_complete` 只覆写解析绝对品阶与来源上限，不复制招式、被动或第二个 `sk_*`；轮回篇《越女剑·全本》仍只是 `base` 形态最多 6 重的篇章来源。动态 `legacy_fragment` / `legacy_synthesis` 不写入 `sourceChapters`，不扩大 §11.5 的静态本土池。

### 2.2 玄阶紧凑卡（3 门；3/3 均展示核算）

#### `sk_zhuzhijianfa` 竹枝剑法（6 玄上 · 兵器／剑 · 调和）**（原创扩展命名）**——核算抽样

- 字段：`sect:null`；`lineage:阿青观竹`；`sourceChapters:[ch00_yuenv]`；`wOut/wIn:0.60/0.40`；`weaponReq:sword`；`reqs {aptitude:{apSword:32},prereq:[{skill:sk_yuezu_duanjian,layer:4}],hard:[prereq]}`；`layerStats {hit:[2,6],eva:[2,4]}`；`setTags:[]`。
- 招式：点竹 `_dianzhu`（L1单体 **1.10**，6%/1；`1+.12=1.12≈1.10`）；横枝 `_hengzhi`（L3 `aoe_cone {angle:120,r:1,dirCount:6}` **1.00**，7%/1；N=3、AF=.85，`.85×(1+.12+.05)=.9945≈1.00`）；穿林 `_chuanlin`（L6线2 **1.20**，8%/2；N=2、AF=.90，`.90×(1+.24+.10)=1.206≈1.20`）。被动“竹韧” `_zhuren`（招架+2→8）。
- 获取：阿青演示后由书灵拆解为可学套路；是 `sk_yuenvjian` 常规前置，不等于原著具名剑法。

#### `sk_baiyuanjianyi` 白猿剑意（5 玄中 · 杂学／心神 · 调和）**（原创扩展命名）**——核算抽样

- 字段：`sect:null`；`lineage:白猿与阿青交锋的观悟`；`sourceChapters:[ch00_yuenv]`；`wOut/wIn:0.20/0.80`；`reqs {attrs:{wis:35,wil:32},hard:[]}`；`layerStats {effRes:[2,6],hit:[1,4]}`；`setTags:[]`。
- 招式：观势 `_guanshi`（L1自身，6%/3，`bf_jingzhun`2，支援）；猿跃试锋 `_shifeng`（L3单体 **1.15**，7%/1，`bf_dongyao`30%；`1+.12+.05−.10×.30=1.14≈1.15`）；忘形 `_wangxing`（L6自身，`bf_dingxin`2，支援）。被动“先观后动” `_xianguan`（未攻击一回合后下一击 hit+5→12）。
- 出处：白猿与阿青以竹棒交锋是原著情节；把观悟拆成杂学为原创扩展。

#### `sk_yueyingshenfa` 越影身法（4 玄下 · 轻功 · 调和）**（原创扩展）**——核算抽样

- 字段：`sect:null`；`sourceChapters:[ch00_yuenv]`；`Q_skill=QS(4)=56`；`wOut/wIn:0.80/0.20`；`reqs {attrs:{agi:28},aptitude:{apLight:25},hard:[]}`；`layerStats {eva:[1,5],spd:[1,5]}`；`setTags:[]`。
- 招式：越溪 `_yuexi`（L1自身移2格，5%/2，支援位移）；踏叶 `_taye`（L4自身，6%/3，`bf_tengyue`2，支援）；回身点剑 `_huishen`（L6单体 **1.00**，6%/1，先换位；`1+.12−.15=.97≈1.00`）。被动“山野熟路” `_shanye`（草地移动耗力−10%）。
- 该身法只服务教学，不参与十四书界最高原生轻功统计。

### 2.3 黄阶一行卡（6 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_yuezu_duanjian` | 越卒短剑 | 越军教习 | 兵器／剑（3 黄上·neutral） | 序章 | 单体1.10与线2 .95；`setTags:[]` | 无 | **（原创扩展）** |
| `sk_yuezu_geshou` | 越卒戈手 | 越军教习 | 兵器／枪（2 黄中·yang） | 序章 | 线2 .90、命中后击退1；`setTags:[]` | 无 | **（原创扩展）** |
| `sk_shanyetuna` | 山野吐纳 | 山民 | 内功（3 黄上·harmony） | 序章 | `IP=10+6+2×4+5×1.2=30`；`mer_renmai`【建议值】 | 无 | **（原创扩展）** |
| `sk_muyangzhang` | 牧羊杖法 | 阿青日常技法 | 兵器／棍杖（2 黄中·neutral） | 序章 | 六向横扫.90、击退1；`setTags:[]` | 无 | **（原创扩展命名）** |
| `sk_xijiantoubu` | 溪涧投步 | 苎萝山山民 | 轻功（1 黄下·neutral） | 序章 | `Q_skill=QS(1)=32`，浅水移步教学 | 无 | **（原创扩展）** |
| `sk_fengshitoushu` | 风石投术 | 越地牧童 | 暗器（1 黄下·neutral） | 序章 | 投石单体 1.05，教学视线与遮挡 | 无 | **（原创扩展）** |

**黄阶预算核对**：3品攻击采用单体 `1+.12=1.12→1.10` 或线2 `.90×1.12=1.008→1.00`；2品线2有击退时为 `.90×1.12−.05=.958→.95`，横扫有击退时为 `.85×1.12−.05=.902→.90`；1品投射 `1×1.12×.92=1.03→1.05`。唯一内功精确命中 IP 30；两门轻／暗器无越阶效果。

---
## 3. 蓬莱派 `sect_penglai`（6 门）

### 3.1 门派边界与总表

`design/17` 已将蓬莱派登记为《天龙八部》都灵子一系、天龙 `O`、后世 `D`，使用 T03／T02 五级模板；驻地暂建议山东蓬莱，地望与都灵子、海风子名号均须核对原著**（待考：《天龙八部》青城蓬莱冲突相关人物与情节）**。本文不把民间海上武学自动算作蓬莱传承。

| ID | 名称 | 大类／子类 | 品阶 | nature | 前置 | 套装 | 标注 |
|---|---|---|---:|---|---|---|---|
| `sk_donghaichaoshengzhang` | 东海潮生掌 | 拳脚／拳掌 | 7 地下 | harmony | `sk_penglaiquan`≥5 | `set_penglai_chaosheng` | **（原创扩展）** |
| `sk_tianwangbuxin` | 天王补心针 | 暗器／暗器 | 6 玄上 | yin | `sk_chaoyinxinfa`≥5 | `set_penglai_chaosheng` | 名目与归属**（待考）** |
| `sk_penglaiquan` | 蓬莱拳 | 拳脚／拳掌 | 4 玄下 | harmony | `sk_penglairumenquan`≥4 | `set_penglai_chaosheng` | **（原创扩展命名）** |
| `sk_chaoyinxinfa` | 潮音心法 | 内功 | 5 玄中 | harmony | `sk_shanyetuna`≥4 或本门 L2 | `set_penglai_chaosheng` | **（原创扩展）** |
| `sk_penglairumenquan` | 蓬莱入门拳 | 拳脚／拳掌 | 2 黄中 | neutral | 无 | `set_penglai_chaosheng` | **（原创扩展）** |
| `sk_haifengbu` | 海风步 | 轻功 | 3 黄上 | harmony | 无 | `set_penglai_chaosheng` | **（原创扩展）** |

### 3.2 `sk_donghaichaoshengzhang` 东海潮生掌（7 地下 · 拳脚／拳掌 · 调和）

| 字段 | 值 |
|---|---|
| 基础 | `category:unarmed`；`subType:fist`；`grade:7`；`origin:expanded`；`sect:sect_penglai`；`lineage:都灵子一系`；`sourceChapters:[ch01_tianlong]`；`nature:harmony`；`wOut/wIn:0.55/0.45` |
| reqs | `attrs {con:38,agi:42}`；`aptitude {apFist:40}`；`sect {id:sect_penglai,rank:4}`；`prereq:[{skill:sk_penglaiquan,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `hit:[3,8]`、`parry:[2,7]`，合计15 |
| 层数 | 1重潮起；3重叠浪；5重回潮；7重绝招海天一线；10重潮息相应 |
| setTags／获取 | `[set_penglai_chaosheng]`；蓬莱 L4，或救援海风子支线【建议值：由 `chapters/01` 分配正式 `q_01_*`】（`reqsOverride {sect:null}`，仍保留前置） |
| special／图鉴 | `{fusible:true}`；“以潮声定吐纳，以往复掌劲逼敌失衡。本作据蓬莱海滨意象扩写。” |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 潮起 `mv_donghaichaoshengzhang_chaoqi` | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | `bf_shiheng` 30%·1 | 可 | `1+.12−.10×.30=1.09≈1.10` |
| 叠浪 `mv_donghaichaoshengzhang_dielang` | 3 | 线2·1–2·近身 | 1.10 | 8%/2/1000 | 击退1格 | 可 | N=2、AF=.90；`.90×(1+.24+.05)−.05=1.11≈1.10` |
| 回潮 `mv_donghaichaoshengzhang_huichao` | 5 | 周身·1·近身 | 0.95 | 9%/3/1000 | `bf_chihuan`100%；自身后撤1格 | 可 | N=6、AF=.75；`.75×(1+.36+.10)−.10−.05=.945≈.95` |
| 海天一线 `mv_donghaichaoshengzhang_haitian` | 7 | 线3·1–3·绝招 | 2.50 | 9%/绝/1200 | `bf_pojia`50%·2 | 可 | N=3、AF=.85；`3×.85−.10×.50=2.50` |

| 被动 | ID | 重 | 类型／乘区 | 效果 |
|---|---|---:|---|---|
| 潮息 | `ps_donghaichaoshengzhang_chaoxi` | 3 | stat·Z4 | 本回合先移动后出掌，Z4 +3%→8% |
| 往复 | `ps_donghaichaoshengzhang_wangfu` | 6 | trigger | 击退失败时改施加 `bf_shiheng` 1回合，每回合1次 |
| 海天 | `ps_donghaichaoshengzhang_haitian` | 10 | stat·Z3 | 水岸地形本武学伤害 +12% |

### 3.3 玄／黄阶紧凑卡

#### `sk_tianwangbuxin` 天王补心针（6 玄上 · 暗器 · 阴）——核算抽样

- `sect:sect_penglai`；`sourceChapters:[ch01_tianlong]`；`wOut/wIn:0.30/0.70`；`reqs {attrs:{agi:42,wis:40},aptitude:{apHidden:42},skills:{med:44},sect:{id:sect_penglai,rank:3},prereq:[{skill:sk_chaoyinxinfa,layer:5}],hard:[sect,prereq]}`；`layerStats {hit:[2,6],effHit:[2,4]}`；`setTags:[set_penglai_chaosheng]`。
- 招式：定心针 `_dingxin`（L1友方投射1–4，支援，6%/1，清1个 `mind`，不造成伤害）；补心针 `_buxin`（L3敌方投射单体 **1.15**，7%/2，`bf_fengxue`20%·1；`1×(1+.24+.05)×.92−.20×.20=1.15`）；天王散针 `_sanzhen`（L6乱击n3投射 **1.15**，8%/3；`.85×(1+.36+.10)×.92=1.14≈1.15`）。被动“认穴” `_renxue`（封穴命中+5→12）。
- 名目与都灵子一系的准确关系**（待考）**；不得据名称推定真实针灸疗效。

#### `sk_penglaiquan` 蓬莱拳（4 玄下 · 拳脚／拳掌 · 调和）**（原创扩展命名）**

- `reqs {sect rank:2,prereq:[sk_penglairumenquan≥4],hard:[sect,prereq]}`；`wOut/wIn:.70/.30`；`layerStats {hit:[1,5],parry:[1,5]}`；招式海门 `_haimen`（单体1.10，6%/1）、回帆 `_huifan`（横扫.85，7%/1）、望潮 `_wangchao`（单体1.20，7%/2，目标失衡时常见条件）；被动“听潮” `_tingchao`（水域 parry+3→8）；`setTags:[set_penglai_chaosheng]`。

#### `sk_chaoyinxinfa` 潮音心法（5 玄中 · 内功 · 调和）**（原创扩展）**

- `reqs {sect rank:2,prereq:[{anyOf:[{skill:sk_shanyetuna,layer:4},{skill:sk_penglairumenquan,layer:5}]}],hard:[sect,prereq]}`；`inner IP=17+10+2×7+5×1.5=48.5`，`attrs {con:2,agi:2,wis:2,wil:1}`、`stats {parry:5,resMind:5}`；`meridians:[mer_chongmai,mer_daimai]`【建议值】。招式听潮调息 `_tiaoxi`（自身，6%/3，`bf_dingxin`2）、回潮护脉 `_humai`（友方单体，8%/3，治疗18%）；被动“潮生” `_chaosheng`（水域 mpRegen+0.2→0.5）。`setTags:[set_penglai_chaosheng]`。

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_penglairumenquan` | 蓬莱入门拳 | 蓬莱 L1 | 拳脚／拳掌（2 黄中·neutral） | 天龙 | 单体1.10、六向横扫.90；`set_penglai_chaosheng` | 无 | **（原创扩展）** |
| `sk_haifengbu` | 海风步 | 蓬莱 L1 | 轻功（3 黄上·harmony） | 天龙 | `Q_skill=45`；水岸移动体力×.9；`set_penglai_chaosheng` | 无 | **（原创扩展）** |

**黄阶预算核对**：入门拳单体 `1+.12=1.12→1.10`、六向横扫 `.85×1.12−.05=.902→.90`；海风步只提供黄上 QS 与情境耗力，不越过 qg 境界。

---

## 4. 军中通行武学（18 门）

### 4.1 目录、投放与链路

军中来源使用 `sect:null`；军职只在 `learnSources` 事件检查 `design/17` T08 的 L1～L5，不写进 `reqs.sect`。`sk_liuheqiang` 只引用五绝图鉴，不计本节 18 门。

| 大阶 | ID | 名称 | 类别 | 首现／主要复现 | 前置 | setTags |
|---|---|---|---|---|---|---|
| 地上9 | `sk_pojunqiangfa` | 破军枪法 | 兵器／枪 | 射雕；神雕、倚天、碧血 | `sk_duanzhenqiang`≥5 | `set_junwu_baizhan` |
| 地中8 | `sk_baizhanxinfa` | 百战心法 | 内功 | 射雕；神雕、倚天、碧血 | `sk_jundituna`≥6 | `set_junwu_baizhan` |
| 地中8 | `sk_yanmengqishe` | 雁门骑射 | 暗器 | 天龙；射雕、神雕 | `sk_bianshe`≥6 | `[]` |
| 地下7 | `sk_shouchengzhen` | 守城军阵 | 杂学／阵法 | 神雕；倚天、碧血 | `sk_shouchengfa`≥5 | `set_junwu_baizhan` |
| 玄上6 | `sk_duanzhenqiang` | 断阵枪 | 兵器／枪 | 射雕；神雕、倚天 | `sk_changqiangrumen`≥4 | `set_junwu_baizhan` |
| 玄上6 | `sk_junzhongdao` | 军中刀法 | 兵器／刀 | 天龙；明清各界 | `sk_junwuduandao`≥4 | `set_junwu_baizhan` |
| 玄上6 | `sk_zhenqijian` | 阵旗剑 | 兵器／剑 | 神雕；倚天、碧血 | `sk_junwuchangjian`≥4 | `set_junwu_baizhan` |
| 玄中5 | `sk_bianshe` | 边塞射法 | 暗器 | 天龙；射雕、神雕、书剑 | `sk_gongshou`≥4 | `[]` |
| 玄中5 | `sk_jundituna` | 军旅吐纳 | 内功 | 天龙；ALL14 | 无 | `set_junwu_baizhan` |
| 玄中5 | `sk_xingjunbu` | 行军步 | 轻功 | 天龙；ALL14 | 无 | `set_junwu_baizhan` |
| 玄下4 | `sk_shouchengfa` | 守城法 | 杂学／阵法 | 射雕；神雕、倚天、碧血 | 无 | `set_junwu_baizhan` |
| 黄上3 | `sk_changqiangrumen` | 长枪入门 | 兵器／枪 | 天龙；ALL14 | 无 | `set_junwu_baizhan` |
| 黄上3 | `sk_junwuduandao` | 军伍短刀 | 兵器／刀 | 天龙；ALL14 | 无 | `set_junwu_baizhan` |
| 黄上3 | `sk_junwuchangjian` | 军伍长剑 | 兵器／剑 | 天龙；ALL14 | 无 | `set_junwu_baizhan` |
| 黄中2 | `sk_gongshou` | 弓手法 | 暗器 | 天龙；ALL14 | 无 | `[]` |
| 黄中2 | `sk_bubingcao` | 步兵操 | 拳脚／拳掌 | 天龙；ALL14 | 无 | — |
| 黄中2 | `sk_junzhangtuna` | 军帐吐纳 | 内功 | 天龙；ALL14 | 无 | — |
| 黄下1 | `sk_liezhengbu` | 列阵步 | 轻功 | 天龙；ALL14 | 无 | — |

### 4.2 地阶完整条目卡（4 门）

#### `sk_pojunqiangfa` 破军枪法（9 地上 · 兵器／枪 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:spear`；`grade:9`；`origin:expanded`；`sect:null`；`lineage:宋代边军教头→历代军镇`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch04_yitian,ch07_bixue]`；`nature:yang`；`wOut/wIn:.75/.25`；`weaponReq:{category:spear}` |
| reqs | `attrs {str:50,con:45}`；`aptitude {apSpear:50}`；`prereq:[{skill:sk_duanzhenqiang,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `hit:[3,8],pierce:[3,7]`；1破列、3横扫、5陷阵、7绝招摧锋、10百战 |
| setTags／获取 | `[set_junwu_baizhan]`；边军 L4 教头授艺或守城主线军功兑换；非门派 |
| special／图鉴 | `{fusible:true}`；重枪破阵的游戏化总名，不影射某一现实枪术流派 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 破列 `mv_pojunqiangfa_polie` | 1 | 线2·1–2·近身 | 1.10 | 8%/2/1000 | `bf_pojia`40%·2 | 可 | N=2、AF=.90；`.90×(1+.24+.05)−.10×.40=1.12≈1.10` |
| 横槊 `mv_pojunqiangfa_hengshuo` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | 击退1 | 可 | N=3、AF=.85；`.85×1.29−.05=1.0465≈1.05` |
| 陷阵 `mv_pojunqiangfa_xianzhen` | 5 | 突进3后单体·近身 | 1.40 | 9%/3/1100 | 突进；`bf_dongyao`40%·2 | 可 | `1×(1+.36+.10+.07)−.10−.10×.40=1.39≈1.40` |
| 摧锋 `mv_pojunqiangfa_cuifeng` | 7 | `aoe_cone {r:2,angle:60,dirCount:6}`·绝招 | 2.30 | 9%/绝/1200 | `bf_pojia`100%·2 | 可 | N=4、AF=.80；`3×.80−.10=2.30` |

被动：列阵 `ps_pojunqiangfa_liezhen`（L3，相邻持枪友军使 parry+3→8）；破军 `ps_pojunqiangfa_pojun`（L6，对阵法单位 Z3+5%→12%）；百战 `ps_pojunqiangfa_baizhan`（L10，首次击倒返还气势20）。

#### `sk_baizhanxinfa` 百战心法（8 地中 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:历代军伍行气法汇编`；`sourceChapters:[ch02_shediao,ch03_shendiao,ch04_yitian,ch07_bixue]`；`nature:yang`；`wOut/wIn:0/1` |
| reqs | `attrs {con:45,wil:45}`；`aptitude {apInner:45}`；`prereq:[{skill:sk_jundituna,layer:6}]`；`hard:[prereq]` |
| inner／经脉 | `IP=30+18+2×12+5×2.2=83`，`attrs {con:6,str:3,wil:3}`、`stats {resCC:8,defOut:7}`；`meridians:[mer_dumai,mer_chongmai]`【建议值】 |
| layerStats／层数 | `layerStats:null`（内功属性只走 `inner.contribution.stats`，见 `design/05` §3.6、§5.5）；1重定息；3重披坚；5重持久；**7重绝招军魂**；10重百战不殆 |
| setTags／获取 | `[set_junwu_baizhan]`；完成任一大型守城线后由 L4 将领授艺，或军书残卷拼合 |
| special／图鉴 | `{fusible:true}`；“把呼吸、负重、列阵耐力归成一套内功，非真实军队史料。” |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 披坚 `mv_baizhanxinfa_pijian` | 2 | 自身·支援 | 0 | 7%/3/900 | `bf_jiangu`2 | — | 支援；地中防御增益2回合 |
| 军魂 `mv_baizhanxinfa_junhun` | 7 | 友方r2·绝招支援 | 0 | 10%/绝/1200 | `bf_renjin`2；每战1次 | — | 群体支援绝招，不造成伤害 |

被动：负重行军 `ps_baizhanxinfa_fuzhong`（L3，装备负重惩罚−10%→25%）；百战不殆 `ps_baizhanxinfa_budai`（L10，低于30%气血时 Z4+12%，每战限一次持续2回合）。

#### `sk_yanmengqishe` 雁门骑射（8 地中 · 暗器 · 阳）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 基础 | `category:hidden`；`subType:hidden`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:雁门边军骑射`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]`；`nature:yang`；`wOut/wIn:.85/.15` |
| reqs | `attrs {agi:48,str:42}`；`aptitude {apHidden:48}`；`prereq:[{skill:sk_bianshe,layer:6}]`；`hard:[prereq]`；弓与箭检查沿 C16／design/10 |
| layerStats／层数 | `hit:[3,9],crit:[2,6]`；1走射、3连珠、5回马、7绝招雁落长空、10人马一体 |
| setTags／获取 | `[]`；雁门关骑军 L4 或射雕蒙古部族交流支线；`category:hidden,subType:hidden`，不占兵器栏 |
| special／图鉴 | `{fusible:true}`；原著多有骑射人物，本武学名与整套招法为原创扩展 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 走马一箭 `mv_yanmengqishe_zouma` | 1 | 单体·2–6·投射 | 1.05 | 7%/1/1000 | 移动后可用 | 可 | `1×(1+.12)×.92=1.03≈1.05` |
| 连珠 `mv_yanmengqishe_lianzhu` | 3 | 乱击n3·2–5·投射 | 1.00 | 8%/2/1000 | 3段 | 可 | `.85×(1+.24+.05)×.92=1.01≈1.00` |
| 回马箭 `mv_yanmengqishe_huima` | 5 | 单体·2–5·投射 | 1.40 | 8%/2/1100 | 撤退移动后常见条件 | 可 | `1×(1+.24+.05+.07+.15)×.92=1.39≈1.40` |
| 雁落长空 `mv_yanmengqishe_yanluo` | 7 | 锥3·2–6·投射·绝招 | 1.70 | 9%/绝/1200 | `bf_suoding`100%·2 | 可 | `3×.65×.92−.10=1.69≈1.70` |

被动：骑射 `ps_yanmengqishe_qishe`（L2，骑乘移动后 hit+3→8）；风向 `ps_yanmengqishe_fengxiang`（L5，侧风命中惩罚减半）；落雁 `ps_yanmengqishe_luoyan`（L10，对飞行／高处目标 Z3+12%）。

#### `sk_shouchengzhen` 守城军阵（7 地下 · 杂学／阵法 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:formation`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:城防将校`；`sourceChapters:[ch03_shendiao,ch04_yitian,ch07_bixue]`；`nature:harmony`；`wOut/wIn:.60/.40` |
| reqs | `attrs {wis:45,wil:40}`；`skills {formation:52}`；`prereq:[{skill:sk_shouchengfa,layer:5}]`；`hard:[prereq]`（技艺为软门槛） |
| layerStats／层数 | `hit:[2,7],parry:[3,8]`；1据垛、3换防、5拒马、7绝招城门不失、10守望相援 |
| setTags／获取 | `[set_junwu_baizhan]`；襄阳、濠州或明末守城支线；单人可用，多人邻接只是强化 |
| special／图鉴 | `{fusible:false,combo:false}`；不是强制多人合击 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 据垛 `mv_shouchengzhen_juduo` | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_jiangu`2；高处再+1回合 | — | 支援 |
| 换防 `mv_shouchengzhen_huanfang` | 3 | 友方单体1–3·支援 | 0 | 7%/2/900 | 与友方换位；双方 `bf_yuanhu`1 | — | 换位与援护支援 |
| 拒马 `mv_shouchengzhen_juma` | 5 | 线2·1–2·近身 | 1.00 | 8%/2/1000 | 击退1；`bf_chihuan`100% | 可 | N=2、AF=.90；`.90×1.29−.05−.10=1.011≈1.00` |
| 城门不失 `mv_shouchengzhen_bushi` | 7 | 友方r2·绝招支援 | 0 | 9%/绝/1200 | 全体 `bf_renjin`2、`bf_yuanhu`1 | — | 无伤害的群体阵法绝招 |

被动：守望 `ps_shouchengzhen_shouwang`（L3，相邻友方每名使 parry+2，上限6）；粮道 `ps_shouchengzhen_liangdao`（L6，战斗道具冷却−1、最低1）；不失 `ps_shouchengzhen_bushi`（L10，阵内首次被击退改为0，每回合1次）。

### 4.3 玄阶紧凑卡（7 门；3 门核算抽样）

#### `sk_duanzhenqiang` 断阵枪（6 玄上 · 兵器／枪 · 阳）**（原创扩展）**——核算抽样

- `reqs {prereq:[sk_changqiangrumen≥4],hard:[prereq]}`；`wOut/wIn:.80/.20`；`layerStats {hit:[2,6],pierce:[2,4]}`；招式挑旗 `_tiaoqi`（单体 **1.10**，6%/1，破甲30%；`1+.12−.03=1.09≈1.10`）、横断 `_hengduan`（`aoe_cone {angle:120,r:1,dirCount:6}` **1.00**，7%/1；N=3、AF=.85，`.85×1.17=.9945≈1.00`）、破阵 `_pozhen`（线2 **1.20**，8%/2；N=2、AF=.90，`.90×1.34=1.206≈1.20`）；被动“阵隙” `_zhenxi`（对阵法单位 hit+5→12）；`set_junwu_baizhan`。

#### `sk_junzhongdao` 军中刀法（6 玄上 · 兵器／刀 · 阳）**（原创扩展）**

- `reqs {prereq:[sk_junwuduandao≥4],hard:[prereq]}`；`.85/.15`；`layerStats {crit:[2,6],hit:[2,4]}`；劈营 `_piying`（单体1.10）、卷旗 `_juanqi`（横扫.85）、斩马 `_zhanma`（单体1.25，目标骑乘条件）；被动“军刀” `_jundao`（对持枪目标 parry+4→10）；`set_junwu_baizhan`。

#### `sk_zhenqijian` 阵旗剑（6 玄上 · 兵器／剑 · 调和）**（原创扩展）**

- `reqs {prereq:[sk_junwuchangjian≥4],skills:{formation:36},hard:[prereq]}`；`.70/.30`；`layerStats {parry:[2,6],hit:[2,4]}`；护旗 `_huqi`（单体1.05）、指向 `_zhixiang`（线2 1.00）、旗回 `_qihui`（横扫.85）；被动“旗语” `_qiyu`（相邻友军 hit+2→6）；`set_junwu_baizhan`。

#### `sk_bianshe` 边塞射法（5 玄中 · 暗器 · 阳）**（原创扩展）**——核算抽样

- `reqs {prereq:[sk_gongshou≥4],hard:[prereq]}`；`.90/.10`；`layerStats {hit:[2,6],crit:[1,4]}`；弓箭按 C16 占暗器栏。定弦 `_dingxian`（单体投射 **1.05**，6%/1；`1×1.12×.92=1.03≈1.05`）、抛射 `_paoshe`（`aoe_spokes {r:1}` 投射 **.85**，7%/2；N=7、AF=.70，`.70×1.29×.92=.831≈.85`）、连发 `_lianfa`（乱击n2投射 **1.05**，8%/2；`.85×1.34×.92=1.05`）；被动“测风” `_cefeng`（远程命中惩罚−10%→25%）；`legacy-set:junwu_yanmeng`。

#### `sk_jundituna` 军旅吐纳（5 玄中 · 内功 · 阳）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {attrs:{con:30},hard:[]}`；`inner IP=17+10+2×7+5×1.5=48.5`，`attrs {con:4,str:2,wil:1}`、`stats {resCC:5,defOut:5}`；`meridians:[mer_dumai]`【建议值】；招式整息 `_zhengxi`（自身 `bf_renjin`2）、振旅 `_zhenlv`（友方单体驱散1个 `cc`）；被动“耐饥” `_naiji`（探索体力消耗−5%→12%）；`set_junwu_baizhan`。

#### `sk_xingjunbu` 行军步（5 玄中 · 轻功 · 阳）**（原创扩展）**——核算抽样

- `sourceChapters:ALL14`；`Q_skill=QS(5)=64`；`reqs {attrs:{agi:32,con:30},aptitude:{apLight:30},hard:[]}`；`layerStats {spd:[1,5],eva:[1,5]}`；疾行 `_jixing`（自身 `bf_jisu`2）、穿列 `_chuanlie`（移2格）、回身斩 `_huishen`（单体 **1.00**，6%/1，换位；`1+.12−.15=.97≈1.00`）；被动“齐步” `_qibu`（相邻友军移动耗力−5%→10%）；`set_junwu_baizhan`。

#### `sk_shouchengfa` 守城法（4 玄下 · 杂学／阵法 · 调和）**（原创扩展）**

- `reqs {skills:{formation:28},hard:[]}`；`.60/.40`；`layerStats {parry:[1,5],hit:[1,5]}`；标垛 `_biaoduo`（自身 `bf_jingzhun`2）、拒梯 `_juti`（单体1.05、击退1）、轮换 `_lunhuan`（友方换位）；被动“地利” `_dili`（人工地形 Z4+3%→8%）；`set_junwu_baizhan`。

### 4.4 黄阶一行卡（7 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_changqiangrumen` | 长枪入门 | 各地军营 | 兵器／枪（3 黄上·yang） | ALL14 | 单体1.10、线2 .95；`set_junwu_baizhan` | 无 | **（原创扩展）** |
| `sk_junwuduandao` | 军伍短刀 | 各地军营 | 兵器／刀（3 黄上·yang） | ALL14 | 单体1.10、横扫.85；`set_junwu_baizhan` | 无 | **（原创扩展）** |
| `sk_junwuchangjian` | 军伍长剑 | 各地军营 | 兵器／剑（3 黄上·neutral） | ALL14 | 单体1.10、招架架势；`set_junwu_baizhan` | 无 | **（原创扩展）** |
| `sk_gongshou` | 弓手法 | 各地军营 | 暗器（2 黄中·neutral） | ALL14 | 投射1.00，需弓箭；`[]` | 无 | **（原创扩展）** |
| `sk_bubingcao` | 步兵操 | 各地军营 | 拳脚／拳掌（2 黄中·yang） | ALL14 | 单体1.10、相邻友军 hit+2 | 无 | **（原创扩展）** |
| `sk_junzhangtuna` | 军帐吐纳 | 各地军营 | 内功（2 黄中·yang） | ALL14 | `IP=8+5+2×3+5×1=24`；`mer_dumai`【建议值】 | 无 | **（原创扩展）** |
| `sk_liezhengbu` | 列阵步 | 各地军营 | 轻功（1 黄下·neutral） | ALL14 | `Q_skill=32`；相邻友军移动耗力−5% | 无 | **（原创扩展）** |

**黄阶预算核对**：3品单体／线2取1.10／1.00，分别与 `1.12`／`.90×1.12=1.008` 相符；2品投射 `1×1.12×.92=1.03→1.00`，拳法1.10；军帐吐纳精确命中 IP24；列阵步只用 QS32。

---

## 5. 镖局与护院通行武学（14 门）

### 5.1 目录与来源边界

镖局是营生与授艺场景，不建立统一 `sect_*`；福威、威信等具名镖局的门派专属武学仍归各自图鉴。以下条目是跨镖局共通的趟子手、镖师与护院本领。

| 大阶 | ID | 名称 | 类别 | 首现／复现 | 前置 | setTags |
|---|---|---|---|---|---|---|
| 地中8 | `sk_sihaibiaodao` | 四海镖刀 | 兵器／刀 | 笑傲；碧血至雪山 | `sk_jiebiaodaofa`≥5 | `[]` |
| 地下7 | `sk_huweiyingqiang` | 护围缨枪 | 兵器／枪 | 连城；白马、鸳鸯、书剑、飞狐、雪山 | `sk_lianhuanqiang`≥5 | `[]` |
| 玄上6 | `sk_jiebiaodaofa` | 解镖刀法 | 兵器／刀 | 笑傲；明清各界 | `sk_biaojurumen`≥4 | `[]` |
| 玄中5 | `sk_lianhuanqiang` | 连环镖枪 | 兵器／枪 | 连城；清代各界 | `sk_biaojuqiangfa`≥4 | `[]` |
| 玄中5 | `sk_huweijian` | 护围剑 | 兵器／剑 | 笑傲；明清各界 | `sk_biaojujianfa`≥4 | `[]` |
| 玄下4 | `sk_jindunxinfa` | 金盾心法 | 内功 | 笑傲；明清各界 | `sk_zhuangxingong`≥5 | `[]` |
| 玄下4 | `sk_tanluobu` | 探路步 | 轻功 | 笑傲；明清各界 | `sk_ganyebu`≥4 | `[]` |
| 玄下4 | `sk_feihuangshi` | 飞蝗石 | 暗器 | 笑傲；明清各界 | 无 | `[]` |
### 5.2 `sk_sihaibiaodao` 四海镖刀（8 地中 · 兵器／刀 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:blade`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:多地镖师互证的护镖刀路`；`sourceChapters:[ch05_xiaoao,ch07_bixue,ch08_luding,ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:yang`；`wOut/wIn:.80/.20`；`weaponReq:{category:blade}` |
| reqs | `attrs {str:45,con:42}`；`aptitude {apBlade:45}`；`prereq:[{skill:sk_jiebiaodaofa,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `parry:[3,8],crit:[2,7]`；1护镖、3卸马、5开路、7绝招四海同途、10镖在人在 |
| setTags／获取 | `[]`；跨三地完成护镖支线，或任一镖局 L4 总镖头传授 |
| special／图鉴 | `{fusible:true}`；不是任何一家镖局的祖传绝学 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 护镖 `mv_sihaibiaodao_hubiao` | 1 | 单体·1·近身 | 1.30 | 8%/1/1000 | 邻接友方时常见条件 | 可 | `1×(1+.12+.05+.15)=1.32≈1.30` |
| 卸马 `mv_sihaibiaodao_xiema` | 3 | 单体·1·近身 | 1.25 | 8%/2/1000 | `bf_shiheng`50%·1 | 可 | `1×(1+.24+.05)−.10×.50=1.24≈1.25` |
| 开路 `mv_sihaibiaodao_kailu` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.20 | 9%/3/1000 | 击退1 | 可 | N=3、AF=.85；`.85×(1+.36+.10)−.05=1.191≈1.20` |
| 四海同途 `mv_sihaibiaodao_sihai` | 7 | `aoe_cone {r:2,angle:60,dirCount:6}`·绝招 | 2.30 | 10%/绝/1200 | 自身 `bf_renjin`2 | 可 | N=4、AF=.80；`3×.80−.10=2.30` |

被动：镖在人在 `ps_sihaibiaodao_biaozai`（L3，护送目标3格内 Z4+4%→10%）；识路 `ps_sihaibiaodao_shilu`（L6，伏击战首轮 hit+5→12%）；四海 `ps_sihaibiaodao_sihai`（L10，不同镖局学过的黄阶基础每门使本功修炼+3%，上限12%）。

### 5.3 `sk_huweiyingqiang` 护围缨枪（7 地下 · 兵器／枪 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:spear`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:北地车队护院`；`sourceChapters:[ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:.75/.25`；`weaponReq:{category:spear}` |
| reqs | `attrs {str:38,agi:38}`；`aptitude {apSpear:40}`；`prereq:[{skill:sk_lianhuanqiang,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `parry:[3,8],hit:[2,7]`；1护车、3挑索、5回马、7绝招八方护围、10长途不懈 |
| setTags／获取 | `[]`；北地镖局 L4 或连续三次无货损护送奖励 |
| special／图鉴 | `{fusible:true}`；低武书界同类枪链的终点 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 护车 `mv_huweiyingqiang_huche` | 1 | 单体1–2·近身 | 1.25 | 7%/1/1000 | 邻接任务目标条件 | 可 | `1+.12+.15=1.27≈1.25` |
| 挑索 `mv_huweiyingqiang_tiaosuo` | 3 | 单体1–2·近身 | 1.25 | 8%/2/1000 | `bf_jiaoxie`25% | 可 | `1×1.29−.20×.25=1.24≈1.25` |
| 回马 `mv_huweiyingqiang_huima` | 5 | 线2·近身 | 1.10 | 8%/2/1000 | 后撤1格 | 可 | N=2、AF=.90；`.90×1.29−.05=1.111≈1.10` |
| 八方护围 `mv_huweiyingqiang_bafang` | 7 | 周身·绝招 | 2.15 | 9%/绝/1200 | 自身 `bf_yuanhu`2 | 可 | N=6、AF=.75；`3×.75−.10=2.15` |

被动：车阵 `ps_huweiyingqiang_chezhen`（L3，相邻任务单位 parry+3→8）；不离镖 `ps_huweiyingqiang_buli`（L6，截击伤害+5→12%）；护围 `ps_huweiyingqiang_huwei`（L10，每回合首次援护后 ct+100）。

### 5.4 玄阶紧凑卡（6 门；2 门核算抽样）

#### `sk_jiebiaodaofa` 解镖刀法（6 玄上 · 兵器／刀 · 阳）**（原创扩展）**——核算抽样

- `reqs {prereq:[sk_biaojurumen≥4],hard:[prereq]}`；`.80/.20`；`layerStats {parry:[2,6],hit:[2,4]}`；解围 `_jiewei`（`aoe_cone {angle:120,r:1,dirCount:6}` **1.00**，7%/1；N=3、AF=.85，`.85×1.17=.9945≈1.00`）、截缰 `_jiejiang`（单体 **1.25**，7%/2，失衡40%；`1×1.29−.04=1.25`）、封路 `_fenglu`（线2 **1.20**，8%/2；N=2、AF=.90，`.90×1.34=1.206≈1.20`）；被动“护货” `_huohuo`（任务物在场 Z4+4→10%）；`legacy-set:biaoju_sihai`。

#### `sk_lianhuanqiang` 连环镖枪（5 玄中 · 兵器／枪 · 阳）**（原创扩展）**

- `reqs {prereq:[sk_biaojuqiangfa≥4],hard:[prereq]}`；`.80/.20`；`layerStats {hit:[2,6],combo:[1,4]}`；拦骑 `_lanqi`（单体1.10）、双点 `_shuangdian`（乱击n2 1.05）、护车 `_huche`（线2 1.00）；被动“连枪” `_lianqiang`（连续不同招式 hit+2/层，上限6）；`legacy-set:biaoju_sihai`。

#### `sk_huweijian` 护围剑（5 玄中 · 兵器／剑 · 调和）**（原创扩展）**

- `reqs {prereq:[sk_biaojujianfa≥4],hard:[prereq]}`；`.70/.30`；`layerStats {parry:[2,6],eva:[1,4]}`；封门 `_fengmen`（单体1.10）、回护 `_huihu`（换位支援）、连星 `_lianxing`（线2 1.00）；被动“顾后” `_guhou`（任务目标邻接时反击+4→10%）；`legacy-set:biaoju_sihai`。

#### `sk_jindunxinfa` 金盾心法（4 玄下 · 内功 · 阳）**（原创扩展）**

- `reqs {prereq:[sk_zhuangxingong≥5],hard:[prereq]}`；`inner IP=14+8+2×6+5×1.5=41.5`，`attrs {con:3,str:2,wil:1}`、`stats {parry:5,resCC:5}`；`meridians:[mer_renmai,mer_dumai]`【建议值】；招式守镖 `_shoubiao`（自身 `bf_jiangu`2）、分护 `_fenhu`（友方 `bf_yuanhu`1）；被动“金盾” `_jindun`（护盾收益+5→12%）；`legacy-set:biaoju_sihai`。

#### `sk_tanluobu` 探路步（4 玄下 · 轻功 · 调和）**（原创扩展）**——核算抽样

- `Q_skill=56`；`reqs {prereq:[sk_ganyebu≥4],hard:[prereq]}`；`layerStats {eva:[1,5],spd:[1,5]}`；探前 `_tanqian`（自身 `bf_jingzhun`2）、绕伏 `_raofu`（移3格）、回镖 `_huibiao`（单体 **1.00**，6%/1，绕背；`1+.12−.15=.97≈1.00`）；被动“识伏” `_shifu`（陷阱识别+10→25）；`legacy-set:biaoju_sihai`。

#### `sk_feihuangshi` 飞蝗石（4 玄下 · 暗器 · 中性）**（原创扩展命名）**

- `reqs {aptitude:{apHidden:25},hard:[]}`；`.90/.10`；`layerStats {hit:[1,6],crit:[1,4]}`；飞蝗 `_feihuang`（投射单体1.00）、连石 `_lianshi`（乱击n3 .95）、打灯 `_dadeng`（投射.90，命中灯具触发地形交互）；被动“就地取材” `_qucai`（石地每战补1枚普通石弹）；`legacy-set:biaoju_sihai`。

### 5.5 黄阶一行卡（6 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_biaojurumen` | 镖局入门刀 | 镖局／护院 | 兵器／刀（3 黄上·yang） | ALL14 | 单体1.10、横扫.85；`[]` | 无 | **（原创扩展）** |
| `sk_biaojujianfa` | 镖局剑法 | 镖局／护院 | 兵器／剑（3 黄上·neutral） | ALL14 | 单体1.10、招架+2→6；`[]` | 无 | **（原创扩展）** |
| `sk_biaojuqiangfa` | 镖局枪法 | 镖局／护院 | 兵器／枪（2 黄中·yang） | ALL14 | 线2 .90；`[]` | 无 | **（原创扩展）** |
| `sk_huyuanquan` | 护院拳 | 镖局／护院 | 拳脚／拳掌（2 黄中·yang） | ALL14 | 单体1.10、援护邻人 | 无 | **（原创扩展）** |
| `sk_zhuangxingong` | 壮行功 | 镖局／护院 | 内功（2 黄中·yang） | ALL14 | `IP=8+5+2×3+5×1=24`；`mer_renmai`【建议值】 | 无 | **（原创扩展）** |
| `sk_ganyebu` | 赶夜步 | 镖局／护院 | 轻功（1 黄下·neutral） | ALL14 | `Q_skill=32`，夜间疾行体力×.9 | 无 | **（原创扩展）** |

**黄阶预算核对**：3品刀剑普通招为1.10／.85；2品线2 `.90×1.12=1.008→1.00`，拳为1.10；壮行功精确命中 IP24；赶夜步只用 QS32 与探索耗力。

---

## 6. 市镇武馆通行武学（16 门）

### 6.1 目录与链路

| 大阶 | ID | 名称 | 类别 | 首现／复现 | 前置 | setTags |
|---|---|---|---|---|---|---|
| 地中8 | `sk_kaimenpiguaquan` | 开门劈挂拳 | 拳脚／拳掌 | 射雕；后世武馆 | `sk_tongbeijin`≥5 | `[]` |
| 地下7 | `sk_tongbeijian` | 通背剑 | 兵器／剑 | 笑傲；后世武馆 | `sk_lianhuanjian`≥5 | `[]` |
| 地下7 | `sk_hunyuanfangzhuang` | 混元方桩 | 内功 | 射雕；后世武馆 | `sk_wuguanxinfa`≥6 | `[]` |
| 玄上6 | `sk_tongbeijin` | 通背劲 | 拳脚／拳掌 | 射雕；ALL14 | `sk_changquanrumen`≥4 | `[]` |
| 玄上6 | `sk_tantui_tongxing` | 弹腿（通行） | 拳脚／腿法 | 天龙；ALL14 | `sk_tantuirumen`≥4 | `[]` |
| 玄中5 | `sk_wuhuduandandao` | 五虎断门刀（民间式） | 兵器／刀 | 笑傲；后世武馆 | `sk_wuguandao`≥4 | `[]` |
| 玄中5 | `sk_qimeigun` | 齐眉棍 | 兵器／棍杖 | 天龙；后世武馆 | `sk_wuguangun`≥4 | `[]` |
| 玄下4 | `sk_wuguanxinfa` | 武馆心法 | 内功 | 天龙；ALL14 | `sk_zhamabu`≥4 | `[]` |
| 玄下4 | `sk_lianhuanjian` | 连环剑 | 兵器／剑 | 射雕；ALL14 | `sk_wuguanjian`≥4 | `[]` |
| 玄下4 | `sk_duandashou` | 短打手 | 拳脚／擒拿 | 天龙；ALL14 | `sk_changquanrumen`≥4 | `[]` |
“弹腿”在少林图鉴已有 `sk_tantui`；为避免同名异物误合并，本文正式 ID 与显示名均加“通行”语义：`sk_tantui_tongxing`／弹腿（通行），只代表武馆整理的民间套路。

### 6.2 地阶完整条目卡（3 门）

#### `sk_kaimenpiguaquan` 开门劈挂拳（8 地中 · 拳脚／拳掌 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:unarmed`；`subType:fist`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:市镇武馆通背劈挂合练`；`sourceChapters:[ch02_shediao,ch04_yitian,ch05_xiaoao,ch07_bixue,ch08_luding,ch09_liancheng,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:yang`；`wOut/wIn:.80/.20` |
| reqs | `attrs {str:46,agi:42}`；`aptitude {apFist:45}`；`prereq:[{skill:sk_tongbeijin,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `hit:[3,8],crit:[2,7]`；1开门、3挂掌、5通臂、7绝招开合一气、10身手相通 |
| setTags／获取 | `[]`；名城武馆连胜考校或多馆印证；不绑定现实门派谱系 |
| special／图鉴 | `{fusible:true}`；名称取通行拳理意象，传承与数值为原创扩展 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 开门 `mv_kaimenpiguaquan_kaimen` | 1 | 单体·近身 | 1.10 | 8%/1/1000 | `bf_shiheng`30% | 可 | `1+.12+.05−.03=1.14≈1.10` |
| 挂掌 `mv_kaimenpiguaquan_guazhang` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.10 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×1.29=1.0965≈1.10` |
| 通臂 `mv_kaimenpiguaquan_tongbi` | 5 | 线2·近身 | 1.15 | 9%/2/1000 | 击退1 | 可 | N=2、AF=.90；`.90×1.34−.05=1.156≈1.15` |
| 开合一气 `mv_kaimenpiguaquan_kaihe` | 7 | 周身·绝招 | 2.15 | 10%/绝/1200 | 自身 `bf_gongshi`2 | 可 | N=6、AF=.75；`3×.75−.10=2.15` |

被动：长桥大马 `ps_kaimenpiguaquan_changqiao`（L3，未移动时 hit+3→8）；开合 `ps_kaimenpiguaquan_kaihe`（L6，横扫命中≥2目标返气势5→12）；根基 `ps_kaimenpiguaquan_genji`（L10，黄阶武馆拳脚有效层数≥8时本功 Z3+8%）。

#### `sk_tongbeijian` 通背剑（7 地下 · 兵器／剑 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:sword`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:游方武馆教头`；`sourceChapters:[ch05_xiaoao,ch07_bixue,ch08_luding,ch09_liancheng,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:.70/.30`；`weaponReq:{category:sword}` |
| reqs | `attrs {agi:42,wis:38}`；`aptitude {apSword:42}`；`prereq:[{skill:sk_lianhuanjian,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `hit:[3,8],parry:[2,7]`；1舒臂、3回剑、5连环、7绝招剑走通背、10臂剑如一 |
| setTags／获取 | `[]`；三家武馆印证，或游方教头传授 |
| special／图鉴 | `{fusible:true}`；不与任何原著具名门派剑法合并 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 舒臂 `mv_tongbeijian_shubi` | 1 | 单体1–2·近身 | 1.10 | 7%/1/1000 | — | 可 | `1+.12=1.12≈1.10` |
| 回剑 `mv_tongbeijian_huijian` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | 自身后撤1 | 可 | N=3、AF=.85；`.85×1.29−.05=1.0465≈1.05` |
| 连环 `mv_tongbeijian_lianhuan` | 5 | 乱击n3·近身 | 1.10 | 9%/2/1000 | — | 可 | `.85×1.34=1.14≈1.10` |
| 剑走通背 `mv_tongbeijian_jianzou` | 7 | 线3·绝招 | 2.55 | 9%/绝/1200 | — | 可 | N=3、AF=.85；`3×.85=2.55` |

被动：臂展 `ps_tongbeijian_bizhan`（L3，单体招射程可取2）；回护 `ps_tongbeijian_huihu`（L6，后撤后 parry+4→10）；如一 `ps_tongbeijian_ruyi`（L10，连用三式后 Z3+12% 1回合）。

#### `sk_hunyuanfangzhuang` 混元方桩（7 地下 · 内功 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:武馆站桩与吐纳汇编`；`sourceChapters:[ch02_shediao,ch04_yitian,ch05_xiaoao,ch07_bixue,ch08_luding,ch09_liancheng,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:0/1` |
| reqs | `attrs {con:42,wil:38}`；`aptitude {apInner:40}`；`prereq:[{skill:sk_wuguanxinfa,layer:6}]`；`hard:[prereq]` |
| inner／经脉 | `IP=26+16+2×10+5×2=72`，`attrs {con:5,str:2,wil:3}`、`stats {defOut:8,resCC:7}`；`meridians:[mer_renmai,mer_dumai]`【建议值】 |
| layerStats／层数 | `layerStats:null`（内功属性只走 `inner.contribution.stats`，见 `design/05` §3.6、§5.5）；1重方桩；3重沉肩；5重混元；**7重绝招运劲开门**；10重根深叶茂 |
| setTags／获取 | `[]`；武馆 L4 或扎桩、武馆心法双修考校 |
| special／图鉴 | `{fusible:true}`；“混元”仅描述周身协调，不是华山混元功残承 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 沉肩 `mv_hunyuanfangzhuang_chenjian` | 2 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong`2 | — | 支援 |
| 运劲开门 `mv_hunyuanfangzhuang_kaiyun` | 7 | 自身·绝招支援 | 0 | 9%/绝/1200 | `bf_gongshi`2、驱散1个 `cc.slow` | — | 支援绝招；每战1次 |

被动：方桩 `ps_hunyuanfangzhuang_fangzhuang`（L1，未移动时 defOut+3→8）；沉肩坠肘 `ps_hunyuanfangzhuang_chenzhui`（L5，被击退距离−1）；根深 `ps_hunyuanfangzhuang_genshen`（L10，首次低于30%气血获 `bf_renjin`2）。

### 6.3 玄阶紧凑卡（7 门；2 门核算抽样）

#### `sk_tongbeijin` 通背劲（6 玄上 · 拳脚／拳掌 · 阳）**（原创扩展）**——核算抽样

- `sourceChapters:ALL14`；`reqs {prereq:[sk_changquanrumen≥4],hard:[prereq]}`；`.80/.20`；`layerStats {hit:[2,6],crit:[2,4]}`；甩掌 `_shuaizhang`（单体 **1.10**，6%/1；`1.12≈1.10`）、探背 `_tanbei`（线2 **1.05**，7%/1；N=2、AF=.90，`.90×1.17=1.053≈1.05`）、通臂 `_tongbi`（单体 **1.35**，8%/2；`1×1.34≈1.35`）；被动“放长击远” `_fangchang`（单体射程2）；`legacy-set:wuguan_jiben`。

#### `sk_tantui_tongxing` 弹腿（通行）（6 玄上 · 拳脚／腿法 · 阳）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_tantuirumen≥4],hard:[prereq]}`；`.85/.15`；`layerStats {crit:[2,6],spd:[2,4]}`；弹踢 `_tanti`（单体1.10）、连环腿 `_lianhuan`（乱击n3 1.05）、踹门 `_chuaimen`（单体1.15、击退1）；被动“腿长” `_tuichang`（持械不降效，引用05）；`legacy-set:wuguan_jiben`。

#### `sk_wuhuduandandao` 五虎断门刀（民间式）（5 玄中 · 兵器／刀 · 阳）**（原创扩展命名）**

- 本作仅为武馆对“五虎断门”通称的整理，不与任何具名门派秘传同一。`reqs {prereq:[sk_wuguandao≥4],hard:[prereq]}`；`.85/.15`；`layerStats {crit:[2,6],hit:[1,4]}`；猛虎 `_menghu`（单体1.10）、断门 `_duanmen`（线2 1.00）、五虎 `_wuhu`（横扫.90）；被动“虎势” `_hushi`（击倒后 `bf_ruiyi`1）；`legacy-set:wuguan_jiben`。

#### `sk_qimeigun` 齐眉棍（5 玄中 · 兵器／棍杖 · 调和）**（原创扩展命名）**——核算抽样

- `reqs {prereq:[sk_wuguangun≥4],hard:[prereq]}`；`.75/.25`；`layerStats {parry:[2,6],hit:[1,4]}`；齐眉 `_qimei`（单体 **1.10**，6%/1；`1.12≈1.10`）、扫堂 `_saotang`（`aoe_cone {angle:120,r:1,dirCount:6}` **.95**，7%/1，失衡30%；N=3、AF=.85，`.85×1.17−.03=.9645≈.95`）、点胸 `_dianxiong`（单体 **1.35**，8%/2；`1×1.34≈1.35`）；被动“棍圆” `_gunyuan`（招架+3→8）；`legacy-set:wuguan_jiben`。

#### `sk_wuguanxinfa` 武馆心法（4 玄下 · 内功 · 调和）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_zhamabu≥4],hard:[prereq]}`；`inner IP=14+8+2×6+5×1.5=41.5`，`attrs {con:3,str:1,agi:1,wil:1}`、`stats {defOut:5,parry:5}`；`meridians:[mer_renmai]`【建议值】；招式调息 `_tiaoxi`（自身 `bf_tiaoxi`2）、护桩 `_huzhuang`（自身 `bf_wenzhong`2）；被动“日日功” `_ririgong`（闭关本功经验+10%）；`legacy-set:wuguan_jiben`。

#### `sk_lianhuanjian` 连环剑（4 玄下 · 兵器／剑 · 调和）**（原创扩展）**

- `reqs {prereq:[sk_wuguanjian≥4],hard:[prereq]}`；`.75/.25`；`layerStats {hit:[1,6],parry:[1,4]}`；平刺 `_pingci`（单体1.10）、连环 `_lianhuan`（乱击n3 1.00）、回剑 `_huijian`（单体1.05并 `bf_jianshi`1）；被动“式相连” `_xianglian`（不同招式 hit+2/层，上限6）；`legacy-set:wuguan_jiben`。

#### `sk_duandashou` 短打手（4 玄下 · 拳脚／擒拿 · 阳）**（原创扩展）**

- `reqs {prereq:[sk_changquanrumen≥4],hard:[prereq]}`；`.75/.25`；`layerStats {seal:[1,5],parry:[1,5]}`；扣腕 `_kouwan`（单体1.05、封经20%）、切肘 `_qiezhou`（单体1.15）、贴身 `_tieshen`（换位.95）；被动“近拿” `_jinna`（对射程1目标 effHit+4→10）；`legacy-set:wuguan_jiben`。

### 6.4 黄阶一行卡（6 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_changquanrumen` | 长拳入门 | 市镇武馆 | 拳脚／拳掌（3 黄上·neutral） | ALL14 | 单体1.10；`[]` | 无 | **（原创扩展）** |
| `sk_tantuirumen` | 弹腿入门 | 市镇武馆 | 拳脚／腿法（3 黄上·yang） | ALL14 | 单体1.05、击退1；`[]` | 无 | **（原创扩展）** |
| `sk_wuguanjian` | 武馆剑法 | 市镇武馆 | 兵器／剑（2 黄中·neutral） | ALL14 | 单体1.10；`[]` | 无 | **（原创扩展）** |
| `sk_wuguandao` | 武馆刀法 | 市镇武馆 | 兵器／刀（2 黄中·yang） | ALL14 | 单体1.10；`[]` | 无 | **（原创扩展）** |
| `sk_wuguangun` | 武馆棍法 | 市镇武馆 | 兵器／棍杖（2 黄中·neutral） | ALL14 | 六向横扫.95；`[]` | 无 | **（原创扩展）** |
| `sk_zhamabu` | 扎马步 | 市镇武馆 | 内功（1 黄下·yang） | ALL14 | `IP=6+4+2×2+5×1=19`；`mer_dumai`【建议值】；不计 `legacy-set:wuguan_jiben` | 无 | **（原创扩展）** |

**黄阶预算核对**：拳剑刀单体约1.10；弹腿扣击退.05得1.05；棍的六向横扫 `.85×1.12−.05=.902≈.90`；扎马步精确命中 IP19。

---

## 7. 江湖散人与百家通行武学（29 门）

### 7.1 目录、来源与进阶链

本节收游方武师、江湖散人、旧军退役教头及公开拳谱在十四书界均可形成的通行池；它们不反推为真实历史门派，也不抢占具名门派武学。`sk_yanzisanchaoshui`、`sk_dengpingdushui`、`sk_caoshangfei` 的品阶和原生书界直接复用 `design/08` §4.6；`sk_taizuchangquan` 的机制完整定义只见 `design/05` §13.5。

| 大阶 | ID | 名称 | 类别 | 原生书界 | 前置 | setTags |
|---|---|---|---|---|---|---|
| 地中8 | `sk_jianghubaizhanjian` | 江湖百战剑 | 兵器／剑 | ALL14 | `sk_qingfengjian`≥5 | `set_jianghu_baijia` |
| 地下7 | `sk_yanzisanchaoshui` | 燕子三抄水 | 轻功 | 天龙、连城、白马、书剑 | `sk_dengpingdushui`≥4 或 `sk_caoshangfei`≥6 | `set_jianghu_baijia` |
| 玄上6 | `sk_qingfengjian` | 清风剑 | 兵器／剑 | ALL14 | `sk_jianghurumenjian`≥4 | `set_jianghu_baijia` |
| 玄上6 | `sk_panlonggun` | 盘龙棍 | 兵器／棍杖 | ALL14 | `sk_shaobanggun`≥4 | `set_jianghu_baijia` |
| 玄上6 | `sk_dengpingdushui` | 登萍渡水 | 轻功 | ALL14 | `sk_caoshangfei`≥5 | `set_jianghu_baijia` |
| 玄中5 | `sk_luoyedao` | 落叶刀 | 兵器／刀 | ALL14 | `sk_hengdaorumenzhao`≥4 | `set_jianghu_baijia` |
| 玄中5 | `sk_liuxingchui` | 流星锤 | 兵器／奇门 | ALL14 | 无 | `set_jianghu_baijia` |
| 玄中5 | `sk_wuyingshou` | 无影手 | 拳脚／擒拿 | ALL14 | `sk_sanshou`≥4 | `set_jianghu_baijia` |
| 玄中5 | `sk_jianghutuna` | 江湖吐纳 | 内功 | ALL14 | `sk_tunaqianjue`≥5 | `set_jianghu_baijia` |
| 玄中5 | `sk_xingqizhou` | 行气走 | 轻功 | ALL14 | `sk_yanxingbu`≥4 | `set_jianghu_baijia` |
| 玄下4 | `sk_yexinggong` | 夜行功 | 轻功 | ALL14 | `sk_caoshangfei`≥4 | `set_jianghu_baijia` |
| 玄下4 | `sk_feishahuangshi` | 飞砂黄石 | 暗器 | ALL14 | `sk_tongxingfeishi`≥4 | `set_jianghu_baijia` |
| 玄下4 | `sk_hutiaodaofa` | 虎跳刀法 | 兵器／刀 | ALL14 | `sk_hengdaorumenzhao`≥4 | `set_jianghu_baijia` |
| 玄下4 | `sk_huiliuquan` | 回流拳 | 拳脚／拳掌 | ALL14 | `sk_jianghuchangquan`≥4 | `set_jianghu_baijia` |

主进阶链为 `sk_jianghurumenjian` 4重（黄）→ `sk_qingfengjian` 5重（玄）→ `sk_jianghubaizhanjian`（地）。轻功链为 `sk_caoshangfei` 5重（黄）→ `sk_dengpingdushui` 4重（玄）→ `sk_yanzisanchaoshui`（地）；二选一来源使用 C17 `anyOf`，不使用旧 `altPrereq`。

### 7.2 `sk_jianghubaizhanjian` 江湖百战剑（8 地中 · 兵器／剑 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:weapon`；`subType:sword`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:游方剑客百家互证`；`sourceChapters:ALL14`；`nature:harmony`；`wOut/wIn:.70/.30`；`weaponReq:{category:sword}` |
| reqs | `attrs {agi:45,wis:42}`；`aptitude {apSword:46}`；`prereq:[{skill:sk_qingfengjian,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `hit:[3,8],parry:[2,7]`；1守中、3横门、5逐客、7绝招百战归锋、10见多识广 |
| setTags／获取 | `[set_jianghu_baijia]`；任三书界向不同散人剑客印证，或同书界完成三场武馆擂台 |
| special／图鉴 | `{fusible:true}`；不是某位原著人物的秘传，而是本作对通行实战剑理的归纳 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 守中 `mv_jianghubaizhanjian_shouzhong` | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | `bf_shiheng`30%·1 | 可 | `1×(1+.12)−.10×.30=1.09≈1.10` |
| 横门 `mv_jianghubaizhanjian_hengmen` | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.10 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10` |
| 逐客 `mv_jianghubaizhanjian_zhuke` | 5 | 线2·1–2·近身 | 1.15 | 9%/2/1000 | 击退1 | 可 | N=2、AF=.90；`.90×(1+.24+.10)−.05=1.156≈1.15` |
| 百战归锋 `mv_jianghubaizhanjian_guifeng` | 7 | 线3·1–3·绝招 | 2.55 | 9%/绝/1200 | — | 可 | N=3、AF=.85；`3×.85=2.55` |

被动：识械 `ps_jianghubaizhanjian_shixie`（L3，每战首次面对一种新主武器，parry+3→8）；留手 `ps_jianghubaizhanjian_liushou`（L6，招架后下一剑 hit+4→10）；百家 `ps_jianghubaizhanjian_baijia`（L10，每掌握一种黄阶兵器子类，本武学修炼效率+2%，上限10%）。

### 7.3 `sk_yanzisanchaoshui` 燕子三抄水（7 地下 · 轻功 · 调和）

> **出处**：武侠通称；将其作为天龙、连城、白马、书剑的江湖秘传及定级均为**（原创扩展）**。本文不把“姑苏慕容亦擅”的江湖传闻写成门派独占事实；地形特技以 `design/08` §4.6 为准。

| 字段 | 值 |
|---|---|
| 基础 | `category:movement`；`subType:movement`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:水乡舟户与游侠`；`sourceChapters:[ch01_tianlong,ch09_liancheng,ch10_baima,ch12_shujian]`；`nature:harmony`；`wOut/wIn:.30/.70`；`Q_skill=QS(7)=92` |
| reqs | `attrs {agi:44,con:36}`；`aptitude {apLight:44}`；`prereq:[{anyOf:[{skill:sk_dengpingdushui,layer:4},{skill:sk_caoshangfei,layer:6}]}]`；`hard:[prereq]` |
| movement | `{actionBonus:{waterwalk:[8,15]},specials:[threeSkim]}`；qg2 可踏水≤3格、每次移动限1次且起止须为陆地；完整门禁语义见 `design/08` §4.5～§4.6 |
| layerStats／层数 | `eva:[3,8],spd:[2,7]`；1掠水、3一抄、5回燕、7绝招三抄渡流、10踏波不惊 |
| setTags／获取 | `[set_jianghu_baijia]`；水乡竞渡、船户救援或散人秘笈，`learnSources` 只可出现在四个原生书界 |
| special／图鉴 | `{fusible:true}`；本土最高轻功：连城／白马恰为地下7，不抬高其他书界上限 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 掠水 `mv_yanzisanchaoshui_lueshui` | 1 | 自身·位移3 | 0 | 7%/2/900 | 仅水面；不触发落水 | — | 支援位移；无伤害，不套攻击 AF |
| 一抄 `mv_yanzisanchaoshui_yichao` | 3 | 单体·1·近身 | 1.25 | 7%/1/1000 | 水面常见条件 | 可 | `1×(1+.12+.15)=1.27≈1.25` |
| 回燕 `mv_yanzisanchaoshui_huiyan` | 5 | 自身·支援 | 0 | 8%/3/900 | `bf_youshi`2；向来路退2格 | — | 支援；游势与位移不另造成伤害 |
| 三抄渡流 `mv_yanzisanchaoshui_sanchao` | 7 | 自身·绝招支援 | 0 | 9%/绝/1200 | `bf_shenqing`2、`bf_tengyue`2；本回合可踏水6格 | — | 每战1次的移动绝招；无伤害 |

被动：点波 `ps_yanzisanchaoshui_dianbo`（L2，水面 `eva pct +5%`，固定值）；三抄 `ps_yanzisanchaoshui_sanchao`（L6，明确 `threeSkim` 每次移动限1次、起止须为陆地，不另减踏水体力）；归岸 `ps_yanzisanchaoshui_guian`（L10，从水面登岸后 ct+120，每回合1次）。

### 7.4 玄阶紧凑卡（12 门；4 门核算抽样）

#### `sk_qingfengjian` 清风剑（6 玄上 · 兵器／剑 · 调和）**（原创扩展）**——核算抽样

- `sourceChapters:ALL14`；`reqs {prereq:[sk_jianghurumenjian≥4],hard:[prereq]}`；`.70/.30`；`layerStats {hit:[2,6],eva:[2,4]}`；清风 `_qingfeng`（单体 **1.10**，6%/1；`1×1.12=1.12≈1.10`）、风来 `_fenglai`（线2 **1.15**，7%/2；N=2、AF=.90，`.90×1.29=1.161≈1.15`）、扫叶 `_saoye`（`aoe_cone {angle:120,r:1,dirCount:6}` **1.15**，8%/2；N=3、AF=.85，`.85×1.34=1.139≈1.15`）；被动“风隙” `_fengxi`（移动后 hit+3→8）；`setTags:[set_jianghu_baijia]`。

#### `sk_panlonggun` 盘龙棍（6 玄上 · 兵器／棍杖 · 阳）**（原创扩展）**——核算抽样

- `sourceChapters:ALL14`；`reqs {prereq:[sk_shaobanggun≥4],hard:[prereq]}`；`.80/.20`；`layerStats {parry:[2,6],hit:[2,4]}`；立棍 `_ligun`（单体 **1.10**，6%/1；`1.12≈1.10`）、盘龙 `_panlong`（`aoe_cone {angle:120,r:1,dirCount:6}` **1.05**，7%/2，失衡30%；N=3、AF=.85，`.85×1.29−.03=1.0665≈1.05`）、探首 `_tanshou`（线2 **1.20**，8%/2；N=2、AF=.90，`.90×1.34=1.206≈1.20`）；被动“棍圈” `_gunquan`（相邻敌越多 parry+2/人，上限8）；`setTags:[set_jianghu_baijia]`。

#### `sk_dengpingdushui` 登萍渡水（6 玄上 · 轻功 · 调和）——核算抽样

- 字段完全对齐 `design/08` §4.6：`sourceChapters:ALL14`；`Q_skill=74`；`movement {actionBonus:{waterwalk:[5,15]},specials:[shallowFree]}`；`reqs {prereq:[sk_caoshangfei≥5],hard:[prereq]}`；`layerStats {eva:[2,6],spd:[2,4]}`；点萍 `_dianping`（水面条件单体 **1.25**，6%/1；`1+.12+.15=1.27≈1.25`）、渡水 `_dushui`（自身移3格，支援无伤害）、回岸 `_huian`（单体 **1.25**，7%/2，后撤1；`1+.24+.05−.05=1.24≈1.25`）；被动“浅水无碍” `_qianshui`（浅水移动消耗归 `design/08`）；`setTags:[set_jianghu_baijia]`。

#### `sk_feishahuangshi` 飞砂黄石（4 玄下 · 暗器 · 中性）**（原创扩展）**——核算抽样

- `sourceChapters:ALL14`；`reqs {prereq:[sk_tongxingfeishi≥4],hard:[prereq]}`；`.90/.10`；`layerStats {hit:[1,6],crit:[1,4]}`；飞砂 `_feisha`（投射单体 **1.05**，6%/1；`1×1.12×.92=1.03≈1.05`）、黄石 `_huangshi`（投射单体 **1.15**，7%/2，失衡30%；`1×1.29×.92−.03=1.16≈1.15`）、连投 `_liantou`（乱击n3投射 **1.05**，8%/2；`.85×1.34×.92=1.05`）；被动“沙石皆兵” `_shashijiebing`（石地普通弹药每战+2）；`setTags:[set_jianghu_baijia]`。

#### `sk_luoyedao` 落叶刀（5 玄中 · 兵器／刀 · 阴）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_hengdaorumenzhao≥4],hard:[prereq]}`；`.75/.25`；`layerStats {crit:[2,6],eva:[1,4]}`；削叶 `_xiaoye`（单体1.10）、回风 `_huifeng`（横扫.90）、落叶连环 `_lianhuan`（乱击n3 1.05）；被动“叶落” `_yeluo`（目标低于50%气血时 crit+4→10）；`setTags:[set_jianghu_baijia]`。

#### `sk_liuxingchui` 流星锤（5 玄中 · 兵器／奇门 · 阳）**（原创扩展命名）**

- `sourceChapters:ALL14`；`weaponReq:{category:exotic}`；`reqs {aptitude:{apExotic:34},hard:[]}`；`.85/.15`；`layerStats {hit:[2,6],crit:[1,4]}`；飞坠 `_feizhui`（单体1–3·1.05）、回旋 `_huixuan`（往返.85）、锁步 `_suobu`（单体1.10、迟缓）；被动“长链” `_changlian`（射程2以上命中惩罚−5→12%）；`setTags:[set_jianghu_baijia]`。

#### `sk_wuyingshou` 无影手（5 玄中 · 拳脚／擒拿 · 调和）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_sanshou≥4],hard:[prereq]}`；`.65/.35`；`layerStats {seal:[2,6],hit:[1,4]}`；探腕 `_tanwan`（单体1.05）、错骨 `_cuogu`（单体1.10、封经20%）、翻拿 `_fanna`（换位.95）；被动“手快” `_shoukuai`（首次近身反击率+4→10）；`setTags:[set_jianghu_baijia]`。

#### `sk_jianghutuna` 江湖吐纳（5 玄中 · 内功 · 调和）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_tunaqianjue≥5],hard:[prereq]}`；`nature:harmony`；`inner IP=17+10+2×7+5×1.5=48.5`，`attrs {con:3,wil:2,wis:2}`、`stats {defIn:5,resMind:5}`；`meridians:[mer_renmai,mer_chongmai]`【建议值】；调息 `_tiaoxi`（自身 `bf_tiaoxi`2）、护脉 `_humai`（自身 `bf_jiangu`2）；被动“随遇” `_suiyu`（客栈闭关效率+5→12%）；`setTags:[set_jianghu_baijia]`。

#### `sk_xingqizhou` 行气走（5 玄中 · 轻功 · 调和）**（原创扩展）**

- `sourceChapters:ALL14`；`Q_skill=64`；`reqs {prereq:[sk_yanxingbu≥4],hard:[prereq]}`；`layerStats {spd:[2,6],eva:[1,4]}`；行气 `_xingqi`（自身 `bf_jisu`2）、绕人 `_raoren`（移2格）、走马 `_zouma`（单体1.00、先换位）；被动“气随步走” `_qisuibu`（每移动3格回复内力0.5%，每回合上限2%）；`setTags:[set_jianghu_baijia]`。

#### `sk_yexinggong` 夜行功（4 玄下 · 轻功 · 阴）**（原创扩展）**

- `sourceChapters:ALL14`；`Q_skill=56`；`reqs {prereq:[sk_caoshangfei≥4],hard:[prereq]}`；`layerStats {eva:[1,6],spd:[1,4]}`；伏行 `_fuxing`（自身 `bf_yinshen`1）、翻墙 `_fanqiang`（移2格）、夜袭 `_yexi`（单体1.25、背后罕见条件）；被动“暗路” `_anlu`（夜间探索视野惩罚−10→25%）；`setTags:[set_jianghu_baijia]`。

#### `sk_hutiaodaofa` 虎跳刀法（4 玄下 · 兵器／刀 · 阳）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_hengdaorumenzhao≥4],hard:[prereq]}`；`.85/.15`；`layerStats {crit:[1,6],hit:[1,4]}`；虎跳 `_hutiao`（突进2后单体1.15）、横斩 `_hengzhan`（横扫.85）、回刀 `_huidao`（单体1.10）；被动“扑势” `_pushi`（突进命中后 `bf_ruiyi`1）；`setTags:[set_jianghu_baijia]`。

#### `sk_huiliuquan` 回流拳（4 玄下 · 拳脚／拳掌 · 调和）**（原创扩展）**

- `sourceChapters:ALL14`；`reqs {prereq:[sk_jianghuchangquan≥4],hard:[prereq]}`；`.70/.30`；`layerStats {parry:[1,6],hit:[1,4]}`；引拳 `_yinquan`（单体1.05）、回流 `_huiliu`（单体1.10并后撤1）、翻浪 `_fanlang`（横扫.85）；被动“借来势” `_jielai`（招架后下一击 Z3+4→10%）；`setTags:[set_jianghu_baijia]`。

### 7.5 黄阶一行卡（15 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_taizuchangquan` | 太祖长拳 | 军民通行 | 拳脚／拳掌（3 黄上·neutral） | ALL14 | `G_eff` 人强则强；`setTags:[set_jianghu_baijia,set_qidan_xiaofeng]`；完整规则见 `design/05` §13.5 | 无 | 《天龙八部》聚贤庄萧峰施展，招式细节**（待考）** |
| `sk_jianghurumenjian` | 江湖入门剑 | 游方武师 | 兵器／剑（3 黄上·neutral） | ALL14 | 单体1.10、线2 .95；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_pingfengjian` | 平锋剑 | 江湖散人 | 兵器／剑（2 黄中·harmony） | ALL14 | 单体1.10、招架+2→6；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_hengdaorumenzhao` | 横刀入门招 | 行脚刀客 | 兵器／刀（3 黄上·yang） | ALL14 | 单体1.10、横扫.85；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_shaobanggun` | 哨棒棍 | 乡勇／旅人 | 兵器／棍杖（2 黄中·neutral） | ALL14 | 横扫.85、单体1.10；`set_jianghu_baijia` | 无 | 哨棒为通行器物；套路**（原创扩展）** |
| `sk_duanqiangfa` | 短枪法 | 乡勇教头 | 兵器／枪（2 黄中·yang） | ALL14 | 线2 .95；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_sanshou` | 散手 | 江湖散人 | 拳脚／擒拿（2 黄中·neutral） | ALL14 | 单体1.05、封经20%；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_yanxingbu` | 雁行步 | 旅人 | 轻功（3 黄上·harmony） | ALL14 | `Q_skill=45`、直线疾行体力×.9；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_tunaqianjue` | 吐纳浅诀 | 江湖抄本 | 内功（3 黄上·harmony） | ALL14 | `IP=10+6+2×4+5×1.2=30`；`mer_renmai`【建议值】；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_dantianyangqi` | 丹田养气 | 乡里拳师 | 内功（2 黄中·yang） | ALL14 | `IP=8+5+2×3+5×1=24`；`mer_dumai`【建议值】；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_huxixingqi` | 呼吸行气 | 山野散人 | 内功（1 黄下·harmony） | ALL14 | `IP=6+4+2×2+5×1=19`；`mer_renmai`【建议值】；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_tongxingfeishi` | 通行飞石 | 牧童／猎户 | 暗器（1 黄下·neutral） | ALL14 | 投射1.05、石地补弹；`set_jianghu_baijia` | 无 | **（原创扩展）**；区别五绝 `sk_feishishou` |
| `sk_tiexiu` | 铁袖功 | 江湖卖艺人 | 拳脚／拳掌（1 黄下·yang） | ALL14 | 单体1.05、自身招架+2；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_jianghuchangquan` | 江湖长拳 | 乡勇／散人 | 拳脚／拳掌（1 黄下·neutral） | ALL14 | 单体1.10；`set_jianghu_baijia` | 无 | **（原创扩展）** |
| `sk_caoshangfei` | 草上飞 | 江湖通行 | 轻功（2 黄中·neutral） | ALL14 | `Q_skill=38`；`movement {staMul:{sprint:.8},moveCostByTag:{veg:-1}}`；草地不留足迹；`set_jianghu_baijia` | 无 | 武侠通称；定级与规则**（原创扩展）**，见 `design/08` §4.5～§4.6 |

**黄阶预算核对**：攻击招按黄阶基准 5%：单体 cd1 为 `1+.12=1.12→1.10`，投射为 `1.12×.92=1.03→1.05`，线2为 `.90×1.12=1.008→1.00`，六向横扫为 `.85×1.12=.952→.95`；散手封经20%时 `1.12−.20×.20=1.08→1.05`。三门内功分别精确命中 IP 30／24／19；轻功只引用 QS，不添加越阶门禁。

---

## 8. 无门派杂学总表（42 门）

### 8.1 范围、目录与技艺门槛

本节只收不属于具名门派的江湖知识。门派医毒、蛊阵、琴棋书画仍在所属图鉴定义；同一角色从门派学到相似技法时，检索 UI 可以并列，但不得把本节条目替换成门派秘传。杂学的修炼资质与效果技艺引用 `design/05` §2.3；`reqs.skills` 只使用 C17 十键，驭兽用 `cha`、心神用 `wil`。

| 分支 | 地阶（完整卡） | 玄阶（紧凑卡） | 黄阶（一行卡） | 进阶链／套装 |
|---|---|---|---|---|
| 医 | `sk_qihuangmifa` | `sk_tuinaliaofa`、`sk_jingmaizhenfa`、`sk_wangqiwenshen` | `sk_caoyaozhi`、`sk_baoshangfa`、`sk_jiuxuefa` | 草药知→推拿疗法→岐黄秘法；`legacy-set:xinglin_qihuang` |
| 毒 | `sk_baidubianzheng` | `sk_baicaobiandu`、`sk_shiduyaojing` | `sk_biandufa`、`sk_yantufa` | 辨毒法→百草辨毒→百毒辨证；`legacy-set:dujia_baicao` |
| 蛊 | — | `sk_yanggujue`、`sk_biangufa` | `sk_shiguchong` | 蛊学最高玄阶；`legacy-set:guchong_mifa` |
| 阵 | `sk_qimenbuzhen` | `sk_xiaoqimen`、`sk_dixingkanzhen` | `sk_kanzhenfa`、`sk_buzhenrumen` | 看阵法→小奇门→奇门布阵；`legacy-set:qimen_jianghu` |
| 音／音功／心神 | `sk_qingxinqupu` | `sk_qixianyin`、`sk_diquxinfa`、`sk_chuanyunxiao`、`sk_ningxinjue` | `sk_diqurumen`、`sk_chuanyinfa`、`sk_shouxinjue`、`sk_qingxinshou` | 笛曲入门→七弦音→清心曲谱；`legacy-set:yayue_qingxin` |
| 书画／棋 | — | `sk_feibairujian`、`sk_danqingguanfa`、`sk_yizhanqipu`、`sk_zhijibufa` | `sk_linmotieshi`、`sk_qishirumen` | 临摹／棋势两条玄链；`legacy-set:hanmo_yiqi` |
| 易容 | `sk_huanyirongshu` | `sk_suogugong` | `sk_gaizhuangfa` | 改装法→缩骨功→幻易容术；`legacy-set:huanyirong` |
| 驭兽 | `sk_baishouyujue` | `sk_yingshefa`、`sk_ximashu` | `sk_xunquanshu` | 训犬术→鹰蛇法→百兽御诀；`legacy-set:baishou_xunyuan` |

本节合计地 6／玄 20／黄 16。`sk_baishouyujue` 是驭兽链终点，不是蛊术前置；`sk_shiguchong → sk_biangufa` 的通用蛊链止于玄中，避免抢占五仙教等门派的高阶蛊法。

### 8.2 `sk_qihuangmifa` 岐黄秘法（8 地中 · 杂学／医 · 调和）**（原创扩展）**

> “岐黄”是传统医术代称；本文武学名、招式、配方与跨书界汇编均为原创扩展，不借此声称原著存在同名秘籍。

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:medicine`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:游医与地方医案汇编`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch06_xiake,ch07_bixue,ch09_liancheng,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:0/1` |
| reqs | `attrs {wis:48,wil:40}`；`skills {med:58}`；`prereq:[{skill:sk_tuinaliaofa,layer:5}]`；`hard:[prereq]`，`med` 为软门槛 |
| layerStats／层数 | `healPower:[3,8],resPoison:[2,7]`；1切脉、3推宫、5辨证、6金针、7绝招起沉疴、10医理贯通 |
| setTags／获取 | `[]`；三地游医医案印证，或完成无门派名医连续救治支线 |
| special／图鉴 | `{fusible:false}`；不代替物品与专属解药；对蛊、受制类只能依 `design/06` 压制，不能通杀 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 切脉 `mv_qihuangmifa_qiemai` | 1 | 友方单体1·支援 | 0 | 7%/1/900 | 显示可医减益与品阶 | — | 情报支援，无伤害与治疗量 |
| 推宫 `mv_qihuangmifa_tuigong` | 3 | 友方单体1·支援 | 0 | 7%/2/1000 | 治疗18% `hpMax` | — | `18%` 为 §4.2 标准单体治疗 |
| 辨证 `mv_qihuangmifa_bianzheng` | 5 | 友方单体1·支援 | 0 | 8%/3/1000 | 驱散1个 `poison` 或 `injury` | — | 支援；多1%耗内支付二选一驱散灵活性 |
| 金针通络 `mv_qihuangmifa_jinzhen` | 6 | 友方单体1·支援 | 0 | 8%/3/1000 | `bf_huoluo`3 | — | 支援；3回合活络，不附加治疗 |
| 起沉疴 `mv_qihuangmifa_qichenke` | 7 | 友方r2·绝招支援 | 0 | 10%/绝/1200 | 群体治疗11.7% `hpMax`、`bf_huichun`2 | — | `18%×AF(.65)=11.7%`；持续回复另以绝招资源支付 |

被动：识药 `ps_qihuangmifa_shiyao`（L2，采药额外产出+5→12%）；妙手 `ps_qihuangmifa_miaoshou`（L6，施治后自身 `bf_miaoshou`2）；医理贯通 `ps_qihuangmifa_guantong`（L10，医术压制比自身高1品的毒伤，但仍不能根治专属状态）。

### 8.3 `sk_baidubianzheng` 百毒辨证（8 地中 · 杂学／毒 · 阴）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:poison`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:药商、仵作与江湖毒经互证`；`sourceChapters:[ch01_tianlong,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch07_bixue,ch08_luding,ch09_liancheng,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:yin`；`wOut/wIn:.20/.80` |
| reqs | `attrs {wis:48,wil:40}`；`skills {poi:58,antidote:48}`；`prereq:[{skill:sk_baicaobiandu,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `effHit:[3,8],resPoison:[2,7]`；1察色、3引毒、5攻其所畏、6相制、7绝招百毒归证、10知毒知解 |
| setTags／获取 | `[]`；辨识八类野外毒物并取得三份地方药案；不从门派毒师处自动复制 |
| special／图鉴 | `{fusible:false}`；所有中毒、驱散、免疫与跨战斗持续完整引用 `design/06` |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 察色 `mv_baidubianzheng_chase` | 1 | 单体1–4·支援 | 0 | 7%/1/900 | 显示毒标签、层数、来源 | — | 情报支援，无伤害 |
| 引毒 `mv_baidubianzheng_yindu` | 3 | 单体1–4·投射 | 1.15 | 8%/2/1000 | `bf_zhongdu`50%·3 | 可 | `1×(1+.24+.05)×.92−.10×.50=1.14≈1.15` |
| 攻其所畏 `mv_baidubianzheng_gongwei` | 5 | 单体1–4·投射 | 1.30 | 8%/2/1000 | 目标已有 `poison` 时常见条件 | 可 | `1×(1+.24+.05+.15)×.92=1.32≈1.30` |
| 以毒相制 `mv_baidubianzheng_xiangzhi` | 6 | 友方单体1·支援 | 0 | 8%/3/1000 | 压制一个可由医药处理的毒3回合 | — | 支援；不处理 `special` 专解类 |
| 百毒归证 `mv_baidubianzheng_guizheng` | 7 | `aoe_cone {r:2,angle:60,dirCount:6}`·绝招 | 2.30 | 10%/绝/1200 | `bf_kangxing_jiang`100%·3，参数 `poison` | 可 | N=4、AF=.80；`3×.80−.10=2.30` |

被动：辨气 `ps_baidubianzheng_bianqi`（L2，隐藏毒识破阈值−5→12）；自守 `ps_baidubianzheng_zishou`（L6，战斗开始自身 `bf_bidu`3）；知毒知解 `ps_baidubianzheng_zhijie`（L10，制作通用解毒药时有20%不耗一份辅料）。

### 8.4 `sk_qimenbuzhen` 奇门布阵（8 地中 · 杂学／阵法 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:formation`；`grade:8`；`origin:expanded`；`sect:null`；`lineage:行军图、堪舆图与江湖阵图汇编`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch06_xiake,ch07_bixue,ch08_luding,ch09_liancheng,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:.40/.60` |
| reqs | `attrs {wis:50,wil:42}`；`skills {formation:60}`；`prereq:[{skill:sk_xiaoqimen,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `hit:[2,7],parry:[3,8]`；1定门、3引路、5伏门、6移位、7绝招八门归一、10因地制宜 |
| setTags／获取 | `[]`；破解三种地形阵题并完成一场单人守阵；不要求多人才能施展 |
| special／图鉴 | `{fusible:false,combo:false}`；单人可装配，多人站位只是协同，不计合击武学 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 定门 `mv_qimenbuzhen_dingmen` | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_jingzhun`2 | — | 支援；阵眼标定不造成伤害 |
| 引路 `mv_qimenbuzhen_yinlu` | 3 | 线2·1–2·近身 | 1.15 | 8%/2/1000 | — | 可 | N=2、AF=.90；`.90×(1+.24+.05)=1.161≈1.15` |
| 伏门 `mv_qimenbuzhen_fumen` | 5 | `aoe_spokes {r:1}`·1–3·远程 | 0.75 | 9%/3/1000 | `bf_chihuan`100% | 可 | N=7、AF=.70；`.70×(1+.36+.10)×.85−.10=.769≈.75` |
| 易位 `mv_qimenbuzhen_yiwei` | 6 | 友方单体1–3·支援 | 0 | 8%/3/900 | 与友方换位，双方 `bf_yuanhu`1 | — | 支援换位，无伤害 |
| 八门归一 `mv_qimenbuzhen_bamen` | 7 | 友方r2·绝招支援 | 0 | 10%/绝/1200 | 全体 `bf_jiangu`2；敌方标记 `bf_suoding`2 | — | 群体阵法绝招；每战1次，不计合击 |

被动：看阵 `ps_qimenbuzhen_kanzhen`（L2，阵法陷阱显形距离+1→3格）；借地 `ps_qimenbuzhen_jiedi`（L6，人工／狭道地形 Z4+4%→10%）；因地制宜 `ps_qimenbuzhen_yindi`（L10，战斗开始自动把最近可行格设为阵眼，不消耗行动）。

### 8.5 `sk_qingxinqupu` 清心曲谱（8 地中 · 杂学／音律 · 调和）**（原创扩展命名）**

> 清心类曲意在原著中有相关表现，但本文“清心曲谱”是无门派汇编名；不得与门派图鉴中任盈盈等人物的具名曲目合并。需核对相关曲目名称及施演情节**（待考：《笑傲江湖》琴曲疗伤、宁神相关段落）**。

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:music`；`grade:8`；`origin:canonExpanded`；`sect:null`；`lineage:琴师、乐工与隐者曲谱汇编`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch04_yitian,ch05_xiaoao,ch06_xiake,ch07_bixue,ch08_luding,ch12_shujian,ch13_feihu]`；`nature:harmony`；`wOut/wIn:.10/.90` |
| reqs | `attrs {wis:46,wil:46}`；`skills {music:60}`；`prereq:[{skill:sk_qixianyin,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `effRes:[3,8],resMind:[2,7]`；1定弦、3和声、5清心、6解纷、7绝招万籁澄明、10心弦不乱 |
| setTags／获取 | `[]`；集齐三地残谱并经一位乐师印证；需琴、箫等适用乐器时由装备标签检查 |
| special／图鉴 | `{fusible:false}`；音律效果不穿透 `bf_mian_xin`，心神抗性与驱散完全服从 `design/06` |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 定弦 `mv_qingxinqupu_dingxian` | 1 | 自身·支援 | 0 | 7%/2/900 | `bf_dingxin`3 | — | 支援；单体定心不造成伤害 |
| 和声 `mv_qingxinqupu_hesheng` | 3 | 友方r2·支援 | 0 | 8%/3/1000 | `bf_qingxin`2 | — | 群体支援，治疗／驱散由 Buff 自身结算 |
| 清心 `mv_qingxinqupu_qingxin` | 5 | 友方单体1–4·支援 | 0 | 8%/3/1000 | 驱散1个 `mind` | — | 标准单体驱散，无伤害 |
| 解纷 `mv_qingxinqupu_jiefen` | 6 | 敌方r2·支援 | 0 | 9%/3/1000 | `bf_qinei`100%·2 | — | 支援；只施加气馁，不造成伤害 |
| 万籁澄明 `mv_qingxinqupu_wanlai` | 7 | 全体友方·绝招支援 | 0 | 10%/绝/1200 | `bf_qingxin`3、`bf_dingxin`3 | — | 全体支援；每战1次 |

被动：知音 `ps_qingxinqupu_zhiyin`（L2，队友持乐器时效果命中+3→8）；和心 `ps_qingxinqupu_hexin`（L6，清除心神状态后目标获 `bf_shouyi`2）；不乱 `ps_qingxinqupu_buluan`（L10，自身对不高于本功品阶的 `mind` 效果抗性+20）。

### 8.6 `sk_huanyirongshu` 幻易容术（7 地下 · 杂学／易容 · 调和）**（原创扩展）**

> 原著中阿朱精于易容改扮（《天龙八部》，具体扮演对象与先后待考）；本条是跨书界无门派的高阶汇编，不宣称“幻易容术”为原著名称，也不把阿朱设成门派祖师。

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:disguise`；`grade:7`；`origin:canonExpanded`；`sect:null`；`lineage:阿朱技法观摩与江湖伶人改扮术汇编`；`sourceChapters:[ch01_tianlong,ch05_xiaoao,ch08_luding,ch09_liancheng,ch12_shujian]`；`nature:harmony`；`wOut/wIn:.30/.70` |
| reqs | `attrs {agi:42,wis:45,cha:40}`；`skills {art:54}`；`prereq:[{skill:sk_suogugong,layer:5}]`；`hard:[prereq]` |
| layerStats／层数 | `eva:[2,7],effRes:[3,8]`；1改貌、3拟声、5缩骨、6换步、7绝招幻形脱身、10真假难辨 |
| setTags／获取 | `[]`；天龙可观摩阿朱相关支线，其余书界由伶班／江湖秘本印证；每个来源单独限制身份伪装范围 |
| special／图鉴 | `{fusible:false}`；探索识破公式与战斗首击规则只引用 `design/06` 的 `bf_yirong` |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 改貌 `mv_huanyirongshu_gaimao` | 1 | 自身·支援 | 0 | 7%/3/1000 | `bf_yirong`，世界12时辰 | — | 探索支援；效果值由 `design/06` 识破公式约束 |
| 拟声 `mv_huanyirongshu_nisheng` | 3 | 自身·支援 | 0 | 7%/2/900 | 对话伪装检定 `art+cha` | — | 非战斗检定，不造成伤害 |
| 缩骨 `mv_huanyirongshu_suogu` | 5 | 自身·支援 | 0 | 8%/3/900 | 获得 `squeeze` 一次 | — | 门禁钥匙，完整语义见 `design/08` |
| 换步 `mv_huanyirongshu_huanbu` | 6 | 单体·1·近身 | 1.15 | 8%/2/1000 | 与目标换位 | 可 | `1×(1+.24+.05)−.15=1.14≈1.15` |
| 幻形脱身 `mv_huanyirongshu_huanxing` | 7 | 自身·绝招支援 | 0 | 9%/绝/1200 | `bf_yinshen`1；清除仇恨锁定 | — | 每战1次；支援无伤害 |

被动：察言 `ps_huanyirongshu_chayan`（L2，被识破前对话 `speech` 检定+3→8）；入戏 `ps_huanyirongshu_ruxi`（L6，`bf_yirong` 首击后 ct+100）；真假 `ps_huanyirongshu_zhenjia`（L10，普通 NPC 识破阈值额外+10，首领仍按原式）。

### 8.7 `sk_baishouyujue` 百兽御诀（7 地下 · 杂学／驭兽 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:misc`；`subType:beast`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:猎户、牧人、鹰师与蛇客经验汇编`；`sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao,ch04_yitian,ch05_xiaoao,ch06_xiake,ch07_bixue,ch08_luding,ch10_baima,ch11_yuanyang,ch12_shujian,ch13_feihu,ch14_xueshan]`；`nature:harmony`；`wOut/wIn:.50/.50` |
| reqs | `attrs {cha:48,wis:42}`；`prereq:[{skill:sk_yingshefa,layer:5}]`；`hard:[prereq]`；驭兽效果强度读 `cha`，不虚造 `skills.beast` |
| layerStats／层数 | `effHit:[2,7],resMind:[3,8]`；1安抚、3驱行、5鹰蛇、6兽阵、7绝招百兽归心、10人兽相知 |
| setTags／获取 | `[]`；救治并安抚三类动物、再由猎户／牧人印证；宠物与召唤上限归 `design/18` |
| special／图鉴 | `{fusible:false,combo:false}`；不是蛊术，不能控制剧情首领或具 `bf_shouling` 的单位 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 安抚 `mv_baishouyujue_anfu` | 1 | 野兽单体1–4·支援 | 0 | 7%/2/900 | 清1个 `mind`，降低敌意 | — | 驭兽支援；首领免疫 |
| 驱行 `mv_baishouyujue_quxing` | 3 | 友方兽单体1–4·支援 | 0 | 7%/2/900 | `bf_jisu`2 | — | 单体增益，无伤害 |
| 鹰击 `mv_baishouyujue_yingji` | 5 | 单体2–5·投射 | 1.15 | 8%/2/1000 | `bf_suoding`50%·2 | 可 | `1×(1+.24+.05)×.92−.10×.50=1.14≈1.15` |
| 蛇扰 `mv_baishouyujue_sherao` | 6 | 单体1–3·投射 | 1.15 | 8%/2/1000 | `bf_shedu`30%·3 | 可 | `1×1.29×.92−.10×.30=1.16≈1.15` |
| 百兽归心 `mv_baishouyujue_guixin` | 7 | 友方兽r3·绝招支援 | 0 | 9%/绝/1200 | `bf_renjin`2、`bf_jingzhun`2 | — | 群体支援；每战1次 |

被动：兽语 `ps_baishouyujue_shouyu`（L2，野兽敌意检定 `cha`+3→8）；共感 `ps_baishouyujue_gonggan`（L6，友方兽受伤时自身 rage+3，每回合2次）；相知 `ps_baishouyujue_xiangzhi`（L10，友方兽在场时双方 resMind+10）。

> 通用驭兽只调用 `design/06` 已有蛇毒，不创造新蛊 Buff。

### 8.8 玄阶紧凑卡（20 门；6 门核算抽样）

以下每门均为 `sect:null`；未逐项复写者 `sourceChapters:ALL14`、`origin:expanded`。六门标“核算抽样”的攻击式全部给出公式，其余条目在数据导出时仍接受同一倍率 lint。

#### 医术（3 门）

- **`sk_tuinaliaofa` 推拿疗法（6 玄上 · 医 · 调和）** **（原创扩展）**——核算抽样：`sourceChapters:ALL14`；`reqs {skills:{med:42},prereq:[sk_caoyaozhi≥4],hard:[prereq]}`；`layerStats {healPower:[2,6],resInjury:[2,4]}`；按穴 `_anxue`（友方治疗18%，6%/2）；活络 `_huoluo`（`bf_huoluo`3）；推宫 `_tuigong`（友方治疗18%并驱散 `cc.slow`，8%/3）；被动“手到” `_shoudao`（近身治疗+5→12%）；`legacy-set:xinglin_qihuang`。
- **`sk_jingmaizhenfa` 经脉针法（5 玄中 · 医 · 调和）** **（原创扩展）**：`reqs {skills:{med:38},prereq:[sk_jiuxuefa≥4],hard:[prereq]}`；认穴、通络、护穴三式，分别标记病灶／施加 `bf_huoluo`／`bf_huxue`；被动“针稳”（治疗暴击+3→8%）；`legacy-set:xinglin_qihuang`。
- **`sk_wangqiwenshen` 望气问诊（4 玄下 · 医 · 调和）** **（原创扩展）**：`reqs {skills:{med:28},hard:[]}`；望色、问痛、辨息三式，显示伤病标签并给下一次治疗 `bf_miaoshou`2；被动“先辨后治”（已识别状态治疗+5→10%）；`legacy-set:xinglin_qihuang`。

#### 毒与蛊（4 门）

- **`sk_baicaobiandu` 百草辨毒（6 玄上 · 毒 · 阴）** **（原创扩展）**——核算抽样：`sourceChapters:ALL14`；`reqs {skills:{poi:44,antidote:34},prereq:[sk_biandufa≥4],hard:[prereq]}`；试叶 `_shiye`（投射单体 **1.05**，6%/1；`1.12×.92=1.03≈1.05`）、杂毒 `_zadu`（投射 **1.10**，7%/2，`bf_zhongdu`50%；`1.29×.92−.05=1.14≈1.10`）、相克 `_xiangke`（友方 `bf_bidu`3）；被动“百草”（采集毒草额外+5→12%）；`legacy-set:dujia_baicao`。
- **`sk_shiduyaojing` 识毒药经（5 玄中 · 毒 · 调和）** **（原创扩展）**：`reqs {skills:{poi:36,antidote:36},prereq:[sk_yantufa≥4],hard:[prereq]}`；验粉、辨烟、避毒三式，分别识别、驱散毒雾与施加 `bf_bidu`；被动“闻气”（隐藏毒识破+5→12）；`legacy-set:dujia_baicao`。
- **`sk_yanggujue` 养蛊诀（5 玄中 · 蛊 · 阴）** **（原创扩展）**：`reqs {skills:{poi:38},prereq:[sk_shiguchong≥4],hard:[prereq]}`；养蛊、伏蛊、催蛊三式，催蛊调用 `bf_gu_cuidong`；被动“活器”（蛊材保鲜+10→25%）；`legacy-set:guchong_mifa`。
- **`sk_biangufa` 辨蛊法（4 玄下 · 蛊 · 调和）** **（原创扩展）**：`reqs {skills:{poi:30,antidote:24},prereq:[sk_shiguchong≥4],hard:[prereq]}`；察蛊、压蛊、辟蛊三式，压制按 `design/06` §9.2、辟蛊施加 `bf_bigu`；被动“知主”（识别蛊主线索）；`legacy-set:guchong_mifa`。

#### 阵法（2 门）

- **`sk_xiaoqimen` 小奇门（6 玄上 · 阵法 · 调和）** **（原创扩展）**——核算抽样：`sourceChapters:ALL14`；`reqs {skills:{formation:44},prereq:[sk_kanzhenfa≥4],hard:[prereq]}`；`layerStats {hit:[2,6],parry:[2,4]}`；定方 `_dingfang`（自身 `bf_jingzhun`2）、引门 `_yinmen`（线2 **1.15**，7%/2；N=2、AF=.90，`.90×1.29=1.161≈1.15`）、错位 `_cuowei`（单体换位 **1.20**，8%/2；`1.34−.15=1.19≈1.20`）；被动“小阵眼”（人工地形 parry+3→8）；`legacy-set:qimen_jianghu`。
- **`sk_dixingkanzhen` 地形看阵（4 玄下 · 阵法 · 调和）** **（原创扩展）**：`reqs {skills:{formation:30},prereq:[sk_kanzhenfa≥4],hard:[prereq]}`；辨高、识隘、看水三式，分别显示高差、伏击格与水路；被动“地势入图”（开战显示敌方第一回合移动意图）；`legacy-set:qimen_jianghu`。

#### 音律、音功与心神（4 门）

- **`sk_qixianyin` 七弦音（6 玄上 · 音律 · 调和）** **（原创扩展）**——核算抽样：`sourceChapters:ALL14`；`reqs {skills:{music:44},prereq:[sk_diqurumen≥4],hard:[prereq]}`；定弦 `_dingxian`（自身 `bf_dingxin`2）、和鸣 `_heming`（友方r1 `bf_qingxin`2）、乱弦 `_luanxian`（`aoe_cone {r:2,angle:60,dirCount:6}` 远程不可架 **.75**，8%/2，`bf_luanxin`30%；N=4、AF=.80，`.80×1.34×.85×.85−.03=.7445≈.75`）；被动“七音”（连续不同曲式效果命中+2/层，上限6）；`legacy-set:yayue_qingxin`。
- **`sk_diquxinfa` 笛曲心法（5 玄中 · 音律 · 调和）** **（原创扩展）**：`reqs {skills:{music:36},prereq:[sk_diqurumen≥4],hard:[prereq]}`；缓调、清音、长吹三式，施加 `bf_dingxin`／`bf_qingxin`／自身 `bf_jienei`；被动“气息绵长”（音律耗内−3→8%）；`legacy-set:yayue_qingxin`。
- **`sk_chuanyunxiao` 穿云啸（5 玄中 · 音功 · 阳）** **（原创扩展）**：`reqs {attrs:{wil:36},aptitude:{apInner:34},skills:{music:26},hard:[]}`；穿云、断喝、回声三式，单体远程、锥2与周身音波，附 `bf_zhenshe`；被动“声达”（音功高度容差99）；`legacy-set:yayue_qingxin`。
- **`sk_ningxinjue` 凝心诀（4 玄下 · 心神 · 调和）** **（原创扩展）**：`reqs {attrs:{wil:32,wis:28},hard:[]}`；凝神、守念、醒梦三式，施加 `bf_dingxin`／`bf_shouyi`并驱散 `mind`；被动“一念”（首次心神抵抗+5→12%）；`legacy-set:yayue_qingxin`。

#### 书画与棋（4 门）

- **`sk_feibairujian` 飞白如剑（6 玄上 · 书画 · 调和）** **（原创扩展命名）**——核算抽样：`sourceChapters:ALL14`；`reqs {skills:{art:44},prereq:[sk_linmotieshi≥4],hard:[prereq]}`；落笔 `_luobi`（单体近身 **1.10**，6%/1；`1.12≈1.10`）、飞白 `_feibai`（线2远程 **1.00**，7%/2；N=2、AF=.90，`.90×1.29×.85=.987≈1.00`）、藏锋 `_cangfeng`（单体 **1.30**，8%/2，破甲30%；`1.34−.03=1.31≈1.30`）；被动“笔意”（持 `exotic:brush` 时 hit+3→8）；`legacy-set:hanmo_yiqi`。
- **`sk_danqingguanfa` 丹青观法（5 玄中 · 书画 · 调和）** **（原创扩展）**：`reqs {skills:{art:36},prereq:[sk_linmotieshi≥4],hard:[prereq]}`；观形、布白、点睛三式，分别显示架势／自身 `bf_jingzhun`／标记敌方 `bf_suoding`；被动“画理”（机关图与地图解读+5→12）；`legacy-set:hanmo_yiqi`。
- **`sk_yizhanqipu` 弈战棋谱（5 玄中 · 棋 · 调和）** **（原创扩展）**：`reqs {skills:{chess:38},prereq:[sk_qishirumen≥4],hard:[prereq]}`；占角、打劫、收官三式，分别布阵眼、交换站位与推迟敌方集气；被动“算路”（战斗预览多显示一层行动）；`legacy-set:hanmo_yiqi`。
- **`sk_zhijibufa` 制机步法（4 玄下 · 棋 · 调和）** **（原创扩展）**：`reqs {skills:{chess:30},prereq:[sk_qishirumen≥4],hard:[prereq]}`；先手、自补、弃子三式，施加 `bf_xianji`、`bf_yuanhu`，或牺牲自身护体换友方 `bf_renjin`；被动“先算”（开战首轮 hit+3→8）；`legacy-set:hanmo_yiqi`。

#### 易容、驭兽（3 门）

- **`sk_suogugong` 缩骨功（6 玄上 · 易容 · 阴）** **（原创扩展命名）**——核算抽样：`sourceChapters:[ch01_tianlong,ch05_xiaoao,ch08_luding,ch09_liancheng,ch12_shujian]`；`reqs {attrs:{agi:40},skills:{art:34},prereq:[sk_gaizhuangfa≥4],hard:[prereq]}`；收肩 `_shoujian`（自身 `bf_piaohu`2）、脱缚 `_tuofu`（驱散 `cc.bind`）、贴身 `_tieshen`（单体换位 **1.20**，8%/2；`1.34−.15=1.19≈1.20`）；被动“缩身”（获得 `squeeze`）；`legacy-set:huanyirong`。名称为武侠通称，归属与招式**（原创扩展）**。
- **`sk_yingshefa` 鹰蛇法（5 玄中 · 驭兽 · 调和）** **（原创扩展）**：`reqs {attrs:{cha:38,wis:32},prereq:[sk_xunquanshu≥4],hard:[prereq]}`；唤鹰、驱蛇、止兽三式，分别标记 `bf_suoding`、施加 `bf_shedu` 与安抚野兽；被动“识性”（鹰蛇类友方 hit+3→8）；`legacy-set:baishou_xunyuan`。
- **`sk_ximashu` 相马术（4 玄下 · 驭兽 · 调和）** **（原创扩展）**：`reqs {attrs:{cha:30,wis:28},hard:[]}`；相骨、安辔、催蹄三式，识别坐骑属性、清恐惧、施加 `bf_jisu`；被动“惜马”（坐骑体力消耗−5→12%）；`legacy-set:baishou_xunyuan`。

### 8.9 黄阶一行卡（16 门）

| ID | 名称 | 门派／来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_caoyaozhi` | 草药知 | 采药人／游医 | 杂学／医（3 黄上·harmony） | ALL14 | 识药、治疗18%；`[]` | 无 | **（原创扩展）** |
| `sk_baoshangfa` | 包伤法 | 军医／镖局 | 杂学／医（2 黄中·harmony） | ALL14 | 止血、治疗18%；`[]` | 无 | **（原创扩展）** |
| `sk_biandufa` | 辨毒法 | 药商／游医 | 杂学／毒（3 黄上·harmony） | ALL14 | 显示毒标签、`bf_bidu`2；`[]` | 无 | **（原创扩展）** |
| `sk_yantufa` | 验土法 | 仵作／采药人 | 杂学／毒（2 黄中·harmony） | ALL14 | 识别毒地形、样本；`[]` | 无 | **（原创扩展）** |
| `sk_shiguchong` | 识蛊虫 | 西南行商／猎户 | 杂学／蛊（2 黄中·neutral） | 天龙、笑傲、碧血、飞狐 | 识别蛊标签、`bf_bigu`1；`[]` | 无 | **（原创扩展）** |
| `sk_kanzhenfa` | 看阵法 | 乡勇／行商 | 杂学／阵法（3 黄上·harmony） | ALL14 | 显示阵眼与陷阱；`[]` | 无 | **（原创扩展）** |
| `sk_buzhenrumen` | 布阵入门 | 军士／护院 | 杂学／阵法（2 黄中·neutral） | ALL14 | 放置1个阵眼、相邻 parry+2；`[]` | 无 | **（原创扩展）** |
| `sk_diqurumen` | 笛曲入门 | 乐工／牧人 | 杂学／音律（3 黄上·harmony） | ALL14 | `bf_dingxin`2；`[]` | 无 | **（原创扩展）** |
| `sk_linmotieshi` | 临摹帖式 | 书生／画师 | 杂学／书画（3 黄上·harmony） | ALL14 | 识字画、下一次命中+3；`[]` | 无 | **（原创扩展）** |
| `sk_qishirumen` | 棋势入门 | 棋摊／隐士 | 杂学／棋（2 黄中·harmony） | ALL14 | 显示下一行动、阵眼+1；`[]` | 无 | **（原创扩展）** |
| `sk_gaizhuangfa` | 改装法 | 伶人／行商 | 杂学／易容（3 黄上·neutral） | ALL14 | 低阶 `bf_yirong`、限平民身份；`[]` | 无 | **（原创扩展）** |
| `sk_xunquanshu` | 训犬术 | 猎户／庄户 | 杂学／驭兽（3 黄上·harmony） | ALL14 | 安抚犬类、犬伴 hit+2；`[]` | 无 | **（原创扩展）** |
| `sk_chuanyinfa` | 传音法 | 乐工／说书人 | 杂学／音功（2 黄中·harmony） | ALL14 | 友方单体 `bf_ningshen`2；`[]` | 无 | **（原创扩展）** |
| `sk_shouxinjue` | 守心诀 | 江湖抄本 | 杂学／心神（2 黄中·harmony） | ALL14 | 自身 `bf_dingxin`2；`[]` | 无 | **（原创扩展）** |
| `sk_jiuxuefa` | 救穴法 | 行脚医者 | 杂学／医（1 黄下·harmony） | ALL14 | 解除低阶点穴、失败则压制1回合；`[]` | 无 | **（原创扩展）** |
| `sk_qingxinshou` | 清心手 | 说书人／僧道散人 | 杂学／心神（1 黄下·harmony） | ALL14 | 清1个低阶 `mind` 或施 `bf_dingxin`1；`[]` | 无 | **（原创扩展）** |

**黄阶预算核对**：本表皆为支援／知识型杂学，不设攻击倍率；单体治疗统一18% `hpMax`，黄阶清除只对不高于来源品阶者生效。增益、驱散、识别与阵眼能力的持续／品阶对抗直接引用 `design/06`，不存在绕过专属解药、蛊主或首领免疫的例外。

---

## 9. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与逐书界路径唯一见 `design/07` §16；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 江湖百家 | `set_jianghu_baijia` | `sk_jianghubaizhanjian`、`sk_yanzisanchaoshui`、`sk_qingfengjian`、`sk_panlonggun`、`sk_dengpingdushui`、`sk_feishahuangshi`、`sk_luoyedao`、`sk_liuxingchui`、`sk_wuyingshou`、`sk_jianghutuna`、`sk_xingqizhou`、`sk_yexinggong`、`sk_hutiaodaofa`、`sk_huiliuquan`、`sk_taizuchangquan`、`sk_jianghurumenjian`、`sk_pingfengjian`、`sk_hengdaorumenzhao`、`sk_shaobanggun`、`sk_duanqiangfa`、`sk_sanshou`、`sk_yanxingbu`、`sk_tunaqianjue`、`sk_dantianyangqi`、`sk_huxixingqi`、`sk_tongxingfeishi`、`sk_tiexiu`、`sk_jianghuchangquan`、`sk_caoshangfei` |
| 军伍百战 | `set_junwu_baizhan` | `sk_pojunqiangfa`、`sk_baizhanxinfa`、`sk_shouchengzhen`、`sk_duanzhenqiang`、`sk_junzhongdao`、`sk_zhenqijian`、`sk_jundituna`、`sk_xingjunbu`、`sk_shouchengfa`、`sk_changqiangrumen`、`sk_junwuduandao`、`sk_junwuchangjian` |
| 蓬莱潮生 | `set_penglai_chaosheng` | `sk_donghaichaoshengzhang`、`sk_tianwangbuxin`、`sk_penglaiquan`、`sk_chaoyinxinfa`、`sk_penglairumenquan`、`sk_haifengbu` |

跨组正式关系：`sk_taizuchangquan → set_qidan_xiaofeng`，完整套装见 `design/07` §12.5。越女、雁门、镖局、武馆、杏林、毒家、蛊虫、奇门、雅乐、翰墨、易容与百兽候选均已移除实际标签；完整去向见 `design/07` §19。

## 10. 本组统计

### 10.1 传承／来源 × 大阶

| 传承／来源 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 序章剑源 | 0 | 1 | 3 | 6 | 10 |
| 蓬莱派 | 0 | 1 | 3 | 2 | 6 |
| 军中 | 0 | 4 | 7 | 7 | 18 |
| 镖局／护院 | 0 | 2 | 6 | 6 | 14 |
| 市镇武馆 | 0 | 3 | 7 | 6 | 16 |
| 江湖散人 | 0 | 2 | 12 | 15 | 29 |
| 无门派杂学 | 0 | 6 | 20 | 16 | 42 |
| **合计** | **0** | **19** | **58** | **58** | **135** |

AR-01 的 0～1 天阶例外按旧目标 90 扩为 `90×1.5=135`；本文实际地／玄／黄为 `19:58:58≈1:3.05:3.05`。相对精确 `1:3:3` 的玄、黄目标各仅 `+1/57=1.75%`，处于 ±15% 容差内。

### 10.2 类别 × 大阶

| 大类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 0 | 2 | 5 | 7 | **14** |
| 拳脚 | 0 | 2 | 6 | 9 | **17** |
| 兵器 | 0 | 6 | 15 | 17 | **38** |
| 轻功 | 0 | 1 | 6 | 6 | **13** |
| 暗器 | 0 | 1 | 4 | 3 | **8** |
| 杂学 | 0 | 7 | 22 | 16 | **45** |
| **合计** | **0** | **19** | **58** | **58** | **135** |

类别口径：军阵、医、毒、蛊、阵法、音律、音功、心神、书画、棋、易容、驭兽均计“杂学”；弓箭依 C16 计暗器；兵器按剑、刀、枪、棍杖、奇门汇总。

### 10.3 十二级品阶与内力性质

| 品阶 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 门数 | 11 | 25 | 22 | 19 | 22 | 17 | 8 | 9 | 2 | 0 | 0 | 0 |

- `nature` 统计为阳 37、阴 7、调和 66、中性 25，合计 135；中性只用于非内功。14 门内功全部显式登记阳／阴／调和，其中阳 7、调和 7、阴 0、中性 0。
- 地阶 19 门均为完整条目卡；玄阶逐招核算 21 门，`21÷58=36.21%≥30%`；黄阶 58 门均是一行八列表。
- 上游已点名或已有机制条目 8 门，本文新增武学 ID 127 个；“已点名”不代表其他文件已定义完整条目，唯一完整卡仍在本文。

### 10.4 约束统计

| 项 | 本组结果 | 验收口径 |
|---|---|---|
| 天阶 | 0 | 不新增；基准 §13 无本组天阶 |
| 地阶代价型 | 0／19 = 0% | ≤5% |
| 地阶誓约型 | 0／19 = 0% | ≤5% |
| 地阶强制多人合击 | 0／19 = 0% | ≤3%；两门阵法均 `combo:false` |
| 敌人专用 | 0 | 无 `enemyOnly:true`，故总数与玩家可学数同为 135 |
| 新 Buff | 0 | 正文只引用 `design/06` 目录或裁定 A5 已收录项 |
| 最正式门派 | 1 | `sect_penglai`，与 `design/17` 一致；其余均 `sect:null` |
| 最高原生轻功 | 本组最高地下7 | 逐书界不超过 `design/05` §14.6 第7条，见 §11.4 |

---

## 11. 境界覆盖与装配可行性

### 11.1 通行池的三类底座

`ALL14` 不是“携带进来”，而是十四书界各自存在本土学习来源。用于压力测试的共同底座如下；章节文档必须把至少三条来源安排为非互斥、前两幕或支线入口可达，才能把目录可学转成实际可学。

| 核心类别 | 三门同类本土候选 | 品阶 | 装配证明 |
|---|---|---|---|
| 内功 | `sk_jundituna`、`sk_wuguanxinfa`、`sk_jianghutuna` | 玄中5／玄下4／玄中5 | 三门均 `ALL14`，可直接填主运1＋辅运2；另有军帐吐纳、壮行功、扎马步、吐纳浅诀等黄阶兜底 |
| 拳脚 | `sk_tongbeijin`、`sk_tantui_tongxing`、`sk_duandashou` | 玄上6／玄上6／玄下4 | 三门均 `ALL14`，可填拳脚3栏；另有太祖长拳、长拳入门、步兵操等黄阶入口 |
| 兵器（同类剑） | `sk_jianghurumenjian`、`sk_qingfengjian`、`sk_jianghubaizhanjian` | 黄上3／玄上6／地中8 | 三门均 `ALL14` 且共用剑类主武器，形成可同时轮换的黄→玄→地硬链，不以剑／刀／枪各一门伪充同类覆盖 |

因此中武 2/2/2 携带时，本土三类底座各给 3 门，可把任何缺栏补满；低武 1/1/1 携带时同样成立。高武虽可携带 3/3/3，仍能使用同一底座处理空栏开局、洗点或无携带挑战。门派身份只影响蓬莱六门，不会封锁上述通行底座。

### 11.2 中武逐书界证明

| 书界 | 本土内功 ≥3 | 本土拳脚 ≥3 | 本土同类兵器 ≥3 | 结论 |
|---|---|---|---|---|
| 笑傲 `ch05_xiaoao` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 2/2/2 携带后可独立补齐；镖局与武馆另供旁路 |
| 侠客 `ch06_xiake` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 不依赖侠客岛门派身份；杂学 `ALL14` 另补生存与探索 |
| 碧血 `ch07_bixue` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 军中、武馆与散人来源可错开互斥线 |
| 书剑 `ch12_shujian` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 镖局可再提供镖局剑法、护围剑，但不用于最低证明 |
| 飞狐 `ch13_feihu` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 通行剑链避免只靠胡苗互斥路线补兵器栏 |
| 雪山 `ch14_xueshan` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 2/2/2 携带与零携带压力测试均有三门本土候选 |

### 11.3 低武逐书界证明

| 书界 | 本土内功 ≥3 | 本土拳脚 ≥3 | 本土同类兵器 ≥3 | 结论 |
|---|---|---|---|---|
| 鹿鼎 `ch08_luding` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 1/1/1 携带后仍可填满3/3/3；不依赖神龙教身份 |
| 连城 `ch09_liancheng` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 镖局护院另给枪链，但最低证明使用不互斥通行剑链 |
| 白马 `ch10_baima` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 三类均不要求先玩其他书界；地方传授一律标原创扩展 |
| 鸳鸯 `ch11_yuanyang` | 军旅吐纳、武馆心法、江湖吐纳 | 通背劲、弹腿（通行）、短打手 | 江湖入门剑→清风剑→江湖百战剑 | 通行三类填满后，镖局和军伍仍提供构筑替代 |

> 上表证明的是 ID 与原生来源池充足，不替章节文档决定具体 NPC、任务次序和互斥。若 `chapters/*` 将三门底座放进彼此排斥路线，仍视为实现失败。

### 11.4 逐书界轻功上限

本文复用或新增的通行轻功以黄、玄为主；唯一地阶为 `sk_yanzisanchaoshui`。逐界核对最高原生品阶如下：

| 书界 | `design/05` §14.6 允许最高 | 本文可学最高 | 其他图鉴最高／说明 | 结论 |
|---|---:|---:|---|---|
| 天龙 | 天中11 | 地下7：燕子三抄水 | 其他图鉴提供天中 | 不抬高 |
| 射雕 | 地上9 | 玄上6：登萍渡水 | 其他图鉴可到地上 | 不抬高 |
| 神雕 | 地上9 | 玄上6：登萍渡水 | 其他图鉴可到地上 | 不抬高 |
| 倚天 | 地上9 | 玄上6：登萍渡水 | 其他图鉴负责上限 | 不抬高 |
| 笑傲 | 地中8 | 玄上6：登萍渡水 | 其他图鉴最高地中 | 不抬高 |
| 侠客 | 地中8 | 玄上6：登萍渡水 | 其他图鉴最高地中 | 不抬高 |
| 碧血 | 天下10 | 玄上6：登萍渡水 | `sk_shenxing` 天下10，见 `design/08` | 不抬高 |
| 鹿鼎 | 天下10 | 玄上6：登萍渡水 | `sk_shenxing` 天下10，见 `design/08` | 不抬高 |
| 连城 | 地下7 | 地下7：燕子三抄水 | 本文命中上限 | 合规 |
| 白马 | 地下7 | 地下7：燕子三抄水 | 本文命中上限 | 合规 |
| 鸳鸯 | 玄上6 | 玄上6：登萍渡水 | 本文命中上限 | 合规 |
| 书剑 | 地中8 | 地下7：燕子三抄水 | 其他图鉴最高地中 | 不抬高 |
| 飞狐 | 地中8 | 玄上6：登萍渡水 | 其他图鉴最高地中 | 不抬高 |
| 雪山 | 地中8 | 玄上6：登萍渡水 | 其他图鉴最高地中 | 不抬高 |

序章不参与十四书界门禁上限；其 `sk_yueyingshenfa` 为玄下4，且离章后不作为本土轻功带入天龙。本文沿用 `design/08` 的 `sk_caoshangfei`、`sk_dengpingdushui`、`sk_yanzisanchaoshui` 品阶与来源，不另起重复 ID。

### 11.5 可习得池品阶比例说明

- 本图鉴自身为天／地／玄／黄 `0/19/58/58`；天阶为 0 是分工边界，不表示任一正式书界没有天阶。
- 裁定 `rulings-v1` §3.6 的逐界全池基于 general 旧 90 门。AR-01 把本文扩至 135 门后，新增 11 地／20 玄／14 黄不能直接叠加旧表并继续声称满足高／中／低武比例；必须由全局整合任务 C3 按全部新图鉴的最终 `sourceChapters` 重新求解。
- 在 C3 重算前，本文只承诺两项局部不变量：天阶没有新增，且中低武每界三类装配底座成立。为避免破坏低武黄阶占比，新增地、玄条目的最终逐界复现应以 C3 的配额矩阵裁剪 `learnSources`，不能删除唯一 ID 或把外来携带误算成本土。

---

## 12. 本文新增术语与 ID

### 12.1 武学 ID

本文定义 135 门武学。以下 8 个 ID 已由上游点名或提供机制／地形接口，本文按归属定稿或摘要，不视为首次命名：

`sk_yuenvjian`、`sk_taizuchangquan`、`sk_caoshangfei`、`sk_dengpingdushui`、`sk_yanzisanchaoshui`、`sk_penglaiquan`、`sk_haifengbu`、`sk_tianwangbuxin`。

其余 **127 个本文新增武学 ID** 按大阶列出：

| 大阶 | 数量 | 新 ID |
|---|---:|---|
| 地 | 17 | `sk_donghaichaoshengzhang` `sk_pojunqiangfa` `sk_baizhanxinfa` `sk_yanmengqishe` `sk_shouchengzhen` `sk_sihaibiaodao` `sk_huweiyingqiang` `sk_kaimenpiguaquan` `sk_tongbeijian` `sk_hunyuanfangzhuang` `sk_jianghubaizhanjian` `sk_qihuangmifa` `sk_baidubianzheng` `sk_qimenbuzhen` `sk_qingxinqupu` `sk_huanyirongshu` `sk_baishouyujue` |
| 玄 | 55 | `sk_zhuzhijianfa` `sk_baiyuanjianyi` `sk_yueyingshenfa` `sk_chaoyinxinfa` `sk_duanzhenqiang` `sk_junzhongdao` `sk_zhenqijian` `sk_bianshe` `sk_jundituna` `sk_xingjunbu` `sk_shouchengfa` `sk_jiebiaodaofa` `sk_lianhuanqiang` `sk_huweijian` `sk_jindunxinfa` `sk_tanluobu` `sk_feihuangshi` `sk_tongbeijin` `sk_tantui_tongxing` `sk_wuhuduandandao` `sk_qimeigun` `sk_wuguanxinfa` `sk_lianhuanjian` `sk_duandashou` `sk_qingfengjian` `sk_panlonggun` `sk_feishahuangshi` `sk_luoyedao` `sk_liuxingchui` `sk_wuyingshou` `sk_jianghutuna` `sk_xingqizhou` `sk_yexinggong` `sk_hutiaodaofa` `sk_huiliuquan` `sk_tuinaliaofa` `sk_jingmaizhenfa` `sk_wangqiwenshen` `sk_baicaobiandu` `sk_shiduyaojing` `sk_yanggujue` `sk_biangufa` `sk_xiaoqimen` `sk_dixingkanzhen` `sk_qixianyin` `sk_diquxinfa` `sk_chuanyunxiao` `sk_ningxinjue` `sk_feibairujian` `sk_danqingguanfa` `sk_yizhanqipu` `sk_zhijibufa` `sk_suogugong` `sk_yingshefa` `sk_ximashu` |
| 黄 | 55 | `sk_yuezu_duanjian` `sk_yuezu_geshou` `sk_shanyetuna` `sk_muyangzhang` `sk_xijiantoubu` `sk_fengshitoushu` `sk_penglairumenquan` `sk_changqiangrumen` `sk_junwuduandao` `sk_junwuchangjian` `sk_gongshou` `sk_bubingcao` `sk_junzhangtuna` `sk_liezhengbu` `sk_biaojurumen` `sk_biaojujianfa` `sk_biaojuqiangfa` `sk_huyuanquan` `sk_zhuangxingong` `sk_ganyebu` `sk_changquanrumen` `sk_tantuirumen` `sk_wuguanjian` `sk_wuguandao` `sk_wuguangun` `sk_zhamabu` `sk_jianghurumenjian` `sk_pingfengjian` `sk_hengdaorumenzhao` `sk_shaobanggun` `sk_duanqiangfa` `sk_sanshou` `sk_yanxingbu` `sk_tunaqianjue` `sk_dantianyangqi` `sk_huxixingqi` `sk_tongxingfeishi` `sk_tiexiu` `sk_jianghuchangquan` `sk_caoyaozhi` `sk_baoshangfa` `sk_biandufa` `sk_yantufa` `sk_shiguchong` `sk_kanzhenfa` `sk_buzhenrumen` `sk_diqurumen` `sk_linmotieshi` `sk_qishirumen` `sk_gaizhuangfa` `sk_xunquanshu` `sk_chuanyinfa` `sk_shouxinjue` `sk_jiuxuefa` `sk_qingxinshou` |

校验算式：`17+55+55=127`；再加 8 个上游已点名 ID，得到 `127+8=135`。本文没有天阶 ID。

### 12.2 招式、被动、套装与经脉接口

| 类型 | 数量／ID | 说明 |
|---|---|---|
| 明写完整 ID 的招式 `mv_*` | 78 | 来自 19 张地阶完整卡；玄阶紧凑卡以 `mv_<武学拼音>_<文内后缀>` 展开，短后缀不是独立 ID |
| 明写完整 ID 的被动 `ps_*` | 56 | 来自地阶完整卡；玄阶紧凑卡以 `ps_<武学拼音>_<文内后缀>` 展开 |
| 套装候选 `set_*` | 本文 15；跨组引用 1 | 本文：`legacy-set:yuenv_jianyuan` `set_penglai_chaosheng` `set_junwu_baizhan` `legacy-set:junwu_yanmeng` `legacy-set:biaoju_sihai` `legacy-set:wuguan_jiben` `set_jianghu_baijia` `legacy-set:xinglin_qihuang` `legacy-set:dujia_baicao` `legacy-set:guchong_mifa` `legacy-set:qimen_jianghu` `legacy-set:yayue_qingxin` `legacy-set:hanmo_yiqi` `legacy-set:huanyirong` `legacy-set:baishou_xunyuan`；跨组只引用 `set_qidan_xiaofeng` |
| 经脉引用 `mer_*` | 8 | `mer_renmai` `mer_dumai` `mer_chongmai` `mer_daimai` `mer_yinqiao` `mer_yangqiao` `mer_yinwei` `mer_yangwei`；均已命中 `design/15` 正式 ID |
| 正式门派 `sect_*` | 0 新增 | 只复用 `sect_penglai`；名称、时代与五级模板均服从 `design/17` |
| 新 Buff | 0 | 共引用 44 个 `bf_*`，均须由 §13 的白名单测试验证 |

### 12.3 本文排版别名与短写约定

| 记法 | 含义 | 数据化要求 |
|---|---|---|
| `ALL14` | 十四正式书界的 `chapterId[]` | 必须展开为 §0.1 的 14 个 ID，不可作为枚举值落库 |
| `_招式后缀` | 玄阶紧凑卡内的招式短写 | 展开为 `mv_<所属武学拼音>_<后缀>` |
| `_被动后缀` | 玄阶紧凑卡内的被动短写 | 展开为 `ps_<所属武学拼音>_<后缀>` |
| 裸写 `bf_*` | Buff 引用的排版短写 | 展开为 `{id:bf_*,grade:inherit}`；不得省略继承品阶 |
| “来源地名／职业” | `learnSources` 的策划语义 | 章节实现必须补正式任务／NPC ID、`chapter` 与 `maxLayer` |

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_baizhanxinfa` | `set_junwu_baizhan` |
| `sk_changqiangrumen` | `set_junwu_baizhan` |
| `sk_chaoyinxinfa` | `set_penglai_chaosheng` |
| `sk_dantianyangqi` | `set_jianghu_baijia` |
| `sk_donghaichaoshengzhang` | `set_penglai_chaosheng` |
| `sk_duanqiangfa` | `set_jianghu_baijia` |
| `sk_duanzhenqiang` | `set_junwu_baizhan` |
| `sk_feishahuangshi` | `set_jianghu_baijia` |
| `sk_haifengbu` | `set_penglai_chaosheng` |
| `sk_hengdaorumenzhao` | `set_jianghu_baijia` |
| `sk_huiliuquan` | `set_jianghu_baijia` |
| `sk_hutiaodaofa` | `set_jianghu_baijia` |
| `sk_huxixingqi` | `set_jianghu_baijia` |
| `sk_jianghubaizhanjian` | `set_jianghu_baijia` |
| `sk_jianghuchangquan` | `set_jianghu_baijia` |
| `sk_jianghurumenjian` | `set_jianghu_baijia` |
| `sk_jianghutuna` | `set_jianghu_baijia` |
| `sk_jundituna` | `set_junwu_baizhan` |
| `sk_junwuchangjian` | `set_junwu_baizhan` |
| `sk_junwuduandao` | `set_junwu_baizhan` |
| `sk_junzhongdao` | `set_junwu_baizhan` |
| `sk_liuxingchui` | `set_jianghu_baijia` |
| `sk_luoyedao` | `set_jianghu_baijia` |
| `sk_panlonggun` | `set_jianghu_baijia` |
| `sk_penglaiquan` | `set_penglai_chaosheng` |
| `sk_penglairumenquan` | `set_penglai_chaosheng` |
| `sk_pingfengjian` | `set_jianghu_baijia` |
| `sk_pojunqiangfa` | `set_junwu_baizhan` |
| `sk_qingfengjian` | `set_jianghu_baijia` |
| `sk_sanshou` | `set_jianghu_baijia` |
| `sk_shaobanggun` | `set_jianghu_baijia` |
| `sk_shouchengfa` | `set_junwu_baizhan` |
| `sk_shouchengzhen` | `set_junwu_baizhan` |
| `sk_tianwangbuxin` | `set_penglai_chaosheng` |
| `sk_tiexiu` | `set_jianghu_baijia` |
| `sk_tongxingfeishi` | `set_jianghu_baijia` |
| `sk_tunaqianjue` | `set_jianghu_baijia` |
| `sk_wuyingshou` | `set_jianghu_baijia` |
| `sk_xingjunbu` | `set_junwu_baizhan` |
| `sk_xingqizhou` | `set_jianghu_baijia` |
| `sk_yanxingbu` | `set_jianghu_baijia` |
| `sk_yexinggong` | `set_jianghu_baijia` |
| `sk_zhenqijian` | `set_junwu_baizhan` |

## 13. 数据校验规则与测试用例

### 13.1 构建期校验

| # | 规则 | 级别 |
|---|---|---|
| GEN-V01 | 本文件武学 ID 恰好 135 个且全局唯一；天／地／玄／黄恰为 `0/19/58/58` | 失败 |
| GEN-V02 | `grade≥10` 集合必须为空；`sk_yuenvjian` 固定 `grade:9`、`sourceChapters:[ch00_yuenv]` | 失败 |
| GEN-V03 | 地阶 19 门都有完整卡、至少一个绝招及逐招核算；公式结果与显示倍率差 ≤0.05 | 失败 |
| GEN-V04 | 玄阶紧凑卡恰为 58 门；标“核算抽样”的唯一武学至少 18 门，本稿应为 21 门即 36.21% | 失败 |
| GEN-V05 | 黄阶一行卡恰为 58 门；每行固定八列，且没有黄阶绝招 | 失败 |
| GEN-V06 | 14 门内功全部 `nature∈{yin,yang,harmony}`，不得为 `neutral`；`layerStats` 为空；IP 与 `design/05` §5.5 目标偏差 ≤5% | 失败 |
| GEN-V07 | `reqs.skills` 键只属于 `{med,poi,antidote,forge,alchemy,formation,music,art,chess,speech}`；二选一前置只能用 `anyOf`，不得出现 `altPrereq` | 失败 |
| GEN-V08 | 所有 `bf_*` 都存在于 `design/06` 目录或裁定 A5 已收录清单；运行时实例品阶为 `inherit` | 失败 |
| GEN-V09 | §9 `SetDef.members` 与 §2～§8 的 `setTags` 双向闭合；集合内按武学 ID 去重 | 失败 |
| GEN-V10 | 中武、低武每一书界均能本土取得至少3内功、3拳脚、3门同类兵器；三路来源不得全部互斥 | 失败 |
| GEN-V11 | `sk_caoshangfei`／`sk_dengpingdushui`／`sk_yanzisanchaoshui` 与 `design/08` 的 ID、品阶、来源及门禁特技一致 | 失败 |
| GEN-V12 | `enemyOnly:true` 为 0；地阶代价型、誓约型均 ≤5%，强制多人合击 ≤3% | 失败 |
| GEN-V13 | 原创条目含**（原创扩展）**或**（原创扩展命名）**；原著信息不确定处含**（待考）**且不写伪回目、伪引文 | 失败 |
| GEN-V14 | 8 个 `mer_*` 仍是建议接口；`design/15` 定稿后必须通过迁移映射，不能静默生成第二套经脉枚举 | 警告 |
| GEN-V15 | `sourceChapters:ALL14` 在导出时展开；具体 `learnSources` 的 `chapter∈sourceChapters` 且至少一项 `maxLayer≥1` | 失败 |
| GEN-V16 | 按最终全目录重新计算各书界可习得池；逐界命中 `design/05` §14.4 高／中／低武比例，不沿用旧 90 门 general 汇总 | 失败 |

### 13.2 金标准测试用例

| # | 输入 | 期望 |
|---|---|---|
| GEN-T01 | 扫描 §2～§8 的正式定义行 | 135 个唯一 `sk_*`；大阶 `0/19/58/58`；十二品 `11/25/22/19/22/17/8/9/2/0/0/0` |
| GEN-T02 | 正常序章／跳过序章／轮回《越女剑·全本》结束 | `sk_yuenvjian` 来源上限依次为3／1／6重；均转 `it_canye_yuenvjian`，后续书界不可直接装配，残篇保留实际所达层数 |
| GEN-T03 | `sk_yuenvjian`“剑意无痕” | 预算 `3×0.85−0.10×0.50=2.50`，显示 2.50 |
| GEN-T04 | `sk_pojunqiangfa`“陷阵” | 预算 `1×(1+.36+.10+.07)−.10−.10×.40=1.39`，显示 1.40，误差 .01 |
| GEN-T05 | `sk_yanmengqishe`“雁落长空” | 预算 `3×.65×.92−.10=1.694`，显示 1.70，误差 .006 |
| GEN-T06 | `sk_qimenbuzhen`“伏门” | 六角 `aoe_spokes {r:1}` 取 N=7、AF=.70；预算 `.70×1.46×.85−.10=.7687`，显示 .75，误差 .0187 |
| GEN-T07 | `sk_baishouyujue`“蛇扰” | 预算 `1×1.29×.92−.10×.30=1.1568`，显示 1.15，误差 .0068 |
| GEN-T08 | 百战心法／混元方桩／三门玄中内功满层 | IP 分别 `83`／`72`／`48.5`，精确命中 8／7／5 品预算 |
| GEN-T09 | 任取黄上内功 `sk_tunaqianjue` | `10+6+2×4+5×1.2=30`，且 `nature:harmony` |
| GEN-T10 | 低武角色只携带内／拳／兵各1门，进入白马且不加入门派 | 本土池至少仍含 §11.1 各3门；同类剑链可共用一柄剑填3个兵器栏 |
| GEN-T11 | 鸳鸯查询本土最高轻功 | `sk_dengpingdushui` 玄上6；不得把燕子三抄水列为鸳鸯原生 |
| GEN-T12 | 连城或白马查询本土最高轻功 | `sk_yanzisanchaoshui` 地下7，恰好命中上限 |
| GEN-T13 | 玩家单独装配 `sk_qimenbuzhen` 或 `sk_shouchengzhen` | 所有招式可施展；没有“必须另一名角色在场”的合击门槛 |
| GEN-T14 | 对 §9 的任一 `(setId,skillId)` 关系做双向查询 | `skillId∈SetDef.members` 与 `setId∈SkillDef.setTags` 同时为真 |
| GEN-T15 | 扫描正文全部 `bf_*` | 与 06／A5 的允许集合差集为空；不因描述出现通配 ID 而放行 |
| GEN-T16 | 导入本文内功的经脉引用 | 8 个 `mer_*` 必须命中 `design/15` 正式枚举；效果仍只由 15 定义 |

### 13.3 人工审阅清单

1. 抽查每张地阶完整卡的 `origin`、`sect`、`lineage`、`sourceChapters`、`nature`、`wOut/wIn`、`reqs`、`layerStats`、`setTags`、获取与 `special`。
2. 逐项核对所有招式的范围系数、冷却、耗内、收招、投送、不可招架、状态、位移与条件加成，没有把支援招强塞攻击倍率。
3. 搜索全部内功名称，确认 14 门都有 `nature` 与 IP 算式、均不使用 `layerStats`；`stats` 不计入 IP。
4. 搜索 `set_*`，确认 §9 成员没有漏掉反向标签，也没有条目标签指向未登记候选。
5. 搜索常见占位语、弃用前置字段、非法技艺键与敌专标记；正式条目定义不得命中，校验规则中的反例说明不计。
6. 核对 `design/15` 正式经脉枚举、`design/07` 套装唯一成员表及 `chapters/*` 学习来源后，再生成运行数据。

---

## 14. 待决事项 / 依赖

### 14.1 替下游给出的建议值

| # | 下游归属 | 建议值 | 本文处理 |
|---|---|---|---|
| D-1 | `design/07-*` | §9 的 15 个原候选已由 07 §19 逐项裁定；运行时只使用 07 §8.4 正式注册表与本文“正式套装反向标签镜像” | **已解决**：本文不定义奖励值，正式成员与 `setTags` 已双向闭合 |
| D-2 | `design/15-*` | 正式经脉枚举使用 `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_yinqiao`、`mer_yangqiao`、`mer_yinwei`、`mer_yangwei` | **已解决**：本文只在内功上标专精建议，不定义穴位、周天与收益 |
| D-3 | `chapters/01`～`14` | 每界至少把军旅吐纳／武馆心法／江湖吐纳、通背劲／通行弹腿／短打手、江湖三阶剑链安排为三路非互斥本土来源 | §11 用这组最低集合证明装配可行；具体 NPC、任务 ID 与幕次归章节 |
| D-4 | `chapters/00`／`design/02`／`design/13` | 正常序章越女剑来源上限3重，跳过为1重残篇，轮回《越女剑·全本》最多6重；离章时均转 `it_canye_yuenvjian`，后续只能由既定印证／复原流程处理 | 沿用 `design/01` §8.4～§8.5、`design/02` §1.2 与 `design/13` §6.4.3，不让套装或图鉴收藏绕过 |
| D-5 | `design/18` | 百兽御诀的友方兽、宠物／召唤上限、死亡与跨书界保留 | 本文默认只强化已合法存在的友方兽，不凭空召唤，不控制首领 |
| D-6 | `design/16` | 蓬莱 L1～L5 及军伍 T08 的月钱、禄米、器械、训练资源 | 按 AR-07 留空；本文只列可学武学 |
| D-7 | `design/10` | 琴、箫、笔、弓箭与普通石弹的装备／耗材标签；套装若收装备，再补反向 `setTags` | 本文不创建装备 ID，武学预算按已有装备检查接口描述 |
| D-8 | `chapters/00`、`chapters/01` | 为阿青观剑主线节点与海风子救援支线分配正式 `q_00_*`／`q_01_*` | 本文只保留来源语义与 `maxLayer`／`reqsOverride`，不抢先虚构任务 ID |

### 14.2 本文依赖的上游事实

| # | 上游事实 | 依赖方式 |
|---|---|---|
| U-1 | 作者 AR-01 与 P33 | 旧目标90扩为135，固定 `0/19/58/58`；不新增天阶 |
| U-2 | 作者 P35、基准 §13；`design/01` §8.4～§8.5、`design/02` §1.2、`design/13` §6.4.3 | `sk_yuenvjian` 固定地上9；正常／跳过／全本来源上限为3／1／6重，离章强制化残篇；与 `sk_yuenvjian02` 分立 |
| U-3 | `design/05` §2、§4.2、§5.5、§14.4、§14.6 | 字段枚举、倍率、IP、逐界比例与 catalog 验收口径 |
| U-4 | 裁定 C16、C17、C22 | 弓箭计暗器；新 `reqs.skills`／`anyOf`；套装成员双向闭合 |
| U-5 | `design/06` 目录与裁定 A5／C23 | 本文 44 个 `bf_*` 只作引用；状态语义、叠加、免疫及品阶对抗归 06 |
| U-6 | `design/08` §4.6 | 草上飞、登萍渡水、燕子三抄水的 ID、品阶、来源和轻功门禁特技 |
| U-7 | `design/17` §1.4、§3.1、§6.7 | 蓬莱 `sect_penglai`、天龙开放、T03/T02 五级称谓；其余通行来源不建门派 |

### 14.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| P-1 | 将 `design/05` §14 的 519 门旧规模、`rulings-v1` 的 general `0/8/38/44=90` 与旧 661 总规模同步为 AR-01 的约 1,100～1,150 门，并登记本文 `0/19/58/58=135` | 作者新增需求已覆盖旧规模；继续用旧分工会令总量与 lint 同时误报 |
| P-2 | 由 C3／`design/05` 按全部图鉴最终 `sourceChapters` 重算十四书界可习得池，不把本文新增 `11/20/14` 机械叠加到旧 general 池 | 旧逐界表是为90门分配；直接叠加会破坏多个高／中／低武目标，且 `ALL14` 只是当前候选投放语义 |
| P-3 | 在 `design/05` §14.6 明确“每界三类≥3”按可同时获得的非互斥本土来源校验，并要求兵器是同一子类 | 只按目录总数或剑／刀／枪各一门会产生无法填满同类兵器栏的假阳性 |
| P-4 | `design/05` 的 `SkillDef`／导出规范接受 catalog 排版别名 `ALL14`，但要求构建前展开，或统一禁止别名并提供生成器 | 本文大量通行来源逐项写14个 ID 会显著降低可读性；运行数据仍应保持严格枚举 |

### 14.4 原著考据待办

| # | 需核对的书目、人物或情节 | 本文当前保守处理 |
|---|---|---|
| K-1 | 《越女剑》中阿青与白猿交锋、越军习剑、宫廷演武及西施相关情节的准确措辞与先后 | 不写回目号或引文；越女剑以基准地上9处理，其余招名标原创扩展命名 |
| K-2 | 《天龙八部》中青城派与蓬莱派冲突、都灵子／海风子名号、天王补心针名目及归属 | `design/17` 已有的门派关系照录为待考；海潮掌、心法与入门拳明确原创 |
| K-3 | 《天龙八部》聚贤庄萧峰施展太祖长拳的具体招式次序与原文 | 只引用 `design/05` §13.5 的玩法定义，不补写不确定招名 |
| K-4 | 《笑傲江湖》中琴曲用于疗伤、宁神或化解心绪的具体曲名、人物与场景 | “清心曲谱”明确为无门派汇编名，不与任盈盈等人物的具名曲目合并 |
| K-5 | 《天龙八部》中阿朱易容改扮的对象、顺序与具体手法 | 只确认阿朱精于易容这一情节级事实；“幻易容术”及战斗招式均标原创扩展 |

### 14.5 开放问题（附默认值）

| # | 问题 | 本文默认值 |
|---|---|---|
| O-1 | `ALL14` 的地、玄通行条目在全局比例重算后是否仍全部十四界原生 | 先保留候选本土语义；C3 可裁剪非装配底座条目的 `learnSources`，但不得删除 ID；§11.1 九门底座优先保留全界 |
| O-2 | 15 个套装候选是否全部进入首发 | 全部交 `design/07` 筛选；候选不等于已批准，本文不预写奖励 |
| O-3 | `set_jianghu_baijia` 的29门大集合如何计件 | 采用封顶档位并按唯一武学 ID 计件，默认不因成员数继续线性增益 |
| O-4 | 蛊学与翰墨分支是否必须补地阶 | 不补；无门派杂学总组已满足黄→玄→地，门派高阶蛊／琴棋书画留在归属图鉴 |
| O-5 | 通行武馆的“五虎断门刀（民间式）”是否与其他图鉴同名条目合并 | 不合并；本文使用 `sk_wuhuduandandao`，只作武馆整理套路，具名门派版本保留其 ID 与归属 |
| O-6 | 蓬莱“天王补心针”最终是否保留原著名目 | 暂保留 `sk_tianwangbuxin` 并标待考；若考据不成立，改显示名与 `canonExpanded→expanded`，不改变玄上配额 |
| O-7 | 玄阶紧凑卡在数据化时是否需要全部展开逐招公式 | 需要；本文只按 AR-01 展示 21／58 抽样，导出器仍对58门全部倍率执行 lint |

---

本文不定义套装奖励、经脉收益、物品价格、门派月钱、宠物上限或各书界任务流程；这些内容均留在其唯一归属文档。
