# 书界补录武学图鉴 · 10《白马啸西风》

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的按书补录册；本文只定义书界 10 首领画像缺少、且既有十一册门派图鉴无法复用的武学、招式、路线与调息档案。
> **覆盖声明**：不改写 `skills-kangxi.md`；四门补录分别归华辉传承与铁延部草原体系。主角及其他合格人物均可按传授、职级、秘籍或奇遇习得；瓦耳拉齐、马家骏和部族演武首领只是装配者，不拥有排他版本。稳定 ID 中的 `hasake` 仅为兼容键，不是唐代族属显示名。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14–AR-16、`docs/00-canon.md` §3–§5/§9/§12–§13/§16/§18、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/05`、`design/06`、`design/15`、`design/17`、`design/21`。
> **引用而不重定义**：品阶、字段、招式 / 内功预算和习得规则见 `design/05`；Buff 本体见 `design/06`；铁延部的章节职级见 `chapters/10-baima` §7.4（`design/17` 尚待同步）；穴位见 `design/15`；经脉路线、外放、调息和护体内劲见 `design/21`；既有华辉与草原武学只引用 `skills-kangxi.md`。
> **标注约定**：**（原创扩展）**为原著没有的武学、招名或机制；**（原创扩展命名）**为原著有人物、师承或动作依据但名称未见明载；**（待考）**须按三联 / 广州修订版逐字核对；**【建议值】**为待唯一归属文档确认的数值。
> **版本**：首领所缺武学补录（2026-09-28）；经脉与 AR-18 终审（2026-09-29）；AR-26 唐代来源改写（2026-10-02）。

---

## 0. 阅读指引与逐招路线索引

路线按“动作末端 → 明示内功 → 性质经脉族 → 战术职责”配置；仅在本节展开一次，正文卡用 `meridianRouteRef` 引用。普通招为 4 段 × 90 CT，绝招为 8 段 × 90 CT；绝招完整收招 `1200+8×90=1920≤2000 CT`。所有路线均为**（原创扩展）**，不宣称现实经络疗效。

### 0.1 绝招显式路线索引（镜像正文卡，非覆写层）

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 9 地上 | `sk_huahuixinfa` | `mv_huahuixinfa_shoucang` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_huahuixinfa_shoucang;projection:false}` | `mfr_huahuixinfa_shoucang` | `MeridianRouteDef{moveRef:mv_huahuixinfa_shoucang;ultimate:true;purpose:defense;requiredNature:[yin,harmony]}`；`ap_renmai_huiyin/90/100→ap_renmai_zhongji/90/120→ap_renmai_qihai/90/140→ap_yinwei_daheng/90/180→ap_yinwei_qimen/90/200→ap_shoushaoyin_shenmen/90/220→ap_shoujueyin_neiguan/90/240→ap_shoujueyin_laogong/90/260` |
| 9 地上 | `sk_huahuixinfa` | `mv_huahuixinfa_huixi` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;yunjinMode:tiaoxi;meridianRouteRef:mfr_huahuixinfa_huixi;projection:false}` | `mfr_huahuixinfa_huixi` | `MeridianRouteDef{moveRef:mv_huahuixinfa_huixi;ultimate:true;purpose:defense;requiredNature:[yin,harmony]}`；`ap_zushaoyin_yongquan/90/110→ap_yinqiao_zhaohai/90/130→ap_yinwei_zhubin/90/150→ap_renmai_zhongwan/90/170→ap_renmai_danzhong/90/190→ap_shoutaiyin_chize/90/210→ap_shoutaiyin_taiyuan/90/230→ap_shoutaiyin_shaoshang/90/250` |
| 9 地上 | `sk_walalizhi` | `mv_walalizhi_zhenjiang` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_walalizhi_zhenjiang;projection:false}` | `mfr_walalizhi_zhenjiang` | `MeridianRouteDef{moveRef:mv_walalizhi_zhenjiang;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_renmai_qihai/90/100→ap_yinwei_fuai/90/130→ap_zujueyin_ququan/90/150→ap_shoujueyin_tianchi/90/180→ap_shoujueyin_quze/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_daling/90/240→ap_shoujueyin_zhongchong/90/270` |
| 9 地上 | `sk_walalizhi` | `mv_walalizhi_fengmai` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_walalizhi_fengmai;projection:false}` | `mfr_walalizhi_fengmai` | `MeridianRouteDef{moveRef:mv_walalizhi_fengmai;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_zushaoyin_taixi/90/110→ap_yinqiao_lieque/90/140→ap_shoutaiyin_yunmen/90/160→ap_shoutaiyin_chize/90/190→ap_shoutaiyin_kongzui/90/210→ap_shoutaiyin_taiyuan/90/230→ap_shoutaiyin_yuji/90/250→ap_shoutaiyin_shaoshang/90/280` |
| 9 地上 | `sk_majiajunfeizhen` | `mv_majiajunfeizhen_sanzhen` `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_majiajunfeizhen_sanzhen;projection:false}` | `mfr_majiajunfeizhen_sanzhen` | `MeridianRouteDef{moveRef:mv_majiajunfeizhen_sanzhen;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_yinwei_qimen/90/100→ap_zujueyin_zhongdu/90/130→ap_zushaoyin_dazhong/90/150→ap_shoushaoyin_jiquan/90/180→ap_shoushaoyin_shaohai/90/200→ap_shoushaoyin_shenmen/90/220→ap_shoushaoyang_yangchi/90/240→ap_shoushaoyang_guanchong/90/270` |
| 9 地上 | `sk_majiajunfeizhen` | `mv_majiajunfeizhen_shangmai` `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_majiajunfeizhen_shangmai;projection:false}` | `mfr_majiajunfeizhen_shangmai` | `MeridianRouteDef{moveRef:mv_majiajunfeizhen_shangmai;ultimate:true;purpose:attack;requiredNature:[yin,harmony]}`；`ap_renmai_guanyuan/90/110→ap_yinwei_zhubin/90/140→ap_zujueyin_taichong/90/160→ap_shoujueyin_tianquan/90/190→ap_shoujueyin_ximen/90/210→ap_shoujueyin_daling/90/230→ap_shoutaiyang_wangu/90/250→ap_shoutaiyang_shaoze/90/280` |
<!-- skill-catalog-audit:end -->

同一武学的两条绝招路线共享穴位依次为：华辉心法 `0/8`、瓦耳拉齐指 `0/8`、马家骏飞针 `0/8`；三门华辉补录武学跨门配对最多共享 `3/8`，与同源既有 `sk_huahuijian` 绝招最多共享 `1/6`，均不超过 50%，也非轮换或逆序。指法终点分别取中冲、少商；飞针路线以腕 / 指端表达实体投掷动作，不据远程误标真气外放。

### 0.2 非绝招逐招显式路线索引

| 武学 | MoveDef | 路线 ID | MeridianRouteDef 与 steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|
| `sk_huahuixinfa` | `mv_huahuixinfa_naxi` | `mfr_huahuixinfa_naxi` | `MeridianRouteDef{moveRef:mv_huahuixinfa_naxi;ultimate:false;purpose:defense}`；`ap_renmai_huiyin/90/70→ap_renmai_zhongji/90/80→ap_renmai_qihai/90/90→ap_yinwei_daheng/90/120` |
| 〃 | `mv_huahuixinfa_cangqi` | `mfr_huahuixinfa_cangqi` | `MeridianRouteDef{moveRef:mv_huahuixinfa_cangqi;ultimate:false;purpose:defense}`；`ap_yinwei_zhubin/90/80→ap_yinwei_qimen/90/100→ap_renmai_danzhong/90/110→ap_shoushaoyin_shenmen/90/140` |
| 〃 | `mv_huahuixinfa_hushen` | `mfr_huahuixinfa_hushen` | `MeridianRouteDef{moveRef:mv_huahuixinfa_hushen;ultimate:false;purpose:defense}`；`ap_renmai_guanyuan/90/80→ap_renmai_zhongwan/90/90→ap_shoujueyin_neiguan/90/120→ap_shoujueyin_laogong/90/140` |
| `sk_walalizhi` | `mv_walalizhi_tanzhi` | `mfr_walalizhi_tanzhi` | `MeridianRouteDef{moveRef:mv_walalizhi_tanzhi;ultimate:false;purpose:attack}`；`ap_yinwei_fuai/90/90→ap_shoujueyin_quze/90/110→ap_shoujueyin_daling/90/130→ap_shoujueyin_zhongchong/90/160` |
| 〃 | `mv_walalizhi_koumai` | `mfr_walalizhi_koumai` | `MeridianRouteDef{moveRef:mv_walalizhi_koumai;ultimate:false;purpose:attack}`；`ap_yinqiao_lieque/90/90→ap_shoutaiyin_chize/90/110→ap_shoutaiyin_taiyuan/90/130→ap_shoutaiyin_shaoshang/90/160` |
| 〃 | `mv_walalizhi_jiezhi` | `mfr_walalizhi_jiezhi` | `MeridianRouteDef{moveRef:mv_walalizhi_jiezhi;ultimate:false;purpose:attack}`；`ap_zushaoyin_taixi/90/90→ap_shoushaoyin_shaohai/90/110→ap_shoushaoyin_shenmen/90/130→ap_shoushaoyin_shaochong/90/160` |
| `sk_majiajunfeizhen` | `mv_majiajunfeizhen_touzhen` | `mfr_majiajunfeizhen_touzhen` | `MeridianRouteDef{moveRef:mv_majiajunfeizhen_touzhen;ultimate:false;purpose:attack}`；`ap_yinwei_qimen/90/90→ap_shoushaoyin_shenmen/90/110→ap_shoushaoyang_yangchi/90/130→ap_shoushaoyang_guanchong/90/160` |
| 〃 | `mv_majiajunfeizhen_lianzhen` | `mfr_majiajunfeizhen_lianzhen` | `MeridianRouteDef{moveRef:mv_majiajunfeizhen_lianzhen;ultimate:false;purpose:attack}`；`ap_zujueyin_zhongdu/90/90→ap_shoujueyin_ximen/90/110→ap_shoutaiyang_wangu/90/130→ap_shoutaiyang_shaoze/90/160` |
| 〃 | `mv_majiajunfeizhen_yinzhen` | `mfr_majiajunfeizhen_yinzhen` | `MeridianRouteDef{moveRef:mv_majiajunfeizhen_yinzhen;ultimate:false;purpose:attack}`；`ap_renmai_guanyuan/90/90→ap_shoujueyin_tianquan/90/110→ap_shoujueyin_daling/90/130→ap_shoujueyin_zhongchong/90/160` |
| `sk_hasakeyunqi` | `mv_hasakeyunqi_changxi` | `mfr_hasakeyunqi_changxi` | `MeridianRouteDef{moveRef:mv_hasakeyunqi_changxi;ultimate:false;purpose:defense}`；`ap_dumai_changqiang/90/70→ap_dumai_yaoshu/90/80→ap_dumai_mingmen/90/90→ap_dumai_zhiyang/90/110` |
| 〃 | `mv_hasakeyunqi_wenshen` | `mfr_hasakeyunqi_wenshen` | `MeridianRouteDef{moveRef:mv_hasakeyunqi_wenshen;ultimate:false;purpose:defense}`；`ap_yangwei_jinmen/90/80→ap_yangwei_yangjiao/90/90→ap_yangwei_tianliao/90/110→ap_yangwei_jianjing/90/130` |
| 〃 | `mv_hasakeyunqi_huli` | `mfr_hasakeyunqi_huli` | `MeridianRouteDef{moveRef:mv_hasakeyunqi_huli;ultimate:false;purpose:defense}`；`ap_zuyangming_zusanli/90/80→ap_yangqiao_fuyang/90/100→ap_dumai_shenzhu/90/120→ap_dumai_baihui/90/140` |

### 0.3 本轮覆盖表

| 来源体系 | 新增武学 | 解决的首领缺口 | 与既有图鉴关系 |
|---|---|---|---|
| 华辉 | `sk_huahuixinfa` | 瓦耳拉齐、马家骏 9 品真实主运 | 与 `skills-kangxi` §8.7–§8.8 的华辉体系同源 |
| 华辉指法 | `sk_walalizhi` | 瓦耳拉齐“一指镇江南”指法画像 | 同属华辉传承；不是人物排他技能 |
| 华辉飞针 | `sk_majiajunfeizhen` | 马家骏实体暗器与内伤画像 | 同属华辉传承；不是人物排他技能 |
| 铁延部草原体系 | `sk_hasakeyunqi` | 部族演武首领 5 品本门主运 | 接 `skills-kangxi` §8.4–§8.5；ID 不改、显示来源唐代化 |

## 1. 华辉传承

华辉（瓦耳拉齐）收李文秀为徒、使用针具，以及马家骏为其前弟子等人物与师承骨架取自小说，具体字词与动作仍须纸本终校**（待考）**。下列心法、指法、飞针总名和全部招名均为游戏所补，不冒充原著正式武学名。三门以同一传承链开放，但用途不同；任何合资格角色都可学，不因角色姓名而锁定。

### 1.1 `sk_huahuixinfa` 华辉心法（9 地上 · 内功 · 华辉）**（原创扩展）**

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `null` / 华辉；与 `skills-kangxi.md` §8.7–§8.8 同体系 |
| sourceChapters | `[ch10_baima]` |
| category / subType / grade | `inner / inner / 9` |
| nature · wOut/wIn · aptitude · moveSlots | `yin` · `0/1` · `apInner` · 4 |
| reqs | `attrs:{con:40,wil:45}; aptitude:{apInner:40}; prereq:[{anyOf:[{skill:sk_huahuijibenjian,layer:6},{skill:sk_huahuijian,layer:4}]}]; hard:[prereq]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:5,agi:4},mpRegen:2.5,stats:{defIn:8,resInjury:7}}`；`IP=34+20+2×14+5×2.5=94.5`，恰等于地上预算；`stats` 合计 15，不计入 IP |
| 经脉 / 调息 / 护体 | `meridians:[mer_renmai,mer_yinwei]` **【建议值】**；`breathProfileRef:txp_huahuixinfa`；`innerGuard:{enabled:true,reflectBp:0}` |
| inner.yunjin / auxYunjin | `[tiaoxi,huti]` / `[tiaoxi]`；辅运只保留调息，不借辅运触发护体 |
| 层数要点 | 1 重纳息；3 重藏气；5 重护身；7 重绝招守藏凝神；9 重绝招回息解滞；10 重心法圆成 |
| setTags / conflicts | `[]` / `[]` |
| special / observable | `{fusible:true}` / `false`；内息不可仅凭旁观习得 |
| learnSources | `[{type:master,chapter:ch10_baima,ref:npc_walazi,maxLayer:10},{type:master,chapter:ch10_baima,ref:npc_majiajun,maxLayer:10},{type:manual,chapter:ch10_baima,ref:q_10_bond_05,maxLayer:8}]`；前两项须旧案问证、取得对应传承者信任且双方安全隔离；第三项由该任务登记未淬毒练习谱的校合资格，结局后须经李文秀辨认。人物关系只决定来源，不免除 `reqs`。 |
| description / 图鉴文本 | 以任脉收摄、阴维护持的华辉进阶行功。瓦耳拉齐与马家骏均可主运，但不是两份个人专属内功。 |

#### `sk_huahuixinfa` 招式正文（定义以 §1.1 为准）

| 招式（ID） | 重 | 范围 / 倍率 | 耗内/cd/收招 | 效果、外放与 MoveDef |
|---|---:|---|---|---|
| 纳息归中 `mv_huahuixinfa_naxi` **（原创扩展）** | 1 | 自身 / 0 | 7%/3/900 | 获 `bf_huinei`·承·1；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:3;recovery:900;meridianRouteRef:mfr_huahuixinfa_naxi;projection:false}` |
| 藏气守隙 `mv_huahuixinfa_cangqi` **（原创扩展）** | 3 | 自身 / 0 | 7%/2/1000 | 获 `bf_shouyi`·承·2；`MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:2;recovery:1000;meridianRouteRef:mfr_huahuixinfa_cangqi;projection:false}` |
| 护心敛息 `mv_huahuixinfa_hushen` **（原创扩展）** | 5 | 自身 / 0 | 8%/3/1000 | 获 `bf_hutizhenqi`·承·2，护体按 `value:{shieldPctHpMax:0.08}` 覆写；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:3;recovery:1000;yunjinMode:huti;meridianRouteRef:mfr_huahuixinfa_hushen;projection:false}` |
| 守藏凝神 `mv_huahuixinfa_shoucang`（绝招，**原创扩展**） | 7 | 自身 / 0 | 9%/0/1200，气势 100 | 获 `bf_dingxin`·承·3；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_huahuixinfa_shoucang;projection:false}` |
| 回息解滞 `mv_huahuixinfa_huixi`（绝招，**原创扩展**） | 9 | 自身 / 0 | 9%/0/1200，气势 100 | 以 `yunjinMode:tiaoxi` 覆写通用调息一次，仅处理 `level≤8` 的受封穴位与迟滞 / 胀损；9 级点穴仍禁止自解；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;yunjinMode:tiaoxi;meridianRouteRef:mfr_huahuixinfa_huixi;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 潜息 | `ps_huahuixinfa_qianxi` | 2 | 从遮蔽格开始行动时 `effRes +5`，离开遮蔽后失效 |
| 护脉 | `ps_huahuixinfa_humai` | 5 | 每战首次获得 `bf_neishang` 时少 1 层，最低 0 |
| 心法圆成 | `ps_huahuixinfa_yuancheng` | 10 | 调息完成后下一次华辉体系招式耗内 −5%，每回合至多 1 次 |

### 1.2 `sk_walalizhi` 瓦耳拉齐指（9 地上 · 拳脚/指法 · 华辉）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 出处 | 瓦耳拉齐有“一指镇江南”称号；称号字词与其武功细节须核三联 / 广州版**（待考）**。武学总名、招名、点穴参数均为原创补录 |
| origin / sect / lineage | `expanded` / `null` / 华辉指法；与 `skills-kangxi.md` §8.7–§8.8 同体系 |
| sourceChapters | `[ch10_baima]` |
| category / subType / grade | `unarmed / finger / 9` |
| nature · wOut/wIn · aptitude · moveSlots | `yin` · `0.35/0.65` · `apFinger` · 4 |
| reqs | `attrs:{agi:45,wil:40}; aptitude:{apFinger:40}; prereq:[{skill:sk_huahuixinfa,layer:6}]; hard:[prereq]` |
| layerStats / setTags | `{hit:[3,8],seal:[2,7]}`，合计 15 / `[]` |
| conflicts / weaponReq | `[]` / `null` |
| 层数要点 | 1 重探隙；3 重扣脉；5 重截指；7 重绝招镇江一指；9 重绝招封脉定息；10 重指意圆成 |
| special / observable | `{fusible:true}` / `true`；观摩仍受 `design/05` §7.4 的 6 重上限 |
| learnSources | `[{type:master,chapter:ch10_baima,ref:npc_walazi,maxLayer:10},{type:master,chapter:ch10_baima,ref:npc_liwenxiu,maxLayer:8},{type:manual,chapter:ch10_baima,ref:q_10_bond_05,maxLayer:8}]`；依次为瓦耳拉齐信任线亲授、改命后李文秀转授、结局后由该任务登记的遗谱辨认资格；均保留 `reqs`。击败瓦耳拉齐不自动掉落整门武学。 |
| description / 图鉴文本 | 贴身审隙、扣脉与点穴的阴性指法；名称标人物是为对应称号与画像，不表示只有该 NPC 能学。 |

#### `sk_walalizhi` 招式正文（定义以 §1.2 为准）

| 招式（ID） | 重 | 范围·射程 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|
| 探隙一指 `mv_walalizhi_tanzhi` **（原创扩展命名）** | 1 | 单体·1·接触 | 1.00 | 7%/0/1000 | `projection:false` | 基准 `1.00`；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_walalizhi_tanzhi;projection:false}` |
| 扣脉 `mv_walalizhi_koumai` **（原创扩展命名）** | 3 | 单体·1·接触 | 1.05 | 8%/1/1000 | `bf_xueweishoufeng` 30%·1，`value:{level:7}`，`targetAcupoint:{mode:targetPrimaryRouteKey}`；`projection:false` | `1+.12+.05−.15×.30=1.125`，手调取 1.05以支付选穴价值；`MoveDef{unlock:3;ultimate:false;mpCost:8%;cd:1;recovery:1000;meridianRouteRef:mfr_walalizhi_koumai;projection:false}` |
| 截指回身 `mv_walalizhi_jiezhi` **（原创扩展命名）** | 5 | 单体·1·接触 | 1.10 | 8%/2/1000 | 后撤 1；`projection:false` | `1+.24+.05−.05=1.24`，防守换位收益另折 0.15，取 1.10；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:2;recovery:1000;meridianRouteRef:mfr_walalizhi_jiezhi;projection:false}` |
| 镇江一指 `mv_walalizhi_zhenjiang`（绝招，**原创扩展命名**） | 7 | 单体·1·接触 | 2.80 | 9%/0/1200 | `bf_neishang` 100%·2；`projection:false` | `3.00−.10=2.90`，强制两层另折 0.10，取 2.80；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_walalizhi_zhenjiang;projection:false}` |
| 封脉定息 `mv_walalizhi_fengmai`（绝招，**原创扩展命名**） | 9 | 单体·1·接触 | 2.80 | 9%/0/1200 | `bf_xueweishoufeng` 100%·1，`value:{level:8}`，`targetAcupoint:{mode:targetPrimaryRouteKey}`；`projection:false` | `3.00−.20=2.80`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_walalizhi_fengmai;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 辨隙 | `ps_walalizhi_bianxi` | 2 | 本武学对已有受封穴位目标效果命中 +5pp |
| 扣脉 | `ps_walalizhi_koumai` | 5 | 本武学成功施加点穴后，自身 `bf_shouyi`·承·1 |
| 指意圆成 | `ps_walalizhi_yuancheng` | 10 | 每战首次点穴被抵抗时返还该招实扣内力 20%，不返还气势 |

### 1.3 `sk_majiajunfeizhen` 马家骏飞针（9 地上 · 暗器/针 · 华辉）**（原创扩展命名）**

| 字段 | 值 |
|---|---|
| 出处 | 马家骏旧案与针具相关的情节骨架取自小说，针的数量、施用者、毒性及先后须按纸本终校**（待考）**；本文不把“飞针”总名或任何招名当作原著定名 |
| origin / sect / lineage | `expanded` / `null` / 华辉飞针；与 `skills-kangxi.md` §8.7–§8.8 同体系 |
| sourceChapters | `[ch10_baima]` |
| category / subType / grade | `hidden / hidden / 9` |
| nature · wOut/wIn · aptitude · moveSlots | `yin` · `0.55/0.45` · `apHidden` · 4 |
| hiddenKind | `needle`；须装备针类实体暗器，弹药与装备约束引用 `design/10` |
| reqs | `attrs:{agi:45,wil:40}; aptitude:{apHidden:40}; prereq:[{skill:sk_huahuixinfa,layer:6}]; hard:[prereq]` |
| layerStats / setTags | `{hit:[3,8],effHit:[2,7]}`，合计 15 / `[]` |
| conflicts / weaponReq | `[]` / 不适用（暗器改用 `hiddenKind`） |
| 层数要点 | 1 重投针；3 重连针；5 重引针；7 重绝招三针封路；9 重绝招伤脉针；10 重针路圆成 |
| special / observable | `{fusible:false}` / `true`；只可观摩投掷外形至 6 重，不含旧案中的用毒知识 |
| learnSources | `[{type:master,chapter:ch10_baima,ref:npc_majiajun,maxLayer:10},{type:master,chapter:ch10_baima,ref:npc_walazi,maxLayer:10},{type:manual,chapter:ch10_baima,ref:q_10_bond_05,maxLayer:8}]`；前两项须取得传承者信任；第三项由该任务登记旧案完整、双方安全分隔及李文秀辨认未淬毒练习针谱的资格。主角及其他人物仍须满足 `reqs`，击败马家骏不自动掉谱。 |
| description / 图鉴文本 | 以针具投送、虚实连缀与伤脉为侧重的实体暗器技法。战斗数据不提供现实制毒方法；所有招式均非真气外放。 |

#### `sk_majiajunfeizhen` 招式正文（定义以 §1.3 为准）

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 / 外放 | 核算与 MoveDef |
|---|---:|---|---:|---|---|---|
| 投针问隙 `mv_majiajunfeizhen_touzhen` **（原创扩展命名）** | 1 | 单体·1–5·实体暗器 | 0.80 | 7%/0/1000 | 不可招架；`projection:false` | `1×.92×.85=.782≈.80`；`MoveDef{unlock:1;ultimate:false;mpCost:7%;cd:0;recovery:1000;meridianRouteRef:mfr_majiajunfeizhen_touzhen;projection:false}` |
| 连针逐隙 `mv_majiajunfeizhen_lianzhen` **（原创扩展命名）** | 3 | 单体·1–4·实体暗器 3 段 | 1.00 | 8%/1/1100 | 不可招架；`projection:false` | `1×(1+.12+.05+.07)×.92×.85=.970≈1.00`；`MoveDef{unlock:3;ultimate:false;mpCost:8%;cd:1;recovery:1100;meridianRouteRef:mfr_majiajunfeizhen_lianzhen;projection:false}` |
| 引针伤脉 `mv_majiajunfeizhen_yinzhen` **（原创扩展命名）** | 5 | 单体·1–4·实体暗器 | 0.95 | 8%/2/1000 | `bf_neishang` 50%·1；不可招架；`projection:false` | `1×(1+.24+.05)×.92×.85−.10×.50=.959≈.95`；`MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:2;recovery:1000;meridianRouteRef:mfr_majiajunfeizhen_yinzhen;projection:false}` |
| 三针封路 `mv_majiajunfeizhen_sanzhen`（绝招，**原创扩展命名**） | 7 | `aoe_chain n3`·1–4·实体暗器 | 1.95 | 9%/0/1200 | `bf_neishang` 50%·1；不可招架；气势 100；`projection:false` | `3×.85×.92×.85−.10×.50=1.945≈1.95`；`MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_majiajunfeizhen_sanzhen;projection:false}` |
| 伤脉针 `mv_majiajunfeizhen_shangmai`（绝招，**原创扩展命名**） | 9 | 单体·1–5·实体暗器 | 2.25 | 9%/0/1200 | `bf_neishang` 100%·3；不可招架；气势 100；`projection:false` | `3×.92×.85−.10=2.246≈2.25`；`MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:9%;cd:0;recovery:1200;meridianRouteRef:mfr_majiajunfeizhen_shangmai;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 藏针 | `ps_majiajunfeizhen_cangzhen` | 2 | 针类暗器命中 +5；不改变弹药消耗 |
| 透隙 | `ps_majiajunfeizhen_touxi` | 5 | 对已有 `bf_neishang` 的目标效果命中 +5pp |
| 针路圆成 | `ps_majiajunfeizhen_yuancheng` | 10 | 每战首次针类绝招结算后返还该招实扣内力 20%，不返还气势 |

## 2. 铁延部草原体系

### `sk_hasakeyunqi` 草原运气法（5 玄中 · 内功 · 铁延部）**（原创扩展）**

| 字段 | 值 |
|---|---|
| origin / sect / lineage | `expanded` / `sect_hasake` / 铁延部草原体系；`sect_hasake` 为旧稳定键，唐代显示名不得回显“哈萨克部族”；接 `skills-kangxi.md` §8.4–§8.5 的摔角、心法体系 |
| sourceChapters | `[ch10_baima]` |
| category / subType / grade | `inner / inner / 5` |
| nature · wOut/wIn · aptitude · moveSlots | `yang` · `0.20/0.80` · `apInner` · 3 |
| reqs | `attrs:{con:30,str:28}; aptitude:{apInner:25}; sect:{id:sect_hasake,rank:3}; prereq:[{skill:sk_hasakexinfa,layer:5}]; hard:[sect,prereq]` |
| inner.contribution | `{mpMaxPct:17,hpMaxPct:10,attrs:{con:3,str:2,wil:2},mpRegen:1.5,stats:{tough:6,resCold:4}}`；`IP=17+10+2×7+5×1.5=48.5`，恰等于玄中预算；`stats` 合计 10，不计入 IP |
| 经脉 / 调息 / 护体 | `meridians:[mer_dumai,mer_yangwei]` **【建议值】**；`breathProfileRef:txp_hasakeyunqi`；`innerGuard:{enabled:true,reflectBp:0}` |
| inner.yunjin / auxYunjin | `[tiaoxi,huti]` / `[tiaoxi]`；辅运只保留调息，不借辅运触发护体 |
| 层数要点 | 1 重长息；4 重稳身；7 重护力；10 重长行圆成；玄中按 `design/05` 无绝招 |
| setTags / conflicts | `[]` / `[]` |
| special / observable | `{fusible:true}` / `true`；观摩只开放至 6 重，完整传承仍需职级与认可 |
| learnSources | `[{type:master,chapter:ch10_baima,ref:biz_yining_manor_01,maxLayer:10},{type:observe,chapter:ch10_baima,ref:biz_yining_manor_01,maxLayer:6}]`；两项均由庄园 `job_jiaotou` 职能槽承载；`master` 还须达到 L3 亲随并完成救援、守诺与演武认可，`observe` 为被共同体接纳后的余韵演武。主角和其他合资格人物均可学，演武首领只是示范者，胜负不转移传承权。 |
| description / 图鉴文本 | 由草原心法进阶的耐战运气法，服务长途、稳身与护持；是虚构铁延共同体的公传训练，不冒充突厥、铁勒或其他真实族群的统一武学。 |

#### `sk_hasakeyunqi` 招式正文（定义以 §2 为准）

| 招式（ID） | 重 | 范围 / 倍率 | 耗内/cd/收招 | 效果、外放与 MoveDef |
|---|---:|---|---|---|
| 旷野长息 `mv_hasakeyunqi_changxi` **（原创扩展）** | 1 | 自身 / 0 | 5%/2/900 | 获 `bf_huinei`·承·1；`MoveDef{unlock:1;ultimate:false;mpCost:5%;cd:2;recovery:900;meridianRouteRef:mfr_hasakeyunqi_changxi;projection:false}` |
| 马背稳身 `mv_hasakeyunqi_wenshen` **（原创扩展）** | 4 | 自身 / 0 | 6%/2/1000 | 获 `bf_wenzhong`·承·2；骑乘不是发动条件；`MoveDef{unlock:4;ultimate:false;mpCost:6%;cd:2;recovery:1000;meridianRouteRef:mfr_hasakeyunqi_wenshen;projection:false}` |
| 合息护力 `mv_hasakeyunqi_huli` **（原创扩展）** | 7 | 自身 / 0 | 6%/3/1000 | 获 `bf_hutizhenqi`·承·2，护体按 `value:{shieldPctHpMax:0.06}` 覆写；`MoveDef{unlock:7;ultimate:false;mpCost:6%;cd:3;recovery:1000;yunjinMode:huti;meridianRouteRef:mfr_hasakeyunqi_huli;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 长行 | `ps_hasakeyunqi_changxing` | 2 | 室外探索体力消耗 −5%；不改变坐骑速度 |
| 立稳 | `ps_hasakeyunqi_liwen` | 5 | 每战首次受强制位移时距离 −1，最低 0 |
| 长行圆成 | `ps_hasakeyunqi_yuancheng` | 10 | 室外调息后下一次防守路线 `practiceBp +500`，每回合至多 1 次 |

## 3. 调息档案与护体

两门内功各绑定一个 `txp_*`；字段与计算只引用 `design/21` §4.8、§10。9 级点穴禁止自行调息，本文的“回息解滞”也不例外。

| 内功 → 调息档案 | `grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp` | 10 重 `reliefBp / repairUnits` | 护体档 |
|---|---|---|---|
| `sk_huahuixinfa → txp_huahuixinfa` | `9/10/yin/3/1000/0/15000`；`BreathProfile{id:txp_huahuixinfa;grade:9;layer:10;nature:yin;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `2200 / 516` | `guard:yin-high`；自然 `K-YN2`；主动 `mv_huahuixinfa_hushen→K-YD4`；`reflectBp:0` |
| `sk_hasakeyunqi → txp_hasakeyunqi` | `5/10/yang/2/1000/0/15000`；`BreathProfile{id:txp_hasakeyunqi;grade:5;layer:10;nature:yang;scope:2;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `1800 / 420` | `guard:yang-mid`；自然 `K-AN2`；主动 `mv_hasakeyunqi_huli→K-AD4`；`reflectBp:0` |

`innerGuard.enabled:true` 只表示主运具备该档护体内劲，仍须合法自然护体短路或 defense 路线。内劲抵消继续按 `design/21` §4.8：拳脚、兵器、实体暗器和外放各读既定适用率，以 `1 MP : 2 伤害` 守恒结算；本文不另定倍率。

## 4. 来源扩展登记

本轮没有“既有武学只缺《白马啸西风》来源”的情况。四门均在本册新定义并写入 `sourceChapters:[ch10_baima]`，保留零项表供 NXfix 汇总。

| `sk_*` | 需加入的书界 | 依据 | 状态 |
|---|---|---|---|
| — | — | 无来源扩展项 | 无需同步 |

## 5. 外放候选审计表

依 AR-16、`design/05` §4.2.2 与 `design/21` §4.4.1 逐招判断。华辉心法和草原运气法均为自身运功，瓦耳拉齐指为 1 格接触式点穴，马家骏飞针为实体针具；十八式全部 `projection:false`，不配置 `projectionSpreadSteps`，外放招式为 0。

| 武学 | 招式 | 判定 | 理由 |
|---|---|---|---|
| `sk_huahuixinfa` | 纳息归中、藏气守隙、护心敛息、守藏凝神、回息解滞（完整 ID 见 §1.1） | `projection:false` | 自身运功 / 调息 |
| `sk_walalizhi` | 探隙一指、扣脉、截指回身、镇江一指、封脉定息（完整 ID 见 §1.2） | `projection:false` | 射程 1 的接触式指法与点穴 |
| `sk_majiajunfeizhen` | 投针问隙、连针逐隙、引针伤脉、三针封路、伤脉针（完整 ID 见 §1.3） | `projection:false` | 针类实体暗器；远程不等于真气离体 |
| `sk_hasakeyunqi` | 旷野长息、马背稳身、合息护力（完整 ID 见 §2） | `projection:false` | 自身运功 / 护持 |

## 6. 统计表

| 统计项 | 数量 | 核算 |
|---|---:|---|
| 新增武学 | 4 | 地上 3、玄中 1；内功 2、指法 1、暗器 / 针 1 |
| 原著正式定名 | 0 | 人物、师承和针具情节有据但均待纸本终校；四个总名都明确标原创扩展或原创扩展命名 |
| 招式 | 18 | 三门地上各 5，玄中 3；`3×5+3=18` |
| 绝招 | 6 | 三门地上各 2，解锁层均为 7 / 9；玄中 0 |
| 被动 | 12 | 每门 3，满足地上 / 玄中的 3–4 范围 |
| 显式路线 | 18 | 每招一路；绝招 6、普通 / 运功 12 |
| 外放招式 | 0 | 自身运功、接触指法、实体飞针均非外放 |
| 调息档案 | 2 | 两门内功各 1，均显式含 `outOfBattleScaleBp:15000` |
| 来源扩展 / 跨书界待替换 | 0 / 0 | 三个缺口均由本书补齐 |

地上固定两绝招，资源统一为气势 100、耗内 9%、`cd:0`、收招 1200；玄中不设绝招。四门均未增加基准 §13 的天级闭集。

## 7. 本文新增术语与 ID

### 7.1 武学、招式与被动

| 类别 | 数量 | 新增 ID |
|---|---:|---|
| 武学 `sk_*` | 4 | `sk_huahuixinfa`、`sk_walalizhi`、`sk_majiajunfeizhen`、`sk_hasakeyunqi` |
| 招式 `mv_*` | 18 | `mv_huahuixinfa_{naxi,cangqi,hushen,shoucang,huixi}`；`mv_walalizhi_{tanzhi,koumai,jiezhi,zhenjiang,fengmai}`；`mv_majiajunfeizhen_{touzhen,lianzhen,yinzhen,sanzhen,shangmai}`；`mv_hasakeyunqi_{changxi,wenshen,huli}` |
| 被动 `ps_*` | 12 | `ps_huahuixinfa_{qianxi,humai,yuancheng}`；`ps_walalizhi_{bianxi,koumai,yuancheng}`；`ps_majiajunfeizhen_{cangzhen,touxi,yuancheng}`；`ps_hasakeyunqi_{changxing,liwen,yuancheng}` |

花括号只是本文清单的排版缩写，生产 ID 以卡片完整拼写为准；不新增 Buff、装备、套装、人物、门派或任务 ID。

### 7.2 路线与调息档案

| 类别 | 数量 | 定义 / 口径 |
|---|---:|---|
| 路线 `mfr_*` | 18 | 与十八个 `mv_*` 一一同名派生；`ultimate` 与 `purpose` 见 §0 |
| 调息档案 `txp_*` | 2 | `txp_huahuixinfa`、`txp_hasakeyunqi`，完整字段见 §3 |

## 8. 数据校验规则与测试用例

| 编号 | 校验 | 期望 |
|---|---|---|
| BM10-BL-V01 | 四个 `sk_*`、十八个 `mv_* / mfr_*`、十二个 `ps_*`、两个 `txp_*` 全仓查重 | 各定义唯一；引用可多次 |
| BM10-BL-V02 | 三门 9 品各 5 招、2 绝招、3 被动；5 品内功为 3 招、0 绝招、3 被动 | 绝招解锁依次为 7 / 9，配额通过 |
| BM10-BL-V03 | 六条绝招路线均为 8 段 × 90 CT，风险 `0..1200`，穴位不重复 | `1200+720=1920≤2000` |
| BM10-BL-V04 | 同一武学及华辉同源绝招的共享穴位 | 同武学三组均 `0/8`；补录跨门最多 `3/8`；与既有华辉快剑最多 `1/6`；均 `≤50%`，无轮换 / 逆序 |
| BM10-BL-V05 | 十八招外放字段 | 全部 `projection:false`，且均无 `projectionSpreadSteps` |
| BM10-BL-V06 | `sk_huahuixinfa` / `sk_hasakeyunqi` 内功 IP | `34+20+2×14+5×2.5=94.5`；`17+10+2×7+5×1.5=48.5` |
| BM10-BL-V07 | 两个调息档案 | 显式 `outOfBattleScaleBp:15000`；满层分别 `2200/516`、`1800/420` |
| BM10-BL-V08 | 点穴载荷 | `koumai`、`fengmai` 同时具有 `bf_xueweishoufeng`、合法 `value.level` 与 `targetAcupoint:{mode:targetPrimaryRouteKey}` |
| BM10-BL-V09 | 习得途径 | 均允许主角与其他合资格人物学习；击败首领不直接掉完整武学 |
| BM10-BL-T01 | 瓦耳拉齐 / 马家骏主运 `sk_huahuixinfa` 8 重 | 七参取真实 `9/8/.../yin/fullTemplate`，不再用地位下限伪装主运 |
| BM10-BL-T02 | 部族演武首领主运 `sk_hasakeyunqi` 8 重 | 七参取真实 `5/8/.../yang/fullTemplate` |
| BM10-BL-T03 | 三类首领在首书 D2 / Lv20 新包络重跑节奏脚本 | 旧 D3 / Lv46 的 18.44、16.32 仅为迁移前快照，不得作为唐代生产金标准；见章节 §12 |

## 9. 待决事项 / 依赖

### 9.1 替下游给出的建议值

- **【建议值】** `sk_huahuixinfa` 取 `mer_renmai + mer_yinwei`，`sk_hasakeyunqi` 取 `mer_dumai + mer_yangwei`；默认保留，待经脉图鉴总审计确认。
- **【建议值】** 瓦耳拉齐、马家骏共用 `sk_huahuixinfa`，不再拆成两门数值相同的个人内功；这落实作者“门派或来源武学可由其他人学习”的决定。

### 9.2 本文依赖的上游事实

- 依赖 `design/05` §3.5、§4、§5.5 的招式数、绝招资源、伤害预算与 IP；依赖 `design/21` §4、§10、§11.9 的路线、调息和敌方主运规则。
- 依赖 `skills-kangxi.md` 的 `sk_huahuijibenjian`、`sk_huahuijian`、`sk_huahuiyexing`、`sk_hasakexinfa` 等既有条目；本册不覆写其字段。
- 依赖 `chapters/10-baima.md` 与 `story/10-baima.md` 的旧案、信任、改命和演武节点来落学习来源。

### 9.3 对基准的修改提案

- `skills-kangxi.md`、`design/17` 应把 `sect_hasake` 在 `ch10_baima` 的显示来源改为“铁延部 / 草原共同体”，保留全部既有 `sk_hasake*` 与 `sect_hasake` 稳定 ID。

### 9.4 原著考据待办

- 核对瓦耳拉齐“一指镇江南”称号的准确字形、上下文，以及小说是否进一步描述指法动作；未核前总名和招名均保持**（原创扩展命名）**。
- 核对马家骏旧案中针具的数量、持有者、是否淬毒与致伤顺序；本文只保留“针类画像”，不把游戏化的三针、伤脉效果当作原著事实。
- 核对华辉收徒、马家骏前弟子身份与李文秀所学范围；未核前不把三门新武学写成原著正式谱系名称。

### 9.5 开放问题（附默认值）

- **O-1：`sk_walalizhi` 是否需要改成不带人物名的“华辉指法”。** 默认保留当前 ID 与显示名，以对应首领缺口和“一指镇江南”画像；学习规则已明确非人物独占。若作者更名，须以 alias 迁移旧 ID。
- **O-2：马家骏地位下限是否仍为 9。** 默认保留 9，与其师父瓦耳拉齐同档；这是既有 §12.4 / NB4b 锚点。本轮以真实 9 品主运闭合，不再依赖下限兜底；若作者下调，只影响角色目标，不反向删减可学习武学。
- **O-3：华辉遗谱是否允许原著线在两人死亡后取得。** 默认允许，但须先完成旧案问证、确保练习谱未淬毒且由李文秀辨认；不从尸体直接掉落。
