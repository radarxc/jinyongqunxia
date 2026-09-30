# 门派武学图鉴 · 五岳剑派与日月神教（`skills-wuyue`）

> **版本**：v1.2（审校 C1c.R；全局审计，2026-09-27）；经脉系统落地（2026-09-27）；绝招数量调整（2026-09-27）；图鉴一致性审计（2026-09-28）；天中 / 地中绝招数统一（2026-09-28）；外放标记（2026-09-28）；绝招路线叙事化（2026-09-29）；经脉落地终审（2026-09-29）；路线叙事第三轮（2026-09-29）；阴阳性质落地 AR-18（2026-09-29）。

> **归属（基准 §18）**：`design/catalog/skills-*.md` 门派武学图鉴。本文件唯一收录笑傲书界的五岳剑派（华山气宗/剑宗、嵩山、泰山、南衡山、北恒山）、日月神教及梅庄四友、福威镖局与林家、青城派、五仙教，以及桃谷六仙、田伯光、不戒和尚等散人传承。
> **上游**：`00-canon.md` §3–§5、§7、§9、§12–§13、§16、§20 与 v1.8；`decisions/author-requirements.md` AR-01–AR-03、AR-07–AR-08、AR-14–AR-18（含 2026-09-27／28 作者决定与 2026-09-29 新口径）；`decisions/author-decisions.md` P33；`decisions/rulings-v1.md` C14–C17、C22–C23 与 §3–§5；`design/17-sects-compendium.md` §1、§3、§6、§8–§9；`design/21` v2.7.2。
> **引用而不重定义**：字段、层数、招式预算、内功贡献、代价型武学与“破 X”见 `design/05`；战斗经脉运行、招式路线、绝招、擒拿／点穴、调息、护体内劲与经脉乘区见 `design/21`；经脉、穴位、冲穴、周天与九转见 `design/15`；Buff 本体见 `design/06`；属性与技艺见 `design/03`；书界压制、残承与印证见 `design/02`；合击结算见 `design/09`；装备见 `design/10`；套装最终规则交 `design/07`。跨组只引用 `sk_yijinjing`、`sk_taijiquan`、`sk_taijijian`、`sk_dagou` 等 ID，不重复定义。
> **标注约定**：**（原创扩展）** = 原著没有的内容；**（原创扩展命名）** = 原著有其人其事、但本作新拟武学或招式名；**（待考）** = 须以三联/广州修订版逐字核对；**【建议值】** = 依赖下游定稿。
> **审校记录**：审校 C1c.R（2026-09-26）；复核天级锚点、招式 / 内功预算、Buff 外键、门派职级与装配可行性。经脉系统落地（2026-09-27）：按 AR-14 / `design/21` v2.0 补路线、轻功速度、调息与护体接口。经脉落地终审（2026-09-29）：按 Canon v1.6 / `design/21` v2.5 收口音功外放、出招末端、路线用途与正式实例口径。阴阳性质落地 AR-18（2026-09-29）：内功性质按主修经脉票数重算，路线性质仅取体段并同步调息、护体与路线门槛。

---

## 0. 阅读指引与统一记法

补录索引：华山、嵩山、青城、日月神教及其个人传承的本门补录武学见 `skills-bulu-05-xiaoao.md`（华山紫气诀、剑宗行气诀、嵩山真气、嵩山开合掌、青城运气诀、黑木玄功、任我行掌法、葵花飞针）；补录册依 Canon v1.6 同为正式定义源，本文不重复武学卡。

### 绝招显式路线索引（镜像正文卡，非覆写层；2026-09-29）

本索引镜像正文卡，非覆写层；与正文不一致即为错误，并以正文为准。每记绝招使用独立稳定路线与显式穴位序列。

<!-- skill-catalog-audit:start -->
| 品阶 | 武学 | MoveDef（正文卡镜像） | 路线 ID | steps（acupointRef/segmentCt/riskBp） |
|---|---|---|---|---|
| 12 天上 | `sk_dugu9` | `mv_dugu9_poanqi` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_dugu9_poanqi}` | `mfr_dugu9_poanqi` | `MeridianRouteDef{moveRef:mv_dugu9_poanqi; ultimate:true; purpose:attack}`；`ap_zushaoyang_fengshi/80/100→ap_yangqiao_fuyang/80/120→ap_yangqiao_shenmai/80/140→ap_zushaoyang_yanglingquan/80/160→ap_yangwei_tianliao/80/180→ap_dumai_shendao/80/200→ap_shoushaoyang_tianjing/80/220→ap_shoushaoyang_waiguan/80/240→ap_shoutaiyang_wangu/80/260→ap_shouyangming_hegu/80/280` |
| 12 天上 | `sk_dugu9` | `mv_dugu9_poqi` `MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; range:{min:1,max:1}; aoe:{tpl:aoe_line,n:1}; projection:true; projectionSpreadSteps:[{tpl:aoe_line,n:1},{tpl:aoe_line,n:2},{tpl:aoe_line,n:3}]; DamageKind:'projected'; meridianRouteRef:mfr_dugu9_poqi}` | `mfr_dugu9_poqi` | `MeridianRouteDef{moveRef:mv_dugu9_poqi; ultimate:true; purpose:attack}`；`ap_renmai_qihai/80/100→ap_renmai_guanyuan/80/120→ap_daimai_zulinqi/80/140→ap_daimai_weidao/80/160→ap_dumai_zhiyang/80/180→ap_shoujueyin_tianchi/80/200→ap_shoujueyin_neiguan/80/220→ap_shoushaoyang_waiguan/80/240→ap_shoutaiyang_wangu/80/260→ap_shoushaoyang_yangchi/80/280` |
| 12 天上 | `sk_dugu9` | `mv_dugu9_wuzhao` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_dugu9_wuzhao}` | `mfr_dugu9_wuzhao` | `MeridianRouteDef{moveRef:mv_dugu9_wuzhao; ultimate:true; purpose:attack}`；`ap_shoushaoyin_shenmen/80/100→ap_shoutaiyang_tinggong/80/120→ap_yangwei_benshen/80/140→ap_chongmai_zhongzhu/80/160→ap_daimai_jingmen/80/180→ap_shouyangming_pianli/80/200→ap_shoutaiyang_yanglao/80/220→ap_shoushaoyang_zhigou/80/240→ap_shouyangming_hegu/80/260→ap_shoutaiyang_yanggu/80/280` |
| 9 地上 | `sk_zixiashengong` | `mv_zixiashengong_guangri` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_zixiashengong_guangri}` | `mfr_zixiashengong_guangri` | `MeridianRouteDef{moveRef:mv_zixiashengong_guangri; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_renmai_qihai/75/100 → ap_renmai_guanyuan/75/110 → ap_dumai_zhiyang/75/120 → ap_dumai_baihui/75/130 → ap_shouyangming_quchi/75/110 → ap_shouyangming_shousanli/75/120 → ap_shoujueyin_neiguan/75/140 → ap_shoujueyin_laogong/75/150` |
| 9 地上 | `sk_zixiashengong` | `mv_zixiashengong_changkong` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_zixiashengong_changkong}` | `mfr_zixiashengong_changkong` | `MeridianRouteDef{moveRef:mv_zixiashengong_changkong; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_renmai_shenque/90/100→ap_dumai_mingmen/90/120→ap_dumai_shendao/90/140→ap_yangwei_jianjing/90/160→ap_shoushaoyin_shenmen/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_wangu/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_taiyuesanqingfeng` | `mv_taiyuesanqingfeng_sanfengheyi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_taiyuesanqingfeng_sanfengheyi}` | `mfr_taiyuesanqingfeng_sanfengheyi` | `MeridianRouteDef{moveRef:mv_taiyuesanqingfeng_sanfengheyi; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_chongmai_shangqu/90/120→ap_daimai_wushu/90/140→ap_yangqiao_jianyu/90/160→ap_shoushaoyang_tianjing/90/180→ap_shoutaiyang_houxi/90/200→ap_shoutaiyang_wangu/90/220→ap_shoushaoyang_yangchi/90/240` |
| 8 地中 | `sk_taiyuesanqingfeng` | `mv_taiyuesanqingfeng_sanfeng` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_taiyuesanqingfeng_sanfeng}` | `mfr_taiyuesanqingfeng_sanfeng` | `MeridianRouteDef{moveRef:mv_taiyuesanqingfeng_sanfeng; ultimate:true; purpose:attack}`；`ap_dumai_changqiang/90/100→ap_dumai_mingmen/90/120→ap_dumai_shendao/90/140→ap_yangwei_jianjing/90/160→ap_shouyangming_quchi/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 9 地上 | `sk_hanbingzhenqi` | `mv_hanbingzhenqi_fengmai` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hanbingzhenqi_fengmai}` | `mfr_hanbingzhenqi_fengmai` | `MeridianRouteDef{moveRef:mv_hanbingzhenqi_fengmai; ultimate:true; purpose:attack}`；`ap_yinqiao_zhaohai/75/100 → ap_yinwei_zhubin/75/110 → ap_zushaoyin_taixi/75/120 → ap_zujueyin_ququan/75/130 → ap_renmai_qihai/75/110 → ap_renmai_guanyuan/75/120 → ap_shoujueyin_tianchi/75/140 → ap_shoujueyin_quze/75/150` |
| 9 地上 | `sk_hanbingzhenqi` | `mv_hanbingzhenqi_fengyue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hanbingzhenqi_fengyue}` | `mfr_hanbingzhenqi_fengyue` | `MeridianRouteDef{moveRef:mv_hanbingzhenqi_fengyue; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_renmai_danzhong/90/120→ap_yinqiao_zhaohai/90/140→ap_yinwei_zhubin/90/160→ap_zujueyin_ququan/90/180→ap_shoutaiyin_chize/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 8 地中 | `sk_daizongruhe` | `mv_daizongruhe_yinyang` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_daizongruhe_yinyang}` | `mfr_daizongruhe_yinyang` | `MeridianRouteDef{moveRef:mv_daizongruhe_yinyang; ultimate:true; purpose:attack}`；`ap_chongmai_qichong/90/100→ap_chongmai_shiguan/90/120→ap_daimai_zhangmen/90/140→ap_dumai_shendao/90/160→ap_yangwei_jianjing/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_baibianqianhuan` | `mv_baibianqianhuan_shisanshi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_baibianqianhuan_shisanshi}` | `mfr_baibianqianhuan_shisanshi` | `MeridianRouteDef{moveRef:mv_baibianqianhuan_shisanshi; ultimate:true; purpose:attack; requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/120→ap_zushaoyin_taixi/90/140→ap_zujueyin_ligou/90/160→ap_shoutaiyin_chize/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_baibianqianhuan` | `mv_baibianqianhuan_baibian` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_baibianqianhuan_baibian}` | `mfr_baibianqianhuan_baibian` | `MeridianRouteDef{moveRef:mv_baibianqianhuan_baibian; ultimate:true; purpose:attack; requiredNature:[yin,harmony]}`；`ap_yinqiao_jiaoxin/90/100→ap_yinwei_daheng/90/120→ap_zutaiyin_diji/90/140→ap_shoushaoyin_lingdao/90/160→ap_shoujueyin_jianshi/90/180→ap_shoushaoyang_tianjing/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoutaiyang_wangu/90/240` |
| 8 地中 | `sk_hengshanyunwubu` | `mv_hengshanyunwubu_wusuo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_hengshanyunwubu_wusuo}` | `mfr_hengshanyunwubu_wusuo` | `MeridianRouteDef{moveRef:mv_hengshanyunwubu_wusuo; ultimate:true; purpose:defense}`；`ap_zushaoyin_yongquan/90/100→ap_yinqiao_zhaohai/90/120→ap_yangqiao_fuyang/90/140→ap_yangqiao_pucan/90/160→ap_daimai_zulinqi/90/180→ap_daimai_weidao/90/200→ap_zushaoyang_yanglingquan/90/220→ap_zushaoyang_zuqiaoyin/90/240` |
| 7 地下 | `sk_wanhuajianfa` | `mv_wanhuajianfa_husheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_wanhuajianfa_husheng}` | `mfr_wanhuajianfa_husheng` | `MeridianRouteDef{moveRef:mv_wanhuajianfa_husheng; ultimate:true; purpose:attack}`；`ap_renmai_qihai/90/100→ap_yinqiao_zhaohai/90/120→ap_yinwei_zhubin/90/140→ap_daimai_zhangmen/90/160→ap_shoushaoyin_shenmen/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_wangu/90/220→ap_shouyangming_hegu/90/240` |
| 11 天中 | `sk_xixing` | `mv_xixing_sangong` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xixing_sangong}` | `mfr_xixing_sangong` | `MeridianRouteDef{moveRef:mv_xixing_sangong; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_chongmai_qichong/75/120 → ap_chongmai_huangshu/75/130 → ap_daimai_wushu/75/140 → ap_daimai_daimai/75/150 → ap_renmai_qihai/75/120 → ap_renmai_guanyuan/75/120 → ap_renmai_zhongwan/75/140 → ap_shoujueyin_tianchi/75/150 → ap_shoujueyin_quze/75/160 → ap_shoujueyin_neiguan/75/170` |
| 11 天中 | `sk_xixing` | `mv_xixing_wanliu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_xixing_wanliu}` | `mfr_xixing_wanliu` | `MeridianRouteDef{moveRef:mv_xixing_wanliu; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_shoujueyin_neiguan/80/100→ap_chongmai_youmen/80/120→ap_shoushaoyin_yinxi/80/140→ap_shoutaiyin_yuji/80/160→ap_yinqiao_sanyinjiao/80/180→ap_renmai_danzhong/80/200→ap_zujueyin_xingjian/80/220→ap_zushaoyin_rangu/80/240→ap_zutaiyin_dadu/80/260→ap_zutaiyin_yinlingquan/80/280` |
| 11 天中 | `sk_kuihua` | `mv_kuihua_cimu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_kuihua_cimu}` | `mfr_kuihua_cimu` | `MeridianRouteDef{moveRef:mv_kuihua_cimu; ultimate:true; purpose:attack; requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/70/110→ap_dumai_zhiyang/70/120→ap_dumai_shenzhu/70/130→ap_yangqiao_jianyu/70/140→ap_yangwei_tianliao/70/130→ap_shoushaoyang_waiguan/70/140→ap_shoutaiyang_wangu/70/150→ap_shoujueyin_daling/70/160→ap_shoujueyin_neiguan/70/160→ap_shoujueyin_zhongchong/70/170` |
| 11 天中 | `sk_kuihua` | `mv_kuihua_wanzhen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_kuihua_wanzhen}` | `mfr_kuihua_wanzhen` | `MeridianRouteDef{moveRef:mv_kuihua_wanzhen; ultimate:true; purpose:attack; requiredNature:[yang,harmony]}`；`ap_dumai_mingmen/80/100→ap_dumai_jizhong/80/120→ap_yangqiao_shenmai/80/140→ap_yangwei_jianjing/80/160→ap_zushaoyang_guangming/80/180→ap_shoushaoyang_tianjing/80/200→ap_shouyangming_quchi/80/220→ap_shouyangming_hegu/80/240→ap_shoujueyin_neiguan/80/260→ap_shoutaiyin_shaoshang/80/280` |
| 7 地下 | `sk_heimuyajianfa` | `mv_heimuyajianfa_lingkong` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_heimuyajianfa_lingkong}` | `mfr_heimuyajianfa_lingkong` | `MeridianRouteDef{moveRef:mv_heimuyajianfa_lingkong; ultimate:true; purpose:attack; requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/120→ap_zushaoyin_taixi/90/140→ap_zujueyin_taichong/90/160→ap_shoutaiyin_kongzui/90/180→ap_shoushaoyang_waiguan/90/200→ap_shoutaiyang_yanggu/90/220→ap_shouyangming_hegu/90/240` |
| 8 地中 | `sk_qixianwuxingjian` | `mv_qixianwuxingjian_qiming` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:0,max:0}; aoe:{tpl:aoe_field,side:enemy}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_qiming}` | `mfr_qixianwuxingjian_qiming` | `MeridianRouteDef{moveRef:mv_qixianwuxingjian_qiming; ultimate:true; purpose:attack; requiredNature:[yin,harmony]}`；`ap_yinqiao_zhaohai/90/100→ap_yinwei_zhubin/90/120→ap_zujueyin_ququan/90/140→ap_zutaiyin_xuehai/90/160→ap_renmai_danzhong/90/180→ap_shoutaiyin_chize/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_zhongchong/90/240` |
| 8 地中 | `sk_qixianwuxingjian` | `mv_qixianwuxingjian_wuxing` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:5}; aoe:{tpl:aoe_single}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_wuxing}` | `mfr_qixianwuxingjian_wuxing` | `MeridianRouteDef{moveRef:mv_qixianwuxingjian_wuxing; ultimate:true; purpose:attack}`；`ap_chongmai_yindu/90/100→ap_daimai_zhangmen/90/120→ap_shoutaiyin_yunmen/90/140→ap_shoutaiyin_chize/90/160→ap_shoujueyin_jianshi/90/180→ap_shoujueyin_daling/90/200→ap_shoushaoyang_waiguan/90/220→ap_shoushaoyang_yangchi/90/240` |
| 10 天下 | `sk_bixie` | `mv_bixie_feiyanchuanliu` `MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_bixie_feiyanchuanliu}` | `mfr_bixie_feiyanchuanliu` | `MeridianRouteDef{moveRef:mv_bixie_feiyanchuanliu; ultimate:true; purpose:attack}`；`ap_yinqiao_zhaohai/70/110 → ap_yinqiao_jiaoxin/70/120 → ap_zushaoyin_taixi/70/130 → ap_yinwei_zhubin/70/140 → ap_shoutaiyin_kongzui/70/130 → ap_shoujueyin_jianshi/70/140 → ap_yangqiao_shenmai/70/150 → ap_zushaoyang_fengshi/70/160 → ap_shoutaiyang_wangu/70/160 → ap_shoushaoyang_yangchi/70/170` |
| 10 天下 | `sk_bixie` | `mv_bixie_qunxie` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; meridianRouteRef:mfr_bixie_qunxie}` | `mfr_bixie_qunxie` | `MeridianRouteDef{moveRef:mv_bixie_qunxie; ultimate:true; purpose:attack}`；`ap_zutaiyin_dabao/80/100→ap_renmai_chengjiang/80/120→ap_renmai_yinjiao/80/140→ap_shoujueyin_tianquan/80/160→ap_shoushaoyin_shenmen/80/180→ap_shoutaiyin_yuji/80/200→ap_yinwei_daheng/80/220→ap_shoujueyin_neiguan/80/240→ap_shoushaoyang_waiguan/80/260→ap_shoutaiyang_wangu/80/280` |
| 7 地下 | `sk_fantianzhang` | `mv_fantianzhang_fudi` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_fantianzhang_fudi}` | `mfr_fantianzhang_fudi` | `MeridianRouteDef{moveRef:mv_fantianzhang_fudi; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/90/100→ap_dumai_zhiyang/90/120→ap_yangwei_jianjing/90/140→ap_shouyangming_quchi/90/160→ap_shouyangming_shousanli/90/180→ap_shoujueyin_quze/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 7 地下 | `sk_qingchengcuixinzhang` | `mv_qingchengcuixinzhang_duanmai` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; meridianRouteRef:mfr_qingchengcuixinzhang_duanmai}` | `mfr_qingchengcuixinzhang_duanmai` | `MeridianRouteDef{moveRef:mv_qingchengcuixinzhang_duanmai; ultimate:true; purpose:attack}`；`ap_zujueyin_dadun/90/100→ap_zujueyin_xingjian/90/120→ap_zujueyin_taichong/90/140→ap_zujueyin_zhongfeng/90/160→ap_zujueyin_ligou/90/180→ap_shoujueyin_quze/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 7 地下 | `sk_wuxianbaidugong` | `mv_wuxianbaidugong_wangu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:2}; aoe:{tpl:aoe_disk,r:2}; projection:true; projectionSpreadSteps:[{tpl:aoe_disk,r:2},{tpl:aoe_disk,r:3},{tpl:aoe_disk,r:4}]; DamageKind:'projected'; meridianRouteRef:mfr_wuxianbaidugong_wangu}` | `mfr_wuxianbaidugong_wangu` | `MeridianRouteDef{moveRef:mv_wuxianbaidugong_wangu; ultimate:true; purpose:attack; requiredNature:[yin,yang,harmony]}`；`ap_zujueyin_xingjian/90/100→ap_zujueyin_taichong/90/120→ap_zushaoyin_rangu/90/140→ap_zutaiyin_yinlingquan/90/160→ap_renmai_qihai/90/180→ap_shoujueyin_quze/90/200→ap_shoujueyin_neiguan/90/220→ap_shoujueyin_laogong/90/240` |
| 6 玄上 | `sk_huashanjianfa` | `mv_huashanjianfa_jinyan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanjianfa_jinyan}` | `mfr_huashanjianfa_jinyan` | `MeridianRouteDef{moveRef:mv_huashanjianfa_jinyan; ultimate:true; purpose:attack}`；`ap_zushaoyang_tongziliao/100/100→ap_zushaoyin_fuliu/100/120→ap_zushaoyin_yongquan/100/140→ap_zutaiyang_weizhong/100/160→ap_zutaiyin_shangqiu/100/180→ap_shoushaoyang_yangchi/100/200` |
| 6 玄上 | `sk_yangwujian` | `mv_yangwujian_haoran` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_yangwujian_haoran}` | `mfr_yangwujian_haoran` | `MeridianRouteDef{moveRef:mv_yangwujian_haoran; ultimate:true; purpose:attack}`；`ap_dumai_mingmen/100/100→ap_dumai_jizhong/100/120→ap_dumai_shenzhu/100/140→ap_yangwei_tianliao/100/160→ap_shoushaoyang_waiguan/100/180→ap_shoutaiyang_yanggu/100/200` |
| 6 玄上 | `sk_huashanxinfa` | `mv_huashanxinfa_qiyujian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_huashanxinfa_qiyujian}` | `mfr_huashanxinfa_qiyujian` | `MeridianRouteDef{moveRef:mv_huashanxinfa_qiyujian; ultimate:true; purpose:defense; requiredNature:[yin,harmony]}`；`ap_renmai_qihai/100/100→ap_renmai_danzhong/100/120→ap_dumai_shendao/100/140→ap_shoushaoyin_shenmen/100/160→ap_shoushaoyang_waiguan/100/180→ap_shoutaiyang_wangu/100/200` |
| 6 玄上 | `sk_kuangfengkuaijian` | `mv_kuangfengkuaijian_yijian` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_kuangfengkuaijian_yijian}` | `mfr_kuangfengkuaijian_yijian` | `MeridianRouteDef{moveRef:mv_kuangfengkuaijian_yijian; ultimate:true; purpose:attack}`；`ap_yangwei_yangjiao/100/100→ap_yinwei_daheng/100/120→ap_zushaoyin_yongquan/100/140→ap_zujueyin_yinlian/100/160→ap_zushaoyang_waiqiu/100/180→ap_shoutaiyang_yanggu/100/200` |
| 6 玄上 | `sk_songshanjianfa` | `mv_songshanjianfa_kaimen` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_songshanjianfa_kaimen}` | `mfr_songshanjianfa_kaimen` | `MeridianRouteDef{moveRef:mv_songshanjianfa_kaimen; ultimate:true; purpose:attack}`；`ap_dumai_yaoyangguan/100/100→ap_yangwei_tianliao/100/120→ap_shouyangming_sanjian/100/140→ap_shoutaiyang_houxi/100/160→ap_shoushaoyang_zhigou/100/180→ap_shoushaoyang_yangchi/100/200` |
| 6 玄上 | `sk_songyangxinfa` | `mv_songyangxinfa_junyue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_songyangxinfa_junyue}` | `mfr_songyangxinfa_junyue` | `MeridianRouteDef{moveRef:mv_songyangxinfa_junyue; ultimate:true; purpose:defense}`；`ap_dumai_shenzhu/100/100→ap_shouyangming_erjian/100/120→ap_shouyangming_yangxi/100/140→ap_yangqiao_juliao_wei/100/160→ap_yangwei_jinmen/100/180→ap_yinqiao_lieque/100/200` |
| 6 玄上 | `sk_taishanjianfa` | `mv_taishanjianfa_dongyue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_taishanjianfa_dongyue}` | `mfr_taishanjianfa_dongyue` | `MeridianRouteDef{moveRef:mv_taishanjianfa_dongyue; ultimate:true; purpose:attack}`；`ap_zujueyin_xiguan/100/100→ap_zushaoyang_riyue/100/120→ap_zushaoyin_dazhong/100/140→ap_zushaoyin_yingu/100/160→ap_zutaiyang_tianzhu/100/180→ap_shoutaiyang_wangu/100/200` |
| 6 玄上 | `sk_xiaoaojianghuqu` | `mv_xiaoaojianghuqu_tongsheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; range:{min:0,max:0}; aoe:{tpl:aoe_field,side:enemy}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy}]; DamageKind:'projected'; meridianRouteRef:mfr_xiaoaojianghuqu_tongsheng}` | `mfr_xiaoaojianghuqu_tongsheng` | `MeridianRouteDef{moveRef:mv_xiaoaojianghuqu_tongsheng; ultimate:true; purpose:attack}`；`ap_chongmai_yindu/100/100→ap_daimai_zhangmen/100/120→ap_renmai_danzhong/100/140→ap_shoujueyin_jianshi/100/160→ap_shoujueyin_neiguan/100/180→ap_shoujueyin_zhongchong/100/200` |
| 6 玄上 | `sk_huifengluoyan` | `mv_huifengluoyan_luoyan` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_huifengluoyan_luoyan}` | `mfr_huifengluoyan_luoyan` | `MeridianRouteDef{moveRef:mv_huifengluoyan_luoyan; ultimate:true; purpose:attack}`；`ap_yinwei_qimen/100/100→ap_zujueyin_taichong/100/120→ap_zushaoyang_guangming/100/140→ap_zushaoyang_zuqiaoyin/100/160→ap_zushaoyin_taixi/100/180→ap_shoushaoyang_waiguan/100/200` |
| 6 玄上 | `sk_hengshanbeijianfa` | `mv_hengshanbeijianfa_shoumenhu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_hengshanbeijianfa_shoumenhu}` | `mfr_hengshanbeijianfa_shoumenhu` | `MeridianRouteDef{moveRef:mv_hengshanbeijianfa_shoumenhu; ultimate:true; purpose:attack}`；`ap_renmai_qihai/100/100→ap_yinqiao_zhaohai/100/120→ap_yinqiao_jiaoxin/100/140→ap_shoujueyin_neiguan/100/160→ap_shoutaiyang_wangu/100/180→ap_shouyangming_hegu/100/200` |
| 6 玄上 | `sk_riyuejianfa` | `mv_riyuejianfa_yueluo` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_riyuejianfa_yueluo}` | `mfr_riyuejianfa_yueluo` | `MeridianRouteDef{moveRef:mv_riyuejianfa_yueluo; ultimate:true; purpose:attack}`；`ap_daimai_zhangmen/100/100→ap_daimai_weidao/100/120→ap_yinwei_qimen/100/140→ap_shoutaiyin_chize/100/160→ap_shoujueyin_neiguan/100/180→ap_shoushaoyang_waiguan/100/200` |
| 6 玄上 | `sk_riyuexinfa` | `mv_riyuexinfa_riyue` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_riyuexinfa_riyue}` | `mfr_riyuexinfa_riyue` | `MeridianRouteDef{moveRef:mv_riyuexinfa_riyue; ultimate:true; purpose:defense; requiredNature:[yin,yang,harmony]}`；`ap_chongmai_futonggu/100/100→ap_renmai_shimen/100/120→ap_yangwei_jianjing/100/140→ap_yinqiao_jingming/100/160→ap_yinwei_fushe/100/180→ap_zujueyin_ligou/100/200` |
| 6 玄上 | `sk_songfengjianfa` | `mv_songfengjianfa_fengguoqingcheng` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_songfengjianfa_fengguoqingcheng}` | `mfr_songfengjianfa_fengguoqingcheng` | `MeridianRouteDef{moveRef:mv_songfengjianfa_fengguoqingcheng; ultimate:true; purpose:attack}`；`ap_yangqiao_jugu/100/100→ap_yangwei_fengfu/100/120→ap_yinqiao_jiaoxin/100/140→ap_yinwei_fuai/100/160→ap_zujueyin_dadun/100/180→ap_shouyangming_hegu/100/200` |
| 6 玄上 | `sk_wuxianduzhang` | `mv_wuxianduzhang_huifengduwu` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wuxianduzhang_huifengduwu}` | `mfr_wuxianduzhang_huifengduwu` | `MeridianRouteDef{moveRef:mv_wuxianduzhang_huifengduwu; ultimate:true; purpose:attack}`；`ap_zujueyin_xingjian/100/100→ap_zujueyin_taichong/100/120→ap_yinwei_qimen/100/140→ap_shoutaiyin_chize/100/160→ap_shoujueyin_neiguan/100/180→ap_shoujueyin_laogong/100/200` |
| 6 玄上 | `sk_wanliduxing` | `mv_wanliduxing_yuandun` `MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; meridianRouteRef:mfr_wanliduxing_yuandun}` | `mfr_wanliduxing_yuandun` | `MeridianRouteDef{moveRef:mv_wanliduxing_yuandun; ultimate:true; purpose:movement}`；`ap_zutaiyin_dabao/100/100→ap_zutaiyin_yinbai/100/120→ap_zuyangming_renying/100/140→ap_chongmai_henggu/100/160→ap_chongmai_yindu/100/180→ap_daimai_zhangmen/100/200` |
<!-- skill-catalog-audit:end -->


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
- 绝招数量按统一裁定表执行：天上3、天中本册各2、天下2，地上2、地中逐门取1或2、地下1，玄上1，玄中／玄下／黄阶0。本文只升格既有招式，不新增招式；升格项显式写 `ultimate:true`、气势100、1200 CT收招，玄上逐条路线见 §15.5。

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

结果取最近的 0.05 档，允许误差 ±0.05；纯支援、架势、移动招式写 `power 0`，明确“不进入伤害倍率公式”。范围 `AF`、效果价值与结算顺序只引用 `design/05` §4.2–§4.11。

### 0.3 内功贡献与经脉引用

```text
IP = mpMaxPct + hpMaxPct + 2 × 属性点总和 + 5 × mpRegen
```

本文使用的完整预算锚点：黄下 19、黄中 24、黄上 30、玄下 41.5、玄中 48.5、玄上 57、地下 72、地中 83、地上 94.5、天下 118、天中 135.5、天上 156。`stats` 不计 IP，但仍受相应大阶 `layerStats` 上限。

为使全部 21 门内功都能从文本复算，下表既复核完整卡，也为紧凑卡 / 黄阶一行卡补齐 `inner.contribution`。`attrs` 花括号内各项之和就是公式中的“属性点总和”；同品阶采用标准分量，仅属性去向随门派风格调整。

| 内功 | 品阶 / nature | `inner.contribution` | IP 复算 |
|---|---|---|---:|
| `sk_zixiashengong` | 9 / `harmony` | `mpMaxPct:34; hpMaxPct:20; attrs:{con:6,wil:5,wis:3}; mpRegen:2.5` | `34+20+2×14+5×2.5=94.5` |
| `sk_huashanxinfa` | 6 / `yin` | `20; 12; {con:3,wil:3,wis:2}; 1.8` | `20+12+2×8+5×1.8=57` |
| `sk_huashantuna` | 3 / `yin` | `10; 6; {con:2,wil:1,wis:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_hanbingzhenqi` | 9 / `yin` | `34; 20; {con:6,wil:6,wis:2}; 2.5` | `34+20+2×14+5×2.5=94.5` |
| `sk_songyangxinfa` | 6 / `yang` | `20; 12; {con:4,str:2,wil:2}; 1.8` | `20+12+2×8+5×1.8=57` |
| `sk_songyangtuna` | 3 / `yang` | `10; 6; {con:2,str:1,wil:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_taishanxinfa` | 5 / `yang` | `17; 10; {con:3,wil:2,wis:2}; 1.5` | `17+10+2×7+5×1.5=48.5` |
| `sk_taishantuna` | 3 / `yang` | `10; 6; {con:2,wil:1,wis:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_hengshanxinfa` | 5 / `yin` | `17; 10; {agi:2,wis:3,wil:2}; 1.5` | `17+10+2×7+5×1.5=48.5` |
| `sk_hengshantuna` | 3 / `yin` | `10; 6; {agi:1,wis:2,wil:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_hengshanbeixinfa` | 5 / `yin` | `17; 10; {con:2,wis:2,wil:3}; 1.5` | `17+10+2×7+5×1.5=48.5` |
| `sk_hengshanbeituna` | 3 / `yin` | `10; 6; {con:2,wis:1,wil:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_xixing` | 11 / `harmony` | `48; 29; {con:8,wil:8,wis:5}; 3.3` | `48+29+2×21+5×3.3=135.5` |
| `sk_kuihua` | 11 / `yang` | `48; 29; {agi:10,wis:6,wil:5}; 3.3` | `48+29+2×21+5×3.3=135.5` |
| `sk_riyuexinfa` | 6 / `harmony` | `20; 12; {con:2,wil:4,wis:2}; 1.8` | `20+12+2×8+5×1.8=57` |
| `sk_heimutuna` | 3 / `harmony` | `10; 6; {con:1,wil:2,wis:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_biaojuxinfa` | 3 / `yang` | `10; 6; {con:2,str:1,wil:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_qingchengxinfa` | 5 / `yin` | `17; 10; {agi:2,wil:3,wis:2}; 1.5` | `17+10+2×7+5×1.5=48.5` |
| `sk_qingchengtuna` | 3 / `yin` | `10; 6; {agi:1,wil:2,wis:1}; 1.2` | `10+6+2×4+5×1.2=30` |
| `sk_wuxianbaidugong` | 7 / `harmony` | `26; 16; {con:4,wis:3,wil:3}; 2.0` | `26+16+2×10+5×2.0=72` |
| `sk_wuxiantuna` | 3 / `yin` | `10; 6; {con:1,wis:2,wil:1}; 1.2` | `10+6+2×4+5×1.2=30` |

本文按 AR-03 引用 `design/15-meridians-and-acupoints.md` 的正式经脉 ID；`inner.meridians` 表示内功主修经脉，并按 `design/05` §5.3 判定内功性质，本图鉴不重定义穴位与加成：`mer_renmai`（任脉）、`mer_dumai`（督脉）、`mer_chongmai`（冲脉）、`mer_daimai`（带脉）、`mer_shoutaiyin`（手太阴）、`mer_shoushaoyin`（手少阴）、`mer_zuyangming`（足阳明）、`mer_zushaoyang`（足少阳）、`mer_zutaiyin`（足太阴）、`mer_zujueyin`（足厥阴）。

### 0.4 门派职级与可学武学（五级建议）

按 `design/17-sects-compendium.md`，展示层 `L1–L5` 直接对应数据层 `sect.rank:1–5`，且下列九个组织在笑傲（`XA`）均为 `O`。称谓采用其模板：华山、嵩山、南衡山为 T03；泰山、青城为 T03/T02；北恒山为 T01/T03；日月、五仙为 T06；福威为 T05B。模板中的正式称谓见 `design/17` §1（例如 T03 为外门 / 内门 / 亲传 / 长老级 / 掌门级，T06 为教众 / 旗弟子或香主 / 堂主 / 护法长老 / 教主）。本表只列各级目录切片；月钱、资源与晋升条件仍归 `design/16`、`design/12`。分支秘传还须满足条目 `reqs`，达到职级不等于自动获得。

| 门派 | 17 模板 / XA | L1 可学 | L2 可学 | L3 可学 | L4 可学 | L5 可见目录 |
|---|---|---|---|---|---|---|
| 华山 `sect_huashan` | T03 / O | 华山入门剑、基础拳、吐纳、行步 | 华山剑法、希夷剑法、玉女剑十九式 | 养吾剑、狂风快剑（剑宗支）、华山心法 | 太岳三青峰、紫霞神功（气宗支） | 门派全谱；独孤九剑仍只由风清扬奇遇授受 |
| 嵩山 `sect_songshan` | T03 / O | 嵩山入门剑、嵩阳入门掌、吐纳、步 | 嵩山剑法、嵩山桩功 | 大阴阳手、嵩阳心法 | 寒冰真气 | 门派全谱 |
| 泰山 `sect_taishan` | T03/T02 / O | 泰山入门剑/拳、吐纳、石坂山步 | 泰山剑法、泰山拳 | 泰山十八盘、泰山心法 | 岱宗如何 | 门派全谱 |
| 衡山 `sect_hengshan_nan` | T03 / O | 衡山入门剑/掌、吐纳、云步 | 衡山心法 | 回风落雁剑、衡山五神剑 | 百变千幻衡山云雾十三式、衡山云雾步 | 门派全谱 |
| 恒山 `sect_hengshan_bei` | T01/T03 / O | 恒山入门剑/拳、吐纳、步 | 恒山心法、恒山身法 | 恒山剑法、天长掌法 | 万花剑法 | 门派全谱；尼众 / 俗家只切换 17 的称谓模板 |
| 日月 `sect_riyue` | T06 / O | 黑木崖入门剑、基础拳、吐纳、神教步 | 日月剑法、日月心法；梅庄支按琴棋书画入门 | 石鼓打穴笔法、泼墨披麻剑法、玄天指、《笑傲江湖》曲谱 | 黑木崖剑法、七弦无形剑、吸星大法 | 教主秘库可见葵花宝典；取得仍由剧情与誓约限制 |
| 福威 `sect_fuwei` | T05B / O | 林家入门剑/拳、镖局心法、趟子步 | 林家剑法、林家手 | 翻天掌 | — | 辟邪剑法须取得袈裟真谱；职位不替代断尘之誓 |
| 青城 `sect_qingcheng` | T03/T02 / O | 青城入门剑/拳、吐纳、山径步 | 青城心法 | 松风剑法 | 青城摧心掌 | 门派全谱 |
| 五仙 `sect_wuxian` | T06 / O | 五仙入门掌、苗寨毒法、五仙吐纳 | 五仙毒经 | 五仙毒掌 | 五仙百毒功 | 门派全谱 |

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
| 恒山派（北岳） | `sect_hengshan_bei` | 0/1/4/4 = 9 | 绵密守剑、慈悲救护、群战援护 | 可加入；按 17 的 T01/T03 映射尼众 / 俗家称谓 |
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
| 泰山 | `sk_taishanrumenjian` 4重 → `sk_taishanjianfa` 6重 → `sk_daizongruhe` | `legacy-set:taishan_daizong` |
| 衡山（南） | `sk_hengshanrumenjian` 4重 → `sk_huifengluoyan` 6重 → `sk_baibianqianhuan` | `legacy-set:hengshan_yunwu` |
| 恒山（北） | `sk_hengshanbeirumenjian` 4重 → `sk_hengshanbeijianfa` 6重 → `sk_wanhuajianfa` | `legacy-set:hengshan_cibei` |
| 日月 / 梅庄 | `sk_heimuyarumenjian` 4重 → `sk_riyuejianfa` 6重 → `sk_heimuyajianfa`（另需 `sk_riyuexinfa` 6重）；梅庄以 `sk_heimutuna` 4重＋`music 50` → `sk_qixianwuxingjian` | `set_riyue_heimu`、`legacy-set:meizhuang_siyou` |
| 福威林家 | `sk_linjiarumenquan` 4重 → `sk_linjiashou` 6重 → `sk_fantianzhang`；辟邪剑法为剑路孤本旁支，不替代此链 | `set_linjia_bixie` |
| 青城 | `sk_qingchengrumenjian` 4重 → `sk_songfengjianfa` 6重 → `sk_qingchengcuixinzhang` | `legacy-set:qingcheng_songfeng` |
| 五仙 | `sk_wuxianrumenzhang` 4重 → `sk_wuxianduzhang` 6重 → `sk_wuxianbaidugong` | `legacy-set:wuxian_baidu` |

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
| 层数要点 | 1 总诀/破剑/料敌 ｜ 2 破刀 ｜ 3 破枪/有进无退 ｜ 4 破鞭 ｜ 5 破索 ｜ 6 破掌 ｜ 7 第一绝招无招胜有招 ｜ 8 破箭 ｜ 9 第二绝招破箭/以物代剑 ｜ 10 第三绝招破气/无招大成；七门早层破式仍为普通招 |
| setTags | `[set_dugu_jianzhong]`；前者补齐 `skills-daojia` 已列的跨组反向成员 |
| conflicts / special | `[]` / `{fusible:true, autoGroup:dugu_po}` |
| learnSources | `master`：风清扬，思过崖事件链，`maxLayer:10`；非华山身份可由令狐冲高羁绊引荐**（原创扩展）** |
| observable | `false` |
| 图鉴文本 | 以总诀统摄八种破法，不守成招，贵在料敌机先、有进无退。本作以破兵系列 Buff 与自动选式实现。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 总诀式 `mv_dugu9_zongjue` | 1 | 单体·1·近身 | 0.90 | 7%/0/900 | 自身 `bf_duguyi` 1层 | 可 | `1−0.05−0.07=0.88→0.90` |
| 破剑式 `mv_dugu9_pojian` | 1 | 单体·1·近身 | 1.10 | 8%/1/1000 | 对剑；`bf_pozhao` 60% | 否 | 05 §13.2 固定 1.10；指定兵器类按罕见条件 +0.30：`(1+0.12+0.30)×0.85−0.10×0.60=1.147`，配置差 −0.047 |
| 破刀式 `mv_dugu9_podao` | 2 | 单体·1·近身 | 1.10 | 8%/1/1000 | 对刀；`bf_pozhao` 60% | 否 | 同破剑式（05 固定值） |
| 破枪式 `mv_dugu9_poqiang` | 3 | 单体·1·近身 | 1.10 | 8%/1/1000 | 对枪棍；无视拒敌；`bf_pozhao` 60% | 否 | 同破剑式（05 固定值）；无视拒敌是条件式结构钩子 |
| 破鞭式 `mv_dugu9_pobian` | 4 | 单体·1·近身 | 1.10 | 8%/1/1000 | 对奇门；`bf_pozhao` 60% | 否 | 同破剑式（05 固定值） |
| 破索式 `mv_dugu9_posuo` | 5 | 单体·1–2·近身 | 1.05 | 8%/1/1000 | 对鞭索；`bf_jiaoxie` 30% | 否 | 05 §13.2 固定 1.05；指定兵器类按罕见条件 +0.30：`(1+0.12+0.30)×0.85−0.20×0.30=1.147`，配置差 −0.097；该式另按射程 2 的情境折价 **【建议值】0.05** 后中心 1.097，配置差 −0.047 |
| 破掌式 `mv_dugu9_pozhang` | 6 | 单体·1·近身 | 1.10 | 8%/1/1000 | 对空手；`bf_pozhao` 60% | 否 | 同破剑式（05 固定值） |
| **破箭式** `mv_dugu9_poanqi`（绝招） | 9 | 单体·1·近身·绝招 | 2.55 | 10%/气势100/1200 | `ultimate:true`；对暗器；拨开投射并可反射 | 否 | 第二绝招；`3×1×1×0.85=2.55`；拨开/反射按 05 触发钩子独立结算；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| **破气式** `mv_dugu9_poqi`（绝招；剑气表现**（原创扩展）**） | 10 | `aoe_line n1`·1·近身·绝招 | 2.55 | 10%/气势100/1200 | `ultimate:true`；对地阶以上主运或护体；破内防 | 否 | 第三绝招；`3×1×1×0.85−0.02=2.53→2.55`；`MoveDef{unlock:10; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200; range:{min:1,max:1}; aoe:{tpl:aoe_line,n:1}; projection:true; projectionSpreadSteps:[{tpl:aoe_line,n:1},{tpl:aoe_line,n:2},{tpl:aoe_line,n:3}]; DamageKind:'projected'; meridianRouteRef:mfr_dugu9_poqi}` |
| **无招胜有招** `mv_dugu9_wuzhao` | 7 | 单体·1·近身·绝招 | 2.50 | 10%/—/1200 | 清 1 个 stance/guard；不可反击 | 否 | `3×0.85−0.07=2.48→2.50`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_dugu9_pojin` | 破尽天下 | 1 | 按层授予 `bf_pojian/podao/poqiang/pobian/posuo/pozhang/poanqi/poqi`；数值见 05 §9.4 |
| `ps_dugu9_liaodi` | 料敌机先 | 1 | 来袭类别已被破解时，15%→35% 在命中前以总诀式反击，每回合 1 次 |
| `ps_dugu9_youjin` | 有进无退 | 3 | 本武学不提供招架；反击后下一招收招 −50 |
| `ps_dugu9_yiwu` | 以物代剑 | 9 | 棍杖/奇门可代剑，倍率 ×0.90 |
| `ps_dugu9_wuzhao` | 无招 | 10 | 不受破 X 克制、不可被反击；绝招 ×1.20 |

> 核算追溯：已按 CN-05 / C3 把指定兵器／徒手类别视为罕见条件 +0.30。破剑 / 刀 / 枪 / 鞭 / 掌 / 箭六式中心值均为 `(1+0.12+0.30)×0.85−0.10×0.60=1.147`，配置 1.10 的差值 −0.047，落入 §4.2 的 ±0.05 容差；WU-P01 已解决。破索式因缴械单价与射程另行核算，不计入该“独孤六式”。

### 2.3 `sk_zixiashengong` 紫霞神功（9 地上 · 内功 · 华山气宗）

| 字段 | 值 |
|---|---|
| 出处 | 《笑傲江湖》·岳不群所修华山内功；秘籍、运功表现与传授规矩逐回**（待考）** |
| origin / sect / lineage | `canonExpanded` / `sect_huashan` / 华山气宗 |
| sourceChapters | `[ch05_xiaoao]`；碧血只给 8 品残承（基准 §13“残承再遇”，**（原创扩展）**） |
| nature / meridians | `harmony` / `[mer_renmai, mer_dumai]`（本作主修经脉；阴 1 / 阳 1，平票取调和） |
| wOut/wIn · moveSlots | `0/1` · 4 |
| reqs | `sect:{id:sect_huashan,rank:4}; prereq:[{skill:sk_huashanxinfa,layer:6}]; attrs:{con:50,wil:50}; aptitude:{apInner:50}; hard:[sect,prereq]` |
| inner.contribution | `mpMaxPct:34, hpMaxPct:20, attrs:{con:6,wil:5,wis:3}, mpRegen:2.5`；`34+20+2×14+5×2.5=94.5` |
| inner.stats | `resInjury:8, atkIn:7`，合计 15（地阶上限） |
| 层数要点 | 1 紫气 ｜ 3 朝阳吐纳 ｜ 5 紫霞贯日/紫霞护体 ｜ 7 第一绝招霞映长空 ｜ 8 残承上限 ｜ 9 第二绝招紫霞贯日 ｜ 10 紫霞大成；早层两记运功招保留普通用途 |
| setTags / conflicts | `[set_huashan_qijian]` / 无 |
| special / observable | `{fusible:true}` / `false` |
| learnSources | 华山气宗 L4 由岳不群传授；掌门密室秘籍；碧血华山残承 `sourceGrade:8,maxLayer:8`（原创扩展） |
| 图鉴文本 | 华山气宗镇派内功，以绵厚内劲蓄而后发。阴阳与经脉分类、战斗效果均为本作扩展。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 朝阳吐纳 `mv_zixiashengong_chaoyang`（原创扩展命名） | 3 | 自身·支援 | 0 | 6%/3/900 | `bf_huinei` 3 | — | 支援招，不进入倍率公式 |
| **紫霞贯日** `mv_zixiashengong_guangri`（绝招，原创扩展命名） | 9 | 单体·1–3·远程·绝招 | 2.55 | 9%/气势100/1200 | `ultimate:true` | 可 | 第二绝招；`3×1×0.85×1=2.55`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_zixiashengong_guangri}` |
| 紫霞护体 `mv_zixiashengong_huti`（原创扩展命名） | 5 | 自身·支援 | 0 | 7%/3/900 | `bf_hutizhenqi` 3 | — | 支援招；护体值按 06 |
| **霞映长空** `mv_zixiashengong_changkong`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 2.05 | 9%/气势100/1200 | `ultimate:true`；自身 `bf_neijin_sheng` 3 | 可 | N=6、AF=0.75；`3×0.75−0.20=2.05`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

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
| 层数要点 | 1 第一青峰 ｜ 3 第二青峰 ｜ 7 三峰相济 ｜ 8 剑气相连 ｜ 9 第三青峰（第二绝招） ｜ 10 太岳圆成 |
| setTags / conflicts | `[set_huashan_qijian]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 华山 L4；岳不群指点；思过崖石壁只能观摩至 6 重 |
| 图鉴文本 | 三剑连进，一峰高过一峰；名称取原著，分式名与连击机制为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 第一青峰 `mv_taiyuesanqingfeng_yifeng` | 1 | 单体·1·近身 | 0.90 | 7%/0/1000 | 命中后自身 `bf_lianzhao` ×1 | 可 | `1−0.10=0.90` |
| 第二青峰 `mv_taiyuesanqingfeng_erfeng` | 3 | 单体·1·近身 | 1.20 | 8%/1/1000 | 仅第一青峰命中后可用 | 可 | `1+0.12+0.05+0.15=1.32→1.30`；消耗连招收益 −0.10 →1.20 |
| **第三青峰** `mv_taiyuesanqingfeng_sanfeng`（绝招） | 9 | 单体·1·近身 | 3.10 | 9%/—/1200 | 仅第二青峰命中后可用；`bf_polu` 50%；气势 100 | 可 | 条件加成暂按加法记入 3.00 绝招基准；全图鉴加法／乘法写法待统一（`design/05` §4.2）：`3.00+0.15−0.10×0.50=3.10`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| **三峰相济** `mv_taiyuesanqingfeng_sanfengheyi`（绝招） | 7 | 单体·1·近身·3段 | 2.90 | 9%/—/1200 | 最后一段 `bf_pojia` 100% | 可 | `3−0.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_taiyuesanqingfeng_cengfeng` | 层峰 | 1 | 三式按顺序命中时，后式暴击 +5/+10 |
| `ps_taiyuesanqingfeng_qijian` | 气剑相济 | 6 | 主运华山内功时三式内劲占比 +0.10，不改总伤害 |
| `ps_taiyuesanqingfeng_dacheng` | 太岳圆成 | 10 | 第三式命中后回复 5% 内力，每回合 1 次 |

### 2.5 华山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质·外/内 | `reqs`（结构化） | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_huashanjianfa` 华山剑法 | 6玄上·兵器/剑·harmony·0.75/0.25 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanrumenjian,layer:4}]; hard:[sect,prereq]` | 白云出岫1.00；苍松迎客0.90；金雁横空 `mv_huashanjianfa_jinyan`（L7绝招，`ultimate:true`，突进2.90，8%/气势100/1200；`3−.10=2.90`） | `set_huashan_qijian` | 《笑傲江湖》华山门人所习；分式出处**（待考）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_yangwujian` 养吾剑 | 6玄上·兵器/剑·yang·0.65/0.35 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashanjianfa,layer:5}]; hard:[sect,prereq]` | 养气0；浩然一剑 `mv_yangwujian_haoran`（L7绝招，`ultimate:true`，单体3.00，8%/气势100/1200；`3×1=3.00`）；守中0.90 | `set_huashan_qijian` | 《笑傲江湖》华山剑法名目；招效**（原创扩展）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_xiyijian` 希夷剑 | 5玄中·兵器/剑·harmony·0.80/0.20 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanrumenjian,layer:4}]; hard:[sect,prereq]` | 视之不见 1.05（命中后 `bf_polu` 30%）；听之不闻 0.90（不可反击） | — | 《笑傲江湖》华山剑招名目；细节**（待考）** |
| `sk_yunvjian19` 玉女剑十九式 | 5玄中·兵器/剑·yin·0.80/0.20 | `sect:{id:sect_huashan,rank:2}; prereq:[{skill:sk_huashanjianfa,layer:4}]; hard:[sect,prereq]` | 玉女投梭 1.05；弄玉吹箫 0.90（`bf_luanxin` 30%） | — | 《笑傲江湖》华山剑法；十九式与分式逐字**（待考）**，勿与古墓玉女剑混同 |
| `sk_huashanxinfa` 华山心法 | 6玄上·内功·`yin`·0/1 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashantuna,layer:5}]; hard:[sect,prereq]` | 抱元0；气御剑 `mv_huashanxinfa_qiyujian`（L7支援绝招，`ultimate:true`，0，8%/气势100/1200，下一剑获`bf_ruiyi`；不走伤害预算） | `set_huashan_qijian` | **（原创扩展）**；`meridians:[mer_renmai]`（阴 1 / 阳 0）；IP `20+12+2×8+5×1.8=57`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_kuangfengkuaijian` 狂风快剑 | 6玄上·兵器/剑·neutral·0.90/0.10 | `sect:{id:sect_huashan,rank:3}; prereq:[{skill:sk_huashanrumenjian,layer:5}]; hard:[sect,prereq]` | 狂风骤雨0.95；一剑快似一剑 `mv_kuangfengkuaijian_yijian`（L7绝招，`ultimate:true`，单体3.00，8%/气势100/1200，得`bf_lianzhao`；`3×1=3.00`） | `set_huashan_qijian` | 《笑傲江湖》·剑宗封不平所使，招名与段数**（待考）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |

抽样核算（6/6 门，≥30%）：华山剑法·白云出岫 `1.00`；养吾剑·浩然一剑 `1+0.12=1.12→1.10`；希夷剑 `1+0.12−0.03=1.09→1.10`（表取1.05，−0.04）；玉女剑 `1+0.12−0.03=1.09→1.10`；华山心法两招为支援 `power 0`；狂风骤雨 `AF 0.85×(1+0.24)−0.10=0.95`。

### 2.6 华山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_huashanrumenjian` | 华山入门剑 | 华山 | 兵器/剑·3黄上 | 笑傲 | 标准刺 1.00、横削 0.85；剑资质教学 | 无 | **（原创扩展）** | `set_huashan_qijian` |
| `sk_huashanjichuquan` | 华山基础拳 | 华山 | 拳脚/拳·2黄中 | 笑傲 | 单体 1.00；招架后得 `bf_wenzhong` 1 | 无 | **（原创扩展）** | — |
| `sk_huashantuna` | 华山吐纳 | 华山 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_renmai]`（阴 1 / 阳 0）；IP `10+6+2×4+5×1.2=30` | 无 | **（原创扩展）** | `set_huashan_qijian` |
| `sk_huashanxingbu` | 华山行步 | 华山 | 轻功·2黄中 | 笑傲 | 移动后闪避小增；`Q_skill=38`（03 §4.5） | 无 | **（原创扩展）** | — |

黄阶整体预算：标准单体、5%耗内、0冷却、1000收招为 `1.00`；4%耗内为 `1−0.05=0.95`；六向 120° r1 横扫 N=3，带1冷却为 `0.85×1.12=0.952→0.95`。本节四门只使用这三种模板或 `power 0` 支援，全部在 ±0.05。

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
| 层数要点 | 1 凝霜 ｜ 3 寒劲伏脉 ｜ 5 寒冰掌 ｜ 6 冰封经脉 ｜ 7 第一绝招寒潮封岳 ｜ 8 寒冰护体 ｜ 9 第二绝招冰封经脉 ｜ 10 冰心大成；早层两记攻击与护体仍为普通招 |
| setTags / conflicts | `[set_songshan_hanbing]` / `{with:sk_xixing,type:counter}`，按 `design/06` `rx_hanbingxixing` 结算 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 左冷禅亲授或掌门密室；击败左冷禅只得 6 重残页**（原创扩展）** |
| 图鉴文本 | 阴寒真气伏于经脉，临敌骤发。原著用于反制吸星，本作把寒气叠层、冰冻与吸内反应数据化。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 凝霜劲 `mv_hanbingzhenqi_ningshuang`（原创扩展命名） | 1 | 单体·1–3·远程 | 1.05 | 8%/2/1000 | `bf_hanqi` 50%·1层 | 可 | `(1+0.24+0.05)×0.85−0.10×0.5=1.05`；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_hanbingzhenqi_ningshuang}` |
| 寒冰掌 `mv_hanbingzhenqi_hanbingzhang`（原创扩展命名） | 5 | 单体·1·近身 | 1.10 | 7%/2/1000 | `bf_hanqi` 100%·2层 | 可 | `1+0.24−0.05−0.10=1.09→1.10` |
| **冰封经脉** `mv_hanbingzhenqi_fengmai`（绝招，原创扩展命名） | 9 | 单体·1·近身·绝招 | 2.90 | 9%/气势100/1200 | `ultimate:true`；`bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 50%·1 | 可 | 第二绝招；`3×1×1×1−0.20×0.5=2.90`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| **寒潮封岳** `mv_hanbingzhenqi_fengyue`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 2.05 | 9%/气势100/1200 | `ultimate:true`；敌方 `bf_hanqi` 100%·2层 | 可 | N=6、AF=0.75；`3×0.75−0.20=2.05`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| 寒冰护体 `mv_hanbingzhenqi_huti`（原创扩展命名） | 8 | 自身·支援 | 0 | 7%/3/900 | `bf_mian_han` 3；近身攻击者得寒气1层 | — | 支援招，反击强度由被动预算承担 |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_hanbingzhenqi_fuhan` | 伏寒 | 1 | 本武学造成寒气时，25% 额外 +1 层，每回合一次 |
| `ps_hanbingzhenqi_fanxi` | 寒冰反吸 | 4 | 持有 cold 护体，触发 `rx_hanbingxixing` |
| `ps_hanbingzhenqi_bingxin` | 冰心 | 10 | 自身寒气/冰冻免疫按本武学品阶参与品阶对抗 |

### 3.3 嵩山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_songshanjianfa` 嵩山剑法 | 6玄上·兵器/剑·yang | `sect:{id:sect_songshan,rank:2}; prereq:[{skill:sk_songshanrumenjian,layer:4}]; hard:[sect,prereq]` | 万岳朝宗1.10；开门见山 `mv_songshanjianfa_kaimen`（L7绝招，`ultimate:true`，单体2.95，8%/气势100/1200，破甲40%；`3−.10×.40=2.96≈2.95`） | `set_songshan_hanbing` | 《笑傲江湖》·嵩山太保；分式名**（原创扩展命名）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_songyangxinfa` 嵩阳心法 | 6玄上·内功·`yang` | `sect:{id:sect_songshan,rank:3}; prereq:[{skill:sk_songyangtuna,layer:5}]; hard:[sect,prereq]` | 嵩阳吐纳0；峻岳护体 `mv_songyangxinfa_junyue`（L7支援绝招，`ultimate:true`，0，8%/气势100/1200，守势；不走伤害预算） | `set_songshan_hanbing` | **（原创扩展）**；`meridians:[mer_dumai]`；IP `20+12+2×8+5×1.8=57`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_dayinyangshou` 大阴阳手 | 5玄中·拳脚/拳·harmony | `sect:{id:sect_songshan,rank:3}; prereq:[{skill:sk_songyangrumenzhang,layer:5}]; hard:[sect,prereq]` | 阴掌 1.10（寒气30%）；阳手 1.10（击退1） | `set_songshan_hanbing` | 《笑傲江湖》·乐厚号“大阴阳手”，武学是否正式具名**（待考）** |
| `sk_songshanzhuangong` 嵩山桩功 | 4玄下·拳脚/拳·yang | `sect:{id:sect_songshan,rank:2}; prereq:[{skill:sk_songyangrumenzhang,layer:4}]; hard:[sect,prereq]` | 立岳 0（`bf_wenzhong`）；撞山 1.05（击退1） | — | **（原创扩展）** |

抽样核算（4/4）：万岳朝宗按六向 120° r1 的 N=3、AF=.85，`.85×(1+0.24+0.05)=1.0965→1.10`；开门见山 `1+0.24−0.04=1.20`，取1.15（−0.05）；阴掌 `1+0.12−0.03=1.09→1.10`，正式取1.10；撞山 `1+0.12−0.05=1.07→1.05`。

### 3.4 嵩山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_songshanrumenjian` | 嵩山入门剑 | 嵩山 | 兵器/剑·3黄上 | 笑傲 | 单体1.00；六向横扫0.95 | 无 | **（原创扩展）** | `set_songshan_hanbing` |
| `sk_songyangrumenzhang` | 嵩阳入门掌 | 嵩山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展）** | — |
| `sk_songyangtuna` | 嵩阳吐纳 | 嵩山 | 内功·3黄上·`yang` | 笑傲 | 回内；`meridians:[mer_dumai]`；IP `10+6+8+6=30` | 无 | **（原创扩展）** | `set_songshan_hanbing` |
| `sk_songshanxingbu` | 嵩山行步 | 嵩山 | 轻功·2黄中 | 笑傲 | 上坡移动体力 −10%；`Q_skill=38` | 无 | **（原创扩展）** | — |

黄阶预算同 §2.6：标准单体1.00；六向横扫带1冷却0.95；击退式 `1+0.12−0.05=1.07→1.05`；支援为0。

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
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 泰山 L4 传授；五岳并派前护住掌门传承可得**（原创扩展）** |
| 图鉴文本 | 先推敌势与方位，再在唯一破绽落剑。诗句借名与战斗数值均为本作转译。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 岱宗夫如何 `mv_daizongruhe_dai` | 1 | 单体·1·近身 | 1.20 | 7%/2/1000 | 目标本回合已行动时可用；`bf_polu` 40% | 可 | `1+0.24+0.15−0.04=1.35`；“推算”需先用望岳标记，额外消耗收益0.15 →1.20 |
| 齐鲁青未了 `mv_daizongruhe_qilu`（原创扩展命名） | 3 | 直线2·近身 | 1.15 | 8%/2/1000 | — | 可 | N=2、AF=0.90；`0.90×(1+0.24+0.05)=1.161≈1.15` |
| 造化钟神秀 `mv_daizongruhe_zaohua`（原创扩展命名） | 5 | 自身·支援 | 0 | 6%/3/900 | `bf_jingzhun` 3 | — | 支援招 |
| **阴阳割昏晓** `mv_daizongruhe_yinyang`（绝招；诗句借名） | 7 | 单体·1·近身 | 2.90 | 9%/—/1200 | `bf_polu` 100%·2 | 可 | `3−0.10=2.90`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_daizongruhe_tuiwei` | 推位 | 1 | 待机或防御后，下一剑命中 +8→18 |
| `ps_daizongruhe_guanshi` | 观势 | 4 | 可查看敌下一行动的目标与范围预告 |
| `ps_daizongruhe_yisuan` | 一算必中 | 10 | 每战首次“岱宗夫如何”获得 `bf_bizhong` ×1 |

### 4.3 泰山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_taishanjianfa` 泰山剑法 | 6玄上·兵器/剑·harmony | `sect:{id:sect_taishan,rank:2}; prereq:[{skill:sk_taishanrumenjian,layer:4}]; hard:[sect,prereq]` | 石关回马1.00；东岳横云 `mv_taishanjianfa_dongyue`（L7绝招，`ultimate:true`，六向横扫2.55，8%/气势100/1200；N=3、AF=.85，`3×.85=2.55`） | `[]` | 《笑傲江湖》泰山门人剑术；分式**（原创扩展命名）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_taishan18pan` 泰山十八盘 | 5玄中·轻功·neutral | `sect:{id:sect_taishan,rank:3}; prereq:[{skill:sk_shibanshanbu,layer:5}]; hard:[sect,prereq]` | 盘道0（连走3格得疾行）；回折0（换位） | `[]` | 泰山地名借作身法，武学**（原创扩展）**；`Q_skill=65` |
| `sk_taishanxinfa` 泰山心法 | 5玄中·内功·`yang` | `sect:{id:sect_taishan,rank:3}; prereq:[{skill:sk_taishantuna,layer:5}]; hard:[sect,prereq]` | 镇岳0（固本）；观日0（回内） | `[]` | **（原创扩展）**；`meridians:[mer_zuyangming]`（阴 0 / 阳 1）；IP `17+10+14+7.5=48.5` |
| `sk_taishanquan` 泰山拳 | 4玄下·拳脚/拳·yang | `sect:{id:sect_taishan,rank:2}; prereq:[{skill:sk_taishanrumenquan,layer:4}]; hard:[sect,prereq]` | 盘石1.00；落石1.05（击退1） | — | **（原创扩展）** |

抽样核算（4/4）：石关回马1.00；东岳横云按 N=3、AF=.85，`.85×1.24=1.054→1.05`；两门支援0；盘石1.00；落石 `1+.12−.05=1.07→1.05`。

### 4.4 泰山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_taishanrumenjian` | 泰山入门剑 | 泰山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；横削0.85 | 无 | **（原创扩展）** | `[]` |
| `sk_taishanrumenquan` | 泰山入门拳 | 泰山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；守势 | 无 | **（原创扩展）** | — |
| `sk_taishantuna` | 泰山吐纳 | 泰山 | 内功·3黄上·`yang` | 笑傲 | 回内；`meridians:[mer_zuyangming]`（阴 0 / 阳 1）；IP30 | 无 | **（原创扩展）** | `[]` |
| `sk_shibanshanbu` | 石坂山步 | 泰山 | 轻功·2黄中 | 笑傲 | 山路移动体力−10%；`Q_skill=38` | 无 | **（原创扩展）** | — |

黄阶整体采用标准单体1.00、六向横扫带1冷却0.95与支援0模板，预算误差均≤0.02。

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
| 层数要点 | 1 云起 ｜ 3 雾合 ｜ 7 云雾十三式 ｜ 9 百变（第二绝招） ｜ 10 曲尽剑藏 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 衡山 L4；莫大好感传授；刘正风遗谱支线至 8 重**（原创扩展）** |
| 图鉴文本 | 剑从琴声般悠忽起落，云遮雾绕、难辨来处。招式表现与数值为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 云起 `mv_baibianqianhuan_yunqi`（原创扩展命名） | 1 | 单体·1·近身 | 0.95 | 7%/1/900 | 命中后自身 `bf_piaohu` 2 | 可 | `1+0.12−0.07−0.10=0.95` |
| 雾合 `mv_baibianqianhuan_wuhe`（原创扩展命名） | 3 | `aoe_cone {r:2,angle:60,dirCount:6}`·近身 | 1.00 | 8%/2/1000 | `bf_polu` 40% | 可 | N=4、AF=.80；`.80×(1+.24+.05)−.04=.992→1.00` |
| **百变** `mv_baibianqianhuan_baibian`（绝招，原创扩展命名） | 9 | 绕背·1–2 | 2.50 | 9%/—/1200 | 绕背；`bf_luanxin` 30%；气势 100 | 可 | `3.00×0.90−0.15−0.10×0.30=2.52→2.50`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |
| **云雾十三式** `mv_baibianqianhuan_shisanshi`（绝招） | 7 | 乱击6·半径2 | 2.30 | 9%/—/1200 | 6段随机；自身 `bf_piaohu` 2 | 可 | `3×.85−.20=2.35`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

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
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:false, optionalCombo:true}` / `false` |
| learnSources | 金盆洗手改命线取得完整谱；原著线遗谱最多 8 重；任盈盈指点可补足**（原创扩展）** |
| 图鉴文本 | 一谱横跨正邪，琴箫各可独奏；两名角色合奏只追加节奏奖励，不是施放本武学的必要条件。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 清音 `mv_xiaoaojianghuqu_qingyin`（原创扩展命名） | 1 | 友方半径2·支援 | 0 | 6%/2/900 | `bf_dingxin` 3 | — | 支援招 |
| 沧海和声 `mv_xiaoaojianghuqu_he`（原创扩展命名） | 3 | `aoe_cone {r:2,angle:60,dirCount:6}`·远程音功 | 0.65 | 7%/2/1000 | `bf_dongyao` 50% | 否 | N=4、AF=.80；`.80×(1+.24)×.85×.85−.05=.667→.65`；音律技艺增幅另算；`MoveDef{range:{min:1,max:2}; aoe:{tpl:aoe_cone,r:2,angle:60,dirCount:6}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_cone,r:2,angle:60,dirCount:6},{tpl:aoe_cone,r:3,angle:60,dirCount:6},{tpl:aoe_cone,r:4,angle:60,dirCount:6}]; DamageKind:'projected'; meridianRouteRef:mfr_xiaoaojianghuqu_he}`；按 `design/21` §4.4.1，0 档为普通音波且 `projectionBoostActive=false`，1／2 档才启用外放加持 |
| 琴箫合奏 `mv_xiaoaojianghuqu_hezuo`（原创扩展命名） | 5 | 全体友方·支援 | 0 | 7%/3/1000 | `bf_ruiyi` 2、`bf_dingxin` 2；双人时持续+1 | — | 支援；双人只是可选强化 |
| **天地同声** `mv_xiaoaojianghuqu_tongsheng`（绝招，原创扩展命名） | 7 | 全场敌方·远程音功 | 0.60 | 8%/—/1200 | `bf_dongyao` 100%、`bf_luanxin` 40% | 否 | `3×.35×.85×.85−.10−.04=.62→.60`；全场模板没有可扩大的合法几何，三档均保持敌方全场；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200; range:{min:0,max:0}; aoe:{tpl:aoe_field,side:enemy}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy}]; DamageKind:'projected'; meridianRouteRef:mfr_xiaoaojianghuqu_tongsheng}`；0 档仍走普通音波 Z5M，1／2 档才启用外放威力 |

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
| layerStats / Q_skill | `eva:[4,10], spd:[1,5]`，合计15；`Q_skill=104`（地中十重，`QS(8)=104`，符合笑傲最高原生轻功地中） |
| 层数要点 | 1 入雾 ｜ 3 回峰 ｜ 5 云隐 ｜ 7 雾锁千山 ｜ 10 云开 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 衡山 L4；莫大指点；金盆洗手改命线保住传承可得 |
| 图鉴文本 | （原创扩展）借山岚遮形、借回峰转步，是笑傲书界可习得的最高阶轻功。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 入雾 `mv_hengshanyunwubu_ruwu` | 1 | 自身·移动≤3 | 0 | 5%/2/800 | 移动后 `bf_piaohu` 2 | — | 移动/支援，不进伤害公式 |
| 回峰 `mv_hengshanyunwubu_huifeng` | 3 | 与2格内单位换位 | 0 | 7%/3/900 | 合法空位换位 | — | 位移招，不进伤害公式 |
| 云隐 `mv_hengshanyunwubu_yunying` | 5 | 自身·架势 | 0 | 7%/3/800 | `bf_yinshen` 1；主动攻击即解除 | — | 架势招 |
| **雾锁千山** `mv_hengshanyunwubu_wusuo`（绝招） | 7 | 友方半径2·支援 | 0 | 9%/—/1200 | 友方 `bf_piaohu` 2、`bf_dunzou` 1 | — | 轻功支援绝招，无伤害倍率；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_hengshanyunwubu_yunxing` | 云行 | 1 | 每回合第一次转向不消耗移动点 |
| `ps_hengshanyunwubu_wuying` | 雾影 | 5 | 进入遮蔽地形后获得 `bf_piaohu` 1 |
| `ps_hengshanyunwubu_yunkai` | 云开 | 10 | 回峰后双方各获得 `bf_jixing` 1 |

### 5.5 衡山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_huifengluoyan` 回风落雁剑 | 6玄上·兵器/剑·yin | `sect:{id:sect_hengshan_nan,rank:3}; prereq:[{skill:sk_hengshanrumenjian,layer:4}]; hard:[sect,prereq]` | 回风0.95；落雁 `mv_huifengluoyan_luoyan`（L7绝招，`ultimate:true`，单体3.15，8%/气势100/1200，目标低血时可用；条件加成暂按加法记入 3.00 绝招基准，全图鉴加法／乘法写法待统一（`design/05` §4.2），`3.00+0.15=3.15`） | `[]` | 《笑傲江湖》·衡山剑法，招式细节**（待考）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_hengshanwushenjian` 衡山五神剑 | 5玄中·兵器/剑·harmony | `sect:{id:sect_hengshan_nan,rank:3}; prereq:[{skill:sk_hengshanrumenjian,layer:5}]; hard:[sect,prereq]` | 祝融剑1.00；芙蓉剑0.95（直线2） | `[]` | 《笑傲江湖》衡山剑法名目；五式细目**（待考）** |
| `sk_hengshanxinfa` 衡山心法 | 5玄中·内功·`yin` | `sect:{id:sect_hengshan_nan,rank:2}; prereq:[{skill:sk_hengshantuna,layer:5}]; hard:[sect,prereq]` | 抚弦调息0（回内）；云心0（飘忽） | `[]` | **（原创扩展）**；`meridians:[mer_shoushaoyin]`；IP48.5 |
抽样核算（4/4，含 §5.3 重点紧凑卡）：回风 `AF.90×(1+.24)−.15=.97→.95`；落雁 `1+.12+.15=1.27→1.25`（须目标低血）；祝融1.00；芙蓉 `.85×1.12=.95`；衡山心法为支援0；《笑傲江湖》曲谱的伤害招见 §5.3 逐招核算。

### 5.6 衡山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_hengshanrumenjian` | 衡山入门剑 | 南衡山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；回削0.95 | 无 | **（原创扩展）** | `[]` |
| `sk_hengshanrumenzhang` | 衡山入门掌 | 南衡山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展）** | — |
| `sk_hengshantuna` | 衡山吐纳 | 南衡山 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_shoushaoyin]`；IP30 | 无 | **（原创扩展）** | `[]` |
| `sk_hengshanqingbu` | 衡山轻步 | 南衡山 | 轻功·2黄中 | 笑傲 | 移动2格后闪避+3；`Q_skill=38` | 无 | **（原创扩展）** | — |

黄阶均用标准单体、击退式或支援模板，整体预算误差≤0.03。

---

## 6. 恒山派（北岳）`sect_hengshan_bei`

### 6.1 门派简介与总表

北岳恒山派剑法绵密、重守护与慈悲；定闲、定静、定逸及仪琳等人物见《笑傲江湖》。本作允许玩家进入统一五级职级，并按 `design/17` §6.6 的 T01/T03 混合模板显示尼众 / 俗家称谓；图鉴只列可学目录，不另定宗教制度。

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
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:true}` / `true` |
| learnSources | 恒山 L4；救援定闲/定静支线；观摩上限6 |
| 图鉴文本 | 剑光层叠如花，先封门户、再护同伴。名称**（待考）**，护生机制为**（原创扩展）**。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 花开并蒂 `mv_wanhuajianfa_bingdi`（原创扩展命名） | 1 | 单体·1·2段 | 1.10 | 7%/1/1000 | — | 可 | `1+0.12=1.12→1.10` |
| 护蕊 `mv_wanhuajianfa_hurui`（原创扩展命名） | 3 | 相邻友方·支援 | 0 | 6%/2/900 | 友方 `bf_yuanhu` 2 | — | 支援招 |
| 落英 `mv_wanhuajianfa_luoying`（原创扩展命名） | 5 | `aoe_cone {angle:120,r:1,dirCount:6}`·近身 | 1.05 | 8%/2/1000 | `bf_polu` 40% | 可 | N=3、AF=.85；`.85×(1+.24+.05)−.04=1.0565≈1.05` |
| **万花护生** `mv_wanhuajianfa_husheng`（绝招，原创扩展命名） | 7 | 周身·近身 | 2.10 | 9%/—/1200 | 友方 `bf_shoushi` 2 | 可 | N=6、AF=.75；`3×.75−.15=2.10`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_wanhuajianfa_cibei` | 慈悲 | 1 | 对气血低于30%的敌人不增伤；改为命中+10并允许“点到为止”非致命 |
| `ps_wanhuajianfa_huachi` | 护持 | 5 | 相邻友方受击后自身下一剑收招−100，每回合1次 |
| `ps_wanhuajianfa_lianxin` | 莲心 | 10 | 援护触发后自身获得 `bf_dingxin` 2 |

### 6.3 恒山玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_hengshanbeijianfa` 恒山剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_hengshan_bei,rank:3}; prereq:[{skill:sk_hengshanbeirumenjian,layer:4}]; hard:[sect,prereq]` | 绵针1.00；守门户 `mv_hengshanbeijianfa_shoumenhu`（L7绝招，`ultimate:true`，单体2.90，8%/气势100/1200，自身守势；`3−.10=2.90`） | `[]` | 《笑傲江湖》恒山群尼剑术；分式**（原创扩展命名）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_tianchangzhangfa` 天长掌法 | 5玄中·拳脚/拳·harmony | `sect:{id:sect_hengshan_bei,rank:3}; prereq:[{skill:sk_hengshanbeirumenquan,layer:5}]; hard:[sect,prereq]` | 天长1.10；地久1.10（虚弱30%） | `[]` | 《笑傲江湖》恒山掌法名目**（待考）** |
| `sk_hengshanbeixinfa` 恒山心法 | 5玄中·内功·`yin` | `sect:{id:sect_hengshan_bei,rank:2}; prereq:[{skill:sk_hengshanbeituna,layer:5}]; hard:[sect,prereq]` | 慈航0（回春）；守心0（定心） | `[]` | **（原创扩展）**；`meridians:[mer_shoutaiyin]`（阴 1 / 阳 0）；IP48.5 |
| `sk_hengshanbeishenfa` 恒山身法 | 4玄下·轻功·neutral | `sect:{id:sect_hengshan_bei,rank:2}; prereq:[{skill:sk_hengshanbeibu,layer:5}]; hard:[sect,prereq]` | 回廊0（换位）；护阵0（友方援护） | — | **（原创扩展）**；`Q_skill=56` |

抽样核算（4/4）：绵针1.00；守门户为攻击 `1−0.10=0.90`；天长 `1+0.12=1.12→1.10`；地久 `1+0.12−.03=1.09→1.10`；内功与轻功支援为0。

### 6.4 恒山黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_hengshanbeirumenjian` | 恒山入门剑 | 北恒山 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；守式0.90 | 无 | **（原创扩展）** | `[]` |
| `sk_hengshanbeirumenquan` | 恒山入门拳 | 北恒山 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；非致命收招 | 无 | **（原创扩展）** | — |
| `sk_hengshanbeituna` | 恒山吐纳 | 北恒山 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_shoutaiyin]`（阴 1 / 阳 0）；IP30 | 无 | **（原创扩展）** | `[]` |
| `sk_hengshanbeibu` | 恒山步 | 北恒山 | 轻功·2黄中 | 笑傲 | 相邻友方多时闪避+3；`Q_skill=38` | 无 | **（原创扩展）** | — |

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
| nature / meridians | `harmony` / `[mer_chongmai, mer_daimai]`（本作主修经脉；两脉依 AR-18a 默认均不投票） |
| wOut/wIn · moveSlots | `0/1` · 5 |
| reqs | `sect:{id:sect_riyue,rank:4}; attrs:{con:55,wil:60}; aptitude:{apInner:55}; prereq:[{skill:sk_riyuexinfa,layer:6}]; morality:{max:50}; hard:[sect,prereq]`；梅庄铁板来源以 `reqsOverride:{sect:null}` 删除门派身份，不删除前置 |
| inner.contribution | `mpMaxPct:48, hpMaxPct:29, attrs:{con:8,wil:8,wis:5}, mpRegen:3.3`；`48+29+2×21+5×3.3=135.5` |
| inner.stats | `effHit:10, resInjury:10`，合计20（天阶上限） |
| 层数要点 | 1 吸星真气 ｜ 3 吸星 ｜ 5 反吸 ｜ 6 散功 ｜ 7 第一绝招万流归海 ｜ 8 异种化解 ｜ 9 第二绝招散功 ｜ 10 任脉归流；吸星、反吸与化解保留普通运功职责 |
| setTags / conflicts | `[set_riyue_heimu]` / `sk_yijinjing counter`；北冥主运为 `synergy`，见 05 §9.1.3 |
| special / observable | `{cost:yizhongZhenqi,fusible:false}` / `false` |
| learnSources | 梅庄湖底铁板刻文 `maxLayer:10, reqsOverride:{sect:null}`；任我行传授 `maxLayer:10`；仅偷看交战不得观摩 |
| 图鉴文本 | 夺取敌内力为己用，爆发强而异种真气渐积。反噬、易筋化解和北冥相生完全引用 `design/05` §9.1.3。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 吸星 `mv_xixing_xixing` | 3 | 单体·1·近身 | 1.10 | 8%/2/1000 | 吸内=伤害30%；装配时得 `bf_xixing` | 可 | `1+0.24−0.15=1.09→1.10` |
| 反吸 `mv_xixing_fanxi`（原创扩展命名） | 5 | 自身·架势 | 0 | 7%/2/900 | 2回合强化受击反吸；仍产生异种真气 | — | 架势，不进入伤害公式 |
| **散功** `mv_xixing_sangong`（绝招，原创扩展命名） | 9 | 单体·1·近身·绝招 | 2.80 | 10%/气势100/1200 | `ultimate:true`；吸内；`bf_xuruo` 50% | 可 | 第二绝招；`3×1×1×1−0.15−0.05=2.80`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| **万流归海** `mv_xixing_wanliu`（绝招，原创扩展命名） | 7 | 周身 `aoe_around` | 2.10 | 10%/气势100/1200 | `ultimate:true`；每个命中目标各吸内，合计受单招上限 | 可 | N=6、AF=0.75；`3×0.75−0.15=2.10`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
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
| nature / meridians | `yang` / `[mer_chongmai, mer_dumai]`（本作主修经脉；冲脉不投票、督脉投阳，阴 0 / 阳 1） |
| wOut/wIn · moveSlots | `0/1` · 5 |
| reqs | `vow:vow_duanchen; attrs:{agi:65,wil:55}; aptitude:{apInner:55}; hard:[vow]` |
| inner.contribution | `mpMaxPct:48, hpMaxPct:29, attrs:{agi:10,wis:6,wil:5}, mpRegen:3.3`；`48+29+42+16.5=135.5` |
| inner.stats | `spd:12, eva:8`，合计20 |
| 层数要点 | 1 葵花真气 ｜ 3 飞针 ｜ 4 鬼魅 ｜ 6 刺目 ｜ 7 第一绝招万针归宗 ｜ 9 第二绝招刺目/针剑相通 ｜ 10 葵花极速；飞针与鬼魅行保留普通招 |
| setTags / conflicts | `[set_riyue_heimu, set_linjia_bixie]` / 与 `sk_bixie` 同源但不互斥，套装只计一个核心阈值 |
| special / observable | `{vowGate:vow_duanchen,fusible:false}` / `false` |
| learnSources | 黑木崖秘库；东方不败剧情路线只可在终盘取得；必须先完成 05 §9.1.4 的冷静期与二次确认 |
| 图鉴文本 | 以极快身法与飞针压制战场。永久代价、表现尺度与断尘之誓只引用 `design/05` §9.1.4。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 飞针 `mv_kuihua_feizhen` | 3 | 连锁3·1–5·投射 | 0.90/首跳 | 8%/2/1000 | `bf_shimang` 30%；后跳×0.8 | 可 | `.80×(1+.24)×.92−.03=.88→.90` |
| 鬼魅行 `mv_kuihua_guimei`（原创扩展命名） | 4 | 自身·位移 | 0 | 7%/3/800 | 移至6格内合法格；得 `bf_canying` 2层 | — | 位移/增益招，不计伤害 |
| **刺目** `mv_kuihua_cimu`（绝招） | 9 | 单体·1·近身·绝招 | 2.60 | 10%/气势100/1200 | `ultimate:true`；目标无相邻友方时可用；`bf_shimang` 100%·2 | 否 | 第二绝招；条件加成暂按加法记入 3.00 绝招基准；全图鉴加法／乘法写法待统一（`design/05` §4.2）：`(3.00+0.15)×0.85−0.10=2.5775→2.60`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| **万针归宗** `mv_kuihua_wanzhen`（绝招，原创扩展命名） | 7 | 连锁5·1–5·投射 | 2.15/首跳 | 10%/气势100/1200 | `ultimate:true`；`bf_shimang` 30%、`bf_xueweishoufeng(level:9,acupointRef:sourcePrimary)` 15%；后跳×0.8 | 可 | `3×.80×.92−.03−.03=2.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

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
| 令旗断路 `mv_heimuyajianfa_duanlu` | 3 | 直线2·近身 | 1.10 | 8%/2/1000 | `bf_chihuan` 50% | 可 | N=2、AF=.90；`.90×1.29−.05=1.111≈1.10` |
| 夜袭黑木 `mv_heimuyajianfa_yexi` | 5 | 绕背·1–2 | 1.00 | 8%/2/1000 | 绕背 | 可 | `.90×1.29−.15=1.01→1.00` |
| **黑木凌空** `mv_heimuyajianfa_lingkong`（绝招） | 7 | 跳斩·1–4 | 2.50 | 9%/—/1200 | 跳斩；`bf_polu` 100% | 可 | `3×.90−.10−.10=2.50`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

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
| 层数要点 | 1 泛音 ｜ 3 乱弦 ｜ 7 七弦齐鸣 ｜ 9 无形剑气（第二绝招） ｜ 10 希声 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:false, equipSynergy:eq_qixianqin}` / `true` |
| learnSources | 黄钟公以《广陵散》相易的支线；梅庄破关后高好感传授；观摩至6重 |
| 图鉴文本 | 琴音催发内劲，弦响而剑气无形。装备七弦琴时按 `design/10` 增强音律效果。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 泛音 `mv_qixianwuxingjian_fanyin`（原创扩展命名） | 1 | 直线3·远程音功 | 0.75 | 7%/2/1000 | — | 否 | N=3、AF=.85；`.85×(1+.24)×.85×.85=.762→.75`；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_line,n:3}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_line,n:3},{tpl:aoe_line,n:4},{tpl:aoe_line,n:5}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_fanyin}`；0 档普通音波，1／2 档才启用外放加持 |
| 乱弦 `mv_qixianwuxingjian_luanxian`（原创扩展命名） | 3 | `aoe_cone {r:2,angle:60,dirCount:6}`·远程音功 | 0.70 | 8%/2/1000 | `bf_luanxin` 40% | 否 | N=4、AF=.80；`.80×1.29×.85×.85−.04=.706≈.70`；`MoveDef{range:{min:1,max:2}; aoe:{tpl:aoe_cone,r:2,angle:60,dirCount:6}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_cone,r:2,angle:60,dirCount:6},{tpl:aoe_cone,r:3,angle:60,dirCount:6},{tpl:aoe_cone,r:4,angle:60,dirCount:6}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_luanxian}`；0 档普通音波，1／2 档才启用外放加持 |
| **无形剑气** `mv_qixianwuxingjian_wuxing`（绝招） | 9 | 单体·1–5·远程音功 | 2.15 | 9%/—/1200 | 音劲按 `sonic` 结算视线（`design/05` §4.4／`design/09` §5.5：无视遮挡）；气势 100 | 否 | `3.00×0.85×0.85=2.1675→2.15`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:5}; aoe:{tpl:aoe_single}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_wuxing}`；0 档普通音波，1／2 档才启用外放加持 |
| **七弦齐鸣** `mv_qixianwuxingjian_qiming`（绝招，原创扩展命名） | 7 | 全场敌方·音功 | 0.65 | 9%/—/1200 | `bf_dongyao` 100% | 否 | `3×.35×.85×.85−.10=.66→.65`；全场模板没有可扩大的合法几何，三档均保持敌方全场；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:0,max:0}; aoe:{tpl:aoe_field,side:enemy}; tags:[sonic]; projection:true; projectionSpreadSteps:[{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy},{tpl:aoe_field,side:enemy}]; DamageKind:'projected'; meridianRouteRef:mfr_qixianwuxingjian_qiming}`；0 档仍走普通音波 Z5M，1／2 档才启用外放威力 |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_qixianwuxingjian_wuxing` | 无形 | 1 | 音功不受普通兵器招架；仍可被音功/护体反制 |
| `ps_qixianwuxingjian_zhiyin` | 知音 | 5 | `music≥70` 时效果命中+10 |
| `ps_qixianwuxingjian_xisheng` | 希声 | 10 | 每战首次音功被抵抗时返还50%内力并得 `bf_jingzhun` 2 |

### 7.6 日月 / 梅庄玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_riyuejianfa` 日月剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_riyue,rank:2}; prereq:[{skill:sk_heimuyarumenjian,layer:4}]; hard:[sect,prereq]` | 日升1.10；月落 `mv_riyuejianfa_yueluo`（L7绝招，`ultimate:true`，单体2.95，8%/气势100/1200，破绽40%；`3−.10×.40=2.96≈2.95`） | `set_riyue_heimu` | **（原创扩展）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_riyuexinfa` 日月心法 | 6玄上·内功·`harmony` | `sect:{id:sect_riyue,rank:2}; prereq:[{skill:sk_heimutuna,layer:5}]; hard:[sect,prereq]` | 黑木运气0；日月同辉 `mv_riyuexinfa_riyue`（L7支援绝招，`ultimate:true`，0，8%/气势100/1200，内劲提升；不走伤害预算） | `[set_riyue_heimu]` | **（原创扩展）**；`meridians:[mer_chongmai]`（依 AR-18a 默认不投票）；IP57；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_shigudaxuebi` 石鼓打穴笔法 | 5玄中·兵器/奇门（笔）·harmony | `skills:{art:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 落笔1.00；石鼓文0.95（点穴30%） | `[]` | 《笑傲江湖》·秃笔翁以书法入武；正式名与字帖细节**（待考）** |
| `sk_pomopimajian` 泼墨披麻剑法 | 5玄中·兵器/剑·neutral | `skills:{art:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 泼墨1.05（六向横扫）；披麻1.00（连招） | `[]` | 《笑傲江湖》·丹青生剑法；招式细目**（待考）** |
| `sk_xuantianzhi` 玄天指 | 5玄中·拳脚/指·yin | `skills:{chess:45}; prereq:[{skill:sk_heimutuna,layer:4}]; hard:[prereq]` | 落子1.00；封眼0.95（封穴30%） | `[]` | 《笑傲江湖》·黑白子武学；正式名与交手细节**（待考）** |

抽样核算（5/5）：日升 `1+.12=1.12→1.10`；月落 `1+.12−.04=1.08→1.10`（正式取1.10）；心法支援0；落笔1.00；石鼓文 `1−.20×.3=.94→.95`；泼墨按 N=3、AF=.85，`.85×1.24=1.054→1.05`；披麻 `1+.12−.10=1.02→1.00`；封眼 `.94→.95`。

### 7.7 日月黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_heimuyarumenjian` | 黑木崖入门剑 | 日月 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；追击式0.90 | 无 | **（原创扩展）** | `set_riyue_heimu` |
| `sk_riyuejichuquan` | 日月基础拳 | 日月 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；低血时命中+3 | 无 | **（原创扩展）** | — |
| `sk_heimutuna` | 黑木吐纳 | 日月 / 梅庄 | 内功·3黄上·`harmony` | 笑傲 | 回内；`meridians:[mer_chongmai]`（依 AR-18a 默认不投票）；IP30 | 无 | **（原创扩展）** | `[set_riyue_heimu]` |
| `sk_shenjiaobu` | 神教步 | 日月 | 轻功·2黄中 | 笑傲 | 撤退成功率+5%；`Q_skill=38` | 无 | **（原创扩展）** | — |

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
| 层数要点 | 1 流星赶月 ｜ 3 花开见佛 ｜ 5 飞燕穿柳 ｜ 7 第一绝招群邪辟易 ｜ 9 第二绝招飞燕穿柳/鬼魅 ｜ 10 七十二路归一；两记早层剑式保留普通招 |
| setTags / conflicts | `[set_linjia_bixie]` / 与 `sk_kuihua` 同源；不额外叠两份断尘代价 |
| special / observable | `{vowGate:{vow:vow_duanchen,without:{gradeOverride:5,layerCap:5}},fusible:false}` / `false` |
| learnSources | 林家老宅袈裟真谱；岳不群/林平之相关剧情仅在符合路线时取得；林家口传只解锁有形无实版 |
| 图鉴文本 | 七十二路快剑以诡速取胜。无誓约者只得招形，完整代价与表现边界见 `design/05` §9.1.4。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 流星赶月 `mv_bixie_liuxingganyue` | 1 | 突进3·近身 | 0.85 | 8%/1/900 | 突进；自身 `bf_lianzhao` ×1 | 可 | `1+.12−.07−.10−.10=.85` |
| 花开见佛 `mv_bixie_huakaijianfo` | 3 | 单体·1·3段 | 1.20 | 9%/2/900 | `bf_polu` 40% | 可 | `1+.24+.05−.07−.04=1.18→1.20` |
| **飞燕穿柳** `mv_bixie_feiyanchuanliu`（绝招） | 9 | 直线3·近身·绝招 | 2.45 | 10%/气势100/1200 | `ultimate:true`；穿过首个目标后停至空格 | 可 | 第二绝招；N=3、AF=.85；`3×.85−.10=2.45`；`MoveDef{unlock:9; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |
| **群邪辟易** `mv_bixie_qunxie`（绝招） | 7 | 乱击6·半径2 | 2.10 | 10%/气势100/1200 | `ultimate:true`；自身 `bf_lianzhao` ×1 | 否 | `3×.85×.85−.10=2.07→2.10`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:10%; cd:0; recovery:1200}` |

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
| 翻掌 `mv_fantianzhang_fanzhang`（原创扩展命名） | 3 | `aoe_cone {angle:120,r:1,dirCount:6}` | 1.10 | 8%/2/1000 | — | 可 | N=3、AF=.85；`.85×(1+.24+.05)=1.0965≈1.10` |
| 掷碑 `mv_fantianzhang_zhibei`（原创扩展命名） | 5 | 单体·1 | 1.25 | 8%/2/1000 | `bf_pojia` 50% | 可 | `1+.24+.05−.05=1.24→1.25` |
| **翻天覆地** `mv_fantianzhang_fudi`（绝招） | 7 | 周身 | 2.15 | 9%/—/1200 | 击退1、`bf_panshan` 50% | 可 | N=6、AF=.75；`3×.75−.05−.05=2.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

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
| `sk_tangzibu` | 趟子步 | 福威镖局 | 轻功·2黄中 | 笑傲 | 护送任务体力消耗−10%；`Q_skill=38` | 无 | **（原创扩展）** | — |

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
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:false}` / `true` |
| learnSources | 青城 L4；余沧海支线；秘籍残页最多7重 |
| 图鉴文本 | 掌力透体伤及内息，定位为青城高阶阴掌；不得与九阴摧心掌共享来源或前置。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 透心掌 `mv_qingchengcuixinzhang_touxin`（原创扩展命名） | 1 | 单体·1 | 1.00 | 7%/1/1000 | `bf_neishang` 100% | 可 | `1+.12−.10=1.02→1.00` |
| 震脉 `mv_qingchengcuixinzhang_zhenmai`（原创扩展命名） | 3 | 单体·1 | 1.20 | 8%/2/1000 | `bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 40%·1 | 可 | `1+.24+.05−.20×.4=1.21→1.20` |
| 阴掌 `mv_qingchengcuixinzhang_yinzhang`（原创扩展命名） | 5 | 单体·1–2·远程 | 1.05 | 8%/2/1000 | `bf_xuruo` 50% | 可 | `1.29×.85−.05=1.05`；`MoveDef{range:{min:1,max:2}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_qingchengcuixinzhang_yinzhang}` |
| **摧心断脉** `mv_qingchengcuixinzhang_duanmai`（绝招） | 7 | 单体·1 | 2.80 | 9%/—/1200 | `bf_neishang` 100%；`bf_xueweishoufeng(level:8,acupointRef:sourcePrimary)` 50%·1 | 可 | `3−.10−.20×.5=2.80`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_qingchengcuixinzhang_toujing` | 透劲 | 1 | 对有内伤目标，本武学Z3+6→12% |
| `ps_qingchengcuixinzhang_yinshou` | 阴手 | 5 | 从目标背后命中时效果命中+10 |
| `ps_qingchengcuixinzhang_duanmai` | 断脉 | 10 | 每战首次封内力失败，改施加 `bf_xuruo` 2 |

### 9.3 青城玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_songfengjianfa` 松风剑法 | 6玄上·兵器/剑·yin | `sect:{id:sect_qingcheng,rank:3}; prereq:[{skill:sk_qingchengrumenjian,layer:4}]; hard:[sect,prereq]` | 松涛1.00；风过青城 `mv_songfengjianfa_fengguoqingcheng`（L7绝招，`ultimate:true`，突进2.90，8%/气势100/1200；`3−.10=2.90`） | `[]` | 《笑傲江湖》青城派剑法；分式**（原创扩展命名）**；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_qingchengxinfa` 青城心法 | 5玄中·内功·`yin` | `sect:{id:sect_qingcheng,rank:2}; prereq:[{skill:sk_qingchengtuna,layer:5}]; hard:[sect,prereq]` | 松息0（回内）；藏劲0（精准） | `[]` | **（原创扩展）**；`meridians:[mer_zujueyin]`；IP48.5 |

抽样核算（2/2）：松涛1.00；风过青城 `1+.12−.10=1.02→1.00`；心法支援0。

### 9.4 青城黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_qingchengrumenjian` | 青城入门剑 | 青城 | 兵器/剑·3黄上 | 笑傲 | 单刺1.00；回身0.95 | 无 | **（原创扩展）** | `[]` |
| `sk_qingchengrumenquan` | 青城入门拳 | 青城 | 拳脚/拳·2黄中 | 笑傲 | 单体1.00；破绽20% | 无 | **（原创扩展）** | — |
| `sk_qingchengtuna` | 青城吐纳 | 青城 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_zujueyin]`；IP30 | 无 | **（原创扩展）** | `[]` |
| `sk_qingchengshanjingbu` | 青城山径步 | 青城 | 轻功·2黄中 | 笑傲 | 林地/山路移动消耗−10%；`Q_skill=38` | 无 | **（原创扩展）** | — |

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
| nature / meridians | `harmony` / `[mer_zujueyin, mer_zushaoyang]`（阴 1 / 阳 1，平票取调和） |
| wOut/wIn · moveSlots | `0/1` · 4 |
| reqs | `sect:{id:sect_wuxian,rank:4}; prereq:[{skill:sk_wuxiandujing,layer:6},{skill:sk_wuxianduzhang,layer:6}]; skills:{poi:55,antidote:40}; attrs:{con:45,wis:45}; hard:[sect,prereq,skills.poi]` |
| inner.contribution | `mpMaxPct:26, hpMaxPct:16, attrs:{con:4,wis:3,wil:3}, mpRegen:2.0`；`26+16+20+10=72` |
| inner.stats | `resPoison:10, effHit:5`，合计15 |
| 层数要点 | 1 辨毒 ｜ 3 以毒行气 ｜ 5 百毒护体 ｜ 7 万蛊朝宗 ｜ 10 毒中求生 |
| setTags / conflicts | `[]` / 无 |
| special / observable | `{fusible:false}` / `false` |
| learnSources | 五仙 L4；蓝凤凰高羁绊；毒典解谜 |
| 图鉴文本 | **（原创扩展）**以识毒、试毒和解毒为根基，以足厥阴与足少阳相济的调和内功；不赋予无条件毒免。 |

| 招式（ID） | 重 | 范围·射程·投送 | 倍率 | 耗内/cd/收招 | 附带 | 架 | 核算 |
|---|---:|---|---:|---|---|---|---|
| 毒气催掌 `mv_wuxianbaidugong_cuizhang` | 1 | 单体·1–3·远程 | 0.85 | 7%/1/1000 | `bf_zhongdu` 100%·1层 | 可 | `(1+.12)×.85−.10=.85`；`MoveDef{range:{min:1,max:3}; aoe:{tpl:aoe_single}; projection:true; projectionSpreadSteps:[{tpl:aoe_single},{tpl:aoe_single},{tpl:aoe_single}]; DamageKind:'projected'; meridianRouteRef:mfr_wuxianbaidugong_cuizhang}` |
| 百毒护体 `mv_wuxianbaidugong_huti` | 5 | 自身·支援 | 0 | 6%/3/900 | `bf_mian_du` 2 | — | 支援招 |
| 毒引 `mv_wuxianbaidugong_duyin` | 6 | `aoe_cone {r:2,angle:60,dirCount:6}`·远程 | 0.80 | 8%/2/1000 | `bf_kangxing_jiang(resPoison)` 100% | 可 | N=4、AF=.80；`.80×1.29×.85−.10=.777≈.80`；`MoveDef{range:{min:1,max:2}; aoe:{tpl:aoe_cone,r:2,angle:60,dirCount:6}; projection:true; projectionSpreadSteps:[{tpl:aoe_cone,r:2,angle:60,dirCount:6},{tpl:aoe_cone,r:3,angle:60,dirCount:6},{tpl:aoe_cone,r:4,angle:60,dirCount:6}]; DamageKind:'projected'; meridianRouteRef:mfr_wuxianbaidugong_duyin}` |
| **万蛊朝宗** `mv_wuxianbaidugong_wangu`（绝招，原创扩展命名） | 7 | `aoe_disk {r:2}`·远程 | 1.15 | 9%/—/1200 | `bf_judu` 100% | 可 | N=19、AF=.50；`3×.50×.85−.15=1.125≈1.15`；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:9%; cd:0; recovery:1200; range:{min:1,max:2}; aoe:{tpl:aoe_disk,r:2}; projection:true; projectionSpreadSteps:[{tpl:aoe_disk,r:2},{tpl:aoe_disk,r:3},{tpl:aoe_disk,r:4}]; DamageKind:'projected'; meridianRouteRef:mfr_wuxianbaidugong_wangu}` |

| 被动 ID | 名称 | 重 | 效果 |
|---|---|---:|---|
| `ps_wuxianbaidugong_biandu` | 辨毒 | 1 | 毒类效果命中+5→12；解毒检定+10 |
| `ps_wuxianbaidugong_yidu` | 以毒行气 | 3 | 自身每被成功施加1层毒，回复1%内力，每回合最多3次 |
| `ps_wuxianbaidugong_duzhong` | 毒中求生 | 10 | 对品阶≤本武学的普通中毒免疫；剧毒仍按品阶对抗 |

### 10.3 五仙玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_wuxianduzhang` 五仙毒掌 | 6玄上·拳脚/拳·yin | `sect:{id:sect_wuxian,rank:3}; prereq:[{skill:sk_wuxianrumenzhang,layer:4}]; skills:{poi:35}; hard:[sect,prereq]` | 蛇影掌0.90；回风毒雾 `mv_wuxianduzhang_huifengduwu`（L7绝招，`ultimate:true`，锥形1.95，8%/气势100/1200，中毒100%；N=4、AF=.80，`3×.80×.85−.10=1.94≈1.95`） | `[]` | **（原创扩展命名）**；据五仙教用毒传统；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_wuxiandujing` 五仙毒经 | 5玄中·杂学/毒·yin | `sect:{id:sect_wuxian,rank:2}; prereq:[{skill:sk_miaozhaidufa,layer:5}]; skills:{poi:40,antidote:30}; hard:[sect,prereq]` | 辨毒0（精准）；施毒0（下次攻击附普通中毒） | `[]` | **（原创扩展）** |

抽样核算（2/2）：蛇影掌 `1−.10=.90`；毒雾按 N=4、AF=.80，`.80×1.24×.85−.10=.743→.75`；毒经支援0。

### 10.4 五仙黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_wuxianrumenzhang` | 五仙入门掌 | 五仙 | 拳脚/拳·3黄上 | 笑傲 | 单体0.95；中毒30% | 无 | **（原创扩展）** | `[]` |
| `sk_miaozhaidufa` | 苗寨毒法 | 五仙 | 杂学/毒·2黄中 | 笑傲 | 识别常见毒物；下次攻击中毒20% | 无 | **（原创扩展）** | `[]` |
| `sk_wuxiantuna` | 五仙吐纳 | 五仙 | 内功·3黄上·`yin` | 笑傲 | 回内；`meridians:[mer_zujueyin]`；IP30 | 无 | **（原创扩展）** | `[]` |

黄阶攻击以标准1.00扣普通中毒成本0.03，取0.95；毒法、吐纳为支援0，预算合法。五仙教缺独立黄阶剑，但已有黄阶入门拳，满足门派约束。

---

## 11. 江湖异人传承（桃谷六仙、田伯光、不戒和尚）

这些人物不构成可加入门派，统一 `sect:null + lineage`。其武学可以补本土类别池，但不承担组织职级链；因此 §0.4 不为其虚造掌门与长老。

### 11.1 玄阶紧凑卡

| ID / 名称 | 品阶·类别·性质 | `reqs` | 招式（倍率＋一句效果） | `setTags` | 出处 |
|---|---|---|---|---|---|
| `sk_taoguliuxianshou` 桃谷六仙手 | 5玄中·拳脚/擒拿·neutral | `attrs:{str:35,agi:35}` | 六手齐拿1.05（缴械30%）；分筋1.10（骨伤30%） | `[]` | 《笑傲江湖》桃谷六仙合力擒人与撕扯敌手；武学名**（原创扩展命名）**，表现弱化暴烈细节 |
| `sk_wanliduxing` 万里独行 | 6玄上·轻功·neutral | `attrs:{agi:45}; aptitude:{apLight:40}` | 远遁 `mv_wanliduxing_yuandun`（L7身法绝招，`ultimate:true`，0，8%/气势100/1200，`bf_dunzou`2；不走伤害预算）；掠影0 | `[]` | 田伯光绰号借作轻功名，**（原创扩展命名）**；`Q_skill=74`，与 `design/08` 对齐；`MoveDef{unlock:7; ultimate:true; rageCost:100; mpCost:8%; cd:0; recovery:1200}` |
| `sk_bujiezhang` 不戒掌 | 5玄中·拳脚/拳·yang | `attrs:{str:40,con:35}; prereq:[{skill:sk_bujiecuquan,layer:5}]; hard:[prereq]` | 破门1.05（击退1）；大喝0.95（震慑50%） | `[]` | 《笑傲江湖》不戒和尚武力高强；武学名与招式均**（原创扩展命名）** |

抽样核算（3/3）：六手齐拿 `1+.12−.20×.30=1.06→1.05`；分筋 `1+.12−.03=1.09→1.10`；万里独行为支援0；破门 `1+.12−.05=1.07→1.05`；大喝 `1−.10×.5=.95`。

### 11.2 黄阶一行条目

| ID | 名称 | 门派 / 来源 | 类别 | 原生书界 | 核心效果 | 前置 | 出处或标注 | `setTags` |
|---|---|---|---|---|---|---|---|---|
| `sk_bujiecuquan` | 不戒粗拳 | 不戒和尚传承 | 拳脚/拳·3黄上 | 笑傲 | 单体1.00；击退式1.05 | 无 | **（原创扩展命名）** | `[]` |

> 本节一门黄阶；其与九个组织条目合计恰为 36 门黄阶。桃谷六仙手直接由人物羁绊传授，不虚造一门原著未见的前置步法。

---

## 12. 套装候选（已由 `design/07` 收敛）

> 正式成员、阈值、效果与逐书界路径唯一见 `design/07` §14；本节只保留图鉴侧成员索引。实际 `setTags` 已按 C22 只保留正式关系。

| 正式套装 | ID | 本图鉴成员 |
|---|---|---|
| 华山气剑 | `set_huashan_qijian` | `sk_huashanrumenjian`、`sk_huashantuna`、`sk_huashanjianfa`、`sk_yangwujian`、`sk_huashanxinfa`、`sk_kuangfengkuaijian`、`sk_taiyuesanqingfeng`、`sk_zixiashengong` |
| 嵩山寒岳 | `set_songshan_hanbing` | `sk_songshanrumenjian`、`sk_songyangtuna`、`sk_songshanjianfa`、`sk_songyangxinfa`、`sk_dayinyangshou`、`sk_hanbingzhenqi` |
| 黑木日月 | `set_riyue_heimu` | `sk_heimuyarumenjian`、`sk_heimutuna`、`sk_riyuejianfa`、`sk_riyuexinfa`、`sk_heimuyajianfa`、`sk_xixing`、`sk_kuihua` |
| 林家辟邪 | `set_linjia_bixie` | `sk_linjiarumenjian`、`sk_biaojuxinfa`、`sk_linjiajianfa`、`sk_linjiashou`、`sk_fantianzhang`、`sk_bixie`、`sk_kuihua` |

跨组正式关系：`sk_dugu9 → set_dugu_jianzhong`，完整套装见 `design/07` §11.4。未采用的泰山、南／北衡山、梅庄、任我行、东方、青城、五仙、琴箫与异人候选均已移除实际标签；去向见 `design/07` §19。

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
| 门派成套组合 | **9 / 9** | §1.2 与 §12 双向登记；散人另有 `legacy-set:xiaoao_yiren` |
| 绝招数量 | **天9／地17／玄上15** | 天上3、天中各2、天下2；地上各2，地中3门各2、2门各1，地下各1；15门玄上各1。统一裁定前为天9／地14／玄上15 |

天中／地中区间取值逐门理由：

| 武学 | 取值 | 理由 |
|---|---:|---|
| `sk_xixing` | 天中 2 | 单体散功与范围夺内分别承担破阵、清场；其余三招是吸取、反吸、化解的普通循环。 |
| `sk_kuihua` | 天中 2 | 单体致盲与连锁飞针已有两种清晰职责，仅余飞针、位移两记普通招，不足以支撑第三绝招。 |
| `sk_taiyuesanqingfeng` | 地中 2 | 三峰相济承担连击终结；第三青峰因总名明确三剑递进、精妙结构充足，升为第二绝招。 |
| `sk_daizongruhe` | 地中 1 | 阴阳割昏晓承担推演终结，戴、奇路与造化维持计算／支援循环。 |
| `sk_baibianqianhuan` | 地中 2 | 云雾十三式承担范围终结；名称明示十三式，百变作为精妙变化升为第二绝招。 |
| `sk_hengshanyunwubu` | 地中 1 | 雾锁千山承担支援脱身，入雾、回峰、云影保留常规机动。 |
| `sk_qixianwuxingjian` | 地中 2 | 七弦齐鸣承担全场音控；标志性的无形剑气承担单体远程压制，形成第二绝招。 |

### 13.4 原生书界与既定池差异

本文 88 门均以 `ch05_xiaoao` 为完整原生书界；紫霞在碧血的 8 品残承不重复计“首现”。因此本文首现分布就是 `4/12/36/36=88`。05 §14.4 的旧版笑傲首现目标为 `4/10/16/14=44`，已被作者 AR-01 的本图鉴比例要求覆盖；差额为地 `+2`、玄 `+20`、黄 `+22`。需要 `design/05` 汇总阶段按全部十册图鉴重算全局及书界表，不能继续用旧 519 门分母判断本文件。

### 13.5 外放统计与候选审计

本册逐招审计后共标记 **13** 招外放：天／地／玄／黄为 **1／10／2／0**。统计只认 `MoveDef.projection:true`，不按整门武学、远程投送或旧 `DamageKind` 反推。下表是 `tech/04` 构建 `projection-coverage.json` 的本文输入，按 `moveId` 排序；“待考”不得在构建时默认改成 `projected`。

| moveId | 结论 | 依据 | 所在位置 |
|---|---|---|---|
| `mv_dugu9_poanqi` | `not_projected` | 拨开／反射实体投射的近身破箭式，本招不发剑气 | §2.2 |
| `mv_dugu9_pobian` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_dugu9_podao` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_dugu9_pojian` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_dugu9_poqi` | `projected` | 作者指定的独孤剑气示例；剑气表现**（原创扩展）**，基础线 n1·射程1 | §2.2 |
| `mv_dugu9_poqiang` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_dugu9_posuo` | `not_projected` | 兵刃近身破索，射程2不等于真气离体 | §2.2 |
| `mv_dugu9_pozhang` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_dugu9_wuzhao` | `not_projected` | 普通近身剑击／破招，不按整门独孤批量外放 | §2.2 |
| `mv_dugu9_zongjue` | `not_projected` | 近身总诀 / 破招，不发剑气；独孤九剑只标破气式的剑气 | §2.2 |
| `mv_hanbingzhenqi_fengyue` | `not_projected` | 周身寒潮以自身为心，不取得远处落点；沿用近身范围招 | §3.2 |
| `mv_hanbingzhenqi_huti` | `not_projected` | 纯护体支援 | §3.2 |
| `mv_hanbingzhenqi_ningshuang` | `projected` | 寒劲离体点杀；基础单体 1–3，三档均单体 | §3.2 |
| `mv_kuihua_feizhen` | `not_projected` | 发射实体绣花针，属于实体投射通道 | §7.3 |
| `mv_kuihua_guimei` | `not_projected` | 纯位移／增益 | §7.3 |
| `mv_kuihua_wanzhen` | `not_projected` | 多枚实体针连锁，远程不等于真气外放 | §7.3 |
| `mv_qingchengcuixinzhang_yinzhang` | `projected` | 阴性掌劲离体；基础单体 1–2，三档均单体 | §9.2 |
| `mv_qixianwuxingjian_fanyin` | `projected` | `tags:[sonic]`；深厚内力控制琴音伤敌；0 档普通音波线 n3，1／2 档外放线 n4/n5 | §7.5 |
| `mv_qixianwuxingjian_luanxian` | `projected` | `tags:[sonic]`；深厚内力控制琴音扇面；0 档普通音波锥 r2，1／2 档外放锥 r3/r4 | §7.5 |
| `mv_qixianwuxingjian_qiming` | `projected` | `tags:[sonic]`；深厚内力控制琴音覆盖敌方全场；三档同形，0 档不用外放威力 | §7.5 |
| `mv_qixianwuxingjian_wuxing` | `projected` | `tags:[sonic]`；深厚内力所发无形音劲；三档均单体，0 档不用外放威力 | §7.5 |
| `mv_taiyuesanqingfeng_sanfeng` | `not_projected` | “剑气相连”是层数／内劲占比描述，招式仍为近身剑击 | §2.4 |
| `mv_taiyuesanqingfeng_sanfengheyi` | `not_projected` | 三段近身连剑，未配置离体剑气表现 | §2.4 |
| `mv_wuxianbaidugong_cuizhang` | `projected` | 毒性真气随掌劲离体；基础单体 1–3，三档均单体 | §10.2 |
| `mv_wuxianbaidugong_duyin` | `projected` | 毒劲离体形成锥面；0/1/2 档锥半径 2/3/4 | §10.2 |
| `mv_wuxianbaidugong_huti` | `not_projected` | 纯护体支援 | §10.2 |
| `mv_wuxianbaidugong_wangu` | `projected` | 真气催毒成离体范围伤害；0/1/2 档圆盘半径 2/3/4 | §10.2 |
| `mv_wuxianduzhang_huifengduwu` | 待考 | 文本只说明毒雾，未明确是真气外放还是实体毒物喷散；默认不标 | §10.3 |
| `mv_xiaoaojianghuqu_he` | `projected` | `tags:[sonic]`；深厚内力控制琴箫音劲；0 档普通音波锥 r2，1／2 档外放锥 r3/r4 | §5.3 |
| `mv_xiaoaojianghuqu_qingyin` | `not_projected` | 纯友方支援，无伤害段 | §5.3 |
| `mv_xiaoaojianghuqu_tongsheng` | `projected` | `tags:[sonic]`；深厚内力控制音劲伤敌；三档均敌方全场，0 档不用外放威力 | §5.3 |
| `mv_zixiashengong_changkong` | `not_projected` | 周身真气以自身为心，不取得远处落点 | §2.3 |
| `mv_zixiashengong_guangri` | `projected` | 紫霞真气离体点杀；基础单体 1–3，三档均单体 | §2.3 |
| `mv_zixiashengong_huti` | `not_projected` | 纯护体支援 | §2.3 |

六记伤敌音功均已按 Canon V16-03 补 `tags:[sonic]`：0 档固定基础范围、额外耗内 0、`projectionBoostActive=false` 并走普通 Z5M；只有 1／2 档启用外放范围、成本与威力。两记敌方全场音功三档均保持 `aoe_field`，因为全场已无更大合法几何。纯支援的清音、琴箫合奏及实体笔招石鼓打穴笔法保持非外放。`mv_wuxianbaidugong_wangu` 的半径 4 仍是 `design/09` §5.3 允许的 `r≥0` 圆盘，但实际格集合继续受地图边界、高差、遮挡与地形裁剪。

---

## 14. 境界覆盖与装配可行性

### 14.1 笑傲本组本土池

| 书界 | 境界 | 天 / 地 / 玄 / 黄 | 内功 | 拳脚 | 兵器 | 轻功 | 暗器 | 杂学 | 合计 |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 笑傲 `ch05_xiaoao` | 中武 | 4 / 12 / 36 / 36 | **21** | **21** | **30** | **12** | 0 | **4** | **88** |

按基准 §20，中武入场最多携带内 / 拳脚 / 兵器各 2 门，而装配栏各有 3 格，所以每类至少要能在本界合法补 1 门。本文单组提供本土内功 21、拳脚 21、兵器 30，均远高于 05 §14.6 #4 的“各 ≥3 门”。这证明**目录容量**足够；不表示单一角色在 `0/0/0` 入场后可无视门派互斥、任务分歧与前置同时学会任意三门，实际可达性仍以 §14.2 路线和 `design/12` / `chapters/05` 为准。

本文件只覆盖笑傲一个**中武**书界。低武书界（连城、白马、鸳鸯）不在本组 `sourceChapters` 范围，因此“低武本土三类各 ≥3 门”在本文为**不适用**，须由各自图鉴证明；本文不会把笑傲武学误算作低武本土池。

### 14.2 从零起步与三类可达链

| 装配类别 | 无门派身份的本土入口 | 门派内递进示例 | 可填满 3 格的证明 |
|---|---|---|---|
| 内功 | 梅庄铁板的吸星来源仍要求日月心法前置；无门派入口依赖少林、武当或丐帮等跨图鉴的笑傲本土来源 | 华山吐纳→华山心法→紫霞；嵩阳吐纳→嵩阳心法→寒冰；五仙吐纳→五仙百毒功 | 目录中有 9 黄＋7 玄＋3 地＋2 天；实际选取三门须属于同一条可达路线或已获合法来源 |
| 拳脚 | 桃谷六仙手可由人物羁绊取得；不戒粗拳是无门派黄阶入口，万里独行则不属于拳脚 | 各派黄阶入门拳/掌→玄阶拳掌→林家翻天 / 青城摧心 / 五仙百毒 | 本文有 10 黄＋9 玄＋2 地拳脚；至少三条互不依赖的门派路线 |
| 兵器 | 独孤九剑的奇遇不可当普遍入门；福威、五岳、日月均有门派入口 | 华山入门剑→华山剑法→太岳；南衡山入门剑→回风→百变；日月入门剑→日月剑→黑木崖剑 | 本文有 8 黄＋15 玄＋5 地＋2 天兵器；九个组织中八个提供本土兵器 |

“可填满”不等于“单门派可学尽”：门派身份冲突、剧情路线和来源门槛仍由 `design/12` / `chapters/05` 控制。系统只需保证玩家在笑傲可从门派、羁绊、秘籍、观摩等合法来源中补齐栏位，而不是允许同时拜入所有门派。

### 14.3 轻功、非核心栏与最高品阶

- 本组轻功 12 门：地中 1、玄上 1、玄中 1、玄下 1、黄中 8。最高为 `sk_hengshanyunwubu`（8 地中，十重 `Q_skill=QS(8)=104`），不突破笑傲地中上限。
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

## 15. 经脉系统落地（AR-14）

### 15.1 归属边界与组装规则

本节只给本文既有武学、招式配置稳定引用，不复制 `design/21` 的河流状态机、乘区曲线或取整算法。`MeridianRouteDef`、`BreathProfile`、Z4M／Z5M、护体内劲、速度、擒拿／点穴与调息唯一见 `design/21` §3–§12；穴位拓扑、冲穴、周天与九转唯一见 `design/15`。每个可独立行动的我方、敌方、召唤物与环境行动者各持有一个 `MeridianFlowModule`，不得共享动态节点状态。

- 招式使用 `MoveDef.meridianRouteRef`；仅触发式防守／身法使用 `routeOnTriggerRef`。路线 `ultimate` 只镜像 `MoveDef.ultimate`，构建期必须相等。
- 轻功使用 `SkillDef.movementRouteRef`，引用 `purpose:movement` 路线；不改 `Q_skill`、面板轻功或 `design/08` 门禁。
- 内功使用 `InnerDef.breathProfileRef` 与 `innerGuard:{enabled,reflectBp}`；来袭侧 `InnerGuardInput.breakGuardBp` 不写入内功。
- 模板只是本文排版别名。正式路线必须展开为 `id/moveRef/ultimate/purpose/requiredNature/steps[{acupointRef,segmentCt,riskBp}]`，构建产物不得保存模板码。路线与调息均属**（原创扩展）**。
- Y=`[yang,harmony]`、I=`[yin,harmony]`、H=`[yin,yang,harmony]`；neutral 招式用 H，但不改原武学性质。标准对标准严格 10000 bp；硬界与 Z4M→Z5→Z5M 逐次向下取整只引用 `design/21` §3.5、§4.4、§4.9。

终审配路按 `design/21` §4.3.1 的“动作末端 → 明示内功／门派底子 → 性质 → 战术职责”顺序执行：持械绝招在末三段收至腕部导引穴，掌招收至劳宫，内功攻击保留任／督核心，外放另命中手部端点白名单。为保留招式辨识度，寒冰封脉由阴跷、阴维收束任脉后封手厥阴，吸星散功由冲、带聚势后回任脉散功；AR-18 重算后，葵花两路以督脉、阳跷／阳维和手足三阳作为阳性体段，再由末端手穴完成飞针动作。吸星·万流、峻岳护体、日月同辉另分别从各自武学的明示经脉中取冲、督、冲脉穴作为躯干段，峻岳护体与日月同辉同时命中任／督门槛；以上路线均保持原段数、总 CT、总风险和职责。支援、纯身法及音功不强行改写为掌／指／兵器动作；音功仍独立接受外放端点检查。绝招显式步骤只在文首索引定义一次；8 条 AR-18 普通路线与 7 条外放普通路线的显式步骤只在 §15.4 对应表定义；§15.3–§15.5 的其余行只作绑定与核算镜像。

路线叙事第三轮把本册受检的 13 对跨武学高相似路线全部改开，不保留高相似说明或静默豁免。改线只替换穴位，不改变招式的出招方式、段数、逐段 CT、逐段风险、路线用途与收招；7 条路线的新核心段与动作末端均属**（原创扩展）**。独孤“无招”以跨脉换线表现不守成式，青城摧心掌沿足厥阴蓄阴劲后落劳宫，七弦无形剑由冲带转入持琴手腕，辟邪穿柳先走阴跷藏势再借阳跷穿线；嵩山“开门”由督脉提劲后走手三阳，日月“月落”由带脉横转后收至外关，养吾“浩然”则以督脉养气并由外关、阳谷发剑。

阴阳性质落地 AR-18 保持现有动作末端，改写四条原有冲突路线，并因葵花宝典由阴改阳同步改写其两条绝招路线：百变千幻两路与黑木崖剑法改用阴跷、阴维、足三阴／手三阴体段后再接持械手穴；七弦齐鸣以阴脉体段驱动琴音并由中冲收束；葵花两路则改走督脉、阳跷／阳维与手三阳体段。六路均只换穴位，段数、逐段 CT、风险列表、路线用途与收招合计不变；全部路线与穴位选择均为**（原创扩展）**。

同次性质联动把 8 条普通路线由模板改为 §15.4 的显式序列：紫霞两路以任／督及阴阳跷维配平；吸星三路以冲、带承接并令阴阳体段配平；葵花飞针与鬼魅行改用阳性体段但保留少商发针、曲泽收身；五仙护体以任督和手阴阳配平。八路均保留原动作关键末端、段数、逐段 CT／风险、用途与收招合计；显式序列与全仓其他普通路线无完全相同或新增 ≥80% 配对。

#### 路线叙事第三轮核算镜像

绝招步骤见文首索引，普通路线见 §15.4；本表冻结本轮改线后的叙事、段数与数值核算，避免绑定表只写索引时遗漏收招或风险。风险总和均由右列逐项相加，收招合计为各招自身 `recovery + 路线 CT`。

| 路线 ID | 核心段与动作末端 | 模板代号 | 段数 | 路线 CT | 收招合计 | 总风险 | 风险列表 |
|---|---|---|---:|---:|---:|---:|---|
| `mfr_dugu9_wuzhao` | 神门、听宫试势，阳维／冲带换线；末三段支沟→合谷→阳谷收剑 | 见文首索引 | 10 | `10×80=800` | `1200+800=2000` | 1900 | `[100,120,140,160,180,200,220,240,260,280]` |
| `mfr_qingchengcuixinzhang_duanmai` | 足厥阴连贯蓄阴劲；末三段曲泽→内关→劳宫落掌 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_qixianwuxingjian_wuxing` | 冲、带承接后转手太阴／厥阴；末两段外关→阳池导引持琴发劲 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_bixie_feiyanchuanliu` | 阴跷／阴维藏势，阳跷／足少阳穿线；末两段腕骨→阳池收剑 | 见文首索引 | 10 | `10×70=700` | `1200+700=1900` | 1410 | `[110,120,130,140,130,140,150,160,160,170]` |
| `mfr_songshanjianfa_kaimen` | 腰阳关提劲，经阳维、手三阳开门；末两段支沟→阳池收剑 | 见文首索引 | 6 | `6×100=600` | `1200+600=1800` | 900 | `[100,120,140,160,180,200]` |
| `mfr_riyuejianfa_yueluo` | 带脉横转，阴维／阴经敛势；末两段内关→外关收剑 | 见文首索引 | 6 | `6×100=600` | `1200+600=1800` | 900 | `[100,120,140,160,180,200]` |
| `mfr_yangwujian_haoran` | 督脉养气上提，经天髎贯臂；末两段外关→阳谷发剑 | 见文首索引 | 6 | `6×100=600` | `1200+600=1800` | 900 | `[100,120,140,160,180,200]` |
| `mfr_baibianqianhuan_shisanshi` | 阴跷、阴维与足三阴藏势；末三段外关→阳谷→合谷收剑 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_baibianqianhuan_baibian` | 阴跷、阴维与手足三阴换势；末三段天井→外关→腕骨收剑 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_heimuyajianfa_lingkong` | 阴跷、阴维与足三阴贴崖蓄势；末三段外关→阳谷→合谷收剑 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_qixianwuxingjian_qiming` | 阴跷、阴维与手足三阴蓄音；任脉膻中承声，末两段内关→中冲导琴劲 | 见文首索引 | 8 | `8×90=720` | `1200+720=1920` | 1360 | `[100,120,140,160,180,200,220,240]` |
| `mfr_kuihua_cimu` | 督脉提速，经阳跷、阳维与手三阳穿腕；末三段大陵→内关→中冲点刺 | 见文首索引 | 10 | `10×70=700` | `1200+700=1900` | 1410 | `[110,120,130,140,130,140,150,160,160,170]` |
| `mfr_kuihua_wanzhen` | 督脉起势，经阳跷、阳维、足少阳与手三阳布针；末三段合谷→内关→少商发针 | 见文首索引 | 10 | `10×80=800` | `1200+800=2000` | 1900 | `[100,120,140,160,180,200,220,240,260,280]` |
| `mfr_zixiashengong_chaoyang` | 任脉、阴跷与督脉相济；末两段神道→百会收束 | AR-18 显式 | 4 | `4×75=300` | `900+300=1200` | 340 | `[70,80,90,100]` |
| `mfr_zixiashengong_huti` | 任脉、阴跷／厥阴与督脉、阳维配平；百会护体 | AR-18 显式 | 6 | `6×90=540` | `900+540=1440` | 610 | `[80,90,100,120,100,120]` |
| `mfr_xixing_xixing` | 冲、带承接，督脉／外关与手太阴配平；尺泽→少商吸劲 | AR-18 显式 | 6 | `6×75=450` | `1000+450=1450` | 640 | `[100,100,100,120,100,120]` |
| `mfr_xixing_fanxi` | 任脉、阴跷承受来劲，督脉／外关反转；曲泽收束 | AR-18 显式 | 6 | `6×90=540` | `900+540=1440` | 610 | `[80,90,100,120,100,120]` |
| `mfr_xixing_huajie` | 任脉起势，冲、带承接，督脉与合谷转化；曲泽收束 | AR-18 显式 | 6 | `6×90=540` | `1000+540=1540` | 610 | `[80,90,100,120,100,120]` |
| `mfr_kuihua_feizhen` | 督脉、阳跷／阳维提速，经外关、腕骨导引；少商发针 | AR-18 显式 | 6 | `6×75=450` | `1000+450=1450` | 640 | `[100,100,100,120,100,120]` |
| `mfr_kuihua_guimei` | 涌泉起步，经足太阳、阳跷与督脉腾挪；曲泽收身 | AR-18 显式 | 6 | `6×65=390` | `800+390=1190` | 570 | `[70,80,90,100,110,120]` |
| `mfr_wuxianbaidugong_huti` | 任督与手阴阳各一相济；合谷→少商护体 | AR-18 显式 | 4 | `4×75=300` | `900+300=1200` | 340 | `[70,80,90,100]` |

### 15.2 展开路线模板

`steps` 按运行顺序列为 `穴位/segmentCt/riskBp`；同一路线无重复穴位，所有 `ap_*` 均已在 `design/15` 登记。

| 模板 | purpose | requiredNature | steps（依次；`ap_*/CT/riskBp`） | 总 CT |
|---|---|---|---|---:|
| A4Y | attack | `[yang,harmony]` | `ap_shouyangming_quchi/70/90 → ap_shouyangming_shousanli/70/90 → ap_shouyangming_hegu/70/90 → ap_shouyangming_shangyang/70/90` | 280 |
| A6Y | attack | `[yang,harmony]` | `ap_renmai_qihai/75/100 → ap_renmai_guanyuan/75/100 → ap_dumai_mingmen/75/100 → ap_dumai_zhiyang/75/120 → ap_dumai_shendao/75/100 → ap_dumai_baihui/75/120` | 450 |
| A8Y | attack | `[yang,harmony]` | `ap_renmai_qihai/80/110 → ap_renmai_guanyuan/80/110 → ap_renmai_zhongwan/80/120 → ap_renmai_danzhong/80/120 → ap_dumai_mingmen/80/120 → ap_dumai_zhiyang/80/140 → ap_dumai_shendao/80/120 → ap_dumai_baihui/80/150` | 640 |
| A10Y | attack | `[yang,harmony]` | `ap_renmai_qihai/80/120 → ap_renmai_guanyuan/80/120 → ap_renmai_zhongwan/80/140 → ap_renmai_danzhong/80/140 → ap_dumai_mingmen/80/150 → ap_dumai_zhiyang/80/180 → ap_dumai_shendao/80/160 → ap_dumai_baihui/80/180 → ap_shouyangming_quchi/80/160 → ap_shouyangming_shousanli/80/180` | 800 |
| A4I | attack | `[yin,harmony]` | `ap_shoutaiyin_yunmen/70/90 → ap_shoutaiyin_chize/70/90 → ap_shoutaiyin_taiyuan/70/90 → ap_shoutaiyin_shaoshang/70/90` | 280 |
| A6I | attack | `[yin,harmony]` | `ap_renmai_qihai/75/100 → ap_renmai_guanyuan/75/100 → ap_shoutaiyin_yunmen/75/100 → ap_shoutaiyin_chize/75/120 → ap_shoutaiyin_taiyuan/75/100 → ap_shoutaiyin_shaoshang/75/120` | 450 |
| A8I | attack | `[yin,harmony]` | `ap_renmai_qihai/80/110 → ap_renmai_guanyuan/80/110 → ap_renmai_zhongwan/80/120 → ap_renmai_danzhong/80/120 → ap_shoutaiyin_yunmen/80/120 → ap_shoutaiyin_chize/80/140 → ap_shoutaiyin_taiyuan/80/120 → ap_shoutaiyin_shaoshang/80/150` | 640 |
| A10I | attack | `[yin,harmony]` | `ap_renmai_qihai/80/120 → ap_renmai_guanyuan/80/120 → ap_renmai_zhongwan/80/140 → ap_renmai_danzhong/80/140 → ap_shoutaiyin_yunmen/80/150 → ap_shoutaiyin_chize/80/180 → ap_shoutaiyin_taiyuan/80/160 → ap_shoutaiyin_shaoshang/80/180 → ap_shoujueyin_tianchi/80/160 → ap_shoujueyin_quze/80/180` | 800 |
| A4H | attack | `[yin,yang,harmony]` | `ap_daimai_zulinqi/70/90 → ap_daimai_weidao/70/90 → ap_daimai_daimai/70/90 → ap_dumai_zhiyang/70/90` | 280 |
| A6H | attack | `[yin,yang,harmony]` | `ap_daimai_zulinqi/75/100 → ap_daimai_weidao/75/100 → ap_daimai_daimai/75/100 → ap_dumai_zhiyang/75/120 → ap_shoujueyin_tianchi/75/100 → ap_shoujueyin_quze/75/120` | 450 |
| A8H | attack | `[yin,yang,harmony]` | `ap_zushaoyin_yongquan/80/110 → ap_zushaoyin_taixi/80/110 → ap_zutaiyang_weizhong/80/120 → ap_dumai_mingmen/80/120 → ap_shoujueyin_tianchi/80/120 → ap_shoujueyin_quze/80/140 → ap_shoujueyin_neiguan/80/120 → ap_shoujueyin_laogong/80/150` | 640 |
| A10H | attack | `[yin,yang,harmony]` | `ap_renmai_qihai/80/120 → ap_renmai_guanyuan/80/120 → ap_renmai_zhongwan/80/140 → ap_renmai_danzhong/80/140 → ap_daimai_zulinqi/80/150 → ap_daimai_weidao/80/180 → ap_daimai_daimai/80/160 → ap_dumai_zhiyang/80/180 → ap_shoujueyin_tianchi/80/160 → ap_shoujueyin_quze/80/180` | 800 |
| D3Y | defense | `[yang,harmony]` | `ap_dumai_mingmen/70/70 → ap_dumai_zhiyang/70/80 → ap_dumai_shendao/70/90` | 210 |
| D4Y | defense | `[yang,harmony]` | `ap_dumai_mingmen/75/70 → ap_dumai_zhiyang/75/80 → ap_dumai_shendao/75/90 → ap_dumai_baihui/75/100` | 300 |
| D6Y | defense | `[yang,harmony]` | `ap_renmai_qihai/90/80 → ap_renmai_guanyuan/90/90 → ap_dumai_mingmen/90/100 → ap_dumai_zhiyang/90/120 → ap_dumai_shendao/90/100 → ap_dumai_baihui/90/120` | 540 |
| D3I | defense | `[yin,harmony]` | `ap_shoutaiyin_yunmen/70/70 → ap_shoutaiyin_chize/70/80 → ap_shoutaiyin_taiyuan/70/90` | 210 |
| D4I | defense | `[yin,harmony]` | `ap_shoutaiyin_yunmen/75/70 → ap_shoutaiyin_chize/75/80 → ap_shoutaiyin_taiyuan/75/90 → ap_shoutaiyin_shaoshang/75/100` | 300 |
| D6I | defense | `[yin,harmony]` | `ap_shoutaiyin_yunmen/90/80 → ap_shoutaiyin_chize/90/90 → ap_shoutaiyin_taiyuan/90/100 → ap_shoutaiyin_shaoshang/90/120 → ap_shoujueyin_tianchi/90/100 → ap_shoujueyin_quze/90/120` | 540 |
| D3H | defense | `[yin,yang,harmony]` | `ap_daimai_zulinqi/70/70 → ap_daimai_weidao/70/80 → ap_daimai_daimai/70/90` | 210 |
| D4H | defense | `[yin,yang,harmony]` | `ap_daimai_zulinqi/75/70 → ap_daimai_weidao/75/80 → ap_daimai_daimai/75/90 → ap_dumai_zhiyang/75/100` | 300 |
| D6H | defense | `[yin,yang,harmony]` | `ap_daimai_zulinqi/90/80 → ap_daimai_weidao/90/90 → ap_daimai_daimai/90/100 → ap_dumai_zhiyang/90/120 → ap_shoujueyin_tianchi/90/100 → ap_shoujueyin_quze/90/120` | 540 |
| M4Y | movement | `[yang,harmony]` | `ap_zushaoyin_yongquan/60/60 → ap_zushaoyin_taixi/60/70 → ap_zutaiyang_weizhong/60/80 → ap_dumai_mingmen/60/90` | 240 |
| M6Y | movement | `[yang,harmony]` | `ap_zushaoyin_yongquan/65/70 → ap_zushaoyin_taixi/65/80 → ap_zutaiyang_weizhong/65/90 → ap_dumai_mingmen/65/100 → ap_shouyangming_quchi/65/110 → ap_shouyangming_shousanli/65/120` | 390 |
| M8Y | movement | `[yang,harmony]` | `ap_zushaoyin_yongquan/70/80 → ap_zushaoyin_taixi/70/90 → ap_zutaiyang_weizhong/70/100 → ap_dumai_mingmen/70/110 → ap_shouyangming_quchi/70/120 → ap_shouyangming_shousanli/70/130 → ap_shouyangming_hegu/70/140 → ap_shouyangming_shangyang/70/150` | 560 |
| M4I | movement | `[yin,harmony]` | `ap_zushaoyin_yongquan/60/60 → ap_zushaoyin_taixi/60/70 → ap_zutaiyang_weizhong/60/80 → ap_dumai_mingmen/60/90` | 240 |
| M6I | movement | `[yin,harmony]` | `ap_zushaoyin_yongquan/65/70 → ap_zushaoyin_taixi/65/80 → ap_zutaiyang_weizhong/65/90 → ap_dumai_mingmen/65/100 → ap_shoujueyin_tianchi/65/110 → ap_shoujueyin_quze/65/120` | 390 |
| M8I | movement | `[yin,harmony]` | `ap_zushaoyin_yongquan/70/80 → ap_zushaoyin_taixi/70/90 → ap_zutaiyang_weizhong/70/100 → ap_dumai_mingmen/70/110 → ap_shoujueyin_tianchi/70/120 → ap_shoujueyin_quze/70/130 → ap_shoujueyin_neiguan/70/140 → ap_shoujueyin_laogong/70/150` | 560 |
| M4H | movement | `[yin,yang,harmony]` | `ap_zushaoyin_yongquan/60/60 → ap_zushaoyin_taixi/60/70 → ap_zutaiyang_weizhong/60/80 → ap_dumai_mingmen/60/90` | 240 |
| M6H | movement | `[yin,yang,harmony]` | `ap_zushaoyin_yongquan/65/70 → ap_zushaoyin_taixi/65/80 → ap_zutaiyang_weizhong/65/90 → ap_dumai_mingmen/65/100 → ap_daimai_zulinqi/65/110 → ap_daimai_weidao/65/120` | 390 |
| M8H | movement | `[yin,yang,harmony]` | `ap_zushaoyin_yongquan/70/80 → ap_zushaoyin_taixi/70/90 → ap_zutaiyang_weizhong/70/100 → ap_dumai_mingmen/70/110 → ap_daimai_zulinqi/70/120 → ap_daimai_weidao/70/130 → ap_daimai_daimai/70/140 → ap_dumai_zhiyang/70/150` | 560 |

最紧组合 `1200+A10*=2000 CT`，地阶绝招 `1200+A8*=1840 CT`，支援绝招 `1200+D6*=1740 CT`，均满足 `design/21` §3.5。

### 15.3 天／地阶逐招路线（一）

每行等价于完整 `MeridianRouteDef`：`id/moveRef` 如表，其他字段按“绝／模板”与 §15.2 展开；相应 `moves[]` 写 `meridianRouteRef:id`。`mfr_*` 已依 Canon v1.3 §12／§18 与 V13-C01 正式登记，具体实例唯一归本文；路线属**（原创扩展）**，不反推小说经络事实。

| 武学 | moveRef | 路线 id | 绝／模板 |
|---|---|---|---|
| `sk_dugu9` | `mv_dugu9_zongjue` | `mfr_dugu9_zongjue` | 否／A6H |
| 〃 | `mv_dugu9_pojian` | `mfr_dugu9_pojian` | 否／A6H |
| 〃 | `mv_dugu9_podao` | `mfr_dugu9_podao` | 否／A6H |
| 〃 | `mv_dugu9_poqiang` | `mfr_dugu9_poqiang` | 否／A6H |
| 〃 | `mv_dugu9_pobian` | `mfr_dugu9_pobian` | 否／A6H |
| 〃 | `mv_dugu9_posuo` | `mfr_dugu9_posuo` | 否／A6H |
| 〃 | `mv_dugu9_pozhang` | `mfr_dugu9_pozhang` | 否／A6H |
| 〃 | `mv_dugu9_poanqi` | `mfr_dugu9_poanqi` | 是／见下表；`ultimate:true` |
| 〃 | `mv_dugu9_poqi` | `mfr_dugu9_poqi` | 是／见下表；`ultimate:true` |
| 〃 | `mv_dugu9_wuzhao` | `mfr_dugu9_wuzhao` | 是／见文首索引；`ultimate:true` |
| `sk_zixiashengong` | `mv_zixiashengong_chaoyang` | `mfr_zixiashengong_chaoyang` | 否／见 §15.4 AR-18 普通招式显式路线 |
| 〃 | `mv_zixiashengong_guangri` | `mfr_zixiashengong_guangri` | 是／见下表；`ultimate:true` |
| 〃 | `mv_zixiashengong_huti` | `mfr_zixiashengong_huti` | 否／见 §15.4 AR-18 普通招式显式路线 |
| 〃 | `mv_zixiashengong_changkong` | `mfr_zixiashengong_changkong` | 是／见文首索引；`ultimate:true` |
| `sk_taiyuesanqingfeng` | `mv_taiyuesanqingfeng_yifeng` | `mfr_taiyuesanqingfeng_yifeng` | 否／A4H |
| 〃 | `mv_taiyuesanqingfeng_erfeng` | `mfr_taiyuesanqingfeng_erfeng` | 否／A4H |
| 〃 | `mv_taiyuesanqingfeng_sanfeng` | `mfr_taiyuesanqingfeng_sanfeng` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_taiyuesanqingfeng_sanfengheyi` | `mfr_taiyuesanqingfeng_sanfengheyi` | 是／见文首索引；`ultimate:true` |
| `sk_hanbingzhenqi` | `mv_hanbingzhenqi_ningshuang` | `mfr_hanbingzhenqi_ningshuang` | 否／见 §15.4 外放普通招式覆写表 |
| 〃 | `mv_hanbingzhenqi_hanbingzhang` | `mfr_hanbingzhenqi_hanbingzhang` | 否／A6I |
| 〃 | `mv_hanbingzhenqi_fengmai` | `mfr_hanbingzhenqi_fengmai` | 是／见下表；`ultimate:true` |
| 〃 | `mv_hanbingzhenqi_fengyue` | `mfr_hanbingzhenqi_fengyue` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_hanbingzhenqi_huti` | `mfr_hanbingzhenqi_huti` | 否／D6I |
| `sk_daizongruhe` | `mv_daizongruhe_dai` | `mfr_daizongruhe_dai` | 否／A4H |
| 〃 | `mv_daizongruhe_qilu` | `mfr_daizongruhe_qilu` | 否／A4H |
| 〃 | `mv_daizongruhe_zaohua` | `mfr_daizongruhe_zaohua` | 否／D4H |
| 〃 | `mv_daizongruhe_yinyang` | `mfr_daizongruhe_yinyang` | 是／见文首索引；`ultimate:true` |
| `sk_baibianqianhuan` | `mv_baibianqianhuan_yunqi` | `mfr_baibianqianhuan_yunqi` | 否／A4I |
| 〃 | `mv_baibianqianhuan_wuhe` | `mfr_baibianqianhuan_wuhe` | 否／A4I |
| 〃 | `mv_baibianqianhuan_baibian` | `mfr_baibianqianhuan_baibian` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_baibianqianhuan_shisanshi` | `mfr_baibianqianhuan_shisanshi` | 是／见文首索引；`ultimate:true` |
| `sk_hengshanyunwubu` | `mv_hengshanyunwubu_ruwu` | `mfr_hengshanyunwubu_ruwu` | 否／M6H |
| 〃 | `mv_hengshanyunwubu_huifeng` | `mfr_hengshanyunwubu_huifeng` | 否／M6H |
| 〃 | `mv_hengshanyunwubu_yunying` | `mfr_hengshanyunwubu_yunying` | 否／D4H |
| 〃 | `mv_hengshanyunwubu_wusuo` | `mfr_hengshanyunwubu_wusuo` | 是／见文首索引；支援绝招；`ultimate:true` |
| `sk_wanhuajianfa` | `mv_wanhuajianfa_bingdi` | `mfr_wanhuajianfa_bingdi` | 否／A4I |
| 〃 | `mv_wanhuajianfa_hurui` | `mfr_wanhuajianfa_hurui` | 否／D4I |
| 〃 | `mv_wanhuajianfa_luoying` | `mfr_wanhuajianfa_luoying` | 否／A4I |
| 〃 | `mv_wanhuajianfa_husheng` | `mfr_wanhuajianfa_husheng` | 是／见文首索引；`ultimate:true` |

### 15.4 天／地阶逐招路线（二）

下表延续 §15.3 的展开与镜像规则；两表合计 **16 门、72 招**，每门恰有至少一条 `ultimate:true` 路线。

| 武学 | moveRef | 路线 id | 绝／模板 |
|---|---|---|---|
| `sk_xixing` | `mv_xixing_xixing` | `mfr_xixing_xixing` | 否／见下表 |
| 〃 | `mv_xixing_fanxi` | `mfr_xixing_fanxi` | 否／见下表 |
| 〃 | `mv_xixing_sangong` | `mfr_xixing_sangong` | 是／见下表；`ultimate:true` |
| 〃 | `mv_xixing_wanliu` | `mfr_xixing_wanliu` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_xixing_huajie` | `mfr_xixing_huajie` | 否／见下表 |
| `sk_kuihua` | `mv_kuihua_feizhen` | `mfr_kuihua_feizhen` | 否／见下表 |
| 〃 | `mv_kuihua_guimei` | `mfr_kuihua_guimei` | 否／见下表 |
| 〃 | `mv_kuihua_cimu` | `mfr_kuihua_cimu` | 是／见下表；`ultimate:true` |
| 〃 | `mv_kuihua_wanzhen` | `mfr_kuihua_wanzhen` | 是／见文首索引；`ultimate:true` |
| `sk_heimuyajianfa` | `mv_heimuyajianfa_yatu` | `mfr_heimuyajianfa_yatu` | 否／A4I |
| 〃 | `mv_heimuyajianfa_duanlu` | `mfr_heimuyajianfa_duanlu` | 否／A4I |
| 〃 | `mv_heimuyajianfa_yexi` | `mfr_heimuyajianfa_yexi` | 否／A4I |
| 〃 | `mv_heimuyajianfa_lingkong` | `mfr_heimuyajianfa_lingkong` | 是／见文首索引；`ultimate:true` |
| `sk_qixianwuxingjian` | `mv_qixianwuxingjian_fanyin` | `mfr_qixianwuxingjian_fanyin` | 否／见下表 |
| 〃 | `mv_qixianwuxingjian_luanxian` | `mfr_qixianwuxingjian_luanxian` | 否／见下表 |
| 〃 | `mv_qixianwuxingjian_wuxing` | `mfr_qixianwuxingjian_wuxing` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_qixianwuxingjian_qiming` | `mfr_qixianwuxingjian_qiming` | 是／见文首索引；`ultimate:true` |
| `sk_bixie` | `mv_bixie_liuxingganyue` | `mfr_bixie_liuxingganyue` | 否／A6I |
| 〃 | `mv_bixie_huakaijianfo` | `mfr_bixie_huakaijianfo` | 否／A6I |
| 〃 | `mv_bixie_feiyanchuanliu` | `mfr_bixie_feiyanchuanliu` | 是／见文首索引；`ultimate:true` |
| 〃 | `mv_bixie_qunxie` | `mfr_bixie_qunxie` | 是／见文首索引；`ultimate:true` |
| `sk_fantianzhang` | `mv_fantianzhang_tuotian` | `mfr_fantianzhang_tuotian` | 否／A4Y |
| 〃 | `mv_fantianzhang_fanzhang` | `mfr_fantianzhang_fanzhang` | 否／A4Y |
| 〃 | `mv_fantianzhang_zhibei` | `mfr_fantianzhang_zhibei` | 否／A4Y |
| 〃 | `mv_fantianzhang_fudi` | `mfr_fantianzhang_fudi` | 是／见文首索引；`ultimate:true` |
| `sk_qingchengcuixinzhang` | `mv_qingchengcuixinzhang_touxin` | `mfr_qingchengcuixinzhang_touxin` | 否／A4I |
| 〃 | `mv_qingchengcuixinzhang_zhenmai` | `mfr_qingchengcuixinzhang_zhenmai` | 否／A4I |
| 〃 | `mv_qingchengcuixinzhang_yinzhang` | `mfr_qingchengcuixinzhang_yinzhang` | 否／见下表 |
| 〃 | `mv_qingchengcuixinzhang_duanmai` | `mfr_qingchengcuixinzhang_duanmai` | 是／见文首索引；`ultimate:true` |
| `sk_wuxianbaidugong` | `mv_wuxianbaidugong_cuizhang` | `mfr_wuxianbaidugong_cuizhang` | 否／见下表 |
| 〃 | `mv_wuxianbaidugong_huti` | `mfr_wuxianbaidugong_huti` | 否／见下表 |
| 〃 | `mv_wuxianbaidugong_duyin` | `mfr_wuxianbaidugong_duyin` | 否／见下表 |
| 〃 | `mv_wuxianbaidugong_wangu` | `mfr_wuxianbaidugong_wangu` | 是／见文首索引；`ultimate:true` |

#### AR-18 普通招式显式路线

下列路线覆盖 §15.2 通用模板：保留改前模板的出招方式、动作关键末端、段数、逐段 CT、逐段风险与路线用途，只调整体段使路线性质匹配所属武学；均为**（原创扩展）**。

| 武学 | moveRef | 路线 ID | ultimate / purpose / requiredNature | 显式 steps（`acupointRef/segmentCt/riskBp`） | 段数 | 路线 CT |
|---|---|---|---|---|---:|---:|
| `sk_zixiashengong` | `mv_zixiashengong_chaoyang` | `mfr_zixiashengong_chaoyang` | `false` / `defense` / `[yin,yang,harmony]` | `ap_renmai_qihai/75/70 → ap_yinqiao_zhaohai/75/80 → ap_dumai_shendao/75/90 → ap_dumai_baihui/75/100` | 4 | 300 |
| `sk_zixiashengong` | `mv_zixiashengong_huti` | `mfr_zixiashengong_huti` | `false` / `defense` / `[yin,yang,harmony]` | `ap_renmai_qihai/90/80 → ap_yinqiao_jiaoxin/90/90 → ap_shoujueyin_neiguan/90/100 → ap_dumai_mingmen/90/120 → ap_yangwei_tianliao/90/100 → ap_dumai_baihui/90/120` | 6 | 540 |
| `sk_xixing` | `mv_xixing_xixing` | `mfr_xixing_xixing` | `false` / `attack` / `[yin,yang,harmony]` | `ap_chongmai_qichong/75/100 → ap_daimai_weidao/75/100 → ap_dumai_mingmen/75/100 → ap_shoushaoyang_waiguan/75/120 → ap_shoutaiyin_chize/75/100 → ap_shoutaiyin_shaoshang/75/120` | 6 | 450 |
| `sk_xixing` | `mv_xixing_fanxi` | `mfr_xixing_fanxi` | `false` / `defense` / `[yin,yang,harmony]` | `ap_renmai_qihai/90/80 → ap_yinqiao_zhaohai/90/90 → ap_dumai_mingmen/90/100 → ap_dumai_zhiyang/90/120 → ap_shoushaoyang_waiguan/90/100 → ap_shoujueyin_quze/90/120` | 6 | 540 |
| `sk_xixing` | `mv_xixing_huajie` | `mfr_xixing_huajie` | `false` / `defense` / `[yin,yang,harmony]` | `ap_renmai_zhongwan/90/80 → ap_chongmai_qichong/90/90 → ap_daimai_weidao/90/100 → ap_dumai_shendao/90/120 → ap_shouyangming_hegu/90/100 → ap_shoujueyin_quze/90/120` | 6 | 540 |
| `sk_kuihua` | `mv_kuihua_feizhen` | `mfr_kuihua_feizhen` | `false` / `attack` / `[yang,harmony]` | `ap_dumai_mingmen/75/100 → ap_yangqiao_shenmai/75/100 → ap_yangwei_tianliao/75/100 → ap_shoushaoyang_waiguan/75/120 → ap_shoutaiyang_wangu/75/100 → ap_shoutaiyin_shaoshang/75/120` | 6 | 450 |
| `sk_kuihua` | `mv_kuihua_guimei` | `mfr_kuihua_guimei` | `false` / `movement` / `[yang,harmony]` | `ap_zushaoyin_yongquan/65/70 → ap_zutaiyang_weizhong/65/80 → ap_yangqiao_fuyang/65/90 → ap_yangqiao_shenmai/65/100 → ap_dumai_mingmen/65/110 → ap_shoujueyin_quze/65/120` | 6 | 390 |
| `sk_wuxianbaidugong` | `mv_wuxianbaidugong_huti` | `mfr_wuxianbaidugong_huti` | `false` / `defense` / `[yin,yang,harmony]` | `ap_renmai_qihai/75/70 → ap_dumai_mingmen/75/80 → ap_shouyangming_hegu/75/90 → ap_shoutaiyin_shaoshang/75/100` | 4 | 300 |

#### 外放普通招式显式路线

下列覆写优先于 §15.2／§15.5 的通用模板，保持原品阶段数、总 CT、性质与 `purpose:attack`，只把气劲、掌劲或音劲出口收束到 `design/21` §4.4.1 白名单；均为**（原创扩展）**。

| 武学 | moveRef | 路线 ID | requiredNature | 显式 steps（`acupointRef/segmentCt/riskBp`） | 段数 | 路线 CT |
|---|---|---|---|---|---:|---:|
| `sk_hanbingzhenqi` | `mv_hanbingzhenqi_ningshuang` | `mfr_hanbingzhenqi_ningshuang` | `[yin,harmony]` | `ap_daimai_zulinqi/75/100 → ap_daimai_weidao/75/100 → ap_zujueyin_xingjian/75/100 → ap_shoujueyin_quze/75/120 → ap_shoujueyin_neiguan/75/100 → ap_shoujueyin_laogong/75/120` | 6 | 450 |
| `sk_xiaoaojianghuqu` | `mv_xiaoaojianghuqu_he` | `mfr_xiaoaojianghuqu_he` | `[yin,yang,harmony]` | `ap_chongmai_yindu/70/90 → ap_daimai_zhangmen/70/90 → ap_shoujueyin_neiguan/70/90 → ap_shoushaoyang_yangchi/70/90` | 4 | 280 |
| `sk_qixianwuxingjian` | `mv_qixianwuxingjian_fanyin` | `mfr_qixianwuxingjian_fanyin` | `[yin,harmony]` | `ap_shoutaiyin_yunmen/70/90 → ap_shoutaiyin_chize/70/90 → ap_shoutaiyin_taiyuan/70/90 → ap_shoutaiyin_shaoshang/70/90` | 4 | 280 |
| `sk_qixianwuxingjian` | `mv_qixianwuxingjian_luanxian` | `mfr_qixianwuxingjian_luanxian` | `[yin,harmony]` | `ap_shoutaiyin_yunmen/70/90 → ap_shoutaiyin_chize/70/90 → ap_shoujueyin_neiguan/70/90 → ap_shoujueyin_laogong/70/90` | 4 | 280 |
| `sk_qingchengcuixinzhang` | `mv_qingchengcuixinzhang_yinzhang` | `mfr_qingchengcuixinzhang_yinzhang` | `[yin,harmony]` | `ap_zujueyin_xingjian/70/90 → ap_zujueyin_taichong/70/90 → ap_shoujueyin_neiguan/70/90 → ap_shoujueyin_laogong/70/90` | 4 | 280 |
| `sk_wuxianbaidugong` | `mv_wuxianbaidugong_cuizhang` | `mfr_wuxianbaidugong_cuizhang` | `[yin,yang,harmony]` | `ap_zujueyin_ligou/70/90 → ap_zujueyin_zhongfeng/70/90 → ap_shoujueyin_neiguan/70/90 → ap_shoujueyin_laogong/70/90` | 4 | 280 |
| `sk_wuxianbaidugong` | `mv_wuxianbaidugong_duyin` | `mfr_wuxianbaidugong_duyin` | `[yin,yang,harmony]` | `ap_zujueyin_ququan/70/90 → ap_zujueyin_xingjian/70/90 → ap_shoujueyin_quze/70/90 → ap_shoujueyin_zhongchong/70/90` | 4 | 280 |

#### 同门第二／第三绝招显式路线

下表只展开同门中未保留原模板者；各路以不同穴序、CT、风险承载不同职责。

| 武学 | moveRef | 路线 ID | purpose | 职责 | 显式步骤（`ap_*/CT/风险`） | 段数 | 路线 CT | 收招 + 路线 |
|---|---|---|---|---|---|---:|---:|---:|
| `sk_dugu9` | `mv_dugu9_poanqi` | `mfr_dugu9_poanqi` | attack | 投射反制 | 见文首索引 | 10 | 800 | 2000；`ultimate:true` |
| 〃 | `mv_dugu9_poqi` | `mfr_dugu9_poqi` | attack | 护体破阵 | 见文首索引 | 10 | 800 | 2000；`ultimate:true` |
| `sk_zixiashengong` | `mv_zixiashengong_guangri` | `mfr_zixiashengong_guangri` | attack | 远程点杀 | 见文首索引 | 8 | 600 | 1800；`ultimate:true` |
| `sk_hanbingzhenqi` | `mv_hanbingzhenqi_fengmai` | `mfr_hanbingzhenqi_fengmai` | attack | 单体封内 | 见文首索引 | 8 | 600 | 1800；`ultimate:true` |
| `sk_xixing` | `mv_xixing_sangong` | `mfr_xixing_sangong` | attack | 单体散功 | 见文首索引 | 10 | 750 | 1950；`ultimate:true` |
| `sk_kuihua` | `mv_kuihua_cimu` | `mfr_kuihua_cimu` | attack | 单体致盲 | 见文首索引 | 10 | 700 | 1900；`ultimate:true` |
| `sk_bixie` | `mv_bixie_feiyanchuanliu` | `mfr_bixie_feiyanchuanliu` | attack | 穿线位移 | 见文首索引 | 10 | 700 | 1900；`ultimate:true` |

### 15.5 玄／黄阶路线模板绑定

除玄上绝招须在下方逐条显式绑定外，其余玄、黄阶不逐招重列路线，按 `design/21` §4.2 的品阶段数边界引用下表。构建器须先为紧凑卡／一行卡每招分配完整 `mv_<skill-body>_<move-body>`，再生成唯一 `mfr_<skill-body>_<move-body>` 并展开 §15.2；伤害=`attack`，护盾／招架／卸力／护体／纯治疗驱散=`defense`，纯位移／换位／脱离／闪避身法=`movement`。

| 大阶／性质 | 非绝招 | 已有绝招可用模板 |
|---|---|---|
| 玄·阳 | `A4Y`；防 `D4Y`；身法 `M4Y` | `A6Y/D6Y/M6Y` |
| 玄·阴 | `A4I`；防 `D4I`；身法 `M4I` | `A6I/D6I/M6I` |
| 玄·调和或 neutral | `A4H`；防 `D4H`；身法 `M4H` | `A6H/D6H/M6H` |
| 黄·阳 | `A4Y`；防 `D3Y`；身法 `M4Y` | 不新增绝招 |
| 黄·阴 | `A4I`；防 `D3I`；身法 `M4I` | 不新增绝招 |
| 黄·调和或 neutral | `A4H`；防 `D3H`；身法 `M4H` | 不新增绝招 |

玄上 15 门各确认一记既有招式为绝招；具体步骤以文首索引为唯一来源。每条均为 6 段、单段 100 CT，路线 `6×100=600 CT`，`1200+600=1800≤2000 CT`；风险列均为 `[100,120,140,160,180,200]`，总风险 900。

| 武学 | moveRef | 路线 id | 模板或显式穴位序列 | 段数 | 单段 CT | 路线 CT | 风险 |
|---|---|---|---|---:|---:|---:|---|
| `sk_huashanjianfa` | `mv_huashanjianfa_jinyan` | `mfr_huashanjianfa_jinyan` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_yangwujian` | `mv_yangwujian_haoran` | `mfr_yangwujian_haoran` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_huashanxinfa` | `mv_huashanxinfa_qiyujian` | `mfr_huashanxinfa_qiyujian` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_kuangfengkuaijian` | `mv_kuangfengkuaijian_yijian` | `mfr_kuangfengkuaijian_yijian` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_songshanjianfa` | `mv_songshanjianfa_kaimen` | `mfr_songshanjianfa_kaimen` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_songyangxinfa` | `mv_songyangxinfa_junyue` | `mfr_songyangxinfa_junyue` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_taishanjianfa` | `mv_taishanjianfa_dongyue` | `mfr_taishanjianfa_dongyue` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_xiaoaojianghuqu` | `mv_xiaoaojianghuqu_tongsheng` | `mfr_xiaoaojianghuqu_tongsheng` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_huifengluoyan` | `mv_huifengluoyan_luoyan` | `mfr_huifengluoyan_luoyan` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_hengshanbeijianfa` | `mv_hengshanbeijianfa_shoumenhu` | `mfr_hengshanbeijianfa_shoumenhu` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_riyuejianfa` | `mv_riyuejianfa_yueluo` | `mfr_riyuejianfa_yueluo` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_riyuexinfa` | `mv_riyuexinfa_riyue` | `mfr_riyuexinfa_riyue` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_songfengjianfa` | `mv_songfengjianfa_fengguoqingcheng` | `mfr_songfengjianfa_fengguoqingcheng` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_wuxianduzhang` | `mv_wuxianduzhang_huifengduwu` | `mfr_wuxianduzhang_huifengduwu` | 见文首索引 | 6 | 100 | 600 | 900；`ultimate:true` |
| `sk_wanliduxing` | `mv_wanliduxing_yuandun` | `mfr_wanliduxing_yuandun` | 见文首索引；`purpose:movement` | 6 | 100 | 600 | 900；`ultimate:true` |

模板不创造或取消 `ultimate:true`。同招只生成一条主路线；若被动触发另需防守／移动发力，才另挂 `routeOnTriggerRef`，不得让同一 `mfr_*` 兼任两种 purpose。

### 15.6 轻功速度路线

下列 12 门轻功顶层补 `SkillDef.movementRouteRef`；主动招没有逐招覆写时继承顶层路线。所有 ID 均已依 Canon v1.3 正式登记，具体实例唯一归本文，`steps` 由 §15.2 完整展开。

| 轻功 | movementRouteRef | 模板 | 核算 |
|---|---|---|---|
| `sk_huashanxingbu` | `mfr_huashanxingbu` | M4H | `4×60=240 CT`；`1000+240=1240≤2000` |
| `sk_songshanxingbu` | `mfr_songshanxingbu` | M4H | 同上 |
| `sk_taishan18pan` | `mfr_taishan18pan` | M4H | 同上 |
| `sk_shibanshanbu` | `mfr_shibanshanbu` | M4H | 同上 |
| `sk_hengshanyunwubu` | `mfr_hengshanyunwubu` | M8H | `8×70=560 CT`；`1000+560=1560≤2000` |
| `sk_hengshanqingbu` | `mfr_hengshanqingbu` | M4H | `4×60=240 CT`；`1000+240=1240≤2000` |
| `sk_hengshanbeishenfa` | `mfr_hengshanbeishenfa` | M4H | 同上 |
| `sk_hengshanbeibu` | `mfr_hengshanbeibu` | M4H | 同上 |
| `sk_shenjiaobu` | `mfr_shenjiaobu` | M4H | 同上 |
| `sk_tangzibu` | `mfr_tangzibu` | M4H | 同上 |
| `sk_qingchengshanjingbu` | `mfr_qingchengshanjingbu` | M4H | 同上 |
| `sk_wanliduxing` | `mfr_wanliduxing` | M6H | `6×65=390 CT`；`1000+390=1390≤2000` |

速度只消费 `design/21` §4.9 已完成同路线 STD 归一的 Profile：标准 10000 bp、硬界 6500–13500；封路至多 6500、胀损至多 8000。先经脉后擒拿，`evadeRatingDelta` 只计经脉一次；`openingQinggong` 与面板／门禁继续由 `design/03`、`design/08` 提供，不把经脉倍率重复塞回 `Q_skill`。

### 15.7 内功调息档案与护体内劲

每个 `txp_*` 是 Canon v1.3 已登记的调息档案，具体实例唯一归本文；字段按 `design/21` §10／§12.1 为 `id/grade/layer/nature/scope/ct/mpCostBp/outOfBattleScaleBp`；统一 `layer:10, ct:1000, mpCostBp:0, outOfBattleScaleBp:15000`。scope 默认黄 1、玄 2、地／天 3；`reliefBp/repairUnits` 不写死入档案，以下仅列满层验算。调和 `natureBp=10500`，其余 10000。

| 内功 | breathProfileRef | g／性质／scope | innerGuard | 满层基础调息 `relief/repair` |
|---|---|---|---|---|
| `sk_zixiashengong` | `txp_zixiashengong` | 9／harmony／3 | `{enabled:true,reflectBp:0}` | `floor(2200×1.05)=2310/floor(516×1.05)=541`；`outOfBattleScaleBp:15000` |
| `sk_huashanxinfa` | `txp_huashanxinfa` | 6／yin／2 | `{enabled:true,reflectBp:0}` | `1900/444`；`outOfBattleScaleBp:15000` |
| `sk_huashantuna` | `txp_huashantuna` | 3／yin／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_hanbingzhenqi` | `txp_hanbingzhenqi` | 9／yin／3 | `{enabled:true,reflectBp:0}` | `2200/516`；`outOfBattleScaleBp:15000` |
| `sk_songyangxinfa` | `txp_songyangxinfa` | 6／yang／2 | `{enabled:true,reflectBp:0}` | `1900/444`；`outOfBattleScaleBp:15000` |
| `sk_songyangtuna` | `txp_songyangtuna` | 3／yang／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_taishanxinfa` | `txp_taishanxinfa` | 5／yang／2 | `{enabled:true,reflectBp:0}` | `1800/420`；`outOfBattleScaleBp:15000` |
| `sk_taishantuna` | `txp_taishantuna` | 3／yang／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_hengshanxinfa` | `txp_hengshanxinfa` | 5／yin／2 | `{enabled:true,reflectBp:0}` | `1800/420`；`outOfBattleScaleBp:15000` |
| `sk_hengshantuna` | `txp_hengshantuna` | 3／yin／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_hengshanbeixinfa` | `txp_hengshanbeixinfa` | 5／yin／2 | `{enabled:true,reflectBp:0}` | `1800/420`；`outOfBattleScaleBp:15000` |
| `sk_hengshanbeituna` | `txp_hengshanbeituna` | 3／yin／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |

| 内功 | breathProfileRef | g／性质／scope | innerGuard | 满层基础调息 `relief/repair` |
|---|---|---|---|---|
| `sk_xixing` | `txp_xixing` | 11／harmony／3 | `{enabled:true,reflectBp:0}` | `clamp(floor(2400×1.05),500,2500)=2500/floor(564×1.05)=592`；`outOfBattleScaleBp:15000` |
| `sk_kuihua` | `txp_kuihua` | 11／yang／3 | `{enabled:true,reflectBp:0}` | `2400/564`；`outOfBattleScaleBp:15000` |
| `sk_riyuexinfa` | `txp_riyuexinfa` | 6／harmony／2 | `{enabled:true,reflectBp:0}` | `floor(1900×1.05)=1995/floor(444×1.05)=466`；`outOfBattleScaleBp:15000` |
| `sk_heimutuna` | `txp_heimutuna` | 3／harmony／1 | `{enabled:true,reflectBp:0}` | `floor(1600×1.05)=1680/floor(372×1.05)=390`；`outOfBattleScaleBp:15000` |
| `sk_biaojuxinfa` | `txp_biaojuxinfa` | 3／yang／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_qingchengxinfa` | `txp_qingchengxinfa` | 5／yin／2 | `{enabled:true,reflectBp:0}` | `1800/420`；`outOfBattleScaleBp:15000` |
| `sk_qingchengtuna` | `txp_qingchengtuna` | 3／yin／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |
| `sk_wuxianbaidugong` | `txp_wuxianbaidugong` | 7／harmony／3 | `{enabled:true,reflectBp:0}` | `floor(2000×1.05)=2100/floor(468×1.05)=491`；`outOfBattleScaleBp:15000` |
| `sk_wuxiantuna` | `txp_wuxiantuna` | 3／yin／1 | `{enabled:true,reflectBp:0}` | `1600/372`；`outOfBattleScaleBp:15000` |

满层验算统一为 `relief=clamp(floor((500+100g+80×10)×natureBp/10000),500,2500)`、`repair=floor((120+24g+18×10)×natureBp/10000)`。`enabled:true` 只表示主运具备护体档，仍须合法自然护体短路或 defense 路线；封路／胀损不能绕过。本文 21 门内功均无既有“固定伤害反震”语义，故 `reflectBp:0`；寒冰近身施寒与吸星反吸继续走原效果钩子，不冒充反震。抵消顺序、拳脚／兵器／暗器／外放适用率、`1 MP:2 伤害` 与击穿迟滞只引用 `design/21` §4.8。

## 16. 本文新增术语与 ID

### 16.1 武学、招式与被动

| 类别 | 数量 | 登记 |
|---|---:|---|
| 本文定义武学 `sk_*` | **88** | 天 4、地 12、玄 36、黄 36；完整清单以 §2–§11 的标题卡与条目表为准 |
| 其中沿用上游固定 / 既有建议 ID | **6** | 基准 §13 固定：`sk_dugu9`、`sk_xixing`、`sk_kuihua`、`sk_bixie`；`design/08` / `design/09` 先行建议：`sk_wanliduxing`、`sk_xiaoaojianghuqu`，正式定义均归本文 |
| 本文新确立的武学 ID | **82** | 除上列 6 个外，§2–§11 的全部武学 ID；入库前仍由全局构建器作最终唯一性检查 |
| 跨组只引用、不定义 | **5** | `sk_yijinjing`、`sk_taijiquan`、`sk_taijijian`、`sk_dagou`、`sk_cuixinzhang` |
| 本文登记招式 `mv_*` | **76**（首次新增 64；沿用 12） | 天 / 地完整卡及曲谱重点卡的招式；绝招调整只升格既有招式，未新增招式。紧凑卡短名数据化时展开为所属武学前缀 |
| 本文登记被动 `ps_*` | **56**（首次新增 51；沿用 5） | 天 / 地完整卡及曲谱重点卡的被动；均以所属武学 ID 为前缀 |

新确立的 82 个 `sk_*` 按组织汇总如下，避免正文再复制一份 82 行主数据：

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

### 16.2 套装、门派与经脉接口

| 类别 | 数量 | ID | 状态 |
|---|---:|---|---|
| 新套装候选 | 14 | `set_huashan_qijian`、`set_songshan_hanbing`、`legacy-set:taishan_daizong`、`legacy-set:hengshan_yunwu`、`legacy-set:hengshan_cibei`、`set_riyue_heimu`、`legacy-set:meizhuang_siyou`、`legacy-set:renwoxing`、`legacy-set:dongfang_kuihua`、`set_linjia_bixie`、`legacy-set:qingcheng_songfeng`、`legacy-set:wuxian_baidu`、`legacy-set:xiaoao_qinxiao`、`legacy-set:xiaoao_yiren` | 本体交 `design/07`；本文已登记武学侧 `setTags` |
| 跨组既有套装 | 1 | `set_dugu_jianzhong` | 定义见 `catalog/skills-daojia` §7；本文补 `sk_dugu9` 反向标签 |
| 门派 ID | 9 | `sect_huashan`、`sect_songshan`、`sect_taishan`、`sect_hengshan_nan`、`sect_hengshan_bei`、`sect_riyue`、`sect_fuwei`、`sect_qingcheng`、`sect_wuxian` | 全部沿用 `rulings-v1` §3，并已与 `design/17` §3 的笑傲 `O` 状态及 §6/§8/§9 的模板核对；非本文新增 |
| 经脉正式引用 | 10 | `mer_renmai`、`mer_dumai`、`mer_chongmai`、`mer_daimai`、`mer_shoutaiyin`、`mer_shoushaoyin`、`mer_zuyangming`、`mer_zushaoyang`、`mer_zutaiyin`、`mer_zujueyin` | 已全部命中 `design/15` 正式 ID；本文不定义经脉 |
| 经脉路线 `mfr_*` | 99 个正式实例 | §15.3–§15.4 天／地逐招72、§15.5玄上绝招15、§15.6轻功12；其余玄黄按§15.5数据化生成 | 前缀与 schema 归 Canon／`design/21`，具体实例依 V13-C01 归本文，不计武学／招式数 |
| 调息档案 `txp_*` | 21 个正式实例 | §15.7 逐门绑定 | 前缀与 schema 归 Canon／`design/21`，具体实例依 V13-C01 归本文，不替代内功 `sk_*` |
| 新 Buff | **0** | — | 正文引用 41 个唯一 `bf_*`，均已在 `design/06` 或 `rulings-v1` A5 登记 |

### 16.3 既有系统 ID 与语义钩子

- `vow_duanchen`、`autoGroup:dugu_po`、`rx_hanbingxixing` 均为既有 ID / 约定，不计本文新增。
- `special.optionalCombo` 表示《笑傲江湖》曲谱可单人使用、双人合奏只获强化；`special.equipSynergy` 表示七弦无形剑读取 `eq_qixianqin` 的既有装备联动；`special.cost:yizhongZhenqi` 是对 05 §9.1.3 吸星代价的简写。三者需要技术 schema 用现有扩展字段承载，若 schema 不接受对象键，应迁移为 `effects` / `conditions`，不得静默丢失语义。

---

### 正式套装反向标签镜像（全局审计）

下表仅镜像 `design/07` §8.4 的正式成员关系，供构建与 lint 读取；不是第二份武学定义。历史候选只以 `legacy-set:<slug>` 保留，不得写入运行态 `setTags`。

| 武学 ID | setTags |
|---|---|
| `sk_biaojuxinfa` | `set_linjia_bixie` |
| `sk_bixie` | `set_linjia_bixie` |
| `sk_dagou` | `set_gaibang_bangzhu` |
| `sk_dayinyangshou` | `set_songshan_hanbing` |
| `sk_dugu9` | `set_dugu_jianzhong` |
| `sk_fantianzhang` | `set_linjia_bixie` |
| `sk_hanbingzhenqi` | `set_songshan_hanbing` |
| `sk_heimutuna` | `set_riyue_heimu` |
| `sk_heimuyajianfa` | `set_riyue_heimu` |
| `sk_heimuyarumenjian` | `set_riyue_heimu` |
| `sk_huashanjianfa` | `set_huashan_qijian` |
| `sk_huashanrumenjian` | `set_huashan_qijian` |
| `sk_huashantuna` | `set_huashan_qijian` |
| `sk_huashanxinfa` | `set_huashan_qijian` |
| `sk_kuangfengkuaijian` | `set_huashan_qijian` |
| `sk_kuihua` | `set_linjia_bixie`、`set_riyue_heimu` |
| `sk_linjiajianfa` | `set_linjia_bixie` |
| `sk_linjiarumenjian` | `set_linjia_bixie` |
| `sk_linjiashou` | `set_linjia_bixie` |
| `sk_riyuejianfa` | `set_riyue_heimu` |
| `sk_riyuexinfa` | `set_riyue_heimu` |
| `sk_songshanjianfa` | `set_songshan_hanbing` |
| `sk_songshanrumenjian` | `set_songshan_hanbing` |
| `sk_songyangtuna` | `set_songshan_hanbing` |
| `sk_songyangxinfa` | `set_songshan_hanbing` |
| `sk_taijijian` | `set_wudang_taiji` |
| `sk_taijiquan` | `set_wudang_taiji` |
| `sk_taiyuesanqingfeng` | `set_huashan_qijian` |
| `sk_xixing` | `set_riyue_heimu` |
| `sk_yangwujian` | `set_huashan_qijian` |
| `sk_yijinjing` | `set_fangzheng`、`set_saodiseng`、`set_shaolin_damo`、`set_shaolin_jingang` |

## 17. 数据校验规则与测试用例

### 17.1 构建期校验

| # | 规则 | 期望 |
|---|---|---|
| WU-V01 | 提取定义位的 `sk_*` 并按 ID 去重 | 恰 88；天/地/玄/黄恰为 4/12/36/36 |
| WU-V02 | `grade>=10` 与基准 §13 集合、品阶、原生书界比对 | 只允许 `sk_dugu9:12`、`sk_xixing:11`、`sk_kuihua:11`、`sk_bixie:10`，均为 `ch05_xiaoao` |
| WU-V03 | `category/subType/nature/origin` 枚举检查 | 内功 `nature` 只能 `yin/yang/harmony`；非内功可 `neutral`；不得出现中文枚举值 |
| WU-V04 | `reqs` schema 检查 | `sect:{id,rank}`；技艺键仅限 C17 白名单；`prereq` 外层 AND、`anyOf` 内层 OR；`hard` 路径必须存在 |
| WU-V05 | 前置图做拓扑与来源可达性检查 | 禁止自依赖、空 OR、无入口闭环；§1.2 九条黄→玄→地链均可达 |
| WU-V06 | 完整卡的 `wOut+wIn`、`layerStats`、绝招层数与数量 | 和为1；地≤15、天≤20；天上/天中/天下为3/2/2记，地上2记、地中按统一裁定表取1或2记、地下1记，玄上1记，核心首绝招≤7重 |
| WU-V07 | 招式预算复算 | 独孤六式按 CN-05 以罕见条件 +0.30 复算为 1.147，配置 1.10 差 −0.047；其余完整卡伤害招与公式差≤0.05；玄阶抽样覆盖≥30%；黄阶按节模板复核 |
| WU-V08 | 内功贡献 | 21 门均有 `nature`；完整卡有 `inner.contribution` 且 IP 在品阶预算±5%；紧凑卡写 IP 核算值 |
| WU-V09 | Buff 外键 | 正文每个 `bf_*` 必须存在于 06 或 A5，施加品阶默认 `inherit` |
| WU-V10 | 套装双向闭合 | §12 每个成员在武学卡有同名 `setTags`，反向亦然；跨组 `set_dugu_jianzhong` 特判到道家图鉴 |
| WU-V11 | 组织最低内容 | 九个组织各有黄阶入门拳或剑、黄→玄→地链和套装候选 |
| WU-V12 | 书界装配池 | 笑傲本土内/拳/兵分别≥3；最高原生轻功≤8；地阶代价/誓约≤5%、必需合击≤3% |
| WU-V13 | 敌人专用隔离 | `enemyOnly:true` 不进入 88 门统计；本文期望为 0 |
| WU-V14 | ID 全局唯一 | 本文新确立的 82 个 `sk_*` 不得在其他图鉴再次定义；上游名录 / 建议引用不误报为重复定义 |
| WU-V15 | Markdown 完整性 | 表头列数一致，围栏成对，目录标题连续，无截断句和占位词 |
| WU-V16 | 招式路线覆盖 | §15.3–§15.4 恰有16门、72个唯一天地 `moveRef`／`mfr_*`；§15.5另有15记玄上绝招显式路线；路线 `ultimate` 镜像原招真值 |
| WU-V17 | 路线结构与时间 | 展开后每条 1–18 段、穴位不重复、`segmentCt 40–120`、`riskBp 0–1200`，且 `recovery+ΣsegmentCt≤2000` |
| WU-V18 | 轻功／内功接口 | 12 门轻功各有唯一 movement 路线；21 门内功各有性质匹配的 `txp_*` 与 `innerGuard`，且内功不得配置来袭侧 `breakGuardBp` |
| WU-V19 | 外放静态契约 | §13.5 每条 `projected` 均须有 `projection:true`、0 档 `range/aoe`、恰三项且 `[0]` 深等于 `aoe` 的 `projectionSpreadSteps`、所有伤害段 `DamageKind:'projected'` 与唯一 attack 路线；`not_projected`／待考不得携带外放字段 |
| WU-V20 | 外放路线与覆盖 | 13 条 `projected` 路线各至少含 `design/21` §4.4.1.4 白名单穴，且掌／指／持械／音劲末端符合 §4.2.1；审计表按 `moveId` 严格排序、结论计数为 13，天／地／玄／黄为 1／10／2／0 |
| WU-V21 | AR-17 音功分支 | 六记伤敌音功均同时含 `tags:[sonic]` 与 `projection:true`；0 档固定 `projectionBoostActive=false`、基础 `aoe/range`、零外放增耗并走普通 Z5M，1／2 档才启用外放曲线与扩张；清音、合奏支援和实体笔招不得误标 |
| WU-V22 | 动作末端与跨武学多样性 | 对41条绝招路线按 `design/21` §4.3.1 校验；掌含劳宫、指含指端、腿含足三阳、持械含腕部导引、内功攻击含任／督，动作端点位于末三段；全仓跨武学完全同序列为0；本册内不同武学穴位集合重合≥80%的路线对为0；跨册≥80%重合按 `design/21` §4.3.4 第3条只报警告、人工复核 |
| WU-V23 | AR-18 阴阳性质 | 21 门内功均有 `inner.meridians`，声明 `nature` 与逐脉计票结果一致；路线剔除动作出口段后按体段逐穴计票，41 条绝招路线不得与所属武学性质冲突；冲脉、带脉暂按 AR-18a 不投票 |

### 17.2 金标准测试用例

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
| WU-T10 | 中武补栏 | 入场携带2内/2拳/2兵，并选择一条能合法取得所缺类别的笑傲本土路线 | 各核心类别均存在至少一个可达补位来源；不据此绕过门派互斥；轻功可本土重学，非核心不可从上界携带 |
| WU-T11 | 最高轻功边界 | 衡山云雾步10重，笑傲本土 | 有效品阶8、`Q_skill=QS(8)×(0.40+0.06×10)=104`；本组不存在9品以上原生轻功 |
| WU-T12 | 北南同音隔离 | 查询“衡山”与“恒山”身份 | 分别解析 `sect_hengshan_nan` / `sect_hengshan_bei`，存档与套装不串线 |
| WU-T13 | 五仙 / 五毒隔离 | 笑傲五仙与碧血五毒同名别称 | 分别解析 `sect_wuxian` / `sect_wudu`，不共享门派身份 |
| WU-T14 | 梅庄来源覆写 | 以梅庄铁板学习吸星，应用 `{sect:null}` 来源覆写 | 仅移除门派身份条件，仍保留日月心法6重前置与显式 `hard:[prereq]` |
| WU-T15 | 地阶比例 | 扫描12门地阶的 `vow/cost/requiredCombo/enemyOnly` | 代价/誓约0，必需合击0，敌用0；均满足上限 |
| WU-T16 | 路线覆盖 | 删除 `mv_dugu9_pojian` 的绑定、任一玄上绝招路线，或把 `mfr_dugu9_wuzhao` 的绝招镜像改假 | WU-V16 失败并定位缺项／真值漂移 |
| WU-T17 | 收招上界 | `recovery=1200` 的天阶绝招配 A10*，地阶绝招配 A8* | 分别为 `1200+800=2000`、`1200+640=1840`，均合法 |
| WU-T18 | 速度与调息 | 标准对标准运行衡山云雾步；紫霞神功 9 品满层调息 | 前者 `meridianSpeedBp=10000` 且 `Q_skill` 不变；后者基础 `2310/541/scope3` |
| WU-T19 | 外放形状与作者夹具 | 解析 §13.5 的 13 条 `projected`；分别以标准、高、顶尖档加载破气式与万蛊朝宗 | 所有条目通过 WU-V19；破气式为射程 1/3/5、线 n1/n2/n3，万蛊朝宗为射程 2/4/6、圆盘 r2/r3/r4 |
| WU-T20 | 外放反例与端点 | 扫描葵花飞针／万针、独孤其余近身式、周身寒潮、位移与护体；再逐条展开 13 条外放路线 | 前者均不因远程或招名误标；后者均为 attack 且至少命中一个合法端点，外放字段与审计结论一致 |
| WU-T21 | 音功 0→1 档切换 | 分别以 `projectionStep=0/1` 加载泛音、乱弦、七弦齐鸣、无形剑气、沧海和声、天地同声 | 0 档保持正文基础范围、额外耗内 0、普通 Z5M；1 档才取第二项 `projectionSpreadSteps`、额外耗内 2% MPREF 与外放 Z5M；全场招形状不变但威力分支切换 |
| WU-T22 | 末端回归 | 将任一持械绝招的腕部导引穴移出末三段，或从摧心掌·断脉删除劳宫 | WU-V22 失败并定位 `tail` 或 `missing`；不得靠改写招式类别规避 |
| WU-T23 | 阴阳性质回归 | 将葵花宝典 `nature` 改回 `yin`，或将百变千幻任一路体段替换为阳脉穴 | WU-V23 失败并分别定位 `INNER_NATURE` 或 `DELIVERY rule=nature-conflict`；动作出口段不参加路线性质投票 |

---

## 18. 待决事项 / 依赖

### 18.1 替下游给出的建议值

| # | 下游 | 建议值 / 处理 |
|---|---|---|
| WU-D01 | `design/07` | 采纳 §12 的 14 个新套装候选；先只定成员与主题，奖励数值按套装成员有效品阶另行标定 |
| WU-D02 | `design/12` / `design/16` | 已解决上游称谓：§0.4 采用 `design/17` 的 T01/T02/T03/T05B/T06 映射；下游只需按 `rank:1–5` 接入晋升条件、月钱与资源，不再另造职级名 |
| WU-D03 | `chapters/05` | 每派至少安排一个不与主线死锁的黄阶入口；梅庄铁板来源只豁免门派身份，不豁免日月心法前置 |
| WU-D04 | `design/15` | **已解决：**本文 10 个 `mer_*` 已在 `design/15` 正式登记；专精只提供开穴／周天快照，战斗收益仍由 `design/21` 的相对强度与路线结算 |
| WU-D05 | `design/07` | 葵花与辟邪属于同源核心：默认可分别参加不同套装，但同一套装内核心阈值只计一次，防止两本秘典双重抬档 |

### 18.2 本文依赖的上游事实

| 依赖 | 本文采用内容 |
|---|---|
| `00-canon` §3、§13、§20 | 笑傲中武、2/2/2 携带、装配栏、四门天阶与紫霞/寒冰锚点 |
| `design/03` §4.5 | `Q_skill` 与轻功门禁；笑傲最高原生轻功地中 |
| `design/05` §2、§4.2、§5.5、§9、§14.6 | schema、招式预算、内功 IP、独孤/吸星/葵花/辟邪专属规则、图鉴约束 |
| `design/06` 与 `rulings-v1` A5 | 正文引用的 41 个 Buff 与寒冰反制反应 |
| `design/09`、`design/10` | 曲谱合奏流程；绣花针、七弦琴装备联动 |
| `design/17` §1、§3、§6、§8–§9 | 九个 `sect_*`、笑傲时代 `O` 状态与 T01/T02/T03/T05B/T06 职级模板 |
| `rulings-v1` C14–C17、C22–C23、§3–§5 | 图鉴边界、门派 ID、结构化前置、双持字段边界、套装闭合与 Buff 名录 |
| `author-requirements` AR-01–03、AR-07–08、AR-14–AR-18 | 4/12/36/36、主修经脉阴阳、经脉引用、五级职级、门派总表、独立经脉乘区与逐单位实例，以及音功外放 0 档分支 |
| `design/21` §2.4、§3–§12、§16.2、§18.6 | 攻／防／速度路线、动作出口排除后的路线性质计票、护体内劲、调息、逐单位 `MeridianFlowModule` 的 schema 与算法依据；具体 `mfr_*`／`txp_*` 实例依 Canon V13-C01 归本文 |

### 18.3 对基准的修改提案

| 编号 | 位置 | 提案 | 理由 |
|---|---|---|---|
| WU-P01 | `design/05` §4.2 / §13.2 独孤九剑示例 | **已解决：**按 CN-05 / C3 将指定兵器／徒手类别匹配归罕见条件 +0.30；六式预算 1.147，保留 `power:1.10` | 配置差 −0.047，落入 ±0.05 容差（见本文 §2.2） |
| WU-P02 | `design/05` §14.1–§14.5 | 依据 AR-01 和十册新图鉴重算全局总量、品阶及笑傲首现 / 可习得池；旧 519 门、笑傲 44 门只能作为历史规划 | P33 已明确被 AR-01 覆盖；本文依硬要求扩为88门，继续沿用旧分母会产生伪冲突 |
| WU-P03 | `design/05` §2 / 技术 schema | 确认 `special.optionalCombo`、`special.equipSynergy`、`special.cost` 的承载方式；若不接受自由键，提供等价 `effects/conditions` 结构 | 本文需表达可选合奏、既有装备协同与吸星既有代价，但不应另造 Buff |
| WU-P04 | Canon §12、§18 | **已解决：**Canon v1.3 已接纳 `mfr_*`、`txp_*` 前缀；V13-C01 已明确具体武学实例归相应图鉴 | 本文的72条天地阶逐招路线、15条玄上绝招路线、12条轻功路线与21个调息档案均可作为正式实例 |

### 18.4 原著考据待办

| # | 书名与核对对象 |
|---|---|
| WU-K01 | 《笑傲江湖》华山：太岳三青峰、养吾剑、希夷剑、玉女剑十九式、狂风快剑的正式名称、使用者、分式与思过崖壁刻内容 |
| WU-K02 | 《笑傲江湖》嵩山 / 泰山：大阴阳手是否正式武学名；寒冰真气反制吸星的交手细节；岱宗如何口诀、运指推算与传承状态 |
| WU-K03 | 《笑傲江湖》南衡山：回风落雁剑、衡山五神剑、百变千幻衡山云雾十三式的逐字名称与使用情节；刘正风、曲洋琴箫曲谱的形成与流传 |
| WU-K04 | 《笑傲江湖》北恒山：万花剑法、天长掌法是否为修订版正式名；恒山剑阵、救护与“不伤人”表现的原文边界 |
| WU-K05 | 《笑傲江湖》日月 / 梅庄：吸星来历与反噬、葵花传承关系、七弦无形剑、玄天指、石鼓打穴笔法、泼墨披麻剑法的正式名及四友对应关系 |
| WU-K06 | 《笑傲江湖》林家 / 青城：辟邪七十二路的具体招名、林家是否确有翻天掌、青城摧心掌名称与受害情节；不得与九阴摧心掌混同 |
| WU-K07 | 《笑傲江湖》五仙 / 异人：五仙 / 五毒称谓、蓝凤凰用毒方式；桃谷六仙擒拿、田伯光身法、不戒和尚武功描写，确认哪些只有人物表现而无武学名 |

### 18.5 开放问题（附默认值）

| # | 问题 | 本文默认值 | 影响 |
|---|---|---|---|
| WU-O01 | 已解决：九个组织如何对齐时代开放与职级称谓？ | 已按 `design/17` §1、§3、§6、§8–§9 对齐：九派 XA 均为 `O`，采用 T01/T02/T03/T05B/T06；§0.4 保留武学目录切片 | 后续只需让 12/16 消费 `rank:1–5`，不改武学 ID |
| WU-O02 | 梅庄四友是否应有黑白子的棋诀、丹青生之外的画诀作为独立杂学？ | 不扩容；以玄天指、笔法、剑法、七弦无形剑四门对应四艺 | 避免突破精确 88 门与重复技能 |
| WU-O03 | 福威翻天掌若修订版无明确名目如何处理？ | 保留 `sk_fantianzhang` 与玩法，改为**（原创扩展命名）** | 不改数量、品阶与前置链 |
| WU-O04 | `sk_xiaoaojianghuqu` 由谁定义、是否算衡山条目？ | 本文唯一完整定义并计入南衡山 / 琴箫分组；`design/09` 只引用合奏流程 | 防止重复定义和跨文件重复计数 |
| WU-O05 | 套装是否纳入绣花针、七弦琴等装备？ | 当前不纳入；待 07 能与 10 双向同步后再加 | 保持 C22 当前闭合 |
| WU-O06 | 五仙是否补独立兵器路线？ | 不补；以拳、毒、内功为门派特色，兵器栏从其他笑傲本土组织补齐 | 保持原著辨识度与 1:3:9:9 数量 |
| WU-O07 | 已解决：`mfr_*`／`txp_*` 何时可进入生产数据？ | Canon v1.3 已接纳 M2-P01，V13-C01 已明确图鉴实例归属；按本文稳定 ID 装载，不按显示名临时生成 | 与地图 `route_*`、Buff `bf_*` 保持隔离 |
| WU-O08 | 绝招数量调整是否新增招名？ | **已解决：**只升格既有招式；统一裁定后天9、地17、玄上15，新招式0，玄中以下不设绝招 | 见 `decisions/ultimate-counts-tianzhong-dizhong.md` §3；保持原著边界与既有目录稳定 |
| WU-O09 | 无形剑气原卡“不穿墙”与 `tags:[sonic]` 的视线规则冲突，是否保留例外？ | 默认按 `design/05` §4.4／`design/09` §5.5 执行：`sonic` 无视遮挡，正文不再保留“不穿墙” | 若作者要保留“不穿墙”，须由 05／09 增设 `sonic` 视线例外字段；本文不自造字段 |
| WU-O10 | AR-18a：冲脉、带脉是否参与内功与路线性质投票？ | 默认不投票；只修冲／带或无有效票时取 `harmony` | 作者若改为投票，吸星、日月心法、黑木吐纳等性质及其调息／路线门槛须重算 |
| WU-O11 | AR-18b：后溪是否加入外放 13 端点白名单？ | 默认不加入；本册外放路线继续命中既有白名单端点 | 作者若加入，仅放宽出口合法性，不自动改写现有路线 |

### 18.6 需下游同步

| 文档 | 位置 | 需同步内容 |
|---|---|---|
| `design/05` | §13.2、§14.1–§14.5 | **已解决：**独孤六式已按 CN-05 收敛；全局与笑傲池由 F2c 按 AR-01 重算 |
| `design/07` | 套装目录 | 评审 §12 的14个新候选，并与武学 / 装备 `setTags` 双向生成校验 |
| `design/09` | 曲谱合奏 | 继续只引用 `sk_xiaoaojianghuqu`；确认 optional combo 不被实现成必需多人合击 |
| `design/10` | 绣花针、七弦琴 | 保留 `eq_xiuhuazhen` / `eq_qixianqin` 联动；若进套装再补装备侧标签 |
| `design/15` | 经脉 ID 表 | **已解决：**§16.2 的 10 个 `mer_*` 已正式存在；本文只引用开穴／周天快照，不再要求新增经脉 ID |
| Canon §12 / `design/21` 内容库 | ID 前缀与内容装载 | **已解决：**Canon v1.3／V13-C01 已登记前缀并明确实例归属；§15 的99个 `mfr_*`（含15个玄上绝招路线）与21个 `txp_*` 由本文提供 |
| `design/17` | §6.1、§6.5–§6.6、§6.8、§9.6–§9.7、§14.3 | 其武学索引仍是先行候选，需以本图鉴正式定义回写 ID / 品阶 / 类别：至少 `sk_zixia→sk_zixiashengong`、`sk_daiyiruhe→sk_daizongruhe`、`sk_songshanjian→sk_songshanjianfa`、`sk_baibianqianhuanyunwushijian→sk_baibianqianhuan`、`sk_wanwushengmie→sk_wanhuajianfa`、`sk_cuixinzhang_qingcheng→sk_qingchengcuixinzhang`、`sk_songfengjian→sk_songfengjianfa`；门派 ID、XA 状态与职级模板已对齐 |
| `chapters/05` | 门派、梅庄、黑木崖、林家与五仙节点 | 为所有 `learnSources` 落实际任务 / NPC / 秘籍 ID；保证九条入门链可达 |
| `chapters/07` | 华山残承 | 紫霞神功只引用同一 `sk_zixiashengong`，来源品阶8，不另建武学 |



