# 书界武学补录 · 04《倚天屠龙记》（`skills-bulu-04-yitian`）

> **归属（基准 §18）**：`design/catalog/skills-*.md` 的按书补录册。本文只定义《倚天屠龙记》首领配装确实缺少的武学、学习来源及其经脉接口；既有门派图鉴仍是原条目的唯一归属。
> **上游**：`docs/decisions/author-decisions.md`、`docs/decisions/author-requirements.md` AR-14/15/16/27、`docs/00-canon.md` §3–§5/§9/§12/§13/§16/§18/§20、`docs/decisions/rulings-v1.md`、`docs/decisions/ultimate-counts-tianzhong-dizhong.md`、`design/03` v2、`design/05`、`design/21`。
> **引用而不重定义**：既有倚天武学见 `skills-yitian.md`；少林武学见 `skills-shaolin.md`；通行武学见 `skills-general.md`；招式预算见 `design/05`；经脉路线、护体内劲与调息见 `design/21`；Buff 本体见 `design/06`；装备见 `design/10`；门派职级见 `design/17`。
> **覆盖声明**：本册补录明教 / 波斯总教、成昆旁支、昆仑、崆峒、华山倚天支与玄冥二老所缺条目，不修改十一册既有图鉴。首领只是这些武学的使用者之一；除个人旁支外，主角与其他人物均可依门派、职级、秘籍或奇遇正常习得。
> **标注约定**：**（原创扩展）**为原著没有的武学或玩法；**（原创扩展命名）**为原著有人物 / 兵器 / 劲力表现而总名或招名由本作补出；**（待考）**须以三联 / 广州修订版逐字核对；**【建议值】**为待归属文档确认的数值。
> **版本**：v1.1（首领武学补录与替补替换，2026-09-28）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）；阴阳性质落地 AR-18（2026-09-29）。

---

## 0. 阅读指引与绝招显式路线索引

本册新增 12 门武学：2 门天下、3 门地上、7 门地中。天下 / 地上各 2 记绝招；7 门地中已由 `ultimate-counts-tianzhong-dizhong.md` §3.1B 逐门裁定为 1 记。路线遵循 `design/21` §4.3：天下每条 10 段、每段 80 CT，地阶每条 8 段、每段 90 CT，完整收招均不超过 2000 CT。同门多绝招共享穴位不超过 50%；所有序列均在全库查重。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 10 天下 | `sk_bosishenghuoxuangong` | `mv_bosishenghuoxuangong_huanming` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_bosishenghuoxuangong_huanming; projection:false}` | `mfr_bosishenghuoxuangong_huanming` | `MeridianRouteDef{moveRef:mv_bosishenghuoxuangong_huanming;ultimate:true;purpose:defense;requiredNature:[yang,harmony];innerGuard:{enabled:true,reflectBp:0}}`；`ap_chongmai_qichong/80/100→ap_chongmai_qixue/80/120→ap_chongmai_huangshu/80/140→ap_chongmai_shangqu/80/160→ap_daimai_zhangmen/80/240→ap_daimai_jingmen/80/200→ap_daimai_wushu/80/160→ap_dumai_jizhong/80/180→ap_dumai_shenzhu/80/140→ap_dumai_baihui/80/100` |
| 10 天下 | `sk_bosishenghuoxuangong` | `mv_bosishenghuoxuangong_shouling` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_bosishenghuoxuangong_shouling; projection:false}` | `mfr_bosishenghuoxuangong_shouling` | `MeridianRouteDef{moveRef:mv_bosishenghuoxuangong_shouling;ultimate:true;purpose:defense;requiredNature:[yang,harmony];innerGuard:{enabled:true,reflectBp:0}}`；`ap_daimai_zulinqi/80/100→ap_daimai_weidao/80/120→ap_daimai_daimai/80/140→ap_yangqiao_fuyang/80/180→ap_yangqiao_shenmai/80/160→ap_dumai_yaoyangguan/80/240→ap_dumai_zhiyang/80/200→ap_dumai_shendao/80/160→ap_renmai_qihai/80/140→ap_renmai_shimen/80/100` |
| 10 天下 | `sk_xuanminghanyuangong` | `mv_xuanminghanyuangong_hanbi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xuanminghanyuangong_hanbi; projection:false}` | `mfr_xuanminghanyuangong_hanbi` | `MeridianRouteDef{moveRef:mv_xuanminghanyuangong_hanbi;ultimate:true;purpose:defense;requiredNature:[yin];innerGuard:{enabled:true,reflectBp:0}}`；`ap_zushaoyin_yongquan/80/100→ap_zushaoyin_taixi/80/120→ap_zushaoyin_fuliu/80/140→ap_yinqiao_zhaohai/80/160→ap_yinqiao_jiaoxin/80/180→ap_renmai_huiyin/80/220→ap_renmai_zhongji/80/180→ap_renmai_shimen/80/160→ap_renmai_qihai/80/140→ap_renmai_guanyuan/80/100` |
| 10 天下 | `sk_xuanminghanyuangong` | `mv_xuanminghanyuangong_shuangyuan` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xuanminghanyuangong_shuangyuan; projection:false}` | `mfr_xuanminghanyuangong_shuangyuan` | `MeridianRouteDef{moveRef:mv_xuanminghanyuangong_shuangyuan;ultimate:true;purpose:defense;requiredNature:[yin];innerGuard:{enabled:true,reflectBp:0}}`；`ap_yinwei_zhubin/80/100→ap_yinwei_fushe/80/120→ap_yinwei_daheng/80/140→ap_yinwei_fuai/80/160→ap_yinwei_qimen/80/180→ap_zujueyin_taichong/80/220→ap_zujueyin_zhongdu/80/180→ap_shoujueyin_neiguan/80/160→ap_shoujueyin_daling/80/140→ap_renmai_danzhong/80/100` |
| 9 地上 | `sk_mingjiaohujiaogong` | `mv_mingjiaohujiaogong_huguang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_huguang; projection:false}` | `mfr_mingjiaohujiaogong_huguang` | `MeridianRouteDef{moveRef:mv_mingjiaohujiaogong_huguang; ultimate:true; purpose:defense}`；`ap_chongmai_qichong/90/100→ap_chongmai_dahe/90/110→ap_chongmai_huangshu/90/120→ap_daimai_wushu/90/130→ap_renmai_qihai/90/140→ap_renmai_guanyuan/90/150→ap_dumai_shendao/90/160→ap_dumai_baihui/90/170` |
| 9 地上 | `sk_mingjiaohujiaogong` | `mv_mingjiaohujiaogong_zhenjiao` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_zhenjiao; projection:false}` | `mfr_mingjiaohujiaogong_zhenjiao` | `MeridianRouteDef{moveRef:mv_mingjiaohujiaogong_zhenjiao; ultimate:true; purpose:defense}`；`ap_daimai_jingmen/90/100→ap_daimai_zhangmen/90/110→ap_chongmai_youmen/90/120→ap_chongmai_shiguan/90/130→ap_renmai_zhongwan/90/140→ap_renmai_danzhong/90/150→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/170` |
| 9 地上 | `sk_huanyinxinfa` | `mv_huanyinxinfa_cangxi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_cangxi; projection:false}` | `mfr_huanyinxinfa_cangxi` | `MeridianRouteDef{moveRef:mv_huanyinxinfa_cangxi; ultimate:true; purpose:defense}`；`ap_yinwei_qimen/90/100→ap_yinwei_fuai/90/110→ap_yinqiao_jiaoxin/90/120→ap_yinqiao_sanyinjiao/90/130→ap_zujueyin_taichong/90/140→ap_zujueyin_ququan/90/150→ap_renmai_shenque/90/160→ap_renmai_qihai/90/170` |
| 9 地上 | `sk_huanyinxinfa` | `mv_huanyinxinfa_niliu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_niliu; projection:false}` | `mfr_huanyinxinfa_niliu` | `MeridianRouteDef{moveRef:mv_huanyinxinfa_niliu; ultimate:true; purpose:defense}`；`ap_zushaoyin_yongquan/90/100→ap_zushaoyin_taixi/90/110→ap_zushaoyin_yingu/90/120→ap_zutaiyin_taibai/90/130→ap_zutaiyin_yinlingquan/90/140→ap_renmai_huiyin/90/150→ap_renmai_zhongji/90/160→ap_renmai_guanyuan/90/170` |
| 9 地上 | `sk_huanyinshou` | `mv_huanyinshou_fuyin` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_fuyin; projection:false}` | `mfr_huanyinshou_fuyin` | `MeridianRouteDef{moveRef:mv_huanyinshou_fuyin; ultimate:true; purpose:attack}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/110→ap_zujueyin_ligou/90/120→ap_zutaiyin_xuehai/90/130→ap_shoujueyin_tianchi/90/140→ap_shoujueyin_quze/90/150→ap_shoujueyin_neiguan/90/160→ap_shoujueyin_laogong/90/170` |
| 9 地上 | `sk_huanyinshou` | `mv_huanyinshou_huisha` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_huisha; projection:false}` | `mfr_huanyinshou_huisha` | `MeridianRouteDef{moveRef:mv_huanyinshou_huisha; ultimate:true; purpose:attack}`；`ap_zujueyin_dadun/90/100→ap_zujueyin_xingjian/90/110→ap_zushaoyin_fuliu/90/120→ap_renmai_zhongwan/90/130→ap_shoushaoyin_jiquan/90/140→ap_shouyangming_quchi/90/150→ap_shouyangming_shousanli/90/160→ap_shoujueyin_laogong/90/170` |
| 8 地中 | `sk_jinhuazhangfa` | `mv_jinhuazhangfa_zhenzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuazhangfa_zhenzhen; projection:false}` | `mfr_jinhuazhangfa_zhenzhen` | `MeridianRouteDef{moveRef:mv_jinhuazhangfa_zhenzhen; ultimate:true; purpose:attack}`；`ap_chongmai_henggu/90/100→ap_chongmai_qixue/90/110→ap_daimai_daimai/90/120→ap_yangqiao_jianyu/90/130→ap_shoushaoyang_waiguan/90/140→ap_shoushaoyang_yangchi/90/150→ap_shoutaiyang_wangu/90/160→ap_shoutaiyang_yanggu/90/170` |
| 8 地中 | `sk_jinhuabiaofa` | `mv_jinhuabiaofa_sanzhan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuabiaofa_sanzhan; projection:false}` | `mfr_jinhuabiaofa_sanzhan` | `MeridianRouteDef{moveRef:mv_jinhuabiaofa_sanzhan; ultimate:true; purpose:attack}`；`ap_yinqiao_lieque/90/100→ap_yinwei_lianquan/90/110→ap_chongmai_siman/90/120→ap_renmai_chengjiang/90/130→ap_shoutaiyin_taiyuan/90/140→ap_shoutaiyin_yuji/90/150→ap_shouyangming_erjian/90/160→ap_shouyangming_shangyang/90/170` |
| 8 地中 | `sk_lutouzhangfa` | `mv_lutouzhangfa_hengjue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_lutouzhangfa_hengjue; projection:false}` | `mfr_lutouzhangfa_hengjue` | `MeridianRouteDef{moveRef:mv_lutouzhangfa_hengjue; ultimate:true; purpose:attack}`；`ap_zujueyin_taichong/90/100→ap_zushaoyin_taixi/90/110→ap_yinqiao_zhaohai/90/120→ap_yinwei_zhubin/90/130→ap_renmai_qihai/90/140→ap_shoujueyin_neiguan/90/150→ap_shoutaiyang_houxi/90/160→ap_shoutaiyang_wangu/90/170` |
| 8 地中 | `sk_hezuibifa` | `mv_hezuibifa_fengxue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hezuibifa_fengxue; projection:false}` | `mfr_hezuibifa_fengxue` | `MeridianRouteDef{moveRef:mv_hezuibifa_fengxue; ultimate:true; purpose:attack}`；`ap_renmai_qugu/90/100→ap_chongmai_zhongzhu/90/110→ap_chongmai_yindu/90/120→ap_shoushaoyin_shenmen/90/130→ap_shoushaoyin_tongli/90/140→ap_shoujueyin_daling/90/150→ap_shoushaoyang_yangchi/90/160→ap_shoujueyin_zhongchong/90/170` |
| 8 地中 | `sk_kunlunliangyixinfa` | `mv_kunlunliangyixinfa_heyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kunlunliangyixinfa_heyi; projection:false}` | `mfr_kunlunliangyixinfa_heyi` | `MeridianRouteDef{moveRef:mv_kunlunliangyixinfa_heyi; ultimate:true; purpose:defense}`；`ap_renmai_yinjiao/90/100→ap_renmai_shuifen/90/110→ap_chongmai_shangqu/90/120→ap_chongmai_huangshu/90/130→ap_daimai_zulinqi/90/140→ap_daimai_weidao/90/150→ap_shoujueyin_jianshi/90/160→ap_shoujueyin_neiguan/90/170` |
| 8 地中 | `sk_kongtongwuxingxinfa` | `mv_kongtongwuxingxinfa_guyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongtongwuxingxinfa_guyuan; projection:false}` | `mfr_kongtongwuxingxinfa_guyuan` | `MeridianRouteDef{moveRef:mv_kongtongwuxingxinfa_guyuan; ultimate:true; purpose:defense; requiredNature:[yin,harmony]}`；`ap_zutaiyin_dadu/90/100→ap_zutaiyin_diji/90/110→ap_chongmai_futonggu/90/120→ap_chongmai_qichong/90/130→ap_renmai_shimen/90/140→ap_renmai_zhongji/90/150→ap_shoushaoyin_shaohai/90/160→ap_shoushaoyin_shenmen/90/170` |
| 8 地中 | `sk_huashanliangyixinfa04` | `mv_huashanliangyixinfa04_huanyuan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanliangyixinfa04_huanyuan; projection:false}` | `mfr_huashanliangyixinfa04_huanyuan` | `MeridianRouteDef{moveRef:mv_huashanliangyixinfa04_huanyuan; ultimate:true; purpose:defense; requiredNature:[yang,harmony]}`；`ap_yangqiao_fuyang/90/100→ap_yangqiao_shenmai/90/110→ap_yangwei_benshen/90/120→ap_yangwei_tianliao/90/130→ap_dumai_shenzhu/90/140→ap_dumai_zhiyang/90/150→ap_shouyangming_quchi/90/160→ap_shouyangming_hegu/90/170` |
<!-- skill-catalog-audit:end -->

路线命名均为 `mfr_<move suffix>`。绝招动作末端分别服从内功护体、掌、杖、暗器、笔的叙事终点；实体暗器和普通兵刃招均不算真气外放。

### 0.1 天下内功普通招式显式路线

| 武学 / 招式 | 路线 ID | 路线用途与 steps（acupointRef/segmentCt/riskBp） |
|---|---|---|
| `sk_bosishenghuoxuangong` / `mv_bosishenghuoxuangong_tuna` | `mfr_bosishenghuoxuangong_tuna` | `MeridianRouteDef{moveRef:mv_bosishenghuoxuangong_tuna;ultimate:false;purpose:defense;requiredNature:[yang,harmony];innerGuard:{enabled:true,reflectBp:0}}`；`ap_chongmai_henggu/70/80→ap_chongmai_qixue/70/100→ap_daimai_wushu/70/180→ap_dumai_mingmen/70/140→ap_dumai_zhiyang/70/100` |
| `sk_bosishenghuoxuangong` / `mv_bosishenghuoxuangong_zhuanhuan` | `mfr_bosishenghuoxuangong_zhuanhuan` | `MeridianRouteDef{moveRef:mv_bosishenghuoxuangong_zhuanhuan;ultimate:false;purpose:defense;requiredNature:[yang,harmony];innerGuard:{enabled:true,reflectBp:0}}`；`ap_daimai_zhangmen/70/80→ap_daimai_jingmen/70/100→ap_chongmai_siman/70/140→ap_chongmai_zhongzhu/70/120→ap_dumai_shenzhu/70/100` |
| `sk_bosishenghuoxuangong` / `mv_bosishenghuoxuangong_huti` | `mfr_bosishenghuoxuangong_huti` | `MeridianRouteDef{moveRef:mv_bosishenghuoxuangong_huti;ultimate:false;purpose:defense;requiredNature:[yang,harmony];innerGuard:{enabled:true,reflectBp:0}}`；`ap_yangqiao_shenmai/75/80→ap_yangqiao_juliao/75/100→ap_daimai_daimai/75/140→ap_dumai_mingmen/75/260→ap_dumai_shendao/75/160→ap_renmai_qihai/75/100` |
| `sk_xuanminghanyuangong` / `mv_xuanminghanyuangong_tuna` | `mfr_xuanminghanyuangong_tuna` | `MeridianRouteDef{moveRef:mv_xuanminghanyuangong_tuna;ultimate:false;purpose:defense;requiredNature:[yin];innerGuard:{enabled:true,reflectBp:0}}`；`ap_zushaoyin_yongquan/70/80→ap_zushaoyin_taixi/70/100→ap_yinqiao_zhaohai/70/140→ap_renmai_qihai/70/160→ap_renmai_guanyuan/70/100` |
| `sk_xuanminghanyuangong` / `mv_xuanminghanyuangong_ningyuan` | `mfr_xuanminghanyuangong_ningyuan` | `MeridianRouteDef{moveRef:mv_xuanminghanyuangong_ningyuan;ultimate:false;purpose:defense;requiredNature:[yin];innerGuard:{enabled:true,reflectBp:0}}`；`ap_yinwei_zhubin/70/80→ap_yinwei_daheng/70/120→ap_zujueyin_taichong/70/140→ap_shoujueyin_neiguan/70/160→ap_renmai_danzhong/70/100` |
| `sk_xuanminghanyuangong` / `mv_xuanminghanyuangong_huhan` | `mfr_xuanminghanyuangong_huhan` | `MeridianRouteDef{moveRef:mv_xuanminghanyuangong_huhan;ultimate:false;purpose:defense;requiredNature:[yin];innerGuard:{enabled:true,reflectBp:0}}`；`ap_zutaiyin_dadu/75/80→ap_zutaiyin_taibai/75/100→ap_yinwei_fuai/75/140→ap_renmai_shenque/75/180→ap_renmai_zhongwan/75/140→ap_renmai_guanyuan/75/100` |

六条普通路线均为 5–6 段；最大收招为 `1000+6×75=1450≤2000 CT`。两门内功各自的三招以不同起点、换脉与末端表达吐纳、转换 / 凝元、护体，不复用完整序列。

---

## 1. 明教、金花婆婆与波斯总教

### 1.1 `sk_mingjiaohujiaogong` 明教护教功（9 地上 · 内功 · 调和）**（原创扩展）**

> **来源归属**：据明教四大护教法王的组织地位与中土、波斯两支传承扩写；原著未见同名成套心法。与 `skills-yitian.md` 的明教 / 波斯总教体系同属一脉，但不改变既有 `sk_qiankun`、`sk_guangmingxinfa` 的定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:sect_mingjiao`；`lineage: 明教护教法王传承`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai]` **【建议值】** / `txp_mingjiaohujiaogong` |
| reqs | `attrs {bre:55,wil:45}`；`aptitude {apInner:40}`；`sect {id:sect_mingjiao,rank:4}`；`prereq [{skill:sk_guangmingxinfa,layer:7}]`；`hard:[sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:5,wis:4},mpRegen:2.5}`；`IP=34+20+2×14+5×2.5=94.5`；`stats {resCC:8,resMind:7}` 合计 15 |
| 层数要点 | 1 重守明吐纳；4 重火云护脉；**7 重绝招护光**；**9 重绝招镇教**；10 重护教圆满 |
| setTags / conflicts | `[]` / 与阴、阳主运的相性只按 `design/05` §5.4；不提供毒、寒或点穴免疫 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 明教 L4 护教考校可学至 10 重；波斯总教译经或黛绮丝支线演授可学至 8 重。均是正常传承，不限首领专用 |
| description | 把护教法王用于守坛、护脉、稳住同伴的运劲法整理为调和内功；组织功能有据，固定功名、招名与数值为本作扩展 |

| 招式（ID；归属 `sk_mingjiaohujiaogong`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 守明吐纳 `mv_mingjiaohujiaogong_shouming` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_huinei` G=2·2 | — | `power=0`；回内由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 火云护脉 `mv_mingjiaohujiaogong_huoyun` **（原创扩展）** | 4 | 友方单体·0–2·支援 | 0 | 8%/3/1000 | 移除 1 层可驱散 `cold/poison` | — | `power=0`；单体驱散由无伤害、cd3 支付；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 护光 `mv_mingjiaohujiaogong_huguang`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_huguang; projection:false}` |
| 镇教 `mv_mingjiaohujiaogong_zhenjiao`（绝招，**原创扩展**） | 9 | 自身及相邻友方·支援 | 0 | 9%/—/1200 | `bf_shoushi` 100%·3；气势 100 | — | 群体守势由无伤害、贴身范围与气势 100 支付；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_mingjiaohujiaogong_zhenjiao; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 护教 | `ps_mingjiaohujiaogong_hujiao` | 3 | 相邻友方存在时 `resMind +4→+10` |
| 光明同守 | `ps_mingjiaohujiaogong_guangming` | 6 | 对友方施放支援招后自身获 `bf_wenzhong` G=1·2，每 2 回合 1 次 |
| 护教圆满 | `ps_mingjiaohujiaogong_dacheng` | 10 | 本功护体量 +10%，不改变 `design/21` 的内劲抵消率与资源守恒 |

### 1.2 `sk_jinhuazhangfa` 金花杖法（8 地中 · 兵器 / 杖 · 调和）**（原创扩展命名）**

> **来源归属**：金花婆婆持杖对敌及其具体招路须核对《倚天屠龙记》三联 / 广州修订版**（待考）**；成套武学名与招名均为本作命名。归入 `skills-yitian.md` 的明教 / 波斯总教体系，不借白驼山杖法。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:staff`；`grade:8`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 紫衫龙王黛绮丝的中土化杖术`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0.65/0.35`；`weaponReq:{category:staff}`；`moveSlots:4` |
| reqs | `attrs {str:50,agi:40}`；`aptitude {apStaff:35}`；`sect {id:sect_mingjiao,rank:3}`；`prereq [{skill:sk_guangmingquan,layer:5}]`；`hard:[sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{str:1}},{layer:6,attrs:{str:2,agi:1}},{layer:9,attrs:{str:1}}]` |
| layerStats | `{hit:[2,7],parry:[3,8]}`，第 10 重合计 15 |
| 层数要点 | 1 重点花；3 重横枝；5 重拨雾；**7 重绝招金花阵阵**；10 重花影归杖 |
| setTags / conflicts | `[]` / 普通杖击不因搭配阴性内功自动变成寒毒或真气外放 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 明教 L3 杖术考校、灵蛇岛留谱或黛绮丝支线演授，分别可至 8 / 10 / 10 重；玩家和其他合格角色均可学 |
| description | 以长杖点、挑、扫、拨掩护暗器换手；人物与兵器表现待考，玩法套路不宣称原著另有秘籍 |

| 招式（ID；归属 `sk_jinhuazhangfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 点花 `mv_jinhuazhangfa_dianhua` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | — | 可 | `1×(1+0.12)=1.12≈1.10`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 横枝 `mv_jinhuazhangfa_hengzhi` **（原创扩展命名）** | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.00 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10`，杖身换手手调 −.10 → 1.00；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 拨雾 `mv_jinhuazhangfa_bowu` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/1/1000 | 击退 1；自身后撤 1 | 可 | `1×(1+.12+.05)−.05−.10=1.02≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 金花阵阵 `mv_jinhuazhangfa_zhenzhen`（绝招，**原创扩展命名**） | 7 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 2.50 | 9%/—/1200 | `bf_shiheng` 50%·1；气势 100 | 可 | N=3、AF=.85；`3×.85−.10×.50=2.50`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuazhangfa_zhenzhen; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 花影换手 | `ps_jinhuazhangfa_huanying` | 3 | 杖招后下一记暗器招命中 +5→+12；重复杖招不叠层 |
| 杖护周身 | `ps_jinhuazhangfa_zhanghu` | 6 | 本回合未移动时招架 +4→+10 |
| 花影归杖 | `ps_jinhuazhangfa_dacheng` | 10 | 成功招架后下一杖 Z3 +8%，每回合 1 次 |

### 1.3 `sk_jinhuabiaofa` 金花镖法（8 地中 · 暗器 · 阴）**（原创扩展命名）**

> **来源归属**：金花婆婆以金花状暗器示警、伤敌的细节与材质须核对修订版**（待考）**；“金花镖法”及以下招名均为本作命名。它是紫衫龙王一系对波斯总教投掷法的中土化整理，与 `skills-yitian.md` 的明教 / 波斯总教体系同源。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:hidden`；`subType:hidden`；`hiddenKind:dart`；`grade:8`；`origin:canonExpanded`；`sect:sect_mingjiao`；`lineage: 紫衫龙王黛绮丝`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.80/0.20`；`moveSlots:4` |
| reqs | `attrs {agi:50,wis:40}`；`aptitude {apHidden:35}`；`sect {id:sect_mingjiao,rank:3}`；`prereq [{skill:sk_shenghuotunajue,layer:5}]`；`hard:[aptitude,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{agi:1}},{layer:6,attrs:{agi:2,wis:1}},{layer:9,attrs:{agi:1}}]` |
| layerStats | `{hit:[3,9],crit:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重飞花；3 重错影；5 重回首；**7 重绝招金花三绽**；10 重花落无声 |
| setTags / conflicts | `[]` / 使用实体暗器与暗器囊；不因远射而算真气外放，弹药耗用归 `design/10` |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 黛绮丝支线亲授可至 10 重；灵蛇岛留谱可至 8 重；明教 L3 经护教法王许可可至 7 重。均允许合格角色正常习得 |
| description | 以花形小镖错落投出，先扰视线与步点，再借杖势掩护换手；不把玩法中的连投招名冒充原著原句 |

| 招式（ID；归属 `sk_jinhuabiaofa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 飞花 `mv_jinhuabiaofa_feihua` **（原创扩展命名）** | 1 | 单体·1–4·实体投射 | 1.00 | 7%/1/1000 | — | 可 | `1×(1+.12)×.92=1.0304≈1.00`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 错影 `mv_jinhuabiaofa_cuoying` **（原创扩展命名）** | 3 | 乱击 n3 r4·实体投射 | 1.00 | 8%/2/1000 | — | 可 | AF=.85；`.85×(1+.24+.05)×.92=1.0088≈1.00`；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 回首 `mv_jinhuabiaofa_huishou` **（原创扩展命名）** | 5 | 单体·1–3·实体投射 | 1.05 | 8%/2/1000 | 后撤 1；`bf_shiheng` 40%·1 | 可 | `1×(1+.24+.05)×.92−.10−.10×.40=1.0468≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 金花三绽 `mv_jinhuabiaofa_sanzhan`（绝招，**原创扩展命名**） | 7 | 乱击 n3 r4·实体投射 | 2.25 | 9%/—/1200 | `bf_mabi` 30%·1；气势 100 | 可 | AF=.85；`3×.85×.92−.25×.30=2.271≈2.25`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_jinhuabiaofa_sanzhan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 杖影藏花 | `ps_jinhuabiaofa_canghua` | 3 | 杖招命中后下一记本功效果命中 +5→+12；不要求装配特定人物 |
| 花落听声 | `ps_jinhuabiaofa_tingsheng` | 6 | 对本回合已移动目标命中 +4→+10 |
| 花落无声 | `ps_jinhuabiaofa_dacheng` | 10 | 每回合首枚暗器的射程惩罚减半；不增加基础射程 |

### 1.4 `sk_bosishenghuoxuangong` 波斯圣火玄功（10 天下 · 内功 · 阳）**（原创扩展）**

- **出处与边界**：原著有明教波斯总教、宝树王、风云月三使及圣火令武功；总教遣人来中土所涉教主心法前提须逐字核对**（待考）**。未见“波斯圣火玄功”这一固定名，名称、招式、机制与数值均为**（原创扩展）**。本功是波斯总教自身传承，不是 `sk_qiankun`，也不改写其教主门槛。
- **字段**：`category:inner`；`subType:inner`；`grade:10`；`origin:expanded`；`sect:sect_mingjiao`；`lineage:波斯总教·圣火令行功`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0/1`；`moveSlots:5`；`special:{fusible:true}`；`observable:false`。
- **reqs**：`attrs:{bre:60,wis:45}`；`aptitude:{apInner:45}`；`prereq:[{skill:sk_shenghuoxinfa,layer:6},{skill:sk_shenghuoling,layer:7}]`；`sect:{id:sect_mingjiao,branch:persia,rank:4}`；`hard:[sect,prereq]`。
- **trainingAttrs**：`[{layer:3,attrs:{bre:1,wis:1}},{layer:6,attrs:{bre:2,wis:1}},{layer:9,attrs:{bre:2,wis:1}}]`。
- **内功**：`inner.contribution:{mpMaxPct:42,hpMaxPct:25,attrs:{agi:6,wis:6,wil:3,con:3},mpRegen:3.0,stats:{resMind:10,eva:10}}`；`IP=42+25+2×(6+6+3+3)+5×3.0=118`；`meridians:[mer_chongmai,mer_daimai,mer_yangqiao]`；`breathProfileRef:txp_bosishenghuoxuangong`；`innerGuard:{enabled:true,reflectBp:0}`。冲、带不投票，阳跷投阳一票，故性质为阳。
- **层数**：1 重圣火吐纳｜3 重回环转换｜5 重护令｜**7 重第一绝招·幻明归环**｜8 重三使同息｜**9 重第二绝招·守令归真**｜10 重玄功圆成。

| 招式（ID；归属本功） | 重 | 范围·效果 | 耗内/cd/收招 | MoveDef |
|---|---:|---|---|---|
| 圣火吐纳 `mv_bosishenghuoxuangong_tuna` **（原创扩展）** | 1 | 自身；`bf_dingxin` 2 | 6%/2/900 | `MoveDef{unlock:1;ultimate:false;mpCost:6%;cd:2;recovery:900;meridianRouteRef:mfr_bosishenghuoxuangong_tuna;projection:false}` |
| 回环转换 `mv_bosishenghuoxuangong_zhuanhuan` **（原创扩展）** | 3 | 自身；`bf_piaohu` 2 | 7%/3/950 | `MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:3;recovery:950;meridianRouteRef:mfr_bosishenghuoxuangong_zhuanhuan;projection:false}` |
| 护令 `mv_bosishenghuoxuangong_huti` **（原创扩展）** | 5 | 自身；`bf_hutizhenqi` 2，`shieldPctHpMax:0.10` | 8%/3/1000 | `MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:3;recovery:1000;meridianRouteRef:mfr_bosishenghuoxuangong_huti;projection:false}` |
| 幻明归环 `mv_bosishenghuoxuangong_huanming`（绝招，**原创扩展**） | 7 | 自身；`bf_youshi` 3、`bf_wenzhong` 2 | 10%/0/1200 | `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:10%;cd:0;recovery:1200;meridianRouteRef:mfr_bosishenghuoxuangong_huanming;projection:false}` |
| 守令归真 `mv_bosishenghuoxuangong_shouling`（绝招，**原创扩展**） | 9 | 自身；回复 `mpMax×20%`、`bf_shoushi` 3 | 10%/0/1200 | `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:10%;cd:0;recovery:1200;meridianRouteRef:mfr_bosishenghuoxuangong_shouling;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 回环 | `ps_bosishenghuoxuangong_huihuan` | 1 | 带脉接冲脉的首次换脉风险 `−80→−200 bp`，最低 0 |
| 护令 | `ps_bosishenghuoxuangong_huling` | 5 | 装配 `sk_shenghuoling` 时招架 `+4→+10` |
| 三使同息 | `ps_bosishenghuoxuangong_tongxi` | 8 | 相邻同源使用者存在时 `resMind +5→+12`，不按人数叠加 |
| 玄功圆成 | `ps_bosishenghuoxuangong_dacheng` | 10 | 每战首次护体内劲被击穿时获得 `bf_piaohu` 1 回合 |

- **路线叙事与互异**：“幻明归环”由冲脉承力，经带脉横转、督脉上护；“守令归真”由带脉转阳跷稳身，再接督脉护体、任脉回气。两路共享 0/10 穴，职责与换脉方向均不同。普通“吐纳”“转换”同样保留冲带起式，末段改由督脉归护，以匹配阳性主修。
- **learnSources**：波斯总教 L4、圣火令武功 7 重，经宝树王议会考校后可学至 10 重；中土线取得三使译谱并完成圣火令文义复核可学至 8 重。玩家与合资格人物均可走该传承，不要求三使身份。
- **外放判定**：五招均为自身运劲 / 护体，`projection:false`；圣火意象与圣火令实体兵器均不自动构成真气外放。

---

## 2. 成昆旁支

### 2.1 `sk_huanyinxinfa` 幻阴心法（9 地上 · 内功 · 阴）**（原创扩展命名）**

> **来源归属**：成昆以幻阴指暗袭明教众人的人物与阴寒劲力有原著依据，具体回目**（待考）**；原著未见“幻阴心法”这一独立名称。本作将其作为成昆个人旁支的运劲根基，与 `skills-shaolin.md` 收录的 `sk_huanyinzhi` 同源，不归少林普授。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:9`；`origin:expanded`；`sect:null`；`lineage: 成昆个人旁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_yinwei,mer_yinqiao]` **【建议值】** / `txp_huanyinxinfa` |
| reqs | `attrs {bre:55,wil:50}`；`aptitude {apInner:40}`；`prereq [{skill:sk_huanyinzhi,layer:6}]`；`hard:[aptitude,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]` |
| inner.contribution | `{mpMaxPct:34,hpMaxPct:20,attrs:{con:5,wil:6,wis:3},mpRegen:2.5}`；`IP=34+20+2×14+5×2.5=94.5`；`stats {effHit:8,resCold:7}` 合计 15 |
| 层数要点 | 1 重敛阴；4 重潜息；**7 重绝招藏息**；**9 重绝招逆流**；10 重幻阴圆满 |
| setTags / conflicts | `[]` / 阴性主运相性按 `design/05` §5.4；不等于玄冥传承，也不授寒毒免疫 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 邪线由成昆受控同行时私授可至 10 重；`q_04_qiyu_83`“圆真遗册”复核后可至 8 重并沿既有选择承担品德代价。个人独门来源是否允许玩家满层，见 §11.5，默认保留该路径 |
| description | 以敛息、藏劲与逆转受力为核心的阴性内功，是为闭合成昆合法画像所作的个人旁支扩展；不把“混元霹雳手”称号另建武学 |

| 招式（ID；归属 `sk_huanyinxinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 敛阴 `mv_huanyinxinfa_lianyin` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong` G=1·2 | — | `power=0`；自用防势由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 潜息 `mv_huanyinxinfa_qianxi` **（原创扩展）** | 4 | 自身·支援 | 0 | 8%/3/1000 | `bf_piaohu` G=1·2 | — | `power=0`；闪避增益由无伤害、cd3 支付；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 藏息 `mv_huanyinxinfa_cangxi`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_piaohu` G=3·3；气势 100 | — | 支援绝招以气势 100、地阶基准耗内 +2pp 与收招 1200 支付；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_cangxi; projection:false}` |
| 逆流 `mv_huanyinxinfa_niliu`（绝招，**原创扩展**） | 9 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinxinfa_niliu; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 隐劲 | `ps_huanyinxinfa_yinjin` | 3 | 本回合未移动时幻阴系招式效果命中 +4→+10 |
| 藏锋 | `ps_huanyinxinfa_cangfeng` | 6 | 成功闪避后下一记幻阴系外功 Z3 +6%，每回合 1 次 |
| 幻阴圆满 | `ps_huanyinxinfa_dacheng` | 10 | 气血低于 35% 时本功护体量 +10%；不改变内劲抵消档位 |

### 2.2 `sk_huanyinshou` 幻阴手（9 地上 · 拳脚 / 掌 · 阴）**（原创扩展命名）**

> **来源归属**：本作从成昆的幻阴指与阴寒暗袭表现扩写为近身掌手体系；原著未见“幻阴手”这一成套武学名及以下招名。它与 `skills-shaolin.md` 的 `sk_huanyinzhi` 同属成昆个人旁支，不是少林门人通学。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:unarmed`；`subType:fist`；`grade:9`；`origin:expanded`；`sect:null`；`lineage: 成昆个人旁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.30/0.70`；`moveSlots:4` |
| reqs | `attrs {str:55,agi:45}`；`aptitude {apFist:40,apInner:40}`；`prereq [{skill:sk_huanyinzhi,layer:6},{skill:sk_huanyinxinfa,layer:6}]`；`hard:[prereq]` |
| trainingAttrs | `[{layer:3,attrs:{str:1}},{layer:6,attrs:{str:2,agi:1}},{layer:9,attrs:{str:1}}]` |
| layerStats | `{effHit:[3,9],pierce:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重阴掌；4 重错步回身；**7 重绝招伏阴**；**9 重绝招回煞**；10 重幻手无迹 |
| setTags / conflicts | `[]` / 不继承 `sk_xuanming` 的寒毒与双老协同；普通掌劲不判真气外放 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 与 `sk_huanyinxinfa` 相同：成昆私授可至 10 重；`q_04_qiyu_83` 遗册复核可至 8 重。是否保留满层玩家来源由 §11.5 请求确认 |
| description | 以贴身阴劲、错身暗袭补足成昆 9 品外功画像；它不覆盖既有幻阴指，也不把成昆称号注册为另一门武学 |

| 招式（ID；归属 `sk_huanyinshou`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阴掌 `mv_huanyinshou_yinzhang` **（原创扩展）** | 1 | 单体·1·近身 | 1.15 | 8%/1/1000 | `bf_neishang` 40%·2 | 可 | `1×(1+.12+.05)−.10×.40=1.13≈1.15`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 错步回身 `mv_huanyinshou_cuobu` **（原创扩展）** | 4 | `aoe_behind`·1·近身 | 1.00 | 8%/2/1000 | 绕背；`bf_shiheng` 40%·1 | 可 | AF=.90；`.90×(1+.24+.05)−.15−.10×.40=0.971≈1.00`；`MoveDef{unlock:4; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 伏阴 `mv_huanyinshou_fuyin`（绝招，**原创扩展**） | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_neishang` 100%·3；气势 100 | 可 | `3.00−.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_fuyin; projection:false}` |
| 回煞 `mv_huanyinshou_huisha`（绝招，**原创扩展**） | 9 | 直线 n2·近身 | 2.50 | 9%/—/1200 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 25%·1；气势 100 | 可 | AF=.85；`3×.85−.20×.25=2.50`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huanyinshou_huisha; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 暗袭 | `ps_huanyinshou_anxi` | 3 | 从侧后方出招时命中 +4→+10 |
| 阴劲入里 | `ps_huanyinshou_ruli` | 6 | 对已有 `injury` 标签减益的目标 Z3 +4%→+10% |
| 幻手无迹 | `ps_huanyinshou_dacheng` | 10 | 每战第一次被招架时，自身后撤 1 格并获得 `bf_piaohu` G=1·1 |

- **路线叙事与终点复核**：“伏阴”由阴跷、阴维收束到手厥阴，止于劳宫；“回煞”从足厥阴与足少阴回卷，经任脉、手少阴及手阳明蓄势，同样由劳宫发掌。两路共享 1/8 穴，不构成轮换或逆序；掌类末端均符合 `design/21` §4.3.1。

---

## 3. 玄冥二老

### 3.1 `sk_lutouzhangfa` 鹿头杖法（8 地中 · 兵器 / 杖 · 阴）**（原创扩展命名）**

> **来源归属**：鹿杖客以鹿角杖为兵器有原著依据，固定杖法名与招名未见，故为本作扩展命名；具体交手段落**（待考）**。与 `skills-yitian.md` 的玄冥二老传承同属一系，专用名器 `eq_luzhang` 已由 `design/10` 定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:staff`；`grade:8`；`origin:canonExpanded`；`sect:null`；`lineage: 玄冥传承·鹿杖客支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.70/0.30`；`weaponReq:{category:staff,altItems:[eq_luzhang]}`；`moveSlots:4` |
| reqs | `attrs {str:50,con:40}`；`aptitude {apStaff:35}`；`prereq [{skill:sk_xuanmingxinfa,layer:5}]`；`hard:[aptitude,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{str:1}},{layer:6,attrs:{str:2,con:1}},{layer:9,attrs:{str:1}}]` |
| layerStats | `{parry:[3,8],hit:[2,7]}`，第 10 重合计 15 |
| 层数要点 | 1 重角顶；3 重横扫；5 重缠地；**7 重绝招鹿角横绝**；10 重寒杖归一 |
| setTags / conflicts | `[]` / `eq_luzhang` 的玄冥寒气特效归装备；此卡不重复施加，也不把杖击标为外放 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 鹿杖客羁绊或换俘支线可至 10 重；汝阳王府武库残谱可至 8 重。个人分支是否允许满层玩家来源见 §11.5，默认保留 |
| description | 以鹿角挂、顶、扫、压构成的沉重杖路；不持鹿杖时仍可用普通杖，但失去名器特效 |

| 招式（ID；归属 `sk_lutouzhangfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 鹿角顶 `mv_lutouzhangfa_jiaoding` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.10 | 7%/1/1000 | 击退 1 | 可 | `1×(1+.12)−.05=1.07≈1.10`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 横扫 `mv_lutouzhangfa_hengsao` **（原创扩展命名）** | 3 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10`，重杖转势手调 −.05 → 1.05；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 缠地 `mv_lutouzhangfa_chandi` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/2/1000 | `bf_jiansu` 60%·2 | 可 | `1×(1+.24+.05)−.10×.60=1.23`，钩足稳定性手调 −.18 → 1.05；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 鹿角横绝 `mv_lutouzhangfa_hengjue`（绝招，**原创扩展命名**） | 7 | 直线 n3·近身 | 2.45 | 9%/—/1200 | 击退 2；气势 100 | 可 | AF=.85；`3×.85−.05×2=2.45`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_lutouzhangfa_hengjue; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 鹿角挂兵 | `ps_lutouzhangfa_lujiao` | 3 | 对持械目标招架 +4→+10 |
| 玄寒入杖 | `ps_lutouzhangfa_hanjin` | 6 | 装备 `eq_luzhang` 时只启用该装备既有“玄冥寒气”，不追加第二次概率 |
| 寒杖归一 | `ps_lutouzhangfa_dacheng` | 10 | 成功击退目标后下一杖 Z3 +8%，每回合 1 次 |

- **路线叙事与同步镜像**：“鹿角横绝”由足厥阴起劲，经足少阴、阴跷、阴维与任脉敛住玄寒，再由内关换至手太阳后溪、腕骨导杖横扫；腕骨动作末端不变。体段计票由阴 0 / 阳 7 改为阴 6 / 阳 1；仍为 8 段、路线 CT `8×90=720`、收招合计 `1200+720=1920`，风险列表仍为 `[100,110,120,130,140,150,160,170]`，总风险 `1080`。

### 3.2 `sk_hezuibifa` 鹤嘴笔法（8 地中 · 兵器 / 奇门（笔）· 阴）**（原创扩展命名）**

> **来源归属**：鹤笔翁使用鹤嘴双笔有原著依据，固定成套笔法名与以下招名未见；具体交手与点穴表现**（待考）**。与 `skills-yitian.md` 的玄冥二老传承同属一系，`eq_hebi` 已由 `design/10` 定义。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:weapon`；`subType:exotic`；`grade:8`；`origin:canonExpanded`；`sect:null`；`lineage: 玄冥传承·鹤笔翁支`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0.60/0.40`；`weaponReq:{category:exotic,kinds:[brush],dual:true,altItems:[eq_hebi]}`；`moveSlots:4` |
| reqs | `attrs {wis:50,agi:40}`；`aptitude {apExotic:35}`；`prereq [{skill:sk_xuanmingxinfa,layer:5}]`；`hard:[aptitude,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{wis:1}},{layer:6,attrs:{wis:2,agi:1}},{layer:9,attrs:{wis:1}}]` |
| layerStats | `{seal:[3,9],hit:[2,6]}`，第 10 重合计 15 |
| 层数要点 | 1 重啄脉；3 重双分；5 重回笔；**7 重绝招鹤嘴封穴**；10 重双笔归一 |
| setTags / conflicts | `[]` / 点穴均用 `bf_xueweishoufeng`；`eq_hebi` 的 10% 九级点穴为装备效果，不与本卡同名效果重复触发 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 鹤笔翁羁绊或换俘支线可至 10 重；王府缴获笔谱可至 8 重。个人分支是否允许满层玩家来源见 §11.5，默认保留 |
| description | 双笔一架一啄，以短促手法寻隙点穴；不持成对判官笔仍可改单笔施展，但失去双分与名器特效 |

| 招式（ID；归属 `sk_hezuibifa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 啄脉 `mv_hezuibifa_dianmai` **（原创扩展命名）** | 1 | 单体·1·近身 | 1.05 | 7%/1/1000 | `bf_xueweishoufeng(level:7,acupointRef:sourcePrimary)` 30%·1 | 可 | `1×(1+.12)−.20×.30=1.06≈1.05`；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:1; recovery:1000; projection:false}` |
| 双笔分门 `mv_hezuibifa_shuangfen` **（原创扩展命名）** | 3 | 乱击 n2 r1·近身 | 1.05 | 8%/2/1000 | — | 可 | AF=.90；`.90×(1+.24+.05)=1.161`，双手命中分摊手调 −.11 → 1.05；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:8%; cd:2; recovery:1000; projection:false}` |
| 回笔护门 `mv_hezuibifa_huibi` **（原创扩展命名）** | 5 | 单体·1·近身 | 1.05 | 8%/1/1000 | 自身 `bf_shoushi` G=1·1 | 可 | `1×(1+.12+.05)−.10=1.07≈1.05`；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:1; recovery:1000; projection:false}` |
| 鹤嘴封穴 `mv_hezuibifa_fengxue`（绝招，**原创扩展命名**） | 7 | 单体·1·近身 | 2.80 | 9%/—/1200 | `bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 100%·1；气势 100 | 可 | `3.00−.20=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hezuibifa_fengxue; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 认穴 | `ps_hezuibifa_renxue` | 3 | 本功点穴效果命中 +4→+10pp |
| 双笔分守 | `ps_hezuibifa_shuangbi` | 6 | 满足 `weaponReq.dual` 时招架 +4→+10 |
| 双笔归一 | `ps_hezuibifa_dacheng` | 10 | 对已有穴位受封的目标 Z3 +8%；不提高封穴等级 |

- **路线叙事与终点复核**：“鹤嘴封穴”由任脉、冲脉提气，经手少阴与手厥阴贯入持笔腕；阳池完成腕部导引，再由中冲领笔尖封穴，符合 `design/21` §4.3.1 的兵器路线要求。

### 3.3 `sk_xuanminghanyuangong` 玄冥寒元功（10 天下 · 内功 · 阴）**（原创扩展）**

- **出处与边界**：原著有玄冥二老与玄冥神掌的阴寒内力表现；是否另有具名成套上乘内功未见，故“玄冥寒元功”、招名、机制与数值均为**（原创扩展）**。它是玄冥一系共传，不是鹿杖客或鹤笔翁个人专属。
- **字段**：`category:inner`；`subType:inner`；`grade:10`；`origin:expanded`；`sect:sect_ruyangwangfu`；`lineage:玄冥一系`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0/1`；`moveSlots:5`；`special:{fusible:true}`；`observable:false`。
- **reqs**：`attrs:{bre:60,wil:50}`；`aptitude:{apInner:45}`；`prereq:[{skill:sk_xuanmingxinfa,layer:7},{skill:sk_xuanming,layer:7}]`；`sect:{id:sect_ruyangwangfu,rank:4}`；`hard:[prereq]`。人物传承可用 `reqsOverride` 解除王府身份，不解除两门前置。
- **trainingAttrs**：`[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]`。
- **内功**：`inner.contribution:{mpMaxPct:42,hpMaxPct:25,attrs:{con:6,wil:6,wis:3,str:3},mpRegen:3.0,stats:{resCold:10,resInjury:10}}`；`IP=42+25+2×(6+6+3+3)+5×3.0=118`；`meridians:[mer_zushaoyin,mer_yinqiao,mer_yinwei,mer_renmai]`；`breathProfileRef:txp_xuanminghanyuangong`；`innerGuard:{enabled:true,reflectBp:0}`。
- **层数**：1 重玄冥吐纳｜3 重凝元｜5 重护寒｜**7 重第一绝招·寒壁守元**｜8 重双源同脉｜**9 重第二绝招·霜元归一**｜10 重寒元圆成。

| 招式（ID；归属本功） | 重 | 范围·效果 | 耗内/cd/收招 | MoveDef |
|---|---:|---|---|---|
| 玄冥吐纳 `mv_xuanminghanyuangong_tuna` **（原创扩展）** | 1 | 自身；`bf_dingxin` 2 | 6%/2/900 | `MoveDef{unlock:1;ultimate:false;mpCost:6%;cd:2;recovery:900;meridianRouteRef:mfr_xuanminghanyuangong_tuna;projection:false}` |
| 凝元 `mv_xuanminghanyuangong_ningyuan` **（原创扩展）** | 3 | 自身；`bf_wenzhong` 2 | 7%/3/950 | `MoveDef{unlock:3;ultimate:false;mpCost:7%;cd:3;recovery:950;meridianRouteRef:mfr_xuanminghanyuangong_ningyuan;projection:false}` |
| 护寒 `mv_xuanminghanyuangong_huhan` **（原创扩展）** | 5 | 自身；`bf_hutizhenqi` 2，`shieldPctHpMax:0.10` | 8%/3/1000 | `MoveDef{unlock:5;ultimate:false;mpCost:8%;cd:3;recovery:1000;meridianRouteRef:mfr_xuanminghanyuangong_huhan;projection:false}` |
| 寒壁守元 `mv_xuanminghanyuangong_hanbi`（绝招，**原创扩展**） | 7 | 自身；`bf_jiangu` 3、`bf_renjin` 2 | 10%/0/1200 | `MoveDef{unlock:7;ultimate:true;rageCost:100;mpCost:10%;cd:0;recovery:1200;meridianRouteRef:mfr_xuanminghanyuangong_hanbi;projection:false}` |
| 霜元归一 `mv_xuanminghanyuangong_shuangyuan`（绝招，**原创扩展**） | 9 | 自身；回复 `hpMax×20%`，清 1 个 `injury` | 10%/0/1200 | `MoveDef{unlock:9;ultimate:true;rageCost:100;mpCost:10%;cd:0;recovery:1200;meridianRouteRef:mfr_xuanminghanyuangong_shuangyuan;projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 寒元 | `ps_xuanminghanyuangong_hanyuan` | 1 | 主运时 `resCold +4→+10`；不赋予寒毒免疫 |
| 掌息相承 | `ps_xuanminghanyuangong_zhangxi` | 5 | 装配 `sk_xuanming` 时下一记玄冥掌耗内 `−3%→−8%` |
| 双源同脉 | `ps_xuanminghanyuangong_tongmai` | 8 | 相邻玄冥同源使用者存在时 `resInjury +5→+12`，不按人数叠加 |
| 寒元圆成 | `ps_xuanminghanyuangong_dacheng` | 10 | 每战首次护体内劲被击穿时获得 `bf_renjin` 1 回合 |

- **路线叙事与互异**：“寒壁守元”以足少阴起、阴跷承接，最终沿任脉收丹田；“霜元归一”由阴维转足厥阴与手厥阴，最终归膻中。两路共享 0/10 穴，不是轮换或逆序；普通招分别承担吐纳、凝元、护寒。
- **learnSources**：玄冥一系师门传承可至 10 重；鹿杖客或鹤笔翁羁绊 / 换俘授艺可至 10 重；汝阳王府玄冥密谱可至 8 重。主角与其他满足前置者均可学，不以首领身份为硬门槛。
- **外放判定**：五招只在体内凝元、调息、护体，`projection:false`；配合 `sk_xuanming` 时由掌法卡自身决定外放，本功不重复投送。

---

## 4. 昆仑、崆峒与华山倚天支

### 4.1 `sk_kunlunliangyixinfa` 昆仑两仪心法（8 地中 · 内功 · 调和）**（原创扩展）**

> **来源归属**：依昆仑派正两仪剑法的阴阳协同扩写，原著未见同名独立心法。与 `skills-yitian.md` 的昆仑体系同属一门，是 `sk_kunlunxinfa` 到 `sk_zhengliangyi` 之间的高阶运劲课。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_kunlun`；`lineage: 昆仑两仪剑理`；`sourceChapters:[ch04_yitian]`；`nature:harmony`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_chongmai,mer_daimai]` **【建议值】** / `txp_kunlunliangyixinfa` |
| reqs | `attrs {bre:50,wil:40}`；`aptitude {apInner:35}`；`sect {id:sect_kunlun,rank:4}`；`prereq [{skill:sk_kunlunxinfa,layer:7},{skill:sk_yudafeihuajian,layer:5}]`；`hard:[sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:2}},{layer:9,attrs:{bre:2}}]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{agi:4,wis:5,wil:3},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {parry:8,resCold:7}` 合计 15 |
| 层数要点 | 1 重阴阳吐纳；3 重转仪；5 重守正；**7 重绝招两仪合一**；10 重六十四变 |
| setTags / conflicts | `[]` / 只强化昆仑同门运劲，不把两人夹击改写成强制合击 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 昆仑 L4 掌剑 / 执事考校可至 10 重；何太冲或班淑娴个人授艺可至 10 重；光明顶两仪观摩仅可至 6 重。主角与其他门人均按正常途径可学 |
| description | 以正反、进退互换稳定剑势的高阶心法；两仪思想与正两仪招理有据，独立心法及主动招均为玩法扩展 |

| 招式（ID；归属 `sk_kunlunliangyixinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 阴阳吐纳 `mv_kunlunliangyixinfa_tuna` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_huinei` G=1·2 | — | `power=0`；回内由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 转仪 `mv_kunlunliangyixinfa_huanzhuan` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | 移除 1 个可驱散 `cold/heat` | — | `power=0`；单体自净由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 守一 `mv_kunlunliangyixinfa_shouyi` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/3/1000 | `bf_dingxin` G=2·2 | — | `power=0`；心神增益由无伤害、cd3 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 两仪合一 `mv_kunlunliangyixinfa_heyi`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kunlunliangyixinfa_heyi; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 两仪根基 | `ps_kunlunliangyixinfa_liangyi` | 3 | 昆仑剑法修炼效率 +5%→+12% |
| 雪峰定息 | `ps_kunlunliangyixinfa_xuefeng` | 6 | 高寒地形中 `resCold +4→+10` |
| 六十四变 | `ps_kunlunliangyixinfa_dacheng` | 10 | 连续使用不同昆仑招式时第二招招架 +8；重复招式清除 |

### 4.2 `sk_kongtongwuxingxinfa` 崆峒五行心法（8 地中 · 内功 · 阴）**（原创扩展）**

> **来源归属**：七伤拳以人体阴阳五行、五脏七伤立论有原著依据，安全调养的独立高阶心法名未见，故为本作扩展。与 `skills-yitian.md` 的崆峒体系同属一门，承接 `sk_kongtongyangshenggong`，不重写 `sk_qishangquan` 的自伤规则。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_kongtong`；`lineage: 崆峒五行养脏一系`；`sourceChapters:[ch04_yitian]`；`nature:yin`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_renmai,mer_chongmai]` **【建议值】** / `txp_kongtongwuxingxinfa`；任脉投阴一票、冲脉不投票，故性质为阴 |
| reqs | `attrs {bre:50,wil:45}`；`aptitude {apInner:35}`；`sect {id:sect_kongtong,rank:4}`；`prereq [{skill:sk_kongtongyangshenggong,layer:7},{skill:sk_qishangchujue,layer:6}]`；`hard:[sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:1,wil:1}},{layer:9,attrs:{bre:1,wil:1}}]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:6,wil:4,wis:2},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {resInjury:10,tough:5}` 合计 15 |
| 层数要点 | 1 重调和五脏；3 重养脏；5 重换劲；**7 重绝招五行固元**；10 重五行圆满 |
| setTags / conflicts | `[]` / 只降低七伤训练风险，不免除 `design/05` §9.1.1 的主运与品阶条件；本任务不越权修改既有正式套装成员 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 崆峒 L4 五老共同考校可至 10 重；救治走火弟子与归还拳谱线索后可至 8 重。是门派正常高阶传承，非首领专用 |
| description | 先调五脏、再换七劲的护脉心法；用于让崆峒高阶弟子安全承接七伤拳，而非无条件抹除其代价 |

| 招式（ID；归属 `sk_kongtongwuxingxinfa`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 调和五脏 `mv_kongtongwuxingxinfa_tiaohe` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | 移除 1 层可驱散 `injury` | — | `power=0`；单层自净由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 养脏 `mv_kongtongwuxingxinfa_yangzang` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | `bf_wenzhong` G=2·2 | — | `power=0`；稳态增益由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 换劲 `mv_kongtongwuxingxinfa_huanjin` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/4/1000 | 下一记崆峒拳招效果命中 +15pp | — | `power=0`；单次条件增益由无伤害、cd4 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:4; recovery:1000; projection:false}` |
| 五行固元 `mv_kongtongwuxingxinfa_guyuan`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | 清除 2 层可驱散 `injury`，获 `bf_hutizhenqi`（12% hpMax）3 回合；气势 100 | — | 标准 18% 治疗价值折为 12% 护体并支付双层自净；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_kongtongwuxingxinfa_guyuan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 五行调息 | `ps_kongtongwuxingxinfa_wuxing` | 3 | 战外疗伤对自身的 `repairUnits +1`；仍由调息档案结算 |
| 护脏 | `ps_kongtongwuxingxinfa_huzang` | 6 | 七伤类自伤概率 −5→−12pp；不得低于 `design/05` 的最低代价 |
| 五行圆满 | `ps_kongtongwuxingxinfa_dacheng` | 10 | 每战首次新建 `bf_neishang` 时少 1 层，最低 0 |

### 4.3 `sk_huashanliangyixinfa04` 华山两仪心法（倚天支）（8 地中 · 内功 · 阳）**（原创扩展）**

> **来源归属**：依华山倚天支反两仪刀法的刚柔逆转扩写，原著未见同名独立心法。与 `skills-yitian.md` 的华山倚天支同属一门；后缀 `04` 用来避免把本条误当笑傲或碧血时代传承，不建立废弃门派 ID。

| 字段 | 值 |
|---|---|
| 基础字段 | `category:inner`；`subType:inner`；`grade:8`；`origin:expanded`；`sect:sect_huashan`；`lineage: 华山倚天支两仪刀理`；`sourceChapters:[ch04_yitian]`；`nature:yang`；`wOut/wIn:0/1`；`moveSlots:4` |
| meridians / breathProfileRef | `[mer_dumai,mer_yangwei]` **【建议值】** / `txp_huashanliangyixinfa04`；督脉、阳维各投阳一票，故性质为阳 |
| reqs | `attrs {bre:50,wil:40}`；`aptitude {apInner:35}`；`sect {id:sect_huashan,rank:4}`；`prereq [{skill:sk_huashanxinfa04,layer:7},{skill:sk_liangyidaojia,layer:6}]`；`hard:[sect,prereq]` |
| trainingAttrs | `[{layer:3,attrs:{bre:1}},{layer:6,attrs:{bre:2}},{layer:9,attrs:{bre:2}}]` |
| inner.contribution | `{mpMaxPct:30,hpMaxPct:18,attrs:{con:4,str:4,wil:4},mpRegen:2.2}`；`IP=30+18+2×12+5×2.2=83`；`stats {parry:8,resCC:7}` 合计 15 |
| 层数要点 | 1 重抱元；3 重回转；5 重互易；**7 重绝招反正还元**；10 重两仪圆满 |
| setTags / conflicts | `[]` / 仅限倚天时代分支；不向后世华山气宗、剑宗自动继承 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 华山倚天支 L4 长老 / 堂主考校可至 10 重；完成险峰护送与两仪化四象协同考校可至 8 重。主角与其他本支门人均可学 |
| description | 以刚柔、进退和高低两式相换为主的倚天支内功；只补该时代战斗链，不证明跨时代同名师承 |

| 招式（ID；归属 `sk_huashanliangyixinfa04`） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 抱元 `mv_huashanliangyixinfa04_baoyuan` **（原创扩展）** | 1 | 自身·支援 | 0 | 7%/3/900 | `bf_wenzhong` G=1·2 | — | `power=0`；防势由无伤害、cd3 支付；`MoveDef{unlock:1; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:900; projection:false}` |
| 阴阳回转 `mv_huashanliangyixinfa04_huizhuan` **（原创扩展）** | 3 | 自身·支援 | 0 | 7%/3/1000 | 本回合刀招招架 +8 | — | `power=0`；限时单类增益由无伤害、cd3 支付；`MoveDef{unlock:3; ultimate:false; rageCost:0; mpCost:7%; cd:3; recovery:1000; projection:false}` |
| 高低互易 `mv_huashanliangyixinfa04_huyi` **（原创扩展）** | 5 | 自身·支援 | 0 | 8%/3/1000 | 下一记华山倚天支刀招命中 +10 | — | `power=0`；单次条件增益由无伤害、cd3 支付；`MoveDef{unlock:5; ultimate:false; rageCost:0; mpCost:8%; cd:3; recovery:1000; projection:false}` |
| 反正还元 `mv_huashanliangyixinfa04_huanyuan`（绝招，**原创扩展**） | 7 | 自身·支援 | 0 | 9%/—/1200 | `bf_hutizhenqi` 100%·3，护体=`hpMax×18%×1.2=21.6%`；气势 100 | — | 地阶单体治疗基准 18% 等价护体 ×1.2；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanliangyixinfa04_huanyuan; projection:false}` |

| 被动 | ID | 层 | 效果 |
|---|---|---:|---|
| 两仪根基 | `ps_huashanliangyixinfa04_liangyi` | 3 | 华山倚天支刀法修炼效率 +5%→+12% |
| 险峰立势 | `ps_huashanliangyixinfa04_xianfeng` | 6 | 高处或窄道格中招架 +4→+10 |
| 两仪圆满 | `ps_huashanliangyixinfa04_dacheng` | 10 | 成功招架后下一记反两仪刀招 Z3 +8%，每回合 1 次 |

---

## 5. 来源扩展登记

本任务没有只缺 `sourceChapters` 的复用项；下列两项已由原图鉴原生登记 `ch04_yitian`，故不产生待 NXfix 落实的来源扩展。波斯三使使用本册新定义的总教主运，不把 `sk_qiankun` 登记为复用项：

| 武学 | 本书用途 | 原图鉴与依据 | 处理 |
|---|---|---|---|
| `sk_jingangbuhuai` | 三渡主运，10 品阳 | `skills-shaolin.md`；原生书界含倚天且已有渡厄授艺来源 | 直接复用 |
| `sk_huanyinzhi` | 成昆旧有辅外功 / 新增两门前置 | `skills-shaolin.md`；成昆个人旁支，原生倚天 | 直接复用 |

---

## 6. 外放候选审计表

| 武学 / 招式组 | 投送介质 | `projection` | 判定 |
|---|---|---:|---|
| `sk_mingjiaohujiaogong`、`sk_huanyinxinfa` 的支援招 | 护体、回内、驱散或姿态 | `false` | 纯支援 / 纯护体不是真气离体伤敌 |
| `sk_huanyinshou` | 近身掌手 | `false` | 全部接触命中；“阴劲”性质不等于外放 |
| `sk_jinhuazhangfa`、`sk_lutouzhangfa`、`sk_hezuibifa` | 杖、鹿杖、鹤嘴双笔的实体挥击 | `false` | 普通兵刃挥击不算外放 |
| `sk_jinhuabiaofa` | 实体花形暗器 | `false` | 暗器投掷即使有 4 格射程也不算真气外放 |
| `sk_bosishenghuoxuangong`、`sk_xuanminghanyuangong` | 自身吐纳、凝元、转换与护体 | `false` | 内功不离体伤敌；所配外功另按自身卡判定 |
| 昆仑 / 崆峒 / 华山三门新增内功 | 护体、运劲、驱散 | `false` | 无离体伤害段 |

因此本册新增 50 个 `MoveDef` 全为 `projection:false`，不填写 `projectionSpreadSteps`；17 条绝招路线无需满足外放手部端点条件。

---

## 7. 内功调息档案与护体内劲

字段和算法唯一见 `design/21` §10；本册只登记实例。七门内功均为满 10 重、`scope:3`、`ct:1000`、`mpCostBp:0`、`outOfBattleScaleBp:15000`。10 品非调和为 `2300/540`，调和为 `2415/567`；9 品非调和为 `2200/516`，调和为 `2310/541`；8 品非调和为 `2100/492`，调和为 `2205/516`。

| 内功 | breathProfileRef / 正式档案 | `relief/repair` | innerGuard |
|---|---|---|---|
| `sk_bosishenghuoxuangong` | `txp_bosishenghuoxuangong` `BreathProfile{grade:10;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `500+100×10+80×10=2300` / `120+24×10+18×10=540` | `{enabled:true,guard:yang-high,reflectBp:0}`；显示档 IV |
| `sk_xuanminghanyuangong` | `txp_xuanminghanyuangong` `BreathProfile{grade:10;layer:10;nature:yin;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `500+100×10+80×10=2300` / `120+24×10+18×10=540` | `{enabled:true,guard:yin-high,reflectBp:0}`；显示档 IV |
| `sk_mingjiaohujiaogong` | `txp_mingjiaohujiaogong` `BreathProfile{grade:9;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `floor((500+100×9+80×10)×1.05)=2310` / `floor((120+24×9+18×10)×1.05)=541` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_mingjiaohujiaogong_huguang→K-HD4` |
| `sk_huanyinxinfa` | `txp_huanyinxinfa` `BreathProfile{grade:9;layer:10;nature:yin;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `500+100×9+80×10=2200` / `120+24×9+18×10=516` | `{enabled:true,guard:yin-high,reflectBp:0}`；自然 `K-YN2`；`mv_huanyinxinfa_niliu→K-YD4` |
| `sk_kunlunliangyixinfa` | `txp_kunlunliangyixinfa` `BreathProfile{grade:8;layer:10;nature:harmony;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `floor((500+100×8+80×10)×1.05)=2205` / `floor((120+24×8+18×10)×1.05)=516` | `{enabled:true,guard:harmony-high,reflectBp:0}`；自然 `K-HN2`；`mv_kunlunliangyixinfa_heyi→K-HD4` |
| `sk_kongtongwuxingxinfa` | `txp_kongtongwuxingxinfa` `BreathProfile{grade:8;layer:10;nature:yin;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `2100/492` | `{enabled:true,guard:yin-high,reflectBp:0}`；自然 `K-YN2`；`mv_kongtongwuxingxinfa_guyuan→K-YD4` |
| `sk_huashanliangyixinfa04` | `txp_huashanliangyixinfa04` `BreathProfile{grade:8;layer:10;nature:yang;scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000}` | `2100/492` | `{enabled:true,guard:yang-high,reflectBp:0}`；自然 `K-AN2`；`mv_huashanliangyixinfa04_huanyuan→K-AD4` |

护体仍须合法自然短路或 `purpose:defense` 路线；1 MP 抵消 2 伤害、适用率、击穿迟滞和结算顺序均不在本册重定义。

---

## 8. 统计表

| 归属 | 10 天下 | 9 地上 | 8 地中 | 内功 | 拳脚 | 兵器 | 暗器 | 合计 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 明教 / 波斯总教 | 1 | 1 | 2 | 2 | 0 | 1 | 1 | 4 |
| 成昆个人旁支 | 0 | 2 | 0 | 1 | 1 | 0 | 0 | 2 |
| 玄冥二老 | 1 | 0 | 2 | 1 | 0 | 2 | 0 | 3 |
| 昆仑 / 崆峒 / 华山倚天支 | 0 | 0 | 3 | 3 | 0 | 0 | 0 | 3 |
| **合计** | **2** | **3** | **7** | **7** | **1** | **3** | **1** | **12** |

| 指标 | 结果 | 判定 |
|---|---|---|
| 绝招 | 天下 `2×2=4`；地上 `3×2=6`；地中 `7×1=7`；合计 17 | ✅ 解锁层为天下 / 地上 7、9，地中 7 |
| 招式 / 被动 | 50 个可施放招式，其中 17 绝招；38 个被动 | ✅ 天下每门 5 招 4 被动；原地阶卡维持 4 招 3 被动 |
| 天阶扩容 | 新增 `sk_bosishenghuoxuangong`、`sk_xuanminghanyuangong` | ✅ 服从作者 2026-09-28 扩容决定 |
| 内功 IP | 天下 `2×118`；地上 `2×94.5`；地中 `3×83` | ✅ 精确命中 `design/05` §5.5 |
| 路线 CT | 天下 `4×(10×80)`；地阶 `13×(8×90)` | ✅ 加收招均不超过 2000 |
| 真气外放 | 0 / 50 | ✅ 全部逐招显式 `projection:false` |
| 敌人专用 | 0 | ✅ 均有玩家 / 其他角色可达来源；个人旁支另待作者确认满层路径 |
| 来源扩展待登记 | 0 | ✅ 两门复用项原生均含倚天；三使主运不作不合法复用 |

---

## 9. 本文新增术语与 ID

| 类别 | 新增 ID |
|---|---|
| 武学 `sk_*` | `sk_mingjiaohujiaogong`、`sk_jinhuazhangfa`、`sk_jinhuabiaofa`、`sk_bosishenghuoxuangong`、`sk_huanyinxinfa`、`sk_huanyinshou`、`sk_lutouzhangfa`、`sk_hezuibifa`、`sk_xuanminghanyuangong`、`sk_kunlunliangyixinfa`、`sk_kongtongwuxingxinfa`、`sk_huashanliangyixinfa04`，共 12 项 |
| 绝招 `mv_*` | 文首索引 17 项；其余普通招式见各卡，共 50 项 |
| 路线 `mfr_*` | 文首索引 17 项绝招路线，加 §0.1 六项普通路线；原卡普通招路线仍由既有索引拥有 |
| 调息档案 `txp_*` | `txp_mingjiaohujiaogong`、`txp_bosishenghuoxuangong`、`txp_huanyinxinfa`、`txp_xuanminghanyuangong`、`txp_kunlunliangyixinfa`、`txp_kongtongwuxingxinfa`、`txp_huashanliangyixinfa04`，共 7 项 |
| 被动 `ps_*` | 两门天下各 4 项、原十卡各 3 项，共 38 项 |

本册不新增 `sect_*`、`eq_*` 或 `bf_*`；两门天下内功是作者扩容决定的正式新增，其他引用仍复用其唯一归属。

---

## 10. 数据校验规则与测试用例

### 10.1 构建期校验

| 编号 | 校验 | 通过条件 | 失败级别 |
|---|---|---|---|
| `B04-V01` | ID 唯一 | 12 个 `sk_*`、50 个 `mv_*`、38 个 `ps_*`、新增 23 个 `mfr_*` 与 7 个 `txp_*` 均在全仓唯一 | error |
| `B04-V02` | 天阶扩容 | 本册新增两门天下内功，均列入 Canon 扩容名录；三使不引用 `sk_qiankun` | error |
| `B04-V03` | 品阶与绝招 | 天下 / 地上各门 2 记绝招且在 7 / 9 重解锁；地中各 1 记且在 7 重解锁 | error |
| `B04-V04` | 卡片容量 | 两门天下各 5 招 / 4 被动；原地阶卡各 4 招 / 3 被动 | error |
| `B04-V05` | 绝招资源 | 天下 4 招耗内 10%，地阶 13 招耗内 9%；均 `rageCost:100;cd:0;recovery:1200` | error |
| `B04-V06` | 路线闭合 | 17 个正文绝招与索引一一镜像；天下每路 10×80、地阶每路 8×90，完整收招均不超过 2000 CT | error |
| `B04-V07` | 路线唯一 | 不与全仓既有路线完全相同；同门两招共享穴位不超过 50%，且不以轮换或逆序伪造差异 | error |
| `B04-V08` | 外放判定 | 50 招均显式 `projection:false`，且不存在 `projectionSpreadSteps`；暗器实体和普通兵刃挥击不误判外放 | error |
| `B04-V09` | 内功预算 | 天下两门 IP 各 118；地上两门各 94.5；地中三门各 83 | error |
| `B04-V10` | 调息 | 7 门内功各有唯一 `txp_*`；`scope:3;ct:1000;mpCostBp:0;outOfBattleScaleBp:15000` | error |
| `B04-V11` | 来源可达 | 门派武学均有正常门派 / 职级 / 秘籍 / 奇遇路径；个人旁支有默认玩家路径并在 §11.5 请求确认 | error |
| `B04-V12` | 原著边界 | 原著无固定名称者标原创扩展或原创扩展命名；待核动作不写引文、回目号或伪招名 | error |
| `B04-V13` | AR-27 门槛与修炼加成 | 12 门 `reqs.attrs` 符合 `design/05` §7.3.1；资质按 `5×grade−5`，复合武学保留双资质；`trainingAttrs` 仅 3/6/9 重、逐次合计 ≤4、单门合计 ≤12 | error |

### 10.2 最小测试向量

| 用例 | 输入 / 操作 | 精确期望 |
|---|---|---|
| `B04-T01` 数量 | 扫描正式武学卡标题 | 天 / 地 / 玄 / 黄为 `2/10/0/0`；天下 / 地上 / 地中为 `2/3/7` |
| `B04-T02` 绝招 | 对照正文卡与文首索引 | `4+6+7=17` 个唯一绝招与 17 个唯一 `mfr_*`，无隐式路线 |
| `B04-T03` 路线 CT | 任取一记绝招 | 天下 `1200+10×80=2000`；地阶 `1200+8×90=1920` |
| `B04-T04` 同门差异 | 比较明教护教功、幻阴心法、幻阴手各自两路 | 各对共享穴位 ≤4，且序列不构成轮换或逆序 |
| `B04-T05` 调和地上 IP | `34+20+2×14+5×2.5` | `94.5` |
| `B04-T06` 阴性地上 IP | `34+20+2×14+5×2.5` | `94.5` |
| `B04-T07` 调和地中 IP | `30+18+2×12+5×2.2` | `83` |
| `B04-T08` 地上调息 | 阴性档；调和档再乘 1.05 向下取整 | 阴 `2200/516`；调和 `2310/541` |
| `B04-T09` 地中调息 | 8 品调和、10 重 | `floor(2100×1.05)=2205` / `floor(492×1.05)=516` |
| `B04-T10` 暗器外放 | 施放 `mv_jinhuabiaofa_sanzhan` | 由实体暗器完成投送；`projection=false`，不建立真气扩散路线 |
| `B04-T11` 玩家可学 | 用合格明教 L4 角色完成护教考校 | 可取得 `sk_mingjiaohujiaogong` 并练至 10 重，不要求 Boss 身份 |
| `B04-T12` 个人旁支 | 走成昆遗册而非私授 | 两门幻阴旁支最高 8 重；不因拾取遗册自动补满 |
| `B04-T13` 三使主运 | 构建风云月三使任一画像 | 主运为 `sk_bosishenghuoxuangong` 9 重，不得回退 `sk_qiankun` |
| `B04-T14` 二老主运 | 构建鹿杖客 / 鹤笔翁画像 | 主运为 `sk_xuanminghanyuangong` 9 重，无空外键或地位兜底 |

---

## 11. 待决事项 / 依赖

### 11.1 替下游给出的建议值

| 编号 | 本文建议值 | 下游归属 / 回填要求 |
|---|---|---|
| `B04-S01` | 门派考校 / 亲授可至 10 重，观摩或残谱多限 6–8 重 | `design/12` / `chapters/04`：落正式 `LearnSource` 时保留层数差，不把首领配装转成掉落 |
| `B04-S02` | 个人独门满层默认只走本人私授、受控同行或羁绊 / 换俘；遗册最高 8 重 | `design/12`：作者确认前按此实现，并保证主角与其他合格角色均可走来源 |
| `B04-S03` | 七门内功的调息档案与护体路线按 §7、文首索引接线 | `design/21` / 数据管线：固定 RNG 回放后只调遭遇 HP / 防御，不压低主运品阶 |

### 11.2 本文依赖的上游事实

- 天阶扩容、品阶与本土书界依赖 Canon §4 / §13 及作者决定 AR-17；本册新增两门天下内功。
- 武学字段、IP、招式容量、绝招资源与 Buff 引用依赖 `design/05`、`design/06`；路线、调息、护体及外放依赖 `design/21`。
- 既有明教 / 波斯总教、六派、玄冥与成昆条目依赖 `skills-yitian.md`、`skills-shaolin.md`；两项合规复用来源见 §5，两门新主运由本册唯一定义。
- 门派职级、任务来源、装备兼容与人物主记录分别依赖 `design/17`、`design/12`、`design/10`、`design/18`。

### 11.3 对基准的修改提案

| 编号 | 提案 | 理由 |
|---|---|---|
| `B04-P01` | **已解决：**在 Canon §13 / §18 登记按书补录册为正式武学定义来源 | 构建器据此把补录卡作为正式定义而非章节临时配置 |
| `B04-P02` | **已解决：**地位兜底不替代合法主运外键；玄冥二老与波斯三使分别接入本册两门新功 | 作者决定扩容后已可实体化，章节不得继续保留空外键 |
| `B04-P03` | 若采纳崆峒五行心法为套装件，在 `design/07` 的 `set_kongtong_qishang` 成员表补入该 ID | 本册不能单向写 `setTags`；未双向登记会违反套装闭合校验，故当前默认不加入 |

### 11.4 原著考据待办

1. 核对金花婆婆持杖、使用金花状暗器的动作、介质与人物在场，不预写回目号或逐字引文。
2. 核对成昆以幻阴指暗袭的动作与阴寒表现；“幻阴心法”“幻阴手”继续只作原创扩展命名。
3. 核对鹿杖客的鹿角杖、鹤笔翁的鹤嘴双笔及相关交手表现；固定成套武学名与招名均不冒充原著。
4. 核对昆仑正两仪、华山反两仪与崆峒七伤体系的传承边界；本册三门内功仍按玩法扩写处理。

### 11.5 开放问题（附默认值）

| 编号 | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| `B04-O01` | 成昆个人旁支能否由玩家练满？ | 可以，但只限成昆私授 / 受控同行；遗册最高 8 重且承担品德代价 | 玩家收集、邪线奖励 |
| `B04-O02` | 鹿杖客、鹤笔翁的个人兵器分支能否由其他人物练满？ | 可以，经本人羁绊或换俘授艺至 10 重；缴获残谱最高 8 重 | 王府支线、非敌专约束 |
| `B04-O03` | **已解决：**玄冥二老的 10 品主运如何闭合？ | 使用 `sk_xuanminghanyuangong` 9 重；按玄冥传承正常可学，解除构建阻断 | 首领画像、构建门禁 |
| `B04-O04` | “明教护教功”是否改为更具原著依据的名称？ | 保留明确标注的原创扩展名，不宣称原著有同名秘籍 | 本地化、图鉴命名 |
| `B04-O05` | 崆峒五行心法是否加入既有崆峒七伤套装？ | 默认不加入，保持 `setTags:[]`；若作者采纳，须由 `design/07` 同步正式成员与本卡反向标签 | 套装闭合、ID lint |
