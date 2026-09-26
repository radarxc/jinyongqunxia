# 门派武学图鉴 · 倚天诸派（`skills-yitian`）

> **归属**（基准 §18）：`design/catalog/skills-*.md` 门派武学图鉴之一。本文覆盖倚天书界的明教（含波斯总教、五行旗、四大护教法王、五散人）、天鹰教、峨眉、昆仑、崆峒、倚天华山、玄冥二老与汝阳王府，以及海沙派、巨鲸帮、神拳门。
> **上游**：`docs/decisions/author-requirements.md` AR-01–AR-03、AR-07–AR-08；`docs/00-canon.md` §4、§6–§7、§12–§13、§16、§20；`docs/decisions/rulings-v1.md` §2–§5。
> **引用而不重定义**：字段、层数、招式与内功预算见 `design/05`；Buff 定义见 `design/06`；属性见 `design/03`；书界、压制与残承见 `design/02`；阵法战斗流程见 `design/09`；套装规则与最终数值交 `design/07`。少林、武当主体、丐帮、九阴与吐蕃密宗武学只引用其既有 ID。
> **标注约定**：**（原创扩展）**为原著没有的武学或设定；**（原创扩展命名）**为原著有其人、兵器或战法而无正式武学名；**（待考）**为须以三联／广州修订版逐字核对的原著事实。文中【建议值】均在 §12 登记。

---

## 0. 阅读指引与记法

### 0.1 数量、唯一归属与详略

- 作者 AR-01 覆盖旧分工表的 50 门建议量。本组固定 4 门天阶，因此目标为 `天:地:玄:黄 = 4:12:36:36 = 1:3:9:9`，合计 **88 门**；四档都精确命中比例。
- 天阶封闭为 `sk_jiuyang`、`sk_qiankun`、`sk_xuanming`、`sk_shenghuoling`，ID、品阶、类别与原生书界逐项服从基准 §13，不新增天阶。
- 天、地阶使用完整条目卡；玄阶使用紧凑卡，并对 11/36 门给出招式抽样核算；黄阶依 AR-01 使用一行表格条目，另以预算模板整体核对。
- `sk_jiuyang` 的玩法权威定义已在 `design/05` §13.4，本文以完整摘要卡登记归属、来源、套装及 AR-03 经脉接口，不复制 YAML。`sk_qishangquan` 的代价规则以 `design/05` §9.1.1 为准，本文补齐图鉴卡。
- `sk_wudangjiuyang` 是裁定指定给本图鉴的唯一例外；其余武当武学只写 ID 并引用 `catalog/skills-daojia`。少林九阳 `sk_shaolinjiuyang` 只引用 `catalog/skills-shaolin`。
- 所有 `sourceChapters` 均为 `[ch04_yitian]`；所有品阶均为绝对品阶，Buff 的 `grade` 均取 `inherit`。

### 0.2 字段、招式表与核算式

完整卡字段服从 `design/05` §2：`category/subType/grade/origin/sect/lineage/sourceChapters/canonRef/nature/wOut/wIn/reqs/layerStats/inner/layers/moves/passives/setTags/conflicts/learnSources/special/description`。兵器卡另列 `weaponReq`；天阶默认 `observable: false`。

招式表列：`招式（ID）｜重｜范围·射程·投送｜倍率｜耗内/cd/收招｜附带｜架｜核算`。

```text
power = AF × (1 + Σadj) × Kd × Kp − Σcost_buff − Σcost_disp
```

| 记号 | 本文用法（完整定义见 `design/05` §4.2） |
|---|---|
| `AF` | 单体 1.00；线 2 格 0.85；横扫/锥 0.75；周身 0.65；乱击 0.85；绕背 0.90；换位 0.85 |
| `cd+` | 每 1 回合 `+0.12` |
| `内±` | 相对大阶基准（黄 5%／玄 6%／地 7%／天 8%）每差 1pp 为 `±0.05` |
| `收±` | 相对 1000 每差 100 为 `±0.07` |
| `Kd/Kp` | 远程气劲 0.85、投射 0.92；不可招架 0.85 |
| 减益成本 | 控制 `0.25×率×回合`；封穴/封经/缴械 `0.20×率×回合`；数值减益、DOT `0.10×率` |
| 位移成本 | 击退 `0.05/格`；突进 0.10；绕背/换位 0.15 |
| 绝招 | `3.00 × AF × Kd × Kp − 成本`；气势 100、耗内为大阶基准 +2pp、收招 1200 |

表中结果均按 0.05 取整，误差不超过 ±0.05。支援招 `power: 0` 按 18% 单体治疗、等价护盾或状态价值核对，不伪造伤害倍率。

### 0.3 内功贡献与经脉预留

内功按 `design/05` §5.5 核算：

```text
IP = mpMaxPct + hpMaxPct + 2 × 属性点 + 5 × mpRegen
```

本文每门内功都显式标 `nature: yin/yang/harmony`。`meridians` 依 AR-03 预留；因 `design/15-meridians-and-acupoints.md` 尚不存在，本文只使用传统奇经八脉的待对齐 ID：`mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_yinqiao`、`mer_yangqiao`、`mer_yinwei`、`mer_yangwei`，不在本文定义穴位或通脉收益。

| 品阶 | 本文采用的 IP 目标 | 常用精确配法 |
|---|---:|---|
| 黄上 3 | 30 | `10+6+2×4+5×1.2=30` |
| 玄下 4 | 41.5 | `14+8+2×6+5×1.5=41.5` |
| 玄中 5 | 48.5 | `17+10+2×7+5×1.5=48.5` |
| 玄上 6 | 57 | `20+12+2×8+5×1.8=57` |
| 地中 8 | 83 | `30+18+2×12+5×2.2=83` |
| 天中 11 | 135.5 | `50+29+2×20+5×3.3=135.5` |
| 天上 12 | 156 | 九阳沿用 05 的 154，偏差 `2/156=1.28%`，在 ±5% 内 |

### 0.4 门派职级与授艺口径

`design/17-sects-compendium.md` 尚未生成，故以下称谓均为【建议值】；五级抽象层严格依 AR-07。月钱、禄米、药材与兵器配给不在本文定义，统一留给 `design/16`。

| 抽象级 | 教派／帮会称谓建议 | 门派称谓建议 | 本文授艺边界 |
|---:|---|---|---|
| L1 | 外门教众／外堂帮众 | 外门弟子 | 黄阶入门拳或剑、基础吐纳与步法 |
| L2 | 入门教众／正式帮众 | 入门弟子 | 其余黄阶及玄下 |
| L3 | 亲传／旗弟子／香主 | 亲传或闭门弟子 | 玄中、玄上；少量地阶需任务 |
| L4 | 护法／旗使／长老 | 长老／首座 | 门派地阶与受限残篇 |
| L5 | 教主／帮主 | 掌门 | 镇派天阶；剧情身份不能被普通贡献替代 |

每个组织的小节均只列各级**新增可学**武学；低级已学内容随晋升保留。人物私传、奇遇与秘籍可用 `reqsOverride` 解除门派身份，但不会自动解除武学前置。

### 0.5 比例上限的解释

地阶只有 12 门，而基准强制锚点 `sk_qishangquan` 又必须是代价型；若把“代价型 ≤5%”误作单文件比例，则最低非零比例为 `1/12=8.33%`，数学上不可能同时满足。本文按 `design/05` §14.6 的**全图鉴地阶池**口径执行：本组只含 1 门代价型、0 门誓约型、0 门 `special.combo` 合击型，交 C3 在全局约 153 门地阶中校验，分别约 `0.65%/0%/0%`。正反两仪与五行旗阵是可单人装配的剑法／刀法／统阵术，联阵是 `design/09` 的额外协同，不标 `special.combo`。

---

## 1. 本组门派、传承与数量一览

### 1.1 归属与配额

| 组织／传承 | ID／归属写法 | 时代开放建议 | 天 | 地 | 玄 | 黄 | 合计 | 主要风格 |
|---|---|---|---:|---:|---:|---:|---:|---|
| 九阳真经全本 | `sect: null`，`lineage: 觉远→张无忌` | 倚天；神雕只见闻 | 1 | 0 | 0 | 0 | 1 | 至阳护体、疗伤、触类旁通 |
| 明教与波斯总教、五行旗 | `sect_mingjiao`，分支字段区分 | 倚天 | 2 | 2 | 7 | 7 | 18 | 挪移、圣火诡变、旗阵军战 |
| 天鹰教 | `sect_tianyingjiao` | 倚天前中期；后并回明教 | 0 | 1 | 3 | 3 | 7 | 鹰爪擒拿、海上身法 |
| 峨眉派 | `sect_emei` | 倚天 | 0 | 1 | 5 | 5 | 11 | 九阳余脉、掌剑并重 |
| 武当九阳支 | `sect_wudang`；主体归 `skills-daojia` | 倚天 | 0 | 1 | 0 | 0 | 1 | 九阳余脉、纯阳护体 |
| 昆仑派 | `sect_kunlun` | 倚天 | 0 | 1 | 4 | 4 | 9 | 快剑、斜剑、正两仪 |
| 崆峒派 | `sect_kongtong` | 倚天 | 0 | 1 | 3 | 3 | 7 | 七劲同发、先养后伤 |
| 华山派（倚天支） | `sect_huashan`，`branch: yitian` | 倚天 | 0 | 1 | 4 | 4 | 9 | 鹰蛇双手、反两仪刀 |
| 玄冥二老／汝阳王府 | `sect_ruyangwangfu`；玄冥用 lineage | 倚天 | 1 | 1 | 3 | 3 | 8 | 阴寒掌力、宿卫快剑、骑射 |
| 海沙派 | `sect_haisha` | 倚天 | 0 | 1 | 2 | 3 | 6 | 毒盐、短打、潮汐步 |
| 巨鲸帮 | `sect_jujing` | 倚天 | 0 | 1 | 2 | 3 | 6 | 水战、分水刺、翻舟 |
| 神拳门 | `sect_shenquan` | 倚天 | 0 | 1 | 3 | 1 | 5 | 重拳、短时蓄力、摧军 |
| **合计** | 唯一武学 ID 去重 | `ch04_yitian` | **4** | **12** | **36** | **36** | **88** | `4:12:36:36 = 1:3:9:9` |

### 1.2 跨组只引用清单

以下武学会出现在倚天 NPC、剧情或可习得池中，但不计入本文 88 门，也不复制定义：

| 来源组 | 本文只引用的 ID | 用途 |
|---|---|---|
| 少林 | `sk_yijinjing`、`sk_jingangbuhuai`、`sk_shizihou`、`sk_shaolinjiuyang`、`sk_dalijingangzhi`、`sk_jingangfumoquan` | 空见、三渡、金刚门与少林九阳支 |
| 武当 | `sk_taijiquan`、`sk_taijijian`、`sk_chunyangwuji`、`sk_zhenwuqijie`、`sk_yitiantulonggong` | 张三丰、武当七侠与真武套装 |
| 五绝／九阴／丐帮 | `sk_jiuyin`、`sk_jiuyinbaigu`、`sk_dagou`、`sk_xianglong18`、`sk_tanzhi` | 周芷若、史火龙残承、杨逍点穴表现 |
| 吐蕃密宗／少林旁支 | `sk_longxiang`、`sk_dalijingangzhi` | 汝阳王府番僧；定义仍归既有图鉴 |

### 1.3 本组进阶链总览

| 组织 | 至少一条 `黄 → 玄 → 地` 硬前置链 | 对应套装候选 |
|---|---|---|
| 明教 | `sk_guangmingquan` 4重 → `sk_dafengyunfeizhang` 5重 → `sk_dajiutianshou` | `set_mingjiao_guangming` |
| 天鹰教 | `sk_tianyingrumenquan` 4重 → `sk_yingzhaoshou` 5重 → `sk_yingzhaoqinna` | `set_tianying_baimei` |
| 峨眉 | `sk_emeitunajue` 5重 → `sk_emeixinfa` 6重 → `sk_emeijiuyang` | `set_yitian_emei` |
| 昆仑 | `sk_kunlunrumenjian` 4重 → `sk_yudafeihuajian` 5重 → `sk_zhengliangyi` | `set_kunlun_liangyi` |
| 崆峒 | `sk_kongtongrumenquan` 4重 → `sk_qishangchujue` 6重 → `sk_qishangquan` | `set_kongtong_qishang` |
| 华山（倚天） | `sk_huashanrumendao04` 4重 → `sk_liangyidaojia` 5重 → `sk_fanliangyi` | `set_huashan_liangyi` |
| 汝阳王府 | `sk_suweijianfa` 4重 → `sk_jifengbajian` 6重 → `sk_babishenjian` | `set_ruyang_suwei` |
| 海沙派 | `sk_haishaduanquan` 4重 → `sk_yanxiaoshou` 5重 → `sk_duyanfeisha` | `set_haisha_duyan` |
| 巨鲸帮 | `sk_fenshuiduanci` 4重 → `sk_langlifenshuici` 5重 → `sk_fenshuiemeici` | `set_jujing_fenshui` |
| 神拳门 | `sk_shenquanrumen` 4重 → `sk_sandieshenquan` 6重 → `sk_cuijunshenquan` | `set_shenquan_cuijun` |


---

## 2. 天阶条目卡（4 门；封闭名录）

### 2.1 `sk_jiuyang` 九阳神功（12 天上 · 内功 · 阳）

> **原著**：《九阳真经》先由觉远诵出部分，张无忌后来在昆仑山谷白猿腹中取得全本；具体回目待逐字核对**（待考）**。完整数值定义见 `design/05` §13.4；本卡只作图鉴归属摘要，不建立第二份定义。

| 项 | 内容 |
|---|---|
| 基础字段 | `category: inner`；`subType: inner`；`grade: 12`；`origin: canon`；`sect: null`；`lineage: 觉远→张三丰/郭襄/无色各得部分，张无忌得全本`；`sourceChapters: [ch04_yitian]` |
| 性质 · 内外 | `nature: yang`；`wOut/wIn: 0/1` |
| reqs | `attrs {con:50}`；`aptitude {apInner:55}`；`hard: []`（属性与资质均为软门槛） |
| 内功贡献 | `mpMaxPct 60 + hpMaxPct 36 + attrs 20×2 + mpRegen 3.6×5 = IP 154`；天上预算 156，偏差 −1.28%；`attrs {con:8,str:6,wil:6}`、`stats {resCold:20}` 均沿用 05，后者达天阶上限 20 |
| meridians | `[mer_renmai, mer_dumai]`【建议值】：督脉偏阳、任督并行；只作 AR-03 专精接口 |
| 层数要点 | 2 重“他强由他强”；3 重护体；5 重疗伤／九阳真气；6 重寒毒不侵；7 重生生不息／普照绝招；8 重触类旁通；10 重九阳大成 |
| 获取 | 神雕只闻经 `q_03_qiyu_91`、`maxLayer:0`；倚天昆仑山谷奇遇 `q_04_qiyu_91` 得全本 `maxLayer:10`（均沿用 05） |
| setTags · conflicts | `[]`（沿用 05 权威 YAML；`set_mingjiao_guangming` 仅列为 §7 待 05／07 同步的候选关系）；克制 `sk_xuanming`，并按 05 §9.1.1 消除 `sk_qishangquan` 自伤；三派九阳同源关系使用 `lg_jiuyang`，不另造套装 |
| special | `fusible:true`；`observable:false` |
| 图鉴文本 | 至刚至阳而能自生不息的真经内功；全本非少林、武当、峨眉三支残篇的简单相加。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 九阳护体 `mv_jiuyang_huti` | 3 | 自身·支援 | 0 | 12%/3/900 | `bf_hutizhenqi`，15% hpMax，3 回合；驱散 1 个 `cold` | — | 支援：护盾按治疗量 ×1.2 等价 |
| 九阳疗伤 `mv_jiuyang_liaoshang` | 5 | 友方单体 0–1·支援 | 0 | 14%/3/1000 | 治疗 18% hpMax；驱散 2 个 `injury/cold` | — | 标准单体治疗 18% |
| 九阳普照 `mv_jiuyang_puzhao` | 7 | 友方菱形 r3＋周身敌人·自身 | 1.50 | 10%/绝/1200 | 友方护盾 20% 施术者 hpMax、驱散 2 个 `cold/poison` | — | 敌伤 `3×0.65=1.95`，群盾与群驱散折价 0.45 → **1.50** |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 他强由他强 | `ps_jiuyang_taqiang` | 2 | stat·Z4 | 攻方攻击合计高于自身时减伤 8%→20% |
| 他横由他横 | `ps_jiuyang_taheng` | 4 | effect·settle | 近战反震 5%→12%，按内劲结算 |
| 九阳真气 | `ps_jiuyang_hutizhenqi` | 5 | trigger | 战斗开始获 8%→20% hpMax 护体真气 |
| 寒毒不侵 | `ps_jiuyang_hanbuqin` | 6 | mechanic | 免疫不高于自身有效品阶的 `cold` |
| 生生不息 | `ps_jiuyang_shengsheng` | 7 | effect | 内力低于 20% 时，回内倍率 ×2 |
| 触类旁通 | `ps_jiuyang_chulei` | 8 | mechanic | 内功／拳脚／兵器修炼 +25%；乾坤大挪移修炼消耗 ×0.2 |
| 九阳大成 | `ps_jiuyang_dacheng` | 10 | stat·Z4 | 内劲伤害承受 −10%；中毒持续 ×0.5；不等于免疫毒或内伤（裁定 C07） |

### 2.2 `sk_qiankun` 乾坤大挪移（11 天中 · 内功 · 调和）

> **原著**：明教镇教心法，张无忌在光明顶秘道中修习；其根本在运劲用力、激发潜力与牵引敌劲，层级及修炼情节细节**（待考）**。主动招名中“卸劲回旋”“颠倒阴阳”“乾坤归一”均为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category: inner`；`subType: inner`；`grade: 11`；`origin: canonExpanded`；`sect: sect_mingjiao`；`lineage: 山中老人传承→历代明教教主→阳顶天→张无忌`；`sourceChapters: [ch04_yitian]` |
| 性质 · 内外 | `nature: harmony`；`wOut/wIn: 0/1`（阴阳互引的调和归类为**（原创扩展）**游戏设定） |
| reqs | `attrs {con:48,wis:55,wil:50}`；`aptitude {apInner:55}`；`sect {id:sect_mingjiao,rank:5}`；`prereq [{anyOf:[{skill:sk_guangmingxinfa,layer:8},{skill:sk_jiuyang,layer:5}]}]`；`hard:[sect,prereq]` |
| 内功贡献 | `mpMaxPct 50 + hpMaxPct 29 + attrs {con:6,wis:8,wil:6}=20×2 + mpRegen 3.3×5 = IP 135.5`，精确命中天中预算；`stats {effHit:10,resCC:10}` 合计 20 |
| meridians | `[mer_chongmai, mer_daimai]`【建议值】：冲脉调十二经、带脉约束周身，定稿归 15 |
| 层数要点 | 1 重牵引；2 重卸劲；4 重借力；5 重挪移护体；6 重颠倒阴阳；7 重绝招乾坤归一；10 重圆满 |
| 获取 | 明教教主线解开秘道遗刻 `q_04_faction_94`，`maxLayer:10`；非明教经张无忌羁绊传授，`reqsOverride {sect:null, hard:[prereq]}`，`maxLayer:8`（原创扩展投放） |
| setTags · conflicts | `[set_mingjiao_guangming]`；与 `sk_douzhuan` 不互斥（作者决定 P27），同一伤害事件只允许一次 `redirect/mirror` |
| special | `fusible:false`；`observable:false`；伤害转移只引用 `bf_nuoyi`，反应防循环见 `design/06` §5.3.1 |
| 图鉴文本 | 借彼之力、挪移乾坤；强处在改变受力关系，而非凭空复制敌人武学。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 挪移护体 `mv_qiankun_huti` | 1 | 自身·支援 | 0 | 9%/4/900 | `bf_nuoyi` 3 回合 | — | 支援机制；比例完全引用 06 |
| 卸劲回旋 `mv_qiankun_xiejin` | 2 | 单体 1·近身 | 1.25 | 9%/2/1000 | `bf_shiheng` 40%·1 | ✓ | `1×(1+.24+.05)−.10×.40=1.25` |
| 颠倒阴阳 `mv_qiankun_diandao` | 6 | 周身·近身 | 0.90 | 10%/3/1000 | `bf_luanxin` 30%·2 | ✓ | `.65×(1+.36+.10)−.10×.30=.92≈.90` |
| 乾坤归一 `mv_qiankun_guiyi` | 7 | 周身·近身·绝招 | 1.65 | 10%/绝/1200 | 命中目标彼此换位；自身 `bf_nuoyi` 2 回合 | ✓ | `3×.65−.15（换位）−.15（挪移）=1.65` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 激发潜力 | `ps_qiankun_qianli` | 2 | stat·属性层 | 低于 50% 气血时 `str/agi +4→+10` |
| 借力打力 | `ps_qiankun_jieli` | 4 | trigger·settle | 招架后 25%→40% 将该击 30% 内劲返给攻击者，每回合 1 次 |
| 阴阳互引 | `ps_qiankun_yinyang` | 6 | mechanic | 调和主运对阴、阳招式的相性增益由 +4% 提至 +8% |
| 乾坤圆满 | `ps_qiankun_dacheng` | 10 | mechanic | `bf_nuoyi` 每回合可触发 2 次，但同一伤害链仍只转移一次 |

### 2.3 `sk_xuanming` 玄冥神掌（10 天下 · 拳脚／拳掌 · 阴）

> **原著**：玄冥二老鹿杖客、鹤笔翁的阴寒掌功，张无忌幼时中掌受寒毒折磨；人物、情节与最终解毒过程见《倚天屠龙记》，具体回目**（待考）**。除“玄冥神掌”外，招名均为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category: unarmed`；`subType: fist`；`grade:10`；`origin:canonExpanded`；`sect:null`；`lineage: 玄冥二老`；`sourceChapters:[ch04_yitian]` |
| 性质 · 内外 | `nature:yin`；`wOut/wIn:0.20/0.80` |
| reqs | `attrs {con:48,str:42,wil:50}`；`aptitude {apFist:55,apInner:55}`；`prereq [{skill:sk_xuanmingxinfa,layer:7}]`；`hard:[prereq]` |
| layerStats | `{effHit:[3,10], pierce:[3,10]}`，第 10 重合计 20 |
| 层数要点 | 1 重寒掌；3 重玄阴入体；5 重双掌；6 重寒毒侵骨；7 重绝招玄冥齐出；9 重阴寒如丝；10 重玄冥极寒 |
| 获取 | 玄冥二老羁绊／邪线私传 `q_04_bond_96`，`maxLayer:10`；夺得掌谱残页 8 张，`maxLayer:7`（原创扩展） |
| setTags · conflicts | `[set_xuanming]`；被 `sk_jiuyang` 六重及以上克制 |
| special | `fusible:false`；`observable:false` |
| 图鉴文本 | 掌力外柔内寒，寒毒潜伏经脉；双老同场只是战术协同，不把本功登记为合击武学。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 玄冥一掌 `mv_xuanming_yizhang` | 1 | 单体 1·近身 | 1.10 | 9%/1/1000 | `bf_handu` 60%·2 | ✓ | `1×(1+.12+.05)−.10×.60=1.11≈1.10` |
| 寒入骨髓 `mv_xuanming_gusui` | 3 | 单体 1–3·远程 | 1.10 | 10%/2/1000 | `bf_hanqi` 50%·2 | ✓ | `1×(1+.24+.10)×.85−.10×.50=1.09≈1.10` |
| 双玄并出 `mv_xuanming_shuangxuan` | 5 | 横扫·近身 | 0.90 | 9%/2/1000 | `bf_handu` 40%·2；`bf_jiansu` 40%·2 | ✓ | `.75×(1+.24+.05)−.10×.40−.10×.40=.89≈.90` |
| 阴寒如丝 `mv_xuanming_rusi` | 6 | 乱击 n4 r2·近身 | 1.05 | 9%/2/1000 | `bf_fengxue` 20%·1 | ✓ | `.85×(1+.24+.05)−.20×.20=1.06≈1.05` |
| 玄冥齐出 `mv_xuanming_qichu` | 7 | 单体·绝招 | 2.80 | 10%/绝/1200 | `bf_handu` 100%·3；`bf_fengxue` 50%·1 | ✓ | `3−.10−.20×.50=2.80` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 寒毒潜伏 | `ps_xuanming_qianfu` | 3 | effect | `bf_handu` 自然消退时 30% 保留 1 层 |
| 玄冥相济 | `ps_xuanming_xiangji` | 5 | stat·Z3 | 另一名装配本功的友军在 2 格内时本功 +6%→12% |
| 寒侵百脉 | `ps_xuanming_baimai` | 6 | stat·效果层 | 对 `cold` 目标效果命中 +10→20 |
| 极寒 | `ps_xuanming_dacheng` | 10 | trigger | 每战首次使敌人寒毒达 5 层时追加 `bf_bingdong` 1 回合 |

### 2.4 `sk_shenghuoling` 圣火令武功（10 天下 · 拳脚／拳掌（诡变）· 调和）

> **原著**：波斯三使凭圣火令上所刻武功以怪异姿势围攻张无忌；张无忌随后译读、习得其法。令牌兼作奇门兵器，但基准 §13 已固定本条为“拳脚·拳（诡变）”，本文不得改类。招式名除“阴风刀”外均为**（原创扩展命名）**；阴风刀的具体称谓与回目仍**（待考）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:10`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 波斯总教→风云月三使→张无忌`；`sourceChapters:[ch04_yitian]` |
| 性质 · 内外 | `nature:harmony`；`wOut/wIn:0.60/0.40` |
| reqs | `attrs {agi:55,wis:50}`；`aptitude {apFist:55,apExotic:45}`；`sect {id:sect_mingjiao,rank:4}`；`prereq [{skill:sk_shenghuoxinfa,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `{hit:[3,10],eva:[3,10]}`，第 10 重合计 20 |
| 层数要点 | 1 重怪势；2 重贴地；4 重关节反折；5 重双令；6 重阴风刀；7 重绝招圣火无定；10 重诸法无常 |
| 获取 | 波斯总教航线夺令并译读 `q_04_main_96`，`maxLayer:10`；与三使和解后传授 `q_04_faction_97`，`maxLayer:8`（后者为原创扩展分支） |
| setTags · conflicts | `[set_mingjiao_shenghuo]`；无 |
| special | `fusible:false`；`observable:false`；姿态变化不要求装备圣火令，装备令牌只提供装备加成 |
| 图鉴文本 | 以反常关节、贴地翻滚和忽正忽反的发力扰乱常理；“诡”来自姿势与节奏，不等于邪术。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 伏地旋身 `mv_shenghuoling_fudi` | 1 | 绕背 r2·近身 | 0.70 | 8%/1/900 | 绕背；自身 `bf_piaohu` 1 | ✓ | `.90×(1+.12−.07)−.15−.10=.695≈.70` |
| 反关节 `mv_shenghuoling_fanguanjie` | 2 | 单体·近身 | 1.05 | 9%/1/1000 | `bf_fengjingmai` 30%·2 | ✓ | `1×(1+.12+.05)−.20×.30×2=1.05` |
| 双令夹击 `mv_shenghuoling_shuangling` | 5 | 穿透·近身 | 1.10 | 9%/2/1000 | `bf_jiaoxie` 30%·1 | ✓ | `.90×(1+.24+.05)−.20×.30=1.10` |
| 阴风刀 `mv_shenghuoling_yinfengdao` | 6 | 直线 n3·远程 | 0.85 | 10%/2/1000 | `bf_fengxue` 30%·1 | ✓ | `.80×(1+.24+.10)×.85−.20×.30=.85` |
| 圣火无定 `mv_shenghuoling_wuding` | 7 | 乱击 n6 r2·近身·绝招 | 1.85 | 10%/绝/1200 | `bf_luanxin` 60%·2 | ✗ | `3×.85×.85−.25×.60×2=1.87≈1.85` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 怪势 | `ps_shenghuoling_guaishi` | 1 | stat·Z7 | 从背后或侧面出招时方位乘区 +4%→10% |
| 关节如绵 | `ps_shenghuoling_guanjie` | 4 | stat·属性层 | `eva +4→10`；自身被拉拽／换位概率 −30% |
| 诸法无定 | `ps_shenghuoling_wuding` | 7 | mechanic | 连续两次使用不同招式，第二招 `hit +15`；不连锁 |
| 圣火归一 | `ps_shenghuoling_dacheng` | 10 | trigger | 每战首次被招架时立即后撤 1 格并获 `bf_jisu` 1 回合 |

---

## 3. 地阶条目卡（12 门）

### 3.1 明教与五行旗（2 门）

#### `sk_dajiutianshou` 大九天手（9 地上 · 拳脚／拳掌 · 阳）

> **原著**：阳顶天以“大九天手”成名的说法及其对手情节须依修订版核对**（待考）**。本文不沿用网络资料中的具体威力比较；“九天贯日”等招名为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:9`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 阳顶天一系`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0.45/0.55` |
| reqs | `attrs {str:45,con:45,wil:40}`；`aptitude {apFist:48,apInner:42}`；`sect {id:sect_mingjiao,rank:4}`；`prereq [{skill:sk_dafengyunfeizhang,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{crit:[2,7], pierce:[3,8]}`，第 10 重 15 点 |
| 层数要点 | 1 重举火；3 重九天震；5 重烈阳贯掌；7 重绝招九天贯日；10 重日月同明 |
| 获取 | 光明顶教主密库掌谱 `q_04_faction_95`，L4 由光明使监授，`maxLayer:10`；阳顶天遗刻残页 `maxLayer:7`（原创扩展投放） |
| setTags · conflicts | `[set_mingjiao_guangming]`；无 |
| special · 图鉴文本 | `fusible:true`；`observable:true`。凝阳劲于掌心骤发，是明教旧教主一系的刚猛掌法。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 举火燎天 `mv_dajiutianshou_juhuo` | 1 | 单体·近身 | 1.35 | 9%/2/1100 | `bf_neishang` 40%·2 | ✓ | `1×(1+.24+.10+.07)−.10×.40=1.37≈1.35` |
| 九天震 `mv_dajiutianshou_jiutianzhen` | 3 | 横扫·近身 | 0.90 | 8%/2/1000 | 击退 1 | ✓ | `.75×(1+.24+.05)−.05=.92≈.90` |
| 烈阳贯掌 `mv_dajiutianshou_lieyang` | 5 | 直线 n2·远程 | 1.05 | 9%/2/1000 | `bf_zhuoshao` 40%·2；本回合未移动方可用 | ✓ | `.85×(1+.24+.10+.15)×.85−.10×.40=1.04≈1.05` |
| 九天贯日 `mv_dajiutianshou_guanri` | 7 | 直线 n3·远程·绝招 | 1.95 | 9%/绝/1200 | `bf_neishang` 100%·3 | ✓ | `3×.80×.85−.10=1.94≈1.95` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 九天蓄阳 | `ps_dajiutianshou_xuyang` | 2 | stat·Z3 | 未移动时本功 +5%→12% |
| 掌震重门 | `ps_dajiutianshou_zhongmen` | 5 | effect | 本功击退目标撞击障碍时，撞击伤害 +20% |
| 日月同明 | `ps_dajiutianshou_dacheng` | 10 | stat·Z5 | 阳性主运时本功相性增益额外 +4pp |

#### `sk_wuxingqizhen` 五行旗阵（8 地中 · 杂学／阵法 · 调和）**（原创扩展）**

> **原著依据**：锐金、巨木、洪水、烈火、厚土五旗在光明顶与抗元战事中各有专门战法；具体兵械与回目**（待考）**。把五旗战法归纳为可修炼的统阵术、相生环和中宫大旗，是本作扩展；阵法战斗细则引用 `design/09` §6.8.4。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:misc`；`subType:formation`；`grade:8`；`origin:expanded`；`sect:sect_mingjiao`；`lineage: 五行旗`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.65/0.35` |
| reqs | `attrs {wis:42,cha:38}`；`skills {formation:50}`；`sect {id:sect_mingjiao,rank:3}`；`prereq [{skill:sk_wuxingqiling,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `{hit:[2,7],resCC:[3,8]}`，第 10 重 15 点 |
| 层数要点 | 1 重立旗；3 重两旗相生；5 重中宫；7 重绝招五行轮转；10 重生生不息 |
| 获取 | 五位掌旗使共同考校 `q_04_faction_96`，`maxLayer:10`；任一旗分支只授残阵 `maxLayer:6` |
| setTags · conflicts | `[set_mingjiao_wuxingqi]`；无 |
| special · 图鉴文本 | `formation:{unitsMin:1, fullUnits:5, ruleRef:design/09 §6.8.4}`；`fusible:false`。单人可用旗令调度 NPC 战阵单位；五名玩家同学本术时才完整相生，故不登记为 `special.combo`。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 立中宫 `mv_wuxingqizhen_zhonggong` | 1 | 友方 r3·支援 | 0 | 7%/5/900 | 设中宫大旗；友方 `bf_jiangu` 2 | — | 支援阵眼，数值见 09 |
| 锐金齐射 `mv_wuxingqizhen_ruijin` | 3 | 直线 n5·投射 | 0.80 | 8%/2/1000 | `bf_pojia` 40%·2 | ✓ | `.70×(1+.24+.05)×.92−.10×.40=.79≈.80` |
| 巨木冲阵 `mv_wuxingqizhen_jumu` | 5 | 突进 n4 through·近身 | 0.90 | 8%/3/1000 | 击退 2 | ✓ | `.80×(1+.36+.05)−.10−.10=.93≈.90` |
| 五行轮转 `mv_wuxingqizhen_lunzhuan` | 7 | 友方 r3·绝招支援 | 0 | 9%/绝/1200 | 五旗专能各立即触发一次；中宫大旗恢复 50% | — | 支援绝招；五种专能完全引用 09，不另叠伤害倍率 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 五旗相生 | `ps_wuxingqizhen_xiangsheng` | 3 | mechanic | 相生前旗在场时，后旗取得 09 所列加成 |
| 中宫不倒 | `ps_wuxingqizhen_zhonggong` | 5 | stat·Z4 | 大旗在场时阵员减伤 4%→10% |
| 生生不息 | `ps_wuxingqizhen_dacheng` | 10 | trigger | 每轮首次一旗出局时，相生前旗立即获得 `bf_ruiyi` 2 回合 |

### 3.2 天鹰教（1 门）

#### `sk_yingzhaoqinna` 鹰爪擒拿功（9 地上 · 拳脚／擒拿 · 阳）

> **原著**：白眉鹰王殷天正精擅鹰爪擒拿手，爪力可折兵刃的具体描写与名称字样须核对修订版**（待考）**。招式名为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:grapple`；`grade:9`；`origin:canonExpanded`；`sect:sect_tianyingjiao`；`lineage: 殷天正→殷野王`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0.70/0.30` |
| reqs | `attrs {str:48,agi:42}`；`aptitude {apGrapple:50}`；`sect {id:sect_tianyingjiao,rank:4}`；`prereq [{skill:sk_yingzhaoshou,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{seal:[3,9],crit:[2,6]}`，第 10 重 15 点 |
| 层数要点 | 1 重铁爪；3 重扑击；5 重折兵；6 重锁肩；7 重绝招鹰击长空；10 重白眉雄风 |
| 获取 | 殷天正亲传 `q_04_bond_94`，`maxLayer:10`；殷野王授艺 `maxLayer:8` |
| setTags · conflicts | `[set_tianying_baimei]`；无 |
| special · 图鉴文本 | `fusible:true`；`observable:true`。强在抓拿关节与折断寻常兵刃，不把传说性描述写成无条件破坏神兵。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 铁爪拿腕 `mv_yingzhaoqinna_nawan` | 1 | 单体·近身 | 1.00 | 8%/1/1000 | `bf_fengjingmai` 40%·2 | ✓ | `1×(1+.12+.05)−.20×.40×2=1.01≈1.00` |
| 苍鹰扑兔 `mv_yingzhaoqinna_putu` | 3 | 突进 n3·近身 | 1.10 | 8%/2/1000 | 击退 1；`bf_pojia` 50% | ✓ | `1×(1+.24+.05)−.10−.05−.05=1.09≈1.10` |
| 折兵锁肩 `mv_yingzhaoqinna_zhebing` | 5 | 单体·近身 | 1.25 | 9%/2/1000 | `bf_jiaoxie` 50%·1 | ✓ | `1×(1+.24+.10)−.20×.50=1.24≈1.25` |
| 鹰击长空 `mv_yingzhaoqinna_changkong` | 7 | 跳斩 r3·近身·绝招 | 2.45 | 9%/绝/1200 | `bf_fengxue` 75%·1；落至目标侧后方 | ✓ | `3×.90−.10−.20×.75=2.45` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 鹰视 | `ps_yingzhaoqinna_yingshi` | 2 | stat·Z7 | 对侧后方目标伤害 +4%→10% |
| 折铁 | `ps_yingzhaoqinna_zhetie` | 5 | effect | 对普通兵器施加 `bf_duanbing` 的效果命中 +10；天级装备仍受免疫规则 |
| 白眉雄风 | `ps_yingzhaoqinna_dacheng` | 10 | trigger | 气血低于 30% 首次行动获 `bf_wenzhong` 与 `bf_ruiyi` 2 回合 |

### 3.3 峨眉与武当九阳支（2 门）

#### `sk_emeijiuyang` 峨眉九阳功（8 地中 · 内功 · 阳）

> **原著**：觉远临终诵经，郭襄所得一部分成为峨眉九阳功；三派所得侧重差异须逐字核对**（待考）**。主动运功招名均为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:canonExpanded`；`sect:sect_emei`；`lineage: 觉远→郭襄→峨眉`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0/1` |
| reqs | `attrs {con:38,wil:42}`；`aptitude {apInner:42}`；`sect {id:sect_emei,rank:3}`；`prereq [{skill:sk_emeixinfa,layer:6}]`；`hard:[sect,prereq]` |
| 内功贡献 | `30+18+2×12+5×2.2=83`：`attrs {con:4,agi:3,wil:5}`；`stats {resCold:8,resInjury:7}`=15 |
| meridians | `[mer_renmai, mer_yinqiao]`【建议值】 |
| 层数要点 | 1 重余音；3 重暖脉；5 重护心；7 重绝招金顶朝阳；10 重峨眉九阳 |
| 获取 | L3 由掌门／静玄一系传授 `q_04_faction_86`，`maxLayer:10`；郭襄遗稿解谜 `maxLayer:8`（原创扩展投放） |
| setTags · conflicts | `[set_yitian_emei]`；同源组 `lg_jiuyang`，与其他九阳支同装收益取最高、不叠加 |
| special · 图鉴文本 | `fusible:true`。由九阳经文衍出的峨眉内功，偏重护心、疗伤与掌剑衔接；不是九阳全本。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 暖脉 `mv_emeijiuyang_nuanmai` | 3 | 友方单体·支援 | 0 | 7%/2/1000 | 治疗 18% hpMax；驱散 1 个 `cold/injury` | — | 标准单体治疗 18% |
| 金顶护心 `mv_emeijiuyang_huxin` | 5 | 自身·支援 | 0 | 7%/3/900 | `bf_hutizhenqi` 15% hpMax·3 | — | 15% 护盾约等价 12.5% 治疗，cd3 合规 |
| 金顶朝阳 `mv_emeijiuyang_chaoyang` | 7 | 友方 r2·绝招支援 | 0 | 9%/绝/1200 | 治疗 12% hpMax；`bf_huichun` 3；清 1 个 `cold` | — | 群疗按范围折减后为标准绝招预算 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 九阳余绪 | `ps_emeijiuyang_yuxu` | 1 | stat·Z4 | 受 `cold` 伤害 −4%→10% |
| 掌剑相济 | `ps_emeijiuyang_zhangjian` | 5 | trigger | 拳脚后首招峨眉剑法、或剑法后首招峨眉拳脚 `hit +10`，每回合 1 次 |
| 三派同源 | `ps_emeijiuyang_tongyuan` | 8 | mechanic | 同装另一 `lg_jiuyang` 成员时 `mpRegen +0.5pp`，同名效果不叠加 |

#### `sk_wudangjiuyang` 武当九阳功（8 地中 · 内功 · 阳）

> **原著**：张三丰从觉远诵经中得部分九阳要旨，后成武当九阳功；内容边界与传授人物**（待考）**。主体武当图鉴在 `skills-daojia`，本条按裁定唯一归属本文。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:canonExpanded`；`sect:sect_wudang`；`lineage: 觉远→张三丰→武当`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0/1` |
| reqs | `attrs {con:40,wil:42}`；`aptitude {apInner:42}`；`sect {id:sect_wudang,rank:3}`；`prereq [{anyOf:[{skill:sk_chunyangwuji,layer:5},{skill:sk_liangyixinfa,layer:7}]}]`；`hard:[sect,prereq]` |
| 内功贡献 | `30+18+2×12+5×2.2=83`：`attrs {con:5,wil:5,wis:2}`；`stats {defIn:8,resCold:7}`=15 |
| meridians | `[mer_dumai, mer_yangwei]`【建议值】 |
| 层数要点 | 1 重守中；3 重阳和；5 重护体；7 重绝招真武阳和；10 重九阳归真 |
| 获取 | L3 由张三丰或宋远桥传授 `q_04_bond_98`，`maxLayer:10`；武当藏经残卷 `maxLayer:8`（原创扩展投放） |
| setTags · conflicts | `[set_wudang_zhenwu]`（补齐裁定 C22）；同源组 `lg_jiuyang` |
| special · 图鉴文本 | `fusible:true`。武当所承九阳余脉，取守中、绵长、护体之意；不是九阳全本。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阳和护体 `mv_wudangjiuyang_huti` | 3 | 自身·支援 | 0 | 7%/3/900 | `bf_hutizhenqi` 15% hpMax·3；驱散 1 个 `cold` | — | 支援等价预算 |
| 守中回元 `mv_wudangjiuyang_huiyuan` | 5 | 自身·支援 | 0 | 8%/3/1000 | 回复 18% mpMax；`bf_dingxin` 2 | — | 回内量不超过 06/05 的回内边界，具体实现受 6% 每回合上限 |
| 真武阳和 `mv_wudangjiuyang_yanghe` | 7 | 友方 r2·绝招支援 | 0 | 9%/绝/1200 | `bf_hutizhenqi` 12%施术者 hpMax；`bf_wenzhong` 2 | — | 群体护盾与稳固按支援绝招预算 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 守中 | `ps_wudangjiuyang_shouzhong` | 1 | stat·Z4 | 未移动回合受伤 −3%→8% |
| 阳和 | `ps_wudangjiuyang_yanghe` | 5 | effect | 招架后回复 1% mpMax，每回合至多 1 次 |
| 三派同源 | `ps_wudangjiuyang_tongyuan` | 8 | mechanic | 同装另一 `lg_jiuyang` 成员时 `mpRegen +0.5pp`，不叠加 |

### 3.4 昆仑派（1 门）

#### `sk_zhengliangyi` 正两仪剑法（9 地上 · 兵器／剑 · 调和）

> **原著**：何太冲、班淑娴以正两仪剑法，与华山反两仪刀法组成两仪化四象围攻张无忌；具体回目与原招名**（待考）**。本文招名及单人可用的剑理拆分为**（原创扩展命名）**，联阵规则引用 `design/09` §6.8.5。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:weapon`；`subType:sword`；`grade:9`；`origin:canonExpanded`；`sect:sect_kunlun`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.55/0.45`；`weaponReq:{category:sword}` |
| reqs | `attrs {agi:45,wis:48}`；`aptitude {apSword:50}`；`sect {id:sect_kunlun,rank:4}`；`prereq [{skill:sk_yudafeihuajian,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{parry:[3,9],hit:[2,6]}`，第 10 重 15 点 |
| 层数要点 | 1 重两仪；3 重阴阳换位；5 重正奇互生；7 重绝招两仪化象；10 重六十四变 |
| 获取 | 何太冲／班淑娴亲传 `q_04_faction_87`，`maxLayer:10`；光明顶观摩 `maxLayer:6` |
| setTags · conflicts | `[set_kunlun_liangyi, set_liangyi_sixiang]`；与 `sk_fanliangyi` 为 `synergy`，不互为前置 |
| special · 图鉴文本 | `formationRef:design/09 §6.8.5`；`fusible:true`。单人仍是一门完整剑法；两人夹击与四人四象是协同态，不登记为合击武学。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阳仪进剑 `mv_zhengliangyi_yangyi` | 1 | 单体·近身 | 1.10 | 7%/1/1000 | — | ✓ | `1×(1+.12)=1.12≈1.10` |
| 阴仪回锋 `mv_zhengliangyi_yinyi` | 3 | 直线 n2·近身 | 1.10 | 8%/2/1000 | — | ✓ | `.85×(1+.24+.05)=1.10` |
| 正奇互生 `mv_zhengliangyi_zhengqi` | 5 | 乱击 n4 r2·近身 | 1.30 | 9%/3/1000 | 目标在两仪夹持中时 `bf_shiheng` 50%·1 | ✓ | `.85×(1+.36+.10+.15)−.10×.50=1.32≈1.30` |
| 两仪化象 `mv_zhengliangyi_huaxiang` | 7 | 穿透·近身·绝招 | 2.55 | 9%/绝/1200 | 与夹击搭档各追击 ×0.4；目标 `bf_dingshen` 50%·1 | ✓ | `3×.90−.25×.50=2.575≈2.55`；追击由阵法行动结算，不重复计入本击 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 阴阳换位 | `ps_zhengliangyi_huanwei` | 3 | trigger | 招架后与 2 格内同阵者换位，每回合 1 次 |
| 两仪夹持 | `ps_zhengliangyi_jiachi` | 5 | mechanic | 完全引用 09：夹击目标对阵员招架率 ×0.5 |
| 六十四变 | `ps_zhengliangyi_dacheng` | 10 | stat·Z3 | 连续使用不同本功招式时 +4%→10%，重复则清零 |

### 3.5 崆峒派（1 门）

#### `sk_qishangquan` 七伤拳（9 地上 · 拳脚／拳掌 · 调和 · 代价型）

> **原著与规则权威**：崆峒派绝学，一拳有七股不同劲力；内力未足时先伤自身，谢逊因练拳受损，张无忌以九阳根基运使无碍。细节与回目**（待考）**；代价、痊愈和“七劲”效果表引用 `design/05` §9.1.1，不在本文改写。各单招名为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:9`；`origin:canonExpanded`；`sect:sect_kongtong`；`lineage: 崆峒→谢逊（拳谱）→张无忌（印证）`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.35/0.65` |
| reqs | `attrs {con:50,str:45,wil:45}`；`aptitude {apFist:50,apInner:48}`；`sect {id:sect_kongtong,rank:4}`；`prereq [{skill:sk_qishangchujue,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `{pierce:[3,9],effHit:[2,6]}`，第 10 重 15 点 |
| 层数要点 | 1 重刚柔；2 重横直；3 重吞吐；5 重五行；6 重阴阳；7 重绝招七劲齐发；10 重七伤归一 |
| 获取 | 崆峒五老认可后传拳 `q_04_faction_88`，`maxLayer:10`；谢逊拳谱印证 `q_04_bond_95`，`reqsOverride {sect:null, prereq:[{anyOf:[{skill:sk_qishangchujue,layer:6},{skill:sk_jiuyang,layer:5}]}], hard:[prereq]}`，`maxLayer:10` |
| setTags · conflicts | `[set_kongtong_qishang]`；被 `sk_jiuyang`／`sk_yijinjing` ≥5重消除自伤 |
| special | `cost` 完整引用 05 §9.1.1；`fusible:false`；本组唯一代价型地阶 |
| 图鉴文本 | 七劲或刚或柔、或横或直；内功根基未固者先伤五脏，代价在学习确认前完整展示。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 刚柔错劲 `mv_qishangquan_gangrou` | 1 | 单体·近身 | 1.20 | 8%/1/1000 | 自身 `bf_qishang` +1；随机七劲 1 种 | ✓ | `1+.12(cd)+.05(内)+.12(等效自损)−.10(七劲期望)=1.19≈1.20` |
| 横直并发 `mv_qishangquan_hengzhi` | 2 | 直线 n2·近身 | 1.10 | 8%/2/1000 | 自身七伤 +1；随机七劲 | ✓ | `.85×(1+.24+.05+.12)−.10=1.10` |
| 五行震脏 `mv_qishangquan_wuxing` | 5 | 单体·近身 | 1.40 | 9%/2/1000 | 自身七伤 +1；`bf_neishang` 60%·3 | ✓ | `1×(1+.24+.10+.12)−.10×.60=1.40` |
| 阴阳吞吐 `mv_qishangquan_tuntu` | 6 | 横扫·近身 | 0.95 | 9%/2/1000 | 自身七伤 +1；击退 1；随机七劲 | ✓ | `.75×(1+.24+.10+.12)−.05−.10=.95` |
| 七劲齐发 `mv_qishangquan_qifa` | 7 | 单体·绝招 | 2.90 | 9%/绝/1200 | 自身七伤 +1；`bf_neishang` 100%·3；随机七劲 2 种 | ✓ | `3+.12(自损)−.10(内伤)−.10(双劲期望)=2.92≈2.90` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 一练七伤 | `ps_qishangquan_qishang` | 1 | mechanic | 自伤、七层走火与战外消退完全引用 05 |
| 七劲辨识 | `ps_qishangquan_bianshi` | 5 | stat·效果层 | 已有 `injury/cold/heat` 的目标，随机七劲不再抽到其已有同类 |
| 先成后用 | `ps_qishangquan_genji` | 7 | mechanic | 主运地阶以上时自伤率按 05 降半；天阶或九阳／易筋条件免伤 |
| 七伤归一 | `ps_qishangquan_dacheng` | 10 | stat·Z3 | 每有 1 层自身七伤，本功伤害 +2%，上限 +14% |

### 3.6 华山派（倚天支，1 门）

#### `sk_fanliangyi` 反两仪刀法（8 地中 · 兵器／刀 · 调和）

> **原著**：华山高矮二老以反两仪刀法与昆仑正两仪剑法合成两仪化四象围攻张无忌；姓名、回目及原招名**（待考）**。本文招名与单人刀理拆分为**（原创扩展命名）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:weapon`；`subType:blade`；`grade:8`；`origin:canonExpanded`；`sect:sect_huashan`；`lineage: 华山倚天支`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:blade}` |
| reqs | `attrs {str:42,agi:40}`；`aptitude {apBlade:45}`；`sect {id:sect_huashan,rank:4}`；`prereq [{skill:sk_liangyidaojia,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{crit:[2,7],parry:[3,8]}`，第 10 重 15 点 |
| 层数要点 | 1 重反仪；3 重高低互易；5 重刚柔逆转；7 重绝招四象反生；10 重反尽归正 |
| 获取 | 高矮二老门派考校 `q_04_faction_89`，`maxLayer:10`；光明顶观摩 `maxLayer:6` |
| setTags · conflicts | `[set_huashan_liangyi, set_liangyi_sixiang]`；与 `sk_zhengliangyi` 为 `synergy` |
| special · 图鉴文本 | `formationRef:design/09 §6.8.5`；`fusible:true`。反向走位与一高一低的刀路互补；四象协同不标合击武学。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 高式劈山 `mv_fanliangyi_gaoshi` | 1 | 单体·近身 | 1.15 | 7%/1/1100 | 击退 1 | ✓ | `1×(1+.12+.07)−.05=1.14≈1.15` |
| 低式扫岳 `mv_fanliangyi_dishi` | 3 | 横扫·近身 | 0.95 | 8%/2/1000 | `bf_shiheng` 40%·1 | ✓ | `.75×(1+.24+.05)−.10×.40=.93≈.95` |
| 刚柔逆转 `mv_fanliangyi_nizhuan` | 5 | 单体·近身 | 1.35 | 9%/2/1000 | 目标招架后自身 `bf_ruiyi` 2 | ✓ | `1×(1+.24+.10)+.15(目标本回合招架过)−.15(自益)=1.34≈1.35` |
| 四象反生 `mv_fanliangyi_sixiang` | 7 | 周身·绝招 | 1.95 | 9%/绝/1200 | 处于四象围位时，09 可令阵员另耗行动追击 ×0.5 | ✓ | `3×.65=1.95`；阵员追击由 09 独立结算，不计入本击 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 高低互易 | `ps_fanliangyi_gaodi` | 3 | mechanic | 每次移动后在“高式/低式”间切换，分别偏暴击／招架 |
| 两仪夹持 | `ps_fanliangyi_jiachi` | 5 | mechanic | 完全引用 09；与同门或正两仪使用者可组成两仪夹持 |
| 反尽归正 | `ps_fanliangyi_dacheng` | 10 | stat·Z9 | 被招架时该次招架减免 −10%→25% |

### 3.7 玄冥二老与汝阳王府（1 门）

#### `sk_babishenjian` 八臂神剑（7 地下 · 兵器／剑 · 调和）**（原创扩展命名）**

> **原著依据**：方东白号“八臂神剑”，出剑迅捷、杂用多家剑法，后在汝阳王府效力；正式成套剑法名未见，故本作以绰号命名武学。其原丐帮长老身份与招式细节**（待考）**。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:weapon`；`subType:sword`；`grade:7`；`origin:expanded`；`sect:sect_ruyangwangfu`；`lineage: 方东白百家剑术`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.65/0.35`；`weaponReq:{category:sword}` |
| reqs | `attrs {agi:42,wis:38}`；`aptitude {apSword:45}`；`sect {id:sect_ruyangwangfu,rank:4}`；`prereq [{skill:sk_jifengbajian,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `{hit:[3,9],crit:[2,6]}`，第 10 重 15 点 |
| 层数要点 | 1 重一臂；3 重四路；5 重八方剑影；7 重绝招八臂齐出；10 重百家归一 |
| 获取 | 方东白比剑后传授 `q_04_bond_97`，`reqsOverride {sect:null, hard:[prereq]}`；汝阳王府宿卫功勋 L4，均 `maxLayer:10` |
| setTags · conflicts | `[set_ruyang_suwei]`；无 |
| special · 图鉴文本 | `fusible:true`。把方东白疾剑与百家变化整理成一路玩法武学，名称取其绰号而非虚称原著秘籍。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 疾风一剑 `mv_babishenjian_jifeng` | 1 | 单体·近身 | 0.90 | 6%/0/900 | — | ✓ | `1−.05(内)−.07(收)=.88≈.90` |
| 四路并进 `mv_babishenjian_silu` | 3 | 乱击 n4 r2·近身 | 0.95 | 7%/1/1000 | — | ✓ | `.85×(1+.12)=.95` |
| 八方剑影 `mv_babishenjian_bafang` | 5 | 周身·近身 | 0.80 | 8%/2/1000 | `bf_shimang` 30%·1 | ✓ | `.65×(1+.24+.05)−.10×.30=.81≈.80` |
| 八臂齐出 `mv_babishenjian_qichu` | 7 | 乱击 n8 r2·绝招 | 2.50 | 9%/绝/1200 | `bf_pozhao` 60%·2 | ✓ | `3×.85−.10×.60=2.49≈2.50` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 疾如多臂 | `ps_babishenjian_duobi` | 2 | stat·属性层 | 本功收招 −20→−80 |
| 百家剑影 | `ps_babishenjian_baijia` | 5 | stat·Z3 | 每使用一个不同招式 +3%，最多 4 层；重复清空 |
| 八臂归一 | `ps_babishenjian_dacheng` | 10 | trigger | 每战首次乱击全段命中同一目标时获 `bf_bizhong` ×1 |

### 3.8 海沙派（1 门）

#### `sk_duyanfeisha` 毒盐飞沙（7 地下 · 杂学／毒 · 阴）**（原创扩展命名）**

> **原著依据**：海沙派以毒盐害人并参与争夺屠龙刀，首领及具体情节**（待考）**。原著没有“毒盐飞沙”这套武学名；本文将用盐、扬沙、封路的帮会伎俩系统化。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:misc`；`subType:poison`；`grade:7`；`origin:expanded`；`sect:sect_haisha`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.60/0.40` |
| reqs | `attrs {wis:36,agi:38}`；`skills {poi:45}`；`sect {id:sect_haisha,rank:4}`；`prereq [{skill:sk_yanxiaoshou,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{effHit:[3,10],eva:[2,5]}`，第 10 重 15 点 |
| 层数要点 | 1 重扬盐；3 重迷眼；5 重蚀伤；7 重绝招盐雾封江；10 重无形入隙 |
| 获取 | 海沙派 L4 授艺；或查清毒盐仓后缴获配方 `q_04_side_94`，`reqsOverride {sect:null, hard:[prereq]}`，`maxLayer:8` |
| setTags · conflicts | `[set_haisha_duyan]`；无 |
| special · 图鉴文本 | `fusible:true`。毒盐需暗器材料栏有“毒盐包”；用尽后仍可近身短打，但不能施放投射招。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 撒盐迷眼 `mv_duyanfeisha_miyan` | 1 | 锥 n2·投射 | 0.75 | 7%/2/1000 | `bf_shimang` 50%·1；消耗毒盐包 | ✗ | `.75×(1+.24+.15耗材)×.92×.85−.10×.50=.77≈.75` |
| 盐砂蚀伤 `mv_duyanfeisha_shishang` | 3 | 单体 1–3·投射 | 1.00 | 8%/2/1000 | `bf_zhongdu` 2 层；`bf_liuxue` 30%·2；消耗毒盐包且目标须已有伤口 | ✗ | `1×(1+.24+.05+.15条件)×.92×.85−.10−.10×.30=1.00` |
| 飞沙走石 `mv_duyanfeisha_feisha` | 5 | 区域 sq3 t2·投射 | 0.25/跳 | 8%/3/1000 | 每跳 `bf_jiansu` 40%·1 | ✗ | `.25×(1+.36+.05)×.92×.85−.10×.40=.24≈.25` |
| 盐雾封江 `mv_duyanfeisha_fengjiang` | 7 | 大九宫·投射·绝招 | 0.90 | 9%/绝/1200 | `bf_zhongdu` 3 层；`bf_shimang` 60%·2；消耗毒盐包且须顺风 | ✗ | `3×.45×.92×.85−.10−.10×.60=.90`；耗材与顺风是施放条件，不另计增伤 |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 盐入创口 | `ps_duyanfeisha_chuangkou` | 3 | stat·Z3 | 对流血目标本功 +5%→12% |
| 借风扬沙 | `ps_duyanfeisha_jiefeng` | 5 | mechanic | 顺风投射射程 +1；逆风命中 −10，天气风向归 11 |
| 无形入隙 | `ps_duyanfeisha_dacheng` | 10 | effect | 目标已有 `bf_pojia` 时中毒额外 +1 层，每回合 1 次 |

### 3.9 巨鲸帮（1 门）

#### `sk_fenshuiemeici` 分水峨眉刺（7 地下 · 兵器／奇门 · 调和）**（原创扩展命名）**

> **原著依据**：王盘山扬刀大会前后，巨鲸帮人物以分水峨眉刺交锋并自负水下功夫；人物名、兵器字样与回目**（待考）**。原著未命名成套刺法，故本武学名为原创扩展命名。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:weapon`；`subType:exotic`；`grade:7`；`origin:expanded`；`sect:sect_jujing`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.75/0.25`；`weaponReq:{category:exotic,kinds:[emeici]}` |
| reqs | `attrs {agi:40,str:35}`；`aptitude {apExotic:42}`；`sect {id:sect_jujing,rank:4}`；`prereq [{skill:sk_langlifenshuici,layer:5}]`；`hard:[sect,prereq]` |
| layerStats | `{hit:[3,8],parry:[2,7]}`，第 10 重 15 点 |
| 层数要点 | 1 重分水；3 重贴浪；5 重锁刃；7 重绝招鲸翻海覆；10 重水陆皆宜 |
| 获取 | 巨鲸帮水战考校 L4；王盘山遗落刺谱 `q_04_side_95`，`reqsOverride {sect:null}`，`maxLayer:8` |
| setTags · conflicts | `[set_jujing_fenshui]`；无 |
| special · 图鉴文本 | `fusible:true`。在浅水／深水边缘发挥最强；水下行动规则完全引用 `design/08`，本文不重定义。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 分水双刺 `mv_fenshuiemeici_shuangci` | 1 | 单体·近身 | 1.10 | 7%/1/1000 | `bf_liuxue` 30%·2 | ✓ | `1×(1+.12)−.10×.30=1.09≈1.10` |
| 贴浪穿身 `mv_fenshuiemeici_tielang` | 3 | 突进 n3·近身 | 1.15 | 8%/2/1000 | 突进；浅水时 `bf_pojia` 40%·2 | ✓ | `1×(1+.24+.05)−.10−.10×.40=1.15`（浅水条件只控制破甲是否附带） |
| 锁刃回刺 `mv_fenshuiemeici_suoren` | 5 | 单体·近身 | 1.20 | 8%/2/1000 | `bf_jiaoxie` 40%·1 | ✓ | `1×(1+.24+.05)−.20×.40=1.21≈1.20` |
| 鲸翻海覆 `mv_fenshuiemeici_jingfan` | 7 | 周身·绝招 | 1.80 | 9%/绝/1200 | 击退 1；水域目标 `bf_shiheng` 100%·1 | ✓ | `3×.65−.05−.10=1.80` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 水下换气 | `ps_fenshuiemeici_huanqi` | 2 | stat·探索 | 水中体力消耗 −10%→25%，不提升 `swimLevel` |
| 双刺锁刃 | `ps_fenshuiemeici_suoren` | 5 | stat·Z9 | 对刀剑招架减免 −5%→15% |
| 水陆皆宜 | `ps_fenshuiemeici_dacheng` | 10 | mechanic | 水域加成在陆地保留一半，水域中再获 `hit +10` |

### 3.10 神拳门（1 门）

#### `sk_cuijunshenquan` 摧军神拳（7 地下 · 拳脚／拳掌 · 阳）**（原创扩展命名）**

> **原著依据**：神拳门掌门以能击毙牯牛、常人难当数拳而得江湖绰号，并在王盘山岛向谢逊出拳；人物究为“过三拳”还是版本异文、第四拳长招名及回目均**（待考）**。原著未称其拳路“摧军神拳”，故本作命名。

| 项 | 内容 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:7`；`origin:expanded`；`sect:sect_shenquan`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0.80/0.20` |
| reqs | `attrs {str:42,con:38}`；`aptitude {apFist:42}`；`sect {id:sect_shenquan,rank:4}`；`prereq [{skill:sk_sandieshenquan,layer:6}]`；`hard:[sect,prereq]` |
| layerStats | `{crit:[3,9],hit:[2,6]}`，第 10 重 15 点 |
| 层数要点 | 1 重一拳；3 重连三；5 重蓄四；7 重绝招横扫千军；10 重拳不虚发 |
| 获取 | 神拳门掌门考校 L4；王盘山见证线 `q_04_side_96` 取得残谱 `maxLayer:8`（原创扩展） |
| setTags · conflicts | `[set_shenquan_cuijun]`；无 |
| special · 图鉴文本 | `fusible:true`。以直截了当的重拳和逐拳蓄势见长；不把江湖夸称直接换算为固定秒杀。 |

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 开门一拳 `mv_cuijunshenquan_yiquan` | 1 | 单体·近身 | 1.10 | 7%/1/1000 | 击退 1 | ✓ | `1×(1+.12)−.05=1.07≈1.10` |
| 连环三拳 `mv_cuijunshenquan_sanquan` | 3 | 单体 n3·近身 | 1.25 | 8%/2/1000 | 三段；第三段 `bf_shiheng` 40%·1 | ✓ | `1×(1+.24+.05)−.10×.40=1.25` |
| 蓄势第四拳 `mv_cuijunshenquan_siquan` | 5 | 单体·近身·蓄招1 | 1.60 | 8%/2/1100 | `bf_pojia` 60%·2 | ✓ | `1×(1+.30+.24+.05+.07)−.10×.60=1.60` |
| 横扫千军 `mv_cuijunshenquan_cuijun` | 7 | 锥 n2·绝招 | 2.10 | 9%/绝/1200 | 击退 2；`bf_shiheng` 60%·1 | ✓ | `3×.75−.10−.10×.60=2.09≈2.10` |

| 被动 | ID | 重 | 类·乘区 | 数值摘要 |
|---|---|---:|---|---|
| 拳数扬名 | `ps_cuijunshenquan_quanshu` | 2 | stat·Z3 | 连续命中同一目标每次 +3%，至多 +9%，换目标清空 |
| 力毙牯牛 | `ps_cuijunshenquan_guniu` | 5 | stat·Z2 | 对体型大于自身者外防穿透 +5%→12% |
| 拳不虚发 | `ps_cuijunshenquan_dacheng` | 10 | trigger | 蓄招被打断时返还全部内力并获 `bf_wenzhong` 1 回合 |

### 3.11 地阶十二门总表与校验

| ID | 名称 | 归属 | 类别 | 品阶 | nature | 前置链终点 | setTags |
|---|---|---|---|---:|---|---|---|
| `sk_dajiutianshou` | 大九天手 | 明教 | 拳脚/拳掌 | 9 | yang | `sk_dafengyunfeizhang` 5重 | `set_mingjiao_guangming` |
| `sk_wuxingqizhen` | 五行旗阵 | 明教五行旗 | 杂学/阵法 | 8 | harmony | `sk_wuxingqiling` 6重 | `set_mingjiao_wuxingqi` |
| `sk_yingzhaoqinna` | 鹰爪擒拿功 | 天鹰教 | 拳脚/擒拿 | 9 | yang | `sk_yingzhaoshou` 5重 | `set_tianying_baimei` |
| `sk_emeijiuyang` | 峨眉九阳功 | 峨眉 | 内功 | 8 | yang | `sk_emeixinfa` 6重 | `set_yitian_emei` |
| `sk_wudangjiuyang` | 武当九阳功 | 武当支线 | 内功 | 8 | yang | 纯阳无极功或两仪心法 | `set_wudang_zhenwu` |
| `sk_zhengliangyi` | 正两仪剑法 | 昆仑 | 兵器/剑 | 9 | harmony | `sk_yudafeihuajian` 5重 | `set_kunlun_liangyi`、`set_liangyi_sixiang` |
| `sk_qishangquan` | 七伤拳 | 崆峒 | 拳脚/拳掌 | 9 | harmony | `sk_qishangchujue` 6重 | `set_kongtong_qishang` |
| `sk_fanliangyi` | 反两仪刀法 | 华山倚天支 | 兵器/刀 | 8 | harmony | `sk_liangyidaojia` 5重 | `set_huashan_liangyi`、`set_liangyi_sixiang` |
| `sk_babishenjian` | 八臂神剑 | 汝阳王府／方东白 | 兵器/剑 | 7 | harmony | `sk_jifengbajian` 6重 | `set_ruyang_suwei` |
| `sk_duyanfeisha` | 毒盐飞沙 | 海沙派 | 杂学/毒 | 7 | yin | `sk_yanxiaoshou` 5重 | `set_haisha_duyan` |
| `sk_fenshuiemeici` | 分水峨眉刺 | 巨鲸帮 | 兵器/奇门 | 7 | harmony | `sk_langlifenshuici` 5重 | `set_jujing_fenshui` |
| `sk_cuijunshenquan` | 摧军神拳 | 神拳门 | 拳脚/拳掌 | 7 | yang | `sk_sandieshenquan` 6重 | `set_shenquan_cuijun` |

- 地阶品级：地上 4、地中 4、地下 4，合计 12。
- 地阶类别：内功 2、拳脚 4、兵器 4、杂学 2；轻功 0、暗器 0。倚天本土最高轻功会在玄阶落为 6，不超过 `design/05` §14.6 对倚天地上 9 的上限。
- 代价／誓约／合击：`special.cost` 仅七伤拳 1 门；誓约 0；`special.combo` 0。正反两仪与旗阵只通过 09 的阵位协同，不改变这项统计。

---

## 4. 玄阶紧凑卡（36 门）

### 4.1 记法与抽样要求

每张紧凑卡仍覆盖：品阶、类别、`nature`、`wOut/wIn`、`reqs`、`layerStats` 或内功 `IP`、招式、被动、获取、`setTags`、出处。标题给出品阶、类别和 `nature`；为避免 36 张卡重复字段，`wOut/wIn` 集中登记在下表，卡内明确覆写时以卡内值为准。内功全部显式列 `meridians`。本节对带“**核算抽样**”标记的 **11/36=30.56%** 武学逐招核算，达到 AR-01 的 ≥30%；其余倍率仍依同一公式预配，数据化前由 lint 复算。

紧凑卡中的 `_短后缀` 只是排版缩写，不是可落库 ID。正式招式 ID 一律展开为 `mv_<所属武学去掉 sk_ 的主体>_<短后缀>`，被动同理展开为 `ps_<主体>_<短后缀>`；例如寒冰绵掌 `_tiezhang` 落库为 `mv_hanbingmianzhang_tiezhang`。

| 武学 ID | `nature` | `wOut/wIn` | 武学 ID | `nature` | `wOut/wIn` |
|---|---|---|---|---|---|
| `sk_guangmingxinfa` | harmony | `0/1` | `sk_shenghuoxinfa` | harmony | `0/1` |
| `sk_hanbingmianzhang` | yin | `0.35/0.65` | `sk_lieyanzhang` | yang | `0.45/0.55` |
| `sk_dafengyunfeizhang` | yang | `0.55/0.45` | `sk_wuxingqiling` | harmony | `0.65/0.35` |
| `sk_qingyifashen` | yin | `0.80/0.20` | `sk_yingzhaoshou` | yang | `0.70/0.30` |
| `sk_tianyingjian` | yang | `0.75/0.25` | `sk_haishangbufa` | harmony | `0.80/0.20` |
| `sk_emeixinfa` | harmony | `0/1` | `sk_jindingmianzhang` | harmony | `0.45/0.55` |
| `sk_piaoxuechuanyunzhang` | yin | `0.40/0.60` | `sk_jindingjiushi` | harmony | `0.60/0.40` |
| `sk_miejuejian` | yang | `0.55/0.45` | `sk_kunlunxinfa` | harmony | `0/1` |
| `sk_yudafeihuajian` | harmony | `0.55/0.45` | `sk_xunleijianfa` | yang | `0.75/0.25` |
| `sk_chuanyunbu` | harmony | `0.80/0.20` | `sk_qishangchujue` | harmony | `0.45/0.55` |
| `sk_kongtongyangshenggong` | harmony | `0/1` | `sk_kongtongjian` | yang | `0.75/0.25` |
| `sk_huashanxinfa04` | harmony | `0/1` | `sk_liangyidaojia` | harmony | `0.65/0.35` |
| `sk_yingsheshengsibo` | yin | `0.70/0.30` | `sk_huashanqinggong04` | yang | `0.85/0.15` |
| `sk_xuanmingxinfa` | yin | `0/1` | `sk_jifengbajian` | harmony | `0.75/0.25` |
| `sk_caoyuansheyi` | yang | `0.85/0.15` | `sk_yanxiaoshou` | yin | `0.75/0.25` |
| `sk_chaoxibu` | harmony | `0.80/0.20` | `sk_langlifenshuici` | harmony | `0.75/0.25` |
| `sk_fanzhougong` | yang | `0.85/0.15` | `sk_sandieshenquan` | yang | `0.80/0.20` |
| `sk_tiequanzhuang` | yang | `0/1` | `sk_tieniuyaogong` | yang | `0/1` |

### 4.2 明教、波斯总教、五行旗、法王与五散人（7 门）

#### `sk_guangmingxinfa` 光明心法（6 玄上 · 内功 · 调和）**（原创扩展）**

- 字段：`sect:sect_mingjiao`；`wOut/wIn:0/1`；`reqs {sect rank:2, prereq:[sk_shenghuotunajue≥5], hard:[sect,prereq]}`；内功 `IP=20+12+2×8+5×1.8=57`（`attrs {con:3,wil:3,wis:2}`；`stats {resMind:5,resInjury:5}`）；`meridians:[mer_chongmai]`【建议值】。
- 招式：光明护念 `_huming`（L3，自身，6%/3，`bf_dingxin` 2＋驱散1个 `mind`）；回光 `_huiguang`（L6，友方单体，8%/3，治疗18% hpMax）。被动：守明 `_shouming`（L1，resMind +4→10）；薪火 `_xinhuo`（L8，明教武学修炼 +10%）。
- 获取：明教 L2；`setTags:[set_mingjiao_guangming]`；为乾坤大挪移前置。图鉴文本：把明教戒律、静心与基础运气抽象成通用心法，原著无此正式武学名。

#### `sk_shenghuoxinfa` 圣火心法（6 玄上 · 内功 · 调和）**（原创扩展）**

- 字段：波斯总教分支；`reqs {sect rank:3, prereq:[sk_shenghuotunajue≥6], hard:[sect,prereq]}`；内功 `IP=20+12+2×8+5×1.8=57`（`attrs {agi:3,wis:3,wil:2}`；`stats {eva:6,effHit:4}`）；`meridians:[mer_daimai,mer_yangqiao]`【建议值】。
- 招式：燃心 `_ranxin`（L3，自身，7%/3，`bf_jisu` 2）；换形 `_huanxing`（L6，自身换位至3格空位，6%/2）。被动：异域步 `_yiyu`（eva +3→8）；辨刻 `_bianke`（解读圣火令谜题 `lore` 软门槛 −10）。
- 获取：波斯航线支线 `q_04_side_97`；`setTags:[set_mingjiao_shenghuo]`；为圣火令武功前置。

#### `sk_hanbingmianzhang` 寒冰绵掌（6 玄上 · 拳脚／拳掌 · 阴）——**核算抽样**

- 原著：青翼蝠王韦一笑以阴寒掌力伤人，因练功出岔须压制体内寒毒；细节**（待考）**。`reqs {attrs:{agi:42,con:38}, aptitude:{apFist:40}, sect rank:3, prereq:[sk_guangmingquan≥5], hard:[sect,prereq]}`；`layerStats {effHit:[2,6],eva:[2,4]}`；`setTags:[set_mingjiao_sida_fawang]`。
- 招式：寒绵贴掌 `_tiezhang`（L1，单体，**1.10**，7%/1/1000，`bf_hanqi` 50%·2；`1+.12+.05−.10×.50=1.12≈1.10`）；冰影掠 `_bingying`（L4，突进n3，**1.15**，7%/2，位移＋`bf_jiansu` 40%·2；`1+.24+.05−.10−.10×.40=1.15`）；寒潮 `_hanchao`（L7绝，锥n2，**2.15**，8%，`bf_handu`100%·2；`3×.75−.10=2.15`）。
- 被动：三阴受损 `_sanyin`（主运非阳／调和内功时，战后自身 `bf_hanqi` +1，原著后果玩法化）；青翼 `_qingyi`（对减速目标 Z3 +5%→12%）。获取：韦一笑羁绊；`origin:canonExpanded`。

#### `sk_lieyanzhang` 烈焰掌（5 玄中 · 拳脚／拳掌 · 阳）**（原创扩展命名）**

- 依据：紫衫龙王与明教“火”意象并不自动证明一套具名掌法；本作为法王分支补位。`reqs {sect rank:3, prereq:[sk_guangmingquan≥4], hard:[sect,prereq]}`；`layerStats {crit:[1,5],effHit:[1,5]}`；`setTags:[set_mingjiao_sida_fawang]`。
- 招式：燃掌 `_ranzhang`（L1单体1.05，6%/1，`bf_zhuoshao`40%·2）；火衣 `_huoyi`（L4自身，`bf_gongshi`2）；焰轮 `_yanlun`（L7绝，周身1.80，8%，灼烧100%·2）。被动：见火 `_jianhuo`（火场格上 hit +4→10）；炎息 `_yanxi`（热标签抵抗 +5→12）。

#### `sk_dafengyunfeizhang` 大风云飞掌（5 玄中 · 拳脚／拳掌 · 阳）

- 原著名目与彭莹玉相关说法需核对修订版**（待考）**；招名扩展。`reqs {sect rank:3, prereq:[sk_guangmingquan≥4], hard:[sect,prereq]}`；`layerStats {hit:[2,6],crit:[1,4]}`；`setTags:[set_mingjiao_guangming]`。
- 招式：风起 `_fengqi`（L1单体1.00）；云涌 `_yunyong`（L3线n2 1.00，7%/1）；惊雷五掌 `_wuzhang`（L6乱击n5 1.20，8%/2，五段）。被动：迅雷 `_xunlei`（首招收招 −30→−80）；义烈 `_yilie`（相邻友军倒地时 `bf_ruiyi`2，每战1次）。

#### `sk_wuxingqiling` 五行旗令（5 玄中 · 杂学／阵法 · 调和）**（原创扩展）**——**核算抽样**

- 字段：`reqs {skills:{formation:35}, sect rank:2, prereq:[sk_qizhenrumen≥4], hard:[sect,prereq]}`；`layerStats {hit:[1,5],resCC:[1,5]}`；`setTags:[set_mingjiao_wuxingqi]`。
- 招式：分旗 `_fenqi`（L1，友方r2，6%/3，友方 `bf_jiangu`2）；合围 `_hewei`（L3，单体 **1.35**，6%/2，目标须邻接≥2友军，`bf_suoding`50%·2；`1+.24+.15−.10×.50=1.34≈1.35`）；鸣金 `_mingjin`（L6，友方r3，6%/4，驱散1个 `cc`、后撤1格）。
- 被动：旗语 `_qiyu`（阵员 hit +2→5）；令行 `_lingxing`（阵员移动后保留1格移动力）。获取：任一旗 L2；为五行旗阵前置。

#### `sk_qingyifashen` 青翼飞身（6 玄上 · 轻功 · 阴）**（原创扩展命名）**

- 依据：韦一笑轻功卓绝为原著人物表现；无统一轻功名，故为**（原创扩展命名）**。`Q_skill=QS(6)=74`；`reqs {attrs:{agi:45}, aptitude:{apLight:42}, sect rank:3, hard:[sect]}`；`layerStats {eva:[2,6],spd:[2,4]}`；`setTags:[set_mingjiao_sida_fawang]`。
- 招式：掠影 `_lueying`（L1自身，6%/3，`bf_jisu`3）；倒挂 `_daogua`（L4后撤3格，5%/2，`bf_piaohu`2）。被动：蝠翼 `_fuyi`（跳跃 +1）；寒夜 `_hanye`（夜间 eva +3→8，昼夜归11）。本组最高轻功为玄上6，低于倚天地上9上限。

### 4.3 天鹰教（3 门）

#### `sk_yingzhaoshou` 鹰爪手（6 玄上 · 拳脚／擒拿 · 阳）——**核算抽样**

- 原著：殷天正鹰爪功表现与名目**（待考）**；作为擒拿功前段。`reqs {sect rank:2, prereq:[sk_tianyingrumenquan≥4], hard:[sect,prereq]}`；`layerStats {seal:[2,6],parry:[1,4]}`；`setTags:[set_tianying_baimei]`。
- 招式：鹰啄 `_yingzhuo`（L1单体 **1.10**，6%/1，`bf_pojia`30%；`1+.12−.10×.30=1.09≈1.10`）；拿腕 `_nawan`（L3单体 **1.05**，7%/1，`bf_fengjingmai`30%·2；`1+.12+.05−.20×.30×2=1.05`）；掠肩 `_luejian`（L6绕背，**1.00**，7%/2，绕背；`.90×1.29−.15=1.01≈1.00`）。
- 被动：利爪 `_lizhua`（对持械目标 Z3 +4%→10%）；稳拿 `_wenna`（封经命中 +5→12）。获取：天鹰 L2。

#### `sk_tianyingjian` 天鹰剑术（5 玄中 · 兵器／剑 · 阳）**（原创扩展命名）**

- 依据：天鹰教人物使用刀剑是人物行为；无可靠具名剑法，故扩展。`reqs {sect rank:2, prereq:[sk_tianyingrumenjian≥4], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {hit:[1,5],parry:[1,5]}`；`setTags:[set_tianying_baimei]`。
- 招式：振翼 `_zhenyi`（L1单体1.00）；鹰回 `_yinghui`（L3横扫0.85，6%/1）；坠空 `_zhuikong`（L6跳斩1.10，7%/2，击退1）。被动：高翔 `_gaoxiang`（高处Z7+4%→10%）；护巢 `_huchao`（相邻友军被攻时 parry +5）。

#### `sk_haishangbufa` 海上步法（4 玄下 · 轻功 · 调和）**（原创扩展）**

- `Q_skill=QS(4)=56`；`reqs {attrs:{agi:28}, aptitude:{apLight:25}, sect rank:2, hard:[sect]}`；`layerStats {eva:[1,5],spd:[1,5]}`；`setTags:[set_tianying_baimei]`。
- 招式：踏舷 `_taxian`（L1自身，5%/3，`bf_jixing`2）；借浪 `_jielang`（L4自身移2格，5%/2，水域中移3格）。被动：稳舵 `_wenduo`（水域失衡抵抗 +5→12）；鹰舟 `_yingzhou`（船战跳跃 +1）。

### 4.4 峨眉派（5 门）

#### `sk_emeixinfa` 峨眉心法（6 玄上 · 内功 · 调和）**（原创扩展命名）**

- 字段：`reqs {sect rank:2, prereq:[sk_emeitunajue≥5], hard:[sect,prereq]}`；内功 `IP=20+12+2×8+5×1.8=57`（`attrs {con:2,agi:2,wis:2,wil:2}`；`stats {resMind:5,resInjury:5}`）；`meridians:[mer_renmai]`【建议值】；`setTags:[set_yitian_emei]`。
- 招式：清心 `_qingxin`（L3自身，6%/3，`bf_qingxin`2）；金顶调息 `_tiaoxi`（L6友方单体，8%/3，治疗18%）。被动：清静 `_qingjing`（resMind+4→10）；掌剑兼修 `_jianxiu`（峨眉拳脚/剑修炼+10%）。原著有峨眉内功传统，本作总名为扩展。

#### `sk_jindingmianzhang` 金顶绵掌（5 玄中 · 拳脚／拳掌 · 调和）

- 原著武学名；具体施展人物与回目**（待考）**。`reqs {sect rank:2, prereq:[sk_emeirumenzhang≥4], hard:[sect,prereq]}`；`layerStats {parry:[2,6],hit:[1,4]}`；`setTags:[set_yitian_emei]`。
- 招式：绵掌 `_mianzhang`（L1单体1.00）；吞吐 `_tuntu`（L3单体1.15，7%/1，`bf_neijin_jiang`30%·2）；金顶佛光 `_foguang`（L6锥n2 0.95，8%/2）。被动：绵劲 `_mianjin`（招架后Z4+4%→10%）；金顶 `_jinding`（未移动时 hit+4→10）。

#### `sk_piaoxuechuanyunzhang` 飘雪穿云掌（5 玄中 · 拳脚／拳掌 · 阴）——**核算抽样**

- 原著：灭绝师太与张无忌约掌时使用此掌的情节及回目**（待考）**。`reqs {sect rank:3, prereq:[sk_jindingmianzhang≥5], hard:[sect,prereq]}`；`layerStats {crit:[1,5],eva:[1,5]}`；`setTags:[set_yitian_emei]`。
- 招式：飘雪 `_piaoxue`（L1横扫 **.85**，6%/1；`.75×1.12=.84≈.85`）；穿云 `_chuanyun`（L3直线n3远程 **.90**，7%/2；`.80×(1+.24+.05)×.85=.88≈.90`）；云雪回旋 `_huixuan`（L6周身 **.80**，7%/2，`bf_jiansu`30%·2；`.65×1.29−.10×.30=.81≈.80`）。
- 被动：雪影 `_xueying`（移动后eva+3→8）；穿云 `_chuanyunbei`（对远程目标Z3+4%→10%）。

#### `sk_jindingjiushi` 金顶九式（6 玄上 · 兵器／剑 · 调和）

- 原著武学名，赵敏曾使所学峨眉剑招的情节**（待考）**；招名除“金顶佛光”外均为**（原创扩展命名）**。`reqs {sect rank:3, prereq:[sk_emeirumenjian≥5], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {hit:[2,6],parry:[2,4]}`；`setTags:[set_yitian_emei]`。
- 招式：金顶佛光 `_foguang`（L1单体1.05，6%/1）；千峰竞秀 `_qianfeng`（L3乱击n5 1.10，7%/2）；万流归宗 `_wanliu`（L6线n3 1.05，8%/3）。被动：九式相承 `_xiangcheng`（不同招式hit+3/层，上限3）；佛光照剑 `_zhaojian`（对邪派目标Z3+5%）。

#### `sk_miejuejian` 灭剑绝剑（6 玄上 · 兵器／剑 · 阳）**（原创扩展命名）**

- 原著有“灭剑”“绝剑”两路名称并与灭绝师太相关；是否应拆为两门、招理细节**（待考）**。为控制目录，本作合为一门双姿态。`reqs {sect rank:4, prereq:[sk_jindingjiushi≥6], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {crit:[2,6],pierce:[2,4]}`；`setTags:[set_yitian_emei]`。
- 招式：灭剑 `_miejian`（L1单体1.20，7%/2，`bf_pojian`30%·2）；绝剑 `_juejian`（L4单体1.25，8%/2，不可招架）；灭绝双锋 `_shuangfeng`（L7可选绝招2.75，8%，目标已有破剑时+条件）。被动：灭邪 `_miexie`（对morality≤−20者Z3+5%→12%）；绝意 `_jueyi`（气血<40%暴击+5→12）。

### 4.5 昆仑派（4 门）

#### `sk_kunlunxinfa` 昆仑心法（5 玄中 · 内功 · 调和）**（原创扩展命名）**

- `reqs {sect rank:2, prereq:[sk_kunluntunajue≥5], hard:[sect,prereq]}`；内功 `IP=17+10+2×7+5×1.5=48.5`（`attrs {agi:2,wis:3,wil:2}`；`stats {parry:5,resCold:5}`）；`meridians:[mer_yangqiao]`【建议值】；`setTags:[set_kunlun_liangyi]`。
- 招式：雪峰运息 `_yunxi`（L3自身，6%/3，`bf_dingxin`2）；阴阳调息 `_tiaoxi`（L6自身，7%/3，驱散1个`cold/heat`）。被动：高寒 `_gaohan`（resCold+4→10）；两仪根基 `_genji`（昆仑剑修炼+10%）。

#### `sk_yudafeihuajian` 雨打飞花剑法（6 玄上 · 兵器／剑 · 调和）——**核算抽样**

- 原著：剑走斜势、间杂正势的描述及使用者**（待考）**。`reqs {sect rank:2, prereq:[sk_kunlunrumenjian≥4], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {hit:[2,6],eva:[2,4]}`；`setTags:[set_kunlun_liangyi]`。
- 招式：斜雨 `_xieyu`（L1斜十字r1 **.75**，6%/1；`.65×1.12=.73≈.75`）；飞花 `_feihua`（L3乱击n4 **1.10**，7%/2；`.85×(1+.24+.05)=1.10`）；正势一剑 `_zhengshi`（L6单体 **1.60**，8%/3，前两招均为斜势时可用；`1+.36+.10+.15=1.61≈1.60`）。
- 被动：斜中藏正 `_cangzheng`（连用两斜势后正势必中 ×1，3回合cd）；飞花不定 `_buding`（eva+3→8）。

#### `sk_xunleijianfa` 迅雷剑法（6 玄上 · 兵器／剑 · 阳）

- 原著：何足道曾以迅疾多剑交手的具体剑法名、十六剑描述与回目**（待考）**。`reqs {attrs:{agi:42}, aptitude:{apSword:42}, sect rank:3, prereq:[sk_kunlunrumenjian≥5], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {hit:[2,5],crit:[2,5]}`；`setTags:[set_kunlun_liangyi]`。
- 招式：雷动 `_leidong`（L1单体0.95，5%/0，收900）；四方雷 `_sifang`（L4乱击n4 1.10，7%/1）；十六剑 `_shiliu`（L7可选绝招2.50，8%，n16）。被动：蓄雷 `_xulei`（未移动一回合获`bf_xushi`）；迅雷 `_xunlei`（本功收招−20→−70）。

#### `sk_chuanyunbu` 穿云步（4 玄下 · 轻功 · 调和）**（原创扩展命名）**

- 原著是否有“穿云”正式轻功名**（待考）**；本作按昆仑高山身法命名。`Q_skill=QS(4)=56`；`reqs {attrs:{agi:28}, aptitude:{apLight:25}, sect rank:2, hard:[sect]}`；`layerStats {eva:[1,5],jump:[0,1]}`；`setTags:[set_kunlun_liangyi]`。
- 招式：穿云 `_chuanyun`（L1自身，5%/3，`bf_jixing`2）；折峰 `_zhefeng`（L4突进至3格空位，5%/2）。被动：高原步 `_gaoyuan`（攀坡体力−10%→25%）；云隙 `_yunxi`（高处eva+3→8）。

### 4.6 崆峒派（3 门）

#### `sk_qishangchujue` 七伤初诀（6 玄上 · 拳脚／拳掌 · 调和）**（原创扩展）**——**核算抽样**

- 依据：七伤拳总纲的人身阴阳五行理念为原著；安全拆练的“初诀”是玩法扩展。`reqs {sect rank:2, prereq:[sk_kongtongrumenquan≥4], hard:[sect,prereq]}`；`layerStats {pierce:[2,6],resInjury:[2,4]}`；`setTags:[set_kongtong_qishang]`。
- 招式：刚劲 `_gangjin`（L1单体 **1.10**，6%/1；`1+.12=1.12≈1.10`）；柔劲 `_roujin`（L3单体 **1.15**，7%/1，`bf_jiansu`40%·2；`1+.12+.05−.10×.40=1.13≈1.15`）；吞吐 `_tuntu`（L6线n2 **1.10**，8%/2，击退1；`.85×(1+.24+.10)−.05=1.09≈1.10`）。
- 被动：五行养脏 `_yangzang`（resInjury+4→10）；知伤 `_zhishang`（自身有injury时不再获得增伤，而是效果抵抗+10，避免鼓励自残）。

#### `sk_kongtongyangshenggong` 崆峒养生功（5 玄中 · 内功 · 调和）**（原创扩展）**

- `reqs {sect rank:2, prereq:[sk_kongtongtunajue≥5], hard:[sect,prereq]}`；内功 `IP=17+10+2×7+5×1.5=48.5`（`attrs {con:3,wil:3,wis:1}`；`stats {resInjury:10}`）；`meridians:[mer_renmai,mer_chongmai]`【建议值】；`setTags:[set_kongtong_qishang]`。
- 招式：养脏 `_yangzang`（L3自身，6%/3，驱散1个`injury`）；调五行 `_tiaowuxing`（L6自身，7%/3，`bf_huichun`3）。被动：先养后伤 `_xianyang`（七伤类自伤概率−10%）；固本 `_guben`（治疗接受+4%→10%）。

#### `sk_kongtongjian` 崆峒剑术（4 玄下 · 兵器／剑 · 阳）**（原创扩展）**

- `reqs {sect rank:2, prereq:[sk_kongtongrumenjian≥4], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {parry:[1,5],hit:[1,5]}`；`setTags:[set_kongtong_qishang]`。
- 招式：问道 `_wendao`（L1单体1.00）；盘峰 `_panfeng`（L3横扫.85，6%/1）；崆峒落日 `_luori`（L6线n2 1.05，7%/2）。被动：守山 `_shoushan`（未移动parry+3→8）；剑护五脏 `_huwuzang`（装配时resInjury+5）。

### 4.7 华山派（倚天支，4 门）

#### `sk_huashanxinfa04` 华山心法（5 玄中 · 内功 · 调和）**（原创扩展命名）**

- 仅指倚天支，不证明与后世气宗心法连续。`reqs {sect rank:2, prereq:[sk_huashantunajue04≥5], hard:[sect,prereq]}`；内功 `IP=17+10+2×7+5×1.5=48.5`（`attrs {con:2,str:2,agi:2,wil:1}`；`stats {parry:5,resCC:5}`）；`meridians:[mer_daimai]`【建议值】；`setTags:[set_huashan_liangyi]`。
- 招式：抱元 `_baoyuan`（L3自身，6%/3，`bf_wenzhong`2）；阴阳回转 `_huizhuan`（L6自身，7%/3，驱散1个`weaken`）。被动：险峰立 `_xianfeng`（高处parry+3→8）；刀剑同门 `_daojian`（倚天支刀剑修炼+10%）。

#### `sk_liangyidaojia` 两仪刀架（6 玄上 · 兵器／刀 · 调和）**（原创扩展）**——**核算抽样**

- `reqs {sect rank:2, prereq:[sk_huashanrumendao04≥4], hard:[sect,prereq]}`；`weaponReq blade`；`layerStats {parry:[2,6],hit:[2,4]}`；`setTags:[set_huashan_liangyi]`。
- 招式：阳劈 `_yangpi`（L1单体 **1.10**，6%/1；`1+.12=1.12≈1.10`）；阴扫 `_yinsao`（L3横扫 **.90**，7%/1；`.75×(1+.12+.05)=.88≈.90`）；互易 `_huyi`（L6换位单体 **.95**，7%/2；`.85×1.29−.15=.95`）。
- 被动：阴阳架 `_yinyangjia`（奇数回合parry+5，偶数回合hit+5）；反仪根基 `_genji`（反两仪刀法修炼+15%）。

#### `sk_yingsheshengsibo` 鹰蛇生死搏（6 玄上 · 拳脚／擒拿 · 阴）

- 原著：鲜于通以一手鹰抓、一手蛇头器械施展华山绝技；七十二路等细节**（待考）**。本作以拳脚/擒拿归类，扇柄蛇头为表现道具。`reqs {sect rank:4, prereq:[sk_huashanrumenquan04≥5], hard:[sect,prereq]}`；`layerStats {seal:[2,6],crit:[2,4]}`；`setTags:[set_huashan_liangyi]`。
- 招式：鹰抓 `_yingzhua`（L1单体1.10，`bf_fengjingmai`30%）；蛇啄 `_shezhuo`（L3单体1.10，`bf_zhongdu`1层，需毒针道具）；鹰蛇并搏 `_bingbo`（L6乱击n4 1.20）；生死搏 `_shengsi`（L7可选绝招2.60，封经50%）。被动：双路 `_shuanglu`（两招交替hit+10）；毒心 `_duxin`（对中毒目标Z3+5%→12%）。

#### `sk_huashanqinggong04` 华山险径身法（4 玄下 · 轻功 · 阳）**（原创扩展）**

- `Q_skill=QS(4)=56`；`reqs {attrs:{agi:28}, aptitude:{apLight:25}, sect rank:2, hard:[sect]}`；`layerStats {eva:[1,5],jump:[0,1]}`；`setTags:[set_huashan_liangyi]`。
- 招式：踏栈 `_tazhan`（L1自身，5%/3，`bf_jixing`2）；猿渡 `_yuandu`（L4跳至3格空位，5%/2）。被动：险径 `_xianjing`（窄道移动体力−15%）；临崖 `_linya`（邻悬崖时eva+3→8）。

### 4.8 玄冥二老与汝阳王府（3 门）

#### `sk_xuanmingxinfa` 玄冥心法（6 玄上 · 内功 · 阴）**（原创扩展命名）**

- 原著有玄冥神掌与阴寒内力表现，未见独立心法名。`reqs {attrs:{con:40,wil:40}, aptitude:{apInner:42}, hard:[]}`；内功 `IP=20+12+2×8+5×1.8=57`（`attrs {con:3,wil:3,agi:2}`；`stats {effHit:5,resCold:5}`）；`meridians:[mer_yinwei,mer_yinqiao]`【建议值】；`setTags:[set_xuanming]`。
- 招式：玄寒 `_xuanhan`（L3自身，6%/3，下一掌效果命中+15）；凝霜 `_ningshuang`（L6区域自周身，7%/4，敌人`bf_hanqi`1层）。被动：寒脉 `_hanmai`（cold抵抗+4→10）；双老 `_shuanglao`（另一装配者2格内mpRegen+0.5pp）。为玄冥神掌前置。

#### `sk_jifengbajian` 疾风八剑（6 玄上 · 兵器／剑 · 调和）**（原创扩展命名）**——**核算抽样**

- 依据：方东白出剑快、似有多臂的原著人物表现；无正式剑谱名。`reqs {sect rank:3, prereq:[sk_suweijianfa≥4], hard:[sect,prereq]}`；`weaponReq sword`；`layerStats {hit:[2,6],crit:[2,4]}`；`setTags:[set_ruyang_suwei]`。
- 招式：疾刺 `_jici`（L1单体 **.90**，5%/0/900；`1−.05−.07=.88≈.90`）；八影 `_baying`（L4乱击n8 **1.00**，7%/1；`.85×(1+.12+.05)=.995≈1.00`）；骤雨 `_zhouyu`（L6锥n2 **1.00**，8%/2；`.75×(1+.24+.10)=1.005≈1.00`）。
- 被动：八臂影 `_duobiying`（不同目标命中后下一招hit+3/层）；疾风 `_jifeng`（收招−20→−70）。

#### `sk_caoyuansheyi` 草原射艺（5 玄中 · 暗器／暗器 · 阳）**（原创扩展命名）**

- 依据：汝阳王府神箭八雄及蒙古军射术为人物／军旅表现；武学总名为扩展。`reqs {attrs:{agi:35}, aptitude:{apHidden:38}, sect rank:2, hard:[sect]}`；`layerStats {hit:[2,6],crit:[1,4]}`；`setTags:[set_ruyang_suwei]`。弓箭按裁定 C16 归 `hidden/hidden`，不占兵器携带栏。
- 招式：骑射 `_qishe`（L1直线首中，投射1.00，6%/1）；连珠 `_lianzhu`（L3乱击n3，投射1.05，7%/2）；落雁 `_luoyan`（L6单体投射1.20，8%/3，对高处/飞跃目标必中×1）。被动：控弦 `_kongxian`（射程+1）；逐风 `_zhufeng`（移动≥2格后射击hit+4→10）。

### 4.9 海沙派（2 门）

#### `sk_yanxiaoshou` 盐枭手（5 玄中 · 拳脚／擒拿 · 阴）**（原创扩展）**——**核算抽样**

- `reqs {sect rank:2, prereq:[sk_haishaduanquan≥4], hard:[sect,prereq]}`；`layerStats {seal:[1,5],eva:[1,5]}`；`setTags:[set_haisha_duyan]`。
- 招式：扣腕 `_kouwan`（L1单体 **1.05**，6%/1，`bf_fengjingmai`30%·1；`1+.12−.20×.30=1.06≈1.05`）；抹盐 `_moyan`（L3单体 **1.20**，7%/1，目标已有流血时追加中毒1层；`1+.12+.05+.15−.10=1.22≈1.20`）；脱身 `_tuoshen`（L6绕背 **1.00**，7%/2；`.90×1.29−.15=1.01≈1.00`）。
- 被动：盐枭 `_yanxiao`（中毒目标eva判定收益+5）；短打 `_duanda`（贴身时parry+3→8）。

#### `sk_chaoxibu` 潮汐步（4 玄下 · 轻功 · 调和）**（原创扩展）**

- `Q_skill=QS(4)=56`；`reqs {attrs:{agi:26}, aptitude:{apLight:24}, sect rank:2, hard:[sect]}`；`layerStats {eva:[1,6],spd:[1,4]}`；`setTags:[set_haisha_duyan]`。
- 招式：逐潮 `_zhuchao`（L1自身，5%/3，`bf_jisu`2）；退潮 `_tuichao`（L4后撤2格，5%/2）。被动：盐滩 `_yantan`（浅水、滩涂移动消耗−20%）；潮退 `_chaotui`（后撤后eva+5一回合）。

### 4.10 巨鲸帮（2 门）

#### `sk_langlifenshuici` 浪里分水刺（5 玄中 · 兵器／奇门 · 调和）**（原创扩展命名）**

- 依据：巨鲸帮少帮主使用分水峨眉刺及水战情节**（待考）**。`reqs {sect rank:2, prereq:[sk_fenshuiduanci≥4], hard:[sect,prereq]}`；`weaponReq {category:exotic,kinds:[emeici]}`；`layerStats {hit:[1,5],parry:[1,5]}`；`setTags:[set_jujing_fenshui]`。
- 招式：破浪 `_polang`（L1单体1.00）；双分水 `_shuangfenshui`（L3穿透1.00，7%/1）；浪回 `_langhui`（L6回旋每程.85，7%/2）。被动：浪里 `_langli`（水域hit+4→10）；双刺 `_shuangci`（招架后下一击crit+5）。

#### `sk_fanzhougong` 翻舟功（4 玄下 · 轻功 · 阳）**（原创扩展）**——**核算抽样（支援/位移）**

- `Q_skill=QS(4)=56`；`reqs {attrs:{agi:25,str:25}, aptitude:{apLight:24}, sect rank:2, hard:[sect]}`；`layerStats {eva:[1,5],jump:[0,1]}`；`setTags:[set_jujing_fenshui]`。
- 招式：踏桅 `_tawei`（L1自身，5%/3，`bf_tengyue`2；支援移动）；翻舟 `_fanzhou`（L4换位1–2格，5%/2，无伤害；换位价值0.15，以一次行动为成本）；落水不惊 `_bujing`（L6自身，5%/3，驱散`bf_shiheng`并获`bf_wenzhong`2）。
- 被动：船稳 `_chuanwen`（船面/浮台失衡抵抗+5→12）；水落 `_shuiluo`（落水体力损耗−20%）。

### 4.11 神拳门（3 门）

#### `sk_sandieshenquan` 三叠神拳（6 玄上 · 拳脚／拳掌 · 阳）——**核算抽样**

- 依据：掌门以“三拳”或“四拳”绰号见诸版本资料，准确字样**（待考）**；“三叠神拳”为**（原创扩展命名）**。`reqs {sect rank:2, prereq:[sk_shenquanrumen≥4], hard:[sect,prereq]}`；`layerStats {crit:[2,6],hit:[2,4]}`；`setTags:[set_shenquan_cuijun]`。
- 招式：第一拳 `_yi`（L1单体 **1.10**，6%/1；`1+.12=1.12≈1.10`）；第二拳 `_er`（L3单体 **1.30**，7%/1，前招命中条件；`1+.12+.05+.15=1.32≈1.30`）；第三拳 `_san`（L6单体 **1.45**，8%/2，前两招命中条件、击退1；`1+.24+.10+.15−.05=1.44≈1.45`）。
- 被动：叠劲 `_diejin`（连拳每段Z3+3%，至多2层）；断连 `_duanlian`（被控制则清空，下一回合获`bf_wenzhong`1）。

#### `sk_tiequanzhuang` 铁拳桩（5 玄中 · 内功 · 阳）**（原创扩展）**

- `reqs {sect rank:2, prereq:[sk_shenquanrumen≥5], hard:[sect,prereq]}`；内功 `IP=17+10+2×7+5×1.5=48.5`（`attrs {con:3,str:3,wil:1}`；`stats {defOut:5,resCC:5}`）；`meridians:[mer_dumai]`【建议值】；`setTags:[set_shenquan_cuijun]`。
- 招式：站桩 `_zhanzhuang`（L3自身，6%/3，`bf_wenzhong`3）；沉肩 `_chenjian`（L6自身，7%/3，`bf_xushi`2）。被动：拳架 `_quanjia`（拳脚伤害Z3+3%→8%）；根稳 `_genwen`（击退距离−1，最低0）。

#### `sk_tieniuyaogong` 铁牛腰功（4 玄下 · 内功 · 阳）**（原创扩展）**

- `reqs {sect rank:1, prereq:[sk_shenquanrumen≥4], hard:[sect,prereq]}`；内功 `IP=14+8+2×6+5×1.5=41.5`（`attrs {con:3,str:2,wil:1}`；`stats {resCC:6,defOut:4}`）；`meridians:[mer_daimai]`【建议值】；`setTags:[set_shenquan_cuijun]`。
- 招式：沉腰 `_chenyao`（L3自身，5%/3，`bf_jiangu`2）；扛撞 `_kangzhuang`（L6自身架势，6%/3，被近战命中反击.8倍）。被动：牛力 `_niuli`（str+2→5）；腰马 `_yaoma`（撞击伤害承受−10%→25%）。

---

## 5. 黄阶一行条目（36 门）

> 每行都是一门可学武学。`前置` 中 L1–L5 是门派抽象职级，不是武学层数；“无”表示该武学正是进阶链起点。除标为原著名者外，名称、招式拆分与投放均为原创扩展。

| ID | 名称 | 门派／来源 | 类别（品阶·nature） | 原生书界 | 核心效果（含 `setTags`） | 前置 | 出处或标注 |
|---|---|---|---|---|---|---|---|
| `sk_shenghuotunajue` | 圣火吐纳诀 | 明教 | 内功（3 黄上·harmony） | 倚天 | IP `10+6+2×4+5×1.2=30`；`mer_daimai`；调息驱散1个`mind`；`set_mingjiao_shenghuo` | L1 | **（原创扩展）** |
| `sk_guangmingquan` | 光明拳 | 明教 | 拳脚/拳掌（3 黄上·yang） | 倚天 | 单体正拳、低血时命中；`set_mingjiao_guangming` | L1；无武学前置 | **（原创扩展）** |
| `sk_mingjiaoduanjian` | 明教短剑 | 明教 | 兵器/剑（2 黄中·harmony） | 倚天 | 贴身快刺、侧击；`weaponReq:sword`；`set_mingjiao_shenghuo` | L1 | **（原创扩展）** |
| `sk_guangmingduandao` | 光明短刀 | 明教 | 兵器/刀（2 黄中·yang） | 倚天 | 横扫与断后；`weaponReq:blade`；`set_mingjiao_guangming` | L1 | **（原创扩展）** |
| `sk_qizhenrumen` | 旗阵入门 | 明教五行旗 | 杂学/阵法（3 黄上·harmony） | 倚天 | 单旗号令、友方 `bf_jiangu`；`skills.formation:15`；`set_mingjiao_wuxingqi` | L1 | **（原创扩展）** |
| `sk_shenghuobu` | 圣火步 | 波斯总教 | 轻功（3 黄上·harmony） | 倚天 | `Q_skill=QS(3)=45`，侧移后`bf_piaohu`；`set_mingjiao_shenghuo` | L2 | **（原创扩展）** |
| `sk_ruijinduanfu` | 锐金短飞斧 | 明教锐金旗 | 暗器（2 黄中·yang） | 倚天 | 投射破甲、耗短斧弹药；`set_mingjiao_wuxingqi` | L2 | 原著有锐金旗专门军战与投掷兵械印象，器械细节**（待考）**；武学名**（原创扩展命名）** |
| `sk_tianyingrumenquan` | 天鹰入门拳 | 天鹰教 | 拳脚/拳掌（2 黄中·yang） | 倚天 | 基础抓打、对持械目标命中；`set_tianying_baimei` | L1；无武学前置 | **（原创扩展）** |
| `sk_tianyingrumenjian` | 天鹰入门剑 | 天鹰教 | 兵器/剑（2 黄中·yang） | 倚天 | 自上而下劈刺；`weaponReq:sword`；`set_tianying_baimei` | L1 | **（原创扩展）** |
| `sk_tianyingduandao` | 天鹰短刀 | 天鹰教 | 兵器/刀（3 黄上·yang） | 倚天 | 船战近身、击退1；`weaponReq:blade`；`set_tianying_baimei` | L2；天鹰入门拳3重 | **（原创扩展）** |
| `sk_emeitunajue` | 峨眉吐纳诀 | 峨眉 | 内功（3 黄上·harmony） | 倚天 | IP 30；`mer_renmai`；疗伤受益；`set_yitian_emei` | L1 | **（原创扩展）** |
| `sk_emeirumenzhang` | 峨眉入门掌 | 峨眉 | 拳脚/拳掌（2 黄中·harmony） | 倚天 | 绵掌、招架后回手；`set_yitian_emei` | L1；无武学前置 | **（原创扩展）** |
| `sk_emeirumenjian` | 峨眉入门剑 | 峨眉 | 兵器/剑（2 黄中·harmony） | 倚天 | 守中刺、回锋；`weaponReq:sword`；`set_yitian_emei` | L1；无武学前置 | **（原创扩展）** |
| `sk_liuxujian` | 柳絮剑法 | 峨眉 | 兵器/剑（3 黄上·yin） | 倚天 | 连绵守势、`parry`成长；`set_yitian_emei` | L2；峨眉入门剑4重 | 原著武学名与具体出处**（待考）** |
| `sk_emeishenfa` | 峨眉身法 | 峨眉 | 轻功（3 黄上·harmony） | 倚天 | `Q_skill=QS(3)=45`，后撤后`bf_piaohu`；`set_yitian_emei` | L2 | 原著有门派身法表现，正式名称未见；**（原创扩展命名）** |
| `sk_kunluntunajue` | 昆仑吐纳诀 | 昆仑 | 内功（3 黄上·harmony） | 倚天 | IP 30；`mer_yangqiao`；抗寒；`set_kunlun_liangyi` | L1 | **（原创扩展）** |
| `sk_kunlunrumenjian` | 昆仑入门剑 | 昆仑 | 兵器/剑（3 黄上·harmony） | 倚天 | 正斜两路基础；`weaponReq:sword`；`set_kunlun_liangyi` | L1；无武学前置 | **（原创扩展）** |
| `sk_kunlunchangquan` | 昆仑长拳 | 昆仑 | 拳脚/拳掌（2 黄中·yang） | 倚天 | 高原长桥发力、击退1；`set_kunlun_liangyi` | L1；无武学前置 | **（原创扩展）** |
| `sk_kunlunshenshu` | 昆仑山术 | 昆仑 | 轻功（3 黄上·harmony） | 倚天 | `Q_skill=QS(3)=45`，雪坡体力消耗降低；`set_kunlun_liangyi` | L2 | **（原创扩展）** |
| `sk_kongtongtunajue` | 崆峒吐纳诀 | 崆峒 | 内功（3 黄上·harmony） | 倚天 | IP 30；`mer_chongmai`；`resInjury`；`set_kongtong_qishang` | L1 | **（原创扩展）** |
| `sk_kongtongrumenquan` | 崆峒入门拳 | 崆峒 | 拳脚/拳掌（3 黄上·yang） | 倚天 | 刚柔两式、七伤链起点；`set_kongtong_qishang` | L1；无武学前置 | **（原创扩展）** |
| `sk_kongtongrumenjian` | 崆峒入门剑 | 崆峒 | 兵器/剑（2 黄中·yang） | 倚天 | 山门守剑、招架；`weaponReq:sword`；`set_kongtong_qishang` | L1 | **（原创扩展）** |
| `sk_huashantunajue04` | 华山吐纳诀（倚天） | 华山倚天支 | 内功（3 黄上·harmony） | 倚天 | IP 30；`mer_daimai`；立足险峰；`set_huashan_liangyi` | L1 | **（原创扩展）**；后缀04区分同门跨代资料 |
| `sk_huashanrumenquan04` | 华山入门拳（倚天） | 华山倚天支 | 拳脚/拳掌（2 黄中·yang） | 倚天 | 鹰蛇链起点；`set_huashan_liangyi` | L1；无武学前置 | **（原创扩展）** |
| `sk_huashanrumenjian04` | 华山入门剑（倚天） | 华山倚天支 | 兵器/剑（2 黄中·harmony） | 倚天 | 险峰守中；`weaponReq:sword`；`set_huashan_liangyi` | L1；无武学前置 | **（原创扩展）**；不等同笑傲华山剑法 |
| `sk_huashanrumendao04` | 华山入门刀（倚天） | 华山倚天支 | 兵器/刀（3 黄上·harmony） | 倚天 | 高低刀架、反两仪链起点；`weaponReq:blade`；`set_huashan_liangyi` | L1；无武学前置 | **（原创扩展）** |
| `sk_suweijianfa` | 宿卫剑法 | 汝阳王府 | 兵器/剑（3 黄上·harmony） | 倚天 | 守门快剑、八臂链起点；`weaponReq:sword`；`set_ruyang_suwei` | L1；无武学前置 | **（原创扩展）** |
| `sk_wangfuchangquan` | 王府长拳 | 汝阳王府 | 拳脚/拳掌（2 黄中·yang） | 倚天 | 宿卫制敌、援护友军；`set_ruyang_suwei` | L1；无武学前置 | **（原创扩展）** |
| `sk_beidiqubu` | 北地趋步 | 汝阳王府 | 轻功（3 黄上·yang） | 倚天 | `Q_skill=QS(3)=45`，骑战下马不失衡；`set_ruyang_suwei` | L2 | **（原创扩展）** |
| `sk_haishaduanquan` | 海沙短拳 | 海沙派 | 拳脚/拳掌（2 黄中·yin） | 倚天 | 贴身抢手、盐枭链起点；`set_haisha_duyan` | L1；无武学前置 | **（原创扩展）** |
| `sk_sayanfa` | 撒盐法 | 海沙派 | 暗器（3 黄上·yin） | 倚天 | 单体投盐，`bf_shimang`低概率；`set_haisha_duyan` | L2；`skills.poi:10` | 原著有毒盐手段，武学化为**（原创扩展）** |
| `sk_yanxiaoduanren` | 盐枭短刃 | 海沙派 | 兵器/刀（2 黄中·yin） | 倚天 | 对中毒目标命中；`weaponReq:blade`；`set_haisha_duyan` | L1 | **（原创扩展）** |
| `sk_fenshuiduanci` | 分水短刺 | 巨鲸帮 | 兵器/奇门（3 黄上·harmony） | 倚天 | 峨眉刺入门、破浪；`weaponReq:exotic(emeici)`；`set_jujing_fenshui` | L1；无武学前置 | 原著有人使用分水峨眉刺，套路名**（原创扩展命名）**，细节**（待考）** |
| `sk_jujingduanquan` | 巨鲸短拳 | 巨鲸帮 | 拳脚/拳掌（2 黄中·yang） | 倚天 | 船舱短打、击退抗性；`set_jujing_fenshui` | L1；无武学前置 | **（原创扩展）** |
| `sk_chuanbangbu` | 船帮步 | 巨鲸帮 | 轻功（2 黄中·harmony） | 倚天 | `Q_skill=QS(2)=38`，船面移动不滑；`set_jujing_fenshui` | L1 | **（原创扩展）** |
| `sk_shenquanrumen` | 神拳入门 | 神拳门 | 拳脚/拳掌（3 黄上·yang） | 倚天 | 直拳、站桩、三叠链起点；`set_shenquan_cuijun` | L1；无武学前置 | **（原创扩展）** |

### 5.1 黄阶整体预算核对

- **攻击招基线**：25 门含攻击招的黄阶武学，其入门攻击统一从“单体、近身、5% MPREF、cd0、收招1000、可招架、无附带”起配，故 `1.00×(1+0)×1×1=1.00`；横扫基线 `.75`、线2基线 `.85`、投射基线 `.92`。有击退、封穴、失明等效果时按 §0.2 扣除，所有计划倍率落在 `0.70–1.20`。
- **支援／移动基线**：11 门以吐纳、旗令、医术、暗器准备或纯身法为主的条目允许 `power:0`；黄阶单体治疗不超过 `18% hpMax`，增益不超过2回合，位移不超过2格。
- **内功**：5 门黄上内功均用同一精确配法 `mpMaxPct10 + hpMaxPct6 + attrs4×2 + mpRegen1.2×5 = 30`，`stats≤6`，逐门 `nature` 与 `meridians` 已列。
- **轻功上限**：黄上身法 `Q_skill=45`、黄中船帮步 `Q_skill=38`，均远低于倚天书界允许的最高地上，且不替代 `design/08` 的门禁定义。

---

## 6. 门派五级授艺、进阶链与门内搭配

> 本节落实 AR-07。称谓是 `design/17` 尚未存在时的【建议值】，这里只列各级**新增可学**武学；贡献、月钱、配给、师门商店和晋升任务由 `design/16` 定义。表内“私传”仍须满足条目卡的属性、资质与武学前置，职级本身不替代硬前置。

### 6.1 明教、波斯总教与五行旗 `sect_mingjiao`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门教众 | `sk_shenghuotunajue`、`sk_guangmingquan`、`sk_mingjiaoduanjian`、`sk_guangmingduandao`、`sk_qizhenrumen` | 五行旗弟子从旗阵入门起步；普通教众可在拳、短刀、短剑中任选，不强迫全学 |
| L2 | 入门教众 | `sk_guangmingxinfa`、`sk_wuxingqiling`、`sk_shenghuobu`、`sk_ruijinduanfu` | 波斯支线只在取得总教信物后开放圣火步；锐金飞斧只授锐金旗 |
| L3 | 亲传／旗弟子 | `sk_shenghuoxinfa`、`sk_hanbingmianzhang`、`sk_lieyanzhang`、`sk_dafengyunfeizhang`、`sk_qingyifashen` | 法王武学分别走人物羁绊，不因职位一次解锁；五散人线可授大风云飞掌 |
| L4 | 护法／掌旗使 | `sk_dajiutianshou`、`sk_wuxingqizhen`、`sk_shenghuoling` | 圣火令还需波斯航线译读；五行旗阵需五位掌旗使共同考校 |
| L5 | 教主 | `sk_qiankun` | 镇教心法；非明教角色只走张无忌私传的 `reqsOverride` |

**进阶与搭配**：主线为 `sk_guangmingquan(4) → sk_dafengyunfeizhang(5) → sk_dajiutianshou`；内功线为 `sk_shenghuotunajue(5) → sk_guangmingxinfa(8) → sk_qiankun`；旗阵线为 `sk_qizhenrumen(4) → sk_wuxingqiling(6) → sk_wuxingqizhen`。推荐装配“乾坤主运＋光明心法辅运｜大九天手｜明教短刀｜青翼飞身｜五行旗阵”，覆盖主运、拳脚、兵器、轻功、杂学五栏。

波斯总教的独立链为 `sk_shenghuotunajue(6) → sk_shenghuoxinfa(6) → sk_shenghuoling`；本土角色可用圣火步补轻功。四大法王候选组合不设一个虚构的统一师门秘籍，只以 `set_mingjiao_sida_fawang` 聚合寒冰绵掌、烈焰掌与青翼飞身。

### 6.2 天鹰教 `sect_tianyingjiao`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外堂教众 | `sk_tianyingrumenquan`、`sk_tianyingrumenjian` | 陆上与舟上均可取得，至少任选其一 |
| L2 | 入门教众 | `sk_tianyingduandao`、`sk_yingzhaoshou`、`sk_tianyingjian`、`sk_haishangbufa` | 鹰爪手走拳线；天鹰剑术走剑线；海上步法无兵器前置 |
| L3 | 香主／亲传 | 无新增普授；允许把鹰爪手、天鹰剑术练至 10 重 | 用“深化旧艺”留出职级节奏，不凭空增武学 |
| L4 | 堂主／长老 | `sk_yingzhaoqinna` | 殷天正亲传或殷野王授艺；前者可满 10 重 |
| L5 | 教主 | 无新增普授；开放掌门考校与跨入明教剧情 | 天鹰教并回明教后的身份映射由 `design/17` 决定 |

**硬链**：`sk_tianyingrumenquan(4) → sk_yingzhaoshou(5) → sk_yingzhaoqinna`。推荐装配“外来或明教内功｜鹰爪擒拿功｜天鹰剑术＋天鹰短刀｜海上步法”，同一 `set_tianying_baimei` 让拳、剑、刀、轻功均能计件。

### 6.3 峨眉派 `sect_emei` 与武当九阳支

| 级 | 建议称谓 | 峨眉本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门弟子 | `sk_emeitunajue`、`sk_emeirumenzhang`、`sk_emeirumenjian` | 入门同时给拳、剑两种起点，玩家不必先选死路线 |
| L2 | 入门弟子 | `sk_liuxujian`、`sk_emeishenfa`、`sk_emeixinfa`、`sk_jindingmianzhang` | 吐纳、掌、剑各有一条自然升级线 |
| L3 | 亲传／闭门弟子 | `sk_piaoxuechuanyunzhang`、`sk_jindingjiushi`、`sk_emeijiuyang` | 九阳支仍需峨眉心法 6 重；非所有亲传自动获得 |
| L4 | 长老／首座 | `sk_miejuejian` | 以金顶九式 6 重为硬前置 |
| L5 | 掌门 | 无新增普授；可将灭剑绝剑、峨眉九阳功授至 10 重 | 掌门权只改变授艺上限，不制造新武学 |

**硬链**：内功 `sk_emeitunajue(5) → sk_emeixinfa(6) → sk_emeijiuyang`；拳掌 `sk_emeirumenzhang(4) → sk_jindingmianzhang(5) → sk_piaoxuechuanyunzhang`；剑线 `sk_emeirumenjian(5) → sk_jindingjiushi(6) → sk_miejuejian`。其中满足硬约束的“黄→玄→地”取内功线。推荐装配“峨眉九阳主运＋峨眉心法辅运｜飘雪穿云掌｜金顶九式／灭剑绝剑｜峨眉身法”，成员均登记 `set_yitian_emei`。

武当主体五级授艺引用 `catalog/skills-daojia`，本文只在其 L3 增补 `sk_wudangjiuyang`；其二选一前置为 `sk_chunyangwuji(5)` **或** `sk_liangyixinfa(7)`，使用 C17 的 `anyOf`，不得被实现成两门皆需。

### 6.4 昆仑派 `sect_kunlun`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门弟子 | `sk_kunluntunajue`、`sk_kunlunrumenjian`、`sk_kunlunchangquan` | 剑为主线，长拳保证入门拳脚覆盖 |
| L2 | 入门弟子 | `sk_kunlunshenshu`、`sk_kunlunxinfa`、`sk_yudafeihuajian`、`sk_chuanyunbu` | 山术是黄阶基础轻功，穿云步为进阶轻功 |
| L3 | 亲传弟子 | `sk_xunleijianfa` | 何足道传承细节**（待考）**；作为高速剑分支 |
| L4 | 长老／执事 | `sk_zhengliangyi` | 雨打飞花剑法 5 重后方可学 |
| L5 | 掌门 | 无新增普授；开放正两仪完整六十四变 | 与华山协同不等于向华山传剑 |

**硬链**：`sk_kunlunrumenjian(4) → sk_yudafeihuajian(5) → sk_zhengliangyi`。推荐装配“昆仑心法｜昆仑长拳｜正两仪剑法＋迅雷剑法｜穿云步”；`set_kunlun_liangyi` 是本门组合，`set_liangyi_sixiang` 则只连接正两仪与华山反两仪。

### 6.5 崆峒派 `sect_kongtong`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门弟子 | `sk_kongtongtunajue`、`sk_kongtongrumenquan`、`sk_kongtongrumenjian` | 吐纳用于先固脏腑，拳为七伤线起点 |
| L2 | 入门弟子 | `sk_qishangchujue`、`sk_kongtongyangshenggong`、`sk_kongtongjian` | 初诀仍不产生完整七伤拳的高额自伤 |
| L3 | 亲传弟子 | 无新增普授；完成“先养后伤”考校 | 养生功未达门槛时 UI 明示风险，不暗中放宽 |
| L4 | 长老／五老门下 | `sk_qishangquan` | 初诀 6 重为硬前置，代价规则引用 05 §9.1.1 |
| L5 | 掌门 | 无新增普授；可授七伤拳至 10 重 | 谢逊拳谱属于旁路，不归门派职级奖励 |

**硬链**：`sk_kongtongrumenquan(4) → sk_qishangchujue(6) → sk_qishangquan`。推荐装配“崆峒养生功｜七伤拳｜崆峒剑术”，并以吐纳诀或初诀凑 `set_kongtong_qishang`；这套搭配降低风险但不删除七伤代价。

### 6.6 华山派（倚天支）`sect_huashan`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门弟子 | `sk_huashantunajue04`、`sk_huashanrumenquan04`、`sk_huashanrumenjian04`、`sk_huashanrumendao04` | 后缀 `04` 只区分倚天时代资料，不进入 UI 名称 |
| L2 | 入门弟子 | `sk_huashanxinfa04`、`sk_liangyidaojia`、`sk_huashanqinggong04` | 刀线承担反两仪主链，剑线提供装配补位 |
| L3 | 亲传弟子 | 无新增普授；两仪刀架可练至 10 重 | 不把后世气宗／剑宗武学倒灌到倚天 |
| L4 | 长老／掌门亲传 | `sk_yingsheshengsibo`、`sk_fanliangyi` | 鹰蛇生死搏走拳线；反两仪走刀线 |
| L5 | 掌门 | 无新增普授；开放两仪化四象协同考校 | 四象协同引用 09，不在本门造“合击武学” |

**硬链**：`sk_huashanrumendao04(4) → sk_liangyidaojia(5) → sk_fanliangyi`。推荐装配“华山心法｜鹰蛇生死搏｜反两仪刀法＋华山入门剑｜华山险径身法”；所有本门成员以 `set_huashan_liangyi` 闭合。

### 6.7 汝阳王府 `sect_ruyangwangfu` 与玄冥传承

| 级 | 建议称谓 | 王府本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外府宿卫 | `sk_suweijianfa`、`sk_wangfuchangquan` | 只表示玩家可走的王府客卿线，不改写其政治身份 |
| L2 | 入府高手 | `sk_beidiqubu`、`sk_caoyuansheyi` | 射艺归暗器栏，弓不触发 `dualWield` |
| L3 | 亲卫／客卿 | `sk_jifengbajian` | 宿卫剑法 4 重为硬前置 |
| L4 | 长老级客卿 | `sk_babishenjian` | 既可由王府功勋授艺，也可走方东白羁绊旁路 |
| L5 | 首席客卿 | 无新增普授；允许八臂神剑至 10 重 | 王府不拥有玄冥传承的普授权 |

**王府硬链**：`sk_suweijianfa(4) → sk_jifengbajian(6) → sk_babishenjian`；推荐装配“外来内功｜王府长拳｜八臂神剑｜北地趋步｜草原射艺”，以 `set_ruyang_suwei` 聚合。

玄冥二老另走人物传承，不套王府职级：`sk_xuanmingxinfa(7) → sk_xuanming`。二者均登记 `set_xuanming`；“双煞”只奖励双人阴寒压迫，不把玄冥神掌本身改成合击。

### 6.8 海沙派 `sect_haisha`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外堂帮众 | `sk_haishaduanquan`、`sk_yanxiaoduanren` | 入门拳为主链起点，短刃提供兵器栏补位 |
| L2 | 正式帮众 | `sk_sayanfa`、`sk_yanxiaoshou`、`sk_chaoxibu` | 撒盐法另需 `skills.poi:10` 技艺门槛 |
| L3 | 香主 | 无新增普授；开放毒盐材料配给资格 | 材料价格与配给留给 16／10，本节不定数值 |
| L4 | 长老 | `sk_duyanfeisha` | 盐枭手 5 重为硬前置 |
| L5 | 帮主 | 无新增普授；毒盐飞沙可练至 10 重 | 缴获配方旁路最高 8 重 |

**硬链**：`sk_haishaduanquan(4) → sk_yanxiaoshou(5) → sk_duyanfeisha`。推荐装配“外来内功｜盐枭手｜盐枭短刃｜潮汐步｜毒盐飞沙”，全员登记 `set_haisha_duyan`。

### 6.9 巨鲸帮 `sect_jujing`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外堂帮众 | `sk_fenshuiduanci`、`sk_jujingduanquan`、`sk_chuanbangbu` | 奇门刺、拳、轻功三栏同时有基础课 |
| L2 | 正式帮众 | `sk_langlifenshuici`、`sk_fanzhougong` | 分水刺需前置；翻舟功可独立学习 |
| L3 | 舵主／亲传 | 无新增普授；完成水战考校 | 水下呼吸与游泳境界仍服从 08 |
| L4 | 长老 | `sk_fenshuiemeici` | 浪里分水刺 5 重为硬前置 |
| L5 | 帮主 | 无新增普授；分水峨眉刺可练至 10 重 | 王盘山遗谱旁路最高 8 重 |

**硬链**：`sk_fenshuiduanci(4) → sk_langlifenshuici(5) → sk_fenshuiemeici`。推荐装配“外来内功｜巨鲸短拳｜分水峨眉刺｜翻舟功”，全部登记 `set_jujing_fenshui`。

### 6.10 神拳门 `sect_shenquan`

| 级 | 建议称谓 | 本级新增可学 | 授艺边界 |
|---:|---|---|---|
| L1 | 外门弟子 | `sk_shenquanrumen`、`sk_tieniuyaogong` | 铁牛腰功需入门拳 4 重，不是入门即送 |
| L2 | 入门弟子 | `sk_sandieshenquan`、`sk_tiequanzhuang` | 三叠拳 4 重前置；铁拳桩 5 重前置 |
| L3 | 亲传弟子 | 无新增普授；完成连拳与站桩考校 | 以深化两条玄阶线承接节奏 |
| L4 | 长老 | `sk_cuijunshenquan` | 三叠神拳 6 重为硬前置 |
| L5 | 掌门 | 无新增普授；摧军神拳可练至 10 重 | 王盘山残谱旁路最高 8 重 |

**硬链**：`sk_shenquanrumen(4) → sk_sandieshenquan(6) → sk_cuijunshenquan`。推荐装配“铁拳桩主运＋铁牛腰功辅运｜摧军神拳”，三门核心与入门拳均登记 `set_shenquan_cuijun`；本门无原创兵器套路，兵器栏由倚天本土通行武学补齐。

### 6.11 五级授艺约束核对

| 检查项 | 结论 |
|---|---|
| 五级完整性 | 10 个可加入组织均列 L1–L5；无新增武学的层级明确写“无新增普授”，没有用虚构秘籍填格 |
| 入门拳或剑 | 明教拳；天鹰拳／剑；峨眉掌／剑；昆仑剑／拳；崆峒拳／剑；华山拳／剑；王府拳／剑；海沙拳；巨鲸拳；神拳门拳，全部黄阶 |
| 黄→玄→地 | 10 组织各至少 1 条，见 §1.3 与本节逐门硬链；明教另有内功与旗阵链 |
| 五级与 reqs | L1–L5 是授艺资格；条目卡中的 `attrs`、`aptitude`、`skills`、`prereq` 仍独立判定 |
| 资源边界 | 本文未定义月钱、禄米、兵器、毒盐包价格或师门商店；全部交 `design/16`／`design/10` |

---

## 7. 套装候选（交 `design/07` 定稿）

> 本节只冻结候选 ID、成员与主题，不定义 2／3／4 件数值。计件、有效品阶中位数与最终效果服从裁定 C22 和 `design/07`。`SetDef.members` 与各条目的 `setTags` 必须双向闭合；表中的“本文成员”都已在 §2–§5 反向登记。跨组成员只列已有 ID，需归属图鉴补反向标签。

| 候选套装 | ID | 本文成员 | 跨组成员／装备候选 | 主题与边界 |
|---|---|---|---|---|
| 光明圣火 | `set_mingjiao_guangming` | `sk_qiankun`、`sk_dajiutianshou`、`sk_guangmingxinfa`、`sk_dafengyunfeizhang`、`sk_guangmingquan`、`sk_guangmingduandao` | `sk_jiuyang` 仅为待 05／07 决定的候选，不先计件 | 阳劲、守明与挪移；即使将来纳入九阳，也只表示剧情人物可用，不表示明教拥有真经 |
| 波斯圣火 | `set_mingjiao_shenghuo` | `sk_shenghuoling`、`sk_shenghuoxinfa`、`sk_shenghuotunajue`、`sk_mingjiaoduanjian`、`sk_shenghuobu` | 圣火令 `eq_shenghuoling`（`design/10` 既有） | 贴地、换位、异域诡变；装备不是施展武学的硬门槛 |
| 五行旗 | `set_mingjiao_wuxingqi` | `sk_wuxingqizhen`、`sk_wuxingqiling`、`sk_qizhenrumen`、`sk_ruijinduanfu` | 五色令旗装备由 `design/10` 决定 | 站位、军阵与旗令；完整五旗专能引用 `design/09` |
| 四大法王 | `set_mingjiao_sida_fawang` | `sk_hanbingmianzhang`、`sk_lieyanzhang`、`sk_qingyifashen` | `sk_shizihou`（少林图鉴，谢逊来源） | 冰、火、身法、音功四种风格；不是四人强制合击 |
| 白眉天鹰 | `set_tianying_baimei` | `sk_yingzhaoqinna`、`sk_yingzhaoshou`、`sk_tianyingjian`、`sk_haishangbufa`、`sk_tianyingrumenquan`、`sk_tianyingrumenjian`、`sk_tianyingduandao` | 无 | 擒拿、扑击与海舟作战 |
| 倚天·峨眉 | `set_yitian_emei` | `sk_emeijiuyang`、`sk_emeixinfa`、`sk_jindingmianzhang`、`sk_piaoxuechuanyunzhang`、`sk_jindingjiushi`、`sk_miejuejian`、`sk_emeitunajue`、`sk_emeirumenzhang`、`sk_emeirumenjian`、`sk_liuxujian`、`sk_emeishenfa` | `design/10` 既有候选：倚天剑 `eq_yitianjian`、峨眉铁指环 `eq_tiezhihuan`、九阴真经 `sk_jiuyin`；正式成员交 `design/07` 定稿 | 掌剑轮转、护心与决绝剑意；保留既有“九阴速成代价减轻”主题边界 |
| 昆仑两仪 | `set_kunlun_liangyi` | `sk_zhengliangyi`、`sk_kunlunxinfa`、`sk_yudafeihuajian`、`sk_xunleijianfa`、`sk_chuanyunbu`、`sk_kunluntunajue`、`sk_kunlunrumenjian`、`sk_kunlunchangquan`、`sk_kunlunshenshu` | 无 | 正斜剑势与高寒身法 |
| 两仪化四象 | `set_liangyi_sixiang` | `sk_zhengliangyi`、`sk_fanliangyi` | 无 | 跨昆仑、华山的协同标签；允许单人装配，不计 `special.combo` |
| 崆峒七伤 | `set_kongtong_qishang` | `sk_qishangquan`、`sk_qishangchujue`、`sk_kongtongyangshenggong`、`sk_kongtongjian`、`sk_kongtongtunajue`、`sk_kongtongrumenquan`、`sk_kongtongrumenjian` | 无 | “先养后伤”，套装不可删除七伤拳的明示代价 |
| 华山两仪 | `set_huashan_liangyi` | `sk_fanliangyi`、`sk_huashanxinfa04`、`sk_liangyidaojia`、`sk_yingsheshengsibo`、`sk_huashanqinggong04`、`sk_huashantunajue04`、`sk_huashanrumenquan04`、`sk_huashanrumenjian04`、`sk_huashanrumendao04` | 无 | 高低刀架、鹰蛇双路；只代表倚天时代华山 |
| 玄冥二老 | `set_xuanming` | `sk_xuanming`、`sk_xuanmingxinfa` | `design/10` 既有候选：鹿杖 `eq_luzhang`、鹤笔 `eq_hebi`（二选一计 1 件）；正式成员交 `design/07` 定稿 | 阴寒叠层与双人压迫；二老同场是加成条件而非施放门槛 |
| 王府宿卫 | `set_ruyang_suwei` | `sk_babishenjian`、`sk_jifengbajian`、`sk_caoyuansheyi`、`sk_suweijianfa`、`sk_wangfuchangquan`、`sk_beidiqubu` | 无 | 快剑、护卫与骑射 |
| 海沙毒盐 | `set_haisha_duyan` | `sk_duyanfeisha`、`sk_yanxiaoshou`、`sk_chaoxibu`、`sk_haishaduanquan`、`sk_sayanfa`、`sk_yanxiaoduanren` | 毒盐包物品 ID 交 `design/10` | 滩涂机动、迷眼与毒盐耗材 |
| 巨鲸分水 | `set_jujing_fenshui` | `sk_fenshuiemeici`、`sk_langlifenshuici`、`sk_fanzhougong`、`sk_fenshuiduanci`、`sk_jujingduanquan`、`sk_chuanbangbu` | 分水峨眉刺装备 ID 交 `design/10` | 舟船、水边、短刺与稳身 |
| 神拳摧军 | `set_shenquan_cuijun` | `sk_cuijunshenquan`、`sk_sandieshenquan`、`sk_tiequanzhuang`、`sk_tieniuyaogong`、`sk_shenquanrumen` | 无 | 连拳、站桩、蓄势与抗击退 |

### 7.1 跨组双向登记清单

| 跨组候选 | 本文已登记 | 对方须同步 |
|---|---|---|
| 真武七侠 `set_wudang_zhenwu` | `sk_wudangjiuyang` | 道家图鉴的成员表已经列入本条；`design/07` 建唯一 `SetDef` |
| 光明圣火 `set_mingjiao_guangming` | 本文除九阳外 6 门成员 | `design/05` 的 `sk_jiuyang.setTags` 当前为空；07 若正式纳入九阳，05 同步反向标签，否则从候选成员删除 |
| 四大法王 `set_mingjiao_sida_fawang` | 寒冰绵掌、烈焰掌、青翼飞身 | 少林图鉴的 `sk_shizihou` 补该 `setTags`，但仅谢逊来源计主题，不改变武学唯一归属 |
| 倚天·峨眉 `set_yitian_emei` | 本文 11 门峨眉成员 | 既有候选还含 `sk_jiuyin`、`eq_yitianjian`、`eq_tiezhihuan`；07 统一正式成员后，由五绝图鉴与 10 补齐反向标签 |
| 玄冥二老 `set_xuanming` | `sk_xuanming`、新成员 `sk_xuanmingxinfa` | 既有候选还含 `eq_luzhang`／`eq_hebi` 二选一计件；07 定稿后由 10 补齐装备反向标签 |

九阳全本、少林九阳、武当九阳、峨眉九阳之间的血缘使用 `lg_jiuyang` 与条目内 synergy 表达，**不另建**“三元九阳”套装，以避免要求少林条目新增一个未裁定的 `setTags`。

### 7.2 套装可达性抽样

| 场景 | 可达成员 | 结论 |
|---|---|---|
| 倚天明教线 | 光明拳＋光明心法＋大风云飞掌＋大九天手，后期再加乾坤 | `set_mingjiao_guangming` 从黄、玄、地逐档成长，天阶不是起套硬门槛 |
| 倚天峨眉线 | 峨眉吐纳＋入门掌＋入门剑，随后心法／金顶绵掌／金顶九式 | `set_yitian_emei` 在 L1 已可 3 件，路线成长不依赖倚天剑 |
| 非门派小帮会线 | 海沙、巨鲸、神拳均由黄阶起点＋玄阶中段＋地阶终点组成 | 不靠跨界携带即可达 3 件；最终数值仍由 07 控制 |
| 跨派两仪 | 正两仪＋反两仪 | 只需 2 件触发协同候选；不会因缺四名玩家而禁用单门武学 |

---

## 8. 本组统计

### 8.1 组织／传承 × 大阶

| 组织／传承 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 九阳真经全本 | 1 | 0 | 0 | 0 | 1 |
| 明教与波斯总教、五行旗 | 2 | 2 | 7 | 7 | 18 |
| 天鹰教 | 0 | 1 | 3 | 3 | 7 |
| 峨眉派 | 0 | 1 | 5 | 5 | 11 |
| 武当九阳支 | 0 | 1 | 0 | 0 | 1 |
| 昆仑派 | 0 | 1 | 4 | 4 | 9 |
| 崆峒派 | 0 | 1 | 3 | 3 | 7 |
| 华山派（倚天支） | 0 | 1 | 4 | 4 | 9 |
| 玄冥二老／汝阳王府 | 1 | 1 | 3 | 3 | 8 |
| 海沙派 | 0 | 1 | 2 | 3 | 6 |
| 巨鲸帮 | 0 | 1 | 2 | 3 | 6 |
| 神拳门 | 0 | 1 | 3 | 1 | 5 |
| **合计** | **4** | **12** | **36** | **36** | **88** |

比例为 `4:12:36:36 = 1:3:9:9`，精确符合 AR-01；本文没有敌人专用武学，故“总条目”和“玩家可学条目”均为 88。

### 8.2 类别 × 大阶

| 大类 | 天 | 地 | 玄 | 黄 | 合计 |
|---|---:|---:|---:|---:|---:|
| 内功 | 2 | 2 | 9 | 5 | **18** |
| 拳脚 | 2 | 4 | 10 | 10 | **26** |
| 兵器 | 0 | 4 | 9 | 13 | **26** |
| 轻功 | 0 | 0 | 6 | 5 | **11** |
| 暗器 | 0 | 0 | 1 | 2 | **3** |
| 杂学 | 0 | 2 | 1 | 1 | **4** |
| **合计** | **4** | **12** | **36** | **36** | **88** |

类别口径：`sk_caoyuansheyi` 依 C16 计暗器；`sk_wuxingqizhen`、`sk_wuxingqiling`、`sk_qizhenrumen` 计杂学／阵法；`sk_duyanfeisha` 计杂学／毒；分水峨眉刺两级与分水短刺均计兵器／奇门。

### 8.3 十二级品阶与阴阳属性

| 品阶 | 1 黄下 | 2 黄中 | 3 黄上 | 4 玄下 | 5 玄中 | 6 玄上 | 7 地下 | 8 地中 | 9 地上 | 10 天下 | 11 天中 | 12 天上 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 门数 | 0 | 16 | 20 | 7 | 13 | 16 | 4 | 4 | 4 | 2 | 1 | 1 |

- `nature` 统计：阳 33、阴 12、调和 43，合计 88。所有 18 门内功都显式标 `nature`；非内功也统一登记，便于相性与套装筛选。
- 天阶四门为天上 1、天中 1、天下 2；均逐项来自基准 §13。地阶各品 4／4／4，玄阶 7／13／16，黄阶 0／16／20。
- 玄阶逐招核算 11 门，`11÷36=30.56%≥30%`；黄阶按 §5.1 统一核算，不要求逐招表。

### 8.4 约束统计

| 项 | 本组结果 | 验收口径 |
|---|---|---|
| 天阶新增 | 0 | 四门均为基准 §13 既有 ID |
| 地阶代价型 | 1：`sk_qishangquan` | `1/12=8.33%` 的单文件离散例外；按 AR-01 全局约 153 门地阶计，贡献 `1/153≈0.65%`，见 §0.5 |
| 地阶誓约型 | 0 | `0%≤5%` |
| 地阶强制多人合击 | 0 | `0%≤3%`；两仪、旗阵均可单人使用 |
| 敌人专用 | 0 | 无 `enemyOnly:true`，无额外不计数表 |
| 新 Buff | 0 | 所有 `bf_*` 都须命中 06 目录或裁定 A5 |
| 轻功最高品阶 | 玄上 6：`sk_qingyifashen` | 不超过倚天允许的地上 9；本组不重复定义武当地上轻功 `sk_tiyunzong` |

---

## 9. 境界覆盖与装配可行性

### 9.1 倚天本组本土三类清单

本图鉴所有 88 门均原生于 `ch04_yitian`。对核心装配三类按唯一 ID 计数：内功 18、拳脚 26、兵器 26，均远高于 `design/05` §14.6 的每类至少 3 门。以下不是只报总数，而是列出前两幕即可安排的三组同类路径；具体任务顺序由 `chapters/04` 定稿。

| 核心类别 | 至少三门本土可学例 | 最早来源建议 | 对补齐装配栏的证明 |
|---|---|---|---|
| 内功 | `sk_shenghuotunajue`、`sk_emeitunajue`、`sk_kunluntunajue`、`sk_kongtongtunajue`、`sk_huashantunajue04` | 各门派 L1；未入派玩家可通过短期授艺／秘籍旁路取得其中至少 3 门**（原创扩展）** | 即使只携带 1 门内功，仍有 ≥3 本土候选补满内功 3 栏 |
| 拳脚 | `sk_guangmingquan`、`sk_tianyingrumenquan`、`sk_emeirumenzhang`、`sk_kunlunchangquan`、`sk_kongtongrumenquan`、`sk_wangfuchangquan` | 山门、王盘山与王府支线的黄阶入门授艺 | 即使只携带 1 门拳脚，仍有 ≥3 本土候选补满拳脚 3 栏 |
| 兵器（同类剑） | `sk_mingjiaoduanjian`、`sk_tianyingrumenjian`、`sk_emeirumenjian`、`sk_kunlunrumenjian`、`sk_kongtongrumenjian`、`sk_huashanrumenjian04`、`sk_suweijianfa` | 山门访学、王府宿卫与剧情观摩旁路；至少三条不能互斥**（原创扩展）** | 同为剑类，装备一柄剑即可在 3 个兵器武学栏间切换；不是“剑刀奇门各一门”的伪覆盖 |

倚天是高武书界，入场携带上限本为 `3/3/3`，理论上无需补栏；上表仍满足更严的 `1/1/1` 压力测试，保证洗点、空栏开局、无携带挑战或未来复用时不被门派互斥卡死。为使“至少三条不能互斥”真正成立，`chapters/04` 必须给上述基础吐纳、入门拳与剑安排访学、抄录或观摩来源；拜师只决定效率和满层上限，不能让全部基础来源互斥。

### 9.2 装配样例

| 时点 | 内功 3 栏（主＋辅2） | 拳脚 3 栏 | 兵器 3 栏 | 非核心栏 | 可行性 |
|---|---|---|---|---|---|
| 入界零携带压力测试 | 圣火吐纳、峨眉吐纳、昆仑吐纳 | 光明拳、峨眉入门掌、昆仑长拳 | 明教短剑、峨眉入门剑、昆仑入门剑 | 圣火步；旗阵入门 | 15 门均为本土黄阶，需章节保证三路基础授艺可兼得 |
| 明教中期 | 光明心法主运＋圣火吐纳＋外来携带 | 大风云飞掌＋光明拳＋外来携带 | 明教短刀＋明教短剑＋外来携带 | 青翼飞身、五行旗令 | 不要求先拿天阶即可补满 |
| 峨眉中期 | 峨眉心法主运＋峨眉吐纳＋外来携带 | 金顶绵掌＋飘雪穿云掌＋外来携带 | 金顶九式＋柳絮剑法＋峨眉入门剑 | 峨眉身法 | 单门派可补拳、剑与内功；剑类共用主武器 |
| 倚天后期混搭 | 九阳主运＋乾坤／峨眉九阳辅运 | 玄冥神掌＋七伤拳＋鹰爪擒拿功 | 正两仪剑＋八臂神剑＋反两仪刀 | 青翼飞身、草原射艺、五行旗阵 | 只示可装配，不表示一周目可同时取得；天级仍受 `design/02` 取得预算 |

### 9.3 书界品阶占比校核

- **本图鉴自身**：`4/88=4.55%` 天、`12/88=13.64%` 地、`36/88=40.91%` 玄、`36/88=40.91%` 黄。这是 AR-01 指定的单组比例，不等同整个倚天可习得池目标。
- **全倚天池**：裁定 `rulings-v1` §3.6 已给汇总目标 `12/27/40/41=120`，对应 `10.00%/22.50%/33.33%/34.17%`，逐档命中高武 `10–15/20–25/30–35/30–35%`。该表采用本组旧配额 `4/12/17/17`；AR-01 把本文扩到 `4/12/36/36` 后，若 19+19 全作为新增唯一 ID 而不对其他图鉴重分配，临时总池会成为 `12/27/59/60=158`，即 `7.59/17.09/37.34/37.97%`，不再命中目标。
- **执行结论**：本文完成作者要求的 88 门定义库；全局整合代理 C3 必须将新增 38 门视为对倚天池配额的重分配依据，调整旧图鉴复现／通行池或更新高武占比目标，不能在本文件私自删除作者指定比例。详见 §12.3 提案 P-2。

### 9.4 轻功与敌用边界

- 本组可学轻功 11 门：玄上 1、玄下 5、黄上 4、黄中 1；最高 `sk_qingyifashen` 为玄上 6。倚天全池另有道家图鉴 `sk_tiyunzong`；当前归属图鉴定为地中 8，仍不超过 05 §14.6 所列“最高允许地上 9”。`design/08` 的旧“地上 9”登记须同步为 catalog 定稿值，或由 C3 明确另择一门倚天原生轻功达到上限；本文件不越权重复定义。
- 所有轻功的 `Q_skill` 都引用 `design/03` §4.5：`QS(2)=38`、`QS(3)=45`、`QS(4)=56`、`QS(6)=74`。
- 本文没有只给敌人使用的隐藏武学。玄冥神掌、八臂神剑、毒盐飞沙等虽然常由敌对 NPC 使用，但均存在可验证的羁绊、门派或缴获来源，不能标 `enemyOnly:true`。

---

## 10. 本文新增术语与 ID

### 10.1 武学 ID

本文定义 88 门武学。其中 9 个 ID 在上游已被基准、裁定、05 或 09 点名，本文负责定稿或摘要：

`sk_jiuyang`、`sk_qiankun`、`sk_xuanming`、`sk_shenghuoling`、`sk_qishangquan`、`sk_wuxingqizhen`、`sk_zhengliangyi`、`sk_fanliangyi`、`sk_wudangjiuyang`。

其余 **79 个本文新增武学 ID** 按类别列出：

| 类别 | 数量 | 新 ID |
|---|---:|---|
| 内功 | 15 | `sk_guangmingxinfa` `sk_shenghuoxinfa` `sk_emeijiuyang` `sk_emeixinfa` `sk_kunlunxinfa` `sk_kongtongyangshenggong` `sk_huashanxinfa04` `sk_xuanmingxinfa` `sk_tiequanzhuang` `sk_tieniuyaogong` `sk_shenghuotunajue` `sk_emeitunajue` `sk_kunluntunajue` `sk_kongtongtunajue` `sk_huashantunajue04` |
| 拳脚 | 23 | `sk_dajiutianshou` `sk_yingzhaoqinna` `sk_cuijunshenquan` `sk_hanbingmianzhang` `sk_lieyanzhang` `sk_dafengyunfeizhang` `sk_yingzhaoshou` `sk_jindingmianzhang` `sk_piaoxuechuanyunzhang` `sk_kunlunchangquan` `sk_qishangchujue` `sk_yingsheshengsibo` `sk_yanxiaoshou` `sk_sandieshenquan` `sk_guangmingquan` `sk_tianyingrumenquan` `sk_emeirumenzhang` `sk_kongtongrumenquan` `sk_huashanrumenquan04` `sk_wangfuchangquan` `sk_haishaduanquan` `sk_jujingduanquan` `sk_shenquanrumen` |
| 兵器 | 24 | `sk_babishenjian` `sk_fenshuiemeici` `sk_tianyingjian` `sk_jindingjiushi` `sk_miejuejian` `sk_yudafeihuajian` `sk_xunleijianfa` `sk_kongtongjian` `sk_liangyidaojia` `sk_jifengbajian` `sk_langlifenshuici` `sk_mingjiaoduanjian` `sk_guangmingduandao` `sk_tianyingrumenjian` `sk_tianyingduandao` `sk_emeirumenjian` `sk_liuxujian` `sk_kunlunrumenjian` `sk_kongtongrumenjian` `sk_huashanrumenjian04` `sk_huashanrumendao04` `sk_suweijianfa` `sk_yanxiaoduanren` `sk_fenshuiduanci` |
| 轻功 | 11 | `sk_qingyifashen` `sk_haishangbufa` `sk_chuanyunbu` `sk_huashanqinggong04` `sk_chaoxibu` `sk_fanzhougong` `sk_shenghuobu` `sk_emeishenfa` `sk_kunlunshenshu` `sk_beidiqubu` `sk_chuanbangbu` |
| 暗器 | 3 | `sk_caoyuansheyi` `sk_ruijinduanfu` `sk_sayanfa` |
| 杂学 | 3 | `sk_duyanfeisha` `sk_wuxingqiling` `sk_qizhenrumen`（`sk_wuxingqizhen` 为 09 既有建议 ID，不计新增） |

> 上表按 ID 数组计数为 `15+23+24+11+3+3=79`；加上 9 个上游已点名 ID，本文定义总数为 88。

### 10.2 招式、被动、套装与其他 ID

| 类型 | 数量 | 说明 |
|---|---:|---|
| 完整卡招式 `mv_*` | 64 | 天阶 17、地阶 47；均写完整 ID 与逐招核算。玄阶紧凑卡用所属武学前缀加文内 `_后缀` 生成正式 ID，数据化时不得只保存短后缀 |
| 完整卡被动 `ps_*` | 56 | 天阶 19、地阶 37；玄阶同样按 `ps_<武学拼音>_<后缀>` 展开 |
| 套装候选 `set_*` | 13 个本文新候选＋3 个既有候选引用 | 本文 §7 共列 15 个倚天候选，另引用未在该表重复列出的 `set_wudang_zhenwu`；其中 `set_yitian_emei`、`set_xuanming` 复用 10 的既有 ID |
| 同源组 | 1 | `lg_jiuyang`（上游既有）：九阳全本与三派九阳的同源、残承及 synergy |
| 经脉预留 | 8 | `mer_renmai` `mer_dumai` `mer_chongmai` `mer_daimai` `mer_yinqiao` `mer_yangqiao` `mer_yinwei` `mer_yangwei`；待 `design/15` 定稿 |
| 任务占位 | 19 个唯一 ID | `q_04_qiyu_91` 沿用 05；其余本文暂用 `q_04_faction_86`–`97`、`q_04_bond_94`–`98`、`q_04_main_96`、`q_04_side_94`–`97` 等，存在同后缀不同类别并不冲突；由 `chapters/04` 统一正式编号 |
| 新 Buff | 0 | 正文使用的 37 个 `bf_*` 均在 `design/06` 目录中；无需向 06 提新 Buff |

### 10.3 门派 ID 与名称对齐清单

`design/17` 尚不存在。本文供其对齐的可加入组织共 10 个：

| ID | 显示名 | 时代／分支备注 |
|---|---|---|
| `sect_mingjiao` | 明教 | 包含中土明教、五行旗；波斯总教用分支字段，不另造 sect |
| `sect_tianyingjiao` | 天鹰教 | 倚天前中期；并回明教后的身份映射待 17 |
| `sect_emei` | 峨眉派 | 倚天 |
| `sect_kunlun` | 昆仑派 | 倚天 |
| `sect_kongtong` | 崆峒派 | 倚天 |
| `sect_huashan` | 华山派 | `branch:yitian`；不另造 `sect_huashan04` |
| `sect_ruyangwangfu` | 汝阳王府 | 玩家以宿卫／客卿线加入；玄冥二老仍为人物传承 |
| `sect_haisha` | 海沙派 | 倚天小帮会 |
| `sect_jujing` | 巨鲸帮 | 倚天小帮会 |
| `sect_shenquan` | 神拳门 | 倚天小帮会 |

另引用 `sect_wudang`，但武当主体归道家图鉴；九阳真经全本与玄冥二老以 `sect:null + lineage` 表达。

---

## 11. 数据校验规则与测试用例

### 11.1 构建期校验

| # | 规则 | 级别 |
|---|---|---|
| YT-V01 | 本文件计数恰为天／地／玄／黄 `4/12/36/36`，总计 88；`enemyOnly:true` 另计 | 失败 |
| YT-V02 | `grade≥10` 的 ID 集合恰为 `{sk_jiuyang,sk_qiankun,sk_xuanming,sk_shenghuoling}`，且品阶、类别、原生书界与基准 §13 完全一致 | 失败 |
| YT-V03 | `id` 全局唯一；旧 ID 命中裁定重命名表则失败；本文新 ID 不得与其他图鉴定义冲突 | 失败 |
| YT-V04 | `category/subType/nature/wOut/wIn` 合法；每个 `category:inner` 必有 `nature∈{yin,yang,harmony}`、`inner.contribution`，IP 与 05 §5.5 同品阶预算差 ≤5% | 失败 |
| YT-V05 | `reqs.skills` 键只允许 C17 十项技艺；`prereq.anyOf` 至少两项、无嵌套／重复／自依赖；`hard` 只能引用存在的条件路径 | 失败 |
| YT-V06 | 每招按 05 §4.2 重算后与 `power` 差 ≤0.05；支援招为 0；绝招需气势100、首个绝招解锁≤7重 | 失败 |
| YT-V07 | 所有 `bf_*` 必须存在于 06 目录或裁定 A5；本文当前期望集合大小 37、新 Buff 数 0 | 失败 |
| YT-V08 | 每个可加入组织至少有黄阶拳或剑、至少一条黄→玄→地硬链、至少一个闭合 `setTags` | 失败 |
| YT-V09 | `SetDef.members` 与武学／装备 `setTags` 双向等价；跨组成员可在整库阶段校验，未同步前报带归属文件的错误 | 失败 |
| YT-V10 | 玄阶抽样逐招核算比例 ≥30%；本文应为 `11/36`；黄阶仅要求整体预算模板通过 | 失败 |
| YT-V11 | 倚天本土可学的内功、拳脚、兵器各至少 3 门，并存在至少三门同类兵器的非互斥来源路径 | 失败 |
| YT-V12 | 本组最高轻功不得高于地上9；实际应为玄上6；`Q_skill` 必须等于 03 §4.5 的 `QS(grade)` | 失败 |
| YT-V13 | 地阶代价／誓约与强制多人合击按 AR-01 的全图鉴约 153 门地阶池分别 ≤5%／≤3%；单文件离散例外单列报表 | 失败／报表 |
| YT-V14 | `origin:expanded`／原创命名必须在描述出现对应标注；`canonRef` 不得包含未经核准的伪引文或杜撰回目 | 失败 |
| YT-V15 | 黄阶表 36 行且列数固定为 8；完整卡 Markdown 表列数一致；代码围栏成对；无空句、截断表行和占位词 | 失败 |

### 11.2 最小测试用例

| 用例 | 输入／操作 | 预期 |
|---|---|---|
| T-YT-01 封闭天阶 | 加入 `sk_test_tian` grade10 | YT-V02 失败，指出不在基准 §13 |
| T-YT-02 比例 | 删除任一黄阶行 | YT-V01／YT-V15 同时失败，得到 4/12/36/35 |
| T-YT-03 OR 前置真 | 武当身份，`sk_chunyangwuji` 5重、无两仪心法，尝试武当九阳 | 前置通过；只要求 `anyOf` 一支 |
| T-YT-04 OR 前置假 | 武当身份，两支均未达层数 | 前置失败，UI 同列两条可选路径 |
| T-YT-05 技艺门槛 | 海沙 L2、`poi=9` 学撒盐法；再将 `poi=10` | 首次以效率惩罚通过软门槛，第二次无惩罚；不得把 `poi` 拼作 `poison` |
| T-YT-06 七伤代价 | 七伤拳 5重、主运玄阶内功；重复出招 | 按 05 §9.1.1 叠 `bf_qishang`；不会因套装直接免除 |
| T-YT-07 九阳克寒 | 九阳 6重承受同阶玄冥寒毒 | 按 05／06 的品阶判定免疫；低于门槛时正常施加 |
| T-YT-08 挪移防循环 | 同一伤害链同时触发乾坤与斗转 | 只选一次 `redirect/mirror`，不得递归；二者可同时装配 |
| T-YT-09 单人两仪 | 单人装配正两仪或反两仪，不带搭档 | 武学及全部基础招可用；只缺少 09 的夹持／四象协同 |
| T-YT-10 弓箭归栏 | 装配草原射艺并持弓，`dualWield=0` | 占暗器栏、不占兵器携带栏；不能因双持装备获得互搏 |
| T-YT-11 轻功底值 | 10重圣火步、穿云步、青翼飞身 | `Q_skill` 分别为45、56、74 |
| T-YT-12 套装双向 | 从 `set_mingjiao_guangming.members` 删除光明拳而保留其 `setTags` | YT-V09 失败，报告双向不闭合 |
| T-YT-13 入界补栏 | 以 1/1/1 携带模拟进入倚天，枚举非互斥前两幕来源 | 三类均至少再取得2门；剑类至少3门共用同一武器类别 |
| T-YT-14 原著标注 | 扫描含“待考”的条目并移除标记但仍无确切出处 | YT-V14 失败或人工审校阻断 |
| T-YT-15 敌人专用 | 将玄冥神掌改 `enemyOnly:true` 但保留学习来源 | YT-V01／来源一致性失败 |

### 11.3 人工审校清单

1. 逐个核对 §12.4 的原著名目，不以网络百科替代三联／广州修订版原文。
2. 核查玄阶未逐招展示的 25 门在数据化时是否完整展开所有 `mv_*`、`ps_*`，并逐招跑预算 lint。
3. 核查 `chapters/04` 的基础授艺路线是否真正非互斥，尤其入界零携带压力测试。
4. 核查 `design/07` 的套装成员是否与 §7 双向一致，不在两处分别维护奖励数值。
5. 核查 `design/15` 正式经脉枚举后八个预留 ID 是否需迁移。

---

## 12. 待决事项 / 依赖

### 12.1 替下游给出的建议值

| # | 下游归属 | 建议值 | 本文处理 |
|---|---|---|---|
| D-1 | `design/15` | 内功专精经脉暂用奇经八脉 ID：`mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_yinqiao`、`mer_yangqiao`、`mer_yinwei`、`mer_yangwei` | 已逐门登记；只作为 AR-03 接口，不定义穴位或收益 |
| D-2 | `design/17` | 本组 10 个可加入组织 ID 与五级称谓用 §10.3、§6；明教分支不另建 sect，华山用 `branch:yitian` | 已按未存在 17 时的默认值写完；17 成稿后以其为准迁移 |
| D-3 | `design/07` | 收录 §7 的 13 个本文新候选，并复核 3 个既有候选引用；档位 `g_set`、计件与奖励只按 C22 统一规则 | 本文仅冻结武学成员与主题，没有写奖励数值；既有 ID 避免重复造轮子 |
| D-4 | `design/10` | 复用既有 `eq_shenghuoling`、`eq_yitianjian`、`eq_tiezhihuan`、`eq_luzhang`、`eq_hebi`；07 采纳后补相应 `setTags`。五色旗、毒盐包、分水峨眉刺装备或材料仍由 10 命名 | 正文不预造缺失装备 ID，避免与物品图鉴重名 |
| D-5 | `chapters/04` | 占位任务 ID、师父 NPC、L1–L5 授艺事件、至少三条非互斥基础吐纳／拳／剑取得路线 | 本文只给武学来源语义和占位号，不定义剧情幕次 |
| D-6 | `design/16` | 五级职级的月钱、禄米、资源与材料配给 | 按 AR-07 明确留空，未在图鉴越权定价 |
| D-7 | `design/09` | 五行旗阵与两仪化四象继续沿用 09 §6.8.4–§6.8.5；单人武学与阵法协同分层 | 正文不标 `special.combo`，全图鉴合击比例保持 0 |

### 12.2 本文依赖的上游事实

| # | 上游事实 | 依赖方式 |
|---|---|---|
| U-1 | 基准 §13 天阶封闭名录 | 四门天阶的 ID、品阶、类别、原生书界不得由图鉴改写 |
| U-2 | `design/05` §4.2、§5.5 | 招式倍率与内功 IP 的唯一预算公式；数值实现变动需整批重算 |
| U-3 | 裁定 C16／C17 | 弓箭归暗器；`reqs.skills` 与 `prereq.anyOf` 使用新结构 |
| U-4 | 裁定 C22 | 套装成员双向闭合，`g_set` 取已计件成员有效品阶中位数向下取整 |
| U-5 | `design/06` 目录＋裁定 A5 | 本文 37 个 Buff 均复用已有定义；状态参数与穿透规则不在本文件重定义 |
| U-6 | `design/03` §4.5 | 轻功底值 `QS(2/3/4/6)=38/45/56/74` |
| U-7 | 作者 P27 | 乾坤大挪移与斗转星移不互斥；同伤害链只执行一次转移／镜返 |

### 12.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| P-1 | 将 `design/05` §14 的 519 门旧规模与 `rulings-v1` C14 的 661 门旧规模改为 AR-01 约 1,100–1,150 门，并把本图鉴配额改为 `4/12/36/36=88` | 作者新增需求及 P33 已明确覆盖旧规模；当前上游仍保留旧表，后续统计会误报 |
| P-2 | C3 重新求解倚天全部可习得池比例，不直接在旧 `12/27/40/41=120` 上叠加本文新增 19 玄＋19 黄 | 直接叠加得到 `12/27/59/60=158`，比例 `7.59/17.09/37.34/37.97%`，违反高武目标；需把旧复现池重分配或由 05 更新目标 |
| P-3 | `design/05` §14.6 第5条明确比例分母是 AR-01 后全图鉴约 153 门地阶（旧裁定 141 仅作历史口径），并为“锚点强制且小样本”给离散统计说明 | 本文件只有12门地阶且七伤拳必须代价型，单文件最低非零比例 8.33%，无法字面满足5%；全局贡献仅约0.65% |
| P-4 | 基准 §13 的倚天完整天阶池注释维持 11，不把降龙残承计为完整第12门；`design/05` §14.4 同步 | 裁定 C15 已指出 05 的 12 混入残承；本文件四门只占倚天完整池的一部分 |

### 12.4 原著考据待办

| # | 需核对的书目、人物或情节 | 本文当前保守处理 |
|---|---|---|
| K-1 | 《倚天屠龙记》觉远诵经、郭襄／张三丰／无色各得九阳一支，以及张无忌从白猿腹中得全本的具体回目与措辞 | 不写回目号和伪引文，只保留情节梗概 |
| K-2 | 光明顶秘道乾坤大挪移层级、张无忌修习过程；波斯三使圣火令刻文、阴风刀称谓 | 机制与多数招名标原创扩展命名 |
| K-3 | 玄冥二老姓名、幼年张无忌中掌及解寒毒过程的具体回目 | 只确认玄冥神掌与阴寒表现，招名扩展 |
| K-4 | 阳顶天“大九天手”名目及成名叙述；彭莹玉与“大风云飞掌”的准确关系 | 两条均留待考，不引用网络比较语句 |
| K-5 | 殷天正鹰爪功的正式全名、折兵表现与施展场景 | 以鹰爪手／鹰爪擒拿功分段玩法化，原招名不冒充原文 |
| K-6 | 峨眉金顶绵掌、飘雪穿云掌、金顶九式、柳絮剑法、灭剑／绝剑的正式名目、使用者与回目 | 保留已知名目；灭剑绝剑合并标**（原创扩展命名）** |
| K-7 | 何足道剑术、迅雷多剑描述；何太冲／班淑娴正两仪剑法；华山高矮二老反两仪刀法 | 不填不确定人名细节或回目；单招名均扩展 |
| K-8 | 七伤拳七股劲力、谢逊受损及张无忌以九阳运使的逐字依据 | 玩法代价完全引用 05 §9.1.1 |
| K-9 | 方东白“八臂神剑”绰号、原丐帮身份与出剑表现；王府神箭八雄的射术描写 | 只把绰号／军旅表现用于原创武学命名 |
| K-10 | 海沙派毒盐、巨鲸帮分水峨眉刺、神拳门掌门绰号与王盘山交锋细节 | 三个小派的成套武学均标原创扩展或原创扩展命名 |
| K-11 | 韦一笑阴寒掌力与轻功、练功寒毒；紫衫龙王是否存在可支撑“烈焰掌”的武学描写 | 寒冰绵掌保留待考；烈焰掌明确为原创补位 |

### 12.5 开放问题（附默认值）

| # | 问题 | 本文默认值 |
|---|---|---|
| O-1 | `design/17` 是否把波斯总教、五行旗、玄冥二老拆成独立门派 ID | 不拆：明教用分支；玄冥二老用 `lineage`；避免身份系统碎片化 |
| O-2 | 灭剑与绝剑是否拆成两门 | 不拆：合为 `sk_miejuejian` 双姿态，控制 88 门配额；若拆则必须合并或删除另一门玄阶 |
| O-3 | 王府是否可正式拜入 | 可走“宿卫／客卿”五级映射；不等同加入蒙古官署，政治后果交剧情文档 |
| O-4 | 小帮会地阶是否允许满 10 重 | 门派 L4／L5 可满 10 重；缴获残谱旁路封 8 重，以保留加入门派价值 |
| O-5 | 本组最高轻功是否需要补到 05 §14.6 所列倚天地上9上限 | 不补；该条是最高允许品阶而非每组必须达成的下限。跨组武当梯云纵 `sk_tiyunzong` 以归属图鉴地中8为准；08 的旧地上9行由其归属任务同步 |
| O-6 | 套装候选是否全部进入首发 | 默认全部作为候选交 07 筛选；本文不把候选等同已批准，也不预写奖励 |
| O-7 | 新增 38 门玄黄如何与旧倚天可习得池占比兼容 | 默认由 C3 重分配旧复现／通行投放，保留本文 88 门定义；若必须删减，优先将重复功能的原创基础招改为其他书界复现而非删除 ID |

