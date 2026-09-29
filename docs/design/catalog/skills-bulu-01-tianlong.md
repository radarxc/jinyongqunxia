# 武学补录图鉴 · 书界 01《天龙八部》首领主运（`skills-bulu-01-tianlong`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 武学图鉴的书界 01 补录册。本文只定义 NB4a 后确认缺失的三门门派 / 传承内功、招式、被动、经脉路线、调息档案与学习来源。
> **上游**：`docs/decisions/author-requirements.md` AR-14/15/16、`docs/00-canon.md` §3–§5/§9/§12/§16/§18、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/15`、`design/21`。
> **引用而不重定义**：武学字段、IP、招式预算与外放字段见 `design/05`；Buff 见 `design/06`；经脉 / 穴位见 `design/15`；路线、调息、护体内劲及 Boss 地位下限见 `design/21`；门派与职级见 `design/17`；既有大理 / 丐帮武学见 `skills-wujue.md`，既有逍遥 / 灵鹫武学见 `skills-xiaoyao.md`。
> **覆盖声明**：本文不覆写现有十一册图鉴；同门既有条目继续由原册唯一拥有。三门补录均可由玩家与其他合格人物按门派、师承或图谱正常习得，不是 `enemyOnly` 或首领私有武学。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（待考）**为须按三联 / 广州修订版核对的小说事实；**【建议值】**为待归属文档确认的数值。
> **版本**：NXB01 首领武学补录与替补替换（2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）。

---

## 0. 阅读指引与统一记法

### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-28）

每记绝招只在本索引展开一次穴位序列；正文卡的 `MoveDef` 与 §0.2 只引用稳定 `mfr_*`。路线均属**（原创扩展）**玩法抽象，不反推现实经络疗效。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 11 天中 | `sk_duanshiyangjue` | `mv_duanshiyangjue_yiyang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_duanshiyangjue_yiyang}` | `mfr_duanshiyangjue_yiyang` | `MeridianRouteDef{moveRef:mv_duanshiyangjue_yiyang; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_qichong/80/100→ap_chongmai_qixue/80/120→ap_chongmai_dahe/80/140→ap_renmai_shimen/80/180→ap_renmai_shenque/80/160→ap_dumai_yaoshu/80/360→ap_dumai_yaoyangguan/80/180→ap_dumai_mingmen/80/160→ap_renmai_qihai/80/120→ap_renmai_guanyuan/80/100` |
| 11 天中 | `sk_duanshiyangjue` | `mv_duanshiyangjue_zhouliu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_duanshiyangjue_zhouliu}` | `mfr_duanshiyangjue_zhouliu` | `MeridianRouteDef{moveRef:mv_duanshiyangjue_zhouliu; ultimate:true; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_youmen/80/100→ap_chongmai_zhongzhu/80/120→ap_chongmai_huangshu/80/140→ap_chongmai_shangqu/80/160→ap_daimai_zhangmen/80/360→ap_daimai_jingmen/80/180→ap_dumai_shenzhu/80/220→ap_dumai_shendao/80/180→ap_renmai_zhongwan/80/140→ap_renmai_danzhong/80/100` |
| 12 天上 | `sk_xianglongxinggong` | `mv_xianglongxinggong_honglu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_honglu}` | `mfr_xianglongxinggong_honglu` | `MeridianRouteDef{moveRef:mv_xianglongxinggong_honglu; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_dumai_changqiang/80/100→ap_dumai_jizhong/80/120→ap_dumai_mingmen/80/140→ap_dumai_zhiyang/80/160→ap_dumai_shendao/80/180→ap_dumai_baihui/80/140→ap_chongmai_qichong/80/360→ap_chongmai_qixue/80/180→ap_renmai_qihai/80/160→ap_renmai_guanyuan/80/120` |
| 12 天上 | `sk_xianglongxinggong` | `mv_xianglongxinggong_guanmai` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_guanmai}` | `mfr_xianglongxinggong_guanmai` | `MeridianRouteDef{moveRef:mv_xianglongxinggong_guanmai; ultimate:true; purpose:attack; requiredNature:[yang,harmony]}`；`ap_chongmai_henggu/80/100→ap_chongmai_dahe/80/120→ap_chongmai_huangshu/80/140→ap_chongmai_zhongzhu/80/160→ap_dumai_yaoshu/80/360→ap_dumai_yaoyangguan/80/180→ap_dumai_shenzhu/80/160→ap_shoujueyin_quze/80/360→ap_shoujueyin_neiguan/80/140→ap_shoujueyin_laogong/80/100` |
| 12 天上 | `sk_xianglongxinggong` | `mv_xianglongxinggong_tianxing` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_tianxing}` | `mfr_xianglongxinggong_tianxing` | `MeridianRouteDef{moveRef:mv_xianglongxinggong_tianxing; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_renmai_huiyin/80/100→ap_renmai_shimen/80/120→ap_renmai_shenque/80/140→ap_renmai_zhongwan/80/160→ap_renmai_danzhong/80/180→ap_yangqiao_fuyang/80/360→ap_yangqiao_shenmai/80/180→ap_yangwei_fengfu/80/220→ap_yangwei_yamen/80/160→ap_dumai_baihui/80/120` |
| 11 天中 | `sk_tianshanliuyangxinfa` | `mv_tianshanliuyangxinfa_hemai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_hemai}` | `mfr_tianshanliuyangxinfa_hemai` | `MeridianRouteDef{moveRef:mv_tianshanliuyangxinfa_hemai; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_chongmai_qichong/80/100→ap_chongmai_qixue/80/120→ap_chongmai_dahe/80/140→ap_chongmai_huangshu/80/160→ap_daimai_zulinqi/80/360→ap_daimai_weidao/80/180→ap_daimai_daimai/80/160→ap_dumai_zhiyang/80/180→ap_dumai_shendao/80/140→ap_dumai_baihui/80/100` |
| 11 天中 | `sk_tianshanliuyangxinfa` | `mv_tianshanliuyangxinfa_guiyuan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_guiyuan}` | `mfr_tianshanliuyangxinfa_guiyuan` | `MeridianRouteDef{moveRef:mv_tianshanliuyangxinfa_guiyuan; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_chongmai_yindu/80/100→ap_chongmai_futonggu/80/120→ap_chongmai_shiguan/80/140→ap_chongmai_shangqu/80/160→ap_chongmai_youmen/80/180→ap_renmai_danzhong/80/360→ap_daimai_jingmen/80/180→ap_daimai_wushu/80/160→ap_renmai_qihai/80/140→ap_renmai_guanyuan/80/100` |
<!-- skill-catalog-audit:end -->

### 0.1 内容边界与品阶口径

| 缺口 | 复用审计 | 本文处理 |
|---|---|---|
| 段延庆 11 | `sk_duanshiyangshenggong` 仅 6；`sk_kurongchangong` 9 且无段延庆师承依据 | 补大理段氏调和内功 `sk_duanshiyangjue`（11） |
| 萧峰 12 | `sk_jiudaixingong` 仅 6；玄苦师承不足以证明其习得 `sk_yijinjing` | 补丐帮帮主传承内功 `sk_xianglongxinggong`（12） |
| 天山童姥 11 | 原著内功 `sk_bahuang` 已有但仅 10 | 补灵鹫 / 逍遥六阳行功 `sk_tianshanliuyangxinfa`（11） |

三门都是为门派或既有武学传承补齐的进阶内功；显示名与成套机制均为**（原创扩展）**。天中两门按“浑厚行气、非多套著名绝学”取 2 绝招；天上取 3 绝招，解锁层依次为 7 / 9 / 10。

### 0.2 普通招式显式路线

| 武学 / 招式 | 路线 ID | steps（acupointRef/segmentCt/riskBp） | ΣCT |
|---|---|---|---:|
| `sk_duanshiyangjue` / `mv_duanshiyangjue_yangqi` | `mfr_duanshiyangjue_yangqi` | `MeridianRouteDef{moveRef:mv_duanshiyangjue_yangqi; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_qichong/70/80→ap_chongmai_qixue/70/100→ap_renmai_qihai/70/140→ap_renmai_guanyuan/70/100→ap_renmai_zhongwan/70/80` | 350 |
| `sk_duanshiyangjue` / `mv_duanshiyangjue_humai` | `mfr_duanshiyangjue_humai` | `MeridianRouteDef{moveRef:mv_duanshiyangjue_humai; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_chongmai_henggu/70/80→ap_chongmai_dahe/70/100→ap_renmai_shimen/70/140→ap_renmai_shenque/70/100→ap_dumai_mingmen/70/360→ap_dumai_zhiyang/70/120` | 420 |
| `sk_duanshiyangjue` / `mv_duanshiyangjue_guanyuan` | `mfr_duanshiyangjue_guanyuan` | `MeridianRouteDef{moveRef:mv_duanshiyangjue_guanyuan; ultimate:false; purpose:defense; requiredNature:[harmony]}`；`ap_renmai_huiyin/75/80→ap_chongmai_siman/75/180→ap_chongmai_shiguan/75/100→ap_chongmai_shangqu/75/100→ap_renmai_qihai/75/140→ap_renmai_guanyuan/75/80` | 450 |
| `sk_xianglongxinggong` / `mv_xianglongxinggong_xushi` | `mfr_xianglongxinggong_xushi` | `MeridianRouteDef{moveRef:mv_xianglongxinggong_xushi; ultimate:false; purpose:defense; requiredNature:[yang,harmony]}`；`ap_chongmai_qichong/75/100→ap_chongmai_qixue/75/120→ap_dumai_mingmen/75/360→ap_dumai_zhiyang/75/160→ap_dumai_shendao/75/140→ap_dumai_baihui/75/120` | 450 |
| `sk_xianglongxinggong` / `mv_xianglongxinggong_huti` | `mfr_xianglongxinggong_huti` | `MeridianRouteDef{moveRef:mv_xianglongxinggong_huti; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_renmai_qihai/75/80→ap_renmai_guanyuan/75/100→ap_chongmai_dahe/75/160→ap_chongmai_huangshu/75/120→ap_dumai_shenzhu/75/360→ap_dumai_baihui/75/140` | 450 |
| `sk_tianshanliuyangxinfa` / `mv_tianshanliuyangxinfa_tuna` | `mfr_tianshanliuyangxinfa_tuna` | `MeridianRouteDef{moveRef:mv_tianshanliuyangxinfa_tuna; ultimate:false; purpose:defense; requiredNature:[yang,harmony]}`；`ap_chongmai_qichong/70/80→ap_chongmai_qixue/70/100→ap_chongmai_dahe/70/120→ap_daimai_zulinqi/70/360→ap_daimai_weidao/70/140→ap_daimai_daimai/70/100` | 420 |
| `sk_tianshanliuyangxinfa` / `mv_tianshanliuyangxinfa_huanxi` | `mfr_tianshanliuyangxinfa_huanxi` | `MeridianRouteDef{moveRef:mv_tianshanliuyangxinfa_huanxi; ultimate:false; purpose:defense; requiredNature:[yang,harmony]}`；`ap_chongmai_henggu/75/80→ap_chongmai_siman/75/100→ap_chongmai_shiguan/75/120→ap_daimai_zhangmen/75/360→ap_daimai_jingmen/75/140→ap_renmai_qihai/75/180→ap_renmai_guanyuan/75/100` | 525 |
| `sk_tianshanliuyangxinfa` / `mv_tianshanliuyangxinfa_huti` | `mfr_tianshanliuyangxinfa_huti` | `MeridianRouteDef{moveRef:mv_tianshanliuyangxinfa_huti; ultimate:false; purpose:defense; requiredNature:[yang,harmony]; innerGuard:{enabled:true,reflectBp:0}}`；`ap_daimai_wushu/75/80→ap_daimai_weidao/75/100→ap_chongmai_youmen/75/180→ap_dumai_mingmen/75/360→ap_dumai_shendao/75/140→ap_dumai_baihui/75/120` | 450 |

普通招式与绝招均满足 1–18 段、单段 CT 40–120、风险 0–1200；绝招统一 `1200+10×80=2000 CT`，普通招式的 `recovery+ΣCT` 最大为 `1000+525=1525 CT`。

### 0.3 内功调息与护体内劲档案

| 内功 | BreathProfile.id | `grade / layer / nature / scope` | `ct / mpCostBp / outOfBattleScaleBp` | `inner.innerGuard` / 护体显示档 | 满层基础核算 |
|---|---|---|---|---|---|
| `sk_duanshiyangjue` | `txp_duanshiyangjue` | `11 / 10 / harmony / 3` | `1000 / 0 / 15000`；`outOfBattleScaleBp:15000` | `{enabled:true,reflectBp:0}` / IV（天·调和） | `reliefBp=min(2500,floor((500+1100+800)×1.05))=2500`；`repairUnits=floor((120+264+180)×1.05)=592` |
| `sk_xianglongxinggong` | `txp_xianglongxinggong` | `12 / 10 / yang / 3` | `1000 / 0 / 15000`；`outOfBattleScaleBp:15000` | `{enabled:true,reflectBp:0}` / IV（天·阳） | `reliefBp=500+1200+800=2500`；`repairUnits=120+288+180=588` |
| `sk_tianshanliuyangxinfa` | `txp_tianshanliuyangxinfa` | `11 / 10 / yang / 3` | `1000 / 0 / 15000`；`outOfBattleScaleBp:15000` | `{enabled:true,reflectBp:0}` / IV（天·阳） | `reliefBp=500+1100+800=2400`；`repairUnits=120+264+180=564` |

三档均使用 `design/21` §10 通用公式，无特色倍率；`outOfBattleScaleBp=15000`。护体显示档 IV 只用于 UI；抵消容量仍按 `design/21` §4.8 随当前内力、主运层数与难度动态计算。护体内劲只在自然护体或标有 `innerGuard` 的防守路线启用，反震固定为 0。

## 1. 大理段氏 `sect_dali`

### 1.1 `sk_duanshiyangjue` 段氏一阳诀（11 天中 · 内功 · 调和）（原创扩展）

- **出处与边界**：原著有大理段氏一阳指与段氏家传武学；未见“一阳诀”作为独立成套内功之名，名称、招式及机制均为**（原创扩展）**。段延庆所学具体行功层次仍**（待考）**；本卡只据同族传承补一门玩家可学的段氏进阶内功，不把它写成段延庆独门。
- **字段**：`category:inner` · `subType:inner` · `grade:11` · `origin:expanded` · `sect:sect_dali` · `lineage:大理段氏一阳指传承` · `sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]` · `canonRef:null` · `nature:harmony` · `wOut/wIn:0/1` · `moveSlots:5` · `observable:false` · `special:{fusible:true}` · `description:以段氏一阳指传承为根的调和行功，不是段延庆私有武学`。
- **图鉴体系**：与 `skills-wujue.md` §5 的大理段氏 / 天龙寺条目属于同一门派体系；该册仍唯一拥有既有段氏武学，本文只拥有本卡。
- **reqs**：`attrs {con:55,wis:55,wil:50}`、`aptitude {apInner:55}`、`prereq [{skill:sk_duanshiyangshenggong,layer:6},{skill:sk_yiyangzhi,layer:5}]`、`sect {id:sect_dali,rank:4}`；`hard:[sect,prereq]`。
- **内功**：`inner.meridians:[mer_chongmai,mer_renmai,mer_dumai]`；`inner.breathProfileRef:txp_duanshiyangjue`；`inner.innerGuard:{enabled:true,reflectBp:0}`。冲脉负责调和承接，任脉蓄气、督脉护体；三脉关系及路线是**（原创扩展）**配表。
- **内功贡献**：`{mpMaxPct:48,hpMaxPct:29,attrs:{con:7,wis:7,wil:7},mpRegen:3.3,stats:{resInjury:10,resSeal:10}}`；`IP=48+29+2×(7+7+7)+5×3.3=135.5`，精确命中天中预算。
- **层数**：1 重一阳养气、段氏心源｜3 重护脉｜5 重关元回息｜**7 重第一绝招·一阳归元**｜8 重阴阳承接｜**9 重第二绝招·任督周流**｜10 重一阳圆融。

| 招式 | ID | 层 | 类 / 目标 | 耗内 / cd / 收招 | 效果与外放 | 路线 / 核算 |
|---|---|---:|---|---|---|---|
| 一阳养气 **（原创扩展）** | `mv_duanshiyangjue_yangqi` | 1 | 支援 / 自身 | 6% / 2 / 900 | `bf_dingxin` 2；`projection:false` | `MoveDef{unlock:1; ultimate:false; mpCost:6%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_duanshiyangjue_yangqi}` |
| 段氏护脉 **（原创扩展）** | `mv_duanshiyangjue_humai` | 3 | 支援 / 自身 | 7% / 3 / 950 | `bf_jiangu` 2；`projection:false` | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:3; recovery:950; projection:false; meridianRouteRef:mfr_duanshiyangjue_humai}` |
| 关元回息 **（原创扩展）** | `mv_duanshiyangjue_guanyuan` | 5 | 支援 / 自身 | 8% / 3 / 1000 | 回复 `mpMax×12%`；`projection:false` | `MoveDef{unlock:5; ultimate:false; mpCost:8%; cd:3; recovery:1000; projection:false; meridianRouteRef:mfr_duanshiyangjue_guanyuan}` |
| 一阳归元（第一绝招，**原创扩展**） | `mv_duanshiyangjue_yiyang` | 7 | 绝招支援 / 自身 | 10% / 0 / 1200 | 回复 `hpMax×25%`，驱散 1 个 `injury.qi`；`projection:false` | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_duanshiyangjue_yiyang}` |
| 任督周流（第二绝招，**原创扩展**） | `mv_duanshiyangjue_zhouliu` | 9 | 绝招支援 / 自身 | 10% / 0 / 1200 | `bf_hutizhenqi` 3，`shieldPctHpMax:0.15`；`projection:false` | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_duanshiyangjue_zhouliu}` |

| 被动 | ID | 层 | 效果 | 辅运 |
|---|---|---:|---|---|
| 段氏心源 **（原创扩展）** | `ps_duanshiyangjue_xinyuan` | 1 | 主运时 `resSeal +4→+10` | scaled |
| 阴阳承接 **（原创扩展）** | `ps_duanshiyangjue_chengjie` | 8 | 调和桥接沿 `design/05` §5.4；不另加 Z5 | full |
| 一阳护元 **（原创扩展）** | `ps_duanshiyangjue_huyuan` | 9 | 自身获得的护体真气收益 `+5%→+12%`，仍受 `shieldMax` | none |
| 一阳圆融 **（原创扩展）** | `ps_duanshiyangjue_yuanrong` | 10 | 每战首次调息额外清除一个不高于自身品阶的 1–6 级点穴；仍走 `design/21` §10 成功检定 | none |

- **路线叙事与互异**：两记绝招同以冲脉承接，但“一阳归元”走任督回护丹田，“任督周流”改由带脉横转后收于胸腹；共享穴位为 0/10，不是轮换或逆序。普通招式分别承担养气、护脉与回息。
- **learnSources**：`master ch01 npc_duanzhengming`（段氏 L4 且护谱有功，`maxLayer:10`，**原创扩展**）；`puzzle ch01 q_01_faction_01`（天龙寺护谱后获准参详段氏行功图，`maxLayer:8`，`reqsOverride {sect:null,hard:[prereq]}`，**原创扩展**）。射雕 / 神雕的一灯门下如投放，须由对应章节补来源实例，不另造武学 ID。
- **setTags / conflicts**：`[]` / 无。若未来纳入既有大理一阳套装，由 `design/07` 唯一登记，本文不越权扩成员。

## 2. 丐帮 `sect_gaibang`

### 2.1 `sk_xianglongxinggong` 降龙行功（12 天上 · 内功 · 阳）（原创扩展）

- **出处与边界**：萧峰以内力催动降龙十八掌、掌力刚猛是原著人物与武学表现；未见“降龙行功”作为独立成套内功名，名称、招式及机制均为**（原创扩展）**。本卡补的是丐帮帮主级传承，不宣称原著另有一部秘籍，也不限定萧峰一人可用。
- **字段**：`category:inner` · `subType:inner` · `grade:12` · `origin:expanded` · `sect:sect_gaibang` · `lineage:丐帮掌法行功 → 帮主传承` · `sourceChapters:[ch01_tianlong,ch02_shediao,ch03_shendiao]` · `canonRef:null` · `nature:yang` · `wOut/wIn:0/1` · `moveSlots:5` · `observable:false` · `special:{fusible:true}` · `description:以丐帮降龙掌法为前置的帮主级行功，不是萧峰私有武学`。
- **图鉴体系**：与 `skills-wujue.md` §2 的丐帮条目属于同一门派体系；该册仍唯一拥有既有丐帮武学，本文只拥有本卡。
- **reqs**：`attrs {str:60,con:60,wil:55}`、`aptitude {apInner:60}`、`prereq [{skill:sk_jiudaixingong,layer:6},{skill:sk_xianglong18,layer:7}]`、`sect {id:sect_gaibang,rank:5,bagCount:9}`；`hard:[sect,prereq]`。非帮主师承可用来源 `reqsOverride` 解除职级，但不解除两门前置。
- **内功**：`inner.meridians:[mer_dumai,mer_chongmai]`；`inner.breathProfileRef:txp_xianglongxinggong`；`inner.innerGuard:{enabled:true,reflectBp:0}`。督脉蓄刚、冲脉承接为丐帮门派核心；任脉只在护体 / 回元路线作阳性跨脉，换脉点提高风险。
- **内功贡献**：`{mpMaxPct:56,hpMaxPct:34,attrs:{str:8,con:8,wil:8},mpRegen:3.6,stats:{tough:10,resCC:10}}`；`IP=56+34+2×(8+8+8)+5×3.6=156`，精确命中天上预算。
- **层数**：1 重降龙蓄势、刚气护身｜4 重掌息相随｜6 重刚柔换脉｜**7 重第一绝招·洪炉护元**｜8 重气贯掌心｜**9 重第二绝招·贯脉成掌**｜**10 重第三绝招·天行不息**、行功大成。

| 招式 | ID | 层 | 类 / 目标 | 耗内 / cd / 收招 | 效果与外放 | 路线 / 核算 |
|---|---|---:|---|---|---|---|
| 降龙蓄势 **（原创扩展）** | `mv_xianglongxinggong_xushi` | 1 | 架势 / 自身 | 7% / 3 / 900 | `bf_xushi` 2；`projection:false` | `MoveDef{unlock:1; ultimate:false; mpCost:7%; cd:3; recovery:900; projection:false; meridianRouteRef:mfr_xianglongxinggong_xushi}` |
| 刚气护身 **（原创扩展）** | `mv_xianglongxinggong_huti` | 4 | 支援 / 自身 | 8% / 3 / 950 | `bf_hutizhenqi` 2，`shieldPctHpMax:0.10`；`projection:false` | `MoveDef{unlock:4; ultimate:false; mpCost:8%; cd:3; recovery:950; projection:false; meridianRouteRef:mfr_xianglongxinggong_huti}` |
| 洪炉护元（第一绝招，**原创扩展**） | `mv_xianglongxinggong_honglu` | 7 | 绝招支援 / 自身 | 10% / 0 / 1200 | `bf_renjin` 3、`bf_wenzhong` 3；`projection:false` | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_honglu}` |
| 贯脉成掌（第二绝招，**原创扩展**） | `mv_xianglongxinggong_guanmai` | 9 | 绝招架势 / 自身 | 10% / 0 / 1200 | `bf_gongshi` 3；为下一记掌法蓄劲，本招自身不伤敌；`projection:false` | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_guanmai}` |
| 天行不息（第三绝招，**原创扩展**） | `mv_xianglongxinggong_tianxing` | 10 | 绝招支援 / 自身 | 10% / 0 / 1200 | 回复 `mpMax×25%`，`bf_juqi` 2；`projection:false` | `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_xianglongxinggong_tianxing}` |

| 被动 | ID | 层 | 效果 | 辅运 |
|---|---|---:|---|---|
| 掌息相随 **（原创扩展）** | `ps_xianglongxinggong_zhangxi` | 4 | 装配 `sk_xianglong18` 时，本功调息后下一记降龙掌耗内 `−4%→−10%`；不改招式伤害 | scaled |
| 刚柔换脉 **（原创扩展）** | `ps_xianglongxinggong_huanmai` | 6 | 阳性路线遇一次任脉换脉时，该节点 `riskBp −100→−250`，最低 0 | full |
| 气贯掌心 **（原创扩展）** | `ps_xianglongxinggong_zhangxin` | 8 | 降龙掌路线完整通过时获得 `bf_renjin` 1；每回合至多一次 | scaled |
| 行功大成 **（原创扩展）** | `ps_xianglongxinggong_dacheng` | 10 | 主运时首次护体内劲被击穿，返还该次护体耗内的 20%；不产生反震 | none |

- **路线叙事与互异**：“洪炉护元”沿督脉上提再以冲、任收护；它与既有阳 / 调和防守招共享任督六穴的通用护体底子，故跨武学集合重合达到人工复核线，但本路线新增长强、脊中与冲脉两穴，并以“督脉上提→冲脉强转→任脉收束”的十段次序区别于六段自然护体短路。“贯脉成掌”从冲脉贯督而落掌心，末段符合掌法端点但招式本身只蓄势；“天行不息”由任脉起、跷维调身而归百会。按“洪炉护元 / 贯脉成掌、洪炉护元 / 天行不息、贯脉成掌 / 天行不息”顺序，三组共享穴位分别为 0/10、1/10、0/10，均不超过 50%，且职责、起点、换脉与终点皆不同。
- **learnSources**：`master ch01 npc_xiaofeng`（完成 `q_01_bond_71`、尊重其身份决定，保留两门前置；`maxLayer:10`，**原创扩展**）；`master ch02 npc_hongqigong`（丐帮 L5 或高羁绊，`reqsOverride` 仅解除帮主职级，`maxLayer:10`，**原创扩展**）。神雕若沿洪七公传承投放，只引用本 ID。
- **setTags / conflicts**：`[]` / 无。既有丐帮帮主与契丹萧峰套装是否纳入本功须由 `design/07` 决定。

## 3. 灵鹫宫 `sect_lingjiu` / 逍遥派 `sect_xiaoyao`

### 3.1 `sk_tianshanliuyangxinfa` 天山六阳心法（11 天中 · 内功 · 阳）（原创扩展）

- **出处与边界**：原著有天山六阳掌、八荒六合唯我独尊功及童姥 / 虚竹传承；未见“天山六阳心法”作为独立成套内功名，名称、招式与机制均为**（原创扩展）**。它是六阳掌的进阶行功配套，不取代原著已有的 `sk_bahuang`，也不做童姥个人私有功夫。
- **字段**：`category:inner` · `subType:inner` · `grade:11` · `origin:expanded` · `sect:sect_lingjiu` · `lineage:逍遥派 → 灵鹫宫六阳掌传承` · `sourceChapters:[ch01_tianlong]` · `canonRef:null` · `nature:yang` · `wOut/wIn:0/1` · `moveSlots:5` · `observable:false` · `special:{fusible:true}` · `description:配合天山六阳掌的进阶行功，不是童姥私有武学`。
- **图鉴体系**：与 `skills-xiaoyao.md` §2–§3 的逍遥派 / 灵鹫宫条目属于同一门派体系；该册仍唯一拥有既有逍遥、灵鹫武学，本文只拥有本卡。
- **reqs**：`attrs {con:55,wis:55,wil:50}`、`aptitude {apInner:55}`、`prereq [{skill:sk_lingjiuxinfa,layer:6},{skill:sk_liuyangzhang,layer:7}]`、`sect {id:sect_lingjiu,rank:4}`；`hard:[sect,prereq]`。逍遥嫡传与石壁途径由 `reqsOverride` 分流。
- **内功**：`inner.meridians:[mer_chongmai,mer_daimai,mer_dumai]`；`inner.breathProfileRef:txp_tianshanliuyangxinfa`；`inner.innerGuard:{enabled:true,reflectBp:0}`。冲、带二脉承接逍遥横向转换，阳性护体接督脉。
- **内功贡献**：`{mpMaxPct:48,hpMaxPct:29,attrs:{con:7,wis:7,wil:7},mpRegen:3.3,stats:{resCold:10,resCC:10}}`；`IP=48+29+2×(7+7+7)+5×3.3=135.5`，精确命中天中预算。
- **层数**：1 重六阳吐纳｜3 重换息｜5 重六阳护体｜**7 重第一绝招·六合脉**｜8 重阳息流转｜**9 重第二绝招·六阳归元**｜10 重六阳大成。

| 招式 | ID | 层 | 类 / 目标 | 耗内 / cd / 收招 | 效果与外放 | 路线 / 核算 |
|---|---|---:|---|---|---|---|
| 六阳吐纳 **（原创扩展）** | `mv_tianshanliuyangxinfa_tuna` | 1 | 支援 / 自身 | 6% / 2 / 900 | `bf_tiaoxi` 1；`projection:false` | `MoveDef{unlock:1; ultimate:false; mpCost:6%; cd:2; recovery:900; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_tuna}` |
| 换息 **（原创扩展）** | `mv_tianshanliuyangxinfa_huanxi` | 3 | 支援 / 自身 | 7% / 3 / 950 | 驱散 1 个 `cc.slow`；`projection:false` | `MoveDef{unlock:3; ultimate:false; mpCost:7%; cd:3; recovery:950; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_huanxi}` |
| 六阳护体 **（原创扩展）** | `mv_tianshanliuyangxinfa_huti` | 5 | 支援 / 自身 | 8% / 3 / 1000 | `bf_hutizhenqi` 2，`shieldPctHpMax:0.10`；`projection:false` | `MoveDef{unlock:5; ultimate:false; mpCost:8%; cd:3; recovery:1000; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_huti}` |
| 六合脉（第一绝招，**原创扩展**） | `mv_tianshanliuyangxinfa_hemai` | 7 | 绝招支援 / 自身 | 10% / 0 / 1200 | `bf_wenzhong` 3、`bf_youshi` 2；`projection:false` | `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_hemai}` |
| 六阳归元（第二绝招，**原创扩展**） | `mv_tianshanliuyangxinfa_guiyuan` | 9 | 绝招支援 / 自身 | 10% / 0 / 1200 | 回复 `hpMax×20%` 与 `mpMax×15%`；`projection:false` | `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; projection:false; meridianRouteRef:mfr_tianshanliuyangxinfa_guiyuan}` |

| 被动 | ID | 层 | 效果 | 辅运 |
|---|---|---:|---|---|
| 冲带相承 **（原创扩展）** | `ps_tianshanliuyangxinfa_chengdai` | 1 | 冲脉接带脉的首个换脉节点 `riskBp −80→−200`，最低 0 | full |
| 阳息流转 **（原创扩展）** | `ps_tianshanliuyangxinfa_liuzhuan` | 4 | 施放本功非绝招后，下一记 `sk_liuyangzhang` 耗内 `−3%→−8%` | scaled |
| 寒中见阳 **（原创扩展）** | `ps_tianshanliuyangxinfa_hanyang` | 8 | 自身受 `cold` 类效果时 `resCold +5→+12`；不免疫寒冷 | scaled |
| 六阳大成 **（原创扩展）** | `ps_tianshanliuyangxinfa_dacheng` | 10 | 每战首次完成 10 段防守路线后，清除该路线最高一个节点的 500 `stagnationBp` | none |

- **路线叙事与互异**：“六合脉”以冲脉起、带脉横转、督脉护顶；“六阳归元”由冲脉腹段起势，经任脉膻中转入带脉，最后回到任脉丹田。共享穴位为 0/10，不是轮换或逆序；前者偏稳身，后者偏回元。

| 路线叙事第三轮同步镜像 | 模板代号 | 段数 | 路线 CT | 收招合计 | 风险列表 / 总风险 |
|---|---|---:|---:|---:|---|
| `mfr_tianshanliuyangxinfa_guiyuan` | 见文首索引 | 10 | `10×80=800` | `1200+800=2000 CT` | `[100,120,140,160,180,360,180,160,140,100]` / `1640` |
- **learnSources**：`master ch01 npc_tonglao`（灵鹫 L4、六阳掌 7 重，`maxLayer:10`，**原创扩展**）；`master ch01 npc_xuzhu`（逍遥 / 灵鹫 rank 4，`reqsOverride {sect:{id:sect_xiaoyao,rank:4},hard:[sect,prereq]}`，`maxLayer:10`，**原创扩展**）；`puzzle ch01 q_01_side_72`（石壁行功图，解除门派硬门槛但保留六阳掌前置，`maxLayer:8`，**原创扩展**）。
- **setTags / conflicts**：`[]` / 与阴性主运按 `design/05` §5.4 处理阴阳相冲；不替代 `sk_bahuang` 的返老还童代价。

## 4. 外放候选审计表

| 武学 | 招式数 | `projection:true` | `projection:false` | 逐招判断 |
|---|---:|---:|---:|---|
| `sk_duanshiyangjue` | 5 | 0 | 5 | 养气、护脉、回息、疗伤与护体均为自身支援，不离体伤敌 |
| `sk_xianglongxinggong` | 5 | 0 | 5 | 两记普通招与三绝招均为蓄势、护体或回元；真正掌力外放仍由 `sk_xianglong18` 的具体掌招逐招判定 |
| `sk_tianshanliuyangxinfa` | 5 | 0 | 5 | 调息、解缓、护体、稳身与回元均为自身支援；不因名称含“六阳”自动外放 |
| **合计** | **15** | **0** | **15** | 无招式写 `projectionSpreadSteps`；符合 `projection:false` 时不得保留数组的约束 |

## 5. 来源扩展登记

本次没有仅需扩充既有武学 `sourceChapters` 的情形；三项缺口都需新增武学卡。跨时代延续已直接写入新卡自身 `sourceChapters`，不是对旧图鉴的来源扩展。

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | — | 无来源扩展待 NXfix 落实 |

## 6. 统计表

| 门派 / 体系 | 天上 | 天中 | 武学 | 主动招式 | 绝招 | 外放 |
|---|---:|---:|---:|---:|---:|---:|
| 大理段氏 | 0 | 1 | 1 | 5 | 2 | 0 |
| 丐帮 | 1 | 0 | 1 | 5 | 3 | 0 |
| 灵鹫 / 逍遥 | 0 | 1 | 1 | 5 | 2 | 0 |
| **合计** | **1** | **2** | **3** | **15** | **7** | **0** |

三门均为内功、均为**（原创扩展）**，共登记 15 条主动路线、3 份 `txp_*`。本册贡献天级 `+3`（天下 / 天中 / 天上 `+0/+2/+1`）；作者随后批准全 14 册扩容，普通天级最终为 `59=9+18+32`，见 Canon v1.6 变更记录 V16-01。

## 本文新增术语与 ID

| 类别 | 数量 | 新增 ID |
|---|---:|---|
| 武学 | 3 | `sk_duanshiyangjue`、`sk_xianglongxinggong`、`sk_tianshanliuyangxinfa` |
| 招式 | 15 | `mv_duanshiyangjue_yangqi`、`mv_duanshiyangjue_humai`、`mv_duanshiyangjue_guanyuan`、`mv_duanshiyangjue_yiyang`、`mv_duanshiyangjue_zhouliu`；`mv_xianglongxinggong_xushi`、`mv_xianglongxinggong_huti`、`mv_xianglongxinggong_honglu`、`mv_xianglongxinggong_guanmai`、`mv_xianglongxinggong_tianxing`；`mv_tianshanliuyangxinfa_tuna`、`mv_tianshanliuyangxinfa_huanxi`、`mv_tianshanliuyangxinfa_huti`、`mv_tianshanliuyangxinfa_hemai`、`mv_tianshanliuyangxinfa_guiyuan` |
| 被动 | 12 | `ps_duanshiyangjue_xinyuan`、`ps_duanshiyangjue_chengjie`、`ps_duanshiyangjue_huyuan`、`ps_duanshiyangjue_yuanrong`；`ps_xianglongxinggong_zhangxi`、`ps_xianglongxinggong_huanmai`、`ps_xianglongxinggong_zhangxin`、`ps_xianglongxinggong_dacheng`；`ps_tianshanliuyangxinfa_chengdai`、`ps_tianshanliuyangxinfa_liuzhuan`、`ps_tianshanliuyangxinfa_hanyang`、`ps_tianshanliuyangxinfa_dacheng` |
| 经脉路线 | 15 | 与 15 个 `mv_*` 一一对应的 `mfr_<moveRef 去掉 mv_>` |
| 调息档案 | 3 | `txp_duanshiyangjue`、`txp_xianglongxinggong`、`txp_tianshanliuyangxinfa` |

本文只引用 `sect_dali`、`sect_gaibang`、`sect_lingjiu`、`sect_xiaoyao`、既有 `bf_*` 与任务 / NPC ID，不取得其定义权。

## 数据校验规则与测试用例

| ID | 检查 | 精确通过条件 | 失败级别 |
|---|---|---|---|
| TL-BL-V01 | ID 唯一与命名 | 3 `sk_*`、15 `mv_*`、12 `ps_*`、15 `mfr_*`、3 `txp_*` 全仓无重名；路线 ID 与招式同体 | error |
| TL-BL-V02 | IP | 两门天中各 `48+29+2×21+5×3.3=135.5`；天上 `56+34+2×24+5×3.6=156` | error |
| TL-BL-V03 | 绝招配额 | 天中各 2、天上 3；解锁分别为 7 / 9 与 7 / 9 / 10；资源均为 `100/10%/0/1200` | error |
| TL-BL-V04 | 路线完整 | 15 个主动招式各有唯一显式路线；穴位不重复、段数 1–18、CT 40–120、风险 0–1200、`recovery+ΣCT≤2000` | error |
| TL-BL-V05 | 同门绝招互异 | 同一武学任意绝招共享穴位 ≤ 较短路线 50%；不得完全相同、轮换或逆序 | error |
| TL-BL-V06 | 全图鉴唯一 | 七条绝招路线不得与任何其他武学路线有完全相同的有序穴位序列 | error |
| TL-BL-V07 | 调息 / 护体 | 三份档案均显式 `outOfBattleScaleBp:15000`、天阶 UI 显示档 IV；`innerGuard.reflectBp=0`，容量仍按 `design/21` §4.8 动态计算 | error |
| TL-BL-V08 | 外放 | 15 招全部显式 `projection:false`，无 `projectionSpreadSteps`；外放候选数为 0 | error |
| TL-BL-V09 | 可习得性 | 三门均至少有一条非首领专用的门派 / 师承 / 图谱来源；不存在 `enemyOnly` | error |
| TL-BL-V10 | 章节配装 | `npc_duanyanqing` / `npc_xiaofeng` / `npc_tonglao` 主运分别引用三门补录，七参及轮数不因同品阶替换而改变 | error |

## 待决事项 / 依赖

### 替下游给出的建议值

| 编号 | 下游 / 归属 | 本文采用的建议值 | 回填条件 |
|---|---|---|---|
| TL-BL-D01 | `design/07` / 套装 | 三门 `setTags:[]`，不擅自加入既有套装 | 07 审核大理一阳、丐帮帮主、契丹萧峰或逍遥套装成员后回填 |
| TL-BL-D02 | `design/05` / Buff 数值复核 | 普通护体 10%、天中绝招护体 15%；其余支援效果按同阶卡常见值 | 新武学进入正式数据表并做战斗抽样后回填 |

### 本文依赖的上游事实

| 上游 | 状态与本文采用 |
|---|---|
| `design/05` | **已解决：**按天中 / 天上 IP、5–10 招、4–7 被动、绝招资源与 7 / 9 / 10 解锁配表 |
| `design/15`、`design/21` | **已解决：**只用已登记穴位；所有主动招显式路线，调息、护体和外放均只引用上游算法 |
| `skills-wujue.md`、`skills-xiaoyao.md` | **已解决：**复用既有前置和门派 ID，不改原册；三门新卡分别声明同体系关系 |

### 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| TL-BL-P01 | **已解决：**基准 §13 接纳本册三门，并随全 14 册将普通天级闭集扩为 `59=9+18+32`（见 Canon V16-01） | 作者要求为三名地位兜底首领补真实可学主运；现有图鉴无同源且达标的合法复用项 |

### 原著考据待办

| 编号 | 待核内容 | 当前安全口径 |
|---|---|---|
| TL-BL-K01 | 段延庆原著所显露的内功底子及是否有段氏心法名 | 只认段氏 / 一阳指传承，不宣称“一阳诀”为原著名 |
| TL-BL-K02 | 萧峰内力与降龙掌行功是否有明确专名 | 只认其刚猛掌力表现，不虚构原著秘籍 |
| TL-BL-K03 | 六阳掌、八荒功与生死符的行功关系原文 | 三者仍是独立既有武学；本卡只作原创配套心法 |

### 开放问题（附默认值）

| 编号 | 问题 | 默认值 |
|---|---|---|
| TL-BL-O01 | **已解决：**是否接受三门新增天级 | 已接受并用于首领正式配装；全 14 册天级闭集为 `59=9+18+32`（见 Canon V16-01） |
| TL-BL-O02 | 射雕 / 神雕是否投放三门跨时代来源 | 默认保留新卡 `sourceChapters`，但由对应主书界补具体来源实例；天龙任务不改他书章节 |
| TL-BL-O03 | 三门是否加入既有套装 | 默认不加入，避免补录任务越权改变 `design/07` 成员闭集 |
