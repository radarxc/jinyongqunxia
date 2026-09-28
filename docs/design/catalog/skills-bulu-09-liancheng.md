# 《连城诀》首领武学补录图鉴（`skills-bulu-09-liancheng`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 武学图鉴补录册。本文只定义《连城诀》书界首领缺口所需的新增武学、学习关系与逐招数据；不改写 `skills-kangxi` 已有定义。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14～16、`docs/00-canon.md` §3～§5、§9、§12、§16、§18、`docs/decisions/rulings-v1.md`、`design/05`、`design/21` v2.0、`chapters/09-liancheng`。
> **引用而不重定义**：武学字段、层数、招式预算、内功贡献与装配规则见 `design/05`；经脉路线、护体内劲、调息与外放见 `design/21`；Buff 见 `design/06`；门派职级见 `design/17`；任务来源与投放见 `chapters/09-liancheng` §7、§9。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**须以三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。本文不编造引文、回目号或原著招名。
> **覆盖声明**：本册只补万圭与凌退思的首领配装缺口。四门武学都属于万家门或荆州官差来源，玩家与其他合资格人物可按正常途径学习，不是人物独占招式。
> **版本**：首领武学补录与替补替换（2026-09-28）。

---

## 0. 阅读指引与绝招显式路线索引

本册四门武学均为 **5 玄中**。依 `design/05` §3.5 与 `design/21` §4.2，玄中绝招定数为 **0**，因此本轮没有 `ultimate:true`、绝招解锁层或显式绝招路线。普通招式仍各自绑定稳定 `mfr_<move>`，由 `design/21` 的玄阶普通路线规则展开；文首索引为空不是遗漏。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| — | — | 本册无绝招 | — | — |
<!-- skill-catalog-audit:end -->

## 1. 万家门 `sect_wanjia`

本节与 `skills-kangxi` §7、§11 的万家门体系相同；现有 `sk_wanjiaxinfa` 最高仅 4 品，`sk_wanjiaquan` 最高仅 3 品，不能满足万圭在 `design/21` §11.9.1 下的主运与主力外功 5 品下限，故补一内一外。武学名、招名及机制均为**（原创扩展）**。

### 1.1 `sk_wanjiazhengqi` 万家正气诀（5 玄中 · 内功 · 阳）**（原创扩展）**

**字段**｜`origin:expanded`；`sect:sect_wanjia`；`nature:yang`；`wOut/wIn:0/1`；`meridians:[mer_dumai]` **【建议值】**；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {con:30,wil:30}, aptitude {apInner:25}, sect rank:3, prereq [{skill:sk_wanjiaxinfa,layer:6}]`（硬：sect/prereq）；`inner.contribution:{mpMaxPct:17,hpMaxPct:10,attrs:{con:4,wil:2,str:1},mpRegen:1.5}`；`stats:{defOut:6,resMind:4}`；`breathProfileRef:txp_wanjiazhengqi`；`setTags:[]`。

- **门派 / 来源归属**：万家门；与 `skills-kangxi` §7、§11 的万家拳剑、万家心法属于同一门派图鉴体系。
- **预算**：第 10 重主运 `IP=17+10+2×(4+2+1)+5×1.5=48.5`，等于 `design/05` §5.5 的玄中标准；`stats` 合计 `6+4=10`，不超玄阶档。
- **招式**：守正调息 `mv_wanjiazhengqi_tiaoxi`（L1，自身支援，耗内 5%、cd2、收招 900，`power:0`，`projection:false`）；沉肩守气 `mv_wanjiazhengqi_shouqi`（L4，自身支援，耗内 6%、cd2、收招 900，`bf_wenzhong` G=1·2，`power:0`，`projection:false`）；闭户凝神 `mv_wanjiazhengqi_ningshen`（L7，自身支援，耗内 6%、cd3、收招 1000，`bf_dingxin` G=1·2，`power:0`，`projection:false`）。三式均为运功招式，适用 `design/05` §3.5 内功例外。
- **被动**：守正 `ps_wanjiazhengqi_shouzheng`（3 重，本回合未移动时外防 +5）；定气 `ps_wanjiazhengqi_dingqi`（6 重，气血高于 70% 时心神抗性 +5）；圆成 `ps_wanjiazhengqi_yuancheng`（10 重，调息后下一次招架 +6，每回合至多 1 次）。
- **路线与护体**：三式分别引用 `mfr_wanjiazhengqi_tiaoxi`、`mfr_wanjiazhengqi_shouqi`、`mfr_wanjiazhengqi_ningshen`，均 `ultimate:false/purpose:defense`，按阳性玄阶防守骨架展开；自然护体为 `guard:yang-mid`、`K-AN2`，`innerGuard:{enabled:true,reflectBp:0}`，内劲抵消档位只读 `design/21` §4.8。
- **调息档案**：`sk_wanjiazhengqi → txp_wanjiazhengqi`，`BreathProfile{id:txp_wanjiazhengqi;grade:5;layer:10;nature:yang;scope:2;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}`；10 重 `reliefBp/repairUnits=1800/420`。
- **习得**：万家门 L3 得意弟子，经清白门人传授或门内武册学习；前置 `sk_wanjiaxinfa` 6 重。万圭只是装配者之一，不因击败他自动掉落成品秘籍。

### 1.2 `sk_wanjiaanshenquan` 万家安身拳（5 玄中 · 拳脚／拳掌 · 阳）**（原创扩展）**

**字段**｜`origin:expanded`；`sect:sect_wanjia`；`nature:yang`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {str:30,con:28}, aptitude {apFist:25}, sect rank:3, prereq [{skill:sk_wanjiaquan,layer:5}]`（硬：sect/prereq）；`layerStats:{hit:[2,7],parry:[2,6]}`；`setTags:[]`。

- **门派 / 来源归属**：万家门；与 `skills-kangxi` §7、§11 的万家拳剑、万家心法属于同一门派图鉴体系。
- **招式**：护身短打 `mv_wanjiaanshenquan_hushen`（L1，单体近身，倍率 **1.00**，耗内 6%、cd1、收招 1000，命中后自身 `bf_shoushi` 1，`projection:false`）；核算 `1.00×(1+0.12)−0.10=1.02≈1.00`。逼步冲拳 `mv_wanjiaanshenquan_bibu`（L4，单体近身，倍率 **1.05**，耗内 6%、cd1、收招 1000，击退 1，`projection:false`）；核算 `1.00×(1+0.12)−0.05=1.07≈1.05`。回门架肘 `mv_wanjiaanshenquan_jiazhou`（L7，单体近身，倍率 **1.00**，耗内 6%、cd1、收招 1000，本回合未移动为常见条件且成功时自身招架 +5，`projection:false`）；核算 `1.00×(1+0.12+0.15)−0.25=1.02≈1.00`。
- **被动**：护院 `ps_wanjiaanshenquan_huyuan`（3 重，相邻友方受击后自身招架 +5 至下回合，每 2 回合 1 次）；安身 `ps_wanjiaanshenquan_anshen`（6 重，本回合未移动时命中 +5）；圆成 `ps_wanjiaanshenquan_yuancheng`（10 重，成功击退后下一记本武学 Z3 +6%）。
- **路线**：三式分别引用 `mfr_wanjiaanshenquan_hushen`、`mfr_wanjiaanshenquan_bibu`、`mfr_wanjiaanshenquan_jiazhou`，均 `ultimate:false/purpose:attack`，按阳性玄阶拳掌普通路线展开；全部是接触式拳肘，不是离体掌力。
- **习得**：万家门 L3 得意弟子由护院教习传授，前置 `sk_wanjiaquan` 5 重；问责改组线仍可由未涉案门人代授，门派身份、贡献与属性门槛不豁免。

## 2. 荆州官差体系

凌退思在本书中的威胁以官府、亲卫和毒计为主，不把他拔高为绝顶高手。现有 `sk_yuzhongqinna` 属丁典—狄云狱中求生来源，通行 `sk_jianghutuna` / `sk_wuyingshou` 又不能表达官差体系，故补一门官差公传擒拿与一门衙门养气功。两门都可由同体系合资格人物学习，不是凌退思独门。
`sk_jundituna` 军旅吐纳虽同为玄中 5，且是 `skills-general` 的军中通行、`ALL14` 阳性内功，适合作荆州官差精英的通用主运；但它表达的是跨书界军伍训练，不能闭合凌退思所缺的荆州衙门组织传承与调和主运画像，故不复用为其主运。

### 2.1 `sk_jingzhouguanfuqinfa` 荆州官府擒法（5 玄中 · 拳脚／擒拿 · 中性）**（原创扩展）**

**字段**｜`origin:expanded`；`sect:null`；`lineage:荆州官差体系`；`nature:neutral`；`wOut/wIn:0.70/0.30`；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {str:30,agi:30}, aptitude {apGrapple:25}, prereq []`（硬：aptitude）；`layerStats:{hit:[2,7],seal:[2,6]}`；`setTags:[]`。

- **门派 / 来源归属**：荆州官差组织传承（无门派 ID）；与 `skills-kangxi` §7、§11 的《连城诀》荆州来源条目属于同一图鉴体系，但不并入丁典—狄云狱中支系。
- **招式**：锁腕拿人 `mv_jingzhouguanfuqinfa_suowan`（L1，单体近身，倍率 **1.00**，耗内 6%、cd1、收招 1000，`bf_jiaoxie` 40%·1，`projection:false`）；核算 `1.00×(1+0.12)−0.25×0.40=1.02≈1.00`。押肩移位 `mv_jingzhouguanfuqinfa_yajian`（L4，单体近身，倍率 **0.95**，耗内 6%、cd1、收招 1000，与目标换位，`projection:false`）；核算 `1.00×(1+0.12)−0.15=0.97≈0.95`。合围压肘 `mv_jingzhouguanfuqinfa_yazhou`（L7，单体近身，倍率 **1.05**，耗内 6%、cd2、收招 1000，相邻官差为常见条件，命中施加 `bf_dingshen` 50%·1，`projection:false`）；核算 `1.00×(1+0.24+0.15)−0.25×0.50=1.265`，范围条件折价后取 **1.05**，差额用于合围目标与站位限制。
- **被动**：拿腕 `ps_jingzhouguanfuqinfa_nawan`（3 重，对徒手或短兵目标效果命中 +5pp）；押解 `ps_jingzhouguanfuqinfa_yajie`（6 重，成功缴械后自身 `bf_wenzhong` G=1·1）；守律 `ps_jingzhouguanfuqinfa_shoulv`（10 重，相邻同来源友方存在时招架 +6）。
- **路线**：三式分别引用 `mfr_jingzhouguanfuqinfa_suowan`、`mfr_jingzhouguanfuqinfa_yajian`、`mfr_jingzhouguanfuqinfa_yazhou`，均 `ultimate:false/purpose:attack`；中性按调和兼容口径接拳 / 擒拿末端。三式都是贴身拿押，不产生离体真气。
- **习得**：官府关系达到 **40**，或持有未被撤销的开局“官府身份”时，可由衙门教头传授；也可取得衙门武册后，满足属性与擒拿资质学习。关系门槛为**（原创扩展）【建议值】**；脱离官差体系后已学层数保留，后续传授权不保留。

### 2.2 `sk_jingzhouyangqigong` 荆州养气功（5 玄中 · 内功 · 调和）**（原创扩展）**

**字段**｜`origin:expanded`；`sect:null`；`lineage:荆州官差体系`；`nature:harmony`；`wOut/wIn:0.20/0.80`；`meridians:[mer_renmai,mer_dumai]` **【建议值】**；`sourceChapters:[ch09_liancheng]`；`reqs: attrs {con:30,wil:30}, aptitude {apInner:25}, prereq [{skill:sk_jingzhouguanfuqinfa,layer:4}]`（硬：prereq）；`inner.contribution:{mpMaxPct:17,hpMaxPct:10,attrs:{con:3,wil:3,wis:1},mpRegen:1.5}`；`stats:{defOut:6,resMind:4}`；`breathProfileRef:txp_jingzhouyangqigong`；`setTags:[]`。

- **门派 / 来源归属**：荆州官差组织传承（无门派 ID）；与 `skills-kangxi` §7、§11 的《连城诀》荆州来源条目属于同一图鉴体系，但不并入丁典—狄云狱中支系。
- **预算**：第 10 重主运 `IP=17+10+2×(3+3+1)+5×1.5=48.5`，等于玄中标准；`stats` 合计 `6+4=10`。
- **招式**：当值调息 `mv_jingzhouyangqigong_tiaoxi`（L1，自身支援，耗内 5%、cd2、收招 900，`power:0`，`projection:false`）；守衙定气 `mv_jingzhouyangqigong_shouya`（L4，自身支援，耗内 6%、cd2、收招 900，`bf_wenzhong` G=1·2，`power:0`，`projection:false`）；巡夜凝神 `mv_jingzhouyangqigong_xunye`（L7，自身支援，耗内 6%、cd3、收招 1000，`bf_dingxin` G=1·2，`power:0`，`projection:false`）。三式均为运功招式。
- **被动**：守衙 `ps_jingzhouyangqigong_shouya`（3 重，相邻同来源友方存在时外防 +5）；定心 `ps_jingzhouyangqigong_dingxin`（6 重，首次受到心神减益时效果抵抗 +6）；练气 `ps_jingzhouyangqigong_lianqi`（10 重，调息后下一次擒拿效果命中 +6pp，每回合至多 1 次）。
- **路线与护体**：三式分别引用 `mfr_jingzhouyangqigong_tiaoxi`、`mfr_jingzhouyangqigong_shouya`、`mfr_jingzhouyangqigong_xunye`，均 `ultimate:false/purpose:defense`，按调和玄阶防守骨架展开；自然护体为 `guard:harmony-mid`、`K-HN2`，`innerGuard:{enabled:true,reflectBp:0}`，内劲抵消只读 `design/21` §4.8。
- **调息档案**：`sk_jingzhouyangqigong → txp_jingzhouyangqigong`，`BreathProfile{id:txp_jingzhouyangqigong;grade:5;layer:10;nature:harmony;scope:2;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}`；10 重 `reliefBp/repairUnits=1890/441`。
- **习得**：官府关系达到 **40**，或持有未被撤销的开局“官府身份”时，由衙门教头传授；也可取得衙门武册后学习；两路均须前置 `sk_jingzhouguanfuqinfa` 4 重，并满足本卡属性与内功资质。关系门槛为**（原创扩展）【建议值】**；凌退思可装配，但不宣称原著写过他的具名内功。

## 3. 普通招式路线登记

玄中没有绝招，但正式发布仍须给每个需要运气的招式稳定路线。下表以“`moveRef → meridianRouteRef / ultimate / purpose / 骨架`”登记；骨架与穴位序列唯一引用 `design/21` §4.3、§4.6，不在本册重定义步骤对象。

| 武学 / 性质 | moveRef | 路线 ID | `ultimate/purpose/骨架` |
|---|---|---|---|
| `sk_wanjiazhengqi` / 阳 | `mv_wanjiazhengqi_tiaoxi` | `mfr_wanjiazhengqi_tiaoxi` | `false/defense/K-AD4` |
| `sk_wanjiazhengqi` / 阳 | `mv_wanjiazhengqi_shouqi` | `mfr_wanjiazhengqi_shouqi` | `false/defense/K-AD4` |
| `sk_wanjiazhengqi` / 阳 | `mv_wanjiazhengqi_ningshen` | `mfr_wanjiazhengqi_ningshen` | `false/defense/K-AD4` |
| `sk_wanjiaanshenquan` / 阳 | `mv_wanjiaanshenquan_hushen` | `mfr_wanjiaanshenquan_hushen` | `false/attack/K-A5` |
| `sk_wanjiaanshenquan` / 阳 | `mv_wanjiaanshenquan_bibu` | `mfr_wanjiaanshenquan_bibu` | `false/attack/K-A5` |
| `sk_wanjiaanshenquan` / 阳 | `mv_wanjiaanshenquan_jiazhou` | `mfr_wanjiaanshenquan_jiazhou` | `false/attack/K-A5` |
| `sk_jingzhouguanfuqinfa` / 中 | `mv_jingzhouguanfuqinfa_suowan` | `mfr_jingzhouguanfuqinfa_suowan` | `false/attack/K-H5` |
| `sk_jingzhouguanfuqinfa` / 中 | `mv_jingzhouguanfuqinfa_yajian` | `mfr_jingzhouguanfuqinfa_yajian` | `false/attack/K-H5` |
| `sk_jingzhouguanfuqinfa` / 中 | `mv_jingzhouguanfuqinfa_yazhou` | `mfr_jingzhouguanfuqinfa_yazhou` | `false/attack/K-H5` |
| `sk_jingzhouyangqigong` / 和 | `mv_jingzhouyangqigong_tiaoxi` | `mfr_jingzhouyangqigong_tiaoxi` | `false/defense/K-HD4` |
| `sk_jingzhouyangqigong` / 和 | `mv_jingzhouyangqigong_shouya` | `mfr_jingzhouyangqigong_shouya` | `false/defense/K-HD4` |
| `sk_jingzhouyangqigong` / 和 | `mv_jingzhouyangqigong_xunye` | `mfr_jingzhouyangqigong_xunye` | `false/defense/K-HD4` |

## 4. 来源扩展登记

本轮没有“既有武学只缺《连城诀》来源”的情况。四门缺口均是新定义，`sourceChapters:[ch09_liancheng]` 已直接写入卡片；下表保留供 NXfix 汇总时作零项凭据。

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 无来源扩展项 | 无需同步 |

## 5. 外放候选审计表

依 AR-16 与 `design/21` §4.4.1 逐招判断。十二式全是自身运功或接触式拳肘 / 擒拿，外放招式 **0**；`projection:false` 时不配置 `projectionSpreadSteps`，也不要求路线经过外放端点白名单。

| 武学 | 招式 | 判定 | `projectionSpreadSteps` | 理由 |
|---|---|---|---|---|
| `sk_wanjiazhengqi` | `mv_wanjiazhengqi_tiaoxi` | `projection:false` | 不配置 | 自身调息 |
| `sk_wanjiazhengqi` | `mv_wanjiazhengqi_shouqi` | `projection:false` | 不配置 | 自身守气 |
| `sk_wanjiazhengqi` | `mv_wanjiazhengqi_ningshen` | `projection:false` | 不配置 | 自身凝神 |
| `sk_wanjiaanshenquan` | `mv_wanjiaanshenquan_hushen` | `projection:false` | 不配置 | 1 格接触式短打 |
| `sk_wanjiaanshenquan` | `mv_wanjiaanshenquan_bibu` | `projection:false` | 不配置 | 1 格接触式冲拳 |
| `sk_wanjiaanshenquan` | `mv_wanjiaanshenquan_jiazhou` | `projection:false` | 不配置 | 1 格接触式架肘 |
| `sk_jingzhouguanfuqinfa` | `mv_jingzhouguanfuqinfa_suowan` | `projection:false` | 不配置 | 1 格接触式锁腕 |
| `sk_jingzhouguanfuqinfa` | `mv_jingzhouguanfuqinfa_yajian` | `projection:false` | 不配置 | 1 格接触式押肩换位 |
| `sk_jingzhouguanfuqinfa` | `mv_jingzhouguanfuqinfa_yazhou` | `projection:false` | 不配置 | 1 格接触式合围擒拿 |
| `sk_jingzhouyangqigong` | `mv_jingzhouyangqigong_tiaoxi` | `projection:false` | 不配置 | 自身调息 |
| `sk_jingzhouyangqigong` | `mv_jingzhouyangqigong_shouya` | `projection:false` | 不配置 | 自身守势 |
| `sk_jingzhouyangqigong` | `mv_jingzhouyangqigong_xunye` | `projection:false` | 不配置 | 自身凝神 |

## 6. 统计表

| 统计项 | 数量 | 核算 |
|---|---:|---|
| 新增武学 | 4 | 玄中 4；内功 2、拳脚 2 |
| 原著正式定名 | 0 | 四门均明确标为**（原创扩展）** |
| 普通 / 运功招式 | 12 | 每门 3；`4×3=12` |
| 绝招 | 0 | 玄中配额 `4×0=0` |
| 被动 | 12 | 每门 3；处于玄中 2–4 范围 |
| 外放招式 | 0 | 十二式逐招审计均为 `projection:false` |
| 调息档案 | 2 | 两门内功各 1，均含 `outOfBattleScaleBp:15000` |
| 来源扩展 / 跨书界待替换 | 0 / 0 | 两名首领缺口均由本书补齐 |

## 7. 本文新增术语与 ID

### 7.1 武学、招式与被动

| 类别 | 数量 | 新增 ID |
|---|---:|---|
| 武学 `sk_*` | 4 | `sk_wanjiazhengqi`、`sk_wanjiaanshenquan`、`sk_jingzhouguanfuqinfa`、`sk_jingzhouyangqigong` |
| 招式 `mv_*` | 12 | `mv_wanjiazhengqi_{tiaoxi,shouqi,ningshen}`；`mv_wanjiaanshenquan_{hushen,bibu,jiazhou}`；`mv_jingzhouguanfuqinfa_{suowan,yajian,yazhou}`；`mv_jingzhouyangqigong_{tiaoxi,shouya,xunye}` |
| 被动 `ps_*` | 12 | `ps_wanjiazhengqi_{shouzheng,dingqi,yuancheng}`；`ps_wanjiaanshenquan_{huyuan,anshen,yuancheng}`；`ps_jingzhouguanfuqinfa_{nawan,yajie,shoulv}`；`ps_jingzhouyangqigong_{shouya,dingxin,lianqi}` |

花括号只是本文清单的排版缩写，生产 ID 以各卡完整拼写为准；不新增 Buff、装备、套装、门派或任务 ID。

### 7.2 路线与调息档案

| 类别 | 数量 | 定义 / 口径 |
|---|---:|---|
| 普通路线 `mfr_*` | 12 | 与 §3 十二个 `mv_*` 一一同名派生；均 `ultimate:false`，穴位步骤按 21 普通模板展开 |
| 调息档案 `txp_*` | 2 | 见下表；前缀已由基准 §12 登记 |

| 内功 → 调息档案 | `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp` | 10 重 `reliefBp / repairUnits` | 护体档 |
|---|---|---|---|
| `sk_wanjiazhengqi → txp_wanjiazhengqi` | `5/10/yang/2/1000/0/15000`；`outOfBattleScaleBp:15000` | `1800 / 420` | II；`guard:yang-mid`；`reflectBp:0` |
| `sk_jingzhouyangqigong → txp_jingzhouyangqigong` | `5/10/harmony/2/1000/0/15000`；`outOfBattleScaleBp:15000` | `1890 / 441` | II；`guard:harmony-mid`；`reflectBp:0` |

## 8. 数据校验规则与测试用例

| 编号 | 校验 | 期望 |
|---|---|---|
| LC09-BL-V01 | 四个 `sk_*`、十二个 `mv_*` / `ps_*` 全仓唯一，且招式、被动使用所属武学前缀 | 失败即阻断 |
| LC09-BL-V02 | 四门均为 5 品、3 招、3 被动、0 绝招；内功 IP 各为 48.5 | 失败即阻断 |
| LC09-BL-V03 | 十二招均 `projection:false` 且无 `projectionSpreadSteps` | 失败即阻断 |
| LC09-BL-V04 | 两个 `txp_*` 均为 5/10、scope 2、CT 1000、耗内 0、离战倍率 15000 | 失败即阻断 |
| LC09-BL-V05 | 玩家满足门派条件，或满足官府关系 **≥40** / 持有效官府身份 / 取得衙门武册之一，并满足属性、资质与前置时可学；仅击败首领不自动习得 | 应通过 |
| LC09-BL-T01 | 万圭主运 `sk_wanjiazhengqi` 8 重、凌退思主运 `sk_jingzhouyangqigong` 8 重 | 七参均保持 `5/8`，不触发地位下限兜底 |
| LC09-BL-T02 | 两首领血量 / 防御倍率保持 `1.00/1.00` 后运行节奏脚本 | 各自落在 Boss 12–25 轮 |

## 9. 待决事项 / 依赖

### 9.1 替下游给出的建议值

- **【建议值】** `sk_wanjiazhengqi` 取 `mer_dumai`，`sk_jingzhouyangqigong` 取 `mer_renmai + mer_dumai`；这是普通路线的门派 / 性质叙事底子，不另造绝招路线。默认保留，待 `design/15` / `design/21` 后续总审计统一确认。

### 9.2 本文依赖的上游事实

- 依赖 `design/05` §3.5 的玄中 3–5 招、0 绝招、2–4 被动和 §5.5 的 48.5 IP；依赖 `design/21` §4.8、§10 的护体与调息公式。
- 依赖 `chapters/09-liancheng` §7 的万家门五级职级；官差武学改用既有官府关系、开局官府身份或衙门武册作为非正式势力来源，不新建门派 ID 或职级表。官府关系 **40** 为**（原创扩展）【建议值】**。

### 9.3 对基准的修改提案

- 无。四门均落在现行低武品阶、ID、武学预算与首领装配规则内。

### 9.4 原著考据待办

- 无需为四个原创名称寻找伪造出处。后续纸本终校只需确认万圭的师门身份与凌退思的官职叙事没有被本文写成原著具名武学。

### 9.5 开放问题（附默认值）

- **O-1：官差武册在凌退思失势后的合法取得节点。** 默认由会审后留任教头传授，或由缴获武册开放学习来源；前者仍须官府关系 **≥40** 或持有效官府身份，后者仍须满足属性、资质与前置，不把战利品直接变成已学武学。关系门槛为**（原创扩展）【建议值】**。
- **O-2：万家门问责改组后由谁传授两门新武学。** 默认由未涉案的总管 / 师叔代授，玩家须保持万府关系非敌对并完成公开供状；不要求万圭本人授艺。
