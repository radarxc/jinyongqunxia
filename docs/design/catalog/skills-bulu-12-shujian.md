# 门派武学补录 · 书界 12《书剑恩仇录》

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的书界补录册；仅定义《书剑恩仇录》首领配装确实缺少的铁胆庄家传与袁士霄传承武学，以及本次来源扩展登记。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/15/16、`docs/00-canon.md` §3–§5/§9/§12/§13/§16/§18、`docs/decisions/rulings-v1.md`、`design/05`、`design/21`、`design/chapters/12-shujian.md`。
> **引用而不重定义**：字段、层数、招式与内功预算见 `design/05`；经脉路线、护体内劲、外放与调息算法见 `design/21`；穴位拓扑见 `design/15`；Buff 本体见 `design/06`；任务、人物、门派时代与既有武学分别见 `design/chapters/12`、`design/18`、`design/17` 与既有十一册图鉴。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**须以三联 / 广州修订版逐字核对；**（待核实）**为尚未联网确认的技术事实；**（待实测）**为需战斗回放验证；**【建议值】**为待唯一归属文档确认的数值。
> **覆盖声明**：本册不改写 `skills-qianlong.md` 或 `skills-general.md`。三门新增武学均可由主角与其他满足条件者正常习得；没有首领专用、敌方专用或不可获得条目。
> **版本**：首领所缺武学补录（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）。

---

## 0. 阅读指引

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层）

本索引只镜像正文 `MoveDef` 与路线实例；正文不一致即为错误。每记绝招各有独立稳定路线，所有路线都满足 1–18 段、单段 40–120 CT、风险 0–1200，且 `1200 + 8×90 = 1920 ≤ 2000 CT`。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 7 地下 | `sk_tiedanzhuangxinfa` | `mv_tiedanzhuangxinfa_shouzhuang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiedanzhuangxinfa_shouzhuang}` | `mfr_tiedanzhuangxinfa_shouzhuang` | `MeridianRouteDef{moveRef:mv_tiedanzhuangxinfa_shouzhuang; ultimate:true; purpose:defense}`；`ap_dumai_mingmen/90/100→ap_yangwei_fengfu/90/120→ap_zuyangming_zusanli/90/140→ap_shouyangming_quchi/90/160→ap_renmai_qihai/90/180→ap_dumai_baihui/90/200→ap_yangqiao_shenmai/90/220→ap_shoutaiyang_houxi/90/240` |
| 7 地下 | `sk_tiedanzhuangquan` | `mv_tiedanzhuangquan_zhenmen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiedanzhuangquan_zhenmen}` | `mfr_tiedanzhuangquan_zhenmen` | `MeridianRouteDef{moveRef:mv_tiedanzhuangquan_zhenmen; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_dumai_shenzhu/90/120→ap_yangwei_fengfu/90/140→ap_zuyangming_zusanli/90/160→ap_yangqiao_jianyu/90/180→ap_shouyangming_quchi/90/200→ap_shouyangming_shousanli/90/220→ap_shouyangming_hegu/90/240` |
| 9 地上 | `sk_tianchishengong` | `mv_tianchishengong_shouyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianchishengong_shouyi}` | `mfr_tianchishengong_shouyi` | `MeridianRouteDef{moveRef:mv_tianchishengong_shouyi; ultimate:true; purpose:defense}`；`ap_renmai_qihai/90/100→ap_renmai_danzhong/90/120→ap_dumai_mingmen/90/140→ap_dumai_zhiyang/90/160→ap_yangwei_fengfu/90/180→ap_yangqiao_shenmai/90/200→ap_shoujueyin_neiguan/90/220→ap_zushaoyin_taixi/90/240` |
| 9 地上 | `sk_tianchishengong` | `mv_tianchishengong_guiyuan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianchishengong_guiyuan}` | `mfr_tianchishengong_guiyuan` | `MeridianRouteDef{moveRef:mv_tianchishengong_guiyuan; ultimate:true; purpose:defense}`；`ap_zushaoyin_rangu/90/100→ap_chongmai_dahe/90/120→ap_renmai_shimen/90/140→ap_renmai_shenque/90/160→ap_dumai_yaoshu/90/180→ap_dumai_shenzhu/90/200→ap_shoujueyin_jianshi/90/220→ap_shoujueyin_daling/90/240` |
<!-- skill-catalog-audit:end -->

### 0.2 口径与去重结论

| 缺口 | 先复用结论 | 本册处理 |
|---|---|---|
| 周仲英 | 通行 `sk_hunyuanfangzhuang` / `sk_tongbeijian` 达档但不体现周氏家传 | 新增 7 品铁胆庄内功与拳法，二者均可通过家传许可或谱本学习 |
| 假旗队领、兆惠 | `sk_baizhanxinfa` 已是 8 品、可共享的历代军伍行气法 | 不造人物专属武学；`ch12_shujian` 来源扩展已由通行册落实 |
| 陈家洛 | `sk_honghuaxinfa` 只有 5 品；既有袁士霄传承缺一门 9 品内功 | 新增 9 品天池神功；传承开放给所有满足师承 / 遗谱条件者 |

三门新武学均为**（原创扩展）**，名称不冒充原著术语。“袁士霄传陈家洛武学、周仲英为铁胆庄庄主”等人物与组织关系只作来源依据，具体运功名、招名、谱本及传授流程均为玩法扩写。

### 0.3 共用数值记法

- 内功贡献按 `IP = mpMaxPct + hpMaxPct + 2×属性点总和 + 5×mpRegen`：地下 72、地上 94.5；内功 `layerStats:null`，`stats` 另受地阶 15 点上限。
- 地阶绝招统一 `rageCost:100`、`mpCost:9%`、`cd:0`、`recovery:1200`；地下 1 记、地上 2 记，依次在 7 / 9 重解锁。
- 本册四记绝招均为近身拳法或纯防守 / 支援，不是离体真气伤害，故 `projection:false`；外放字段不得按武学品阶推导。

---

## 1. 铁胆庄家传 **（原创扩展）**

铁胆庄未在 `design/17` 登记独立 `sect_*`，本册不越权新建门派 ID；数据使用 `sect:null`、`lineage:周氏铁胆庄家传`。它与 `skills-qianlong.md` 的书剑人物 / 地域体系同册协作，与 `skills-general.md` 的镖局、武馆通行链可作前置，但不是同一门派武学。

### 1.1 `sk_tiedanzhuangxinfa` 铁胆庄心法（7 地下 · 内功 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:inner`；`subType:inner`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:周氏铁胆庄家传`；`sourceChapters:[ch12_shujian]`；`nature:yang`；`wOut/wIn:0.25/0.75`；`moveSlots:4` |
| reqs | `attrs:{con:35,wil:35}`；`aptitude:{apInner:30}`；`prereq:[{skill:sk_zhuangxingong,layer:5}]`；`hard:[prereq]` |
| inner.contribution | `mpMaxPct:26,hpMaxPct:16,attrs:{con:5,str:2,wil:3},mpRegen:2.0,stats:{defOut:8,resMind:7}`；`26+16+2×(5+2+3)+5×2.0=72` |
| inner／经脉 | `meridians:[mer_dumai,mer_yangwei]`；`breathProfileRef:txp_tiedanzhuangxinfa`；`innerGuard:{enabled:true,reflectBp:0}`；地阶护体 III，仅作显示档 |
| 层数要点 | `layerStats:null`；1 重立桩、3 重沉肩、5 重守户；**7 重绝招铁胆守庄**；10 重守正 |
| setTags / conflicts / special | `[]` / 无 / `{fusible:true}`；不借“铁胆”之名增加暗器伤害 |
| 习得途径 | 周仲英在铁胆庄误会收束且关系达标后传授，或终幕后取得周氏谱本；主角及其他满足前置者均可学，不要求由 Boss 掉落 |
| 图鉴文本 | 铁胆庄守宅护院的家传吐纳法，重在立稳、护人和止争。功名、层次、谱本与战斗效果均为**（原创扩展）** |

#### `sk_tiedanzhuangxinfa`

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 核算 |
|---|---:|---|---:|---|---|---|
| 沉肩护户 `mv_tiedanzhuangxinfa_chenjian` | 2 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong` 2；`projection:false; projectionSpreadSteps:null` | 支援招，不进入伤害倍率公式 |
| 铁胆守庄（绝招） `mv_tiedanzhuangxinfa_shouzhuang` | 7 | 友方 r2·支援 | 0 | 9%/绝/1200 | `ultimate:true`；气势 100；自身与相邻友军 `bf_renjin` 2；`projection:false; projectionSpreadSteps:null` | 纯防守绝招，不进入伤害倍率公式；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiedanzhuangxinfa_shouzhuang}` |

被动：守户 `ps_tiedanzhuangxinfa_shouhu`（L1，邻接非敌对单位时 `defOut+3→8`）；担责 `ps_tiedanzhuangxinfa_danze`（L5，每回合首次替相邻友军承受援护后 `resMind+4→10`，持续 1 回合）；守正 `ps_tiedanzhuangxinfa_shouzheng`（L10，目标战达成非击杀条件时返气势 15，每战一次）。

调息：`txp_tiedanzhuangxinfa` = `BreathProfile{id:txp_tiedanzhuangxinfa;grade:7;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}`。10 重通用公式为 `reliefBp=2000`、`repairUnits=468`；内劲抵消为地阳档 III，`reflectBp:0`，运行时仍按有效品阶 / 层数重算。

### 1.2 `sk_tiedanzhuangquan` 铁胆庄拳（7 地下 · 拳脚 / 拳掌 · 阳）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:unarmed`；`subType:fist`；`grade:7`；`origin:expanded`；`sect:null`；`lineage:周氏铁胆庄家传`；`sourceChapters:[ch12_shujian]`；`nature:yang`；`wOut/wIn:0.70/0.30`；`moveSlots:4` |
| reqs | `attrs:{str:35,con:35}`；`aptitude:{apFist:30}`；`prereq:[{skill:sk_tiedanzhuangxinfa,layer:5}]`；`hard:[prereq]` |
| layerStats / 层数 | `hit:[3,8],pierce:[2,7]`，10 重合计 `8+7=15`；1 重迎门、3 重拦身、5 重护庄；**7 重绝招铁胆镇门**；10 重守中 |
| setTags / conflicts / special | `[]` / 无 / `{fusible:true}`；徒手拳路，不把名器 `eq_tiedan` 作为武器前置 |
| 习得途径 | 先修铁胆庄心法 5 重，再由周仲英指点或研读周氏拳谱；取得谱本须完成误会收束与庄民保护目标。主角及其他满足条件者均可学 |
| 图鉴文本 | 周氏守庄拳术，以稳住门户、截断冲势为先。武学名、招名、谱本与整套技法均为**（原创扩展）** |

#### `sk_tiedanzhuangquan`

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 迎门 `mv_tiedanzhuangquan_yingmen` | 1 | 单体·近身 | 1.00 | 7%/1/1000 | `projection:false; projectionSpreadSteps:null` | 可 | 地阶基础单体 `1.00` |
| 拦身 `mv_tiedanzhuangquan_lanshen` | 3 | 单体·近身 | 1.05 | 8%/2/1000 | `bf_chihuan` 50%；`projection:false; projectionSpreadSteps:null` | 可 | `1×(1+.12)−.10×.50=1.07≈1.05` |
| 护庄 `mv_tiedanzhuangquan_huzhuang` | 5 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | 击退 1；`projection:false; projectionSpreadSteps:null` | 可 | N=3、AF=.85；`.85×1.29−.05=1.0465≈1.05` |
| 铁胆镇门（绝招） `mv_tiedanzhuangquan_zhenmen` | 7 | 单体·近身 | 2.95 | 9%/绝/1200 | `ultimate:true`；气势 100；`bf_pojia` 50%；`projection:false; projectionSpreadSteps:null` | 可 | `3.00−.10×.50=2.95`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tiedanzhuangquan_zhenmen}` |

被动：守门 `ps_tiedanzhuangquan_shoumen`（L2，守点相邻友军时 `parry+3→8`）；截势 `ps_tiedanzhuangquan_jieshi`（L6，成功击退后本回合 `tough+4→10`）；守中 `ps_tiedanzhuangquan_shouzhong`（L10，连续两回合未离开守点时下一次近身招 Z3 +12%，触发即清）。

两门铁胆庄武学同源但路线只共享 `ap_dumai_mingmen`、`ap_yangwei_fengfu`、`ap_zuyangming_zusanli`、`ap_shouyangming_quchi` 四穴，即 `4/8=50%`；心法从督脉立身后回收至后溪，拳法从督脉发力、转足阳明与阳跷，末三段连续落在曲池、手三里、合谷，符合拳掌终点规则，既非轮换也非逆序。

---

## 2. 天池怪侠传承 **（原创扩展）**

本节与 `skills-qianlong.md` 的天池怪侠 / 红花会体系属于同一传承组。袁士霄传陈家洛武艺及百花错拳为原著关系；“天池神功”这一武学名、运功招名、内功参数和遗谱取得法均为**（原创扩展）**，不声称原著有同名秘籍。

### 2.1 `sk_tianchishengong` 天池神功（9 地上 · 内功 · 调和）**（原创扩展）**

| 字段 | 值 |
|---|---|
| 基础 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:sect_honghuahui`；`lineage:天池怪侠袁士霄→陈家洛`；`sourceChapters:[ch12_shujian]`；`nature:harmony`；`wOut/wIn:0.15/0.85`；`moveSlots:4` |
| reqs | `attrs:{con:45,wil:45,wis:40}`；`aptitude:{apInner:40}`；`prereq:[{skill:sk_honghuaxinfa,layer:7}]`；`hard:[prereq]` |
| inner.contribution | `mpMaxPct:34,hpMaxPct:20,attrs:{con:6,wil:5,wis:3},mpRegen:2.5,stats:{defOut:8,resMind:7}`；`34+20+2×(6+5+3)+5×2.5=94.5` |
| inner / 经脉 | `meridians:[mer_renmai,mer_dumai]`；`breathProfileRef:txp_tianchishengong`；`innerGuard:{enabled:true,reflectBp:0}`；地阶护体 III，仅作显示档 |
| 层数要点 | `layerStats:null`；1 重守息、3 重百家归一、5 重静观；**7 重第一绝招天池守一**；**9 重第二绝招百花归元**；10 重神完气足 |
| setTags / conflicts / special | `[]` / 无 / `{fusible:true}`；不并入百花错拳的天级计数，也不提高其品阶 |
| 习得途径 | `q_12_qiyu_14` 后由袁士霄亲授；或完成陈家洛羁绊、持天池引见并在余韵取得遗谱研习许可。`sect` 依同源 `sk_baihuacuo` 统一登记为红花会获取组织，但不新增门派职级硬前置；主角与其他人物均须满足既有前置，不因陈家洛配装自动学会 |
| 图鉴文本 | 袁士霄一系用于统摄百家拳理的调和内功。名称、运功层次、遗谱与数值均为**（原创扩展）**；原著传艺具体段落及陈家洛内功名仍**（待考）** |

#### `sk_tianchishengong`

| 招式（ID） | 重 | 范围·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 核算 |
|---|---:|---|---:|---|---|---|
| 静观 `mv_tianchishengong_jingguan` | 3 | 自身·支援 | 0 | 7%/3/900 | `bf_ningshen` 2；`projection:false; projectionSpreadSteps:null` | 支援招，不进入伤害倍率公式 |
| 天池守一（第一绝招） `mv_tianchishengong_shouyi` | 7 | 自身·防守 | 0 | 9%/绝/1200 | `ultimate:true`；气势 100；`bf_jiangu` 2；`projection:false; projectionSpreadSteps:null` | 纯防守绝招，不进入伤害倍率公式；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianchishengong_shouyi}` |
| 百花归元（第二绝招） `mv_tianchishengong_guiyuan` | 9 | 自身·支援 | 0 | 9%/绝/1200 | `ultimate:true`；气势 100；调息一次并驱散 1 个 `cc.slow`；`projection:false; projectionSpreadSteps:null` | 支援绝招；调息量按 `txp_tianchishengong` 与当前有效层数结算；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_tianchishengong_guiyuan}` |

被动：纳杂归一 `ps_tianchishengong_nazaguiyi`（L2，辅运内功性质不同于主运时只保留既有桥接规则，不追加倍率）；静观 `ps_tianchishengong_jingguan`（L5，识破预告招式后 `resMind+4→10`，持续 1 回合）；百家归元 `ps_tianchishengong_baihuaguiyuan`（L10，每战首次调息额外解除一个 1–3 级点穴，不越过 21 的 9 级限制）。

调息：`txp_tianchishengong` = `BreathProfile{id:txp_tianchishengong;grade:9;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}`。10 重通用调和公式为 `reliefBp=floor((500+100×9+80×10)×1.05)=2310`、`repairUnits=floor((120+24×9+18×10)×1.05)=541`；内劲抵消为地调和档 III，`reflectBp:0`。

两记绝招共享 `0/8=0%≤50%`。守一路线由任督蓄气转上肢内关后收于太溪，职责为护体；百花归元改由足少阴起，经冲、任、督纵向归元，再沿手厥阴收束，职责为调息，非轮换或逆序。

| 路线叙事第三轮同步镜像 | 模板代号 | 段数 | 路线 CT | 收招合计 | 风险列表 / 总风险 |
|---|---|---:|---:|---:|---|
| `mfr_tianchishengong_guiyuan` | 见文首索引 | 8 | `8×90=720` | `1200+720=1920 CT` | `[100,120,140,160,180,200,220,240]` / `1360` |

---

## 3. 来源扩展登记

本表只登记既有武学新增可得书界，不复制武学定义；收尾任务已将本册条目回写其唯一归属图鉴。本表保留“已解决”状态用于追溯，不把它误作第二张武学卡。

| 武学 ID | 唯一归属图鉴 | 需加入的 `sourceChapters` | 依据 | 本书用途 / 状态 |
|---|---|---|---|---|
| `sk_baizhanxinfa` | `skills-general.md` | `ch12_shujian` | 该卡已定义为“历代军伍行气法汇编”，并非某位首领独门；书剑清军将领与军中假旗队均符合军伍传承来源 | **已解决：**假旗队领、兆惠主运；通行册已落实来源扩展 |

本书没有跨书界待替换项。`sk_baizhanxinfa` 的品阶、性质、招式、调息与习得门槛均继续以 `skills-general.md` 为准；本文只扩展可得书界。

## 4. 外放候选审计表

判定遵循 `design/21` §4.4.1：只有真气离体并造成伤害 / 控制才是外放；近身拳击、普通兵刃、暗器实体与纯支援效果均不是。`projection:false` 时 `projectionSpreadSteps:null`，不得生成外放路线，也不接受手部端点白名单校验。

| 武学 | 招式 | 动作与介质 | `projection` | `projectionSpreadSteps` | 结论 |
|---|---|---|---:|---|---|
| `sk_tiedanzhuangxinfa` | `mv_tiedanzhuangxinfa_chenjian` | 自身吐纳支援 | `false` | `null` | 无离体伤害或控制 |
| 同上 | `mv_tiedanzhuangxinfa_shouzhuang` | 邻近友军守护支援 | `false` | `null` | 共享守势，不投射真气 |
| `sk_tiedanzhuangquan` | `mv_tiedanzhuangquan_yingmen` | 徒手近身拳击 | `false` | `null` | 接触式攻击 |
| 同上 | `mv_tiedanzhuangquan_lanshen` | 徒手近身拦截 | `false` | `null` | 接触式迟缓 |
| 同上 | `mv_tiedanzhuangquan_huzhuang` | 一格锥形近身扫击 | `false` | `null` | 接触式击退 |
| 同上 | `mv_tiedanzhuangquan_zhenmen` | 徒手近身重击 | `false` | `null` | 接触式破甲 |
| `sk_tianchishengong` | `mv_tianchishengong_jingguan` | 自身凝神支援 | `false` | `null` | 无离体伤害或控制 |
| 同上 | `mv_tianchishengong_shouyi` | 自身护体 | `false` | `null` | 真气不离体 |
| 同上 | `mv_tianchishengong_guiyuan` | 自身调息与驱散 | `false` | `null` | 真气不离体 |

审计结论：候选 9 招，外放 0 招；因此新增外放路线 0 条、手部端点白名单命中要求 0 条。若后续把任何支援效果改成远距敌方伤害 / 控制，必须重新判定并补 `projectionSpreadSteps` 与手部端点路线。

## 5. 本册统计

| 项目 | 数量 | 明细 / 核对 |
|---|---:|---|
| 新增武学 | 3 | 地上 1、地下 2；全部**（原创扩展）**、全部可正常习得 |
| 类别 | 3 | 内功 2、拳脚 / 拳掌 1 |
| 招式 | 9 | 普通 / 支援 5、绝招 4 |
| 绝招 | 4 | 地上 2、地下各 1；解锁为 7 / 9 重 |
| 被动 | 9 | 每门 3 个 |
| 显式绝招路线 | 4 | 每招一条；同门共享穴位最高为铁胆庄 `4/8=50%`，天池为 `0/8=0%` |
| 调息档案 | 2 | 两门内功各 1 个，均含 `outOfBattleScaleBp:15000` |
| 外放招式 / 路线 | 0 / 0 | 九招均 `projection:false` |
| 来源扩展 | 1 | `sk_baizhanxinfa → ch12_shujian` |
| 新增 Buff / 门派 ID / 套装 | 0 / 0 / 0 | 只引用既有 Buff；无权新建铁胆庄或天池 `sect_*` |

## 6. 本文新增术语与 ID

### 6.1 武学、招式与被动

| 类别 | 数量 | 新增 ID |
|---|---:|---|
| 武学 `sk_*` | 3 | `sk_tiedanzhuangxinfa`、`sk_tiedanzhuangquan`、`sk_tianchishengong` |
| 招式 `mv_*` | 9 | `mv_tiedanzhuangxinfa_chenjian`、`mv_tiedanzhuangxinfa_shouzhuang`；`mv_tiedanzhuangquan_yingmen`、`mv_tiedanzhuangquan_lanshen`、`mv_tiedanzhuangquan_huzhuang`、`mv_tiedanzhuangquan_zhenmen`；`mv_tianchishengong_jingguan`、`mv_tianchishengong_shouyi`、`mv_tianchishengong_guiyuan` |
| 被动 `ps_*` | 9 | `ps_tiedanzhuangxinfa_shouhu`、`ps_tiedanzhuangxinfa_danze`、`ps_tiedanzhuangxinfa_shouzheng`；`ps_tiedanzhuangquan_shoumen`、`ps_tiedanzhuangquan_jieshi`、`ps_tiedanzhuangquan_shouzhong`；`ps_tianchishengong_nazaguiyi`、`ps_tianchishengong_jingguan`、`ps_tianchishengong_baihuaguiyuan` |

### 6.2 经脉路线、调息档案与术语

| 类别 | 数量 | 新增 ID / 含义 |
|---|---:|---|
| 招式路线 `mfr_*` | 4 | `mfr_tiedanzhuangxinfa_shouzhuang`、`mfr_tiedanzhuangquan_zhenmen`、`mfr_tianchishengong_shouyi`、`mfr_tianchishengong_guiyuan` |
| 调息档案 `txp_*` | 2 | `txp_tiedanzhuangxinfa`、`txp_tianchishengong` |
| 周氏铁胆庄家传 | — | 武学来源标签，不是新 `sect_*`，也不宣称原著存在同名完整套路 |
| 天池怪侠传承 | — | 袁士霄—陈家洛传承分组；本文的“天池神功”仍属原创玩法命名 |

跨文档只引用、不计为本文定义：`sk_baizhanxinfa`、`sk_honghuaxinfa`、`sk_zhuangxingong`、所用 `bf_*` / `cc.*`、`mer_*` 与全部 `ap_*`。

## 7. 数据校验规则与测试用例

### 7.1 构建校验

| 编号 | 校验 | 通过条件 |
|---|---|---|
| SJ-BL-V01 | ID 唯一与外键 | 本文新增 3 `sk_*`、9 `mv_*`、9 `ps_*`、4 `mfr_*`、2 `txp_*` 全仓唯一；引用 ID 均有定义或属正式章节 / 状态枚举 |
| SJ-BL-V02 | 品阶与绝招数 | 地下两门各 1 绝招；地上一门 2 绝招；只在 7 / 9 重解锁 |
| SJ-BL-V03 | 内功预算 | 铁胆庄心法 `IP=72`、天池神功 `IP=94.5`，均命中 `design/05` 对应目标；`stats` 各为 `8+7=15` |
| SJ-BL-V04 | 外功成长 | 铁胆庄拳 10 重 `layerStats=8+7=15`，不越地阶上限 |
| SJ-BL-V05 | 绝招资源 | 四招均为气势 100、内力 9%、`cd:0`、收招 1200；总 CT `1200+8×90=1920≤2000` |
| SJ-BL-V06 | 路线合法与唯一 | 每条 8 段、单段 90 CT、风险 100–240 bp、无重复穴；不得与全库既有路线完全相同 |
| SJ-BL-V07 | 同源互异 | 铁胆庄两路线共享 `4/8=50%`，天池两路线共享 `0/8=0%`，均 ≤50%，且不是轮换或逆序 |
| SJ-BL-V08 | 调息 / 护体 | 两个 `txp_*` 均有 `outOfBattleScaleBp:15000`；10 重公式值准确；`reflectBp:0` |
| SJ-BL-V09 | 外放字段 | 九招全部显式 `projection:false` 且 `projectionSpreadSteps:null`；不存在漏登记的离体伤害 / 控制 |
| SJ-BL-V10 | 可习得性 | 三门新武学均有非敌专途径；`sk_baizhanxinfa` 只扩展来源，不复制定义 |
| SJ-BL-V11 | 原著标注 | 三门、全部新招名与取得流程均标原创扩展；未核实事实标待考，不写伪引文或回目 |

### 7.2 最小测试向量

| 用例 | 输入 | 预期 |
|---|---|---|
| T-SJ-BL-01 铁胆内功预算 | `26+16+2×(5+2+3)+5×2.0` | `72`，地下预算命中 |
| T-SJ-BL-02 天池内功预算 | `34+20+2×(6+5+3)+5×2.5` | `94.5`，地上预算命中 |
| T-SJ-BL-03 绝招计数 | 按 `ultimate:true` 分组 | `sk_tiedanzhuangxinfa=1`、`sk_tiedanzhuangquan=1`、`sk_tianchishengong=2` |
| T-SJ-BL-04 路线 CT | 任一路线 `8×90`，绝招收招 1200 | `flowCt=720`、总计 1920 CT |
| T-SJ-BL-05 铁胆庄互异 | 比较两条铁胆庄路线穴位集合 | 只共享命门、风府、足三里、曲池，`4/8=50%`；拳招末三段为曲池、手三里、合谷 |
| T-SJ-BL-06 天池互异 | 比较两条天池路线穴位集合 | 无共享穴位，`0/8=0%` |
| T-SJ-BL-07 调和调息 | 9 品 10 重调和 | `reliefBp=2310`、`repairUnits=541` |
| T-SJ-BL-08 正常习得 | 非 Boss 角色满足属性、前置及师承 / 谱本许可 | 可研习对应新武学；不检查 `enemyOnly` |
| T-SJ-BL-09 来源扩展 | 构建 `ch12_shujian` 可得池 | **已解决：**通行册已包含 `sk_baizhanxinfa`，本文只保留追溯登记而不复制定义 |
| T-SJ-BL-10 外放审计 | 枚举本文九个 `mv_*` | 全为非外放，外放路线数为 0 |

---

## 8. 待决事项 / 依赖

### 8.1 替下游给出的建议值

| # | 下游 | 建议值 | 当前默认 |
|---|---|---|---|
| SJ-BL-D01 | `chapters/12` | **已解决：**周仲英主运 / 外功用 `sk_tiedanzhuangxinfa` / `sk_tiedanzhuangquan`；陈家洛主运用 `sk_tianchishengong`（见 `chapters/12` §12.9） | 已按地位下限 7 / 9 装配，七项参数读取真实主运 |
| SJ-BL-D02 | NXfix / `skills-general.md` | **已解决：**已为 `sk_baizhanxinfa.sourceChapters` 加入 `ch12_shujian` | 通行册已落实；本文 §3 保留追溯记录 |
| SJ-BL-D03 | `chapters/12` | **已解决：**三门新增武学分别落入铁胆庄误会收束、袁士霄奇遇 / 陈家洛羁绊余韵（见 `chapters/12` §6.4–§6.5、§9.6） | 只复用现有事件，不新增敌专掉落 |

### 8.2 本文依赖的上游事实

- 武学字段、品阶、招式数、绝招资源与 IP 依赖 `design/05`；经脉路线、护体、调息与外放依赖 `design/21`。
- 人物地位下限与首领配装依赖 `design/21` §11.9.1 和 `chapters/12` §12.9；本文不另定义首领画像。
- Buff、穴位和正式经脉 ID 分别依赖 `design/06`、`design/15`；既有书剑武学与通行军伍武学分别依赖 `skills-qianlong.md`、`skills-general.md`。
- 作者“武学按门派 / 来源正常习得，不把 Boss 用招一律做专属”的决定为习得边界；本文三门均据此开放。

### 8.3 对基准的修改提案

本次无须修改基准。补录册使用已登记的 `sk_* / mv_* / ps_* / mfr_* / txp_*` 前缀，并保持天级闭集不变。

### 8.4 原著考据待办

| # | 需核对的书与人物 / 情节 | 本文保守处理 |
|---|---|---|
| SJ-BL-K01 | 《书剑恩仇录》三联 / 广州修订版中周仲英所用拳掌、内功是否出现可直接采用的正式名称 | 仅采用“铁胆庄”来源锚，心法、拳法与招名全部标原创扩展 |
| SJ-BL-K02 | 袁士霄传陈家洛武艺的具体段落，以及陈家洛内功是否有原著专名 | 不写引文、回目或专名断言；“天池神功”明确为原创玩法名 |
| SJ-BL-K03 | 清军将领及假旗队相关情节能否支撑更细的军伍传习文本 | 只复用已定义为历代军伍汇编的 `sk_baizhanxinfa`，不虚构师承人物 |

### 8.5 开放问题（附默认值）

| # | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| SJ-BL-O01 | 是否把铁胆庄登记为正式 `sect_*`？ | 不登记；维持 `sect:null` 与 lineage | 若未来 17 建档，三门卡只需迁移门派外键，不改数值 |
| SJ-BL-O02 | 考据发现陈家洛内功原著专名后，是否替换“天池神功”？ | 暂保留原创名；有可靠版本证据再走重命名表 | 影响 ID / 名称迁移，不影响 9 品主运职责 |
| SJ-BL-O03 | 袁士霄遗谱是否允许陈家洛之外的人物学习？ | 允许满足前置、羁绊与许可者学习，符合作者决定 | 若收紧，只改取得门槛，不能把首领配装改成 `enemyOnly` |
| SJ-BL-O04 | **已解决：**`sk_baizhanxinfa` 是否接受并落实书剑来源扩展？ | 接受；唯一归属 `skills-general.md` 已加入 `ch12_shujian`（见 §3） | 假旗队领与兆惠已有可共享的 8 品真实主运 |
